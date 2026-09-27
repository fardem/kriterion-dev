# Änderungsprotokoll 0.44.1 — „Dateizeilen in Spalten, Link am Bild"

**Gebaut am 27. September 2026 auf 0.44.0. Fingerprint `8237adde`, davor
`37520fc0`.**

Drei Befunde des Betreibers nach dem Einspielen von 0.44.0, alle vom
27. September 2026, zwei davon mit Bildschirmfoto. Schema: nein.
Austauschformat: 20.

---

## 1. Vorgaben des Betreibers

Die Fragetafel ist vor dem Bau beantwortet worden, am 27. September 2026.

| Frage | Antwort |
|---|---|
| F1. Wo steht „Link kopieren“ bei einem Video? | rechts von „Ausschnitt“, vor dem Vollbild; bei Foto und Video an derselben Stelle |
| F2. Wie breit sind die Spalten der Dateizeile? | nach der breitesten Zeile der Liste; nichts wird abgeschnitten |
| F3. Und auf dem Telefon? | wie bisher: die Zeile bricht um |
| F4. Der Text der Karte „Dokumente“ | „Bearbeiten durch alle: Startwert, solange ein Account keinen eigenen gesetzt hat“, mit Komma vor „solange“ |

---

## 2. Was sich ändert

| | 0.44.0 | 0.44.1 |
|---|---|---|
| Text zur Vorgabe auf der Karte „Dokumente“ | „Startwert für „Bearbeiten durch alle“, solange …“ | „Bearbeiten durch alle: Startwert, solange …“, Englisch und Türkisch im selben Aufbau |
| „Link kopieren“ am großen Bild im Eintrag | nur im Vollbild | zusätzlich in der Leiste über dem Bild (`.vlink`), rechts von „Ausschnitt“; im Ausschnittmodus nicht |
| Rechte Seite der Dateizeilen | jede Zeile eine eigene Flex-Zeile | am Rechner feste Spalten über die ganze Liste |

**Warum die Dateizeilen verrutschten.** Der Dateiname nahm den übrigen Platz,
alles rechts davon hing am rechten Rand. Das Zeichen der Schreibrechte, der
Stift, ⤢ und ✕ stehen nur in manchen Zeilen; Name des Accounts und Größe sind
verschieden breit. Jede Zeile begann ihre rechte Seite deshalb an einer
anderen Stelle.

**Die Spalten.** `#atts` ist ein Raster mit elf benannten Spalten: `icon`,
`name`, `size`, `from`, `go`, `rights`, `edit`, `open`, `link`, `dl`, `del`.
Jede Zeile übernimmt sie mit `grid-template-columns: subgrid`. Jede Spalte ist
so breit wie ihr breitester Eintrag, der Name nimmt den Rest. Fehlt ein Knopf,
bleibt seine Spalte leer. Der Abstand steht als `margin-left` am Element,
nicht als `gap`: sonst trüge auch eine leere Spalte einen Abstand. Die Größe
steht rechtsbündig.

Die Regeln stehen in `@supports (grid-template-columns: subgrid)`. Ein Browser
ohne `subgrid` zeigt die Zeile wie in 0.44.0. Im Block für schmale Fenster
setzen `#atts { display: block; }` und `.arow { display: flex; … }` den
Umbruch von vorher zurück.

Gemessen in Chromium (`headless_shell` 1194) mit `public/style.css` und acht
Zeilen wie im Bildschirmfoto des Betreibers, x-Position in px bei 1.200 px
Fensterbreite:

| | Größe | Account | ▸ |
|---|---:|---:|---:|
| 0.44.0 | 846 bis 954 | 887 bis 995 | 932 bis 1.040 |
| 0.44.1 | rechtsbündig | 866 in allen | 932 in allen |

Bei 390 px Breite sind die Positionen vorher und nachher gleich.

---

## 3. Die Bilanz

| | 0.44.0 | 0.44.1 |
|---|---:|---:|
| Regelzeilen des Stilblatts | 1.719 | **1.738** |
| Kommentarzeilen, 41 Dateien | 6.561 | **6.567** |
| Rückbauten | 1.215 | **1.222** |
| Prüfungen im Prüfstand | 7.526 | **7.533** |

Kommentargrenzen mit `node tools/comments.js --write` angehoben:
`public/style.css` 513 → 517 (die Spalten und warum `margin` statt `gap`),
`public/app.js` 1.014 → 1.015 (warum der Knopf im Ausschnittmodus fehlt).

---

## 4. Der Prüfstand

`test/release_044.js` hat die Gruppe „Link am Bild und Dateizeilen in
Spalten“ mit sieben Prüfungen: der Knopf am Foto und am Video, seine Adresse,
kein Knopf im Ausschnittmodus, jedes Element der Dateizeile in seiner Spalte
und in der Reihenfolge der Zeile, `subgrid`, der Umbruch auf dem Telefon, der
Text der Karte in drei Sprachen.

Angepasst: `test/source.js` 1.738 Regelzeilen, `test/selfcheck.js` 1.222
Rückbauten und die Kommentargrenzen.

Rückbauten:

| Nr | Rückbau |
|---|---|
| 1296 | Der Text der Karte beginnt wieder mit dem Startwert |
| 1297 | Das große Bild hat keinen Knopf Link kopieren |
| 1298 | Im Ausschnittmodus steht der Knopf Link kopieren |
| 1299 | Der Knopf am Bild kopiert den Eintrag |
| 1300 | Die Dateizeile übernimmt die Spalten der Liste nicht |
| 1301 | Der Stift hat keine eigene Spalte |
| 1302 | Auf dem Telefon bleibt die Liste ein Raster |

Alle erwartet in „Link am Bild und Dateizeilen in Spalten“.

**7 rot, 0 stumm**, ohne Abbruch eines Moduls, gefahren auf `32768a0`. Jeder
ist in seiner erwarteten Gruppe rot und zusätzlich in „Jeder Suchtext kommt in
seiner Datei genau einmal vor“: die Prüfung liest den zurückgebauten Stand.
1300 bis 1302 sind außerdem rot in „Das Stilblatt traegt weniger Kommentar als
vorher — 0.35.0“: sie entfernen je eine Zeile aus `public/style.css`, und
diese Gruppe hält die Zahl der Regelzeilen fest.

---

## 5. Nicht geprüft

Der Prüfstand rechnet kein Layout; er prüft die Regeln im Stilblatt und die
Reihenfolge der Elemente. Die Messung in Chromium oben ist einmal von Hand
gelaufen und gehört nicht zum Prüfstand.
