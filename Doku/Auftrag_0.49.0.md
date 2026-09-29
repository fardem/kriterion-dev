# Auftrag 0.49.0 — „Dateien: Liste, Vorschaubilder für Dokumente, Ordner eingefasst“

**Erteilt am 29. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. Grundlage ist der Abschnitt 0.49.0 in `Doku/Fahrplan.md`.
Die Fragen aus Abschnitt 0 sind vor der ersten Zeile Code in drei
Fragetafeln gestellt und beantwortet worden, zwei weitere beim Schreiben
dieses Auftrags.

Zeilennummern gelten für `1edf98f` (0.48.0).

---

## 0. Vor dem Bau: die offenen Fragen

| Nr. | Frage | Antworten | Empfehlung | Antwort |
|---|---|---|---|---|
| E1 | Welche Spalten zeigt die Liste? | a) Rechner: Zeichen, Name, Art, Größe, Datum, Von (nur bei mehreren Accounts), ⋯; Telefon: Zeichen, Name, darunter Größe · Datum, ⋯ · b) fünf überall gleich, ohne Art und Von · c) wie a), am Telefon nur Zeichen, Name, Größe, ⋯ | a) | **a)** |
| E2 | Wie ist die Liste sortiert? | a) feste Reihenfolge wie die Kacheln · b) Spaltenkopf sortiert, die Kacheln folgen, je Account gespeichert · c) Spaltenkopf nur in der Liste, nicht gespeichert | a): beide Ansichten zeigen dieselbe Reihenfolge | **a)** |
| E3 | Wo gilt die Wahl zwischen Kacheln und Liste? | a) je Account, Schlüssel `filesView` in `user_settings` · b) je Eintrag · c) nur im Browser | a): wie die Anordnung der Blöcke | **a)** |
| E4 | Wie stehen Ordner in der Liste? | a) Kopfzeile je Gruppe wie bei den Kacheln · b) Baum mit ▸ und ▾ | a) | **a)** |
| E5 | Wo öffnet die Vorschau in der Liste? | a) unter der Gruppe · b) unter der Zeile | a): der Betrachter wird nie verschoben und lädt nicht neu | **a)** |
| E6 | Wann entsteht das Vorschaubild eines Dokuments? | a) automatisch beim Hochladen und im Hintergrund für vorhandene Dateien, kein Knopf · b) wie a), dazu „Vorschaubild neu erzeugen“ · c) wie a), dazu ein eigenes Bild · d) nur über einen Knopf | a) | **a)** |
| E7 | Wie entsteht das Bild für Text, Markdown und CSV? | a) die ersten Zeilen als SVG über `sharp`, das Image bekommt `fonts-dejavu-core` · b) über den Document Server · c) kein Bild | a): ohne Schrift im Image zeichnet `sharp` nur Kästchen (geprüft mit leerer Fontconfig) | **a)** |
| E8 | Wo liegt das Vorschaubild? | a) in `attachment_thumbs`, nicht in Papierkorb und Export · b) wie das Standbild eines Videos, Format 23 | a): kein neues Schema, Format 22 bleibt | **a)** |
| E9 | Welche Form bekommt ein Ordner? | a) Karte wie bei Homarr · b) gestrichelte Linie wie im Baum · c) beides | a) | **a)** |
| E10 | Werden die Dateien ohne Ordner eingefasst? | a) nein · b) ja, eigene Karte ohne Kopf | a) | **b)** |
| E11 | Welche Farben bekommt die Karte? | a) Rahmen `--line`, Fläche `--surface-2` · b) Fläche `--bg` · c) Rahmen in Akzentfarbe | a): beide Themen haben die Werte | **a)** |
| E12 | Welche Ansicht zeigt ein Account ohne eigene Wahl? | a) Kacheln · b) Liste | a): für bestehende Accounts ändert sich nichts | **a)** |
| E13 | Bekommt die Liste eine Kopfzeile mit Spaltennamen? | a) nein · b) eine Kopfzeile über allen Karten | a): sortiert wird nicht | **a)** |
| E14 | Wie kommt ein Vorschaubild aus dem Hintergrund in die offene Ansicht? | a) der Browser fragt nach 3, 6, 12 und 24 s nach · b) erst beim nächsten Öffnen | a) | **a)** |

---

## 1. Das Ziel

- Im Kopf des Blocks „Dateien“ steht neben „Ordner hinzufügen“ ein Umschalter
  „Kacheln“ und „Liste“. Die Wahl gilt je Account in allen Einträgen.
- Die Liste zeigt eine Zeile je Datei, in derselben Reihenfolge und denselben
  Gruppen wie die Kacheln. Klick, Menü ⋯, Vorschau, Vollbild, Hochladen,
  Ablegen und Tastatur verhalten sich gleich.
- Dokumente bekommen ein Vorschaubild. Text, Markdown und CSV immer, Office
  und PDF mit eingeschaltetem Document Server. Die Endung steht über dem Bild.
- Jeder Ordner und die Dateien ohne Ordner stehen in einer Karte mit Rahmen,
  runden Ecken und eigener Fläche. Ein zugeklappter Ordner ist eine Leiste.

---

## 2. Der Anlass

| Anlass | Stand am 29. September 2026 |
|---|---|
| Nur Kacheln | Der Block baut Kacheln (`newTile()`, `app.js:6800`; `fillTile()`, `:6827`); `drawAtts()` (`:7032`) setzt sie in je ein `ul.agrid` je Gruppe |
| Endung statt Bild | Ein Bild hat die Kachel nur bei Bilddateien und Videos mit Standbild (`fillFileTile()`, `app.js:6863`); `sendFileTile()` (`server.js:4148`) antwortet für alles andere mit 404 |
| Document Server | `converter()` (`docserver.js:211`) wandelt nur für den Editor um; der Abruf `GET /api/document-server/attachments/:id` (`server.js:822`) liefert nur Office-Dateien, kein PDF |
| Schrift im Image | `node:22-bookworm-slim` (`Dockerfile:17`) hat keine Schrift; `sharp` zeichnet Text in SVG dort als Kästchen |
| Ordner | `.afolder-body` rückt um 18 px ein (`style.css:1801`); zugeklappt ist ein Ordner eine Zeile ohne Rahmen |
| Persönliche Einstellungen | `PICK_SETTINGS` (`server.js:1674`) und `PERSONAL_KEYS` (`:451`) |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

Die Antworten E1 bis E14 aus Abschnitt 0, alle vom 29. September 2026.

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.49.0**, MINOR. Schema: nein. Austauschformat: bleibt 22. Keine neue Route |
| Einstellung | `filesView` in `PICK_SETTINGS` mit `tiles` und `list`, Vorgabe `tiles`; in `PERSONAL_KEYS`, in `GET` und `PUT /api/settings`. Ein falscher Wert: 400 mit `server.filesViewUnknown` |
| Umschalter | zwei Knöpfe mit `aria-pressed` im Blockkopf; ein Klick zeichnet sofort und speichert danach; scheitert das Speichern, bleibt die Ansicht und eine Meldung erscheint |
| Liste | dieselben `li`-Elemente wie die Kacheln, eine Klasse am Block schaltet die Darstellung; die Spalten stehen als eigene `span` in jeder Kachel und sind in der Kachelansicht verborgen. „+“ wird die Zeile „Datei hinzufügen“ mit der Grenze |
| Spalten | Art ist die Endung in Großbuchstaben, Datum das Datum des Uploads (`created_at`), Von nur bei mehreren Accounts wie heute |
| Zeichen in der Liste | das Vorschaubild auf 32 px, sonst die Endung; Upload-Zustand wie auf der Kachel |
| Karten | `.agroup` wird Karte: Rahmen `1px solid var(--line)`, Radius 10 px, Fläche `--surface-2`; die Fläche der Kachelbilder darin `--surface`. Die Karte ohne Ordner hat keinen Kopf. Ablegen über einer Karte färbt ihren Rahmen in der Akzentfarbe |
| Welche Dateien ein Vorschaubild bekommen | Text: die Endungen aus `TEXT_EXTENSIONS` (`attachments.js:24`). Über den Document Server: die Endungen aus `OFFICE_TYPES` (`docserver.js:9`) und `pdf` |
| Text | die ersten 4096 Bytes, höchstens 14 Zeilen zu 32 Zeichen, Tabulator als vier Leerzeichen, Steuerzeichen entfernt, XML maskiert; `DejaVu Sans Mono` auf weißer Fläche 512 × 512; beim Hochladen in einer Anfrage sofort, sonst in der Warteschlange |
| Office und PDF | `converter()` mit `outputtype: 'png'` und `thumbnail: { aspect: 1, first: true, width: 512, height: 724 }`; Schlüssel `tile-` + `documentKey(a, 'v' + saves)`. Das PNG geht durch `fileTile()` wie eine Bilddatei |
| Warteschlange | eine Umwandlung nach der anderen; frische Dateien vor dem Nachholen. Nachgeholt wird beim Start, stündlich und nach Einschalten des Document Servers |
| Fehler | Antwortet der Document Server mit `-3`, `-5`, `-9` oder `-10`, steht `NULL` in `attachment_thumbs` und die Kachel zeigt die Endung. Andere Fehler, Zeitüberschreitung und fehlende Verbindung schreiben nichts; die Datei kommt beim nächsten stündlichen Lauf wieder dran |
| Neuer Inhalt | Speichern aus dem Document Server und „Vorige Fassung wiederherstellen“ löschen die Zeile in `attachment_thumbs` und stellen die Datei in die Warteschlange |
| An den Browser | `thumb`: Länge des Vorschaubilds, der Browser hängt sie als `v=` an; `thumbSoon: true`, solange eines erwartet wird. Beides nur für Dokumente |
| Nachladen | Solange eine Datei `thumbSoon` trägt und der Eintrag offen ist, holt der Browser `GET /api/items/:id` nach 3, 6, 12 und 24 s und übernimmt die Dateien |
| Abruf durch den Document Server | `GET /api/document-server/attachments/:id` liefert auch PDF aus |
| Endung über dem Bild | kleines Schild oben links auf dem Bild, in der Liste nicht; das Bild steht oben bündig (`object-position: top`) |

---

## 4. Die Bauabschnitte

### BA 1 — Einstellung `filesView`

- `PICK_SETTINGS.filesView`, `PERSONAL_KEYS`, `take('filesView')` in
  `PUT /api/settings`, `filesView` in beiden Antworten.
- Neuer Text `server.filesViewUnknown` in drei Sprachen.

### BA 2 — Umschalter und Liste

- Umschalter im Blockkopf, Texte `entry.filesTiles`, `entry.filesList`,
  `entry.filesView` (Name der Gruppe für Screenreader).
- Neue `span` je Kachel: `.akind`, `.asize`, `.adate`, `.afrom`. `fillTile()`
  füllt sie. Die Klasse `alist` am Block schaltet auf Zeilen.
- Zeilen am Rechner als Grid mit festen Spalten; am Telefon zwei Zeilen.
- Mindesthöhe 44 px, Fokusrahmen wie heute, Menü ⋯ am Ende der Zeile.
- Vorschau, Vollbild, Hochladen, Ablegen und Tastatur ohne neuen Code.

### BA 3 — Karten

- Die Gruppe ohne Ordner und jeder Ordner als Karte; zugeklappt nur der Kopf.
- Die Einrückung `.afolder-body` entfällt; Abstand zwischen den Karten 10 px.
- `.afolder.lit` und `.afolder.over` am Rahmen der Karte.
- Hell und dunkel mit den vorhandenen Variablen.

### BA 4 — Vorschaubilder auf dem Server

- `docTileKind()`, `textTile()`, `docserver.firstPage()`, Warteschlange
  `docTilesSoon()` mit Lauf beim Start, stündlich und nach dem Einschalten.
- `sendFileTile()` liefert gespeicherte Vorschaubilder von Dokumenten aus und
  erzeugt sie nie beim Abruf.
- `qAttachments` mit `length(t.thumb)` und der Frage, ob eine Zeile besteht;
  `detail()` mit `thumb` und `thumbSoon`.
- Löschen der Zeile beim Speichern aus dem Document Server und beim Tausch
  mit der vorigen Fassung, auf der Platte wie in der Datenbank.
- Der Abruf durch den Document Server nimmt PDF an.

### BA 5 — Vorschaubild im Browser

- `fileTileSource()` hängt `thumb` als `v=` an; Dokumente mit `thumb` zeigen
  das Bild, darüber die Endung.
- Nachladen nach E14; der Zeitgeber endet mit dem Verlassen des Eintrags.

### BA 6 — Dockerfile

- Die zweite Stufe installiert `fonts-dejavu-core` mit
  `--no-install-recommends`; die Paketlisten werden danach gelöscht.

### BA 7 — Texte

Deutsch, Englisch, Türkisch für: den Umschalter, die Zeile „Datei
hinzufügen“ in der Liste, `server.filesViewUnknown`. Englisch und Türkisch
höchstens 15 % länger als Deutsch.

### BA 8 — Der Prüfstand

Neues Modul `test/release_049.js`, eingetragen hinter `release_048`.

- `filesView`: Vorgabe, Speichern, falscher Wert, fremder Account.
- Text: Kachel entsteht beim Hochladen in einer Anfrage und in Stücken; das
  Bild ist WebP und nicht leer; Steuerzeichen und `<` im Text.
- Office und PDF mit einem Mock des Document Servers: Umwandlung mit
  `outputtype: 'png'`, `thumb` im Eintrag, `thumbSoon` davor; Fehler `-3`
  schreibt `NULL`, Fehler `-4` schreibt nichts; ohne Document Server kein
  `thumbSoon`; nach dem Speichern aus dem Editor neu.
- Der Abruf des Document Servers liefert PDF.
- Browser mit jsdom: Umschalter, Klasse `alist`, gespeicherte Wahl, Spalten,
  Karte ohne Ordner, Nachladen.
- Jede Zusage bekommt einen Rückbau in `counterproof.js`.

**Was mitgeht:** Zählungen in `test/source.js` und `test/selfcheck.js`
(Rückbauten, Kommentarwächter, Regelzeilen des Stilblatts), Tests, die die
Umwandlungen des Document Servers zählen (`test/release_043.js`).

### BA 9 — Dokumentation und Zahlen

- **`README.md`:** Funktionen; der Document Server erzeugt Vorschaubilder.
- **`manual-de.md`:** Block „Dateien“ mit Kacheln und Liste, Karten,
  Vorschaubilder.
- **`CHANGELOG.md`:** `## [0.49.0]`; der Kasten nennt das neue Paket im Image.
- **`Doku/Aenderungsprotokoll_0.49.0.md`** mit den Zahlen am fertigen Stand.
- **`Doku/Fahrplan.md`:** Zeile 0.49.0 durchstreichen und füllen.
- **`package.json`** auf `0.49.0`, `package-lock.json` mit.
- **Der Fingerprint** mit `node tools/publish.js --trocken`.

---

## 5. Abnahme im Betrieb

1. Umschalten zwischen Kacheln und Liste am Rechner und am Telefon; die Wahl
   gilt nach dem Neuladen und auf einem zweiten Gerät.
2. In der Liste: Vorschau eines PDF, Vollbild eines Bildes, Menü ⋯, Hochladen
   über „Datei hinzufügen“ und durch Ablegen auf eine Karte.
3. Eine `.docx`, eine `.xlsx`, eine `.pptx` und ein PDF hochladen: Das
   Vorschaubild erscheint ohne Neuladen. Ob der Document Server ein PDF
   umwandelt, zeigt dieser Schritt.
4. Eine `.md` und eine `.csv` ohne Document Server hochladen.
5. Eine `.docx` im Document Server bearbeiten: Das Vorschaubild zeigt danach
   den neuen Stand.
6. Karten im hellen und im dunklen Thema; zugeklappter Ordner als Leiste.
7. Nur mit Tastatur und mit einem Screenreader: Umschalter, Liste, Menü.
8. Das Image bauen: `fonts-dejavu-core` ist installiert, die Textvorschau
   zeigt Buchstaben.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Sortieren über den Spaltenkopf | E2 |
| Ein eigenes Bild oder eine andere Seite als Vorschaubild | E6 |
| Vorschaubilder im Export und im Papierkorb | E8 |
| Vorschaubilder für Dateien ohne Document Server außer Text | Fahrplan |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Kein neues Schema, keine neue Route, das Austauschformat bleibt 22.
3. Die Kommentarregel gilt: höchstens drei Zeilen je Block, nie mehr Kommentar
   als Code, keine Versionsnummer, kein Verweis auf `Doku/`.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Kommt eine Frage auf, die hier nicht beantwortet ist, wird sie als
   Fragetafel gestellt. Antwortet niemand, gilt der einfachere Weg, der kein
   Verhalten ändert. Die Entscheidung steht im Änderungsprotokoll.
