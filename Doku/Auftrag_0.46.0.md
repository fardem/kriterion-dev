# Auftrag 0.46.0 — „Videos unter „Dateien““

**Erteilt am 28. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. Grundlage sind `Doku/Konzept_Dateien_und_Ordner.md`,
Version 1b, und der Eintrag 0.46.0 in `Doku/Fahrplan.md`. Vor der ersten Zeile
Code werden die Fragen aus Abschnitt 0 in einer Fragetafel gestellt.

---

## 0. Vor dem Bau: die offenen Fragen

| Nr. | Frage | Antworten | Empfehlung |
|---|---|---|---|
| B1 | Hat im großen Bild oben im Eintrag ein Video den Fokus: Sollen ← und → dort spulen wie im Vollbild? | a) ja, wie im Vollbild (R17) · b) nein, ← → blättern dort weiter die Bilder (Vorgabe 18) | **a)**: Heute blättert → auch bei einem Video mit Fokus (`keyNav`, `app.js:5450-5457`); das laufende Video verschwindet. Im Vollbild gilt nach F6 schon a). Ohne Fokus auf dem Video bleibt alles, wie es ist. |

Alle übrigen Punkte sind entschieden (Abschnitt 3).

---

## 1. Das Ziel

- Ein Video unter „Dateien“ spielt im Vollbild, auch auf dem iPhone.
- Die Kachel eines Videos zeigt ein Vorschaubild, ▶ und die Dauer.
- Das Vorschaubild entsteht im Browser: beim Hochladen bei 10 % der Länge,
  für vorhandene Videos beim Verfasser nachgeholt, und von Hand mit „Dieses
  Bild als Vorschaubild“.
- Die Tasten im Vollbild gelten für jedes Video: Hat es den Fokus, spulen
  ← und →.
- Die Adresse einer Videodatei öffnet das Vollbild im Eintrag.
- Vorschaubild und Dauer überstehen Papierkorb und Wiederherstellen.

---

## 2. Der Anlass

| Anlass | Stand am 28. September 2026 |
|---|---|
| Vorschauart | `previewKind()` (`attachments.js:58-65`) kennt kein Video; eine Videodatei hat `keine`, ein Klick öffnet ihr Menü (`app.js:6492-6503`) |
| Auslieferung | `GET /api/attachments/:id/raw` schickt die Datei mit `res.send`, ohne Range (`server.js:3704-3712`). iOS Safari fragt `bytes=0-1` und spielt nur mit 206 |
| Kachel | Endung und ▶ nach dem Typ, den der Browser beim Hochladen gemeldet hat (`app.js:6419`); kein Vorschaubild, keine Dauer |
| Vollbild | `onKey` (`app.js:4476-4480`) blättert mit ← →, auch wenn ein Video den Fokus hat |
| Adresse | `#/item/x/file/y` eines Videos öffnet die eigene Ansicht mit „nur herunterladen“ (`app.js:7303`) |
| Standbild | `stillFrame()` (`app.js:1071-1096`) nimmt nur ein `File` und sucht Sekunde 1 |
| Bildleiste | Ein zu langes Video endet mit `entry.tooBig` (`app.js:5395`); der Satz nennt keinen anderen Ort dafür |
| Papierkorb | trägt je Datei Inhalt und Haken (`server.js:4598-4603`), kein Standbild |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 28. September 2026 | H.264 und HEVC (MOV) werden angenommen. Spielt der Browser nicht ab: Download. Standbild bei 10 % der Länge, dazu „Dieses Bild als Vorschau“ im Player (Konzept, Anhang B, Nr. 4) |
| 28. September 2026 | Die Bildleiste bleibt, wie sie ist (Konzept, Anhang B, Nr. 18) |
| 28. September 2026 | F6: Die Regeln des Vollbilds gelten für alle Videos, auch die Kurzvideos der Bildleiste |
| 28. September 2026 | F7: Die Adresse einer Videodatei öffnet das Vollbild im Eintrag, auch über die Marke in Kommentar und Beschreibung |
| 28. September 2026 | F9: Vorschaubild und Dauer eines Videos in Papierkorb, Export und Import; Export und Import mit Format 21 in 0.47.0 |

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.46.0**, MINOR. Schema: ja, die Tabelle `attachment_stills`. Austauschformat: 20 bleibt |
| Routen | Eine neue: `PUT /api/attachments/:id/still`. `GET /api/attachments/:id/raw` bekommt Range und `?size=still` |
| Was ist ein Video | eine Datei mit einer Endung aus `VIDEO_TYPES` (`mp4`, `m4v`, `webm`, `mov`); `.avi` und `.mkv` bleiben ohne Vorschau |
| Standbild | 1600 px an der langen Seite, WebP. Der Browser schickt ein JPEG, `sharp` prüft und rechnet um |
| Vorschaubild der Kachel | 512 × 512 aus der Mitte des Standbilds, in `attachment_thumbs` wie bei Bilddateien; es entsteht beim ersten Abruf und fällt mit jedem neuen Standbild weg |
| Cache | Die Adressen von Standbild und Kachel tragen `v=<Länge des Standbilds>`, weil sie eine Woche im Cache liegen |
| Wer setzt das Standbild | wer die Datei hochgeladen hat (`selfOnly`); der Admin bekommt 403 |
| Nachholen | im Browser des Verfassers, einmal je Sitzung und Datei, eine Datei nach der anderen |
| Export | trägt kein Standbild (Format 20); nach einem Import holt der Browser des Verfassers es nach |
| Video, das der Browser nicht spielt | im Vollbild „Dieses Video kann der Browser nicht abspielen“ und „Herunterladen“ (`error`, oder `videoWidth` 0 nach `loadedmetadata`) |
| Hinweis der Bildleiste | „Längere Videos gehören unter „Dateien“.“ nur, wenn das Video unter die Grenze „Anhang“ passt |
| Automatisches Abspielen | keines (Konzept, Abschnitt 9) |

---

## 4. Die Bauabschnitte

### BA 1 — Vorschauart und Auslieferung

- `previewKind()` liefert `video` für die Endungen aus `VIDEO_TYPES`. Die Art
  gilt in `detail()`, in `/api/comment-refs` und in der eigenen Ansicht.
- `GET /api/attachments/:id/raw` liefert jede Datei über `sendRanged`
  (`server.js:3583-3593`): 206 mit `Content-Range`, ungültiger Range 416.
  `?inline=1` und der Download bleiben, wie sie sind.
- `?size=still` liefert das Standbild (`image/webp`, eine Woche im Cache);
  ohne Standbild 404.
- `?size=thumb` liefert bei einem Video die Kachel aus dem Standbild; ohne
  Standbild 404.

### BA 2 — Das Standbild am Server

- Neue Tabelle `attachment_stills`: `attachment_id` (Primärschlüssel,
  `attachments` mit `ON DELETE CASCADE`), `duration` REAL (Sekunden, `NULL`
  unbekannt), `still` BLOB. Sie entsteht beim Start mit `db.exec(SCHEMA)`.
- `PUT /api/attachments/:id/still`, Multipart mit `still` (Bild) und
  `duration`, über `cappedLive` mit der Grenze „Foto“. Nur für eine Datei mit
  Vorschauart `video`, sonst 400. Nur `selfOnly`, sonst 403. `sharp` prüft das
  Bild; ist es keines, 400. Die Kachel in `attachment_thumbs` wird gelöscht.
  Antwort: der Eintrag wie bei jeder Änderung an einer Datei.
- `detail()` liefert je Datei `duration` und `still` (Länge des Standbilds oder
  `null`), über `LEFT JOIN`, ohne die Bytes zu lesen.

### BA 3 — Papierkorb

- Der Umschlag des Papierkorbs trägt je Video `duration` und `still_ref`; die
  Bytes kopiert SQLite nach `trash_bytes`, wie bei den anderen Blobs
  (`server.js:5446-5460`).
- Wiederherstellen legt die Zeile in `attachment_stills` wieder an.
- Der Export (Format 20) trägt kein Standbild. Der Import liest `still_base64`
  und `still_ref`, wenn sie dastehen (Felder, nicht Formatnummer).

### BA 4 — Kachel und Vollbild

- Die Kachel eines Videos zeigt das Vorschaubild, oben links ▶ und unten rechts
  die Dauer; die Zustandsecke eines Uploads verdrängt die Dauer. Ohne
  Vorschaubild Endung und ▶ wie in 0.45.0.
- Ein Klick öffnet das Vollbild, am Rechner und am Telefon. ← → blättern durch
  Bilder und Videos der Gruppe.
- Im Vollbild: `<video controls playsinline preload="metadata">`, Poster ist das
  Standbild. Leiste: „Link kopieren“, „Herunterladen“, mit Recht „Dieses Bild
  als Vorschaubild“ und „Löschen“.
- `onKey` im Vollbild: Hat ein Video den Fokus, gehören ← und → ihm. Das gilt
  für jedes Video darin, auch für Kurzvideos und Kommentarvideos (F6).
- Spielt der Browser das Video nicht, steht auf der Bühne
  `entry.videoUnplayable` und bei einer Datei „Herunterladen“.
- Menü ⋯ eines eigenen Videos: „Dieses Bild als Vorschaubild“ öffnet das
  Vollbild an diesem Video.
- Nach B1: `keyNav` im Eintrag gibt ← → an ein Video mit Fokus ab.

### BA 5 — Das Standbild im Browser

- `stillFrame()` nimmt ein `File` oder eine Adresse und die Stelle als Anteil
  der Länge; die Bildleiste ruft es weiter mit Sekunde 1.
- **Hochladen:** Für ein Video erzeugt der Browser das Standbild bei 10 % aus
  der Datei, sobald ihr Upload beginnt; die Kachel zeigt es gleich. Nach dem
  Upload geht es mit der Dauer an `PUT /api/attachments/:id/still`. Scheitert
  es, bleibt das Video ohne Vorschaubild und wird später nachgeholt.
- **Nachholen:** Sieht der Verfasser die Kachel eines Videos ohne Standbild,
  erzeugt sein Browser es aus `/raw` bei 10 %, einmal je Sitzung und Datei,
  eine Datei nach der anderen.
- **Von Hand:** „Dieses Bild als Vorschaubild“ in der Leiste des Vollbilds
  nimmt das gezeigte Bild des Videos.

### BA 6 — Adresse, Marke, Bildleiste

- `renderFileView()` gibt ein Video wie eine Bilddatei an `renderDetail()`
  weiter; die Adresse wird `#/item/<Eintrag>`.
- Die Marke einer Videodatei zeigt ihr Vorschaubild mit ▶; ohne Vorschaubild
  Zeichen und Dateiname. Im geöffneten Eintrag öffnet sie das Vollbild ohne
  Hash-Wechsel.
- Die Bildleiste lehnt ein zu langes Video ab wie heute. Passt es unter die
  Grenze „Anhang“, steht dahinter „Längere Videos gehören unter „Dateien“.“

### BA 7 — Texte

Neue Schlüssel in `de.json`, `en.json` und `tr.json`, jeder mit einem Leser im
Code: „Dieses Bild als Vorschaubild“, die Bestätigung nach dem Setzen, der
Hinweis der Bildleiste. Vorhanden und weiter genutzt: `entry.videoUnplayable`,
`entry.download`, `list.video`.

### BA 8 — Der Prüfstand

Neues Modul `test/release_046.js` auf der Portbasis 7340, eingetragen hinter
`release_045`.

| | was gehalten wird |
|---|---|
| 1 | `previewKind()` liefert `video` für `mp4`, `m4v`, `webm`, `mov`, nicht für `avi` |
| 2 | Range an `/raw` für jede Datei: `bytes=0-1` ergibt 206 mit zwei Bytes, ein offener und ein Suffix-Range stimmen, ein ungültiger ergibt 416 |
| 3 | Standbild setzen: 200 für den Verfasser, 403 für den Admin und einen fremden Account, 400 für eine Datei ohne Vorschauart `video` und für ein Bild, das keines ist |
| 4 | `?size=still` und `?size=thumb` liefern WebP; die Kachel entsteht neu, wenn ein neues Standbild kommt |
| 5 | Standbild und Dauer überstehen Papierkorb und Wiederherstellen |
| 6 | Die Kachel eines Videos zeigt Vorschaubild, ▶ und Dauer; ohne Vorschaubild Endung und ▶ |
| 7 | Ein Klick öffnet das Vollbild mit `playsinline` und Poster; ← → blättern durch Bilder und Videos der Gruppe |
| 8 | Hat das Video im Vollbild den Fokus, blättern ← und → nicht; ohne Fokus schon |
| 9 | Beim Hochladen geht das Standbild bei 10 % an die neue Route; das Nachholen läuft einmal je Sitzung und Datei und nur beim Verfasser |
| 10 | `#/item/x/file/y` eines Videos öffnet das Vollbild im Eintrag, auch über die Marke |
| 11 | Spielt der Browser nicht, stehen Satz und „Herunterladen“ da |
| 12 | Die Bildleiste nennt „Dateien“ nur für ein Video, das unter „Anhang“ passt |

**Gegenproben**, je eine: `res.send` ohne Range · `img` ohne Quelle an der
Kachel eines Videos ohne Standbild · `mayChange` statt `selfOnly` am Standbild ·
Standbild nicht im Umschlag · ← → blättern trotz Fokus auf dem Video ·
`renderFileView` für Videos · Nachholen bei jedem Zeichnen · Hinweis der
Bildleiste ohne Blick auf „Anhang“.

**Was mitgeht:**

- `test/release_045.js`: „Ein Video unter „Dateien“ oeffnet ebenso das Menue“
  wird zu „… öffnet das Vollbild“.
- Feste Zahlen: schreibende Routen in `F_ROUTES` 79 → 80, davon hinter dem
  CSRF-Schutz 71 → 72 (Zahlwort in `test/roundtrip.js:333`); Routen mit Rufer
  in `public/app.js` 114 → 115 (`test/source.js:1610`); Tabellen 33 → 34
  (`test/roundtrip.js:4055`); `DATATABLES` mit `attachment_stills`
  (`test/source.js:394-396`); Kopieranweisungen des Papierkorbs 6 → 7, die
  neue liest `WHERE attachment_id = ?` (`test/source.js:407-412`);
  `cappedLive` 7 → 8 (`test/source.js:1907`); Dateien des Kommentarwächters
  42 → 43 (`test/selfcheck.js:388`, `test/source.js:1077`), dazu
  `COMMENT_TOTAL`; Regelzeilen des Stilblatts neu gezählt; Rückbauten
  (`test/selfcheck.js:18`) plus die Gegenproben. Austauschformat und Module
  bleiben.
- Der Prüfstand spielt kein Video (Stolperstein 111). Ob iOS abspielt und ob
  ein Standbild aus `/raw` entsteht, prüft die Abnahme (Abschnitt 5).

### BA 9 — Dokumentation und Zahlen

- **`manual-de.md`:** „Tags, Dateien, Links“ mit Videos, Vorschaubild,
  „Dieses Bild als Vorschaubild“ und den Tasten; „Fotos und Videos“ mit dem
  Hinweis der Bildleiste.
- **`Doku/Aenderungsprotokoll_0.46.0.md`** mit den Zahlen am fertigen Stand.
- **`CHANGELOG.md`:** `## [0.46.0]`, mit dem Kasten zur neuen Tabelle.
- **`Doku/Fahrplan.md`:** Zeile 0.46.0 durchstreichen und füllen; der
  Abschnitt bekommt oben „Gebaut am …“.
- **`package.json`** auf `0.46.0`, `package-lock.json` mit.
- **Die festen Zahlen** am fertigen Stand.
- **Der Fingerprint** mit `node tools/publish.js` am sauberen Arbeitsbaum, dann
  in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 5. Abnahme im Betrieb

Der Betreiber prüft nach dem Einspielen:

1. Am iPhone ein MP4 (H.264) unter „Dateien“ hochladen: Die Kachel zeigt
   Vorschaubild und Dauer; ein Klick spielt es im Vollbild ab, Springen geht.
2. Am Rechner in Chrome und Firefox ein MOV (HEVC) vom iPhone öffnen: Es spielt,
   oder es stehen Satz und „Herunterladen“ da.
3. Einen Eintrag mit einem Video aus 0.45.0 als Verfasser öffnen: Nach kurzer
   Zeit steht ein Vorschaubild auf der Kachel.
4. Im Vollbild zu einer Stelle spulen und „Dieses Bild als Vorschaubild“
   wählen.
5. Im Vollbild auf das Video klicken, dann ← →: Es spult. Daneben klicken, dann
   ← →: Es blättert.
6. Ein Video über der Grenze „Video“ auf die Bildleiste ziehen: Der Hinweis nennt
   „Dateien“.
7. Einen Eintrag mit Video löschen und aus dem Papierkorb zurückholen: Das
   Vorschaubild ist noch da.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Standbild und Dauer in Export und Import (Format 21) | 0.47.0 |
| Ordner | 0.47.0 |
| Große Videos über „Anhang“, Upload in Stücken, Dateien auf der Platte | 0.48.0 |
| „Dieses Bild als Vorschaubild“ für die Kurzvideos der Bildleiste | Vorgabe 18 |
| Umkodieren, automatisches Abspielen | Konzept, Abschnitt 9 |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Eine neue Tabelle, keine geänderte. Eine vorhandene Datenbank bekommt sie
   beim ersten Start, ohne Migration.
3. Die Kommentarregel gilt: höchstens drei Zeilen je Block, nie mehr Kommentar
   als Code, keine Versionsnummer, kein Verweis auf `Doku/`.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Kommt eine Frage auf, die hier nicht beantwortet ist, wird sie als
   Fragetafel gestellt. Antwortet niemand, gilt der einfachere Weg, der kein
   Verhalten ändert. Die Entscheidung steht im Änderungsprotokoll.
