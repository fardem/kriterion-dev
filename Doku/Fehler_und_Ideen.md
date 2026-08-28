# Fehler und Ideen

**Das Sammelblatt · Stand 28. August 2026**

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

## Drei Angaben am Kopf jedes Punktes

**Jeder Punkt trägt drei Angaben, und keine davon ist eine Entscheidung.**

### 1. Die Art — was für eine Sache das ist

`Fehler` · `Verbesserung` · `Neue Funktion` · `Design`

**Sie sagt, was der Punkt IST, und nicht, wie wichtig er ist.** Ein Fehler ist
etwas, das nicht tut, was es soll; eine Verbesserung macht etwas Vorhandenes
besser; eine neue Funktion kann die Anlage danach etwas, was sie vorher nicht
konnte; Design ist eine Frage der Darstellung und der Bedienung, nicht des
Verhaltens. *Die Grenze zwischen den letzten beiden ist manchmal dünn — dann
entscheidet die Frage: „Könnte die Anlage danach etwas Neues?"*

**Die Art ordnet NICHT um.** Die Punkte stehen unten weiter in der Reihenfolge,
in der sie aufgefallen sind — das ist Regel 1, und sie gilt. Wer nach Art
suchen will, nimmt die Übersicht am Anfang von Teil I.

### 2. Die Einschätzung von Claude

`stark empfohlen` · `empfohlen` · `später` · `nicht empfohlen`

**Es ist eine Bemerkung und ausdrücklich nur das.** Sie kommt von Claude, nicht
vom Betreiber, und sie ist **keine Entscheidung, keine Rangfolge und keine
Zuordnung zu einer Runde** — dafür ist der Fahrplan da. Sie steht hier, damit
beim Bündeln nicht jeder Punkt neu durchdacht werden muss.

### 3. Draußen üblich — wie andere es machen

**Ein Satz, der sagt, wer es draußen wie löst — und keine Note.** Eine Zahl oder
ein Sternchen wäre erfundene Genauigkeit; ein Name ist nachprüfbar. *Was sich
anderswo bewährt hat, muss hier nicht neu erfunden werden — und wo bewusst
davon abgewichen wird, steht der Grund an Ort und Stelle.*

**Sie darf auch dagegen sprechen.** Wenn draußen alle etwas anders machen als
hier vorgeschlagen, gehört das genauso in die Zeile wie die Bestätigung.

## Ein Wort für das große Gerät: „Desktop"

**Es heißt Desktop und nicht Schreibtisch** — festgelegt am 28. August 2026, und
zwar für **alle lebenden Papiere**: dieses Blatt, den Projektstand und die
README. *Vorher standen dort vierunddreißig „Schreibtisch"; sie sind
umgestellt.*

**Die Änderungsprotokolle bleiben, wie sie sind.** Sie halten fest, was zu ihrer
Zeit gebaut wurde, und ein Papier, dessen Wortlaut sich nachträglich ändert, ist
keine Aufzeichnung mehr. *Wer dort „Schreibtisch" liest, liest das richtige
Wort seiner Runde.*

**Eine Stelle in der README bleibt ebenfalls stehen, und das ist kein
Versehen:** die „Schreibtischschublade", in der ein Zettel mit dem Schlüssel
liegt. Dort ist ein echter Schreibtisch gemeint und kein Gerät.

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

## Übersicht nach Art

**Diese Tabelle ordnet nicht um, sie zeigt nur.** Die Punkte stehen darunter
weiter in der Reihenfolge, in der sie aufgefallen sind — wer nach Art suchen
will, sieht hier nach und geht dann zur Nummer.

| Art | Punkte in Teil I | dazu in Teil II |
|---|---|---|
| **Fehler** | 3 *(Export bricht ab)* | — |
| **Verbesserung** | 1, 4, 8, 12, 13, 15 | „offen" in der Kommentar-Kopfzeile · Kommentar schreiben ohne Rollen · Kennzahlen: Version und Verfahren · der Zähler „Offen 7" |
| **Neue Funktion** | 2, 5, 6, 7, 9, 11, 16 | Erwähnungen im Kommentar · die Vorschau der Rangfolge |
| **Design** | 10, 14 | ⌀ und Anzahl am Kriterium · Import und Export in einer Kachel · die Versionszeile · „mehr" frisst eine Zeile |

**Und die zweite Achse, weil sie beim Bündeln die wichtigere ist:**

| Einschätzung | Punkte |
|---|---|
| **stark empfohlen** | 2, 3, 8, 9, 11, 12, 13 |
| **empfohlen** | 1, 4, 10, 14, 15, 16 |
| **später** | 6 |
| **nicht empfohlen** | 5, 7 |

*Mehrere Punkte zerfallen in Teile mit verschiedener Einschätzung — die Tabelle
nennt die des stärksten Teils, und mehrere davon tragen daneben ein
ausdrückliches „nicht empfohlen" für einen anderen Teil. **Die Aufteilung steht
am Punkt, und sie ist dort der eigentliche Inhalt.***

---

## 1. Die Suche schärfen — Trefferkontext, Suchbereich, Hervorhebung

**Aufgefallen mit 0.11.0** — das Verhalten selbst ist älter.

> **Art: Verbesserung** · **Claude: empfohlen** — aber nur Teil (a), der Trefferkontext.
> **Draußen üblich:** Trefferkontext mit hervorgehobener Fundstelle ist der
> Normalfall (GitHub-Codesuche, Confluence, Zendesk); der Suchbereich als
> Häkchen hinter „Erweitert" ebenso. **Teilstring statt Wortgrenze ist dagegen
> die Ausnahme** — dass sie hier richtig ist, liegt an den Typnummern.

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

> **Art: Neue Funktion** · **Claude: stark empfohlen** — die Anlage schreibt ihr Ergebnis nicht mit.
> **Draußen üblich:** Wer eine Entscheidung festhält, hält immer drei Dinge
> fest — **wann, warum, wer**. Jira, GitHub und jedes Freigabewerkzeug machen
> es so; ein Häkchen ohne diese drei gilt draußen als unvollständig.

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
20 MB in der Datenbank liegen. **Am 28. August 2026 aus einem Vorsorgepunkt ein
eingetretener geworden** — siehe „Der Stand im Feld" unten.

> **Art: Fehler** · **Claude: stark empfohlen** — (a) und (b), und zwar jetzt. Der Strom in (c) weiterhin nicht.
> **Draußen üblich:** Große Ausgaben werden **nie** in einem Zug im Speicher
> gebaut — sie werden gestreamt (`JSONL`, ein Datensatz je Zeile) oder als
> Auftrag im Hintergrund erzeugt und zum Abholen bereitgelegt (GitLab, Discourse,
> Google Takeout). **Und alle drei sagen die erwartete Größe vorher an.**

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

### Der Stand im Feld — 28. August 2026

**Der Betreiber nennt seinen Bestand: rund 973 Bilder, Datenbankdatei rund
660 MB.** Damit steht die Rechnung, die dieser Punkt seit 0.8.6 vorsorglich
aufmacht, zum ersten Mal mit echten Zahlen da:

| | |
|---|---:|
| Datenbankdatei | **660 MB** |
| als Base64, plus ein Drittel | **≈ 880 MB** |
| Nodes Grenze für **einen** String | **≈ 512 MB** |

**Der Export dürfte damit heute schon mit `Invalid string length` abbrechen.**
*Das ist kein „irgendwann", das ist jetzt — und deshalb steht an diesem Punkt
seit heute `Fehler` und nicht mehr `Verbesserung`.*

**Was daran gerechnet und was gemessen ist, gehört auseinandergehalten.** Die
660 MB sind die **Dateigröße**, und die trägt auch Indizes, das
Sicherheitsprotokoll und freie Seiten aus Gelöschtem — die Schätzung fällt
damit **zu hoch** aus. Die ehrliche Zahl ist die Summe über die Blob-Spalten,
und sie ist eine Abfrage:

```sql
SELECT (SELECT COALESCE(SUM(length(data)),0) FROM photos)
     + (SELECT COALESCE(SUM(length(thumb)),0) FROM photos)
     + (SELECT COALESCE(SUM(length(medium)),0) FROM photos)
     + (SELECT COALESCE(SUM(length(data)),0) FROM attachments)
     + (SELECT COALESCE(SUM(length(data)),0) FROM comment_images)
     + (SELECT COALESCE(SUM(length(thumb)),0) FROM comment_images) AS blob_bytes;
```

**Diese Zahl mal vier Drittel gegen 512 MB — das ist der Befund.** Sie gehört
ohnehin gebaut, denn sie ist genau die Grundlage, die Teil (a) unten braucht.
*Fällt sie unter die Grenze, ist der Punkt wieder eine Verbesserung; fällt sie
darüber, ist der Export kaputt und niemand hat es bemerkt, weil ihn niemand
gebraucht hat.*

### Was es nicht ist

**Keine Fehlkonstruktion, sondern eine Grenze, die niemand gezogen hat.** Und
sie trifft ausgerechnet die Funktion, die als Sicherungsnetz gedacht ist.

**Seit dem 28. August aber auch kein Vorsorgepunkt mehr.** Ein Knopf, der bei
diesem Bestand abbricht, ist ein Fehler und keine erreichte Grenze — *der
Unterschied liegt allein darin, ob die Anlage es vorher sagt.* Genau das ist
Teil (b).

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

> **Art: Verbesserung** · **Claude: empfohlen** — beim nächsten Anfassen, nicht als Vorhaben.
> **Draußen üblich:** Eine harte Zeilengrenze im Prüflauf ist verbreitet und
> gilt als zweischneidig — sie wird bei der ersten ehrlichen Ausnahme
> abgeschaltet. **Was sich hält, ist das Messen ohne Abweisen**: die Zahl steht
> im Bericht, und wer sie wachsen sieht, greift ein.

### Woher

Aus der Durchsicht vom **21. August 2026** (damals Punkt 3.3), Stand 0.8.6 —
und **seither jedes Mal größer geworden**. Die Zahlen unten sind am
**28. August 2026** neu gemessen, Stand 0.12.2.

### Was auffiel

| Datei | bei 0.8.6 | bei 0.11.0 | bei 0.12.2 |
|---|---:|---:|---:|
| `public/app.js` | 3.857 | 6.493 | **6.671** |
| `public/style.css` | — | 1.337 | **2.334** |
| `server.js` | — | 4.998 | **4.434** (69 schreibende Routen) |
| `pruefung.js` | — | 25.591 | **25.873** (3.815+ Prüfungen) |

| Funktion in `public/app.js` | bei 0.8.6 | bei 0.11.0 | bei 0.12.2 |
|---|---:|---:|---:|
| `renderSystem()` | 825 | 2.030 | **2.022** |
| `renderDetail()` | 1.310 | 1.499 | **1.586** |

**`renderSystem()` ist auf das Zweieinhalbfache gewachsen** und damit die
längste Funktion der Anlage — sie hat `renderDetail()` überholt, das bei der
ersten Messung noch die längste war.

**Und seit 0.12.2 steht ein zweiter Name in der Tabelle, der vorher fehlte:
`public/style.css` hat sich in einer einzigen Runde fast verdoppelt** —
1.337 auf 2.334 Zeilen, gewachsen um den Abschnitt für Telefon und Tablett. Es
ist damit **die am schnellsten wachsende ausgelieferte Datei der Anlage**, und
dieser Punkt hat sie bis heute nicht beobachtet. *Ein Stylesheet lässt sich
nicht in Funktionen zerlegen — die Frage nach seiner Größe ist eine andere und
gehört ausdrücklich noch nicht beantwortet. Gemessen wird sie ab jetzt.*

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

> **Art: Neue Funktion** · **Claude: nicht empfohlen** — `ratings` hat je Benutzer eine Zeile.
> **Draußen üblich:** „nicht zutreffend" wird durchweg **am Gegenstand**
> geführt und nicht an der Stimme des Bewertenden — bei Umfragewerkzeugen ist
> es eine Eigenschaft der Frage, nicht der Antwort. *Genau daran scheitert der
> Punkt hier: die Bewertung hängt am Benutzer.*

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

> **Art: Neue Funktion** · **Claude: später** — erst, wenn wirklich Doppel dastehen.
> **Draußen üblich:** Zusammenführen gilt überall als **unumkehrbarer
> Verwaltungseingriff** — nur für Admins, mit Sicherung davor und einem
> Protokolleintrag danach (Jira, Bugzilla, Discourse, MediaWiki). Und alle
> geben dem Verlierer einen Grabstein, statt ihn spurlos zu entfernen.

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

> **Art: Neue Funktion** · **Claude: nicht empfohlen** — der abtippbare Schlüssel trägt den Weg.
> **Draußen üblich:** **Niemand schreibt einen QR-Encoder selbst.** Es wird
> ausnahmslos eine Bibliothek genommen (`qrcode`, `qrcode-generator`) — und
> genau deshalb kommt die Frage nach dem eigenen Dekoder draußen gar nicht erst
> auf. *Hier ist sie die ganze Rechnung.*

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

> **Art: Verbesserung** · **Claude: stark empfohlen** — das einzige Betriebsrisiko auf der Liste.
> **Draußen üblich:** `X-Forwarded-Proto` je Anfrage lesen ist der Normalweg —
> Express nennt ihn `trust proxy`, und `req.protocol` folgt ihm dann von selbst.
> **Und die Adressliste, wer den Kopf setzen darf, gehört dort ausdrücklich
> dazu:** ohne sie ist der Kopf eine Behauptung des Aufrufers.

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

## 9. Gescheiterte Anmeldungen: sichtbar machen, und eine Zeile für CrowdSec

**Aufgefallen im Betrieb, 28. August 2026** — der Betreiber setzt einen
CrowdSec-Container vor die Anlage und findet nichts, was der lesen könnte.

> **Art: Neue Funktion** · **Claude: stark empfohlen** für (a) und (d), **empfohlen** für (c), **nicht empfohlen** für (b).
> **Draußen üblich:** **fail2ban und CrowdSec lesen ausnahmslos Logdateien,
> niemals Datenbanken** — und sie sperren nach **Adresse**, nicht nach Namen.
> Der getippte Benutzername ist für sie ohne Wert. *Das entscheidet diesen
> Punkt fast allein.*

### Woher

Aus dem Betrieb, **28. August 2026**. Der Wunsch war: gescheiterte Anmeldungen
im Sicherheitsprotokoll auflisten — **samt der getippten Benutzernamen**,
anklickbar, gleich ob ausgebremst, falsches Passwort oder gesperrt —, dazu eine
Rotation und ein Beispiel für die CrowdSec-Einrichtung.

### Was auffiel

**Die Hälfte davon gibt es schon, die andere Hälfte an einer anderen Stelle als
gedacht.**

`anmeldung.fehl` **wird längst mitgeschrieben** (`auth.js:603`), und der falsche
zweite Faktor schreibt dieselbe Zeile (`server.js:416`). `ziel` trägt die
Zugangsnummer, **wenn der getippte Name einen vorhandenen Zugang traf** — sonst
`NULL`, und die Karte zeigt dort „unbekannter Name".

**Was wirklich fehlt, ist zweierlei, und die beiden haben nichts miteinander zu
tun:**

1. **Man findet sie nicht.** Die Karte holt die hundert jüngsten Zeilen, alle
   Vorgangsarten gemischt, ohne Filter. Wer nach Fehlversuchen sucht, blättert.
2. **Es gibt nichts zu parsen.** Kriterion schreibt bei einer gescheiterten
   Anmeldung **nichts** nach stdout — nachgesehen, `auth.js` und `server.js`
   kennen keine solche Zeile. **CrowdSec hat hier heute keine Grundlage.**

### Was es nicht ist

**Kein fehlendes Mitschreiben.** Und ausdrücklich **kein Fall für den getippten
Namen in der Protokolltabelle** — das steht gegen zwei festgeschriebene
Entscheidungen, von denen eine als **Zusage im Kartentext** steht:

> „Ebenso wenig Adresse oder Browserkennung: **die Anlage speichert beides
> nicht.**"

Und der Grund für „kein Freitext" steht am Schema in `db.js`, wörtlich: *„sonst
landete früher oder später ein ins falsche Feld getipptes Passwort darin."*
**Das ist keine Vorsicht auf Verdacht** — Facebook, Twitter und GitHub haben
genau so Klartextpasswörter in ihren Protokollen gefunden.

**Auch die Ausnahme „gleich ob ausgebremst" ist keine Lücke, sondern der
Deckel.** Der ausgebremste Fall schreibt absichtlich nichts: die Bremse ist das
Einzige, was verhindert, dass ein Fremder die Tabelle vollschreibt. Nähme man
sie heraus, wäre die einzige von außen auslösbare Zeile ohne Obergrenze.

### Was gebaut werden könnte

**a) Ein Filter an der Karte, und die Namen anklickbar.** Nach Vorgangsart
filtern, „gescheiterte Anmeldungen" als eigene Ansicht, und ein Klick auf den
Zugang springt zu ihm. *Klein, ändert kein Schema, nimmt niemandem etwas weg.*

**b) Was NICHT gebaut werden soll: Name oder Adresse in die Protokolltabelle.**
Siehe oben. Die Tabelle trägt Nummern aus geschlossenen Listen; das ist baulich
wahr und nicht bloß beabsichtigt.

**c) Eine maschinenlesbare Zeile nach stdout.** Fester, versionierter Aufbau mit
Zeitstempel, Adresse und einem Grundcode — **ohne den getippten Namen**, weil
CrowdSec ihn nicht braucht und die Doktrin ihn nicht hergibt. Dazu ein
`parsers/`- und ein `scenarios/`-Beispiel in der README.

**d) Und zuerst der Weg ohne eine Zeile Code — er könnte (c) ganz ersparen.**
Die Antworten der Anmelderoute sind **bereits sauber unterscheidbar**:

| Fall | Antwort |
|---|---|
| Name oder Passwort falsch | **401** |
| ausgebremst | **429** |
| Passwort richtig, Zugang gesperrt | **403** |

Der Betreiber betreibt **Nginx Proxy Manager**, und dessen Zugriffsprotokoll
sieht jede dieser Antworten. **Ein CrowdSec-Szenario auf `POST /api/login` mit
401/403/429 sperrt die Adresse heute**, ohne dass an Kriterion irgendetwas
geändert wird. *Das gehört als Beispiel in die README — und erst wenn es
nachweislich nicht reicht, kommt (c).*

**e) Rotation ist zweimal schon beantwortet, an beiden Enden.** Das
Sicherheitsprotokoll räumt sich selbst (`PROTOKOLL_TAGE = 180`, beim Start und
beim Öffnen der Karte), und für das Containerprotokoll ist Docker zuständig:
vier Zeilen `logging:` in der `docker-compose.yml`. **Beides gehört in die
README, nicht in den Code.**

### Offene Entscheidungen

* **Bekommt der ausgebremste Fall eine stdout-Zeile?** In der Tabelle
  ausdrücklich nicht — im Protokoll wäre er dagegen nützlich, denn er sagt
  CrowdSec, dass hier jemand wirklich durchprobiert. *Vorschlag: ja, und genau
  darin liegt der Unterschied zwischen den beiden Ablagen.*
* **Wie fest ist „fester Aufbau"?** Ein Logformat, das jemand parst, ist eine
  **Zusage**. Wer es später ändert, bricht fremde Einrichtungen — das gehört
  gesagt, bevor die erste Zeile geschrieben wird.
* **Steht der getippte Name wenigstens im Containerprotokoll?** *Vorschlag:
  nein.* Es ist dieselbe Gefahr an einem anderen Ort, und CrowdSec hat nichts
  davon.
* **Trägt die Zeile die Adresse aus `X-Forwarded-For`?** Nur wenn
  `HINTER_PROXY` an ist — sonst stünde dort die Adresse des Proxys, und die
  Sperre träfe den Proxy. *Das hängt unmittelbar an Punkt 8.*

### Was es anfasst

Für (a): die Karte im Systembereich und die Leseroute. Für (c): eine
Ausgabestelle in `auth.js`, der Prüfstand, README. Für (d) und (e): **nur die
README.** **Kein Schema, keine neue Abhängigkeit.**

**Was dagegen spricht:** an (a), (d) und (e) nichts. Gegen (c) spricht, dass
(d) es womöglich erledigt — *und eine Zeile, die niemand liest, ist eine Zusage,
die man trotzdem halten muss.*

---

## 10. Der Systembereich bekommt Abschnitte

**Aufgefallen im Betrieb, 28. August 2026** — verschärft mit 0.12.0, seit die
neunzehn Karten auf dem Telefon in **einer** Spalte untereinander stehen.

> **Art: Design** · **Claude: empfohlen** — und ausdrücklich gemeinsam mit Punkt 4.
> **Draußen üblich:** Einstellungen mit seitlicher Abschnittsleiste und **einer
> eigenen Adresse je Abschnitt** — GitLab, GitHub, Nextcloud, Discourse. *Die
> eine Falle, in die alle einmal getreten sind, ist die fehlende Adresse: ohne
> sie lässt sich keine Einstellung verlinken und die Zurück-Taste bricht.*

### Woher

Aus dem Betrieb, **28. August 2026**. Der Wunsch: den Systembereich aufteilen —
Persönliches, Datenbank (Sicherung, Export, Zugänge, Anmeldungen,
Sicherheitsprotokoll) und so fort.

### Was auffiel

**Neunzehn Karten in einer flachen Reihe**, und `renderSystem()` ist mit
**2.022 Zeilen** die längste Funktion der Anlage. Am Desktop stehen sie in
mehreren Spalten; seit 0.12.0 stehen sie auf dem Telefon **alle untereinander**,
und der Weg von „Titel" bis „Vokabular" ist entsprechend lang.

### Was es nicht ist

**Kein Fehler.** Und **kein zweiter Vorschlag neben Punkt 4, sondern dessen
Anlass.** Punkt 4 sagt seit der ersten Durchsicht: *„Bei `renderSystem()`:
neunzehn Karten, neunzehn Funktionen"* — und dazu die Auflage, **nicht** als
eigenes Umbauvorhaben, sondern *„auf dem Weg zu etwas anderem"*. **Dieser Punkt
ist dieser Weg.** Wer die Abschnitte baut, zerlegt die Funktion dabei ohnehin.

### Was gebaut werden könnte

**a) Vier oder fünf Abschnitte statt einer Reihe.** Ein Vorschlag, der der
Rechteleiter folgt und nicht dem Zufall:

| Abschnitt | Karten |
|---|---|
| **Persönlich** | Zugang, Meine Sitzungen, Darstellung |
| **Bestand** | Kategorien, Tags, Bewertungskriterien, Vokabular, Links, Suchanbieter, Papierkorb |
| **Zugänge** | Zugänge, Anfragen, Sicherheitsprotokoll, Mailversand |
| **Datenbank** | Kennzahlen, Sicherung, Export und Import |
| **Anlage** | Titel |

**b) Eine Adresse je Abschnitt** — `#/system/datenbank`. Die Anlage hat die
Adressform bereits (`#/item/12`).

**c) Export und Import in EINE Karte** (siehe Teil II). Sie stehen ohnehin
nebeneinander; in einem Abschnitt „Datenbank" gehören sie zusammen. **Mit einem
Vorbehalt: der Import ersetzt Bestand, der Export liest nur.** Zusammengelegt
darf der Import nicht einen Klick näher rücken.

### Offene Entscheidungen

* **Was geschieht mit einem Abschnitt, der für eine Rolle leer bleibt?** Die
  Karten hängen an `ADMIN ?` und `EIGENTUEMER ?`. Ein leerer Reiter wäre
  schlechter als keiner. *Vorschlag: ein Abschnitt ohne sichtbare Karte
  erscheint nicht.*
* **Reiter oder eine Leiste an der Seite?** Auf dem Telefon trägt eine Leiste
  an der Seite nicht — dort wäre es eine Liste, die in den Abschnitt hinein
  führt. **Das ist dann fast dieselbe Frage wie „die Unteransichten haben keine
  Kopfzeile" in Teil II.**
* **Merkt sich die Anlage den zuletzt offenen Abschnitt?** *Vorschlag: nein —
  die Adresse tut es schon, und ein gemerkter Zustand wäre eine zweite
  Wahrheit daneben.*

### Was es anfasst

`renderSystem()` samt seinen neunzehn Blöcken, die Adressauflösung, das
Stylesheet, Prüfungen. **Kein Schema, keine Route, keine Rechteänderung** — die
Karten behalten ihre Klemmen, sie stehen nur woanders.

**Was dagegen spricht:** es ist die größte Umbaufläche auf dieser Liste. *Und
genau deshalb steht daneben, dass Punkt 4 ohnehin darauf wartet — die Arbeit
fällt einmal an, nicht zweimal.*

---

## 11. Die Gewichtung erklärt sich nicht

**Aufgefallen im Betrieb, 28. August 2026.** Das Wort „gewichtet" steht seit
0.8.40 da und sagt nicht, was es bedeutet.

> **Art: Neue Funktion** · **Claude: stark empfohlen** für (a) — bester Erklärungsgewinn je Zeile auf dieser Liste.
> **Draußen üblich:** „Erklär mir diese Zahl" **am Ort der Zahl und mit den
> echten Werten**, nicht mit einem erfundenen Beispiel — Stripes
> Gebührenaufschlüsselung, Grafanas Query Inspector, jede Steuersoftware.
> *Ein allgemeines Rechenbeispiel liest niemand zweimal; die eigene Rechnung
> schon.*

### Woher

Aus dem Betrieb, **28. August 2026**. Der Wunsch: das Wort „gewichtet" am
Eintrag anklickbar machen, mit Formel und Rechenbeispielen — und im
Systembereich etwas zum Ausprobieren.

### Was auffiel

Am Eintrag steht **„⌀ 4,2 gewichtet"**, und an einer Kriterienzeile steht
**„×1,5"**. Beides ist richtig und beides erklärt sich nicht. Wer wissen will,
wie aus den Sternen die Kopfzahl wird, findet es nirgends — **auch nicht in der
Karte, in der die Gewichte eingestellt werden.**

*Und das Wort ist bereits klüger, als es aussieht:* „gewichtet" ist
**abgeleitet** und kein Schalter (`app.js:3350`) — es steht nur da, wenn
wirklich ein Gewicht ungleich 1 in die Rechnung eingegangen ist.

### Was es nicht ist

**Kein Rechenfehler und keine fehlende Funktion.** Die Rechnung ist da, sauber
und an einer Stelle. **Es fehlt die Auskunft darüber**, und das ist eine Frage
der Darstellung — mit einer Ausnahme: Teil (b) ist wirklich eine neue Ansicht.

### Was gebaut werden könnte

**a) Klick auf „gewichtet" öffnet einen Kasten mit DIESER Rechnung.** Nicht mit
einem erfundenen Beispiel, sondern mit den Zahlen des Eintrags, der gerade
offen ist:

> Bedienbarkeit **4** × 1,5 = 6,0
> Preis **3** × 1,0 = 3,0
> Optik **5** × 0,5 = 2,5
> ——————————
> 11,5 ÷ 3,0 (Summe der Gewichte) = **3,83**

*Alles darin steht der Ansicht bereits zur Verfügung* — `item.ratings` trägt
Wert, Schnitt und Gewicht je Kriterium.

**b) Ein Rechner im Systembereich — und der ist nicht neu.** In Teil II steht
seit 0.8.40 die Zeile **„Die Vorschau der Rangfolge im Systembereich"**: an
einem Gewicht drehen und sehen, wie sich die Spitze verschiebt. **Das ist
dasselbe Vorhaben**, nur von der anderen Seite beschrieben. Ein zweiter Rechner
daneben wären zwei Wahrheiten über dieselbe Rechnung.

**c) Was NICHT gebaut werden soll: eine Formel in Prosa in der README.** Sie
steht dann dort, wo niemand sie sucht, und veraltet still, sobald die Rechnung
sich ändert. *Die Erklärung gehört an die Zahl.*

### Offene Entscheidungen

* **Was zeigt der Kasten bei „meine / alle"?** Der Umschalter rechnet zwei
  verschiedene Nenner — **der Kasten muss zeigen, welcher gerade gilt**, sonst
  erklärt er die falsche Zahl.
* **Und was bei einem Kriterium, das niemand bewertet hat?** Es fällt aus dem
  Nenner heraus. *Das ist genau die Stelle, an der die meisten Leute die
  Rechnung falsch raten — es gehört sichtbar in den Kasten, nicht weggelassen.*
* **Auch an der Kachel oder nur in der Detailansicht?** Auf der Kachel steht
  dieselbe Zahl ohne das Wort. *Vorschlag: nur in der Detailansicht — auf der
  Kachel fehlt der Platz und der Anlass.*

### Was es anfasst

Die Detailansicht, ein Kasten, das Stylesheet. Für (b) zusätzlich der
Systembereich und ein Endpunkt. **Kein Schema, keine Route für (a).**

**Was dagegen spricht:** an (a) nichts — es ist eine Anzeige über eine Rechnung,
die es längst gibt. Bei (b) spricht dagegen, dass es **eine eigene Ansicht mit
eigenem Endpunkt** ist und damit eine eigene Runde.

---

## 12. Gelöschte Zugänge, und der Weg zurück

**Aufgefallen im Betrieb, 28. August 2026** — seit es mehrere Zugänge gibt und
der erste gelöscht wurde.

> **Art: Verbesserung** · **Claude: stark empfohlen** für (b), **empfohlen** für (a), **nicht empfohlen** für (c), **später** für (d).
> **Draußen üblich:** **Sperren und Löschen sind überall zwei getrennte
> Vorgänge** — GitHub, GitLab, Google Workspace, Discourse. Und die Gnadenfrist
> von dreißig Tagen gibt es dort **ausnahmslos bei Selbstlöschung**; eine
> Löschung durch den Admin wirkt überall sofort, und der Name wird
> anonymisiert statt aufbewahrt.

### Woher

Aus dem Betrieb, **28. August 2026**. Der Wunsch war dreiteilig: gelöschte
Zugänge aus der normalen Liste heraus in ein eigenes Fenster; eine
Rückholfrist von dreißig Tagen; und in der Liste der Gelöschten **den
ursprünglichen Namen lesen können** — *„was nützt mir ‚Gelöschte 5', wenn ich
nicht sehe, wer das war?"*

### Was auffiel

`entferneZugang()` überschreibt beim Löschen `username` mit `geloescht-<id>`,
leert den Hash, setzt die Rolle zurück und entfernt die Adresse. **Der
ursprüngliche Name ist danach nirgends mehr** — und die Grabsteine stehen
zwischen den lebenden Zugängen in derselben Liste.

### Was es nicht ist

**Der Ursprungsname ist keine Auslassung, sondern eine Entscheidung — und sie
ist zweimal festgeschrieben.** Am Schema in `db.js` steht wörtlich, warum das
Sicherheitsprotokoll keine Namensspalte hat: *„entferneZugang() überschreibt
username, und eine Kopie hier wäre die eine Stelle im Projekt, die den Grabstein
rückgängig macht."*

**Zwei harte Gründe stehen dahinter, und beide sind nicht wegzudiskutieren:**

1. **Der Name wird zur Neuvergabe frei.** Ein aufbewahrter alter Name kollidiert
   früher oder später mit einem lebenden Zugang, der ihn inzwischen trägt.
2. **Der Grabstein IST die Anonymisierung** — genau das, was Artikel 17 DSGVO
   verlangt. Wer den Namen aufbewahrt, hat nicht gelöscht.

**Und die Rückholfrist ist zur Hälfte schon gebaut, nur heißt sie anders.** Der
umkehrbare Weg ist **sperren**: die Anmeldung wird abgewiesen, die laufende
Sitzung fällt, **der Name bleibt, der Bestand bleibt**, und der Admin kann es
jederzeit zurücknehmen. *Was fehlt, ist nicht der Mechanismus — es ist der Satz,
der ihn im Löschdialog nennt.*

### Was gebaut werden könnte

**a) Gelöschte Zugänge raus aus der Liste, in ein eigenes Fenster.** Das Vorbild
steht im Projekt: der Dialog **„Wer hat bewertet"**. *Reine Oberfläche.*

**b) Der Löschdialog nennt den umkehrbaren Weg.** Heute sagt er
„unwiderruflich" und „der Name wird frei" — er sagt **nicht**, dass es
daneben einen Weg gibt, der beides nicht tut. Ein Satz:

> *„Nur vorübergehend aussperren? Dann **sperren** statt entfernen — das ist
> umkehrbar, und der Name bleibt."*

**Ein Satz gegen eine unumkehrbare Fehlbedienung.** *Das ist der billigste Punkt
mit dem größten Schaden dahinter, und deshalb steht er hier über allen anderen.*

**c) Was NICHT gebaut werden soll: der Ursprungsname am Grabstein.** Siehe oben,
zwei Gründe.

**d) Die Rückholfrist von dreißig Tagen.** Baubar — aber sie ist ein eigener
Zustand zwischen „aktiv" und „gelöscht", mit eigenem Aufräumer, und sie
überschneidet sich mit „gesperrt".

### Offene Entscheidungen

*Die folgenden gelten nur, falls (d) trotz (b) gewollt ist:*

* **Bleibt der Name in den dreißig Tagen gesperrt oder frei?** Frei heißt: die
  Rückholung kann an einem inzwischen vergebenen Namen scheitern.
* **Wer räumt ab?** Dieselbe Bauform wie Papierkorb, Token und
  Sicherheitsprotokoll: eine Funktion, zwei Aufrufstellen.
* **Darf ein Admin die Frist überspringen?** Draußen gibt es die Frist nur bei
  Selbstlöschung. *Wer sie hier auch dem Admin auferlegt, baut etwas, das es
  sonst nirgends gibt — das muss man wollen.*
* **Und die Frage, die alles davor entscheidet: was genau soll die Frist, was
  „sperren" nicht schon kann?**

### Was es anfasst

Für (a) und (b): die Karte „Zugänge" und zwei Dialogtexte. **Kein Schema.** Für
(d): eine Spalte, ein Migrationsblock, ein Aufräumer, das Sicherheitsprotokoll
und die Rechteprüfung an drei Routen.

**Was dagegen spricht:** an (a) und (b) nichts. Gegen (c) spricht die Doktrin
und das Gesetz. Gegen (d) spricht, dass es einen zweiten Weg für etwas baut,
das es schon gibt — *und zwei Wege zum selben Ziel laufen auseinander.*

---

## 13. Nur zeichnen, was zu sehen ist

**Aufgefallen im Betrieb, 28. August 2026** — verschärft mit 0.12.0, seit die
Kacheln auf dem Telefon einspaltig untereinander stehen.

*Dieser Punkt stand bis heute als Zeile in Teil II („Nachladen beim Rollen",
0.11.0). Er hat genug Inhalt bekommen, um hier zu stehen — **und die Antwort
fällt anders aus, als die Zeile vermuten ließ.***

> **Art: Verbesserung** · **Claude: stark empfohlen** für (a), **später** für (b), **nicht empfohlen** für (c).
> **Draußen üblich:** Für lange Listen ist **Fensterung** der Konsens, nicht
> Blättern — react-window, TanStack Virtual. **`content-visibility: auto` ist
> derselbe Gedanke ohne Bibliothek**, seit 2024 in allen großen Browsern, und
> passt damit zu einer Anlage ohne Build-Kette.

### Woher

Aus dem Betrieb, **28. August 2026**. Der Wunsch: beim Öffnen nur laden, was auf
den Schirm passt, plus eine Vorratsseite — **und zwar dem eingeschalteten
Filter folgend**, nicht irgendwelche Einträge. Dazu die Fragen: was geschieht
mit Einträgen, die gerade nicht mehr angezeigt werden? Endloses Rollen oder
Seiten? Wie viele Kacheln je Seite?

### Was auffiel

**Nachgemessen, und die Zahlen ändern die Frage.**

`GET /api/items` liefert weiterhin **alle** Einträge — seit 0.11.0 aber
schlank: **0,52 MB und 93 ms bei 1000 Einträgen**, vorher 2,50 MB und 110 ms
(Änderungsprotokoll 0.11.0, Abschnitt „Die ehrliche Gegenrechnung").

**Und die Arbeitsteilung ist entscheidend:** die **Suche** läuft am Server;
**alle übrigen Filter und alle elf Sortierungen laufen örtlich** über
`visibleItems()` (`app.js:1510`) auf der vollständigen Liste im Speicher.

### Was es nicht ist

**Kein Ladeproblem — ein Zeichenproblem.** Bei 0,52 MB ist nicht das Holen
teuer, sondern das, was der Browser daraus baut: tausend Kacheln, jede mit
Bild, Sternen, Tags und Zeitleiste. *Auf dem Telefon ist das spürbar, am
Desktop kaum.*

**Und ausdrücklich kein Fall für Blättern am Server.** Es hieße, sechs Filter
und elf Sortierungen an den Server zu verlegen — **und es zerschlüge zwei
Dinge, die den ganzen Bestand brauchen**: die Zahlen an der Filterzeile („wie
viele blieben übrig, wenn ich diesen Umschalter noch drücke") und die gedämpften
Tags in der Wolke.

**Die Frage nach den ausgeblendeten Einträgen löst sich damit auf.** *„Was
machen wir mit Einträgen, die durch eine vorhergehende Aktion geladen wurden und
gerade nicht angezeigt werden?"* — **nichts.** Sie werden gar nicht geladen und
gar nicht entladen; sie stehen im Speicher, und nur der Aufbau der Seite wird
begrenzt. Es gibt nichts wegzuwerfen.

**Ebenso die Forderung „dem Filter folgen": sie ist bereits erfüllt.**
`visibleItems()` **ist** die gefilterte und sortierte Liste. Wer ihre ersten N
zeichnet, folgt dem Filter zwangsläufig.

### Was gebaut werden könnte

**a) `content-visibility: auto` an der Kachel, mit `contain-intrinsic-size`.**
Zwei Zeilen im Stylesheet, **kein JavaScript**, keine Änderung an Route, Suche,
Filter oder Sortierung. Der Browser überspringt Layout und Zeichnen für alles
außerhalb des Bildes und holt es nach, sobald es hereinrollt. *Die
`contain-intrinsic-size` ist die geschätzte Kachelhöhe — ohne sie springt der
Rollbalken.*

**b) Später, und nur bei gemessenem Bedarf: nachladen beim Rollen.** Ein
Beobachter am Listenende (`IntersectionObserver`) hängt die nächsten N aus
`visibleItems()` an. **Erst dann, wenn (a) gemessen zu wenig gebracht hat.**

**c) Was NICHT gebaut werden soll: Blättern mit Seitenzahlen.** Steht schon
zweimal im Blatt, in Teil II und in Teil III: *es zerschnitte die Suche.* Man
sucht im ganzen Bestand und nicht auf Seite 3.

### Offene Entscheidungen

* **Wie hoch ist eine Kachel?** `contain-intrinsic-size` braucht eine Zahl, und
  sie ist auf Telefon und Desktop verschieden. **Zu klein geschätzt springt der
  Rollbalken, zu groß bleibt Leerraum unter der Liste.**
* **Wird überhaupt gemessen, bevor (b) kommt?** *Die Zahl, die zählt, ist die
  Zeit bis zur ersten sichtbaren Kachel auf dem Telefon — nicht die Zeit der
  Antwort.* Ohne diese Messung ist (b) Arbeit auf Verdacht.
* **Wenn (b) kommt: wie viele je Nachschub?** Draußen üblich ist **ein
  Schirmvoll mal drei** als erster Wurf und ein Schirmvoll je Nachschub. *Mit
  (a) stellt sich die Frage womöglich gar nicht.*

### Was es anfasst

Für (a): **das Stylesheet, sonst nichts.** Für (b) zusätzlich `drawBody()` und
eine Prüfung. **Kein Schema, keine Route, keine Antwort ändert sich.**

**Was dagegen spricht:** gegen (a) nichts — es ist der billigste messbare
Gewinn auf dieser Liste. Gegen (b) spricht, dass es einen Zustand einführt
(„wie viele sind gerade gezeichnet"), den es heute nicht gibt, und dass jede
Sortierung und jeder Filter ihn zurücksetzen muss.

---

## 14. Ein Kasten, eine Farbe — die Kennzeichnung am Kommentar

**Aufgefallen im Betrieb, 28. August 2026.** Die Bauform ist älter; sie stammt
aus der Runde, die das Anpinnen gebracht hat.

> **Art: Design** · **Claude: empfohlen** — die Regel wird dabei einfacher, nicht komplizierter.
> **Draußen üblich:** **Farbe für die Art, Form für den Zustand** ist die
> übliche Aufteilung — GitHub färbt Etiketten und rahmt Angepinntes, Trello und
> Todoist ebenso. *Zwei Farben an einem Kasten gelten überall als das, was sie
> sind: eine Kollision.*

### Woher

Aus dem Betrieb, **28. August 2026**, mit einem Bildschirmfoto: *„ich finde die
Mischung der Farben innerhalb eines Rahmens nicht gut."*

### Was auffiel

Ein Kommentar trägt heute **zwei Merkmale auf zwei getrennten Kanälen**, und
der Quelltext sagt es ausdrücklich so (`style.css:1345`): *„Zwei Merkmale, zwei
Kanäle, die sich nie ins Gehege kommen: die linke Kante gehört allein der Art,
die drei übrigen Kanten allein der Anpinnung."*

| | heute |
|---|---|
| linke Kante, 3px | die **Art** — orange (Bericht), blau (Aufgabe), grün (erledigt), neutral (Notiz) |
| die drei übrigen Kanten, 1px | die **Anpinnung** — Gold |

**Ein angepinnter Bericht trägt damit orange und gold gleichzeitig.** Der
Gedanke dahinter ist sauber; das Ergebnis am Bildschirm ist ein Kasten mit zwei
Farben.

### Was es nicht ist

**Kein Fehler.** Es ist eine Bauform, die genau das tut, was sie soll — und
deren Preis erst sichtbar wird, wenn beide Merkmale zugleich auftreten. *Der
Quelltext hat den Fall vorhergesehen und für richtig gehalten; der Betrieb
sieht ihn anders.*

**Und es ist keine Verkomplizierung.** Die neue Regel hat **weniger** Fälle als
die alte: heute muss man wissen, welche Kante was bedeutet — künftig sagt die
Farbe die Art und die Form die Anpinnung.

### Was gebaut werden könnte

**Die Regel: Farbe = Art, Form = Anpinnung — und die dicke linke Kante bleibt,
wo sie ist.**

| | nicht angepinnt | angepinnt |
|---|---|---|
| **Bericht** | dicke **orange** Linie links *(wie bisher)* | dieselbe **dicke orange Linie links**, dazu die drei übrigen Kanten dünn in **Orange** |
| **Aufgabe** | dicke **blaue** Linie links *(wie bisher)* | dieselbe **dicke blaue Linie links**, dazu die drei übrigen Kanten dünn in **Blau** |
| **Erledigt** | dicke **grüne** Linie links *(wie bisher)* | dieselbe **dicke grüne Linie links**, dazu die drei übrigen Kanten dünn in **Grün** |
| **Notiz** | nichts *(wie bisher)* | **alle vier** Kanten dünn in **Gold** |

**Zwei Sätze, und sie sagen alles:**

1. **Die linke Kante gehört weiterhin allein der Art** — sie ändert weder Farbe
   noch Breite, ob angepinnt oder nicht.
2. **Angepinnt heißt: die drei übrigen Kanten nehmen dieselbe Farbe an** — und
   bei einer Notiz, die keine eigene Farbe hat, wird der ganze Rahmen golden.

**Gold kommt danach an genau einer Stelle vor: an der angepinnten Notiz.** Und
kein Kasten trägt je zwei Farben.

**Und die Falle, die bei einer naheliegenderen Fassung entstünde, entsteht hier
nicht.** Würde die linke Kante beim Anpinnen von 3px auf 1px dünn, müsste
`padding-left` von 10 auf 12 zurück — sonst begännen die Zeilen angepinnter und
nicht angepinnter Kommentare in derselben Liste **auf zwei verschiedenen
Linien** (Befund C aus 0.12.0, nur andersherum). **Weil die dicke Kante bleibt,
verschiebt sich kein Text**: die drei Arten behalten `padding-left: 10px`, die
Notiz behält ihre 12 — bei ihr werden nur vorhandene 1px-Kanten umgefärbt, genau
wie heute schon beim Anpinnen. *Es ändert sich keine einzige Breite, nur die
Farbe.*

### Offene Entscheidungen

* **Verliert das Anpinnen damit seine eigene Farbe?** Ja — und das ist der
  Zweck. **Erkennbar bleibt es an zwei anderen Zeichen**: am 📌 in der Kopfzeile
  und daran, dass Angepinntes oben steht. *Die Farbe war nie das einzige
  Signal, und deshalb kostet der Wechsel nichts.*
* **Wie dünn ist „dünn"?** Die vorhandenen Kanten sind 1px, und dabei sollte es
  bleiben: **jede andere Zahl verschiebt den Text und macht aus einer reinen
  Farbänderung eine Ausrichtungsfrage.**
* **Was ist mit dem Aufgabenknopf?** Er trägt heute die Farbe des Zustands, den
  er setzt (`.mark.aufg.on` blau, `.on.fertig` grün). **Das bleibt richtig** und
  wird durch die neue Regel sogar stimmiger.
* **Und der angepinnte Block als Ganzes?** In Teil II steht: *„der angepinnte
  Block kann zur Wand werden."* Vier verschiedene Rahmenfarben untereinander
  könnten das verstärken. **Beobachten, nicht vorher entscheiden.**

### Was es anfasst

**Nur das Stylesheet** — vier Regeln statt einer, und die Prüflage, die die
Kennzeichnung nachsieht. **Keine Breite ändert sich, kein Innenabstand, kein
Schema, keine Route, kein Quelltext in `app.js`.**

**Was dagegen spricht:** die heutige Bauform ist im Quelltext ausführlich
begründet, und diese Begründung wird damit ungültig — *sie gehört ersetzt und
nicht gelöscht, sonst baut sie jemand in zwei Jahren wieder ein.*

---

## 15. Die Bildablage: das Original und zwei Ableitungen — an einer Stelle

**Aufgefallen im Betrieb, 28. August 2026**, aus der Frage nach der Größe der
Datenbank.

> **Art: Verbesserung** · **Claude: empfohlen** für (c), **später** für (b), **nicht empfohlen** für (a).
> **Draußen üblich:** **Das Original wird nicht angefasst.** Immich, Nextcloud
> Photos und Piwigo rechnen ausnahmslos Ableitungen daneben und lassen die
> hochgeladene Datei unverändert. *Eine verlustbehaftete Umwandlung des
> Originals gilt draußen als Datenverlust, nicht als Optimierung.*

### Woher

Aus dem Betrieb, **28. August 2026**. Die Frage war: *973 Bilder, 660 MB — ist
das groß oder normal? Und landet ein mit Strg+V eingefügtes Bild als BMP in der
Datenbank? Ließe sich die dann durch Umwandlung nach JPEG verkleinern?*

### Was auffiel

**Die Antwort auf die Frage lautet: normal, und es ist kein BMP.** Rund 680 kB
je Bild, und darin stecken **drei** Fassungen. Browser legen Bilder aus der
Zwischenablage als **PNG** ab — die Windows-Zwischenablage hält intern eine
DIB, der Browser reicht sie als PNG weiter.

**Beim Nachsehen kam etwas anderes heraus, und das ist der eigentliche Punkt:
die beiden Bildwege der Anlage speichern verschieden, und nirgends steht,
warum.**

| Weg | Was in der Datenbank landet |
|---|---|
| Foto am **Eintrag** (`photos`) | **das Original unverändert**, dazu 1600px- und 400px-JPEG |
| Bild im **Kommentar** (`comment_images`) | **nur** 1600px- und 400px-JPEG — kein Original |

Am Eintrag wird `f.buffer` mit dem gemeldeten Typ gespeichert (`server.js:2471`);
im Kommentar geht jede Datei durch `kodiereKommentarBild()` und kommt als JPEG
heraus. **Zwei Regeln für dieselbe Sache.**

### Was es nicht ist

**Kein Fehler, und keine der beiden Regeln ist falsch.** Am Eintrag hat das
Original einen Zweck: das Vollbild zeigt es (`app.js:2484` fragt ohne
`?size=`). Im Kommentar gibt es kein Vollbild in diesem Sinn.

**Es ist auch kein Speicherproblem.** 660 MB sind für 973 Bilder unauffällig.
**Was daran hängt, ist etwas anderes: der Export** — und der steht als Punkt 3
mit eigener Rechnung da.

**Was es ist: eine unaufgeschriebene Asymmetrie.** Wer in einem halben Jahr
fragt „warum ist das eine Bild schärfer als das andere", findet die Antwort
heute nur im Quelltext.

### Was gebaut werden könnte

**a) Was NICHT gebaut werden soll: die vorhandenen Originale nach JPEG
umwandeln.** Verlustbehaftet und unumkehrbar — und bei einem **Bildschirmfoto
ist PNG die bessere Wahl**: scharfe Kanten und Text leiden unter JPEG sichtbar.
Eine Umwandlung über den ganzen Bestand träfe genau die Bilder, denen sie
schadet.

**b) Später, wenn Platz wirklich knapp wird: die Ableitungen auf WebP.**
Rund 30 Prozent kleiner bei gleicher Güte, **ohne das Original anzufassen**,
und `sharp` kann es ohne neue Abhängigkeit. *Es berührt die Auslieferung
(`setzeBildHeader`) und ist deshalb keine reine Rechenänderung.*

**c) Der Unterschied gehört aufgeschrieben.** Ein Absatz am Quelltext beider
Wege und eine Zeile im Projektstand. *Das ist der Teil, der heute wirklich
fehlt.*

### Offene Entscheidungen

* **Soll das Kommentarbild künftig auch sein Original behalten?** Es wäre
  einheitlich — und es vergrößerte die Datenbank an der Stelle, an der die
  meisten Bilder anfallen. *Vorschlag: nein, aber die Begründung aufschreiben.*
* **Wenn (b) kommt: AVIF statt WebP?** Kleiner, aber langsamer zu rechnen und
  in älteren Browsern nicht überall da. *Für eine Anlage, die zehn Jahre laufen
  soll, ist WebP die sichere Wahl.*
* **Und die Frage, die Punkt 3 stellt und hier beantwortet werden müsste:**
  zählt die Größenschätzung für den Export das Original **und** beide
  Ableitungen? *Sie muss — im Export steckt alles drei.*

### Was es anfasst

Für (c): zwei Kommentare und eine Zeile im Projektstand. **Sonst nichts.** Für
(b): `makeVariants()`, `kodiereKommentarBild()`, die Auslieferung, die
Prüflagen. **Kein Schema in beiden Fällen.**

**Was dagegen spricht:** gegen (c) nichts. Gegen (b) spricht, dass nichts
klemmt — *es ist eine Ersparnis ohne Not, und sie fasst den Weg an, über den
jedes Bild der Anlage läuft.*

---

---

## 16. Die Glocke: was andere an meinen Sachen getan haben

**Aufgefallen im Betrieb, 28. August 2026.** Der Anlass ist der
Mehrbenutzerbetrieb: seit es fremde Kommentare und fremde Bewertungen gibt,
erfährt man von ihnen nur durch Nachsehen.

> **Art: Neue Funktion** · **Claude: empfohlen** für die schlanke Fassung, **nicht empfohlen** für eine Benachrichtigungstabelle, **später** für den Lesestand je Meldung.
> **Draußen üblich:** Instagram, Facebook und GitHub führen alle eine
> **Benachrichtigungstabelle** mit Lesestand je Zeile — *weil sie müssen: bei
> Millionen Zugängen ist eine Zählung je Seitenaufbau undenkbar.* Kleine
> selbstgehostete Anlagen rechnen sie statt dessen aus einem einzigen
> Zeitstempel aus. **Bei einer Handvoll Zugänge ist die kleine Fassung nicht
> die ärmere, sondern die richtige.**

### Woher

Aus dem Betrieb, **28. August 2026**. Der Wunsch: **eine Glocke in der
Kopfzeile**, dort wo „+ Eintrag" und „Abmelden" stehen — zunächst für den
Desktop. Ein **oranger Punkt** daran, wenn an den **eigenen** Einträgen etwas
Neues geschehen ist: fremde Kommentare, fremde Bewertungen. Ein Klick öffnet
die Liste. *„Also wie bei Instagram oder Facebook."*

### Was auffiel

**Die Anlage kennt heute nur eine Richtung: hinsehen.** Es gibt „Neu seit
meinem letzten Besuch" als Filter über den **ganzen** Bestand — aber nichts,
was sagt: *an DEINEN Sachen hat sich etwas getan.* Wer drei Einträge unter
hundert hat, findet das im Filter nicht wieder.

**Der Platz dafür ist da und passt.** In `.mast-rest` stehen bereits zwei
Zeichenknöpfe derselben Bauart — „Offene Aufgaben" und „Systembereich" — und
das Menü auf dem Telefon nimmt sie ohne Zutun mit auf: *ein Markup, zwei
Gestalten* (0.12.0). **Eine dritte Glocke daneben kostet keine eigene
Telefonfassung.**

### Was es nicht ist

**Kein Fehler, sondern eine neue Fähigkeit** — und zwar eine, die den Charakter
der Anlage ändert. *Das gehört benannt: bis heute steht in Teil II an der Zeile
„Erwähnungen im Kommentar" die Absage `die Anlage hat keine
Benachrichtigungen`.* **Wird die Glocke gebaut, verliert diese Absage ihre
Grundlage** — die beiden Zeilen hängen zusammen und gehören zusammen
entschieden.

**Und es ist der zweite Anlauf auf eine Frage, die schon einmal verneint
wurde.** In Teil II steht seit 0.8.60 „Der Zähler ‚Offen 7' in der Kopfzeile",
abgelehnt mit: *„er würde bei jedem Seitenaufbau gebraucht, und die Frage, wie
er nicht ständig neu abgefragt wird, ist die eigentliche Arbeit."* **Dieselbe
Frage stellt die Glocke — und diesmal gibt es eine Antwort, siehe (b).**

### Was gebaut werden könnte

**a) Ein eigener Zeitstempel — und das ist die Entscheidung, an der alles
hängt.** Es liegt nahe, `zuletztGesehen` wiederzuverwenden. **Es wäre falsch.**
Dieser Wert wird gesetzt, wenn man die **Übersicht verlässt** (`merkeGesehen()`,
`app.js:1623`). Eine Glocke daran gehängt **löschte sich selbst, bevor man sie
anklicken kann**: man betritt die Übersicht, sieht den Punkt, geht in einen
Eintrag — und der Punkt ist fort, ohne dass man gelesen hätte, was er meinte.

**Zwei Bedeutungen, ein Wert — das ist Stolperstein 47.** Die Glocke braucht
ihren eigenen Zeitstempel, und er wird gesetzt, **wenn die Tafel geöffnet
wird**, nicht beim Verlassen einer Ansicht.

**b) Die Zahl reist mit einer Antwort mit, die es ohnehin gibt.** Kein eigener
Endpunkt, der im Hintergrund gefragt wird, und **kein Nachfragen im Takt**. Die
Zählung hängt sich an `GET /api/settings` oder an die Listenantwort — beide
laufen beim Betreten der Übersicht ohnehin. **Damit ist die Frage aus 0.8.60
beantwortet:** die Zahl kostet nichts Zusätzliches, weil sie keine eigene
Anfrage ist.

*Der Preis, ehrlich benannt: die Glocke aktualisiert sich nicht, während man
auf der Seite sitzt.* **Für eine Anlage mit einer Handvoll Zugänge ist das
richtig** — bei Instagram wäre es falsch, dort geschieht im Sekundentakt etwas.

**c) Der orange Punkt, ohne Zahl.** `--accent` ist die Signalfarbe der Anlage,
und ein Punkt ohne Zahl braucht keine genaue Zählung — nur die Antwort „gibt es
etwas oder nicht". *Eine Zahl bringt die Frage nach „99+" mit und die nach
ihrer Genauigkeit; ein Punkt bringt keine.*

**d) Was in der Tafel steht — und die Klemme, die niemand erraten würde.**

| Ereignis | Was die Glocke sagen darf |
|---|---|
| fremder **Kommentar** an meinem Eintrag | **mit Namen** — ein Kommentar trägt seinen Verfasser ohnehin offen |
| fremde **Bewertung** an meinem Eintrag | **nur die Zahl, niemals wer** |
| fremder **Testtag**, **Link**, **Datei** an meinem Eintrag | mit Namen — sie tragen ihren Verfasser wie der Kommentar |

**Warum die Bewertung anders liegt, steht wörtlich im Quelltext**
(`server.js:2202`):

> „**WER WELCHEN WERT VERGEBEN HAT, STEHT HIER AUSDRÜCKLICH NICHT:** diese
> Antwort geht an jeden, und eine Angabe darüber, wie eine EINZELNE PERSON
> bewertet hat, ist mehr, als eine Bewertung aussagen soll."

Die Liste „Wer hat bewertet" ist **nur für den Admin**. **Eine Glocke, die
‚Chefin hat deinen Eintrag bewertet' meldet, hebelt genau diese Entscheidung
aus** — und zwar an der Stelle, an der es am wenigsten auffällt. *„Deine
Einträge haben drei neue Bewertungen" ist dagegen einwandfrei.*

**e) Eigenes zählt nie mit.** Mein eigener Kommentar an meinem eigenen Eintrag
läutet nicht. *Das ist der Fehler, den jede erste Fassung dieser Funktion
macht, und er fällt erst auf, wenn er nervt.*

**f) Was NICHT gebaut werden soll: eine Benachrichtigungstabelle.** Eine Zeile
je Ereignis, mit Lesestand — das ist der Weg der großen Anbieter, und er bringt
mit: eine Schreiboperation an jedem Kommentar und jeder Bewertung, einen
Aufräumer, eine Kaskade beim Löschen von Einträgen und Zugängen, und einen
Migrationsblock. **Alles davon für eine Zahl, die sich aus vorhandenen
Zeitstempeln errechnen lässt.**

### Offene Entscheidungen

* **Was ist „meins"?** Nur Einträge, die ich verfasst habe — oder auch solche,
  an denen ich mitgeschrieben habe? *Vorschlag: nur die eigenen Einträge. Wer
  irgendwo einmal kommentiert hat, bekäme sonst Meldungen über einen Eintrag,
  der ihn nicht mehr interessiert, und die Glocke wird zur Wand.*
* **Werden Bearbeitungen mitgezählt oder nur Neues?** Ein fremder Kommentar,
  der geändert wird, trägt `updated_at`. *Vorschlag: nur Neues — sonst läutet
  jeder Tippfehler ein zweites Mal.*
* **Wie lange zurück?** Ohne Grenze zeigt die Tafel beim ersten Öffnen den
  ganzen Bestand. **Beim allerersten Mal gibt es keinen Bezugspunkt** — dieselbe
  Lage wie bei „Neu seit meinem letzten Besuch", und dort greift der Filter
  ausdrücklich gar nicht. *Vorschlag: dieselbe Antwort — ohne gespeicherten Wert
  keine Glocke.*
* **Führt ein Klick in der Tafel zum Eintrag?** *Vorschlag: ja, und das ist der
  halbe Gewinn* — eine Meldung, die man nicht anspringen kann, ist eine
  Mitteilung ohne Weg.
* **Löscht das Öffnen der Tafel alles auf einmal?** Bei einem Zeitstempel geht
  es nicht anders. **Der Lesestand je Meldung ist die Fassung danach**, und er
  braucht dann doch eine Tabelle — *deshalb steht er hier als „später" und nicht
  als Teil der ersten Runde.*
* **Und die Frage, die vor allen anderen steht: gilt das auch auf dem Telefon?**
  Der Wunsch nennt den Desktop. **Die Kopfzeile ist aber eine — was in
  `.mast-rest` steht, wandert auf dem Telefon von selbst ins Menü.** Eine
  Glocke, die es nur am Desktop gibt, wäre eine Weiche nach Gerät, und die hat
  0.12.0 ausdrücklich vermieden. *Vorschlag: sie gilt für beide, und das kostet
  nichts.*

### Was es anfasst

Die Kopfzeile, eine Tafel, ein persönlicher Einstellungsschlüssel
(`glockeGesehen` in `PERSOENLICHE_SCHLUESSEL`), eine Zählabfrage über
`comments`, `ratings`, `test_days`, `links` und `attachments` mit einem JOIN auf
die eigenen Einträge, dazu Prüfungen und Gegenproben. **Kein Schema, keine neue
Tabelle, kein Migrationsblock** — `user_settings` trägt den Zeitstempel wie
`zuletztGesehen` auch.

**Was dagegen spricht — und es ist mehr als bei den anderen Punkten:**

**Erstens ist es eine Fähigkeit, die die Anlage bewusst nicht hatte.** Die
Absage an den Erwähnungen stützt sich darauf. Wer die Glocke baut, sollte diese
Zeile im selben Zug neu beurteilen statt sie stehenzulassen.

**Zweitens ist eine Glocke ein Versprechen.** Wer sie sieht, verlässt sich
darauf — und eine Glocke, die nur beim Betreten der Übersicht nachrechnet,
hält es nur ungefähr. *Das ist tragbar, aber es gehört an die Tafel geschrieben
und nicht verschwiegen.*

**Drittens ist der Nutzen an die Zahl der Zugänge gebunden.** Bei zwei
Menschen, die miteinander reden, meldet sie, was man ohnehin weiß. **Sie lohnt
ab dem Punkt, an dem jemand mitschreibt, mit dem man nicht täglich spricht.**

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
- **Der Zähler „Offen 7" in der Kopfzeile** *(0.8.60)*. **Art: Verbesserung.**
  Er stand schon im Auftrag der Runde und ist dort ausdrücklich nicht gebaut
  worden: **er würde bei jedem Seitenaufbau gebraucht**, und die Frage, wie er
  nicht ständig neu abgefragt wird, ist die eigentliche Arbeit.
  **Punkt 16 beantwortet genau diese Frage** — die Zahl reist mit einer
  Antwort mit, die es ohnehin gibt, statt eine eigene Anfrage zu sein. *Wer die
  Glocke baut, hat den Weg für diesen Zähler gleich mitgebaut; er säße im selben
  Knopf daneben.*
  *(Claude: nicht empfohlen für sich allein — aber empfohlen als Anhängsel an
  Punkt 16, falls der kommt)*
- **Die Vorschau der Rangfolge im Systembereich** *(0.8.40, erneut gewünscht
  28. August 2026)*. **Art: Neue Funktion.** Sehen, wie sich die Spitze
  verschiebt, wenn man an einem Gewicht dreht. *Das ist es, was Gewichte im
  Alltag bedienbar macht* — es ist aber eine eigene Ansicht mit eigenem
  Endpunkt. **Aus dem Betrieb kam derselbe Wunsch von der anderen Seite:** ein
  Feld, in das man Werte eingibt oder Sterne anklickt, mit dem Rechenweg mit
  und ohne Gewichtung daneben. **Das ist dieselbe Ansicht** — sie gehört hier
  gebaut und nicht ein zweites Mal daneben. *Die Erklärung am einzelnen Eintrag
  ist etwas anderes und steht als Punkt 11 in Teil I.*
  *(Claude: empfohlen · Draußen üblich: ein Rechner zum Ausprobieren neben den
  Einstellungen, die er erklärt — nicht in einer Hilfeseite daneben)*
- **Fälligkeitsdatum an Aufgaben** *(0.8.60)*. Die Aufgabenliste quer über alle
  Einträge gibt es seit der Ansicht „Offen"; ein Datum daran gibt es nicht.
  *(Claude: empfohlen)*
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
  0.9.1)*. **Art: Neue Funktion.** `@name` in einem Kommentar, mit
  Benachrichtigung. *Setzt voraus, dass geklärt ist, wer wen sehen darf —
  Zugänge sehen einander heute nicht vollständig.*
  **Die Absage stand bis zum 28. August 2026 auf einem Bein, und das Bein
  wackelt jetzt:** sie lautete *„die Anlage hat keine Benachrichtigungen"* —
  und **Punkt 16 baut genau die.** *Wird die Glocke gebaut, gehört diese Zeile
  im selben Zug neu beurteilt und nicht stehengelassen; das Ziel der Meldung
  wäre dann da, und übrig bliebe allein die Frage, wer wen sehen darf.*
  *(Claude: weiterhin nicht empfohlen — aber die Begründung ist ab Punkt 16
  eine andere · Draußen üblich: Erwähnungen setzen überall eine
  Benachrichtigung voraus, nie umgekehrt)*


### Kleines aus dem Betrieb, 28. August 2026

*Sieben Zeilen aus derselben Durchsicht. Keine davon braucht die sechs
Überschriften — **jede ist eine Anzeige oder eine Anordnung und keine
Entscheidung.***

- **Das Durchschnittszeichen und die Anzahl am Kriterium.** **Art: Design.**
  Rechts an der Kriterienzeile steht heute `4,2 · 3` (`app.js:3690`). Die
  Kopfzahl darüber schreibt bereits `⌀ 4,2 gewichtet` — **die Zeile darunter
  sollte dieselbe Form sprechen:** `⌀ 4,2 (3)`. Das ⌀ ist die Hausform, die
  Klammer sagt „so viele Stimmen". Dazu ein `title` im Klartext, denn ein
  Symbol allein liest kein Vorleseprogramm vor.
  *(Claude: empfohlen · Draußen üblich: Klammern für die Stimmenzahl ist
  praktisch universal — Amazon, IMDb, Steam)*
- **„Offen" fehlt in der Kopfzeile der Kommentare.** **Art: Verbesserung.**
  Dort steht heute *„12 Kommentare, davon 3 Berichte und 5 Aufgaben
  (2 Erledigt)"*. **Was fehlt, ist die Zahl, auf die es im Alltag ankommt:**
  `5 Aufgaben (3 offen, 2 erledigt)`. Die Verschachtelung bleibt dabei wahr —
  das Erledigte steckt weiterhin **in** den Aufgaben. *Die Klammer erscheint
  nur, wenn überhaupt etwas erledigt ist, sonst stünde da „5 Aufgaben
  (5 offen)".*
  *(Claude: empfohlen · Draußen üblich: offen und erledigt nebeneinander, wie
  GitHubs „3 Open / 2 Closed")*
- **Kommentar schreiben, ohne ans Ende zu rollen.** **Art: Verbesserung.** Das
  Formular sitzt unter der Liste; bei vierzig Kommentaren ist das weit, und auf
  dem Telefon ist die Liste einspaltig und damit noch länger. **Ein
  Sprungknopf im Blockkopf** (`+ Kommentar`) kostet zwei Zeilen — er sitzt in
  genau der Kopfzeile, die auch die Zeile darüber anfasst. **Ausdrücklich kein
  zweites Formular im Dialog:** das vorhandene trägt Bilder-Einfügen,
  Anpinnen, Art-Umschalter und Mitwachsen, und ein zweites davon wären zwei
  Wahrheiten über dasselbe Formular.
  *(Claude: empfohlen für den Sprungknopf, nicht empfohlen für den Dialog ·
  Draußen üblich: GitHub und GitLab lassen das Formular unten und springen hin;
  Discourse nimmt einen mitfahrenden Schreibbalken — alle drei mit **einem**
  Formular)*
- **Die Kennzahlen nennen die Version nicht.** **Art: Verbesserung.**
  `/api/stats` **liefert `version` bereits** — die Karte zeigt es nur nicht.
  Dazu, was der Betrieb „Nerd-Angaben" nennt und was im Quelltext längst
  feststeht: **SQLCipher** über `better-sqlite3-multiple-ciphers`, Schlüssel
  **256 Bit roh** (`PRAGMA key = x'…'`, also ohne Schlüsselableitung), Journal
  **WAL**, Passwörter **scrypt**. **Ein Vorbehalt gehört dazu:** Verfahrensnamen
  sind unbedenklich, **Paketversionen weniger** — sie sagen, welche Lücke passt.
  *Verfahren nennen, Version der Bibliothek nicht.*
  *(Claude: empfohlen · Draußen üblich: eine „Über"-Karte mit Version und
  Kryptoverfahren ist Standard — Nextcloud, Vaultwarden; Paketversionen halten
  die meisten zurück)*
- **Import und Export in einer Kachel.** **Art: Design.** Sie stehen ohnehin
  nebeneinander (Karte 6 und 7). **Der eine Vorbehalt: Export ist lesend,
  Import ersetzt Bestand.** Zusammengelegt darf der Import nicht einen Klick
  näher rücken — die zweite Bestätigung bleibt, und der Importknopf gehört
  optisch untergeordnet. *Geht mit Punkt 10.*
  *(Claude: empfohlen · Draußen üblich: „Import/Export" als ein Abschnitt ist
  verbreitet, und die zerstörende Hälfte wird durchweg als sekundär gezeichnet)*
- **Die Versionszeile: das Zeichen davor, der Abstand darunter.** **Art:
  Design.** Zwei Hälften, beide klein. **Das Zeichen gibt es schon** —
  `marke-dunkel.svg` ist die Fassung ohne dunkle Kachel, und `app.js:90` hat
  dafür bereits einen Helfer; in `zeigeVersion()` ist es ein Aufruf. **Der
  Abstand ist ein Befund vom Telefon und nicht vom Desktop:** die Zeile steht
  auf `margin-bottom: calc(26px + env(safe-area-inset-bottom))`, und auf der
  Anmeldeseite drückt der Flex-Aufbau von `body.anmeldung` sie ohnehin ans
  untere Ende — die 26 Pixel und der Streifen für den Home-Indikator kommen
  obendrauf. *Beobachtet vor 0.12.0, seither größer geworden; am Desktop passt
  er.*
  *(Claude: empfohlen · Draußen üblich: Zeichen und Version in der Fußzeile ist
  Standard; das Bild bekommt `alt=""` und eine Größe in `em`, damit es mit der
  Schrift mitwächst)*
- **„mehr" frisst in der Übersicht eine ganze Zeile.** **Art: Design.** In der
  Filterzeile „Tags" steht der Verweis **„mehr"** unter der Tagwolke und kostet
  so viel Platz wie eine ganze Reihe Tags. **Auf der Eintragsseite passt es —
  und der Grund ist, dass dieselbe Sache dort anders gebaut ist:** dort sitzt
  „mehr" in der Beschriftungszeile über der Wolke (`.wolke-kopf`,
  `space-between`), hier als Geschwister hinter der Wolke in einer Zeile, die
  umbricht. **Die Übersicht könnte tun, was die Eintragsseite tut:** „mehr" mit
  `margin-left: auto` ans rechte Ende der Zeile mit **TAGS** und **Und / Oder**,
  die ohnehin da und rechts leer ist. **Ausdrücklich NICHT: „mehr" in die Wolke
  legen und rechts Platz freihalten** — die Wolke wird beschnitten
  (`max-height` und `overflow: hidden`), der Verweis würde mit abgeschnitten,
  und ein fest ausgerechneter Freiraum ist genau der Fehler, an dem 0.12.1 schon
  einmal hing (`right: 92px`, Befund A). *Später denkbar: `+7` statt „mehr" —
  das setzt voraus, dass die überzähligen Tags weggeblendet statt beschnitten
  werden.* **Und der Nebenbefund gehört dazu: dieselbe Wolke wird an zwei
  Stellen verschieden gebaut** — Stolperstein 47, im Kleinen.
  *(Claude: empfohlen · Draußen üblich: Chips mit einem `+N` am Ende der Reihe —
  GitHub Topics, Jira-Labels, die Empfängerzeile in Gmail; alle blenden weg
  statt zu beschneiden, und alle nennen die Zahl)*
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

### Aus der Durchsicht für Telefon und Tablett

*Kleinteiliges, das bei der Durchsicht gemessen und **bewusst stehen gelassen**
wurde. Keines davon ist neu entstanden; jedes gab es vorher genauso.*

- **Die Zeile einer Anmeldung läuft bei rund 1024 Pixeln aus ihrer Karte.**
  Auf dem Telefon bricht sie seit der Durchsicht um; am Desktop tut sie es
  nicht, und in einem Fenster von 1024 Pixeln ist die Karte des Systembereichs
  gerade schmal genug, dass die Zeile in ihrer eigenen Liste seitlich scrollt.
  **Die Seite läuft nicht über** — es scrollt der Kasten, und das war vor der
  Durchsicht genauso. Der saubere Weg wäre eine Behälterabfrage
  (`@container`) statt einer Fensterabfrage: die Karte weiß dann selbst, wie
  breit sie ist. *(Claude: empfohlen, aber als eigener Schritt — eine
  Behälterabfrage ist ein neues Werkzeug im Stylesheet und gehört nicht
  nebenbei hinein)*
- **Eine Meldung kann auf dem Telefon die Vergleichsleiste verdecken.** Beide
  sitzen unten, die Meldung liegt darüber. Sie steht 2,6 Sekunden und die
  Leiste nur, solange etwas ausgewählt ist — der Fall ist selten und wieder
  vorbei, bevor man ihn benennen kann. Der Fix wäre eine Abfrage `body:has(…)`.
  *(Claude: später — der Aufwand steht nicht im Verhältnis)*
- **Der Hinweis an der Zeitleiste kann auf schmalem Schirm hinauslaufen.** Er
  steht mittig über seinem Punkt und bricht nicht um; am rechten Ende der Achse
  ragt er hinaus. **Er erscheint nur beim Überfahren** — auf dem Finger gibt es
  ihn gar nicht, dort öffnet die Berührung gleich den Eintrag. Es trifft also
  nur ein schmales Fenster mit Maus. *(Claude: empfohlen — eine Deckelung der
  Breite genügt)*
- **Die Erklärung unter dem Ablegefeld spricht auf dem Telefon von Dingen, die
  es dort nicht gibt** — „Klick aufs Foto", „mit Strg+V einfügen", „Blättern
  mit ← →". Fünf Zeilen, von denen die Hälfte ins Leere geht, und sie stehen
  zwischen dem Bild und der Beschreibung. **Das ist eine Frage an den Text und
  nicht an das Stylesheet:** eine Fassung, die für beide gilt, wäre besser als
  zwei Fassungen mit einer Weiche dazwischen. *(Claude: empfohlen)*
- **Die Unteransichten haben keine Kopfzeile.** Eintrag, System, Offen und
  Vergleich tragen nur „← Zurück zur Übersicht"; Suche, Menü und „+ Eintrag"
  gibt es dort nicht. Am Desktop fällt das kaum auf — auf einem Telefon
  ist der Weg von einem Eintrag zur Suche zwei Griffe statt einem. **Eine
  gemeinsame Kopfzeile für alle vier wäre der Umbau**, und er berührt vier
  Aufbauten und deren Prüflagen. *(Claude: empfohlen, aber als eigene Runde)*

### An den Nummern

- **Zwei Dateisätze tragen die Nummer 0.9.1** *(0.9.1)*. Das veröffentlichte
  0.9.1 in `main` hat den Fingerprint `cb73399d`; die laufende Anlage trug
  `3cf1b093`. Dazwischen liegt die Nacharbeit an Marke und Anmeldekarte.
  **Eine Nummer `0.9.2` kommt dafür nicht mehr in Frage:** seither sind 0.10.0
  und 0.11.0 herausgegangen, und die Anlage hat nur **eine** Reihe — eine Zahl,
  die älter ist als das Laufende, spielt niemand ein. Offen bleibt allein die
  Zuordnung: `3cf1b093` gehört zu keiner veröffentlichten Nummer.
  *(Claude: nicht empfohlen — ein Satz im Changelog ordnet den Fingerprint dem
  nachgearbeiteten 0.9.1 zu, das genügt)*

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
- **Blättern in der Übersicht mit Seitenzahlen.** Es würde die Suche
  zerschneiden — man sucht im ganzen Bestand und nicht auf Seite 3. **Seit dem
  28. August 2026 kommt ein zweiter Grund dazu, und er ist der härtere:** alle
  Filter und alle elf Sortierungen laufen örtlich, und die Zahlen an der
  Filterzeile wie die gedämpften Tags brauchen den **ganzen** Bestand. Blättern
  am Server nähme ihnen die Grundlage. *Die Antwort ist Fensterung und nicht
  Blättern — Teil I, Punkt 13.*
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

**Aus der Durchsicht vom 28. August 2026** — sieben davon sind aus den neuen
Punkten herausgefallen und stehen hier, damit sie nicht als Idee wiederkommen:

- **Der getippte Benutzername im Sicherheitsprotokoll.** Er steht gegen die
  Zusage im Kartentext (*„die Anlage speichert beides nicht"*) und gegen den
  Grund am Schema: **ein ins falsche Feld getipptes Passwort landete damit in
  der Tabelle.** *Und CrowdSec braucht ihn nicht — es sperrt nach Adresse.*
  Siehe Teil I, Punkt 9 (b).
- **Die Adresse des Aufrufers im Sicherheitsprotokoll.** Dasselbe, und dazu:
  die Tabelle trägt Nummern aus geschlossenen Listen, nicht Zeichenketten von
  außen. Die Adresse gehört ins Containerprotokoll, wo sie gelesen wird.
- **Eine Protokollzeile für den ausgebremsten Fall — in der Tabelle.** Sie ist
  die einzige Zeile, die ein Fremder auslösen kann, und die Bremse ist ihr
  Deckel. *Im Containerprotokoll ist sie dagegen richtig und nützlich; das ist
  der Unterschied zwischen den beiden Ablagen.*
- **Der ursprüngliche Name am gelöschten Zugang.** Zwei harte Gründe: der Name
  wird zur Neuvergabe frei und kollidierte irgendwann mit einem lebenden
  Zugang, und **der Grabstein IST die Anonymisierung** — Artikel 17 DSGVO. Wer
  den Namen aufbewahrt, hat nicht gelöscht. Siehe Teil I, Punkt 12 (c).
- **Die vorhandenen Bildoriginale nach JPEG umwandeln.** Verlustbehaftet und
  unumkehrbar — und bei einem Bildschirmfoto ist PNG die bessere Wahl. Eine
  Umwandlung über den ganzen Bestand träfe genau die Bilder, denen sie schadet.
  *Draußen fasst niemand das Original an.* Siehe Teil I, Punkt 15 (a).
- **Ein zweites Kommentarformular in einem Dialogfenster.** Das vorhandene
  trägt Bilder-Einfügen, Anpinnen, Art-Umschalter und Mitwachsen; ein zweites
  davon wären zwei Wahrheiten über dasselbe Formular. **Ein Sprungknopf tut
  dasselbe für zwei Zeilen.**
- **„mehr" in die Tagwolke legen und rechts Platz freihalten.** Die Wolke wird
  beschnitten, der Verweis würde mitabgeschnitten — und der Ausweg wäre ein
  fest ausgerechneter Freiraum. **Genau daran hing 0.12.1 schon einmal**
  (`right: 92px`, Befund A): die Anlage stellt die Schrift von 80 bis 120
  Prozent, und eine ausgerechnete Breite kann dabei nur falsch werden.
- **Eine Benachrichtigungstabelle mit Lesestand je Meldung.** Der Weg der
  großen Anbieter — und für eine Handvoll Zugänge der falsche: eine
  Schreiboperation an jedem Kommentar und jeder Bewertung, ein Aufräumer, zwei
  Kaskaden und ein Migrationsblock, **für eine Zahl, die sich aus vorhandenen
  Zeitstempeln errechnen lässt.** Siehe Teil I, Punkt 16 (f).
- **Eine Glocke, die nennt, WER bewertet hat.** Sie hebelte die Entscheidung
  aus, dass eine einzelne Bewertung anonym bleibt (`server.js:2202`, die Liste
  „Wer hat bewertet" ist nur für den Admin) — und zwar an der Stelle, an der es
  am wenigsten auffällt. **Die Zahl ja, der Name nie.**
- **Eine Glocke nur für den Desktop.** Was in `.mast-rest` steht, wandert auf
  dem Telefon von selbst ins Menü — *ein Markup, zwei Gestalten* (0.12.0). Eine
  Fassung nur für ein Gerät wäre eine Weiche nach Gerät, und genau die hat
  0.12.0 ausdrücklich vermieden.
