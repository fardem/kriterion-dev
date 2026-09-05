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
| Prüfungen | 5661 | **5710** (+49, gezählt am Lauf) |
| Rückbauten in `gegenprobe.js` | 635 | **648** (+13, Nummern 642 bis 654; einer mitgezogen) |
| Stolpersteine | 317 | **321** |
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
  ist nachgezogen.
* `Doku/Projektstand_Kriterion_0_22_1.md` (per `git mv`, Revision 60): Kopf,
  Betriebsstand, Abschnitt 5.6 (**G9 bis G11**), Stolpersteine **318 bis 321**,
  Fahrplan, Versionsgeschichte.
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

### Prüfungen: 5661 → 5710 (+49, gezählt an beiden Läufen)

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

### Rückbauten: 635 → 648 (+13, Nummern 642 bis 654)

**Rückbau 330 ist mitgegangen und nicht gelöscht** (Stolperstein 201): sein
Suchtext zeigte auf den Satz im Erklärkasten, und der trägt seit E5 zwei Wörter
mehr.

### Die Gegenprobentabelle

*(wird nach dem Lauf eingesetzt)*

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
- **Der volle Gegenprobenlauf** über alle 648 Rückbauten — weiter ausstehend;
  gefahren sind die dreizehn neuen.
- **Die Papiere sagen weiterhin „Systembereich"**, wo sie Geschichte erzählen.
- **Die Ideen, die stehen geblieben sind:** die Übersicht der Tastenkürzel
  (N7), die kompakte Listenansicht (N11), die Verlaufs-Sortierungen.

---

## 0.22.1 — Fingerprint `PLATZHALTER_FP`

*Gebildet zuletzt, aus einem laufenden Server über `GET /api/stats`, nach der
letzten Änderung an einer ausgelieferten Datei — die Versionsnummer in
`package.json` und `package-lock.json` eingeschlossen; `public/` gehört dazu
(Stolperstein 158).*
