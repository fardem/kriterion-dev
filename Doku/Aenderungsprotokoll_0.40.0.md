# Änderungsprotokoll 0.40.0 — „Export und Import ohne den Arbeitsspeicher"

**Gebaut am 22. September 2026 auf 0.39.1. Fingerprint `@FP@`, davor
`9d48cbbc`.**

**Eine Runde, ein Gegenstand.** Der Export baute die ganze Datei als einen
String im Arbeitsspeicher. Ein String trägt in Node höchstens 536.870.888
Bytes; darüber sagte der Export ab und bot den Teilexport an. Die Schranke
fällt: die Datei entsteht jetzt beim Schreiben.

**Gebaut sind alle drei Stellen** — der Export, der Import und der Papierkorb.
**Das Austauschformat bleibt 18**, und der Inhalt der Datei ist Zeichen für
Zeichen derselbe.

---

## 1. Was gemessen ist

**Dieselbe Prüflage wie in der Planung: 40 Einträge zu je 6,0 MB, Datei
320,0 MB.** Gemessen am fertigen Stand, beide Male über die Route
`GET /api/export?photos=1` und an derselben Datenbank; der alte Stand kommt
aus `git archive HEAD` von 0.39.1. Abgelesen wird `VmHWM` aus
`/proc/<pid>/status` vor und nach der Anfrage — die Spitze des Prozesses, nicht
eine Stichprobe.

| | RSS-Spitze | Laufzeit |
|---|---:|---:|
| alles in einen String — 0.39.1 | **+1.125,8 MB** | 16,02 s |
| stückweise geschrieben — 0.40.0 | **+314,8 MB** | 3,95 s |

**Der Speicher fällt um den Faktor 3,6, die Laufzeit auf ein Viertel.** *Und
er hängt nicht mehr am Bestand: dieselbe Messung mit 80 Einträgen und einer
Datei von 640,0 MB ergibt **+315,0 MB** — dieselbe Zahl.*

> **DIE ZAHL WÄCHST NICHT MIT DEM BESTAND.** Der Schreiber hält je Eintrag ein
> Bündel und gibt es danach frei. Dass die Spitze trotzdem bei gut 300 MB
> liegt, ist die Halde von V8: sie sammelt die freigegebenen Bündel und räumt
> erst auf, wenn sie weiter wachsen müsste.

*Die Planung hatte +640,5 MB gegen +113,2 MB nachgestellt; beide Zahlen liegen
niedriger als die hier gemessenen. Der Grund: die Nachstellung lief ohne
Server, ohne Express und ohne SQLite — sie las die Bytes nicht aus einer
verschlüsselten Datei und schrieb nicht über einen Socket.*

---

## 2. Was gebaut ist

### Der Export schreibt stückweise

`exportEnvelope()` bleibt und trägt weiterhin den Papierkorb. Daneben stehen
drei kurze Funktionen:

| | |
|---|---|
| `exportHead()` | `JSON.stringify(exportEnvelope([]))` ohne den Schluss `]}` — der Kopf entsteht aus derselben Vorlage wie die Datei |
| `untilDrained(res)` | wartet auf `drain`, und bricht ab, wenn der Browser die Verbindung schließt |
| `writeExport(res, rows, situation)` | Kopf, je Eintrag ein eigenes `JSON.stringify(entryAsBundle(…))` mit Komma dazwischen, dann `]}` |

**`Content-Type` und `Content-Disposition` stehen vor dem ersten Schreiben.**
Danach geht kein Kopf mehr hinaus — auch kein Fehlercode. Bricht das Schreiben
ab, fehlt der Datei der Schluss; sie ist damit ungültiges JSON, und der Import
weist sie ab. Die Zeile dazu steht im Containerprotokoll.

**Der Teilexport nimmt denselben Weg.** Er schreibt dieselben Bündel, nur eine
Auswahl davon.

### Der Import liest stückweise

`multer` bekommt `diskStorage`; die Datei liegt in `DATA_DIR/import` unter
einem zufälligen Namen. **Nicht in `/tmp`:** das ist im Container oft klein und
liegt nicht auf dem eingehängten Datenträger.

**Gelesen wird über einen Leser von 138 Zeilen**, der genau so viel von JSON
versteht, wie hier gebraucht wird: `jsonCursor()` hält die Lesestelle und gibt
den Puffer hinter ihr frei, `skipString()` und `skipValue()` laufen über einen
Wert, `exchangeFromFile()` liest die Kopffelder und gibt die Einträge als Folge
heraus. Je Eintrag steht ein `JSON.parse` — nie eines über die ganze Datei.

**Der Import bleibt eine Transaktion.** Er ändert entweder alles oder nichts.
Die Ableitungen entstehen weiterhin davor; was die Transaktion nicht mehr
braucht — die Base64-Strings der Fotos, Dateien und Kommentarbilder —, wird
nach dem Vorbereiten je Eintrag freigegeben.

**`IMPORT_MAX` steigt von 900 MB auf 4 GB**, und vor `multer` steht eine
Platzprobe: `fs.statfsSync` gegen die angekündigte Länge mal 1,1, dieselbe
Bauform wie im Schlüsselwerkzeug. Reicht der Platz nicht, kommt `507` mit der
Zahl; ist der freie Platz nicht zu ermitteln, wird nicht abgesagt.

**Die Datei muss auf jedem Weg wieder weg.** Ein `try/finally` steht um den
ganzen Rumpf, und der Serverstart leert den Ordner — falls ein Absturz das
`finally` nicht mehr erreicht hat.

### Der Papierkorb kopiert in SQLite

`funnelStore()` nimmt keine Bytes mehr, sondern die Herkunft: Spalte und
Zeilennummer. Je Trägerspalte steht eine Anweisung der Form
`INSERT INTO trash_bytes (trash_id, part, data) SELECT ?, ?, data FROM … WHERE id = ?`
— vier an der Zahl, eine davon mit `COALESCE(medium, thumb)` für das Standbild.

**Dafür liest `entryAsBundle()` die Blobspalten gar nicht erst.** Drei
Abfragen ohne `data` stehen neben den drei vollen; welche gilt, entscheidet
`funnel.blobs`. Die Nummerierung der Teile ist dieselbe geblieben, und ein
Papierkorbeintrag aus einer früheren Fassung kommt unverändert zurück.

### Der Hinweis vor dem Lauf

**Vor dem Export und vor dem Import steht ein Fenster.** Es sagt an, dass es
dauern kann, dass es keine Fortschrittsanzeige gibt und dass das Fenster offen
bleiben muss — und es stellt die drei Wege nebeneinander: Export in einer
Datei, Export in Teilen, Sicherung. Ein Knopf zum Weitermachen, einer zum
Abbrechen, **kein Häkchen „nicht mehr zeigen"**.

Elf Sätze in den drei Sprachdateien, dazu die Absage bei zu wenig Platz. Zwei
sind gefallen: `server.exportTooBig` und `server.exportGrew`.

---

## 3. Was weggefallen ist

| | warum |
|---|---|
| `exchangeBytes()` | sein einziger Rufer war die Absage |
| die Absage `413` vor dem Bau | der Gesamtexport hat keine Grenze mehr |
| der Fang des `RangeError` darunter | dasselbe |
| `Content-Length` an der Exportantwort | sie stünde erst fest, wenn die Datei fertig wäre |
| `server.exportTooBig`, `server.exportGrew` | beide Absagen gibt es nicht mehr |

**`EXCHANGE_MAX` bleibt** — als Latte je Teil im Teilexport und als Zahl in den
Kennzahlen. **`EXCHANGE_WARN` bleibt** als Hinweis auf die Größe und als Deckel
über der wählbaren Teilgröße.

---

## 4. Entscheidungen, die der Auftrag offenließ

| Frage | Entscheidung | Grund |
|---|---|---|
| Steht der Hinweis auch vor jedem Teil des Teilexports? | nein, nur vor dem Export in einer Datei und vor dem Import | bei fünf Teilen erschiene er fünfmal, und wer den Teilexport wählt, hat die Wahl schon getroffen |
| Was, wenn `version` in der Datei **hinter** `items` steht? | die Datei wird als zu alt abgewiesen | die Formatnummer wird vor der ersten Zeile Arbeit geprüft; eine Datei dieser Instanz trägt sie an dritter Stelle, lange vor `items` |
| Woher kommt der Kopf der Datei? | aus `exportEnvelope([])` ohne den Schluss `]}` | zwei Bauformen für denselben Kopf liefen auseinander |
| Was geschieht bei einem Fehler mitten im Schreiben? | die Antwort wird beendet, die Zeile geht ins Containerprotokoll | ein Fehlercode geht nicht mehr hinaus; die abgebrochene Datei ist ungültiges JSON, und das ist der Schutz |
| Welcher Code bei zu wenig freiem Platz? | `507` | er sagt genau das; `413` meinte die Größe der Anfrage und nicht den Platz |
| Bleibt die Größenwarnung der Oberfläche vor dem Hochladen einer Importdatei? | ja, unverändert | sie ist die Grenze des **Browsers** — `FileReader` baut für die Vorschau einen String —, nicht die des Servers |
| Was wird aus dem Hinweis über dem Exportknopf? | er nennt keine Höchstgröße je Datei mehr, sondern sagt an, dass es dauert und keinen Fortschritt gibt | eine Höchstgröße je Datei gibt es nicht mehr, und ein Satz, der eine behauptet, hielte jemanden von einem Weg ab, der funktioniert |

---

## 5. Die festen Zahlen

| | vorher | jetzt |
|---|---:|---:|
| Prüfungen | 7.256 | **7.286** |
| Gruppen | 388 | **389** |
| Rückbauten | 1.133 | **1.135** |
| Portbasen des Laufs | 63 | **64** |
| Protokollzeilen in den sechs Dateien | 49 | **53** |
| Schlüssel je Sprachdatei | 1.233 | **1.243** |
| Kommentarzeilen über alles | 16.679 | **16.801** |
| Codezeilen über alles | 66.732 | **67.245** |

---

## 6. Was ausdrücklich nicht gebaut ist

**Eine Fortschrittsanzeige.** Sie bräuchte die Größe vorab, und genau die
fällt weg. Der Dialog sagt es an.

**Eine Grenze, die den freien Speicher mitrechnet.** Der Export braucht nach
dem Umbau kaum noch Speicher.

**Das Abschaffen des Teilexports.** Er bleibt die Wahl für eine
Hochladegrenze, einen Datenträger und eine langsame Verbindung.

**Ein Fortschritt über einen zweiten Kanal.** Ein zweiter Weg neben dem
Herunterladen ist eine eigene Runde.

---

## 7. Der Prüflauf

**`npm test`: 7.286 von 7.286 Prüfungen bestanden, 389 Gruppen.**

**Die neue Gruppe „Der Export schreibt stückweise" trägt 19 Prüfungen** und
kostet 8,8 Sekunden. Sie fährt eine eigene Instanz und hält die neun
Zusagen des Auftrags:

| | |
|---|---|
| 1 | Der Export schreibt gültiges JSON — Kopf, Einträge, Schluss |
| 2 | Eine Prüflage über der alten Grenze geht durch — 500 Einträge mit je einem Tagnamen von 1,0 MB, und die Antwort misst mehr als die 483,2 MB, an denen der alte Weg abgesagt hätte |
| 3 | Der Rundlauf trägt: die zweite Exportdatei gleicht der ersten Zeichen für Zeichen |
| 4 | Eine Datei ohne den Schluss `]}` wird abgewiesen, und der Bestand bleibt unberührt |
| 5 | Der Import räumt seine Datei weg — beim Erfolg und beim Fehler |
| 6 | Der Serverstart leert den Ordner, und er sagt es ins Protokoll |
| 7 | Der Dialog erscheint vor Export und Import und nennt alle drei Wege *(in `test/ui_system.js`)* |
| 8 | `trash_bytes` trägt nach dem Löschen dieselben Bytes wie vorher die Träger *(in „Der Papierkorb: der Rundlauf")* |
| 9 | Beim Schreiben wächst die Spitze des Servers um weniger als 200 MB |

**Die vier Rückbauten sind gefahren:**

@GEGENPROBEN@
