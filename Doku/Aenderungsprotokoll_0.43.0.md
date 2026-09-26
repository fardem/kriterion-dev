# Änderungsprotokoll 0.43.0 — „Dokumente über den Document Server bearbeiten"

**Gebaut am 27. September 2026 auf 0.42.3. Fingerprint `c83a6a27`, davor
`90d99a0b`.**

Nach dem Abschnitt 0.43.0 im Fahrplan und den Antworten des Betreibers vom
26. September 2026. Schema: ja, zwei neue Tabellen. Austauschformat: 20.

---

## 1. Die Bilanz

Gemessen am fertigen Stand gegen 0.42.3.

| | 0.42.3 | 0.43.0 |
|---|---:|---:|
| Tabellen der Datenbank | 30 | **32** |
| Austauschformat | 19 | **20** |
| Schlüssel je Sprachdatei | 1.204 | **1.217** |
| Schreibende Routen (`F_ROUTES`) | 76 | **79** |
| Davon offen vor der Anmeldung | 8 | **9** |
| Protokollzeilen in den sechs Dateien | 54 | **62** |
| Regelzeilen des Stilblatts | 1.696 | **1.697** |
| Kommentarzeilen, alle Dateien | 6.461 in 39 | **6.509 in 40** |
| Module im Prüfstand | 23 | **24** |
| Rückbauten | 1.161 | **1.178** |
| Prüfungen im Prüfstand | 7.423 | **7.465** |

---

## 2. Was gebaut ist

**Schema, `db.js`.** Zwei Tabellen, keine neue Spalte. `CREATE TABLE IF NOT
EXISTS` legt sie auch in bestehenden Datenbanken an.

| Tabelle | Spalten | Zweck |
|---|---|---|
| `attachment_editing` | `edit_all`, `revision`, `saves` | der Haken; die Zähler für die Schlüssel von Editor und Betrachter |
| `attachment_previous` | `session_key`, `filename`, `mime_type`, `size`, `saved_at`, `data` | die Fassung vor der letzten Bearbeitung, eine je Datei |

Beide hängen mit `ON DELETE CASCADE` an `attachments`. Eine Datei ohne Zeile
in `attachment_editing` hat keinen Haken; so gelten alle bestehenden Dateien
als „nur, wer hochgeladen hat".

**`docserver.js`.**

- Formate nach der Formatliste von OnlyOffice (`ONLYOFFICE/document-formats`):
  `docx`, `xlsx`, `pptx` („edit") und `odt`, `ods`, `odp`, `rtf`
  („lossy-edit") werden direkt bearbeitet. `doc`, `xls`, `ppt` („auto-convert")
  wandelt `convertForEdit()` vorher über `/converter` in `docx`, `xlsx`, `pptx`.
- `editorConfig()`: Modus `edit`, `callbackUrl`, `customization.forcesave`,
  Bearbeiten, Kommentar und Review an, Chat und Download aus, `type: desktop`.
- Schlüssel: der Betrachter `HMAC(Abrufadresse|created_at|v<saves>)`, der
  Editor `…|e<revision>`. `size` gehört nicht mehr dazu.
- `readCallback()` liest das JWT aus dem Rumpf (`token`) oder aus dem Header
  `Authorization`; im Header liegt der Rumpf unter `payload`.
- `download()` holt nur von `DOCUMENT_SERVER_ADDRESS` oder
  `DOCUMENT_SERVER_INTERNAL_ADDRESS` und schreibt die öffentliche Adresse auf
  die interne um. Verglichen wird über `URL`; `https://host:443/` ist
  dieselbe Adresse wie `https://host/`. Ohne Umleitung, höchstens 100 MB,
  höchstens 60 s.
- `savedAs()` bestimmt Name und MIME-Typ nach `filetype` aus dem Callback.

**`server.js`.**

| Route | Recht | Was |
|---|---|---|
| `POST /api/document-server/callback/:id` | offen, JWT | nimmt Status 2 und 6 an, holt die Fassung, speichert |
| `PUT /api/attachments/:id/editing` | wer hochgeladen hat | stellt den Haken um |
| `POST /api/attachments/:id/previous` | wer bearbeiten darf | tauscht aktuelle und vorige Fassung |

- `GET /api/attachments/:id/office?edit=1` liefert den Editor, wenn der Account
  bearbeiten darf, das Format bearbeitbar ist und `mobile` nicht 1 ist.
  Scheitert die Umwandlung, kommt der Betrachter mit `editFailed: true`.
- `detail()` liefert je Datei `editAll`, `edit` und `restore`, am Eintrag
  `editAllPreset` (`null` ohne Document Server).
- Das Hochladen liest das Feld `editAll` und setzt den Haken für jede
  bearbeitbare Datei. Fehlt das Feld, bleibt es ohne Haken.
- `PUT /api/settings` kennt `documentEditAll`, `GET /api/document-server`
  liefert es als `editAll`.
- Export und Import tragen `edit_all: true` an der Datei. Der Papierkorb läuft
  über dasselbe Format; der Haken kommt mit zurück, die vorige Fassung nicht.

Der Callback:

| Status | Bedeutung | Kriterion |
|---|---|---|
| 1 | jemand bearbeitet | `{ error: 0 }` |
| 2 | alle haben geschlossen | speichert; ist der Schlüssel der aktuelle, steigt `revision` |
| 3, 7 | Fehler beim Speichern | Warnung im Protokoll, `{ error: 0 }` |
| 4 | ohne Änderung geschlossen | `{ error: 0 }` |
| 6 | Knopf Speichern | speichert, `revision` bleibt |

Die erste Speicherung einer Sitzung legt die bisherige Fassung in
`attachment_previous` ab, mit dem Schlüssel der Sitzung. Weitere Speicherungen
derselben Sitzung ersetzen nur die aktuelle Fassung. Ist die Datei gelöscht,
antwortet Kriterion `{ error: 0 }` und schreibt eine Warnung. Scheitert der
Download oder ist das Format unbekannt, antwortet Kriterion `{ error: 1 }`;
der Document Server versucht es dann erneut.

**Browser.**

- Die eigene Ansicht fragt mit `edit=1`. Unter dem Editor steht
  `entry.officeEditHint`.
- Bei `doc`, `xls` und `ppt` fragt die Ansicht vorher nach
  (`entry.convertAsk`, mit Namen vorher und nachher). Mit OK kommt der
  Editor; beim Speichern ersetzt die umgewandelte Fassung die Datei, das
  Original wird zur vorigen Fassung. Ohne OK kommt der Betrachter. Den neuen
  Namen bildet der Browser aus `convertTo` in `detail()`.
- In der Leiste: der Haken „Bearbeiten durch alle" für den, der hochgeladen
  hat, und das Zeichen ↶ für die vorige Fassung, mit Rückfrage.
- Beim Hochladen steht der Haken neben „Dateien anhängen", vorbelegt nach der
  Karte. Ohne Document Server fehlt er.
- Die Karte „Dokumente" hat den zweiten Schalter „Beim Hochladen „Bearbeiten
  durch alle" vorab anhaken".

**Texte und Doku.** 13 Schlüssel je Sprache, `card.documentsHint` nennt das
Bearbeiten. Handbuch mit „Bearbeiten" und „Vorige Fassung", README mit dem
Rückweg des Callbacks.

---

## 3. Entscheidungen beim Bauen

| Frage | Entscheidung | Grund |
|---|---|---|
| `size` im Schlüssel | entfällt; `v<saves>` im Betrachter, `e<revision>` im Editor | Mit dem Knopf Speichern ändert sich die Größe mitten in der Sitzung. Ein Schlüssel mit `size` schickte einen zweiten Bearbeiter in eine eigene Sitzung |
| Wann steigt `revision` | bei Status 2 mit dem aktuellen Schlüssel und beim Wiederherstellen | Nach dem Ende einer Sitzung darf ihr Schlüssel nicht wieder vergeben werden |
| Callback mit älterem Schlüssel | wird angenommen | Wer nach einem Wiederherstellen weiter bearbeitet, verliert nichts; die wiederhergestellte Fassung wird zur vorigen |
| Rechte beim Callback | nicht erneut geprüft | Der Editor wurde nur mit Recht ausgeliefert; die Signatur mit dem Secret sichert den Callback |
| Callback bei ausgeschaltetem Schalter | wird angenommen | Sonst ginge eine laufende Bearbeitung verloren |
| Grenze beim Download | 100 MB, die Obergrenze der Einstellung für Dateien | Die eingestellte Grenze gilt für das Hochladen; eine Bearbeitung soll nicht an ihr scheitern |
| Schlüssel der Umwandlung | `convert-` vor dem Schlüssel des Editors | Der Document Server hält Umwandlung und Sitzung sonst unter demselben Schlüssel |
| Admin | bearbeitet ohne Haken nicht, auch der Eigentümer-Admin nicht | Vorgabe des Betreibers |
| Rückfrage vor der Umwandlung | im Browser, vor dem Start des Editors; Abbrechen zeigt den Betrachter | Nachtrag des Betreibers vom 26. September 2026. Die Datei ändert sich erst beim Speichern; wer nur schaut, soll nichts umwandeln |
| CSRF | der Callback steht nicht in `CSRF_FREE` | Der Document Server hat keine Sitzung; ohne Sitzung greift die Prüfung nicht. `test/source.js` nennt die Route als vom Document Server gerufen |
| Feld `editAll` fehlt beim Hochladen | kein Haken | Die Vorgabe der Karte belegt nur den Haken im Browser vor |
| Rückbau 1230 | Suchtext um die Zeile `mode: 'view', lang,` erweitert | `user: { … }` steht jetzt im Betrachter und im Editor |
| Gruppe „Kommentarvideos: Rundlauf mit Format 19" | Name bleibt, die Prüfung darin erwartet 20 | Rückbau 8357 nennt die Gruppe |
| Kommentargrenzen | mit `node tools/comments.js --write` angehoben | Callback, Schlüssel und Umwandlung in `server.js` und `docserver.js`, dazu der neue Prüfstand |

---

## 4. Der Prüfstand

`test/release_043.js`, 42 Prüfungen in vier Gruppen. Ein gestellter Document
Server im selben Prozess wandelt um, liefert bearbeitete Fassungen aus und
leitet `/cache/redirect` um. `DOCUMENT_SERVER_ADDRESS` ist
`http://office.invalid`; Kriterion erreicht den gestellten Server nur über
`DOCUMENT_SERVER_INTERNAL_ADDRESS`. Damit prüft jeder Download das Umschreiben
der Adresse.

| Gruppe | Prüfungen |
|---|---:|
| Bearbeiten: Haken und Rechte | 13 |
| Bearbeiten: der Rueckweg | 15 |
| Bearbeiten: Export und Papierkorb | 4 |
| Bearbeiten: im Browser | 10 |

Angepasste feste Zahlen in anderen Modulen: Austauschformat 20 (zehn Stellen
in `test/roundtrip.js`, `test/source.js`, `test/ui_export.js`,
`test/release_041.js`), 32 Tabellen, 79 Routen, davon 71 hinter dem
CSRF-Schutz, 28 Aufrufe von `detail()`, 114 Routen im Browservergleich, 62
Protokollzeilen, 1.697 Regelzeilen, 24 Module. In `test/release_042.js` gilt
der neue Schlüssel und die Adresse `office?mobile=0&edit=0`.

Rückbauten 1242 bis 1258:

| Nr | Rückbau | erwartet in |
|---|---|---|
| 1242 | Die Rechte beim Bearbeiten fallen weg | Haken und Rechte |
| 1243 | `detail()` meldet `edit` auch ohne Recht | Haken und Rechte |
| 1244 | Der Callback nimmt jeden Schlüssel an | der Rueckweg |
| 1245 | Der Download folgt Umleitungen | der Rueckweg |
| 1246 | Jede Speicherung legt die vorige Fassung neu ab | der Rueckweg |
| 1247 | Der Haken reist nicht im Export | Export und Papierkorb |
| 1248 | Der Import liest den Haken nicht | Export und Papierkorb |
| 1249 | Der Admin stellt den Haken um | Haken und Rechte |
| 1250 | Auf dem Telefon kommt der Editor | Haken und Rechte |
| 1251 | Status 2 beendet die Sitzung nicht | der Rueckweg |
| 1252 | Eine fremde Adresse wird geholt | der Rueckweg |
| 1253 | Der Hochladende sieht den Haken in der Ansicht nicht | im Browser |
| 1254 | Die Ansicht fragt nie nach dem Editor | im Browser |
| 1255 | Das Hochladen schickt den Haken nicht | im Browser |
| 1256 | Der Knopf Speichern schreibt nicht sofort | Haken und Rechte |
| 1257 | Die Umwandlung startet ohne Rückfrage | im Browser |
| 1258 | `detail()` nennt kein Format nach dem Speichern | Haken und Rechte |

GEGENPROBE

---

## 5. Nicht geprüft und offen

Die Bauumgebung erreicht `office.dmrts.de` nicht. Offen für die Abnahme mit
Euro-Office:

- Aufbau des Callbacks: Status, `key`, `url`, `filetype` und das JWT stammen
  aus der Beschreibung von OnlyOffice, nicht aus einer Messung.
- Ob Euro-Office `odt`, `ods`, `odp` und `rtf` im eigenen Format zurückgibt.
  Gibt es `docx` zurück, benennt Kriterion die Datei um.
- Ob der Document Server die Adresse aus `/converter` bei sich selbst abrufen
  kann. Kriterion schreibt sie auf `DOCUMENT_SERVER_INTERNAL_ADDRESS` um.

Nicht gebaut: Die Karte „Datenbank" nennt die vorigen Fassungen nicht eigens.
Ihre Größe steckt nur in der Größe der Datenbank.
