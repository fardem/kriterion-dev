# Auftrag 0.39.0 — „Die Spaltenfolge: `data` ans Ende"

**Erteilt am 22. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. **Dieser Auftrag beantwortet jede Frage, die beim Bauen
aufkommen kann. Es wird nicht nachgefragt.**

---

## 1. Warum

SQLite liest eine Zeile von vorn. Was hinter einem großen BLOB steht, ist nur
über die Overflow-Kette erreichbar — jede Seite muss gelesen werden, um den
Zeiger auf die nächste zu finden.

**In drei Tabellen steht `data` vor allem Übrigen:**

| Tabelle | heute hinter `data` |
|---|---|
| `photos` (`db.js`:110) | `thumb`, `medium`, `kind`, `duration`, `focus_x`, `focus_y`, `sort_order`, `created_at`, `zoom` |
| `comment_images` (`db.js`:241) | `thumb`, `sort_order`, `created_at` |
| `attachments` (`db.js`:292) | `sort_order`, `created_at`, `user_id` |

*`trash_bytes` (`db.js`:463) führt `data` schon als letzte Spalte und bleibt
unangetastet.*

### Was es kostet — gemessen

**Am Bestand des Betreibers, 22. September 2026** *(1997 Zeilen, 407,0 MB
Originale, 42,5 MB Kacheln, `tools/photoscan.js`)*:

| Größe des Originals | Zeilen | Kachel holen |
|---|---:|---:|
| bis 100 kB | 974 | 0,13 ms |
| bis 1 MB | 987 | 0,19 ms |
| über 1 MB | 36 | **3,41 ms** |

**An einer gestellten Lage von 1000 Zeilen mit derselben Verteilung:**

| | je Kachel |
|---|---:|
| heute — `thumb` hinter `data` | 0,095 ms |
| **alle Spalten vor `data`** | **0,011 ms** |
| Nebentabelle `photo_derivatives` | 0,009 ms |

**Die Spaltenfolge bringt 95 Prozent dessen, was eine Nebentabelle brächte** —
ohne zweiten Schreibweg, ohne zweiten Leseweg, ohne Eingriff in Export, Import
und Papierkorb, ohne Neurechnung. **Am Code ändert sich keine Zeile.**

### Und was sie nicht bringt

**6,35 Millisekunden je Übersichtsseite mit dreißig Kacheln.** Das fällt neben
dem Aufbau der Seite nicht auf, und es wächst nicht mit dem Bestand: die Zeit
je Kachel hängt an der Größe des Originals davor, nicht an der Zeilenzahl.

**Gebaut wird trotzdem** — Vorgabe des Betreibers vom 22. September 2026. *Der
Grund ist nicht die Laufzeit, sondern die Folge selbst: sie ist falsch herum,
und sie zu korrigieren macht den Code an keiner Stelle komplizierter.*

---

## 2. Die Entscheidungen — alle schon getroffen

| Frage | Antwort |
|---|---|
| **Was wandert?** | `data` ans **Ende** jeder der drei Tabellen. Nicht nur `thumb` und `medium` nach vorn: dann stünden `zoom`, `focus_x`, `focus_y`, `created_at` und `sort_order` weiter dahinter, ohne dass es etwas spart |
| **Welche Tabellen?** | `photos`, `comment_images`, `attachments`. **Alle drei in einer Runde** — derselbe Handgriff, ein Werkzeug, eine Umschichtung |
| **`trash_bytes`?** | **Nein.** Dort steht `data` schon am Ende |
| **Wird automatisch migriert?** | **Nein.** Kein Migrationsblock, kein Eingriff beim Start. Wer nichts tut, läuft weiter wie heute — nur langsamer |
| **Wie kommt eine bestehende Datenbank auf die neue Folge?** | Über `tools/reorder.js`, das der Betreiber einmal aufruft |
| **Wo liegt das Werkzeug?** | `tools/reorder.js`. **Kein fünfzehntes Kernmodul** |
| **Darf der Server dabei laufen?** | **Nein.** Das Werkzeug prüft es über `BEGIN EXCLUSIVE` und bricht ab, wenn ein anderer Prozess die Datei hält |
| **Sicherung davor?** | Wird **angesagt, nicht erzwungen** — dieselbe Form wie beim Schlüsselwechsel. Die Umschichtung läuft in einer Transaktion; ein Abbruch stellt den alten Stand her |
| **`VACUUM` danach?** | **Ja**, im selben Aufruf. Ohne ihn bleibt die Datei doppelt so groß |
| **Wieviel Platz braucht die Datenbank danach?** | **Kein Byte mehr.** Gemessen: 370,5 MB vorher, 370,5 MB nach dem `VACUUM`. Die Folge ändert die Anordnung im Record, nicht die Datenmenge |
| **Wieviel Platz muss währenddessen frei sein?** | **Das Dreifache der Datenbankgröße.** Gemessen wächst die Datei beim Umschichten auf das Doppelte (370,5 → 741,1 MB), und `VACUUM` legt danach noch einmal eine Datei in voller Größe an. Bricht ab, wenn weniger da ist |
| **Bleiben die Indexe?** | **Ja, alle, wortgleich.** Das Werkzeug liest ihre Definitionen vor dem Umschichten aus `sqlite_master` und legt sie danach wieder an |
| **Fällt `length(thumb)` aus `idx_photos_tile`?** | **Nein.** Gemessen ist, dass der Ausdruck nichts kostet — ihn zu entfernen wäre eine zweite Änderung und gehört nicht hierher |
| **`REQUIRED_COLUMNS`?** | **Unverändert.** Sie prüft Namen, nicht Folge; eine alte Datenbank läuft weiter |
| **Hinweis in der Oberfläche, dass umgeschichtet werden kann?** | **Nein.** Eine Warnung für eine Optimierung wäre eine Nötigung. Die README nennt das Werkzeug, `reorder.js zeigen` sagt den Stand |
| **Ändert sich eine Abfrage im Server?** | **Keine.** Die Spaltenfolge ist dem SQL gleichgültig; `SELECT *` steht an keiner Stelle, die davon abhinge |
| **Ändert sich das Austauschformat?** | **Nein.** Export und Import nennen Spalten beim Namen |
| **Versionsnummer** | **0.39.0**, MINOR, **Schema: ja**, Format: nein |

---

## 3. Die Bauabschnitte

### BA 1 — Das Schema

In `db.js` wandert `data` in den drei Tabellen ans Ende. **Die Kommentare an
den Spalten wandern mit** und werden dabei auf die Kommentarregel gebracht,
soweit sie es nicht schon sind.

*Der Kommentar an `zoom` sagt heute, die Spalte stehe ganz unten, weil
`ADD COLUMN` immer hinten anhängt. **Dieser Satz wird gestrichen**: die Spalte
steht danach nicht mehr ganz unten, und der Grund gilt nicht mehr — es wird
nicht mehr migriert.*

**`photos` neu:** `id`, `item_id`, `mime_type`, `thumb`, `medium`, `kind`,
`duration`, `focus_x`, `focus_y`, `sort_order`, `created_at`, `zoom`, `data`.

**`comment_images` neu:** `id`, `comment_id`, `filename`, `thumb`,
`sort_order`, `created_at`, `data`.

**`attachments` neu:** `id`, `item_id`, `filename`, `mime_type`, `size`,
`sort_order`, `created_at`, `user_id`, `data`.

### BA 2 — `tools/reorder.js`

Zwei Befehle, in der Form von `keytool.js`:

```
node tools/reorder.js zeigen
    Sagt je Tabelle, ob data schon am Ende steht, wie viele Zeilen und
    wie viele Bytes darin liegen, wie viel Platz frei ist und wie lange
    es dauern würde. Ändert nichts.

node tools/reorder.js umschichten [--ja]
    Schichtet die drei Tabellen um. --ja überspringt die Rückfrage.
```

**Der Ablauf je Tabelle**, nach der Vorschrift von SQLite für Änderungen, die
`ALTER TABLE` nicht kann:

1. Die Definitionen aller Indexe und Trigger der Tabelle aus `sqlite_master`
   lesen — **wortgleich**, damit nichts verloren geht, was eine spätere Runde
   angelegt hat.
2. `PRAGMA foreign_keys = OFF`
3. `BEGIN EXCLUSIVE` — **das ist zugleich die Prüfung, ob ein Server läuft.**
   Bei `SQLITE_BUSY` wird abgebrochen, mit dem Satz, dass die Instanz stehen
   muss.
4. Die neue Tabelle unter einem anderen Namen anlegen, mit der neuen Folge.
5. `INSERT INTO neu (<Spalten>) SELECT <Spalten> FROM alt` — **Spalten beim
   Namen, nie `*`**.
6. `DROP TABLE alt`
7. `ALTER TABLE neu RENAME TO alt`
8. Die gelesenen Indexe und Trigger wieder anlegen.
9. `PRAGMA foreign_key_check` — ein Treffer bricht ab und rollt zurück.
10. `COMMIT`
11. `PRAGMA foreign_keys = ON`

**Danach einmal `VACUUM`** über die ganze Datei, außerhalb der Transaktion.
*Ohne ihn bleibt die Datei auf dem Doppelten stehen: der Platz der alten
Tabellen ist frei, aber nicht zurückgegeben.*

**Vor dem ersten Schritt wird geprüft:**

* **Der freie Platz.** `fs.statfsSync` auf dem Verzeichnis der Datenbank, wie
  in `keytool.js`. Gebraucht wird das **Dreifache** der Dateigröße. Ist weniger
  da, wird abgebrochen und die Zahl genannt. *Ein unbekannter freier Platz ist
  keine Absage — dieselbe Regel wie beim Schlüsselwechsel: gesagt wird es
  trotzdem.*
* **Der Stand.** Steht `data` schon überall am Ende, endet das Werkzeug mit
  einem Satz und ändert nichts.

**Ausgegeben wird je Tabelle:** Zeilen, Bytes, Dauer. Am Ende die Dateigröße
vorher und nachher.

**Die Dauer** steht als eine Zahl im Werkzeug, dieselbe Bauform wie
`MS_PER_MB` in `keytool.js`.

**Gemessen an 1000 Zeilen mit der Verteilung des Bestands, unverschlüsselt:**

| | | je MB |
|---|---:|---:|
| Umschichten | 1,1 s | 2,8 ms |
| `VACUUM` | 3,6 s | 9,8 ms |
| **zusammen** | **4,7 s** | **12,6 ms** |

*Die Prüflage war unverschlüsselt. Mit SQLCipher kommt Entschlüsseln und
Verschlüsseln dazu — der Schlüsselwechsel misst dafür 20 ms je MB. **Wer baut,
misst am verschlüsselten Prüfstandbestand nach und trägt den gemessenen Wert
ein.** Bis dahin steht 40 als Annahme darin.*

### BA 3 — Der Prüfstand

**Eine neue Gruppe, „Die Spaltenfolge: `data` steht am Ende".**

1. **Das Schema hält es.** In `db.js` ist `data` in `photos`,
   `comment_images` und `attachments` die letzte Spalte. *Gelesen wird der
   `SCHEMA`-String, nicht eine Abschrift.*
2. **Und `trash_bytes` ebenso** — die vierte BLOB-Tabelle, damit ein späterer
   Umbau sie nicht vergisst.
3. **Die angelegte Datenbank hält es auch.** `PRAGMA table_info` über eine
   frische Prüflage: die letzte Spalte heißt `data`.
4. **Das Werkzeug schichtet um, ohne ein Byte zu verlieren.** Eine Prüflage
   stellt die **alte** Folge von Hand her, füllt sie mit Zeilen verschiedener
   Größe, ruft `reorder.js umschichten --ja` und vergleicht danach:
   Zeilenzahl, jede `id`, `length()` jeder BLOB-Spalte und **die Bytes selbst**
   je Zeile.
5. **Die Indexe sind danach wieder da**, wortgleich — verglichen wird der
   `sql`-Text aus `sqlite_master` vor und nach dem Lauf.
6. **Ein zweiter Lauf ändert nichts.** Das Werkzeug erkennt den fertigen Stand
   und endet ohne Eingriff.
7. **Bei laufendem Server bricht es ab.** Eine zweite offene Verbindung hält
   `BEGIN EXCLUSIVE`; das Werkzeug muss abbrechen und darf nichts anfassen.

**Gegenproben**, je eine: das Schema fällt auf die alte Folge zurück · das
Werkzeug vergisst die Indexe · das Werkzeug lässt `PRAGMA foreign_key_check`
weg · die Prüfung auf freien Platz fällt weg.

### BA 4 — Die Papiere und die Zahlen

* **`Doku/Aenderungsprotokoll_0.39.0.md`** — was gebaut wurde, mit den
  gemessenen Zahlen: Dauer der Umschichtung am Prüfstandbestand, Dateigröße
  vorher und nachher, und die Kachelzeiten vor und nach dem Umschichten
  *(mit `tools/photoscan.js` an derselben Prüflage gemessen)*.
* **`CHANGELOG.md`** — ein Eintrag `## [0.39.0]`, Form wie die vorigen, mit
  einem **Kasten darüber**: wer den Gewinn will, ruft das Werkzeug bei
  angehaltener Instanz auf; wer nichts tut, verliert nichts.
* **`README.md`** — im Abschnitt „Eine neuere Version über eine bestehende
  einspielen" ein Absatz über `tools/reorder.js`: was es tut, dass die Instanz
  dafür steht, wieviel Platz es braucht und dass es freiwillig ist. **Der
  Abschnitt kommt ins Inhaltsverzeichnis, wenn er eine eigene Überschrift
  bekommt.**
* **`Doku/Fahrplan.md`** — die Tafelzeile `0.39.0` durchstreichen und mit dem
  Gebauten füllen; der Abschnitt `## 0.39.0` bekommt oben „GEBAUT am …".
  **Die Nebentabelle `photo_derivatives` wird dabei ausdrücklich als nicht
  gebaut vermerkt**, mit der gemessenen Differenz von 0,002 ms je Kachel.
* **`package.json`** auf `0.39.0`, `package-lock.json` mit.
* **Die festen Zahlen nachziehen:** die Zahl der Prüfungen und der Rückbauten
  in `test/selfcheck.js`, die Kommentarzeilen je Datei und die Summe. *Sie
  ändern sich mehrfach; sie werden am **fertigen** Stand gemessen, nicht
  zwischendurch.*
* **Der Fingerprint** mit `node tools/publish.js` am sauberen Arbeitsbaum, dann
  in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 4. Was ausdrücklich nicht dazugehört

| | warum |
|---|---|
| **Die Nebentabelle `photo_derivatives`** | Gemessen: 0,009 gegen 0,011 ms je Kachel. Zwei Tausendstel sind den zweiten Schreibweg nicht wert |
| **`length(thumb)` aus `idx_photos_tile` nehmen** | Gemessen: der Ausdruck kostet nichts. Ob der Index nach dem Umschichten noch trägt, ist eine eigene Messung |
| **Ein Migrationsblock** | Es wird nicht migriert. Das Werkzeug ist ein Aufruf und kein Automatismus |
| **Eine Warnung in der Oberfläche** | Eine Optimierung ist kein Mangel |
| **Der Umbau von Export und Import** | Das ist 0.40.0 und hat eine eigene Auflage: erst am Bestand messen |
| **Ein `CHECK` auf `kind`** | Die Menge stünde dann zweimal. Der Kommentar in `db.js` sagt warum, und er bleibt |

---

## 5. Die Auflagen

1. **`npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.**
2. **Kein Verhalten ändert sich.** Keine Route, keine Antwort, keine Anzeige.
   Wer nach dieser Runde dieselbe Seite aufruft, sieht dasselbe.
3. **Die Kommentarregel bindet auch hier:** höchstens drei Zeilen je Block,
   nie mehr Kommentar als Code, keine Versionsnummer, kein Verweis auf ein
   Papier. `tools/reorder.js` geht mit hinaus und steht damit unter derselben
   Regel wie die übrigen ausgelieferten Dateien.
4. **Kein Pull Request, wenn keiner verlangt wurde.**
5. **Die gemessenen Zahlen in den Papieren werden am fertigen Stand gemessen.**
   Wird eine veröffentlichte Zahl korrigiert, steht daneben, warum.
6. **Kommt beim Bauen eine Frage auf, die hier nicht beantwortet ist**, wird
   der einfachere Weg gewählt, der kein Verhalten ändert — und die Entscheidung
   steht im Änderungsprotokoll.
