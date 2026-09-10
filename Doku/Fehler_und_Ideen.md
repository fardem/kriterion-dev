# Fehler und Ideen

**Das Sammelblatt · Stand 9. September 2026, nach 0.25.0**

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
*Am **3. September 2026** ist sie zum zweiten Mal angewandt worden, und diesmal
auf einen einzigen Punkt: **Punkt 8** („Alte Sicherungen aufräumen — ohne
Shell") ist als **0.20.0** fortgezogen, mitsamt seiner Ausarbeitung. **Eine
Zuordnung muss keine dreizehn umfassen** — sie muss nur in einem Zug
geschehen und ihren Grund nennen.*
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
| **`Doku/Fahrplan.md`** | **der Fahrplan: was eine Nummer hat, und was für 1.0 vorgemerkt ist.** *Seit dem 8. September 2026 ein eigenes Papier — vorher Abschnitt 10 des Projektstands* |
| Projektstand, Abschnitt 10 | **die Geschichte des Plans**: warum er neunmal gerückt ist, und was das jedes Mal gekostet hat. *Der Plan selbst steht dort nicht mehr* |
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

## Was eine Nummer bekommen hat

**Am 28. August 2026 sind dreizehn ausgearbeitete Punkte und zehn Zeilen aus
Teil II Runden zugeordnet worden; am 3. September 2026 kam Punkt 8 dazu — und
mit der eingeschobenen 0.21.0 eine Runde, die hier nie gestanden hat; am
4. September 2026 kam mit 0.21.1 eine zweite dazu, die ebenfalls nie hier
stand — und am selben Tag ist Punkt 10 (der Bildstreifen) als Teil von 0.22.0
fortgezogen und gebaut worden.**
Nach Regel 3 stehen sie damit **nicht mehr hier**,
sondern im Fahrplan — Projektstand, **Abschnitt 10a**, dort mit ihrer
vollständigen Ausarbeitung. *Diese Tabelle sagt nur, wohin sie gegangen sind;
sie ist ein Wegweiser und kein zweiter Eintrag.*

> **DIE NUMMERN IN DIESER TABELLE SIND DIE VON HEUTE UND NICHT DIE VON DAMALS.**
> Am 3. September 2026 ist alles hinter 0.19.4 um eine Stelle gerückt, weil
> Punkt 8 die 0.20.0 bekommen hat. *Wo eine Zeile eine frühere Nummer trug,
> steht sie daneben — gestrichen wird keine (Stolperstein 201).*
>
> **UND NOCH AM SELBEN TAG EIN ZWEITES MAL — MIT EINER NEUEN REGEL DAHINTER.**
> Die eingeschobene 0.21.0 („Vor dem Test schätzt man …") hat alles dahinter
> ein weiteres Mal gerückt, **und diesmal nicht bloß um eins: zwischen zwei
> geplanten Runden bleibt ab jetzt eine Nummer frei.** *Der Fahrplan ist seit
> 0.12.0 achtmal gerückt worden, jedes Mal um den ganzen Rest, weil kein Platz
> für eine eingeschobene Runde war. Eine freie Nummer je Zwischenraum lässt die
> nächste dort Platz finden, ohne dass sich dahinter etwas bewegt.* **Die Regel
> und der neue Fahrplan stehen im Projektstand, Abschnitt 10.**
>
> **UND AM 5. SEPTEMBER 2026 EIN DRITTES MAL — diesmal NACH VORN, und diesmal
> ohne Einschub.** Der Betreiber hat die Mehrsprachigkeit von 0.28.0 auf 0.24.0
> vorgezogen. *Die wählbare Bildablage (Punkte 5 und 6) steht seither auf
> 0.26.0, die Bereinigung auf 0.28.0, und zwischen je zwei geplanten Runden
> bleibt weiter eine Nummer frei; 0.30.0 und die 1.0 sind nicht gerückt.*
> **Die Gründe und der Preis stehen im Projektstand, Abschnitt 10** — die
> Ausarbeitung der Mehrsprachigkeit in `Doku/Konzept_Mehrsprachigkeit_0_24_0.md`.

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
| **0.19.4** *PATCH* — **GEBAUT am 3. September 2026** | **Die Vorschaubilder werden zu klein gerechnet.** *Punkt 7 dieses Blatts, aufgefallen beim Messen zu 0.19.1 am 2. September 2026.* `thumb` war 400 px auf der **langen** Kante und wird ausschließlich mit `object-fit: cover` gezeigt — **wer einschneidet, braucht die kurze.** Gebaut ist die Ableitungsregel als **Kiste** aus kurzer Kante und Deckel (`thumb` 512/1280, `medium` unverändert), dazu die dritte Aufgabe für `bestandslauf.js`, die den Bestand bei jedem Start nachzieht. **Was gebaut wurde, steht im Änderungsprotokoll 0.19.4.** ***Zwei Zahlen der Ausarbeitung haben nicht getragen:*** *die Kachel ist nicht 313, sondern **299 CSS-px** breit, und es sind **1032** Bilder und nicht 1034.* ***Und zwei Dinge sind mit Begründung NICHT nachgezogen worden:*** *die Videokacheln (es gibt keine Vorlage mehr) und der Bestand an Kommentarbildern (`.cmt-img` ist 86 × 86 px — der alte `thumb` deckte das bei dPR 1 und 2 ganz).* |
| **0.20.0** *MINOR* — **GEBAUT am 3. September 2026** | **Alte Sicherungen aufräumen — ohne Shell.** *Punkt 8 dieses Blatts, aufgefallen im Betrieb am 2. September 2026; am selben Tag zugeordnet — er hat als erster Punkt seit dem 28. August wieder eine Nummer bekommen, und alles dahinter ist um eine Stelle gerückt.* Gebaut ist die Regel aus **zwei** Bedingungen (*nicht unter den N jüngsten **und** älter als X Tage*), die **Vorschau** vor dem Löschen, der Schalter auf **AUS**, ein Knopf hinter der zweiten Bestätigung, ein **zweiter, ausdrücklicher Weg** für die Kopien von vor dem Schlüsselwechsel, eine **zwanzigste Karte** und eine Zeile im Sicherheitsprotokoll je entfernter Kopie. **Was gebaut wurde, steht im Änderungsprotokoll 0.20.0.** *Alle fünf offenen Entscheidungen sind beantwortet — jede mit ihrer Begründung.* ***Zwei Zahlen der Ausarbeitung haben nicht getragen:*** *`MERKMALE` steht bei **vierzehn** und nicht bei dreizehn, und die Zeile über die Routenzahl in Abschnitt 11 des Projektstands war zwei Runden alt — beides ist berichtigt.* ***Und eine Angabe ist eine Entscheidung geworden:*** *„mit der Zahl der entfernten Kopien" ins Protokoll heißt **eine Zeile je Kopie** — eine Spalte für eine Zahl gibt es dort nicht, und die Runde ist ausdrücklich keine Datenbankstufe.* |
| **0.21.0** *MINOR, Schema* — **GEBAUT am 4. September 2026** | **„Vor dem Test schätzt man, nach dem Test bewertet man" — der zweite Sternkasten.** *Nichts aus diesem Blatt: der Punkt ist am 3. September 2026 aus dem Betrieb gekommen und noch am selben Tag als Konzeptpapier (`Doku/Konzept_Potenzial.md`) und als eingeschobene Runde gebaut worden — er hat hier nie gestanden.* Gebaut sind: die Spalte `rating_criteria.phase` (**neunter Migrationsblock**, Austauschformat **13**), zwei Durchschnitte, die einander **baulich** nicht berühren, eine **einundzwanzigste Karte**, zwei Sortiereinträge, das **zwölfte Vokabelwort**, das **×** an der Sternzeile statt des Kopfknopfs — und `DELETE /api/items/:id/ratings` **fällt** (`F_ROUTEN` 71 → 70). **Was gebaut wurde, steht im Änderungsprotokoll 0.21.0.** ***Und eine Regel für den Fahrplan ist dabei entstanden:*** *zwischen zwei geplanten Runden bleibt ab jetzt eine Nummer frei — der Fahrplan ist seit 0.12.0 achtmal gerückt, und jedes Mal um den ganzen Rest.* |
| **0.21.1** *PATCH* — **GEBAUT am 4. September 2026** | **„Die Sortierung sagt, wonach du fragst" — die Sortierung gibt den Statusfilter vor.** *Nichts aus diesem Blatt, und er ist auch **nie** hier gewesen: der Punkt kam am 4. September 2026 aus dem Rundlauf von Hand nach 0.21.0 und ist unmittelbar in den Auftrag gegangen.* **Er steht hier trotzdem — diese Tabelle ist der Wegweiser, und ein Punkt, der den Umweg nicht genommen hat, gehört mit genau diesem Vermerk hinein.** Gebaut ist: `rating_*` gibt „Getestet" vor, `potenzial_*` „Ungetestet", **jede andere Sortierung fasst den Filter nicht an**; die **Handwahl** und eine angewandte **gespeicherte Ansicht** schlagen die Vorgabe und halten über einen Wechsel der Sortierung hinweg; der **Rücksetzer** ist der Weg zurück; die Ableitung wird **nicht gespeichert** und **nicht mitgezählt**, sondern **in Worten gesagt**. **Was gebaut wurde, steht im Änderungsprotokoll 0.21.1.** ***Der Fahrplan rückt dadurch nicht*** — *0.21.1 ist eine PATCH-Zahl hinter einer gebauten Runde.* ***Und ein Befund aus dem Bauen:*** *wer bei „Potenzial" auf „Alles anzeigen" klickte, fand nicht mehr in die Automatik zurück — `filterZahl()` verglich gegen `all`, zählte null, und der Rücksetzer stand nicht da. Gezählt wird seither gegen die **Ruhestellung** (Stolperstein 312).* ***Der Rundlauf hat sonst nichts ergeben*** — *kein zweiter Befund, kein Fehler, kein Wunsch.* |
| **0.22.0** *MINOR* *(war 0.20.0, dann 0.21.0)* — **GEBAUT am 4. September 2026** | **„Die Oberfläche wird ruhiger, und sie redet Deutsch"** — aus dem Betrieb am 30. August 2026, dazu **Punkt 10 dieses Blatts** (der Bildstreifen nutzt die Breite, und seine Größe ist eine Einstellung), am 4. September 2026 zugeordnet und am selben Tag gebaut. *Was gebaut wurde, steht im Änderungsprotokoll 0.22.0; die Gestaltungs- und Sprachregeln der Runde stehen im Projektstand, Abschnitt 5.6.* |
| **0.22.1** *PATCH* — **GEBAUT am 5. September 2026** | **„Der Ausschnitt bedient sich wie ein Ausschnitt, und die Kopfzahl steht einmal da."** *Nichts aus diesem Blatt, und die drei Befunde sind auch **nie** hier gewesen: sie kamen am 5. September 2026 aus dem Rundlauf von Hand nach 0.22.0 und sind unmittelbar in den Auftrag gegangen — dieselbe Herkunft wie 0.21.1 nach 0.21.0.* **Sie stehen hier trotzdem — diese Tabelle ist der Wegweiser, und ein Punkt, der den Umweg nicht genommen hat, gehört mit genau diesem Vermerk hinein.** Gebaut ist: fünf Gesten und acht Griffe am Bildausschnitt (die gegenüberliegende Ecke bzw. Kante bleibt liegen, der Zeiger sagt es vorher); die Kopfzahl steht nur noch einmal im Kopf und sagt, dass sie über **alle** Benutzer geht; und an einem ungetesteten Eintrag gibt es den Bewertungskasten nicht mehr — der Server weist eine Bewertung dort ebenfalls ab, `value: 0` bleibt offen. **Was gebaut wurde, steht im Änderungsprotokoll 0.22.1; die Regeln G9 bis G11 im Projektstand, Abschnitt 5.6.** ***Sieben Entscheidungen sind vor dem Bauen gefallen (E1 bis E7), sechs nach Empfehlung — E2 nicht: sie nimmt zu den vier Ecken auch die vier Kanten.*** ***Und ein Befund aus dem Bauen:*** *der Prüfstand zählt die Rückbauten, und die Zahl stand noch auf 635 — der erste Gegenprobenlauf hat deshalb in jedem Durchgang eine falsche rote Zeile mitgezählt und ist verworfen worden.* |
| **0.24.0** *MINOR* — **GEBAUT am 6. September 2026** | **„Das Deutsche wandert in eine eigene Datei“ — Stufe 1 der Mehrsprachigkeit.** *Nichts aus diesem Blatt: die Runde stand seit dem 4. September 2026 im Fahrplan, und ihre beiden Befunde am hellen Schema kamen am 5. September 2026 aus dem Betrieb am Wirt — mit Bild — unmittelbar in den Auftrag.* **Sie stehen hier trotzdem — diese Tabelle ist der Wegweiser, und ein Punkt, der den Umweg nicht genommen hat, gehört mit genau diesem Vermerk hinein.** Gebaut ist: alle Texte der Oberfläche in `public/sprachen/de.json` (1190 Schlüssel, **kein Wort anders**); die Zeitleiste im hellen Schema mit eigenen Farben (1,54 · 2,13 · 4,62 statt 1,02 · 1,24 · 3,46); „Weitere Filter“ als Umschalter „Tags“ mit Zahl, rechts in der Kategoriezeile. **Was gebaut wurde, steht im Änderungsprotokoll 0.24.0; die Regel S8 im Projektstand, Abschnitt 5.6.** ***Neun Altlasten sind dabei aufgefallen und ausdrücklich NICHT behoben worden:*** *Sätze aus `auth.js` und die fünf Briefe aus `mail.js` tragen Wörter, die das Wörterbuch aus 0.22.0 vom Bildschirm genommen hat — „Zugang“, „Rücksetzlink“, „Verwaltungsbereich“, „Kasten“, „liegen“. Der Bildschirmtext-Wächter sieht sie zum ersten Mal, weil sie vorher an Stellen standen, die er nicht las. Sie stehen namentlich im Prüfstand; ihre Berichtigung ist eine eigene Runde wert, denn die Abnahme dieser hier hieß „kein Wort anders“.* ***Und ein Befund aus dem Bauen:*** *elf Tabellen auf Modulebene standen nach dem Umzug für immer auf ⟦…⟧ — sie werden ausgewertet, sobald der Browser die Datei liest, und die Sprachdatei kommt erst danach.* |
| **0.24.1** *PATCH, Datenbankstufe* — **GEBAUT am 7. September 2026** | **„Der Quelltext spricht Englisch".** *Nichts aus diesem Blatt: die Runde ist am 6. September 2026 vom Betreiber eingeschoben worden, unmittelbar nach dem Einspielen von 0.24.0 — sie hat hier nie gestanden.* **Sie steht trotzdem hier — diese Tabelle ist der Wegweiser, und ein Punkt, der den Umweg nicht genommen hat, gehört mit genau diesem Vermerk hinein.** Gebaut ist: jeder Name im Code englisch — Bezeichner, Schlüssel, ids, Klassen, Stilblattvariablen, Adressen, Dateinamen, Umgebungsvariablen — und die Datenbank mit sechs Tabellen, sechsundzwanzig Spalten und fünfundsiebzig Werten; sechs Wächter, jeder mit seiner Gegenprobe. **Was gebaut wurde, steht im Änderungsprotokoll 0.24.1; die Regel S9 im Projektstand, Abschnitt 5.6.** ***Drei Befunde aus dem Betrieb sind mitgefahren*** *(7. September 2026, mit Bildern gemeldet): die Vorschaukachel im Eintrag war mit der Maus nicht anzuklicken, ein Tag am Testtag hieß „t", und der zugeklappte Block „Links" zeigte die letzten Zeilen statt der ersten. **Keiner der drei stand in diesem Blatt** — sie sind unmittelbar in die laufende Runde gegangen, dieselbe Herkunft wie bei 0.21.1 und 0.22.1.* ***Und ein Befund aus dem Bauen:*** *die Restzahlen der mittleren Bauabschnitte waren zu gut. Gemessen wurde gegen das Wörterbuch, und das Wörterbuch kannte die Wörter nicht, die es hätte finden sollen — es ist von 716 auf 1186 Paare gewachsen, und die ehrliche Zahl danach lautet 110 statt 143.* |
| **0.24.2** *PATCH, Datenbankstufe* — **GEBAUT am 7. September 2026** | **„Die gespeicherten Formen ziehen mit".** *Nichts aus diesem Blatt: ein Befund aus dem Betrieb, gemeldet am 7. September 2026 unmittelbar nach dem Einspielen von 0.24.1. Die Migration jener Runde hat die SCHLÜSSEL in `settings` umbenannt, nicht die Feldnamen IN den gespeicherten Werten — die eigenen Suchmaschinen, der Mailzugang und der Beleg der letzten Testmail waren damit unsichtbar; verloren war nichts. Alles Weitere im Änderungsprotokoll 0.24.2; der Fahrplan ist dafür gerückt, die Sprachstufen sind 0.24.3 und 0.24.4.* |
| **0.24.3** *PATCH (benannte Abweichung), Datenbankstufe* — **GEBAUT am 8. September 2026** | **„Die zweite Sprache" — Stufe 2 der Mehrsprachigkeit.** *Nichts aus diesem Blatt: die Runde stand seit dem 5. September 2026 im Fahrplan, Auftrag `Doku/Auftrag_0.24.3.md` *(weggefallen — es liegt immer nur einer im Repo)*, zwölf Fragen vor der ersten Zeile entschieden.* **Was gebaut wurde, steht im Änderungsprotokoll 0.24.3.** *Mitgefahren sind neun Funde, die nie hier standen, weil sie niemandem aufgefallen waren: sieben stumme Fundstellen aus 0.24.1 — darunter `<html lang>`, das seither auf gar nichts stand — und zwei deutsche Wörter, die seit 0.24.0 fest im Quelltext saßen.* **Stufe 3 (Türkisch) ist damit 0.24.4.** |
| **0.27.0** *MINOR* *(war 0.21.0, dann 0.22.0, dann 0.24.0, dann 0.26.0, Nummer vorläufig)* | Die wählbare Bildablage — **Punkt 6 dieses Blatts**, zusammen mit den Ableitungen aus Punkt 5 |
| **0.31.0** *MINOR* *(war 0.19.0, dann 0.21.0, dann 0.22.0, dann 0.23.0, dann 0.26.0, dann 0.28.0, dann 0.30.0, Nummer vorläufig)* | Bereinigung — der Bruch |

**Was hier bleibt, bleibt aus einem Grund:** die **elf** Punkte unten haben
**keine Nummer**, weil die meisten von ihnen jetzt nicht gebaut werden sollen —
*mit inzwischen zwei Ausnahmen: **Punkt 11** ist seit dem 5. September 2026
empfohlen und wartet nur auf eine Runde — er ist am selben Tag dazugekommen, als
0.22.1 ihn ausdrücklich nicht mitgenommen hat —, und **Punkt 13** ist seit dem
7. September 2026 empfohlen: zwei Fehler aus dem Rundlauf mit 0.24.2, jeder mit
benannter Ursache. **Punkt 14 ist ein dritter Fall und der einzige seiner Art:**
ein Wunsch aus dem Betrieb, der **besprochen wird, bevor er festgelegt wird** —
weder empfohlen noch abgelehnt, sondern offen.* — zwei sind
`nicht empfohlen`, drei sind `später`, einer wartet auf die Runde, in der über
die Verfahren entschieden wird, **und einer ist am 3. September 2026
dazugekommen: Punkt 9, die gepackte Sicherung** — *sein Kern ist gemessen und
trägt nicht, sein kleinster Teil ist empfohlen.* *Punkt 4 ist am 1. September 2026
dazugekommen: er ist der Teil von Punkt 1, den 0.18.0 mit Begründung liegen
gelassen hat.* *Punkt 5 ist am selben Tag dazugekommen: er ist der Teil von
Punkt 15, den 0.19.0 liegen lässt — **und sein Grund ist ein anderer als
vorher.*** *Ein Sammelblatt, in dem nur noch das Verworfene
steht, sieht mager aus. Es ist trotzdem der richtige Zustand: alles Übrige ist
entschieden und hat seinen Ort.*

> **PUNKT 10 IST INZWISCHEN GEBAUT.** Er ist am 4. September 2026 in die
> Runde 0.22.0 aufgenommen und am selben Tag gebaut worden: der Bildstreifen
> steht auf jedem Schirm als Raster, und seine Mindestgröße ist eine
> persönliche Einstellung in fünf Stufen (60 bis 150 px, Vorgabe 80). *Nach
> Regel 2 steht er damit nicht mehr hier* — was gebaut wurde, steht im
> Änderungsprotokoll 0.22.0, was davon als Regel gilt, im Projektstand in
> Abschnitt 5.6 (Regel G7).

> **PUNKT 8 IST INZWISCHEN GEBAUT.** Er hat am 3. September 2026 die 0.20.0
> bekommen und ist am selben Tag gebaut worden — *ein Punkt wandert von hier in
> den Fahrplan und von dort in ein Änderungsprotokoll, nie zurück.* **Seine
> Ausarbeitung ist mit der Runde aus Abschnitt 10a herausgefallen**, weil sie
> gebaut ist; was von ihr als **Regel** weitergilt, steht im Projektstand in
> Abschnitt 5.3 und Abschnitt 11, und die Lehre daraus als **Stolperstein 299
> und 300**.

> **AM 3. SEPTEMBER 2026 SIND ZWEI PUNKTE VON HIER FORTGEZOGEN, und zwar auf
> zwei verschiedenen Wegen.** **Punkt 7** („Die Vorschaubilder werden zu klein
> gerechnet") ist **gebaut** — nach Regel 2 steht er damit nicht mehr hier,
> sondern im Änderungsprotokoll 0.19.4 und im Projektstand. **Punkt 8** („Alte
> Sicherungen aufräumen — ohne Shell") hat **eine Nummer bekommen** — nach
> Regel 3 steht er damit nicht mehr hier, sondern im Fahrplan, mit seiner
> vollständigen Ausarbeitung in Abschnitt 10a. *Ein Punkt wandert von hier in
> den Fahrplan und von dort in ein Änderungsprotokoll, nie zurück.*

---

> **NACHTRAG VOM 8. SEPTEMBER 2026, ABENDS: DREI DIESER PUNKTE SIND GEBAUT.**
> Die Punkte **15**, **16** und **17** sind mit **0.24.4** herausgegangen — als
> Befunde B4, B6 und B7 des Auftrags. *Nach Regel 3 tragen sie damit eine
> Nummer und stehen im Fahrplan; die Zeilen unten sagen nur noch, wohin sie
> gegangen sind.* **Von Punkt 16 bleibt Schritt 2 offen** (die Detailansicht im
> Papierkorb) — er steht im Fahrplan und nicht mehr hier.

## Teil I ist am 8. September 2026 leer geworden — und hier steht, wohin

**Alle fünfzehn ausgearbeiteten Punkte sind an diesem Tag entschieden worden**
— jeder hat entweder eine Nummer bekommen oder ist abgelehnt worden. **Nach
Regel 3 stehen sie damit nicht mehr hier, sondern in `Doku/Fahrplan.md`**,
mitsamt ihrer Ausarbeitung, im Anhang jenes Papiers.

***Diese Tafel ist ein Wegweiser und kein zweiter Eintrag.***

| Punkt | worum es ging | wohin |
|---|---|---|
| **11** | Drei kleine Anzeigefehler aus dem Augenschein zu 0.22.0 | **0.26.0** |
| **12** | Die Übersicht braucht beim Betreten rund eine Sekunde | **0.26.0** *(mit einer Messung davor)* |
| **13** | Zwei Fehler aus dem Rundlauf mit 0.24.2 | **0.26.0** |
| **18** | `ß` und `ss` sind für die Suche zwei Dinge | **0.26.0** — *0.24.4 hat die Faltung angefasst und diesen Fall AUSDRÜCKLICH ausgenommen: er betrifft Deutsch und nicht Türkisch, und eine Runde, die schon zwei Fehler an derselben Funktion repariert, nimmt keinen dritten mit* |
| **5** | Die Ableitungen auf WebP | **0.27.0** |
| **6** | Fotos aus der Zwischenablage — die Ablage wird wählbar | **0.27.0** |
| **14** | Blättern im Eintrag, vor und zurück | **0.28.0** — *die Form ist am 8. September 2026 entschieden: Pfeile in der Kopfzeile, `Bild auf`/`Bild ab`, keine Wischgeste* |
| **15** | Der leere Kasten zeigt ein Bildzeichen | **GEBAUT mit 0.24.4** *(Befund B4)* |
| **16** | Der Papierkorb — ein Zeichen als Quelltext, eine Zeile ohne Ordnung | **GEBAUT mit 0.24.4** *(Befund B6, Teil A und B — Schritt 2 bleibt offen)* |
| **17** | Kategorien und Tags lassen sich in ihrer Karte nicht anlegen | **GEBAUT mit 0.24.4** *(Befund B7, samt `POST /api/tags`)* |
| **1** | „Entfällt" am einzelnen Kriterium | **abgelehnt** |
| **2** | Zwei Einträge zu einem machen | **abgelehnt** |
| **3** | Der QR-Encoder für den zweiten Faktor | **abgelehnt** |
| **4** | Der Suchbereich als Häkchen | **abgelehnt** |
| **9** | Sicherungen gepackt ablegen | **abgelehnt** *(Teil (c) war schon mit 0.20.1 gebaut)* |

> **DIE ABGELEHNTEN SIND NICHT GELÖSCHT.** Sie stehen im Anhang des Fahrplans
> mit ihrer vollständigen Ausarbeitung. *Eine Ablehnung ohne die Überlegung, die
> zu ihr geführt hat, ist beim nächsten Mal keine Ablehnung mehr, sondern eine
> Erinnerungslücke — und dann wird derselbe Punkt in einem halben Jahr neu
> aufgeschrieben.*

> **WARUM DAS BLATT DIESE PUNKTE ÜBERHAUPT NOCH TRUG, ist der zweite Befund
> dieses Tages:** *acht von ihnen standen gar nicht in Teil I, sondern hinter
> Teil III — sie waren über die Runden hinten angehängt worden, weil das
> billiger war als das Einordnen.* **Ein Blatt mit drei Teilen, in dem der
> vierte Teil hinter dem dritten wächst, hat nicht mehr drei Teile.** Mit
> diesem Umzug ist es geheilt.

---

## Teil I nimmt wieder auf, sobald etwas dazukommt

**Er ist leer gewesen, hat am 8. September 2026 einen Punkt bekommen — und
derselbe Tag hat ihn auch entschieden: abgelehnt.** *Er steht unten weiter im
Wortlaut, als **Herleitung**: dort ist gemessen und überlegt worden, und eine
verworfene Idee ohne aufgeschriebene Begründung kommt in einem halben Jahr als
neue Idee zurück.* **Der Kasten am Kopf des Punktes sagt, was aus ihm geworden
ist** — dieselbe Form, in der der Fahrplan seine abgelehnten Punkte trägt.

---

## 19. Der fünfzehnte Vokabelplatz — „Mehrzahl nach einer Zahl"

> **ABGELEHNT AM 8. SEPTEMBER 2026.** *„Nein, es wird keine Felder für
> mehrzahlige Angaben auf Türkisch geben. 1 Öğe, 4 Öğe, beides geht. Dann ist
> die Vorgabe für beides halt zwei mal das gleiche."* **Der Betreiber hat die
> Frage im selben Zug beantwortet, in dem sie gestellt worden ist.**
>
> **WAS STATTDESSEN GEBAUT IST — und zwar noch in 0.24.4:** die fünf
> türkischen Vokabelpaare tragen **in beiden Formen dasselbe Wort** (`Öğe`,
> `Test günü`, `Rapor`, `Görev`, `Değerlendirme`). *Damit stehen die 30
> Zählerstellen richtig — „3 öğe", „15 öğe görünüyor" —, und das war die
> Mehrheit.* **Zwölf der 27 Sätze in `tr.json` sind dafür umgeschrieben
> worden**, damit sie sich mit der Einzahl lesen; die übrigen fünfzehn taten
> es schon. **Der Preis steht an fünf bloßen Beschriftungen** und ist benannt:
> „TEST GÜNÜ" über der Liste, wo türkisch „TEST GÜNLERİ" lieber stünde.
>
> **DIE REGEL DARAUS steht als TR-S4 im türkischen Wörterbuch** und gilt für
> jede weitere Sprache dieser Art: *eine Sprache, die nach einer Zahl die
> Einzahl will, löst es über die SÄTZE ihrer Datei und nicht über einen
> zweiten Mehrzahlplatz.* **Der Mechanismus bekommt keinen fünfzehnten Platz —
> nicht jetzt und nicht mit der nächsten Sprache.**

**Art: Fehler** *(in einer Sprache; in Deutsch und Englisch fällt er nicht
an)* · **Einschätzung von Claude war: empfohlen, aber nicht dringend** —
*abgelehnt vom Betreiber, siehe Kasten* · **Draußen üblich: ja** — *jede
Bibliothek für Mehrsprachigkeit trennt die Zählform von der Wortform*

### Woher

**Aus dem Augenschein zu 0.24.4**, am 8. September 2026, an der türkischen
Oberfläche auf dem Telefon. *Nicht gemeldet, sondern gesehen — und Türkisch
ist die erste Sprache, an der es überhaupt auffällt.*

### Was auffiel

**„3 Öğeler" steht in der Kopfzeile der Übersicht.** Türkisch setzt nach einer
Zahl die **Einzahl**: „3 öğe". *Das ist Regel **T2** des Konzepts (S3.1), und
sie gilt an dieser Stelle nicht.*

### Warum es keine Übersetzungsfrage ist

**Die vierzehn Vokabelwörter haben je EINEN Mehrzahlplatz** (`entryMany`,
`dayMany`, `reportMany`, `taskMany`, `ratingMany`), und der wird an **drei**
Orten gelesen:

| wo | was Türkisch will | gemessen am 8. September 2026 |
|---|---|---|
| hinter einem Zähler — `3 {entryMany}`, `vThing(n)` | die **Einzahl** | **30 Stellen** *(27 über die fünf Zähler-Helfer, drei über `countWord`)* |
| in einem Satz — `bütün {entryMany} için` | eher die **Mehrzahl** | **27 Schlüssel**, 30 Vorkommen |
| als bloße Beschriftung — „TEST GÜNLERİ" als Blockkopf | die **Mehrzahl** | **5 Stellen** im Code |

*Kein Wort dieser Welt macht beides richtig* — **und genau deshalb ist die
Antwort nicht ein besseres Wort, sondern eine Entscheidung darüber, welche der
drei Stellen die Datei bedient.* **Der Betreiber hat sie getroffen** (Kasten
oben): die Zählerstellen, und die Sätze werden ihr nachgeschrieben.

### Was zu bauen wäre

**Ein fünfzehnter Platz je Vokabelwort — „Mehrzahl nach einer Zahl".** In
Deutsch und Englisch trüge er dasselbe wie der vorhandene Mehrzahlplatz; in
Türkisch dasselbe wie der Einzahlplatz. *Dann ruft `vThing(n)` ihn, und alles
Übrige bleibt, wie es ist.*

**Was daran hängt:** die Karte „Vokabular" bekommt eine Spalte mehr (aus
vierzehn Feldern werden einundzwanzig — fünf Paare bekommen einen dritten),
der Server einen Schlüssel mehr je Wort, die Sprachdateien fünf Schlüssel
mehr, und der Prüfstand seine Zahl.

**Was NICHT daran hängt:** das Datenbankschema *(das Vokabular liegt als
Gebilde unter `settings.vocabulary`)*, das Austauschformat und die
Rechtezeilen.

### Einschätzung von Claude — und warum sie nicht getragen hat

**Sie lautete: empfohlen, aber es hat Zeit.** *Der Fehler stand an 30 Stellen
einer Sprache, die es seit einem Tag gibt, und er war ein Schönheitsfehler und
kein Missverständnis — „3 Öğeler" liest sich falsch, aber niemand versteht
etwas Falsches.*

> **WAS SIE ÜBERSEHEN HAT:** dass die 30 Zählerstellen sich **ohne** neues
> Feld richtig machen lassen — indem die Datei in beiden Formen dasselbe Wort
> trägt und die wenigen Sätze umgeschrieben werden, die dann falsch klängen.
> *Der Vorschlag rechnete mit einem Feld, weil der Mechanismus zwei Plätze
> anbietet; die Sprache braucht aber gar keine zwei Wörter, sondern nur einen
> Satzbau, der ohne das zweite auskommt.* **Der Betreiber hat genau das
> gesehen und die billigere Lösung genommen.**

> **UND EINE ALTERNATIVE, DIE AUSDRÜCKLICH VERWORFEN BLEIBT:** die Regel im
> Quelltext festzuschreiben („bei `tr` nimm die Einzahl"). *Damit stünde eine
> Sprachregel im Code statt in der Datei — genau das, was das ganze Vorhaben
> 0.24.0 bis 0.24.4 abgebaut hat.* **Die gebaute Lösung tut das Gegenteil:**
> die Datei sagt es, und der Code weiß von Türkisch nichts.

---


# Teil II — Gesammelt, ohne Ausarbeitung

**Zeilen, keine Punkte.** Wer eine davon bauen will, arbeitet sie vorher in die
sechs Überschriften aus Teil I aus — *und stellt dabei regelmäßig fest, dass
die Hälfte davon schon beantwortet ist.*

**Hinter jeder Zeile steht, welche Version sie nötig gemacht hat.** *Das ist
keine Zuordnung zu einer Runde, sondern Herkunft: eine Idee ohne Anlass ist
schwerer zu beurteilen als eine, bei der man weiß, was sie ausgelöst hat.*

## Achtzehn dieser Zeilen sind am 8. September 2026 entschieden worden

**Sie stehen unten weiter im Wortlaut** — *als Herleitung, denn dort steht, was
gemessen und überlegt worden ist.* **Was sie geworden sind, steht hier und
sonst nirgends.** *Diese Tafel ist ein Wegweiser und kein zweiter Eintrag; wer
wissen will, was gebaut wird, liest `Doku/Fahrplan.md`.*

| Zeile | wohin |
|---|---|
| **Eine tote Regel im Stilblatt** (`.rz-summe:first-of-type`) | **0.26.0** |
| **Der Hinweis an der Zeitleiste läuft auf schmalem Schirm hinaus** | **0.26.0** |
| **Die Anmeldungszeile läuft bei ~1024 Pixeln aus ihrer Karte** | **0.28.0** — *mit `@container`, als eigener Schritt* |
| **Die Erklärung unter dem Ablegefeld spricht von Dingen, die es am Telefon nicht gibt** | **0.28.0** |
| **Die Unteransichten haben keine Kopfzeile** | **0.28.0** — *und die Kopfzeile trägt zugleich die Pfeile zum Blättern* |
| **Eine Meldung kann die Vergleichsleiste verdecken** | **0.28.0** |
| **PWA-Manifest** *(stand in Teil III)* | **0.28.0** — *nur das Startbildzeichen, kein Arbeiter im Hintergrund, kein Zwischenspeicher* |
| **Prüfung der Wiederherstellung** | **0.29.0** |
| **Die abweichende Datei beim Namen nennen** | **0.29.0** — *als Zeile, die es nur im Fehlerfall gibt; kein Überfahrtext, weil es den am Telefon nicht gibt* |
| **Fälligkeitsdatum an Aufgaben** | **0.29.0** — *ein Datum ohne Uhrzeit, freiwillig, ohne Wecker; Schema und Austauschformat steigen mit* |
| **Eindeutigkeit der Adresse** | **0.29.0** — *partieller Index; er MUSS vor den Bruch* |
| **Das Wartefenster von zwölf Sekunden** | **0.30.0** |
| **Ein Papier, zwischen zwei Runden ohne Lauf geändert, macht den Zweig rot** | **0.30.0** |
| **`counterproof.js` verwechselt Abriss und Störung von außen** | **0.30.0** |
| **Ein echter Teillauf** | **0.34.0** — *er IST die Aufteilung in Module und nicht ein Filter davor.* **Am 8. September stand hier 0.32.0**; die Nummer ist am 10. September mit der Sprachrunde und dem Bruch gerückt — die Runde ist dieselbe geblieben |
| **Ein Versanddienst über HTTPS statt SMTP** | **abgelehnt** — *der Weg ist nicht das Problem. Was hilft, sind SPF, DKIM und DMARC; ein Weiterleitungsdienst bringt sie mit und spricht SMTP, das die Instanz kann. **0.28.0 erklärt es in der README.*** |
| **Die Tagwolke füllt den Platz unter „mehr" mit** | **abgelehnt** — *60 px je Zeile gegen den Umbau der ganzen Wolke* |
| **Ob ein Admin den zweiten Faktor verlangen kann** | **abgelehnt** — die Antwort ist nein |
| **Vorlagen für Einträge · Tags in Mengen · Druckstylesheet** | **abgelehnt** |
| **Erwähnungen im Kommentar** | **zurückgestellt mit Bedingung** — *sie braucht eine Entscheidung darüber, wer wen sehen darf, und einen Lesestand je Meldung. Das ist eine eigene Runde mit Schemaanteil, und die müsste vor 0.30.0 liegen* |
| **Eine Messung im echten Browser** | **zurückgestellt** — *entschieden wird es beim Auftrag von **0.34.0*** (am 8. September als 0.32.0 notiert, am 10. September mitgerückt) |
| **Die beiden Konzeptpapiere tragen „Anlage"** | **erledigt am 8. September 2026** |
| **Zwei Dateisätze tragen die Nummer 0.9.1** | **erledigt am 8. September 2026** — *das CHANGELOG sagt jetzt, welcher welcher ist* |

**Offen und ohne Nummer bleiben aus Teil II nur noch zwei:** *der angepinnte
Block, der zur Wand werden kann* **(beobachten, nicht bauen)** und *der eine
abgerissene Prüflauf von 0.9.1, der sich nie wiederholen ließ* **(wer ihn
wiedersieht, schreibt den Lauf vollständig mit)**.

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
> dritte steht in Teil II unter „Am Prüfstand"** — `counterproof.js` kann einen
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
  **MIT 0.22.0 ERLEDIGT:** die Textrunde hat jeden Satz am Bildschirm gegen die
  Sprachregel S1 gehalten (*ein Text sagt, was ist und was der Klick tut — nicht,
  warum es so gebaut wurde*); die zwölf Stellen sind dabei gestrichen oder in
  die README gezogen, und der Bildschirmtext-Wächter im Prüfstand hält die
  Verbotsliste seither fest. *Die Zeile bleibt als Herkunft stehen.*
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

- **Ein echter Teillauf** *(Gruppenfilter seit 0.8.10)*. `testbench.js` ist
  **ein** Ablauf; der Namensfilter filtert die **Ausgabe**, nicht die Arbeit.
  `counterproof.js` und `PORT_VERSATZ` mildern das, sie beheben es nicht.
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
- **`counterproof.js` kann einen Abriss nicht von einer Störung von außen
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
- **`testbench.js` in Dateien zerlegen.** Die Prüflagen bauen aufeinander auf;
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

---

## 20. Der vierte Abruf nach jedem Umbenennen

**Art: Idee** *(Sparsamkeit, kein Fehler)* · **Einschätzung von Claude: nicht
dringend** · **Herkunft: 0.24.5**

**`adminNew()` holt seit 0.24.5 vier Antworten statt drei** — Kategorien, Tags,
Kriterien **und `GET /api/settings`**, weil dort die Namenstafeln je Sprache
liegen und ein Umbenennen sie veraltet.

**Es ist ein Umlauf und kein Fehler**, und er läuft nur beim Admin und nur nach
einem Umbenennen, Anlegen, Löschen oder Sortieren. *Die Antwort ist allerdings
die größte, die die Installation kennt: sie trägt die Vokabeltafeln, die
Sprachen, die Suchanbieter und alles Übrige, und gebraucht werden davon zwei
Felder.*

**Zwei Wege wären denkbar, und beide haben einen Haken:**

* **Die Schreibwege könnten die Tafeln in ihrer Antwort mitliefern** (`PUT
  /api/criteria/:id` und die drei daneben). *Dann wäre der Umlauf weg — aber
  fünf Antworten trügen dieselbe Tafel, und wer eine sechste Route baut, muss
  daran denken.*
* **Die Karte könnte die Tafel örtlich nachziehen** — sie weiß ja, was sie
  geschrieben hat. *Das ist genau die Bauform, aus der D2 entstanden ist: ein
  Zustand im Browser, den jemand pflegen muss.* **Nicht ohne Not.**

> **WARUM ER TROTZDEM NICHT SOFORT WEGGEBAUT WORDEN IST:** die Antwort des
> Servers ist die eine Wahrheit über die Namen, und ein Umlauf, der sie holt,
> kann nicht veralten. *Erst messen, ob er stört — dann bauen.*

---

## 21. `express` 5 — die zwei letzten Meldungen von `npm audit`

**Art: Fehler** *(zwei Meldungen mittlerer Schwere, kein Schaden am Bestand)* ·
**Einschätzung von Claude: nicht dringend** · **Herkunft: 0.24.6**

**`npm audit` meldet zwei Lücken in `qs`**, dem Leser des Abfrageteils jeder
HTTP-Anfrage — *array-limit bypass* und *Denial of Service via Attacker
Controlled isBuffer*, beide **mittel**. Sie kommen über `express` herein.

**Sie lassen sich nicht mit einem Patch beheben.** `express@4.22.2` klemmt `qs`
auf `~6.15.1`, die reparierte Fassung ist `6.16.0` — außerhalb. **Der Weg
dorthin ist `express` 5**, und das ist ein Hauptversionssprung mit geänderter
Routen- und Fehlerbehandlung.

> **WAS 0.25.0 DAVON MITGENOMMEN HAT: nichts.** Der Beipack jener Runde
> (`npm audit fix`) hat `multer` 2.2.0 → 2.3.0, `nodemailer` 9.0.5 → 9.1.1,
> `sharp` 0.35.3 → 0.35.4 und `body-parser` 1.20.6 → 1.20.8 gehoben — alle
> innerhalb der schon deklarierten Bereiche — und `express` bei 4.22.2 stehen
> gelassen. **Der Schritt „Bekannte Lücken" ist seither grün** (Austrittscode
> 0): der Schalter steht auf `--audit-level=high`, und was hier übrig bleibt,
> ist „mittel". *Damit ist dieser Punkt der einzige, der nach 0.25.0 noch an
> `npm audit` hängt.*

**Erreichbar ist es vor der Anmeldung** — express liest den Abfrageteil jeder
Anfrage, auch der unangemeldeten. *Das ist der Grund, warum es überhaupt hier
steht und nicht als erledigt gilt.*

### Was zu bauen wäre

**`express` von 4 auf 5 heben**, mit einem eigenen Durchgang durch die
Routen: Fehlerbehandlung, `req.query` als Getter, der Wegfall einiger
Kurzformen. **Ein eigener Prüflauf danach ist Pflicht** — `F_ROUTES` zählt
seit 0.25.0 **72** Wege, und jeder einzelne ist betroffen.

---

## 22. Die Kachel „Vokabular" trägt auf einer frischen Installation den Rahmen

> **ENTSCHIEDEN AM 10. SEPTEMBER 2026 — ES BLEIBT, WIE ES BESTELLT IST.**
> *„Punkt 22 und 23 meinst du die roten rahmen? das finktioniert"* — der
> Betreiber sieht den Rahmen am Vokabular und hält ihn für richtig.
> **Die eine Zeile unten wird nicht gebaut**, und der Punkt ist damit zu.
>
> *Er steht weiter im Wortlaut, als **Herleitung**: dort ist ausgeführt, warum
> die Frage überhaupt gestellt wurde — und eine beantwortete Frage ohne
> aufgeschriebene Begründung kommt in einem halben Jahr als neue Frage
> zurück.* **Dieselbe Form wie bei Punkt 19.**

**Art: Frage an den Betreiber** *(kein Fehler — so ist es bestellt)* ·
**Einschätzung von Claude war: nachfragen, nicht bauen** · **Herkunft: 0.25.0**

**Die Vorgabe vor der Fragerunde lautete: „Rahmen an ALLEN Kacheln mit
fehlenden Zellen, auch am Vokabular."** *So ist es gebaut.* **An den drei
Namenskarten heißt „fehlende Zelle" etwas Handfestes:** dort steht dann der
Name einer **anderen Sprache**, und das ist wirklich Arbeit.

**Am Vokabular heißt es etwas anderes.** Die vierzehn Wörter fallen auf die
**Vorgabe der Sprachdatei** zurück — auf ein Wort in derselben Sprache, das
richtig ist und richtig bleibt. *Wer sein Vokabular nie anfasst, hat nichts
versäumt.* **Auf einer frischen Installation sind alle vierzehn in allen
Sprachen leer**, und die Kachel trägt damit von der ersten Minute an den roten
Rahmen und die Zahl 14 an jeder Pille.

> **DAS IST KEIN FEHLER, SONDERN EINE FRAGE.** Gebaut ist, was bestellt wurde;
> ob „nicht eingetragen" am Vokabular wirklich „fehlt" heißen soll, entscheidet
> der Betreiber. *Denkbar wäre auch: Punkt und Zahl bleiben, der Rahmen
> entfällt dort — die Zahl sagt, was fehlt, der Rahmen sagt „hier ist Arbeit",
> und das ist am Vokabular etwas anderes.*

### Was zu bauen wäre

**Eine Zeile**, wenn der Betreiber es anders will: in
`drawVocabularyLanguages()` fällt das `classList.toggle('gaps', …)` weg oder
bekommt eine andere Bedingung. **Punkt und Zahl bleiben davon unberührt.**

---

## 23. Die drei mitgelieferten Kriterien stehen auf Deutsch

> **DIESER PUNKT IST NICHT DER ROTE RAHMEN — und er bleibt offen.** Der
> Betreiber hat am 10. September 2026 nach *„Punkt 22 und 23"* zusammen
> gefragt und beide für denselben Befund gehalten. **Es sind zwei
> verschiedene:** Punkt 22 fragt, ob der Rahmen am Vokabular überhaupt
> stehen soll — *das ist entschieden, er bleibt.* **Hier geht es um den
> BESTAND und nicht um die Anzeige:** drei mitgelieferte Kriterien tragen
> `language = 'de'`, obwohl die Auslieferungssprache Englisch ist. *Die Anzeige
> ist wahr — der Bestand ist es, der nicht stimmt.* **Es ist eine kleine
> Runde und keine Zeile**, und deshalb steht der Punkt hier weiter.

**Art: Fehler** *(klein, sichtbar, seit je da)* · **Einschätzung von Claude:
klein und lohnend** · **Herkunft: 0.25.0**

**Eine frische Installation bekommt drei Kriterien mitgeliefert** — „Optische
Erscheinung", „Verarbeitungsqualität", „Funktionalität". *Sie stehen so in
`db.js` und sind deutsch.* **Die Auslieferungssprache ist seit 0.24.3
Englisch.**

**Bis 0.24.6 ist das niemandem aufgefallen**, weil niemand fragte, in welcher
Sprache ein Name geschrieben ist. **Seit 0.25.0 fragt jede Liste danach:** die
drei tragen `language = 'de'`, und ein englischer Leser bekommt sie mit dem
Vermerk *„(kein Eintrag in English — gezeigt wird Deutsch)"* und dem roten Rahmen an der
Kachel. *Die Anzeige ist wahr — der Bestand ist es, der nicht stimmt.*

### Was zu bauen wäre

**Zwei Wege, und der zweite ist der richtige:**

* **Die drei Namen englisch ausliefern** und die deutschen als Übersetzung
  daneben. *Dann bräuchte `db.js` die Sprachdateien — die liegen im Server, und
  diese Datei kennt sie nicht.*
* **Die Grundausstattung wandert dorthin, wo die Sprachen liegen.** Der Server
  legt sie beim ersten Start an, in der Auslieferungssprache, mit den
  Übersetzungen aus den vorhandenen Dateien. **Das ist eine kleine Runde und
  keine Zeile.**

> **NICHTS DARAN IST DRINGEND:** wer die drei umbenennt, hat den Punkt für sich
> erledigt — und die meisten tun das ohnehin.

---

## 24. Die Sprachdurchsicht — drei Berichte über drei Dateien

**Art: gemischt** *(harte Fehler, Fragen an die Hausstimme und zwei falsche
Diagnosen in einem)* · **Einschätzung von Claude: die Fehler bauen, den Rest
erst entscheiden** · **Herkunft: 0.25.1** · **Draußen üblich: ja** —
*Übersetzungen gegenlesen zu lassen ist Handwerk*

**Der Betreiber hat am 10. September 2026 alle drei Sprachdateien durch ein
zweites Modell gegeben** — erst Türkisch, dann Englisch, dann das deutsche
Original — und die Berichte hierher gebracht. *Sie sind ausführlich und zum
größeren Teil brauchbar.* **Jede Behauptung daraus ist am Quelltext
nachgeprüft worden, und das Ergebnis zerfällt in vier Gruppen.**

### 1 · Zwei Diagnosen sind falsch — und beide Male aus demselben Grund

**Der Bericht sieht die Sprachdatei und nicht den Aufruf.**

**`login.stillValid`.** Der Bericht nennt das Deutsche „unlogisch formuliert"
(*„Wenn etwas betroffen ist, gilt es meist nicht weiter"*) und will
„unberührt — er gilt weiterhin". **Der Satz ist aber nicht zerbrochen, sondern
dreiteilig.** `public/app.js:1103`:

```js
${tH('login.yourLinkAffected')} <strong>${tH('login.not')}</strong> ${tH('login.stillValid')}
```

`login.not` ist „nicht" / „not" / „değil". **Am Bildschirm steht „Dein Link ist
davon NICHT betroffen — er gilt weiter."** Deutsch und Englisch sind richtig;
die vorgeschlagene Korrektur machte daraus „ist davon nicht **unberührt**" —
das Gegenteil.

> **IM TÜRKISCHEN IST DERSELBE SATZ TROTZDEM KAPUTT, und schlimmer, als der
> Bericht sagt.** Türkisch verneint mit einem **Suffix im Verb**, nicht mit
> einem eigenen Wort davor: *„Bağlantın bundan **değil** etkilendi"* ist keine
> Verneinung, sondern Kauderwelsch. **Ein getauschtes Wort rettet das nicht** —
> der Satz muss im Quelltext anders geschnitten werden.
>
> **DAS IST DER ERSTE BELEGTE SCHADEN AUS DER SATZ-STÜCKELUNG**, die der dritte
> Bericht als Muster beschreibt. Damit ist dieser Punkt der stärkste aus allen
> drei Berichten — und er kommt nicht aus der Liste, sondern aus der Prüfung.

**Die türkischen Mehrzahlformen (`vocabulary.*Many`).** Der Bericht will
`Öğeler`, `Test günleri`, `Raporlar`. **Das ist keine Lücke, sondern die
Entscheidung des Betreibers vom 8. September 2026** — sie steht als Punkt 19
in diesem Blatt: *„Nein, es wird keine Felder für mehrzahlige Angaben auf
Türkisch geben. 1 Öğe, 4 Öğe, beides geht."* **Zwölf türkische Sätze sind
damals umgeschrieben worden**, damit sie sich mit der Einzahl lesen, und die
30 Zählerstellen stehen dadurch richtig. *Wer jetzt „Öğeler" einträgt, macht
aus „3 öğe" wieder „3 öğeler" und gewinnt dafür fünf bloße Beschriftungen.*
**Der Preis war benannt und ist bezahlt.**

### 2 · Was stimmt und ein Fehler ist

| Befund | nachgeprüft am |
|---|---|
| **`entry.tagQuote` hat kein schließendes Anführungszeichen** — und zwar **in allen drei Dateien**. Der Wert geht unverändert in ein `title` (`public/app.js:6843`); am Bildschirm steht „Tag „Werkzeug" | alle drei Sprachdateien |
| **`card.inDays` hat keine Mehrzahlform.** `{days} Tagen` → **„in 1 Tagen"**. Das Gegenstück `card.daysAgo` hat sie | `de.json` |
| **`login.linkValidMinutes` ebenso** — „noch 1 Minuten" | `de.json` |
| **36 deutsche Sätze öffnen mit `„` und schließen mit einem geraden `"`** *(der Bericht nannte drei)* | `de.json` |
| **65 türkische Stellen tragen das deutsche `„…"`.** Englisch benutzt bereits `“…”` — Türkisch ist die Ausnahme | `tr.json` |
| **„hap" für „Pille".** Das Original sagt wirklich *„ein Klick auf eine der drei **Pillen**"* — ein Hausbegriff; im Türkischen ist `hap` die **Arzneitablette** | `list.pillHint` |
| **„Note" bei 1 bis 5 Sternen.** `entry.grade` = „Note", `server.gradeRange` = „Die Note muss zwischen 1 und 5 liegen" — bei Schulnoten ist **1 die beste**, hier sind **5 Sterne das Beste**. Englisch heißt es längst „Score" | `de.json` |

### 3 · Was die Hausstimme angreift und keinen Fehler nennt

**„Das Haus verlassen", „Sache", „von Hand", „Sicherung geschrieben",
„Antworten darauf liest niemand", „Wer diesen Link hat, kommt herein",
„Standbild", „Wie das Gerät", „Zweiter Faktor".**

*Das sind bewusste Formulierungen dieses Projekts, in Deutsch **und** Englisch
gleich — der Bericht hält sie für Übersetzungsfehler, weil er sie einzeln
sieht.* **Ob sie bleiben, entscheidet der Betreiber.** Bei einigen ist der
Einwand trotzdem stark: *„Wie das Gerät"* heißt in keinem Betriebssystem so,
und *„Standbild"* stammt aus dem Fernsehschnitt.

**Ein Vorschlag steht gegen den Betreiber selbst:** der Bericht will
`card.backupWritten` als **„Yedek oluşturuldu"** und holt damit `yedek` zurück,
während der Betreiber am selben Tag *„immer nur das wort yedekleme"* gesagt
hat. **Der gebaute Stand „Yedekleme yapıldı" erfüllt beides** — *gemacht*
statt *geschrieben*, und mit dem Wort des Betreibers.

### 4 · Das Muster dahinter, und es ist der eigentliche Ertrag

**Viele Sätze sind in mehrere Schlüssel zersägt** und werden im Aufruf wieder
zusammengesetzt — `card.exportHint` + `card.exportContentHint`,
`login.yourLinkAffected` + `login.not` + `login.stillValid`, `entry.calcFirstAvg`
+ `entry.calcThenAvg`. **Im Deutschen geht das auf, im Englischen meistens
auch.** *In einer Sprache mit anderer Wortstellung und mit Suffixen statt
Wörtern geht es nicht auf* — und der türkische Verneinungssatz ist der Beleg,
dass es schon schiefgegangen ist.

### Was davon gebaut ist — und was offen bleibt

> **DIE HARTEN FEHLER SIND WEG, GEBAUT AM 10. SEPTEMBER 2026 ALS 0.25.4.**
> *„warum wurde das nicht einfach umgesetzt ‚Der türkische
> Verneinungssatz'?"* — die Frage des Betreibers war berechtigt: **ein Satz,
> der das Gegenteil dessen sagt, was dastehen soll, ist ein Fehler und keine
> Geschmacksfrage.** Er hatte hier nichts zu suchen. *Was daraus geworden ist,
> steht im Änderungsprotokoll 0.25.4 und im Projektstand — und nach Regel 2
> nicht mehr hier.*
>
> **Mitgegangen sind die beiden anderen harten Fehler derselben Gruppe:** das
> nie geschlossene Anführungszeichen an `entry.tagQuote` und die zwei
> Zählsätze ohne Einzahlform.

**Offen bleibt die eine Stufe, die dem Betreiber gehört:** **die Hausstimme**
*(Gruppe 3)* und **die zersägten Sätze** *(Gruppe 4)* — eine eigene Runde mit
**Fragetafel**. *Rund fünfzehn Entscheidungen, die nur der Betreiber treffen
kann, und jede davon ändert alle drei Dateien zugleich.* **Die zwei falschen
Diagnosen** *(Gruppe 1)* bleiben ebenfalls aufgeschrieben — nicht als Arbeit,
sondern damit derselbe Bericht nicht ein zweites Mal geglaubt wird.

> **SIE HAT EINE NUMMER: 0.31.0 — „Die Sprachen werden gegengelesen"**, am
> 10. September 2026 in den Fahrplan gesetzt. **Unmittelbar vor dem Bruch**,
> weil sie die letzte Runde ist, die den Wortlaut der Oberfläche und den
> Satzbau in `public/app.js` frei umbauen darf — *jede Runde davor legt neue
> Sätze an, und jeder davon nach dem Muster, das diese abschafft.* **Der Bruch
> rückt dafür ein drittes Mal, auf 0.33.0** — der Betreiber hat erst die
> Runde entschieden (*„bruch ist leider zerbrochen"*) und dann die Zahl
> (*„Bruch mal auf die 0.33.0 legen.. ist auch ne schöne zahl"*); **0.32.0
> bleibt frei, als letzter Platz vor dem Bruch.** *Die reservierte 0.40.0 bleibt
> unangetastet.*
