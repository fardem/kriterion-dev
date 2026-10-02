# Auftrag 0.55.0 — „Proxys für Videos; Punkte aus der Abnahme von 0.54.0“

**Aufgestellt am 1. Oktober 2026.** Grundlage ist der Abschnitt 0.55.0 in
`Doku/Fahrplan.md` mit B1, einem Proxy für Videos (Punkt 57 aus
`Doku/Fehler_und_Ideen.md`), mit B2 aus der Abnahme von 0.54.0 und das
Messverfahren `Doku/Messverfahren_Umwandlung.md`. F1 bis F14 sind
am 1. Oktober 2026 in vier Fragetafeln beantwortet, F15 zu B2 am selben Tag in
einer fünften; die Antwort auf F15 hat der Betreiber danach geändert (V9).
F16 bis F18 folgen aus V10 und V11 und sind am selben Tag in zwei weiteren
Tafeln beantwortet. Die Tafel mit F20 bis F23 hat der Betreiber am selben Tag
weggeklickt; F19 bis F25 sind am 2. Oktober 2026 in zwei Tafeln beantwortet.

Vorgabe des Betreibers: Weitere Punkte aus der Abnahme von 0.54.0 kommen in
diese Runde, und gebaut wird, wenn er den Bau startet. Kommen vor dem Start
Punkte dazu, werden sie hier nachgetragen. B1 ist mit den Zahlen aus dem
Messverfahren freigegeben (F1, F20).

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
| V9 | B2 | „Doch lieber auf Knopfdruck“: ersetzt die erste Antwort auf F15, „entfällt“ |
| V10 | B1 | „Framerate original belassen, nur Bitrate ändern“: ersetzt „30“ in der Antwort auf F8 |
| V11 | B1 | „das nennt man Proxyfile“ und „oder Lowres. Aber im Schnitt wird es als Proxy bezeichnet“: Anlass für F18 |
| V12 | B1 | „eventuell kann man nach dem Hochladen berechnen lassen und in einem Proxy-Ordner, gleich verschlüsselt, aber dieser muss mit dem großen zusammen verwaltet werden, also immer zu dem großen gehören und wie gehabt auf dem Mobil vorzugsweise abgespeichert werden. Ist keins da, muss dann im Hintergrund gerechnet werden, und erst wenn es vorhanden ist, dann den Proxy anbieten, und erst beim Umschalten auf Originalqualität darf umgeschaltet werden, aber beim nächsten Mal dann dennoch die Mobil anbieten. Beim Desktop auch das Gleiche. Wir machen nicht zwei Wege.“ und „das Kodieren im Admin-Menü ein- und ausschaltbar“. „abgespeichert“ ist hier als „abgespielt“ gelesen |
| V13 | B1 | „die Qualität war ok, vermutlich wäre dann 7,5 Mbit etwas besser“ und „wir können ja noch einen Test machen mit 7,5 Mbit, so ein Mittelding“: Anlass für F21 |
| V14 | B1 | „wenn wir diesen Weg gehen, sollte es so sein, dass Proxys da sein können, aber wenn sie nicht da sind, darf kein Fehler verursacht werden. Dann wird im Hintergrund einfach einer angelegt … also ein unkomplizierter, smoother Flow“ |
| V15 | B1 | „das Problem ist, dass jede Maschine anders ist; wenn ich das veröffentliche und wir brauchen das, muss das gut dokumentiert sein“ |
| V16 | B1 | „zu Forschungszwecken ist das ja ok, aber wenn wir es veröffentlichen, muss es für alle Menschen, oder meistens Menschen, ein gangbarer Weg sein und nicht ein sehr spezieller, nerdiger Weg“ |
| V17 | B1 | „Wenn der schlanke Image mit ffmpeg für den User unsichtbar ist, dann können wir das schon machen“ |
| V18 | B1, B2 | „wenn man ohne die Seite neu zu laden wieder abspielt, wäre es schön, wenn es nicht neu laden muss. Wie lange bleibt es im Cache?“ Antwort: Der Server erlaubt 1 Stunde (`Cache-Control: private, max-age=3600`, `server.js`:4441); ob der Browser die Stücke nimmt, hängt vom Browser ab, nicht gemessen. Daraus F25: Die letzte Kopie aus „Ganz laden“ bleibt bis zum Neuladen der Seite |
| V19 | B1 | „klar, ich bin für die neuere Version, aber was wäre denn überhaupt der Vorteil“ und „es reicht doch, wenn du das in deiner Umgebung testest … an den Zeiten wird sich da nicht mehr viel tun“: ffmpeg 9.0.2 statt 7.1.5, ohne eigene Messung auf dem N100; Quick Sync und Hochkant prüft die Abnahme |

V1, V2 und V7 bis V16 vom 1. Oktober 2026, V17 bis V19 vom 2. Oktober 2026.

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | B1: Was ist schnell genug (V4)? Faktor wie im Messverfahren: Dauer des Videos ÷ Zeit der Umwandlung | Faktor 1 mit Quick Sync (eine Stunde Video in einer Stunde) · Faktor 2 · Entscheidung erst mit den Zahlen | **erst mit den Zahlen** |
| F2 | B1: Wo läuft ffmpeg? | im Image von Kriterion, unter einer eigenen Benutzernummer ohne Zugriff auf Schlüssel und Daten · in einem eigenen Container neben Kriterion | **im Image, unter einer eigenen Benutzernummer** (Empfehlung) |
| F3 | B1: Ohne Quick Sync (kein `/dev/dri`)? | die Telefonfassung bleibt aus · die CPU wandelt um (Weg C) | **die CPU wandelt um (Weg C)** |
| F4 | B1: H.264 mit 4:2:2 oder 10 Bit, das Quick Sync nicht dekodiert? | gemischt: die CPU dekodiert, Quick Sync kodiert (Weg B) · keine Telefonfassung | **gemischt (Weg B)** (Empfehlung) |
| F5 | B1: Welche Videos? | nur unter „Dateien“ · dazu Videos des Eintrags und in Kommentaren | **nur unter „Dateien“** (Empfehlung) |
| F6 | B1: Welche Endungen? | `mp4`, `m4v`, `webm`, `mov` wie heute · dazu `mkv`, `avi`, `wmv`, `flv`, die dann über die Telefonfassung abspielen | **dazu `mkv`, `avi`, `wmv`, `flv`** |
| F7 | B1: Welche dieser Videos bekommen eine Telefonfassung? | nur, die sie brauchen: nicht H.264 mit 8 Bit und 4:2:0, mehr als 1080 Zeilen oder mehr als 10 Mbit/s · jedes Video | **nur, die sie brauchen** (Empfehlung; ersetzt durch F24) |
| F8 | B1: Zielformat? | 1080p30, H.264 mit 5 Mbit/s, AAC mit 128 kbit/s, wie gemessen · 720p30 mit 2,5 Mbit/s | **1080p30 mit 5 Mbit/s** (Empfehlung; die Bildrate geändert mit V10, die Bitrate mit F17) |
| F9 | B1: Videos aus der Zeit vor dem Einschalten? | der ganze Bestand, nach den neuen Videos · nur neue Videos | **der ganze Bestand** (Empfehlung) |
| F10 | B1: Was spielt das Telefon? | die Telefonfassung, im Vollbild ein Umschalter zum Original · die Telefonfassung ohne Umschalter · das Original, die Telefonfassung über den Umschalter | **die Telefonfassung mit Umschalter** (Empfehlung) |
| F11 | B1: Ein Rechner, der das Original nicht abspielt (HEVC in Chrome)? | spielt die Telefonfassung; das Standbild entsteht aus ihr · ein Link zum Herunterladen wie heute | **spielt die Telefonfassung** (Empfehlung) |
| F12 | B1: Backup, Export und Papierkorb? | die Telefonfassung geht nicht mit; nach Zurückspielen und Wiederherstellen wandelt Kriterion neu um · sie geht ins Backup mit | **geht nicht mit** (Empfehlung; ersetzt durch F22) |
| F13 | B1: Wer schaltet die Telefonfassung ein? | der Eigentümer-Admin, Vorgabe aus · jeder Admin | **der Eigentümer-Admin, Vorgabe aus** (Empfehlung) |
| F14 | B1: Videos mit HDR, bei der A6700 HLG? | wie andere Videos; ob die Farben stimmen, zeigt die Messung am Telefon · keine Telefonfassung | **wie andere Videos** (Empfehlung) |
| F15 | B2: Wie soll „Video ganz laden“ künftig arbeiten? | erst laden, wenn das Video stockt, und nur im Stand wechseln · nur auf Knopfdruck · entfällt | **nur auf Knopfdruck** (zuerst „entfällt“, geändert mit V9) |
| F16 | B1: Die Bildrate bleibt wie im Original (V10). Bleibt es bei 1080p, wenn das Original mehr Zeilen hat? | ja, 1080p: 4K wird auf 1920×1080 verkleinert · nein, Pixel wie im Original, nur die Bitrate sinkt | **ja, 1080p** (Empfehlung) |
| F17 | B1: Welche Bitrate bekommen Videos mit mehr als 30 Bildern je Sekunde? | steigt mit der Bildrate: 5 Mbit/s bis 30p, 8 Mbit/s bei 50p und 60p, 16 Mbit/s bei 100p und 120p · immer 5 Mbit/s · bis 30p 5, sonst 8 Mbit/s | **steigt mit der Bildrate** (Empfehlung; ersetzt durch F21) |
| F18 | B1: Wie heißt die kleine Fassung in Kriterion (V11)? | Proxy · Lowres · Telefonfassung bleibt | **Proxy** (Empfehlung) |
| F19 | B1: Wie kommt ffmpeg ins Image (F2)? Gemessen in Abschnitt 2.6 | Pakete aus Debian mit dem freien Treiber: 705 MB statt 227 MB, ffmpeg 5.1.9; Updates kommen mit Debian · ffmpeg im ersten Abschnitt des `Dockerfile` selbst übersetzen, nur mit den nötigen Teilen: 264 MB; jede neue Version von ffmpeg trägt jemand im `Dockerfile` nach | **schlank, 9.0.2** (Empfehlung; 7.1.5 ist die auf dem N100 geprüfte Rückfallversion) |
| F20 | B1: Gehen wir den Weg mit Proxys (B1 bauen)? Messung in Abschnitt 2.7, ohne Quick Sync | ja · nein, nur B2 | **ja** (Empfehlung; Messung mit Quick Sync in Abschnitt 2.7) |
| F21 | B1: Welche Regel gilt für die Bitrate des Proxys (V13)? Die Bitrate ändert die Dauer nicht (Abschnitt 2.7) | immer 7,5 Mbit/s · 0,23 Mbit je Bild, höchstens 7,5 Mbit/s · 0,23 Mbit je Bild bis 30p, 0,20 darüber, ohne Grenze | **0,23 Mbit je Bild, höchstens 7,5 Mbit/s** |
| F22 | B1: Proxy im Papierkorb, im Backup und im Export (V12, statt F12)? | Papierkorb ja, Backup und Export nein · überall wie das Original · nirgends (F12) | **Papierkorb ja, Backup und Export nein** (Empfehlung) |
| F23 | B1: Darf der Proxy während der Umwandlung unverschlüsselt liegen („gleich verschlüsselt“, V12)? | nur im RAM (tmpfs) · kurz auf der Platte in `/tmp` | **nur im RAM** (Empfehlung) |
| F24 | B1: Wann bekommt ein Video einen Proxy (statt F7)? | wenn eines zutrifft: die kürzere Seite über 1080 Pixel; Video nicht H.264 mit 8 Bit und 4:2:0; Ton nicht AAC, MP3 oder Opus; Video über 12 Mbit/s; `mkv`, `avi`, `wmv`, `flv` · dasselbe ohne HEVC bis 1080p und 12 Mbit/s mit AAC · jedes Video | **wenn eines zutrifft** (Empfehlung). Der Kamera-Proxy (HEVC) bekommt dann auch einen. Dazu: „berechnet wird bei Dateien, die kleiner als 1080 sind, immer auf Originalgröße, es wird also nichts hochskaliert. 1080 ist nativ darzustellen, und alles darüber wird auf 1080p herunterskaliert“ |
| F25 | B2: Bleibt ein ganz geladenes Video im Speicher, bis die Seite neu geladen wird (V18)? | das letzte bleibt, bis ein anderes ganz geladen oder die Seite neu geladen wird · verworfen beim Schließen | **das letzte bleibt** (Empfehlung) |

Anders als empfohlen: F1, F3, F6, F15 und F21. Zu F1: Der Betreiber hat mit den
Zahlen aus dem Messverfahren entschieden; B1 ist freigegeben (F20). Zu F3: Ohne
Quick Sync wandelt die CPU alle Formate über Weg C um. Zu F6: `mkv`, `avi`,
`wmv` und `flv` bekommen immer einen Proxy; sie spielen dann am Telefon und am
Rechner über ihn. Zu F15: Ganz geladen wird nur noch auf Knopfdruck; ohne
Knopf puffert der Browser selbst, wie vor 0.52.0. Zu F21: Die Bitrate ist
0,23 Mbit je Bild, höchstens 7,5 Mbit/s: 24p 5,52, 25p 5,75, 30p 6,9 Mbit/s,
ab 50p 7,5 Mbit/s.

Die Fragen F1 bis F15 stehen im Wortlaut der Tafeln. Seit F18 heißt die
Telefonfassung „Proxy“.

V12 ersetzt F10 und F11: Am Rechner und am Telefon spielt der Proxy, sobald er
fertig ist. Der Umschalter zum Original gilt nur für dieses Abspielen. Fehlt der
Proxy, spielt das Original, ohne Fehlermeldung, und Kriterion legt ihn im
Hintergrund an (V14). F21 ersetzt F17, F22 ersetzt F12, F24 ersetzt F7.

---

## 1. Das Ziel

Am Rechner und am Telefon spielt ein Video unter „Dateien“ einen Proxy, sobald
er fertig ist: eine kleinere Fassung in H.264 und AAC, an der kürzeren Seite
höchstens 1080 Pixel, mit der Bildrate des Originals (V12). ffmpeg erzeugt ihn
im Hintergrund, mit Quick Sync auf dem N100, ohne Quick Sync mit der CPU, und
nie unverschlüsselt auf der Platte (F23). Der Umschalter zeigt
das Original für ein Abspielen; „Herunterladen“ liefert immer das Original.
Fehlt ein Proxy, spielt das Original, ohne Fehlermeldung (V14). Videos, die
kein Browser abspielt (`mkv`, `avi`, `wmv`, `flv`), spielen überall über den
Proxy. B1 ist mit den Zahlen aus der Messung freigegeben (V4, F1, F20).

„Video ganz laden“ läuft nur noch auf Knopfdruck: Das Video hält an, lädt
einmal ganz und spielt dann aus der Kopie weiter; die letzte Kopie bleibt, bis
die Seite neu geladen wird (F25). Ohne Knopf lädt der Browser die Datei nur
einmal, und das Video springt nicht (B2).

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
- Gemessen am 1. Oktober 2026 mit `docker build` aus dem Skript des
  Messverfahrens: `node:22-bookworm-slim` hat 227 MB, mit `ffmpeg` und
  `intel-media-va-driver` 705 MB, mit `intel-media-va-driver-non-free` 734 MB.
  `ffmpeg` zieht auch mit `--no-install-recommends` 202 Pakete nach. Die größten
  sind `libllvm15` (112 MB, über Mesa), `libicu72` (35 MB), `libflite1`
  (27 MB), `libmfx1` (27 MB) und `libgl1-mesa-dri` (25 MB). Debian liefert
  ffmpeg 5.1.9 und den Treiber 23.1.1. Die „rund 100 MB“ aus
  `Doku/Entwicklung.md` waren nicht gemessen (F19). Der freie Treiber reicht
  (Abschnitt 2.7); `non-free` ist nicht nötig.
- Probebau am 1. Oktober 2026, schlankes ffmpeg 7.1.5 aus den Quellen von
  Debian 13: alle Decoder und Container zum Lesen, zum Schreiben libx264,
  `h264_vaapi`, AAC und MP4, dazu VA-API und dav1d; das `Dockerfile` steht im
  Messverfahren, Abschnitt 7. Das Image hat 263 MB, das Programm `ffmpeg`
  17 MB; der Bau dauerte in der Sitzung von Claude (4 Kerne) 2 min 35 s. Weg C
  geprüft mit HEVC 4K50 mit HLG, dem Proxy der A6700 hochkant und einer
  `mkv`-Datei; Quick Sync nicht geprüft.
- Die Wege für ffmpeg (F19):

| Weg | Image | Stand |
|---|---|---|
| Pakete aus Debian | 705 MB | gemessen; Quick Sync läuft auf dem N100 |
| schlankes ffmpeg 7.1.5, im ersten Abschnitt des `Dockerfile` übersetzt, Quelle `ffmpeg.org` mit Prüfsumme | 263 MB, auf dem N100 264 MB | gemessen; Bau 3:19 in der Sitzung von Claude, 4:39 auf dem N100; Quick Sync läuft auf dem N100, Weg A 10 bis 25 % schneller als mit 5.1.9 (Abschnitt 2.7) |
| schlankes ffmpeg 9.0.2, ebenso | 264 MB | gemessen in der Sitzung von Claude: Bau 3:23, Weg C so schnell wie 7.1.5, die Drehung bleibt; Quick Sync nicht gemessen (V19). Signatur des Archivs gültig; das `Changelog` nennt Korrekturen im Leser für MP4 und MOV und in den Decodern für H.264 und HEVC (Messverfahren, Abschnitt 7) |
| `jellyfin-ffmpeg8` 8.1.3 aus der Paketquelle des Jellyfin-Projekts, mit eigenem Intel-Treiber 26.3.5 | rund 525 MB (Probebau 573 MB mit der Paketdatei von 47,5 MB in einer eigenen Schicht) | gemessen am 2. Oktober 2026; Weg C geprüft; mit `-noautorotate` geht die Drehung verloren (Messverfahren, Abschnitt 7) |
| fertige statische Builds, etwa von BtbN | nicht gemessen | fremder Ersteller; in der Sitzung gesperrt |
| eigener Container neben Kriterion | 227 MB und der zweite, etwa 802 MB | zweiter Dienst in der Compose-Datei; gegen F2 |
| ffmpeg auf dem Host | – | verworfen: ein eingebundenes Programm des Hosts braucht dessen Bibliotheken; ein Dienst auf dem Host müsste jeder Nutzer installieren (V16); Zugriff auf `/var/run/docker.sock` gäbe Kriterion volle Rechte über den Host |
| Pakete aus Debian, Abhängigkeiten danach gelöscht | – | verworfen: beschädigt die Paketverwaltung |
| ffmpeg als WebAssembly | – | verworfen: ohne Grafik und langsamer als Weg C |

  Auf dem Host braucht Quick Sync in jedem Weg nur den Kernel-Treiber `i915`
  mit Firmware. Der Intel-Treiber 23.1.1 aus Debian 12 kann den N100; ob er
  neuere Intel-Generationen kann, ist nicht geprüft.
- Ein Rezept für alle Rechner: Das `Dockerfile` baut überall dasselbe ffmpeg;
  welcher Weg läuft, entscheidet Kriterion beim Start mit dem Test aus
  Abschnitt 2 des Messverfahrens. Debian 12 hat `intel-media-va-driver` nur
  für amd64, libx264, libva und dav1d auch für arm64 (geprüft am
  2. Oktober 2026). Auf arm64 lässt das `Dockerfile` den Intel-Treiber weg;
  dort gilt Weg C.

### 2.7 Quick Sync und die Messung

Die Grafik des N100 dekodiert in Hardware H.264 nur mit 8 Bit und 4:2:0, HEVC
auch mit 10 Bit und 4:2:2, dazu VP9 und AV1; sie kodiert H.264 und HEVC. XAVC
HS der A6700 (HEVC) geht damit in Hardware. XAVC S mit 4:2:2 und 10 Bit und
XAVC S-I (H.264) dekodiert die CPU (Weg B im Messverfahren). Im Container
braucht es `/dev/dri`, ffmpeg mit VA-API und den Intel-Mediatreiber. Ohne
`/dev/dri` bleibt Weg C, nur die CPU.

Messung des Betreibers am 1. Oktober 2026 mit dem Skript aus Abschnitt 6 des
Messverfahrens. Host: OpenMediaVault auf Debian 12, Kernel 6.12.95 aus den
Backports.

- Quick Sync kodierte in keinem der drei Images. Der Intel-Mediatreiber meldete
  `iHD_drv_video.so init failed`, ffmpeg `Input/output error`.
- Ursache: `/lib/firmware/i915/` fehlt. Installiert war nur
  `firmware-misc-nonfree` 20250410-2~bpo12+1; seit den Firmware-Paketen von
  2025 liegt die Firmware für `i915` in `firmware-intel-graphics`. Geprüft im
  Inhalt der Pakete; die Tafel je System steht im Messverfahren, Abschnitt 2.
- `DRIVER=i915` und `PCI_ID=8086:46D1`: Die Grafik des N100 hängt am
  Kernel-Treiber, ohne VM dazwischen.
- Alle Zahlen sind deshalb Weg C, mit ffmpeg 5.1.9 aus Debian:

| Datei | Format | Pixel | Bilder/s | Mbit/s | Dauer | Ziel | Zeit | Faktor | CPU | Größe |
|---|---|---|---|---|---|---|---|---|---|---|
| 20260718_C3524.MP4 | h264 yuv420p | 1920×1080 | 29,97 | 25 | 1:25 | 5 Mbit/s | 0:40 | 2,1 | 74 % | 55 MB |
| 20260718_C3619.MP4 | hevc yuv420p10le | 3840×2160 | 59,94 | 64 | 0:59 | 8 Mbit/s | 2:36 | 0,4 | 75 % | 60 MB |
| 20260923_C3762.MP4 | hevc yuv420p10le | 3840×2160 | 59,94 | 58 | 1:05 | 8 Mbit/s | 2:49 | 0,4 | 72 % | 66 MB |
| IMG_2618.MOV | h264 yuv420p | 3840×2160 | 24 | 45 | 2:17 | 5 Mbit/s | 3:45 | 0,6 | 76 % | 89 MB |

- Am Telefon: „die Qualität war ok“ (V13).
- Kein Video ab 10 Minuten, also keine Dauerlast; kein Video in HLG.
- Die Bitrate bestimmt die Dauer nicht. Gemessen am 1. Oktober 2026 in der
  Sitzung von Claude (Xeon mit 4 Kernen), Weg C, 6 s 4K50 HEVC mit 10 Bit, fünf
  Läufe je Bitrate in wechselnder Reihenfolge: Median 6,85 s bei 5 Mbit/s,
  6,47 s bei 7,5, 6,69 s bei 8 und 7,06 s bei 16. Dieselbe Bitrate schwankt um
  bis zu 1 s.
- Die Messung mit Quick Sync folgte nach `firmware-intel-graphics` und einem
  Neustart des Hosts.

Zweite Messung des Betreibers am 1. Oktober 2026, 23:57, mit `MBIT=7.5`. Der
Kernel meldet GuC und HuC geladen, „HuC: authenticated for all workloads“.
Quick Sync kodiert mit beiden Treibern aus Debian, auch mit dem freien
`intel-media-va-driver` 23.1.1; der Treiber aus `non-free` ist nicht nötig.

| Datei | Format | Dauer | Weg A: Zeit | Faktor | CPU | Weg C: Zeit | Faktor | CPU | Größe |
|---|---|---|---|---|---|---|---|---|---|
| 20260718_C3524.MP4 | H.264 1080p 29,97, 25 Mbit/s | 1:25 | 0:16 | 5,3 | 12 % | 0:33 | 2,6 | 84 % | 82 MB |
| 20260718_C3619.MP4 | HEVC 10 Bit 4K 59,94, 64 Mbit/s | 0:59 | 0:29 | 2,0 | 16 % | 1:57 | 0,5 | 83 % | 56 MB |
| 20260923_C3762.MP4 | HEVC 10 Bit 4K 59,94, 58 Mbit/s | 1:05 | 0:35 | 1,9 | 15 % | 2:06 | 0,5 | 81 % | 62 MB |
| IMG_2618.MOV | H.264 4K 24, 45 Mbit/s | 2:17 | 0:31 | 4,4 | 11 % | 2:58 | 0,8 | 88 % | 132 MB |

- Mit Quick Sync braucht eine Stunde 4K60 der A6700 rund 30 Minuten; die CPU
  bleibt bei 11 bis 16 %.
- Die Spalte „Mbit/s“ dieser Messung ist die Bitrate der ganzen Datei; das
  Skript nennt seither die des Videos.
- Hochkant-Videos waren in dieser Fassung des Skripts falsch: Weg A ließ die
  Drehung weg, der Proxy lag quer („Weg A liegt falsch, muss gedreht werden“);
  Weg C drehte das Bild und verkleinerte es auf 608×1080. Seither gilt
  `-noautorotate` (Messverfahren, Abschnitt 4). Die Zeiten gelten.

Dritte Messung des Betreibers am 2. Oktober 2026, 00:16, mit `-noautorotate`
und der Bitrate des Videos:

| Datei | Format | Video Mbit/s | Dauer | Weg A: Zeit | Faktor | CPU | Weg C: Zeit | Faktor | CPU | Größe |
|---|---|---|---|---|---|---|---|---|---|---|
| 20260718_C3524.MP4 | H.264 1080p 29,97, hochkant | 15,4 | 1:25 | 0:16 | 5,3 | 12 % | 0:55 | 1,5 | 84 % | 82 MB |
| 20260718_C3619.MP4 | HEVC 10 Bit 4K 59,94, hochkant | 45,2 | 0:59 | 0:29 | 2,0 | 16 % | 2:13 | 0,4 | 87 % | 56 MB |
| 20260923_C3762.MP4 | HEVC 10 Bit 4K 59,94, hochkant | 45,1 | 1:05 | 0:35 | 1,9 | 15 % | 2:22 | 0,5 | 85 % | 62 MB |
| IMG_2618.MOV | H.264 4K 24 | 45,0 | 2:17 | 0:31 | 4,4 | 11 % | 2:57 | 0,8 | 89 % | 132 MB |

- Drei der vier Videos sind hochkant. Weg A ist gleich schnell geblieben.
- Weg C braucht für `C3524` jetzt 0:55 statt 0:33: Er kodiert 1920×1080
  statt der früheren 608×1080.
- Die 4K-Videos der A6700 haben 45 Mbit/s im Video; die Datei hat 58 bis
  64 Mbit/s mit Ton in LPCM und der Spur `rtmd`.
- Alle Proxys der Hochkant-Videos stehen aufrecht, aus Weg A und aus Weg C
  (Betreiber, 2. Oktober 2026). `-noautorotate` ist damit auch mit Quick Sync
  bestätigt.

Vierte Messung des Betreibers am 2. Oktober 2026, 10:48, mit
`FFMPEG=schlank MBIT=7.5`: das schlanke ffmpeg 7.1.5 aus Abschnitt 7 des
Messverfahrens. Der Bau dauerte auf dem N100 4:39, das Image hat 264 MB.
Quick Sync kodiert damit, mit dem freien Treiber 23.1.1 aus Debian.

| Datei | Weg A: Zeit | Faktor | CPU | zum Vergleich mit 5.1.9 | Weg C: Zeit | Faktor | CPU | Größe |
|---|---|---|---|---|---|---|---|---|
| 20260718_C3524.MP4 | 0:13 | 6,6 | 20 % | 0:16, 5,3, 12 % | 0:59 | 1,5 | 84 % | 82 MB |
| 20260718_C3619.MP4 | 0:26 | 2,2 | 20 % | 0:29, 2,0, 16 % | 2:12 | 0,4 | 90 % | 56 MB |
| 20260923_C3762.MP4 | 0:29 | 2,2 | 20 % | 0:35, 1,9, 15 % | 2:16 | 0,5 | 85 % | 62 MB |
| IMG_2618.MOV | 0:28 | 4,9 | 17 % | 0:31, 4,4, 11 % | 2:56 | 0,8 | 89 % | 132 MB |

- Weg A ist mit 7.1.5 um 10 bis 25 % schneller und braucht etwas mehr CPU.
  Weg C und die Größen bleiben gleich.
- Ob die Proxys der Hochkant-Videos aus Weg A mit 7.1.5 aufrecht stehen, prüft
  der Betreiber; Weg C mit 7.1.5 ist in der Sitzung von Claude geprüft.

### 2.8 Größen

| Fassung | Bitrate | je Stunde |
|---|---|---|
| Original, XAVC HS mit 100 Mbit/s | 100 Mbit/s | 45 GB |
| Proxy 1080p, 24 Bilder je Sekunde (F21) | 5,52 Mbit/s und 128 kbit/s | 2,5 GB |
| Proxy 1080p, 25 Bilder je Sekunde | 5,75 Mbit/s und 128 kbit/s | 2,6 GB |
| Proxy 1080p, 30 Bilder je Sekunde | 6,9 Mbit/s und 128 kbit/s | 3,2 GB |
| Proxy 1080p, ab 50 Bildern je Sekunde | 7,5 Mbit/s und 128 kbit/s | 3,4 GB |

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

V1 bis V19 und F1 bis F25 aus Abschnitt 0.

### Entschieden in diesem Auftrag

#### Allgemein

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.55.0**, MINOR. Schema: **ja**, eine neue Tabelle `proxy_files` und ein Trigger, kein Migrationsblock. Austauschformat: bleibt 22 |
| Routen | keine neue. `GET /api/attachments/:id/raw?size=proxy` liefert den Proxy. Der Schalter geht über `PUT /api/settings`, der Zustand kommt mit `GET /api/settings` |
| Abhängigkeiten | in `package.json` keine neue. Im Image ffmpeg 9.0.2, im ersten Abschnitt des `Dockerfile` übersetzt (F19), dazu `libx264-164`, `libva2`, `libva-drm2`, `libdrm2`, `libdav1d6` und auf amd64 `intel-media-va-driver` aus Debian |
| Module | neues Modul `videoproxy.js`: Aufruf von ffmpeg, Wahl des Wegs, Test von Quick Sync. Nicht `proxy.js`: „Proxy“ meint im Code schon den Reverse Proxy (`BEHIND_PROXY`, `auth.js`:36). Die ausgelieferten JavaScript-Module werden 19 |
| Sicherheitsprotokoll | kein neuer Vorgang |
| Sprachen | jeder neue Text in `de.json`, `en.json` und `tr.json`; README und Anleitung in allen drei Fassungen, das CHANGELOG englisch (`CLAUDE.md`) |

#### B1 — Der Proxy

| Frage | Antwort |
|---|---|
| Machbarkeit | freigegeben am 2. Oktober 2026 mit den Zahlen aus Abschnitt 2.7 (F1, F20) |
| Ort | nach F2 |
| Benutzer | ffmpeg läuft unter der Nummer 65534 (`nobody`), mit der Gruppe von `/dev/dri/renderD128` und ohne die Umgebung von Kriterion. Das geht nur, weil Kriterion im Container als root läuft (Abschnitt 2.5) |
| Eingabe | ffmpeg liest das Original über `http://127.0.0.1:<Port>/<Marke>`; Port und Marke gelten nur für einen Lauf. Kriterion entschlüsselt dabei Stück für Stück wie `sendDiskFile()`. Das Original liegt nie unverschlüsselt auf der Platte |
| Ausgabe | nach F23 nur im RAM: in ein Verzeichnis unter `/tmp`, das nur der Nummer 65534 gehört; `/tmp` ist ein `tmpfs` mit 2 GB (`docker-compose.example.yml`). Danach verschlüsselt Kriterion die Datei wie beim Hochladen nach `data/files/proxy/` und löscht die Kopie. Ist `/tmp` kein `tmpfs`, wandelt Kriterion nicht um; die Karte nennt den Grund. Passt der Proxy nach Dauer und Bitrate nicht in den freien RAM von `/tmp`, bekommt das Video keinen Proxy und spielt das Original. Lagert der Host Arbeitsspeicher aus, kann ein Teil auf die Platte gelangen; die README nennt dafür die Option `noswap` (Kernel ab 6.4) |
| Wege | aus `attachment_media`: H.264 mit 8 Bit und 4:2:0, HEVC, VP9 und AV1 über Weg A; H.264 mit 4:2:2 oder 10 Bit über Weg B (F4); ohne Quick Sync alles über Weg C (F3). Die Befehle wie im Messverfahren, Abschnitt 4 |
| Auswahl | nach F5, F14 und F24: ein Proxy, wenn eines zutrifft: die kürzere Seite über 1080 Pixel; Video nicht H.264 mit 8 Bit und 4:2:0; Ton nicht AAC, MP3 oder Opus (also LPCM der Sony-Kameras); Video über 12 Mbit/s (Bitrate des Videos, nicht der Datei); `mkv`, `avi`, `wmv`, `flv` (F6). Die Angaben kommen aus `attachment_media` |
| Analyse | `mediaKind()` (`attachments.js`:361) nimmt `mkv`, `avi`, `wmv` und `flv` dazu: Die Warteschlange analysiert sie, „Erweiterte Infos“ zeigt sie (heute 404, `server.js`:4414) |
| Die vier Endungen | Bis ihr Proxy fertig ist, bleiben sie wie heute ohne Vorschau. Danach gelten sie als Video: Das Standbild entsteht aus dem Proxy, sie spielen über ihn am Telefon und am Rechner; „Herunterladen“ liefert das Original |
| Ziel | nach F8, F16, F21, F24 und V10: die kürzere Seite höchstens 1080 Pixel; das Seitenverhältnis bleibt; ein kleineres Video behält seine Größe, vergrößert wird nie. Ein Hochkant-Video bleibt so gespeichert wie das Original, die Drehung bleibt als Metadatum (`-noautorotate`); ohne die Option wurde ein Hochkant-Video in 1080p zu 608×1080 (Messverfahren, Abschnitt 4). Die Bildrate bleibt wie im Original. H.264 mit 0,23 Mbit je Bild, höchstens 7,5 Mbit/s (F21), `-maxrate` gleich der Bitrate, `-bufsize` doppelt so groß, ein Keyframe alle 2 Sekunden; AAC mit 128 kbit/s |
| Reihenfolge | eine Umwandlung zugleich, mit Priorität 19 (`os.setPriority()`); neue Videos vor dem Bestand (F9). Erst nach der Analyse mit MediaInfo: ohne Zeile in `attachment_media` keine Umwandlung. Weg C belegt die CPU für die ganze Umwandlung; die Priorität hält Kriterion bedienbar |
| Abbruch | ffmpeg wird beendet, wenn der Lauf länger dauert als die Dauer des Videos mal 4 plus 10 Minuten, wenn der freie Platz nicht reicht (`spaceShort()`) und beim Beenden von Kriterion |
| Fehler | Zustand „fehlgeschlagen“ mit dem Grund in der Tabelle. Der nächste Start von Kriterion versucht es einmal neu. Fehlt ein Proxy, ist seine Datei weg oder lässt sie sich nicht entschlüsseln, spielt das Original ohne Fehlermeldung, und Kriterion stellt das Video wieder in die Warteschlange (V14) |
| Tabelle | `proxy_files (disk_file_id INTEGER PRIMARY KEY REFERENCES disk_files(id) ON DELETE CASCADE, name TEXT UNIQUE, size INTEGER, file_key BLOB, width INTEGER, height INTEGER, state TEXT NOT NULL, reason TEXT, made_at TEXT)`. Sie hängt an `disk_files`, nicht an `attachments`: Im Papierkorb verschwindet die Zeile in `attachments`, `disk_files` behält die Datei über `trash_id` (`fileIntoTrash()`, `server.js`:6859); beim Wiederherstellen bekommt sie die neue Nummer des Anhangs (`fileFromTrash()`, `server.js`:6916). So geht der Proxy ohne eigenen Code mit (F22). Die vorige Fassung (`previous_of`) behält ihren Proxy ebenso. Geprüft am 2. Oktober 2026 mit `better-sqlite3-multiple-ciphers`: Löscht `disk_files_orphaned` (`db.js`:188) die Zeile in `disk_files`, löscht die Kaskade die Zeile in `proxy_files` und löst deren Trigger aus, auch mit `recursive_triggers` aus; im Papierkorb bleibt die Zeile |
| Verzeichnis | `data/files/proxy/` mit den Rechten 0700. Ein Trigger `AFTER DELETE` auf `proxy_files` schreibt den Namen nach `disk_files_gone`; `sweepDisk()` löscht die Datei. `DISK_NAME` und `diskPath()` (`server.js`:3842 und 3846) kennen heute nur Namen aus 32 Hexzeichen direkt in `data/files/`; sie bekommen `proxy/` dazu. Dateien in `data/files/proxy/` ohne Zeile löscht der stündliche Lauf; `unknownFiles()` liest nur `data/files/` selbst und nennt sie nicht |
| Auslieferung | `?size=proxy` an `GET /api/attachments/:id/raw`, mit Bereichen wie `sendDiskFile()`. Ohne fertigen Proxy 404 |
| Abspielen | nach V12, statt F10 und F11: `playSource()` nimmt am Rechner und am Telefon den Proxy, wenn er fertig ist. Der Umschalter im Vollbild wechselt zum Original, nur für dieses Abspielen; beim nächsten Öffnen spielt wieder der Proxy. Die Stelle, an der das Video stand, gilt für beide Fassungen |
| Anzeige | „Erweiterte Infos“ bekommt eine Gruppe „Proxy“: Zustand, Pixel, Größe |
| Karte | Einstellungen › Installation, Karte „Proxy“: Schalter (F13), ob Quick Sync kodiert (Test aus Abschnitt 2 des Messverfahrens) oder die CPU umwandelt (F3); ob `/tmp` ein `tmpfs` ist und wie viel RAM es hat (F23); kodiert Quick Sync nicht, nennt sie den Grund in einem Satz, etwa die fehlende Firmware für `i915` (V15); Zahl der fertigen, wartenden und fehlgeschlagenen Proxys, Platz auf der Platte |
| Backup, Export, Papierkorb | nach F22: Im Papierkorb bleibt der Proxy beim Original und ist nach dem Wiederherstellen sofort da (Tabelle). Backup und Export nehmen ihn nicht mit; nach dem Zurückspielen fehlen seine Dateien, Kriterion legt sie im Hintergrund neu an (V14) |
| Platz | `spaceShort()` gilt vor jedem Lauf |
| Image | `Dockerfile` nach F19: Der erste Abschnitt übersetzt ffmpeg 9.0.2 aus `https://ffmpeg.org/releases/ffmpeg-9.0.2.tar.xz` mit `ADD --checksum=sha256:8c385028…` und den Einstellungen aus `bau_schlank()` in `Doku/messung.sh`; der zweite kopiert nur `ffmpeg` und installiert die Bibliotheken aus „Abhängigkeiten“. Der freie Treiber reicht (Abschnitt 2.7). `docker-compose.example.yml`: `devices: - /dev/dri:/dev/dri`, auskommentiert; `tmpfs: - /tmp:size=2g` (F23) |
| Prüfstand | Statt ffmpeg läuft ein Skript des Prüfstands, das eine kleine MP4 schreibt; der Schalter dafür kommt über `keys.testbenchSwitch()`. Eine echte Umwandlung prüft nur die Abnahme |

#### B2 — „Video ganz laden“ auf Knopfdruck (V7 bis V9, F15)

| Frage | Antwort |
|---|---|
| Knopf | „Ganz laden“ in der Leiste des Vollbilds, bei Videos bis zur Grenze aus `WHOLE_BYTES`: 2.048 MB am Rechner, 500 MB am Telefon. Spielt das Telefon den Proxy (B1), zählt seine Größe. Der Knopf steht auch bei Datensparen; ihn zu drücken ist eine bewusste Wahl |
| Ablauf | Ein Druck hält das Video an und lädt die Datei einmal ganz, mit „geladen 45 %“. Während des Ladens lädt der Player nichts nach. Danach spielt das Video aus der Kopie an derselben Stelle weiter, wenn es vorher lief; sonst bleibt es stehen |
| Abbrechen | ein zweiter Druck, ein anderes Video oder das Schließen des Vollbilds, solange es lädt. Das Video spielt danach wieder aus dem Netz |
| Danach | nach F25: Die fertige Kopie bleibt, bis ein anderes Video ganz geladen oder die Seite neu geladen wird. Wird dasselbe Video wieder geöffnet, spielt es aus der Kopie, ohne zu laden. Es gibt immer höchstens eine Kopie |
| Ohne Knopf | kein zweiter Abruf und kein Wechsel der Quelle; der Browser puffert selbst, `preload="metadata"` bleibt (V5) |
| Texte | `entry.videoLoaded` bleibt; neu sind Name und Titel des Knopfs |
| Prüfstand | Die Gruppe „Video ganz laden“ in `test/release_052.js` prüft künftig: beim Abspielen kein Abruf außer denen des Players; der Knopf lädt einmal, das Video steht dabei, danach spielt es aus der Kopie weiter; Abbrechen; nach dem Schließen spielt dasselbe Video aus der Kopie, ein zweites ganz geladenes ersetzt sie (F25). Die Rückbauten 1568 bis 1578 bekommen neue Ziele |
| Anleitung | Der Absatz „Video ganz laden“ beschreibt den Knopf, in allen drei Fassungen |
| Messung | B2 hängt nicht an der Messung aus BA 1 |

---

## 4. Die Bauabschnitte

### BA 1 — Die Messung

Erledigt am 1. und 2. Oktober 2026: vier Messungen des Betreibers mit dem
Skript `Doku/messung.sh`, die Zahlen in Abschnitt 2.7. Freigegeben mit F20.

### BA 2 — Image und Compose

ffmpeg 9.0.2 im ersten Abschnitt des `Dockerfile` nach F19, die Bibliotheken
und der Intel-Treiber im zweiten; auf arm64 ohne den Treiber. `/dev/dri`
(auskommentiert) und `tmpfs` für `/tmp` in `docker-compose.example.yml`.
Gemessen: die Größe des Images davor und danach, die Dauer des Baus; der Test
aus Abschnitt 2 des Messverfahrens im Container von Kriterion.

### BA 3 — Tabelle und Verzeichnis

`proxy_files` in `schema.js`, der Trigger in `db.js`,
`data/files/proxy/`, Löschen im stündlichen Lauf, `unknownFiles()`.

### BA 4 — Die Umwandlung

`videoproxy.js`: Wahl zwischen Weg A, B und C, Aufruf unter der Nummer 65534,
Eingabe über 127.0.0.1, Ausgabe in den `tmpfs` unter `/tmp` (F23), Bitrate nach
F21, Verschlüsseln, Abbruch, Test von Quick Sync.

### BA 5 — Die Warteschlange

Auswahl nach F5, F14 und F24, `mediaKind()` mit den vier Endungen (F6),
Reihenfolge nach F9, Fehler und fehlende Proxys (V14), Platz im `tmpfs` und
auf der Platte, Neustart.

### BA 6 — Auslieferung und Abspielen

`?size=proxy`, `playSource()` am Rechner und am Telefon, der Umschalter für ein
Abspielen (V12), das Standbild aus dem Proxy, wenn der Browser das Original
nicht spielt, die vier Endungen als Video (F6).

### BA 7 — Karte und Erweiterte Infos

Karte „Proxy“ mit Schalter und Zustand, die Gruppe in „Erweiterte
Infos“.

### BA 8 — Löschen, Papierkorb, Backup, Export

Nach F22: Der Proxy geht über `disk_files` mit in den Papierkorb und zurück;
Backup, Zurückspielen mit `backuptool.js`, Export und Import ohne Proxy.

### BA 9 — „Video ganz laden“ auf Knopfdruck (B2)

Der Knopf im Vollbild, `loadWhole()` nur über ihn, das Video steht während des
Ladens, Abbrechen, die letzte Kopie bleibt bis zum Neuladen der Seite (F25),
Texte. Hängt nicht an BA 1.

### BA 10 — Texte

`de.json`, `en.json`, `tr.json`.

### BA 11 — Anleitung und README

Anleitung und README in drei Sprachen: der Proxy, der Umschalter, die
Karte; der Absatz „Video ganz laden“ beschreibt den Knopf. README (V15):
`/dev/dri` und die Gruppe im Container; das Firmware-Paket für `i915` je System
aus der Tafel im Messverfahren, Abschnitt 2; die drei Befehle zum Prüfen; was
Kriterion ohne Quick Sync tut; der `tmpfs` für `/tmp`, seine Größe und die
Option `noswap` (F23).

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
Tabelle `proxy_files`), `CLAUDE.md` (19 Module), `package.json` 0.55.0,
Fingerprint. Zahlen am fertigen Stand.

---

## 5. Abnahme im Betrieb

1. Mit `/dev/dri` im Container nennt die Karte „Proxy“: Quick Sync
   kodiert.
2. Nach dem Einschalten wandelt Kriterion den Bestand um; die Karte zählt mit.
3. Ein Video der A6700 hochladen. „Erweiterte Infos“ nennt danach unter
   „Proxy“ Zustand, Pixel und Größe.
4. Am iPhone und an einem Telefon mit Android im Vollbild: Es spielt der
   Proxy, Springen geht, der Umschalter wechselt zum Original; beim nächsten
   Öffnen spielt wieder der Proxy (V12).
5. Am Rechner spielt der Proxy, auch bei HEVC in Chrome (V12).
6. Ein Video in HLG am Telefon: nach F14.
7. „Herunterladen“ liefert das Original in seiner Größe.
8. Das Video löschen: Der Proxy ist nach dem stündlichen Lauf aus
   `data/files/proxy/` verschwunden, wenn der Papierkorb geleert ist. Vorher
   wiederherstellen: Der Proxy ist sofort da (F22).
9. Ohne `/dev/dri` nennt die Karte die CPU; die Umwandlung läuft über Weg C
   (F3).
10. Während einer Umwandlung bleibt Kriterion bedienbar, mit und ohne Quick
    Sync.
11. Eine Datei `.mkv` hochladen: Nach der Umwandlung hat sie ein Vorschaubild
    und spielt am Rechner und am Telefon (F6).
12. Ein Backup und ein Export enthalten keinen Proxy. Nach dem Zurückspielen
    spielt das Original, und Kriterion legt den Proxy neu an (F22, V14).
13. Ein Video am Rechner und am Telefon bis zum Ende abspielen: kein Zucken,
    kein Sprung. Die Netzwerkanalyse des Browsers zeigt nur die Abrufe des
    Players (B2).
14. „Ganz laden“ drücken: Das Video hält an, „geladen … %“ zählt hoch, danach
    spielt es an derselben Stelle weiter. Springen braucht kein Laden mehr. Ein
    zweiter Druck während des Ladens bricht ab. Schließen und dasselbe Video
    wieder öffnen: Es spielt ohne Laden (B2, F25).
15. Ein Video der A6700 in 4K mit 50p: Der Proxy hat 1920×1080, 50 Bilder je
    Sekunde und 7,5 Mbit/s; ein Video mit 25p 5,75 Mbit/s (V10, F16, F21). Ein
    Video unter 1080p behält seine Größe (F24). Ein Hochkant-Video in 1080p:
    Der Proxy ist hochkant und hat 1080 Pixel an der kürzeren Seite.
16. Ein Video ohne Proxy öffnen, etwa direkt nach dem Hochladen: Es spielt das
    Original, ohne Fehlermeldung; der Proxy entsteht im Hintergrund (V14).
17. Ohne Firmware für `i915` nennt die Karte den Grund (V15).
18. Mit ffmpeg 9.0.2 kodiert Quick Sync auf dem N100, und die Proxys der
    Hochkant-Videos aus Weg A stehen aufrecht (V19). Sonst gilt 7.1.5.
19. Ohne `tmpfs` für `/tmp` wandelt Kriterion nicht um, und die Karte nennt den
    Grund. Während einer Umwandlung liegt in `data/` und im Image keine
    unverschlüsselte Fassung (F23).
20. Ein Video mit H.264, 1080p, AAC und unter 12 Mbit/s bekommt keinen Proxy;
    eine Sony-Datei mit LPCM bekommt einen (F24).

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Punkte 20, 52 und 54, die Angaben aus gepackten PDF-Objektströmen | V1 |
| Länger cachen, `preload="auto"` | V5 |
| Mehrere Stufen, HLS oder DASH | ein Proxy reicht für das Ziel |
| HEVC als Ziel | H.264 spielt auf jedem Telefon |
| Standbild vom Server | das Standbild macht weiter der Browser |
| Umwandeln zu festen Zeiten | eine Umwandlung zugleich mit Priorität 19 |
| Videos des Eintrags und in Kommentaren | nach F5 |
| „Video ganz laden“ von selbst oder erst beim Stocken | F15 |
| Bildrate senken | V10 |
| Kleine Videos vergrößern | F24 |
| Proxy im Backup und im Export | F22 |
| Proxy unverschlüsselt auf der Platte | F23 |
| Pakete aus Debian für ffmpeg | F19 |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. B1 ist freigegeben (F20); gebaut wird, wenn der Betreiber den Bau startet.
3. Neues Schema nur mit neuen Tabellen, ohne Migrationsblock.
4. Die Kommentarregel gilt.
5. Kein Pull Request, wenn keiner verlangt wurde.
6. Kommt beim Bau eine Frage auf, die hier nicht beantwortet ist, gilt der
   einfachere Weg, der kein Verhalten ändert; die Frage und der gewählte Weg
   stehen im Änderungsprotokoll.
