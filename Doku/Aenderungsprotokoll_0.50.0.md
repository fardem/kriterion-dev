# Änderungsprotokoll 0.50.0 — „Alle Dateien auf der Platte, Auswahl, Videos merken sich die Stelle“

**Gebaut am 30. September 2026 auf 0.49.0. Fingerprint `2b87077f`, davor
`210a7f57`.**

Nach `Doku/Auftrag_0.50.0.md` und dem Eintrag 0.50.0 im Fahrplan. Schema: ja,
zwei neue Tabellen `video_positions` und `folder_open`. Austauschformat: bleibt
22. Routen: `POST /api/items/:id/attachments` entfällt, `PUT /api/video-positions`
und `PUT /api/folders/:id/open` kommen dazu. Der Schlüssel `dayVideo` in
`UPLOAD_LIMITS` heißt `file`.

---

## 1. Vorgaben des Betreibers

Die Fragetafeln sind vor der ersten Zeile Code beantwortet worden, während des
Baus von 0.49.0. Der Auftrag führt sie als F1 bis F23.

| Datum | Vorgabe |
|---|---|
| 29. September 2026 | F1: Über „Anhang“ darf jede Datei, nicht nur Videos. Die Erkennung von Videos wird trotzdem erweitert (kompatible Marken im `ftyp`-Kasten), für Bildleiste und Kommentare |
| 29. September 2026 | F2: Die zweite Grenze heißt „Datei“ |
| 29. September 2026 | F3: eigene Runde mit eigenem Pull Request nach 0.49.0 |
| 29. September 2026 | F4: Alles unter „Dateien“ liegt verschlüsselt auf der Platte; der Bestand wird nach dem ersten Start aus der Datenbank umgelagert; ein Weg für Dateien |
| 29. September 2026 | F5: überall bis „Datei“ (Vorgabe 2048 MB), mit und ohne Ordner |
| 29. September 2026 | F6: Upload nur in Stücken; `POST /api/items/:id/attachments` entfällt |
| 29. September 2026 | F7: Umlagerung im Hintergrund nach dem Start, Datei für Datei, mit voriger Fassung |
| 29. September 2026 | F8: Reicht der Platz nicht, verweigert Kriterion den Start; das Protokoll nennt den fehlenden Platz (nicht die Empfehlung) |
| 29. September 2026 | F9: Über „Anhang“ zeigt der Browser PDF weiter selbst; Word, Excel und Text nur herunterladen; Bilder und Videos wie bisher |
| 29. September 2026 | F10: „Anhang“ bleibt die Schwelle für Export mit Inhalt, Vorschau und Document Server; darüber im Export nur der Name |
| 29. September 2026 | F11: Stelle im Video je Account am Server, neue Tabelle |
| 29. September 2026 | F12: für alle Videos: Dateien, Bildleiste, Kommentare (nicht die Empfehlung) |
| 29. September 2026 | F13: automatisch an der Stelle; „ab 3:12“ mit „Von vorn“ steht einige Sekunden |
| 29. September 2026 | F14: unter 10 s nichts merken; in den letzten 5 % oder 10 s gilt das Video als gesehen |
| 29. September 2026 | F15: „Auswählen“ im Kopf von „Dateien“ und der Bildleiste; Kästchen je Kachel; Leiste mit Zahl, „Löschen“, „Abbrechen“ |
| 29. September 2026 | F16: Löschen und Verschieben (nicht die Empfehlung); „Verschieben nach …“ für die eigenen Dateien |
| 29. September 2026 | F17: Kacheln ohne Recht sind nicht wählbar; dieselben Regeln wie beim einzelnen Löschen |
| 29. September 2026 | F18: „Alle auswählen“ in der Leiste, ein Kästchen im Kopf jedes Ordners |
| 29. September 2026 | F19: 0.50.0 statt 0.49.1, weil neue Funktionen dazukommen |
| 29. September 2026 | F20: Ein Ordner bleibt offen oder zu, auch nach dem Verlassen des Eintrags |
| 29. September 2026 | F21: je Account am Server, neue Tabelle |
| 29. September 2026 | F22: Ein Sprung öffnet nur für die Ansicht; gemerkt wird der Klick auf den Ordnerkopf; ein neuer Ordner steht offen |
| 29. September 2026 | F23: `limitCloud()` erkennt eine zweite Zeile an `offsetTop` (Befund: „mehr“ an einem Testtag ohne verborgene Tags) |
| 30. September 2026 | „Baue bitte 0.50.0“ |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.49.0.

| | 0.49.0 | 0.50.0 |
|---|---:|---:|
| Tabellen | 39 | **41** |
| Schreibende Routen | 88 | **89** |
| Routen insgesamt | 123 | **124** |
| Anweisungen auf `attachments.data` | 23 | **22** |
| Schlüssel je Sprachdatei | 1.327 | **1.341** |
| Regelzeilen des Stilblatts | 1.901 | **1.944** |
| Protokollzeilen in den sechs Dateien | 73 | **74** |
| Kommentarzeilen | 6.921 in 46 Dateien | **6.931 in 47** |
| Dateien des Prüfstands samt `counterproof.js` | 30 | **31** |
| Rückbauten | 1.376 | **1.390** |
| Prüfungen im Prüfstand | 7.806 | **7.848** |

---

## 3. Was gebaut ist

**Ein Weg für Dateien** (`server.js`, `attachments.js`). `POST
/api/items/:id/uploads` nimmt jeden Ordner und keinen Ordner; in einen Ordner
lädt nur, wer ihn angelegt hat. `large` in `uploads` und `disk_files` heißt
über „Anhang“. Die Grenze ist `Math.max(attachment, file)` MB; darüber 413 mit
`server.uploadSize`. `POST /api/items/:id/attachments`, `attachmentUpload` und
`FILES_PER_REQUEST` entfallen; höchstens 100 Dateien je Eintrag bleiben
(`fileSlots()` zählt offene Uploads mit). Die Prüfung der ersten Bytes in `PUT
/api/uploads/:id` entfällt. `typeFromBytes()` liest den `ftyp`-Kasten bis 256
Bytes und erkennt MP4 auch an einer kompatiblen Marke (Sony XAVC HS: Hauptmarke
`XAVC`, kompatibel `mp42` und `iso2`). Import und Papierkorb legen jede Datei
mit Inhalt auf die Platte. Das Kachelbild einer Bilddatei entsteht beim ersten
Abruf, das Vorschaubild einer Textdatei in der Warteschlange nach dem Upload.

**Grenze „Datei“.** `UPLOAD_LIMITS.file`, 1 bis 4096 MB, Vorgabe 2048, statt
`dayVideo`. Ein gespeicherter Wert für `dayVideo` wird nicht übernommen.
`videoTypes` in `GET /api/settings` entfällt, der Browser braucht die Liste
nicht mehr. Die Karte „Grenzen beim Hochladen“ erklärt „Anhang“ in einem Satz.

**Umlagerung beim Start.** `qRelocatePending` nennt jede Datei ohne Zeile in
`disk_files`. Vor `listen` rechnet `relocationRoom()` den Bedarf (`encLen()` je
Datei und voriger Fassung) gegen `diskFree()`; reicht er für Dateien und
`DB_SPARE` (1 GB) nicht, schreibt `logFail()` Zahl, Bedarf, Reserve und freien
Platz, und der Prozess endet mit Code 1. Nach `listen` lagert `relocate()` im
Lauf `diskRun()` eine Datei nach der anderen um; `RELOCATING` verhindert einen
zweiten Lauf gleichzeitig. Verschieben und Zuweisen lagern nicht mehr selbst
um. „Kennzahlen“ nennt `attachmentCount` als „noch in der Datenbank“, nur wenn
es welche gibt.

**Große Dokumente.** Über „Anhang“ nennt `detail()` `preview` nur für Bild,
Video und PDF, sonst `keine`; `edit` ist `false`, es gibt kein Vorschaubild
eines Dokuments. Textvorschau und `GET /api/attachments/:id/office` sagen mit
`server.largeDownloadOnly` ab; der Abruf des Document Servers liefert 404.

**Stelle im Video.** Tabelle `video_positions`; `PUT /api/video-positions`
mit `kind` (`file`, `photo`, `comment`), `id`, `seconds` und `duration`.
Gelöscht wird die Zeile unter 10 s und ab `duration − max(10, 5 % von
duration)`. `detail()` nennt `position` an Videodateien, Fotos der Art Video und
Kommentarvideos, nur für den eigenen Account, in einer Abfrage je Eintrag. Im
Browser setzt `watchSpot()` das Video beim ersten Abspielen an die Stelle, wenn
es unter 1 s steht, zeigt „ab 3:12“ mit „Von vorn“ für 5 s und speichert beim
Anhalten, alle 15 s und bei `stop()` mit `fetch(…, { keepalive: true })`. Die
Übergabe eines laufenden Videos ins Vollbild bleibt, wie sie war.
`renderDetail()` wartet vor dem Laden auf offene Speicherungen.

**Ordnerzustand.** Tabelle `folder_open`; `PUT /api/folders/:id/open` mit
`open` (true oder false), 204; das Anlegen eines Ordners legt die Zeile für den
Verfasser an. `detail()` nennt `open` je Ordner. Beim Öffnen eines Eintrags
kommt `FOLDERS_OPEN` aus `open`; nur `toggleFolder()` schreibt an den Server.

**Auswahl** (`public/app.js`, `public/style.css`). Unter „Dateien“:
`filesPicked`, Kästchen `.acheck` in jeder Kachel und Zeile, `role="checkbox"`
an der Fläche, `aria-disabled` an nicht wählbaren; `.afolder-check` im
Ordnerkopf mit `mixed`; die Leiste `#apick` klebt unten am Fenster. Löschen und
Verschieben rufen die bestehenden Routen je Datei nacheinander
(`eachPicked()`), mit einer Rückfrage vor dem Löschen; scheitert eine Anfrage,
nennt eine Meldung die Zahl und den ersten Grund, die übrigen bleiben gewählt.
In der Bildleiste: `photosPicked`, Kästchen je Kachel mit Tastatur, danach ein
`GET /api/items/:id`. Esc beendet beide.

**`limitCloud()`.** `cloudTops()` sammelt `offsetTop` der Kinder; eine neue
Zeile beginnt, wo ein Kind mehr als die halbe Höhe der ersten Zeile tiefer
liegt. Die Begrenzung endet vor der ersten verborgenen Zeile. `cloudRows()`
zählt dieselben Zeilen.

**Texte.** 14 Schlüssel dazu (Auswahl, Stelle im Video, `card.diskPending`,
`card.limitAttachmentHint`), drei weg (`entry.dayLimitHint`,
`entry.dayAddLimit`, `server.bigVideoFolder`); „große Videos“ heißt in
„Kennzahlen“, Export und Papierkorb „über „Anhang““.

**Dokumentation.** README: Speicher, Funktionen, Update mit Umlagerung und
Platz, NPMplus ohne `attachments`, Upload über eigene Skripte, Document Server
bis „Anhang“. Handbuch: Fotos und Videos, Dateien, Ordner, Grenzen, Kennzahlen,
Export.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| Wartende Dateien in „Kennzahlen“ | die bestehende Zahl `attachmentCount` statt eines neuen Feldes `pending` | beide zählen dieselben Zeilen; die Zeile „Dateien“ der Datenbank hieß sonst immer 0 |
| `server.uploadCap` | bleibt | Fotos und Kommentarbilder nutzen ihn weiter; der Auftrag nannte ihn unter den entfallenden |
| Abfragen am Start | `qVideoTarget` über `lateStatement()` | ohne `photos.kind` startete der Server sonst nicht; gefunden von „Und die ganze Instanz ebenso“ |
| Stelle ohne Dauer | wird gemerkt, wenn sie ab 10 s liegt | der Browser kennt die Dauer erst nach den Metadaten |
| Stelle beim Weiterspielen | nur, wenn das Video unter 1 s steht | sonst sprang ein laufendes Video bei der Übergabe ins Vollbild zurück |
| Kachelbild einer Bilddatei | beim ersten Abruf | derselbe Weg wie für Dateien auf der Platte in 0.48.0 und 0.49.0 |
| Text in „+“ | `fmtMb()` („bis 2 GB“) | 2048 MB lesen sich schlecht |
| Türkisch `entry.videoToFiles` | „Uzun videolar “Dosyalar” altına yüklenir.“ | die erste Fassung war 23 % länger als Deutsch |

---

## 5. Der Prüfstand

Neues Modul `test/release_050.js` auf der Portbasis 7340, eingetragen hinter
`release_049`.

| Gruppe | Prüfungen |
|---|---:|
| Umlagerung: der Bestand der Datenbank geht nach dem Start auf die Platte | 4 |
| Umlagerung: zu wenig Platz verweigert den Start | 4 |
| Umlagerung: Absturz mittendrin | 1 |
| Ein Weg fuer Dateien: Grenze „Datei" und Erkennung | 5 |
| Grosse Dokumente: nur zum Herunterladen | 4 |
| Stelle im Video: Regeln am Server | 5 |
| Ordner: offen oder zu je Account | 4 |
| Auswahl unter „Dateien" im Browser | 6 |
| Auswahl in der Bildleiste im Browser | 3 |
| Stelle im Video im Browser | 4 |
| Ordnerzustand im Browser | 3 |
| Texte und Kennzahlen im Browser | 2 |

Die Umlagerung prüft das Modul mit Zeilen, die es bei gestopptem Server in die
Datenbank schreibt; den Startabbruch mit dem Schalter `free=1` und
`spawnSync()`.

**Hilfe in `test/frame.js`:** `sendFiles()` lädt wie die Oberfläche in Stücken
hoch. `test/roundtrip.js`, `test/ui_export.js` und `test/release_041.js` bis
`test/release_049.js` nutzen sie statt der entfallenen Route. `test/dom.js`
beantwortet den Beginn eines Uploads.

**Umgeschrieben:** `test/release_045.js` (100 je Eintrag ohne Grenze je
Anfrage; die Warteschlange mit Beginn über `fetch` und Stücken über
`XMLHttpRequest`; ohne Verbindung scheitert schon der Beginn),
`test/release_047.js` (Hochladen in Ordner: `folderId` beim Beginn),
`test/release_048.js` (Weg, Endungen und erste Bytes nach den neuen Regeln;
Verschieben und Zuweisen ohne Umlagerung; Import legt alles auf die Platte),
`test/ui_overview.js` und `test/release_030.js` (Wolken mit gesetztem
`offsetTop`), `test/release_044.js` und `test/release_049.js` (Kachel beim
Abruf, Textvorschaubild nach dem Upload).

**Angepasst:** `test/source.js` (89 schreibende und 124 Routen, `finishUpload()`
schreibt den Verfasser, 22 Anweisungen auf `data`, 74 Protokollzeilen, 1.944
Regelzeilen, sieben Hochladerouten, 192 Zuweisungen an `innerHTML`, 31 und 47
Dateien), `test/roundtrip.js` (41 Tabellen, 34 Aufrufe von `detail()`, 81 von
89 Routen hinter dem CSRF-Schutz, der Papierkorb mit Dateien auf der Platte),
`test/selfcheck.js` (Grenzwerte der Kommentarzeilen, 47 Dateien).

**Rückbauten.** 1460 bis 1486 neu. Umgelenkt: 543, 947, 948, 949, 1226, 1255,
1313, 1323, 1329, 1332, 1342, 1347, 1376, 1408 und 1459. Gestrichen, weil die
Zusage entfallen ist: 1288 (die Kachel beim Upload; der Abruf trägt eine eigene
Gegenprobe), 1348 bis 1355 (Ordner mit Testtag als einziger Weg, Endung und
erste Bytes großer Videos), 1370, 1371 und 1374 (Umlagerung beim Verschieben
und Zuweisen), 1425 (Textvorschaubild im Upload in einer Anfrage).

Gefahren mit `counterproof.js`, drei Spuren, auf `ba8411b`: 543, 947, 948 und
949 **rot**, jeder in seiner erwarteten Gruppe. Der Lauf ist danach für den
vollständigen `npm test` vor dem Push angehalten worden; die übrigen 37 folgen
auf dem gepushten Stand.

---

## 6. Nicht geprüft und offen

- Eine echte Umlagerung eines großen Bestands: gemessen ist sie nur mit
  wenigen Dateien. Die Dauer wächst mit der Größe; jede Datei wird einmal
  gelesen, verschlüsselt und geschrieben.
- Eine echte XAVC-HS-Datei: geprüft mit dem Kopf der Datei aus dem Befund
  (`XAVC`, kompatibel `mp42`). Ob der Browser sie abspielt, hängt am Codec.
- Die Oberfläche ist in Chromium bei 1280 px angesehen worden: Auswahl unter
  „Dateien“ und in der Bildleiste, Hinweis „ab 3:12“; Tastatur und
  Screenreader mit jsdom.
- Das Speichern der Stelle beim Schließen des Tabs (`pagehide` mit
  `keepalive`) ist nicht im Prüfstand; jsdom kennt `keepalive` nicht als
  Verhalten.
