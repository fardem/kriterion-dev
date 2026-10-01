# Auftrag 0.53.1 — „Punkte aus der Abnahme von 0.53.0“

**Aufgestellt am 1. Oktober 2026.** Grundlage ist der Abschnitt 0.53.1 in
`Doku/Fahrplan.md` mit den Punkten B1 bis B10: Funde aus der Abnahme von
0.53.0 und die Punkte 42 und 60 bis 63 aus `Doku/Fehler_und_Ideen.md`.
Vorgabe des Betreibers: Alle weiteren Punkte kommen in 0.53.1, und gebaut wird,
wenn er fertig gesammelt hat und den Bau startet. Kommen vor dem Start Punkte
dazu, werden sie hier nachgetragen.

Zeilennummern gelten für `3c36dff` (0.53.0).

---

## 0. Vor dem Bau: die offenen Fragen

### Vorgaben des Betreibers

| Nr. | Punkt | Vorgabe |
|---|---|---|
| V1 | B1 | In der Spalte „Typ“ stehen bei Bildern Format und Pixel: „PNG · 1920 × 1080“ (Fragetafel) |
| V2 | B1 | Am Vorschaubild steht das Format, wie der Codec bei Videos (Fragetafel) |
| V3 | B1 | Sortieren nach „Typ“ bleibt innerhalb der Art nach Name (Fragetafel) |
| V4 | B2 | Vorschaubilder in der Bilddatei: eine Gruppe „Bild“ für das Hauptbild, darin eine Zeile für die Vorschaubilder (Fragetafel) |
| V5 | B3 | Zugeklappt: „3 Ordner · 12 Videos · 9 Bilder · 4 weitere · 1.122,2 MB“, ohne Bedienelemente (Fragetafel) |
| V6 | B3 | Aufgeklappt bleibt der Kopf, wie er ist (Fragetafel) |
| V7 | B4 | Dateien umbenennen wie vorgeschlagen: „Umbenennen …“ im Menü „…“; die Endung bleibt; nur wer hochgeladen hat; neue Route `PUT /api/attachments/:id`; kein Eintrag im Sicherheitsprotokoll; auch bei offenem Document Server (Fragetafel) |
| V8 | B5 bis B7 | Punkte 61 bis 63 übernehmen (Fragetafel und „62 und 63 so übernehmen“) |
| V9 | B8 | Punkt 42 übernehmen: „42, 60 auch bitte in 0.53.1 aufnehmen“ |
| V10 | B9 | EXIF bei Bildern: „wenn es drin ist, auch die EXIF-Daten, die wichtigsten mit aufnehmen: wann, welche Kamera etc.“ |
| V11 | B10 | Dokumente bekommen „Infos“: „wann zuletzt geändert etc. … nicht erweiterte, sondern Infos“; „schau, was man so noch hat: zuletzt bearbeitet von etc., halt die Dinge, die interessant sein könnten“ |
| V12 | B10 | Kriterion hält Zeitpunkt und Account der letzten Speicherung im Document Server fest: „das muss geändert werden: Kriterion speichert keinen Zeitpunkt/Account …“ |
| V13 | alle | „nimm alle zusätzlichen Punkte für 0.53.1 auf … ich werde noch weiter sammeln“; gebaut wird, wenn er fertig gesammelt hat |

Alle vom 1. Oktober 2026.

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | Versionsnummer? B4 bringt eine Route, B10 eine Tabelle | 0.53.1 wie gesammelt · 0.54.0, wie bei bisherigen Runden mit neuem Schema || **0.54.0** (Empfehlung) |
| F2 | B1: Pixel eines Fotos mit EXIF-Ausrichtung (Hochformat)? | wie angezeigt: die Warteschlange liest die Ausrichtung mit `sharp` · wie gespeichert: die Werte von MediaInfo || **wie angezeigt** (Empfehlung) |
| F3 | B1: Bild ohne gelesene Angaben? | „Bild“ wie heute · die Endung in Großbuchstaben || **„Bild“ wie heute** (Empfehlung) |
| F4 | B1, B9: bestehende Bilder? | nach dem Update einmal im Hintergrund nachlesen · nur neue Bilder || **einmal nachlesen** (Empfehlung) |
| F5 | B2: Vorschaubilder verschiedener Größe? | alle Größen: „2 (256 × 205, 160 × 120)“ · nur die Zahl || **alle Größen** (Empfehlung) |
| F6 | B2, B9: auch für Fotos und Videos des Eintrags? | ja, derselbe Dialog · nur unter „Dateien“ || **ja, derselbe Dialog** (Empfehlung) |
| F7 | B3: die Aufteilung in Klammern wie die übrigen Kurzfassungen? | ohne Klammern · in Klammern || **ohne Klammern** (Empfehlung) |
| F8 | B4: derselbe Name wie bei einer anderen Datei? | erlaubt wie beim Hochladen · im selben Ordner abgelehnt || **im selben Ordner abgelehnt** |
| F9 | B4: Umbenennen auch im Vollbild? | nein, nur im Menü „…“ · auch in der Leiste des Vollbilds || **nein, nur im Menü „…“** (Empfehlung) |
| F10 | B3, B5: „keine“ und „leer“ in `blockSummary()` | über die Sprachdateien · bleiben || **über die Sprachdateien** (Empfehlung) |
| F11 | B6: „Eintrag exportieren“ in der Anleitung | der Abschnitt entfällt in allen drei Fassungen · die Funktion kommt || **der Abschnitt entfällt** (Empfehlung) |
| F12 | B8: Tafeln gemessener Werte im Stilblatt | bleiben im Kommentar · wandern in ein Papier in `Doku/` || **bleiben im Kommentar** (Empfehlung) |
| F13 | B9: welche EXIF-Felder? | Aufnahmezeit, Kamera, Objektiv, Belichtungszeit, Blende, ISO, Brennweite · dazu Blitz, Software, Urheber, Copyright · nur Aufnahmezeit und Kamera || **die wichtigsten** (Empfehlung) |
| F14 | B9: GPS-Position in der Datei? | nur „Ort in der Datei: ja“ · die Koordinaten · gar nichts || **nur „Ort in der Datei: ja“** (Empfehlung) |
| F15 | B9: womit wird EXIF gelesen? | `exif-reader` 2.0.3 · ein eigener Leser in `attachments.js` || **`exif-reader` 2.0.3** (Empfehlung) |
| F16 | B10: welche Angaben? | aus Kriterion und aus der Datei · nur aus Kriterion · nur aus der Datei || **aus Kriterion und aus der Datei** (Empfehlung) |
| F17 | B10: die Änderungszeit der Datei vom Rechner beim Hochladen behalten? | ja, in der neuen Tabelle · nein || **ja, in der neuen Tabelle** (Empfehlung) |
| F18 | B10: Name des Menüpunkts | „Infos“ bei Dokumenten, „Erweiterte Infos“ bei Bildern und Videos · „Infos“ für alle Dateien || **„Infos“ bei Dokumenten** (Empfehlung) |
| F19 | B10: welche Dokumente? | Office, OpenDocument und PDF · dazu Textdateien · nur Office und PDF || **Office, OpenDocument und PDF** (Empfehlung) |

---

## 1. Das Ziel

Unter „Dateien“ nennen Bilder ihr Format und ihre Pixel wie Videos ihren
Codec. „Erweiterte Infos“ zeigen das Hauptbild einer Bilddatei ohne die
eingebetteten Vorschaubilder als eigene Gruppen, dazu die wichtigsten
EXIF-Angaben. Dokumente bekommen „Infos“ mit Angaben aus Kriterion und aus der
Datei, auch wer zuletzt bearbeitet hat. Der zugeklappte Kopf von „Dateien“
nennt nur Zahlen. Dateien lassen sich umbenennen. Feste deutsche Texte im Code
und vier Namen der Anleitung werden berichtigt, die Kommentare im Stilblatt
nach der Kommentarregel durchgesehen.

---

## 2. Der Stand, geprüft am 1. Oktober 2026

### 2.1 Typ und Vorschaubild (B1)

- `qAttachments`, `server.js`:2393, liest nur `$.video[0].format` als
  `codec`. `server.js`:2749 gibt `codec` und `infoSoon` nur bei Videos aus.
- `kindText()`, `public/app.js`:4935, nennt bei Bildern „Bild“, bei Videos
  Codec und Länge. `CODEC_NAMES`, `public/app.js`:4942, kennt AVC und HEVC.
- Das Vorschaubild trägt `.acodec` (`public/app.js`:7165), die Zeile `codec`
  und die Beschriftung (`public/app.js`:7206 und 7207), alles nur bei Videos.
- Die Angaben zu Bildern liegen schon in `attachment_media`; die Warteschlange
  liest Bilder mit.

Gemessen mit `mediainfo.js` an Bildern aus `sharp`:

| Endung | `general.format` | `image[0].format` |
|---|---|---|
| `.jpg` | JPEG | JPEG |
| `.png` | PNG | PNG |
| `.webp` | WebP | VP8 |
| `.gif` | GIF | GIF |
| `.avif` | avif | AV1 |
| `.bmp` | Bitmap | Raw |

MediaInfo meldet keine EXIF-Ausrichtung, auch nicht mit allen Feldern
(`full: true`). `sharp` liest sie aus den ersten 4 KB der Datei
(`metadata().orientation`, gemessen mit Ausrichtung 6).

### 2.2 Vorschaubilder in der Bilddatei (B2)

MediaInfo meldet jedes Bild in der Datei als eigene Spur Image.
`mediaSummary()` (`attachments.js`:379) übernimmt alle, `mediaInfoHtml()`
(`public/app.js`:4985) zeigt je Spur eine Gruppe „Bild“. Nachgestellt an einem
JPEG mit einem Vorschaubild im EXIF-Block (APP1) und einem im Block von
Photoshop (APP13): drei Spuren, das Hauptbild zuerst.

### 2.3 Der zugeklappte Kopf von „Dateien“ (B3)

`.block.closed > *:not(.block-head)` (`public/style.css`:1667) blendet nur den
Inhalt unter dem Kopf aus. Im Kopf bleiben „(28)“ aus `blockSummary()`
(`public/app.js`:940), „28 Dateien · 1.122,2 MB“ aus `#acount`
(`public/app.js`:7470) und `.ahead-acts` mit allen Bedienelementen.
`blockSummary()` schreibt „keine“ (`kategorie`) und „leer“ (`beschreibung`) fest
auf Deutsch.

### 2.4 Umbenennen (B4)

Ordner: `PUT /api/folders/:id` (`server.js`:4637), nur der Verfasser
(`selfOnly()`, `server.js`:1017), Dialog `folderDialog()`
(`public/app.js`:7741). Dateien haben keine Route zum Umbenennen. Beim
Hochladen gilt für den Namen `path.basename(…).slice(0, 200)`
(`server.js`:4176). Die Endung bestimmt Typ und Auslieferung (`setHeader()`,
`attachments.js`:89) und den Document Server (`docserver.js`:143 bis 150).
Der Schlüssel einer Sitzung im Document Server hängt an Nummer und
`created_at`, nicht am Namen (`documentKey()`, `docserver.js`:133).

### 2.5 Texte und Anleitung (B5 bis B7)

- `public/app.js`:6239 und 6241: „am …“ und „von …“ für `entry.rejectedBy`.
- `public/app.js`:3168: „… offen“ im Titel des Knopfs für offene Aufgaben.
- „Eintrag exportieren“: `manual-de.md`:584, `manual.md`:571,
  `manual-tr.md`:575. Es gibt keinen Knopf, keinen Schlüssel und keine Route
  dafür.
- `manual-de.md`: „Ähnlich: …“ (Zeile 264) statt `list.similarTitles`,
  „Alles“ (Zeile 268) statt `list.all`, „Offen“ (Zeilen 302, 317, 820) neben
  `list.openTasks`, „die Karte „Verfahren der Ablage““ (Zeile 708), die eine
  Zwischenüberschrift in „Bildformate“ ist. `en.json`: `card.user` „User“.

### 2.6 Das Stilblatt (B8)

`tools/comments.js` zählt 524 Kommentarzeilen von 2.665, 19,7 Prozent; ein
Viertel der 2.141 Codezeilen wären 535. Grenze in `test/selfcheck.js`: 524.

### 2.7 EXIF (B9)

MediaInfo liest aus JPEG kein EXIF: Kamera, Objektiv, Aufnahmezeit, Blende,
Belichtungszeit, ISO und Brennweite fehlen in seiner Ausgabe. Nachgestellt
mit einem JPEG, dem `sharp` diese Felder mitgegeben hat. `sharp` liefert den
EXIF-Block roh (`metadata().exif`, im Beispiel 468 Bytes). `exif-reader`
2.0.3: MIT, ohne weitere Pakete, 33 kB, gepflegt vom Verfasser von `sharp`.

### 2.8 Dokumente (B10)

- Kriterion kennt Name, Typ, Größe, Verfasser und Zeitpunkt des Hochladens
  (`attachments`), die Zahl der Speicherungen (`attachment_editing.saves`)
  und den Zeitpunkt der vorigen Fassung (`attachment_previous.saved_at`).
- Zeitpunkt und Account der letzten Speicherung stehen nirgends. Der Rückruf
  (`server.js`:917 bis 960) wertet `status`, `key`, `url` und `filetype` aus.
  Nach der Beschreibung der Schnittstelle von ONLYOFFICE trägt er bei Status
  2 und 6 auch `users` mit dem Account, der zuletzt bearbeitet hat, und
  `lastsave`. Mit einem echten Document Server ist das nicht nachgestellt.
- `uploads.modified` (`File.lastModified`) fällt nach dem Hochladen weg.
- Eine neue Spalte in einer bestehenden Tabelle meldet `schemaDifferences()`
  (`schema.js`:578) als „fehlt“; eine neue Tabelle legt der Start an. Darum
  kommt jede neue Angabe in eine neue Tabelle.
- Die Datei trägt Angaben: Office in `docProps/core.xml` (Titel, erstellt von,
  erstellt, zuletzt bearbeitet von, geändert) und `docProps/app.xml` (Seiten,
  Wörter, Folien, Programm, Bearbeitungszeit); OpenDocument in `meta.xml`; PDF
  im Info-Wörterbuch (Titel, Autor, erstellt mit, erzeugt von, erstellt,
  geändert). `attachments.js` hat einen ZIP-Leser (Zeilen 215 bis 245).
