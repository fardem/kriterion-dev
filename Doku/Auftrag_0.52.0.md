# Auftrag 0.52.0 — „Dateien: Gruppieren, Sortieren mit Richtung, Kopfzeile; Erweiterte Infos zu Bildern und Videos; Video ganz laden“

**Aufgestellt am 30. September 2026.** Grundlage sind die Punkte 53 bis 59 in
`Doku/Fehler_und_Ideen.md` und die Nachricht des Betreibers vom selben Tag:
„Du kannst schon mal im Prinzip den Rest bauen. Alles was mit Konvertieren hat
natürlich nicht. Und zwar solltest du auch das Caching nicht wirklich weiter
verändern. Mir ging es dann nur um das Puffern.“ Den Umfang (U1 bis U4) hat der
Betreiber am 30. September 2026 in einer Fragetafel festgelegt. Zu den Angaben
schrieb er danach: „erweiterte Infos kann man bei den Mediendateien JPEG und
Videodateien anzeigen. Dort sollte drin sein Codec, Bitrate, Audio, wie viele
Spuren, welche Bitrate für Audio … und so im Übersicht höchstens welche Codec
da drin ist“ (U5). F1 bis F11 sind am 30. September 2026 in drei Fragetafeln
beantwortet. **Erteilt am 30. September 2026** („Du kannst schon mal im Prinzip
den Rest bauen“), gebaut auf dem Branch, der in der Aufgabe genannt ist.

Zeilennummern gelten für `420d779` (0.51.0).

---

## 0. Vor dem Bau: die offenen Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| U1 | Welche Nummer bekommt die Runde? | 0.52.0, „Einzelne Dateien aus einem Backup zurückholen“ rückt auf 0.53.0 · 0.53.0 | **0.52.0** (Empfehlung) |
| U2 | Punkt 56, Angaben zu Videos, in diese Runde? | ja, mit `mediainfo.js` · später | **ja, mit `mediainfo.js`** (Empfehlung) |
| U3 | Was von Punkt 54 (wie im Windows-Explorer)? | Kopfzeile sortiert · Strg und Umschalt · rechte Maustaste · Doppelklick öffnet | **Kopfzeile sortiert** (Empfehlung) |
| U4 | Punkt 58 und 59 in diese Runde? | 58 beheben, 59 untersuchen · nur 58 · keine | **58 beheben, 59 untersuchen** (Empfehlung) |
| U5 | Was zeigen die Angaben, und wo? | – | **„Erweiterte Infos“ bei Bildern (JPEG) und Videos**: Codec, Bitrate, Ton mit Zahl der Spuren und Bitrate je Spur, Grundangaben; in der Übersicht höchstens der Codec am Vorschaubild; Vorgabe des Betreibers vom 30. September 2026 |
| F1 | Was zeigt die Spalte „Art“, und wonach gruppiert „Nach Typ“? | eine Beschreibung: Video, Bild, PDF, Word, Excel, PowerPoint, Text, Archiv, Sonstige · die Endung wie heute | **eine Beschreibung** (Empfehlung) |
| F2 | Wie verhalten sich die Typgruppen zu den Ordnern? | in jeder Gruppe eigene Typgruppen, die Ordner bleiben · „Nach Typ“ ersetzt die Ordner · nur die Dateien ohne Ordner | **in jeder Gruppe, die Ordner bleiben** (Empfehlung) |
| F3 | Wie stehen „Bearbeiten“ und „Link“ in der Zeile? | als Zeichen ✎ und 🔗 in einer festen Spalte, in jeder Zeile gleich breit · nur beim Überfahren mit der Maus · als Wörter | **als Zeichen in einer festen Spalte** (Empfehlung) |
| F4 | Was steht in der Liste bei einem Video in der Spalte „Art“? | Codec und Länge, etwa „HEVC · 3:12“ · nur die Art wie bei anderen Dateien | **Codec und Länge** (Empfehlung) |
| F5 | Wird das Menü „…“ neu geordnet? | in fünf Gruppen mit Trennlinien nach Abschnitt 2.2 · Reihenfolge wie heute | **in fünf Gruppen** (Empfehlung) |
| F6 | Steht „Öffnen“ im Menü auch bei Bildern und Videos? | ja · nein, wie heute | **ja** (Empfehlung) |
| F7 | Umbenennen für Dateien? | später, als eigener Punkt · in diese Runde, nur eigene Dateien, die Endung bleibt | **später** (Empfehlung); als eigener Punkt in `Doku/Fehler_und_Ideen.md` |
| F8 | Fehlte „Bearbeiten“ in der Listenzeile bei einer Office-Datei? | ja, dann ein Befund zu 0.51.0 · nein oder nicht gesehen · gemeint waren die Kacheln | **nein oder nicht gesehen**; kein Befund |
| F9 | Was steht in den Kacheln am Vorschaubild eines Videos? | der Codec, etwa „HEVC“ · Codec und Bitrate, etwa „HEVC · 100 Mbit/s“ | **der Codec** (Empfehlung) |
| F10 | Wann lädt der Browser ein Video ganz? | beim Abspielen · schon beim Öffnen im Vollbild | **beim Abspielen** (Empfehlung) |
| F11 | Bis zu welcher Größe? | am Rechner bis 2 GB, am Telefon bis 500 MB · überall bis 1 GB · ohne Grenze | **am Rechner bis 2 GB, am Telefon bis 500 MB** (Empfehlung) |

Zu F11: Ein Video mit 100 Mbit/s hat je Minute 750 MB. 500 MB sind dann 40
Sekunden, 2 GB 2 Minuten 40 Sekunden. Größere Videos lädt der Browser wie heute
nur stückweise.

---

## 1. Das Ziel

- Unter „Dateien“ lässt sich nach Name, Datum oder Größe sortieren, jeweils in
  beiden Richtungen. Die Richtung ist ein eigener Knopf wie auf der
  Einstiegsseite.
- Unter „Dateien“ lässt sich nach Typ gruppieren oder ohne.
- Die Liste hat am Rechner eine Kopfzeile. Ein Klick auf Name, Größe oder Datum
  sortiert danach, ein zweiter Klick kehrt die Richtung um.
- In der Listenzeile stehen am Rechner „Bearbeiten“ und „Link“. Zeile und
  Menü „…“ sind auf Sinn geprüft (Abschnitt 2.2) und danach geordnet.
- Zu Bildern und Videos gibt es „Erweiterte Infos“ wie in MediaInfo: Codec,
  Auflösung, Bitrate, Bildrate, Bittiefe, Ton mit Zahl der Spuren und Bitrate je
  Spur, Dauer. Bei Videos steht der Codec in der Übersicht am Vorschaubild.
- Wird ein Video abgespielt, lädt der Browser es ganz, bis zu einer Grenze.
  Danach stockt es nicht mehr, und Springen geht ohne Laden. Am Cache ändert
  sich nichts.
- Der Papierkorb-Test wartet auf die Umlagerung. Der Abbruch von `ui_export`
  ist untersucht.
- Für die nächste Runde liegt ein Messverfahren vor: Wie schnell wandelt der
  Intel N100 des Betreibers ein Video der A6700 um?

---

## 2. Der Stand, geprüft am 30. September 2026

| Stelle | Stand |
|---|---|
| Kopf von „Dateien“ | Auswahl `#asort` mit „Älteste zuerst“, „Jüngste zuerst“, „Name“ neben „Kacheln \| Liste“ (`public/app.js:5466`). Sortiert wird im Browser in `sortedFiles()` und `sortedFolders()` (`public/app.js:7247-7261`) |
| Einstellung | `filesSort` in `PERSONAL_KEYS` (`server.js:454`) und `PICK_SETTINGS` (`server.js:1696`), Werte `oldest`, `newest`, `name` |
| Liste | Spalten Zeichen, Name, Art, Größe, Datum, bei mehreren Accounts Von (`public/style.css:1877-1878`). „Art“ ist die Endung in Großbuchstaben (`fileKind()`, `public/app.js:4852`). Keine Kopfzeile. Am Telefon zwei Zeilen ohne Art und Von (`public/style.css:2550-2556`) |
| Einstiegsseite | Auswahl `#f-sort` und Knopf `#f-sort-dir` (`public/app.js:3655-3710`). Der Knopf nennt die Richtung als Text, etwa „neu → alt“ oder „A → Z“; jede Sortierung hat eine Startrichtung |
| Listenzeile | „Bearbeiten“ nur bei Office-Dateien mit Recht zum Bearbeiten, nicht am Telefon, nicht in den Kacheln (`public/app.js:7090`). „Link auf diese Datei kopieren“ nur im Menü „…“ (`public/app.js:7389`) |
| Menü „…“ | öffnet sich schon mit der rechten Maustaste und mit Umschalt+F10 (`public/app.js:6974-6983`) |
| Videos unter „Dateien“ | spielen im Vollbild (`player.src = playSource(…)`, `public/app.js:4617`), `preload="metadata"`. Der Server liefert Bereiche (HTTP 206, `server.js:4158-4189`) mit `Cache-Control: private, max-age=3600` |
| Content-Security-Policy | `script-src 'self'` ohne `'wasm-unsafe-eval'` (`server.js:315`); WebAssembly ist im Browser gesperrt |
| Angaben zu Bildern und Videos | nur Typ, Größe und bei Videos die Dauer in ganzen Sekunden (`attachment_stills.duration`). Vorschaubilder für Dokumente entstehen in einer Warteschlange nach dem Upload und beim Start und liegen in `attachment_thumbs`, nicht im Export |
| Papierkorb-Test | `test/roundtrip.js` startet den Server (Zeile 5527) und löscht den Eintrag (Zeile 5619). Die Prüfungen ab Zeile 5643 setzen voraus, dass die Umlagerung fertig ist. `relocate()` meldet ihr Ende nicht (`server.js:4559`, `server.js:6678`) |
| `ui_export` | brach bei der Gegenprobe zu 0.51.0 einmal mit „other side closed“ ab. `app.listen()` setzt kein `keepAliveTimeout` (`server.js:7215`); es gilt die Vorgabe von Node, 5 s. Vermutung, noch nicht geprüft: Server und `fetch` im Test schließen und nutzen dieselbe Verbindung gleichzeitig |


### 2.2 Zeile und Menü „…“, geprüft auf Sinn

Wunsch des Betreibers vom 30. September 2026: „eine Plausibilität und
Sinnprüfung … was alles zeigt man in der Dateienzeile unter Dateien und was
alles im Kontextmenü“.

**Die Zeile heute** (Liste am Rechner): Zeichen · Name · Art · Größe · Datum ·
Von · „Bearbeiten“ · „…“.

| Nr. | Befund |
|---|---|
| 1 | Die Spalten verrutschen. Art, Größe und Datum liegen im Raster von `.aface` (`public/style.css:1881`); „Bearbeiten“ steht außerhalb. In Zeilen mit „Bearbeiten“ ist das Raster um die Breite des Knopfs schmaler, die drei Spalten stehen weiter links als in den übrigen Zeilen. Kam mit 0.51.0 |
| 2 | „Art“ wiederholt die Endung. Der Name zeigt sie immer, auch gekürzt (`.aname-tail`) |
| 3 | Die Länge eines Videos steht nur in den Kacheln; die Liste blendet sie aus (`.alist .apic .duration`, `public/style.css:1891`) |
| 4 | „Bearbeiten“ ist ein Wort, „…“ ein Zeichen. Mit „Link“ käme ein drittes Element dazu |

**Das Menü „…“ heute**, in der Reihenfolge von `fileMenu()`
(`public/app.js:7378`): ✓ Bearbeiten durch alle · Bearbeiten · Öffnen · Dieses
Bild als Vorschaubild · Link auf diese Datei kopieren · Herunterladen · Vorige
Fassung wiederherstellen · Verschieben nach … · Datei löschen.

| Nr. | Befund |
|---|---|
| 5 | Eine Einstellung steht ganz oben: „Bearbeiten durch alle“ vor allen Aktionen |
| 6 | „Bearbeiten“ steht vor „Öffnen“ |
| 7 | „Öffnen“ fehlt bei Bildern und Videos, obwohl ein Klick auf die Zeile sie öffnet |
| 8 | Bis zu neun Einträge ohne Gruppen, mit „Angaben“ zehn |
| 9 | Dateien lassen sich nicht umbenennen, Ordner schon („Bearbeiten …“) |
| 10 | „Dieses Bild als Vorschaubild“ setzt im Menü nichts, sondern öffnet das Video im Vollbild; dort wird das Bild gewählt |

In Ordnung: Der Klick auf die Zeile öffnet Bilder und Videos im Vollbild, PDF,
Text und Office in der Vorschau darunter, alles andere mit dem Menü. Die
rechte Maustaste und Umschalt+F10 öffnen das Menü. Am Telefon zwei Zeilen und
„…“. Das Menü der Ordner: „Bearbeiten …“, „Link kopieren“, „Ordner löschen“.

**Vorschlag.** Zeile: Zeichen · Name · Art (Beschreibung, bei Videos mit Länge)
· Größe · Datum · Von · eine feste Spalte mit ✎ und 🔗 · „…“. Menü in fünf
Gruppen, getrennt durch Linien:

1. Öffnen · Bearbeiten
2. Herunterladen · Link auf diese Datei kopieren · Angaben
3. Verschieben nach … · Vorschaubild wählen … (statt „Dieses Bild als
   Vorschaubild“, Befund 10)
4. Vorige Fassung wiederherstellen · ✓ Bearbeiten durch alle
5. Datei löschen

Befund 1 und 10 werden in jedem Fall behoben; der Rest folgt F1 bis F7.

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

U1 bis U5 und F1 bis F11 aus Abschnitt 0. Dazu aus der Nachricht vom
30. September 2026: nichts zum Umwandeln; der Cache bleibt, wie er ist; beim
Video geht es um das Puffern.

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.52.0**, MINOR. Schema: **ja**, eine neue Tabelle `attachment_media`, kein Migrationsblock. Austauschformat: bleibt 22 |
| Sortieren: Bedienung | Die Auswahl `#asort` nennt „Name“, „Datum“, „Größe“. Daneben ein Knopf für die Richtung wie `#f-sort-dir`, mit Text: „A → Z“ und „Z → A“, „alt → neu“ und „neu → alt“, „klein → groß“ und „groß → klein“ |
| Sortieren: Startrichtung | beim Wechsel der Sortierung: Name „A → Z“, Datum „alt → neu“ wie die Vorgabe aus 0.51.0, Größe „groß → klein“ |
| Sortieren: Speicher | `filesSort` nimmt `name_asc`, `name_desc`, `date_asc`, `date_desc`, `size_asc`, `size_desc`; Vorgabe `date_asc`. Gespeicherte Werte aus 0.51.0 gelten weiter: `oldest` als `date_asc`, `newest` als `date_desc`, `name` als `name_asc` |
| Sortieren: Ordner | Dateien ohne Ordner stehen oben. Die Ordner folgen der Sortierung: nach Name, nach Datum wie in 0.51.0, nach Größe mit der Summe ihrer Dateien |
| Gruppieren: Bedienung | eine zweite Auswahl im Kopf von „Dateien“: „Ohne“, „Nach Typ“; je Account in der neuen Einstellung `filesGroup` (`none`, `type`), Vorgabe `none` |
| Gruppieren: Anzeige | je Typ eine Zwischenzeile mit Typ und Zahl, etwa „PDF · 3“; innerhalb der Gruppe gilt die Sortierung; die Typgruppen stehen nach Name. Typ nach F1, Zusammenhang mit den Ordnern nach F2 |
| Kopfzeile | nur in der Liste am Rechner, eine Zeile über allen Gruppen. Name, Größe und Datum sind Knöpfe mit `aria-sort`; der Pfeil ▲ oder ▼ steht an der sortierten Spalte. Art und Von sortieren nicht; nach Typ ordnet „Gruppieren“ |
| Kopfzeile und Auswahl | zeigen dieselbe Sortierung; ein Klick in der Kopfzeile stellt auch Auswahl und Richtungsknopf um |
| Zeile am Rechner | „Link“ für jede Datei, kopiert `fileLink(a)` wie der Menüeintrag. „Bearbeiten“ bleibt unter der Bedingung aus 0.51.0. Form nach F3; beides nur in der Liste, nicht am Telefon, nicht während der Auswahl. Die Spalten stehen in jeder Zeile gleich (Befund 1). Das Menü „…“ bleibt vollständig |
| Menü „…“ | Reihenfolge nach F5, „Öffnen“ nach F6. „Dieses Bild als Vorschaubild“ heißt im Menü „Vorschaubild wählen …“ (Befund 10); im Vollbild bleibt der Name. „Erweiterte Infos“ steht in der Gruppe mit „Herunterladen“ |
| Erweiterte Infos: Bibliothek | `mediainfo.js` (0.3.8, BSD-2-Clause) als Abhängigkeit in `package.json`, auf dem Server. Die Content-Security-Policy bleibt |
| Erweiterte Infos: welche Dateien | Bilder und Videos (U5) |
| Erweiterte Infos: Inhalt | Allgemein: Format, Größe, Gesamtbitrate, Dauer, Aufnahmedatum. Video: Codec und Profil, Auflösung, Bildrate, Bitrate, Bittiefe, Farbunterabtastung, HDR. Ton: Zahl der Spuren, je Spur Codec, Kanäle, Abtastrate, Bitrate, Sprache. Bild: Format, Auflösung, Bittiefe, Farbraum |
| Erweiterte Infos: Bedienung | Eintrag „Erweiterte Infos“ im Menü „…“ öffnet einen Dialog mit den Angaben in Gruppen |
| Erweiterte Infos: Speicher | Die Übersicht braucht den Codec ohne Klick; darum liest der Server die Angaben einmal und legt sie in `attachment_media` ab (Nummer der Datei, Angaben als JSON). Gelesen wird in einer Warteschlange nach dem Upload, nach dem Speichern aus dem Editor und beim Start für Dateien ohne Eintrag, wie bei `attachment_thumbs`. Die Zeile fällt mit der Datei. Nicht im Export |
| Erweiterte Infos: Lesen | stückweise über dieselbe Entschlüsselung wie `sendDiskFile()`; eine Analyse zugleich; die Instanz wird danach freigegeben |
| Erweiterte Infos: Route | `GET /api/attachments/:id/info` mit denselben Rechten wie `/raw`, liefert die Angaben aus `attachment_media`; fehlt der Eintrag noch, liest der Server sofort |
| Erweiterte Infos: Übersicht | In den Kacheln am Vorschaubild eines Videos der Codec (F9), gegenüber der Länge. In der Liste nach F4. Bei Bildern in der Übersicht nichts zusätzlich; die Art nennt das Format |
| Ganz laden: Ablauf | Startet ein Video im Vollbild (nach F10), holt der Browser die ganze Datei mit `fetch` in einen Blob, solange sie unter der Grenze aus F11 liegt. Das Video spielt währenddessen wie heute. Ist der Blob fertig, wechselt die Quelle auf ihn; Stelle und Wiedergabe bleiben |
| Ganz laden: Anzeige | am Video „geladen 45 %“, bis der Blob fertig ist |
| Ganz laden: Ende | Schließen, Wechsel zum nächsten Bild oder Abbruch der Verbindung verwerfen den Blob (`URL.revokeObjectURL`). Nichts bleibt auf dem Gerät |
| Ganz laden: Datensparen | Meldet der Browser `navigator.connection.saveData`, lädt er nicht ganz |
| Ganz laden: welche Videos | jedes Video im Vollbild: Dateien, Fotos und Videos des Eintrags, Kommentare |
| Cache | bleibt: `Cache-Control: private, max-age=3600`, kein `ETag` |
| Papierkorb-Test (58) | wartet vor dem Löschen, bis `qRelocatePending` keine Zeile mehr liefert, höchstens 10 s; die Prüfung an der Datenbank des Tests |
| `ui_export` (59) | Ursache suchen: unter Last nachstellen, dann Keep-Alive von Server und Test prüfen. Ändert die Behebung das Verhalten des Servers, etwa `keepAliveTimeout`, kommt vorher eine Fragetafel |
| Messverfahren | eigenes Papier `Doku/Messverfahren_Umwandlung.md`, Abschnitt 4 |

---

## 4. Das Messverfahren

Gemessen wird auf dem Intel N100 des Betreibers, ohne Kriterion. Ein
Wegwerf-Container mit ffmpeg und dem Intel-Mediatreiber bekommt `/dev/dri` und
einen Ordner mit Videos der A6700. Vorschlag: `lscr.io/linuxserver/ffmpeg`. Die
Alternative ist ffmpeg auf dem Host mit `intel-media-va-driver`.

1. Je Aufnahmeformat, das der Betreiber nutzt, ein Video von mindestens
   2 Minuten: XAVC HS (HEVC), falls genutzt XAVC S 4:2:0 und 4:2:2.
2. `ffprobe` nennt Codec, Profil, Bildformat (`yuv420p10le`, `yuv422p10le`),
   Auflösung, Bildrate und Bitrate.
3. Umwandeln nach 1080p30, H.264 mit 5 Mbit/s, AAC mit 128 kbit/s,
   `-movflags +faststart`: einmal mit Quick Sync (Dekodieren und Kodieren über
   VA-API), einmal nur mit der CPU (`libx264 -preset veryfast`).
4. Je Lauf festhalten: Dauer des Videos, Zeit des Laufs, Faktor (Dauer durch
   Zeit), CPU-Last, Größe des Ergebnisses. Dazu das Ergebnis am Telefon ansehen.
5. Ein Lauf mit 20 Minuten Material zeigt, ob der N100 unter Dauerlast langsamer
   wird.

Das Papier nennt die Befehle zum Kopieren und eine Tabelle zum Ausfüllen. Was
„schnell genug“ heißt, entscheidet der Betreiber mit den Zahlen.

---

## 5. Die Bauabschnitte

### BA 1 — Einstellungen

`filesSort` mit den neuen Werten und der Übernahme der alten, `filesGroup` neu
in `PERSONAL_KEYS` und `PICK_SETTINGS`; `GET` und `PUT /api/settings`.

### BA 2 — Sortieren und Gruppieren unter „Dateien“

`sortedFiles()` und `sortedFolders()` nach Sortierung und Richtung; die
Auswahl „Gruppieren“, die Zwischenzeilen nach F1 und F2; Kacheln und Liste;
laufende Uploads bleiben am Ende ihrer Gruppe.

### BA 3 — Kopfzeile der Liste

Kopfzeile über den Gruppen, Knöpfe mit `aria-sort`, Pfeil, Abgleich mit
Auswahl und Richtungsknopf; nicht am Telefon, nicht in den Kacheln.

### BA 4 — Zeile und Menü „…“

Feste Spalte für „Bearbeiten“ und „Link“ nach F3, die Spalten in jeder Zeile
gleich (Befund 1); Art und Länge nach F1 und F4; das Menü nach F5 und F6 mit
Trennlinien in `openFileMenu()`; „Vorschaubild wählen …“ (Befund 10). Bei F8
„ja“ zuerst den Befund suchen und beheben.

### BA 5 — Erweiterte Infos

`mediainfo.js` einbinden; Tabelle `attachment_media` in `schema.js`; Warteschlange
nach dem Upload und beim Start; Route `/info`; Menüeintrag und Dialog; Codec am
Vorschaubild nach F9 und in der Liste nach F4.

### BA 6 — Video ganz laden

Im Vollbild nach F10 und F11, mit Anzeige, Ende und Datensparen wie in
Abschnitt 3. In Chromium gemessen: bis zu welcher Größe der Blob hält.

### BA 7 — Prüfstand: Punkt 58 und 59

Papierkorb-Test wartet auf die Umlagerung. `ui_export` untersuchen, Befund ins
Änderungsprotokoll.

### BA 8 — Messverfahren

`Doku/Messverfahren_Umwandlung.md` nach Abschnitt 4.

### BA 9 — Texte

Neue Schlüssel in `de.json`, `en.json`, `tr.json`: Sortierung, Richtungen für
die Größe, Gruppieren, Kopfzeile, die Arten nach F1, „Link“, „Vorschaubild
wählen …“, „Erweiterte Infos“ und der Dialog, „geladen 45 %“.

### BA 10 — Der Prüfstand

Neues Modul `test/release_052.js`, eingetragen in `MODULE` in `testbench.js`.
Je Zusage ein Rückbau in `counterproof.js`. Für die Angaben ein kleines MP4,
und ein kleines JPEG, die der Test selbst zusammensetzt.

### BA 11 — Dokumentation und Zahlen

`manual-de.md` (Sortieren, Gruppieren, Kopfzeile, Erweiterte Infos, Video ganz
laden), README (neue Abhängigkeit, Route, neue Tabelle), `CHANGELOG.md`, Änderungsprotokoll,
`Doku/Fahrplan.md`, `Doku/Fehler_und_Ideen.md`, Version 0.52.0, Fingerprint.

---

## 6. Abnahme im Betrieb

1. Unter „Dateien“ nach Größe sortieren, Richtung umkehren, Seite neu laden:
   Sortierung und Richtung bleiben, auch an einem anderen Gerät.
2. „Nach Typ“ wählen: Typgruppen wie nach F1 und F2. Das Menü „…“ einer Datei
   zeigt die Gruppen nach F5.
3. In der Liste auf „Datum“ in der Kopfzeile klicken, noch einmal klicken: die
   Richtung kehrt sich um, Auswahl und Knopf zeigen dasselbe.
4. In der Liste „Link“ an einer Datei: der Link steht in der Zwischenablage.
   Art, Größe und Datum stehen in allen Zeilen untereinander, auch neben einer
   Office-Datei mit „Bearbeiten“.
5. „Erweiterte Infos“ an einem Video der A6700: Codec HEVC, 3840 × 2160,
   Bildrate und Bitrate wie in der Kamera eingestellt, Ton mit Zahl der Spuren.
   In den Kacheln steht „HEVC“ am Vorschaubild, auch bei Videos von vor dem
   Update.
6. Ein Video von 1 bis 2 Minuten über eine langsame Verbindung abspielen:
   „geladen … %“ läuft bis 100, danach springt es ohne Laden.
7. Ein Video über der Grenze: spielt wie heute, ohne „geladen … %“.
8. Das Messverfahren auf dem N100 durchführen und die Tabelle ausfüllen.

---

## 7. Was nicht dazugehört

| | Grund |
|---|---|
| Umwandeln, zweite Fassung für das Telefon | Vorgabe des Betreibers; erst nach dem Messverfahren |
| Cache länger, `ETag` | Vorgabe des Betreibers |
| Auswahl mit Strg und Umschalt, Doppelklick zum Öffnen | U3 |
| Menü mit der rechten Maustaste | gibt es schon |
| Einzelne Dateien aus einem Backup zurückholen | U1: 0.53.0 |

---

## 8. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Neues Schema nur mit der Tabelle `attachment_media`. Die neuen
   Einstellungen liegen in `user_settings`.
3. Die Kommentarregel gilt.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Kommt eine Frage auf, die hier nicht beantwortet ist, wird sie als
   Fragetafel gestellt. Antwortet niemand, gilt der einfachere Weg, der kein
   Verhalten ändert.
