# Änderungsprotokoll 0.11.0 — „Suche und Bestand"

**Version 0.11.0 · gebaut am 27. August 2026 · die zweite Runde nach dem
Stufenplan, die zweite unter Semantic Versioning · KEINE Datenbankstufe, kein
Migrationsblock**

**Die Suche zieht vom Browser auf den Server, wer oft dasselbe sucht, kann es
sich merken — und wer denselben Gegenstand zweimal anlegt, erfährt es beim
Tippen.**

**Der Satz, unter dem alles steht: die Suche findet dasselbe wie vorher, sie
fragt nur den Server statt den Browser.** Dieselben sieben Quellen, dieselbe
Schreibungsblindheit bis in die Umlaute, dieselben Treffer ab einem einzigen
Zeichen, und ein Prozentzeichen bleibt ein Prozentzeichen. *Ein Umbau, der dem
Benutzer etwas wegnimmt, wäre kein Gewinn, gleich wie viel er an Bytes spart.*
Genau das hat die Bauform entschieden — nicht die Geschwindigkeit.

**Und der zweite Satz trägt genauso: diese Runde konnte die Anlage
verschlechtern.** Der zweite Faktor aus 0.10.0 konnte nichts kaputtmachen; wer
ihn nicht einschaltete, merkte nichts. **Die Suche merkt jeder, sofort, bei
jedem Tastendruck.** Deshalb sind Debounce, Reihenfolge der Antworten und der
Rückfall bei gescheiterter Anfrage **gebaut und geprüft, nicht gehofft**.

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.11.0 ist **MINOR**, weil
Funktionen dazukommen. `searchText` fällt dabei aus der Antwort von
`GET /api/items` heraus, und das ist eine **Wegnahme** — aber die HTTP-Endpunkte
unter `/api/` gehören nach Projektstand, Abschnitt 5, **ausdrücklich nicht zur
öffentlichen Schnittstelle**: sie werden allein von der mitgelieferten
Oberfläche gerufen, beide kommen aus demselben Image, und ihre Fassungen können
sich deshalb nicht auseinander entwickeln. *Das Datenverzeichnis, das
Austauschformat (Nummer 10), die Schlüssel in der `.env` und die Werkzeuge auf
dem Wirt sind alle vier unberührt.*

**Das Zusammenführen zweier Einträge ist vor dem Bau herausgenommen worden**,
mit Begründung und Zustimmung. Einzelheiten in Abschnitt 2, Abweichung A — und
der Grund ist eine gezählte Zahl: es sind **vier** Eindeutigkeitsschranken, die
dabei brechen, nicht zwei.

**0.11.0 — Fingerprint `74c44ec0`.** ZULETZT gebildet, nach der letzten
Änderung an einer ausgelieferten Datei — die Versionsnummer in der
`package.json` eingeschlossen, denn der Server lädt sie und sie zählt damit
mit. Er geht über **alles** in `public/` und nicht über eine Liste erwarteter
Namen: eine Datei zu viel bewegt ihn genauso wie eine geänderte
(Stolperstein 158). *Er musste sich bewegen — zwei Dateien in `public/` sind
andere geworden.*

**Der Fingerprint der laufenden Anlage war vor dem Bau abzufragen, und er
stimmt.** Der Betreiber hat `dc8c16f7` gemeldet — denselben Wert, den der
Branch für 0.10.0 misst. Damit ist Punkt 0 des Auftrags in einem Satz erledigt
und es gibt keinen Befund wie bei 0.9.1 (Stolperstein 158).

---

## Inhalt

1. [Was gebaut wurde, je Datei](#1-was-gebaut-wurde-je-datei)
2. [Die Abweichungen und Ergänzungen zum Auftrag](#2-die-abweichungen-und-ergänzungen-zum-auftrag)
3. [Die Fragen aus dem Auftrag, beantwortet](#3-die-fragen-aus-dem-auftrag-beantwortet)
4. [Befunde beim Bauen](#4-befunde-beim-bauen)
5. [Neue Stolpersteine](#5-neue-stolpersteine)
6. [Die Messwerte — vorher und nachher](#6-die-messwerte--vorher-und-nachher)
7. [Der Prüfstand](#7-der-prüfstand)
8. [Gegenprobentabelle](#8-gegenprobentabelle)
9. [Prüfungszahlen](#9-prüfungszahlen)
10. [Was ausdrücklich nicht passiert ist](#10-was-ausdrücklich-nicht-passiert-ist)
11. [Offen geblieben](#11-offen-geblieben)

---

## 1. Was gebaut wurde, je Datei

### `db.js`

**Eine SQL-Funktion, sonst nichts. Am Schema keine Zeile.**

- **`kkl(text)`** — Kleinschreibung nach Unicode, über `db.function` in SQL
  eingehängt, `deterministic: true`. Sie steht **vor** `db.exec(SCHEMA)`, damit
  jede später vorbereitete Abfrage sie kennt.
  *Warum sie überhaupt sein muss:* SQLite faltet in `lower()` **und in `LIKE`**
  ausschließlich ASCII. `lower('Ü')` ist `'Ü'` — eine Suche nach „übergross"
  fände „STICHSÄGE ÜBERGROSS" damit **nicht**. `toLowerCase()` aus JS faltet
  nach Unicode und ist genau das, was der Browser vorher getan hat; die
  Klemme, die aus einem Text Kleinbuchstaben macht, gibt es damit **genau
  einmal** in der Anlage.
  *`NULL` wird zum leeren String und nicht zu `NULL`:* `instr(NULL, 'x')` ist
  `NULL`, und `NULL > 0` ist in SQL nie wahr — eine fehlende Beschreibung wäre
  damit kein „kein Treffer", sondern ein Wert, mit dem sich nicht rechnen
  lässt.

### `server.js`

- **`qVolltext`** — eine vorbereitete Abfrage über die **sieben Quellen** als
  sieben ODER-Glieder: `items.title`, `items.description`,
  `product_categories.name` (über `LEFT JOIN`), Tags am Eintrag, Tags an
  Testtagen, `links.url` und `comments.text` (die vier letzten als `EXISTS`).
  **Gesucht wird mit `instr(kkl(spalte), :q) > 0.`**
  *Sieben Glieder und kein zusammengesetzter Text:* SQLite bricht die Kette
  beim ersten Treffer ab — ein häufiges Wort im Titel kostet 1,9 ms, ein
  seltener Begriff, der alle sieben durchläuft, 13,2 ms. Ein vorher
  zusammengesetzter Text kostete immer den ganzen Durchlauf.
- **`volltextBegriff(roh)` und `volltextTreffer(begriff)`** — der Begriff wird
  genau so zugeschnitten wie vorher im Browser: außen getrimmt, klein
  geschrieben. Ein Begriff, von dem danach nichts übrig ist, ist **keine
  Suche** und keine Suche ohne Treffer; die Liste bleibt dann die ganze Liste.
- **`GET /api/items` nimmt `?q=…`** — dieselbe Route, ein Parameter mehr. Sie
  ist **lesend** und steht damit **nicht** in `F_ROUTEN`; dieselbe Regel wie
  bei `GET /api/offen`. **Die Zahl bleibt 69 und wird ausdrücklich geprüft.**
- **`it.searchText` entfällt.** Damit fällt auch die Abfrage über die
  Kommentartexte je Eintrag weg — sie war der teuerste Teil der Schleife.
- **`it.testDays` nur bei eingeschalteter Zeitleiste.** `zeitleisteAn()` wird
  **einmal für die ganze Antwort** gefragt und nicht je Eintrag: es ist eine
  persönliche Einstellung und ändert sich innerhalb einer Antwort nicht.
- **`qAlleItems` und `qAnhangZahl` sind vorbereitet** statt je Eintrag
  übersetzt. Das ist eine Ergänzung zum Auftrag (Abschnitt 2, Ergänzung D) und
  spart an 1000 Einträgen 12,7 ms.
- **`PERSOENLICHE_SCHLUESSEL` bekommt `ansichten`** — von sieben auf **acht**.
- **`ANSICHTEN_DECKEL` (8), `ANSICHT_NAME_LAENGE` (40),
  `ANSICHT_BEGRIFF_LAENGE` (200), `ANSICHTEN_ZEICHEN` (8000)** und der Leser
  `ansichten(benutzerId)`.
- **`GET /api/settings` liefert `ansichten` und `ansichtenDeckel`.** Der Deckel
  kommt vom Server, damit die Zahl an **einer** Stelle steht.
- **`PUT /api/settings` nimmt `ansichten`** — die ganze Liste auf einmal, denn
  es ist ein Schlüssel mit einem Wert. **Geprüft wird VOR dem ersten
  Schreiben**, und zwar vor `filters`: eine Absage, die die halbe Arbeit schon
  getan hat, wäre schlimmer als gar keine. Abgewiesen werden mehr als acht, ein
  fehlender oder leerer Name, zwei gleiche Namen (ohne Rücksicht auf die
  Schreibung) und eine Liste über 8000 Zeichen.
  *Geprüft wird die FORM und nicht der Inhalt der Filterstellung:* welche
  Sortierungen und welche Nummern es gibt, weiß die Oberfläche — eine zweite
  Liste davon im Server liefe auseinander, und `filters` liegt aus genau diesem
  Grund seit jeher ungeprüft in der Tabelle.

### `public/app.js`

- **`FILTER_VORGABE`** — die Vorgabestellung der Filter steht jetzt **genau
  einmal**. Sie stand bis 0.10.0 an zwei Stellen; mit den Ansichten wären es
  drei geworden.
- **`filterNormal(roh)`** — der eine Weg, über den **beide** Quellen einer
  gespeicherten Stellung laufen (die gemerkte und eine Ansicht). Er füllt
  fehlende Felder und **übergeht Nummern, die es nicht mehr gibt**.
  Übergangen, nicht zurückgeschrieben.
- **Die Suchmaschinerie:** `SUCH_VERZOEGERUNG = 220`, `suchUhr`, `suchLauf`,
  `sucheAusfuehren()`, `sucheAngestossen()`, `syncSuchknopf()`.
  **Drei Vorkehrungen, alle drei gebaut:** der Debounce ab dem ersten Zeichen;
  eine laufende Nummer je Anfrage, damit die Antwort auf „bo" die auf „bosch"
  nicht überschreibt; und der Rückfall — scheitert die Anfrage, bleibt stehen,
  was da ist, und die Zählzeile sagt es einmal.
  **Das Leeren läuft ohne Debounce und ohne Anfrage:** der ungefilterte Bestand
  liegt in `state.alle`.
- **`state` bekommt vier Felder:** `alle` (der ungefilterte Bestand),
  `bestand` (die Zahl für die Zählzeile), `suchLaeuft` und `suchFehler`.
  *`bestand` ist nicht `items.length`:* während einer Suche trägt `items` nur
  die Treffer, und „1 Sache" wäre eine falsche Auskunft über einen Bestand von
  dreihundert.
- **`visibleItems()` verliert seine q-Zeile.** Die übrigen Filter bleiben
  örtlich: sie rechnen mit Feldern, die die Antwort ohnehin trägt, und kosten
  keine Anfrage.
- **`nameBox(...)`** — ein Dialog nach dem Muster von `confirmBox()`, für den
  Namen einer Ansicht. Ausdrücklich **kein `prompt()`**: das steht am oberen
  Rand des Fensters, sieht in keinem Browser wie diese Anlage aus und lässt
  sich nicht beschriften.
- **Die Ansichten:** `ANSICHTEN`, `ANSICHTEN_DECKEL`, `ansichtAusZustand()`,
  `ansichtenSchicken()`, `ansichtSpeichern()`, `ansichtLoeschen()`,
  `ansichtAnwenden()` — und eine fünfte Zeile in `drawFilters()`.
  **Geschickt und dann erst übernommen:** scheitert es am Server, bleibt die
  örtliche Liste, wie sie war.
  **Welche Ansicht gerade gilt, wird verglichen und nicht gemerkt** — ein
  gemerkter Zeiger darauf liefe auseinander, sobald jemand einen Filter von
  Hand verstellt.
- **Die Doppelerkennung:** `AEHNLICH_FENSTER = 4`, `AEHNLICH_ZEIGE = 5`,
  `titelKern()`, `aehnlicheEintraege()` und eine Zeile im Anlegen-Dialog.
  **Keine Route.** Verglichen wird `state.alle` und **nicht** `state.items`:
  während einer Suche trägt `items` nur die Treffer, und dann fiele der
  Doppeleintrag genau dann nicht auf, wenn man ihn beim Suchen nicht gefunden
  hat.
- **`MARK(s)`** liefert die Attribute im Verhältnis **19:23** statt
  quadratisch, **`MARKENZEILE()`** ruft `MARK(36)` statt `MARK(34)`.
- **Das Sortierfeld bekommt die Kennung `f-sort`** — wie der Favoritenknopf
  daneben.

### `public/marke-dunkel.svg` und `public/favicon.svg`

- **Der hervorgehobene Strich geht von `#ffc531` auf `#ff7a1a`**, in **beiden**
  Dateien. Der Rest bleibt `#838c95`.
- **`marke-dunkel.svg` bekommt ein enges `viewBox`: `6.5 4.5 19 23`.** Damit
  ist die angegebene Höhe die gezeichnete.
- **`favicon.svg` behält `0 0 32 32` samt Kachel.** Abweichung B in
  Abschnitt 2.

### `public/style.css`

- **`.marke { width: auto }`**, **`.brand .marke { height: 3.1rem }`**,
  **`.login-card .login-marke .marke { height: 2.372rem }`** — die Höhe in
  `rem` und ausgerechnet.
- **`.grid.sucht`** — die alte Liste bleibt während der Suche gedämpft stehen.
  Kein Ladebalken und kein Kreisel: die Zählzeile sagt daneben schon „sucht …".
- **`.pill .an-weg`** — das Kreuz an einer gespeicherten Ansicht.
- **`.aehnlich`** — die Zeile „Ähnlich: …". Eine **Auskunft und keine
  Warnung**: kein Rot, kein Rahmen, kein Zeichen davor. `:empty { display:
  none }`, damit ein leerer Streifen den Dialog nicht bei jedem Anschlag
  verschiebt.

### `pruefung.js`

Acht neue Gruppen, dazu Erweiterungen. Einzelheiten in Abschnitt 7.

### `gegenprobe.js`

**34 neue Rückbauten, Nummern 124 bis 157.** Einzelheiten in Abschnitt 8.

### Papiere

`CHANGELOG.md` (Eintrag `## [0.11.0]` samt Vergleichsverweis), `README.md`
(Suche, Ansichten, Doppelerkennung), `Doku/Ideen_und_Vorschlaege.md` (3.1 und
4.6 eingelöst, 3.3 mit berichtigten Zahlen), Projektstand umbenannt auf
`Projektstand_Kriterion_0_11_0.md` und Revision 24, dieses Protokoll.
**Das Konzeptpapier ist NICHT angefasst** — es ist mit 0.9.1 geschlossen, und
„Suche und Bestand" ist keine Stufe daraus. *Beim Bauen ist nichts aufgefallen,
das dort falsch würde.*

---

## 2. Die Abweichungen und Ergänzungen zum Auftrag

### Abweichung A — das Zusammenführen ist draußen

**Vor dem Bau angesagt, wie der Auftrag es verlangt, und mit Zustimmung
entschieden.** Der Fahrplan nannte Doppelerkennung *und* Zusammenführen in
einer Zeile; der Schnitt liegt zwischen ihnen.

**Was den Ausschlag gab, ist gezählt und nicht geschätzt.** Der Auftrag rechnete
mit **zwei** Eindeutigkeitsschranken, die beim Zusammenführen brechen.
Nachgesehen im Schema sind es **vier**:

| Tabelle | Schranke | wann sie bricht |
|---|---|---|
| `ratings` | `UNIQUE(item_id, criterion_id, user_id)` | derselbe Mensch, dasselbe Kriterium an beiden |
| `test_days` | `UNIQUE(item_id, day, user_id)` | derselbe Mensch, derselbe Tag an beiden |
| `item_tags` | `PRIMARY KEY (item_id, tag_id)` | **beide tragen denselben Tag** |
| `item_pins` | `PRIMARY KEY (user_id, item_id)` | derselbe Mensch hat beide als Favorit |

**`item_tags` ist der Normalfall und nicht der Randfall:** zwei Einträge
desselben Gegenstands tragen fast immer dieselben Tags. Ein schlichtes
`UPDATE … SET item_id = ?` läuft dort beim **ersten** echten Doppeleintrag auf
einen Constraint-Fehler.

**Der Preis ist benannt und nicht weggeschrieben:** eine Doppelerkennung ohne
Zusammenführen ist ein Hinweis ohne Heilmittel. *Er ist tragbar, weil der
Hinweis den zweiten Eintrag verhindert, bevor er entsteht.* Die ganze Begründung
steht im Projektstand, Abschnitt 10.

### Abweichung B — `favicon.svg` behält sein `viewBox`

**Der Auftrag neigte dazu, das enge `viewBox` in beiden Dateien zu setzen**, mit
dem Argument, dass der Weg dann überall wirkt — auch auf dem Reiter des
Browsers und dem Lesezeichen. **Gebaut ist es nur in `marke-dunkel.svg`.**

**Der Grund:** `favicon.svg` ist ein **Kachelsymbol**. Es bringt ein
`<rect rx="7">` mit, und die Kachel braucht ihren Rand — der Strich füllt dort
72 Prozent der Höhe und 59 Prozent der Breite, beides innerhalb des üblichen
Schutzbereichs für ein Anwendungssymbol. **Ein enges `viewBox` schnitte die
Kachel an.** *Es ist eine Änderung an etwas, das nicht kaputt ist.*

Die Farbe ändert sich dort trotzdem — sie war ja der Befund.

### Abweichung C — `instr()` statt eines Durchlaufs in JS

**Der Auftrag schlug „kein FTS5, ein serverseitiger Durchlauf" vor und
verlangte eine Begründung, keine Zustimmung.** Gebaut ist ein dritter Weg, und
er ist gemessen: **SQL über `instr()` mit einer in SQL eingehängten
Kleinschreibung nach Unicode.**

Vier Wege, an 1000 Einträgen und 1,75 MB Suchtext gegeneinander gemessen.
Trefferzahlen an demselben Bestand:

| Begriff | heute (JS `includes`) | SQL `LIKE` | SQL `instr(kkl())` | FTS5-Trigramm |
|---|---:|---:|---:|---:|
| `b` | 1001 | 1001 | 1001 | **0** |
| `bo` | 1000 | 1000 | 1000 | **0** |
| `bos` | 1000 | 1000 | 1000 | 1000 |
| `bosch` | 1000 | 1000 | 1000 | 1000 |
| `übergross` | 1 | **0** | 1 | 1 |
| `münchen` | 1 | **0** | 1 | 1 |
| `ä` | 1001 | **1000** | 1001 | **0** |
| `%` | 1 | **1001** | 1 | **0** |
| `50 %` | 1 | 1 | 1 | 1 |

**`instr(kkl())` ist in allen neun Proben buchstabengleich mit dem alten
Verhalten** — es ist ja dieselbe `toLowerCase()`. `LIKE` bricht an zwei
Stellen: bei Umlauten und bei den Wildcards. FTS5 bricht bei ein und zwei
Zeichen, **still**.

Zeiten: JS-Durchlauf über Sammelabfragen **11,4 ms konstant**, `LIKE` 0,62 ms,
`instr(kkl())` **1,9 ms** bei einem häufigen Wort und **13,2 ms** im
schlechtesten Fall. *`instr()` ist damit nie schlechter als der Durchlauf in JS
und meist sechsmal besser* — und der Text bleibt im häufigen Fall in SQLite,
statt vollständig nach JS marshalliert zu werden.

**Der eigentliche Grund ist aber nicht die Zeit, sondern die Bauform:**
`instr()` kennt keine Wildcards. `%` und `_` sind dort Text **von Bauart** und
nicht durch eine Klemme, die jemand vergessen kann. *Damit ist Punkt 3 des
Auftrags nicht „entschieden und gebaut", sondern gegenstandslos geworden.*

### Ergänzung A — die Höhe steht in `rem`, nicht in Pixel

**Der Auftrag nannte zwei Wege — Kachel größer ziehen oder `viewBox` enger
legen — und verlangte eine Entscheidung.** Beide setzen die Größe in Pixel.
**Die Anlage stellt die Schrift aber von 80 bis 120 Prozent** (`SCHRIFT_STUFEN`,
`wendeSchriftAn()` schraubt an `html`): eine in Pixel festgeschriebene Marke
passte nur bei 100 Prozent zum Text daneben, und bei 120 Prozent stünde sie
wieder zu klein da.

Gebaut ist deshalb das enge `viewBox` **und** die Höhe im Stylesheet in `rem`.
Die Attribute im Markup bleiben und halten das Seitenverhältnis 19:23 — sie
bewahren den Platz, bis das Stylesheet greift, und sind der Rückfall, nicht das
Maß.

### Ergänzung B — `filterNormal` räumt auch die alte Filterstellung auf

Die Frage des Auftrags galt der **Ansicht** mit gelöschter Kategorie. Beim
Bauen zeigte sich, dass die **eine gemerkte Stellung** dasselbe Problem seit
jeher hat und stiller ist: sie filterte auf eine Kategorie, die niemand mehr
hat, die Übersicht blieb leer, und nichts sagte warum.

**Zwei Wege für dieselbe Frage wären zwei Auslegungen desselben JSON.** Beide
gehen jetzt durch `filterNormal()`. *Das ist eine kleine Erweiterung des
Auftrags und steht im Changelog unter `Fixed`.*

### Ergänzung C — die Beschriftung der `F_ROUTEN`-Zahl

`pruefung.js` trug „Und es sind jetzt genau **64** schreibende Routen", geprüft
wurde `=== 69`. Wäre die Zeile rot geworden, hätte sie die falsche Zahl
genannt. Berichtigt, samt der Begründung, warum 0.11.0 die Zahl nicht bewegt.

### Ergänzung D — zwei Abfragen aus der Listenschleife hochgezogen

`GET /api/items` übersetzte **je Eintrag** zwei Abfragen: die Anhangzahl und
die Kommentartexte. Gemessen an 1000 Einträgen: **24,2 ms so, 11,5 ms
vorbereitet.** Die Kommentarabfrage fällt mit `searchText` ohnehin weg; die
andere ist mitgekommen. *Vier weitere Abfragen der Schleife standen aus
demselben Grund längst oben.*

### Ergänzung E — 34 Rückbauten statt der zugesagten 28

Im Vorschlag standen 28. Beim Schreiben kamen sechs dazu, die sich beim
Hinsehen aufdrängten: die Reihenfolge der Antworten, die Zählzeile, das Leeren
ohne Anfrage, die Namensgleichheit, die Reihenfolge von Prüfung und Schreiben,
und das Markup der Marke. **Die Nummern laufen von 124 bis 157 und nicht ab
123** — Stolperstein 168.

---

## 3. Die Fragen aus dem Auftrag, beantwortet

### Zu 1a — die Suche

**Wo wird der Suchtext gebildet — bei jeder Anfrage neu oder gespeichert?**
**Gar nicht.** Er wird auch nicht mehr gebildet: die Suche fragt die sieben
Quellen **einzeln** in einer Abfrage. Damit kostet die Runde keine
Schemaänderung, keine Spalte an `items` (die der sechste Migrationsblock wäre),
keine eigene Tabelle — und **keine der sieben Nachziehstellen beim Schreiben**.
*Eine vergessene Stelle wäre eine zweite Wahrheit; hier gibt es keine Stelle,
die man vergessen könnte.*

**Wie sieht die Route aus?** `GET /api/items?q=…` — dieselbe Route, ein
Parameter mehr, damit die Oberfläche nicht zwei Wege für dieselbe Liste kennt.
**Lesend, also nicht in `F_ROUTEN`.** *Geprüft, ob das stimmt:* der Wächter
liest `app.post(`, `app.put(` und `app.delete(` am Zeilenanfang; ein `app.get`
sieht er gar nicht. **Es bleibt bei 69, und die Zahl wird ausdrücklich
geprüft.**

**Die Namen.** `suche`, `suchAnbieter`, `suchNamen` und `suchvorlage` bedeuten
in dieser Anlage seit jeher die **Websuche** nach dem Namen eines Gegenstands.
Das Neue heißt deshalb nach **`volltext`**: `volltextBegriff()`,
`volltextTreffer()`, `qVolltext`. Der Parameter auf der Leitung heißt **`q`** —
so heißt das Eingabefeld in der Oberfläche schon (`id="q"`), und kürzer geht es
nicht. Die gespeicherten Ansichten heißen **`ansichten`**. *Kein neues `suche`
neben dem alten.*

**`testDays` nur mit eingeschalteter Zeitleiste — und die Falle, die der
Auftrag benennt, greift nicht.** Siehe Befund B in Abschnitt 4: die Kachel
liest das Feld **nicht**. Alle sieben Lesestellen sind nachgesehen, und aus der
**Listen**antwort liest genau eine — `zeitleistePunkte()`, und die steht schon
hinter `if (!ZEITLEISTE_AN) return`. **Geprüft wird trotzdem jede Lesestelle**,
und die Kachelzahlen werden an der echten Antwort nachgerechnet
(Stolperstein 102).

### Zu 1b — die gespeicherten Ansichten

**Wo liegen sie?** Als weiterer **persönlicher Schlüssel** `ansichten` in
`user_settings`, als JSON-Liste. Es ist genau die Form, die `filters` schon
hat, und eine Ansicht ist kein Träger wie Eintrag, Kommentar, Testtag,
Bewertung, Link oder Datei. **Keine eigene Tabelle:** sie kostete zwei Tabellen
samt Kaskade für eine Sache, die kein Recht und keinen Verfasser hat.
**Die unangenehme Hälfte der Frage:** JSON kennt keine Kaskade. Eine gelöschte
Kategorie bleibt als Nummer stehen. **Übergangen wird beim ANWENDEN, nicht beim
Lesen** — ein Lesevorgang, der die Ansicht eines Menschen umschreibt, ist
schlimmer als eine Nummer, die ins Leere zeigt. Aufgeräumt wird beim nächsten
Speichern. *Es sieht nicht wie ein Fehler aus: die Ansicht zeigt, was sie
zeigen kann.*

**Persönlich oder teilbar?** **Persönlich, ganz** — dieselbe Linie wie
`filters`, `bloecke` und `zeitleiste`. Eine geteilte Ansicht wäre ein neuer
Träger und eine neue Rechtefrage.

**Gehört der Suchbegriff in die Ansicht?** **Ja.** Die Frage ist nicht, was
technisch dazugehört, sondern **was ein Mensch erwartet, wenn er eine Ansicht
anklickt** — und das ist der Zustand, den er beim Speichern vor sich hatte.
Eine Ansicht „Bosch, ungetestet" ohne den Begriff wäre die halbe Ansicht und
zeigte beim Anklicken etwas anderes als beim Speichern.

**Wie viele? Acht.** Der Grund ist die **Zeile**: die Ansichten stehen als
Knöpfe in der Filterzeile, und mehr als acht ist keine Zeile mehr, sondern eine
Liste. *Dieselbe Zahl wie die Wiederherstellungscodes.* Der Deckel kommt vom
Server und wird in der Oberfläche **gesagt**, statt den Knopf wortlos
wegzulassen.

**Was wird aus der einen gemerkten Stellung?** **Sie bleibt, was sie ist** — die
zuletzt benutzte —, und die Ansichten stehen daneben. **Es geht ohne
Migrationscode**, und das ist nachgestellt: `ansichten` ist ein neuer
Schlüssel, eine Anlage aus 0.10.0 hat dort keine Zeile, und `getUserSetting`
gibt die leere Liste als Vorgabe. Eine Prüfung stellt eine Anlage mit
vorhandenem `filters`-Eintrag her und sieht nach, dass er unangetastet bleibt.

### Zu 1c — die Doppelerkennung

Gebaut wie beschrieben: **eine Zeile, kein Dialog**, Vergleich über den Titel,
ohne Rücksicht auf Groß- und Kleinschreibung und Sonderzeichen, **Teilstrings
ab vier Zeichen**, Sprungmarken hinein, kein Blockieren, kein Schema.
**Und ohne Route** — das war im Auftrag nicht verlangt und ergab sich beim
Hinsehen: `openCreate()` läuft in der Übersicht, und die Titel des ganzen
Bestands liegen dort schon im Browser.
**Verglichen wird über Vierergruppen.** Jede längere gemeinsame Folge enthält
eine Vierergruppe — die kurze Prüfung findet damit auch die lange, und sie
kostet bei dreihundert Titeln dreihundert `includes()` auf einer Handvoll
Gruppen. *Trigramme oder Levenshtein braucht es nicht.*

Die sieben Fragen zum **Zusammenführen** sind mit Abweichung A gegenstandslos
geworden und bleiben unbeantwortet — sie gehören in den Auftrag der Runde, die
es baut. *Vier der sieben haben allerdings schon eine Antwort geliefert, ohne
gestellt zu werden: es sind vier Schranken und nicht zwei, und der Papierkorb
gäbe eine leere Hülle zurück.*

### Zu Punkt 2 — was der Mensch sieht

**Wie oft wird gefragt? Entprellt, 220 ms, ab dem ersten Zeichen.** Eine
Mindestzahl an Zeichen wäre genau die Wegnahme, die diese Runde nicht machen
darf — ein einzelnes Zeichen fand vorher, also findet es weiter. 220 ms liegen
über dem Tastenabstand eines schnellen Schreibers (er fasst damit die meisten
Anschläge zusammen) und unter der Schwelle, an der Tippen zu haken beginnt.
*Der Fall, der wehtut, ist mitgerechnet:* auf einem Raspberry Pi über WLAN
zählt nicht der Server (15 ms), sondern die Zahl der Anfragen — und die ist
durch den Debounce gedeckelt.

**Was steht da, während gesucht wird?** **Die alte Liste, gedämpft.** Die
Zählzeile sagt „sucht …". Nie eine leere Liste.

**Was, wenn die Suchanfrage scheitert?** Der letzte erfolgreiche Stand bleibt
stehen, die Zählzeile sagt es einmal: *„Suche nicht erreichbar, gezeigt wird
der letzte Stand"*. **Gebaut und geprüft** — über eine stellbare Fehlerlage im
Mock, denn vorher *konnte* die Suche nicht scheitern.
**Kein örtlicher Rückfall auf eine Ersatzsuche.** Sie hätte die Kommentare
nicht und fände damit weniger — zwei Antworten auf dieselbe Frage, und die
schlechtere ohne Kennzeichen.

**Die ehrliche Gegenrechnung.** Sie steht in Abschnitt 6 — und sie fällt anders
aus als im Auftrag angenommen, weil es **keinen 30-Sekunden-Takt gibt**
(Befund C).

**Die Ansichten stehen bei den Filtern.** Es bleibt bei **neunzehn** Karten.
*Eine eigene Karte wäre der Ort für eine Einstellung, und eine Ansicht ist
keine; gesucht wird sie dort, wo die Filter stehen.*

**„Ähnlich: …" ist eine Zeile, kein Dialog.** Kein Blockieren, keine Rückfrage,
Sprungmarken hinein. Geprüft ist auch, dass der Knopf „Anlegen" danach
wirklich anlegt.

**Die Marke stand am Anfang der Runde** und ist damit in allen drei Prüfläufen
mitgelaufen.

**Der Zusammenführen-Dialog** entfällt mit Abweichung A.

### Zu Punkt 3 — die Missbrauchsseite

**`%` und `_`:** gegenstandslos durch die Bauform — `instr()` kennt keine
Wildcards. **Geprüft ist es trotzdem, samt der Gegenlage**, dass man beide
Zeichen suchen kann: eine Vorabbereinigung, die sie wegwirft, machte die erste
Prüfung ebenfalls grün und nähme dem Benutzer trotzdem etwas weg.

**Die Suche liefert nicht mehr als die Liste.** Gelesen wird dieselbe Tabelle
`items` ohne jede weitere Einschränkung. **Geprüft wird die Menge und nicht die
Behauptung:** jede Trefferliste ist eine Teilmenge der Liste ohne Parameter.
Ein Papierkorbeintrag steht gar nicht in `items` — das Löschen serialisiert und
entfernt die Zeile in derselben Transaktion; nachgestellt an einem Eintrag, der
vor dem Löschen gefunden wird und danach nicht mehr. **Entwürfe gibt es
nicht**, und ein **abgelehnter** Eintrag steht in der Liste und darum auch in
der Suche.

**Der Suchbegriff kommt nicht ins Sicherheitsprotokoll.** Eine lesende Route
schreibt dort nichts, und dabei bleibt es. `VORGAENGE` bleibt bei **zwanzig**.

**Braucht die Suche eine Bremse? Nein**, und das ist ausdrücklich entschieden
und nicht offengelassen. Sie steht hinter der Anmeldung; die Anmeldebremse
verteidigt gegen **Fremde**, nicht gegen Zugänge, die es schon gibt.

### Zu Punkt 4 — die Portbasen

**Nachgerechnet und bestätigt:** 53 Basen, niedrigste `HAUPT_BASIS` 3900,
höchstes Fensterende **6879**, Spanne **2980**, `VERSATZ_STUFE` 3000 —
**zwanzig Nummern Luft**, ein Fenster ist 60 breit.

**Die erste Ausweichmöglichkeit des Auftrags gibt es nicht** (Befund E): keine
der zehn Lücken innerhalb der Spanne trägt ein 60er-Fenster ohne gesperrte
Nummer.

**Entschieden: keine neue Basis, `VERSATZ_STUFE` bleibt 3000.** Die neuen
Prüflagen brauchen keine eigene Anlage. **Damit ist Punkt 6 des Vorgehens
erfüllt, ohne eine Zahl zu bewegen.**

**Und die Rechnung für den Fall, dass doch eine gebraucht wird**, steht im
Projektstand, Abschnitt 7: Basis **6880**, Stufe **3100** (brauchbar sind
3040–3045, 3091–3140 und 3381–3400). *Die Schätzung des Auftrags „ungefähr 3100
bis 3140" trifft; das Fenster 3381–3400 fehlte darin.*

---

## 4. Befunde beim Bauen

**Dreizehn Befunde. Vier berichtigen Zahlen oder Annahmen des Auftrags, zwei
haben die Bauform entschieden, und vier sind Lücken im Prüfstand — drei davon
hat die Gegenprobe gefunden.**

### Befund A — der Auftrag lag beim Sitzungsbeginn nicht im Repo

`Doku/Auftrag_0.11.0.md` war weder auf dem Arbeitsbranch noch auf `main` noch
irgendwo in der Historie. Er kam **während** der Sitzung auf `main` (Commits
`13cfdf8` und `7b4ab37`), zusammen mit dem Löschen von `Auftrag_0.10.0.md`.
Gefunden wurde er über den Titel des geschlossenen Pull Requests #71 („Auftrag
0.11.0 löst 0.10.0 ab"), bevor er auf `main` erschien. *Kein Befund an der
Anlage — aber er gehört ins Protokoll, weil die erste Viertelstunde der Runde
damit verging.*

### Befund B — die Kachel liest `testDays` nicht

**Der Auftrag benennt in 1a eine Falle: „die Oberfläche liest `it.testDays`
nicht nur für die Zeitleiste — die Kachel zählt daraus die eigenen Testtage."**
Nachgesehen an allen sieben Lesestellen in `public/app.js` trifft das nicht zu:

| Zeile | Stelle | Quelle |
|---:|---|---|
| 804 | Kurzfassung eines Blocks | Detailansicht (`item.links`, `item.attachments` daneben) |
| 1698 | `zeitleistePunkte(list)` | **Listenantwort** — und steht hinter `if (!ZEITLEISTE_AN) return` |
| 2117 | `zeitpunkteVon()` im Vergleich | `GET /api/items/:id`, nicht die Liste |
| 2866, 3236, 3239, 3249 | Detailansicht | `GET /api/items/:id` |

**`card()` rechnet aus `testCount`, `testAvg` und `testLast`** — den Zahlen aus
`testStats()`. Aus der **Listen**antwort liest `testDays` genau eine Stelle, und
die ist schon geschützt. *Das Feld konnte damit ohne Umbau der Oberfläche
wegfallen. Geprüft ist es trotzdem an jeder Lesestelle — die Regel aus
Stolperstein 102 gilt unabhängig davon, ob die Falle diesmal zuschnappt.*

### Befund C — es gibt keinen 30-Sekunden-Takt

**Der Auftrag rechnet in Punkt 2 mit „einer Antwort, die alle 30 Sekunden
einmal kommt".** `grep setInterval` über `public/` und `server.js` findet
**nichts**: es gibt keinen Takt, kein Nachladen und kein Aktualisieren im
Hintergrund. `loadAll()` läuft, wenn die Übersicht **betreten** wird — also bei
jeder Rückkehr aus einem Eintrag.

**Das ändert die Gegenrechnung, und zwar zugunsten der Runde:** die 2,50 MB
fallen nicht alle 30 Sekunden an, sondern **bei jedem Besuch der Übersicht** —
und ein Mensch, der zwischen Einträgen hin und her geht, löst sie dutzendfach je
Sitzung aus. Die Rechnung steht in Abschnitt 6.

### Befund D — vier Eindeutigkeitsschranken statt zwei

Siehe Abweichung A. `item_tags` und `item_pins` tragen zusammengesetzte
Primärschlüssel, die beim Zusammenführen genauso brechen wie die beiden
`UNIQUE`-Schranken, die der Auftrag nennt — und `item_tags` ist der
**Normalfall**.

### Befund E — es gibt keine brauchbare Lücke in der Portspanne

**Der Auftrag nennt als ersten Ausweg: „In eine Lücke innerhalb der Spanne
gehen. Es gibt welche; sie sind auszuzählen, nicht zu schätzen."**
Ausgezählt: es gibt zehn Lücken mit zusammen 430 freien Nummern, aber nur
**drei** sind mindestens 60 breit — und in jeder davon deckt **jedes** mögliche
60er-Fenster eine gesperrte Nummer.

| Lücke | Breite | woran jedes Fenster scheitert |
|---|---:|---|
| 3990–4099 | 110 | **4045** liegt so, dass jedes Fenster es trifft |
| 5010–5069 | 60 | **5060, 5061** |
| 5960–6019 | 60 | **6000** |

Die übrigen sieben sind 10 bis 50 Nummern breit. **Der erste Ausweg existiert
nicht;** es bleibt das Anheben der Stufe, und das geht genau einmal.

### Befund F — die Beschriftung der `F_ROUTEN`-Zahl war überholt

`pruefung.js` trug „Und es sind jetzt genau **64** schreibende Routen", geprüft
wurde `F_ROUTEN.length === 69`. Die Zeile war grün und log; wäre sie rot
geworden, hätte sie die falsche Zahl genannt. **Berichtigt.** *Dieselbe Art
Fehler wie Stolperstein 137, nur eine Ebene tiefer: dort war ein Papier
überholt, hier die Beschriftung einer Prüfung.*

### Befund G — der FTS5-Index ist teurer als angenommen, und er schweigt

**Der Auftrag nennt für den Trigramm-Index „2,91 MB — doppelt so viel wie der
Text".** Gemessen an 1000 Einträgen mit 1,75 MB Nettotext: **5,17 MB** über
`dbstat`, und die Datenbank wuchs um 5,14 MB — **fast das Dreifache**.

**Und der Auftrag nennt „`trigram` braucht drei Zeichen".** Das ist richtig, aber
milder formuliert, als es ist: eine Abfrage mit einem oder zwei Zeichen
**scheitert nicht**. Sie liefert **null Treffer, ohne Fehler**. Nachgestellt:
`"b"` → 0, `"bo"` → 0, `"bos"` → 1000. *Eine Schnittstelle, die bei zu kurzer
Eingabe leer statt laut antwortet, ist gefährlicher als eine, die scheitert —
Stolperstein 165.*

### Befund H — die Listenschleife übersetzte zwei Abfragen je Eintrag

`db.prepare(...)` stand zweimal **in** der Schleife über die Einträge: für die
Anhangzahl und für die Kommentartexte. Gemessen an 1000 Einträgen: **24,2 ms
so, 11,5 ms vorbereitet** — 12,7 ms von 110 ms Antwortzeit, für nichts.
*Unabhängig vom Gegenstand dieser Runde, aber an derselben Stelle;* siehe
Ergänzung D.

### Befund I — `LIKE` ist bei Umlauten nicht schreibungsblind

Der Befund, der die Bauform entschieden hat. SQLite faltet in `LIKE` und
`lower()` nur ASCII: `übergross` findet `ÜBERGROSS` **nicht** — 0 Treffer statt
1, ohne Fehler und ohne Warnung. *Der Unterschied fällt bei englischen
Testdaten nie auf.* Stolperstein 164.

### Befund J — 22 Fensterpaare im Prüfstand überlappen schon heute

Beim Auszählen der Portbasen aufgefallen: die Fenster von 22 Basenpaaren
überschneiden sich (4360/4380/4400/4420/4440 als Kette, 4940/4950 um 50
Nummern). Zwei Prüflagen auf überlappenden Fenstern könnten dieselbe Nummer
ziehen.

**Kein Handlungsbedarf, und das ist nachgesehen:** die Lagen laufen der Reihe
nach und werden am Ende ihrer Gruppe beendet — der Wächter „Und jeder einzelne
von ihnen ist beendet" hält das fest. **Aber „eine Basis je Prüflage" war nie
eine Trennung, sondern eine Buchführung**, und wer künftig zwei Lagen
*gleichzeitig* offen hält, sollte das wissen.

### Die drei Befunde aus der Gegenprobe

Sie stehen ausgeschrieben in Abschnitt 8 und als Stolpersteine 170 bis 172 im
Projektstand. **Kurz:** ein Rückbau riss den Lauf ab, weil eine Prüfung ein
Feld ungeschützt las; zwei blieben stumm, weil der Mock augenblicklich
antwortete und weil ein Zähler nur eine Teilmenge der Anfragen sah.
**Alle drei waren echte Lücken im Prüfstand, keine Fehlalarme** — und der
zweite ist der wertvollste: er hat eine Zusage aufgedeckt, die **gebaut und
ungeprüft** war.

---

## 5. Neue Stolpersteine

**Die Zählung setzt bei 164 fort; 159 bis 163 sind mit 0.10.0 vergeben.**
Neun Stück, ausgeschrieben im Projektstand, Abschnitt 6 — **die letzten drei
hat die Gegenprobe nachgefordert** (Abschnitt 8):

| Nr. | Kurzfassung |
|---:|---|
| **164** | SQLite faltet in `LIKE` und `lower()` nur ASCII — und es scheitert nicht, es findet weniger. |
| **165** | Ein FTS5-Trigramm-Index scheitert bei ein oder zwei Zeichen nicht — er liefert still null Treffer. |
| **166** | Ein `const` auf oberster Ebene eines klassischen Skripts landet NICHT am `window`. |
| **167** | Ein regulärer Ausdruck auf `body {` trifft `html, body {` zuerst. |
| **168** | Zwei Rückbauten mit derselben Nummer sind im Namensfilter des Gegenprobentreibers nicht auseinanderzuhalten. |
| **169** | Ein Feldname sagt nicht, was in dem Feld steht (`testLast` ist die letzte Note, kein Datum). |
| **170** | Eine Prüfung, die ein Feld ungeschützt liest, reißt den Lauf ab, wenn ein Rückbau das Feld wegnimmt. |
| **171** | Ein Mock, der augenblicklich antwortet, kann eine Zusage über die Reihenfolge nicht belegen. |
| **172** | Ein Zähler, der nur eine Teilmenge der Anfragen sieht, belegt nicht, dass keine Anfrage entstand. |

**171 ist der lehrreichste, und er kommt aus der Gegenprobe.** Eine Zusage über
die *Reihenfolge* zweier Antworten lässt sich an einem Mock, der augenblicklich
antwortet, überhaupt nicht prüfen — die beiden Anfragen können sich gar nicht
überholen. Der Rückbau darauf blieb stumm, und damit war belegt: die Zeile war
gebaut und ungeprüft. *Genau dafür gibt es die Gegenprobe.*

**166 ist der zweitlehrreichste.** Eine Prüflage wollte warten, bis die Suche durch
ist, und fragte `w.state.suchLaeuft`. `state` ist ein `const` auf oberster
Ebene: `w.state` ist `undefined`, die Wartebedingung war sofort falsch, und die
Schleife lief **nie** — sie sah aus wie eine Wartezeit und war keine.
Aufgefallen ist es nur, weil die Zeile daneben trotzdem grün wurde. *Die
Prüfung wartet jetzt auf die sichtbare Wirkung: solange gesucht wird, steht
„sucht …" in der Zählzeile. Das ist ohnehin die bessere Frage — es ist der
Zustand, den ein Mensch sieht.*

---

## 6. Die Messwerte — vorher und nachher

**Gemessen an einem echten Server über die echten Routen**, nicht an einem
Prüfbestand: Einträge über `POST /api/items` angelegt, je Eintrag zwei Tags,
ein Link, ein Testtag samt Tag daran, eine Kategorie und **vier Kommentare**.
Median aus sieben Läufen, warmgelaufen. *Die Messlagen liegen außerhalb des
Repos; im Arbeitsbaum bleibt keine Hilfsdatei zurück.*

### `GET /api/items` ohne Suchbegriff — vorher und nachher

| Einträge | vorher Zeit | nachher Zeit | vorher Größe | nachher Größe | Ersparnis |
|---:|---:|---:|---:|---:|---:|
| 100 | 17,3 ms | ~14 ms | 249.840 B | 52.065 B | **−79 %** |
| 300 | 39,8 ms | ~33 ms | 750.056 B | 156.449 B | **−79 %** |
| 1000 | 109,7 ms | ~93 ms | 2.500.658 B | 521.750 B | **−79 %** |

*Davon `searchText` **73 %** und `testDays` weitere **6 %**.* Die Zeiten
„nachher" sind die gemessenen abzüglich der beiden entfallenen Anteile (16,7 ms
bei 1000 Einträgen: 15,6 ms für die Kommentarabfrage je Eintrag, 1,1 ms für das
Zusammensetzen des Suchtexts).

**Der Auftrag nennt für 100 Einträge 29 ms / 0,30 MB und `searchText` bei
64 %.** Meine Messung liegt bei 17,3 ms / 0,25 MB und **73 %** — dieselbe
Größenordnung, aber der Anteil ist höher. *Der Unterschied liegt an der Länge
der Kommentare im Bestand; der Schluss ist derselbe, nur deutlicher.*

### Die Suche selbst, an 1000 Einträgen / 1,75 MB Suchtext

| Weg | häufiges Wort | ein Zeichen | seltener Begriff | Verhalten |
|---|---:|---:|---:|---|
| JS-Durchlauf über Sammelabfragen | 11,4 ms | 11,0 ms | 11,4 ms | gleich wie vorher |
| SQL `LIKE` | 0,62 ms | 0,61 ms | 0,62 ms | **bricht bei Umlauten und Wildcards** |
| **SQL `instr(kkl())`** — gebaut | **1,9 ms** | **1,5 ms** | **13,2 ms** | **gleich wie vorher** |
| FTS5-Trigramm | 0,97 ms | — | 3,05 ms | **still null bei 1–2 Zeichen** |

**Der FTS5-Index:** 5,17 MB bei 1,75 MB Nettotext (`dbstat`), die Datenbank
wuchs um 5,14 MB.

### Die Kosten innerhalb der Listenschleife, an 1000 Einträgen

| Was | Zeit |
|---|---:|
| beide Abfragen je Eintrag übersetzt (wie bisher) | 24,2 ms |
| beide vorbereitet | **11,5 ms** |
| nur die Kommentarabfrage, je Eintrag übersetzt | 15,6 ms |
| den Suchtext zusammensetzen (`join` + `toLowerCase`) | 1,1 ms |

### Die ehrliche Gegenrechnung

**Der Auftrag verlangt sie ausdrücklich.** Sie lautet mit Befund C:

- **Vorher:** jeder Blick in die Übersicht kostet **2,50 MB / 110 ms** (bei 1000
  Einträgen). Die Suche danach kostet nichts.
- **Nachher:** jeder Blick kostet **0,52 MB / 93 ms**. Jede entprellte Suche
  kostet **~15 ms** am Server und die Größe ihrer Treffer — bei 30 Treffern
  etwa **16 kB**.

**Ersparnis je Besuch: 1,98 MB.** Bei 16 kB je Suche lohnt sich die Runde,
solange weniger als **rund 120 Suchen je Besuch** anfallen. *Ein Mensch tippt
in einer Sitzung eine Handvoll Begriffe.*

---

## 7. Der Prüfstand

**Acht neue Gruppen**, dazu Erweiterungen an vorhandenen. **Keine neue
Portbasis** — die Rechnung dazu steht in Abschnitt 3 und im Projektstand.

### Am Server

**„Die Volltextsuche"** — **je eine Lage für jede der sieben Quellen einzeln**,
mit **erfundenen** Suchwörtern („münchenquelle", „grünspanig", „nebelfeucht",
„xyzzyquux", „quastenflosser"), damit jede Trefferzahl **exakt** ist und nicht
„mindestens einer". *Eine Suche, die zufällig etwas anderes mitfindet, färbte
die Gruppe sonst nie rot.* Fällt eine Quelle aus der Abfrage, wird **genau
sie** namentlich rot — das belegen die Rückbauten 125 bis 131.
Dazu: die Schreibung samt Umlauten **in beide Richtungen**, ein Teilstring aus
einem und aus zwei Zeichen, `%` und `_` als Text **samt der Gegenlage**, dass
man beide suchen kann, der außen getrimmte Begriff, ein Begriff aus lauter
Leerzeichen, und die Zusicherung, dass **jede Trefferliste eine Teilmenge der
Liste ohne Parameter** ist — nachgestellt an einem Eintrag, der vor dem Löschen
gefunden wird und danach nicht mehr.

**„searchText ist fort, und sonst nichts"** — **Feld für Feld** gegen eine
namentliche Liste von 21 erwarteten Feldern. *Eine Antwort, aus der still ein
zweites Feld verschwindet, macht die Kachel falsch, ohne dass eine Prüfung rot
wird.* Dieselbe Frage an die Antwort auf eine **Suche**: dieselbe Form, kein
zweiter Zuschnitt. Und die Beschreibung bleibt draußen, wie bisher.

**„testDays hängt an der Zeitleiste"** — mit und ohne, **und die Kachelzahlen
werden an der echten Antwort nachgerechnet** (Stolperstein 102). Dazu, dass der
**Detailweg** die Testtage weiter liefert und die **Suche** in derselben Form
antwortet wie die Liste.

**„Gespeicherte Ansichten"** — Deckel (acht gehen, neun nicht), Namenspflicht,
Name aus Leerzeichen, Namensgleichheit ohne Rücksicht auf die Schreibung, dass
eine abgewiesene Liste **nichts verändert** hat, und — die Lage, auf die es
ankommt — **dass die Absage kommt, BEVOR `filters` geschrieben ist**: eine
Anfrage mit einer gültigen Stellung *und* einer unmöglichen Ansichtenliste darf
die Stellung nicht schon geschrieben haben.
Dazu die gelöschte Kategorie (der Server wirft nichts und **räumt nichts weg**),
die Persönlichkeit an einem **zweiten Zugang**, das Überleben von Abmelden und
Anmelden, und dass ein **gewöhnlicher** Zugang eigene Ansichten speichern darf.

### Am Bildschirm

**Jedes Ereignis wird wirklich zugestellt** (Stolperstein 61): `dispatchEvent`
samt Durchlauf des Event Loops, nicht der von Hand gerufene Behandler.

**„Die Suche fragt den Server"** — dass ohne Suche **keine** Suchanfrage
hinausgeht; dass Tippen eine schickt und der Begriff **richtig verpackt** darin
steht; dass gezeichnet wird, was zurückkam; dass die Zählzeile **den ganzen
Bestand** nennt und nicht die Trefferzahl; dass **drei Anschläge schnell
hintereinander EINE Anfrage sind** und der **zuletzt** getippte Begriff gewinnt;
dass das **Leeren ohne Anfrage** auskommt und das Kreuz danach fort ist.
**Und der Rückfall:** scheitert die Suche, bleibt die Liste stehen, die
Zählzeile sagt es, und es steht **keine Absage** („Keine Treffer") da.

**„Gespeicherte Ansichten in der Oberfläche"** — dass die Zeile **in der
Filterzeile** steht und auch leer dasteht; Speichern über den Namensdialog samt
**Filterstellung UND Suchbegriff**; Wählen (Begriff ins Feld, Suche läuft,
Sortierung steht, Knopf ist als geltend markiert, Kreuz zum Leeren steht da);
Löschen samt Rückfrage und gekürzter Liste; der **Deckel**, der gesagt und
nicht angedeutet wird; und die Ansicht mit **fremden Nummern**, die nichts
wirft und den Bestand zeigt statt einer leeren Liste.

**„Doppelte Einträge beim Anlegen"** — unter vier Zeichen still, ab vier
Zeichen der Hinweis, die Schreibung egal, Sonderzeichen fallen weg, kein
Hinweis ohne Ähnlichkeit, die **Sprungmarke**, und — die Zeile, auf die es
ankommt — **dass sie nichts blockiert**: der Knopf ist nicht gesperrt, und ein
Klick darauf legt wirklich an. Dazu die Lage mit **laufender Suche**: der
Hinweis findet den Eintrag auch dann, wenn die Suche ihn ausblendet.

**„Die Marke am Bildschirm"** — Kopfzeile und Anmeldeseite laden dieselbe
Datei, im Verhältnis **19:23** und nicht mehr quadratisch.

### Erweitert

**„Die Marke der Anlage"** — die Farbe an **beiden** Dateien (und dass nirgends
mehr Gold steht, und dass die drei übrigen Striche grau bleiben), das enge
`viewBox` der durchsichtigen Fassung, das **Quadrat** der Fassung mit Kachel,
und **die Höhe, nachgerechnet und nicht abgeschrieben**: der Wächter liest die
Zeilenhöhe des `body` und die beiden Schriftgrößen aus dem Stylesheet und
rechnet `(1,23 + 0,77) × 1,55` selbst aus. *Verstellt jemand eine der
Schriftgrößen, fällt es hier auf.* Dazu, dass daneben **keine Höhe in Pixel**
steht und dass die Breite dem Seitenverhältnis folgt.

**Die Liste der persönlichen Schlüssel** steht bei **acht**; die Lage schreibt
`ansichten` beim ersten Zugang und **nicht** beim zweiten, und eine eigene
Zeile hält fest, dass die Ansicht des einen nicht beim anderen steht.

**Der Wächter über die Migrationsblöcke** bekommt die Zeile, dass es **keinen
für 0.11.0** gibt — die Zusage „kein Schema" ist damit geprüft und nicht
behauptet.

**Der Mock antwortet auf `?q=` wie der echte Server** (Stolperstein 90) und
trägt **kein `searchText`** mehr — 13 Vorlagen sind bereinigt. Er filtert dabei
über den **Titel** und nicht über sieben Quellen: die sieben prüfen die
Servergruppen an einer echten Datenbank, und ein Mock, der die Suche selbst
nachbaute, belegte genau das, was er selbst tut (Stolperstein 102).
**Der Fehlerfall ist stellbar** (`suchFehler`) — bis 0.10.0 *konnte* die Suche
nicht scheitern, und ohne diese Lage ließe sich der Rückfall nicht prüfen,
sondern nur hoffen.

**`warteSuche(w)`** — ein Wartehelfer, der auf die **sichtbare Wirkung**
wartet und nicht auf eine Frist. Siehe Stolperstein 166.

---

## 8. Gegenprobentabelle

**34 Rückbauten, gefahren über `gegenprobe.js` gegen einen committeten Stand** —
jeder in einer eigenen Kopie aus `git archive HEAD`, der Arbeitsbaum bleibt
unangetastet. Die Nummern laufen von **124 bis 157**; 125 Rückbauten werden
**159**.

**DREI FUNDE, UND ALLE DREI WAREN ECHT.** Der erste vollständige Lauf meldete
einen **abgerissenen** und zwei **stumme** Rückbauten. Keiner davon war ein
Fehlalarm — jeder hat eine Lücke im Prüfstand aufgedeckt:

| Rückbau | Meldung | die Lücke | behoben |
|---|---|---|---|
| **137** — testDays fehlt immer | **LAUF ABGERISSEN** | „Der Aufbau steht: ein Eintrag trägt wirklich einen Testtag" las `vsMitTest.testDays.length` **ungeschützt**. Fällt das Feld weg, wirft der Zugriff — und der Lauf riss ab, statt eine Prüfung rot zu färben (Stolpersteine 138 und 161). | `(… \|\| []).length` — aus dem Wurf wird `0 === 1`, ein roter Punkt. Erst das Vorhandensein, dann die Eigenschaft (Stolperstein 81). |
| **139** — die Reihenfolge der Antworten | **STUMM** | Der Mock antwortete **augenblicklich**; zwei Anfragen können sich dann gar nicht überholen. Die Zusage war gebaut und ließ sich **nicht belegen**. | Der Mock bekommt eine stellbare Bremse je Suchanfrage (`suchBremsen`), und eine neue Lage lässt die **erste** Antwort 400 ms später eintreffen als die zweite. |
| **142** — das Leeren holt neu | **STUMM** | Der Zähler sah nur Anfragen mit `?q=`. Der Rückbau fragt aber `/api/items` **ohne** Parameter — die Zahl bewegte sich nicht. | Gezählt werden jetzt **alle** Anfragen an die Liste. Die Frage lautet „kostet das Leeren eine Anfrage", und die Antwort steht in dieser Zahl. |

**Nach den drei Korrekturen: 0 stumm, 0 abgerissen.** Rückbau 137 färbt
**sieben** Prüfungen rot, 139 und 142 je **eine** — und zwar genau die, die
seine Zusage trägt.

**Die Tabelle ist aus zwei Läufen zusammengesetzt, und das gehört gesagt.** Die
27 unveränderten Zeilen stammen aus dem vollen Lauf gegen `e467a83`; die
**sieben** Zeilen, die die berichtigten Lagen überhaupt berühren können (136 bis
142), sind gegen `f1f41ea` **nachgefahren**. *Die übrigen 27 können sie nicht
berühren: die neue Lage ist eine Lage am Bildschirm, und die geänderte Zeile
liegt in einer Gruppe, die allein 136 und 137 anfassen.*

| # | Rückbau | Namentlich rot |
|---|---|---|
| 124 | Der Parameter q wird nicht mehr gelesen | 18 Prüfungen, darunter „Die Suche findet über den Titel" (Gruppe „Die Volltextsuche") |
| 125 | searchText steht wieder in der Antwort | „searchText steht nicht mehr in der Antwort", „Die Antwort auf eine Suche trägt dieselben Felder" |
| 126 | Die Suche sieht den Titel nicht mehr an | 11 Prüfungen, darunter „Die Suche findet über den Titel" (2 Gruppen) |
| 127 | Und die Beschreibung nicht | „Die Suche findet über die Beschreibung", „Auch in der Beschreibung" |
| 128 | Und den Namen der Kategorie nicht | „Die Suche findet über den Namen der Kategorie" |
| 129 | Und die Tags am Eintrag nicht | „Die Suche findet über einen Tag am Eintrag" |
| 130 | Und die Tags an den Testtagen nicht | „Suche findet Tags, die nur am Testtag hängen", „Die Suche findet über einen Tag am Testtag" |
| 131 | Und die Adressen der Links nicht | 4 Prüfungen, darunter „Suchtexte werden mit durchsucht" (2 Gruppen) |
| 132 | Und die Kommentartexte nicht | „Die Suche findet über den Text eines Kommentars" |
| 133 | Die Kleinschreibung faltet nur noch ASCII | 6 Prüfungen, darunter „Die Suche findet über den Titel" (Gruppe „Die Volltextsuche") |
| 134 | Der Titel wird wieder ueber LIKE gesucht -- Wildcards wirken | „Das Prozentzeichen wirkt als Text und nicht als Wildcard", „Der Unterstrich ebenso" |
| 135 | Die Liste ohne Begriff verschweigt die abgelehnten Eintraege | „Der Aufbau steht: im Bestand liegt ein abgelehnter Eintrag", „Die Suche liefert nichts, was die Liste verschweigt" |
| 136 | testDays kommt wieder immer mit | „Ausgeschaltet fehlt das Feld ganz", „Und die Suche antwortet in derselben Form" |
| 137 | testDays fehlt immer, auch mit eingeschalteter Zeitleiste | 7 Prüfungen, darunter „Übersicht liefert die Testtage selbst, nicht nur die Anzahl" (4 Gruppen) |
| 138 | Der Debounce faellt weg -- jeder Anschlag fragt | „Drei Anschlaege schnell hintereinander sind EINE Anfrage" |
| 139 | Die Reihenfolge der Antworten wird nicht mehr geachtet | „Die spaeter eintreffende AELTERE Antwort ueberschreibt sie NICHT" |
| 140 | Bei gescheiterter Suche wird die Liste leer | „Scheitert die Suche, bleibt die Liste stehen", „Und die Liste ist nicht leer und traegt keine Absage" |
| 141 | Die Zaehlzeile nennt die Trefferzahl als Bestand | „Die Zaehlzeile nennt weiter den ganzen Bestand" |
| 142 | Das Leeren holt den Bestand neu vom Server | „Leeren holt den Bestand ohne neue Anfrage" |
| 143 | Die Ansichten sind kein persoenlicher Schluessel mehr | „server.js kennt genau die acht persoenlichen Schluessel", „Eine gespeicherte Ansicht überlebt Abmelden und Anmelden", „Ein gewöhnlicher Zugang darf eigene Ansichten speichern" |
| 144 | Der Deckel fuer Ansichten faellt weg | „Die neunte wird abgewiesen", „Und die abgewiesene Liste hat nichts verändert" |
| 145 | Zwei Ansichten duerfen wieder denselben Namen tragen | „Zwei mit demselben Namen ebenso — ohne Rücksicht auf die Schreibung" |
| 146 | Die Ansichten werden geprueft, NACHDEM filters geschrieben ist | „Und sie hat die Filterstellung NICHT schon geschrieben" |
| 147 | Das Speichern einer Ansicht raeumt die gemerkte Stellung weg | „Die Filterwahl ebenso", „Die eine gemerkte Filterstellung steht unverändert daneben" |
| 148 | Der Suchbegriff faellt aus der gespeicherten Ansicht | „Und zwar samt Namen, Filterstellung UND Suchbegriff" |
| 149 | Eine geloeschte Kategorie bleibt in der angewandten Ansicht stehen | „Und sie zeigt den Bestand statt einer leeren Liste" |
| 150 | Der Titelvergleich achtet wieder auf Gross- und Kleinschreibung | „Und die Schreibung spielt dabei keine Rolle", „Sonderzeichen fallen beim Vergleich weg" |
| 151 | Der Hinweis greift erst ab acht Zeichen | „Ab vier Zeichen nennt sie den aehnlichen Eintrag", „Und die Schreibung spielt dabei keine Rolle", „Sonderzeichen fallen beim Vergleich weg" |
| 152 | Der Hinweis vergleicht nur die Trefferliste statt des Bestands | „Der Hinweis findet den Eintrag auch dann, wenn die Suche ihn ausblendet" |
| 153 | Die durchsichtige Fassung traegt wieder Gold | „marke-dunkel.svg traegt den Akzent am hervorgehobenen Strich", „Und marke-dunkel.svg traegt nirgends mehr Gold" |
| 154 | Die Fassung mit Kachel traegt wieder Gold | „favicon.svg traegt den Akzent am hervorgehobenen Strich", „Und favicon.svg traegt nirgends mehr Gold" |
| 155 | Das viewBox umschliesst wieder die Kachel statt der Farbe | „Das viewBox der durchsichtigen Fassung umschliesst die Farbe" |
| 156 | Die Hoehe der Marke steht wieder in Pixel | „Die Marke der Kopfzeile steht so hoch wie Titel und Zaehlzeile zusammen", „Und keine der beiden traegt daneben eine Hoehe in Pixel" |
| 157 | Das Markup gibt die Marke wieder quadratisch an | 4 Prüfungen, darunter „Und das Markup traegt dasselbe Verhaeltnis" (2 Gruppen) |

**Gelesen wird diese Tabelle so:** in der rechten Spalte steht, was **wirklich**
rot wurde, und nicht, was erwartet war. Steht dort eine andere Gruppe als
gedacht, ist das der Befund — nicht die Erwartung.

---

## 9. Prüfungszahlen

| | vorher (0.10.0) | nachher (0.11.0) |
|---|---:|---:|
| Prüfungen | **3676** | **3815** |
| davon neu | — | **139** |
| Rückbauten in `gegenprobe.js` | 125 | **159** |
| davon neu | — | **34** |
| Portbasen | 53 | **53** |
| `F_ROUTEN` | 69 | **69** |
| persönliche Schlüssel | 7 | **8** |
| `VORGAENGE` | 20 | **20** |
| `MERKMALE` | 13 | **13** |
| `BESTAETIGUNG_ZWECKE` | 7 | **7** |
| Karten im Systembereich | 19 | **19** |
| Vokabulareinträge | 11 | **11** |
| Formatnummer | 10 | **10** |
| markierte Migrationsblöcke | 5 | **5** |
| Laufzeitabhängigkeiten | 5 | **5** |

**Die Prüfläufe, der Reihe nach und ohne Beschönigung:**

1. **Nach dem Bau, vor den neuen Prüfungen.** Der erste Lauf **riss ab** statt
   rot zu werden: zwei Prüfungen fragten das Feld `searchText` der
   Listenantwort, das es nicht mehr gibt, und `undefined.includes(...)` beendete
   den Lauf. *Genau das Fehlerbild, das Stolperstein 138 beschreibt.* Nach dem
   Nachziehen der beiden Zeilen: **3674 von 3676**, zwei rot — die Liste der
   persönlichen Schlüssel (sieben, jetzt acht) und der Sprachwächter, der in
   einem frischen Kommentar ein eingedeutschtes Wort für den Event Loop fand.
   *Beide Wächter haben genau das gefangen, wofür sie da sind — und der
   Sprachwächter ein zweites Mal in dieser Runde, an einem Satz dieses
   Protokolls, der das Wort nur zitieren wollte. Er kann Zitat und Gebrauch
   nicht unterscheiden, und das ist die richtige Seite des Fehlers.*
2. **Nach den neuen Prüfungen.** **3802 von 3807**, fünf rot: drei an der
   nachgerechneten Höhe der Marke (Stolperstein 167), eine an der Zahl der
   persönlichen Schlüssel in einer zweiten Lage, und eine an einer falschen
   Erwartung in einer frisch geschriebenen Prüfung (Stolperstein 169).
   Danach **3806 von 3807**, eine rot — die Zeilenzahl eines zweiten Zugangs.
   Danach **3808 von 3808**. Die Gegenprobe hat danach in zwei Anläufen
   sieben weitere Zeilen nachgefordert (Abschnitt 8, die drei Funde) —
   **3811**, dann **3815**.
3. **Nach den Papieren und der Versionsnummer** — unverändert grün.
4. **Zum Schluss gegen genau den Stand, der geschoben wird** — siehe die Zeile
   unter der Tabelle.

*Vier Läufe statt der verlangten drei, weil die Papiere und die Versionsnummer
nach dem dritten kamen und ein Lauf dagegen billiger ist als eine Annahme.*

---

## 10. Was ausdrücklich nicht passiert ist

- **Kein FTS5, kein Suchindex, keine Suchtabelle.** Nachgerechnet, nicht
  behauptet — Abschnitt 6.
- **Kein gespeicherter Suchtext.** Weder als Spalte an `items` (die der sechste
  Migrationsblock wäre) noch als eigene Tabelle. *Damit gibt es keine der
  sieben Nachziehstellen beim Schreiben, die man vergessen könnte.*
- **Keine neue Abhängigkeit, nicht eine** — auch keine für den Prüfstand.
- **Keine Schemaänderung, kein Migrationscode.** `migration0110()` gibt es
  nicht, und ein Wächter hält fest, dass es sie nicht gibt.
- **Keine neue Zeile in der `.env`**, die `docker-compose.yml` ist unberührt.
- **Keine neue Route.** `F_ROUTEN` bleibt bei 69.
- **Keine neue Karte im Systembereich.** Es bleibt bei neunzehn.
- **Kein neuer Vorgang im Sicherheitsprotokoll**, kein neues Merkmal, kein
  neuer Bestätigungszweck.
- **Keine neue Portbasis** und keine Änderung an `VERSATZ_STUFE`.
- **Kein Nachladen beim Scrollen**, und **kein Blättern mit Seitenzahlen** —
  weder jetzt noch später.
- **Kein Aufräumen von `renderSystem()`.** Das Ideenpapier bekommt die
  berichtigten Zahlen, mehr nicht.
- **Das Konzeptpapier ist nicht angefasst und nicht umbenannt.**
- **Kein Zusammenführen zweier Einträge** — Abweichung A.
- **Keine Hilfsdatei im Arbeitsbaum.** Die Messlagen liefen außerhalb des
  Repos.

---

## 11. Offen geblieben

- **DER TAG `v0.11.0` IST GESETZT, ABER NICHT GESCHOBEN.** Der Push scheitert
  in der Arbeitsumgebung unverändert mit `HTTP 403` — **Branches gehen durch,
  Tags nicht.** Er braucht einen Push von einer Stelle mit den nötigen Rechten:

  ```bash
  git push origin v0.11.0
  ```

  **Wirkung: der Vergleichsverweis `[0.11.0]` am Ende von `CHANGELOG.md` zeigt
  ins Leere.** An der Anlage ändert es nichts.
  *`v0.10.0` dagegen liegt inzwischen am Remote — nachgesehen mit
  `git ls-remote --tags origin`, er zeigt auf `f1dc213`. Der offene Punkt aus
  0.10.0 hat sich damit erledigt, und das Repo trägt **fünfzehn** Tags statt
  vierzehn.*
- **Der Rundlauf für 0.11.0 am laufenden Server steht aus.** Drei Handgriffe
  belegen die Runde: nach einem **Kommentartext** suchen und den Eintrag
  finden; eine **Ansicht** speichern, abmelden, anmelden, die Ansicht wählen;
  einen **Doppeleintrag** antippen und die Zeile „Ähnlich" sehen. Das Ergebnis
  gehört in den Projektstand, Abschnitt 2.
- **Der Fingerprint der laufenden Anlage nach dem Einspielen ist zu
  vergleichen.** Die Marke hat zwei Dateien in `public/` verändert; der Wert
  muss sich also bewegt haben — und er muss dem im Branch entsprechen.
- **Der Schlüsselwechsel auf der echten Anlage steht weiterhin aus.** Er
  braucht keine Runde und keinen Auftrag; das Ergebnis gehört in den
  Projektstand, Abschnitt 2. *Nicht Teil dieser Runde gewesen.*
- **Das Zusammenführen zweier Einträge** wartet auf eine eigene Runde —
  mit vier Eindeutigkeitsschranken, acht Tabellen, einer Route
  (`F_ROUTEN` 69 → 70, `nurAdmin` und `zweitbestaetigt`), einem Vorgang im
  Sicherheitsprotokoll (zwanzig → einundzwanzig) und der Sicherung des
  Datenverzeichnisses als **Pflicht**.
- **Der QR-Encoder** ist weiterhin vorgemerkt (aus 0.10.0 herausgenommen).
- **Die zu großen Funktionen.** `renderSystem()` steht bei **2.030** Zeilen und
  ist damit die längste Funktion der Anlage; `renderDetail()` bei **1.499**.
  Nicht als Vorhaben, sondern beim nächsten Anfassen je ein Block heraus.
- **Der Prüfstand trägt noch EINE neue Prüflage mit eigener Basis**, dann ist
  Schluss — Befund E und Projektstand, Abschnitt 7.
- **Ein echter Teillauf im Prüfstand** fehlt weiterhin: `pruefung.js` ist EIN
  Ablauf, der Namensfilter filtert die Ausgabe und nicht die Arbeit.
