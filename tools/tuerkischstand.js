/* DER TUERKISCHE STAND VON 0.31.3, als Datei daneben -- 0.31.3.

   AUFRUF:
     node tools/tuerkischstand.js

   SIE SCHREIBT tools/tuerkisch-0313.json aus public/languages/tr.json:
   Schluessel fuer Schluessel, in der Folge der Datei.

   WOZU. Fuer Deutsch gibt es eine ABNAHME, und die Wortlautprobe im Pruefstand
   haelt de.json dagegen (tools/wording-0681d42.json, Commit 0681d42). Fuer
   Englisch hat 0.31.2 denselben Vergleichsstand angelegt
   (tools/englisch-0312.json). Fuer Tuerkisch gab es keinen -- bis zu dieser
   Runde, und sie IST die Abnahme (Auftrag, F10).

   DER WAECHTER DAZU STEHT IM PRUEFSTAND, Gruppe „Tuerkisch sitzt — 0.31.3",
   Zusage 13. Seine Tafel TR_CHANGED_AFTER_0313 ist LEER: solange sie das ist,
   muss jeder tuerkische Wert Zeichen fuer Zeichen der dieser Runde sein. Wer
   Tuerkisch anfasst, schreibt den Schluessel mit seinem Grund hinein --
   dieselbe Bauform wie die drei Listen der Wortlautprobe. Einen
   Vergleichsstand still nachzuziehen ist damit ein roter Punkt.

   ERZEUGT UND NICHT VON HAND GESCHRIEBEN. Wer die Datei von Hand pflegt,
   pflegt eine zweite Wahrheit. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const values = JSON.parse(fs.readFileSync(
  path.join(root, 'public', 'languages', 'tr.json'), 'utf8'));
const out = {
  _hinweis: 'Die WERTE von public/languages/tr.json am gebauten Stand von 0.31.3, '
    + 'Schluessel fuer Schluessel und in der Folge der Datei. Fuer Tuerkisch gab es keine '
    + 'Abnahme wie fuer Deutsch (0681d42) und keinen Vergleichsstand wie fuer Englisch '
    + '(0.31.2) -- DIESE Runde ist beides (Auftrag, F10). Der Waechter „Tuerkisch sitzt" im '
    + 'Pruefstand haelt tr.json dagegen; wer einen tuerkischen Wert anfasst, traegt ihn in '
    + 'TR_CHANGED_AFTER_0313 ein und sagt, warum. ERZEUGT UND NICHT VON HAND GESCHRIEBEN -- '
    + 'node tools/tuerkischstand.js schreibt sie. WARUM ALS DATEI UND NICHT AUS GIT: eine '
    + 'Gegenprobenkopie entsteht aus git archive und hat kein .git; ein Waechter, der dort '
    + 'abbricht, belegt nichts (Stolpersteine 138, 161, 170).',
  round: '0.31.3',
  values: values
};
const target = path.join(root, 'tools', 'tuerkisch-0313.json');
fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log(`tools/tuerkisch-0313.json geschrieben — ${Object.keys(values).length} Schluessel`);
