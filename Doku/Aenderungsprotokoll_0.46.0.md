# Änderungsprotokoll 0.46.0 — „Videos unter „Dateien““

**Gebaut am 28. September 2026 auf 0.45.0. Fingerprint `643e8f9e`, davor
`6935aee7`.**

Nach `Doku/Auftrag_0.46.0.md` und dem Eintrag 0.46.0 im Fahrplan; Grundlage
ist `Doku/Konzept_Dateien_und_Ordner.md`, Version 1b. Schema: ja, die neue
Tabelle `attachment_stills`. Austauschformat: 20. Eine neue Route,
`PUT /api/attachments/:id/still`; `GET /api/attachments/:id/raw` liefert mit
Range und kennt `?size=still`.

---

## 1. Vorgaben des Betreibers

Die Fragetafel ist vor der ersten Zeile Code beantwortet worden.

| Datum | Vorgabe |
|---|---|
| 28. September 2026 | B1: Hat im großen Bild oben im Eintrag ein Video den Fokus, spulen ← und → wie im Vollbild |
| 28. September 2026 | Beim Bauen gefragt: Ein Tastendruck springt fest 5 s, in jedem Browser gleich. Chromium selbst springt 1 % der Länge (gemessen, siehe Abschnitt 6) |
| 28. September 2026 | H.264 und HEVC (MOV) werden angenommen. Spielt der Browser nicht ab: Download. Standbild bei 10 % der Länge, dazu „Dieses Bild als Vorschaubild“ im Player |
| 28. September 2026 | Die Bildleiste bleibt, wie sie ist |
| 28. September 2026 | F6: Die Regeln des Vollbilds gelten für alle Videos, auch die Kurzvideos der Bildleiste |
| 28. September 2026 | F7: Die Adresse einer Videodatei öffnet das Vollbild im Eintrag, auch über die Marke in Kommentar und Beschreibung |
| 28. September 2026 | F9: Vorschaubild und Dauer eines Videos in Papierkorb, Export und Import; Export und Import mit Format 21 in 0.47.0 |

Die Frage nach dem Spulschritt kam beim Bauen auf und ist als Fragetafel
gestellt worden. Was ohne Vorgabe zu entscheiden war, steht in Abschnitt 4.

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.45.0.

| | 0.45.0 | 0.46.0 |
|---|---:|---:|
| Tabellen | 33 | **34** |
| Schreibende Routen | 79 | **80** |
| davon hinter dem CSRF-Schutz | 71 | **72** |
| Routen mit Rufer in `public/app.js` | 114 | **115** |
| Schlüssel je Sprachdatei | 1.231 | **1.234** |
| Regelzeilen des Stilblatts | 1.789 | **1.795** |
| Kommentarzeilen | 6.607 in 42 Dateien | **6.653 in 43** |
| Dateien des Prüfstands samt `counterproof.js` | 26 | **27** |
| Rückbauten | 1.231 | **1.245** |
| Prüfungen im Prüfstand | 7.604 | **7.642** |

---

## 3. Was gebaut ist

**Vorschauart** (`attachments.js`). `previewKind()` liefert `video` für die
Endungen aus `VIDEO_TYPES`: `mp4`, `m4v`, `webm`, `mov`. `.avi` und `.mkv`
bleiben ohne Vorschau. Die Art gilt in `detail()`, in `/api/comment-refs` und
in der eigenen Ansicht.

**Auslieferung** (`server.js`). `GET /api/attachments/:id/raw` schickt jede
Datei über `sendRanged()`: 206 mit `Content-Range`, ein ungültiger Range 416.
`?size=still` liefert das Standbild als WebP, eine Woche im Cache; ohne
Standbild 404. `?size=thumb` liefert bei einem Video die Kachel aus dem
Standbild; sie entsteht beim ersten Abruf und wird nur abgelegt, wenn das
Standbild während des Rechnens nicht gewechselt hat.

**Tabelle `attachment_stills`** (`db.js`).

| Spalte | Inhalt |
|---|---|
| `attachment_id` | Primärschlüssel, `attachments(id)` mit `ON DELETE CASCADE` |
| `duration` | Sekunden, `NULL` unbekannt |
| `still` | Standbild, 1600 px an der langen Seite, WebP |

Sie entsteht beim Start mit `db.exec(SCHEMA)`; eine vorhandene Datenbank
bekommt sie ohne Migration.

**Route `PUT /api/attachments/:id/still`.** Multipart mit `still` und
`duration`, über `cappedLive` mit der Grenze „Foto“. Vor multer: 404 ohne
Datei, 403 für jeden außer dem, der hochgeladen hat (auch den Admin), 400 für
eine Datei ohne Vorschauart `video`. Danach prüft `sharp` das Bild (400 mit
`server.stillNotImage`) und rechnet es auf 1600 px um. Fehlt `duration`, bleibt
die gespeicherte. Die Kachel in `attachment_thumbs` wird in derselben
Transaktion gelöscht. `updated_at` des Eintrags bleibt.

**`detail()`** liefert je Datei `duration` und `still` (Länge des Standbilds
oder `null`) über `LEFT JOIN`, ohne die Bytes zu lesen; `/api/comment-refs`
liefert `still` ebenso.

**Papierkorb.** Der Umschlag trägt je Video mit Standbild `duration` und
`still_ref`; die Bytes kopiert SQLite mit
`SELECT ?, ?, still FROM attachment_stills WHERE attachment_id = ?` nach
`trash_bytes`. Wiederherstellen und Import legen die Zeile wieder an, wenn
`still_base64` oder `still_ref` dasteht und `sharp` das Bild liest. Der Export
trägt kein Standbild.

**Kachel** (`public/app.js`, `fillFileTile()`). Ein Video mit Standbild zeigt
die Kachel mit `v=<Länge des Standbilds>`, oben links ▶, unten rechts die
Dauer. Ohne Standbild Endung und ▶. Die Zustandsecke eines Uploads steht an
der Stelle der Dauer. Ein Klick öffnet das Vollbild; ⋯ eines eigenen Videos
bietet „Dieses Bild als Vorschaubild“ an und öffnet damit ebenfalls das
Vollbild.

**Vollbild** (`openLightbox()`).

| | |
|---|---|
| Abspieler | `<video controls playsinline preload="metadata" tabindex="0">`; bei einer Datei `/raw?inline=1`, Poster ist das Standbild, ohne Standbild keines |
| Streifen | ein Video ohne Standbild zeigt die Endung und ▶ |
| Leiste | Link kopieren, Herunterladen, bei einem eigenen Video „Dieses Bild als Vorschaubild“, mit Recht Löschen |
| Tasten | hat der Abspieler den Fokus, springen ← und → 5 s zurück oder vor (`seekVideo()`, `SEEK_STEP`), begrenzt auf Anfang und Ende; es wird nicht geblättert |
| spielt nicht | bei `error` oder `videoWidth` 0 nach `loadedmetadata`: `entry.videoUnplayable`, bei einer Datei dazu „Herunterladen“ |

„Dieses Bild als Vorschaubild“ nimmt das gezeigte Bild über `frameImage()`;
ist noch kein Bild geladen, springt es an dieselbe Stelle. Poster und Streifen
wechseln, das Video bleibt an seiner Stelle.

**Das große Bild im Eintrag** (B1). `keyNav` gibt ← und → an ein Video mit
Fokus ab; es springt ebenso 5 s. Das Kurzvideo trägt `tabindex="0"`.

**Standbild im Browser.** `stillFrame(from, share)` nimmt ein `File` oder eine
Adresse und ohne `share` Sekunde 1 (Bildleiste, Kommentare), sonst den Anteil
der Länge.

| Weg | Ablauf |
|---|---|
| Hochladen | Sobald der Upload eines Videos beginnt, entsteht das Standbild bei 10 % aus der Datei; die Kachel zeigt es gleich. Nach dem Upload geht es mit der Dauer an die neue Route. Bis die Antwort da ist, zeigt die Kachel der Datei das Standbild aus dem Browser (`STILLS_ON_WAY`) |
| Nachholen | Sieht der Verfasser ein Video ohne Standbild, erzeugt sein Browser es aus `/raw?inline=1` bei 10 %, einmal je Sitzung und Datei (`STILLS_TRIED`), eine Datei nach der anderen |
| Von Hand | der Knopf im Vollbild |

Die neue Datei nach einem Upload ist die jüngste eigene mit Name und Größe
des Uploads. Gelingt das Standbild aus der Datei nicht, versucht es das
Nachholen in dieser Sitzung nicht noch einmal.

**Adresse und Marke.** `renderFileView()` gibt ein Video an `renderDetail()`
weiter, das das Vollbild öffnet; die Adresse wird `#/item/<Eintrag>`. Die
Marke eines Videos zeigt die Kachel mit ▶, ohne Standbild das Zeichen ▶ und
den Namen; im geöffneten Eintrag öffnet sie das Vollbild ohne Hash-Wechsel.

**Bildleiste.** Ein zu langes Video wird abgelehnt wie bisher. Passt es unter
die Grenze „Anhang“, steht hinter dem Satz „Längere Videos gehören unter
„Dateien“.“

**Texte.** Neu je Sprache: `entry.setStill`, `entry.stillSet`,
`entry.videoToFiles`. Weiter genutzt: `entry.videoUnplayable`,
`entry.download`, `server.videosOnly`, `server.stillNotImage`,
`server.stillNoPreview`, `server.noFile`, `server.importOne`.

**Stilblatt.** Die Dauer auf der Kachel (`.apic .duration`), die Endung im
Streifen (`.lb-ext`) und der Satz auf der Bühne (`.lb-unplayable`).

**`manual-de.md`.** „Fotos und Videos“ nennt den Hinweis der Bildleiste und
die Tasten bei Fokus auf einem Video. „Tags, Dateien, Links“ beschreibt
Videos, Vorschaubild und „Dieses Bild als Vorschaubild“. „Löschen und
Papierkorb“ nennt Vorschaubild und Dauer.

---

## 4. Entscheidungen beim Bauen

| Frage | Entscheidung | Grund |
|---|---|---|
| Fokus durch Klick | `tabindex="0"` am Abspieler im Vollbild und am Kurzvideo | Ein Element mit `tabindex` bekommt den Fokus beim Klick; Safari setzt ihn auf Bedienelementen sonst nicht. Geprüft wird das in der Abnahme |
| Wer ist „ein Video mit Fokus“? | `document.activeElement instanceof HTMLVideoElement` | Ein neuer String `'VIDEO'` hätte die Restprobe in `test/ui_language.js` erweitert |
| Die Tasten an einem Schieber der Steuerung | springen ebenso 5 s | Die Steuerung liegt im Shadow DOM des Browsers; `document.activeElement` ist dort das Video selbst |
| Adresse des Videos im Abspieler | `/raw?inline=1` | Ohne `inline=1` liefert der Server `Content-Disposition: attachment` |
| Meldungen der neuen Route | vorhandene Schlüssel | Der Auftrag nennt nur drei neue Schlüssel |
| `updated_at` beim Standbild | bleibt | Das Nachholen läuft beim Ansehen und soll die Übersicht nicht umsortieren |
| Standbild beim Import | wird mit `sharp` geprüft, nicht umgerechnet | wie beim Standbild eines Kommentarvideos |
| ▶ an `.avi` und `.mkv` | bleibt nach dem Typ, den der Browser gemeldet hat | wie in 0.45.0; ein Klick öffnet dort weiter das Menü |
| Abfrage der Datei in der neuen Route | über `lateStatement` | Fehlt `attachments.user_id`, startet die Instanz sonst nicht |
| `HEVC` im Kommentar | als Abkürzung in `tools/comments.js` | Die Betonungsprobe hielt es für Großschreibung |
| Kommentargrenzen | mit `node tools/comments.js --write`: `public/app.js` 1.052 → 1.079, `server.js` 883 → 894, `public/style.css` 517 → 518, `test/source.js` 212 → 213, neu `test/release_046.js` | Standbild beim Upload und Nachholen, Range, die neue Route, `v=` an Kachel und Poster |

---

## 5. Der Prüfstand

`test/release_046.js`, 38 Prüfungen in fünf Gruppen. Die ersten beiden
starten eine eigene Instanz auf der Portbasis 7340, wie `release_041` bis
`release_045`. Die übrigen laufen im Mock aus `test/dom.js`; `stillFrame()`,
`frameImage()`, `URL.createObjectURL` und `XMLHttpRequest` sind dort gestellt.

| Gruppe | Prüfungen |
|---|---:|
| Videos unter Dateien: Vorschauart, Range und Standbild am Server | 12 |
| Videos unter Dateien: Papierkorb und Export | 3 |
| Videos unter Dateien: Kachel, Vollbild und Tasten | 13 |
| Videos unter Dateien: Standbild beim Hochladen, von Hand und nachgeholt | 6 |
| Videos unter Dateien: Adresse, Marke und Bildleiste | 4 |

Angepasst:

- `test/release_045.js`: „Ein Video unter „Dateien“ oeffnet das Vollbild“.
- `test/frame.js`: `PUT /api/attachments/:id/still` in `F_ROUTES`.
- `test/source.js`: 80 schreibende Routen, 115 Routen mit Rufer,
  `attachment_stills` in `DATATABLES`, sieben Kopieranweisungen des
  Papierkorbs (die neue mit `WHERE attachment_id = ?`), acht Stellen mit
  `cappedLive`, 43 Dateien in der Stolpersteinprobe, 27 Dateien des
  Prüfstands, 1.795 Regelzeilen.
- `test/roundtrip.js`: 72 von 80 Routen hinter dem CSRF-Schutz, 34 Tabellen,
  29 Aufrufe von `detail()`.
- `test/release_042.js`: sieben Aufrufe von `upload()`.
- `test/selfcheck.js`: 1.245 Rückbauten, die Kommentargrenzen, 43 Dateien.
- `testbench.js`: `release_046` hinter `release_045`.

Rückbauten, neu:

| Nr | Rückbau | erwartet in |
|---|---|---|
| 1315 | `/raw` schickt die Datei ohne Range | Vorschauart, Range und Standbild am Server |
| 1316 | Ein Video ohne Standbild bekommt ein Bild ohne Quelle | Kachel, Vollbild und Tasten |
| 1317 | Das Standbild setzt auch der Admin (`mayChange` statt `selfOnly`) | Vorschauart, Range und Standbild am Server |
| 1318 | Der Umschlag des Papierkorbs trägt kein Standbild | Papierkorb und Export |
| 1319 | Im Vollbild blättern die Pfeile trotz Fokus auf dem Video | Kachel, Vollbild und Tasten |
| 1320 | Im Eintrag blättern die Pfeile trotz Fokus auf dem Kurzvideo | Kachel, Vollbild und Tasten |
| 1321 | Die Adresse eines Videos öffnet die eigene Ansicht | Adresse, Marke und Bildleiste |
| 1322 | Das Nachholen läuft bei jedem Zeichnen | Standbild beim Hochladen, von Hand und nachgeholt |
| 1323 | Die Bildleiste nennt „Dateien“ ohne Blick auf die Grenze „Anhang“ | Adresse, Marke und Bildleiste |
| 1324 | Das Wiederherstellen legt das Standbild nicht an | Papierkorb und Export |
| 1325 | Nach dem Upload geht kein Standbild an den Server | Standbild beim Hochladen, von Hand und nachgeholt |
| 1326 | Ein neues Standbild lässt die alte Kachel stehen | Vorschauart, Range und Standbild am Server |
| 1327 | Der Browser spult zusätzlich zum festen Sprung | Kachel, Vollbild und Tasten |
| 1328 | Der Sprung läuft über Anfang und Ende hinaus | Kachel, Vollbild und Tasten |

Die acht Gegenproben des Auftrags sind 1315 bis 1319 und 1321 bis 1323; 1320
und 1324 bis 1328 kommen dazu.

Rückbauten mit neuem Suchtext: 1280 (Marke), 1289 und 1291 (Kachel am
Server), 1292 (Adresse der Kachel), 1294 und 1295 (Bildfläche), 1312 (Adresse
einer Bilddatei).

---

## 6. Nicht geprüft und offen

Der Prüfstand spielt kein Video ab (Stolperstein 111).

Von Hand in Chromium (`headless_shell` 1194, Playwright 1.56.1) gegen eine
eigene Instanz, mit einem WebM aus dem ffmpeg von Playwright (VP8, 10 s,
320 × 180, mit Dauer und Cues) und einem WebM aus `MediaRecorder` (ohne
Dauer):

| Was | Ergebnis |
|---|---|
| Hochladen | Standbild im Browser, `PUT …/still` 200; Kachel mit Vorschaubild, ▶ und „0:10“ |
| Vollbild | spielt 320 × 180, Poster aus dem Standbild; `/raw?inline=1` mit 206 auf `bytes=0-` und `bytes=65536-` |
| ← → mit Fokus, ohne eigenen Sprung | Chromium springt selbst 0,1 s bei 10 s Länge, also 1 %; daraus die Frage nach dem Spulschritt |
| ← → mit Fokus im Vollbild | 5,02 s → 10 s (Ende) → 5 s; es wird nicht geblättert |
| ← → mit Fokus im großen Bild | 5,01 s → 0 s; das Kurzvideo bleibt stehen |
| ← → ohne Fokus | blättert zur Bilddatei, im Vollbild wie im Eintrag |
| „Dieses Bild als Vorschaubild“ | `PUT …/still` 200, neues Poster, Meldung „Thumbnail saved“ (der Browser lief englisch) |
| Nachholen | ein Video ohne Standbild, an der Oberfläche vorbei hochgeladen: nach dem Öffnen `GET /raw` (206), `PUT …/still` 200, die Kachel zeigt das Vorschaubild |
| WebM ohne Dauer | spielt; Dauer unbekannt, die Kachel zeigt keine; spulen lässt es sich nicht |

Die Probe gehört nicht zum Prüfstand.

Offen für die Abnahme (Auftrag, Abschnitt 5):

- iPhone: MP4 (H.264) hochladen, Vorschaubild und Dauer auf der Kachel,
  Abspielen und Springen im Vollbild.
- MOV (HEVC) in Chrome und Firefox: spielt, oder Satz und „Herunterladen“.
- Ein Video aus 0.45.0 als Verfasser öffnen: das Vorschaubild erscheint.
- „Dieses Bild als Vorschaubild“ an einer anderen Stelle.
- ← → mit und ohne Fokus auf dem Video, im Vollbild und im großen Bild.
- Ein zu großes Video auf der Bildleiste: der Hinweis nennt „Dateien“.
- Papierkorb und Zurückholen: das Vorschaubild ist noch da.
