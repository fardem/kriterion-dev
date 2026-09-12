# Änderungsprotokoll 0.30.1 — „Was der Rundlauf mit 0.30.0 gefunden hat"

**Sieben Befunde aus dem Betrieb und einer aus dem Nachsehen · 12. September
2026 · gebaut auf 0.30.0 (`2363b00a`).**

> **FINGERPRINT DIESER RUNDE: `c879a92b`** — gerechnet am gebauten Stand,
> **vor dem Einspielen**. Er deckt `node_modules` nicht ab und hängt an jeder
> Datei der Liste — auch an einem Kommentar.
>
> **ACHTZEHN DATEIEN, WIE IN DEN DREI VORRUNDEN.**
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(dieselben achtzehn Dateien)* | **`c879a92b`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`c879a92b`** |
> | **Aus der laufenden Installation gemeldet** | *steht aus — trägt der Betreiber nach* |
>
> **ZWEI QUELLEN, EIN WERT.** *Die dritte kommt aus dem Feld und steht hier als
> offener Punkt und nicht als Fußnote.*

> **DIE ZAHL, AN DER DIESE RUNDE GEMESSEN IST:**
>
> | | Lauf | Gruppen | Prüfungen |
> |---|---|---|---|
> | **vorher** *(0.30.0, dieselbe Maschine)* | 271,5 s | 339 | 6741 von 6741 grün |
> | **nachher** *(0.30.1)* | **275,2 s** | **343** | **6779 von 6779 grün** |
>
> **38 PRÜFUNGEN UND VIER GRUPPEN MEHR FÜR 3,7 SEKUNDEN.** *Die Runde hat kein
> Geschwindigkeitsziel — sie ist Oberfläche —, und die Zahl steht hier, damit
> sie nicht unbemerkt steigt.*

---

## Was in dieser Runde passiert ist

**ACHT BEFUNDE, SIEBEN BAUABSCHNITTE, UND FAST ALLES IST PLATZ.** *Fünf der acht
sagen dasselbe auf fünf Arten: am Telefon steht etwas breiter da, als der
Bildschirm hergibt, und was dann bricht, bricht an der falschen Stelle — mitten
im Wort, unter dem Namen, neben einem leeren Feld.* **Zwei betreffen das
Fälligkeitsdatum, und einer ist ein einziges Wort.**

**DREI DER ACHT STEHEN AN GENAU DEN STELLEN, DIE 0.30.0 ZULETZT ANGEFASST HAT:**
die Tagzeile aus BA 7, der Bewertungskasten aus BA 8 und das Fälligkeitsdatum
aus BA 10. *Das ist kein Rückschlag, sondern der Rundlauf, wie er gedacht ist —
gebaut, eingespielt, am Gerät angesehen, nachgebessert.*

**KEIN SCHEMAANTEIL**, keine neue Spalte, kein Migrationsblock, das
Austauschformat bleibt **16**, `F_ROUTES` bleibt **73**.

---

## Die Fragetafel

**VIERUNDZWANZIG FRAGEN, VIERUNDZWANZIG ANTWORTEN, alle vor der ersten Zeile
eingetragen** *(Regel 11, zum fünften Mal in Folge)*.

**DREI DAVON WAREN RÜCKFRAGEN AN EINEN SATZ, und sie sind nicht geraten worden:**

| | die Stelle | was daraus wurde |
|---|---|---|
| **F1** | *„dann wäre es 2der 2"* | **„erste zeile unter dem tag, aber insgesamt betrachtet wäre es dann die 2 zeile"** — dieselbe Bauform, die F2 vorschlug |
| **F8** | *„Haben Tage datum und sie passen nicht in eine reihe"* | **der Betreiber hat den ganzen Absatz neu geschrieben:** es sind **Marken** gemeint. Die Lesart war richtig |
| **F18** | *„Datum soll durch Anklicken editierbar sein"* | **erledigt, nicht beantwortet.** *„ehrlich ich habe es nicht probiert sondern angenommen das es nicht so sei"* — **der Handgriff steht seit 0.29.0 da** |

> **F18 IST DER TEURSTE DER DREI GEWESEN, UND ZWAR ZUM NULLTARIF.** *Wäre die
> Bestellung ungeprüft in den Auftrag gewandert, hätte diese Runde einen
> Handgriff gebaut, den es seit zwei Runden gibt.*

**UND EINE VIERTE FRAGE HAT DER BETREIBER NICHT ENTSCHIEDEN, SONDERN EINE REGEL
DAFÜR GEGEBEN** *(F9)*: *„Beides machbar. welches eher in frage kommt, kommt
darauf an welche form wir im eintragsview welche benutzt haben."* **Damit hat
der Quelltext geantwortet — und den Vorschlag dieses Auftrags widerlegt:** die
Tagwolke des Eintrags steht auf drei Reihen begrenzt und trägt darunter
„mehr"/„weniger" *(`limitCloud()`)*. **Es wird „mehr" und nicht rollbar.**

**EINE ANTWORT GEHT GEGEN DEN EIGENEN ERSTEN WORTLAUT DES BETREIBERS** *(F14)*:
er hatte *„3x, 10x oder 0x"* geschrieben und entscheidet sich für die **Zahl
ohne Zeichen**. *In derselben Kriterienzeile steht das × schon zweimal — vor dem
Gewichtsfeld und als Löschknopf.*

**UND EINE FRAGE IST WÄHREND DER FRAGERUNDE ENTSTANDEN** *(F24)*: der Betreiber
hat F12 eingeschränkt — *„gekürzt werden kann, auch wenn platz da ist wenn der
sinn nicht verloren geht"* —, **und damit fällt die Breitenregel am Zähler ganz
weg. Eine Regel statt zweier.**

---

## Was die Messung am Auftrag berichtigt hat

**BA 1 ist zuerst gefahren, in echtem Chromium bei 390 × 844,
`deviceScaleFactor: 3`, `isMobile: true`** — an zwei Installationen mit
denselben Daten, einer mit zwei Zugängen und einer mit einem.

| | der Auftrag sagte | gemessen |
|---|---|---|
| **die Marken der Tagzeile** *(F3)* | *sie stehen zu tief und müssen in die erste Zeile* | **sie standen längst dort.** *Wolke und erste Pille beginnen beide am oberen Rand. Abgesackt sind **Beschriftung und Umschalter** — beide Rasterzeilen standen auf `auto`, die Wolke spannt über beide und bestimmt die Höhe, also teilten sie sich deren 433 px zu je 212* |
| **die Festschrift der Marken** *(F4)* | *sie könnte am meisten bringen und am wenigsten kosten* | **sie bringt gar nichts.** *Neun Pixel an der breitesten Marke, keine Reihe weniger, kein Pixel Höhe. Der Gewinn steckt im Polster* |
| **die zweizeilige Sternzeile** *(F11)* | *sie darf fallen, wenn die Messung es hergibt* | **sie gibt es nicht her.** *Einzeilig spart im Vierspalter 35 px und kostet dafür eine Namensspalte von 136 statt 366 px, in der alle drei Namen drei bis vier Zeilen hoch brechen* |
| **zwei Stufen kleinere Marken** *(F4)* | *— offen* | **sie kaufen nichts ein, wo es zählt.** *In der zugeklappten Reihe — dem Normalzustand — stehen auch dort vier Marken und keine fünf* |

> **PROJEKTSTAND 5.3 BEHÄLT RECHT — ZUM ZWEITEN MAL IN FOLGE, und diesmal gegen
> einen Vorschlag, der eigens dafür gemessen wurde.** *0.30.0 hat die zweizeilige
> Sternzeile gegen den ersten Vorschlag seines Auftrags verteidigt; 0.30.1 hat
> sie gegen einen zweiten verteidigt, der von einer anderen Seite kam.*

**UND DER VORSCHLAG DES BETREIBERS HAT AUF DEN PIXEL GETROFFEN.** *„Ich finde
die sterne können kleiner werden damit etwas mehr platz entsteht."* — Das
längste Wort eines Kriteriennamens misst **200 px**, die Namensspalte im
Einzelzugang **186**; deshalb brach „2_Verarbeitungsqualitaet_de" mitten durch.
**Eine Stufe kleinere Sterne geben 210 px — und der Kasten wird dabei kein Pixel
höher: 256 vorher, 256 nachher.**

---

## Die acht Befunde und was aus ihnen wurde

### BA 2 — die Tagzeile *(Befund 2)*

**EINE ZEILE RASTER IST DIE GANZE REPARATUR:** `grid-template-rows: auto 1fr`.
Die erste Zeile bekommt damit die Höhe ihres Inhalts, die zweite den Rest.

| | vorher | nachher |
|---|---|---|
| „TAGS" steht | **96 px tief** | **+0** |
| „und/Oder" steht | **218 px tief** | **+25** *(die 18 px der Beschriftung plus 7 px Zeilenabstand)* |

**DREI ANDERE FASSUNGEN SIND GEFAHREN UND HABEN NICHTS BEWEGT** — `align-self`
allein, `min-content auto`, und beides zusammen. *Ein spannendes Kind verteilt
seine Höhe auf alle `auto`-Zeilen, und `min-content` hält es nicht davon ab.*

**DAZU DIE MARKEN EINE STUFE KLEINER** *(V1: 10,8 px, Polster 4/10)*:

| | Marken in der EINEN Reihe | Pillenhöhe | Filterkasten offen |
|---|---|---|---|
| vorher | **3** | 34 px | 654 |
| nachher | **4** | 27 px | **543** |

### BA 3 — die Testtagzeile *(Befunde 3 und 4)*

**DER WOCHENTAG FÄLLT, GANZ UND ÜBER DIE BREITE.** *Er misst 51 der 344 Pixel,
und er ist die Bequemlichkeit und nicht die Auskunft — das Datum steht daneben.*
**Im Quelltext kommt kein Gerätename vor.**

**UND DIE ZEILE ORDNET SICH NACH DEM, WAS IN IHR STEHT:**

| Fall | was geschieht |
|---|---|
| **keine Marken** | eine Zeile, die Sterne rechts vom Datum und rechtsbündig |
| **Marken, und es passt nicht** | die erste Zeile trägt Datum und Marken, die Sterne rutschen darunter |
| **zu viele Marken** | rechts **von den Marken** steht „mehr" |

**DER MARKENKASTEN NAHM SICH VORHER ALLES.** *`flex: 1` heißt „Grundbreite null
und dann wachsen": er griff sich die ganze übrige Breite, **auch wenn gar keine
Marke darin stand**, und drückte die Sterne aus der Zeile.*

**GEMESSEN AN DREI TESTTAGEN** *(ohne Marken, mit zweien, mit sieben)*:

| | vorher | nachher |
|---|---|---|
| ohne Marken | **83 px** | **54** |
| mit zwei Marken | **146 px** | **99** |
| mit sieben Marken | **309 px** | **100** |

*538 Pixel für drei Testtage vorher, 253 nachher.*

> **DER UMBRUCH KOMMT AUS EINEM STÜCK OHNE INHALT** — `::after` mit
> `flex-basis: 100%`. **Der Träger ist eine Klasse und kein `:has()`:** dieselbe
> Überlegung wie bei `frow-tags` in 0.30.0 — *eine Regel, die sich ihren Träger
> über den Inhalt der Zeile zusammensucht, liest sich beim nächsten Stück in der
> Zeile falsch.*

### BA 4 — die Sterne *(Befund 5)*

**EINE STUFE KLEINER, UND ZWAR NUR AM TELEFON.** *Die Werte daneben stehen in
der Abfrage auf den groben Zeiger und gelten damit auch für ein Tablet; dort ist
die Breite da, und ein Finger ist ein Finger.*

| | Sternspalte | Namensspalte *(ein Zugang)* | Kasten |
|---|---|---|---|
| vorher | 136 px | **186** — *das längste Wort misst 200, es bricht mitten durch* | 256 |
| nachher | 112 px | **210** — *kein Mittendurchbruch mehr* | **256** |

### BA 5 — die Zähler *(Befund 6)*

**IN DER ZEILE STEHT DIE ZAHL, IM TITEL DAS WORT.** *Von sieben Kriterien standen
auf dem Bild des Betreibers fünf mit Auslassung da — „1_O…", „2_V…", „Test2…" —,
und der Name ist das Einzige, woran man die Zeile erkennt.*

**FÜNF LISTEN, DREI RUFSTELLEN, EIN HELFER:** Kategorien, Tags und Kriterien
teilen sich `manageList()`, dazu kommen die Zugänge und das Grabsteinfenster.

> **DAS WORT IST NICHT ERFUNDEN, SONDERN UMGEZOGEN:** *im Titel steht genau der
> Text, der bis 0.30.0 in der Zeile stand.* **Keine neue Zeile in einer
> Sprachdatei, kein neues Wort, das übersetzt werden müsste** — und damit auch
> keine zweite Schuld an 0.31.0.

**DIE TAGKARTE TRÄGT ZWEI ZAHLEN:** „10 · 3" statt „10 Einträge · 3 Testtage".
*Zwei Zahlen ohne Wort sind lesbar, solange ihre Reihenfolge feststeht — und sie
steht fest.*

**UND KEIN ZEICHEN NEBEN DER ZAHL** *(F14, gegen den ersten Wortlaut des
Betreibers)*: in derselben Kriterienzeile stünden dann drei gleiche Zeichen mit
drei Bedeutungen — „mal", „mal" und „weg".

### BA 6 — das Fälligkeitsdatum *(Befunde 7 und 8)*

**DIE FARBE SAGT DEN ZUSTAND UND NICHT MEHR NUR DIE FRIST.**

| Aufgabe | Datum | Farbe | Auszeichnung |
|---|---|---|---|
| **offen** | in der Zukunft | **blau** | — |
| **offen** | heute | **blau** | **fett** |
| **offen** | überschritten | **rot** | — |
| **erledigt** | überschritten | **rot** | **durchgestrichen** |
| **erledigt** | gehalten | **grün** | **durchgestrichen** |

> **FÜNF ZUSTÄNDE, DREI FARBEN.** *Die Paare unterscheiden sich nicht in der
> Farbe, sondern in der Auszeichnung — „heute" durch das Gewicht, „zu spät
> erledigt" durch den Strich.* **Wer fünf Farben verlangte, bekäme eine
> Oberfläche, die drei Sachen mit fünf Tönen sagt.**
>
> **UND ES IST KEIN NEUER FARBTON.** *Blau für die offene und Grün für die
> erledigte Aufgabe trägt das Haus schon zweimal: an der Kante des Kommentars
> (`.cmt.task` / `.cmt.done`) und an der Marke „ToDo" (`.mark.task.on` /
> `.mark.task.on.done`).* **Das Datum war die dritte Stelle derselben Sache und
> die einzige, die nicht mitmachte** — und der Satz, der es begründet, stand im
> Stilblatt schon da: *„Ein Bedienelement zeigt den Zustand, den es verändert."*

**DIE EIGENTLICHE ÄNDERUNG IST DIE VIERTE ZEILE.** *Bis 0.30.0 schlug „erledigt"
jede Frist: sobald jemand abhakte, wurde das Datum gedämpft und durchgestrichen,
ganz gleich ob die Frist gehalten wurde.* **„Zu spät fertig" bleibt jetzt
sichtbar zu spät.**

**DAZU ZWEI KLEMMEN, DIE FALSCH SASSEN:**

1. **Eine erledigte Aufgabe ohne Datum bekommt wieder einen Knopf** *(F19)*. *Der
   Betreiber nennt den Fall selbst: „Ist ja möglich das man sich verschätzt hat
   und neuen Datum abgesprochen hat." Das kann nach dem Abhaken eintreten.*
2. **Das Datum sieht jeder, der den Eintrag sieht** *(F20, Befund 8)*. *Der ganze
   Markenkasten stand hinter „darf ändern" — und damit sah die Frist nur, wer sie
   auch ändern durfte, während die Ansicht „Offen" dasselbe Datum jedem zeigt.*
   **Zwei Orte, eine Angabe, zwei Antworten auf die Frage, wer sie sehen darf.**
   *Wer nicht ändern darf, bekommt jetzt einen Text und keinen Knopf: ein Knopf,
   der nichts tut, ist eine Lüge über die eigene Bedienbarkeit.*

> **BEFUND 8 IST NICHT AUS DEM FELD GEKOMMEN, SONDERN AUS DEM NACHSEHEN** — beim
> Prüfen der Bitte aus F18. *Die Rückfrage hat damit zweimal etwas eingebracht:
> einmal den Bauabschnitt, der entfiel, und einmal den Fehler, der ohne sie
> nicht aufgefallen wäre.*

### BA 7 — das Wort *(Befund 1)*

**`card.checkUntil` heißt auf Deutsch „Stand von" statt „Inhalt bis".**
*Englisch und Türkisch fahren in 0.31.0* *(F21)* — **der türkische Satz will
nachgestellt werden, und das ist dort Satzbau und wäre hier ein Umbau am
Aufrufort gewesen.** *Die Schuld steht im Fahrplan unter 0.31.0.*

---

## Der Prüfstand

**6779 von 6779 grün, 343 Gruppen, 275,2 Sekunden.**

**VIER NEUE GRUPPEN** — die Tagzeile, die Testtagzeile, der Zähler und das
Datum, das jeder sieht. **DAZU UMGESTELLTE ZUSAGEN IN DREI ALTEN GRUPPEN**
*(Stolperstein 201: umgestellt und nicht gelöscht)*: der Stern hat drei Maße
statt zweier, das Fälligkeitsdatum fünf Zustände statt vierer, der Zähler zeigt
die Zahl und trägt das Wort im Titel.

**GEFAHREN WIRD, WAS SICH FAHREN LÄSST:**

| | |
|---|---|
| **die Klasse an der Testtagzeile** | drei Testtage, drei Lagen — *eine Zusage, die nur das Stilblatt liest, bliebe grün, wenn die Klasse nie gesetzt wird* |
| **die Reihenfolge von „mehr"** | im Aufbau und nicht an der Klasse |
| **die Begrenzung selbst** | `limitCloud()` mit **gesetzten Maßen** — *jsdom rechnet keine Höhen, also bekommt der Kasten sie ausdrücklich, und die Funktion muss daran dasselbe tun wie am Bildschirm* |
| **die fünf Farbzustände** | an fünf Aufgaben, und die fünfte ist der Kern: eine erledigte, deren Frist noch nicht abgelaufen war |
| **das Datum ohne Recht** | an einem Zugang, der weder Verfasser noch Admin ist |

---

## Nichts zu tun beim Einspielen

**Kein Schemaanteil, kein Migrationsblock, das Austauschformat bleibt 16,
`F_ROUTES` bleibt 73.**

---

## Die Papiere

| | |
|---|---|
| **`Doku/Auftrag_0.30.1.md`** | neu — acht Befunde, vierundzwanzig Fragen, sieben Bauabschnitte |
| **`Doku/Aenderungsprotokoll_0.30.1.md`** | dieses Papier |
| **`Doku/Projektstand_Kriterion_0_30_1.md`** | `git mv`, **Revision 84** |
| **`Doku/Fahrplan.md`** | eine Zeile in der Tafel; **die geplanten Runden rücken nicht** — und eine Schuld unter 0.31.0 |
| **`CHANGELOG.md`** | ein Eintrag 0.30.1 |
| **`package.json`, `package-lock.json`** | 0.30.1 |
| **`Doku/Fehler_und_Ideen.md`** | **unberührt** *(Regel 3)* |
