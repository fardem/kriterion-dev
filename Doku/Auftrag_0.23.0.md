# Auftrag 0.23.0 — „Die Oberfläche wird hell"

**MINOR.** Aufsetzend auf **0.22.1, Fingerprint `15c9b736`** — der Stand von
`main` am 5. September 2026 (`bc175ce`). **Derselbe Bau läuft am Wirt**, der
Augenschein am Wirt ist also aussagekräftig.

**Das Farbkonzept steht und ist vollständig:
`Doku/Farbkonzept_0_23_0.md`.** *Dieser Auftrag entscheidet keine Farbe. Jeder
Wert, jede Schwelle und jede der sieben Entscheidungen steht dort — hier steht
nur, in welcher Reihenfolge gebaut wird und woran die Abnahme hängt.*

---

## Woher

**Der Fahrplan hat diese Runde am 4. September 2026 eingetragen** und ihr
ausdrücklich ein eigenes Papier vorgeschrieben, *bevor* ihr Auftrag
geschrieben werden darf: **eine Farbe lässt sich nicht aus einer anderen
ausrechnen.**

**Das Papier ist am 5. September 2026 geschrieben worden.** Es bringt drei
Dinge mit, die es vorher nicht gab:

1. **Die Geometrie der heutigen Palette** — alle elf Neutralen stehen auf
   **210°** bei 8 bis 16 Prozent Sättigung. Niemand hatte das aufgeschrieben.
2. **Die Bestandsaufnahme** — der Fahrplan nannte sie „die eigentliche
   Arbeitsmenge der Runde, und sie ist heute unbekannt". **Es sind 68 Zeilen
   in acht Gruppen.**
3. **Eine Meßlatte, die schon steht** — das helle Schema darf an keiner
   Paarung unterschreiten, was das dunkle heute erreicht.

---

## Worum es geht, in vier Sätzen

**Kriterion bekommt ein zweites Farbschema — hell, umschaltbar je Zugang, und
die Vorgabe bleibt dunkel.** Zuerst werden 68 feste Farben im Stilblatt auf
Variablen gezogen, **ohne dass sich ein einziges Bildpunkt ändert**. Dann
kommt ein zweiter Block mit 31 Werten dazu, dann die Maschine zum Umschalten,
dann der Augenschein an echten Einträgen. **Kein Schema, keine Route, keine
Abhängigkeit, kein Bestandslauf.**

---

## Bauabschnitt 1 — die festen Farben verschwinden aus dem Stilblatt

**DAS IST DER BROCKEN UND DER EINZIGE ABSCHNITT MIT FEHLERRISIKO.** Er ist
mechanisch, aber er fasst 68 Stellen an, und **jede übersehene bleibt beim
Umschalten als dunkler Fleck stehen.**

### 1.1 Was gebaut wird

**Acht neue Variablen in `:root`**, und die 68 Zeilen benutzen sie:

| Variable | ersetzt | Stellen |
|---|---|---|
| `--line-hover` | `#333b44`, `#3a434c`, `#363e47` | 17 |
| `--foto-schleier` | `rgba(8,10,12,.78–.88)` | 13 |
| `--bild-grund` | `#0a0c0e`, `#08090b`, `#14181c` | 8 |
| `--auf-accent` | `#14161a` — Schrift auf Orange | 7 |
| `--red-line`, `--green-line` | die roten und grünen Tönungen | 12 |
| `--auf-foto` | die Schrift auf Bildabzeichen | 5 |
| `--schleier` | `rgba(6,7,9,.78)` — Dialoggrund | 2 |
| `--auf-signal` | `#fff` auf Rot | 2 |

**Dazu `--marke-grau` und `--marke-strich`** (Bauabschnitt 4 braucht sie).

### 1.2 Was dabei nicht verhandelbar ist

* **DER AUGENSCHEIN ÄNDERT SICH NICHT.** Jeder neue Wert ist der Wert, der
  heute an der Stelle steht. **Der Fingerprint wandert, das Bild nicht.**
* **Wer eine Stelle findet, die im Konzept nicht steht, trägt sie nach** —
  in den Auftrag und ins Papier, mit Zahl. *Die 68 sind gezählt, nicht
  geschätzt; eine 69. ist ein Fund und kein Fehler.*
* **In der Positivliste bleiben nur:** `#000` hinter `<video>`,
  `transparent`, `currentColor`. **Sonst nichts.**

### 1.3 Der Prüfstand kommt in diesem Abschnitt dazu und nicht später

**Ein Lauf, der `style.css` außerhalb der `:root`-Blöcke nach Farbliteralen
absucht und gegen die Positivliste rot wird.** Er ist ab hier der Wächter
für alles Weitere — **auch für jede künftige Runde.**

*Er wird hier gebaut und nicht am Ende: er ist die einzige Zusicherung, dass
die 68 vollständig waren.*

---

## Bauabschnitt 2 — der zweite Block

### 2.1 Was gebaut wird

**Genau ein Block:**

```css
:root[data-thema="hell"] { … 31 Werte … }
```

**Die Werte stehen in `Farbkonzept_0_23_0.md`, Abschnitt 4** — vollständig,
einzeln benannt und gemessen. **Sie werden abgeschrieben und nicht neu
gefunden.**

**Dazu die Insel des Betrachters** (Papier, Abschnitt 6):

```css
[data-thema="hell"] .lightbox { … 7 Werte … }
```

### 2.2 Was dabei nicht verhandelbar ist

* **Das Stilblatt kennt zwei Werte von `data-thema` und keinen dritten.**
  „Wie das Gerät" wird in `app.js` aufgelöst. *Stünde er hier, müsste jeder
  Wert dreimal geschrieben werden.*
* **`--accent` ist in beiden Schemata `#ff7a1a`.** Die Marke bekommt keinen
  zweiten Wert; den Kontrast trägt der Rand (Papier, F1).
* **Die Regeln des Betrachters werden NICHT angefasst.** Die Insel wirkt über
  die Vererbung der Variablen — sieben Zeilen, keine Regeländerung.
* **`--foto-schleier`, `--auf-foto`, `--auf-accent` und `--auf-signal` stehen
  im zweiten Block NICHT**, weil sie in beiden Schemata gleich sind
  (Papier, F5). *Wer sie doch hineinschreibt, hat F5 nicht gelesen.*

---

## Bauabschnitt 3 — die Maschine

### 3.1 Am Server

* **`PERSOENLICHE_SCHLUESSEL` wächst von 9 auf 10:** `thema` kommt dazu.
* **`PUT /api/settings`** bekommt eine Klemme gegen
  `THEMA_STUFEN = ['hell','dunkel','geraet']` — **dieselbe Bauform wie
  `SCHRIFT_STUFEN`**, geprüft vor dem ersten Schreiben.
* **`GET /api/settings`** liefert `thema` mit, wie `schrift` und `streifen`.
* **Keine neue Route. `F_ROUTEN` bleibt bei 71.**

### 3.2 In der Oberfläche

* **Die Pillenreihe in `karteDarstellung()`**, über der Schriftgröße:
  `[ Hell ] [ Dunkel ] [ Wie das Gerät ]`. Ausgerüstet in
  `ruesteDarstellungAus()`, gezeichnet wie `drawSchrift()`.
* **`wendeThemaAn()`** neben `wendeSchriftAn()` und `wendeStreifenAn()`,
  gerufen aus `ladeEinstellungen()`. Sie setzt `data-thema`, schreibt
  `localStorage` und setzt `theme-color`.
* **Ein `matchMedia`-Horcher**, der nur greift, solange `thema === 'geraet'`.
  **Ohne Neuladen.**
* **Die Einstellung wirkt sofort** — wie Schriftgröße und Bildstreifen.

### 3.3 Im Kopf der Seite

* **Der Achtzeiler vor dem Stilblatt** (Papier, 9.4). **Mit `try/catch`** —
  in einem privaten Fenster wirft der Zugriff selbst.
* `<meta name="color-scheme" content="light dark">`.
* **Der Vermerk an `theme-color` bleibt stehen und wird ergänzt:** der Wert
  ist `--bg` und darf keine zweite Wahrheit sein — **zwei Schemata heißen
  zwei Werte, und beide stehen in `app.js`.**
* **`color-scheme: dark` an `.select` (style.css:1246) fällt weg** — die
  Eigenschaft steht ab jetzt je Block am Wurzelelement.

---

## Bauabschnitt 4 — die Marke und der Augenschein

### 4.1 Die Marke wird inline

**`MARK()` in `app.js` gibt das SVG in den Baum statt `<img src=…>`.** Seine
zwei Striche werden `var(--marke-grau)` und `var(--marke-strich)`; die Marke
folgt dem Schema **ohne eine Zeile JavaScript.**

**`public/marke-dunkel.svg` fällt weg** — auch aus der Dateiliste des
Fingerprints und aus der Liste des ausgelieferten Bestands im Prüfstand.

**`public/favicon.svg` bleibt unverändert.**

### 4.2 Die Fotos

* **`.card-img`** steht auf `--bild-grund` — hell `#e3e7ec` statt `#0a0c0e`.
* **`.card.rejected`** dämpft im hellen Schema mit **`grayscale(.85)
  opacity(.45)`** statt `brightness(.5)`. *Ausgerechnet: beides ergibt
  1,71 : 1 gegen die je eigene Karte (Papier, F4).*
* **Im Betrachter bleibt der Bildgrund dunkel** — über die Insel.

### 4.3 Der Augenschein

**Neun Lagen, an echten Einträgen und in beiden Schemata** — die Liste steht
im Papier, Abschnitt 14, Punkte 5 bis 9, und sie ist die Abnahme. Kurz:
Hochformat in quadratischer Kachel · abgelehnt neben normal · Vollbild aus der
hellen Seite · Dialog aus dem Vollbild · Kopfzeile beim Rollen.

---

## Die Entscheidungen — sieben, und sie sind gefallen

**Sie stehen im Papier, Abschnitt 12, mit Begründung und Zahl.** Kurz:

| # | | |
|---|---|---|
| **E1** | Stilblatt | ein Attribut, zwei Werte; „Gerät" in `app.js` |
| **E2** | Ort | Karte „Darstellung", drei Stufen, Vorgabe dunkel |
| **E3** | erster Anstrich | `localStorage` plus Achtzeiler |
| **E4** | Anmeldeseite | gemerkter Wert, sonst dunkel |
| **E5** | `theme-color` | zwei Werte, aus `app.js` |
| **E6** | Vollbild | dunkelgrau `#2b323a`, nicht schwarz |
| **E7** | Schatten | Alpha auf ein Sechstel, Ton 210° |

**Keine davon ist beim Bauen noch offen.** Wer eine aufmacht, macht sie im
Papier auf und nicht im Quelltext.

---

## Was ausdrücklich NICHT gebaut wird

* **Keine neue Farbfamilie.** Zwei Schemata sind zwei Werte je Bedeutung
  (G1).
* **Kein Schalter in der Kopfzeile.**
* **Kein drittes Schema.**
* **Keine zweite Markendatei.**
* **Kein helles Vollbild.**
* **Keine Änderung an `favicon.svg`.**
* **Keine neue Route, kein Schema, kein Bestandslauf, keine Abhängigkeit.**
* **Keine Änderung am Augenschein des dunklen Schemas.** *Wer es beim Bauen
  „nebenbei verbessert", hat den Auftrag verlassen.*

---

## Der Prüfstand — was er halten muss

1. **Keine Farbliterale im Stilblatt außerhalb der `:root`-Blöcke**, außer der
   Positivliste. **Der Wächter aus 1.3.**
2. **Jeder Wert aus `:root` hat im zweiten Block eine Entsprechung** — und
   die vier aus F5 ausdrücklich **nicht**. Beide Richtungen.
3. **Die Kontrastschwellen** aus dem Papier, Abschnitt 14, Punkte 1 bis 4 —
   **gerechnet, nicht abgeschrieben.** Der Rechenweg (WCAG 2.1, relative
   Leuchtdichte nach sRGB) gehört in den Prüfstand.
4. **`THEMA_STUFEN` steht am Server und in `app.js` und stimmt überein** —
   dieselbe Prüfung wie bei `SCHRIFT_STUFEN` und `STREIFEN_STUFEN`.
5. **`thema` steht in `PERSOENLICHE_SCHLUESSEL`**, die Liste hat zehn
   Einträge.
6. **`F_ROUTEN` bleibt bei 71.**
7. **`marke-dunkel.svg` ist aus der Dateiliste des Fingerprints und aus der
   Liste des ausgelieferten Bestands entfernt.**
8. **Der Achtzeiler steht VOR `<link rel="stylesheet">`** — sonst blitzt es
   trotzdem.
9. **`backdrop-filter` steht weiterhin in keiner Regel** (G3). *Ein helles
   Schema ist die klassische Gelegenheit, es doch einzuführen.*

---

## Bauregeln

* **Die vier Bauabschnitte in dieser Reihenfolge.** Abschnitt 1 muss
  vollständig sein, bevor Abschnitt 2 anfängt — sonst wird der zweite Block
  gegen einen unvollständigen ersten geschrieben.
* **Nach Abschnitt 1 ist der Augenschein unverändert.** Das wird geprüft,
  bevor es weitergeht.
* **Jeder Wert wird aus dem Papier abgeschrieben.** Wer beim Bauen eine Farbe
  *findet*, hat den Fehler gemacht, den das Papier verhindern sollte.
* **Deutsch in Oberfläche und Kommentar** (S1 bis S7).
* **Die Gestaltungsregeln G1 bis G11 gelten unverändert.**

---

## Die Dokumente

* **`Doku/Farbkonzept_0_23_0.md`** — steht, wird beim Bauen nur ergänzt
  (Funde nach 1.2), nicht umgeschrieben.
* **`Doku/Aenderungsprotokoll_0.23.0.md`** — neu, am Ende.
* **`CHANGELOG.md`** — der Eintrag zur Version.
* **`Doku/Projektstand_…`** — der 0.23.0-Eintrag aus Abschnitt 10a fällt mit
  dem Bau heraus; **G12 („das Schema hat zwei Werte und keine feste Farbe
  trägt eine Bedeutung") kommt in Abschnitt 5.6 dazu.**
* **`README.md`** — die Einstellung „Farbschema" in der Karte „Darstellung".

---

## Was danach offen bleibt

* **Die Ausdruckansicht.** *Es gibt keine — aber wer eine baut, baut sie auf
  weißem Grund, und ab dieser Runde gibt es dafür Werte.*
* **`prefers-contrast`.** Ein drittes Schema ist ausgeschlossen (13); eine
  Verschärfung des vorhandenen wäre keines. **Nicht in dieser Runde.**
* **Der Randfall zweier Benutzer an einem Browser** (Papier, 9.4) — benannt
  und hingenommen. *Wenn er im Feld stört, ist er ein Befund und keine
  Überraschung.*
