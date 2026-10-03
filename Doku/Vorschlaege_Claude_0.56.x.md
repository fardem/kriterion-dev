# Vorschläge von Claude zu 0.56.x

**Stand 3. Oktober 2026, auf 0.56.1.**

Diese Datei sammelt offene Vorschläge aus drei Quellen:

- der Durchsicht des Repositorys vom 2. Oktober 2026
- der Messung des Vollbilds am Telefon vom 3. Oktober 2026
- dem Chat

Erledigtes steht hier nicht. Was gebaut wird, wählt der Betreiber in einer
Fragetafel. Die Nummern (V, F, S) dienen nur der Auswahl.

Prüfstatus je Befund:

- **geprüft**: Claude hat die Stelle selbst im Code nachgelesen.
- **gegengeprüft**: Ein zweiter Agent hat versucht, den Befund zu widerlegen,
  und es ist ihm nicht gelungen. Zeilen und Zahlen sind nach seiner Prüfung
  berichtigt.

Widerlegte Befunde stehen in Abschnitt 4.

---

## 1. Vollbild am Telefon

**Gemessen** am 3. Oktober 2026 mit Chromium 1194 ohne Kopf, mit Emulation
eines Telefons und Touch, an der echten App mit echtem Server:

- 7 Bildschirmgrößen: 360 × 640, 360 × 780, 390 × 844 und 412 × 915 hochkant,
  640 × 360 und 915 × 412 quer, Tablet 768 × 1024
- je 10 Fälle: Fotos hoch, quer und Panorama; Videos in 4K hoch und quer, im
  Eintrag und als Datei mit Proxy; eine Bilddatei; ein langer Dateiname; ein
  Eintrag mit nur einem Bild
- dazu Erweiterte Infos, Zoom, Abspielen, Original, Drehen bei offenem
  Vollbild, Schließen, helles Schema, Türkisch, Schrift 120 %
- zusammen 96 Bildschirmfotos

**Nicht gemessen**: ein echtes Telefon, die Adressleiste von Chrome, die
Zurück-Taste von Android und echtes Wischen. Die beiden letzten sind aus dem
Code beurteilt.

Sechs Prüfer haben Bilder, Messwerte und Code nach Blickwinkeln ausgewertet:
Platz, Kopfzeile, Navigation, Video, Optik, Code. Jeden Befund hat ein
Gegenprüfer angegriffen. Ergebnis: 41 Befunde, 36 bestätigt, 5 widerlegt;
zusammengefasst bleiben 18.

Hochkant passt das Bild in allen 90 Fällen ohne Zoom ganz in die Bühne.

V1 bis V4, V6, V7, V9 und V10 sind mit 0.56.1 gebaut und stehen hier nicht
mehr; die übrigen Nummern bleiben.

### 1.1 Messwerte

Sichtbares Bild in CSS-Pixeln und als Anteil am Bildschirm, gemessen nach dem
Bau von 0.56.1. Der Eintrag im Test hat einen Titel mit 100 Zeichen.

| Gerät | Kopfzeile | Bühne | Video 16:9 | Video 9:16 | Foto 3:4 |
|---|---:|---:|---:|---:|---:|
| 360 × 640 | 120 px | 418 px | 359 × 202 (31 %) | 235 × 418 (43 %) | 314 × 418 (57 %) |
| 360 × 780 | 120 px | 558 px | 359 × 202 (26 %) | 313 × 556 (62 %) | 360 × 480 (62 %) |
| 390 × 844 | 120 px | 632 px | 389 × 219 (26 %) | 355 × 631 (68 %) | 390 × 520 (62 %) |
| 412 × 915 | 70 px | 753 px | 411 × 231 (25 %) | 395 × 702 (74 %) | 412 × 549 (60 %) |
| quer 640 × 360 | 54 px | 306 px | 544 × 306 (72 %) | 172 × 306 (23 %) | 230 × 306 (31 %) |
| quer 915 × 412 | 54 px | 358 px | 636 × 358 (60 %) | 201 × 357 (19 %) | 269 × 358 (26 %) |
| Tablet 768 × 1024 | 70 px | 862 px | 768 × 432 (42 %) | 484 × 860 (53 %) | 646 × 862 (71 %) |

### 1.2 Befunde

| Nr. | Befund | Beleg | Ursache | Vorschlag | Aufwand |
|---|---|---|---|---|---|
| V5 | **Hochkant ist der Titel 0 px breit.** Man sieht nicht, zu welchem Eintrag das Bild gehört; bei Dateien steht der Titel des Eintrags statt des Dateinamens | `412x915-foto-hoch.png`: Titel 21 px, „E…“; an 360 px 0 px | Titel und Leiste teilen eine Zeile; `openLightbox()` bekommt an allen 5 Aufrufen `item.title` | Am Telefon hochkant den Titel als eigene Zeile über der Leiste, klein; bei Dateien den Dateinamen | mittel |
| V8 | **Zoom springt auf 1 : 1 des Originals**, am Telefon 7- bis 27-fach; sichtbar bleiben 1 bis 2 % des Bildes, und zwar die Mitte statt der angetippten Stelle | `412x915-zoom-foto-hoch.png`: Bild 3.000 × 4.000 px auf 412 px | `setZoom()` lädt das Original ohne Größe (`style.css:1514` `max-width: none`) | Zweifach vergrößern um die angetippte Stelle; Pinch-Zoom des Browsers zulassen | mittel |
| V11 | Nach dem Zurückdrehen ins Hochformat stimmt die Größe des Videos, die Steuerleiste von Chromium ist aber schmaler als das Video (312 statt 360 px an 360 × 640) | `360x640-gedreht-zurueck.png`, Pixel des Zeitstrahls | Chromium begrenzt die Leiste nach dem Drehen; `fitPlayer()` und der ResizeObserver arbeiten richtig | zuerst auf einem Android-Telefon nachsehen; bestätigt es sich, nach geänderter Größe `controls` kurz aus- und einschalten | klein |
| V12 | Die Pfeile ‹ › (54 × 54 px) liegen hochkant über Bild und Video, auch während das Video spielt | `navOverContent` in allen Fällen hochkant | `.lb-nav` absolut über der Bühne | Auf Touch ausblenden (Wischen reicht) oder nach 2 s Wiedergabe ausblenden | klein |
| V13 | Pfeile und Bühne beachten `safe-area-inset` nicht; ohne Streifen reicht die Bühne bis in die Gestenleiste | aus dem Code | nur `.lb-top` und `.lb-strip` haben `env(safe-area-inset-*)` | Abstände der Pfeile und unten an der Bühne mit `env()` | klein |
| V14 | Bilddateien laden im Vollbild das Original (3.000 × 4.000 = 12 MP), Fotos des Eintrags die Fassung mit 1.600 px; an 412 × 915 genügen 1,6 MP | Messwerte `natural` | `imageSource()` (`public/app.js:4448–4453`) gibt bei Dateien für `medium` das Original | für Bilddateien eine Fassung mit 1.600 px speichern, das Original erst bei Zoom und Download | mittel |
| V15 | Beim Zoom erscheint unten rechts eine weiße Ecke von 10 × 10 px; zwei Rollbalken von 10 px verkleinern den Ausschnitt | `412x915-zoom-foto-hoch.png`, Pixel 255,255,255 | `::-webkit-scrollbar` ohne `::-webkit-scrollbar-corner` (`style.css:276–279`) | `::-webkit-scrollbar-corner { background: transparent }`; auf Touch die Rollbalken der Bühne ausblenden | klein |
| V16 | Der Platzhalter „WEBM“ auf nicht gewählten Kacheln im Streifen hat 2,06 : 1 | Bildschirmfotos der Dateien | `.lb-ext` in `--muted` auf Kachel mit Deckung .5 | Kachel ohne Standbild nicht abdunkeln oder hellere Schrift | klein |
| V17 | Während „Ganz laden“ wird die Leiste um 72 bis 94 px breiter (Text „geladen n %“), Knöpfe können zwischen den Reihen springen | aus dem Code | `.lb-loaded` vor dem Knopf (`public/app.js:4599`, `4685–4686`) | den Fortschritt in den Knopf schreiben („Abbrechen 45 %“), Knopf mit fester Mindestbreite | klein |
| V18 | ↓ und ⊕ sind Schriftzeichen statt Symbole wie die übrigen Knöpfe; mehrere Knöpfe haben nur `title` und damit am Telefon keinen sichtbaren Namen | `public/app.js:4605–4606` | — | Symbole wie bei ⓘ und 🔗, `aria-label` an jedem Knopf | klein |
| V19 | Die Vorschau im Eintrag (`#viewer`) blättert weiter, wenn beim Wischen ein zweiter Finger dazukommt; im Vollbild ist das mit 0.56.1 behoben | aus dem Code | `touchstart` an `#viewer` (`public/app.js:6403`) kehrt beim zweiten Finger zurück, `swipes` bleibt gesetzt | `swipes` bei jedem `touchstart` neu setzen, wie in `openLightbox()` | klein |


---

## 2. Fehler aus der Durchsicht

Sieben Prüfer haben am 2. Oktober 2026 das Repository gelesen: `server.js` in
zwei Teilen, `public/app.js` in zwei Teilen, Stilblatt und Sprachdateien, die
übrigen Module mit dem Betriebskonzept, und den Stil. Kein Befund ist im
Browser oder am laufenden Server nachgestellt, außer wo es dasteht.

### 2.1 Hoch

| Nr. | Befund | Stelle | Status | Vorschlag |
|---|---|---|---|---|
| F1 | „Standardanordnung wiederherstellen“ legt die Detailansicht lahm: Danach wirft `BLOCKS.closed.includes`, Tags, Sterne, Testtage, Links, Dateien und Kommentare bleiben leer bis zum Neuladen | `public/app.js:9739` setzt `zu: []` statt `closed: []` | geprüft | `closed: []` |
| F2 | Die Rolle „Eigentümer-Admin“ lässt sich über die Oberfläche nicht vergeben; der Server antwortet „Rolle unbekannt“ | `public/app.js:10601`, `10760` schicken `eigentuemer`, `auth.js:131` kennt `owner`; `test/ui_entry.js:727` prüft den falschen Wert | geprüft | `value="owner"`, Prüfung anpassen |
| F3 | Die Anmeldebremse lässt sich umgehen: Parallele Anfragen sehen denselben Zählerstand, die Sperre nach 10 Fehlversuchen greift erst danach. Eine eigene erfolgreiche Anmeldung löscht den Zähler der IP | `server.js:641–650` (zwischen `checkThrottle()` und `noteFailure()` liegt `await`), `auth.js:447` | geprüft | Versuch vor dem `await` zählen; bei Erfolg nur den Zähler des Namens löschen |
| F4 | „Alte Backups“: Jeder Tastendruck in „Mindestens behalten“ oder „Löschen, wenn älter als“ baut das Feld neu. Der Wert wird nicht gespeichert, die Liste zeigt die Vorschau. „Jetzt löschen“ löscht nach dem gespeicherten Wert, also unter Umständen mehr als angezeigt | `public/app.js:12119` → `drawCleanup()`; `server.js:7959` | Code geprüft, im Browser nicht nachgestellt | Felder beim Neuzeichnen stehen lassen, nur die Liste erneuern |

### 2.2 Mittel

| Nr. | Befund | Stelle | Status | Vorschlag |
|---|---|---|---|---|
| F5 | Testtag nach Mitternacht: In Deutschland schlägt „+ Testtag“ zwischen 00:00 und 02:00 mit „Datum in der Zukunft“ fehl, in der Türkei bis 03:00 | Browser lokales Datum (`public/app.js:165`), Server UTC (`server.js:5052`) | geprüft | Server erlaubt das Datum bis UTC-Datum plus 1 Tag |
| F6 | Upload und Wechsel des Eintrags: Nach dem Upload zeichnet Eintrag A seine Bilder in Viewer und Leiste von B; ✕ dort löscht ein Foto aus A. Beim Kommentar ebenso | `public/app.js:6334`, `5896`, `8722` | geprüft | Nach dem `await` prüfen, ob die Ansicht noch zum Eintrag gehört |
| F7 | „Weiter ›“ folgt nicht der Übersicht, sondern dem Bestand in Serverreihenfolge, ohne Filter und Sortierung | `public/app.js:3282` liest `state.items` | geprüft | `visibleItems()` |
| F8 | Fehlt einem Foto das Vorschaubild, endet `GET /api/photos/:id/raw?size=thumb` mit 500 statt mit dem Original | `server.js:3773` `qPhotoBytes.data` statt `qPhotoBytes().data` | geprüft | Klammern ergänzen |
| F9 | Absturz des Servers: Ist der Backup-Datenträger voll oder schreibgeschützt, beendet „Zurückholen“ fehlender Dateien den Prozess | `server.js:5752`, `takeBackupLock()` vor dem `try` | geprüft | in `try` aufnehmen |
| F10 | Das Lockfile eines Backups bleibt nach SIGTERM 24 h stehen; ein Update während eines Backups sperrt Backups für 24 h | SIGTERM-Handler `server.js:8378–8386`, `backup.js:25` | geprüft | Lockfile im SIGTERM-Handler freigeben |
| F11 | Passwort und Code des zweiten Faktors ungebremst für Angemeldete: Mit einer gestohlenen Sitzung lassen sich Passwort und Code raten | `server.js:1117` `ownPasswordMatches()`, `DELETE /api/two-factor`, `PUT /api/account` | geprüft | `checkThrottle()`/`noteFailure()` wie in `/api/confirm` |
| F12 | `backuptool restore 2` nach Abbruch in Schritt 5 oder 6: „Ein zweiter Aufruf mit derselben Auswahl“ spielt ein anderes Backup zurück, weil Schritt 3 ein neues anlegt | `backuptool.js:581`, `644`; Nummern nach Zeit, `backup.js:83` | geprüft | In der Meldung den Dateinamen nennen statt der Nummer |
| F13 | Späte Antworten überschreiben die neue Ansicht. Häufigster Fall: Eintrag öffnen und sofort Zurück; dann steht die Detailansicht unter `#/` | `public/app.js` `renderDetail`, `renderList`, `renderSystem`, `renderFileView` | gegengeprüft | Zähler je Aufruf; nach jedem `await` abbrechen, wenn ein neuerer läuft |
| F14 | Kommentar bearbeiten und Bild anfügen: Der Editor schließt sich, der geänderte Text ist weg | `public/app.js:8595` | gegengeprüft | Entwurf merken und Editor wieder öffnen, oder nur die Bilder neu zeichnen |
| F15 | Doppelklick oder doppeltes Enter legt Eintrag oder Kommentar doppelt an, mit Video auch das Video | `public/app.js:4169`, `4178`, `8707` | gegengeprüft | Knopf während der Anfrage sperren |
| F16 | `keytool.sh`: `find … -exec cp … \;` meldet Erfolg, auch wenn `cp` scheitert; ohne root fehlt `encryption.key` im Pflicht-Backup | `keytool.sh:80`, Meldung `keytool.js:240` | gegengeprüft | `-exec cp -a -t "$ZIEL" {} +` |
| F17 | Die Größe des Exports mit Dateien zählt Kommentarvideos nicht mit; die Warnung zur Größe kann ausbleiben | `public/app.js:173`, `12254` | gegengeprüft | `commentVideos` mitzählen |
| F18 | Ist „Links“ beim Zeichnen zugeklappt, ist die Liste nach dem Aufklappen 20 px hoch | `public/app.js:7246` | gegengeprüft | beim Aufklappen neu messen |
| F19 | Am Telefon ist eine Zeile unter „Benutzer“ etwa 400 px breit; der Name verschwindet, die Liste rollt seitlich | `public/style.css:1322`, `1376–1399` | gegengeprüft (gerechnet) | `.mrow.user` am Telefon umbrechen |
| F20 | Bei 360 px liegt „Von vorn“ am Video unter den Werkzeugen | `public/style.css:703`, `1685` | gegengeprüft | `.vspot` am Telefon unter die Werkzeugreihe |
| F21 | Ein Dialog schließt mit Abbruch, wenn man Text im Feld markiert und die Maus außerhalb loslässt | `public/app.js:373` `openModal` | gegengeprüft | Schließen nur, wenn auch `mousedown` auf dem Hintergrund lag |
| F22 | Läuft die Sitzung bei offenem Vollbild ab, schluckt danach ein verwaister Handler alle Pfeiltasten, auch in der Anmeldung | `public/app.js:588` `showLogin`, `4878` `onKey` | gegengeprüft | `onKey` schließt, wenn das Vollbild nicht mehr im DOM ist |
| F23 | Nach dem Wechsel des Backup-Ordners zeigt „Alte Backups“ den alten Ordner; der Server löscht im neuen | `public/app.js:11906–11916` | gegengeprüft | beide Karten neu zeichnen |
| F24 | Import ohne Platzprüfung für die Dateien: Die Platte kann volllaufen, der Import endet nach langer Arbeit mit 500 | `server.js:6623`, `6888` | gegengeprüft | `spaceShort()` vor dem Verschlüsseln |
| F25 | `keytool.sh` übergibt den neuen Schlüssel in den Argumenten von `docker compose`; `ps` zeigt ihn jedem lokalen Benutzer | `keytool.sh:31` | gegengeprüft | `-e NEW_KEY` ohne Wert, aus der Umgebung |
| F26 | Die Upload-Anzeige liegt am Telefon über dem Menüknopf | `public/style.css:1833–1836` | gegengeprüft | am Telefon unten rechts |

### 2.3 Niedrig

| Nr. | Befund | Stelle | Status |
|---|---|---|---|
| F27 | `.env.before-key-change-*` landet über `COPY . .` im Image | `.dockerignore` nimmt nur `.env` aus | geprüft |
| F28 | Ein leeres Passwortfeld beim Mailversand übernimmt das gespeicherte Passwort auch bei anderem Server | `mail.js:101` | geprüft |
| F29 | Der Hinweis „Keine Suchmaschine eingestellt“ nennt „Bestand“; die Karte steht unter „Installation“ | `de.json:1151` (en, tr ebenso) | geprüft |
| F30 | Feste deutsche Texte: „(du)“, Platzhalter `forum.beispiel.de`, `${V.dayOne} eingetragen` | `public/app.js:10747`, `10474`, `10399`, `7130` | gegengeprüft |
| F31 | Die Sperre „letzter Eigentümer“ greift auch für einen gesperrten Eigentümer | `auth.js:282`, `296`, `340` | gegengeprüft |
| F32 | `PUT /api/items` nimmt einen leeren Titel an und setzt „getestet“ mit `0` oder `null` zurück, obwohl Testtage existieren | `server.js:3590`, `3608` | gegengeprüft |
| F33 | Nach Wiederherstellen eines Eintrags oder Import fehlen Standbild und Dauer bei mkv, avi, wmv, flv | `server.js:6895` | gegengeprüft |
| F34 | Beim Freischalten einer Anfrage geht der Grund eines SMTP-Fehlers verloren | `server.js:1459–1461` | gegengeprüft |
| F35 | Die Vergleichsleiste bleibt beim Verlassen der Übersicht stehen; ihr ✕ wirkt nicht | `public/app.js:4116` | gegengeprüft |
| F36 | Der Zähler der offenen Aufgaben ändert sich beim Abhaken nicht | `public/app.js:4220–4226` | gegengeprüft |
| F37 | Die Suche markiert nach „İ“ den falschen Ausschnitt | `public/app.js:1416–1424` | gegengeprüft |
| F38 | Jeder Ladefehler eines Eintrags heißt „Eintrag unbekannt“, auch ein Netzwerkfehler | `public/app.js:5684–5688`, `9020` | gegengeprüft |
| F39 | Pfeiltaste oder Wischen bei nur einem Element im Vollbild stoppt das Video und bricht „Ganz laden“ ab | `public/app.js:4889`, `4947` | gegengeprüft |
| F40 | Ist der Potenzialmodus aus, sortiert die Liste weiter nach Potenzial, die Auswahl zeigt „Geändert“ | `public/app.js:3052`, `3750` | gegengeprüft |
| F41 | Endet die Konvertierung der Bilder in 1,5 s, bleibt der Knopf gesperrt | `public/app.js:11785–11791` | gegengeprüft |
| F42 | Die Detailansicht zeigt Bedienelemente, die der Server mit 403 ablehnt; danach bleibt die Anzeige geändert | `public/app.js:5724` ff. | gegengeprüft |
| F43 | Bricht der Browser eine Range-Anfrage ab, hängt der Handler, bis die Garbage Collection den FileHandle schließt | `server.js:4501`, `6346`, `5893` | gegengeprüft |
| F44 | Ein Import mit zu alter Datei lässt den Dateideskriptor offen; der Platz bleibt bis zum Neustart belegt | `server.js:6743`, `7005` | gegengeprüft |
| F45 | Nach SIGTERM beim Zurückholen bleibt `upload/<name>.part` liegen | `server.js:5765`, `7598` | gegengeprüft |
| F46 | Scheitert beim Zurückholen aus dem Backup das Umbenennen, löscht der Server die Kopie trotzdem | `server.js:8167–8169` | gegengeprüft |
| F47 | Ohne eigene Wahl gilt die Vorgabesprache, die Anleitung sagt „Browsersprache“ | `server.js:1723`, `manual.md:905` | gegengeprüft |
| F48 | Wer alle Kriterien löscht, hat nach dem Neustart wieder die drei mitgelieferten | `server.js:214–224` | gegengeprüft |
| F49 | Die Suche nach Kategorie findet übersetzte Namen nicht | `server.js:3302` | gegengeprüft |
| F50 | `assignInventory()` gibt bei jedem Laden von `db.js` Dateien ohne Verfasser dem Owner | `db.js:278–305` | gegengeprüft |
| F51 | `.env.example` und `keytool.sh` nennen falsche Texte für Schlüssel und Logzeile | `.env.example:8`, `keytool.sh:90` | gegengeprüft |
| F52 | Reiter der Einstellungen bleiben nach dem Drehen weg | `public/style.css:2212` | gegengeprüft |
| F53 | Die Fehlermeldung zur Aufräumregel nennt ein Feld, das anders heißt | `de.json:1704`, `tr.json:1704` | gegengeprüft |
| F54 | Das Zitiermenü liegt hinter der Kopfzeile, wenn Text direkt darunter markiert wird | `public/app.js:2570` | gegengeprüft |

---

## 3. Stil

| Nr. | Vorschlag | Beleg | Aufwand |
|---|---|---|---|
| S1 | Kontraste im hellen Schema anheben: Fokusrahmen und 33 Ränder in `--accent` mit `--accent-edge` zeichnen | Fokusrahmen 2,61 : 1 auf Weiß, 2,22 : 1 auf `--bg`; Grenze 3 : 1 (geprüft) | klein |
| S2 | Ränder der Eingabefelder mit eigenem Token nahe `--faint` | Rand gegen Karte 1,25 : 1 dunkel, 1,45 : 1 hell (geprüft) | klein |
| S3 | Pfeile ‹ › im Bild (`.vnav`), ▶ und ★ auf Karten mit `--on-photo` statt `--text` | im hellen Schema 1,29 : 1 (geprüft), ▶ 1,30 : 1 (gegengeprüft) | klein |
| S4 | Text nur in `--text`, `--text-2` und `--muted`; `--faint` nur für Trenner und Symbole | `--faint` auf `--surface` 3,21 : 1 dunkel (geprüft); 62 Regeln, `.hint` 92-mal in `public/app.js` | mittel |
| S5 | Knöpfe, die nur bei Hover erscheinen, auch bei Tastaturfokus zeigen (`:focus-within`) | `.mrow .mact`, `.xdel`, `.vtools`, `.vnav`, `.cmt-img .del` (gegengeprüft) | klein |
| S6 | Fokus im Datei- und Ordnermenü sichtbar machen | `.fmenu-item:focus-visible` ohne Linie, Ersatz 1,11 : 1 (gegengeprüft) | klein |
| S7 | Trefferflächen am Telefon auf 40 px über `::after` vergrößern, ohne das Layout zu ändern | Sterne 22,5 px, Tag-Pillen 27 px, „Und/Oder“ 20 px, Punkte der Zeitleiste 12 px | mittel |
| S8 | Einstellungskarten: je Einstellung eine kurze Bezeichnung, darunter höchstens ein Satz; Rest unter „Mehr“ | 81 Absätze `.desc` in 27 Karten; „Darstellung“ 7 Einstellungen, 9 Absätze, rund 750 Zeichen | mittel |
| S9 | Zeilenlänge in breiten Karten auf `72ch` begrenzen | rund 180 Zeichen je Zeile bei 1.300 px | klein |
| S10 | Schriftgrößen auf rund 8 Tokens, Gewichte auf 400, 500, 600, 700 | 51 verschiedene Größen, 35 Angaben unter 0,7 rem, kleinste 0,5 rem; 9 Gewichte | mittel |
| S11 | 141 `style="…"` in `public/app.js` in Klassen; danach kann `'unsafe-inline'` aus `style-src` | 122 davon Abstände | mittel |
| S12 | Hover-Regeln in `@media (hover: hover)` statt Rücknahmen unter `(hover: none)` | Die Rücknahmen passen nicht zu den Ausgangswerten (`.vnav` .86 gegen .82) | mittel |
| S13 | Doppelte Blöcke zusammenfassen: `.lrow`/`.trow`/`.mrow`, `.warn-box`/`.ok-box`; Radius, Deckung und Dauer als Tokens | 41 Gruppen mit gleichem Deklarationsblock | mittel |


---

## 4. Verworfen

Vollbild:

- Der Dialog „Erweiterte Infos“ über dem Vollbild sei an 360 × 640 um 11 px zu
  hoch: Die 11 px sind Innenabstand, der Inhalt passt.
- Der Proxy wechsle ohne Meldung auf das Original: Artefakt der Messung. Der
  Ersatz für ffmpeg schreibt im Test ein MP4 ohne Bilder, und für einen Proxy,
  der nicht spielt, ist der Wechsel vorgesehen (`unplayable()`).
- Die ganz geladene Kopie eines Videos bleibe bis zum Neuladen belegt: So
  festgelegt im Auftrag 0.55.0; die Kopie bleibt, bis ein anderes Video ganz
  geladen oder die Seite neu geladen wird.

Durchsicht:

- **Favorit nach dem Wiederherstellen**: Der Eintrag ist danach Favorit des
  Wiederherstellenden, nicht des Löschenden. Das ist so entschieden und in der
  Anleitung beschrieben.
