# Änderungsprotokoll 0.25.4 — „Ein Satz, den jede Sprache selbst schneidet"

**Drei harte Sprachfehler · 10. September 2026 · gebaut auf 0.25.3
(`a3c561d7`).**

> **FINGERPRINT DIESER RUNDE: `c56df7db`** —
> gerechnet am gebauten Stand, **vor dem Einspielen**.

> **DER BETREIBER IM WORTLAUT, 10. September 2026:** *„warum wurde das nicht
> einfach umgesetzt ‚Der türkische Verneinungssatz'?"*
>
> **Die Frage ist berechtigt, und die Antwort ist eine Selbstkorrektur:** der
> Befund lag in Punkt 24 zwischen lauter *Geschmacksfragen* — Sätze, über die
> der Betreiber entscheidet und nicht Claude. **Dieser eine ist keine.** Ein
> Satz, der das Gegenteil dessen sagt, was dastehen soll, ist ein Fehler und
> gehört repariert, nicht vorgelegt. *Er ist in der falschen Liste gelandet,
> und dieses Papier holt ihn heraus.*

---

## Die Versionsnummer

**0.25.4 ist ein PATCH.** Drei Reparaturen an Sätzen und an zwei Aufrufen.
Kein Weg, keine Spalte, keine Funktion, kein neuer Schlüssel für den Betrieb.
`F_ROUTES` bleibt bei **72**.

---

## Befund 1 — der türkische Verneinungssatz

**Der stärkste Fund der Sprachdurchsicht, und er kam nicht aus den Berichten.**
*Die drei Berichte, die der Betreiber eingeholt hat, nennen ihn nicht; er fiel
bei der Gegenprüfung auf.*

**Die Stelle:** `public/app.js`, `showConfirm()` und `showInvite()` —
zwei Aufrufe, vier Schlüssel.

```js
${tH('login.yourLinkAffected')} <strong>${tH('login.not')}</strong> ${tH('login.stillValid')}
```

| | zusammengesetzt ergab das |
|---|---|
| **Deutsch** | *„Dein Link ist davon **nicht** betroffen — er gilt weiter."* ✓ |
| **English** | *„Your link is **not** affected — it remains valid."* ✓ |
| **Türkçe** | *„Bağlantın bundan **değil** etkilendi."* ✗ |

**Türkisch verneint mit einer Endung IM VERB** und nicht mit einem eigenen
Wörtchen davor. *`etkilendi` heißt „wurde betroffen"; `değil` davorgestellt
ergibt keine Verneinung, sondern Kauderwelsch.* **Der Satz sagte dem türkischen
Leser das Gegenteil dessen, was dastehen sollte** — sein Link sei betroffen,
also hinfällig — **und stand so seit 0.24.3 im Programm.**

### Die Reparatur — die Sprache schneidet selbst

**Jede Sprache trägt jetzt EINEN ganzen Satz mit EINEM Platzhalter**, und sie
entscheidet selbst, **wo** das hervorgehobene Stück sitzt und **was** es ist.

| | Satz | hervorgehobenes Stück |
|---|---|---|
| **Deutsch** | *„Dein Link ist davon {word} betroffen — er gilt weiter."* | **nicht** *(ein Wörtchen)* |
| **English** | *„Your link is {word} affected — it remains valid."* | **not** *(ein Wörtchen)* |
| **Türkçe** | *„Bağlantın bundan {word} — geçerliliğini korur."* | **etkilenmez** *(das ganze Verb)* |

```js
const tMark = (key, wordKey) => tH(key, { word: STEUERZEICHEN })
  .replace(STEUERZEICHEN, `<strong>${tH(wordKey)}</strong>`);
```

**Der Satz wird nicht maskiert, das eingesetzte Stück schon** — dieselbe
Teilung wie in `tH()`. *Der Umweg über das Steuerzeichen sorgt dafür, dass die
Auszeichnung nie durch einen maskierenden Weg läuft; wer hier einen Wert vom
Benutzer einsetzen wollte, müsste diese Zeile ändern, und dann fällt es auf.*

> **VIER SCHLÜSSEL FALLEN NAMENTLICH:** `login.yourLinkAffected`,
> `login.not`, `login.stillValid`, `login.stillValidRetry`. **Drei kommen:**
> `login.linkUnaffected`, `login.linkUnaffectedRetry`,
> `login.linkUnaffectedWord`. *Unterm Strich einer weniger: 1224 → 1223.*

---

## Befund 2 — das Anführungszeichen, das nie geschlossen wurde

**Die Stelle:** `entry.tagQuote`, in **allen drei** Sprachdateien.

| | vorher | jetzt |
|---|---|---|
| **Deutsch** | `Tag „{name}` | `Tag „{name}“` |
| **English** | `Tag “{name}` | `Tag “{name}”` |
| **Türkçe** | `Etiket „{name}` | `Etiket „{name}“` |

**Der Wert geht unverändert in ein `title`.** Am Bildschirm stand *„Tag
„Werkzeug"* — auf, aber nie zu. *Kein Bericht hat es genannt; es fiel beim
Durchzählen der Anführungszeichen auf.*

---

## Befund 3 — „in 1 Tagen" und „noch 1 Minuten"

**Zwei Sätze mit einer Zahl, und keiner von beiden hatte eine Einzahlform.**

| Schlüssel | stand da | jetzt |
|---|---|---|
| `card.inDays` | `"{days} Tagen"` | `{ one: "{n} Tag", other: "{n} Tagen" }` |
| `login.linkValidMinutes` | `"Der Link gilt noch {minutes} Minuten"` | `{ one: "… {n} Minute", other: "… {n} Minuten" }` |

**Die Reparatur hat ZWEI Hälften, und das ist der eigentliche Punkt.** Die Form
wählt `PLURAL.select(values.n)` — **und nur über `n`**. *Beide Sätze reichten
`{days}` beziehungsweise `{minutes}`; damit kam immer `select(undefined)`
heraus, und das ist die Mehrzahl.* **Zwei Formen in der Datei nützen nichts,
wenn die Stelle den Zählwert unter einem fremden Namen reicht** — deshalb sind
auch die beiden Aufrufe geändert:

```js
tH('card.inDays', { n: log.days })
tH('login.linkValidMinutes', { n: status.minutes })
```

> **IM TÜRKISCHEN SIND BEIDE FORMEN GLEICH, und das ist keine
> Nachlässigkeit.** *Nach einer Zahl bleibt dort das Substantiv im Singular —
> die Entscheidung des Betreibers vom 8. September 2026 (Punkt 19, TR-S4).*
> Der Prüfstand hält beides fest: im Deutschen **müssen** sich die zwei Formen
> unterscheiden, im Türkischen **müssen** sie gleich sein.

---

## Was ausdrücklich NICHT gebaut wurde

**Die Sprachdurchsicht hat mehr gemeldet.** *Was davon eine Geschmacksfrage
ist, entscheidet der Betreiber — und das steht als Punkt 24 in
`Doku/Fehler_und_Ideen.md` und als Runde **0.31.0** im Fahrplan.*

| | warum es hier nicht steht |
|---|---|
| **Zwei Diagnosen der Berichte** | *sie sind nachweislich falsch* — `login.stillValid` war im Deutschen und Englischen richtig, weil `login.not` **zwischen** die Hälften kam; und die türkischen `vocabulary.*Many` sind die Entscheidung des Betreibers vom 8. September |
| **Der Ton der Hausstimme** | Anrede, Länge, Ausrufezeichen — **Geschmack**, und Geschmack gehört dem Betreiber |
| **Die drei mitgelieferten Kriterien** | *Punkt 23* — sie stehen auf Deutsch, die Auslieferungssprache ist Englisch. **Eine kleine Runde und keine Zeile**, und sie gehört nicht in einen PATCH |

---

## Der Prüfstand

**`npm test` grün: 6358 Zusagen** *(0.25.3: 6348)*.

### Die neue Gruppe: „Ein Satz, den jede Sprache selbst schneidet — 0.25.4"

**Neun Zusagen**, und sie prüfen die **Regel**, nicht den Wortlaut:

| | |
|---|---|
| **1** | jede Sprache trägt **einen** Satz mit **genau einem** Platzhalter — zwei wären wieder eine Zusammensetzung |
| **2** | das hervorgehobene Stück steht in jeder Sprache da und ist nicht leer |
| **3** | **im Türkischen ist es das VERB** — `etkilenmez`, und `değil` steht in keinem der beiden Sätze |
| **4** | der Ruf, der drei Stücke zusammensetzte, ist weg — und `tMark()` steht an **genau zwei** Stellen |
| **5** | das Anführungszeichen wird in **jeder** Sprache geschlossen — gezählt, nicht verglichen |
| **6** | beide Zählsätze tragen zwei Formen, und beide tragen `{n}` |
| **7** | im Deutschen unterscheiden sich die Formen **wirklich** |
| **8** | im Türkischen sind sie **gleich** — nach einer Zahl bleibt der Singular |
| **9** | **beide Aufrufstellen reichen den Zählwert unter dem Namen `n`** — die andere Hälfte derselben Reparatur |

> **ZUSAGE 4 HAT EINEN EIGENEN FEHLER GEHABT.** Der erste Entwurf suchte
> `tMark(` ohne Wortgrenze und fand **vier** Stellen: `weightMark(` trägt
> dieselbe Zeichenfolge mitten im Namen. *Eine Zahl, die von einer fremden
> Funktion mit abhängt, sagt nichts über die eigene* — gesucht wird jetzt an
> der Wortgrenze.

> **ZUSAGE 9 STEHT HIER UND NICHT NUR BEIM ALLGEMEINEN
> PLATZHALTERWÄCHTER.** *Der hätte den Rückbau auch gefunden — aber unter
> fremdem Namen.* **Der Befund ist diese Runde; wer ihn zurückbaut, soll unter
> seinem Namen auffallen.**

### Und die Sprachwächter haben mitgerechnet

**Der Wortlautwächter trägt die Änderung namentlich:** vier Schlüssel gehen,
drei kommen, einer ändert seinen Wortlaut (`entry.tagQuote`), zwei werden zu
Mehrzahlpaaren. *Die Zahlen dahinter — 1303 Sätze, 80 Mehrzahlformen, 14
Vokabelnamen — sind mitgezogen. Ein Wächter, der eine Änderung nur duldet,
statt sie zu nennen, ist keiner.*

---

## Die Gegenproben

**Drei neue: 792 bis 794.** *Die Liste steht bei **785**.*

| # | Rückbau | trifft |
|---|---|---|
| **792** | Das türkische Stück ist wieder ein Wörtchen statt eines Verbs | Befund 1 |
| **793** | Das Anführungszeichen am Tagzeichen bleibt wieder offen | Befund 2 |
| **794** | Der Zählwert reist wieder unter einem fremden Namen | Befund 3, **zweite Hälfte** |

**ZWEI VON DREI GREIFEN AN EINER SPRACHDATEI und nicht am Quelltext**, und das
ist hier richtig: *dort saß der Fehler.* **Ein Rückbau, der nur Programmzeilen
kennt, kann einen Sprachfehler nicht stellen.**

**794 lässt die Sprachdatei heil**, und das ist sein Sinn: die zwei Formen
stehen weiter drin und sehen richtig aus — *nur wählt sie niemand mehr.* **Ein
Rückbau, der die sichtbare Hälfte in Ruhe lässt und die unsichtbare nimmt,
prüft den Wächter und nicht das Auge.**

**793 greift an EINER Datei, obwohl alle drei betroffen waren.** *Der Wächter
sieht jede Datei einzeln an, und eine offene reicht.* Wer den Rückbau
überlebt, hat einen Wächter, der nur die Mehrheit fragt.

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.25.4.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_25_4.md` | `git mv`, **Revision 77** |
| `Doku/Fehler_und_Ideen.md` | **Punkt 22 entschieden** *(„das funktioniert" — der Rahmen bleibt, wie bestellt)*; Punkt 24 verweist auf 0.31.0 |
| `Doku/Auftrag_0.26.0.md` | **neu** — die nächste Runde |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |

**Der Fahrplan bleibt unangetastet** — ein PATCH schiebt keine Nummer.
