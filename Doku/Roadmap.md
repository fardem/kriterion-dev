# Roadmap — gesammelte Punkte, noch ohne Nummer

**Hier stehen Ideen und Beobachtungen aus dem Betrieb, Punkt für Punkt, in der
Reihenfolge, in der sie aufgefallen sind. Ausdrücklich OHNE Versionsnummer und
ohne Rangfolge.**

Die Zuordnung zu Versionen geschieht später und in einem Zug, wenn genug Punkte
zusammengekommen sind — nicht Punkt für Punkt beim Aufschreiben. *Wer beim
Aufschreiben schon eine Nummer daneben setzt, entscheidet über eine Runde, ohne
die anderen Punkte gesehen zu haben.*

## Was dieses Blatt NICHT ist

Es steht neben drei Papieren, die etwas anderes tun, und die Grenze gehört
gezogen — sonst gibt es vier Orte für dieselbe Frage:

| Papier | Was darin steht |
|---|---|
| **dieses Blatt** | **neue** Punkte aus dem Betrieb, ohne Nummer, ohne Reihenfolge |
| `Ideen_und_Vorschlaege.md` | die Durchsicht von damals — eine **Quelle**, kein Stand. Geschlossen; Einträge bekommen beim Bauen die Marke `[GEBAUT — x.y.z]` |
| Projektstand, Abschnitt 10 (*Fahrplan*) | der **Versionsplan**: was welche Nummer bekommt. Ein Punkt zieht dorthin um, sobald er eine hat |
| `Aenderungsprotokoll_<Version>.md` | was wirklich gebaut wurde, je Runde |

**Ein Punkt wandert also von hier in den Fahrplan und von dort in ein
Änderungsprotokoll.** Ist er gebaut, bleibt er hier stehen und trägt die Marke
`[GEBAUT — x.y.z]` — dieselbe Schreibweise wie im Ideenpapier, damit man in
beiden Papieren nach demselben Wort suchen kann.

## Die Form eines Punktes

Jeder Punkt trägt dieselben sechs Überschriften. Nicht als Zierde: **die
letzten drei sind die, die man beim Aufschreiben noch weiß und beim Bauen
vergessen hat.**

1. **Woher** — aus dem Betrieb, aus einer Durchsicht, aus einer Gegenprobe; mit Datum.
2. **Was auffiel** — die Beobachtung, sachlich.
3. **Was es nicht ist** — ob es ein Fehler ist oder nicht, und warum. *Ein Wunsch, der als Fehler abgeheftet wird, drängelt sich in die falsche Runde.*
4. **Was gebaut werden könnte** — die Teile, einzeln, mit Einschätzung.
5. **Offene Entscheidungen** — die Fragen, die der Auftrag beantworten muss.
6. **Was es anfasst** — der Umfang, und was ausdrücklich dagegen spricht.

---

## 1. Die Suche schärfen — Trefferkontext, Suchbereich, Hervorhebung

### Woher

Aus dem Betrieb, **27. August 2026**, unmittelbar nach dem Einspielen von
0.11.0.

### Was auffiel

Eine Suche nach **„ella"** findet auch **„eurobella"** — unter anderem in einer
**Linkadresse**. Der Treffer ist richtig, aber **nicht nachvollziehbar**: die
Kachel sagt nicht, *wo* das Wort steht. Man sieht einen Eintrag in der
Trefferliste und weiß nicht, warum er dort ist.

### Was es nicht ist

**Keine Verschlechterung durch 0.11.0.** Bis 0.10.0 lief `searchText.includes(q)` über
genau dieselben sieben Quellen, zusammengeklebt zu einem Feld — „ella" fand
„eurobella" also auch damals, Linkadressen eingeschlossen. **0.11.0 hat dieses
Verhalten absichtlich Zeichen für Zeichen erhalten**; sichtbar geworden ist es,
weil die Suche jetzt benutzt wird.

**Also ein Wunsch und kein Fehler** — und damit kein Fall für die
Nacharbeitsrunde.

*Ein Punkt für die Umsetzung: der neue Aufbau **weiß** die Antwort schon.*
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
  Erweiterung und keine Wegnahme; die Nummer bliebe MINOR.

### Was es anfasst

Die Suchroute (ein Parameter für den Bereich, ein Feld für den Kontext), die
Kachel, die Detailansicht, die gespeicherten Ansichten, Prüfungen,
Gegenproben, README. **Kein Schema.**

**Die Falle, die ausdrücklich dazugehört:** Hervorheben heißt, **fremden Text
mit Markup zu durchsetzen** — und Kommentartexte kommen von Menschen. Naiv über
`innerHTML` gebaut ist das ein Einfallstor. Das braucht eine eigene Prüfung und
eine Gegenprobe, nicht nur eine sorgfältige Zeile.

**Was dagegen spricht:** nichts ist kaputt. Und Teil (b) ist eine **zweite
Bedienfläche** neben der Suche, die heute ein Feld ist — wer sie überfrachtet,
macht den einfachen Fall teurer, um den seltenen billiger zu machen.
