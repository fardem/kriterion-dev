# Änderungsprotokoll 0.56.1 — „Filter „Eigene Werte“, Vollbild am Telefon“

**Gebaut am 3. Oktober 2026 auf 0.56.0 mit dem Nachtrag zum Prüfstand
(`3c57a9a`). Fingerprint `a8fe80d0`, davor `a161550c`.** PATCH.

Schema: nein. Austauschformat: bleibt 22. Routen: keine neue. Am Server ändert
sich nichts. Neue Sprachschlüssel: `list.ownValues` und `list.ownValuesHint`.
Kein neuer Vorgang im Sicherheitsprotokoll, keine neue Abhängigkeit.

Grundlage ist `Doku/Auftrag_0.56.1.md` mit den Punkten B1 bis B8 und den
Fragen F1 bis F7.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 2. Oktober 2026 | „kannst du mal unseren repo durchgehen und mal nahc logischen fehler im style, in den funktionen oder im konzept suchen. das ergebnis nicht nach github laden.“ Dazu: „und auch vom style her. ob es verbesserungsmöglichkeit gäbe“ |
| 2. Oktober 2026 | Zum Filter Potenzial/Bewertung, mit zwei Bildschirmfotos: „eine besser emöglichkeit suchen wie wir das hinbekommen ohne das wir da eine zeile vberlieren“ |
| 2. Oktober 2026 | Fragetafel: eine Gruppe „Eigene Werte: Keine · Teilweise“ am Ende der Statuszeile, folgt dem Status (Empfehlung); gebaut als 0.56.1 nach der Durchsicht (Empfehlung) |
| 3. Oktober 2026 | „Sammel deine Vorschläge im Doku Ordner Vorschläge claude 0.56.x oder so“ und „Insbesondere schau dir die vollbild funktion an ob sie richtig dargestellt wird. Auf mobil und hochkant“ |
| 3. Oktober 2026 | Fragetafel: Höchstwert der Bitrate bleibt 10 Mbit/s (Empfehlung); in 0.56.1 kommen aus den Vorschlägen V1 bis V4, V6, V7, V9 und V10 (Empfehlung), keine Fehler aus der Durchsicht und kein Stil; die Vorschlagsdatei kommt mit 0.56.1 ins Repository (Empfehlung); PR #282 bis zum Merge beobachten (Empfehlung) |
| 3. Oktober 2026 | „Dinge die schon erledigt bitte nicht dort aufnehmen“: Die Vorschlagsdatei enthält nur Offenes |
| 3. Oktober 2026 | Zwei Fragetafeln zum Auftrag, F1 bis F7, jede mit der Empfehlung: alte Filterwerte entfallen; die Gruppe heißt immer „Eigene Werte“; ohne Potenzialmodus fallen ungetestete Einträge heraus; quer weicht der Streifen; kein Wischen auf dem Video; 🗑 vorn in der Leiste; neben das Bild schließt nur die Maus |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen `3c57a9a`.

| | 0.56.0 | 0.56.1 |
|---|---:|---:|
| Tabellen | 46 | 46 |
| Routen insgesamt | 131 | 131 |
| Zeilen `public/app.js` | 12.568 | **12.584** |
| Schlüssel je Sprachdatei | 1.559 | **1.561** |
| Regelzeilen des Stilblatts | 2.016 | **2.021** |
| Fensterabfragen (`@media`) im Stilblatt | 16 | **17** |
| Kommentarzeilen | 7.257 in 58 Dateien | **7.263 in 58** |
| Rückbauten | 1.733 | **1.753** |
| Prüfungen im Prüfstand | 8.268 | **8.284** |
| Zeilen `CHANGELOG.md` | 1.285 | **1.304** |

Anleitung, Zeilen: `manual.md` 937 → 942, `manual-de.md` 955 → 962,
`manual-tr.md` 941 → 948. README unverändert.

Grenzwerte der Kommentarzeilen angehoben: `public/app.js` 1.202 → 1.206
(`inert` an der Seite, eigener Eintrag im Verlauf, Tipp neben das Bild, Gesten),
`public/style.css` 518 → 520 (deckendes Vollbild, Telefon quer).

---

## 3. Was gebaut ist

### B1 Filter „Eigene Werte“

- Die Zeile `#f-shares` mit „Potenzial“ und „Bewertung“ entfällt. In der
  Statuszeile folgt nach „Ablehnung“ die Gruppe „Eigene Werte“ (`#f-own`) mit
  „Keine“ und „Teilweise“. Ein Klick auf den gewählten Knopf schaltet aus.
- `FILTER_DEFAULT` hat `own` statt `potential` und `rating`. Ein Eintrag zählt
  mit `share.after`, wenn er getestet ist, sonst mit `share.before`
  (`sharePhase()`).
- Fehlt einem Eintrag seine Phase (Potenzialmodus aus, Kasten ohne Kriterien),
  fällt er bei „Keine“ und „Teilweise“ heraus (F3). Ohne Kriterien fehlt die
  Gruppe, und ein gespeicherter Wert gilt als „Alle“.
- Der Titel der Knöpfe nennt, was zählt: „„Ungetestet“ zählt mit „Potenzial“,
  „Getestet“ mit „Bewertung““, bei „Teilweise“ davor die Schwelle (F2).
- `filterNormal()` entfernt `potential` und `rating` aus gespeicherten Filtern
  und Ansichten (F1).
- Am Telefon steht die Gruppe als dritte Rasterzeile der Statuszeile; die
  eigene Zeile entfällt auch dort.

### B2 Telefon quer, Knopfleiste (Vorschläge V1, V2)

- `.lb-title { flex: 1 1 0; min-width: 0 }` statt `flex-shrink: 100`: Der
  Titel bekommt nur den Platz, den die Knöpfe lassen.
- Neue Fensterabfrage `(max-height: 500px) and (max-width: 960px)`: kein
  Streifen, die Kopfzeile mit 6 statt 14 px Abstand oben und unten (F4).

### B3 Zurück schließt das Vollbild (V3)

- Beim Öffnen legt `history.pushState()` einen Eintrag mit derselben Adresse
  und `{ lightbox: n }` an. `popstate` schließt das Vollbild.
- ✕, Esc und das Löschen des letzten Bildes nehmen den Eintrag mit
  `history.back()` zurück.
- Ein Wechsel der Adresse löst vor `hashchange` ebenfalls `popstate` aus,
  gemessen in Chromium 1194 und jsdom. Der im Auftrag vorgesehene Aufruf in
  `route()` entfällt daher; die Prüfung „Ein Wechsel der Ansicht schließt das
  Vollbild“ belegt es.

### B4 Wischen (V4)

- Ein Wisch zählt nur, wenn genau ein Finger aufliegt, der Finger nicht auf dem
  Video beginnt (F5) und die Seite nicht gezoomt ist
  (`visualViewport.scale > 1`). Ein zweiter Finger bricht den Wisch ab.

### B5 ✕ und 🗑 (V6)

- ✕ steht außerhalb von `.lb-tools` als letztes Element der Kopfzeile
  (`flex-shrink: 0; align-self: flex-start`) und bleibt oben rechts, auch wenn
  die Leiste umbricht.
- 🗑 ist der erste Knopf der Leiste, mit 10 px Abstand zum nächsten (F6).

### B6 Tipp neben das Bild (V7)

- Neben das Bild schließt nur ein Klick, dessen `pointerdown` von der Maus kam
  (F7). Ein Tipp mit dem Finger oder Stift schließt nicht.

### B7 Deckend (V9)

- `--lb-bg` ist im dunklen Schema `rgb(var(--scrim-rgb))` statt 97 % Deckung.
  Im hellen Schema war es schon deckend.

### B8 Fokus (V10)

- Beim Öffnen werden die Kinder von `body` außer Meldungen `inert`. Dialoge,
  die danach aufgehen, etwa die Rückfrage von 🗑, bleiben frei.
- ✕ bekommt den Fokus. Beim Schließen entfällt `inert`, und der Fokus geht an
  das Element zurück, das ihn vorher hatte.

---

## 4. Entscheidungen beim Bauen

| Punkt | Entscheidung | Grund |
|---|---|---|
| B3 | Kein Aufruf in `route()` | Ein Wechsel der Adresse löst `popstate` aus; der Aufruf wäre nie erreicht worden und mit keiner Prüfung zu belegen |
| B3 | `popstate` prüft die Nummer des eigenen Eintrags | Schließt man das Vollbild und öffnet es sofort wieder, käme das `popstate` des ersten `history.back()` beim zweiten an |
| B8 | Meldungen bleiben frei | Eine Meldung mit Knopf, etwa „Rückgängig“, soll bedienbar bleiben |
| B1 | `release_054`: die 5 Prüfungen der alten Zeile entfallen | Sie prüften die entfernte Zeile; die Gruppe heißt jetzt „Filter „Teilweise“: die Schwelle in den Einstellungen“ und prüft das Feld der Schwelle |
| B1 | `delete f.fresh;` bleibt eine eigene Zeile | Rückbau 323 sucht sie so |

---

## 5. Der Prüfstand

**Neu** in `test/release_056.js`: 21 Prüfungen in fünf Gruppen: „Eigene Werte:
eine Gruppe in der Statuszeile“ (6), „Eigene Werte: alte Filter, ohne
Potenzialmodus, ohne Kriterien“ (3), „Vollbild: Zurueck, Fokus und die Seite
dahinter“ (5), „Vollbild: Wischen und Tipp neben das Bild“ (3), „Vollbild:
Kopfzeile, quer und deckend“ (4).

**Angepasst:** `test/release_054.js` (5 Prüfungen der alten Zeile entfallen,
Gruppe umbenannt), `test/release_056.js` (`.lb-title` mit `flex: 1 1 0`),
`test/release_045.js` und `test/ui_style.js` (Reihenfolge der Knöpfe, ✕
außerhalb der Leiste), `test/roundtrip.js` (17 Fensterabfragen),
`test/source.js` (2.021 Regelzeilen), `test/release_053.js` (102 Abschnitte, 42
Fingerprints), `test/selfcheck.js` (1.753 Rückbauten, Grenzwerte),
`test/ui_overview.js` (Schlüssel `fresh` statt `neu`, siehe Rückbau 323).

**Rückbauten.** 1830 bis 1849 neu, 20 Stück. 1657 bis 1659 auf den neuen Code,
1660 und 1661 auf die umbenannte Gruppe. Gefahren je Modul gegen eine Kopie des
Arbeitsbaums: 1830 bis 1849, 1657 bis 1659 und 1818, 1819, 1822 gegen
`test/release_056.js` **26 von 26 rot**; 1660 und 1661 gegen
`test/release_054.js` rot; 297 gegen `test/ui_style.js` rot. 352 bricht
`test/ui_style.js` ab, wie vor dem Bau; über `testbench.js` steht der Abbruch
als rote Prüfung in der erwarteten Gruppe.

323 war schon vor dem Bau stumm: Auch auf `3c57a9a` bestehen mit dem Rückbau
alle 14 Prüfungen der Gruppe „Die gestrichene Pille „Neu seit …"“. Die Prüfung
fragte nach dem Schlüssel `neu`, der seit der Umbenennung `fresh` heißt.
Berichtigt in `test/ui_overview.js`; danach ist 323 rot, ohne Rückbau bleibt die
Gruppe grün.

Die 32 älteren Rückbauten, deren Suchtext im geänderten Code von
`openLightbox()` oder `drawFilters()` steht (254, 298, 350, 351, 353, 1208,
1319, 1568 bis 1573, 1575 bis 1578, 1610, 1672 bis 1675, 1763 bis 1766, 1775,
1776, 1814 bis 1817), je Modul gefahren: **32 von 32 rot**.

**Die Oberfläche in Chromium.** Gemessen wie vor dem Bau
(`Doku/Vorschlaege_Claude_0.56.x.md`, Abschnitt 1): Chromium 1194 ohne Kopf mit
Emulation eines Telefons und Touch, echte App, echter Server, 92 Fälle auf 7
Bildschirmgrößen. Kopfzeile und Bühne beim Foto im Eintrag mit 100 Zeichen
Titel; sichtbares Bild und Anteil am Bildschirm, vorher → nachher:

| Gerät | Kopfzeile | Bühne | Video 16:9 | Video 9:16 | Foto 3:4 |
|---|---:|---:|---:|---:|---:|
| 360 × 640, 360 × 780, 390 × 844 | 120 px | unverändert | unverändert | unverändert | unverändert |
| 412 × 915 | 120 → **70** px | 703 → **753** px | 411 × 231 (25 %) | 395 × 702 (74 %) | 412 × 549 (60 %) |
| quer 640 × 360 | 120 → **54** px | 148 → **306** px | 263 × 148 (17 %) → **544 × 306 (72 %)** | 83 × 148 (5 %) → **172 × 306 (23 %)** | 111 × 148 (7 %) → **230 × 306 (31 %)** |
| quer 915 × 412 | 120 → **54** px | 200 → **358** px | 355 × 200 (19 %) → **636 × 358 (60 %)** | 112 × 199 (6 %) → **201 × 357 (19 %)** | 150 × 200 (8 %) → **269 × 358 (26 %)** |
| Tablet 768 × 1024 | 120 → **70** px | 812 → **862** px | 768 × 432 (42 %) | 456 × 811 (47 %) → **484 × 860 (53 %)** | 609 × 812 (63 %) → **646 × 862 (71 %)** |

Hochkant bricht die Leiste bei Fotos erst unter 412 px um: Sie braucht 296 px,
frei sind an 412 px 310, an 390 px 288 und an 360 px 258. Videos mit „Ganz
laden“ und „Original“ brauchen an 412 px weiter zwei Reihen. Quer steht in
allen 20 Fällen kein Streifen, hochkant und am Tablet in 63 von 70 Fällen einer;
ohne ihn sind fünfmal ein Eintrag mit nur einem Bild und zweimal das Drehen ins
Querformat. ✕ steht oben rechts, nachgesehen auf den Bildschirmfotos 360 × 640
und 640 × 360 mit „Ganz laden“ und „Original“. Außerhalb des Bildschirms liegt
nur das gezoomte Foto (Zoom auf 1 : 1, wie vor dem Bau). Der Hintergrund ist im
dunklen Schema `rgb(6, 7, 9)`, im hellen `rgb(43, 50, 58)`.

`popstate` bei einem Wechsel der Adresse, gemessen in Chromium 1194 mit
`history.pushState()` und `location.hash = '#/'`: zuerst `popstate` mit
`state` null, dann `hashchange`.

Der volle Lauf vor dem Commit: **8.284 von 8.284** Prüfungen bestanden.

---

## 6. Nicht geprüft und offen

- Kein echtes Telefon. Zurück und Wischen sind im Prüfstand mit jsdom
  nachgestellt, `popstate` zusätzlich in Chromium 1194; nicht auf einem Gerät.
- Öffnet eine Adresse `#/item/<n>/photo/<m>` das Vollbild beim Laden der
  Seite, fehlt die Nutzergeste. Nach den Regeln von Chrome für solche Einträge
  kann Zurück den eigenen Eintrag überspringen; Zurück verlässt dann den
  Eintrag und schließt dabei das Vollbild. Nicht gemessen.
- Wechselt die Adresse bei offenem Vollbild, bleibt der eigene Eintrag im
  Verlauf liegen. Zurück führt dann einmal auf dieselbe Adresse, ohne dass sich
  etwas ändert.
- Die Vorschau im Eintrag (`#viewer`) blättert auch dann, wenn ein zweiter
  Finger dazukommt. Nicht in dieser Runde; nachgetragen in
  `Doku/Vorschlaege_Claude_0.56.x.md`.
