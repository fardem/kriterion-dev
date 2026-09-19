# Auftrag 0.37.0 — „Die Kommentare werden verdichtet"

Geschrieben am 19. September 2026. Nicht gebaut. Läuft nach 0.36.0.

**Vorgabe des Betreibers vom 19. September 2026.** Die Runde tut drei Dinge an
denselben Dateien: sie verdichtet die Kommentare, sie nimmt jede Versionsnummer
heraus und sie nimmt jeden Verweis auf ein Papier heraus.

> **DIE REGELN STEHEN SEIT DEM 19. SEPTEMBER 2026 GESCHÄRFT IN `CLAUDE.md`,
> Abschnitt 2.** *Sie binden jede Runde und gelten, bis der Betreiber sie selbst
> ändert.* **Diese Runde räumt den Altbestand; die Regel gilt schon vorher.**

**Warum nach 0.36.0 und nicht davor:** jene Runde fasst `server.js` und
`public/app.js` an — dieselben zwei Dateien, die 79 Prozent des Kommentars
tragen. Zwei Runden auf denselben 15.000 Zeilen kollidieren in jedem Diff, und
ein Kommentar, der beim Sicherheitsumbau entsteht, wäre danach sofort wieder
Kandidat. **Es ist dieselbe Begründung, mit der 0.36.0 hinter 0.35.0 stand.**

---

## 1. Der Bestand

**Gemessen am 19. September 2026, auf dem Stand 0.35.2.**

### Kommentar je Datei

| | Zeilen | Kommentar | Anteil |
|---|---:|---:|---:|
| `public/app.js` | 9.372 | 1.856 | 20 % |
| `server.js` | 5.669 | 1.523 | 27 % |
| zehn kleine Module | 4.244 | 915 | 22 % |
| **14 ausgelieferte Module** | **19.285** | **4.294** | **22 %** |
| `public/style.css` | 3.350 | 1.574 Zeilen in 409 Blöcken | **54,5 %** der Bytes |

**`server.js` und `public/app.js` tragen zusammen 79 Prozent.** `tools/comments.js`
nennt je Datei ein Ziel; über dem Ziel liegen nur drei: **`server.js` um 486
Zeilen**, `auth.js` um 38, `db.js` um 20.

### Blocklängen

**2.716 Blöcke in den ausgelieferten Modulen.** Zwei Drittel sind einzeilig,
**96 Prozent halten drei Zeilen ein**, 17 gehen über acht, der längste misst
41 Zeilen.

> **DIE DREI-ZEILEN-REGEL IST ALSO KEIN BRUCH.** *Sie beschreibt, was 96
> Prozent des Bestands ohnehin tun.* **Die Arbeit liegt in den restlichen vier
> Prozent und in der Verdichtung der einzelnen Sätze.**

### Versionsnummern und Papierverweise

| | |
|---|---:|
| Versionsnummern in ausgelieferten Dateien | **778** |
| davon in Kommentaren | 726 |
| davon im Code | **0** |
| Verweise auf Papiere über den Namen | **188** |
| Verweise über den Pfad `Doku/` | **0** |

*Versionsnummern:* `public/app.js` 326, `server.js` 197, `public/style.css`
175, `db.js` 62, `README.md` 6, `public/index.html` 4, `auth.js` 4,
`manual-de.md` 2, `usertool.js` 1, `twofactor.js` 1.

*Papierverweise:* „Befund" 87, „Bauabschnitt" 70, „Konzept" 14, „Auftrag" 10,
„Projektstand" 4, „Änderungsprotokoll" 2, „Farbkonzept" 1.

**Dass 0 im Code stehen, ist die wichtigste Zahl dieses Auftrags:** die Regel
ist durchsetzbar, ohne an Verhalten zu rühren — bis auf eine Stelle, und die
steht in BA 4.

---

## 2. Die Zahlen

| | heute | nachher |
|---|---:|---:|
| Versionsnummern in ausgelieferten Dateien | 778 | **0** *(bis auf die eigene)* |
| Verweise auf Papiere | 188 | **0** |
| Blöcke über drei Zeilen | 106 | **nur Tafeln gemessener Werte** |
| Kommentaranteil `server.js` | 27 % | *fällt, Ziel offen* |
| Kommentaranteil `public/style.css` | 54,5 % | *fällt, Ziel offen* |
| Wächter über Papierverweise ohne Pfad | 0 | **1** |

**Für die beiden Anteile steht kein Ziel im Auftrag, und das ist Absicht.**
*Eine Quote erzwingt Kürzungen an Stellen, die sie nicht verdienen.* **Gemessen
wird am fertigen Stand, und die Zahl steht danach im Änderungsprotokoll.**

---

## 3. Bauabschnitte

### BA 1 — `server.js`

**1.523 Kommentarzeilen, 27 Prozent, 486 über dem Ziel.** Der größte einzelne
Posten der Runde.

**Drei Griffe, in dieser Reihenfolge:**

1. **Jede Versionsnummer heraus** — 197 Stück, alle in Kommentaren.
2. **Jeden Papierverweis heraus** — „Befund" 11, „Bauabschnitt" 41,
   „Auftrag" 2, „Konzept" 3.
3. **Dann verdichten.** Was nach den ersten beiden Griffen übrig ist, wird Satz
   für Satz auf die Sache gebracht.

*Die Reihenfolge spart Arbeit: ein Satz, der nur eine Herkunft trug, fällt in
Schritt 1 oder 2 ganz weg und muss in Schritt 3 nicht mehr gelesen werden.*

### BA 2 — `public/app.js`

**1.856 Kommentarzeilen, 20 Prozent** — unter dem Ziel, aber mit **326
Versionsnummern** die Datei mit den meisten.

Dieselben drei Griffe. **Zwei der 326 sind keine Versionen, sondern SVG-Pfaddaten
(`-1.8.3l`)** — der Wächter zählt sie mit, und der Sweep muss sie stehen lassen.

### BA 3 — Die zehn kleinen Module

`auth.js`, `db.js`, `mail.js`, `keys.js`, `attachments.js`, `images.js`,
`batchrun.js`, `log.js`, `usertool.js`, `twofactor.js`, `keytool.js`,
`public/theme.js`.

**915 Kommentarzeilen zusammen**, davon `auth.js` 274 und `db.js` 272.
Versionsnummern: `db.js` 62, `auth.js` 4, `usertool.js` 1, `twofactor.js` 1.

*Ein Bauabschnitt für alle zehn — einzeln sind sie zu klein für je einen Lauf.*

### BA 4 — Die eine Stelle, an der die Regel etwas kostet

**`REQUIRED_COLUMNS` in `db.js`.** Eine Tafel aus 21 Zeilen nennt je fehlender
Spalte die Fassung, deren Block sie gebracht hätte. Der Wert reist in
`findings.since` und steht im Warnkasten, den ein Betreiber mit unvollständiger
Datenbank liest.

**Das sind keine Kommentare, sondern Daten** — und damit die einzigen
Versionsnummern, die nicht einfach gestrichen werden können.

**Zu entscheiden ist, wie die Meldung ohne Nummer heißt.** *Sie fällt nicht
ersatzlos: eine unvollständige Datenbank ist ein Befund, und der Betreiber
braucht die genaueste Auskunft, die zu geben ist.* **Fragetafel F1.**

### BA 5 — `public/style.css`

**1.574 Kommentarzeilen in 409 Blöcken, 54,5 Prozent der Bytes, 175
Versionsnummern.**

> **HIER IST DER GRÖSSTE TEIL DES KOMMENTARS BEGRÜNDET.** *Kontrastwerte,
> Pixelmaße, Messtafeln der Vorschaureihe — genau das, was `CLAUDE.md` unter
> „Doch" führt.* **0.35.0 hat schon einmal gekürzt, von 70,5 auf 54,5 Prozent.**

**Deshalb hier nur zwei Griffe und kein dritter:** die 175 Versionsnummern und
die 37 Papierverweise heraus. **Verdichtet wird nur, wo ein Block eine Abwägung
erzählt statt eine Zahl zu nennen.**

*Punkt 42 des Sammelblatts bleibt danach offen, mit einer neuen Zahl.*

### BA 6 — README und Handbuch

**`README.md`** 1.097 Zeilen, 6 Versionsnummern, 3 Papierverweise
(„Projektstand" 1, „Änderungsprotokoll" 2). **`manual-de.md`** 1.444 Zeilen,
2 Versionsnummern.

**Und die Frage, die der Betreiber gestellt hat: liest sich die README noch
sinnvoll?** *Sie ist über dreißig Runden gewachsen, und niemand hat sie je als
Ganzes gelesen.* **Zu prüfen ist:** ob die Abschnitte noch in der Reihenfolge
stehen, in der jemand sie braucht; ob etwas doppelt erklärt wird; ob etwas
beschrieben wird, das es nicht mehr gibt.

*Das ist Lesen und Urteilen, nicht Streichen — und deshalb ein eigener
Bauabschnitt.*

### BA 7 — Der Wächter über die Papierverweise

**Für die Versionsnummern gibt es einen** *(„Keine Versionsnummer als Herkunft",
eine Latte je Datei, die nur fallen darf)*. **Für den Pfad `Doku/` gibt es
einen** *(über vierundzwanzig Dateien)*. **Für den Namen ohne Pfad gibt es
keinen — das ist die Lücke, durch die 188 Verweise stehen geblieben sind.**

**Der dritte Wächter derselben Form:** kein Kommentar einer ausgelieferten
Datei nennt „Befund", „Bauabschnitt", „Auftrag", „Projektstand", „Konzept",
„Farbkonzept" oder „Änderungsprotokoll".

**Und die beiden alten Latten fallen auf null.** *Eine Latte, die nur fallen
darf, ist der halbe Weg; auf null ist sie eine Zusage.*

### BA 8 — Papiere

Änderungsprotokoll 0.37.0, CHANGELOG, Fahrplanzeile auf GEBAUT, Projektstand,
Sammelblatt: **Punkt 43 ist zu** *(alle drei Schritte)*, **Punkt 42 bekommt
eine neue Zahl**.

---

## 4. Zusagen an den Prüfstand

1. **Kein Verhalten ändert sich.** Diese Runde fasst ausschließlich Kommentare
   an — mit der einen Ausnahme aus BA 4, und die steht namentlich im Protokoll.
2. **Die Zahl der Prüfungen bleibt gleich**, bis auf die neuen Wächter.
3. **`public/languages/*.json` wird nicht angefasst.** Kein Satz am Bildschirm
   ändert sich.
4. **Die drei Latten stehen danach auf null** — Versionsnummern, `Doku/`-Pfade,
   Papierverweise über den Namen.
5. **Die Gleichlaufprobe ändert ihre sechs Summen nicht.** *Sie liest den
   Quelltext ohne Kommentare — bleibt sie gleich, ist bewiesen, dass nur
   Kommentar gefallen ist.* **Das ist die schärfste Zusage dieser Runde.**
6. Gegenprobenlauf über die neuen Wächter, **0 stumm**.
7. Der Fingerprint ändert sich — erwartet, und zwar an jeder ausgelieferten
   Datei.

> **ZUSAGE 5 IST DER BELEG FÜR ZUSAGE 1.** *Wenn `tools/gleichlaut.js` nach
> der Runde dieselben sechs Summen nennt wie davor, dann hat sich am Code
> nichts bewegt.* **Läuft eine Summe auseinander, ist etwas anderes gefallen
> als Kommentar.**

---

## 5. Fragetafel — vor der ersten Zeile zu beantworten

| | Frage | Vorschlag |
|---|---|---|
| **F1** | **Wie heißt die Meldung aus `REQUIRED_COLUMNS` ohne Versionsnummer?** | *sie nennt den alten Spaltennamen statt der Fassung.* „`items.rejected_at` fehlt; unter dem Namen `rejected_grund` liegt sie auch nicht da" sagt einem Betreiber mehr als eine Nummer, die er nachschlagen müsste |
| **F2** | **Bekommt `public/style.css` ein Ziel für den Anteil?** | *nein.* Der Kommentar dort ist zum guten Teil begründet, und eine Quote erzwingt Kürzungen an Stellen, die sie nicht verdienen |
| **F3** | **Fällt „Befund" auch dort, wo es kein Verweis ist?** | *nein.* „Der Befund war" ist ein Verweis, „ein Bild ohne Befund" nicht. Der Wächter zielt auf `Befund \\d+` und die benannten Papiernamen, nicht auf das Wort |
| **F4** | **Wird die README umgestellt oder nur gekürzt?** | *erst lesen, dann entscheiden.* BA 6 liefert ein Urteil, keine Umstellung; was daraus folgt, ist eine eigene Zeile im Fahrplan |
| **F5** | **Zählt der Prüfstand mit?** | *nein, er ist ausgenommen* — wie bei den drei Wächtern davor. Der Prüfstand geht nicht mit hinaus, und er muss die Nummern nennen dürfen |

---

## 6. Was verworfen wird

| | was | warum |
|---|---|---|
| **V1** | **Die Kommentare mit einem Skript kürzen** | jeder Block muss gelesen und entschieden werden: trägt er eine gemessene Zahl, einen Grund für eine Reihenfolge, eine Absage — oder erzählt er? Das kann kein Skript, und ein Wächter kann es hinterher auch nicht prüfen |
| **V2** | **Eine Quote je Datei erzwingen** | `tools/comments.js` nennt schon ein Ziel, und über dem Ziel liegen drei Dateien. Eine schärfere Quote nähme gemessene Zahlen heraus |
| **V3** | **Den Prüfstand mitnehmen** | 12.000 Kommentarzeilen in zwanzig Dateien, und keine davon geht hinaus. Eine eigene Zeile im Fahrplan, ohne Nummer |
| **V4** | **`public/style.css` auf dreißig Prozent bringen** | Punkt 42, und dort steht: die Zahlen in den Kommentaren sind die Begründung der Werte darunter |

---

## 7. Wie diese Runde gefahren wird

| Phase | Form |
|---|---|
| **Vorlauf** | die sechs Gleichlaufsummen festhalten, **bevor** etwas fällt |
| **BA 1 bis BA 6** | je ein Schreiber, je ein voller Lauf, je ein Commit |
| **BA 7 zuletzt** | erst räumen, dann den Wächter setzen — sonst ist die Runde dazwischen rot |
| **Gegenproben** | über die drei Wächter, **nie gleichzeitig mit dem Prüfstand** |
| **Vor dem Push** | `npm test` vollständig **und** die sechs Gleichlaufsummen gegen den Vorlauf |
