# Änderungsprotokoll 0.44.2 — „Der Name an der Linkzeile rechts"

**Gebaut am 27. September 2026 auf 0.44.1. Fingerprint `46ae4e39`, davor
`8237adde`.**

Befund des Betreibers vom 27. September 2026, nach 0.44.1. Schema: nein.
Austauschformat: 20.

---

## 1. Vorgaben des Betreibers

Die Fragetafel ist vor dem Bau beantwortet worden, am 27. September 2026.

| Frage | Antwort |
|---|---|
| F1. Wo steht der Name des Accounts in der Linkzeile? | eigene Spalte vor ↗, wie bei den Dateien; ↗ und ✕ ebenfalls in festen Spalten |
| F2. Und auf dem Telefon? | auch dort rechts, in derselben Spalte |
| F3. Welche Version? | eigene Version 0.44.2, nach dem Merge von 0.44.1 |

---

## 2. Was sich ändert

| | 0.44.1 | 0.44.2 |
|---|---|---|
| Name des Accounts an der Linkzeile | zweite Zeile, direkt hinter Pfad oder Anbieternamen (`.lbottom > .lfrom`) | eigenes Element vor ↗ (`.lrow > .lfrom`), rechts, senkrecht mittig |
| ↗ an Zeilen ohne ✕ | 33 px weiter rechts | in derselben Spalte wie überall |

`#links` ist ein Raster mit sechs benannten Spalten: `grip`, `num`, `url`,
`from`, `go`, `del`. Jede Zeile übernimmt sie mit
`grid-template-columns: subgrid`, wie `#atts` seit 0.44.1. Die Regeln stehen in
`@supports (grid-template-columns: subgrid)`; ein Browser ohne `subgrid` zeigt
die Zeile als Flex-Zeile mit dem Namen vor ↗.

Gemessen in Chromium (`headless_shell` 1194) mit `public/style.css` und sechs
Linkzeilen, x-Position in px:

| | Fenster | Name | ↗ |
|---|---:|---:|---:|
| 0.44.1 | 1.200 | 98 bis 318 | 1.104 oder 1.137 |
| 0.44.2 | 1.200 | 1.037 in allen | 1.104 in allen |
| 0.44.1 | 390 | 68 bis 279 | 324 oder 357 |
| 0.44.2 | 390 | 257 in allen | 324 in allen |

Eine Linkzeile ohne Pfad ist jetzt einzeilig, 42 statt 55 px hoch: vorher
stand der Name in ihrer zweiten Zeile. Mit nur einem Account war das schon
vorher so. `limitLinks()` rechnet die sichtbare Höhe weiter mit der Höhe der
ersten Zeile.

---

## 3. Die Bilanz

| | 0.44.1 | 0.44.2 |
|---|---:|---:|
| Regelzeilen des Stilblatts | 1.738 | **1.750** |
| Kommentarzeilen, 41 Dateien | 6.567 | **6.568** |
| Rückbauten | 1.222 | **1.226** |
| Prüfungen im Prüfstand | 7.533 | **7.534** |

Kommentargrenze mit `node tools/comments.js --write` angehoben:
`public/style.css` 517 → 518 (Verweis auf `#atts` am neuen Block).

---

## 4. Der Prüfstand

`test/ui_entry.js`, Gruppe „Der Name an der Linkzeile“: zwei Prüfungen
verlangten den Namen in der zweiten Zeile und verlangen jetzt die eigene
Spalte vor ↗, an Adress- und Suchzeile. Die Prüfung der Regel für `.lfrom`
liest `.lrow .lfrom` statt `.lbottom .lfrom`. Neu: alle Linkzeilen in
denselben Spalten, in der Reihenfolge der Zeile.

`test/release_044.js` sucht den Block mit `subgrid` jetzt über `#atts`: der
Block der Linkliste steht im Stilblatt weiter oben.

Angepasst: `test/source.js` 1.750 Regelzeilen, `test/selfcheck.js` 1.226
Rückbauten und die Kommentargrenzen.

Rückbauten, alle erwartet in „Der Name an der Linkzeile“:

| Nr | Rückbau |
|---|---|
| 1303 | Der Name steht wieder hinter dem Pfad |
| 1304 | Die Linkzeile übernimmt die Spalten der Liste nicht |
| 1305 | Das Kreuz der Linkzeile hat keine eigene Spalte |
| 1306 | Der Name an der Linkzeile darf wieder schrumpfen |
