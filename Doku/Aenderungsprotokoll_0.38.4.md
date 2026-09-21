# Änderungsprotokoll 0.38.4 — „Vier Befunde, drei Indexe, ein Verzeichnis"

Gebaut am 21. September 2026, auf 0.38.3. PATCH.

Die Runde nimmt aus der Fragetafel vom 20. September 2026 das, was ohne
Rückfrage zu bauen war. Acht Bauabschnitte, von denen zwei nichts bauen: einer
misst, einer zieht die Papiere nach. **Schema: ja** — drei Indexe kommen dazu.
**Format unverändert. Keine neue Route.**

| | vorher | nachher |
|---|---:|---:|
| Zeilen in `public/app.js` | 10.460 | **10.472** |
| Zeilen in `server.js` | 6.118 | **6.139** |
| Zeilen in `db.js` | 799 | **808** |
| Regelzeilen in `public/style.css` | 1.672 | **1.673** |
| Schlüssel je Sprachdatei | 1.229 | **1.233** |
| Auslieferung, gzip | 271.822 | **272.273** |
| Prüfungen | 7.201 | **7.227** |
| Rückbauten | 1.104 | **1.115** |

> **FINGERPRINT DIESER RUNDE: `246372bd`** — der Stand davor war
> `a91efceb`.

> **HIER STAND `0d3111e4`, UND DIESE ZAHL GEHOERT ZU KEINEM COMMIT.** Sie ist
> waehrend des Bauens an einem Zwischenstand gemessen worden. Nachgemessen an
> `8cec0e8`, dem ersten Commit der Runde, und an `bacc93a`, ihrem Merge:
> beide tragen `246372bd`. Berichtigt in 0.38.5.

> **DIE ZAHL DER AUSLIEFERUNG IST ANDERS GEMESSEN ALS IN 0.38.3.** Dort stand
> 271.199 für denselben Stand, der hier mit 271.822 in der Spalte „vorher"
> steht. Gemessen wird ab dieser Runde mit `zlib.gzipSync(…, { level: 9 })` —
> derselben Stufe, mit der `server.js`:394 ausliefert. Die Differenz von 623
> Bytes liegt an der zlib-Fassung des messenden Rechners, nicht am Bestand.

---

## 1. Was vor der ersten Zeile entschieden war

Siebenundzwanzig Fragen, entschieden vom Betreiber am 20. September 2026.
Gebaut worden ist daraus: die drei mitgelieferten Kriterien in der
Auslieferungssprache (F1), die Marke „gelöscht" am Verweis auf einen
gelöschten Kommentar (F2), Strg+V aus dem Kommentarfeld (F3), die Messung der
Zählzeile (F8), drei Indexe (F12), ein Verzeichnis der lesenden Routen (F16),
das Schließen der Punkte 26 und 37 (F10, F11) und die zwei Messungen am
Bestand (F21, F22).

**Draußen geblieben** sind der Trefferausschnitt im Ziel eines Links (F4, der
Eingriff in den gemeinsamen Kern lohnt den Anzeigefall nicht), die
Vorgabewerte beim Sortieren (F9, der Inhalt ist nirgends beschrieben) und
neun nicht beantwortete Fragen.

---

## 2. Was vorab gemessen worden ist

### Der Bestand des Betreibers — F21

`node tools/markupscan.js` am 20. September 2026, an der laufenden Instanz:
**271 Texte gelesen, 22 mit Auszeichnung** — 13 fett, 3 kursiv, 2 Link mit
Namen, 5 Aufzählungen, 3 Nummerierungen, kein Code, kein Zitat, kein Escape.
**Kein Schaden:** die Instanz läuft auf 0.38.x und zeichnet diese 22 Texte
bereits so. Der offene Punkt aus 0.38.0 fällt damit weg.

### Der einzelne Stern — F22

`node tools/markupscan.js --einzelstern` am 21. September 2026:
**273 Texte gelesen, 20 sähen mit dem einzelnen Stern anders aus.** Siebzehn
davon sind Beschreibungen, verteilt von Eintrag 7 bis 96 — gewachsener
Bestandstext und keine Versuche. 0.38.0 hat festgelegt, dass der einzelne
Stern nur kommt, wenn die Messung eine Null meldet; sie meldet **7,3 Prozent**.
**Die Frage ist beantwortet statt offen.**

### Punkt 26 — die Restprobe

Nachgelesen am 20. September 2026. **Die Lücke gibt es nicht mehr.**
`test/dom.js`:1425 schiebt jedes Stück zwischen zwei `${…}` einzeln in die
Liste; `test/ui_language.js`:310 deckelt die übrigen lesbaren Texte und
verlangt sie namentlich; `test/ui_language.js`:345 prüft jeden übrigen Text
gegen ein Wörterbuch, mit Gegenprobe an zwei bekannten Wörtern.

### Punkt 37 — der deutsche Artikel

Nachgelesen am 20. September 2026. **Der Punkt ist leer.**
`server.entryTooBig` gibt es nicht mehr; `entry.deleteHint` wird an beiden
Rufstellen mit `list.photo` oder `list.video` gefüllt. Beide sind feste Wörter
der Sprachdatei, beide sächlich, keine Vokabelwörter — „Dieses" ist immer
richtig.

---

## 3. Die drei mitgelieferten Kriterien entstehen im Server

**Vorher** legte `db.js` sie an: `SEED_LANGUAGE = 'de'` und drei deutsche
Namen. Die Spalte `language` sagte „de", die Auslieferungssprache ist
Englisch; ein englischer Leser bekam bei allen dreien den roten Rahmen an der
Kachel.

**Jetzt** legt der Server sie an, hinter dem Lesen der Sprachdateien und
hinter `t()`. Die drei Namen stehen als Schlüssel in allen drei Sprachdateien:
`server.seedAppearance`, `server.seedWorkmanship`, `server.seedFunction`.
Eingesetzt wird der Wert der Auslieferungssprache, und `language` bekommt
dieselbe Sprache.

```
Appearance · Workmanship · Functionality      language = 'en', sort_order 0..2
```

**`seedCriteria`, `SEED_LANGUAGE` und das Einsetzen sind aus `db.js` gefallen**
— neun Zeilen Code und ihr Kommentar. Der Abschnittsname `Grundausstattung`
bleibt stehen; die zweite Überschrift `Grundausstattung, Fortsetzung` fällt
mit dem Abschnitt weg, den sie fortsetzte.

**Kein Name wandert nach `criterion_names`.** Das war der erste Bauversuch und
ist zurückgenommen worden: eine Zeile dort schlägt den Grundnamen, und ein
Umbenennen ohne Sprachangabe schreibt in die Grundzeile. Ein deutscher Leser
hätte nach dem Umbenennen weiter den vorab eingetragenen deutschen Namen
gesehen. **Die beiden anderen Sprachdateien tragen den Schlüssel wegen der
Deckungsprobe** — jede Datei trägt genau die Schlüssel von `de.json`.

**Eine bestehende Installation ändert sich nicht:** eingesetzt wird nur in eine
leere Tabelle. Das ist an einer Instanz gefahren, die schon gelaufen war und
ihr einziges Kriterium umbenannt hatte — nach dem nächsten Start steht dort
dieselbe eine Zeile, und `criterion_names` bleibt leer.

---

## 4. Die Marke „gelöscht"

**Vorher** baute `markupRefNode()` einen Kasten nur, wenn `COMMENT_REFS` den
Schlüssel kannte. Antwortete der Server für einen Schlüssel mit nichts, blieb
die rohe Adresse stehen und öffnete beim Klick einen neuen Tab auf denselben
Eintrag.

**Jetzt** bekommt ein gefragter Schlüssel, der in der Antwort fehlt, einen
Platzhalter `{ key, gone: true }`. Daraus baut die Oberfläche einen Kasten
**ohne `href`** mit dem Wort aus der Sprachdatei (`entry.refGone`:
„gelöscht" · „deleted" · „silindi"). Die Regel `.markup-ref.gone` nimmt dem
Kasten die Farbe eines Links.

| Lage | was geschieht |
|---|---|
| Der Ruf scheitert (Netz) | wie vorher — rohe Adresse, beim nächsten Zeichnen ein neuer Versuch |
| Der Ruf gelingt, der Schlüssel fehlt | **Marke „gelöscht"**, dauerhaft |

**Die Route ändert sich nicht.** Die Unterscheidung fällt im Browser: was
gefragt und nicht beantwortet wurde, gibt es nicht. Dazu gehört eine zweite
Zeile: ein Ruf, der nur Platzhalter einträgt, gilt jetzt ebenfalls als
Auskunft und zeichnet einmal neu — sonst bliebe die rohe Adresse stehen, bis
die Ansicht aus einem anderen Grund zeichnet. Ein zweiter Ruf folgt daraus
nicht, denn jeder gefragte Schlüssel steht danach in der Tafel.

---

## 5. Strg+V fällt aus dem Kommentarfeld

`entry.commentPlaceholder` nannte die Tastenkombination; am Telefon gibt es
sie nicht. Der Satz nennt jetzt den Weg:

| | vorher | nachher |
|---|---|---|
| Deutsch | Kommentar schreiben — Bilder mit Strg+V einfügen … | Kommentar schreiben — Bilder aus der Zwischenablage einfügen … |
| English | Write a comment — paste images with Ctrl+V … | Write a comment — paste images from the clipboard … |
| Türkçe | Yorum yaz — resimleri Ctrl+V ile yapıştır … | Yorum yaz — resimleri panodan yapıştır … |

Ein Wächter hält es fest: **kein Wert der drei Sprachdateien nennt noch eine
Tastenkombination** — gesucht wird nach `Strg`, `Ctrl`, `Cmd`, `Alt`, `Shift`
und `Umschalt` vor einem Plus oder Strich und einem Buchstaben, mit Gegenprobe
an zwei gestellten Sätzen.

---

## 6. Die Zählzeile der Kachel — nur gemessen

**Es ist nichts gebaut worden.** Der Blockkopf zählt in Zeichen
(„12 · ⚑3 · ☐3 · ☑2"), die Kachel in Worten. Die Zählzeile der Kachel ist
`newWords()` (`public/app.js`:3058) und steht in der Meldungstafel als
`.mcount`.

Gemessen in Chromium bei 390 Pixeln Schirmbreite, an der ausgelieferten
`public/style.css` und mit den ausgelieferten Vokabelwörtern:

| Sprache | ungünstigster Fall | Zeichen | Breite | bleibt dem Titel |
|---|---|---:|---:|---:|
| Deutsch | „12 Kommentare · @34 · 56 Bewertungen" | 36 | **227,6 px** | 101,4 px |
| Türkçe | „12 yorum · @34 · 56 Değerlendirme" | 33 | 208,6 px | 120,4 px |
| English | „12 comments · @34 · 56 Ratings" | 30 | 189,7 px | 139,3 px |

**Die Zeile der Kachel ist innen 340 Pixel breit** — 390 minus 32 Rand des
Blatts, minus 18 Innenabstand der Zeile. **Die Zählzeile bricht in keiner der
drei Sprachen um**; sie drückt stattdessen den Titel zusammen. **Umgebrochen
wird ab 54 Zeichen** (über 331 Pixel); bei 52 Zeichen bleiben dem Titel
0,3 Pixel. Mit einstelligen Zahlen sind es 33 · 30 · 27 Zeichen und
208,6 · 189,7 · 170,7 Pixel.

Die Vokabelwörter trägt der Betreiber ein; ein längeres eigenes Wort
verschiebt die Zahlen, und die Latte von 54 Zeichen sagt, wo. **Die
Entscheidung steht noch aus.**

---

## 7. Drei Indexe

Keine Spalte fällt, keine Tabelle fällt, keine Zeile wandert. Alle drei kommen
als `CREATE INDEX IF NOT EXISTS`; eine bestehende Datenbank bekommt sie beim
nächsten Start. **Kein Migrationsblock.**

### 1 · `idx_ratings_criterion`

Der einzige Index auf `ratings` war das `UNIQUE` über
`(item_id, criterion_id, user_id)`; `criterion_id` steht dort an zweiter
Stelle und ist von links nicht greifbar. `qCriteria` zählt je Kriterium über
alle Bewertungen.

```
CREATE INDEX IF NOT EXISTS idx_ratings_criterion ON ratings(criterion_id, value, item_id)
```

**Gemessen an 12.000 Bewertungen** (400 Einträge × 6 Kriterien × 5 Benutzer),
Median aus 40 Läufen nach 20 Vorläufen:

| | Abfrageplan | Median |
|---|---|---:|
| ohne den Index | `SCAN r USING INDEX sqlite_autoindex_ratings_1` | 6,8 ms |
| mit dem Index | `SEARCH r USING COVERING INDEX idx_ratings_criterion` | **1,4 ms** |

*Der Befund aus 0.35.0 nannte 73,6 gegen 14,2 ms; er ist an einer größeren
Prüflage gemessen worden. Das Verhältnis ist dasselbe.*

### 2 · `idx_attachments_list`

`qAttachments` (`server.js`) liest `id, filename, mime_type, size, sort_order,
created_at, user_id` und ordnet nach `sort_order, id`. Alle diese Spalten
stehen in `attachments` hinter `data`, und `data` ist bis 50 MB groß;
`idx_attachments_item` trägt nur `item_id`.

**Gemessen an 200 Einträgen mit je einer Datei von 256 kB** (111 MB
Datenbank), je Lauf über alle 200 Einträge: **226,0 ms ohne, 1,0 ms mit** dem
deckenden Index.

### 3 · `length(thumb)` in `idx_photos_tile`

`PHOTO_VERSION` hängt den Ausdruck an die Spaltenliste an. Ohne ihn im Index
fällt SQLite auf `idx_photos_item` und damit auf den Zeilenzugriff zurück.
**Gemessen an derselben Datei: 258,9 ms ohne, 0,7 ms mit.**

| | Abfrageplan |
|---|---|
| ohne `length(thumb)` | `SCAN photos USING INDEX idx_photos_item` |
| mit `length(thumb)` | `SCAN photos USING COVERING INDEX idx_photos_tile` |

### Und was eine geänderte Spaltenliste braucht

`CREATE INDEX IF NOT EXISTS` fasst einen vorhandenen Index nicht an. Eine
bestehende Datenbank trüge `idx_photos_tile` also weiter in der alten Form.
`tryIndex()` vergleicht deshalb den abgelegten Wortlaut aus `sqlite_master`
mit dem gewünschten und lässt den Index fallen, bevor er ihn neu anlegt. Das
ist am Prüfstand gefahren: ein von Hand auf drei Spalten gekürzter
`idx_photos_tile` steht nach dem nächsten Start wieder vollständig da.

**Die Prüfung liest den Abfrageplaner und nicht das Schema:** je Index ein
`EXPLAIN QUERY PLAN`, der ihn namentlich nennt, zwei davon als deckender
Index.

---

## 8. Das Verzeichnis der lesenden Routen

`F_ROUTES` führt die 73 schreibenden Wege und nagelt jeden mit seiner Klemme
fest. Für die lesenden gab es nichts dergleichen — eine `GET`-Route konnte
still dazukommen oder verschwinden.

**`F_READ_ROUTES` (`test/frame.js`) führt sie jetzt**, in derselben Bauform:
je Weg der Pfad, die Klemme und ein Satz, warum sie dort sitzt.

**Es sind 30, und die Zahl ist gemessen.** Der Auftrag rechnete mit „rund
dreißig" und nannte als grobes Zählen am Zeilenanfang ebenfalls 30; der Leser
sieht auch eine eingerückte Route, und es bleibt bei 30. **Drei stehen vor der
Anmeldung** — `/api/config`, `/api/manifest.json`, `/api/session`.

Die Klemmen: `offen` steht vor der Anmeldung, `angemeldet` verlangt nur sie,
`selbstbezug` liest aus `req.user` statt aus der Adresse, die drei
Wächternamen stehen im Kopf der Route.

| Klemme | Wege |
|---|---:|
| `offen` | 3 |
| `angemeldet` | 13 |
| `selbstbezug` | 3 |
| `adminOnly` | 6 |
| `ownerOnly` | 4 *(einer davon zweitbestätigt)* |
| `entryAuthorOnly` | 1 |

**Der Wächter schließt in beide Richtungen:** jede `app.get(`-Route in
`server.js` steht in der Liste, jede Zeile der Liste steht im Server, und die
Klemme jeder Zeile steht so im Kopf der Route. Dazu die Zahl ausdrücklich und
die Gegenprobe am Leser selbst.

---

## 9. Was die Runde an Größe kostet

| | vorher | nachher | Unterschied |
|---|---:|---:|---:|
| `public/app.js` gzip | 148.081 | **148.323** | +242 |
| `public/style.css` gzip | 53.025 | **53.086** | +61 |
| drei Sprachdateien gzip | 68.991 | **69.139** | +148 |
| `index.html`, `theme.js`, `favicon.svg` gzip | 1.725 | **1.725** | ±0 |
| **zusammen** | **271.822** | **272.273** | **+451** |

Die drei Indexe kosten Platz in der Datenbank, nicht in der Auslieferung.
`idx_photos_tile` wächst um den Ausdruck `length(thumb)`;
`idx_attachments_list` kostet bei 200 Zeilen rund 12 kB.

---

## 10. Prüfstand und Gegenproben

**`npm test` läuft vollständig durch: 7.227 von 7.227 Prüfungen bestanden.**

Neu sind 26 Prüfungen in fünf Gruppen:

| Gruppe | was sie festhält |
|---|---|
| Frische Installation | die drei Kriterien in der Auslieferungssprache, ihre Schlüssel in allen drei Dateien, `criterion_names` leer, kein Rahmen an der Kachel |
| Die mitgelieferten Kriterien an einer bestehenden Instanz | eine Instanz mit vorhandenen Kriterien bekommt keines dazu; eine geleerte Tabelle wird beim nächsten Start wieder gefüllt |
| Die drei Indexe und der Abfrageplaner | je Index ein `EXPLAIN QUERY PLAN`, dazu das Neuanlegen bei geänderter Spaltenliste |
| Der Wächter über den Quelltext | das Verzeichnis der lesenden Routen, in beide Richtungen, mit Zahl und Klemme |
| Kein Bildschirmtext verlangt eine Tastenkombination | kein Wert der drei Dateien nennt noch eine, das Kommentarfeld namentlich |

**Elf Gegenproben sind dazugekommen** (1169 bis 1180, ohne 1043), und eine ist
gefallen: `1043` prüfte, dass die mitgelieferten Kriterien in `db.js` nicht nach der
Spalte `language` fragt — den Code gibt es nicht mehr. Zwei ältere sind
nachgezogen, weil ihr Suchtext sich geändert hat: `489` (die Spaltenliste des
deckenden Index) und `1041` (die weiche Landung von `tryIndex`).

**Gefahren am 21. September 2026, vier Nebenspuren, gegen den gebauten Stand:
14 Gegenproben, 0 STUMM.**

| # | Rückbau | namentlich rot |
|---|---|---|
| 489 | Dem deckenden Index fehlt eine Spalte | 5 Prüfungen in 4 Gruppen, darunter „Und der deckende Index trägt genau diese Spalten samt der Fassung" |
| 1041 | Die Indizes auf nachgerüstete Spalten fallen wieder hart | 4 in 3 Gruppen, darunter „Und die Instanz kommt in jedem der achtzehn Fälle hoch" |
| 1169 | Die drei Kriterien entstehen wieder auf Deutsch | 6 in 4 Gruppen, darunter „Und die drei tragen die Namen der Auslieferungssprache" |
| 1170 | Die weiteren Sprachen bekommen wieder einen Namen daneben | 8 in 6 Gruppen, darunter „Und keine weitere Sprache bekommt einen Namen daneben" |
| 1171 | Eingesetzt wird nicht mehr nur in eine leere Tabelle | 9 in 5 Gruppen, darunter „Die Sterne zeigen genau eine Zeile je Kriterium" |
| 1172 | Ein gefragter Schlüssel ohne Antwort wird wieder nichts | 5 in 3 Gruppen |
| 1173 | Die Marke des gelöschten Kommentars bekommt wieder ein Klickziel | 12 in 8 Gruppen |
| 1174 | Das Kommentarfeld verlangt wieder eine Tastenkombination | 8 in 5 Gruppen, darunter „Und genau hundertsechzig Sätze sind andere" |
| 1175 | Der Index auf `criterion_id` fällt weg | „Die Kriterienzählung nimmt idx_ratings_criterion" |
| 1176 | Der deckende Index der Dateiliste fällt weg | 4 in 3 Gruppen, darunter „Die Dateiliste nimmt idx_attachments_list, und er deckt sie" |
| 1177 | Die Fassung der Kachel fällt aus der Spaltenliste des Index | 4 in 3 Gruppen |
| 1178 | Ein Index mit alter Spaltenliste bleibt wieder stehen | 5 in 4 Gruppen, darunter „Ein Index mit alter Spaltenliste wird beim Start neu angelegt" |
| 1179 | Das Verzeichnis der lesenden Routen verliert eine Zeile | 4 in 3 Gruppen, darunter „Der Prüfstand kennt jede lesende Route" |
| 1180 | Eine Zeile des Verzeichnisses nennt die falsche Klemme | 4 in 3 Gruppen, darunter „Und die Klemme jeder Zeile steht so im Kopf der Route" |

*1170 baut den ersten Versuch aus Abschnitt 3 wieder ein: er trägt die
Übersetzungen in `criterion_names` ein und fällt damit an der Prüfung auf, die
die Tabelle leer verlangt.*

### Die Zahlen, die mitgezogen sind

| | vorher | nachher |
|---|---:|---:|
| Sprachschlüssel je Datei | 1.229 | **1.233** |
| Schlüssel samt Mehrzahlformen | 1.317 | **1.321** |
| Regelzeilen im Stilblatt | 1.672 | **1.673** |
| Rückbauten | 1.104 | **1.115** |
| davon auf Prüfstandsdateien | 31 | **32** |
| Kommentarzeilen über alles | 16.438 | **16.557** |
| Codezeilen über alles | 66.056 | **66.429** |

Die sechs Gleichlautsummen sind neu gemessen: alle drei Sprachen sind
angefasst, also sind alle sechs andere.

| | eins | andere |
|---|---|---|
| de | `015f17460eceaf7a` | `7ccda413374a4079` |
| en | `1f666bca14988c58` | `0255fb6b49b3599f` |
| tr | `bb671551a2093a83` | `7a83111338a3cac7` |

---

## 11. Was offen bleibt

- **Die Entscheidung über die Zählzeile der Kachel.** Gemessen ist sie; ob die
  Kachel auf Zeichen umgestellt wird, entscheidet der Betreiber.
- **Die Fotokachel in einer Nebentabelle** — der vierte Punkt aus Befund 39.
  Die Ableitungen müssten neu gerechnet werden.
- **Fehlt `rating_criteria.language`, kommt der Server nicht hoch.** Der Kasten
  über eine unvollständige Datenbank sagt „THIS INSTANCE STARTS ANYWAY"; für
  diese eine Spalte stimmt das nicht, weil `qCriteria` sie beim Vorbereiten
  liest. **Der Befund ist älter als diese Runde** und beim Bauen aufgefallen,
  weil das Einsetzen der Kriterien aus `db.js` in den Server gezogen ist. Für
  `db.js` gilt die Zusage weiterhin: das bloße Öffnen der Datei kommt durch.
- **Die Vorgabewerte beim Sortieren** sind im Fahrplan vorläufig gestrichen.
  Sie kommen zurück, sobald beschrieben ist, was gemeint war.
