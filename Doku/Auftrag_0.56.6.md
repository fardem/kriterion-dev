# Auftrag 0.56.6 — „Import, Ansicht ohne Recht, Infos, Sperre der Datenbank“

**Aufgestellt am 3. Oktober 2026.** Grundlage sind die offenen Punkte aus
`Doku/Vorschlaege_Claude_0.56.x.md` und `Doku/Fehler_und_Ideen.md` und der rote
Lauf von „Der Papierkorb: der Rundlauf“ beim Bau von 0.56.4.

Zeilennummern gelten für `83b450e`.

---

## 0. Vor dem Bau: die offenen Fragen

### Vorgaben des Betreibers

| Nr. | Punkt | Vorgabe |
|---|---|---|
| V1 | alle | Fragetafel: F24 und F44, F42, Infos (PDF-Objektstrom, ZIP64) und die Untersuchung des Papierkorb-Laufs; dazu die veraltete Tafel in `Doku/Fehler_und_Ideen.md` bereinigen (3. Oktober 2026) |
| V2 | F42 | „Anschaubar ohne bearbeiten. Kein neue Kategorie anlegen Option zu sehen. Nur schauen ohne Knöpfe die was ändern können. Ohne Knopf muss auch nichts abgewiesen werden. Dennoch muss die Funktion prüfen ob der der was machen möchte das auch darf“ (Fragetafel, 3. Oktober 2026) |
| V3 | Testtage | „Auch hier. Jeder darf bewerten aber kann kein status umsetzen“ (Fragetafel, 3. Oktober 2026) |

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | Wie sieht die Detailansicht ohne Recht aus? | ausblenden und sperren · nur sperren · nur zurücksetzen | **nur ansehen, keine Knöpfe, die etwas ändern** (V2) |
| F2 | Fremde Testtage mitnehmen? | mitnehmen · eigene Runde | **mitnehmen** (V3) |
| F3 | Wie weit liest „Infos“ gepackte Objektströme? | erstes und letztes MiB · Querverweise auswerten | **erstes und letztes MiB** (Empfehlung) |
| F4 | Wie weit wird die Sperre der Datenbank behoben? | alle Transaktionen · nur die Umlagerung | **alle Transaktionen** (Empfehlung) |
| F5 | Ein Fremder legt einen Testtag an: was wird aus dem Status? | wird „Getestet“ wie heute · Status bleibt · Fremde ohne Testtag | **wird „Getestet“ wie heute** (Empfehlung) |

---

## 1. Die Punkte

### Import

| Nr. | Fix |
|---|---|
| F24 | `POST /api/import` prüft vor dem Lesen mit `spaceShort()`, ob drei Viertel der Datei (der entpackte Base64-Inhalt) Platz haben; sonst 507 |
| F44 | `exchangeFromFile()` gibt `close()` zurück; die Route schließt die Datei in `finally`. Ein nie gestarteter Generator lief nicht durch sein `finally`, die Datei blieb bis zum Neustart offen |

### Ansicht ohne Recht

Gilt für alle, die weder Verfasser des Eintrags noch Admin sind
(`item.mine !== true && !ADMIN`). Der Server prüft weiter jede Änderung.

| Nr. | Fix |
|---|---|
| F42 | Titel, Beschreibung, Status und Kategorie als Text; keine Ablage für Fotos und Videos, kein Einfügen; keine Tag-Eingabe, kein × an Tags, keine Tag-Wolke; kein „Neue Kategorie“; kein Ausschnitt, kein Löschen von Fotos (auch nicht im Vollbild); kein Ziehen von Fotos und Links |
| F42 | Für Verfasser und Admin: nach einer Absage zeigt die Seite wieder den gespeicherten Stand (Titel, Beschreibung, Kategorie, Ausschnitt, Reihenfolge) |
| T1 | Fremde Testtage: Note, ×, Tags nur lesen; der Hinweis „Getestet einschalten“ erscheint nur, wer schalten darf. Jeder legt weiter eigene Testtage an; ein Testtag setzt „Getestet“ wie bisher (F5) |

### Infos

| Nr. | Fix |
|---|---|
| I1 | PDF: `/Info` und der Seitenbaum aus gepackten Objektströmen (`/Type /ObjStm`) im ersten und letzten MiB; nicht bei `/Encrypt` |
| I2 | Office und ODF als ZIP64: Locator, ZIP64-Record und Extrafeld `0x0001` |

### Sperre der Datenbank

| Nr. | Fix |
|---|---|
| D1 | Jede Transaktion beginnt mit `BEGIN IMMEDIATE` (`db.js`). Eine Transaktion, die erst liest und dann schreibt, scheiterte mit `BEGIN DEFERRED` sofort mit `SQLITE_BUSY`, wenn eine andere Verbindung schrieb (Worker, `usertool.js`); der Busy-Timeout von 5 s griff nicht. Gemessen: 1 ms statt 5.016 ms |
| D2 | Die Umlagerung fängt Fehler je Datei ab und versucht es nach einer Minute wieder, statt nach einer Stunde |

### Dokumentation

- `Doku/Fehler_und_Ideen.md`: die Tafel „offene Punkte“ auf den Stand bringen.
- `Doku/Vorschlaege_Claude_0.56.x.md`: F24, F42, F44 entfallen; neuer Punkt:
  der Worker führt beim Laden die Schreibanweisungen von `db.js` erneut aus.

---

## 2. Prüfstand und Dokumentation

- Neue Gruppen in `test/release_056.js`, Rückbauten je Punkt.
- Anleitung in drei Sprachen, wo sich Verhalten ändert.
- CHANGELOG, Änderungsprotokoll 0.56.6, Fahrplan. Version 0.56.6,
  Fingerprint.
