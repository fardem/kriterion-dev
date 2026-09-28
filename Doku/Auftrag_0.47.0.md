# Auftrag 0.47.0 — „Ordner“

**Erteilt am 28. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. Grundlage sind `Doku/Konzept_Dateien_und_Ordner.md`,
Version 2, und der Eintrag 0.47.0 in `Doku/Fahrplan.md`. Vor der ersten Zeile
Code werden die Fragen aus Abschnitt 0 in einer Fragetafel gestellt.

Zeilennummern gelten für `d239dae` (0.46.0).

---

## 0. Vor dem Bau: die offenen Fragen

| Nr. | Frage | Antworten | Empfehlung |
|---|---|---|---|
| C1 | Wie wählt man bei „Verschieben nach …“ das Ziel? | a) Das Menü zeigt an seiner Stelle die Ziele: „Ohne Ordner“, die eigenen Ordner und „Zurück“ · b) ein Dialog mit einer Auswahlliste und „Verschieben“ | **a)**: Es ist dasselbe Bauteil (`openFileMenu()`, `app.js:4741`), am Telefon am unteren Rand, mit ↑ ↓ Enter Esc. Ein Dialog wäre ein zweites Bauteil mit eigener Tastenführung. |
| C2 | Ein Ordner wird gelöscht, während Dateien in ihn hochgehen oder warten. Was geschieht mit ihnen? | a) ⚠ mit „Diesen Ordner gibt es nicht mehr.“; im Menü nur „Entfernen“ · b) sie gehen ohne Rückfrage zu den Dateien ohne Ordner | **a)**: Keine Datei landet an einer Stelle, die niemand gewählt hat. Der Fall ist selten: Löschen in einem zweiten Tab oder durch den Admin. |
| C3 | Wo steht eine verschobene Datei im Ziel? | a) nach der Zeit ihres Uploads, wie jede Datei (`sort_order` bleibt) · b) am Ende des Ziels | **a)**: Dateien haben keine Reihenfolge von Hand (Konzept, Abschnitt 8). Mit b) änderte das Verschieben auch die Reihenfolge im Export. |
| C4 | Wohin führt ✕ in der eigenen Ansicht einer Datei? | a) zum Eintrag wie „← Titel“: Der Block „Dateien“ steht offen, die Kachel der Datei hat den Fokus · b) zum Eintrag, und unter der Gruppe steht die Vorschau dieser Datei offen | **a)**: Beide Zeichen der Leiste führen an dieselbe Stelle. Mit b) lädt der Document Server die Datei für die Vorschau noch einmal. |

Alle übrigen Punkte sind entschieden (Abschnitt 3).

---

## 1. Das Ziel

- Die Dateien eines Eintrags lassen sich in benannten Ordnern gruppieren. Oben
  stehen die Dateien ohne Ordner, darunter die Ordner, neueste oben.
- Beim Öffnen eines Eintrags sind alle Ordner zu. Ein Ordnerkopf zeigt Name,
  Zahl und Größe der Dateien, bei mehreren Accounts den Verfasser.
- „Ordner hinzufügen“ steht im Kopf des Blocks. In einen eigenen Ordner lädt man
  über sein „+“ oder durch Ablegen.
- „Verschieben nach …“ steht im Menü jeder eigenen Datei.
- Ein Ordner lässt sich umbenennen und löschen; seine Dateien stehen danach
  ohne Ordner.
- Export (Format 21), Import und Papierkorb tragen Ordner und Zuordnung. Der
  Export trägt dazu Standbild und Dauer eines Videos (Vorgabe F9).
- In der eigenen Ansicht einer Datei steht oben rechts ✕ „Schließen“, beim
  Ansehen wie beim Bearbeiten.

---

## 2. Der Anlass

| Anlass | Stand am 28. September 2026 |
|---|---|
| Block „Dateien“ | ein Kachelraster ohne Gruppen (`#atts`, `app.js:5152`; `drawAtts()`, `app.js:6641`) |
| Hochladen | `POST /api/items/:id/attachments` (`server.js:3672`) kennt kein Ziel und steht in `F_ROUTES` als „offen“ |
| Eintrag | `detail()` (`server.js:2609`) liefert keine Ordner |
| Menü | `fileMenu()` (`app.js:6685`) hat kein „Verschieben nach …“; `openFileMenu()` (`app.js:4741`) kennt eine Ebene |
| Vollbild | `showFile()` (`app.js:6738`) blättert durch alle Bilder und Videos des Blocks |
| Export | Format 20 (`EXCHANGE_FORMAT`, `server.js:4489`): ohne Ordner, ohne Standbild (`entryAsBundle()`, `server.js:4598`) |
| Import | `importPrepare()` (`server.js:5157`) kennt keine Ordner |
| Account löschen | `countInventory()` und `removeUser()` (`auth.js:310`, `:333`) zählen und löschen keine Ordner; `assignInventory()` (`db.js:702`) kennt sechs Tabellen |
| Löschdialog des Eintrags | `GET /api/items/:id/inventory` (`server.js:3441`) zählt keine Ordner |
| Handbuch | „Wer was darf“ (`manual-de.md:205-230`) nennt weder Ordner noch das Vorschaubild eines Videos |
| Eigene Ansicht einer Datei | Die Leiste (`renderFileView()`, `app.js:7495-7504`) hat „← Titel“, aber kein ✕; der Kopf der Vorschau hat eins (`app.js:6791`) |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 27./28. September 2026 | Lose Dateien oben, darunter aufklappbare Ordner mit Kacheln (Konzept, Anhang B, Nr. 9) |
| 27./28. September 2026 | Die Gruppen heißen „Ordner“ (Nr. 10) |
| 27./28. September 2026 | „Ordner hinzufügen“ im Kopf des Blocks, hochgeladen wird über „+“ im Ordner (Nr. 11) |
| 27./28. September 2026 | Beim Öffnen eines Eintrags sind alle Ordner zu (Nr. 14) |
| 27./28. September 2026 | Ein Menü ⋯ an jeder Kachel und jedem Ordner, immer sichtbar (Nr. 16) |
| 27./28. September 2026 | Ordner löschen: Die Dateien darin werden lose Dateien (Nr. 17) |
| 27./28. September 2026 | Nur neue Tabellen (Nr. 19) |
| 28. September 2026 | F4: In einen Ordner lädt nur, wer ihn angelegt hat; ohne Ordner lädt jeder Account hoch |
| 28. September 2026 | F5: Die Vorschau steht unter den Kacheln ihrer Gruppe, höchstens eine im Block |
| 28. September 2026 | F7: Adresse und Marke einer Bild- oder Videodatei öffnen das Vollbild; danach steht ihr Ordner offen |
| 28. September 2026 | F9: Vorschaubild und Dauer eines Videos in Papierkorb, Export und Import; Export und Import mit Format 21 in 0.47.0 |
| 28. September 2026 | Das ✕ aus dem Kopf der Vorschau auch in der eigenen Ansicht einer Datei, auch wenn sie zum Bearbeiten geöffnet ist (zwei Bildschirmfotos des Betreibers) |

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.47.0**, MINOR. Schema: ja, zwei neue Tabellen. Austauschformat: 20 → 21 |
| Tabellen | `folders` und `attachment_folders` (BA 1); `folders.test_day_id` entsteht jetzt und bleibt leer, die Zuweisung kommt mit 0.48.0 |
| Routen | Vier neue (BA 2). `POST /api/items/:id/attachments` nimmt `folderId` an |
| Rechte | nach Konzept, Abschnitt 4: anlegen jeder Account; umbenennen und in ihn hochladen nur, wer den Ordner angelegt hat (`selfOnly`, auch kein Admin); löschen er und der Admin (`mayChange`); verschieben nur eine eigene Datei, in einen eigenen Ordner oder nach „Ohne Ordner“ |
| Name | Pflicht, 1 bis 80 Zeichen nach `trim()`; gleiche Namen sind erlaubt |
| Reihenfolge | Ordner nach `created_at`, neueste oben, bei gleicher Zeit die höhere Nummer oben; die Dateien darin wie heute nach `sort_order` |
| Offen oder zu | beim Öffnen eines Eintrags alle zu. Offen stehen danach: ein neu angelegter Ordner, der Ordner der Datei aus einer Adresse oder Marke, der Ordner der Datei nach der Rückkehr aus ihrer eigenen Ansicht, ein Ordner nach dem Ablegen darauf. Die offenen Ordner hält eine Modulvariable `{ itemId, open }` neben `fileReturn` (`app.js:7466`); sie überstehen die Rückkehr aus der eigenen Ansicht. `BLOCKS` speichert sie nicht |
| Ordnerkopf | ein Knopf aus ▸/▾, 📁, Name und „3 Dateien · 1,7 MB“, bei mehreren Accounts „· anna“, leer „leer“; `aria-expanded`. Daneben ⋯, nur wenn ein Eintrag darin erlaubt ist. Zugeklappt zeigt er die Zustandsecke seiner Uploads zusammengefasst: ⚠ vor Ring vor „wartet“ |
| „+“ | am Ende der Dateien ohne Ordner und jedes eigenen Ordners; in einem fremden Ordner nicht |
| Ablegen | auf dem Block außerhalb eines Ordners: ohne Ordner. Auf Kopf oder Raster eines eigenen Ordners: in ihn, er klappt auf. Auf einem fremden Ordner: Toast mit Grund, nichts geht hoch |
| Menü einer Datei | neu „Verschieben nach …“, wenn die Datei eigene ist und es mindestens ein Ziel gibt (C1) |
| Menü eines Ordners | „Bearbeiten …“ (Verfasser), „Ordner löschen“ (Verfasser, Admin). „Link kopieren“ kommt mit der Adresse eines Ordners in 0.48.0 |
| Ordner löschen | mit Dateien die Rückfrage „Die 3 Dateien darin bleiben erhalten und stehen danach bei den Dateien ohne Ordner.“; ein leerer ohne Rückfrage |
| Vorschau | höchstens eine im Block, unter dem Raster ihrer Gruppe. Sie schließt beim Zuklappen ihres Ordners und wenn ihre Datei verschoben oder gelöscht wird. Im DOM wird sie nie verschoben, weil ein `iframe` dabei neu lädt |
| Vollbild | ← → blättern durch Bilder und Videos der Gruppe |
| Export | Format 21: je Eintrag `folders` (`name`, `author`, `created_at`), je Datei `folder` als Stelle in diesem Feld, je Video mit Standbild `still_base64` und `duration`. Kein Testtag |
| Import | Format 21: Ordner mit Name und Verfasser, Zuordnung nach der Stelle; eine ungültige Stelle ergibt eine Datei ohne Ordner. Ältere Formate: alle Dateien ohne Ordner. Das Standbild liest er wie in 0.46.0 |
| Papierkorb | Der Umschlag trägt Ordner und Zuordnung wie der Export; Standbilder wie in 0.46.0 |
| Größe des Exports | Standbilder zählen in `entryTooLarge()` und in der Schätzung der Karte mit |
| Account löschen | `countInventory()` zählt `folders` (seine an fremden Einträgen) und `foreignFolders` (fremde an seinen). `removeUser()` löscht mit „Beiträge“ seine Ordner an fremden Einträgen; die Dateien darin stehen danach ohne Ordner. `assignInventory()` bekommt `folders` als siebte Tabelle |
| Löschdialog des Eintrags | `GET /api/items/:id/inventory` zählt `ownFolders` und `foreignFolders`; der Dialog nennt sie |
| Upload in einen gelöschten Ordner | nach C2 |
| Verschobene Datei | nach C3 |
| ✕ in der eigenen Ansicht | letztes Zeichen der Leiste, hinter ↓; `ICON_X`, Titel und `aria-label` „Schließen“ (`list.close`). In jeder eigenen Ansicht: Ansehen, Bearbeiten, Datei ohne Vorschau, auch am Telefon. Ziel nach C4. Keine Rückfrage: Der Document Server speichert wie nach „← Titel“. Kein Esc: Steht der Fokus im Dokument, gehen die Tasten an den Document Server und erreichen Kriterion nicht |

---

## 4. Die Bauabschnitte

### BA 1 — Schema

- `folders`: `id` INTEGER PRIMARY KEY, `item_id` → `items` mit `ON DELETE
  CASCADE`, `name` TEXT NOT NULL, `user_id` → `users` mit `ON DELETE SET NULL`,
  `created_at` wie in `attachments`, `test_day_id` UNIQUE → `test_days` mit
  `ON DELETE SET NULL`. Index auf `item_id`.
- `attachment_folders`: `attachment_id` PRIMARY KEY → `attachments`,
  `folder_id` → `folders`, beide mit `ON DELETE CASCADE`. Keine Zeile heißt:
  ohne Ordner. Index auf `folder_id`.
- Beide entstehen beim Start mit `db.exec(SCHEMA)`, ohne Migration.

### BA 2 — Routen

| Route | Wer | Was |
|---|---|---|
| `POST /api/items/:id/folders` | jeder Account | `{ name }`; 201 mit dem Eintrag |
| `PUT /api/folders/:id` | wer ihn angelegt hat, auch kein Admin | `{ name }`; ein Feld `testDay` ergibt 400 und ändert nichts |
| `DELETE /api/folders/:id` | wer ihn angelegt hat, Admin | Die Dateien stehen danach ohne Ordner |
| `PUT /api/attachments/:id/folder` | wem Datei und Zielordner gehören | `{ folderId }` oder `{ folderId: null }`; Datei und Ordner am selben Eintrag |

- `POST /api/items/:id/attachments` nimmt das Feld `folderId` an: nur ein
  eigener Ordner desselben Eintrags, sonst 403; ein unbekannter Ordner 404.
  Das Feld steht im Formular, geprüft wird also nach multer, zwischen Prüfung
  und `INSERT` ohne `await`.
- Alle vier und die geänderte Route antworten mit `detail()`.
- `detail()` liefert `folders` (`id`, `name`, `created_at`, `mine`, `author`)
  und je Datei `folder` (Nummer oder `null`).

### BA 3 — Export, Import, Papierkorb

- `EXCHANGE_FORMAT` 20 → 21. `entryAsBundle()` schreibt `folders` und je Datei
  `folder`; die Export-Abfrage liest `duration` und `still` aus
  `attachment_stills`.
- `importPrepare()` liest `folders` und `folder`, wenn sie dastehen; Verfasser
  wie bei Dateien über `authorId()`.
- Der Papierkorb braucht keine neue Kopieranweisung: Ordner haben keine Bytes.
- `entryTooLarge()` und die Schätzung der Karte „Export und Import“ zählen die
  Standbilder mit.

### BA 4 — Account und Löschdialoge

- `countInventory()`, `removeUser()` und `assignInventory()` wie in Abschnitt 3.
  `usertool.js` nutzt dieselben Funktionen.
- Der Dialog „Account löschen“ nennt die Ordner unter den Beiträgen und unter
  den fremden Beiträgen an seinen Einträgen; der Löschdialog des Eintrags nennt
  eigene und fremde Ordner.

### BA 5 — Block „Dateien“ mit Ordnern

- `drawAtts()` zeichnet je Gruppe ein Raster: zuerst die Dateien ohne Ordner,
  dann die Ordner. Kacheln werden weiter nach Nummer aktualisiert; eine Datei,
  die die Gruppe wechselt, zieht in das Raster ihres Ordners um.
- Ordnerkopf, „+“, Reihenfolge, Offen oder zu, Zusammenfassung der Uploads wie
  in Abschnitt 3. Ein leerer eigener Ordner zeigt „+“, ein leerer fremder nur den
  Kopf mit „leer“.
- „Ordner hinzufügen“ im Kopf des Blocks öffnet `nameBox()` (`app.js:364`) mit
  höchstens 80 Zeichen und einem eigenen Platzhalter; der neue Ordner steht
  offen.
- Die Vorschau hängt unter dem Raster ihrer Gruppe. `showFile()` sammelt nur die
  Bilder und Videos dieser Gruppe.
- Adresse und Marke einer Datei in einem Ordner öffnen das Vollbild; der Ordner
  steht danach offen.

### BA 6 — Die Menüs

- `openFileMenu()` bekommt eine zweite Ebene für die Ziele (C1). Der Kopf nennt
  weiter die Datei; „Zurück“ führt zur ersten Ebene, Esc schließt.
- „Verschieben nach …“ ruft `PUT /api/attachments/:id/folder`. Danach steht die
  Kachel in ihrer neuen Gruppe, der Zielordner klappt auf, eine offene Vorschau
  dieser Datei schließt, der Fokus geht zur Kachel.
- Das Menü eines Ordners hängt an seinem ⋯. „Bearbeiten …“ öffnet `nameBox()`
  mit dem Namen; „Ordner löschen“ fragt nach, wenn Dateien darin sind.

### BA 7 — Hochladen in einen Ordner

- Die Warteschlange (`queueUploads()`, `app.js:4842`) trägt je Upload
  `folderId`; `uploadSend()` hängt es an das Formular.
- Der Browser prüft vorher, ob der Ordner eigener ist; auf einem fremden Ordner
  geht nichts hoch.
- Antwortet der Server mit „Diesen Ordner gibt es nicht mehr.“, gilt C2.

### BA 8 — ✕ in der eigenen Ansicht

- `renderFileView()` setzt hinter ↓ ein ✕ mit der Klasse `fileview-close` und
  dem Stil von `.fileview-full`, in jeder Art der Ansicht.
- C4 a): ein Link auf `entryAddress(itemId)` wie „← Titel“; `fileReturn` gibt
  der Kachel den Fokus. C4 b): dazu öffnet `renderDetail()` über `fileReturn`
  die Vorschau der Datei, wenn sie eine hat.

### BA 9 — Texte

Neue Schlüssel in `de.json`, `en.json` und `tr.json`, jeder mit einem Leser im
Code: „Ordner hinzufügen“, der Platzhalter des Namens, „Bearbeiten …“, „Ordner
löschen“ mit Rückfrage und Hinweis, „leer“, „Verschieben nach …“, „Ohne
Ordner“, „Zurück“, die Meldung nach dem Verschieben, der Grund beim Ablegen auf
einem fremden Ordner, die Zählwörter „Ordner“ für die Löschdialoge,
`server.folderGone`, `server.folderName`, `server.folderForeign` und die
Absage für `testDay`. Vorhandene Wörter werden weiter genutzt, wo sie passen;
das ✕ nutzt `list.close`.

### BA 10 — Der Prüfstand

Neues Modul `test/release_047.js` auf der Portbasis 7340, eingetragen hinter
`release_046`.

| | was gehalten wird |
|---|---|
| 1 | `folders` und `attachment_folders` entstehen beim Start; `test_day_id` bleibt leer |
| 2 | Anlegen darf jeder Account; ein Name mit 0 oder 81 Zeichen nach `trim()` ergibt 400; zwei Ordner dürfen gleich heißen |
| 3 | Umbenennen: 200 für den Verfasser, 403 für Admin und fremden Account; `testDay` ergibt 400, die Spalte bleibt leer |
| 4 | Hochladen in einen Ordner: 201 für den Verfasser; 403 für Admin und fremden Account; 403 für den Ordner eines anderen Eintrags; 404 für einen gelöschten |
| 5 | Verschieben: in einen eigenen Ordner und zurück; Nummer, Adresse, Standbild und „Bearbeiten durch alle“ bleiben; fremde Datei, fremder Ordner und Ordner eines anderen Eintrags: 403 |
| 6 | Ordner löschen: Verfasser und Admin 200, fremder Account 403; die Dateien bleiben ohne Ordner |
| 7 | Export mit Format 21: `folders`, `folder`, Standbild und Dauer; der Import stellt Ordner, Zuordnung und Standbild her; eine Datei in Format 20 steht danach ohne Ordner |
| 8 | Papierkorb: Ordner, Zuordnung und Standbild kommen zurück |
| 9 | Account löschen: Zählung; mit „Beiträge“ fallen seine Ordner an fremden Einträgen, die Dateien bleiben ohne Ordner; `assignInventory()` setzt einen Ordner ohne Account auf den Eigentümer |
| 10 | Block: oben ohne Ordner, darunter die Ordner neueste oben, beim Öffnen alle zu; Kopf mit Zahl oder „leer“; „+“ nur in eigenen; ⋯ nur mit erlaubtem Eintrag |
| 11 | Menü: „Verschieben nach …“ nach C1; die Vorschau schließt beim Verschieben und beim Zuklappen; das Vollbild blättert nur in der Gruppe |
| 12 | Hochladen über „+“ und Ablegen in einen eigenen Ordner; Ablegen auf einem fremden: Toast, nichts geht hoch; C2 |
| 13 | Adresse und Marke einer Datei in einem Ordner: Vollbild, danach steht der Ordner offen; offene Ordner überstehen die Rückkehr aus der eigenen Ansicht, und danach steht der Ordner der Datei offen |
| 14 | Der Löschdialog des Eintrags und der Dialog „Account löschen“ nennen die Ordner |
| 15 | Eigene Ansicht: ✕ beim Ansehen, beim Bearbeiten und bei einer Datei ohne Vorschau; es führt nach C4 zum Eintrag, die Kachel der Datei hat den Fokus |

**Gegenproben**, je eine: Verschieben legt die Datei neu an · Ordner löschen
löscht die Dateien mit · `PUT /api/folders/:id` nimmt `testDay` an · `selfOnly`
am Ordner entfernt · Eintrag von Datei und Ordner nicht verglichen · `folders`
nicht exportiert · Standbild nicht exportiert · Import legt keine Ordner an ·
Papierkorb ohne Ordner · beim Öffnen stehen Ordner offen · Vollbild blättert
über die Gruppe hinaus · ⋯ an einem fremden Ordner für jeden · ✕ fehlt beim
Bearbeiten.

**Was mitgeht:**

- Feste Zahlen: schreibende Routen in `F_ROUTES` 80 → 84 (`test/source.js:37`,
  `test/frame.js`), davon hinter dem CSRF-Schutz 72 → 76 (Zahlwort in
  `test/roundtrip.js:335`); `POST /api/items/:id/attachments` in `F_ROUTES`
  von „offen“ nach „im Rumpf“. Routen mit Rufer in `public/app.js` 115 → 119
  (`test/source.js:1613`); Tabellen 34 → 36 (`test/roundtrip.js:4056`);
  `DATATABLES` mit `folders` und `attachment_folders` (`test/source.js:394-396`);
  `assignInventory()` mit sieben Tabellen (`test/source.js:488`);
  `EXCHANGE_FORMAT` 21 (`test/source.js:1400`) und die Formatnummer 20 in
  `test/roundtrip.js:1017`, `:3131`, `:3946`, `:4414`, `:5001`, `:8689`;
  Dateien des Kommentarwächters 43 → 44 (`test/selfcheck.js:390`,
  `test/source.js:1081`), dazu `COMMENT_TOTAL`; Regelzeilen des Stilblatts neu
  gezählt; Rückbauten (`test/selfcheck.js:18`) plus die Gegenproben.
  Kopieranweisungen des Papierkorbs (7) und `cappedLive` (8) bleiben.
- `test/release_046.js`: „Der Export (Format 20) traegt kein Standbild“ wird
  „Der Export (Format 21) traegt Standbild und Dauer“.
- Stellen in `test/`, die den Block „Dateien“ als ein Raster lesen.

### BA 11 — Dokumentation und Zahlen

- **`manual-de.md`:** „Wer was darf“ mit Ordner anlegen, umbenennen, löschen,
  in einen Ordner hochladen, Datei verschieben und dem Vorschaubild eines
  Videos. „Tags, Dateien, Links“ mit einem Punkt „Ordner“. „Export und Import“
  und „Löschen und Papierkorb“ nennen die Ordner. „Eigene Ansicht“
  (`manual-de.md:390-394`) nennt das ✕.
- **`Doku/Aenderungsprotokoll_0.47.0.md`** mit den Zahlen am fertigen Stand.
- **`CHANGELOG.md`:** `## [0.47.0]`, mit dem Kasten zu den zwei neuen Tabellen
  und dem Hinweis, dass eine Exportdatei aus 0.47.0 Format 21 trägt.
- **`Doku/Fahrplan.md`:** Zeile 0.47.0 durchstreichen und füllen; der Abschnitt
  bekommt oben „Gebaut am …“.
- **`Doku/Entwicklung.md`:** die zwei Tabellen.
- **`package.json`** auf `0.47.0`, `package-lock.json` mit.
- **Die festen Zahlen** am fertigen Stand.
- **Der Fingerprint** mit `node tools/publish.js --trocken` am sauberen
  Arbeitsbaum, dann in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 5. Abnahme im Betrieb

Der Betreiber prüft nach dem Einspielen:

1. Einen Eintrag öffnen: Die Dateien stehen wie bisher, ohne Ordner.
2. „Ordner hinzufügen“, Namen vergeben: Der Ordner steht offen, mit „+“.
3. Eine Datei über „+“ und eine durch Ablegen in den Ordner laden.
4. Eine vorhandene Datei mit „Verschieben nach …“ in den Ordner und zurück.
5. Den Eintrag neu öffnen: Der Ordner ist zu; sein Kopf nennt Zahl und Größe.
6. Am Telefon: Ordnerkopf, ⋯ und die Ziele von „Verschieben nach …“.
7. Den Ordner umbenennen und löschen: Die Dateien stehen danach ohne Ordner.
8. Einen Eintrag mit Ordner exportieren und in eine zweite Instanz importieren:
   Ordner, Zuordnung und die Vorschaubilder der Videos sind da.
9. Einen Eintrag mit Ordner löschen und aus dem Papierkorb zurückholen.
10. Eine Office-Datei in einem Ordner in der eigenen Ansicht ansehen, dann
    zum Bearbeiten öffnen, jeweils mit ✕ schließen: Der Eintrag steht da, wie
    C4 es sagt, der Ordner offen. Am Telefon das Ansehen ebenso.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Testtag zuweisen, Symbol in der Testtagzeile, Sprung, Adresse `#/item/x/folder/y`, „Link kopieren“ am Ordner | 0.48.0 |
| Dateien auf der Platte, Upload in Stücken, große Videos | 0.48.0 |
| Eine Datei ohne Inhalt im Import zählen und nennen | 0.48.0 |
| Mehrere Dateien auf einmal verschieben, Ziehen zum Verschieben, Reihenfolge von Hand | Konzept, Abschnitt 8 |
| Dateien umbenennen, Suche nach Datei- und Ordnernamen | Konzept, Abschnitt 9 |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Zwei neue Tabellen, keine geänderte. Eine vorhandene Datenbank bekommt sie
   beim ersten Start, ohne Migration.
3. Die Kommentarregel gilt: höchstens drei Zeilen je Block, nie mehr Kommentar
   als Code, keine Versionsnummer, kein Verweis auf `Doku/`.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Kommt eine Frage auf, die hier nicht beantwortet ist, wird sie als
   Fragetafel gestellt. Antwortet niemand, gilt der einfachere Weg, der kein
   Verhalten ändert. Die Entscheidung steht im Änderungsprotokoll.
