# Änderungsprotokoll 0.21.0 — „Vor dem Test schätzt man, nach dem Test bewertet man"

**MINOR · 4. September 2026 · eine eingeschobene Runde aus dem Betrieb.**
*Angefasst sind `db.js`, `server.js`, `public/app.js`, `public/style.css`,
`pruefung.js`, `gegenprobe.js`, `package.json`, `package-lock.json` und die
Papiere.*

> **DIESE RUNDE IST EINE DATENBANKSTUFE — SICHERUNG VOR DEM EINSPIELEN.**
> `rating_criteria` bekommt die Spalte `phase`, **neunter Migrationsblock**;
> alle vorhandenen Kriterien stehen danach auf `nachher` und zählen weiter in
> die Bewertung. **Kein Bestandslauf, kein `UPDATE` über den Bestand** — die
> Zeilen bekommen ihren Wert aus dem `DEFAULT` der Spalte.
> *Der Rückweg auf 0.20.1 bleibt technisch offen — `ADD COLUMN` mit `DEFAULT`
> stört keine ältere Fassung —, aber **dort zählten Vorher-Sterne wieder in die
> Bewertung**, und die zweite Kriterienkarte gäbe es nicht.*

**Austauschformat 13, `F_ROUTEN` 70** *(eine Route ist weggefallen)*, **neun
Zwecke der zweiten Bestätigung, einundzwanzig Vorgänge, einundzwanzig Karten,
neun Migrationsblöcke, neun ausgelieferte Module, zwölf Vokabelwörter.**

---

## 0.20.1 ist im Feld bestätigt

**Die laufende Installation hat am 3. September 2026 den Fingerprint
`c67a13f9` gemeldet** — genau den Sollwert aus dem Änderungsprotokoll 0.20.1.
*Der Dateisatz auf dem Wirt ist also der, der gemeint war; damit ist auch der
letzte offene Punkt aus Abschnitt 6 jenes Protokolls geschlossen.*

---

## Der Befund, in einer Tabelle

| bis 0.20.1 | ab 0.21.0 |
|---|---|
| ein Kasten „Bewertung", ein Durchschnitt `avgRating` | zwei Kästen — **Potenzial** (vorher) und **Bewertung** (nachher) —, zwei Durchschnitte `potenzialRating` und `avgRating`, **die einander nicht berühren** |
| Kriterien gelten für jeden Eintrag gleich | ein Kriterium gehört zu genau einem Kasten; `rating_criteria.phase` sagt zu welchem |
| Sortierung nach Bewertung | dazu Sortierung nach Potenzial, gleiche Bauform |
| Einklappzustand des Bewertungsblocks ist eine gespeicherte Einstellung | für die beiden Sternkästen entscheidet der **Zustand des Eintrags**; ein Klick gilt bis zum Verlassen |
| das Wort „Bewertung" steht fest | das Wort **„Potenzial" steht im Vokabular** und ist änderbar |
| Zurücksetzen: ein langer Kopfknopf für alle Kriterien und ein versteckter Doppelklick je Zeile | **ein sichtbares × je Zeile, an den eigenen Sternen**; der Kopf wird kurz |
| die Sterne springen nach links, sobald der erste Durchschnitt erscheint | die Durchschnittszelle hat ihre Breite von Anfang an und zeigt „–", solange niemand bewertet hat |

**Der Grund für die Runde in einem Satz:** ein Eintrag mit `tested = 0` ist eine
Idee, ein gesehenes Modell, ein Vorhaben — und die einzige Zahl, die er bekommen
konnte, war die Bewertung. *Die beantwortet aber „wie gut war es", und ein Stern
an einer Idee beantwortet „wie sehr will ich es". Zwei Fragen in einem
Durchschnitt, und niemand sieht es der Zahl an* (Stolperstein 47, in seiner
reinsten Form — jetzt als **Stolperstein 302** eigens aufgeschrieben).

**Das Konzept dazu liegt als `Doku/Konzept_Potenzial.md` im Repo und bleibt, wie
es geschrieben wurde.** *Wo die Bauform am Ende davon abweicht, steht es hier;
das Konzept wird nicht nachträglich passend gemacht.*

---

## 1. Was VOR dem Bauen gemessen wurde

**Die eine Zahl am Server, und sie ist klein.** `qSchnittJeKriteriumAlle` läuft
seit 0.19.3 einmal je Übersicht und bekommt mit dieser Runde `c.phase` in
`SELECT` und `GROUP BY`.

**Der Aufbau:** 400 Einträge, 6 Kriterien, 3 Bewerter, **4602 Sternzeilen**,
**2296 Ergebniszeilen** — erzeugt aus einem **festen Zufallskeim**, damit beide
Fassungen Zeile für Zeile dieselbe Menge sehen. Gemessen wird **abwechselnd und
nicht nacheinander**: wer erst fünfzigmal das eine misst und dann fünfzigmal das
andere, misst am zweiten auch die Wärme des ersten. Genommen wird der **mittlere
Wert aus elf Runden**, „warm" ist der Schnitt aus je 50 Läufen.

| Fassung | warm | gegen A |
|---|---|---|
| **A** — ohne `c.phase` (Stand 0.20.1) | **3,79 ms** | — |
| **B** — mit `c.phase` in `SELECT` und `GROUP BY` *(gebaut)* | **4,52 ms** | **+0,73 ms** |
| **C** — Kontrolle: `c.created_at` statt `c.phase` | **4,56 ms** | +0,77 ms |
| **D** — `c.phase` nur in `SELECT`, nicht im `GROUP BY` | **4,36 ms** | +0,57 ms |

*Kalt, mittlerer Wert: A 3,56 ms, B 4,39 ms.*

> **DIE ERWARTUNG DES AUFTRAGS HAT NICHT GETRAGEN, UND DAS GEHÖRT HIERHER.** Er
> schrieb: *„Erwartet: keine messbare Änderung, denn `phase` steht an der
> Kriterienzeile, die der `JOIN` ohnehin trifft."* **Die Änderung IST messbar:
> +0,73 ms bei 400 Einträgen, rund ein Fünftel.**
>
> **DER GRUND IST NICHT DAS `GROUP BY`, UND DAS SAGT DIE KONTROLLE C.** Eine
> beliebige andere TEXT-Spalte derselben Zeile kostet dasselbe (4,56 gegen
> 4,52 ms). **Bezahlt wird das Mittragen einer weiteren TEXT-Spalte durch das
> Ergebnis** — 2296 Zeilen, also rund **0,3 µs je Ergebniszeile**. *Fassung D
> zeigt es von der anderen Seite: ohne `GROUP BY` bleiben immer noch 0,57 der
> 0,73 ms stehen.*
>
> **GEBAUT IST TROTZDEM B, so wie der Auftrag es verlangt.** *D wäre 0,16 ms
> billiger und stützte sich darauf, dass SQLite eine funktional abhängige
> Spalte ohne `GROUP BY` durchlässt — eine Eigenheit, auf die eine Abfrage sich
> nicht verlassen soll, für einen Zehntel einer Millisekunde.* **Und der
> Auftrag sagt selbst, was hier zu tun war:** *„Liegt sie deutlich über dem
> Vorher-Wert, ist etwas anderes falsch als die Spalte."* **Sie liegt nicht
> deutlich darüber, und die Kontrolle C belegt, dass es die Spalte ist und
> nichts anderes.**

**Was NICHT gemessen ist und benannt gehört:** diese Zahlen stammen aus der
Bauumgebung und nicht vom Wirt. *Der Vergleichswert 2,70 ms aus 0.19.3 wurde
dort gemessen; die 3,79 ms hier sind die **eigene** Vorher-Messung derselben
Abfrage in derselben Umgebung, und nur die beiden gehören nebeneinander.*

---

## 2. Das Schema — eine Spalte

**In `db.js`, an `rating_criteria`:**

```
phase TEXT NOT NULL DEFAULT 'nachher'
```

* **Zwei Werte, `vorher` und `nachher`, und sonst keiner.** *Deutsch, weil der
  Sprachwächter mitliest — und weil die Werte in `SELECT`s stehen, die jemand
  liest.*
* **KEIN `CHECK` an der Spalte**, aus demselben Grund wie bei `gewicht`: die
  Menge der Werte stünde sonst zweimal, hier und in `PHASEN` im Server, und die
  zweite meldete sich nicht als Absage mit Meldung, sondern als abgebrochene
  Schreibung. **`PHASEN = ['vorher', 'nachher']` steht genau einmal, in
  `server.js`.**
* **`UNIQUE(name)` BLEIBT GLOBAL.** Ein Name, ein Kasten.
* **`ratings` WIRD NICHT ANGEFASST.** Ein Stern ist ein Stern; zu welchem Kasten
  er gehört, sagt sein Kriterium.

**Der neue Migrationsblock `migration0210()`** folgt dem Muster von
`migration0840()`: `PRAGMA table_info`, Spalte fehlt → `ALTER TABLE … ADD
COLUMN`, eine Zeile ins Protokoll mit der Zahl der Kriterien, die auf `nachher`
stehen. **Einmalig, wiederholbar, im Normalfall stumm.** *Zu 1.0 fällt der Block
weg, die Spalte in der DDL bleibt* — und `CREATE TABLE IF NOT EXISTS` rührt eine
vorhandene Tabelle nicht an (Stolperstein 13), deshalb der Block überhaupt.

**Die Bestandszeilen bekommen ihren Wert aus dem `DEFAULT` und nicht aus einem
`UPDATE`** — dieselbe Regel wie bei `gewicht` in 0.8.40: *jeder andere Wert
änderte beim Einspielen still sämtliche Gesamtschnitte.* **Was heute Kriterium
ist, ist Bewertungskriterium. Punkt.**

---

## 3. Der Server

### 3.1 Der Durchschnitt — und warum die Trennung baulich ist

`qSchnittJeKriterium` und `qSchnittJeKriteriumAlle` bekommen `c.phase` in
`SELECT` und `GROUP BY`. **Was zurückkommt, geht durch `karteJePhase()` und wird
in zwei `Map`s je Eintrag aufgeteilt — eine je Phase.** Beide laufen durch
**dasselbe `gesamtSchnitt()`**, unverändert.

> **DAS IST DIE GANZE TRENNUNG, UND SIE IST BAULICH.** Zähler und Nenner eines
> Kastens entstehen in **derselben Schleife aus derselben Menge**, und die Menge
> ist **nach Phase geschnitten, bevor die Schleife sie sieht**. *Es gibt keinen
> Schalter, der einen Vorher-Stern in die Bewertung ließe, weil es keine Stelle
> gibt, an der beide Mengen zugleich in einer Rechnung stehen.*
> **`gesamtSchnitt()` weiß nicht einmal, welchen Kasten es gerade rechnet.**

* **Die Antwort trägt zwei Zahlen:** `avgRating` (nur `nachher`, Bedeutung
  unverändert) und **`potenzialRating`** (nur `vorher`) — in der Übersicht wie
  im Detail.
* **Der Rechenweg wird zweimal gefüllt** — `rechenweg` wie bisher,
  **`potenzialRechenweg`** daneben. *Die Erklärung der Kopfzahl entsteht in der
  Rechnung und nicht daneben* (Stolperstein 217), und es gibt sie zweimal, also
  entsteht sie zweimal.
* **Die Sternzeilen des Details tragen `phase` mit.** Der Browser filtert
  danach; er rechnet nichts.
* **Ein unbekannter Wert in der Spalte fällt in KEINEN der beiden Kästen**,
  statt still im falschen zu landen. *Er käme nur aus einer Schreibung an
  `PHASEN` vorbei.*

### 3.2 Die Kriterien

* **`qCriteria` liefert `phase` mit.** Reihenfolge bleibt `sort_order, id` über
  **beide** Kästen; die Oberfläche teilt nach Phase, und gefiltert bleibt jede
  Liste in sich richtig sortiert. *Eine zweite Ordnung hätte nirgends
  gestanden.*
* **`POST /api/criteria` nimmt `phase` entgegen** — freiwillig, Vorgabe
  `nachher`; jeder Wert außerhalb `PHASEN` ist eine **Absage 400 mit Meldung**.
* **`PUT /api/criteria/:id` LEHNT `phase` AB** — 400, *„Der Kasten eines
  Kriteriums lässt sich nicht ändern. Löschen und neu anlegen — die Sterne gehen
  dann sichtbar mit."* **Die Prüfung steht VOR jeder Schreibung**: die Absage
  darf nicht auf ein schon umbenanntes Kriterium folgen.
* **`PUT /api/criteria/order` BLEIBT, WIE ES IST.** Die Oberfläche schickt die
  Kennungen *einer* Liste; der Server nummeriert sie 0 bis n, die andere Liste
  behält ihre Nummern. *Eine zweite Route für die zweite Liste wäre eine Route
  mehr für nichts.*

### 3.3 Die Sterne — eine Route fällt

* **`PUT /api/items/:id/ratings`** unverändert. Das Kriterium bringt seine Phase
  mit.
* **`DELETE /api/items/:id/ratings` IST WEG.** Das Zurücksetzen sitzt an der
  Zeile und läuft über `PUT` mit `value: 0` — *den Weg gibt es seit jeher:*
  `Math.max(0, …)` in `PUT`, und eine Zeile mit 0 ist keine Stimme. **Eine Route
  ohne Weg vom Bildschirm ist tot, und tote Wege gibt es hier nicht.**
* **`GET /api/items/:id/stimmen`** unverändert — je Kriterium; die Oberfläche
  gruppiert nach Phase. *Ein Abruf, zwei Fenster.*

> **DIE WEGNAHME, MIT IHRER BEGRÜNDUNG.** Es ist eine Wegnahme an einer
> **öffentlichen Antwort** — vor 1.0.0 erlaubt, aber benannt: sie steht in
> Abschnitt 5.5 des Projektstands, im CHANGELOG **mit Kasten**, und `F_ROUTEN`
> ist **71 → 70**. *Wer sie von außen ruft, bekommt 404.*
> **Damit entfällt auch die Frage, wie ein Sammel-Zurücksetzen den jeweils
> anderen Kasten verschont: es gibt keins mehr.**
> **Und eine Folge gehört gesagt:** `PUT` mit 0 **löscht die Zeile nicht**, es
> setzt sie auf 0. *Die Zeile bleibt stehen und zählt nirgends mit —
> `usage_count`, der Gesamtschnitt und die Durchschnittsspalte fragen alle
> `value > 0`. Das alte `DELETE` nahm die Zeile mit; für jede Zahl, die jemand
> sieht, ist das dasselbe Ergebnis.*

**DIE GLOCKE ZÄHLT BEIDE KÄSTEN, UND DAS IST ENTSCHIEDEN.** Sie fragt *hat
jemand etwas beigetragen?* und nicht *in welchem Kasten?* — ein Vorher-Stern ist
ein Beitrag. **Das Wort „Bewertungen" in ihrem Text bleibt.** *Wer das trennen
will, braucht eine dritte Zahl in der Antwort; das ist eine eigene Runde.*

### 3.4 Das Austauschformat rückt auf 13

* **Export:** neben `criteria` und `criteriaGewichte` ein drittes Feld
  **`criteriaPhase`** — `{ name: 'vorher' }` **nur für Vorher-Kriterien**, im
  Muster von `criteriaGewichte`. *Eine Datei ohne Vorher-Kriterien sieht aus wie
  bisher, plus einer Formatnummer.*
* **Auch `austauschUmschlagRahmen()` trägt das Feld** — er misst, was der
  Umschlag **kostet**, und er fällt in **jedem** Teil an. *Ohne das Feld fiele
  die Messung je Teil um die Vorher-Kriterien zu niedrig aus.*
* **Import:** ein Kriterium ohne Eintrag in `criteriaPhase` ist `nachher` —
  **damit ist jede Datei aus einem älteren Format ohne Sonderweg lesbar**, und
  nirgends steht eine Fallunterscheidung nach Formatnummer. *Ein unsinniger Wert
  fällt auf `nachher` und bricht nichts ab, wie ein ungültiges Gewicht.*

**DIE ABSAGE ÜBER DIE KÄSTEN HINWEG, und sie fällt VOR dem ersten Schreiben:**
trägt die Datei ein Kriterium, das in der Installation **unter demselben Namen
im anderen Kasten** steht, ist das eine **Absage 400 mit Meldung**, die das
Kriterium nennt.

* *Warum nicht in der Transaktion:* ein Rollback räumte die Zeilen zwar weg,
  **aber die Absage soll gar keine Schreibung auslösen** — auch keine, die
  gleich wieder zurückgenommen wird. **Beim ersetzenden Import wären die drei
  `DELETE`s sonst schon gelaufen.**
* *Warum nicht still einspielen:* die Sterne landeten dann im falschen
  Durchschnitt, und die Datei sagte etwas anderes als die Installation.
* *Gesucht wird über `COLLATE NOCASE`* — so, wie `critByName()` gleich darauf
  sucht. **Eine Absage nach anderer Regel als die Zuordnung wäre keine.**
* **Beide Aufrufer übersetzen sie in ein 400 mit Meldung** — der Import und das
  Wiederherstellen aus dem Papierkorb. *Am Papierkorb kann sie nur greifen, wenn
  ein Kriterium nach dem Löschen des Eintrags gelöscht und im anderen Kasten neu
  angelegt wurde; genau dann soll die Zeile liegen bleiben und der Grund
  dastehen, statt eines 500.*

### 3.5 Vokabular und Blockvorgabe

* **`VOKABULAR_VORGABE` bekommt `potenzial: 'Potenzial'`** — das **zwölfte**
  Wort. `PUT /api/settings` säubert über `Object.keys(VOKABULAR_VORGABE)`, das
  neue Wort läuft dort **ohne weitere Zeile** mit.

> **UND DIE ZWEITE VORGABELISTE IST BEIM ERSTEN ANLAUF VERGESSEN WORDEN — ein
> Befund aus dem Bauen.** `public/app.js` führt **eine eigene Vorgabe** desselben
> Vokabulars: sie steht dort, damit die Oberfläche schon **vor** dem ersten
> Abruf beschriftet ist. *Der Server bleibt die Wahrheit; was er liefert,
> überschreibt.*
> **Wer dort ein Wort vergisst, merkt es nicht am Blockkopf** — der bekommt sein
> Wort vom Server —, **sondern erst im Systembereich:** das Feld in der
> Vokabularkarte steht leer, solange der **gespeicherte** Satz das Wort nicht
> nennt, und ein gespeicherter Satz nennt genau die Wörter, die schon einmal
> jemand gesetzt hat. *Gefunden hat es der Prüfstand an der Lage mit dem
> unvollständigen eigenen Vokabular — genau der Lage, die seit jeher dafür da
> ist, dass ein nicht genanntes Wort seine Vorgabe zeigt.*
* **`BLOCK_VORGABE.seite` wird `['kategorie', 'tags', 'potenzial',
  'bewertung']`** — *vorher steht vor nachher.* Wer eine gespeicherte
  Reihenfolge hat, bekommt den neuen Block über `ordneBereich()` **hinten
  angehängt**; er kann ihn ziehen.
* **`zu` FÜHRT DIE BEIDEN STERNKÄSTEN NICHT MEHR.** `bloecke()` filtert ab jetzt
  über `ZU_BLOECKE` statt über `ALLE_BLOECKE`. *Ein gespeichertes `bewertung` in
  `zu` aus einer älteren Fassung fällt damit still heraus — gewollt, siehe
  Abschnitt 4.*

---

## 4. Der Browser

### 4.1 Ein Zeichner mit einer Phase, nicht zwei Zeichner

Neben `data-block="bewertung"` steht ein zweiter Block `data-block="potenzial"`,
**davor**. Gleiche Bauform: `block-head` mit `label` aus `V.potenzial`, eine
Kopfzahl (`#phead`), für den Admin bei mehreren Benutzern der Knopf
**„Stimmen"**, darunter der Sternkasten `#potenzial-ratings`. **Kein Knopf zum
Zurücksetzen, in keinem der beiden Köpfe.**

**Der Zeichner ist EINE Funktion mit einer Phase.** Die Tafel `KAESTEN` nennt je
Kasten fünf Dinge: die Phase, die Kennung des Kastens, die der Kopfzahl, die des
Erklärknopfs, den Namen des Schnitts und den des Rechenwegs. *Was die Phase
entscheidet, ist dreierlei: welche Zeilen aus `item.ratings` genommen werden,
aus welchem Feld die Kopfzahl kommt und welcher Rechenweg am Erklärknopf hängt.
Sonst nichts.* **Zwei Zeichner wären zwei Wahrheiten über dieselbe Zeile.**

**Gerechnet wird hier nichts.** Beide Kopfzahlen und beide Rechenwege kommen vom
Server.

**Der Text „Noch keine Kriterien. Angelegt werden sie im Systembereich." gilt in
beiden Kästen** und zählt die Zeilen **dieses** Kastens: wer nur
Bewertungskriterien angelegt hat, hat im Potenzialkasten tatsächlich noch keine.

### 4.2 Die Kurzfassung im Kopf

`blockZusammenfassung()` bekommt den Fall `potenzial`: „⌀ 4,2" aus
`potenzialRating`, sonst **„keine Sterne"**. *Nicht „keine Wertung" — das ist
der Text des anderen Kastens, und zwei gleiche Texte an zwei Köpfen wären ein
Rätsel für den, der nur die Köpfe sieht.*

### 4.3 Zuklappen nach Zustand — die Regel ersetzt die Einstellung

```
bewertung : zu = !item.tested && !hatSterne(item, 'nachher')
potenzial : zu =  item.tested
```

* **Ein Klick auf die Kopfzeile schaltet nur `BLICK`** — eine Menge im Speicher
  der Seite, die beim Öffnen eines anderen Eintrags geleert wird. **Kein
  `speichereBloecke()`, kein `PUT /api/settings`** für diese beiden. *Der Klick
  ist ein Blick, kein Befehl.*
* **Der Schalter `sw-test` leert `BLICK`** und zeichnet neu. *Nach dem Umlegen
  steht der richtige Kasten offen, ohne dass jemand klickt — ein Blick von
  vorher kehrte die neue Regel sonst gleich wieder um, und der Klick auf den
  Schalter sähe aus, als hätte er nichts getan.*
* **`hatSterne(item, 'nachher')`** ist wahr, wenn eine Zeile der Phase
  `value > 0` **oder** `avg != null` trägt — *ein ungetesteter Eintrag aus alten
  Zeiten, der Bewertungssterne hat, zeigt sie.* **Vorhandene Daten schlagen die
  Regel; nichts wird vor jemandem versteckt, der es eingetragen hat.**
* **Reihenfolge und Ziehen bleiben**, wie sie sind — `zu` fällt weg, nicht
  `seite`.

> **DAS IST EINE VERHALTENSÄNDERUNG FÜR DEN BEWERTUNGSBLOCK, UND SIE GEHÖRT
> BENANNT:** wer ihn bisher dauerhaft zugeklappt hatte, sieht ihn an getesteten
> Einträgen **wieder offen**. *Sein Eintrag in `bloecke.zu` fällt beim nächsten
> Speichern still heraus.*
>
> **DER GRUND IST DIE REICHWEITE UND NICHT DIE SPEICHERUNG** (jetzt
> **Stolperstein 303**): eine gespeicherte Einstellung gilt für **alle**
> Einträge zugleich, ein Zustand für **einen**. *„Ich klappe an Eintrag 12 den
> Potenzialkasten auf" hieße sonst „an allen Einträgen offen", und beim nächsten
> Eintrag stünde der falsche Kasten offen, ohne dass jemand wüsste, warum.*

### 4.4 Übersicht: Kachel und Sortierung

* **Die Kachel zeigt eine Zahl:** bei `tested` **„★ 3,8"** aus `avgRating` wie
  bisher, bei `!tested` **„◆ 4,2"** aus `potenzialRating`; fehlt die jeweilige
  Zahl, steht der Hinweis dieses Kastens da — **„keine Wertung"** bzw. **„keine
  Sterne"**. *Ein anderes Zeichen, damit niemand 4,2 Potenzial für 4,2 Qualität
  hält, ein `title` mit dem Wort aus dem Vokabular, und eine gedämpfte Farbe
  statt Gold: Gold bleibt der Bewertung.*
* **Die Sortierung bekommt `potenzial_desc` und `potenzial_asc`** — Spiegelbild
  von `rating_desc`/`rating_asc`, mit `?? -1` und `?? 99`, damit Einträge ohne
  Zahl **in beiden Richtungen hinten** stehen.
* **Das Auswahlfeld bekommt die zwei Einträge** mit dem Wort aus dem Vokabular,
  direkt hinter den beiden Bewertungseinträgen.
* **Es wird keine Ansicht vorgefertigt.** *„Als Nächstes" = Ungetestet + nicht
  abgelehnt + Potenzial absteigend speichert der Benutzer einmal selbst —
  Kriterion legt keine erfundenen Daten an.*

> **ABWEICHUNG VOM AUFTRAG, UND SIE IST KLEIN:** er schreibt für die Kachel
> *„fehlt die jeweilige Zahl, steht nichts"*. **Gebaut ist der vorhandene
> Hinweis in der Sprache des jeweiligen Kastens** — „keine Wertung" bzw. „keine
> Sterne". *Grund: bis 0.20.1 stand dort „keine Wertung", und ein ersatzloses
> Streichen wäre eine Wegnahme an der Kachel gewesen, die der Auftrag nicht
> verlangt; „keine Wertung" an einer Idee wäre dagegen das falsche Wort. Der
> Text ist derselbe wie im Kopf des Kastens.*

### 4.5 Der Vergleich

Die Sicht zeigt **zwei Gruppen von Zeilen** — erst die Vorher-Kriterien mit
ihrer Kopfzahl, dann die Nachher-Kriterien mit ihrer, je mit einer **Trennzeile,
die das Wort trägt**. **`eigenerSchnitt()` bekommt die Phase als Argument** und
filtert `it.ratings` danach — *es bleibt die einzige zweite Rechenstelle im
Browser, und sie rechnet weiter nur, was der Server nicht liefern kann: den
Schnitt über meine eigenen Sterne.* Ein Eintrag ohne Sterne in einer Gruppe
zeigt dort einen Strich, keine 0 — **jetzt auch in der Kopfzahl der Gruppe**.

> **EINE ZEILE IST DABEI WEGGEFALLEN, und das gehört benannt:** über jeder
> Spalte stand bis 0.20.1 **eine** Zeile „★ 3,0 Durchschnitt". *Mit zwei Kästen
> ließe sie offen, welchen der beiden sie meint, und zwei solche Zeilen
> übereinander wären zwei Überschriften ohne Zuordnung.* **Die Zahl steht jetzt
> dort, wo ihre Zeilen anfangen.** *Eine leere Gruppe zeichnet gar nichts — eine
> Überschrift über null Zeilen sagt nichts.*

### 4.6 Der Systembereich — zwei Karten, eine Maschine

* **`SYS_KARTEN` bekommt `potenzialkriterien`**, Abschnitt `bestand`, direkt
  hinter `kriterien`, sichtbar für alle, bedienbar für den Admin. *Das ist die
  eine Karte mehr — einundzwanzig.*
* **`karteKriterien()` und `ruesteKriterienAus()` bekommen die Phase als
  Argument.** Dieselbe `manage-list`-Maschine, derselbe Eintrag `crit` mit
  `gewicht: true`, `sortierbar: true`, derselben Warnung — **nur die Liste ist
  nach Phase gefiltert, und `POST` schickt die Phase mit.**
* **Titel der neuen Karte: `${V.potenzial}: Kriterien`** — mit Doppelpunkt,
  nicht zusammengesetzt.
* **Die Beschreibung sagt drei Dinge:** was der Kasten ist, dass die Zahl in
  einen eigenen Durchschnitt fließt und die Bewertung nicht berührt, und **den
  Rat, dass zwei oder drei Kriterien reichen** — mit den Vorschlägen *Wunsch*
  (Gewicht 1,5), *Nutzen*, *Machbarkeit*. **Ein Rat und kein Deckel.**
* **Die Vorschlagsliste der Gewichte (`#gewichtsug`) steht nur EINMAL im
  Dokument**, an der ersten Karte. *Zwei `datalist` mit derselben Kennung wären
  zwei Knoten für einen Verweis; die zweite Karte liegt dahinter und findet die
  eine.*

---

## 5. Die Sternzeile — × statt Kopfknopf, und kein Sprung mehr

**Zwei Befunde an derselben Zeile, und sie gehören in dieselbe Runde**, weil
beide Kästen sie bekommen.

### 5.1 Das × an der Zeile

* **`stars()` bekommt hinter dem fünften Stern einen sechsten Platz**, gleich
  breit, mit einem **×**. Er ist **immer im Dokument** und **sichtbar nur, wenn
  `value > 0`** — über eine Klasse mit `visibility: hidden`, **ausdrücklich
  nicht über `hidden`/`display: none`**. *Sonst rutschten die Sterne beim ersten
  Stern nach links, und das ist genau der Sprung, den 5.2 abschafft.*
* **Tipp auf das × ruft `onReset`** — dieselbe Rückruffunktion wie bisher, jetzt
  über `PUT` mit 0. **Der Doppelklick und der Hover-Text fallen weg.**
* **Auf Berührungsgeräten wird das Ziel 32 × 32 Bildpunkte** — *über die BREITE
  und nicht über `padding`: das × trägt schon eine Breite, und ein Innenabstand
  käme dort obendrauf; die Sternreihe würde breiter, statt dass das Ziel größer
  wird.*
* **Die Meldung ist phasenneutral:** *„Meine Sterne bei „Wunsch" entfernt"* —
  sie gilt in beiden Kästen, und „Bewertung" wäre im Potenzialkasten das falsche
  Wort.
* **`stars()` ohne `onReset` bleibt, wie es ist:** kein sechster Platz. *Nur die
  Zeile, die zurücksetzen kann, trägt das ×.*
* **Das Vorschauleuchten geht über die STERNE und nicht über alle Kinder** —
  sonst färbte das × als sechstes Kind mit, sobald jemand darüberfährt.

### 5.2 Die Durchschnittszelle hat ihre Breite von Anfang an — gemessen

**Ein Strich, solange niemand bewertet hat.** Die Zelle `.ravg` zeigt **„–"**
statt nichts, mit dem Titel *„noch niemand"*.

> **DAS WIDERRUFT ZWEI SÄTZE IM STYLESHEET, und beide bleiben stehen, damit der
> Widerruf einen Gegenstand hat** (Stolperstein 201).
> *(1) „Keine Mindestbreite mehr":* der Satz stimmte für sich — die Spalte
> richtet sich nach der breitesten Zahl der **Liste** — und übersah den Fall, in
> dem die Liste **gar keine** Zahl trägt.
> *(2) „Hier steht ausdrücklich kein Text für die leere Zelle":* das gilt für
> einen **Satz**. **Ein Strich ist keiner, sondern der Platz, der der Zahl
> gehört**, und er sagt „noch niemand".

**Die Mindestbreite ist gemessen und nicht geschätzt.** In der
Festbreitenschrift, `.8rem`, in Chromium:

| Text | Stufe 100 (Wurzelschrift 15) | Stufe 120 (Wurzelschrift 18) |
|---|---|---|
| **„⌀ 4,2 (9)"** — die Hausform | **65,03 px** | **77,98 px** |
| „⌀ 4,2 (12)" | 72,25 px | 86,64 px |
| „⌀ 4,2" | 36,13 px | 43,33 px |
| „–" | 7,23 px | 8,67 px |

**65,03 ÷ 15 = 4,335 → `min-width: calc(4.34rem + 9px)`.**

* **In `rem` und nicht in Pixeln**, weil die Installation ihre Schrift von 80
  bis 120 Prozent stellt — dieselbe Überlegung wie beim Deckel der
  Sicherungsliste (13.98rem, 0.20.1). *Nachgerechnet: 4,34 × 18 = 78,1 px gegen
  gemessene 77,98 — die Hausform passt bei jeder Stufe.*
* **Die 9 Pixel Innenabstand kommen dazu**, weil `box-sizing` global auf
  `border-box` steht: ohne das `calc()` nähme der Innenabstand der Zahl neun
  ihrer Pixel weg, und „⌀ 4,2 (9)" bräche um.

### 5.3 Auf dem Telefon: der Name über der Zeile

Am vorhandenen Umbruchpunkt (`max-width: 700px`) wird die Zeile **zweizeilig**:
der Name allein in der ersten Zeile über die ganze Breite (`grid-column: 1 / -1`),
darunter Sterne mit × links und der Durchschnitt rechts. **Die Trennlinie liegt
unter der zweiten Zeile, nicht unter dem Namen** — sie hängt an den *Zellen*
(`.rrow > *`), also wird sie dem Namen dort ausdrücklich weggenommen.

**Das Muster gibt es schon:** die Stimmenliste setzt den Namen über die Sterne.

> **BEI EINEM EINZIGEN ZUGANG ÄNDERT SICH AUCH HIER NICHTS**, und das ist eine
> Abweichung vom Wortlaut des Auftrags, die benannt gehört: er schreibt „die
> Zeile wird zweizeilig" ohne Einschränkung. **Gebaut ist
> `.rlist:not(.ohne-schnitt)`.** *Grund: `ohne-schnitt` hat gar keine
> Durchschnittsspalte, also auch keine Mindestbreite — dem Namen bleibt neben
> Sternen und × die halbe Breite. Der Befund aus 5.3 des Auftrags ist der
> DREISPALTIGE Fall, und nur er wird behandelt; eine Zeile umzubrechen, die
> passt, wäre eine Änderung ohne Grund. Der Auftrag sagt denselben Satz in 5.2
> über die Mindestbreite.*

### 5.4 Der Kopf wird kurz

* **„Meine Bewertung zurücksetzen" fällt** — samt `confirmBox`, samt `reset-r`.
* **„Wer hat bewertet" wird „Stimmen"** — der Name der Route, der Name der Sache
  im Dialog, **ein Wort**, und es steht in **beiden** Köpfen gleich. *„Wer hat
  bewertet" wäre im Potenzialkasten das falsche Wort.*
* **Der Kopf trägt danach:** Beschriftung, Kopfzahl mit Erklärknopf, für den
  Admin „Stimmen". **In beiden Kästen dasselbe. Auf dem Telefon eine Zeile.**
* *Das Fenster nennt seinen Kasten im Titel — „Stimmen — Potenzial" bzw.
  „Stimmen — Bewertung" —, und es zeigt nur die Zeilen dieses Kastens.*

### 5.5 Was gemessen wurde

**Kein Sprung mehr — gemessen an der Lage der Sternreihe, nicht behauptet.**
Gemessen wurden linke und rechte Kante von `.stars` in vier Zuständen, im
Vergleich mit einer **Kontrolle** ohne Mindestbreite und ohne den Platz des ×
(also dem Stand 0.20.1):

**Breiter Bildschirm (Ansichtsbereich 1200 px):**

| Zustand | gebaut (0.21.0) | Kontrolle (0.20.1) |
|---|---|---|
| niemand hat bewertet | 825,20 / 933,91 | 903,06 / 991,77 |
| **der erste Stern** | **825,20 / 933,91** | **874,17 / 962,88** |
| der zweite Bewerter | 825,20 / 933,91 | 845,27 / 933,97 |
| zehn Bewerter | 818,05 / 926,75 | 838,05 / 926,75 |

* **Sprung beim ersten Stern: 0,00 px gebaut, 28,89 px in der Kontrolle.**
* **Sprung beim zweiten Bewerter: 0,00 px gebaut, 28,90 px in der Kontrolle.**
* **Ab zehn Stimmen wächst die Spalte einmal um 7,15 px** — *benannt und
  hingenommen: wer zehn Bewerter hat, hat andere Sorgen als sieben Bildpunkte.*
* Die Zelle misst gebaut **74,09 px** — genau `4,34rem + 9px` —, bei zehn
  Stimmen 81,25 px.

**Telefon (Ansichtsbereich 360 px): NICHTS bewegt sich, auch bei zehn Stimmen
nicht.** *Dort ist die Zahlenspalte `1fr` und schluckt den Zuwachs.*

**Und die zweite Zeile geht auf 360 Bildpunkten auf** — gemessen mit dem
längsten Kriteriennamen des Bestands, „Verarbeitungsqualität":

| Schriftstufe | Name (Zeile 1) | Sterne mit × | Durchschnittszelle | Seitenbreite |
|---|---|---|---|---|
| 100 | 336,0 × 30,6 @12,17 | 108,7 @12,48 | 227,3 @121,48 | **360 — kein Querlauf** |
| 120 | 336,0 × 34,9 @12,17 | 128,4 @12,52 | 207,6 @140,52 | **360 — kein Querlauf** |

**Der Name bricht nicht mehr mitten im Wort**, und „⌀ 4,2 (9)" braucht bei Stufe
120 77,98 px und hat 207,6 px Platz. *Der Auftrag erwartete „ja, mit Luft" — das
ist gemessen und trifft zu.*

> **WIE GEMESSEN WURDE, damit es nachvollziehbar bleibt:** Chromium headless,
> das Stylesheet der Installation, die Zeile aus echten Klassen aufgebaut, die
> Zustände nacheinander gezeichnet und `getBoundingClientRect()` gelesen. **Der
> Ansichtsbereich kommt aus einem `iframe` fester Breite** — ein `iframe` hat
> seinen eigenen Ansichtsbereich, und Medienregeln darin richten sich nach
> seiner Breite. *Ohne diesen Griff misst headless Chromium alles bei 500 px,
> und die erste Messung dieser Runde tat genau das.*
>
> **EIN SCHIRMFOTO LIEGT NICHT BEI.** *Der Auftrag verlangt „vorher/nachher-
> Schirmfoto"; gebaut ist stattdessen die Zahlentabelle oben mit einer
> Kontrolle, die den alten Zustand nachstellt.* **Grund und Abweichung gehören
> zusammen genannt:** keine Binärdateien im Repo (Bauregel), und eine
> **gemessene Kante** sagt schärfer als ein Bild, ob sich etwas bewegt hat —
> 0,00 gegen 28,89 px ist eine Aussage, die ein Bild nicht macht. *Der Blick von
> Hand am echten Bestand steht damit weiter aus und ist unten als offener Punkt
> benannt.*

---

## 6. Was ausdrücklich NICHT gebaut wurde

**a) KEIN ZWEITER STERNMECHANISMUS.** Keine Tabelle `prioritaeten`, keine Spalte
an `items`, keine Phase an `ratings`.

**b) KEIN WECHSEL DER PHASE NACH DEM ANLEGEN.** Ein Wechsel trüge vergebene
Sterne von einem Durchschnitt in den anderen — *und zwar still.*

**c) KEINE VORGEFERTIGTEN KRITERIEN, KEINE VORGEFERTIGTE ANSICHT.**

**d) KEINE WORTE AN DEN STERNEN** („5 = sofort"). *Sie passen zu „Wunsch" und zu
sonst nichts.*

**e) KEIN DECKEL AUF DER ZAHL DER KRITERIEN.** Ein Rat in der Karte, kein 400.

**f) KEINE GLOCKE JE KASTEN.**

**g) KEIN VERSTECKEN.** Der jeweils andere Kasten wird zugeklappt, nicht
ausgeblendet.

**h) KEINE ZWEI ZAHLEN AUF DER KACHEL.**

**i) KEINE ZWEITE RECHNUNG IM BROWSER.** `eigenerSchnitt()` bleibt, was es ist —
jetzt je Phase.

**j) KEINE ÄNDERUNG AN `UNIQUE(name)`.**

**k) KEIN SAMMEL-ZURÜCKSETZEN, KEIN DOPPELKLICK, KEIN HOVER-TEXT.**

**l) KEIN TEXT IN DER LEEREN DURCHSCHNITTSZELLE.** Ein Strich, kein Satz.

---

## 7. Die Fahrplanregel, die aus dieser Runde folgt

> **ZWISCHEN ZWEI GEPLANTEN RUNDEN BLEIBT AB JETZT EINE NUMMER FREI.**

**Der Fahrplan ist seit 0.12.0 ACHTMAL gerückt worden, und jedes Mal um den
ganzen Rest** — zuletzt durch diese Runde selbst. *Jedes Rücken kostet dieselbe
Arbeit an denselben Stellen (Fahrplan, Sammelblatt, Änderungsprotokolle, die
Sätze, die aufeinander verweisen), und jedes Mal wird eine davon vergessen.*
**Eine freie Nummer je Zwischenraum lässt die nächste eingeschobene Runde dort
Platz finden, ohne dass sich dahinter etwas bewegt.**

**Der Fahrplan nach dieser Regel:**

| Nummer | Runde |
|---|---|
| 0.20.0 · 0.20.1 | gebaut |
| **0.21.0** | **diese Runde — eingeschoben** |
| 0.22.0 | Die Oberfläche wird ruhiger |
| 0.23.0 | *frei* |
| 0.24.0 | Die wählbare Bildablage |
| 0.25.0 | *frei* |
| 0.26.0 | Bereinigung — der Bruch *(0.26.x: Die Kommentare werden knapp)* |
| 0.27.0 | *frei* |
| 0.28.0 | Mehrsprachigkeit |
| 0.29.0 | *frei* |
| 0.30.0 | Code-Effizienz — **nicht gerückt** |

**0.30.0 ist die eine Nummer, die stehen bleibt**, und das ist kein Zufall: sie
stand ohnehin frei, und der Takt aus einer geplanten und einer freien Runde
trifft sie genau. *Die Regel gilt den geplanten **MINOR**-Runden; eine
PATCH-Zahl (0.26.x) belegt keinen Zwischenraum.*

**Warum diese Runde hier eingeschoben wurde**, steht im Projektstand,
Abschnitt 10: *hinter 0.20.0*, weil die klemmte; *vor die Oberfläche*, weil die
den Bewertungsblock umgestaltet und wer erst umgestaltet und dann einen zweiten
Block danebenstellt, zweimal gestaltet; *vor die Bereinigung*, weil sie einen
Migrationsblock bringt und die Bereinigung die Blöcke ausbaut.

---

## 8. Neue Stolpersteine

**302. EIN KASTEN JE FRAGE.** Zwei Fragen in einem Durchschnitt sind
Stolperstein 47 in Reinform — und man sieht es der Zahl nicht an.

**303. DER ZUSTAND ENTSCHEIDET DIE VORGABE, DIE EINSTELLUNG NICHT.** Was vom
einzelnen Eintrag abhängt, darf nicht in einer Einstellung stehen, die für alle
gilt.

**304. EIN ÜBERGANGENES FELD SIEHT FÜR DEN AUFRUFER AUS WIE EIN GESETZTES.**
Deshalb 400 statt Stillschweigen beim Versuch, die Phase zu ändern.

**305. EINE FREIE PORTBASIS WIRD AUSGERECHNET, NICHT GESUCHT.** Und wer die
gefundenen entdoppelt, macht aus einer belegten eine freie. Siehe Abschnitt 9a.

**306. ZWISCHEN ZWEI GEPLANTEN RUNDEN BLEIBT EINE NUMMER FREI.** Siehe
Abschnitt 7.

*Die folgenden fünf stammen nicht aus dem Bauen, sondern aus dem
**Gegenprobenlauf am Ende** — Abschnitt 9a erzählt sie der Reihe nach.*

**307. EINE SPALTE, DIE DER SCHLÜSSEL SCHON BESTIMMT, IST IM `GROUP BY`
STUMM.** Was das Verhalten nicht sieht, macht ein Wächter über den Quelltext
rot.

**308. WER IMMER AN EINEM GEGENSTAND PRÜFT, PRÜFT DEN WECHSEL NIE.** Wo eine
Zusage „gilt bis hierhin" lautet, muss die Prüflage über die Grenze hinausgehen.

**309. EIN FEST GESCHRIEBENER WERT IST VON EINEM EINGESETZTEN NICHT ZU
UNTERSCHEIDEN, SOLANGE BEIDE GLEICH LAUTEN.** Die Prüflage muss ihn umstellen.

**310. EIN LIEGENGEBLIEBENER SERVER MACHT NICHT DEN LAUF KAPUTT, SONDERN DIE
TABELLE.** Und zwar in die gefährliche Richtung: ein stummer Rückbau sieht aus
wie ein greifender.

**311. EIN RÜCKBAU, DER EIN FELD WEGNIMMT, REISST DIE KETTE DARAUF AB, STATT
SIE ROT ZU MACHEN.** Erst das Objekt, dann sein Inhalt.

*Der volle Wortlaut steht im Projektstand, Abschnitt 6.*

---

## 9. Prüfstand und Gegenproben

**Vorher 5403, nachher 5512 — 109 neue, keine weggefallen.** *Beide Zahlen sind
gefahren und nicht gerechnet: der Prüfstand des Standes vor dieser Runde
(`b74064f`) ist eigens noch einmal gelaufen und hat **5403 von 5403** gemeldet,
genau die Zahl, die im Projektstand für 0.20.1 steht.*

| Gruppe | vorher | nachher | Wofür |
|---|---|---|---|
| **Zwei Kästen, zwei Durchschnitte — 0.21.0** | — | **33** | Die Runde am Server: der Migrationsblock (zweimal hintereinander, beim zweiten Mal stumm, auf einer Datei, der die Spalte **vorher genommen** wurde), beide Durchschnitte nebeneinander, **`tested` ändert keinen von beiden**, die getrennten Rechenwege, die Phase an jeder Sternzeile, die Absage beim Anlegen, die **400 statt Stillschweigen** am `PUT`, das Format **13** mit `criteriaPhase`, eine Datei aus Format 12, **der Namenskonflikt über die Kästen hinweg — abgewiesen, bevor etwas geschrieben ist** — und der Rundlauf über Export und Import |
| **Zwei Kästen in der Oberfläche — 0.21.0** | — | **36** | Die Runde im Browser: die Reihenfolge der Blöcke, **jeder Kasten zeigt nur seine Zeilen**, die Regel aus dem Zustand statt aus der Einstellung, der **Blick** (ein Klick, der nichts speichert — und **der über den Wechsel des Eintrags hinaus geprüft wird**), der Schalter „Getestet", die Kachel mit **◆**, die beiden Sortiereinträge, **beide Kriterienkarten mit ihren eigenen Listen und ihrer eigenen Phase im Rumpf**, und **das Wort am Blockkopf aus einem umgestellten Vokabular** |
| **Die Sternzeile — 0.21.0** | — | **16** | Das **×** an der eigenen Sternreihe: es steht nur da, wo es etwas zurückzusetzen gibt, es wird **unsichtbar statt weg** (`visibility`, nicht `display`), die leere Durchschnittszelle zeigt **„–"**, die Zahlenspalte trägt ihre **gemessene** Mindestbreite in `rem`, und auf dem Telefon steht der Name über den Sternen |
| **Die Gegenproben greifen** | 20 | **26** | **Der Wächter über fremde Server** (Abschnitt 9a, siebtens): er ist von außen erreichbar, findet die Server dieses Laufs mit Verzeichnis und Port, **meldet sich selbst nicht**, und der Treiber ruft ihn **vor** dem ersten Rückbau und bricht ab. Dazu die Zahl der Rückbauten und die beiden Quelltextwächter |
| **Der Umschalter der Vergleichsansicht** | 23 | **27** | Zwei Gruppen statt einer Liste, jede mit eigener Kopfzahl — und **eine leere Gruppe wird gar nicht gezeichnet** |
| **Einstellungen: Vokabular und Schriftgröße** | 19 | **22** | Das **zwölfte** Wort: es steht in der Vorgabe, lässt sich setzen und fällt leer auf die Vorgabe zurück |
| **Das Raster der Kriterienliste zählt seine Zellen — 0.17.0** | 19 | **21** | Die Spaltenzahl steht jetzt an **drei** Stellen im Stilblatt, und die dritte liegt **innerhalb** der Telefonabfrage |
| **Rechte an Testtagen und Bewertungen** | 16 | **18** | Die weggenommene Route `DELETE /api/items/:id/ratings` — sie ist fort, und das × tut ihre Arbeit je Zeile |
| **Blöcke anordnen und einklappen** | 23 | **24** | Der neunte Block, und dass die beiden Sternkästen ihren Einklappzustand **nicht** mehr speichern |
| **Anordnung der Blöcke** | 7 | **8** | Der neunte Block steht in der Liste, an seinem Platz |
| **Der Systembereich nach Rolle** | 71 | **72** | Die einundzwanzigste Karte |
| **Mehrbenutzer-Anzeigen in der Oberfläche** | 107 | **108** | Der Knopf „Stimmen" steht in **beiden** Kastenköpfen |
| **Favorit: der Knopf im Eintrag** | 30 | **31** | — |
| **Die Sternreihe steht auf einer Linie — 0.14.0** | 18 | **19** | Eine **umgedrehte** Zusage statt einer gelöschten (Stolperstein 74) |
| **Der zweite Faktor: die Tabellen legen sich selbst an** | 16 | **17** | Der neunte Migrationsblock |
| **zusammen** | **5403** | **5512** | **+109** |

> **DIE NEUN MIGRATIONSBLÖCKE UND DIE ZWÖLF VOKABELWÖRTER STEHEN
> AUSDRÜCKLICH ALS ZAHL** — dieselbe Linie wie bei `F_ROUTEN`. *Eine Prüflage,
> die still verschwindet, fällt sonst niemandem auf.* **Es sind neun Blöcke und
> zwölf Wörter**; die Zahlen stehen im Prüfstand und nicht nur in diesem Papier.

### Der Gegenprobenlauf

PLATZHALTER_TABELLE

---

## 9a. Befunde aus dem Prüfstand und aus dem Gegenprobenlauf

**ERSTENS: DREI NEUE PRÜFLAGEN, DREI BELEGTE PORTBASEN — und aufgefallen ist es
an einer ganz anderen Stelle.**

Die neue Gruppe bringt **drei eigene Instanzen** mit: die Runde selbst, eine für
die Datei aus dem vorigen Format samt Konflikt, und eine frische für den
Rundlauf über Export und Import. *Der erste Anlauf spannte ihre Basen mit **20**
Abstand — die Fenster sind aber **60** breit, sie überlappten einander, und der
dritte Server bekam einen Port, auf dem schon der zweite horchte: seine
Einrichtung ging an die falsche Instanz, und der Import antwortete mit **401**.*

**Der zweite Anlauf nahm 5260, 5320 und 5380 — und das waren GENAU DIE DREI
BASEN DER MAILGRUPPE.** *Diesmal färbten sich **fünfzehn** Punkte rot, alle im
**Mailversand** — also an einer Stelle, die mit dieser Runde nichts zu tun hat
und die, allein gefahren, grün blieb (116 von 116).*

> **DER FEHLER LAG IM BLICK AUF DIE LISTE, NICHT IM ZÄHLEN.** Gesucht wurde mit
> einem Suchmuster über den Quelltext, und die gefundenen Basen wurden
> **entdoppelt**, bevor jemand sie ansah. **Eine belegte Basis sieht dann aus
> wie eine freie.** *Und das Suchmuster war obendrein unvollständig: **zehn**
> Basen stehen an Aufrufstellen, die es gar nicht findet.*
>
> **Die vollständige Liste druckt der Prüfstand selbst** — die Zeile „Der Lauf
> hat seine Portbasen vermerkt" nennt sie, und sie kommt aus `PRUEFLAGEN` und
> nicht aus einem Suchmuster. **Der dritte Anlauf hat die freien Fenster daraus
> ausgerechnet** statt sie zu suchen: **7180, 7240, 7300** — die ersten drei
> freien, samt Gegenprobe gegen die Sperrliste von `fetch()` auf allen vier
> Spuren.
>
> **DIE SPANNE ALLER BASEN MISST DAMIT 3460 und bleibt unter dem Versatz von
> 3500.** *Wer eine weitere Basis anhängt, fällt an der Zeile „Der Versatz je
> Nebenspur ist größer als die Spanne aller Basen" auf — dort ist dann eine
> Lücke weiter unten zu nehmen.*
>
> **Ein zweiter Server auf demselben Port fällt nicht von selbst auf**: die
> Bereitschaftsprüfung bekommt ja eine Antwort (Stolperstein 139). *Deshalb
> steht die Zahl der Basen ausdrücklich im Prüfstand — sie ist die einzige
> Stelle, an der eine doppelt vergebene Basis sichtbar wird.*

**ZWEITENS: DIE ZWEITE VORGABELISTE DES VOKABULARS.** Sie steht oben in
Abschnitt 3.5 mit ihrer Begründung; hier gehört nur der Weg dazu, auf dem sie
gefunden wurde: **an der Prüflage mit dem unvollständigen eigenen Vokabular** —
genau der Lage, die seit jeher dafür da ist, dass ein nicht genanntes Wort seine
Vorgabe zeigt. *Sie hat sich als Erste gefärbt, und zwar an einem leeren Feld in
der Vokabularkarte, nicht am Blockkopf: der bekommt sein Wort vom Server.*

---

### Und dann hat der Gegenprobenlauf sechs weitere geliefert

*Der erste vollständige Lauf über die vierunddreißig neuen Rückbauten hat
**sechs stumme** und **einen abgerissenen** zurückgegeben — und obendrein
gezeigt, dass zwei Zeilen der Tabelle gar nicht von den Rückbauten stammten.
Alle sind abgearbeitet; die Tabelle in Abschnitt 9 ist die des Nachlaufs.*

**DRITTENS: DAS `GROUP BY` TRUG DIE ZUSAGE NICHT — DAS `SELECT` TRUG SIE.**
Rückbau **571** nimmt `c.phase` aus dem `GROUP BY` der Abfrage des einzelnen
Eintrags. Er kam **STUMM** zurück, und das war kein Versehen im Prüfstand,
sondern eine falsche Annahme im Rückbau selbst.

> **NACHGEMESSEN STATT GERATEN:** an einem eigens gebauten Bestand — fünf
> Kriterien in beiden Phasen, drei Bewerter je Kriterium — kommen mit und ohne
> die Spalte im `GROUP BY` **Zeile für Zeile dieselben Werte** heraus.
> *`criterion_id` bestimmt die Phase eindeutig: ein Kriterium hat genau eine
> Zeile in `rating_criteria`. Also teilt die Spalte keine Gruppe und legt keine
> zusammen.* **Die Trennung hängt am `SELECT`** — ohne die Spalte dort kommt
> die Schnittzeile ohne Phase an, `karteJePhase()` legt sie in **keinen** der
> beiden Kästen, und beide Durchschnitte fallen auf `null`.
>
> **Und für genau diesen Griff gab es keinen Rückbau.** Die Runde hatte für die
> beiden Schnittabfragen nur den ans `GROUP BY`. **Nachgetragen: 602 und 603.**
>
> *Die Zeile im `GROUP BY` bleibt trotzdem stehen* — eine bloße Spalte neben
> einem Aggregat ist eine **Freundlichkeit von SQLite und kein SQL**; jede
> strengere Fassung und jede andere Maschine weist sie ab. **Was das Verhalten
> nicht sieht, macht jetzt ein Wächter über den Quelltext rot** (dieselbe
> Bauform wie der zweite Musterwächter von 0.20.0, Rückbau 547). *Damit sind
> 570 und 571 nicht mehr stumm.*

**VIERTENS: DER PRÜFSTAND HAT DEN EINTRAG NIE GEWECHSELT.** Rückbau **593**
nimmt `BLICK.clear()` am Eingang der Detailansicht weg — der Blick gälte dann
über Einträge hinweg und wäre in Wahrheit eine Einstellung, die niemand
speichert. **STUMM.** *Der Grund war eine Lücke und keine Kleinigkeit: **keine
einzige** Prüflage der Gruppe hat den Eintrag je gewechselt. An einem einzigen
Eintrag ist ein bleibender Zustand von einem endenden nicht zu unterscheiden.*
**Nachgetragen ist die Lage, die sie trennt:** an Eintrag 1 klappt ein Blick den
Potenzialkasten **zu** — gegen die Regel —, dann geht es auf Eintrag 2, eine
Idee ohne Sterne, wo dieselbe Regel gilt. *Bleibt er zu, hat der Blick den
Eintrag überlebt.*

**FÜNFTENS: DREI RÜCKBAUTEN SCHEITERTEN AN DER VORGABE.** **597** (die zweite
Kriterienkarte ohne Filter), **598** (das Anlegen ohne `phase` im Rumpf) und
**600** (das Wort am Blockkopf fest im Quelltext) kamen alle drei stumm zurück —
*und alle drei aus demselben Grund:* **die Prüflage trug den Wert, der auch die
Vorgabe ist.**

> Drei Nachher-Kriterien im Mock — da lässt ein Filter auf `nachher` alles
> durch. Die Vorgabe des Servers ist `nachher` — da fällt ein fehlendes
> `phase` im Rumpf nicht auf. Und die Vorgabe des Vokabulars **heißt**
> „Potenzial" — da ist ein fest geschriebenes Wort von einem eingesetzten nicht
> zu unterscheiden.
>
> **Nachgetragen sind drei Lagen, die den Wert UMSTELLEN:** zwei Kriterien im
> einen Kasten und eines im anderen; ein Klick in **beiden** Karten mit der
> Frage, welche Phase im Rumpf steht; und ein eingestelltes Vokabular mit
> `potenzial: 'Erwartung'` — *das Wort aus dem Konzeptpapier und nicht
> irgendeines.*

**SECHSTENS: EIN RÜCKBAU HAT DEN LAUF ABGERISSEN, STATT IHN ROT ZU MACHEN.**
Rückbau **573** nimmt `it.potenzialRechenweg` aus der Antwort. Die Prüfzeile
darauf lautete `phD.potenzialRechenweg.zeilen.length === 1` — *und die wirft,
sobald das Objekt fehlt.* **Der Lauf riss ab, und ein abgerissener Lauf belegt
nichts** (Stolperstein 138). **Berichtigt nach Stolperstein 81:** eine eigene
Zeile für „stehen beide Rechenwege überhaupt da", und die Zeile darunter greift
mit `?.` daneben.

**SIEBTENS: ZWEI ZEILEN DER TABELLE STAMMTEN GAR NICHT VON IHREN RÜCKBAUTEN.**
*Das ist der unangenehmste Befund des Laufs, weil er die Tabelle selbst
betrifft.*

> **570** stand mit „2 rot" da — beide Punkte lagen im **Mailversand**, in
> seiner eigenen Gruppe hatte er **keinen einzigen**. **596** stand mit „16 rot"
> da, davon **fünfzehn** im Mailversand und **einer** — der echte — in seiner
> eigenen Gruppe.
>
> **DIE URSACHE WAREN SIEBEN LIEGENGEBLIEBENE SERVER** aus abgebrochenen Läufen
> dieser Runde, noch immer an den Ports **6180, 6190, 6203, 6219, 6226, 6233 und
> 6242** — *mitten im Fenster der Mailgruppe (Basis 6190) und im Fenster
> darunter (6130).* **Spur 0 fährt ohne Versatz und lief gegen sie**; beide
> auffälligen Zeilen stammen von Spur 0. *Ein zweiter Server auf demselben Port
> fällt nicht von selbst auf: die Bereitschaftsprüfung bekommt ja eine Antwort*
> (Stolperstein 139).
>
> **Die Tabelle hat damit in die gefährliche Richtung gelogen:** ein Rückbau
> ohne einen einzigen Punkt in seiner Gruppe sah aus wie ein greifender. *Ein
> stummer Rückbau, den man für einen Beleg hält, ist schlimmer als gar keine
> Tabelle.*
>
> **GEBAUT IST DARAUS EIN WÄCHTER IM TREIBER:** `fremdeServer()` geht vor dem
> ersten Rückbau über `/proc`, findet jeden Prozess, dessen Befehl auf
> `server.js` oder `pruefung.js` endet, nennt **PID, Datei, `PORT` und
> Verzeichnis** — und der Lauf **bricht ab**, statt zu warnen. *Keine neue
> Abhängigkeit: dieselbe `/proc`-Lesung, die das Aufräumen ohnehin benutzt.*
> **Geprüft wird er am laufenden Prüflauf selbst** — er ist ja einer, und damit
> hat die Zeile einen Gegenstand statt einer leeren Liste. **Rückbauten 604 und
> 605.**

---

## 10. Was offen geblieben ist

- **DER FELDBELEG ZU DIESER RUNDE STEHT AUS.** *Der Sollwert des Fingerprints
  steht unten; die Meldung von der laufenden Installation über `GET /api/stats`
  fehlt.* **Und mit ihr die Handgriffe aus Abschnitt „Am Ende des Chats" des
  Auftrags** — ein Vorher-Kriterium anlegen, an einem getesteten Eintrag einen
  Stern setzen, den Schalter umlegen, nach Potenzial sortieren, einen Stern über
  das × entfernen, exportieren und wieder einspielen.
- **DER BLICK VON HAND AUF DIE STERNZEILE FEHLT.** *Die Zahlen aus 5.5 sind in
  Chromium gemessen und mit einer Kontrolle abgesichert; ein Blick am echten
  Bestand auf einem echten Telefon steht aus.*
- **DIE BEIDEN HANDGRIFFE AUS 0.20.0 SIND WEITER OFFEN** — eine eigene Datei in
  den Sicherungsordner legen und nachsehen, dass sie liegen bleibt, und die
  Zeile im Sicherheitsprotokoll je entfernter Kopie. *Sie stehen seit 0.20.1 in
  dieser Liste und sind mit dieser Runde nicht angefasst worden.*
- **DIE URSACHE DES ABRISSES VON 79 SEKUNDEN (0.20.1) BLEIBT UNERMITTELT.**
  *Sie ist in dieser Runde nicht wieder aufgetreten.*
- **EINE SICHT „ERWARTUNG GEGEN ERGEBNIS"** — welche Einträge haben ihr
  Potenzial eingelöst, welche nicht. *Beide Zahlen sind da; die Sicht ist eine
  eigene Runde — und sie ist der Grund, warum nichts gelöscht wird.*
- **DIE GLOCKE JE KASTEN**, falls das Mitläuten der Vorher-Sterne stört. *Eine
  dritte Zahl in der Antwort, kein Umbau.*
- **WORTE JE KRITERIUM AN DEN STERNEN** — verworfen für diese Runde (6d).
- **DER VOLLE GEGENPROBENLAUF** über alle Rückbauten — weiter ausstehend.

---

PLATZHALTER_FINGERPRINT
