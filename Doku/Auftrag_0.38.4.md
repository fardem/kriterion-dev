# Auftrag 0.38.4 — „Vier Befunde, drei Indexe, ein Verzeichnis"

Gebaut wird auf 0.38.3. **PATCH.**

Die Runde nimmt aus der Fragetafel vom 20. September 2026 nur das, was ohne
Rückfrage gebaut werden kann. Jeder Bauabschnitt ist für sich prüfbar, keiner
hängt an einem anderen, und keiner verlangt während des Bauens eine
Entscheidung.

**Schema: ja** — drei Indexe kommen dazu. **Format: unverändert.**

---

## 1. Die Fragetafel, entschieden vor der ersten Zeile

Siebenundzwanzig Fragen, entschieden vom Betreiber am 20. September 2026.

| | Frage | Entscheidung |
|---|---|---|
| **F1** | Die drei mitgelieferten Kriterien in der Auslieferungssprache | **ja** |
| **F2** | Ein Verweis auf einen gelöschten Kommentar bekommt eine Marke | **ja** |
| **F3** | Strg+V aus dem Kommentarfeld nehmen | **ja** |
| **F4** | Der Trefferausschnitt bei einem Treffer im Ziel eines Links | **nein** — der Eingriff in den gemeinsamen Kern lohnt den Anzeigefall nicht |
| **F5** | Der Halt nach einem Sprung als Messung statt als Frist | nicht beantwortet, bleibt draußen |
| **F6** | Der Sprung ans Seitenende in Chromium nachstellen | nicht beantwortet, bleibt draußen |
| **F7** | Die Strichstärke des Löschkreuzes | nicht beantwortet, bleibt draußen |
| **F8** | Die Zählzeile der Kachel | **ja, aber nur die Messung** |
| **F9** | Vorgabewerte und Tastaturbedienung beim Sortieren | **vorläufig gestrichen** — der Inhalt ist nirgends beschrieben |
| **F10** | Die Restprobe schärfen | **vorab gemessen: die Lücke gibt es nicht mehr.** Wird geschlossen statt gebaut |
| **F11** | Punkt 37 schließen | **ja** |
| **F12** | Drei Indexe | **ja** |
| **F13** | Die Fotokachel in eine Nebentabelle | nicht beantwortet, bleibt draußen |
| **F14** | Export und Import sparsamer machen | nicht beantwortet, bleibt draußen |
| **F15** | Der vierte Abruf nach dem Umbenennen | nicht beantwortet, bleibt draußen |
| **F16** | Ein Verzeichnis der lesenden Routen | **ja** |
| **F17** | Der Aufräumer auf vier Spuren | nicht beantwortet, bleibt draußen |
| **F18** | Die festen Wartezeiten im Prüfstand | nicht beantwortet, bleibt draußen |
| **F19** | Der Kommentaranteil des Stilblatts | nicht beantwortet, bleibt draußen |
| **F20** | „Auffangnetz" und „Grundausstattung" umbenennen | nicht beantwortet, bleibt draußen. **Folge für F1: der Abschnitt behält seinen Namen** |
| **F21** | Den Bestand messen | **gelaufen am 20. September 2026** |
| **F22** | Der einzelne Stern | **nein — gemessen am 21. September 2026: 20 von 273** |
| **F23** | Der angepinnte Block | beobachten, nichts zu bauen |
| **F24** | Der abgerissene Prüflauf von 0.9.1 | nichts zu bauen |
| **F25** | Die Nummer | **0.38.4, PATCH** |
| **F26** | Deckel für F10 | entfällt, weil F10 nichts mehr baut |
| **F27** | Das Wort „Wegweiser" | **ja, in den zwei Stellen dieser Sitzung** |

*Der Betreiber zu F5 bis F7, F13 bis F15 und F17 bis F20: „die für ein anderes
Mal. Um zu entscheiden, muss man sich mit allen etwas beschäftigen."*

---

## 2. Was vorab gemessen worden ist

**Vier Messungen stehen vor dem Bauen, nicht darin.** Zwei haben eine Frage
beantwortet, zwei einen Punkt geschlossen.

### Der Bestand des Betreibers — F21

`node tools/markupscan.js` am 20. September 2026, an der laufenden Instanz:

| | |
|---|---:|
| Texte gelesen | **271** |
| mit Auszeichnung | **22** |
| fett · kursiv · Link mit Namen | 13 · 3 · 2 |
| Aufzählung · Nummerierung | 5 · 3 |
| Code · Zitat · Escape | 0 · 0 · 0 |

**Kein Schaden.** Die Instanz läuft auf 0.38.x, diese 22 Texte werden bereits
so gezeichnet. Der offene Punkt aus 0.38.0 — *„Der Bestand des Betreibers ist
nicht gemessen"* — fällt damit weg.

### Der einzelne Stern — F22

`node tools/markupscan.js --einzelstern` am 21. September 2026. Der Schalter
baut den Leser ein zweites Mal aus `public/app.js` und tauscht dabei die eine
Bedingung in `markupWrap()`, die den einzelnen Stern heute herausfallen lässt.

**273 Texte gelesen, 20 sähen mit dem einzelnen Stern anders aus.** Siebzehn
davon sind Beschreibungen, verteilt von Eintrag 7 bis 96 — gewachsener
Bestandstext und keine Versuche.

0.38.0 hat festgelegt: der einzelne Stern kommt nur, wenn die Messung eine
**Null** meldet. Sie meldet **7,3 Prozent**. **F22 ist nein, und der Punkt ist
beantwortet statt offen.**

### Punkt 26 — die Restprobe

Nachgelesen am 20. September 2026. **Die Lücke gibt es nicht mehr.**

- `test/dom.js`:1425 — `template()` schiebt **jedes Stück zwischen zwei
  `${…}` einzeln** in die Liste. Genau das verlangt der Punkt.
- `test/ui_language.js`:310 — die übrigen lesbaren Texte müssen unter siebzig
  bleiben und namentlich in einer Liste stehen.
- `test/ui_language.js`:345 — eine zweite Stufe prüft jeden übrigen Text gegen
  ein Wörterbuch, mit Gegenprobe an zwei bekannten Wörtern.

### Punkt 37 — der deutsche Artikel

Nachgelesen am 20. September 2026. **Der Punkt ist leer.**

`server.entryTooBig` gibt es nicht mehr. `entry.deleteHint` — „Dieses {word}
wird endgültig gelöscht." — wird an beiden Rufstellen (`public/app.js`:4962
und :5294) mit `list.photo` oder `list.video` gefüllt. Beide sind feste
Wörter der Sprachdatei, beide sächlich, **keine Vokabelwörter**. „Dieses" ist
immer richtig.

---

## 3. Die Bauabschnitte

### BA 1 — Die drei mitgelieferten Kriterien (F1)

**Heute** legt `db.js`:727 sie an: `SEED_LANGUAGE = 'de'` und drei deutsche
Namen, eingesetzt nur, wenn `rating_criteria` leer ist. Der Kommentar daneben
nennt den Grund: *diese Datei kennt die Sprachdateien nicht.*

**Gebaut wird:** der Server legt sie an, nicht `db.js`. Beim Start, wenn die
Tabelle leer ist, in der Auslieferungssprache (`LANGUAGE_FALLBACK`,
`server.js`:35) und mit `language` auf dieselbe Sprache.

- Die drei Namen bekommen **je einen Schlüssel in allen drei Sprachdateien**.
- `seedCriteria`, `SEED_LANGUAGE` und das Einsetzen fallen aus `db.js` weg.
- **Der Abschnittsname in `db.js` bleibt stehen** — F20 ist nicht beantwortet.
- Die Reihenfolge beim Start: erst die Sprachdateien, dann das Einsetzen.

**Zusage: eine bestehende Installation ändert sich nicht.** Eingesetzt wird
nur in eine leere Tabelle.

**Prüfungen:** eine frische Instanz trägt die drei in der Auslieferungssprache
und ohne roten Rahmen an der Kachel; eine Instanz mit vorhandenen Kriterien
bekommt nichts dazu; die drei Schlüssel stehen in allen drei Sprachdateien.

### BA 2 — Die Marke „gelöscht" (F2)

**Heute** baut `markupRefNode()` einen Kasten nur, wenn `COMMENT_REFS` den
Schlüssel kennt. Antwortet der Server für einen Schlüssel mit nichts, bleibt
die rohe Adresse stehen und öffnet einen neuen Tab auf denselben Eintrag.

**Gebaut wird:** ein gefragter Schlüssel, der in der Antwort fehlt, bekommt
einen Platzhalter in `COMMENT_REFS`. Daraus baut die Oberfläche einen Kasten
**ohne Klickziel** mit einem Wort aus der Sprachdatei.

**Die beiden Fälle bleiben getrennt:**

| Lage | was geschieht |
|---|---|
| Der Ruf scheitert (Netz) | wie heute — roher Link, beim nächsten Zeichnen ein neuer Versuch |
| Der Ruf gelingt, der Schlüssel fehlt in der Antwort | **Marke „gelöscht"**, dauerhaft |

- Ein neuer Schlüssel in drei Sprachen.
- **Die Route ändert sich nicht.** Die Unterscheidung fällt im Browser: was
  gefragt und nicht beantwortet wurde, gibt es nicht.

**Prüfungen:** ein Verweis auf einen Kommentar, den es nicht gibt, wird ein
Kasten ohne `href`; ein Verweis auf einen vorhandenen bleibt, wie er ist; ein
gescheiterter Ruf macht weiterhin keinen Kasten.

### BA 3 — Strg+V aus dem Kommentarfeld (F3)

`entry.commentPlaceholder` nennt Strg+V. Am Telefon gibt es das nicht.

**Gebaut wird:** der Satz wird in allen drei Sprachen so formuliert, dass er
den Weg nennt, ohne die Tastenkombination zu verlangen. **Der deutsche
Wortlaut ist die Basis**, Englisch und Türkisch folgen ihm.

**Prüfung:** an dieser Stelle steht in keiner der drei Sprachdateien mehr
`Strg+V`, `Ctrl+V` oder `Ctrl-V`.

### BA 4 — Die Zählzeile der Kachel messen (F8)

**Nur messen. Es wird nichts gebaut.**

Der Blockkopf zählt in Zeichen („12 · ⚑3 · ☐3 · ☑2"), die Kachel in Worten
(„3 Kommentare · 4 Bewertungen"). Auf dem Telefon ist die Kachel der engste
Ort der Anwendung und trägt die längste Fassung.

**Gemessen wird:**

1. Wie viele Zeichen die Zählzeile der Kachel in den drei Sprachen im
   ungünstigsten Fall trägt.
2. Wie viel Platz die schmalste Kachel bei 390 Pixeln Schirmbreite lässt.

**Beides gehört ins Änderungsprotokoll.** Die Entscheidung fällt danach und
nicht in dieser Runde.

### BA 5 — Drei Indexe (F12)

**Zusage: keine Spalte fällt, keine Tabelle fällt, keine Zeile wandert.** Alle
drei kommen als `CREATE INDEX IF NOT EXISTS` ins Schema; eine bestehende
Datenbank bekommt sie beim nächsten Start. **Kein Migrationsblock.**

**1. `ratings.criterion_id`.** Der einzige Index auf `ratings` ist das
`UNIQUE` über `(item_id, criterion_id, user_id)`; `criterion_id` steht an
zweiter Stelle und ist von links nicht greifbar. `qCriteria` zählt je
Kriterium über alle Bewertungen. **Gemessen: 14,2 ms statt 73,6.**

```
CREATE INDEX IF NOT EXISTS idx_ratings_criterion ON ratings(criterion_id, value, item_id)
```

**2. Ein deckender Index für `qAttachments`** (`server.js`:2370). Die Abfrage
liest `id, filename, mime_type, size, sort_order, created_at, user_id` und
ordnet nach `sort_order, id`. Alle diese Spalten stehen in `attachments`
hinter `data`, und `data` ist bis 50 MB groß. `idx_attachments_item`
(`db.js`:293) trägt nur `item_id`.

**3. `length(thumb)` in `idx_photos_tile`** (`db.js`:620). `PHOTO_VERSION`
hängt den Ausdruck an die Spaltenliste an; ohne ihn im Index fällt SQLite auf
den Zeilenzugriff zurück. **Achtung:** eine Prüfung hält die Spaltenliste des
Index und `PHOTO_SPALTEN` gegeneinander — sie zieht mit.

**Prüfungen:** je Index ein `EXPLAIN QUERY PLAN`, der ihn namentlich nennt.
Die Messung der Kriterienzählung vorher und nachher gehört ins Protokoll.

### BA 6 — Ein Verzeichnis der lesenden Routen (F16)

**Heute** führt `F_ROUTES` (`test/frame.js`:449) die **72 schreibenden** Wege
und nagelt jeden mit seiner Klemme fest: eine Route, die im Server steht und
nicht in der Liste, färbt den Prüfstand rot. **Für die lesenden Routen gibt es
nichts dergleichen** — eine `GET`-Route kann still dazukommen oder
verschwinden.

**Gebaut wird** eine zweite Liste derselben Bauform, je Weg mit Pfad, Klemme
und einem Satz, warum. Dazu ein Wächter in beide Richtungen:

- Jede `app.get(`-Route in `server.js` steht in der Liste.
- Jede Zeile der Liste steht im Server.

**Die Zahl ermittelt der Bauabschnitt.** Ein grobes Zählen am Zeilenanfang
liefert 30; `app.get(` kann auch eingerückt stehen, und die tatsächliche Zahl
gehört gemessen und nicht geschätzt. Sie kommt namentlich in die Prüfung,
wie bei `F_ROUTES`.

### BA 7 — Die Papiere (F9, F10, F11, F21, F22, F27)

**Im Sammelblatt:**

- **Punkt 26 schließen** mit dem Beleg aus Abschnitt 2.
- **Punkt 37 schließen** mit dem Beleg aus Abschnitt 2.
- Der offene Punkt *„Der Bestand des Betreibers ist nicht gemessen"* fällt
  weg; die beiden Messungen kommen mit Datum und Zahl hinein.
- **Der einzelne Stern** ist keine offene Frage mehr: 20 von 273, also nein.
- Die Übersicht vor Teil I wird nachgezogen.
- Das Wort **„Wegweiser"** fällt aus den beiden Stellen dieser Sitzung
  (`Doku/Fehler_und_Ideen.md`:138 und :146) und wird durch den Satz ersetzt,
  was die Tafel tut. **Die drei älteren Stellen bleiben.**

**Im Fahrplan:**

- Die Zeile **„Vorgabewerte und Tastaturbedienung beim Sortieren"** wird
  vorläufig gestrichen, mit dem Grund: der Inhalt ist nirgends beschrieben.
  Sie kommt zurück, sobald der Betreiber sagt, was gemeint war.
- Die Zeile für 0.38.4.

### BA 8 — Schlussarbeiten

- Die festen Zahlen nachziehen: Regelzeilen, Sprachschlüssel, die sechs
  Gleichlautsummen, die Kommentarzahlen je Datei und über alles, die Zahl der
  Rückbauten, die Zahl der Prüfungen.
- Gegenproben für jeden Bauabschnitt, der Code anfasst.
- `CHANGELOG.md` und `Doku/Aenderungsprotokoll_0.38.4.md`.
- **`npm test` vollständig**, das Ergebnis wird genannt.
- Den Fingerprint messen und in beide Papiere eintragen.

---

## 4. Was ausdrücklich draußen bleibt

| | warum |
|---|---|
| Der Trefferausschnitt beim Treffer im Linkziel | Eingriff in den gemeinsamen Kern; eigene Runde |
| Die Fotokachel in eine Nebentabelle | die Ableitungen müssten neu gerechnet werden — eine Entscheidung des Betreibers, kein Bauauftrag |
| Export, Import und Papierkorb | ein Fehler auf dem Aufräumweg verliert Daten; vorher eine Messung am Bestand |
| Der Aufräumer auf vier Spuren | der Ausgang ist offen; das will jemand ansehen |
| Die festen Wartezeiten | jede Umstellung kann den Prüfstand wackelig machen |
| „Auffangnetz" und „Grundausstattung" | eigene Runde; **BA 1 benennt nichts um** |
| Der Halt als Messung, der Sprung in Chromium, die Strichstärke, der vierte Abruf, der Kommentaranteil | nicht beantwortet |

---

## 5. Die Zusagen dieser Runde

1. **Kein Verhalten ändert sich** außer an den vier Stellen von BA 1 bis BA 3
   und BA 5.
2. **Keine Spalte und keine Tabelle fällt.** Drei Indexe kommen dazu.
3. **Kein Migrationsblock.** Eine bestehende Datenbank bekommt die Indexe über
   `CREATE INDEX IF NOT EXISTS`.
4. **Der gemeinsame Kern der Auszeichnung wird nicht angefasst.** Die Fassungen
   in `public/app.js` und `server.js` bleiben Zeichen für Zeichen gleich.
5. **Eine bestehende Installation bekommt keine neuen Kriterien.**
6. **Keine neue Route.** Das Verzeichnis aus BA 6 beschreibt die vorhandenen.
