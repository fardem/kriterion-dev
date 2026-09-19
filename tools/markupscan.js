#!/usr/bin/env node
/* Kriterion — zaehlt, welcher Bestandstext nach den Regeln der Auszeichnung
   anders aussieht. Je Regel getrennt, mit der Nummer des Eintrags. */
const fs = require('fs');
const path = require('path');

/* GELESEN WIRD DER LESER SELBST und keine Abschrift: der Abschnitt aus
   public/app.js wird herausgeschnitten und hier ausgefuehrt. */
const APP = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
const FROM = APP.indexOf('/* ================= Auszeichnung ================= */');
const TO = APP.indexOf('\nfunction markupPlain(');
if (FROM < 0 || TO < 0) {
  console.error('Der Abschnitt der Auszeichnung steht nicht in public/app.js.');
  process.exit(2);
}
const reader = new Function(APP.slice(FROM, TO)
  + '\nreturn { markupParse, markupInline };')();

/* Die acht Bauformen der Teilmenge. Eine Regel „greift", wenn der Baum an
   dieser Stelle etwas anderes traegt als gewoehnlichen Text. */
const RULES = [
  ['fett', 'strong'], ['kursiv', 'em'], ['Link mit Namen', 'link'],
  ['Code', 'code'], ['Zitat', 'quote'], ['Aufzaehlung', 'bullet'],
  ['Nummerierung', 'number'], ['Escape', 'escape']
];

function inlineKinds(parts, found) {
  for (const p of parts) {
    if (p.type === 'text') {
      if (p.raw !== undefined && p.raw !== p.text) found.add('escape');
      continue;
    }
    found.add(p.type);
    if (p.children) inlineKinds(p.children, found);
  }
}

function blockKinds(blocks, found) {
  for (const b of blocks) {
    if (b.type === 'text') { inlineKinds(reader.markupInline(b.lines.join('\n')), found); continue; }
    found.add(b.type);
    if (b.type === 'quote') { blockKinds(b.blocks, found); continue; }
    for (const item of b.items) blockKinds(item, found);
  }
}

const kindsOf = (text) => {
  const found = new Set();
  blockKinds(reader.markupParse(text), found);
  return found;
};

function main() {
  const { db } = require(path.join('..', 'db'));
  const rows = [
    ...db.prepare('SELECT id, item_id AS entry, text AS body FROM comments').all()
      .map(r => ({ ...r, where: 'Kommentar' })),
    ...db.prepare("SELECT id, id AS entry, description AS body FROM items WHERE description <> ''").all()
      .map(r => ({ ...r, where: 'Beschreibung' }))
  ];
  const hits = new Map(RULES.map(([, key]) => [key, []]));
  let touched = 0;
  for (const row of rows) {
    const found = kindsOf(row.body || '');
    if (!found.size) continue;
    touched++;
    for (const key of found) if (hits.has(key)) hits.get(key).push(row);
  }
  console.log(`\nKriterion — Bestandstext und die Auszeichnung`);
  console.log(`  ${rows.length} Texte gelesen, ${touched} saehen anders aus.\n`);
  for (const [name, key] of RULES) {
    const list = hits.get(key);
    console.log(`  ${String(list.length).padStart(5)}  ${name}`);
    for (const row of list.slice(0, 20))
      console.log(`         ${row.where} ${row.id} an Eintrag ${row.entry}`);
    if (list.length > 20) console.log(`         … und ${list.length - 20} weitere`);
  }
  console.log('');
}

if (require.main === module) main();
module.exports = { kindsOf };
