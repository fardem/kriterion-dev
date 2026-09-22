# Auftrag 0.40.0 — „Export und Import ohne den Arbeitsspeicher"

**Erteilt am 22. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. **Dieser Auftrag beantwortet jede Frage, die beim Bauen
aufkommen kann. Es wird nicht nachgefragt.**

---

## 1. Das Ziel in einem Satz

**Ein Export in einer Datei, bei jeder Bestandsgröße — und ein Import, der sie
wieder einliest.**

Der Teilexport bleibt, aber als Wahl und nicht als Zwang.

---

## 2. Warum, und für wen

Der Export baut heute die ganze Datei als **einen String im Arbeitsspeicher**.
Ein String darf in Node höchstens 536.870.888 Bytes tragen — 512,0 MB. Blobs
gehen als Base64 hinaus, aus drei Bytes werden vier Zeichen.

**Am Bestand des Betreibers gemessen, 22. September 2026:** 86 Einträge,
1994 Fotos, 407 MB roh. **Der Export in einer Datei bräuchte 656,4 MB** und
wird deshalb abgesagt; der Teilexport schreibt drei Dateien, die größte
298,3 MB.

**Nachgestellt, dieselben Daten in zwei Wegen, je ein eigener Prozess:**

| | RSS-Spitze | Laufzeit |
|---|---:|---:|
| alles in einen String — wie heute | **+640,5 MB** | 4,48 s |
| stückweise geschrieben | **+113,2 MB** | 2,37 s |

*Datei 320,0 MB, 40 Einträge zu je 6,0 MB. Gemessen synchron und nicht über
einen Zeitgeber: der käme während `JSON.stringify` nie dran, der Event Loop
steht so lange.*

> **DER GRUND IST NICHT DER BESTAND DES BETREIBERS, SONDERN DIE FREMDE
> INSTANZ.** *Auf einer Maschine mit sechzehn Gigabyte tun 640 MB nicht weh.
> Eine Instanz mit einem oder zwei Gigabyte fällt beim Export um, lange bevor
> die Grenze des Strings in Sicht kommt — und Kriterion soll weitergegeben
> werden.* **Nach dem Umbau sind es 113 MB, und die Zahl hängt am größten
> Einzeleintrag statt am Bestand: sie wächst nicht mit.**

**Es ist kein Fehler, der behoben wird.** Der heutige Weg rechnet vorher, sagt
ab, bietet den Teilexport an und fängt den `RangeError` als Netz darunter. Es
ist eine Beschränkung, und sie fällt.

---

## 3. Die Entscheidungen — alle schon getroffen

| Frage | Antwort |
|---|---|
| **Ändert sich das Austauschformat?** | **Nein.** `EXCHANGE_FORMAT` bleibt **18**. Der Inhalt der Datei ist Zeichen für Zeichen derselbe; nur ihre Erzeugung ändert sich. Eine ältere Datei bleibt lesbar, eine neue auch für eine ältere Instanz |
| **Was wird aus `EXCHANGE_MAX`?** | **Als Absage für den Gesamtexport fällt es weg** — es hat keinen Grund mehr. Als Latte je Teil im Teilexport bleibt es |
| **Was wird aus `EXCHANGE_WARN`?** | **Bleibt**, aber nur als Hinweis auf die Größe, nicht als Schwelle zu einer Absage. Es deckelt weiter die wählbare Teilgröße |
| **Was wird aus `EXCHANGE_PART_MAX`?** | **Bleibt** bei 999 |
| **`Content-Length` fällt weg — und dann?** | Der Browser kennt die Größe nicht und zeigt keinen Fortschritt. **Dagegen steht der Dialog aus Abschnitt 4** |
| **Was, wenn mitten im Schreiben ein Fehler auftritt?** | Die Antwort trägt dann schon `200`, ein Fehlercode geht nicht mehr. **Die Datei bricht ohne den Schluss `]}` ab und ist ungültiges JSON** — der Import weist sie ab. *Das ist der eingebaute Schutz und reicht; ein zweiter wird nicht gebaut* |
| **`IMPORT_MAX`** | steigt von 900 MB auf **4 GB**, und **vor dem Hochladen wird der freie Platz geprüft** — dieselbe Bauform wie in `keytool.js` (`fs.statfsSync`). Reicht er nicht, wird abgesagt, bevor etwas geschrieben wird |
| **Wo liegt die Importdatei?** | In `DATA_DIR`, in einem eigenen Unterordner. **Nicht in `/tmp`:** das ist im Container oft klein und liegt nicht auf dem eingehängten Datenträger |
| **Wer räumt sie weg?** | Ein `try/finally` um den ganzen Import. **Und der Serverstart leert den Ordner** — falls ein Absturz etwas liegen ließ |
| **Bleibt der Teilexport?** | **Ja, unverändert.** Er ist die Wahl für eine Hochladegrenze, einen Datenträger oder eine langsame Verbindung |
| **Ändert sich eine Route?** | **Keine.** Dieselben Adressen, dieselben Antworten, nur stückweise geschrieben |
| **Ändert sich das Schema?** | **Nein** |
| **Versionsnummer** | **0.40.0**, MINOR, Schema: nein, Format: nein |

---

## 4. Der Hinweis vor dem Lauf — Vorgabe des Betreibers

**Vor dem Export und vor dem Import steht ein Dialog.** Er sagt an:

* dass es je nach Bestand und Verbindung **dauern kann**,
* dass es **keine Fortschrittsanzeige** gibt,
* dass das **Fenster offen bleiben** muss.

Ein Knopf zum Weitermachen, einer zum Abbrechen. **Kein Häkchen „nicht mehr
zeigen"** — wer exportiert, tut es selten.

### Und er sagt, welcher Weg wann passt

**Das ist der zweite Teil der Vorgabe und der Grund, warum der Dialog mehr ist
als eine Warnung.** Drei Wege stehen nebeneinander, und heute sagt nichts, wann
man welchen nimmt:

| Weg | wofür |
|---|---|
| **Export in einer Datei** | Umzug, Archiv, Weitergabe. Unverschlüsselt und auch von einer späteren Fassung lesbar |
| **Export in Teilen** | wenn eine Hochladegrenze, ein Datenträger oder eine langsame Verbindung im Weg steht |
| **Sicherung** | der Notfall. Die vollständige, verschlüsselte Kopie der Datenbank — sie trägt auch, was der Export nicht enthält |

*Der Wortlaut steht schon zur Hälfte da:* `card.exportPurposeHint` *nennt
„Umzug, Archiv und Weitergabe",* `card.backupWhatHint` *die Sicherung.* **Was
fehlt, ist die Gegenüberstellung an einer Stelle** — und die gehört in den
Dialog, nicht in eine Fußzeile.

### Wo die lange Fassung steht

**Im Handbuch**, als eigener Abschnitt „Export und Import". *Es ist Bedienung:
man klickt es in der Oberfläche.* **Nicht in der README** — dort steht
„Sichern", und keine Überschrift darf in beiden Dateien stehen.

---

## 5. Die Bauabschnitte

### BA 1 — Der Export schreibt stückweise

`exportEnvelope()` (`server.js`:4642) gibt heute ein Objekt zurück, das
`res.json()` in einem Zug serialisiert. **Beides wird ersetzt durch ein
schrittweises Schreiben:**

1. Der Kopf: `exported_at`, `title`, `version`, `appVersion`, `criteria` und
   die drei Kriterienfelder, dann `"items":[`.
2. Je Eintrag ein eigenes `JSON.stringify(entryAsBundle(…))`, mit Komma
   dazwischen.
3. Der Schluss `]}`.

**`Content-Type` und `Content-Disposition` werden vor dem ersten Schreiben
gesetzt.** *Danach geht kein Kopf mehr hinaus.*

**Der Rückstau wird beachtet:** gibt `res.write()` `false` zurück, wird auf
`drain` gewartet, bevor der nächste Eintrag kommt. *Sonst sammelt sich die
ganze Datei im Puffer des Sockets, und der Umbau hätte nichts gebracht.*

**Der Teilexport nimmt denselben Weg** — er schreibt dieselben Bündel, nur eine
Auswahl davon.

### BA 2 — Der Import liest stückweise

`multer` bekommt `diskStorage` statt `memoryStorage`, Ziel ist der Unterordner
in `DATA_DIR`.

**Gelesen wird eintragsweise**, nicht mit einem `JSON.parse` über die ganze
Datei. *Der Kopf steht vorn und ist klein; `items` ist eine Liste, und ihre
Elemente lassen sich einzeln herauslesen.*

> **DIESER ABSCHNITT IST DER RISKANTE.** *Eine Datei im Dateisystem muss auf
> jedem Weg wieder weg — beim Erfolg, beim Fehler, beim Abbruch des Browsers.*
> **Das `finally` steht um alles, und der Serverstart leert den Ordner**,
> falls ein Absturz ihn nicht erreicht hat.

**Der Import bleibt in einer Transaktion.** *Er ändert entweder alles oder
nichts — daran wird nicht gerührt.*

### BA 3 — Der Papierkorb kopiert in SQLite

`intoTrash()` (`server.js`:5381) sammelt heute über `funnelStore()` jedes Blob
als Buffer und schreibt es danach nach `trash_bytes`.

**Stattdessen je Trägertabelle eine Anweisung:**
`INSERT INTO trash_bytes (trash_id, part, data) SELECT ?, ?, data FROM …`

**Damit wandern die Bytes nie durch Node.** *Dafür darf `entryAsBundle` die
Blobspalten gar nicht erst lesen, wenn der Trichter der Papierkorb ist.*

*Gemessen am Bestand: das Lesen aller Blobs des größten Eintrags kostet heute
170,0 ms. Der Abschnitt ist billig und ohne Risiko — er fährt mit.*

### BA 4 — Der Dialog

In `public/app.js`, vor dem Auslösen von Export und Import. Wortlaut in den
drei Sprachdateien. **Die Gegenüberstellung der drei Wege aus Abschnitt 4 steht
darin.**

### BA 5 — Der Prüfstand

| | was gehalten wird |
|---|---|
| 1 | Der Export schreibt gültiges JSON — Kopf, Einträge, Schluss |
| 2 | **Eine Prüflage über der alten Grenze geht durch.** *Sie wäre vorher abgesagt worden* |
| 3 | **Der Rundlauf trägt:** was der Export schreibt, liest der Import wieder ein, und der Bestand danach gleicht dem davor |
| 4 | Eine Datei ohne den Schluss `]}` wird abgewiesen |
| 5 | Der Import räumt seine Datei weg — beim Erfolg **und** beim Fehler |
| 6 | Der Serverstart leert den Ordner |
| 7 | Der Dialog erscheint vor Export und Import und nennt alle drei Wege |
| 8 | `trash_bytes` trägt nach dem Löschen dieselben Bytes wie vorher die Träger |
| 9 | `res.write()` wird bei Rückstau angehalten |

**Gegenproben**, je eine: der Schluss `]}` fällt weg · das `finally` des Imports
fällt weg · der Rückstau wird nicht beachtet · der Papierkorb liest die Blobs
wieder durch Node.

### BA 6 — Die Papiere und die Zahlen

* **`Doku/Aenderungsprotokoll_0.40.0.md`** — mit der am fertigen Stand
  gemessenen RSS-Spitze vor und nach dem Umbau, an derselben Prüflage.
* **`CHANGELOG.md`** — `## [0.40.0]`, mit einem Kasten darüber: der Export
  geht wieder in einer Datei, es gibt keinen Fortschrittsbalken mehr, und ein
  Dialog sagt es vorher an.
* **`manual-de.md`** — der neue Abschnitt „Export und Import" mit der
  Gegenüberstellung, dazu die Sprungmarke im Inhaltsverzeichnis.
* **`Doku/Fahrplan.md`** — die Tafelzeile `0.40.0` durchstreichen und füllen;
  der Abschnitt bekommt oben „GEBAUT am …". **Die Spalte „Format" steht auf
  `nein`** *(dort steht heute `ja`; die Formatnummer ändert sich nicht, nur die
  Form der Antwort — das ist beim Zuordnen verwechselt worden)*.
* **`package.json`** auf `0.40.0`, `package-lock.json` mit.
* **Die festen Zahlen nachziehen** — Prüfungen, Rückbauten, Kommentarzeilen je
  Datei und die Summe. *Am fertigen Stand gemessen, nicht zwischendurch.*
* **Der Fingerprint** mit `node tools/publish.js` am sauberen Arbeitsbaum, dann
  in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 6. Was ausdrücklich nicht dazugehört

| | warum |
|---|---|
| **Eine Fortschrittsanzeige** | Sie bräuchte die Größe vorab, und genau die fällt weg. Der Dialog sagt es an |
| **Eine Grenze, die den freien Speicher mitrechnet** | Vor dem Umbau wäre sie ein Pflaster gewesen; nach ihm braucht der Export kaum noch Speicher |
| **Das Abschaffen des Teilexports** | Er bleibt die Wahl für Hochladegrenze, Datenträger und langsame Verbindung |
| **Eine Änderung am Austauschformat** | Der Inhalt der Datei bleibt Zeichen für Zeichen derselbe |
| **Ein Fortschritt über einen zweiten Kanal** | Ein zweiter Weg neben dem Herunterladen ist eine eigene Runde und kein Beiwerk |

---

## 7. Die Auflagen

1. **`npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.**
2. **Der Bestand bleibt unberührt.** Export und Import ändern, was sie heute
   ändern, und sonst nichts.
3. **Die Kommentarregel bindet auch hier:** höchstens drei Zeilen je Block, nie
   mehr Kommentar als Code, keine Versionsnummer, kein Verweis auf ein Papier.
4. **Kein Pull Request, wenn keiner verlangt wurde.**
5. **Die gemessenen Zahlen werden am fertigen Stand gemessen.** Wird eine
   veröffentlichte Zahl korrigiert, steht daneben, warum.
6. **Kommt eine Frage auf, die hier nicht beantwortet ist**, wird der
   einfachere Weg gewählt, der kein Verhalten ändert — und die Entscheidung
   steht im Änderungsprotokoll.
