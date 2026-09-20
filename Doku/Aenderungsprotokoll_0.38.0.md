# Änderungsprotokoll 0.38.0 — „Auszeichnung in Kommentar und Beschreibung"

Gebaut am 19. September 2026, auf 0.37.0. MINOR.

Der Auftrag ist durchgelaufen: zwölf Bauabschnitte, einundzwanzig Fragen vor
der ersten Zeile entschieden, zwölf verworfene Wege. **Es ist kein Editor
geworden und keiner genommen** — das `<textarea>` ist geblieben, wie es war.
Gebaut sind zwei Stücke, und dazwischen liegt nichts: ein Leser, der aus Text
Knoten macht, und ein Menü, das Zeichen in das Feld schreibt.

*Gemessen in `public/app.js`:* **412 Zeilen der Leser** samt Marken-Entferner,
**96 sein Knotenbau**, **65 der Verweis**, **262 das Menü mit dem Zitieren.**
Geschätzt waren 280 für den Leser und 180 für das Menü.

| | vorher | nachher |
|---|---:|---:|
| Zeilen in `public/app.js` | 9.295 | **10.246** |
| davon Kommentar | 1.761 | **1.901** |
| Regelzeilen in `public/style.css` | 1.638 | **1.666** |
| Blöcke über drei Zeilen im Stilblatt | 8 | **8** |
| Routen | 102 | **103** |
| davon lesende | 29 | **30** |
| Schlüssel je Sprachdatei | 1.215 | **1.229** |
| Stufen der Stapelordnung | 10 | **11** |
| Formatnummer des Austauschs | 17 | **18** |
| Untergrenze | 14 | **14** |
| Auslieferung, gzip | 253.736 | **267.386** |
| Prüfungen | 7.074 | **7.141** |
| Gruppen | 374 | **378** |
| Rückbauten | 1.065 | **1.084** |

> **FINGERPRINT DIESER RUNDE: `2bc44d2e`** — der Stand davor war `144a80c7`.
>
> Er ändert sich an `public/app.js`, `public/style.css`, `server.js` und den
> drei Sprachdateien. `public/index.html`, `public/theme.js` und
> `public/favicon.svg` sind unberührt.

**DIE ZUSAGE DER RUNDE IN EINEM SATZ:** Kriterion zeichnet, was CommonMark
zeichnet — oder gewöhnlichen Text. Nie etwas Drittes.

---

## 1. Die Fragetafel, vor der ersten Zeile

Alle einundzwanzig Fragen des Auftrags sind so gebaut worden, wie sie dort
entschieden waren. **Keine ist im Bauen umgefallen.** Drei verdienen eine
Nachbemerkung:

| | Entscheidung | was beim Bauen dazukam |
|---|---|---|
| **F1** | eine Teilmenge von CommonMark | Die Flankenregeln und die Dreierregel der Spezifikation sind vollständig umgesetzt, nicht angenähert. Das war der teuerste Teil und der einzige, an dem nachgebessert werden musste |
| **F8** | kursiv trägt den Unterstrich | Hält, was es soll: `3*4 und 5*6` und `datei_name_alt` bleiben Text, gemessen und nicht behauptet |
| **F11** | der Wächter bekommt eine Trennung | Sie steht, und sie hat mehr gefunden als erwartet — Abschnitt 4 |

---

## 2. Was gebaut ist

### Der Leser

`public/app.js` trägt vier Schichten, und die beiden innersten sind die von
vorher:

```
Rohtext
  └─ Zeilenebene    Zitat, Aufzählung, Nummerierung, Absatz
      └─ Inline     Escape, Code, Link mit Namen, fett, kursiv
          └─ splitCommentText()   Adresse, @-Markierung, Suchbegriff
              └─ pieceNode()      textContent oder <mark>
```

`splitCommentText()`, `buildCommentNodes()` und `pieceNode()` sind **nicht
angefasst**. Die neuen Schichten liegen darüber und reichen `term` und `marks`
durch. Adressen, Markierungen und Suchtreffer arbeiten deshalb wie vorher —
und zwar auch **innerhalb** einer Auszeichnung: ein Suchtreffer im Fettdruck
wird `<strong><mark>`.

**Kein `innerHTML` auf diesem Weg.** Das Zeichen für „führt nach draußen" geht
über `createElementNS`, wird einmal gebaut und danach geklont. Die Zahl der
`.innerHTML =`-Stellen in `public/app.js` ist unverändert.

**ZWEI GRENZEN STEHEN GEGEN DEN ENDLOSEN TEXT**, und beide sind nötig, weil
ein Kommentar Benutzertext ist und derselbe Leser am Server im
Trefferausschnitt läuft:

| Grenze | Wert | warum |
|---|---:|---|
| Klammern im Ziel eines Links | 32 | Die Spezifikation erlaubt eine Grenze ausdrücklich und nennt drei Ebenen als Mindestmaß. Ohne sie brauchte `[x](` dreitausendmal **791 ms**, mit ihr **28**|
| Ebenen von Zitat und Aufzählung | 100 | Ohne sie lief der Stapel bei `> ` viertausendmal über — ein `RangeError` im Browser **und** am Server |

*Beide sind gemessen und nicht geschätzt, und beide lassen die Tafel der Fälle
unberührt: die Beispiele der Spezifikation reichen nirgends über drei Ebenen.*

### Das Menü

Es hängt **über der oberen Kante des Feldes**, nicht am Schreibzeiger. Das
löst fünf Dinge auf einmal: nichts wird an der Zeilenhöhe gerechnet (die
Schriftgröße ist von 80 bis 120 Prozent stellbar), wer schreibt sieht die
Schalter ohne erst zu markieren, es liegt nie über den Anfassern einer
Auswahl, es kostet keinen Platz solange niemand schreibt, und auf schmalen
Bildschirmen bricht es in zwei Zeilen um.

**Die Horcher stehen einmal**, nicht je Zeichnung der Detailansicht. Im
Lesemodus — Auswahl in einem Kommentar oder in der Beschreibungsvorschau —
erscheint es an der Auswahl mit zwei Schaltern: Zitieren und Kopieren.

**Rückgängig bleibt brauchbar:** geschrieben wird über
`document.execCommand('insertText')`, mit Rückfall auf `field.value` dort, wo
es nicht trägt.

### Die Beschreibung

Sie hatte keine Leseansicht. Jetzt hat sie eine: ein Klick in den Text oder
der Stift in der Blockkopfzeile schaltet auf das Feld, **Escape verwirft**,
Verlassen speichert. Statt einer geratenen Frist entscheidet `relatedTarget`
des `focusout` — liegt das Ziel im Menü, wird nicht gespeichert.

**Die Vorschau ist ein Bereich und kein `role="button"`:** sie enthält Links,
und ein Schalter mit Links darin ist für ein Vorleseprogramm nicht auflösbar.

### Die Nummer und der Verweis

Die Nummer ist die Stellung in der **zeitlichen** Reihenfolge nach `id`, nicht
die der Anzeige. Anpinnen und das Umstellen der Art bewegen sie damit nicht.
Eine gelöschte Zeile verschiebt die Nummern danach; das ist hingenommen, weil
die Alternative eine Schemaänderung wäre.

Die Adresse trägt **nur** die Nummer des Kommentars — `#/item/<id>?c=<n>`,
kein zweiter Parameter mit einer Zahl, die sich bewegt. Die Zahl in der Marke
wird beim Zeichnen ermittelt und ist damit immer die, die am Ziel steht; sie
kommt aus `GET /api/comment-refs`, einem Ruf je Zeichnung, gesammelt über alle
Kommentare und die Beschreibung.

**Beim Zeichnen wird die Herkunft geprüft.** Eine Adresse mit fremdem Ursprung
bleibt ein gewöhnlicher Link nach draußen.

---

## 3. Der Kern steht zweimal — und das ist geprüft

Die Marken müssen an drei Stellen heraus: Kachelvorschau, eingeklappte
Blockkopfzeile und Trefferausschnitt. Die ersten beiden liegen im Browser, die
dritte am Server.

**Der Kern der Auszeichnung steht deshalb zweimal** — in `public/app.js` und
in `server.js`, von der Abschnittszeile bis zum Ende von `markupPlain()`.
**Zeichen für Zeichen dieselbe Fassung**, und zwei Prüfungen halten das fest:

1. Die beiden Ausschnitte werden verglichen. Sind sie nicht gleich, ist der
   Lauf rot.
2. Die Server-Fassung wird ausgeführt und an **jedem** der 356 Fälle der Tafel
   gegen die Browser-Fassung gestellt. Eine gleiche Abschrift, die niemand
   ausführt, belegt nichts.

Am Trefferausschnitt greift der Entferner **vor** dem Schneiden: die
Rückrechnung von gefaltetem auf rohen Index in `snippet()` verschöbe sich
sonst um jedes entfernte Zeichen.

---

## 4. Der Wächter über die Abfrageparameter

`?c=` hätte ihn rot gemacht: er greift auf `[?&]name=` im ganzen Quelltext von
`public/app.js` — auch in einer Adresse, die nur im Browser lebt — und
verlangte für jeden Namen einen Leser in `req.query`.

**Die Antwort ist keine zweite Ausnahme neben `v`, sondern eine Trennung.**
Gelesen wird der Ausdruck, in dem der Parameter steht, rückwärts bis zum
Semikolon: fängt darin eine Adresse mit `#/` an, gehört der Parameter dem
Browser und wird gegen dessen Leser geprüft; alles andere weiter gegen
`req.query`.

> **DAMIT SCHLIESST DIE RUNDE EINE LÜCKE, DIE VORHER NIEMAND GESEHEN HAT.**
> Dass `?q=` durchging, war Zufall: der Server liest `req.query.q` in der
> Volltextsuche, und derselbe Name steht in der Adresse des Browsers. Ein
> Leser im Browser wurde nie verlangt. Jetzt wird er verlangt — für `q` wie
> für `c`.

Der Wächter trägt danach acht Prüfungen statt fünf, darunter zwei
Gegenproben: dass die Trennung wirklich trennt, und dass ein Parameter ohne
Leser auf beiden Seiten auffiele.

---

## 5. Die Tafel der Fälle

**Die Fälle sind die Beispiele der Spezifikation, Fassung 0.31.2**, aus den
sechs Abschnitten, die die acht Bauformen der Teilmenge tragen: Backslash
escapes, Code spans, Emphasis and strong emphasis, Links, Block quotes, List
items, Lists. **Nummer und Rohtext stehen wie dort. Keiner ist ausgedacht.**

| | Fälle |
|---|---:|
| Beispiele in der Tafel | **356** |
| gezeichnet wie in der Spezifikation | **159** |
| als gewöhnlicher Text | **132** |
| mit einer Bauform außerhalb der Teilmenge | **65** |

**Die fünfundsechzig stehen namentlich da**, jedes mit der Bauform, an der es
liegt — und die Tafel ist in beide Richtungen geschlossen: ein Beispiel, das
wieder passt, wäre eine Karteileiche darin und macht den Lauf rot.

| Bauform außerhalb der Teilmenge | Beispiele |
|---|---:|
| Codeblock, eingerückt oder in Zäunen | 25 |
| ein Stern oder zwei Unterstriche als Auszeichnung | 12 |
| rohes HTML oder eine Adresse in spitzen Klammern | 9 |
| Verweisdefinition | 5 |
| Überschrift | 5 |
| Aufzählung mit `*`, `+` oder `)` | 4 |
| Ziel ohne `http(s)` | 3 |
| Trennlinie | 2 |

*Und die Gegenprobe steht daneben:* **162 Beispiele tragen eine dieser
Bauformen und gehen trotzdem durch.** Der Grund ist also kein Freibrief.

### Die eine benannte Abweichung

**Ein einzelner Zeilenumbruch bleibt ein Umbruch.** Die Spezifikation macht
daraus ein Leerzeichen. Der Grund steht im Bestand: `.cmt-body` trägt
`white-space: pre-wrap`, und folgte die Runde hier der Spezifikation, sähe
jeder vorhandene Kommentar anders aus — auch jeder, der gar keine Auszeichnung
trägt. Die Abweichung ist die einzige, sie steht namentlich, und eine Prüfung
hält sie fest.

### Was beim Bauen gegen die Tafel gefunden wurde

Fünf Fehler im Leser sind erst aufgefallen, als die Beispiele liefen, und
keiner davon wäre an gestellten Fällen aufgefallen:

1. Ein Absturz an `a*"foo"*` — die Suche nach einem öffnenden Zeichen lief
   unter den Boden des Stapels.
2. `_foo_bar_baz_` verlor die inneren Unterstriche: die Zeichen zwischen dem
   Paar wurden nicht nur aus dem Stapel, sondern auch aus dem Text genommen.
3. `*foo **bar** baz*` verlor die inneren Sterne: ein Paar, das die Teilmenge
   nicht kennt, fiel auf seinen Rohtext zurück — und der Rohtext seiner Kinder
   war da schon weg.
4. `` ```foo`` `` wurde ein Code-Abschnitt: nach einem Lauf ohne Gegenstück
   rückte die Lesestelle um ein Zeichen statt um den ganzen Lauf.
5. `![[[foo](uri1)](uri2)](uri3)` bekam ein `!` zu viel zurück.

**Und fünf weitere fand eine Durchsicht des fertigen Stands**, keiner davon an
der Tafel: der Überlauf des Stapels und die quadratische Laufzeit von oben,
**Escape in der Beschreibung, das den verworfenen Text speicherte** (das
Verstecken des Feldes nimmt ihm den Fokus, und `focusout` griff danach), das
Menü, das sich nach dem Zitieren selbst wieder schloss, und der Stift und der
Sprung, die an einem eingeklappten Block ins Leere liefen.

---

## 6. Was der Bestand sagt

`tools/markupscan.js` liest eine Datenbank und zählt je Regel, wie viele
Kommentare und Beschreibungen nach den Regeln anders aussähen. Es nimmt dafür
**den Leser selbst** aus `public/app.js` und keine Abschrift.

Im Bauverzeichnis liegt keine Datenbank des Betriebs. Gemessen ist deshalb,
was an Text im Repository steht und von vor dieser Runde stammt:

| Text | gelesen | betroffen |
|---|---:|---:|
| deutsche Sätze der Sprachdatei | 1.273 | **0** |
| Kommentartexte des Prüfstands | 11 | **0** |

**Die Null belegt, was 5.4 des Auftrags behauptet hat:** die Zeichen sind so
gewählt, dass vorhandener Text sie nicht zufällig trägt. *Der Betreiber misst
seinen eigenen Bestand mit demselben Werkzeug:* `node tools/markupscan.js`.

---

## 7. Was die Runde an Größe kostet

| | vorher | nachher | Unterschied |
|---|---:|---:|---:|
| `public/app.js` gzip | 131.750 | **144.049** | +12.299 |
| `public/style.css` gzip | 51.694 | **52.557** | +863 |
| drei Sprachdateien gzip | 68.538 | **69.026** | +488 |
| **Auslieferung zusammen** | **253.736** | **267.386** | **+13.650** |

**+5,4 Prozent.** Geschätzt waren +22,3 KB und +8,8 Prozent; es ist etwa die
Hälfte geworden. *Zum Vergleich: Quill allein kostet 62.732 Bytes, also 24,7
Prozent, und erledigt weder das Menü noch die Leseansicht der Beschreibung
noch den Verweis.*

| | neu | entfernt |
|---|---:|---:|
| ausgelieferte Dateien | **1.511** | 23 |
| insgesamt | **3.183** | 853 *(davon 766 der gebaute Auftrag)* |

---

## 8. Die festen Zahlen, die nachgezogen sind

Jede steht mit ihrem Grund im Prüfstand daneben:

- **1.638 → 1.666 Regelzeilen** im Stilblatt. Sie steigt, weil Regeln
  dazukommen: das Menü, die Vorschau der Beschreibung und die sechs Bauformen.
- **Genau acht Blöcke über drei Zeilen** — unverändert. Kein neuer
  Kommentarblock geht darüber.
- **102 → 103 Routen**, **29 → 30 lesende**. `F_ROUTES` bleibt, wo es war: die
  neue Route ist lesend.
- **1.215 → 1.229 Schlüssel** je Sprachdatei, **1.303 → 1.317** mit den
  Mehrzahlformen gezählt.
- **10 → 11 Stufen** der Stapelordnung. Die neue liegt unter der Kopfzeile: das
  Menü soll unter ihr durchlaufen, nicht über ihr stehen.
- **Die sechs Gleichlautsummen.** Sie hängen am ganzen Quelltext von
  `public/app.js`; die Runde legt dort rund fünfhundert Zeilen an und bewegt
  keinen deutschen Satz.
- **Die Kommentarzahlen je Datei** und die Summe darüber, gemessen mit
  `tools/comments.js --rows`. `public/app.js` steht bei **1.901**
  Kommentarzeilen und 19 Prozent; `tools/comments.js` nennt als Ziel ein
  Viertel der Codezeilen, hier 2.086.

---

## 9. Was die Runde nicht angefasst hat

| | wohin es gehört |
|---|---|
| „Auffangnetz" und „Grundausstattung" | eine eigene Umbenennungsrunde |
| Tabellen, Abhaklisten, Codeblöcke, verschachtelte Listen | je eine eigene Runde; die Tabelle ist der naheliegendste Zuwachs |
| Bilder über `![…](…)` | **nie.** `img-src 'self' data: blob:` verbietet die fremde Adresse, und eine erlaubte verriete die Adresse jedes Lesers an einen fremden Server |
| Auszeichnung im Ablehnungsgrund | ein einzeiliges Feld mit 200 Zeichen; eine Zeilenebene hat dort keinen Sinn |
| das Feld im Anlegen-Dialog | es bleibt ein einfaches Feld; was dort getippt wird, wirkt in der Beschreibung trotzdem |
| der Aufklapp-Zweig der Filterleiste | gehört nicht zur Sache |

---

## 10. Was offen bleibt

- **Eine Teilmenge wächst gefahrlos, sie schrumpft nicht.** Kommt etwas
  dazu, wird aus Text eine Auszeichnung — sichtbar und harmlos. Nähme man es
  später weg, verschwände eine Auszeichnung, die jemand gesetzt hat. Deshalb
  ist die Teilmenge klein begonnen.
- **Der einzelne Stern kommt erst dazu, wenn eine Messung am Bestand eine Null
  meldet.** Bis dahin bleibt `3*4 und 5*6` Text.
- **Der Bestand des Betreibers ist nicht gemessen.** Das Werkzeug steht
  bereit; die Zahl aus dem Repository ist null.
