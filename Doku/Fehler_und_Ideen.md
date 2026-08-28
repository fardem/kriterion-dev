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

## Was am 28. August 2026 eine Nummer bekommen hat

**Dreizehn ausgearbeitete Punkte und zehn Zeilen aus Teil II sind an diesem Tag
Runden zugeordnet worden.** Nach Regel 3 stehen sie damit **nicht mehr hier**,
sondern im Fahrplan — Projektstand, **Abschnitt 10a**, dort mit ihrer
vollständigen Ausarbeitung. *Diese Tabelle sagt nur, wohin sie gegangen sind;
sie ist ein Wegweiser und kein zweiter Eintrag.*

| Runde | Was daraus geworden ist |
|---|---|
| **0.12.3** *PATCH* — **GEBAUT am 28. August 2026** | Export durch den Arbeitsspeicher · nur zeichnen, was zu sehen ist · ein Kasten, eine Farbe · Speicherverbrauch · ⌀ und Anzahl · „offen" in der Kopfzeile · Kommentar ohne Rollen · Versionszeile · „mehr" frisst eine Zeile. **Was gebaut wurde, steht im Änderungsprotokoll 0.12.3; was daraus herausgenommen wurde, in Abschnitt 10a.** |
| **0.13.0** *MINOR* | Der Proxy ist ein Ja/Nein · gescheiterte Anmeldungen und CrowdSec · gelöschte Zugänge und der Weg zurück |
| **0.14.0** *MINOR, Schema* | Aus „abgelehnt" wird eine Entscheidung |
| **0.15.0** *MINOR* | Der Systembereich bekommt Abschnitte · zwei Funktionen sind zu groß · die Gewichtung erklärt sich nicht · die Glocke · Kennzahlen: Version und Verfahren · Import und Export in einer Kachel · der Zähler „Offen 7" · Vorschau der Rangfolge |
| **0.16.0** *MINOR* | Die Suche schärfen — Trefferkontext, Suchbereich, Hervorhebung |
| **0.17.0** *MINOR* | Die Bildablage: Original und zwei Ableitungen |

**Was hier bleibt, bleibt aus einem Grund:** die drei Punkte unten haben
**keine Nummer**, weil keiner von ihnen gebaut werden soll — zwei sind `nicht
empfohlen`, einer ist `später`. *Ein Sammelblatt, in dem nur noch das Verworfene
steht, sieht mager aus. Es ist trotzdem der richtige Zustand: alles Übrige ist
entschieden und hat seinen Ort.*

---

## Übersicht nach Art

| Art | Punkte in Teil I |
|---|---|
| **Fehler** | — *(der einzige, der Export, ist 0.12.3 geworden)* |
| **Verbesserung** | — |
| **Neue Funktion** | 1, 2, 3 |
| **Design** | — |

| Einschätzung | Punkte |
|---|---|
| **später** | 2 |
| **nicht empfohlen** | 1, 3 |

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

# Teil II — Gesammelt, ohne Ausarbeitung

**Zeilen, keine Punkte.** Wer eine davon bauen will, arbeitet sie vorher in die
sechs Überschriften aus Teil I aus — *und stellt dabei regelmäßig fest, dass
die Hälfte davon schon beantwortet ist.*

**Hinter jeder Zeile steht, welche Version sie nötig gemacht hat.** *Das ist
keine Zuordnung zu einer Runde, sondern Herkunft: eine Idee ohne Anlass ist
schwerer zu beurteilen als eine, bei der man weiß, was sie ausgelöst hat.*

### Aus dem Betrieb und aus den Runden

- **Dieselbe Tagwolke ist an zwei Stellen verschieden gebaut** *(0.12.3)*.
  Auf der Eintragsseite sitzt „mehr" in einer eigenen Kopfzeile (`.wolke-kopf`,
  `space-between`), in der Übersicht als Kind der Filterzeile mit
  `margin-left: auto`. **0.12.3 hat die Übersicht auf dasselbe Verhalten
  gebracht, nicht auf dieselbe Bauform** — Stolperstein 47, im Kleinen.
  *Zusammengeführt wurde bewusst nicht: die beiden Zeilen tragen Verschiedenes
  (die Filterzeile trägt Und/Oder und die Auswahl, die Kopfzeile nur eine
  Beschriftung), und eine gemeinsame Bauform müsste beides können.* **Solange
  beide dasselbe tun, ist es eine Doppelung und kein Fehler; sobald eine von
  beiden sich ändert, ist es einer.** *(Claude: später — eigene Runde, keine
  Beifracht. Später denkbar: `+7` statt „mehr", was voraussetzt, dass die
  überzähligen Tags weggeblendet statt beschnitten werden.)*
- **Prüfung der Wiederherstellung** *(0.8.70)*. Seit die Sicherung über
  `VACUUM INTO` der Hauptweg ist, gibt es eine Datei, die niemand je
  zurückgespielt hat — **eine Sicherung ohne Probe ist eine Vermutung.** Ein
  Weg, der eine Sicherungsdatei probeweise öffnet und den Bestand zählt, ohne
  die laufende Datenbank anzufassen. *(Claude: stark empfohlen)*
- **Die abweichende Datei beim Namen nennen** *(Fingerprint aus 0.8.10, akut
  mit 0.9.1)*. Der Fingerprint sagt heute nur, **dass** etwas abweicht, nicht
  **was**. Bei 0.9.1 hat sich dort eine Datei zu viel gezeigt (Stolperstein
  158), und der Handgriff dagegen steht bisher nur in der README. **Eine Zeile
  in der Karte „Anlage" würde ihn ersetzen.** *(Claude: empfohlen)*
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
  und **0.15.0 baut genau die.** *Wird die Glocke gebaut, gehört diese Zeile
  im selben Zug neu beurteilt und nicht stehengelassen; das Ziel der Meldung
  wäre dann da, und übrig bliebe allein die Frage, wer wen sehen darf.*
  *(Claude: weiterhin nicht empfohlen — aber die Begründung ist ab 0.15.0
  eine andere · Draußen üblich: Erwähnungen setzen überall eine
  Benachrichtigung voraus, nie umgekehrt)*


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
- **Ein Papier, das zwischen zwei Runden ohne Lauf geändert wird, kann den
  Prüfstand rot machen, ohne dass es jemand bemerkt** *(0.12.3)*. Der
  Sprachwächter sieht auch die Dokumente an. Ein Merge in `Fehler_und_Ideen.md`
  nach 0.12.2 brachte „Zeichenkette" statt „String" herein; der Branch war
  danach rot und niemand hat es gesehen, weil zwischen Merge und nächster Runde
  kein Lauf lag. *(Claude: empfohlen — der Prüflauf bei jedem Push gibt es seit
  0.8.10; hier hat er entweder nicht gegriffen oder niemand hat hingesehen. Das
  gehört nachgeprüft, bevor daraus eine neue Regel wird.)*

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
  Blättern — Fahrplan, 0.12.3, „Nur zeichnen, was zu sehen ist".*
- **Verschlüsselung je Benutzer.** „Ein Neubau, kein Anbau" — mit der Folge,
  die offen dokumentiert ist: **jeder Benutzer vertraut dem Betreiber mit
  allem.** Für eine selbstgehostete Anlage ist das die richtige Abwägung, und
  sie gehört in die README statt in den Quelltext.
- **Ein Framework im Frontend.** Kein Framework heißt: keine Build-Kette, keine
  400 Pakete, kein Ablaufdatum. *Siehe Fahrplan 0.15.0, „Zwei Funktionen sind zu groß geworden" — die Antwort auf große
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
- **Wortgrenzensuche statt Teilstring.** Siehe Fahrplan 0.16.0, „Die Suche schärfen" (d): In einem
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
  Zusage im Kartentext (*„die Anlage speichert beides nicht"*) und gegen den
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
  *Draußen fasst niemand das Original an.* Siehe Fahrplan 0.17.0, „Die Bildablage" (a).
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
  Zeitstempeln errechnen lässt.** Siehe Fahrplan 0.15.0, „Die Glocke" (f).
- **Eine Glocke, die nennt, WER bewertet hat.** Sie hebelte die Entscheidung
  aus, dass eine einzelne Bewertung anonym bleibt (`server.js:2202`, die Liste
  „Wer hat bewertet" ist nur für den Admin) — und zwar an der Stelle, an der es
  am wenigsten auffällt. **Die Zahl ja, der Name nie.**
- **Eine Glocke nur für den Desktop.** Was in `.mast-rest` steht, wandert auf
  dem Telefon von selbst ins Menü — *ein Markup, zwei Gestalten* (0.12.0). Eine
  Fassung nur für ein Gerät wäre eine Weiche nach Gerät, und genau die hat
  0.12.0 ausdrücklich vermieden.
- **Neuigkeiten und offene Aufgaben unter einem Zeichen.** Naheliegend, und aus
  zwei Gründen falsch: `GET /api/offen` hat **keinen Benutzerfilter** — die
  Liste ist gemeinsam, die Neuigkeiten sind persönlich —, und **eine Neuigkeit
  geht weg, wenn man sie liest, eine Aufgabe erst, wenn man sie erledigt.** Ein
  Punkt, der beides meint, geht nie ganz weg. *Draußen trennt es jeder:
  Instagram, Facebook, GitHub, Jira, Linear.* Siehe Fahrplan 0.15.0, „Die Glocke".
