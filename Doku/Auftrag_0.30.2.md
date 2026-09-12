# Auftrag 0.30.2 — „Die Tagzeile bekommt ihre Breite zurück"

**Ein Befund aus dem Betrieb · geschrieben am 12. September 2026 · gebaut auf
0.30.1.**

> **DER BETREIBER HAT DIE SAMMLUNG AM SELBEN TAG GESCHLOSSEN:** *„nein bitte
> baue 0.30.2 jetzt."* **Die Fragetafel ist damit kurz, und sie ist beantwortet,
> bevor die erste Zeile entstand** *(Regel 11, zum sechsten Mal in Folge)*.

---

## Die Fragetafel — vor der ersten Zeile beantwortet

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F1** | **„mehr"/„weniger" wird ein Haken nach unten** | **Ja — und es ist keine neue Form.** *`ICON_STEP_BACK` und `ICON_STEP_FWD` sind derselbe Haken, nur gedreht; er entsteht aus demselben Helfer `char()` und trägt dieselbe Strichstärke* |**JA.** *Betreiber, 12. September 2026: „dein vorschlag oben ist gut."* |
| **F2** | **Eine offene Tür statt des Hakens?** *(sein zweiter Vorschlag)* | **Nein, und der Grund ist im Haus schon vergeben.** *„Das Haus verlassen" ist die Wendung dieses Projekts für das, was hinausgeht.* **An einer Tagwolke sagte eine Tür „hinaus"** — das Gegenteil von „mehr zeigen" |**FÄLLT.** *Betreiber, 12. September 2026, mit derselben Zusage* |
| **F3** | **× für „Tags zurücksetzen"?** *(sein dritter Vorschlag)* | **Fast — das Haus hat ein besseres.** *`ICON_RESET` ist der Kreispfeil und steht an `.rreset`, dem Rücksetzer der Sternzeile.* **× heißt im Haus „weg"** — eine Zeile löschen, einen Tag vom Testtag nehmen, eine Ansicht entfernen |**DER KREISPFEIL.** *Betreiber, 12. September 2026* |
| **F4** | **Beide wandern in Spalte 1, unter die Beschriftung** *(seine Bestellung)* | **Ja — damit fällt die dritte Spalte ganz weg.** *Gemessen wächst Spalte 1 dabei nicht: sie misst 74 px (de), 63 (en), 78 (tr), und zwei Zeichen brauchen rund 70* |**JA** *(seine eigene Bestellung)* |
| **F5** | **„und/Oder" geht unter die Klappe** *(seine Bestellung)* | **Ja — mit einer Ausnahme.** *Greifen **zwei oder mehr** Tags, entscheidet der Umschalter über das Ergebnis, und ein Filter, der greift und nicht zu sehen ist, ist genau der Befund, wegen dessen bis 0.30.0 „Tags (2)" am alten Umschalter stand.* **Sein Wort „in der Regel nicht sichtbar" trägt die Ausnahme** |**JA, mit dieser Ausnahme** |
| **F6** | **Funktionieren Zeichen in drei Sprachen?** *(seine Frage)* | **Ja — und zwar deshalb, weil ein Zeichen keine Sprache hat.** *Der **Titel** hat eine, und der bleibt: die Schlüssel `list.more`, `list.less` und `list.resetTags` stehen unverändert da und wechseln nur den Ort.* **Kein Wort ist gefallen, keines ist erfunden** |**JA** |

> **EINE ENTSCHEIDUNG IST NICHT GEFRAGT WORDEN UND STEHT TROTZDEM HIER:** *der
> Rücksetzer am Fuß desselben Kastens heißt weiterhin **„Filter zurücksetzen
> (11)" als Wort**.* **Er bleibt ein Wort, und der Grund ist der Umfang:** *er
> setzt ALLE Filter zurück, der Kreispfeil an der Tagzeile nur die Tags.* **Zwei
> verschiedene Reichweiten dürfen verschieden aussehen** — *und ein zweites
> Zeichen an derselben Karte hieße, dass beide dasselbe tun.*

---

## Befund 1 — Die aufgeklappte Tagwolke setzt jeden Tag auf eine eigene Zeile

**Art: Fehler** *(Platz)* · **zwei Bilder, 12. September 2026, aus der laufenden
Installation mit 0.30.1**

> **Der Betreiber wörtlich:** *„Damit tags mehr platz haben das ‚mehr' und
> ‚reset' direkt unter dem tag anzeigen. genau der wird auch zu weniger wenn
> mehr aufgemacht ist damit man den wieder schließen kann. Damit wir platz
> sparen könnten wir reset nehmen. oder du.. wir nehmen icons für mehr und das
> reset. wenn wir damit platz sparen können. oder funktioniert das in 3
> sprachen? das bedeutet das ‚und/oder' wandern unter die klappe und sind in der
> regel wenn nicht aufgeklappt ist nicht sichtbar. Und was nicht passieren darf
> ist wenn es aufgeklappt ist das wir so eine platzverschwendung haben."*

### Was dasteht — und woher es kommt

**DIE TAGZEILE IST EIN RASTER AUS DREI SPALTEN** *(`public/style.css`, schmaler
Abschnitt)*:

```
.frow { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; }
```

*Spalte 1 trägt die Beschriftung und den Umschalter, Spalte 2 die Wolke,
Spalte 3 die Verweise am Zeilenende.* **Spalte 3 ist `auto` — sie nimmt sich,
was ihr Inhalt braucht, und Spalte 2 bekommt den Rest.**

**GEMESSEN AM 12. SEPTEMBER 2026** *(echtes Chromium, 390 × 844, dreißig Tags)*:

| Lage | Spalten | Wolke | Zeilenende | Tags je Reihe |
|---|---|---|---|---|
| **ohne Tagfilter** | 63 / **246** / 37 | 246 px | 37 px *(„mehr")* | 4 · 2 · 3 · 4 … |
| **MIT Tagfilter** | 63 / **167** / 116 | 167 px | **116 px** *(„mehr" + „Tags zurücksetzen")* | **3 · 1 · 1 · 1 · 2** |

> **DAS IST DIE URSACHE, UND SIE IST GEMESSEN UND NICHT GERATEN.** *Sobald ein
> Tagfilter greift, tritt „Tags zurücksetzen" neben „mehr" — und die dritte
> Spalte wächst von 37 auf **116 Pixel**. Die Wolke verliert dieselben 79.*
> **Der breiteste Tag misst 126 px; bei 167 px Wolkenbreite passen zwei davon
> nicht mehr nebeneinander, und die Reihen fallen auf einen Tag zusammen.**
>
> **AUF DEM BILD DES BETREIBERS IST GENAU DAS ZU SEHEN** — „Hardware", „IT",
> „Fotografie", „Videografie", „FM4", „Kabel", „Lüfter" stehen je allein auf
> einer Zeile, und rechts daneben ist die halbe Breite leer.

**WAS DIE MESSUNG NOCH NICHT ABDECKT:** *die Lage **offen und mit Tagfilter**
ist nicht sauber gefahren — der Griff, der die Wolke aufklappen sollte, hat im
englisch eingestellten Messstand den Rücksetzer erwischt und damit den Filter
gelöscht.* **Sie gehört in BA 1 dieser Runde.**

### Was der Betreiber vorschlägt

| | |
|---|---|
| **1** | **„mehr" und der Rücksetzer wandern unter die Beschriftung** — also in Spalte 1, dorthin, wo heute „und/Oder" steht. **Die dritte Spalte fällt damit ganz weg, und die Wolke bekommt ihre Breite zurück** |
| **2** | **Derselbe Verweis heißt „weniger", sobald aufgeklappt ist** — *so ist es heute schon; er steht dann nur woanders* |
| **3** | **„und/Oder" wandert unter die Klappe** — es ist im Regelzustand nicht sichtbar und erscheint erst, wenn die Wolke offen steht |
| **4** | **Kürzere Beschriftungen oder Bildzeichen**, um Platz zu sparen: *„reset" statt „Tags zurücksetzen" — oder Zeichen für beide.* **Seine Frage dazu: „funktioniert das in 3 sprachen?"** |
| **5** | **Und im aufgeklappten Zustand darf keine Platzverschwendung entstehen** |

### Zur Frage nach den drei Sprachen — eine Antwort steht schon fest

**EIN BILDZEICHEN HAT KEINE SPRACHE, UND GENAU DAS IST SEIN VORTEIL.** *Es
braucht aber einen Titel, und der hat eine — „ein Punkt allein liest kein
Vorleseprogramm vor" steht seit 0.24.x im Stilblatt und gilt hier genauso.*

**DAS HAUS MACHT ES AN ANDEREN STELLEN SCHON SO:** *die Werkzeuge einer
Verwaltungszeile (`.mact`) sind Stift und Kreuz mit Titel, und der Rücksetzer
der Sternzeile ist ein × mit Titel.* **Bildzeichen sind also keine neue Bauform,
sondern eine vorhandene.**

> **WAS TROTZDEM ZU ENTSCHEIDEN IST:** *ob ein Verweis, der heute ein WORT ist,
> zu einem Zeichen werden darf.* **„mehr"/„weniger" sagt, was es tut; ein Pfeil
> nach unten sagt es auch — aber nur dem, der das Zeichen schon kennt.** *Das
> gehört auf die Fragetafel und wird gemessen, bevor es entschieden wird: was
> die kurze Fassung in allen drei Sprachen misst, und was sie der Wolke
> zurückgibt.*

### Was daran zu messen ist, bevor eine Zeile entsteht

| | |
|---|---|
| **1** | **Die Lage „offen mit Tagfilter"** — die Zahl, die auf dem Bild des Betreibers zu sehen ist, fehlt noch |
| **2** | **Was Spalte 1 kostet, wenn sie drei Stücke trägt** *(Beschriftung, „mehr", Rücksetzer)*: sie ist `auto` und wird so breit wie ihr breitestes Stück — **„Tags zurücksetzen" misst 116 px und stünde dann links** |
| **3** | **Die drei Sprachen nebeneinander** — deutsch, englisch, türkisch, je in der langen und der kurzen Fassung |
| **4** | **Bildzeichen gegen Wort** — was es an Breite bringt und was es an Auskunft kostet |

> **PUNKT 2 IST DER HAKEN AN DEM VORSCHLAG, und er ist der Grund, warum hier
> gemessen und nicht gebaut wird.** *Ein Stück, das aus Spalte 3 nach Spalte 1
> wandert, macht Spalte 1 breiter — und Spalte 1 steht neben der Wolke, nicht
> unter ihr.* **Gewonnen ist nur, wenn das wandernde Stück dabei KÜRZER wird**
> — und genau darauf zielt die Frage nach den Bildzeichen.

---

## Die drei Zeichen — nachgesehen am 12. September 2026

**DER BETREIBER SCHLÄGT VOR:** *„ja ein pfeil nach unten oder ein tür symbol..
offene tür.. dann x zum resetten also tags zurücksetzen.. könnte doch passen?"*

**ZWEI DAVON SIND SCHON ENTSCHIEDEN, WEIL DAS HAUS DIE ZEICHEN FÜHRT — und das
dritte fällt an einer Kollision, die es nicht gibt, sondern schon gab.**

| | Vorschlag | nachgesehen |
|---|---|---|
| **1** | **Pfeil nach unten** für „mehr"/„weniger" | **Ja — und es ist keine neue Form.** *`ICON_STEP_BACK` und `ICON_STEP_FWD` sind derselbe Haken, nur gedreht (`public/app.js:414`). Ein Haken nach unten entsteht aus demselben Helfer `char()` und trägt dieselbe Strichstärke.* **Ein Zeichen, das die Instanz schon zweimal zeigt, muss niemand neu lernen** |
| **2** | **Offene Tür** für dasselbe | **Nein, und der Grund ist im Haus schon vergeben.** *„Das Haus verlassen" ist die Wendung dieses Projekts für das, was hinausgeht — sie steht im Wortlaut des Exports* *(`card.exportWarning`)*. **Eine Tür ist das Bild dazu.** *An einer Tagwolke sagte sie „hinaus" — und das ist das Gegenteil von „mehr zeigen"* |
| **3** | **× für „Tags zurücksetzen"** | **Fast — das Haus hat dafür ein besseres, und zwar seit jeher.** *`ICON_RESET` ist der Kreispfeil (`public/app.js:394`) und steht an `.rreset`, dem Rücksetzer der Sternzeile.* **× heißt im Haus „weg": eine Zeile löschen, einen Tag vom Testtag nehmen, eine Ansicht entfernen.** *„Zurücksetzen" ist etwas anderes als „weg", und das Haus unterscheidet die beiden schon mit zwei Zeichen* |

> **DAMIT WÄRE DIE DRITTE SPALTE ZWEI ZEICHEN BREIT statt 116 Pixel Text** —
> *ein Haken nach unten und ein Kreispfeil.* **Wie viel das wirklich einbringt,
> ist gemessen und nicht geschätzt** *(BA 1, Punkt 2 und 4 oben)*: **ein
> Bedienelement am Finger misst rund 32 bis 36 Pixel**, zwei davon also rund 72
> statt 116. *Und wandern sie nach Spalte 1, muss die Rechnung dort noch einmal
> aufgehen — „TAGS" misst 63.*

> **UND EINE FRAGE BLEIBT, DIE KEIN ZEICHEN BEANTWORTET:** *derselbe Kasten
> trägt unten „Filter zurücksetzen (11)" als **Wort**.* **Ein Kasten mit einem
> Wort-Rücksetzer und einem Zeichen-Rücksetzer sagt dieselbe Sache zweimal
> verschieden.** *Das gehört auf die Fragetafel.*

---

## Der Bauabschnitt

**EINER, UND ER FASST DREI DATEIEN AN:** `public/app.js` *(die beiden Zeichen
und der Merker `tags-live`)*, `public/style.css` *(das Raster, der
Zeichenverweis)* und **keine Sprachdatei** — *die drei Schlüssel bleiben, was
sie sind.*

**KEIN SCHEMAANTEIL**, keine neue Spalte, kein Migrationsblock, das
Austauschformat bleibt **16**, `F_ROUTES` bleibt **73**. **PATCH.**

---

## Der Prüfstand — was er halten muss

| | Zusage |
|---|---|
| **1** | **Der Haken entsteht aus demselben Helfer wie die vorhandenen** — geprüft wird der **Bauweg** und nicht der Pfad: der Pfad darf sich ändern, der Bauweg nicht |
| **2** | **Der Rücksetzer nimmt den Kreispfeil, den es schon gibt — und kein Kreuz** |
| **3** | **Die drei Schlüssel stehen weiter in allen drei Sprachdateien** — *das Wort ist umgezogen und nicht gefallen* |
| **4** | **Und es steht im TITEL, nicht im Text** — samt Ansage für das Vorleseprogramm |
| **5** | **Die beiden Verweise stehen in Spalte eins**, die Zeile trägt drei Rasterzeilen, der Umschalter die dritte |
| **6** | **Ein Zeichenverweis ist ein Ziel für den Finger** — dreißig Pixel im Quadrat, dasselbe Maß wie am Rücksetzer der Sternzeile |
| **7** | **Der Umschalter ist verborgen, solange zugeklappt ist und weniger als zwei Tags greifen** — *gefahren in drei Lagen: ohne Auswahl, mit einem Tag, mit zweien* |
| **8** | **Aufgeklappt steht er da, und der Haken zeigt dann nach oben** |

> **JEDE NEUE PRÜFUNG BEKOMMT IHRE GEGENPROBE, UND DIE WIRD GEFAHREN.**

---

## Was ausdrücklich NICHT gebaut wird

| | |
|---|---|
| **Keine neue Sprachzeile** | *die drei Schlüssel wechseln den Ort, nicht den Wortlaut* |
| **Kein neues Zeichen, wo es eines gibt** | *der Kreispfeil steht schon an der Sternzeile* |
| **Keine Tür** | *„Das Haus verlassen" ist im Haus vergeben* |
| **Kein zweites Zeichen am Fuß der Karte** | *„Filter zurücksetzen" bleibt ein Wort — andere Reichweite, anderes Bild* |
| **Kein Schemaanteil** | keine Spalte, kein Migrationsblock, Austauschformat bleibt 16 |

---

## Wie es weitergeht

1. **Gebaut, geprüft, Gegenproben gefahren, Augenschein.**
2. **Der Fingerprint wird ALS LETZTES gerechnet** — *die Lehre aus 0.30.1, wo er
   zweimal überholt im Papier stand.*
3. **Eingespielt wird dieser Stand** — *der Betreiber hat 0.30.1 zurückgehalten:
   „ich werde die den nur wieder einspielen wenn wir den patch mit dem tagfilter
   haben."*

> **DER BETREIBER SPIELT ERST WIEDER EIN, WENN DIESE RUNDE DA IST** *(12.
> September 2026: „ich werde die den nur wieder einspielen wenn wir den patch
> mit dem tagfilter haben")*. **Das hat eine Folge für das Papier von 0.30.1:**
> *dessen dritte Quelle bleibt offen, und im Feld läuft weiter `a6726a83`.*
> **Der nächste Stand, der eingespielt wird, ist der dieser Runde** — und er
> bestätigt dann seinen eigenen Fingerprint, nicht den von 0.30.1.
