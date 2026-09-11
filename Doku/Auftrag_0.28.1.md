# Auftrag 0.28.1 — „Was 0.28.0 nur halb erledigt hat"

**Acht Befunde vom laufenden Gerät · geschrieben am 11. September 2026 ·
gebaut auf 0.28.0.**

---

## Was in dieser Runde passiert

**0.28.0 IST EINGESPIELT, UND DER BETREIBER HAT ES BEDIENT.** *Das ist die
Quelle dieser Runde: nicht eine Durchsicht, nicht ein Papier, sondern sechs
Aufnahmen vom Telefon und vom Schreibtisch, am 11. September 2026.*

**DIE KOPFZEILE HAT BESTANDEN.** *Betreiber, 11. September 2026:* „Erstmal den
header über den eintrag und auch über den user/adminpanel find ich gut", und
„ins übersicht mit dem pfeil links von logo ist gut."

**EIN VERSPRECHEN AUS 0.28.0 HAT NICHT GEHALTEN, und das ist der schwerste
Punkt dieser Runde.** *Das Änderungsprotokoll 0.28.0 sagt: „Gemessen auf
Android mit Chrome, und dort erbt die aufgeklappte Liste die Schriftgröße des
Feldes."* **Das ist falsch.** *Die Aufnahme vom Gerät zeigt Chrome auf Android
mit einem eigenen Systemdialog — Radioknöpfe, Systemschrift, unverändert hoch.*
**Betreiber:** „die liste ist genauso hoch wie vorher. die schriftart muss hier
kleiner werden. so sieht das komisch aus. immer noch das gesamte display."

**DAS FELD IST KLEINER GEWORDEN, DIE LISTE NICHT.** *Der ursprüngliche Befund
vom 11. September ist damit zur Hälfte erledigt, und diese Runde holt die
andere Hälfte — auf einem anderen Weg.*

---

## Der Fingerprint des Vorgängers

| Quelle | Wert |
|---|---|
| **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`8b205f42`** |
| **Am Arbeitsbaum nachgerechnet** *(dieselben achtzehn Dateien)* | **`8b205f42`** |
| **Aus der laufenden Installation gemeldet** *(Betreiber, 11. September 2026)* | **`8b205f42`** |

> **DREI QUELLEN, EIN WERT.** *Der offene Punkt aus dem Änderungsprotokoll
> 0.28.0 ist damit geschlossen: das Eingespielte ist auf das Byte dasselbe wie
> das Gebaute.* **Zum zweiten Mal in dieser Reihe liegt die Bestätigung aus dem
> Feld vor, bevor die nächste Runde anfängt.**

**Der Vorgänger im Überblick:** 0.28.0 · **6570 Prüfungen** · **844
Rückbauten** · `F_ROUTES` = **72** · lesende Routen **31** · Austauschformat
**15** · **elf** Migrationsblöcke · **neunzehn** Karten · **16**
Fensterabfragen und **zwei** Behälterabfragen.

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

> **VIER FRAGEN SIND SCHON BEANTWORTET** *(Betreiber, 11. September 2026, im
> Rundlauf nach dem Einspielen)*. **Die übrigen stehen offen.**

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F1** | **Die Sortierliste am Telefon — wie kürzen?** *Gegen den Systemdialog hilft kein Stilblatt* | **Die Richtung wird ein eigener Umschalter.** *Die Liste nennt nur noch WONACH sortiert wird; aus 13 Einträgen werden sieben, aus 17 Zeilen elf* | **Wie vorgeschlagen** *(11.9.2026)* |
| **F2** | **Wohin mit den Blätterpfeilen?** *Sie flankieren heute die MARKE und nicht den Eintrag* | *Claude empfahl: als Paar in der Kopfzeile, ohne zu flankieren* | **NICHT wie vorgeschlagen: ans ENDE des Eintrags, breit und mit Wort** *(11.9.2026)*. **Die Kopfzeile verliert das Blättern ganz** |
| **F3** | **Das Suchfeld am Telefon in den Unteransichten** | *Claude empfahl: eine Lupe statt des Feldes, damit der eine Griff aus 0.28.0 bleibt* | **NICHT wie vorgeschlagen: am Telefon ganz weg** *(11.9.2026)*. **Der Weg zur Suche ist dort wieder zwei Griffe, und das ist der Preis für 54 Pixel** |
| **F4** | **Die Filterreihen** | *Claude schlug querrollende Reihen vor* | **Erst messen, dann vorschlagen** *(11.9.2026)*. **Die Messung liegt vor — Befund 8 —, die Entscheidung steht aus: siehe F10** | |
| **F5** | **Bekommt „Titel" eine zweite Richtung?** *Heute gibt es nur A → Z. Ein Richtungsumschalter, der bei einem Eintrag nichts tut, ist ein Sonderfall* | **Ja, Z → A dazu.** *Ein Umschalter, der für alle sieben gilt, ist einfacher als einer mit einer Ausnahme.* **ABER: das ist eine FUNKTION**, und nach Regel 5.1 wäre die Runde damit MINOR statt PATCH — siehe F11 | |
| **F6** | **Tragen die Pfeile am Fuß den TITEL des Nachbarn?** *„‹ Voriger" oder „‹ Bosch Serie 6 Waschmaschine"* | **Nur das Wort, nicht den Titel.** *Der Titel des Nachbarn steht in `state.items` und wäre zu haben — aber er ist beim Direkteinstieg nicht da, und dann stünde dort mal ein Name und mal keiner.* **Ein Knopf, der manchmal etwas anderes sagt, ist zwei Knöpfe** | |
| **F7** | **Fällt die Suche im Systembereich auf BEIDEN Geräten?** | **Ja, auf beiden.** *Der Betreiber hat es für Desktop und Telefon gesagt, und der Grund gilt auf beiden: das Feld verspricht dort, Einstellungen zu suchen, und springt in den Bestand* | |
| **F8** | **Wie klein werden die Sterne am Telefon?** *Heute `1.45rem` (21,75 px) plus `5px 4px` Polsterung — rund 50 px je Kriterienzeile* | **`1.25rem` (18,75 px) und `3px 4px`.** *Rund 40 px je Zeile statt 50; bei sieben Kriterien siebzig Pixel weniger.* **Nicht auf das Zeigermaß (`1.2rem`, ohne Polsterung):** ein Stern ist ein ZIEL und kein Zeichen — man tippt darauf | |
| **F9** | **Wie klappt die Abschnittsliste im Systembereich ein?** | **Wie der Filterschalter der Übersicht** — *ein Knopf darüber, der den Namen des offenen Abschnitts trägt.* **Dieselbe Bauform, kein zweites Muster** | |
| **F10** | **Die Filterreihen — welcher Hebel?** *Gemessen: der Kasten misst 378 px, davon **90 px Beschriftungen** und **69 px Abstände**; die erste Kachel beginnt bei y = 590 von 844* | **Zwei Hebel, keiner davon die Pillen:** *(a) die Reihen rollen quer statt umzubrechen — die Kategoriereihe fällt von 77 auf 35 px; (b) die Beschriftung rückt NEBEN die Reihe statt darüber — fünfmal 18 px.* **Zusammen rund 130 px.** *Die Pillen bleiben bei 35 px: kleiner wird am Finger schwierig, und sie sind nicht das Problem* | |
| **F11** | **Die Nummer: 0.28.1 als PATCH?** | **Hängt an F5.** *Sieben der acht Befunde sind Reparaturen — das ist ein PATCH.* **Kommt „Titel Z → A" dazu, ist es nach Regel 5.1 eine Funktion.** *Zwei ehrliche Wege: `Titel` behält seine eine Richtung und die Runde bleibt **0.28.1**, oder die Richtung gilt für alle sieben und die Runde heißt **0.29.0** — dann rückt der Fahrplan, denn 0.29.0 ist vergeben* | |
| **F12** | **Die tote Regel `.back` im Telefonblock** *(`style.css:4026`)* | **Fällt mit.** *`.back` ist in 0.28.0 gefallen; diese eine Zeile im Telefonabschnitt ist stehengeblieben und trifft nichts mehr.* **Eine Regel ohne Träger bleibt nicht stehen** | |

---

## Der Befund

### 1 — die Sortierliste ist am Telefon unverändert hoch

**GEMESSEN AM GERÄT DES BETREIBERS** *(Android, Samsung S21G, Chrome,
11. September 2026)*. **Chrome auf Android zeichnet die aufgeklappte Auswahl
als eigenen Systemdialog** — Radioknöpfe, Systemschrift, eigene Zeilenhöhe.
*Die `font-size` des Feldes erreicht ihn nicht.*

**WAS 0.28.0 GEBRACHT HAT UND WAS NICHT:**

| | vorher | nachher |
|---|---|---|
| **Das Feld** in der Filterreihe | 16 px Schrift, rund 45 px hoch | **12,45 px, 37 px hoch** ✓ |
| **Die aufgeklappte Liste** | Systemschrift | **Systemschrift — unverändert** ✗ |

**GEGEN DEN DIALOG HILFT KEIN STILBLATT. Was hilft, ist ihn kürzer zu machen.**
*Heute stehen dort **13 Einträge in vier Gruppen** (`public/app.js:4000`), und
fast jeder steht doppelt — einmal je Richtung:*

```
Allgemein   Zuletzt geändert (neu → alt) · (alt → neu) · Titel (A → Z)
Bewertung   hoch → niedrig · niedrig → hoch
Potenzial   hoch → niedrig · niedrig → hoch
Verlauf     Testtage ×2 · Schnitt ×2 · Letzte Note ×2
```

**NIMMT MAN DIE RICHTUNG HERAUS, bleiben sieben:** *Zuletzt geändert, Titel,
Bewertung, Potenzial, Testtage, Schnitt, Letzte Note.* **Mit den vier
Gruppenüberschriften sind das elf Zeilen statt siebzehn** — *und der Dialog
gehört weiter dem System.*

### 2 — das Suchfeld im Systembereich verspricht das Falsche

> **BETREIBER, 11. September 2026:** *„Im bereich admin/user cp brauchen wir
> kein suchleiste. man würde annehmen wenn man da sucht sucht man im adminpanel
> nach funktionen etc. eher da raus."*

**Er hat recht, und es ist keine Geschmacksfrage.** *Ein Suchfeld über den
Einstellungen sagt: „hier werden Einstellungen gesucht". Es springt aber in die
Übersicht und sucht im Bestand.* **Eine Oberfläche sagt, was ist**
(Projektstand 5.6) — *und dieses Feld sagt etwas anderes.*

**DIE ANDEREN DREI UNTERANSICHTEN SIND NICHT BETROFFEN:** *Eintrag, offene
Aufgaben und Vergleich handeln vom Bestand, und dort meint das Feld, was es
zeigt.*

### 3 — das Suchfeld kostet am Telefon eine ganze Zeile

**GEMESSEN** *(390 px, `pointer: coarse`)*: **die Kopfzeile im Eintrag misst
123 px mit Suchfeld und 69 px ohne** — *das Feld selbst ist 47 px hoch, mit
seinem Abstand kostet es **54 Pixel**.*

> **DER BETREIBER NIMMT DEN PREIS IN KAUF:** *„bei mobil lassen wir im eintrag
> die suchleiste auch weg. das ist hier auch viel platz."*
>
> **DAS NIMMT ZURÜCK, WAS 0.28.0 GEBRACHT HAT** — *der Weg vom Eintrag zur
> Suche ist am Telefon wieder zwei Griffe: zurück, dann ins Feld.* **Das steht
> hier als bewusste Entscheidung und nicht als Versehen.** *Claude hat eine
> Lupe statt des Feldes vorgeschlagen (ein Griff, keine Zeile); der Betreiber
> hat sich dagegen entschieden.*

### 4 — die Blätterpfeile flankieren die falsche Sache

**Zwei Pfeile links und rechts von etwas sagen: „wir blättern das hier
dazwischen".** *Dazwischen steht der Name der **Installation**.* **Geblättert
werden aber die Einträge.**

> **BETREIBER:** *„aber eintrag blättern pfeile da weis ich nicht. was hältst du
> den wenn wir die von da neben dem status machen. dann etwas breiter?"*

**ENTSCHIEDEN: ans ENDE des Eintrags, breit und mit Wort.** *Dort ist man, wenn
man weiterblättern will.* **Die Kopfzeile verliert das Blättern ganz** — *und
damit auch die Einrahmung, die den Eindruck erzeugt hat.*

*Der Preis, benannt: wer früher wechseln will als am Ende, muss erst ans Ende
scrollen.*

### 5 — die Sterne nehmen am Telefon zu viel Platz

> **BETREIBER:** *„die sterne könnten auch etwas filigraner werden. auch die
> nehmen recht viel platz weg."*

**NACHGERECHNET** *(`style.css:3471`, `:3473`, `:1403`)*:

| | am Zeiger | am Finger |
|---|---|---|
| `.star` | `1.2rem` · **18 px** | `1.45rem` · **21,75 px** |
| Polsterung je Stern | keine | `5px 4px` |
| `.rrow > *` | `9px 0` | `9px 0` |
| **je Kriterienzeile** | rund 36 px | **rund 50 px** |

**BEI SIEBEN KRITERIEN SIND DAS 350 PIXEL** — *und die Aufnahme des Betreibers
zeigt genau das: sieben Zeilen füllen den Schirm.*

### 6 — die Abschnittsliste im Systembereich klappt nicht ein

> **BETREIBER:** *„Menü muss aufklappbar sein. ähnlich wie das filter."*

**GEMESSEN** *(390 px)*: **die Reiterliste misst 241 px bei fünf Abschnitten,
und die erste Karte beginnt bei y = 480 von 844** — ***57 % des Schirms sind
Bedienung, bevor die erste Auskunft dasteht.***

*Die Übersicht hat für genau diesen Fall seit 0.22.0 den Filterschalter: ein
Knopf, der sagt, was dahintersteckt.* **Der Systembereich hat ihn nicht.**

### 7 — der Favoritenstern sitzt am Telefon nicht bündig rechts

> **BETREIBER:** *„der stern ist nicht an der rechten seite sondern irgendwie
> links vom rechten seite. sind ungeordnet aus."*

**GEMESSEN, und die Ursache ist gefunden:**

| | Breite |
|---|---|
| `.detail` *(die Spalte)* | **366 px** |
| `.title-head` *(die Titelzeile darin)* | **278 px** |
| **Fehlbetrag** | **88 px** |

**DER STERN STEHT BÜNDIG RECHTS — IN EINER ZEILE, DIE ZU KURZ IST.**

**DIE URSACHE IST EIN WERT, DER DIE BAUFORM WECHSELT:** *`.detail` trägt
`align-items: start` (`style.css:1144`). Im RASTER heißt das „Spalten oben
ausrichten" und ist richtig. Am Telefon wird `.detail` zu
`display: flex; flex-direction: column` (`:4022`) — und dort heißt derselbe
Wert **„Kinder nicht auf volle Breite dehnen"**.*

**NACHGEPRÜFT:** *mit `align-items: stretch` im Telefonabschnitt geht
`.title-head` von 278 auf 366 px, und der Stern endet bündig mit der Spalte.*

> **DAS IST EIN ÜBERLÄUFER ZWISCHEN ZWEI BAUFORMEN, und die Sorte ist
> gefährlich:** *der Wert steht richtig da, wo er geschrieben wurde, und wird
> falsch, wo die Anzeigeart wechselt.* **Am Schreibtisch ist nichts zu sehen —
> dort ist `.detail` ein Raster.**

### 8 — die Filterreihen füllen am Telefon den Schirm

> **BETREIBER:** *„Die Schaltflächen nehmen immer noch viel platz… ich weiss
> nicht."* — **und er hat „erst messen" verlangt. Hier ist die Messung.**

**390 px breit, 844 px hoch, aufgeklappte Filter, fünfzehn Einträge, drei
Kategorien:**

| Stück | Höhe |
|---|---|
| Kopfzeile | 124 px |
| Filterschalter | 42 px |
| **Filterkasten** | **378 px** |
| ***Erste Kachel beginnt bei*** | ***y = 590 px — 70 % des Schirms*** |

**UND DER KASTEN VON INNEN:**

| Stück | Höhe | Anzahl |
|---|---|---|
| **Beschriftung** *(Status, Ablehnung, Kategorie, Sortieren, Ansichten)* | **18 px** | **5 × = 90 px** |
| Pillenreihe, eine Zeile | 35 px | 3 × |
| Pillenreihe, **zwei** Zeilen *(Kategorie)* | **77 px** | 1 × |
| Auswahlfeld *(Sortieren)* | 37 px | 1 × |
| **Abstände** | | **69 px** |

> **DIE PILLEN SIND NICHT MEHR DAS PROBLEM.** *Sie messen seit 0.28.0 35 px
> statt 41.* **Beschriftungen und Abstände zusammen sind 159 von 378 Pixeln —
> zweiundvierzig Prozent des Kastens sind Gerüst und nicht Bedienung.**

---

## Die Bauabschnitte — und was dabei WEGFÄLLT

| | was | was fällt |
|---|---|---|
| **BA 1** | **Die Richtung wird ein eigener Umschalter** *(F1)* — die Liste nennt nur noch, WONACH sortiert wird | **Sechs bis sieben `<option>` fallen aus dem Aufbau.** *Die Sprachschlüssel für die Richtungen werden zu ZWEI Sätzen statt vierzehn — was genau fällt, steht namentlich im Protokoll* |
| **BA 2** | **Die Blätterpfeile ziehen ans Ende des Eintrags** *(F2)*, breit und mit Wort | **Die zwei Pfeile fallen aus `subhead()`.** *`nav` fällt als Parameter weg; die Kopfzeile trägt in ALLEN vier Unteransichten wieder vier Dinge.* **Zusage 2 des Prüfstands wird entsprechend neu geschrieben** |
| **BA 3** | **Das Suchfeld fällt** — im Systembereich auf beiden Geräten *(F7)*, in den drei anderen Unteransichten am Telefon *(F3)* | **`#sub-q` und seine Tür fallen dort weg.** *`SEARCH_HANDOFF` bleibt — am Schreibtisch trägt das Feld weiter* |
| **BA 4** | **Die Sterne werden filigraner** *(F8)* | *nichts fällt* |
| **BA 5** | **Die Abschnittsliste klappt ein** *(F9)* — dieselbe Bauform wie der Filterschalter | *nichts fällt* |
| **BA 6** | **Die Titelzeile dehnt sich** *(Befund 7)* — `align-items` im Telefonabschnitt | **Die tote Regel `.back` im Telefonblock fällt mit** *(F12)* |
| **BA 7** | **Die Filterreihen** *(F10)* — nach der Entscheidung zu F10 | *keine Reihe fällt; was sich ändert, steht namentlich im Protokoll* |

> **DAS SCHEMA WIRD NICHT ANGEFASST. Das Austauschformat bleibt bei 15.
> `F_ROUTES` bleibt bei 72, die lesenden Routen bei 31.** *Es kommt kein
> Migrationsblock dazu — es bleibt bei elf.*

---

## Die Nummer und ihre Begründung

**HÄNGT AN F5 UND IST DIE EINZIGE OFFENE FRAGE, DIE DEN FAHRPLAN BERÜHRT.**

**Sieben der acht Befunde sind Reparaturen** — *sie richten, was schiefsteht,
und geben nichts dazu.* **Das ist ein PATCH: 0.28.1.**

**Der achte Punkt ist die Sortierrichtung**, *und wenn „Titel" dabei Z → A
bekommt, kann die Installation danach etwas, was sie vorher nicht konnte.*
**Nach Regel 5.1 ist das eine Funktion und damit MINOR.**

*Zwei ehrliche Wege, und beide stehen in F5/F11:* **„Titel" behält seine eine
Richtung und die Runde bleibt 0.28.1**, *oder die Richtung gilt für alle sieben
und die Runde braucht eine MINOR-Nummer — dann rückt der Fahrplan, denn 0.29.0
ist vergeben.*

---

## Der Prüfstand — was er halten muss

**Jede Zusage benannt, jede neue mit GEFAHRENER Gegenprobe, fortlaufend
nummeriert ab 854.** *Ein STUMM ist ein Fund und kein Versehen.*

| | Zusage | Gegenprobe zielt auf |
|---|---|---|
| **1** | **Die Sortierliste trägt genau sieben Einträge** — namentlich, nicht gezählt | einen achten danebenstellen |
| **2** | **Die Richtung steht in einem eigenen Bedienelement** und in keiner Option | sie zurück in die Liste schreiben |
| **3** | **Jede der sieben Sortierungen lässt sich in beide Richtungen fahren** — am laufenden Server geprüft, nicht am Quelltext | eine Richtung ins Leere laufen lassen |
| **4** | **Die Kopfzeile trägt in allen vier Unteransichten genau vier Dinge** — namentlich | die Pfeile dort stehen lassen |
| **5** | **Die Pfeile stehen am Ende des Eintrags** und blättern weiter in der Reihenfolge der Übersicht | die ungefilterte Liste nehmen |
| **6** | **Am Anfang und am Ende ist der jeweilige Pfeil gedämpft und DA** | ihn verschwinden lassen |
| **7** | **Der Systembereich trägt auf KEINEM Gerät ein Suchfeld** — beide Breiten geprüft | es am Schreibtisch stehen lassen |
| **8** | **Eintrag, offene Aufgaben und Vergleich tragen es am Schreibtisch und nicht am Telefon** — beide Breiten | eine der beiden Breiten vergessen |
| **9** | **Die Sterne messen am Finger weniger als heute UND mehr als am Zeiger** — beide Maße in der Zusage | eines der beiden weglassen |
| **10** | **Die Abschnittsliste klappt am Telefon ein und trägt den Namen des offenen Abschnitts** | sie ohne Auskunft einklappen |
| **11** | **Und sie steht am Schreibtisch unverändert offen** | sie überall einklappen |
| **12** | **Die Titelzeile misst am Telefon so breit wie ihre Spalte** — an beiden gemessen | `align-items: start` zurückschreiben |
| **13** | **Und am Schreibtisch steht das Raster unverändert** | `align-items` global ändern |
| **14** | **Die tote Regel `.back` steht nirgends mehr im Stilblatt** | sie wieder hineinschreiben |
| **15** | **Der Filterkasten misst am Telefon weniger als vor dieser Runde** — die Zahl steht in der Zusage | die Beschriftungen nur verstecken |
| **16** | **Die Pillen messen weiterhin 35 px** — sie waren nicht das Problem | sie mitschrumpfen lassen |
| **17** | **`F_ROUTES` steht unverändert auf 72, die lesenden auf 31** | eine Route dazunehmen |

> **DIE SORTIERUNG WIRD AM LAUFENDEN SERVER GEPRÜFT UND NICHT AM QUELLTEXT.**
> *Eine Zusage, die nur das Markup ansieht, bliebe grün, wenn der Umschalter
> dasteht und die Richtung nicht ankommt.* **Sieben Sortierungen mal zwei
> Richtungen sind vierzehn Anfragen — und genau die sind zu fahren.**

---

## Der Augenschein

| | Lage |
|---|---|
| **1** | Die **Sortierung am Telefon aufgeklappt** — passt die Liste jetzt auf den Schirm? *Das ist die Frage, mit der 0.28.0 angefangen hat* |
| **2** | Die **Richtung umlegen** und sehen, dass die Liste sich wirklich dreht |
| **3** | Der **Systembereich** — kein Suchfeld mehr, auf beiden Geräten |
| **4** | Ein **Eintrag am Telefon** — die Kopfzeile ist 54 px niedriger |
| **5** | **Ans Ende eines Eintrags scrollen** und weiterblättern |
| **6** | Die **Bewertungszeilen am Telefon** — sieben Kriterien, vorher und nachher |
| **7** | Der **Systembereich am Telefon** — die Abschnitte eingeklappt, der Name steht am Knopf |
| **8** | Der **Favoritenstern** am Telefon — bündig rechts, wie am Schreibtisch |
| **9** | Die **aufgeklappten Filter am Telefon** — wie weit oben beginnt die erste Kachel? |

---

## Was ausdrücklich NICHT gebaut wird

| | warum |
|---|---|
| **Eine eigene Auswahlliste statt `<select>`** | *ein Auswahlfeld öffnet die Auswahl des SYSTEMS — das ist die Bauform dieser Instanz.* **Ein eigenes Bedienelement mit Tastatur, Vorleseprogramm und Berührung wäre eine Runde für sich**, und erst wenn elf Zeilen immer noch zu viel sind |
| **Die Lupe statt des Suchfeldes am Telefon** | *vorgeschlagen und vom Betreiber abgelehnt (F3).* **Der Weg zur Suche ist am Telefon wieder zwei Griffe, und das ist entschieden** |
| **Die Pfeile zusätzlich in der Kopfzeile** | *zwei Orte für dieselbe Handlung* (F2) |
| **Der Titel des Nachbarn am Blätterpfeil** | *beim Direkteinstieg gibt es ihn nicht — dann stünde dort mal ein Name und mal keiner* (F6) |
| **Die Pillen weiter schrumpfen** | *gemessen: sie sind 35 px und machen 33 % des Filterkastens aus; Beschriftungen und Abstände machen 42 %* (Befund 8) |
| **Das Maß des Symbolknopfs** | *44 Pixel sind die einzige Zahl, die der Finger-Abschnitt ausdrücklich verspricht* |
| **Ein Verzeichnis der lesenden Routen** | *steht auf dem Sammelblatt und ist eine Runde für sich* |
| **`entry.commentPlaceholder`** | *derselbe Befund wie am Ablegefeld, anderer Ort — er steht auf dem Sammelblatt* |

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.28.1.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_28_1.md` | `git mv`, **Revision 81** — dazu die dritte Quelle des Fingerprints `8b205f42` |
| `Doku/Aenderungsprotokoll_0.28.0.md` | **eine Berichtigung:** der Satz „auf Android erbt die Liste die Schriftgröße des Feldes" ist falsch und wird namentlich richtiggestellt |
| `Doku/Fahrplan.md` | die neue Zeile; **rückt nur, wenn F5 eine MINOR-Nummer erzwingt** |
| `Doku/Fehler_und_Ideen.md` | die Punkte dieser Runde fallen heraus *(Regel 2)* |
| `Doku/Auftrag_0.28.0.md` | **fällt mit diesem Auftrag** — es liegt immer nur einer im Repo |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
| `README.md` | **ja** — die Sortierrichtung, das Blättern am Fuß, die Suche in den Unteransichten |

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
5. **Die Bauabschnitte**, und darin ausdrücklich: **was WEGFÄLLT** — Sätze der
   Sprachdateien namentlich, Wege mit ihrer `F_ROUTES`-Zahl, Zusagen des
   Prüfstands mit Begründung.
6. **Die Nummer und ihre Begründung** nach Regel 5.1. *Eine Datenbankstufe oder
   eine Funktion ist mindestens MINOR; eine Reparatur ist PATCH.* **Und wenn
   eine einzige Zeile die Runde von PATCH auf MINOR hebt, gehört das als
   eigene Frage in die Fragetafel** — nicht als Fußnote ans Ende.

**Am Fuß**

7. **Der Prüfstand:** jede Zusage benannt, jede neue mit **gefahrener**
   Gegenprobe, fortlaufend nummeriert. **Ein STUMM ist ein Fund und kein
   Versehen.** *Und eine Gegenprobe, die den Lauf ABREISST, belegt nichts —
   sie muss so greifen, dass die Oberfläche danach noch läuft.*
8. **Der Augenschein**, wenn der Befund am Bildschirm entstanden ist.
9. **Was ausdrücklich NICHT gebaut wird.**
10. **Die Papierliste** — Änderungsprotokoll, Projektstand (`git mv`,
    Revision), Fahrplan, Sammelblatt, CHANGELOG, README, `package.json`,
    `package-lock.json`.
11. **Dieser Abschnitt selbst.**

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
* **KEINE ZWEITE WAHRHEIT.** Eine Aussage, zwei Orte — Stolperstein 47.
* **EIN FELD OHNE LESER BLEIBT NICHT STEHEN**, und eine Regel ohne Träger auch
  nicht.
* **EINE ZUSAGE LIEST IHREN GEGENSTAND UND NICHT DEN ABSATZ DARÜBER.** *In
  0.28.0 sind fünf daran gescheitert, dass der erklärende Kommentar genau das
  Wort nennt, das die Zusage nicht sehen will.*
* **EIN WERT, DER DIE BAUFORM WECHSELT, WECHSELT SEINE BEDEUTUNG.**
  *`align-items: start` heißt im Raster „oben ausrichten" und im Flexkasten
  „nicht dehnen" — Befund 7 dieser Runde.*
* **EIN MOCK ANTWORTET WIE DER ECHTE SERVER** (Stolperstein 90).
* **GEGENPROBEN GEHEN MIT, STATT GELÖSCHT ZU WERDEN** (Stolperstein 201).
* **EINE GEGENPROBE LÄUFT GEGEN `git archive HEAD`** — *erst committen, dann
  fahren.*
* **EINE GEGENPROBE PRÜFT DIE ZUSAGE, NICHT DEN PRÜFFALL.**
