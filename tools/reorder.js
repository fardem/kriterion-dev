#!/usr/bin/env node
/* Die Spaltenfolge umschichten: data ans Ende von photos, comment_images und
 * attachments. Auf dem Wirt, bei ANGEHALTENER Instanz. SQLite liest eine Zeile
 * von vorn; was hinter einem grossen BLOB steht, kostet die Overflow-Kette. */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const RED = (t) => `\x1b[31m${t}\x1b[0m`;
const BOLD = (t) => `\x1b[1m${t}\x1b[0m`;

/* Die Datenbank erst auf Zuruf und nicht am Kopf: haelt ein anderer Prozess
   die Datei, scheitert schon die DDL beim Laden, und die Absage soll ein Satz
   sein und kein Stapelauszug. */
let db, DB_FILE, SCHEMA;
function openDatabase() {
  try { ({ db, DB_FILE, SCHEMA } = require('../db')); }
  catch (e) { foreignHands(e); throw e; }
}

function foreignHands(e) {
  if (e.code !== 'SQLITE_BUSY') return;
  console.error(RED('\nDie Datenbank ist in fremder Hand.'));
  console.error('Ein anderer Prozess hält die Datei. Halte die Instanz an und ruf den');
  console.error('Befehl noch einmal auf. Nichts geändert.');
  process.exit(1);
}

// trash_bytes fehlt hier, weil data dort schon die letzte Spalte ist.
const TABLES = ['photos', 'comment_images', 'attachments'];

// Gemessen: die Datei waechst beim Umschichten auf das Doppelte, und VACUUM
// legt danach noch einmal eine in voller Groesse an.
const SPACE_FACTOR = 3;
// Gemessen an einer verschluesselten Prueflage von 231,7 MB: 4476 ms
// Umschichten und 5874 ms VACUUM, zusammen 44,7 ms je MB.
const MS_PER_MB = 45;

function help() {
  console.log(`
${BOLD('Kriterion — die Spaltenfolge')}

  node tools/reorder.js zeigen
      Sagt je Tabelle, ob data schon am Ende steht, wie viele Zeilen und wie
      viele Bytes darin liegen, wie viel Platz frei ist und wie lange es
      dauern würde. Ändert nichts.

  node tools/reorder.js umschichten [--ja]
      Schichtet die drei Tabellen um und gibt den Platz danach mit VACUUM
      zurück.
      --ja   ohne Rückfrage. Für den Prüfstand.

${RED('  DIE INSTANZ MUSS DABEI STEHEN.')} Das Werkzeug nimmt je Tabelle eine
  ausschließende Transaktion; hält ein anderer Prozess die Datei, bricht es ab.

${RED('  VORHER SICHERN — das Datenverzeichnis.')} Die Umschichtung läuft in
  einer Transaktion, und ein Abbruch stellt den alten Stand her. Das ist der
  Grund für die Sicherung, nicht der Abbruch.
`);
}

/* Liest eine Zeile -- dieselben zwei Wege wie in keytool.js: readline liest
 * bei geroehrter Eingabe VORAUS. */
const onTerminal = Boolean(process.stdin.isTTY);
let pool = null, queue = null;

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
  if (!queue)
    queue = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((done) => queue.question(text, done));
}
const closeQueue = () => { if (queue) queue.close(); };

/* ---- Die Lage, an einer Stelle gerechnet --------------------------------- */
const columnsOf = (table) =>
  db.prepare(`PRAGMA table_info("${table}")`).all().map(c => c.name);

const atEnd = (table) => {
  const c = columnsOf(table);
  return c.length > 0 && c[c.length - 1] === 'data';
};

const stock = (table) => db.prepare(
  `SELECT COUNT(*) AS rows, COALESCE(SUM(length(data)), 0) AS bytes FROM "${table}"`).get();

function state() {
  let bytes = 0;
  // MIT wal_checkpoint: ohne ihn steht der frisch geschriebene Bestand noch
  // in der WAL, und Platzbedarf wie Dauer waeren zu niedrig angesetzt.
  try { db.pragma('wal_checkpoint(TRUNCATE)'); bytes = fs.statSync(DB_FILE).size; } catch {}
  let free = null;
  try { const s = fs.statfsSync(path.dirname(DB_FILE)); free = s.bsize * s.bavail; } catch {}
  const needed = bytes * SPACE_FACTOR;
  const tables = TABLES.map(t => ({ table: t, end: atEnd(t), ...stock(t) }));
  return {
    bytes, free, needed, tables,
    done: tables.every(t => t.end),
    // Ein unbekannter freier Platz ist KEINE Absage: statfs kann auf einem
    // ungewoehnlichen Dateisystem scheitern. Gesagt wird es trotzdem.
    enough: free === null ? null : free >= needed,
    seconds: Math.max(1, Math.round(bytes / 1048576 * MS_PER_MB / 1000))
  };
}

const mb = (n) => (n == null ? '—' : `${(n / 1048576).toFixed(1)} MB`);

function commandShow() {
  const l = state();
  console.log(`\n${BOLD('Kriterion — die Spaltenfolge')}\n`);
  console.log(`  ${DB_FILE}\n`);
  console.log('  Tabelle           data am Ende    Zeilen        in data');
  for (const t of l.tables)
    console.log('  ' + t.table.padEnd(18) + (t.end ? 'ja' : 'nein').padEnd(15)
      + String(t.rows).padStart(7) + mb(t.bytes).padStart(15));
  console.log(`\n  Datenbank           ${mb(l.bytes)}`);
  console.log(`  Freier Platz        ${mb(l.free)}${l.free === null ? ' (nicht ermittelbar)' : ''}`);
  console.log(`  Gebraucht           ${mb(l.needed)} — das Dreifache der Datei`);
  console.log(`  Erwartete Dauer     rund ${l.seconds} Sekunden`);
  if (l.enough === false) console.log(RED('\n  Der Platz reicht nicht. Ein Umschichten wird abgelehnt.'));
  if (l.done) console.log('\n  data steht in allen drei Tabellen am Ende. Es ist nichts zu tun.');
  else console.log('\n  Umschichten mit:  node tools/reorder.js umschichten');
  console.log('');
}

/* ---- Die Umschichtung ---------------------------------------------------- */
/* Die Definition kommt aus dem Schema und nicht aus sqlite_master: so traegt
   die neue Tabelle denselben Wortlaut wie die einer frischen Instanz. Die
   schliessende Klammer steht auf einer eigenen Zeile. */
function definition(table, name) {
  const head = `CREATE TABLE IF NOT EXISTS ${table} (`;
  const at = SCHEMA.indexOf(head);
  if (at < 0) throw new Error(`${table} steht nicht im Schema.`);
  const end = SCHEMA.indexOf('\n);', at);
  if (end < 0) throw new Error(`Die Definition von ${table} hat kein Ende.`);
  return `CREATE TABLE "${name}" (` + SCHEMA.slice(at + head.length, end + 2);
}

/* Die selbst erzeugten Indexe aus UNIQUE und PRIMARY KEY tragen kein sql und
   wandern mit der Definition mit. */
const belongings = (table) => db.prepare(
  `SELECT type, name, sql FROM sqlite_master
    WHERE tbl_name = ? AND type IN ('index', 'trigger') AND sql IS NOT NULL
    ORDER BY name`).all(table);

function reorder(table) {
  const start = Date.now();
  const belong = belongings(table);
  const old = columnsOf(table);
  const temporary = `${table}_umschichten`;
  db.exec(`DROP TABLE IF EXISTS "${temporary}"`);
  db.exec(definition(table, temporary));
  const fresh = columnsOf(temporary);
  /* SPALTEN BEIM NAMEN, NIE `*`. Weicht die Menge ab, wuerde der Umbau eine
     Spalte verlieren oder eine leer lassen. */
  const missing = old.filter(n => !fresh.includes(n));
  const added = fresh.filter(n => !old.includes(n));
  if (missing.length || added.length)
    throw new Error(`${table}: die Spalten weichen vom Schema ab — `
      + `${missing.length ? `nicht im Schema: ${missing.join(', ')}` : ''}`
      + `${missing.length && added.length ? '; ' : ''}`
      + `${added.length ? `nicht in der Tabelle: ${added.join(', ')}` : ''}`);
  const list = fresh.map(n => `"${n}"`).join(', ');
  db.exec(`INSERT INTO "${temporary}" (${list}) SELECT ${list} FROM "${table}"`);
  db.exec(`DROP TABLE "${table}"`);
  db.exec(`ALTER TABLE "${temporary}" RENAME TO "${table}"`);
  for (const b of belong) db.exec(b.sql);
  const broken = db.pragma('foreign_key_check');
  if (broken.length)
    throw new Error(`${table}: foreign_key_check meldet ${broken.length} Zeilen.`);
  return Date.now() - start;
}

async function commandReorder(options) {
  const l = state();

  /* ERST DIE ABSAGEN, UND ZWAR ALLE, BEVOR IRGENDETWAS GESCHIEHT. */
  if (l.done) {
    console.log('\n  data steht in allen drei Tabellen am Ende. Nichts geändert.\n');
    return;
  }
  if (l.enough === false) {
    console.error(RED('Zu wenig Platz auf dem Datenträger.'));
    console.error('Beim Umschichten steht die Datei doppelt da, und VACUUM legt danach noch');
    console.error(`einmal eine in voller Größe an: gebraucht werden ${mb(l.needed)}, frei sind ${mb(l.free)}.`);
    console.error('Nichts geändert.');
    process.exit(1);
  }

  console.log(`\n${BOLD('Die Spaltenfolge von drei Tabellen wird geändert.')}\n`);
  console.log(`  Datenbank        ${mb(l.bytes)}, erwartete Dauer rund ${l.seconds} Sekunden`);
  console.log(`  Freier Platz     ${mb(l.free)} — gebraucht werden ${mb(l.needed)}`);
  for (const t of l.tables)
    console.log(`  ${t.table.padEnd(16)} ${String(t.rows).padStart(7)} Zeilen, ${mb(t.bytes)}`
      + (t.end ? ' — steht schon' : ''));
  console.log(RED('\n  DIE INSTANZ MUSS DABEI STEHEN.'));
  console.log('  Vorher gesichert? Das Datenverzeichnis.');

  if (!options.ja) {
    const answer = (await ask('\nWirklich umschichten? [ja/nein] ')).trim().toLowerCase();
    if (answer !== 'ja') { console.log('Abgebrochen, nichts geändert.'); return; }
  }

  /* AUSSERHALB DER TRANSAKTION: innerhalb ist PRAGMA foreign_keys wirkungslos,
     und DROP TABLE risse dann die Zeilen der Kinder mit. */
  db.pragma('foreign_keys = OFF');
  console.log('');
  try {
    for (const t of l.tables) {
      if (t.end) continue;
      /* BEGIN EXCLUSIVE ist zugleich die Probe, ob ein anderer Prozess die
         Datei haelt: er kommt als SQLITE_BUSY zurueck. */
      try { db.exec('BEGIN EXCLUSIVE'); }
      catch (e) { foreignHands(e); throw e; }
      let ms;
      try {
        ms = reorder(t.table);
        db.exec('COMMIT');
      } catch (e) {
        try { db.exec('ROLLBACK'); } catch {}
        console.error(RED(`\nDas Umschichten von ${t.table} ist gescheitert: ${e.message}`));
        console.error('Die Transaktion ist zurückgerollt; die Tabelle steht wie vorher.');
        process.exit(1);
      }
      console.log(`  ${t.table.padEnd(16)} ${String(t.rows).padStart(7)} Zeilen, `
        + `${mb(t.bytes).padStart(10)}, ${ms} ms`);
    }
  } finally {
    db.pragma('foreign_keys = ON');
  }

  /* VACUUM AUSSERHALB DER TRANSAKTION. Ohne ihn bleibt die Datei auf dem
     Doppelten stehen: der Platz der alten Tabellen ist frei, aber nicht
     zurueckgegeben. */
  const vacuumStart = Date.now();
  db.exec('VACUUM');
  console.log(`  ${'VACUUM'.padEnd(16)} ${''.padStart(26)}${Date.now() - vacuumStart} ms`);

  const after = state();
  const intact = db.pragma('integrity_check', { simple: true });
  console.log(`\n${BOLD('Die Spaltenfolge steht.')}`);
  console.log(`  data ist in photos, comment_images und attachments die letzte Spalte.`);
  console.log(`  Datei  ${mb(l.bytes)} → ${mb(after.bytes)}`);
  console.log(`  integrity_check: ${intact}`);
  if (intact !== 'ok') {
    console.error(RED('\n  Die Datenbank meldet einen Schaden. Spiel die Sicherung zurück.'));
    process.exit(1);
  }
  try { db.pragma('wal_checkpoint(TRUNCATE)'); db.close(); } catch {}
}

async function main() {
  const args = process.argv.slice(2);
  const command = args.shift();
  const options = { ja: args.includes('--ja') };
  switch (command) {
    case 'zeigen': openDatabase(); commandShow(); break;
    case 'umschichten': openDatabase(); await commandReorder(options); break;
    default:
      if (command) console.error(RED(`Unbekannter Befehl: ${command}`));
      help();
      process.exit(command ? 1 : 0);
  }
}

main()
  .then(() => { closeQueue(); })
  .catch((e) => { closeQueue(); console.error(RED(e.message)); process.exit(1); });
