# Änderungsprotokoll 0.8.3 — Stufe G2, zweite Hälfte (erster Teil)

**Rohstoff für die Dokumentenpflege. Projektstand und Konzeptpapier sind nicht
angefasst.**

Gebaut wurden die Auftragspunkte **1 bis 4**. Am benannten Haltepunkt nach
Punkt 4 wurde angehalten; **Punkt 5 (Anlegen-Schalter) und Punkt 6
(Vergleichsumschalter) sind nicht angefasst** und stehen unverändert offen.

Prüfungen: **1204 → 1243** (39 neue), alle grün.
`F_ROUTEN` unverändert **46** Routen — keine neue schreibende Route.

---

## 1. Was gebaut wurde, je Datei

### `package.json`
Version auf `0.8.3`.

### `db.js` (+31 Zeilen)
- Spalte `images_removed INTEGER NOT NULL DEFAULT 0` an `comments`, **in der
  vollständigen DDL**, mit der Begründung als zeitlosem Kommentar: Ausnahme von
  „kein Änderungsverlauf", Aussage über den jetzigen Zustand, nur bei fremdem
  Eingriff, nie zurücksetzbar, nie im Textfeld.
- **Markierter Umstiegsblock** `umstieg083()` (siehe Abschnitt 2, Abweichung 1)
  zwischen `// UMSTIEG 0.8.3 — ENTFAELLT MIT 1.0` und `// ENDE UMSTIEG 0.8.3`.
- `umstieg083` wandert in `module.exports`, ebenfalls unter der Marke.

### `server.js` (+38 Zeilen)
- `qComments()` bekommt den Benutzer als **zweites Argument** samt Klemme
  (`if (benutzerId == null) throw`) und liefert **`mine`** an jedem Kommentar —
  dasselbe Muster wie am Testtag (0.7.0) und an der Stimme (0.8.2). Die einzige
  Aufrufstelle in `detail()` ist nachgezogen; `user_id` verschwindet weiterhin
  aus der Antwort.
- **`bilderEntfernt`** in der Antwort; die nackte Spalte `images_removed` wird
  gelöscht, bevor die Zeile hinausgeht — dieselbe Bauform wie bei `user_id`.
- `DELETE /api/comment-images/:id` zählt den Vermerk hoch, **nur wenn
  `b.user_id !== req.benutzer.id`**. Blankes `UPDATE`, kein `OR REPLACE`.
- **Export unverändert.** Die Kommentarabfrage im Export zählt ihre Spalten
  einzeln auf; `images_removed` kann dort gar nicht durchrutschen.
  Formatnummer bleibt **6**.

### `public/app.js` (+46 Zeilen)
- `begrenzeWolke()` bricht bei `offsetHeight === 0` ab, setzt **nichts** und
  nimmt eine vorhandene `maxHeight` weg (erster Weg gegen die halb aufklappende
  Wolke).
- Modulweite Ansage **`wolkeNeuzeichnen`**: in `route()` geleert, in
  `renderDetail()` auf `drawWolke` gesetzt, in `ruesteBloeckeAus()` beim
  **Auf**klappen des Blocks `tags` gerufen (zweiter Weg).
- `drawComments()`: `meins` (aus `c.mine`) und `verwalten` (`meins || ADMIN`)
  steuern ✎, ✕ am Kommentar, ✕ an der Bildkachel und die drei Marken. Die
  Behandler hängen nur an tatsächlich vorhandenen Elementen.
- Der **Eingriffsvermerk** als eigene `<span class="cmt-eingriff">` in der
  Kopfzeile, mit Ein- und Mehrzahl.

### `public/style.css` (+13 Zeilen)
- `.mark.aufg.on { color: var(--blue); border-color: var(--blue); }`, unmittelbar
  über `.mark.aufg.on.fertig`, mit Begründung: der Knopf trägt die Farbe der
  Kante, die er setzt.
- `.cmt-eingriff { color: var(--text-2); }` — eine Angabe, kein Alarm, kein Rot.

### `pruefung.js` (+288 Zeilen)
- Doppelgänger liefert **`mine` und `bilderEntfernt` an allen sechs**
  Kommentaren; zwei davon mit **verschiedenen** Vermerkzahlen (1 und 2), damit
  Ein- und Mehrzahl und die Zuordnung zur eigenen Zeile prüfbar sind.
- Neuer Abschnitt **„UMSTIEG 0.8.3 — ENTFAELLT MIT 1.0"** (91 Zeilen, 7
  Prüfungen).
- Neue Prüfungen in `Rechte am Eintrag` (Vermerk, `mine` mit zwei Rufern),
  `Tagwolken` (beide Wege), `Kommentare in der Oberflaeche` (Farbe, Vermerk,
  fünf Fälle mit einem zweiten Aufbau ohne Adminrolle).
- **Eine Prüfung umgedreht** statt gelöscht (Stolperstein 74), eine
  **nachgeschärft** (siehe Abschnitt 3, Stolperstein 81).

### Unverändert
`auth.js`, `keys.js`, `anhaenge.js`, `zugang.js`, `public/index.html`,
`README.md`, `Dockerfile`, `docker-compose.yml`.

---

## 2. Abweichungen und Entscheidungen

| # | Was | Entschieden | Begründung |
|---|---|---|---|
| 1 | **Umstiegscode für die Spalte** | **Doch nötig** — gegen Konzeptpapier und Projektstand, die beide „kein Umstiegscode" sagen | **Vor dem Bauen gemeldet und ausdrücklich freigegeben.** Nachgestellt statt behauptet: `CREATE TABLE IF NOT EXISTS` mit der neuen Spalte lässt eine vorhandene Tabelle unangetastet (Stolperstein 13), und seit 0.8.1 gibt es in `db.js` keinen Nachrüstweg mehr. Die Vorgabe 0 greift für jede **Zeile**, aber nur dort, wo die **Spalte** existiert — genau das verwechselte der Entwurf. Eine Datenbank aus 0.8.0 bis 0.8.2, also der zugesicherte Bestand, liefe ohne den Block in einen SQL-Fehler. Gebaut nach der Bauregel: eine benannte Funktion, ein Ort, Marken drumherum, eigener Prüfabschnitt. |
| 2 | „Fünf Fälle, drei Antworten" | Die **drei Spalten der Rechtetabelle** (Konzeptpapier Abschnitt 3): Verfasser, anderer, Admin | Der Auftrag verwies auf „die Tabelle im Konzeptpapier"; bei der zweiten Hälfte von G2 steht keine. Die passende ist die Rechtetabelle. Serverseitig sind es **zwei** Regeln (`nurSelbst`, `darfAendern`) — die dritte Antwort ist die Spalte „anderer", die überall leer ist. |
| 3 | „+ Bild" bekommt **keine eigene Klemme** | Fällt baulich mit ✎ weg | Der Knopf steht ausschließlich im Bearbeitenmodus, und der hängt am ✎. Eine zweite Klemme daneben ließe sich nicht gegenprüfen: ihr Rückbau bliebe stumm, weil der Weg dorthin ohnehin fehlt. **Bestätigt im Gespräch:** Anhängen *ist* Bearbeiten; wer etwas beizutragen hat, schreibt einen eigenen Kommentar. Der Admin darf nicht anhängen, wohl aber löschen — so stand es serverseitig schon seit 0.7.2. |
| 4 | Vermerk bei **herrenloser** Zeile | Wird hochgezählt | `user_id IS NULL` heißt: es gibt keinen Verfasser, also ist jeder Entfernende ein anderer. Die Bedingung `b.user_id !== req.benutzer.id` fällt dort von selbst richtig aus. |
| 5 | Ort der Farbregel | `.mark.aufg.on` **über** `.mark.aufg.on.fertig`, nicht unter `.mark.on` | Beide Zustände des Aufgabenknopfs stehen beieinander; drei bzw. vier Klassen schlagen zwei über die Spezifität, die Reihenfolge entscheidet nichts. Stolperstein 78 ist gewahrt: `regelM()` trifft beide Selektoren wörtlich, und auf `.mark.on` besteht ein eigener Wächter, der weiterhin Orange verlangt. |
| 6 | Prüflage „Datenbank ohne die Spalte" | **Tabellenneubau**, nicht `ALTER TABLE … DROP COLUMN` | SQLite prüft nach dem Entfernen den verbliebenen DDL-Text; der endet hier mit einem Kommentar hinter dem letzten Komma und scheitert an „incomplete input". Der Neubau läuft außerhalb jeder Transaktion (`PRAGMA foreign_keys` wäre darin ein stiller No-op) — Stolperstein 12. |
| 7 | `AUTH_RESET`-Zeile in der Karte „Zugang" | **Nicht angefasst** | Im Gespräch mitgenommen, aber nicht gebaut: die Änderung gehört inhaltlich zu Stufe G3, wo dieselbe Karte ohnehin überarbeitet wird. Steht unter „Offen geblieben". |

---

## 3. Neue Stolpersteine

**81. Eine Prüfung, die bei fehlender Regel grün bleibt, kann gar nicht
scheitern.** Die Prüfung *„Und ausdrücklich nicht mehr Orange"* fragte nur
`!/var(--accent)/.test(regelM('.mark.aufg.on'))`. Fehlt die Regel, liefert
`regelM()` eine leere Zeichenkette, und die Verneinung ist wahr — die
Gegenprobe R3 machte nur eine statt zwei Prüfungen rot. Richtig ist
`!!regelM(…) && !…`: **erst das Vorhandensein, dann die Eigenschaft.**
Verwandt mit 63 („eine Spalte, die man vergleicht, muss im SELECT stehen") und
31, aber eigenständig: dort ist der Wert `undefined`, hier ist er ein
*plausibler* leerer Wert, der die Bedingung erfüllt.

**82. Eine Spalte aus einer DDL zu entfernen hinterlässt ein nachlaufendes
Komma — und der Lauf bricht ab, ohne einen Namen zu nennen.** Der Rückbau R9
(„Spalte aus der DDL") erzeugte `SqliteError: near ")": syntax error`, `db.js`
warf beim Laden, und `npm test` gab keine einzige Zeile aus. Das ist
**Stolperstein 76 in neuer Gestalt**: ist ein Rückbau so grundlegend, gehört
eine zweite, engere Gegenprobe daneben (R9b), die die DDL gültig lässt und
genau eine Prüfung trifft. **Merksatz: die letzte Spalte einer Tabelle trägt
das Komma ihres Vorgängers mit.**

---

## 4. Gegenprobentabelle

Jeder Rückbau ist **vor dem Deuten per `diff`** gegen eine unberührte Kopie
belegt (Stolperstein 75); nach jedem Lauf wurde zurückgestellt, und der
Schlusslauf lief gegen einen `diff`-sauberen Quelltext.

| # | Rückbau | rot |
|---|---|---|
| R1 | `begrenzeWolke()` misst wieder in der eingeklappten Wolke | **2** — *Eine nicht messbare Wolke bekommt keine Höhe verpasst* · *Und seine Wolke trägt dabei keine feste Höhe* |
| R2 | Aufklappen zeichnet die Wolke nicht neu | **1** — *Und dabei wird die Wolke neu gezeichnet* |
| R3 | Aufgabenmarke fällt auf `.mark.on` zurück (**vor** dem Nachschärfen) | 1 — **Fund**, siehe Stolperstein 81 |
| R3b | derselbe Rückbau nach dem Nachschärfen | **2** — *…trägt Blau wie seine Kante* · *Und ausdrücklich nicht mehr Orange* |
| R4 | `mine` fällt aus der Kommentarantwort | 3 |
| R5 | Vermerk **ohne** die Bedingung „ein anderer als der Verfasser" | 4, darunter *Räumt der Verfasser bei sich auf, entsteht kein Vermerk* |
| R6 | Der Eingriff wird **gar nicht** vermerkt | 2 — andere Liste als R5 |
| R7 | `bilderEntfernt` fällt aus der Antwort | **1** |
| R8 | Umstiegsblock entfernt | **2** — *Der Umstieg ergänzt die Spalte im Bestand* · *Er sagt im Protokoll, was er getan hat* |
| R9 | Spalte aus der DDL, grob | **0 — Lauf abgebrochen**, siehe Stolperstein 82 |
| R9b | Spalte aus der DDL, DDL bleibt gültig | **1** — *Eine frische Anlage trägt die Spalte ohne Umstieg* |
| R10 | ✎ wieder an jedem Kommentar (`meins = true`) | 6 |
| R11 | Löschen und Marken wieder an jedem (`verwalten = true`) | 3 — echte Teilmenge von R10, aber andere Liste |
| R12 | ✕ wieder an jeder Bildkachel | **1** — *Am fremden Kommentar bleibt kein einziges Bedienelement* |
| R13 | Vermerk verschwindet vom Bildschirm | **1** |
| R14 | Vermerk wandert **in** den Kommentartext | **2** — *Die Serverreihenfolge wird übernommen* · *Und ausdrücklich nicht im Textfeld* |

**R1 gegen R2** ist die wichtigste Zeile: die beiden Wege gegen die halb
aufklappende Wolke verdecken einander **nicht** (Stolperstein 52). Ebenso
**R5 gegen R6** — die Bedingung und das Hochzählen sind getrennt belegt, und
**R10 gegen R11** trennt „nur der Verfasser" von „Verfasser oder Admin".

**Nicht gegengeprüft, mit Grund:** die Klemme in `qComments()`
(`if (benutzerId == null) throw`). Ihr Rückbau bliebe stumm, weil `detail()`
eine Ebene höher dieselbe Frage schon stellt und vorher wirft. Sie steht
trotzdem — dieselbe Begründung wie bei `qTestDays()` und `detail()`:
`better-sqlite3` bindet ein fehlendes Argument still als `NULL`, und hier wäre
`null === null` obendrein **wahr**, eine vergessene Aufrufstelle erklärte also
wortlos jede herrenlose Zeile zur eigenen.

---

## 5. Prüfungszahlen

| | vorher | nachher |
|---|---|---|
| Prüfungen gesamt | 1204 | **1243** |
| davon im Abschnitt „UMSTIEG 0.8.3" | — | 7 |
| `F_ROUTEN` | 46 | **46** (unverändert) |
| Formatnummer Export | 6 | **6** (unverändert) |

Neue Prüfungen nach Ort: `Rechte am Eintrag` 12 · `UMSTIEG 0.8.3` 7 ·
`Tagwolken` 5 · `Kommentare in der Oberflaeche` 15. Eine umgedreht
(Stolperstein 74), eine nachgeschärft (Stolperstein 81).

---

## 6. Vorgemerkt für 1.0

**Neuer Eintrag:**

- **`db.js`, `umstieg083()` — 18 Zeilen, 7 Prüfungen.** Ergänzt `images_removed`
  an `comments` in einer Datenbank aus 0.8.0 bis 0.8.2; `CREATE TABLE IF NOT
  EXISTS` rüstet keine Spalten nach (Stolperstein 13), und seit 0.8.1 gibt es
  keinen anderen Nachrüstweg mehr. Zu 1.0 fällt der Block weg, **die Spalte in
  der DDL bleibt** — die Prüfung *„Eine frische Anlage trägt die Spalte ohne
  Umstieg"* hält genau das fest.
  Zugehörige Prüfungen: Abschnitt „UMSTIEG 0.8.3 — ENTFAELLT MIT 1.0" in
  `pruefung.js`, 91 Zeilen. Der Export von `umstieg083` in `module.exports`
  trägt dieselbe Marke und fällt mit.

Der vorhandene Punkt **„Harte Zurückweisung zu alter Datenbanken"** gewinnt an
Gewicht: mit 0.8.3 gibt es zum ersten Mal seit der Bereinigung wieder
Umstiegscode, und eine Anlage aus der Zeit vor 0.8.0 liefe weiterhin
wortlos in SQL-Fehler.

---

## 7. Offen geblieben

- **Punkt 5 — die beiden Anlegen-Schalter.** Nicht angefasst. Vorbereitet und
  im Gespräch bestätigt: `tagsFreiAnlegen` und `kategorienFreiAnlegen`, global,
  Vorgabe an, als Ableitung beim Lesen, geschrieben über `PUT /api/settings`
  (Adminprüfung schon abgeleitet, keine neue Route). Drei Anlegewege bekommen
  die Klemme **hinter** dem Nachschlagen des vorhandenen Namens — nur dann
  bleibt „Zuweisen darf immer jeder" baulich wahr: `POST
  /api/product-categories` (`'offen'` → `'im Rumpf'`), `POST /api/items/:id/tags`
  (`'nurEintragVerfasser'` → `'nurEintragVerfasser, im Rumpf'`), `POST
  /api/test-days/:id/tags` (schon `'im Rumpf'`). `F_ROUTEN` bliebe bei 46
  Einträgen, zwei Arten änderten sich. Am Testtag bleibt die Eingabe stehen.
- **Punkt 6 — der Vergleichsumschalter.** Nicht angefasst. Im Gespräch
  entschieden: Vorgabestellung **„alle"**; die Kopfzeile bildet in Stellung
  „meine" ihre Zahl **im Klienten** (bei einem Bewerter hat jedes Kriterium
  höchstens eine Stimme, Stufe 1 des Zweistufenmittels ist also der eigene
  Wert) — kein zweiter Rechenweg im Server, aber ein zweiter Rundungsort für
  eine *andere* Zahl. Die Testtagzeile schaltet mit, gezählt über `mine`.
- **Die `AUTH_RESET`-Zeile** in der Karte „Zugang" (`public/app.js`) sagt
  weiterhin „vergessen heißt `AUTH_RESET=1` am Server". Seit 0.8.0 falsch; die
  Karte „Zugänge" nennt zwei Bildschirmzeilen tiefer schon `zugang.js`. Gehört
  zu G3, wo dieselbe Karte ohnehin angefasst wird.
- **Nicht im Browser gesehen** (Stolperstein 29): die blaue Aufgabenmarke, der
  Eingriffsvermerk in der Kopfzeile und die aufklappende Tagwolke sind am
  Stylesheet und im DOM geprüft, nicht am Bildschirm. Die Wolke ist der
  wichtigste der drei — jsdom rechnet kein Layout, `offsetHeight` ist dort
  gestellt.

---

## 8. Für die Dokumente

- **Projektstand Abschnitt 5:** neue Punkte zu `mine` am Kommentar, zum
  Eingriffsvermerk als eigener Angabe (nie im Textfeld, nicht zurücksetzbar,
  nicht im Export), zu „Anhängen ist Bearbeiten" und zur Klarstellung bei
  „Orange ist Art und Bedienung" — **Klarstellung, keine Rücknahme**: die Art
  hat drei Farben (Orange für den Bericht, Blau für die Aufgabe, Grün für
  erledigt), und der Knopf trägt die Farbe der Kante, die er setzt.
- **Abschnitt 6:** Stolpersteine **81** und **82**.
- **Abschnitt 7:** 1243 von 1243; `F_ROUTEN` weiterhin 46.
- **Abschnitt 9:** Zeile für 0.8.3.
- **Abschnitt 10 Punkt 5:** G2 zweite Hälfte zur Hälfte erledigt — Punkte 1
  bis 4 gebaut, 5 und 6 offen.
- **Abschnitt 10, „Vorgemerkt für 1.0":** der Eintrag aus Abschnitt 6 dieses
  Protokolls.
- **Abschnitt 11:** der Satz „kein Umstiegscode" beim Eingriffsvermerk ist
  **berichtigt** — er galt für die Zeilen, nicht für die Spalte.
- **Konzeptpapier, Stufe G2 zweite Hälfte:** Punkte 1 bis 4 durchstreichen und
  mit Version und Abweichungen annotieren; die drei offenen Punkte
  (5, 6, `AUTH_RESET`-Zeile) bleiben stehen.
