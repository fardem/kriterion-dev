# Änderungsprotokoll 0.30.3 — „Die zugeklappte Tagzeile füllt, was sie ohnehin kostet"

**Ein Befund aus dem Rundlauf mit 0.30.2 · 12. September 2026 · gebaut auf
0.30.2.**

> **FINGERPRINT DIESER RUNDE: `098e85ca`** — gerechnet am gebauten Stand,
> **als letztes und hinter der letzten Zeile**.
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(achtzehn Dateien)* | **`098e85ca`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`098e85ca`** |
> | **Aus der laufenden Installation gemeldet** | **`098e85ca`** *(13. September 2026)* |
>
> **DREI QUELLEN, EIN WERT.** *Der Betreiber hat 0.30.3 eingespielt und den
> Wert am 13. September 2026 aus seiner Installation gemeldet — damit ist das
> Eingespielte auf das Byte dasselbe wie das Gebaute.*
>
> **UND DER BEFUND DIESER RUNDE KAM AUS DEM FELD:** *er hatte 0.30.2 eingespielt
> und am selben Tag mit drei Bildern hingesehen.*

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

**6823 von 6823 grün, 345 Gruppen.**

**EINE NEUE GRUPPE MIT ZWEIUNDZWANZIG ZUSAGEN** — und **vier umgestellte Zusagen
älterer Runden** *(Stolperstein 201: umgestellt und nicht gelöscht)*:

| | was sich geändert hat |
|---|---|
| **„Die ersten Rasterzeilen der Tagzeile sind so hoch wie ihr Inhalt"** *(0.30.1)* | fragt jetzt **beide** Fassungen — zwei Rasterzeilen ohne Träger, drei mit |
| **„Und sie steht nur im schmalen Abschnitt"** *(0.30.1)* | zählt zwei Regeln statt einer |
| **„Die beiden Verweise stehen in Spalte eins" · „Und die Zeile trägt drei Rasterzeilen" · „Und der Umschalter steht in der dritten"** *(0.30.2)* | nennen ihren **Träger** mit |
| **„In den Kommentaren derselben Datei stehen unverändert 36 Vorkommen"** | siebenunddreißig — *der Absatz zur Zahl der Wolkenreihen nennt die Instanz* |

**GEFAHREN WIRD, WAS SICH FAHREN LÄSST**, und für den Rest steht ein Mock
*(Stolperstein 161)*:

- **Der Zähler wird am Kasten gefahren**, nicht am Bildschirm: *jsdom rechnet
  keine Höhen, also bekommt er einen, der welche nennt* — eine Reihe, zwei,
  dreißig, und eine ohne messbare Höhe.
- **Die Zahl der Reihen wird an einem Späher an der Begrenzung abgelesen** —
  *die Zusage gilt dem **Ruf** und nicht der Funktion.* **Genau diese Lücke hat
  0.30.1 an ihrer eigenen Gegenprobe gefunden.**
- **Die Antwort des Stilblatts wird für diese eine Zeile getauscht**, weil jsdom
  den schmalen Abschnitt nicht auswertet. *So sind beide Ausgänge gefahren:
  Schreibtisch eine Reihe, Telefon zwei.*
- **Und die Klasse wird in beide Richtungen geprüft** — *eine Zusage, die nur
  einen Ausgang kennt, bliebe grün, wenn die Bedingung ganz fiele* *(Stolperstein
  81)*.

> **EIN ROTER PUNKT KAM AUS DER PRÜFUNG SELBST UND NICHT AUS DEM BAU.** *„Bei
> EINER Reihe trägt sie es nicht" war rot, weil der zweite Klick ins Leere ging:
> `sortCloud()` stellt die gewählten Tags nach vorn, der erste Klick hatte den
> einen also wieder abgewählt — und ohne Klick kein Neuzeichnen.* **Die Zeile
> behielt die Klasse aus dem Zug davor.** *Berichtigt ist der Klick, nicht der
> Bau.*

---

## Die Gegenproben

**ZWÖLF GEFAHREN, 0 STUMM.**

**NEUN NEUE RÜCKBAUTEN** *(943 bis 951)* **UND DREI NACHGEZOGEN** *(916, 935,
936 — die drei Regeln der Tagzeile nennen seit dieser Runde ihren Träger, und
die Suchtexte sind mitgewandert)*.

| # | Rückbau | was rot wurde |
|---|---|---|
| **943** | Die zugeklappte Wolke zeigt wieder EINE Reihe | „Am Telefon zeigt sie ZWEI" |
| **944** | Die zwei Reihen gelten auch am Schreibtisch | „Am Schreibtisch zeigt die zugeklappte Wolke EINE Reihe" |
| **945** | Die Anordnung gilt wieder immer | „Bei EINER Reihe trägt sie es nicht" |
| **946** | Die Anordnung greift erst ab drei Reihen | „Ab ZWEI Reihen trägt die Zeile `tags-deep`" |
| **947** | Der Reihenzähler rechnet ohne den Abstand | „Und dreißig Reihen als dreißig" |
| **948** | Der Reihenzähler misst wieder selbst | „Und beide Leser fragen dort" |
| **949** | Der Reihenzähler sieht nur, was nicht abgeschnitten ist | sieben Prüfungen, darunter „Und ZWEI Reihen als zwei" |
| **950** | Die dritte Rasterzeile gilt wieder ohne Bedingung | „Ohne `tags-deep` trägt die Zeile zwei Rasterzeilen" |
| **951** | Der Umschalter nennt seinen Träger nicht mehr | „Und der Umschalter steht nur dort in der dritten" |

> **945 UND 946 SIND DAS PAAR, UND DARAUF KOMMT ES AN:** *der eine lässt die
> Anordnung immer gelten, der andere nie.* **Beide machen je eine ANDERE Zusage
> rot** — *eine Bedingung, von der nur ein Ausgang belegt ist, ist ein Wächter
> über nichts* *(Stolperstein 81)*.
>
> **ZWEI RUNDEN HINTEREINANDER HAT DIE GEGENPROBE EINE LÜCKE GEFUNDEN** *(0.30.1
> und 0.30.2)*. **Diese Runde hat keine** — *und das ist kein Zufall, sondern die
> Lehre daraus: die Zusagen dieser Runde fragen den RUF und die WIRKUNG, nicht
> den Träger.*

**UND DER AUFRÄUMER HAT WIEDER GEFLACKERT** *(Punkt 27 des Sammelblatts)*: *in
**sechs von zwölf** Läufen wurde die Gruppe „Der Prüfstand räumt beim Start auf
— 0.30.0" rot, bei Rückbauten, die mit ihr nichts zu tun haben.* **Drei Spuren,
wie beim Nachlauf zu 0.30.1** — *die Zahl ist damit von zwei Dritteln auf die
Hälfte gefallen, und beides ist dieselbe Größenordnung.*

---

## Der Augenschein

**Gefahren am 12. September 2026 am laufenden Server**, in echtem Chromium —
**zwei Breiten, zwei Sprachen, fünf Lagen.**

| Ort | Sprache | Lage | `tags-deep` | Rasterzeilen | Zeichen | Wolke | sichtbar | Zeile | leer |
|---|---|---|---|---|---|---|---|---|---|
| **Telefon** | de | zu, ohne Filter | **ja** | 18/30/0 | Spalte 1 | 311 × 60 | **7** in 2 Reihen | **62** | **2** |
| **Telefon** | de | zu, mit Filter | **ja** | 18/30/0 | Spalte 1 | 282 × 60 | **6** in 2 Reihen | **62** | **2** |
| **Telefon** | de | offen, mit Filter | ja | 18/30/259 | Spalte 1 | 272 × 321 | 30 in 10 Reihen | 321 | 0 |
| **Telefon** | tr | zu, mit Filter | **ja** | 18/30/0 | Spalte 1 | 268 × 60 | **6** in 2 Reihen | **62** | **2** |
| **Telefon** | tr | offen, mit Filter | ja | 18/30/259 | Spalte 1 | 268 × 321 | 30 in 10 Reihen | 321 | 0 |
| **Telefon** | de | zu, **drei Tags** | **nein** | 18/2 | *kein Kasten* | 311 × 27 | 3 in 1 Reihe | **27** | **0** |
| **Telefon** | de | zu, drei Tags mit Filter | **nein** | 30/0 | **Spalte 3** | 281 × 27 | 3 in 1 Reihe | **37** | 10 |
| **Schreibtisch** | de | zu, ohne Filter | — | *kein Raster* | neben der Wolke | 996 × 30 | 14 in 1 Reihe | 36 | 6 |
| **Schreibtisch** | de | offen, mit Filter | — | *kein Raster* | neben der Wolke | 956 × 102 | 30 in 3 Reihen | 107 | 5 |

**VIER SACHEN STEHEN DAMIT AM LAUFENDEN SERVER FEST:**

| | |
|---|---|
| **1** | **Die Zeile misst zugeklappt dieselben 62 Pixel wie vorher** — und die Wolke darin 60 statt 27. **Von fünfunddreißig leeren Pixeln sind zwei geblieben** |
| **2** | **Der junge Bestand hat kein Loch mehr:** *drei Tags, keine zweite Reihe — `tags-deep` fällt, die Zeichen stehen in Spalte 3, und die Zeile misst **27** statt 62* |
| **3** | **Am Schreibtisch ist nichts angefasst** — *eine Reihe, vierzehn sichtbare Tags, Zeile 36, wie vorher* |
| **4** | **Und die aufgeklappte Ansicht ist Zahl für Zahl dieselbe wie in 0.30.2** — *Zeile 321, Wolke 272, dreißig Tags in zehn Reihen.* **Nichts rollt seitlich, in keiner Lage** |

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
