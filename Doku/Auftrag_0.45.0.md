# Auftrag 0.45.0 — „Der Block „Dateien" in Kacheln"

**Erteilt am 28. September 2026.** Gebaut wird auf dem Branch, der in der
Aufgabe genannt ist. Grundlage sind `Doku/Konzept_Dateien_und_Ordner.md`,
Version 1a, und der Eintrag 0.45.0 in `Doku/Fahrplan.md`. Vor der ersten Zeile
Code werden die Fragen aus Abschnitt 0 in einer Fragetafel gestellt.

---

## 0. Vor dem Bau: die offenen Fragen

| Nr. | Frage | Antworten | Empfehlung |
|---|---|---|---|
| A1 | Wie groß ist eine Kachel im Block „Dateien"? | a) fest 128 px am Rechner, 96 px am Telefon (drei Spalten bei 344 px) · b) wie die Einstellung für den Bildstreifen (`STRIP`, 60 bis 150 px, `app.js:2582-2586`) | **a)**: Unter der Kachel steht der Dateiname in zwei Zeilen. Bei 60 px ist er nicht lesbar, und der Knopf ⋯ braucht am Telefon 44 px. |

Alle übrigen Punkte sind entschieden (Abschnitt 3).

---

## 1. Das Ziel

- Der Block „Dateien" zeigt Kacheln statt Zeilen: quadratisch, mit
  Vorschaubild oder Endung, Name darunter, Menü ⋯ an jeder Kachel.
- Ein Klick zeigt eine Datei und lädt nie herunter. Alles andere steht im
  Menü ⋯, und das Menü bietet nur an, was der Server annimmt.
- Jede Handlung geht per Tastatur und ohne Überfahren mit der Maus.
- Hochladen geht über die Kachel „+" und durch Ablegen auf dem Block, mit
  Fortschritt je Datei. Ein Upload läuft weiter, wenn man den Eintrag wechselt.
- Ein Eintrag trägt 100 Dateien statt 20.
- Das Schema und die Routen bleiben. Die Instanz arbeitet mit jeder
  vorhandenen Datenbank.

---

## 2. Der Anlass

| Anlass | Stand am 28. September 2026 |
|---|---|
| Zeile | `drawAtts()` (`public/app.js:6083-6161`) zeichnet elf Spalten in einem `subgrid` (`style.css:1726-1743`). Die Knöpfe erscheinen erst beim Überfahren (`style.css:1705-1711`); am Telefon gibt es keinen Hover |
| Klick | Eine Datei ohne Vorschau wird beim Klick heruntergeladen (`app.js:6148-6156`) |
| Tastatur | Die Zeile ist ein `div` ohne `tabindex` und ohne Rolle; per Tastatur öffnet keine Vorschau |
| Neuzeichnen | Jedes `drawAtts()` zerstört alle offenen Betrachter des Document Servers (`app.js:6086-6088`) |
| Hochladen | Ein Knopf „+ Dateien anhängen", alle Dateien in einer Anfrage über `sendForm` (`app.js:6192-6206`), ohne Fortschritt |
| Anzahl | `ATTACHMENT_COUNT = 20` (`server.js:3655`) gilt je Anfrage und je Eintrag, ohne genannten Grund |
| Plan | Konzept vom 28. September 2026 mit den Antworten des Betreibers; dieser Auftrag ist die erste von vier Versionen |

---

## 3. Die Entscheidungen

### Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 28. September 2026 | Der Block „Dateien" wird neu aufgebaut, mit quadratischen Kacheln und Vorschaubild nach dem Vorbild von Homarr (Konzept, Anhang B, Nr. 9) |
| 28. September 2026 | Hochgeladen wird über die Kachel „+" (Nr. 11) |
| 28. September 2026 | Ein Klick auf eine Kachel öffnet die Vorschau darunter; Bilder öffnen im Vollbild (Nr. 15) |
| 28. September 2026 | Ein Menü ⋯ an jeder Kachel, immer sichtbar (Nr. 16) |
| 28. September 2026 | Die Bildleiste oben bleibt, wie sie ist (Nr. 18) |
| 28. September 2026 | 100 Dateien je Eintrag, 20 je Anfrage (F3) |
| 28. September 2026 | Die Vorschau steht unter allen Kacheln ihrer Gruppe, höchstens eine im Block; am Telefon öffnet eine lesbare Datei die eigene Ansicht (F5) |
| 28. September 2026 | Die Adresse einer Bilddatei öffnet das Vollbild im Eintrag, auch über die Marke in Kommentar und Beschreibung (F7) |

### Entschieden in diesem Auftrag

| Frage | Antwort |
|---|---|
| Versionsnummer | **0.45.0**, MINOR. Schema: nein. Austauschformat: 20 bleibt |
| Routen | Keine neue, keine geänderte. `POST /api/items/:id/attachments` bekommt nur die neue Zählung (BA 5) |
| Gruppe | In dieser Version gibt es genau eine Gruppe, die Dateien ohne Ordner. Das Raster ist so gebaut, dass 0.47.0 weitere Gruppen darunter setzt |
| Reihenfolge der Kacheln | Nach `sort_order`, wie heute die Zeilen |
| Neue Datei ohne Vorschaubild | Die Endung groß auf der Bildfläche („PDF", „ZIP"), statt der Zeichen aus `fileSign()` (`app.js:2195`) |
| Video unter „Dateien" | Kachel mit Endung und ▶; ein Klick öffnet das Menü. Abspielen kommt mit 0.46.0 |
| Links- und Testtagzeilen | Bleiben, wie sie sind; ✕ erscheint dort weiter beim Überfahren (`style.css:890-893`) |
| Kopfleiste mit Fortschritt | Kommt mit 0.48.0. Hier läuft ein Upload beim Wechsel des Eintrags weiter, und seine Kachel zeigt beim Zurückkehren den Stand |

---

## 4. Die Bauabschnitte

### BA 1 — Kachelraster und Kachel

```
 ⣿ ▾ Dateien  4
   ┌───────⋯┐ ┌───────⋯┐ ┌───────⋯┐ ┌ ─ ─ ─ ─┐
   │ (Bild) │ │  PDF   │ │  DOCX  │ │   +    │
   └────────┘ └────────┘ └────────┘ └ ─ ─ ─ ─┘
   Aufbau.jpg  Daten…t.pdf Protokoll  bis 50 MB
   2,1 MB      340 KB     88 KB·anna
   ┌ Datenblatt.pdf · 340 KB                        ⤢   ↓   × ┐
   └───────────────────────────────────────────────────────────┘
```

| Teil der Kachel | Inhalt |
|---|---|
| Bildfläche, quadratisch | Bild: Vorschaubild aus `attachment_thumbs` (`fileTileSource()`, `app.js:2197`). Sonst die Endung groß; Video zusätzlich ▶ |
| ⋯ | oben rechts auf der Bildfläche, immer sichtbar, am Telefon 44 × 44 px |
| Zustandsecke unten rechts | leer oder genau eins: Ring mit Prozent, „wartet", ⚠ fehlgeschlagen |
| Unterschrift | Name über die volle Breite, höchstens zwei Zeilen, in der Mitte gekürzt, damit die Endung bleibt; darunter Größe, ab zwei Accounts „· Name" |
| Rahmen | Akzentfarbe, solange Vorschau oder Vollbild dieser Datei offen ist |

- Bildfläche und Name bilden einen Knopf mit Beschriftung
  („Datenblatt.pdf, PDF, 340 KB"), ⋯ einen zweiten.
- Die Kachel „+" steht am Ende und nennt die Grenze „Anhang". Bei 100 Dateien
  zeigt sie „100 von 100" und nimmt nichts an.
- Leer: „Noch keine Dateien." und, mit Maus, „Hierher ziehen oder mit +
  hochladen." `entry.noFilesYet` wird neu gefasst.
- Eingeklappt zeigt der Blockkopf die Zahl der Dateien wie heute
  (`blockSummary`, `app.js:931`).
- Größe nach A1. Das Raster nimmt `repeat(auto-fill, minmax(…, 1fr))` wie
  `.thumbs` (`style.css:706-713`).
- `drawAtts()` aktualisiert Kacheln nach Nummer, statt `#atts` zu leeren. Es
  prüft vor dem Zeichnen, ob seine Ansicht noch steht.
- `.arow`, das `subgrid` der elf Spalten und die Regeln für das Telefon
  (`style.css:1691-1743`, `:2349-2354`) entfallen.

### BA 2 — Das Menü ⋯

Ein Bauteil für die Kachel und später für den Ordnerkopf. Am Rechner hängt es
an ⋯, am Telefon (`isNarrow()`) steht es als Liste am unteren Rand. Sein Kopf
nennt Name und, ab zwei Accounts, „Hochgeladen von … am …"; er ersetzt den
Tooltip der Zeile (`app.js:6103-6110`).

| heute an der Zeile | im Menü | sichtbar, wenn |
|---|---|---|
| Zeichen der zwei Personen (`.arights`) | „Bearbeiten durch alle" mit Haken | Office, eigene Datei, `edit` |
| Stift (`.aedit`) | „Bearbeiten" | Office, `edit`, nicht am Telefon |
| ⤢ (`.aopen`) | „Öffnen" (eigene Ansicht) | Datei mit Vorschau: PDF, Text, `.docx`, Office |
| Kette (`.alink`) | „Link auf diese Datei kopieren" | immer |
| ↓ (`.adl`) | „Herunterladen" | immer |
| ✕ (`.xdel`) | „Datei löschen", mit Rückfrage wie heute | eigene Datei oder Admin |
| ↶ nur in der eigenen Ansicht (`app.js:6820`) | auch „Vorige Fassung wiederherstellen" | `restore` |

- Was der Server abweisen würde, fehlt im Menü. Grundlage sind `mine`,
  `ADMIN`, `edit` und `restore` aus `detail()`; der Browser kennt die eigene
  Nummer nicht (`app.js:5251`).
- Kachel in Übertragung: „Abbrechen". Nach einem Fehler: „Erneut versuchen"
  und „Entfernen".
- Rolle `menu` mit `menuitem` und `menuitemcheckbox`; ↑ ↓, Enter, Esc;
  Umschalt+F10 öffnet es an der Kachel. Der Fokus kehrt zu ⋯ zurück, nach
  dem Löschen zur nächsten Kachel.

### BA 3 — Klick, Vorschau, Vollbild

| Datei | Rechner | Telefon |
|---|---|---|
| Bild | Vollbild; ← → blättern durch die Bilder der Gruppe | Vollbild |
| PDF, Text, `.docx`, Office | Vorschau unter der Gruppe | eigene Ansicht |
| ohne Vorschau (ZIP, Audio, Video bis 0.46.0), Kachel in Übertragung | Menü ⋯ | Menü am unteren Rand |

- **Vorschau:** ein eigener Knoten unter dem Kachelraster der Gruppe, volle
  Breite; Kopf mit Name · Größe · ⤢ · ↓ · ×; höchstens eine im Block. Ein
  Klick auf eine andere Kachel wechselt den Inhalt. Sie schließt mit ×, Esc,
  Klick auf dieselbe Kachel und wenn die Datei gelöscht wird; der Fokus geht
  zur Kachel. Der Knoten wird nie verschoben, weil ein `iframe` dabei neu
  lädt. `openPreview` (`app.js:6073`) wird eine Nummer statt eines Sets.
- **Office-Betrachter:** `destroyEditor()` nur, wenn seine Datei weg ist oder
  die Vorschau schließt. Ein Neuzeichnen lässt ihn stehen.
- **Vollbild:** `openLightbox` (`app.js:4318`) mit einem Zweig in
  `imageSource()` (`app.js:4286-4297`) für Bilddateien. Leiste: „Link
  kopieren", „Herunterladen", mit Recht „Löschen".
- **Adresse (F7):** `#/item/x/file/y` einer Bilddatei öffnet den Eintrag und
  darin das Vollbild, wie `showPhoto` (`app.js:5071-5078`). Die Marke in
  Kommentar und Beschreibung folgt der Adresse (`markupFileRef`,
  `app.js:2221-2241`). Andere Dateien öffnen die eigene Ansicht wie heute.
- **Rücksprung aus der eigenen Ansicht** (`fileReturn`, `app.js:6568-6573`):
  Block „Dateien" für diese Ansicht auf, Kachel in die Mitte, Fokus darauf.

### BA 4 — Hochladen

1. Die Kachel „+" öffnet die Dateiauswahl. Dateien lassen sich auf den ganzen
   Block ziehen; `dragover` reagiert nur auf `Files`. Heute öffnet der Browser
   eine dort abgelegte Datei im Tab. Einfügen aus der Zwischenablage bleibt bei
   der Bildleiste (`app.js:5176-5184`).
2. Der Browser prüft vorher Anzahl (100 je Eintrag, 20 je Auswahl) und Größe
   (Grenze „Anhang"). Scheitert eines, nennt er Datei und Grenze, und nichts
   geht hoch (wie `overLimit`, `app.js:67`).
3. Jede Datei erscheint sofort als Kachel mit „wartet". Übertragen wird eine
   Datei nach der anderen, die kleinste zuerst, über `XMLHttpRequest` wegen des
   Fortschritts, jede als eigene Anfrage an `POST /api/items/:id/attachments`.
   `sendForm` (`app.js:1060`) bleibt für die übrigen Formulare.
4. Am Ende der Toast „3 Dateien angehängt". Eine fehlgeschlagene Datei zeigt ⚠
   und den Grund; die übrigen gehen weiter.
5. Die Warteschlange steht auf Modulebene, nicht in `renderDetail`. Ein
   Wechsel des Eintrags hält sie nicht an. Beim Schließen des Tabs fragt der
   Browser (`beforeunload`), solange etwas wartet oder läuft.
6. Verbindung weg: Wiederholung nach 2, 5 und 15 s, dann ⚠ mit „Erneut
   versuchen".

### BA 5 — Server

- `ATTACHMENT_COUNT` (`server.js:3655`) wird zu zwei Konstanten: höchstens
  20 Dateien je Anfrage (multer, `server.js:3667`) und höchstens 100 je
  Eintrag (`server.js:3680-3683`).
- Die Prüfung je Eintrag bleibt ohne `await` zwischen Zählen und Schreiben,
  wie heute (`server.js:3673-3674`).
- `entry.fileLimitHint` (`de.json:786`) und `manual-de.md:345` bekommen die
  Zahl als Parameter, damit sie nicht an drei Stellen fest steht
  (Stolperstein 47).

### BA 6 — Texte

Neue und geänderte Schlüssel in `de.json`, `en.json` und `tr.json`, jeder mit
einem Leser im Code (`test/source.js:1986-2043`). Mindestens: Beschriftung
der Kachel und von ⋯, die Menüeinträge, die Zustände „wartet" und
„fehlgeschlagen", „Abbrechen", „Erneut versuchen", „Entfernen", die neue
Fassung von `entry.noFilesYet`, der Hinweis zum Ablegen, der Text von „+"
mit Grenze, „100 von 100". `entry.attachFiles` („+ Dateien anhängen") und die
Schlüssel, die nur die Zeile brauchte (`entry.clickToView`,
`entry.clickToCollapse`, `entry.clickToDownload`), entfallen, wenn kein Leser
bleibt.

### BA 7 — Der Prüfstand

Neues Modul `test/release_045.js` auf einer vorhandenen Portbasis
(`testbench.js:133-146`), eingetragen hinter `release_044`.

| | was gehalten wird |
|---|---|
| 1 | Ein Klick auf eine Datei ohne Vorschau öffnet das Menü und lädt nichts |
| 2 | Höchstens eine Vorschau im Block; ein Klick auf eine andere Kachel wechselt den Inhalt |
| 3 | Ein offener Office-Betrachter übersteht ein Neuzeichnen (kein `destroyEditor()`) |
| 4 | Das Menü zeigt nur Erlaubtes: fremde Datei ohne „Löschen", Admin mit; „Bearbeiten durch alle" nur an eigener Office-Datei |
| 5 | „Abbrechen" nimmt eine wartende Datei aus der Warteschlange; nichts geht hoch |
| 6 | `#/item/x/file/y` einer Bilddatei öffnet das Vollbild im Eintrag, auch über die Marke; eine PDF-Adresse öffnet die eigene Ansicht |
| 7 | 100 Dateien je Eintrag; die 101. wird mit `server.fileCap` abgewiesen; 21 Dateien in einer Anfrage ebenso |
| 8 | Jede Kachel und jeder Menüeintrag ist per Tastatur erreichbar; Rollen und `aria-*` wie in BA 2 |
| 9 | Die Warteschlange läuft weiter, wenn `renderDetail` einen anderen Eintrag zeichnet |
| 10 | Im Block erscheint nichts erst beim Überfahren |

**Gegenproben**, je eine: Download im Klick · Set statt Nummer für die
Vorschau · Neuzeichnen zerstört den Betrachter · Menüeinträge ohne Prüfung der
Rechte · „Abbrechen" ohne Wirkung · `renderFileView` für Bilder · Zählung je
Eintrag bei 20 · Warteschlange in `renderDetail`.

**Was mitgeht:**

- `test/release_044.js:457-477` erwartet die elf Spalten und entfällt.
- `test/ui_entry.js`, `test/release_042.js` bis `test/release_044.js`
  (87 Treffer) und 19 Rückbauten in `counterproof.js` mit wörtlichen
  Suchtexten (etwa `counterproof.js:8538`, `:9014-9028`) suchen künftig Kachel
  und Menü.
- Feste Zahlen: Dateien des Kommentarwächters 41 → 42
  (`test/selfcheck.js:387`), dazu `COMMENT_TOTAL`; Regelzeilen des
  Stilblatts neu gezählt (`test/source.js:1841`); Rückbauten
  (`test/selfcheck.js:18`) plus die Gegenproben. Routen, Tabellen,
  Austauschformat und Module bleiben.
- Der Prüfstand rechnet kein Layout (Stolperstein 29). Raster, Umbruch des
  Namens und Menü am Telefon prüft die Abnahme (Abschnitt 5).

### BA 8 — Dokumentation und Zahlen

- **`manual-de.md`:** „Tags, Dateien, Links" (Zeilen 341-366) und Zeile 450
  mit Kachel, Menü, Vorschau, Ablegen und 100 Dateien.
- **`Doku/Aenderungsprotokoll_0.45.0.md`** mit den Zahlen am fertigen Stand.
- **`CHANGELOG.md`:** `## [0.45.0]`.
- **`Doku/Fahrplan.md`:** Zeile 0.45.0 durchstreichen und füllen; der
  Abschnitt bekommt oben „Gebaut am …".
- **`package.json`** auf `0.45.0`, `package-lock.json` mit.
- **Die festen Zahlen** am fertigen Stand: Prüfungen, Rückbauten,
  Kommentarzeilen je Datei und Summe, Schlüssel der Sprachdateien, Regelzeilen
  des Stilblatts.
- **Der Fingerprint** mit `node tools/publish.js` am sauberen Arbeitsbaum, dann
  in CHANGELOG, Fahrplan und Änderungsprotokoll.

---

## 5. Abnahme im Betrieb

Der Betreiber prüft nach dem Einspielen:

1. Am Rechner und am Telefon (iPhone und Android) einen Eintrag mit Bild, PDF,
   `.docx`, `.xlsx` und ZIP öffnen. Breiten 344 bis 1440 px: drei Spalten bei
   344 px, der Name bricht in zwei Zeilen, ⋯ ist ohne Überfahren da.
2. Klick auf jede Kachel: Bild im Vollbild, PDF und Office in der Vorschau
   (am Telefon in der eigenen Ansicht), ZIP öffnet das Menü.
3. Fünf Dateien auf den Block ziehen, während des Uploads den Eintrag wechseln
   und zurückkehren; eine davon abbrechen.
4. Nur mit der Tastatur: Kachel wählen, Menü öffnen, Datei löschen.
5. Einen kopierten Link auf eine Bilddatei in einem neuen Tab öffnen.

---

## 6. Was nicht dazugehört

| | Grund |
|---|---|
| Videos abspielen, Vorschaubild eines Videos, Tasten im Vollbild für Videos | 0.46.0 |
| Ordner, „Ordner hinzufügen", „Verschieben nach …" | 0.47.0 |
| Zuweisung zum Testtag, Dateien auf der Platte, große Videos, Kopfleiste mit Fortschritt | 0.48.0 |
| Dateien umbenennen, Suche nach Dateinamen, Reihenfolge von Hand | nicht geplant (Konzept, Abschnitt 9) |
| Die Knöpfe an fremden Testtagzeilen | eigener Punkt, nicht Teil dieses Vorhabens |

---

## 7. Die Auflagen

1. `npm test` läuft vor jedem Push vollständig durch. Das Ergebnis wird
   genannt.
2. Keine Schemaänderung, keine neue Route. Eine vorhandene Datenbank arbeitet
   unverändert.
3. Die Kommentarregel gilt: höchstens drei Zeilen je Block, nie mehr Kommentar
   als Code, keine Versionsnummer, kein Verweis auf `Doku/`.
4. Kein Pull Request, wenn keiner verlangt wurde.
5. Kommt eine Frage auf, die hier nicht beantwortet ist, wird sie als
   Fragetafel gestellt. Antwortet niemand, gilt der einfachere Weg, der kein
   Verhalten ändert. Die Entscheidung steht im Änderungsprotokoll.
