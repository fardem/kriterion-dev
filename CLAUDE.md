# Regeln für Claude in diesem Projekt

## 1. Sprache

Deutsch, sachlich, kurz. Gilt für Chat, Commits, Pull Requests, Kommentare und
Dokumentation. Im Chat duzen wir uns. Dokumentation und Commits kommen ohne
Anrede aus.

- Ein Sachverhalt pro Satz.
- Normale Fachbegriffe: Repository, Branch, Commit, Datenbank, Tabelle, Spalte,
  Migration, Test, Dialog.
- Zahlen, Dateinamen und Zeilennummern statt Andeutungen.
- Bei einem Fehler: was ist passiert, wo, warum.
- Fettdruck nur für Ergebnisse und Zahlen, auf die es ankommt. Keine Sätze in
  Großbuchstaben.

Nicht:

- Metaphern für technische Dinge.
- Gehobene oder literarische Formulierungen, Erzählform, rhetorische Fragen.
- Slang.
- Erklärungen, nach denen niemand gefragt hat.

| statt | besser |
|---|---|
| „Eine Vorlage gibt es im Haus nicht" | „Im Repository gibt es keine Vorlage" |
| „die Papiere nachziehen" | „CHANGELOG, README und `Doku/` aktualisieren" |
| „Drei Wächter halten es fest" | „Drei Tests prüfen das" |
| „mit einer Latte je Datei" | „mit einem Grenzwert je Datei" |
| „die Grenze ist nicht verschoben, sie ist fort" | „Die Prüfung vor `db.exec(SCHEMA)` entfällt" |

### Begriffe

Für Dinge der Oberfläche gilt der Name aus `public/languages/de.json`, nicht der
aus dem Code. Beispiel: „Einstellungen", nicht „Systembereich".

Gängige englische IT-Begriffe bleiben englisch, auch in der Oberfläche: Update,
Backup, Migration, Account, Link, Cookie, Login. Sie werden nicht eingedeutscht.

Diese Eigennamen bleiben, bis sie in einer eigenen Runde umbenannt werden:
`Fahrplan`, `Projektstand`, `Änderungsprotokoll`, `Prüfstand` (`testbench.js`),
`Gegenprobe` und `Rückbau` (`counterproof.js`), `Stolperstein`. Neue Begriffe
dieser Art werden nicht erfunden.

`testbench.js` meldet diese Wörter in Kommentaren und `Doku/*.md`:

| nicht | sondern |
|---|---|
| Keks, Umstieg, Abbild, Sperrdatei | Cookie, Migration, Image, Lockfile |
| Doppelgänger, mehrteilig, Zweigname | Mock, Multipart, Branchname |
| Rückschritt, Ereignisschleife | Downgrade, Event Loop |
| Zeichenkette, Abdruck, Faden | String, Fingerprint, Thread |
| Auffangnetz | Rückfall (`db.js`), Fehler-Handler (`server.js`) |
| Grundausstattung | Vorgabewerte, die mitgelieferten Kriterien |

Wird ein alter Wortlaut zitiert, steht er in Rückstrichen auf einer Zeile. Der
Filter prüft keinen Code in Rückstrichen.

## 2. Was in einen Text gehört

Ein Text beschreibt die Stelle, an der er steht. Das gilt für Kommentare,
Konfigurationsdateien, README-Abschnitte und Texte der Oberfläche.

- Nur was der Leser an dieser Stelle braucht, um richtig zu handeln. Ein Satz,
  ohne den niemand einen Fehler macht, wird gestrichen.
- Was an anderer Stelle eingestellt oder getan wird, steht dort und nicht hier.
- Keine Inhalte aus der README kopieren. Höchstens ein Verweis auf den Abschnitt.
- Das Innenleben nur nennen, wenn der Leser es für eine Entscheidung braucht.
- Warnungen nur bei Datenverlust oder Folgen für die Sicherheit.

### Konfigurationsdateien

`.env.example`, `docker-compose.example.yml`, `Dockerfile`. Je Einstellung
höchstens vier Zeilen, meist reichen zwei. Sie nennen:

1. Name und Wirkung.
2. Was gilt, wenn der Wert leer ist oder fehlt.
3. Wann und wie man ihn ändert, falls das nicht offensichtlich ist.

```sh
# BEHIND_PROXY -- 1, wenn ein Reverse Proxy mit HTTPS davor steht.
# Leer: Kriterion ist direkt erreichbar (Port 3100).
# BEHIND_PROXY=
```

## 3. Kommentare

Gilt für jeden Kommentar in JavaScript, CSS, HTML, Shell, SQL und YAML, in
jeder Runde, bis der Betreiber die Regel ändert. Wird eine Zeile geändert,
wird ihr Kommentar mit angepasst oder gelöscht.

`test/selfcheck.js` setzt Obergrenzen für Kommentarzeilen je Datei, lange
Blöcke und Betonung in Großbuchstaben. Nach dem Kürzen senkt
`node tools/comments.js --write` sie auf den neuen Stand. Angehoben werden sie
nur mit Begründung im Commit.

### Wann ein Kommentar steht

Nur, wenn der Code eine Frage offenlässt:

- warum diese Lösung und nicht die naheliegende
- eine Bedingung von außen: Browserfehler, Grenze von SQLite, Verhalten einer
  Bibliothek
- Einheit oder Herkunft einer Zahl
- eine Reihenfolge, die nicht vertauscht werden darf
- eine Stelle, die zusammen mit einer anderen geändert werden muss, mit
  Datei- und Bezeichnername

Sagt ein besserer Name oder eine Konstante dasselbe, wird umbenannt statt
kommentiert.

### Form

- Ein Satz, höchstens drei Zeilen. Nie mehr Kommentar als Code darunter.
- Präsens, beschreibt den jetzigen Stand.
- Stichwort- und Infinitivstil sind erlaubt: „Neue Spalten auch hier eintragen."
- Keine Betonung durch Großbuchstaben. Groß bleiben nur Abkürzungen und
  SQL-Schlüsselwörter.
- Keine Überschrift im Kommentar. Abschnittsmarken in langen Dateien stehen in
  einer Zeile: `/* ---- Filter ---- */`.
- Keine Metaphern, keine Sätze mit „Wer …, der …", keine Anrede.
- Länger darf nur eine Tabelle gemessener Werte sein: eine Zeile, was gemessen
  wurde, dann die Werte, kein Fließtext darum.

### Was nicht in einen Kommentar gehört

Das steht in Git oder im Änderungsprotokoll:

- was vorher dort stand, was „berichtigt" wurde, wer was entschieden hat
- die Abwägung
- Versionsnummern, Befund-, Stolperstein- und Bauabschnittsnummern
- Verweise auf `Doku/`

Außerdem nicht: die Wiederholung der Zeile darunter und die Wiedergabe dessen,
was eine andere Datei tut. Dort genügen Datei- und Bezeichnername.

### Beispiele aus dem Repository

| statt | besser |
|---|---|
| `server.js`: „UEBER EINER UNVOLLSTAENDIGEN DATENBANK WIRD BEIM START NICHTS GESCHRIEBEN. Der Kasten in db.js sagt beides zu: die Instanz startet, und nichts wird geaendert. Was hier schreibt, koennte ueber einer fehlenden Spalte weder das eine noch das andere halten." | „Bei fehlenden Spalten schreibt der Start nichts in die Datenbank." |
| `public/app.js`: „GEFRAGT WIRD DER BESTAND UND NICHT DIE GEZEIGTE MENGE: eine Suche ohne Treffer ist kein leerer Bestand, und "Noch nichts erfasst" waere dort die falsche Auskunft." | „`state.inventory` statt `list`: eine Suche ohne Treffer ist kein leerer Bestand." |
| `public/app.js`: „Der Deckel wird GESAGT und nicht durch einen fehlenden Knopf angedeutet: ein Knopf, der einfach nicht mehr da ist, sieht aus wie ein Fehler." | „Bei `VIEWS_CAP` einen Hinweis zeigen; ein fehlender Knopf sähe aus wie ein Fehler." |
| `public/app.js`: „---- DER RUECKSETZER FUER DIE FILTERLEISTE ---- ER STAND BIS HIERHER NIRGENDS." | „---- Filter zurücksetzen ----" |
| `db.js`: „Wer in der Uebersicht eine Spalte ergaenzt, ergaenzt sie AUCH HIER -- eine Pruefung haelt die Liste und PHOTO_SPALTEN gegeneinander." | „Muss alle Spalten aus `PHOTO_COLUMNS` in `server.js` enthalten, sonst liest SQLite die ganze Zeile." |

Gemessene Werte, kurz:

```js
/* kind steht hinter drei Blobs; ohne Index liest jede Abfrage die ganze Zeile.
   312 MB, 400 Zeilen: kind gruppiert 1338,8 ms, mit Index 0,1 ms.
   Nur `kind IS ?` nutzt den Index, `kind != ?` nicht. */
```

### Keine Versionsnummern, keine Verweise auf `Doku/`

In ausgelieferten Dateien steht keine Versionsnummer und kein Verweis auf eine
Datei aus `Doku/`, weder mit Pfad noch mit Namen („Projektstand 5.3",
„Befund 11"). `Doku/` wird nicht veröffentlicht. Verhalten wird ohne Nummer
beschrieben: „es wird nicht migriert", nicht „ab 0.33.0 wird nicht migriert".

Ausgeliefert sind: die vierzehn JavaScript-Module, `public/style.css`,
`public/index.html`, `public/theme.js`, die drei Sprachdateien, `.env.example`,
`docker-compose.example.yml`, `Dockerfile`, `README.md`, `manual-de.md`.

Ausnahmen:

- die eigene Version in `package.json` und in der Ausgabe des Servers
- `1.1.1970` in `twofactor.js`, die SVG-Pfade `-1.8.3l` und `1.8.3H9` in
  `public/app.js`, `keepachangelog.com/de/1.1.0/` und `14.03.2026` in der
  Anleitung (keine Versionsangaben)
- `0.19.2` in `public/app.js` und `0.12.3` in `public/style.css` (vom
  Prüfstand verlangt)

Tests in `test/source.js` prüfen beide Regeln.

## 4. Ablauf

- Entwicklung auf dem Branch, der in der Aufgabe genannt ist.
- Vor jedem Push läuft `npm test` vollständig. Das Ergebnis wird genannt.
- Commit: erste Zeile sagt, was geändert wurde, höchstens 72 Zeichen. Nach
  einer Leerzeile der Grund, wenn er nicht offensichtlich ist.
- Pull Request nur, wenn er verlangt wurde.

## 5. Versionen

- Kriterion ist nicht veröffentlicht. Verträglichkeit mit früheren Fassungen
  ist nicht nötig. Das Schema darf sich ändern; es werden nur keine
  Migrationsblöcke mehr geschrieben.
- Es gibt kein 1.0.0. Das Ziel von 1.0 ist mit 0.33.0 erreicht. Die Zeile
  „1.0.0 — Die Zusage" im Fahrplan ist überholt. „Vor 1.0.0" ist kein Argument.

## 6. Zahlen

Gemessen wird am fertigen Stand, nicht an einem Zwischenstand. Wird eine
veröffentlichte Zahl korrigiert, steht daneben, warum sie sich geändert hat.
