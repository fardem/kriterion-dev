# Änderungsprotokoll 0.54.0 — „Punkte aus der Abnahme von 0.53.0“

**Gebaut am 1. Oktober 2026 auf 0.53.0. Fingerprint `6402677f`, davor
`5e5fb3c7`.**

Nach `Doku/Auftrag_0.54.0.md` und dem Eintrag 0.54.0 im Fahrplan. Schema: ja,
die Tabelle `attachment_changes`, kein Migrationsblock. Austauschformat: bleibt
22. Routen: eine neue, `PUT /api/attachments/:id`; `GET /api/attachments/:id/info`
liefert zu Dokumenten die „Infos“. Kein neuer Vorgang im Sicherheitsprotokoll.
Neue Abhängigkeit: `exif-reader` 2.0.3.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 1. Oktober 2026 | V1 bis V13 und F1 bis F19 in fünf Fragetafeln, die Antworten in Abschnitt 0 des Auftrags. Anders als empfohlen: F8 (derselbe Name im selben Ordner wird beim Umbenennen abgelehnt) |
| 1. Oktober 2026 | Start des Baus: „Bitte baue 0.54.0 nach dem entsprechenden Auftrag“ |
| 1. Oktober 2026 | V14, V15: während des Baus der Filter nach Schätzung und Bewertung, „und je teilweise“, mit einer Schwelle von 80 %, einstellbar im Admin-Menü |
| 1. Oktober 2026 | F20 bis F26 in zwei Fragetafeln. Anders als empfohlen: F20 (B11 kommt in 0.54.0 statt als Punkt 64 in die Sammlung) |
| 1. Oktober 2026 | Fragetafel beim Bau: `card.user` wird geteilt, englisch heißen Karte und Abschnitt „Users“, die Rolle bleibt „User“ |
| 1. Oktober 2026 | Fragetafel beim Bau: die vorige Fassung bekommt beim Umbenennen den neuen Namen mit ihrer eigenen Endung |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.53.0.

| | 0.53.0 | 0.54.0 |
|---|---:|---:|
| Tabellen | 43 | **44** |
| Schreibende Routen | 90 | **91** |
| Routen insgesamt | 128 | **129** |
| Vorgänge im Sicherheitsprotokoll | 22 | 22 |
| Ausgelieferte JavaScript-Dateien | 18 | 18 |
| Abhängigkeiten in `package.json` | 6 | **7** |
| Pakete nach `npm install` | 172 | **173** |
| Zeilen `server.js` | 7.784 | **7.931** |
| Zeilen `public/app.js` | 12.155 | **12.310** |
| Zeilen `attachments.js` | 398 | **612** |
| Schlüssel je Sprachdatei | 1.431 | **1.489** |
| Regelzeilen des Stilblatts | 1.999 | **2.003** |
| Kommentarzeilen im Stilblatt | 524 | **514** |
| Kommentarzeilen | 7.096 in 53 Dateien | **7.148 in 54** |
| Dateien des Prüfstands samt `counterproof.js` | 34 | **35** |
| Rückbauten | 1.520 | **1.575** |
| Prüfungen im Prüfstand | 8.040 | **8.110** |
| Zeilen `CHANGELOG.md` | 1.451 | **1.471** |

README und Anleitung, Zeilen:

| | englisch | deutsch | türkisch |
|---|---:|---:|---:|
| README | 636 (`README.md`, vorher 626) | 638 (`README-de.md`, vorher 628) | 639 (`README-tr.md`, vorher 630) |
| Anleitung | 882 (`manual.md`, vorher 848) | 900 (`manual-de.md`, vorher 867) | 887 (`manual-tr.md`, vorher 854) |

Die Obergrenzen der Kommentarzeilen steigen: `server.js` 1.036 → 1.054
(Umbenennen, Nachlesen alter Zeilen, Infos zu Dokumenten, Filter),
`attachments.js` 48 → 68 (EXIF, Leser für ZIP, Office, OpenDocument und PDF),
`public/app.js` 1.171 → 1.187 (Dialog zum Umbenennen, Gruppen „Bild“ und
„Aufnahme“, Infos, zugeklappter Kopf, Filter); `test/ui_language.js` 108 → 109;
neu ist `test/release_054.js` mit 7. Im Stilblatt sinkt die Grenze von 524 auf
514.

---

## 3. Was gebaut ist

**Umbenennen** (B4). `PUT /api/attachments/:id` mit `filename`: der Server
nimmt `path.basename()`, streicht eine eingetippte Endung gleich der Endung der
Datei, hängt die Endung an und prüft höchstens 200 Zeichen, einen Namen vor der
Endung aus mehr als Punkten und keine Steuerzeichen (400). Nur wer hochgeladen
hat (403). Ein gleicher Name ohne Groß- und Kleinschreibung im selben Ordner
oder unter den Dateien ohne Ordner ergibt 409 mit `server.fileNameTaken` oder
`server.nameTakenLoose`. Die vorige Fassung bekommt den neuen Namen mit ihrer
Endung. „Umbenennen …“ steht im Menü „…“ in der Gruppe mit „Verschieben nach …“;
der Dialog zeigt den Namen ohne Endung, die Endung fest dahinter, Enter
speichert, Esc bricht ab, der Fokus geht auf „…“ zurück.

**Format und Pixel** (B1). `qAttachments` liest `$.general.format`, die Pixel
von `image[0]` und `$.orientation`; bei Ausrichtung 5 bis 8 tauscht
`shownPixels()` Breite und Höhe. Die Antwort trägt bei Bildern `codec`,
`width`, `height` und `infoSoon`. `kindText()` schreibt „PNG · 1920 × 1080“,
ohne Angaben „Bild“; `CODEC_NAMES` kennt „avif“ als „AVIF“ und „Bitmap“ als
„BMP“. Das Vorschaubild trägt `.acodec` auch bei Bildern.

**EXIF** (B9). `mediaFacts()` in `attachments.js` liest bei Dateien ohne
Videospur das erste Stück (1 MiB) mit `sharp` (`metadata().orientation` und
`exif`) und gibt den EXIF-Block an `exif-reader`. Abgelegt werden `taken`
(`DateTimeOriginal`, sonst `DateTime`), `camera`, `lens`, `exposure`,
`aperture`, `iso`, `focal`, `focal35` und `gps` als ja oder nein.
`orientation` steht immer in der Zeile, bei Videos als `null`. Eine Zeile ohne
`orientation` liest `makeMedia()` bei Bildern beim nächsten Abruf und
`mediaSoon()` nach dem Start einmal nach; Videos nicht. Ebenso `photo_media`,
dort erkennt die leere Liste `video` ein Bild.

**Vorschaubilder in der Datei** (B2). `imageGroup()` zeigt nur `image[0]` als
„Bild“ und eine Zeile „Vorschaubilder in der Datei: 2 (256 × 205)“; gleiche
Größen stehen einmal. `shotGroup()` zeigt „Aufnahme“; mit einer Zeit aus EXIF
entfällt „Aufnahmedatum“ unter „Allgemein“.

**Infos zu Dokumenten** (B10). Neue Tabelle `attachment_changes`
(`file_modified`, `saved_at`, `saved_by`). `finishUpload()` schreibt
`uploads.modified`, `saveEditedIn()` bei Status 2 und 6 Zeit und Account aus
`users[0]`, nur wenn die Nummer ein Account ist. `fileIntoTrash()` legt die Zeile
als `changes` in `content`, `fileFromTrash()` schreibt sie zurück.
`GET /api/attachments/:id/info` antwortet bei pdf, docx, xlsx, pptx, odt, ods,
odp, doc, rtf, xls und ppt mit `document: true`, `kriterion` und `file`.
`readPartsOf()` liest stückweise wie für MediaInfo; `zipParts()` liest nur das
zentrale Verzeichnis und `docProps/core.xml`, `docProps/app.xml` oder
`meta.xml`, keinen Eintrag über 1 MiB. `pdfFacts()` liest das erste und das
letzte MiB, das Objekt aus `/Info` und die größte `/Count` eines Seitenbaums.
Zeiten mit Zeitzone stehen als UTC mit `Z`, ohne Zeitzone wie geschrieben. Das
Menü zeigt „Infos“ bei den Arten pdf, word, excel und powerpoint.

**Der zugeklappte Kopf** (B3). `filesSummary()` nennt Ordner, Videos, Bilder,
weitere Dateien und die Größe mit `filesize()`, die dafür auf die oberste Ebene
gezogen ist; „Dateien“ steht ohne Klammern. Das Stilblatt blendet zugeklappt
`.ahead-acts` und `#acount` aus.

**Texte** (B5, B7). `entry.rejectedBy`, `entry.rejectedOn` und
`entry.rejectedWho` mit `{date}` und `{name}`; `list.openTitle` für den
Aufgabenknopf; `entry.sumNone` und `entry.sumEmpty` für „keine“ und „leer“;
`card.users` für Karte und Abschnitt.

**Filter nach Potenzial und Bewertung** (B11). `ownShares()` in `server.js`
zählt je Eintrag und Phase die eigenen Werte über 0 und vergleicht ganzzahlig
(`n * 100 < Schwelle * Kriterien`). `GET /api/items` trägt `share` mit `before`
und `after` als `none`, `partial` oder `full`; bei `after` vor dem Test `null`.
Ohne Kriterien und beim Potenzial ohne `potentialMode` fehlt die Phase.
`partialShare` steht in `settings`, ganze Zahl von 1 bis 100, Vorgabe 80; jeder
Admin setzt sie über `PUT /api/settings`. Die Filterleiste bekommt die Zeile
`#f-shares` mit „Alle · Keine · Teilweise“ je Phase; eine Phase, die der Server
nicht nennt, fehlt und gilt als „Alle“. Das Feld steht in der Karte „Bewertung:
Kriterien“.

**Anleitung und README** (B6, B7, BA 9). In drei Sprachen: Umbenennen, „Infos“,
Format und Pixel, „Aufnahme“, der zugeklappte Kopf, die Filter und die Schwelle.
„Eintrag exportieren“ entfällt. Deutsch: „Ähnliche Titel: …“, „Alle“, „Offene
Aufgaben“, der Abschnitt „Verfahren der Ablage“ der Karte „Bildformate“;
englisch „Users“. README: `exif-reader`, die neue Route, die Tabelle
`attachment_changes`, 173 Pakete mit 137 MIT.

**Das Stilblatt** (B8). Neun Kommentare, die nur sagen, was der Code tut,
entfallen; ein Kommentar über `.engine-list .langnote` steht wieder an seiner
Regel, „Ähnlich: …“ heißt „Ähnliche Titel: …“, die Abschnittsmarke der
Vergleichsleiste steht in einer eigenen Zeile.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| Eingetippte Endung | „Bericht.docx“ im Feld vor „.docx“ ergibt „Bericht.docx“ | „Bericht.docx.docx“ wäre fast immer ein Versehen |
| Steuerzeichen im Namen | abgelehnt (400) | Ein Feld im Browser tippt sie nicht; über die API ergäben sie unlesbare Namen |
| Meldung bei gleichem Namen | zwei Schlüssel, Ordner und Dateien ohne Ordner | Ohne Ordner gibt es keinen Ordner, den die Meldung nennen könnte |
| Pixel im Dialog | wie angezeigt, wie in der Spalte „Typ“ (F2) | Sonst nennen Liste und Dialog verschiedene Pixel für dasselbe Bild |
| Zeit aus EXIF | ohne Umrechnung, wie die Kamera sie zeigt | EXIF trägt meist keine Zeitzone |
| Erstes Stück | 1 MiB, `CHUNK` der Dateien | `sharp` braucht den Kopf bis zum SOF eines JPEG; gemessen: mit 390 KB vor dem Bild scheitern 4 KB, 64 KB und 256 KB, 1 MiB reicht |
| Alte Zeilen | Merkmal ist das Fehlen von `orientation` | ohne Zähler und ohne neue Spalte; Videos bekommen `null` und werden nicht nachgelesen |
| Filter am Server | `share` je Eintrag statt der Zahl der Kriterien im Browser | Die Übersicht lädt keine Kriterien; Schwelle und Regel stehen an einer Stelle |
| Wörter in „Infos“ | ohne Tausenderpunkt | `number()` gruppiert nirgends |
| Größe im zugeklappten Kopf | „1122,2 MB“ wie in `#acount` | Das Beispiel im Auftrag mit Tausenderpunkt entspricht nicht `filesize()` |
| Feste Texte in `public/app.js` | „AVIF“, „BMP“ und „UTC“ in der Liste von `test/ui_language.js`, Grenze 70 → 72 | Namen von Formaten und einer Zeitzone, keine Sätze |
| „HEVC“ am Vorschaubild | in den Anleitungen „H.265“ | Seit 0.53.0 steht dort „H.265“ |
| Rückbau 1669 | gegen `manual-de.md` statt `manual-tr.md` | `test/selfcheck.js` begrenzt die Zieldateien auf 50 |

---

## 5. Der Prüfstand

Neues Modul `test/release_054.js` auf der Portbasis 7340, eingetragen hinter
`release_053`.

| Gruppe | Prüfungen |
|---|---:|
| Dateien umbenennen: die Route | 8 |
| Bilder: Format, Pixel, EXIF und das Nachlesen | 8 |
| Infos zu Dokumenten: aus Kriterion und aus der Datei | 10 |
| Filter nach Potenzial und Bewertung: der Server | 5 |
| Anleitung, README und Namen | 5 |
| Dateien umbenennen: Menü und Dialog | 5 |
| Infos zu Dokumenten: Menüpunkt und Dialog | 5 |
| Der zugeklappte Kopf von „Dateien“ | 5 |
| Texte ohne festes Deutsch: Ablehnung und Aufgabenknopf | 3 |
| Filter nach Potenzial und Bewertung: Leiste und Einstellung | 8 |
| Bilder: Typ, Vorschaubild und Erweiterte Infos | 8 |

**Angepasst:** `test/release_052.js` (Format am Bild, Schlüssel `orientation`
und `exif`, „Umbenennen …“ und „Infos“ im Menü); `test/release_053.js` (127
Abschnitte, 38 Fingerprints im CHANGELOG); `test/roundtrip.js` (91 Routen, 83
hinter dem Schutz, 44 Tabellen, sieben Abhängigkeiten, 36 Aufrufe von
`detail()`); `test/source.js` (91 schreibende und 129 Routen, 15 gesetzte id,
2.003 Regelzeilen, 35 und 54 Dateien); `test/ui_language.js` (AVIF, BMP, UTC);
`test/frame.js` (die neue Route); `test/selfcheck.js` (Grenzwerte, 54 Dateien,
1.575 Rückbauten); `testbench.js` (`release_054`); `test/release_031.js`
(`entry.sumNone` und `list.shareNone` in `DS_STANDALONE`); `test/release_045.js`
(der zugeklappte Kopf, „Infos“ und „Umbenennen …“ im Menü).

**Rückbauten.** 1617 bis 1671 neu, einer je Zusage. 243, 247, 810, 1128, 1537,
1560 und 1608 bekommen neue Suchtexte, weil ihre Stellen sich geändert haben.
Gefahren mit einem Treiber, der je Rückbau eine Kopie des Arbeitsbaums anlegt
und nur das Modul der erwarteten Gruppe laufen lässt, mit höchstens vier Spuren:
1617 bis 1671 an `test/release_054.js`, 243 und 247 an `test/ui_export.js`, 810
an `test/roundtrip.js`, 1128 an `test/source.js`, 1537 und 1560 an
`test/release_052.js`, 1608 an `test/release_053.js`. **Alle rot** und
durchgelaufen. Im ersten Durchgang blieb 1670 stumm: die Prüfung fand
`exif-reader` auch im Absatz zur API; sie prüft jetzt den Satz „Built with …“.
Dabei fiel auf, dass `GET /api/items` Einträge derselben Sekunde in wechselnder
Folge liefert; die Prüfung der Filter ordnet seitdem nach Titel. 810 erwartet
die Gruppe „Der Potenzialmodus — 0.26.0“ (`test/ui_style.js`), deren Browser den
Server nicht fragt; rot wird er in „Der Potenzialmodus am Server — 0.26.0“
(`test/roundtrip.js`). Beim Lauf von 810 waren in `test/roundtrip.js` drei
weitere Prüfungen rot, unabhängig vom Rückbau: sie erwarteten 43 Tabellen, sechs
Abhängigkeiten ohne `exif-reader` und 35 Aufrufe von `detail()`. Sie erwarten
jetzt 44 Tabellen mit `attachment_changes`, sieben Abhängigkeiten und 36
Aufrufe. Eine volle Gegenprobe ist nicht gefahren.

Der erste volle Lauf: 8.106 von 8.110. Rot waren vier Prüfungen aus Modulen,
die vorher nicht einzeln liefen:

- `test/release_031.js`: `entry.sumNone` und `list.shareNone` heißen „keine“
  und galten als Füllwort. Beide stehen allein; sie sind jetzt in
  `DS_STANDALONE` eingetragen.
- `test/release_031.js`: das türkische `server.fileName` war 1,16-mal so lang
  wie das deutsche (95 zu 82 Zeichen). Es endet jetzt auf „oluşmamalı“ (92
  Zeichen). Der Fingerprint ist danach gemessen.
- `test/release_045.js`: der zugeklappte Kopf von „Dateien“ sollte „3“ nennen.
  Die Prüfung erwartet jetzt „3 weitere · …“.
- `test/release_045.js`: das Menü an Office-Dateien sollte ohne „Infos“ und
  „Umbenennen …“ stehen. Die Prüfung erwartet jetzt beide.

Der volle Lauf vor dem Push: **8.110 von 8.110** Prüfungen bestanden.

---

## 6. Nicht geprüft und offen

- Mit einem echten Document Server ist nicht nachgestellt, dass `users[0]` beim
  Speichern den letzten Bearbeiter nennt; geprüft ist der Rückruf mit einem
  gestellten Server.
- `20D_9141.jpg` stand nicht zur Verfügung; die Vorschaubilder in der Datei
  sind an einem JPEG aus `sharp` mit eingesetzten Blöcken geprüft.
- EXIF in HEIC, AVIF, PNG und WebP ist nicht gemessen; steht der Block hinter
  dem ersten MiB, fehlt er.
- Office-Dateien als ZIP64 und PDF mit `/Info` in einem gepackten Objektstrom
  liefern keine Angaben aus der Datei.
- Die türkischen Texte hat kein Muttersprachler gelesen.
- Die Abnahme im Betrieb nach Abschnitt 5 des Auftrags führt der Betreiber
  durch.
