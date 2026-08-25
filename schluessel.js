#!/usr/bin/env node
/* Der Schluesselwechsel -- auf dem Wirt, bei ANGEHALTENER Anlage.
 *
 *   node schluessel.js zeigen
 *   node schluessel.js wechseln [--env <pfad>] [--wer <text>] [--ja]
 *
 * ES IST DER EINZIGE VORGANG IM GANZEN PROJEKT, DER BEI FALSCHER HANDHABUNG
 * ALLES VERLIERT. Deshalb steht er hier und nicht als Knopf in der Oberflaeche:
 *   * Auf dem Wirt liegt die .env. Kommt der Schluessel von dort, kann NUR hier
 *     der Wechsel zu Ende gefuehrt werden -- die Anlage im Container sieht die
 *     Datei nicht einmal (.dockerignore).
 *   * Die Anlage STEHT dabei. Ein laufender Server haelt die Datei im WAL-Modus
 *     offen, und der Wechsel muss auf DELETE umschalten. Ein Knopf im laufenden
 *     Betrieb muesste um genau diesen Umstand herumbauen.
 *   * ZUGRIFF AUF DEN WIRT IST DIE BERECHTIGUNG -- dieselbe Linie wie bei
 *     zugang.js. Eine Rechtefrage waere hier eine Kulisse.
 * Gerufen wird er ueber schluessel.sh, das die Anlage anhaelt, sichert und
 * hinterher wieder startet. Von Hand geht es auch; dann gilt die Reihenfolge
 * aus der README.
 *
 * WAS ER NICHT TUT: er wechselt den SCHLUESSEL, nicht das Verfahren.
 * cipher='sqlcipher' bleibt, die Schluessellaenge bleibt, katalog.sqlite bleibt.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { db, DATA_DIR, DB_FILE, keyFromEnv, keyHex, wechsleSchluessel } = require('./db');
const keys = require('./keys');
const auth = require('./auth');

const ROT = (t) => `\x1b[31m${t}\x1b[0m`;
const FETT = (t) => `\x1b[1m${t}\x1b[0m`;

// Der Wechsel braucht freien Platz in Hoehe der Datenbank: das
// Rollback-Journal waechst auf ihre Groesse. Ein Zehntel Zuschlag, weil eine
// Platte, die auf das letzte Byte genau reicht, keine ist.
const PLATZ_ZUSCHLAG = 1.1;
// Gemessen an einer verschluesselten Anlage: rund 20 ms je MB (5189 ms fuer
// 261 MB). Dieselbe Zahl wie SICHERUNG_MS_JE_MB in server.js -- und sie steht
// hier ein zweites Mal, weil server.js beim Wechsel gar nicht laeuft.
const MS_JE_MB = 20;

function hilfe() {
  console.log(`
${FETT('Kriterion — Schlüsselwechsel')}

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

${ROT('  DIE ANLAGE MUSS DABEI STEHEN.')} Ein laufender Server hält die Datei im
  WAL-Modus offen; der Wechsel schaltet auf DELETE um. schluessel.sh nimmt
  einem das ab.

${ROT('  VORHER SICHERN — Datenverzeichnis UND .env.')} Bricht der Wechsel ab,
  stellt das Rollback-Journal den alten Stand her; geht das Journal verloren,
  ist alles verloren. Das ist der Grund für die Sicherung, nicht der Abbruch.
`);
}

/* Liest eine Zeile -- dieselben zwei Wege wie in zugang.js, und aus demselben
 * Grund: readline liest bei geroehrter Eingabe VORAUS, und die zweite Frage
 * bekaeme dann nie eine Antwort. */
const amTerminal = Boolean(process.stdin.isTTY);
let vorrat = null, schlange = null;

function frage(text) {
  if (!amTerminal) {
    process.stdout.write(text);
    if (vorrat === null) {
      let alles = '';
      try { alles = fs.readFileSync(0, 'utf8'); } catch { alles = ''; }
      vorrat = alles.split('\n');
    }
    const a = vorrat.length ? vorrat.shift() : '';
    process.stdout.write('\n');
    return Promise.resolve(a);
  }
  if (!schlange)
    schlange = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((fertig) => schlange.question(text, fertig));
}
const schlangeSchliessen = () => { if (schlange) schlange.close(); };

/* ---- Die Lage, an einer Stelle gerechnet ---------------------------------
   Beide Befehle stellen dieselben Fragen; zwei Rechenwege fuer dieselbe Sache
   liefen auseinander. */
function lage() {
  let bytes = 0;
  // MIT wal_checkpoint: ohne ihn steht der frisch geschriebene Bestand noch in
  // der WAL, die Datei sieht winzig aus, und Platzbedarf wie Dauer waeren zu
  // niedrig angesetzt (Stolperstein 4 in der Gegenrichtung).
  try { db.pragma('wal_checkpoint(TRUNCATE)'); bytes = fs.statSync(DB_FILE).size; } catch {}
  let frei = null;
  try { const s = fs.statfsSync(path.dirname(DB_FILE)); frei = s.bsize * s.bavail; } catch {}
  const noetig = Math.ceil(bytes * PLATZ_ZUSCHLAG);
  let gewechselt = null;
  try {
    const z = db.prepare("SELECT value FROM settings WHERE key = 'schluesselGewechseltAm'").get();
    if (z) gewechselt = JSON.parse(z.value);
  } catch {}
  return {
    bytes, frei, noetig,
    // Ein unbekannter freier Platz ist KEINE Absage: statfs kann auf einem
    // ungewoehnlichen Dateisystem scheitern, und eine Absage ohne Grundlage
    // waere schlimmer als der Versuch. Gesagt wird es trotzdem.
    reicht: frei === null ? null : frei >= noetig,
    sekunden: Math.max(1, Math.round(bytes / 1048576 * MS_JE_MB / 1000)),
    gewechselt
  };
}

const mb = (n) => (n == null ? '—' : `${(n / 1048576).toFixed(1)} MB`);

function befehlZeigen() {
  const l = lage();
  console.log(`\n${FETT('Kriterion — Schlüssel')}\n`);
  console.log(`  Herkunft            ${keyFromEnv ? 'ENCRYPTION_KEY aus der Umgebung' : `die Datei ${path.join(DATA_DIR, 'encryption.key')}`}`);
  console.log(`  Datenbank           ${mb(l.bytes)}`);
  console.log(`  Freier Platz        ${mb(l.frei)}${l.frei === null ? ' (nicht ermittelbar)' : ''}`);
  console.log(`  Für den Wechsel     ${mb(l.noetig)} — das Journal wächst auf die Größe der Datenbank`);
  console.log(`  Erwartete Dauer     rund ${l.sekunden} Sekunden`);
  console.log(`  Zuletzt gewechselt  ${l.gewechselt || 'nie'}`);
  if (l.reicht === false) console.log(ROT('\n  Der Platz reicht nicht. Ein Wechsel wird abgelehnt.'));
  if (keyFromEnv)
    console.log('\n  Der Wechsel braucht die .env des Wirts:  --env /pfad/zur/.env');
  console.log('');
}

async function befehlWechseln(optionen) {
  const l = lage();

  /* ERST DIE ABSAGEN, UND ZWAR ALLE, BEVOR IRGENDETWAS GESCHIEHT. Eine Absage
     nach dem halben Vorgang waere schlimmer als gar keine Pruefung. */
  if (keyFromEnv && !optionen.env) {
    console.error(ROT('Der Schlüssel kommt aus der Umgebung (ENCRYPTION_KEY).'));
    console.error('Dann liegt er in der .env auf dem Wirt, und die sieht dieser Vorgang nur,');
    console.error('wenn sie ihm eingehängt und mit --env genannt wird. Ohne sie ließe sich der');
    console.error('Wechsel nicht zu Ende führen: die Datenbank trüge den neuen Schlüssel, die');
    console.error('.env den alten, und der nächste Start öffnete nichts mehr.');
    console.error('\nDer bequeme Weg ist  ./schluessel.sh  im Projektverzeichnis.');
    process.exit(1);
  }
  if (optionen.env && !keyFromEnv) {
    console.error(ROT('--env ist angegeben, aber der Schlüssel kommt gar nicht aus der Umgebung.'));
    console.error(`Er liegt als ${path.join(DATA_DIR, 'encryption.key')} neben der Datenbank und`);
    console.error('wird dort nachgezogen. Eine .env hat damit nichts zu tun.');
    process.exit(1);
  }
  if (optionen.env) {
    if (!fs.existsSync(optionen.env)) {
      console.error(ROT(`Die Datei ${optionen.env} gibt es nicht.`)); process.exit(1);
    }
    try { fs.accessSync(optionen.env, fs.constants.R_OK | fs.constants.W_OK); }
    catch { console.error(ROT(`${optionen.env} ist nicht les- und schreibbar.`)); process.exit(1); }
    /* Die .env wird JETZT geprueft und nicht erst nach dem Wechsel: traegt sie
       einen anderen Wert, ist es die falsche Datei -- und das soll auffallen,
       solange die Datenbank noch ihren alten Schluessel hat. */
    const zeilen = fs.readFileSync(optionen.env, 'utf8').split('\n');
    const treffer = keys.findeEnvZeile(zeilen);
    if (treffer.length !== 1) {
      console.error(ROT(`In ${optionen.env} stehen ${treffer.length} aktive Zeilen ENCRYPTION_KEY=.`));
      console.error('Erwartet ist genau eine. Welche gemeint ist, entscheidet dieser Befehl nicht.');
      process.exit(1);
    }
    if (treffer[0].wert.trim().toLowerCase() !== keyHex.toLowerCase()) {
      console.error(ROT(`Die Zeile ENCRYPTION_KEY in ${optionen.env} trägt einen anderen Wert`));
      console.error('als den, mit dem diese Datenbank gerade offen ist. Das ist nicht die .env');
      console.error('dieser Anlage — und sie zu überschreiben nähme jemandem einen Schlüssel weg.');
      process.exit(1);
    }
  }
  if (l.reicht === false) {
    console.error(ROT('Zu wenig Platz auf dem Datenträger.'));
    console.error(`Das Rollback-Journal wächst auf die Größe der Datenbank: gebraucht werden`);
    console.error(`${mb(l.noetig)}, frei sind ${mb(l.frei)}. Nichts geändert.`);
    process.exit(1);
  }

  const neu = (process.env.NEUER_SCHLUESSEL || '').trim() || keys.erzeugeSchluessel();
  if (!keys.HEX_MUSTER.test(neu)) {
    console.error(ROT('NEUER_SCHLUESSEL ist kein 64-stelliger Hexwert.')); process.exit(1);
  }
  if (neu.toLowerCase() === keyHex.toLowerCase()) {
    console.error(ROT('Der neue Schlüssel ist derselbe wie der alte. Nichts geändert.')); process.exit(1);
  }

  /* ---- Die Ansage, und sie nennt beim Namen, was danach anders ist ---- */
  console.log(`\n${FETT('Der Schlüssel dieser Datenbank wird gewechselt.')}\n`);
  console.log(`  Datenbank        ${mb(l.bytes)}, erwartete Dauer rund ${l.sekunden} Sekunden`);
  console.log(`  Freier Platz     ${mb(l.frei)} — gebraucht werden ${mb(l.noetig)}`);
  console.log(`  Ablage danach    ${optionen.env || path.join(DATA_DIR, 'encryption.key')}`);
  console.log(ROT('\n  WAS DANACH GILT:'));
  console.log(ROT('  · Jede Sicherung, die JETZT dasteht, ist mit dem ALTEN Schlüssel'));
  console.log(ROT('    verschlüsselt und bleibt es. Ab dem Wechsel sind zwei Schlüssel im'));
  console.log(ROT('    Umlauf — heb den alten auf, sonst sind die alten Kopien wertlos.'));
  if (optionen.env)
    console.log(ROT(`  · Der alte Wert bleibt auskommentiert in ${optionen.env} stehen.`));
  console.log(ROT('  · Die Karte „Sicherung" markiert ab dann jede ältere Kopie rot.'));
  console.log(ROT('  · Ohne den passenden Schlüssel sind die Daten endgültig verloren.'));
  console.log(`\n  Vorher gesichert? Datenverzeichnis UND ${optionen.env ? '.env' : 'Schlüsseldatei'}.`);

  if (!optionen.ja) {
    const antwort = (await frage('\nWirklich wechseln? [ja/nein] ')).trim().toLowerCase();
    if (antwort !== 'ja') { console.log('Abgebrochen, nichts geändert.'); return; }
  }

  /* ---- Der Wechsel ---- */
  const beginn = Date.now();
  let journal;
  try {
    journal = wechsleSchluessel(neu);
  } catch (e) {
    console.error(ROT(`\nDer Wechsel ist gescheitert: ${e.message}`));
    console.error('Die Datenbank trägt weiterhin ihren bisherigen Schlüssel — das Rollback-');
    console.error('Journal stellt den alten Stand her, es entsteht kein halber Zustand.');
    process.exit(1);
  }
  const ms = Date.now() - beginn;

  const heil = db.pragma('integrity_check', { simple: true });
  if (heil !== 'ok') {
    console.error(ROT(`\nDie Datenbank meldet nach dem Wechsel: ${heil}`));
    console.error('Spiel die Sicherung zurück. Der NEUE Schlüssel lautet:');
    console.error(`\n    ${neu}\n`);
    process.exit(1);
  }

  /* ---- Die Ablage, ERST JETZT ----
     Vor dem Wechsel geschrieben, stuende in der .env ein Schluessel, der zu
     nichts passt, sobald der Wechsel scheitert. Scheitert umgekehrt das
     Schreiben, steht der neue Wert auf dem Bildschirm -- das ist die eine
     Stelle, die zum Abschreiben da ist, und der Merksatz zu Kontrollausgaben
     nimmt sie ausdruecklich aus. */
  /* Dieselbe Schreibweise wie jeder Zeitstempel der Anlage ("2026-08-23
     19:56:01", UTC): die Karte "Sicherung" haelt die Marke gegen die
     Aenderungszeiten der Dateien, und die Oberflaeche hat genau einen Weg, aus
     einem Zeitstempel ein Datum zu machen. */
  const zeitpunkt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let alt = null;
  try {
    if (optionen.env) alt = keys.schreibeEnvZeile(optionen.env, keyHex, neu, optionen.wer, zeitpunkt);
    else keys.schreibeSchluesselDatei(DATA_DIR, neu);
  } catch (e) {
    console.error(ROT(`\nDER WECHSEL IST GELUNGEN, DIE ABLAGE NICHT: ${e.message}`));
    console.error(ROT('DIE DATENBANK ÖFFNET SICH AB SOFORT NUR NOCH MIT DIESEM WERT.'));
    console.error(ROT('SCHREIB IHN JETZT AB, sonst sind die Daten verloren:'));
    console.error(`\n    ENCRYPTION_KEY=${neu}\n`);
    console.error(`Er gehört ${optionen.env ? `als aktive Zeile in ${optionen.env}` : `in ${path.join(DATA_DIR, 'encryption.key')}`}`);
    console.error('und zusätzlich in den Passwortspeicher.');
    process.exit(1);
  }

  /* ---- Die Spur ----
     Beides NACH dem Vorgang, wie ueberall: ein Protokoll, das den Vorgang
     mitreisst, ueber den es berichten soll, waere schlimmer als keins. */
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('schluesselGewechseltAm', ?)")
    .run(JSON.stringify(zeitpunkt));
  auth.protokolliere('schluessel', { wer: auth.VOM_WIRT });

  console.log(`\n${FETT('Der Schlüssel ist gewechselt.')}`);
  console.log(`  Gedauert hat es ${ms} ms; das Journal stand auf ${journal.vorher} → DELETE → ${journal.nachher}.`);
  console.log(`  integrity_check: ${heil}`);
  if (optionen.env) {
    console.log(`  ${optionen.env}: der neue Wert steht aktiv, der alte auskommentiert darüber.`);
    console.log(ROT(`\n  DER ALTE WERT ÖFFNET ALLE SICHERUNGEN VON VOR ${zeitpunkt} UTC.`));
    console.log(ROT('  Übernimm ihn in den Passwortspeicher, bevor du die Zeile entfernst:'));
    console.log(`\n    ${alt}\n`);
  } else {
    console.log(`  ${path.join(DATA_DIR, 'encryption.key')} trägt den neuen Wert.`);
    console.log(ROT(`\n  DER ALTE WERT ÖFFNET ALLE SICHERUNGEN VON VOR ${zeitpunkt} UTC.`));
    console.log(ROT('  Er steht ab jetzt nirgends mehr — nur noch in deinen alten Kopien:'));
    console.log(`\n    ${keyHex}\n`);
  }
  console.log('  Jetzt die Anlage starten und im Protokoll nachsehen, dass sie öffnet.');
}

async function haupt() {
  const argumente = process.argv.slice(2);
  const befehl = argumente.shift();
  const hole = (name) => {
    const i = argumente.indexOf(name);
    return i >= 0 ? argumente[i + 1] : null;
  };
  const optionen = {
    env: hole('--env'),
    wer: hole('--wer') || 'unbekannt',
    ja: argumente.includes('--ja')
  };
  switch (befehl) {
    case 'zeigen': befehlZeigen(); break;
    case 'wechseln': await befehlWechseln(optionen); break;
    default:
      if (befehl) console.error(ROT(`Unbekannter Befehl: ${befehl}`));
      hilfe();
      process.exit(befehl ? 1 : 0);
  }
}

haupt()
  .then(() => { schlangeSchliessen(); })
  .catch((e) => { schlangeSchliessen(); console.error(ROT(e.message)); process.exit(1); });
