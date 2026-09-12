# Änderungsprotokoll 0.30.3 — „Die zugeklappte Tagzeile füllt, was sie ohnehin kostet"

**Ein Befund aus dem Rundlauf mit 0.30.2 · 12. September 2026 · gebaut auf
0.30.2.**

> **FINGERPRINT DIESER RUNDE: `PLATZHALTER`** — gerechnet am gebauten Stand,
> **als letztes und hinter der letzten Zeile**.
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(achtzehn Dateien)* | **`PLATZHALTER`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`PLATZHALTER`** |
> | **Aus der laufenden Installation gemeldet** | *steht aus — trägt der Betreiber nach* |
>
> **AM WIRT LÄUFT 0.30.2** — *der Betreiber hat sie eingespielt und am selben
> Tag mit drei Bildern hingesehen. Der Befund dieser Runde ist das, was er dort
> gesehen hat.*

---

## Der Befund

**DIE ZUGEKLAPPTE TAGZEILE LIESS AM TELEFON FÜNFUNDDREISSIG PIXEL LEER.**

> **Der Betreiber, 12. September 2026, mit drei Bildern:** *„Aufgeklappt sieht es
> gut aus. Da zeigt den richtigen Weg aber zugeklappt sieht es wie da ist was
> falsch gelaufen aus. Was wären deine alternativ vorschlagen? Eine zweite Reihe
> von Tags?"*

**DIE HÖHE KOMMT NICHT VON DER WOLKE, SONDERN VON SPALTE 1.** *Seit 0.30.2
stehen die beiden Zeichen unter der Beschriftung; die Spalte trägt damit zwei
Rasterzeilen:*

```
Beschriftung   18 px
Rasterabstand   7 px
die Zeichen    30 px
Rasterabstand   7 px
               ——————
               62 px
```

**DIE WOLKE DANEBEN WAR AUF EINE REIHE BEGRENZT — 27 PIXEL.** *Die restlichen
fünfunddreißig standen rechts neben dem Haken, und weil dort sonst nichts ist,
las sich das Loch wie ein Fehler.*

**GEMESSEN AM 12. SEPTEMBER 2026** *(echtes Chromium, 390 × 844,
`deviceScaleFactor: 3`, `isMobile: true`, dreißig Tags, alle drei Sprachen —
zugeklappt, vier Fassungen gegeneinander)*:

| Fassung | Zeile | leer | sichtbare Tags | Wolke breit |
|---|---|---|---|---|
| **IST (0.30.2)** | 62 | **35** | 4 | 311 |
| **A — zwei Wolkenreihen** | **62** | **2** | **7** | 311 |
| **B — Zeichen neben die Beschriftung** | 44 | 17 | 4 | 275 |
| **B2 — beides zusammen** | 60 | 0 | 6 | 275 |

> **A KOSTET NICHTS, UND DAS IST KEIN SCHÄTZWERT:** *zwei Wolkenreihen messen
> 27 + 6 + 27 = **60** und passen in die 62, die Spalte 1 ohnehin verlangt.*
> **Drei wären 93 und ließen die Zeile wachsen** — *zwei ist genau die Zahl, die
> schon bezahlt ist.*
>
> **B WÄRE DER ANDERE WEG UND KOSTET BREITE:** *die Wolke fällt von 311 auf 275
> — und auf Türkisch mit gesetztem Filter von 268 auf **192**, wo die erste
> Reihe von 4 auf 3 Tags fällt.* **Dazu ginge B gegen die Bestellung vom
> Vortag** *(„das ‚mehr' und ‚reset' direkt unter dem tag anzeigen")*.

### Und A allein reichte nicht — auch das ist gemessen

| | Zeile | Wolke | leer |
|---|---|---|---|
| **IST, drei Tags** | 62 | 27 | **35** |
| **A, drei Tags** | 62 | 27 | **35** |

**DIE WOLKE KANN NICHT FÜLLEN, WAS NICHT DA IST.** *Jede Instanz fängt so an,
und der Rücksetzer steht auch dann da, wenn nur drei Tags existieren und einer
gewählt ist.* **Der Betreiber hat deshalb beide Teile bestellt:** *„Dein
Vorschlag klingt gut A+C."*

---

## Was gebaut ist

### Eine Messung, zwei Leser

**`cloudLine(box)` liest die Zeilenhöhe am ersten Glied.** *`limitCloud()` und
das neue `cloudRows()` fragen beide dort.* **Stünde die Messung zweimal da,
liefen die beiden beim nächsten Griff an der Pille auseinander** — *und eine
Begrenzung, die eine andere Zeilenhöhe annimmt als der Zähler daneben,
schneidet an einer Stelle ab, die der Zähler nicht kennt* *(Stolperstein 47)*.

**`cloudRows(box)` zählt, wie viele Reihen die Wolke UNGEKÜRZT braucht.**
*`scrollHeight` misst den vollen Inhalt auch hinter einer Begrenzung — die
Antwort hängt also nicht daran, ob `limitCloud()` vorher gelaufen ist.*

### Zwei Reihen, und nur am Telefon

```js
const cloudLimit = getComputedStyle(r3).display === 'grid' ? 2 : 1;
```

**AM SCHREIBTISCH GIBT ES KEIN LOCH ZU FÜLLEN:** *dort ist die Zeile eine
Flexzeile, die Zeichen stehen neben der Wolke, und zwei Reihen wären rund 33
Pixel für nichts.*

> **GEFRAGT WIRD DAS STILBLATT UND NICHT EINE ZWEITE ZAHL.** *Das Raster gibt es
> nur im schmalen Abschnitt — also ist `display: grid` die Antwort auf „steht die
> Zeile am Telefon".* **Die Instanz hält sich genau EINE Brücke dieser Art**
> *(`NARROW`, für die Frage, ob die Filter eingeklappt anfangen)*, **und diese
> Runde baut keine zweite** *(Stolperstein 47)*.
>
> *Im Vorschlag an den Betreiber stand noch eine Zahl im Stilblatt, die das
> Skript liest. Sie ist gefallen: eine Antwort ist besser als eine Abschrift.*

### Und die Anordnung gilt nur, wo die Wolke sie trägt

```js
if (cloudRows(g3) > 1) r3.classList.add('tags-deep');
```

**OHNE `tags-deep` FÄLLT DIE ANORDNUNG VON 0.30.2 WEG:** *die Zeile trägt dann
zwei Rasterzeilen statt dreier, die Zeichen stehen am Zeilenende und der
Umschalter in der zweiten — die Anordnung, die 0.30.1 gebaut hat.*

**ES BRAUCHT DAFÜR KEINE NEUE REGEL.** *Die drei Regeln von 0.30.2 nennen
ihren Träger, und ohne ihn greift die Grundregel `.frow > .frow-right-end {
grid-column: 3; }` wieder — dieselbe, die an jeder anderen Filterzeile gilt.*

> **DEN BEFUND VON 0.30.2 HOLT DAS NICHT ZURÜCK.** *Der hing an zwei **Wörtern**
> in Spalte 3: aus 38 Pixeln wurden 180.* **Beide sind seit 0.30.2 Zeichen** —
> *30 Pixel je Stück* —, **und wo nichts abgeschnitten ist, gibt es kein
> „mehr"**: *bei flacher Wolke steht dort meist nur der Rücksetzer.*
>
> **UND DIE ENTSCHEIDUNG KANN NICHT HIN- UND HERSPRINGEN.** *Gemessen wird
> einmal je Zeichnung und bevor die Zeichen im Dokument stehen — die Wolke hat
> dabei immer dieselbe Breite.* **Der ungünstige Ausgang ist harmlos:** *wird
> die Wolke nach dem Umzug doch zweireihig, misst die Zeile 60 und die Wolke 60.
> Auch dann bleibt kein Loch.*

---

## Was die Runde eingebracht hat

*Gemessen am laufenden Server, echtes Chromium, 390 × 844, zugeklappt:*

| Lage | Wolke hoch | sichtbare Tags | Zeile | leer |
|---|---|---|---|---|
| **de, voller Bestand, ohne Filter** | 27 → **60** | 4 → **7** | 62 → **62** | 35 → **2** |
| **de, voller Bestand, mit Filter** | 27 → **60** | 4 → **6** | 62 → **62** | 35 → **2** |
| **tr, voller Bestand, mit Filter** | 27 → **60** | 4 → **6** | 62 → **62** | 35 → **2** |
| **de, drei Tags, ohne Filter** | 27 → 27 | 3 → 3 | 62 → **27** | 35 → **0** |
| **de, drei Tags, mit Filter** | 27 → 27 | 3 → 3 | 62 → **37** | 35 → **10** |

**UND DIE AUFGEKLAPPTE ANSICHT IST NICHT ANGEFASST:** *Zeile 321, Wolke 272,
dreißig Tags in zehn Reihen — dieselben Zahlen wie in 0.30.2.* **Der Betreiber:
„Aufgeklappt sieht es gut aus."**

**AM SCHREIBTISCH EBENSO NICHT:** *Zeile 36, eine Reihe, vierzehn sichtbare
Tags — wie vorher.*

---

## Der Prüfstand

PLATZHALTER_PRUEFSTAND

---

## Die Gegenproben

PLATZHALTER_GEGENPROBEN

---

## Der Augenschein

PLATZHALTER_AUGENSCHEIN

---

## Nichts zu tun beim Einspielen

**Kein Schemaanteil, kein Migrationsblock, das Austauschformat bleibt 16,
`F_ROUTES` bleibt 73.**

---

## Die Papiere

| | |
|---|---|
| **`Doku/Auftrag_0.30.3.md`** | ein Befund, vierzehn Fragen, drei Bauabschnitte |
| **`Doku/Aenderungsprotokoll_0.30.3.md`** | dieses Papier |
| **`Doku/Projektstand_Kriterion_0_30_3.md`** | `git mv`, **Revision 86** |
| **`Doku/Fahrplan.md`** | eine Zeile in der Tafel; **die geplanten Runden rücken nicht** |
| **`CHANGELOG.md`** | ein Eintrag 0.30.3 |
| **`package.json`, `package-lock.json`** | 0.30.3 |
