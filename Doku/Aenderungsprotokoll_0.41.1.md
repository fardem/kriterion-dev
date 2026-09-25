# Änderungsprotokoll 0.41.1 — „Texte und Kommentare"

**Gebaut vom 23. bis 25. September 2026 auf 0.41.0. Fingerprint `dcbfdfb6`,
davor `d5aaeb21`.**

Die Runde ändert kein Verhalten des Servers. Schema und Austauschformat (19)
bleiben. Geändert sind die Texte der Oberfläche in drei Sprachen, README,
Handbuch, `.env.example`, `docker-compose.example.yml`, CLAUDE.md und die
Kommentare in allen 37 Quelltextdateien. Jeder Text der Oberfläche ist mit dem
Betreiber abgestimmt. Gebaut in den Pull Requests #230 bis #244.

---

## 1. Die Bilanz

Gemessen am fertigen Stand gegen 0.41.0.

| | 0.41.0 | 0.41.1 |
|---|---:|---:|
| Schlüssel je Sprachdatei | 1.258 | **1.186** |
| Zeilen README | 1.318 | **457** |
| Zeilen Handbuch | 1.622 | **620** |
| Kommentarzeilen, 15 ausgelieferte Dateien | 5.510 | **2.670** |
| Kommentarzeilen, 22 Dateien des Prüfstands | 11.340 | **3.740** |
| Kommentarzeilen, alle 37 Dateien | 16.850 | **6.410** |
| Anteil Kommentar an allen Zeilen | 19,6 % | **8,6 %** |
| Rückbauten | 1.149 | 1.141 |
| Prüfungen im Prüfstand | 7.410 | 7.362 |

---

## 2. Die Texte der Oberfläche

Abgestimmt in sechs Durchgängen: `login`, `dialog`, `mail`; `vocabulary`,
`list`, `entry`; Servermeldungen; die Karten der Einstellungen in drei Runden.

- **Ein Satz steht in einem Schlüssel.** 61 Sätze mit `tMark()`/`tMarks()` und
  13 aus mehreren Schlüsseln zusammengesetzte Sätze sind zusammengeführt. 68
  Schlüssel mit Bruchstücken sind entfernt.
- **Betonte Wörter stehen als `**Wort**` im Satz.** `tH()` setzt sie fett,
  `t()` lässt die Zeichen weg. `tMarks()` setzt nur noch HTML ein (`<code>`,
  `<span>`).
- **Die Rolle mit allen Rechten heißt „Eigentümer-Admin"**, englisch „Owner
  admin", türkisch „Sahip yönetici". Geändert in 16 Schlüsseln, 3 Stellen der
  README und 20 des Handbuchs.
- **Englische IT-Begriffe bleiben englisch:** Account, Update, Backup,
  Migration, Link, Cookie, Login. „Account" ersetzt „Zugang" und „Konto".
- Anweisungen im Infinitiv, Meldungen mit „du", keine rhetorischen Fragen.
- `entry.fileLimitHint` und `entry.photoOrderHint` nennen die eingestellte
  Grenze statt fest 50 MB und 20 MB.
- Türkisch: „parola belirle" statt „parola ayarla" an zehn Stellen; das Backup
  heißt „yedekleme", `yedek` allein steht auf der Verbotsliste.
- **Behoben:** abgebrochene oder falsche Sätze in `mailServerHint` (en, tr),
  `keyStillBeside` und `keyIntoEnv` (tr), `aloneOverLimit` (en, tr),
  `withoutServerSetting` und `ownEnginesHint` (tr) sowie Großschreibung mitten
  im Satz, die beim Zusammenführen entstanden war.

---

## 3. README, Handbuch und Konfigurationsdateien

- **Die README beschreibt Installation und Betrieb, das Handbuch die
  Bedienung.** Datenmodell, Sicherheit der Auslieferung, Bildablage und
  Prüfstand stehen in `Doku/Entwicklung.md`.
- Neu in der README: der Abschnitt „Backup zurückspielen".
- Die README beschrieb den Export als einen String mit einer Grenze von
  512 MB. Der Export wird stückweise geschrieben; die Grenze gilt je Eintrag
  und liegt bei rund 345 MB.
- Zitierte Protokollzeilen stehen auf Englisch, wie der Server sie schreibt.
- `.env.example` beschreibt nur die drei Einstellungen der Datei: 22 statt 43
  Zeilen. Der Schlüsselwert steht in der Karte „Kennzahlen", nicht in
  „Verschlüsselung".
- Die README nennt Idee, Konzept und Entwurf.
- CLAUDE.md ist neu gefasst: Abschnitt 2 „Was in einen Text gehört",
  Abschnitt 3 mit Regeln für Kommentare.

---

## 4. Die Kommentare

Gekürzt nach CLAUDE.md, Abschnitt 3. Entfernt sind Betonung in
Großbuchstaben, Überschriften, Geschichte, Versions-, Befund- und
Bauabschnittsnummern, Metaphern und Kommentare, die nur die Zeile darunter
oder den Namen einer Prüfung wiederholen.

| Datei | 0.41.0 | 0.41.1 |
|---|---:|---:|
| `server.js` | 1.591 | 848 |
| `public/app.js` | 1.970 | 977 |
| `public/style.css` | 1.223 | 505 |
| zwölf kleine Module, darunter `public/theme.js` | 726 | 340 |
| `test/roundtrip.js` | 3.312 | 1.309 |
| `counterproof.js` | 1.639 | 335 |
| übrige 19 Testdateien und `testbench.js` | 6.389 | 2.096 |

- Ein Prüfskript hat je Datei den Code ohne Kommentare mit dem Stand davor
  verglichen. Er ist gleich, bis auf die in Abschnitt 5 genannten Stellen und
  70 leere Template-Ausdrücke `${/* … */''}` in `public/app.js`.
- Veraltete Namen in Kommentaren sind berichtigt, zum Beispiel `warnFrom`,
  `state.inventory`, `validWeight`, `cropRectOf`, `encodeCommentImage`,
  `changeMark`, `createFirstUser`, `PHOTO_COLUMNS`.
- `test/selfcheck.js` prüft Obergrenzen je Datei und insgesamt, dazu höchstens
  25 Prozent Kommentar je ausgelieferter JavaScript-Datei. `node
  tools/comments.js --write` senkt die Obergrenzen nach dem Kürzen.
- In ausgelieferten Dateien stehen noch drei Zahlen der Form x.y.z: `1.1.1970`
  in `twofactor.js` und zwei SVG-Pfade in `public/app.js`. Keine davon ist eine
  Versionsangabe.

---

## 5. Der Prüfstand

**Prüfungen, die Wortlaut festhielten, prüfen jetzt Regeln.** Entfernt sind
die Vergleichsdateien der Sprachstände (`tools/englisch-0312.json`,
`tools/tuerkisch-0313.json`, `tools/wording-0681d42.json`,
`tools/placeholders-0243.json` und zwei Werkzeuge dazu, zusammen 4.061
Zeilen), feste Schlüssel- und Satzzahlen und Prüfungen auf den Wortlaut von
Kommentaren. Geblieben sind gleiche Schlüssel und Platzhalter in allen drei
Sprachen, die Verbotslisten und der Satz- und Längenvergleich zum Deutschen.
Neu ist `shows(text, key)` in `test/dom.js`: es prüft einen Text der
Oberfläche über seinen Schlüssel.

**Vier Gegenproben blieben stumm.** Jede hat eine Prüfung bekommen:

| Rückbau | was fehlte |
|---|---|
| 558 | Die Prüfung der Rechte beim Aufräumen der Backups erreichte die Route nie mit Freigabe. Jetzt tragen alle drei Benutzer das Passwort. |
| 1172 | Kein Test fragte einen Schlüssel, auf den der Server nicht antwortet. |
| 514 | Kein Test legte eine Zeile an, aus der `makeVariants()` keine Kachel macht. |
| 1068 | Kein Test legte einen gespeicherten Wert außerhalb der Stufen an. |

**Code außerhalb von Kommentaren geändert:**

- Rückbau 1204 sucht die Codezeile `const spW = spDom.w;` statt eines
  Kommentars.
- `test/selfcheck.js` sucht in `test/frame.js` die Codezeile
  `for (const l of CASES) …` statt eines Kommentars. Der neue Rückbau 1221
  prüft diese Reihenfolge.
- `test/source.js` verlangt mindestens 5.000 gelesene Kommentarzeilen statt
  10.000.
- `test/release_031.js`: der Prüfname nennt drei Schlüssel; `DS_PLAIN_WORD`
  hat drei.

**Rückbauten: 1.149 → 1.141.** Entfernt sind 12, deren Gegenstand entfallen
ist; neu sind 1218 bis 1221. In den Gegenproben dieser Runde blieb am
Ende kein Rückbau stumm.
