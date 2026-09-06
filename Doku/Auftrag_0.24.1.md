# Auftrag 0.24.1 — „Der Quelltext spricht Englisch"

**WAS IN DIESER RUNDE PASSIERT, IN EINEM ABSATZ:** Kriterion ist auf Deutsch
gedacht und auf Deutsch geschrieben — nicht nur seine Oberfläche, sondern auch
jeder Name im Code: `spracheVon`, `zeichneZugaenge`, `SICHERUNG_DIR`,
`karte.titelSpeichern`, `#/system/datenbank`, `/api/anfragen`, `.zug-status`,
`--zl-linie`, `pruefung.js`. **In dieser Runde wird jeder dieser Namen
englisch.** Ausnahmslos: Bezeichner, Schlüssel der Sprachdatei, Adressen und
Seitennamen, ids und Stilblattklassen, Umgebungsvariablen und die Namen der
Dateien, die Code enthalten. **Danach liest sich Kriterion, als wäre es von
Anfang an englisch geschrieben worden.** *Was NICHT mitgeht: die Kommentare im
Quelltext und alle Papiere — sie bleiben Deutsch, wie sie sind (Konzept
Abschnitt 0, Satz 3, seit 0.22.0 geschriebene Regel).*

**Und am Bildschirm ändert sich kein Zeichen.** Kriterion wirkt danach genauso
wie heute: eine deutsche Anwendung. **Das ist die Abnahme, und sie ist in einer
Zeile prüfbar** — die *Werte* von `de.json` sind hinterher Byte für Byte
dieselben wie vorher; nur ihre *Schlüssel* heißen anders.

Aufsetzend auf **0.24.0, Fingerprint `795ddc8a`** — der Stand von `main` am
6. September 2026 (`0681d42`).

> **DIE NUMMER: 0.24.1.** Nach dieser Runde kann die Installation nichts, was
> sie vorher nicht konnte, und sie sieht aus wie vorher — **PATCH nach
> Abschnitt 5.1 des Projektstands.** Die zugehörige MINOR-Zahl, 0.24.0, ist am
> 6. September 2026 herausgegangen; die PATCH-Zahl dahinter ist damit frei und
> richtig. *Der Betreiber hat die Runde am selben Tag eingeschoben und die
> Mehrsprachigkeit dahinter eine Nummer höher gerückt (Fahrplan).*
>
> **WARUM SIE VOR STUFE 2 KOMMT UND NICHT DANACH:** Stufe 2 legt `en.json`
> neben `de.json` und schreibt die Wahl der Sprache. Beides fasst genau die
> Stellen an, die diese Runde umbenennt. **Wer erst übersetzt und dann
> umbenennt, macht dieselbe Arbeit zweimal** — und die zweite Fassung von
> `en.json` müsste gegen 1190 umbenannte Schlüssel nachgezogen werden, von
> Hand, ohne dass ein Wächter das prüfen könnte. *Deshalb: erst der Name, dann
> die Sprache.*

---

## Zuerst: neun Fragen, die vor der ersten Zeile geklärt werden

**Kein Bauabschnitt beginnt, bevor die Spalte „Antwort" gefüllt ist.** Die
Fragen werden **beim Start der Runde im Gespräch** gestellt, beantwortet und
hier eingetragen — nicht unterwegs (Abschnitt 12 des Projektstands: *vor dem
Bauen besprechen, Entscheidungen ausdrücklich bestätigen lassen*). Die Spalte
„Vorschlag" ist der Vorschlag dieses Papiers; **entschieden ist nichts,
solange die Antwort fehlt.**

**Fünf der neun kosten nichts und sind mechanisch** (F3 bis F7). **Vier
entscheiden über Aufwand und Risiko dieser Runde** — F1 und F2 über die
Datenbank, F8 über den Prüfstand, F9 über das, was ein Betreiber in seiner
`.env` stehen hat. *Wer sie überspringt, baut gegen eine Vermutung.*

| # | Frage | Vorschlag | Antwort |
|---|---|---|---|
| **F1** | **Werden die Namen im Datenbankschema mit umbenannt?** Sechs Tabellen heißen deutsch (`anfragen`, `sicherheitsprotokoll`, `papierkorb`, `papierkorb_bytes`, `zweifaktor`, `zweifaktor_codes`), dazu zwölf Spalten (`gewicht`, `phase`, `art`, `dauer`, `gesetzt_am`, `zoom`, `haengt`, `kann`, `mit`, `nimmt`, `rejected_grund`, `rejected_von`) | **Ja, mit Migrationsblock.** Ein Schemaname ist kein Inhalt, sondern Code — und `db.js` wäre sonst der eine Ort, an dem Deutsch stehen bliebe. `ALTER TABLE … RENAME` und `RENAME COLUMN` kann SQLite seit 3.25; der Block läuft einmal und ist danach ein Nichts. *Kostet: eine Datenbankstufe, und damit eine Sicherung vor dem Einspielen* | |
| **F2** | **Werden auch die gespeicherten WERTE umbenannt?** Siebzehn Vorgangsschlüssel im Sicherheitsprotokoll (`anmeldung.ok`, `zugang.neu` …), die Phasen (`vorher`/`nachher`), die Zustände (`aktiv`/`gesperrt`/`geloescht`), die Schemata (`hell`/`dunkel`/`geraet`) und neunzehn Einstellungsschlüssel (`sicherungBehalten`, `bilderUmwandeln`, `bloecke`, `schrift` …) | **Ja — im selben Block, und das ist der teure Teil.** Sonst steht in jedem Vergleich weiter ein deutsches Wort (`z.was === 'zugang.status'`), und „nativ englisch" wäre eine Behauptung. **Der Block muss auch die Exportdateien lesen können, die es schon gibt:** ein Import übersetzt die alten Werte beim Einlesen, sonst wird ein Export von gestern morgen unlesbar | |
| **F3** | **Wie heißen die Schlüssel der Sprachdatei?** Heute `karte.titelSpeichern`, `liste.keineNeuigkeiten` — aber auch `anmeldung.dankeDeineAdresseIstBestaetigt`; neun deutsche Namensräume | **Englisch, kurz, nach der SACHE — nicht nach dem Satz.** `card.saveTitle`, `list.noNews`, und aus `anmeldung.dankeDeineAdresseIstBestaetigt` wird **`login.confirmed`**. Die neun Namensräume werden `login` · `dialog` · `entry` · `list` · `card` · `server` · `mail` · `vocabulary` · `error`. **Latte: höchstens drei Wörter und 24 Zeichen hinter dem Punkt** (0.2). *Und das Verzeichnis heißt `public/languages/`; die Dateien behalten ihren ISO-Code (`de.json`)* | |
| **F4** | **Was wird aus den Adressen?** `#/system/datenbank`, `#/offen`, `#/bestaetigung`, `#/einladung` und neun deutsche API-Wurzeln | **Alle englisch — und die alten werden übersetzt, nicht fallen gelassen.** Für `#/system` gibt es diesen Mechanismus schon dreimal (`anlage`, `instanz`, `scheune` aus 0.17.0 und 0.19.1); er bekommt die neuen Paare dazu. *Ein Lesezeichen auf eine Einstellungskarte darf nicht ins Leere zeigen* | |
| **F5** | **Und die API-Wege?** | **Hart umbenannt, ohne Altwege.** Der einzige Rufer ist `public/app.js`, und der wird in derselben Runde umgestellt. **Eine API ohne fremde Rufer braucht keine Rücksicht** — anders als eine Adresse, die in einem Lesezeichen steht. *`F_ROUTEN` bleibt bei 70; der Wächter zählt sie weiter* | |
| **F6** | **ids, Stilblattklassen und Stilblattvariablen?** 243 ids, 380 Klassen, 79 Variablen — davon rund 110 deutsch | **Ja, alle.** Sonst bleibt das Stilblatt der letzte deutsche Ort, und `document.getElementById('zug-name')` steht mitten im englischen Code. *Sie sind nirgends nach außen sichtbar: kein Lesezeichen, kein Export, keine Schnittstelle hängt daran* | |
| **F7** | **Und die Namen der Dateien, die Code enthalten?** Acht von dreizehn heißen deutsch | **Ja, per `git mv`.** `anhaenge.js` → `attachments.js`, `bestandslauf.js` → `batchrun.js`, `bilder.js` → `images.js`, `schluessel.js` → `keytool.js`, `zugang.js` → `usertool.js`, `zweifaktor.js` → `twofactor.js`, `pruefung.js` → `testbench.js`, `gegenprobe.js` → `counterproof.js`, `public/thema.js` → `public/theme.js`. *`schluessel.js` und `zugang.js` sind Werkzeuge für die Kommandozeile — ihre Namen stehen in der README und im Kasten „Auf dem Server" und ziehen dort mit* | |
| **F8** | **Ziehen Prüfstand und Gegenprobe mit?** 678 von 3928 Bezeichnern in `testbench.js`, 16 von 74 in `counterproof.js` — dazu **5862 Prüfungsnamen und 685 Rückbaunamen auf Deutsch** | **Die Bezeichner ja, die Namen nein.** Ein Prüfungsname ist Text für den Betreiber, der den Lauf liest — dieselbe Sache wie ein Kommentar, und der bleibt ausdrücklich deutsch. *Wer beides zugleich anfasst, kann hinterher nicht mehr sagen, ob eine rote Zeile vom Umbenennen kommt oder von der Sache* | |
| **F9** | **Die Umgebungsvariablen?** `OEFFENTLICHE_ADRESSE`, `HINTER_PROXY`, `PORT_VERSATZ` — die stehen in der `.env` des Betreibers | **Umbenannt mit Rückfall auf den alten Namen**, und der alte schreibt eine Zeile ins Containerprotokoll. `PUBLIC_ADDRESS`, `BEHIND_PROXY`, `PORT_OFFSET`. *Eine `.env`, die nach dem Einspielen nicht mehr gilt, ist der eine Fall, in dem ein Betreiber im Dunkeln steht: die Instanz startet und verhält sich anders* | |

**Was nicht gefragt wird, weil es entschieden ist:** dass die **Kommentare und
alle Papiere deutsch bleiben** (der Betreiber hat es beim Stellen des Auftrags
gesagt, und die Regel steht seit 0.22.0), dass **am Bildschirm kein Zeichen
anders wird**, und dass die **Werte der Sprachdatei nicht angefasst werden.**

---

## Woher

**Gemessen am Stand `0681d42` (0.24.0), am 6. September 2026:**

| Ort | was dort deutsch heißt | gezählt |
|---|---|---|
| Ausgelieferter Code, 13 Dateien | Bezeichner (`const`, `let`, `function`, `class`, Parameter) | **808 von 2148** |
| `server.js` | | 234 von 563 |
| `public/app.js` | | 362 von 979 |
| `auth.js` | | 122 von 228 |
| die übrigen zehn | | 90 von 378 |
| `pruefung.js` | Bezeichner | **678 von 3928** |
| `gegenprobe.js` | Bezeichner | **16 von 74** |
| `public/sprachen/de.json` | Schlüssel | **1190, alle deutsch**, in 9 Namensräumen |
| `public/app.js` | Adressen (`#/…`) | 7 Wege, davon **4 deutsch** — dazu 5 Abschnittsnamen und 3 übersetzte Altadressen |
| `server.js` | API-Wurzeln | 36, davon **9 deutsch** |
| `public/app.js` | ids | 243, davon **48 deutsch** |
| `public/style.css` | Klassen | 380, davon **49 deutsch** |
| `public/style.css` | Stilblattvariablen | 79, davon **11 deutsch** |
| `db.js` | Tabellen | 26, davon **6 deutsch** |
| `db.js` | Spalten | **12 deutsch benannte** |
| Datenbank, Inhalt | gespeicherte Schlüssel und Werte | **17 Vorgänge, 19 Einstellungsschlüssel**, dazu Phasen, Zustände und Schemata |
| Dateinamen | Code-Dateien | 13, davon **8 deutsch**, dazu `public/thema.js` und `public/sprachen/` |
| `.env` | Umgebungsvariablen | 3 deutsch (`OEFFENTLICHE_ADRESSE`, `HINTER_PROXY`, `PORT_VERSATZ`) |

**Das ist die größte Runde, die dieses Projekt bisher hatte** — nicht nach
Schwierigkeit, sondern nach Fläche. *Fast dreitausend Namen, und jeder einzelne
darf keine Zeile Verhalten ändern.*

---

## Worum es geht, in vier Sätzen

**Ein Name im Code ist kein Text am Bildschirm.** Er wird nicht gelesen,
sondern benutzt — von dem, der das Programm ändert, und von jedem Werkzeug,
das es liest. **Englisch ist die Sprache, in der das getan wird:** jede
Bibliothek, jede Fehlermeldung der Laufzeit, jedes Stück Beispielcode, jeder
Fremde, der später hineinsieht. *Ein Programm, dessen Namen halb deutsch und
halb englisch sind, zwingt jeden Leser, bei jedem Namen zu raten, in welcher
Hälfte er gerade ist.*

**Die Oberfläche ist davon unberührt** — sie ist seit 0.24.0 kein Code mehr,
sondern eine Datei. Genau deshalb ist diese Runde jetzt möglich und war sie
vorher nicht: *bis 0.24.0 hätte man beim Umbenennen der Namen die Texte mit
angefasst und hätte hinterher nicht mehr sagen können, ob am Bildschirm etwas
anders steht.* Seit die Texte in `de.json` liegen, ist die Trennung scharf: **die
Schlüssel ändern sich, die Werte nicht.**

---

## Bauabschnitt 0 — das Wörterbuch, bevor eine Zeile fällt

### 0.1 Was gebaut wird

**Eine Liste `Doku/Namenswoerterbuch_0_24_1.md`: deutsch → englisch, je Sache
ein Paar.** Sie wird geschrieben und **beschlossen, bevor der erste Name
fällt** — und danach ist sie die eine Wahrheit, aus der jeder Abschnitt liest.

* **Nach der Sache, nicht Wort für Wort.** `zeichneZugaenge` wird
  `drawUsers` und nicht `drawAccesses`: am Bildschirm heißt es seit 0.22.0
  „Benutzer", und der Name folgt der Sache, nicht dem alten Wort.
* **Ein Begriff, ein englisches Wort** — dieselbe Regel wie S3 für die
  Oberfläche. `Eintrag` ist überall `entry`, nie einmal `item` und einmal
  `entry`. *Ausnahme: `items` in der Datenbank und in `/api/items` heißt schon
  so und bleibt — der Bestand ist älter als das Wörterbuch.*
* **Die Bilder des Projekts bleiben in den Kommentaren.** `Stolperstein`,
  `Rückbau`, `Wächter`, `Klemme`, `Wirt` sind Sprache der Papiere und nicht
  des Codes; wo sie heute in einem Bezeichner stehen (`rueckbau`,
  `waechter`), bekommen sie einen sachlichen englischen Namen
  (`regression`, `guard`).
* **Die Liste trägt jedes Paar, das mehr als einmal vorkommt** — geschätzt
  400 bis 500 Einträge. *Ein Name, der nur an einer Stelle steht, braucht
  keinen Eintrag; einer, der an dreißig steht, braucht ihn zwingend.*

### 0.2 Der gesunde Menschenverstand benennt — die Latte erinnert nur ans Hinsehen

> **DIE REGEL, DIE ÜBER ALLEN ANDEREN DIESES ABSCHNITTS STEHT, HAT EINEN NAMEN,
> UND DER BETREIBER HAT IHN AM 6. SEPTEMBER 2026 GENANNT: GESUNDER
> MENSCHENVERSTAND.** *Er hat sie genannt, nachdem er zweimal gezeigt hatte,
> wohin eine Regel ohne ihn führt — einmal zu lang, einmal fast gleich —, und
> gleich dazugesagt, worauf sie hinausläuft: „es muss sinnvoll sein … aber eine
> strenge Regel kann manchmal auch unsinnige kurze Namen machen".*
>
> **Daraus folgt die Reihenfolge, und die Reihenfolge ist der ganze Inhalt: ein
> Name muss SINNVOLL sein; unter den sinnvollen nimmt man den kürzesten.** Ein
> kurzer Name, bei dem man raten muss, ist schlechter als ein langer, bei dem
> man es nicht muss. **Jede Zahl weiter unten ist deshalb eine Erinnerung ans
> Hinsehen und keine Schranke.** *Wer hinsieht, nachdenkt und dann den längeren
> Namen nimmt, hat diese Regel befolgt und nicht gebrochen. Wer die Zahl
> einhält und dabei einen Namen hinterlässt, den der Nächste raten muss, hat
> sie gebrochen — auch wenn die Prüfung dazu schweigt.*
>
> **Und weil der Menschenverstand nicht messbar ist, die Latte aber schon,
> gilt: die Latte weist nichts ab.** *Wer über sie hinausmuss, darf; er
> schreibt einen Satz dazu, warum. Die Prüfung zählt diese Sätze — damit eine
> Entscheidung eine Entscheidung bleibt und nicht zur Gewohnheit wird.*

**Ein Name soll so kurz sein, wie er sein kann, ohne zu raten zu geben.**
*Der Betreiber hat es am 6. September 2026 gesagt, und das Beispiel war
`anmeldung.dankeDeineAdresseIstBestaetigt`.* **Der Fehler daran ist nicht die
Länge, sondern die Herkunft:** dieser Name ist aus dem SATZ gebildet worden und
nicht aus der SACHE. Das Umzugswerkzeug aus 0.24.0 hat das so gemacht — es
konnte gar nicht anders, es kannte nur den Satz. **Diese Runde macht es
richtig herum:** der Schlüssel benennt, WOFÜR der Satz da ist, und der Satz
steht daneben in der Datei. Aus `anmeldung.dankeDeineAdresseIstBestaetigt`
wird **`login.confirmed`**.

**Die Latte, aus dem heutigen Bestand gemessen — als Anlass zum Hinsehen:**

| | heute | Latte |
|---|---|---|
| Schlüssel, Namensteil hinter dem Punkt | Median **17** Zeichen, längster **37** | **höchstens 24 Zeichen** |
| Schlüssel, Wörter im Namensteil | 269 mit einem, 378 mit zwei, 166 mit drei — aber **261 mit fünf und mehr** | **höchstens drei Wörter** |
| Bezeichner im Code | Median **10** Zeichen, längster **26**; nur zwei über 24 | **höchstens 24 Zeichen, in der Regel unter 16** |

**782 der 1190 Schlüssel halten die Latte schon heute** — 408 müssen kürzer
werden, davon 232 an beidem. *Bei den Bezeichnern sind es zwei; die Latte ist
dort keine Arbeit, sondern eine Bremse für die Umbenennung: wer aus
`zeichneZugaenge` ein `drawUserAccessTable` macht, hat das Ziel verfehlt.*

**Was die Latte NICHT ist:** ein Grund für ein Kürzel. `cfg`, `usr`, `btn`
unterschreiten sie und sagen weniger, nicht mehr. **Kurz heißt: wenige Wörter,
und jedes davon trägt** — `login.confirmed` und nicht `login.cnf`.

**UND DER ZWEITE FEHLER DERSELBEN HERKUNFT, den die Latte allein nicht fängt:
zwei Sätze, die gleich anfangen, bekommen fast denselben Namen.** Der Betreiber
hat auch dafür ein Beispiel genannt:

```
karte.umbenennenOderLoeschenBeimLoeschen   „Umbenennen oder löschen. Beim Löschen bleiben …"   (Kategorien)
karte.umbenennenOderLoeschenEin            „Umbenennen oder löschen. Ein gelöschter Tag …"     (Tags)
```

*Zwei Karten, zwei verschiedene Sätze — und die Namen unterscheiden sich erst
im vierten Wort, an einer Stelle, die nichts über die Sache sagt.* **Nach der
Sache benannt heißen sie `card.categoriesHint` und `card.tagsHint`**, und der
Unterschied steht vorn statt hinten.

**Woran man diesen Fehler im Bestand erkennt, in zwei Zahlen:** **66 Schlüssel
tragen eine angehängte Ziffer** (`eintrag.loeschen2` bis `eintrag.loeschen6`,
`karte.linkZumZuruecksetzenErzeugen2`) — die Ziffer ist die Notlösung des
Werkzeugs, wenn zwei Sätze denselben Namen ergaben. Und **133 Schlüssel in 65
Gruppen stimmen in ihren ersten drei Wörtern überein.** *Beides verschwindet
von selbst, sobald der Name die Sache nennt: zwei verschiedene Sachen haben
verschiedene Namen, ohne dass man durchzählen müsste.*

**Deshalb gilt in dieser Runde: keine angehängte Ziffer.** Wo eine steht, ist
der Name nicht gefunden, sondern durchnummeriert. *Die Kürzeprobe hält es fest;
die Ausnahme ist der Fall, in dem zwei Sachen wirklich dasselbe heißen — und
den gibt es dann nur einmal, nicht sechsmal.*

**Wo ein Name die Latte reißen muss, reißt er sie** — und zwar immer dann, wenn
das kürzere Wort zweideutig wäre, zu allgemein, oder zwei verschiedene Sachen
gleich benennen würde. *Solche Namen stehen im Wörterbuch mit einem Satz
Begründung. Sie sind keine Verstöße, sondern Entscheidungen — die Prüfung
zählt sie und nennt sie, sie weist keinen davon ab.*

**Drei Fälle, in denen der längere Name der richtige ist:**

* **Zwei Sachen, ein kurzes Wort.** `card.backups` und `card.oldBackups` sind
  zwei Karten; `card.backups2` wäre kürzer und falsch.
* **Ein Wort, das ohne Beiwerk etwas anderes heißt.** `entry.rating` ist im
  Bestand zweideutig — es gibt den Kasten *vor* dem Test und den *nach* ihm;
  `entry.ratingAfterTest` ist länger und sagt, welcher gemeint ist.
* **Ein Satz, der wirklich ein Satz ist.** Ein Hinweis unter einer Karte hat
  keinen kurzen Namen, den man nicht raten müsste; `card.backupKeyWarning` ist
  fünf Silben lang und trotzdem der beste, den es gibt.

### 0.3 Was dabei nicht verhandelbar ist

* **Kein Kürzel, das man nachschlagen muss.** `usr`, `cfg`, `btn` sind keine
  englischen Namen, sondern eine dritte Sprache.
* **Kein Wort aus der Verbotsliste des Bildschirms** — sie gilt für die
  Oberfläche, nicht für den Code, aber wo ein Name am Bildschirm ankommt
  (eine CSS-Klasse tut das nicht, ein Schlüssel der Sprachdatei auch nicht),
  gilt sie weiter.
* **Das Wörterbuch wird eingecheckt, bevor Abschnitt 1 anfängt.**

---

## Bauabschnitt 1 — das Werkzeug und seine Probe

### 1.1 Was gebaut wird

**Ein Umbenenner, der einen Bezeichner sicher ersetzt** — und „sicher" heißt:
**er fasst nur Code an.** Zeichenketten, Vorlagentexte, reguläre Ausdrücke und
Kommentare werden vorher maskiert; ein Name in einem Text bleibt stehen.

* **Er arbeitet auf Wortgrenzen** und nie auf Teilstücken: `wert` ersetzt
  nicht die Hälfte von `wertung`.
* **Er kennt den Bereich.** Ein lokaler Name in einer Funktion darf nicht
  denselben Namen in einer anderen Funktion mitreißen.
* **Und er hat eine Probe, die jede Anwendung begleitet:** die Vielfachmenge
  aller Zeichenketten der Datei ist vorher und nachher **dieselbe**. *Genau
  diese Probe hat in 0.24.0 den einen Fehlgriff gefangen, bei dem aus
  `getElementById('sw-test-t')` ein `'sw-test-schalter'` wurde.*

### 1.2 Was dabei nicht verhandelbar ist

* **Kein Suchen-und-Ersetzen über die ganze Datei.** Es gab in 0.24.0 genau
  einen solchen Versuch, und er hat eine Zeichenkette getroffen.
* **Nach jeder Anwendung `node --check`** und der volle Prüfstand.
* **Das Werkzeug liegt im Repo** (`werkzeug/` oder im Prüfstand), nicht in
  einem Scratchpad: die nächste Runde wird es brauchen.

---

## Bauabschnitt 2 — die Sprachdatei

**1190 Schlüssel, neun Namensräume, ein Verzeichnis.**

* `public/sprachen/` wird **`public/languages/`**; `de.json` behält seinen
  Namen.
* Die neun Namensräume werden englisch (F3).
* **Jeder Schlüssel wird umbenannt, kein Wert wird angefasst.**
* Die Ruforte in `app.js`, `server.js`, `auth.js` und `mail.js` ziehen mit —
  einschließlich der Tabellen, die einen Schlüssel *halten* (`VORGANGSWORT`,
  `ROLLENWORT`, `THEMA_NAMEN`, `VERWALTUNGSART`, `PROTOKOLL_ANSICHT`).
* **Die sieben Wächter aus 0.24.0 ziehen mit** und bleiben grün: Deckung,
  Verwendung, Platzhalter, Mehrzahl, Rest, Rückfall, Format.

**Die Abnahme dieses Abschnitts ist eine Zeile:** die sortierte Liste der
*Werte* von `de.json` ist vorher und nachher identisch.

---

## Bauabschnitt 3 — die Serverseite

**`server.js`, `auth.js`, `db.js`, `mail.js`, `keys.js`, `anhaenge.js`,
`bilder.js`, `bestandslauf.js`, `zugang.js`, `zweifaktor.js`,
`schluessel.js`** — in dieser Reihenfolge, **je Datei ein Commit**, jeder mit
grünem Prüfstand.

* Bezeichner nach dem Wörterbuch.
* **Die API-Wege in derselben Runde** (F5), zusammen mit ihren Rufern in
  `app.js` — ein halb umbenannter Weg ist eine kaputte Anwendung.
* **`db.js` zuletzt**, weil dort das Schema hängt (Abschnitt 6).

---

## Bauabschnitt 4 — die Oberfläche

**`public/app.js` (10 963 Zeilen), `public/style.css`, `public/index.html`,
`public/thema.js`.**

* Bezeichner, **ids, Klassen und Stilblattvariablen** (F6) — und die drei
  Dateien ziehen **gemeinsam** um: eine Klasse, die nur im Stilblatt
  umbenannt wird, ist ein unsichtbarer Fehler.
* **Ansicht für Ansicht, ein Commit je Ansicht** — dieselbe Einteilung wie in
  0.24.0: Anmeldung · Dialoge und Kopfzeile · Liste · Eintrag ·
  Systembereich · der Rest.
* **Die Adressen** (F4) mit der Übersetzung der alten.

---

## Bauabschnitt 5 — die Datei- und Umgebungsnamen

* **`git mv` für die acht Code-Dateien** (F7), `require`-Aufrufe nachziehen,
  `.dockerignore` und `package.json` mit.
* **Die README und der Kasten „Auf dem Server"** nennen `zugang.js` und
  `schluessel.js` beim Namen — sie ziehen mit, und die vier Server-Befehle im
  Prüfstand ebenso.
* **Die Umgebungsvariablen** (F9) mit Rückfall und Protokollzeile.

---

## Bauabschnitt 6 — die Datenbank *(nur wenn F1 und F2 „ja" sagen)*

**Ein Migrationsblock, und er ist der einzige Teil dieser Runde, der einen
Bestand anfasst.**

* Tabellen und Spalten über `ALTER TABLE … RENAME`.
* **Die gespeicherten Werte über ein `UPDATE` je Paar**, aus derselben Liste,
  aus der der Code liest — nicht aus einer zweiten.
* **Der Import übersetzt alte Werte beim Einlesen**, damit ein Export von
  gestern morgen noch geht.
* **Der Block läuft genau einmal** und ist danach ein Nichts; er steht in
  `db.js` bei den anderen und trägt seine Nummer.

**Was ein Betreiber tun muss:** **eine Sicherung vor dem Einspielen.** Das ist
die erste Datenbankstufe seit 0.19.0, und der CHANGELOG bekommt seinen Kasten.

---

## Bauabschnitt 7 — der Prüfstand

### 7.1 Die Bezeichner ziehen mit

`testbench.js` und `counterproof.js` (F8) — **Bezeichner ja, Prüfungs- und
Rückbaunamen nein.**

### 7.2 Sechs neue Wächter, jeder mit seiner Gegenprobe

| Wächter | hält fest |
|---|---|
| **Namensprobe** | kein Bezeichner im ausgelieferten Code trägt ein deutsches Wortstück — gegen die Liste aus dem Wörterbuch; die Ausnahmen stehen **namentlich** da |
| **Schlüsselprobe** | kein Schlüssel in `public/languages/*.json` trägt ein deutsches Wortstück |
| **Adressprobe** | kein Weg (`#/…`, `/api/…`) trägt ein deutsches Wort — **und jede alte Adresse wird übersetzt**, namentlich geprüft |
| **Gestaltprobe** | keine id, keine Klasse, keine Stilblattvariable trägt ein deutsches Wortstück |
| **Wortlautprobe** | die **Werte** von `de.json` sind Zeichen für Zeichen die von `0681d42` — die Abnahme der Runde, als Prüfung |
| **Kürzeprobe** | **kein Schlüssel trägt eine angehängte Ziffer** (heute 66) — und die Namen über der Latte (drei Wörter, 24 Zeichen) stehen **namentlich** da, je mit dem Satz aus dem Wörterbuch, der sie begründet. *Sie werden gezählt, nicht abgewiesen: die Zahl ist festgenagelt, damit eine Ausnahme eine Entscheidung bleibt und nicht zur Gewohnheit wird* |

### 7.3 Die Zahlen, die festgenagelt werden

Deutsche Bezeichner im ausgelieferten Code = **0** · deutsche Schlüssel = **0**
· deutsche Wege = **0** · Schlüssel in `de.json` = **1190, unverändert** ·
`F_ROUTEN` = **70, unverändert** · `PERSOENLICHE_SCHLUESSEL` = **10,
unverändert** · Prüfungen = die gemessene Zahl.

**Dazu die Zahlen der Kürze**, gegen die von heute gestellt: **Schlüssel mit
angehängter Ziffer 66 → 0** · **Schlüssel mit fünf und mehr Wörtern 261 → die
gemessene Zahl, und die steht namentlich da** · **längster Schlüsselname 37 →
die gemessene Zahl**. *Die Zahl der begründeten Ausnahmen ist selbst
festgenagelt — eine Ausnahme, die niemand zählt, wird zur Auslegung. Sie darf
größer als null sein; sie darf nur nicht unbemerkt wachsen.*

---

## Was ausdrücklich NICHT gebaut wird

* **Keine Übersetzung der Oberfläche.** `en.json` kommt in Stufe 2.
* **Kein Kommentar wird angefasst** — weder übersetzt noch gekürzt. *Wer beim
  Umbenennen einen Kommentar mitliest, der nicht mehr stimmt, notiert ihn im
  Sammelblatt und lässt ihn stehen.*
* **Kein Papier wird übersetzt.**
* **Keine Umgestaltung.** Eine Funktion, die beim Umbenennen als zu lang
  auffällt, bleibt zu lang. *Wer beides zugleich tut, kann eine rote Zeile
  nicht mehr zuordnen.*
* **Kein Wort am Bildschirm ändert sich**, auch keins, das jemandem beim
  Lesen nicht gefällt.

---

## Der Prüfstand — was er halten muss

1. **`npm test` grün**, und jede neue Prüfung hat ihre Gegenprobe **gefahren**.
2. **Die Werte von `de.json` sind Byte für Byte die von `0681d42`.**
3. **Kein deutscher Bezeichner, Schlüssel, Weg, id, Klasse oder Dateiname**
   im ausgelieferten Code — die Ausnahmen namentlich.
3a. **Keine angehängte Ziffer in einem Schlüssel** (heute 66), und die Namen
   über der Latte stehen namentlich mit Begründung da — gezählt, nicht
   abgewiesen.
4. **Jede alte Adresse wird übersetzt**, jede alte Umgebungsvariable gelesen.
5. **Der jsdom-Durchgang und der Augenschein im Browser zeigen dieselben
   Ansichten wie `0681d42`** — in beiden Farbschemata.
6. **Ein Export von `0681d42` lässt sich einspielen** (nur bei F2 „ja").
7. **`F_ROUTEN` = 70, `PERSOENLICHE_SCHLUESSEL` = 10, `/api/config` = 5
   Felder** — unverändert.

---

## Bauregeln

* **Zuerst die neun Fragen** — gestellt, beantwortet, eingetragen.
* **Dann das Wörterbuch**, eingecheckt, bevor ein Name fällt.
* **Die acht Bauabschnitte in dieser Reihenfolge**, jeder ein eigener Commit
  mit grünem Prüfstand; innerhalb von 3 und 4 je Datei bzw. je Ansicht einer.
* **Ein halb umbenannter Stand ist erlaubt, eine halb umbenannte Datei
  nicht.**
* **Nach jedem Abschnitt der Augenschein**, und am Ende der volle: alle
  Ansichten, beide Schemata, ein Bild je Ansicht gegen den Stand von 0.24.0.
* **Wer einen Namen findet, den das Wörterbuch nicht kennt, trägt ihn nach** —
  in das Wörterbuch, nicht nebenbei in den Code.
* **Im Zweifel für den Sinn — der gesunde Menschenverstand steht über der
  Latte.** Wer zwischen einem kurzen und einem klaren Namen wählen muss, nimmt
  den klaren und schreibt ihn ins Wörterbuch. *Ein Name, den der Nächste
  nachschlagen muss, hat nichts gespart; eine Zahl, die eingehalten wurde und
  einen solchen Namen erzeugt hat, auch nicht.*
* **Die Gegenprobe wird gefahren, nicht nur geschrieben.** Eine stumme
  Gegenprobe ist ein Fund.

---

## Die Dokumente

| Datei | was |
|---|---|
| `Doku/Namenswoerterbuch_0_24_1.md` | **neu** — die eine Liste deutsch → englisch |
| `Doku/Aenderungsprotokoll_0.24.1.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_24_1.md` | `git mv`, Revision 67, **Regel S9** in 5.6: *ein Name im Code ist englisch* |
| `CHANGELOG.md` | ein Eintrag — **mit Kasten, wenn F1/F2 „ja" sagen** |
| `Doku/Fehler_und_Ideen.md` | Wegweiserzeile |
| `package.json` | 0.24.1 |

---

## Was danach offen bleibt

* **Stufe 2 der Mehrsprachigkeit** — `en.json`, die Wahl der Sprache, das
  Vokabular je Sprache in der Datenbank. *Sie findet nach dieser Runde
  englische Schlüssel vor und muss nichts nachziehen.*
* **Die Kommentare** bleiben deutsch — dauerhaft, nicht vorläufig.
* **Die neun Altlasten aus 0.24.0** (Wörter, die das Wörterbuch vom Bildschirm
  genommen hat und die in `auth.js` und den Briefen stehen geblieben sind) —
  sie gehören in eine eigene Runde und werden hier nicht angefasst.
