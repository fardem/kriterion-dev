# Änderungsprotokoll 0.30.1 — „Was der Rundlauf mit 0.30.0 gefunden hat"

**Sieben Befunde aus dem Betrieb und einer aus dem Nachsehen · 12. September
2026 · gebaut auf 0.30.0 (`2363b00a`).**

> **FINGERPRINT DIESER RUNDE: `194e8984`** — gerechnet am gebauten Stand,
> **vor dem Einspielen**. Er deckt `node_modules` nicht ab und hängt an jeder
> Datei der Liste — auch an einem Kommentar.
>
> **ACHTZEHN DATEIEN, WIE IN DEN DREI VORRUNDEN.**
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(dieselben achtzehn Dateien)* | **`194e8984`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`194e8984`** |
> | **Aus der laufenden Installation gemeldet** *(Betreiber, 12. September 2026)* | **`a6726a83`** |
>
> **ZWEI QUELLEN FÜR DEN AUSGELIEFERTEN WERT — UND DIE DRITTE NENNT EINEN
> ANDEREN.** *Das ist kein Widerspruch, sondern eine Reihenfolge: der Betreiber
> hat eingespielt, als `a6726a83` der Stand war, und danach ist der **Wortlaut
> der Kommentare** berichtigt worden.*
>
> **DIE BEIDEN STÄNDE UNTERSCHEIDEN SICH IN KEINER EINZIGEN AUSGEFÜHRTEN
> ZEILE** — nur in Kommentaren und in den Papieren. *Wer `a6726a83` laufen hat,
> hat dieselbe Anwendung; wer den Sollwert dieser Runde nachrechnen will, muss
> `194e8984` einspielen.* **Der offene Punkt bleibt damit offen, und er steht
> hier und nicht als Fußnote.**
>
> **UND ER BLEIBT ES AUF ABSEHBARE ZEIT.** *Der Betreiber am 12. September
> 2026: „ich werde die den nur wieder einspielen wenn wir den patch mit dem
> tagfilter haben."* **Der nächste Stand, der an den Wirt geht, ist der von
> 0.30.2** — *er wird dann seinen eigenen Fingerprint bestätigen und nicht
> diesen.* **Damit ist `194e8984` ein Wert, den zwei Quellen tragen und das Feld
> nicht mehr einholen wird; das gehört aufgeschrieben und nicht verschwiegen.**
>
> **UND ER IST WÄHREND DER RUNDE ZWEIMAL FALSCH DAGESTANDEN — aus demselben
> Grund.** *Beim ersten Mal war er nach BA 7 gerechnet, und danach kam noch eine
> Zeile in `public/style.css` (die Kurzform `gap`, die hinter ihrer Ausnahme
> stand). Beim zweiten Mal war er gerechnet, und danach ist der **Wortlaut der
> Kommentare** berichtigt worden.*
>
> | | Wert | was danach noch kam |
> |---|---|---|
> | zuerst | `c879a92b` | die Kurzform `gap` |
> | dann | `a6726a83` | der Wortlaut der Kommentare |
> | **ausgeliefert** | **`194e8984`** | — |
>
> **EIN FINGERPRINT HÄNGT AN JEDER DATEI DER LISTE — AUCH AN EINEM KOMMENTAR.**
> *Wer ihn vor der letzten Änderung rechnet, schreibt einen Wert auf, den
> niemand mehr nachrechnen kann.* **Er gehört ans Ende einer Runde, hinter die
> letzte Zeile.**

> **DIE ZAHL, AN DER DIESE RUNDE GEMESSEN IST:**
>
> | | Lauf | Gruppen | Prüfungen |
> |---|---|---|---|
> | **vorher** *(0.30.0, dieselbe Maschine)* | 271,5 s | 339 | 6741 von 6741 grün |
> | **nachher** *(0.30.1)* | **265,1 s** | **343** | **6780 von 6780 grün** |
>
> **39 PRÜFUNGEN UND VIER GRUPPEN MEHR.** *Die Runde hat kein
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
| **F8** | *„Haben Tage datum und sie passen nicht in eine reihe"* | **der Betreiber hat den ganzen Absatz neu geschrieben:** es sind **Tags** gemeint. Die Lesart war richtig |
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
| **die Tags der Tagzeile** *(F3)* | *sie stehen zu tief und müssen in die erste Zeile* | **sie standen längst dort.** *Wolke und erste Pille beginnen beide am oberen Rand. Abgesackt sind **Beschriftung und Umschalter** — beide Rasterzeilen standen auf `auto`, die Wolke spannt über beide und bestimmt die Höhe, also teilten sie sich deren 433 px zu je 212* |
| **die Festschrift der Tags** *(F4)* | *sie könnte am meisten bringen und am wenigsten kosten* | **sie bringt gar nichts.** *Neun Pixel an der breitesten Tag, keine Reihe weniger, kein Pixel Höhe. Der Gewinn steckt im Polster* |
| **die zweizeilige Sternzeile** *(F11)* | *sie darf fallen, wenn die Messung es hergibt* | **sie gibt es nicht her.** *Einzeilig spart im Vierspalter 35 px und kostet dafür eine Namensspalte von 136 statt 366 px, in der alle drei Namen drei bis vier Zeilen hoch brechen* |
| **zwei Stufen kleinere Tags** *(F4)* | *— offen* | **sie kaufen nichts ein, wo es zählt.** *In der zugeklappten Reihe — dem Normalzustand — stehen auch dort vier Tags und keine fünf* |

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
| „TAGS" steht | **97 px tief** | **+0** |
| „und/Oder" steht | **219 px tief** | **+25** *(die 18 px der Beschriftung plus 7 px Zeilenabstand)* |
| die Zeile misst *(Wolke offen)* | **433 px** | **321** |

*Die Vormessung aus BA 1 nannte 96 und 218 — ein Pixel Rundung an derselben
Stelle. Die Zahlen hier stammen aus dem Vergleichslauf am **gebauten** Stand,
alter und neuer Baum nebeneinander, jede Ansicht in einem frisch geladenen
Fenster.*

**DREI ANDERE FASSUNGEN SIND GEFAHREN UND HABEN NICHTS BEWEGT** — `align-self`
allein, `min-content auto`, und beides zusammen. *Ein spannendes Kind verteilt
seine Höhe auf alle `auto`-Zeilen, und `min-content` hält es nicht davon ab.*

**DAZU DIE MARKEN EINE STUFE KLEINER** *(V1: 10,8 px, Polster 4/10)*:

| | Tags in der EINEN Reihe | Pillenhöhe | Filterkasten offen |
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
| **keine Tags** | eine Zeile, die Sterne rechts vom Datum und rechtsbündig |
| **Tags, und es passt nicht** | die erste Zeile trägt Datum und Tags, die Sterne rutschen darunter |
| **zu viele Tags** | rechts **von den Tags** steht „mehr" |

**DER MARKENKASTEN NAHM SICH VORHER ALLES.** *`flex: 1` heißt „Grundbreite null
und dann wachsen": er griff sich die ganze übrige Breite, **auch wenn gar keine
Tag darin stand**, und drückte die Sterne aus der Zeile.*

**GEMESSEN AN DREI TESTTAGEN** *(ohne Tags, mit zweien, mit sieben)*, **in
beiden Fassungen**:

| | vorher *(ein Zugang)* | vorher *(mehrere)* | nachher *(beide)* |
|---|---|---|---|
| ohne Tags | **83 px** | 81 | **54** |
| mit zwei Tags | **146 px** | 119 | **91** |
| mit sieben Tags | **309 px** | 282 | **92** |
| **zusammen** | **538** | 482 | **237** |

> **DIE DRITTE ZEILE IST DIE EIGENTLICHE:** *sieben Tags haben die Zeile
> vorher auf **309 Pixel** aufgerissen; jetzt misst sie **92** und sagt über
> „mehr", dass da noch etwas ist.* **Und die beiden Fassungen messen nachher
> dasselbe** — vorher taten sie es nicht.

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
   Tagkasten stand hinter „darf ändern" — und damit sah die Frist nur, wer sie
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

**6780 von 6780 grün, 343 Gruppen, 265,1 Sekunden.**

> **ZWEI LÄUFE AM SELBEN STAND HABEN 265,1 UND 287,0 SEKUNDEN GEBRAUCHT.**
> *Die Zahl oben ist die des Schlusslaufs.* **Zweiundzwanzig Sekunden Streuung
> auf derselben Maschine sind der Grund, warum diese Runde kein
> Geschwindigkeitsziel trägt** — gemessen wird hier die Oberfläche, nicht der
> Lauf.

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

### Die Gegenproben — 24 gefahren, 0 STUMM, und trotzdem ein Fund

**NEUNZEHN NEUE RÜCKBAUTEN** *(916 bis 934)* **UND ZWEI NACHGEZOGENE** *(909,
910 — ihre Suchtexte standen nach dieser Runde nicht mehr da)*. **Keiner ist
stumm geblieben.**

> **UND EINER HAT TROTZDEM EINE LÜCKE AUFGEDECKT — 926.** *Er nimmt die
> Begrenzung der Tags eines Testtags auf **eine Reihe** ganz weg, und keine
> einzige Prüfung wurde daraufhin rot.* **Belegt war die Begrenzung SELBST; ihr
> RUF war es nicht.**
>
> **WARUM SIE NICHT AM ERGEBNIS ZU SEHEN IST:** *jsdom rechnet keine Höhen, also
> steigt `limitCloud()` gleich am Anfang aus und setzt nichts — am fertigen
> Dokument ist zwischen „begrenzt" und „nicht begrenzt" kein Unterschied zu
> messen.* **Die nachgetragene Zusage fährt deshalb einen Mitschreiber:** die
> Funktion wird getauscht, die Ansicht neu gezeichnet, und der Ruf mit der
> Reihenzahl **1** muss dabei vorkommen. *Sie ist eine Funktionsdeklaration auf
> oberster Ebene und liegt damit am Fenster — der Tausch greift auch für die
> Rufe innerhalb der Datei.*
>
> **DAS IST DER ZWECK DER GEGENPROBE, und sie hat ihn zum zweiten Mal in zwei
> Runden erfüllt.** *0.30.0 hat über sie neun ungeklammerte Griffe gefunden;
> 0.30.1 eine Zusage, die ihren eigenen Gegenstand nicht abdeckte.*
>
> **UND SIE IST NACHGEFAHREN: 926 macht jetzt seine eigene Gruppe rot**
> *(„Und der Aufbau begrenzt die Tags eines Testtags auf EINE Reihe")*.
> **Damit sind es 24 gefahrene Rückbauten in drei Läufen, 0 stumm** — *21 im
> ersten, drei im Nachlauf.*

**ZWEI ERWARTUNGEN WAREN FALSCH EINGETRAGEN** *(933, 934)*: die Sternzusagen
liegen in der Gruppe aus 0.28.1 und nicht in der aus 0.30.0. *Rote Zeilen haben
beide erzeugt — nur eben dort.*

> **EINE BEOBACHTUNG AUS DEM LAUF, und sie ist kein Fehler dieser Runde:** *die
> Gruppe „Der Prüfstand räumt beim Start auf — 0.30.0" wurde in **neun von
> einundzwanzig** Läufen rot, ohne dass der jeweilige Rückbau etwas mit ihr zu
> tun hatte* — **und im Nachlauf mit nur drei Spuren in zwei von dreien.**
> *Mehrere Prüfläufe nebeneinander sind für den Aufräumer aus BA 3 immer noch
> eine unruhige Lage* — dieselbe Sorte Befund, die 0.30.0 schon einmal geliefert
> hat *(„der Vater ist fort")*, nur eine Stufe feiner. **Er steht als Punkt 27
> im Sammelblatt und nicht in dieser Runde.**

---

## Der Augenschein

**Gefahren am 12. September 2026 an beiden Installationen**, in echtem Chromium
bei 390 × 844 — *und zwar am laufenden Server, nicht an einem nachgebauten
Dokument.*

**DIE FARBTAFEL IN ALLEN SECHS LAGEN:**

| Aufgabe | Zustand | Farbe | Auszeichnung |
|---|---|---|---|
| offen, Datum in der Zukunft | `due-later` | `rgb(77, 157, 224)` — **blau** | — |
| offen, heute fällig | `due-today` | **blau**, fett | — |
| offen, Datum überschritten | `due-overdue` | `rgb(240, 85, 92)` — **rot** | — |
| erledigt, Frist gehalten | `due-done` | `rgb(63, 211, 154)` — **grün** | durchgestrichen |
| erledigt, Frist gerissen | `due-late` | **rot** | durchgestrichen |
| erledigt, ohne Datum | — | — | **der Knopf steht da und sagt „Datum"** *(F19)* |

**UND MIT EINEM ZWEITEN ZUGANG GELESEN** *(Befund 8, F20)*: **jede Frist steht
da, und jede als `SPAN` und nicht als Knopf** — *außer an bert*s eigener
Aufgabe: dort steht ein `BUTTON` und die drei Tags daneben.* **Die Klemme
sitzt damit an der Bedienung und nicht an der Auskunft, und sie unterscheidet
richtig zwischen eigenem und fremdem Kommentar.**

**DIE KRITERIENKARTE:** *„1_Optische Erscheinung_de", „2_Verarbeitungsqualitaet_de",
„3_Funktionalitaet_de" — **je 150 Pixel Namensspalte, keiner mehr abgeschnitten**,
der Zähler zeigt „1" und sein Titel „1 Eintrag".*

> **ZWEI MESSFEHLER SIND DABEI AUFGEFALLEN, und beide lagen im Messaufbau und
> nicht im Gebauten:**
>
> | | was schiefging | woran man es sah |
> |---|---|---|
> | **1** | *der Aufbau der Prüflage nahm `comments[0]` für den eben angelegten Kommentar — die Liste kommt aber in der Reihenfolge ihres Entstehens.* **Alle sieben Änderungen liefen damit auf denselben Kommentar** | sechs Aufgaben ohne Datum, eine mit dem falschen Zustand |
> | **2** | *ein Vollbild ändert in Chromium die Fenstermaße.* **Die erste Fassung des Augenscheins hat deshalb andere Höhen gemeldet als der Vergleichslauf daneben** | 42/70/79 gegen 54/91/92 für dieselbe Zeile |
>
> **UND EINE DRITTE FALLE WAR SCHON BEKANNT und ist trotzdem wieder
> aufgemacht worden:** *eine Navigation, die sich nur im Anker unterscheidet,
> lädt nicht neu.* **0.30.0 hat diese Lehre aufgeschrieben; 0.30.1 hat sie ein
> zweites Mal bezahlt.** *Jede Messung erzwingt jetzt `about:blank` davor.*

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
