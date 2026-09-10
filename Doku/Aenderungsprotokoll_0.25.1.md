# Änderungsprotokoll 0.25.1 — „Jede Kachel zählt ihre eigene Arbeit"

**Drei Befunde vom Bildschirm, an einem Vormittag · 10. September 2026 ·
gebaut auf 0.25.0 (`84933c06`).**

> **FINGERPRINT DIESER RUNDE: `ba7495f2`** —
> gerechnet am gebauten Stand, **vor dem Einspielen**. *Er steht hier, damit
> die Installation sich daran messen lässt: Einstellungen → Datenbank →
> Kennzahlen. Weicht er ab, liegt ein halb eingespielter Dateisatz vor.*
>
> **DER VON 0.25.0 IST `84933c06`** — am 9. September 2026 vor dem Einspielen
> gerechnet **und am 10. September vom Betreiber aus der laufenden
> Installation gemeldet**: derselbe Wert. *Zwei Quellen, ein Wert — und diesmal
> in der anderen Reihenfolge als sonst.*

**0.25.0 hat dem Namen seine Sprache gegeben, und der Betreiber hat es am
nächsten Vormittag benutzt.** Was er dabei sah, sind drei Befunde — alle drei
an der Karte, alle drei am Bildschirm entstanden und keiner im Quelltext
gesucht. **Zwei davon waren mir beim Bauen bekannt und sind zugedeckt worden
statt behoben.** Das steht hier so, weil es so war.

> **DER BETREIBER IM WORTLAUT, 10. September 2026:**
>
> *„die zahl in der sprachen pille ist das eine zahl pro kachel oder für alle?
> Im momment ist es gemischt. besser wäre pro kachel dann weis man wieviele man
> in dem kachel noch bearbeiten muss."*
>
> *„Und warum ist der untere text mit dem hinweis im ersten kachel volltändig
> zu sehen und in den beiden andren nicht?"*
>
> *„ist irgendwie ein nicht klarer satz. warum nicht ‚Fallback — Kein Eintrag
> in xxxx Vorhanden'"*

---

## Die Versionsnummer

**0.25.1 ist ein PATCH, und Regel 5.1 lässt hier nichts anderes zu:** die Runde
legt **keine Spalte** an, bringt **keinen neuen Weg** und **keine neue
Funktion**. Sie repariert drei Dinge, die falsch angezeigt wurden, und
berichtigt ein Wort in einer Sprachdatei. *Eine Datenbankstufe oder eine
Funktion ist mindestens MINOR; eine Reparatur ist PATCH.*

**Der Fahrplan rutscht nicht.** Ein PATCH schiebt keine Nummer.

---

## Der Befund, in vier Teilen

### A · Die Zahl an der Pille war eine Summe über zwei Kacheln

**Die Stelle:** `public/app.js`, `namesMissing(key, code)`.

Die Tafel `crits` trägt **beide** Kriterienkarten — „Bewertung" und
„Potenzial". Die Liste darunter filterte nach der Phase
(`.filter(c => c.phase === phase)`), **die Zahl darüber nicht**. Über beiden
Kacheln stand deshalb dieselbe Zahl: die Summe, zweimal hingeschrieben.

**Über „Kategorien" stand die richtige Zahl nur durch einen Zufall** —
Kategorien sind EINE Tabelle und EINE Kachel. Genau das hat der Betreiber
gesehen und „gemischt" genannt: an einer Kachel stimmte es, an zweien nicht.

**Der rote Rahmen hing an derselben Zahl** und war damit ebenso falsch: eine
Kachel ohne jede Lücke trug ihn, sobald die andere eine hatte.

### B · Der Hinweis unter dem Namen wurde abgeschnitten

**Die Stelle:** `public/app.js`, die Zeile der Verwaltungsliste, und
`public/style.css`, `.mrow .mnamebox`.

Der Vermerk saß **in der Namensspalte** (`.mnamebox`), und die ist eine SPALTE
der Zeile. In einer Kriterienzeile teilen sich Ziehgriff, Gewichtsfeld, ✕,
Zähler und zwei Knöpfe dieselbe Zeile; was der Namensspalte blieb, war so
schmal, dass der Vermerk mit Auslassung kürzte. **Eine Kategorienzeile hat
weder Griff noch Gewicht** — dort stand derselbe Satz vollständig da.

**EIN SATZ, ZWEI BREITEN, je nach Karte.** Und er stand dabei auf einer
eigenen, zweiten Zeile, neben der rechts gar nichts liegt.

> **DAS WAR MIR BEKANNT.** Der Kommentar dazu stand seit 0.24.5 wörtlich im
> Quelltext: *„in der Kriterienkarte steht neben dem Namen auch noch das
> Gewicht, und dann bleibt für die zweite Zeile so wenig Platz, dass sie mit
> Auslassung kürzt. Der Zeiger darüber zeigt den ganzen Satz."* **Ein `title`
> ist eine Abdeckung und keine Reparatur** — und am Telefon gibt es keinen
> Zeiger.

### C · Der Satz sagte nicht, was fehlt

**Die Stelle:** `public/languages/*.json`, `card.nameFallback`.

Bis 0.25.0: **„(nicht eingetragen — es steht Deutsch)"**. Der Satz nannte
*nicht*, **was** nicht eingetragen ist, und „es steht Deutsch" liest sich wie
eine Aussage über den Text selbst. *Englisch und Türkisch trugen ein Verb
(`showing`, `görünüyor`) und waren dadurch klarer — das Deutsche war die
schlechteste der drei Fassungen.*

### D · „Backup" heißt auf Türkisch `yedekleme`

**Die Stelle:** `public/languages/tr.json`, 45 Sätze.

> **DER BETREIBER, 10. September 2026:** *„türkcede backup icin yedek kelmiesi
> kullanmisin. galiba ona daha cok yedekleme denir. bir daha bir arastir"* —
> und nach zwei Quellen und einer Rückfrage: **„immer nur das wort
> yedekleme"**.

Im türkischen IT-Sprachgebrauch ist **`yedekleme` der Vorgang** und **`yedek`
die entstandene Kopie**; Microsoft schreibt „Windows Yedekleme", Apple „Son
yedekleme", Android „Otomatik Yedekleme". *Der Betreiber hat den GlassHouse-
Eintrag beigebracht:* „Türkçe terminolojide **yedekleme** olarak karşılık
bulan Backup … kopyalanması **sürecidir**."

**Ich habe eingewandt, dass `yedek` bei der gezählten Kopie richtig bleibt.
Der Betreiber hat entschieden: durchgehend `yedekleme`.** So ist es gebaut.

---

## Die Bauabschnitte

### 1 · Ein Ausdruck für die Liste UND für die Zahl

`namesMissing(key, code, only)` nimmt seit dieser Runde die Auswahl der Kachel
entgegen; `drawNameLanguages(boxId, key, rows)` reicht sie durch. **Gebaut wird
sie aus DERSELBEN Liste, die darunter gezeichnet wird** — `critRows(fetched,
phase)`, ein Ausdruck, zwei Verwendungen. *Eine Zahl über einer Liste, die eine
andere Auswahl trifft als die Liste selbst, ist Stolperstein 47 in klein.*

**Die beiden Schleifen in `drawAdmin()` sind zu einer geworden.** Bis 0.25.0
zeichnete die eine die Pillenreihen und die andere die Listen — und nur die
zweite kannte die Phase. *Zwei Schleifen über dieselbe Sache laufen
auseinander, sobald sich eine ändert; genau das war passiert.*

**Der rote Rahmen liest dieselbe Zahl** und wird damit ohne weiteres Zutun
richtig.

**Die Kachel „Kategorien" reicht bewusst nichts durch:** sie zeigt ALLE
Kategorien, ihre Auswahl IST die Tafel. *Eine Menge zu bauen, die ohnehin jede
Kennung enthält, wäre eine Zeile, die nichts entscheidet.*

**Die Karte „Sprachen" zählt weiter über die ganze Installation.** Sie fragt
etwas anderes — „lohnt es, die Vorgabe auf diese Sprache zu stellen" —, und
darauf antwortet keine einzelne Kachel. *Die Zahlen auf dem Bildschirm addieren
sich deshalb nicht; das ist gewollt und steht im Quelltext begründet.*

### 2 · Der Vermerk verlässt die Namensspalte

`.mfallback` ist **letztes Kind der Zeile** und trägt `flex-basis: 100%`; die
Zeile bricht um (`.mrow.withback`). **Damit hat der Vermerk die volle
Kachelbreite, in jeder Karte dieselbe.**

**LETZTES Kind und nicht irgendeines:** stünde er vor dem Gewichtsfeld, schöbe
der Umbruch alles dahinter auf eine dritte Zeile.

**Den Umbruch trägt eine eigene Klasse und nicht `.mrow` schlechthin** —
dieselbe Zeile zeichnet auch Tags, Papierkorb und Benutzer, und die kennen
keinen Vermerk.

**`row-gap: 1px` statt des allgemeinen `gap: 9px`:** derselbe Abstand zwischen
Name und Vermerk risse auseinander, was zusammengehört.

### 3 · Der Satz nennt beide Sprachen

`card.nameFallback` bekommt einen zweiten Platzhalter:

| | |
|---|---|
| **de** | `(kein Eintrag in {missing} — gezeigt wird {language})` |
| **en** | `(no entry in {missing} — showing {language})` |
| **tr** | `({missing} için kayıt yok — {language} görünüyor)` |

**Beide Angaben, weil es zwei Sprachen sind:** die, in der nichts steht (die
Pille, auf der man gerade steht), und die, deren Name stattdessen dasteht.
*Die fehlende muss mit, obwohl die Pille sie schon nennt — wer die Liste
überfliegt, liest die Zeile und nicht den Umschalter. Die gezeigte muss bleiben:
das ist der Befund von 0.24.6.*

### 4 · Türkisch: `yedekleme`

**55 Zeilen in `public/languages/tr.json`**, 45 Sätze. Die Formen sind
mitgegangen: `yedekler` → `yedeklemeler`, `yedekleri` → `yedeklemeleri`,
`bir yedekle` → `bir yedeklemeyle`, `yedektir` → `yedeklemedir`.

**Zwei Sätze sind mehr als ein Wortwechsel:**

| | bis 0.25.0 | ab 0.25.1 |
|---|---|---|
| `card.backupWritten` | `Yedek yazıldı` | **`Yedekleme yapıldı`** |
| `card.backupNow` | `Şimdi yedekle` | **`Şimdi yedekleme yap`** |

*Eine Sicherung wird im Türkischen nicht „geschrieben".*

**Und ein Satz wird nebenbei eindeutig:** `card.backupsBeforeChange` hieß
„{n} **yedek anahtar** değişiminden öncesine ait" — das ließ sich als
„Ersatz**schlüssel**" lesen. Jetzt steht dort `yedekleme`, und die Lesart ist
weg.

**Nach einer Zahl bleibt das Substantiv im Singular** — „3 yedekleme silindi",
nicht „3 yedeklemeler". Deshalb stehen bei diesen Sätzen `one` und `other`
wortgleich da, wie schon vorher (TR-S4, Punkt 19 des Sammelblatts).

---

## Was wegfällt — namentlich

| Was | Warum |
|---|---|
| **`.mrow .mnamebox`** *(Quelltext und Stilblatt)* | Er hatte genau einen Zweck — Name und Vermerk übereinanderzustellen —, und den erledigt jetzt der Umbruch der Zeile. `.mname` ist wieder ein Kind der Zeile |
| **`.mrow .mnamebox .mname { flex: none }`** | fällt mit dem Kasten |
| **Der Wortlaut „(nicht eingetragen — es steht {language})"** | er sagte nicht, was fehlt *(Befund C)* |
| **Das Wort `yedek` in `tr.json`** | 45 Sätze, Entscheidung des Betreibers *(Befund D)* |

**Keine Zusage des Prüfstands fällt weg.** Zwei ändern ihren Sollwert, und
beide stehen unten mit Begründung.

**Kein Weg fällt weg, keiner kommt dazu:** `F_ROUTES` bleibt bei **72**.

---

## Der Prüfstand

**`npm test` grün: 6332 Zusagen** *(0.25.0: 6312)*.

### Zwei Zusagen haben ihren Sollwert geändert

| Zusage | vorher | jetzt | warum |
|---|---|---|---|
| **„Und die Zahl zählt die fehlenden Zellen dieser Kachel, nicht die Zeilen"** | `English:3 Türkçe:3` | `English:2 Türkçe:2` | die Prüflage hat zwei Kriterien im Bewertungskasten und eines im Potenzialkasten. Bis 0.25.0 zählte die Zahl beide Kacheln. **Die Zusage ist dieselbe geblieben** — es sind die fehlenden Zellen und nicht die Zeilen; nur zählt sie jetzt die richtige Menge |
| **`axMarkOk(mark, wanted)` → `axMarkOk(mark, wanted, missing)`** | der Vermerk durfte GENAU EINE Sprache nennen | er muss **zwei** nennen und die dritte nicht | der Satz nennt seit dieser Runde beide *(Befund C)*. Die Schärfe bleibt: die dritte Sprache darf weiterhin nicht vorkommen |

### Die neue Gruppe: „Jede Kachel zählt ihre eigene Arbeit — 0.25.1"

**Die Prüflage trennt die beiden Kacheln scharf.** Für Türkisch ist nur am
Potenzialkriterium etwas eingetragen, für Englisch nur an den beiden
Bewertungskriterien:

| Kachel | Deutsch | English | Türkçe |
|---|---|---|---|
| **Bewertung** | ● | ● | **2** |
| **Potenzial** | ● | **1** | ● |

*Eine Prüflage, in der beide dasselbe zeigten, bewiese nichts — und genau das
war der Zustand: bis 0.25.0 stand an beiden „English:1 Türkçe:2".*

### Und eine zweite Gruppe für das Türkische

**„Backup" heißt auf Türkisch yedekleme — 0.25.1.** Ein Wächter über ALLE
Sätze der Datei und nicht über eine einzelne Karte: *ein Wächter über alle
fängt auch den Satz, der in einem Jahr dazukommt.*

---

## Die Gegenproben

**Acht neue, 780 bis 787** — vier an der Zahl und am Rahmen, zwei am Vermerk,
eine am Wortlaut, eine am Türkischen. **Alle gefahren.** Dazu **fünf
mitgegangene**, deren Suchtext sich mit dieser Runde bewegt hat: **zehn Läufe,
und einer davon zweimal.**

> **EINER LIEF STUMM, UND ER HATTE RECHT: 783.** *Er nimmt der zweiten Stelle,
> an der die Pillenreihe entsteht, die Auswahl der Kachel weg — und machte
> keinen einzigen Punkt rot.* **Der Grund war eine echte Lücke im Prüfstand:**
> die neue Gruppe prüfte ausschließlich den **Aufbau** der Karte
> (`setUpCriteriaOut`); das **Neuzeichnen** nach einem Griff (`drawAdmin`, über
> `adminNew`) war von keiner Zusage berührt. *Ein Rückbau, der nur dort
> zuschlägt, hatte nichts zum Rotmachen.*
>
> **DREI ZUSAGEN SCHLIESSEN SIE:** der einzige türkische Eintrag des
> Potenzialkastens wird über das ✕ geräumt, und danach muss **seine** Zahl von
> ● auf 1 gehen, während die des Bewertungskastens auf **2** stehen bleibt.
> *Ohne die Auswahl an beiden Stellen stünden nach dem Räumen beide bei 3.*
> **6329 → 6332.** Danach ist 783 rot.

| # | Rückbau | trifft |
|---|---|---|
| **780** | Die Zahl an der Pille zählt wieder beide Kriterienkarten | Befund A, die Zahl |
| **781** | Der rote Rahmen zählt wieder beide Kriterienkarten | Befund A, der Rahmen |
| **782** | Die erste Zeichnung reicht der Pillenreihe die Zeilen nicht | `setUpCriteriaOut` |
| **783** | Das Neuzeichnen reicht der Pillenreihe die Zeilen nicht | `drawAdmin` — **lief im ersten Anlauf STUMM** |
| **784** | Der Vermerk sitzt wieder im Namenskasten | Befund B |
| **785** | Die Zeile mit Vermerk bekommt den Umbruch nicht | Befund B |
| **786** | Der Vermerk nennt die fehlende Sprache nicht | Befund C |
| **787** | Ein alleinstehendes „yedek" bleibt im Türkischen stehen | Befund D |

**Was sie rot gemacht haben:** 597 (31 Zusagen), 770 (12), 780 (5), 781 (3),
782 (7), 784 (4), 785 (2), 786 (10), 787 (2) — **und 783 mit 3, nachdem die
Lücke geschlossen war.** *Zehn Rückbauten, elf Läufe, am Ende kein einziges
STUMM.*

**ZWEI RÜCKBAUTEN FÜR EINE SACHE, ZWEIMAL** — und beide Male aus demselben
Grund. **780 und 781:** die Zahl sagt „so viel liegt hier", der Rahmen sagt
„hier liegt etwas"; ein Rückbau, der beide träfe, ließe offen, welche von
beiden hält. **782 und 783:** die Pillenreihe entsteht an ZWEI Stellen — beim
Aufbau der Karte und beim Neuzeichnen nach einem Griff. *Genau diese Zweiteilung
hat den Befund erzeugt; ein Rückbau, der nur eine träfe, ließe die andere
ungeprüft.*

**Vier sind mitgegangen** statt gelöscht zu werden *(Stolperstein 201)*:

| # | was sich bewegt hat |
|---|---|
| **754**, **755** | der rote Rahmen liest jetzt die Auswahl mit — der Suchtext trägt `only` |
| **770** | `namesMissing()` hat einen dritten Wert; der Rückbau zählt weiterhin alle Zellen **dieser Kachel** statt der fehlenden |
| **771** | der Namenskasten ist weg; der Rückbau nimmt die Dämpfung jetzt am `.mname` der Zeile weg |

**Die Liste steht damit bei 778.**

---

## Der Augenschein — vier Bilder

**Ein echter Server, ein echter Browser, kein Nachbau.**

| Bild | was darauf zu sehen ist |
|---|---|
| **1 · zwei Kacheln, zwei Zahlen** | die beiden Kriterienkacheln untereinander auf **Türkçe** — an „Bewertung" eine Zahl, an „Potenzial" der Punkt, und **nur eine von beiden im roten Rahmen.** *Bis 0.25.0 stand an beiden dieselbe Zahl und beide trugen den Rahmen* |
| **2 · der Vermerk über die volle Breite** | dieselbe Kriterienkachel von nahem: der Satz steht **vollständig** unter dem Namen, neben Gewichtsfeld und Knöpfen — nicht mehr mit Auslassung |
| **3 · der neue Satz** | die Kachel „Kategorien" auf Türkçe: *„(kein Eintrag in Türkçe — gezeigt wird Deutsch)"* an jeder geliehenen Zeile |
| **4 · Yedekleme** | die Karte „Sicherung" in türkischer Oberfläche: **„Yedekleme"** in Überschrift, Beschriftung und Knopf |

---

## Was ausdrücklich NICHT gebaut wird

**DIE SPRACHDURCHSICHT.** Der Betreiber hat am 10. September 2026 alle drei
Sprachdateien durch ein zweites Modell gegeben und die Berichte beigebracht.
**Sie stehen als Punkt 24 im Sammelblatt** und bekommen einen eigenen Auftrag
mit Fragetafel — *das meiste daran ist eine Entscheidung über die Hausstimme
und kein Fehler.*

**Zwei Diagnosen aus diesen Berichten sind nachweislich falsch**, und beide
Male aus demselben Grund: der Bericht sieht die Sprachdatei und nicht den
Aufruf. Sie stehen im Sammelblatt mit dem Beleg dabei.

**KEIN ZWANG BEIM UMSCHALTEN, KEINE GLOCKE, KEINE ÄNDERUNG AN `localeOf(req)`,
KEINE ÄNDERUNG AN DER SORTIERUNG.** Wie in 0.25.0.

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.25.1.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_25_1.md` | `git mv`, **Revision 74** |
| `Doku/Fahrplan.md` | die Runde |
| `Doku/Fehler_und_Ideen.md` | **Punkt 24: die Sprachdurchsicht** |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
