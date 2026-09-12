# Auftrag 0.30.3 — „Die zugeklappte Tagzeile füllt, was sie ohnehin kostet"

**Ein Befund aus dem Rundlauf mit 0.30.2 · geschrieben am 12. September 2026 ·
gebaut auf 0.30.2.**

> **DER BETREIBER HAT 0.30.2 EINGESPIELT UND SOFORT HINGESEHEN:** *„Aufgeklappt
> sieht es gut aus. Da zeigt den richtigen Weg aber zugeklappt sieht es wie da
> ist was falsch gelaufen aus. Was wären deine alternativ vorschlagen? Eine
> zweite Reihe von Tags?"*
>
> **SEIN VORSCHLAG IST DER GEBAUTE.** *Die Messung hat ihn bestätigt, bevor eine
> Zeile entstand — und sie hat gezeigt, dass er nichts kostet.*

---

## Die Fragetafel — vor der ersten Zeile beantwortet

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F1** | **Die zugeklappte Wolke bekommt zwei Reihen statt einer** | **Ja — und es kostet null.** *Gemessen: die Zeile ist 62 px hoch, weil Spalte 1 sie verlangt (Beschriftung 18 + Zeichen 30 + zwei Rasterabstände à 7). Zwei Wolkenreihen messen 27 + 6 + 27 = **60** und passen hinein, ohne dass die Zeile um ein Pixel wächst* | **JA.** *Betreiber, 12. September 2026: „Dein Vorschlag klingt gut A+C."* |
| **F2** | **Warum nicht drei Reihen?** | **Weil drei nicht mehr bezahlt sind.** *Drei messen 27·3 + 6·2 = **93** und ließen die Zeile von 62 auf 93 wachsen.* **Zwei ist genau die Zahl, die Spalte 1 ohnehin verlangt** | **ZWEI** |
| **F3** | **Gilt die Zahl auch am Schreibtisch?** | **Nein.** *Dort ist die Zeile eine Flexzeile, die Zeichen stehen neben der Wolke, und es gibt kein Loch zu füllen. Zwei Reihen wären dort rund 33 px mehr für nichts* | **NUR AM TELEFON.** *Betreiber, 12. September 2026* |
| **F4** | **Woher weiß das Skript, dass es am Telefon steht?** | **Es fragt das Stilblatt, statt eine zweite Zahl zu führen.** *`getComputedStyle(zeile).display === 'grid'` — das Raster gibt es nur im schmalen Abschnitt.* **Das ist eine Antwort und keine Abschrift** *(Stolperstein 47)* | **DAS STILBLATT ANTWORTET** |
| **F5** | **Bei wenigen Tags gibt es keine zweite Reihe zu zeigen — was dann?** | **Dann dürfen die Zeichen keine eigene Rasterzeile verlangen.** *Gemessen mit drei Tags: Zeile 62, Wolke 27, **35 px leer** — mit zwei Reihen genauso, denn die Wolke kann nicht füllen, was nicht da ist* | **DANN ANDERS.** *Betreiber: „A+C"* |
| **F6** | **Wohin gehen die Zeichen bei flacher Wolke?** | **An das Zeilenende — die Anordnung vor 0.30.2.** *Es braucht dafür keine neue Regel: die 0.30.2-Regel wird schlicht nicht angewandt, und die Grundregel `.frow > .frow-right-end { grid-column: 3; }` greift wieder* | **AN DAS ZEILENENDE.** *Betreiber, 12. September 2026* |
| **F7** | **Holt das nicht den Befund von 0.30.2 zurück?** | **Nein, und das ist gemessen.** *Der Befund war: zwei **Wörter** in Spalte 3 machten aus 38 px deren 180. Beide sind seit 0.30.2 **Zeichen** — 30 px je Stück, 64 für beide.* **Und bei flacher Wolke steht dort meist nur der Rücksetzer**, denn wo nichts abgeschnitten ist, gibt es kein „mehr" | **NEIN** |
| **F8** | **Was heißt „flach"?** | **Weniger als zwei Reihen — gemessen an derselben Zeilenhöhe wie die Begrenzung selbst.** *`cloudRows()` liest `scrollHeight`, und der misst den vollen Inhalt auch hinter einer Begrenzung* | **WENIGER ALS ZWEI REIHEN** |
| **F9** | **Kann die Entscheidung hin- und herspringen?** | **Nein.** *Gemessen wird EINMAL je Zeichnung, und zwar bevor die Zeichen im Dokument stehen — die Wolke hat dabei immer dieselbe Breite.* **Und der ungünstige Ausgang ist harmlos:** *wird die Wolke nach dem Umzug doch zweireihig, misst die Zeile 60 und die Wolke 60 — auch dann bleibt kein Loch* | **NEIN** |
| **F10** | **Ändert sich etwas an der aufgeklappten Ansicht?** | **Nichts.** *Aufgeklappt hebt `limitCloud()` die Begrenzung ganz auf; die Zahl gilt nur für den zugeklappten Fall.* **Der Betreiber: „Aufgeklappt sieht es gut aus"** | **NICHTS** |
| **F11** | **Und die Tagwolke im Eintrag?** | **Sie bleibt bei drei Reihen.** *Sie steht in keinem Raster mit Beschriftungsspalte, trägt ihr „mehr" als Wort in einem eigenen Kasten und hat deshalb kein Loch zu füllen* | **BLEIBT** |
| **F12** | **Und die Tagzeile eines Testtags?** | **Bleibt bei einer Reihe.** *Sie ist eine Flexzeile ohne Beschriftungsspalte — 0.30.1 hat sie genau dafür gebaut* | **BLEIBT** |
| **F13** | **Braucht der Umschalter „und/Oder" eine Änderung?** | **Nein.** *Er bleibt unter der Klappe, mit der Ausnahme aus 0.30.2 (ab zwei gewählten Tags steht er da). Bei flacher Wolke rückt er in die zweite Rasterzeile statt in die dritte — die Anordnung, die 0.30.1 gebaut hat* | **KEINE** |
| **F14** | **Wörter, Sprachdateien, Schema?** | **Kein einziges Wort, kein Schlüssel, kein Schemaanteil.** *Die Runde bewegt zwei Zahlen und eine Klasse* | **NICHTS** |

---

## Befund 1 — Die zugeklappte Tagzeile lässt fünfunddreißig Pixel leer

**Art: Fehler** *(Anmutung, Platz)* · **drei Bilder, 12. September 2026, aus der
laufenden Installation mit 0.30.2**

> **Der Betreiber wörtlich:** *„Aufgeklappt sieht es gut aus. Da zeigt den
> richtigen Weg aber zugeklappt sieht es wie da ist was falsch gelaufen aus."*

### Was dasteht — und woher es kommt

**DIE HÖHE DER ZEILE KOMMT NICHT VON DER WOLKE, SONDERN VON SPALTE 1.** *Seit
0.30.2 stehen die beiden Zeichen unter der Beschriftung; die Spalte trägt damit
zwei Rasterzeilen:*

```
Beschriftung   18 px
Rasterabstand   7 px
die Zeichen    30 px
Rasterabstand   7 px
               ——————
               62 px
```

**DIE WOLKE DANEBEN IST AUF EINE REIHE BEGRENZT — 27 PIXEL.** *Die restlichen
**fünfunddreißig** stehen rechts neben dem Haken, und weil dort sonst nichts ist,
liest sich das Loch wie ein Fehler.*

**GEMESSEN AM 12. SEPTEMBER 2026** *(echtes Chromium, 390 × 844,
`deviceScaleFactor: 3`, `isMobile: true`, dreißig Tags, alle drei Sprachen —
zugeklappt)*:

| Fassung | Zeile | leer | sichtbare Tags | Wolke breit |
|---|---|---|---|---|
| **IST** | 62 | **35** | 4 | 311 |
| **A — zwei Wolkenreihen** | **62** | **2** | **7** | 311 |
| **B — Zeichen neben die Beschriftung** | 44 | 17 | 4 | 275 |
| **B2 — beides zusammen** | 60 | 0 | 6 | 275 |

> **A IST KOSTENLOS, UND DAS IST KEIN SCHÄTZWERT:** *die Zeile misst mit zwei
> Reihen dasselbe wie mit einer — 62 zu 62, mit gesetztem Tagfilter ebenso.*
> **Dafür stehen 7 statt 4 Tags da** *(ohne Filter)*, **6 statt 4** *(mit
> Filter)*.
>
> **B KOSTET BREITE, UND DIE KOSTET TAGS:** *die Wolke fällt von 311 auf 275 —
> und auf Türkisch mit gesetztem Filter von 268 auf **192**, wo die erste Reihe
> von 4 auf 3 Tags fällt.* **Dazu ginge B gegen die Bestellung des Betreibers
> vom Vortag** *(„das ‚mehr' und ‚reset' direkt unter dem tag anzeigen")*.

### Die Grenze von A — und sie ist gemessen

**BEI EINEM JUNGEN BESTAND HILFT A NICHT.** *Gemessen mit drei Tags:*

| | Zeile | Wolke | leer |
|---|---|---|---|
| **IST, drei Tags** | 62 | 27 | **35** |
| **A, drei Tags** | 62 | 27 | **35** |

**DIE WOLKE KANN NICHT FÜLLEN, WAS NICHT DA IST.** *Und der Fall ist nicht
konstruiert: jede Instanz fängt so an, und der Rücksetzer steht auch dann da,
wenn nur drei Tags existieren und einer davon gewählt ist.*

---

## Der Bauabschnitt

**BA 1 — Die Zeilenhöhe einer Wolke wird EINMAL gemessen.**
*`cloudLine(box)` liest sie am ersten Glied; `limitCloud()` und das neue
`cloudRows()` fragen beide dort. Zwei Leser, eine Messung* *(Stolperstein 47)*.

**BA 2 — Die zugeklappte Wolke der Übersicht zeigt am Telefon zwei Reihen.**
*Die Zahl steht an einer Stelle im Skript und hängt an der Frage an das
Stilblatt, ob die Zeile ein Raster ist.*

**BA 3 — Die Anordnung von 0.30.2 gilt nur, wenn die Wolke sie trägt.**
*`tags-deep` sagt es der Zeile; ohne sie fallen die Zeichen an das Zeilenende
zurück und der Umschalter in die zweite Rasterzeile.*

**BA 4 — Der Prüfstand trägt die Zusagen der Runde.**

**BA 5 — Die Gegenproben bauen jede einzelne zurück.**

**BA 6 — Die Papiere, der Augenschein, der Fingerprint** *(als letztes
gerechnet — die Lehre aus 0.30.1)*.

---

## Der Prüfstand — was er halten muss

| | Zusage |
|---|---|
| **1** | **Die Zeilenhöhe einer Wolke wird an einer Stelle gemessen** — beide Leser fragen dieselbe |
| **2** | **`cloudRows()` zählt die Reihen, die die Wolke UNGEKÜRZT braucht** — auch hinter einer Begrenzung |
| **3** | **Und es zählt an derselben Zeilenhöhe wie die Begrenzung** |
| **4** | **Am Telefon zeigt die zugeklappte Wolke der Übersicht ZWEI Reihen** |
| **5** | **Am Schreibtisch EINE** — dort gibt es kein Loch zu füllen |
| **6** | **Aufgeklappt gilt keine Begrenzung** — die Zahl gilt nur zugeklappt |
| **7** | **Die Zeile trägt `tags-deep`, sobald die Wolke mehr als eine Reihe braucht** |
| **8** | **Ohne `tags-deep` stehen die Zeichen am Zeilenende** — Spalte 3, wie vor 0.30.2 |
| **9** | **Ohne `tags-deep` trägt die Zeile zwei Rasterzeilen statt dreier** |
| **10** | **Ohne `tags-deep` steht der Umschalter in der zweiten** |
| **11** | **Mit `tags-deep` bleibt alles, was 0.30.2 gebaut hat** |
| **12** | **Die Wolke im Eintrag bleibt bei drei Reihen** |
| **13** | **Die Tagzeile eines Testtags bleibt bei einer** |

---

## Was ausdrücklich NICHT gebaut wird

| | |
|---|---|
| **Die Zeichen wandern nicht neben die Beschriftung** | *Fassung B — sie kostet Breite und damit Tags, und sie ginge gegen die Bestellung vom Vortag* |
| **Die Wolke im Eintrag bleibt, wie sie ist** | *drei Reihen, „mehr" als Wort — sie hat kein Loch zu füllen* |
| **Kein Wort wird angefasst** | *keine Sprachdatei, kein Schlüssel* |
| **Kein Schemaanteil** | *Austauschformat bleibt 16, `F_ROUTES` bleibt 73* |

---

## Wie es weitergeht

**DIESER STAND GEHT AN DEN WIRT.** *Der Betreiber hat 0.30.2 bereits
eingespielt; 0.30.3 ist der Nachzug auf denselben Befund.*
