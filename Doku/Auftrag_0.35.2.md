# Auftrag 0.35.2 — „Der Einzelexport geht raus"

Geschrieben am 17. September 2026. Nicht gebaut. Läuft nach 0.35.1.

**Sie nimmt eine Route weg, die das Projekt nicht braucht, und zwei Stücke, die
dieselben Dateien anfassen.**

> **NACHGETRAGEN AM 18. SEPTEMBER 2026, und damit ist die Runde keine reine
> Aufräumrunde mehr.** *Der Betreiber hat im Betrieb zwei Dinge gemeldet:*
> **ein Fehler beim Hochladen vieler Fotos** *(BA 4 — er trifft ihn heute und
> ist der einzige Bauabschnitt, der Verhalten ändert)* **und Zeitstempel im
> Containerprotokoll** *(BA 5)*.

> **GEMESSEN WURDE AUF DEM STAND `803a7f9` (0.35.1).** Prüfstand **7007 von
> 7007**, 363 Gruppen, 1036 Rückbauten, Fingerprint `10017d45`.

---

## 1. Die Regel

Der Betreiber hat die Runde am 17. September 2026 bestimmt, in drei Schritten:

> „was mit dem eintrag exportieren auf sich hat. von wem kam dieser vorschlag.
> ich habe den wohl akzeptiert weil ich nicht verstanden habe was damit soll.
> welchen nutzen haben wir davon?"

Darauf die Antwort: die Route ist mit **0.8.70** abgefallen, stand in keinem
Auftrag und hatte 26 Runden lang keinen Rufer in der Oberfläche. Dann:

> „Notiere das for 0.35.2"

> „Auch die Route wenn sie for nichts anderes benötigt wird"

**Sie wird für nichts anderes gebraucht** — nachgesehen am 17. September 2026,
die Tafel steht in Punkt 45 des Sammelblatts. Also geht sie mit.

---

## 2. Die Zahlen

| | heute | nachher |
|---|---:|---:|
| Routen in `F_ROUTES` | 73 | **72** |
| Routen ohne Rufer im Browser | 0 | **0** |
| Schlüssel je Sprachdatei | 1.212 | **1.210** |
| die Zahl in `test/source.js` | 1.300 | **1.298** |
| Rückbauten | 1.036 | **1.034 + die neuen** |
| Verweise auf `Doku/` in ausgelieferten Dateien | 1 | **0** |

**Der Fingerprint ändert sich** — `server.js`, `public/app.js`,
`public/style.css`, die drei Sprachdateien und `package.json`.

---

## 3. Bauabschnitte

### BA 1 — Die Route und ihr Knopf fallen

**Ausgeliefert:**

| Datei | was |
|---|---|
| `server.js`:4372 | `app.get('/api/items/:id/export', …)`, zwölf Zeilen |
| `public/app.js`:3890 | der Knopf `#exp1` im Fuß des Eintrags |
| `public/app.js`:5725 | sein Rufer, `window.location` |
| `public/app.js`:3885 | der Kommentar darüber — **er nennt „seit 0.30.0" und damit eine falsche Versionsnummer** |
| `public/languages/*.json`:810 | `entry.exportOne` |
| `public/languages/*.json`:1233 | `server.entryTooBig` — die Route ist seine einzige Fundstelle |

**Was bleibt, und warum:** `entryAsBundle()` und `exportEnvelope()` tragen den
vollen Export und den Papierkorb. `exportName(suffix)` behält seinen Parameter
— der Teilexport nennt `-teil-N-von-M`. `EXCHANGE_MAX` hat vier weitere
Fundstellen.

**Die beiden Schlüssel fallen verschieden**, und das ist die eine Falle dieser
Runde:

* `entry.exportOne` steht in **keinem** Vergleichsstand — er ist mit 0.35.0
  entstanden. Er verlässt `EG_ADDED_AFTER_0312`, `TR_ADDED_AFTER_0313`,
  `EG_CHANGED_AFTER_0312_SHARED`, `TR_CHANGED_AFTER_0313` und
  `WORDING_NEW_0350`.
* `server.entryTooBig` steht in **beiden** (`tools/englisch-0312.json`,
  `tools/tuerkisch-0313.json`). Er muss **namentlich** in
  `EG_GONE_AFTER_0312`, `TR_GONE_AFTER_0313`, verlässt `WORDING_CHANGED_0311`
  und braucht eine neue `WORDING_GONE`-Liste. **Sonst kippt die Wortlautprobe
  über 1.082 Sätze:** sie zieht weggefallene Sätze auf beiden Seiten ab, und
  ein Satz, der nur auf einer fehlt, macht die Zahlen ungleich.

**Prüfstand:** die Prüfungen ab `test/roundtrip.js`:6654, die Rechtezeile ab
6691, die 404 bei 6701, „Der Einzelexport misst mit derselben Rechnung wie der
volle" bei 17186; `F_ROUTES` und die Zahl bei `test/source.js`:190 und 1200;
die vier Prüfungen bei 2615; `LANG_KEY_COUNT`; die Rückbauten **1087 und 1088**
samt ihrer Gruppe; die sechs Gleichlaufsummen.

### BA 2 — Ein Wächter „jede Route hat einen Rufer"

**Das ist die Lücke, durch die der Einzelexport 26 Runden gefallen ist.** Der
Prüfstand kennt seit 0.35.0 „jeder Abfrageparameter des Browsers hat einen
Leser" und „jeder Schlüssel der Sprachdatei hat einen Leser". Der dritte Satz
derselben Form fehlt.

**Gemessen am 17. September 2026: 73 Routen, 0 ohne Rufer.** Sechs findet eine
buchstäbliche Suche nicht, weil sie über die Tafel in `adminList` als
`${url}/${entry.id}` reisen:

```
PUT, DELETE   /api/product-categories/:id
PUT, DELETE   /api/tags/:id
PUT, DELETE   /api/criteria/:id
```

**Der Wächter braucht also eine benannte Ausnahmeliste mit drei Adressen** —
dieselbe Bauform wie die `WORDING_*`-Tafeln, und aus demselben Grund: wer eine
Ausnahme eintragen muss, schreibt auch ihren Grund dazu.

**Eine Gegenprobe gehört dazu:** eine Route, deren Rufer im Browser
zurückgebaut wird, muss die Gruppe rot machen.

### BA 3 — Der letzte Verweis auf `Doku/`

`public/style.css`:161 nennt `Doku/Farbkonzept_0_23_0.md`. **Der öffentliche
Stand trägt kein `Doku/`** (`Doku/Veroeffentlichen.md`), der Verweis zeigt dort
auf nichts.

Er ist in 0.35.0 ausdrücklich liegengeblieben: eine Einzelbehebung hätte den
Fingerprint einer bereits veröffentlichten Version verschoben. **Diese Runde
ändert ihn ohnehin** — also jetzt.

Danach meldet `node tools/publish.js --trocken` **keinen** Verweis mehr. Der
Satz in `Doku/Veroeffentlichen.md`, der die Stelle als bekannt offen führt,
fällt mit.

### BA 4 — Mehr als 40 Fotos auf einmal

**Gemeldet vom Betreiber am 18. September 2026 aus dem Betrieb, Stand 0.35.1.**
Er hatte es früher schon einmal bemerkt, bei „mehr als 60 oder vielleicht 80"
Bildern. **Das Containerprotokoll:**

```
MulterError: Unexpected field
  code: 'LIMIT_UNEXPECTED_FILE',
  field: 'photos',
```

**`server.js`:3115 nimmt die Fotos mit `upload.array('photos', 40)` an.** Multer
zählt je Feldnamen herunter und wirft beim 41. Bild
`LIMIT_UNEXPECTED_FILE` (`node_modules/multer/index.js`:40). Der Feldname im
Fehler ist `photos`, also der erwartete — es ist die Zahl und nicht der Name.

**Drei Dinge sind daran falsch:**

1. **Es geht alles verloren, nicht nur das über 40.** Multer bricht die ganze
   Anfrage ab, der Handler läuft nie, es wird kein einziges Foto gespeichert.
2. **Die Antwort ist englisch und intern.** Der Fehler-Handler
   (`server.js`:5462) fragt nach `err.key`; ein `MulterError` hat keinen und
   fällt auf `err.message` zurück. Am Bildschirm steht **„Unexpected field"**.
3. **Der Browser prüft beim Fotoweg gar nichts** — weder Zahl noch Größe
   (`public/app.js`:4336, `for (const f of images) fd.append('photos', f)`).

**Dieselbe Lücke trifft die Größe:** ein Foto über 30 MB gibt
`LIMIT_FILE_SIZE` und damit **„File too large"**, wieder englisch.

**Der Anhangsweg macht beides richtig, und das ist die Vorlage:**

| | Fotos | Anhänge |
|---|---|---|
| Zahl je Anfrage | **40, nackt in der Routenzeile** | `ATTACHMENT_COUNT = 20`, benannt |
| Absage bei zu vielen | **keine** — Multer bricht ab | `server.fileCap`, übersetzt |
| Größe je Datei | 30 MB, nackt in der Multer-Zeile | `ATTACHMENT_MAX = 50 MB`, benannt |
| Prüfung im Browser | **keine** | `public/app.js`:5430, `entry.tooBig` |

**Und eine Obergrenze JE EINTRAG gibt es bei Fotos gar nicht.** Die 40 ist nur
eine Schranke je Anfrage. Wer 80 Bilder hat, darf sie also haben — nur nicht
in einem Zug.

**Der Weg:**

* `PHOTO_COUNT = 40` und `PHOTO_MAX = 30 MB` als benannte Zahlen, neben
  `ATTACHMENT_COUNT`, `ATTACHMENT_MAX`, `IMAGE_COUNT`, `IMAGE_MAX` und
  `VIDEO_MAX`.
* **Der Browser schickt in Bündeln von `PHOTO_COUNT`.** Dann landen 80 Bilder
  in zwei Anfragen und der Betreiber merkt nichts. *Das ist der Punkt: die 40
  ist eine Schranke der Anfrage, keine Aussage über den Eintrag.*
* **Der Fehler-Handler übersetzt die Multer-Grenzen**, statt `err.message`
  durchzureichen. Das betrifft **fünf** Hochladewege mit ihren Grenzen:

  | Weg | je Datei | je Anfrage |
  |---|---:|---:|
  | Fotos | 30 MB | 40 |
  | Videos | 20 MB | 1 + 1 Standbild |
  | Anhänge | 50 MB | 20 |
  | Kommentarbilder | 20 MB | 6 |
  | Import | 900 MB | 1 |

  Zwei Schlüssel gibt es schon (`server.fileCap`, `server.imagesOnly`), für
  `LIMIT_FILE_SIZE` braucht es einen.
* **Die Zahl steht dann auch im Handbuch.** Heute steht die 40 nirgends —
  nicht in der README, nicht im Handbuch, in keinem Sprachschlüssel.

*`entry.tooBig` trägt die 50 MB als Text im Satz, während `ATTACHMENT_MAX` sie
als Zahl trägt — zwei Orte für dieselbe Zahl. Das fällt mit, wenn der Satz
ohnehin angefasst wird.*

### BA 5 — Das Containerprotokoll bekommt Zeitstempel

**Vorgabe des Betreibers am 18. September 2026:** ein Protokoll ohne
Zeitstempel ist schwer zu lesen.

**Heute trägt keine Zeile eine Zeit.** Es sind **51 Zeilen** mit `[Kriterion]`
in sechs Dateien: `server.js` 28, `batchrun.js` 8, `auth.js` 7, `db.js` 5,
`keys.js` 2, `images.js` 1. Ein Helfer, eine Stelle.

**`docker compose logs -t` setzt heute schon einen Zeitstempel davor**, in UTC.
Das kostet nichts und hilft sofort — aber ein Protokoll, dessen Zeit davon
abhängt, wie man es liest, hat keine.

**Der Weg:** ISO 8601 mit Versatz, `2026-09-18T08:21:03+02:00`. **Der Versatz
kommt aus `TZ`**, und `docker-compose.example.yml` setzt heute nur `PORT=3000`
— also läuft der Container auf UTC und der Versatz wäre immer `+00:00`.
**`TZ=Europe/Berlin` gehört in die Beispieldatei**, mit einem Satz daneben, was
es ändert.

> **DIE GESPEICHERTEN ZEITEN BLEIBEN UTC** — das Sicherheitsprotokoll, die
> Sicherungsnamen und `exported_at` schreiben `2026-09-18 06:21:03` und werden
> zwischen Installationen verglichen. **Nur das Containerprotokoll folgt `TZ`.**
> Dass beide verschieden aussehen, ist dann keine Unklarheit, sondern steht am
> Versatz: `+02:00` sagt, welche der beiden Uhren gemeint ist.

### BA 6 — Papiere

Änderungsprotokoll 0.35.2, CHANGELOG-Eintrag **mit Kasten** (siehe Abschnitt
7), Fahrplanzeile auf GEBAUT, Projektstand, `README.md`:760.

---

## 4. Zusagen an den Prüfstand

1. **BA 1 bis BA 3 ändern kein Verhalten außer dem, was ausgebaut wird.** Der
   volle Export, der Teilexport und der Papierkorb verhalten sich Byte für Byte
   wie vorher.
1a. **BA 4 ändert Verhalten, und zwar absichtlich:** wer heute 80 Fotos wählt,
   verliert alle und liest „Unexpected field"; danach landen sie. Jede neue
   Zusage steht namentlich im Protokoll.
1b. **BA 5 ändert das Containerprotokoll und sonst nichts.** Keine gespeicherte
   Zeit verschiebt sich.
2. Die Zahl der Prüfungen fällt — und zwar **namentlich**: jede weggefallene
   Prüfung steht im Protokoll.
3. Die Zahl der Rückbauten fällt um zwei und steigt um die des neuen Wächters.
   **1087 und 1088 fallen namentlich.**
4. Gegenprobenlauf über die neuen und die berührten Rückbauten, **0 stumm**.
5. Der Fingerprint ändert sich — erwartet.
6. Nach dem Lauf: `node tools/publish.js --trocken` meldet 0 Verweise auf
   `Doku/`.

---

## 5. Fragetafel — vor der ersten Zeile zu beantworten

| | Frage | Vorschlag |
|---|---|---|
| **F1** | **Ist ein Routenausbau eine PATCH-Runde?** 0.35.0 hat `GET /api/health` ausgebaut und war **MINOR**, mit Kasten im CHANGELOG | *offen.* Die Nummer 0.35.2 kommt vom Betreiber; die Frage gehört trotzdem gestellt |
| **F2** | **Fällt der tote `itemId`-Zweig in derselben Runde?** `exchangeParts()` und `exchangeEnvelopeBytes()` bekommen `itemId` danach nur noch als `null` — je ein `onlyOne`, `values`, `and()`, `wo()` und **11 Einsetzungen** in den Abfragen | *dafür:* er bleibt sonst liegen und die nächste Messung findet ihn wieder. *dagegen:* die Runde wächst von zwölf auf rund fünfzig Zeilen und fasst drei Abfragen an, die der volle Export braucht |
| **F3** | **Punkt 35** — Gegenprobe 330 reißt `public/app.js` ab, statt eine Prüfung rot zu machen. Laut Sammelblatt gehört sie der Runde, die `counterproof.js` anfasst, und das ist diese | *mitnehmen,* wenn F1 nicht dagegen spricht |
| **F4** | **Punkt 34** — der Grund eines gescheiterten Versands steht in der Sprache des Empfängers. `e.reason` entsteht in `mail.js` als fertiger Satz und müsste erst als Schlüssel reisen | *messen, bevor entschieden wird.* Ist es nicht klein, geht es in die Zeile ohne Nummer im Fahrplan |
| **F5** | **Bündeln oder absagen?** Der Browser kann bei mehr als `PHOTO_COUNT` Bildern in mehreren Anfragen schicken — oder absagen und es sagen | *bündeln.* Eine Obergrenze je Eintrag gibt es nicht; die 40 ist eine Schranke der Anfrage. Absagen hieße, eine Grenze zu erfinden, die es nicht gibt. **Die übersetzte Absage wird trotzdem gebaut** — sie fängt jeden anderen Weg zur Route |
| **F6** | **Folgt das Containerprotokoll `TZ`, oder bleibt alles UTC?** | *`TZ` folgen, gespeicherte Zeiten bleiben UTC.* `TZ=Europe/Berlin` in `docker-compose.example.yml`. Ohne `TZ` steht dort `+00:00` und der Versatz sagt es selbst |

---

## 6. Was geschlossen wird

**Punkt 36 des Sammelblatts — der türkische Genitiv.** Entschieden vom
Betreiber am 17. September 2026:

> „OK den Punkt lassen wir so wie du empfiehlst."

Alle sechs Stellen mit izafet sind nebeneinander gehalten worden. Die beiden
Tagstellen tragen die belirtisiz izafet, und das ist richtig: dem Tag gehört
nichts, er selbst wird entfernt. Der Genitiv würde die Bedeutung ändern.
**Kein Befund, keine Änderung, der Punkt ist zu.**

---

## 7. Was verworfen wird

| | was | warum |
|---|---|---|
| **V1** | **Nur den Knopf ausbauen und die Route lassen** | das führte auf den Stand vor 0.35.0 zurück — eine Route ohne Rufer, die die nächste Messung wieder findet. *Entscheidung des Betreibers: die Route geht mit* |
| **V2** | **Den Einzelexport behalten und stattdessen das Handbuch erweitern** | die Frage war, welchen Nutzen das Projekt davon hat. Es hat keinen |
| **V3** | **Punkt 33** — die Startzeile nennt `server.backupDirNotSet` statt eines Satzes | laut Sammelblatt gehört er der Runde, die `backupState()` anfasst. Diese Runde fasst es nicht an |
| **V4** | **Punkt 38** — die Kurzform der Zählzeile in der Kachel | Oberfläche, und im Sammelblatt steht „erst messen, dann entscheiden". Gemessen ist nichts |
| **V5** | **Punkt 27** — der Aufräumer des Prüfstands auf mehreren Spuren | `testbench.js`, und die vierte Zählung vom 17. September 2026 steht erst seit heute da. Eine eigene Runde, keine Mitnahme |

**V3 bis V5 sind nicht erledigt, sondern nicht in dieser Runde.** Sie stehen im
Fahrplan in der Zeile ohne Nummer und bleiben im Sammelblatt offen.

---

## 8. Was ein Betreiber wissen muss

**Wer `GET /api/items/:id/export` in einem Skript stehen hat, bekommt danach
404.** Das gehört als Kasten in den CHANGELOG, so wie bei `GET /api/health` in
0.35.0.

**Und: `TZ` entscheidet ab dieser Runde, welche Zeit im Containerprotokoll
steht.** Ohne `TZ` ist es UTC, wie bisher. Die gespeicherten Zeiten ändern sich
nicht.

---

## 9. Wie diese Runde gefahren wird

Die Runde ist klein genug für **einen Schreiber und einen Lauf je
Bauabschnitt**. Kein Fächer, keine Entwurfsrunde.

| Phase | Form |
|---|---|
| **Vorlauf** | die Suchtexte der 1.036 Rückbauten gegen ihre Dateien halten, **bevor** etwas fällt — derselbe Abgleich, der in 0.35.1 drei stumme Rückbauten gefunden hat |
| **BA 1 bis BA 5** | je ein Schreiber, je ein voller Lauf, je ein Commit |
| **BA 4 zuerst** | er ist der einzige, der einen Fehler behebt, den der Betreiber heute hat |
| **Gegenproben** | `counterproof.js` über die neuen und die berührten, zwei Spuren |
| **Vor dem Push** | `npm test` vollständig, das Ergebnis wird genannt |
