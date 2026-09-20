# Änderungsprotokoll 0.38.3 — „Der Sprung zum Kommentar"

Gebaut am 20. September 2026, auf 0.38.2. PATCH.

Ein Befund des Betreibers am Verweis auf einen Kommentar: der Klick öffnete den
richtigen Eintrag, die Seite stand danach aber am Ende der Kommentarliste statt
an der gemeinten Zeile. Dazu die Frage, ob der Sprung auch dann trifft, wenn
Angepinntes, Aufgaben und Berichte die Anzeige umstellen, und ob ein Verweis
innerhalb desselben Eintrags gleiten kann, statt neu zu zeichnen.
**Keine Schemaänderung, keine neue Route, kein neuer Schlüssel in den
Sprachdateien.**

| | vorher | nachher |
|---|---:|---:|
| Zeilen in `public/app.js` | 10.374 | **10.460** |
| davon Kommentar | 1.943 | **1.961** |
| Regelzeilen in `public/style.css` | 1.672 | **1.672** |
| Schlüssel je Sprachdatei | 1.229 | **1.229** |
| Auslieferung, gzip | 270.006 | **271.199** |
| Prüfungen | 7.181 | **7.201** |
| Rückbauten | 1.097 | **1.104** |

> **FINGERPRINT DIESER RUNDE: `a91efceb`** — der Stand davor war `383b2511`.

---

## 1. Was nachgemessen worden ist, bevor etwas gebaut wurde

Die Prüflage lief gegen eine echte Instanz mit Chromium: zwei Einträge, im
Zieleintrag 40 Kommentare, darunter drei angepinnte, zwei Aufgaben und zwei
Berichte. Gemessen wurde am Bildschirm (1280 × 800) und am Telefon
(390 × 844), mit zugeklapptem und mit offenem Kommentarblock, mit und ohne
Suchbegriff in der Adresse, und mit einem Quelleintrag, der vor dem Klick ganz
nach unten gescrollt war.

**Die Anzeigereihenfolge ist nicht der Grund.** Die Adresse trägt `?c=<id>` —
die Nummer des Kommentars in der Datenbank. Die Anzeige sortiert nach
`pinned DESC`, dann Aufgabe, Bericht, Notiz, dann `id`; die Nummer in der
Kopfzeile zählt dagegen nach `id`. Beide Zahlen gehen auseinander, der Sprung
hängt aber an keiner von beiden Reihenfolgen: er sucht
`.cmt[data-comment="<id>"]`. **Nachgemessen: der Verweis auf Kommentar 1 trifft
ihn an Anzeigestelle 9 von 31.**

**Der Sprung ans Seitenende ließ sich in Chromium nicht nachstellen.** Chromium
verankert den Bildlauf und hält beim Nachwachsen der Seite von sich aus
dagegen, solange der Knoten, an dem es sich festhält, stehen bleibt. Gefunden
sind stattdessen die drei Stellen darunter — die zweite und die dritte sind für
sich reproduzierbar, die erste erklärt den Befund.

---

## 2. Der Sprung stand am Ende der ersten Zeichnung

`renderDetail()` rief `commentJump()` als letzte Zeile, nachdem alle Blöcke
einmal gezeichnet waren. Danach ändert sich die Seite weiter:

- `drawComments()` baut `#cmts` vollständig neu, sobald die Auskunft über die
  Verweise ankommt — der Knoten, an dem die Verankerung des Browsers hängt,
  ist dann fort.
- `drawDesc()` zeichnet die Beschreibung neu, wenn ihre Verweise ankommen; aus
  einer rohen Adresse über drei Zeilen wird ein Kasten über eine.
- `drawAtts()` setzt die Vorschau eines Anhangs nach, wenn der Server sie
  liefert.

Gemessen an einer Prüflage mit zwölf Verweisen über dem Ziel: die Zeile wandert
nach dem Sprung um **24 Pixel** am Bildschirm und um **72** am Telefon. Die
Verankerung von Chromium fängt das nicht, weil `#cmts` als Ganzes ersetzt wird;
Safari hat sie gar nicht.

**Gebaut ist ein Halt.** `commentHold()` sieht Bild für Bild nach, ob die Zeile
noch dort steht, wo sie hingelegt wurde, und stellt sie zurück, wenn sie sich
um mehr als einen Pixel bewegt hat. Der Halt endet nach **1600 Millisekunden**
oder früher — bei `wheel`, `touchstart`, `pointerdown` oder `keydown`. **Keines
dieser vier Ereignisse entsteht durch den eigenen Ruf**, sie kommen also vom
Leser, und dann hat er das letzte Wort.

Nachgemessen im Browser: wächst ein Block über dem Ziel um 600 Pixel, bleibt
die Zeile bei 365 Pixeln stehen. Scrollt der Leser selbst, endet der Halt und
die Seite bleibt, wo er sie hingestellt hat.

---

## 3. Im eigenen Eintrag wird nicht mehr neu gezeichnet

Der Klickbehandler in `markupRefNode()` verglich die Adresse Zeichen für
Zeichen:

```
if (location.hash !== a.getAttribute('href')) return;
```

Ein Verweis auf eine **andere** Zeile desselben Eintrags fiel damit durch:
`#/item/1` ist nicht `#/item/1?c=17`. Der Browser wechselte die Adresse,
`route()` rief `renderDetail()`, und die ganze Ansicht wurde ein zweites Mal
aufgebaut — mit zwei Rufen an den Server und allen Blöcken von vorn.

Jetzt entscheidet der **Eintrag** und nicht die Adresse:

```
const open = (ENTRY_PATTERN.exec(location.hash || '') || [])[1];
if (Number(open) !== Number(row.itemId)) return;
```

Zeigt der Verweis in den Eintrag, der offen steht, übernimmt der Behandler den
Klick: die Adresse zieht über `history.replaceState()` nach — ohne
`hashchange`, also ohne Zeichnung —, und die Seite **gleitet** zur Zeile
(`behavior: 'smooth'`). In einen anderen Eintrag bleibt es beim Wechsel der
Adresse und beim Sprung.

**Zwei Grenzen stehen daneben.** `prefers-reduced-motion: reduce` schaltet das
Gleiten ab; der Sprung bleibt. Und steht die Zeile nicht im Baum der Seite —
der Kommentar ist gelöscht, die Auskunft war älter —, geht der Klick an den
Browser, damit der Eintrag neu geholt wird.

Nachgemessen: der erste Klick auf einen Verweis im eigenen Eintrag trifft die
Zeile bei 365 Pixeln, eine vorher gesetzte Marke am DOM steht danach noch, und
in 40 Bildern kommen **39 verschiedene Scrollwerte** vor — es ist also wirklich
ein Weg und kein Sprung.

**Ein gleitender Weg verträgt den Halt aus Punkt 2 nicht**, weil beide
gleichzeitig scrollen würden. Er läuft deshalb nur beim Sprung.

---

## 4. Ein laufender Ruf war keine Auskunft

`markupRefLoad()` merkte jeden angefragten Schlüssel sofort in `COMMENT_REFS`
vor:

```
for (const k of ask) COMMENT_REFS.set(k, null);
```

`markupRefMissing()` filtert über `COMMENT_REFS.has(n)`. Die **zweite** Stelle
derselben Ansicht sah den Schlüssel damit als beantwortet, fragte nicht und
meldete sich beim Ankommen der Antwort nicht zum Neuzeichnen an. Steht dieselbe
Adresse in der Beschreibung und in einem Kommentar, behielt der Kommentar die
rohe Adresse — und die trägt `target="_blank"`, öffnet also einen neuen Tab,
statt zu springen.

Nachgemessen an einer Instanz, ein Eintrag, eine Adresse:

| Beschreibung trägt dieselbe Adresse | Kästen im Kommentar | rohe Links |
|---|---:|---:|
| nein | 1 | 0 |
| ja | **0** | **1** |

Gebaut ist eine zweite Tafel: `COMMENT_REFS` trägt nur noch Antworten,
`COMMENT_REFS_ASK` die laufenden Rufe. Wer einen Schlüssel fragt, der schon
unterwegs ist, hängt sich an dasselbe Versprechen an, statt ein zweites Mal zu
rufen. **Ein Ruf geht hinaus, beide Stellen bekommen ihre Auskunft.**

Was der Server nicht beantwortet, steht nach einem geglückten Ruf als `null` in
`COMMENT_REFS` und wird nicht wieder gefragt.

---

## 5. Ein gescheiterter Ruf zeichnete neu und fragte damit wieder

0.38.1 hat den gescheiterten Ruf vergessen lassen, damit nicht jeder Verweis
der Seite bis zum Neuladen ein einfacher Link bleibt. Der Rufer zeichnete
danach aber in jedem Fall neu:

```
if (missing.length) markupRefLoad(missing).then(drawComments);
```

Die neue Zeichnung fand dieselben Schlüssel wieder, rief wieder, scheiterte
wieder — eine Schleife aus Anfragen, solange der Server nicht antwortet.

`markupRefLoad()` meldet jetzt zurück, **ob eine Auskunft angekommen ist**, und
nur dann wird neu gezeichnet. Der gescheiterte Ruf bleibt vergessen; die
nächste Zeichnung aus einem anderen Anlass fragt wieder.

---

## 6. Welche Zeile leuchtet, steht an einer Stelle

`renderDetail()` führte `litComment` als eigene Angabe, `commentJump()` setzte
die Klasse `lit` daneben. Nach einem Sprung im eigenen Eintrag liefen beide
auseinander: beim nächsten Zeichnen leuchtete wieder die Zeile aus der Adresse
und nicht die, zu der gesprungen worden war.

Gebaut ist `LIT_COMMENT` auf Modulebene. `renderDetail()` setzt sie aus der
Adresse, `commentJump()` überschreibt sie, `drawComments()` liest sie, und der
Zeitgeber nach 2600 Millisekunden räumt sie weg.

---

## 7. Was die Runde an Größe kostet

| | vorher | nachher | Unterschied |
|---|---:|---:|---:|
| `public/app.js` gzip | 146.241 | **147.434** | +1.193 |
| `public/style.css` gzip | 52.898 | **52.898** | ±0 |
| drei Sprachdateien gzip | 69.113 | **69.113** | ±0 |
| `index.html`, `theme.js`, `favicon.svg` gzip | 1.754 | **1.754** | ±0 |
| **Auslieferung zusammen** | **270.006** | **271.199** | **+1.193** |

**+0,44 Prozent.**

---

## 8. Prüfstand und Gegenproben

**Zwanzig neue Prüfungen** in `test/ui_entry.js`, Gruppe „Der Sprung zum
Kommentar trifft und hält":

- Die Anzeige steht anders als die Nummerierung, und der Sprung trifft trotzdem
  — der erste Kommentar an vierter Anzeigestelle, der letzte an erster.
- Es leuchtet genau eine Zeile, sie steht in `LIT_COMMENT`, und eine Zeile, die
  es nicht gibt, lässt nichts leuchten.
- Aus einem anderen Eintrag wird gesprungen, im eigenen geglitten.
- Der Klick in den offenen Eintrag wird übernommen und die Adresse zieht nach;
  der Klick in einen anderen bleibt dem Browser.
- Der Halt hat eine Frist und vier Ereignisse, die ihn beenden.
- Zwei Stellen fragen dieselbe Adresse: **ein** Ruf geht hinaus, beide bekommen
  ihre Auskunft, und die Vormerkung bleibt nicht stehen.
- Ein gescheiterter Ruf meldet, dass keine Auskunft kam, und wird vergessen.

**Sieben neue Gegenproben, 1162 bis 1168:** der Klick entscheidet wieder nach
der Adresse, die Adresse zieht nicht nach, der Sprung gleitet nicht, der Halt
hat keine Frist, ein laufender Ruf gilt wieder als Auskunft, ein gescheiterter
Ruf zeichnet wieder neu, und die leuchtende Zeile steht wieder in jeder
Zeichnung für sich. **Gegenprobe 1155** sucht denselben Aufruf wie bisher und
ist auf seine neue Form gebracht. Alle acht sind gefahren, **keine ist stumm**.

**Die sechs Gleichlautsummen sind nachgezogen.** Die Probe misst den Quelltext
von `public/app.js`; die Runde ändert Code, also ändern sich alle sechs. Die
früheren Werte stehen in `test/release_031.js` neben den neuen.

**`(prefers-reduced-motion: reduce)` steht jetzt in der Liste der benannten
Texte** in `test/ui_language.js`, neben den zwei Medienabfragen, die schon dort
standen. Es ist der dritte.

---

## 9. Was offen bleibt

- **Der Halt ist eine Frist und keine Messung.** Er endet nach 1600
  Millisekunden, auch wenn danach noch etwas nachlädt. Eine Vorschau, die
  länger braucht, verschiebt die Zeile weiterhin. Der Ausweg wäre ein
  `ResizeObserver` über die ganze Ansicht; er kostet einen Beobachter, der über
  die Lebensdauer des Sprungs hinaus läuft, und ist deshalb nicht gebaut.
- **Der Sprung ans Seitenende ist in Chromium nicht nachgestellt worden.** Was
  gebaut ist, nimmt ihm die Ursache — die Seite, die unter der Zeile
  weiterwandert —, aber der Beleg am gemeldeten Bild fehlt. Tritt er wieder
  auf, gehört als Nächstes der Browser des Betreibers in die Meldung.
- **Ein Verweis auf einen gelöschten Kommentar bleibt eine rohe Adresse** und
  öffnet einen neuen Tab auf denselben Eintrag. Der Server antwortet für diesen
  Schlüssel mit nichts, und ohne Auskunft gibt es keinen Kasten. Eine Marke
  „gelöscht" wäre denkbar und ist nicht gebaut.
