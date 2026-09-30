# Änderungsprotokoll 0.51.0 — „Backup: Stände sichtbar, Zurückspielen mit Skript; Dateien sortieren“

**Gebaut am 30. September 2026 auf 0.50.0. Fingerprint `7ace25ed`, davor
`2b87077f`.**

Nach `Doku/Auftrag_0.51.0.md` und dem Eintrag 0.51.0 im Fahrplan. Schema: nein.
Austauschformat: bleibt 22. Routen: keine neue; `POST /api/backup/cleanup`
nimmt `kind: 'selected'` mit `names`, `GET /api/backup` die Abfrage `freed`.
Neue Module: `schema.js`, `backup.js`, `backuptool.js`; neues Skript
`backuptool.sh`.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 30. September 2026 | F1: Der Backup-Ordner bleibt flach |
| 30. September 2026 | F2: Das Skript legt vor dem Zurückspielen ein Backup des aktuellen Stands an |
| 30. September 2026 | F3: Die Zuordnung der Dateien zeigen Skript und Karte „Alte Backups“ |
| 30. September 2026 | F4: Einzelne Dateien zurückholen ist eine eigene Runde, 0.52.0 |
| 30. September 2026 | F5: Zurückgespielt wird mit einem Skript auf dem Server |
| 30. September 2026 | F6: Mehrere Backups auswählen und zusammen löschen, in „Alte Backups“ |
| 30. September 2026 | F7: Die jüngsten x nach „Mindestens behalten“ sind nicht wählbar |
| 30. September 2026 | F8: „ab 3:12“ und „Von vorn“ stehen 10 s statt 5 s („doppelt so lange“) |
| 30. September 2026 | F9: Sortieren unter „Dateien“ nach „Älteste zuerst“, „Jüngste zuerst“, „Name“; die Gruppen bleiben |
| 30. September 2026 | F10: Die Ordner sortieren mit |
| 30. September 2026 | F11: In der Listenzeile steht „Bearbeiten“ |
| 30. September 2026 | F12: Das Menü „…“ bleibt vollständig |
| 30. September 2026 | „bitte bau jetzt 0.51.0 nach dem entsprechenden auftrag“ |
| 30. September 2026 | F13: Das Alter eines Backups kommt wie bisher aus der Änderungszeit, nicht aus dem Namen (Fragetafel während des Baus; der Auftrag sah den Namen vor, der Prüfstand hält seit 0.20.0 das Gegenteil fest) |
| 30. September 2026 | F14: Bei der Vorgabe „Älteste zuerst“ steht der älteste Ordner oben (Fragetafel während des Baus; der Auftrag sagte zugleich „wer nichts umstellt, sieht keinen Unterschied“) |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.50.0.

| | 0.50.0 | 0.51.0 |
|---|---:|---:|
| Tabellen | 41 | 41 |
| Schreibende Routen | 89 | 89 |
| Routen insgesamt | 124 | 124 |
| Ausgelieferte JavaScript-Dateien | 15 | **18** |
| Zeilen `server.js` | 7.495 | **7.264** |
| Zeilen `db.js` | 897 | **347** |
| Schlüssel je Sprachdatei | 1.341 | **1.359** |
| Regelzeilen des Stilblatts | 1.944 | **1.955** |
| Protokollzeilen | 74 in sechs Dateien | 74 in **sieben** |
| Kommentarzeilen | 6.932 in 47 Dateien | **7.009 in 51** |
| Dateien des Prüfstands samt `counterproof.js` | 31 | **32** |
| Rückbauten | 1.390 | **1.431** |
| Prüfungen im Prüfstand | 7.848 | **7.912** |

Die 6.932 Kommentarzeilen von 0.50.0 schließen die eine Zeile ein, die der
Pull Request zur Diagnose des Prüfstands nach 0.50.0 dazugebracht hat. Die
Obergrenzen der Kommentarzeilen steigen, weil vier Dateien neu sind: `backup.js`
44, `backuptool.js` 29, `schema.js` 6, `test/release_051.js` 9; `server.js`
sinkt von 1.015 auf 993.

---

## 3. Was gebaut ist

**`schema.js`.** `SCHEMA` zieht aus `db.js` in ein eigenes Modul, Zeichen für
Zeichen. `schemaDifferences(db)` legt `SCHEMA` in einer Datenbank im
Arbeitsspeicher an und vergleicht Tabellen und Spalten: unbekannte Tabellen,
unbekannte und fehlende Spalten; fehlende Tabellen stehen getrennt, weil der
Start sie anlegt. `db.js` lädt `SCHEMA` von dort; `db.exec(SCHEMA)` steht wie
bisher hinter `db.function('kkl')`.

**`backup.js`.** Aus `server.js` ziehen wörtlich `BACKUP_PATTERN`, die Regel
(`CLEANUP_KEEP`, `CLEANUP_DAYS`, `ruleHit()`, `checkRuleValue()`),
`backupList()`, `removeBackups()`, `clearBackupRest()`, `copyPresent()`,
`cleanBackupFiles()`, `listCheck()` und `copiesFreed()`; mit Parametern statt
Zustand des Servers `backupState()` und `checkPlace()` (Ort), `takeLock()` und
`dropLock()` (Lockfile), `diskList()` (Schlüssel als Argument), `spaceShort()`
und `copyDiskFiles()` (Datenbank und `data/files/` als Argument). Neu sind
`writeBackup()` (das Schreiben eines Backups: `.wird`, `VACUUM INTO`, Liste aus
der Kopie, Kopie der Dateien, Liste, Umbenennen), `readList()` und
`writeList()`, `openBackup()`, `copySynced()`, `lockedNames()`,
`listSummary()`, `storeSize()` und `lockHolder()`. `server.js` behält die
Routen, `BACKUP_BUSY`, `BACKUP_COPY` und `SWEEP_HELD`; `takeBackupLock()` und
`dropBackupLock()` verbinden die Sperre im Speicher mit dem Lockfile.

**Liste mit Version.** Jedes Backup schreibt `kriterion-<Zeit>.files`, auch
ohne Dateien. Die erste Zeile ist `# version <Version>`, beim Backup vor dem
Zurückspielen folgt `# vor <Name des zurückgespielten Backups>`. Jeder Leser
überspringt Zeilen mit `#`; die Schleife der README tat es schon. Das Alter
kommt wie bisher aus der Änderungszeit (F13).

**`backuptool.js`.** Befehle `list`, `show <Auswahl> [--alle]`,
`check <Auswahl>`, `restore <Auswahl> [--yes]`, Option `--ort <Unterordner>`;
Rückgabewerte 0, 1 und 2. Der Schlüssel kommt aus `ENCRYPTION_KEY` oder
`data/encryption.key`, ohne `keys.loadKey()`. Die laufende Datenbank wird nur
lesend geöffnet, außer bei `restore`. Die Auswahl nimmt die Nr. aus `list`, die
Zeit aus dem Namen, auch gekürzt, oder die Ortszeit der Änderungszeit wie die
Karte; trifft sie mehrere, nennt das Skript sie und bricht ab. `show`
vergleicht Einträge über `id` und `created_at` und Dateien über den Namen auf
der Platte. `restore` in der Reihenfolge des Auftrags: Lockfile, Prüfung
(Schlüssel, `quick_check`, Schema, Liste gegen `disk_files`, Kopien, Platz in
`data/` und im Backup-Ordner), Backup davor mit `# vor`, `wal_checkpoint`,
Datenbank unter `.neu` mit `fsync` und ohne alte WAL, Dateien holen, übrige
löschen, Ergebnis prüfen. Ist `katalog.sqlite` schon das gewählte Backup,
entfallen Schritt 3 bis 5; ohne laufende Datenbank entfällt das Backup davor;
eine unlesbare wird nach `katalog.sqlite.vor-<Zeit>` umbenannt.

**`backuptool.sh`.** `list`, `show`, `check` reichen durch; `restore` prüft bei
laufender Instanz mit `check`, fragt, hält mit `docker compose stop` an, prüft
mit `docker compose ps`, ruft `restore --yes` und startet danach wieder. Scheitert
es, bleibt die Instanz angehalten. Das Skript steht in `.dockerignore` und
trägt das Ausführungsrecht.

**Karte „Alte Backups“** (`server.js`, `public/app.js`, `public/style.css`).
`GET /api/backup` nennt je Backup `locked`, `version`, `before` und `files`
(`count`, `bytes`, `onlyCount`, `onlyBytes`), dazu `store` für
`kriterion-files/`; mit `freed=<Namen>` die Größe der Kopien, die nur diese
Backups nennen. `POST /api/backup/check` nennt `version` und
`schema: { ok, differences }`. `POST /api/backup/cleanup` nimmt
`kind: 'selected'` mit `names`: ein unbekanntes oder gesperrtes Backup gibt 400
mit `server.cleanupSelection` und löscht nichts; danach `cleanBackupFiles()` und
je Backup `backup.delete`. `drawCleanup()` zeichnet je Backup eine zweite Zeile,
über der Liste die Kopien, „Auswählen“, Kästchen (`input type="checkbox"`,
gesperrte mit `disabled` und Grund im `aria-label`), die Leiste aus
`pickBarHtml()` und die Rückfrage mit `secondConfirm()`. „prüfen“ nennt Version
und Schema. `card.backupWhatHint` verweist auf `./backuptool.sh`.

**Hinweis beim Weiterspielen.** `SPOT_HINT_MS` 10000.

**Sortieren unter „Dateien“.** `filesSort` in `PERSONAL_KEYS` und
`PICK_SETTINGS` (`oldest`, `newest`, `name`, Vorgabe `oldest`, sonst 400 mit
`server.sortUnknown`); `GET` und `PUT /api/settings` nennen es. Im Browser
`FILES_SORT`, die Auswahl `#asort` im Kopf des Blocks, `sortedFiles()` und
`sortedFolders()` in `drawAtts()` und in `showFile()` für die Folge im Vollbild.
„Älteste zuerst“ ist die Folge des Servers; „Jüngste zuerst“ nach `created_at`;
„Name“ mit `localeCompare(…, LOCALE, { numeric: true, sensitivity: 'accent' })`.
Die Ordner: „Jüngste zuerst“ wie vom Server, „Älteste zuerst“ umgekehrt (F14),
„Name“ nach dem Ordnernamen. Laufende Uploads stehen weiter am Ende ihrer
Gruppe.

**Bearbeiten in der Listenzeile.** Jede Dateikachel trägt `.aedit` vor dem
Menü; `fillFileTile()` zeigt ihn unter derselben Bedingung wie der Menüeintrag
und nicht während der Auswahl. Das Stilblatt blendet ihn in den Kacheln aus.

**Texte.** 18 Schlüssel dazu, `card.backupWhatHint` neu gefasst, in drei
Sprachen.

**Dokumentation.** README: Funktionen, Installation und Update mit
`chmod +x … backuptool.sh`, „Backup“ mit der Version in der Liste, „Backup
zurückspielen“ mit `backuptool.sh` und der Schleife als Weg von Hand, die
Schleife zum Fingerprint mit `backup.js` und `schema.js`, Befehle und
Fehlerbehebung. Handbuch: Stelle im Video, Dateien, Sortieren, Ordner, Backup,
Alte Backups. `CLAUDE.md`: achtzehn Module. `Doku/Entwicklung.md`: die neuen
Dateien.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| Laufender Server bei `restore` | `backuptool.js` versucht eine exklusive Sperre auf `katalog.sqlite` und lehnt ab, wenn eine andere Verbindung sie hält | im WAL-Modus hält jede offene Verbindung eine geteilte Sperre; gemessen: `SQLITE_BUSY` bei offenem Server, frei nach dem Anhalten. Ein Aufruf ohne `backuptool.sh` beschädigte sonst die Datenbank |
| Datei, die schon beim Backup fehlte (`fehlt`) | kein Grund zur Absage; die Prüfung nennt sie, danach fehlt sie weiter | das Backup gibt den Stand so wieder, wie er war |
| Name des Backups davor in derselben Sekunde | das Skript wartet bis zur nächsten Sekunde | ein zweiter Aufruf innerhalb einer Sekunde scheiterte sonst mit „Gerade läuft schon ein Backup“ |
| Größe für die Rückfrage der Auswahl | Abfrage `freed` an `GET /api/backup` | keine neue Route; die Zahl hängt an der Auswahl und lässt sich im Browser nicht rechnen |
| Ort im Skript | `backupState()` und `checkPlace()` ziehen nach `backup.js` | das Skript prüft den Ort mit denselben Regeln und Texten wie die Karte |
| Zeit in `list` und `show` | Ortszeit der Änderungszeit, wie die Karte | F13; die Auswahl über die Ortszeit trifft so, was die Karte zeigt |
| Spalte „Schlüssel“ | „alt“, wenn das Backup älter ist als `keyChangedAt`, sonst „passt nicht“ | ein fremder Schlüssel ist kein alter |
| Einträge im Vergleich | gleich bei `id` und `created_at` | nach dem Zurückspielen vergibt SQLite die `id` des verworfenen Stands neu |
| Beispiele in README und Skript | `JJJJ-MM-TT-hh-mm-ss` und `TT.MM.JJJJ hh:mm` statt eines Datums | ein Datum mit Punkten zählt als Versionsnummer |
| „Bearbeiten“ während der Auswahl | ausgeblendet | ein Klick soll dort wählen und nichts öffnen |
| Höhe der Liste „Alte Backups“ | `max-height: 19.58rem` | gemessen in Chromium: eine Zeile mit zweiter Zeile 58,73 px, fünf Zeilen 293,67 px |
| Kommentar „Anlage“ | „Erstelldatum“ und `created_at` | der Prüfstand lässt das Wort in ausgelieferten Dateien nicht mehr zu |

---

## 5. Der Prüfstand

Neues Modul `test/release_051.js` auf der Portbasis 7340, eingetragen hinter
`release_050`. Es startet den Server mit `BACKUP_DIR` und ruft `backuptool.js`
mit `node`, ohne Docker.

| Gruppe | Prüfungen |
|---|---:|
| Backup: die Liste mit Version, auch ohne Dateien | 5 |
| backuptool.js: list und show | 6 |
| backuptool.js: abgelehnt, ohne etwas zu aendern | 6 |
| backuptool.js: restore und der Rueckweg | 7 |
| backuptool.js: ohne und mit unlesbarer laufender Datenbank | 2 |
| backuptool.js: Abbruch nach Schritt 3, 5 und 6; ein zweiter Aufruf fuehrt zu Ende | 3 |
| Alte Backups: mehrere auswaehlen und loeschen | 7 |
| Dateien sortieren: die Einstellung | 1 |
| Alte Backups: die Auswahl in der Oberflaeche | 8 |
| Hinweis beim Weiterspielen: 10 s | 2 |
| Dateien sortieren im Browser | 6 |
| Bearbeiten in der Listenzeile | 5 |
| Quelltext: backuptool.sh und backuptool.js | 4 |

Den Abbruch mitten im Zurückspielen stellt der Schalter `stop=<Schritt>` in
`KRITERION_TESTBENCH`. `test/dom.js` beantwortet `kind: 'selected'` und
`freed`.

`test/selfcheck.js` prüft neu, dass `testbench.js` jedes Modul in `test/`
startet, außer `frame.js` und `dom.js`: Im zweiten vollen Lauf fehlte
`release_051` in `MODULE`, und seine 62 Prüfungen liefen nur einzeln.

**Angepasst:** `test/source.js` (Modullisten mit `schema.js`, `backup.js`,
`backuptool.js`; das Schreiben des Backups in `backup.js`; 1.955 Regelzeilen;
51 Dateien; 32 Dateien des Prüfstands), `test/roundtrip.js` (Regel und
`removeBackups()` aus `backup.js`, die Löschroute liest Art und Namen, das
Backup schreibt seine Liste mit, fünfzehn persönliche Schlüssel,
Modullisten), `test/release_048.js` (Kopfzeilen
der Liste), `test/release_047.js` (der älteste Ordner oben, F14),
`test/release_041.js` und `test/ui_system.js` (neuer Satz zur Karte „Backup“,
Höhe der Liste), `test/batchrun.js`, `test/release_043.js`, `test/ui_language.js`,
`test/ui_style.js`, `test/selfcheck.js` (Grenzwerte der Kommentarzeilen, 51
Dateien, 18 ausgelieferte, beide Skripte auf dem Wirt in einer Zeile `chmod`,
1.431 Rückbauten in 47 Dateien), `testbench.js` (`release_051` in `MODULE`).

**Rückbauten.** 1487 bis 1527 neu, einer je Zusage. Umgelenkt auf `schema.js`:
115, 224, 486, 718, 1115, 1129, 1175, 1199, 1345; auf `backup.js`: 544 bis 550,
554, 1392, 1393; neu gefasst, weil der Code umgebaut ist: 551, 566, 567, 1390,
1391, W14, 1056.

Gefahren mit einem Treiber, der je Rückbau eine Kopie des Arbeitsbaums anlegt
und nur das Modul der erwarteten Gruppe laufen lässt: 1487 bis 1527 an
`test/release_051.js`, 1390 und 1391 an `test/release_048.js`, W14 und 1056 an
`test/source.js`, 567 an `test/ui_system.js`, 551 an `test/roundtrip.js`. Alle
**rot**. Zwei wurden erst im zweiten Anlauf rot: 1496 riss den Lauf ab, weil das
Aufräumen der Prüfung das Lockfile ohne `force` löschte; 1515 griff nicht, weil
`drawCleanup()` gesperrte Namen ein zweites Mal aus der Auswahl nimmt, und
setzt jetzt an `pickable` an. Der Lauf mit `counterproof.js` über den ganzen
Prüfstand steht aus.

---

## 6. Nicht geprüft und offen

- `backuptool.sh` mit Docker: In der Umgebung des Baus gibt es kein Docker.
  Geprüft sind die Befehle von `backuptool.js` mit `node` und der Quelltext des
  Skripts. Die Abnahme im Betrieb (Auftrag, Abschnitt 7) prüft den ganzen Weg.
- `TZ` im Container: geprüft mit `TZ=Europe/Berlin` in der Umgebung von `node`.
- Die Oberfläche ist in Chromium nur für die Höhe der Liste gemessen; Auswahl,
  Sortieren und „Bearbeiten“ sind mit jsdom geprüft.
- Ein großer Bestand beim Zurückspielen: gemessen mit wenigen Dateien. Die Dauer
  wächst mit der Größe der Datenbank und der zu holenden Dateien; der Vergleich
  „schon zurückgespielt“ liest `katalog.sqlite` und das Backup einmal ganz.
