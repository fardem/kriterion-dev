# Auftrag 0.30.0 — „Der Prüfstand wird schnell, das Telefon wird ruhig"

**Fünf geplante Punkte, VIER Befunde aus dem Betrieb und einer aus dem
Nachmessen · geschrieben am 12. September 2026 · gebaut auf 0.29.0.**

> **DER BETREIBER HAT SIE ZUSAMMENGELEGT** *(12. September 2026)*: **„ich will
> es wieder kombinieren. und keine runde alleine dafür machen."** *Die vier kamen
> mit Bildern aus zwei Installationen; der fünfte ist beim Vermessen des
> zweiten aufgefallen.*

---

## Was in dieser Runde passiert

**DIESE RUNDE BAUT AN ZWEI ENDEN, UND BEIDE ENDEN SIND DASSELBE.** *Am einen
steht der Prüfstand: er kostet heute sieben Minuten je Lauf, und die Gegenprobe
zahlt diese sieben Minuten **je Rückbau**. Am anderen steht das Telefon: an vier
Stellen steht dort etwas schlechter da, als es müsste.* **Beide Enden kosten
dieselbe Sache — Zeit, in der niemand etwas sieht.**

**DER AUFTRAG DES BETREIBERS ZUR ERSTEN HÄLFTE STEHT SEIT DEM 8. SEPTEMBER 2026
WÖRTLICH IM FAHRPLAN:** *„Optimiere und mach das, was das Bauen beschleunigt,
aber dennoch sicher ist."*

> **DIE ZWEITE HÄLFTE DES SATZES IST DIE AUFLAGE DIESER RUNDE:** *keine Prüfung
> fällt weg, keine wird abgeschwächt, und ein Lauf sagt hinterher genauso
> verlässlich, was er belegt hat.* **Wo eine Zusage umgebaut wird, muss sie
> danach MEHR abdecken als vorher — sonst wird sie nicht angefasst.**

**ZUR ZWEITEN HÄLFTE HAT ER VIER BILDER GESCHICKT**, aus **zwei**
Installationen: *einer mit mehreren Zugängen und einer mit einem einzigen.*
**Das ist der Grund, aus dem Befund 7 überhaupt sichtbar wurde** — mit einem
Zugang misst der Bewertungskasten 387 Pixel, mit zwei deren 580.

> **UND EIN BEFUND IST KEINER AUS DEM FELD, SONDERN EINER AUS DEM NACHMESSEN.**
> *Beim Vermessen des Bewertungskastens ist aufgefallen, dass das Wort
> „gewichtet" in `public/app.js:7020` fest im Quelltext steht und in keiner
> Sprachdatei vorkommt.* **In einer türkisch eingestellten Instanz steht dort
> deutscher Text.**

**KEIN SCHEMAANTEIL.** *0.29.0 war die letzte Runde, die die Struktur anfassen
durfte; diese hier fasst keine Tabelle an, kein Migrationsblock kommt dazu, und
das Austauschformat bleibt **16**.*

---

## Der Fingerprint des Vorgängers

| Quelle | Wert |
|---|---|
| **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`0336d3a5`** |
| **Am Arbeitsbaum nachgerechnet** *(dieselben achtzehn Dateien)* | **`0336d3a5`** |
| **Aus der laufenden Installation gemeldet** *(Betreiber, 12. September 2026)* | **`0336d3a5`** |

> **DREI QUELLEN, EIN WERT — und zum vierten Mal in Folge lag die Bestätigung
> aus dem Feld vor, bevor die nächste Runde anfing.** *Am Wirt läuft 0.29.0.*
>
> **UND ZUM ERSTEN MAL KONNTE DER BETREIBER IHN OHNE SHELL NACHRECHNEN.**
> *0.29.0 hat den Handgriff selbst gebaut — „Dateien zeigen" in den Kennzahlen
> legt die achtzehn Einzelwerte neben den Gesamtwert.* **Die Meldung aus dem
> Feld kam deshalb schneller als in jeder Runde davor.**

**Der Vorgänger im Überblick:** 0.29.0 · **6662 Prüfungen** · **885
Rückbauten** · `F_ROUTES` = **73** · lesende Routen **31** · Austauschformat
**16** · **zwölf** Migrationsblöcke · **neunzehn** Karten · **16**
Fensterabfragen und **zwei** Behälterabfragen · Sprachdateien **1346**
Schlüssel je Sprache · **ein Lauf dauert 446,8 Sekunden und fährt 329 Gruppen**
*(gemessen am 12. September 2026, 6662 von 6662 grün)*.

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

> **REGEL 11: GEBAUT WIRD ERST, WENN JEDE FRAGE BEANTWORTET UND IM PAPIER
> EINGETRAGEN IST.** *Seit 0.28.0 ist das dreimal eingehalten worden, jedes Mal
> mit Gewinn — in 0.29.0 haben drei Messungen drei Antworten des Auftrags
> berichtigt, und jede einzelne hätte beim Bauen einen Schaden angerichtet.*
>
> **DIE SPALTE „VORSCHLAG VON CLAUDE" IST EIN VORSCHLAG UND KEINE ANTWORT.**

### Zur ersten Hälfte — der Prüfstand

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F1** | **Darf die Kostenstufe von `scrypt` aus der UMGEBUNG kommen?** *Der Hebel bringt 25 bis 45 Sekunden — aber `N` ist eine **Sicherheitsgrenze**, und eine Umgebungsvariable, die sie senkt, senkt sie auch auf dem Wirt* | **Nein — nicht aus einer gewöhnlichen Umgebungsvariablen.** *Sie wird aus **einem** Prüfschalter gelesen, den nur der Prüfstand setzt, und die Auslieferung nagelt `N = 16384` fest.* **Eine Instanz darf ihre eigene Anmeldung nicht aus Versehen schwächen können** | |
| **F2** | **Und die drei Mailfristen** *(`SEND_MS` 20 s, `GREETING_MS` 7 s, `CONNECT_MS` 7 s)*? *Sie bringen ~50 Sekunden* | **Ja — mit derselben Klammer wie F1.** *Eine Frist ist keine Sicherheitsgrenze, aber eine Instanz, die nach 300 ms aufgibt, verschickt keine Mail mehr* | |
| **F3** | **Die Anmeldebremse an der FUNKTION statt an der Route** *(~80 s, der größte Einzelhebel)*: **sechs Prüfgruppen fahren die Kurve heute real durch** | **Bauen.** *`delay()` ist eine reine Funktion — die Kurve wird an ihr belegt, für **jeden** Zählerstand und in null Millisekunden, die Verdrahtung genau **einmal** an der Route.* **Der Beleg wird stärker: heute deckt der Lauf nur die sechs Stände ab, durch die er zufällig geht** | |
| **F4** | **Ein GRUNDDOKUMENT für `jsdom` statt 174 Aufbauten** — welche Prüfungen behalten ihren eigenen Aufbau? | **Die, die den Aufbau SELBST belegen** *(erste Zeichnung, Reihenfolge der Schritte, alles, was vom leeren Dokument ausgeht)*. **Der Gewinn ist zu MESSEN und nicht zu schätzen** — er steht erst nach BA 4 fest | |
| **F5** | **Wo steht die Zeit?** *Eine Zeile je Gruppe macht die Ausgabe um 304 Zeilen länger* | **Eine Schlusstafel mit den zehn teuersten Gruppen und der Gesamtzeit, immer.** *Die Zeit JE Gruppe nur mit einem Schalter* — **wer sie nicht sucht, soll sie nicht lesen müssen** | |
| **F6** | **Woran wird diese Runde gemessen?** *„Schneller" ohne Zahl ist keine Zusage* | **Zwei Zahlen, und die erste ist die Pflicht:** *unter **280 s** allein aus den drei gemessenen Hebeln (447 − 75 − 55 − 35), unter **250 s** mit dem Grunddokument.* **Die Prüfungszahl bleibt dabei 6662 oder höher, und die Endzahl kommt aus einem gefahrenen Lauf ins Änderungsprotokoll** | |
| **F7** | **`foreignServer()` findet einen laufenden `node testbench.js` NICHT** *(Befund 1)*. **Wird zusätzlich auf die PORTS gesehen?** *Der Wächter kennt seine Lücke und benennt sie selbst: einen Server aus `node -e` findet er auch künftig nicht* | **Ja, beides.** *Der Name wird berichtigt — das ist eine Zeile —, und zusätzlich wird auf den Portbasen der Spuren nachgesehen, ob jemand horcht.* **Der Portblick findet auch das, was kein Muster über den Befehl je findet** | |
| **F8** | **Greift der Lauf bei jedem Push wirklich?** *(Befund 5)* **Das ist ein NACHSEHEN und kein Bauen** — und was, wenn er greift? | **Dann fällt der Sammelblattpunkt ohne Code** *(Regel 2)*, **und an seine Stelle tritt ein Satz in der README:** *ein Papier ist Prüfstoff, und wer eines ändert, fährt den Lauf* | |

### Zur zweiten Hälfte — die vier Kästen am Telefon

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F9** | **Die Tagzeile steht künftig beim Aufklappen der Filter offen** *(Betreiber, Bild 1)*. **Fällt damit der Umschalter „Tags" ganz?** *Er misst 46 × 33 px und steht in der dritten Rasterspalte* | **Er fällt.** *Gemessen: offen kostet die Zeile **52 px** gegenüber heute zugeklappt — und mit dem Umschalter daneben wären es 55.* **Ein Schalter, der beim Aufbau immer schon umgelegt ist, ist ein Wort über eine Sache und nicht die Sache** | |
| **F10** | **Der Preis dafür ist EIN sichtbarer Tag weniger** — die Beschriftungsspalte wächst von 35 auf 67 px, weil „und/Oder" darunter steht. *Heute vier sichtbare Tags, danach drei; der Rest steht hinter „mehr"* | **Hinnehmbar.** *Die Zeile wird dabei **27 px flacher** als heute aufgeklappt (46 statt 69) und trägt zwei Rasterzeilen statt dreier.* **Und „mehr" steht genau dafür da** | |
| **F11** | **Wie heißt der Knopf „Wer hat bewertet" künftig?** *Der Betreiber schlägt „Stimmen?", „User?", „User Stimmen", „Abgestimmt?" vor* | **„Wer?" — 67 px statt 159.** *Gemessen ist die Grenze: mit „⌀ 4,5 gewichtet" daneben passt ein Knopf bis **98 px** in eine Zeile, ab **127 px** bricht sie.* **Damit fallen drei der vier Vorschläge:** *„Stimmen?" und „User Stimmen" an `SCREEN_BAN` (seit 0.22.0 gesperrt), „Abgestimmt?" an den 127 px, „User?" am Wörterbuch — im Haus heißt ein Zugang „Benutzer".* **„Wer?" ist die Frage, die der Knopf beantwortet, und „Bewerter" (98 px) wäre die zweite Wahl** | |
| **F12** | **Fällt die ZWEIZEILIGE Sternzeile?** *Sie ist eine bewusste Entscheidung (Projektstand 5.3): am Telefon bekommt der Name der Kriterien die ganze Breite, die Sterne stehen darunter* | **NEIN — und das hat die Messung entschieden, nicht der Geschmack.** *Zurückgenommen wächst der Kasten von **580 auf 607 px**, die Namensspalte fällt auf 54 px, jeder Name bricht fünfzeilig um, und die Seite ROLLT seitlich: drei Spalten brauchen 362 px nebeneinander und die Liste hat 366.* **Gebaut wird stattdessen WENIGER LUFT in derselben Bauform: 22 der 82 Pixel je Kriterium sind Innenabstand.** *Zwei Fassungen sind gefahren:* **C1a fasst nur den Vierspalter an — 531 statt 580 px** *(49 gespart, die Fassung mit EINEM Zugang bleibt unangetastet)*; **C1 nimmt die Luft in jeder Bewertungszeile — 483 px** *(97 gespart, aber auch dort, wo der Betreiber „gut" gesagt hat)*. **Vorschlag: C1a** — *wer „gut" sagt, bekommt nicht ungefragt etwas anderes* | |
| **F13** | **Das Fälligkeitsdatum bekommt Farbe** *(Bild 4)*. **Welche drei — und gilt sie auch an einer ERLEDIGTEN Aufgabe?** *Heute steht das Datum an einer erledigten gar nicht mehr da* | **Überfällig rot, heute normal und fett, später gedämpft.** *Dieselbe Farbe wie `.open-section.overdue`, damit „Offen" und der Eintrag dasselbe sagen.* **An einer erledigten steht es künftig da, gedämpft und durchgestrichen** — sonst verschwindet beim Abhaken eine Angabe, die jemand eingetragen hat | |
| **F14** | **Die Vokabelkarte am Telefon: zurück auf ZWEI Spalten?** *(Betreiber, mit Bild, mitten in der Fragerunde: „war das vorher nicht besser mit einer zeile mit 2 spalten?")* | **Nein — und das ist gemessen.** *Zwei Spalten halbieren die Karte (1139 → 701 px), aber danach bricht **jede** der vierzehn Beschriftungen um, zwei davon dreizeilig. Einspaltig brechen **zwei** von vierzehn.* **Die Regel ist aus 0.28.x und nicht aus 0.29.0** *(`dcef9dc`, 7. September 2026)* — siehe Befund 9, dort steht ein dritter Weg | |
| **F15** | **„gewichtet" steht fest im Quelltext** *(Befund 10)*. **Fährt der Schlüssel hier mit oder wartet er auf 0.31.0?** | **Hier.** *Die Kopfzeile des Bewertungskastens wird in dieser Runde ohnehin umgebaut — derselbe Knopf, dieselbe Zeile.* **Ein bekannter Fehler, der in der Zeile stehenbleibt, die man gerade in der Hand hat, kommt teurer wieder** | |

### Zur Runde selbst

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F16** | **Die Nummer: 0.30.0 als MINOR?** *Der Fahrplan sagt MINOR; der Inhalt ist aber zur Hälfte Werkzeug und zur Hälfte Reparatur* | **Ja — und der Grund ist F1/F2 und nicht der Fahrplan.** *Eine Instanz, die Fristen und Kennwerte aus ihrer Umgebung nehmen kann, **kann etwas, was sie vorher nicht konnte**; das ist Regel 5.1 eine Funktion.* **Fällt F1 UND F2 auf „nein", ist die Runde PATCH** — und dann heißt sie 0.29.1 | |
| **F17** | **Der Selbsttest aus 0.29.0** *(die Zeile, mit der der Betreiber in einem Befehl prüft, ob alles dasteht)*: **kommt sie als `tools/selbsttest.js` in den Baum?** | **Nein — sie bleibt in der README.** *Eine Datei im Baum wäre die neunzehnte im Fingerprint und damit selbst wieder etwas, das geprüft werden muss.* **Ein Befehl zum Einfügen hat keinen Fingerprint** | |

---

## Die Messungen vor der ersten Zeile

**ALLES ZUR OBERFLÄCHE IST IN EINEM ECHTEN CHROMIUM BEI 390 × 844 GEFAHREN**
*(`deviceScaleFactor: 3`, `isMobile: true`)*, an einer laufenden Instanz mit
zehn Marken, vier Kategorien, sechs Einträgen und — für Befund 7 — **zwei**
Zugängen. **Nicht am Quelltext und nicht an einer Nachbildung.**

> **UND EINE MESSUNG AM EMULIERTEN GERÄT IST KEINE AM ECHTEN.** *Wo das
> Betriebssystem zeichnet, entscheidet nur das Gerät — 0.28.0 hat das gelernt.*
> **Alles hier Gemessene ist Fluss und Raster**, und darüber entscheidet der
> Browser. *Was das Betriebssystem zeichnet, kommt in dieser Runde nicht vor.*

**ZWEI ANTWORTEN DIESES AUFTRAGS HAT DIE MESSUNG BERICHTIGT**, und beide hätten
beim Bauen einen Schaden angerichtet:

| | der erste Entwurf sagte | gemessen |
|---|---|---|
| **die Sternzeile** | *der schmale Dreispalter fällt, und der Kasten wird kleiner* | **er wird GRÖSSER — 607 statt 580 px —, jeder Name bricht fünfzeilig um, und die Seite rollt seitlich** *(F12)* |
| **der Knopf** | *er ist zu lang und bricht die Kopfzeile um* | **allein ist er es nicht: ohne das Wort „gewichtet" passt auch „Wer hat bewertet" in eine Zeile.** *Erst beide zusammen kippen sie* *(F11)* |

> **BEIDES IST AM SELBEN VORMITTAG AUFGEFALLEN, und beides in derselben
> Reihenfolge: erst der Satz, dann die Zahl, dann die Berichtigung.** *Das ist
> Regel 5 des Auftragsformats, angewandt auf den eigenen Vorschlag statt auf
> den des Betreibers.*

### Befund 6 — die Tagzeile

| Fassung | Filterkasten | erste Kachel | Tagzeile | sichtbare Tags |
|---|---|---|---|---|
| **heute, Tagzeile zu** | **212 px** | y = 424 | — | — |
| **heute, aufgeklappt** | **291 px** | y = 502 | **69 px** *(3 Rasterzeilen)* | 4 von 10 |
| A1 — und/Oder klein unter „TAGS", Wolke in Zeile 1 | 267 px | y = 479 | 46 px *(2 Zeilen)* | 3 |
| A2 — Wolke daneben statt darunter | 281 px | y = 492 | 59 px *(3 Zeilen)* | 3 |
| A3 — A1 **und der Umschalter „Tags" fällt** | 267 px | y = 479 | 46 px | 3 |
| **A4 — A3 mit noch kleinerem und/Oder** | **264 px** | **y = 476** | **43 px** *(2 Zeilen)* | 3 |

> **A4 IST DIE FASSUNG, DIE DER BETREIBER BESCHRIEBEN HAT**, Wort für Wort:
> *„und/Oder kleiner unter der Tag-Überschrift · danach rechts davon die Tags ·
> am rechten Ende das mehr-Button · wenn das mit einer Zeile nicht klappt, dann
> zweizeilig."* **Es klappt nicht mit einer Zeile, und es ist zweizeilig.**
>
> **ZWEI ZAHLEN ENTSCHEIDEN, UND SIE ZEIGEN IN VERSCHIEDENE RICHTUNGEN:**
> *gegen heute **aufgeklappt** spart A4 **27 Pixel**; gegen heute
> **zugeklappt** kostet „immer sichtbar" **52 Pixel**.* **Beides ist wahr, und
> die Frage ist, welcher der beiden Zustände der übliche ist** *(F9, F10)*.

**DIE DREI SICHTBAREN TAGS STATT VIER SIND KEIN UMBRUCH, SONDERN DIE
BESCHRIFTUNGSSPALTE:** *sie wächst von 35 auf 67 px, weil „und/Oder" unter das
Wort „TAGS" rückt.* **Der Rest steht hinter „mehr", wie vorher auch.**

### Befund 7 — der Bewertungskasten

**ZUERST DIE KOPFZEILE, UND SIE HAT DEN BETREIBER WORT FÜR WORT BESTÄTIGT.**
*Er schrieb: „damit es zusammen mit Titel, gewichtet und wer hat bewertet in
einer zeile passt".* **Genau das Wort „gewichtet" ist es:**

| die Zahl | der Knopf | Kopfzeile |
|---|---|---|
| „⌀ 4,5" | **„Wer hat bewertet"** *(159 px)* | **42 px, EINE Zeile** |
| **„⌀ 4,5 gewichtet"** *(99 px)* | **„Wer hat bewertet"** *(159 px)* | **81 px, ZWEI Zeilen** |
| „⌀ 4,5 gewichtet" | **„Wer?"** *(67 px)* | **42 px, EINE Zeile** |
| „⌀ 4,5 gewichtet" | **„Bewerter"** *(98 px)* | **42 px, EINE Zeile** |
| „⌀ 4,5 gewichtet" | **„Abgestimmt?"** *(127 px)* | **81 px, ZWEI Zeilen** |

> **OHNE „gewichtet" BRICHT NICHTS UM — auch nicht mit dem heutigen Knopf.**
> *Die Kopfzeile misst dann 42 px, und der Knopf endet genau an der Kante
> (x = 378 von 378).* **Erst das zweite Wort an der Zahl kippt sie.**
>
> **DIE GRENZE LIEGT ZWISCHEN 98 UND 127 PIXELN, und sie ist gefahren:**
> *„Bewerter" (98) passt, „Abgestimmt?" (127) passt nicht.* **Einer der vier
> Vorschläge des Betreibers fällt damit an der Messung** *(F11)*.

**UND DAMIT HÄNGT BEFUND 7 AN BEFUND 10:** *das Wort „gewichtet" steht fest im
Quelltext und in keiner Sprachdatei.* **Wie breit es in Englisch und Türkisch
wird, entscheidet also niemand — es gibt das Wort dort gar nicht.**

**DIE ZWEITE URSACHE IST DIE STERNZEILE, und hier hat die Messung den ersten
Entwurf dieses Auftrags WIDERLEGT:**

| Fassung | Kasten | je Kriterium | Zeilen zusammen | Seite rollt? |
|---|---|---|---|---|
| **EIN Zugang** *(die Fassung, die der Betreiber „gut" nennt)* | **387 px** | 1 Rasterzeile | — | nein |
| **ZWEI Zugänge, heute** | **580 px** | **82 px** *(Name 31 · Sterne 51)* | 491 px | nein |
| ~~C2 — der schmale Dreispalter fällt, Name schrumpft~~ | **607 px** | **102 bis 127 px** | **618 px** | **JA** |
| **C1a — weniger Luft, NUR wo die vierte Spalte steht** | **531 px** | **73 px** | 437 px | nein |
| C1b — wie C1a, aber die Zeilenhöhe bleibt | 556 px | 78 px | 467 px | nein |
| **C1 — weniger Luft in JEDER Bewertungszeile** | **483 px** | **65 px** | **389 px** | nein |

> **C2 WAR DER ERSTE VORSCHLAG DIESES AUFTRAGS, UND ER IST SCHLECHTER ALS
> HEUTE.** *Gemessen: die Namensspalte fällt auf **54 px**, jeder Kriterienname
> bricht auf fünf und mehr Zeilen, der Kasten wächst von 580 auf **607**, und
> die Seite ROLLT seitlich.* **Drei Spalten brauchen 152 + 136 + 74 = 362 px
> nebeneinander; die Liste hat 366 und der Abstand frisst den Rest.**
>
> **DIE ZWEIZEILIGE STERNZEILE AUS PROJEKTSTAND 5.3 IST ALSO RICHTIG UND BLEIBT**
> *(F12)*. **Was wirklich hilft, ist die Luft:** *heute 9 px über dem Namen,
> 4 über den Sternen, 9 darunter — zusammen 22 der 82 Pixel, und die Zeilenhöhe
> des Namens steht auf 21,6 px für eine Schrift von 13,95.*
>
> **C1a SPART 49 PIXEL VON 580, C1 DEREN 97 — und in beiden Fällen wird keine
> Spalte schmaler, bricht nichts um und rollt nichts.** *Die Kopfzeile bringt
> noch einmal 39 Pixel dazu, sobald „gewichtet" dasteht.*
>
> **C1a UND C1 UNTERSCHEIDEN SICH UM 48 PIXEL — und um eine Entscheidung:**
> *C1a fasst nur den Fall mit mehreren Zugängen an und lässt die Fassung mit
> einem Zugang genau so, wie der Betreiber sie „gut" nennt.* **C1 nimmt die Luft
> in JEDER Bewertungszeile weg und ändert damit auch die Fassung, über die
> niemand sich beschwert hat** *(F12)*.

**DIE WORTBREITEN, IN DER SCHRIFT DES KNOPFES GEMESSEN:**

| Wort | Breite |
|---|---|
| **„Wer hat bewertet"** *(heute)* | **159 px** |
| „Wer bewertet hat" | 159 px |
| „Abgestimmt?" | 127 px |
| „Alle Sterne" | 112 px |
| „Verteilung" | 107 px |
| **„Bewerter"** | **98 px** |
| „Wer wie" | 89 px |
| „Einzeln" | 83 px |
| **„Wer?"** | **67 px** |

> **„STIMMEN" IST GESPERRT, UND ZWAR SEIT 0.22.0.** *`SCREEN_BAN` in
> `testbench.js:29777` führt `\bStimmen?\b` unter „ein Wort, das das Wörterbuch
> ersetzt hat".* **Zwei der vier Vorschläge des Betreibers scheitern damit an
> Regeln, die er selbst aufgestellt hat** — *„Stimmen?" und „User Stimmen" am
> Wörterbuch, „Abgestimmt?" an der Breite.* **„User?" scheitert am dritten: im
> Haus heißt ein Zugang „Benutzer".**

### Befund 8 — und warum er NICHT gemessen wird

**DAS FÄLLIGKEITSDATUM IST KEINE FRAGE VON PIXELN, SONDERN VON FARBE.** *Es
steht heute in der gewöhnlichen Textfarbe, und drei Elemente weiter rechts in
derselben Zeile steht das Erstellungsdatum des Kommentars.* **Beide sehen
gleich aus, und genau das hat der Betreiber beschrieben.**

> **EINE MESSUNG BELEGTE HIER NICHTS.** *Was zu entscheiden ist, sind vier
> Zustände und ihre Farben — und ob das Datum an einer erledigten Aufgabe
> überhaupt stehenbleibt* **(F13)**. *Beides ist eine Entscheidung und keine
> Zahl.* **Der Ort im Quelltext steht im Befund, die Zahl fehlt dort mit
> Absicht.**

### Befund 9 — die Vokabelkarte

| Breite | Spalten | Kartenhöhe | Feldbreite | Beschriftungen mit Umbruch |
|---|---|---|---|---|
| **360** | 1 | 1139 px | 336 px | **2 von 14** |
| 360, zwei erzwungen | 2 | **720 px** | 162 px | **14 von 14**, drei davon dreizeilig |
| **390** | 1 | 1139 px | 366 px | **2 von 14** |
| 390, zwei erzwungen | 2 | **701 px** | 177 px | **14 von 14**, zwei davon dreizeilig |
| **412** | 1 | 1118 px | 388 px | **1 von 14** |
| 412, zwei erzwungen | 2 | **704 px** | 188 px | **14 von 14**, zwei davon dreizeilig |
| 480 | **2 von selbst** | 689 px | — | 14 von 14 |

> **ZWEI SPALTEN HALBIEREN DIE KARTE UND BRECHEN JEDE BESCHRIFTUNG UM.** *Der
> Betreiber hat die Höhe gesehen; die Umbrüche sieht man erst, wenn man beide
> Fassungen nebeneinander misst.* **Das ist genau der Fall, für den Regel 5 des
> Auftragsformats dasteht: ein Vorschlag des Betreibers wird gemessen wie jeder
> andere** — *und hier bestätigt die Messung seine Beobachtung (die Karte ist
> zu hoch) und widerlegt seinen Vorschlag (zwei Spalten sind nicht die Antwort)*.

### Und eine Lehre aus dem Messen selbst

**ZWEIMAL HAT EINE MESSUNG EINE FRÜHERE MESSUNG VERGIFTET**, und beide Male aus
demselben Grund: *eine Navigation nur über den Anker lädt die Oberfläche nicht
neu, und eingespritztes Stilblatt überlebt sie.* **Jede Messung dieser Runde
hat deshalb einen frischen Ladevorgang erzwungen** — *die Zahlen oben sind alle
danach entstanden.*

---

## Der Befund

### 1 — der Wächter gegen den fremden Server sieht den Prüflauf nicht

**DIE GEGENPROBE KANN EINEN ABRISS NICHT VON EINER STÖRUNG VON AUSSEN
UNTERSCHEIDEN** *(Sammelblatt, 0.17.0)*. **Spur 0 fährt ohne Versatz, also auf
denselben Portbasen wie ein gewöhnlicher `npm test`.** *Läuft daneben ein
Prüflauf, nimmt er ihr die Ports, ihre Server enden sofort — und der Bericht
meldet **ABGERISSEN**, was wie ein Befund über den Rückbau aussieht.*
**Neunzehn Rückbauten sind so hintereinander falsch gemeldet worden.**

> **DIE ANTWORT DARAUF IST SCHON GEBAUT — UND SIE GREIFT ZUR HÄLFTE NICHT.**
> *0.21.0 hat `foreignServer()` angelegt (`counterproof.js:8927`): vor dem
> ersten Rückbau wird über `/proc` nachgesehen, ob noch fremde Server laufen,
> und der Lauf bricht ab statt zu warnen.* **Der Kommentar darüber sagt: „ein
> Prozess zählt als fremd, wenn sein Befehl auf server.js oder testbench.js
> endet."** *Der Ausdruck drei Zeilen darunter sagt etwas anderes:*
>
> ```js
> const script = parts.find(t => /(^|\/)(server|pruefung)\.js$/.test(t));
> ```
>
> **`pruefung.js` GIBT ES IN DIESEM REPOSITORY NICHT** — *weder heute noch in
> irgendeinem Stand, den dieses Repository trägt — und der Wächter steht laut
> seinem eigenen Kommentar seit 0.21.0 da.* **Gefahren und belegt:** *der Ausdruck
> trifft `server.js` und `/x/server.js`; auf `testbench.js` und
> `/home/user/kriterion-dev/testbench.js` antwortet er **false**.*
>
> **DAMIT FINDET DER WÄCHTER GENAU DEN FALL NICHT, FÜR DEN ES IHN GIBT:** *den
> nebenher laufenden Prüflauf.* **Verwaiste `node server.js` findet er; den
> `node testbench.js`, der ihnen die Ports nimmt, nicht.**

**DIE ZWEITE HÄLFTE IST GEBAUT UND IN ORDNUNG:** *`cleanUp()`
(`counterproof.js:8960`) greift über `processesUnder()` nach **Prozessnummer**
und nicht nach Namen — der `pkill` auf den Namen, der den Schaden ausgedehnt
hat, steht längst nicht mehr im Baum.* **Was im Fahrplan als „die Antwort wäre
klein" steht, ist also zur einen Hälfte da, zur anderen tippfehlerhaft.**

> **UND DER WÄCHTER KENNT EINE LÜCKE, DIE ER SELBST BENENNT** *(Kommentar bei
> `counterproof.js:8917`)*: **einen Server aus `node -e "require('./server.js')"`
> findet kein Muster über den Befehl.** *Genau so einer ist beim Bauen von
> 0.21.0 entstanden und eine Viertelstunde unbemerkt gelaufen.* **Ein Blick auf
> die PORTS fände ihn** — deshalb steht er als F7 in der Tafel und nicht als
> Selbstverständlichkeit im Bauabschnitt.

### 2 — das Wartefenster von zwölf Sekunden

**`testbench.js:451` wartet 120 × 100 ms auf `/api/config` und bricht dann mit
„Zweitserver nicht erreichbar" ab.** *Unter schwerer Nebenlast reicht das
nicht; beobachtet in 0.8.10 und 0.8.30, beide Male neben einem gleichzeitigen
Image-Bau.*

**ZWEI DINGE FEHLEN, UND DAS ZWEITE IST DAS TEURERE:** *das Fenster ist zu
klein — und die Meldung sagt **nicht**, welcher Zweitserver gemeint ist.* **Der
Lauf startet 76 Server; „Zweitserver nicht erreichbar" schickt auf eine Suche
durch alle.**

### 3 — ein abgebrochener Lauf lässt seine Server stehen

**AM 8. SEPTEMBER 2026 GESEHEN: sieben verwaiste Server, zweieinhalb Stunden
alt**, jeder mit seinem Wegwerfverzeichnis. *Der Wächter „Keine Prüflage lässt
ihren Server zurück" greift nur beim **ordentlichen** Ende — wer den Lauf mit
Strg-C anhält, lässt alles stehen, was gerade läuft.*

> **DIE GEGENPROBE HAT IHREN AUFRÄUMER SCHON** *(`foreignServer()`, Befund 1)*,
> **der PRÜFSTAND hat keinen.** *Er startet in ein belegtes Portfenster hinein
> und merkt es nicht: ein zweiter Server auf demselben Port fällt nicht von
> selbst auf, die Bereitschaftsprüfung bekommt ja eine Antwort* *(Stolperstein
> 139)*.

### 4 — der Lauf sagt nicht, wo die Zeit hingeht

**OHNE DIESE ZAHL IST JEDE BESCHLEUNIGUNG GERATEN.** *Deshalb steht sie hier,
und zwar frisch: am **12. September 2026** ist ein vollständiger Lauf mit einem
Zeitstempel je Gruppe gefahren worden — **von außen**, ohne eine einzige Zeile
im Baum zu ändern.*

> **446,8 SEKUNDEN · 329 GRUPPEN · 6662 von 6662 Prüfungen grün.** *Die Zahlen
> des Fahrplans (435 s, 304 Gruppen) stammen von 0.28.1 und sind überholt; die
> hier stehen für **0.29.0**, auf derselben Maschine gemessen.*

**ZWÖLF GRUPPEN VON 329 TRAGEN 210 SEKUNDEN — SIEBENUNDVIERZIG PROZENT DES
LAUFS:**

| Gruppe | Zeit | Anteil |
|---|---|---|
| **Der Mailversand: die Frist wird gemessen, nicht behauptet** | **48,3 s** | **10,8 %** |
| Die Anmeldebremse zählt auch den Namen | 27,2 s | 6,1 % |
| Der zweite Faktor: die Anmeldebremse greift am zweiten Schritt | 21,8 s | 4,9 % |
| **Der Sprachhelfer und die Ladung — 0.24.0** | **20,5 s** | **4,6 %** |
| Der Export in Teilen | 14,5 s | 3,3 % |
| Der Teilexport mit zweitem Faktor | 11,5 s | 2,6 % |
| Die zweite Bestätigung: die Bremse greift auch dahinter | 11,4 s | 2,5 % |
| Der Token: die Bremse greift vor der Anmeldung | 11,2 s | 2,5 % |
| Welcher Eintrag der Kette zählt | 11,0 s | 2,5 % |
| Ohne Proxy ist der Kopf nur eine Behauptung | 11,0 s | 2,5 % |
| Erstanmeldung: Anmeldesperre bleibt | 11,0 s | 2,5 % |
| Die Selbstanmeldung: die Bremse greift an beiden Routen | 10,7 s | 2,4 % |

**UND NACH THEMEN GEORDNET — dieselben wie in 0.28.1, nur größer:**

| Thema | Gruppen | Zeit |
|---|---|---|
| **Die Anmeldebremse** | 5 | **82,4 s** |
| **Die Mailfristen** | 13 | **61,8 s** |
| **Der zweite Faktor** | 16 | **45,0 s** |
| Der Export | 5 | 16,8 s |

**DER LANGE SCHWANZ IST KEIN PROBLEM, UND DIE BÄNDER SAGEN ES:**

| Band | Gruppen | Zeit zusammen |
|---|---|---|
| **10 s und mehr** | **12** | **210 s** |
| 5 bis 10 s | 4 | 26 s |
| 1 bis 5 s | 74 | 137 s |
| *unter 1 s* | *239* | *73 s* |

> **239 VON 329 GRUPPEN KOSTEN ZUSAMMEN 73 SEKUNDEN.** *Dort ist nichts zu
> holen, und wer dort sucht, sucht falsch.*
>
> **EINE GRUPPE IST NEU IN DER SPITZE UND STAND IN KEINER ALTEN AUSWERTUNG:**
> *„Der Sprachhelfer und die Ladung — 0.24.0" mit 20,5 Sekunden.* **Sie baut
> Dokumente und wartet auf keine Frist** — sie ist der Beleg dafür, dass der
> vierte Hebel *(das Grunddokument, F4)* nicht geraten ist.

**DASS DIESE MESSUNG VON AUSSEN GING, IST SELBST EIN BEFUND.** *Sie hat den
Baum nicht angefasst — sie hat nur die Ausgabe mitgestempelt.* **Was BA 4 baut,
ist also nicht die Möglichkeit, sondern die WIEDERHOLBARKEIT:** *eine Zahl, die
jeder Lauf selbst nennt, statt einer, die jemand von außen nachhält.*

**UND DER GRÖSSTE HEBEL IST NICHT DER LAUF, SONDERN DIE GEGENPROBE.** *Sie
fährt den **ganzen** Prüfstand **einmal je Rückbau**.* **Bei 447 s je Lauf
kostet eine Gegenprobe über acht Rückbauten auf vier Spuren eine Viertelstunde;
über die ganze Liste von 885 wäre sie tagelang.** *Jede Sekunde, die der Lauf
verliert, verliert sie so oft, wie Rückbauten gefahren werden — deshalb zahlt
sich diese Runde nicht einmal aus, sondern bei jeder folgenden.*

### 5 — greift der Lauf bei jedem Push wirklich?

**EIN PAPIER, DAS ZWISCHEN ZWEI RUNDEN OHNE LAUF GEÄNDERT WIRD, KANN DEN
PRÜFSTAND ROT MACHEN, OHNE DASS ES JEMAND BEMERKT** *(Sammelblatt, 0.12.3)*.
*Der Sprachwächter sieht auch die Dokumente an; ein Merge in
`Fehler_und_Ideen.md` nach 0.12.2 brachte ein deutsches Wort herein, der Zweig
war danach rot, und niemand hat es gesehen.*

> **DAS IST EIN NACHSEHEN UND KEIN BAUEN.** *Der Lauf bei jedem Push gibt es
> seit 0.8.10; `.github/workflows/pruefstand.yml` hängt heute an `push:` **ohne
> Zweigfilter** und zusätzlich an `workflow_dispatch`.* **Nach dem Papier müsste
> er also gegriffen haben** — und dann war es nicht die Einrichtung, sondern der
> Blick. *Der Punkt wird geprüft, bevor daraus eine neue Regel wird* **(F8)**.

**EINE ZWEITE SACHE HÄNGT DARAN, UND SIE IST NEU SEIT DEM 10. SEPTEMBER 2026:**
*das Repository ist nur noch **um einen Push herum** öffentlich.* **Ein Lauf,
der startet, während es schon wieder privat ist, verbraucht Minuten aus dem
Kontingent — oder startet gar nicht.** *Das gehört in dieselbe Nachschau.*

### 6 — die Tagzeile am Telefon *(Bild 1)*

**DER BETREIBER, 12. SEPTEMBER 2026:** *„ich möchte das das ‚und' und ‚Oder'
kleiner unter dem tag kateogier überschrift sind und zwar kleiner. tag soll
grundsätzlich wenn man filter aufklappt zu sehen sein. … danach soll rechts
davon die tags aufgelistet werden und rechte ende dann das mehr button. wenn
das mit einer zeile nicht klappt dann bitte 2 zeilig machen."*

**DREI SACHEN STEHEN DARIN, UND SIE SIND VERSCHIEDEN GROSS:**

| | was | Größe |
|---|---|---|
| **a** | **und/Oder kleiner und UNTER die Beschriftung** | zwei Rasterzuweisungen und zwei Schriftmaße |
| **b** | **Die Tagzeile steht offen, wenn die Filter offen sind** | **eine Zeile** — `MORE_FILTERS_OPEN === null ? f.tagIds.length > 0 : …` *(`public/app.js:3887`)* |
| **c** | **Wolke daneben, „mehr" am rechten Ende** | *steht seit 0.13.0 schon so* — **nichts zu tun** |

> **c IST GEBAUT, UND DAS GEHÖRT GESAGT.** *Die Verweise stehen seit 0.13.0
> hinter der Wolke und mit 0.29.0 in der dritten Rasterspalte
> (`frow-right-end`).* **Was der Betreiber am Bild sieht, ist nicht ihre
> Reihenfolge, sondern dass „und/Oder" ihnen die erste Zeile wegnimmt** — *der
> Umschalter spannt heute über Spalte 2, und die Wolke fängt darunter an.*

### 7 — der Bewertungskasten nimmt zu viel Platz, sobald es einen zweiten Zugang gibt *(Bilder 2 und 3)*

**DER BETREIBER HAT MIT ZWEI INSTALLATIONEN GEPRÜFT** *(12. September 2026)*:
*„bei einem user ist die anordnung der sterne gut aber bei mehr user nimmt es
durch den umbruch in der kopfzeile und in den sternenzeile viel zu viel platz.
Wer hat bewertet ist viel zu lang und muss doch kürzer werden damit es zusammen
mit Titel, gewichtet und wer hat bewertet in einer zeile passt und auch die
sterne nicht umgebrochen werden."*

**ZWEI URSACHEN, BEIDE AN DER BEDINGUNG „mehr als ein Zugang" — UND SIE SIND
VERSCHIEDEN GROSS:**

| | Ursache | Stelle | gemessen |
|---|---|---|---|
| **Kopfzeile** | **Der Knopf steht nur bei mehreren Zugängen da** und misst 159 px. **Zusammen mit „⌀ 4,5 gewichtet" (99 px) passt die Zeile nicht** — ohne das Wort „gewichtet" passt sie | `public/app.js:5733` | **81 px statt 42** |
| **Sternzeile** | **Bei mehreren Zugängen bekommt die Liste eine vierte Spalte** *(der Durchschnitt)*. Am Telefon spannt der Name dann über die ganze Breite, die Sterne rücken darunter | `public/style.css:4351` | **82 px je Kriterium**, 491 px für sechs |

> **DIE KOPFZEILE IST DIE KLEINERE VON BEIDEN, und sie ist ganz gelöst, sobald
> der Knopf unter 127 Pixel kommt** *(F11)*. **Die Sternzeile ist die größere:
> sie trägt 491 der 580 Pixel des Kastens.**
>
> **UND DIE ZWEITE URSACHE IST EINE BEWUSSTE ENTSCHEIDUNG** *(Projektstand 5.3,
> Stilblattkommentar bei `public/style.css:4346`)*: **am Telefon bekommt der
> Name des Kriteriums die ganze Breite.** *Der erste Entwurf dieses Auftrags
> wollte sie zurücknehmen.* **Die Messung hat das widerlegt: zurückgenommen
> wächst der Kasten von 580 auf 607 Pixel und die Seite rollt seitlich.**
>
> **DIE ENTSCHEIDUNG BLEIBT ALSO, UND GEBAUT WIRD ETWAS ANDERES: weniger Luft
> in derselben Bauform.** *Zweiundzwanzig der 82 Pixel je Kriterium sind
> Innenabstand, und die Zeilenhöhe des Namens steht auf 21,6 px bei einer
> Schrift von 13,95.* **Gemessen bringt das 49 Pixel, wenn nur der Fall mit der
> vierten Spalte angefasst wird, und 97, wenn jede Bewertungszeile enger wird**
> *(F12)* — **beides mehr als die Kopfzeile und die Umbenennung zusammen.**

**UND DER EINZIGE ZUGANG IST DIE REFERENZ, NICHT DER AUSNAHMEFALL.** *Was der
Betreiber „gut" nennt, ist der Kasten OHNE vierte Spalte und ohne Knopf — 387
statt 580 px.* **Das Ziel dieser Runde ist, dass der zweite Zugang ihn nicht
mehr aufbläht.** *Nach C1a und dem kürzeren Knopf misst er 531 px statt 580, nach
C1 deren 483 — und die Kopfzeile fällt von 81 auf 42, sobald „gewichtet"
dasteht.*

### 8 — das Fälligkeitsdatum sieht aus wie ein Zeitstempel *(Bild 4)*

**DER BETREIBER, 12. SEPTEMBER 2026:** *„Datum feld muss farblich zum todo
zugeordnet werden können. passend zum status. ob fertig, oder noch offen. so
sieht es aus als ob das einfach nur ein datumstempel von dem erstellungstag oder
so. man wird es nicht beachten!"*

**ER HAT RECHT, UND DAS STILBLATT SAGT ES SELBST** *(`public/style.css:1924`)*:

```css
.cmt-due    { font-size: .76rem; color: var(--muted); }
.cmt-due.on { color: var(--text); font-family: var(--mono); }
```

**EIN GESETZTES DATUM STEHT IN DER GEWÖHNLICHEN TEXTFARBE** — *und zwei
Elemente weiter rechts steht in derselben Zeile das **Erstellungsdatum** des
Kommentars (`cmt-when`).* **Zwei Daten nebeneinander, und keines sagt, welches
welches ist.**

> **DIE FARBE GIBT ES SCHON, NUR AN DER FALSCHEN STELLE.** *0.29.0 hat für die
> Ansicht „Offen" `.open-section.overdue { color: var(--red) }` angelegt — die
> Überschrift **über** der Liste ist rot, die Zeile **in** der Liste nicht, und
> im Eintrag selbst gibt es gar keine Auskunft.*
>
> **DIE EINTEILUNG DARF NUR EINMAL GERECHNET WERDEN** *(Stolperstein 47)*.
> *`todayKey` und `dueOf()` liegen heute **innerhalb** von `renderOpen()`
> (`public/app.js:4802` und `:4814`) und sind von dort aus nirgends zu
> erreichen.* **Sie wandern nach oben, und beide Orte fragen dieselbe
> Funktion** — *eine zweite Einteilung neben der ersten wäre genau die zweite
> Wahrheit, gegen die diese Regel steht.*

**UND EIN ZWEITES STECKT DARIN, DAS NICHT IM BILD IST:** *das Datum steht
überhaupt nur an einer **offenen** Aufgabe.* **Wer abhakt, sieht es nicht mehr**
— *die Spalte behält es, der Bildschirm zeigt es nicht* (`public/app.js:7956`,
die Bedingung ist `kind === 'task'`). **Der Betreiber verlangt ausdrücklich
„ob fertig, oder noch offen"** *(F13)*.

### 9 — die Vokabelkarte steht am Telefon einspaltig

**DER BETREIBER, mitten in der Fragerunde:** *„ich bemerke das du vokabular
vergrößert hast.. hmm. war das vorher nicht besser mit einer zeile mit 2
spalten?"* **Und kurz darauf, nach dem Nachsehen:** *„vielleicht halt in der
28er aber ich habe es jetzt bemerkt."*

**ER HAT RECHT MIT DEM NACHSATZ, UND DIE HERKUNFT IST BELEGT:** *die Regel
`.vocabulary-grid { grid-template-columns: 1fr; }` steht in der Behälterabfrage
`@container (max-width: 420px)` (`public/style.css:3456`) und kommt aus
**`dcef9dc`, 7. September 2026** — „Bauabschnitt 6.1: die sechs Tabellen (F1)".*
**Sie ist 0.28.x und nicht 0.29.0.** *Der Kommentar daneben sagt, warum:*
„Zwei Spalten Formularfelder auf 320 Pixeln sind zwei zu schmale Spalten."

> **DIE MESSUNG BESTÄTIGT DIE BEOBACHTUNG UND WIDERLEGT DEN VORSCHLAG.** *Die
> Karte ist wirklich zu hoch — 1139 px bei 390 Breite. Zwei Spalten halbieren
> sie auf 701 px und brechen dabei **jede** der vierzehn Beschriftungen um, zwei
> davon dreizeilig.* **Einspaltig brechen zwei von vierzehn.**
>
> **ES GIBT EINEN DRITTEN WEG, und er steht nicht im Vorschlag:** *nicht die
> SPALTEN, sondern die **Zeilenhöhe** — Beschriftung und Feld in eine Zeile
> statt übereinander.* **Gemessen ist er nicht, und deshalb steht er hier als
> Vorschlag und nicht als Zahl** *(F14)*.

### 10 — „gewichtet" steht fest im Quelltext

**GEFUNDEN BEIM VERMESSEN VON BEFUND 7**, in derselben Kopfzeile:

```js
b.textContent = '⌀ ' + number(averageValue, 1) + (weightedCalc ? ' gewichtet' : '');
```

*`public/app.js:7020`.* **Das Wort kommt aus keiner Sprachdatei** — *gesucht
wurde in allen dreien nach einem Schlüssel mit dem Wert „gewichtet",
„weighted" und „ağırlıklı": keiner.* **In einer englisch oder türkisch
eingestellten Instanz steht dort deutscher Text.**

> **DERSELBE FUND WIE ZWEIMAL VORHER, UND DAS IST DER PUNKT.** *0.24.3 hat zwei
> festsitzende deutsche Wörter gefunden, 0.28.1 zwei weitere (`label="Allgemein"`
> und `label="Verlauf"`, seither `list.sortGroupGeneral` und
> `list.sortGroupHistory`).* **Dies ist das fünfte.**
>
> **KEIN WÄCHTER KONNTE ES FINDEN, und auch das gehört dazu:** *die Restprobe
> vergleicht die **Sprachdatei** gegen eine Urfassung; `SCREEN_BAN` liest die
> Texte, die im Modul stehen; der Bezeichnerwächter liest **Namen** und keine
> Werte.* **Ein fester deutscher Satz im Quelltext fällt durch alle drei
> Maschen.** *Was dagegen hilft, ist eine Zusage — und die steht unten.*

> **DER FAHRPLAN IST AN DIESER STELLE VERALTET.** *0.31.0 Gruppe 6 nennt
> `label="Allgemein"` und `label="Verlauf"` als offen; beide sind mit 0.28.1
> gebaut.* **Das Papier wird in dieser Runde berichtigt** — *ein Plan, der eine
> erledigte Sache als offen führt, ist eine zweite Wahrheit über den eigenen
> Stand.*

---

## Die Bauabschnitte — und was dabei WEGFÄLLT

| | was | was fällt |
|---|---|---|
| **BA 1** | **Der Wächter erkennt den Prüflauf** *(Befund 1)* — `pruefung.js` → `testbench.js`, und dazu ein Blick auf die Portbasen *(F7)* | *nichts fällt.* **Ein Kommentar wird zur Wahrheit, statt sie zu behaupten** |
| **BA 2** | **Das Wartefenster und die Meldung** *(Befund 2)* — größeres Fenster, und der Server steht mit Namen in der Meldung | *nichts fällt* |
| **BA 3** | **Der Aufräumer beim Start** *(Befund 3)* — der Prüfstand findet, was ein abgebrochener Lauf liegen gelassen hat | *nichts fällt* |
| **BA 4** | **Die Zeitmessung** *(Befund 4)* — eine Schlusstafel mit den zehn teuersten Gruppen, die Zeit je Gruppe auf Schalter *(F5)*. **DIESER ABSCHNITT KOMMT ZUERST** | *nichts fällt.* **Und er liefert die Zahl, an der BA 5 gemessen wird** *(F6)* |
| **BA 5** | **Die vier Hebel** *(Befund 4)* — die Bremse an der Funktion *(F3)*, die Fristen und die Kostenstufe aus dem Prüfschalter *(F1, F2)*, ein Grunddokument für `jsdom` *(F4)* | **Keine Zusage fällt.** *Sechs Gruppen der Anmeldebremse werden UMGEBAUT und decken danach jeden Zählerstand ab statt sechs* |
| **BA 6** | **Die Nachschau am Lauf bei jedem Push** *(Befund 5)* — **kein Code, ein Beleg** *(F8)* | **Ein Sammelblattpunkt fällt** *(Regel 2)*, **wenn die Nachschau ihn erledigt** |
| **BA 7** | **Die Tagzeile** *(Befund 6)* — und/Oder klein unter die Beschriftung, Wolke daneben, die Zeile steht beim Aufklappen offen *(F9, F10)* | **Der Umschalter „Tags" fällt**, und mit ihm `list.tagsCount` in **drei** Sprachen *(F9)*. *`list.tags` bleibt — die Zeile trägt weiter ihre Beschriftung* |
| **BA 8** | **Der Bewertungskasten** *(Befund 7)* — kürzerer Knopf *(F11)* und **weniger Luft in der Sternzeile** *(F12)* | *nichts fällt.* **Die Regel `.rlist:not(.no-average)` im schmalen Abschnitt BLEIBT** — *die Messung hat den ersten Entwurf dieses Auftrags widerlegt, und Projektstand 5.3 behält recht.* **`entry.whoRated` behält seinen Schlüssel und wechselt seinen Wortlaut, in drei Sprachen** |
| **BA 9** | **„gewichtet" kommt aus dem Wörterbuch** *(Befund 10)* — ein Schlüssel in drei Sprachen *(F15)* | *nichts fällt.* **Die Sprachdateien stehen danach wieder auf 1346** — einer weniger, einer mehr, beide namentlich |
| **BA 10** | **Das Fälligkeitsdatum bekommt Farbe** *(Befund 8)* — vier Zustände, und `dueOf()` wandert nach oben *(F13)* | *nichts fällt.* **Aber `todayKey` und `dueOf()` verlassen `renderOpen()`** — *eine zweite Einteilung daneben wäre Stolperstein 47* |
| **BA 11** | **Die Vokabelkarte** *(Befund 9)* — **der dritte Weg: Beschriftung und Feld in EINE Zeile** *(F14)* | *nichts fällt.* **Die Behälterabfrage von `dcef9dc` bleibt stehen** — zwei Spalten sind und bleiben zwei zu schmale Spalten |

> **DAS SCHEMA WIRD NICHT ANGEFASST.** *Keine Spalte, kein Index, kein
> Migrationsblock.* **Das Austauschformat bleibt 16, die Migrationsblöcke
> bleiben zwölf, `F_ROUTES` bleibt 73.**
>
> **UND BA 4 STEHT AUS EINEM GRUND VOR BA 5:** *„Ohne diese Zahl ist jede
> Beschleunigung geraten" steht seit dem 8. September im Fahrplan.* **Wer den
> Hebel vor der Waage baut, weiß hinterher nicht, ob er gewirkt hat.**

---

## Die Nummer und ihre Begründung

**0.30.0 IST MINOR — Regel 5.1 —, UND DER GRUND IST EINE EINZIGE ENTSCHEIDUNG**
*(F1 und F2)*. *Eine Instanz, die ihre Mailfristen und ihre Kostenstufe aus
einem Schalter nehmen kann, **kann etwas, was sie vorher nicht konnte**. Das ist
eine Funktion und keine Reparatur.*

> **UND WEIL EINE EINZIGE ZEILE DIE RUNDE HEBT, STEHT SIE ALS EIGENE FRAGE IN
> DER TAFEL** *(F16)* — *nicht als Fußnote ans Ende.* **Fallen F1 UND F2 auf
> „nein", ist alles Übrige Werkzeug und Reparatur: dann heißt die Runde 0.29.1
> und ist PATCH.**

**DIE FÜNF BEFUNDE AUS DEM BETRIEB HEBEN SIE NICHT WEITER.** *Sie sind
Reparaturen und fahren mit, weil der Betreiber keine eigene Runde dafür wollte
(12. September 2026).* **Der Fahrplan rückt nicht:** *0.31.0 bleibt „Die
Sprachen werden gegengelesen", 0.33.0 bleibt der Bruch.*

> **EIN BEFUND GEHÖRTE NACH TOPF IN EINE ANDERE RUNDE, und er fährt trotzdem
> hier:** *„gewichtet" (Befund 10) ist Sprachsache und damit 0.31.0.* **Er
> fährt hier, weil BA 8 genau diese Kopfzeile in der Hand hat** — *und ein
> bekannter Fehler, den man in einer Zeile stehenlässt, die man gerade umbaut,
> kommt teurer wieder* **(F15)**.

---

## Der Prüfstand — was er halten muss

**Jede Zusage benannt, jede neue mit GEFAHRENER Gegenprobe, fortlaufend
nummeriert ab 895.** *Ein STUMM ist ein Fund und kein Versehen — und eine
Gegenprobe, die den Lauf ABREISST, belegt nichts.*

### Zur Geschwindigkeit

| | Zusage | Gegenprobe zielt auf |
|---|---|---|
| **1** | **Der Wächter erkennt einen laufenden `node testbench.js`** — an einem **echt gestarteten** Prozess gefahren, nicht am Ausdruck gelesen | den alten Namen zurücksetzen |
| **2** | **Und er erkennt einen Server, der auf einer Portbasis horcht, ohne dass sein Befehl ihn verrät** *(F7)* | den Portblick entfernen |
| **3** | **Das Wartefenster ist größer als zwölf Sekunden, und die Meldung nennt den Server** | den Namen aus der Meldung nehmen |
| **4** | **Der Prüfstand räumt beim Start auf, was ein früherer Lauf liegen gelassen hat** — an einem **echt hinterlassenen** Server gefahren | den Aufräumer überspringen |
| **5** | **Die Schlusstafel nennt die zehn teuersten Gruppen und die Gesamtzeit** | die Tafel leer lassen |
| **6** | **`delay()` liefert für JEDEN Zählerstand den Wert der Kurve** — an der reinen Funktion, null Millisekunden | die Formel verbiegen |
| **7** | **Und die Route wartet wirklich** — **einmal**, am laufenden Server gefahren | das Warten aus der Route nehmen |
| **8** | **Die Auslieferung trägt `N = 16384`** — festgenagelt | sie senken |
| **9** | **Die Kostenstufe lässt sich NUR über den Prüfschalter senken, nicht über eine gewöhnliche Umgebungsvariable** *(F1)* | die Klammer entfernen |
| **10** | **Die Auslieferung trägt 20 s · 7 s · 7 s** — alle drei festgenagelt | eine senken |
| **11** | **Kurz gestellt wirken die Fristen auf dieselbe Verdrahtung** — am laufenden Server gefahren | eine Frist ins Leere stellen |
| **12** | **Die Zahl der Prüfgruppen ist nicht kleiner als vor dieser Runde** — **329**, gemessen am 12. September 2026, und die Zahl steht in der Zusage | eine Gruppe stillschweigend fallen lassen |

> **ZUSAGE 12 IST DIE AUFLAGE DES BETREIBERS, IN EINER ZEILE.** *„Keine Prüfung
> fällt weg" lässt sich behaupten; eine Zahl, die nicht sinken darf, lässt sich
> nicht behaupten.* **Und sie ist billiger als jede Namensliste: eine Gruppe,
> die verschwindet, senkt sie sofort.**

### Zur Oberfläche

| | Zusage | Gegenprobe zielt auf |
|---|---|---|
| **13** | **Die Tagzeile steht beim Aufklappen der Filter offen** — **gefahren** und nicht am Markup gelesen | die alte Bedingung zurücksetzen |
| **14** | **„und/Oder" steht UNTER der Beschriftung** — die Oberkanten gemessen, nicht die Regel gelesen | es wieder daneben setzen |
| **15** | **Die Tagzeile misst am Telefon weniger als vor dieser Runde** — die Zahl steht in der Zusage | nur die Schrift verkleinern |
| **16** | **`list.tagsCount` steht in keiner der drei Sprachdateien mehr, und kein Aufruf sucht ihn** | den Satz stehen lassen |
| **17** | **Die Kopfzeile misst EINE Zeile — mit zwei Zugängen UND mit dem Wort „gewichtet" daneben** — an zwei Zugängen und mit gesetzten Gewichten gefahren | nur ohne „gewichtet" messen |
| **18** | **Und der Kasten misst mit zwei Zugängen weniger als vor dieser Runde** — die Zahl steht in der Zusage | nur die Kopfzeile messen |
| **19** | **Der Name eines Kriteriums bricht nicht um, und die Seite rollt nicht seitlich** — beides an sechs Kriterien gemessen | die Spalten nebeneinander setzen |
| **20** | **„gewichtet" kommt aus der Sprachdatei, in allen drei Sprachen** | den festen Text zurückschreiben |
| **21** | **KEIN deutscher Bildschirmsatz sitzt mehr fest in `public/app.js`** — eine **neue Wache**, die Werte liest und nicht Namen | sie an einem bekannten Wort vorbeischauen lassen |
| **22** | **Der Eintrag und die Ansicht „Offen" fragen DIESELBE Funktion** — eine einzige `dueOf()` | eine zweite Einteilung danebenstellen |
| **23** | **Vier Zustände, vier Farben** — überfällig · heute · später · erledigt, an vier Aufgaben gefahren | zwei Zustände gleich färben |
| **24** | **Eine ERLEDIGTE Aufgabe zeigt ihr Datum** und kennzeichnet es als erledigt | es wieder verschwinden lassen |
| **25** | **Die Vokabelkarte misst am Telefon weniger als vor dieser Runde** | die Zeilenhöhe unverändert lassen |
| **26** | **Und am Schreibtisch ändert sich an keinem der vier Kästen etwas** — beide Breiten geprüft | eine Regel global setzen |

> **ZUSAGE 21 IST DIE EIGENTLICHE ANTWORT AUF BEFUND 10.** *Den Schlüssel
> nachzutragen repariert **einen** Satz; eine Wache, die WERTE liest statt
> NAMEN, fängt den nächsten.* **Fünf solche Funde in sechs Runden sind kein
> Zufall, sondern eine Lücke** — *und eine Lücke schließt man mit einem Wächter
> und nicht mit einem Eintrag.*
>
> **ACHT ZUSAGEN WERDEN AM LAUFENDEN SERVER ODER AN EINEM ECHTEN PROZESS
> GEFAHREN UND NICHT AM QUELLTEXT** — *1, 4, 7, 11, 13, 17, 19, 23.* **Eine Zusage,
> die nur das Markup ansieht, bliebe grün, wenn die Regel dasteht und nichts
> tut.** *Das ist die Lehre aus 0.28.1, wo genau diese Bauform den Sortierfehler
> gefunden hat — und aus 0.29.0, wo sie einen Fehler in der Gruppierung fand,
> den kein Blick auf den Quelltext gezeigt hätte.*

---

## Der Augenschein

| | Lage |
|---|---|
| **1** | **Die Filter am Telefon aufklappen** — steht die Tagzeile schon offen, und misst sie zwei Zeilen? |
| **2** | **Zwei Tags wählen** — steht „und/Oder" klein unter „TAGS", die Wolke daneben, „mehr" rechts außen? |
| **3** | Einen **Eintrag mit mehreren Zugängen** ansehen — steht die Kopfzeile auf EINER Zeile? |
| **4** | Dieselbe Instanz **mit einem einzigen Zugang** — sieht sie aus wie vorher? *(bei C1a: ja, unverändert; bei C1: enger — die Antwort auf F12 sagt, welches gilt)* |
| **5** | Die Instanz auf **Türkisch** stellen und den Bewertungskasten ansehen — steht dort noch ein deutsches Wort? |
| **6** | Eine Aufgabe **auf gestern**, eine **auf heute**, eine **auf morgen**, eine **abhaken** — vier verschiedene Farben? |
| **7** | Die **Vokabelkarte am Telefon** — kürzer als vorher, und bricht keine Beschriftung mehr um? |
| **8** | `npm test` fahren — **steht die Schlusstafel da, und wie lange hat er gebraucht?** |
| **9** | Einen Lauf mit **Strg-C** anhalten und sofort einen zweiten starten — **räumt er auf?** |
| **10** | Einen Lauf starten und **daneben** die Gegenprobe — **bricht sie mit einer verständlichen Meldung ab?** |

> **DIE LETZTEN DREI SIND NEU, UND SIE SIND DER PUNKT.** *Bisher stand im
> Augenschein nur, was man SIEHT; diese Runde baut zur Hälfte an etwas, das
> niemand sieht.* **Also wird es gefahren.**

---

## Was ausdrücklich NICHT gebaut wird

| | warum |
|---|---|
| **Den Prüflauf parallel fahren** | *das ist genau der Portstreit, an dem die Gegenprobe schon einmal neunzehn Rückbauten hintereinander falsch gemeldet hat* |
| **Ein echter Teillauf** | *`testbench.js` ist EIN langer Ablauf — der Namensfilter kann nur die Ausgabe einschränken, nicht die Arbeit.* **Der echte Teillauf IST die Aufteilung in Module, und die steht auf 0.34.0** |
| **Die Aufteilung von `testbench.js`** | *sie zöge Prüfgruppen mit um, die die Bereinigung auf 0.33.0 kurz darauf löscht* |
| **Die zweizeilige Sternzeile umkehren** | *gemessen: der Kasten wächst von 580 auf **607 px**, die Namensspalte fällt auf 54, jeder Name bricht fünfzeilig um, und die Seite ROLLT seitlich.* **Projektstand 5.3 behält recht** *(F12)* |
| **Zwei Spalten in der Vokabelkarte** | *gemessen: sie halbieren die Höhe und brechen **jede** der vierzehn Beschriftungen um* **(F14)** |
| **Der Selbsttest als Datei im Baum** | *er wäre die neunzehnte Datei im Fingerprint und damit selbst etwas, das geprüft werden muss* **(F17)** |
| **„Stimmen" als Wort am Bildschirm** | *`SCREEN_BAN` sperrt es seit 0.22.0 — „ein Wort, das das Wörterbuch ersetzt hat"* **(F11)** |
| **Eine Uhrzeit am Fälligkeitsdatum** | *eine Genauigkeit, die niemand pflegt, wird zur zweiten Wahrheit* — **steht seit 0.29.0 hier** |
| **`@name` in Kommentaren, Berichten und Aufgaben** | *am 12. September 2026 vom Betreiber bestellt, **mitten in dieser Runde** — und er hat den Platz selbst genannt: **0.32.0**.* **Er steht dort seit demselben Tag ausgearbeitet im Fahrplan** *(„Der Ruf beim Namen")* — mit der einen Frage, die vor dem Bruch fallen muss: *ob der Ruf eine Spalte braucht* |
| **Ein Wecker für fällige Aufgaben** | *die Glocke trägt einen Zeitstempel und keine Tabelle* — **steht seit 0.29.0 hier** |
| **Die sieben übrigen deutschen `id`** | *Punkt 25 des Sammelblatts — ein Befund über den Wächter und keiner dieser Runde* |
| **Das Zurückspielen einer Sicherung über die Oberfläche** | *zurückspielen heißt die laufende Datenbank ersetzen, und das ist eine Runde für sich* |

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.30.0.md` | **neu** — *mit der gemessenen Laufzeit vorher und nachher* |
| `Doku/Projektstand_Kriterion_0_30_0.md` | `git mv`, **Revision 83** — *und Abschnitt 5.3 wird **berichtigt**, nicht gelöscht* |
| `Doku/Fahrplan.md` | 0.30.0 durchgestrichen. **ZWEI BERICHTIGUNGEN SIND SCHON EINGETRAGEN, weil ein Plan, der Erledigtes als offen führt, eine zweite Wahrheit über den eigenen Stand ist:** *0.31.0 Gruppe 6* (die beiden Wörter sind seit 0.28.1 gebaut) und die 0.28.1-Zahlen bei 0.30.0. **Und 0.32.0 ist am 12.9.2026 belegt worden** — „Der Ruf beim Namen", vom Betreiber bestellt |
| `Doku/Fehler_und_Ideen.md` | **drei Punkte fallen** *(Regel 2)* — das Wartefenster, das Papier zwischen zwei Runden *(wenn F8 es erledigt)*, und die Verwechslung von Abriss und Störung |
| `Doku/Auftrag_0.29.0.md` | **fällt mit diesem Auftrag** — es liegt immer nur einer im Repo |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
| `README.md` | **ja** — *der Prüfschalter und seine Grenzen, und der Satz „ein Papier ist Prüfstoff"* |

---

## WIE DER NÄCHSTE AUFTRAG AUSZUSEHEN HAT

> **Ab 0.25.0 trägt jeder Auftrag diesen Abschnitt.** *Er beschreibt die FORM,
> nicht den Inhalt.*

**Am Kopf**

1. **Ein Absatz „was in dieser Runde passiert"**, mit dem Wortlaut des
   Betreibers, wenn der Befund aus dem Feld kommt.
2. **Der Fingerprint des Vorgängers**, aus **zwei** Quellen bestätigt — und aus
   **drei**, sobald die laufende Installation gemeldet hat. *Fehlt eine, steht
   das dort als offener Punkt und nicht als Fußnote.*
3. **Die Fragetafel** mit einer Spalte „Vorschlag von Claude". **Die Spalte ist
   ein Vorschlag und keine Antwort.** *Gebaut wird erst, wenn jede Frage
   beantwortet und im Papier eingetragen ist — **VOR der ersten Zeile**.*

**Im Rumpf**

4. **Der Befund**, in nummerierten Teilen, jeder mit der Stelle im Quelltext
   oder einer **Messung am laufenden Gerät**. *Vermutungen werden als solche
   benannt.* **UND EINE MESSUNG AM EMULIERTEN GERÄT IST KEINE AM ECHTEN:**
   *0.28.0 hat auf einem emulierten Android gemessen und daraus geschlossen,
   die aufgeklappte Auswahlliste erbe die Schrift des Feldes. Das echte Gerät
   hat es widerlegt.* **Wo das Betriebssystem zeichnet, entscheidet nur das
   Gerät.**
5. **UND EIN VORSCHLAG DES BETREIBERS WIRD GEMESSEN WIE JEDER ANDERE.** *In
   0.28.1 hat eine Messung seinen Vorschlag zum Kategoriekasten bestätigt und
   Claudes eigenen widerlegt.* **In 0.30.0 hat sie seine Beobachtung zur
   Vokabelkarte bestätigt — sie IST zu hoch — und seinen Vorschlag widerlegt:
   zwei Spalten brechen jede der vierzehn Beschriftungen um.** *Beides gehört
   in dasselbe Papier, und zwar mit den Zahlen.*
6. **Die Bauabschnitte**, und darin ausdrücklich: **was WEGFÄLLT** — Sätze der
   Sprachdateien namentlich, Wege mit ihrer `F_ROUTES`-Zahl, Zusagen des
   Prüfstands mit Begründung.
7. **Die Nummer und ihre Begründung** nach Regel 5.1. *Eine Datenbankstufe oder
   eine Funktion ist mindestens MINOR; eine Reparatur ist PATCH.* **Und wenn
   eine einzige Zeile die Runde von PATCH auf MINOR hebt, gehört das als eigene
   Frage in die Fragetafel** — nicht als Fußnote ans Ende.

**Am Fuß**

8. **Der Prüfstand:** jede Zusage benannt, jede neue mit **gefahrener**
   Gegenprobe, fortlaufend nummeriert. **Ein STUMM ist ein Fund und kein
   Versehen.** *Und eine Gegenprobe, die den Lauf ABREISST, belegt nichts —
   sie muss so greifen, dass die Oberfläche danach noch läuft.* **JEDER GRIFF
   IN EINEN NACHBAU WIRD GEKLAMMERT.** **UND EIN RÜCKBAU, DESSEN SUCHTEXT NICHT
   MEHR DASTEHT, IST EIN FUND ÜBER DIE LISTE:** *in 0.29.0 sind fünf davon
   aufgefallen, vier wurden nachgezogen und einer neu gezielt.*
9. **Der Augenschein**, wenn der Befund am Bildschirm entstanden ist — **und
   ein GEFAHRENER Handgriff, wenn er es nicht ist.** *Wer an einem Werkzeug
   baut, sieht ihm nicht beim Laufen zu, sondern bricht es absichtlich ab.*
10. **Was ausdrücklich NICHT gebaut wird.**
11. **Die Papierliste** — Änderungsprotokoll, Projektstand (`git mv`,
    Revision), Fahrplan, Sammelblatt, CHANGELOG, README, `package.json`,
    `package-lock.json`.
12. **Dieser Abschnitt selbst.**

**Und die stehenden Regeln, die keine Runde neu verhandelt**

* **GEBAUT UND GEPRÜFT WIRD ÖRTLICH, GEPUSHT WIRD AUF ANSAGE.**
* **KEIN WIRTSNAME, KEINE ADRESSE, KEINE MAILADRESSE DES BETREIBERS IN EINEM
  PAPIER.** **Was er schickt, wird mit seinen ZAHLEN zitiert und nicht mit
  seiner Herkunft.**
* **DER FINGERPRINT WIRD VOR DEM EINSPIELEN GERECHNET** und steht im
  Änderungsprotokoll. *Er deckt `node_modules` NICHT ab.* **Und er hängt an
  jeder Datei der Liste — auch an einem Kommentar.**
* **DIE NUMMER GEHÖRT ANS ENDE DER RUNDE — aber der Code darf nicht vorher
  hinaus.**
* **EINE OBERFLÄCHE SAGT, WAS IST — NICHT, WARUM ES SO GEBAUT WURDE**
  (Projektstand 5.6).
* **KEINE ZWEITE WAHRHEIT.** Eine Aussage, zwei Orte — Stolperstein 47. **Und
  ein Plan, der eine erledigte Sache als offen führt, ist eine zweite Wahrheit
  über den eigenen Stand.**
* **EIN FELD OHNE LESER BLEIBT NICHT STEHEN**, und eine Regel ohne Träger auch
  nicht. **Und ein Ausdruck, der einen Namen sucht, den es nicht gibt, ist
  derselbe Fall:** *`pruefung.js` steht seit 0.21.0 in einem Wächter und hat dort nie etwas
  getroffen.*
* **EINE ZUSAGE LIEST IHREN GEGENSTAND UND NICHT DEN ABSATZ DARÜBER.** *In
  0.30.0 hat genau das einen Fehler gefunden, den der Kommentar ZWEI ZEILEN
  darüber bereits richtig beschrieb.*
* **UND SIE FÄHRT DIE SACHE, STATT SIE ZU LESEN, wo das möglich ist.**
* **EIN WÄCHTER, DER NAMEN LIEST, FINDET KEINE WERTE.** *Fünf festsitzende
  deutsche Sätze in sechs Runden sind keine fünf Versehen, sondern eine Masche
  im Netz.*
