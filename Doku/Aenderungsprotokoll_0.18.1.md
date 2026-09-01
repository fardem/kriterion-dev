# Änderungsprotokoll 0.18.1 — „Zehn Zeilen heißt zehn Zeilen dieser Liste"

**Version 0.18.1 · gebaut am 1. September 2026 · Fingerprint `7b12ead4` ·
4919 Prüfungen · 422 Rückbauten in `gegenprobe.js`**

---

**ZWEI BEFUNDE AUS DEM RUNDLAUF MIT 0.18.0**, beide mit Bild gemeldet und beide
an derselben Sache: **was eine Kachel zeigt, wenn wenig oder nichts darin
steht.**

> **DIE NUMMER: PATCH.** *Diese Runde bringt keine Funktion.* **Nur
> `public/style.css` ist angefasst** — zwei Zahlen und eine neue Zeile. **Keine
> Datenbankstufe:** sieben markierte Blöcke, Austauschformat **11**, `F_ROUTEN`
> **69**.

---

## 1. Die Sitzungsliste zeigte fünf, wo die Zusage zehn sagt

**BEFUND.** *Wörtlich: „hier haben wir einen Fall, wo die Kachel ‚Zugang' den
maximalen Platz vorgibt. Daneben ist eine dynamische Kachel mit dem Namen
‚Meine Sitzungen', die hat eigentlich nach unten hin bis zum Boden Platz und
könnte den Platz mit Anzeige von mehr Sitzungen nutzen, aber sie tut es
nicht."*

### Der Leerraum ist die Folge, nicht die Ursache

**Gemessen in Chromium bei 1384 × 1061 an einer echten Instanz, 22 Sitzungen:**

| | vorher |
|---|---:|
| Kachel „Zugang" (starr) und mit ihr die ganze Reihe | **1054,92 px** |
| Liste „Meine Sitzungen", gedeckelt bei `27.95rem` | **419,25 px** |
| leer darunter | **453 px** |
| **sichtbare Sitzungen** | **fünf** |

**`27.95rem` SIND ZEHN STANDARDZEILEN zu 41,92 Pixeln. Eine `.mrow.sitz` ist
aber keine Standardzeile:** sie ist ein Raster über **drei** Zeilen — Name,
Anmeldezeit, letzter Zugriff — und misst gemessen **72,55 px**. *419,25 geteilt
durch 72,55 sind 5,8.*

> **DIE ZUSAGE LAUTET `min(Einträge, 10)`, GELIEFERT WAREN FÜNF.** Das ist kein
> Schönheitsfehler, sondern eine Regel, die an dieser Stelle nicht galt.

### Diese Grenze stand seit 0.17.4 im Papier — als harmlos

**Änderungsprotokoll 0.17.4, Abschnitt 6.3, wörtlich:** *„Der Deckel ist eine
Höhe, keine Zahl von Einträgen … Angefasst ist das nicht, und zwar aus zwei
Gründen: erstens stünde sonst an jeder Liste eine eigene Zahl; zweitens tritt
der Fall gar nicht ein, weil die Kachel daneben („Zugang", 1055 px) der Liste
ohnehin **852 px** gibt."*

**Der zweite Grund ist mit 0.17.5 weggefallen** — dort ist genau die Zusage
zurückgenommen worden, dass eine Liste die Höhe einer höheren Nachbarin
ausnutzt. **Die Grenze wurde damit scharf, und niemand hat nachgesehen.**

> **DARAUS FOLGT STOLPERSTEIN 267**, und er ist der wichtigere der Runde: *eine
> bekannte Grenze, deren Harmlosigkeit an einer ANDEREN Zusage hängt, wird
> scharf, sobald jene zurückgenommen wird.* **Wer eine Zusage zurücknimmt, muss
> nachsehen, was auf ihr stand.**

### GEBAUT — eine Zeile im Stilblatt

```css
#msitzungen { max-height: 55.23rem; }
```

**KEINE DRITTE REGEL, SONDERN DIESELBE: zehn Zeilen, gemessen an der Zeile, die
DIESE Liste wirklich hat.** *`.mrow` misst 41,92, `.prot-zeile` 35, `.mrow.sitz`
72,55 — drei Zeilenarten, drei Maße, eine Regel.*

**55.23rem sind 828,38 Pixel, und die Rechnung steht offen da:**

| | |
|---|---:|
| zehn Sitzungszeilen zu 72,55 px | 725,50 |
| die `.sitz-fuss`, die **innerhalb** der Liste steht | 102,88 |
| **zusammen** | **828,38 px** = 55,23rem bei Wurzelschrift 15 |

**DIE FUSSZEILE GEHÖRT IN DEN DECKEL.** *Ohne sie müsste man an zehn Sitzungen
vorbeirollen, um den Knopf „Alle anderen beenden" zu sehen — er steht am Ende
der Liste und nicht darunter.*

**ÜBER DIE NUMMER UND NICHT ÜBER `:has()`.** *Welche Zeilen eine Liste trägt,
weiß das Stilblatt nicht; `:has()` wüsste es.* **Aber ein Wähler, auf den erst
seit ein paar Jahren Verlass ist, hat diese Instanz schon einmal Leerraum
gekostet (Stolperstein 256)** — und `#ex-teil-liste` macht es seit 0.17.0
genauso.

### NACHGEMESSEN — dieselbe Lage, derselbe Bestand

| | vorher | nachher |
|---|---:|---:|
| Liste | 419,25 px | **828,44 px** |
| **sichtbare Sitzungen** | **fünf** | **zehn** |
| leer unter der Liste | 453 px | **44 px** |
| Reihe „Persönlich" (Zugang / Sitzungen / Darstellung) | 1054,92 dreimal | **1054,92 dreimal** |

**Die Reihe ändert sich um keinen Pixel** — die Kachel fordert mit 828,44 plus
182,67 fixem Teil 1011 und bleibt damit unter den 1054,92, die „Zugang" setzt.

> **DIE 44 PIXEL BLEIBEN, UND DAS IST RICHTIG SO.** *Gleich hohe Reihen erzeugen
> Leerraum in der kürzeren Kachel — die starre Karte „Darstellung" daneben hat
> denselben, nur mehr davon.* **Zehn ist der Deckel und nicht „so viel, wie
> hineinpasst":** ein Deckel, der sich nach der Nachbarin richtet, wäre wieder
> die Zusage, die 0.17.5 zurücknehmen musste.

---

## 2. Eine leere Liste war eine Zeile hoch und las sich wie eine Zeile

**BEFUND.** *Wörtlich: „wenn in der Kachel nichts steht, braucht es mindestens
noch eine weitere leere Zeile, damit man checkt, da ist da nichts drin. Sonst
sieht es aus wie gefüllt, und es steht dann nichts."*

**Der Satz trifft es.** Seit 0.17.4 ist eine leere Liste **eine** Zeile hoch —
und damit stand die Meldung als **eine Textzeile zwischen zwei Absätzen** und
las sich wie einer davon. *Auf dem Bild der Karte „Anfragen" steht „Zurzeit
liegt keine bestätigte Anfrage vor." zwischen dem Knopf und dem Erklärabsatz,
und nichts daran sagt: hier ist ein Bereich, und er ist leer.*

### GEBAUT — zwei Zahlen verdoppelt

| Regel | vorher | nachher | das sind |
|---|---|---|---|
| `.manage-list > .hint` | `2.795rem` | **`5.59rem`** | zwei `.mrow` zu 41,92 px |
| `.prot-liste > .hint` | `2.333rem` | **`4.666rem`** | zwei `.prot-zeile` zu 35 px |

**ZWEI ZEILEN MACHEN AUS DER MELDUNG EINEN LEEREN BEREICH.** *Die Meldung steht
mittig darin, und darunter bleibt eine Zeile Luft, die sagt, dass hier ein Ort
ist, an dem sonst etwas stünde.*

**MEHR ALS ZWEI WÄRE EIN LOCH**, und ein Loch ist genau das, wovon die drei
Runden davor gehandelt haben.

**Nachgemessen bei 1384 × 1061:**

| | vorher | nachher |
|---|---:|---:|
| leere Meldung in einer Bedienliste (Tags, Papierkorb) | 42 px | **84 px** |
| leere Meldung im Sicherheitsprotokoll | 35 px | **70 px** |
| Karte „Papierkorb", leer und allein in ihrer Reihe | 225 px | **267 px** |

---

## 3. Was je Datei geändert wurde

| Datei | Was |
|---|---|
| `public/style.css` | **Eine neue Regel** (`#msitzungen { max-height: 55.23rem }`) mit ihrer Rechnung als Satz daneben. **Zwei Zahlen verdoppelt** an `.manage-list > .hint` und `.prot-liste > .hint`, mit dem Grund daneben. |
| `pruefung.js` | Zwei Prüfungen auf die neuen Maße der leeren Meldung, **zwei neue** am Deckel der Sitzungsliste. Rückbauzahl auf **422**. |
| `gegenprobe.js` | **Einer neu** (430 — bis 429 ist vergeben). **Zwei mitgegangen:** 389 und 392 bauen die leere Meldung jetzt auf **eine** Zeile zurück und nicht mehr auf null. |
| `Doku/Aenderungsprotokoll_0.17.4.md` | Abschnitt 6.3 bekommt den Vermerk, dass seine zweite Begründung mit 0.17.5 weggefallen ist. |
| `Doku/Aenderungsprotokoll_0.18.1.md` | **NEU** — dieses Papier. |
| `Doku/Projektstand_Kriterion_0_18_1.md` | Umbenannt; Kopf, Betriebsstand, 5.6, **Stolpersteine 267–269**, Prüfstand, Abschnitt 8, 9, 10 und 10a. |
| `README.md` | Der Satz zum Deckel nennt die Sitzungsliste. |
| `CHANGELOG.md` | Abschnitt **0.18.1**. |
| `package.json`, `package-lock.json` | Version **0.18.1**. |

---

## 4. Der Prüfstand

**4919 von 4919 grün.** *Vorher 4917 — zwei neue.*

| Prüfung | Was sie festhält |
|---|---|
| **Die Sitzungsliste deckelt nach ihrer eigenen Zeile** | `#msitzungen { max-height: 55.23rem }` |
| **Und wiederholt die Grundregel nicht** | kein zweites `flex`, kein zweites `overflow` (Stolperstein 47) |
| *Eine leere Bedienliste fällt nicht auf null zusammen* | **`5.59rem`** statt `2.795rem` |
| *Und ein leeres Protokoll ebenso wenig* | **`4.666rem`** statt `2.333rem` |

> **DIE WIRKUNG IST WIEDER GEMESSEN UND NICHT GEPRÜFT** — jsdom rechnet keine
> Lage aus (Stolperstein 223). *Die Zahlen stehen deshalb in Abschnitt 1 und 2
> und nicht in einer Prüfung, die sie nicht messen kann.*

---

## 5. Gegenproben

**422 Rückbauten, gefahren wurden die drei dieser Runde.**

| # | Rückbau | Namentlich rot |
|---|---|---|
| 389 | Die leere Bedienliste wird wieder eine Zeile hoch | „Eine leere Bedienliste faellt nicht auf null zusammen" |
| 392 | Das leere Protokoll wird wieder eine Zeile hoch | „Und ein leeres Protokoll ebenso wenig, nach seinem eigenen Mass" |
| 430 | Die Sitzungsliste deckelt wieder nach der fremden Zeile | „Die Sitzungsliste deckelt nach ihrer eigenen Zeile" |

> **DIE ZEILE „Jeder Suchtext kommt in seiner Datei genau einmal vor" IST DIE
> SELBSTPROBE UND KEIN BEFUND** — sie wird bei jedem gefahrenen Rückbau rot und
> steht deshalb in dieser Tabelle nicht (Stolperstein 213).

> **389 UND 392 SIND MITGEGANGEN, NICHT NEU.** *Bis 0.18.0 bauten sie die leere
> Meldung auf **null** zurück; jetzt bauen sie sie auf **eine** Zeile zurück —
> dieselbe Zusage, ein anderer Ausgangswert* (Stolperstein 201).

---

## 6. Neue Stolpersteine

**Drei, und sie zählen bei 267 weiter** — 266 war vergeben.

| Nr. | Kernsatz |
|---|---|
| **267** | **Eine bekannte Grenze, deren Harmlosigkeit an einer ANDEREN Zusage hängt, wird scharf, sobald jene zurückgenommen wird.** 0.17.4 hat notiert, dass der Deckel eine Höhe ist und die Sitzungsliste deshalb weniger als zehn Einträge zeigt — *„tritt nicht ein, weil die Kachel daneben ihr ohnehin 852 px gibt".* **0.17.5 hat genau das zurückgenommen, und niemand hat nachgesehen, was auf dieser Begründung stand.** *Wer eine Zusage zurücknimmt, geht die Stellen durch, die sich auf sie berufen.* |
| **268** | **Eine leere Fläche, die genau eine Zeile hoch ist, liest sich als Zeile und nicht als Leere.** Zwischen zwei Absätzen wird aus der Meldung „hier ist nichts" ein dritter Absatz. *Eine Auskunft über Leere braucht mehr Raum als das, worüber sie Auskunft gibt — zwei Zeilen genügen, drei wären ein Loch.* |
| **269** | **Die ZAHL der Rückbauten und die HÖCHSTE Rückbaunummer sind nicht dasselbe.** In `gegenprobe.js` stehen 422 Einträge, aber die Nummern reichen bis 429 — Runden, die Rückbauten fallen ließen, haben Lücken hinterlassen. *Wer die nächste Nummer aus der Anzahl ableitet, vergibt eine, die es schon gibt; der Prüfstand fängt es ab („Und keine Nummer steht zweimal"), aber erst nach einem vollen Lauf.* |

---

## 7. Die Zahlen

| | vorher (0.18.0) | nachher (0.18.1) |
|---|---|---|
| Prüfungen | 4917 | **4919** |
| Rückbauten in `gegenprobe.js` | 421 | **422** |
| höchste Rückbaunummer | 429 | **430** |
| Stolpersteine | 266 | **269** |
| Routen (`F_ROUTEN`) | 69 | **69** |
| Zwecke in `BESTAETIGUNG_ZWECKE` | 7 | **7** |
| Karten im Systembereich | 18 in 5 Abschnitten | **18 in 5 Abschnitten** |
| markierte Migrationsblöcke | 7 | **7** |
| Austauschformat | 11 | **11** |
| Abhängigkeiten | 5 + 1 zum Entwickeln | **5 + 1 zum Entwickeln** |
| Fingerprint | `0bf6ac9d` | **`7b12ead4`** |

---

## 8. Was ausdrücklich nicht passiert ist

- **Kein Quelltext außerhalb des Stilblatts.** *Die Zeichenwege liefern schon
  alles, was die beiden Zahlen brauchen.*
- **Keine neue Route, keine neue Karte, kein neues Feld.**
- **Kein Schema, kein Migrationsblock, keine neue Formatnummer.**
- **Keine neue Abhängigkeit**, auch nicht zum Messen.
- **Der Deckel der Bedienlisten und des Protokolls ist nicht angefasst** — zehn
  und fünfzehn Zeilen, wie gemessen und begründet.
- **Die Zusage aus 0.17.5 steht:** eine Liste nutzt die Höhe einer höheren
  Nachbarin **nicht** aus. *Die Sitzungsliste bekommt keinen Sonderweg, sondern
  den Deckel, der ihr nach der geltenden Regel zusteht.*
- **`:has()` ist nicht benutzt worden**, und der Grund steht im Stilblatt.
- **Keine Tags gesetzt**, kein Tag-Push.

---

## 9. Offen geblieben

**DIESE RUNDE IST IM FELD NOCH NICHT BESTÄTIGT.** *Nach dem Einspielen gehört
ein Blick in Systembereich → Datenbank → Kennzahlen:* steht dort ein anderer
Wert als der Fingerprint oben, liegt auf dem Wirt eine Datei, die kein Commit
trägt (Stolperstein 158). **Ein harter Neuladen gehört davor — geändert ist
ausschließlich das Stilblatt.**

### Was diese Runde im Feld belegen soll

1. **Der Abschnitt „Persönlich".** *Zehn Sitzungen stehen da, nicht fünf, und
   unter der Liste bleibt nur noch eine schmale Kante.*
2. **Der Papierkorb im Abschnitt „Bestand".** *Die Meldung „Keine gelöschten
   Einträge" steht in einem sichtbar leeren Bereich und nicht als Textzeile.*
3. **Die Karte „Anfragen".** *Dasselbe zwischen dem Knopf und dem
   Erklärabsatz.*

### Was aus den Runden davor weiterhin aussteht

*Unverändert; siehe Projektstand, Abschnitt 8.*
