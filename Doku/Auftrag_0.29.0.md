# Auftrag 0.29.0 — „Worauf man sich verlassen können muss"

**Fünf geplante Punkte und DREI Befunde aus dem Betrieb · geschrieben am
11. September 2026 · gebaut auf 0.28.1.**

> **DER DRITTE KAM WÄHREND DER FRAGERUNDE HEREIN** *(Betreiber, 11. September
> 2026)*: **„Titel" sortiert nur von A bis Z.** *Er fährt mit, weil diese Runde
> ohnehin MINOR ist — und genau das war der Grund, aus dem 0.28.1 ihn liegen
> lassen musste.*

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
| **F1** | **Wie heißt die Sicherungsprobe am Bildschirm?** *„Probe öffnen", „Sicherung prüfen", „Nachsehen"?* | **„Sicherung prüfen".** *Es ist das Wort, das die Handlung benennt* | **„prüfen", und zwar JE ZEILE.** *Die Karteizeile misst 366 px und trägt schon Nummer, Datum, Alter und Größe — „Sicherung prüfen" bräuchte daneben eine zweite Zeile.* **Das Wort „Sicherung" steht im Kartentitel und in jeder Zeile darüber; ein drittes Mal sagt es nichts dazu** |
| **F2** | **Was zählt die Probe?** *Einträge, Bilder, Zugänge, Datum — oder mehr?* | **Genau diese vier** | **Einträge · Fotos · Zugänge · „Inhalt bis …".** *Die ersten drei tragen die Namen der Karte „Kennzahlen", damit der Vergleich ohne Kopfrechnen geht — dort stehen **Fotos** und **Videos** getrennt, und ein Wort „Bilder" gibt es nicht.* **Das vierte ist die jüngste Änderung IM Bestand und NICHT der Zeitpunkt der Datei** — der steht in derselben Zeile schon, und dieselbe Auskunft an zwei Orten ist Stolperstein 47 |
| **F3** | **Bekommt die Probe eine eigene Route?** *`F_ROUTES` steigt dann von 72 auf 73* | **Ja, eine schreibende** *(`POST /api/backup/check`)* | **Ja, `POST /api/backup/check`, `F_ROUTES` 72 → 73.** *Im Rumpf steht die **Nummer** der Zeile und nicht der Dateiname* — **Stolperstein 300 bleibt gewahrt** (F22) |
| **F4** | **Darf die Probe eine Sicherung öffnen, die mit einem ANDEREN Schlüssel verschlüsselt ist?** | **Nein, und sie sagt es** | **So.** *„Mit diesem Schlüssel nicht lesbar" ist selbst eine Auskunft* |
| **F5** | **Der Fingerprint nennt die abweichende Datei — wie viele Namen höchstens?** | **Alle, die abweichen** | **Alle achtzehn, und sie stehen auf Verlangen da.** *Welche „abweichen", kann die Instanz nicht wissen* — siehe **F16** |
| **F6** | **Woher kennt die Karte die Sollwerte der einzelnen Dateien?** | **Der Server rechnet sie mit** | **So** — dieselbe Schleife, die den Gesamtwert bildet, legt die achtzehn Einzelwerte daneben. **Kein zweiter Leser, keine zweite Liste** *(Stolperstein 47)* |
| **F7** | **Das Fälligkeitsdatum: an der Aufgabe oder am Eintrag?** | **An der Aufgabe** | **An der Aufgabe.** *Eine Spalte an `comments`* |
| **F8** | **Wie sortiert „Offen" mit dem neuen Datum?** | **Überfällig, heute, später — und ohne Datum hinten** | **So — und als drei ABSCHNITTE, nicht als eine durchsortierte Liste.** *Sonst zerfällt die Gruppierung nach Eintrag* — siehe **F18** |
| **F9** | **Sieht man „überfällig" auch in der Übersicht?** | **Nein — diese Runde nicht** | **Nein.** *Die Glocke trägt einen Zeitstempel und keine Tabelle* |
| **F10** | **Der partielle Index auf `users.email`: was geschieht mit Datenbanken, die HEUTE schon zwei gleiche Adressen tragen?** | **Der Index wird nicht angelegt, und die Karte sagt es** | **So — und der Ort ist ein Warnkasten in „Benutzer", der nur dasteht, wenn es welche gibt.** *Die Karte zeigt heute **keine einzige Adresse*** — siehe **F19** |
| **F11** | **Die dritte Rasterspalte der Filterzeile** *(Befund 6)*: **gemessen 40 px zugeklappt, 79 aufgeklappt** | **Bauen** | **Bauen — aber NUR für den Umschalter „Tags" und die beiden Verweise der Tagzeile.** *Alle `.frow-right` hineinzusetzen kostet den Namen der Sortierung* — siehe **F17** |
| **F12** | **Der Und/Oder-Umschalter der Marken spannt weiter über beide Spalten** — 362 px für einen kleinen Schalter | **Erst messen, dann vorschlagen** | **GEMESSEN — und gebaut: Spalte 2.** *Die beiden Pillen brauchen **86 px** und spannen heute über **362**.* **In Spalte 2 misst die Tagzeile 69 statt 94 px — fünfundzwanzig Pixel, und er steht endlich neben seiner Beschriftung statt darunter.** *Spalte 3 spart dieselben 25 px, stellt ihn aber weit weg von dem Wort, zu dem er gehört* |
| **F13** | **Der Kategoriekasten** *(Befund 7)*: **gibt die Auswahl Breite ab?** | **Ja: 119/137 statt 148/108** | **Ja — aber GETEILT statt ausgerechnet:** `flex: 1 1 0` an beiden. *Gemessen **130/130 · 122/122 · 115/115** bei 80, 100 und 120 Prozent Schrift — immer EINE Zeile.* **Eine feste Zahl kann bei dieser Spanne nur falsch werden, und das Stilblatt sagt es an anderer Stelle selbst.** *Und es fängt einen Fehler, den die Frage nicht kannte* — siehe **F20** |
| **F14** | **Wird der Platzhalter gekürzt?** *„Neue Kategorie, Enter" braucht 238 px* | **Ja — „Neue Kategorie"** | **Ja, aber KÜRZER: „Name" · „Name" · „Ad".** *Gemessen: im schmaleren Feld sind **91 bis 106 px** Platz; „Neue Kategorie" braucht **124 bis 139** und passt bei **keiner** Schriftstufe.* **Der Vorschlag hätte das Abschneiden nicht abgestellt, sondern verschärft** |
| **F15** | **Die Nummer: 0.29.0 als MINOR?** | **Ja** | **Ja.** *Und damit entfällt der Grund, der Befund 8 in 0.28.1 verhindert hat* (F21) |

> **SIEBEN FRAGEN STANDEN NICHT IN DER TAFEL UND SIND BEIM MESSEN AUFGEFALLEN.**
> *Sie stehen hier mit derselben Verbindlichkeit; beantwortet hat sie der
> Betreiber am 11. September 2026, vor der ersten Zeile.*

| # | Frage | Antwort |
|---|---|---|
| **F16** | **Die Karte kennt keinen SOLLWERT — was heißt dann „nur im Fehlerfall"?** *Der Sollwert steht im Änderungsprotokoll, auf Papier; die Instanz kann gar nicht wissen, dass etwas abweicht.* **Zusage 5 und 6 sind so, wie sie dastehen, nicht baubar** | **Ein Verweis „Dateien zeigen" klappt die achtzehn Werte auf.** *Keine dauerhafte Zeile, kein Überfahrtext — beides wie verlangt.* **Die Instanz behauptet nichts, was sie nicht wissen kann**, und der Mensch hält die Liste gegen das Änderungsprotokoll, wie heute — nur ohne Shell im Container |
| **F17** | **Was kostet die dritte Spalte die SORTIERZEILE?** *Dort steht nicht der 46 px breite Umschalter, sondern „Filter zurücksetzen (n)"* | **140 px — und damit den Namen der Sortierung.** *Gemessen mit einem gesetzten Filter: die Sortierwahl schrumpft von 176 auf **30 px**, „+ Ansicht speichern" wird angeschnitten.* **Die Sortierzeile bleibt deshalb, wie sie ist** |
| **F18** | **Wie ordnet „Offen" nach Fälligkeit, ohne die Gruppierung zu verlieren?** *Die Ansicht gruppiert heute nach aufeinanderfolgenden Zeilen desselben Eintrags* | **Drei Abschnitte — überfällig · heute · später —, und die Gruppierung nach Eintrag bleibt INNERHALB der Abschnitte.** *Eine flach durchsortierte Liste ließe denselben Eintrag mehrfach dastehen* |
| **F19** | **Wo steht, welche Adressen doppelt sind?** *Die Karte „Benutzer" zeigt heute Name und Rolle und keine Adresse* | **Ein Warnkasten in „Benutzer", und nur, wenn es welche gibt.** *Solange nichts zu klären ist, steht keine Adresse im Systembereich* |
| **F20** | **Wo trägt man das Fälligkeitsdatum ein?** *Eine Aufgabe ist heute ein Umschaltknopf am Kommentar; ein Formular dafür gibt es nicht* | **Am Kommentar, und erst, wenn die Aufgabenmarke gesetzt ist.** *Ein Datumsfeld an jedem Vermerk stünde bei den meisten Kommentaren für nichts da* |
| **F21** | **Fährt Befund 8 mit — „Titel" kennt nur A → Z?** | **Ja, als BA 8 — und der Sonderfall fällt GANZ.** *Der Satz „Diese Sortierung hat nur eine Richtung" fällt in drei Sprachen, mit ihm der gesperrte Knopf, `twoWays()` und die Regel `.sort-dir:disabled`.* **Eine Regel ohne Träger bleibt nicht stehen** |
| **F22** | **Wohin kommt das Ergebnis der Probe?** | **Eine Zeile unter die geprüfte Sicherung, und sie bleibt stehen.** *Wer zwei Kopien prüft, sieht beide Ergebnisse nebeneinander.* **Gespeichert wird nichts** — beim nächsten Zeichnen der Karte ist sie fort |

---

## Die Messungen vor der ersten Zeile

**ALLES HIER IST IN EINEM ECHTEN CHROMIUM BEI 390 × 844 GEFAHREN**, an einer
laufenden Instanz mit zehn Marken, vier Kategorien und sechs Einträgen — nicht
am Quelltext und nicht an einer Nachbildung.

**DIE ZAHLEN DES AUFTRAGS HABEN SICH BESTÄTIGT**, Zeile für Zeile: 252 / 75 /
y = 464 zugeklappt, 395 / 75 / 134 / y = 607 aufgeklappt, mit drei Spalten
212 / 35 / y = 424 und 316 / 35 / 94 / y = 527. **Der Umschalter „Tags" misst
46 × 33 px.**

**DREI ANTWORTEN DES AUFTRAGS HAT DIE MESSUNG BERICHTIGT**, und jede einzelne
hätte beim Bauen einen Schaden angerichtet:

| | der Auftrag sagte | gemessen |
|---|---|---|
| **die dritte Spalte** | *alle Verweise hinein* | **die Sortierwahl schrumpft auf 30 px** — der Name der Sortierung ist fort *(F17)* |
| **der Kategoriekasten** | *148 px Auswahl, feste 119* | **die Auswahl hat keine Obergrenze und misst bei einem langen Namen 278 px** *(F20)* |
| **der Platzhalter** | *„Neue Kategorie" genügt* | **er passt danach bei keiner Schriftstufe** — 124 px in ein Feld von 91 bis 106 *(F14)* |

### Was die drei Spalten wirklich einbringen

| | Filterkasten | erste Kachel | Sortierwahl |
|---|---|---|---|
| **heute, aufgeklappt** | 395 px | y = 607 | 176 px |
| nur der Umschalter | 355 px | y = 567 | 170 px |
| **gebaut wird: Umschalter + Tagzeilenverweise + Und/Oder in Spalte 2** | **291 px** | **y = 502** | **170 px** |
| *alle Verweise (der Auftrag)* | *291 px* | *y = 502* | *170 px* |

**MIT EINEM GESETZTEN TAGFILTER TRENNEN SICH DIE BEIDEN LETZTEN**, und erst
dort zeigt sich der Unterschied:

| | Filterkasten | erste Kachel | Sortierwahl |
|---|---|---|---|
| **heute** | 435 px | y = 646 | 176 px, lesbar |
| **gebaut wird** | **330 px** | **y = 542** | **170 px, lesbar** |
| *alle Verweise (der Auftrag)* | *291 px* | *y = 502* | **30 px — der Name ist WEG** |

> **NEUNUNDDREISSIG PIXEL KOSTEN DEN NAMEN DER SORTIERUNG.** *„Filter
> zurücksetzen (1)" ist 140 px breit und nimmt sie der Wahl daneben.*
> **Der Gewinn bleibt 105 Pixel, und die Zeile bleibt heil.**

### Und eine Lehre für den Prüfstand

**DIE AUTOMATISCHE PROBE HAT DIE 30 PIXEL FÜR „LESBAR" ERKLÄRT.** *Gefragt war
`scrollWidth` gegen `clientWidth`, und ein `<select>` beantwortet das nicht —
er schneidet ab, ohne zu überlaufen.* **Das Bild hat es gesehen, die Abfrage
nicht.** *Eine Zusage auf diese Zeile misst deshalb die **Breite** und fragt
nicht das Element.*

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

> **DER SATZ „DIE KARTE STEHT OHNEHIN AUF ROT" IST FALSCH, und das ist beim
> Nachsehen aufgefallen** *(11. September 2026)*: **die Instanz kennt keinen
> Sollwert.** *Er steht im Änderungsprotokoll — auf Papier —, und der Mensch
> hält ihn mit dem Auge dagegen (README, „Dafür gibt es den Fingerprint").*
> **Es gibt in der Software gar keinen Fehlerfall**, und damit ist „sichtbar
> nur im Fehlerfall" so, wie es dasteht, nicht baubar.
>
> **GEBAUT WIRD DESHALB EIN VERWEIS „Dateien zeigen"** *(F16)*: **er klappt die
> achtzehn Werte auf, und solange niemand ihn drückt, steht dort nichts.**
> *Keine dauerhafte Zeile, kein Überfahrtext — beides wie verlangt.* **Die
> Instanz behauptet damit nichts, was sie nicht wissen kann**, und der Handgriff
> aus der README verliert die Shell, nicht seine Aussage.

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

> **NACHGEMESSEN UND IN EINEM PUNKT BERICHTIGT** *(11. September 2026, echter
> Chromium)*: **die Zahlen oben stimmen — aber „die Verweise" sind nicht alle
> gleich.** *In `.frow-right` steht auch „Filter zurücksetzen (n)" der
> Sortierzeile, und das ist 140 px breit.* **Wandert es mit in Spalte 3,
> schrumpft die Sortierwahl auf 30 Pixel und der Name der Sortierung ist nicht
> mehr zu sehen** — bei jedem, der irgendeinen Filter gesetzt hat.
>
> **GEBAUT WIRD DESHALB ENGER:** *der Umschalter „Tags" und die beiden
> Verweise der Tagzeile gehen in Spalte 3, die Sortierzeile bleibt, wie sie
> ist* **(F17).** *Dazu der Und/Oder-Umschalter in Spalte 2* **(F12)** — **zusammen
> 104 Pixel ohne und 105 mit gesetztem Tagfilter.**

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

> **NACHGEMESSEN, UND ZWEIMAL ANDERS ALS ERWARTET** *(11. September 2026)*:
>
> **ERSTENS: DIE AUSWAHL HAT KEINE OBERGRENZE.** *`#cat` trägt `min-width:
> 148px` und sonst nichts.* **Bei einer Kategorie „Haushaltsgroßgeräte und
> Zubehör" misst sie 278 px** — der Auftrag hat mit kurzen Namen gemessen, und
> im Betrieb sind die Namen länger. **Die 148 px der Tabelle oben sind der
> beste Fall und nicht der übliche.**
>
> **ZWEITENS: DER GEKÜRZTE PLATZHALTER PASST NICHT.** *Im schmaleren Feld sind
> je nach Schriftstufe **91 bis 106 px** Platz; „Neue Kategorie" braucht **124
> bis 139**.* **Er wäre bei keiner der drei Stufen zu lesen** — das Kürzen
> hätte das Abschneiden nicht abgestellt, sondern verschärft.
>
> **DESHALB: GETEILT STATT AUSGERECHNET** *(F13)* **und „Name" statt „Neue
> Kategorie"** *(F14)*. *Gemessen ergibt das eine Zeile bei 80, 100 und 120
> Prozent — 107, 110 und 118 px, wo heute 153, 161 und 167 stehen.*

### 8 — „Titel" sortiert von A bis Z, und Z bis A ist nicht zu haben

> **BETREIBER, am laufenden 0.28.1** *(11. September 2026)*: „Achso wenn man
> nach Titel sortieren lässt sortiert es von A bis Z aber Z bis A kann nicht
> angewählt werden."

**ER HAT RECHT, UND ES IST ABSICHT.** *`SORT_BASES` gibt „Titel" ein `up` und
kein `down` (`public/app.js:4044`), der Vergleicher kennt nur `title_asc`
(`app.js:2882`), und der Richtungsknopf steht daneben gedämpft.*

**AM LAUFENDEN SERVER NACHGEFAHREN** *(nicht am Quelltext gelesen)*: der Knopf
trägt **„A → Z"**, ist **gesperrt**, sein Griff sagt **„Diese Sortierung hat nur
eine Richtung"** — und ein Klick darauf ändert die Reihenfolge nicht.

**DIE BEGRÜNDUNG STEHT IM QUELLTEXT SELBST, und sie ist heute hinfällig:**

> *„Z nach A wäre eine FUNKTION, und eine Funktion ist nach Regel 5.1
> mindestens MINOR. Diese Runde ist ein PATCH aus acht Reparaturen; drei Zeilen
> hätten den Fahrplan ab 0.29.0 um eine Stelle verschoben (Betreiber,
> 11.9.2026)."* — `public/app.js:4043`

**0.29.0 IST MINOR** *(F15)*. **Der Grund, der die drei Zeilen in 0.28.1
aufgehalten hat, ist mit dieser Runde entfallen** — und mehr als drei Zeilen
sind es nicht: ein `down` an der Grundlage, ein `case 'title_desc'` im
Vergleicher, ein Satz „Z → A" in drei Sprachen.

**WAS DABEI FÄLLT, IST MEHR ALS ES SCHEINT** *(F21)*: *danach kennt **keine**
der sieben Grundlagen mehr nur eine Richtung.* **Der Satz `list.sortOneWay`
(„Diese Sortierung hat nur eine Richtung") fällt in drei Sprachen**, mit ihm
der gesperrte Zustand des Knopfes, `twoWays()` und die Stilblattregel
`.sort-dir:disabled`. *Eine Regel ohne Träger bleibt nicht stehen.*

**ZWEI ZUSAGEN DES PRÜFSTANDS PRÜFEN HEUTE DAS GEGENTEIL** — `testbench.js:41974`
und `42053` halten fest, dass der Knopf bei „Titel" gesperrt ist. **Sie werden
umgeschrieben und nicht gestrichen.**

---

## Die Bauabschnitte — und was dabei WEGFÄLLT

| | was | was fällt |
|---|---|---|
| **BA 1** | **Die Sicherungsprobe** *(Befund 1)* — ein Weg, der eine Datei öffnet, zählt und zumacht | *nichts fällt.* **`F_ROUTES` 72 → 73** *(F3)*, und die Zahl wird im Prüfstand nachgezogen |
| **BA 2** | **Der Fingerprint nennt die Datei** *(Befund 2)* — achtzehn Einzelwerte neben dem Gesamtwert, sichtbar nur im Fehlerfall | *nichts fällt.* **Die lesende Route `/api/stats` trägt sie mit** — kein neuer Weg |
| **BA 3** | **Das Fälligkeitsdatum** *(Befund 3)* — eine Spalte an `comments`, drei Zustände in „Offen" | **Das Austauschformat steigt auf 16.** *Der **zwölfte** Migrationsblock kommt dazu* |
| **BA 4** | **Der partielle Index** *(Befund 4)* — und der Klartext hinter der Anmeldung | *nichts fällt* |
| **BA 5** | **Der README-Abschnitt zur Zustellbarkeit** *(Befund 5)* | **Ein Sammelblattpunkt fällt** — „Versanddienst über HTTPS", erledigt ohne Code |
| **BA 6** | **Die dritte Rasterspalte** *(Befund 6)* — für den Umschalter „Tags" und die Verweise der Tagzeile, **nicht** für die Sortierzeile *(F17)*; dazu der Und/Oder-Umschalter in Spalte 2 *(F12)* | *keine Regel fällt; `grid-template-columns` und die Spaltenzuweisungen ändern sich* |
| **BA 7** | **Der Kategoriekasten** *(Befund 7)* — **geteilt statt ausgerechnet** *(F13)* | **Ein Platzhalter wird gekürzt, in drei Sprachen** *(F14)* — der Schlüssel bleibt. **Und `min-width: 148px` an der Auswahl fällt** *(F20)* |
| **BA 8** | **„Titel" kehrt um** *(Befund 8)* — ein `down` an der Grundlage, ein `case 'title_desc'`, ein Satz „Z → A" in drei Sprachen | **`list.sortOneWay` fällt in drei Sprachen**, mit ihm der gesperrte Knopf, `twoWays()` und die Regel `.sort-dir:disabled`. **Zwei Zusagen werden umgeschrieben** *(F21)* |

> **DAS SCHEMA WIRD ANGEFASST — EINMAL, UND ZUM LETZTEN MAL VOR DEM BRUCH.**
> *Eine Spalte an `comments`, ein partieller Index auf `users`.* **Das
> Austauschformat geht von 15 auf 16, die Migrationsblöcke von elf auf zwölf.**

---

## Die Nummer und ihre Begründung

**0.29.0 ist MINOR — Regel 5.1.** *Das Fälligkeitsdatum ist eine **Funktion**:
die Instanz kann danach etwas, was sie vorher nicht konnte. Dazu ein
Schemaschritt und ein höheres Austauschformat.* **Jede dieser drei Angaben
allein genügte schon.**

**DIE DREI BEFUNDE AUS DEM BETRIEB HEBEN SIE NICHT WEITER.** *Sie sind
Reparaturen und fahren mit, weil der Betreiber keine eigene Runde dafür wollte
(11. September 2026).* **Der Fahrplan rückt nicht.**

> **UND DER DRITTE FÄHRT NUR MIT, WEIL DIE NUMMER SCHON STEHT.** *„Titel" in
> beide Richtungen ist eine **Funktion** und wäre für sich genommen MINOR —
> genau deshalb hat 0.28.1 sie nicht gebaut.* **Hier hebt sie nichts mehr: das
> Fälligkeitsdatum hat die Runde bereits auf MINOR gestellt.** *Drei Zeilen
> reisen zum Nulltarif mit, und das ist der ganze Grund, warum sie jetzt
> reisen und nicht in einer eigenen Runde.*

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
| **19** | **Die SORTIERWAHL bleibt lesbar, auch mit gesetztem Filter** — ihre **BREITE** gemessen und nicht `scrollWidth` gefragt *(F17)* | den Wähler fragen, ob er überläuft |
| **20** | **Der Kategoriekasten misst EINE Zeile bei 80, 100 UND 120 Prozent Schrift** — alle drei gefahren | nur bei 100 messen |
| **21** | **Der Platzhalter passt bei allen drei Schriftstufen und in allen drei Sprachen** — die Textbreite gegen die Feldbreite gehalten | ihn nur lesen |
| **22** | **Die Auswahl der Kategorie wächst nicht mehr mit dem längsten Namen** — mit einem langen Namen gefahren | mit kurzen Namen messen |
| **23** | **„Titel" ordnet in BEIDE Richtungen, und der Knopf ist nicht mehr gesperrt** — beide Reihenfolgen am laufenden Server verglichen | nur den Knopf ansehen |
| **24** | **`list.sortOneWay` steht in keiner der drei Sprachdateien mehr, und keine Grundlage ist einspurig** | den Satz stehen lassen |

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
| **9** | Nach **Titel sortieren** und den Knopf daneben drücken — kommt „Z → A"? |
| **10** | Die **Kennzahlen** ansehen und „Dateien zeigen" drücken — stehen achtzehn Zeilen da, und sonst keine? |

---

## Was ausdrücklich NICHT gebaut wird

| | warum |
|---|---|
| **Ein Wecker für fällige Aufgaben** | *die Glocke trägt einen Zeitstempel und keine Tabelle* (F9) |
| **Eine Uhrzeit am Fälligkeitsdatum** | *eine Genauigkeit, die niemand pflegt, wird zur zweiten Wahrheit* |
| **Ein Versanddienst über HTTPS** | *er löst das Problem nicht — die drei Namensdiensteinträge tun es, und der Dienst spricht ohnehin SMTP* (Befund 5) |
| **Das Zurückspielen einer Sicherung über die Oberfläche** | *die Probe öffnet und zählt; zurückspielen heißt die laufende Datenbank ersetzen, und das ist eine Runde für sich* |
| ~~Der Und/Oder-Umschalter der Marken~~ | **gemessen und gebaut** — er spart 25 px *(F12)* |
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
