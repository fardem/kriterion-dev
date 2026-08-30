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
| **0.13.0** *MINOR* — **GEBAUT am 28. August 2026** | Der Proxy ist ein Ja/Nein · gescheiterte Anmeldungen sichtbar machen · gelöschte Zugänge und der Weg zurück · der Teilexport mit zweitem Faktor · die Filterleiste (229 → 154 px, gemessen) · die Kategoriezeile lernt die Mehrzahl. **Was gebaut wurde, steht im Änderungsprotokoll 0.13.0; was daraus herausgenommen wurde, in Abschnitt 10a.** *Herausgenommen sind die Adressliste (eigene Runde) und die stdout-Zeile für CrowdSec (verworfen, solange die Adressliste fehlt).* |
| **0.14.0** *MINOR, Schema* — **GEBAUT am 29. August 2026** | Aus „abgelehnt" wird eine Entscheidung: Datum, Grund und Verfasser, dazu die Klemme am Grund. **Was gebaut wurde, steht im Änderungsprotokoll 0.14.0.** *Mitgefahren sind zwei Punkte aus dem Betrieb, die nie hier standen: der kaputte fremde Cookiewert und die Ausrichtung der Sternreihen in der Kriterienliste.* |
| **0.15.0** *MINOR* — **GEBAUT am 29. August 2026** | **Nichts aus diesem Blatt.** Zwei Befunde aus dem Betrieb, beide an der Ablehnung: der fehlende Filter für „abgelehnt" und die Begründung, die nicht zur Ruhe kam. **Was gebaut wurde, steht im Änderungsprotokoll 0.15.0.** *Die Runde stand nie im Fahrplan; sie hat ihre Nummer bekommen, weil zwei ihrer drei Punkte Funktionen bringen — **und alle folgenden Runden sind dadurch um eine Stelle gerückt.*** |
| **0.15.1** *PATCH* — **GEBAUT am 29. August 2026** | **Nichts aus diesem Blatt.** Ein Befund aus dem Betrieb: `hidden` wirkte im Stilblatt nicht, weil jede eigene `display`-Regel die Vorgabe des Browsers schlägt — Aussage und Eingabefeld standen an einem *nicht* abgelehnten Eintrag da. **Was gebaut wurde, steht im Änderungsprotokoll 0.15.1.** *Dazu die Regel, wann das Feld überhaupt dasteht: abgelehnt und kein Grund.* |
| **0.16.0** *MINOR, Schema* *(war 0.15.0)* — **GEBAUT am 29. August 2026** | Der Systembereich bekommt Abschnitte · zwei Funktionen sind zu groß · die Gewichtung erklärt sich nicht · die Glocke · Kennzahlen: Version und Verfahren · Import und Export in einer Kachel · der Zähler „Offen 7" · **Löschen in der Zoomansicht** *(aus dem Betrieb, 28.08.2026 — nicht aus dem Sammelblatt)*. **Was gebaut wurde, steht im Änderungsprotokoll 0.16.0.** *Zwei Abweichungen: **die „Vorschau der Rangfolge" ist NICHT mitgefahren** — sie ist der einzige Teil mit eigener Ansicht und eigenem Endpunkt und war im Auftrag als erster Kandidat des Schnitts benannt; sie steht weiter in Abschnitt 10 des Projektstands. Und **die Runde ist doch eine Datenbankstufe geworden**: `ratings` trug keinen Zeitpunkt, und ohne ihn kann die Glocke über fremde Bewertungen nichts sagen — siebter Migrationsblock, auf ausdrückliche Anweisung.* **Mitgefahren ist der Werkzeugbefund am Rückbaufilter aus Teil II.** |
| **0.17.0** *MINOR* — **GEBAUT am 30. August 2026** | **Was dasteht, und was nicht dasteht** — neun Befunde aus **einem** Rundlauf von Hand am 30. August 2026, keiner davon aus diesem Blatt und keiner aus dem Fahrplan. Die Kriterienliste zerfällt bei genau **einem** Zugang; zwei Erklärtexte verlassen die Oberfläche; die Glockentafel sagt, **was** neu ist; drei Anzeigefehler vom echten Gerät; die Vergleichszahl ohne Gewichtung — **und die Glocke ersetzt die Pille „Neu seit …", die dafür gestrichen wird.** *Die Nummer ist MINOR, weil die Glockentafel eine Funktion bringt; der Auftrag ging als 0.16.1 in die Besprechung.* **Was gebaut wurde, steht im Änderungsprotokoll 0.17.0.** *Alle neun Punkte sind gebaut; nichts ist hierher zurückgekommen. **Eine Abweichung:** die Tafel nennt die Namen nur zu den **Kommentaren** — „Eine Glocke, die nennt, WER bewertet hat" steht in Teil III dieses Blatts als geprüft und verworfen, und die gebaute Fassung hält sich daran. **Und ein zehnter Befund ist beim Bauen dazugekommen und gleich mitgefahren:** der Erklärkasten verwies auf eine Spalte, die es bei einem einzigen Zugang nicht gibt — derselbe blinde Fleck wie Punkt 1, eine Ansicht weiter.* |
| **0.18.0** *MINOR* *(war 0.17.0)* | Die Suche schärfen — Trefferkontext, Suchbereich, Hervorhebung |
| **0.19.0** *MINOR* *(war 0.18.0)* | Die Bildablage: Original und zwei Ableitungen |

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
  *(Claude: eine eigene kleine Runde wert, aber keine eilige. Zwölf Sätze in
  einer Datei, jeder einzeln zu entscheiden — und die Hälfte davon sind
  Grenzfälle, über die man reden muss.)*
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
  **NEU BEURTEILT AM 29. AUGUST 2026, nach dem Bau von 0.16.0.** Die alte
  Absage lautete *„die Anlage hat keine Benachrichtigungen"* — **sie hat jetzt
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
  und die Anlage zeigte im Browser das Gegenteil.* **Die Frage, die offen
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
  400 Pakete, kein Ablaufdatum. *Siehe Fahrplan 0.16.0, „Zwei Funktionen sind zu groß geworden" — die Antwort auf große
  Funktionen sind kleinere Funktionen.*
- **PWA-Manifest.** Für eine Anlage im eigenen Netz ohne Offline-Anspruch ist
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
- **Kriteriengruppen je Kategorie.** Die Alternative zu „eine Anlage ist ein
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
  *Draußen fasst niemand das Original an.* Siehe Fahrplan 0.18.0, „Die Bildablage" (a).
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
