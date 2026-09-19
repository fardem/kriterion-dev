# Änderungsprotokoll 0.36.0 — „Sicherheit"

Gebaut am 19. September 2026, auf 0.35.2. MINOR.

Die Durchsicht vom 15. September 2026 hat fünf Lücken genannt. Eine war beim
Schreiben des Auftrags von selbst weggefallen, eine gehörte nicht mehr hierher.
**Drei sind gebaut, und die weggefallene hat ihre Automatik bekommen.**

| | vorher | nachher |
|---|---:|---:|
| Schreibende Routen ohne Schutz gegen ein fremdes Formular | 73 von 73 | **0 von 73** |
| Anmeldeversuche, die ein Neustart vergisst | alle | **keine** |
| Tabellen in der Datenbank | 28 | **29** |
| Zuweisungen an `innerHTML` mit ungeführter Einsetzung | 53 | **0** |
| Ungeführte Einsetzungen insgesamt | 104 | **0** |
| Stellen, an denen `npm audit` den Lauf rot färbt | 0 | **1** |
| Schlüssel je Sprachdatei | 1214 | **1215** |
| Zeilen im Containerprotokoll | 51 | **52** |
| Prüfungen | 7040 | **7064** |
| Gruppen in der Schlusstafel | 368 | **372** |
| Rückbauten | 1053 | **1062** |

> **FINGERPRINT DIESER RUNDE: `88f9dcfb`** — der Stand davor war `0fc33e91`.
> Er geht weiter über **19 Dateien**.
>
> Er ändert sich, weil `server.js`, `auth.js`, `db.js` und `public/app.js`
> Zeilen ändern, weil die drei Sprachdateien einen Schlüssel mehr tragen und
> weil `package.json` die neue Versionsnummer trägt.

**An den ausgelieferten Dateien sind es 293 neue und 123 entfernte Zeilen** —
gezählt ohne Leerraum (`git diff -w`). Über alles, mit Prüfstand und
Gegenproben, sind es 1128 neue und 365 entfernte.

**Zur Laufzeit wird keine Aussage gemacht.** Der Schlusslauf dieser Runde
dauerte 316,0 Sekunden, der zur 0.35.2 304,7 — beides Einzelläufe, und
dazwischen liegen 24 Prüfungen mehr, darunter eine, die 65 Routen einzeln an
der laufenden Instanz anfragt. *Drei Läufe auf demselben Stand lagen zwischen
308,4 und 323,5 Sekunden; was die neuen Prüfungen wirklich kosten, sagt erst
eine Messung mit fünf Läufen.*

---

## 1. Die Fragetafel, bevor die erste Zeile fiel

Der Auftrag stellt sechs Fragen, und alle sechs waren vom Betreiber vor dem
Bauen entschieden. Die Runde ist ohne Rückfrage gefahren.

| | Frage | Entscheidung | gebaut |
|---|---|---|---|
| **F1** | Ein Wächter vor allen Routen oder einer je Route? | einmal vor allen, mit benannter Ausnahmeliste | ja |
| **F2** | Wie kommt der Token in den Browser? | als zweiter Cookie ohne `HttpOnly` | ja |
| **F3** | Eigene Tabelle oder Spalte an `users`? | eigene Tabelle | ja |
| **F4** | Räumt der Aufräumer beim Start oder nach Zeit? | beim Start und stündlich | ja |
| **F5** | `npm audit` ohne Netz: übersprungen oder rot? | übersprungen, und die Gruppe sagt es | ja |
| **F6** | Noch einmal durchsehen? | nein, die Durchsicht gehört hinter die Runde | — |

---

## 2. BA 0 — Gemessen, bevor gebaut wurde

**Die Durchsicht hatte gezählt, nicht gelesen.** Sie nannte 199 Stellen; der
Auftrag hat daraus 178 gemacht und 59 als Obergrenze genannt. **Beim Messen
sind es 53 Zuweisungen mit zusammen 104 ungeführten Einsetzungen.**

*Warum die Zahl eine andere ist als die 59 des Auftrags:* dort wurde
buchstäblich gezählt — jede Einsetzung, die nicht mit `esc(`, `tH(`, `tMark(`
oder einer Symbolkonstante beginnt. Diese Messung liest verschachtelte
Vorlagen, Fallunterscheidungen und Kommentare mit: `${a ? \`<b>${esc(x)}</b>\` : ''}`
ist geführt, auch wenn der Ausdruck nicht mit `esc(` anfängt.

**Der Stand von `public/app.js` beim Messen:**

| | |
|---|---:|
| Zuweisungen an `innerHTML` | 172 |
| davon ohne jede Einsetzung | 57 |
| davon mit ausschließlich geführten Einsetzungen | 62 |
| **davon mit mindestens einer ungeführten** | **53** |
| ungeführte Einsetzungen insgesamt | 104 |

**Die Tafel der Entscheidungen.** Gezählt sind die Einsetzungen, die im Diff
von `public/app.js` hinzugekommen sind — verschachtelte mitgerechnet, deshalb
liegt die Summe über den 104 der Messung:

| Quelle des Werts | Entscheidung | Einsetzungen |
|---|---|---:|
| Nummern und Zähler aus der Antwort des Servers, Zeilennummern, Bildnummern | `Number(…)` | **35** |
| Text aus `fmtDate()`, `filesize()`, `today()`, `durationText()`; Adressen aus `imageSource()`, `sysUrl()`, `URL.createObjectURL()`; Schlüssel aus einer festen Tafel | `esc(…)` | **20** |
| Ein Satz aus der Sprachdatei in einem Attribut | `esc(t(…))` | **5** |
| Ein Satz aus der Sprachdatei, der im Markup landet | `tH(…)` statt `t(…)` | **6** |
| Der Ausdruck der Sprungleiste am Fuß des Eintrags | eigene Funktion `entryNav()` | **1** |
| Fertiges Markup aus einem Helfer oder einem Träger daneben | **benannte Ausnahme** | **48** |

*Die letzte Zeile ist der Stand von heute:* **30 Zuweisungen tragen zusammen 48
Einsetzungen, die nicht durch einen Maskierer gehen** — jede davon liefert
fertiges Markup, und jede steht unter einem der **27 Namen** der
Ausnahmeliste.

**Nicht eine einzige Stelle trug Benutzertext ungeschützt.** Titel, Tags,
Kategorien, Namen und Kommentare gingen schon vorher durch `esc()`. Was
ungeführt hineinging, waren Nummern, formatierte Zeiten, Adressen und Sätze
aus der eigenen Sprachdatei — **kein Weg für fremdes Markup, aber auch kein
Beleg dagegen.** Genau das ist jetzt anders.

---

## 3. BA 2 — Die Anmeldesperre übersteht einen Neustart

`auth.js` hielt die Zähler in einer `Map` im Arbeitsspeicher. **Ein Neustart
setzte jeden auf null** — wer eine Sperre abwarten musste, brauchte nur zu
warten, bis der Container einmal neu anlief.

**Sie liegen jetzt in `login_attempts`.** Eine eigene Tabelle und keine Spalte
an `users`: gezählt wird je IP *und* je Name, und eine IP hat keinen Zugang,
an den sie sich hängen könnte.

```
CREATE TABLE IF NOT EXISTS login_attempts (
  who TEXT PRIMARY KEY,           -- 'ip:…' oder 'name:…'
  tries INTEGER NOT NULL DEFAULT 0,
  until TEXT,                     -- nur bei der IP
  seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**An der Kurve ändert sich nichts.** Weich ab fünf Fehlversuchen, hart ab
zehn, fünf Minuten Sperre, und der Name wird nie hart gesperrt — sonst sperrte
ein Fremder einen Zugang aus, indem er ihn zehnmal falsch rät. Gerechnet wird
weiter in `delay()`, und `blocked` rechnet SQLite aus: zwei Uhren wären zwei
Wahrheiten darüber, wann eine Sperre endet.

**Der Aufräumer läuft beim Start und stündlich.** Er nimmt jede Zeile weg, die
eine Stunde ohne neuen Versuch steht; **eine laufende Sperre bleibt dabei
stehen.** Ohne ihn legte jede geratene Adresse eine Zeile an, und niemand
räumte sie ab.

---

## 4. BA 1 — Kein fremdes Formular kommt an eine schreibende Route

**Bis hierher schützte allein `SameSite=Lax`.** Das hält den einfachen Fall
auf: ein `POST` aus einem Formular auf einer fremden Seite reist ohne den
Sitzungscookie. **Ein `POST` aus einer Unterseite derselben Instanz reist
mit** — und einen schreibenden `GET` gibt es nicht.

**Der Wächter steht einmal vor allen Routen**, nicht an jeder einzeln. Er
verlangt an jeder schreibenden Anfrage eine Kopfzeile `x-csrf-token`.

**Acht Routen stehen namentlich in `CSRF_FREE`** — dieselben acht, die vor
`app.use('/api', auth.requireAuth)` stehen und den Token deshalb nicht haben
können: Einrichtung, Anmeldung, zweiter Schritt, Abmeldung, die beiden
Tokenwege und die beiden Wege der Selbstanmeldung. **Die Liste ist in beide
Richtungen geschlossen:** eine Ausnahme für eine Route hinter der Anmeldung
färbt den Lauf rot, und eine offene Route, die nicht daraufsteht, ebenso.

**Der Token ist aus dem Sitzungstoken abgeleitet** — `sha256('csrf:' + token)`
— und reist als zweiter Cookie ohne `HttpOnly`. Daraus folgt dreierlei:

- Er braucht **keine eigene Zeile** in der Datenbank und übersteht jeden
  Neustart, genau wie die Sitzung selbst.
- Wer ihn hat, hat daraus **nicht** den Sitzungstoken: SHA-256 läuft nur in
  eine Richtung.
- Wer einen Cookie setzen kann, gewinnt nichts: **verglichen wird die
  Kopfzeile mit dem abgeleiteten Wert**, nicht mit dem Cookie daneben.

**Der Sitzungscookie bleibt `HttpOnly`.** Nur der Token ist lesbar, und nur
dafür ist er da.

**Ohne Sitzung entscheidet die Anmeldung und nicht der Wächter.** Eine
schreibende Anfrage ohne Cookie bekommt weiter **401** und nicht **403**: ein
fremdes Formular ohne Cookie kommt an keine Zeile heran, und 403 verschöbe nur
die Auskunft.

---

## 5. BA 3 — Jede Einsetzung geht geführt in das Markup

**Nach der Tafel aus BA 0, Stelle für Stelle.** Was dabei herauskam, steht
oben; hier steht, was den Stand hält.

**Ein Wächter liest `public/app.js`.** Er nimmt jede Zuweisung an `innerHTML`,
zerlegt ihren Ausdruck bis in die verschachtelten Vorlagen und verlangt für
jede Einsetzung eine von sechs Formen: `esc()`, `tH()`, `tMark()`, `tMarks()`,
`Number()` oder eine Symbolkonstante in Großbuchstaben.

**Dazu eine benannte Ausnahmeliste mit 27 Einträgen** — zwölf Helfer, die
fertiges Markup liefern und es selbst maskieren (`BRAND_LINE`, `MARK`,
`subhead`, `sparkline`, `serverBox`, `countCell`, `many`, `inventoryText`,
`tileNumber`, `entryNav`, `linkOrigin`, `deliveryRow`), und fünfzehn Träger,
die einige Zeilen über ihrer Verwendung gebaut werden. **Sie ist in beide
Richtungen geschlossen:** ein Name, der nirgends mehr vorkommt, färbt den Lauf
rot.

**Fünf Träger sind umbenannt**, weil ihr Name auch anderswo in der Datei für
etwas anderes steht: `groups` → `groupRows`, zweimal `status` → `stateBox`,
`change` → `changeBox`, `list` → `listBox`, `outdated` → `outdatedBox`,
`tooBig` → `tooBigBox`. Eine Ausnahmeliste, die `status` global freigäbe, wäre
keine.

**Zwei Ausdrücke haben einen Namen bekommen:** die Marken der Kachel
(`badgeRow`) und das Markup der Systemkarten (`cardMarkup`). **Und einer eine
Funktion:** die Sprungleiste am Fuß des Eintrags stand als Ausdruck mitten im
Markup und heißt jetzt `entryNav()`.

**Mitgefallen:** der Zoomwert des Ausschnitts wurde zweimal gerechnet — einmal
roh für den Schieber, einmal gerundet für die Beschriftung daneben. Jetzt wird
er einmal gerechnet und zweimal gesetzt.

---

## 6. BA 4 — `npm audit` färbt den Lauf

**Der Schritt „Bekannte Lücken" lief auf der Werkbank und nirgends sonst.** Wer
örtlich prüft, sah eine neue Meldung erst nach dem Push.

**Die Gruppe ruft `npm audit --json`** und wird rot, sobald etwas darin steht.
Gelesen wird `metadata.vulnerabilities` und die Liste der betroffenen Pakete;
eine zweite Prüfung sieht nach, dass die Auskunft ihre fünf Stufen wirklich
nennt — eine leere Tafel machte die erste Zeile sonst wahr, ohne etwas zu
belegen.

**Ohne Netz wird sie übersprungen und sagt es.** Ein Prüfstand, der ohne Netz
rot wird, ist keiner; einer, der still ausfällt, belegt nichts. Die Zeile
nennt den Grund, den `npm` gegeben hat.

*Gemessen am 19. September 2026: `npm audit` meldet **0 Lücken**.*

---

## 7. Der Prüfstand

**24 neue Prüfungen in vier neuen Gruppen:**

- **„Kein fremdes Formular kommt an eine schreibende Route"** *(roundtrip)* —
  sie fragt **65 der 73 schreibenden Routen einzeln an der laufenden Instanz**
  an, ohne Kopfzeile und mit Sitzung, und verlangt von jeder **403**. Dazu die
  Gegenrichtung mit Token, eine offene Route ohne Token und die Gestalt der
  beiden Cookies.
- **„Erstanmeldung: die Sperre überlebt den Neustart"** *(firstlogin)* — sie
  sperrt, legt eine zwei Stunden alte Zeile daneben, startet den Server neu
  und sieht nach: die Sperre gilt, die alte Zeile ist weg.
- **„Keine nackte Einsetzung in innerHTML"** *(source)* — der Wächter aus
  BA 3, samt Gegenprobe auf sich selbst.
- **„Bekannte Lücken in den Abhängigkeiten"** *(selfcheck)* — BA 4.

**Dazu drei Prüfungen über die Ausnahmeliste des Wächters** in der Gruppe „Der
Wächter über den Quelltext": acht offene Routen, jede in der Liste, und keine
Liste ohne Route.

**`F_ROUTES` ist nach `test/frame.js` gezogen.** Die Liste war in
`test/source.js` zu Hause; seit dieser Runde liest sie ein zweiter Wächter —
der über die laufende Instanz —, und zwei Listen an zwei Orten liefen
auseinander.

**Der Prüfrahmen behält jetzt beide Cookies.** Er nahm bis hierher die erste
Zeile jeder Antwort (`set-cookie`) und hätte den Sitzungscookie beim nächsten
Schritt mit dem Token überschrieben. Dazu ein Ableger `csrfFor()`, mit dem die
Prüflagen, die ihren Cookie selbst bauen, die Kopfzeile bekommen.

**Neun Rückbauten** *(1118 bis 1126)*, **0 stumm** — jeder rot in genau der
Gruppe, die sein Eintrag nennt. **Fünf ältere Rückbauten sind nachgezogen**:
ihre Suchtexte standen an Zeilen, die diese Runde anfasst.

---

## 8. Was nicht gebaut ist

| | was | warum |
|---|---|---|
| **V1** | `express` 5 | Punkt 21 ist ohne den Sprung erledigt; ein Hauptversionssprung ohne Anlass ist Arbeit ohne Ertrag |
| **V2** | Alle 172 `innerHTML`-Stellen auf `textContent` bringen | 57 tragen keine Einsetzung und 62 waren geführt; wer sie anfasst, ändert 119 Stellen ohne Befund |
| **V3** | Die Kommentare verdichten | eigene Runde, und sie fasst dieselben zwei Dateien an |
| **V4** | Eine zweite Sicherheitsdurchsicht | sie gehört hinter die Runde, nicht hinein (F6) |

**Eine Stelle hat keine Gegenprobe im üblichen Sinn:** die Zusage von BA 4
lautet „eine gemeldete Lücke färbt den Lauf rot", und keine Änderung im
Repository kann `npm` dazu bringen, eine zu melden. Der Rückbau **1126** setzt
deshalb die gelesene Tafel auf eine gemeldete Lücke und belegt damit, dass die
Gruppe wirklich an ihr hängt und nicht aus Versehen grün ist.
