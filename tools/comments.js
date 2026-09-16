#!/usr/bin/env node
/* Zaehlt die Kommentarzeilen je Datei.
 *
 *   node tools/comments.js          die Tafel
 *   node tools/comments.js --rows   die Zeilen fuer COMMENT_ROWS im Pruefstand
 *
 * Eine Zeile zaehlt, sobald sie einen Kommentarteil traegt -- auch
 * `code(); // Hinweis`. Ziel ist 0,25 mal Codezeilen; danach stellen die
 * Kommentare ein Fuenftel der Datei.
 *
 * Der Pruefstand laedt dieselbe Datei. Zwei Zaehlungen ueber dieselbe Sache
 * liefen auseinander. */
const fs = require('fs');
const path = require('path');
const { segment, COMMENT } = require('./segments.js');

const ROOT = path.join(__dirname, '..');
const SHIPPED = ['server.js', 'auth.js', 'db.js', 'mail.js', 'keys.js', 'attachments.js',
  'images.js', 'batchrun.js', 'usertool.js', 'twofactor.js', 'keytool.js',
  'public/app.js', 'public/theme.js'];

// Der Treiber, die Module in test/, counterproof.js und die dreizehn
// ausgelieferten Dateien. Das Verzeichnis wird gelesen: ein neues Modul ist
// damit von selbst dabei.
function sourceFiles() {
  const bench = fs.readdirSync(path.join(ROOT, 'test'))
    .filter(n => n.endsWith('.js')).sort().map(n => 'test/' + n);
  return ['testbench.js', ...bench, 'counterproof.js', ...SHIPPED];
}

function measure(file) {
  const src = fs.readFileSync(path.join(ROOT, ...file.split('/')), 'utf8');
  const rows = src.split('\n').length;
  const marked = new Set();
  let at = 0;
  for (const part of segment(src, file)) {
    if (part.kind === COMMENT) {
      const from = src.slice(0, at).split('\n').length;
      const to = src.slice(0, at + part.value.length).split('\n').length;
      for (let i = from; i <= to; i++) marked.add(i);
    }
    at += part.value.length;
  }
  const code = rows - marked.size;
  return { file, rows, comment: marked.size, code, target: Math.round(code * 0.25) };
}

function measureAll() {
  const each = sourceFiles().map(measure);
  const rows = each.reduce((n, r) => n + r.rows, 0);
  const comment = each.reduce((n, r) => n + r.comment, 0);
  const code = rows - comment;
  return { each, rows, comment, code, share: comment / rows * 100, target: Math.round(code * 0.25) };
}

/* Traegt die gemessenen Zahlen in den Waechter ein.

   ZWEIMAL GESCHRIEBEN: der erste Durchgang aendert test/selfcheck.js, und
   damit stimmt die Zahl dieser Datei nicht mehr. Der zweite misst nach und
   traegt sie richtig ein. Die Zeilenzahl bleibt dabei gleich -- so viele
   Eintraege wie Dateien, in beiden Durchgaengen.

   MIT PROBE: Zeilenzahl und Zahl der Gruppen muessen vorher und nachher
   gleich sein. Ein Ersatz, der zu weit greift, faellt sonst erst im Lauf auf. */
function writeRows() {
  const where = path.join(ROOT, 'test', 'selfcheck.js');
  const shape = (text) => [text.split('\n').length,
    (text.match(/^  group\(/gm) || []).length].join('/');
  const before = shape(fs.readFileSync(where, 'utf8'));

  const fill = () => {
    const all = measureAll();
    const list = all.each.map(r => `      ['${r.file}', ${r.comment}],`).join('\n');
    const next = fs.readFileSync(where, 'utf8')
      .replace(/(const COMMENT_ROWS = \[)[\s\S]*?(\n {4}\];)/,
        (m, open, close) => `${open}\n${list}${close}`)
      .replace(/const COMMENT_TOTAL = \{ comment: \d+, code: \d+ \};/,
        `const COMMENT_TOTAL = { comment: ${all.comment}, code: ${all.code} };`);
    fs.writeFileSync(where, next);
    return all;
  };
  fill();
  const after = fill();

  const now = shape(fs.readFileSync(where, 'utf8'));
  if (now !== before)
    throw new Error(`Der Ersatz hat zu weit gegriffen: ${before} vorher, ${now} nachher`);
  return after;
}

if (require.main === module) {
  if (process.argv[2] === '--write') {
    const a = writeRows();
    console.log(`eingetragen: ${a.each.length} Dateien, ${a.comment} Kommentarzeilen, ` +
      `${a.code} Code, ${a.share.toFixed(1)} Prozent`);
    process.exit(0);
  }
  const all = measureAll();
  if (process.argv[2] === '--rows') {
    for (const r of all.each) console.log(`    ['${r.file}', ${r.comment}],`);
    console.log(`  // ${all.comment} ueber alles, ${all.code} Code, ${all.share.toFixed(1)} Prozent`);
  } else {
    console.log('Datei'.padEnd(24) + 'Zeilen'.padStart(8) + 'Kommentar'.padStart(11) +
      'Anteil'.padStart(8) + 'Ziel'.padStart(7) + 'kuerzen'.padStart(9));
    for (const r of all.each.slice().sort((a, b) => b.comment - a.comment))
      console.log(r.file.padEnd(24) + String(r.rows).padStart(8) + String(r.comment).padStart(11) +
        (r.comment / r.rows * 100).toFixed(0).padStart(7) + '%' + String(r.target).padStart(7) +
        String(Math.max(0, r.comment - r.target)).padStart(9));
    console.log('-'.repeat(67));
    console.log(`${all.each.length} Dateien`.padEnd(24) + String(all.rows).padStart(8) +
      String(all.comment).padStart(11) + all.share.toFixed(1).padStart(6) + '%' +
      String(all.target).padStart(7) + String(all.comment - all.target).padStart(9));
  }
}

module.exports = { sourceFiles, measure, measureAll, writeRows };
