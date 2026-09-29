# Änderungsprotokoll 0.49.0 — „Dateien: Liste, Vorschaubilder für Dokumente, Ordner eingefasst“

**Gebaut am 29. September 2026 auf 0.48.0. Fingerprint `FINGERPRINT`, davor
`e480ecfc`.**

Nach `Doku/Auftrag_0.49.0.md` und dem Eintrag 0.49.0 im Fahrplan. Schema: nein.
Austauschformat: bleibt 22. Keine neue Route. Neu ist der persönliche
Schlüssel `filesView`; das Image bekommt `fonts-dejavu-core`.

---

## 1. Vorgaben des Betreibers

Die Fragetafeln sind vor der ersten Zeile Code beantwortet worden, E13 und E14
beim Schreiben des Auftrags.

| Datum | Vorgabe |
|---|---|
| 29. September 2026 | E1 a): Liste am Rechner mit Zeichen, Name, Art, Größe, Datum, Von (nur bei mehreren Accounts) und ⋯; am Telefon Zeichen, Name, darunter Größe · Datum, und ⋯ |
| 29. September 2026 | E2 a): feste Reihenfolge wie die Kacheln, kein Sortieren |
| 29. September 2026 | E3 a): die Wahl gilt je Account, Schlüssel `filesView` in `user_settings` |
| 29. September 2026 | E4 a): Ordner in der Liste als Kopfzeile je Gruppe wie bei den Kacheln |
| 29. September 2026 | E5 a): die Vorschau öffnet unter der Gruppe |
| 29. September 2026 | E6 a): Vorschaubilder automatisch beim Hochladen und im Hintergrund für vorhandene Dateien, kein Knopf |
| 29. September 2026 | E7 a): Text über `sharp` und SVG, das Image bekommt `fonts-dejavu-core` |
| 29. September 2026 | E8 a): Vorschaubilder in `attachment_thumbs`, nicht in Papierkorb und Export |
| 29. September 2026 | E9 a): jeder Ordner als Karte wie bei Homarr |
| 29. September 2026 | E10 b): auch die Dateien ohne Ordner stehen in einer Karte, ohne Kopf |
| 29. September 2026 | E11 a): Rahmen `--line`, Fläche `--surface-2` |
| 29. September 2026 | E12 a): ohne eigene Wahl die Kacheln |
| 29. September 2026 | E13 a): keine Kopfzeile mit Spaltennamen |
| 29. September 2026 | E14 a): der Browser fragt nach 3, 6, 12 und 24 s nach |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.48.0.

| | 0.48.0 | 0.49.0 |
|---|---:|---:|
| Tabellen | 39 | 39 |
| Schreibende Routen | 88 | 88 |
| Persönliche Schlüssel (`PERSONAL_KEYS`) | 13 | **14** |
| Anweisungen auf `attachments.data` | 22 | **23** |
| Schlüssel je Sprachdatei | 1.324 | **1.327** |
| Regelzeilen des Stilblatts | 1.840 | **1.901** |
| Protokollzeilen in den sechs Dateien | 72 | **73** |
| Kommentarzeilen | 6.878 in 45 Dateien | **6.920 in 46** |
| Dateien des Prüfstands samt `counterproof.js` | 29 | **30** |
| Rückbauten | 1.335 | **1.375** |
| Prüfungen im Prüfstand | 7.765 | **PRUEFSTAND** |

---

## 3. Was gebaut ist

**Kacheln oder Liste** (`public/app.js`, `public/style.css`). Im Kopf des
Blocks „Dateien“ stehen „Kacheln“ und „Liste“ als Gruppe mit `aria-pressed`,
daneben „Ordner hinzufügen“. Ein Klick zeichnet sofort und speichert danach
mit `PUT /api/settings { filesView }`. Die Liste nutzt dieselben `li` wie die
Kacheln: `newTile()` legt `.akind`, `.asize`, `.adate`, `.afrom` und `.anote`
an, `fillTile()` füllt sie, und die Klasse `alist` am Block schaltet die
Darstellung. Am Rechner stehen die Spalten mit festen Breiten
(`--acols`), weil jede Zeile ein eigenes Grid ist; die Spalte Von nur mit der
Klasse `afrom-on`, also bei mehreren Accounts. Am Telefon steht der Name oben,
darunter Größe · Datum. „+“ ist in der Liste die Zeile „Dateien hochladen“ mit
der Grenze. Ein Upload zeigt in der Liste seinen Zustand als Text unter dem
Namen. Vorschau, Vollbild, Menü, Ablegen und Tastatur bleiben unverändert.

**Karten** (`public/style.css`). `.agroup` hat Rahmen `1px solid var(--line)`,
Radius 8 px und Fläche `--surface-2`; das gilt für die Gruppe ohne Ordner und
für jeden Ordner. Die Kachelbilder darin haben jetzt `--surface`. Die
Einrückung `.afolder-body` von 18 px entfällt. Ablegen über einem Ordner färbt
den Rahmen seiner Karte.

**Einstellung** (`server.js`). `filesView` steht in `PICK_SETTINGS` mit
`tiles` und `list`, Vorgabe `tiles`, und in `PERSONAL_KEYS`; `GET` und
`PUT /api/settings` nennen den Wert. Ein falscher Wert ergibt 400 mit
`server.viewUnknown`.

**Vorschaubilder für Dokumente** (`server.js`, `docserver.js`,
`attachments.js`).

| Teil | Stand |
|---|---|
| Welche Dateien | `docTileKind()`: `text` für die Endungen aus `TEXT_EXTENSIONS`, `office` für `OFFICE_TYPES` und `pdf` |
| Text | `textTileSvg()`: die ersten 4096 Bytes, 14 Zeilen zu 32 Zeichen, Tabulator als vier Leerzeichen, Steuerzeichen entfernt, XML maskiert, `DejaVu Sans Mono` 24 px auf Weiß, 512 × 512; `fileTile()` macht daraus WebP |
| Office und PDF | `docserver.firstPage()`: `/converter` mit `outputtype: 'png'`, `thumbnail: { aspect: 1, first: true, width: 512, height: 724 }`, Schlüssel `tile-` + `documentKey(a, 'v' + saves)`; das PNG bis 20 MB über `download()`, dann `fileTile()` |
| Warteschlange | `docTilesSoon(ids)` stellt frische Dateien vorn an; ohne `ids` alle Dokumente ohne Zeile in `attachment_thumbs`. Eine Umwandlung nach der anderen. `makeDocTile()` speichert nur, wenn Größe, Name und `saves` noch stimmen |
| Wann | Text beim Upload in einer Anfrage sofort; alles andere in der Warteschlange: Upload, Abschluss eines Uploads in Stücken, Speichern aus dem Editor, vorige Fassung, Import und Papierkorb, nach `app.listen`, stündlich und beim Einschalten des Document Servers |
| Fehler | `-3`, `-5`, `-9`, `-10` schreiben `NULL`. Jede andere Antwort, eine Zeitüberschreitung und eine fehlende Datei auf der Platte schreiben nichts; die Datei steht in `TILES_FAILED` bis zum nächsten stündlichen Lauf oder bis zum Einschalten (`docTilesAgain()`) |
| Neuer Inhalt | `saveEditedIn()` löscht die Zeile in der Transaktion, `POST /api/attachments/:id/previous` danach; beide stellen die Datei in die Warteschlange |
| An den Browser | nur bei Dokumenten: `thumb` (Länge des Bildes) und `thumbSoon` (keine Zeile, erwartet, nicht in `TILES_FAILED`) |
| Abruf | `sendFileTile()` liefert das gespeicherte Bild eines Dokuments und erzeugt keines. `GET /api/document-server/attachments/:id` liefert auch PDF |

**Im Browser.** `fileTileSource()` hängt `still` oder `thumb` als `v=` an. Hat
ein Dokument `thumb`, zeigt die Kachel das Bild oben bündig (`img.adoc`) und
darüber die Endung (`.abadge`). `awaitTiles()` holt `GET /api/items/:id` nach
3, 6, 12 und 24 s, solange eine Datei `thumbSoon` trägt, und beginnt für jede
neue Menge wartender Dateien von vorn; nach dem Verlassen des Eintrags fragt es
nicht mehr.

**Image.** Die Laufzeit installiert `fonts-dejavu-core` mit
`--no-install-recommends` und löscht die Paketlisten. Ohne Schrift zeichnet
`sharp` Text in SVG als Kästchen; geprüft mit leerer Fontconfig.

**Texte.** `entry.filesView` („Dateien als Kacheln oder Liste“, Name der
Gruppe), `entry.filesTiles`, `entry.filesList` in drei Sprachen. Türkisch
„Döşeme“ und „Liste“, Englisch „Tiles“ und „List“.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| Fehlertext für `filesView` | `server.viewUnknown` statt eines neuen `server.filesViewUnknown` | derselbe Wortlaut „Diese Ansicht gibt es nicht.“ |
| Zeile „+“ in der Liste | vorhandener Text `entry.fileAdd` („Dateien hochladen“) statt „Datei hinzufügen“ | derselbe Knopf wie auf der Kachel |
| Beschriftung der Kachel | ohne Datum | sonst änderte sich die Kachelansicht für Screenreader; das Datum nennt weiter der Kopf des Menüs |
| Nachholen beim Start | in `app.listen` statt beim Laden des Moduls | der Document Server holt die Datei bei Kriterion ab; vor `listen` scheiterte das mit `-4`, und die Datei wartete eine Stunde. Gefunden von der Prüfung „Beim Start holt der Server nach“ |
| Einschalten des Document Servers | leert auch `TILES_FAILED` | sonst bliebe eine Datei, die vorher ohne Antwort blieb, bis zum stündlichen Lauf ohne Bild |
| Radius der Karte | 8 px statt 10 px aus dem Auftrag | gleich dem Radius der Kachelbilder und von `.afolder.lit` |
| Türkisch „Kacheln“ | „Döşeme“ statt „Döşemeler“ | „Döşemeler“ ist 29 % länger als „Kacheln“; erlaubt sind 15 % |
| Mock in `test/release_042.js` | lehnt Umwandlungen mit `tile-` ab | die Warteschlange rief ihn sonst im Hintergrund und überschrieb, was die Prüfung der Karte „Dokumente“ festhält |

---

## 5. Der Prüfstand

Neues Modul `test/release_049.js` auf der Portbasis 7340, eingetragen hinter
`release_048`. Ein Mock des Document Servers im selben Prozess holt die Datei
über die Abrufroute, liefert ein PNG, dessen Breite die laufende Nummer trägt
(300 + 7 · n Pixel), antwortet auf Wunsch mit einem Fehlercode oder hält die
Antwort zurück.

| Gruppe | Prüfungen |
|---|---:|
| Dateien: die Einstellung Kacheln oder Liste | 3 |
| Dateien: Vorschaubild einer Textdatei | 5 |
| Dateien: Vorschaubild einer Textdatei im Ordner mit Testtag | 1 |
| Dateien: Vorschaubild ueber den Document Server | 7 |
| Dateien: Fehler des Document Servers | 3 |
| Dateien: Nachholen beim Start, stuendlich und beim Einschalten | 5 |
| Dateien: ein neuer Stand bekommt ein neues Vorschaubild | 4 |
| Dateien: Stilblatt, Dockerfile und Quelltext | 3 |
| Dateien: Kacheln oder Liste im Browser | 5 |
| Dateien: Vorschaubild und Nachladen im Browser | 5 |

**Angepasst:** `test/roundtrip.js` (vierzehn persönliche Schlüssel, `filesView`
gesetzt), `test/source.js` (23 Anweisungen auf `data`, 73 Protokollzeilen,
1.901 Regelzeilen, 30 und 46 Dateien), `test/selfcheck.js` (1.375 Rückbauten,
Grenzwerte der Kommentarzeilen), `test/release_042.js` (PDF an der
Abrufroute 200, Mock ohne Vorschaubilder), `test/release_048.js` (`finishUpload`
gibt die neue Nummer zurück).

**Rückbauten.** 1419 bis 1458 neu; 1291, 1292, 1294, 1309, 1316 und 1411 mit
neuem Suchtext, 1291 dazu mit neuem Ersatz, der auch die Zeile `picture`
zurückbaut.

GEGENPROBEN

---

## 6. Nicht geprüft und offen

- Ein echter Document Server: ob Euro-Office und OnlyOffice ein PDF mit
  `thumbnail` in ein PNG umwandeln, zeigt erst die Abnahme (Auftrag,
  Abschnitt 5, Schritt 3). Ohne Umwandlung zeigt die Kachel die Endung.
- Das Image ist hier nicht gebaut worden; Docker fehlt im Container. Die
  Schrift ist mit den Schriften des Containers und mit leerer Fontconfig
  geprüft.
- Die Oberfläche ist in Chromium bei 1280 und 390 px Breite, hell und dunkel,
  in beiden Ansichten angesehen worden; Tastatur und Screenreader nur mit
  jsdom.
- Bei vielen Dokumenten dauert das Nachholen nach dem Update; der Document
  Server wandelt eines nach dem anderen um.
