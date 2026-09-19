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

> **DIESE REGEL BINDET JEDE RUNDE, UND SIE GILT, BIS DER BETREIBER SIE SELBST
> ÄNDERT.** Keine Runde setzt sie aus — nicht mit Begründung, nicht für einen
> Altbestand, nicht „nur diesmal". Wer eine Zeile anfasst, bringt ihren
> Kommentar auf diese Regel, auch wenn die Runde von etwas anderem handelt.

### Die Länge

**Höchstens drei Zeilen je Block.** Gemessen am 19. September 2026 halten das
**96 Prozent** der 2.716 Blöcke in den ausgelieferten Modulen ein; zwei Drittel
sind einzeilig. Die Regel beschreibt also den Stand und verlangt nichts Neues.

**Und nie mehr Kommentar als Code darunter.** Fünf Zeilen über einer
zweizeiligen Funktion sind vier zu viel.

*Länger darf ein Block nur sein, wenn er eine Tafel gemessener Werte trägt —
Kontrastwerte, Pixelmaße, Laufzeiten. Eine Begründung ist keine Tafel.*

### Der Inhalt

**Der Kommentar nennt die Sache, nicht den Weg zu ihr.** Was abgewogen wurde,
gehört ins Änderungsprotokoll der Runde, nicht neben die Zeile.

| statt | besser |
|---|---|
| „Der Fehler-Handler steht ganz am Ende des Stapels; dort ist nicht mehr zu sehen, an welcher Route die Datei hereinkam, und eine zweite Tafel Route-zu-Grenze liefe beim nächsten Umbau auseinander." | „Die Grenzen reisen am Gesuch mit: der Fehler-Handler sieht die Route nicht mehr." |
| „Multer wirft seine Grenzen auf Englisch und mit seinen eigenen Wörtern: `LIMIT_UNEXPECTED_FILE` heißt „eine Datei zu viel" und stand bis hierher als „Unexpected field" am Bildschirm." | „multer wirft auf Englisch; die Zahl kommt aus `req.caps`." |

### Nicht

- **Keine Versionsnummer.** Die Regel steht unten und ist hart.
- **Kein Verweis auf ein Papier.** Die Regel steht unten und ist hart.
- **Stolpersteinnummern, Befundnummern, Fragetafelnummern** („F10"),
  Bauabschnittsnummern.
- **Das Erzählen einer Abwägung.**
- **Jargon und flapsige Bemerkungen.**
- **Die Wiederholung der Zeile darunter.**

### Doch

- Die **gemessene Zahl** — Kontrastwerte, Pixelmaße, Laufzeiten.
- Der **Grund für eine Reihenfolge**.
- Die **Absage an einen naheliegenden Weg**, damit ihn niemand wieder einbaut.

Jeweils in einem Satz und ohne zu erzählen, wer sie wann getroffen hat.

### Versionsnummern — hart

**In einer ausgelieferten Datei steht keine Versionsnummer.** Nicht im
Kommentar, nicht in einem String, nicht im Code.

Nicht: „seit 0.28.1", „bis 0.19.4 stand hier", „0.35.0 hat das eingeführt",
„der Block von 0.25.0".

**Ausgeliefert sind** die vierzehn JavaScript-Module, `public/style.css`,
`public/index.html`, `public/theme.js`, die drei Sprachdateien,
`.env.example`, `docker-compose.example.yml`, `Dockerfile`, `README.md` und
`manual-de.md`.

**Ausgenommen ist allein die eigene Versionsnummer** — `package.json` und was
der Server über sich selbst ausgibt.

*Eine Regel des Verhaltens wird ohne Nummer geschrieben:* „es wird nicht
migriert" *statt* „ab 0.33.0 wird nicht mehr migriert".

### Verweise auf Papiere — hart

**In einer ausgelieferten Datei steht kein Verweis auf ein Papier aus
`Doku/`.** Weder über den Pfad noch über den Namen.

Nicht: `Doku/Farbkonzept_0_23_0.md`, „Projektstand 5.3", „Konzept 4.6",
„Auftrag 0.32.0", „Befund 11", „Bauabschnitt 3", „Stolperstein 47",
„Änderungsprotokoll".

**Der Grund gilt für beide Formen: der Ordner geht nicht mit hinaus.** Ein
Verweis darauf zeigt im veröffentlichten Stand auf nichts — der Name ohne Pfad
genauso wie der Pfad.

*Wo die Herleitung gebraucht wird, steht sie im Änderungsprotokoll der Runde,
die sie getroffen hat.*

### Der Stand, gemessen am 19. September 2026

| | |
|---|---:|
| Versionsnummern in ausgelieferten Dateien | **778** |
| davon in Kommentaren | 726 |
| davon im Code | **0** |
| Verweise auf Papiere über den Namen | **188** |
| Verweise über den Pfad `Doku/` | **0** |

*Versionsnummern:* `public/app.js` 326, `server.js` 197, `public/style.css`
175, `db.js` 62, `README.md` 6, `public/index.html` 4, `auth.js` 4,
`manual-de.md` 2, `usertool.js` 1, `twofactor.js` 1.

*Papierverweise:* „Befund" 87, „Bauabschnitt" 70, „Konzept" 14, „Auftrag" 10,
„Projektstand" 4, „Änderungsprotokoll" 2, „Farbkonzept" 1.

> *Hier stand vorher 772. Die Zahl hat sich nicht geändert, der Umfang der
> Messung: gezählt werden jetzt auch `README.md` und `manual-de.md`. Zwei der
> 326 in `public/app.js` sind keine Versionen, sondern SVG-Pfaddaten
> (`-1.8.3l`) — der Wächter zählt sie mit.*

**Der Altbestand fällt mit 0.37.0. Bis dahin gilt: keine neue kommt dazu.**

Zwei Wächter halten das schon: „Keine Versionsnummer als Herkunft" mit einer
Latte je Datei, die nur fallen darf, und „Kein Verweis auf Doku/ geht mit
hinaus" über vierundzwanzig Dateien. **Für die Papierverweise über den Namen
gibt es noch keinen — er kommt mit 0.37.0.**

> **DIE EINE STELLE, AN DER DIE REGEL ETWAS KOSTET.** `REQUIRED_COLUMNS` in
> `db.js` nennt je fehlender Spalte die Fassung, deren Block sie gebracht
> hätte; der Wert reist in `findings.since` und steht im Warnkasten, den ein
> Betreiber mit unvollständiger Datenbank liest. **0.37.0 entscheidet, wie
> diese Meldung ohne Nummer heißt** — sie fällt nicht ersatzlos.

## 3. Ablauf

- Entwicklung auf dem Branch, der in der Aufgabe genannt ist.
- Vor jedem Push läuft `npm test` vollständig durch. Das Ergebnis wird genannt.
- Commit-Nachricht: erste Zeile sagt, was geändert wurde. Darunter der Grund,
  wenn er nicht offensichtlich ist.
- Einen Pull Request nur anlegen, wenn er verlangt wurde.

## 4. Versionen

### Das Schema darf sich ändern

**Klarstellung des Betreibers vom 19. September 2026: Kriterion ist nicht
veröffentlicht.** Es muss keine Verträglichkeit mit früheren Fassungen
hergestellt werden.

**Der Satz „ab 0.33.0 wird nicht migriert" ist keine Fessel für das Schema.**
Er sagt, dass keine Migrationsblöcke mehr geschrieben werden — nicht, dass
Tabellen und Spalten stehen bleiben müssen. **Gebaut wird, was die Sache
verlangt.**

### Es wird kein 1.0.0 geben

**Es wird kein 1.0.0 geben.** Was ursprünglich als 1.0 geplant war, ist mit
**0.33.0** erreicht. Die Zeile „1.0.0 — Die Zusage" steht noch im Fahrplan und
ist überholt.

Daraus folgt: **1.0.0 ist kein Stichtag und kein Argument.** Eine Runde wird
nicht damit begründet, dass sie „vor 1.0.0" liegen müsse.

## 5. Zahlen

Gemessene Zahlen in der Dokumentation werden am fertigen Stand gemessen, nicht
an einem Zwischenstand. Wird eine bereits veröffentlichte Zahl korrigiert, steht
daneben, warum sie sich geändert hat.
