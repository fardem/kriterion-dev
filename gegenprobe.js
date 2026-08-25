#!/usr/bin/env node
/* Der Gegenprobentreiber.
 *
 *   node gegenprobe.js            alle Rueckbauten, zwei Nebenspuren
 *   node gegenprobe.js 4          alle Rueckbauten, vier Nebenspuren
 *   node gegenprobe.js 2 W2 W3    nur die Rueckbauten, deren Nummer oder Name
 *                                 auf eines der Woerter passt
 *
 * WOZU. Eine Pruefung, die gruen ist, belegt nichts, solange niemand gezeigt
 * hat, dass sie auch rot werden kann. Die Gegenprobe baut die gepruefte Sache
 * probeweise zurueck und haelt fest, WELCHE Pruefungen daraufhin namentlich rot
 * werden. EIN RUECKBAU, DER KEINE EINZIGE PRUEFUNG ROT MACHT, IST EIN FUND --
 * nicht ein Erfolg. In 0.8.90 waren zwei davon dabei, und beide haben eine
 * Luecke im Pruefstand aufgedeckt.
 *
 * WARUM ER NICHT IN npm test STEHT. Er faehrt den vollen Prueflauf je Rueckbau
 * und dauert damit ein Vielfaches davon. Er gehoert an das Ende einer Runde und
 * nicht an jeden Lauf; der Pruefstand kennt ihn deshalb nicht.
 *
 * DIE KOPIE ENTSTEHT UEBER git archive HEAD UND NICHT UEBER cp. Sie ist damit
 * atomar gegen den Arbeitsbaum: wer waehrend eines Laufs weiterarbeitet, bekommt
 * trotzdem den Stand, der im Kopf des Zweiges steht (Stolperstein 100). Der
 * Arbeitsbaum selbst wird NIE angefasst.
 *
 * AUFGERAEUMT WIRD UEBER /proc/<pid>/cwd UND NICHT UEBER DIE BEFEHLSZEILE. Ein
 * mit cwd gestarteter Kindprozess traegt den Pfad dort gar nicht -- in der
 * Befehlszeile steht nur "node server.js". pkill -f <Kopierpfad> trifft deshalb
 * nie, und kill -- -$! trifft auch daneben, weil setsid eine neue
 * Prozessgruppe anlegt. In 0.8.90 haben sich so 48 verwaiste Server
 * angesammelt und acht Gegenproben abreissen lassen (Stolperstein 133).
 * Nach dem Aufraeumen wird NACHGESEHEN, ob wirklich keiner ueberlebt hat.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

/* ================= Die Rueckbauten =================
   DIE LISTE IST DIE ENTSCHEIDUNG, und sie steht deshalb hier oben und nicht in
   einer Datei daneben -- dieselbe Bauform wie F_ROUTEN im Pruefstand: man sucht
   sie dort, wo sie steht.

   Ein Eintrag traegt fuenf Angaben:
     nr      die Nummer in der Tabelle
     name    was zurueckgebaut wird, in einem Satz
     datei   welche Datei angefasst wird
     suche   der Text, der ersetzt wird. Er muss GENAU EINMAL vorkommen --
             kommt er keinmal oder mehrfach vor, bricht der Rueckbau ab und
             wird als solcher gemeldet. Ein Rueckbau, der ins Leere greift,
             saehe sonst aus wie einer, der nichts bewirkt.
     ersatz  wodurch er ersetzt wird
     erwartet  die Prueffgruppe, in der die roten Punkte erwartet werden. Sie
             ist eine NOTIZ und keine Bedingung: gemeldet wird, was wirklich
             rot wurde, und wenn das eine andere Gruppe ist, steht das da. */
const RUECKBAUTEN = [
  {
    nr: '01', name: 'Die Umschaltung auf DELETE faellt weg',
    datei: 'db.js',
    suche: "  db.pragma('journal_mode = DELETE');",
    ersatz: "  // db.pragma('journal_mode = DELETE');",
    erwartet: 'Der Schluesselwechsel: der Rundlauf'
  },
  {
    nr: '02', name: 'Die Rueckschaltung auf WAL faellt weg',
    datei: 'db.js',
    suche: "    db.pragma('journal_mode = WAL');",
    ersatz: "    // db.pragma('journal_mode = WAL');",
    erwartet: 'Der Schluesselwechsel: die Umschaltung des Journals'
  },
  {
    nr: '03', name: 'Der .env-Fall wird nicht mehr abgewiesen',
    datei: 'schluessel.js',
    suche: '  if (keyFromEnv && !optionen.env) {',
    ersatz: '  if (false) {',
    erwartet: 'Der Schluesselwechsel: der Dateifall und der env-Fall'
  },
  {
    nr: '04', name: 'Die .env wird nicht mehr gegen den laufenden Wert gehalten',
    datei: 'schluessel.js',
    suche: '    if (treffer[0].wert.trim().toLowerCase() !== keyHex.toLowerCase()) {',
    ersatz: '    if (false) {',
    erwartet: 'Der Schluesselwechsel: der Dateifall und der env-Fall'
  },
  {
    nr: '05', name: 'Die Platzpruefung faellt weg',
    datei: 'schluessel.js',
    suche: '  if (l.reicht === false) {',
    ersatz: '  if (false) {',
    erwartet: 'Der Schluesselwechsel: zu wenig Platz'
  },
  {
    nr: '06', name: 'Die Protokollzeile wird nicht geschrieben',
    datei: 'schluessel.js',
    suche: "  auth.protokolliere('schluessel', { wer: auth.VOM_WIRT });",
    ersatz: "  // auth.protokolliere('schluessel', { wer: auth.VOM_WIRT });",
    erwartet: 'Der Schluesselwechsel: kein Schluessel, wo keiner hingehoert'
  },
  {
    nr: '07', name: 'Die Marke schluesselGewechseltAm wird nicht gesetzt',
    datei: 'schluessel.js',
    suche: '  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (\'schluesselGewechseltAm\', ?)")',
    ersatz: '  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (\'egalWasAnderes\', ?)")',
    erwartet: 'Der Schluesselwechsel: kein Schluessel, wo keiner hingehoert'
  },
  {
    nr: '08', name: 'Der alte Wert wird in der .env nicht auskommentiert',
    datei: 'keys.js',
    suche: '    `#ENCRYPTION_KEY=${alt}`,',
    ersatz: '    `# (der alte Wert ist weg)`,',
    erwartet: 'Der Schluesselwechsel: der Dateifall und der env-Fall'
  },
  {
    nr: '09', name: 'Die alten Sicherungen werden nicht mehr gezaehlt',
    datei: 'server.js',
    suche: '  const veraltet = marke ? dateien.filter(d => d.zeit < marke.ms).length : 0;',
    ersatz: '  const veraltet = 0;',
    erwartet: 'Die Sicherung: zwei Schluessel im Umlauf'
  },
  {
    nr: 'W2', name: 'Eine Portbasis liegt wieder auf der gesperrten 4045',
    datei: 'pruefung.js',
    suche: '  const B = starteWeiterenServer(frischDir, {}, 5130);',
    ersatz: '  const B = starteWeiterenServer(frischDir, {}, 4000);',
    erwartet: 'Die Portbasen und der Versatz'
  },
  {
    nr: 'W3', name: 'Eine Prueflage beendet ihren Server nicht',
    datei: 'pruefung.js',
    suche: '  await ZJ.stopp();',
    ersatz: '  // await ZJ.stopp();',
    erwartet: 'Keine Prueflage laesst ihren Server zurueck'
  }
];

/* ================= Spuren und Versatz =================
   Der Versatz je Nebenspur steht im PRUEFSTAND (VERSATZ_STUFE) und wird von
   dort gelesen -- der Waechter, der ihn nachrechnet, liegt dort, und zwei
   Zahlen an zwei Orten laufen auseinander. Faellt die Zeile weg, bricht der
   Treiber ab, statt still auf einen Vorgabewert zu fallen. */
function versatzStufe() {
  const t = fs.readFileSync(path.join(__dirname, 'pruefung.js'), 'utf8');
  const m = t.match(/^const VERSATZ_STUFE = (\d+);$/m);
  if (!m) {
    console.error('In pruefung.js steht keine Zeile "const VERSATZ_STUFE = <Zahl>;".');
    console.error('Ohne sie faehrt der Treiber keine Nebenspuren.');
    process.exit(1);
  }
  return Number(m[1]);
}

const HOECHSTE_SPUR = 4;

/* ================= Kopie und Aufraeumen ================= */

function legeKopieAn(ziel) {
  fs.mkdirSync(ziel, { recursive: true });
  // git archive schreibt einen tar-Strom; entpackt wird er unmittelbar. Damit
  // liegt nie eine Zwischendatei herum, und der Stand ist der von HEAD.
  const tar = spawnSync('sh', ['-c',
    `git -C ${JSON.stringify(__dirname)} archive HEAD | tar -x -C ${JSON.stringify(ziel)}`],
    { encoding: 'utf8' });
  if (tar.status !== 0)
    throw new Error(`git archive gescheitert: ${(tar.stderr || '').trim()}`);
  /* node_modules wird VERKNUEPFT statt kopiert: es traegt uebersetzte native
     Anteile, waere je Kopie ein paar hundert Megabyte, und kein Rueckbau fasst
     es an. Eine Verknuepfung genuegt -- require loest sie auf. */
  fs.symlinkSync(path.join(__dirname, 'node_modules'), path.join(ziel, 'node_modules'), 'dir');
}

/* Wer laeuft noch unter diesem Pfad? Erkannt am Arbeitsverzeichnis und nicht an
   der Befehlszeile (Stolperstein 133). Liefert die Nummern der Prozesse. */
function prozesseUnter(pfad) {
  const raus = [];
  let eintraege;
  try { eintraege = fs.readdirSync('/proc'); } catch { return raus; }
  for (const e of eintraege) {
    if (!/^\d+$/.test(e)) continue;
    let cwd;
    try { cwd = fs.readlinkSync(`/proc/${e}/cwd`); } catch { continue; }
    if (cwd === pfad || cwd.startsWith(pfad + path.sep)) raus.push(Number(e));
  }
  return raus;
}

/* Raeumt auf UND SIEHT NACH. Ein Aufraeumen, das nie greift, sieht aus wie
   eines, das greift -- wer eines baut, sieht hinterher nach, ob wirklich
   keiner ueberlebt hat. Liefert die Zahl der Prozesse, die es NICHT
   ueberlebt haben, und wirft, wenn einer stehenbleibt. */
function raeumeAuf(pfad) {
  const erste = prozesseUnter(pfad);
  for (const pid of erste) { try { process.kill(pid, 'SIGKILL'); } catch {} }
  // Ein SIGKILL wirkt nicht in derselben Zeile: dem Kern bleibt ein Augenblick.
  // Gewartet wird SYNCHRON -- die Nachschau gehoert vor das Loeschen, und ein
  // await mitten im Aufraeumen liesse die anderen Spuren dazwischenfunken.
  const warte = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  const bis = Date.now() + 5000;
  let uebrig = prozesseUnter(pfad);
  while (uebrig.length && Date.now() < bis) { warte(100); uebrig = prozesseUnter(pfad); }
  fs.rmSync(pfad, { recursive: true, force: true });
  return { geraeumt: erste.length, uebrig: uebrig.length };
}

/* ================= Den Rueckbau anbringen ================= */

function baueZurueck(kopie, r) {
  const datei = path.join(kopie, r.datei);
  if (!fs.existsSync(datei)) throw new Error(`${r.datei} gibt es in der Kopie nicht.`);
  const text = fs.readFileSync(datei, 'utf8');
  const teile = text.split(r.suche);
  /* GENAU EINMAL. Keinmal heisst: der gesuchte Text steht so nicht mehr da --
     der Rueckbau griffe ins Leere und der Lauf bliebe gruen, ohne dass etwas
     zurueckgebaut worden waere. Mehrfach heisst: es ist nicht entschieden,
     welche Stelle gemeint ist. Beides bricht ab und wird gemeldet. */
  if (teile.length !== 2)
    throw new Error(`Der gesuchte Text steht ${teile.length - 1}-mal in ${r.datei}, erwartet ist genau einmal.`);
  fs.writeFileSync(datei, teile.join(r.ersatz));
}

/* ================= Den Prueflauf lesen =================
   Der Pruefstand schreibt Gruppen als "── <Name> ───" und Pruefungen als
   "  ✓ <Name>" bzw. "  ✗ <Name>". Gelesen wird genau das -- und die Schlusszeile
   daneben, denn ein Lauf, der ABREISST, sieht in den roten Punkten allein
   genauso aus wie einer, der sauber durchlaeuft und nichts findet. */
function leseLauf(ausgabe) {
  const rot = [];
  let gruppe = '(vor der ersten Gruppe)';
  for (const zeile of ausgabe.split('\n')) {
    // ─* und nicht ─+: eine Ueberschrift, die die Zeile fuellt, traegt gar
    // keinen Strich mehr. Der Pruefstand setzt seit dieser Runde mindestens
    // zwei -- der Leser hier gibt sich trotzdem mit keinem zufrieden, denn er
    // liest auch aeltere Ausgaben.
    const g = zeile.match(/^── (.+?) ─*\s*$/);
    if (g) { gruppe = g[1]; continue; }
    const p = zeile.match(/^ {2}✗ (.+)$/);
    if (p) rot.push({ gruppe, name: p[1] });
  }
  const schluss = ausgabe.match(/^\s+(\d+) von (\d+) Pruefungen bestanden/m);
  const abriss = ausgabe.match(/^Prueflauf abgebrochen: (.+)$/m);
  return {
    rot,
    durchgelaufen: Boolean(schluss),
    bestanden: schluss ? Number(schluss[1]) : null,
    gesamt: schluss ? Number(schluss[2]) : null,
    abriss: abriss ? abriss[1] : null
  };
}

/* ================= Eine Gegenprobe ================= */

function fahre(r, spur, stufe) {
  return new Promise((fertig) => {
    const kopie = fs.mkdtempSync(path.join(os.tmpdir(), `kriterion-gegenprobe-${r.nr}-`));
    const beginn = Date.now();
    const ende = (ergebnis) => {
      let aufraeumen = { geraeumt: 0, uebrig: 0 };
      try { aufraeumen = raeumeAuf(kopie); } catch (e) { ergebnis.raeumFehler = e.message; }
      fertig({ ...r, spur, sekunden: Math.round((Date.now() - beginn) / 1000),
               ...aufraeumen, ...ergebnis });
    };
    try {
      legeKopieAn(kopie);
      baueZurueck(kopie, r);
    } catch (e) { return ende({ fehler: e.message }); }
    const kind = spawn(process.execPath, ['pruefung.js'], {
      cwd: kopie,
      env: { ...process.env, PORT_VERSATZ: String(spur * stufe) }
    });
    let ausgabe = '';
    kind.stdout.on('data', d => { ausgabe += d; });
    kind.stderr.on('data', d => { ausgabe += d; });
    kind.on('exit', (code) => ende({ code, ...leseLauf(ausgabe) }));
  });
}

/* ================= Die Spuren ================= */

async function fahreAlle(liste, spuren, stufe) {
  const ergebnisse = new Array(liste.length);
  let naechster = 0;
  const spur = async (nr) => {
    for (;;) {
      const i = naechster++;
      if (i >= liste.length) return;
      const r = liste[i];
      console.log(`  [Spur ${nr}] ${r.nr} — ${r.name}`);
      ergebnisse[i] = await fahre(r, nr, stufe);
      const e = ergebnisse[i];
      const wort = e.fehler ? 'FEHLER' : (e.rot.length ? `${e.rot.length} rot` : 'STUMM');
      console.log(`  [Spur ${nr}] ${r.nr} fertig nach ${e.sekunden}s — ${wort}`);
    }
  };
  // Spur 0 gibt es auch: sie faehrt ohne Versatz, wie ein gewoehnlicher Lauf.
  await Promise.all(Array.from({ length: spuren }, (_, k) => spur(k)));
  return ergebnisse;
}

/* ================= Die Tabelle =================
   EINE Tabelle, und zwar in der Form, in der sie im Aenderungsprotokoll steht.
   Was sie NICHT tut: einen stummen Rueckbau als Erfolg zeigen. Er bekommt sein
   eigenes Wort und darunter seinen eigenen Absatz. */
function schreibeTabelle(ergebnisse) {
  console.log('\n| # | Rückbau | Namentlich rot |');
  console.log('|---|---|---|');
  for (const e of ergebnisse) {
    let rechts;
    if (e.fehler) rechts = `**RÜCKBAU GESCHEITERT** — ${e.fehler}`;
    else if (!e.durchgelaufen)
      rechts = `**LAUF ABGERISSEN** — ${e.abriss || `Code ${e.code}`}` +
               (e.rot.length ? ` (davor ${e.rot.length} rot)` : '');
    else if (!e.rot.length) rechts = '**STUMM — das ist ein FUND**';
    else if (e.rot.length <= 3)
      rechts = e.rot.map(p => `„${p.name}"`).join(', ');
    else {
      const gruppen = [...new Set(e.rot.map(p => p.gruppe))];
      rechts = `${e.rot.length} Prüfungen, darunter „${e.rot[0].name}"` +
               (gruppen.length === 1 ? ` (Gruppe „${gruppen[0]}")`
                                     : ` (${gruppen.length} Gruppen)`);
    }
    console.log(`| ${e.nr} | ${e.name} | ${rechts} |`);
  }

  console.log('\n### Im Einzelnen\n');
  for (const e of ergebnisse) {
    console.log(`**${e.nr} — ${e.name}** (${e.datei}, Spur ${e.spur}, ${e.sekunden}s)`);
    if (e.fehler) { console.log(`  RÜCKBAU GESCHEITERT: ${e.fehler}\n`); continue; }
    if (!e.durchgelaufen)
      console.log(`  LAUF ABGERISSEN: ${e.abriss || `Rückgabewert ${e.code}`}`);
    else
      console.log(`  ${e.bestanden} von ${e.gesamt} bestanden, erwartet in „${e.erwartet}"`);
    if (!e.rot.length && e.durchgelaufen)
      console.log('  STUMM — kein einziger roter Punkt. Das ist ein FUND und gehört untersucht.');
    let letzte = null;
    for (const p of e.rot) {
      if (p.gruppe !== letzte) { console.log(`  ── ${p.gruppe}`); letzte = p.gruppe; }
      console.log(`     ✗ ${p.name}`);
    }
    if (e.uebrig) console.log(`  ACHTUNG: ${e.uebrig} Prozess(e) haben das Aufräumen überlebt.`);
    if (e.raeumFehler) console.log(`  ACHTUNG: Aufräumen gescheitert — ${e.raeumFehler}`);
    console.log('');
  }

  const stumm = ergebnisse.filter(e => e.durchgelaufen && !e.rot.length);
  const kaputt = ergebnisse.filter(e => e.fehler || !e.durchgelaufen);
  const leichen = ergebnisse.filter(e => e.uebrig || e.raeumFehler);
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  ${ergebnisse.length} Gegenproben gefahren.`);
  console.log(`  ${stumm.length} STUMM${stumm.length ? ': ' + stumm.map(e => e.nr).join(', ') : ''}` +
              (stumm.length ? '  — jede davon ist ein Fund.' : ''));
  if (kaputt.length)
    console.log(`  ${kaputt.length} nicht auswertbar: ${kaputt.map(e => e.nr).join(', ')}`);
  if (leichen.length)
    console.log(`  ${leichen.length} mit übriggebliebenen Prozessen: ${leichen.map(e => e.nr).join(', ')}`);
  console.log('══════════════════════════════════════════════════════════════\n');
  return (stumm.length || kaputt.length || leichen.length) ? 1 : 0;
}

/* ================= Bedienung ================= */

(async function haupt() {
  const argumente = process.argv.slice(2);
  let spuren = 2;
  if (argumente.length && /^\d+$/.test(argumente[0])) spuren = Number(argumente.shift());
  if (spuren < 1 || spuren > HOECHSTE_SPUR) {
    console.error(`Zwischen 1 und ${HOECHSTE_SPUR} Nebenspuren. Mehr Spuren heissen mehr ` +
                  `gleichzeitige Server, und der Rechner hat nicht beliebig viele Kerne.`);
    process.exit(1);
  }
  const liste = argumente.length
    ? RUECKBAUTEN.filter(r => argumente.some(a =>
        r.nr.toLowerCase() === a.toLowerCase() ||
        r.name.toLowerCase().includes(a.toLowerCase())))
    : RUECKBAUTEN;
  /* Ein Filter, auf den KEIN Rueckbau passt, ist ein Fehler und kein leerer
     Lauf -- sonst meldete ein Tippfehler wortlos Erfolg. Dieselbe Regel wie
     beim Gruppenfilter des Pruefstands. */
  if (!liste.length) {
    console.error(`Kein Rueckbau passt auf ${argumente.join(', ')}.`);
    console.error('Vorhanden: ' + RUECKBAUTEN.map(r => r.nr).join(', '));
    process.exit(1);
  }
  const stufe = versatzStufe();
  console.log(`\nGegenproben: ${liste.length} Rückbauten, ${spuren} Nebenspur(en), ` +
              `Versatz ${stufe} je Spur.`);
  console.log('Jede läuft in einer eigenen Kopie aus `git archive HEAD`; ' +
              'der Arbeitsbaum wird nicht angefasst.\n');
  const ergebnisse = await fahreAlle(liste, spuren, stufe);
  process.exit(schreibeTabelle(ergebnisse));
})().catch(e => {
  console.error('\nGegenproben abgebrochen:', e.message);
  process.exit(1);
});
