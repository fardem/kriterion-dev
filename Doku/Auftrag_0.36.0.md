# Auftrag 0.36.0 — „Sicherheit"

Geschrieben am 19. September 2026. **GEBAUT am 19. September 2026** —
Änderungsprotokoll 0.36.0.

> **WAS BEIM BAUEN ANDERS GEMESSEN WURDE ALS HIER GEPLANT.** *Die 59 Stellen
> aus Abschnitt 2 sind eine Obergrenze und wurden als solche genannt. BA 0 hat
> sie gelesen:* **53 Zuweisungen mit zusammen 104 ungeführten Einsetzungen**,
> und nicht eine davon trug Benutzertext. *Die Messung liest verschachtelte
> Vorlagen und Fallunterscheidungen mit, die buchstäbliche Zählung nicht.*
> **Die Ausnahmeliste aus BA 3 hat 27 Einträge.**

> **DIE FRAGETAFEL IST BEANTWORTET** — vom Betreiber am 19. September 2026, vor
> dem Bauen. **Diese Runde ist ohne Rückfrage zu fahren.** Die Antworten stehen
> in Abschnitt 5 und sind in die Bauabschnitte eingearbeitet.

> **DAS SCHEMA DARF SICH ÄNDERN.** *Klarstellung des Betreibers vom
> 19. September 2026:* **Kriterion ist nicht veröffentlicht.** Es muss keine
> Verträglichkeit mit früheren Fassungen hergestellt werden, und der Satz „ab
> 0.33.0 wird nicht migriert" ist keine Fessel für das Schema — er sagt nur,
> dass keine Migrationsblöcke mehr geschrieben werden. **Gebaut wird, was die
> Sicherheit verlangt.**

**Die Durchsicht vom 15. September 2026 hat fünf Lücken genannt. Eine davon ist
seither von selbst weggefallen, eine gehört nicht mehr hierher. Drei bleiben.**

> **DIE ZAHLEN DER DURCHSICHT SIND NACHGEMESSEN WORDEN**, am 19. September 2026
> auf dem Stand 0.35.2. *Zwischen der Durchsicht und heute liegen 0.35.0,
> 0.35.1 und 0.35.2; die Zahlen von damals gelten nicht mehr.*

---

## 1. Was aus den fünf geworden ist

| | Lücke der Durchsicht | Stand am 19. September 2026 |
|---|---|---|
| **1** | **Kein CSRF-Token** | **offen.** `grep -ri csrf` über `server.js`, `auth.js`, `public/app.js`: **0 Fundstellen**. Der Sitzungscookie trägt `SameSite=Lax` |
| **2** | **Die Anmeldesperre übersteht keinen Neustart** | **offen.** `auth.js`:438 — `const attempts = new Map()`. Der Inhalt liegt im Arbeitsspeicher und ist nach einem Neustart fort |
| **3** | **199 `innerHTML`-Stellen ungeprüft** | **offen, aber kleiner.** Gemessen sind **178 Vorkommen**, davon 172 Zuweisungen. **Die Zahl 199 gilt nicht mehr** |
| **4** | **Abhängigkeiten ohne Automatik** | **erledigt, ohne Zutun.** `npm audit` meldet **0 Lücken**. `express@4.22.3` lässt `qs@6.16.0` zu, und das ist die reparierte Fassung |
| **5** | *fünf Befunde der Messung zu 0.35.0* | **nicht mehr hier.** Zwei mit 0.34.4 behoben, drei als 0.35.1 gebaut |

**Punkt 21 des Sammelblatts ist damit zu.** Er verlangte `express` 5 — einen
Hauptversionssprung mit geänderter Routen- und Fehlerbehandlung — um zwei
Meldungen mittlerer Schwere in `qs` loszuwerden. Der Sprung ist nicht mehr
nötig; ein Patch innerhalb des schon deklarierten Bereichs hat es getan.

> **DAS HEISST NICHT, DASS DER PUNKT „ABHÄNGIGKEITEN" ERLEDIGT IST.** *Er war
> heute grün, weil jemand anderes etwas repariert hat.* **Was fehlt, ist die
> Automatik** — eine Stelle, die den Lauf rot färbt, wenn `npm audit` etwas
> meldet. **Das ist BA 4.**

---

## 2. Die Zahlen

| | heute | nachher |
|---|---:|---:|
| Schreibende Routen ohne CSRF-Schutz | 73 von 73 | **0 von 73** |
| Anmeldeversuche, die ein Neustart vergisst | alle | **keine** |
| `innerHTML`-Zuweisungen mit mindestens einer nackten Einsetzung | **59** | *zu messen, siehe BA 0* |
| Stellen, an denen `npm audit` den Lauf rot färbt | 0 | **1** |

**Die 59 sind eine Obergrenze und keine Befundzahl.** *Gemessen wurde
buchstäblich: eine Zuweisung an `innerHTML`, in deren Ausdruck mindestens eine
Einsetzung `${…}` steht, die nicht durch `esc()`, `tH()`, `tMark()` oder eine
Symbolkonstante geht.* **Ein guter Teil davon sind Helfer mit festem Markup**
— `BRAND_LINE()` allein stellt acht. **Wie viele davon wirklich einen Wert von
außen tragen, sagt erst BA 0.**

*Die übrigen 113 Zuweisungen sind unbedenklich: 56 tragen gar keine Einsetzung,
57 führen jede einzelne durch `esc()` oder `tH()`.*

---

## 3. Bauabschnitte

### BA 0 — Messen, bevor gebaut wird

**Die Durchsicht vom 15. September 2026 hat gezählt, nicht gelesen.** Aus 199
sind 178 geworden, und von den 178 tragen 113 nachweislich nichts von außen.

**Zu messen ist für jede der 59 Stellen:** woher der Wert kommt. *Ein
Titel aus der Datenbank ist etwas anderes als ein Symbol aus einer Konstanten,
und beide stehen heute in derselben Zahl.*

**Das Ergebnis ist eine Tafel**, keine Zahl: je Stelle die Zeile, die Quelle
des Werts und die Entscheidung — `esc()` davor, Helfer mit festem Markup, oder
`textContent` statt `innerHTML`.

> **OHNE DIESE TAFEL IST BA 3 NICHT ZU FAHREN.** *Wer 59 Stellen blind mit
> `esc()` umwickelt, bricht jede, die absichtlich Markup trägt.*

### BA 1 — CSRF

**Heute schützt allein `SameSite=Lax`.** Das hält den einfachen Fall auf und
lässt zwei Wege offen: einen `GET`, der schreibt, gibt es nicht — aber ein
`POST` aus einem Formular auf einer fremden Seite reist bei `Lax` nicht mit,
ein `POST` aus einer Unterseite derselben Instanz schon.

**Der Weg:** ein Token je Sitzung, das der Browser aus einer Antwort bekommt
und an jeder schreibenden Anfrage mitschickt. **73 schreibende Routen** stehen
in `F_ROUTES`; die Liste ist geschlossen und geprüft, also ist auch die Menge
der Stellen geschlossen.

**Der Wächter steht einmal vor allen Routen** *(F1)* — weniger Code, und er
vergisst keine. **Dazu eine benannte Ausnahmeliste** für die offenen Routen
*(Anmeldung, Selbstanmeldung, Token einlösen, Bestätigung)*, in beide
Richtungen geschlossen wie die Liste des Routenwächters aus 0.35.2: eine
Ausnahme für eine Route, die längst geschützt ist, färbt den Lauf rot.

**Das Token reist als zweiter Cookie ohne `HttpOnly`** *(F2)*. Das Skript liest
ihn und schickt ihn als Kopfzeile mit; **der Sitzungscookie bleibt
`HttpOnly`**.

### BA 2 — Die Anmeldesperre übersteht einen Neustart

`auth.js`:438 hält die Versuche in einer `Map` im Arbeitsspeicher. **Ein
Neustart setzt jeden Zähler auf null** — wer eine Sperre abwarten müsste,
braucht nur zu warten, bis der Container einmal neu anläuft.

**Der Weg ist eine eigene Tabelle** *(F3)*. Eine Sperre gilt auch einer IP
ohne Zugang, und die passt an `users` nicht heran.

> **DAS SCHEMA DARF SICH DABEI ÄNDERN** — siehe den Kasten oben. *Wenn die
> Sicherheit mehr verlangt als eine Tabelle, wird mehr gebaut; die
> Verträglichkeit mit früheren Fassungen ist keine Vorgabe.*

**Was dabei nicht passieren darf:** die Tabelle wächst unbegrenzt. *Jeder
gescheiterte Versuch legt eine Zeile an, und niemand räumt sie ab.* **Der
Aufräumer gehört in denselben Bauabschnitt und läuft beim Start und stündlich**
*(F4)* — dieselbe Bauform wie beim Papierkorb. *Der Start fängt, was ein
Absturz liegen gelassen hat; die Stunde hält die Tabelle im Betrieb klein.*

### BA 3 — Die Einsetzungen in `innerHTML`

**Nach der Tafel aus BA 0.** Je Stelle eine der drei Entscheidungen, und keine
davon pauschal.

**`textContent` ist der bessere Weg, wo es geht** — er braucht kein `esc()`
und kann gar nicht falsch benutzt werden.

**Und dazu ein Wächter:** eine Zuweisung an `innerHTML`, deren Einsetzung nicht
durch `esc()`, `tH()`, `tMark()` oder eine benannte Symbolkonstante geht, färbt
den Lauf rot. **Mit einer benannten Ausnahmeliste**, wie bei den Routen und den
Abfrageparametern.

### BA 4 — `npm audit` färbt den Lauf

**Heute meldet `npm audit` null Lücken, und niemand merkt es, wenn das
aufhört.** Der Schritt „Bekannte Lücken" läuft in der Werkbank auf GitHub, aber
nicht im Prüfstand.

**Der Weg:** eine Gruppe, die `npm audit --json` ruft und rot wird, sobald
etwas darin steht. **Ohne Netz wird sie übersprungen und sagt es** *(F5)* —
ein Prüfstand, der ohne Netz rot wird, ist kein Prüfstand. *Stumm ausfallen
darf sie nicht.*

### BA 5 — Papiere

Änderungsprotokoll 0.36.0, CHANGELOG-Eintrag **mit Kasten** *(ein CSRF-Token
ändert, was ein eigenes Skript an den Server schicken muss)*, Fahrplanzeile auf
GEBAUT, Projektstand, Sammelblatt: **Punkt 21 ist zu**.

---

## 4. Zusagen an den Prüfstand

1. **Jede der 73 schreibenden Routen weist eine Anfrage ohne gültiges Token
   ab.** Gemessen an der laufenden Instanz, Route für Route, nicht am
   Quelltext.
2. **Eine Anmeldesperre überlebt einen Neustart.** Der Prüfstand sperrt, startet
   neu und sieht nach.
3. **Die Tabelle der Versuche wächst nicht unbegrenzt.**
4. **Jede Entscheidung aus BA 0 steht namentlich im Protokoll** — 59 Stellen,
   59 Zeilen.
5. **Der Wächter über `innerHTML` fängt eine gestellte nackte Einsetzung.**
6. Gegenprobenlauf über alle neuen Rückbauten, **0 stumm**.
7. Der Fingerprint ändert sich — erwartet.

---

## 5. Fragetafel — beantwortet am 19. September 2026

**Alle sechs sind vom Betreiber entschieden, bevor die erste Zeile fällt. Es
bleibt nichts zu klären.**

| | Frage | Entscheidung |
|---|---|---|
| **F1** | Steht der CSRF-Wächter einmal vor allen Routen oder an jeder einzeln? | **einmal vor allen**, mit benannter Ausnahmeliste für die offenen Routen |
| **F2** | Wie kommt das Token in den Browser? | **als zweiter Cookie ohne `HttpOnly`**, den das Skript liest und als Kopfzeile mitschickt. Der Sitzungscookie bleibt `HttpOnly` |
| **F3** | Bekommt die Anmeldesperre eine eigene Tabelle oder eine Spalte an `users`? | **eigene Tabelle.** Eine Sperre gilt auch einer IP ohne Zugang. **Dazu die Klarstellung: das Schema darf sich ändern** — siehe den Kasten am Anfang |
| **F4** | Räumt der Aufräumer beim Start oder nach Zeit? | **beim Start und stündlich**, wie beim Papierkorb |
| **F5** | Wird `npm audit` ohne Netz übersprungen oder rot? | **übersprungen, und die Gruppe sagt es** |
| **F6** | Gehört die Sicherheitsdurchsicht noch einmal gemacht? | **nein.** Die drei Lücken sind am 19. September 2026 nachgemessen; eine neue Durchsicht gehört hinter die Runde |

---

## 6. Was verworfen wird

| | was | warum |
|---|---|---|
| **V1** | **`express` 5** | Punkt 21 ist ohne den Sprung erledigt. Ein Hauptversionssprung ohne Anlass ist Arbeit ohne Ertrag |
| **V2** | **Alle 178 `innerHTML`-Stellen auf `textContent` bringen** | 56 tragen keine Einsetzung und 57 sind geführt. Wer sie anfasst, ändert 113 Stellen ohne Befund |
| **V3** | **Die Kommentare verdichten** | eigene Runde, **0.37.0**. Sie fasst dieselben zwei Dateien an, und zwei Runden auf denselben 15.000 Zeilen kollidieren in jedem Diff |

---

## 7. Wie diese Runde gefahren wird

| Phase | Form |
|---|---|
| **BA 0** | zuerst und allein. Die Tafel der 59 Stellen ist das Ergebnis, kein Code |
| **BA 1 bis BA 4** | je ein Schreiber, je ein voller Lauf, je ein Commit |
| **BA 2 vor BA 1** | er ändert das Schema, und ein Schemafehler fällt besser allein auf |
| **Gegenproben** | `counterproof.js` über die neuen, **nie gleichzeitig mit dem Prüfstand** — die beiden nehmen sich sonst die Portnummern weg |
| **Vor dem Push** | `npm test` vollständig, das Ergebnis wird genannt |
