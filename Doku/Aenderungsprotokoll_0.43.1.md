# Änderungsprotokoll 0.43.1 — „Updates kommen sofort im Browser an"

**Gebaut am 27. September 2026 auf 0.43.0. Fingerprint `FP_NEU`, davor
`c83a6a27`.**

Befund des Betreibers nach dem Einspielen von 0.43.0. Ohne Auftrag. Schema:
nein. Austauschformat: 20.

---

## 1. Der Befund

Die Instanz lief mit 0.43.0, Fingerprint `c83a6a27`. Die Karte „Dokumente"
zeigte trotzdem den Stand von 0.42.3: den alten Hinweistext und keinen zweiten
Schalter. Der Browser nahm `app.js` und `languages/de.json` aus seinem Cache.

| | Cache-Control | ETag |
|---|---|---|
| `app.js` ohne gzip (`express.static`) | `public, max-age=0` | `W/"…"` |
| `app.js` gezippt, 0.43.0 | fehlt | `W/"…-gz"` |

Gemessen mit `curl` an einer eigenen Instanz. Ohne `Cache-Control` darf der
Browser eine Antwort nach eigener Schätzung frisch halten, meist ein Zehntel
der Zeit seit `Last-Modified`. Bis dahin fragt er nicht nach. Das betrifft
jedes Update seit der gezippten Auslieferung, nicht nur 0.43.0.

## 2. Die Behebung

Die gezippte Auslieferung in `server.js` setzt `Cache-Control: public,
max-age=0`, wie `express.static`. Der Browser fragt bei jedem Laden mit
`If-None-Match` nach und bekommt `304`, solange sich nichts geändert hat.

---

## 3. Die Bilanz

| | 0.43.0 | 0.43.1 |
|---|---:|---:|
| Kommentarzeilen, 40 Dateien | 6.511 | **6.512** |
| Rückbauten | 1.178 | **1.179** |
| Prüfungen im Prüfstand | 7.465 | **PRUEFUNGEN** |

---

## 4. Der Prüfstand

Eine Prüfung in `test/roundtrip.js`, Gruppe „Die Auslieferung geht gezippt
hinaus": `app.js`, die Seite, die Sprachdatei und das Zeichen tragen gezippt
und ungezippt `Cache-Control: public, max-age=0`.

| Nr | Rückbau | rot in |
|---|---|---|
| 1259 | Die gezippte Auslieferung verliert Cache-Control | Und denselben Cache-Control wie ungezippt, damit ein Update sofort ankommt |

GEGENPROBE

---

## 5. Für den Betrieb

Wer 0.43.1 einspielt und noch eine ältere Oberfläche sieht, lädt die Seite
einmal ohne Cache neu (Strg+Umschalt+R). Danach kommt jedes Update beim
nächsten Laden an.
