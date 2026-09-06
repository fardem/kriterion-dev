/* DIE PROBE DES UMBENENNERS -- gefahren, nicht nur geschrieben.
   Jede Zusicherung hat hier ihre Gegenprobe: erst wird gezeigt, dass das
   Werkzeug den Fall richtig macht, dann, dass die Probe den falschen Fall
   FAENGT. Eine stumme Gegenprobe ist ein Fund. */
const { ersetzeIdent, ersetzeString, ersetzeInString } = require('./rename.js');
const { zerlege, zusammen, texte } = require('./segments.js');

let ok = 0, fehler = [];
const ist = (name, a, b) => { if (a === b) ok++; else fehler.push(`${name}\n    erwartet: ${JSON.stringify(b)}\n    bekommen: ${JSON.stringify(a)}`); };
const wirft = (name, f) => { try { f(); fehler.push(`${name}: haette werfen muessen`); } catch { ok++; } };

// 1. Wortgrenze
ist('wert ersetzt nicht die Haelfte von wertung',
  ersetzeIdent('const wert = 1; const wertung = 2;', 'p.js', { wert: 'value' }).text,
  'const value = 1; const wertung = 2;');

// 2. Ein Name in einem Text bleibt stehen
ist('der Text bleibt',
  ersetzeIdent("const wert = 'wert';", 'p.js', { wert: 'value' }).text,
  "const value = 'wert';");

// 3. Ein Name in einem Kommentar bleibt stehen
ist('der Kommentar bleibt',
  ersetzeIdent('// wert\nconst wert = 1;', 'p.js', { wert: 'value' }).text,
  '// wert\nconst value = 1;');

// 4. In der Vorlage: der feste Teil bleibt, der Ausdruck zieht mit
ist('Vorlage: Text bleibt, Ausdruck zieht mit',
  ersetzeIdent('const s = `wert ${wert}`;', 'p.js', { wert: 'value' }).text,
  'const s = `wert ${value}`;');

// 5. Ein regulaerer Ausdruck bleibt stehen
ist('der regulaere Ausdruck bleibt',
  ersetzeIdent('const re = /wert/g; const wert = 1;', 'p.js', { wert: 'value' }).text,
  'const re = /wert/g; const value = 1;');

// 6. Eine Division ist kein regulaerer Ausdruck
ist('Division bleibt Division',
  ersetzeIdent('const q = wert / 2; const wert = 1;', 'p.js', { wert: 'value' }).text,
  'const q = value / 2; const value = 1;');

// 7. DER FEHLGRIFF AUS 0.24.0: 'sw-test-t' darf nicht mitgehen
ist('getElementById(\'sw-test-t\') bleibt unberuehrt',
  ersetzeIdent("const t = document.getElementById('sw-test-t');", 'p.js', { t: 'translate' }).text,
  "const translate = document.getElementById('sw-test-t');");

// 8. Der Bereich: nur die Zeilen von…bis
ist('der Bereich begrenzt',
  ersetzeIdent('const wert = 1;\nconst wert2 = wert;\n', 'p.js', { wert: 'value' }, { vonZeile: 1, bisZeile: 1 }).text,
  'const value = 1;\nconst wert2 = wert;\n');

// 9. Eine ganze Zeichenkette umbenennen
ist('die ganze Zeichenkette',
  ersetzeString("t('karte.titelSpeichern')", 'p.js', { 'karte.titelSpeichern': 'card.saveTitle' }).text,
  "t('card.saveTitle')");

// 10. …und nur die ganze, nicht ein Stueck davon
ist('kein Stueck einer Zeichenkette',
  ersetzeString("t('karte.titelSpeichernUndMehr')", 'p.js', { 'karte.titelSpeichern': 'card.saveTitle' }).text,
  "t('karte.titelSpeichernUndMehr')");

// 11. Ein Wort INNERHALB von Zeichenketten
ist('ein Wort in der Zeichenkette',
  ersetzeInString('el.className = "zug-name box"; const zugName = 1;', 'p.js', { 'zug-name': 'user-name' }).text,
  'el.className = "user-name box"; const zugName = 1;');

// 12. …auf Wortgrenzen, auch ueber den Bindestrich
ist('kein Teilstueck ueber den Bindestrich',
  ersetzeInString('x = "zug-name-lang";', 'p.js', { 'zug-name': 'user-name' }).text,
  'x = "zug-name-lang";');

// --- DIE GEGENPROBEN ------------------------------------------------------
// 13. DIE PROBE SELBST -- sie schweigt bei Gleichem und schlaegt bei Ungleichem
const { probeGleich } = require('./rename.js');
ist('die Probe schweigt, wenn die Texte dieselben sind',
  (() => { probeGleich(new Map([['a', 2]]), new Map([['a', 2]]), 'Texte', 'p.js'); return 'still'; })(), 'still');
wirft('die Probe schlaegt, wenn ein Text verschwindet',
  () => probeGleich(new Map([['a', 2]]), new Map([['a', 1]]), 'Texte', 'p.js'));
wirft('die Probe schlaegt, wenn ein Text dazukommt',
  () => probeGleich(new Map([['a', 1]]), new Map([['a', 1], ['b', 1]]), 'Texte', 'p.js'));

// 14. UND SIE FAENGT DEN FEHLGRIFF AUS 0.24.0, wenn man ihn von Hand macht:
//     ein Suchen-und-Ersetzen ueber die ganze Datei trifft die Zeichenkette.
wirft('die Probe faengt das Suchen-und-Ersetzen ueber die ganze Datei', () => {
  const src = "const t = 1; const el = document.getElementById('sw-test-t');";
  const falsch = src.replace(/\bt\b/g, 'translate');
  probeGleich(texte(zerlege(src, 'p.js')), texte(zerlege(falsch, 'p.js')), 'Zeichenketten', 'p.js');
});

// 15. Die Zerlegung ist verlustfrei
for (const s of ['const a = `x${`y${z}`}w`;', "const r = /[/]/g;", 'a /= 2; // /nicht/', "x = 'a\\'b';"]) {
  ist('verlustfrei: ' + s, zusammen(zerlege(s, 'p.js')), s);
}

console.log(`${ok} Proben bestanden`);
if (fehler.length) { console.error('\nFEHLER:\n  ' + fehler.join('\n  ')); process.exit(1); }
