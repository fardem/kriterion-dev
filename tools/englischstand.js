/* DER ENGLISCHE STAND VON 0.31.2, als Datei daneben -- 0.31.2.

   AUFRUF:
     node tools/englischstand.js

   SIE SCHREIBT tools/englisch-0312.json aus public/languages/en.json:
   Schluessel fuer Schluessel, in der Folge der Datei.

   WOZU. Fuer Deutsch gibt es eine ABNAHME, und die Wortlautprobe im Pruefstand
   haelt de.json dagegen (tools/wording-0681d42.json, Commit 0681d42). Fuer
   Englisch gab es keine -- bis zu dieser Runde, und sie IST sie (Auftrag, F9).
   Was hier entsteht, ist der Vergleichsstand: die naechste Runde sieht daran,
   was sie anfasst, und muss es benennen.

   DER WAECHTER DAZU STEHT IM PRUEFSTAND, Gruppe „Englisch sitzt — 0.31.2",
   Zusage 10. Seine Tafel EG_CHANGED_AFTER_0312 ist LEER: solange sie das ist,
   muss jeder englische Wert Zeichen fuer Zeichen der dieser Runde sein. Wer
   Englisch anfasst, schreibt den Schluessel mit seinem Grund hinein --
   dieselbe Bauform wie die drei Listen der Wortlautprobe. Einen
   Vergleichsstand still nachzuziehen ist damit ein roter Punkt.

   ERZEUGT UND NICHT VON HAND GESCHRIEBEN. Wer die Datei von Hand pflegt,
   pflegt eine zweite Wahrheit. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const values = JSON.parse(fs.readFileSync(
  path.join(root, 'public', 'languages', 'en.json'), 'utf8'));
const out = {
  _hinweis: 'Die WERTE von public/languages/en.json am gebauten Stand von 0.31.2, '
    + 'Schluessel fuer Schluessel und in der Folge der Datei. Fuer Englisch gibt es keine '
    + 'Abnahme wie fuer Deutsch (0681d42) -- DIESE Runde ist sie (Auftrag, F9). Der Waechter '
    + '„Englisch sitzt" im Pruefstand haelt en.json dagegen; wer einen englischen Wert '
    + 'anfasst, traegt ihn in EG_CHANGED_AFTER_0312 ein und sagt, warum. ERZEUGT UND NICHT '
    + 'VON HAND GESCHRIEBEN -- node tools/englischstand.js schreibt sie. WARUM ALS DATEI UND '
    + 'NICHT AUS GIT: eine Gegenprobenkopie entsteht aus git archive und hat kein .git; ein '
    + 'Waechter, der dort abbricht, belegt nichts (Stolpersteine 138, 161, 170).',
  round: '0.31.2',
  values: values
};
const target = path.join(root, 'tools', 'englisch-0312.json');
fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log(`tools/englisch-0312.json geschrieben — ${Object.keys(values).length} Schluessel`);
