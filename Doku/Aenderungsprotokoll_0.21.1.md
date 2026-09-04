# Änderungsprotokoll 0.21.1 — „Die Sortierung sagt, wonach du fragst"

**Eine Sortierung beantwortet eine Frage, aber die Liste zeigte nicht die Menge,
in der diese Frage sich stellt.** *Wer nach **Potenzial** sortiert, fragt „was
mache ich als Nächstes?" — und das fragt sich nur an Ideen. Wer nach
**Bewertung** sortiert, fragt „was war gut?" — und das haben nur getestete
Einträge beantwortet.* **Beide Male stand die andere Hälfte des Bestands mit in
der Liste.**

**Der Bestand ohne Zahl stand dabei schon vorher hinten**, in beiden Richtungen
(`?? -1` beim absteigenden, `?? 99` beim aufsteigenden Vergleich, seit 0.21.0
auch für das Potenzial). *Das war nie der Punkt.* Der Punkt war, dass die andere
Hälfte die Liste **auffüllt**: bei dreizehn Einträgen fällt das nicht auf, bei
zweihundert scrollt man an allem vorbei, was längst durch ist.

> **DAS WAR KEIN FEHLER.** Die Sortierung tat, was sie sollte; sie war nur nicht
> nützlich genug. *Ein Wunsch, der als Fehler abgeheftet wird, drängelt sich in
> die falsche Runde.*

---

## Diese Runde ist KEINE Datenbankstufe — ausdrücklich

**Kein Migrationsblock, keine Spalte, kein Bestandslauf, keine neue Route, kein
neues Modul, keine neue Datei, keine neue Abhängigkeit.** *Der Server weiß von
dieser Runde nichts:* `visibleItems()` filtert im Browser, und das bleibt so.

> **DER RÜCKWEG IST OFFEN UND FOLGENLOS.** Eine ältere Fassung kennt die
> Kopplung nicht und filtert wie bisher — sie liest dieselbe gespeicherte
> Stellung, denn **geschrieben wird nur die gewählte** und nie die abgeleitete.
> **Eine Sicherung schadet nie, ist hier aber nicht nötig.**

**Nach dem Einspielen im Browser einmal hart neu laden** — `public/app.js` und
`public/style.css` haben sich geändert.

---

## Was diese Runde an den Zahlen ändert

| | vorher (0.21.0) | nachher (0.21.1) |
|---|---|---|
| Schema | neun Migrationsblöcke | **unverändert** |
| Austauschformat | 13 | **unverändert** |
| `F_ROUTEN` | 70 | **unverändert** — die Einstellung reist auf `PUT /api/settings` mit |
| Zwecke der zweiten Bestätigung | — | **unverändert** |
| Karten im Systembereich | 21 | **unverändert** |
| ausgelieferte Module | neun | **unverändert** |
| Vokabular | 12 Wörter | **unverändert** |
| **Prüfungen** | **5512** | **5571** *(+59)* |
| **Rückbauten** | **599** | **617** *(+18, Nummern 606 bis 623)* |
| **Stolpersteine** | bis 311 | **bis 313** |

**Beide Zahlen sind gefahren und nicht gerechnet.** *Der Lauf unmittelbar nach
dem Bau, aber noch mit dem unveränderten Prüfstand, hat **5512** gemeldet —
genau die Zahl, die im Protokoll 0.21.0 steht. Die Aufteilung je Gruppe ist aus
den Ausgaben beider Läufe **gezählt**, nicht geschätzt* (Stolperstein 137).

---

## Der Befund, in einer Tabelle

| | vorher | nachher |
|---|---|---|
| Sortierung „Bewertung (hoch → niedrig)" | Liste zeigt alles, Ideen füllen das Ende | **Statusfilter steht auf „Getestet"** |
| Sortierung „Bewertung (niedrig → hoch)" | dito | **dito** |
| Sortierung „Potenzial (hoch → niedrig)" | Liste zeigt alles, Getestete füllen das Ende | **Statusfilter steht auf „Ungetestet"** |
| Sortierung „Potenzial (niedrig → hoch)" | dito | **dito** |
| alle übrigen Sortierungen | — | **fassen den Filter nicht an** |
| eine von Hand gewählte Pille | gilt | **gilt weiterhin — und schlägt die Sortierung** |

**Die Nummer ist eine PATCH-Zahl.** *Der Maßstab ist die Frage: kann die
Installation danach etwas, was sie vorher nicht konnte? Nein. Sie sortiert
dieselben Einträge nach denselben Zahlen und filtert nach demselben Merkmal;
was sich ändert, ist die Bedienform* — zwei Bedienelemente, die bisher nichts
voneinander wussten, wissen ab jetzt voneinander. **Der Fahrplan rückt nicht.**

---

## 1. Die vier Regeln, mit ihrer Begründung

> **DIE SORTIERUNG ENTSCHEIDET DIE VORGABE, DIE HANDWAHL SCHLÄGT SIE.**
>
> Das ist **Stolperstein 303 aus 0.21.0, eine Ansicht weiter** — dort hieß er
> *„Der Zustand entscheidet die Vorgabe, die Einstellung nicht"* und stand über
> den beiden Sternkästen. Dieselbe Bauform, dasselbe Verhältnis: **ein
> abgeleiteter Zustand und eine ausdrückliche Wahl, und die ausdrückliche Wahl
> gewinnt.**

### (1) Vorgabe statt Befehl

`rating_desc` und `rating_asc` → Vorgabe `tested`. `potenzial_desc` und
`potenzial_asc` → Vorgabe `untested`. **Jede andere Sortierung lässt den Filter
in Ruhe** — sie hat *keine* Vorgabe, nicht die Vorgabe „alles".

*Der Unterschied ist der ganze Grund, warum die Tabelle eine Tabelle ist und
keine Fallunterscheidung: ein `default:`-Zweig, der `'all'` zurückgäbe, machte
aus jeder Sortierung eine Vorgabe und nähme jedem gespeicherten Filter die
Wirkung, sobald jemand nach Titel sortiert.*

```js
const SORTIERUNG_STATUS = {
  rating_desc: 'tested',      rating_asc: 'tested',
  potenzial_desc: 'untested', potenzial_asc: 'untested'
};
```

### (2) Eine Handwahl hält

Sobald jemand eine der drei Statuspillen anklickt, gilt seine Wahl — **auch wenn
sie der Vorgabe widerspricht**, und auch **über einen Wechsel der Sortierung
hinweg**. *Wer bei „Potenzial" ausdrücklich „Alles anzeigen" klickt, bekommt
alles angezeigt, und die nächste Sortierung nimmt es ihm nicht wieder weg.*

**Ein Klick auf die ABGELEITETE Pille ist ebenfalls eine Handwahl.** Sie ist kein
toter Knopf; wer sie drückt, hat sich entschieden, und die Ableitung endet. *Ohne
das käme niemand mehr aus ihr heraus* (Stolperstein 312).

**Die Kopplung geht nur in EINE Richtung:** ein Klick auf „Ungetestet" stellt die
Sortierung **nicht** auf Potenzial um. *Zwei Bedienelemente, die sich gegenseitig
verstellen, sind ein Kreis.*

### (3) Die Ableitung wird nicht gespeichert

`saveFilters()` schreibt weiterhin die **gewählte** Stellung an
`PUT /api/settings`, nicht die abgeleitete.

> **DAS IST DIE WICHTIGSTE DER VIER REGELN, UND SIE IST DER GANZE UNTERSCHIED
> ZWISCHEN EINEM BLICK UND EINER EINSTELLUNG.** *Würde die Ableitung
> mitgespeichert, stünde nach dem Neuladen ein Filter da, den niemand gesetzt
> hat — und wer die Sortierung zurückstellt, bliebe auf ihm sitzen, ohne zu
> wissen, woher er kommt.* **Ein gesetztes Feld, das niemand gesetzt hat, ist
> Stolperstein 304 von der anderen Seite gelesen.**

**Gebaut ist sie als zweiter, ungespeicherter Merker neben `state.filters`:**

```js
let STATUS_VON_HAND = false;
```

*Dieselbe Machart wie `BLICK` aus 0.21.0 und aus demselben Grund **daneben**
statt **darin**: was in `state.filters` steht, geht durch `saveFilters()` hinaus
und ist damit gespeichert.* **Er überlebt kein Neuladen** — eine frisch
aufgebaute Seite hat niemanden, der geklickt hätte, also gilt wieder die Vorgabe
—, **aber er überlebt den Wechsel in einen Eintrag und zurück**: `drawFilters()`
zeichnet neu, das Modul bleibt stehen.

**Gesetzt wird er an genau zwei Stellen** — beim Klick auf eine Statuspille und
in `ansichtAnwenden()`; **zurückgenommen an einer** — im Rücksetzer.

### (4) Es steht dran

**Die abgeleitete Pille trägt eine eigene Klasse** (`pill-abgeleitet`) und im
Stilblatt einen **gestrichelten Rahmen in der Farbe der Wahl, ohne deren
Füllgrund**. *Gefüllt sähe sie aus wie angeklickt und behauptete eine
Einstellung, die niemand vorgenommen hat; gedämpft (`.pill.leer`) sähe sie aus
wie ein toter Knopf, und sie ist keiner.*

**Genau eine Pille ist markiert, und sie sagt immer dasselbe: „so steht die Liste
gerade da".** Greift die Ableitung, ist es ihre — die gespeicherte Stellung wirkt
in diesem Augenblick nicht, und sie als gesetzt zu zeichnen wäre eine
Falschaussage über die gezeigte Menge.

**Daneben steht ein Wort:** `zweiteBeschriftung(r1, 'folgt der Sortierung')` —
dasselbe Bauteil, das „Ablehnung" und „Ansichten" abhebt, eine zweite
Beschriftung ohne eigene Spalte in derselben Zeile. *Sie steht nur da, solange
die Ableitung greift.* **Der Klartext daran nennt auch den Weg hinaus.**

**Und eingeklappt sagt es der Filterschalter:** *„· folgt der Sortierung"*, neben
oder statt der Zahl. *Das Wort neben den Pillen ist dann nicht zu sehen, und der
Schalter ist der einzige Ort, der für die zugeklappte Leiste noch spricht —
Regel 4 gilt an beiden Orten.*

---

## 2. Was gebaut wurde, je Datei

### `public/app.js`

| Stelle | was |
|---|---|
| neben `FILTER_VORGABE` | **`SORTIERUNG_STATUS`** — die Tabelle der vier Vorgaben, samt dem langen Kommentarblock mit den vier Regeln |
| dito | **`STATUS_VON_HAND`** — der ungespeicherte Merker |
| dito | **`statusAusSortierung(sort)`** — die eine Stelle, an der aus Sortierung und Handwahl eine Vorgabe wird (oder `null`) |
| dito | **`statusWirksam(f)`** — was am Ende filtert: die Ableitung, sonst die gewählte Stellung |
| dito | **`statusRuhestellung(f)`** — worauf die Statuszeile von selbst steht, **ohne** Rücksicht auf die Handwahl. *Nachgetragen, siehe Abschnitt 5* |
| dito | **`vorgabeZu(sort)`** — der Zugriff auf die Tabelle über `hasOwnProperty`, an einer Stelle für beide Leser. *Nachgetragen, siehe Abschnitt 5a* |
| `visibleItems()` | die **eine Lesestelle**: `const status = statusWirksam(f);` dort, wo bis dahin unmittelbar `f.tested` stand |
| `drawFilters()`, Statuspillen | `vorgabe` einmal berechnet; die Klasse ist entweder `on` **oder** `pill-abgeleitet`, nie beides; `title` an der abgeleiteten; `onclick` setzt `STATUS_VON_HAND` |
| `drawFilters()`, hinter den Pillen | das Wort **„folgt der Sortierung"** mit `id="f-status-woher"` |
| `drawFilters()`, `sel.onchange` | **`redraw()` statt `saveFilters(); drawBody()`** — die Sortierung ändert jetzt auch, was die Leiste zeigt |
| `drawFilters()`, Rücksetzer | **`STATUS_VON_HAND = false;`** vor dem `redraw()` |
| `filterZahl()` | gezählt wird gegen die **Ruhestellung** statt gegen `all` |
| `zeichneFilterSchalter()` | das Wort am eingeklappten Schalter |
| `ansichtAnwenden()` | **`STATUS_VON_HAND = true;`** — eine Ansicht ist eine ausdrückliche Wahl |

### `public/style.css`

**Eine neue Regel und ihre Überfahrfassung:** `.pill-abgeleitet` (gestrichelt,
Akzentfarbe, kein Füllgrund) und `.pill-abgeleitet:hover`. *Die zweite ist keine
Kosmetik: `.pill:hover` steht weiter oben und zöge sonst auf die gewöhnliche
Textfarbe zurück — die Pille sähe beim Überfahren aus wie jede andere.*

### `pruefung.js`, `gegenprobe.js`

Abschnitt 6 und 7.

**Was ausdrücklich NICHT angefasst wurde:** `server.js`, `db.js`, das Schema, das
Austauschformat, `filterNormal()`, `saveFilters()` selbst, `ansichtAusZustand()`,
die Ablehnung, der Favorit, die Kategorien, die Tags.

---

## 3. Die Entscheidung zu `filterZahl()` — sie zählt NICHT mit

**Der Auftrag hat sie ausdrücklich offen gelassen und dem Bau überlassen.**
*Dafür sprach: die Zahl sagt, wie viele Filter greifen, und die Ableitung
greift. Dagegen sprach: sie steht auch für „wie viel habe ich eingestellt", und
eingestellt hat das niemand.*

> **DEN AUSSCHLAG GAB EIN DRITTES ARGUMENT, UND ES IST BAULICH.**
>
> Dieselbe Zahl trägt der **Rücksetzer** — *„Filter zurücksetzen (3)"* —, und der
> steht **nur da, solange sie größer als null ist**. Zählte die Ableitung mit,
> stünde er auch dann da, wenn sonst nichts gesetzt ist — **und ein Druck darauf
> räumte die Ableitung gerade nicht weg, sondern stellte sie wieder her.** Der
> Knopf säße mit derselben Zahl wieder da, und niemand käme aus ihm heraus.
> *Ein Knopf, der nichts bewirkt, ist dieselbe Auskunft über nichts wie eine
> Null am Zähler „Offen".*

**Gesagt wird die Ableitung trotzdem, nur in Worten statt in einer Zahl:** neben
den Statuspillen und am eingeklappten Schalter. **Regel 4 gilt an beiden Orten**,
und die Frage *„warum sehe ich nicht alles?"* bekommt damit eine bessere Antwort
als eine Ziffer: sie sagt nicht nur, **dass** etwas filtert, sondern **was** und
**warum**.

**Der Schalter färbt sich dabei nicht als „aktiv".** *Die Farbe sagt „du hast
etwas eingestellt", und eingestellt hat das niemand.*

---

## 4. Die Entscheidung zu den Verlaufs-Sortierungen — sie kommen NICHT mit

`tests_*`, `testavg_*`, `testlast_*` **setzen „getestet" logisch genauso
voraus.** *Ein Eintrag ohne Testtag hat weder eine Zahl der Testtage noch einen
Notendurchschnitt noch eine letzte Note.* **Sie kommen trotzdem nicht mit:**

- **Sie sind eine eigene Gruppe im Auswahlfeld** (`<optgroup label="Verlauf">`),
  und diese Runde fasst zwei Gruppen an, nicht drei.
- **Sie sind schwächer gekoppelt als sie aussehen.** *„Getestet" heißt
  `items.tested`, ein Haken; die Verlaufszahlen hängen an `test_days`. Ein
  Eintrag kann als getestet markiert sein und keinen Testtag tragen* — die
  Vorgabe „Getestet" nähme dort nichts weg, während die Sortierung selbst schon
  ordnet. **Die Kopplung wäre also nicht dieselbe, sondern eine ähnliche, und
  eine ähnliche Regel neben einer gleich aussehenden ist Stolperstein 47.**
- **`title_asc` ebenso wenig:** ein Titel sagt nichts über den Teststatus.

> **DIE ENTSCHEIDUNG STEHT ALS ZUSAGE IM PRÜFSTAND UND NICHT NUR IM KOMMENTAR**
> — die Gruppe prüft ausdrücklich, dass `testavg_desc` die Menge stehen lässt,
> und **Rückbau 609** trägt die Verlaufssortierungen probeweise in die Tabelle
> ein. *Wer sie später mitnehmen will, macht dort rot und entscheidet es damit
> ausdrücklich.* **Sie bleiben in „Was offen bleibt".**

---

## 5. Was beim Bauen aufgefallen ist — die Ruhestellung

**Der Prüfstand hat eine Lücke in Regel 2 aufgedeckt, und zwar an ihrer
teuersten Stelle.**

Der Auftrag verlangt (Abschnitt 4): *der Rücksetzer setzt auch die Handwahl
zurück — danach folgt der Statusfilter wieder der Sortierung.* Die Zusage dazu
war schnell geschrieben, und sie wurde **rot**:

```
✗ Und der Ruecksetzer steht da — die Handwahl ist ein gesetzter Filter
      kein Knopf
```

**Der Grund:** wer bei „Potenzial" auf **„Alles anzeigen"** klickt, setzt
`f.tested = 'all'` — und `'all'` ist der Wert aus `FILTER_VORGABE`. `filterZahl()`
verglich gegen genau diesen Wert, zählte also **null**, der Rücksetzer stand
nicht da — **und einen zweiten Weg zurück in die Automatik gibt es nicht.**

> **DAS WAR EINE KLEMME UND KEINE UNSCHÖNHEIT.** Der einzige Ausgang stand genau
> in der Lage nicht da, in der er gebraucht wird — und es ist die Lage, die
> Prüfstandpunkt 3 als „die Zeile, an der die ganze Runde hängt" nennt.

**Gebaut ist die Antwort als `statusRuhestellung(f)`:** *worauf die Statuszeile
von selbst steht, ohne Rücksicht auf die Handwahl.* `filterZahl()` zählt seither
die Abweichung **davon** und nicht mehr von `all`:

```js
if (statusWirksam(f) !== statusRuhestellung(f)) n++;
```

**Drei Lagen, und alle drei fallen richtig aus:**

| Lage | Ruhestellung | wirksam | zählt |
|---|---|---|---|
| `potenzial_desc`, niemand hat geklickt | `untested` | `untested` | **0** — die Vorgabe zählt nicht |
| `potenzial_desc`, „Alles anzeigen" geklickt | `untested` | `all` | **1** — der Rücksetzer steht da |
| `title_asc`, gespeichert `tested` | `all` | `tested` | **1** — wie vor dieser Runde |

**Beides gilt damit zugleich, und es ist kein Widerspruch:** die *Vorgabe* zählt
nicht (niemand hat sie eingestellt), eine *Handwahl gegen die Vorgabe* zählt
sehr wohl (jemand hat sie eingestellt). *Vor 0.21.1 fielen „Vorgabe" und
`FILTER_VORGABE.tested` zusammen; seit die Sortierung eine Vorgabe macht, sind es
zwei Dinge.*

**Eine Restlage bleibt und ist geprüft harmlos:** wer von Hand genau das wählt,
was die Vorgabe ohnehin gäbe, bekommt keinen Rücksetzer — *er sieht aber auch
genau das, was die Automatik zeigte, und beim nächsten Wechsel der Sortierung
weicht seine Wahl ab und der Knopf ist wieder da.* **Der Zustand heilt sich
selbst.**

### 5a. Und ein zweiter Befund, aus dem Gegenlesen des eigenen Diffs

**Die Vorgabetabelle wurde gewöhnlich gefragt:** `SORTIERUNG_STATUS[sort]`.

`f.sort` kommt aus einer **gespeicherten Stellung** — aus den Einstellungen oder
aus einer gespeicherten Ansicht —, und die kann jeden Text tragen: eine Ansicht
aus einer älteren Fassung ebenso wie einen Wert, den jemand von Hand
hineingeschrieben hat. **Träfe er einen Namen vom Prototyp** (`constructor`,
`toString`, `valueOf`, `hasOwnProperty`), **gäbe der Zugriff eine FUNKTION
zurück.**

> **UND DAS WÄRE STILL SCHIEFGEGANGEN, NICHT LAUT.** Eine Funktion ist **wahr**
> — die Ableitung hätte also als greifend gegolten: das Wort *„folgt der
> Sortierung"* stünde da, keine Pille wäre markiert, `filterZahl()` zählte eins.
> **Und weil eine Funktion weder `'tested'` noch `'untested'` ist, hätte
> `visibleItems()` gar nicht gefiltert** — der Statusfilter wäre weg gewesen,
> **samt der gespeicherten Wahl**, ohne eine einzige Meldung.

**Der Ausweg ist eine Zeile und keine Sorgfalt:** gefragt wird über
`vorgabeZu()` mit `hasOwnProperty`, **an einer Stelle für beide Leser**
(`statusAusSortierung()` und `statusRuhestellung()`).

> **DIE REGEL DAHINTER IST NICHT NEU, SIE STAND SCHON IM HAUS.** In
> `visibleItems()` steht am Schlüssel `abgelehnt` seit 0.15.0: *„Jeder andere
> Wert gilt als `all` … eine gespeicherte Ansicht aus einer älteren Fassung
> kennt den Schlüssel nicht, und ein unbekannter Wert darf nichts wegnehmen."*
> **Genau diese Regel galt an der neuen Tabelle noch nicht.**

**Die Prüflage steht an einer Lage mit GESETZTEM Status** — bliebe der Filter
weg, stünden vier Einträge da statt zwei. *Eine Lage mit `tested: 'all'` könnte
den Unterschied nicht zeigen* (Stolperstein 224). **Rückbau 623** nimmt den
Schutz wieder heraus.

**Dabei ist Rückbau 612 mitgegangen statt gelöscht zu werden** (Stolperstein
201): sein Suchtext zeigte auf den Rumpf von `statusAusSortierung()`, und der
ist um eine Zeile kürzer geworden. *Seine Zusage ist dieselbe geblieben.*

---

## 6. Neue Stolpersteine

**312. ZWEI BEDIENELEMENTE, DIE SICH GEGENSEITIG VERSTELLEN, SIND EIN KREIS — UND
MAN KOMMT AUS IHM NICHT MEHR HERAUS.**

*Die Sortierung gibt den Statusfilter vor. Die Kopplung geht deshalb in genau
eine Richtung: ein Klick auf „Ungetestet" stellt die Sortierung NICHT auf
Potenzial um.* **Und die Ableitung muss ein Ende haben, das der Mensch selbst
herbeiführen kann:** eine Handwahl beendet sie, und ein Weg zurück in die
Automatik ist gebaut. *Ohne beides wäre es kein Vorschlag mehr, sondern eine
Klemme.* **Der Weg zurück muss dabei auch dann erreichbar sein, wenn die
Handwahl zufällig auf dem alten Vorgabewert steht** — siehe Abschnitt 5.

**313. EINE TABELLE, DIE MIT EINEM GESPEICHERTEN WERT GEFRAGT WIRD, MUSS ÜBER
`hasOwnProperty` GEFRAGT WERDEN — SONST ANTWORTET DER PROTOTYP.**

*`SORTIERUNG_STATUS[f.sort]` gab bei `constructor` oder `toString` eine
**Funktion** zurück. Sie ist wahr, die Ableitung galt also als greifend — und
weil eine Funktion weder `'tested'` noch `'untested'` ist, filterte
`visibleItems()` gar nicht mehr.* **Der Statusfilter wäre still ganz
weggefallen, samt der gespeicherten Wahl.** *Der Maßstab ist nicht, ob ein
Mensch so etwas eintippt, sondern woher der Schlüssel kommt: aus einer
gespeicherten Stellung, und die kann jeden Text tragen.* **Die Regel stand schon
im Haus** — siehe Abschnitt 5a.

---

## 7. Prüfstand und Gegenproben

### Prüfungen: 5512 → 5571 (+59), gezählt

| Gruppe | vorher | nachher | wofür |
|---|---|---|---|
| **Die Sortierung gibt den Status vor — 0.21.1** *(neu)* | — | **57** | Die ganze Runde, an einem Bestand mit **beidem** (zwei getestete, zwei ungetestete, jede Hälfte mit zwei verschiedenen Zahlen — sonst belegt die Zeile nichts, Stolperstein 81). Die Vorgabe greift in **allen vier** Sortierungen; `updated_desc`, `title_asc` und `testavg_desc` lassen die Menge stehen; die Handwahl schlägt sie und **hält über zwei Wechsel der Sortierung hinweg**; auch eine **engere** Handwahl hält, und der Klick stellt die Sortierung **nicht** um; der gesendete Rumpf trägt den **gewählten** Wert; ein zweites Fenster mit genau der gespeicherten Stellung zeigt dieselbe Menge; eine gespeicherte Ansicht mit „Potenzial" **und** „alles" schlägt die Vorgabe und **gilt danach als die aktive Ansicht**; der Rücksetzer stellt die Automatik wieder her und ist danach selbst weg; das Wort steht dran, trägt `eyebrow-mit`, steht in der Zeile der Pillen und **verschwindet nach einem Klick**; die abgeleitete Pille trägt ihre eigene Klasse, ist **nicht** `on`, ist nicht gedämpft, bleibt anklickbar, und das Stilblatt zeichnet sie **gestrichelt statt gefüllt**; der Wechsel der Sortierung **zieht die Leiste mit**; und `filterZahl()` in beide Richtungen |
| **Favoriten: Sortierung und Filter** | 22 | **23** | **Umgedreht statt gelöscht** — siehe unten |
| **Zwei Kästen in der Oberfläche — 0.21.0** | 36 | **37** | dito |
| **zusammen** | **5512** | **5571** | **+59** |

### Was umgedreht statt gelöscht wurde (Stolperstein 74)

**Zwei Gruppen sehen durch diese Runde eine andere Menge. Keine Zusage ist
gefallen; beide sind umgedreht, und beide sind dabei um eine Zeile gewachsen.**

**1. „Favoriten: Sortierung und Filter".** Die Gruppe belegt seit 0.13.x, dass
ein **Favorit ohne Wertung** bei `rating_desc` ans Ende gehört und nicht nach
oben — *der Fall aus dem Betrieb, an dem eine Vorsortierung der Favoriten
aufgefallen wäre.* Der Eintrag ist **ungetestet** und fällt seit dieser Runde bei
`rating_desc` aus der Liste; **die Zusage hätte ihren Gegenstand verloren.**
*Die Lage stellt ihn jetzt ausdrücklich her: ein Klick auf „Alles anzeigen" ist
eine Handwahl und schlägt die Vorgabe, danach steht wieder der ganze Bestand da
und die Frage nach der **Reihenfolge** ist wieder zu stellen.* **Und die Vorgabe
wird dabei mitbelegt** — vor dem Klick zeigt dieselbe Lage nur die getesteten
(die neue Zeile). *Ohne sie bliebe unbelegt, dass der Klick überhaupt etwas zu
schlagen hatte* (Stolperstein 224).

**2. Die Potenzialsortierung aus 0.21.0.** Die Zusage lautete *„Nach Potenzial
absteigend stehen Einträge ohne Zahl hinten"* und fragte nach **Platz drei von
drei**. Seit dieser Runde fällt der getestete Eintrag aus der Liste, es bleiben
zwei. **Sie fragt jetzt nach dem LETZTEN Platz** — *das war immer die eigentliche
Aussage; die feste Drei war nur ihre damalige Schreibweise.* **Dazu eine neue
Zeile, die die gekürzte Liste erklärt:** *„Nach Potenzial sortiert stehen nur
noch die Ungetesteten da"*. *Ohne sie sähe ein Fehler in der Ableitung aus wie
eine Sortierung.*

### Rückbauten: 599 → 617 (+18), Nummern 606 bis 623

**Keiner ist weggefallen. EINER IST MITGEGANGEN statt gelöscht zu werden** (Stolperstein 201): **612** zeigte auf den Rumpf von `statusAusSortierung()`, und der ist beim Härten des Tabellenzugriffs eine Zeile kürzer geworden (Abschnitt 5a). **Sonst musste keiner mitgehen.** *Die Runde fasst
`drawFilters()` an mehreren Stellen an, aber keine davon war der Suchtext eines
vorhandenen Rückbaus.* **Nachgesehen wurde ausdrücklich an 384 bis 388**, die auf
den Rücksetzer zeigen, **und an 254**, der auf die zweite Beschriftung der
Statuszeile zeigt (Stolperstein 201). *387 greift weiter, weil sein Suchtext bei
`redraw()` beginnt und die neue Zeile darüber steht.*

**Zwei tragen denselben Suchtext** — **613** und **614**, beide an
`sel.onchange` — **und sind trotzdem zwei:** der eine schreibt die Ableitung in
die gespeicherte Stellung, der andere lässt die Leiste beim Wechsel stehen.
*Verschiedene Zusagen, verschiedene rote Punkte.*

> **613 IST DER, DEN DER AUFTRAG AUSDRÜCKLICH VERLANGT:** er schreibt die
> Ableitung **in** `state.filters`, und sie fährt damit an `PUT /api/settings`
> hinaus. *Ohne ihn wäre Regel 3 nicht baulich, sondern behauptet.*

**Und 622 ist der Rückbau zum Befund aus Abschnitt 5:** er stellt die Ruhestellung
wieder fest auf `all` — *die Zahl ist dann in genau einer Lage falsch, und zwar
in der teuersten.*

### Die Gegenprobentabelle

**18 Rückbauten gefahren, 4 Nebenspuren, Versatz 3500 je Spur — 0 STUMM.**
*Gefahren am gebauten Stand (`11ecd2a`), jede in einer eigenen Kopie aus
`git archive HEAD`; der Arbeitsbaum wurde nicht angefasst. **Jeder der 18 Läufe
meldet denselben Nenner, 5571** — die Zahl ist damit achtzehnmal unabhängig
bestätigt.*

> **DIE ZEILE „Jeder Suchtext kommt in seiner Datei genau einmal vor" WIRD IN
> FAST JEDEM LAUF ROT** — der Rückbau hat den Suchtext ja gerade ersetzt. *Sie
> sagt nichts über den einzelnen Rückbau und gehört trotzdem in die Tabelle,
> damit niemand sie für einen Fund hält.* **Eine Ausnahme ist aufschlussreich:
> bei 620 bleibt sie grün**, weil sein Ersatz den Suchtext **wörtlich enthält**
> und nur eine Zeile anhängt — die Zusage greift also wirklich und ist nicht
> bloß Rauschen.

| # | Rückbau | Namentlich rot |
|---|---|---|
| **606** | Keine Sortierung gibt mehr einen Status vor | **25 Prüfungen in 4 Gruppen** — die ganze Runde fällt, dazu die beiden umgedrehten Zusagen |
| **607** | Nur die Bewertung gibt vor, das Potenzial nicht mehr | **22 Prüfungen in 3 Gruppen** — die Potenzialseite allein |
| **608** | Die Titelsortierung koppelt mit | **13 Prüfungen in 6 Gruppen** — siehe den Kasten unten |
| **609** | Die Verlaufssortierungen koppeln mit | *„Die Verlaufssortierungen koppeln ausdrücklich NICHT"* — **genau eine** |
| **610** | Die Liste liest die Ableitung nicht mehr | **11 Prüfungen in 4 Gruppen** — die eine Lesestelle |
| **611** | Ein Klick auf eine Statuspille gilt nicht mehr als Handwahl | **11 Prüfungen in 3 Gruppen** — Regel 2 |
| **612** | Die Ableitung schlägt die Handwahl statt umgekehrt | **12 Prüfungen in 3 Gruppen** — die Rangordnung, samt gespeicherter Ansicht |
| **613** | **Die Ableitung wird mitgespeichert** | *„Und der gesendete Rumpf trägt die gewählte Stellung, nicht die abgeleitete"* — **genau eine, und sie ist Regel 3** |
| **614** | Der Wechsel der Sortierung zeichnet nur noch die Liste | **3 Prüfungen** — die Leiste zieht nicht mit |
| **615** | Eine gespeicherte Ansicht schlägt die Ableitung nicht mehr | *„Und ihr ‚alles anzeigen' schlägt die Vorgabe der Sortierung"* — **genau eine** |
| **616** | Der Rücksetzer stellt die Automatik nicht wieder her | **3 Prüfungen** — der Weg zurück |
| **617** | Neben den Statuspillen steht nicht mehr, woher sie kommen | **6 Prüfungen** — Regel 4, das Wort |
| **618** | Die abgeleitete Pille zeichnet sich wie eine gewählte | **4 Prüfungen** — Regel 4, die Pille |
| **619** | Das Stilblatt gibt der abgeleiteten Pille den Füllgrund der gewählten | *„Das Stilblatt zeichnet sie gestrichelt statt gefüllt"* — **genau eine** |
| **620** | Die Ableitung zählt als gesetzter Filter mit | **6 Prüfungen** — die Entscheidung aus Abschnitt 3, **in beide Richtungen** |
| **621** | Der eingeklappte Filterschalter sagt nichts von der Ableitung | **2 Prüfungen** — Regel 4 am zugeklappten Ort |
| **622** | Die Ruhestellung der Statuszeile ist wieder fest „alles" | **3 Prüfungen** — der Befund aus Abschnitt 5 |
| **623** | Die Vorgabetabelle wird ohne Rücksicht auf den Prototyp gefragt | **2 Prüfungen** — der Befund aus Abschnitt 5a |

> **DER LEHRREICHE EINTRAG IST 608 — „die Titelsortierung koppelt mit".** Er
> färbt **sechs** Gruppen rot, und **vier davon haben mit dieser Runde gar
> nichts zu tun**: „Favoriten: Sortierung und Filter", „Die gestrichene Pille
> ‚Neu seit …' — 0.17.0", „Die Filterleiste wird kürzer — 0.13.0" und „Der
> Rücksetzer für die Filterleiste — 0.17.3". *Der Grund ist einfach und war
> nicht geplant:* **`title_asc` ist die neutrale Sortierung, mit der ein
> Dutzend älterer Prüflagen arbeitet.** Wer sie koppelt, nimmt ihnen die Hälfte
> ihres Bestands. **Die Zusage „kein Titelfilter" wird damit nicht von einer
> Zeile getragen, sondern von der halben Filterprüfung** — und das ist ein
> besserer Beleg, als eine eigens dafür geschriebene Zeile es wäre.

> **UND ZWEI EINTRÄGE SIND SCHMAL UND GENAU SO GEMEINT: 609 und 613.** *Jeder
> macht **genau eine** Prüfung rot — aber es ist die richtige.* **613 ist die
> Regel, an der die Runde hängt** (die Ableitung fährt nicht hinaus), **609 die
> Entscheidung, die sonst nur im Kommentar stünde** (die Verlaufssortierungen
> bleiben draußen). *Ein Rückbau ist nicht daran zu messen, wie viel er umwirft,
> sondern ob er die Zusage trifft, für die er gebaut ist.*

---

## 8. Was ausdrücklich NICHT gebaut wurde

- **Keine Kopplung an den Verlaufs-Sortierungen** — Abschnitt 4.
- **Keine Kopplung an `title_asc`.** Ein Titel sagt nichts über den Teststatus.
- **Keine Kopplung in die andere Richtung.** *Ein Klick auf „Ungetestet" stellt
  die Sortierung nicht auf Potenzial um* (Stolperstein 312).
- **Kein zweiter Filter angefasst.** Ablehnung, Favorit, Kategorien, Tags:
  unberührt.
- **Keine Ableitung am Server.** `visibleItems()` filtert im Browser, und das
  bleibt so.
- **Keine Einstellung, mit der man die Kopplung abschaltet.** *Sie ist eine
  Vorgabe, die jede Handwahl schlägt — wer sie nicht will, klickt einmal eine
  Pille. Ein Schalter dafür wäre eine Einstellung für etwas, das schon nachgibt.*
- **Keine Änderung an `ansichtAusZustand()`.** *Eine gespeicherte Ansicht merkt
  sich weiterhin genau die gewählte Stellung; der Merker gehört nicht hinein, er
  ist kein Filter.*

---

## 9. Was offen geblieben ist

- **Die Verlaufs-Sortierungen** (Testtage, Note ⌀, letzte Note). *Abschnitt 4
  nennt den Grund; Rückbau 609 hält die Entscheidung fest.*
- **Der eingeklappte Filterschalter sagt die Ableitung, färbt sich aber nicht.**
  *Das ist die Entscheidung aus Abschnitt 3 und keine Lücke — aber wer den
  Schalter nur nach seiner Farbe liest, übersieht sie.*
- **Punkt 10 des Sammelblatts — der Bildstreifen im Eintrag.** *Eingetragen als
  0.22.0.*
- **Der Augenschein zu 0.21.0** — soweit der Rundlauf ihn nicht schon erbracht
  hat.
- **Die beiden Handgriffe aus 0.20.0** — eine eigene Datei in den
  Sicherungsordner legen, und die Zeile im Sicherheitsprotokoll je entfernter
  Kopie. *Sie stehen seit 0.20.1 in dieser Liste.*
- **Der volle Gegenprobenlauf** über alle **617** Rückbauten — weiter ausstehend.

---

## 0.21.1 — Fingerprint `2295870b`

**Gebildet ZULETZT**, nach der letzten Änderung an einer ausgelieferten Datei —
`package.json` mit ihrer neuen Nummer eingeschlossen, und `package-lock.json`
trägt sie an zwei Stellen ein zweites Mal. **`public/` gehört dazu**
(Stolperstein 158).

**Gelesen ist der Wert nicht aus der Ableitung, sondern aus einem laufenden
Server über `GET /api/stats`** — denselben Weg, den die Installation geht.
*Drei Starts hintereinander, dreimal `2295870b`.*

| | |
|---|---|
| **Version** | `0.21.1` |
| **Fingerprint** | **`2295870b`** |
| **Prüfungen** | **5571 von 5571** |
| **Rückbauten** | **617** in der Liste, **18 neue gefahren** |
| **Austauschformat** | **13** *(unverändert)* |
| **Migrationsblöcke** | **neun** *(unverändert)* |

> **DIESE RUNDE IST KEINE DATENBANKSTUFE.** *Kein Migrationsblock, keine Spalte,
> kein Bestandslauf.* **Der Rückweg auf 0.21.0 ist offen und folgenlos:** eine
> ältere Fassung kennt die Kopplung nicht und filtert wie bisher — sie liest
> dieselbe gespeicherte Stellung, denn geschrieben wird nur die **gewählte** und
> nie die abgeleitete. **Eine Sicherung schadet nie, ist hier aber nicht nötig.**
> **Nach dem Einspielen im Browser einmal hart neu laden** (`public/app.js` und
> `public/style.css` haben sich geändert).

> **MELDET DIE LAUFENDE INSTALLATION ETWAS ANDERES ALS `2295870b`, liegt auf dem
> Wirt nicht dieser Stand** — und zwar dateigenau: der Wert deckt jede Datei,
> die der Server ausführt, samt allem unter `public/`. *Bei 0.9.1 hat genau das
> eine Datei zu viel auf dem Wirt aufgedeckt (Stolperstein 158).*

**Im Feld noch nicht bestätigt.** *Die fünf Handgriffe zum Nachsehen stehen im
Projektstand, Abschnitt 8.*
