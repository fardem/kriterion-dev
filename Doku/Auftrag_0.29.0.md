# Auftrag 0.29.0 — „Worauf man sich verlassen können muss"

**Fünf geplante Punkte und zwei Befunde aus dem Betrieb · geschrieben am
11. September 2026 · gebaut auf 0.28.1.**

---

## Was in dieser Runde passiert

**DIES IST DIE LETZTE RUNDE, DIE DAS SCHEMA ANFASSEN DARF.** *Danach kommt der
Bruch auf 0.33.0, und was danach ein Feld braucht, steht allein gegen eine
festgeschriebene Struktur.* **Deshalb liegen die beiden Punkte mit
Datenbankanteil genau hier und nicht später.**

**DER NAME IST DAS PROGRAMM.** *Drei der fünf geplanten Punkte handeln von
derselben Frage: woran erkennt man, dass eine Sache wirklich so ist, wie sie
dasteht?* **Eine Sicherung, die nie geöffnet wurde, ist eine Vermutung. Ein
Fingerprint, der nur „irgendetwas weicht ab" sagt, schickt auf eine Suche. Eine
Adresse ohne `UNIQUE` ist ein Versprechen ohne Schloss.**

**UND ZWEI BEFUNDE AUS DEM LAUFENDEN 0.28.1 FAHREN MIT.** *Betreiber,
11. September 2026:* „Ich würde ungern wegen den Befunden eine eigene Runde
machen und deswegen nachfolgende mit 0.29.0 kombinieren."

> **EINER DAVON IST EIN FEHLER AUS 0.28.1 SELBST.** *Die Filterzeile ist mit
> jener Runde ein Raster geworden, und die Verweise am Zeilenende haben darin
> `grid-column: 1 / -1` bekommen — von Claude.* **Für den Vermerk „folgt der
> Sortierung" war das richtig, für einen 46 Pixel breiten Umschalter ist es
> Verschwendung.** *Er steht seither allein auf einer Zeile von 366.*

---

## Der Fingerprint des Vorgängers

| Quelle | Wert |
|---|---|
| **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`452d1764`** |
| **Am Arbeitsbaum nachgerechnet** *(dieselben achtzehn Dateien)* | **`452d1764`** |
| **Aus der laufenden Installation gemeldet** *(Betreiber, 11. September 2026)* | **`452d1764`** |

> **DREI QUELLEN, EIN WERT — und zum dritten Mal in Folge lag die Bestätigung
> aus dem Feld vor, bevor die nächste Runde anfing.** *Am Wirt läuft 0.28.1.*
>
> **ER IST WÄHREND 0.28.1 ZWEIMAL GEWANDERT** — `7ab6ae75` → `432e64ad` →
> `452d1764` —, *jedes Mal wegen eines **Kommentars**, der beim Gegenlesen des
> eigenen Diffs berichtigt wurde.* **Ein Kommentar bewegt ihn genauso wie eine
> Anweisung.**

**Der Vorgänger im Überblick:** 0.28.1 · **6611 Prüfungen** · **859
Rückbauten** · `F_ROUTES` = **72** · lesende Routen **31** · Austauschformat
**15** · **elf** Migrationsblöcke · **neunzehn** Karten · **16**
Fensterabfragen und **zwei** Behälterabfragen.

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

> **REGEL 11: GEBAUT WIRD ERST, WENN JEDE FRAGE BEANTWORTET UND IM PAPIER
> EINGETRAGEN IST.** *In 0.28.0 und 0.28.1 ist das eingehalten worden, beide
> Male mit Gewinn — die Antwort auf F10 hat in 0.28.1 die Bauweise geändert,
> nachdem gemessen war.*
>
> **DIE SPALTE „VORSCHLAG VON CLAUDE" IST EIN VORSCHLAG UND KEINE ANTWORT.**

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F1** | **Wie heißt die Sicherungsprobe am Bildschirm?** *„Probe öffnen", „Sicherung prüfen", „Nachsehen"?* | **„Sicherung prüfen".** *Es ist das Wort, das die Handlung benennt, und es verspricht nicht mehr, als geschieht: die Datei wird geöffnet, gezählt und wieder zugemacht* | |
| **F2** | **Was zählt die Probe?** *Einträge, Bilder, Zugänge, Datum — oder mehr?* | **Genau diese vier.** *Sie beantworten „ist die Sicherung die, die ich meine?". Eine längere Liste wird nicht gelesen, und jede weitere Zahl ist eine weitere Abfrage auf einer fremden Datei* | |
| **F3** | **Bekommt die Probe eine eigene Route?** *`F_ROUTES` steigt dann von 72 auf 73* | **Ja, eine schreibende** *(`POST /api/backup/check`)*. **Sie schreibt nichts in den Bestand, aber sie öffnet eine Datei und kostet Zeit** — *ein `GET`, das eine Datenbank öffnet, lädt zum Nachladen ein.* `F_ROUTES` **72 → 73** | |
| **F4** | **Darf die Probe eine Sicherung öffnen, die mit einem ANDEREN Schlüssel verschlüsselt ist?** | **Nein, und sie sagt es.** *Sie meldet „mit diesem Schlüssel nicht lesbar" statt eines Fehlers.* **Das ist selbst eine Auskunft** — wer sie sieht, weiß, dass seine `.env` nicht zu seiner Sicherung passt | |
| **F5** | **Der Fingerprint nennt die abweichende Datei — wie viele Namen höchstens?** | **Alle, die abweichen.** *Eine gekürzte Liste ist genau dann falsch, wenn es darauf ankommt.* **Bei achtzehn Dateien ist die längste Liste achtzehn Zeilen, und sie steht nur im Fehlerfall da** | |
| **F6** | **Woher kennt die Karte die Sollwerte der einzelnen Dateien?** | **Der Server rechnet sie mit** — *dieselbe Schleife, die den Fingerprint bildet, legt die achtzehn Einzelwerte daneben.* **Kein zweiter Leser und keine zweite Liste** *(Stolperstein 47)* | |
| **F7** | **Das Fälligkeitsdatum: an der Aufgabe oder am Eintrag?** | **An der Aufgabe.** *`comments` trägt die Aufgaben schon (`kind = 'task'`), und ein Datum daneben ist eine Spalte.* **Am Eintrag wäre es eine Aussage über etwas anderes** | |
| **F8** | **Wie sortiert „Offen" mit dem neuen Datum?** | **Überfällig, heute, später — und ohne Datum hinten.** *Dieselbe Regel wie bei den Einträgen ohne Testtage: wer keine Zahl hat, hat keinen niedrigen Wert, sondern gar keinen* | |
| **F9** | **Sieht man „überfällig" auch in der Übersicht?** *Heute zählt die Glocke nur* | **Nein — diese Runde nicht.** *Die Glocke ist ausdrücklich schlank gebaut und trägt einen Zeitstempel und keine Tabelle.* **Ein Datum, das sich meldet, ist ein zweites Vorhaben** | |
| **F10** | **Der partielle Index auf `users.email`: was geschieht mit Datenbanken, die HEUTE schon zwei gleiche Adressen tragen?** | **Der Index wird nicht angelegt, und die Karte sagt es.** *`CREATE UNIQUE INDEX` scheitert dort, und ein stiller Fehlschlag wäre die schlimmste Antwort.* **Die Instanz läuft weiter; in „Benutzer" steht, welche Adressen doppelt sind** | |
| **F11** | **Die dritte Rasterspalte der Filterzeile** *(Befund 6)*: **gemessen 40 px zugeklappt, 79 aufgeklappt** | **Bauen.** *Der Umschalter steht dann am Ende seiner Zeile statt auf einer eigenen, und er bleibt — er spart weiter 104 px* | |
| **F12** | **Der Und/Oder-Umschalter der Marken spannt weiter über beide Spalten** — 362 px für einen kleinen Schalter | **Erst messen, dann vorschlagen.** *Dieselbe Antwort, die der Betreiber in 0.28.1 zu F4 verlangt hat — und dort hat die Messung die Antwort geändert* | |
| **F13** | **Der Kategoriekasten** *(Befund 7)*: **gibt die Auswahl Breite ab?** | **Ja: 119/137 statt 148/108.** *Die Auswahl zeigt einen Namen, den man wiedererkennt; das Feld nimmt einen, den man tippt.* **Wer tippt, braucht mehr Platz als wer liest** | |
| **F14** | **Wird der Platzhalter gekürzt?** *„Neue Kategorie, Enter" braucht 238 px* | **Ja — „Neue Kategorie".** *Der Hinweis auf Enter steht schon im Knopf daneben, und er ist heute ohnehin abgeschnitten.* **Er steht in drei Sprachen** | |
| **F15** | **Die Nummer: 0.29.0 als MINOR?** | **Ja.** *Das Fälligkeitsdatum ist eine Funktion, und das Austauschformat steigt auf 16 — nach Regel 5.1 ist das mindestens MINOR.* **Die beiden Befunde aus dem Betrieb heben sie nicht weiter** | |

---

## Der Befund

### 1 — es gibt Sicherungen, die noch nie jemand geöffnet hat

**EINE SICHERUNG OHNE PROBE IST EINE VERMUTUNG.** *Die Instanz legt sie über
`VACUUM INTO` an (`server.js:7619`) — vollständig, verschlüsselt, mit demselben
Schlüssel wie die laufende Datenbank. Ob eine bestimmte Datei sich wirklich
öffnen lässt, weiß niemand, bis jemand sie zurückspielt.*

> **DAS EXPORTIEREN IST ETWAS ANDERES, und der Betreiber hat es geprüft.**
> *Der Austausch schreibt eine JSON-Datei nach Austauschformat; die Sicherung
> ist die **verschlüsselte Datenbank selbst**.* **Was für die eine gilt, sagt
> über die andere nichts.**

**GEBAUT WIRD EIN WEG, DER EINE SICHERUNGSDATEI PROBEWEISE ÖFFNET, ZÄHLT UND
WIEDER ZUMACHT** — ohne die laufende Datenbank anzufassen. Die Karte sagt
danach: *so viele Einträge, so viele Bilder, so viele Zugänge, dieses Datum.*

### 2 — der Fingerprint sagt nur, DASS etwas abweicht

**Heute steht auf der Karte „Kennzahlen" ein Wert** *(`public/app.js:11904`)*,
und wenn er nicht stimmt, **sagt nichts, welche der achtzehn Dateien es ist.**
*Der Handgriff dagegen steht in der README — eine Schleife über `sha256sum`,
die man von Hand in einen Container tippt.*

> **BEI 0.9.1 HAT SICH DORT EINE DATEI ZU VIEL GEZEIGT.** *Der Fingerprint
> schlägt in beide Richtungen aus: auch eine Datei ZU VIEL ändert ihn.*

**KEINE DAUERHAFTE ZEILE UND KEIN ÜBERFAHRTEXT** *(Betreiber, „muss keine
extra Zeile")*: **stimmt alles, steht dort nichts.** *Weicht etwas ab, steht
die Karte ohnehin auf Rot — und dann ist die Liste der Dateien genau das, was
man sucht.* **Ein Überfahrtext wäre auf dem Telefon gar nichts**, und der Ort,
an dem man einen abweichenden Fingerprint bemerkt, ist genauso oft das Telefon.

### 3 — eine Aufgabe hat kein Datum

**Die Aufgabenliste über alle Einträge gibt es seit der Ansicht „Offen".** *Eine
Aufgabe ist ein Kommentar mit `kind = 'task'` (`db.js:365`); erledigt heißt
`kind = 'done'`.* **Ein Fälligkeitsdatum gibt es nicht.**

**SO WIRD ES GEBAUT:**

* **Ein Datum, keine Uhrzeit.** *Eine Aufgabe in einem Bewertungsarchiv ist an
  einem Tag fällig und nicht um 14:30. Eine Uhrzeit wäre eine Genauigkeit, die
  niemand pflegt — und ein Feld, das niemand pflegt, wird zur zweiten Wahrheit.*
* **Eine Spalte an `comments`**, keine neue Tabelle. **Das ist der Schemaanteil
  dieser Runde.**
* **Freiwillig.** *Ohne Datum ist eine Aufgabe genau das, was sie heute ist.*
* **Drei Zustände in „Offen": überfällig · heute · später.** *Ohne Datum hinten.*
* **KEINE Benachrichtigung, kein Wecker, keine Mail.**
* **Das Austauschformat steigt auf 16** *(`server.js:6237`)* — *ein Feld, das
  im Export fehlt, ist beim nächsten Einspielen weg.*

### 4 — `users.email` hat kein `UNIQUE`

**Und das ist kein Versehen** *(`db.js:461`)*: *`ALTER TABLE` kann eines nicht
nachrüsten, und die gewanderte und die frisch angelegte Datenbank wären damit
**verschieden gebaut**.*

**DER RICHTIGE WEG IST EIN PARTIELLER INDEX** — er wirkt auf beiden Wegen
gleich und lässt mehrere Zugänge ohne Adresse zu:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS ... ON users(email) WHERE email IS NOT NULL
```

**DIE ZWEITE HÄLFTE IST SCHON ENTSCHIEDEN:** *hinter der Anmeldung wird eine
doppelte Adresse im Klartext gesagt („Diese Adresse ist bereits vergeben") — wer
das sieht, ist angemeldet und sieht die Liste ohnehin.* **Vor der Anmeldung gilt
das Gegenteil**: dort ist jede unterschiedliche Antwort ein Werkzeug zum
Durchprobieren.

### 5 — Mails kommen an und landen bei Google im Spam

> **BETREIBER:** *Mails kommen an, landen bei Google aber im Spam — und er
> vermutet, es liege daran, dass die Adresse des Servers und die der Domain
> auseinandergehen.*

**DIE VERMUTUNG TRIFFT, UND EIN ANDERER VERSANDWEG HILFT NICHT DAGEGEN.**
*Dass eine Mail im Spam landet, entscheidet nicht der Weg, auf dem sie den
Server verlässt, sondern **ob die Domain den Absender deckt**.* **Drei Einträge
im Namensdienst tun das:**

| | |
|---|---|
| **SPF** | sagt, wer für diese Domain senden darf |
| **DKIM** | unterschreibt jede Mail, und der Empfänger prüft die Unterschrift |
| **DMARC** | sagt, was mit einer undeckten Mail geschehen soll |

**EIN DIENST WIE BREVO ODER POSTMARK HILFT TROTZDEM** — *aber nicht wegen
HTTPS, sondern weil er die drei Einträge mitbringt und von Adressen sendet,
denen die Empfänger schon trauen.* **Und genau dieser Dienst lässt sich über
SMTP ansprechen, was die Instanz heute kann.** *Es wäre also neuer Code für
etwas, das der vorhandene schon leistet.*

**DIESE RUNDE SCHREIBT DESHALB KEINEN CODE, SONDERN EINEN ABSCHNITT IN DIE
README.** *Der Sammelblattpunkt „ein Versanddienst über HTTPS statt SMTP" ist
damit erledigt — aber nicht, indem er gebaut wird.*

### 6 — der Umschalter der Tagzeile kostet eine Rasterzeile

> **BETREIBER, am laufenden 0.28.1, mit Bild** *(11. September 2026)*:
> „Ehrlich gesagt stört mich noch, dass Tags nun doch nur für Tags eine Zeile
> nimmt. … So nimmt ein Wort eine Zeile Platz und sieht falsch aus."

**ER HAT RECHT, UND DIE URSACHE IST 0.28.1 SELBST** — `.frow-right` bekam im
neuen Raster `grid-column: 1 / -1`. **Der Umschalter „Tags" ist 46 px breit und
steht damit allein auf einer Zeile von 366.**

**GEMESSEN** *(390 × 844, aufgeklappte Filter, zehn Tags)*:

| | Filterkasten | Kategoriezeile | erste Kachel |
|---|---|---|---|
| heute, zugeklappt | 252 px | **75 px** | y = 464 |
| heute, aufgeklappt | 395 px | 75 px | y = 607 |

*Eine Filterzeile ohne solchen Verweis misst 35 px — **der Umschalter kostet 40
Pixel**, in jedem Zustand.*

**DER VORSCHLAG DES BETREIBERS — den Umschalter fallen lassen und die Tagzeile
immer zeigen — IST GEMESSEN WORDEN UND KOSTET 143 PIXEL MEHR.** *Die Tagzeile
belegt im neuen Raster **vier** Zeilen: Beschriftung, Und/Oder-Umschalter,
Wolke, Verweise.* **Der Betreiber hat es selbst vermutet** *(„ja Tags könnte
tatsächlich dem widersprechen")* — **und die Messung gibt ihm recht.**

**WAS STATTDESSEN GEBAUT WIRD: eine DRITTE Rasterspalte für die Verweise.**

| | Filterkasten | Kategoriezeile | Tagzeile | erste Kachel |
|---|---|---|---|---|
| heute, zugeklappt | 252 px | 75 px | — | y = 464 |
| **drei Spalten, zugeklappt** | **212 px** | **35 px** | — | **y = 424** |
| heute, aufgeklappt | 395 px | 75 px | 134 px | y = 607 |
| **drei Spalten, aufgeklappt** | **316 px** | **35 px** | **94 px** | **y = 527** |

**VIERZIG PIXEL ZUGEKLAPPT, NEUNUNDSIEBZIG AUFGEKLAPPT** — *und der Umschalter
bleibt, weil er weiter 104 Pixel spart.*

### 7 — der Anlegeknopf der Kategorie steht verwaist unter seinem Feld

> **BETREIBER, mit Bild und Skizze:** „sieht man das Anlegen-Button unten ist
> und sieht verwaist aus. Rechts ist Platz da ohne Sinn." — *und als Frage
> nachgereicht:* „das Hinzufügen rechts vom Namen zu halten. Würde je eine Zeile
> sparen?"

**DIE ANTWORT IST JA, und sie ist gemessen** *(390 px, Spalte 366 px)*:

| | Kasten | Zeilen | Auswahl | Feld | Knopf |
|---|---|---|---|---|---|
| **heute** | 161 px | **2** | 148 | 210 | 94 *(allein auf Zeile 2)* |
| **die Skizze** | **110 px** | **1** | 148 | **108** | 94 |
| *ausgeglichen* | 110 px | 1 | **119** | **137** | 94 |
| *Claudes Vorschlag: Auswahl oben, Feld + Knopf darunter* | 156 px | 2 | 366 | 264 | 94 |

**EINUNDFÜNFZIG PIXEL UND EINE ZEILE.** *Die letzte Zeile war Claudes
Vorschlag — die Skizze des Betreibers ist besser und spart zehnmal so viel.*

**DIE TAGZEILE IM EINTRAG IST NICHT BETROFFEN:** *ihre Eingabereihe misst
bereits **43 px in einer Zeile**.* **„Je eine Zeile" gilt für die Kategorie.**

> **DER PLATZHALTER IST HEUTE SCHON ABGESCHNITTEN.** *„Neue Kategorie, Enter"
> braucht 238 px; im heutigen Feld sind 186 px Platz — es fehlen 52.* **Das
> Abschneiden ist also älter als dieser Befund**, und die eigentliche Abhilfe
> ist ein **kürzerer Platzhalter** und kein breiteres Feld *(F14)*.

---

## Die Bauabschnitte — und was dabei WEGFÄLLT

| | was | was fällt |
|---|---|---|
| **BA 1** | **Die Sicherungsprobe** *(Befund 1)* — ein Weg, der eine Datei öffnet, zählt und zumacht | *nichts fällt.* **`F_ROUTES` 72 → 73** *(F3)*, und die Zahl wird im Prüfstand nachgezogen |
| **BA 2** | **Der Fingerprint nennt die Datei** *(Befund 2)* — achtzehn Einzelwerte neben dem Gesamtwert, sichtbar nur im Fehlerfall | *nichts fällt.* **Die lesende Route `/api/stats` trägt sie mit** — kein neuer Weg |
| **BA 3** | **Das Fälligkeitsdatum** *(Befund 3)* — eine Spalte an `comments`, drei Zustände in „Offen" | **Das Austauschformat steigt auf 16.** *Der **zwölfte** Migrationsblock kommt dazu* |
| **BA 4** | **Der partielle Index** *(Befund 4)* — und der Klartext hinter der Anmeldung | *nichts fällt* |
| **BA 5** | **Der README-Abschnitt zur Zustellbarkeit** *(Befund 5)* | **Ein Sammelblattpunkt fällt** — „Versanddienst über HTTPS", erledigt ohne Code |
| **BA 6** | **Die dritte Rasterspalte** *(Befund 6)* | *keine Regel fällt; `grid-template-columns` und die Spaltenzuweisungen ändern sich* |
| **BA 7** | **Der Kategoriekasten** *(Befund 7)* | **Ein Platzhalter wird gekürzt, in drei Sprachen** *(F14)* — der Schlüssel bleibt |

> **DAS SCHEMA WIRD ANGEFASST — EINMAL, UND ZUM LETZTEN MAL VOR DEM BRUCH.**
> *Eine Spalte an `comments`, ein partieller Index auf `users`.* **Das
> Austauschformat geht von 15 auf 16, die Migrationsblöcke von elf auf zwölf.**

---

## Die Nummer und ihre Begründung

**0.29.0 ist MINOR — Regel 5.1.** *Das Fälligkeitsdatum ist eine **Funktion**:
die Instanz kann danach etwas, was sie vorher nicht konnte. Dazu ein
Schemaschritt und ein höheres Austauschformat.* **Jede dieser drei Angaben
allein genügte schon.**

**DIE BEIDEN BEFUNDE AUS DEM BETRIEB HEBEN SIE NICHT WEITER.** *Sie sind
Reparaturen und fahren mit, weil der Betreiber keine eigene Runde dafür wollte
(11. September 2026).* **Der Fahrplan rückt nicht.**

---

## Der Prüfstand — was er halten muss

**Jede Zusage benannt, jede neue mit GEFAHRENER Gegenprobe, fortlaufend
nummeriert ab 869.** *Ein STUMM ist ein Fund und kein Versehen.*

| | Zusage | Gegenprobe zielt auf |
|---|---|---|
| **1** | **Die Sicherungsprobe öffnet eine echte Datei und zählt richtig** — an einer angelegten Sicherung gefahren, nicht am Quelltext | die Zahlen aus der laufenden Datenbank nehmen |
| **2** | **Und sie fasst die laufende Datenbank nicht an** — Bestand vorher und nachher verglichen | sie auf die laufende zeigen lassen |
| **3** | **Eine Sicherung mit fremdem Schlüssel wird als solche gemeldet** und nicht als Fehler | den Fehler durchreichen |
| **4** | **`F_ROUTES` steht auf 73, und der neue Weg ist der benannte** | einen zweiten dazunehmen |
| **5** | **Stimmt der Fingerprint, steht keine Dateiliste da** | sie dauerhaft zeigen |
| **6** | **Weicht eine Datei ab, steht GENAU sie da** — eine geänderte Datei, namentlich geprüft | die erste Datei melden statt der geänderten |
| **7** | **Die achtzehn Einzelwerte kommen aus derselben Schleife wie der Gesamtwert** | eine zweite Liste danebenstellen |
| **8** | **Das Fälligkeitsdatum überlebt Export und Import** — Format 16, am laufenden Server gefahren | es aus dem Export nehmen |
| **9** | **Eine Aufgabe ohne Datum verhält sich wie heute** | ihr eine Vorgabe geben |
| **10** | **„Offen" ordnet überfällig · heute · später, ohne Datum hinten** — vier Aufgaben, vier Zustände | die ohne Datum nach vorn nehmen |
| **11** | **Der Migrationsblock übersetzt eine Datenbank ohne die Spalte** — an einer echten alten Datei gefahren | ihn überspringen |
| **12** | **Der Index verhindert eine zweite gleiche Adresse** — am laufenden Server gefahren | ihn nicht anlegen |
| **13** | **Und er lässt mehrere Zugänge OHNE Adresse zu** | ihn ohne `WHERE` anlegen |
| **14** | **Bestehende Doppeladressen lassen die Instanz laufen und werden benannt** *(F10)* | den Fehlschlag verschlucken |
| **15** | **Die Filterzeile hat drei Spalten, und der Umschalter steht am Ende SEINER Zeile** — die Rasterzeile gemessen, nicht der Wähler gelesen | ihn zurück in die Spanne setzen |
| **16** | **Der Filterkasten misst am Telefon weniger als vor dieser Runde** — die Zahl steht in der Zusage | die Verweise nur verstecken |
| **17** | **Der Kategoriekasten misst EINE Zeile** — an der Anzahl der Oberkanten gemessen | den Knopf wieder umbrechen lassen |
| **18** | **Und am Schreibtisch ändert sich nichts** — beide Breiten geprüft | die Regel global setzen |

> **DREI ZUSAGEN WERDEN AM LAUFENDEN SERVER GEFAHREN UND NICHT AM QUELLTEXT** —
> *die Sicherungsprobe, das Austauschformat und der Index.* **Eine Zusage, die
> nur das Markup ansieht, bliebe grün, wenn der Weg dasteht und nichts tut.**
> *Das ist die Lehre aus 0.28.1, wo genau diese Bauform den Sortierfehler
> gefunden hat.*

---

## Der Augenschein

| | Lage |
|---|---|
| **1** | Eine **Sicherung anlegen und prüfen** — stimmen die vier Zahlen mit dem Bestand? |
| **2** | Eine **fremde Sicherungsdatei** hineinlegen und prüfen — kommt die Auskunft statt eines Fehlers? |
| **3** | Eine **Datei im Container ändern** und die Kennzahlen ansehen — steht genau sie da? |
| **4** | Eine **Aufgabe mit Datum** anlegen, eine ohne — und „Offen" ansehen |
| **5** | **Exportieren und wieder einspielen** — ist das Datum noch da? |
| **6** | Eine **zweite gleiche Adresse** vergeben wollen |
| **7** | Die **aufgeklappten Filter am Telefon** — steht „Tags" jetzt am Ende der Kategoriezeile? |
| **8** | Der **Kategoriekasten im Eintrag am Telefon** — eine Zeile statt zwei? |

---

## Was ausdrücklich NICHT gebaut wird

| | warum |
|---|---|
| **Ein Wecker für fällige Aufgaben** | *die Glocke trägt einen Zeitstempel und keine Tabelle* (F9) |
| **Eine Uhrzeit am Fälligkeitsdatum** | *eine Genauigkeit, die niemand pflegt, wird zur zweiten Wahrheit* |
| **Ein Versanddienst über HTTPS** | *er löst das Problem nicht — die drei Namensdiensteinträge tun es, und der Dienst spricht ohnehin SMTP* (Befund 5) |
| **Das Zurückspielen einer Sicherung über die Oberfläche** | *die Probe öffnet und zählt; zurückspielen heißt die laufende Datenbank ersetzen, und das ist eine Runde für sich* |
| **Der Und/Oder-Umschalter der Marken** | *erst messen* (F12) |
| **Die sieben übrigen deutschen `id`** | *Punkt 25 des Sammelblatts — kein Befund dieser Runde, sondern einer über den Wächter* |
| **Die Restprobe auf Vorlagen ausweiten** | *Punkt 26 — erst messen, wie viele feste Wörter darin stecken* |
| **Ein Verzeichnis der lesenden Routen** | *steht auf dem Sammelblatt und ist eine Runde für sich* |

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.29.0.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_29_0.md` | `git mv`, **Revision 82** |
| `Doku/Fahrplan.md` | 0.29.0 durchgestrichen; die Ausarbeitung bleibt als Herleitung |
| `Doku/Fehler_und_Ideen.md` | der Punkt „Versanddienst über HTTPS" **fällt** *(Regel 2)* |
| `Doku/Auftrag_0.28.1.md` | **fällt mit diesem Auftrag** — es liegt immer nur einer im Repo |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
| `README.md` | **ja** — die Sicherungsprobe, die Dateiliste am Fingerprint, das Fälligkeitsdatum, **und der Abschnitt zur Zustellbarkeit** |

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
   Claudes eigenen widerlegt — und eine zweite hat gezeigt, dass sein Vorschlag
   zur Tagzeile 143 Pixel gekostet hätte.* **Beide Male stand die Zahl vor der
   Entscheidung, und beide Male hat sie jemanden korrigiert.**
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
   IN EINEN NACHBAU WIRD GEKLAMMERT:** *in 0.28.1 ist ein Rückbau daran
   abgerissen, und der Fehler steckte in einer Zeile, die dieselbe Runde neu
   geschrieben hatte.*
9. **Der Augenschein**, wenn der Befund am Bildschirm entstanden ist.
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
* **KEINE ZWEITE WAHRHEIT.** Eine Aussage, zwei Orte — Stolperstein 47.
* **EIN FELD OHNE LESER BLEIBT NICHT STEHEN**, und eine Regel ohne Träger auch
  nicht.
* **EINE ZUSAGE LIEST IHREN GEGENSTAND UND NICHT DEN ABSATZ DARÜBER.**
* **UND SIE FÄHRT DIE SACHE, STATT SIE ZU LESEN, wo das möglich ist.** *In
  0.28.1 hat genau das einen Fehler gefunden, den kein Blick auf den Quelltext
  gezeigt hätte: „Titel" sortierte nach dem Änderungsdatum.*
