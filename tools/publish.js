#!/usr/bin/env node
/* Kriterion — den Veroeffentlichungszweig herstellen.
 *
 * Dieses Werkzeug bleibt im Entwicklungsrepository und schliesst sich selbst
 * aus: es nennt den Aufbau dieses Repositories und hat im oeffentlichen
 * nichts zu suchen. Wie es benutzt wird, steht in Doku/Veroeffentlichen.md.
 *
 *   node tools/publish.js            herstellen und melden
 *   node tools/publish.js --trocken  nur melden, nichts schreiben
 *
 * Es pusht nicht. Es stellt den Zweig her, rechnet nach und haelt an; der
 * letzte Griff gehoert dem Betreiber.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const WURZEL = path.join(__dirname, '..');
const ZWEIG = 'publish';

/* WAS NICHT HINAUSGEHT. Die Liste ist der ganze Unterschied zwischen den
   beiden Repositories und steht deshalb hier, nicht verteilt. */
const DRAUSSEN = [
  'Doku',                     // der ganze Ordner
  'CLAUDE.md',                // die Hausordnung dieses Repositories
  'tools/dictionary-doc.js',  // schreibt nach Doku/
  'tools/publish.js'          // dieses Werkzeug
];

/* Die neunzehn Dateien des Fingerprints -- dieselbe Liste wie in der README.
   `public/` wird dabei ausgelesen, nicht aufgezaehlt. */
const FINGERPRINT_MODULE = ['attachments.js', 'auth.js', 'batchrun.js', 'images.js',
  'db.js', 'keys.js', 'log.js', 'mail.js', 'package.json', 'server.js', 'twofactor.js'];

const git = (...args) =>
  execFileSync('git', args, { cwd: WURZEL, encoding: 'utf8' }).trim();

const gitMitIndex = (index, ...args) =>
  execFileSync('git', args, { cwd: WURZEL, encoding: 'utf8',
    env: { ...process.env, GIT_INDEX_FILE: index } }).trim();

function abbruch(satz) {
  console.error('\n  ABGEBROCHEN: ' + satz + '\n');
  process.exit(1);
}

/* ---- 1. Nachsehen, bevor etwas geschieht ---------------------------------
   Ein unsauberer Arbeitsbaum heisst: es wuerde ein Stand hinausgehen, den
   der Pruefstand nie gesehen hat. */
function nachsehen() {
  let stand;
  try { stand = git('status', '--porcelain'); }
  catch { abbruch('kein Git-Repository.'); }
  if (stand) abbruch('der Arbeitsbaum ist nicht sauber:\n' +
    stand.split('\n').slice(0, 10).map(z => '    ' + z).join('\n'));
  for (const f of DRAUSSEN)
    if (!fs.existsSync(path.join(WURZEL, f)))
      abbruch(`"${f}" steht in der Ausschlussliste, aber nicht im Repository.`);
}

/* ---- 2. Der Fingerprint --------------------------------------------------
   Dieselbe Bildungsvorschrift wie buildFingerprint() in server.js: SHA-256
   ueber Name und Bytes jeder Datei, alphabetisch. */
function fingerprint() {
  const unter = (d) => fs.readdirSync(d, { withFileTypes: true })
    .flatMap(e => e.isDirectory() ? unter(path.join(d, e.name)) : [path.join(d, e.name)]);
  const liste = [...FINGERPRINT_MODULE,
    ...unter(path.join(WURZEL, 'public')).map(f => path.relative(WURZEL, f))]
    .map(f => f.split(path.sep).join('/')).sort();
  const h = crypto.createHash('sha256');
  for (const rel of liste) {
    h.update(rel); h.update('\0');
    h.update(fs.readFileSync(path.join(WURZEL, rel))); h.update('\0');
  }
  return { wert: h.digest('hex').slice(0, 8), dateien: liste.length };
}

/* ---- 3. Der Zeiger-ins-Leere-Test ----------------------------------------
   Jede Datei, die hinausgeht und `Doku/` nennt, zeigt drueben auf nichts.
   AUSGENOMMEN IST DER PRUEFSTAND: er behandelt das Fehlen des Ordners und
   muss ihn dafuer nennen -- test/roundtrip.js legt Doku/Neu.md sogar an, um
   zu belegen, dass es den Fingerprint nicht beruehrt. Ein Treffer dort waere
   jedes Mal richtig und wuerde den Blick auf die echten verstellen. */
const OHNE_ZEIGERTEST = /^(test\/|testbench\.js$|counterproof\.js$)/;
function toteVerweise(dateien) {
  const treffer = [];
  for (const rel of dateien) {
    if (OHNE_ZEIGERTEST.test(rel)) continue;
    const voll = path.join(WURZEL, rel);
    let text;
    try { text = fs.readFileSync(voll, 'utf8'); } catch { continue; }
    if (text.includes('\0')) continue;
    text.split('\n').forEach((zeile, i) => {
      if (zeile.includes('Doku/')) treffer.push(`${rel}:${i + 1}  ${zeile.trim().slice(0, 70)}`);
    });
  }
  return treffer;
}

/* ---- 4. Den Zweig herstellen ---------------------------------------------
   UEBER EINEN EIGENEN INDEX UND NICHT UEBER checkout: der Arbeitsbaum wird
   nicht angefasst, und der Zweig, auf dem gearbeitet wird, bleibt stehen.
   Ob der Commit einen Elternteil bekommt, entscheidet allein, ob es den
   Zweig schon gibt -- der erste hat keinen und traegt damit keine
   Historie. */
function herstellen(version, trocken) {
  const index = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-publish-')), 'index');
  gitMitIndex(index, 'read-tree', 'HEAD');
  gitMitIndex(index, 'rm', '--cached', '-r', '--quiet', '--ignore-unmatch', ...DRAUSSEN);
  const baum = gitMitIndex(index, 'write-tree');
  const dateien = gitMitIndex(index, 'ls-tree', '-r', '--name-only', baum).split('\n').filter(Boolean);

  let vorher = null;
  try { vorher = git('rev-parse', '--verify', '--quiet', 'refs/heads/' + ZWEIG) || null; } catch { }

  if (trocken) return { dateien, vorher, commit: null };

  const args = ['commit-tree', baum, '-m', version];
  if (vorher) args.push('-p', vorher);
  const commit = git(...args);
  git('update-ref', 'refs/heads/' + ZWEIG, commit);
  return { dateien, vorher, commit };
}

/* ---- Der Ablauf ---------------------------------------------------------- */
const trocken = process.argv.includes('--trocken');
nachsehen();

const version = JSON.parse(fs.readFileSync(path.join(WURZEL, 'package.json'), 'utf8')).version;
const zweigVorher = (() => {
  try { return git('rev-parse', '--abbrev-ref', 'HEAD'); } catch { return '?'; }
})();

const { dateien, vorher, commit } = herstellen(version, trocken);
const fp = fingerprint();
const bytes = dateien.reduce((n, rel) => {
  try { return n + fs.statSync(path.join(WURZEL, rel)).size; } catch { return n; }
}, 0);
const tot = toteVerweise(dateien);

console.log(`
  Version        ${version}
  Ausgangszweig  ${zweigVorher}
  Fingerprint    ${fp.wert}   (ueber ${fp.dateien} Dateien)
  Hinaus gehen   ${dateien.length} Dateien, ${bytes.toLocaleString('de-DE')} Bytes
  Weggelassen    ${DRAUSSEN.join(', ')}
  Zweig ${ZWEIG}  ${vorher ? 'vorhanden — der Commit bekommt einen Elternteil'
                            : 'neu — der erste Commit hat KEINEN Elternteil'}`);

if (tot.length) {
  console.log(`\n  ${tot.length} VERWEISE AUF Doku/ GEHEN MIT HINAUS und zeigen dort auf nichts:`);
  for (const z of tot.slice(0, 20)) console.log('    ' + z);
  if (tot.length > 20) console.log(`    … und ${tot.length - 20} weitere`);
} else {
  console.log('\n  Kein Verweis auf Doku/ geht mit hinaus.');
}

if (trocken) {
  console.log('\n  TROCKENLAUF — es ist nichts geschrieben worden.\n');
  process.exit(0);
}

console.log(`
  Der Zweig "${ZWEIG}" steht auf ${commit.slice(0, 8)}.
  Der Arbeitsbaum ist nicht angefasst worden; du stehst weiter auf ${zweigVorher}.

  NACHSEHEN, DANN PUSHEN:

    git log --format=%P -1 ${ZWEIG}        ${vorher ? '' : '# muss LEER sein — kein Elternteil'}
    git ls-tree -r --name-only ${ZWEIG}    # Datei fuer Datei, was hinausgeht
    git push <gegenstelle> ${ZWEIG}:main

  Die Gegenstelle ist ein EIGENES, leeres Repository — niemals ein Fork
  dieses Repositories.
`);
