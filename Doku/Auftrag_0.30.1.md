# Auftrag 0.30.1 — „Was der Rundlauf mit 0.30.0 gefunden hat" *(Arbeitstitel)*

**IN SAMMLUNG · angelegt am 12. September 2026 · gebaut auf 0.30.0 (`2363b00a`).**

> **DIESES PAPIER IST NICHT VOLLSTÄNDIG, UND ES WIRD NICHTS DAVON GEBAUT.**
> *Der Betreiber prüft die eingespielte 0.30.0 noch am Gerät.* **Er hat es so
> angesagt:** *„notier das, ich teste da noch etwas. wenn ich dann was neues
> finde schicke ich dir eine nachricht mit den neuen befunde sonst meld ich mich
> ok das waren alle dann machst du die papiere fertig. also warte noch etwas."*
>
> **WAS HIER STEHT, IST DIE MITSCHRIFT UND KEINE ZUORDNUNG.** *Die Fragetafel
> entsteht erst, wenn die Sammlung geschlossen ist — Auflage 2 des Fahrplans:
> jede Runde hat einen Auftrag, und der Auftrag stellt seine Fragen, bevor die
> erste Zeile entsteht.*

---

## Warum PATCH und warum keine Nummer aus dem Fahrplan

**Der Betreiber hat die Nummer am 12. September 2026 gesetzt:** *„okm, dann
30.01."* **Das ist die Regel des Fahrplans und keine Ausnahme von ihr:**

> **Ein Befund aus dem Rundlauf ist eine Reparatur, und eine Reparatur hängt an
> ihrer Runde.**

*Sie ist achtmal gemessen — fünfmal von 0.24.1 bis 0.24.5, dann 0.25.1 und
0.25.2, und mit 0.28.1 ein achtes Mal über acht Befunde vom Gerät.* **Der Fahrplan rückt dadurch
nicht: 0.31.0 bleibt die Sprachdurchsicht, 0.32.0 bleibt der Ruf beim Namen,
und der Bruch bleibt auf 0.33.0.**

**Kein Schemaanteil**, keine neue Spalte, kein Migrationsblock — nach heutigem
Stand der Sammlung.

---

## Die Befunde, in der Reihenfolge, in der sie hereinkamen

### Befund 1 — „Inhalt bis" ist kein schöner Text

**Art: Verbesserung** *(Wortlaut)* · **Bild 1, die Kachel „Sicherungen"**

> **Der Betreiber wörtlich:** *„da ist noch das einfachste ‚inhalt bis xxx'. ist
> kein schöner text. Da reicht ‚Stand von xxx' fertig."*

**Was dasteht:** `card.checkUntil` — deutsch **„Inhalt bis"**, englisch
**„Content up to"**, türkisch **„İçerik şu tarihe kadar"**
*(`public/languages/*.json:90`)*. Gesetzt wird er an einer einzigen Stelle,
`public/app.js:12894`, hinter den Zahlen einer geprüften Sicherung:
*„Einträge 15 · Fotos 92 · Benutzer 1 · **Inhalt bis** 08.09.2026, 12:26"*.

**Was daraus folgt:** ein Schlüssel, drei Dateien. Deutsch steht fest —
**„Stand von"**. *Englisch und Türkisch stehen nicht fest und gehören auf die
Fragetafel; „Stand von" ist eine Hausstimme-Entscheidung, und die trifft der
Betreiber.*

> **BERÜHRUNG MIT 0.31.0:** dieser Schlüssel gehört zur Sorte, die dort in
> Gruppe 3 durchgegangen wird. **Er ist hier entschieden und damit dort
> erledigt** — nicht doppelt aufmachen.

---

### Befund 2 — Die Tagzeile: die erste Zeile bleibt leer, der Umschalter steht unten

**Art: Design** · **Bild 2, die Übersicht am Telefon** · *betrifft unmittelbar,
was BA 7 in 0.30.0 gebaut hat*

> **Der Betreiber wörtlich:** *„bitte tag in korrekter ausrichtung in die erste
> zeile und und/oder schaltfläche bitte unmittalbar in die erste zeile unter
> tags. dann wäre es 2der 2. Und Tags können glaube ich eine bis zwei stufen
> kleiner als die anderen damit mehr rein paast da auch deutlich mehr von denen
> gibt, natürlich sollten sie noch lesbar sein."*

**Was dasteht:** `.frow-tags` ist seit 0.30.0 ein Zweispalter mit zwei Zeilen
*(`public/style.css:4086–4093`)* — **„TAGS"** in Spalte 1 Zeile 1, der
Umschalter **und/oder** (`.tagmode`) in Spalte 1 **Zeile 2**, die Wolke
(`.pills.cloud`) und das rechte Ende über beide Zeilen. *Auf dem Bild steht der
Umschalter dadurch am **unteren** Ende der Wolke, weil die Wolke die Höhe
bestimmt.*

**Drei Sachen, und die dritte ist die einträglichste:**

| | |
|---|---|
| **1** | **Die Marken sollen in der ersten Zeile anfangen** und dort richtig ausgerichtet stehen |
| **2** | **Der Umschalter und/oder gehört unmittelbar unter „TAGS"** — also in die erste Zeile, nicht ans untere Ende der Wolke |
| **3** | **Die Marken dürfen ein bis zwei Stufen kleiner sein als die übrigen Pillen** *(Kategorien)* — es gibt deutlich mehr von ihnen, und so passen mehr hinein. **Grenze: lesbar müssen sie bleiben** |

> **EINE STELLE IST UNKLAR UND WIRD NACHGEFRAGT:** *„dann wäre es 2der 2."*
> **Das wird nicht geraten.** *(siehe „Was nachgefragt werden muss")*

---

### Befund 3 — Der Wochentag frisst Platz, den das Telefon nicht hat

**Art: Design** · **Bild 3, die Testtage im Eintrag**

> **Der Betreiber wörtlich:** *„Also im mobil ansicht einfach das wochentag
> nicht anzeigen. nimmt zu viel platz weg. wir können auch die regeln aufstellen
> wenn für den kein platz da ist (im gegensatz zu einem ultra und max phone oder
> tablet) fällt der raus."*

**Was dasteht:** `weekday(day)` *(`public/app.js:224`)* setzt den ausgeschriebenen
Wochentag in `.tweek` *(`public/app.js:7443`)*, und `.tweek` steht in jeder
Testtagzeile zwischen Datum und Marken *(`public/style.css:1686`)*. **Auf dem
Bild sind das „Dienstag", „Sonntag", „Mittwoch" — und sie kosten die Breite, an
der die Zeile umbricht.**

**Was daraus folgt:** die **Regel**, nicht das Gerät. *Das Haus fragt keine
Gerätenamen ab; es fragt die Breite — `@container`, so wie die Vokabelkarte in
0.30.0.* **Ist der Platz da, bleibt der Wochentag; ist er es nicht, fällt er
weg.** *Auf einem Ultra, einem Max oder einem Tablet steht er damit weiter da,
ohne dass irgendwo ein Gerätename im Quelltext steht.*

---

### Befund 4 — Die Testtagzeile ordnet sich nicht nach dem, was in ihr steht

**Art: Design** · **Bild 3, dieselben Zeilen**

> **Der Betreiber wörtlich:** *„wenn die tage keine tags haben, rechts von datum
> und rechts ausgerichtet. Haben Tage datum und sie passen nicht in eine reihe
> dann rutschen die sterne wie im untersten beispiel in die 2. zeile und erste
> zeile ist dann nur datum die tags. und sind mehr tags das die nicht in einer
> reihe dargestellt werden können dann rechts ein mehr button anbieten, oder auf
> dem handy rollbar machen."*

**Was dasteht:** `.trow` ist ein Flexkasten aus Datum (`.tdate`), Wochentag
(`.tweek`), Markenkasten (`.ttags`, `flex: 1`), Sternen und Papierkorb; schmal
bekommt er `flex-wrap: wrap` *(`public/style.css:4465`)*. **Der Markenkasten
nimmt sich die ganze übrige Breite — auch dann, wenn gar keine Marke darin
steht.** *Deshalb rutschen die Sterne im untersten Beispiel des Bildes
(31.12.2025, keine Marken) in die zweite Zeile und stehen dort links, obwohl
neben dem Datum die halbe Zeile frei ist.*

**Drei Fälle, und sie sind eine Rangfolge:**

| | Fall | Soll |
|---|---|---|
| **1** | **Der Tag hat keine Marken** | **Sterne rechts vom Datum und rechtsbündig** — eine Zeile, kein Umbruch |
| **2** | **Der Tag hat Marken, und Datum + Marken + Sterne passen nicht in eine Zeile** | **Die Sterne rutschen in die zweite Zeile** *(wie im untersten Beispiel)*, die erste trägt dann **nur Datum und Marken** |
| **3** | **Es sind so viele Marken, dass sie nicht in eine Zeile passen** | **Rechts ein Knopf „mehr"** — *oder* am Telefon **rollbar** |

> **FALL 3 TRÄGT EIN ODER, UND DAS IST EINE ENTSCHEIDUNG UND KEINE
> Geschmacksfrage.** *Ein Knopf „mehr" ist eine zweite Bedienung an einer Zeile,
> die schon zwei hat (Marke abräumen, Marke anlegen); rollbar ist keine
> Bedienung, versteckt aber, dass da noch etwas ist.* **Sie gehört auf die
> Fragetafel.**

---

## Was nachgefragt werden muss, bevor die Fragetafel entsteht

| | Stelle | Warum es nicht geraten wird |
|---|---|---|
| **1** | **„dann wäre es 2der 2"** *(Befund 2)* | Der Satz steht zwischen den beiden Bitten und dem Vorschlag zur Schriftgröße. **Er kann „beide zusammen ergeben zwei Zeilen statt zwei" heißen, „zwei von zwei erledigt" — oder etwas Drittes.** *Ein geratener Satz wird zu einer gebauten Zeile, und die steht dann falsch da* |
| **2** | **„Haben Tage datum und sie passen nicht in eine reihe"** *(Befund 4, Fall 2)* | **Gelesen als „haben Tage MARKEN"** — sonst wäre der Fall derselbe wie Fall 1, und die beiden Sätze widersprächen sich. **Die Lesart ist plausibel, aber sie ist eine Lesart** |
| **3** | **Englisch und Türkisch zu „Stand von"** *(Befund 1)* | Der Wortlaut ist eine Entscheidung des Hauses, und sie fällt in allen drei Dateien zugleich |
| **4** | **„mehr" oder rollbar** *(Befund 4, Fall 3)* | Der Betreiber hat beides genannt und keins ausgeschlossen |

---

## Wie es weitergeht

1. **Der Betreiber prüft weiter.** *Kommt etwas, kommt es als Nachricht und
   wandert hier unten an.*
2. **Sagt er „das waren alle", wird dieses Papier fertiggeschrieben:** die vier
   Fragen oben werden zur **Fragetafel**, jede bekommt einen Vorschlag, und
   **Regel 11 gilt wie in den vier Runden davor — gebaut wird erst, wenn jede
   Antwort im Papier steht.**
3. **Erst dann** entstehen Bauabschnitte, Prüfungen und Gegenproben.

> **DREI DER VIER BEFUNDE STEHEN AN ZWEI STELLEN, DIE 0.30.0 GERADE ANGEFASST
> HAT** *(die Tagzeile, die Zeilen im Eintrag)*. **Das ist kein Rückschlag,
> sondern der Rundlauf, wie er gedacht ist:** *gebaut, eingespielt, am Gerät
> angesehen, nachgebessert.*
