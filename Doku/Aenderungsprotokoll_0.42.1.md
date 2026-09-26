# Änderungsprotokoll 0.42.1 — „Vorschau, Öffnen und Umlaute"

**Gebaut am 26. September 2026 auf 0.42.0. Fingerprint `526a9c34`, davor
`48829449`.**

Befunde des Betreibers aus dem Betrieb mit Euro-Office unter
`office.dmrts.de`, gesammelt am 26. September 2026. Ohne Auftrag. Schema:
nein. Austauschformat: 19.

---

## 1. Die Befunde

| | Befund | Ursache | Behebung |
|---|---|---|---|
| 1 | Auf der Karte „Dokumente" läuft Text über den Rand | `.kv .v` schrumpft als Flex-Kind nicht unter sein längstes Wort | `.kv .k, .kv .v { min-width: 0; overflow-wrap: anywhere; }`; der Hinweis „leer, es gilt …" steht mit `display: block` in der Hinweisfarbe darunter |
| 2 | Der Betrachter fragt nach einem Namen | Die Konfiguration trug keinen `editorConfig.user` | `user` mit Nummer und Benutzername des angemeldeten Accounts, im signierten Token |
| 3 | Kein Vollbild; der Betrachter steht nur im Kasten der Dateiliste | nicht gebaut | eigene Ansicht `#/item/<Eintrag>/file/<Datei>` |
| 4 | Aus „Ömer Anmeldung Mainz.docx" wird „Ãmer …" | `multer` liest Dateinamen ohne `defParamCharset` als Latin-1; Browser senden UTF-8 | alle sechs Uploads über `upload()` mit `defParamCharset: 'utf8'` |
| 5 | Kommentare und Chat im Betrachter, der nur ansieht | Vorgabe des Document Servers | `permissions.chat: false`, `customization.comments: false` |
| 6 | Auf dem Telefon bleibt der Kasten leer | Der mobile Editor (`type: 'mobile'`) zeigt in Euro-Office nichts an | auf dem Telefon `type: 'embedded'`, gebaut zum Ansehen in kleinen Rahmen |

Befund 4 betrifft jedes Hochladen, nicht nur Bürodateien. **Gespeicherte
Namen bleiben, wie sie sind** — Vorgabe des Betreibers vom 26. September 2026;
die Datenbank wird nicht angefasst.

Befund 6 ist aus dem Bild des Betreibers geschlossen und nicht gegen
Euro-Office gemessen. Die Abnahme auf dem Telefon steht aus.

---

## 2. Vorschau und Öffnen

| Wo | Was |
|---|---|
| Klick auf die Dateizeile | die Vorschau im Eintrag, wie in 0.42.0 |
| Zeichen ⤢ in der Zeile, neben ↓ | öffnet die eigene Ansicht |
| Klick auf die Dateizeile auf dem Telefon | öffnet die eigene Ansicht |

Die eigene Ansicht: oben die Kopfzeile von Kriterion ohne Suchfeld, darunter
eine Leiste mit ← und dem Titel des Eintrags, dem Dateinamen und ↓. Der
Betrachter bekommt die restliche Höhe (`.fileview`, `height: 100dvh`, Flex
nach unten). `route()` baut den Betrachter beim Verlassen mit
`destroyEditor()` ab. Die Platzhalter tragen die Nummer der Datei
(`office-full-<Datei>`); ein spät fertiger Betrachter landet damit nicht in
der Ansicht einer anderen Datei.

`startOffice()` startet den Betrachter für die Vorschau und für die Ansicht.

---

## 3. Die Bilanz

Gemessen am fertigen Stand gegen 0.42.0.

| | 0.42.0 | 0.42.1 |
|---|---:|---:|
| Schlüssel je Sprachdatei | 1.203 | **1.204** (`entry.openFile`) |
| Regelzeilen des Stilblatts | 1.683 | **1.693** |
| Zuweisungen an `innerHTML` | 178 | **182** |
| Kommentarzeilen, 39 Dateien | 6.449 | **6.457** |
| Rückbauten | 1.148 | **1.156** |
| Prüfungen im Prüfstand | 7.410 | **7.420** |

---

## 4. Der Prüfstand

Zehn Prüfungen in `test/release_042.js`, in zwei neuen Gruppen und einer
bestehenden:

- **Account, Chat und Dateinamen** (4): `editorConfig.user`,
  `permissions.chat` und `customization.comments`, ein Upload mit
  „Ömer Anmeldung.docx", jeder `multer` über `upload()`.
- **die eigene Ansicht** (6): das Zeichen ⤢ nur an Bürodateien, die Ansicht
  ohne Suchfeld mit Weg zurück und einem Betrachter, `destroyEditor()` beim
  Verlassen, der Klick auf dem Telefon, die Regeln im Stilblatt.
- **Abruf und Konfiguration:** auf dem Telefon `type: 'embedded'`.

Rückbauten 1229 bis 1236:

| Nr | Rückbau | rot in |
|---|---|---|
| 1229 | Dateinamen werden wieder als Latin-1 gelesen | Ein Dateiname mit Umlaut kommt beim Hochladen unveraendert an; Jedes Hochladen geht ueber upload() |
| 1230 | Der Betrachter bekommt keinen Account | Der Betrachter bekommt den angemeldeten Account |
| 1231 | Kommentare stehen im Betrachter wieder da | Chat und Kommentare sind im Betrachter aus |
| 1232 | Die Dateizeile verliert das Symbol Öffnen | vier Prüfungen, darunter das Symbol und der Leser von `entry.openFile` |
| 1233 | `route()` baut den Betrachter der Ansicht nicht ab | Beim Verlassen der Ansicht wird destroyEditor() gerufen |
| 1234 | Auf dem Telefon klappt die Vorschau wieder im Eintrag auf | Auf dem Telefon oeffnet ein Klick auf die Zeile die Ansicht |
| 1235 | Lange Werte in `.kv` brechen nicht mehr um | Lange Werte in einer Zeile .kv brechen um; die Zahl der Regelzeilen |
| 1236 | Auf dem Telefon wieder der mobile Editor | documentType folgt der Endung, auf dem Telefon ist type embedded |

**8 rot, 0 stumm.** 1234 brach im ersten Lauf das Modul ab: der Test schloss
das Fenster, bevor der Betrachter der Vorschau fertig war, weil der gestellte
`fetch` diese Anfrage nicht mitzählt. Der Test wartet jetzt auf den zweiten
Betrachter; der zweite Lauf von 1234 ist rot in der genannten Prüfung, ohne
Abbruch. 1233 war im ersten Lauf zusätzlich rot in „Und das Vierfache an Text
kostet nicht das Sechzehnfache an Zeit", einer Zeitmessung ohne Bezug zum
Rückbau.

---

## 5. Nicht geprüft

Die Bauumgebung erreicht `office.dmrts.de` nicht. Offen für die Abnahme auf
dem Telefon: ob `embedded` das Dokument zeigt, in der Vorschau und in der
eigenen Ansicht.
