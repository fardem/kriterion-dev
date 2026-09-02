# Fehler und Ideen

**Das Sammelblatt · Stand 28. August 2026, nach der Zuordnung**

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
*und seit dem 28. August 2026 ist diese Regel einmal in vollem Umfang
angewandt worden: **dreizehn ausgearbeitete Punkte und zehn Zeilen aus Teil II
sind an diesem Tag fortgezogen**, mitsamt ihrer Ausarbeitung, in Abschnitt 10a
des Projektstands. Die Tabelle am Anfang von Teil I sagt, wohin.*
*Mitgezogen ist dabei auch, was an einem Punkt **ausdrücklich nicht** gebaut
werden soll — für einen Auftrag ist die Grenze der Runde so bindend wie ihr
Inhalt.*
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
besser; eine neue Funktion kann die Instanz danach etwas, was sie vorher nicht
konnte; Design ist eine Frage der Darstellung und der Bedienung, nicht des
Verhaltens. *Die Grenze zwischen den letzten beiden ist manchmal dünn — dann
entscheidet die Frage: „Könnte die Instanz danach etwas Neues?"*

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

## Was am 28. August 2026 eine Nummer bekommen hat

**Dreizehn ausgearbeitete Punkte und zehn Zeilen aus Teil II sind an diesem Tag
Runden zugeordnet worden.** Nach Regel 3 stehen sie damit **nicht mehr hier**,
sondern im Fahrplan — Projektstand, **Abschnitt 10a**, dort mit ihrer
vollständigen Ausarbeitung. *Diese Tabelle sagt nur, wohin sie gegangen sind;
sie ist ein Wegweiser und kein zweiter Eintrag.*

| Runde | Was daraus geworden ist |
|---|---|
| **0.12.3** *PATCH* — **GEBAUT am 28. August 2026** | Export durch den Arbeitsspeicher · nur zeichnen, was zu sehen ist · ein Kasten, eine Farbe · Speicherverbrauch · ⌀ und Anzahl · „offen" in der Kopfzeile · Kommentar ohne Rollen · Versionszeile · „mehr" frisst eine Zeile. **Was gebaut wurde, steht im Änderungsprotokoll 0.12.3; was daraus herausgenommen wurde, in Abschnitt 10a.** |
| **0.13.0** *MINOR* — **GEBAUT am 28. August 2026** | Der Proxy ist ein Ja/Nein · gescheiterte Anmeldungen sichtbar machen · gelöschte Zugänge und der Weg zurück · der Teilexport mit zweitem Faktor · die Filterleiste (229 → 154 px, gemessen) · die Kategoriezeile lernt die Mehrzahl. **Was gebaut wurde, steht im Änderungsprotokoll 0.13.0; was daraus herausgenommen wurde, in Abschnitt 10a.** *Herausgenommen sind die Adressliste (eigene Runde) und die stdout-Zeile für CrowdSec (verworfen, solange die Adressliste fehlt).* |
| **0.14.0** *MINOR, Schema* — **GEBAUT am 29. August 2026** | Aus „abgelehnt" wird eine Entscheidung: Datum, Grund und Verfasser, dazu die Klemme am Grund. **Was gebaut wurde, steht im Änderungsprotokoll 0.14.0.** *Mitgefahren sind zwei Punkte aus dem Betrieb, die nie hier standen: der kaputte fremde Cookiewert und die Ausrichtung der Sternreihen in der Kriterienliste.* |
| **0.15.0** *MINOR* — **GEBAUT am 29. August 2026** | **Nichts aus diesem Blatt.** Zwei Befunde aus dem Betrieb, beide an der Ablehnung: der fehlende Filter für „abgelehnt" und die Begründung, die nicht zur Ruhe kam. **Was gebaut wurde, steht im Änderungsprotokoll 0.15.0.** *Die Runde stand nie im Fahrplan; sie hat ihre Nummer bekommen, weil zwei ihrer drei Punkte Funktionen bringen — **und alle folgenden Runden sind dadurch um eine Stelle gerückt.*** |
| **0.15.1** *PATCH* — **GEBAUT am 29. August 2026** | **Nichts aus diesem Blatt.** Ein Befund aus dem Betrieb: `hidden` wirkte im Stilblatt nicht, weil jede eigene `display`-Regel die Vorgabe des Browsers schlägt — Aussage und Eingabefeld standen an einem *nicht* abgelehnten Eintrag da. **Was gebaut wurde, steht im Änderungsprotokoll 0.15.1.** *Dazu die Regel, wann das Feld überhaupt dasteht: abgelehnt und kein Grund.* |
| **0.16.0** *MINOR, Schema* *(war 0.15.0)* — **GEBAUT am 29. August 2026** | Der Systembereich bekommt Abschnitte · zwei Funktionen sind zu groß · die Gewichtung erklärt sich nicht · die Glocke · Kennzahlen: Version und Verfahren · Import und Export in einer Kachel · der Zähler „Offen 7" · **Löschen in der Zoomansicht** *(aus dem Betrieb, 28.08.2026 — nicht aus dem Sammelblatt)*. **Was gebaut wurde, steht im Änderungsprotokoll 0.16.0.** *Zwei Abweichungen: **die „Vorschau der Rangfolge" ist NICHT mitgefahren** — sie ist der einzige Teil mit eigener Ansicht und eigenem Endpunkt und war im Auftrag als erster Kandidat des Schnitts benannt; sie steht weiter in Abschnitt 10 des Projektstands. Und **die Runde ist doch eine Datenbankstufe geworden**: `ratings` trug keinen Zeitpunkt, und ohne ihn kann die Glocke über fremde Bewertungen nichts sagen — siebter Migrationsblock, auf ausdrückliche Anweisung.* **Mitgefahren ist der Werkzeugbefund am Rückbaufilter aus Teil II.** |
| **0.17.0** *MINOR* — **GEBAUT am 30. August 2026** | **Was dasteht, und was nicht dasteht** — neun Befunde aus **einem** Rundlauf von Hand am 30. August 2026, keiner davon aus diesem Blatt und keiner aus dem Fahrplan. Die Kriterienliste zerfällt bei genau **einem** Zugang; zwei Erklärtexte verlassen die Oberfläche; die Glockentafel sagt, **was** neu ist; drei Anzeigefehler vom echten Gerät; die Vergleichszahl ohne Gewichtung — **und die Glocke ersetzt die Pille „Neu seit …", die dafür gestrichen wird.** *Die Nummer ist MINOR, weil die Glockentafel eine Funktion bringt; der Auftrag ging als 0.16.1 in die Besprechung.* **Was gebaut wurde, steht im Änderungsprotokoll 0.17.0.** *Alle neun Punkte sind gebaut; nichts ist hierher zurückgekommen. **Eine Abweichung:** die Tafel nennt die Namen nur zu den **Kommentaren** — „Eine Glocke, die nennt, WER bewertet hat" steht in Teil III dieses Blatts als geprüft und verworfen, und die gebaute Fassung hält sich daran. **Und ein zehnter Befund ist beim Bauen dazugekommen und gleich mitgefahren:** der Erklärkasten verwies auf eine Spalte, die es bei einem einzigen Zugang nicht gibt — derselbe blinde Fleck wie Punkt 1, eine Ansicht weiter.* |
| **0.17.1** *PATCH* — **GEBAUT am 30. August 2026** | **Nichts aus diesem Blatt.** Sechs Befunde aus einem Rundlauf von Hand, unmittelbar nachdem 0.17.0 gebaut war: der Text im Kachel „Zugang", die Kachelhöhe, die Aufteilung des Mailversands, **„Anlage" wird „Instanz"**, die Zeile einer Sitzung — und das Video, das im Vollbild ein zweites Mal anfängt. **Was gebaut wurde, steht im Änderungsprotokoll 0.17.1.** *Alle sechs Punkte sind gebaut; nichts ist hierher zurückgekommen. **Ein Befund aus dem Bauen:** der Auftrag nannte zwei falsche Freunde, die Anhänge meinen — es sind fünf, und einer der beiden genannten war keiner (Stolperstein 236).* |
| **0.17.2** *PATCH* — **GEBAUT am 31. August 2026** | **Nichts aus diesem Blatt.** Sechs Befunde aus dem Rundlauf mit 0.17.1, zwei davon Nacharbeit an ihr selbst: der Name in der Anmeldezeile wurde abgeschnitten, **die Listen brauchten einen Deckel bei zwölf Zeilen** (die Tagliste zog die Seite auf), der Mailversand ordnet sich zu Ende, die Klammer bei einer einzigen Stimme fällt weg, **die Glocke meldet die eigenen Beiträge wieder nicht** — und die README erzählt keine Versionsgeschichte mehr. *Die zweite Wende an derselben Entscheidung: 0.16.0 schloss sie aus, 0.17.0 nahm das zurück, 0.17.2 stellt 0.16.0 wieder her.* **Was gebaut wurde, steht im Änderungsprotokoll 0.17.2.** *Alle sechs Punkte sind gebaut; nichts ist hierher zurückgekommen. Der sechste — die README — ist während der Runde dazugekommen und vor dem Bauen in den Auftrag nachgetragen worden.* |
| **0.17.3** *PATCH* — **GEBAUT am 31. August 2026** | **Nichts aus diesem Blatt.** Vier Befunde aus dem Rundlauf mit 0.17.2, zwei davon Nacharbeit an ihr selbst: **der Deckel ging nach oben mit und nach unten nicht** — *dafür kam `align-items: start` an das Raster; **Punkt 1 ist mit 0.17.4 zurückgenommen**, der Deckel von zehn Zeilen ist geblieben* —, die Karte „Mailversand" wird eine **Zustandskarte mit eigenem Dialog**, der Erklärkasten zur Gewichtung rollt nicht mehr, und die Filterleiste bekommt ihren **Rücksetzer**. **Was gebaut wurde, steht im Änderungsprotokoll 0.17.3.** *Alle vier Punkte sind gebaut; nichts ist hierher zurückgekommen. **Eine Abweichung:** der Auftrag sagt „aus drei Absätzen werden zwei" und beschreibt darunter drei, die alle drei bleiben — gebaut ist die Überschrift, zusammengelegt sind „Teiler" und „Gerundet". **Und acht Rückbauten sind weggefallen statt mitgezogen:** sie bauten die vier Reihen des Mailversands zurück, und genau die sind der Befund dieser Runde gewesen.* |
| **0.17.4** *PATCH* — **GEBAUT am 31. August 2026** | **Nichts aus diesem Blatt.** Ein Befund aus dem Rundlauf mit 0.17.3, gemeldet mit Bildern unmittelbar nach dem Einspielen: *„das Einzige, was mir gefällt, ist das mit der Mailkachel — der Rest ist schlechter geworden."* **Diese Runde nimmt Punkt 1 von 0.17.3 zurück:** `align-items: start` hat den gemeldeten Leerraum nie verursacht (die betroffenen Kacheln stehen allein in ihrer Reihe) und stattdessen die gleiche Höhe aufgehoben — „Bestand" stand als Treppe von 206 bis 909 Pixeln da. **An seiner Stelle steht die Regel, die gemeint war**, dazu drei Maße: fünfzehn Zeilen fürs Sicherheitsprotokoll, eine Zeile für eine leere Liste, kein Deckel in einem Fenster. **Was gebaut wurde, steht im Änderungsprotokoll 0.17.4.** *Es gab keinen Auftrag: die Regel ist im Gespräch erarbeitet und an einem Schaubild gegengelesen worden, bevor eine Zeile fiel.* ***Eine Abweichung:*** *eine starre Kachel, die niedriger ist als die Forderung der dynamischen daneben, gewinnt nicht — mit reinem CSS-Raster nicht baubar; der Fall tritt im Bestand nicht auf.* ***Und ein Befund aus dem Schreiben:*** *die Tabelle „nachgemessen in Chromium" im Änderungsprotokoll 0.17.3 war nicht gemessen (Stolperstein 252) — sie ist dort als solche gekennzeichnet.* |
| **0.17.5** *PATCH* — **GEBAUT am 31. August 2026** | **Nichts aus diesem Blatt.** Zwei Befunde aus dem Rundlauf mit 0.17.4, gemeldet mit Bildern und **mit dem Fingerprint daneben** (`d3113d62`). **Der erste ist der Befund aus 0.17.2, endlich gefunden:** `max-height: max-content` klemmt die Forderung einer kurzen Liste nicht überall — in Chromium schon, in der laufenden Instanz nicht, und dort forderte JEDE Liste ihre zehn Zeilen, auch die leere. *Gemessen: „Zugänge" 728 gegen 498 px, der Papierkorb leer rund 570 gegen 225.* **Der zweite:** der Name im Sicherheitsprotokoll stand in jeder Zeile woanders, weil jede Zeile ihr eigenes Raster war. **Was gebaut wurde, steht im Änderungsprotokoll 0.17.5.** *Beide Punkte sind gebaut; nichts ist hierher zurückgekommen.* ***Zwei Zusagen sind zurückgenommen:*** *dass eine Liste die Höhe einer höheren Nachbarin ausnutzt, und dass der Deckel „eine Forderung und keine Grenze" sei — beide hingen an demselben Schlüsselwort.* ***Die Lehre steht als Stolperstein 257:*** *ein Befund, den man nicht nachstellen kann, ist nicht erledigt, sondern unerklärt — und der Unterschied zwischen Meldung und Messung ist der Fund.* |
| **0.18.0** *MINOR* *(war 0.17.0)* — **GEBAUT am 1. September 2026** | **Die Suche schärfen — Trefferkontext und Hervorhebung.** *Der älteste Punkt dieses Blatts, aufgefallen am 27. August 2026 und dreimal übersprungen.* Eine Zeile an der Kachel nennt die Quelle und zeigt den Ausschnitt mit der Fundstelle darin, in einer festen Folge, die bei dem beginnt, was die Kachel nicht zeigt; der Begriff ist hervorgehoben und steht in der Adresse des geöffneten Treffers. **Was gebaut wurde, steht im Änderungsprotokoll 0.18.0.** *Teil (a) und (c) sind gebaut, dazu die offene Frage nach der Adresse — mit „ja" beantwortet.* ***Was liegen bleibt, steht als eigener Punkt unten: der Suchbereich als Häkchen (b).*** ***Eine Abweichung:*** *Titel und Beschreibung der Detailansicht tragen keine Marke — beide sind Eingabefelder, und in ein `<input>` lässt sich kein Element hängen (Stolperstein 263).* ***Und zwei Behauptungen der Ausarbeitung haben nicht getragen:*** *die Antwort ist nicht umsonst zu haben — SQLite bricht die ODER-Kette beim ersten Treffer ab (Stolperstein 260) —, und die schmalste Kachel ist nicht 240, sondern 173 px breit (Stolperstein 261).* |
| **0.19.0** *MINOR, Schema* *(war 0.18.0)* — **GEBAUT am 1. September 2026** | **Die Bildablage.** *Punkt 15 dieses Blatts, aufgefallen am 28. August 2026 aus der Frage nach der Größe der Datenbank; am 30. August um den engeren Ausschnitt und das Bildformat erweitert.* **Gemessen an der echten Instanz: 679 der 1032 Bilder lagen als PNG im Original, 435,7 von 568,9 MB — als WebP `nearLossless` 60 werden daraus 161,9 MB, bei einer größten Abweichung von 2 von 255 und null von hundert Bildern mit sichtbarer Kante.** Gebaut sind: die Umwandlung beim Hereinkommen samt Schalter (Vorgabe an, nur der Eigentümer), der **Knopf**, der den vorhandenen Bestand nachzieht, der **engere Ausschnitt** (`photos.zoom`, achter Migrationsblock, Austauschformat 12), die aufgeschriebene **Asymmetrie der beiden Bildwege** und die zusammengelegte Kennzahlenabfrage. **Was gebaut wurde, steht im Änderungsprotokoll 0.19.0.** ***Diese Runde hebt eine Einschätzung dieses Blatts auf:*** *„Claude: nicht empfohlen für (a)" und „das Original wird nicht angefasst" galten vor der Messung und gelten für eine **Kameraaufnahme**; dieser Bestand besteht zu 92 % aus **Bildschirmfotos**, und die haben kein Negativ. Die Aufhebung steht mit ihrem Grund in Abschnitt 10a und am Quelltext — sie ist nicht gelöscht.* ***Was liegen bleibt, steht als eigene Zeile unten: die Ableitungen auf WebP.*** ***Und ein Befund aus dem Bauen:*** *die `effort`-Leiter ließ sich nicht am echten Bestand messen, und an erzeugtem Material hängt die Antwort vom Material ab (Stolperstein 270).* |
| **0.20.0** *MINOR* *(neu, Nummer vorläufig)* | Die Oberfläche wird ruhiger — **nichts aus diesem Blatt**, aus dem Betrieb am 30. August 2026. *Ausarbeitung samt der Liste dessen, was ausdrücklich NICHT mitkommt: Projektstand, Abschnitt 10a.* |
| **0.21.0** *MINOR* *(war 0.19.0, Nummer vorläufig)* | Bereinigung — der Bruch |

**Was hier bleibt, bleibt aus einem Grund:** die fünf Punkte unten haben
**keine Nummer**, weil keiner von ihnen jetzt gebaut werden soll — zwei sind
`nicht empfohlen`, drei sind `später`. *Punkt 4 ist am 1. September 2026
dazugekommen: er ist der Teil von Punkt 1, den 0.18.0 mit Begründung liegen
gelassen hat.* *Punkt 5 ist am selben Tag dazugekommen: er ist der Teil von
Punkt 15, den 0.19.0 liegen lässt — **und sein Grund ist ein anderer als
vorher.*** *Ein Sammelblatt, in dem nur noch das Verworfene
steht, sieht mager aus. Es ist trotzdem der richtige Zustand: alles Übrige ist
entschieden und hat seinen Ort.*

---

## Übersicht nach Art

| Art | Punkte in Teil I |
|---|---|
| **Fehler** | **7** *(der einzige davor, der Export, ist 0.12.3 geworden)* |
| **Verbesserung** | — |
| **Neue Funktion** | 1, 2, 3, 4, **6** |
| **Design** | — |
| **Verbesserung** *(nachgetragen)* | 5 |

| Einschätzung | Punkte |
|---|---|
| **später** | 2, 4 |
| **nicht empfohlen** | 1, 3 |
| **eingetragen als 0.21.0** | **5, 6** |
| **eingetragen als 0.19.4** | **7** |

*Die Reihenfolge unten ist weiterhin die des Auffallens und sonst nichts.*

---

## 1. „Entfällt" am einzelnen Kriterium — mit Vorbehalt

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
Zwei verschiedene Aussagen, ein Wert. Nach der Doktrin der Instanz: eine zweite
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
Instanz ist ein Sachgebiet" heißt (Projektstand, Abschnitt 10, vorgemerkt für
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
beantworten, die sich nur in einem Bestand stellt, den die Instanz gar nicht
haben soll.**

**Empfehlung: zurückstellen, bis es im Betrieb tatsächlich vermisst wird.** Er
steht hier, weil er die logische Lücke ist — nicht, weil er gebaut werden
sollte. *Ein Sammelblatt, das nur die guten Ideen kennt, verliert die Begründung
für die verworfenen.*

---

## 2. Zwei Einträge zu einem machen

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

**Seit 0.11.0 sagt die Instanz beim Anlegen, dass es den Gegenstand schon gibt.
Sie kann aber nichts dagegen tun, wenn er doch zweimal dasteht.** Ein Hinweis
ohne Heilmittel.

### Was es nicht ist

**Kein Fehler und keine Lücke in 0.11.0.** Der Hinweis verhindert den zweiten
Eintrag, **bevor** er entsteht, und das ist der Fall, der zählt. Was fehlt, ist
die Reparatur für die Fälle davor.

**Und es ist ausdrücklich keine kleine Ergänzung.** Es wäre **der erste Eingriff
der Instanz, der Zeilen zwischen zwei Eltern verschiebt** — unumkehrbar. An einem
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

## 3. Der QR-Encoder für den zweiten Faktor

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
`Bewertungskatalog/chefin` und **203** bei einem langen Instanz- und
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

## 4. Der Suchbereich als Häkchen — was von Punkt 1 liegen geblieben ist

**Aufgefallen mit derselben Meldung wie der Trefferkontext** — 27. August 2026,
unmittelbar nach dem Einspielen der Suche im Server.

> **Art: Neue Funktion** · **Claude: später** — *nicht aus Zeitmangel, sondern
> weil die Frage jetzt anders aussieht.*
> **Draußen üblich:** der Suchbereich als Häkchen hinter „Erweitert" ist der
> Normalfall.

### Woher

Er stand als Teil **(b)** in Punkt 1 dieses Blatts („Die Suche schärfen") und
ist mit ihm in den Fahrplan gegangen. **Die Runde 0.18.0 hat (a) und (c)
gebaut und ihn ausdrücklich liegen gelassen**; damit steht er wieder hier, und
zwar allein.

### Was gemeint ist

Titel, Beschreibung, Kategorie, Tags, Links und Kommentare einzeln an- und
abwählbar. **Verengend**, Vorgabe **alle an** — also genau das heutige
Verhalten —, und hinter einem Schalter „Erweitert", damit der einfache Fall ein
Feld bleibt. **Der Bereich gehörte in die gespeicherte Ansicht**, sonst zeigte
eine Ansicht „Bosch, nur Titel" beim Anklicken etwas anderes als beim
Speichern; eine alte Ansicht **ohne** das Feld müsste „alle Quellen" heißen und
nicht „keine".

### Warum er liegen bleibt

**Er ist eine zweite Bedienfläche neben einer Suche, die heute ein Feld ist.**
Wer sie überfrachtet, macht den einfachen Fall teurer, um den seltenen billiger
zu machen.

**Und er war erst zu beurteilen, wenn der Trefferkontext steht.** *Genau das ist
jetzt der Fall — die Frage lautet deshalb nicht mehr „wollen wir Häkchen",
sondern: **beantwortet die Zeile „Link: …" die Frage schon?*** Wer eine Suche
absetzt und an jeder Kachel liest, warum sie dort steht, braucht womöglich kein
Häkchen mehr, um Links auszuschließen — er sieht auf einen Blick, welche Treffer
ihn nichts angehen.

**Das ist eine Entscheidung mit Begründung und keine Verschiebung.** *Wieder
aufgemacht wird sie, wenn aus dem Betrieb die Meldung kommt, dass die Zeile
nicht reicht — und dann mit einem Beispiel, an dem man das sehen kann.*

### Was es anfasst

Die Suchroute (ein Parameter für den Bereich), die Filterzeile, die
gespeicherten Ansichten, Prüfungen, Gegenproben, README. **Kein Schema.**

---

## 5. Die Ableitungen auf WebP — was von Punkt 15 liegen geblieben ist

> **STAND 2. SEPTEMBER 2026: er hat eine Nummer bekommen.** Die Ableitungen
> gehen in **0.21.0** mit — in derselben Runde, die über die Verfahren der
> Bildablage entscheidet. *Ein Durchgang über den Bestand statt zwei.*
> **Und der Grund, warum er überhaupt drängt, hat sich noch einmal geschärft:**
> die Vorschaukachel rechnet ihr Bild ohnehin hoch (siehe Punkt 7 und die
> Runde 0.19.4), und was man dabei sieht, ist ein JPEG q84.

**Ausgelöst von 0.19.0** — *und der Punkt steht hier, weil sein GRUND sich mit
jener Runde geändert hat.*

> **Art: Verbesserung** · **Claude: später** — es berührt die Auslieferung und
> ist nicht gemessen.
> **Draußen üblich:** Ableitungen in WebP oder AVIF sind der Normalfall; das
> ist gerade die Stelle, an der draußen umkodiert wird.

### Woher

Aus Punkt 15 (die Bildablage), Teil (b). Er stand dort als *„später, wenn Platz
wirklich knapp wird"*.

### Warum der Grund jetzt ein anderer ist

**Bis 0.19.0 waren die Ableitungen die kleinere Hälfte** — 71,1 MB gegen 497,7
MB Originale, und die Ersparnis wäre eine ohne Not gewesen. **Nach 0.19.0
schrumpfen die Originale auf rund 162 MB, und die Ableitungen bleiben bei 71,1
MB: sie sind damit die größere Hälfte.**

**Und ein zweiter Befund ist dazugekommen.** `medium` ist **JPEG q84** und damit
verlustbehaftet — es franst an Text genauso aus wie die verlustbehafteten
WebP-Stufen. **Was man in der Anwendung anschaut, ist die Ableitung und nicht
das Original.** *0.19.0 macht das Archiv unversehrt und lässt die Anzeige, wie
sie ist. Das ist vertretbar, aber es ist eine halbe Antwort.*

### Warum er trotzdem liegen bleibt

**Es berührt die Auslieferung** (`setzeBildHeader`) und damit einen zweiten Weg
— 0.19.0 fasst nur die Ablage an. **Und die Frage, ob `medium` ebenfalls
`nearLossless` werden sollte, ist NICHT gemessen**; sie braucht einen eigenen
Lauf, nicht eine Vermutung im Vorbeigehen. *Eine Ersparnis, die man nicht
gemessen hat, ist eine Vermutung — dieselbe Regel, an der 0.19.0 selbst hängt.*

### Was es anfasst

`makeVariants()`, `kodiereKommentarBild()`, die Auslieferung, das Nachrüsten
beim Start, Prüfungen, Gegenproben, README. **Kein Schema.**

---

# Teil II — Gesammelt, ohne Ausarbeitung

**Zeilen, keine Punkte.** Wer eine davon bauen will, arbeitet sie vorher in die
sechs Überschriften aus Teil I aus — *und stellt dabei regelmäßig fest, dass
die Hälfte davon schon beantwortet ist.*

**Hinter jeder Zeile steht, welche Version sie nötig gemacht hat.** *Das ist
keine Zuordnung zu einer Runde, sondern Herkunft: eine Idee ohne Anlass ist
schwerer zu beurteilen als eine, bei der man weiß, was sie ausgelöst hat.*

### Aus dem Betrieb und aus den Runden

> **DIE NEUN BEFUNDE VOM 30. AUGUST 2026 SIND GEBAUT.** Sie standen hier einen
> halben Tag lang, haben am selben Tag ihre Nummer bekommen — **0.17.0** — und
> sind an diesem Tag vollständig gebaut worden. *Ein Punkt wandert vom
> Sammelblatt in den Fahrplan und von dort in ein Änderungsprotokoll, nie
> zurück.* **Was gebaut wurde, steht im Änderungsprotokoll 0.17.0.**
>
> **KEINER DER NEUN IST ZURÜCKGEKOMMEN** — es ist nichts geblieben, was hier
> wieder aufzuschreiben wäre.
>
> **DAZU ZWEI ZEILEN, DIE DIE RUNDE SELBST ERZEUGT HAT** — sie stehen gleich
> hier darunter: *dieselbe Art Satz, die Punkt 2 aus zwei Stellen genommen hat,
> steht an zwölf weiteren*, und *eine tote Regel im Stilblatt aus 0.16.0*. **Eine
> dritte steht in Teil II unter „Am Prüfstand"** — `gegenprobe.js` kann einen
> Abriss nicht von einer Störung von außen unterscheiden.

> **DIE SECHS BEFUNDE VOM 30. AUGUST 2026, ABENDS, SIND EBENFALLS GEBAUT** —
> **0.17.1**, und keiner von ihnen stand je hier. **Was gebaut wurde, steht im
> Änderungsprotokoll 0.17.1.** *Zurückgekommen ist nichts;* **eine Zeile hat
> die Runde erzeugt, und sie steht gleich hier darunter.**

> **UND DIE SECHS BEFUNDE VOM 31. AUGUST 2026 SIND GEBAUT** — **0.17.2**, und
> auch keiner von ihnen stand je hier. **Was gebaut wurde, steht im
> Änderungsprotokoll 0.17.2.** *Zurückgekommen ist nichts.* **Ein Punkt ist
> während der Runde dazugekommen** — die README, die an siebenundvierzig
> Stellen Versionsgeschichte erzählte — **und ist vor dem Bauen in den Auftrag
> nachgetragen worden**, damit er beim nächsten Lesen noch da ist.

- **Die beiden Konzeptpapiere tragen „Anlage" je einmal** *(0.17.1, aus der
  Durchsicht der Runde — gefunden, benannt, nicht behoben)*.
  **Art: Kleinigkeit.** Mit 0.17.1 heißt die Installation überall **Instanz**;
  der Auftrag jener Runde nimmt das Konzeptpapier zum Mehrbenutzerbetrieb und
  das Videopapier **ausdrücklich aus** und verlangt stattdessen die Meldung.
  **Zwei Stellen sind es:** `Konzept_Mehrbenutzerbetrieb_Kriterion_0_9_1.md`
  Zeile 178 und `Konzept_Video_und_grosse_Dateien.md` Zeile 112 — *beide Male
  meint das Wort die Installation.* **Falsch ist dort nichts**, es liest sich
  nur nach einem Wort, das es sonst nicht mehr gibt. *Beide Papiere sind
  Herleitung und kein Stand; wer sie eines Tages anfasst, zieht die zwei
  Wörter mit.*
  *(Claude: später — zwei Wörter, und die Papiere ruhen)*

- **Dieselbe Art Satz wie in Punkt 2 von 0.17.0 steht an zwölf weiteren
  Stellen in der Oberfläche** *(0.17.0, aus der Durchsicht der Runde —
  nachgesehen und aufgeschrieben, nicht behoben)*.
  **Die Regel steht seit 0.17.0 im Projektstand, Abschnitt 5.6:** eine
  Oberfläche sagt, WAS IST, nicht, warum sie so gebaut wurde. Zwei Stellen sind
  in jener Runde gestrichen worden; **die übrigen sind gefunden, benannt und
  ausdrücklich stehengeblieben**, weil der Auftrag „nachsehen und aufschreiben"
  verlangte und nicht „beheben".
  **Die Liste mit Zeilennummer und Wortlaut steht im Änderungsprotokoll
  0.17.0**, Abschnitt „Offen geblieben". Die klarsten Fälle: *„ein
  Sicherheitsprotokoll, das sich wegräumen lässt, wäre keins"* (Karte
  „Sicherheitsprotokoll"), *„ein Knopf, der an eine beliebige Adresse schickt,
  wäre ein offener Mailverteiler hinter einer Anmeldung"* (Karte „Mailversand")
  und *„das ist so gewollt und bleibt so"* (Karte „Meine Sitzungen").
  **Drei Grenzfälle gehören dazu und sind KEIN Befund:** eine **fachliche
  Warnung** ist erlaubt, und eine **Folge**, die man kennen muss, um zu
  entscheiden, auch. *Der Unterschied ist die Frage, die der Satz beantwortet:
  „was passiert, wenn ich das tue" ja — „warum haben wir das so gebaut" nein.*
  **NACHGETRAGEN AM 31. AUGUST 2026, aus einem Lauf über alle Texte, die einen
  Betreiber ansprechen:** von achtzig gemeldeten Stellen haben sechzehn eine
  strenge Gegenprobe überstanden, und **vier davon liegen im ausgelieferten
  Text** — nicht in einem Papier. *Der Mailverteiler-Satz ist mit 0.17.2
  gestrichen; die drei übrigen stehen noch:*
  - *„das ist so gewollt und bleibt so"* (Karte „Meine Sitzungen") — der
    Halbsatz davor sagt schon, WAS IST: weder Adresse noch Browserkennung
    werden gespeichert.
  - *„…, weil es dort keine Wolke gibt"* (Karte „Tags", Admin-Zweig).
  - *„Der Schlüssel geht roh in die Datenbank (`PRAGMA key = x'…'`) — ohne
    Ableitung, …"* (Karte „Kennzahlen") — die Klammer ist eine Zeile aus dem
    Quelltext.
  **Zwei Meldungen kommen dazu, außerhalb der Oberfläche:** *„AUTH_RESET wird
  **seit Version 0.8.0** nicht mehr ausgeführt"* (`auth.js`, Startwarnung — die
  Nummer sagt dem Leser nichts, seine Handlung bleibt dieselbe) und die Klammer
  *„(role=eigentuemer)"* in der Auffangmeldung von `db.js`, die den Satz davor
  in der Schreibweise der Datenbankspalte wiederholt.
  *(Claude: eine eigene kleine Runde wert, aber keine eilige. Jeder Satz ist
  einzeln zu entscheiden, und ein Teil davon sind Grenzfälle, über die man
  reden muss. **Nicht mit 0.17.2 mitgemacht**, weil jede dieser Dateien in den
  Fingerprint geht und die Runde ihre Papiere schon geschrieben hatte.)*
- **`.rz-summe:first-of-type` im Stilblatt kann nie greifen** *(0.16.0, beim
  Bau von 0.17.0 aufgefallen)*. Die Regel soll der ersten Summenzeile des
  Erklärkastens einen Strich darüber geben; `:first-of-type` zählt aber
  **DIV-Geschwister**, und das erste `div` in `.rechnung` ist `.rz-kopf`.
  **Die Regel ist damit tot** — der Strich entsteht heute an anderer Stelle,
  und niemand hat es gemerkt.
  *(Claude: eine Zeile, ein PATCH-Kandidat. Nicht in 0.17.0 mitgefahren, weil
  sie zu keinem der neun Punkte gehört und die Runde eine Kartenbreite von
  einem Anzeigefehler unterscheiden können muss.)*
- **Die Tagwolke soll ab der zweiten Zeile den Platz unter „mehr" / „weniger"
  mitfüllen** *(0.13.1, aus dem Betrieb — geprüft, beziffert, zurückgestellt)*.
  Die Wolke steht seit 0.13.0 **neben** ihren Verweisen; damit endet **jede**
  ihrer Zeilen an derselben Kante, auch die zweite und dritte, unter denen der
  Platz frei ist.
  **Machbar ist es, und es gibt genau einen Weg: Fließsatz.** Ein fließendes
  Element ist das einzige Mittel in CSS, um umbrechenden Inhalt um eine Ecke
  laufen zu lassen — ein Flex-Element ist immer ein Rechteck **neben** der
  Wolke, nie eine Aussparung **in** ihr.
  **Was der Umbau kostet:** die Wolke wechselt von `flex` auf `block`, die
  Marken auf `inline-block` mit `vertical-align: top`; `gap` fällt weg und wird
  zu Außenabständen, die letzte Zeile braucht einen Ausgleich; der Kasten
  `.frow-rechts` wandert als erstes Kind **in** die Wolke mit `float: right`;
  **`begrenzeWolke()` muss die erste Marke suchen statt das erste Kind zu
  nehmen**; der schmale Schirm braucht eine eigene Antwort, weil `flex: 0 1
  auto` in einem Blockkasten nichts mehr bedeutet.
  **Was er einbringt:** rund 60 px je Zeile ab der zweiten — etwa eine Marke
  mehr, zwei mit „zurücksetzen" daneben. **Im Regelzustand null**, denn
  eingeklappt ist die Wolke eine Zeile hoch, und das ist genau die Zeile, neben
  der der Verweis ohnehin steht.
  *(Claude: später — kein PATCH. Er tauscht die Bauform der Wolke aus und macht
  alle Maße aus 0.13.0 neu messbedürftig; das ist ein Punkt mit eigener Messung
  und eigener Prüfgruppe. **Die Ausrichtung derselben Zeile ist mit 0.13.1
  gebaut** und davon unabhängig.)*
- **Dieselbe Tagwolke ist an zwei Stellen verschieden angeordnet — seit 0.13.0
  mit Grund** *(0.12.3, entschieden 0.13.0)*.
  Auf der Eintragsseite sitzt „mehr" in einer eigenen Kopfzeile (`.wolke-kopf`,
  `space-between`) über einer dreizeiligen Wolke; in der Übersicht steht die
  Wolke seit 0.13.0 **neben** ihren Verweisen in einer einzigen Zeile.
  **0.13.0 hat genau eine von beiden geändert — und damit die Frage
  entschieden, die hier stand.** *Die Eintragsseite zieht NICHT mit, und das
  ist nachgesehen: dort steht neben der Wolke ein ganzer erklärender Satz. Sie
  bekäme neben ihm eine schmale Spalte und bräche über MEHR Zeilen um, nicht
  über weniger — Mitziehen machte sie schlechter. In der Übersicht dagegen
  standen rechts 900 px leer, und knapp war die Höhe.*
  **Die Mechanik ist ohnehin geteilt** (`sortiereWolke()`, `begrenzeWolke()` —
  eine Stelle, zwei Rufer); verschieden ist allein die Anordnung, und sie ist es
  aus einem genannten Grund. **Aus einer Doppelung ohne Grund ist damit ein
  Unterschied mit Grund geworden**, und der steht im Projektstand, Abschnitt
  5.6. *(Claude: erledigt als Frage. Offen bleibt nur eine Idee ohne Nummer:
  `+7` statt „mehr", was voraussetzt, dass die überzähligen Tags weggeblendet
  statt beschnitten werden.)*
- **Prüfung der Wiederherstellung** *(0.8.70)*. Seit die Sicherung über
  `VACUUM INTO` der Hauptweg ist, gibt es eine Datei, die niemand je
  zurückgespielt hat — **eine Sicherung ohne Probe ist eine Vermutung.** Ein
  Weg, der eine Sicherungsdatei probeweise öffnet und den Bestand zählt, ohne
  die laufende Datenbank anzufassen. *(Claude: stark empfohlen)*
- **Die abweichende Datei beim Namen nennen** *(Fingerprint aus 0.8.10, akut
  mit 0.9.1)*. Der Fingerprint sagt heute nur, **dass** etwas abweicht, nicht
  **was**. Bei 0.9.1 hat sich dort eine Datei zu viel gezeigt (Stolperstein
  158), und der Handgriff dagegen steht bisher nur in der README. **Eine Zeile
  in der Karte „Instanz" würde ihn ersetzen.** *(Claude: empfohlen)*
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
  **NEU BEURTEILT AM 29. AUGUST 2026, nach dem Bau von 0.16.0.** Die alte
  Absage lautete *„die Instanz hat keine Benachrichtigungen"* — **sie hat jetzt
  welche**, und damit ist diese Begründung verbraucht. *Sie wird hier nicht
  stehengelassen und nicht stillschweigend ersetzt: die Zeile bekommt die
  Begründung, die nach 0.16.0 wirklich trägt.*

  **Was die Glocke davon schon leistet und was nicht.** Sie meldet, dass an
  einem Eintrag **etwas** von anderen dazugekommen ist — nicht, dass jemand
  **dich** gemeint hat. *Das ist der ganze Unterschied zwischen einer Glocke
  und einer Erwähnung: die eine sagt „hier ist etwas", die andere „das gilt
  dir".* **Der Träger der Meldung wäre also da; was fehlt, ist das Ziel.**

  **Drei Dinge stehen einer Erwähnung weiterhin im Weg, und keines davon hat
  mit Benachrichtigungen zu tun:**
  1. **Wer wen sehen darf, ist ungeklärt.** `@name` verlangt eine
     Namensvervollständigung über alle Zugänge — heute sehen Zugänge einander
     nicht vollständig, und `GET /api/users` steht hinter dem Admin. **Eine
     Erwähnung machte aus der Zugangsliste eine Auskunft für jeden.**
  2. **Die schlanke Glocke kann kein Ziel tragen.** Sie führt einen
     **Zeitstempel** und keine Tabelle; „diese Meldung gilt dir" wäre eine
     Angabe je Meldung — genau die Tabelle, die 0.16.0 ausdrücklich nicht
     gebaut hat. *Eine Erwähnung ohne Lesestand je Meldung wäre eine
     Erwähnung, die das Öffnen der Tafel mit wegräumt.*
  3. **Bei einer Handvoll Zugängen meldet sie, was man ohnehin weiß.** Der
     Nutzen einer Erwähnung wächst mit der Zahl der Beteiligten; er ist hier
     derselbe schwache Nutzen wie bei der Glocke selbst.

  *(Claude: weiterhin nicht empfohlen — die Begründung ist seit 0.16.0 eine
  andere und liegt jetzt bei der Sichtbarkeit der Zugänge und beim Lesestand
  je Meldung, nicht mehr bei fehlenden Benachrichtigungen · Draußen üblich:
  Erwähnungen setzen überall eine Benachrichtigung **und** einen Lesestand je
  Meldung voraus, nie nur die erste)*


### Am Prüfstand

- **Ein echter Teillauf** *(Gruppenfilter seit 0.8.10)*. `pruefung.js` ist
  **ein** Ablauf; der Namensfilter filtert die **Ausgabe**, nicht die Arbeit.
  `gegenprobe.js` und `PORT_VERSATZ` mildern das, sie beheben es nicht.
  *(Claude: nicht empfohlen — der Gruppenfilter trägt den Alltag)*
- **Eine Messung im echten Browser als Teil des Prüflaufs** *(0.15.1)*.
  **Art: Verbesserung.** `jsdom` rechnet kein CSS. Der Prüfstand kann deshalb
  sagen, dass `element.hidden` wahr ist — **nicht, ob der Browser das Element
  zeichnet.** *Genau daran ist 0.15.1 hängengeblieben: 4351 grüne Prüfungen,
  und die Instanz zeigte im Browser das Gegenteil.* **Die Frage, die offen
  bleibt: wie viele weitere Zusagen der Oberfläche stehen nur in jsdom?**
  Die Antwort wäre ein Browser im Prüflauf — **und der kostet eine
  Abhängigkeit**, die es hier nicht gibt. *Ein Mittelweg, der nichts kostet:
  Regeln im Stilblatt festnageln, wie 0.15.1 es mit `[hidden]` tut, und
  einzelne Lagen von Hand in Chromium messen und ins Protokoll schreiben, wie
  0.14.0 es mit der Sternreihe getan hat.* **Diese Zeile ist keine Empfehlung,
  sondern die Notiz, dass die Frage gestellt und nicht beantwortet ist.**
  *(Claude: später — die Entscheidung fällt nicht nebenbei · Draußen üblich:
  wer Oberfläche prüft, prüft sie im Browser; wer das nicht kann, prüft die
  Regeln statt der Bilder)*
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
- **`jsdom` misst nichts, und mit 0.12.3 trifft das zum ersten Mal eine
  Eigenschaft, die AUSSCHLIESSLICH im Zeichnen wirkt** *(0.12.3)*. Bisher traf
  der Mangel Ausrichtung, Trefferflächen und Umbruchpunkte — Dinge, die man
  wenigstens an der Regel festmachen kann. **`content-visibility: auto` ist
  dagegen nur als Wirkung überhaupt etwas**, und der Prüfstand kann nur
  festhalten, dass die Regel dasteht. *Das ist keine Prüfung ihrer Wirkung, und
  über der Gruppe steht ausdrücklich, dass sie es nicht ist.* **Dieselbe Stelle
  hat einen zweiten Weg gekostet:** „mehr" an der Tagwolke entsteht in `jsdom`
  nie, weil `begrenzeWolke()` bei Höhe null aussteigt — geprüft wird deshalb
  über „zurücksetzen". *Die Messung ist mit einem echten Browser gefahren und
  steht im Änderungsprotokoll 0.12.3.* **Was fehlt, ist ein Weg, solche
  Messungen wiederholbar zu machen, ohne eine Abhängigkeit aufzunehmen.**
  *(Claude: später — die Frage ist nicht das Werkzeug, sondern wo die Zahlen
  hingehören)*
  > **DER WEG IST MIT 0.17.4 GEFUNDEN — die Frage, wohin die Zahlen gehören,
  > bleibt.** Chromium lässt sich mit `--remote-debugging-port` starten und
  > über das **DevTools-Protokoll** fahren; **den WebSocket-Client bringt Node
  > selbst mit**, seit v22. *Keine Abhängigkeit, kein Eintrag in
  > `package.json`, nichts, was ins Image kommt.* **Gefahren wurde so die ganze
  > Nachmessung zu 0.17.4:** ein echter Server in einem Wegwerfverzeichnis, ein
  > Bestand über die API, `Emulation.setDeviceMetricsOverride` auf
  > 1600 × 913 und `Runtime.evaluate` für die Maße.
  > **Was weiterhin offen ist:** ob so ein Werkzeug in den Baum gehört. *Es
  > liegt bisher außerhalb; ein Prüflauf, der einen Browser startet, ist etwas
  > anderes als einer, der `jsdom` baut — er braucht Chromium auf der Maschine,
  > und die hat nicht jeder.* **Die Zahlen stehen deshalb weiter im
  > Änderungsprotokoll und nicht in einer Prüfung** (Stolperstein 223).
- **Ein Papier, das zwischen zwei Runden ohne Lauf geändert wird, kann den
  Prüfstand rot machen, ohne dass es jemand bemerkt** *(0.12.3)*. Der
  Sprachwächter sieht auch die Dokumente an. Ein Merge in `Fehler_und_Ideen.md`
  nach 0.12.2 brachte `Zeichenkette` statt `String` herein; der Branch war
  danach rot und niemand hat es gesehen, weil zwischen Merge und nächster Runde
  kein Lauf lag. *(Claude: empfohlen — der Prüflauf bei jedem Push gibt es seit
  0.8.10; hier hat er entweder nicht gegriffen oder niemand hat hingesehen. Das
  gehört nachgeprüft, bevor daraus eine neue Regel wird.)*
- **`gegenprobe.js` kann einen Abriss nicht von einer Störung von außen
  unterscheiden** *(0.17.0)*. **Art: Werkzeug.** Spur 0 fährt ohne Versatz,
  also auf denselben Portbasen wie ein gewöhnlicher `npm test`. Läuft daneben
  ein Prüflauf, nimmt er ihr die Ports, ihre Server enden sofort — und der
  Bericht meldet **ABGERISSEN**, was wie ein Befund über den Rückbau aussieht.
  *In dieser Runde ist genau das passiert, und ein `pkill` auf den Namen hat es
  auf alle vier Spuren ausgedehnt: die verwaisten Server blieben stehen und
  nahmen der nächsten Runde die Ports, bis neunzehn Rückbauten hintereinander
  falsch gemeldet waren.* **Die Antwort wäre klein:** vor dem Start nachsehen,
  ob auf den Portbasen der Spuren schon jemand horcht, und beim Aufräumen nach
  Prozessnummer statt nach Namen greifen — beides steht als Bauform schon in
  `prozesseUnter()`. *(Claude: empfohlen — klein, und es verhindert einen
  Befund, den es gar nicht gibt)*

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
  0.9.1 in `main` hat den Fingerprint `cb73399d`; die laufende Instanz trug
  `3cf1b093`. Dazwischen liegt die Nacharbeit an Marke und Anmeldekarte.
  **Eine Nummer `0.9.2` kommt dafür nicht mehr in Frage:** seither sind 0.10.0
  und 0.11.0 herausgegangen, und die Instanz hat nur **eine** Reihe — eine Zahl,
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
  Blättern — Fahrplan, 0.12.3, „Nur zeichnen, was zu sehen ist".*
- **Verschlüsselung je Benutzer.** „Ein Neubau, kein Anbau" — mit der Folge,
  die offen dokumentiert ist: **jeder Benutzer vertraut dem Betreiber mit
  allem.** Für eine selbstgehostete Instanz ist das die richtige Abwägung, und
  sie gehört in die README statt in den Quelltext.
- **Ein Framework im Frontend.** Kein Framework heißt: keine Build-Kette, keine
  400 Pakete, kein Ablaufdatum. *Siehe Fahrplan 0.16.0, „Zwei Funktionen sind zu groß geworden" — die Antwort auf große
  Funktionen sind kleinere Funktionen.*
- **PWA-Manifest.** Für eine Instanz im eigenen Netz ohne Offline-Anspruch ist
  der Gewinn das Icon auf dem Startbildschirm und sonst wenig. Steht in Teil II,
  bewusst weit unten.
- **Tags in Mengen bearbeiten / Vorlagen für Einträge.** Nützlich, aber
  deutlich hinter allem, was in Teil I steht. Sie bleiben, wo sie sind.
- **Die Sortierung nach `updated_at` für alle.** Die Entscheidung ist richtig;
  sie hatte eine Lücke, und die ist mit „Neu seit meinem letzten Besuch"
  (0.8.60) **daneben** geschlossen worden statt durch Umbau.
  *Nachtrag 30. August 2026: die Pille ist mit 0.17.0 gestrichen, ihre Auskunft
  trägt die Glocke. **Die Sortierung bleibt, was sie war** — und sie ist jetzt
  das Einzige, was eine Titeländerung oder eine neue Datei noch sichtbar
  macht: was sich zuletzt getan hat, steht oben. Wird das doch zu wenig, ist
  das ein neuer Befund und keine Rückkehr der Pille.*
- **Kriteriengruppen je Kategorie.** Die Alternative zu „eine Instanz ist ein
  Sachgebiet". Sie ist ein Umbau an Kriterienverwaltung, Detailansicht,
  Vergleich, Austauschformat und Gesamtschnitt — und sie beantwortet eine
  Frage, die ein Absatz in der README billiger beantwortet. **Vorgemerkt ist
  deshalb der Absatz** (Projektstand, Abschnitt 10), nicht der Umbau.
- **Wortgrenzensuche statt Teilstring.** Siehe Fahrplan 0.18.0, „Die Suche schärfen" (d) *(war 0.17.0; die Nummer ist am 30. August 2026 weitergerückt)*: In einem
  Katalog voller Typnummern verschwiege sie still Treffer.
- **Ein Cookiename mit bedingtem `Secure`.** Der billige Weg an Fahrplan 0.13.0, „Der Proxy ist ein Ja/Nein",
  vorbei — und der falsche: er gäbe Sicherheit auf, statt Bequemlichkeit zu
  gewinnen. Wer im eigenen Netz eine Klartextverbindung verbiegen kann, setzte
  damit einen Cookie, den die HTTPS-Seite anschließend auch annimmt — **und
  genau dagegen gibt es `__Host-`.**
- **Ein dreiwertiger Zustand statt `rejected`.** *offen / genommen / verworfen*
  klingt vollständiger, ist aber ein Neubau — und „genommen" ist bei einem
  Bewertungsarchiv gar nicht immer die Gegenfrage zu „abgelehnt". Siehe Teil I,
  Fahrplan 0.14.0, „Aus ,abgelehnt' wird eine Entscheidung" (d).
- **`pruefung.js` in Dateien zerlegen.** Die Prüflagen bauen aufeinander auf;
  der Gruppenfilter aus 0.8.10 macht die Datei bedienbar, ohne sie zu teilen.
  *Was dort wirklich fehlt, ist ein echter Teillauf — Teil II, „Am Prüfstand".*

**Aus der Durchsicht vom 28. August 2026** — sieben davon sind aus den neuen
Punkten herausgefallen und stehen hier, damit sie nicht als Idee wiederkommen:

- **Der getippte Benutzername im Sicherheitsprotokoll.** Er steht gegen die
  Zusage im Kartentext (*„die Instanz speichert beides nicht"*) und gegen den
  Grund am Schema: **ein ins falsche Feld getipptes Passwort landete damit in
  der Tabelle.** *Und CrowdSec braucht ihn nicht — es sperrt nach Adresse.*
  Siehe Fahrplan 0.13.0, „Gescheiterte Anmeldungen" (b).
- **Die Adresse des Aufrufers im Sicherheitsprotokoll.** Dasselbe, und dazu:
  die Tabelle trägt Nummern aus geschlossenen Listen, nicht Strings von
  außen. Die Adresse gehört ins Containerprotokoll, wo sie gelesen wird.
- **Eine Protokollzeile für den ausgebremsten Fall — in der Tabelle.** Sie ist
  die einzige Zeile, die ein Fremder auslösen kann, und die Bremse ist ihr
  Deckel. *Im Containerprotokoll ist sie dagegen richtig und nützlich; das ist
  der Unterschied zwischen den beiden Ablagen.*
- **Der ursprüngliche Name am gelöschten Zugang.** Zwei harte Gründe: der Name
  wird zur Neuvergabe frei und kollidierte irgendwann mit einem lebenden
  Zugang, und **der Grabstein IST die Anonymisierung** — Artikel 17 DSGVO. Wer
  den Namen aufbewahrt, hat nicht gelöscht. Siehe Fahrplan 0.13.0, „Gelöschte Zugänge" (c).
- **Die vorhandenen Bildoriginale nach JPEG umwandeln.** Verlustbehaftet und
  unumkehrbar — und bei einem Bildschirmfoto ist PNG die bessere Wahl. Eine
  Umwandlung über den ganzen Bestand träfe genau die Bilder, denen sie schadet.
  *Draußen fasst niemand das Original an.* Siehe Fahrplan **0.19.0**, „Die Bildablage" (a).
- **Ein zweites Kommentarformular in einem Dialogfenster.** Das vorhandene
  trägt Bilder-Einfügen, Anpinnen, Art-Umschalter und Mitwachsen; ein zweites
  davon wären zwei Wahrheiten über dasselbe Formular. **Ein Sprungknopf tut
  dasselbe für zwei Zeilen.**
- **„mehr" in die Tagwolke legen und rechts Platz freihalten.** Die Wolke wird
  beschnitten, der Verweis würde mitabgeschnitten — und der Ausweg wäre ein
  fest ausgerechneter Freiraum. **Genau daran hing 0.12.1 schon einmal**
  (`right: 92px`, Befund A): die Instanz stellt die Schrift von 80 bis 120
  Prozent, und eine ausgerechnete Breite kann dabei nur falsch werden.
- **Eine Benachrichtigungstabelle mit Lesestand je Meldung.** Der Weg der
  großen Anbieter — und für eine Handvoll Zugänge der falsche: eine
  Schreiboperation an jedem Kommentar und jeder Bewertung, ein Aufräumer, zwei
  Kaskaden und ein Migrationsblock, **für eine Zahl, die sich aus vorhandenen
  Zeitstempeln errechnen lässt.** Siehe Fahrplan 0.16.0, „Die Glocke" (f).
- **Eine Glocke, die nennt, WER bewertet hat.** Sie hebelte die Entscheidung
  aus, dass eine einzelne Bewertung anonym bleibt (die Liste „Wer hat bewertet"
  ist nur für den Admin) — und zwar an der Stelle, an der es am wenigsten
  auffällt. **Die Zahl ja, der Name nie.**
  > **DIESE ZEILE IST AM 30. AUGUST 2026 AUF DIE PROBE GESTELLT WORDEN — UND
  > SIE HAT GEHALTEN.** Der Auftrag zu 0.17.0 verlangte, die Glockentafel sage
  > bei jeder Zeile dazu, **von wem** — und die Zeile zählt Kommentare **und**
  > Bewertungen. **Gebaut ist deshalb die Fassung, die weniger preisgibt:** die
  > Namen kommen aus den **Kommentaren**, eine Zeile mit ausschließlich neuen
  > Bewertungen trägt keinen. *Ein Kommentar trägt seinen Verfasser am Eintrag
  > ohnehin sichtbar; eine Bewertung tut das nicht.* **Die Abweichung steht im
  > Änderungsprotokoll 0.17.0, mit Grund** — und als Stolperstein 230:
  > *ein Auftrag kann einer stehenden Entscheidung widersprechen, ohne dass es
  > jemandem auffällt.*
- **Eine Glocke nur für den Desktop.** Was in `.mast-rest` steht, wandert auf
  dem Telefon von selbst ins Menü — *ein Markup, zwei Gestalten* (0.12.0). Eine
  Fassung nur für ein Gerät wäre eine Weiche nach Gerät, und genau die hat
  0.12.0 ausdrücklich vermieden.
- **Neuigkeiten und offene Aufgaben unter einem Zeichen.** Naheliegend, und aus
  zwei Gründen falsch: `GET /api/offen` hat **keinen Benutzerfilter** — die
  Liste ist gemeinsam, die Neuigkeiten sind persönlich —, und **eine Neuigkeit
  geht weg, wenn man sie liest, eine Aufgabe erst, wenn man sie erledigt.** Ein
  Punkt, der beides meint, geht nie ganz weg. *Draußen trennt es jeder:
  Instagram, Facebook, GitHub, Jira, Linear.* Siehe Fahrplan 0.16.0, „Die Glocke".


---

## 6. Fotos aus der Zwischenablage — die Ablage soll wählbar werden

**Art:** Funktion · **Claude:** empfohlen, mit einer Auflage · **Draußen üblich:**
ja, jede Fotoverwaltung lässt das Ablageverfahren wählen.

### Woher

Aus dem Betrieb, **2. September 2026**: ein JPEG von 5 MB, im Browser über
„Grafik kopieren" genommen und in Kriterion eingefügt, liegt danach als **12 MB**
in der Datenbank. Gemeldet als Verdacht auf einen Fehler in 0.19.0.

### Was gemessen wurde

Die Kette hat **drei** Glieder, und Kriterion sitzt am dritten:

| | |
|---|---|
| das Original im Netz | **5,21 MB** JPEG |
| was die Zwischenablage liefert | **34,79 MB** PNG |
| was Kriterion daraus macht | **20,42 MB** WebP `nearLossless` |
| was verlustbehaftet q90 daraus würde | **6,64 MB** — 67 % weniger |

**Die Zwischenablage trägt keine Datei, sondern Bildpunkte.** Der Browser legt
sie als PNG ab — verlustfrei, aus den *dekodierten* Bildpunkten des JPEG,
Kompressionsspuren eingeschlossen. **Kriterion bläht also nichts auf; es
verkleinert um 41 %, nur von einer Zahl aus, die es vorher nicht gab.**

### Was es NICHT ist

**Keine fehlende Größenprüfung.** `legeBildAb()` nimmt das WebP nur, wenn es
kleiner ist als das, was hereinkam — die Regel gibt es, sie ist als Rückbau 433
bewacht, und sie hat hier richtig entschieden: **das PNG war der große Brocken.**
Achtzehn Laborversuche quer durch Palette, Text, Graustufen, Alpha und 1×1
zeigen: **PNG gewinnt nie über die Größe.**

### Was gebaut werden könnte

**Drei Verfahren zur Wahl**, statt eines Schalters:

* **PNG** — keine Rechenzeit, größte Ablage
* **WebP verlustfrei** (`nearLossless` 60) — heutiges Verhalten
* **WebP verlustbehaftet** — für Fotos; gemessen 67 % kleiner

Und wenn PNG abgewählt wird, bietet die Kachel an, den Bestand nachzuziehen.

### Die Auflage, und sie ist der Grund für „mit einer Auflage"

**Verlustbehaftet darf keine Regel werden, sondern nur eine Wahl.** Gemessen an
einem Bildschirmfoto mit Text ist WebP q90 **rund siebenmal GRÖSSER** als
`nearLossless` — 0,09 gegen 0,01 MB, weil der verlustbehaftete Bitstrom mit
harten Kanten nichts anfangen kann. **Die Entscheidung von 0.19.0 war für
diesen Bestand richtig und bleibt die Vorgabe.**

*Die Rechtfertigung für den verlustbehafteten Weg trägt außerdem nur bei einem
Bild aus der Zwischenablage: dort ist der Verlust schon passiert, bevor
Kriterion es sieht. Bei einem hochgeladenen PNG wäre dasselbe Argument falsch —
und aus den Bytes sind die beiden nicht zu unterscheiden.*

### Der billigste Weg steht gar nicht im Quelltext

**„Bild speichern unter" und dann hochladen: 5,21 MB, kein Generationsverlust,
kein Kodierer, keine Entscheidung.** Kriterion fasst JPEG nicht an. Ein Hinweis
an der Einfügestelle wäre deutlich billiger als jede Wahl — *das spricht nicht
gegen die Wahl, gehört aber in die Abwägung.*

### Was es anfasst

`legeBildAb()`, die Kachel „Bildablage" (ab 0.19.1 eine eigene), der
Umstellungslauf, die zweite Bestätigung. **Kein Schema.**

> **EINGETRAGEN ALS 0.21.0**, zusammen mit den Ableitungen aus Punkt 5.

---

## 7. Die Vorschaubilder werden zu klein gerechnet

**Art:** Fehler · **Claude:** empfohlen · **Draußen üblich:** ja — jede
Fotoverwaltung leitet nach der **kurzen** Kante ab, wenn die Kachel quadratisch
ist.

### Woher

Aus dem Messen zu 0.19.1, **2. September 2026**. Aufgefallen ist es beim
Nachrechnen des engeren Ausschnitts: die Kachel zieht das Bild größer, als das
Vorschaubild hergibt.

### Was auffiel

**`thumb` ist 400 px auf der LANGEN Kante, die Kachel ist quadratisch und
fordert die KURZE.** Ein Bildschirmfoto im Verhältnis 16:9 hat als `thumb` also
400 × 225 Bildpunkte, und die Kachel braucht 313 × 313:

| | Faktor |
|---|---|
| 16:9 auf einer Kachel von 313 px | **1,39×** hochgerechnet |
| dasselbe auf einem 2×-Bildschirm | **2,78×** |
| dazu der engere Ausschnitt bei 250 % | **3,48×** |

**Das ist keine Anzeigefrage, sondern die Ableitungsregel.** Sie ist seit dem
ersten Tag so, und sie fällt erst auf, seit die Kachel den Ausschnitt enger
ziehen kann.

### Was es NICHT ist

**Kein Fehler des engeren Ausschnitts.** Der Zoom macht die Unschärfe nur
sichtbarer; sie ist auch ohne ihn da. **Und keine Frage des Formats** — ob die
Ableitung JPEG bleibt oder WebP wird, entscheidet die Runde über die Verfahren
(Punkt 5 und Punkt 6). *Die Geometrie hängt an keinem Verfahren.*

### Was gebaut werden könnte

Die Ableitungsregel auf die **kurze** Kante umstellen und die vorhandenen
**1034** Vorschaubilder neu ableiten.

### Was es anfasst

`makeVariants()`, ein Bestandslauf über alle Bilder. **Kein Schema.**

> **EINGETRAGEN ALS 0.19.4** *(bis zum 2. September 2026 als 0.19.3 geführt;
> gerückt, weil 0.19.2 dazwischenkam)*, und ausdrücklich NICHT zusammen mit den
> Verfahren: die Geometrie ist ein Fehler und wartet nicht auf eine
> Entscheidung. **Sie steht aber hinter 0.19.3** — der Lauf über 1034 Bilder
> hat im Anfrageweg nichts verloren.
