# Regeln für Claude in diesem Projekt

## 1. Sprache

**Deutsch, sachlich, ohne Bilder.** Gilt für Chat-Antworten, Commit-Nachrichten,
Pull-Request-Beschreibungen, Code-Kommentare und Dokumentation.

### Nicht verwenden

- **Metaphern und Umschreibungen für technische Dinge.**
  Kein „Haus", „Papiere", „Griff", „Bruch", „Strang", „Auffangnetz",
  „Grundausstattung", „die Grenze ist fort".
- **Gehobene oder literarische Formulierungen.**
  Kein „Wer misst, misst zuletzt", kein „sie sperrt niemanden aus",
  kein „das System behauptet nie etwas Falsches".
- **Slang und Jargon.**
- **Fettdruck und Kursivschrift in jedem zweiten Satz.** Fettdruck nur für
  Ergebnisse und Zahlen, auf die es ankommt.
- **Erzählform.** Kein Spannungsbogen, keine Pointe, keine rhetorischen Fragen.
- **Erklärbär.** Nicht mehr erklären, als gebraucht wird. Kein Unterricht, kein
  Jargon, keine Nebenschauplätze. **Der Leser soll lesen, wissen, verstehen** —
  nicht belehrt werden.

### Anrede

**Wir duzen uns.** Der Betreiber duzt Claude, Claude duzt zurück — in
Chat-Antworten. Dokumentation und Commit-Nachrichten bleiben sachlich und
kommen ohne direkte Anrede aus.

### Stattdessen

- Kurze Sätze, ein Sachverhalt pro Satz.
- Normale Fachbegriffe: Repository, Branch, Commit, Pull Request, Datenbank,
  Tabelle, Spalte, Migration, Test, Testlauf, Dokumentation, Dialog.
- Zahlen, Dateinamen und Zeilennummern statt Andeutungen.
- Bei einem Fehler: was ist passiert, wo, und warum.

### Gegenüberstellung

| statt | besser |
|---|---|
| „Eine Vorlage gibt es im Haus nicht" | „Im Repository gibt es keine Vorlage" |
| „die Papiere nachziehen" | „CHANGELOG, README und `Doku/` aktualisieren" |
| „der Griff, der die Zahl hinschrieb" | „der Commit, der die Zahl eingetragen hat" |
| „die Grenze ist nicht verschoben, sie ist fort" | „Die Prüfung vor `db.exec(SCHEMA)` entfällt" |
| „achtzehn Blöcke sind gefallen" | „18 Migrationsblöcke wurden entfernt" |

### Ausnahme: bestehende Eigennamen

Diese Namen stehen in Dateinamen, Funktionsnamen und tausenden Testnamen. Sie
bleiben, bis sie in einer eigenen Runde umbenannt werden:

`Fahrplan`, `Projektstand`, `Änderungsprotokoll`, `Prüfstand` (`testbench.js`),
`Gegenprobe` und `Rückbau` (`counterproof.js`), `Stolperstein`.

**Neue Begriffe dieser Art werden nicht erfunden.**

### Wortfilter des Prüfstands

`testbench.js` prüft Kommentare und `Doku/*.md` auf abgelegte Wörter. Nicht
verwenden: Keks, Umstieg, Abbild, Sperrdatei, Doppelgänger, mehrteilig,
Zweigname, Rückschritt, Ereignisschleife, Zeichenkette, Abdruck, Faden.
Richtig sind die englischen Fachwörter: Cookie, Migration, Image, Lockfile,
Mock, Multipart, Branchname, Downgrade, Event Loop, String, Fingerprint,
Thread.

## 2. Kommentare

**Ein Kommentar sagt in Kurzform, was an der Stelle geschieht — und nur dort,
wo der Code es nicht selbst sagt.**

### Nicht

- **Stolpersteinnummern, Befundnummern, Fragetafelnummern** („F10"),
  Bauabschnittsnummern.
- **Rundennummern als Herkunftsangabe.** „Seit 0.28.1" sagt, wann etwas
  entstanden ist, und das hilft niemandem, der die Zeile lesen muss.
- **Verweise auf Dateien in `Doku/`.** Der Ordner geht nicht mit hinaus
  (`Doku/Veroeffentlichen.md`); ein solcher Verweis zeigt im veröffentlichten
  Stand auf nichts.
- **Jargon und flapsige Bemerkungen.**
- **Die Wiederholung der Zeile darunter.**

### Doch

- Die **gemessene Zahl** — Kontrastwerte, Pixelmaße, Laufzeiten.
- Der **Grund für eine Reihenfolge**.
- Die **Absage an einen naheliegenden Weg**, damit ihn niemand wieder einbaut.

Jeweils ohne zu erzählen, wer sie wann getroffen hat.

### Versionsnummern

**Eine Versionsnummer steht nur da, wo sie Verhalten bestimmt** —
„Austauschformat 17", „ab 0.33.0 wird nicht mehr migriert". Nie als Herkunft.

### Der Stand

Gemessen am 17. September 2026: **759 Versionsnummern** in den ausgelieferten
Dateien, 2.318 im Prüfstand; 87-mal „Befund", 15-mal „Stolperstein", 9-mal
„Auftrag". Die Regel gilt ab sofort für neue Kommentare. Der Altbestand ist
Punkt 43 im Sammelblatt.

## 3. Ablauf

- Entwicklung auf dem Branch, der in der Aufgabe genannt ist.
- Vor jedem Push läuft `npm test` vollständig durch. Das Ergebnis wird genannt.
- Commit-Nachricht: erste Zeile sagt, was geändert wurde. Darunter der Grund,
  wenn er nicht offensichtlich ist.
- Einen Pull Request nur anlegen, wenn er verlangt wurde.

## 4. Versionen

**Es wird kein 1.0.0 geben.** Was ursprünglich als 1.0 geplant war, ist mit
**0.33.0** erreicht. Die Zeile „1.0.0 — Die Zusage" steht noch im Fahrplan und
ist überholt.

Daraus folgt: **1.0.0 ist kein Stichtag und kein Argument.** Eine Runde wird
nicht damit begründet, dass sie „vor 1.0.0" liegen müsse.

## 5. Zahlen

Gemessene Zahlen in der Dokumentation werden am fertigen Stand gemessen, nicht
an einem Zwischenstand. Wird eine bereits veröffentlichte Zahl korrigiert, steht
daneben, warum sie sich geändert hat.
