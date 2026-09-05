# Änderungsprotokoll 0.22.1 — „Der Ausschnitt bedient sich wie ein Ausschnitt, und die Kopfzahl steht einmal da"

**Drei Befunde aus dem Rundlauf von Hand nach 0.22.0**, am 5. September 2026 am
laufenden Server mit Fingerprint `fd292332` gemeldet, einer davon mit Bild.
*Dieselbe Herkunft wie 0.21.1 nach 0.21.0, 0.20.1 nach 0.20.0 und 0.17.1 nach
0.17.0: die Runde ist eingespielt, und der erste Mensch, der sie bedient,
findet, was kein Prüflauf findet.* **Keiner der drei Punkte stand je im
Sammelblatt, und keiner im Fahrplan.**

**Sieben Entscheidungen** hat der Betreiber am 5. September 2026 dazu getroffen
(E1 bis E7), **vor dem Bauen**; sechs folgen der Empfehlung des Auftrags, **E2
nicht** — sie nimmt zu den vier Ecken auch die vier Kanten.

**Was ein Betreiber merkt:** *der Bildausschnitt lässt sich schieben und an
Ecken und Kanten ändern, die Kopfzahl steht nur noch einmal da, und an
ungetesteten Einträgen gibt es keinen Bewertungskasten mehr.*

---

## Diese Runde ist KEINE Datenbankstufe — ausdrücklich

**Kein Migrationsblock, keine Spalte, kein Bestandslauf, keine neue Route, kein
neues Modul, keine neue Datei, keine neue Abhängigkeit, keine neue Karte, kein
neues Vokabelwort.** Austauschformat **13**, `F_ROUTEN` **70**, einundzwanzig
Karten, neun Migrationsblöcke, neun ausgelieferte Module, vierzehn
Vokabelwörter, neun persönliche Schlüssel — unverändert.

**Eine vorhandene Route hat eine Klemme bekommen:** `PUT
/api/items/:id/ratings` weist einen Wert größer null auf ein Kriterium der Phase
`nachher` an einem ungetesteten Eintrag ab. *Eine Klemme ist keine neue Route;
`F_ROUTEN` bleibt bei 70.*

> **DER RÜCKWEG AUF 0.22.0 IST OFFEN.** *Eine ältere Fassung zeigt den
> Bewertungskasten an einem ungetesteten Eintrag wieder, nimmt dort auch wieder
> Sterne an, und die Kopfzahl steht dort wieder zweimal.* **Die Daten sind
> dieselben — es wird nichts umgerechnet und nichts geschrieben.** *Eine
> Sicherung schadet nie, ist hier aber nicht nötig.*

**Nach dem Einspielen im Browser einmal hart neu laden** — `public/app.js` und
`public/style.css` haben sich geändert.

---

## Was diese Runde an den Zahlen ändert

| | vorher (0.22.0) | nachher (0.22.1) |
|---|---|---|
| Prüfungen | 5661 | **5713** (+52, gezählt am Lauf) |
| Rückbauten in `gegenprobe.js` | 635 | **649** (+14, Nummern 642 bis 655; zwei mitgezogen) |
| Stolpersteine | 317 | **323** |
| Gestaltungsregeln in 5.6 | G1 bis G8 | **G1 bis G11** |
| Gesten am Bildausschnitt | 2 | **5** — und **8 Griffe** am Rahmen |
| `F_ROUTEN` · Karten · Austauschformat · Vokabelwörter | 70 · 21 · 13 · 14 | unverändert |
| angefasste Quelldateien | — | `public/app.js`, `public/style.css`, `server.js` |

---

## 1. Die sieben Entscheidungen und ihre Begründung

| | Frage | Entschieden | Warum |
|---|---|---|---|
| **E1** | Was tut ein Klick ohne Weg? | **Außerhalb: den Punkt setzen wie bisher. Innerhalb: nichts.** | Ein Griff in den Rahmen, der sich nicht bewegt, ist ein misslungener Griff — und der darf nichts verändern. Außerhalb bleibt der Klick der schnelle Weg, den es seit 0.19.x gibt und auf den das Telefon baut. |
| **E2** | Nur die vier Ecken, oder auch die Kanten? | **Ecken UND Kanten — acht Griffe.** *Abweichend von der Empfehlung.* | Was jeder aus anderen Programmen kennt, soll auch hier gehen. Der Preis ist eine zusätzliche Regel — was die Kante bei einem Quadrat mit der zweiten Achse tut —, und die ist im Auftrag als 1.3a entschieden worden, nicht beim Bauen erfunden. |
| **E3** | Greifzone und Finger? | **12 Bildpunkte, am Rahmen gedeckelt auf ein Viertel der Kante. Auf dem Finger nur Schieben.** | Eine Zone von zwölf Bildpunkten trifft keine Fingerkuppe, und ein zweiter Weg, der auf dem Telefon danebengeht, ist schlechter als keiner. Der Deckel hält an einem kleinen Rahmen Fläche zum Schieben frei. |
| **E4** | Welche der beiden Zahlen fällt? | **Die Kurzfassung, solange eine Kopfzahl dasteht.** Keine zweite Zahl („meine" gegen „alle"). | Die Kopfzahl trägt „gewichtet", sagt im Titel, wessen Zahl sie ist, und **ist** der Knopf zur Rechnung — sie ist die reichere von beiden. Eine zweite Zahl wäre eine neue Angabe und gehört nicht in eine PATCH-Runde. |
| **E5** | Sagt die Zahl, wessen sie ist — und wo? | **Im Titel des Knopfes und als Halbsatz im Erklärkasten.** | Der Titel steht beim Überfahren und im Vorleseprogramm; der Erklärkasten ist der Ort, an dem die Zahl erklärt wird, und er erklärte sie bis 0.22.0 nur zur Hälfte. **Ohne Bedingung auf die Zahl der Zugänge** — sonst gäbe es zwei Sätze über dieselbe Rechnung (Stolperstein 47). |
| **E6** | Ungetesteter Eintrag mit vorhandenen Bewertungssternen? | **Der Kasten steht da, offen.** | Die Ausnahme steht seit 0.21.0 im Quelltext und ist begründet: vorhandene Daten schlagen die Regel. Ohne sie wären vergebene Sterne unsichtbar **und** unerreichbar — man könnte sie nicht einmal mehr entfernen. |
| **E7** | Bleibt es bei PATCH? | **Ja — 0.22.1.** | Keine Route, keine Spalte, keine Karte, kein Vokabelwort, keine Funktion kommt dazu, und kein gespeicherter Wert ändert sich. Die Wegnahme aus Bauabschnitt 3 steht als fette `Changed`-Zeile im Changelog, wie die geänderte Trefferzahl in 0.21.1. |

---

## 2. Was gebaut wurde, je Datei

### `public/app.js`

**`ausschnittGeste(rahmen, px, py, griff)` — neu, auf Modulebene.** Sie bekommt
den Rahmen und einen Punkt, beide im Bildmaß, und antwortet mit einem Wort:
`neu`, `schieben` oder einer der acht Griffe. **Sie kennt weder ein Ereignis
noch den Betrachter** — dieselbe Bauform wie `zuschnittKiste()` und aus
demselben Grund: was der Prüfstand nur über ein Zeigerereignis erreicht, prüft
er nicht. *Die Ecke wird vor der Kante gefragt und gewinnt deshalb, wo beide
Zonen sich überlappen; der Griff ist auf ein Viertel der Kante gedeckelt.*

**`GRIFF_ZEIGER` und `GRIFF_KLASSEN` — neu.** Eine Tafel je Geste statt acht
Zeilen im Stilblatt: der Zeiger hängt an der Geste und nicht am Ort.

**`ruesteAusschnittAus()` — der Kern der Runde.** An die Stelle von `start`,
`rechteck` und drei Behandlern treten:

* `rahmenKiste()` und `imBild(e)` — der Rahmen und der Zeiger im selben Maß.
* **`setzeLage(l, o)`** — nur die Lage. **Das Schieben geht durch diesen Weg und
  nicht durch `setzeKiste()`**, damit die Zusage „schieben ändert die Weite
  nicht" **baulich** erfüllt ist und nicht davon abhängt, dass die Rastung
  zufällig denselben Wert zurückgibt.
* **`setzeKiste(kanteWunsch, lage, deckel)`** — Weite und Lage in einem Zug.
  **Die Rastung kommt vor der Lage**, und das ist der ganze Kniff: `lage`
  bekommt die **gerastete** Kante und antwortet mit der linken oberen Ecke.
  Läge der Rahmen nach der ungerasteten Kante, wanderte der feste Anker bei
  jedem Zug um bis zu eine halbe Stufe — genau die Ecke, die stillstehen soll.
  *Der `deckel` begrenzt die **Kante**, nicht die Lage: sonst schöbe die Klemme
  den Rahmen zurück ins Bild und damit den Anker.*
* **`zieheGriff(geste, k, p, f)`** — die Anker der acht Griffe, je einer je
  Geste. An einer Ecke steht die gegenüberliegende Ecke still; an einer Kante
  die gegenüberliegende Kante, und die andere Achse geht symmetrisch um **deren
  Mitte** mit.
* `ausRechteck(a, e)` — unverändert in der Rechnung, aber nur noch **außerhalb**
  des Rahmens erreichbar.
* `schiebe(zug, e)` — der Zeiger behält seine Stelle **im** Rahmen; ohne den
  gemerkten Abstand spränge der Rahmen mit seiner linken oberen Ecke unter den
  Zeiger.
* `zeigeGriff(geste)` — setzt die Zeigerklasse am Betrachter.
* Die Behandler: `pointerdown` merkt Geste, Anker und Startpunkt;
  `pointermove` zeichnet ab sechs Bildpunkten Weg oder — ohne laufenden Zug —
  setzt nur den Zeiger; `pointerup` fährt **denselben** Weg ein letztes Mal
  **mit dem Anker vom Anfang** und speichert; `pointerleave` räumt die
  Zeigerklasse ab; **`pointercancel` ist neu** und speichert, was dasteht.

**`drawViewer()`** räumt beim Verlassen des Modus jetzt **fünf** Behandler ab
statt drei und nimmt die Zeigerklassen mit.

**`blockZusammenfassung()`** gibt für `bewertung` und `potenzial` **nichts**
zurück, sobald eine Kopfzahl dasteht; ohne Zahl bleibt der Satz, **je Kasten
mit eigenem Wort**.

**`blockWegNachZustand(name, item)` — neu**, und `ruesteBloeckeAus()` setzt
danach `block.hidden`. **Der Block wird ausgeblendet und nicht entfernt** —
`#rhead` und `#ratings` bleiben im Dokument, und die Blockreihenfolge in
`BLOECKE` bleibt unangetastet: sie gilt für **alle** Einträge, und ein Eintrag,
an dem ein Block fehlt, darf sie nicht umschreiben.

**Der Titel der Kopfzahl** und **ein Halbsatz im Erklärkasten** nennen die
Menge, über die gerechnet wird. **Die Meldung beim Einschalten des
Ausschnittmodus** ist neu geschrieben.

### `public/style.css`

Fünf Zeilen für die Zeiger je Griff, **je zwei Wähler** — der Betrachter trägt
die Klasse, das Bild trägt seinen Zeiger selbst, und eine Angabe am Betrachter
schlägt die Regel am `img` nicht.

### `server.js`

`qKritPhase` und `qItemGetestet` — zwei vorbereitete Abfragen —, dazu die
Klemme in `PUT /api/items/:id/ratings`. **Geprüft wird nur ein Wert größer
null:** eine Null nimmt weg, und wegnehmen muss immer gehen. **Und nur die
Phase `nachher`:** das Potenzial ist die Frage vor dem Test.

### `pruefung.js`, `gegenprobe.js`

Siehe Abschnitt 4.

### Die Papiere

* `Doku/Aenderungsprotokoll_0.22.1.md` — dieses Blatt.
* `Doku/Auftrag_0.22.1.md` — der Auftrag samt der Kantenregel 1.3a; der Auftrag
  zu 0.22.0 ist mit ihm weggefallen, und der Verweis darauf im Konzeptpapier
  ist nachgezogen. ***Er ist seinerseits mit dem Auftrag zu 0.23.0
  weggefallen** — es liegt immer nur einer im Repo; was gebaut wurde, steht in
  diesem Blatt.*
* `Doku/Projektstand_Kriterion_0_22_1.md` (per `git mv`, Revision 60): Kopf,
  Betriebsstand, Abschnitt 5.6 (**G9 bis G11**), Stolpersteine **318 bis 322**,
  Fahrplan, Versionsgeschichte, Prüfstandszahlen.
* `README.md` — der Absatz zum Bildausschnitt, der Absatz zu den zwei
  Sternkästen, der Satz zum Gesamtschnitt.
* `CHANGELOG.md`, `package.json`, `package-lock.json`.

---

## 3. Die fünf Gesten — was die Runde am Bildschirm ändert

| wo die Berührung anfängt | vorher (0.22.0) | nachher (0.22.1) |
|---|---|---|
| außerhalb des Rahmens | neuer Ausschnitt | **neuer Ausschnitt** — unverändert |
| im Rahmen | neuer Ausschnitt *(der alte war fort)* | **schieben**; `zoom` bleibt |
| auf einer Ecke | neuer Ausschnitt | **Weite ändern**; die gegenüberliegende Ecke bleibt liegen |
| auf einer Kante | neuer Ausschnitt | **Weite ändern**; die gegenüberliegende Kante bleibt liegen, die andere Achse geht symmetrisch mit |
| Klick ohne Weg, außerhalb | Punkt setzen | **Punkt setzen** — unverändert |
| Klick ohne Weg, im Rahmen | Punkt setzen | **nichts** |
| Finger im Rahmen | neuer Ausschnitt | **schieben** |
| Zeiger vor dem Drücken | überall `crosshair` | **fünf Zeichen je Geste** |

*Was sich NICHT geändert hat: `zuschnittKiste()`, die Rastung auf die
Fünferstufen, der Schieber, der eine Speicherweg, `focus_x`, `focus_y`, `zoom`
und der Rahmen als `pointer-events: none`.*

---

## 3a. Der Augenschein — gefahren, nicht behauptet

**Chromium 1194 am laufenden Server, 1400 × 950, ein Foto von 240 × 160 mit vier
verschieden gefärbten Vierteln.** *Gefahren wird mit einer echten Maus über
`page.mouse`; die Lagen sind aus `getBoundingClientRect()` des Rahmens gelesen
und auf ganze Bildpunkte gerundet.* **Das ist der Teil, den jsdom nicht leisten
kann** — dort rechnet kein Layout, und die Prüfungen bekommen ein gestelltes
Rechteck untergeschoben (Stolperstein 106).

| Geste | gemessen | die Zusage dahinter |
|---|---|---|
| Rahmen beim Öffnen | `172 / 81`, Kante **383**, bei 100 % | die kurze Seite, mittig |
| **neu aufgezogen** ab (142, 101) | Rahmen `143 / 102`, Kante 96, 400 % | **die linke obere Ecke sitzt, wo der Zug anfing** (ein Bildpunkt Rundung) |
| **geschoben** um +40 | links `143 → 183`, **Kante 96 → 96**, **400 % → 400 %** | *das Schieben rührt die Weite nicht an* |
| **Ecke nach innen** (am engsten Zoom) | links `183 → 183`, oben `102 → 102`, Kante `96 → 96` | *kein Spielraum mehr — die Geste greift, die Grenze hält; der Zeiger stand auf `griff-nwse`* |
| **Kante links nach außen** | **rechts `279 → 278`**, **Mitte `150 → 150`**, Kante `96 → 134`, 400 % → 285 % | *die gegenüberliegende Kante bleibt liegen, und der Mittelpunkt wandert auf ihr nicht* (Regel 1.3a) |
| **Ecke nach außen** | Kante `134 → 196`, **feste Ecke `(144, 83) → (144, 83)`** | *die gegenüberliegende Ecke steht still — auf den Bildpunkt* |
| **Klick im Rahmen ohne Weg** | `144 / 83`, Kante 196 → **unverändert** | Entscheidung **E1** |

**Und der Zeiger sagt es vorher, am echten Element gemessen:** in der Mitte
`griff-schieben`, an der Ecke `griff-nwse`, an der Kante `griff-ew`, außerhalb
**keine** Griffklasse.

*Acht Bildschirmfotos sind dabei entstanden; sie liegen nicht im Repo — **keine
Binärdateien** (Bauregel).*

---

## 4. Prüfstand und Gegenproben

### Prüfungen: 5661 → 5713 (+52, gezählt am Lauf)

**Neu belegt:**

1. **Die Gestenentscheidung, ohne Zeiger** — außen, innen, jede der vier Ecken,
   jede der vier Kanten, die Überlappung (die Ecke gewinnt), die Breite der
   Zone auf beiden Seiten der Grenze, und der Deckel am kleinen Rahmen.
2. **Am lebenden Objekt, mit echten Zeigerereignissen:** ein neuer Ausschnitt
   sitzt mit seiner linken oberen Ecke dort, wo der Zug anfing; das Schieben
   rührt den Zoom nicht an; die feste Ecke und die feste Kante bleiben liegen;
   der Mittelpunkt wandert auf der festen Kante nicht; keine Geste bringt den
   Rahmen aus dem Bild; ein Griff ohne Weg speichert nicht und verstellt
   nichts; ein Klick außerhalb speichert weiter; der Zeiger sagt es vorher; der
   Finger schiebt, statt die Weite zu ändern.
3. **Die Kopfzahl steht genau einmal** — keine Kurzfassung, solange eine
   Kopfzahl dasteht; **und die Zahl steht trotzdem da**. Ohne Zahl trägt die
   Kurzfassung ihren Satz.
4. **Sie sagt, wessen Zahl sie ist** — im Titel, in **beiden** Kästen mit
   demselben Wortlaut, und im Erklärkasten.
5. **An einer Idee gibt es den Bewertungskasten nicht**, mit vorhandenen
   Sternen steht er **sichtbar** da, und der Schalter „Getestet" holt ihn
   zurück.
6. **Der Server weist ab** — Verfasser wie Admin, mit Grund, ohne dabei zu
   schreiben; das Potenzial geht weiter, `value: 0` geht weiter, und am
   getesteten Eintrag nimmt die Route wieder an.

**Umgedreht statt gelöscht (Stolperstein 74):**

* *„Und der zugeklappte Kopf nennt seine Zahl"* — gemeint war die Kurzfassung.
  Sie ist zu **zwei** Zusagen geworden: keine Kurzfassung mehr, und die Zahl
  steht trotzdem da. *Die erste allein belegte nichts — sie wäre auch dann
  grün, wenn der ganze Kopf leer bliebe.*
* *„An einer Idee ohne Bewertungssterne steht das Potenzial offen und die
  Bewertung zu"* — der zweite Halbsatz ist „und den Bewertungskasten gibt es
  dort gar nicht" geworden.
* **Der Blick wird jetzt am Potenzialkasten gesetzt und nicht mehr an der
  Bewertung:** deren Kopfzeile steht an einer Idee nicht da, und ein Klick auf
  einen Kasten, den niemand sehen kann, belegte nichts. *Die Frage bleibt
  dieselbe — überlebt ein Blick das Umlegen des Schalters?*

**Prüflagen, die ihre Bedingung jetzt aussprechen.** Vier Lagen legten einen
Eintrag an und bewerteten ihn sofort; ein neuer Eintrag kommt ungetestet auf die
Welt, und die Route weist das seit dieser Runde ab. *Sie sagen jetzt, dass der
Eintrag getestet ist — die Zusagen selbst sind unverändert.* **Eine fünfte Lage
legt ihren Eintrag ausdrücklich neu an, statt einen vorhandenen umzuschalten:**
„Getestet" lässt sich nicht zurücknehmen, solange Testtage eingetragen sind
(0.13.x), und beide Einträge jener Lage tragen welche.

### Rückbauten: 635 → 649 (+14, Nummern 642 bis 655)

**Zwei sind mitgegangen und nicht gelöscht** (Stolperstein 201): **330**, dessen
Suchtext auf den Satz im Erklärkasten zeigt — der trägt seit E5 zwei Wörter
mehr —, und **646**, dessen Zeile sich beim Beheben des Fundes verschoben hat,
den er selbst zutage gefördert hat.

**Und einer ist AUS der Gegenprobe entstanden: 655.** *Er nimmt die Regel
zurück, die dieser Lauf erzwungen hat — die Rastung darf den Deckel nicht
überspringen.*

### Die Gegenprobentabelle

**14 Rückbauten, 4 Nebenspuren, Versatz 3500 je Spur — 14 von 14 rot, 0 STUMM.**
*646 hat drei Anläufe gebraucht, und beide Male, die er nicht traf, waren ein
Fund — erst am Prüfstand, dann an der Instanz selbst.* *Gefahren gegen `f88479a`, jede in einer eigenen Kopie aus
`git archive HEAD`; der Arbeitsbaum wurde nicht angefasst. Jeder Lauf meldet
denselben Nenner, **5710** — die Zahl ist damit dreizehnmal unabhängig
bestätigt.* **Was danach am Prüfstand noch dazugekommen ist** (die zweite Ecke
und der gehärtete Rücksetzer, `e58b910`), **ändert an keinem dieser Rückbauten
etwas** — außer an 646, und der ist eigens nachgefahren.

> **EIN ERSTER LAUF IST VERWORFEN WORDEN.** *Der Prüfstand zählt die
> Rückbauten, und die Zahl stand nach dem Eintragen der dreizehn neuen noch auf
> 635 — jeder Durchgang hat deshalb die Zeile „Es sind genau 635 Rückbauten"
> mitgezählt, und alle Zahlen waren um eins zu hoch. Ein Beleg, der eine
> falsche rote Zeile enthält, ist kein Beleg.*

> **DIE ZEILE „Jeder Suchtext kommt in seiner Datei genau einmal vor" WIRD IN
> FAST JEDEM LAUF ROT** — der Rückbau hat den Suchtext ja gerade ersetzt. *Sie
> sagt nichts über den einzelnen Rückbau und steht trotzdem in der Tabelle,
> damit niemand sie für einen Fund hält.*

| # | Rückbau | Namentlich rot |
|---|---|---|
| 642 | Der Rahmen verliert seine acht Griffe | 12 Prüfungen, darunter „Die vier Ecken tragen ihre vier Namen" (2 Gruppen) |
| 643 | Die Kante gewinnt wieder gegen die Ecke | 4 Prüfungen, darunter „Die vier Ecken tragen ihre vier Namen" (Gruppe „Die fuenf Gesten am Ausschnitt — 0.22.1") |
| 644 | Die Greifzone wird am kleinen Rahmen nicht mehr gedeckelt | „An einem kleinen Rahmen bleibt Flaeche zum Schieben", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 645 | Das Schieben aendert die Weite wieder mit | „Und er ruehrt die Weite nicht an", „Ein Finger an der Ecke schiebt, statt die Weite zu aendern", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 646 | Die feste Ecke wandert wieder mit der Rastung | **dreimal gefahren, siehe unten.** *(1)* rot allein an den KANTEN; *(2)* nach der zweiten Ecke und dem gehärteten Rücksetzer **STUMM** — die Abweichung lag mit 0,148 px unter der Toleranz; *(3)* mit enger Schranke: **4 Prüfungen, darunter „Und die rechte untere Ecke bleibt dabei liegen" (2 Gruppen)** |
| 647 | Die Kante verschiebt den Mittelpunkt wieder | „Und der Mittelpunkt wandert auf ihr nicht", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 648 | Ein Griff ohne Weg setzt wieder den Punkt | „Ein Griff IM Rahmen ohne Weg speichert nichts", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 649 | Der Zeiger sagt wieder nicht, was geschehen wird | 4 Prüfungen, darunter „Ueber dem Rahmen zeigt der Zeiger das Schieben an" (2 Gruppen) |
| 650 | Der Finger bekommt die acht Griffe doch | „Ein Finger an der Ecke schiebt, statt die Weite zu aendern", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 651 | Die Kopfzahl steht wieder zweimal da | „Der zugeklappte Kopf traegt keine Kurzfassung mehr", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 652 | Der Bewertungskasten steht wieder an jeder Idee | „Und den Bewertungskasten gibt es dort gar nicht", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 653 | Der Server nimmt die Bewertung am ungetesteten Eintrag wieder an | 7 Prüfungen, darunter „Am ungetesteten Eintrag wird der Verfasser abgewiesen" (3 Gruppen) |
| 654 | Die Kopfzahl sagt nicht mehr, wessen Zahl sie ist | „Die Kopfzahl sagt im Titel, dass sie ueber alle geht", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 655 | Die Rastung springt wieder ueber den Deckel *(aus der Gegenprobe entstanden)* | „Und der Mittelpunkt wandert auf ihr nicht", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |

### Der Fund aus der Gegenprobe: die geprüfte Ecke war die immune

**Rückbau 646 legt den Rahmen nach der UNGERASTETEN Kante** — genau das, was
`setzeKiste()` verhindert. **Rot wurde er trotzdem nur an den beiden
Kanten-Zusagen; die Zusage „und die gegenüberliegende Ecke bleibt liegen" blieb
grün.**

**Der Grund steht im Quelltext.** Die geprüfte Ecke war die untere rechte, und
die zieht `rechts-unten`: ihr Anker ist die **linke obere** Ecke, und `lage()`
gibt dort schlicht `{ l: k.links, o: k.oben }` zurück — **die gerastete Kante
kommt darin gar nicht vor.** An dieser einen Ecke kann der Rückbau also nichts
verschieben. *Die Zusage war richtig; sie stand nur an der einzigen der vier
Ecken, an der sie nichts sehen konnte.*

**Behoben mit zwei Zusagen an der oberen linken Ecke** (`e58b910`), deren Anker
`rechts - e` und `unten - e` sind und damit an der Rastung hängen. **Dazu ein
Rücksetzer, der seinen Startpunkt sucht statt ihn zu raten:** der neue Eckzug
zieht den Rahmen so weit auf, dass der bisherige feste Startpunkt (60, 60) darin
liegt — der nächste „neue Ausschnitt" wäre gar keiner gewesen, sondern ein
Schieben.

> **DAS IST DER ZWECK DER GEGENPROBE, wörtlich:** *eine Prüfung, die grün ist,
> belegt nichts, solange niemand gezeigt hat, dass sie auch rot werden kann.*
> Hier war sie grün **und** rot-fähig — nur nicht an dem Fall, den sie zu
> tragen vorgab. **Als Stolperstein 322 aufgeschrieben.**

### Und der zweite Fund: die Schranke war größer als der Fehler

**Mit der zweiten Ecke wurde 646 nicht etwa rot, sondern STUMM.** *Der neue
Rücksetzer legte die Zahlen so, dass der Rückbau den Anker nur um **0,148 px**
verschob — und die Zusagen trugen eine Toleranz von einem halben Bildpunkt.*
**Eine Schranke, die größer ist als der Fehler, den sie fangen soll, fängt ihn
nicht** (Stolperstein 323). *Seither steht dort **0,01**: der richtige Weg
trifft den Anker exakt, und mehr als Gleitkommarauschen darf nicht dastehen.*

**Und die enge Schranke hat sofort einen echten Mangel gezeigt — an der
Instanz, nicht am Prüfstand:** rastet die Kante auf die nächste Fünferstufe
**nach oben**, wird sie größer als der Deckel, den `setzeKiste()` gerade gesetzt
hat; der Rahmen passt nicht mehr an seinen Anker, und die Klemme in
`setzeLage()` schiebt ihn ins Bild zurück — **0,217 px am Mittelpunkt einer
Kante.** *`setzeKiste()` zieht in diesem Fall seither eine Stufe enger; der
Anker sitzt wieder exakt, und die Zahl am Schieber bleibt eine Fünferstufe.*
**Rückbau 655 hält die Regel fest — er ist aus der Gegenprobe entstanden und
nicht aus dem Auftrag.**

> **DER FUND LAG DIE GANZE ZEIT UNTER DER TOLERANZ.** *Er wäre mit „13 von 13
> rot" durchgegangen.*

---

## 5. Was ausdrücklich NICHT gebaut wurde

- **Kein Seitenverhältnis, kein rechteckiger Ausschnitt, keine zweite
  Kachelform.** Die Kachel ist quadratisch, und drei Zahlen beschreiben den
  Ausschnitt vollständig.
- **Keine Änderung an `zuschnittKiste()`** — und damit keine an der Rechnung,
  die der Server ein zweites Mal fährt (Stolperstein 293).
- **Kein Rückgängig für den Ausschnitt, keine Vorschau der Kachel neben dem
  Rahmen, kein Raster, kein zweites Kreuz.**
- **Keine zweite Zahl im Kopf** — „meine" gegen „alle" wäre eine neue Angabe
  (E4).
- **Keine neue Karte, kein Umzug einer Karte, keine neue Einstellung.** *Ob der
  Bewertungskasten an einer Idee steht, ist eine Regel und keine persönliche
  Wahl.*
- **Keine neue Farbe, kein helles Farbschema** — das ist 0.23.0.
- **Die drei Zeilen aus dem Augenschein zu 0.22.0** (Telefontitel, Leerzeichen
  vor der Klammer, Gewichtssatz) sind **nicht** mitgegangen; sie stehen weiter
  aus.

---

## 6. Was offen geblieben ist

- **Die drei Beobachtungen aus dem Augenschein zu 0.22.0**, alle drei älter als
  jene Runde: der Eintragstitel wird auf dem Telefon rechts abgeschnitten statt
  umgebrochen; das Leerzeichen vor der Klammer in „Mit Fotos (~ 301,5 KB )";
  der Satz zum Gewicht in „Bewertung: Kriterien" für den Benutzer.
- **Das helle Farbschema — 0.23.0**, mit dem Farbkonzept davor
  (`Doku/Farbkonzept_0_23_0.md`, noch nicht geschrieben; Projektstand 10a).
- **Die Mehrsprachigkeit** (0.28.0).
- **Die beiden Handgriffe aus 0.20.0** — eine eigene Datei in den
  Sicherungsordner legen, und die Zeile im Sicherheitsprotokoll je entfernter
  Kopie. *Sie stehen seit 0.20.1 in dieser Liste.*
- **Der volle Gegenprobenlauf** über alle 649 Rückbauten — weiter ausstehend;
  gefahren sind die vierzehn neuen (646 dreimal, 655 einmal).
- **Die Papiere sagen weiterhin „Systembereich"**, wo sie Geschichte erzählen.
- **Die Ideen, die stehen geblieben sind:** die Übersicht der Tastenkürzel
  (N7), die kompakte Listenansicht (N11), die Verlaufs-Sortierungen.

---

## 0.22.1 — Fingerprint `15c9b736`

*Gebildet zuletzt, aus einem laufenden Server über `GET /api/stats`, nach der
letzten Änderung an einer ausgelieferten Datei — die Versionsnummer in
`package.json` und `package-lock.json` eingeschlossen; `public/` gehört dazu
(Stolperstein 158).*
