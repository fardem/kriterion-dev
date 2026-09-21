#!/usr/bin/env node
/* Kriterion — misst, was die Kachel heute kostet. Sie steht in photos hinter
   data; wer sie liest, laeuft durch die Overflow-Kette des Originals.

     node tools/photoscan.js            der Bestand und beide Wege
     node tools/photoscan.js --laeufe 9 mehr Durchgaenge je Messung

   ES WIRD NUR GELESEN. Keine Tabelle entsteht, keine Zeile aendert sich.
*/
const path = require('path');

/* Die Spalten VOR data und die dahinter -- der ganze Unterschied, den eine
   Nebentabelle ausmachen wuerde. */
const BEFORE = 'id, item_id, mime_type';
const AFTER = 'thumb, medium, kind';

const mb = (n) => (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
const ms = (n) => n.toFixed(1).replace('.', ',') + ' ms';
const pct = (a, b) => b === 0 ? '—' : ((a / b - 1) * 100).toFixed(0) + ' %';

/* Der Median und nicht der Mittelwert: ein einzelner langsamer Durchgang --
   die Platte, ein anderer Prozess -- verschiebt ihn nicht. */
function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function timed(fn, runs) {
  fn();                                    // einmal warm, dann gemessen
  const takes = [];
  for (let i = 0; i < runs; i++) {
    const t = process.hrtime.bigint();
    fn();
    takes.push(Number(process.hrtime.bigint() - t) / 1e6);
  }
  return median(takes);
}

function stock(db) {
  const n = db.prepare(`SELECT
      COUNT(*) AS rows,
      SUM(CASE WHEN kind = 'video' THEN 1 ELSE 0 END) AS videos,
      COALESCE(SUM(length(data)), 0) AS data,
      COALESCE(SUM(length(thumb)), 0) AS thumb,
      COALESCE(SUM(length(medium)), 0) AS medium,
      COALESCE(MAX(length(data)), 0) AS biggest
    FROM photos`).get();
  const over = db.prepare(`SELECT
      SUM(CASE WHEN length(data) > 1048576 THEN 1 ELSE 0 END) AS big,
      SUM(CASE WHEN length(data) > 10485760 THEN 1 ELSE 0 END) AS huge
    FROM photos`).get();
  return { ...n, ...over };
}

function main() {
  const args = process.argv.slice(2);
  const at = args.indexOf('--laeufe');
  const runs = at >= 0 ? Math.max(3, Number(args[at + 1]) || 5) : 5;

  const { db, DB_FILE } = require(path.join('..', 'db'));
  const s = stock(db);
  if (!s.rows) {
    console.log('\n  In photos steht keine Zeile. Nichts zu messen.\n');
    return;
  }

  console.log(`\n  ${DB_FILE}\n`);
  console.log('  DER BESTAND');
  console.log(`    Zeilen in photos        ${s.rows}  (davon ${s.videos} Videos)`);
  console.log(`    Originale (data)        ${mb(s.data)}`);
  console.log(`    Kacheln (thumb)         ${mb(s.thumb)}`);
  console.log(`    Mittlere (medium)       ${mb(s.medium)}`);
  console.log(`    Groesstes Original      ${mb(s.biggest)}`);
  console.log(`    Zeilen ueber 1 MB       ${s.big}   ueber 10 MB: ${s.huge}`);

  /* DIE UEBERSICHT liest alle Zeilen. Einmal nur die Spalten vor data,
     einmal die dahinter -- derselbe Bestand, dieselbe Zeilenzahl. */
  const before = db.prepare(`SELECT ${BEFORE} FROM photos ORDER BY item_id, sort_order, id`);
  const after = db.prepare(`SELECT ${BEFORE}, length(thumb) AS t FROM photos ORDER BY item_id, sort_order, id`);
  const tBefore = timed(() => before.all(), runs);
  const tAfter = timed(() => after.all(), runs);

  console.log('\n  ALLE ZEILEN AUF EINMAL — wie die Uebersicht sie holt');
  console.log(`    nur Spalten vor data    ${ms(tBefore)}`);
  console.log(`    mit length(thumb)       ${ms(tAfter)}      ${pct(tAfter, tBefore)}`);
  console.log(`    Unterschied             ${ms(tAfter - tBefore)}`);

  /* DIE EINZELNE KACHEL: derselbe Vergleich je Zeile, ueber den ganzen
     Bestand summiert. length() liest den Wert, gibt aber nur die Zahl aus. */
  const ids = db.prepare('SELECT id FROM photos ORDER BY item_id, sort_order, id').all().map(r => r.id);
  const oneBefore = db.prepare('SELECT length(mime_type) AS n FROM photos WHERE id = ?');
  const oneAfter = db.prepare('SELECT length(thumb) AS n FROM photos WHERE id = ?');
  const tOneBefore = timed(() => { for (const id of ids) oneBefore.get(id); }, runs);
  const tOneAfter = timed(() => { for (const id of ids) oneAfter.get(id); }, runs);

  console.log('\n  ZEILE FUER ZEILE — wie die Kachel geholt wird');
  console.log(`    Spalte vor data         ${ms(tOneBefore)}   (${ms(tOneBefore / ids.length)} je Zeile)`);
  console.log(`    Spalte hinter data      ${ms(tOneAfter)}   (${ms(tOneAfter / ids.length)} je Zeile)`);
  console.log(`    Unterschied             ${ms(tOneAfter - tOneBefore)}`);

  console.log('\n  WAS EINE NEBENTABELLE SPAREN WUERDE');
  console.log(`    je Kachel               ${ms((tOneAfter - tOneBefore) / ids.length)}`);
  console.log(`    ueber den Bestand       ${ms(tOneAfter - tOneBefore)}`);
  console.log(`    Median aus ${runs} Durchgaengen, nach einem Aufwaermlauf.\n`);
}

if (require.main === module) main();
