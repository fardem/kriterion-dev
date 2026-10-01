# Auftrag 0.54.0 — „Punkte aus der Abnahme von 0.53.0“

**Aufgestellt am 1. Oktober 2026.** Grundlage ist der Abschnitt 0.54.0 in
`Doku/Fahrplan.md` mit den Punkten B1 bis B10: Funde aus der Abnahme von
0.53.0 und die Punkte 42 und 60 bis 63 aus `Doku/Fehler_und_Ideen.md`. Die
Runde hieß bis zur Antwort auf F1 0.53.1. F1 bis F19 sind am 1. Oktober 2026
in fünf Fragetafeln beantwortet. B11 kam am selben Tag nach dem Start des Baus
dazu; F20 bis F26 sind in zwei weiteren Fragetafeln beantwortet.

Vorgabe des Betreibers: Alle weiteren Punkte kommen in diese Runde, und gebaut
wird, wenn er fertig gesammelt hat und den Bau startet. Kommen vor dem Start
Punkte dazu, werden sie hier nachgetragen.

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
| V14 | B11 | „ungeschätzte oder unbewertete filtern und auch ein Punkt zum Filtern für teilweise bewertete, wenn weniger als 80 % (einstellbar im Admin-Menü) der möglichen Bewertungen oder Schätzungen bewertet worden sind“ |
| V15 | B11 | „also als Filter Schätzung, Bewertung, und je teilweise“ |

Alle vom 1. Oktober 2026.

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | Versionsnummer? B4 bringt eine Route, B10 eine Tabelle | 0.53.1 wie gesammelt · 0.54.0, wie bei bisherigen Runden mit neuem Schema | **0.54.0** (Empfehlung) |
| F2 | B1: Pixel eines Fotos mit EXIF-Ausrichtung (Hochformat)? | wie angezeigt: die Warteschlange liest die Ausrichtung mit `sharp` · wie gespeichert: die Werte von MediaInfo | **wie angezeigt** (Empfehlung) |
| F3 | B1: Bild ohne gelesene Angaben? | „Bild“ wie heute · die Endung in Großbuchstaben | **„Bild“ wie heute** (Empfehlung) |
| F4 | B1, B9: bestehende Bilder? | nach dem Update einmal im Hintergrund nachlesen · nur neue Bilder | **einmal nachlesen** (Empfehlung) |
| F5 | B2: Vorschaubilder verschiedener Größe? | alle Größen: „2 (256 × 205, 160 × 120)“ · nur die Zahl | **alle Größen** (Empfehlung) |
| F6 | B2, B9: auch für Fotos und Videos des Eintrags? | ja, derselbe Dialog · nur unter „Dateien“ | **ja, derselbe Dialog** (Empfehlung) |
| F7 | B3: die Aufteilung in Klammern wie die übrigen Kurzfassungen? | ohne Klammern · in Klammern | **ohne Klammern** (Empfehlung) |
| F8 | B4: derselbe Name wie bei einer anderen Datei? | erlaubt wie beim Hochladen · im selben Ordner abgelehnt | **im selben Ordner abgelehnt** |
| F9 | B4: Umbenennen auch im Vollbild? | nein, nur im Menü „…“ · auch in der Leiste des Vollbilds | **nein, nur im Menü „…“** (Empfehlung) |
| F10 | B3, B5: „keine“ und „leer“ in `blockSummary()` | über die Sprachdateien · bleiben | **über die Sprachdateien** (Empfehlung) |
| F11 | B6: „Eintrag exportieren“ in der Anleitung | der Abschnitt entfällt in allen drei Fassungen · die Funktion kommt | **der Abschnitt entfällt** (Empfehlung) |
| F12 | B8: Tafeln gemessener Werte im Stilblatt | bleiben im Kommentar · wandern in ein Papier in `Doku/` | **bleiben im Kommentar** (Empfehlung) |
| F13 | B9: welche EXIF-Felder? | Aufnahmezeit, Kamera, Objektiv, Belichtungszeit, Blende, ISO, Brennweite · dazu Blitz, Software, Urheber, Copyright · nur Aufnahmezeit und Kamera | **die wichtigsten** (Empfehlung) |
| F14 | B9: GPS-Position in der Datei? | nur „Ort in der Datei: ja“ · die Koordinaten · gar nichts | **nur „Ort in der Datei: ja“** (Empfehlung) |
| F15 | B9: womit wird EXIF gelesen? | `exif-reader` 2.0.3 · ein eigener Leser in `attachments.js` | **`exif-reader` 2.0.3** (Empfehlung) |
| F16 | B10: welche Angaben? | aus Kriterion und aus der Datei · nur aus Kriterion · nur aus der Datei | **aus Kriterion und aus der Datei** (Empfehlung) |
| F17 | B10: die Änderungszeit der Datei vom Rechner beim Hochladen behalten? | ja, in der neuen Tabelle · nein | **ja, in der neuen Tabelle** (Empfehlung) |
| F18 | B10: Name des Menüpunkts | „Infos“ bei Dokumenten, „Erweiterte Infos“ bei Bildern und Videos · „Infos“ für alle Dateien | **„Infos“ bei Dokumenten** (Empfehlung) |
| F19 | B10: welche Dokumente? | Office, OpenDocument und PDF · dazu Textdateien · nur Office und PDF | **Office, OpenDocument und PDF** (Empfehlung) |
| F20 | B11: in welcher Runde? | als Punkt 64 sammeln · in 0.54.0 nachtragen · eigene Runde direkt danach | **in 0.54.0 nachtragen** |
| F21 | B11: woran misst sich „teilweise“? | eigene Werte · je Kriterium ein Wert von irgendeinem Account · alle Accounts | **eigene Werte** (Empfehlung) |
| F22 | B11: Werte der Filter? | alle · keine · teilweise · dazu „vollständig“ | **alle · keine · teilweise** (Empfehlung) |
| F23 | B11: ungetestete Einträge bei „Bewertung“? | zählen nicht · zählen als „keine“ | **zählen nicht** (Empfehlung) |
| F24 | B11: eine Schwelle oder je Phase eine? | eine für beide · je eine | **eine für beide** (Empfehlung) |
| F25 | B11: Eingabe der Schwelle? | ganze Zahl 1 bis 100 · Auswahl in 10er-Schritten | **ganze Zahl 1 bis 100** (Empfehlung) |
| F26 | B11: wer ändert die Schwelle? | jeder Admin · nur der Eigentümer-Admin | **jeder Admin** (Empfehlung) |

---

## 1. Das Ziel

Unter „Dateien“ nennen Bilder ihr Format und ihre Pixel wie Videos ihren
Codec. „Erweiterte Infos“ zeigen das Hauptbild einer Bilddatei ohne die
eingebetteten Vorschaubilder als eigene Gruppen, dazu die wichtigsten
EXIF-Angaben. Dokumente bekommen „Infos“ mit Angaben aus Kriterion und aus der
Datei, auch wer zuletzt bearbeitet hat. Der zugeklappte Kopf von „Dateien“
nennt nur Zahlen. Dateien lassen sich umbenennen. Feste deutsche Texte im Code
und vier Namen der Anleitung werden berichtigt, die Kommentare im Stilblatt
nach der Kommentarregel durchgesehen. Die Übersicht filtert nach den eigenen
Werten bei „Potenzial“ und „Bewertung“: keine oder teilweise, mit einer
Schwelle, die ein Admin einstellt.

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

### 2.9 Filter der Übersicht (B11)

- `FILTER_DEFAULT` (`public/app.js`:2730) kennt Status, Ablehnung, Favoriten,
  Kategorien und Tags. `visibleItems()` (`public/app.js`:2993) filtert im
  Browser, `filterNumber()` (`public/app.js`:3462) zählt die aktiven Filter,
  `filterNormal()` (`public/app.js`:2862) prüft gespeicherte Filter und
  Ansichten. `drawFilters()` (`public/app.js`:3489) zeichnet die Leiste;
  „Ablehnung“ steht als zweite Gruppe in der Zeile „Status“
  (`public/app.js`:3533).
- `GET /api/items` (`server.js`:3346) liefert je Eintrag die Durchschnitte
  (`avgRating`, `potentialRating`, `server.js`:3409). Wie viele Kriterien der
  Account selbst bewertet hat, steht nicht in der Antwort.
- `ratings` hat eine Zeile je Eintrag, Kriterium und Account. Der Wert 0 nimmt
  eine Bewertung zurück. Kriterien der Phase `after` lassen sich erst nach dem
  Test bewerten (`server.js`:4957), Kriterien der Phase `before` jederzeit.
- Ist `potentialMode` (`server.js`:1023) aus, fehlt das Potenzial überall.
- Globale Schalter, die jeder Admin setzt, schreibt `PUT /api/settings`
  (`server.js`:1970), etwa `tagsFreeCreate`.

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

V1 bis V13 und F1 bis F19 aus Abschnitt 0, alle vom 1. Oktober 2026.

### Entschieden in diesem Auftrag

#### Allgemein

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.54.0**, MINOR (F1). Schema: **ja**, eine neue Tabelle `attachment_changes`, kein Migrationsblock. Austauschformat: bleibt 22 |
| Routen | Schreibende Routen 90 → 91: `PUT /api/attachments/:id` (B4). Lesende Routen bleiben 38: `GET /api/attachments/:id/info` liefert die „Infos“ zu Dokumenten mit |
| Abhängigkeiten | 6 → 7: `exif-reader` 2.0.3 (F15) |
| Sicherheitsprotokoll | kein neuer Vorgang (V7) |
| Sprachen | jeder neue Text in `de.json`, `en.json` und `tr.json`; README und Anleitung in allen drei Fassungen, das CHANGELOG englisch (`CLAUDE.md`) |
| B11 | keine neue Route und keine neue Tabelle: die Schwelle steht in `settings` und geht über `PUT /api/settings` |

#### B1 — Typ und Vorschaubild (V1 bis V3, F2 bis F4)

| Frage | Antwort |
|---|---|
| Format | `general.format` von MediaInfo. Namen wie bei `CODEC_NAMES`: „avif“ als „AVIF“, „Bitmap“ als „BMP“, sonst der Wortlaut |
| Pixel | aus `image[0]`. Bei EXIF-Ausrichtung 5 bis 8 sind Breite und Höhe getauscht (F2). Die Ausrichtung liest die Warteschlange mit `sharp` aus dem ersten Stück der Datei und legt sie in `attachment_media.info` ab |
| Text | „PNG · 1920 × 1080“ in der Spalte „Typ“ und in der Beschriftung der Zeile. Ohne Angaben steht „Bild“ (F3) |
| Vorschaubild | `.acodec` mit dem Format, wie der Codec bei Videos |
| Server | `qAttachments` liest dazu `$.general.format`, die Pixel und die Ausrichtung; `codec` und `infoSoon` auch bei Bildern |
| Bestand | Bilder ohne die neuen Angaben liest die Warteschlange nach dem Update einmal im Hintergrund nach (F4), auch für B9 |
| Sortieren | bleibt innerhalb der Art nach Name (V3) |

#### B2 — Vorschaubilder in der Bilddatei (V4, F5, F6)

| Frage | Antwort |
|---|---|
| Gruppe | eine Gruppe „Bild“ für `image[0]` |
| Zeile | „Vorschaubilder in der Datei: 2 (256 × 205)“. Verschiedene Größen stehen alle da, gleiche einmal (F5) |
| Fotos des Eintrags | ebenso, derselbe Dialog (F6) |
| Datenbank | bleibt; gelesen wird dafür nichts neu |

#### B3 — Der zugeklappte Kopf von „Dateien“ (V5, V6, F7)

| Frage | Antwort |
|---|---|
| Zugeklappt | `.ahead-acts` und `#acount` sind ausgeblendet. `blockSummary()` liefert für `dateien` „3 Ordner · 12 Videos · 9 Bilder · 4 weitere · 1.122,2 MB“, ohne Klammern (F7) |
| Zahlen | Ordner: alle Ordner des Eintrags. Videos und Bilder nach `kindOf()`. „weitere“: alle übrigen Dateien. Eine Art ohne Datei fällt weg. Die Größe wie in `#acount` |
| Aufgeklappt | wie bisher (V6) |
| Texte | Schlüssel mit Ein- und Mehrzahl für Ordner, Videos, Bilder und weitere Dateien |

#### B4 — Dateien umbenennen (V7, F8, F9)

| Frage | Antwort |
|---|---|
| Ort | „Umbenennen …“ im Menü „…“ der Datei, nicht im Vollbild (F9) |
| Dialog | ein Feld mit dem Namen ohne Endung, die Endung steht fest dahinter. Enter speichert, Esc bricht ab, der Fokus geht zurück auf „…“ |
| Rechte | nur wer hochgeladen hat (`selfOnly()`); sonst 403. Fremde Dateien zeigen den Menüpunkt nicht |
| Route | `PUT /api/attachments/:id` mit `filename`. Der Server nimmt `path.basename()`, hängt die Endung der Datei an, prüft höchstens 200 Zeichen und einen Namen vor der Endung. Antwort: die Angaben des Eintrags wie nach dem Hochladen |
| Gleicher Name | im selben Ordner abgelehnt (F8): 409 mit einer Meldung, dass der Ordner schon eine Datei mit diesem Namen hat. Ohne Ordner zählt die Gruppe ohne Ordner. Groß- und Kleinschreibung zählen dabei nicht |
| Document Server | Umbenennen geht auch bei offener Sitzung; der Editor zeigt den neuen Namen beim nächsten Öffnen |
| Folgen | Herunterladen, Sortieren und Papierkorb nehmen den neuen Namen. Links und Verweise bleiben gültig |
| Sicherheitsprotokoll | kein Eintrag (V7) |

#### B5 bis B7 — Texte und Anleitung (V8, F10, F11)

| Frage | Antwort |
|---|---|
| Ablehnung | `entry.rejectedBy` bekommt Datum und Account als Platzhalter statt „am …“ und „von …“ aus dem Code |
| Aufgabenknopf | Der Titel in `drawHeadCounts()` kommt aus einem Schlüssel mit Zahl und Wort |
| `blockSummary()` | „keine“ und „leer“ über die Sprachdateien (F10) |
| „Eintrag exportieren“ | Der Abschnitt entfällt in `manual.md`, `manual-de.md` und `manual-tr.md` (F11), ebenso seine Zeile im Inhaltsverzeichnis |
| Namen der Anleitung | „Ähnliche Titel:“ statt „Ähnlich:“, „Alle“ statt „Alles“, „Offene Aufgaben“ statt „Offen“; „Verfahren der Ablage“ als Abschnitt der Karte „Bildformate“. Die englische und die türkische Fassung werden an derselben Stelle geprüft |
| `en.json` | `card.user` heißt „Users“ |

#### B8 — Das Stilblatt (V9, F12)

| Frage | Antwort |
|---|---|
| Durchsicht | `public/style.css` nach Abschnitt 3 von `CLAUDE.md`: ein Kommentar bleibt nur, wo der Code eine Frage offenlässt |
| Messtafeln | bleiben im Kommentar (F12) |
| Grenze | `node tools/comments.js --write` senkt sie auf den neuen Stand |

#### B9 — EXIF bei Bildern (V10, F13 bis F15)

| Frage | Antwort |
|---|---|
| Leser | `exif-reader` 2.0.3 (F15) auf `metadata().exif` von `sharp`, aus dem ersten Stück der Datei |
| Felder | Aufnahmezeit (`DateTimeOriginal`, sonst `DateTime`), Kamera (`Make` und `Model`), Objektiv (`LensModel`), Belichtungszeit („1/125 s“), Blende („f/2,8“), ISO, Brennweite (mit Kleinbild-Angabe, wenn die Datei sie trägt) (F13) |
| GPS | nur „Ort in der Datei: ja“ (F14). Koordinaten werden weder gespeichert noch gezeigt |
| Ablage | als `exif` in `attachment_media.info` und `photo_media.info` |
| Dialog | eine eigene Gruppe „Aufnahme“ nach „Bild“. Trägt EXIF eine Aufnahmezeit, entfällt bei Bildern „Aufnahmedatum“ unter „Allgemein“ |
| Bestand | nach dem Update einmal nachgelesen (F4) |
| Fotos des Eintrags | ebenso (F6) |

#### B10 — „Infos“ zu Dokumenten (V11, V12, F16 bis F19)

| Frage | Antwort |
|---|---|
| Menüpunkt | „Infos“ bei Office-, OpenDocument- und PDF-Dateien (F18, F19); Bilder und Videos behalten „Erweiterte Infos“ |
| Gelesen | beim Öffnen des Dialogs über `GET /api/attachments/:id/info`, nicht in der Warteschlange. Eine Office-Datei ändert sich mit jeder Speicherung |
| Aus Kriterion | hochgeladen von, am; geändert vor dem Hochladen (F17); zuletzt gespeichert von, am (V12); Zahl der Speicherungen; vorige Fassung vom |
| Office | `docProps/core.xml`: Titel, erstellt von, erstellt, zuletzt bearbeitet von, geändert. `docProps/app.xml`: Seiten, Wörter, Folien, Programm |
| OpenDocument | `meta.xml`: Titel, erstellt von, erstellt, zuletzt bearbeitet von, geändert, Seiten, Wörter, Programm |
| PDF | Info-Wörterbuch: Titel, Autor, erstellt mit, erzeugt von, erstellt, geändert. Seiten aus dem Seitenbaum, wenn er sich ohne Entpacken lesen lässt |
| Grenzen | ZIP-Einträge über 1 MB werden nicht gelesen, bei PDF nur das erste und das letzte MiB. Was fehlt, steht nicht da |
| Neue Tabelle | `attachment_changes (attachment_id INTEGER PRIMARY KEY REFERENCES attachments(id) ON DELETE CASCADE, file_modified TEXT, saved_at TEXT, saved_by INTEGER REFERENCES users(id) ON DELETE SET NULL)` |
| Letzte Speicherung | Der Rückruf schreibt bei Status 2 und 6 `saved_at` und `saved_by` aus `users[0]`, wenn die Nummer ein Account ist (V12) |
| Hochladen | `uploads.modified` geht als `file_modified` in die neue Tabelle (F17); bestehende Dateien haben den Wert nicht |
| Papierkorb | Die Zeile reist in `content` mit und kommt beim Wiederherstellen zurück |
| Export | nicht im Export; das Austauschformat bleibt 22 |

#### B11 — Filter nach Potenzial und Bewertung (V14, V15, F20 bis F26)

| Frage | Antwort |
|---|---|
| Filter | eine neue Zeile der Filterleiste mit den Gruppen „Potenzial“ und „Bewertung“ (Namen aus dem Vokabular), je „Alle · Keine · Teilweise“ (F22) |
| Bezug | die eigenen Werte (F21): Kriterien der Phase mit einem eigenen Wert über 0, geteilt durch die Zahl der Kriterien der Phase. Jedes Kriterium zählt einmal, ohne Gewicht |
| Keine | kein eigener Wert in der Phase |
| Teilweise | mindestens ein eigener Wert und ein Anteil unter der Schwelle; verglichen wird ohne Runden |
| Ungetestet | zählt bei „Bewertung“ nicht: „Keine“ und „Teilweise“ zeigen nur getestete Einträge (F23). Beim Potenzial zählt jeder Eintrag |
| Schwelle | eine für beide Phasen (F24); ganze Zahl von 1 bis 100, Vorgabe 80 (F25); globale Einstellung `partialShare` |
| Ort | Einstellungen › Bestand, Karte „Bewertung: Kriterien“. Jeder Admin ändert sie (F26); andere Accounts sehen das Feld nicht |
| Potenzial aus | Ist `potentialMode` aus, fehlt die Gruppe „Potenzial“, und ihr gespeicherter Wert gilt als „Alle“ |
| Ohne Kriterien | Hat eine Phase keine Kriterien, fehlt ihre Gruppe ebenso |
| Server | `GET /api/items` liefert je Eintrag die Zahl der eigenen Werte je Phase |
| Ansichten | gespeicherte Ansichten und „Filter zurücksetzen“ nehmen beide Filter mit; jeder zählt als ein aktiver Filter |

---

## 4. Die Bauabschnitte

### BA 1 — Die Tabelle `attachment_changes` (B10)

Tabelle in `schema.js`; Rückruf, Hochladen und Papierkorb schreiben sie;
`roundtrip` und `source` kennen 44 Tabellen.

### BA 2 — Umbenennen (B4)

Route, Prüfung des Namens und des Ordners, Menüpunkt, Dialog, Texte.

### BA 3 — Format und Pixel der Bilder (B1)

Ausrichtung in der Warteschlange, `qAttachments`, `kindText()`,
Vorschaubild, Zeile; Nachlesen des Bestands.

### BA 4 — EXIF (B9)

`exif-reader` in `package.json`, Lesen in der Warteschlange, Gruppe
„Aufnahme“, Fotos des Eintrags.

### BA 5 — Vorschaubilder in der Datei (B2)

`mediaInfoHtml()` mit Hauptbild und Zeile.

### BA 6 — „Infos“ zu Dokumenten (B10)

Leser für Office, OpenDocument und PDF in `attachments.js`, Antwort der
Route, Dialog, Menüpunkt.

### BA 7 — Der zugeklappte Kopf (B3)

Stilblatt, `blockSummary()`, Texte.

### BA 8 — Texte (B5, F10)

`entry.rejectedBy`, `drawHeadCounts()`, „keine“ und „leer“.

### BA 9 — Anleitung und README (B6, B7)

Anleitung und README in drei Sprachen: „Typ“ bei Bildern, „Aufnahme“,
„Infos“, „Umbenennen …“, der zugeklappte Kopf, die Filter „Potenzial“ und
„Bewertung“ mit der Schwelle; „Eintrag exportieren“ fällt; die vier Namen;
`card.user`. README: Abhängigkeit `exif-reader`, die neue Route.

### BA 10 — Das Stilblatt (B8)

Durchsicht, danach `node tools/comments.js --write`.

### BA 11 — Filter nach Potenzial und Bewertung (B11)

Zahl der eigenen Werte je Phase in `GET /api/items`, Einstellung
`partialShare`, Feld in der Karte „Bewertung: Kriterien“, die Filter in
`FILTER_DEFAULT`, `filterNormal()`, `visibleItems()`, `filterNumber()` und
`drawFilters()`, Texte.

### BA 12 — Der Prüfstand

Neues Modul `test/release_054.js`. Je Zusage eine Prüfung und ein Rückbau
in `counterproof.js`. Die Rückbauten werden einzeln gegen ihr Modul gefahren,
mit höchstens vier Spuren (`OFFSET_TRACES` in `test/frame.js`).

### BA 13 — Dokumentation und Zahlen

CHANGELOG englisch, Änderungsprotokoll mit „Vorgaben des Betreibers“,
`Doku/Fahrplan.md`, `Doku/Entwicklung.md` (Tabelle `attachment_changes`),
`package.json` 0.54.0, Fingerprint. Zahlen am fertigen Stand.

---

## 5. Abnahme im Betrieb

1. „Dateien“ als Liste: ein PNG zeigt „PNG · 1920 × 1080“, ein Foto im
   Hochformat „JPEG · 3024 × 4032“. Die Kacheln zeigen „PNG“ und „JPEG“.
2. „Erweiterte Infos“ zu `20D_9141.jpg`: eine Gruppe „Bild“ mit
   „Vorschaubilder in der Datei: 2 (256 × 205)“, eine Gruppe „Aufnahme“ mit
   Kamera, Zeit und Belichtung.
3. Ein Foto vom Telefon mit Ort: „Ort in der Datei: ja“, keine Koordinaten.
4. „Dateien“ zuklappen: nur Zahlen und Größe, keine Bedienelemente.
5. Eine eigene Datei umbenennen: Die Endung bleibt. Derselbe Name im selben
   Ordner wird abgelehnt. Bei einer fremden Datei fehlt der Menüpunkt.
6. Eine Word-Datei im Document Server bearbeiten und speichern. „Infos“
   nennt dich als zuletzt Speichernden, mit Zeit, dazu die Angaben aus der
   Datei.
7. Ein PDF: „Infos“ mit Titel, Programm und Seiten.
8. Einen Eintrag ablehnen, auf Türkisch ansehen: kein „am“ und kein „von“.
9. Die Anleitung in drei Sprachen: kein Abschnitt „Eintrag exportieren“.
10. Fünf Kriterien unter „Bewertung“, Schwelle 80: Unter „Bewertung:
    Teilweise“ steht ein getesteter Eintrag mit drei eigenen Werten, einer mit
    vier nicht. Unter „Bewertung: Keine“ steht kein ungetesteter Eintrag.
11. Die Schwelle auf 90 stellen: Der Eintrag mit vier eigenen Werten steht
    unter „Teilweise“. Ein Account ohne Adminrechte sieht das Feld nicht.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Sortieren nach Format innerhalb einer Art | V3 |
| Umbenennen im Vollbild | F9 |
| Koordinaten aus GPS | F14 |
| Export eines einzelnen Eintrags | F11 |
| „Infos“ zu Textdateien | F19 |
| Gleiche Namen beim Hochladen ablehnen | F8 gilt für das Umbenennen |
| Die Messtafeln des Stilblatts in ein Papier | F12 |
| Fotos des Eintrags umbenennen | B4 gilt für Dateien unter „Dateien“ |
| Filter nach den Werten anderer Accounts | F21 |
| Ein Filterwert „vollständig“ | F22 |
| Anteil nach dem Gewicht der Kriterien | jedes Kriterium zählt einmal (B11) |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Neues Schema nur mit der Tabelle `attachment_changes`, ohne
   Migrationsblock.
3. Die Kommentarregel gilt.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Kommt beim Bau eine Frage auf, die hier nicht beantwortet ist, gilt der
   einfachere Weg, der kein Verhalten ändert; die Frage und der gewählte Weg
   stehen im Änderungsprotokoll.
