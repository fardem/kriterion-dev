# Auftrag 0.48.0 — „Testtage und Dateien auf der Platte“

**Erteilt am 29. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. Grundlage sind `Doku/Konzept_Dateien_und_Ordner.md`,
Version 2, und der Eintrag 0.48.0 in `Doku/Fahrplan.md`. Vor der ersten Zeile
Code werden die Fragen aus Abschnitt 0 in einer Fragetafel gestellt.

Zeilennummern gelten für `dff8066` (0.47.1). Das Konzept nennt Zeilen von
0.44.2; wo sie abweichen, gelten die Zeilen hier. Abschnittsnummern wie „6.3“
und Regeln wie „R18“ meinen das Konzept.

---

## 0. Vor dem Bau: die offenen Fragen

| Nr. | Frage | Antworten | Empfehlung |
|---|---|---|---|
| D1 | Ein Upload in Stücken läuft, und sein Ordner wird gelöscht. Was geschieht mit der Datei? | a) Der Upload läuft zu Ende; die Datei steht danach ohne Ordner und bleibt auf der Platte (6.4, R9, R18) · b) wie C2 in 0.47.0: ⚠ „Diesen Ordner gibt es nicht mehr.“, im Menü nur „Entfernen“; der Server löscht den offenen Upload | **a)**: Ein gelöschter Ordner lässt seine Dateien stehen (Vorgabe 17), und ein laufender Upload gehört dazu. Mit b) wären bei einem Video von 2 GB alle schon gesendeten Stücke verloren. C2 gilt weiter für den Upload in einer Anfrage und für jeden Upload, der noch wartet. |
| D2 | Was nennt die README für den Reverse Proxy bei den neuen Adressen? `PUT /api/uploads/…` trägt bis 8 MiB je Anfrage, `GET /api/attachments/…/raw` ein Video bis 4 GB; nginx puffert beides nach Vorgabe als Klartext in Zwischendateien (6.8). | a) Die Location aus 0.47.0 nimmt `uploads/[0-9a-f]{32}` dazu und bekommt zusätzlich „Disable Request Buffering“; eine zweite Location für `^/api/attachments/[0-9]+/raw$` bekommt „Disable Response Buffering“, AppSec bleibt dort an · b) wie a), aber `uploads` in einer eigenen Location mit AppSec, weil 8 MiB unter der Grenze von 10 MB liegen · c) nur die nginx-Zeilen `proxy_request_buffering off;` und `proxy_buffering off;` wie in 6.8, ohne NPMplus | **a)**: eine Location für alle Uploads, wie der Betreiber sie schon eingerichtet hat. Bei b) prüft die WAF jedes Stück eines Videos, bei 2 GB 256 Anfragen. `/raw` hat keinen Rumpf; dort stört AppSec nicht. |

Alle übrigen Punkte sind entschieden (Abschnitt 3).

---

## 1. Das Ziel

- Ein Ordner lässt sich einem eigenen Testtag desselben Eintrags zuweisen,
  beim Anlegen und über „Bearbeiten …“. Ein Testtag hat höchstens einen Ordner.
- Die Testtagzeile zeigt dann 📁; ein Klick öffnet Block und Ordner. Der
  Ordnerkopf zeigt „↑ 12.09.2026“ und führt zurück. Der Ordner hat die Adresse
  `#/item/x/folder/y` und im Menü „Link kopieren“.
- Was zu einem Testtag gehört, liegt verschlüsselt unter `data/files/`. Alles
  andere bleibt in der Datenbank (F14).
- Jede Datei in einen Ordner mit Testtag geht in Anfragen zu 8 MiB hoch; ein
  unterbrochener Upload lässt sich fortsetzen.
- Videos über der Grenze „Anhang“ gehen bis zur neuen Grenze „Video am
  {dayOne}“ (Vorgabe 2048 MB) und nur in einen Ordner mit Testtag.
- Verschieben in einen solchen Ordner und das Zuweisen eines Testtags lagern
  Dateien aus der Datenbank auf die Platte um. Zurück geht keine (R18).
- Jeder Löschweg erfasst Dateien auf der Platte. Backup, Papierkorb, Export
  (Format 22), Import, „Kennzahlen“ und `keytool.sh` kennen sie.

---

## 2. Der Anlass

| Anlass | Stand am 29. September 2026 |
|---|---|
| Ordner und Testtag | `folders.test_day_id` besteht seit 0.47.0 und ist überall leer; `PUT /api/folders/:id` (`server.js:3947`) weist `testDay` mit 400 ab |
| Speicher | jede Datei als Blob in `attachments.data`; die Grenzen (`UPLOAD_LIMITS`, `server.js:389-395`) enden bei 100 MB, weil multer eine Datei ganz im Arbeitsspeicher hält (`attachmentUpload`, `server.js:3672`) |
| Hochladen | eine Anfrage je Datei (`uploadSend()`, `app.js:4867`) an `POST /api/items/:id/attachments` (`server.js:3704`); ein Abbruch verliert alles Gesendete |
| Auslieferung | `GET /api/attachments/:id/raw` (`server.js:3749`) liest aus der Datenbank, Range über `sendRanged()` (`server.js:3592`) |
| Testtagzeile | `drawTestDays()` (`app.js:6243`) kennt keinen Ordner; gesprungen wird nur zu Kommentaren (`commentJump()`, `app.js:2160`; `GLANCE`, `app.js:946`) |
| Document Server | Abruf aus `attachments.data` (`server.js:818`); `saveEdited()` (`server.js:857-871`) schreibt dorthin, die vorige Fassung nach `attachment_previous` (`keepPrevious`, `replaceFile`, `countSave`, `server.js:842-848`) |
| Papierkorb, Export, Import | `intoTrash()` (`server.js:5685`), `PART_SIZES` (`:4889`), `entryTooLarge()` (`:4933`), `importPrepare()` (`:5269`), `importInto()` (`:5394`), `exportSum()` (`app.js:147`); Format 21 (`server.js:4583`) |
| Backup | `POST /api/backup` (`server.js:6028`) sichert nur die Datenbank; `checkPlace()` (`:5813`), „Alte Backups“ `POST /api/backup/cleanup` (`:6085`); das Handbuch sagt „nie in Unterordnern“ (`manual-de.md:621-622`) |
| Kennzahlen | `GET /api/stats` (`server.js:4500`) zählt alle Dateien als Teil der Datenbank |
| Schlüsselwechsel | `keytool.sh:79` kopiert `data` ganz; `:100` nennt `rm -rf data` als Rückweg |
| Reverse Proxy | „Hinter einem Reverse Proxy“ (`README.md:358-389`) nennt die Größe je Anfrage und AppSec für die Upload-Adressen, nichts zum Puffern |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 27./28. September 2026 | Große Videos liegen verschlüsselt neben der Datenbank (Konzept, Anhang B, Nr. 1) |
| 27./28. September 2026 | AES-256-GCM in Stücken zu 1 MB, Stücknummer im Nonce, Datei-ID als AAD, ein Schlüssel je Datei in der Datenbank (Nr. 2) |
| 27./28. September 2026 | Upload in Stücken zu 8 MB, fortsetzbar; der Server prüft Größe, Offset, Platz und die ersten Bytes; Verfall nach 24 h; neue Grenze mit Vorgabe 2048 MB (Nr. 3) |
| 27./28. September 2026 | H.264 und HEVC; spielt der Browser nicht ab, bleibt der Download (Nr. 4) |
| 27./28. September 2026 | Der Backup-Knopf kopiert die Videos, die im Backup-Ordner fehlen (Nr. 5) |
| 27./28. September 2026 | Hochladen darf, wer den Testtag bearbeiten darf; mehrere Videos je Testtag (Nr. 6, 7) |
| 27./28. September 2026 | Der Export nennt große Videos nur mit Namen; endgültig gelöscht heißt Datei weg (Nr. 8) |
| 27./28. September 2026 | Ordner und Testtag höchstens 1:1; Symbol in der Testtagzeile, Sprung, Link zurück (Nr. 13) |
| 28. September 2026 | F1: Über „Anhang“ nur Videos, mit Prüfung der ersten Bytes |
| 28. September 2026 | F4: In einen Ordner lädt nur, wer ihn angelegt hat; verbunden wird nur mit einem eigenen Testtag |
| 28. September 2026 | F8: Unbekannte Dateien unter `data/files/` melden; „Löschen“ für den Eigentümer-Admin nur mit einer Kopie gleicher Länge im Backup-Ordner |
| 28. September 2026 | F11, F14: Alles in einem Ordner mit Testtag liegt auf der Platte; Verschieben hinein und Zuweisen lagern um, zurück nie |
| 28. September 2026 | F12: Große Videos nur in einem Ordner mit Testtag |
| 28. September 2026 | F13: Die zweite Grenze heißt „Video am {dayOne}“, 1 bis 4096 MB, Vorgabe 2048 MB |
| 28. September 2026 | F15: kein Verzeichnis je Ordner |
| 28. September 2026 | F16: Der Export trägt jede Datei bis „Anhang“ mit Inhalt, große Videos nur mit Namen |

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.48.0**, MINOR. Schema: ja, drei neue Tabellen und drei Trigger. Austauschformat: 21 → 22 |
| Regeln | R1 bis R18 gelten wörtlich |
| Tabellen und Trigger | `uploads`, `disk_files`, `disk_files_gone`; die Trigger `disk_files_orphaned`, `disk_files_held`, `disk_files_kept` (5.1). `installTriggers()` in `db.js` ohne Rückfall |
| Verzeichnisse | `data/files/` und `data/files/upload/`, 0700; Dateien 0600; Namen nur aus `crypto.randomBytes(16)`, vor jedem Pfad gegen `^[0-9a-f]{32}$` geprüft; keine Route nimmt einen Namen an (5.2) |
| Verschlüsselung | nach 6.1; `file_key` lesen nur zwei benannte Anweisungen mit aufgezählten Spalten, `SELECT *` auf `disk_files` und `uploads` gibt es nicht |
| Routen | vier neue: `POST /api/items/:id/uploads`, `PUT /api/uploads/:id`, `DELETE /api/uploads/:id`, `DELETE /api/files/unknown`. `POST /api/items/:id/folders` und `PUT /api/folders/:id` nehmen `testDay` an |
| Rechte | nach Konzept 4. Zuweisen: eigener Ordner an eigenen Testtag desselben Eintrags; ein belegter Testtag 409; auch der Admin verbindet nicht |
| Upload in Stücken | Beginn 6.2, Anfrage und Nonce-Regel 6.3, Abschluss 6.4. `POST /api/items/:id/attachments` weist einen Ordner mit Testtag mit 409 und dem Stand des Ordners ab |
| Umlagerung | nach 6.5, beim Verschieben und beim Zuweisen; ohne eigene Route, ohne Fortschrittsanzeige |
| Document Server | nach 6.6: jede Speicherung eine neue Datei; die vorige Fassung wie heute; Wiederherstellen tauscht die Besitzer |
| Auslieferung | nach 6.8: Strom mit Range, jedes Stück vor der Ausgabe geprüft, HEAD ohne Entschlüsseln; ganz entschlüsselt nur Dateien, die kein großes Video sind |
| Löschwege und Läufe | nach 7.1 und 7.2 |
| Papierkorb, Export, Import | nach 7.3. Format 22 trägt je Ordner `testDay` als Stelle im Feld der Testtage |
| Backup | nach 7.4 |
| Kennzahlen | nach 7.5 |
| Schlüsselwechsel | `keytool.sh` nach 7.6 |
| Ordner im Browser | Dialog mit „Name“ und „{dayOne}“ (3.5); Reihenfolge nach Datum des Testtags, sonst Tag des Anlegens, neueste oben; Menü mit „Link kopieren“ |
| Testtagzeile und Sprung | nach 3.6 |
| Hochladen im Browser | nach 3.4 und 6.7 |
| Bildleiste | Hinweis bei zu großem Video: „Längere Videos gehören unter „Dateien“ in einen Ordner mit {dayOne}.“ (3.8) |
| Upload in gelöschten Ordner | nach D1 |
| Reverse Proxy in der README | nach D2 |

---

## 4. Die Bauabschnitte

### BA 1 — Schema und Trigger

- `uploads`, `disk_files` und `disk_files_gone` mit Spalten, Beziehungen und
  Indizes aus 5.1. Sie entstehen beim Start mit `db.exec(SCHEMA)`.
- Die drei Trigger aus 5.1. `installTriggers()` in `db.js`: DROP und CREATE in
  einer Transaktion, nur bei abweichendem Text; ein Fehler bricht den Start ab.
- Beim Start `data/files/` und `data/files/upload/` anlegen, 0700.

### BA 2 — Verschlüsselung

- In `attachments.js`, kein neues Modul: `encLen(n)`, ein Stück verschlüsseln,
  ein Stück prüfen und entschlüsseln, eine Datei ganz entschlüsseln.
- Jedes Stück wird positionsgenau gelesen. Zu wenige Bytes, eine falsche Marke
  oder eine fehlende Datei gelten als beschädigt.

### BA 3 — Upload in Stücken

- Die drei Upload-Routen nach 6.2 und 6.3, mit der Reihenfolge der Prüfungen
  dort. `uploadTurn` prüft vor dem Rumpf, wie `entryAuthorOnly` vor multer.
- `express.raw` mit `limit: '8mb'` und `inflate: false`. Der Fehler-Handler
  übersetzt jedes `err.type` von body-parser und protokolliert
  `request.aborted` ohne Stack.
- Die ersten 12 Bytes eines großen Videos prüft `typeFromBytes()`
  (`attachments.js:101`) vor dem Verschlüsseln; sonst 415, der Upload ist
  gelöscht, nichts ist verschlüsselt.
- Abschluss nach 6.4: nur diese Transaktion mit `synchronous = FULL`, danach
  `renameSync()`.
- Platz nach 6.2; scheitert `statfs`, wird nicht abgelehnt, wie in
  `importSpace()` (`server.js:5074`).
- `POST /api/items/:id/attachments` weist einen Ordner mit Testtag mit 409 ab.
- Upload in einen gelöschten Ordner nach D1.

### BA 4 — Testtag zuweisen und Umlagerung

- `POST /api/items/:id/folders` (`server.js:3936`) und `PUT /api/folders/:id`
  (`server.js:3947`) nehmen `testDay` an: eine Nummer oder `null`. Fremder
  Testtag oder anderer Eintrag 403, belegter Testtag 409.
- Umlagerung nach 6.5 beim Zuweisen und beim Verschieben in einen Ordner mit
  Testtag (`PUT /api/attachments/:id/folder`, `server.js:3972`), samt voriger
  Fassung und Vergleich von `saves`; danach `reclaim()` (`server.js:543`).
- `detail()` (`server.js:2613`) liefert `folders[].testDay`,
  `testDays[].folder`, je Datei `missing` und `uploads` nach 5.2. Die Ordner
  stehen nach dem Datum ihres Testtags, sonst nach `created_at`, neueste oben.
- Testtag löschen (`DELETE /api/test-days/:id`, `server.js:4103`) lässt den
  Ordner mit Namen und Dateien stehen, auch wenn der Admin löscht.

### BA 5 — Auslieferung

- `/raw` (`server.js:3749`) für eine Datei auf der Platte nach 6.8: Range, 416,
  HEAD mit `fstat`, `Cache-Control: no-transform`, keine Kompression. Das erste
  Stück wird geprüft, bevor 200 oder 206 hinausgeht; jedes weitere geht erst
  nach `final()` hinaus, das nächste wird erst nach `drain` entschlüsselt.
- Ganz entschlüsselt werden: die Vorschau von Text und `.docx`
  (`server.js:3834`), das Vorschaubild eines Bildes (`fileTile`,
  `server.js:3702`), der Abruf des Document Servers (`server.js:818`) und der
  Export. Ein großes Video nie.

### BA 6 — Document Server auf der Platte

- `saveEdited()` (`server.js:857-871`) nach 6.6. `replaceFile` schreibt in die
  Datenbank nur `WHERE NOT EXISTS (… disk_files …)`; ohne Treffer antwortet der
  Callback `{error: 1}`.
- Wiederherstellen (`POST /api/attachments/:id/previous`, `server.js:3890`)
  tauscht die Besitzer in einer Transaktion; die Größe kommt aus `size`, nicht
  aus `data.length`.

### BA 7 — Löschwege und Läufe

- Jeder Weg aus 7.1. `intoTrash()` (`server.js:5685`) setzt `trash_id` vor
  `DELETE items`.
- Wiederherstellen aus dem Papierkorb (`server.js:5734`) prüft in seiner
  Transaktion zuerst die Zeile in `trash`; `DELETE /api/trash/:id`
  (`server.js:5766`) und `cleanupTrash()` (`:5669`) lassen ein laufendes
  Wiederherstellen aus.
- `sweepDisk()` nach 7.2, nur in `server.js` im Haupt-Thread; die sechs
  Schritte beim Start und stündlich. Bei `DATABASE_INCOMPLETE`
  (`server.js:201`) entfallen die Schritte 2 bis 4 und 6.

### BA 8 — Papierkorb, Export, Import

- Nach 7.3. `EXCHANGE_FORMAT` 21 → 22 (`server.js:4583`).
- `entryTooLarge()`, `PART_SIZES` und `exportSum()` zählen eine Datei auf der
  Platte mit `disk_files.size` und ein großes Video mit 0 Bytes;
  `entryTooLarge()` zählt dazu die offenen Uploads bis „Anhang“.
- Der Exportdialog nennt vorher „Nicht enthalten: 3 große Videos (5,4 GB). Sie
  sichert das Backup.“; die Rückfrage vor „ersetzen“ nennt Zahl und Größe
  ebenso.
- Der Import zählt und nennt jede Datei ohne Inhalt und legt Dateien eines
  Ordners mit Testtag auf die Platte.

### BA 9 — Backup und Zurückspielen

- Nach 7.4: Liste `.files`, Kopien unter `kriterion-files/`, Lockfile, 202 mit
  Abfrage der Karte alle 2 s; 200 wie heute, wenn nichts zu kopieren ist.
- `checkPlace()` (`server.js:5813`) weist das Segment `kriterion-files` ab.
  „Alte Backups“ (`server.js:6085`) nimmt dieselbe Sperre und ruft
  `cleanBackupFiles()`.

### BA 10 — Kennzahlen

- `GET /api/stats` (`server.js:4500`) und die Karte „Kennzahlen“ nach 7.5.
- `DELETE /api/files/unknown` nur für den Eigentümer-Admin (`isOwner()`,
  `server.js:917`), mit der Sperre des Backups.
- Die Karte „Papierkorb“ nennt je Eintrag die Größe mit seinen Dateien auf der
  Platte (`qTrash`, `server.js:5658`).

### BA 11 — Die Grenze „Video am {dayOne}“

- `UPLOAD_LIMITS` (`server.js:389-395`) bekommt die sechste Grenze: 1 bis
  4096 MB, Vorgabe 2048, Schlüssel `card.limitDayVideo`. Der Kommentar darüber
  gilt dann nur noch für die fünf übrigen.
- `GET /api/settings` liefert die Grenzen und die Videoendungen
  (`VIDEO_TYPES`, `attachments.js:14`).
- Liegt „Video am {dayOne}“ nicht über „Anhang“, nimmt Kriterion keine großen
  Videos an.

### BA 12 — Ordner, Testtagzeile und Sprung im Browser

- Ein Dialog mit „Name“ und „{dayOne}“ für „Ordner hinzufügen“ und
  „Bearbeiten …“, statt `nameBox()` (`app.js:368`). Bis zur Antwort des
  Servers bleibt er offen, weil das Zuweisen umlagert.
- Ordnerkopf mit „↑ 12.09.2026“; „Link kopieren“ in `folderMenuItems()`
  (`app.js:6856`); die Adresse `#/item/x/folder/y` im Router.
- `drawTestDays()` (`app.js:6243`) mit 📁 hinter dem Wochentag, 44 px; am
  Telefon bricht die Zeile um.
- `commentJump()` (`app.js:2160`) wird `jumpTo(element)`. Ein Set wie `GLANCE`
  (`app.js:946`) hält Sprünge fest; ein Klick auf den Kopf eines so geöffneten
  Blocks schreibt `BLOCKS.closed` nicht.

### BA 13 — Hochladen im Browser

- Die Warteschlange (`queueUploads()`, `app.js:4849`) wählt den Weg nach dem
  Ziel: in einen Ordner mit Testtag in Stücken, sonst wie heute (6.7).
- Prüfung vor dem Senden nach 3.4, Schritt 2, mit beiden Grenzen und den
  Videoendungen des Servers.
- Zustände nach 3.4: ⏸ mit Stand und Verfall, Fortsetzen mit derselben Datei,
  fremde Uploads mit Uhrzeit, Kopfleiste „↑ 23 %“, Rückfrage beim Schließen
  (`beforeunload`, `app.js:5020`), `navigator.wakeLock` und am Telefon „Seite
  offen und Bildschirm an lassen.“
- `aria-live="polite"` meldet Beginn, je 25 %, Ende und Fehler.
- Die Bildleiste nennt bei einem zu großen Video den Hinweis aus 3.8.

### BA 14 — `keytool.sh`

- Zeile 79 kopiert `data` ohne `data/files/`, Zeile 100 nennt einen Rückweg,
  der `data/files/` stehen lässt (7.6).

### BA 15 — Texte

Neue Schlüssel in `de.json`, `en.json` und `tr.json`, jeder mit einem Leser im
Code: `card.limitDayVideo`, `server.bigVideoFolder`, `server.videoOnly`, die
Meldungen und Zustände aus 3.4, der Exporthinweis, die Zeilen der Karte
„Kennzahlen“ und die Rückfrage vor „Löschen“ aus 7.5, das Feld „{dayOne}“ im
Dialog, das Testtagsymbol, die Rückfrage beim Löschen eines Testtags mit
Ordner, der Hinweis der Bildleiste. `entry.fileLimitHint` nennt im Ordner mit
Testtag beide Grenzen. „Testtag“ steht nur als `{dayOne}` ohne Artikel,
außer im Namen der Grenze.

### BA 16 — Der Prüfstand

Neues Modul `test/release_048.js` auf der Portbasis 7340, eingetragen hinter
`release_047`.

- Die Tests setzen „Anhang“ auf 1 MB; ein Video von 20 MB geht dann in drei
  Anfragen über 20 Stücke. Ein Testschalter stellt die Uhr. Rechte mit zwei
  echten Sitzungen.
- Jede Zusage der Version 3 aus Anhang A.3 bekommt eine Prüfung und ihren
  Rückbau in `counterproof.js`; dazu D1 mit dem Rückbau „der Upload in einen
  gelöschten Ordner geht verloren“ bzw. „er landet ohne Rückmeldung ohne
  Ordner“, je nach Antwort.
- Die Liste aus Anhang A.1 als Prüfung in `test/source.js`; ebenso
  `keytool.sh` ohne `rm -rf data` ohne Ausnahme für `files`.

**Was mitgeht**, vom Stand 0.47.1 aus:

- Schreibende Routen in `F_ROUTES` 84 → 88 (`test/source.js:36-37`,
  `test/frame.js`), davon hinter dem CSRF-Schutz 76 → 80
  (`test/roundtrip.js:335`). `POST /api/items/:id/uploads` „im Rumpf“,
  `DELETE /api/files/unknown` als `ownerOnly`.
- Routen mit Rufer in `public/app.js` 119 → 123 (`test/source.js:1613`);
  Tabellen 36 → 39 (`test/roundtrip.js:4055-4056`).
- `EXCHANGE_FORMAT` 22 (`test/source.js:1400`) und die Formatnummer 21 in
  `test/roundtrip.js`, `test/release_041.js`, `test/release_043.js`,
  `test/release_046.js`, `test/release_047.js` und `test/ui_export.js`.
- Grenzen beim Hochladen 5 → 6 (`test/release_041.js:718`, dazu der Mock in
  `test/dom.js`).
- Dateien des Kommentarwächters 44 → 45 (`test/selfcheck.js:391`,
  `test/source.js:1081`), dazu `COMMENT_TOTAL`; Regelzeilen des Stilblatts
  neu gezählt; Rückbauten (`test/selfcheck.js:18`) plus die Gegenproben.
- Bleiben: `DATATABLES` mit 15 Tabellen, ohne `disk_files`
  (`test/source.js:394`); sieben Träger in `assignInventory()`; sieben
  Kopieranweisungen des Papierkorbs; `cappedLive` 8, weil
  `POST /api/items/:id/uploads` die Grenze an `size` prüft, ohne multer.

### BA 17 — Dokumentation und Zahlen

- **`README.md`:** Funktionen (`:14-18`, Dateien auf der Platte sind einzeln
  verschlüsselt), Schlüsselwechsel (`:189`) mit dem Satz zum verratenen
  Schlüssel aus 7.6, Probe an einer Kopie ohne `data/files/`, Backup (`:244`),
  Zurückspielen (`:283`) mit der Schleife aus 7.4, Update (`:298`) ohne
  `data/files/` in der Sicherheitskopie, Reverse Proxy (`:358`) nach D2.
- **`manual-de.md`:** „Alte Backups“ (`:621-622`) mit `kriterion-files/`,
  „Kennzahlen“ (`:566`), Ordner mit Testtag, Sprung, Upload in Stücken, große
  Videos, Export ohne große Videos.
- **`CHANGELOG.md`:** `## [0.48.0]` mit Kasten: drei neue Tabellen;
  `data/files/` liegt unter `data/`; der Backup-Ordner braucht Platz für die
  Dateien; die Einstellungen am Reverse Proxy nach D2; Exportdateien tragen
  Format 22.
- **`Doku/Aenderungsprotokoll_0.48.0.md`** mit den Zahlen am fertigen Stand.
- **`Doku/Fahrplan.md`:** Zeile 0.48.0 durchstreichen und füllen; der
  Abschnitt „0.45.0 bis 0.48.0“ bekommt „Gebaut am …“.
- **`Doku/Entwicklung.md`:** die drei Tabellen, die Trigger und die
  Verzeichnisse.
- **`package.json`** auf `0.48.0`, `package-lock.json` mit.
- **Der Fingerprint** mit `node tools/publish.js --trocken` am sauberen
  Arbeitsbaum, dann in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 5. Abnahme im Betrieb

Der Betreiber prüft nach dem Einspielen, am Rechner, am iPhone und an einem
Android-Telefon, über NPMplus mit den Einstellungen nach D2:

1. Einen Ordner mit Testtag anlegen: 📁 steht in der Testtagzeile; Sprung zum
   Ordner und mit „↑ 12.09.2026“ zurück; „Link kopieren“ am Ordner.
2. Ein Video von 2 GB (H.264 als MP4 und als MOV) in den Ordner laden. Während
   des Uploads den Tab schließen, den Eintrag neu öffnen, dieselbe Datei
   wählen: Der Upload setzt fort.
3. Das Video abspielen und springen. Ein HEVC-Video in Chrome: Meldung und
   „Herunterladen“.
4. Am iPhone während des Uploads den Bildschirm sperren; die Datei aus „Fotos“
   neu wählen.
5. Eine vorhandene Datei in den Ordner verschieben: „Kennzahlen“ zählt sie
   danach unter „Dateien auf der Platte“.
6. Einem Ordner mit Office-Datei einen Testtag zuweisen, die Datei im
   Document Server bearbeiten, die vorige Fassung wiederherstellen.
7. Backup mit drei Videos; auf eine zweite Instanz nach README zurückspielen.
8. Export: Der Hinweis nennt die großen Videos. Import in eine zweite Instanz.
9. Einen Eintrag mit Ordner in den Papierkorb legen und zurückholen; endgültig
   löschen: Die Dateien verschwinden aus `data/files/`.
10. Den Testtag löschen: Der Ordner bleibt mit Namen und Dateien.
11. Nur mit Tastatur und mit einem Screenreader: Ordnerdialog, Sprung, Upload.
12. Den Schlüssel mit `keytool.sh` wechseln: Die Dateien bleiben lesbar.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Umkodieren (kein `ffmpeg`), automatisches Abspielen, Vorschau beim Überfahren | Konzept 9 |
| Dateien umbenennen, Suche nach Datei- und Ordnernamen | Konzept 9 |
| Umlagerung zurück in die Datenbank | R18 |
| ZIP mehrerer Dateien, ein Verzeichnis je Ordner, Entschlüsseln im Browser | Konzept 8 und 9 |
| Ein Kontingent je Account | Konzept 9 |
| Die Ansicht „Liste“ im Block „Dateien“ | 0.49.0 |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Drei neue Tabellen, keine geänderte. Es gibt keine Datenmigration: Beim
   Update besteht kein Ordner mit Testtag (Konzept 10).
3. In `data/files/` löschen nur `sweepDisk()` nach der Löschliste und der
   Eigentümer-Admin nach 7.5 (R6).
4. Die Kommentarregel gilt: höchstens drei Zeilen je Block, nie mehr Kommentar
   als Code, keine Versionsnummer, kein Verweis auf `Doku/`.
5. Kein Pull Request, wenn keiner verlangt wurde.
6. Kommt eine Frage auf, die hier nicht beantwortet ist, wird sie als
   Fragetafel gestellt. Antwortet niemand, gilt der einfachere Weg, der kein
   Verhalten ändert. Die Entscheidung steht im Änderungsprotokoll.
