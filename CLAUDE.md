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
**96 Prozent** der **2.735** Blöcke in den ausgelieferten Modulen ein; zwei
Drittel sind einzeilig. Die Regel beschreibt also den Stand und verlangt nichts
Neues.

*Gezählt wird jeder Kommentarteil einzeln: eine Folge von sechs `//`-Zeilen
sind sechs einzeilige Blöcke.* **Faßt man sie zu einem zusammen — so, wie ein
Leser sie sieht —, sind es 2.177 Blöcke und 94 Prozent.** *Hier stand vorher
2.716; die Zahl ist auf dem Stand 0.36.0 nachgemessen.*

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
| Treffer des Nummernmusters in ausgelieferten Dateien | **778** |
| davon in Kommentaren | 726 |
| davon in Strings | **44** |
| davon in `README.md` und `manual-de.md` | 8 |
| davon im Code | **0** |
| davon überhaupt keine Fassungsnummer | **15** |
| **echte Fassungsnummern** | **763** |
| Verweise auf Papiere über den Namen | **187** |
| Abkürzungen `BA <Zahl>`, `(F<Zahl>)`, `Punkt <Zahl>` | **94** |
| Verweise über den Pfad `Doku/` | **0** |

*Versionsnummern:* `public/app.js` 326, `server.js` 197, `public/style.css`
175, `db.js` 62, `README.md` 6, `public/index.html` 4, `auth.js` 4,
`manual-de.md` 2, `usertool.js` 1, `twofactor.js` 1.

*Papierverweise:* „Befund" **86**, „Bauabschnitt" 70, „Konzept" 14,
„Auftrag" 10, „Projektstand" 4, „Änderungsprotokoll" 2, „Farbkonzept" 1.
*Hier stand vorher 87 und 188; mit 0.36.0 ist einer in `public/app.js`
weggefallen.*

*Abkürzungen:* `(F<Zahl>)` 52, `BA <Zahl>` 39, `Punkt <Zahl>` 3. **Sie sind
dieselbe Verweisform und standen hier bis zum 19. September 2026 nicht.**

> *Hier stand vorher 772. Die Zahl hat sich nicht geändert, der Umfang der
> Messung: gezählt werden jetzt auch `README.md` und `manual-de.md`.*
>
> **FÜNFZEHN DER 778 SIND ÜBERHAUPT KEINE FASSUNGSNUMMERN**, und das Muster
> `\d+\.\d+\.\d+` kann sie nicht unterscheiden: **zehn Daten**
> *(`public/style.css` sieben, `public/app.js` zwei, `twofactor.js`
> `1.1.1970`)*, **zwei SVG-Pfaddaten** in `public/app.js`:255 — *eines lautet
> `-1.8.3l`, das andere `1.8.3H9`* —, das `1.0.0` im Kommentar über
> `const VERSION` in `server.js`:12 sowie in der Anleitung die Adresse
> `keepachangelog.com/de/1.1.0/` und das Beispieldatum `14.03.2026`.
>
> **UND 44 STEHEN IN STRINGS, NICHT IN KOMMENTAREN.** *Die Regel verbietet sie
> dort genauso.* 20 in den SQL-Kommentaren des `SCHEMA`-Strings von `db.js`,
> 18 in `REQUIRED_COLUMNS`, dazu `LAST_MIGRATING_VERSION`, das `since` der
> `LEGACY_TABLES`, ein Satz im englischen Warnkasten und die Laufzeitmeldung
> in `auth.js`:430.

**Der Altbestand fällt mit 0.37.0. Bis dahin gilt: keine neue kommt dazu.**

Zwei Wächter halten das schon: „Keine Versionsnummer als Herkunft" mit einer
Latte je Datei, die nur fallen darf, und „Kein Verweis auf Doku/ geht mit
hinaus" über vierundzwanzig Dateien. **Für die Papierverweise über den Namen
gibt es noch keinen — er kommt mit 0.37.0.**

> **DIE STELLEN, AN DENEN DIE REGEL ETWAS KOSTET — ES SIND FÜNF UND NICHT
> EINE.** `REQUIRED_COLUMNS` in `db.js` nennt in **18 Zeilen** je fehlender
> Spalte die Fassung, deren Block sie gebracht hätte; der Wert reist in
> `findings.since` und steht im Warnkasten, den ein Betreiber mit
> unvollständiger Datenbank liest. **Dieselbe Mechanik trägt drei weitere:**
> `LAST_MIGRATING_VERSION = '0.32.1'`, das `since` der `LEGACY_TABLES` und ein
> Satz im englischen Warnkasten. **Die fünfte steht in `auth.js`:430** und geht
> zur Laufzeit hinaus. **0.37.0 entscheidet, wie diese Meldungen ohne Nummer
> heißen** — sie fallen nicht ersatzlos.

> **UND SECHS NUMMERN IN DER ANLEITUNG MÜSSEN BLEIBEN.**
> `test/source.js`:915–923 verlangt, dass `0.33.0`, `0.32.1` und `0.8.0` in
> `README.md` und `manual-de.md` stehen — *sie bestimmen eine Handlung: den
> Zwischenschritt beim Umzug einer alten Datenbank und die älteste übernommene
> Fassung.* **Eine Nummer, die eine Handlung bestimmt, ist keine
> Herkunftsangabe.** *Zwei weitere verlangt der Prüfstand im Kommentar:*
> `0.19.2` in `public/app.js`, `0.12.3` in `public/style.css`.

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
