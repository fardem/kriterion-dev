# Auftrag 0.56.5 — „Keine · Teilweise · 👍“

**Aufgestellt am 3. Oktober 2026.** Grundlage ist ein Bildschirmfoto der
Gruppe „◆ ★ Keine · Teilweise“ in der Statuszeile der Übersicht und der
Wunsch des Betreibers nach einer Umschaltleiste mit drei Feldern.

Zeilennummern gelten für `a3a9e49`.

---

## 0. Vor dem Bau: die offenen Fragen

### Vorgaben des Betreibers

| Nr. | Punkt | Vorgabe |
|---|---|---|
| V1 | alle | „Keine dann Teilweise (unter wert x) dann für bewertet oder geschätzt mehr als x (Finger+ ◆ ★) […] bricht ein bisschen den Stil aber ich möchte das mal probieren“ (Chat, 3. Oktober 2026) |
| V2 | alle | „wir haben aber drei status "keine" + weniger als x "Teilweise" + mehr als x "👍"“ (Fragetafel, 3. Oktober 2026) |

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | Wie heißt das dritte Feld? | 👍 · 👍 ◆ ★ · „Vollständig“ · „≥ 80 %“ | **👍** (Empfehlung); ◆ ★ bleibt vorn als Beschriftung |
| F2 | Welche Form hat die Leiste? | verbundene Leiste · einzelne Pillen wie heute | **verbundene Leiste** (Empfehlung) |
| F3 | Wie kommt man zurück zu allen Einträgen? | zweiter Klick · eigenes Feld „Alle“ | **zweiter Klick** (Empfehlung) |
| F4 | In welche Version? | 0.56.5 · noch in 0.56.4 | **0.56.5** (Empfehlung) |

---

## 1. Die Punkte

| Nr. | Fix |
|---|---|
| L1 | `drawFilters()` (`public/app.js:3596`): drittes Feld „👍“ mit dem Wert `full`. `SHARE_VALUES` (`public/app.js:2762`) nimmt `full` auf. Der Server liefert `share` schon mit `none`, `partial` und `full` (`server.js:3433`); genau bei x % gilt `full` |
| L2 | Tooltip des dritten Felds: `list.shareFullHint` mit `{share}`, darunter wie bei den beiden anderen die Wörter aus dem Vokabular |
| L3 | `#f-own` als verbundene Leiste: ein Rahmen, 1 px Trennlinie, außen rund. Das gewählte Feld orange wie `.pill.on` |
| L4 | Ein zweiter Klick auf das gewählte Feld schaltet den Filter aus, wie heute |

---

## 2. Prüfstand und Dokumentation

- Neue Gruppe in `test/release_056.js`, Rückbauten je Punkt.
- Anleitung in drei Sprachen.
- CHANGELOG, Änderungsprotokoll 0.56.5, Fahrplan. Version 0.56.5,
  Fingerprint.
