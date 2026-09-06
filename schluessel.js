#!/usr/bin/env node
/* Der Schluesselwechsel -- auf dem Wirt, bei ANGEHALTENER Instanz.
 *
 *   node schluessel.js zeigen
 *   node schluessel.js wechseln [--env <pfad>] [--wer <text>] [--ja]
 *
 * ES IST DER EINZIGE VORGANG IM GANZEN PROJEKT, DER BEI FALSCHER HANDHABUNG
 * ALLES VERLIERT. Deshalb steht er hier und nicht als Knopf in der Oberflaeche:
 *   * Auf dem Wirt liegt die .env. Kommt der Schluessel von dort, kann NUR hier
 *     der Wechsel zu Ende gefuehrt werden -- die Instanz im Container sieht die
 *     Datei nicht einmal (.dockerignore).
 *   * Die Instanz STEHT dabei. Ein laufender Server haelt die Datei im WAL-Modus
 *     offen, und der Wechsel muss auf DELETE umschalten. Ein Knopf im laufenden
 *     Betrieb muesste um genau diesen Umstand herumbauen.
 *   * ZUGRIFF AUF DEN WIRT IST DIE BERECHTIGUNG -- dieselbe Linie wie bei
 *     zugang.js. Eine Rechtefrage waere hier eine Kulisse.
 * Gerufen wird er ueber schluessel.sh, das die Instanz anhaelt, sichert und
 * hinterher wieder startet. Von Hand geht es auch; dann gilt die Reihenfolge
 * aus der README.
 *
 * WAS ER NICHT TUT: er wechselt den SCHLUESSEL, nicht das Verfahren.
 * cipher='sqlcipher' bleibt, die Schluessellaenge bleibt, katalog.sqlite bleibt.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { db, DATA_DIR, DB_FILE, keyFromEnv, keyHex, changeKey } = require('./db');
const keys = require('./keys');
const auth = require('./auth');

const RED = (t) => `\x1b[31m${t}\x1b[0m`;
const BOLD = (t) => `\x1b[1m${t}\x1b[0m`;

// Der Wechsel braucht freien Platz in Hoehe der Datenbank: das
// Rollback-Journal waechst auf ihre Groesse. Ein Zehntel Zuschlag, weil eine
// Platte, die auf das letzte Byte genau reicht, keine ist.
const SPACE_MARGIN = 1.1;
// Gemessen an einer verschluesselten Instanz: rund 20 ms je MB (5189 ms fuer
// 261 MB). Dieselbe Zahl wie SICHERUNG_MS_JE_MB in server.js -- und sie steht
// hier ein zweites Mal, weil server.js beim Wechsel gar nicht laeuft.
const MS_PER_MB = 20;

function help() {
  console.log(`
${BOLD('Kriterion — Schlüsselwechsel')}

  node schluessel.js zeigen
      Sagt, woher der Schlüssel kommt, wie groß die Datenbank ist, wie viel
      Platz frei ist und wann zuletzt gewechselt wurde. Ändert nichts.

  node schluessel.js wechseln [--env <pfad>] [--wer <text>] [--ja]
      Gibt der Datenbank einen neuen Schlüssel und zieht die Ablage nach.
      --env <pfad>   die .env des Wirts. PFLICHT, wenn der Schlüssel aus der
                     Umgebung kommt — ohne sie ließe sich der Wechsel nicht zu
                     Ende führen, und dann wird er gar nicht erst angefangen.
      --wer <text>   wer den Wechsel ausgelöst hat. Steht als Notiz in der .env
                     neben dem abgelösten Wert, nicht im Sicherheitsprotokoll.
      --ja           ohne Rückfrage. Für schluessel.sh und den Prüfstand.

${RED('  DIE INSTANZ MUSS DABEI STEHEN.')} Ein laufender Server hält die Datei im
  WAL-Modus offen; der Wechsel schaltet auf DELETE um. schluessel.sh nimmt
  einem das ab.

${RED('  VORHER SICHERN — Datenverzeichnis UND .env.')} Bricht der Wechsel ab,
  stellt das Rollback-Journal den alten Stand her; geht das Journal verloren,
  ist alles verloren. Das ist der Grund für die Sicherung, nicht der Abbruch.
`);
}

/* Liest eine Zeile -- dieselben zwei Wege wie in zugang.js, und aus demselben
 * Grund: readline liest bei geroehrter Eingabe VORAUS, und die zweite Frage
 * bekaeme dann nie eine Antwort. */
const onTerminal = Boolean(process.stdin.isTTY);
let pool = null, schlange = null;

function ask(text) {
  if (!onTerminal) {
    process.stdout.write(text);
    if (pool === null) {
      let all = '';
      try { all = fs.readFileSync(0, 'utf8'); } catch { all = ''; }
      pool = all.split('\n');
    }
    const a = pool.length ? pool.shift() : '';
    process.stdout.write('\n');
    return Promise.resolve(a);
  }
  if (!schlange)
    schlange = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((done) => schlange.question(text, done));
}
const closeQueue = () => { if (schlange) schlange.close(); };

/* ---- Die Lage, an einer Stelle gerechnet ---------------------------------
   Beide Befehle stellen dieselben Fragen; zwei Rechenwege fuer dieselbe Sache
   liefen auseinander. */
function state() {
  let bytes = 0;
  // MIT wal_checkpoint: ohne ihn steht der frisch geschriebene Bestand noch in
  // der WAL, die Datei sieht winzig aus, und Platzbedarf wie Dauer waeren zu
  // niedrig angesetzt (Stolperstein 4 in der Gegenrichtung).
  try { db.pragma('wal_checkpoint(TRUNCATE)'); bytes = fs.statSync(DB_FILE).size; } catch {}
  let free = null;
  try { const s = fs.statfsSync(path.dirname(DB_FILE)); free = s.bsize * s.bavail; } catch {}
  const needed = Math.ceil(bytes * SPACE_MARGIN);
  let changed = null;
  try {
    const z = db.prepare("SELECT value FROM settings WHERE key = 'schluesselGewechseltAm'").get();
    if (z) changed = JSON.parse(z.value);
  } catch {}
  return {
    bytes, free, needed,
    // Ein unbekannter freier Platz ist KEINE Absage: statfs kann auf einem
    // ungewoehnlichen Dateisystem scheitern, und eine Absage ohne Grundlage
    // waere schlimmer als der Versuch. Gesagt wird es trotzdem.
    reicht: free === null ? null : free >= needed,
    sekunden: Math.max(1, Math.round(bytes / 1048576 * MS_PER_MB / 1000)),
    changed
  };
}

const mb = (n) => (n == null ? '—' : `${(n / 1048576).toFixed(1)} MB`);

function commandShow() {
  const l = state();
  console.log(`\n${BOLD('Kriterion — Schlüssel')}\n`);
  console.log(`  Herkunft            ${keyFromEnv ? 'ENCRYPTION_KEY aus der Umgebung' : `die Datei ${path.join(DATA_DIR, 'encryption.key')}`}`);
  console.log(`  Datenbank           ${mb(l.bytes)}`);
  console.log(`  Freier Platz        ${mb(l.free)}${l.free === null ? ' (nicht ermittelbar)' : ''}`);
  console.log(`  Für den Wechsel     ${mb(l.needed)} — das Journal wächst auf die Größe der Datenbank`);
  console.log(`  Erwartete Dauer     rund ${l.sekunden} Sekunden`);
  console.log(`  Zuletzt gewechselt  ${l.changed || 'nie'}`);
  if (l.reicht === false) console.log(RED('\n  Der Platz reicht nicht. Ein Wechsel wird abgelehnt.'));
  if (keyFromEnv)
    console.log('\n  Der Wechsel braucht die .env des Wirts:  --env /pfad/zur/.env');
  console.log('');
}

async function commandChange(options) {
  const l = state();

  /* ERST DIE ABSAGEN, UND ZWAR ALLE, BEVOR IRGENDETWAS GESCHIEHT. Eine Absage
     nach dem halben Vorgang waere schlimmer als gar keine Pruefung. */
  if (keyFromEnv && !options.env) {
    console.error(RED('Der Schlüssel kommt aus der Umgebung (ENCRYPTION_KEY).'));
    console.error('Dann liegt er in der .env auf dem Wirt, und die sieht dieser Vorgang nur,');
    console.error('wenn sie ihm eingehängt und mit --env genannt wird. Ohne sie ließe sich der');
    console.error('Wechsel nicht zu Ende führen: die Datenbank trüge den neuen Schlüssel, die');
    console.error('.env den alten, und der nächste Start öffnete nichts mehr.');
    console.error('\nDer bequeme Weg ist  ./schluessel.sh  im Projektverzeichnis.');
    process.exit(1);
  }
  if (options.env && !keyFromEnv) {
    console.error(RED('--env ist angegeben, aber der Schlüssel kommt gar nicht aus der Umgebung.'));
    console.error(`Er liegt als ${path.join(DATA_DIR, 'encryption.key')} neben der Datenbank und`);
    console.error('wird dort nachgezogen. Eine .env hat damit nichts zu tun.');
    process.exit(1);
  }
  if (options.env) {
    if (!fs.existsSync(options.env)) {
      console.error(RED(`Die Datei ${options.env} gibt es nicht.`)); process.exit(1);
    }
    try { fs.accessSync(options.env, fs.constants.R_OK | fs.constants.W_OK); }
    catch { console.error(RED(`${options.env} ist nicht les- und schreibbar.`)); process.exit(1); }
    /* Die .env wird JETZT geprueft und nicht erst nach dem Wechsel: traegt sie
       einen anderen Wert, ist es die falsche Datei -- und das soll auffallen,
       solange die Datenbank noch ihren alten Schluessel hat. */
    const lines = fs.readFileSync(options.env, 'utf8').split('\n');
    const hit = keys.findEnvLine(lines);
    if (hit.length !== 1) {
      console.error(RED(`In ${options.env} stehen ${hit.length} aktive Zeilen ENCRYPTION_KEY=.`));
      console.error('Erwartet ist genau eine. Welche gemeint ist, entscheidet dieser Befehl nicht.');
      process.exit(1);
    }
    if (hit[0].wert.trim().toLowerCase() !== keyHex.toLowerCase()) {
      console.error(RED(`Die Zeile ENCRYPTION_KEY in ${options.env} trägt einen anderen Wert`));
      console.error('als den, mit dem diese Datenbank gerade offen ist. Das ist nicht die .env');
      console.error('dieser Instanz — und sie zu überschreiben nähme jemandem einen Schlüssel weg.');
      process.exit(1);
    }
  }
  if (l.reicht === false) {
    console.error(RED('Zu wenig Platz auf dem Datenträger.'));
    console.error(`Das Rollback-Journal wächst auf die Größe der Datenbank: gebraucht werden`);
    console.error(`${mb(l.needed)}, frei sind ${mb(l.free)}. Nichts geändert.`);
    process.exit(1);
  }

  const fresh = (process.env.NEUER_SCHLUESSEL || '').trim() || keys.createKey();
  if (!keys.HEX_PATTERN.test(fresh)) {
    console.error(RED('NEUER_SCHLUESSEL ist kein 64-stelliger Hexwert.')); process.exit(1);
  }
  if (fresh.toLowerCase() === keyHex.toLowerCase()) {
    console.error(RED('Der neue Schlüssel ist derselbe wie der alte. Nichts geändert.')); process.exit(1);
  }

  /* ---- Die Ansage, und sie nennt beim Namen, was danach anders ist ---- */
  console.log(`\n${BOLD('Der Schlüssel dieser Datenbank wird gewechselt.')}\n`);
  console.log(`  Datenbank        ${mb(l.bytes)}, erwartete Dauer rund ${l.sekunden} Sekunden`);
  console.log(`  Freier Platz     ${mb(l.free)} — gebraucht werden ${mb(l.needed)}`);
  console.log(`  Ablage danach    ${options.env || path.join(DATA_DIR, 'encryption.key')}`);
  console.log(RED('\n  WAS DANACH GILT:'));
  console.log(RED('  · Jede Sicherung, die JETZT dasteht, ist mit dem ALTEN Schlüssel'));
  console.log(RED('    verschlüsselt und bleibt es. Ab dem Wechsel sind zwei Schlüssel im'));
  console.log(RED('    Umlauf — heb den alten auf, sonst sind die alten Kopien wertlos.'));
  if (options.env)
    console.log(RED(`  · Der alte Wert bleibt auskommentiert in ${options.env} stehen.`));
  console.log(RED('  · Die Karte „Sicherung" markiert ab dann jede ältere Kopie rot.'));
  console.log(RED('  · Ohne den passenden Schlüssel sind die Daten endgültig verloren.'));
  console.log(`\n  Vorher gesichert? Datenverzeichnis UND ${options.env ? '.env' : 'Schlüsseldatei'}.`);

  if (!options.ja) {
    const answer = (await ask('\nWirklich wechseln? [ja/nein] ')).trim().toLowerCase();
    if (answer !== 'ja') { console.log('Abgebrochen, nichts geändert.'); return; }
  }

  /* ---- Der Wechsel ---- */
  const start = Date.now();
  let journal;
  try {
    journal = changeKey(fresh);
  } catch (e) {
    console.error(RED(`\nDer Wechsel ist gescheitert: ${e.message}`));
    console.error('Die Datenbank trägt weiterhin ihren bisherigen Schlüssel — das Rollback-');
    console.error('Journal stellt den alten Stand her, es entsteht kein halber Zustand.');
    process.exit(1);
  }
  const ms = Date.now() - start;

  const intact = db.pragma('integrity_check', { simple: true });
  if (intact !== 'ok') {
    console.error(RED(`\nDie Datenbank meldet nach dem Wechsel: ${intact}`));
    console.error('Spiel die Sicherung zurück. Der NEUE Schlüssel lautet:');
    console.error(`\n    ${fresh}\n`);
    process.exit(1);
  }

  /* ---- Die Ablage, ERST JETZT ----
     Vor dem Wechsel geschrieben, stuende in der .env ein Schluessel, der zu
     nichts passt, sobald der Wechsel scheitert. Scheitert umgekehrt das
     Schreiben, steht der neue Wert auf dem Bildschirm -- das ist die eine
     Stelle, die zum Abschreiben da ist, und der Merksatz zu Kontrollausgaben
     nimmt sie ausdruecklich aus. */
  /* Dieselbe Schreibweise wie jeder Zeitstempel der Instanz ("2026-08-23
     19:56:01", UTC): die Karte "Sicherung" haelt die Marke gegen die
     Aenderungszeiten der Dateien, und die Oberflaeche hat genau einen Weg, aus
     einem Zeitstempel ein Datum zu machen. */
  const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let old = null;
  try {
    if (options.env) old = keys.writeEnvLine(options.env, keyHex, fresh, options.wer, stamp);
    else keys.writeKeyFile(DATA_DIR, fresh);
  } catch (e) {
    console.error(RED(`\nDER WECHSEL IST GELUNGEN, DIE ABLAGE NICHT: ${e.message}`));
    console.error(RED('DIE DATENBANK ÖFFNET SICH AB SOFORT NUR NOCH MIT DIESEM WERT.'));
    console.error(RED('SCHREIB IHN JETZT AB, sonst sind die Daten verloren:'));
    console.error(`\n    ENCRYPTION_KEY=${fresh}\n`);
    console.error(`Er gehört ${options.env ? `als aktive Zeile in ${options.env}` : `in ${path.join(DATA_DIR, 'encryption.key')}`}`);
    console.error('und zusätzlich in den Passwortspeicher.');
    process.exit(1);
  }

  /* ---- Die Spur ----
     Beides NACH dem Vorgang, wie ueberall: ein Protokoll, das den Vorgang
     mitreisst, ueber den es berichten soll, waere schlimmer als keins. */
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('schluesselGewechseltAm', ?)")
    .run(JSON.stringify(stamp));
  auth.log('schluessel', { wer: auth.FROM_HOST });

  console.log(`\n${BOLD('Der Schlüssel ist gewechselt.')}`);
  console.log(`  Gedauert hat es ${ms} ms; das Journal stand auf ${journal.vorher} → DELETE → ${journal.nachher}.`);
  console.log(`  integrity_check: ${intact}`);
  if (options.env) {
    console.log(`  ${options.env}: der neue Wert steht aktiv, der alte auskommentiert darüber.`);
    console.log(RED(`\n  DER ALTE WERT ÖFFNET ALLE SICHERUNGEN VON VOR ${stamp} UTC.`));
    console.log(RED('  Übernimm ihn in den Passwortspeicher, bevor du die Zeile entfernst:'));
    console.log(`\n    ${old}\n`);
  } else {
    console.log(`  ${path.join(DATA_DIR, 'encryption.key')} trägt den neuen Wert.`);
    console.log(RED(`\n  DER ALTE WERT ÖFFNET ALLE SICHERUNGEN VON VOR ${stamp} UTC.`));
    /* Nicht "nirgends mehr": die Sicherung des Datenverzeichnisses, die
       schluessel.sh vorher angelegt hat, traegt die alte Schluesseldatei mit.
       Wer sie weglegt, legt den alten Schluessel mit weg -- und das ist die
       einzige Stelle, an der er dann noch steht. */
    console.log(RED('  Er steht ab jetzt nur noch in der Sicherung, die vor dem Wechsel'));
    console.log(RED('  entstanden ist. Übernimm ihn in den Passwortspeicher:'));
    console.log(`\n    ${keyHex}\n`);
  }
  console.log('  Jetzt die Instanz starten und im Protokoll nachsehen, dass sie öffnet.');

  /* SAUBER SCHLIESSEN, dieselbe Form wie beim Herunterfahren des Servers: die
     WAL wird eingearbeitet, bevor der Prozess endet. schluessel.sh startet die
     Instanz unmittelbar danach, und wer in genau diesem Augenblick das
     Datenverzeichnis sichert, soll keinen Zustand mit offener WAL erwischen.
     Der Abschluss darf nichts werfen -- der Wechsel ist an dieser Stelle
     laengst gelungen. */
  try { db.pragma('wal_checkpoint(TRUNCATE)'); db.close(); } catch {}
}

async function main() {
  const args = process.argv.slice(2);
  const command = args.shift();
  const get = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : null;
  };
  const options = {
    env: get('--env'),
    wer: get('--wer') || 'unbekannt',
    ja: args.includes('--ja')
  };
  switch (command) {
    case 'zeigen': commandShow(); break;
    case 'wechseln': await commandChange(options); break;
    default:
      if (command) console.error(RED(`Unbekannter Befehl: ${command}`));
      help();
      process.exit(command ? 1 : 0);
  }
}

main()
  .then(() => { closeQueue(); })
  .catch((e) => { closeQueue(); console.error(RED(e.message)); process.exit(1); });
