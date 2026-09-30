# Änderungsprotokoll 0.53.0 — „Papierkorb für Dateien, Dateien aus Backups zurückholen; Erweiterte Infos, Sortieren nach Typ; README, Anleitung und CHANGELOG englisch“

**Gebaut am 1. Oktober 2026 auf 0.52.0. Fingerprint `5e5fb3c7`, davor
`a4d2ab5e`.**

Nach `Doku/Auftrag_0.53.0.md` und dem Eintrag 0.53.0 im Fahrplan. Schema: ja,
die Tabelle `photo_media`, kein Migrationsblock. Austauschformat: bleibt 22.
Routen: drei neue, `GET` und `POST /api/items/:id/deleted-files` und
`GET /api/photos/:id/info`. Neuer Vorgang im Sicherheitsprotokoll:
`backup.fetch`. Keine neue Abhängigkeit.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 30. September 2026 | V1: „Audio“ statt „Ton“ unter „Erweiterte Infos“: „Wir sind in der Technik.“ |
| 30. September 2026 | V2: „Typ“ in der Auswahl zum Sortieren von „Dateien“ |
| 30. September 2026 | V3: „Container“ statt „Format“, „H.264 (AVC)“ statt „AVC“, in Liste und Kacheln „H.264“ (Fragetafel) |
| 30. September 2026 | V4: ⓘ in der Leiste des Vollbilds öffnet die Erweiterten Infos |
| 30. September 2026 | V5: README und Anleitung englisch als Hauptfassung, dazu deutsch und türkisch |
| 30. September 2026 | V6: Der Auftrag beantwortet jede Frage vor dem Bau; der Bau läuft nach dem Start ohne Rückfrage durch |
| 30. September 2026 | F1 bis F24 in sechs Fragetafeln, die Antworten in Abschnitt 0 des Auftrags. Anders als empfohlen: F10 (Papierkorb für Dateien in dieser Runde), F16 (Erweiterte Infos auch für Fotos des Eintrags), F20 (das CHANGELOG nur noch englisch, als Regel in `CLAUDE.md`), F24 (das ganze CHANGELOG englisch und kürzer als 2.865 Zeilen) |
| 30. September 2026 | Start des Baus: „baue jetzt nach dem Auftrag 0.53.0, und wenn du fertig bist, öffne einen Request“ |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.52.0.

| | 0.52.0 | 0.53.0 |
|---|---:|---:|
| Tabellen | 42 | **43** |
| Schreibende Routen | 89 | **90** |
| Routen insgesamt | 125 | **128** |
| Vorgänge im Sicherheitsprotokoll | 21 | **22** |
| Ausgelieferte JavaScript-Dateien | 18 | 18 |
| Abhängigkeiten in `package.json` | 6 | 6 |
| Zeilen `server.js` | 7.393 | **7.784** |
| Zeilen `public/app.js` | 12.070 | **12.155** |
| Schlüssel je Sprachdatei | 1.410 | **1.431** |
| Regelzeilen des Stilblatts | 1.994 | **1.999** |
| Protokollzeilen | 75 in sieben Dateien | **76** in sieben |
| Kommentarzeilen | 7.040 in 52 Dateien | **7.096 in 53** |
| Dateien des Prüfstands samt `counterproof.js` | 33 | **34** |
| Rückbauten | 1.482 | **1.520** |
| Prüfungen im Prüfstand | 7.975 | **8.040** |
| Zeilen `CHANGELOG.md` | 2.865 | **1.451** |

README und Anleitung, Zeilen:

| | englisch | deutsch | türkisch |
|---|---:|---:|---:|
| README | 626 (`README.md`) | 628 (`README-de.md`, vorher 606 als `README.md`) | 630 (`README-tr.md`) |
| Anleitung | 848 (`manual.md`) | 867 (`manual-de.md`, vorher 848) | 854 (`manual-tr.md`) |

Die Obergrenzen der Kommentarzeilen steigen: `server.js` 1.003 → 1.036
(Papierkorb für Dateien, Zurückholen aus Backups, Warteschlange der Fotos),
`backup.js` 44 → 48 (`entryFiles()`: Suche des Eintrags, fehlende Tabellen und
Spalten), `public/app.js` 1.164 → 1.171 (Namen der Codecs, Ordner bei „Typ“,
Tasten bei offenem Dialog, Angaben zu Fotos, Dialog „Gelöschte Dateien“); neu
ist `test/release_053.js` mit 12.

---

## 3. Was gebaut ist

**Papierkorb für Dateien** (`server.js`). `DELETE /api/attachments/:id` ruft
in seiner Transaktion vor dem `DELETE` `fileIntoTrash()` auf. Es legt eine
Zeile in `trash` an: Titel ist der Dateiname, `content.kind` ist `file`.
`content` nennt den Eintrag (Nummer, `created_at`, Titel), die Datei (Name,
Typ, Größe, `created_at`, Verfasser, „Bearbeiten durch alle“, `saves`, Dauer)
und den Ordner (Nummer, Name, `created_at`, Testtag, Verfasser). Standbild und
ein Inhalt, der noch in der Datenbank liegt, stehen als Teil 0 und 1 in
`trash_bytes`. `disk_files.trash_id` hält die Datei auf der Platte.
`cleanupTrash()` löscht nach 30 Tagen auch diese Zeilen; der Trigger
`disk_files_orphaned` trägt die Datei dann in die Löschliste ein.
`GET /api/trash` stößt danach `sweepSoon()` an.

`POST /api/trash/:id/restore` nimmt Dateien über `fileFromTrash()`. Der
Eintrag kommt aus `entryOf()`: Nummer und `created_at`, sonst `created_at` und
Titel. Es gilt `FILES_PER_ENTRY`. Der Ordner kommt aus `folderBack()`: der
vorhandene, sonst ein neuer mit Name und Datum; den Testtag bekommt er nur,
wenn der frei ist. Der Verfasser kommt aus `keptAuthor()`: gleiche Nummer und
gleicher Name oder ein gelöschter Account. Standbild und „Bearbeiten durch
alle“ kommen mit. `disk_files` bekommt die neue `attachment_id`. Danach stößt
`fileBackQueued()` Vorschaubild, Angaben und bei Bedarf die Umlagerung an.

Karte „Papierkorb“: `GET /api/trash` liefert je Zeile `kind`. Eine Datei steht
als „Eintrag › Ordner › Name“ mit ihrer Größe, und „Eintrag fehlt“, wenn es
den Eintrag nicht mehr gibt. Die Rückfrage beim Löschen einer Datei und bei
„Ausgewählte löschen“ nennt 30 Tage im Papierkorb.

**Gelöschte Dateien aus Backups** (`backup.js`, `server.js`).
`backup.entryFiles()` sucht den Eintrag im Backup nach der Regel von
`compare()` in `backuptool.js` und liefert seine Dateien mit Ordner,
Verfasser, Standbild, `saves` und Namen auf der Platte. Fehlt eine Tabelle oder
Spalte, bleibt die Angabe leer. `deletedFiles()` öffnet jedes Backup am
eingestellten Ort nur lesend mit dem aktuellen Schlüssel; die übrigen zählt
es als nicht lesbar. Angeboten wird, was im Eintrag und im Papierkorb fehlt,
und was im laufenden Stand öfter gespeichert ist (`older`). Deren Name kommt
aus `olderName()` mit dem Datum des Backups in `TZ` des Servers. Belegt der
Name auf der Platte noch eine Zeile in `disk_files`, wird die Datei nicht
angeboten. Dieselbe Fassung erscheint einmal, mit dem jüngsten Backup.

`POST /api/items/:id/deleted-files` holt erst aus dem Papierkorb, dann unter
dem Lockfile des Backup-Ordners (`takeBackupLock()`) aus den Backups. Je Datei
aus einem Backup: Platz nach `spaceShort()`, Name in `DISK_WRITING`, Kopie aus
`kriterion-files/` mit `copySynced()` oder neu verschlüsselt aus
`attachments.data` des Backups (`sealFromBackup()`, `substr` in Stücken zu
1 MiB), dann `commitFull()` und `moveIntoPlace()`. Je geholter Datei steht
eine Zeile `backup.fetch` im Sicherheitsprotokoll. Die Antwort nennt die
Angaben des Eintrags, `fetched` und `refused` mit Grund.

Dialog „Gelöschte Dateien …“ (`public/app.js`): Der Knopf steht im Kopf von
„Dateien“, nur für den Eigentümer-Admin. Der Dialog zeigt „Backups werden
gelesen …“, dann je Datei Kästchen, Name, Ordner, Größe, Herkunft und, wo es
zutrifft, „ältere Fassung“ und „fehlt im Backup-Ordner“. Darunter steht die
Zahl der nicht lesbaren Backups. „Zurückholen“ schickt Papierkorb und Backups
in einer Anfrage.

**Sortieren nach Typ.** `FILES_SORTS.type` mit „A → Z“ und „Z → A“.
`FILE_ORDER.type` ordnet nach Art wie „Nach Typ gruppiert“, dann nach Name;
Ordner stehen nach Name. Die Spalte „Typ“ der Kopfzeile ist ein Knopf.
`filesSort` nimmt `type_asc` und `type_desc` an.

**Erweiterte Infos.** „Audio“, „Audio, Spur 1 von 2“, „Audiospuren“. Hat die
Datei eine Videospur, heißt die Zeile unter „Allgemein“ „Container“.
`codecName()` nennt AVC „H.264“ und HEVC „H.265“, im Dialog mit dem Namen von
MediaInfo in Klammern. Die Datenbank behält den Wortlaut von MediaInfo.

**Angaben zu Fotos und Videos des Eintrags.** Die Tabelle `photo_media` füllt
`makePhotoMedia()` in der Warteschlange der Dateien, nach ihnen: nach dem
Upload und einem Import, beim Start und stündlich. `GET /api/photos/:id/info`
hat die Rechte von `/raw` und liest sofort, wenn die Zeile fehlt. Nicht im
Export.

**ⓘ im Vollbild.** `openLightbox()` nimmt `info`. Der Knopf steht links neben
dem Link, im Vollbild von „Dateien“ und der Fotos des Eintrags, nicht bei
Kommentaren. Solange ein Dialog offen ist, reagiert das Vollbild auf keine
Taste (B2); Esc schließt nur den Dialog.

**README, Anleitung, CHANGELOG, `CLAUDE.md`.** `README.md` ist mit `git mv` zu
`README-de.md` geworden; die deutsche Fassung ist auf dem Stand dieser Runde.
`README.md` und `manual.md` sind englisch, `README-tr.md` und `manual-tr.md`
türkisch, Absatz für Absatz übersetzt, die Codeblöcke Zeichen für Zeichen
gleich. Das CHANGELOG ist englisch, eine Zeile je Änderung, 1.451 Zeilen.
`CLAUDE.md` nach Abschnitt 3 des Auftrags.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| `backup.fetch` | je geholter Datei eine Zeile, ohne Zahl | Das Sicherheitsprotokoll kennt nur Merkmale aus einer festen Liste; eine Zahl ist keines |
| Laufendes Backup | keine 409 für die ganze Anfrage; jede Datei aus einem Backup steht in `refused` mit `server.backupRunning` | Dateien aus dem Papierkorb in derselben Anfrage kommen trotzdem zurück |
| Platz | `spaceShort()` je Datei statt der Summe vorab | dieselbe Prüfung wie beim Upload; abgelehnt wird nur die Datei, die nicht passt |
| Eintrag fehlt | `server.fileEntryGone` „{entryOne} dieser Datei nicht gefunden.“ | Die Oberfläche benennt Einträge über das Vokabular |
| „Kopie fehlt“ | „fehlt im Backup-Ordner“, ebenso `server.backupCopyMissing` | „Kopie“ steht in `SCREEN_BAN` (`test/dom.js`) |
| Name der älteren Fassung | „(Backup TT.MM.JJJJ)“ in jeder Sprache | nach dem Auftrag; der Name gehört zur Datei, nicht zur Oberfläche |
| Englische Texte | britische Schreibweise, „Licence“ | `en-GB` nach `Doku/Woerterbuch_Englisch_0_24_3.md` |
| CHANGELOG | die Linkverweise am Ende und die Kästen zum Neuladen des Browsers entfallen | Grenze 1.500 Zeilen; ein Kasten steht nur, wenn beim Update etwas zu tun ist |
| Türkische Überschriften | ohne `I` und `İ` | GitHub schreibt `İ` im Anker als `i̇` mit Kombinationspunkt; der Link im Inhaltsverzeichnis träfe dann nicht |
| Account im Prüfstand | `owner` statt `eigen` in `test/release_053.js` | `test/source.js` lässt im Prüfstand keine neuen deutschen Bezeichner zu |

**Dauer mit 20 Backups.** Gemessen am 1. Oktober 2026 im Container des Baus
(Linux, 16 GB Arbeitsspeicher). 20 Backups zu je 8,2 MB, 200 Einträge mit je
5 Dateien und ein Eintrag mit 100 Dateien; von diesen liegen 25 im Papierkorb,
25 weitere nur noch in den Backups.

| Anfrage | Dauer |
|---|---:|
| `GET /api/items/:id/deleted-files`, 7 Abrufe | 47 bis 51 ms, Median 51 ms |
| `POST /api/items/:id/deleted-files`, 10 Dateien aus Backups | 32 ms |

Je Backup kostet das Lesen rund 2,5 ms. Größere Datenbanken sind nicht
gemessen.

---

## 5. Der Prüfstand

Neues Modul `test/release_053.js` auf der Portbasis 7340, eingetragen hinter
`release_052`.

| Gruppe | Prüfungen |
|---|---:|
| Papierkorb fuer Dateien: Loeschen legt ab | 3 |
| Papierkorb fuer Dateien: Wiederherstellen | 4 |
| Papierkorb fuer Dateien: Frist, Grenze und geloeschter Eintrag | 5 |
| Dateien aus Backups zurueckholen: B zurueck, D bleibt | 5 |
| Dateien aus Backups zurueckholen: aeltere Fassung, fehlende Kopie, fremder Schluessel | 3 |
| Dateien aus Backups zurueckholen: aus der Datenbank eines alten Backups | 2 |
| Dateien aus Backups zurueckholen: Eintrag aus dem Papierkorb, Grenze, laufendes Backup | 3 |
| Sortieren nach Typ: die Einstellung | 1 |
| Erweiterte Infos zu Fotos und Videos des Eintrags | 3 |
| Gelöschte Dateien: Knopf, Dialog und Zurückholen | 5 |
| Papierkorb: Dateien in der Karte, die Rückfrage beim Löschen | 3 |
| Sortieren nach Typ: Auswahl, Kopfzeile und Ordner | 5 |
| Erweiterte Infos: Audio, Container und H.264 | 5 |
| ⓘ im Vollbild und die Tasten bei offenem Dialog | 6 |
| README und Anleitung in drei Sprachen | 9 |
| Das CHANGELOG ist englisch und kurz | 2 |

**Angepasst:** `test/release_048.js` und `test/release_051.js` löschen
endgültig über den Papierkorb (`deleteForGood()`); `test/release_041.js` und
`test/release_049.js` lesen `README-de.md`; `test/release_052.js` (H.265,
„Container“, vier Knöpfe in der Kopfzeile, „Audio“); `test/roundtrip.js` (90 schreibende und
38 lesende Routen, 43 Tabellen, `detail()` mit `localeOf(req)`);
`test/source.js` (22 Vorgänge, 128 Routen, 1.999 Regelzeilen,
76 Protokollzeilen, 196 Zuweisungen an `innerHTML`, drei Anweisungen auf
`data`, eine auf `file_key`, die sechs Dateien von README und Anleitung, 34
und 53 Dateien); `test/ui_style.js` und `test/release_045.js` (ⓘ in der Leiste); `test/frame.js` (die
neuen Routen, README aus `README-de.md`); `test/selfcheck.js` (Grenzwerte,
53 Dateien, 1.520 Rückbauten, 50 Zieldateien); `testbench.js` (`release_053`).

**Rückbauten.** 1579 bis 1616 neu, einer je Zusage. 560 bekommt einen neuen
Suchtext, weil `LOG_GROUPS.inventory` jetzt `backup.fetch` enthält, und den
heutigen Namen seiner Gruppe. Gefahren mit einem Treiber, der je Rückbau eine
Kopie des Arbeitsbaums anlegt und nur das Modul der erwarteten Gruppe laufen
lässt: 1579 bis 1616 an `test/release_053.js`, 560 an `test/ui_system.js`.
**Alle rot** und durchgelaufen. Im ersten Durchgang brachen sieben Läufe mit
einer Ausnahme im Modul ab; `test/release_053.js` prüft seitdem jeden Wert, den
ein Rückbau wegnehmen kann, mit `?.`. 1604 nahm zuerst `FILES_SORTS.type`
heraus und brachte damit `drawSortControls()` zum Absturz; es filtert jetzt die
Auswahl. Eine volle Gegenprobe ist nicht gefahren.

Der volle Lauf vor dem Push: **8.040 von 8.040** Prüfungen bestanden.

---

## 6. Nicht geprüft und offen

- Die Dauer mit großen Backups ist nicht gemessen, nur mit 8,2 MB je Backup.
- Die türkischen Texte hat kein Muttersprachler gelesen.
- Aus der Übersetzung der Anleitung: Punkte 61 bis 63 in
  `Doku/Fehler_und_Ideen.md` (deutscher Text fest im Code, der Abschnitt
  „Eintrag exportieren“, vier Namen der deutschen Anleitung).
- Die Abnahme im Betrieb nach Abschnitt 5 des Auftrags führt der Betreiber
  durch.
