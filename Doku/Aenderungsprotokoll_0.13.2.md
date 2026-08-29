# Änderungsprotokoll 0.13.2 — „Der Rahmen schließt"

**Version 0.13.2 · gebaut am 29. August 2026 · Fingerprint `15188676` ·
PATCH · KEINE Datenbankstufe, kein Migrationsblock, keine neue Formatnummer,
keine neue Zeile in der `.env`, keine neue Abhängigkeit**

**Eine Kante.** Eine angepinnte **Notiz** stand in drei goldenen Kanten und
einer grauen da — links blieb der graue Grundwert stehen. Jetzt schließt der
Rahmen.

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.13.2 ist **PATCH**: die Kante
bekommt die Farbe, die sie nach der Entscheidung aus 0.12.3 längst haben
sollte. **Die Anlage kann danach nichts, was sie vorher nicht konnte.**

**DER EIGENTLICHE BEFUND IST NICHT DIE KANTE.** Der Kommentar über der Regel
sagte seit 0.12.3 wörtlich: *„Eine Notiz hat keine eigene Farbe, und bei ihr
wird der ganze Rahmen golden."* **Das Stilblatt tat es nie.** Zwei Runden lang
stand die Absicht neben dem Code und stimmte nicht mit ihm überein — und
niemand hat nachgesehen, weil ein Kommentar sich liest wie ein Beleg.

**UND DER PRÜFSTAND HAT DEN FEHLER NICHT ÜBERSEHEN, SONDERN VERLANGT.** Drei
Prüfungen aus 0.12.0 hielten die **zurückgenommene** Entscheidung fest — *„Die
Anpinnung färbt oben, rechts und unten"* und *„Die linke Kante bleibt der Art
vorbehalten"*. Sie sind beim Umdrehen der Entscheidung in 0.12.3 nicht
mitgenommen worden und standen seither grün da. **Der Fehler war damit nicht
ungeprüft, sondern falsch geprüft** — Abschnitt 3a.

---

## Inhalt

1. [Der Befund](#1-der-befund)
2. [Was gebaut ist](#2-was-gebaut-ist)
3. [Die zweite Entdeckung: der Kommentar stimmte auch sonst nicht](#3-die-zweite-entdeckung-der-kommentar-stimmte-auch-sonst-nicht)
3a. [Die dritte Entdeckung: der Prüfstand hat den Fehler verlangt](#3a-die-dritte-entdeckung-der-prüfstand-hat-den-fehler-verlangt)
4. [Was je Datei geändert wurde](#4-was-je-datei-geändert-wurde)
5. [Der Prüfstand und die Gegenproben](#5-der-prüfstand-und-die-gegenproben)
6. [Neue Stolpersteine](#6-neue-stolpersteine)
7. [Die Zahlen](#7-die-zahlen)
8. [Was ausdrücklich nicht passiert ist](#8-was-ausdrücklich-nicht-passiert-ist)
9. [Offen geblieben](#9-offen-geblieben)

---

## 1. Der Befund

Die Regel seit 0.12.3 lautet: **Farbe sagt die Art, Form sagt die Anpinnung** —
und *kein Kasten trägt zwei Farben*. Angepinnt heißt deshalb: die drei übrigen
Kanten nehmen die Farbe der linken an. **Eine Notiz hat keine eigene Farbe, und
bei ihr wird der ganze Rahmen golden.**

Im Stilblatt stand davon nur die Hälfte:

```css
.cmt.pinned {
  border-top-color: var(--gold-line);
  border-right-color: var(--gold-line);
  border-bottom-color: var(--gold-line);
}
```

**Die linke Kante fehlt.** Sie blieb damit auf dem `--line` der Grundregel
`.cmt { border: 1px solid var(--line); }` — grau. Nachgemessen im Browser an
einer angepinnten Notiz:

| Kante | vorher | nachher |
|---|---|---|
| oben | `rgba(255, 197, 49, 0.52)` | `rgba(255, 197, 49, 0.52)` |
| **links** | **`rgb(38, 44, 51)`** | **`rgba(255, 197, 49, 0.52)`** |
| Breite links | 1 px | 1 px |
| `padding-left` | 12 px | 12 px |

**Bei den drei Arten war es von Anfang an richtig**, weil deren linke Kante
schon aus `.cmt.bericht` und Geschwistern kam und von `.cmt.pinned` gar nicht
angefasst wurde — dort standen alle vier Kanten in derselben Farbe. *Der Fehler
traf genau einen von vier Fällen, und das ist der Grund, warum er zwei Runden
überlebt hat.*

---

## 2. Was gebaut ist

```css
.cmt.pinned { border-color: var(--gold-line); }
```

`border-color` färbt alle vier Kanten auf einmal. **Breiten und Abstände sind
nicht angefasst:** die linke Kante einer Notiz bleibt 1 px, die einer Art 3 px,
und der Innenabstand gleicht den Unterschied weiterhin aus (10 + 3 = 12 + 1), so
dass die Zeilenanfänge in einer gemischten Liste auf einer Linie stehen.

Damit gilt, was gefragt war:

| Fall | Rahmen |
|---|---|
| **Notiz, angepinnt** | vier Kanten golden, alle gleich dünn |
| **Notiz, nicht angepinnt** | vier Kanten grau, alle gleich dünn |
| **Bericht / Aufgabe / Erledigt, angepinnt** | vier Kanten in der Farbe der Art, links dick |
| **Bericht / Aufgabe / Erledigt, nicht angepinnt** | drei Kanten grau, links dick und farbig |

---

## 3. Die zweite Entdeckung: der Kommentar stimmte auch sonst nicht

Über der Regel stand bis zu dieser Runde:

> *„DIE REIHENFOLGE ENTSCHEIDET HIER NICHTS: die drei Arten tragen zwei Klassen
> und schlagen die einzelne von `.cmt.pinned` über die Spezifität."*

**Das ist falsch.** `.cmt.bericht` trägt zwei Klassen — und `.cmt.pinned`
ebenfalls. Bei gleicher Spezifität entscheidet die **Reihenfolge**, und
`.cmt.pinned` steht später im Stilblatt.

Solange `.cmt.pinned` die linke Kante gar nicht anfasste, fiel das nicht auf:
zwei Regeln, die einander nicht berühren, können sich nicht widersprechen.
**Mit `border-color` berühren sie einander** — ein angepinnter Bericht hätte
eine goldene linke Kante neben drei orangen bekommen, also genau die zwei Farben
an einem Kasten, die 0.12.3 abgeschafft hat.

Deshalb holt sich **jede** der drei Art-Regeln ihre linke Kante ausdrücklich
zurück:

```css
.cmt.pinned.bericht {
  border-top-color: var(--accent);
  border-right-color: var(--accent);
  border-bottom-color: var(--accent);
  border-left-color: var(--accent);
}
```

Drei Klassen schlagen zwei — hier entscheidet die Spezifität wirklich. *Eine
Prüfung hält die Reihenfolge fest, damit die Wiederholung nicht eines Tages als
überflüssig gestrichen wird.*

---

## 3a. Die dritte Entdeckung: der Prüfstand hat den Fehler verlangt

Der erste volle Lauf nach der Änderung war **rot: 4128 von 4131**. Die drei
gescheiterten Zeilen waren keine Folgeschäden, sondern der dritte Befund.

**Zwei davon stammen aus 0.12.0** und schrieben die damalige Entscheidung fest
— *„zwei Merkmale, zwei Kanäle: die linke Kante gehört allein der Art, die drei
übrigen allein der Anpinnung"*:

```js
pruefe('Die Anpinnung färbt oben, rechts und unten', …)
pruefe('Die linke Kante bleibt der Art vorbehalten',
  !/border-left|border-color:/.test(regelM('.cmt.pinned')), …)
```

Die zweite Zeile **verbot `border-color:` ausdrücklich** — also genau die
Schreibweise, mit der der Rahmen schließt.

**0.12.3 hat diese Entscheidung umgedreht**, im Stilblatt ausführlich begründet
und mit eigenen Regeln für die drei Arten versehen. **Den Prüfstand hat sie
nicht mitgenommen.** Die beiden alten Zeilen blieben grün, weil die Umsetzung
ihren Rest behalten hatte — die linke Kante der angepinnten Notiz blieb grau.
*So sah zweieinhalb Runden lang alles bestätigt aus: ein Kommentar, der die neue
Entscheidung erklärt, und zwei grüne Punkte, die die alte festhalten.*

**Die dritte Zeile ist ein zu grobes Muster und kein Irrtum in der Sache:**

```js
/border-left|border-width|border-(top|right|bottom)-width|padding/
```

Gemeint war die **Breite** — es soll sich keine Kante und kein Innenabstand
ändern. `border-left` trifft aber auch `border-left-color`, also genau die
Zeile, mit der jede Art sich ihre Kante zurückholt. Das Muster unterscheidet
jetzt: `border-left:` (die Kurzform, die eine Breite tragen **kann**) und
`border-left-width` schlagen an, `border-left-color` nicht.

**Alle drei sind nachgezogen, keine ist gelöscht.** Was sie belegen sollten,
belegen sie weiterhin — nur eben gegen die geltende Entscheidung statt gegen die
zurückgenommene. *Die Zahl der Prüfungen ändert sich dadurch nicht: 4131 vorher
wie nachher.*

---

## 4. Was je Datei geändert wurde

### `public/style.css`

* **`.cmt.pinned`**: drei einzelne Kantenfarben → **`border-color`**.
* **`.cmt.pinned.bericht`, `.cmt.pinned.aufgabe`, `.cmt.pinned.erledigt`**: je
  eine Zeile `border-left-color` dazu.
* Der Kommentar darüber ist berichtigt — die falsche Aussage über die
  Spezifität steht als **widerlegt** da und ist nicht gelöscht.

*Sonst nichts.* `public/app.js`, `server.js` und `auth.js` sind **nicht
angefasst**.

### `pruefung.js`

* Neue Gruppe **„Der angepinnte Rahmen schliesst — 0.13.2"**, acht Zeilen.
* **Drei Prüfungen aus 0.12.0 und 0.12.3 sind nachgezogen** (Abschnitt 3a) —
  zwei hielten die zurückgenommene Entscheidung fest, eine hatte ein zu grobes
  Muster. Keine ist gelöscht; über jeder steht, warum sie sich geändert hat.
* Der Wächter über die Rückbauten zählt jetzt **218** statt 216.

### `gegenprobe.js`

* Zwei neue Rückbauten, **215** und **216**.

---

## 5. Der Prüfstand und die Gegenproben

### Was der Prüfstand hier NICHT kann

**Die Kaskade rechnen.** jsdom löst eine Kaskade über mehrere Klassenselektoren
nicht verlässlich auf; die Farbwerte in Abschnitt 1 sind in Chromium an einer
gerenderten Karte abgelesen, nicht im Prüflauf.

### Was er kann

| Prüfung | belegt |
|---|---|
| Die Oberfläche hängt Art und Anpinnung an denselben Kasten | den Gegenstand (Stolperstein 81) |
| Die Grundregel gibt allen vier Kanten dieselbe Breite | dass „genauso dünn" überhaupt gilt |
| Die drei Arten tragen die dicke linke Linie | dass die Art erkennbar bleibt |
| Die angepinnte Notiz bekommt alle vier Kanten | die Änderung selbst |
| Und zwar in Gold | dass es die richtige Farbe ist |
| Jede angepinnte Art holt sich ihre linke Kante in ihrer Farbe zurück | dass kein Kasten zwei Farben trägt |
| Und kein angepinnter Kasten bleibt halb gefärbt | dieselbe Zusage für alle drei Arten |
| Die Anpinnung steht im Stilblatt HINTER den drei Arten | **warum** die Wiederholung nötig ist |

> **DIE LETZTE ZEILE IST DIE UNGEWÖHNLICHE.** Sie prüft eine Reihenfolge im
> Stilblatt — und sie steht da, weil die Reihenfolge der einzige Grund für die
> drei Wiederholungen ist. Zöge jemand `.cmt.pinned` nach oben, wären sie
> überflüssig, und niemand wüsste mehr, warum sie dastehen.

> **DIE PRÜFUNG FRAGT NACH DER WIRKUNG, NICHT NACH DEM WORTLAUT.** „Alle vier
> Kanten" ist erfüllt durch `border-color:` **oder** durch vier einzelne
> `border-<seite>-color:`. *Eine Prüfung, die auf `border-color` besteht,
> verbietet eine gleichwertige Schreibweise und wird beim nächsten Umbau
> abgeschaltet statt verstanden.*

### Gegenproben

**Vorher: 216 Rückbauten. Nachher: 218.**

| Nr | Rückbau | erwartete Gruppe |
|---|---|---|
| 215 | Die angepinnte Notiz bekommt ihre linke Kante nicht | Der angepinnte Rahmen schliesst — 0.13.2 |
| 216 | Der angepinnte Bericht verliert seine orange Kante an das Gold | Der angepinnte Rahmen schliesst — 0.13.2 |

**215 ist der Befund selbst. 216 ist die Falle, die er aufgemacht hat:** ohne
die Wiederholung schlägt die spätere Regel durch.

> **GEFAHREN SIND SIE IN DIESER RUNDE NICHT** — 218 Rückbauten zu je einem
> vollen Prüflauf sind über zwanzig Stunden. *Dass beide **greifen**, rechnet
> die Gruppe „Die Gegenproben greifen" bei jedem `npm test` nach.*

---

## 6. Neue Stolpersteine

**Die Zählung setzt bei 199 fort — 198 ist vergeben.**

199. **Ein Kommentar, der sagt, was gelten soll, ist kein Beleg dafür, dass es
    gilt.** Über `.cmt.pinned` stand seit 0.12.3 *„bei ihr wird der ganze Rahmen
    golden"*, und drei Zeilen darunter standen drei Kanten statt vier. Der
    Absatz war sorgfältig geschrieben, ausführlich begründet — und falsch.
    **WER EINE ENTSCHEIDUNG IN EINEN KOMMENTAR SCHREIBT, SCHREIBT SIE IM SELBEN
    ZUG IN EINE PRÜFUNG** — sonst ist sie eine Absichtserklärung, die mit jeder
    Runde glaubwürdiger aussieht und nicht wahrer wird. *Dieser Fehler ist
    besonders zäh, weil der Kommentar beim Lesen wie eine Bestätigung wirkt: man
    sieht, was dastehen soll, und liest darüber hinweg, dass es nicht dasteht.*

200. **Zwei Regeln gleicher Spezifität widersprechen sich erst, wenn sie
    dieselbe Eigenschaft anfassen — und bis dahin darf jede Behauptung über sie
    unwidersprochen stehenbleiben.** Der Kommentar behauptete, die Art-Regeln
    schlügen `.cmt.pinned` über die Spezifität; beide tragen zwei Klassen, es
    entscheidet die Reihenfolge. **Das war zwei Runden lang folgenlos**, weil
    `.cmt.pinned` die linke Kante nicht anfasste. **WER EINE REGEL UM EINE
    EIGENSCHAFT ERWEITERT, ZÄHLT DIE KLASSEN NEU** statt sich auf das zu
    verlassen, was danebensteht. *Die Reihenfolge ist jetzt selbst eine
    Prüfung.*

201. **Ein Prüfstand kann einen Fehler nicht nur übersehen, sondern
    verlangen.** Zwei Zeilen aus 0.12.0 hielten fest, dass die Anpinnung *„oben,
    rechts und unten"* färbt und die linke Kante *„der Art vorbehalten"* bleibt.
    0.12.3 hat genau diese Entscheidung umgedreht — und die beiden Zeilen
    stehengelassen. **Sie blieben grün, weil die Umsetzung ihren Rest behalten
    hatte**, und machten den Rest damit zur geprüften Zusage. **WER EINE
    ENTSCHEIDUNG ZURÜCKNIMMT, SUCHT DIE PRÜFUNGEN, DIE SIE FESTHALTEN, UND
    NIMMT SIE MIT** — sonst hält der Prüfstand den alten Zustand fest, und zwar
    mit dem vollen Anschein der Bestätigung. *Ein grüner Punkt sagt nur, dass
    etwas so ist wie beschrieben; er sagt nicht, ob die Beschreibung noch gilt.*

---

## 7. Die Zahlen

| | 0.13.1 | 0.13.2 |
|---|---|---|
| Prüfungen | 4123 | **4131** |
| Rückbauten | 216 | **218** |
| `F_ROUTEN` | 69 | **69** |
| `VORGAENGE` | 20 | **20** |
| `MERKMALE` | 14 | **14** |
| `BESTAETIGUNG_ZWECKE` | 7 | **7** |
| Austauschformat | 10 | **10** |
| Abhängigkeiten | unverändert | **unverändert** |

---

## 8. Was ausdrücklich nicht passiert ist

* **Kein Schema, kein Migrationsblock, keine Formatnummer.** *Diese Runde fasst
  die Datenbank nicht an.*
* **Keine neue Abhängigkeit, nicht eine** — auch keine für den Prüfstand.
* **Keine neue Zeile in der `.env`.**
* **Keine Änderung an `public/app.js`, `server.js` oder `auth.js`.**
* **Keine geänderte Breite und kein geänderter Abstand.** Nur Farben.
* **Kein hellerer Untergrund für angepinnte Kommentare.** Die Entscheidung aus
  0.12.3 gilt unverändert: ein Merkmal, ein Zeichen.
* **Keine Änderung an der README.**

---

## 9. Offen geblieben

**Unverändert aus 0.13.1** — nichts davon ist in dieser Runde angefasst worden:

* **Der volle Gegenprobenlauf steht aus.** Jetzt 218 Rückbauten.
* **Die Adressliste, wer `X-Forwarded-For` setzen darf.**
* **Der Import als Strom.**
* **Der Teilexport ist am echten Bestand noch nicht gesehen.**
* **Ein kaputter Cookiewert legt jede Anfrage dieses Browsers lahm**
  (`parseCookies()` in `auth.js`, aus Commit `158b6d9`).
* **Die Tagwolke füllt ab der zweiten Zeile nicht den Platz unter „mehr" /
  „weniger".** Geprüft, beziffert und zurückgestellt — siehe 0.13.1,
  Abschnitt 6.
* **Die Tags `v0.11.0` bis `v0.13.2` fehlen am Remote.** Der Git-Proxy der
  Arbeitsumgebung weist `POST /git-receive-pack` mit `refs/tags/*` ab.
