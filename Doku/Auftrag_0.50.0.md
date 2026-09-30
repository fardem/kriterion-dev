# Auftrag 0.50.0 — „Alle Dateien auf der Platte, Auswahl, Videos merken sich die Stelle“

**Erteilt am 30. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. Grundlage ist der Abschnitt 0.50.0 in `Doku/Fahrplan.md`.
Die Fragen aus Abschnitt 0 sind am 29. September 2026 in Fragetafeln
beantwortet worden, während 0.49.0 gebaut wurde; die Frage nach dem Branch hat
sich mit dem Merge von #267 erledigt.

Zeilennummern gelten für `089890a` (0.49.0).

---

## 0. Vor dem Bau: die offenen Fragen

| Nr. | Frage | Antwort |
|---|---|---|
| F1 | Was darf über „Anhang“? | Jede Datei, nicht nur Videos. Die Erkennung von Videos wird trotzdem erweitert (kompatible Marken im `ftyp`-Kasten), für Bildleiste und Kommentare |
| F2 | Name der zweiten Grenze | „Datei“ |
| F3 | Runde | eigene Runde mit eigenem Pull Request nach 0.49.0 |
| F4 | Speicher | Alles unter „Dateien“ liegt verschlüsselt auf der Platte; der Bestand wird nach dem ersten Start aus der Datenbank umgelagert; ein Weg für Dateien |
| F5 | Grenze | überall bis „Datei“ (Vorgabe 2048 MB), mit und ohne Ordner |
| F6 | Upload | nur in Stücken; `POST /api/items/:id/attachments` entfällt |
| F7 | Umlagerung | im Hintergrund nach dem Start, Datei für Datei, mit voriger Fassung |
| F8 | Platz reicht nicht | Start verweigern; das Protokoll nennt den fehlenden Platz (nicht die Empfehlung) |
| F9 | Dokument über „Anhang“ | PDF zeigt der Browser weiter selbst; Word, Excel und Text nur herunterladen; Bilder und Videos wie bisher |
| F10 | Grenze „Anhang“ | bleibt als Schwelle: bis dahin Export mit Inhalt, Vorschau, Document Server; darüber im Export nur der Name |
| F11 | Stelle im Video | je Account am Server, neue Tabelle |
| F12 | Umfang | alle Videos: Dateien, Bildleiste, Kommentare (nicht die Empfehlung) |
| F13 | Weiter | automatisch an der Stelle; ein Hinweis „ab 3:12“ mit „Von vorn“ steht einige Sekunden |
| F14 | Ende | unter 10 s nichts merken; in den letzten 5 % oder 10 s gilt das Video als gesehen und beginnt von vorn |
| F15 | Auswahl | Knopf „Auswählen“ im Kopf von „Dateien“ und der Bildleiste; Kästchen je Kachel; Leiste „3 ausgewählt · Löschen · Abbrechen“ |
| F16 | Aktionen | Löschen und Verschieben (nicht die Empfehlung); „Verschieben nach …“ unter „Dateien“ für die eigenen Dateien |
| F17 | Ohne Recht | nicht wählbar; dieselben Regeln wie beim einzelnen Löschen |
| F18 | Alle auswählen | je Gruppe: „Alle auswählen“ in der Leiste, ein Kästchen im Kopf jedes Ordners |
| F19 | Version | 0.50.0 statt 0.49.1, weil neue Funktionen dazukommen |
| F20 | Zustand des Ordners | offen bleibt offen, zu bleibt zu, auch nach dem Verlassen des Eintrags |
| F21 | Speicherort | je Account am Server, neue Tabelle |
| F22 | Sprung und neuer Ordner | ein Sprung öffnet nur für diese Ansicht; gemerkt wird der Klick auf den Ordnerkopf; ein neuer Ordner steht offen und bleibt offen |
| F23 | Befund „mehr“ | `limitCloud()` erkennt eine zweite Zeile an `offsetTop`, nicht an gerundeten Höhen |

---

## 1. Das Ziel

- Jede Datei unter „Dateien“ liegt einzeln verschlüsselt unter `data/files/`.
  Hochgeladen wird nur in Stücken, bis zur Grenze „Datei“.
- Der Bestand in `attachments.data` wird nach dem Start im Hintergrund
  umgelagert. Fehlt dafür der Platz, startet Kriterion nicht.
- Kamera-Videos mit eigener Marke im `ftyp`-Kasten, etwa Sony `XAVC`, gelten
  als MP4.
- Mehrere Kacheln lassen sich auswählen, löschen und verschieben, unter
  „Dateien“ und in der Bildleiste.
- Videos spielen an der Stelle weiter, an der der Account aufgehört hat.
- Ein Ordner bleibt offen oder zu, je Account.
- „mehr“ erscheint an einem Testtag nur, wenn Tags verborgen sind.

---

## 2. Der Anlass

| Anlass | Stand am 30. September 2026 |
|---|---|
| Sony A6700, XAVC HS | Hauptmarke `XAVC`, kompatibel `mp42` und `iso2`; `typeFromBytes()` (`attachments.js:103`) liest nur die Hauptmarke; abgewiesen mit `server.videoOnly` (`server.js:4096`) |
| Zwei Wege | `POST /api/items/:id/attachments` schreibt in die Datenbank, `POST /api/items/:id/uploads` nur in Ordner mit Testtag (`server.js:4064`) |
| Grenzen | `UPLOAD_LIMITS.attachment` bis 100 MB, `dayVideo` bis 4096 MB nur für Videos (`server.js:389-397`) |
| Umlagerung | `relocateOne()` (`server.js:4577`) nur für Dateien in einem Ordner mit Testtag (`qInDayFolder`) |
| Import | auf die Platte nur Dateien in einem Ordner mit Testtag (`server.js:6044`) |
| Ordner | `FOLDERS_OPEN` im Speicher des Browsers; beim Öffnen eines Eintrags ist jeder Ordner zu |
| Videos | spielen im großen Bild (`drawViewer()`, `app.js:5465`) und im Vollbild (`openLightbox()`, `app.js:4429`); keine gemerkte Stelle |
| Löschen | je Kachel über ihr Menü; Fotos über `DELETE /api/photos/:id` (Verfasser des Eintrags und Admin, `entryFree()`, `server.js:1030`) |
| „mehr“ | `limitCloud()` (`app.js:1229`) vergleicht `scrollHeight` mit dem gerundeten `offsetHeight` des ersten Kindes, 1 px Spielraum |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

F1 bis F23 aus Abschnitt 0, alle vom 29. September 2026.

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.50.0**, MINOR. Schema: ja, zwei neue Tabellen. Austauschformat: bleibt 22 |
| Routen | entfällt: `POST /api/items/:id/attachments`. Neu: `PUT /api/video-positions`, `PUT /api/folders/:id/open`. Schreibende Routen 88 → 89 |
| Grenze „Datei“ | Schlüssel `file` statt `dayVideo` in `UPLOAD_LIMITS`, 1 bis 4096 MB, Vorgabe 2048. Ein gespeicherter Wert für `dayVideo` wird nicht übernommen; der Kasten im CHANGELOG sagt es |
| Grenze „Anhang“ | Schwelle für Export mit Inhalt, Textvorschau, Document Server und Vorschaubild; `large` in `disk_files` heißt über „Anhang“ beim Upload |
| Upload | `POST /api/items/:id/uploads` nimmt jeden Ordner und keinen Ordner. In einen Ordner lädt nur, wer ihn angelegt hat; ohne Ordner jeder Account. `FILES_PER_REQUEST` entfällt; höchstens 100 Dateien je Eintrag bleibt |
| Erkennung | `typeFromBytes()` liest den ganzen `ftyp`-Kasten: MP4, wenn die Haupt- oder eine kompatible Marke in `ISO_BRANDS_MP4` steht. Die Prüfung der ersten Bytes beim Upload in Stücken entfällt |
| Umlagerung | alle Zeilen mit Inhalt in `attachments.data` und `attachment_previous.data`, ohne Bedingung an den Ordner. Beim Start: Bedarf (`encLen` je Datei) gegen `diskFree()`; reicht es nicht, Protokollzeile mit beiden Zahlen und Ende mit Code 1. Sonst nach `listen` im Hintergrund, eine nach der anderen, dann `reclaim()`. Verschieben und Zuweisen lagern nicht mehr selbst um |
| Kennzahlen | nennen die Zahl der Dateien, die noch umgelagert werden |
| Import und Papierkorb | jede Datei mit Inhalt geht auf die Platte |
| Große Dokumente | `preview` über „Anhang“: PDF bleibt `pdf`, Bilder und Videos bleiben; alles andere `keine`. Kein Document Server, keine Textvorschau, kein Vorschaubild |
| Stelle im Video | Tabelle `video_positions` mit `user_id` und genau einer der Spalten `attachment_id`, `photo_id`, `comment_video_id`, je `ON DELETE CASCADE`; `seconds`, `updated_at`. Der Server wendet F14 an: unter 10 s oder ab `duration − max(10, 5 % von duration)` wird die Zeile gelöscht. `detail()` nennt `position` an Dateien, Fotos und Kommentarvideos, nur für den eigenen Account |
| Speichern der Stelle | beim Anhalten, beim Schließen oder Wechseln und alle 15 s während der Wiedergabe |
| Hinweis | „ab 3:12“ und „Von vorn“ über dem Video, 5 s lang |
| Ordnerzustand | Tabelle `folder_open (user_id, folder_id)`, Zeile heißt offen, beide `ON DELETE CASCADE`. `detail()` nennt `open` je Ordner. Das Anlegen eines Ordners legt die Zeile für den Verfasser an |
| Auswahl | ohne neue Route: der Browser ruft je Kachel `DELETE /api/attachments/:id`, `PUT /api/attachments/:id/folder` oder `DELETE /api/photos/:id` nacheinander und zeichnet danach einmal. Eine Rückfrage vor dem Löschen. „Verschieben nach …“ steht nur, wenn jede gewählte Datei eine eigene ist. Scheitert eine Anfrage, nennt eine Meldung die Zahl |
| Auswahl in Liste und Kacheln | in beiden Ansichten dasselbe Kästchen; in der Bildleiste ein „Alle auswählen“ |
| `limitCloud()` | Zeilen nach `offsetTop` der Kinder; eine neue Zeile beginnt, wo `offsetTop` mehr als die halbe Höhe der ersten Zeile unter der vorigen liegt |

---

## 4. Die Bauabschnitte

### BA 1 — Schema

`video_positions` und `folder_open` in `db.js` mit Indizes: je Account und
Ziel höchstens eine Zeile (drei Teilindizes mit `WHERE … IS NOT NULL`).

### BA 2 — Ein Weg für Dateien

- `POST /api/items/:id/uploads` ohne Bedingung an den Testtag; `large` über
  „Anhang“; Grenze „Datei“.
- `POST /api/items/:id/attachments` und `attachmentUpload` entfallen.
- `typeFromBytes()` mit kompatiblen Marken; die Prüfung in
  `PUT /api/uploads/:id` entfällt.
- Import und Papierkorb schreiben jede Datei auf die Platte.
- Texte: `server.videoOnly`, `server.bigVideoFolder`, `server.folderHasDay`,
  `server.folderNoDay`, `server.uploadCap` entfallen; „Video am {dayOne}“ wird
  „Datei“.

### BA 3 — Umlagerung beim Start

- `qRelocatePending` und `relocateOne()` ohne Ordnerbedingung.
- Prüfung des Platzes vor `listen`; Umlagerung danach; Zahl für „Kennzahlen“.
- Verschieben und Zuweisen ohne eigene Umlagerung.

### BA 4 — Große Dokumente

`detail()`, Textvorschau, Abruf des Document Servers und Vorschaubild nach F9.

### BA 5 — Stelle im Video

Route, `detail()`, Browser im großen Bild und im Vollbild; Hinweis mit „Von
vorn“.

### BA 6 — Ordnerzustand

Route, `detail()`, `FOLDERS_OPEN` aus dem Eintrag; Sprung nur für die Ansicht.

### BA 7 — Auswahl

„Auswählen“ in „Dateien“ und in der Bildleiste, Kästchen, Leiste mit Zahl,
„Alle auswählen“, Kästchen im Ordnerkopf, Löschen, Verschieben; Tastatur und
Screenreader wie bei den Kacheln.

### BA 8 — Upload im Browser

Jede Datei in Stücken; `uploadRefusal()` nach der Grenze „Datei“; der Hinweis
„Seite offen lassen“ am Telefon bei jedem Upload.

### BA 9 — `limitCloud()`

### BA 10 — Texte

Deutsch, Englisch, Türkisch; Englisch und Türkisch höchstens 15 % länger.

### BA 11 — Der Prüfstand

- Neues Modul `test/release_050.js`.
- Eine Hilfe in `test/frame.js` lädt in Stücken hoch; die Module, die bisher
  `POST /api/items/:id/attachments` nutzen, nehmen sie.
- Die Umlagerung wird mit Zeilen geprüft, die der Test bei gestopptem Server in
  die Datenbank schreibt.
- Jede Zusage bekommt einen Rückbau in `counterproof.js`.

### BA 12 — Dokumentation und Zahlen

README (Speicher, Backup-Platz, Grenzen, Reverse Proxy), Handbuch, CHANGELOG
mit Kasten, Änderungsprotokoll, Fahrplan, `Doku/Entwicklung.md`,
`package.json`, Fingerprint.

---

## 5. Abnahme im Betrieb

1. Update mit Dateien in der Datenbank: Kriterion startet, „Kennzahlen“ zählt
   die ausstehenden, danach liegen alle unter `data/files/`.
2. Update mit zu wenig Platz: Kriterion startet nicht, das Protokoll nennt
   Bedarf und freien Platz.
3. Ein Video der A6700 (XAVC HS) in einen Ordner ohne Testtag laden und
   abspielen; ein PDF und eine `.docx` über „Anhang“.
4. Ein Video bis 1:30 ansehen, schließen, am Telefon öffnen: es geht bei 1:30
   weiter; „Von vorn“.
5. Zehn Testvideos auswählen und löschen; drei Dateien in einen Ordner
   verschieben; zehn Fotos in der Bildleiste löschen.
6. Einen Ordner aufklappen, den Eintrag verlassen, am anderen Gerät öffnen.
7. Backup: `kriterion-files/` enthält alle Dateien.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Backup mit sichtbaren Ständen | 0.51.0, Konzept zuerst |
| Fotos und Kommentarbilder auf der Platte | F4 nennt nur „Dateien“ |
| Die gemerkte Stelle im Export | persönlicher Zustand wie `user_settings` |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Zwei neue Tabellen; keine Datenmigration außer der Umlagerung aus F4.
3. Die Kommentarregel gilt.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Kommt eine Frage auf, die hier nicht beantwortet ist, wird sie als
   Fragetafel gestellt. Antwortet niemand, gilt der einfachere Weg, der kein
   Verhalten ändert.
