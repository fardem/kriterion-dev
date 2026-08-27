# Fehler und Ideen

**Das Sammelblatt · Stand 27. August 2026**

**Hier stehen Befunde aus dem Betrieb, Fehler und Ideen — Punkt für Punkt, in
der Reihenfolge, in der sie aufgefallen sind.** Es ist die Zusammenführung der
beiden Papiere, die vorher dasselbe taten: `Roadmap.md` (neue Punkte) und
`Ideen_und_Vorschlaege.md` (die Durchsicht von 0.8.6). *Zwei Sammelstellen für
dieselbe Frage sind eine zu viel — Stolperstein 47, in Papierform.*

## Drei Regeln, und sie sind der ganze Zweck des Blatts

**1. KEIN PUNKT HIER TRÄGT EINE VERSIONSNUMMER.** Erst wird gesammelt, dann
zugeordnet — und zwar **in einem Zug**, wenn genug beieinander ist. *Wer beim
Aufschreiben schon eine Nummer daneben setzt, entscheidet über eine Runde, ohne
die anderen Punkte gesehen zu haben.* Auch keine Rangfolge: die Reihenfolge
unten ist die des Auffallens und sonst nichts.

**Eine Nummer steht trotzdem an jedem Punkt — die falsche Richtung.** Jeder
Punkt sagt, **welche Version ihn nötig gemacht hat**: woher er kommt, nicht wohin
er soll. *Das ist Herkunft und keine Zuordnung.* Ein Punkt aus 0.8.6, der seit
fünf Runden mitläuft, sieht anders aus als einer von gestern — und diesen
Unterschied verliert eine Liste ohne Herkunft sofort.

**2. WAS GEBAUT IST, STEHT HIER NICHT MEHR — nicht einmal als erledigte Zeile.**
Es steht an genau zwei Orten: **was davon gilt**, im Projektstand; **wie es
gebaut wurde und was dabei anders kam**, im Änderungsprotokoll seiner Version.
Ein durchgestrichener Punkt in einem Sammelblatt sieht aus wie ein offener und
wird beim Lesen mitgezählt. *Genannt werden darf Gebautes trotzdem — aber nur
als **Begründung** an einem offenen Punkt („das ist mit 0.11.0 erledigt, also
entfällt der Einwand"), nie als eigener Punkt.*

**3. WAS SCHON EINE NUMMER HAT, STEHT NICHT HIER, SONDERN IM FAHRPLAN** —
Projektstand, Abschnitt 10. Dort steht auch, was für **1.0** vorgemerkt ist:
die fünf Migrationsblöcke, die Absage an zu alte Datenbanken, die Vorgabewerte,
die Tastaturbedienung beim Sortieren und die zwei Sätze für die README. *Ein
Punkt wandert von hier in den Fahrplan und von dort in ein Änderungsprotokoll —
nie zurück.*

| Papier | Was darin steht |
|---|---|
| **dieses Blatt** | Befunde, Fehler und Ideen — **ohne Nummer**, ohne Rangfolge |
| Projektstand, Abschnitt 10 | der **Fahrplan**: was eine Nummer hat, und was für 1.0 vorgemerkt ist |
| Projektstand, sonst | **der Stand**: was gebaut ist und was bindet |
| `Doku/Aenderungsprotokoll_<Version>.md` | je Runde, **was wirklich gebaut wurde** — und nur dort |
| `CHANGELOG.md` | je Version, was ein Betreiber wissen muss |
| `Doku/Konzept_Video_und_grosse_Dateien.md` | **Teil II, große Dateien bis 2 GB** — ein beschlossenes Vorhaben mit eigenem Papier, im Fahrplan als „danach". *Steht deshalb nicht hier.* |

## Die Marke „Claude"

**An jedem Punkt steht eine Einschätzung, und sie ist ausdrücklich nur das:**
`stark empfohlen` · `empfohlen` · `später` · `nicht empfohlen`. Sie kommt von
Claude, nicht vom Betreiber, und sie ist **keine Entscheidung, keine Rangfolge
und keine Zuordnung zu einer Runde** — dafür ist der Fahrplan da. Sie steht
hier, damit beim Bündeln nicht jeder Punkt neu durchdacht werden muss.

## Die Form eines Punktes

Jeder ausgearbeitete Punkt trägt dieselben sechs Überschriften. Nicht als
Zierde: **die letzten drei sind die, die man beim Aufschreiben noch weiß und
beim Bauen vergessen hat.**

1. **Woher** — aus dem Betrieb, aus einer Durchsicht, aus einer Gegenprobe; mit Datum.
2. **Was auffiel** — die Beobachtung, sachlich.
3. **Was es nicht ist** — ob es ein Fehler ist oder nicht, und warum. *Ein Wunsch, der als Fehler abgeheftet wird, drängelt sich in die falsche Runde.*
4. **Was gebaut werden könnte** — die Teile, einzeln, mit Einschätzung.
5. **Offene Entscheidungen** — die Fragen, die der Auftrag beantworten muss.
6. **Was es anfasst** — der Umfang, und was ausdrücklich dagegen spricht.

**Ein Punkt darf auch kürzer sein.** Deshalb hat das Blatt drei Teile:

* **Teil I — Ausgearbeitete Punkte.** Die sechs Überschriften, vollständig.
* **Teil II — Gesammelt, ohne Ausarbeitung.** Eine Zeile je Idee. Wer eine davon
  bauen will, arbeitet sie vorher in die sechs Überschriften aus.
* **Teil III — Geprüft und bewusst nicht vorgeschlagen.** Was verworfen wurde,
  **mit der Begründung**. *Er ist der wichtigste Teil des Blatts: eine verworfene
  Idee ohne aufgeschriebenen Grund kommt in einem halben Jahr als neue zurück.*

---

# Teil I — Ausgearbeitete Punkte

## 1. Die Suche schärfen — Trefferkontext, Suchbereich, Hervorhebung

**Aufgefallen mit 0.11.0** — das Verhalten selbst ist älter.

> **Claude: empfohlen** — aber nur Teil (a), der Trefferkontext.

### Woher

Aus dem Betrieb, **27. August 2026**, unmittelbar nach dem Einspielen von
0.11.0.

### Was auffiel

Eine Suche nach **„ella"** findet auch **„eurobella"** — unter anderem in einer
**Linkadresse**. Der Treffer ist richtig, aber **nicht nachvollziehbar**: die
Kachel sagt nicht, *wo* das Wort steht. Man sieht einen Eintrag in der
Trefferliste und weiß nicht, warum er dort ist.

### Was es nicht ist

**Keine Verschlechterung durch 0.11.0.** Vorher lief `searchText.includes(q)`
über genau dieselben sieben Quellen, zusammengeklebt zu einem Feld — „ella"
fand „eurobella" also auch damals, Linkadressen eingeschlossen. **0.11.0 hat
dieses Verhalten absichtlich Zeichen für Zeichen erhalten**; sichtbar geworden
ist es, weil die Suche jetzt benutzt wird.

**Also ein Wunsch und kein Fehler** — und damit kein Fall für eine
Nacharbeitsrunde.

*Ein Punkt für die Umsetzung: der Aufbau **weiß** die Antwort schon.*
`qVolltext` in `server.js` prüft sieben ODER-Glieder einzeln — welches getroffen
hat, wirft die Route heute weg und liefert nur Nummern. Damit ist der erste
Teil deutlich billiger, als er klingt.

### Was gebaut werden könnte

**a) Trefferkontext: wo und wie kommt das Wort vor.** *Der stärkste Teil, und
damit würde ich anfangen.* Das eigentliche Ärgernis ist nicht, dass
„eurobella" passt, sondern dass man nicht sehen kann, **warum**. Eine Zeile an
der Kachel — *„Link: …euro**bella**.de/…"* — nimmt niemandem etwas weg und
beantwortet genau diese Frage.

**b) Suchbereich als Häkchen:** Titel, Beschreibung, Kategorie, Tags, Links,
Kommentare. **Verengend**, Vorgabe **alle an** (also genau das heutige
Verhalten), und hinter einem Schalter „Erweitert" — der einfache Fall bleibt
ein Feld. **Der Bereich gehört in die gespeicherte Ansicht**, sonst zeigt eine
Ansicht „Bosch, nur Titel" beim Anklicken etwas anderes als beim Speichern.

**c) Hervorhebung des Begriffs** im gefundenen Eintrag. *Angenehm — und der
Teil mit dem Haken, siehe unten.*

**d) Was NICHT gebaut werden soll: Wortgrenzen statt Teilstring.** In einem
Katalog voller Typnummern („GSR 18V-60") ist Teilstring das richtige Verhalten:
wer „18v" tippt, will es finden. Eine Wortgrenzensuche verschwiege still
Treffer, und das ist die schlechtere Seite des Fehlers.

### Offene Entscheidungen

* **Wie viel Kontext?** Eine Zeile je Eintrag oder eine je getroffener Quelle?
  Bei mehreren Treffern im selben Eintrag: der erste, alle, oder gezählt?
* **Wandert der Suchbegriff in die Adresse** (`#/item/12?q=ella`)? Heute lebt er
  nur im Speicher. Ohne ihn in der Adresse ist die Hervorhebung nach einem
  Neuladen weg — **und das sieht dann aus wie ein Fehler.** *Ich neige zu ja.*
* **Wann setzt die Hervorhebung zurück?** Vorschlag: **sie gehört der Suche und
  nicht dem Eintrag.** Daraus folgt alles — sie lebt genau so lange wie der
  Begriff (Feld geleert, Begriff geändert, Ansicht ohne Begriff gewählt: weg),
  und sie wird **nicht gespeichert**: Ansichtszustand, wie „meine / alle" im
  Vergleich.
* **Der Suchbereich in der gespeicherten Ansicht** ist ein Feld mehr im JSON.
  Abwärtskompatibel — aber eine alte Ansicht **ohne** das Feld muss „alle
  Quellen" heißen und nicht „keine".
* **Trägt die Antwort der Suchroute ein neues Feld je Eintrag?** Das wäre eine
  Erweiterung und keine Wegnahme.

### Was es anfasst

Die Suchroute (ein Parameter für den Bereich, ein Feld für den Kontext), die
Kachel, die Detailansicht, die gespeicherten Ansichten, Prüfungen,
Gegenproben, README. **Kein Schema.**

**Die Falle, die ausdrücklich dazugehört:** Hervorheben heißt, **fremden Text
mit Markup zu durchsetzen** — und Kommentartexte kommen von Menschen. Naiv über
`innerHTML` gebaut ist das ein Einfallstor, und es liefe genau gegen die
Entscheidung „Kommentartext kommt nie über `innerHTML` in die Seite"
(Projektstand, Abschnitt 5.6). Das braucht eine eigene Prüfung und eine
Gegenprobe, nicht nur eine sorgfältige Zeile.

**Was dagegen spricht:** nichts ist kaputt. Und Teil (b) ist eine **zweite
Bedienfläche** neben der Suche, die heute ein Feld ist — wer sie überfrachtet,
macht den einfachen Fall teurer, um den seltenen billiger zu machen.

---

## 2. Aus „abgelehnt" wird eine Entscheidung

**Aufgefallen bei der Durchsicht zu 0.8.6; verschärft mit 0.8.31**, seit alle sechs
Träger einen Verfasser haben — dieses Merkmal hat bis heute keinen.

> **Claude: stark empfohlen** — die Anlage schreibt ihr Ergebnis nicht mit.

### Woher

Aus der Durchsicht vom **21. August 2026** (damals Punkt 4.2), Stand 0.8.6.
**Seither unverändert offen** — `items` trägt bis heute `rejected INTEGER NOT
NULL DEFAULT 0` und sonst nichts dazu.

### Was auffiel

Kriterion hält den ganzen Weg der Beurteilung fest — Fotos, Kriterien,
Testtage, Kommentare, Aufgaben. **Das Ergebnis hält es nicht fest.** Es gibt
`tested` und `rejected`, zwei Merkmale ohne Datum und ohne Begründung.

In zwei Jahren steht an einem Eintrag ein Häkchen „abgelehnt" — und niemand
weiß mehr, **warum** und **wann**. Die Begründung steckt vielleicht in einem
von zwölf Kommentaren, vielleicht nirgends.

### Was es nicht ist

**Kein Fehler.** Es fehlt nichts, was einmal da war; es ist eine Stelle, an der
das Archiv aufhört, kurz bevor es fertig ist. *Für eine Anlage, die existiert,
um Entscheidungen vorzubereiten, ist ausgerechnet die Entscheidung das, was
nicht mitgeschrieben wird.*

**Und es ist ausdrücklich kein Fall für ein zweites Merkmal.** Ein Feld
„Ergebnis" neben `rejected` wären zwei Wahrheiten über dieselbe Sache
(Stolperstein 47). Das vorhandene Merkmal bekommt, was ihm fehlt — mehr nicht.

### Was gebaut werden könnte

**a) Zwei Spalten an `items`:**

* `rejected_at` — wann.
* `rejected_grund` — eine Zeile, warum.

**b) Die Anzeige an der Marke „abgelehnt".** *„Abgelehnt am 14.03.2026 —
Lieferzeit über 6 Monate."* Das Merkmal wird damit **zu einer Aussage, und
Aussagen tragen in dieser Anlage ihren Verfasser**.

**c) Und daraus folgt eine dritte Spalte und eine Klemme, die es heute so nicht
gibt.** `rejected` steht in `NUR_VERFASSER_FELDER` und läuft damit über
`darfAendern` — **Verfasser oder Admin**. Wer die Begründung hinschreibt, ist
also nicht zwingend der Verfasser des Eintrags, und ohne `rejected_von` steht
sie ohne Namen da.

Die passende Klemme heißt dann: **zurücknehmen darf das Merkmal, wer den
Eintrag ändern darf; umschreiben darf die Begründung nur, wer sie getroffen
hat.** Das ist `nurSelbst`, angewandt auf ein neues Feld — die Regel ist da
(„Löschen ja, umschreiben nein"), sie braucht die Zeile. *Und es ist eine
Verschärfung gegenüber heute: aktuell gilt an diesen Feldern `darfAendern`.*

**d) Was NICHT gebaut werden soll: ein dreiwertiger Zustand** *offen /
genommen / verworfen*. Klingt vollständiger, ist aber ein Neubau: `rejected`
müsste weg, jeder Filter und das Austauschformat müssten mit. Und „genommen"
ist bei einem Bewertungsarchiv gar nicht immer die Gegenfrage zu „abgelehnt" —
man lehnt ab, ohne dass etwas anderes genommen wird.

### Offene Entscheidungen

* **Wird `rejected_grund` beim Zurücknehmen des Merkmals gelöscht oder
  behalten?** Behalten heißt: wer erneut ablehnt, sieht die alte Begründung
  stehen. Löschen heißt: eine Angabe geht verloren, die niemand
  wiederherstellen kann. *Ich neige zu behalten und beim erneuten Setzen zum
  Überschreiben-Vorschlag.*
* **Ist der Grund Pflicht?** Ein Pflichtfeld erzieht, ein freiwilliges bleibt
  leer. *Vorschlag: freiwillig, aber das Feld steht offen im Dialog und nicht
  hinter einem Aufklappen.*
* **Gehören `tested_at` und ein Grund dort ebenso hin?** Die Symmetrie ist
  verlockend — aber „getestet" ist ein Zustand und keine Entscheidung. **Wer
  beides gleich behandelt, baut die Hälfte umsonst.**
* **Wandert die Begründung ins Sicherheitsprotokoll?** Sie ist Inhalt und kein
  Vorgang; **Freitext von außen kommt in diese Tabelle nicht hinein**
  (Projektstand, Abschnitt 11). Also nein — der Vorgang ja, der Text nicht.

### Was es anfasst

Drei Spalten, ein Migrationsblock, ein Eingabefeld im Dialog, die Kachel, die
Detailansicht, das Austauschformat (**die Formatnummer geht eins hoch**),
`NUR_VERFASSER_FELDER` samt der neuen Klemme im Rumpf, Prüfungen, Gegenproben,
README. **Klein — aber es fasst das Schema an**, und damit gilt Abschnitt 7:
ein Migrationsblock, der zweimal laufen darf.

**Was dagegen spricht:** nichts Grundsätzliches. Der einzige Einwand ist, dass
ein Grund, den niemand ausfüllt, eine Spalte ist, die niemand liest — deshalb
gehört das Feld sichtbar in den Dialog und nicht in eine Nebenansicht.

---

## 3. Export und Import laufen vollständig durch den Arbeitsspeicher

**Aufgefallen bei der Durchsicht zu 0.8.6; verschärft mit 0.8.50**, seit Videos bis
20 MB in der Datenbank liegen.

> **Claude: empfohlen** — (a) und (b). Der Strom in (c) nicht.

### Woher

Aus der Durchsicht vom **21. August 2026** (damals Punkt 3.2), Stand 0.8.6.
**Am Quelltext seither unverändert** — `GET /api/export` antwortet weiterhin
mit `res.json(exportUmschlag(items))`, der Import nimmt bis **900 MB** über
`multer.memoryStorage()` entgegen.

### Was auffiel

Der Export baut **einen** JSON-String, in dem jedes Foto, jedes Video und jeder
Anhang als Base64 steckt — Aufschlag: ein Drittel — und schickt ihn in einem
Zug.

Bei einem Bestand mit 300 Fotos aus einer Systemkamera (8–12 MB je Stück) sind
das mehrere Gigabyte in einem einzigen String. **Node bricht dann mit
`Invalid string length` ab**; die Grenze für einen einzelnen String liegt bei
etwa 512 MB. Beim Import kommt die Datei zusätzlich als Puffer **und** als
geparstes Objekt in den Speicher, also grob das Zwei- bis Dreifache ihrer
Größe.

*Seit 0.8.50 gibt es Videos bis 20 MB je Stück. Die Grenze ist damit näher
gerückt, nicht weiter weg.*

### Was es nicht ist

**Keine Fehlkonstruktion, sondern eine Grenze, die niemand gezogen hat.** Und
sie trifft ausgerechnet die Funktion, die als Sicherungsnetz gedacht ist.

**Kein Fall mehr für „der Export muss das können".** Seit 0.8.70 ist
`VACUUM INTO` der Hauptweg der Sicherung und der Export der **Austauschweg** —
die Aufgabe ist also schon verteilt. Was hier fehlt, ist nicht ein größerer
Puffer, sondern **dass die Anlage es sagt, bevor der Knopf gedrückt wird.**

### Was gebaut werden könnte

**a) Die Kennzahlen nennen die erwartete Exportgröße.** *Der kleinste Teil und
der mit dem größten Gewinn.* Der Systembereich zeigt heute die Größe der
Datenbank (`fs.statSync(DB_FILE).size` nach einem `wal_checkpoint`). Daneben
gehört eine zweite Zahl: **Datenbankgröße mal vier Drittel plus Umschlag.**

**b) Ein Hinweis ab einem Schwellwert.** *„Export mit Fotos: rund 2,1 GB — das
übersteigt, was in einem Zug erzeugt werden kann. Nimm die Sicherung."* Mit
Verweis auf den anderen Weg. **Ein Knopf, der nach zwei Minuten mit einem
Speicherfehler abbricht, ist die schlechteste Variante** — er sieht aus wie ein
kaputtes Programm und ist eine erreichte Grenze.

**c) Erst danach, und nur wenn es sich wirklich stellt: der Export als Stream.**
Die Einträge einzeln geschrieben statt in einem String gesammelt. Das ist ein
Umbau an einer Stelle, die heute nachweislich funktioniert, und er lohnt sich
nur, wenn (a) und (b) den Fall nicht schon abfangen.

### Offene Entscheidungen

* **Welcher Schwellwert?** 512 MB ist die harte Grenze des Strings. Ein
  Warnwert deutlich darunter — **300 MB** — lässt Luft für den Umschlag und die
  Base64-Rundung. *Zu nennen ist die Zahl, bei der es kippt, nicht die, bei der
  es unbequem wird.*
* **Warnt die Anlage nur, oder verweigert sie?** Verweigern schützt vor dem
  Abbruch, nimmt aber jemandem den Export weg, der weiß, was er tut. *Vorschlag:
  warnen, und den Knopf trotzdem lassen.*
* **Ist die Dateigröße der Datenbank überhaupt die richtige Grundlage?** Es
  liegt alles darin — Fotos, Videos, Anhänge, Kommentarbilder —, aber die Datei
  trägt auch Indizes, das Sicherheitsprotokoll und **freie Seiten aus
  Gelöschtem**, das ohne `VACUUM` nicht schrumpft. **Die Schätzung fiele damit
  zu hoch aus**, und eine Warnung, die zu früh kommt, wird weggeklickt. *Die
  ehrlichere Grundlage wäre eine Summe über die Blob-Spalten.*
* **Gilt derselbe Hinweis beim Import?** Dort ist die Dateigröße vorher bekannt
  — die Grenze könnte also *vor* dem Hochladen genannt werden statt danach.

### Was es anfasst

Die Kennzahlen im Systembereich, der Exportknopf, README. **Kein Schema, kein
Austauschformat.** Für (c) zusätzlich die Exportroute und ihre Gegenproben.

**Was dagegen spricht:** (a) und (b) sind unstrittig. Bei (c) spricht dagegen,
dass ein Stream die Sicherung **nicht** ersetzt und die Anlage für die Sicherung
schon einen zweiten Weg hat — es wäre Arbeit an der weniger wichtigen Hälfte.

---

## 4. Zwei Funktionen sind zu groß geworden

**Aufgefallen bei der Durchsicht zu 0.8.6 und seither in jeder Runde größer
geworden**, zuletzt mit 0.11.0.

> **Claude: empfohlen** — beim nächsten Anfassen, nicht als Vorhaben.

### Woher

Aus der Durchsicht vom **21. August 2026** (damals Punkt 3.3), Stand 0.8.6 —
und **seither jedes Mal größer geworden**. Die Zahlen unten sind am
**27. August 2026** neu gemessen, Stand 0.11.0.

### Was auffiel

| Datei | Zeilen bei 0.8.6 | Zeilen bei 0.11.0 |
|---|---:|---:|
| `public/app.js` | 3.857 | **6.493** |
| `server.js` | — | **4.998** (eine Datei, 69 schreibende Routen) |
| `pruefung.js` | — | **25.591** (eine Datei, 3.815 Prüfungen) |

| Funktion in `public/app.js` | bei 0.8.6 | bei 0.11.0 |
|---|---:|---:|
| `renderSystem()` | 825 | **2.030** |
| `renderDetail()` | 1.310 | **1.499** |

**`renderSystem()` ist auf das Zweieinhalbfache gewachsen** und damit die
längste Funktion der Anlage — sie hat `renderDetail()` überholt, das bei der
ersten Messung noch die längste war.

### Was es nicht ist

**Kein Qualitätsmangel.** Der Quelltext ist dicht kommentiert, die Namen sind
klar, jede Entscheidung ist begründet. Es ist die **Größe der Funktionen**,
nicht ihre Güte.

**Und ausdrücklich kein Fall für ein Framework.** 6.493 Zeilen ohne Framework
sind viel — aber kein Framework heißt: keine Build-Kette, keine 400
Pakete, kein Ablaufdatum. Bei einer Anlage, die zehn Jahre laufen soll, ist das
die richtige Wahl. **Die Antwort hier sind kleinere Funktionen, nicht React.**

**Was es dagegen wirklich ist:** eine Gefahr für die Doktrin „eine Wahrheit".
Bei 1.500 Zeilen sieht man einer Funktion nicht mehr an, ob ein Zustand schon
weiter oben in ihr steht — und jede Änderung kostet erst einmal Suchen.

### Was gebaut werden könnte

**a) Beim nächsten Anfassen je einen Block herausziehen — nicht als eigenes
Vorhaben.** *Das ist der Kern des Vorschlags: kein Umbauprojekt, sondern eine
Auflage an die nächste Runde, die ohnehin dort hineinfasst.*

Bei `renderDetail()`: `zeichneBewertung(item)`, `zeichneKommentare(item)`,
`zeichneTesttage(item)`, `zeichneAnhaenge(item)`. **Die Blöcke sind in der
Oberfläche ohnehin schon eigenständig** — sie lassen sich einzeln anordnen und
einklappen. Die Struktur ist also da, sie steht nur nicht im Quelltext.

Bei `renderSystem()`: **neunzehn Karten, neunzehn Funktionen.**

**b) Eine Prüfung, die die Zahl festhält.** *Nicht um eine Grenze zu setzen,
sondern damit das Wachsen sichtbar wird und nicht erst bei der nächsten
Durchsicht auffällt.* Eine Zeile, die die längste Funktion misst und meldet.

**c) Für `pruefung.js` ist der Weg schon gebaut** — der Gruppenfilter (seit
0.8.10) macht die Datei bedienbar, ohne sie zu teilen. **Zu teilen wäre hier
das Falsche:** die Prüflagen bauen aufeinander auf.

### Offene Entscheidungen

* **Was ist die Grenze — gibt es überhaupt eine?** Eine harte Zahl im Prüfstand
  („keine Funktion über 500 Zeilen") wäre eine Zusicherung, die bei der ersten
  ehrlichen Ausnahme wehtut. *Vorschlag: messen und melden, nicht abweisen.*
* **Werden die Teilfunktionen im Modul belassen oder in eigene Dateien
  gezogen?** Eigene Dateien heißen Ladereihenfolge im Browser, und die Anlage
  hat bewusst keine Build-Kette. *Vorschlag: eine Datei, kleinere
  Funktionen.*
* **Zählt der Prüfstand als „ausgeliefert" mit?** Er wird nicht ausgeliefert,
  wächst aber am schnellsten von allen.

### Was es anfasst

`public/app.js`, gegebenenfalls eine Prüfung. **Kein Schema, keine Route, keine
Oberflächenänderung** — nichts, was ein Benutzer sieht.

**Was dagegen spricht:** *Umbau ohne Anlass ist Risiko ohne Gegenwert.* Genau
deshalb steht hier (a) und nicht „einmal aufräumen": **jede herausgezogene
Funktion soll auf dem Weg zu etwas anderem entstehen**, mit den Prüfungen
dieser Runde im Rücken.

---

## 5. „Entfällt" am einzelnen Kriterium — mit Vorbehalt

**Keine Version hat ihn ausgelöst** — die Lücke steckt in der Bauform der
Kriterien und ist so alt wie sie.

> **Claude: nicht empfohlen** — `ratings` hat je Benutzer eine Zeile.

### Woher

Aus der Durchsicht vom **21. August 2026** (damals Punkt 4.7), Stand 0.8.6, und
**dort schon mit Vorbehalt aufgenommen**.

### Was auffiel

`value = 0` bedeutet heute „nicht bewertet". Es bedeutet aber auch **„gibt es
hier nicht"** — ein Kriterium „Akkulaufzeit" an einem Gegenstand ohne Akku.
Zwei verschiedene Aussagen, ein Wert. Nach der Doktrin der Anlage: eine zweite
Wahrheit.

Praktisch führt das dazu, dass ein vollständig beurteilter Eintrag
**unvollständig aussieht**, und im Vergleich steht eine Lücke, die man nicht
von „noch nicht drangewesen" unterscheiden kann.

### Was es nicht ist

**Kein Rechenfehler.** Rechnerisch fällt ein Kriterium mit `value = 0` schon
heute aus beiden Schnitten heraus — man **sieht** es nur nicht. Es ist also
eine Frage der Anzeige und der Aussage, nicht des Ergebnisses.

**Und wahrscheinlich gar nicht die richtige Frage.** Sie stellt sich nur bei
**gemischten Beständen** — also genau dort, wo die Antwort eigentlich „eine
Anlage ist ein Sachgebiet" heißt (Projektstand, Abschnitt 10, vorgemerkt für
1.0). *Wer beides baut, baut die Ausnahme zur Regel.*

### Was gebaut werden könnte

Ein dritter Zustand am Sterne-Bedienelement, erreichbar über denselben
Doppelklick, der heute zurücksetzt: **leer → entfällt → leer.** In der Zeile
steht dann „—" statt der Sterne, und das Kriterium fällt sichtbar aus beiden
Schnitten heraus.

### Offene Entscheidungen

* **Wie wird „entfällt" gespeichert?** `value = -1` ist billig und schmuggelt
  eine Bedeutung in eine Zahl. Eine eigene Spalte ist ehrlich und kostet einen
  Migrationsblock. *Wenn überhaupt, dann die Spalte.*
* **Wer darf es setzen — und das ist der Haken?** Das Kriterium gehört dem
  Admin, die Bewertung dem Verfasser: `ratings` hat **je Benutzer eine Zeile je
  Kriterium** (`UNIQUE(item_id, criterion_id, user_id)`). **„Entfällt" ist aber
  eine Aussage über den Gegenstand und nicht über den Bewertenden** — ein Akku,
  den es nicht gibt, gibt es für alle nicht. In eine Zeile je Benutzer gelegt,
  könnte A „entfällt" sagen und B vier Sterne. *Das ist genau die zweite
  Wahrheit, die der Punkt beseitigen wollte.* **Am Eintrag gelegt ist es
  richtig — und dann gehört es nicht zur Bewertung, sondern daneben.**
* **Was zeigt das Austauschformat?** Ein dritter Zustand ist ein Feld mehr, und
  ein alter Import muss ihn als „nicht bewertet" lesen können.

### Was es anfasst

Das am häufigsten benutzte Bedienelement der Anwendung, die Detailansicht, den
Vergleich, das Austauschformat — und **das Schema**, sobald die Frage oben
beantwortet ist.

**Was dagegen spricht — und das ist hier der eigentliche Inhalt des Punktes:**
**Er verkompliziert das am häufigsten benutzte Bedienelement, um eine Frage zu
beantworten, die sich nur in einem Bestand stellt, den die Anlage gar nicht
haben soll.**

**Empfehlung: zurückstellen, bis es im Betrieb tatsächlich vermisst wird.** Er
steht hier, weil er die logische Lücke ist — nicht, weil er gebaut werden
sollte. *Ein Sammelblatt, das nur die guten Ideen kennt, verliert die Begründung
für die verworfenen.*

---

## 6. Zwei Einträge zu einem machen

**Nötig geworden mit 0.11.0** — dort ist es aus der Runde herausgenommen worden.

> **Claude: später** — erst, wenn wirklich Doppel dastehen.

### Woher

Der Fahrplan nannte **Doppelerkennung und Zusammenführen in einer Zeile**. Beim
Zählen im Schema, **27. August 2026**, hat sich gezeigt, dass es zwei Vorhaben
sind. Gebaut wurde das erste, das zweite ist herausgefallen — *entschieden, nicht
vergessen* (Änderungsprotokoll 0.11.0, Abweichung zum Auftrag).

### Was auffiel

**Seit 0.11.0 sagt die Anlage beim Anlegen, dass es den Gegenstand schon gibt.
Sie kann aber nichts dagegen tun, wenn er doch zweimal dasteht.** Ein Hinweis
ohne Heilmittel.

### Was es nicht ist

**Kein Fehler und keine Lücke in 0.11.0.** Der Hinweis verhindert den zweiten
Eintrag, **bevor** er entsteht, und das ist der Fall, der zählt. Was fehlt, ist
die Reparatur für die Fälle davor.

**Und es ist ausdrücklich keine kleine Ergänzung.** Es wäre **der erste Eingriff
der Anlage, der Zeilen zwischen zwei Eltern verschiebt** — unumkehrbar. An einem
Eintrag hängen **acht** Tabellen.

### Was gebaut werden könnte

**a) Die vier Eindeutigkeitsschranken, die dabei brechen** — gezählt im Schema,
nicht geschätzt (der Auftrag rechnete mit zweien):

| Tabelle | Schranke | wann sie bricht |
|---|---|---|
| `ratings` | `UNIQUE(item_id, criterion_id, user_id)` | derselbe Mensch hat dasselbe Kriterium an beiden bewertet |
| `test_days` | `UNIQUE(item_id, day, user_id)` | derselbe Mensch am selben Tag an beiden |
| `item_tags` | `PRIMARY KEY (item_id, tag_id)` | **beide tragen denselben Tag** |
| `item_pins` | `PRIMARY KEY (user_id, item_id)` | derselbe Mensch hat beide als Favorit |

**`item_tags` ist dabei der Normalfall und nicht der Randfall:** zwei Einträge,
die denselben Gegenstand beschreiben, tragen fast immer dieselben Tags. Ein
schlichtes `UPDATE … SET item_id = ?` läuft dort **beim ersten echten
Doppeleintrag** auf einen Constraint-Fehler.

**b) Eine eigene Route** — `F_ROUTEN` **69 → 70**, Art `nurAdmin` und
`zweitbestaetigt` —, **ein Vorgang im Sicherheitsprotokoll** (`VORGAENGE`
**20 → 21**) und **eine Sicherung des Datenverzeichnisses als Pflicht**, nicht
als Empfehlung.

### Offene Entscheidungen

* **Was geschieht mit dem Papierkorb?** Er serialisiert einen Eintrag *samt
  allem, was daran hängt*. Nach dem Zusammenführen hängt am Verlierer **nichts**
  mehr — die Wiederherstellung gäbe eine leere Hülle zurück. *Das ist schlechter
  als gar kein Papierkorbeintrag, weil es aussieht wie eine Rettung und keine
  ist.* Entweder der Verlierer wandert **vor** dem Verschieben in den
  Papierkorb, oder der Weg sagt ausdrücklich, dass es keinen Rückweg gibt.
* **Was passiert bei einer brechenden Schranke — überspringen oder abbrechen?**
  Überspringen heißt: der Tag ist schon da, die Zeile fällt weg. Abbrechen
  heißt: der Normalfall geht nie durch. *Bei `item_tags` und `item_pins` ist
  Überspringen richtig; bei `ratings` und `test_days` ist es eine Aussage über
  einen Menschen und gehört ihm gezeigt.*
* **Wer gewinnt bei Titel, Beschreibung, Kategorie und Merkmalen?** Der ältere
  Eintrag, der neuere, oder wählt der Admin je Feld?
* **Darf der Verfasser zusammenführen oder nur der Admin?** Der Eingriff trifft
  auch fremde Zeilen — *das spricht für `nurAdmin`, wie oben angesetzt.*

### Was es anfasst

Acht Tabellen, eine neue Route mit zwei Klemmen, das Sicherheitsprotokoll, den
Papierkorb, die Oberfläche, Prüfungen und Gegenproben. **Kein Schema** — es
bewegt vorhandene Zeilen, es legt keine neuen Spalten an.

**Was dagegen spricht:** nichts ist kaputt, und der Hinweis aus 0.11.0 trägt den
Alltag. **Dagegen spricht aber nicht, dass es teuer ist** — es ist teuer, und
genau deshalb ist es eine eigene Runde und kein Anhängsel.

---

## 7. Der QR-Encoder für den zweiten Faktor

**Nötig geworden mit 0.10.0** — dort ist er vor dem Bau herausgenommen worden.

> **Claude: nicht empfohlen** — der abtippbare Schlüssel trägt den Weg.

### Woher

Aus der Runde „Zwei-Faktor", **0.10.0**. *Herausgenommen mit Begründung und
Maßen, nicht vergessen* (Änderungsprotokoll 0.10.0, Abweichung A).

### Was auffiel

**Google Authenticator kennt zwei Wege hinein:** einen Code scannen oder den
Base32-Schlüssel von Hand eintippen. **Der zweite ist der Weg, an dem Menschen
aufgeben** — zweiunddreißig Zeichen auf einem Telefon.

Heute steht der Schlüssel in **Vierergruppen** auf dem Bildschirm, daneben die
`otpauth://`-Zeile als anklickbarer Verweis. *Auf einem Telefon öffnet der die
App unmittelbar — das trägt den Weg, aber nur dort.* Wer am Rechner sitzt und
das Telefon in der Hand hat, tippt.

### Was es nicht ist

**Keine Auslassung und keine Abkürzung.** Ohne Bibliothek heißt ein QR-Encoder:
Reed-Solomon über GF(256), Kapazitäts- und Blocktabellen je Version und
Fehlerkorrekturstufe, Findemuster, Taktlinien, Alignment, Format- und
Versionsbits, acht Masken mit Bewertung — mehrere hundert Zeilen.

**Teuer ist dabei nicht das Bauen, sondern der Beweis.** Die Zusage „dieselbe
Zeichenfolge ergibt weltweit dieselbe Matrix" braucht ohne Bibliothek einen
eigenen **Dekoder** im Prüfstand, also die doppelte Arbeit. *Er war damit der
einzige Teil der Runde ohne begrenzten Prüfaufwand.*

### Was gebaut werden könnte

Der Encoder selbst, dazu der Dekoder im Prüfstand. **Gemessen statt geschätzt:**
die `otpauth://`-Zeile ist **100 Zeichen** bei `Kriterion/faruk`, **117** bei
`Bewertungskatalog/chefin` und **203** bei einem langen Anlagen- und
Zugangsnamen. Im Bytemodus heißt das **Version 5 bis 8**.

### Offene Entscheidungen

* **Was geschieht, wenn ein langer Titel über die Kapazität hinauswächst?**
  *Die Antwort sollte sein: der Code fällt weg, und der Schlüssel steht allein
  da* — nicht: ein abgeschnittener Code, den ein Telefon annimmt und der ein
  falsches Geheimnis trägt.
* **Eine Bibliothek statt Eigenbau?** Sie nähme den Dekoder und den halben
  Aufwand — und stünde gegen „keine Abhängigkeit, die niemand liest". *Die Frage
  ist nicht beantwortet, sie ist nur bisher nicht gestellt worden.*
* **Wo steht der Code — nur beim Einschalten oder auch danach?** Danach hieße:
  das Geheimnis liegt erneut auf dem Bildschirm.

### Was es anfasst

Die Karte „Zugang" im Systembereich, den Einschaltweg des zweiten Faktors, den
Prüfstand (Encoder **und** Dekoder). **Kein Schema, keine Route, kein
Austauschformat.**

**Was dagegen spricht:** **der abtippbare Schlüssel trägt den Weg auch ohne
ihn.** Es ist Bequemlichkeit, gemessen an mehreren hundert Zeilen mit doppelter
Prüflast — und diese Rechnung hat 0.10.0 schon einmal verloren.

---

## 8. Der Proxy ist ein Ja/Nein, die Anlage ist beides

**Nötig geworden mit 0.8.20** (dort entstand die Einstellung) **und akut mit
0.10.0** — seitdem steht der Reverse Proxy wirklich davor.

> **Claude: stark empfohlen** — das einzige Betriebsrisiko auf der Liste.

### Woher

Aus dem Betrieb. `HINTER_PROXY` steht seit **0.10.0** auf `1`; festgehalten im
Projektstand, Abschnitt 2. *Der Quelltext hat den Fall vorhergesehen:* „Ist die
Anlage je aus mehreren Netzen gleichzeitig erreichbar, gehört das nachgeliefert"
(`auth.js`, Kopf) — geschrieben **0.8.20**, eingetreten **0.10.0**.

### Was auffiel

**Die eine Einstellung bündelt fünf Wirkungen** — `X-Forwarded-For` glauben,
`Secure`, `__Host-`, HSTS und die Startwarnung bei `http://` in
`OEFFENTLICHE_ADRESSE` — **und die Anlage ist inzwischen aus zwei Netzen
zugleich erreichbar.**

Über `http://<server-ip>:3100` kommt damit niemand mehr herein: der Server
antwortet mit **200** und setzt den Cookie, der Browser verwirft ihn
stillschweigend, und im Serverprotokoll steht davon nichts. **Gemessen, nicht
vermutet.**

### Was es nicht ist

**Kein Fehler, sondern der Preis der Einstellung** — und ein Handgriff dagegen
steht in der README („Wenn der Proxy ausfällt"): Einstellung abschalten, neu
starten.

**Was es kostet, gehört trotzdem gesagt:** fällt der Proxy aus oder läuft ein
Zertifikat ab, gibt es **gar keinen Weg mehr in die Oberfläche**. Die Daten sind
sicher und die Werkzeuge auf dem Wirt gehen weiter — lesen lässt sich der
Bestand nicht.

### Was gebaut werden könnte

**a) `X-Forwarded-Proto` lesen** (wird bisher **nirgends** gelesen) und je
Anfrage entscheiden — **mit zwei Cookienamen, nicht mit einem.**

**b) Was NICHT gebaut werden soll: ein Name mit bedingtem `Secure`.** Das gäbe
Sicherheit auf, statt Bequemlichkeit zu gewinnen: wer im eigenen Netz eine
Klartextverbindung verbiegen kann, setzte damit einen Cookie, den die
HTTPS-Seite anschließend auch annimmt — **und genau dagegen gibt es `__Host-`.**

**c) Der dritte Weg, falls (a) zu teuer wird: eine Adressliste, wer den Kopf
setzen darf.** In **0.8.20** ausdrücklich nicht gebaut, weil die Einstellung ein
Ja/Nein sein sollte. *Sie ist inzwischen die Antwort auf die zweite Hälfte des
Problems — die Portfreigabe 3100 —, nicht auf die erste.*

### Offene Entscheidungen

* **Umlegen meldet alle einmalig ab**, weil das Präfix `__Host-` den Namen
  wörtlich verlangt. Bei zwei Namen nebeneinander gilt das nicht mehr — *ist das
  ein Gewinn oder verliert man damit einen ehrlichen Schnitt?*
* **Gilt HSTS dann nur auf dem HTTPS-Weg?** Es muss, sonst sperrt der Kopf den
  Heimnetzweg aus, den (a) gerade offenhalten soll.
* **Bleibt die Portfreigabe 3100 offen?** Heute ist sie als tragbar eingestuft:
  wer im Heimnetz steht, kann den Proxy umgehen und `X-Forwarded-For` selbst
  setzen, die Anmeldebremse ließe sich so aushebeln. *Ein gewöhnlicher Browser
  tut das nicht, ein absichtlicher Aufruf schon.* **Wer sie schließen will**,
  hängt Kriterion in das Netz des Proxys und lässt die Freigabe fallen.

### Was es anfasst

`auth.js` (Cookiename, `Secure`, HSTS), die Adressermittlung, den Prüfstand
(beide Wege statt einem), README. **Kein Schema.**

**Was dagegen spricht:** es ist eine Runde Arbeit für einen Fall, der heute
funktioniert — *und einen Handgriff hat, wenn er ausfällt.* **Dagegen steht,
dass der Handgriff einen Menschen am Wirt braucht, genau dann, wenn nichts
mehr geht.**
---

# Teil II — Gesammelt, ohne Ausarbeitung

**Zeilen, keine Punkte.** Wer eine davon bauen will, arbeitet sie vorher in die
sechs Überschriften aus Teil I aus — *und stellt dabei regelmäßig fest, dass
die Hälfte davon schon beantwortet ist.*

**Hinter jeder Zeile steht, welche Version sie nötig gemacht hat.** *Das ist
keine Zuordnung zu einer Runde, sondern Herkunft: eine Idee ohne Anlass ist
schwerer zu beurteilen als eine, bei der man weiß, was sie ausgelöst hat.*

### Aus dem Betrieb und aus den Runden

- **Prüfung der Wiederherstellung** *(0.8.70)*. Seit die Sicherung über
  `VACUUM INTO` der Hauptweg ist, gibt es eine Datei, die niemand je
  zurückgespielt hat — **eine Sicherung ohne Probe ist eine Vermutung.** Ein
  Weg, der eine Sicherungsdatei probeweise öffnet und den Bestand zählt, ohne
  die laufende Datenbank anzufassen. *(Claude: stark empfohlen)*
- **Anzeige des Speicherverbrauchs** *(0.8.31 für Dateien, verschärft mit
  0.8.50 für Videos)*. Wie viel Platz belegen Fotos, Videos, Anhänge — je
  Eintrag und in Summe. *Berührt Teil I, Punkt 3: dieselbe Zahl, anderer
  Zweck.* *(Claude: empfohlen — geht mit Punkt 3)*
- **Die abweichende Datei beim Namen nennen** *(Fingerprint aus 0.8.10, akut
  mit 0.9.1)*. Der Fingerprint sagt heute nur, **dass** etwas abweicht, nicht
  **was**. Bei 0.9.1 hat sich dort eine Datei zu viel gezeigt (Stolperstein
  158), und der Handgriff dagegen steht bisher nur in der README. **Eine Zeile
  in der Karte „Anlage" würde ihn ersetzen.** *(Claude: empfohlen)*
- **Der Zähler „Offen 7" in der Kopfzeile** *(0.8.60)*. Er stand schon im
  Auftrag der Runde und ist dort ausdrücklich nicht gebaut worden: **er würde
  bei jedem Seitenaufbau gebraucht**, und die Frage, wie er nicht ständig neu
  abgefragt wird, ist die eigentliche Arbeit. *(Claude: nicht empfohlen)*
- **Die Vorschau der Rangfolge im Systembereich** *(0.8.40)*. Sehen, wie sich
  die Spitze verschiebt, wenn man an einem Gewicht dreht. *Das ist es, was
  Gewichte im Alltag bedienbar macht* — es ist aber eine eigene Ansicht mit
  eigenem Endpunkt. *(Claude: empfohlen)*
- **Fälligkeitsdatum an Aufgaben** *(0.8.60)*. Die Aufgabenliste quer über alle
  Einträge gibt es seit der Ansicht „Offen"; ein Datum daran gibt es nicht.
  *(Claude: empfohlen)*
- **Nachladen beim Rollen** *(0.11.0)*. Der dritte Punkt der Übersichtsfrage —
  **und erst dann, wenn die ersten beiden gemessen zu wenig gebracht haben.**
  *Blättern mit Seitenzahlen nicht, nie: es zerschnitte die Suche.*
  *(Claude: später — nur bei gemessenem Bedarf)*
- **Ob ein Admin den zweiten Faktor verlangen kann** *(0.10.0)*. Der Auftrag
  hat die Frage ausdrücklich nicht gestellt; **sie ist offen und nicht
  entschieden.** *(Claude: nicht empfohlen — die Antwort ist nein)*
- **Eindeutigkeit der Adresse** *(0.9.1)*. `users.email` hat bewusst **kein**
  `UNIQUE`: `ALTER TABLE` kann eines nicht nachrüsten, und die gewanderte und
  die frisch angelegte Datenbank wären damit verschieden gebaut. **Der richtige
  Weg ist ein partieller Index** —
  `CREATE UNIQUE INDEX IF NOT EXISTS … ON users(email) WHERE email IS NOT NULL` —,
  der auf beiden Wegen gleich wirkt und mehrere Zugänge ohne Adresse zulässt.
  **Er gehört in dieselbe Runde wie die Prüfung im Code, nicht davor.**
  *Die zweite Hälfte ist schon entworfen:* hinter der Anmeldung wird eine
  doppelte Adresse klar gesagt („Diese Adresse ist bereits vergeben") — wer das
  sieht, ist angemeldet und sieht die Liste ohnehin; **vor der Anmeldung gilt
  das Gegenteil**, dort ist jede unterschiedliche Antwort ein Werkzeug zum
  Durchprobieren. *(Claude: später — mit der Runde, die sie braucht)*
- **Ein Versanddienst über HTTPS statt SMTP** *(0.9.0)*. Falls SMTP am
  Anschluss gar nicht durchkommt — manche Anbieter sperren Port 587 ausgehend —,
  wäre er der Ausweg: Brevo, Mailjet und Postmark haben Schnittstellen, die
  sich mit einem einfachen `fetch` bedienen lassen, **ganz ohne Bibliothek**.
  *Zweiter Weg im Code — erst bauen, wenn SMTP nachweislich scheitert.*
  *(Claude: später)*
- **Der angepinnte Block kann zur Wand werden** *(akut erst bei mehreren
  Zugängen)*. Bei vielen angepinnten Kommentaren mehrerer Leute wächst er über
  allem zusammen. **Wenn das im Betrieb stört, ist die Antwort NICHT eine
  Einschränkung des Anpinnens, sondern eine zweite Sortierstufe innerhalb des
  angepinnten Blocks.** *Beobachten, nicht bauen.* *(Claude: später)*
- **Vorlagen für Einträge**, **Tags in Mengen bearbeiten**, **Druckstylesheet**,
  **PWA-Manifest** *(ohne Anlass, aus der Durchsicht zu 0.8.6)*. Nützlich, keins
  davon dringend; zu den letzten beiden steht in Teil III, warum sie weit unten
  stehen. *(Claude: nicht empfohlen)*
- **Erwähnungen im Kommentar** *(seit es mehrere Zugänge gibt, spätestens
  0.9.1)*. `@name` in einem Kommentar, mit Benachrichtigung. *Setzt voraus, dass
  geklärt ist, wer wen sehen darf — Zugänge sehen einander heute nicht
  vollständig.*
  *(Claude: nicht empfohlen — die Anlage hat keine Benachrichtigungen)*

### Am Prüfstand

- **Ein echter Teillauf** *(Gruppenfilter seit 0.8.10)*. `pruefung.js` ist
  **ein** Ablauf; der Namensfilter filtert die **Ausgabe**, nicht die Arbeit.
  `gegenprobe.js` und `PORT_VERSATZ` mildern das, sie beheben es nicht.
  *(Claude: nicht empfohlen — der Gruppenfilter trägt den Alltag)*
- **Das Wartefenster von zwölf Sekunden** *(0.8.10)*. `starteWeiterenServer`
  wartet 120 × 100 ms auf `/api/config`; unter schwerer Nebenlast reicht das
  nicht, und der Lauf reißt mit „Zweitserver nicht erreichbar" ab. **Beobachtet
  in 0.8.10 und 0.8.30, beide Male neben einem gleichzeitigen Image-Bau.** Die
  Antwort wäre ein größeres Fenster **und** eine Meldung, die sagt, welcher
  Zweitserver gemeint ist. *(Claude: empfohlen — klein)*
- **Ein abgerissener Prüflauf, der sich nicht wiederholen ließ** *(0.9.1)*.
  Einer von sieben Läufen riss in der **ersten** Gruppe ab; ein übriggebliebener
  Server ist ausgeschlossen, sechs volle Läufe danach waren grün. *Es fehlte die
  Auskunftszeile unter dem roten Punkt — die Ausgabe war gefiltert.* **Nicht
  wegerklärt, sondern nicht reproduziert.** Wer ihn wiedersieht, schreibt den
  Lauf vollständig mit. *(Claude: später — beobachten)*

### An den Nummern

- **Zwei Dateisätze tragen die Nummer 0.9.1** *(0.9.1)*. Das veröffentlichte
  0.9.1 in `main` hat den Fingerprint `cb73399d`; die laufende Anlage trug
  `3cf1b093`. Dazwischen liegt die Nacharbeit an Marke und Anmeldekarte.
  **Nach Semantic Versioning, Punkt 3, gehört darauf eine eigene Nummer:
  `0.9.2`** — der Inhalt ist Fehlerbehebung und Aussehen, also PATCH. Nötig
  wären `package.json`, ein Changelog-Eintrag mit Datum, die Zahlen in den
  Papieren und der Tag `v0.9.2`. **Vorgeschlagen und nicht beschlossen;**
  solange es offen ist, lässt sich jener Fingerprint keiner veröffentlichten
  Nummer zuordnen.
  *(Claude: nicht empfohlen — statt einer Nummer ein Satz im Changelog)*

---

# Teil III — Geprüft und bewusst nicht vorgeschlagen

**Das gehört mit dazu, sonst liest sich alles oben wie eine Mängelanzeige** —
und schlimmer: **eine verworfene Idee, deren Begründung nicht aufgeschrieben
ist, kommt in einem halben Jahr als neue Idee zurück.**

- **Verlauf der Kriterienbewertung.** Naheliegend („wie hat sich mein Urteil
  über die Jahre verändert?") — und falsch. Die Trennung ist bereits richtig
  gebaut: der **Testtag** ist die Zeitreihe, die **Kriterienbewertung** ist das
  gegenwärtige Urteil. Zwei Zeitreihen über dieselbe Sache wären zwei
  Wahrheiten.
- **Bericht an einen Testtag binden.** Ebenfalls naheliegend, und ebenfalls
  schon entschieden: *„Ein Bericht ist an keinen Testtag gebunden; er fasst
  meist mehrere zusammen."* Eine Verknüpfung würde ihn nur einengen.
- **Blättern in der Übersicht.** Es würde die Suche zerschneiden — man sucht
  im ganzen Bestand und nicht auf Seite 3. Nachladen beim Rollen, falls
  überhaupt. *Die Grenze, die dahinter stand, ist mit 0.11.0 ohnehin gefallen:
  die Übersicht lädt nicht mehr den ganzen Bestand.*
- **Verschlüsselung je Benutzer.** „Ein Neubau, kein Anbau" — mit der Folge,
  die offen dokumentiert ist: **jeder Benutzer vertraut dem Betreiber mit
  allem.** Für eine selbstgehostete Anlage ist das die richtige Abwägung, und
  sie gehört in die README statt in den Quelltext.
- **Ein Framework im Frontend.** Kein Framework heißt: keine Build-Kette, keine
  400 Pakete, kein Ablaufdatum. *Siehe Teil I, Punkt 4 — die Antwort auf große
  Funktionen sind kleinere Funktionen.*
- **PWA-Manifest.** Für eine Anlage im eigenen Netz ohne Offline-Anspruch ist
  der Gewinn das Icon auf dem Startbildschirm und sonst wenig. Steht in Teil II,
  bewusst weit unten.
- **Tags in Mengen bearbeiten / Vorlagen für Einträge.** Nützlich, aber
  deutlich hinter allem, was in Teil I steht. Sie bleiben, wo sie sind.
- **Die Sortierung nach `updated_at` für alle.** Die Entscheidung ist richtig;
  sie hatte eine Lücke, und die ist mit „Neu seit meinem letzten Besuch"
  (0.8.60) **daneben** geschlossen worden statt durch Umbau.
- **Kriteriengruppen je Kategorie.** Die Alternative zu „eine Anlage ist ein
  Sachgebiet". Sie ist ein Umbau an Kriterienverwaltung, Detailansicht,
  Vergleich, Austauschformat und Gesamtschnitt — und sie beantwortet eine
  Frage, die ein Absatz in der README billiger beantwortet. **Vorgemerkt ist
  deshalb der Absatz** (Projektstand, Abschnitt 10), nicht der Umbau.
- **Wortgrenzensuche statt Teilstring.** Siehe Teil I, Punkt 1 (d): In einem
  Katalog voller Typnummern verschwiege sie still Treffer.
- **Ein Cookiename mit bedingtem `Secure`.** Der billige Weg an Teil I, Punkt 8
  vorbei — und der falsche: er gäbe Sicherheit auf, statt Bequemlichkeit zu
  gewinnen. Wer im eigenen Netz eine Klartextverbindung verbiegen kann, setzte
  damit einen Cookie, den die HTTPS-Seite anschließend auch annimmt — **und
  genau dagegen gibt es `__Host-`.**
- **Ein dreiwertiger Zustand statt `rejected`.** *offen / genommen / verworfen*
  klingt vollständiger, ist aber ein Neubau — und „genommen" ist bei einem
  Bewertungsarchiv gar nicht immer die Gegenfrage zu „abgelehnt". Siehe Teil I,
  Punkt 2 (d).
- **`pruefung.js` in Dateien zerlegen.** Die Prüflagen bauen aufeinander auf;
  der Gruppenfilter aus 0.8.10 macht die Datei bedienbar, ohne sie zu teilen.
  *Was dort wirklich fehlt, ist ein echter Teillauf — Teil II, „Am Prüfstand".*
