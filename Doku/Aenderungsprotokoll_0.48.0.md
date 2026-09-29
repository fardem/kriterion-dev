# Änderungsprotokoll 0.48.0 — „Testtage und Dateien auf der Platte“

**Gebaut am 29. September 2026 auf 0.47.1. Fingerprint `e480ecfc`, davor
`a49b4154`.**

Nach `Doku/Auftrag_0.48.0.md` und dem Eintrag 0.48.0 im Fahrplan; Grundlage
ist `Doku/Konzept_Dateien_und_Ordner.md`, Version 2, Version 3 der Strecke.
Schema: ja, die neuen Tabellen `uploads`, `disk_files` und `disk_files_gone`
mit drei Triggern; keine bestehende Tabelle ändert sich. Austauschformat:
21 → 22. Vier neue Routen: `POST /api/items/:id/uploads`,
`PUT /api/uploads/:id`, `DELETE /api/uploads/:id`, `DELETE /api/files/unknown`.

---

## 1. Vorgaben des Betreibers

Die Fragetafel ist vor der ersten Zeile Code beantwortet worden.

| Datum | Vorgabe |
|---|---|
| 29. September 2026 | D1 a): Wird der Ordner eines Uploads in Stücken gelöscht, läuft der Upload zu Ende; die Datei steht danach ohne Ordner und bleibt auf der Platte |
| 29. September 2026 | D2 a): Die Location aus 0.47.0 nimmt `uploads/[0-9a-f]{32}` dazu und bekommt zusätzlich „Disable Request Buffering“; eine zweite Location für `^/api/attachments/[0-9]+/raw$` bekommt „Disable Response Buffering“, AppSec bleibt dort an |
| 27./28. September 2026 | Konzept, Anhang B, und die Entscheidungen im Auftrag, Abschnitt 3 |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.47.1.

| | 0.47.1 | 0.48.0 |
|---|---:|---:|
| Tabellen | 36 | **39** |
| Trigger | 0 | **3** |
| Schreibende Routen | 84 | **88** |
| davon hinter dem CSRF-Schutz | 76 | **80** |
| Routen mit Rufer in `public/app.js` | 119 | **123** |
| Aufrufe von `detail()` in `server.js` | 33 | **37** |
| Schlüssel je Sprachdatei | 1.254 | **1.324** |
| Regelzeilen des Stilblatts | 1.818 | **1.840** |
| Protokollzeilen in den sechs Dateien | 62 | **72** |
| Kommentarzeilen | 6.690 in 44 Dateien | **6.875 in 45** |
| Dateien des Prüfstands samt `counterproof.js` | 28 | **29** |
| Rückbauten | 1.259 | **1.335** |
| Prüfungen im Prüfstand | 7.687 | **7.765** |

---

## 3. Was gebaut ist

**Tabellen und Trigger** (`db.js`). Die Tabellen entstehen mit
`db.exec(SCHEMA)`. `installTriggers()` vergleicht jeden Trigger mit
`sqlite_master` und ersetzt ihn in einer Transaktion, ohne Rückfall.

| Tabelle | Inhalt |
|---|---|
| `uploads` | offener Upload: Eintrag, Account, Ordner (`ON DELETE SET NULL`), Dateiname, Größe, Änderungszeit, `large`, Name unter `upload/`, `received`, `touched_at`, `file_key` |
| `disk_files` | Datei auf der Platte: Name, Größe, Stückgröße, `large`, `file_key`; Besitzer `attachment_id` (`UNIQUE`), `previous_of` oder `trash_id`, jeweils `ON DELETE SET NULL` |
| `disk_files_gone` | die Löschliste |

`disk_files_orphaned` trägt eine Zeile ohne Besitzer in die Löschliste ein und
löscht sie. `disk_files_held` weist einen Besitzerwechsel einer lebenden Datei
ab, außer zur vorigen Fassung derselben Datei. `disk_files_kept` weist das
Löschen einer Zeile mit Besitzer ab.

**Verschlüsselung** (`attachments.js`). AES-256-GCM je Stück zu 1 MiB, Nonce
aus acht Nullbytes und der Stücknummer, AAD der Name, 16 Bytes Marke je Stück;
`encLen(n) = n + 16 · ⌈n / 1 MiB⌉`. Klartext geht erst nach `final()` hinaus.
Jede Datei hat einen eigenen Schlüssel aus 32 Zufallsbytes in `file_key`. Nur
`qDiskFile` und `qUploadFile` lesen `file_key`.

**Upload in Stücken** (`server.js`). `POST /api/items/:id/uploads` beginnt
oder setzt fort, nur in einen eigenen Ordner mit Testtag; ein eigener Upload
mit gleichem Namen, gleicher Größe und Änderungszeit wird ohne Prüfung der
Zahlen fortgesetzt. Ohne Ordner mit Testtag: 413 für ein großes Video, 409 mit
dem Stand des Eintrags für jede andere Datei. `PUT /api/uploads/:id` nimmt je
Anfrage 8 MiB; Rechte, Offset, Länge, Platz und Länge der Datei unter
`upload/` prüft `uploadTurn()` vor dem Rumpf. Die Sperre im Speicher fällt am
Ende des Handlers, nicht bei `close`. Die erste Anfrage eines großen Videos
prüft die ersten 12 Bytes vor dem Verschlüsseln. Der Abschluss committet mit
`synchronous = FULL` und benennt die Datei danach von `upload/` nach
`data/files/` um. Höchstens drei offene Uploads je Account.

**Umlagerung.** Verschieben in einen Ordner mit Testtag und das Zuweisen eines
Testtags schreiben Datei und vorige Fassung verschlüsselt unter `upload/`,
committen mit `synchronous = FULL` und setzen `data` auf `x''`. Hat der
Document Server inzwischen gespeichert (`saves`), beginnt die Umlagerung
einmal neu; sonst holt sie der nächste Lauf nach. Zu wenig Platz: 507.

**Auslieferung.** `/raw` liefert Dateien auf der Platte Stück für Stück mit
Range; das erste Stück wird vor dem Kopf entschlüsselt, jedes weitere nach
`drain`. HEAD prüft die Länge mit `fstat`. `Cache-Control: no-transform`.
Vorschau, Kachel, Document Server und Export entschlüsseln Dateien bis
„Anhang“ ganz.

**Document Server.** Ein Rückschrieb auf eine Datei auf der Platte ist eine
neue Datei mit neuem Namen und Schlüssel; `replaceFile` schreibt nur noch in
die Datenbank, wenn die Datei dort liegt. „Vorige Fassung wiederherstellen“
tauscht auf der Platte die Besitzer.

**Löschen und Läufe.** `sweepDisk()` löscht nur Namen aus der Löschliste, erst
nach `wal_checkpoint(PASSIVE)` mit `checkpointed = log`, und nicht während
einer Backup-Kopie. `diskRun()` läuft beim Start und stündlich: Abschlüsse
nachholen, verfallene Uploads löschen, `upload/` nach bekannten Namen
aufräumen, Papierkorb, `sweepDisk()`, beim Start die Prüfung der Längen,
Umlagerung nachholen.

**Papierkorb, Export, Import.** Der Papierkorb trägt für eine Datei auf der
Platte `data_stored` und hängt die Zeile an die Zeile in `trash`; das
Wiederherstellen prüft, dass sie noch dazu gehört, sonst 404.
`EXCHANGE_FORMAT` 22: je Ordner `testDay` als Stelle im Feld `testDays`. Der
Export trägt eine Datei auf der Platte bis „Anhang“ mit Inhalt, ein großes
Video nur mit Namen. Der Import legt die Dateien eines Ordners mit Testtag auf
die Platte; `/api/import` löst `data_stored` nicht auf.

**Backup.** Liste `.files` aus der Datenbank des Backups, Kopien unter
`kriterion-files/`, Lockfile, 202 und Abfrage der Karte alle 2 s; 200, wenn
nichts zu kopieren ist. Aufgeräumt wird nur nach Muster.

**Kennzahlen.** Dateien auf der Platte, große Videos, im Papierkorb, Uploads,
fehlende, wartende, Dateien ohne Verweis und freier Platz.
`DELETE /api/files/unknown` für den Eigentümer-Admin, nur mit Kopie gleicher
Länge im Backup-Ordner, unter der Sperre des Backups.

**Grenze „Video am {dayOne}“.** Vorgabe 2048 MB, einstellbar 1 bis 4096.

**Browser** (`public/app.js`). Ordnerdialog mit „Name“ und Testtag, 📁 in der
Testtagzeile, „↑ Datum“ im Ordnerkopf, Adresse `#/item/x/folder/y` und „Link
kopieren“. Ein Sprung öffnet einen eingeklappten Block nur für die Ansicht
(`JUMPED`). Upload in Stücken mit Fortschritt, Unterbrechung, Fortsetzen nach
dem Schließen des Tabs, Leiste außerhalb des Eintrags, Ansage für
Screenreader und Wake Lock.

**`keytool.sh`.** Zeile 80 kopiert `data/` ohne `data/files/`, Zeile 101 nennt
einen Rückweg, der `data/files/` stehen lässt.

**Texte.** 71 neue Schlüssel je Sprache; `server.folderTestDay` entfällt.

**Dokumentation.** `README.md`: Einleitung, Funktionen, verratener Schlüssel,
Probe ohne `data/files/` und mit eigenem Backup-Ordner, Backup, Zurückspielen
mit Schleife, Update ohne `data/files/` in der Sicherheitskopie, Reverse Proxy
nach D2. `manual-de.md`: Ordner mit Testtag, Upload in Stücken, große Videos,
Dateien auf der Platte, Testtage, Blöcke, Kennzahlen, Grenzen, Backup, Alte
Backups, Export. `Doku/Entwicklung.md`: Tabellen, Trigger, Verzeichnisse,
Prüfschalter.

---

## 4. Entscheidungen beim Bauen

| Frage | Entscheidung | Grund |
|---|---|---|
| Wortlaut von `server.backupRunning` | „Ein Backup in diesen Backup-Ordner läuft bereits.“ statt „… auch aus einer anderen Instanz“ | Der Prüfstand lässt „Instanz“ in keinem Satz der Sprachdatei zu |
| Rückfrage „Dateien ohne Verweis löschen“ | „Die Datenbank kennt diese Dateien nicht. Der Backup-Ordner enthält sie mit gleicher Länge.“ | Der Satz des Konzepts trägt „Eintrag“ fest, „Kopie“ und „liegt“; die Wörterbuchprüfung weist alle drei ab |
| „davon mit Kopie im Backup“, „sie bleibt liegen“ | „davon auch im Backup-Ordner“, „fehlt im Backup-Ordner und wird nicht gelöscht“ | dieselbe Prüfung |
| Schlüsselnamen über drei Wörter | `card.diskUncopied`, `entry.dayAddLimit`, `entry.dayLimitHint` | Grenzwert der Kürzeprobe |
| Stundenlauf im Prüfstand | neuer Schalter `run=<ms>` | Schritt 2 des Laufs ist sonst nur beim Start prüfbar |
| Prüfung der Rechte von `PUT /api/uploads/:id` | `uploadTurn()` steht hinter der Route (die Funktion wird gehoben) | `test/source.js` liest die Prüfung im Rumpf der Route |
| `addDiskAttachment` | `lateStatement` | sonst lädt `server.js` nicht, wenn `attachments.user_id` fehlt |
| `unknownFiles()` | liefert je Datei den Pfad | Die Route löscht diesen Pfad; eine Gegenprobe ändert dann eine Stelle |
| Eine Datei fehlt auf der Platte | jedes Backup antwortet mit 202 und markiert sie mit `fehlt` | Sie lässt sich nie kopieren; der Prüfstand löscht die Zeile vor dem zweiten Backup |
| Gegenprobe „`UNIQUE` entfernt“ | 1343 entfernt die Prüfung in `folderDay()` | Die Spalte behält `UNIQUE`; ohne die Prüfung antwortet der Server 500 statt 409. Ohne `UNIQUE` hielte die Prüfung allein die Zusage, der Rückbau bliebe stumm |
| Gegenproben „`received ≠ n` nicht geprüft“ und „gelesene Länge nicht geprüft“ | keine eigene | Beide Prüfungen sind zweite Sicherungen hinter der Sperre bzw. der Marke von GCM; ein Rückbau allein bliebe stumm |
| Gegenprobe 1331 | prüft jetzt den Testtag eines anderen Eintrags | Die Zusage aus 0.47.0 („nimmt keinen Testtag an“) gilt nicht mehr |
| Kommentargrenzen | mit `node tools/comments.js --write`: `server.js` 904 → 1.005, `public/app.js` 1.093 → 1.142, `db.js` 55 → 58, `attachments.js` 34 → 42, `test/frame.js` 119 → 121, `test/source.js` 213 → 216, `test/roundtrip.js` 1.310 → 1.311, `counterproof.js` 335 → 336, `test/release_045.js` 4 → 5, `test/release_047.js` 11 → 12, neu `test/release_048.js` | rund 1.300 neue Zeilen in `server.js`: Nonce, Reihenfolge von Commit und `rename`, Checkpoint, Sperren, Prüfschalter |

---

## 5. Der Prüfstand

`test/release_048.js`, 72 Prüfungen in 22 Gruppen, auf der Portbasis 7340
hinter `release_047`. Eine Instanz mit gestelltem Document Server; sie startet
je Gruppe mit anderen Prüfschaltern neu (`free`, `statfail`, `hold`, `run`,
`clock`), einmal nach `kill -9`. „Anhang“ steht auf 1 MB; ein Video von 10 MB
geht in zwei Anfragen, eines von 3 MB in einer über drei Stücke. Rechte mit
vier echten Sitzungen (Eigentümer, Admin, zwei Accounts). Zwei Gruppen laufen
im Mock aus `test/dom.js`.

| Gruppe | Prüfungen |
|---|---:|
| Platte: Ordner mit Testtag | 5 |
| Platte: Upload in Stuecken, Weg und Ordner | 4 |
| Platte: grosse Videos, Endung und erste Bytes | 3 |
| Platte: Stueck, Laenge und Fortsetzen | 3 |
| Platte: Pruefungen vor dem Rumpf | 7 |
| Platte: Ranges und HEAD | 5 |
| Platte: Umlagerung | 5 |
| Platte: kein Weg zurueck | 1 |
| Platte: Rueckschrieb des Document Servers | 4 |
| Platte: Trigger und Loeschliste | 5 |
| Platte: unbekannte Dateien und Wiederherstellen | 3 |
| Platte: Backup mit Dateien | 5 |
| Platte: Dateien ohne Verweis loeschen | 4 |
| Platte: Lauf und upload/ | 2 |
| Platte: Checkpoint und FULL | 2 |
| Platte: verfallene Uploads | 2 |
| Platte: Export und Import | 3 |
| Platte: Upload in einen geloeschten Ordner | 1 |
| Platte: Abbruch und zweite Anfrage | 2 |
| Platte: beschaedigte Datei | 3 |
| Platte: ein Sprung oeffnet den Block nur fuer die Ansicht | 1 |
| Platte: der Browser waehlt den Weg nach dem Ordner | 2 |

Angepasst:

- `test/frame.js`: vier neue Routen in `F_ROUTES`.
- `test/source.js`: 88 schreibende Routen, `EXCHANGE_FORMAT` 22, 123 Routen
  mit Rufer, 1.840 Regelzeilen, 72 Protokollzeilen, 14 gesetzte `id`,
  `copyBox` in der Liste der Einsetzungen, 29 Dateien des Prüfstands, 45 in
  der Stolpersteinprobe; neue Gruppe „Dateien auf der Platte im Quelltext“ mit
  der Liste aus Anhang A.1 (22 Anweisungen), `file_key`, `SELECT *` und
  `keytool.sh`.
- `test/roundtrip.js`: 80 von 88 Routen hinter dem CSRF-Schutz, 39 Tabellen,
  37 Aufrufe von `detail()`, Formatnummer 22; `uhDropColumn` setzt
  `legacy_alter_table`, weil die Trigger auf `attachments` zeigen.
- `test/release_041.js`: sechs Grenzen. `test/release_045.js`: die Zählung
  über `fileSlots()`. `test/release_046.js`: der Hinweis der Bildleiste nennt
  auch „Video am Testtag“. `test/release_047.js`: ein unbekannter Testtag
  ergibt 404; ⋯ und „Link kopieren“ an jedem Ordner.
- `test/ui_language.js`: `Upload-Offset`, `application/octet-stream` und
  `fehlt` als benannte Reste.
- `test/selfcheck.js`: 1.335 Rückbauten, die Kommentargrenzen, 45 Dateien,
  die längste Funktion in `server.js` heißt `importEntries`.
- `testbench.js`: `release_048` hinter `release_047`.

Rückbauten mit neuem Suchtext: 233 und 448 (Formatnummer 22), 551, 593, 925,
1072, 1155, 1246, 1323, 1325, 1329, 1332, 1334, 1336, 1337. 1331 prüft neu.

Rückbauten, neu: 1343 bis 1418, zusammen 76.

| Nr | Rückbau | erwartet in |
|---|---|---|
| 1331 | Ein Ordner nimmt einen Testtag eines anderen Eintrags an | Ordner mit Testtag |
| 1343 | Ein Testtag nimmt einen zweiten Ordner an | Ordner mit Testtag |
| 1344 | Der Admin verbindet einen fremden Testtag | Ordner mit Testtag |
| 1345 | Testtag loeschen loescht den Ordner mit | Ordner mit Testtag |
| 1346 | Der Export traegt den Testtag eines Ordners nicht | Ordner mit Testtag |
| 1347 | Der Browser waehlt den Weg nach der Groesse | der Browser waehlt den Weg nach dem Ordner |
| 1348 | Der Upload in einer Anfrage geht in einen Ordner mit Testtag | Upload in Stuecken, Weg und Ordner |
| 1349 | Ein grosses Video beginnt ohne Ordner mit Testtag | Upload in Stuecken, Weg und Ordner |
| 1350 | Eine Datei bis „Anhang“ beginnt ohne Ordner mit Testtag | Upload in Stuecken, Weg und Ordner |
| 1351 | Die Endung eines grossen Videos wird nicht geprueft | grosse Videos, Endung und erste Bytes |
| 1352 | Die ersten Bytes eines grossen Videos werden nicht geprueft | grosse Videos, Endung und erste Bytes |
| 1353 | Die ersten Bytes werden erst nach dem Verschluesseln geprueft | grosse Videos, Endung und erste Bytes |
| 1354 | Nach falschen ersten Bytes bleibt der Upload stehen | grosse Videos, Endung und erste Bytes |
| 1355 | Jedes Video wird an den ersten Bytes geprueft | grosse Videos, Endung und erste Bytes |
| 1356 | Ein erneutes Stueck wird verschluesselt | Stueck, Laenge und Fortsetzen |
| 1357 | Die Laenge der Datei unter upload/ wird nicht geprueft | Stueck, Laenge und Fortsetzen |
| 1358 | Die Zahlen werden vor der Suche nach dem eigenen Upload geprueft | Stueck, Laenge und Fortsetzen |
| 1359 | Die Pruefung eines Uploads liest erst den Rumpf | Pruefungen vor dem Rumpf |
| 1360 | Ein fremder Upload nimmt Stuecke an | Pruefungen vor dem Rumpf |
| 1361 | Ein falscher Offset wird nicht abgewiesen | Pruefungen vor dem Rumpf |
| 1362 | Zu viele Bytes werden nicht abgewiesen | Pruefungen vor dem Rumpf |
| 1363 | Ohne Platz nimmt ein Upload weiter Stuecke an | Pruefungen vor dem Rumpf |
| 1364 | Die volle Zahl offener Uploads sperrt nicht | Pruefungen vor dem Rumpf |
| 1365 | Scheitert statfs, gilt die Platte als voll | Pruefungen vor dem Rumpf |
| 1366 | Die Stueckgrenze ist verschoben | Ranges und HEAD |
| 1367 | Ein Range hinter dem Ende wird zurechtgebogen | Ranges und HEAD |
| 1368 | HEAD prueft die Laenge der Datei nicht | Ranges und HEAD |
| 1369 | Ein Proxy darf die Auslieferung umformen | Ranges und HEAD |
| 1370 | Das Zuweisen eines Testtags lagert nicht um | Umlagerung |
| 1371 | Das Verschieben in einen Ordner mit Testtag lagert nicht um | Umlagerung |
| 1372 | Die Umlagerung leert data nicht | Umlagerung |
| 1373 | Die Umlagerung vergleicht saves nicht | Umlagerung |
| 1374 | Die Umlagerung prueft den Platz nicht | Umlagerung |
| 1375 | Der Lauf holt die Umlagerung nicht nach | Umlagerung |
| 1376 | Das Verschieben aus dem Ordner holt die Datei in die Datenbank zurueck | kein Weg zurueck |
| 1377 | Der Rueckschrieb ueberschreibt die Datei an ihrer Stelle | Rueckschrieb des Document Servers |
| 1378 | Die aeltere vorige Fassung bleibt | Rueckschrieb des Document Servers |
| 1379 | Wiederherstellen nimmt die Groesse aus data | Rueckschrieb des Document Servers |
| 1380 | Vorschau und Document Server entschluesseln die Datei nicht | Rueckschrieb des Document Servers |
| 1381 | Der Trigger disk_files_orphaned fehlt | Trigger und Loeschliste |
| 1382 | Der Trigger disk_files_held fehlt | Trigger und Loeschliste |
| 1383 | Der Trigger disk_files_kept fehlt | Trigger und Loeschliste |
| 1384 | Die Ausnahme in disk_files_held vergleicht old.attachment_id nicht | Trigger und Loeschliste |
| 1385 | Die Datei wird vor dem Commit geloescht | Trigger und Loeschliste |
| 1386 | sweepDisk gleicht das Verzeichnis ab statt der Liste | unbekannte Dateien und Wiederherstellen |
| 1387 | /api/import loest data_stored auf | unbekannte Dateien und Wiederherstellen |
| 1388 | Wiederherstellen prueft nicht, ob die Datei noch zur Zeile in trash gehoert | unbekannte Dateien und Wiederherstellen |
| 1389 | Die Backup-Kopie haelt das Loeschen nicht an | Backup mit Dateien |
| 1390 | Die Liste des Backups kommt aus der laufenden Datenbank | Backup mit Dateien |
| 1391 | Das Backup antwortet immer mit 202 | Backup mit Dateien |
| 1392 | Die Sperre des Backups gilt nur im Speicher | Backup mit Dateien |
| 1393 | Das Aufraeumen nach dem Backup loescht ohne Muster | Backup mit Dateien |
| 1394 | Dateien ohne Verweis loescht jeder Admin | Dateien ohne Verweis loeschen |
| 1395 | Dateien ohne Verweis: die Kopie wird nicht geprueft | Dateien ohne Verweis loeschen |
| 1396 | Dateien ohne Verweis: die Laenge der Kopie wird nicht verglichen | Dateien ohne Verweis loeschen |
| 1397 | Dateien ohne Verweis: der Abgleich kennt disk_files nicht | Dateien ohne Verweis loeschen |
| 1398 | Dateien ohne Verweis: der Abgleich kennt die Loeschliste nicht | Dateien ohne Verweis loeschen |
| 1399 | Dateien ohne Verweis: upload/ wird mit durchsucht | Dateien ohne Verweis loeschen |
| 1400 | Dateien ohne Verweis: die Sperre des Backups wird nicht genommen | Dateien ohne Verweis loeschen |
| 1401 | Der Abgleich unter upload/ kennt disk_files nicht | Lauf und upload/ |
| 1402 | Nur der Start holt ein rename nach | Lauf und upload/ |
| 1403 | Der Lauf liest die Namen im Speicher nicht | Lauf und upload/ |
| 1404 | sweepDisk vergleicht checkpointed nicht mit log | Checkpoint und FULL |
| 1405 | Der Abschluss committet ohne synchronous = FULL | Checkpoint und FULL |
| 1406 | Eine Datei auf der Platte geht ohne Inhalt in den Export | Export und Import |
| 1407 | Ein grosses Video geht mit Inhalt in den Export | Export und Import |
| 1408 | Der Import legt alles in die Datenbank | Export und Import |
| 1409 | Der Plan zaehlt grosse Videos mit | Export und Import |
| 1410 | Der Plan zaehlt Dateien auf der Platte nicht | Export und Import |
| 1411 | Der Upload in einen geloeschten Ordner geht verloren | Upload in einen geloeschten Ordner |
| 1412 | Die Sperre eines Uploads faellt bei close | Abbruch und zweite Anfrage |
| 1413 | Das Entschluesseln gibt ein Stueck vor der Pruefung der Marke heraus | beschaedigte Datei |
| 1414 | Ein Stueck geht unverschluesselt auf die Platte | beschaedigte Datei |
| 1415 | Ein Klick auf den Kopf nach einem Sprung schreibt BLOCKS.closed | ein Sprung oeffnet den Block nur fuer die Ansicht |
| 1416 | keytool.sh nennt wieder rm -rf data als Rueckweg | Dateien auf der Platte im Quelltext |
| 1417 | Die Liste der Anweisungen auf data ist gekuerzt | Dateien auf der Platte im Quelltext |
| 1418 | file_key wird mit SELECT * gelesen | Dateien auf der Platte im Quelltext |

**77 rot, 0 stumm**, jeder in seiner erwarteten Gruppe. Gefahren nicht mit
`counterproof.js`, sondern je Rückbau nur das Modul der erwarteten Gruppe
(`test/release_048.js`, für 1416 bis 1418 `test/source.js`) in einer Kopie des
Arbeitsbaums, drei Spuren. Ein Lauf von `counterproof.js` fährt je Rückbau den
ganzen Prüfstand, über sechs Minuten; für 77 Rückbauten wären das rund vier
Stunden. Dieser Lauf steht aus.

1385 war zuerst stumm in ihrer Gruppe und rot erst in „Backup mit Dateien“ und
„Checkpoint und FULL“. Die Prüfung hielt eine Schreibsperre auf der Datenbank;
die 500 kam dann schon aus der Anmeldung, die Route lief nie. Die Prüfung legt
jetzt einen Trigger an, der nur das `DELETE` dieser Datei abbricht. Danach ist
1385 rot in „Scheitert das DELETE, bleibt die Datei“.

---

## 6. Nicht geprüft und offen

Der Prüfstand rechnet kein Layout und spielt kein Video. Offen für die
Abnahme (Auftrag, Abschnitt 5): Ordner mit Testtag, Video von 2 GB mit
Abbruch und Fortsetzen, iPhone mit gesperrtem Bildschirm, Umlagerung und
Document Server, Backup mit drei Videos und Zurückspielen, Export und Import,
Papierkorb, Testtag löschen, Tastatur und Screenreader, `keytool.sh`.

Bekannt:

- Bricht ein Neustart ein Backup ab, bleibt `kriterion-files/.lock` 24 h
  stehen. Bis dahin antworten Backup und „Dateien ohne Verweis löschen“ mit
  409. Das Konzept nennt die 24 h; ein früheres Aufheben unterschiede nicht
  zwischen eigenem Rest und einer zweiten Installation.
- Eine Datei, die auf der Platte fehlt, markiert jedes Backup mit `fehlt` und
  antwortet mit 202.
