# Auftrag 0.37.0 — „Die Kommentare werden verdichtet"

Geschrieben am 19. September 2026, nachgemessen am selben Tag auf dem Stand
0.36.0. Nicht gebaut.

> **NACHGEMESSEN AM 19. SEPTEMBER 2026, AUF DEM GEBAUTEN STAND 0.36.0.** *Der
> Auftrag war auf 0.35.2 geschrieben.* **Sechs Angaben waren schon damals
> falsch, fünf haben sich durch 0.36.0 bewegt, und drei Zusagen tragen nicht,
> was sie behaupten.** Jede berichtigte Zahl trägt hier den Grund neben sich.
>
> **Der Bestand und die Zahlen stehen fast wortgleich auch in `CLAUDE.md`,
> Abschnitt 2.** *Beide sind am 19. September 2026 nachgezogen worden.*

> **DIE FRAGETAFEL STEHT JETZT VORN.** *Sie stand am Ende, und dort wird sie
> gelesen, wenn die Entscheidung schon gefallen ist.* **Elf Fragen, und vier
> davon ändern, was gebaut wird.**

**Vorgabe des Betreibers vom 19. September 2026.** Die Runde tut drei Dinge an
denselben Dateien: sie verdichtet die Kommentare, sie nimmt jede Versionsnummer
heraus und sie nimmt jeden Verweis auf ein Papier heraus.

> **DIE REGELN STEHEN SEIT DEM 19. SEPTEMBER 2026 GESCHÄRFT IN `CLAUDE.md`,
> Abschnitt 2.** *Sie binden jede Runde und gelten, bis der Betreiber sie selbst
> ändert.* **Diese Runde räumt den Altbestand; die Regel gilt schon vorher.**

**Warum nach 0.36.0 und nicht davor:** jene Runde hat `server.js` und
`public/app.js` angefasst — dieselben zwei Dateien, die 78 Prozent des
Kommentars tragen. Zwei Runden auf denselben 15.000 Zeilen kollidieren in jedem
Diff, und ein Kommentar, der beim Sicherheitsumbau entsteht, wäre danach sofort
wieder Kandidat. **Es ist dieselbe Begründung, mit der 0.36.0 hinter 0.35.0
stand.** *Sie ist mit dem Bauen von 0.36.0 eingelöst: die Runde kann laufen.*

---

## 1. Fragetafel — vor der ersten Zeile zu beantworten

| | Frage | Vorschlag |
|---|---|---|
| **F1** | **Wie heißt die Meldung aus `REQUIRED_COLUMNS` ohne Versionsnummer?** | *sie nennt den alten Spaltennamen statt der Fassung.* „`items.rejected_at` fehlt; unter dem Namen `rejected_grund` liegt sie auch nicht da" sagt einem Betreiber mehr als eine Nummer, die er nachschlagen müsste |
| **F2** | **Bekommt `public/style.css` ein Ziel für den Anteil?** | *nein.* Der Kommentar dort ist zum guten Teil begründet, und eine Quote erzwingt Kürzungen an Stellen, die sie nicht verdienen |
| **F3** | **Fällt „Befund" auch dort, wo es kein Verweis ist?** | *nein.* „Der Befund war" ist ein Verweis, „ein Bild ohne Befund" nicht. Der Wächter zielt auf `Befund \\d+` und die benannten Papiernamen, nicht auf das Wort. **Gemessen: von 187 Vorkommen tragen 155 eine Nummer** — 148 auf derselben Zeile, 7 auf der nächsten. **32 tragen keine**, zehn davon einen Buchstaben statt einer Ziffer *(„Befund A1", „Konzept E9")*. *Ein Muster allein auf `Befund \\d+` trifft 148 und lässt 39 stehen; das Ziel heißt dann nicht 0, sondern 39.* **Und `db.js`:884 muss stehen bleiben:** dort ist „Befund" das Fachwort, das in `findings` reist — genau die Stelle aus BA 4 |
| **F4** | **Wird die README umgestellt oder nur gekürzt?** | *erst lesen, dann entscheiden.* BA 6 liefert ein Urteil, keine Umstellung; was daraus folgt, ist eine eigene Zeile im Fahrplan |
| **F5** | **Zählt der Prüfstand mit?** | *nein, er ist ausgenommen* — wie bei den drei Wächtern davor. Er muss die Nummern nennen dürfen, sonst kann er keine bewachen. **Die alte Begründung „er geht nicht mit hinaus" stimmt nicht** *(siehe V3)* |
| **F6** | **Welche Blockzählweise gilt?** | *jeder Kommentarteil einzeln* — so sind die 2.735 gezählt, und so halten 96 Prozent die Regel. **Faßt man `//`-Folgen zusammen, sind es 2.177 Blöcke und 122 über drei Zeilen.** Die zweite Zählweise ist die, die ein Leser sieht; die erste ist die, in der alle Zahlen dieses Auftrags stehen |
| **F7** | **Was wird aus den 21 Nummern in `db.js` und der einen in `auth.js`?** | *offen.* Der Vorschlag aus F1 deckt neun der 18 `REQUIRED_COLUMNS`-Zeilen; für die neun ohne alten Namen, für `LAST_MIGRATING_VERSION`, für das `since` der `LEGACY_TABLES`, für den englischen Warnkasten und für die Laufzeitmeldung in `auth.js`:430 sagt er nichts |
| **F8** | **Heißt die Latte „null" oder „genau diese"?** | *„genau diese".* Fünfzehn Treffer sind keine Fassungsnummern, sechs verlangt die Anleitung, zwei verlangt der Prüfstand. Eine Latte auf null wäre eine Zusage, die kein Bauabschnitt einlösen kann |
| **F9** | **Was wird aus den sechs Gleichlaufsummen?** | *zwei Wege.* Entweder BA 2 lässt die 29 nachgestellten `//`-Kommentare in `public/app.js` stehen — dann bleiben die Summen gleich und die Zusage trägt. Oder `tools/gleichlaut.js` bekommt einen richtigen Kommentarfilter über `tools/segments.js` — *nicht über eine Regex, ein `//` in `'http://'` darf nicht fallen* — und alle sechs Konstanten werden neu eingetragen. **Der zweite Weg ist ehrlicher und kostet den Vorlauf als Beleg** |
| **F10** | **Gilt die Drei-Zeilen-Regel auch für `public/style.css`?** | *nein, dort gilt die Grenze 30* — so misst `test/source.js`:2758 heute, und BA 5 nimmt die 184 langen Blöcke ausdrücklich aus. Gilt sie doch, ist BA 5 ein dritter Griff schwerer und Rückbau 1089 auf den neuen Wert zu stellen |
| **F11** | **Welche Dateiliste nimmt der neue Wächter?** | *offen.* Der Nummernwächter liest 20 Dateien, der `Doku/`-Wächter 24. **Daran hängt `CHANGELOG.md`:** er trägt 11 Papiernamen, und ein Änderungsprotokoll muss die Papiere nennen dürfen, die es fortschreibt |

---

---

## 2. Der Bestand

**Gemessen am 19. September 2026, auf dem gebauten Stand 0.36.0.** *Die Zahlen
in Klammern sind die des Auftrags vom selben Tag, gemessen auf 0.35.2.*

### Kommentar je Datei

| | Zeilen | Kommentar | Anteil |
|---|---:|---:|---:|
| `public/app.js` | 9.392 *(9.372)* | **1.857** *(1.856)* | 20 % |
| `server.js` | 5.708 *(5.669)* | **1.536** *(1.523)* | 27 % |
| zwölf kleine Module | 4.313 *(4.244)* | **935** *(915)* | 22 % |
| **14 ausgelieferte Module** | **19.413** *(19.285)* | **4.328** *(4.294)* | **22 %** |
| `public/style.css` | 3.350 | 1.574 Zeilen in 409 Blöcken | **54,5 %** der Bytes |

*Die vier bewegten Zahlen kommen aus 0.36.0: `server.js` +13, `auth.js` +20,
`public/app.js` +1. `db.js` bleibt bei 272, `public/style.css` ist unberührt.*

**`server.js` und `public/app.js` tragen zusammen 78 Prozent** *(der Auftrag
sagte 79; 3.393 von 4.328)*.

> **„ÜBER DEM ZIEL LIEGEN NUR DREI" WAR FALSCH, UND ZWAR SCHON AUF 0.35.2.**
> `tools/comments.js` nennt **neun** ausgelieferte Module über ihrem Ziel:
> `server.js` 493 *(486)*, `auth.js` 49 *(38)*, `db.js` 17 *(20)*,
> `attachments.js` 14, `keys.js` 10, `twofactor.js` 7, `mail.js` 4,
> `images.js` 3, `log.js` 2. **Sechs davon stehen in BA 3 in der Namensliste,
> aber ohne Zahl und ohne Griff.**

> **DIE DREIHUNDERTDREIZEHN ZEILEN, DIE IN KEINER ZAHL STEHEN.** *Im
> `SCHEMA`-String von `db.js` stehen **313 Kommentarzeilen in 40 Folgen** — 23
> davon über drei Zeilen, 13 über acht, die längste 32.* `tools/segments.js`
> führt sie als Text, deshalb zählt `tools/comments.js` sie nicht: **`db.js`
> misst in Wahrheit 585 von 1.291 Zeilen Kommentar, also 45 Prozent statt 21.**
> **Es ist der drittgrößte Kommentarbestand des Projekts.**

### Blocklängen

**2.735 Blöcke in den ausgelieferten Modulen** *(2.716 auf 0.35.2)*. Zwei
Drittel sind einzeilig, **96 Prozent halten drei Zeilen ein**, 17 gehen über
acht, der längste misst 41 Zeilen. **105 gehen über drei Zeilen** *(106)*.

> **DIE ZÄHLWEISE GEHÖRT DAZU, UND SIE STAND NICHT DA.** *Gezählt wird jeder
> Kommentarteil einzeln:* **eine Folge von sechs `//`-Zeilen sind sechs
> einzeilige Blöcke** *und fallen nie über die Drei-Zeilen-Regel.* Faßt man
> `//`-Folgen zu einem Block zusammen — so, wie ein Leser sie sieht —, sind es
> **2.177 Blöcke, davon 38 Prozent einzeilig, 94 Prozent bis drei Zeilen und
> 122 über drei**. **Welche der beiden Zählweisen gilt, entscheidet F6.**

> **UND DAS STILBLATT STEHT IN DIESER ZAHL NICHT.** `public/style.css` bringt
> **184 weitere Blöcke über drei Zeilen** mit, davon 26 über acht, der längste
> 24 Zeilen. **Zusammen sind es 289 und nicht 105.**

> **DIE DREI-ZEILEN-REGEL IST ALSO KEIN BRUCH.** *Sie beschreibt, was 96
> Prozent des Bestands ohnehin tun.* **Die Arbeit liegt in den restlichen vier
> Prozent und in der Verdichtung der einzelnen Sätze.**

### Versionsnummern und Papierverweise

| | |
|---|---:|
| Treffer des Musters in ausgelieferten Dateien | **778** |
| davon in Kommentaren | 726 |
| davon in Strings | **44** |
| davon in `README.md` und `manual-de.md` | 8 |
| davon im Code | **0** |
| **davon überhaupt keine Fassungsnummer** | **15** |
| Verweise auf Papiere über den Namen | **187** |
| Verweise über den Pfad `Doku/` | **0** |

*Treffer je Datei:* `public/app.js` 326, `server.js` 197, `public/style.css`
175, `db.js` 62, `README.md` 6, `public/index.html` 4, `auth.js` 4,
`manual-de.md` 2, `usertool.js` 1, `twofactor.js` 1. **Alle zehn Zahlen sind
am Stand 0.36.0 unverändert** — jene Runde hat keine einzige hinzugefügt oder
entfernt.

*Papierverweise:* „Befund" **86** *(87 auf 0.35.2; in `public/app.js` ist einer
mit 0.36.0 weggefallen)*, „Bauabschnitt" 70, „Konzept" 14, „Auftrag" 10,
„Projektstand" 4, „Änderungsprotokoll" 2, „Farbkonzept" 1.

> **„DAVON IM CODE 0" TRÄGT NICHT.** *Es stimmt nur, wenn „Code" die
> CODE-Teile von `tools/segments.js` meint.* **44 der 778 stehen in Strings**,
> und `CLAUDE.md` verbietet die Versionsnummer ausdrücklich auch dort: 20 in
> den SQL-Kommentaren des `SCHEMA`-Strings von `db.js`, 18 in
> `REQUIRED_COLUMNS`, `LAST_MIGRATING_VERSION = '0.32.1'`, das `since` der
> `LEGACY_TABLES`, ein Satz im englischen Warnkasten und die Laufzeitmeldung
> `AUTH_RESET has not been carried out since version 0.8.0` in `auth.js`.

> **FÜNFZEHN DER 778 SIND ÜBERHAUPT KEINE FASSUNGSNUMMERN.** *Das Muster
> `\d+\.\d+\.\d+` trifft auch Daten und Pfaddaten:* zehn Daten
> (`public/style.css` sieben, `public/app.js` zwei, `twofactor.js` `1.1.1970`),
> zwei SVG-Pfaddaten in `public/app.js`:255, das `1.0.0` im Kommentar über
> `const VERSION` in `server.js`:12 — *ein Satz, den `CLAUDE.md`, Abschnitt 4
> ohnehin überholt hat* — sowie in der Anleitung die Adresse
> `keepachangelog.com/de/1.1.0/` und das Beispieldatum `14.03.2026`.
> **Echte Fassungsnummern sind es 763.**

---

## 3. Die Zahlen

| | heute | nachher |
|---|---:|---:|
| Echte Fassungsnummern in ausgelieferten Dateien | 763 | **29**, davon 21 nach F7 vielleicht weniger |
| Treffer, die keine Fassungsnummern sind | 15 | **15** *(sie bleiben)* |
| Verweise auf Papiere über den Namen | 187 | **0 bis auf die Fachwörter, F3** |
| Abkürzungen `BA <Zahl>`, `(F<Zahl>)`, `Punkt <Zahl>` | **94** | **0** |
| Blöcke über drei Zeilen, 14 Module | 105 | **nur Tafeln gemessener Werte** |
| Blöcke über drei Zeilen, `public/style.css` | 184 | *unverändert, siehe BA 5* |
| Kommentaranteil `server.js` | 27 % | *fällt, Ziel offen* |
| Kommentaranteil `public/style.css` | 54,5 % | *fällt, Ziel offen* |
| Wächter über Papierverweise ohne Pfad | 0 | **1** |
| Dateien in der Latte der Versionsnummern | 20 | *entscheidet F11* |
| Stellen im Prüfstand, die nachzuziehen sind | — | **15** |

> **DIE NULL WAR NICHT ERREICHBAR, UND ZWAR AUS DREI GRÜNDEN.**
>
> **Der Prüfstand verlangt sechs Nummern in der Anleitung.**
> `test/source.js`:915–923 hält fest, dass `0.33.0`, `0.32.1` und `0.8.0` in
> `README.md` und `manual-de.md` stehen bleiben, und zwar **in genau sechs
> Nennungen**. *Sie bestimmen eine Handlung: den Zwischenschritt beim Umzug
> einer alten Datenbank und die älteste übernommene Fassung.* **BA 6 in seiner
> ursprünglichen Form hätte den Prüflauf rot gemacht.**
>
> **Der Prüfstand verlangt zwei weitere im Kommentar.** `test/ui_style.js`:1482
> verlangt „IN 0.19.2 ABGEBAUT WORDEN" in `public/app.js`,
> `test/ui_export.js`:527 verlangt `0.12.3` in `public/style.css`.
>
> **Und `db.js` trägt 21 als Daten** — BA 4, und die Zahl entscheidet F7.
>
> **29 ist also die Untergrenze ohne BA 4:** sechs in der Anleitung, zwei vom
> Prüfstand verlangte, 21 in `db.js`. *Was davon fällt, sagt F7.*
>
> **Dazu die 15, die gar keine Fassungsnummern sind.** Sie bleiben, und
> **deshalb kann die Latte nicht auf null** — F8.

**Für die beiden Anteile steht kein Ziel im Auftrag, und das ist Absicht.**
*Eine Quote erzwingt Kürzungen an Stellen, die sie nicht verdienen.* **Gemessen
wird am fertigen Stand, und die Zahl steht danach im Änderungsprotokoll.**

---

## 4. Bauabschnitte

### BA 1 — `server.js`

**1.536 Kommentarzeilen, 27 Prozent, 493 über dem Ziel** *(1.523 und 486 auf
0.35.2; 0.36.0 hat dreizehn Zeilen gebracht)*. Der größte einzelne Posten der
Runde.

**Drei Griffe, in dieser Reihenfolge:**

1. **Jede Versionsnummer heraus** — 197 Stück, alle in Kommentaren.
2. **Jeden Papierverweis heraus** — „Befund" 11, „Bauabschnitt" 41,
   „Auftrag" 2, „Konzept" 3.
3. **Dann verdichten.** Was nach den ersten beiden Griffen übrig ist, wird Satz
   für Satz auf die Sache gebracht.

*Die Reihenfolge spart Arbeit: ein Satz, der nur eine Herkunft trug, fällt in
Schritt 1 oder 2 ganz weg und muss in Schritt 3 nicht mehr gelesen werden.*

### BA 2 — `public/app.js`

**1.857 Kommentarzeilen, 20 Prozent** — unter dem Ziel, aber mit **326
Treffern** die Datei mit den meisten.

Dieselben drei Griffe. **Vier der 326 sind keine Versionen:** zwei SVG-Pfaddaten
in Zeile 255 und zwei Daten (`13.9.2026` in Zeile 2749, `14.03.2026` in
Zeile 3815). *Der Wächter zählt alle vier mit, und der Sweep muss sie stehen
lassen.*

> **DAS ZITAT `-1.8.3l` DECKT NUR EINEN DER BEIDEN SVG-TREFFER.** *Der zweite
> in derselben Zeile lautet `1.8.3H9`.* **Wer nach `-1.8.3l` sucht, übersieht
> ihn.**

> **EINE NUMMER MUSS IN `public/app.js` STEHEN BLEIBEN:** `test/ui_style.js`:1482
> verlangt den Kommentar „IN 0.19.2 ABGEBAUT WORDEN". *Entweder bleibt er, oder
> die Prüfung wird in derselben Runde umgebaut.*

> **UND 23 NACHGESTELLTE `//`-KOMMENTARE SIND HEIKEL.** *`tools/gleichlaut.js`
> streicht nur Zeilenkommentare am Zeilenanfang; ein nachgestellter Kommentar
> steht im gemessenen Text.* **Fällt einer, bewegen sich alle sechs
> Gleichlaufsummen** — siehe Zusage 5 und F9.

### BA 3 — Die zwölf kleinen Module

`auth.js`, `db.js`, `mail.js`, `keys.js`, `attachments.js`, `images.js`,
`batchrun.js`, `log.js`, `usertool.js`, `twofactor.js`, `keytool.js`,
`public/theme.js`. *Es sind zwölf und nicht zehn — der Auftrag zählte sie
richtig auf und nannte sie falsch.*

**935 Kommentarzeilen zusammen** *(915 auf 0.35.2)*, davon `auth.js` **294**
*(274; 0.36.0 hat zwanzig Zeilen gebracht)* und `db.js` 272. Treffer des
Nummernmusters: `db.js` 62, `auth.js` 4, `usertool.js` 1, `twofactor.js` 1 —
*und der eine in `twofactor.js`:58 ist das Datum `1.1.1970`, keine Fassung.*

> **SECHS DIESER ZWÖLF LIEGEN ÜBER IHREM ZIEL**, und das stand nirgends:
> `attachments.js` 14, `keys.js` 10, `twofactor.js` 7, `mail.js` 4,
> `images.js` 3, `log.js` 2. *Zusammen mit `auth.js` 49 und `db.js` 17 sind es
> 106 Zeilen über dem Ziel.*

> **UND `db.js` TRÄGT 313 ZEILEN, DIE KEIN WERKZEUG MISST** — die SQL-Kommentare
> im `SCHEMA`-String. *Sie sind der Form nach String, dem Inhalt nach
> Kommentar, und `CLAUDE.md` gilt für sie wie für jeden anderen.* **23 von 40
> Folgen gehen über drei Zeilen, 13 über acht.** *Sie tragen 20 der 44
> Nummern in Strings und sieben Papierverweise.*

*Ein Bauabschnitt für alle zwölf — einzeln sind sie zu klein für je einen Lauf.*

### BA 4 — Die eine Stelle, an der die Regel etwas kostet

**`REQUIRED_COLUMNS` in `db.js`.** Eine Tafel aus **18 Zeilen** *(der Auftrag
sagte 21)* nennt je fehlender Spalte die Fassung, deren Block sie gebracht
hätte. Der Wert reist in `findings.since` und steht im Warnkasten, den ein
Betreiber mit unvollständiger Datenbank liest.

**Es sind vier Stellen und nicht eine.** *Die 21 kommt zustande, wenn man drei
weitere derselben Mechanik mitzählt, die der Auftrag nicht nannte:*

| Stelle | Nummern | was sie tut |
|---|---:|---|
| `REQUIRED_COLUMNS` *(`db.js`:885–903)* | 18 | je fehlender Spalte die Fassung |
| `LAST_MIGRATING_VERSION = '0.32.1'` *(:909)* | 1 | die letzte Fassung, die den Weg herauf kannte |
| `since: '0.24.1'` bei `LEGACY_TABLES` *(:917)* | 1 | dasselbe für umbenannte Tabellen |
| der Satz im englischen Warnkasten *(:948)* | 1 | „Kriterion 0.33.0 removed those upgrade steps" |

**Dazu eine fünfte außerhalb von `db.js`:** `auth.js`:430 gibt zur Laufzeit
`AUTH_RESET has not been carried out since version 0.8.0` aus. *Das ist ein
ausgelieferter Text, kein Kommentar.*

**Das sind keine Kommentare, sondern Daten** — und damit die einzigen
Versionsnummern, die nicht einfach gestrichen werden können.

**Zu entscheiden ist, wie die Meldung ohne Nummer heißt.** *Sie fällt nicht
ersatzlos: eine unvollständige Datenbank ist ein Befund, und der Betreiber
braucht die genaueste Auskunft, die zu geben ist.* **Fragetafel F1.**

> **DER VORSCHLAG AUS F1 TRÄGT NUR DIE HÄLFTE.** *Er will den alten
> Spaltennamen statt der Fassung nennen — die Spalte dafür gibt es schon, als
> drittes Feld je Zeile.* **Neun der 18 Einträge haben dort einen Namen**
> *(`gewicht`, `art`, `dauer`, `rejected_grund`, `rejected_von`, `gesetzt_am`,
> `zweck`, `ablauf`, `benutzt_am`)*, **neun tragen `null`**, weil die Spalte
> damals neu war. **Für diese neun sagt F1 nichts** — F7.

### BA 5 — `public/style.css`

**1.574 Kommentarzeilen in 409 Blöcken, 54,5 Prozent der Bytes, 175
Versionsnummern.**

> **HIER IST DER GRÖSSTE TEIL DES KOMMENTARS BEGRÜNDET.** *Kontrastwerte,
> Pixelmaße, Messtafeln der Vorschaureihe — genau das, was `CLAUDE.md` unter
> „Doch" führt.* **0.35.0 hat schon einmal gekürzt, von 70,5 auf 54,5 Prozent.**

**Deshalb hier nur zwei Griffe und kein dritter:** die 175 Treffer und die 37
Papierverweise heraus. **Verdichtet wird nur, wo ein Block eine Abwägung
erzählt statt eine Zahl zu nennen.**

> **SIEBEN DER 175 SIND DATEN UND KEINE FASSUNGEN** *(`11.09.2026`, fünfmal
> `11.9.2026`, `27.08.2026`)*. **Und eine muss stehen bleiben:**
> `test/ui_export.js`:527 verlangt `0.12.3` in `public/style.css`.

> **BA 5 UND DIE TAFEL IN ABSCHNITT 2 WIDERSPRACHEN SICH.** *Die Tafel verlangte,
> dass nach der Runde nur noch Tafeln gemessener Werte über drei Zeilen gehen.*
> **In `public/style.css` sind 184 der 409 Blöcke länger als drei Zeilen**, und
> BA 5 nimmt sie ausdrücklich aus. *Die Tafel ist berichtigt; für das Stilblatt
> gilt weiter die Grenze 30, die `test/source.js`:2758 misst.* **Ob die
> Drei-Zeilen-Regel auch für das Stilblatt gilt, entscheidet F10.**

*Punkt 42 des Sammelblatts bleibt danach offen, mit einer neuen Zahl.*

### BA 6 — README und Handbuch

**`README.md`** 1.134 Zeilen *(1.097; 0.36.0 hat zwei Abschnitte gebracht)*,
6 Treffer, 3 Papierverweise („Projektstand" 1, „Änderungsprotokoll" 2).
**`manual-de.md`** 1.446 Zeilen *(1.444)*, 2 Treffer.

> **KEINER DER ACHT TREFFER IST EINE HERKUNFTSANGABE, UND SECHS MÜSSEN BLEIBEN.**
>
> *Einer steht in einer Adresse* — `README.md`:77,
> `keepachangelog.com/de/1.1.0/`. *Einer ist ein Datum* — `manual-de.md`:817,
> `14.03.2026` im Beispielsatz. **Die übrigen sechs bestimmen eine Handlung:**
> der Zwischenschritt beim Umzug einer alten Datenbank *(`README.md`:261–263,
> `manual-de.md`:981)* und die älteste übernommene Fassung *(`README.md`:353)*.
>
> **`test/source.js`:915–923 verlangt sie ausdrücklich** — dass `0.33.0`,
> `0.32.1` und `0.8.0` dastehen, dass keine andere danebensteht und dass es
> **genau sechs Nennungen** sind. **BA 6 in seiner ursprünglichen Form hätte
> den Prüflauf rot gemacht.**
>
> **Zu tun bleibt in BA 6 also nichts an den Nummern** — nur die drei
> Papierverweise fallen. *Der Rest des Bauabschnitts ist das Urteil über die
> README.*

**Und die Frage, die der Betreiber gestellt hat: liest sich die README noch
sinnvoll?** *Sie ist über dreißig Runden gewachsen, und niemand hat sie je als
Ganzes gelesen.* **Zu prüfen ist:** ob die Abschnitte noch in der Reihenfolge
stehen, in der jemand sie braucht; ob etwas doppelt erklärt wird; ob etwas
beschrieben wird, das es nicht mehr gibt.

*Das ist Lesen und Urteilen, nicht Streichen — und deshalb ein eigener
Bauabschnitt.*

### BA 7 — Der Wächter über die Papierverweise

**Für die Versionsnummern gibt es einen** *(„Keine Versionsnummer als Herkunft",
eine Latte je Datei, die nur fallen darf)*. **Für den Pfad `Doku/` gibt es
einen** *(über vierundzwanzig Dateien)*. **Für den Namen ohne Pfad gibt es
keinen — das ist die Lücke, durch die 187 Verweise stehen geblieben sind**,
*und 94 Abkürzungen dazu.*

**Der dritte Wächter derselben Form:** kein Kommentar einer ausgelieferten
Datei nennt „Befund", „Bauabschnitt", „Auftrag", „Projektstand", „Konzept",
„Farbkonzept" oder „Änderungsprotokoll".

> **DIE WORTLISTE WAR UNVOLLSTÄNDIG, UND DAS IST DIE GRÖSSTE LÜCKE DES
> AUFTRAGS.** *Drei weitere Verweisformen stehen in ausgelieferten Dateien und
> sind in keiner Zahl dieses Auftrags:*
>
> | Form | Stellen | wo |
> |---|---:|---|
> | `BA <Zahl>` — die Abkürzung von „Bauabschnitt" | **39** | `server.js` 17, `public/style.css` 13, `public/app.js` 9 |
> | `(F<Zahl>)` — Fragetafelnummern | **52** | `public/app.js` 22, `public/style.css` 20, `server.js` 9, `db.js` 1 |
> | `Punkt <Zahl>` — Nummern des Sammelblatts | **3** | `db.js` 1, `server.js` 2 |
>
> **Zusammen 94 Stellen.** *`CLAUDE.md`, Abschnitt 2 nennt die
> Fragetafelnummer sogar namentlich („F10").* **Ohne sie in der Wortliste
> räumt die Runde sie nicht, und der Wächter danach fängt sie nie.**
>
> **Und „Stolperstein" gehört dazu**, obwohl es heute auf **0** steht: 0.35.2
> hat fünfzehn gestrichen. *Genau deshalb — damit die Null eine Null bleibt.*

> **EINE DATEILISTE FEHLT, UND DIE BEIDEN VORHANDENEN WÄCHTER SIND SICH UNEINS.**
> *Der Nummernwächter liest 20 Dateien — mit den drei Sprachdateien und
> `public/favicon.svg`, ohne `README.md`, `manual-de.md`, `log.js`, `Dockerfile`
> und `docker-compose.example.yml`. Der `Doku/`-Wächter liest 24 — mit
> `README.md`, `manual-de.md`, `CHANGELOG.md` und `package.json`, ohne die drei
> Sprachdateien.* **Welche Liste der neue Wächter nimmt, entscheidet F11.**
>
> **Daran hängt `CHANGELOG.md`.** *Er steht im Bestand des `Doku/`-Wächters und
> trägt 11 Vorkommen — „Projektstand, Abschnitt 5.1", „Änderungsprotokolle sind
> unangetastet".* **Ein Änderungsprotokoll muss die Papiere nennen dürfen, die
> es fortschreibt**, sonst ist der neue Wächter am Tag seiner Einsetzung rot.

> **DER NEUE WÄCHTER MUSS DIE SQL-KOMMENTARE MITLESEN.** *Arbeitet er auf den
> COMMENT-Teilen von `tools/segments.js`, sieht er die sieben Papierverweise im
> `SCHEMA`-String von `db.js` nicht, und die Latte stünde auf null, obwohl sie
> dastehen.* **Der Nummernwächter liest den rohen Text und zählt sie sehr wohl
> mit — die beiden Wächter würden verschiedene Bestände messen.**

**Und die beiden alten Latten fallen.** *Eine Latte, die nur fallen darf, ist
der halbe Weg.* **Auf null kommen sie nicht** — fünfzehn Treffer sind keine
Fassungsnummern, sechs verlangt die Anleitung, zwei verlangt der Prüfstand,
und was `db.js` behält, sagt F7. **Die Latte lautet: genau diese und keine
weitere.**

> **`VN_TOTAL` IST KEINE LATTE, SONDERN EINE GLEICHHEIT.** *`test/source.js`:2045
> hält 770 und vergleicht mit `===`.* **Die erste Nummer, die BA 1 herausnimmt,
> macht diese Prüfung rot** — sie gehört in jedem Bauabschnitt nachgezogen,
> nicht erst in BA 7.

### BA 8 — Die vier ausgelieferten Dateien ohne Bauabschnitt

**`public/index.html`, `.env.example`, `docker-compose.example.yml` und
`Dockerfile` tragen Kommentare und standen in keinem Bauabschnitt.**

`public/index.html` trägt **4 Treffer** und steht mit dieser Latte im
Nummernwächter — *alle vier sind Herkunftsangaben in Kommentaren und fallen.*
`.env.example` trägt Kommentare und einen Rückbau *(1099, an einem
`#`-Kommentar)*. Die beiden anderen tragen keine Nummer.

**Ohne diesen Bauabschnitt ist Zusage 4 nicht einzulösen.**

### BA 9 — Der Prüfstand wird nachgezogen

**Der Prüfstand wird nicht mitverdichtet** *(F5)*, **aber er muss an acht
Stellen nachgezogen werden.** Keine davon stand im Auftrag.

| | Stelle | was zu tun ist |
|---|---|---|
| **1** | **15 Rückbauten**, deren Suchtext Kommentartext einer ausgelieferten Datei trägt | Suchtext auf die Codezeile daneben ziehen |
| **2** | **vier benannte Prüfungen**, die einen Kommentar im Wortlaut zitieren | Zitat nachziehen oder die Prüfung gegen die Sprachdatei stellen |
| **3** | `COMMENT_ROWS` und `COMMENT_TOTAL` *(`test/selfcheck.js`:396–432)* | `node tools/comments.js --write` trägt sie selbst ein |
| **4** | `VN_TOTAL = 770` *(`test/source.js`:2045)* | je Bauabschnitt nachziehen |
| **5** | `VN_CEILING`, 20 Dateien | auf die Liste aus F11 bringen |
| **6** | `gpList.length === 1062` *(`test/selfcheck.js`:25)* | um die neuen Rückbauten |
| **7** | die sechs Gleichlaufsummen *(`test/release_031.js`:519, 859, 863)* | siehe Zusage 5 und F9 |
| **8** | `driverScore` 7/8 *(`test/selfcheck.js`:791)* | falls die neue Prüfung in die Gruppe „Kein Stolpersteinverweis mehr" kommt |

**Die fünfzehn stehen namentlich:** `public/app.js` 291, 457, 541, 542, 593,
747, 795; `server.js` 54, 810; `public/style.css` 428, 1089; `auth.js` 103;
`batchrun.js` 515; `db.js` 1115; `.env.example` 1099.

> **GEZÄHLT IST DER SUCHTEXT.** *Nimmt man den Ersatztext dazu — ein Rückbau,
> der einen Kommentar einsetzt statt ihn zu suchen —, sind es* **21**. *Die
> sechs weiteren brechen nicht, sie werden nur unsinnig.*

> **VIERZEHN TRAGEN DEN KOMMENTAR NUR ALS ANKER** — dort genügt es, den
> Suchtext auf die Codezeile daneben zu ziehen. **Einer ist härter:**
> **747 trägt eine Versionsnummer im Suchtext** und bricht schon am reinen
> Nummernsweep, bevor überhaupt verdichtet wird.

> **UND ZWEI BEWACHEN GENAU DIE REGELN DIESER RUNDE:** 1089 hängt an einem
> Block des Stilblatts *(„Ein Block des Stilblatts wird wieder lang")*, 1115 an
> einer SQL-Kommentarzeile von `db.js` *(„Eine SQL-Zeile des Schemas nennt
> wieder eine Nummer")*. **Wer sie nachzieht, fasst den Wächter an, der die
> Runde belegt** — das gehört gelesen, nicht ersetzt.

> **DIE VIER ZITATE STEHEN NAMENTLICH:** `test/selfcheck.js`:631 verlangt
> „substr() AUF EINEM BLOB LIEST DAS BLOB" in `server.js`, `:636` die
> nachgefahrene Messung „400 ZEILEN A 512 kB (312 MB)" samt „1338,8 ms",
> `test/ui_style.js`:1482 „IN 0.19.2 ABGEBAUT WORDEN" in `public/app.js`,
> `test/ui_export.js`:527 den Wortlaut „zwei Merkmale, zwei Kanäle" samt
> `0.12.3` in `public/style.css`. *Zwei davon verlangen ausdrücklich, dass eine
> Versionsnummer im Kommentar stehen bleibt.* **Ob es mehr als vier sind, ist
> nicht abschließend gemessen — es ist die Untergrenze.**

> **UND EINE PRÜFUNG IST SCHON HEUTE FALSCH GEBAUT.** *`test/source.js`:583
> will belegen, dass „Einladungslink" am Bildschirm steht, liest dafür aber
> `public/app.js` — wo das Wort ausschließlich in drei Kommentaren vorkommt.*
> **Fällt einer davon, wird die Prüfung rot, ohne dass sich am Bildschirm etwas
> geändert hat.** Sie gehört gegen `public/languages/de.json` gestellt.

### BA 10 — Papiere

Änderungsprotokoll 0.37.0, CHANGELOG, Fahrplanzeile auf GEBAUT, Projektstand,
Sammelblatt: **Punkt 42 bekommt eine neue Zahl**.

> **PUNKT 43 SCHLIESST NUR, WENN `tools/comments.js` DAS STILBLATT MITZÄHLT.**
> *Der Punkt nennt drei offene Schritte, und der dritte lautet wörtlich:
> „`tools/comments.js`, das das Stilblatt nicht mitzählt".* **Die Liste
> `SHIPPED` in `tools/comments.js` führt die vierzehn JavaScript-Module;
> `public/style.css` steht nicht darin.** *Ohne die Erweiterung schließt BA 10
> zwei von drei Schritten — dann sagt es der Eintrag auch so.*

> **UND `CLAUDE.md`, ABSCHNITT 2 TRÄGT DIESELBEN ZAHLEN.** *Der Stand vom
> 19. September 2026 steht dort wortgleich.* **Jede Berichtigung dieser Runde
> läuft an beiden Stellen.**

---

## 5. Zusagen an den Prüfstand

1. **Kein Verhalten ändert sich.** Diese Runde fasst ausschließlich Kommentare
   an — mit der einen Ausnahme aus BA 4, und die steht namentlich im Protokoll.
2. **Die Zahl der Prüfungen bleibt gleich**, bis auf die neuen Wächter. *Der
   Prüfstand wird nicht verdichtet, aber an den acht Stellen aus BA 9
   nachgezogen.*
3. **`public/languages/*.json` wird nicht angefasst.** Kein Satz am Bildschirm
   ändert sich.
4. **Die drei Latten nennen danach genau, was bleiben darf, und sonst nichts** —
   fünfzehn Treffer, die keine Fassungsnummern sind, die sechs der Anleitung,
   die zwei vom Prüfstand verlangten und was F7 für `db.js` entscheidet.
   `Doku/`-Pfade und Papierverweise über den Namen stehen auf null.
5. **Die sechs Gleichlaufsummen bleiben gleich — oder sie werden in derselben
   Runde neu eingetragen, und dann sagt das Protokoll warum.**
6. Gegenprobenlauf über die neuen Wächter **und über die fünfzehn
   nachgezogenen Rückbauten**, **0 stumm**.
7. Der Fingerprint ändert sich — erwartet, und zwar an jeder ausgelieferten
   Datei.
8. **`node tools/comments.js --write` ist vor dem ersten vollen Lauf gefahren.**
   *Sonst ist der Prüflauf nach jedem einzelnen Bauabschnitt rot.*

> **ZUSAGE 5 TRUG NICHT, WAS DER AUFTRAG IHR ZUSCHRIEB — GEMESSEN, NICHT
> VERMUTET.**
>
> **Erstens liest `tools/gleichlaut.js` nur `public/app.js`** und die drei
> Sprachdateien *(Zeilen 53 und 111)*. **Über `server.js`, die zwölf kleinen
> Module und `public/style.css` sagt sie nichts** — also über BA 1, BA 3, BA 4
> und BA 5 nichts. *Sie deckt BA 2 ab, und das ist ein Fünftel der Runde.*
>
> **Zweitens ändern sich die sechs Summen sehr wohl, wenn Kommentar fällt.**
> *Der Filter streicht Zeilenkommentare nur am Zeilenanfang:*
> `.replace(/^[ \t]*\/\/.*$/gm, ' ')`. **Die 29 nachgestellten
> `//`-Kommentare in `public/app.js` stehen im gemessenen Text.** Nachgemessen:
> fällt der nachgestellte Kommentar weg, wird `de/one` von `9ecf77638a43ca46`
> zu `3601c96b846df672`, und alle sechs Summen weichen ab.
>
> **Drittens stehen die sechs als Konstanten im Prüfstand und werden mit `===`
> verglichen** *(`test/release_031.js`:519, 859, 863)*. **Fünf Prüfungen werden
> rot, sobald ein nachgestellter Kommentar fällt.**
>
> **Der Weg steht in F9.**

> **WAS STATTDESSEN BELEGT, DASS NUR KOMMENTAR GEFALLEN IST.** *Der Weg ist
> schon gebaut, in `test/source.js`:2753 für das Stilblatt:* **die Zahl der
> Zeilen zählen, auf denen außerhalb eines Kommentars etwas steht.** *Diese
> Zahl ist kommentarfest, und sie lässt sich für `server.js` und die zwölf
> kleinen Module genauso bilden.* **Das ist die Zusage, die diese Runde
> wirklich geben kann.**

---

## 6. Was verworfen wird

| | was | warum |
|---|---|---|
| **V1** | **Die Kommentare mit einem Skript kürzen** | jeder Block muss gelesen und entschieden werden: trägt er eine gemessene Zahl, einen Grund für eine Reihenfolge, eine Absage — oder erzählt er? Das kann kein Skript, und ein Wächter kann es hinterher auch nicht prüfen |
| **V2** | **Eine Quote je Datei erzwingen** | `tools/comments.js` nennt schon ein Ziel, und über dem Ziel liegen **neun** Dateien *(nicht drei, wie der Auftrag sagte)*. Eine schärfere Quote nähme gemessene Zahlen heraus |
| **V3** | **Den Prüfstand mitnehmen** | 12.000 Kommentarzeilen in zwanzig Dateien. **Die alte Begründung stimmte nicht:** `tools/publish.js` lässt nur `Doku`, `CLAUDE.md` und zwei Werkzeuge weg — **68 Dateien gehen hinaus, 21 davon sind der Prüfstand.** Er bleibt trotzdem draußen, aber aus einem anderen Grund: *er muss die Nummern nennen dürfen, sonst kann er keine bewachen.* Eine eigene Zeile im Fahrplan, ohne Nummer |
| **V4** | **`public/style.css` auf dreißig Prozent bringen** | Punkt 42, und dort steht: die Zahlen in den Kommentaren sind die Begründung der Werte darunter |

---

## 7. Wie diese Runde gefahren wird

| Phase | Form |
|---|---|
| **Vorlauf 1** | `node tools/comments.js --write` — **ohne ihn ist der Lauf nach jedem Bauabschnitt rot** |
| **Vorlauf 2** | die sechs Gleichlaufsummen und die Zahl der Zeilen mit Code außerhalb eines Kommentars je Datei festhalten, **bevor** etwas fällt |
| **Vorlauf 3** | die fünfzehn Rückbauten und die vier Kommentarzitate aus BA 9 auf eine Liste — *sie werden Bauabschnitt für Bauabschnitt abgearbeitet, nicht am Ende* |
| **BA 1 bis BA 6 und BA 8** | je ein Schreiber, je ein voller Lauf, je ein Commit. **In jedem Lauf: `VN_TOTAL` nachziehen und `node tools/comments.js --write`** |
| **BA 9** | die Stellen, die in den Bauabschnitten davor nicht schon nachgezogen wurden |
| **BA 7 danach** | erst räumen, dann den Wächter setzen — sonst ist die Runde dazwischen rot |
| **BA 10 zuletzt** | die Papiere, wenn alle Zahlen am fertigen Stand stehen |
| **Gegenproben** | über die neuen Wächter **und über die fünfzehn nachgezogenen Rückbauten**, **nie gleichzeitig mit dem Prüfstand** |
| **Vor dem Push** | `npm test` vollständig, die sechs Gleichlaufsummen gegen den Vorlauf **und** die Zahl der Codezeilen je Datei gegen den Vorlauf |
