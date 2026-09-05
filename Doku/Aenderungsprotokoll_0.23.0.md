# Änderungsprotokoll 0.23.0 — „Die Oberfläche wird hell"

**MINOR · 5. September 2026 · gebaut auf 0.22.1 (`15c9b736`).**

**Kriterion bekommt ein zweites Farbschema — hell, umschaltbar je Zugang, und
die Vorgabe bleibt dunkel.** Wer nichts einstellt, sieht, was er vorher sah.

*Die Runde stand seit dem 4. September 2026 im Fahrplan und hatte dort eine
Auflage: **sie braucht vor ihrem Auftrag ein eigenes Farbkonzept**, weil eine
Farbe sich nicht aus einer anderen ausrechnen lässt. Das Papier ist am
5. September geschrieben worden (`Doku/Farbkonzept_0_23_0.md`), der Auftrag
daraus (`Doku/Auftrag_0.23.0.md`).*

---

## Diese Runde ist KEINE Datenbankstufe — ausdrücklich

Kein Schema, keine Migration, kein Bestandslauf. **`F_ROUTEN` bleibt bei 71** —
die Einstellung geht über `PUT /api/settings`, wie Schriftgröße und
Bildstreifen. Die persönliche Schlüsselliste wächst von neun auf zehn.

**Was ein Betreiber tun muss:** einspielen, im Browser einmal hart neu laden.

---

## Was diese Runde an den Zahlen ändert

| | 0.22.1 | 0.23.0 |
|---|---|---|
| Prüfungen | 5713 | **5744** (+31) |
| Rückbauten | 649 | **649** *(fünf umgehängt, keiner neu)* |
| Zeilen `public/style.css` | 3567 | **3870** |
| Farbwerte in `:root` | 32 | **64** |
| Werte im zweiten Block | — | **42** |
| Werte in der Insel des Betrachters | — | **27** |
| Feste Farben außerhalb von `:root` | **67** | **2** *(die Positivliste)* |
| Ausgelieferte Dateien in `public/` | 5 | **5** *(`thema.js` kommt, `marke-dunkel.svg` geht)* |

---

## 1. Die sieben Entscheidungen und ihre Begründung

**Sie sind vor dem Bauen gefallen, im Gespräch mit dem Betreiber**, und stehen
vollständig im Farbkonzept, Abschnitt 12. Kurz:

| # | | |
|---|---|---|
| **E1** | Stilblatt | ein Attribut `data-thema`, **zwei** Werte; „wie das Gerät" löst `app.js` auf |
| **E2** | Ort | Karte „Darstellung", Abschnitt Persönlich, drei Stufen, Vorgabe **dunkel** |
| **E3** | erster Anstrich | ein Vorgriff aus `localStorage`, vor dem Stilblatt |
| **E4** | Anmeldeseite | der gemerkte Wert, sonst dunkel |
| **E5** | `theme-color` | zwei Werte, aus `app.js` — **gelesen, nicht abgeschrieben** |
| **E6** | Vollbild | bleibt dunkel, aber **dunkelgrau statt schwarz** |
| **E7** | Schatten | Alpha auf ein Sechstel, Ton 210° statt Schwarz |

**Dazu drei Werte, die der Betreiber bestätigt hat:** der Grund `#eaedf1` (das
untere Ende des tragfähigen Fensters), der Betrachter `#2b323a`
(Lightroom-Niveau), und die Marke inline statt als zweite Datei.

---

## 2. Was gebaut wurde, je Bauabschnitt

### Bauabschnitt 1 — die festen Farben verlassen das Regelwerk

**67 Stellen außerhalb von `:root` trugen ihre Farbe als Zahl** — 36 als
`#rrggbb`, 31 als `rgba(r,g,b,a)`. Solange es ein Schema gab, war das eine
Unordnung; mit zwei Schemata ist es ein Fehler: **was fest im Blatt steht,
bleibt beim Umschalten stehen.** Der Projektstand nannte diese Menge „die
eigentliche Arbeitsmenge der Runde, und sie ist heute unbekannt".

**Siebzehn neue Variablen, nach ROLLE benannt und nicht nach Wert.** Darum
steht `--platzhalter` neben `--line-hover`, obwohl beide `#333b44` waren: das
eine ist ein Zeichen auf einer Fläche, das andere ein Rand.

**Die Tönungen als Zahlentripel.** Bei Rot allein gab es sechs Alphas (.13 bis
.50). Als `rgba(var(--red-rgb), .42)` bleibt jedes Alpha genau stehen, und die
Farbe hängt an einer Stelle. Kein `color-mix()` — das Blatt kommt ohne
Bauschritt aus.

**Drei Zusammenlegungen, jede im Blatt danebengeschrieben:**

| | | Δ je Kanal |
|---|---|---|
| `.lb-btn:hover` | `#363e47` → `--line-hover-2` | 5/255 |
| `::selection` | `#12151a` → `--auf-accent` | 2/255 |
| zwei Abzeichen | `rgba(12,14,16,…)` → `--foto-rgb` | 4/255, bei 80 % auf einem Foto |

**DER NACHWEIS, DASS SICH NICHTS ÄNDERT.** Alle Variablen aufgelöst und gegen
den alten Stand gestellt: **583 Farbangaben vorher, 583 nachher, genau vier
Abweichungen** — die drei oben, eine davon zweimal.

### Bauabschnitt 2 — der zweite Block

**Ein Block, 42 Werte.** Die Stufenleiter kehrt ihre Richtung um, nicht ihre
Bedeutung: im Dunklen heißt „eine Stufe hervortreten" heller, im Hellen
dunkler.

**Drei Vorarbeiten, die erst beim Bauen sichtbar wurden:**

* **Orange als Schrift braucht einen zweiten Wert** — 39 Stellen. Auf Weiß
  misst `#ff7a1a` **2,61 : 1**. Als Fläche muss es die Marke bleiben, als
  Schrift fällt es unter jede Schwelle. `--accent-text` (`#ad4f0b`, 5,38) und
  `--accent-text-hi` (`#933f06`).
* **Und die Kante einer gefüllten Orangefläche auch** — fünf Stellen. Die
  Schrift auf dem Knopf ist mit 6,94 lesbar, sein **Umriss** gegen die weiße
  Karte nicht. `--accent-kante`: im Dunklen ist die Kante die Fläche, im
  Hellen die ganze Grenze.
* **Was auf einem Foto liegt, folgt dem Foto** — sieben Stellen. Und sie stehen
  als **Zahl** da, nicht als `var(--text-2)`: eine Variable löst sich beim
  *Gebrauch* auf, und das helle Schema zöge sie sonst auf dunkle Schrift mit.

**Der Betrachter ist ein Raum mit eigenem Licht.** Er benutzt acht
Schema-Variablen; bliebe er dunkel, während `--text` auf `#14181c` geht, stünde
seine Bedienung mit **1,38 : 1** da. **Es kostet keine Regeländerung:**
Variablen vererben sich, also bekommt er in einem Block seine eigenen — 27
Werte, und was dort steht, *ist* das dunkle Schema mit angehobenem Grund.

### Bauabschnitt 3 — die Maschine

* **Karte „Darstellung"**, Pillenreihe über der Schriftgröße: Hell · Dunkel ·
  Wie das Gerät. Dieselbe Bauform wie `schrift` und `streifen`.
* **`PERSOENLICHE_SCHLUESSEL` neun → zehn**, `THEMA_STUFEN` klemmt in
  `PUT /api/settings`, `farbschema()` liest mit Rückfall.
* **Drei Stufen in der Oberfläche, zwei im Stilblatt.** `geraet` wird über
  `matchMedia` aufgelöst; ein Horcher zieht nach, wenn der Benutzer sein Gerät
  umstellt — ohne Neuladen, und nur in dieser Stellung.
* **`theme-color` wird gelesen und nicht abgeschrieben.** Der Kopf der Seite
  sagt seit jeher, sie sei `--bg` und dürfe keine zweite Wahrheit sein — als
  Zeichenfolge im Meta-Element war sie aber genau das. `app.js` holt sie mit
  `getComputedStyle` aus `--bg`. Ebenso `color-scheme`: es gehört den
  `:root`-Blöcken, nicht mehr einer Zeile an `.select`.

### Bauabschnitt 4 — die Marke und die Dämpfung

**Die Marke wird wieder ein eingebautes SVG — und das nimmt eine Entscheidung
von 0.9.1 zurück.** Dort wurde sie in eine Datei gezogen: *„eine Marke gehört
dem Projekt und nicht einer Funktion in app.js — wer sie austauscht, tauscht
eine Datei aus und fasst keinen Quelltext an."* **Die Begründung ist nicht
falsch geworden. Sie hält nur der Messung nicht stand:**

| `marke-dunkel.svg` | dunkel | hell |
|---|---|---|
| die drei grauen Striche `#838c95` | 5,58 : 1 | **2,91** ✗ |
| der orange Strich `#ff7a1a` | 7,31 : 1 | **2,22** ✗ |

**Der Preis steht im Quelltext und nicht nur hier:** wer die Marke austauscht,
fasst ab jetzt Quelltext an. `favicon.svg` bleibt eine Datei — es braucht keine
Variable, weil es seine eigene Kachel mitbringt. **Zwei Variablen und keine
neue Farbe:** `--marke-grau` ist `--muted`, `--marke-strich` ist
`--accent-text`.

**Die Dämpfung schiebt zum Grund hin und nicht zu Schwarz** (Regel F4).
Ausgerechnet an einem mittleren Foto, gegen die je eigene Karte:

| | gedämpft | ungedämpft |
|---|---|---|
| dunkel, `brightness(.5)` | **1,71 : 1** | 4,51 : 1 |
| hell, `brightness(.5)` | **10,33 : 1** | 3,91 : 1 |
| hell, **`opacity(.45)`** | **1,71 : 1** | 3,91 : 1 |

Mit `brightness` wäre der abgelehnte Eintrag auf weißer Karte der **lauteste
Fleck der Seite** gewesen.

---

## 3. Die Palette

**Alles gerechnet, nicht geschätzt** — WCAG 2.1 über die relative Leuchtdichte
nach sRGB. Die Latte: **kein Wert des hellen Schemas unterschreitet, was das
dunkle an derselben Paarung erreicht.**

```
                 dunkel     hell        auf der Karte   auf dem Grund
--bg             #0e1012    #eaedf1
--surface        #16191c    #ffffff
--text           #e9ecef    #14181c        17,84            15,19
--text-2         #b3bac1    #3f4851         9,30             7,92
--muted          #838c95    #616b75         5,43             4,62
--faint          #616a73    #767f89         4,06             3,46
--star-off       #3a424a    #d3dae1
```

**Die fünf Bedeutungsfarben — sie behalten ihre Bedeutung (G1):**

| | dunkel | hell | Karte | Grund |
|---|---|---|---|---|
| Gold | `#ffc531` | `#8f6306` | 5,31 | 4,52 |
| Orange *(als Schrift)* | `#ff7a1a` | `#ad4f0b` | 5,38 | 4,59 |
| Grün | `#3fd39a` | `#0c7a54` | 5,35 | 4,55 |
| Blau | `#4d9de0` | `#1d6eb6` | 5,31 | 4,52 |
| Rot | `#f0555c` | `#cb2a32` | 5,36 | 4,57 |

*Die fünf liegen zwischen 5,31 und 5,38. Das ist kein Zufall, sondern dieselbe
Rechnung — und der Grund, warum sie sich als **eine Familie** lesen.*

**`--accent` bleibt in beiden Schemata `#ff7a1a`.** Die Marke bekommt keinen
zweiten Wert; den Kontrast trägt der Rand.

---

## 4. Der Augenschein — gefahren, nicht behauptet

**An einer aufgesetzten Installation mit echten Fotos, in Chromium, beide
Schemata.** Und er hat einen Fehler gefunden, den keine Messung hatte:

> **DIE ZWEI ABZEICHEN AUF DER BILDKACHEL.** „Getestet" und „abgelehnt" liegen
> auf ihrem eigenen dunklen Schleier, färbten ihre Schrift aber mit
> `var(--green)` und `var(--red)`. Im hellen Schema sind das die **dunklen**
> Werte: **Dunkelgrün auf Dunkelgrau, 2,10 : 1.**
>
> Das ist Regel F5, an zwei Stellen nicht angewandt. **Dass erst der
> Augenschein sie brachte, ist der Punkt und keine Panne:** die Paarung
> „Bedeutungsfarbe auf eigenem Schleier" kommt in keiner Tafel des Konzepts
> vor. Sie steht jetzt im Kommentar an den vier neuen Variablen, mit den Zahlen
> daneben.

**Was sonst nachgesehen wurde:** Grund, Karte, Rand, Titel, Orange als Text,
Bildgrund, Platzhalter, Knopf, Pille samt Kante, Stern an und aus, Fotozahl,
Dialogschleier und die sechs Werte des Vollbilds — je Schema, nach dem
Auslaufen der Übergänge.

**Und ein Messfehler, der wie ein Befund aussah:** `.star`, `.lb-btn` und
`.card` tragen `transition`. Unmittelbar nach dem Umschalten gemessen liefert
die Überblendung Zwischenwerte — und die sehen aus wie ein Schema, das nicht
greift. 400 ms warten, dann stimmt alles.

---

## 5. Der Fund, den nur der Browser zeigen konnte

**Der Vorgriff gegen das Blitzen stand zuerst als Achtzeiler im Kopf der
Seite.** Chromium hat ihn abgewiesen:

```
Refused to execute inline script because it violates the following
Content Security Policy directive: "script-src 'self'"
```

**Das ist Kriterions eigene Regel und keine Panne** — `server.js` sagt dazu
seit jeher *„script-src bleibt streng, dort liegt die Wirkung"*. Ein Hash oder
ein Nonce hätte sie aufgeweicht oder eine von Hand gepflegte zweite Wahrheit
geschaffen.

**Also liegt er als `public/thema.js` daneben.** Er kommt von `'self'`, er
steht ohne Zutun im Fingerprint (`bildeFingerprint()` liest alles unter
`public/`), und er lädt **synchron** — `defer` oder `async` ließen ihn nach dem
Stilblatt laufen, und dann wäre er da und das Blitzen auch.

**Nachgemessen am echten Server:** bei `DOMContentLoaded` steht die Seite schon
hell, während die Einstellungen noch gar nicht geladen sind. Zwei Runden, beide
ohne Blitzen.

---

## 6. Prüfstand und Gegenproben

### Prüfungen: 5713 → 5744 (+31)

| Gruppe | |
|---|---|
| **Keine feste Farbe im Stilblatt** | 6 — der Wächter der Runde, **mit Gegenlage** |
| **Das Farbschema** | 16 — die Maschine, der Vorgriff, die Insel, F4 |
| **Das Farbschema am Server** | 8 — Vorgabe, Klemme, alle drei Stufen, und dass es dem Benutzer gehört |
| nachgezogen | 20 — Wortlaut, nicht Wert |

**Der Wächter ist im ERSTEN Bauabschnitt entstanden und nicht am Ende** — er
ist die einzige Zusicherung, dass die Bestandsaufnahme vollständig war.

**Und er hat im zweiten Bauabschnitt die Insel des Betrachters gefangen — zu
Recht, wie er formuliert war.** Die Regel war zu grob: **eine Variable zu
*definieren* ist erlaubt, mit einer Zahl zu *malen* nicht.** Das Muster
verlangt jetzt einen Buchstaben als erstes Zeichen der Eigenschaft; dazu eine
zweite Zeile als Gegenseite — Farbwerte stehen nur in den **bekannten**
Schemablöcken.

**Die Positivliste hat genau einen Eintrag:** `#000` hinter `<video>`. Der
Balken beim Seitenverhältnis ist der Rand eines Videos und keine Fläche der
Oberfläche — in jedem Schema schwarz, weil das Bild es dort ist.

**Zwei nachgezogene Prüfungen sind dabei fester geworden:** die Goldprüfung
sieht jetzt *auch* nach, ob `--gold-rgb` wirklich Gold trägt, und die
Klammersuche nach `--accent-dim` endete mit `[^)]*` an der **inneren** Klammer
— sie wäre nicht rot geworden, sondern **blind**.

### Rückbauten: 649 → 649, fünf umgehängt

Zwei zeigten auf eine Datei, die es nicht mehr gibt. **70** prüft jetzt, dass
die Marke dem Schema überhaupt folgt; **153**, dass ihr Strich nicht wieder
Gold wird.

---

## 7. Was ausdrücklich NICHT gebaut wurde

* **Keine neue Farbfamilie.** Zwei Schemata sind zwei Werte je Bedeutung (G1).
* **Kein Schalter in der Kopfzeile** — sonst gäbe es zwei Orte für dieselbe Frage.
* **Kein drittes Schema.** Ein zweites ist eine Entscheidung, ein drittes eine Sammlung.
* **Keine zweite Markendatei** (Stolperstein 47).
* **Kein helles Vollbild.**
* **Keine Änderung an `favicon.svg`.**
* **Keine Änderung am Augenschein des dunklen Schemas** — nachgewiesen, siehe 2.

---

## 8. Was offen geblieben ist

* **Die Ausdruckansicht.** Es gibt keine — aber wer eine baut, baut sie auf
  weißem Grund, und ab dieser Runde gibt es dafür Werte.
* **`prefers-contrast`.** Ein drittes Schema ist ausgeschlossen; eine
  Verschärfung des vorhandenen wäre keines. Nicht in dieser Runde.
* **Der Randfall zweier Benutzer an einem Browser.** Der zweite sieht für
  Sekundenbruchteile das Schema des ersten, dann berichtigt der Server.
  *Benannt und hingenommen — wenn er im Betrieb stört, ist er ein Befund und
  keine Überraschung.*
* **Der Augenschein am Telefon.** Gefahren ist er am Schreibtisch, in Chromium.
  Die Umbruchpunkte sind unberührt, aber **eine Farbe sieht auf einem
  OLED-Schirm im Sonnenlicht anders aus als im Prüfstand.**

---

## Die Papiere

* `Doku/Farbkonzept_0_23_0.md` — die Ausarbeitung, vor dem Auftrag geschrieben.
* `Doku/Auftrag_0.23.0.md` — der Auftrag; **er fällt mit dem nächsten weg**,
  es liegt immer nur einer im Repo.
* `Doku/Aenderungsprotokoll_0.23.0.md` — dieses Blatt.
* `Doku/Projektstand_…` — Regel **G12** in Abschnitt 5.6; der 0.23.0-Eintrag
  aus Abschnitt 10a fällt mit dem Bau heraus.
* `CHANGELOG.md`, `README.md`.

---

## 0.23.0 — Fingerprint `92f7a142`
