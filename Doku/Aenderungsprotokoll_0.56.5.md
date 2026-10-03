# Änderungsprotokoll 0.56.5 — „Keine · Teilweise · 👍“

**Gebaut am 3. Oktober 2026 auf 0.56.4 (`a3a9e49`) nach
`Doku/Auftrag_0.56.5.md`. Fingerprint `859baa64`, davor `5d8a9336`.** PATCH.

Schema: nein. Austauschformat: bleibt 22. Routen: keine neue.
Sprachschlüssel: `list.shareFullHint` ist neu. Kein neuer Vorgang im
Sicherheitsprotokoll, keine neue Abhängigkeit.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 3. Oktober 2026 | Bildschirmfoto der Gruppe „◆ ★ Keine · Teilweise“: „Keine dann Teilweise (unter wert x) dann für bewertet oder geschätzt mehr als x (Finger+ ◆ ★) […] bricht ein bisschen den Stil aber ich möchte das mal probieren“ |
| 3. Oktober 2026 | Fragetafel: das dritte Feld heißt **👍** (Empfehlung); „wir haben aber drei status "keine" + weniger als x "Teilweise" + mehr als x "👍"“ |
| 3. Oktober 2026 | Fragetafel: **verbundene Leiste** (Empfehlung) |
| 3. Oktober 2026 | Fragetafel: ein **zweiter Klick** schaltet aus (Empfehlung) |
| 3. Oktober 2026 | Fragetafel: als **0.56.5** nach dem Push von 0.56.4 (Empfehlung) |

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.56.4.

| | 0.56.4 | 0.56.5 |
|---|---:|---:|
| Zeilen `public/app.js` | 12.657 | **12.658** |
| Schlüssel je Sprachdatei | 1.564 | **1.565** |
| Kommentarzeilen | 7.282 in 58 Dateien | **7.282** in 58 |
| Rückbauten | 1.850 | **1.856** |
| Prüfungen im Prüfstand | 8.349 | **8.354** |
| Zeilen `CHANGELOG.md` | 1.369 | **1.377** |

Anleitung, Zeilen: `manual.md` 952 → 953, `manual-de.md` 971 → 972,
`manual-tr.md` 952 → 952.

Kommentarzeilen: der Grenzwert für `public/style.css` steigt 526 → 527, der
für `test/release_056.js` sinkt 11 → 10; der Grund steht im Commit.
Regelzeilen im Stilblatt 2.045 → 2.050.

---

## 3. Was gebaut ist

- L1 `drawFilters()` zeigt in `#f-own` drei Felder: „Keine“ (`none`),
  „Teilweise“ (`partial`) und „👍“ (`full`). `SHARE_VALUES` nimmt `full` auf;
  ein gespeicherter Filter `own: 'full'` gilt beim Laden und in Ansichten. Der
  Server liefert `share` mit diesen drei Werten seit dem Filter „Eigene
  Werte“; genau bei der Schwelle gilt `full`.
- L2 Der Titel von 👍 ist `list.shareFullHint` („Mindestens 80 % der Kriterien
  mit eigenen Sternen“), darunter wie bei den beiden anderen Feldern die
  Wörter aus dem Vokabular.
- L3 `.pills.seg`: kein Abstand zwischen den Feldern, `margin-left: -1px`
  legt die Ränder übereinander, außen rund. Das gewählte und das berührte Feld
  liegen oben, damit ihr Rand ganz zu sehen ist. In Chromium geprüft, dunkel
  und hell, 1.280 und 412 px breit.
- L4 Ein zweiter Klick auf das gewählte Feld schaltet aus, wie bisher.

### Dokumentation

- Anleitung in drei Sprachen: die Leiste und 👍.

---

## 4. Der Prüfstand

**Neu** in `test/release_056.js`: die Gruppe „Uebersicht: Keine · Teilweise ·
👍 als Leiste“ mit 5 Prüfungen.

**Angepasst:** `test/release_056.js` (drei Felder in „Eigene Werte: eine
Gruppe in der Statuszeile“), `test/source.js` (2.050 Regelzeilen),
`test/release_053.js` (106 Abschnitte, 46 Fingerprints), `test/selfcheck.js`
(1.856 Rückbauten, Grenzwerte der Kommentare).

**Rückbauten.** 1947 bis 1952 neu. Gefahren gegen eine Kopie des
Arbeitsbaums, mit der erwarteten Gruppe als Filter: **6 von 6 rot**.

Volle Läufe vor dem Push:

1. 8.353 von 8.354: die Regel `.pills.seg .pill:hover, .pills.seg .pill.on`
   trug `z-index: 1`; das Stilblatt erlaubt nur die Stufen aus `:root`.
   `position: relative` allein zeichnet das Feld nach den Nachbarn; `z-index`
   entfällt.
2. **8.354 von 8.354** Prüfungen bestanden.
