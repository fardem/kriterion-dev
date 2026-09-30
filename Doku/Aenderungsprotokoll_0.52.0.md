# Änderungsprotokoll 0.52.0 — „Dateien: Gruppieren, Sortieren mit Richtung, Kopfzeile; Erweiterte Infos; Video ganz laden“

**Gebaut am 30. September 2026 auf 0.51.0. Fingerprint `a4d2ab5e`, davor
`7ace25ed`.**

Nach `Doku/Auftrag_0.52.0.md` und dem Eintrag 0.52.0 im Fahrplan. Schema: ja,
die Tabelle `attachment_media`, kein Migrationsblock. Austauschformat: bleibt
22. Routen: eine neue, `GET /api/attachments/:id/info`. Neue Abhängigkeit:
`mediainfo.js` 0.3.8 (BSD-2-Clause) mit 15 weiteren Paketen. Neue Einstellung
je Account: `filesGroup`.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 30. September 2026 | „Du kannst schon mal im Prinzip den Rest bauen. Alles was mit Konvertieren hat natürlich nicht. … das Caching nicht wirklich weiter verändern. Mir ging es dann nur um das Puffern.“ |
| 30. September 2026 | U1: Die Runde heißt 0.52.0; „Einzelne Dateien aus einem Backup zurückholen“ rückt auf 0.53.0 |
| 30. September 2026 | U2: Punkt 56 in diese Runde, mit `mediainfo.js` |
| 30. September 2026 | U3: Von Punkt 54 nur die Kopfzeile, die sortiert |
| 30. September 2026 | U4: Punkt 58 beheben, Punkt 59 untersuchen |
| 30. September 2026 | U5: „Erweiterte Infos“ bei Bildern (JPEG) und Videos: Codec, Bitrate, Ton mit Zahl der Spuren und Bitrate je Spur, Grundangaben; in der Übersicht höchstens der Codec am Vorschaubild |
| 30. September 2026 | F1: „Art“ ist eine Beschreibung: Video, Bild, PDF, Word, Excel, PowerPoint, Text, Archiv, Sonstige |
| 30. September 2026 | F2: Typgruppen in jeder Gruppe, die Ordner bleiben |
| 30. September 2026 | F3: „Bearbeiten“ und „Link“ als ✎ und 🔗 in einer festen Spalte |
| 30. September 2026 | F4: Bei Videos steht in „Art“ Codec und Länge, etwa „HEVC · 3:12“ |
| 30. September 2026 | F5: Das Menü „…“ in fünf Gruppen mit Trennlinien |
| 30. September 2026 | F6: „Öffnen“ auch bei Bildern und Videos |
| 30. September 2026 | F7: Dateien umbenennen später, als Punkt 60 |
| 30. September 2026 | F8: „Bearbeiten“ fehlte in der Listenzeile nicht; kein Befund zu 0.51.0 |
| 30. September 2026 | F9: In den Kacheln der Codec am Vorschaubild |
| 30. September 2026 | F10: Ganz geladen wird beim Abspielen |
| 30. September 2026 | F11: Grenze am Rechner 2 GB, am Telefon 500 MB |
| 30. September 2026 | Punkt 59: nur den Prüfstand ändern; der Server behält `keepAliveTimeout` (Fragetafel während des Baus) |
| 30. September 2026 | Die 60 neuen und angepassten Rückbauten gezielt gegen ihr Modul prüfen; keine volle Gegenprobe (Fragetafel während des Baus) |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.51.0.

| | 0.51.0 | 0.52.0 |
|---|---:|---:|
| Tabellen | 41 | **42** |
| Schreibende Routen | 89 | 89 |
| Routen insgesamt | 124 | **125** |
| Ausgelieferte JavaScript-Dateien | 18 | 18 |
| Abhängigkeiten in `package.json` | 5 | **6** |
| Pakete aus `npm install` | 157 | **172** |
| Zeilen `server.js` | 7.264 | **7.393** |
| Zeilen `public/app.js` | 11.849 | **12.070** |
| Schlüssel je Sprachdatei | 1.359 | **1.410** |
| Regelzeilen des Stilblatts | 1.955 | **1.994** |
| Protokollzeilen | 74 in sieben Dateien | **75** in sieben |
| Kommentarzeilen | 7.009 in 51 Dateien | **7.040 in 52** |
| Dateien des Prüfstands samt `counterproof.js` | 32 | **33** |
| Rückbauten | 1.431 | **1.482** |
| Prüfungen im Prüfstand | 7.912 | **7.975** |

Pakete: 0.51.0 nannte 157. Mit `mediainfo.js` kommen 16 dazu. Dieselbe
Zählung ohne sie ergibt heute 156, eines weniger als die Angabe von 0.51.0.

Die Obergrenzen der Kommentarzeilen steigen: `server.js` 993 → 1.003
(Warteschlange und Route der Erweiterten Infos: eine Analyse zugleich,
Umlagerung während des Lesens, neu vergebene Nummer), `public/app.js`
1.157 → 1.164 (Endungen wie in `attachments.js`, Grenze und Chromium-Messung
beim Ganz-Laden, Folge nach Typ), `attachments.js` 45 → 48 (Einheiten der
Angaben, Leser und Freigabe der Instanz), `public/style.css` 522 → 524
(feste Spalte, Herkunft von 11 px und 116 px), `test/frame.js` 121 → 122
(Wiederholung eines Abrufs); neu ist `test/release_052.js`.

---

## 3. Was gebaut ist

**Einstellungen** (`server.js`). `filesSort` nimmt `name_asc`, `name_desc`,
`date_asc`, `date_desc`, `size_asc`, `size_desc`, Vorgabe `date_asc`.
Gespeicherte Werte aus 0.51.0 liest `pick()` über `alias` weiter: `oldest` als
`date_asc`, `newest` als `date_desc`, `name` als `name_asc`; `PUT` nimmt sie
nicht mehr an. `filesGroup` (`none`, `type`, Vorgabe `none`, sonst 400 mit
`server.groupUnknown`) steht in `PERSONAL_KEYS` und `PICK_SETTINGS`; `GET`
und `PUT /api/settings` nennen es.

**Sortieren** (`public/app.js`). `FILES_SORT = { key, asc }`, `FILES_SORTS`
mit Wort, beiden Richtungen und Startrichtung je Sortierung. `#asort` nennt
„Name“, „Datum“, „Größe“; `#asort-dir` daneben kehrt um und nennt die Richtung
wie `#f-sort-dir` auf der Einstiegsseite. `sortedFiles()` über `FILE_ORDER`,
bei gleichem Wert nach `id`; `sortedFolders()` nach Name, nach Datum wie in
0.51.0, nach Größe mit der Summe der Dateien. Gespeichert wird
`<Sortierung>_<Richtung>`.

**Gruppieren.** `#agroup-pick` mit „Nicht gruppiert“ und „Nach Typ
gruppiert“. `kindOf()` bestimmt die Art aus Vorschauart, Typ und Endung,
`shownFiles()` ordnet nach Art (Name der Art, „Sonstige“ zuletzt) und behält in
jeder Art die Sortierung. `drawAtts()` setzt vor jede Art eine Zeile
`.akindhead` mit „Art · Zahl“, in der Gruppe ohne Ordner und in jedem Ordner.
`showFile()` blättert im Vollbild in derselben Folge.

**Kopfzeile.** `.acols` steht als erstes Kind von `#atts` über allen Gruppen:
Name, Größe und Datum sind Knöpfe, Art und „Hochgeladen von“ nicht.
`drawSortControls()` hält Auswahl, Richtungsknopf und Kopfzeile gleich; ein
Klick auf die sortierte Spalte kehrt um, auf eine andere sortiert in deren
Startrichtung. Das Stilblatt zeigt sie nur in der Liste und nicht am Telefon.

**Zeile.** Jede Dateizeile trägt `.aacts` mit `.aedit` (✎) und `.alink` (🔗)
vor „…“, als Raster aus zwei Zellen zu 36 px; ✎ steht unter der Bedingung aus
0.51.0, 🔗 an jeder Datei, beide nicht während der Auswahl. Weil die Spalte in
jeder Zeile gleich breit ist, stehen Art, Größe und Datum untereinander
(Befund 1). „Art“ zeigt `kindText()`, beim Video Codec und Länge.

**Menü „…“.** `fileMenu()` baut fünf Gruppen, `openFileMenu()` setzt
dazwischen `.fmenu-line` mit `role="separator"`. „Öffnen“ steht auch bei
Bildern und Videos und öffnet das Vollbild; „Vorschaubild wählen …“ ersetzt im
Menü „Dieses Bild als Vorschaubild“ (Befund 10), im Vollbild bleibt der Name.

**Erweiterte Infos.** `attachments.js`: `mediaKind()` (Bild oder Video nach der
Endung), `mediaFacts(size, read)` mit einer Instanz von `mediainfo.js` je
Datei, danach `close()`, und `mediaSummary()`, das aus der Ausgabe nur die
Angaben des Dialogs nimmt. `server.js`: `readMediaOf()` liest Dateien auf der
Platte stückweise über `attachments.readChunk()`, Dateien in der Datenbank mit
`substr(data, …)`; `makeMedia()` legt das Ergebnis als JSON in
`attachment_media` ab. Die Warteschlange (`MEDIA_WAITING`, `mediaSoon()`,
`startMedia()`) läuft nach dem Upload, nach einem Import und beim Start;
stündlich versucht `mediaAgain()` die Dateien aus `MEDIA_FAILED` wieder.
`inMediaTurn()` lässt Warteschlange und Route nacheinander lesen.
`GET /api/attachments/:id/info` liefert die Zeile oder liest sofort; 404 für
eine andere Datei, 500 mit `server.mediaUnreadable`, wenn die Datei fehlt.
`qAttachments` liest den Codec mit `json_extract()`; ein Video trägt `codec`
und `infoSoon`, der Browser fragt dafür wie bei den Vorschaubildern nach 3, 6,
12 und 24 s nach. Dialog: `showMediaInfo()` öffnet sofort mit „Wird gelesen …“
und zeigt die Gruppen aus `mediaInfoHtml()`; Esc gibt den Fokus an „…“ zurück.
In den Kacheln steht der Codec in `.acodec` links unten am Vorschaubild.

**Video ganz laden** (`openLightbox()`). Beim Ereignis `play` holt
`loadWhole()` die Datei mit `fetch(…, { cache: 'no-store' })`, teilt den Rumpf
mit `tee()` und legt ihn mit `Response.blob()` ab; der zweite Zweig zählt für
„geladen 45 %“ in `.lb-loaded`. Größer als `WHOLE_BYTES()` (2 GB, am Telefon
500 MB), nach `size` der Datei oder nach `Content-Length`, oder mit
`saveData`: kein Abruf. Ist der Blob so groß wie die Datei und lesbar, wechselt
die Quelle; Stelle und Wiedergabe bleiben. Blättern, Schließen und ein Fehler
brechen den Abruf ab und geben die Adresse des Blobs frei.

**Prüfstand.** Punkt 58 und 59, Abschnitt 5.

**Texte.** 51 Schlüssel dazu, zwei entfernt (`entry.filesSortOldest`,
`entry.filesSortNewest`), in drei Sprachen.

**Dokumentation.** README: Funktionen, `mediainfo.js`, die Route, die Lizenzen
der Pakete. Handbuch: Liste, Sortieren, Gruppieren, Menü, Erweiterte Infos,
Video ganz laden. `Doku/Messverfahren_Umwandlung.md` (BA 8) ist mit dem
Auftrag gekommen.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| `aria-sort` an den Knöpfen der Kopfzeile | `aria-pressed` und die Richtung im `aria-label` | `aria-sort` gilt nur für Spaltenköpfe einer Tabelle; die Liste ist keine |
| Wörter der Auswahl „Gruppieren“ | „Nicht gruppiert“ und „Nach Typ gruppiert“ statt „Ohne“ und „Nach Typ“ | die Auswahl steht ohne sichtbare Beschriftung im Kopf |
| Spalte „Von“ in der Kopfzeile | „Hochgeladen von“ | „Von“ allein ist ein Füllwort; der Prüfstand lässt es nicht zu |
| Nach dem Speichern aus dem Editor | keine neue Lesung | der Editor öffnet keine Bilder und Videos |
| Angaben bei Bildern in der Übersicht | keine; „Art“ nennt „Bild“ | F1; die Endung steht im Namen |
| Aufnahmedatum | `Recorded_Date`, sonst `Encoded_Date` von MediaInfo | MediaInfo liest aus JPEG kein EXIF-Datum; bei Videos steht es im `mvhd`-Kasten |
| HDR | `HDR_Format`, sonst `transfer_characteristics` PQ oder HLG | HLG trägt kein `HDR_Format` |
| Codec in der Übersicht | Name aus MediaInfo, etwa „HEVC“ und „AVC“ | wie im Dialog und in MediaInfo |
| Datei fehlt oder wird während des Lesens umgelagert | keine Zeile, `MEDIA_FAILED`, stündlich neu; der Browser fragt nicht weiter | eine leere Zeile hielte einen vorübergehenden Fehler fest |
| Lesen am Rand eines Stücks | das zuletzt entschlüsselte Stück von 1 MiB bleibt | MediaInfo liest in Stücken zu 256 KiB; jedes Stück wird so einmal entschlüsselt |
| Blob prüfen, bevor die Quelle wechselt | Größe gleich `Content-Length` und das letzte Byte lesbar | Chromium ohne Profil liefert bei 2 GB einen Blob mit Größe, aber ohne lesbare Bytes (Messung unten) |
| Doppelter Abruf während des Ladens | hingenommen | das Video spielt wie bisher über Bereiche, der Blob kommt über einen zweiten Abruf; ein gemeinsamer Weg bräuchte Media Source Extensions |
| Folge im Vollbild bei „Nach Typ“ | wie die Anzeige | ← und → sollen dem folgen, was auf dem Bildschirm steht |

**Blob in Chromium.** Gemessen am 30. September 2026 mit Chromium
141.0.7390.37 (Playwright), Linux, 16 GB Arbeitsspeicher, derselbe Weg wie
`loadWhole()` (`fetch`, `tee()`, `Response.blob()`), eine Datei aus
Nullbytes über localhost. „Ohne Profil“ entspricht einem privaten Fenster.

| Größe | ohne Profil | mit Profil | Speicher des Browsers höchstens |
|---|---|---|---:|
| 1 GB | hält, 6,2 s | hält, 5,5 s | 1,6 GB |
| 1,5 GB | hält, 9,0 s | hält, 9,5 s | 2,2 GB |
| 1.950 MB | hält, 9,4 s | – | 2,6 GB |
| 2 GB | Blob nicht lesbar (`NotReadableError`) | hält, 13,0 s | 2,8 GB |
| 3 GB | `Failed to fetch` | hält, 22,7 s | 3,6 GB |

Am Telefon ist nicht gemessen.

---

## 5. Der Prüfstand

Neues Modul `test/release_052.js` auf der Portbasis 7340, eingetragen hinter
`release_051`. Das MP4 für die Erweiterten Infos setzt der Test aus Kästen
zusammen (HEVC 3840 × 2160, zwei Tonspuren, Datum), das JPEG mit `sharp`.

| Gruppe | Prüfungen |
|---|---:|
| Dateien sortieren und gruppieren: die Einstellungen | 3 |
| Erweiterte Infos: Warteschlange nach dem Upload und Route | 7 |
| Erweiterte Infos: sofort, beim Start, ohne Datei und mit der Datei geloescht | 5 |
| Erweiterte Infos: Quelltext | 4 |
| Sortieren mit Richtung | 5 |
| Kopfzeile der Liste | 6 |
| Nach Typ gruppiert | 5 |
| Zeile: Art, Bearbeiten und Link | 6 |
| Menü „…" in fünf Gruppen | 4 |
| Erweiterte Infos: Dialog und Codec am Vorschaubild | 8 |
| Video ganz laden | 9 |

**Punkt 58, der Papierkorb-Test.** `test/roundtrip.js` wartet vor dem
Ausgangsstand und dem Löschen, bis die Datenbank des Tests keine Datei ohne
Zeile in `disk_files` mehr nennt, höchstens 10 s; eine eigene Prüfung meldet,
wenn die Umlagerung nicht fertig wird.

**Punkt 59, `ui_export`.** Nachgestellt mit einem Server in eigenem Prozess
(Vorgabe von Node: `keepAliveTimeout` 5 s) und `fetch` im Testprozess, je drei
Versuche:

| Pause nach dem letzten Abruf | Event Loop des Tests steht | gescheitert |
|---|---|---:|
| 3 bis 6 s | nie oder die letzten 1,5 s | 0 von 3 |
| 4 bis 5,5 s | ab 2 s | 0 von 3 |
| 7 s | ab 2 s | **3 von 3, `UND_ERR_SOCKET` „other side closed“** |
| 7 s, Server mit `keepAliveTimeout` 65 s | ab 2 s | 0 von 3 |

Steht der Testprozess länger, etwa bei einem `spawnSync` unter der Last der
Gegenprobe, läuft die eigene Frist von `fetch` für ruhende Verbindungen nicht
ab; der Server hat die Verbindung nach 5 s geschlossen, und der nächste Abruf
geht über den geschlossenen Socket. Behoben im Prüfstand (Vorgabe des
Betreibers): `test/frame.js` wiederholt einen Abruf einmal, wenn er mit
`UND_ERR_SOCKET` scheitert. Mit der Wiederholung scheitert der Nachbau mit 7 s
nicht mehr (0 von 3).

**Angepasst:** `test/roundtrip.js` (sechzehn persönliche Schlüssel,
`filesSort: 'name_asc'` und `filesGroup`, 36 lesende Routen, sechs
Abhängigkeiten, 42 Tabellen, Punkt 58), `test/release_045.js` und
`test/release_046.js` (Folge im Menü, „Vorschaubild wählen …“),
`test/release_051.js` (Sortieren mit den neuen Werten und dem Richtungsknopf,
✎ als Zeichen in `.aacts`), `test/source.js` (36 lesende Routen, 125 Routen,
1.994 Regelzeilen, 75 Protokollzeilen, 194 Zuweisungen an `innerHTML`, die
Anweisung mit `substr(data, ?, ?)`, 52 und 33 Dateien), `test/ui_language.js`
(`Content-Length`), `test/frame.js` (die neue Route, die Wiederholung),
`test/selfcheck.js` (Grenzwerte, 52 Dateien), `testbench.js` (`release_052`).

**Rückbauten.** 1528 bis 1578 neu, einer je Zusage. Neu gefasst, weil der Code
umgebaut ist: 1232, 1262, 1268, 1310 (Menü), 1512, 1519, 1522, 1523 (Sortieren),
1526 (Spalte statt Knopf).

Gefahren mit einem Treiber, der je Rückbau eine Kopie des Arbeitsbaums anlegt
und nur das Modul der erwarteten Gruppe laufen lässt: 1528 bis 1578 an
`test/release_052.js`, 1232 an `test/release_042.js`, 1262 bis 1268 an
`test/release_043.js`, 1310 an `test/release_045.js`, 1512 bis 1526 an
`test/release_051.js`. **Alle rot** in der erwarteten Gruppe. Eine volle
Gegenprobe ist nicht gefahren (Vorgabe des Betreibers).

Der volle Lauf vor dem Push: **7.975 von 7.975** Prüfungen bestanden.

---

## 6. Nicht geprüft und offen

- Echte Videos der A6700: Die Erweiterten Infos sind mit einem MP4 aus Kästen
  und einem WebM (VP8) geprüft. Was MediaInfo aus XAVC HS und XAVC S liest,
  zeigt die Abnahme im Betrieb (Auftrag, Abschnitt 6, Punkt 5).
- Ganz laden am Telefon: gemessen ist nur Chromium am Rechner. Safari auf dem
  iPhone und Chrome unter Android sind nicht geprüft.
- Die Dauer der Warteschlange nach dem Update bei vielen großen Videos ist
  nicht gemessen.
- Das Messverfahren für den N100 führt der Betreiber durch.
