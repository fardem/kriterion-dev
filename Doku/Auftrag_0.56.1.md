# Auftrag 0.56.1 — „Filter „Eigene Werte“, Vollbild am Telefon“

**Aufgestellt am 3. Oktober 2026.** Grundlage sind die Zeile 0.56.1 in
`Doku/Fahrplan.md` und `Doku/Vorschlaege_Claude_0.56.x.md`. Die Punkte B2 bis
B8 waren dort die Vorschläge V1 bis V4, V6, V7, V9 und V10; nach dem Bau sind
sie dort entfernt. F1 bis F7 sind am 3. Oktober 2026 in
zwei Fragetafeln beantwortet.

Zeilennummern gelten für `3c57a9a`.

---

## 0. Vor dem Bau: die offenen Fragen

### Vorgaben des Betreibers

| Nr. | Punkt | Vorgabe |
|---|---|---|
| V1 | B1 | Die Zeile „Potenzial / Bewertung: Alle · Keine · Teilweise“ entfällt. Am Ende der Statuszeile steht die Gruppe „Eigene Werte: Keine · Teilweise“, ohne „Alle“; ein zweiter Klick schaltet aus (Fragetafel, 2. Oktober 2026) |
| V2 | B1 | Ungetestete Einträge zählen mit dem Potenzial, getestete mit der Bewertung. Getestete Einträge lassen sich nicht mehr nach fehlendem Potenzial filtern (Fragetafel, 2. Oktober 2026) |
| V3 | alle | Gebaut als 0.56.1 nach der Durchsicht des Repositorys (Fragetafel, 2. Oktober 2026) |
| V4 | B2 bis B8 | Aus den Vorschlägen kommen V1 bis V4, V6, V7, V9 und V10 in diese Runde. Die Fehler F1 bis F54 und die Vorschläge zum Stil kommen nicht (Fragetafel, 3. Oktober 2026) |
| V5 | — | Der Höchstwert der Bitrate eines Proxys bleibt 10 Mbit/s (Fragetafel, 3. Oktober 2026) |
| V6 | — | `Doku/Vorschlaege_Claude_0.56.x.md` kommt mit 0.56.1 ins Repository (Fragetafel, 3. Oktober 2026) |

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | B1: gespeicherte Filter und Ansichten mit „Potenzial“ oder „Bewertung“? | entfallen beim Laden; eine solche Ansicht zeigt danach mehr Einträge · werden zu „Eigene Werte“, wenn nur einer gesetzt ist | **entfallen** (Empfehlung) |
| F2 | B1: Beschriftung der Gruppe? | immer „Eigene Werte“; der Titel der Knöpfe nennt, was zählt · folgt dem Status: „Potenzial“ bei Ungetestet, „Bewertung“ bei Getestet, sonst „Eigene Werte“ | **immer „Eigene Werte“** (Empfehlung) |
| F3 | B1: Ohne Potenzialmodus haben ungetestete Einträge keinen Wert, an dem der Filter misst. Bei „Keine“ oder „Teilweise“? | fallen heraus, wie heute bei „Bewertung“ · zählen als „Keine“ | **fallen heraus** (Empfehlung) |
| F4 | B2: Was weicht am Telefon quer für das Bild? | der Streifen; die Kopfzeile wird flacher · Kopfzeile und Streifen blenden sich nach 3 s aus, ein Tipp zeigt sie | **der Streifen** (Empfehlung) |
| F5 | B4: Wischen auf einem Video? | nicht auf dem Video, nur daneben · auf dem Video außer im unteren Streifen von 64 px | **nicht auf dem Video** (Empfehlung) |
| F6 | B5: Wo stehen ✕ und 🗑? | ✕ immer oben rechts außen, 🗑 vorn in der Knopfleiste · ✕ oben rechts außen, 🗑 direkt links davon mit 24 px Abstand | **🗑 vorn** (Empfehlung) |
| F7 | B6: Tipp oder Klick neben das Bild? | schließt mit der Maus, auf Touch nicht · schließt nie; nur ✕, Esc und Zurück | **schließt mit der Maus, auf Touch nicht** (Empfehlung) |

---

## 1. Das Ziel

Die Filterleiste der Übersicht verliert eine Zeile. Die eigenen Werte filtern
in einer Gruppe am Ende der Statuszeile, und jeder Eintrag zählt mit der Phase,
in der er steht.

Das Vollbild am Telefon zeigt quer das Bild groß und bricht die Knopfleiste nur
um, wenn sie nicht in eine Reihe passt. Die Zurück-Taste schließt das Vollbild.
Wischen blättert nicht mehr, wenn der Finger an der Zeitleiste zieht oder zwei
Finger zoomen. Ein Tipp neben das Bild schließt nicht mehr. ✕ steht immer oben
rechts. Die Seite dahinter scheint nicht mehr durch und bekommt keinen Fokus.

---

## 2. Der Stand, geprüft am 3. Oktober 2026

### 2.1 Filter (B1)

- `FILTER_DEFAULT` (`public/app.js:2748`) enthält `potential` und `rating`, je
  `'all'`, `'none'` oder `'partial'`.
- `drawFilters()` zeichnet die Zeile `#f-shares` mit den Gruppen `#f-potential`
  und `#f-rating` (`public/app.js:3578–3597`). Eine Gruppe fehlt, wenn kein
  Eintrag ihre Phase in `share` hat (`shareShown()`, `public/app.js:2755`).
- `visibleItems()` filtert je Phase über `i.share.before` und `i.share.after`
  (`public/app.js:3037–3040`). `filterNumber()` zählt beide Gruppen
  (`public/app.js:3501`).
- `filterNormal()` setzt unbekannte Werte auf `'all'` (`public/app.js:2904`).
- Der Server rechnet `share` in `ownShares()` (`server.js:3396–3411`): je Phase
  `'none'`, `'partial'` oder `'full'`; `'after'` ist bei ungetesteten Einträgen
  `null`. Ohne Potenzialmodus fehlt `'before'`. Am Server ändert sich nichts.
- Auf dem Telefon steht jede Beschriftung mit ihrer Gruppe in einer eigenen
  Rasterzeile (`public/style.css:2447–2451`). Die Statuszeile hat dort heute
  zwei, die Zeile `#f-shares` eine oder zwei.
- Prüfungen: `test/release_054.js:666–711`. Rückbauten 1657 bis 1659.

### 2.2 Vollbild (B2 bis B8)

- `openLightbox()`, `public/app.js:4590–4951`. Kopfzeile: Titel, dann die
  Knopfleiste `.lb-tools` mit bis zu 11 Elementen; ✕ ist das letzte
  (`public/app.js:4597–4615`).
- `.lb-title { flex-shrink: 100; white-space: nowrap }`
  (`public/style.css:1525`): Die Leiste bricht um, bevor der Titel schrumpft.
  `test/release_056.js:353` prüft `flex-shrink: 100`.
- Quer am Telefon gilt keine eigene Regel für das Vollbild. Die Media Query
  `(max-height: 500px) and (max-width: 960px)` steht in `public/style.css:2422`.
- Der Verlauf: Das Vollbild legt keinen Eintrag an. `route()`
  (`public/app.js:3127`) schließt ein offenes Vollbild nicht.
- Wischen: `touchstart` und `touchend` an `.lb-stage`
  (`public/app.js:4939–4947`), 45 px. Zieht ein zweiter Finger, bleibt der
  Start des ersten gültig.
- Tipp neben das Bild: `stage.addEventListener('click', …)`
  (`public/app.js:4936`).
- 🗑 hat `margin-left: 10px` (`public/style.css:1534`). Löschen fragt in beiden
  Fällen nach (`confirmBox()`, `public/app.js:5885` und `8104`).
- `--lb-bg` ist im dunklen Schema `rgba(var(--scrim-rgb), .97)`
  (`public/style.css:103`), im hellen deckend (`public/style.css:199`).
- Fokus: `openLightbox()` setzt keinen Fokus und kein `inert`.

Messwerte vor und nach dem Bau: Änderungsprotokoll 0.56.1, Abschnitt 5.

---

## 3. Die Punkte

### B1 Filter „Eigene Werte“

- `FILTER_DEFAULT` bekommt `own: 'all'` statt `potential` und `rating`.
- `drawFilters()`: Die Zeile `#f-shares` entfällt. In der Statuszeile folgt
  nach „Ablehnung“ die Beschriftung „Eigene Werte“ und die Gruppe `#f-own` mit
  „Keine“ und „Teilweise“. Ein Klick auf den gewählten Knopf setzt `'all'`.
- `visibleItems()`: Je Eintrag gilt `i.tested ? 'after' : 'before'`.
- Die Gruppe fehlt, wenn kein Eintrag eine Phase in `share` hat. Fehlt einem
  Eintrag seine Phase, fällt er bei „Keine“ und „Teilweise“ heraus (F3).
- Die Beschriftung heißt immer „Eigene Werte“; der Titel der Knöpfe nennt, was
  zählt (F2).
- `filterNormal()` entfernt `potential` und `rating` aus gespeicherten Filtern
  und Ansichten (F1).
- Neue Schlüssel in den drei Sprachdateien nur, wo der Text neu ist.

### B2 Quer am Telefon (Vorschläge V1, V2)

- `.lb-title { flex: 1 1 0; min-width: 0 }`: Erst schrumpft der Titel, dann
  bricht die Leiste um.
- In `(max-height: 500px) and (max-width: 960px)`: kein Streifen, die Kopfzeile
  mit 6 statt 14 px Abstand oben und unten (F4). Geblättert wird mit ‹ › und
  Wischen.
- Ziel bei 640 × 360 px: Bühne 306 statt 148 px, ein Video 16:9 mit 544 × 306
  statt 263 × 148 px. Gemessen wird am fertigen Stand.

### B3 Zurück schließt das Vollbild (V3)

- Beim Öffnen `history.pushState()` mit derselben Adresse.
- `popstate` schließt das Vollbild.
- Schließen mit ✕ oder Esc nimmt den eigenen Eintrag mit `history.back()`
  zurück.
- Ein Wechsel der Adresse löst vor `hashchange` ebenfalls `popstate` aus
  (geprüft in Chromium 1194 und jsdom) und schließt so das Vollbild; `route()`
  braucht dafür keinen eigenen Aufruf.

### B4 Wischen (V4)

- Nur mit einem Finger; ein zweiter Finger bricht das Wischen ab.
- Nicht, wenn der Browser gezoomt ist (`visualViewport.scale > 1`).
- Nicht, wenn der Finger auf dem Video beginnt (F5).

### B5 ✕ und 🗑 (V6)

- ✕ steht außerhalb von `.lb-tools` und bleibt oben rechts, auch wenn die
  Leiste umbricht.
- 🗑 ist der erste Knopf in `.lb-tools` (F6).

### B6 Tipp neben das Bild (V7)

- Ein Klick mit der Maus neben das Bild schließt, ein Tipp mit dem Finger
  nicht (F7). Unterschieden wird am `pointerType`, nicht am Gerät.

### B7 Deckend (V9)

- `--lb-bg` im dunklen Schema deckend.

### B8 Fokus (V10)

- Beim Öffnen bekommt ✕ den Fokus. Die übrigen Kinder von `body` werden
  `inert`; ein Dialog, der danach aufgeht, nicht.
- Beim Schließen entfällt `inert`, und der Fokus geht an das Element zurück,
  das ihn vor dem Öffnen hatte, wenn es noch da ist.

---

## 4. Prüfstand

- Neue Gruppen in `test/release_056.js`, je Punkt eine.
- `test/release_054.js:666–711` und `test/release_056.js:353` auf den neuen
  Stand.
- Rückbauten 1657 bis 1659 auf den neuen Code; neue Rückbauten je Punkt.
- Messung mit Chromium und Emulation eines Telefons wie in
  `Doku/Vorschlaege_Claude_0.56.x.md`, Abschnitt 1, vor und nach dem Bau.

## 5. Dokumentation

- Anleitung in drei Sprachen: Filter und Sortierung, Fotos und Videos, Telefon.
- CHANGELOG, Änderungsprotokoll 0.56.1 mit den Vorgaben, Fahrplan.
- `Doku/Vorschlaege_Claude_0.56.x.md`: Stand der Punkte nachtragen.
- Version 0.56.1, Fingerprint.
