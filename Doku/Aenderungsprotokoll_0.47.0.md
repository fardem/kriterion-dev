# Änderungsprotokoll 0.47.0 — „Ordner“

**Gebaut am 29. September 2026 auf 0.46.0. Fingerprint `636c7c11`, davor
`643e8f9e`.**

Nach `Doku/Auftrag_0.47.0.md` und dem Eintrag 0.47.0 im Fahrplan; Grundlage
ist `Doku/Konzept_Dateien_und_Ordner.md`, Version 2. Schema: ja, die neuen
Tabellen `folders` und `attachment_folders`. Austauschformat: 20 → 21. Vier
neue Routen: `POST /api/items/:id/folders`, `PUT /api/folders/:id`,
`DELETE /api/folders/:id`, `PUT /api/attachments/:id/folder`.

---

## 1. Vorgaben des Betreibers

Die Fragetafel ist vor der ersten Zeile Code beantwortet worden.

| Datum | Vorgabe |
|---|---|
| 29. September 2026 | C1 a): „Verschieben nach …“ zeigt die Ziele an der Stelle des Menüs: „Ohne Ordner“, die eigenen Ordner und „Zurück“ |
| 29. September 2026 | C2 a): Wird ein Ordner gelöscht, während Dateien in ihn hochgehen oder warten, zeigen sie ⚠ „Diesen Ordner gibt es nicht mehr.“; im Menü steht nur „Entfernen“ |
| 29. September 2026 | C3 a): Eine verschobene Datei steht im Ziel nach der Zeit ihres Uploads; `sort_order` bleibt |
| 29. September 2026 | C4 a): ✕ in der eigenen Ansicht führt zum Eintrag wie „← Titel“; der Block „Dateien“ steht offen, die Kachel der Datei hat den Fokus |
| 29. September 2026 | Die offenen Fragen vor dem Bau klären; beim Bauen ist der Betreiber nicht erreichbar. Neue Fragen entscheidet der einfachere Weg, der kein Verhalten ändert (Abschnitt 4) |
| 28. September 2026 | Das ✕ aus dem Kopf der Vorschau auch in der eigenen Ansicht einer Datei, auch wenn sie zum Bearbeiten geöffnet ist |
| 28. September 2026 | Fragetafel „Meldung 403“: Eine 403 ohne Text von Kriterion nennt den Reverse Proxy, wie die 413; in 0.47.0, nicht als eigener Patch |
| 27./28. September 2026 | Konzept, Anhang B, Nr. 9, 10, 11, 14, 16, 17, 19 und F4, F5, F7, F9, wie im Auftrag, Abschnitt 3 |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.46.0.

| | 0.46.0 | 0.47.0 |
|---|---:|---:|
| Tabellen | 34 | **36** |
| Schreibende Routen | 80 | **84** |
| davon hinter dem CSRF-Schutz | 72 | **76** |
| Routen mit Rufer in `public/app.js` | 115 | **119** |
| Aufrufe von `detail()` in `server.js` | 29 | **33** |
| Schlüssel je Sprachdatei | 1.234 | **1.254** |
| Regelzeilen des Stilblatts | 1.795 | **1.818** |
| Kommentarzeilen | 6.653 in 43 Dateien | **6.690 in 44** |
| Dateien des Prüfstands samt `counterproof.js` | 27 | **28** |
| Rückbauten | 1.245 | **1.259** |
| Prüfungen im Prüfstand | 7.642 | **7.687** |

---

## 3. Was gebaut ist

**Tabellen** (`db.js`). Beide entstehen beim Start mit `db.exec(SCHEMA)`;
eine vorhandene Datenbank bekommt sie ohne Migration.

| Tabelle | Spalten |
|---|---|
| `folders` | `id` mit `AUTOINCREMENT`, `item_id` → `items` (`ON DELETE CASCADE`), `name`, `user_id` → `users` (`ON DELETE SET NULL`), `created_at`, `test_day_id` `UNIQUE` → `test_days` (`ON DELETE SET NULL`); Index auf `item_id` |
| `attachment_folders` | `attachment_id` Primärschlüssel → `attachments`, `folder_id` → `folders`, beide `ON DELETE CASCADE`; Index auf `folder_id`. Ohne Zeile steht eine Datei ohne Ordner |

`AUTOINCREMENT`, damit ein Upload, der auf einen gelöschten Ordner wartet,
nie in einem neuen Ordner mit derselben Nummer landet. `test_day_id` setzt
noch keine Route. `assignInventory()` führt `folders` als siebte Tabelle.

**Routen** (`server.js`). Alle antworten mit `detail()`.

| Route | Wer | Was |
|---|---|---|
| `POST /api/items/:id/folders` | jeder Account | `{ name }`, 1 bis 80 Zeichen nach `trim()`, gezählt nach Zeichen, nicht nach UTF-16; gleiche Namen erlaubt; 201 |
| `PUT /api/folders/:id` | wer ihn angelegt hat, auch kein Admin | `{ name }`; ein Feld `testDay` ergibt 400 und ändert nichts |
| `DELETE /api/folders/:id` | wer ihn angelegt hat, Admin | die Dateien stehen danach ohne Ordner |
| `PUT /api/attachments/:id/folder` | wem Datei und Ziel gehören | `{ folderId }` oder `{ folderId: null }`; Datei und Ordner am selben Eintrag, sonst 403; `sort_order` bleibt (C3) |

`POST /api/items/:id/attachments` nimmt das Feld `folderId` an. Es steht im
Formular und wird deshalb nach multer geprüft: ein unbekannter Ordner 404
(`server.folderGone`), ein fremder oder der eines anderen Eintrags 403
(`server.folderForeign`). Zwischen Prüfung und `INSERT` liegt kein `await`.
In `F_ROUTES` steht die Route jetzt als „im Rumpf“.

`detail()` liefert `folders` (`id`, `name`, `created_at`, `mine`, `author`),
neueste oben, bei gleicher Zeit die höhere Nummer oben, und je Datei `folder`
(Nummer oder `null`).

**Export, Import, Papierkorb.** `EXCHANGE_FORMAT` 21. `entryAsBundle()`
schreibt je Eintrag `folders` (`name`, `author`, `created_at`, der älteste
zuerst) und je Datei `folder` als Stelle in diesem Feld; je Video mit
Standbild `still_base64` und `duration`. Der Papierkorb trägt dasselbe, das
Standbild als `still_ref`. `importPrepare()` liest `folder`, die Transaktion
legt die Ordner mit Verfasser über `authorId()` an und ordnet zu; ein Ordner
ohne gültigen Namen fällt weg, eine ungültige Stelle ergibt eine Datei ohne
Ordner, eine Datei älteren Formats steht ohne Ordner. `exchangeParts()` und
`PART_SIZES` zählen die Standbilder mit, also auch `entryTooLarge()` und die
Schätzung der Karte „Export und Import“.

**Account und Löschdialoge.** `countInventory()` zählt `folders` (seine an
fremden Einträgen) und `foreignFolders` (fremde an seinen). `removeUser()`
löscht mit „Beiträge“ seine Ordner. `GET /api/items/:id/inventory` zählt
`ownFolders` und `foreignFolders`. Beide Dialoge nennen die Ordner.

**Block „Dateien“** (`public/app.js`). Oben die Gruppe ohne Ordner, darunter
je Ordner ein Abschnitt mit Kopf, Raster und eigener Vorschau. `drawAtts()`
aktualisiert die Kacheln nach Nummer über alle Gruppen; eine Datei, die die
Gruppe wechselt, zieht in das Raster ihres Ordners um. Der Kopf ist ein
Knopf aus ▸/▾, 📁, Name und „3 Dateien · 1,7 MB“, bei mehreren Accounts
„· anna“, leer „leer“, mit `aria-expanded` und `aria-controls`; daneben ⋯,
nur wenn ein Eintrag darin erlaubt ist. Zugeklappt zeigt er die Uploads
darin zusammengefasst: ⚠ vor Ring vor „wartet“. „+“ steht am Ende der Gruppe
ohne Ordner und jedes eigenen Ordners.

Die offenen Ordner hält `FOLDERS_OPEN` (`{ itemId, open }`) neben
`fileReturn`. Beim Öffnen eines Eintrags sind alle zu; offen stehen danach
ein neu angelegter Ordner, der Ordner der Datei aus Adresse oder Marke, der
Ordner nach dem Ablegen darauf und nach der Rückkehr aus der eigenen Ansicht
der Ordner dieser Datei. Die Rückkehr behält die übrigen offenen Ordner.

Die Vorschau hängt unter dem Raster ihrer Gruppe, höchstens eine im Block;
sie schließt beim Zuklappen ihres Ordners und wenn ihre Datei verschoben oder
gelöscht wird. Das Vollbild blättert mit ← und → nur in der Gruppe.

**Menüs.** „Verschieben nach …“ steht an einer eigenen Datei, wenn es ein Ziel
gibt; die zweite Ebene zeigt „Ohne Ordner“ (nur aus einem Ordner heraus), die
eigenen Ordner außer dem, in dem die Datei steht, und „Zurück“ (C1). Danach
steht die Kachel im Ziel, der Zielordner offen, eine Vorschau dieser Datei
zu, der Fokus auf der Kachel, dazu „Verschoben nach „Nordhang“.“ Das Menü
eines Ordners hat „Bearbeiten …“ (Verfasser) und „Ordner löschen“ (Verfasser,
Admin); ein voller Ordner fragt nach, ein leerer nicht. `nameBox()` bekommt
einen eigenen Platzhalter und zeigt ohne Text keinen leeren Absatz.

**Hochladen.** Die Warteschlange trägt je Upload `folderId`; `uploadSend()`
hängt es vor die Datei an das Formular. Ablegen auf Kopf oder Raster eines
eigenen Ordners lädt in ihn, auf einem fremden steht ein Toast, und nichts
geht hoch. Antwortet der Server mit 404, ist `final` gesetzt: im Menü steht
nur „Entfernen“. Ein wartender Upload in einen Ordner, der nicht mehr da ist,
wird ohne Anfrage zu ⚠ „Diesen Ordner gibt es nicht mehr.“ (C2).

**✕ in der eigenen Ansicht.** `renderFileView()` setzt hinter ↓ einen Link
`fileview-close` auf die Adresse des Eintrags, wie „← Titel“ (C4), in jeder
Art der Ansicht.

**Meldung bei 403.** `proxyAnswer()` liefert für 413 `error.proxyTooLarge`
und für 403 `error.proxyDenied`; `api()`, `sendForm()` und `uploadAnswer()`
nutzen es, wenn die Antwort keinen Text trägt.

**Texte.** 20 neue Schlüssel je Sprache: `dialog.folder`, `dialog.folders`,
`entry.folderAdd`, `entry.folderDelete`, `entry.folderDeleteAsk`,
`entry.folderDeleteHint`, `entry.folderDropForeign`, `entry.folderEdit`,
`entry.folderEmpty`, `entry.folderNameHint`, `entry.menuBack`, `entry.moveTo`,
`entry.movedLoose`, `entry.movedTo`, `entry.noFolder`, `error.proxyDenied`,
`server.folderForeign`, `server.folderGone`, `server.folderName`,
`server.folderTestDay`.

**Dokumentation.** `manual-de.md`: „Wer was darf“ mit Ordnern und dem
Vorschaubild eines Videos, ein Punkt „Ordner“, Menü, Vorschau, eigene Ansicht,
Papierkorb, Export und „Benutzer löschen“. `README.md`: die Grenze der WAF von
CrowdSec mit der Location für NPMplus und eine Zeile in der Tabelle der
Störungen.

---

## 4. Entscheidungen beim Bauen

| Frage | Entscheidung | Grund |
|---|---|---|
| Meldung für einen fremden Ordner und für den Ordner eines anderen Eintrags | ein Schlüssel, `server.folderForeign` | Der Auftrag nennt einen; den zweiten Fall erreicht nur eine selbst gebaute Anfrage |
| Absage für `testDay` | „Ordner und {dayMany} lassen sich nicht verbinden.“ | Die Mehrzahl kommt ohne Artikel aus, wie das Konzept es für das Vokabular verlangt |
| `updated_at` bei Ordner und Verschieben | wird gesetzt | wie bei Links und Dateien; nur das Nachholen des Standbilds lässt es stehen |
| Den neuen Ordner im Browser finden | die Nummer, die vorher fehlte | `detail()` bleibt die einzige Antwort der Route |
| Nachholen des Standbilds in einem zugeklappten Ordner | erst, wenn der Ordner offen ist | Das Konzept knüpft das Nachholen an die sichtbare Kachel |
| Abgelegte Datei, Ziel | der Ordner unter dem Zeiger, Kopf oder Raster | wie im Auftrag; das Hervorheben am Ordner zeigt das Ziel schon beim Ziehen |
| Ordner in der Exportdatei ohne Dateien-Häkchen | fehlen | Ohne Dateien trüge ein Ordner nichts |
| Zuordnung beim Import, Verfasser unbekannt | wie bei Dateien: der Einspielende | `authorId()` gilt für jede Zeile gleich |
| „Beiträge“ beim Löschen eines Accounts | löscht seine Ordner überall, wie seine Kommentare, Links und Dateien | `removeUser()` löscht Beiträge ohne Blick auf den Eintrag; mit „Einträge“ fallen die an eigenen Einträgen ohnehin |
| Kommentargrenzen | mit `node tools/comments.js --write`: `server.js` 894 → 904, `public/app.js` 1.079 → 1.093, `test/dom.js` 169 → 170, `test/frame.js` 118 → 119, neu `test/release_047.js` | Rechte der neuen Routen, Prüfung nach multer, Zählung nach Zeichen, die Reihenfolge im Export, `final` und der verwaiste Upload |

---

## 5. Der Prüfstand

`test/release_047.js`, 45 Prüfungen in sieben Gruppen. Die ersten drei
starten eine eigene Instanz auf der Portbasis 7340, wie `release_041` bis
`release_046`; die Gruppe „Account und Löschdialoge“ startet sie einmal neu,
damit `assignInventory()` läuft. Die übrigen laufen im Mock aus
`test/dom.js`, das dafür das Feld `folders` bekommt.

| Gruppe | Prüfungen |
|---|---|
| Ordner: Schema und Routen | 8 |
| Ordner: Export, Import und Papierkorb | 5 |
| Ordner: Account und Loeschdialoge | 3 |
| Ordner: Block, Kopf und Menue | 15 |
| Ordner: Hochladen und Ablegen | 5 |
| Ordner: Adresse, Rueckkehr und das ✕ der eigenen Ansicht | 6 |
| Ordner: Loeschdialoge und die Meldung bei 403 | 3 |

Angepasst:

- `test/frame.js`: vier neue Routen in `F_ROUTES`; `POST /api/items/:id/attachments` „im Rumpf“.
- `test/source.js`: 84 schreibende Routen, sieben Träger in
  `assignInventory()`, `EXCHANGE_FORMAT` 21, 119 Routen mit Rufer,
  188 Zuweisungen an `innerHTML`, 1.818 Regelzeilen, 28 Dateien des
  Prüfstands, 44 Dateien in der Stolpersteinprobe.
- `test/roundtrip.js`: 76 von 84 Routen hinter dem CSRF-Schutz, 36 Tabellen,
  33 Aufrufe von `detail()`, Formatnummer 21 an sieben Stellen.
- `test/release_041.js`, `test/release_043.js`, `test/ui_export.js`:
  Formatnummer 21.
- `test/release_046.js`: „Der Export (Format 21) traegt Standbild und Dauer“.
- `test/release_031.js`: sechs Wortpaare und ein Vokabelpaar, 17 Rufe von
  `countWord()`; das neue Paar „klasör / klasörler“.
- `test/selfcheck.js`: 1.259 Rückbauten, die Kommentargrenzen, 44 Dateien.
- `testbench.js`: `release_047` hinter `release_046`.

Rückbauten, neu:

| Nr | Rückbau | erwartet in |
|---|---|---|
| 1329 | Verschieben legt die Datei neu an | Schema und Routen |
| 1330 | Ordner löschen löscht die Dateien darin mit | Schema und Routen |
| 1331 | `PUT /api/folders/:id` nimmt `testDay` an | Schema und Routen |
| 1332 | Umbenennen darf auch der Admin (`mayChange` statt `selfOnly`) | Schema und Routen |
| 1333 | Verschieben vergleicht den Eintrag von Datei und Ordner nicht | Schema und Routen |
| 1334 | Der Export trägt keine Ordner | Export, Import und Papierkorb |
| 1335 | Der Export trägt kein Standbild | Export, Import und Papierkorb |
| 1336 | Der Import legt keine Ordner an | Export, Import und Papierkorb |
| 1337 | Der Papierkorb vergisst die Ordner | Export, Import und Papierkorb |
| 1338 | Beim Öffnen eines Eintrags stehen die Ordner offen | Block, Kopf und Menue |
| 1339 | Das Vollbild blättert über die Gruppe hinaus | Block, Kopf und Menue |
| 1340 | Das Menü eines fremden Ordners steht jedem offen | Block, Kopf und Menue |
| 1341 | Beim Bearbeiten fehlt das ✕ der eigenen Ansicht | Adresse, Rueckkehr und das ✕ |
| 1342 | Eine 403 ohne Text zeigt beim Hochladen wieder nur den Statuscode | Loeschdialoge und die Meldung bei 403 |

Die zwölf Gegenproben des Auftrags sind 1329 bis 1340; 1341 und 1342 kommen
mit dem ✕ und der Meldung bei 403 dazu.

Rückbauten mit neuem Suchtext: 233 und 448 (Formatnummer 21), 1217 (die 413
in `proxyAnswer()`), 1318 (der Umschlag des Papierkorbs). 673 ist
mitgefahren, weil `api()` geändert ist; sein Suchtext ist gleich geblieben.

**18 rot, 1 stumm**, ohne Abbruch eines Moduls, gefahren auf `1e66ff9` mit
drei Spuren und `NPM_CONFIG_OFFLINE=true`. Ohne Netz liefert `npm audit` einen
leeren Bericht; so ist „npm audit meldet keine einzige Luecke“ in keinem Lauf
rot, und jede rote Prüfung kommt vom Rückbau. Der erste Lauf endete nach zwei
Minuten mit einem Neustart des Containers; alle 19 wurden danach neu
gefahren, in Gruppen zu drei.

1341 war stumm. „Das ✕ steht auch beim Bearbeiten“ prüfte nur Adresse und
Beschriftung des ✕. Der Rückbau setzt `hidden` an das ✕, das Element bleibt
da, und die Prüfung blieb grün. Beide Prüfungen zum ✕ in `test/release_047.js`
verlangen jetzt, dass weder das ✕ noch ein Element darüber `hidden` trägt.
Danach ist 1341 auf `3beb003` rot in „Das ✕ steht auch beim Bearbeiten“:
**19 rot, 0 stumm**. Die Zahl der Prüfungen bleibt 7.687.

Jeder außer 1330 ist in seiner erwarteten Gruppe rot und zusätzlich in „Jeder
Suchtext kommt in seiner Datei genau einmal vor“, weil die Prüfung den
zurückgebauten Stand liest. Der Ersatz von 1330 enthält seinen Suchtext. Rot
auch in weiteren Gruppen:

- 233 und 448 in 14 Gruppen, dort in jeder Prüfung der Formatnummer.
- 673 in „Die sieben Waechter der Sprachdatei — 0.24.0“ und „Kein deutscher
  Bildschirmsatz sitzt fest — die neue Wache — 0.30.0“. Der Rückbau setzt
  einen deutschen Satz in `public/app.js`.
- 1217 in „Ordner: Loeschdialoge und die Meldung bei 403“, weil die Prüfung
  dort auch die 413 verlangt, und in den zwei Prüfungen auf Leser der
  Sprachdatei: `error.proxyTooLarge` hat keinen mehr.
- 1318 in „Ordner: Export, Import und Papierkorb“. Die Prüfung verlangt das
  Standbild nach dem Zurückholen.
- 1331 in den zwei Prüfungen auf Leser der Sprachdatei:
  `server.folderTestDay` hat keinen mehr.
- 1334, 1336 und 1337 in „Ordner: Account und Loeschdialoge“. Die Prüfung
  zählt je einen Ordner aus Import und Papierkorb der Gruppe davor.
- 1335 in „Videos unter Dateien: Papierkorb und Export“.
- 1336 in seiner Gruppe auch in der Prüfung zum Papierkorb: das Zurückholen
  läuft über den Import.
- 1338 in „Ordner: Adresse, Rueckkehr und das ✕ der eigenen Ansicht“, in den
  Prüfungen zur Adresse einer Bilddatei und zum neuen Öffnen.
- 1339 in derselben Gruppe, in der Prüfung zur Adresse einer Bilddatei: sie
  verlangt „1 / 2“ im Vollbild.

Nachgetragen nach dem Bau: `DATATABLES` in `test/source.js` nennt jetzt
`folders` und `attachment_folders`. BA 11 des Auftrags verlangte das; beim Bau
fehlte es. Die Prüfung, dass keine Abfrage auf den Bestand den Papierkorb
nennt, liest damit elf Zeilen mehr und bleibt grün.

---

## 6. Nicht geprüft und offen

Von Hand in Chromium (`headless_shell` 1194, Playwright 1.56.1) gegen eine
eigene Instanz:

| Was | Ergebnis |
|---|---|
| „Ordner hinzufügen“ | Dialog mit Platzhalter und höchstens 80 Zeichen; der Ordner steht offen, der Fokus auf seinem Kopf |
| „+“ im Ordner | die Datei geht in den Ordner, `folder` im Eintrag stimmt |
| „Verschieben nach …“ | zweite Ebene mit dem Ordner und „Zurück“; danach Kachel im Ordner, Fokus auf ihr, Meldung „Moved to “Nordhang”.“ (der Browser lief englisch) |
| Zuklappen, Umbenennen | ▸ und ▾ wechseln; der neue Name steht im Kopf |
| ✕ in der eigenen Ansicht einer ZIP-Datei | zurück zum Eintrag, der Ordner offen, die Kachel mit Fokus |
| Ordner löschen | Rückfrage mit „The 2 files in it are kept …“; die Dateien stehen ohne Ordner, der Fokus auf „Ordner hinzufügen“ |

Die Probe gehört nicht zum Prüfstand.

Offen für die Abnahme (Auftrag, Abschnitt 5):

- Ordner anlegen, hochladen über „+“ und durch Ablegen, verschieben und
  zurück, umbenennen, löschen, am Rechner und am Telefon.
- Ein Eintrag mit Ordnern im Export und Import in eine zweite Instanz.
- Papierkorb und Zurückholen eines Eintrags mit Ordnern.
- Eine Office-Datei in der eigenen Ansicht ansehen und bearbeiten, jeweils
  mit ✕ schließen; der Document Server speichert wie nach „← Titel“.
- Solange NPMplus mit CrowdSec AppSec große Uploads mit 403 abweist: die
  Kachel nennt den Reverse Proxy. Nach der Location aus der README geht
  dieselbe Datei hoch.
