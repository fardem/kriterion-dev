# Änderungsprotokoll 0.43.2 — „Stift an bearbeitbaren Dateien"

**Gebaut am 27. September 2026 auf 0.43.1. Fingerprint `0c19372c`, davor
`66001468`.**

Wünsche und Befunde des Betreibers nach dem Einspielen von 0.43.0, alle vom
27. September 2026. Ohne Auftrag. Schema: nein. Austauschformat: 20.

---

## 1. Was sich ändert

| | 0.43.1 | 0.43.2 |
|---|---|---|
| Welche Datei bearbeitbar ist | nicht zu sehen | Stift (`ICON_PEN`) in der Zeile, nur mit Schreibrecht, immer sichtbar |
| ⤢ | öffnet mit Recht den Editor | öffnet immer zum Ansehen; in der Leiste steht dann der Stift |
| Adresse des Editors | `#/item/<Eintrag>/file/<Datei>` | `#/item/<Eintrag>/file/<Datei>/edit` |
| Haken „Bearbeiten durch alle" beim Hochladen | neben „Dateien anhängen" | entfällt |
| Vorgabe für neue Dateien | Karte „Dokumente" des Admins | Kasten „Dokumente" im eigenen Bereich; die Karte des Admins gibt den Startwert |
| Einzelne Datei umstellen | Haken in der Leiste der Ansicht | zusätzlich das Zeichen der zwei Personen in der Dateizeile |
| Name an Datei und Link | nur, wenn nicht der Verfasser des Eintrags | ab dem zweiten Account an jeder Zeile |
| Zurück aus der Ansicht | oben im Eintrag | die Zeile der Datei steht im Bild |
| Thema im Document Server | Wahl im Editor | „Wie Kriterion", „Modern Hell" oder „Modern Dunkel" |

**Der Kasten „Dokumente" im eigenen Bereich** steht nur mit eingeschaltetem
Document Server (`documents` in `GET /api/settings`, sonst `null`). Er trägt:

- die Darstellung, persönlicher Schlüssel `documentTheme`: `kriterion`,
  `light`, `dark`. `kriterion` folgt `document.documentElement.dataset.theme`;
- die Vorgabe, persönlicher Schlüssel `filesEditAll`. Ohne eigenen Wert gilt
  `documentEditAll` der Karte des Admins.

Das Hochladen liest das Feld `editAll` weiter; fehlt es, gilt die Vorgabe des
Accounts. `detail()` liefert kein `editAllPreset` mehr.

**Das Thema.** Der Browser schickt `theme=light|dark` an
`GET /api/attachments/:id/office`. `docserver.js` setzt daraus
`editorConfig.customization.uiTheme`: `theme-white` („Modern Hell") oder
`theme-night` („Modern Dunkel"), die Namen aus `ONLYOFFICE/web-apps`
(`apps/common/main/lib/controller/Themes.js`). `api.js` gibt den Wert als
`uitheme` in die Adresse des Editors. Nach `themeinit.js` gilt die im Editor
gespeicherte Wahl nur, wenn noch kein Thema gesetzt ist. Der Wert steht im
signierten Token.

**Befund `[entry.editAll]`.** Auf Deutsch stand der Schlüssel statt des
Textes, auf Türkisch nicht. Der Browser hatte die neue `app.js` und die alte
`de.json` aus dem Cache. Behoben mit 0.43.1; nach dem Einspielen einmal ohne
Cache neu laden.

---

## 2. Die Bilanz

| | 0.43.1 | 0.43.2 |
|---|---:|---:|
| Schlüssel je Sprachdatei | 1.217 | **1.224** |
| Persönliche Schlüssel (`PERSONAL_KEYS`) | 11 | **13** |
| Karten in den Einstellungen | 24 | **25** |
| Regelzeilen des Stilblatts | 1.697 | **1.700** |
| Kommentarzeilen, 40 Dateien | 6.512 | **6.521** |
| Rückbauten | 1.179 | **1.190** |
| Prüfungen im Prüfstand | 7.466 | **7.476** |

---

## 3. Der Prüfstand

`test/release_043.js` hat 52 Prüfungen statt 42: das Thema am Server, der
Startwert und die eigene Vorgabe beim Hochladen, der Stift, ⤢ zum Ansehen,
der Rücksprung, das Zeichen der Schreibrechte, kein Haken beim Hochladen, die
eigene Darstellung und der Kasten im eigenen Bereich.

Angepasst: `test/ui_entry.js` erwartet den Namen auch an Zeilen des
Verfassers, `test/roundtrip.js` dreizehn persönliche Schlüssel,
`test/release_041.js` die Karte `mydocuments`, `test/release_042.js` die
Adresse mit `theme`, `test/source.js` 1.700 Regelzeilen. `buildDom()` in
`test/dom.js` kennt `editAllPreset` nicht mehr.

Rückbauten:

| Nr | Rückbau | erwartet in |
|---|---|---|
| 1254 | Die Ansicht fragt nie nach dem Editor (Suchtext angepasst) | Bearbeiten: im Browser |
| 1255 | Das Hochladen übergeht die eigene Vorgabe (ersetzt „Das Hochladen schickt den Haken nicht") | Bearbeiten: Haken und Rechte |
| 1260 | Der Name fehlt wieder an Dateien des Verfassers | Der Name an der Dateizeile |
| 1261 | Der Name fehlt wieder an Links des Verfassers | Der Name an der Linkzeile |
| 1262 | Der Stift steht an jeder Bürodatei | Bearbeiten: im Browser |
| 1263 | Das Zeichen Öffnen öffnet wieder den Editor | Bearbeiten: im Browser |
| 1264 | Zurück landet wieder oben im Eintrag | Bearbeiten: im Browser |
| 1265 | Das Thema geht nicht an den Document Server | Bearbeiten: Haken und Rechte |
| 1266 | Der Browser meldet immer das dunkle Thema | Bearbeiten: im Browser |
| 1267 | Die eigene Vorgabe fehlt, es gilt nur die Karte | Bearbeiten: Haken und Rechte |
| 1268 | Das Zeichen für die Schreibrechte steht an jeder Datei | Bearbeiten: im Browser |
| 1269 | Der Kasten Dokumente fehlt im eigenen Bereich | Bearbeiten: im Browser |
| 1270 | Die eigene Darstellung geht nicht an den Document Server | Bearbeiten: im Browser |

Die Gegenprobe läuft; das Ergebnis folgt.

---

## 4. Nicht geprüft

Die Bauumgebung erreicht `office.dmrts.de` nicht. Offen für die Abnahme: ob
Euro-Office `uitheme` aus der Adresse annimmt und ob der Rücksprung auch dann
an der Zeile bleibt, wenn Fotos im Eintrag erst danach geladen sind.
