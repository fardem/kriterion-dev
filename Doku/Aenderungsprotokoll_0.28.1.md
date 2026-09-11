# Änderungsprotokoll 0.28.1 — „Was 0.28.0 nur halb erledigt hat"

**Acht Befunde vom laufenden Gerät · gebaut am 11. September 2026 auf 0.28.0
(`8b205f42`).**

> **FINGERPRINT DIESER RUNDE: `7ab6ae75`** — gerechnet am fertigen Stand,
> **vor dem Einspielen**.
>
> **AUS ZWEI QUELLEN, und die zweite ist eine eigene Rechnung und keine
> Abschrift:**
>
> | Quelle | Wert |
> |---|---|
> | Aus dem **Server selbst** gelesen — frisches Datenverzeichnis, über `/api/stats` befragt | **`7ab6ae75`** |
> | Am Arbeitsbaum nachgerechnet — **dieselben achtzehn Dateien**, die der Handgriff in der README nennt, mit eigenem Code über dieselbe Vorschrift | **`7ab6ae75`** |
>
> **DIE DRITTE QUELLE FEHLT NOCH, und das steht hier als offener Punkt und
> nicht als Fußnote:** *0.28.1 ist gebaut und **nicht eingespielt**. Erst die
> Meldung aus der laufenden Installation belegt, dass das Eingespielte dasselbe
> ist wie das Gebaute.* **Bis dahin gilt: zwei Rechnungen, ein Wert.**
>
> **DER VORGÄNGER IST IM FELD BESTÄTIGT.** *Der offene Punkt aus dem
> Änderungsprotokoll 0.28.0 ist geschlossen: der Betreiber hat `8b205f42` am
> 11. September 2026 aus seiner laufenden Installation gemeldet* — **drei
> Quellen, ein Wert.** *Zum zweiten Mal in dieser Reihe lag die Bestätigung
> vor, bevor die nächste Runde anfing.*

---

## Woher diese Runde kommt

**0.28.0 IST EINGESPIELT WORDEN, UND DER BETREIBER HAT ES BEDIENT.** *Sechs
Aufnahmen vom Telefon und vom Schreibtisch, am 11. September 2026 — nicht eine
Durchsicht, nicht ein Papier.*

**DIE KOPFZEILE HAT BESTANDEN:** *„Erstmal den header über den eintrag und auch
über den user/adminpanel find ich gut"*, und *„ins übersicht mit dem pfeil links
von logo ist gut."*

**EIN VERSPRECHEN AUS 0.28.0 HAT NICHT GEHALTEN, und das ist der schwerste Punkt
dieser Runde.** *Das Änderungsprotokoll 0.28.0 sagte: „und dort erbt die
aufgeklappte Liste die Schriftgröße des Feldes."* **Das war falsch.** *Chrome
auf Android zeichnet die aufgeklappte Auswahl als **eigenen Systemdialog** —
Radioknöpfe, Systemschrift, eigene Zeilenhöhe; die `font-size` des Feldes
erreicht ihn nicht.*

> **WIE DER FEHLER ZUSTANDE KAM:** *gemessen wurde an einem **emulierten**
> Android — und ein emuliertes Gerät hat den Systemdialog gar nicht. Es
> zeichnet die Liste selbst und erbt deshalb die Schrift des Feldes.*
> **WO DAS BETRIEBSSYSTEM ZEICHNET, ENTSCHEIDET NUR DAS ECHTE GERÄT.** *Die
> Zeile steht seit dieser Runde unter den stehenden Regeln des Auftrags, und
> der Absatz im Änderungsprotokoll 0.28.0 ist berichtigt — nicht gelöscht.*

**Betreiber:** *„die liste ist genauso hoch wie vorher. die schriftart muss hier
kleiner werden. so sieht das komisch aus. immer noch das gesamte display."*

---

## Die Fragetafel

**ZWÖLF FRAGEN, ZWÖLF ANTWORTEN — vom Betreiber am 11. September 2026, und
VOR der ersten geänderten Zeile.** *Regel 11 ist zum zweiten Mal in Folge
eingehalten.* **Zehn fielen wie vorgeschlagen, zwei nicht — und beide Male hat
der Betreiber gegen den Vorschlag entschieden:** *F2 (die Pfeile ziehen ans Ende
des Eintrags, statt als Paar in der Kopfzeile zu bleiben) und F3 (das Suchfeld
fällt am Telefon ganz, statt zu einer Lupe zu werden).* **Beide Preise stehen
im Auftrag und hier, und keiner ist weggeschrieben.**

*Die Tafel selbst steht in `Doku/Auftrag_0.28.1.md`.*

---

## Die Versionsnummer

**0.28.1 ist ein PATCH — Regel 5.1.** *Acht Reparaturen, keine Funktion. Die
Installation kann danach nichts, was sie vorher nicht konnte.*

> **DIE FRAGE HAT AN EINEM HAAR GEHANGEN.** *Ein Richtungsumschalter, der
> für alle sieben Sortierungen gilt, wäre die sauberere Bedienung gewesen —
> aber „Titel Z → A" ist eine **Funktion**, und eine Funktion ist nach Regel 5.1
> mindestens MINOR.* **Drei Zeilen Arbeit hätten den Fahrplan ab 0.29.0 um eine
> Stelle verschoben.** *Der Betreiber hat F5 mit „NEIN" entschieden.*
>
> **DER PREIS STEHT DAFÜR IM BEDIENELEMENT:** *bei „Titel" ist der Umschalter
> gedämpft und tut nichts.* **Ein Sonderfall, den man sieht, ist besser als eine
> gebogene Regel, die man nicht sieht.**

**Der Fahrplan rückt nicht.** *0.29.0 bis 0.35.0 stehen, wo sie stehen.*

---

## BA 1 — die Richtung wird ein eigener Umschalter

**BIS 0.28.0 STAND JEDE SORTIERUNG ZWEIMAL IN DER LISTE, einmal je Richtung:**
*dreizehn Einträge in vier Gruppen, mit den Überschriften siebzehn Zeilen.*
**Das ist am Telefon der ganze Schirm** — *und das Stilblatt kann daran nichts
ändern, weil das System zeichnet.*

**GEGEN DEN DIALOG HILFT NUR, IHN KÜRZER ZU MACHEN.** *Die Liste nennt jetzt
nur noch, **wonach** sortiert wird; die Richtung sitzt als eigener Knopf
daneben.* **Sieben Einträge statt dreizehn, elf Zeilen statt siebzehn.**

| | bis 0.28.0 | seit 0.28.1 |
|---|---|---|
| Einträge im Feld | **13** | **7** |
| Zeilen mit Überschriften | **17** | **11** |
| die Richtung | **im Wort** *(„Titel (A → Z)")* | **am Knopf daneben** |

**DER KNOPF SAGT DIE KONKRETE RICHTUNG UND NICHT „ABSTEIGEND":** *bei „Zuletzt
geändert" steht „neu → alt", bei der Bewertung „hoch → niedrig", bei den
Testtagen „viele → wenige".* **Vier Wortpaare decken alle sieben Grundlagen** —
*vier Sortierungen teilen sich „hoch → niedrig", und deshalb sind es sieben
Sätze und nicht vierzehn.*

**ER IST BESSER ALS DIE ALTE LISTE UND NICHT NUR KÜRZER:** *dort musste man
zwei Zeilen nebeneinanderhalten, um zu sehen, welche Richtung gerade galt. Hier
steht sie an einer Stelle.*

**DER GESPEICHERTE WERT ÄNDERT SICH NICHT.** *`f.sort` heißt weiter
`updated_desc`, `title_asc` und so fort — gespeicherte Ansichten aus 0.28.0
gelten unverändert weiter, und der Server sieht keinen Unterschied.* **Zerlegt
wird erst beim Zeichnen und wieder zusammengesetzt beim Wählen.**

### Ein Fehler, den erst der Prüfstand gefunden hat

> **„TITEL" SORTIERTE NACH DEM ÄNDERUNGSDATUM — ohne Meldung und ohne dass man
> es sah.**
>
> *„Titel" kennt nur eine Richtung. Beim ersten Bauen stand sein Wort unter
> `down` (der absteigenden Seite), und damit schrieb der Wähler `title_desc` in
> die gespeicherte Stellung.* **`title_desc` gibt es in der Sortierung nicht** —
> *sie fiel still auf die Vorgabe zurück, und die Liste stand nach dem
> Änderungsdatum da.* **Ausgewählt, ohne Fehler, und schlicht falsch.**
>
> **GEFUNDEN HAT ES ZUSAGE 3**, die jede der sieben Sortierungen **fährt**
> statt sie zu lesen: *sie wählt, liest die Liste, drückt den Umschalter und
> liest noch einmal.* **Eine Zusage über den Aufbau wäre grün geblieben** — der
> Knopf stand ja da und sagte sein Wort.
>
> *Behoben mit `dirOf()`: eine Grundlage mit nur einer Richtung bekommt immer
> diese. Die Gegenprobe **858** schreibt den Fehler zurück.*

### Zwei Funde nebenbei

> **„ALLGEMEIN" UND „VERLAUF" STANDEN ALS FESTE WÖRTER IM QUELLTEXT** — *die
> beiden Gruppenüberschriften des Sortierfeldes, und damit auf Englisch und auf
> Türkisch **deutsch** am Bildschirm.* **Sie sind mit dieser Runde in die
> Sprachdateien gezogen** *(`list.sortGroupGeneral`, `list.sortGroupHistory`)*.
>
> **DIE RESTPROBE HAT SIE ERST JETZT GESEHEN, und das ist der eigentliche
> Fund:** *sie zählt die lesbaren Texte in `public/app.js` — und solange die
> beiden mitten in einer langen Vorlage lagen, bekam sie sie nicht einzeln zu
> Gesicht.* **Erst der Umbau hat sie freigelegt.** *Wie viele feste Wörter noch
> in Vorlagen stecken, weiß niemand; der Punkt steht als **26** auf dem
> Sammelblatt.*

> **UND EINE DEUTSCHE `id` IM AUSGELIEFERTEN CODE.** *Die Stilblattregel dieser
> Runde musste `#f-status-woher` beim Namen nennen — und damit bekam die
> **Gestaltprobe** sie zum ersten Mal zu sehen.* **Sie heißt seither
> `f-status-from`.**
>
> **SIEBEN WEITERE STEHEN NOCH DA und sind für keinen Wächter sichtbar:** *eine
> `id`, die `app.js` mit `element.id = '…'` setzt und die in keiner
> Stilblattregel vorkommt, steht in keiner der beiden Quellen der Gestaltprobe;
> die Namensprobe sieht sie auch nicht, denn ein String ist kein Bezeichner.*
> **Der Punkt steht als **25** auf dem Sammelblatt** — *mit den sieben Namen,
> damit sie nicht ein zweites Mal zufällig gefunden werden müssen.* **Nicht
> mitgegangen, weil diese Runde ein PATCH aus acht benannten Reparaturen ist.**

---

## BA 2 — die Blätterpfeile ziehen ans Ende

**ZWEI PFEILE LINKS UND RECHTS VON ETWAS SAGEN: „wir blättern das hier
dazwischen".** *Dazwischen stand der Name der **Installation**.*

> **BETREIBER:** *„aber eintrag blättern pfeile da weis ich nicht. was hältst du
> den wenn wir die von da neben dem status machen. dann etwas breiter?"*

**ENTSCHIEDEN: ans ENDE des Eintrags, breit und mit Wort** — *„‹ Voriger" und
„Nächster ›".* **Die Kopfzeile verliert das Blättern ganz** und trägt seither in
**allen vier** Unteransichten dieselben vier Dinge.

*Der Preis, benannt: wer früher wechseln will als am Ende, muss erst ans Ende
scrollen.*

### Kurz auf dem Knopf, vollständig im Titel

> **EIN BEFUND AUS DEM AUGENSCHEIN DIESER RUNDE:** *mit dem vollen Satz („Eins
> zurück in der Übersicht") lief der zweite Knopf am Telefon aus dem Schirm.*
> **Die Knopfwörter sind kurz geworden, der ganze Satz steht im `title`.**
> *Dafür sind zwei Sätze dazugekommen (`list.prevHint`, `list.nextHint`), und
> `list.prevInList`/`list.nextInList` tragen jetzt „Voriger"/„Nächster".*

---

## BA 3 — das Suchfeld fällt an zwei Stellen

**ZWEI VERSCHIEDENE GRÜNDE, ZWEI VERSCHIEDENE ORTE.**

**IM SYSTEMBEREICH AUF KEINEM GERÄT** *(F7)*:

> **BETREIBER:** *„Im bereich admin/user cp brauchen wir kein suchleiste. man
> würde annehmen wenn man da sucht sucht man im adminpanel nach funktionen etc.
> eher da raus."*

*Ein Suchfeld über den Einstellungen sagt: „hier werden Einstellungen gesucht".
Es sprang aber in die Übersicht und suchte im Bestand.* **Eine Oberfläche sagt,
was ist** *(Projektstand 5.6)* — **und dieses Feld sagte etwas anderes.**

**AM TELEFON AUCH IN DEN DREI ANDEREN** *(F3)*: **gemessen** *(390 px,
`pointer: coarse`)* — **die Kopfzeile im Eintrag misst 123 px mit Suchfeld und
69 px ohne**; *das Feld kostet mit seinem Abstand **54 Pixel**.*

> **DAS NIMMT ZURÜCK, WAS 0.28.0 GEBRACHT HAT** — *der Weg vom Eintrag zur
> Suche ist am Telefon wieder zwei Griffe.* **Das steht hier als bewusste
> Entscheidung und nicht als Versehen:** *eine Lupe statt des Feldes war
> vorgeschlagen (ein Griff, keine Zeile) und ist vom Betreiber abgelehnt
> worden.*

**DER EINE GRUND STEHT IM AUFBAU, DER ANDERE IM STILBLATT.** *`subhead()` nimmt
`searchBox: false` — das ist der Systembereich; `.subhead .search-box { display:
none }` im Telefonblock — das sind die drei anderen.* **Eine Zusage je Grund.**

---

## BA 4 — die Sterne werden filigraner

> **BETREIBER:** *„die sterne könnten auch etwas filigraner werden. auch die
> nehmen recht viel platz weg."*

| | am Zeiger | am Finger vorher | am Finger jetzt |
|---|---|---|---|
| `.star` | `1.2rem` · 18 px | `1.45rem` · 21,75 px | **`1.25rem` · 18,75 px** |
| Polsterung je Stern | keine | `5px 4px` | **`3px 4px`** |
| **je Kriterienzeile** | rund 36 px | rund 50 px | **rund 40 px** |

**BEI SIEBEN KRITERIEN SIND DAS SIEBZIG PIXEL WENIGER.**

**NICHT AUF DAS ZEIGERMASS:** *ein Stern ist ein **Ziel** und kein Zeichen — man
tippt darauf.* **Die Zusage fragt deshalb beide Grenzen:** *kleiner als vorher
**und** größer als am Zeiger.* **Und sie rechnet, statt abzuschreiben** — *eine
Zahl, die dasteht, kann man vertauschen; eine, die zwischen zwei anderen liegen
muss, nicht.*

---

## BA 5 — die Abschnittsliste klappt ein

> **BETREIBER:** *„Menü muss aufklappbar sein. ähnlich wie das filter."*

**GEMESSEN** *(390 px)*: **die Reiterliste misst 241 px bei fünf Abschnitten,
und die erste Karte beginnt bei y = 480 von 844** — ***57 % des Schirms sind
Bedienung, bevor die erste Auskunft dasteht.***

**DIESELBE BAUFORM WIE DER FILTERSCHALTER DER ÜBERSICHT und kein zweites
Muster:** *ein Knopf darüber, der den Namen des offenen Abschnitts trägt.*

**DIE BREITE ENTSCHEIDET DEN ANFANGSZUSTAND, und zwar mit derselben Frage wie
das Stilblatt** (`isNarrow()`): *ohne sie säße ein breites Fenster vor
eingeklappten Abschnitten und hätte keinen sichtbaren Knopf, sie zu öffnen — der
Schalter selbst steht dort auf `display: none`.*

**WER EINEN ABSCHNITT WÄHLT, IST FERTIG:** *die Ansicht wird ohnehin neu
gezeichnet, und danach steht die Liste wieder eingeklappt da, mit dem Namen des
neuen Abschnitts am Knopf.* **Es braucht dafür keine Zeile.**

---

## BA 6 — die Titelzeile dehnt sich

> **BETREIBER:** *„der stern ist nicht an der rechten seite sondern irgendwie
> links vom rechten seite. sind ungeordnet aus."*

| | Breite |
|---|---|
| `.detail` *(die Spalte)* | **366 px** |
| `.title-head` *(die Titelzeile darin)* | **278 px** |
| **Fehlbetrag** | **88 px** |

**DER STERN STAND BÜNDIG RECHTS — IN EINER ZEILE, DIE ZU KURZ WAR.**

**DIE URSACHE IST EIN WERT, DER DIE BAUFORM WECHSELT:** *`.detail` trägt
`align-items: start`. Im **Raster** heißt das „Spalten oben ausrichten" und ist
richtig. Am Telefon wird `.detail` zu `display: flex; flex-direction: column` —
und dort heißt derselbe Wert **„Kinder nicht auf volle Breite dehnen"**.*

> **DAS IST EIN ÜBERLÄUFER ZWISCHEN ZWEI BAUFORMEN, und die Sorte ist
> gefährlich:** *der Wert steht richtig da, wo er geschrieben wurde, und wird
> falsch, wo die Anzeigeart wechselt.* **Am Schreibtisch war nichts zu sehen.**

**MIT `align-items: stretch` im Telefonabschnitt geht `.title-head` von 278 auf
366 px, und der Stern endet bündig mit der Spalte.** *Die tote Regel `.back` im
selben Block ist mitgefallen — sie traf seit 0.28.0 nichts mehr.*

---

## BA 7 — die Filterreihen

> **BETREIBER:** *„Die Schaltflächen nehmen immer noch viel platz… ich weiss
> nicht."* — **und er hat „erst messen" verlangt.**

**390 px breit, 844 px hoch, aufgeklappte Filter, fünfzehn Einträge, drei
Kategorien:**

| Stück | Höhe | Anzahl |
|---|---|---|
| **Beschriftung** *(Status, Ablehnung, Kategorie, Sortieren, Ansichten)* | 18 px | **5 × = 90 px** |
| Pillenreihe, eine Zeile | 35 px | 3 × |
| Pillenreihe, **zwei** Zeilen *(Kategorie)* | **77 px** | 1 × |
| Auswahlfeld | 37 px | 1 × |
| **Abstände** | | **69 px** |
| **Kasten gesamt** | **378 px** | |
| ***Erste Kachel beginnt bei*** | ***y = 590 von 844 — 70 %*** | |

> **DIE MESSUNG HAT DIE ANTWORT GEÄNDERT.** *Vorgeschlagen war, die Pillen
> anzufassen.* **Sie sind nicht das Problem:** *sie messen seit 0.28.0 35 px und
> machen 33 % des Kastens aus.* **Beschriftungen und Abstände zusammen sind 159
> von 378 Pixeln — zweiundvierzig Prozent des Kastens sind Gerüst und nicht
> Bedienung.**

**ZWEI HEBEL, und der Betreiber hat beide entschieden:**

**ERSTER HEBEL: DIE BESCHRIFTUNG STEHT WIEDER DANEBEN.** *Bis 0.28.0 wurde die
Zeile am schmalen Schirm zur **Spalte**, und jede Beschriftung kostete eine
eigene Zeile.* **Der Grund dafür war gut und ist entfallen:** *7,25 em
Beschriftungsspalte sind auf 366 Pixeln fast ein Drittel der Breite — ein Raster
mit `auto` in der ersten Spalte nimmt nur, was das längste Wort braucht.*
**Zwei Spalten und keine zwei:** *was zu keinem Paar gehört — der Vermerk „folgt
der Sortierung", der Und/Oder-Umschalter, die Verweise am Zeilenende — spannt
über beide.*

**ZWEITER HEBEL: DIE REIHEN ROLLEN QUER, STATT UMZUBRECHEN.** *Eine
Kategoriereihe mit fünf Pillen maß umgebrochen 77 Pixel und misst in einer Zeile
35.* **Der Gewinn wächst mit dem Bestand.** *Ohne Rollbalken — er nähme die
Höhe wieder weg, die die Zeile gerade gewonnen hat; dass rechts noch etwas
steht, sagt die angeschnittene Pille am Rand.* **Die Wolke ist ausgenommen:**
*sie hat ihr eigenes „mehr", und das misst die Zeilenhöhe an der ersten Marke.*

> **EINE HÖHE LÄSST SICH IM PRÜFSTAND NICHT MESSEN** — *in jsdom hat nichts eine
> Höhe.* **Geprüft wird deshalb, WAS die Höhe macht: die beiden Hebel, jeder
> einzeln und namentlich**, dazu die Gegenrichtung („die Pillen bleiben, wie sie
> sind").

---

## Die Sprachdateien

**1240 SCHLÜSSEL WERDEN 1245** *(1322 flach werden 1327)*.

| | |
|---|---|
| **weg: zwölf** | die Sortiersätze, die ihre Richtung im Wort trugen — *zu sechs Grundlagen je ein absteigender und ein aufsteigender Satz* |
| **neu: siebzehn** | **sieben** Richtungswörter für den Umschalter *(vier Paare, aber „A → Z" steht allein: 4 × 2 − 1)* · **drei** Sortierwörter ohne Richtung · **zwei** Titel des Umschalters · **eine** Überschrift der Abschnittsliste · **zwei** lange Sätze der Blätterpfeile · **zwei** Überschriften des Sortierfeldes *(„Allgemein", „Verlauf" — siehe BA 1)* |
| **neu geschrieben: drei** | `list.sortTitle` *(„Titel (A → Z)" → „Titel")*, `list.prevInList` und `list.nextInList` *(„Eins zurück in der Übersicht" → „Voriger")* |

> **EIN SATZ IST NICHT NEU, SONDERN DOPPELT GEWORDEN, und das ist im Prüfstand
> eigens benannt:** *„Titel" gibt es in der Datei schon — es ist die Überschrift
> der Titelspalte.* **Eine Liste mit `includes` kann ein zweites Vorkommen nicht
> sehen**, und deshalb fragt die Zusage von der anderen Seite: *der ALTE
> Wortlaut muss verschwunden sein.* *Das Doppelte wird beim Satz-für-Satz-
> Vergleich **namentlich** abgezogen — ein bloßer Längenvergleich deckte sonst
> jede künftige Doppelung zu.*

**KEINE MEHRZAHLFORM UND KEIN VOKABELNAME KOMMT DAZU:** *eine Richtung hat keine
Mehrzahl, und „hoch → niedrig" ist kein Vokabelwort.* **82 und 14 bleiben.**

---

## Der Prüfstand

**41 Zusagen mehr als in 0.28.0 — aus 6570 werden 6611**, und alle 6611 sind
grün.

> **IM QUELLTEXT STEHEN 50 NEUE `check(`-ZEILEN UND NEUN SIND WEGGEFALLEN.**
> *Der Unterschied zur gefahrenen Zahl sind die Schleifen.* **Gezählt wird, was
> läuft, und nicht, was dasteht.**
>
> **KEINE DER NEUN IST GELÖSCHT** *(Stolperstein 74 und 201)*: *sie sind
> **umgedreht** oder **mitgezogen** — jede mit dem Absatz daneben, der sagt,
> was sich an der Sache geändert hat und warum die Aussage dieselbe bleibt.*

| Gruppe | was sie deckt |
|---|---|
| **Die Sortierung trennt Grundlage und Richtung — 0.28.1** *(neu)* | die sieben Einträge **namentlich**, die Richtung als eigenes Bedienelement, **alle vierzehn Lagen gefahren**, die beiden Hebel der Filterzeile, die Sterne, die Titelzeile, die tote Regel, die Abschnittsliste auf beiden Breiten |
| **Die gemeinsame Kopfzeile und das Blättern — 0.28.0** *(umgedreht)* | die Kopfzeile trägt jetzt **vier** Dinge in allen vier Unteransichten; die Knöpfe stehen am **Fuß**; das Suchfeld fällt an zwei Stellen |
| **Der Sprachwächter** *(nachgezogen)* | 1327 Schlüssel, die zwölf weggefallenen in **allen drei** Dateien, der Wortlaut Satz für Satz |
| **Die Sortierung gibt den Status vor — 0.21.1** *(mitgezogen)* | dieselben Zusagen, gelesen an **zwei** Bedienelementen statt an einem |

### Die Sortierung wird GEFAHREN und nicht gelesen

> **EINE ZUSAGE, DIE NUR DEN AUFBAU ANSIEHT, BLIEBE GRÜN, wenn der Umschalter
> dasteht und die Richtung nirgends ankommt.** *Zusage 3 wählt jede der sieben
> Grundlagen, liest die Liste, drückt den Umschalter und liest noch einmal —
> **vierzehn Lagen an einem Fenster**, denn genau der Wechsel ist der
> Gegenstand.*
>
> **DREI EINTRÄGE, SECHS SORTIERUNGEN, SECHS VERSCHIEDENE FOLGEN** — *und das
> sind zugleich **alle sechs** Anordnungen, die drei Dinge haben.* **Die Zahlen
> sind daraufhin gewählt und nicht der Reihe nach vergeben:** *beim ersten Lauf
> liefen „Zuletzt geändert" und „Bewertung" auf dieselbe Folge hinaus, und damit
> hätte eine vertauschte Zuordnung der beiden grün bleiben können.*
>
> **UND SIE HAT DEN FEHLER GEFUNDEN, für den sie gebaut war** — siehe BA 1.

### Ein Wächter, der vier Regeln zählte, wo zwei stehen

> **EIN AUSDRUCK, DER `.star {` SUCHT, FINDET AUCH DAS ENDE VON
> `.stars .star {`.** *Der Leser dieser Runde verlangt deshalb eine Klammer
> davor — und **schaut sie voraus**, statt sie mitzuessen:* **ein Anker, der die
> schließende Klammer der vorigen Regel verbraucht, überspringt jede zweite.**
> *Derselbe Fund wie beim Raster der Kriterienliste in 0.17.0, an einer anderen
> Stelle noch einmal gemacht.*

### Die Gegenproben — 854 bis 868

**15 Rückbauten**, aus 844 werden **859**. *Jeder nimmt genau eine Zusage ins
Visier.*

| | Bauabschnitt | Rückbauten |
|---|---|---|
| **BA 1** | die Sortierung | **854–858** — ein achter Eintrag · die Richtung wieder im Wort · der Umschalter hängt nicht in der Zeile · die Richtung kommt nicht an · die einseitige Sortierung bekommt die falsche Endung |
| **BA 4** | die Sterne | **859–860** — zurück auf das Zeigermaß · das alte Maß behalten |
| **BA 5** | die Abschnitte | **861–862** — ohne Auskunft einklappen · auf jedem Schirm einklappen |
| **BA 6** | die Titelzeile | **863–865** — der Überläufer zurück · global statt am Telefon · die tote Regel wieder hinein |
| **BA 7** | die Filterreihen | **866–868** — wieder eine Spalte · wieder umbrechen · die Pillen schrumpfen mit |

> **FÜNFZEHN UND NICHT SIEBZEHN.** *Die Zusagen 4 bis 8 (die Kopfzeile, das
> Blättern, das Suchfeld) sind mit 0.28.0 gekommen und haben ihre Rückbauten
> seither.* **Diese Runde hat sie UMGEDREHT und nicht neu gemacht** — *ein
> zweiter Rückbau auf dieselbe Zeile belegte nichts, was der erste nicht schon
> belegt.* **Zusage 17 (`F_ROUTES` bleibt bei 72) hält das Wegeverzeichnis mit
> den seinen** — *eine zweite Zeile daneben wäre eine zweite Wahrheit.*
>
> **FÜNF ALTE ZIEHEN MIT** *(613, 614, 806, 833, 835)*: *sie zeigen auf die
> Zeilen, die dieselbe Sache jetzt tragen* **(Stolperstein 201)**.

### Gefahren — GEFAHREN_ZEILE

GEFAHREN_TABELLE

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

## Was ausdrücklich NICHT gebaut wurde

| | warum |
|---|---|
| **Eine eigene Auswahlliste statt `<select>`** | *ein Auswahlfeld öffnet die Auswahl des **Systems** — das ist die Bauform dieser Instanz.* **Ein eigenes Bedienelement mit Tastatur, Vorleseprogramm und Berührung wäre eine Runde für sich** |
| **„Titel Z → A"** | *eine **Funktion**, und die Runde wäre damit MINOR* (F5, F11) |
| **Die Lupe statt des Suchfeldes am Telefon** | *vorgeschlagen und vom Betreiber abgelehnt* (F3) |
| **Die Pfeile zusätzlich in der Kopfzeile** | *zwei Orte für dieselbe Handlung* (F2) |
| **Der Titel des Nachbarn am Blätterpfeil** | *beim Direkteinstieg gibt es ihn nicht — dann stünde dort mal ein Name und mal keiner* (F6) |
| **Die Pillen weiter schrumpfen** | *gemessen: 33 % des Kastens gegen 42 % für Beschriftungen und Abstände* |
| **Die sieben übrigen deutschen `id`** | *kein Befund dieser Runde, sondern einer über den Wächter* — **Punkt 25 des Sammelblatts** |
| **Die Restprobe auf Vorlagen ausweiten** | *wie viele feste Wörter dabei auffallen, weiß niemand* — **Punkt 26 des Sammelblatts, erst messen** |
| **Ein Verzeichnis der lesenden Routen** | *steht auf dem Sammelblatt und ist eine Runde für sich* |

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.28.1.md` | **neu** — dieses Papier |
| `Doku/Projektstand_Kriterion_0_28_1.md` | `git mv`, **Revision 81** — dazu die dritte Quelle des Fingerprints `8b205f42` |
| `Doku/Aenderungsprotokoll_0.28.0.md` | **eine Berichtigung**, eingerückt und nicht gelöscht: der Satz über die aufgeklappte Liste auf Android |
| `Doku/Fahrplan.md` | 0.28.1 in der Tafel; die Ausarbeitung zum Blättern trägt den neuen Ort |
| `Doku/Fehler_und_Ideen.md` | **zwei neue Punkte** — die sieben deutschen `id` und die Restprobe auf Vorlagen |
| `Doku/Auftrag_0.28.0.md` | **gefallen** — es liegt immer nur einer im Repo |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer, dazu die Berichtigung zu 0.28.0 |
| `README.md` | die Sortierrichtung, das Blättern am Fuß, die Suche in den Unteransichten |
