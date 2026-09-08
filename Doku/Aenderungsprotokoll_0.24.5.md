# Änderungsprotokoll 0.24.5 — „Die Pille sagt, welche Sprache sie zeigt"

**Eine Reparatur an drei Verwaltungskarten · 8. September 2026 · gebaut auf
0.24.4 (`5c762c71`).**

**Seit 0.24.3 tragen Kategorien und Kriterien einen Namen je Sprache, und über
jeder der Verwaltungskarten steht eine Pillenreihe, mit der man zwischen diesen
Sprachen umschaltet. Sie tat es nicht.** Der Betreiber hat am 8. September 2026
alle neun Kombinationen aus drei Lesersprachen und drei Pillen an zwei Karten
durchprobiert — **achtzehn Zellen, zwölf davon falsch** — und danach
nachgetragen, dass es die dritte Karte genauso trifft. *Diese Runde hat alle
siebenundzwanzig Zellen im Prüfstand nachgestellt und dann repariert.*

> **UND DIE KACHEL „VOKABULAR" TAT ES RICHTIG.** *Vom Betreiber ausdrücklich
> nachgetragen, und es war die wichtigste Angabe des ganzen Befunds:* dieselbe
> Pillenreihe, derselbe Bildschirm, dieselbe Bauform — und dort stimmte jede
> Zelle. **Der Unterschied lag nicht in der Karte, sondern in der Klempnerei
> darunter, und damit zeigte die funktionierende Karte die Antwort für die
> kaputte.**

---

## Die Versionsnummer

**0.24.5 ist ein PATCH-Sprung, und die Runde repariert.** Das ist gewöhnliches
SemVer und braucht keine Begründung — **die benannte Abweichung von Regel 5.1
endet mit 0.24.4 und wird hier nicht wieder geöffnet.**

*Der Betreiber hat die Nummer am 8. September 2026 entschieden („Auftrag für
0.24.5"). Drei Gründe standen im Auftrag: es ist ein Fehler in dem, was 0.24.3
und 0.24.4 gebaut haben; 0.25.0 ist die Runde der kleinen Fehler und dieser
Befund wäre der größte Einzelposten darin; und 0.25.0 hat eine Messung vor
sich, und eine Runde mit Messung ist keine, auf die ein Feldfehler wartet.*

---

## Die acht Fragen — und diesmal in der richtigen Reihenfolge

**Das ist die erste Runde unter der Regel aus Abschnitt 11 des Projektstands:
die Fragen des Auftrags werden mit dem Betreiber durchgegangen, bevor gebaut
wird.** In 0.24.4 war das nicht geschehen; drei Entscheidungen fielen hinterher
anders aus, und alle drei waren ein zweites Mal zu bauen.

**Diesmal ist keine Zeile gefallen, bevor alle acht beantwortet waren.** F1 war
am Kopf des Auftrags schon beantwortet, F2 gegenstandslos; die übrigen sechs
sind am 8. September 2026 gestellt und beantwortet worden.

| # | Frage | Antwort des Betreibers |
|---|---|---|
| **F1** | Welche Nummer? | **0.24.5** — wie vorgeschlagen |
| **F2** | Doch noch in 0.24.4? | **gegenstandslos**, 0.24.4 war gemergt |
| **F3** | Wie kommt eine Karte an eine fremde Sprache? | ***„Wir müssen die Rollen betrachten. Ein Admin und Eigentümer muss ja die Felder pflegen und auch editieren, eintragen etc. Für den kann man alles auf einmal holen. Und beim Umschalten entsprechend anzeigen. Der normale User soll nicht mal die Pille über der Kachel sehen können. Er sieht nur die Bezeichnungen der Sprache, den er im persönlichen Bereich eingestellt hat."*** — **das ist der Weg der Vokabelkachel plus eine Rollenfrage, die der Vorschlag nicht gestellt hatte** |
| **F4** | Was zeigt eine Zeile ohne Eintrag? | ***„Wenn die Felder von Defaultsprache gefüllt sind, werden sie vorgezogen. Ist da auch nicht, wird die Vorgabe genommen. Und gerne gedämpft der Hinweis, dass dies ein Fallback ist und für die ausgewählte Sprache keine Eingabe existiert."*** |
| **F5** | `NAMES_FETCHED` reparieren oder abschaffen? | **abschaffen, samt `fetchNames()`** |
| **F6** | Dreiteilung auch für „Kategorien"? | **nein, nicht in dieser Runde** |
| **F7** | Wie viele Zellen hält der Prüfstand? | **alle — und mit dem Nachtrag sind es 27 statt 18**, dazu neun als Vergleichsgruppe |
| **F8** | Augenschein? | **ja, klein: drei Bilder** |

> **DIE ANTWORT AUF F3 HAT DIE RUNDE GRÖSSER GEMACHT, NICHT KLEINER.** Der
> Vorschlag fragte nur, *woher* die Namen kommen. Die Antwort fragt zurück,
> *wer* sie überhaupt bekommen soll — und beantwortet damit eine Frage, die im
> Auftrag gar nicht stand. **Die Namenstafeln gehen seither nur an den Admin.**
> *Wäre die Frage aus der Vorschlagsspalte übernommen worden, trüge jede
> Antwort an jeden Benutzer eine Tafel, die er nicht lesen darf und nicht
> braucht.*

---

## Was ein Mensch davon sieht

**Vorher:** über „Kategorien" stehen drei Pillen. Ein deutscher Leser drückt
„Türkçe" — die Liste bleibt deutsch. Ein englischer Leser drückt „Deutsch" —
die Liste bleibt englisch. Und wer vorher schon einmal umgeschaltet und
zwischendurch seine eigene Sprache gewechselt hat, sieht eine dritte.

**Nachher:** die Pille zeigt, was auf ihr steht. Und wo für diese Sprache nichts
eingetragen ist, steht der deutsche Name da **mit einem gedämpften Vermerk
darunter**: „(nicht eingetragen — es steht Deutsch)".

**Am Bestand hat sich nichts geändert.** Es war ein Fehler auf dem **Leseweg**,
nicht auf dem Schreibweg — anders als B1/B2 der Runde 0.24.4, zwei Karten
weiter, wo die Kachel für jedes leere Feld eine Vorgabe in die Ablage legte.
*Wer in dieser Zeit umbenannt hat, hat in der Sprache umbenannt, auf die die
Pille zeigte: die Sprachangabe im Rumpf war seit 0.24.3 richtig.*

---

## Bauabschnitt 1 — die siebenundzwanzig Zellen, nachgestellt

**Nachstellen vor Reparieren, und zwar als Tafel und nicht als Stichprobe.**

Der Bestand der Prüfgruppe ist der des Befunds: eine Kategorie mit `de`, `en`
und `tr`, eine mit `de` und `en` und **ohne** `tr`; zwei Kriterien im Kasten
„nachher", eines im Kasten „vorher", eines davon ohne türkischen Namen. *Ohne
die Zeilen ohne Übersetzung belegte die Tafel die Hälfte nicht.*

**Der erste Lauf sagte:**

| | Ergebnis |
|---|---|
| 27 Zellen der drei Namenskarten | **18 rot** — genau die, in denen die Pille nicht die Sprache des Lesers nennt |
| davon auf der Diagonale (Pille = Leser) | **9 grün** |
| 9 Zellen der Kachel „Vokabular" | **9 grün** — vorher wie nachher |
| Folgeprobe in *einer* Sitzung | **rot** |

***Damit war der Befund gemessen und nicht mehr berichtet*** — und die
Vergleichsgruppe hat bewiesen, dass der Prüfstand die Wirklichkeit trifft und
nicht überall rot ist.

**Der Mock musste dafür erst genau werden.** Er antwortete auf
`/api/product-categories` und `/api/criteria` mit einer festen Liste. Jetzt
antwortet er **wie `localeOf(req)`**: er **hört den Kopf `Accept-Language`
nicht**, sondern liest den persönlichen Schlüssel. *Ein Mock, der den Kopf
beantwortet hätte, zeigte eine Klempnerei, die es nicht gibt — und die
achtzehn gemeldeten Zellen wären von selbst grün gewesen (Stolperstein 90).*
Dazu zieht der persönliche Schlüssel jetzt wirklich mit, wenn ihn ein `PUT`
setzt; **ohne das wäre die Folgeprobe in einer Sitzung nicht nachstellbar.**

---

## Bauabschnitt 2 — die Reparatur

### D1 — die Karte fragte nach einer Sprache, die der Server nicht hört

**`fetchNames(code)` holte die beiden Listen mit `Accept-Language: <code>`.**
Beide Wege antworten in `localeOf(req)`, und das fragt **zuerst den
persönlichen Schlüssel**:

```
const chosen = req.user ? getUserSetting(req.user.id, 'language', null) : null;
if (typeof chosen === 'string' && pool.includes(chosen)) return chosen;
return acceptedLanguage(req, pool) || languageDefault();
```

**Wer eine persönliche Sprache gesetzt hat — und das hat in dieser Karte jeder
—, bekam auf jede Pille die Liste seiner eigenen.** Der Kopf wurde nie gelesen.

> **`localeOf(req)` IST NICHT ANGEFASST WORDEN.** Für Meldungen ist die
> Reihenfolge der drei Quellen genau richtig und in 0.24.3 beschlossen. Falsch
> war, diesen Kopf als Frage nach einer fremden Namenstafel zu benutzen: **er
> ist die Antwort auf „in welcher Sprache sprichst du mit mir", nicht auf
> „welche Namenstafel meinst du".**

**Deshalb wird nicht mehr gefragt.** `GET /api/settings` trägt seit dieser Runde
zwei Tafeln:

| Feld | was darin steht |
|---|---|
| `categoryNames` | je Sprache, was für sie **eingetragen** ist — die Tafel der Vorgabesprache kommt aus der Grundzeile |
| `criterionNames` | dasselbe für die Kriterien, über beide Kästen |

**Es ist das Eingetragene und nicht der Rückfall** — dieselbe Unterscheidung wie
zwischen `vocabularies` und `vocabulariesOwn` seit 0.24.4. *Eine Tafel mit
eingesetztem Rückfall wäre von einer mit Einträgen nicht zu unterscheiden, und
die Karte könnte den Rückfall nicht mehr kennzeichnen.*

**`F_ROUTES` steigt nicht:** es ist ein Feld mehr in einer Antwort, die es
längst gibt, und kein neuer Weg.

**Und nur für den Admin (F3).** Wer den Umschalter nicht sieht, bekommt die
Tafel nicht — *eine Antwort, die etwas trägt, das ihr Leser nicht lesen darf,
ist eine Antwort auf eine Frage, die er nicht gestellt hat.*

### D2 — der Zwischenspeicher ist weg

**`NAMES_FETCHED` und `fetchNames()` gibt es nicht mehr** (F5). Was schon da
liegt, muss man nicht merken; und was es nicht gibt, kann nicht veralten.

*Der Speicher wurde beim Umbenennen und beim Anlegen geleert, beim Wechsel der
eigenen Sprache nicht. Was unter dem Schlüssel `tr` lag, war in Wahrheit die
Liste der Sprache, die der Leser las, als er die Pille das erste Mal drückte —
und genau daher kam die Zelle, die Englisch zeigte, obwohl Englisch dort weder
Leser- noch Pillen- noch Vorgabesprache war.*

### D3 — und was während des Abrufs dastand

**Fällt mit dem Abruf weg.** `namesFrom()` gab, solange geholt wurde, die Liste
des Lesers zurück; das war richtig gedacht und trotzdem falsch, weil eine Liste
in der falschen Sprache nicht aussieht wie „wird geladen", sondern wie eine
Antwort. **Es wird nichts mehr geholt.**

### Und der fünfte Wert von `api()` ist gefallen

**`api(method, url, body, isForm, language)` hat seit 0.24.3 erlaubt, eine
andere Sprache zu verlangen als die des Lesers. Gebraucht wurde das an genau
einer Stelle — und die hat nie funktioniert.**

***Damit kann die Oberfläche eine fremde Sprache gar nicht mehr verlangen.***
Nicht „sie tut es nicht mehr", sondern „sie kann es nicht": ein Weg, den es
nicht gibt, wird auch von der nächsten Runde nicht wieder benutzt.

### F4 — der Rückfall sagt, dass er einer ist

**Drei Schritte, in der Reihenfolge, die der Betreiber genannt hat:** was für
die gezeigte Sprache eingetragen ist; sonst der Name der Grundzeile — und der
ist der Eintrag der Vorgabesprache; und sonst, was hereinkam. *Der dritte
Schritt ist eine Klammer und kein Weg: die Grundzeile trägt einen Namen.*

**Der Rückfall wird gekennzeichnet und nicht stillschweigend eingesetzt:**

* **In der Liste** steht unter dem Namen gedämpft „(nicht eingetragen — es
  steht Deutsch)".
* **Im Umbenennfeld** steht **nur das Eingetragene**; bei einer Zeile ohne
  Eintrag ist es leer, und der Rückfall steht als Platzhalter darin. *Dieselbe
  Entscheidung wie an den vierzehn Vokabelfeldern (0.24.4, B1/B2): ein Feld,
  in dem der Rückfall wie ein Eintrag aussieht, macht beim nächsten Speichern
  einen daraus.*

### Ein Befund, den der Auftrag nicht kannte

**`drawAdmin()` las an `namesFrom()` vorbei.** Es zeichnet nach jedem
Umbenennen, Anlegen, Löschen und Sortieren — und zwar aus `fetched.cats` und
`fetched.crits`, also den Namen in der Sprache des **Lesers**, während
`setUpCategoriesOut()` daneben durch `namesFrom()` ging.

***Zwei Wege in dieselbe Liste, und der eine kannte den Umschalter nicht.*** Wer
auf der Pille „Türkçe" umbenannte, sah danach die deutsche Liste unter einer
türkischen Pille. **Er geht jetzt denselben Weg**, und `adminNew()` zieht die
Tafeln mit einem vierten Abruf nach.

---

## Bauabschnitt 3 — der Prüfstand

**Die Tafel ist grün, die Vergleichsgruppe unverändert grün.** Dazu:

| Probe | was sie hält |
|---|---|
| **Folgeprobe in einer Sitzung** | Pille, Wechsel der eigenen Sprache, dieselbe Pille — dieselbe Liste wie beim ersten Mal |
| **Umbenennprobe** | auf fremder Pille umbenennen: der Rumpf nennt die Sprache der Pille, die Liste bleibt in ihr, der Vermerk bleibt an seiner Zeile, die Pille bleibt stehen |
| **Rückfallprobe** | der Vermerk steht an der Zeile ohne Eintrag **und nicht an der daneben**; das Umbenennfeld ist leer, mit Platzhalter |
| **Rollenprobe** | der gewöhnliche Benutzer sieht keine der vier Sprachzeilen — und die Liste trotzdem, in seiner Sprache |
| **Zählung** | die Tafel hat wirklich 27 Zellen und die Vergleichsgruppe wirklich neun |

> **DIE ZÄHLUNG IST KEIN SCHMUCK.** Die Tafel entsteht in einer Schleife: wer
> eine Sprache aus der Liste nimmt oder eine Karte streicht, macht die Gruppe
> **kleiner, ohne dass ein einziger Punkt rot würde** — und ein Prüflauf, der
> ungefragt weniger prüft, meldet Erfolg für nichts (Stolperstein 81).

**Am laufenden Server eine eigene Gruppe mit eigener Instanz.** Sie musste eine
eigene bekommen: *sie setzt den persönlichen Schlüssel des Rufers — genau die
Quelle, die den Kopf schlägt — und am Hauptserver bliebe er danach stehen; jede
spätere Prüflage, die mit einem Kopf eine andere Sprache verlangt, läse in
Wahrheit ihn.* Sie hält vier Zusagen: **drei Leser, dieselbe Tafel**; **der
persönliche Schlüssel ändert sie nicht**; **der Listenweg folgt weiter dem
Leser** (der Beleg, dass `localeOf` wirklich unberührt ist); und **ein
gewöhnlicher Zugang bekommt keine Tafel, aber seine Liste**.

**Am Quelltext sechs Wächter, und vier davon halten eine Abwesenheit fest** —
kein `NAMES_FETCHED`, kein `fetchNames`, `api()` ohne fünften Wert,
`Accept-Language` ausnahmslos `LANGUAGE`. *Deshalb stehen sie am Quelltext und
nicht am Bildschirm: „es gibt diesen Weg nicht mehr" lässt sich nicht klicken.*
Dazu am Server: **die beiden Bauer der Tafeln nehmen keine Sprache an**, und
sie hängen an **genau einer** Klemme.

---

## Die Gegenproben — zwölf, und gefahren

*(Die Tafel steht am Ende dieses Abschnitts; sie wird beim Fahren gefüllt.)*

---

## Der Augenschein — drei Bilder, drei Sprachen

**Gefahren mit Chromium an einer laufenden Instanz, 1280 × 900, Abschnitt
„Bestand" — und jedes Mal mit gedrückter Pille auf eine *fremde* Sprache**, denn
genau das ist der Fall des Befunds.

| Leser | Pille | was auf dem Bild steht |
|---|---|---|
| **Deutsch** | Türkçe | `Material` *(nicht eingetragen — es steht Deutsch)* · `Alet` · `Dokunuş` · `Pazar durumu` |
| **English** | Deutsch | `Material` · `Werkzeug` · `Optische Erscheinung` · `Marktlage` |
| **Türkçe** | English | `Substance` · `Tool` · `Haptics` · `Workmanship` · `Funktionalität` *(nicht eingetragen — es steht Deutsch)* |

### Und ein Befund, den erst der Augenschein gebracht hat

**Der Vermerk hat den Namen verdrängt.** Am Bildschirm stand in der Karte
„Kategorien" die Zeile *„(nicht eingetragen — es steht De…"* — **und davor kein
Name.**

**Die Ursache ist Flexbox und keine Zeile Logik:** `.mname` trägt `flex: 1`,
und das heißt `flex-basis: 0`. In einer Kartenspalte von rund 280 Pixeln bekommt
der Name damit **keine Grundbreite**, während der längere Vermerk seine volle
behält — also schrumpft der Name auf nichts.

**Die Entscheidung:** der Vermerk steht **unter** dem Namen, nicht neben ihm.
Beides liegt in einem Kasten übereinander, der Name in voller Breite, der
Vermerk als zweite, kleinere Zeile — *dieselbe Bauform wie „(Vorgabe: …)" unter
einem Vokabelfeld.* Und weil in der Kriterienkarte neben dem Namen auch noch
das Gewicht steht, kürzt die zweite Zeile dort mit Auslassung; **der ganze Satz
steht als `title` dahinter**, wie beim Zähler und beim Gewicht daneben.

> **KEIN WÄCHTER HÄTTE DAS GEFUNDEN.** Der Prüfstand liest `.mname` und
> `.mfallback` einzeln, und beide trugen den richtigen Text. *Ob ein Name
> sichtbar ist, sagt kein Wächter, der Strings vergleicht* — dasselbe Ergebnis
> wie beim Augenschein von 0.24.4, nur an einer anderen Stelle.

---

## Was ausdrücklich nicht gebaut wurde

* **`localeOf(req)` ist unangetastet** — die Reihenfolge der drei Quellen ist
  0.24.3 und gilt für Meldungen.
* **Keine zweite Wahrheit in der Adresse.** Die gezeigte Sprache bleibt Zustand
  der Karte.
* **Keine Dreiteilung der Kategorienkarte** (F6).
* **An der Kachel „Vokabular" ist nichts geändert worden.** *Sie war der Maßstab
  dieser Runde. Wer den Maßstab mitrepariert, hat hinterher zwei Karten und
  keinen Vergleich.*
* **Keine Datenbankstufe, keine neue Route, nichts an den Tags.**

---

## Stolpersteine dieser Runde

* **Ein Prüfstand, der jede Zelle frisch aufsetzt, sieht einen Zwischenspeicher
  nie.** Der Befund hing an der Klickfolge *innerhalb* einer Sitzung. Die
  Folgeprobe stellt sie ausdrücklich her.
* **Der Mock muss die Quelle nachbauen, die den Fehler verursacht.** Hier: dass
  der persönliche Schlüssel den Kopf schlägt *und* dass ein `PUT` ihn wirklich
  setzt. Ohne beides wäre der halbe Befund von selbst grün gewesen.
* **Eine Zahl im Prüfstand ist ein Beleg, eine Schleife ohne Zahl ist keiner.**
  Die 27 und die 9 stehen ausdrücklich da.
* **Eine neue Portbasis gehört in die Lücke, nicht ans obere Ende.** 7360 hätte
  die Spanne über den Versatz getrieben; 5010 hätte zwei Nummern gedeckt, die
  `fetch()` gar nicht anwählt. Es wurde 5000.
* **Nummern in `counterproof.js` laufen nicht am Ende der Liste weiter.** 733
  bis 736 waren mit 0.24.4 vergeben und stehen bei ihrer Sache, nicht hinten.
* **Der Augenschein findet, was kein Wächter sieht** — zum zweiten Mal in zwei
  Runden.

---

## Was danach offen bleibt

* **Die Detailansicht im Papierkorb** *(Schritt 2 aus 0.24.4, F7)*.
* **Das Gegenlesen der türkischen Wörterliste** — `Parola` gegen `Şifre`
  zuerst.
* **Rechts-nach-links** und **die Region je Sprache** (`de-AT` neben `de-DE`).
* **Die 42 Stellen im Projektstand, die noch `pruefung.js` und `gegenprobe.js`
  nennen** — Papierarbeit aus 0.24.1.
