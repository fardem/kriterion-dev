# Änderungsprotokoll 0.56.6 — „Import, Ansicht ohne Recht, Infos, Sperre der Datenbank“

**Gebaut am 3. Oktober 2026 auf 0.56.5 (`83b450e`) nach
`Doku/Auftrag_0.56.6.md`. Fingerprint `55fa87e4`, davor `859baa64`.** PATCH.

Schema: nein. Austauschformat: bleibt 22. Routen: keine neue;
`POST /api/import` antwortet 507, wenn der Platz für den Inhalt fehlt.
Sprachschlüssel: keiner neu. Prüfschalter: `relocate=<ms>` ist neu. Kein neuer
Vorgang im Sicherheitsprotokoll, keine neue Abhängigkeit.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 3. Oktober 2026 | Fragetafel: in die Runde kommen F24 und F44, F42, Infos (PDF-Objektstrom, ZIP64), die Untersuchung des Papierkorb-Laufs und die Bereinigung von `Doku/Fehler_und_Ideen.md` |
| 3. Oktober 2026 | Fragetafel zu F42: „Anschaubar ohne bearbeiten. Kein neue Kategorie anlegen option zu sehen. Nur schauen ohne Knöpfe die was ändern können. Ohne Knopf muss auch nichts abgewiesen werden. Dennoch muss die Funktion prüfen ob der der was machen möchte das auch darf“ |
| 3. Oktober 2026 | Fragetafel zu fremden Testtagen: „Auch hier. Jeder darf bewerten aber kann kein status umsetzen“ |
| 3. Oktober 2026 | Fragetafel: Infos aus dem ersten und letzten MiB (Empfehlung); alle Transaktionen mit `BEGIN IMMEDIATE` (Empfehlung) |
| 3. Oktober 2026 | Fragetafel: ein fremder Testtag setzt „Getestet“ wie bisher (Empfehlung) |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.56.5.

| | 0.56.5 | 0.56.6 |
|---|---:|---:|
| Zeilen `public/app.js` | 12.658 | **12.695** |
| Zeilen `server.js` | 8.502 | **8.519** |
| Schlüssel je Sprachdatei | 1.565 | **1.565** |
| Kommentarzeilen | 7.282 in 58 Dateien | **7.297** in 58 |
| Rückbauten | 1.856 | **1.885** |
| Prüfungen im Prüfstand | 8.354 | **8.367** |
| Zeilen `CHANGELOG.md` | 1.377 | **1.393** |

Anleitung, Zeilen: `manual.md` 953 → 961, `manual-de.md` 972 → 980,
`manual-tr.md` 952 → 960. README unverändert.

Kommentarzeilen: die Grenzwerte steigen für `public/app.js` 1.212 → 1.214,
`server.js` 1.093 → 1.095, `public/style.css` 527 → 528, `db.js` 56 → 58,
`attachments.js` 69 → 74, `test/release_050.js` 9 → 11 und
`test/release_056.js` 10 → 11; die Gründe stehen im Commit. Regelzeilen im
Stilblatt 2.050 → 2.056.

---

## 3. Was gebaut ist

### Import

- F24 `POST /api/import` prüft nach dem Hochladen und vor dem Lesen mit
  `spaceShort()`, ob drei Viertel der Datei Platz haben: so viel ergibt der
  Base64-Inhalt entpackt, als Dateien in `files/` und Fotos in der Datenbank.
  Dazu rechnet `spaceShort()` die Datenbank und 1 GB Reserve. Fehlt der Platz,
  antwortet der Server 507 mit den Zahlen aus `server.diskSpace`. Vorher prüfte
  `importSpace()` nur den Platz für die hochgeladene Datei.
- F44 `exchangeFromFile()` gibt `close()` mit zurück; die Route ruft es in
  `finally`. Eine Datei mit zu altem Format brach vor dem ersten Eintrag ab;
  der Generator war nie gestartet und lief deshalb nicht durch sein
  `finally`. Die gelöschte Datei blieb offen, ihr Platz belegt bis zum
  Neustart.

### Ansicht ohne Recht

- F42 `mayEdit()` in `renderDetail()`: Verfasser des Eintrags oder Admin, wie
  `entryFree()` im Server. Ohne Recht:
  - Titel als `<h1 class="title-text">`, Status als Text (`.state`), Kategorie
    als Text, ohne „Neue Kategorie“.
  - Beschreibung ohne Stift; ein Klick öffnet kein Feld; leer steht
    „— keine —“.
  - Keine Ablage für Fotos und Videos, kein Einfügen aus der Zwischenablage.
  - Kein Ausschnitt, kein Löschen im Bild, an den Miniaturen und im Vollbild,
    kein „Auswählen“, kein Ziehen von Fotos und Links.
  - Tags ohne ×, ohne Wolke, ohne Eingabe.
- Für Verfasser und Admin zeigt die Seite nach einer Absage wieder den
  gespeicherten Stand: Titel, Beschreibung (bei 403), Kategorie, Ausschnitt,
  Reihenfolge der Fotos und der Links.
- T1 Fremde Testtage: die Note als Sterne ohne Auswahl (`stars()` ohne
  `onPick`), × nur für Verfasser des Testtags und Admin, Tags nur für den
  Verfasser. Ist der Eintrag ungetestet, steht der Hinweis „Getestet
  einschalten“ nur für Verfasser und Admin, sonst „— keine —“.
- Der Server prüft weiter jede Änderung; an seinen Regeln ändert sich nichts.

### Infos

- I1 PDF: `pdfObjectStreams()` entpackt gepackte Objektströme
  (`/Type /ObjStm`, FlateDecode) im ersten und letzten MiB, höchstens 32. Liegt
  `/Info` nicht als `n 0 obj` im Text, kommt das Wörterbuch aus dem Strom; der
  Seitenbaum ebenso. `/Length` darf indirekt sein, dann gilt `endstream`. Bei
  `/Encrypt` wird nichts entpackt.
- I2 ZIP64: steht im Ende des Verzeichnisses `0xFFFF` oder `0xFFFFFFFF`, liest
  `zipParts()` Locator und ZIP64-Record; Größen und Lage im zentralen
  Verzeichnis kommen bei `0xFFFFFFFF` aus dem Extrafeld `0x0001`. Gilt für
  Office und OpenDocument.

### Sperre der Datenbank

Der rote Lauf von „Der Papierkorb: der Rundlauf“ beim Bau von 0.56.4: Die
Umlagerung beim Start war nach 10 s nicht fertig.

- Ursache: `commitFull()` begann die Transaktion mit `BEGIN`, las und schrieb
  dann. SQLite ruft beim Wechsel vom Lesen zum Schreiben den Busy-Handler nicht
  auf; hält eine andere Verbindung die Schreibsperre, kommt sofort
  `SQLITE_BUSY`. Gemessen mit zwei Verbindungen: `BEGIN` scheitert nach 1 ms,
  `BEGIN IMMEDIATE` wartet 5.016 ms. Andere Verbindungen sind der Worker in
  `batchrun.js` (startet etwa 1,5 s nach dem Start), `usertool.js` und im Test
  die direkten Zugriffe auf die Datei.
- Folge: Der Fehler brach die ganze Umlagerung ab; der nächste Versuch kam erst
  mit dem stündlichen Lauf.
- D1 `open()` in `db.js` lässt `db.transaction()` mit `BEGIN IMMEDIATE`
  beginnen; verschachtelt bleibt es ein `SAVEPOINT`. Das gilt für alle 23
  Transaktionen in `server.js`, `auth.js` und `db.js` und für den Worker.
- D2 `relocate()` fängt Fehler je Datei ab, schreibt `Relocation of file <id>:
  <Code>` ins Protokoll und versucht es nach einer Minute wieder
  (`RELOCATE_AGAIN_MS`, Prüfschalter `relocate`). Ein übersprungener Aufruf
  während einer laufenden Umlagerung läuft danach nach.
- Die Prüfung in `test/roundtrip.js` nennt bei einem Fehlschlag die Zeilen
  des Servers zu `Disk run`, `Relocation` und `locked`.

### Dokumentation

- Anleitung in drei Sprachen: Ansicht ohne Recht, Platzprüfung beim Import.
- `Doku/Entwicklung.md`: `BEGIN IMMEDIATE`, Prüfschalter `relocate`.
- `Doku/Fehler_und_Ideen.md`: die Tafel „offene Punkte“ auf dem Stand vom
  3. Oktober 2026; 52 und die Infos gebaut, 0.38.6 bis 0.52.0 gestrichen.
- `Doku/Vorschlaege_Claude_0.56.x.md`: F24, F42 und F44 entfallen; F58 ist
  neu (der Worker führt beim Laden die Schreibanweisungen von `db.js` aus).

---

## 4. Der Prüfstand

**Neu:**

- `test/release_056.js`:
  - „Import: Platz fuer den Inhalt, die Datei wird geschlossen“ mit `free=` und
    einem Blick in `/proc/<pid>/fd`.
  - „Infos: PDF mit gepacktem Objektstrom, Office als ZIP64“ mit Testdateien
    aus dem Code.
  - „Detailansicht ohne Recht: nur ansehen“.
  - „Detailansicht: nach einer Absage gilt der gespeicherte Stand“.
- `test/release_050.js`: „Umlagerung: eine zweite Verbindung haelt die
  Schreibsperre“. `hold=4000` hält die Datei vor dem Commit; der Test hält die
  Schreibsperre 5 s (der Commit wartet und gelingt) und 9,5 s (der Commit
  scheitert nach 5 s, die Wiederholung gelingt). Ohne `BEGIN IMMEDIATE` ist
  die erste Prüfung rot: `Relocation of file 6: SQLITE_BUSY`.

**Angepasst:** `test/roundtrip.js` (Meldung zur Umlagerung), `test/ui_system.js`
(„Anlegen-Schalter in der Oberflaeche“ als Verfasser des Eintrags; ohne Recht
fehlen Auswahl und Tag-Wolke jetzt zu Recht), `test/source.js` (2.056
Regelzeilen, 85 Protokollzeilen), `test/release_053.js` (107 Abschnitte,
47 Fingerprints), `test/selfcheck.js` (1.885 Rückbauten, Grenzwerte der
Kommentare).

**Rückbauten.** 1953 bis 1981 neu; 953, 1201, 1287, 1303, 1485 und 1612 mit
neuem Suchtext. Gefahren gegen eine Kopie des Arbeitsbaums, mit der erwarteten
Gruppe als Filter: **35 von 35 rot**.

Volle Läufe vor dem Push:

1. 7.532 von 7.538, dazu brachen `ui_entry` und `ui_system` ab: die Zahl der
   Protokollzeilen (83 statt 85), die Gruppe „Anlegen-Schalter in der
   Oberflaeche“ ohne Verfasserrecht, `onclick` am Stift der Beschreibung, das
   Wort „yedek“ allein in der türkischen Anleitung.
2. **8.367 von 8.367** Prüfungen bestanden.
