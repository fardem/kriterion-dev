# Änderungsprotokoll 0.39.0 — „Die Spaltenfolge: `data` ans Ende"

**Gebaut am 22. September 2026 auf 0.38.6. Fingerprint `XXXXXXXX`, davor
`236d515e`.**

**Eine Runde, ein Gegenstand.** In drei Tabellen stand die Dateispalte `data`
vor allen übrigen Spalten. SQLite liest eine Zeile von vorn; was hinter einem
großen Blob steht, ist nur über dessen Overflow-Kette erreichbar. Die Kachel
der Übersicht stand dahinter.

**Gebaut ist die Spaltenfolge und ein Werkzeug, das eine bestehende Datenbank
darauf bringt. Die Nebentabelle `photo_derivatives`, die der Fahrplan für diese
Nummer vorsah, ist nicht gebaut** — der Grund steht in Abschnitt 6.

---

## 1. Die Vorgabe

**Der Betreiber am 22. September 2026:** die Spaltenfolge wird korrigiert,
obwohl die Messung nur 6,35 ms je Übersichtsseite ergab. *Der Grund ist nicht
die Laufzeit, sondern die Folge selbst: sie ist falsch herum, und sie zu
korrigieren macht den Code an keiner Stelle komplizierter.*

---

## 2. Was gebaut ist

### `db.js` — die drei Tabellen

| Tabelle | Folge davor | Folge jetzt |
|---|---|---|
| `photos` | `id`, `item_id`, `mime_type`, **`data`**, `thumb`, `medium`, … , `zoom` | `id`, `item_id`, `mime_type`, `thumb`, `medium`, `kind`, `duration`, `focus_x`, `focus_y`, `sort_order`, `created_at`, `zoom`, **`data`** |
| `comment_images` | `id`, `comment_id`, `filename`, **`data`**, `thumb`, `sort_order`, `created_at` | `id`, `comment_id`, `filename`, `thumb`, `sort_order`, `created_at`, **`data`** |
| `attachments` | `id`, `item_id`, `filename`, `mime_type`, `size`, **`data`**, `sort_order`, `created_at`, `user_id` | `id`, `item_id`, `filename`, `mime_type`, `size`, `sort_order`, `created_at`, `user_id`, **`data`** |

`trash_bytes` führte `data` schon als letzte Spalte und ist unangetastet.

**Zwei Kommentare sind dabei gefallen.** Der an `focus_x` sagte, `zoom` stehe
„ganz unten"; das stimmt nicht mehr, denn `data` steht jetzt dahinter. Der an
`zoom` selbst begründete die Lage damit, dass `ADD COLUMN` eine Spalte hinten
anhängt — dieser Grund gilt nicht mehr, weil nicht mehr migriert wird.

**`SCHEMA` geht jetzt aus `db.js` hinaus.** `tools/reorder.js` legt die neue
Tabelle aus derselben Vorlage an, aus der auch der Start sie anlegt; eine
zweite Abschrift der DDL im Werkzeug liefe auseinander.

### `tools/reorder.js` — das Werkzeug

Zwei Befehle, in der Form von `keytool.js`:

```
node tools/reorder.js zeigen
node tools/reorder.js umschichten [--ja]
```

**Der Ablauf je Tabelle**, nach der Vorschrift von SQLite für Änderungen, die
`ALTER TABLE` nicht kann: Indexe und Trigger aus `sqlite_master` lesen ·
`PRAGMA foreign_keys = OFF` · `BEGIN EXCLUSIVE` · die neue Tabelle unter einem
anderen Namen anlegen · `INSERT … SELECT` mit den Spalten beim Namen ·
`DROP TABLE` · `ALTER TABLE … RENAME TO` · Indexe und Trigger wieder anlegen ·
`PRAGMA foreign_key_check` · `COMMIT` · `PRAGMA foreign_keys = ON`. **Danach
einmal `VACUUM`** über die ganze Datei, außerhalb der Transaktion.

**Vier Absagen, alle bevor etwas geschieht:**

| | |
|---|---|
| `data` steht schon überall am Ende | ein Satz, keine Änderung |
| zu wenig Platz | gebraucht wird das Dreifache der Dateigröße |
| die Datei ist in fremder Hand | `SQLITE_BUSY`, ein Satz statt eines Stapelauszugs |
| eine Spalte weicht vom Schema ab | Namen der Differenz, kein Umbau |

**Die Absage bei fremder Hand steht an zwei Stellen**, und das ist kein
Versehen: hält ein anderer Prozess eine Schreibtransaktion, scheitert schon die
DDL beim Laden von `db.js` — noch vor `BEGIN EXCLUSIVE`. Beide Wege enden in
derselben Meldung.

---

## 3. Gemessen am fertigen Stand

**Prüflage: 500 Fotos, 126,0 MB Originale, 10,3 MB Kacheln, 53,7 MB mittlere,
Datei 231,7 MB, verschlüsselt.** Verteilung wie im Bestand des Betreibers: die
Hälfte bis 100 kB, die Hälfte bis 1 MB, zwei Prozent darüber.

### Die Kachel holen — `tools/photoscan.js`, Median aus fünf Durchgängen

| Größe des Originals | Zeilen | vorher | nachher |
|---|---:|---:|---:|
| bis 100 kB | 250 | 0,26 ms | **0,02 ms** |
| bis 1 MB | 240 | 1,37 ms | **0,01 ms** |
| über 1 MB | 10 | 6,46 ms | **0,01 ms** |
| über alle 500 Kacheln | | 457,8 ms | **5,76 ms** |
| je Kachel | | 0,91 ms | **0,01 ms** |
| dreißig auf einmal | | 27,4 ms | **0,28 ms** |

*Die Prüflage ist mit 126 MB Originalen auf 500 Zeilen dichter besetzt als der
Bestand des Betreibers (407 MB auf 1997 Zeilen) — deshalb liegt die Zeit je
Kachel hier bei 0,91 ms und dort bei 0,21 ms. Der Faktor ist derselbe.*

### Die Umschichtung selbst

| | Dauer | je MB |
|---|---:|---:|
| `photos`, 500 Zeilen, 126,0 MB | 3.878 ms | |
| `comment_images`, 100 Zeilen, 5,9 MB | 43 ms | |
| `attachments`, 100 Zeilen, 29,3 MB | 555 ms | |
| **Umschichten zusammen** | **4.476 ms** | 19,3 ms |
| `VACUUM` | 5.874 ms | 25,4 ms |
| **zusammen** | **10.350 ms** | **44,7 ms** |

**`MS_PER_MB` im Werkzeug steht auf 45.** *Der Auftrag setzte 40 als Annahme
an; gemessen sind 44,7. Die Zahl ist eine Ansage für den Betreiber, keine
Grenze — sie steht nur in der Zeile „Erwartete Dauer".*

### Die Dateigröße

**231,7 MB vor dem Lauf, 231,7 MB nach dem `VACUUM`.** Die Folge ändert die
Anordnung in der Zeile, nicht die Datenmenge.

---

## 4. Der Prüfstand

**Ein neues Modul `test/reorder.js` mit einer Gruppe, „Die Spaltenfolge: `data`
steht am Ende", zwanzig Prüfungen, 7,8 Sekunden.**

| | |
|---|---|
| Das Schema hält es | gelesen wird der `SCHEMA`-String von `db.js`, nicht eine Abschrift |
| Und `trash_bytes` ebenso | die vierte Blob-Tabelle, damit ein späterer Umbau sie nicht vergisst |
| Die angelegte Datenbank hält es auch | `PRAGMA table_info` über eine frische Prüflage |
| `zeigen` ändert nichts | und nennt Tabellen, Platzbedarf und Dauer |
| Das Werkzeug verliert kein Byte | Zeilenzahl, jede `id`, `length()` jeder Blob-Spalte und die Bytes selbst |
| Die Indexe sind wieder da | verglichen wird der `sql`-Text aus `sqlite_master` vor und nach dem Lauf |
| Ein zweiter Lauf ändert nichts | das Werkzeug erkennt den fertigen Stand |
| Eine verwaiste Zeile bricht ab | `PRAGMA foreign_key_check` läuft vor dem `COMMIT` |
| Bei gehaltener Datei bricht es ab | eine zweite Verbindung hält `BEGIN EXCLUSIVE` |
| Bei zu wenig Platz kommt die Absage | ein tmpfs von 48 MB, zugeschüttet bis unter die Schwelle |

**Vier Rückbauten**, 1199 bis 1202: das Schema fällt auf die alte Folge zurück ·
das Werkzeug legt die Indexe nicht wieder an · es lässt `foreign_key_check`
weg · die Prüfung auf freien Platz fällt weg.

### Warum ein eigenes Modul und nicht eine Gruppe in einem bestehenden

Der Auftrag verlangte „eine neue Gruppe" und sagte nicht, wo. Die Gruppe
braucht eigene Instanzen in eigenen Verzeichnissen und ruft ein Werkzeug als
eigenen Prozess — dieselbe Bauform wie `test/keychange.js`, das dafür ein
eigenes Modul ist. Der Kopf des Prüfstands sagt: ein Modul je Sachgebiet.

---

## 5. Die festen Zahlen

| | vorher | jetzt |
|---|---:|---:|
| Prüfungen | 7.256 | **7.276** |
| Gruppen | 387 | **388** |
| Rückbauten | 1.133 | **1.137** |
| Dateien mit Rückbauten | 40 | **41** |
| Dateien des Kommentarwächters | 36 | **37** |
| Dateien von `benchFiles()` samt `counterproof.js` | 21 | **22** |
| Kommentarzeilen über alles | 16.678 | **16.721** |
| Codezeilen über alles | 66.756 | **67.110** |

---

## 6. Was ausdrücklich nicht gebaut ist

**Die Nebentabelle `photo_derivatives`.** Der Fahrplan sah sie für diese Nummer
vor. Gemessen an einer gestellten Lage von 1000 Zeilen: 0,009 ms je Kachel mit
Nebentabelle gegen 0,011 ms mit der Spaltenfolge. **Zwei Tausendstel einer
Millisekunde sind einen zweiten Schreibweg, einen zweiten Leseweg, einen
Eingriff in Export, Import und Papierkorb und eine Neurechnung aller
Ableitungen nicht wert.**

**`length(thumb)` bleibt in `idx_photos_tile`.** Der Ausdruck kostet nichts; ihn
zu entfernen wäre eine zweite Änderung.

**Kein Migrationsblock.** Es wird nicht migriert. Das Werkzeug ist ein Aufruf
und kein Automatismus, und es steht unter `tools/` — nicht als fünfzehntes
Kernmodul.

**Keine Warnung in der Oberfläche.** Eine Optimierung ist kein Mangel.

---

## 7. Entscheidungen, die der Auftrag offenließ

| Frage | Entscheidung | Grund |
|---|---|---|
| Woher nimmt das Werkzeug die neue Tabellendefinition? | aus dem `SCHEMA`-String von `db.js` | eine zweite Abschrift der DDL liefe auseinander; die neue Tabelle trägt denselben Wortlaut wie die einer frischen Instanz |
| Was, wenn die Tabelle andere Spalten hat als das Schema? | Abbruch mit Nennung der Differenz | `INSERT … SELECT` mit den Spalten beim Namen verlöre sonst eine Spalte oder ließe eine leer |
| Eine Transaktion je Tabelle oder eine über alle drei? | je Tabelle | bricht die zweite ab, ist die erste fertig; der nächste Aufruf macht dort weiter |
| Steht `tools/reorder.js` in den Dateilisten der Wächter über Versionsnummern und Papierverweise? | nein | keine Datei unter `tools/` steht dort; die Regel ist beim Schreiben eingehalten, die Listen bleiben einer eigenen Runde |
| Wie lange wartet das Werkzeug auf eine gehaltene Datei? | fünf Sekunden | der Vorgabewert von `better-sqlite3`; ein Server, der gerade eine Transaktion abschließt, hält die Sperre nur kurz |

---

## 8. Der Prüflauf

**`npm test`: 7.276 von 7.276 Prüfungen bestanden, 388 Gruppen.**

**Die vier Rückbauten 1199 bis 1202 sind gefahren und alle vier rot in der
erwarteten Gruppe.**
