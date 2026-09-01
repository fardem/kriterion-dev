# Änderungsprotokoll 0.17.5 — „So hoch wie der Inhalt"

**Version 0.17.5 · gebaut am 31. August 2026 · Fingerprint `6a2c264a` ·
4813 Prüfungen · 389 Rückbauten in `gegenprobe.js`**

---

**DER BEFUND AUS 0.17.2 IST GEFUNDEN — nach drei Runden.** Gemeldet am
31. August 2026 mit Bildern von der laufenden Instanz, und diesmal **mit dem
Fingerprint dazu: `d3113d62`**, also nachweislich 0.17.4. *„Warum sind diese
Felder so groß, obwohl sie keine Information haben? … und haben sie keine
größeren Nachbarn nebeneinander, was sie nicht haben, dürfen die auch kleiner
werden."*

**Die Ursache ist eine einzige Zeile, und sie steht seit 0.17.2 im Stilblatt:
`max-height: max-content`.** *In Chromium tut sie genau das, was sie soll —
deshalb war der Befund zwei Runden lang nicht reproduzierbar, und deshalb sind
zwei Runden lang Ursachen gebaut worden, die es nicht gab.*

> **DIE NUMMER: PATCH.** *Diese Runde bringt keine Funktion.* **Nur
> `public/style.css` ist angefasst** — kein Quelltext auf dem Server, kein
> Zeichenweg in `public/app.js`.

> **DIES IST KEINE DATENBANKSTUFE.** Sieben markierte Blöcke, Austauschformat
> **11**, `F_ROUTEN` **69**, achtzehn Karten in fünf Abschnitten.

---

## Inhalt

1. [Der Fehler, und warum er drei Runden gebraucht hat](#1-der-fehler-und-warum-er-drei-runden-gebraucht-hat)
2. [Was an seine Stelle tritt](#2-was-an-seine-stelle-tritt)
3. [Gemessen, vorher und nachher](#3-gemessen-vorher-und-nachher)
4. [Der Preis, und warum er bezahlt ist](#4-der-preis-und-warum-er-bezahlt-ist)
5. [Das Raster des Sicherheitsprotokolls](#5-das-raster-des-sicherheitsprotokolls)
6. [Die Entscheidungen dieser Runde](#6-die-entscheidungen-dieser-runde)
7. [Was je Datei geändert wurde](#7-was-je-datei-geändert-wurde)
8. [Der Prüfstand](#8-der-prüfstand)
9. [Gegenproben](#9-gegenproben)
10. [Neue Stolpersteine](#10-neue-stolpersteine)
11. [Die Zahlen](#11-die-zahlen)
12. [Was ausdrücklich nicht passiert ist](#12-was-ausdrücklich-nicht-passiert-ist)
13. [Offen geblieben](#13-offen-geblieben)

---

## 1. Der Fehler, und warum er drei Runden gebraucht hat

### Die Zeile

**Seit 0.17.2 stand an beiden Listen dieselbe Bauform:**

```css
.manage-list { flex: 1 1 27.95rem; min-height: 0; max-height: max-content; … }
```

**Der Gedanke dahinter war richtig und ist es geblieben:** `flex-basis` deckelt
die **Forderung** bei zehn Zeilen, `max-height: max-content` nimmt diese
Forderung einer **kurzen** Liste wieder weg, und `flex-grow` lässt sie die
geschenkte Höhe einer höheren Nachbarin **nutzen**.

**In Chromium tut die Zeile genau das.** *Jede Messung dieser drei Runden hat
das bestätigt: `frei: 0` an jeder Liste, an jeder Karte, in jeder Lage.*

### Was in der laufenden Instanz stattdessen passiert

**`max-content` im Blockfluss ist ein Schlüsselwort, auf das kein Verlass ist.**
Wo es die Forderung nicht klemmt, bleibt die Forderung, was `flex-basis` sagt:
**zehn Zeilen — auch bei einer Liste mit fünf, und auch bei einer leeren.**

**Die Karte wird damit so hoch, wie die Liste FORDERT, und nicht, wie sie
BRAUCHT.** Der Leerraum steht dann zwischen der letzten Zeile und dem, was
unter der Liste kommt — beim Papierkorb zwischen der Meldung „Keine gelöschten
Einträge" und dem unteren Kartenrand, bei „Zugänge" zwischen der letzten
Zeile und dem Knopf „Gelöschte Zugänge".

**Zwei Bilder aus dem Betrieb, beide bei Fingerprint `d3113d62`:**

| Karte | in der Instanz | in Chromium, gleicher Inhalt | Differenz |
|---|---:|---:|---:|
| „Zugänge", 5 Zeilen | **728 px** | **498 px** | **230** |
| „Papierkorb", **leer**, allein in seiner Reihe | ~**570 px** | **225 px** | ~**345** |

**Die Differenz ist auf den Pixel die geforderte statt der gebrauchten Höhe:**
`27.95rem` sind 419 px, die Liste braucht 224 (fünf Zeilen) beziehungsweise 42
(eine leere). *419 − 224 = 195; 419 − 42 = 377.*

### Warum es drei Runden gebraucht hat

**Der Befund ist am 31. August zum ERSTEN Mal gemeldet worden — zu 0.17.2:**
*„Die Bilder zeigen es an ‚Anfragen' und ‚Zugänge': eine leere und eine
fünfzeilige Liste in einer Kachel, die über tausend Pixel hoch ist."* **Es war
schon damals dieselbe Zeile**, nur mit dem größeren Deckel von `33.5rem`
(502 px).

**Was seither passiert ist:**

| Runde | Was gebaut wurde | Was daran stimmte |
|---|---|---|
| **0.17.3** | `align-items: start` am Kachelraster — „der Leerraum steht IN der Kachel" | **Nichts.** Die betroffenen Karten tragen `.breit` und stehen allein in ihrer Reihe; `align-items` erreicht sie nie. Die Zeile hat stattdessen die gleiche Höhe aufgehoben. |
| **0.17.4** | die Zeile zurückgenommen, die Regel „fordern ≠ nutzen" aufgeschrieben und gemessen | **Die Rücknahme und die Regel.** *Der Mechanismus darunter blieb `max-content` — und damit blieb der Befund.* |
| **0.17.5** | `max-content` fällt weg | — |

> **DER EIGENTLICHE FEHLER IST NICHT DIE ZEILE, SONDERN DER UMGANG MIT DEM
> NICHT REPRODUZIERBAREN BEFUND (Stolperstein 257).** *Zweimal ist eine
> Erklärung gebaut worden, weil die Messmaschine den Fehler nicht zeigte — und
> zweimal hätte die Frage lauten müssen: **was ist an der Messmaschine anders
> als an der Instanz?*** **Ein Befund, den man nicht nachstellen kann, ist nicht
> erledigt. Er ist unerklärt, und der Unterschied zwischen den beiden
> Umgebungen IST der Fund.**

---

## 2. Was an seine Stelle tritt

**Zwei Zeilen, und keine hängt an einem Schlüsselwort:**

```css
.manage-list { flex: 0 1 auto; min-height: 0; max-height: 27.95rem; … }
.prot-liste  { flex: 0 1 auto; min-height: 0; max-height: 35rem;    … }
```

| Zeile | Frage | Antwort |
|---|---|---|
| `flex: 0 1 auto` | **Wie hoch bin ich?** | So hoch wie das, was dasteht. *`auto` heißt: der Inhalt gibt das Maß. Die `0` heißt: ich nehme mir nichts von dem, was die Kachel neben mir übrig hat.* |
| `max-height: 27.95rem` | **Wo ist Schluss?** | Bei zehn Zeilen, beim Protokoll bei fünfzehn. *Was darüber hinausgeht, kommt über den Rollbalken.* |

**`min-height: 0` bleibt:** ohne sie wächst ein Flexkind über seinen Anteil
hinaus, statt zu rollen (Stolperstein 237).

**DIE REGEL SELBST IST UNVERÄNDERT — bis auf einen Halbsatz.** Sie lautet
weiterhin:

> **DIE REIHE** ist so hoch wie ihre höchste **starre** Kachel. Gibt es keine,
> ist sie so hoch wie die größte Forderung der dynamischen —
> `min(Einträge, 10)`, beim Sicherheitsprotokoll `min(Einträge, 15)`, mindestens
> eine Zeile.
>
> **DIE LISTE** zeigt, was in ihre Kachel passt, und rollt, wenn nicht alles
> passt. ~~Bekommt sie mehr Platz, als sie braucht, und hat sie mehr als zehn
> Einträge, nutzt sie ihn.~~ *Der letzte Satz ist zurückgenommen — Abschnitt 4.*

---

## 3. Gemessen, vorher und nachher

*Chromium über das DevTools-Protokoll an einer echten Instanz, Fenster
1410 × 1000 — dieselbe Breite wie auf den Bildern aus dem Betrieb.*

| Lage | Kachel | Liste | Inhalt | rollt |
|---|---:|---:|---:|---|
| „Papierkorb", **0** Einträge, allein in seiner Reihe | **225** | **42** | 42 | nein |
| „Zugänge", **5** Zeilen | **498** | **224** | 224 | nein |
| „Kategorien", **2** Einträge, neben einer 804er Nachbarin | 804 | **91** | 91 | nein |
| „Tags", **0** Einträge, neben derselben | 804 | **42** | 42 | nein |
| „Bewertungskriterien", **50** Einträge | 804 | **419** = 10 × 41,92 | 2355 | **ja** |
| „Sicherheitsprotokoll", **33** Vorgänge | 753 | **525** = 15 × 35 | 1154 | **ja** |
| Protokoll, **0** Vorgänge | — | **35** = eine Zeile | 35 | nein |
| „Meine Sitzungen", **22** Sitzungen, neben „Zugang" (1055) | 1055 | **419** | 2053 | **ja** |

**Keine Liste steht mehr höher da, als sie Inhalt hat.** *Die Zeile
`max-height: max-content` kommt im ganzen Stilblatt nicht mehr vor; der
Prüfstand hält das fest.*

---

## 4. Der Preis, und warum er bezahlt ist

**Eine Liste nutzt die Höhe einer höheren Nachbarin nicht mehr aus.** In
„Persönlich" steht „Meine Sitzungen" neben der starren Karte „Zugang" (1055 px);
die Liste zeigt jetzt **zehn** Zeilen statt zwanzig, und darunter bleibt die
Kachel leer.

**Das war eine ausdrückliche Zusage aus 0.17.4, und sie ist zurückgenommen.**
*Der Vermerk gehört dazu (Stolperstein 201).*

**Warum trotzdem so:**

1. **Es geht nicht anders.** In einem Flexkind ist `max-height` die einzige
   Eigenschaft, die einen Deckel setzt — und sie klemmt **beides**: was das Kind
   fordert UND wie hoch es werden darf. *Die Forderung getrennt vom Wachstum zu
   deckeln, geht nur über ein inhaltsabhängiges Maß, und das ist genau das
   Schlüsselwort, an dem diese Runde scheitert.*
2. **Der Leerraum ist ohnehin da.** Die Nachbarin „Darstellung" ist ebenfalls
   starr und ebenfalls 1055 px hoch, ohne so viel Inhalt — *gleich hohe Reihen
   erzeugen Leerraum in der kürzeren Kachel, und das war die Zusage, nicht der
   Fehler.*
3. **Eine Zusage, die in einem Browser gilt und im nächsten Leerraum erzeugt,
   ist keine.**

> **WAS DAMIT AUCH FÄLLT: der Halbsatz, der Deckel sei „eine Forderung und
> keine Grenze".** Seit dieser Runde ist er **beides** — und das ist der Satz,
> der im Stilblatt steht.

---

## 5. Das Raster des Sicherheitsprotokolls

**BEFUND, als Frage gemeldet:** *„Dass der Name so mal links, mal rechts
verschoben ist, ist gewollt?"* — **Nein.**

**Bis 0.17.4 war JEDE ZEILE IHR EIGENES RASTER:**
`grid-template-columns: 128px 1fr 1fr auto auto`. Die beiden letzten Spalten
sind `auto`; **steht dort nichts, fallen sie auf null, und die beiden `1fr`
teilen sich den frei gewordenen Platz.** *Der Name in Spalte drei stand damit in
jeder Zeile woanders.*

**Gemessen in Chromium bei 1410 px — die linke Kante von `.prot-wer`:**

| | Kanten |
|---|---|
| **vorher** | **706 · 708 · 734 · 769** — vier verschiedene |
| **nachher** | **693** — eine |

### Gebaut: das Raster gehört der Liste

**`.prot-liste` spannt die Spalten, und jede Zeile setzt ihre fünf Felder über
`display: contents` direkt hinein.** Damit misst Spalte vier so breit wie das
breiteste Ziel im **ganzen** Protokoll und nicht wie das der einzelnen Zeile.

> **FESTE SPALTENBREITEN WÄREN DER ANDERE WEG UND DER SCHLECHTERE.** *Gemessen:
> „→ Gelöschter Benutzer 128" misst **176 px**, „zusammengeführt" **110** —
> zusammen 286, die jede Zeile mitschleppte, auch die, in der beides leer ist.*

**Zwei Zeilen folgen daraus, die sonst wie Kosmetik aussähen:**

* **Der Spaltenabstand steht als `padding-right` am Feld und nicht als
  `column-gap` am Raster.** *Eine Zeile ohne eigenen Kasten kann keine
  Trennlinie tragen — die Linie sitzt an den Feldern, und ein Abstand zwischen
  den Spalten risse sie in fünf Stücke.*
* **Die Felder richten sich an der UNTERKANTE aus und nicht an der
  Schriftlinie.** *`align-items: baseline` gibt einem Feld **ohne Text** keine
  Schriftlinie: es blieb **15 px** hoch, wo seine Nachbarn **35** maßen, und
  seine Trennlinie saß zwanzig Pixel zu hoch — im Bild als Treppe zu sehen
  (Stolperstein 258).* **Nachgemessen: alle fünf Felder haben jetzt dieselbe
  Unterkante.** Die Schriften stehen trotzdem auf einer Linie — der Unterschied
  zwischen 0,74 und 0,86 rem macht an der Unterlänge weniger als einen halben
  Pixel aus.

**AUF DEM SCHMALEN SCHIRM TRÄGT DIE ZEILE IHR RASTER WIEDER SELBST.** *Fünf
Felder in zwei Spalten gehen nicht auf: bei `display: contents` liefe das sechste
Feld der ersten Zeile in die Reihe der zweiten, und aus zwei Vorgängen würde
eine Zeile (Stolperstein 259).*

---

## 6. Die Entscheidungen dieser Runde

| Frage | Entscheidung | Warum |
|---|---|---|
| **`max-content` behalten und über `@supports` absichern?** | **Nein — ganz weg.** | `@supports` prüft, ob der Browser die Zeile **liest**, nicht ob er sie **befolgt**. *Ein Browser, der sie parst und anders anwendet, fiele durch jede Weiche.* |
| **Den Deckel als Forderung oder als Grenze?** | **Als Grenze.** | Es gibt keine dritte Eigenschaft. *Der Unterschied war real und ist nicht baubar.* |
| **Die Zusage aus 0.17.4 still fallen lassen?** | **Nein — mit Vermerk im Stilblatt, im Prüfstand und im Papier.** | *Eine zurückgenommene Entscheidung, die verschwindet, kommt wieder (Stolperstein 201).* |
| **Das Protokollraster über `subgrid`?** | **Nein — über `display: contents`.** | *Nach dieser Runde ist eine Bauform, die erst seit ein paar Jahren überall trägt, kein Mittel mehr.* `display: contents` trägt seit 2018 in jedem Browser. |
| **Feste Spalten für Ziel und Merkmal?** | **Nein.** | 286 px, die jede Zeile mitschleppte. *Ein gemeinsames Raster kostet nichts.* |

---

## 7. Was je Datei geändert wurde

| Datei | Was |
|---|---|
| `public/style.css` | **`.manage-list` und `.prot-liste`: `flex: 1 1 <Deckel>rem` + `max-height: max-content` → `flex: 0 1 auto` + `max-height: <Deckel>rem`.** `.modal .manage-list` trägt nur noch `max-height: none`. **Das Raster des Protokolls wandert von der Zeile auf die Liste**, die Trennlinie und der Spaltenabstand an die Felder, die Ausrichtung auf die Unterkante; die Medienabfrage stellt die Zeile auf dem schmalen Schirm wieder für sich. `.prot-liste > .hint` spannt über alle Spalten. |
| `pruefung.js` | Gruppe umbenannt in **„So hoch wie der Inhalt — 0.17.5"**; sechs Prüfungen umgeschrieben (aus „fordert" wird „deckelt"), **eine neue** (`haengt an keinem Schluesselwort mehr`), zwei weggefallen (`nimmt, was die Kachel hergibt`, `nutzt mehr als seinen Deckel`), **fünf neue am Protokollraster** und eine an der Fensterregel. Rückbauzahl auf **389**. |
| `gegenprobe.js` | **Vier neue** (394–397 am Protokollraster). **Neun mitgegangen** (339, 340, 355, 356, 370, 371, 390, 392 — und **391 umgedreht**: er setzt das Schlüsselwort jetzt wieder). |
| `Doku/Aenderungsprotokoll_0.17.4.md` | Berichtigungskasten: der Mechanismus ist zurückgenommen, die Regel steht. |
| `Doku/Aenderungsprotokoll_0.17.5.md` | **NEU** — dieses Papier. |
| `Doku/Projektstand_Kriterion_0_17_5.md` | Umbenannt; Kopf, Betriebsstand, 5.6, **Stolpersteine 256–259**, Prüfstand, Abschnitt 8, 9, 10 und 10a. |
| `Doku/Fehler_und_Ideen.md` | Die Runde als gebaut; der Befund aus 0.17.2 als **gefunden** vermerkt. |
| `README.md` | Der Absatz zur Listenhöhe: der Halbsatz zur Nutzung fällt weg. |
| `CHANGELOG.md` | Abschnitt **0.17.5**. |
| `package.json`, `package-lock.json` | Version **0.17.5**. |

---

## 8. Der Prüfstand

**4813 von 4813 grün.** *Vorher 4811 — sieben neue, fünf weggefallen oder
umgeschrieben.*

| Prüfung | Was sie festhält |
|---|---|
| `.manage-list` / `.prot-liste` **ist so hoch wie sein Inhalt** | `flex: 0 1 auto` — *zwei Prüfungen, eine je Liste* |
| … **hängt an keinem Schlüsselwort mehr** | `max-content` steht in der Regel nicht mehr |
| … **deckelt bei seinem eigenen Maß** | `max-height: 27.95rem` / `35rem` |
| **Und wiederholt die Grundregel nicht** | `.modal .manage-list` trägt kein zweites `flex` |
| **Die Spalten des Protokolls gehören der Liste** | `display: grid` + `grid-template-columns` an `.prot-liste` |
| **Und die Zeile setzt ihre Felder direkt hinein** | `display: contents` |
| **Die Trennlinie sitzt an den Feldern** | `border-bottom` an `.prot-zeile > *` |
| **Und sie reißt nicht ab** | `align-self: end` **und** kein `gap` am Raster |
| **Auf dem schmalen Schirm trägt die Zeile ihr Raster wieder selbst** | die Medienabfrage stellt beides zurück |

> **DIE WIRKUNG IST WIEDER GEMESSEN UND NICHT GEPRÜFT — und diese Runde zeigt,
> wo die Grenze dieser Arbeitsteilung liegt.** *jsdom rechnet keine Lage aus
> (Stolperstein 223), und die Messung fährt **einen** Browser.* **Eine Regel,
> die nur in dem Browser gemessen wird, in dem sie gebaut wurde, ist nicht
> belegt, sondern nur nicht widerlegt (Stolperstein 256).**

---

## 9. Gegenproben

**389 Rückbauten, gefahren wurden die dreizehn dieser Runde.**

| # | Rückbau | Namentlich rot |
|---|---|---|
| 339 | Die Liste bekommt ihre feste Hoehe zurueck | 5 Prüfungen, darunter „.manage-list ist so hoch wie sein Inhalt" (2 Gruppen) |
| 340 | Die Liste verliert die Zeile, an der es sonst scheitert | „.prot-liste darf dafuer unter seinen Inhalt schrumpfen" |
| 355 | Die Liste fordert wieder so viele Zeilen, wie sie hat | „.manage-list deckelt in rem und nicht in Pixeln", „.manage-list deckelt bei seinem eigenen Mass" |
| 356 | Das Sicherheitsprotokoll fordert wieder alle seine Zeilen | „.prot-liste deckelt in rem und nicht in Pixeln", „.prot-liste deckelt bei seinem eigenen Mass" |
| 370 | Die Liste fordert wieder zwoelf Zeilen | „.manage-list deckelt bei seinem eigenen Mass" |
| 371 | Das Sicherheitsprotokoll deckelt wieder bei zehn Zeilen | „.prot-liste deckelt bei seinem eigenen Mass" |
| 390 | Die Liste im Fenster bekommt den Deckel wieder | „In einem Fenster traegt die Liste keinen Deckel" |
| 391 | Die Liste haengt wieder am Schluesselwort | 5 Prüfungen, darunter „.manage-list ist so hoch wie sein Inhalt" (2 Gruppen) |
| 392 | Das leere Protokoll bekommt das Mass der Bedienzeile | „Und ein leeres Protokoll ebenso wenig, nach seinem eigenen Mass" |
| 394 | Die Spalten gehoeren wieder der Zeile | „Die Spalten des Protokolls gehoeren der Liste" |
| 395 | Die Zeile wird wieder ein eigener Kasten | „Und die Zeile setzt ihre Felder direkt hinein" |
| 396 | Die Felder richten sich wieder an der Schriftlinie aus | „Und sie reisst nicht ab" |
| 397 | Auf dem Telefon bleibt die Liste ein Raster | „Auf dem schmalen Schirm traegt die Zeile ihr Raster wieder selbst" |

> **DIE ZEILE „Jeder Suchtext kommt in seiner Datei genau einmal vor" IST DIE
> SELBSTPROBE UND KEIN BEFUND** — sie wird bei jedem gefahrenen Rückbau rot und
> steht deshalb in dieser Tabelle nicht (Stolperstein 213).

> **391 IST DER, DER UMGEDREHT WURDE.** *Bis 0.17.4 hieß er „Die Liste nutzt den
> Platz der Kachel nicht mehr" und nahm `flex-grow` weg; jetzt heißt er „Die
> Liste hängt wieder am Schlüsselwort" und setzt `max-height: max-content`
> zurück.* **Die Entscheidung ist zurückgenommen, der Rückbau bleibt** — er muss
> nur in die andere Richtung rot machen (Stolperstein 201). *Dass er fünf
> Prüfungen trifft, ist richtig so: die Zeile, an der diese Runde hängt, ist
> genau die, die er wiederherstellt.*

---

## 10. Neue Stolpersteine

**Vier, und sie zählen bei 256 weiter** — 255 war vergeben.

| Nr. | Kernsatz |
|---|---|
| **256** | **`max-content` im Blockfluss ist ein Schlüsselwort, auf das kein Verlass ist.** Wer eine Höhe daran hängt, baut eine Zusage, die in einem Browser gilt und im nächsten Leerraum erzeugt. *Allgemeiner: eine Regel, die nur in dem Browser gemessen wird, in dem sie gebaut wurde, ist nicht belegt — sie ist nur nicht widerlegt.* |
| **257** | **Ein Befund, den man nicht nachstellen kann, ist nicht erledigt — er ist unerklärt, und der Unterschied zwischen Meldung und Messung IST der Fund.** *Zweimal ist eine Ursache gebaut worden, weil die Messmaschine den Fehler nicht zeigte. Die Frage hätte lauten müssen: was ist an meiner Maschine anders als an ihrer?* |
| **258** | **`align-items: baseline` gibt einem Feld OHNE Text keine Schriftlinie.** Es bleibt auf seiner eigenen Höhe stehen — 15 px gegen 35 bei den Nachbarn. *In einem Raster, dessen Zellen die Trennlinie tragen, sitzt die Linie damit an genau den leeren Zellen zu hoch.* |
| **259** | **Fünf Felder in zwei Spalten gehen nicht auf.** Bei `display: contents` läuft das sechste Feld der ersten Zeile in die Reihe der zweiten, und aus zwei Datensätzen wird eine Zeile. *Wer die Spaltenzahl an einem Umbruchpunkt ändert, muss die Zeile dort wieder zu einem eigenen Kasten machen.* |

---

## 11. Die Zahlen

| | vorher (0.17.4) | nachher (0.17.5) |
|---|---|---|
| Prüfungen | 4811 | **4813** |
| Rückbauten in `gegenprobe.js` | 385 | **389** |
| Stolpersteine | 255 | **259** |
| Routen (`F_ROUTEN`) | 69 | **69** |
| Zwecke in `BESTAETIGUNG_ZWECKE` | 7 | **7** |
| Karten im Systembereich | 18 in 5 Abschnitten | **18 in 5 Abschnitten** |
| persönliche Schlüssel | 8 | **8** |
| markierte Migrationsblöcke | 7 | **7** |
| Austauschformat | 11 | **11** |
| Abhängigkeiten | 5 + 1 zum Entwickeln | **5 + 1 zum Entwickeln** |
| Versionsnummern in der README | 6 | **6** |
| Fingerprint | `d3113d62` | **`6a2c264a`** |

---

## 12. Was ausdrücklich nicht passiert ist

- **Kein Quelltext außerhalb des Stilblatts.** `public/app.js`, `server.js` und
  alle Module sind unangetastet.
- **Keine neue Route, keine neue Karte, kein neues Feld.**
- **Kein Schema, kein Migrationsblock, keine neue Formatnummer.**
- **Keine neue Abhängigkeit**, auch nicht zum Messen.
- **Die Deckelzahlen sind nicht angefasst** — zehn Zeilen für die Bedienlisten,
  fünfzehn fürs Protokoll, wie in 0.17.4 gemessen und begründet.
- **Die leere Liste ist nicht angefasst** — eine Zeile hoch, wie in 0.17.4.
- **`align-items` steht weiterhin nicht am Kachelraster.** *Die Rücknahme aus
  0.17.4 bleibt; sie war richtig, auch wenn die Begründung damals einen zweiten
  Fehler mittrug.*
- **Kein Rückbau gelöscht.**
- **Keine Tags gesetzt**, kein Tag-Push.

---

## 13. Offen geblieben

### Welcher Browser — und ob das noch etwas ändert

**Die Instanz meldet `d3113d62`, also 0.17.4; welcher Browser die Bilder gemacht
hat, steht nicht fest.** *Für den Bau ist das gleichgültig — die neue Regel
hängt an keinem Schlüsselwort und gilt deshalb überall gleich.* **Für die Akte
wäre es trotzdem gut zu wissen**, denn dann ließe sich sagen, welche weiteren
Zeilen im Stilblatt dort anders greifen könnten.

### Was diese Runde im Feld belegen soll

1. **Der Papierkorb im Abschnitt „Bestand".** *Leer und allein: die Karte ist
   nur noch so hoch wie ihr Text plus eine Zeile.*
2. **Die Karte „Zugänge".** *Direkt hinter der letzten Zeile kommt der Knopf
   „Gelöschte Zugänge" — kein Loch dazwischen.*
3. **Das Sicherheitsprotokoll.** *Alle Namen stehen untereinander, und die
   Trennlinie läuft ohne Treppe durch.*
4. **Ein Eintrag mit langer Liste** — Kriterien oder Tags. *Zehn Zeilen, dann
   Rollbalken.*

*Ein harter Neuladen gehört davor: geändert ist ausschließlich das Stilblatt.*

### Was aus den Runden davor weiterhin aussteht

*Unverändert; siehe Projektstand, Abschnitt 8.*
