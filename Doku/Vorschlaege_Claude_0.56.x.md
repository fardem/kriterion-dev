# Vorschläge von Claude zu 0.56.x

**Stand 3. Oktober 2026, auf 0.56.4.**

Diese Datei sammelt offene Vorschläge aus drei Quellen:

- der Durchsicht des Repositorys vom 2. Oktober 2026
- der Messung des Vollbilds am Telefon vom 3. Oktober 2026
- dem Chat

Erledigtes steht hier nicht. Was gebaut wird, wählt der Betreiber in einer
Fragetafel. Die Nummern (V, F, S) dienen nur der Auswahl.

Mit 0.56.3 sind aus Abschnitt 2 alle Fehler gebaut außer F24, F32, F33, F37,
F42, F44, F45 und F48 bis F50. Mit 0.56.4 sind Paket 3 (Vollbild) und Paket 4
(Kontraste) gebaut, dazu F55. Am 3. Oktober 2026 hat Claude jeden übrigen
Punkt noch einmal bewertet; das Ergebnis steht in der Spalte „Bewertung“:

- **eigene Runde**: braucht eine Entscheidung oder Schema und Server.
- **Bemerkung**: nicht bauen.

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
- dazu Infos, Zoom, Abspielen, Original, Drehen bei offenem
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

V1 bis V4, V6, V7, V9 und V10 sind mit 0.56.1 gebaut, V5, V8, V12, V13, V15
bis V17 und V19 mit 0.56.4. Sie stehen hier nicht mehr; die übrigen Nummern
bleiben.

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

| Nr. | Befund | Beleg | Ursache | Vorschlag | Aufwand | Bewertung |
|---|---|---|---|---|---|---|
| V11 | Nach dem Zurückdrehen ins Hochformat stimmt die Größe des Videos, die Steuerleiste von Chromium ist aber schmaler als das Video (312 statt 360 px an 360 × 640) | `360x640-gedreht-zurueck.png`, Pixel des Zeitstrahls | Chromium begrenzt die Leiste nach dem Drehen; `fitPlayer()` und der ResizeObserver arbeiten richtig | zuerst auf einem Android-Telefon nachsehen; bestätigt es sich, nach geänderter Größe `controls` kurz aus- und einschalten | klein | Bemerkung; erst an einem Android-Telefon prüfen |
| V14 | Bilddateien laden im Vollbild das Original (3.000 × 4.000 = 12 MP), Fotos des Eintrags die Fassung mit 1.600 px; an 412 × 915 genügen 1,6 MP | Messwerte `natural` | `imageSource()` (`public/app.js:4448–4453`) gibt bei Dateien für `medium` das Original | für Bilddateien eine Fassung mit 1.600 px speichern, das Original erst bei Zoom und Download | mittel | eigene Runde: neue Tabelle, Route und Speicher |
| V18 | ↓ und ⊕ sind Schriftzeichen statt Symbole wie die übrigen Knöpfe; mehrere Knöpfe haben nur `title` und damit am Telefon keinen sichtbaren Namen | `public/app.js:4605–4606` | — | Symbole wie bei ⓘ und 🔗, `aria-label` an jedem Knopf | klein | Bemerkung; `title` reicht, ⊕ ist mit 0.56.4 entfallen |


---

## 2. Fehler aus der Durchsicht

Sieben Prüfer haben am 2. Oktober 2026 das Repository gelesen. Am 3. Oktober
2026 hat Claude jeden Befund noch einmal im Code nachgelesen. Gebaut sind sie
mit 0.56.3; hier stehen nur die übrigen.

| Nr. | Befund | Stelle | Bewertung |
|---|---|---|---|
| F24 | Import ohne Platzprüfung für die Dateien: Die Platte kann volllaufen, der Import endet nach langer Arbeit mit 500 | `server.js:6623`, `6888` | eigene Runde; Import mit Platzprüfung, 2 bis 3 Zeilen, selten |
| F32 | `PUT /api/items` nimmt einen leeren Titel an und setzt „getestet“ mit `0` oder `null` zurück, obwohl Testtage existieren | `server.js:3590`, `3608` | Bemerkung; nur über die API, die Oberfläche verhindert beides |
| F33 | Nach Wiederherstellen eines Eintrags oder Import fehlen Standbild und Dauer bei mkv, avi, wmv, flv | `server.js:6895` | Bemerkung; der Browser holt Standbild und Dauer nach |
| F37 | Die Suche markiert nach „İ“ den falschen Ausschnitt | `public/app.js:1416–1424` | Bemerkung; „İ“ in Deutsch und Englisch, selten |
| F42 | Die Detailansicht zeigt Bedienelemente, die der Server mit 403 ablehnt; danach bleibt die Anzeige geändert | `public/app.js:5724` ff. | eigene Runde; 10 bis 15 Zeilen, nur Ärger |
| F44 | Ein Import mit zu alter Datei lässt den Dateideskriptor offen; der Platz bleibt bis zum Neustart belegt | `server.js:6743`, `7005` | eigene Runde; bis 4 GB belegt bis zum Neustart, selten |
| F45 | Nach SIGTERM beim Zurückholen bleibt `upload/<name>.part` liegen | `server.js:5765`, `7598` | Bemerkung; der nächste Versuch überschreibt die Datei |
| F48 | Wer alle Kriterien löscht, hat nach dem Neustart wieder die drei mitgelieferten | `server.js:214–224` | Bemerkung; so gewollt, `test/roundtrip.js` prüft es |
| F49 | Die Suche nach Kategorie findet übersetzte Namen nicht | `server.js:3302` | eigene Runde; nur bei mehrsprachigen Installationen |
| F50 | `assignInventory()` gibt bei jedem Laden von `db.js` Dateien ohne Verfasser dem Owner | `db.js:278–305` | eigene Runde, Entscheidung: „ohne Verfasser“ bleiben lassen oder dem Eigentümer geben |

### 2.1 Neu aus der Prüfung vom 3. Oktober 2026

| Nr. | Befund | Stelle | Bewertung |
|---|---|---|---|
| F56 | Ein Benutzer mit eigenem Account setzt mit seiner Anmeldung den Zähler der Adresse zurück und umgeht so die Sperre; gegen fremde Namen bleibt die Verzögerung von 4 s | `auth.js` `noteSuccess()` | Bemerkung; so entschieden am 3. Oktober 2026 (Änderungsprotokoll 0.56.3) |
| F57 | Derselbe Bestätigungslink der Registrierung lässt sich 24 h lang beliebig oft senden | `auth.js` `setConfirmed` ohne `confirmed_at IS NULL` | Bemerkung; setzt seit 0.56.3 keinen Zähler mehr zurück |

## 3. Stil

| Nr. | Vorschlag | Beleg | Aufwand | Bewertung |
|---|---|---|---|---|
| S4 | Text nur in `--text`, `--text-2` und `--muted`; `--faint` nur für Trenner und Symbole | `--faint` auf `--surface` 3,21 : 1 dunkel (geprüft); 62 Regeln, `.hint` 92-mal in `public/app.js` | mittel | eigene Runde, Entscheidung: die Abstufung von `--faint` fiele weg |
| S7 | Trefferflächen am Telefon auf 40 px über `::after` vergrößern, ohne das Layout zu ändern | Sterne 22,5 px, Tag-Pillen 27 px, „Und/Oder“ 20 px, Punkte der Zeitleiste 12 px | mittel | eigene Runde; am Gerät prüfen, benachbarte Flächen überlappen |
| S8 | Einstellungskarten: je Einstellung eine kurze Bezeichnung, darunter höchstens ein Satz; Rest unter „Mehr“ | 81 Absätze `.desc` in 27 Karten; „Darstellung“ 7 Einstellungen, 9 Absätze, rund 750 Zeichen | mittel | eigene Runde; Textarbeit in 27 Karten und drei Sprachen |
| S9 | Zeilenlänge in breiten Karten auf `72ch` begrenzen | rund 180 Zeichen je Zeile bei 1.300 px | klein | Bemerkung |
| S10 | Schriftgrößen auf rund 8 Tokens, Gewichte auf 400, 500, 600, 700 | 51 verschiedene Größen, 35 Angaben unter 0,7 rem, kleinste 0,5 rem; 9 Gewichte | mittel | Bemerkung; über 100 Stellen, viele Tests auf Zeilen des Stilblatts |
| S11 | 141 `style="…"` in `public/app.js` in Klassen; danach kann `'unsafe-inline'` aus `style-src` | 122 davon Abstände | mittel | Bemerkung; kann den Document Server brechen |
| S13 | Doppelte Blöcke zusammenfassen: `.lrow`/`.trow`/`.mrow`, `.warn-box`/`.ok-box`; Radius, Deckung und Dauer als Tokens | 41 Gruppen mit gleichem Deklarationsblock | mittel | Bemerkung |


---

## 4. Verworfen

Vollbild:

- Der Dialog „Infos“ über dem Vollbild sei an 360 × 640 um 11 px zu
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
