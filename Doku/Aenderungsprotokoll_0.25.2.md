# Änderungsprotokoll 0.25.2 — „Ein Leser, der anders liest"

**Zwei Befunde an einer türkischen Oberfläche · 10. September 2026 · gebaut auf
0.25.1 (`ba7495f2`).**

> **FINGERPRINT DIESER RUNDE: `d1c126ff`** —
> gerechnet am gebauten Stand, **vor dem Einspielen**. *Er steht hier, damit
> die Installation sich daran messen lässt: Einstellungen → Datenbank →
> Kennzahlen.*

**0.25.1 hat die Karte in Ordnung gebracht — für einen Leser, der dieselbe
Sprache liest, in der der Bestand angelegt ist.** Der Betreiber hat Kriterion
danach auf **Türkisch** gestellt, und damit fiel etwas auf, das seit **0.24.5**
im Quelltext stand und in keiner einzigen Prüflage vorkam.

> **DER BETREIBER IM WORTLAUT, 10. September 2026:**
>
> *„wenn man kriterion auf deutsch oder englisch gestellt hat scheint alles
> soweit ok zu sein. aber wenn kriterion selber auf türkisch steht, dann wird
> unwahrheit angezeigt. obwohl deutsch vorhanden ist, und auch der punkt in der
> pille das so anzeigt, wird unten behauptet das keine eintrag vorhanden wäre."*
>
> *„und bei den 3 kacheln laufen die sprachumschalter der pilen syncron mit aber
> der von vokabular nicht. bitte alle syncronisieren."*

---

## Die Versionsnummer

**0.25.2 ist ein PATCH.** Zwei Reparaturen, keine Spalte, kein Weg, keine
Funktion. `F_ROUTES` bleibt bei **72**.

---

## Befund A · Der Stempel des Servers reiste mit

**Die Stelle:** `public/app.js`, `namesFrom()`, eine Zeile.

```js
if (hit.from === code) return { ...z, name: hit.name };
```

`z` ist die Zeile, **wie sie hereinkam** — und der Server stempelt sie für die
Sprache des **Lesers** (`named()`, `nameFallback`). Die Karte setzt den Namen
aus der Tafel der **Pille** ein und lässt den alten Stempel im Spread stehen.

**Am Bildschirm sah das so aus:** Oberfläche türkisch, Pille auf „Deutsch".

| | |
|---|---|
| **Die Pille** | `Deutsch ●` — die Tafel sagt: für Deutsch fehlt nichts |
| **Die Zeile darunter** | *„(Deutsch için kayıt yok — Deutsch görünüyor)"* |

**Dieselbe Sprache in beiden Hälften des Satzes** — weil der Satz mit der
Sprache der **Pille** beschriftet wird und der Stempel aus der Sprache des
**Lesers** stammte. *Der Betreiber hat den Widerspruch gesehen, nicht die
Ursache — und der Widerspruch war die Ursache.*

> **WARUM ES BEI DEUTSCH UND ENGLISCH NICHT AUFFIEL.** Ein deutscher Leser
> bekommt an einer deutschen Zeile **gar keinen Stempel** — der Server stempelt
> nur, was für ihn zurückfällt. **Ohne Stempel gibt es nichts, was mitreisen
> könnte.** Der Fehler stand seit 0.24.5 da und brauchte eine dritte Sprache,
> um sichtbar zu werden.

**Es hing noch etwas daran:** das Zeichen zum Räumen (`✕`) fragt dieselbe Zeile
ab (`entry.nameFallback === undefined`). **Wo der Stempel mitreiste, fehlte
das ✕** — an genau den Zeilen, an denen es hingehört. *Das hat niemand
gemeldet; es ist beim Nachprüfen aufgefallen.*

**Die Reparatur ist ein Wort:**

```js
if (hit.from === code) return { ...z, name: hit.name, nameFallback: undefined };
```

## Befund B · Zwei Angaben über dieselbe Frage

**Die Stelle:** `public/app.js`, `NAMES_SHOWN` und `VOCABULARY_SHOWN`.

Der Abschnitt „Bestand" hatte **zwei** Zustandsvariablen für **eine** Frage —
*welche Sprache zeigt dieser Abschnitt gerade?* `NAMES_SHOWN` für die drei
Namenskarten, `VOCABULARY_SHOWN` für das Vokabular, **jede mit eigener Klemme
gegen den Vorrat und eigenem Rückfall auf die Sprache des Lesers, Zeile für
Zeile dieselben.**

**Zwei Antworten auf eine Frage laufen auseinander, sobald man EINE umstellt** —
und genau das tat der Betreiber. *Das ist Stolperstein 47, und er hat diese
Reihe damit zum vierten Mal gekostet.*

**`vocabularyLanguage()` ist weggefallen** und durch `namesLanguage()` ersetzt —
**nicht umbenannt, sondern entfernt:** ein zweiter Name für dieselbe Auskunft
ist der halbe Weg zurück zur zweiten Wahrheit. *Die Klemme gegen den Vorrat
(0.24.4) und der Rückfall auf die Lesersprache stehen unverändert in
`namesLanguage()`.*

**Alle vier Umschalter laufen jetzt gemeinsam, in beide Richtungen.**

---

## Was wegfällt — namentlich

| Was | Warum |
|---|---|
| **`let VOCABULARY_SHOWN`** | zweite Angabe über dieselbe Frage *(Befund B)* |
| **`const vocabularyLanguage()`** | zweiter Name für `namesLanguage()` — entfernt statt umbenannt |

**Keine Zusage des Prüfstands fällt weg**, keine ändert ihren Sollwert.

---

## Der Prüfstand

**`npm test` grün: 6343 Zusagen** *(0.25.1: 6332)*.

### Die neue Gruppe: „Ein Leser, der anders liest — 0.25.2"

**Es fehlte kein Wächter, es fehlte eine LAGE.** In **jeder** Prüflage dieses
Prüfstands las der Leser dieselbe Sprache, in der die Zeilen angelegt sind —
und dann stempelt der Server gar nicht. *Der Nachbau antwortet sehr wohl wie der
echte Server (`withNames` stempelt); niemand hat ihn je in die Lage gebracht, in
der es darauf ankommt.*

**Die neue Prüflage stellt sie her:** der Leser liest **Türkisch**, die drei
Zeilen sind **deutsch** angelegt, eine trägt zusätzlich Englisch, eine alle
drei. Damit stempelt der Server zwei von dreien — und die dritte ist der Maßstab.

**Und der Gleichlauf wird in BEIDE Richtungen geprüft:** eine Angabe, die nur
einer Seite folgt, wäre wieder zwei.

---

## Die Gegenproben

**Drei neue, 788 bis 790.** *Die Liste steht bei 781.*

| # | Rückbau | trifft |
|---|---|---|
| **788** | Der Stempel des Servers reist wieder mit | Befund A — **4 rot** |
| **789** | Die zweite Angabe steht wieder im Quelltext | Befund B, der Wächter über den Quelltext — **1 rot** |
| **790** | Der Vokabelumschalter liest wieder seine eigene Angabe | Befund B, der Gleichlauf — **4 rot** |

**Alle drei gefahren, kein STUMM.** *789 und 790 ein zweites Mal, nachdem der
erste Durchgang die beiden Funde unten gebracht hatte.*

### Der erste Durchgang hat zwei Dinge gefunden, und beide waren meine

> **789 HAT DEN LAUF ABGERISSEN.** *Der erste Entwurf zielte auf die
> Klickweiche und ließ den Vokabelumschalter ins Leere schreiben.* Der Lauf
> starb mit „Cannot convert undefined or null to object": **ältere Gruppen
> schalten die Kachel um und rechnen danach mit dem, was dort steht** — ohne
> Umschalten greifen sie ins Leere. *Ein Rückbau, der den Lauf niederreißt,
> belegt nichts — dieselbe Lage wie 760 in 0.25.0.*
>
> **UND ER WAR ÜBERFLÜSSIG.** Mit **einer** Angabe gibt es keine zwei
> Richtungen, die getrennt kaputtgehen könnten; 790 nimmt beide. *Er zielt
> seither auf die zweite Angabe selbst: sie wieder hinzuschreiben, auch wenn
> niemand sie liest — denn genau das ist der Anfang von Stolperstein 47 und
> nicht sein Ende.*

> **UND EINE ZUSAGE VON MIR WAR ZU SCHWACH.** Die erste Gleichlaufprobe
> schaltete auf **Türkçe** — die Sprache des Lesers, und damit genau die, auf
> die jede kaputte Pillenreihe ohnehin zurückfällt. *Sie war von „läuft mit"
> nicht zu unterscheiden.* **Der gefahrene Rückbau 790 hat es gezeigt:** er
> machte nur die Gegenrichtung rot. **Sie schaltet jetzt auf Deutsch.**
>
> *Beides hat kein Mensch gemeldet und keine Prüfung gefunden — es hat der
> gefahrene Rückbau gefunden. Dafür wird er gefahren.*

---

## Was ausdrücklich NICHT gebaut wird

**Die Sprachdurchsicht** *(Punkt 24 im Sammelblatt)* bleibt, wo sie ist: **sie
ist 0.31.0**, unmittelbar vor dem Bruch.

**Der Bruch rückt in dieser Runde ein viertes Mal — auf `0.33.0`,** und diesmal
auf Wunsch: *„Bruch mal auf die 0.33.0 legen.. ist auch ne schöne Zahl 🙂 wenn
das klappt."* **Es klappt.** Dabei entsteht **0.32.0**, und die bleibt
ausdrücklich **frei** — *ein Platz an einer Stelle, und zwar an der letzten, an
der ein MINOR noch etwas ändern darf, bevor die Struktur feststeht.* **Keine
Rückkehr zur alten Regel der freien Zwischenräume.**

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.25.2.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_25_2.md` | `git mv`, **Revision 75** |
| `Doku/Fahrplan.md` | der Bruch auf 0.33.0, **0.32.0 frei** |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
