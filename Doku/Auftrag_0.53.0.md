# Auftrag 0.53.0 — „Papierkorb für Dateien, Dateien aus Backups zurückholen; Erweiterte Infos, Sortieren nach Typ; README, Anleitung und CHANGELOG englisch“

**Aufgestellt am 30. September 2026.** Grundlage ist der Abschnitt 0.53.0 in
`Doku/Fahrplan.md`: das Zurückholen einzelner Dateien aus einem Backup (F4 in
`Doku/Auftrag_0.51.0.md`) und die Punkte A1 bis A4 aus der Abnahme von 0.52.0.
Dazu kommt A5 aus der Nachricht des Betreibers vom selben Tag: „das README
einmal als Englisch (Haupt-README), dann Deutsch und Türkisch; das Gleiche bitte
auch mit dem Manual“. Vorgabe des Betreibers: Der Auftrag beantwortet jede
Frage vor dem Bau, damit der Bau nach dem Start ohne Rückfrage durchläuft („so
dass, wenn ich es starte, einfach der Auftrag durchläuft“). F1 bis F24 sind am
30. September 2026 in sechs Fragetafeln beantwortet. **Noch nicht erteilt.**
Gebaut wird nach dem Start durch den Betreiber, auf dem Branch, der in der
Aufgabe genannt ist.

Zeilennummern gelten für `4a79068` (0.52.0 mit dem Fahrplan zu 0.53.0).

---

## 0. Vor dem Bau: die offenen Fragen

### Vorgaben des Betreibers

| Nr. | Frage | Antwort |
|---|---|---|
| V1 | Welches Wort steht unter „Erweiterte Infos“ für den Ton? (A1) | **„Audio“**: „nicht Ton, sondern das Wort Audio verwenden. Wir sind in der Technik.“ |
| V2 | Lässt sich unter „Dateien“ nach Typ sortieren? (A2) | **ja**, zusätzlich zu Name, Datum und Größe |
| V3 | Wie heißen Container und Codec? (A3) | **„Container“ statt „Format“, „H.264 (AVC)“ statt „AVC“**, in Liste und Kacheln kurz „H.264“; Fragetafel, Empfehlung |
| V4 | ⓘ in der Leiste des Vollbilds? (A4) | **ja**: „da oben fehlt das I-Symbol für Infos, und wenn man darauf klickt, kommen die erweiterten Infos von MediaInfo“ |
| V5 | README und Anleitung in drei Sprachen? (A5) | **ja**: Englisch ist die Hauptfassung, dazu Deutsch und Türkisch |
| V6 | Wie vollständig ist der Auftrag? | **Der Bau läuft nach dem Start ohne Rückfrage durch** |

Alle vom 30. September 2026.

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | Wo holt man eine gelöschte Datei aus einem Backup zurück? | im Eintrag unter „Dateien“, aus allen Backups · in „Alte Backups“, je Backup · beides · im Skript bei laufender Instanz | **im Eintrag** (Empfehlung) |
| F2 | Wer darf zurückholen? | nur der Eigentümer-Admin wie bei allen Backups · jeder Admin · auch der Verfasser der Datei | **nur der Eigentümer-Admin** (Empfehlung) |
| F3 | Was lässt sich zurückholen? | Dateien unter „Dateien“ · dazu Fotos und Videos des Eintrags · dazu Bilder und Videos in Kommentaren | **nur Dateien** (Empfehlung) |
| F4 | Dateien, die in einem Backup von vor 0.50.0 in der Datenbank stehen? | ja, neu verschlüsselt auf die Platte · nein, nur Kopien aus `kriterion-files/` | **ja, neu verschlüsselt** (Empfehlung) |
| F5 | Die Datei gibt es noch, aber mit anderem Inhalt (im Document Server gespeichert)? | als eigene Datei daneben, mit dem Datum des Backups im Namen · nicht anbieten · als aktuelle Fassung | **eigene Datei daneben** (Empfehlung) |
| F6 | Der Ordner der Datei fehlt? | neu anlegen mit dem Namen aus dem Backup · ohne Ordner | **neu anlegen** (Empfehlung) |
| F7 | Verfasser und Datum der zurückgeholten Datei? | wie im Backup, ohne Verfasser, wenn der Account fehlt · wer zurückholt, jetzt | **wie im Backup** (Empfehlung) |
| F8 | Die vorige Fassung einer Office-Datei mit zurückholen? | nein · ja | **nein** (Empfehlung) |
| F9 | Der Eintrag ist gelöscht? | erst aus dem Papierkorb holen, danach erkennt der Dialog ihn an Anlagedatum und Titel · ganze Einträge aus einem Backup | **erst Papierkorb** (Empfehlung) |
| F10 | Einzeln gelöschte Dateien 30 Tage in den Papierkorb? | später, als eigener Punkt · in dieser Runde | **in dieser Runde** |
| F11 | Sortieren nach Typ: Folge innerhalb eines Typs und Wirkung von „Z → A“? | nach Name, „Z → A“ kehrt alles um · nach Datum „alt → neu“ · nach Name, „Z → A“ kehrt nur die Typen um | **nach Name, alles kehrt um** (Empfehlung) |
| F12 | Folge der Ordner bei „Typ“? | nach Name · wie bei „Datum“ | **nach Name** (Empfehlung) |
| F13 | Die Spalte „Art“ der Kopfzeile? | Knopf, heißt „Typ“ · Knopf, heißt „Art“ · ohne Sortieren | **Knopf, heißt „Typ“** (Empfehlung) |
| F14 | „Container“ und „H.264“ auch bei Bildern? | nur bei Videos · überall | **nur bei Videos** (Empfehlung) |
| F15 | Wo steht ⓘ in der Leiste? | links neben dem Link · rechts neben dem Download · vor dem Zähler | **links neben dem Link** (Empfehlung) |
| F16 | ⓘ und Erweiterte Infos auch bei Fotos und Videos des Eintrags? | nur unter „Dateien“ · auch Fotos des Eintrags | **auch Fotos des Eintrags** |
| F17 | Wie heißen README und Anleitung in den drei Sprachen? | mit Strich · mit Punkt · Anleitung mit Kürzel | **mit Strich** (Empfehlung): `README.md`, `README-de.md`, `README-tr.md`; `manual.md`, `manual-de.md`, `manual-tr.md` |
| F18 | Wie hält der Prüfstand die drei Fassungen gleich? | gleicher Aufbau · jede Fassung inhaltlich · nur Deutsch | **gleicher Aufbau** (Empfehlung) |
| F19 | `CLAUDE.md` anpassen? | ja, Regel und Liste · nein | **ja** (Empfehlung) |
| F20 | Wird das CHANGELOG dreisprachig? | nein, bleibt deutsch · ja, drei Sprachen | **„Nein, es wird nur noch in Englisch fortgeführt. Das wird auch in CLAUDE.md so als Regel aufgenommen.“** |
| F21 | Wo erscheinen Dateien im Papierkorb? | im Eintrag und in der Karte · nur im Eintrag · nur in der Karte | **im Eintrag und in der Karte** (Empfehlung) |
| F22 | Wer holt eine Datei aus dem Papierkorb zurück? | der Eigentümer-Admin · auch wer gelöscht hat · Verfasser und Admins | **der Eigentümer-Admin** (Empfehlung) |
| F23 | Auch einzeln gelöschte Fotos und Videos des Eintrags in den Papierkorb? | nur Dateien · auch Fotos | **nur Dateien** (Empfehlung) |
| F24 | Was geschieht mit den älteren, deutschen Einträgen im CHANGELOG? | bleiben deutsch · übersetzen | **„Das ganze CHANGELOG wird englisch und dabei auch gekürzt, so dass weniger Zeilen als 2.865 nötig sind.“** |

---

## 1. Das Ziel

- Eine einzeln gelöschte Datei liegt 30 Tage im Papierkorb. Der
  Eigentümer-Admin holt sie im Eintrag oder in der Karte „Papierkorb“ zurück.
- Der Eigentümer-Admin holt eine gelöschte Datei aus einem Backup zurück,
  ohne dass sich der übrige Stand ändert. Die Instanz läuft dabei weiter.
- Unter „Erweiterte Infos“ steht „Audio“ statt „Ton“, bei Videos „Container“
  statt „Format“ und „H.264 (AVC)“ statt „AVC“.
- „Erweiterte Infos“ gibt es auch für Fotos und Videos des Eintrags.
- „Dateien sortieren“ bietet „Typ“; die Spalte „Typ“ der Kopfzeile sortiert.
- ⓘ in der Leiste des Vollbilds öffnet „Erweiterte Infos“ zur gezeigten Datei.
- Ist über dem Vollbild ein Dialog offen, wirken die Tasten nur im Dialog.
- README und Anleitung liegen englisch, deutsch und türkisch vor. Das
  CHANGELOG ist englisch und kürzer.

---

## 2. Der Stand, geprüft am 30. September 2026

### 2.1 Was nach dem Löschen einer Datei bleibt

| Schritt | Stelle |
|---|---|
| Jedes Löschen einer Datei, einzeln und „Ausgewählte löschen“, geht über `DELETE /api/attachments/:id` | `server.js:4524`; `public/app.js:7618`, `public/app.js:7838` |
| Die Route löscht die Zeile in `attachments`. Ordner, Vorschaubild, Standbild, Angaben, „Bearbeiten durch alle“ und vorige Fassung fallen mit (`ON DELETE CASCADE`) | `server.js:4524` |
| `disk_files.attachment_id` wird `NULL`. Der Trigger `disk_files_orphaned` trägt den Namen in `disk_files_gone` ein und löscht die Zeile samt `file_key`; bei der vorigen Fassung ebenso | `db.js:188` |
| `sweepDisk()` löscht die Datei nach dem nächsten Checkpoint aus `data/files/` | `server.js:6729` |
| Ein gelöschter Eintrag liegt 30 Tage im Papierkorb: eine Zeile in `trash` mit dem Eintrag im Austauschformat, Bytes in `trash_bytes`, Dateien auf der Platte mit `disk_files.trash_id` | `intoTrash()`, `server.js:6614` |
| Wiederherstellen legt einen neuen Eintrag an: die Nummer ist neu, `created_at` bleibt | `server.js:6669`, `server.js:6381` |
| `cleanupTrash()` löscht Zeilen nach `TRASH_DAYS` (30); der Trigger gibt die Dateien danach frei | `server.js:6558`, `server.js:6593` |
| Die Karte „Papierkorb“ sehen Admins; Wiederherstellen und endgültig Löschen darf nur der Eigentümer-Admin | `server.js:6647`, `server.js:6669`, `server.js:6700` |

Eine einzeln gelöschte Datei ist danach nur noch in Backups vorhanden.
`disk_files.trash_id` kann eine Datei schon heute ohne `attachments`-Zeile
halten; ein Papierkorb für Dateien braucht dafür keine neue Spalte.

### 2.2 Was ein Backup über eine Datei weiß

| Angabe | Tabelle im Backup |
|---|---|
| Eintrag: Nummer, Titel, `created_at` | `items` |
| Datei: Nummer, Name, Typ, Größe, Verfasser, `created_at`, Platz in der Folge | `attachments` |
| Ordner: Nummer, Name, Verfasser, `created_at`, Testtag | `folders`, `attachment_folders` |
| Standbild und Länge eines Videos | `attachment_stills` |
| „Bearbeiten durch alle“ und Zahl der gespeicherten Fassungen | `attachment_editing` (`edit_all`, `saves`) |
| Name auf der Platte, Größe, Stückgröße, Schlüssel; vorige Fassung, Papierkorb | `disk_files`, ab 0.48.0 |
| Inhalt | Kopie unter dem Namen auf der Platte in `kriterion-files/`, solange eine Liste sie nennt. In Backups von vor 0.50.0 steht der Inhalt einer Datei ohne Zeile in `disk_files` in `attachments.data` |

- Jedes Stück einer Kopie ist mit dem Namen auf der Platte als AAD
  verschlüsselt (`attachments.js:287`). Mit `file_key`, `size` und `chunk` aus
  dem Backup lässt sie sich unverändert nach `data/files/` legen; neu
  verschlüsselt wird nichts.
- Die Datenbank eines Backups öffnet sich nur mit dem Schlüssel, mit dem sie
  geschrieben wurde (`openBackup()`, `backup.js:193`). Ein Backup von vor einem
  Schlüsselwechsel ist nicht lesbar.
- Dieselbe Fassung einer Datei trägt in jedem Backup denselben Namen auf der
  Platte. Speichert der Document Server eine neue Fassung, bekommt sie einen
  neuen Namen, und `attachment_editing.saves` steigt (`schema.js:275`,
  `countSave`, `server.js:856`).
- `attachments`, `folders` und `users` zählen mit `AUTOINCREMENT`. Nach
  `./backuptool.sh restore` vergibt SQLite aber die Nummern des verworfenen
  Stands neu; darum erkennt `compare()` Einträge an Nummer und `created_at`
  (`backuptool.js:313`).
- Die Umlagerung von 0.50.0 hat jede Datei aus der Datenbank unter einem neuen
  Namen auf die Platte gelegt (`relocateOne()`, `server.js:4707`). Für eine
  solche Datei trifft ein Vergleich über den Namen auf der Platte nicht zu.

### 2.3 Wer heute an Backups kommt

- Alle Routen unter `/api/backup` verlangen den Eigentümer-Admin
  (`ownerOnly`, `server.js:6934` bis `server.js:7138`).
- Die Karten „Backup“ und „Alte Backups“ zeigt die Oberfläche nur ihm
  (`OWNER`, `public/app.js:8816` und `public/app.js:8819`).
- Löschen verlangt die zweite Bestätigung und schreibt je Backup
  `backup.delete` ins Sicherheitsprotokoll (`server.js:6930`).

### 2.4 Wie eine Datei heute auf die Platte kommt

- `finishUpload()` (`server.js:4225`) schreibt die Zeile in `attachments` mit
  `data = x''`, die Zeile in `disk_files`, Ordner und „Bearbeiten durch alle“
  in einer Transaktion mit `synchronous = FULL` (`commitFull()`,
  `server.js:3859`).
- Danach legt `moveIntoPlace()` die Datei von `upload/` nach `files/`
  (`server.js:3850`). Vorschaubild und Angaben entstehen in ihren
  Warteschlangen (`docTilesSoon()`, `server.js:3972`; `mediaSoon()`,
  `server.js:4071`).
- Solange eine Datei unter `upload/` entsteht, steht ihr Name in
  `DISK_WRITING` (`server.js:3799`); `sweepUploadDir()` lässt sie liegen
  (`server.js:6753`).
- Ein Eintrag trägt höchstens 100 Dateien (`FILES_PER_ENTRY`,
  `server.js:3784`).

### 2.5 Sortieren, Erweiterte Infos, Vollbild

| Punkt | Stand |
|---|---|
| A1 | `entry.mediaAudio` „Ton“, `entry.mediaAudioTrack` „Ton, Spur {n} von {count}“, `entry.mediaAudioTracks` „Tonspuren“ (`public/languages/de.json:897-899`); `manual-de.md:491` und `manual-de.md:493` |
| A2 | `FILES_SORTS` mit Name, Datum, Größe (`public/app.js:1307`), `FILE_ORDER` (`public/app.js:7395`), `kindOrder` (`public/app.js:7405`), `sortedFolders()` (`public/app.js:7409`), Prüfung von `filesSort` (`public/app.js:2791`, `server.js:1696`). Die Spalte „Art“ der Kopfzeile ist kein Knopf (`public/app.js:5608`). `sortedFolders()` ordnet jeden Schlüssel außer Datum und Name nach der Größensumme |
| A3 | „Allgemein → Format“ zeigt `Format` der Spur „General“, „Video → Codec“ das `Format` der Videospur, beides unverändert (`mediaSummary()`, `attachments.js:365`; `mediaInfoHtml()`, `public/app.js:4950`). In Liste und Kacheln steht `json_extract(m.info, '$.video[0].format')` (`kindText()`, `public/app.js:4928`; `.acodec`, `public/app.js:7149`; Beschriftung der Zeile, `public/app.js:7191`). Gemessen an nachgebauten Dateien: Tabelle unter A3 in `Doku/Fahrplan.md` |
| A4 | Leiste des Vollbilds mit Zähler, Link, Download, Zoom, Vorschaubild, Löschen und Schließen (`public/app.js:4537-4546`). „Erweiterte Infos“ nur im Menü „…“ (`fileMenu()`, `public/app.js:7562`). Fotos des Eintrags öffnen das Vollbild aus `public/app.js:5724` und `public/app.js:5957`, Bilder in Kommentaren aus `public/app.js:8211`. Fotos haben keine Angaben von MediaInfo; ihre Bytes liegen in `photos.data` (`schema.js:59`), ausgeliefert über `GET /api/photos/:id/raw` (`server.js:3693`) |

**Nachgestellt im DOM des Prüfstands (jsdom)**, mit „Löschen“ aus dem
Vollbild: Ist der Dialog offen, blättert → das Vollbild dahinter weiter, von
2/3 auf 3/3. Esc schließt Dialog und Vollbild zusammen. `onKey()` im Vollbild
(`public/app.js:4748`) und in `openModal()` (`public/app.js:350`) hören beide
im Capture am `document`. Das Vollbild meldet sich zuerst an und fragt nicht
nach einem offenen Dialog.

### 2.6 README, Anleitung, CHANGELOG

| Datei | Stand |
|---|---|
| `README.md` | 606 Zeilen, deutsch, 14 Abschnitte zweiter Ebene |
| `manual-de.md` | 848 Zeilen, deutsch, 13 Abschnitte zweiter Ebene |
| `CHANGELOG.md` | 2.865 Zeilen, deutsch, 125 Versionen. Kopf mit Keep a Changelog `/de/1.1.0/` |
| `CLAUDE.md` | Abschnitt 1: Dokumentation auf Deutsch. Abschnitt 3: ausgeliefert sind unter anderem `README.md` und `manual-de.md` |
| Prüfstand | `readmeFlat` und `handbookFlat` lesen `README.md` und `manual-de.md` (`test/frame.js:48-51`). `test/selfcheck.js:672-735` prüft die Trennung von Betrieb (README) und Bedienung (Anleitung) und die Verweise zwischen beiden. `test/source.js` führt die Dateien in Listen: Wortfilter (Zeile 771), Versionsnummern (Zeile 849 bis 851), Verweise auf `Doku/` (Zeile 1659 und 1693). `counterproof.js` nennt sie in 14 Zeilen |

### 2.7 Befunde

| Nr. | Befund | Stelle |
|---|---|---|
| B1 | Zurückholen gibt es nur für den ganzen Stand. Wer mit einem älteren Backup eine gelöschte Datei B zurückholt, verliert die danach hochgeladene Datei D | `commandRestore()`, `backuptool.js:566` |
| B2 | Über dem Vollbild wirken Pfeiltasten und Esc auch bei offenem Dialog im Vollbild (Abschnitt 2.5) | `public/app.js:4748` |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

V1 bis V6 und F1 bis F24 aus Abschnitt 0, alle vom 30. September 2026.

### Entschieden in diesem Auftrag

#### Allgemein

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.53.0**, MINOR. Schema: **ja**, eine neue Tabelle `photo_media`, kein Migrationsblock. Austauschformat: bleibt 22 |
| Routen | Schreibende Routen 89 → 90: `POST /api/items/:id/deleted-files`. Lesende Routen 36 → 38: `GET /api/items/:id/deleted-files`, `GET /api/photos/:id/info` |
| Sicherheitsprotokoll | neues Ereignis `backup.fetch` mit der Zahl der Dateien, ohne Dateinamen, wie `backup.delete` |

#### Papierkorb für Dateien (F10, F21, F22, F23)

| Frage | Antwort |
|---|---|
| Löschen | `DELETE /api/attachments/:id` legt die Datei in den Papierkorb, in einer Transaktion: eine Zeile in `trash` mit `title` = Dateiname und `content` = `{"kind":"file", …}`; das Standbild in `trash_bytes`; `disk_files.trash_id` auf die neue Zeile. Danach fällt die Zeile in `attachments` wie heute. Kein neues Schema |
| Inhalt von `content` | Eintrag: Nummer, `created_at`, Titel. Datei: Nummer, Name, Typ, Größe, `created_at`, Verfasser (Nummer und Name), Ordner (Nummer, Name, `created_at`, Testtag), „Bearbeiten durch alle“, Länge des Videos, Nummer des Standbilds in `trash_bytes`, `saves` |
| Datei noch in der Datenbank | Liegt der Inhalt noch in `attachments.data`, kommt er nach `trash_bytes` wie beim Eintrag (`insertTrashBytes.file`) |
| Vorige Fassung | fällt wie heute (F8) |
| Frist | `TRASH_DAYS`, 30 Tage wie bei Einträgen. `cleanupTrash()` löscht auch Dateien; der Trigger gibt die Datei danach frei |
| Rechte | Löschen wie heute: Verfasser oder Admin. Wiederherstellen und endgültig löschen nur der Eigentümer-Admin (F22) |
| Karte „Papierkorb“ | nennt Einträge und Dateien in einer Liste nach Datum. Eine Datei steht als „Eintrag › Ordner › Name“ mit Größe, gelöscht von, Datum und Resttagen; „Wiederherstellen“ und „Endgültig löschen“ wie bei Einträgen (F21). `GET /api/trash` liefert je Zeile `kind` (`entry`, `file`) |
| Wiederherstellen | `POST /api/trash/:id/restore` nimmt auch Dateien. Ziel ist der Eintrag mit Nummer und `created_at` aus der Zeile, sonst der Eintrag mit `created_at` und Titel (F9). Fehlt er, 404 mit „Der Eintrag dieser Datei fehlt.“ Ordner nach F6, Verfasser und Datum nach F7, Standbild und Länge aus `trash_bytes`, „Bearbeiten durch alle“ aus der Zeile. `disk_files` bekommt `attachment_id` der neuen Zeile und `trash_id = NULL`. Die Grenze `FILES_PER_ENTRY` gilt |
| Endgültig löschen | `DELETE /api/trash/:id` wie bei Einträgen |
| Rückfrage beim Löschen | nennt den Papierkorb: „Die Datei liegt danach 30 Tage im Papierkorb.“ Ebenso bei „Ausgewählte löschen“ |
| Gelöschter Eintrag | Die Dateien im Papierkorb bleiben eigene Zeilen. Nach dem Wiederherstellen des Eintrags erscheinen sie in seinem Dialog (F9) |
| Fotos und Kommentare | werden wie heute sofort gelöscht (F23) |

#### Dateien aus Backups zurückholen (F1 bis F9)

| Frage | Antwort |
|---|---|
| Ort | Im Kopf von „Dateien“ ein Knopf „Gelöschte Dateien …“ nach „Ordner hinzufügen“, nur für den Eigentümer-Admin (F1, F2). Er öffnet einen Dialog mit den Dateien des Eintrags aus dem Papierkorb und aus Backups (F21). Ohne Backup-Ordner zeigt der Dialog nur den Papierkorb |
| Umfang | nur Dateien unter „Dateien“ (F3) |
| Welche Backups | alle Backups am eingestellten Ort, die sich mit dem aktuellen Schlüssel öffnen lassen und eine Tabelle `items` haben. Die übrigen zählt der Dialog: „2 Backups nicht lesbar“. Fehlt einem Backup eine Tabelle wie `folders` oder `attachment_stills`, fehlen nur diese Angaben |
| Eintrag im Backup | gleiche Nummer und gleiches `created_at`; sonst gleiches `created_at` und gleicher Titel (F9) |
| Welche Dateien | jede Zeile in `attachments` des Eintrags im Backup, die im laufenden Stand fehlt: keine Datei mit gleicher Nummer und gleichem `created_at` im Eintrag und keine im Papierkorb. Vorige Fassungen und der Papierkorb des Backups bleiben draußen |
| Ältere Fassung (F5) | Gibt es die Datei noch und ist `saves` im laufenden Stand größer als im Backup, bietet der Dialog die Fassung aus dem Backup als eigene Datei an, mit „ältere Fassung“. Name mit dem Datum des Backups vor der Endung: „Bericht (Backup 29.09.2026).docx“. Datum in `TZ` des Servers |
| Name auf der Platte belegt | Steht der Name auf der Platte im laufenden Stand noch in `disk_files`, etwa als vorige Fassung, bietet der Dialog die Fassung nicht an |
| Doppelte | Dieselbe Fassung (Nummer, `created_at`, `saves`) aus mehreren Backups erscheint einmal, mit dem jüngsten Backup, das sie enthält |
| Inhalt aus `kriterion-files/` | wenn dort die Kopie mit ihrer Länge liegt (`copyPresent()`); unverändert, mit `file_key`, `size`, `chunk` und `large` aus dem Backup. Fehlt die Kopie, steht die Datei ohne Kästchen mit „Kopie fehlt“ im Dialog |
| Inhalt aus der Datenbank (F4) | Hat die Datei im Backup keine Zeile in `disk_files`, wird `attachments.data` stückweise mit `substr` zu 1 MiB gelesen und mit neuem Namen und Schlüssel verschlüsselt wie bei der Umlagerung |
| Sperre | Das Lockfile in `kriterion-files/` gilt für die Dauer des Zurückholens. Läuft ein Backup, 409 mit „Ein Backup läuft gerade.“ |
| Platz | Summe der Dateien und 1 GB Reserve (`DB_SPARE`), sonst 507 wie beim Upload |
| Grenze | `FILES_PER_ENTRY`. Was darüber liegt, wird nicht geholt und in der Antwort genannt |
| Ablauf je Datei | Name in `DISK_WRITING`; Kopie nach `upload/` mit `fsync`; in `commitFull()`: Zeilen in `attachments` und `disk_files`, Name aus `disk_files_gone` löschen, Ordner, Standbild, „Bearbeiten durch alle“; danach `moveIntoPlace()`. Liegt die Datei schon unter `files/`, wird die Kopie unter `upload/` gelöscht. Vorschaubild und Angaben entstehen in ihren Warteschlangen |
| Ordner (F6) | Gibt es im Eintrag den Ordner mit derselben Nummer, kommt die Datei hinein. Sonst entsteht ein Ordner mit dem Namen und `created_at` aus dem Backup; alle Dateien desselben Ordners aus einem Vorgang kommen in denselben neuen Ordner. Den Testtag bekommt er nur, wenn der Testtag im Eintrag noch besteht und keinen Ordner hat. Verfasser wie bei F7 |
| Verfasser und Datum (F7) | `user_id` aus dem Backup, wenn es im laufenden Stand einen Account mit derselben Nummer und demselben Namen gibt, sonst `NULL`. `created_at` aus dem Backup. Platz in der Folge: am Ende |
| Vorige Fassung | kommt nicht mit (F8) |
| Antwort | die Angaben des Eintrags wie nach einem Upload, dazu die Zahl der geholten Dateien und die Namen der abgelehnten mit Grund |

#### Der Dialog „Gelöschte Dateien“

| Frage | Antwort |
|---|---|
| Kopf | Titel „Gelöschte Dateien“, darunter der Titel des Eintrags |
| Laden | „Backups werden gelesen …“, bis die Antwort da ist |
| Zeile | Kästchen, Name, Ordner, Größe, Herkunft: „Papierkorb, noch 27 Tage“ oder „Backup vom 29.09.2026 23:39“; bei F5 zusätzlich „ältere Fassung“ |
| Folge | erst der Papierkorb nach Datum des Löschens, jüngste oben; dann Backups nach dem Datum des Backups, jüngstes oben |
| Knöpfe | „Zurückholen“ (für die Auswahl) und „Schließen“ |
| Leer | „Keine gelöschten Dateien gefunden.“ |
| Unter der Liste | die Zahl nicht lesbarer Backups, wenn es welche gibt |
| Danach | Meldung „2 Dateien zurückgeholt“; die Liste unter „Dateien“ zeichnet sich neu, der Dialog liest neu |
| Telefon | wie die übrigen Dialoge; der Knopf im Kopf von „Dateien“ auch am Telefon |

#### Routen

| Route | Antwort |
|---|---|
| `GET /api/items/:id/deleted-files` | nur Eigentümer-Admin. `{ trash: […], backups: […], unreadable: n }`; je Datei Name, Ordner, Größe, Herkunft, bei Backups der Name des Backups und der Schlüssel der Fassung (Nummer, `created_at`, `saves`), `older` bei F5, `missing` bei fehlender Kopie |
| `POST /api/items/:id/deleted-files` | nur Eigentümer-Admin. `{ trash: [Nummern], backup: [{ name, file }] }`. Holt aus beiden Quellen in einem Vorgang, antwortet nach Abschnitt „Antwort“ oben |

#### Sortieren nach Typ (V2, F11 bis F13)

| Frage | Antwort |
|---|---|
| Auswahl | „Typ“ als vierte Wahl nach Name, Datum und Größe; Richtung „A → Z“ und „Z → A“, Start „A → Z“ |
| Folge | Typen wie bei „Nach Typ gruppiert“ nach Name, „Sonstige“ zuletzt; innerhalb eines Typs nach Name; „Z → A“ kehrt alles um (F11) |
| Ordner | nach Name, bei „Z → A“ umgekehrt (F12) |
| Speicher | `filesSort` nimmt `type_asc` und `type_desc` an |
| Kopfzeile | Die Spalte heißt „Typ“ und ist ein Knopf wie Name, Größe und Datum (F13). `entry.colKind` wird „Typ“ |
| Mit „Nach Typ gruppiert“ | innerhalb jeder Typgruppe nach Name |

#### Erweiterte Infos (V1, V3, F14, F16)

| Frage | Antwort |
|---|---|
| Audio | `entry.mediaAudio` „Audio“, `entry.mediaAudioTrack` „Audio, Spur {n} von {count}“, `entry.mediaAudioTracks` „Audiospuren“ |
| Container | Hat die Datei eine Videospur, heißt die Zeile unter „Allgemein“ „Container“ (neuer Schlüssel `entry.mediaContainer`); sonst bleibt „Format“ (F14) |
| Codec | nur bei Videospuren: „AVC“ als „H.264 (AVC)“, „HEVC“ als „H.265 (HEVC)“ im Dialog; in der Spalte „Typ“, am Vorschaubild und in der Beschriftung der Zeile kurz „H.264“ und „H.265“. Andere Codecs und Bildspuren bleiben im Wortlaut von MediaInfo (F14) |
| Datenbank | `attachment_media.info` und `photo_media.info` behalten den Wortlaut von MediaInfo; umbenannt wird im Browser. Es wird nichts neu gelesen |
| Fotos des Eintrags (F16) | neue Tabelle `photo_media (photo_id INTEGER PRIMARY KEY REFERENCES photos(id) ON DELETE CASCADE, info TEXT NOT NULL)`. Gelesen in derselben Warteschlange wie `attachment_media`: nach dem Hochladen, beim Start und stündlich für Fotos ohne Zeile; stückweise aus `photos.data` mit `substr`. Neue Route `GET /api/photos/:id/info` mit den Rechten von `/raw`. Nicht im Export |
| Vorschaubild der Fotos | ohne Codec |

#### ⓘ im Vollbild (V4, F15, F16, B2)

| Frage | Antwort |
|---|---|
| Knopf | ⓘ als SVG im Stil von `ICON_LINK`, Titel und `aria-label` „Erweiterte Infos“, links neben dem Link (F15) |
| Wo | im Vollbild von „Dateien“ bei Bildern und Videos, im Vollbild der Fotos und Videos des Eintrags (F16); nicht bei Bildern und Videos in Kommentaren |
| Klick | öffnet „Erweiterte Infos“ zur gezeigten Datei; beim Schließen geht der Fokus auf ⓘ zurück |
| Tasten (B2) | Solange ein Dialog offen ist, reagiert das Vollbild auf keine Taste; Esc schließt nur den Dialog. Das gilt auch für „Löschen“ und „Vorschaubild“ aus dem Vollbild |

#### README und Anleitung (V5, F17 bis F19)

| Frage | Antwort |
|---|---|
| Dateien | `README.md` englisch, `README-de.md`, `README-tr.md`; `manual.md` englisch, `manual-de.md`, `manual-tr.md` (F17) |
| Grundlage | Die deutsche Fassung ist der heutige Text mit den Änderungen dieser Runde. Englisch und Türkisch sind Übersetzungen davon, Absatz für Absatz |
| Begriffe | Namen der Oberfläche aus `en.json` und `tr.json`; Wortwahl nach `Doku/Woerterbuch_Englisch_0_24_3.md` und `Doku/Woerterbuch_Tuerkisch_0_24_4.md`, also `yedekleme` für Backup |
| Kopf | Jede der sechs Dateien beginnt mit einer Zeile zu den drei Sprachen, etwa „English · [Deutsch](README-de.md) · [Türkçe](README-tr.md)“ |
| Verweise | Jede README verweist auf die Anleitung ihrer Sprache und umgekehrt |
| Prüfstand (F18) | Inhalte wie bisher an der deutschen Fassung: `readmeFlat` und `handbookFlat` lesen `README-de.md` und `manual-de.md`. Neu: Die drei Fassungen haben je Ebene gleich viele Überschriften, gleich viele Tabellenzeilen und gleich viele Codeblöcke; die Codeblöcke sind Zeichen für Zeichen gleich; die Links auf Dateien im Repository sind dieselben, bis auf die Sprachfassung |
| Regeln | „Keine Versionsnummer“ und „kein Verweis auf `Doku/`“ gelten für alle sechs Dateien (`test/source.js`) |

#### CHANGELOG (F20, F24)

| Frage | Antwort |
|---|---|
| Sprache | Englisch, auch die bestehenden Einträge (F24). Kopf mit Keep a Changelog `/en/1.1.0/` und Semantic Versioning ohne Sprachpfad |
| Grenze | **höchstens 1.500 Zeilen**, gemessen am fertigen Stand |
| Je Version | `## [x.y.z] - JJJJ-MM-TT`, die Zeile mit dem Fingerprint, wenn es einen gibt; der Kasten nur, wenn beim Update etwas zu tun ist; dann `### Added`, `### Changed`, `### Fixed`, `### Removed`, `### Security` |
| Je Änderung | eine Zeile, höchstens 120 Zeichen. Die kursive Zeile mit dem Titel der Runde entfällt |
| Alte Versionen | bis 0.9.1 je Version höchstens drei Zeilen; „Older versions — 0.8.5 and earlier“ bleibt ein Abschnitt |
| Was entfällt | Absätze zur Form des Changelogs, Begründungen, Zahlen aus dem Bau. Sie stehen in den Änderungsprotokollen |

#### CLAUDE.md (F19, F20)

| Frage | Antwort |
|---|---|
| Abschnitt 1 | README und Anleitung in drei Sprachen, Englisch als Hauptfassung; jede Änderung geht in alle drei. Das CHANGELOG ist englisch. Chat, Commits, Pull Requests, Kommentare und `Doku/` bleiben deutsch |
| Begriffe | In englischen und türkischen Texten gilt der Name aus `en.json` und `tr.json` |
| Abschnitt 3 | Ausgeliefert sind `README.md`, `README-de.md`, `README-tr.md`, `manual.md`, `manual-de.md`, `manual-tr.md`. Ausnahme `keepachangelog.com/en/1.1.0/` statt `/de/`; `14.03.2026` in den drei Anleitungen |

---

## 4. Die Bauabschnitte

### BA 1 — Papierkorb für Dateien: Server

`DELETE /api/attachments/:id` legt ab wie in Abschnitt 3. `GET /api/trash`
mit `kind` und den Angaben einer Datei; `POST /api/trash/:id/restore` und
`DELETE /api/trash/:id` für Dateien; `cleanupTrash()` unverändert.

### BA 2 — Backups lesen

`GET /api/items/:id/deleted-files`: Papierkorb des Eintrags und Dateien aus
allen lesbaren Backups nach Abschnitt 3. Das Lesen eines Backups kommt nach
`backup.js`, damit `backuptool.js` es später nutzen kann.
Die Dauer mit 20 Backups wird gemessen und im Änderungsprotokoll genannt.

### BA 3 — Zurückholen

`POST /api/items/:id/deleted-files`: Papierkorb und Backups, Sperre, Platz,
Grenze, Kopie oder neue Verschlüsselung, Ordner, Verfasser, Standbild,
`backup.fetch`.

### BA 4 — Oberfläche: Papierkorb und Dialog

Knopf „Gelöschte Dateien …“, der Dialog, die Rückfrage beim Löschen, die
Dateien in der Karte „Papierkorb“.

### BA 5 — Sortieren nach Typ

`FILES_SORTS`, `FILE_ORDER`, `sortedFolders()`, Prüfung von `filesSort` im
Browser und in `PICK_SETTINGS`, die Spalte „Typ“ als Knopf.

### BA 6 — Erweiterte Infos: Audio, Container, H.264

Schlüssel nach V1, `entry.mediaContainer`, die Namen der Codecs im Dialog, in
der Spalte „Typ“, am Vorschaubild und in der Beschriftung.

### BA 7 — Erweiterte Infos für Fotos des Eintrags

Tabelle `photo_media` in `schema.js`, Warteschlange, Route `/api/photos/:id/info`.

### BA 8 — ⓘ im Vollbild und die Tasten bei offenem Dialog

Knopf nach F15 für „Dateien“ und Fotos des Eintrags; `onKey()` im Vollbild
lässt Tasten bei offenem Dialog liegen (B2).

### BA 9 — Texte

Neue und geänderte Schlüssel in `de.json`, `en.json`, `tr.json`: Papierkorb
und Dialog, „Typ“, „Audio“, „Container“, ⓘ, `backup.fetch` im
Sicherheitsprotokoll. Englisch und Türkisch höchstens 15 % länger.

### BA 10 — Der Prüfstand

Neues Modul `test/release_053.js`, eingetragen in `MODULE` in `testbench.js`:

- Papierkorb: Löschen legt ab, die Datei bleibt auf der Platte;
  Wiederherstellen durch den Eigentümer-Admin, 403 für Admin und Verfasser;
  Ordner neu nach F6; nach 30 Tagen fort; Eintrag gelöscht und
  wiederhergestellt: die Datei erscheint an ihm (F9)
- Backups: das Beispiel aus `Doku/Auftrag_0.51.0.md`, Abschnitt 2.2 (A, B, C;
  B gelöscht, D hochgeladen): B kommt zurück, D bleibt; die Datei öffnet sich
  mit demselben Inhalt; ältere Fassung nach F5 mit Namen; Kopie fehlt; Backup
  mit fremdem Schlüssel wird gezählt; Backup von vor 0.50.0 mit Datei in der
  Datenbank (F4); Eintrag nach Titel und `created_at` (F9); Verfasser fehlt
  (F7); `FILES_PER_ENTRY`; laufendes Backup 409; `backup.fetch`
- Sortieren nach Typ in Kacheln und Liste, beide Richtungen, Ordner nach Name,
  Kopfzeile „Typ“, `filesSort` `type_asc` und `type_desc`
- Erweiterte Infos: „Audio“, „Container“ nur bei Videos, „H.264 (AVC)“ im
  Dialog, „H.264“ in Liste und Kacheln; `photo_media` mit einem Foto und einem
  Video des Eintrags
- ⓘ an der Stelle nach F15, Dialog und Fokus; B2 mit „Löschen“ und
  „Erweiterte Infos“: → blättert nicht, Esc schließt nur den Dialog
- README und Anleitung: der gleiche Aufbau der drei Fassungen nach F18

Die bestehenden Prüfungen an README und Anleitung lesen die deutsche Fassung.
Je Zusage ein Rückbau in `counterproof.js`.

### BA 11 — README und Anleitung in drei Sprachen

Erst die deutsche Fassung auf den Stand dieser Runde bringen: Papierkorb für
Dateien, „Gelöschte Dateien …“, „Typ“, „Audio“, „Container“, ⓘ, Erweiterte
Infos zu Fotos. `README.md` wird mit `git mv` zu `README-de.md`. Dann `README.md` und
`manual.md` englisch, `README-tr.md` und `manual-tr.md` türkisch, nach
Abschnitt 3.

### BA 12 — CHANGELOG englisch und gekürzt

Nach Abschnitt 3, mit dem Eintrag für 0.53.0.

### BA 13 — CLAUDE.md

Nach Abschnitt 3.

### BA 14 — Dokumentation und Zahlen

Änderungsprotokoll mit „Vorgaben des Betreibers“, `Doku/Fahrplan.md`,
`Doku/Entwicklung.md` (Tabelle `photo_media`, Papierkorb für Dateien),
`package.json` 0.53.0, Fingerprint. Zahlen am fertigen Stand: Zeilen der
sechs Dateien und des CHANGELOG, Prüfungen, Rückbauten, Sprachschlüssel.

---

## 5. Abnahme im Betrieb

1. Eine Datei löschen: Die Rückfrage nennt den Papierkorb. Die Karte
   „Papierkorb“ nennt die Datei mit Eintrag und Ordner.
2. Als Eigentümer-Admin im Eintrag „Gelöschte Dateien …“: die Datei mit
   „Papierkorb, noch 30 Tage“. „Zurückholen“: Sie steht wieder im Ordner, mit
   Verfasser und Datum von vorher.
3. Eine Datei löschen, die vor dem letzten Backup hochgeladen war, und den
   Papierkorb leeren. „Gelöschte Dateien …“: die Datei mit „Backup vom …“.
   „Zurückholen“: Sie öffnet sich; die übrigen Dateien des Eintrags sind
   unverändert.
4. Eine `.docx` im Document Server ändern und speichern. „Gelöschte Dateien
   …“ bietet die Fassung aus dem Backup als „Bericht (Backup TT.MM.JJJJ).docx“
   an.
5. Unter „Dateien“ „Typ“ wählen, Richtung umkehren, Seite neu laden:
   Sortierung und Richtung bleiben. In der Liste auf „Typ“ klicken.
6. „Erweiterte Infos“ an einem Video der A6700: „Container“ XAVC, Codec
   „H.265 (HEVC)“, „Audio“. In den Kacheln „H.265“ am Vorschaubild.
7. Im Vollbild eines Videos unter „Dateien“ und eines Fotos des Eintrags ⓘ
   drücken: „Erweiterte Infos“ erscheint. Mit offenem Dialog → drücken: Das
   Vollbild blättert nicht. Esc: Nur der Dialog schließt.
8. Auf GitHub zeigt das Repository die englische README; die Zeile oben führt
   zur deutschen und zur türkischen Fassung. Das CHANGELOG ist englisch.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Fotos, Kommentarbilder und Kommentarvideos aus Backups zurückholen | F3 |
| Ganze Einträge aus einem Backup zurückholen | F9 |
| Gelöschte Fotos und Videos des Eintrags in den Papierkorb | F23 |
| Die vorige Fassung einer Office-Datei im Papierkorb oder aus Backups | F8 |
| Zurückholen im Skript oder in „Alte Backups“ | F1 |
| Codec am Vorschaubild der Fotos des Eintrags | Abschnitt 3; F16 verlangt die Erweiterten Infos |
| ⓘ bei Bildern und Videos in Kommentaren | F16 |
| Chat, Commits, Pull Requests, Kommentare und `Doku/` auf Englisch | F19 |
| Umwandeln, zweite Fassung für das Telefon | Punkt 57 in `Doku/Fehler_und_Ideen.md`, nach dem Messverfahren |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Neues Schema nur mit der Tabelle `photo_media`. Der Papierkorb für Dateien
   nutzt `trash`, `trash_bytes` und `disk_files.trash_id`.
3. Die Kommentarregel gilt.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Kommt beim Bau doch eine Frage auf, die hier nicht beantwortet ist, gilt der
   einfachere Weg, der kein Verhalten ändert; die Frage und der gewählte Weg
   stehen im Änderungsprotokoll. Der Bau hält dafür nicht an (V6).
