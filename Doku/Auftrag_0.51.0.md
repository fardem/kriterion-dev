# Auftrag 0.51.0 — „Backup: Stände sichtbar, Zurückspielen mit Skript; Dateien sortieren“

**Aufgestellt am 30. September 2026.** Grundlage sind der Abschnitt 0.51.0 in
`Doku/Fahrplan.md` und die Prüfung vom selben Tag (Abschnitt 2). Die Fragen
aus Abschnitt 0 sind am 30. September 2026 beantwortet: F1 bis F4, F6, F7 und
F10 bis F12 in drei Fragetafeln, F5, F8 und F9 in Nachrichten des Betreibers. Gebaut wird, wenn der Betreiber den Auftrag erteilt, auf dem
Branch, der in der Aufgabe genannt ist.

Zeilennummern gelten für `d430711` (0.50.0).

---

## 0. Vor dem Bau: die offenen Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | Wie ist der Backup-Ordner aufgebaut? | flach wie heute · ein Ordner je Backup, Dateien gemeinsam · ein Ordner je Backup mit Hardlinks | **flach wie heute** (Empfehlung) |
| F2 | Was geschieht beim Zurückspielen mit dem aktuellen Stand? | das Skript legt vorher ein Backup an · beiseitelegen nach `../kriterion-before-restore-<Zeit>/` | **Backup davor** (Empfehlung) |
| F3 | Wo ist zu sehen, welche Dateien zu welchem Backup gehören? | Skript und Karte „Alte Backups“ · nur im Skript · zusätzlich eine Klartextliste neben jedem Backup | **Skript und Karte** (Empfehlung) |
| F4 | Einzelne Dateien aus einem Backup zurückholen? | eigene Runde danach · in 0.51.0 im Skript · nicht nötig | **eigene Runde danach** (Empfehlung); im Fahrplan als 0.52.0 |
| F5 | Wo wird zurückgespielt? | Skript auf dem Server · Knopf in der Oberfläche | **Skript auf dem Server**; Vorschlag des Betreibers in seiner Nachricht vom 30. September 2026 |
| F6 | Mehrere Backups auswählen und zusammen löschen? | in 0.51.0 in „Alte Backups“ · nur im Skript · nein | **in 0.51.0 in „Alte Backups“** (Empfehlung) |
| F7 | Dürfen ausgewählt auch die jüngsten Backups fallen, die „Mindestens behalten“ schützt? | die jüngsten x bleiben · nur das jüngste bleibt · alles wählbar | **die jüngsten x bleiben** (Empfehlung) |
| F8 | Wie lange steht beim Weiterspielen eines Videos „ab 3:12“ mit „Von vorn“? | – | **10 s statt 5 s**; Vorgabe des Betreibers in seiner Nachricht vom 30. September 2026: „doppelt so lange“ |
| F9 | Sortieren unter „Dateien“ | – | **„Älteste zuerst“, „Jüngste zuerst“, „Name“; die Gruppen bleiben erhalten**; Vorgabe des Betreibers in seiner Nachricht vom 30. September 2026 |
| F10 | Folgen die Ordner der Sortierung? | Ordner sortieren mit · nur die Dateien in jeder Gruppe | **Ordner sortieren mit** (Empfehlung) |
| F11 | Was steht in der Listenzeile direkt, neben dem Menü „…“? | Bearbeiten · Herunterladen · Öffnen · Löschen, auch mehrere | **Bearbeiten** |
| F12 | Bleibt der Eintrag zusätzlich im Menü „…“? | Menü bleibt vollständig · in der Liste herausnehmen | **Menü bleibt vollständig** (Empfehlung) |

---

## 1. Das Ziel

- Zu jedem Backup ist zu sehen, welche Einträge und Dateien es enthält und
  was es vom laufenden Stand unterscheidet.
- Ein Befehl auf dem Server spielt ein Backup zurück. Danach enthält
  `data/files/` genau die Dateien dieses Stands.
- Vor dem Zurückspielen legt das Skript ein Backup des aktuellen Stands an.
  Zurück geht es mit demselben Befehl.
- Jedes Backup nennt die Version, die es geschrieben hat. Das Skript spielt
  nur zurück, was zum Schema der installierten Version passt.
- Die Regel „mindestens x behalten, älter als y Tage löschen“ gilt wie bisher
  für Datenbank und Dateien. Das Alter kommt aus dem Namen.
- In „Alte Backups“ lassen sich mehrere Backups auswählen und zusammen löschen.
  Die jüngsten x bleiben.
- Beim Weiterspielen eines Videos steht „ab 3:12“ mit „Von vorn“ 10 s lang.
- Unter „Dateien“ lässt sich nach Alter und Name sortieren. Dateien ohne Ordner
  stehen oben, jeder Ordner bleibt eine Gruppe.
- In der Listenansicht steht „Bearbeiten“ direkt in der Zeile jeder Datei, die
  der Account im Document Server bearbeiten darf.

---

## 2. Der Stand, geprüft am 30. September 2026

### 2.1 Was ein Backup schreibt

| Schritt | Stelle |
|---|---|
| Sperre im Speicher und als Lockfile `kriterion-files/.lock`, verwaist nach 24 h | `takeBackupLock()`, `server.js:7039` |
| Reste eines abgebrochenen Backups löschen (`.sqlite.wird`, `.part`) | `clearBackupRest()`, `server.js:7069` |
| Platz: Datenbank × 1,1 und die Dateien, die in `kriterion-files/` fehlen | `backupSpaceShort()`, `server.js:7094` |
| `VACUUM INTO kriterion-<UTC>.sqlite.wird`; die Instanz steht so lange | `server.js:6961` |
| Liste aus dieser Kopie: jede Zeile in `disk_files`, also aktuelle und vorige Fassungen und Dateien im Papierkorb | `backupDiskList()`, `server.js:7077` |
| Fehlende Dateien nach `kriterion-files/` kopieren; eine Kopie gleicher Länge bleibt | `copyPresent()`, `server.js:7088`; `copyDiskFiles()`, `server.js:7107` |
| `kriterion-<UTC>.files` schreiben: Name, Länge, `fehlt`; nur wenn der Stand Dateien hat | `server.js:6973` |
| `.wird` in `.sqlite` umbenennen | `server.js:6975` |
| Mit Häkchen die Regel, danach in jedem Fall `cleanBackupFiles()`: jede Kopie löschen, die keine verbliebene Liste nennt | `backupRuleCleanup()`, `server.js:6999`; `cleanBackupFiles()`, `server.js:7126` |

Der Schlüssel jeder Datei steht in `disk_files.file_key`, und jedes Stück ist
mit ihrem Namen verschlüsselt (AAD, `attachments.js:284`). Eine Kopie in
`kriterion-files/` lässt sich nur mit der Datenbank eines Backups lesen, das
sie nennt.

### 2.2 Versuch mit dem Beispiel des Betreibers

Ein Server mit Testverzeichnis, ein Eintrag, vier Dateien zu je 1.024 Bytes
auf der Platte.

| Schritt | `data/files/` | Liste des Backups | `kriterion-files/` |
|---|---|---|---|
| A, B, C hochgeladen, Backup 1 | A, B, C | A, B, C | A, B, C |
| B gelöscht, D hochgeladen | A, C, D | – | A, B, C |
| Backup 2 | A, C, D | A, C, D | A, B, C, D |

- Eine einzeln gelöschte Datei kommt nicht in den Papierkorb. Sie verschwindet
  nach dem Commit aus `data/files/` (`DELETE /api/attachments/:id`,
  `server.js:4394`; Trigger `disk_files_orphaned`, `db.js:738`). Ein gelöschter
  Eintrag bleibt 30 Tage mit seinen Dateien im Papierkorb
  (`intoTrash()`, `server.js:6481`).
- Zurückgespielt nach README, Abschnitt „Backup zurückspielen“ (`README.md:303`),
  mit Backup 1: Der Eintrag zeigt A, B, C. `data/files/` enthält A, B, C, D.
  „Kennzahlen“ meldet 1 Datei ohne Verweis, mit Kopie im Backup-Ordner.
- Regel 1/7, Backup 1 auf 40 Tage gealtert, dann Backup 3: Das Protokoll meldet
  `Old backups removed: 1`. `kriterion-files/` enthält A, C, D.

### 2.3 Befunde

| Nr. | Befund | Stelle |
|---|---|---|
| B1 | Die Namen in `kriterion-files/` sind 32 Hexzeichen. Die Liste nennt nur Name und Länge, „prüfen“ nennt nur die Zahl der Kopien. Welche Datei welche ist, steht allein in der verschlüsselten Datenbank | `listCheck()`, `server.js:7156`; `card.checkCopies` |
| B2 | Das Zurückspielen ist eine Shell-Schleife mit Platzhaltern. Sie holt fehlende Dateien und entfernt keine. Dateien, die der zurückgespielte Stand nicht kennt, bleiben als „ohne Verweis“ liegen | `README.md:303-333`; `unknownFiles()`, `server.js:5193` |
| B3 | „Vorher ein Backup anlegen“ steht nur als Satz in der README. Ohne dieses Backup schützt keine Liste die Dateien des neueren Stands | `README.md:305-307` |
| B4 | Ein Backup nennt nicht die Version, die es geschrieben hat. Die Karte sagt „Lässt sich nur in dieselbe Programmversion zurückspielen“ | `card.backupWhatHint`, `de.json:55` |
| B5 | Der Name trägt UTC, die Karte zeigt Ortszeit. Im Bild des Betreibers ist `kriterion-2026-09-29-21-39-03.sqlite` der Eintrag „29.09.2026, 23:39“ | `server.js:6949`; `drawCleanup()`, `app.js:11232` |
| B6 | Das Alter für Regel, Reihenfolge und Schlüsselwechsel kommt aus der Änderungszeit der Datei. Eine Kopie des Backup-Ordners ohne Zeitstempel (`cp -r`) verschiebt beides | `backupList()`, `server.js:6745` |
| B7 | „Alte Backups“ nennt je Backup nur die Größe der Datenbank. Die Größe von `kriterion-files/` steht nirgends; nur „Jetzt löschen“ rechnet die Kopien mit | `drawCleanup()`, `app.js:11232` |
| B8 | Zurückspielen gibt es nur für den ganzen Stand. Wer mit Backup 1 nur B zurückholen will, verliert D aus dem Eintrag | F4, 0.52.0 |

Ohne Befund geprüft:

- Die Liste kommt aus der Kopie der Datenbank, nicht aus der laufenden;
  `usertool.js` kann dazwischen committen.
- Während der Kopie löscht der Server nichts in `data/files/`
  (`SWEEP_HELD`, `server.js:6581`).
- Nach Upload, Umlagerung und Speichern des Document Servers folgt
  `moveIntoPlace()` auf `commitFull()` ohne `await` dazwischen
  (`server.js:4110-4122`, `4589-4597`, `948-949`). Ein Backup kann nicht zwischen
  Commit und Umbenennen fallen.
- Das Aufräumen löscht in `kriterion-files/` nur Kopien, die keine
  verbliebene Liste nennt. Jedes verbliebene Backup ist vollständig.
- `SCHEMA` lässt sich in einer Datenbank im Arbeitsspeicher anlegen:
  41 Tabellen in 10 ms. Der Vergleich mit einer verschlüsselten Datenbank
  erkennt eine zusätzliche Spalte und eine fehlende Tabelle. Von 0.48.0 bis
  0.50.0 sind nur `folder_open` und `video_positions` dazugekommen, keine
  Spalte.

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

F1 bis F12 aus Abschnitt 0, alle vom 30. September 2026.

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.51.0**, MINOR. Schema: nein. Austauschformat: bleibt 22. Schreibende Routen: bleiben 89 |
| Werkzeug | `backuptool.sh` auf dem Host, `backuptool.js` in einem Wegwerf-Container (`docker compose run --rm --no-deps`), wie `keytool.sh` und `keytool.js`. `backuptool.sh` steht in `.dockerignore` |
| Befehle | `list`, `show <Auswahl>`, `check <Auswahl>`, `restore <Auswahl>`; ohne Befehl die Hilfe. `check` prüft wie Schritt 2 von `restore` und zeigt den Unterschied; `backuptool.sh restore` ruft es vor dem Anhalten |
| Auswahl | die Nr. aus `list` (1 ist das jüngste), die Zeit aus dem Namen (`2026-09-28-12-18-03`, auch gekürzt bis zum Datum) oder die Ortszeit der Karte (`28.09.2026` oder `28.09.2026 14:18`). Trifft sie mehrere Backups, nennt das Skript sie und bricht ab |
| Ortszeit | aus `TZ` des Containers. Die Namen bleiben in UTC |
| Version | Die Liste beginnt mit `# version 0.51.0`. Beim Backup vor dem Zurückspielen folgt `# vor <Name des zurückgespielten Backups>`. Die Liste entsteht bei jedem Backup, auch ohne Dateien. Jeder Leser überspringt Zeilen mit `#`; die Schleife der README tut es schon (`case`) |
| Alter | aus dem Namen `kriterion-JJJJ-MM-TT-hh-mm-ss` (UTC). Passt der Name nicht, gilt die Änderungszeit |
| Schema passt | Jede Tabelle des Backups außer `sqlite_*` steht in `SCHEMA` und hat genau dessen Spalten. Fehlende Tabellen sind erlaubt, der Start legt sie an. Sonst spielt das Skript nicht zurück und nennt die Abweichungen und die Version aus der Liste |
| `schema.js` | `SCHEMA` zieht aus `db.js` (`db.js:51-598`) in ein eigenes Modul. `db.js` öffnet beim Laden die laufende Datenbank; das Skript muss das Schema kennen, ohne sie zu öffnen |
| `backup.js` | Liste lesen und schreiben, Alter, Regel, Lockfile, Kopie, Aufräumen, Prüfung und das Schreiben eines Backups ziehen aus `server.js` in ein Modul. `server.js` behält die Routen, `BACKUP_BUSY`, `BACKUP_COPY` und `SWEEP_HELD` |
| Schlüssel | `ENCRYPTION_KEY` oder `data/encryption.key`. Fehlen beide, bricht das Skript ab. `keys.loadKey()` wird dafür nicht aufgerufen, weil es einen neuen Schlüssel anlegen würde (`keys.js:82`) |
| Ort | `BACKUP_DIR` mit dem Unterordner `backupPlace` aus der laufenden Datenbank. Ist sie nicht lesbar, `BACKUP_DIR` oder `--ort <Unterordner>` |
| Nachfrage | Das Skript zeigt Prüfung und Unterschied und fragt „Zurückspielen? [ja/nein]“. `--yes` gibt es nur für `backuptool.sh` und den Prüfstand |
| Aufräumen im Backup-Ordner | Das Skript löscht dort nichts. Die Regel läuft nicht beim Backup vor dem Zurückspielen, sonst könnte sie das gewählte Backup löschen |
| Löschen in `data/files/` | nur Namen nach `^[0-9a-f]{32}$`, die die gewählte Liste nicht nennt, deren Kopie gleicher Länge in `kriterion-files/` liegt und die eine verbliebene Liste nennt. Alle anderen bleiben; das Skript nennt ihre Zahl. `upload/` fasst es nicht an |
| Aktueller Stand nicht lesbar | Lässt sich die laufende Datenbank nicht öffnen, entsteht kein Backup davor. Das Skript sagt das und fragt nach. Mit „ja“ benennt es sie mit `-wal` und `-shm` in `katalog.sqlite.vor-<Zeit>` um; in `data/files/` löscht es nur nach der Regel darüber |
| Karte „Alte Backups“ | je Backup eine zweite Zeile „Dateien 98 · 9,8 GB · nur hier 1 · 1,0 MB“, dazu die Version und die Marke „vor dem Zurückspielen“. Über der Liste Zahl und Größe von `kriterion-files/`. „prüfen“ nennt zusätzlich Version und ob das Schema passt |
| Auswahl in „Alte Backups“ | „Auswählen“ im Kopf der Liste, Kästchen je Backup, Leiste „2 ausgewählt · Ausgewählte löschen · Abbrechen“ wie unter „Dateien“. Gesperrt sind die x jüngsten Backups, die zum aktuellen Schlüssel passen; es sind dieselben, die die Regel schützt. Backups mit altem Schlüssel und Backups „vor dem Zurückspielen“ sind wählbar |
| Löschen der Auswahl | `POST /api/backup/cleanup` mit `kind: 'selected'` und den Namen der Backups, hinter der zweiten Bestätigung wie `rule` und `outdated`. Nennt die Anfrage ein gesperrtes oder unbekanntes Backup, wird nichts gelöscht. Danach `cleanBackupFiles()`; je Backup ein Eintrag `backup.delete` im Sicherheitsprotokoll |
| Rückfrage | nennt die Zahl, die Größe der Datenbanken und die Größe der Dateien, die nur in diesen Backups stehen (`copiesFreed()`, `server.js:7172`) |
| Hinweis in der Karte „Backup“ | `card.backupWhatHint` verweist auf `./backuptool.sh` statt auf „dieselbe Programmversion“ |
| Kein Knopf | Zurückspielen nur auf dem Server (F5) |
| Hinweis beim Weiterspielen | `SPOT_HINT_MS` von 5000 auf 10000 (`public/app.js:4421`). Es gilt für jedes Video mit gemerkter Stelle: großes Bild, Vollbild, „Dateien“, Kommentare |
| Sortieren: Bedienung | eine Auswahl neben „Kacheln \| Liste“ im Kopf von „Dateien“ mit „Älteste zuerst“, „Jüngste zuerst“, „Name“. Sie gilt für Kacheln und Liste |
| Sortieren: Speicher | je Account am Server und für alle Einträge, wie `filesView`: neuer Schlüssel `filesSort` in `PERSONAL_KEYS` (`server.js:451`) und in der Liste der erlaubten Werte (`server.js:1692`), `oldest`, `newest`, `name`, Vorgabe `oldest`. Ein anderer Wert wird mit 400 abgewiesen |
| Sortieren: Vorgabe | „Älteste zuerst“ ist die heutige Reihenfolge (`ORDER BY a.sort_order, a.id`, `server.js:2387`). Wer nichts umstellt, sieht keinen Unterschied |
| Sortieren: Datum | das des Uploads (`attachments.created_at`), wie in der Spalte der Liste. Ein Speichern über den Document Server ändert es nicht |
| Sortieren: Name | ohne Unterschied von Groß- und Kleinschreibung, Zahlen in natürlicher Folge („2“ vor „10“), nach der Sprache der Oberfläche (`localeCompare` mit `numeric`) |
| Sortieren: Ordner | Dateien ohne Ordner bleiben oben. Die Ordner folgen der Sortierung (F10): „Jüngste zuerst“ ist die heutige Folge des Servers (Testtag oder Anlage, `server.js:2388-2390`), „Älteste zuerst“ die umgekehrte, „Name“ nach dem Ordnernamen. Laufende Uploads stehen am Ende ihrer Gruppe. Sortiert wird im Browser in `drawAtts()` (`public/app.js:7235`); der Server bleibt bei seiner Folge |
| Bearbeiten in der Zeile | nur in der Listenansicht, nur am Rechner, nur unter derselben Bedingung wie im Menü: `a.preview === 'office' && a.edit && !isNarrow()` (`public/app.js:7356`). Der Knopf „Bearbeiten“ öffnet `fileAddress(id, a.id, true)` wie der Menüeintrag. Die Kacheln bleiben, wie sie sind |
| Menü „…“ | bleibt vollständig (F12) |

---

## 4. Das Skript

### 4.1 `./backuptool.sh list`

Läuft bei laufender Instanz und ändert nichts. Jede Datenbank eines Backups
wird nur lesend geöffnet.

```
Backup-Ordner /app/backup · kriterion-files/: 1.204 Dateien, 12,6 GB

Nr  Zeit (Ortszeit)    Version  Datenbank  Dateien          da       Schlüssel  Schema
 1  30.10.2026 08:15   0.51.0   412,0 MB   124 · 12,1 GB    124/124  passt      passt
 2  29.10.2026 23:39   0.51.0   410,7 MB   121 · 11,9 GB    121/121  passt      passt   vor dem Zurückspielen
 3  29.09.2026 23:39   –        935,5 MB    98 ·  9,8 GB     98/98   passt      passt
```

`–`: das Backup stammt von vor 0.51.0. „Schlüssel alt“: es stammt von vor
einem Schlüsselwechsel.

### 4.2 `./backuptool.sh show <Auswahl>`

Läuft bei laufender Instanz und ändert nichts. Mit `--alle` folgen alle
Einträge mit ihren Dateien.

```
Backup 3 · 29.09.2026 23:39 · kriterion-2026-09-29-21-39-03.sqlite · Version –
Einträge 57 · Dateien 98 (9,8 GB) · 98 von 98 im Backup-Ordner
Schlüssel passt · Schema passt; der Start legt folder_open und video_positions an

Gegenüber dem laufenden Stand
  Einträge nur im Backup (1):              Stuhl K
  Einträge nur im laufenden Stand (2):     Lampe L1, Regal R2
  Dateien, die zurückkämen (1):
    Eintrag X › Testtag 1 › B.txt           1,0 MB
  Dateien, die wegfielen (1):
    Eintrag X › D.txt                       1,0 MB
  vorige Fassungen 3 · im Papierkorb 1 Eintrag
```

Verglichen wird über die Namen auf der Platte. Ohne lesbare laufende Datenbank
entfällt der Vergleich.

### 4.3 `./backuptool.sh restore <Auswahl>`

`backuptool.sh`:

1. `backuptool.js check <Auswahl>` bei laufender Instanz: Prüfung und
   Unterschied wie `show`.
2. „Zurückspielen? Die Instanz wird angehalten. [ja/nein]“
3. `docker compose stop`; `docker compose ps` bestätigt, dass sie steht.
4. `backuptool.js restore <Auswahl> --yes`.
5. Gelungen: `docker compose up -d` und der Hinweis auf das Protokoll.
   Gescheitert: Die Instanz bleibt angehalten, die Meldung nennt den Stand
   und den Rückweg.

`backuptool.js restore`, in dieser Reihenfolge:

1. Lockfile in `kriterion-files/` nehmen. Läuft ein Backup, abbrechen.
2. Prüfen: Die Datenbank des Backups öffnet sich mit dem Schlüssel,
   `PRAGMA quick_check` meldet `ok`, das Schema passt, jede Datei der Liste
   liegt mit ihrer Länge in `kriterion-files/`, Liste und `disk_files` des
   Backups nennen dieselben Namen. Platz in `data/`: Datenbank und die zu
   holenden Dateien; bei einem Backup von vor 0.50.0 dazu die Umlagerung und
   1 GB (`relocationRoom()`, `server.js:4562`). Platz im Backup-Ordner wie
   `backupSpaceShort()`.
3. Backup des aktuellen Stands wie über den Knopf, mit `# vor <Name>` in der
   Liste. Ohne Regel und ohne Aufräumen.
4. Laufende Datenbank mit `PRAGMA wal_checkpoint(TRUNCATE)` abschließen und
   schließen. Erst danach steht der ganze Stand in `katalog.sqlite`.
5. Datenbank des Backups nach `data/katalog.sqlite.neu` kopieren, `fsync`,
   übrige `-wal` und `-shm` löschen, `.neu` in `katalog.sqlite` umbenennen,
   Verzeichnis `fsync`. Eine alte WAL auf der neuen Datenbank würde diese
   beschädigen.
6. Dateien der Liste holen, die in `data/files/` fehlen oder eine andere Länge
   haben (`.part`, `fsync`, umbenennen).
7. Erst danach übrige Dateien löschen, nach der Regel aus Abschnitt 3.
8. Ergebnis prüfen: `quick_check`, jede Zeile in `disk_files` hat ihre Datei
   mit `encLen()`.
9. Lockfile freigeben. Ausgabe:

```
Zurückgespielt: kriterion-2026-09-29-21-39-03.sqlite (29.09.2026 23:39)
Backup davor:   kriterion-2026-10-30-07-15-40.sqlite
data/files/:    2 geholt, 27 gelöscht, 96 unverändert, 0 geblieben
Rückweg:        ./backuptool.sh restore 2026-10-30-07-15-40
```

Jeder Schritt lässt sich wiederholen. Bricht das Skript ab, führt ein zweiter
Aufruf mit derselben Auswahl den Vorgang zu Ende. Ist `katalog.sqlite` schon
byte-gleich mit dem gewählten Backup, entfallen Schritt 3 bis 5. Gibt es keine
laufende Datenbank, etwa auf einem neuen Server, entfallen Schritt 3 und 4.

Beim ersten Start danach führt der Server Frist und Löschliste des
zurückgespielten Stands aus. Offene Uploads und Anmeldungen nach dem Backup
gelten nicht mehr.

### 4.4 Rückgabewerte

`0` gelungen oder nur gelesen · `1` abgelehnt oder gescheitert, die Meldung
nennt den Stand · `2` falscher Aufruf.

---

## 5. Server und Oberfläche

- `POST /api/backup` schreibt die Liste immer, mit `# version`.
- `backupList()` nimmt das Alter aus dem Namen; Reihenfolge, Regel,
  `lastBackup()` und der Vergleich mit dem Schlüsselwechsel folgen.
- `GET /api/backup` nennt je Backup `version`, `before` und
  `files: { count, bytes, onlyCount, onlyBytes }`, dazu
  `store: { count, bytes }` für `kriterion-files/`.
- `POST /api/backup/check` nennt `version` und `schema: { ok, differences }`.
- `drawCleanup()` zeichnet die zweite Zeile, die Marke und die Größe von
  `kriterion-files/`; „prüfen“ zeigt Version und Schema.
- `POST /api/backup/cleanup` nimmt `kind: 'selected'` mit `names`. Die Zahl
  der schreibenden Routen bleibt 89.
- `drawCleanup()` bekommt „Auswählen“, die Kästchen, die Leiste und die
  Rückfrage; Tastatur und Screenreader wie bei der Auswahl unter „Dateien“.
- `PUT /api/settings` nimmt `filesSort`; `GET /api/settings` nennt es.
- `drawAtts()` sortiert Dateien und Ordner nach `filesSort`; der Kopf von
  „Dateien“ bekommt die Auswahl.
- `fillFileTile()` setzt in der Listenansicht den Knopf „Bearbeiten“.

---

## 6. Die Bauabschnitte

### BA 1 — `schema.js`

`SCHEMA` aus `db.js`, dazu `schemaDifferences(db)` mit einer Datenbank im
Arbeitsspeicher. `db.js` lädt `SCHEMA` von dort. Verhalten unverändert.

### BA 2 — `backup.js`

Die Funktionen aus `server.js:6675-7290` ohne Routen und ohne Zustand des
Servers. Verhalten unverändert; der Prüfstand bleibt grün, bevor BA 3 beginnt.

### BA 3 — Liste mit Version, Alter aus dem Namen

### BA 4 — `backuptool.js`: `list`, `show`, `check`

### BA 5 — `backuptool.js`: `restore`

### BA 6 — `backuptool.sh`, `.dockerignore`

### BA 7 — Karte „Alte Backups“: Dateien je Backup, „prüfen“, Auswahl

### BA 8 — Hinweis beim Weiterspielen

`SPOT_HINT_MS` nach F8.

### BA 9 — Sortieren unter „Dateien“

Einstellung `filesSort`, Auswahl im Kopf, Sortierung in `drawAtts()` nach
Abschnitt 3.

### BA 10 — Bearbeiten in der Listenzeile

### BA 11 — Texte

Deutsch, Englisch, Türkisch; Englisch und Türkisch höchstens 15 % länger.
Die Ausgaben des Skripts sind deutsch wie die von `keytool.js`.

### BA 12 — Der Prüfstand

Neues Modul `test/release_051.js`, der Server und `backuptool.js` direkt mit
`node`, ohne Docker:

- das Beispiel aus Abschnitt 2.2 mit Listen, Kopfzeilen und `kriterion-files/`
- Alter aus dem Namen: junger Name mit alter Änderungszeit bleibt, alter Name
  mit junger Änderungszeit fällt
- `list` und `show` mit Version, Zahlen und dem Unterschied B/D
- `restore` von Backup 1: `data/files/` enthält genau A, B, C; D ist gelöscht;
  das Backup davor trägt `# vor`; der Server startet, der Eintrag zeigt A, B,
  C, „Kennzahlen“ meldet keine Datei ohne Verweis
- Rückweg über das Backup davor: A, C, D
- abgelehnt, ohne etwas zu ändern: fehlende Kopie, fremder Schlüssel,
  zusätzliche Spalte, gehaltenes Lockfile, mehrdeutige Auswahl
- kein `data/katalog.sqlite`: zurückgespielt ohne Backup davor
- nicht lesbare laufende Datenbank: umbenannt nach `.vor-<Zeit>`, keine Datei
  ohne Liste gelöscht
- Abbruch nach Schritt 3, 5 und 6; ein zweiter Aufruf führt zu Ende
- Auswahl: gelöscht werden genau die gewählten Backups und die Kopien, die nur
  sie nennen; ein gesperrtes oder unbekanntes Backup in der Anfrage löscht
  nichts; ohne zweite Bestätigung 403; je Backup ein `backup.delete`
- Hinweis beim Weiterspielen: nach 5 s steht er noch, nach 10 s ist er fort
- Sortieren in Kacheln und Liste: die drei Folgen, Dateien ohne Ordner oben,
  Ordner nach F10, laufende Uploads am Ende, „2“ vor „10“; `filesSort` wird
  gespeichert, ein fremder Wert abgewiesen, ohne Wert gilt `oldest`
- „Bearbeiten“ in der Zeile: nur in der Liste, nur mit Recht zum Bearbeiten,
  nicht am Telefon; der Klick öffnet den Editor; das Menü ist unverändert
- Quelltext: `backuptool.sh` hält vor `restore` an und löscht `data` nie ohne
  Ausnahme für `files`, wie die Prüfung von `keytool.sh` (`test/source.js:2344`)

Jede Zusage bekommt einen Rückbau in `counterproof.js`.

### BA 13 — Dokumentation und Zahlen

- README, „Backup“ und „Backup zurückspielen“: `./backuptool.sh list`,
  `show`, `restore`, der Rückweg; die bisherige Schleife bleibt als Weg von
  Hand, wenn kein Image gebaut werden kann. „Update“ mit ZIP: auch
  `chmod +x kriterion/backuptool.sh`. Die Schleife zum Fingerprint nennt
  `backup.js` und `schema.js`.
- Handbuch: „Backup“ und „Alte Backups“; unter „Stelle im Video“ „10 Sekunden“
  statt „Einige Sekunden“ (`manual-de.md:339-340`); unter „Dateien“ das
  Sortieren und „Bearbeiten“ in der Liste.
- `CLAUDE.md`: die Liste der ausgelieferten Dateien und die Zahl der Module.
- Modullisten in `test/source.js` (`LANGUAGE_SOURCES` und weitere) und
  `tools/publish.js` (`FINGERPRINT_MODULE`).
- CHANGELOG, Änderungsprotokoll, Fahrplan, `Doku/Entwicklung.md`,
  `package.json`, Fingerprint.

---

## 7. Abnahme im Betrieb

1. `./backuptool.sh list` zeigt alle Backups; die von vor 0.51.0 mit `–`.
2. Ein Backup anlegen: `list` zeigt `0.51.0`, die Karte „Alte Backups“ Zahl und
   Größe der Dateien.
3. In einem Testeintrag eine Datei löschen und eine hochladen, Backup
   anlegen, `show` mit dem vorigen Backup: je eine Datei „zurück“ und „weg“.
4. `restore` mit dem vorigen Backup: der Eintrag zeigt die gelöschte Datei,
   „Kennzahlen“ meldet keine Datei ohne Verweis.
5. `restore` mit dem Backup davor: der Stand von vor Schritt 4.
6. In „Alte Backups“ zwei alte Backups auswählen und löschen: Die Rückfrage
   nennt den Platz, `list` zeigt beide nicht mehr, die Kästchen der x
   jüngsten sind gesperrt.
7. Ein Video bis 1:30 ansehen, schließen, wieder öffnen: „ab 1:30“ und
   „Von vorn“ stehen 10 s.
8. Unter „Dateien“ „Name“ wählen, die Seite neu laden, an einem anderen Gerät
   öffnen: überall nach Name, Dateien ohne Ordner oben, die Ordner nach Name.
9. In der Liste eine `.docx` mit „Bearbeiten“ öffnen, speichern, schließen.

Die Schritte 4 und 5 an einer Kopie der Installation oder zu einer Zeit, in der
niemand arbeitet: Zurückspielen nimmt alle Änderungen seit dem Backup zurück.

---

## 8. Was nicht dazugehört

| | Grund |
|---|---|
| Einzelne Dateien aus einem Backup zurückholen | F4: eigene Runde, 0.52.0 |
| Ein Ordner je Backup, Hardlinks | F1 |
| Klartextliste mit Dateinamen im Backup-Ordner | F3; die Namen stünden unverschlüsselt |
| Knopf „Zurückspielen“ in der Oberfläche | F5 |
| Ortszeit im Namen | Sommerzeit machte Namen doppelt oder die Reihenfolge falsch; Skript und Karte zeigen Ortszeit |
| Einzeln gelöschte Dateien in den Papierkorb | kein Teil des Backups; Frage für 0.52.0 |
| Sortieren der Bildleiste | F9 nennt „Dateien“ |
| Sortieren nach der letzten Bearbeitung | kein Zeitpunkt gespeichert; bräuchte eine Spalte an `attachments` und damit ein geändertes Schema |
| Herunterladen, Öffnen, Löschen in der Zeile | F11 |

---

## 9. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Kein neues Schema. Der Backup-Ordner wird nicht umgebaut. Die neue
   Einstellung `filesSort` liegt in `user_settings`.
3. Die Kommentarregel gilt, auch für `backuptool.sh`.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Kommt eine Frage auf, die hier nicht beantwortet ist, wird sie als
   Fragetafel gestellt. Antwortet niemand, gilt der einfachere Weg, der kein
   Verhalten ändert.
