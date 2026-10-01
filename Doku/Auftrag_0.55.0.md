# Auftrag 0.55.0 — „Eine Fassung der Videos für das Telefon; Punkte aus der Abnahme von 0.54.0“

**Aufgestellt am 1. Oktober 2026.** Grundlage ist der Abschnitt 0.55.0 in
`Doku/Fahrplan.md` mit B1, der zweiten Fassung der Videos für das Telefon
(Punkt 57 aus `Doku/Fehler_und_Ideen.md`), mit B2 aus der Abnahme von 0.54.0
und das Messverfahren `Doku/Messverfahren_Umwandlung.md`. F1 bis F14 sind am
1. Oktober 2026 in vier Fragetafeln beantwortet, F15 zu B2 am selben Tag in
einer fünften.

Vorgabe des Betreibers: Weitere Punkte aus der Abnahme von 0.54.0 kommen in
diese Runde, und gebaut wird, wenn er den Bau startet. Kommen vor dem Start
Punkte dazu, werden sie hier nachgetragen. B1 wird erst gebaut, wenn die Zahlen
aus dem Messverfahren vorliegen und der Betreiber mit ihnen entschieden hat
(F1).

Zeilennummern gelten für `bf925e9` (0.54.0).

---

## 0. Vor dem Bau: die offenen Fragen

### Vorgaben des Betreibers

| Nr. | Punkt | Vorgabe |
|---|---|---|
| V1 | B1 | Punkt 57 kommt in 0.55.0; 52, 54 und die Angaben aus gepackten PDF-Objektströmen nicht (Fragetafel) |
| V2 | alle | Die Runde bleibt offen: Punkte aus der Abnahme von 0.54.0 kommen dazu; gebaut wird, wenn der Betreiber den Bau startet (Fragetafel) |
| V3 | B1 | „für mobil mit ffmpeg, egal welches Format das hat, eine schnell abspielbare Konvertierung durchführen lassen“ (30. September 2026) |
| V4 | B1 | „ffmpeg lohnt sich nur, wenn es schnell geht“; vor einer Umsetzung wird die Machbarkeit besprochen und abgestimmt (30. September 2026) |
| V5 | B1 | Der Cache bleibt, wie er ist (30. September 2026) |
| V6 | B1 | Server: Intel N100 mit Quick Sync (Angabe des Betreibers, 30. September 2026) |
| V7 | B2 | „wenn ich ein Video abspiele, fängt es an zu puffern und zu spielen … wenn der Buffer voll ist, zuckt das Video hässlich, und dann springt es vom Stream zum Cache … eigentlich erwarte ich, dass es gar nicht springt“ |
| V8 | B2 | „kann es sein, dass es einmal für den Stream downloadet und einmal für den Buffer? … kostet es nicht Bandbreite?“ |

V1, V2, V7 und V8 vom 1. Oktober 2026.

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | B1: Was ist schnell genug (V4)? Faktor wie im Messverfahren: Dauer des Videos ÷ Zeit der Umwandlung | Faktor 1 mit Quick Sync (eine Stunde Video in einer Stunde) · Faktor 2 · Entscheidung erst mit den Zahlen | **erst mit den Zahlen** |
| F2 | B1: Wo läuft ffmpeg? | im Image von Kriterion, unter einer eigenen Benutzernummer ohne Zugriff auf Schlüssel und Daten · in einem eigenen Container neben Kriterion | **im Image, unter einer eigenen Benutzernummer** (Empfehlung) |
| F3 | B1: Ohne Quick Sync (kein `/dev/dri`)? | die Telefonfassung bleibt aus · die CPU wandelt um (Weg C) | **die CPU wandelt um (Weg C)** |
| F4 | B1: H.264 mit 4:2:2 oder 10 Bit, das Quick Sync nicht dekodiert? | gemischt: die CPU dekodiert, Quick Sync kodiert (Weg B) · keine Telefonfassung | **gemischt (Weg B)** (Empfehlung) |
| F5 | B1: Welche Videos? | nur unter „Dateien“ · dazu Videos des Eintrags und in Kommentaren | **nur unter „Dateien“** (Empfehlung) |
| F6 | B1: Welche Endungen? | `mp4`, `m4v`, `webm`, `mov` wie heute · dazu `mkv`, `avi`, `wmv`, `flv`, die dann über die Telefonfassung abspielen | **dazu `mkv`, `avi`, `wmv`, `flv`** |
| F7 | B1: Welche dieser Videos bekommen eine Telefonfassung? | nur, die sie brauchen: nicht H.264 mit 8 Bit und 4:2:0, mehr als 1080 Zeilen oder mehr als 10 Mbit/s · jedes Video | **nur, die sie brauchen** (Empfehlung) |
| F8 | B1: Zielformat? | 1080p30, H.264 mit 5 Mbit/s, AAC mit 128 kbit/s, wie gemessen · 720p30 mit 2,5 Mbit/s | **1080p30 mit 5 Mbit/s** (Empfehlung) |
| F9 | B1: Videos aus der Zeit vor dem Einschalten? | der ganze Bestand, nach den neuen Videos · nur neue Videos | **der ganze Bestand** (Empfehlung) |
| F10 | B1: Was spielt das Telefon? | die Telefonfassung, im Vollbild ein Umschalter zum Original · die Telefonfassung ohne Umschalter · das Original, die Telefonfassung über den Umschalter | **die Telefonfassung mit Umschalter** (Empfehlung) |
| F11 | B1: Ein Rechner, der das Original nicht abspielt (HEVC in Chrome)? | spielt die Telefonfassung; das Standbild entsteht aus ihr · ein Link zum Herunterladen wie heute | **spielt die Telefonfassung** (Empfehlung) |
| F12 | B1: Backup, Export und Papierkorb? | die Telefonfassung geht nicht mit; nach Zurückspielen und Wiederherstellen wandelt Kriterion neu um · sie geht ins Backup mit | **geht nicht mit** (Empfehlung) |
| F13 | B1: Wer schaltet die Telefonfassung ein? | der Eigentümer-Admin, Vorgabe aus · jeder Admin | **der Eigentümer-Admin, Vorgabe aus** (Empfehlung) |
| F14 | B1: Videos mit HDR, bei der A6700 HLG? | wie andere Videos; ob die Farben stimmen, zeigt die Messung am Telefon · keine Telefonfassung | **wie andere Videos** (Empfehlung) |
| F15 | B2: Wie soll „Video ganz laden“ künftig arbeiten? | erst laden, wenn das Video stockt, und nur im Stand wechseln · nur auf Knopfdruck · entfällt | **entfällt** |

Anders als empfohlen: F1, F3, F6 und F15. Zu F1: Der Betreiber entscheidet mit
der ausgefüllten Tafel aus dem Messverfahren, ob B1 gebaut wird. Zu F3: Ohne
Quick Sync wandelt die CPU alle Formate über Weg C um. Zu F6: `mkv`, `avi`,
`wmv` und `flv` bekommen immer eine Telefonfassung; sie spielen dann am Telefon
und am Rechner über sie. Zu F15: Der Browser puffert wieder selbst, wie vor
0.52.0.

---

## 1. Das Ziel

Am Telefon spielt ein Video unter „Dateien“ eine kleinere Fassung in H.264 und
AAC. ffmpeg erzeugt sie im Hintergrund, mit Quick Sync auf dem N100, ohne Quick
Sync mit der CPU. Am Rechner, beim Herunterladen und im Backup bleibt das
Original. Videos, die kein Browser abspielt (`mkv`, `avi`, `wmv`, `flv`),
spielen überall über die Telefonfassung. Gebaut wird B1 erst, wenn der Betreiber
mit den Zahlen aus der Messung entschieden hat (V4, F1).

„Video ganz laden“ entfällt. Beim Abspielen lädt der Browser die Datei nur noch
einmal, und das Video springt nicht mehr (B2).

---

## 2. Der Stand, geprüft am 1. Oktober 2026

### 2.1 Hochladen und Ablage

- Dateien unter „Dateien“ kommen in Stücken von 8 MB:
  `POST /api/items/:id/uploads` (`server.js`:4241) und
  `PUT /api/uploads/:id` (`server.js`:4282). `finishUpload()`
  (`server.js`:4343) legt die Datei nach `data/files/` und stellt Videos und
  Bilder in die Warteschlange der Analyse (`server.js`:4359).
- Jede Datei ist in Stücken zu 1 MiB mit AES-256-GCM verschlüsselt, mit einem
  eigenen Schlüssel in `disk_files.file_key` (`attachments.js`:268 bis 358).
  Jedes Stück lässt sich allein entschlüsseln. So liefert `sendDiskFile()`
  (`server.js`:4438) Bereiche aus.
- `disk_files` (`schema.js`:389) erlaubt je Datei eine Zeile
  (`attachment_id UNIQUE`, `schema.js`:395). Eine Zeile ohne Besitzer löscht
  der Trigger `disk_files_orphaned` (`db.js`:188) und schreibt ihren Namen nach
  `disk_files_gone`; `sweepDisk()` (`server.js`:7060) löscht dann die Datei.
- `unknownFiles()` (`server.js`:5525) nennt Dateien in `data/files/`, die
  weder `disk_files` noch `disk_files_gone` kennt.
- Grenzen (`UPLOAD_LIMITS`, `server.js`:391): eine Datei bis 2.048 MB,
  einstellbar bis 4.096 MB; Videos des Eintrags und in Kommentaren bis 20 MB,
  einstellbar bis 100 MB.
- Als Video gelten die Endungen `mp4`, `m4v`, `webm` und `mov` (`VIDEO_TYPES`,
  `attachments.js`:19). `avi`, `mkv`, `wmv` und `flv` haben keine Vorschau.

### 2.2 Analyse und Standbild

- `attachment_media` (`schema.js`:314) hält die Angaben aus MediaInfo, je
  Videospur Codec, Profil, Pixel, Bildrate, Bitrate, Bittiefe,
  Farbunterabtastung und HDR (`attachments.js`:375 bis 378). Die Warteschlange
  (`mediaSoon()`, `server.js`:4183) analysiert eine Datei zugleich
  (`inMediaTurn`, `server.js`:4062) und liest dafür entschlüsselte Stücke
  (`readPartsOf()`, `server.js`:4067).
- Kein ausgeliefertes Modul startet ein anderes Programm; `child_process` kommt
  nur im Prüfstand vor.
- Das Standbild eines Videos macht der Browser (`stillFrame()`,
  `public/app.js`:1119). Spielt er das Video nicht ab, etwa HEVC in Chrome,
  entsteht keines.

### 2.3 Abspielen

- Das Vollbild spielt `/api/attachments/<id>/raw?inline=1`
  (`playSource()`, `public/app.js`:4476) mit
  `<video controls playsinline preload="metadata">` (`public/app.js`:4606).
- Zeigt der Browser kein Bild, nennt `unplayable()` (`public/app.js`:4782)
  einen Link zum Herunterladen.
- „Telefon“ heißt im Code ein schmaler Bildschirm (`isNarrow()`,
  `public/app.js`:2741); eine Erkennung des Geräts gibt es nicht.
- „Video ganz laden“ gilt bis 2.048 MB am Rechner und 500 MB am Telefon
  (`WHOLE_BYTES`, `public/app.js`:4578) und misst die Größe des Originals
  (`public/app.js`:4635).
- Die Route `GET /api/attachments/:id/raw` (`server.js`:4374) kennt
  `?size=thumb` und `?size=still`. Sie liefert mit
  `Cache-Control: private, max-age=3600` (`server.js`:4441).

### 2.4 Löschen, Papierkorb, Backup, Export

- Beim Löschen behält der Papierkorb die Datei über `disk_files.trash_id`
  (`fileIntoTrash()`, `server.js`:6859). `attachment_media` fällt mit dem
  Eintrag in `attachments` weg.
- Nach dem Wiederherstellen (`fileFromTrash()`, `server.js`:6916) stellt
  `fileBackQueued()` (`server.js`:6940) die Datei wieder in die Analyse.
- Ein Backup kopiert jede Zeile aus `disk_files` nach `kriterion-files/`
  (`diskList()`, `backup.js`:203; `copyDiskFiles()`, `backup.js`:228).
- Beim Zurückspielen löscht `removeOthers()` (`backuptool.js`:491) Dateien in
  `data/files/`, die das Backup nicht nennt und von denen es eine Kopie hat.
- Der Export trägt keine Angaben aus `attachment_media`.

### 2.5 Image und Compose

- `Dockerfile`: `node:22-bookworm-slim`; der zweite Abschnitt installiert nur
  `fonts-dejavu-core` (Zeilen 20 bis 22). Es gibt keine Zeile `USER`; Kriterion
  läuft im Container als root.
- `docker-compose.example.yml`: ein Dienst, ohne `devices:`.
- `data/encryption.key` hat die Rechte 0600 (`keys.js`:83),
  `data/files/upload/` 0700 (`server.js`:7111).

### 2.6 Die frühere Entscheidung gegen ffmpeg

- Projektstand 0.33.0, Abschnitt 5.7: „`ffmpeg` kommt nicht ins Image (seit
  0.8.50)“; der Server öffne nie ein Video, damit entfielen die Lücken in
  Videobibliotheken.
- `Doku/Entwicklung.md`, Abschnitt „Kurzvideos“: das Image braucht kein
  `ffmpeg` (rund 100 MB, nicht gemessen).
- `Doku/Konzept_Dateien_und_Ordner.md`:746 und der Fahrplan zu 0.45.0 bis
  0.48.0: kein Umkodieren, kein `ffmpeg`.
- Seit 0.52.0 liest MediaInfo Videos auf dem Server, als WebAssembly.
- B1 hebt die Regel für ffmpeg auf. F2 entscheidet, wo es läuft.

### 2.7 Quick Sync und die Messung

Die Grafik des N100 dekodiert in Hardware H.264 nur mit 8 Bit und 4:2:0, HEVC
auch mit 10 Bit und 4:2:2, dazu VP9 und AV1; sie kodiert H.264 und HEVC. XAVC
HS der A6700 (HEVC) geht damit in Hardware. XAVC S mit 4:2:2 und 10 Bit und
XAVC S-I (H.264) dekodiert die CPU (Weg B im Messverfahren). Im Container
braucht es `/dev/dri`, ffmpeg mit VA-API und den Intel-Mediatreiber. Ohne
`/dev/dri` bleibt Weg C, nur die CPU.

Die Tafel aus Abschnitt 5 des Messverfahrens ist leer. Sie wird hier
eingetragen, wenn die Zahlen vorliegen.

### 2.8 Größen

| Fassung | Bitrate | je Stunde |
|---|---|---|
| Original, XAVC HS mit 100 Mbit/s | 100 Mbit/s | 45 GB |
| Telefonfassung 1080p30 | 5 Mbit/s und 128 kbit/s | 2,3 GB |
| Telefonfassung 720p30 | 2,5 Mbit/s und 128 kbit/s | 1,2 GB |

### 2.9 „Video ganz laden“ (B2)

- `loadWhole()` (`public/app.js`:4633) startet beim Ereignis `play`
  (`public/app.js`:4668) einen zweiten Abruf der ganzen Datei:
  `fetch(…, cache: 'no-store')` (`public/app.js`:4638). Der Player lädt daneben
  selbst stückweise weiter.
- Ist die Kopie fertig, setzt `loadWhole()` sie als Quelle des Players
  (`player.src`, `public/app.js`:4660) und springt an dieselbe Stelle. Der
  Browser lädt das Video dabei neu: Er verwirft seinen Puffer, liest den Kopf
  der Datei und sucht die Stelle. Das ist der Sprung aus V7.
- Was der Player bis zum Wechsel geladen hat, kommt zweimal über die Leitung;
  bei einer Datei von 500 MB bis zu rund 1 GB (V8). Auf einer langsamen Leitung
  nimmt der zweite Abruf dem Player Bandbreite.
- Dazu gehören `WHOLE_BYTES` (`public/app.js`:4578), `dropWhole()`
  (`public/app.js`:4626), `shownSource()` (`public/app.js`:4625, auch bei der
  Übergabe an das Vollbild, `public/app.js`:4687), `.lb-loaded`
  (`public/app.js`:4594; `public/style.css`:291 und 1525) und
  `entry.videoLoaded` in den drei Sprachdateien.
- Prüfstand: die Gruppe „Video ganz laden“ in `test/release_052.js` (ab Zeile
  513, 9 Prüfungen) und die Rückbauten 1568 bis 1578.
- Anleitung: „Video ganz laden“ in `manual-de.md`:352, `manual.md`:349 und
  `manual-tr.md`:350.

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

V1 bis V8 und F1 bis F15 aus Abschnitt 0.

### Entschieden in diesem Auftrag

#### Allgemein

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.55.0**, MINOR. Schema: **ja**, eine neue Tabelle `attachment_phone` und ein Trigger, kein Migrationsblock. Austauschformat: bleibt 22 |
| Routen | keine neue. `GET /api/attachments/:id/raw?size=phone` liefert die Telefonfassung. Der Schalter geht über `PUT /api/settings`, der Zustand kommt mit `GET /api/settings` |
| Abhängigkeiten | in `package.json` keine neue. Im Image `ffmpeg` und der Intel-Mediatreiber aus Debian (F2) |
| Module | neues Modul `phone.js`: Aufruf von ffmpeg, Wahl des Wegs, Test von Quick Sync. Die ausgelieferten JavaScript-Module werden 19 |
| Sicherheitsprotokoll | kein neuer Vorgang |
| Sprachen | jeder neue Text in `de.json`, `en.json` und `tr.json`; README und Anleitung in allen drei Fassungen, das CHANGELOG englisch (`CLAUDE.md`) |

#### B1 — Die Telefonfassung

| Frage | Antwort |
|---|---|
| Machbarkeit | Gebaut wird, wenn die Tafel aus dem Messverfahren in Abschnitt 2.7 steht und der Betreiber mit ihr den Bau freigibt (F1). Mit denselben Zahlen entscheidet er über Weg B (F4) und Weg C (F3) |
| Ort | nach F2 |
| Benutzer | ffmpeg läuft unter der Nummer 65534 (`nobody`), mit der Gruppe von `/dev/dri/renderD128` und ohne die Umgebung von Kriterion. Das geht nur, weil Kriterion im Container als root läuft (Abschnitt 2.5) |
| Eingabe | ffmpeg liest das Original über `http://127.0.0.1:<Port>/<Marke>`; Port und Marke gelten nur für einen Lauf. Kriterion entschlüsselt dabei Stück für Stück wie `sendDiskFile()`. Das Original liegt nie unverschlüsselt auf der Platte |
| Ausgabe | in ein Verzeichnis unter `/tmp`, das nur der Nummer 65534 gehört. Danach verschlüsselt Kriterion die Datei wie beim Hochladen nach `data/files/phone/` und löscht die Kopie. Während des Laufs liegt die Telefonfassung unverschlüsselt in `/tmp` des Containers |
| Wege | aus `attachment_media`: H.264 mit 8 Bit und 4:2:0, HEVC, VP9 und AV1 über Weg A; H.264 mit 4:2:2 oder 10 Bit über Weg B (F4); ohne Quick Sync alles über Weg C (F3). Die Befehle wie im Messverfahren, Abschnitt 4 |
| Auswahl | nach F5 bis F7 und F14. `mkv`, `avi`, `wmv` und `flv` bekommen immer eine Telefonfassung (F6) |
| Analyse | `mediaKind()` (`attachments.js`:361) nimmt `mkv`, `avi`, `wmv` und `flv` dazu: Die Warteschlange analysiert sie, „Erweiterte Infos“ zeigt sie (heute 404, `server.js`:4414) |
| Die vier Endungen | Bis ihre Telefonfassung fertig ist, bleiben sie wie heute ohne Vorschau. Danach gelten sie als Video: Das Standbild entsteht aus der Telefonfassung, sie spielen über sie am Telefon und am Rechner; „Herunterladen“ liefert das Original |
| Ziel | nach F8. Höchstens 30 Bilder je Sekunde; das Seitenverhältnis bleibt; ein Video mit weniger Zeilen behält seine Höhe |
| Reihenfolge | eine Umwandlung zugleich, mit Priorität 19 (`os.setPriority()`); neue Videos vor dem Bestand (F9). Erst nach der Analyse mit MediaInfo: ohne Zeile in `attachment_media` keine Umwandlung. Weg C belegt die CPU für die ganze Umwandlung; die Priorität hält Kriterion bedienbar |
| Abbruch | ffmpeg wird beendet, wenn der Lauf länger dauert als die Dauer des Videos mal 4 plus 10 Minuten, wenn der freie Platz nicht reicht (`spaceShort()`) und beim Beenden von Kriterion |
| Fehler | Zustand „fehlgeschlagen“ mit dem Grund in der Tabelle. Der nächste Start von Kriterion versucht es einmal neu |
| Tabelle | `attachment_phone (attachment_id INTEGER PRIMARY KEY REFERENCES attachments(id) ON DELETE CASCADE, name TEXT UNIQUE, size INTEGER, file_key BLOB, width INTEGER, height INTEGER, state TEXT NOT NULL, reason TEXT, made_at TEXT)` |
| Verzeichnis | `data/files/phone/` mit den Rechten 0700. Ein Trigger schreibt beim Löschen einer Zeile ihren Namen nach `disk_files_gone`; `sweepDisk()` löscht die Datei. Dateien in `data/files/phone/` ohne Zeile löscht der stündliche Lauf; `unknownFiles()` nennt sie nicht |
| Auslieferung | `?size=phone` an `GET /api/attachments/:id/raw`, mit Bereichen wie `sendDiskFile()`. Ohne fertige Telefonfassung 404 |
| Abspielen | nach F10 und F11. `playSource()` nimmt am Telefon (`isNarrow()`) die Telefonfassung, wenn sie fertig ist. Die Stelle, an der das Video stand, gilt für beide Fassungen |
| Anzeige | „Erweiterte Infos“ bekommt eine Gruppe „Telefonfassung“: Zustand, Pixel, Größe |
| Karte | Einstellungen › Installation, Karte „Telefonfassung“: Schalter (F13), ob Quick Sync kodiert (Test aus Abschnitt 2 des Messverfahrens) oder die CPU umwandelt (F3), Zahl der fertigen, wartenden und fehlgeschlagenen Fassungen, Platz auf der Platte |
| Backup, Export, Papierkorb | nach F12 |
| Platz | `spaceShort()` gilt vor jedem Lauf |
| Image | `Dockerfile`: `ffmpeg` und der Intel-Mediatreiber im zweiten Abschnitt, mit `--no-install-recommends`. Ob der freie Treiber aus Debian auf dem N100 H.264 kodiert oder der aus `non-free` nötig ist, klärt BA 2. `docker-compose.example.yml`: `devices: - /dev/dri:/dev/dri`, auskommentiert |
| Prüfstand | Statt ffmpeg läuft ein Skript des Prüfstands, das eine kleine MP4 schreibt; der Schalter dafür kommt über `keys.testbenchSwitch()`. Eine echte Umwandlung prüft nur die Abnahme |

#### B2 — „Video ganz laden“ entfällt (V7, V8, F15)

| Frage | Antwort |
|---|---|
| Player | `loadWhole()`, `dropWhole()`, `WHOLE_BYTES` und `.lb-loaded` entfallen. `shownSource()` liefert die Quelle des Players. Beim Abspielen wechselt die Quelle nicht mehr |
| Puffern | Der Browser puffert selbst; `preload="metadata"` bleibt (V5) |
| Texte | `entry.videoLoaded` entfällt in den drei Sprachdateien |
| Prüfstand | Die Gruppe „Video ganz laden“ in `test/release_052.js` prüft künftig: beim Abspielen kein zweiter Abruf, die Quelle bleibt, kein Text „geladen“. Die Rückbauten 1568 bis 1578 bekommen neue Ziele oder entfallen |
| Anleitung | Der Absatz „Video ganz laden“ entfällt in allen drei Fassungen |
| Messung | B2 hängt nicht an der Messung aus BA 1 |

---

## 4. Die Bauabschnitte

### BA 1 — Die Messung

Der Betreiber trägt die Tafel aus Abschnitt 5 des Messverfahrens in Abschnitt
2.7 ein und entscheidet mit ihr über den Bau (F1), über Weg B (F4) und über
Weg C (F3). Gibt er den Bau nicht frei, endet B1 hier. Nimmt er in HLG auf,
gehört ein Video in HLG in die Messung (F14).

### BA 2 — Image und Compose

`ffmpeg` und der Intel-Mediatreiber im `Dockerfile`, `/dev/dri` in
`docker-compose.example.yml`. Gemessen: die Größe des Images davor und danach;
der Test aus Abschnitt 2 des Messverfahrens im Container von Kriterion.

### BA 3 — Tabelle und Verzeichnis

`attachment_phone` in `schema.js`, der Trigger in `db.js`,
`data/files/phone/`, Löschen im stündlichen Lauf, `unknownFiles()`.

### BA 4 — Die Umwandlung

`phone.js`: Wahl zwischen Weg A, B und C, Aufruf unter der Nummer 65534,
Eingabe über 127.0.0.1, Ausgabe nach `/tmp`, Verschlüsseln, Abbruch, Test von
Quick Sync.

### BA 5 — Die Warteschlange

Auswahl nach F5 bis F7 und F14, `mediaKind()` mit den vier Endungen (F6),
Reihenfolge nach F9, Fehler, Platz, Neustart.

### BA 6 — Auslieferung und Abspielen

`?size=phone`, `playSource()`, der Umschalter (F10), der Rechner ohne HEVC und
das Standbild (F11), die vier Endungen als Video (F6).

### BA 7 — Karte und Erweiterte Infos

Karte „Telefonfassung“ mit Schalter und Zustand, die Gruppe in „Erweiterte
Infos“.

### BA 8 — Löschen, Papierkorb, Backup, Export

Nach F12: Papierkorb, Wiederherstellen, Backup, Zurückspielen mit
`backuptool.js`, Export und Import.

### BA 9 — „Video ganz laden“ entfällt (B2)

`loadWhole()` und was dazugehört, `.lb-loaded`, `entry.videoLoaded`. Hängt
nicht an BA 1.

### BA 10 — Texte

`de.json`, `en.json`, `tr.json`.

### BA 11 — Anleitung und README

Anleitung und README in drei Sprachen: die Telefonfassung, der Umschalter, die
Karte; der Absatz „Video ganz laden“ entfällt. README: `/dev/dri` und die Gruppe
im Container, die unverschlüsselte Kopie in `/tmp` während des Laufs.

### BA 12 — Der Prüfstand

Neues Modul `test/release_055.js` mit dem Ersatz für ffmpeg; die Gruppe „Video
ganz laden“ in `test/release_052.js` und die Rückbauten 1568 bis 1578 nach B2.
Je Zusage eine
Prüfung und ein Rückbau in `counterproof.js`. Die Rückbauten werden einzeln
gegen ihr Modul gefahren, mit höchstens vier Spuren (`OFFSET_TRACES` in
`test/frame.js`).

### BA 13 — Dokumentation und Zahlen

CHANGELOG englisch, Änderungsprotokoll mit „Vorgaben des Betreibers“,
`Doku/Fahrplan.md`, `Doku/Entwicklung.md` (Abschnitt „Kurzvideos“ und die
Tabelle `attachment_phone`), `CLAUDE.md` (19 Module), `package.json` 0.55.0,
Fingerprint. Zahlen am fertigen Stand.

---

## 5. Abnahme im Betrieb

1. Mit `/dev/dri` im Container nennt die Karte „Telefonfassung“: Quick Sync
   kodiert.
2. Nach dem Einschalten wandelt Kriterion den Bestand um; die Karte zählt mit.
3. Ein Video der A6700 hochladen. „Erweiterte Infos“ nennt danach unter
   „Telefonfassung“ Zustand, Pixel und Größe.
4. Am iPhone und an einem Telefon mit Android im Vollbild: Es spielt die
   Telefonfassung, Springen geht, der Umschalter wechselt zum Original (F10).
5. Chrome am Rechner mit einem Video in HEVC: nach F11.
6. Ein Video in HLG am Telefon: nach F14.
7. „Herunterladen“ liefert das Original in seiner Größe.
8. Das Video löschen: Die Telefonfassung ist nach dem stündlichen Lauf aus
   `data/files/phone/` verschwunden. Wiederherstellen: nach F12.
9. Ohne `/dev/dri` nennt die Karte die CPU; die Umwandlung läuft über Weg C
   (F3).
10. Während einer Umwandlung bleibt Kriterion bedienbar, mit und ohne Quick
    Sync.
11. Eine Datei `.mkv` hochladen: Nach der Umwandlung hat sie ein Vorschaubild
    und spielt am Rechner und am Telefon (F6).
12. Ein Backup enthält keine Telefonfassung (F12).
13. Ein Video am Rechner und am Telefon bis zum Ende abspielen: kein Zucken,
    kein Sprung. Die Netzwerkanalyse des Browsers zeigt nur die Abrufe des
    Players (B2).

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Punkte 20, 52 und 54, die Angaben aus gepackten PDF-Objektströmen | V1 |
| Länger cachen, `preload="auto"` | V5 |
| Mehrere Stufen, HLS oder DASH | eine Telefonfassung reicht für das Ziel |
| HEVC als Ziel | H.264 spielt auf jedem Telefon |
| Standbild vom Server | das Standbild macht weiter der Browser |
| Umwandeln zu festen Zeiten | eine Umwandlung zugleich mit Priorität 19 |
| Videos des Eintrags und in Kommentaren | nach F5 |
| „Video ganz laden“ erst beim Stocken oder auf Knopfdruck | F15 |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. B1 wird erst gebaut, wenn die Tafel aus Abschnitt 5 des Messverfahrens in
   Abschnitt 2.7 steht und der Betreiber den Bau startet.
3. Neues Schema nur mit neuen Tabellen, ohne Migrationsblock.
4. Die Kommentarregel gilt.
5. Kein Pull Request, wenn keiner verlangt wurde.
6. Kommt beim Bau eine Frage auf, die hier nicht beantwortet ist, gilt der
   einfachere Weg, der kein Verhalten ändert; die Frage und der gewählte Weg
   stehen im Änderungsprotokoll.
