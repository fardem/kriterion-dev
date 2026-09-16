#!/usr/bin/env node
/* Zaehlt Kommentarzeilen je Datei und ueber alles.
 *
 *   node tools/comments.js          die Tafel
 *   node tools/comments.js --check  die Zeilen fuer den Pruefstand
 *
 * Eine Zeile zaehlt als Kommentarzeile, sobald sie einen Kommentarteil
 * traegt -- auch `code(); // Hinweis`. Ziel ist 0,25 x Codezeilen; danach
 * stellen die Kommentare 20 Prozent der Datei. */
const fs = require('fs');
const path = require('path');
const { segment, COMMENT } = require('./segments.js');

const ROOT = path.join(__dirname, '..');
const SHIPPED = ['server.js', 'auth.js', 'db.js', 'mail.js', 'keys.js', 'attachments.js',
  'images.js', 'batchrun.js', 'usertool.js', 'twofactor.js', 'keytool.js',
  'public/app.js', 'public/theme.js'];

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
  const comment = marked.size;
  return { file, rows, comment, code: rows - comment, target: Math.round((rows - comment) * 0.25) };
}

const all = sourceFiles().map(measure);
const sum = all.reduce((a, r) => ({ rows: a.rows + r.rows, comment: a.comment + r.comment,
  code: a.code + r.code }), { rows: 0, comment: 0, code: 0 });

if (process.argv[2] === '--check') {
  for (const r of all) console.log(`    ['${r.file}', ${r.comment}],`);
  console.log(`  // ueber alles: ${sum.comment} Kommentarzeilen, ${sum.code} Code, ` +
    `${(sum.comment / sum.rows * 100).toFixed(1)} Prozent`);
} else {
  console.log('Datei'.padEnd(24) + 'Zeilen'.padStart(8) + 'Kommentar'.padStart(11) +
    'Anteil'.padStart(8) + 'Ziel'.padStart(7) + 'kuerzen'.padStart(9));
  for (const r of all.slice().sort((a, b) => b.comment - a.comment))
    console.log(r.file.padEnd(24) + String(r.rows).padStart(8) + String(r.comment).padStart(11) +
      (r.comment / r.rows * 100).toFixed(0).padStart(7) + '%' + String(r.target).padStart(7) +
      String(Math.max(0, r.comment - r.target)).padStart(9));
  console.log('-'.repeat(67));
  console.log(`${all.length} Dateien`.padEnd(24) + String(sum.rows).padStart(8) +
    String(sum.comment).padStart(11) + (sum.comment / sum.rows * 100).toFixed(1).padStart(6) + '%' +
    String(Math.round(sum.code * 0.25)).padStart(7) +
    String(sum.comment - Math.round(sum.code * 0.25)).padStart(9));
}

module.exports = { sourceFiles, measure };
