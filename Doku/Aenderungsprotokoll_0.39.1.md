# Änderungsprotokoll 0.39.1 — „Was für vergangene Prozesse gebaut wurde, geht heraus"

**Gebaut am 22. September 2026 auf 0.39.0. Fingerprint `XXXXXXXX`, davor
`2ba1c469`.**

**Vorgabe des Betreibers: 0.39.0 ist die einzige Fassung, die es öffentlich je
geben wird.** Vor ihr liegt keine veröffentlichte Version, aus der jemand einen
Bestand, eine `.env` oder eine Exportdatei mitbrächte. Jeder Code und jeder
Text, der genau diesen Fall behandelt, zeigt im öffentlichen Stand auf nichts.

**Die eine Datenbank, die die alte Spaltenfolge trug, ist umgeschichtet.** Der
Betreiber hat `tools/reorder.js` am 22. September 2026 gefahren.

---

## 1. Die Bilanz

| | |
|---|---:|
| Dateien angefasst | 23 |
| Zeilen entfernt | **1.575** |
| Zeilen hinzugekommen | 150 |
| **Netto** | **−1.425** |

---

## 2. Die fünf Werkzeuge

| Datei | Zeilen | wofür sie gebaut war |
|---|---:|---|
| `tools/reorder.js` | 278 | die Spaltenfolge — ein Lauf, am 22. September 2026 |
| `tools/rename.js` | 276 | Bezeichner im Code umbenennen, deutsch → englisch |
| `tools/gestalt.js` | 203 | ids, Klassen und Stilblattvariablen umbenennen |
| `tools/rename-test.js` | 96 | die Probe zu `rename.js` |
| `tools/scan-words.js` | 68 | Wortstücke in Bezeichnern zählen |
| **zusammen** | **921** | |

**Kein Modul, kein Prüfstand und keine Workflow-Datei hat eine von ihnen
geladen.**

### Warum auch der Umbenenner geht

**Gemessen am 22. September 2026 über alle 36 Quelltextdateien**, getrennt nach
Code, Kommentar und Text — die sieben Eigennamen, die die Hausordnung als
Gegenstand einer späteren Umbenennungsrunde nennt:

| | Vorkommen |
|---|---:|
| **im Code — Bezeichner** | **0** |
| in Kommentaren | 223 |
| in Prüfnamen und Strings | 95 |

**Der Zweck des Werkzeugs ist die Trennung: Bezeichner anfassen, Texte nicht.**
Sie hat keinen Gegenstand mehr. Sein Sicherheitsnetz — die Vielfachmenge aller
Strings ist vorher und nachher dieselbe — greift bei einer reinen Kommentar-
und Prüfnamenrunde gerade nicht, weil dort die Strings sich ändern sollen.

**`tools/segments.js` bleibt** und wird von `test/frame.js`, `test/source.js`,
`tools/comments.js` und `tools/gleichlaut.js` geladen. Wer die Runde später
fährt, hat den Zerleger.

### Was mitgegangen ist

* **`db.js`** — der Export von `SCHEMA`. Nur `tools/reorder.js` hat ihn gelesen.
* **`testbench.js`** — der Eintrag `'reorder'` in `MODULE`.
* **`test/reorder.js`** — 351 Zeilen. **Die Prüfungen über die Spaltenfolge
  sind nach `test/roundtrip.js` gewandert**, in eine Gruppe „Die Spaltenfolge:
  `data` steht am Ende": der `SCHEMA`-String hält sie, `trash_bytes` ebenso,
  und eine von der DDL angelegte Datenbank trägt sie auch. *Vier Prüfungen und
  nicht drei — der Gegenstand steht vor der Verneinung, wie überall.*
* **`counterproof.js`** — die Rückbauten 1200, 1201 und 1202. **1199 bleibt**
  und zeigt auf die neue Gruppe.
* **`README.md`** — der Abschnitt „Die Spaltenfolge einer bestehenden
  Datenbank" samt seiner Zeile im Inhaltsverzeichnis.

---

## 3. Code für Bestände, die es öffentlich nicht gibt

### Was gefallen ist

| Stelle | |
|---|---|
| `db.js` `LEGACY_TABLES` | die sechs Tabellen, die bis 0.32.1 deutsch hießen, samt der Schleife darüber in `incompleteDatabase()` |
| `db.js` — das Feld `kind` am Befund | es hätte nur noch einen Wert |
| `auth.js` — drei Warnblöcke | `AUTH_RESET`, `AUTH_USER` und `AUTH_PASSWORD` sprachen zu einer `.env`, die es öffentlich nicht gibt |
| `auth.js` `fromEnv` | der zweite Parameter und die Warnzeile; vier Aufrufstellen sind nachgezogen |
| `counterproof.js` | Rückbau 1038 |
| `test/roundtrip.js` | die Probe „Eine Tabelle unter ihrem alten Namen" |

**Die vier deutschen Umgebungsnamen werden nicht mehr gelesen:**
`HINTER_PROXY`, `OEFFENTLICHE_ADRESSE`, `SICHERUNG_DIR` und
`NEUER_SCHLUESSEL`. **Das ist die einzige Verhaltensänderung dieser Runde, und
sie steht im Kasten über dem Changelog-Eintrag.**

### Was ausdrücklich geblieben ist

**`lateStatement` und `lateGroup`.** Der Rückbau hätte 30 Deklarationen und
rund 60 Aufrufe in `server.js` gekostet und **null Zeilen** gebracht. Eine
Anweisung erst beim ersten Ruf vorzubereiten ist auch ohne ihren historischen
Grund richtig: sie hält den Start unabhängig vom Zustand der Datenbank. *Der
Kommentar darüber ist auf drei Zeilen gebracht und in zwei Blöcke geteilt — die
Absage an den naheliegenden Weg steht jetzt für sich.*

**`REQUIRED_COLUMNS` und der Kasten.** Einer Datenbank, der eine Spalte fehlt,
soll ein Satz gelten und kein Absturz. **Nur sein Text ist umgeschrieben:** er
verwies auf „die letzte Version mit den Migrationsschritten — die README nennt
sie", und die README nennt sie nach dieser Runde nicht mehr. Jetzt steht dort,
dass die Sicherung zurückzuspielen ist.

---

## 4. Text in den ausgelieferten Anleitungen

| Datei | was gefallen ist |
|---|---|
| `README.md` | der Absatz „WER VON EINER FASSUNG VOR 0.33.0 KOMMT, GEHT ZUERST ÜBER 0.32.1" |
| `README.md` | der Absatz „Vorausgesetzt wird eine Datenbank aus Version 0.8.0 oder neuer" |
| `README.md` | der Abschnitt „Die alten Namen in der `.env`" samt Tabelle und Inhaltsverzeichniszeile |
| `manual-de.md` | der Weg für eine abgewiesene Exportdatei über eine Fassung bis 0.32.1 |
| `.env.example` | der Block „DIE NAMEN HABEN SICH GEAENDERT" |

**In `README.md` und `manual-de.md` steht keine Versionsnummer mehr.** Der
Wächter in `test/source.js` hat sich dabei umgekehrt: er verlangte sechs
Nennungen und ihre Fundstellen im Wortlaut, jetzt verbietet er jede. **Fünf
Prüfungen sind dabei zu zwei geworden** — der Gegenstand, dass beide Dateien
wirklich gelesen werden, und die Verneinung.

**`CLAUDE.md` ist nachgezogen.** Die Hausordnung nannte die sechs Nummern als
Ausnahme von der Versionsnummernregel; der Satz stimmte nach dieser Runde nicht
mehr.

---

## 5. Zwei Fehler, kein Altbestand

**1. `.env.example` nannte ein Skript, das es nicht gibt.** Dort stand
`./schluessel.sh zeigen` und `./schluessel.sh wechseln`; die Datei heißt
`keytool.sh`, und die README nennt sie zwölfmal richtig. **Zwei Zeilen in einer
ausgelieferten Datei zeigten auf nichts.**

**2. Das Handbuch nannte die falsche Formatnummer.** `manual-de.md` trug „Das
Austauschformat trägt die Nummer 17", `server.js` trägt **18**. Die Nummer ist
mit 0.38.0 gehoben worden, das Papier nicht nachgezogen.

**Ein Wächter kommt dazu**, der beide Zahlen — die Formatnummer und die
älteste gelesene — im Handbuch gegen den Quelltext hält. Ohne ihn liefe
dasselbe beim nächsten Mal wieder auseinander.

---

## 6. Die Zahlen, gemessen am fertigen Stand

| | vorher | jetzt |
|---|---:|---:|
| Prüfungen | 7.276 | **7.256** |
| Gruppen | 388 | **388** |
| Rückbauten | 1.137 | **1.133** |
| Dateien mit Rückbauten | 41 | **40** |
| Dateien des Kommentarwächters | 37 | **36** |
| `benchFiles()` samt `counterproof.js` | 22 | **21** |
| Kommentarzeilen über alles | 16.721 | **16.679** |
| Codezeilen über alles | 67.110 | **66.732** |
| Protokollzeilen in den sechs Dateien | 52 | **49** |
| Versionsnummern in der Anleitung | 6 | **0** |

*Die Gruppenzahl bleibt: `test/reorder.js` brachte eine Gruppe mit und nahm
sie mit, `test/roundtrip.js` hat eine dazubekommen.*

*Die Prüfungszahl ist dieselbe wie vor 0.39.0 — das ist Zufall und keine
Rückkehr: zwanzig sind mit der Spaltenfolge gekommen und zwanzig mit dieser
Runde gegangen, aber es sind nicht dieselben.*

---

## 7. Entscheidungen, die der Auftrag offenließ

| Frage | Entscheidung | Grund |
|---|---|---|
| Wie viele Prüfungen wandern nach `test/roundtrip.js`? | vier statt der drei genannten | der Gegenstand steht vor der Verneinung: eine leere Spaltenliste hätte `data` nicht am Ende und machte die Verneinung trotzdem wahr |
| Was gibt `fromEnv` ohne den zweiten Parameter zurück? | `undefined` bei leerem Wert | die vier Aufrufstellen prüfen selbst auf leer; ein leerer String hätte als Angabe gegolten |
| Wird das Feld `kind` am Befund behalten? | nein | ohne `LEGACY_TABLES` hätte es nur noch den Wert `'column'` |
| Was wird aus der Prüfung auf die AUTH_RESET-Ansage? | sie kehrt sich um | der Start sagt dazu jetzt **kein Wort**, und genau das wird geprüft |

---

## 8. Der Prüflauf

**`npm test`: 7.256 von 7.256 Prüfungen bestanden, 388 Gruppen, 389 Sekunden.**

**Die vier Rückbauten, die diese Runde verändert hat, sind gefahren.**
