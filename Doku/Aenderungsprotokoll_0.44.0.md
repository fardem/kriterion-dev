# Änderungsprotokoll 0.44.0 — „Verweise auf Dateien und Fotos"

**Gebaut am 27. September 2026 auf 0.43.2. Fingerprint `37520fc0`, davor
`0c19372c`.**

Nach dem Abschnitt 0.44.0 im Fahrplan, beschlossen am 26. September 2026.
Schema: ja, eine neue Tabelle. Austauschformat: 20, unverändert.

---

## 1. Die Fragetafel, nach dem ersten Bau

Die Fragetafel ist nicht vor der ersten Zeile vorgelegt worden, sondern nach
dem ersten Bau (Commit `14a9b02`). Der Abschnitt im Fahrplan hatte keine Liste
offener Fragen; der erste Bau hat die offenen Punkte selbst entschieden. Der
Betreiber hat danach am 27. September 2026 geantwortet. F1 und F8 bis F11
haben den Bau geändert, F2 bis F7 bestätigen ihn.

| Frage | Antwort | Folge |
|---|---|---|
| F1. Vorschaubild einer Bilddatei | eine gespeicherte Kachel | neue Tabelle `attachment_thumbs`; vorher lud die Marke die ganze Datei |
| F2. „Link kopieren“ an welchen Dateien | an jeder | die eigene Ansicht zeigt jede Art |
| F3. Klick auf die Marke einer Bilddatei | eigene Ansicht der Datei | wie gebaut |
| F4. Adresse nach dem Öffnen eines Fotos | `#/item/<Eintrag>` | wie gebaut |
| F5. Offener kleiner Betrachter beim Neuzeichnen | schließt sich | wie gebaut |
| F6. Die fünf neuen Texte | bleiben | wie gebaut |
| F7. Mehr als 200 Verweise auf Kommentare | in 0.44.0 behoben | wie gebaut |
| F8. Kachel für Bilddateien im Bestand | beim ersten Abruf | neue beim Hochladen |
| F9. Kachel in Export, Import und Papierkorb | nein | Austauschformat bleibt 20 |
| F10. Größe der Kachel | wie die Fotokachel | 512 × 512 aus der Mitte, WebP 82 |
| F11. Kachel in der Dateizeile | ja | statt des Zeichens ▣ |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.43.2.

| | 0.43.2 | 0.44.0 |
|---|---:|---:|
| Tabellen der Datenbank | 32 | **33** |
| Schlüssel je Sprachdatei | 1.224 | **1.229** |
| Regelzeilen des Stilblatts | 1.700 | **1.719** |
| Zuweisungen an `innerHTML` in `public/app.js` | 182 | **184** |
| Kommentarzeilen | 6.521 in 40 Dateien | **6.561 in 41** |
| Dateien des Prüfstands samt `counterproof.js` | 24 | **25** |
| Rückbauten | 1.190 | **1.215** |
| Prüfungen im Prüfstand | 7.476 | **7.526** |

---

## 3. Was gebaut ist

**Schema, `db.js`.** Eine Tabelle, keine neue Spalte. `CREATE TABLE IF NOT
EXISTS` legt sie auch in bestehenden Datenbanken an.

| Tabelle | Spalten | Zweck |
|---|---|---|
| `attachment_thumbs` | `attachment_id`, `thumb` | Kachel einer Bilddatei; `thumb` ist `NULL`, wenn `sharp` die Datei nicht lesen kann |

Sie hängt mit `ON DELETE CASCADE` an `attachments`.

**`images.js`.** `makeVariants()` nimmt als dritten Wert die Namen der
Varianten; ohne ihn entstehen beide wie bisher. Die Kachel einer Bilddatei
entsteht mit `makeVariants(bytes, DEFAULT_CROP, ['thumb'])`, also wie die
Fotokachel: 512 × 512 aus der Mitte, WebP 82.

**`server.js`.**

- `POST /api/items/:id/attachments` rechnet die Kachel jeder Bilddatei
  (`previewKind()` ist `image`), bevor es prüft und schreibt. Zwischen der
  Prüfung der Dateizahl und dem Schreiben liegt so kein `await`.
- `GET /api/attachments/:id/raw?size=thumb` liefert die Kachel. Fehlt die
  Zeile, entsteht sie beim ersten Abruf und wird gespeichert. Keine Bilddatei,
  keine Kachel oder keine Datei: 404. Ausgeliefert über `setImageHeader()` mit
  `nosniff`, Sandbox und `Cache-Control: private, max-age=604800`; der Inhalt
  einer Bilddatei ändert sich nicht.
- Export, Import und Papierkorb lesen und schreiben die Tabelle nicht. Nach
  Import oder Zurückholen entsteht die Kachel beim ersten Abruf.
- `GET /api/comment-refs` hat zwei neue Abfrageparameter, je höchstens 200
  Nummern wie `ids` und `items`:

| Parameter | Schlüssel | Felder |
|---|---|---|
| `files` | `f<Datei>` | `id`, `itemId`, `itemTitle`, `filename`, `preview` |
| `photos` | `p<Foto>` | `id`, `itemId`, `itemTitle`, `kind`, `thumbLength` |

`preview` entsteht wie in `detail()`: `office` nur mit eingeschaltetem
Document Server, sonst `image`, `pdf`, `text`, `docx` oder `keine`. Was es
nicht gibt, fehlt in der Antwort; der Browser zeigt es als „gelöscht“.

Die Frage nach dem Foto liest `kind` und `length(thumb)` aus dem Index
`idx_photos_tile`. Über den Primärschlüssel läse SQLite die Zeile bis hinter
`thumb` und `medium`. `+p.id` hält den Planer vom Primärschlüssel fern.

| gemessen: 336 MB, 400 Fotos, 200 Verweise | Zeit |
|---|---:|
| über die Zeile (`WHERE p.id = ?`) | 17,1 ms |
| über `idx_photos_tile` | 1,5 ms |

**Browser.**

- `markupRefOf()` erkennt `#/item/<Eintrag>/file/<Datei>` (auch mit `/edit`)
  als `f<Datei>` und `#/item/<Eintrag>/photo/<Foto>` als `p<Foto>`.
- `markupRefLoad()` fragt je Art höchstens 200 Schlüssel. Vorher waren es 400
  zusammen; der Server beantwortete davon 200 je Art, und der Rest stand als
  „gelöscht“ da.
- Marken:

| Verweis auf | Marke | Klick |
|---|---|---|
| Datei für den Document Server | Zeichen ▥ und Dateiname | klappt darunter einen Betrachter von 360 px auf, ein zweiter Klick schließt ihn; ⤢ im Kasten führt zur eigenen Ansicht. Auf dem Telefon: eigene Ansicht |
| Bilddatei | Kachel aus `?size=thumb`; ohne Kachel ▣ und Dateiname | eigene Ansicht |
| andere Datei | Zeichen wie in der Dateizeile und Dateiname | eigene Ansicht |
| Foto oder Video | Fotokachel `?size=thumb&v=<thumbLength>`, beim Video ▶ | Vollbild an diesem Foto; im selben Eintrag ohne neue Adresse |

  Der Titel der Marke nennt den Eintrag. Ein eigener Name aus `[Name](Adresse)`
  steht statt des Dateinamens, beim Bild neben der Kachel.
- Die Dateizeile zeigt bei einer Bilddatei die Kachel (`.athumb`, 28 px)
  statt ▣. Lädt sie nicht, steht wieder ▣ da.
- Der kleine Betrachter fragt `/api/attachments/<Datei>/office?mobile=1&edit=0`.
  `viewerConfig()` in `docserver.js` setzt für `mobile=1` schon
  `type: 'embedded'` und signiert es; der Server bleibt dafür unverändert.
  Offene Betrachter stehen in `REF_VIEWERS`; `route()` baut alle ab, ein neuer
  baut die ab, deren Kasten eine Zeichnung entfernt hat.
- Neue Adresse `#/item/<Eintrag>/photo/<Foto>`: `route()` ruft
  `renderDetail()` mit dem Foto, die Adresse wird zu `#/item/<Eintrag>`, dann
  öffnet `showPhoto()` das Vollbild. Ein unbekanntes Foto öffnet nur den
  Eintrag.
- „Link kopieren“ (`ICON_LINK`) in jeder Dateizeile (`.alink`) und im Vollbild
  eines Fotos (`.lb-btn.copy`, vor ↓). Kopiert wird die volle Adresse. Das
  Vollbild eines Kommentarbilds hat den Knopf nicht; es hat keine Adresse.
- Die eigene Ansicht einer Datei zeigt jetzt jede Art. `filePreview()` und
  `textPreview()` stehen dafür außerhalb von `renderDetail()` und dienen
  Eintrag und Ansicht. Ohne Vorschau steht `entry.noPreview` da. Vorher stand
  bei jeder Datei, die nicht über den Document Server lief,
  `entry.officeFailed`.
- Ein Klick in den kleinen Betrachter in der Beschreibung öffnet nicht das
  Feld (`descView.onclick` übergeht `.markup-viewer`).

**Texte.** Fünf Schlüssel je Sprache: `entry.copyLink`,
`entry.copyFileLink`, `entry.noPreview`, `entry.refFileHint`,
`entry.refOfficeHint`. Das Handbuch nennt „Link kopieren“ bei Fotos und
Dateien, die Kachel in der Dateizeile und den Verweis auf eine Datei oder ein
Foto bei den Kommentaren.

---

## 4. Entscheidungen beim Bauen

Was die Fragetafel nicht abdeckt:

| Frage | Entscheidung | Grund |
|---|---|---|
| Bilddatei, die `sharp` nicht lesen kann | Zeile mit `thumb` `NULL`; Marke und Dateizeile zeigen ▣ | Ohne Zeile rechnete jeder Abruf erneut. BMP steht in der Liste der Bilder, `sharp` liest es nicht |
| Wann die Kachel beim Hochladen entsteht | vor allen Prüfungen | Sonst läge ein `await` zwischen der Prüfung der Dateizahl und dem Schreiben; zwei gleichzeitige Uploads kämen über 20 Dateien |
| `embedded` für den kleinen Betrachter | über `mobile=1` | Der Server setzt `type` im signierten Teil der Konfiguration. Ein eigener Parameter hätte dasselbe getan |
| Adresse mit `/edit` | wird zur Marke wie die Ansicht | Wer die Adresse aus der Leiste des Editors kopiert, bekommt dieselbe Marke; sie führt zur Ansicht, nicht in den Editor |
| Foto im selben Eintrag | Vollbild ohne Hash-Wechsel | Wie beim Verweis auf einen Kommentar; ein Hash-Wechsel baute den ganzen Eintrag neu auf |
| Titel der Marke | Hinweis und Titel des Eintrags | Die Datei kann zu einem anderen Eintrag gehören |
| Kommentargrenzen | mit `node tools/comments.js --write` angehoben: `public/app.js` 995 → 1.014, `server.js` 873 → 882, `public/style.css` 510 → 513, `images.js` 12 → 13 | Laden erst auf Klick, `pre-wrap` um den Kasten, der Index für die Frage nach dem Foto mit gemessenen Werten, die Kachel beim ersten Abruf und vor den Prüfungen |

---

## 5. Der Prüfstand

`test/release_044.js`, 50 Prüfungen in fünf Gruppen. Die ersten beiden starten
eine eigene Instanz auf der Portbasis 7340, wie `release_041` bis
`release_043`, und laden fünf Dateien, ein Foto und ein Video hoch.
`kaputt.png` trägt die Endung eines Bildes, aber keine Bilddaten.

| Gruppe | Prüfungen |
|---|---:|
| Verweise auf Dateien: die Auskunft des Servers | 9 |
| Verweise auf Dateien: die Kachel einer Bilddatei | 8 |
| Verweise auf Dateien: Marken im Browser | 17 |
| Verweise auf Dateien: Adresse des Fotos und Link kopieren | 9 |
| Verweise auf Dateien: die eigene Ansicht jeder Datei | 7 |

Angepasst:

- `test/roundtrip.js`: 33 Tabellen.
- `test/source.js`: 1.719 Regelzeilen, 184 Zuweisungen an `innerHTML`, 25
  Dateien des Prüfstands, 41 Dateien in der Kommentarzählung.
- `test/selfcheck.js`: 1.215 Rückbauten, die Kommentargrenzen, 41 Dateien.
- `test/ui_style.js`: im Vollbild steht `copy` vor `download`.
- `test/ui_language.js`: `'&items='` entfällt aus der Restprobe; die Abfrage
  entsteht über `URLSearchParams`.
- `test/frame.js`: die Beschreibung von `/api/comment-refs` nennt den
  Dateinamen. Rückbau 1179 sucht den neuen Wortlaut.
- `counterproof.js`: 1137 und 1166 suchen die neuen Zeilen in
  `markupRefOf()` und `markupRefLoad()`.

Rückbauten:

| Nr | Rückbau | erwartet in |
|---|---|---|
| 1271 | Der Server kennt am Verweis keine Dateien | Auskunft des Servers |
| 1272 | Die Frage nach dem Foto liest wieder die ganze Zeile | Auskunft des Servers |
| 1273 | Die Bürodatei heißt am Verweis nie office | Auskunft des Servers |
| 1274 | Eine Art verdrängt wieder die andere | Marken im Browser |
| 1275 | Die Adresse einer Datei wird wieder keine Marke | Marken im Browser |
| 1276 | Der Betrachter lädt schon beim Zeichnen | Marken im Browser |
| 1277 | Der kleine Betrachter kommt als Desktop | Marken im Browser |
| 1278 | Ein zweiter Klick öffnet einen zweiten Betrachter | Marken im Browser |
| 1279 | Das Verlassen des Eintrags lässt den Betrachter stehen | Marken im Browser |
| 1280 | Die Bilddatei im Verweis bekommt kein Vorschaubild | Marken im Browser |
| 1281 | Das Video im Verweis trägt kein Zeichen | Marken im Browser |
| 1282 | Die Adresse des Fotos öffnet kein Vollbild | Adresse des Fotos und Link kopieren |
| 1283 | Der Klick auf das Foto baut den Eintrag wieder neu auf | Adresse des Fotos und Link kopieren |
| 1284 | Das Vollbild hat keinen Knopf Link kopieren | Adresse des Fotos und Link kopieren |
| 1285 | Link kopieren in der Dateizeile kopiert den Eintrag | Adresse des Fotos und Link kopieren |
| 1286 | Die eigene Ansicht zeigt nur Dateien für den Document Server | die eigene Ansicht jeder Datei |
| 1287 | Ein Klick in den Betrachter öffnet das Feld der Beschreibung | Marken im Browser |
| 1288 | Das Hochladen legt keine Kachel an | die Kachel einer Bilddatei |
| 1289 | Der erste Abruf legt die Kachel nicht ab | die Kachel einer Bilddatei |
| 1290 | Die Kachel ist nicht aus der Mitte beschnitten | die Kachel einer Bilddatei |
| 1291 | Jede Datei bekommt beim Abruf eine Kachel | die Kachel einer Bilddatei |
| 1292 | Marke und Dateizeile laden wieder die ganze Datei | Marken im Browser |
| 1293 | Ohne Kachel bleibt die Marke leer | Marken im Browser |
| 1294 | Die Dateizeile zeigt wieder nur das Zeichen | Adresse des Fotos und Link kopieren |
| 1295 | Ohne Kachel bleibt das Feld in der Dateizeile leer | Adresse des Fotos und Link kopieren |

Nicht gebaut: ein Rückbau für `e.stopPropagation()` am Knopf in der
Dateizeile. `row.onclick` übergeht `.alink` zusätzlich; jeder der beiden Wege
allein hält die Zeile zu, der Rückbau bliebe stumm. Beim Zeichen der
Schreibrechte (`.arights`) ist es dasselbe.

---

## 6. Nicht geprüft und offen

Die Bauumgebung erreicht `office.dmrts.de` nicht. Offen für die Abnahme mit
Euro-Office:

- ob der eingebettete Betrachter in 360 px Höhe lesbar ist;
- ob mehrere offene Betrachter auf einer Seite einander stören.

Offen im Browser:

- Die Auskunft zu einem Verweis bleibt bis zum Neuladen der Seite gespeichert,
  wie beim Verweis auf einen Kommentar. Eine inzwischen gelöschte Datei
  erscheint so lange mit Namen, die Ansicht meldet dann `server.fileGone`.

Nicht gebaut: Die Karte „Kennzahlen“ nennt die Kacheln der Bilddateien nicht
eigens. Ihre Größe steckt nur in der Größe der Datenbank.
