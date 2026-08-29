# Änderungsprotokoll 0.15.1 — „`hidden` wirkt wieder"

**Version 0.15.1 · gebaut am 29. August 2026 · Fingerprint `FINGERPRINT` ·
PRUEFZAHL Prüfungen · RUECKZAHL Rückbauten in `gegenprobe.js`**

---

**Ein Befund aus dem Betrieb, gemeldet am 29. August 2026 kurz nach dem
Einspielen von 0.15.0 — und er ist größer, als er aussieht.** An einem Eintrag,
der **nicht abgelehnt** war, standen die rote Aussage zur Ablehnung **und** ihr
Eingabefeld trotzdem da. *Beide trugen `hidden`.*

> **DIE URSACHE LIEGT NICHT IN DER OBERFLÄCHE, SONDERN IM STILBLATT — UND SIE
> IST ÄLTER ALS 0.15.0.** Der Browser blendet `hidden` über
> `[hidden] { display: none }` in **seinem** Stylesheet aus. **Jede Regel aus
> `public/style.css` schlägt die**, und `.row-in` setzt seit jeher
> `display: flex`. *Das Eingabefeld war damit nie versteckt — auch nicht in
> 0.14.0.* Mit 0.15.0 kam `.rej-aussage { display: flex }` dazu, und seither
> galt dasselbe für die Aussage.

> **DAMIT IST MEINE DIAGNOSE ZU BEFUND 2 AUS 0.15.0 FALSCH GEWESEN.** Ich habe
> „das Feld steht dauernd offen" der Logik zugeschrieben, die Logik umgebaut —
> und die Ursache nicht angefasst. **Der Umbau war trotzdem richtig**; er stand
> nur auf einem Stilblatt, das ihn nicht durchließ. *Es ist genau der Fehler,
> vor dem Stolperstein 47 warnt: dieselbe Frage an zwei Orten, und nur einer
> davon wurde angesehen.*

> **UND ES IST DAS DRITTE MAL.** Im Stilblatt standen bereits **zwei** örtliche
> Notlösungen — `.zug-neu [hidden]` und `.lb-btn[hidden]` —, beide mit dem
> richtigen Kommentar daneben (*„`hidden` ist eine Vorgabe des Browsers mit
> schwacher Kraft"*). **Zweimal an Ort und Stelle geflickt, nie grundsätzlich
> beantwortet.** Beim dritten Mal hat es an einer Stelle zugeschlagen, an der
> es jeder sieht.

> **DIES IST EINE PATCH-RUNDE.** Kein Schema, keine Route, keine neue
> Formatnummer, keine Rechteänderung — es bleibt bei **sechs** markierten
> Blöcken, **Format 11** und `F_ROUTEN` bei **69**. **Die Sicherung des
> Datenverzeichnisses bleibt Empfehlung.** *Nach der Regel in Abschnitt 5.1 ist
> das PATCH: die Anlage kann danach nichts, was sie vorher nicht konnte — sie
> tut endlich, was sie schon versprochen hatte.*

---

## Inhalt

1. [Was gemessen wurde](#1-was-gemessen-wurde)
2. [Die eine Regel](#2-die-eine-regel)
3. [Wann das Feld dasteht — die Regel aus dem Betrieb](#3-wann-das-feld-dasteht--die-regel-aus-dem-betrieb)
4. [Warum kein Prüflauf das gesehen hat](#4-warum-kein-prüflauf-das-gesehen-hat)
5. [Was je Datei geändert wurde](#5-was-je-datei-geändert-wurde)
6. [Der Prüfstand](#6-der-prüfstand)
7. [Gegenproben](#7-gegenproben)
8. [Neue Stolpersteine](#8-neue-stolpersteine)
9. [Die Zahlen](#9-die-zahlen)
10. [Was ausdrücklich nicht passiert ist](#10-was-ausdrücklich-nicht-passiert-ist)
11. [Offen geblieben](#11-offen-geblieben)

---

## 1. Was gemessen wurde

**In Chromium, gegen einen echten Server, an einem NICHT abgelehnten Eintrag** —
weil jsdom hier nichts sagen kann:

| | `hidden` | `display` | Höhe |
|---|---|---|---:|
| Aussage (`#rej-marke`) | **true** | `flex` | 18,6 px |
| Feld (`#rej-grund-zeile`) | **true** | `flex` | 38,2 px |
| ein leeres `<div hidden>` daneben | true | `none` | 0 px |

**Beide standen korrekt auf `hidden` und wurden trotzdem gezeichnet.** Das
leere `<div>` in derselben Seite zeigt, dass `hidden` an sich funktioniert —
es ist die display-Regel, die es aushebelt.

**Und die Frage, ob Verstecktes noch Platz nimmt, ist ebenfalls gemessen:**

| Zustand des Titelblocks | Höhe |
|---|---:|
| wie es war | **156,8 px** |
| mit `[hidden] { display: none !important }` | **83,9 px** |
| zum Vergleich mit `visibility: hidden` | 156,8 px |

**`display: none` nimmt das Element ganz aus dem Aufbau — keine Höhe, keine
Lücke.** *`visibility: hidden` hätte die 72,9 px stehen lassen; deshalb steht
es nicht in der Regel.* **72,9 px standen an jedem nicht abgelehnten Eintrag
für nichts** — fast die Hälfte des Titelblocks.

---

## 2. Die eine Regel

```css
[hidden] { display: none !important; }
```

**Sie steht ganz oben, direkt hinter `* { box-sizing: border-box }`, und sie
ist die einzige Stelle im ganzen Stilblatt mit einem `!important`.**

**Warum mit Ausrufezeichen, und das ist keine Bequemlichkeit:** ohne müsste
diese Zeile **jede künftige display-Regel überbieten** — ein Wettlauf, den sie
irgendwann verliert, und zwar still. *Sie stellt außerdem eine Vorgabe des
Browsers wieder her, statt eine eigene durchzudrücken; das ist genau der Fall,
für den `!important` gedacht ist.*

**Die beiden örtlichen Flicken sind entfallen.** `.zug-neu [hidden]` und
`.lb-btn[hidden]` lösten dasselbe Problem an ihrer jeweiligen Stelle; die
Kommentare dazu stehen weiter da und verweisen jetzt nach oben. *Zwei Regeln
für dieselbe Sache sind zwei Wahrheiten — und die dritte Stelle, die sie
gebraucht hätte, gab es eben nicht.*

**Der Prüfstand hält beides fest:** dass die Regel da ist, dass sie
`!important` trägt, und dass sie **genau einmal** vorkommt. *Dazu die
Gegenprobe zum Maßstab: es gibt wirklich display-Regeln, die ein `hidden`
schlagen würden (`.row-in`, `.rej-aussage`, `.lb-btn`) — sonst prüfte die Zeile
eine Sache ohne Gegenstand.*

---

## 3. Wann das Feld dasteht — die Regel aus dem Betrieb

**Der zweite Teil des Befunds war keine Panne, sondern eine Ansage**, und sie
ist wörtlich umgesetzt:

> *„Das hier soll nur angezeigt werden, wenn auch abgelehnt wurde. Und nach der
> Ablehnung öffnet sich das Feld darunter. Der ist also nur bei Ablehnung ohne
> Grund sichtbar. Nach der Eingabe verschwindet die untere Texteingabe und
> kommt nur, wenn man den Text gelöscht hat oder auf das Stift gedrückt hat.
> Und bei Einträgen, wo der Ablehnungsknopf nicht gedrückt worden ist, brauchen
> wir den Text gar nicht — nimmt umsonst Platz."*

**Das ist ein ZUSTAND und kein Klick**, und genau so steht es jetzt im
Quelltext:

```js
const offen = item.rejected && meins && (!grund || grundOffen);
```

**Bis 0.15.0 hing das Offenstehen an einem einzelnen Klick** (`grundOffen`
wurde beim Einschalten auf `true` gesetzt). Das hatte drei Folgen, die alle
falsch waren: ein **neu geladener** Eintrag ohne Grund zeigte kein Feld; nach
dem **Entfernen** des Grundes kam es nicht von selbst zurück; und ein
**erneutes Ablehnen** machte es auf, obwohl schon ein Grund dastand.

**`grundOffen` ist seither nur noch die halbe Frage** — es heißt „jemand hat
ausdrücklich aufgemacht" und trägt allein den einen Fall, den der Zustand nicht
abdeckt: *es steht ein Grund da und soll geändert werden.*

**Der ganze Weg, in Chromium gefahren und gemessen:**

| Schritt | Aussage | Feld | Titelblock |
|---|---|---|---:|
| nicht abgelehnt | weg | weg | **83,9 px** |
| abgelehnt, noch kein Grund | weg | **offen** | 130,2 px |
| Grund eingegeben | **steht** | weg | 116,5 px |
| ✎ gedrückt | weg | **offen** | 130,2 px |
| Escape | **steht** | weg | 116,5 px |
| Grund über ✕ entfernt | weg | **offen** | 130,2 px |
| Ablehnung zurückgenommen | weg | weg | **83,9 px** |

**Nie beides zugleich, und am nicht abgelehnten Eintrag gar nichts.**

**EINE ZUSAGE AUS 0.14.0 SIEHT DAMIT ANDERS AUS, UND SIE IST NICHT AUFGEGEBEN.**
Beim erneuten Ablehnen ging die alte Begründung bisher als Vorschlag **ins
Feld**; jetzt steht sie **in der Aussage** und lässt sich über das ✎ ändern.
*Der Rumpf der Anfrage trägt sie unverändert mit — verloren ist sie nicht, sie
steht nur woanders.* Die Prüfung dazu ist mitgenommen worden
(Stolperstein 201).

---

## 4. Warum kein Prüflauf das gesehen hat

**4351 Prüfungen waren grün, während die Anlage im Browser das Gegenteil
zeigte.** Der Grund ist eine Zeile:

```js
pruefe('…', zeile.hidden === true, …);
```

**Das fragt die EIGENSCHAFT, und die war wahr.** Ob der Browser das Element
zeichnet, entscheidet CSS — und **jsdom rechnet kein CSS**. *Es ist derselbe
Stolperstein, den 0.15.0 einen Tag vorher aufgeschrieben hat (212), nur eine
Stufe tiefer: dort ging es um eine Folgewirkung, die jsdom nicht ausführt, hier
um eine Darstellung, die es gar nicht kennt.*

**Was diese Runde dagegen setzt, ist bewusst nicht eine Messung im Prüflauf.**
Ein Prüfstand, der einen Browser startet, bräuchte eine neue Abhängigkeit — und
die gibt es hier nicht, nicht eine. **Stattdessen zwei Dinge:**

* **Die Regel selbst ist im Prüfstand festgenagelt** (Abschnitt 2). Sie kann
  nicht mehr still verschwinden.
* **Die Messung steht in diesem Papier**, mit Zahlen, wie die Sternreihe in
  0.14.0. *Was gemessen gehört, wird gemessen und aufgeschrieben — nicht
  behauptet.*

**Und die Lehre daraus ist allgemeiner als dieser Fall** und steht als
Stolperstein 214 da: *wer `hidden` benutzt, benutzt eine Regel aus einem
fremden Stylesheet — und die ist die schwächste im Haus.*

---

## 5. Was je Datei geändert wurde

### `public/style.css`

* **`[hidden] { display: none !important; }`** ganz oben, mit dem Befund im
  Kommentar.
* **`.zug-neu [hidden]` und `.lb-btn[hidden]` entfernt**; ihre Kommentare
  bleiben und verweisen nach oben.

### `public/app.js` — nur `drawAblehnung()` und der Schalter

* **`const offen = item.rejected && meins && (!grund || grundOffen);`** — der
  Zustand entscheidet, nicht der Klick.
* `zeile.hidden = !offen;` und `marke.hidden = … || offen || …`.
* **Der Schalter klappt nichts mehr auf**, er setzt nur noch den Zeiger
  hinein, wenn das Feld ohnehin dasteht.

**Sonst nichts.** Kein Server, kein Schema, keine Route.

### `pruefung.js`

Eine neue Gruppe **„Das Feld steht nur, wo etwas fehlt — 0.15.1"** mit allen
**vier** Feldern der Tafel (abgelehnt ja/nein × Grund ja/nein) und der
Rechtefrage dazu; vier Prüfungen an der Regel im Stilblatt; drei Prüfungen aus
0.15.0 nachgezogen (Stolperstein 201).

### Papiere

`README.md`, `CHANGELOG.md`, `Doku/Projektstand_Kriterion_0_15_1.md` (umbenannt),
`Doku/Auftrag_0.16.0.md` (**die Fingerprint-Sperre nennt jetzt den neuen
Wert**), `package.json`, `package-lock.json` und dieses Protokoll.

---

## 8. Neue Stolpersteine

**214. Wer `hidden` benutzt, benutzt eine Regel aus einem FREMDEN Stylesheet —
und die ist die schwächste im Haus.** `hidden` wirkt nur über
`[hidden] { display: none }` im Stylesheet des **Browsers**; **jede** eigene
Regel mit `display` schlägt sie. *Ein Element mit `hidden` und einer
display-Regel ist nicht versteckt, es sieht bloß so aus wie ein Fehler in der
Logik.* **Die Antwort ist eine einzige Regel mit `!important` und nicht ein
Flicken je Fundstelle** — hier standen zwei örtliche Flicken mit dem richtigen
Kommentar daneben, und beim dritten Mal schlug es trotzdem zu.

**215. Ein Zustand, den eine Anzeige ausdrückt, gehört ABGELEITET und nicht
gemerkt.** Ob das Eingabefeld dasteht, hing an einem Klick (`grundOffen = true`
beim Einschalten). **Damit war es nach jedem Neuzeichnen falsch:** ein frisch
geladener Eintrag ohne Grund zeigte es nicht, nach dem Entfernen kam es nicht
zurück, und ein erneutes Ablehnen machte es auf, obwohl ein Grund dastand.
*Gerechnet aus dem Zustand — abgelehnt und kein Grund — stimmt es in allen
vier Feldern der Tafel von selbst.* **Ein gemerkter Zustand neben einem
vorhandenen ist eine zweite Wahrheit** (Stolperstein 47), und sie fällt erst
beim Neuladen auf.

**216. Eine falsche Diagnose kostet mehr als ein unbehobener Fehler.** Der
Befund *„das Feld steht dauernd offen"* aus 0.15.0 ist der Logik zugeschrieben
worden. **Die Logik wurde umgebaut — richtig, aber am Problem vorbei**, und die
Ursache stand unangetastet zwei Dateien weiter. *Der Umbau war nicht umsonst
(der Ruhezustand ist die bessere Bauform), aber er hat den Fehler verdeckt und
eine Runde gekostet.* **Die Frage davor: kann ich den gemeldeten Zustand
herstellen? Wenn nein, habe ich die Ursache nicht.**

---

## 10. Was ausdrücklich nicht passiert ist

* **KEIN Schema, keine Route, keine Rechteänderung, keine neue Formatnummer.**
  Es bleibt bei sechs markierten Blöcken, Format 11 und `F_ROUTEN` 69.
* **KEIN Browser im Prüfstand.** Er bräuchte eine neue Abhängigkeit, und die
  gibt es hier nicht — nicht eine. *Die Messung steht in diesem Papier, die
  Regel im Prüfstand.*
* **KEIN `visibility: hidden`.** Gemessen: es ließe die 72,9 px stehen.
* **KEINE weiteren `!important`.** Die eine steht, weil sie eine Vorgabe des
  Browsers wiederherstellt. *Wer eine zweite hinschreibt, hat ein anderes
  Problem.*
* **NICHTS aus dem Fahrplan.** 0.16.0 bleibt unangetastet — der Auftrag dafür
  liegt im Repo und ist nur um den neuen Fingerprint nachgezogen.

---

## 11. Offen geblieben

* **Der volle Gegenprobenlauf steht weiterhin aus.** *Er ist seit elf Runden
  nicht ganz gefahren.*
* **Die beiden Feldbelege aus 0.12.4 und 0.13.0** stehen unverändert aus; sie
  stehen im Auftrag für 0.16.0.
* **Die Tags `v0.12.3` bis `v0.15.1`** sind nicht geschoben — der Git-Proxy der
  Arbeitsumgebung weist `refs/tags/*` mit 403 ab, ohne dass GitHub die Anfrage
  sieht. Sie warten auf den Merge des Arbeitsbranches.
* **UND EINE FRAGE, DIE DIESE RUNDE AUFWIRFT UND NICHT BEANTWORTET:** wie viele
  weitere Zusagen der Oberfläche stehen nur in jsdom und nicht im Browser?
  *`hidden` war eine; gefunden hat sie ein Mensch, der hinsah.* **Eine Antwort
  wäre eine Messung im echten Browser als Teil des Prüflaufs — und die kostet
  eine Abhängigkeit.** Das ist eine Entscheidung, die nicht nebenbei fällt; sie
  gehört als Zeile ins Sammelblatt und nicht in diese Runde.
