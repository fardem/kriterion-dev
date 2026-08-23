# Änderungsprotokoll 0.8.60 — „Was ist offen, was ist neu"

**Rohstoff für die Dokumentenpflege.**

**0.8.60 — Fingerprint `ab68b523`**

Die nächste Runde des Stufenplans, und **keine Stufe des
Mehrbenutzerbetriebs** — der ist mit G4 bis auf H und I gebaut. Sie ist
ausdrücklich **keine Datenbankstufe**: kein `ALTER TABLE`, kein sechster
Migrationsblock, kein neuer Eintrag unter „Vorgemerkt für 1.0", keine neue
Formatnummer. Die Exportdatei bleibt bei **10**, `F_ROUTEN` bei **47**, und es
bleibt bei **fünf** markierten Migrationsblöcken.

**Was sich ändert, in einem Satz.** Zwei Dinge, die es längst gibt, werden
**auffindbar** — offene Aufgaben quer über alle Einträge, und was sich seit dem
letzten Besuch getan hat.

**Die tragende Regel der Runde: keine zweite Wahrheit.** Die Übersicht sortiert
weiter nach `updated_at`, für alle gleich. Beide Neuerungen **filtern**, sie
sortieren nichts um, und beide sind **persönlich** wie der Favorit.

**Der vierte Punkt hat mit den ersten dreien nichts zu tun**: eine
Sprachbereinigung. Deutsch bleibt die Sprache, Fachbegriffe werden aber nicht
zwanghaft eingedeutscht — es steht das Wort, das ein deutschsprachiger
Entwickler im Gespräch benutzen würde.

**Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses als
Empfehlung, nicht als Pflicht.** Es ist keine Datenbankstufe; ein Downgrade ist
wieder eine reine Dateikopie. **Das ist seit 0.8.30 zum ersten Mal wieder so
und gehört ausdrücklich gesagt.**

---

## 1. Was gebaut wurde, je Datei

Zwei Commits, dazwischen der **Haltepunkt** nach Punkt 2.

### `server.js` (+91/−34 Zeilen)

- **Neu: `GET /api/offen`.** Eine **lesende** Route ohne Wächter — wer
  angemeldet ist, sieht die Kommentare ohnehin in jedem Eintrag. Sie steht
  deshalb in keiner Liste schreibender Routen.
  Die Abfrage ist eine: `SELECT … FROM comments c JOIN items i ON i.id =
  c.item_id WHERE c.kind = 'task' ORDER BY i.updated_at DESC, c.id`. Geliefert
  wird je Zeile `id`, `text`, `created_at`, `item {id, title}`, `mine` und
  `verfasser`; die Verfassernummer geht nicht hinaus.
- **`PERSOENLICHE_SCHLUESSEL` bekommt `zuletztGesehen`** — der siebte
  Schlüssel. Dazu der Ableiter `zuletztGesehen(benutzerId)` mit Vorgabe `null`,
  die Zeile in `GET /api/settings` und der Zweig in `PUT /api/settings`.
- **Der Merkzeitpunkt kommt von der Serveruhr**, nicht aus dem Ruf:
  `datetime('now', '-1 second')`. Was der Aufrufer schickt, ist ein Signal.
- Sonst: die Umbenennungen aus Punkt 4 (`setzeHeader`, `setzeBildHeader`,
  `rangeAus`, `bildeFingerprint`, `FINGERPRINT`, Feld `fingerprint` in
  `/api/stats`).

### `public/app.js` (+252/−12 Zeilen)

- **Neu: `renderOffen()`** samt Wegweiser `#/offen`. Gruppiert nach Eintrag,
  Titel und Zeile führen in den Eintrag, Verfasser und Datum an der Zeile
  (Verfasser erst ab zwei Zugängen). Umschalter „meine / alle" ab zwei
  Zugängen, Vorgabestellung „alle", Ansichtszustand im Speicher.
- **Der Erledigt-Haken** steht nur, wo er gedrückt werden darf (`mine ||
  ADMIN`), schickt die Art **ausdrücklich** (`done` bzw. `task`) und lässt die
  Zeile durchgestrichen stehen.
- **Neuer Knopf in der Kopfzeile**, neben dem Zahnrad, samt eigenem Zeichen.
- **Neu: der Filter `neu`** in `state.filters` und eine Zeile in
  `visibleItems()`. `visibleItems()` nimmt jetzt einen Filter als Parameter —
  die Zahl am Knopf ist die Vorschau auf den eigenen Klick und braucht keinen
  zweiten Rechenweg.
- **Neu: `ZULETZT_GESEHEN`**, einmal beim Laden der Seite gelesen und dann
  stehengelassen; **`merkeGesehen()`** beim Verlassen der Übersicht, gesteuert
  über `LETZTE_ANSICHT` in `route()`.
- **Neu: `fmtTagKurz()`** für die Beschriftung „Neu seit 19.08.".

### `public/style.css` (+42/−0 Zeilen)

`.off-gruppe`, `.off-titel`, `.off-zeile`, `.off-text`, `.off-wann`,
`.off-haken` und der Durchstrich. **Keine neue Farbe:** die Gruppe trägt
dieselbe blaue Kante wie `.cmt.aufgabe`, der gesetzte Haken dasselbe Grün wie
`.cmt.erledigt`.

### `pruefung.js` (+1570/−567 Zeilen)

Acht neue Gruppen, der Mock um `/api/offen` und einen ehrlichen PUT-Weg
erweitert, der neue Parameter `offenBestand`, dazu die Umbenennungen und der
Sprachwächter.

### `db.js`, `anhaenge.js`, `auth.js`

**Vom Bau unberührt.** Angefasst hat sie allein die Sprachbereinigung: die fünf
Marken heißen jetzt `// MIGRATION 0.8.x — ENTFAELLT MIT 1.0`, die Funktionen
`migration083()` bis `migration0850()`, dazu `setzeHeader`, `setzeBildHeader`
und `rangeAus`. **Kein Verhalten hat sich geändert.**

---

## 2. Die Fragen aus dem Auftrag, beantwortet

### A. Wer darf den Haken an einem fremden Aufgabenkommentar setzen?

**Verfasser oder Admin — es bleibt, wie es ist.** `PUT /api/comments/:id` steht
bei `kind` seit 0.7.2 hinter `darfAendern`. Das ist die gewollte Antwort:
„Löschen ja, umschreiben nein" gilt **Aussagen**, und ein Erledigt-Haken ändert
keine fremde Aussage, er setzt ein Merkmal — dieselbe Klasse wie die Anpinnung,
die der Admin schon immer setzen darf.

Zwei Folgen stehen ausdrücklich hier:

- **Das Kästchen erscheint nur, wo es gedrückt werden darf.** Ein Bedienzeichen
  folgt dem Recht, nicht der Anzeige. Ein Haken, der ein 403 holt, sähe aus wie
  ein Fehler.
- **Eine herrenlose Aufgabe gehört dem Admin**, wie jede herrenlose Zeile.

### B. Was passiert mit der Zeile nach dem Haken?

**Sie bleibt stehen, durchgestrichen, bis die Ansicht neu geladen wird.** Eine
Zeile, die unter dem Zeiger verschwindet, nimmt die Möglichkeit, den Haken
gleich wieder wegzunehmen. Der Vermerk steht nur im Speicher der Ansicht; beim
nächsten Aufbau holt sie die Wahrheit wieder vom Server.

### C. Was steht da, wenn nichts offen ist?

Zwei Sätze, nicht einer: **„Nichts offen — es warten keine Aufgaben."** und, in
Stellung „meine", **„Von mir ist nichts offen."** Ein Satz für beide Fälle
erklärte den einen falsch. Beide benutzen das Vokabular.

### D. Woran hängt „neu"?

**Am `updated_at` des Eintrags** — eine Quelle statt zweier, und dieselbe
Spalte, nach der die Übersicht ohnehin sortiert.

**Was dabei verlorengeht, ausgeschrieben:**

- Man sieht **dass** sich etwas getan hat, nicht **was**. Fünf Kommentare und
  ein umbenanntes Tag sehen gleich aus.
- Ein **alter** Kommentar an einem frisch angefassten Eintrag zieht mit: der
  Eintrag ist neu, die Zeile darin nicht.
- **Eigene** Änderungen machen den Eintrag auch für einen selbst neu.

**Was ausdrücklich nicht verlorengeht:** der persönliche Favorit rührt
`updated_at` seit 0.6.3 bewusst nicht an — die eigene Ablage macht nichts
„neu". Genau die Regel, die diese Runde braucht, steht dort schon.

### E. Was tut der Filter beim allerersten Besuch?

**Er wird gar nicht erst angeboten.** Ohne Bezugspunkt zeigt er alles, und ein
Filter, der beim ersten Klick nichts tut, erklärt sich nicht. Ein gespeichertes
`neu: true` ohne Bezugspunkt nimmt ebenfalls nichts weg.

### F. Erscheint er auch bei einem einzigen Zugang?

**Ja, immer.** Anders als „meine / alle" ist er keine Aussage über andere: auch
allein vergisst man, was man zuletzt gesehen hat. Das unterscheidet ihn vom
Umschalter in der Ansicht „Offen", der bei einem Zugang wegbleibt.

### G. Die drei Sprachentscheidungen

- **`Umstieg` → `Migration`: gemacht**, als eigener Punkt mit eigenem
  Prüflauf und eigenem Commit. Die Marken sind dafür gebaut, zu 1.0 in einem
  Zug zu fallen; ein falsches Wort darin schleppte sich bis dahin durch.
- **Bezeichner im Quelltext: mitgenommen.** `keks` stand 273-mal da, `Keks`
  61-mal. **Ausgenommen bleibt jede Zeichenfolge, die nach außen geht** —
  `kriterion_session` und `__Host-kriterion_session` sind Protokoll, kein Wort.
- **`Abdruck` → `Fingerprint`: gemacht**, und dann konsequent: Oberfläche,
  Prosa **und** das Feld `abdruck` in `/api/stats`. Zwei Wörter für dieselbe
  Sache wären genau das, was das Projekt sonst überall vermeidet. Es ist die
  einzige Umbenennung dieser Runde, die ein Benutzer sieht.

---

## 3. Abweichungen und Befunde

### A. `kind = 'todo'` gibt es nicht — es heißt `'task'`

Auftrag und Ideenpapier schreiben `kind = 'todo'`. Im Quelltext heißen die vier
Werte `note`, `report`, **`task`**, `done`. Die neue Abfrage lautet deshalb
`WHERE c.kind = 'task'` — **dieselbe Schreibweise, die die Detailansicht
benutzt** (`c.kind === 'task'` in `drawComments()`). Damit steht die Bedingung
an genau zwei Stellen, wie verlangt.

`kind != 'done'` wäre falsch gewesen und ist als Gegenprobe gefahren: es nimmt
Notizen und Berichte mit.

### B. Der Stolperstein zur Sekundenauflösung ist **60**, nicht 15

Ideenpapier 4.3, der Auftrag und der Projektstand (Abschnitt 11) nennen alle
drei „Stolperstein 15". Das ist `/api/health` hinter der Anmeldung. Gemeint ist
**Stolperstein 60** („`datetime('now')` löst nur Sekunden auf"). An allen drei
Stellen berichtigt.

### C. Die Regel zu lesenden Routen ist enger, als der Auftrag sie zitiert

Der Projektstand sagt: „ein lesender Endpunkt **mit Wächter** steht nicht in
`F_ROUTEN`" — viermal angewandt. `GET /api/offen` braucht **keinen** Wächter
und ist damit ein gewöhnlicher lesender Endpunkt wie `GET /api/items`. Das
Ergebnis ist dasselbe: **`F_ROUTEN` bleibt 47**, und die Zahl wird ausdrücklich
geprüft.

### D. Der Filter rechnet in der Oberfläche, der Zeitstempel kommt vom Server

Das Ideenpapier sagt „serverseitig ist es ein Vergleich zweier Zeitstempel".
Gebaut ist der Vergleich **in `visibleItems()`**, eine Zeile neben dem
Favoritenfilter — sonst wäre er nicht mit den übrigen Filtern kombinierbar, die
alle dort sitzen. **Der Zeitstempel selbst kommt ausschließlich vom Server.**

### E. Der Bezugspunkt bleibt während eines Seitenlebens stehen

Nicht im Auftrag verlangt, aber ohne ihn ist die Sache unbrauchbar: würde
`ZULETZT_GESEHEN` bei jeder Rückkehr in die Übersicht nachgezogen, sähe man
sieben Neue und verlöre sechs davon beim ersten Klick. Gelesen wird deshalb
**einmal beim Laden der Seite**; der weitergestellte Wert gilt erst beim
nächsten Laden. Ein Besuch ist eine Sitzung am Bildschirm, kein Wechsel der
Ansicht.

### F. Der Haken ist ein Zustand, keine Weiterschaltung

`aufgabeWeiter()` macht aus einer erledigten Aufgabe eine **Notiz** — im
Kommentarblock die gewollte Abfolge, in der Ansicht „Offen" wäre es ein
Kästchen, dessen zweiter Druck die Zeile lautlos aus der Menge nimmt. Der Haken
schickt die Art deshalb ausdrücklich.

### G. Der Haken fasst `updated_at` des Eintrags an

Bestandsverhalten von `PUT /api/comments/:id` (`touch.run`), keine Neuerung —
aber es verbindet die beiden Punkte dieser Runde: wer eine Aufgabe abhakt,
schiebt den Eintrag nach oben und macht ihn für alle „neu". Steht hier, damit
es niemand später für einen Fehler hält.

### H. Zwei Zeilen der Wortliste im Auftrag stimmen nicht

`Doppelgänger` steht **23-mal im Quelltext** (als `Doppelgaenger`), die Tabelle
sagt „—". `Rückschritt` steht **2-mal im Quelltext**, die Tabelle sagt „—".
Beide sind mitgenommen. Die übrigen Zahlen stimmen bis auf ±1 bis ±15.

### I. Der Sprachwächter lässt zitierten Code in Ruhe — überall

Ein Bezeichner in Backticks ist keine Sprache, gleich ob er in einem Kommentar
oder in einem Dokument steht. Ohne diese Regel hätte der Wächter das
Gewichtungspapier angemeckert, das `umstiegGewicht()` als **nicht** gebauten
Namen zitiert — und den Vermerk im Änderungsprotokoll 0.8.40 gleich mit.

### I2. Und „Abbildung" ist kein Image

Nachgetragen beim Schreiben des Auftrags für 0.8.70: das Wort **Abbildung**
enthält `Abbild`, meint aber eine **Zuordnung** und hat mit einem Docker-Image
nichts zu tun. Der Wächter hätte jede Prosa angemeckert, die von der Abbildung
je Eintrag spricht — und ein Wächter, der jedes zweite Wort anmeckert, wird
abgeschaltet. `Abbild` steht deshalb als `Abbild(?!ung)` im Muster, mit einer
eigenen Gegenprobe an beiden Seiten: `Abbild` wird gefangen, `Abbildung`
nicht. **Die Ausnahme steht im Quelltext und nicht in der Wortliste**, wo sie
wie ein weiteres Verbot aussähe.

### J. Der Auftrag der laufenden Runde bleibt außen vor

`Doku/Auftrag_*.md` führt die Wortliste und nennt jedes dieser Wörter als
Beispiel. Ein Wächter, der ihn anmeckert, meckert seine eigene Vorschrift an.

### K. Kein Migrationsabschnitt im Prüfstand

**Die Frage ist gestellt und verneint.** Es entsteht keine Migration, also
kommt kein sechster Abschnitt dazu. Die fünf vorhandenen bleiben unangetastet,
und die Probe „Ein Sprung von 0.8.20 fährt ALLE Migrationen in einem Start"
wird **nicht** erweitert.

---

## 4. Neue Stolpersteine

Die Zählung setzt bei 112 fort.

**112. Ein Sprachwächter meldet sich selbst — sein Kommentar erklärt die Regel
und nennt dabei die verbotenen Wörter.** Stolperstein 106 in neuer Gestalt und
mit umgekehrtem Vorzeichen: dort trifft ein Wächter über den *Code* den
Kommentar daneben, hier trifft ein Wächter über die *Sprache* die eigene
Begründung. *Die Antwort ist dieselbe Trennlinie, nur andersherum gezogen: was
in Backticks steht, ist zitierter Code und keine Sprache — und zwar in einem
Kommentar so gut wie in einem Dokument.*

**113. Ein Wächter über eine Dateiliste braucht die ZAHL, nicht nur „alle, die
dastehen".** Die Prüfung „er sieht alle acht Quelltextdateien an" hing an
`every(existsSync)` und blieb grün, als die Liste auf eine einzige Datei
gekürzt wurde. Der Wächter sah danach ein Achtel der Anwendung an und meldete
nichts. *Dieselbe Überlegung wie bei der Zahl in `F_ROUTEN`: eine Liste, die
schrumpfen darf, ohne dass es auffällt, ist keine Liste, sondern eine
Behauptung.*

**114. Eine Prüfung auf „filtert, sortiert nicht" fängt keine Vorsortierung.**
Verglichen wurde die Reihenfolge der verbliebenen Einträge mit und ohne Filter
— und eine Zeile, die das Neue vor den `switch` zieht (die Bauform, an der
schon der Favorit gescheitert ist), ändert genau diese Reihenfolge **nicht**.
Sie fällt erst auf, wenn die **ungefilterte** Liste gegen ihre eingestellte
Ordnung gehalten wird. *Wer prüfen will, dass ein Filter nicht sortiert, misst
die Liste ohne ihn.*

**115. Ein Mock, der beim Schreiben wirklich mitzieht, verändert die Prüflage
für alles, was danach im selben Fenster läuft.** Stolperstein 90 verlangt, dass
er sich ändert; die Folge ist, dass Prüfungen, die die **Zahlen der Prüflage**
lesen, danach etwas anderes sehen. Aufgefallen an „Der Kommentarblock trägt
seine Zahlen in der Kopfzeile", nachdem zwei Prüfungen darüber im selben DOM
zwei Arten umgeschaltet hatten. *Wer die Prüflage selbst misst, misst sie an
einem frischen Aufbau.*

**116. Eine Schranke, die aus einer Liste ableitet, wird erst bei einem Zugang
OHNE Adminrolle laut.** `PUT /api/settings` leitet aus
`PERSOENLICHE_SCHLUESSEL` ab, was jeder für sich schreiben darf. Nimmt man den
neuen Schlüssel dort heraus, kommt der **Eigentümer** weiterhin durch — er ist
Admin — und nur ein gewöhnlicher Benutzer bekommt 403. Die Gegenprobe blieb
deshalb zunächst stumm. *Wer eine Rechteschranke gegenprüft, prüft sie an dem
Zugang, den sie treffen soll.*

---

## 5. Gegenprobentabelle

Alle in einer **Kopie des Arbeitsbaums** (Stolperstein 100).

| Rückbau | Wirkung |
|---|---|
| `WHERE c.kind = 'task'` wird `kind != 'done'` | **4 rot** — *Die Ansicht zeigt genau die nicht erledigten Aufgaben* · *Notiz und Bericht ebenso wenig* · *Der jüngere Eintrag steht oben* · *Die Zeilen eines Eintrags stehen beieinander* |
| `zuletztGesehen` fällt aus `PERSOENLICHE_SCHLUESSEL` | **4 rot** — *server.js kennt genau die sieben persönlichen Schlüssel* · *Auch ohne Adminrolle merkt sich jeder seinen eigenen Zeitpunkt* · *Und er steht danach bei ihm* · *Die beiden Benutzer teilen sich keine Zeile* |
| `datetime('now','-1 second')` wird `datetime('now')` | **2 rot** — *Ein Kommentar aus der Sekunde des Verlassens gilt danach als neu* · *Der Merkzeitpunkt liegt vor der Serveruhr, nicht auf ihr* |
| Der Server übernimmt den Zeitstempel aus dem Ruf | **3 rot** — *Und zwar von der Serveruhr, nicht aus dem Ruf* · *Und höchstens eine Sekunde davor* · *Und er steht danach bei ihm* |
| Der Merkzeitpunkt wird beim **Betreten** gesetzt | **3 rot** — *Das Betreten der Übersicht merkt sich nichts* · *Auch der Weg nach #/compare merkt den Zeitpunkt* · *Ein Filterklick in der Übersicht merkt sich keinen Zeitpunkt* |
| Vorsortierung des Neuen vor dem `switch` | **1 rot** — *Ohne Filter steht die Liste in der eingestellten Ordnung (nach Titel)* |
| Der Filter greift ohne Bezugspunkt | **1 rot** — *Ein gespeichertes „neu" ohne Bezugspunkt nimmt nichts weg* |
| Das Kästchen steht ohne Rücksicht auf das Recht | **1 rot** — *Aber nur an der eigenen steht ein Kästchen* |
| Die Überschrift wird fest hingeschrieben | **1 rot** — *Die Überschrift benutzt das Vokabular, nicht das feste Wort* |
| Der Haken schaltet weiter statt zu setzen | **1 rot** — *Ein zweiter Druck nimmt ihn wieder weg — und macht keine Notiz daraus* |
| Die erledigte Zeile verschwindet sofort | **5 rot** — *Die Zeile bleibt stehen* · *Und sie zeichnet sich als erledigt* · *Das Kästchen zeigt jetzt den Haken* · *Ein zweiter Druck …* · *Beim nächsten Aufbau ist die abgehakte Zeile fort* |
| „meine / alle" auch bei einem Zugang | **1 rot** — *Aber der Umschalter erscheint nicht* |
| Aus `GET /api/offen` wird `PUT /api/offen` | **2 rot** — *Der Prüfstand kennt jede schreibende Route* · *Und es sind weiterhin genau 47 schreibende Routen* |
| Ein Kommentar in `server.js` fällt sprachlich zurück | **1 rot** — *Die Kommentare des Quelltextes benutzen die heutigen Fachwörter* |
| Ein Dokument fällt sprachlich zurück | **1 rot** — *Die Dokumente ebenso* |
| Der Sprachwächter sieht nur noch eine Datei an | **2 rot** — *Der Sprachwächter sieht alle acht Quelltextdateien an* · *Und aus ihnen bleiben mehr als tausend Kommentarzeilen übrig* |
| Der Kommentarfilter wirft die `//`-Zeilen weg | **1 rot** — *Er liest überhaupt noch etwas: ein Kommentar mit `Keks` fällt auf* |

Dazu **acht Gegenproben an gestellten Texten** innerhalb der Gruppe „Der
Sprachwaechter": dass er einen Kommentar und einen Fließkommentar fängt, dass
er Code und zitierten Code in Ruhe lässt (in beiden Formen), dass er in einem
Dokument die Prosa und nicht den Code im Zaun liest, und dass er `Abbild`
fängt, `Abbildung` aber stehen lässt.

**Zwei Gegenproben sind zunächst stumm geblieben** und haben je einen
Stolperstein gebracht:

- Die Vorsortierung (Stolperstein 114) — die Prüfung maß die falsche Liste.
- Die gekürzte Dateiliste (Stolperstein 113) — der Wächter zählte nicht.

Beide Prüfungen sind geschärft worden, danach beißen die Gegenproben.

---

## 6. Prüfungszahlen

**Vorher 1953, nachher 2087** — **134 neue Prüfungen**, davon 124 in acht neuen
Gruppen und 10 in vorhandenen.

| Gruppe | neu |
|---|---|
| Offene Aufgaben: die Ansicht | 15 |
| Der Haken am Aufgabenkommentar | 12 |
| Neu seit: die Sekunde am Rand | 3 |
| Offen: die Ansicht in der Oberfläche | 20 |
| Offen: der Haken in der Ansicht | 26 |
| Neu seit: der Filter in der Übersicht | 22 |
| Neu seit: der Merkzeitpunkt | 11 |
| Der Sprachwächter | 15 |

Dazu Ergänzungen an „Persönliche Einstellungen" (der Merkzeitpunkt, der
Nicht-Admin, die Serveruhr) und an „Der Umschalter der Vergleichsansicht" (die
eng gefasste Ausnahme für den Merkzeitpunkt, samt der Zeile, die sie belegt).

**Umbenannt, nicht gelöscht:** „server.js kennt genau die **sechs**
persönlichen Schlüssel" heißt jetzt „**sieben**", „Alle sechs stehen beim
Benutzer" heißt „Alle sieben", und die fünf Migrationsgruppen tragen die neue
Marke. Die Prüfung „Der Umschalter schreibt nichts an den Server" ist **eng
gefasst statt entfernt** worden — sie schließt den Merkzeitpunkt aus, und
daneben steht die Zeile, die belegt, dass genau er es war.

---

## 7. Was ausdrücklich nicht passiert ist

- **Kein `ALTER TABLE`, kein sechster Migrationsblock.** Es bleibt bei fünf.
- **Kein Migrationsabschnitt im Prüfstand**, und die Probe „Ein Sprung von
  0.8.20" ist **nicht** erweitert worden.
- **Formatnummer bleibt 10.** Export und Import sind nicht angefasst.
- **`F_ROUTEN` bleibt 47.**
- **Kein Eintrag unter „Vorgemerkt für 1.0."**
- **Kein zwölftes Vokabelwort** — die elf bleiben elf.
- **Keine neue Abhängigkeit.**
- **Die Sortierung der Übersicht ist nicht angefasst.**
- **Der Zähler „Offen 7" in der Kopfzeile ist nicht gebaut** — er kommt unter
  „Vorgemerkt".

---

## 8. Offen geblieben

- **Der Zähler „Offen 7" in der Kopfzeile.** Er wird bei jedem Seitenaufbau
  gebraucht; die Frage, wie er nicht ständig neu abgefragt wird, gehört in eine
  eigene Runde.
- **Wer den Browser schließt, ohne die Übersicht zu verlassen**, behält seinen
  alten Merkzeitpunkt und sieht dieselben Einträge noch einmal. Das ist die
  richtige Seite des Fehlers und bleibt so; ein Weg über `pagehide` wäre ein
  Abruf, der beim Schließen des Fensters nicht verlässlich ankommt.
- **Der Sprachwächter sieht Prosa und Kommentare an, nicht die Namen von
  Prüfungen im Klartext** — die sind Kommentar genug, stehen aber in
  Zeichenfolgen. Wer dort ein altes Wort einträgt, fällt nicht auf.
- **„Kopfzeile" und „Bereich" sind von Hand getrennt worden**, Zeile für
  Zeile. Der Wächter hält nur die zwölf eindeutigen Wörter; die beiden
  zweideutigen stehen bewusst nicht auf seiner Liste, weil er sonst die
  Kopfzeile der Anwendung anmeckerte.
