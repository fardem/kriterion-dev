# Änderungsprotokoll 0.26.0 — „Die kleinen Fehler fallen" — und das Potenzial wird abschaltbar

**Sechs Befunde, eine Messung und eine Funktion · gebaut am 10. September 2026
auf 0.25.4 (`c56df7db`).**

> **DIESE RUNDE IST NOCH NICHT GESCHLOSSEN.** *Gebaut sind BA 1 bis BA 4 und
> BA 6. **BA 5 (Befund 7) steht aus** — er wartet auf die Beobachtung im
> Browser des Betreibers (BA 0), und die ist von außen nicht zu messen.*
>
> **FINGERPRINT DIESER RUNDE: steht aus.** *Er wird am fertigen Stand
> gerechnet, vor dem Einspielen — solange BA 5 fehlt, wäre jede Zahl hier die
> eines Zwischenstands.*
>
> **DIE NUMMER IST DESHALB NOCH NICHT GESETZT:** `package.json` trägt weiter
> 0.25.4, und im CHANGELOG steht noch kein Eintrag. *Beides gehört an das Ende
> der Runde und nicht in ihre Mitte.*

---

## Die Versionsnummer

**0.26.0 ist ein MINOR — Regel 5.1, und das ist die Antwort auf F8.**

**Die sechs Befunde und die Messung wären zusammen ein PATCH:** *sieben
Reparaturen, keine neue Fähigkeit.* **Der Potenzialmodus ist eine FUNKTION** —
die Installation kann danach etwas, was sie vorher nicht konnte —, **und eine
Funktion nimmt eine MINOR-Nummer.**

**`F_ROUTES` bleibt bei 72.** *Der Schalter reist über die vorhandene
Einstellungsroute, wie `categoriesFreeCreate`.* **Das Schema wird nicht
angefasst** — der Schalter ist eine Zeile in der Einstellungstabelle und keine
Spalte an einer Grundtabelle. **Das Austauschformat bleibt bei 15.**

---

## Die Fragetafel — beantwortet vor der ersten Zeile

**Am 10. September 2026 im Gespräch einzeln durchgegangen**, nicht aus der
Vorschlagsspalte übernommen. *Vierte Runde unter der Regel aus Abschnitt 11 des
Projektstands: „ein Vorschlag ist keine Antwort."*

| # | Antwort | |
|---|---|---|
| **F1** | Der Server rechnet und liefert `potentialRating` weiter; nur die Oberfläche zeigt nichts | wie vorgeschlagen |
| **F2** | Die Karte „Potenzial: Kriterien" bleibt, der Schalter steht darin | wie vorgeschlagen |
| **F3** | **Der Schalter gehört dem EIGENTÜMER allein** | **gegen den Vorschlag** |
| **F4** | Die Kopplung `potential_desc → 'untested'` fällt mit, und nur bei ausgeschaltetem Modus | wie vorgeschlagen |
| **F5** | An der Stelle der Kopfzahl steht nichts; die Zeile schließt sich | wie vorgeschlagen |
| **F6** | Die Messung wird gefahren und ist der erste Bauabschnitt | wie vorgeschlagen |
| **F7** | Der `ß`/`ss`-Preis wird bezahlt und ausdrücklich geprüft | wie vorgeschlagen |
| **F8** | 0.26.0 bleibt MINOR | wie vorgeschlagen |

> **EINE ANTWORT FÄLLT GEGEN DEN VORSCHLAG, UND SIE HAT FOLGEN: F3.** *Der
> Vorschlag wollte den Schalter wie `categoriesFreeCreate` behandeln — Admin
> und Eigentümer. Der Betreiber hat entschieden, dass der Modus eine
> **Grundsatzentscheidung der Installation** ist und kein Tagesgeschäft.*
> **Die Ablage ist trotzdem die von `categoriesFreeCreate`** — eine Zeile in
> der Einstellungstabelle, der vorhandene Weg —, **die Klemme nicht:**
> `potentialMode` steht in `OWNER_KEYS`. *Wer die Vorlage ganz abgeschrieben
> hätte, hätte eine Adminklemme gebaut, wo eine Eigentümerklemme stehen soll.*

---

## BA 1 — die fünf Ein- und Zweizeiler

### Befund 1 — nach dem ersten Bild öffnete die Dateiauswahl nicht mehr

**Die Stelle:** `public/app.js`, `uploadFiles()` und das Ablagefeld darüber.

`uploadFiles()` tauschte den Hinweistext über `drop.textContent`. **Das wirft
ALLE Kinder des Labels weg** — den Hinweistext *und das versteckte Dateifeld
darin*. Am Ende kam der Text zurück, **das Feld nicht**; ein Label ohne Feld hat
nichts zu öffnen, und der `onchange` hing an einem Element außerhalb des Baums.

**Strg+V ging die ganze Zeit weiter**, weil der Einfügeweg als Zuhörer am
`document` hängt und das Feld gar nicht braucht — *deshalb ist es nie als Fehler
gemeldet worden, sondern als Eigenart.* **F5 heilte es.**

**Gebaut:** der Hinweistext steht in einem eigenen `<span id="drop-text">`, und
nur dessen Text wandert. **Nicht `innerHTML` neu gesetzt** — dann wäre der
`onchange` wieder weg, nur eine Ebene später.

### Befund 3a — der Eintragstitel brach auf dem Telefon nicht um

**Die Stelle:** `public/app.js`, der Titel des Eintrags.

**Der Auftrag hat das Stilblatt genannt; das war falsch, und die Abweichung
steht hier.** Der Titel war ein `<input>`, **und ein `<input>` bricht nicht um**
— das ist seine Bauart und keine Regel, die sich im Stilblatt ändern ließe. Ein
langer Titel lief rechts aus dem Feld heraus, auf dem Gerät, an dem man ihn am
ehesten sucht.

**Gebaut:** der Titel ist ein `<textarea>` mit `autoGrow()` — *dieselbe
Maschinerie wie an der Beschreibung darunter, sie stand seit langem da.* Die
Eingabetaste beendet ihn weiter und trägt keinen Umbruch ein; **ein eingefügter
Absatz wird beim Speichern zum Leerzeichen, und das Feld zeigt danach, was
gespeichert ist** — sonst stünden zwei Wahrheiten in derselben Zeile.

### Befund 3b — „Mit Fotos (~ 301,5 KB )" trug ein Leerzeichen vor der Klammer

**Die Stellen:** `public/app.js`, die beiden Ausfuhrknöpfe · `public/style.css`,
`.btn`.

`.btn` ist `inline-flex` mit `gap: 7px`. **Text, Zahl und Klammer standen als
DREI Flexkinder nebeneinander**, und der Abstand setzte sich zwischen sie. *Das
Leerzeichen kam aus dem Raster und nicht aus dem Text — wer im Wörterbuch danach
suchte, fand nichts.*

**Gebaut:** ein gemeinsamer Träger je Knopf, **ohne `gap` anzurühren** — der
Abstand gehört den Knöpfen mit Zeichen davor und bleibt ihnen.

> ### UND EIN BEFUND, DEN DER AUFTRAG NICHT KANNTE
>
> **`card.withPhotos` macht seine Klammer gar nicht erst auf.** Beim Umbenennen
> der Bezeichner auf Englisch (0.24.1) hat der Schlüssel den Wert eines
> gleichlautenden Satzes bekommen — **„mit Fotos", ohne die öffnende Klammer**,
> während die drei Geschwister (`card.withoutPhotos`, `card.includeFiles`,
> `card.includeVideos`) sie tragen. **Am Knopf stand seither „mit Fotos
> 301,5 KB )".**
>
> *Der Schlüssel hat genau einen Rufer, und für den ist sein Wert falsch.* **In
> allen drei Sprachen berichtigt.**

### Befund 4 — eine tote Regel im Stilblatt

**Die Stelle:** `public/style.css`, der Erklärkasten.

Die Regel verband `.calc-sum` mit `:first-of-type` und gab den Spans einen
`border-top`. **`:first-of-type` zählt DIV-Geschwister, und das erste `div` im
Raster ist `.calc-row.calc-head`** — die Regel hat **nie** gegriffen. *Der
Strich, den man sieht, kam die ganze Zeit aus dem `border-bottom` der Zeile
darüber; deshalb ist es niemandem aufgefallen.*

> **ABWEICHUNG VOM VORSCHLAG, UND SIE IST BEGRÜNDET.** *Der Auftrag schlug
> `:not(.calc-sum) + .calc-sum` vor — „ohne eine Klasse ins Markup zu legen".*
> **Das hätte den Strich VERDOPPELT:** die Zeile darüber zieht ihren
> `border-bottom` weiter, ein `border-top` an der Summenzeile käme **dazu**, und
> aus einem Strich würden zwei Pixel in zwei Farben. *Wegnehmen ließe sich der
> untere nur mit `:has()`, und gegen `:has()` hat dieses Stilblatt sich schon
> einmal ausdrücklich entschieden (Stolperstein 256).*
>
> **Gebaut ist deshalb der umgekehrte Weg:** die letzte Kriterienzeile trägt die
> Klasse `calc-last` und färbt den Strich, den sie ohnehin zieht, stärker.
> **Ein Strich statt zweier**, und der Kasten sieht aus, wie die tote Regel es
> gemeint hat. **Preis: eine Klasse im Markup** — die der Vorschlag sparen
> wollte.

### Befund 5 — der Hinweis an der Zeitleiste lief am rechten Rand hinaus

**Die Stelle:** `public/style.css`, `.timeline-hint`.

Der Kasten steht mittig über seinem Punkt (`translateX(-50%)`) und trug
`white-space: nowrap`. **Ein langer Eintragstitel machte ihn beliebig breit.**

**Gebaut:** `nowrap` fällt, dafür eine Deckelung an **zwei** Maßen —
`max-width: min(14rem, 46%)`. *`14rem` deckelt ihn in Zeilen, `46%` an der
Achse: der Überhang ist die halbe Kastenbreite, 46% heißt also höchstens 23%
Überhang, auch auf einem schmalen Schirm.* **`overflow-wrap: anywhere` fängt den
einen Fall ab, den der Umbruch sonst nicht kann:** einen Titel aus einem
einzigen langen Wort.

> **DER ANSCHLAG AN DEN RAND DER LEISTE IST NICHT GEBAUT** — er müsste nach dem
> Anhängen messen und `left` nachrechnen und ist teurer als der Befund. *Er
> trifft nur ein schmales Fenster mit Maus; auf dem Finger gibt es den Hinweis
> gar nicht.*

---

## BA 2 — die Sitzungsliste

**Die Stellen:** `public/app.js`, `cardSessions()` und `drawSessions()` ·
`public/style.css`, `#msessions`.

**Die Fußzeile war das letzte Kind IN `#msessions`** (`box.appendChild(foot)`),
und der Deckel dieser Liste rechnete sie mit: *„55.23rem sind zehn
Sitzungszeilen und die Fußzeile: 10 × 72,55 = 725,5, dazu die 102,88 der
`.session-foot`."* **Gemessen auf einem breiten Schirm.** Auf einem schmalen ist
eine Sitzungszeile höher als 72,55 Pixel — dann passten zehn Zeilen samt
Fußzeile nicht mehr darunter, **und heraus fiel die Fußzeile**: der Satz brach
mitten in der Zeile ab, und **der Knopf „Andere Sitzungen beenden" stand gar
nicht mehr da.**

**Gebaut:** die Fußzeile steht als **Geschwister** neben der Liste
(`#msessions-foot` in der Karte). Der Deckel deckelt nur noch Zeilen, und
**die Zahl sagt wieder, was sie meint: 48.37rem sind 725,5 / 15.**

*Der Grund, aus dem 0.17.3 die Fußzeile in den Deckel rechnete — „sonst müsste
man an zehn Sitzungen vorbeirollen, um den Knopf zu sehen" —, fällt damit weg:
außerhalb der rollenden Liste ist er ohne Rollen zu sehen.*

> **UND SIE STEHT AN DIESER EINEN KARTE UND NICHT AN `.manage-list`.** *Die
> sechs anderen Listen haben keine Fußzeile, und eine Regel, die nirgends sonst
> greift, gehört nicht in die gemeinsame.* **Das war die eine offene Frage des
> Auftrags, und sie ist so entschieden.**

---

## BA 3 — Befund 3c, der Gewichtssatz

**Die Stelle:** `public/app.js`, die Karte „Bewertung: Kriterien".

**Die zweite Hälfte war schon geklemmt** — wer kein Admin ist, las „Eingestellt
wird es vom Admin." **Die erste stand für jeden da:** *„Das Gewicht bestimmt,
wie stark ein Kriterium in den Durchschnitt eingeht; bei 1 zählen alle gleich."*

> **DER BETREIBER HAT GEGEN DEN VORSCHLAG ENTSCHIEDEN.** *Der Vorschlag wollte
> den ganzen Satz hinter die Adminklemme legen (Sprachregel S5).* **Die erste
> Hälfte bleibt für jeden stehen:** der Benutzer sieht die Marke `×1` an jedem
> Kriterium und den Durchschnitt darunter — **der Satz erklärt eine ANZEIGE, die
> vor ihm steht, und keinen Knopf, den er nicht hat.**

**S5 greift damit auf die zweite Hälfte, und die sagte das Falsche.** Sie sagt
jetzt, was der Benutzer wirklich wissen muss: **dass die Gewichte eine
Systemvorgabe sind.**

**`card.setByAdmin` fällt namentlich weg, in allen drei Sprachdateien;
`card.weightSystemDefault` steht an seiner Stelle, an derselben Zeile in allen
dreien.** *Die Zahl der Sätze bleibt, wo sie war.*

---

## BA 4 — Befund 6, `ß` und `ss`

**Die Stelle:** `db.js`, `searchFold()`.

| im Bestand steht | gesucht wird | vorher | jetzt |
|---|---|---|---|
| `Stichsäge übergroß` | `übergroß` | Treffer | Treffer |
| `Stichsäge übergroß` | `ÜBERGROSS` | **kein Treffer** | **Treffer** |
| `Grüße` | `GRÜSSE` | **kein Treffer** | **Treffer** |
| `Grüße` | `GRÜßE` | Treffer | Treffer |

**Der Grund war nie Nachlässigkeit, sondern Unicode:** `'ÜBERGROSS'
.toLowerCase()` ist `'übergross'` mit zwei s, im Bestand steht `übergroß`, **und
ein kleines `ß`, das aus `SS` zurückkäme, gibt es nicht.**

**Gebaut:** `ß` fällt auf `ss`, **nach `toLowerCase()`** — dort ist das große `ẞ`
(U+1E9E) schon ein kleines `ß` und fällt mit.

> **DER PREIS IST BEZAHLT (F7) UND WIRD AUSDRÜCKLICH GEPRÜFT:**
> `searchFold('Masse') === searchFold('Maße')`. *Für eine SUCHE ist das die
> richtige Seite des Irrtums — wer sucht, will lieber eine Zeile zu viel sehen
> als eine zu wenig. Der Vergleich der Namen ist eine andere Funktion und bleibt
> es.*

> ### UND EIN ZWEITER BEFUND DABEI, DEN DER AUFTRAG NICHT KANNTE
>
> **`snippet()` in `server.js` verglich die LÄNGE** des zeichenweise gefalteten
> Textes mit der des rohen und suchte bei Ungleichheit **gar nicht** — dann
> stand der Anfang des Textes da statt der Fundstelle. *Das ging, solange nichts
> die Länge änderte.*
>
> **`ß` → `ss` ändert sie.** Ohne Eingriff hätte **jeder deutsche Text mit `ß`**
> seinen Ausschnitt verloren — kein falscher Ausschnitt, aber ein schlechterer,
> und zwar in der Sprache, in der die meisten Einträge stehen.
>
> **Statt des Vergleichs steht dort jetzt eine Rückabbildung:** zu jeder Stelle
> des gefalteten Textes die Stelle im rohen, gezählt in UTF-16-Einheiten, weil
> `slice()` das auch tut. *Sie trägt auch den Fall, den der Vergleich bisher nur
> ABGEFANGEN hat (`İ`).*

---

## BA 5 — Befund 7: **steht aus**

**Er wartet auf BA 0, und BA 0 ist eine Beobachtung im Browser des Betreibers:**
F12 → Netzwerk-Reiter, **„Cache deaktivieren" AUS**, von einem Eintrag zurück in
die Übersicht, und bei den Bild-Abrufen ablesen —

| steht dort … | dann |
|---|---|
| **eine echte Zeit** | der Zwischenspeicher greift nicht — **das wäre der eigentliche Fehler**, und er ist zu suchen |
| **„(disk cache)" / „(memory cache)"** | die Übertragung ist es nicht — dann bleibt der Neuaufbau, und **(a)** ist die ganze Antwort |

*Der Auftrag nennt sie ausdrücklich als ersten Bauabschnitt; ohne sie ist die
Ursache nicht bewiesen, und je nach Antwort ist die Reparatur eine ganz andere.*
**Von außen ist sie nicht zu messen.**

---

## BA 6 — der Potenzialmodus wird abschaltbar

> **DER BETREIBER IM WORTLAUT, 9. September 2026:** *„#Potenzial kriterien Modus
> durch Admin+Admin(Eigentümer) ein und ausschaltbar machen. Wenn ‚aus' ist,
> dann darf die Box im Eintragsdetails gar nicht zu sehen sein und auch das
> Sortierfilter dafür darf nicht zu sehen sein. Ebenso wenn Potenzial
> Bewertungen schon vorhanden sind dürfen die auch nicht im Overview angezeigt
> werden und muss ausgeblendet werden."*

### Am Server

**`potentialMode()`** — abgeleitet beim Lesen wie die beiden Anlegen-Schalter,
**mit derselben Vorgabe: wer nichts eingestellt hat, hat ihn AN.** *Eine
Installation, die nach der Hebung plötzlich ihre Potenzialsterne nicht mehr
zeigte, sähe aus, als hätte sie etwas verloren — die Sterne stehen ja noch da.*

**Er bekommt einen eigenen Namen und nicht `freeCreate('potentialMode')`:**
*`freeCreate` heißt „darf jeder anlegen", und das ist eine andere Frage.*

**`potentialMode` steht in `OWNER_KEYS`** — das ist die Antwort auf F3, und die
Schranke am Kopf der Route weist einen Admin ab, bevor eine Zeile fällt. *Keine
zweite Prüfung im Rumpf: eine Rechtefrage an zwei Orten läuft auseinander.*

**Der Server rechnet weiter (F1).** `potentialRating` steht in jeder Antwort,
auch bei ausgeschaltetem Modus.

### Die fünf Stellen in der Oberfläche

| wo | was verschwindet |
|---|---|
| **Eintrag** | der Sternkasten — **gar nicht erst gezeichnet**, nicht `[hidden]`. *Eingeklappt hieße sichtbar, und ein Klick ließe Sterne vergeben — genau diesen Fehler hat 0.22.1 am Bewertungskasten repariert. Was im Baum steht, findet früher oder später jemand.* |
| **Sortierung** | die `<optgroup>` mit `potential_desc` / `potential_asc` |
| **Kopplung** | `potential_desc → 'untested'` fällt mit **(F4)**, und **nur** bei ausgeschaltetem Modus. *Sie könnte sonst noch aus einer GESPEICHERTEN Ansicht heraus greifen und den Statusfilter stellen, ohne dass jemand etwas ausgewählt hätte.* |
| **Übersicht** | die Kopfzahl **◆** — und an ihrer Stelle steht **nichts (F5)**, die Zeile schließt sich. *Auch dann, wenn schon Potenzialbewertungen in der Datenbank stehen.* Die Bewertung **★** eines getesteten Eintrags bleibt. |
| **Systembereich** | **nichts (F2)** — die Karte bleibt und trägt den Schalter; die Kriterienliste wird gedämpft und sagt, warum |

**Die Kriterienliste bleibt bedienbar.** *Wer sie beim Wiedereinschalten
vorfinden soll, muss sie vorher pflegen dürfen.* **Gedämpft und nicht gesperrt:**
ein `disabled` wäre eine Behauptung, die der Server nicht deckt.

**Der Schalter ist für den Admin sichtbar und nur für den Eigentümer bedienbar**
(`disabled` und ein Satz daneben, damit die Sperre nicht wie ein Fehler
aussieht). **Ein gewöhnlicher Benutzer sieht ihn gar nicht** — Sprachregel S5.

**`createToggle()` bekommt ein freiwilliges `after`.** *Die drei älteren Schalter
ändern eine Regel und sonst nichts Sichtbares; dieser ändert die Karte, in der
er steht.*

### Die Sprachdateien

**Vier Sätze je Datei kommen dazu** — 1223 → 1227, flach 1303 → 1307:
`card.potentialModeHint`, `card.potentialModeLabel`, `card.potentialModeOff`,
`card.potentialModeOwner`. *Der letzte ist der Preis der Antwort auf F3.*

**Dazu die Umbenennung aus BA 3** — `card.setByAdmin` fällt,
`card.weightSystemDefault` kommt; die Zahl bleibt davon unberührt.

---

## Der Prüfstand

**6358 → 6409 Zusagen.** *51 neue.*

**Sechs Zusagen sind MITGEGANGEN, statt gelöscht zu werden** (Stolperstein 201):

| Zusage | vorher | jetzt |
|---|---|---|
| Der Prüflauf | „läuft bei push und bei pull\_request" | „läuft nur bei Push auf `main`" |
| Der Beipack 0.25.0 | „die Bedingung für Weg B steht da" | „… ist weg — auch als Kommentar" |
| Der Beipack 0.25.0 | „hängt an Push UND Anfrage" | „hängt an genau EINEM Ereignis" |
| Die Sitzungsliste | `max-height: 55.23rem` | `48.37rem` — und rechnet die Fußzeile nicht mehr mit |
| Der Titel | „ist ein `INPUT`" | „ist ein `TEXTAREA`" |
| Die Faltung | „deutscher Bestand ändert sich um kein Zeichen" | „ändert nur sein `ß` — der Umlaut bleibt" |

**Sechzehn neue Rückbauten: 795 bis 810.** *Nummeriert fortlaufend ab 795, wie
der Auftrag es verlangt.*

> **DER LEHRREICHSTE IST 796.** *Der Versuch des Betreibers vom 10. September,
> 14:09 Uhr, hatte die Weg-B-Bedingung mit `###` **auskommentiert** — und die
> alte Zusage „die Bedingung steht da" blieb **grün**: sie fand ihren Suchtext
> im Kommentar. Eine Zusage, die eine tote Regel nicht von einer lebenden
> unterscheidet, bewacht nichts.* **Die neue liest den vollen Text und fällt
> genau darüber.**

> **UND DER SCHLIMMSTE FALL IST 810.** *Der Server verschweigt, wie der Schalter
> steht; die Oberfläche fällt auf ihre Vorgabe „an" zurück, und der ganze Modus
> ist wieder da, obwohl er in der Datenbank auf aus steht — still, ohne Fehler,
> ohne Meldung.*

---

## Der Augenschein — er steht aus

**Vier Befunde sind am Bildschirm entstanden und gehören am Bildschirm
nachgesehen**, im echten Browser und nicht im Nachbau:

| | Lage |
|---|---|
| **2** | zehn Sitzungen, **schmaler** Schirm — steht der Knopf da? |
| **3a** | ein langer Eintragstitel, Telefonbreite — bricht er um? |
| **3b** | „Mit Fotos (~301,5 KB)" — klebt die Klammer? |
| **5** | ein Punkt am **rechten** Ende der Zeitleiste, überfahren — bleibt der Kasten drin? |
| **Modus** | aus und wieder ein, in **allen drei Sprachen** — bleibt an keiner Stelle etwas stehen? |

> **DER PRÜFSTAND PRÜFT DIE REGEL UND NICHT DIE LAGE**, wo es um das Stilblatt
> geht: der Nachbau hat keine Layoutrechnung, `getBoundingClientRect()` gibt
> dort Nullen. *Dieselbe Wahl wie in 0.25.3.*

---

## Im Beipack — der Prüfstand hängt nur noch an `main`

**Entschieden vom Betreiber am 10. September 2026, vor dem ersten
Bauabschnitt.** `.github/workflows/pruefstand.yml` hängt an **einem** Ereignis:
Push auf `main`. **Weg B aus 0.25.0 ist damit zurückgenommen** — bei einem
einzigen Ereignis hat die Bedingung am Auftrag nichts mehr zu entscheiden, und
sie ist gefallen. *Nicht auskommentiert, sondern weg.*

**Der Preis steht in der Datei selbst und ist genannt, nicht eingehandelt:** ein
Zweig wird **nicht mehr geprüft, bevor er in `main` steht**, und eine Anfrage aus
einem fremden Abzug bekommt **gar keinen** Lauf. *Wer einen Stand vorher geprüft
sehen will, fährt `npm test` örtlich.*

---

## Was ausdrücklich NICHT gebaut wird

| | warum |
|---|---|
| **Der Anschlag der Zeitleiste am Rand** | *teurer als der Befund; eine Deckelung genügt* |
| **`potentialRating` aus den Antworten nehmen** | **F1 sagt nein.** *Ausschalten ist Verbergen* |
| **Die vergebenen Potenzialsterne löschen** | **niemals beim Ausschalten** |
| **`(c)` aus Befund 7 — weniger als fünf Abrufe** | *nach der Messung der kleinste Gewinn: die fünf zusammen sind 28 ms.* **Es steht hier, damit niemand es für vergessen hält** |
| **Die Sprachdurchsicht** | *sie ist 0.31.0* |

---

## Die Papiere — was noch aussteht

| Datei | Stand |
|---|---|
| `Doku/Aenderungsprotokoll_0.26.0.md` | **dieses Papier** |
| `Doku/Auftrag_0.26.0.md` | **beantwortet und nachgezogen** |
| `Doku/Fahrplan.md` | der Beipack steht darin; **die Zeile 0.26.0 wird erst durchgestrichen, wenn BA 5 gebaut ist** |
| `Doku/Projektstand_Kriterion_0_26_0.md` | **steht aus** — `git mv`, Revision 78 |
| `Doku/Fehler_und_Ideen.md` | **steht aus** — die sechs Zeilen fallen heraus, wenn alle sechs gebaut sind |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | **steht aus** — die Nummer gehört an das Ende der Runde |
| `README.md` | **zu entscheiden** — ob der Potenzialmodus dort erklärt gehört |
