# Auftrag 0.21.0 — „Vor dem Test schätzt man, nach dem Test bewertet man"

**Vorher: der Stand, auf dem diese Runde aufsetzt.** *Seine Versionsnummer, sein
Fingerprint, die Zahl der Prüfungen, der Rückbauten (samt höchster Nummer), der
Stolpersteine, `F_ROUTEN`, die Zwecke der zweiten Bestätigung, die Migrationsblöcke,
das Austauschformat, die Karten im Systembereich und die ausgelieferten Module stehen
im Änderungsprotokoll des Vorgängers* — **und werden von dort übernommen, beim Start
des Chats, nicht beim Schreiben dieses Auftrags.**

> **DIESER AUFTRAG NENNT KEINE FESTEN ZAHLEN, UND ZWAR MIT ABSICHT.** Er ist eine
> **zwischengeschobene Runde** (siehe „Die Nummer"), und was vor ihm gebaut wird,
> entscheidet sich nach seinem Schreiben. *Jede Zahl, die er nennte, wäre am Bautag
> mit einiger Wahrscheinlichkeit falsch.* Deshalb steht hier nur, **was diese Runde an
> den Zahlen ändert:**
>
> | | diese Runde |
> |---|---|
> | Schema | **eine Spalte** an `rating_criteria` |
> | Migrationsblöcke | **einer mehr** |
> | Austauschformat | **um eins höher** |
> | `F_ROUTEN` | **eine weniger** — `DELETE /api/items/:id/ratings` verliert seinen Weg vom Bildschirm und fällt (Abschnitt 5) |
> | Zwecke der zweiten Bestätigung | unverändert |
> | Karten im Systembereich | **eine mehr** |
> | ausgelieferte Module | unverändert |
> | Vokabular | **ein Wort mehr** |
> | Prüfstand, Rückbauten, Stolpersteine | wachsen — **ab der jeweils nächsten freien Nummer** |
>
> **Die Zeilenangaben zu `server.js`, `db.js` und `public/app.js` sind Orientierung
> auf dem Stand 0.19.5, keine Zusage.**

---

> **DIE INSTALLATION KANN HEUTE NICHT SAGEN, WELCHE UNGETESTETE IDEE ALS NÄCHSTES
> DRAN IST.** Ein Eintrag mit `tested = 0` ist eine Idee, ein gesehenes Modell, ein
> Vorhaben — und die einzige Zahl, die er bekommen kann, ist die Bewertung. **Die
> Bewertung ist aber die Antwort auf „wie gut war es"**, und ein Stern an einer Idee
> beantwortet eine andere Frage: „wie sehr will ich es". *Wer Ideen mit den
> vorhandenen Kriterien bewertet, mischt zwei Fragen in einen Durchschnitt, und
> niemand sieht es der Zahl an* (Stolperstein 47, in seiner reinsten Form).
>
> **DIESE RUNDE GIBT DER ZWEITEN FRAGE IHREN EIGENEN KASTEN.** Ein Kriterium weiß ab
> jetzt, ob es *vorher* oder *nachher* gilt. Der Rest — Sterne, Gewichte, Durchschnitt,
> Kopfzahl, Erklärung, Vergleich, Systemkarte — ist die vorhandene Mechanik, ein
> zweites Mal angewandt. **Kein zweiter Sternmechanismus, keine zweite Tabelle, keine
> zweite Rechnung.**

**Das Konzept dazu steht in `Doku/Konzept_Potenzial.md`** — in Alltagssprache, mit
der Recherche, den verworfenen Wegen und den Regeln. *Dieser Auftrag setzt es um und
wiederholt es nicht; wo er davon abweicht, sagt er es.*

---

## Der Befund, in einer Tabelle

| heute | danach |
|---|---|
| ein Kasten „Bewertung", ein Durchschnitt `avgRating` | zwei Kästen — **Potenzial** (vorher) und **Bewertung** (nachher) —, zwei Durchschnitte `potenzialRating` und `avgRating`, **die einander nicht berühren** |
| Kriterien gelten für jeden Eintrag gleich | ein Kriterium gehört zu genau einem Kasten; `rating_criteria.phase` sagt zu welchem |
| Sortierung nach Bewertung | dazu Sortierung nach Potenzial, gleiche Bauform |
| Einklappzustand des Bewertungsblocks ist eine gespeicherte Einstellung | für die beiden Sternkästen entscheidet der Zustand des Eintrags; ein Klick gilt bis zum Verlassen |
| das Wort „Bewertung" steht fest | das Wort **„Potenzial" steht im Vokabular** und ist änderbar |
| Zurücksetzen: ein langer Kopfknopf für alle Kriterien und ein versteckter Doppelklick je Zeile | **ein sichtbares × je Zeile, an den eigenen Sternen**; der Kopf wird kurz |
| die Sterne springen nach links, sobald der erste Durchschnitt erscheint | die Durchschnittszelle hat ihre Breite von Anfang an und zeigt „–", solange niemand bewertet hat |

---

## Die Nummer: MINOR — 0.21.0, zwischengeschoben

**Der Maßstab ist die Frage: kann die Installation danach etwas, was sie vorher nicht
konnte?** Ja — sie kann ungetestete Einträge nach Potenzial sortieren, und sie kann
Ideen einschätzen, ohne die Bewertung zu verderben. Also MINOR.

**DIESE RUNDE NIMMT DIE 0.21.0 UND WIRD EINGESCHOBEN** — zwischen 0.20.0 („Alte
Sicherungen aufräumen") und das, was im Fahrplan bisher 0.21.0 hieß. *Warum hinter
0.20.0:* die klemmt — eine Installation, die Sicherungen schreibt und keine entfernt,
füllt ihre Platte; diese Runde klemmt nicht. *Warum vor der Oberfläche:* sie fasst den
Bewertungsblock an, den „Die Oberfläche wird ruhiger" umgestaltet — **wer erst
umgestaltet und dann einen zweiten Block danebenstellt, gestaltet zweimal** (dieselbe
Rechnung wie bei der Mehrsprachigkeit). *Warum vor der Bereinigung:* sie bringt einen
Migrationsblock, und die Bereinigung baut die Blöcke aus.

**ALLES, WAS IM FAHRPLAN AB 0.21.0 STAND, RÜCKT — UND ZWAR NACH EINER NEUEN REGEL:**

> **ZWISCHEN ZWEI GEPLANTEN RUNDEN BLEIBT AB JETZT EINE NUMMER FREI.** Der Fahrplan ist
> seit 0.12.0 siebenmal gerückt worden, und jedes Mal um den ganzen Rest, weil kein
> Platz für eine eingeschobene Runde war. *Eine freie Nummer je Zwischenraum lässt die
> nächste eingeschobene Runde dort Platz finden, ohne dass sich dahinter etwas
> bewegt.* **Ist ein Zwischenraum belegt, rückt der Rest so, dass die Lücken wieder
> da sind.** SemVer verlangt keine lückenlosen Nummern, und Abschnitt 5 des
> Projektstands sagt es seit langem: *die Instanz darf mit jeder Nummer herausgehen.*

Der Fahrplan zum Zeitpunkt dieses Auftrags, nach dieser Regel:

| Nummer | Runde |
|---|---|
| 0.20.0 | Alte Sicherungen aufräumen — *bleibt, klemmt* |
| **0.21.0** | **diese Runde — eingeschoben** |
| 0.22.0 | Die Oberfläche wird ruhiger |
| 0.23.0 | *frei* |
| 0.24.0 | Die wählbare Bildablage |
| 0.25.0 | *frei* |
| 0.26.0 | Bereinigung — der Bruch |
| danach | im selben Takt: eine geplante, eine freie |

*Was künftig eingeschoben wird, nimmt die nächste freie Nummer und rückt nichts.*
**Der Grund für jedes Rücken steht im Fahrplan, nicht nur die neue Zahl** (Stolperstein
201) — und der Satz, mit dem die Oberfläche zuletzt gerückt wurde, bleibt stehen und
bekommt seine Fortsetzung.

**Schema: ja — eine Spalte. Migration: ja — ein Block mehr. Neue Route: nein — eine fällt.
Austauschformat um eins höher. Eine Karte mehr. Kein neuer Zweck, kein neues Modul.**

> **DIESE RUNDE IST EINE DATENBANKSTUFE.** `rating_criteria` bekommt eine Spalte, und
> die Zeile im Änderungsprotokoll muss es sagen. *Der Rückweg auf den Vorgänger bleibt
> technisch offen — `ADD COLUMN` mit `DEFAULT` stört keine ältere Fassung —, aber dort
> zählten Vorher-Sterne wieder in die Bewertung.* **Eine Sicherung vor dem Einspielen,
> wie bei jeder Stufe.**

---

## 1. Was zu messen ist, BEVOR gebaut wird

**Am Server eine Zahl, und sie ist klein.** `qSchnittJeKriteriumAlle` (`server.js:2483`) läuft
seit 0.19.3 einmal je Übersicht — *dort gemessen mit 2,70 ms über 400 Einträge.* **Sie
bekommt `c.phase` in `SELECT` und `GROUP BY`.** *Erwartet: keine messbare Änderung,
denn `phase` steht an der Kriterienzeile, die der `JOIN` ohnehin trifft.* **Erwartet
ist nicht gemessen** — dieselbe Abfrage vorher und nachher über denselben Bestand, kalt
und warm, und die Zahl gehört ins Protokoll. *Liegt sie deutlich über dem Vorher-Wert,
ist etwas anderes falsch als die Spalte.*

**Die Maße der Sternzeile stehen in 5.5** — Mindestbreite der Durchschnittszelle und
die zweite Zeile auf dem Telefon. **Alles andere ist keine Messfrage.** Der Rest dieser
Runde ist Bauform, und die Bauform steht.

---

## 2. Das Schema — eine Spalte

**In `db.js`, an `rating_criteria` (`db.js:234`):**

```
phase TEXT NOT NULL DEFAULT 'nachher'
```

* **Zwei Werte, `vorher` und `nachher`, und sonst keiner.** *Deutsch, weil der
  Sprachwächter mitliest — und weil die Werte in `SELECT`s stehen werden, die jemand
  liest.* **Kein `CHECK` an der Spalte**, aus demselben Grund wie bei `gewicht`: die
  Menge der Werte stünde sonst zweimal, hier und in `PHASEN` im Server, und die
  zweite meldete sich nicht als Absage mit Meldung, sondern als abgebrochene
  Schreibung. **`PHASEN = ['vorher', 'nachher']` steht genau einmal, in `server.js`.**
* **`DEFAULT 'nachher'`, und die Bestandszeilen bekommen ihn aus dem `DEFAULT`, nicht
  aus einem `UPDATE`** — dieselbe Regel wie bei `gewicht` in Migration 0.8.40
  (`db.js:820`): *jeder andere Wert änderte beim Einspielen still sämtliche
  Gesamtschnitte.* Was heute Kriterium ist, ist Bewertungskriterium. Punkt.
* **`UNIQUE(name)` BLEIBT GLOBAL.** Ein Name, ein Kasten. *Die Einschränkung ändern
  hieße Tabellenneubau (SQLite kennt kein `ALTER CONSTRAINT`), und „Wunsch" in beiden
  Kästen wäre für den Benutzer ohnehin ein Rätsel.*
* **Der neue Migrationsblock** folgt dem Muster von `migration0840()`:
  `PRAGMA table_info`, Spalte fehlt → `ALTER TABLE ... ADD COLUMN`, eine Zeile ins
  Protokoll mit der Zahl der Kriterien, die auf `nachher` stehen. **Einmalig,
  wiederholbar, im Normalfall stumm. Zu 1.0 fällt der Block weg, die Spalte in der DDL
  bleibt** — und `CREATE TABLE IF NOT EXISTS` rührt eine vorhandene Tabelle nicht an
  (Stolperstein 13), deshalb der Block überhaupt.
* **`ratings` WIRD NICHT ANGEFASST.** Ein Stern ist ein Stern; zu welchem Kasten er
  gehört, sagt sein Kriterium. *Eine Phase an der Sternzeile wäre eine zweite Wahrheit
  über dieselbe Sache.*

---

## 3. Der Server — eine Abfrage, zwei Karten, dieselbe Rechnung

### 3.1 Der Durchschnitt

**`qSchnittJeKriterium` (`server.js:2462`) und `qSchnittJeKriteriumAlle` (`:2483`)
bekommen `c.phase` in `SELECT` und `GROUP BY`.** Was zurückkommt, wird **in zwei
`Map`s je Eintrag** aufgeteilt — eine je Phase — und **beide laufen durch dasselbe
`gesamtSchnitt()` (`:2547`)**, unverändert.

**DAS IST DIE GANZE TRENNUNG, UND SIE IST BAULICH:** Zähler und Nenner eines Kastens
entstehen in derselben Schleife aus derselben Menge, und die Menge ist nach Phase
geschnitten, bevor die Schleife sie sieht. *Es gibt keinen Schalter, der einen
Vorher-Stern in die Bewertung ließe, weil es keine Stelle gibt, an der beide Mengen
zugleich in einer Rechnung stehen.* **Das ist die zentrale Zusage dieser Runde, und
der Prüfstand hält sie** (Abschnitt 7).

* **Die Antwort trägt zwei Zahlen:** `avgRating` (nur `nachher`, Bedeutung
  unverändert) und **`potenzialRating`** (nur `vorher`). In der Übersicht
  (`server.js:3195`, `:3224`) wie im Detail (`:2767`).
* **Der Rechenweg wird zweimal gefüllt** — `rechenweg` für die Bewertung wie bisher,
  **`potenzialRechenweg`** daneben. *Die Erklärung der Kopfzahl (seit 0.16.0 ein
  Knopf) muss für beide Kästen stimmen, und sie entsteht in der Rechnung, nicht
  daneben* (Stolperstein 217).
* **Die Sternzeilen des Details** (`server.js:2743`, `LEFT JOIN` über
  `rating_criteria`) **tragen `phase` mit.** Der Browser filtert danach; er rechnet
  nichts.

### 3.2 Die Kriterien

* **`qCriteria` (`server.js:2122`) liefert `phase` mit.** Reihenfolge bleibt
  `sort_order, id`; die Oberfläche teilt nach Phase.
* **`POST /api/criteria` (`:2137`) nimmt `phase` entgegen** — freiwillig, Vorgabe
  `nachher`; jeder Wert außerhalb `PHASEN` ist eine **Absage 400 mit Meldung**.
* **`PUT /api/criteria/:id` (`:2157`) LEHNT `phase` AB** — 400, *„Der Kasten eines
  Kriteriums lässt sich nicht ändern. Löschen und neu anlegen — die Sterne gehen dann
  sichtbar mit."* **Nicht still übergehen:** ein übergangenes Feld sieht für den
  Aufrufer aus wie ein gesetztes.
* **`PUT /api/criteria/order` (`:2149`) BLEIBT, WIE ES IST.** Die Oberfläche schickt
  die Kennungen *einer* Liste; der Server nummeriert sie 0 bis n. Die andere Liste
  behält ihre Nummern, und da die Oberfläche je Phase sortiert, ist die Reihenfolge je
  Kasten richtig. *Eine zweite Route für die zweite Liste wäre eine Route mehr für
  nichts.*
* **`DELETE /api/criteria/:id` (`:2182`)** unverändert — samt Sternen, wie heute.

### 3.3 Die Sterne

* **`PUT /api/items/:id/ratings` (`:4026`)** unverändert. Das Kriterium bringt seine
  Phase mit.
* **`DELETE /api/items/:id/ratings` (`:4046`) FÄLLT.** Das Zurücksetzen wandert an die
  Zeile (Abschnitt 5) und läuft über `PUT` mit `value: 0` — *den Weg gibt es seit jeher:*
  `Math.max(0, ...)` in `PUT`, und eine Zeile mit 0 ist keine Stimme. **Eine Route ohne Weg
  vom Bildschirm ist tot, und tote Wege gibt es hier nicht.** *Das ist eine Wegnahme an
  einer öffentlichen Antwort — vor 1.0.0 erlaubt, und der Satz dazu gehört in Abschnitt 5
  des Projektstands.* Damit entfällt auch die Frage, wie ein Sammel-Zurücksetzen den
  jeweils anderen Kasten verschont: **es gibt keins mehr.**
* **`GET /api/items/:id/stimmen` (`:4063`)** unverändert — je Kriterium; die
  Oberfläche gruppiert nach Phase.
* **DIE GLOCKE ZÄHLT BEIDE KÄSTEN, UND DAS IST ENTSCHIEDEN.** Sie fragt *hat jemand
  etwas beigetragen?* und nicht *in welchem Kasten?* — ein Vorher-Stern ist ein
  Beitrag. **Das Wort „Bewertungen" in ihrem Text bleibt.** *Wer das trennen will,
  braucht eine dritte Zahl in der Antwort; das ist eine eigene Runde* (Abschnitt „Was
  danach offen bleibt").

### 3.4 Das Austauschformat rückt um eins

* **`AUSTAUSCH_FORMAT` (`server.js:4543`) wird um eins höher.**
* **Export (`:4719`, `:4944`):** neben `criteria` und `criteriaGewichte` ein drittes
  Feld **`criteriaPhase`** — `{ name: 'vorher' }` **nur für Vorher-Kriterien**, im
  Muster von `criteriaGewichte` (das nur Gewichte ≠ 1 nennt). *Eine Datei ohne
  Vorher-Kriterien sieht aus wie bisher, plus eine Formatnummer.*
* **Import (`:5235` ff.):** ein Kriterium ohne Eintrag in `criteriaPhase` ist
  `nachher` — **damit ist jede Datei aus einem älteren Format ohne Sonderweg lesbar.**
  Ein fehlendes Kriterium wird mit seiner Phase angelegt (`:5270` ff.).
* **DER KONFLIKT, UND ER WIRD VOR DEM ERSTEN SCHREIBEN ABGEWIESEN:** trägt die Datei
  ein Kriterium, das in der Installation **unter demselben Namen im anderen Kasten**
  steht, ist das eine **Absage mit Meldung**, die das Kriterium nennt — *bevor eine
  einzige Zeile geschrieben ist.* **Nicht** still in den vorhandenen Kasten einspielen:
  die Sterne landeten dann im falschen Durchschnitt, und die Datei sagte etwas
  anderes als die Installation.

### 3.5 Vokabular und Blockvorgabe

* **`VOKABULAR_VORGABE` (`server.js:1604`) bekommt `potenzial: 'Potenzial'`.** Die
  Karte *Vokabular* zeigt das Feld von selbst, wenn sie über die Schlüssel geht;
  andernfalls bekommt sie die eine Zeile. `PUT /api/settings` (`:1957`) säubert über
  `Object.keys(VOKABULAR_VORGABE)` — **das neue Wort läuft dort ohne weitere Zeile
  mit.**
* **`BLOCK_VORGABE.seite` (`:1616`) wird `['kategorie', 'tags', 'potenzial',
  'bewertung']`** — *vorher steht vor nachher.* Wer eine gespeicherte Reihenfolge hat,
  bekommt den neuen Block über `ordneBereich()` **hinten angehängt** — das ist die
  vorhandene Regel, und sie bleibt. *Er kann ihn ziehen.*
* **`zu` FÜHRT DIE BEIDEN STERNKÄSTEN NICHT MEHR.** `bloecke()` filtert die gespeicherte
  Liste heute über `ALLE_BLOECKE`; **ab jetzt über `ALLE_BLOECKE` ohne `potenzial` und
  `bewertung`.** *Ein gespeichertes `bewertung` in `zu` aus einer älteren Fassung fällt
  damit still heraus — gewollt, siehe Abschnitt 4.3.*

---

## 4. Der Browser — ein Block, derselbe Zeichner

### 4.1 Der Block

**In `public/app.js` neben `data-block="bewertung"` (`app.js:3924`) ein zweiter Block
`data-block="potenzial"`, davor.** Gleiche Bauform: `block-head` mit `label` aus
`V.potenzial`, eine Kopfzahl (`#phead`), für den Admin bei mehreren Benutzern der Knopf
**„Stimmen"** — *derselbe kurze Name in beiden Köpfen, siehe Abschnitt 5.4* —, darunter
der Sternkasten `#potenzial-ratings`. **Kein Knopf zum Zurücksetzen, in keinem der beiden
Köpfe** (Abschnitt 5).

**Der Zeichner (`app.js:4855` ff.) wird eine Funktion mit Phase**, nicht zwei
Funktionen: er bekommt `item`, `phase` und seinen Kasten, filtert `item.ratings` nach
`phase`, schreibt die Kopfzahl aus `avgRating` beziehungsweise `potenzialRating` und
hängt an den Erklärknopf `gew-auf` den passenden Rechenweg. *Der Text „Noch keine
Kriterien. Angelegt werden sie im Systembereich." gilt in beiden Kästen.* **Zwei
Zeichner wären zwei Wahrheiten über dieselbe Zeile.**

### 4.2 Die Kurzfassung im Kopf

**`blockZusammenfassung()` (`app.js:884`) bekommt den Fall `potenzial`:** „⌀ 4,2" aus
`potenzialRating`, sonst **„keine Sterne"**. *Nicht „keine Wertung" — das ist der Text
des anderen Kastens, und zwei gleiche Texte an zwei Köpfen wären ein Rätsel für den,
der nur die Köpfe sieht.*

### 4.3 Zuklappen nach Zustand — die Regel ersetzt die Einstellung

**In `ruesteBloeckeAus()` (`app.js:907`) gilt für genau zwei Blöcke nicht mehr
`BLOECKE.zu.includes(name)`:**

```
bewertung : zu = !item.tested && !hatSterne(item, 'nachher')
potenzial : zu =  item.tested
```

* **Ein Klick auf die Kopfzeile schaltet nur `BLICK`** — eine Menge im Speicher der
  Seite, die beim Öffnen eines anderen Eintrags geleert wird. **Kein `speichereBloecke()`,
  kein `PUT /api/settings`** für diese beiden. *Der Klick ist ein Blick, kein Befehl.*
* **Der Schalter `sw-test` (`app.js:4613`) leert `BLICK` und ruft
  `ruesteBloeckeAus()` neu.** Nach dem Umlegen steht der richtige Kasten offen, ohne
  dass jemand klickt.
* **`hatSterne(item, 'nachher')`** ist wahr, wenn eine Zeile der Phase `value > 0`
  oder `avg != null` trägt — *ein ungetesteter Eintrag aus alten Zeiten, der
  Bewertungssterne hat, zeigt sie.* Vorhandene Daten schlagen die Regel; **nichts wird
  vor jemandem versteckt, der es eingetragen hat.**
* **DAS IST EINE VERHALTENSÄNDERUNG FÜR DEN BEWERTUNGSBLOCK, UND SIE GEHÖRT INS
  PROTOKOLL:** wer ihn heute dauerhaft zugeklappt hat, sieht ihn an getesteten
  Einträgen wieder offen. *Der Grund steht im Konzept (4.2): eine gespeicherte
  Einstellung gilt für alle Einträge, ein Zustand für einen — und für die Sternkästen
  ist der Zustand die richtige Vorgabe.*
* **Reihenfolge und Ziehen bleiben**, wie sie sind — `zu` fällt weg, nicht `seite`.

### 4.4 Übersicht: Kachel und Sortierung

* **Die Kachel (`app.js:2982`) zeigt eine Zahl:** bei `tested` **„★ 3,8"** aus
  `avgRating` wie heute, bei `!tested` **„◆ 4,2"** aus `potenzialRating`; fehlt die
  jeweilige Zahl, steht nichts. **Ein anderes Zeichen, damit niemand 4,2 Potenzial für
  4,2 Qualität hält** — und ein `title` mit dem Wort aus dem Vokabular. *Die andere
  Zahl steht im Kopf des zugeklappten Kastens; die Kachel ist zu klein für zwei.*
* **Die Sortierung (`app.js:1856`) bekommt `potenzial_desc` und `potenzial_asc`** —
  Spiegelbild von `rating_desc` / `rating_asc`, mit `?? -1` und `?? 99`, damit Einträge
  ohne Zahl in beiden Richtungen hinten stehen.
* **Das Auswahlfeld (`app.js:2598`) bekommt die zwei Einträge** mit dem Wort aus dem
  Vokabular: *„Potenzial (hoch → niedrig)"*, *„Potenzial (niedrig → hoch)"* — direkt
  hinter den beiden Bewertungseinträgen. `V` ist vor `drawFilters()` geladen
  (`ladeEinstellungen()` läuft vor `route()`).
* **Gespeicherte Ansichten aus älteren Fassungen kennen die Schlüssel nicht und
  dürfen nichts wegnehmen** — die vorhandene Regel in `visibleItems()` deckt das ab.
  **Es wird keine Ansicht vorgefertigt:** *„Als Nächstes" = Ungetestet + nicht
  abgelehnt + Potenzial absteigend* speichert der Benutzer einmal selbst. *Kriterion
  legt keine erfundenen Daten an.*

### 4.5 Der Vergleich

**Die Sicht (`app.js:3311` ff.) zeigt zwei Gruppen von Zeilen** — erst die
Vorher-Kriterien mit ihrer Kopfzahl, dann die Nachher-Kriterien mit ihrer, je mit
einer Trennzeile, die das Wort trägt. **`eigenerSchnitt()` bekommt die Phase als
Argument** und filtert `it.ratings` danach — *es bleibt die einzige zweite
Rechenstelle, und sie rechnet weiter nur, was der Server nicht liefern kann: den
Schnitt über meine eigenen Sterne.* `schnittVon()` und `wertVon()` gehen denselben
Weg. Ein Eintrag ohne Sterne in einer Gruppe zeigt dort einen Strich, keine 0.

### 4.6 Der Systembereich

* **`SYS_KARTEN` (`app.js:6085`) bekommt `potenzialkriterien`**, Abschnitt `bestand`,
  direkt hinter `kriterien`, sichtbar für alle, bedienbar für den Admin — wie die
  Nachbarkarte. *Das ist die eine Karte mehr.*
* **`karteKriterien()` (`:6703`) und `ruesteKriterienAus()` (`:6738`) bekommen die
  Phase als Argument.** Dieselbe `manage-list`-Maschine, derselbe Eintrag `crit`
  (`:6792`) mit `gewicht: true`, `sortierbar: true`, derselben Warnung — **nur die
  Liste ist nach Phase gefiltert, und `POST` schickt die Phase mit.** *Zwei Karten,
  eine Maschine.*
* **Titel der neuen Karte: `${V.potenzial}: Kriterien`** — mit Doppelpunkt, nicht
  zusammengesetzt. Die Karte *Bewertungskriterien* behält ihren Namen.
* **Die Beschreibung der neuen Karte sagt drei Dinge:** was der Kasten ist (*„Sterne
  vor dem Test — welche Idee ist als Nächstes dran?"*), dass die Zahl in einen eigenen
  Durchschnitt fließt und die Bewertung nicht berührt, und **ein Rat: zwei oder drei
  Kriterien reichen** — mit den Vorschlägen *Wunsch* (Gewicht 1,5), *Nutzen*,
  *Machbarkeit*. **Ein Rat und kein Deckel.** *Der Admin darf; die Karte sagt ihm, was
  es kostet.*
* **Die Vokabularkarte** zeigt das neue Feld; „Zurücksetzen" nimmt es über
  `VOKABULAR_VORGABE` mit.

---

## 5. Die Sternzeile — × statt Kopfknopf, und kein Sprung mehr

**ZWEI BEFUNDE AN DERSELBEN ZEILE, UND SIE GEHÖREN IN DIESELBE RUNDE**, weil beide
Kästen sie bekommen.

**Erstens: es gibt heute zwei Wege zum Zurücksetzen, einer zu lang und einer
unsichtbar.** Der Kopfknopf „Meine Bewertung zurücksetzen" leert alle Kriterien auf
einmal — und bricht auf dem Telefon den Blockkopf in drei Zeilen. Daneben setzt ein
**Doppelklick auf die Sternzeile** (`stars()`, `app.js:155`) mein Kriterium auf null,
mit einem Hover-Text, den kein Telefon je zeigt. *Zwei Wege für eine Sache, und der
brauchbare ist der versteckte.*

**Zweitens: die Sterne springen.** Bei mehreren Benutzern richtet sich die
Durchschnittsspalte nach der breitesten Zahl der Liste (`style.css:872`, „keine
Mindestbreite mehr"). Solange **niemand** bewertet hat, ist sie null Pixel breit, und
die Sterne stehen am rechten Rand. Der erste Stern erzeugt den ersten Durchschnitt,
die Spalte geht auf, **alle Sternzeilen rutschen nach links** — ausgerechnet unter dem
Finger, der gerade getippt hat.

### 5.1 Das × an der Zeile

* **`stars()` bekommt hinter dem fünften Stern einen sechsten Platz**, gleich breit,
  mit einem **×**. Er ist **immer im Dokument** und **sichtbar nur, wenn `value > 0`**
  (`visibility: hidden`, nicht `display: none`) — *sonst rutschten die Sterne beim
  ersten Stern nach links, und das ist genau der Sprung, den 5.2 abschafft.*
* **Tipp auf das × ruft `onReset`** — die Rückruffunktion, die es heute schon gibt:
  `set(0)` und die Meldung. **Der Doppelklick und der Hover-Text fallen weg.** *Ein
  sichtbarer Weg statt einem versteckten.*
* **„Meine" braucht kein Wort mehr:** das × steht an *meinen* Sternen; die
  Durchschnittszelle daneben bleibt, was sie ist. Bei einem einzigen Zugang stellt sich
  die Frage nicht.
* **Auf Berührungsgeräten ist die Trefffläche größer** — `@media (hover: none)`, wie
  bei `.rstimme .xdel` (`style.css:2447`): mindestens 32 CSS-Bildpunkte, damit der
  Finger nicht den fünften Stern trifft. *Ein Fehltipp kostet nichts Unwiederbringliches
  — der Stern lässt sich neu setzen —, aber er soll nicht der Normalfall sein.*
* **Die Meldung wird phasenneutral:** *„Meine Sterne bei „Wunsch" entfernt"* statt
  *„Meine Bewertung für „Wunsch" zurückgesetzt"* — sie gilt in beiden Kästen, und
  „Bewertung" wäre im Potenzialkasten das falsche Wort.
* **`stars()` ohne `onReset`** — die Testtage und jede Lesestelle — **bleibt, wie es
  ist:** kein sechster Platz. *Nur die Zeile, die zurücksetzen kann, trägt das ×.*

### 5.2 Die Durchschnittszelle hat ihre Breite von Anfang an

* **Ein Strich, solange niemand bewertet hat.** Die Zelle `.ravg` zeigt **„–"** statt
  nichts, mit dem Titel *„noch niemand"*. **Das widerruft den Satz im Stylesheet**
  (*„hier steht ausdrücklich kein Text für die leere Zelle"*) — **mit Grund:** neben
  fünf leeren Sternen wäre ein Satz dieselbe Aussage zweimal; **ein Strich ist kein
  Satz, sondern der Platz, der der Zahl gehört.** Der alte Satz bleibt stehen und
  bekommt seinen Widerruf (Stolperstein 201).
* **Eine Mindestbreite, gemessen und nicht geschätzt.** Die Spalte richtet sich
  weiter nach der breitesten Zahl der Liste — **aber nicht mehr unter die Breite der
  Hausform mit einstelliger Stimmenzahl: „⌀ 4,2 (9)".** Gemessen in der
  Festbreitenschrift bei Schriftstufe 100 und 120, in CSS-Bildpunkten; die Zahl steht
  im Protokoll. *Ab zehn Stimmen wächst die Spalte einmal — das ist benannt und
  hingenommen: wer zehn Bewerter hat, hat andere Sorgen als drei Bildpunkte.*
* **Damit ist der Sprung weg:** der erste Stern ändert an der Spalte nichts, der
  zweite Bewerter auch nicht. *Und die Regel bleibt, was sie war: alle Sternzeilen auf
  einer Linie.*
* **Bei einem einzigen Zugang** (`ohne-schnitt`) gibt es die Zelle nicht, und es gab
  nie einen Sprung. **Dort ändert sich nichts.**

### 5.3 Auf dem Telefon: der Name über der Zeile

**Drei Spalten passen auf 360 CSS-Bildpunkte nicht, sobald das × und die
Mindestbreite dazukommen** — bei Schriftstufe 120 bleiben dem Kriteriennamen unter
hundert Bildpunkte, und „Verarbeitungsqualität" bricht mitten im Wort
(`overflow-wrap: anywhere`, `style.css:3047`).

* **Am vorhandenen Umbruchpunkt** (derselbe, an dem `.rrow .rname` heute umbrechen
  darf) **wird die Zeile zweizeilig:** der Name allein in der ersten Zeile über die
  ganze Breite (`grid-column: 1 / -1`), darunter Sterne mit × links und der
  Durchschnitt rechts. **Die Trennlinie liegt unter der zweiten Zeile, nicht unter
  dem Namen.**
* **Das Muster gibt es schon:** die Stimmenliste setzt den Namen über die Sterne
  (`.stimmzeile .rname { display: block }`, `style.css:894`). *Dieselbe Bauform, damit
  das Auge nichts Neues lernen muss.*
* **Auf dem breiten Bildschirm ändert sich nichts** — drei Spalten wie heute, plus ×
  und Mindestbreite.

### 5.4 Der Kopf wird kurz

* **„Meine Bewertung zurücksetzen" fällt** — samt `confirmBox`, samt `reset-r`
  (`app.js:3928`, `:5220`). *Es gibt nichts mehr, was er täte, das die Zeile nicht
  besser tut.*
* **„Wer hat bewertet" wird „Stimmen"** (`app.js:3927`) — der Name der Route, der
  Name der Sache im Dialog, ein Wort. *Admin, mehrere Benutzer, wie heute.*
* **Der Kopf trägt danach:** Beschriftung, Kopfzahl mit Erklärknopf, für den Admin
  „Stimmen". **In beiden Kästen dasselbe.** *Auf dem Telefon eine Zeile.*

### 5.5 Was hier zu messen ist

* **Die Mindestbreite** aus 5.2 — in der Festbreitenschrift, bei 100 und 120,
  Desktop und Telefon.
* **Ob die zweite Zeile auf 360 CSS-Bildpunkten bei Schriftstufe 120 aufgeht:** fünf
  Sterne, ×, Lücke, „⌀ 4,2 (9)". *Erwartet: ja, mit Luft. Erwartet ist nicht gemessen.*
* **Dass nach dem ersten Stern keine Sternzeile ihre Position ändert** — von Hand,
  am echten Bestand, vorher/nachher-Schirmfoto. *Der Prüfstand kann kein Layout
  messen; das gehört ins Protokoll als Befund mit Bild.*

---

## 6. Was ausdrücklich NICHT gebaut wird

**a) KEIN ZWEITER STERNMECHANISMUS.** Keine Tabelle `prioritaeten`, keine Spalte an
`items`, keine Phase an `ratings`. Ein Kriterium kennt seinen Kasten; das reicht.

**b) KEIN WECHSEL DER PHASE NACH DEM ANLEGEN.** Siehe 3.2. Ein Wechsel trüge
vergebene Sterne von einem Durchschnitt in den anderen — *und zwar still.* Löschen und
neu anlegen macht es sichtbar.

**c) KEINE VORGEFERTIGTEN KRITERIEN, KEINE VORGEFERTIGTE ANSICHT.** Die Karte schlägt
vor, sie legt nicht an. Dieselbe Regel wie bei den Bewertungskriterien seit dem ersten
Tag.

**d) KEINE WORTE AN DEN STERNEN** („5 = sofort"). *Sie passen zu „Wunsch" und zu sonst
nichts — „Machbarkeit: sofort" ist Unsinn.* Worte je Kriterium wären der nächste
Schritt, und der ist zu viel für das, was er bringt.

**e) KEIN DECKEL AUF DER ZAHL DER KRITERIEN.** Ein Rat in der Karte, kein 400.

**f) KEINE GLOCKE JE KASTEN.** Siehe 3.3.

**g) KEIN VERSTECKEN.** Der jeweils andere Kasten wird zugeklappt, nicht ausgeblendet.
*Was jemand eingetragen hat, ist immer einen Klick entfernt.*

**h) KEINE ZWEI ZAHLEN AUF DER KACHEL.** Eine Kachel, eine Zahl; die andere steht im
Kopf des Kastens.

**i) KEINE ZWEITE RECHNUNG IM BROWSER.** Kopfzahlen und Rechenwege kommen vom Server.
`eigenerSchnitt()` bleibt, was es ist: der Schnitt über die eigenen Sterne, den der
Server nicht liefert — jetzt je Phase.

**j) KEINE ÄNDERUNG AN `UNIQUE(name)`.** Siehe Abschnitt 2.

**k) KEIN SAMMEL-ZURÜCKSETZEN, KEIN DOPPELKLICK, KEIN HOVER-TEXT.** Ein Weg je Zeile,
sichtbar. *Wer alles leeren will, tippt drei- bis fünfmal — bei einer Handlung, die
selten ist und sich durch erneutes Setzen ohnehin heilt.*

**l) KEIN TEXT IN DER LEEREN DURCHSCHNITTSZELLE.** Ein Strich, kein Satz. Siehe 5.2.

---

## 7. Der Prüfstand — was er halten muss

**Die eine Prüfung, die diese Runde trägt:** *ein Eintrag mit zwei Nachher-Kriterien
(4 und 4) und einem Vorher-Kriterium (1) hat `avgRating` 4,0 und `potenzialRating`
1,0 — in der Übersicht und im Detail, und nach dem Umlegen von `tested` unverändert.*
**Der Rückbau dazu nimmt `c.phase` aus dem `GROUP BY` und muss rot werden.**

Dazu mindestens:

* Migration: Spalte fehlt → wird angelegt, Bestand steht auf `nachher`; Spalte da →
  stumm, zweimal hintereinander.
* `POST /api/criteria` mit `phase: 'vorher'`, ohne Phase (→ `nachher`), mit Unfug
  (→ 400).
* `PUT /api/criteria/:id` mit `phase` → 400, und die Phase steht danach unverändert.
* `DELETE /api/items/:id/ratings` antwortet 404 — die Route gibt es nicht mehr, und
  `F_ROUTEN` ist um eins kleiner.
* Das × steht in jeder Sternzeile mit `onReset` im Dokument, ist bei `value 0`
  unsichtbar und bei `value > 0` sichtbar; ein Tipp darauf schickt `PUT` mit
  `value: 0` — und nichts anderes. Ein Doppelklick auf die Zeile tut nichts mehr.
  `stars()` ohne `onReset` hat kein ×.
* Die Durchschnittszelle zeigt „–", solange `avg` fehlt, und „⌀ 4,0" nach dem
  ersten Stern; die Kopfzeile beider Kästen trägt keinen Knopf `reset-r` und für den
  Admin bei mehreren Benutzern „Stimmen".
* Export trägt `criteriaPhase` nur für Vorher-Kriterien; Import einer Datei aus dem
  vorigen Format legt alles als `nachher` an; **Import mit Namenskonflikt über die
  Kästen weist ab, bevor etwas geschrieben ist** (Zeilenzahl vorher = nachher, an jeder
  Tabelle).
* Im Browser (jsdom): der neue Block steht vor dem Bewertungsblock; an einem
  ungetesteten Eintrag ist Bewertung zu und Potenzial offen, nach dem Schalter
  umgekehrt; ein Klick auf den Kopf öffnet, ohne `PUT /api/settings` auszulösen; an
  einem ungetesteten Eintrag **mit** Bewertungssternen steht Bewertung offen.
* Sortierung `potenzial_desc` stellt Einträge ohne Zahl hinten an, `potenzial_asc`
  ebenfalls.
* Die Kachel zeigt ◆ bei `!tested` und ★ bei `tested`, nie beides.
* Der Vergleich zeigt zwei Gruppen, und `eigenerSchnitt()` mischt sie nicht.
* Das Vokabularwort erscheint im Blockkopf, im Auswahlfeld der Sortierung und im
  Kartentitel — und nach dem Umbenennen an allen drei Stellen zugleich.

---

## Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere, **und die beiden
  Werte der Spalte.** Der Sprachwächter läuft mit, und seine Dateiliste ist gepflegt.
* **Keine neue Abhängigkeit. Keine Binärdateien im Repo. Keine Tags.**
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt** — die
  Abfrage aus Abschnitt 1 eingeschlossen.
* **Das Wort aus dem Vokabular wird nirgends zusammengesetzt.** Doppelpunkt, Klammer
  oder Leerzeichen — nie ein Kompositum. *„Erwartungkriterien" hat kein Fugen-s, und
  der Quelltext kennt keins.*
* **Neue Stolpersteine ab der nächsten freien Nummer** — sie steht im Protokoll des
  Vorgängers. Kandidaten aus dem Befund:
  - *Ein Kasten je Frage.* Zwei Fragen in einem Durchschnitt sind Stolperstein 47 in
    Reinform — und man sieht es der Zahl nicht an, weil sie plausibel aussieht.
  - *Der Zustand entscheidet die Vorgabe, die Einstellung nicht.* Eine gespeicherte
    Einstellung gilt für alle Einträge zugleich; was vom Eintrag abhängt, darf nicht in
    ihr stehen.
  - *Ein übergangenes Feld sieht für den Aufrufer aus wie ein gesetztes.* Deshalb 400
    statt Stillschweigen beim Versuch, die Phase zu ändern.
  - *Zwischen zwei geplanten Runden bleibt eine Nummer frei.* Die Regel aus „Die
    Nummer" — sie gehört dorthin, wo künftige Runden sie finden.
* **Neue Rückbauten ab der nächsten freien Nummer**, für jeden gebauten Punkt
  mindestens einer. **Ein Rückbau, der den Lauf abreißt, belegt nichts** (Stolperstein
  161).
* **Rückbauten mitgehen lassen, nicht löschen** (Stolperstein 201), wo ihr Suchtext
  sich verschiebt — *betroffen sind mindestens die, die auf den Zeichner der Sterne,
  auf `ruesteBloeckeAus()`, auf `reset-r`, auf „Wer hat bewertet" und auf den
  Doppelklick in `stars()` zeigen.*
* **Der Prüfstand und die Rückbauliste wachsen vom Stand des Vorgängers** — die
  Zahlen vorher und nachher stehen im Protokoll dieser Runde, nicht hier.
* **UND DER GEGENPROBENLAUF GEHÖRT VOR DAS SCHREIBEN DER PAPIERE.**

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen** — Schema, Server, Browser,
  Austauschformat, Papiere sind fünf Schnitte, nicht einer.
* Vor dem letzten Push: **`git status` muss leer sein**, und **`npm test` läuft ein
  letztes Mal gegen genau diesen Stand.**
* **`Doku/Aenderungsprotokoll_0.21.0.md`** liegt im Branch: was gebaut wurde je Datei,
  die Messung aus Abschnitt 1 mit ihrem Aufbau, **die Verhaltensänderung am
  Einklappzustand des Bewertungsblocks** mit ihrer Begründung, **die Absage beim
  Import über die Kästen hinweg**, **die Wegnahme der Route mit Begründung**, **der
  Widerruf am Stylesheet zur leeren Zelle**, die Messungen aus 5.5 samt Schirmfoto, die
  Entscheidung zur Glocke, **die neue
  Fahrplanregel und das Rücken, das aus ihr folgt**, neue Stolpersteine, die
  Gegenprobentabelle, Prüfungszahlen vorher/nachher, Rückbauten vorher/nachher
  (*vorher jeweils aus dem Protokoll des Vorgängers*), Offengebliebenes.
* Die Zeile „0.21.0 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json` trägt sie
  ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST EINE DATENBANKSTUFE — sag es ausdrücklich.** Ein Migrationsblock
  mehr, eine Spalte mit `DEFAULT`, kein Bestandslauf. *Rückweg technisch offen, aber
  dort zählen Vorher-Sterne wieder in die Bewertung.* **Sicherung vor dem Einspielen.**
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im Chat, nicht
  in den Dokumenten.** Darunter: **ein Vorher-Kriterium anlegen und an einem
  getesteten Eintrag einen Stern setzen** *(`avgRating` des Eintrags in der Übersicht
  unverändert, `potenzialRating` erscheint)*, **den Schalter umlegen** *(die Kästen
  tauschen Offen und Zu, die Zahlen bleiben)*, **nach Potenzial sortieren**, **einen Stern über das × entfernen** *(die Zeile
  zeigt fünf leere Sterne, die Spalte daneben bewegt sich nicht)*, **einmal
  exportieren und wieder einspielen** *(gleiche Zahlen in beiden Kästen)*.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_21_0`), und **alle Verweise
  sind nachzuziehen.** Kopf, Betriebsstand, der Abschnitt zur Bewertung (*er bekommt
  den zweiten Kasten und die Regel, dass die beiden Durchschnitte sich nicht
  berühren*), Stolpersteine, Prüfstand, Versionsgeschichte, offene Betriebspunkte,
  **Fahrplan** — **und Abschnitt 5, die öffentliche Schnittstelle:** dort steht die
  Route, die fällt, und der Satz zur Wegnahme vor 1.0.0 gehört daneben.
* **DER FAHRPLAN RÜCKT, ER BEKOMMT DIE NEUE REGEL, UND ER SAGT BEIDES.** Diese Runde
  ist eingeschoben und trägt die 0.21.0; alles, was ab 0.21.0 stand, rückt so, dass
  zwischen zwei geplanten Runden eine Nummer frei bleibt — die Tafel in „Die Nummer"
  ist der Stand zum Zeitpunkt dieses Auftrags. *Der Satz, mit dem die Oberfläche
  zuletzt gerückt wurde, bleibt stehen und bekommt seine Fortsetzung — nicht seine
  Löschung* (Stolperstein 201). **Der Grund steht in „Die Nummer": ein Block, der den
  Bewertungskasten anfasst, gehört vor die Umgestaltung; ein Migrationsblock gehört
  vor die Bereinigung; und die freie Nummer je Zwischenraum verhindert das achte
  Rücken um den ganzen Rest.**
* **Das Sammelblatt (`Doku/Fehler_und_Ideen.md`) bekommt den Punkt** mit Verweis auf
  das Konzeptpapier — *als zugeordnet, mit Datum.*
* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2 — **mit Kasten**, wegen
  der Datenbankstufe.
* **DIE README WIRD ANGEFASST — sie beschreibt Funktionen, und das ist eine.** Der
  Abschnitt, der die Bewertung beschreibt, bekommt den zweiten Kasten, die Regel
  zum Zuklappen, das × an der Zeile und den Strich in der leeren Zelle; **„Die Filter"** die beiden Sortiereinträge; **„Vokabular"** das neue
  Wort. *Keine neue Datei, also keine Änderung an der Dateiliste.*
* **`Doku/Konzept_Potenzial.md` liegt bei und bleibt, wie es ist.** *Es ist das
  Papier, aus dem dieser Auftrag kommt; wo die Bauform am Ende davon abweicht,
  berichtet das Änderungsprotokoll — das Konzept wird nicht nachträglich passend
  gemacht.*
* **Der vorige Auftrag fällt mit diesem Auftrag weg** — *es liegt immer nur einer im
  Repo.* **Dieser hier fällt weg, wenn der nächste geschrieben wird.**

---

## Was danach offen bleibt

- **Eine Sicht „Erwartung gegen Ergebnis":** welche Einträge haben ihr Potenzial
  eingelöst, welche nicht. *Beide Zahlen sind da; die Sicht ist eine eigene Runde —
  und sie ist der Grund, warum nichts gelöscht wird.*
- **Die Glocke je Kasten**, falls das Mitläuten der Vorher-Sterne stört. *Eine dritte
  Zahl in der Antwort, kein Umbau.*
- **Worte je Kriterium an den Sternen** — verworfen für diese Runde (6d); wenn
  überhaupt, dann je Kriterium und nicht je Kasten.
- **Der volle Gegenprobenlauf** über alle Rückbauten — weiter ausstehend.
