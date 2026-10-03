# Änderungsprotokoll 0.56.2 — „Ein Name „Infos““

**Gebaut am 3. Oktober 2026 auf 0.56.1 (`e5919b3`). Fingerprint `df009920`,
davor `a8fe80d0`.** PATCH.

Schema: nein. Austauschformat: bleibt 22. Routen: keine neue. Am Server ändert
sich nichts. Der Sprachschlüssel `entry.docInfo` entfällt. Kein neuer Vorgang im
Sicherheitsprotokoll, keine neue Abhängigkeit.

Gebaut als Nachtrag zu 0.56.1 in PR #283 (Commit `98b0155`). #283 war vor dem
Push gemergt; daher eine eigene Version.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 3. Oktober 2026 | Nach dem Push von #283: „Manchmal heißen die Infos von Media info Infos manchmal erweiterte Infos. Bitte vereinfachen. Entere45 mediainfo oder nur info“ |
| 3. Oktober 2026 | Fragetafel: überall „Infos“ (Empfehlung); in PR #283 als Teil von 0.56.1 (Empfehlung) |
| 3. Oktober 2026 | Fragetafel, nachdem #283 vor dem Push gemergt war: eigene Version 0.56.2 (Empfehlung) |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.56.1.

| | 0.56.1 | 0.56.2 |
|---|---:|---:|
| Zeilen `public/app.js` | 12.584 | **12.581** |
| Schlüssel je Sprachdatei | 1.561 | **1.560** |
| Kommentarzeilen | 7.263 in 58 Dateien | 7.263 in 58 |
| Rückbauten | 1.753 | **1.754** |
| Prüfungen im Prüfstand | 8.284 | **8.286** |
| Zeilen `CHANGELOG.md` | 1.304 | **1.312** |

Anleitung, Zeilen: `manual.md` 942 → 941, `manual-de.md` 962 → 962,
`manual-tr.md` 948 → 946. README: je Sprache zwei Stellen mit „Infos“, die
Zeilenzahl bleibt.

---

## 3. Was gebaut ist

- `entry.docInfo` entfällt. `entry.mediaInfo` heißt „Infos“, „Info“ und
  „Bilgi“ und steht im Menü ⋯ von Bildern, Videos und Dokumenten, an ⓘ im
  Vollbild und als Titel des Dialogs.
- `fileMenu()` baut den Punkt mit einer Bedingung für alle drei Arten;
  `documentInfo()` und der Parameter `title` von `showMediaInfo()` entfallen.
- Anleitung in drei Sprachen: „Infos zu Bildern und Videos“ und „Infos zu
  Dokumenten“. README in drei Sprachen: zwei Stellen je Sprache.
- `Doku/Entwicklung.md` und `Doku/Vorschlaege_Claude_0.56.x.md` nennen „Infos“.

---

## 4. Der Prüfstand

**Neu** in `test/release_056.js`: die Gruppe „Infos: ein Name fuer Bilder,
Videos und Dokumente“ mit 2 Prüfungen.

**Angepasst:** `test/release_045.js`, `test/release_052.js` und
`test/release_054.js` (`entry.mediaInfo` statt `entry.docInfo`, „Infos“ auch
bei Bildern und PDF, Überschriften der Anleitung), die Namen einzelner
Prüfungen in `test/release_052.js` bis `test/release_055.js`,
`test/release_053.js` (103 Abschnitte, 43 Fingerprints), `test/selfcheck.js`
(1.754 Rückbauten). Gruppennamen wie „Erweiterte Infos: Quelltext“ bleiben; die
Rückbauten verweisen auf sie.

**Rückbauten.** 1850 neu. 1557, 1644, 1669 und 1769 mit neuem Suchtext, 1645
mit neuem Namen. Gefahren je Modul gegen eine Kopie des Arbeitsbaums: 1557
gegen `test/release_052.js`, 1644, 1645 und 1669 gegen `test/release_054.js`,
1769 gegen `test/release_055.js`, 1850 gegen `test/release_056.js`: **6 von 6
rot**.

Der volle Lauf vor dem Commit: **8.286 von 8.286** Prüfungen bestanden.
