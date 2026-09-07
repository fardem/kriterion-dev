// Schreibt Doku/Namenswoerterbuch_0_24_1.md aus tools/dictionary.json.
// EINE QUELLE: das Papier wird erzeugt und nicht von Hand gepflegt -- zwei
// Listen ueber dieselbe Sache duerfen sich nicht widersprechen.
const fs = require('path') && require('fs');
const path = require('path');
const wurzel = path.join(__dirname, '..');
const d = JSON.parse(fs.readFileSync(path.join(wurzel, 'tools/dictionary.json'), 'utf8'));

const zeilen = [];
const p = (s = '') => zeilen.push(s);

const tabelle = (kopf, paare) => {
  p('| ' + kopf.join(' | ') + ' |');
  p('|' + kopf.map(() => '---').join('|') + '|');
  for (const [a, b] of paare) p(`| \`${a}\` | \`${b}\` |`);
  p();
};

p('# Namenswörterbuch 0.24.1 — deutsch → englisch');
p();
p('**Die eine Liste, aus der jeder Bauabschnitt dieser Runde liest.** Sie ist');
p('beschlossen, bevor der erste Name fällt (Auftrag, Bauabschnitt 0), und wer');
p('einen Namen findet, den sie nicht kennt, trägt ihn hier nach — nicht');
p('nebenbei im Code.');
p();
p('> **DIESES BLATT WIRD ERZEUGT UND NICHT VON HAND GESCHRIEBEN.** Die Quelle');
p('> ist `tools/dictionary.json`; `node tools/dictionary-doc.js` schreibt das');
p('> Blatt daraus. **Denselben Weg lesen der Migrationsblock in `db.js` und die');
p('> Wächter im Prüfstand** — aus derselben Datei und nicht aus einer zweiten');
p('> (Auftrag, Bauabschnitt 6). *Ein Papier, das man neben der Liste pflegen');
p('> muss, läuft ihr davon.*');
p();
p('**Die Regel, nach der hier benannt wird, steht im Auftrag unter 0.2 und hat');
p('einen Namen: gesunder Menschenverstand.** Ein Name muss SINNVOLL sein; unter');
p('den sinnvollen nimmt man den kürzesten. **Die Wörter stehen ausgeschrieben');
p('da** (F3, 6. September 2026): ein eingebürgertes Fachwort darf im Namen');
p('stehen, wo es die Sache *ist* — `2FA`, `URL`, `ID`, `API`, `CSV` —, ein Wort');
p('wird nie zu einem Kürzel verkürzt. **Und der Namensraum zählt mit:** was');
p('links vom Punkt steht, wird rechts davon nicht wiederholt.');
p();
p('---');
p();
p('## 1. Die Wörter — nach der Sache, nicht Wort für Wort');
p();
p(`**${Object.keys(d.words).length} Paare.** Sie tragen die Sache und nicht die Grammatik: wer`);
p('`zeichneZugaenge` liest, findet `zeichne → draw` und `zugaenge → users` und');
p('schreibt `drawUsers`. *`items` in der Datenbank und in `/api/items` heißt');
p('schon so und bleibt — der Bestand ist älter als dieses Blatt.*');
p();
const worte = Object.entries(d.words);
const spalten = 3;
const jeSpalte = Math.ceil(worte.length / spalten);
p('| deutsch | englisch | deutsch | englisch | deutsch | englisch |');
p('|---|---|---|---|---|---|');
for (let i = 0; i < jeSpalte; i++) {
  const z = [];
  for (let s = 0; s < spalten; s++) {
    const e = worte[s * jeSpalte + i];
    z.push(e ? '`' + e[0] + '`' : '', e ? '`' + e[1] + '`' : '');
  }
  p('| ' + z.join(' | ') + ' |');
}
p();
p('## 2. Die Namensräume der Sprachdatei');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.namespaces));
p('*Und das Verzeichnis heißt `public/languages/`; die Dateien behalten ihren');
p('ISO-Code (`de.json`).*');
p();
p('## 3. Die Dateien, die Code enthalten');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.files));
p('## 4. Die Umgebungsvariablen');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.env));
p('**Die Variablen, die in der `.env` eines Betreibers stehen, werden weiter');
p('gelesen** — der alte Name gilt als Rückfall und schreibt eine Zeile ins');
p(`Containerprotokoll: ${d.envFallback.map(v => '`' + v + '`').join(' · ')}.`);
p();
p('## 5. Die Adressen');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.routes));
p('**Die Abschnitte des Systembereichs** (`#/system/…`):');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.sysSections));
p('**Jede alte Adresse wird übersetzt und nicht fallen gelassen** — ein');
p('Einladungslink aus einer verschickten Mail zeigt auf `#/einladung/…`.');
p();
p('## 6. Die API-Wurzeln');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.api));
p('**Hart umbenannt, ohne Altwege** (F5): der einzige Rufer ist');
p('`public/app.js`, und der zieht in derselben Runde mit.');
p();
p('**Und die Abschnitte HINTER der Wurzel** — `/api/backup/dir`,');
p('`/api/items/:id/votes`:');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.apiSegments));
p('## 6a. Die Gestaltnamen der Oberfläche');
p();
p(`**${Object.keys(d.gestalt.vars).length} Stilblattvariablen, ${Object.keys(d.gestalt.ids).length} ids, ${Object.keys(d.gestalt.klassen).length} Klassen** (F6). Sie sind`);
p('nirgends nach außen sichtbar — kein Lesezeichen, kein Export, keine');
p('Schnittstelle hängt daran; deshalb ziehen sie ohne Rückfall um.');
p();
p('### Die Stilblattvariablen und die Bildfolgen');
p();
tabelle(['heute', 'ab 0.24.1'], [...Object.entries(d.gestalt.vars), ...Object.entries(d.gestalt.keyframes)]);
p('### Die ids');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.gestalt.ids));
p('### Die Klassen');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.gestalt.klassen));
p('## 7. Die Datenbank');
p();
p('### 7.1 Tabellen');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.tables));
p('### 7.2 Spalten');
p();
tabelle(['heute', 'ab 0.24.1'], Object.entries(d.columns).map(([k, v]) => [k, k.split('.')[0] + '.' + v]));
p('### 7.3 Die gespeicherten Werte');
p();
for (const [gruppe, paare] of Object.entries(d.values)) {
  p(`**\`${gruppe}\`**`);
  p();
  tabelle(['heute', 'ab 0.24.1'], Object.entries(paare));
}
p('**Der Migrationsblock liest diese Liste**, und der Import übersetzt alte');
p('Exportdateien beim Einlesen mit derselben (F2).');
p();
p('## 8. Wie ein Wort gezählt wird');
p();
p('**Die Latte zählt die Teile eines Namens in Höckerschrift** — `saveTitle`');
p('sind zwei. **Ein Fachwort, das aus zwei Teilen besteht und EINE Sache');
p('benennt, zählt als eins:**');
p();
p(d.begriffe.map(b => '`' + b + '`').join(' · '));
p();
p('*Sie stehen namentlich da und nicht als Regel: eine Regel „Zusammensetzungen');
p('zaehlen als eins" liesse jeden Namen durch.*');
p();
p('**UND EINE AUSNAHME, DIE KEIN NAME IST, SONDERN EIN ORT:** ' + d.vokabularAusnahme);
p();
p('## 9. Zwei deutsche Wörter, ein englisches');
p();
p('**Das Wörterbuch trägt EINE Übersetzung je Wort.** Wo zwei deutsche Wörter');
p('auf dasselbe englische zeigen, fällt eines von beiden aus, sobald sich die');
p('zwei im selben Geltungsbereich begegnen — im günstigen Fall bricht der Lauf');
p('mit `Identifier has already been declared` ab, im ungünstigen verdeckt der');
p('eine still den anderen. **Hier steht, welches Wort ausweicht und wohin.**');
p();
p('| deutsche Wörter | beide wollen | das ausweichende | warum |');
p('|---|---|---|---|');
for (const g of d.gleichlaut) p(`| ${g.woerter} | \`${g.gemeinsam}\` | ${g.ausweich} | ${g.grund} |`);
p();
p('## 10. Die Namen über der Latte — mit Begründung');
p();
if (!d.exceptions.length) {
  p('*Noch keiner. Die Latte (drei Wörter, 24 Zeichen) weist nichts ab; wer über');
  p('sie hinausmuss, trägt den Namen hier mit einem Satz ein, und die Kürzeprobe');
  p('zählt sie.*');
} else {
  p('| Name | warum er länger sein muss |');
  p('|---|---|');
  for (const e of d.exceptions) p(`| \`${e.name}\` | ${e.grund} |`);
}
p();

fs.writeFileSync(path.join(wurzel, 'Doku/Namenswoerterbuch_0_24_1.md'), zeilen.join('\n'));
console.log('Doku/Namenswoerterbuch_0_24_1.md geschrieben:',
  Object.keys(d.words).length, 'Wortpaare,', d.exceptions.length, 'begruendete Ausnahmen');
