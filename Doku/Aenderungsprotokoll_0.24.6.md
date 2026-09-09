# Änderungsprotokoll 0.24.6 — „Der Rückfall sagt, welche Sprache er wirklich zeigt"

**Eine Reparatur an drei Verwaltungskarten · 9. September 2026 · gebaut auf
0.24.5 (`aa85a6ed`).**

**0.24.5 hat die Sprachpille über den drei Verwaltungskarten repariert, und der
Betreiber hat sie am 9. September 2026 am laufenden Programm abgenommen:
„ja es funktioniert."** *Mit einem Nachtrag, und der war ein eigener Befund:*
**sobald für eine Zeile weder die gezeigte noch die Vorgabesprache einen Eintrag
hat, zeigte die Karte den Namen einer dritten Sprache — und behauptete im
Vermerk, es sei die Vorgabesprache.** „Kein Eintrag" stimmte; die genannte
Sprache nicht.

> **DER BETREIBER IM WORTLAUT, 9. September 2026:** *„Geht es als fallback auf
> deutsch (besser wäre englisch da es ja existiert) aber zeigt an das kein
> eintrag gibt (stimmt) aber sagt das es turkisch (stimmt nicht) anzeigt. Das
> betrifft alle Kacheln dieser drei wofür es keine Eingabe gab. Wenn für alle
> Sprachen Eingaben gab, funktioniert es auch gut."*

**Die Lage, in der es auffällt:** die Vorgabesprache der Installation wird auf
eine Sprache gestellt, **für die es noch nicht überall Einträge gibt** — hier
von Deutsch auf Türkisch. *Deutsch und Englisch sind gepflegt, Türkisch noch
nicht.*

> **UND DIE KARTE MIT DEN GEPFLEGTEN ZEILEN TAT ES RICHTIG.** *Vom Betreiber
> ausdrücklich nachgetragen, mit Bild belegt:* wo für alle drei Sprachen etwas
> eingetragen war, stimmte jede Zelle. **Die richtige Zeile zeigte damit, wo
> die falsche herkam** — und sie steht in dieser Runde als Vergleichszeile im
> Prüfstand.

---

## Die Versionsnummer

**0.24.6 ist ein PATCH-Sprung, und die Runde repariert.** Gewöhnliches SemVer;
die benannte Abweichung von Regel 5.1 ist mit 0.24.4 zu Ende und wird hier
nicht wieder geöffnet.

**Der Funktionswunsch „Potenzial abschaltbar" gehört ausdrücklich NICHT in
diese Runde** — er ist eine Funktion, braucht nach Regel 5.1 eine MINOR-Nummer
und steht im Fahrplan unter 0.25.0. *Der Betreiber hat es am 9. September 2026
so entschieden (F1).*

---

## Die sechs Fragen — vor der ersten Zeile beantwortet

**Zweite Runde unter der Regel aus Abschnitt 11 des Projektstands**, und wieder
ist keine Zeile gefallen, bevor alle sechs beantwortet waren.

| # | Frage | Antwort des Betreibers |
|---|---|---|
| **F1** | Nummer 0.24.6, und nur Reparatur? | **ja, 0.24.6, nur Reparatur** — wie vorgeschlagen; der Potenzialschalter bleibt in 0.25.0 |
| **F2** | Wie lautet die Rückfallkette? | **erste Sprache mit Eintrag** — eingetragen → Vorgabesprache → erste Sprache des Vorrats, die wirklich etwas trägt, in kanonischer Reihenfolge; **und der Vermerk nennt die Sprache, die WIRKLICH dasteht** |
| **F3** | Was ist die Grundzeile nach einem Wechsel der Vorgabesprache? | **kennzeichnen statt behaupten** — an der Ablage ändert sich nichts, aber die Karte behauptet es nicht mehr. **Keine Datenbankstufe** |
| **F4** | Ziehen die Namenstafeln nach? | **ja, aus derselben Antwort** — `PUT /api/settings` trägt sie, `sendLanguages()` nimmt sie an. Kein zweiter Abruf |
| **F5** | Wie weit geht der Prüfstand? | **neun Zellen der zweiten Achse plus die Messung am laufenden Server** |
| **F6** | Augenschein? | **ja, zwei Bilder** — dieselbe Karte vor und nach dem Wechsel der Vorgabesprache |

**Alle sechs sind nach dem Vorschlag ausgefallen.** *Das ist keine
Selbstverständlichkeit und war es in 0.24.5 auch nicht: dort hat F3 eine Frage
beantwortet, die im Papier gar nicht stand.*

---

## Was ein Mensch davon sieht

**Vorher:** Karte „Kategorien", Pille **Türkçe**, drei Zeilen — unter jedem
Namen steht *„(nicht eingetragen — es steht Türkçe)"*, während der Name selbst
deutsch ist (`1_Datenträger_de`, `KI_de`, `Product_de`). Dasselbe an beiden
Kriterienkarten.

**Nachher:**

* **Der Vermerk nennt die Sprache, deren Name wirklich dasteht.** Ist für die
  Vorgabesprache nichts eingetragen, wird die nächste Sprache des Vorrats
  genommen, die etwas trägt — *„besser wäre Englisch, da es ja existiert"*, und
  der Vermerk sagt „English".
* **Trägt keine einzige Sprache etwas, nennt der Vermerk keine.** Er sagt nur
  noch *„(nicht eingetragen)"*. Eine genannte Sprache, die nicht stimmt, ist
  schlimmer als keine.
* **Unter der Sprachzeile steht ein Hinweis, sobald die Vorgabesprache gezeigt
  wird:** was dort steht, ist der Name der Grundzeile — gleichgültig, in
  welcher Sprache er eingetragen wurde.
* **Nach einem Wechsel der Vorgabesprache stimmen die drei Karten sofort**,
  ohne Neuladen.

---

## Der Befund — drei Teile, und sie hängen zusammen

### E1 · Die Tafel folgt der Vorgabesprache, die Ablage nicht

**Gemessen am laufenden Server**, 9. September 2026. Eine Kategorie mit dem
Namen `Product_en` in der Grundzeile und `Product_de` als deutscher
Übersetzung; die Vorgabe der Installation ist `en`:

```
VORHER  (Vorgabe en):  {"de":{"1":"Product_de"},"en":{"1":"Product_en"},"tr":{}}
NACHHER (Vorgabe tr):  {"de":{"1":"Product_de"},"en":{},              "tr":{"1":"Product_en"}}
```

***Türkisch trägt danach einen Eintrag, den nie jemand auf Türkisch eingegeben
hat, und Englisch steht leer da, obwohl der Name dort steht.***

**Der Grund ist kein Fehler von 0.24.5, sondern die Bauform von 0.24.3:** die
Grundzeile trägt keinen Sprachvermerk, und `baseLanguage()` schreibt sie
derjenigen Sprache zu, die *gerade* Vorgabe ist. **Neu ist nur, dass man es
jetzt sieht** — bis 0.24.4 hat niemand die Tafel je zu Gesicht bekommen.

### E2 · Der Vermerk nannte die Sprache, die er zeigen wollte

Am Quelltext ablesbar, `namesFrom()` in `public/app.js`, Stand 0.24.5:

```js
const back = fallback[z.id];
return { ...z, name: back !== undefined ? back : z.name, nameFallback: base };
```

**War auch für die Vorgabesprache nichts eingetragen, fiel der NAME auf
`z.name` zurück** — die Antwort des Servers in der Sprache des **Lesers** —
**und der VERMERK sagte trotzdem `base`.** *Zwei Angaben in derselben Zeile,
aus zwei verschiedenen Quellen, und sie widersprachen sich.*

### E3 · Die Tafel wurde nach einem Wechsel der Vorgabesprache nicht nachgezogen

`sendLanguages()` nahm `LANGUAGES` aus der Antwort an und zeichnete neu —
**`NAMES_ALL` blieb, wie es war.** Danach rechnete die Karte mit der **neuen**
Vorgabesprache auf der **alten** Tafel, und in dieser Lage ist E2 nicht die
Ausnahme, sondern der Normalfall.

> **DAS IST DERSELBE FEHLERTYP WIE D2 DER RUNDE 0.24.5** — ein Zustand im
> Browser, den jemand nachziehen muss, und eine Stelle, an der es niemand tut.
> *0.24.5 hat den Zwischenspeicher abgeschafft und die Tafel an zwei Stellen
> nachgezogen (Start und `adminNew`). **Die dritte Stelle war übersehen
> worden.*** Diese Runde zieht sie nach.

---

## Bauabschnitt 1 — die zweite Achse, nachgestellt

**Die Tafel von 0.24.5 hatte eine Achse: die Sprache des Lesers × die Pille.
Sie bekommt eine zweite — die Vorgabesprache.**

**Gewechselt wird in der Karte und nicht im Aufbau**, und das ist der Punkt:
die drei Vorgabesprachen werden erreicht, wie der Betreiber sie erreicht hat —
mit dem Knopf **„Standard"** in der Karte „Sprachen", im laufenden Programm.
*Eine Prüflage, die jede Vorgabesprache frisch aufsetzt, sähe E3 nie: er hängt
daran, dass `NAMES_ALL` nach dem Wechsel stehenbleibt, während `LANGUAGES`
nachzieht.*

**Der Bestand:** eine Zeile **ohne jede Übersetzung** — sie steht nur in der
Grundzeile — und eine, die in **allen drei Sprachen** gepflegt ist. Die zweite
ist die Vergleichszeile des Betreibers. *Ohne sie belegte die Tafel die Hälfte
nicht: eine Prüflage, die überall rot ist, hat womöglich nur den Prüfstand
falsch aufgesetzt.*

**Fünf der neun Zellen waren rot, bevor repariert wurde** — und die Zelle
*„Vorgabe Türkçe, Pille Türkçe"* zeigte genau das Bild aus dem Feld:

```
steht: {"name":"Grundname","mark":"(nicht eingetragen — es steht Türkçe)"}
soll:  Name "Grundname", Vermerk (keiner)
```

**Dazu vier eigene Prüflagen für die Kette:** der dritte Schritt, die Klammer
ohne Sprachnamen, die kanonische Reihenfolge und die Klemme gegen den Vorrat.
Alle vier waren rot.

> **EIN BEFUND AM PRÜFSTAND SELBST, beim Nachstellen gefunden:** der Mock in
> `buildDom()` übersprang Übersetzungen für die Vorgabesprache
> (`code !== base`) — mit der Begründung, `writeName()` lege für sie gar keine
> Zeile an. **Das stimmt, solange die Vorgabesprache nie wechselt.** Wer eine
> türkische Übersetzung einträgt und *danach* Türkisch zur Vorgabe macht, hat
> genau so eine Zeile, und `namesAll()` am Server setzt sie über die
> Grundzeile. **`namesTableMock()` ist jetzt Zeile für Zeile dieselbe Rechnung**
> (Stolperstein 90). *Keine Prüflage von 0.24.5 ändert sich dadurch — keine
> von ihnen gibt eine Übersetzung für die Vorgabesprache mit.*

---

## Bauabschnitt 2 — die Reparatur

### Die Kette bekommt einen dritten Schritt (E2, F2)

`namesFrom()` in `public/app.js`:

```js
const nameFallbackChain = (shownCode) => {
  const base = baseNamesLanguage();
  const pool = LANGUAGES.filter(a => a.active).map(a => a.code);
  return [base, ...pool].filter((code, i, all) =>
    code !== shownCode && all.indexOf(code) === i);
};
```

**Vier Schritte statt drei:**

1. was für die **gezeigte** Sprache eingetragen ist,
2. sonst die **Vorgabesprache** — ihre Tafel trägt den Namen der Grundzeile,
3. sonst die **erste Sprache des Vorrats**, die wirklich einen Eintrag hat,
4. und sonst, was hereinkam.

**In der kanonischen Reihenfolge des Vorrats**, nicht in der der Tafel: die
Reihenfolge einer Antwort ist keine Aussage. **Und nur aus dem Vorrat** — was
der Eigentümer nicht freigegeben hat, pflegt er auch nicht, und ein Rückfall
darauf zeigte einen Namen aus einer Sprache, die es in dieser Installation
nicht gibt. *Dieselbe Klemme wie bei `namesLanguage()`.*

**Schritt 4 ist die Klammer und kein Weg** — die Tafel der Vorgabesprache kommt
aus den Grundzeilen, und die tragen einen Namen (`NOT NULL`). Sie steht
trotzdem da: ohne sie stünde bei einer Tafel, die eine Zeile nicht kennt, gar
nichts, und ein leerer Name sähe aus wie „nichts angelegt".

**Der Vermerk trägt jetzt zwei Gestalten in EINEM Feld:** `nameFallback` ist
entweder die **Kennung** der Sprache, deren Name wirklich dasteht, oder `true`
— *„es steht ein Rückfall da, und ich kann keine Sprache dafür nennen"*. Der
zweite Fall bekommt einen eigenen Satz **ohne** Sprachnamen
(`card.nameFallbackNone`). *Ein zweites Kennzeichen daneben wäre eine zweite
Aussage über dieselbe Sache gewesen, und die beiden liefen auseinander.*

> **BEIDE SCHLÜSSEL STEHEN WÖRTLICH IM AUFRUF und nicht als Variable.** Das ist
> keine Umständlichkeit, sondern die Bedingung eines Wächters: der Prüfstand
> liest die Aufrufe von `t()` am Quelltext und hält dagegen, dass jeder
> Platzhalter eines Satzes auch gereicht wird. **Ein Schlüssel in einer
> Variablen ist für ihn kein Aufruf** — `{language}` bliebe danach wörtlich am
> Bildschirm stehen, und niemand sähe es. *Der erste Entwurf hat den Wächter
> rot gemacht; er hatte recht.*

### Die Karte sagt, was die Vorgabesprache trägt (E1, F3)

`drawNameLanguages()` hängt unter die Pillenreihe einen gedämpften Satz, sobald
die gezeigte Sprache die Vorgabesprache ist:

> *Türkçe ist die Vorgabesprache: hier steht der Name der Grundzeile —
> gleichgültig, in welcher Sprache er eingetragen wurde.*

**Er steht an der Pillenreihe und nicht an jeder Zeile:** es ist eine Aussage
über die **Tafel** und nicht über eine einzelne Zeile — und an jeder Zeile
stünde derselbe Satz zwanzigmal untereinander. **Und nur, solange die
Vorgabesprache gezeigt wird**: ein Hinweis, der immer dasteht, sagt nichts
mehr.

**An der Ablage ändert sich nichts.** *Der saubere Weg — eine Spalte `language`
an den Grundzeilen samt Migrationsblock — ist eine Datenbankstufe und eine
eigene Runde (F3).*

### Die Tafeln ziehen nach (E3, F4)

**Am Server**, `PUT /api/settings`: die Bedingung steht jetzt einmal als
`languagesTouched` und trägt beides — das Schreiben und die Antwort.

```js
...(isAdmin(req) && languagesTouched
  ? { categoryNames: categoryNamesAll(), criterionNames: criterionNamesAll() } : {}),
```

**Nur wenn die Sprachfrage berührt war:** dieser Weg schreibt auch Filter,
Ansichten und vierzehn Vokabelwörter, und keiner dieser Rufer braucht zwei
Namenstafeln in der Antwort. **Und nur für den Admin**, an derselben einen
Klemme wie beim Lesen (F3 der Runde 0.24.5).

**An der Karte**, `sendLanguages()`: ein `takeNames(s)` neben dem
`LANGUAGES = s.languages`. *Dieselbe Zeile wie `takeVocabulary()` beim
Sprachwechsel des Lesers — kein zweiter Abruf, kein Zwischenspeicher, der
gepflegt werden muss.*

**`F_ROUTES` steigt nicht:** es sind zwei Felder mehr in einer Antwort, die es
längst gibt, und kein neuer Weg.

---

## Bauabschnitt 3 — der Prüfstand

**Die neue Gruppe „Die Vorgabesprache als zweite Achse — 0.24.6"** hält
zweiundvierzig Zusagen:

| was | wie viele |
|---|---|
| **Die neun Zellen** — drei Vorgabesprachen × drei Pillen, an einer Zeile ohne Übersetzung; jede mit dem Namen **und** der genannten Sprache als Sollwert | 9 |
| **Der Kartenhinweis** — er steht genau dann da, wenn die Vorgabesprache gezeigt wird, und sonst nicht | 9 |
| **Die Vergleichszeile** — die in allen drei Sprachen gepflegte Zeile, an jeder Zelle mitgelesen | 9 |
| **Der Aufbau je Vorgabesprache** — der Knopf „Standard" steht da, und der Rumpf nennt wirklich die neue Vorgabe | 6 |
| **Die Kette** — dritter Schritt, genannte Sprache, Klammer ohne Sprachnamen, Aufbau | 4 |
| **Die Reihenfolge** — tragen zwei Sprachen etwas, gewinnt die erste des Vorrats | 1 |
| **Der Vorrat** — eine Sprache außerhalb trägt den Rückfall nicht (mit Aufbau) | 2 |
| **Kein zweiter Abruf** — der Wechsel holt die Tafeln nicht nach | 1 |
| **Die Zählprobe** — es waren wirklich neun Zellen | 1 |

**Dazu neun Zusagen am laufenden Server**, in der Gruppe „Die Namenstafeln je
Sprache": die Messung aus E1 (Türkisch trägt danach den Grundzeilennamen,
Deutsch steht leer, und was wirklich eingetragen ist, wandert nicht), die
Antwort des Wechsels mit beiden Tafeln und dem neuen Stand, `languages`
weiterhin daneben, ein Schreiben **ohne** Sprachfrage ohne Tafeln, und die
Klemme `isAdmin(req)` am Quelltext.

**Die 27 Zellen von 0.24.5 und die neun der Kachel „Vokabular" sind grün
geblieben** — vorher wie nachher.

**Zwei Wächter haben mitgezogen:**

* **Die Zahl der Sätze je Sprachdatei: 1278 → 1280.** Zwei Sätze sind
  dazugekommen (`card.nameFallbackNone`, `card.namesBaseRow`), beide in einer
  eigenen Liste `WORDING_NEW_0246` — die Listen sind die Buchführung darüber,
  welche Runde welchen Satz gebracht hat.
* **Die Umschalterprobe zählt jetzt Pillen und nicht Kinder.** Seit dieser
  Runde liegt im Kasten der drei Namenskarten außer den Pillen auch der
  Kartenhinweis; `children` zählte ihn mit, und aus drei Sprachen wurden vier.
  *Was diese Zeile fragt, sind die Sprachen.*

---

## Die Gegenproben

**Zehn neue (749 bis 758), zwei mitgegangen.**

<!-- TABELLE -->

---

## Der Augenschein

<!-- AUGENSCHEIN -->

---

## Was ausdrücklich nicht gebaut wurde

* **Keine Datenbankstufe.** Eine Spalte `language` an den Grundzeilen wäre der
  saubere Weg für E1 und ist eine eigene Runde *(F3)*.
* **`localeOf(req)` ist unangetastet** — wie in 0.24.5. Die Reihenfolge der
  drei Quellen gilt weiterhin für Meldungen.
* **Nichts am Vokabular.** Es ist von allen dreien nicht betroffen: seine
  Tafeln tragen je Sprache nur Eingetragenes und kennen keine Grundzeile. *Es
  läuft als Vergleichsgruppe mit und ist grün geblieben.*
* **Der Funktionswunsch „Potenzial abschaltbar"** *(F1)* — er steht im Fahrplan
  unter 0.25.0.

---

## Stolpersteine dieser Runde

**Der Wächter über die Platzhalter liest den Quelltext, nicht den Lauf.** Der
erste Entwurf hat den Schlüssel des Vermerks in eine Variable gelegt
(`t(fallbackWording, { language })`) — sauber zu lesen und für den Wächter kein
Aufruf. *Er hat es gemeldet, und er hatte recht: ein Satz, dessen Platzhalter
niemand füllt, steht wörtlich am Bildschirm.* **Beide Schlüssel stehen jetzt
wörtlich da.**

**Ein Kasten, in dem plötzlich mehr liegt als vorher, bricht jede Zählung
darüber.** Der Kartenhinweis liegt im selben Kasten wie die Pillen — richtig
so, denn `box.innerHTML = ''` räumt ihn beim Neuzeichnen mit weg. **Die
Zählungen darüber mussten mitziehen**, und zwar von `children` auf `.pill`:
*was sie fragen, sind die Sprachen und nicht die Knoten.*

**Ein Mock, der eine Vereinfachung trägt, hält genau so lange, wie die
Vereinfachung stimmt.** `namesTableMock()` übersprang Übersetzungen für die
Vorgabesprache — richtig, solange die Vorgabesprache nie wechselt, und diese
Runde handelt von nichts anderem als ihrem Wechsel. *Stolperstein 90 in einer
Gestalt, die erst eine Runde später sichtbar wird.*

---

## Was danach offen bleibt

**E1 ist gekennzeichnet und nicht behoben.** Die Grundzeile trägt weiterhin
keinen Sprachvermerk, und ein Wechsel der Vorgabesprache verschiebt weiterhin
den ganzen Bestand dieser Namen von einer Tafel auf die andere. **Was fällt,
ist die Behauptung** — die Karte sagt jetzt, was dort steht. *Der saubere Weg
ist eine Spalte `language` an `product_categories` und `rating_criteria` samt
Migrationsblock; er gehört in eine eigene Runde und steht als Vorschlag im
Fahrplan.*
