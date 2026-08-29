# Änderungsprotokoll 0.13.1 — „Die Beschriftungen stehen oben"

**Version 0.13.1 · gebaut am 29. August 2026 · Fingerprint `ee00fdf2` ·
PATCH · KEINE Datenbankstufe, kein Migrationsblock, keine neue Formatnummer,
keine neue Zeile in der `.env`, keine neue Abhängigkeit**

**Eine Zeile im Stilblatt.** Bei aufgeklappter Tagwolke sanken die Beschriftung
„TAGS", der Und/Oder-Umschalter und der Verweis „weniger" in die **Mitte** des
Blocks und standen dort neben nichts. Jetzt stehen sie auf Höhe der **ersten
Zeile** ihres Inhalts.

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.13.1 ist **PATCH**, und die
Frage dahinter ist die übliche: *kann die Anlage nach dieser Runde etwas, was
sie vorher nicht konnte?* **Nein.** Es ändert sich weder eine Fähigkeit noch
eine Bedienung noch ein Ergebnis — nur die Stelle, an der drei Kästen einer
Zeile sitzen. *Der Fahrplan sieht dafür die Zeile „0.13.x —
Fehlerbereinigung und Verbesserungen, die nächste freie PATCH-Zahl" vor.*

**EINE SACHE WAR BESTELLT, EINE IST GEBAUT.** Ein zweiter Wunsch aus demselben
Gespräch — die Tagwolke soll ab der zweiten Zeile den Platz unter „mehr" /
„weniger" mitfüllen — ist **geprüft, beziffert und zurückgestellt**. Er steht
in Abschnitt 6.

---

## Inhalt

1. [Der Befund](#1-der-befund)
2. [Was gebaut ist](#2-was-gebaut-ist)
3. [Die Messung](#3-die-messung)
4. [Was je Datei geändert wurde](#4-was-je-datei-geändert-wurde)
5. [Der Prüfstand und die Gegenproben](#5-der-prüfstand-und-die-gegenproben)
6. [Der zweite Wunsch — geprüft und zurückgestellt](#6-der-zweite-wunsch--geprüft-und-zurückgestellt)
7. [Neue Stolpersteine](#7-neue-stolpersteine)
8. [Die Zahlen](#8-die-zahlen)
9. [Was ausdrücklich nicht passiert ist](#9-was-ausdrücklich-nicht-passiert-ist)
10. [Offen geblieben](#10-offen-geblieben)

---

## 1. Der Befund

Der Befund kam aus dem Betrieb und war ein Bild: die aufgeklappte Tagwolke über
fünf Zeilen, und links daneben — auf halber Höhe, in der Mitte des Blocks —
das Wort **TAGS**. Rechts, auf derselben halben Höhe, **weniger**. Beide standen
neben einer beliebigen Zeile der Wolke, und der Umschalter **Und / Oder** stand
mit ihnen.

Die Ursache stand seit jeher in einer Zeile:

```css
.frow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
```

`align-items: center` mittelt **jedes** Element der Zeile über die **ganze**
Höhe. Solange eine Filterzeile einzeilig ist, ist das genau richtig und fällt
niemandem auf. **Eine Filterzeile ist aber nicht mehr verlässlich einzeilig:**
die Tagwolke wird beim Aufklappen drei, vier, fünf Zeilen hoch, und seit die
Kategorien mehrere Werte zugleich tragen (0.13.0) bricht auch deren Zeile um,
sobald die Schrift auf 120 Prozent steht.

*Die Regel war nie falsch geschrieben — sie ist mit der Wolke aus ihrer
Voraussetzung herausgewachsen.*

---

## 2. Was gebaut ist

**Ein Wort.**

```css
.frow { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
```

`baseline` legt die **Schriftlinie** der Beschriftung auf die **Schriftlinie
der ersten Pillenzeile**. Ein Flex-Kasten reicht dafür die Grundlinie seines
ersten Kindes nach oben — die Wolke also die ihrer ersten Marke, der Kasten
`.frow-rechts` die seines ersten Verweises, der Umschalter die seiner ersten
Pille. **Alle drei richten sich damit an derselben Zeile aus**, ohne dass eine
davon eigens angesprochen werden müsste.

### Warum Grundlinie und nicht Oberkante

Der naheliegende zweite Weg wäre `align-items: flex-start` gewesen. Er setzt
die **Kästen** bündig, die **Schrift darin** aber nicht: die Beschriftung ist
kleiner gesetzt als eine Pille (`.7rem` gegen `.83rem`), und eine Pille trägt
oben 5 px Innenabstand und 1 px Rahmen. **Gemessen saß die Beschriftung damit
7,5 px zu hoch.**

Den Unterschied auszugleichen hieße, einen Innenabstand auszurechnen — **also
eine feste Pixelzahl in eine Anlage zu schreiben, die ihre Schrift von 80 bis
120 Prozent stellt.** Genau das war Befund A aus 0.12.1 (`right: 92px`), und
genau davon hat 0.13.0 die Filterleiste befreit. `baseline` rechnet **nichts**
aus und gilt bei jeder der fünf Schriftgrößen.

*Der Prüfstand hält den Weg zu: eine Zeile schlägt fehl, sobald an
`.frow > .eyebrow`, `.frow-rechts` oder `.frow > .eyebrow-mit` ein
`align-self`, ein `padding-top` oder ein `margin-top` auftaucht.*

---

## 3. Die Messung

Gemessen in echtem Chromium bei **1359 px** Fensterbreite, an derselben
Prüflage vorher und nachher, bei allen drei Eckwerten der Schriftgröße. Die
Zahl ist der Abstand zwischen der Mitte der Beschriftung und der Mitte der
**ersten Zeile der Tagwolke** — positiv heißt: die Beschriftung steht tiefer.

| Schrift | Wolke | vorher | nachher |
|---|---|---|---|
| 80 % | aufgeklappt | **+32,3 px** | **+0,4 px** |
| 100 % | aufgeklappt | **+35,9 px** | **−0,8 px** |
| 120 % | aufgeklappt | **+59,2 px** | **0,0 px** |
| 100 % | eingeklappt | 0,0 px | −0,8 px |

Der Verweis „weniger" bewegt sich mit: **+35,9 px** vorher, **−0,6 px**
nachher (100 %).

**Eingeklappt ändert sich nichts Sichtbares** — die Wolke ist dort eine Zeile
hoch, und über eine Zeile mittelt `center` genauso wie `baseline` ausrichtet.

### Was es kostet: nichts

Die Filterleiste misst **dieselben Zahlen wie in 0.13.0**:

| | 0.13.0 | 0.13.1 |
|---|---|---|
| Höhe der Leiste | 154 px | **154 px** |
| bis zum ersten Eintrag | 178 px | **178 px** |
| Breite der Tagwolke | 1023 px | **1023 px** |
| sichtbare Tags | 14 von 22 | **14 von 22** |
| Zeilenhöhen (Status / Kategorie / Tags / Sortieren) | 31 / 31 / 30 / 31 | **31 / 31 / 30 / 31** |

Die einzeiligen Zeilen wandern um einen **halben Pixel** (+0,8 / +0,5 / +0,2 px
bei 80 / 100 / 120 %). **Auf dem schmalen Schirm ändert sich gar nichts:** dort
gilt `flex-direction: column`, und `align-items` spielt keine Rolle mehr —
nachgemessen bei 420 px, alle Werte vorher und nachher gleich.

---

## 4. Was je Datei geändert wurde

### `public/style.css`

* **`.frow`**: `align-items: center` → **`align-items: baseline`**. Darüber
  steht, warum — mit den gemessenen Zahlen, mit dem verworfenen zweiten Weg
  und mit dem Hinweis, dass der schmale Schirm eine eigene Fassung hat.

*Sonst nichts.* Kein Kasten hat eine Klasse dazubekommen, keine Regel eine
Zahl. `public/app.js`, `server.js` und `auth.js` sind **nicht angefasst**.

### `pruefung.js`

* Neue Gruppe **„Die Beschriftungen stehen oben — 0.13.1"**, sieben Zeilen.
* Der Wächter über die Rückbauten zählt jetzt **216** statt 214.

### `gegenprobe.js`

* Zwei neue Rückbauten, **213** und **214**.

---

## 5. Der Prüfstand und die Gegenproben

### Was der Prüfstand hier NICHT kann

**Messen.** jsdom rechnet kein Layout; jede Höhe ist dort null, und
`getBoundingClientRect()` liefert Nullen. **Die Zahlen in Abschnitt 3 sind in
Chromium genommen, nicht im Prüflauf** — dieser Satz steht auch im Prüfstand
über der Gruppe, damit niemand die grünen Punkte für eine Messung hält.

### Was er kann

**Die Regel — und den Gegenstand, an dem sie wirkt.**

| Prüfung | belegt |
|---|---|
| Die Tagzeile steht da | der Gegenstand überhaupt (Stolperstein 81) |
| Beschriftung, Umschalter, Wolke und Verweise sind Geschwister EINER Zeile | dass **eine** Regel alle vier trifft |
| Es gibt genau zwei Fassungen der Filterzeile: allgemein und schmal | dass keine dritte still dazukommt |
| Eine Filterzeile richtet sich an der Grundlinie aus | die Regel selbst |
| Und ausdrücklich nicht mehr an der Mitte | dass die alte nicht danebensteht |
| Die Zeile bricht weiterhin um | `flex-wrap: wrap` überlebt |
| Der schmale Schirm behält seine eigene Anordnung | dass die Runde ihn nicht berührt |
| Keine der Zeilen bessert die Ausrichtung mit einer Zahl nach | dass der verworfene Weg zubleibt |

> **DIE ZWEITE ZEILE IST DIE WICHTIGE.** Eine Prüfung, die nur die Regel im
> Stilblatt liest, ist grün, auch wenn die vier Kästen längst in vier Zeilen
> stehen und die Regel gar nichts mehr zu tun hat. **Erst der Gegenstand macht
> aus dem Text eine Prüfung.**

> **UND DIE ERSTE PRÜFLAGE BRAUCHT EINEN GESETZTEN TAG.** Ohne ihn gibt es den
> Kasten `.frow-rechts` in jsdom gar nicht: „mehr" hängt an `begrenzeWolke()`,
> und die steigt dort mangels Höhe ausdrücklich aus. Erst „zurücksetzen" —
> und das erscheint nur bei gesetztem Tag — bringt den Kasten in die Zeile.

### Gegenproben

**Vorher: 214 Rückbauten. Nachher: 216.**

| Nr | Rückbau | erwartete Gruppe |
|---|---|---|
| 213 | Die Filterzeile mittelt wieder über die ganze Höhe | Die Beschriftungen stehen oben — 0.13.1 |
| 214 | Die Beschriftung schert aus der Grundlinie aus | Die Beschriftungen stehen oben — 0.13.1 |

**213 ist der Befund selbst.** **214 ist der Weg, auf dem er zurückkäme, ohne
dass die Zeile `.frow` sich ändert:** ein `align-self: center` an der
Beschriftung allein.

> **GEFAHREN SIND SIE IN DIESER RUNDE NICHT** — das gilt unverändert und aus
> demselben Grund wie in 0.13.0: 216 Rückbauten zu je einem vollen Prüflauf
> sind über zwanzig Stunden. *Dass beide **greifen** — der Suchtext kommt in
> seiner Datei genau einmal vor —, rechnet die Gruppe „Die Gegenproben
> greifen" bei jedem `npm test` nach.*

---

## 6. Der zweite Wunsch — geprüft und zurückgestellt

Aus demselben Gespräch kam eine zweite Frage: **kann die Tagwolke ab der
zweiten Zeile den Platz unter „mehr" / „weniger" mitfüllen?**

**Technisch ja, und es gibt genau einen Weg dorthin: Fließsatz.** Ein
fließendes Element ist das einzige Mittel in CSS, um umbrechenden Inhalt um
eine Ecke herumlaufen zu lassen; Flexbox kann das nicht, weil ein Flex-Element
immer ein Rechteck **neben** der Wolke ist und nie eine Aussparung **in** ihr.

Der Umbau wäre:

* Die Wolke wechselt von `display: flex` auf `display: block`, die Marken auf
  `display: inline-block` mit `vertical-align: top`.
* `gap: 6px` fällt weg — Blocksatz kennt es nicht. An seine Stelle treten
  Außenabstände, und die letzte Zeile braucht einen Ausgleich, sonst wächst die
  Wolke um einen Abstand.
* Der Kasten `.frow-rechts` wandert als erstes Kind **in** die Wolke, mit
  `float: right`.
* **`begrenzeWolke()` müsste mit.** Sie misst die Zeilenhöhe am *ersten Kind*
  der Wolke — das wäre dann der Fließkasten und nicht mehr eine Marke.
* Der schmale Schirm braucht eine eigene Antwort: `flex: 0 1 auto` ergibt in
  einem Blockkasten keinen Sinn mehr.

**Was es einbrächte, gerechnet:** die Breite von „weniger" samt Abstand, rund
60 px je Zeile ab der zweiten — **etwa eine Marke mehr pro Zeile**, zwei, wenn
„zurücksetzen" danebensteht.

**Der Haken ist der Regelzustand.** Eingeklappt ist die Wolke **eine** Zeile
lang, und das ist genau die Zeile, neben der der Verweis ohnehin steht.
**Eingeklappt bringt der Umbau null.** Der Gewinn entsteht nur, solange jemand
aufgeklappt hat.

**Entschieden: nicht in dieser Runde, und nicht als PATCH.** Er tauscht die
Bauform der Wolke aus, zieht `begrenzeWolke()` und den schmalen Schirm mit und
macht alle Maße aus 0.13.0 neu messbedürftig. *Das ist keine Fehlerbereinigung,
sondern ein Punkt mit eigener Messung und eigener Prüfgruppe.* **Er steht in
`Doku/Fehler_und_Ideen.md`, Teil II, mit dieser Rechnung.**

---

## 7. Neue Stolpersteine

**Die Zählung setzt bei 197 fort — 196 ist vergeben.**

197. **`align-items: center` mittelt über die GANZE Höhe, und eine Zeile ist
    nicht auf Dauer einzeilig.** Die Regel stand jahrelang richtig da; falsch
    wurde sie erst, als ein Kasten darin umbrechen konnte. **WER EINE ZEILE
    BAUT, IN DER EIN KASTEN MEHRZEILIG WERDEN KANN, RICHTET AN DER GRUNDLINIE
    AUS UND NICHT AN DER MITTE.** *Und wer einen Kasten mehrzeilig macht, sieht
    nach, was die Zeile um ihn herum dabei annimmt — das Aufklappen der
    Tagwolke gibt es seit 0.12.1, die Mitte seit 0.10.0.*

198. **Ein Messwert ist erst dann eine Messung, wenn der Bezugspunkt der
    richtige ist.** Der erste Messversuch verglich die Beschriftung mit der
    ersten Pille des Und/Oder-Kastens statt mit der ersten Marke der Wolke.
    **Beide waren gemittelt** — der Abstand zwischen ihnen war deshalb sauber
    null, und der Fehler, der im Bild offen dalag, war in der Messung
    unsichtbar. **EIN NULLWERT IST KEIN BELEG, SOLANGE NICHT FESTSTEHT, WOGEGEN
    GEMESSEN WURDE.** *Dasselbe in anderer Gestalt wie Stolperstein 193: eine
    Prüfung, die den falschen Gegenstand ansieht, ist grün für nichts.*

---

## 8. Die Zahlen

| | 0.13.0 | 0.13.1 |
|---|---|---|
| Prüfungen | 4115 | **4123** |
| Rückbauten | 214 | **216** |
| `F_ROUTEN` | 69 | **69** |
| `VORGAENGE` | 20 | **20** |
| `MERKMALE` | 14 | **14** |
| `BESTAETIGUNG_ZWECKE` | 7 | **7** |
| Portbasen | 56 | **56** |
| Austauschformat | 10 | **10** |
| Abhängigkeiten | unverändert | **unverändert** |

---

## 9. Was ausdrücklich nicht passiert ist

* **Kein Schema, kein Migrationsblock, keine Formatnummer.** *Diese Runde fasst
  die Datenbank nicht an — sie fasst überhaupt nur eine Datei an.*
* **Keine neue Abhängigkeit, nicht eine** — auch keine für den Prüfstand.
* **Keine neue Zeile in der `.env`.**
* **Keine Änderung an `public/app.js`, `server.js` oder `auth.js`.**
* **Keine Änderung an der README.** *Sie beschreibt, was die Anlage tut und wie
  man sie betreibt; die Ausrichtung dreier Kästen einer Filterzeile gehört
  nicht dazu.*
* **Niemand wird abgemeldet, keine gespeicherte Ansicht ändert sich.**

---

## 10. Offen geblieben

**Unverändert aus 0.13.0** — nichts davon ist in dieser Runde angefasst worden:

* **Der volle Gegenprobenlauf steht aus.** Jetzt 216 Rückbauten zu je einem
  vollen Prüflauf.
* **Die Adressliste, wer `X-Forwarded-For` setzen darf.** Die zweite Hälfte von
  Punkt 2 aus 0.13.0.
* **Der Import als Strom.**
* **Der Teilexport ist am echten Bestand noch nicht gesehen.**
* **Ein kaputter Cookiewert legt jede Anfrage dieses Browsers lahm.**
  `parseCookies()` in `auth.js` ruft `decodeURIComponent()` auf jeden Wert;
  `kriterion_session=%` wirft einen `URIError`, und `requireAuth` ruft die
  Funktion bei jeder geschützten Anfrage. **Aus 0.13.0 unverändert
  übernommen** — die Zeile stammt aus Commit `158b6d9`. *Der Weg wäre klein:
  die Schleife überspringt einen Wert, der sich nicht dekodieren lässt, statt
  abzubrechen.*
* **Die Tags `v0.11.0` bis `v0.13.1` fehlen am Remote.** Der Git-Proxy der
  Arbeitsumgebung weist `POST /git-receive-pack` mit `refs/tags/*` ab; die
  Befehle stehen im Projektstand, Abschnitt 8.

**Neu dazu:**

* **Die Tagwolke füllt ab der zweiten Zeile weiterhin nicht den Platz unter
  „mehr" / „weniger".** Geprüft, beziffert und zurückgestellt — Abschnitt 6.
