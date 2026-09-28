# Änderungsprotokoll 0.45.0 — „Der Block „Dateien“ in Kacheln“

**Gebaut am 28. September 2026 auf 0.44.2. Fingerprint `6935aee7`, davor
`46ae4e39`.**

Nach `Doku/Auftrag_0.45.0.md` und dem Eintrag 0.45.0 im Fahrplan; Grundlage
ist `Doku/Konzept_Dateien_und_Ordner.md`, Version 1a. Schema: nein.
Austauschformat: 20. Keine neue und keine geänderte Route.

---

## 1. Vorgaben des Betreibers

Die Fragetafel ist vor der ersten Zeile Code beantwortet worden.

| Datum | Vorgabe |
|---|---|
| 28. September 2026 | A1: Eine Kachel ist fest 128 px am Rechner und 96 px am Telefon, drei Spalten bei 344 px |
| 28. September 2026 | Der Block „Dateien“ wird neu aufgebaut, mit quadratischen Kacheln und Vorschaubild nach dem Vorbild von Homarr |
| 28. September 2026 | Hochgeladen wird über die Kachel „+“ |
| 28. September 2026 | Ein Klick auf eine Kachel öffnet die Vorschau darunter; Bilder öffnen im Vollbild |
| 28. September 2026 | Ein Menü ⋯ an jeder Kachel, immer sichtbar |
| 28. September 2026 | Die Bildleiste oben bleibt, wie sie ist |
| 28. September 2026 | 100 Dateien je Eintrag, 20 je Anfrage |
| 28. September 2026 | Die Vorschau steht unter allen Kacheln ihrer Gruppe, höchstens eine im Block; am Telefon öffnet eine lesbare Datei die eigene Ansicht |
| 28. September 2026 | Die Adresse einer Bilddatei öffnet das Vollbild im Eintrag, auch über die Marke in Kommentar und Beschreibung |

Beim Bauen ist keine neue Frage aufgekommen.

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.44.2.

| | 0.44.2 | 0.45.0 |
|---|---:|---:|
| Dateien je Eintrag, höchstens | 20 | **100** |
| Dateien je Anfrage, höchstens | 20 | **20** |
| Schlüssel je Sprachdatei | 1.229 | **1.231** |
| Regelzeilen des Stilblatts | 1.750 | **1.789** |
| Zuweisungen an `innerHTML` in `public/app.js` | 184 | **187** |
| Kommentarzeilen | 6.568 in 41 Dateien | **6.607 in 42** |
| Dateien des Prüfstands samt `counterproof.js` | 25 | **26** |
| Rückbauten | 1.226 | **1.231** |
| Prüfungen im Prüfstand | 7.534 | **7.604** |

---

## 3. Was gebaut ist

**`server.js`.** `ATTACHMENT_COUNT` ist durch zwei Konstanten ersetzt:
`FILES_PER_REQUEST = 20` gibt multer als Grenze je Anfrage, `FILES_PER_ENTRY =
100` prüft die Route je Eintrag. Zwischen Zählen und Schreiben steht weiter
kein `await`.

**Die Kachel** (`public/app.js`, `drawAtts()`). Der Block ist ein `ul` mit
einem `li` je Datei und der Kachel „+“ am Ende.

| Teil | Inhalt |
|---|---|
| Bildfläche | Bilddatei: die Kachel aus `attachment_thumbs`; sonst die Endung groß (`fileKind()`), ein Video dazu ▶ |
| Zustandsecke | bei einem Upload: Ring mit Prozent, „wartet“ oder ⚠ |
| Name | bis 15 Zeichen in einem Stück, das umbricht; länger in zwei Zeilen: vorn mit Auslassung, hinten die letzten 10 Zeichen samt Endung |
| Unterschrift | Größe, ab zwei Accounts „· Name“; nach einem Fehler der Grund |
| Knöpfe | Bildfläche und Name sind ein Knopf mit Beschriftung („doku.pdf, PDF, 879 KB, chefin“), ⋯ ein zweiter |

`drawAtts()` legt Kacheln nach Nummer an, aktualisiert vorhandene und
entfernt fehlende; `#atts` wird nicht mehr geleert. Vor dem Zeichnen prüft es
`attsBox.isConnected`. Die Bildfläche wird nur neu gebaut, wenn sich ihre Art
ändert; eine Bilddatei, deren Kachel nicht lädt, wird nicht erneut geladen.

**Das Menü** (`openFileMenu()`, `closeFileMenu()`, auf Modulebene). Kopf mit
Name und, ab zwei Accounts, „Hochgeladen von … am …“; darunter eine Liste mit
`role="menu"`, Einträge mit `menuitem` und `menuitemcheckbox`. ↑ ↓ laufen um,
Pos1 und Ende springen, Esc und Tab schließen; der Fokus kehrt zu ⋯ zurück,
nach dem Löschen zur nächsten Kachel. Umschalt+F10 öffnet es an der Kachel,
die Menütaste und die rechte Maustaste über `contextmenu`. Am Telefon steht es
über einem Schleier am unteren Rand. Eine neue Stufe `--z-file-menu: 50` liegt
unter dem Vollbild.

| Eintrag | steht da, wenn |
|---|---|
| Bearbeiten durch alle (Haken) | `mine` und `edit` |
| Bearbeiten | Office, `edit`, nicht am Telefon |
| Öffnen | PDF, Text, `.docx`, Office |
| Link auf diese Datei kopieren | immer |
| Herunterladen (Link mit `download`) | immer |
| Vorige Fassung wiederherstellen | `restore` |
| Datei löschen | `mine` oder Admin |
| Abbrechen | Kachel in Übertragung |
| Erneut versuchen, Entfernen | nach einem Fehler |

**Klick, Vorschau, Vollbild.**

| Datei | Rechner | Telefon |
|---|---|---|
| Bild | Vollbild; ← → durch die Bilder der Gruppe | Vollbild |
| PDF, Text, `.docx`, Office | Vorschau unter der Gruppe | eigene Ansicht |
| alles andere, Kachel in Übertragung | Menü | Menü am unteren Rand |

Die Vorschau ist ein fester Knoten `#apreview` mit `role="region"` unter dem
Raster; Kopf mit Name, Größe, ⤢, ↓ und ×. `openPreview` ist eine Nummer.
`destroyEditor()` läuft nur beim Schließen, beim Wechsel auf eine andere
Kachel und wenn die Datei fehlt. Esc im Block schließt, der Fokus geht zur
Kachel. Den Rahmen in Akzentfarbe trägt die Kachel, solange Vorschau oder
Vollbild sie zeigen; `openLightbox()` meldet das über den neuen Wert `shown`
und blendet den Papierkorb je Bild über `removable` aus. `imageSource()` hat
einen Zweig `source: 'file'`.

**Adresse.** `renderFileView()` gibt eine Bilddatei an `renderDetail()` weiter,
das das Vollbild öffnet; die Adresse wird `#/item/<Eintrag>`, wie bei einem
Foto. Die Marke einer Bilddatei öffnet im selben Eintrag das Vollbild ohne
Hash-Wechsel (`PHOTO_SHOW.showFile`). Nach der Rückkehr aus der eigenen
Ansicht steht der Block für diese Ansicht offen, die Kachel in der Mitte und
mit Fokus; `BLOCKS.closed` bleibt.

**Hochladen.** Die Warteschlange `UPLOADS` steht auf Modulebene. Der Browser
prüft vorher 20 je Auswahl, 100 je Eintrag und die Grenze „Anhang“; scheitert
eines, geht nichts hoch. Jede Datei geht einzeln über `XMLHttpRequest` an
`POST /api/items/:id/attachments`, die kleinste zuerst. Ohne Verbindung folgen
Versuche nach 2, 5 und 15 s, dann ⚠. `beforeunload` fragt, solange etwas
wartet oder läuft. Abgelegt werden kann auf dem ganzen Block; `dragover`
reagiert nur auf `Files`. Die geöffnete Ansicht meldet sich als `UPLOAD_VIEW`
an; `route()` meldet sie ab.

**Texte.** Neu je Sprache: `entry.fileAdd`, `entry.fileAddLimit`,
`entry.fileDropHint`, `entry.fileFailed`, `entry.fileFull`, `entry.fileMenu`,
`entry.fileWaiting`, `entry.uploadOffline`, `entry.uploadRetry`. Neu gefasst:
`entry.noFilesYet` („Noch keine Dateien.“), `entry.fileLimitHint` mit `{cap}`.
Entfallen: `entry.attachFiles`, `entry.clickToView`, `entry.clickToCollapse`,
`entry.clickToDownload`, `entry.editAllOn`, `entry.editAllOff`,
`entry.uploadingTitle`; mit ihnen fünf Einträge in `tools/keys.json`.

**Stilblatt.** `.arow`, das `subgrid` mit elf Spalten und die Regeln für das
Telefon sind fort. Neu: `.agrid` mit `repeat(auto-fill, minmax(var(--file-tile),
1fr))`, `--file-tile` 128 px und am Telefon 96 px, ⋯ dort 44 × 44 px; das Menü
`.fmenu`; der Kopf der Vorschau. Gemessen in Chromium (`headless_shell` 1194)
mit sieben Dateien:

| Fensterbreite | Spalten | Kachel | ⋯ |
|---|---:|---:|---:|
| 1.200 px | 8 | 131 px | 30 × 30 px |
| 375 px | 3 | 112 px | 44 × 44 px |
| 344 px | 3 | 101 px | 44 × 44 px |

**`manual-de.md`.** „Tags, Dateien, Links“ beschreibt Kachel, Klick,
Vorschau, Menü, Tastatur, Hochladen und 100 Dateien je Eintrag; der Verweis
auf eine Bilddatei öffnet das Vollbild.

---

## 4. Entscheidungen beim Bauen

| Frage | Entscheidung | Grund |
|---|---|---|
| Woher kennt der Browser 20 und 100? | aus zwei Konstanten in `public/app.js` mit denselben Namen wie in `server.js`, wie `PHOTO_COUNT` | Eine Angabe in einer Antwort des Servers hätte eine Route geändert. `test/release_045.js` hält beide Seiten gleich |
| Die Zahl im Handbuch | steht als Zahl im Text | Markdown kennt keinen Platzhalter; eine Prüfung hält sie gleich `FILES_PER_ENTRY` |
| „Abbrechen“ und „Entfernen“ | `dialog.cancel` und `entry.remove` | Beide Wörter gibt es in allen drei Sprachen schon |
| Kürzung des Namens | nach Zeichenzahl, nicht nach gemessener Breite | Die Kachel ist fest; bei 96 px passen rund 14 Zeichen in eine Zeile |
| Tasten im Menü | als Schlüssel einer Tafel (`MENU_KEYS`, `MENU_CLOSE`) | Die Restprobe in `test/ui_language.js` zählt Strings in `public/app.js` und erlaubt weniger als 70; neu in ihrer Liste ist nur `Files` |
| `Accept-Language` beim Upload | wird nicht gesetzt, wie bei `sendForm()` | `test/roundtrip.js` erlaubt den Header an genau einer Stelle |
| Belegte Plätze | wartende und fehlgeschlagene Uploads zählen zu den 100 | Ein fehlgeschlagener lässt sich erneut versuchen |
| Sitzung abgelaufen während eines Uploads | alle wartenden werden ⚠, die Anmeldung erscheint | Nach der Anmeldung geht „Erneut versuchen“ |
| Meldungen | ⚠ und Grund an der Kachel, der Fehler als Toast, am Ende „n Dateien angehängt“ | Der Toast am Ende ersetzt den Fehlertoast; der Grund bleibt an der Kachel |
| Video unter „Dateien“ | ▶ nach dem Typ, den der Browser beim Hochladen meldet | Die Vorschauart ist dort `keine` |
| Rückbauten 1300 bis 1302 | entfallen | Sie bauten das `subgrid` der Dateizeile zurück, das es nicht mehr gibt |
| Gruppe „Link am Bild und Dateizeilen in Spalten“ | heißt „Link am Bild“ | Die drei Prüfungen der Spalten entfallen nach dem Auftrag |
| Kommentargrenzen | mit `node tools/comments.js --write`: `public/app.js` 1.015 → 1.052, `server.js` 882 → 883 | Menü, Warteschlange und Vorschau; `XMLHttpRequest` statt `fetch()`, warum der Download erst nach dem Klick schließt, die beiden Grenzen auch in `public/app.js` |

---

## 5. Der Prüfstand

`test/release_045.js`, 79 Prüfungen in acht Gruppen. Die erste startet eine
eigene Instanz auf der Portbasis 7340, wie `release_041` bis `release_044`.
Die übrigen laufen im Mock aus `test/dom.js`; `XMLHttpRequest` ist dort
gestellt.

| Gruppe | Prüfungen |
|---|---:|
| Dateien in Kacheln: 100 je Eintrag, 20 je Anfrage | 8 |
| Dateien in Kacheln: Kachel und Klick | 22 |
| Dateien in Kacheln: der Betrachter uebersteht das Neuzeichnen | 4 |
| Dateien in Kacheln: das Menue zeigt nur Erlaubtes | 8 |
| Dateien in Kacheln: Tastatur und Rollen | 7 |
| Dateien in Kacheln: die Warteschlange | 17 |
| Dateien in Kacheln: Adresse und Vollbild einer Bilddatei | 10 |
| Dateien in Kacheln: nichts erst beim Ueberfahren | 3 |

Angepasst:

- `test/ui_entry.js`: „Dateien in der Oberflaeche“ 33 → 28 Prüfungen,
  „Der Name an der Dateizeile“ heißt „Der Name an der Dateikachel“, 17 → 16;
  die Stapelordnung hat zwölf Stufen.
- `test/release_042.js`, `test/release_043.js`: Kachel und Menü statt Zeile;
  „Beim Schliessen der Vorschau wird destroyEditor() gerufen“.
- `test/release_044.js`: die drei Prüfungen der elf Spalten entfallen; die
  Bilddatei hat keine eigene Ansicht mehr, ihre Marke öffnet das Vollbild.
- `test/ui_language.js`: `Files` in der Restprobe.
- `test/source.js`: 1.789 Regelzeilen, 187 Zuweisungen an `innerHTML`, 26
  Dateien des Prüfstands, 42 in der Stolpersteinprobe.
- `test/selfcheck.js`: 1.231 Rückbauten, die Kommentargrenzen, 42 Dateien.
- `testbench.js`: `release_045` hinter `release_044`.

Rückbauten, neu:

| Nr | Rückbau | erwartet in |
|---|---|---|
| 1307 | Ein Klick auf eine Datei ohne Vorschau lädt sie herunter | Kachel und Klick |
| 1308 | Set statt Nummer: die erste Vorschau bleibt neben der zweiten stehen | Kachel und Klick |
| 1309 | Das Neuzeichnen beendet den Betrachter | der Betrachter uebersteht das Neuzeichnen |
| 1310 | Das Menü bietet Datei löschen ohne Prüfung der Rechte an | das Menue zeigt nur Erlaubtes |
| 1311 | Abbrechen lässt die Datei in der Warteschlange | die Warteschlange |
| 1312 | Die Adresse einer Bilddatei öffnet wieder die eigene Ansicht | Adresse und Vollbild einer Bilddatei |
| 1313 | Der Server zählt je Eintrag bis 20 | 100 je Eintrag, 20 je Anfrage |
| 1314 | Die Warteschlange endet mit der Ansicht des Eintrags | die Warteschlange |

Rückbauten mit neuem Suchtext: 352 (Schließen des Vollbilds), 1228
(Schließen der Vorschau), 1232 („Öffnen“ im Menü), 1234 (Telefon), 1260
(Name an der Kachel), 1262 („Bearbeiten“ im Menü), 1268 („Bearbeiten durch
alle“), 1285 (Link kopieren), 1294 und 1295 (Bildfläche).

**18 rot, 0 stumm**, gefahren auf `5bbb6a6` mit drei Spuren. Jeder ist in
seiner erwarteten Gruppe rot; alle außer 1309 zusätzlich in „Jeder Suchtext
kommt in seiner Datei genau einmal vor“, weil die Prüfung den zurückgebauten
Stand liest. 1309 fügt eine Zeile hinter seinem Suchtext ein, der Suchtext
bleibt einmal stehen. Rot auch in weiteren Gruppen:

- 352 in vier weiteren Gruppen. Der Ersatz ruft wie vorher `halteAn()`, das
  es nicht gibt; `test/ui_entry.js` und `test/ui_style.js` brechen dabei ab.
  Suchtext und Ersatz tragen dazu die neue Zeile `shown?.(null);`.
- 1228 in „der Betrachter uebersteht das Neuzeichnen“, 1308 ebenso.
- 1232, 1262, 1268 und 1285 in „das Menue zeigt nur Erlaubtes“.
- 1234, 1294 und 1295 in „Kachel und Klick“, 1295 dazu in „Keine nackte
  Einsetzung in innerHTML“.
- 1307 in „Dateien in der Oberflaeche“, 1310 in „Der Name an der
  Dateikachel“, 1312 in „Verweise auf Dateien: die eigene Ansicht jeder
  Datei“.

Die Prüfung „Auf dem Telefon oeffnet ein Klick auf die Kachel die Ansicht“
hieß beim Lauf noch „… auf die Zeile …“; nur der Name ist danach geändert.

---

## 6. Nicht geprüft und offen

Der Prüfstand rechnet kein Layout. Die Messung in Chromium oben ist einmal
von Hand gelaufen und gehört nicht zum Prüfstand.

Offen für die Abnahme (Auftrag, Abschnitt 5):

- iPhone und Android: Umbruch des Namens, ⋯ ohne Überfahren, Menü am unteren
  Rand.
- Ablegen und Fortschritt im echten Browser; im Prüfstand sind `DataTransfer`
  und `XMLHttpRequest` gestellt.
- Office-Vorschau mit Euro-Office; die Bauumgebung erreicht keinen Document
  Server.
- Ein Screenreader.
