# Auftrag 0.30.1 — „Was der Rundlauf mit 0.30.0 gefunden hat" *(Arbeitstitel)*

**IN SAMMLUNG · angelegt am 12. September 2026 · sieben Befunde bisher ·
gebaut auf 0.30.0 (`2363b00a`).**

> **DIESES PAPIER IST NICHT VOLLSTÄNDIG, UND ES WIRD NICHTS DAVON GEBAUT.**
> *Der Betreiber prüft die eingespielte 0.30.0 noch am Gerät.* **Er hat es so
> angesagt:** *„notier das, ich teste da noch etwas. wenn ich dann was neues
> finde schicke ich dir eine nachricht mit den neuen befunde sonst meld ich mich
> ok das waren alle dann machst du die papiere fertig. also warte noch etwas."*
>
> **WAS HIER STEHT, IST DIE MITSCHRIFT UND KEINE ZUORDNUNG.** *Die Fragetafel
> entsteht erst, wenn die Sammlung geschlossen ist — Auflage 2 des Fahrplans:
> jede Runde hat einen Auftrag, und der Auftrag stellt seine Fragen, bevor die
> erste Zeile entsteht.*

---

## Warum PATCH und warum keine Nummer aus dem Fahrplan

**Der Betreiber hat die Nummer am 12. September 2026 gesetzt:** *„okm, dann
30.01."* **Das ist die Regel des Fahrplans und keine Ausnahme von ihr:**

> **Ein Befund aus dem Rundlauf ist eine Reparatur, und eine Reparatur hängt an
> ihrer Runde.**

*Sie ist achtmal gemessen — fünfmal von 0.24.1 bis 0.24.5, dann 0.25.1 und
0.25.2, und mit 0.28.1 ein achtes Mal über acht Befunde vom Gerät.* **Der Fahrplan rückt dadurch
nicht: 0.31.0 bleibt die Sprachdurchsicht, 0.32.0 bleibt der Ruf beim Namen,
und der Bruch bleibt auf 0.33.0.**

**Kein Schemaanteil**, keine neue Spalte, kein Migrationsblock — nach heutigem
Stand der Sammlung.

---

## Die Befunde, in der Reihenfolge, in der sie hereinkamen

### Befund 1 — „Inhalt bis" ist kein schöner Text

**Art: Verbesserung** *(Wortlaut)* · **Bild 1, die Kachel „Sicherungen"**

> **Der Betreiber wörtlich:** *„da ist noch das einfachste ‚inhalt bis xxx'. ist
> kein schöner text. Da reicht ‚Stand von xxx' fertig."*

**Was dasteht:** `card.checkUntil` — deutsch **„Inhalt bis"**, englisch
**„Content up to"**, türkisch **„İçerik şu tarihe kadar"**
*(`public/languages/*.json:90`)*. Gesetzt wird er an einer einzigen Stelle,
`public/app.js:12894`, hinter den Zahlen einer geprüften Sicherung:
*„Einträge 15 · Fotos 92 · Benutzer 1 · **Inhalt bis** 08.09.2026, 12:26"*.

**Was daraus folgt:** ein Schlüssel, drei Dateien. Deutsch steht fest —
**„Stand von"**. *Englisch und Türkisch stehen nicht fest und gehören auf die
Fragetafel; „Stand von" ist eine Hausstimme-Entscheidung, und die trifft der
Betreiber.*

> **BERÜHRUNG MIT 0.31.0:** dieser Schlüssel gehört zur Sorte, die dort in
> Gruppe 3 durchgegangen wird. **Er ist hier entschieden und damit dort
> erledigt** — nicht doppelt aufmachen.

---

### Befund 2 — Die Tagzeile: die erste Zeile bleibt leer, der Umschalter steht unten

**Art: Design** · **Bild 2, die Übersicht am Telefon** · *betrifft unmittelbar,
was BA 7 in 0.30.0 gebaut hat*

> **Der Betreiber wörtlich:** *„bitte tag in korrekter ausrichtung in die erste
> zeile und und/oder schaltfläche bitte unmittalbar in die erste zeile unter
> tags. dann wäre es 2der 2. Und Tags können glaube ich eine bis zwei stufen
> kleiner als die anderen damit mehr rein paast da auch deutlich mehr von denen
> gibt, natürlich sollten sie noch lesbar sein."*

**Was dasteht:** `.frow-tags` ist seit 0.30.0 ein Zweispalter mit zwei Zeilen
*(`public/style.css:4086–4093`)* — **„TAGS"** in Spalte 1 Zeile 1, der
Umschalter **und/oder** (`.tagmode`) in Spalte 1 **Zeile 2**, die Wolke
(`.pills.cloud`) und das rechte Ende über beide Zeilen. *Auf dem Bild steht der
Umschalter dadurch am **unteren** Ende der Wolke, weil die Wolke die Höhe
bestimmt.*

**Drei Sachen, und die dritte ist die einträglichste:**

| | |
|---|---|
| **1** | **Die Marken sollen in der ersten Zeile anfangen** und dort richtig ausgerichtet stehen |
| **2** | **Der Umschalter und/oder gehört unmittelbar unter „TAGS"** — also in die erste Zeile, nicht ans untere Ende der Wolke |
| **3** | **Die Marken dürfen ein bis zwei Stufen kleiner sein als die übrigen Pillen** *(Kategorien)* — es gibt deutlich mehr von ihnen, und so passen mehr hinein. **Grenze: lesbar müssen sie bleiben** |

> **EINE STELLE IST UNKLAR UND WIRD NACHGEFRAGT:** *„dann wäre es 2der 2."*
> **Das wird nicht geraten.** *(siehe „Was nachgefragt werden muss")*

---

### Befund 3 — Der Wochentag frisst Platz, den das Telefon nicht hat

**Art: Design** · **Bild 3, die Testtage im Eintrag**

> **Der Betreiber wörtlich:** *„Also im mobil ansicht einfach das wochentag
> nicht anzeigen. nimmt zu viel platz weg. wir können auch die regeln aufstellen
> wenn für den kein platz da ist (im gegensatz zu einem ultra und max phone oder
> tablet) fällt der raus."*

**Was dasteht:** `weekday(day)` *(`public/app.js:224`)* setzt den ausgeschriebenen
Wochentag in `.tweek` *(`public/app.js:7443`)*, und `.tweek` steht in jeder
Testtagzeile zwischen Datum und Marken *(`public/style.css:1686`)*. **Auf dem
Bild sind das „Dienstag", „Sonntag", „Mittwoch" — und sie kosten die Breite, an
der die Zeile umbricht.**

**Was daraus folgt:** die **Regel**, nicht das Gerät. *Das Haus fragt keine
Gerätenamen ab; es fragt die Breite — `@container`, so wie die Vokabelkarte in
0.30.0.* **Ist der Platz da, bleibt der Wochentag; ist er es nicht, fällt er
weg.** *Auf einem Ultra, einem Max oder einem Tablet steht er damit weiter da,
ohne dass irgendwo ein Gerätename im Quelltext steht.*

---

### Befund 4 — Die Testtagzeile ordnet sich nicht nach dem, was in ihr steht

**Art: Design** · **Bild 3, dieselben Zeilen**

> **Der Betreiber wörtlich:** *„wenn die tage keine tags haben, rechts von datum
> und rechts ausgerichtet. Haben Tage datum und sie passen nicht in eine reihe
> dann rutschen die sterne wie im untersten beispiel in die 2. zeile und erste
> zeile ist dann nur datum die tags. und sind mehr tags das die nicht in einer
> reihe dargestellt werden können dann rechts ein mehr button anbieten, oder auf
> dem handy rollbar machen."*

**Was dasteht:** `.trow` ist ein Flexkasten aus Datum (`.tdate`), Wochentag
(`.tweek`), Markenkasten (`.ttags`, `flex: 1`), Sternen und Papierkorb; schmal
bekommt er `flex-wrap: wrap` *(`public/style.css:4465`)*. **Der Markenkasten
nimmt sich die ganze übrige Breite — auch dann, wenn gar keine Marke darin
steht.** *Deshalb rutschen die Sterne im untersten Beispiel des Bildes
(31.12.2025, keine Marken) in die zweite Zeile und stehen dort links, obwohl
neben dem Datum die halbe Zeile frei ist.*

**Drei Fälle, und sie sind eine Rangfolge:**

| | Fall | Soll |
|---|---|---|
| **1** | **Der Tag hat keine Marken** | **Sterne rechts vom Datum und rechtsbündig** — eine Zeile, kein Umbruch |
| **2** | **Der Tag hat Marken, und Datum + Marken + Sterne passen nicht in eine Zeile** | **Die Sterne rutschen in die zweite Zeile** *(wie im untersten Beispiel)*, die erste trägt dann **nur Datum und Marken** |
| **3** | **Es sind so viele Marken, dass sie nicht in eine Zeile passen** | **Rechts ein Knopf „mehr"** — *oder* am Telefon **rollbar** |

> **FALL 3 TRÄGT EIN ODER, UND DAS IST EINE ENTSCHEIDUNG UND KEINE
> Geschmacksfrage.** *Ein Knopf „mehr" ist eine zweite Bedienung an einer Zeile,
> die schon zwei hat (Marke abräumen, Marke anlegen); rollbar ist keine
> Bedienung, versteckt aber, dass da noch etwas ist.* **Sie gehört auf die
> Fragetafel.**

---

### Befund 5 — Die Kriterienzeile passt immer noch nicht, jetzt an der anderen Stelle

**Art: Design** · **Bild 1 und Bild 2, zwei Installationen** · *unmittelbare
Fortsetzung von Befund 7 aus 0.30.0 (BA 8)*

> **Der Betreiber wörtlich:** *„Wieder fast das gleiche Problem, jetzt ist die
> Kopfzeile nicht mehr gebrochen aber die Sternzeile schon. Bild1: bei ein user
> betrieb ist die sternzeile nicht umgebrochen und sieht gut aus da genug platz
> für alles ist aber schau Bild2 ist mehruserbetrieb und dort ist nicht die
> zeile umgebrochen sondern das kriterium. Ich finde die sterne können kleiner
> werden damit etwas mehr platz entsteht."*

**Die Kopfzeile ist erledigt** — *„BEWERTUNG · ø 4,7 gewichtet · Wer?" steht auf
Bild 1 in einer Zeile, 42 statt 81 Pixel.* **Das war BA 8, und es hält.**

**Was jetzt dasteht — zwei Fassungen, und beide stehen auf je einem Bild:**

| | Fassung | was auf dem Bild passiert |
|---|---|---|
| **`.rlist.no-average`** *(ein einziger Zugang, keine Durchschnittsspalte)* | drei Spalten, **alles in EINER Zeile**; der Name darf umbrechen *(`public/style.css:4393`)* | **der NAME bricht — mitten im Wort:** „2_Verarbeitungsqualitä / t_de" |
| **`.rlist:not(.no-average)`** *(mehrere Zugänge, mit Durchschnittsspalte)* | seit 0.21.0 **zweizeilig**: Name über die ganze Breite, darunter Sterne, ø und Rückstellung *(`public/style.css:4419–4423`)* | **die ZEILE bricht** — der Name allein oben, die Sterne darunter |

> **DIE BEIDEN BILDER SIND IN DER BESCHREIBUNG VERTAUSCHT, und das steht hier,
> damit es beim Bauen nicht zum Fehler wird:** *Bild 1 zeigt je Kriterium ein
> **ø 5,0** — das ist der **Mehrzugangsfall**. Bild 2 zeigt keins — das ist der
> **Einzelzugang**.* **An den Beobachtungen ändert das nichts:** beide stimmen,
> jede an ihrem Bild. *Nur die Zuordnung „ein user"/„mehruser" ist umgekehrt.*

**Der Vorschlag des Betreibers ist EINER für beide Fassungen: kleinere Sterne.**
*Heute steht `.star` auf `1.2rem`, schmal auf `1.25rem` mit `padding: 3px 4px`
und `gap: 3px` — die Sternspalte ist damit an einer Handbreite eines der
breitesten Stücke der Zeile* *(`public/style.css:1401`, `3648–3650`)*.

> **UND DAMIT RÜHRT ER AN DIE MESSUNG AUS 0.30.0.** *F12 hat den schmalen
> Dreispalter verworfen, weil er den Kasten GRÖSSER machte — der Name fiel auf
> 54 Pixel und brach fünfzeilig um. **Der Grund dafür war die Breite der
> übrigen Spalten**, und genau die greift dieser Vorschlag an.*
>
> **WIRD DIE STERNSPALTE SCHMAL GENUG, KIPPT F12 MÖGLICHERWEISE** — und dann
> wäre die zweizeilige Sternzeile aus Projektstand 5.3 nicht mehr nötig.
> **Das wird gemessen und nicht geraten**, so wie die Vokabelkarte in BA 11:
> mehrere Größen, dieselben Daten, dasselbe Gerät, und die Zahlen entscheiden.

---

### Befund 6 — Der Zähler frisst die Namensspalte in der Kriterienkarte

**Art: Design** · **Bild 3, die Kriterienkarte in den Einstellungen**

> **Der Betreiber wörtlich:** *„Wir verlieren so viel Platz um Einträge zu
> schreiben. bei Mobil reicht doch einfach 3x, 10x oder 0x zu schreiben. Wir
> haben einfach den platz dafür nicht. bei Desktop und Tablet sieht das
> natürlich anders aus da wir platz hätten."*

**Was dasteht:** jede Zeile einer Verwaltungsliste trägt ihren Zähler in
`.mcount`, und der lautet standardmäßig `${usage_count} ${vThing(usage_count)}`
*(`public/app.js:9838`)* — also **„10 Einträge_de"**, **„1 Eintrag_de"**,
**„0 Einträge_de"**. **Auf Bild 3 kostet das die Namensspalte:** von den sieben
Kriterien sind fünf abgeschnitten — *„1_O…", „2_V…", „3_Fu…", „Test2…",
„6_Tes…", „7_tes…"*. **Der Name ist das Einzige, woran man die Zeile erkennt.**

**Soll:** schmal nur die Zahl mit einem Zeichen daneben — **„10×", „1×", „0×"**.
**Breit bleibt der ausgeschriebene Satz**, denn dort ist der Platz da. *Wieder
die Breite und nicht der Gerätename — `@container`, wie bei Befund 3.*

**Drei Sachen hängen daran, und keine davon ist beim Bauen zu entscheiden:**

| | |
|---|---|
| **1** | **`.mcount` gehört nicht der Kriterienkarte allein.** *Dieselbe Zeile zeichnet Kategorien, Tags, den Papierkorb und die Zugänge.* **Nur die Kriterien — oder alle?** |
| **2** | **Die Tagkarte hat einen EIGENEN Zähler mit ZWEI Zahlen** *(`public/app.js:9621`)* — „10 Einträge_de · 3 Testtage_de". **Wie kürzt der?** |
| **3** | **Das `×` steht in derselben Zeile schon zweimal:** vor dem Gewichtsfeld *(„× 1,2")* und als Löschknopf am rechten Ende. **„10×" wäre das dritte** — und das mittlere heißt „mal", das rechte „weg" |

---

### Befund 7 — Das Fälligkeitsdatum trägt die Farbe der Frist, nicht die des Zustands

**Art: Verbesserung** · **Bild 1, die Kommentarliste am Eintrag** · *unmittelbare
Fortsetzung von BA 10 aus 0.30.0*

> **Der Betreiber wörtlich:** *„das wenn der datum überschritten wird und das
> datum dann rot wird ist gut. das meinte ich in dem moment nicht aber das ist
> eine gute umsetzung. was mir aber vorschwebte ist wenn ein auftrag angelegt
> ist, und es gibt ein datum für die aufgabe dann muss auch das datum in farbe
> des arts sein. Blau bei unerledigten aufgabe. rot wenn das datum überschritten
> ist, ist super. auch wenn es erledigt gesetzt wird. solange das datum nicht
> editiert worden ist und ein neuen datum angelegt ist und das bestehende datum
> immer noch überschritten ist, ist es rot. wenn aber ein nicht überschrittene
> aufgabe auf fertig gesetzt wird, muss das datum auch mit grün werden. Datum
> soll jederzeit editierbar sein und zwar von dem ersteller oder von dem
> admin."*

**WAS 0.30.0 GEBAUT HAT, IST NICHT FALSCH — es beantwortet eine andere Frage.**
*BA 10 färbt nach der **Frist**: überschritten rot, heute fett, später gedämpft,
erledigt durchgestrichen* *(`public/style.css:1941–1944`, `dueOf()` in
`public/app.js:1782`)*. **Der Betreiber will, dass es zusätzlich nach dem
**Zustand** färbt — und das ist der Unterschied zwischen „wie dringend" und
„woran bin ich".**

> **DAS HAUS HAT DIESE ZWEI FARBEN BEREITS, UND ZWAR FÜR GENAU DIESE SACHE.**
>
> | | blau | grün |
> |---|---|---|
> | **die Kante des Kommentars** | `.cmt.task` | `.cmt.done` |
> | **die Marke „ToDo"** | `.mark.task.on` | `.mark.task.on.done` |
> | **das Datum** | **— fehlt** | **— fehlt** |
>
> *Im Stylesheet steht dazu schon der Satz, der den Befund begründet:* **„Ein
> Bedienelement zeigt den Zustand, den es verändert."** *(`public/style.css:3068`)*
> **Das Datum ist die dritte Stelle derselben Aufgabe und die einzige, die nicht
> mitmacht.** *Es ist also kein neuer Farbton und keine neue Regel — es ist eine
> vorhandene Regel, die eine Stelle auslässt.*

**Die Tafel, die daraus folgt:**

| Aufgabe | Datum | Farbe | steht heute |
|---|---|---|---|
| **offen** | in der Zukunft | **blau** *(`--blue`)* | gedämpft |
| **offen** | überschritten | **rot** | **rot ✓** |
| **erledigt** | überschritten und unverändert | **rot — bleibt rot** | durchgestrichen, gedämpft |
| **erledigt** | nicht überschritten | **grün** *(`--green`)* | durchgestrichen, gedämpft |

> **DIE DRITTE ZEILE IST DIE EIGENTLICHE ÄNDERUNG.** *Heute schlägt „erledigt"
> jede Frist: sobald die Aufgabe fertig ist, wird das Datum gedämpft und
> durchgestrichen, ganz gleich ob es gehalten wurde oder nicht.* **Der Betreiber
> will das Gegenteil: erledigt ändert die Farbe nur dann, wenn die Frist auch
> gehalten wurde.** *„Zu spät fertig" bleibt sichtbar zu spät.*

**EINE HÄLFTE DES BEFUNDS IST SCHON GEBAUT.** *„Datum soll jederzeit editierbar
sein und zwar von dem Ersteller oder von dem Admin" — genau so steht es da:*
`const manage = mine || ADMIN` *(`public/app.js:7914`)*, **und der Datumsknopf
hängt an `manage`.** *Bleibt ein Rest, und der ist eine Frage: der Knopf steht
nur bei `task || (done && c.dueDate)` — **einer erledigten Aufgabe ohne Datum
lässt sich damit keines mehr geben.***

> **NOCH EIN PUNKT AUS DEMSELBEN BILD, UND ER IST SCHON VERBUCHT:** *der obere
> Kommentar („dieser text bei ‚Datenbank' muss kürzer und normaler werden nicht
> so nerdig") ist der Erklärbärsaft aus `card.storeCaveat`.* **Er steht seit dem
> 11. September 2026 als Gruppe 5 in 0.31.0 und wird hier nicht doppelt
> aufgemacht.**

---

## Was nachgefragt werden muss, bevor die Fragetafel entsteht

| | Stelle | Warum es nicht geraten wird |
|---|---|---|
| **1** | **„dann wäre es 2der 2"** *(Befund 2)* | Der Satz steht zwischen den beiden Bitten und dem Vorschlag zur Schriftgröße. **Er kann „beide zusammen ergeben zwei Zeilen statt zwei" heißen, „zwei von zwei erledigt" — oder etwas Drittes.** *Ein geratener Satz wird zu einer gebauten Zeile, und die steht dann falsch da* |
| **2** | **„Haben Tage datum und sie passen nicht in eine reihe"** *(Befund 4, Fall 2)* | **Gelesen als „haben Tage MARKEN"** — sonst wäre der Fall derselbe wie Fall 1, und die beiden Sätze widersprächen sich. **Die Lesart ist plausibel, aber sie ist eine Lesart** |
| **3** | **Englisch und Türkisch zu „Stand von"** *(Befund 1)* | Der Wortlaut ist eine Entscheidung des Hauses, und sie fällt in allen drei Dateien zugleich |
| **4** | **„mehr" oder rollbar** *(Befund 4, Fall 3)* | Der Betreiber hat beides genannt und keins ausgeschlossen |
| **5** | **Wie viel kleiner werden die Sterne?** *(Befund 5)* | **Wird gemessen, nicht gefragt** — und die Messung beantwortet zugleich, **ob F12 aus 0.30.0 kippt.** *Vorgelegt wird eine Tafel wie bei der Vokabelkarte, entschieden wird danach* |
| **6** | **Nur die Kriterienkarte oder jede Liste mit `.mcount`?** *(Befund 6)* | Kategorien, Tags, Papierkorb und Zugänge zeichnen dieselbe Zeile |
| **7** | **Wie kürzt der Zähler der Tagkarte?** *(Befund 6)* | Er trägt zwei Zahlen und nicht eine |
| **8** | **Welches Zeichen steht neben der Zahl?** *(Befund 6)* | „10×" wäre das **dritte** `×` in derselben Zeile, und die drei hießen dann „mal", „mal" und „weg" |
| **9** | **Was wird aus „heute"?** *(Befund 7)* | 0.30.0 hat vier Fristzustände gebaut; **„heute" hat der Betreiber nicht genannt.** *Blau wie „später" — oder bleibt er eigen, weil „heute" etwas anderes sagt als „irgendwann"?* |
| **10** | **Bleibt der Durchstrich am erledigten Datum?** *(Befund 7)* | Farbe nach Zustand und Durchstrich schließen einander nicht aus. **Der Augenschein von 0.30.0 hat den Durchstrich ausdrücklich festgehalten** — wer ihn wegnimmt, nimmt einen belegten Zustand weg |
| **11** | **Soll eine erledigte Aufgabe OHNE Datum noch eines bekommen können?** *(Befund 7)* | „jederzeit editierbar" gilt heute für jedes vorhandene Datum, aber der Knopf fehlt, wo keines steht |

---

## Wie es weitergeht

1. **Der Betreiber prüft weiter.** *Kommt etwas, kommt es als Nachricht und
   wandert hier unten an.*
2. **Sagt er „das waren alle", wird dieses Papier fertiggeschrieben:** die vier
   Fragen oben werden zur **Fragetafel**, jede bekommt einen Vorschlag, und
   **Regel 11 gilt wie in den vier Runden davor — gebaut wird erst, wenn jede
   Antwort im Papier steht.**
3. **Erst dann** entstehen Bauabschnitte, Prüfungen und Gegenproben.

> **DREI DER SIEBEN BEFUNDE STEHEN AN GENAU DEN STELLEN, DIE 0.30.0 ZULETZT
> ANGEFASST HAT** — *die Tagzeile aus BA 7 (Befund 2), der Bewertungskasten aus
> BA 8 (Befund 5) und das Fälligkeitsdatum aus BA 10 (Befund 7)*. **Das ist kein Rückschlag, sondern der Rundlauf, wie er
> gedacht ist:** *gebaut, eingespielt, am Gerät angesehen, nachgebessert.*
>
> **BEFUND 5 IST DABEI DER LEHRREICHSTE DER SECHS.** *0.30.0 hat die Kopfzeile
> geheilt und dabei gemessen, dass an der Sternzeile nichts zu machen sei (F12).
> Der Betreiber sieht jetzt dieselbe Zeile am Gerät und schlägt etwas vor, das
> in der Messung gar nicht vorkam — die Breite der Sterne selbst.* **Eine
> Messung beantwortet die Frage, die man ihr stellt, und keine andere.**
