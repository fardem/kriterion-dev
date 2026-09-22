# Auftrag 0.39.1 — „Was für vergangene Prozesse gebaut wurde, geht heraus"

**Erteilt am 22. September 2026**, nach dem Umschichten des Bestands auf die
Spaltenfolge der 0.39.0. Gebaut wird auf dem Branch, der in der Aufgabe genannt
ist. **Dieser Auftrag beantwortet jede Frage, die beim Bauen aufkommen kann. Es
wird nicht nachgefragt.**

---

## 1. Warum

**Vorgabe des Betreibers: 0.39.0 ist die einzige Fassung, die es öffentlich je
geben wird.** Vor ihr liegt keine veröffentlichte Version, aus der jemand einen
Bestand, eine `.env` oder eine Exportdatei mitbrächte. Jeder Code und jeder
Text, der genau diesen Fall behandelt, zeigt im öffentlichen Stand auf nichts.

**Die eine Datenbank, die die alte Spaltenfolge trug, ist umgeschichtet.** Der
Betreiber hat `tools/reorder.js` am 22. September 2026 gefahren; der
Fingerprint der laufenden Instanz ist `2ba1c469`.

---

## 2. Die Entscheidungen — alle schon getroffen

| Frage | Antwort |
|---|---|
| **Versionsnummer** | **0.39.1**, PATCH, Schema: nein, Format: nein |
| **Geht `tools/reorder.js` heraus?** | **Ja.** Es hat seinen einen Lauf hinter sich |
| **Und `tools/rename.js`?** | **Ja.** Gemessen am 22. September 2026: **null** der sieben Eigennamen steht noch als Bezeichner im Code; die 318 Vorkommen liegen in Kommentaren (223) und Prüfnamen (95). Der Zweck des Werkzeugs — Bezeichner anfassen, Texte nicht — hat keinen Gegenstand mehr |
| **Und `gestalt.js`, `scan-words.js`, `rename-test.js`?** | **Ja.** Kein Modul, kein Prüfstand und keine Workflow-Datei lädt sie |
| **Bleibt `tools/segments.js`?** | **Ja.** `test/frame.js`, `test/source.js`, `tools/comments.js` und `tools/gleichlaut.js` laden es |
| **Die fünf Vergleichsstände unter `tools/*.json`?** | **Bleiben.** Sie sind keine toten Dateien, sondern eingefrorene Vergleichspunkte, an denen Prüfungen hängen |
| **`lateStatement` und `lateGroup`?** | **Bleiben.** Der Rückbau kostet 30 Deklarationen und rund 60 Aufrufe in `server.js` und bringt null Zeilen. Eine späte Vorbereitung ist auch ohne den historischen Grund richtig; **der Kommentar darüber wird auf den heutigen Grund gebracht** |
| **`REQUIRED_COLUMNS` und der Kasten?** | **Bleiben.** Eine Datenbank, der eine Spalte fehlt, bekommt weiterhin einen Kasten statt eines Absturzes |
| **Aber sein Text?** | **Wird umgeschrieben.** Er verweist heute auf „die letzte Version mit den Migrationsschritten — die README nennt sie". Die README nennt sie nach dieser Runde nicht mehr |
| **`LEGACY_TABLES`?** | **Entfällt.** Die sechs deutschen Tabellennamen kann nur eine Datenbank tragen, die vor 0.32.1 angelegt und nie darüber gelaufen ist |
| **Die deutschen Umgebungsnamen?** | **Entfallen.** `HINTER_PROXY`, `OEFFENTLICHE_ADRESSE`, `SICHERUNG_DIR` und `NEUER_SCHLUESSEL` werden nicht mehr gelesen |
| **Bleibt `fromEnv`?** | **Ja**, ohne den zweiten Parameter und ohne die Warnzeile. Sie trimmt und prüft auf leer, und das tun vier Aufrufstellen |
| **Die drei `AUTH_*`-Warnungen?** | **Entfallen.** Sie sprechen zu einer `.env`, die es öffentlich nicht gibt |
| **`EXCHANGE_FORMAT_MIN = 14`?** | **Bleibt.** Der Import hat keinen versionsabhängigen Zweig; die Zahl ist eine Schranke und kostet keine Zeile. **Der Text daneben wird umgeschrieben**: er nennt heute einen Weg über eine Fassung, die es öffentlich nie gab |
| **Wohin mit den drei Prüfungen über die Spaltenfolge?** | Nach `test/roundtrip.js`, in eine eigene Gruppe. `test/reorder.js` entfällt ganz — ein eigenes Modul für drei Prüfungen kostet einen Prozessstart und trägt nichts |
| **Wird `CLAUDE.md` angefasst?** | **Ja, und das ist keine Wahl.** Die Hausordnung nennt sechs Nummern als Ausnahme von der Versionsnummernregel; nach dieser Runde steht keine mehr in der Anleitung |

---

## 3. Die Bauabschnitte

### BA 1 — Die fünf Werkzeuge

**Entfernt werden, zusammen 921 Zeilen:**

| Datei | Zeilen |
|---|---:|
| `tools/rename.js` | 276 |
| `tools/reorder.js` | 278 |
| `tools/gestalt.js` | 203 |
| `tools/rename-test.js` | 96 |
| `tools/scan-words.js` | 68 |

**Was mitgeht:**

* **`db.js`** — der Export von `SCHEMA`. Nur `tools/reorder.js` hat ihn gelesen.
* **`testbench.js`** — der Eintrag `'reorder'` in `MODULE`.
* **`test/reorder.js`** — entfällt. **Die drei Prüfungen über die Spaltenfolge
  wandern nach `test/roundtrip.js`**, in eine Gruppe „Die Spaltenfolge: `data`
  steht am Ende": der `SCHEMA`-String hält sie, `trash_bytes` ebenso, und eine
  frisch angelegte Datenbank trägt sie auch.
* **`counterproof.js`** — die Rückbauten **1200, 1201 und 1202**. **Rückbau
  1199 bleibt** und zeigt danach auf die neue Gruppe.
* **`README.md`** — der Abschnitt „Die Spaltenfolge einer bestehenden
  Datenbank" und seine Zeile im Inhaltsverzeichnis.

### BA 2 — Code für Bestände, die es öffentlich nicht gibt

**`db.js`:**

* **`LEGACY_TABLES` entfällt** — die Liste und die Schleife darüber in
  `incompleteDatabase()`. Ein Befund trägt danach nur noch eine Spalte; das
  Feld `kind` entfällt, weil es nur noch einen Wert hätte.
* **Der Text von `warnIncompleteDatabase()` wird umgeschrieben.** Er nennt
  keine ältere Version mehr. Was zu tun ist: die Sicherung zurückspielen.
* **Der Kommentar über `lateStatement` wird auf den heutigen Grund gebracht** —
  eine Anweisung erst beim ersten Ruf vorzubereiten hält den Start unabhängig
  vom Zustand der Datenbank. Kein Verweis mehr auf entfernte Migrationsschritte.

**`auth.js`:**

* **Die drei Warnblöcke zu `AUTH_RESET`, `AUTH_USER` und `AUTH_PASSWORD`
  entfallen** — 16 Zeilen.
* **`fromEnv` verliert den zweiten Parameter und die Warnzeile.** Vier
  Aufrufstellen ziehen nach: `auth.js` zweimal (`BEHIND_PROXY`,
  `PUBLIC_ADDRESS`), `server.js` einmal (`BACKUP_DIR`), `keytool.js` einmal
  (`NEW_KEY`).

**`counterproof.js`:** Rückbau **1038** entfällt mit `LEGACY_TABLES`.

**`test/roundtrip.js`:** die Prüfung „Eine Tabelle unter ihrem alten Namen wird
mit BEIDEN Namen benannt" entfällt mit.

### BA 3 — Text in den ausgelieferten Anleitungen

**`README.md`:**

* Der Absatz im Kasten: „WER VON EINER FASSUNG VOR 0.33.0 KOMMT, GEHT ZUERST
  ÜBER 0.32.1" samt der beiden Sätze darunter.
* Der Absatz „Vorausgesetzt wird eine Datenbank aus Version 0.8.0 oder neuer".
* Der Abschnitt „Die alten Namen in der `.env`" samt Tabelle und der Zeile im
  Inhaltsverzeichnis.

**`manual-de.md`:** der Satz „wer eine solche hat, spielt sie in eine Fassung
bis 0.32.1 ein und exportiert sie dort neu". **Ersatz: die Datei wird
abgewiesen, und der Bestand bleibt unberührt.**

**`.env.example`:** der Block „DIE NAMEN HABEN SICH GEAENDERT" samt der drei
Zeilen darunter.

**`test/source.js`:** `README_NUMBERS` wird leer. **Der Wächter kehrt sich um
und ist danach schärfer:** in `README.md` und `manual-de.md` steht **keine
Versionsnummer mehr**. Die vier Prüfungen auf die einzelnen Nummern entfallen,
die Prüfung „keine andere Nummer steht mehr darin" bleibt und trägt allein.

**`CLAUDE.md`:** der Abschnitt „UND SECHS NUMMERN IN DER ANLEITUNG MÜSSEN
BLEIBEN" entfällt, und die Tafel „Der Stand, gemessen am gebauten Stand 0.37.0"
wird am fertigen Stand nachgemessen.

### BA 4 — Zwei Fehler, kein Altbestand

**1. `.env.example`:128–129 nennt ein Skript, das es nicht gibt.**

```
#     ./schluessel.sh zeigen      # Lage ansehen, aendert nichts
#     ./schluessel.sh wechseln    # anhalten, sichern, wechseln, starten
```

Die Datei heißt `keytool.sh`. Die README nennt sie zwölfmal richtig.

**2. `manual-de.md`:1032 nennt die falsche Formatnummer.** Dort steht „Das
Austauschformat trägt die Nummer 17", `server.js`:4474 trägt **18**. Die Zahl
ist mit 0.38.0 gehoben worden, das Handbuch nicht nachgezogen.

**Ein Wächter kommt dazu**, der die Zahl im Handbuch gegen `EXCHANGE_FORMAT`
hält — dieselbe Bauform wie der Wächter, der `EXCHANGE_FORMAT` im Server prüft.
Ohne ihn läuft dasselbe beim nächsten Mal wieder auseinander.

### BA 5 — Die Papiere und die Zahlen

* **`Doku/Aenderungsprotokoll_0.39.1.md`** — was entfernt wurde, mit den
  gemessenen Zahlen und den beiden Fehlern.
* **`CHANGELOG.md`** — ein Eintrag `## [0.39.1]`, Form wie die vorigen, mit
  einem **Kasten darüber**: wer die deutschen Namen `HINTER_PROXY`,
  `OEFFENTLICHE_ADRESSE`, `SICHERUNG_DIR` oder `NEUER_SCHLUESSEL` in seiner
  `.env` stehen hat, zieht sie **vor** dem Einspielen nach — sie werden danach
  nicht mehr gelesen, und die Einstellung fiele still auf ihren Vorgabewert.
* **`Doku/Fahrplan.md`** — eine Tafelzeile `0.39.1` und ein Abschnitt.
* **`package.json`** auf `0.39.1`, `package-lock.json` mit.
* **Die festen Zahlen nachziehen:** die Zahl der Prüfungen und der Rückbauten
  in `test/selfcheck.js`, die Zahl der Dateien des Kommentarwächters, die
  Dateizahl von `benchFiles()` samt `counterproof.js`, die Dateizahl des
  Wächters über Rückbauten, die Kommentarzeilen je Datei und die Summe. *Sie
  werden am **fertigen** Stand gemessen, nicht zwischendurch.*
* **Der Fingerprint** mit `node tools/publish.js` am sauberen Arbeitsbaum, dann
  in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 4. Was ausdrücklich nicht dazugehört

| | warum |
|---|---|
| **Der Rückbau von `lateStatement` und `lateGroup`** | 30 Deklarationen und rund 60 Aufrufe in `server.js` für null Zeilen Ertrag. Die Bauform ist auch ohne ihren historischen Grund richtig |
| **Der Rückbau von `REQUIRED_COLUMNS` und dem Kasten** | Eine Datenbank, der eine Spalte fehlt, soll einen Satz bekommen und keinen Absturz. Nur der Verweis auf eine ältere Version fällt |
| **Die fünf Vergleichsstände unter `tools/*.json`** | An ihnen hängen Prüfungen. Wer sie entfernt, nimmt die Prüfungen mit |
| **`EXCHANGE_FORMAT_MIN` auf 18 heben** | Der Import hat keinen versionsabhängigen Zweig. Es spart keine Zeile und sperrt nur die eigenen alten Exportdateien aus |
| **Das Entfernen der Historie** | Alle fünf Werkzeuge bleiben über `git show` erreichbar. Nur der öffentliche Stand trägt sie nicht |

---

## 5. Die Auflagen

1. **`npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.**
2. **Die vier Rückbauten, die nach dieser Runde neu oder verändert sind, werden
   gefahren**, und das Ergebnis steht im Änderungsprotokoll.
3. **Kein Verhalten der Anwendung ändert sich**, mit einer benannten Ausnahme:
   die vier deutschen Umgebungsnamen werden nicht mehr gelesen. **Sie steht im
   Kasten über dem Changelog-Eintrag.**
4. **Die Kommentarregel bindet auch hier:** höchstens drei Zeilen je Block, nie
   mehr Kommentar als Code, keine Versionsnummer, kein Verweis auf ein Papier.
5. **Gemessene Zahlen werden am fertigen Stand gemessen.** Wird eine
   veröffentlichte Zahl korrigiert, steht daneben, warum.
6. **Kommt beim Bauen eine Frage auf, die hier nicht beantwortet ist**, wird
   der einfachere Weg gewählt, der kein Verhalten ändert — und die Entscheidung
   steht im Änderungsprotokoll.
