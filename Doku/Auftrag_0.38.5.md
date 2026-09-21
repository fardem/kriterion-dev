# Auftrag 0.38.5 — „Zwei Befunde des Betriebs, eine Zusage, zwei Wörter"

Gebaut wird auf 0.38.4. **PATCH.**

Zwei Befunde des Betreibers vom 21. September 2026, die Zusage des Kastens über
eine unvollständige Datenbank, der letzte Fehlalarm des Prüfstands und die
beiden Wörter, die `CLAUDE.md` seit 0.37.0 verbietet. Dazu zwei Handgriffe an
den Papieren.

**Schema: unverändert. Format: unverändert. Keine neue Route.**

---

## 1. Die Fragetafel, entschieden vor der ersten Zeile

Fünfzehn Fragen, entschieden vom Betreiber am 21. September 2026.

| | Frage | Entscheidung |
|---|---|---|
| **F1** | Die Fingerprintzahl in zwei Papieren berichtigen | **ja** |
| **F2** | Den gebauten Auftrag aus dem Repository nehmen | **ja** |
| **F3** | „Startet trotzdem" messen und wahr machen | **ja, mit Messung** |
| **F4** | Die Zählzeile der Meldungstafel | **Fassung B**, bei 360 Pixeln nachgemessen |
| **F5** | Die festen Wartezeiten im Prüfstand | **ja, aber beim nächsten Mal** |
| **F6** | „Auffangnetz" und „Grundausstattung" umbenennen | **ja** |
| **F7** | Der Aufräumer auf vier Spuren | **ja** |
| **F8** | Die Fotokachel in eine Nebentabelle | **ja — eigene Runde 0.39.0.** *Der Betreiber erlaubt ausdrücklich beides: wandern lassen und neu rechnen* |
| **F9** | Export, Import und Papierkorb | **gemessen; eigene Runde nach 0.39.0** |
| **F10** | Der vierte Abruf nach dem Umbenennen | **nein** |
| **F11** bis **F14** | Halt als Frist, Chromium, Strichstärke, Kommentaranteil | nicht beantwortet, bleiben draußen |
| **F15** | Die Nummer | **0.38.5, PATCH** |
| **neu** | Die Rechentabelle rollt auf dem Telefon waagerecht | **ja** |

---

## 2. Was vorab gemessen worden ist

### Der Bestand des Betreibers

`ls -lh /app/data` am 21. September 2026: **583 MB** in `katalog.sqlite`.

Das ist weit über `EXCHANGE_WARN` (300 MiB) und über `EXCHANGE_MAX`
(460,8 MiB, neunzig Prozent der Stringgrenze von V8). **Der Export sagt bei
diesem Bestand ab und verweist auf den Teilexport** — so ist er gebaut, und
ein Fangnetz unter `res.json()` fängt den `RangeError`, falls die Schätzung zu
niedrig ausfällt. **Das entschärft Punkt 40:** es ist keine Sicherheitsfrage,
sondern Bequemlichkeit und Spitzenspeicher.

**Für Punkt 39 gilt das Gegenteil:** bei 583 MB Blobs läuft jede
Übersichtsseite durch Hunderte Megabyte Overflow-Seiten, um die Kacheln zu
lesen. Die Runde 0.39.0 hat damit einen gemessenen Anlass.

### Die Breite des Geräts

Das Telefon des Betreibers ist ein Galaxy S21 5G: **1080 physische Pixel bei
Pixeldichte 3, also 360 CSS-Pixel.** Die Messung von 0.38.4 lief bei 390 und
war damit dreißig Pixel großzügiger als das Gerät. **Ab dieser Runde wird bei
360 gemessen.**

### Ein roter Prüfling auf `main` — und er wird täglich schlimmer

Am 21. September 2026 meldet der volle Lauf **7226 von 7227**. Gescheitert ist
`Und carla sieht ihrerseits nur ihre beiden` (`test/roundtrip.js`:10887). **Der
Fehler ist reproduzierbar**, im Einzellauf des Moduls ebenso.

**Es ist kein Fehler der Anwendung, sondern eine Zeitbombe im Prüfstand.** Die
Prüflage setzt vier Sitzungen mit **festen Zeitstempeln**
(`test/roundtrip.js`:10834–10838) und misst sie gegen ein **mitlaufendes
Fenster** von dreißig Tagen (`SESSION_DAYS`, `auth.js`:101; gelesen in
`auth.js`:606).

| Sitzung | `last_seen` | Alter am 21.09. | in der Liste |
|---|---|---:|---|
| anna-1 | 2026-08-24 07:30 | 28 Tage | ja |
| anna-2 | 2026-08-23 21:00 | 28 Tage | ja |
| carla-1 | 2026-08-24 06:00 | 28 Tage | ja |
| **carla-2** | **2026-08-22 09:45** | **30 Tage** | **nein** |

**Der 21. September ist der erste Tag, an dem die Prüfung fällt.** Am 23. fällt
anna-2 heraus, am 24. die beiden letzten — dann ist die ganze Gruppe rot.

**Die Reichweite ist klein und gemessen:** in den ausgelieferten Dateien gibt
es **vier** Stellen mit `datetime('now', '-…')` — drei davon sind dasselbe
Sitzungsfenster, die vierte ist eine Sekunde in `server.js`:1886. In `test/`
stehen 251 feste Datumsangaben, aber nur die Sitzungen liegen an einem
mitlaufenden Fenster.

### Die beiden Wörter

Gezählt am 21. September 2026: **18 Stellen**, nicht „Dutzende", wie der
Fahrplan sagt.

| | Auffangnetz | Grundausstattung |
|---|---|---|
| ausgelieferte Dateien | `db.js`:680, `db.js`:707, `server.js`:5324 | `db.js`:760 |
| Prüfgruppenname | — | `test/roundtrip.js`:17615 |
| Prüfungsnamen | `test/source.js`:540, :545 | `test/roundtrip.js`:258, :259 |
| Rückbau und erwartete Gruppe | `counterproof.js`:8377 | `counterproof.js`:9434 |
| reine Kommentare | 7 | 3 |

---

## 3. Die Bauabschnitte

### BA 0 — Die Zeitbombe entschärfen (vor allen anderen)

**Zuerst, weil `main` rot ist und jeder weitere Tag eine Prüfung mehr rot
macht.** Ohne diesen Bauabschnitt liefe die Nacht gegen einen Prüfstand, der
aus einem Grund rot ist, den sie nicht verursacht hat.

**Gebaut wird:** die vier Zeitstempel in `test/roundtrip.js`:10834–10838 werden
**gegen die Uhr gerechnet statt festgeschrieben** — vier verschiedene Abstände
innerhalb des Fensters, damit die Reihenfolge nachweisbar bleibt. Der
Kommentar daneben nennt heute den Grund für feste Werte („vier Zeilen in
derselben Sekunde liessen sich in der Reihenfolge nicht unterscheiden"); er
bleibt richtig und bekommt den zweiten Grund dazu.

**Dann die Nachschau:** gibt es weitere Prüflagen, die feste Daten gegen ein
mitlaufendes Fenster stellen? Gesucht wird nach beiden Seiten — nach den
Fenstern im Code und nach den Fixdaten, die sie füttern. **Was gefunden wird,
kommt ins Protokoll, auch wenn es nichts ist.**

**Prüfung:** eine Gegenprobe, die feste Zeitstempel in dieser Prüflage wieder
einsetzt, macht die Gruppe rot. Und der volle Lauf ist grün.

### BA 1 — Die Fingerprintzahl berichtigen (F1)

`Doku/Aenderungsprotokoll_0.38.4.md`:21 und `CHANGELOG.md`:37 nennen
`0d3111e4`. **Gemessen sind `246372bd`** — an `bacc93a` und an `8cec0e8`, dem
ersten Commit der Runde. Die falsche Zahl gehört zu keinem Commit; sie stammt
aus einem Zwischenstand.

**Daneben steht, warum sie sich geändert hat** — so verlangt es die Regel über
berichtigte Zahlen.

### BA 2 — Den gebauten Auftrag entfernen (F2)

`Doku/Auftrag_0.38.4.md` fällt weg. Die Runde ist gebaut, und es liegt immer
nur einer im Repository. **`test/source.js` filtert `Auftrag_*` ausdrücklich
heraus**, es hängt also keine Prüfung daran.

### BA 3 — Die Rechentabelle bricht um (Befund des Betreibers)

**Was gemeldet ist:** der Kasten „Wie die Durchschnittszahl zustande kommt"
(`showCalc()`, `public/app.js`:5968) rollt auf dem Telefon waagerecht.

**Die Ursache steht in einer Zeile.** `public/style.css`:1836:

```css
.calc { display: grid; grid-template-columns: 1fr auto auto auto; }
```

`1fr` ist `minmax(auto, 1fr)`, und `auto` als Untergrenze heißt: mindestens so
breit wie der längste Inhalt, der nicht umbrechen kann. `.calc-row >
span:first-child` (Zeile 1841) trägt weder `min-width: 0` noch ein
Umbruchrecht. Ein langer Kriterienname schiebt die Spalte auf, und die Tabelle
wird breiter als der Kasten.

**Derselbe Fehler ist schon einmal repariert worden.** `.rlist`
(`public/style.css`:967) benutzt dieselbe Rasterangabe, und seine erste Spalte
trägt in der schmalen Ansicht `min-width: 0; overflow-wrap: anywhere`
(Zeile 2890) — mit dem Kommentar *„Ein langer Kriterienname stand ueber den
Rand hinaus."* Die Rechentabelle ist dabei übersehen worden.

**Gebaut wird dieselbe Reparatur an `.calc`.**

**Gemessen wird bei 360 Pixeln, vorher und nachher:** die Breite der Tabelle
und ob waagerecht gerollt wird.

> **DIE ERSTE SPALTE IST NICHT DIE EINZIGE UNTERGRENZE.** Die Kopfzeile
> schreibt vier Wörter aus — Kriterium, Note, Gewicht, Rechnung — in Spalten,
> die auf `auto` stehen. Reicht die Reparatur der ersten Spalte nicht, wird
> auch dort gemessen und entschieden. **Abkürzungen werden nicht erfunden.**

**Prüfung:** ein Kriterienname von vierzig Zeichen sprengt die Tabelle bei
360 Pixeln nicht mehr.

### BA 4 — Die Zählzeile in Fassung B (F4)

`newWords()` (`public/app.js`:3058) schreibt die Zählzeile der Meldungstafel.

| | |
|---|---|
| heute | `12 Kommentare · @34 · 56 Bewertungen` — 36 Zeichen |
| **Fassung B** | `12 Kommentare · @34 · ★56` — 25 Zeichen |

**Das Wort bleibt beim ersten Stück, die Bewertungen bekommen das Zeichen.**
Der lange Wortlaut wandert in den Überfahrtext.

**Die Bauform gibt es schon:** `commentNumbers()` (`public/app.js`:960) liefert
für den Blockkopf beides — `html` kurz mit Zahl und Zeichen, `text` lang mit
Wörtern. Die Meldungstafel bekommt dieselbe Trennung.

**Das `★` ist nicht erfunden:** `public/app.js`:4077 schreibt es an der
Sternzeile.

**Gemessen wird bei 360 Pixeln, in allen drei Sprachen, vorher und nachher.**
Die hochgerechnete Breite von rund 158 Pixeln für Fassung B ist zu bestätigen
oder zu berichtigen.

### BA 5 — „Startet trotzdem" messen und wahr machen (F3)

**Der Kasten verspricht etwas, das nicht für jede Spalte stimmt.**
`db.js`:572 schreibt beim Start über eine unvollständige Datenbank: *„THIS
INSTANCE STARTS ANYWAY. Nothing is blocked … but every page that reads one of
the parts above fails."*

**Für `rating_criteria.language` stimmt das nicht.** `qCriteria`
(`server.js`:2021) bereitet beim Laden des Moduls eine Abfrage über die Spalte
vor, und `db.prepare` scheitert über eine fehlende Spalte — der Server kommt
gar nicht hoch.

**Erst messen.** Je Eintrag aus `REQUIRED_COLUMNS` (`db.js`:503, achtzehn
Stück) eine Testdatenbank, die Spalte entfernen, den Server starten. Heraus
kommt eine Tafel: **welche Spalten verhindern den Start, welche nicht.**

**Dann bauen: die Zusage wahr machen**, nicht den Satz abschwächen. Die
betroffenen Abfragen überleben eine fehlende Spalte — dieselbe Bauform, die
`db.js` beim Einsetzen der Kriterien schon benutzt (`seedHasLanguage`).

**Prüfung:** je Spalte der Tafel ein Start ohne sie, und die Instanz antwortet
auf `/api/config`. Dazu eine Gegenprobe, die den Kasten rot macht, wenn seine
Zusage wieder falsch wird.

### BA 6 — Der Aufräumer auf vier Spuren (F7)

**Was passiert:** bei einem Gegenprobenlauf mit vier Nebenspuren wird die
Prüfgruppe „Der Prüfstand räumt beim Start auf" in **neun von einundzwanzig**
Läufen rot — bei Rückbauten, die mit ihr nichts zu tun haben.

**Gebaut wird:** die Lage nachstellen, messen, welcher Zweig der Erkennung
greift, und beheben, was sich zeigt.

> **DER ABBRUCH STEHT IM AUFTRAG UND NICHT IM ERMESSEN.** Zeigt sich die
> Ursache nicht, kommt die Messung ins Protokoll, der Punkt bleibt offen, und
> die Runde geht weiter. **Es wird nicht geraten.**

### BA 7 — Die beiden Wörter (F6)

**Als Letztes**, über einen Baum, der sich nicht mehr bewegt.

**Die Ersatzwörter stehen hier und werden nicht in der Nacht erfunden:**

| Stelle | heute | wird |
|---|---|---|
| `db.js`:680, `db.js`:707 | Auffangnetz | **Rückfall** — das Wort steht schon im Haus |
| `server.js`:5324 | Auffangnetz | **Fehler-Handler** — so nennt `CLAUDE.md` es selbst |
| `db.js`:760 | Grundausstattung | **Vorgabewerte** — dort stehen Titel und Versionsstempel |
| die Prüfungen an den drei Kriterien | Grundausstattung | **Die mitgelieferten Kriterien** |

> **„GRUNDAUSSTATTUNG" MEINT ZWEI VERSCHIEDENE SACHEN**, und ein einziges
> Ersatzwort wäre falsch: in `db.js`:760 sind es die Vorgabewerte für Titel
> und Stempel, in den Prüfungen die drei mitgelieferten Kriterien.

**Was mitwandert:** der Prüfgruppenname in `test/roundtrip.js`:17615 und das
`expected` des Rückbaus in `counterproof.js`:9434 gehören zusammen — laufen
sie auseinander, wird der Rückbau stumm. Dazu der Rückbauname in
`counterproof.js`:8377 und die vier Prüfungsnamen.

**Nach dem Umbenennen fahren die Gegenproben vollständig**, nicht nur eine
Auswahl.

**Prüfung:** keines der beiden Wörter steht noch in einer ausgelieferten
Datei, in einem Gruppennamen, in einem Prüfungsnamen oder in einem
Rückbaunamen. Der Wortfilter des Prüfstands nimmt beide auf.

### BA 8 — Schlussarbeiten

- Die festen Zahlen nachziehen: Regelzeilen, Sprachschlüssel, die sechs
  Gleichlautsummen, die Kommentarzahlen je Datei und über alles, die Zahl der
  Rückbauten, die Zahl der Prüfungen.
- Gegenproben für jeden Bauabschnitt, der Code anfasst.
- `CHANGELOG.md`, `Doku/Aenderungsprotokoll_0.38.5.md`, der Fahrplan.
- **Im Sammelblatt:** Punkt 27 und Punkt 38 nachziehen, die Übersicht der
  offenen Punkte auf den neuen Stand bringen, und die Zeile im Fahrplan
  berichtigen, die von „Dutzenden" Prüfgruppen spricht — es sind achtzehn
  Stellen, davon sieben mit Namen.
- **`Doku/Auftrag_0.38.5.md` entfernen**, sobald die Runde steht.
- **`npm test` vollständig**, das Ergebnis wird genannt.
- Den Fingerprint **am fertigen Stand** messen und in beide Papiere eintragen.

> **DER FINGERPRINT WIRD ZULETZT GEMESSEN.** 0.38.4 hat ihn während des Bauens
> gemessen und eine Zahl veröffentlicht, die zu keinem Commit gehört. Gemessen
> wird, wenn keine ausgelieferte Datei mehr angefasst wird.

---

## 4. Was ausdrücklich draußen bleibt

| | warum |
|---|---|
| Die Fotokachel in eine Nebentabelle | **0.39.0**, eigene Runde, mit Sicherung davor |
| Export, Import und Papierkorb | eigene Runde nach 0.39.0; der Export sagt heute ab statt zu scheitern |
| Die festen Wartezeiten | **beim nächsten Mal**, Ansage des Betreibers |
| Der Trefferausschnitt im Ziel eines Links | Eingriff in den gemeinsamen Kern |
| Der vierte Abruf nach dem Umbenennen | beide Auswege sind schlechter als das Problem |
| Der Halt als Frist, der Sprung in Chromium, die Strichstärke, der Kommentaranteil | nicht beantwortet |

---

## 5. Die Zusagen dieser Runde

1. **Kein Verhalten ändert sich** außer an den vier Stellen von BA 3 bis BA 6.
2. **Das Schema wird nicht angefasst.** Keine Spalte, keine Tabelle, kein Index.
3. **Der gemeinsame Kern der Auszeichnung wird nicht angefasst.** Die Fassungen
   in `public/app.js` und `server.js` bleiben Zeichen für Zeichen gleich.
4. **Keine neue Route.**
5. **Kein neues Wort wird erfunden.** Die vier Ersatzwörter aus BA 7 stehen im
   Auftrag.
6. **Gemessen wird bei 360 Pixeln**, nicht bei 390.
