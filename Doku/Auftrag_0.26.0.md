# Auftrag 0.26.0 — „Die kleinen Fehler fallen" — und das Potenzial wird abschaltbar

**Sechs Befunde, eine Messung und eine Funktion · geschrieben am 10. September
2026 · gebaut auf 0.25.4.**

---

## Was in dieser Runde passiert

**Sechs kleine Befunde liegen seit dem 8. September 2026 entschieden im
Fahrplan und werden gebaut.** *Keiner ist eine Idee; jeder ist gemeldet oder
beim Durchsehen gefunden, und jeder hat eine Stelle im Quelltext.* **Zwei davon
sind je eine Zeile, zwei je zwei, einer hat einen ausdrücklich genannten
Preis.**

**Einer von ihnen wird nicht gebaut, sondern zuerst GEMESSEN.** *Die Übersicht
braucht beim Betreten rund eine Sekunde; woher sie kommt, ist nicht bewiesen —
und je nach Antwort ist die Reparatur eine ganz andere.*

**Und die Runde trägt eine Funktion**, und die ist der Grund für die
MINOR-Nummer:

> **DER BETREIBER IM WORTLAUT, 9. September 2026:** *„#Potenzial kriterien
> Modus durch Admin+Admin(Eigentümer) ein und ausschaltbar machen. Wenn ‚aus'
> ist, dann darf die Box im Eintragsdetails gar nicht zu sehen sein und auch
> das Sortierfilter dafür darf nicht zu sehen sein. Ebenso wenn Potenzial
> Bewertungen schon vorhanden sind dürfen die auch nicht im Overview angezeigt
> werden und muss ausgeblendet werden."*
>
> **Und er sagt dazu, dass er es schon beim Bau von 0.21.0 gemeint hat.**

---

## Der Fingerprint des Vorgängers

| Quelle | Wert |
|---|---|
| **Am gebauten Stand gerechnet, vor dem Einspielen** *(10. September 2026)* | **`c56df7db`** |
| **Am abgelegten Stand nachgerechnet** *(ein Server aus `git archive HEAD`, 10. September 2026)* | **`c56df7db`** — *derselbe Wert* |
| Aus der laufenden Installation gemeldet | **steht aus** — *0.25.4 ist noch nicht eingespielt* |

> **ZWEI QUELLEN, EIN WERT.** *Die dritte Zeile ist keine Formsache: erst die
> laufende Installation beweist, dass das Eingespielte dasselbe ist wie das
> Gebaute — so ist Stolperstein 158 gefunden worden (eine Datei zu viel auf dem
> Wirt).* **Wird 0.25.4 vor dem Start dieser Runde eingespielt, gehört der
> gemeldete Wert hier hinein**, bevor die erste Zeile fällt.

**Der Vorgänger im Überblick:** 0.25.4 · **6358 Prüfungen** · **785
Rückbauten** · `F_ROUTES` = **72** · Austauschformat `EXCHANGE_FORMAT` = **15**
*(`server.js:5932`)*.

---

## Die Fragetafel — vor der ersten Zeile zu beantworten

> **DIE SPALTE „VORSCHLAG VON CLAUDE" IST EIN VORSCHLAG UND KEINE ANTWORT.**
> *Gebaut wird erst, wenn jede Frage beantwortet und in diesem Papier
> eingetragen ist* (Projektstand, Abschnitt 11).

| # | Frage | Vorschlag von Claude | Antwort |
|---|---|---|---|
| **F1** | **Was macht der Server mit `potentialRating`, wenn der Modus aus ist?** Ganz weglassen wäre sauber, trifft aber Export, Vergleich und Einzelansicht mit — und ein Export, dem ein Feld fehlt, ist beim Wiedereinschalten nicht mehr derselbe | **Der Server rechnet und liefert weiter; nur die Oberfläche zeigt nichts.** *Ausschalten ist Verbergen und nicht Löschen — dieselbe Zusage wie bei den Sternen. Ein Export bleibt damit vollständig, und wer wieder einschaltet, findet seinen Bestand vor.* | |
| **F2** | **Bleibt die Karte „Potenzial: Kriterien" im Systembereich stehen, wenn der Modus aus ist?** | **Sie bleibt, und der Schalter steht darin.** *Eine Karte, die verschwindet, nimmt den Ort mit, an dem man den Modus wieder einschaltet. Die Kriterienliste darin wird gedämpft und trägt einen Satz: „Der Modus ist aus — die Kriterien bleiben erhalten."* | |
| **F3** | **Wem gehört der Schalter — Admin oder Eigentümer?** Der Betreiber schreibt *„Admin+Admin(Eigentümer)"* | **Beiden, wie `categoriesFreeCreate`.** *Er erscheint an allen Einträgen aller Benutzer und gehört deshalb dem Admin und nicht in `user_settings` (Projektstand, Abschnitt 11).* | |
| **F4** | **Die Sortierung `potential_desc` schaltet heute den Statusfilter auf „nicht getestet" um** (`public/app.js:2287`). Fällt die Gruppe weg — fällt die Kopplung mit? | **Ja, im selben Zug.** *Eine Kopplung auf eine Sortierung, die es nicht gibt, ist toter Code, und Regel „was fällt, fällt namentlich" gilt auch für ihn.* | |
| **F5** | **Was steht in der Übersicht an der Stelle der Kopfzahl ◆, wenn der Modus aus ist?** | **Nichts — die Zeile schließt sich.** *Kein Platzhalter, kein Strich: eine leere Stelle, an der einmal etwas stand, sieht aus wie ein Fehler.* | |
| **F6** | **Die Messung an der Übersicht** *(Befund 7)* **braucht eine Beobachtung im Browser des Betreibers.** Wird sie gemacht, bevor gebaut wird? | **Ja, und sie ist der erste Bauabschnitt.** *Ohne sie ist die Ursache nicht bewiesen; mit ihr steht in zehn Minuten fest, ob (a) die ganze Antwort ist.* **Sie kostet den Betreiber F12 und einen Klick.** | |
| **F7** | **`ß`/`ss`** *(Befund 6)* **hat einen Preis: „Masse" findet danach auch „Maße".** Wird er bezahlt? | **Ja.** *Für eine SUCHE ist das die richtige Seite des Irrtums — wer sucht, will lieber eine Zeile zu viel sehen als eine zu wenig. Für einen VERGLEICH wäre es falsch, und der Vergleich der Namen ist eine andere Funktion und bleibt es.* | |
| **F8** | **Die Nummer: 0.26.0 als MINOR — richtig?** | **Ja.** *Die sechs Befunde und die Messung wären zusammen ein PATCH. Der Potenzialmodus ist eine **Funktion** und nimmt nach Regel 5.1 eine MINOR-Nummer; die Reparaturen fahren mit.* | |

---

## Die Befunde

### Befund 1 — nach dem ersten Bild öffnet die Dateiauswahl nicht mehr

**Die Stelle:** `public/app.js`, `uploadFiles()` — und `public/app.js:5092`.

```js
const drop = document.getElementById('drop');
const old = drop.textContent;
drop.textContent = t('entry.uploading');
```

```html
<label class="drop" id="drop"><input type="file" id="file" accept="…" multiple>
  Hinweistext</label>
```

**`textContent` zu setzen wirft ALLE Kinder des Labels weg** — den Hinweistext
*und das Eingabefeld*. Am Ende setzt `drop.textContent = old` nur den Text
zurück; **das Feld kommt nicht wieder.** Ein Label ohne Feld hat nichts zu
öffnen, und der `onchange`, der an das alte Feld gebunden war, hängt an einem
Element, das nicht mehr im Baum steht.

**Daraus folgt, warum Strg+V weiter geht:** der Einfügeweg hängt als Zuhörer am
`document` und braucht das Feld überhaupt nicht. **F5 heilt es** — und deshalb
ist es nie als Fehler gemeldet worden, sondern als Eigenart.

> **Vorschlag von Claude:** den Hinweistext in ein eigenes `<span>` legen und
> nur dessen Text tauschen. **Nicht** `innerHTML` neu setzen — dann wäre der
> `onchange` wieder weg, nur eine Ebene später.

**Schwere:** der Weg „mehrere Bilder nacheinander per Datei einfügen" ist ganz
hin. *Der Fehler ist so alt wie die Fortschrittsmeldung im Ablagefeld.*

---

### Befund 2 — die Sitzungsliste läuft unten aus dem Kasten

**Die Stellen:** `public/style.css:1972` und `public/app.js`, `drawSessions()`.

```css
#msessions { max-height: 55.23rem; }
```

**Der Deckel rechnet die Fußzeile MIT ein** — der Kommentar daneben sagt es:
*„55.23rem SIND ZEHN SITZUNGSZEILEN UND DIE FUSSZEILE: 10 × 72,55 = 725,5, dazu
die 102,88 der `.session-foot`, die INNERHALB der Liste steht"*. **Gemessen
wurde auf einem breiten Schirm.** Auf einem schmalen ist eine Sitzungszeile
höher als 72,55 Pixel, und dann passen zehn Zeilen samt Fußzeile nicht mehr
unter den Deckel. **Die Fußzeile ist die, die herausfällt** — sie ist das
letzte Kind **in** der rollenden Liste (`box.appendChild(foot)`).

**Was zu sehen ist:** der Satz *„Außer dieser gibt es 9 weitere Sitzungen…"*
bricht mitten in der Zeile ab, und **der Knopf „Andere Sitzungen beenden" steht
gar nicht mehr da** — erreichbar nur über einen Bildlauf, den von außen niemand
als solchen erkennt.

**Der Betreiber:** *„die zu vielen Einträge in ein Scrollbalken unterbringen,
und der Kopf sowie Fuß darf nicht aus dem Kasten heraus gehen."*

> **Vorschlag von Claude:** die Fußzeile **aus** `#msessions` heraus und als
> Geschwister daneben in die Karte. Dann deckelt der Deckel nur noch die
> Zeilen, die Liste rollt, und Kopf wie Fuß stehen immer da. **Das Maß wird
> damit wieder das, was es sagt** — zehn Zeilen, ohne die Fußzeile
> hineinzurechnen —, und der Grund, aus dem sie 0.17.3 hineingerechnet wurde,
> fällt weg: außerhalb der rollenden Liste ist der Knopf ohne Rollen zu sehen.

*Zu klären ist nur, ob dieselbe Bauform für die anderen sechs `.manage-list`
gilt — die haben heute keine Fußzeile, und eine Regel, die nirgends sonst
greift, gehört an die eine Liste und nicht in die gemeinsame.*

---

### Befund 3 — drei kleine Anzeigefehler aus dem Augenschein zu 0.22.0

**Aufgefallen am 4. September 2026** beim Durchsehen von 64 Bildschirmfotos je
Rolle und je Schirm. *Alle drei sind älter als jene Runde; sie sind in 0.21.1
ausdrücklich als „Zeilen fürs Sammelblatt" abgelegt worden.*

| | was | wo |
|---|---|---|
| **3a** | **Der Eintragstitel wird auf dem Telefon rechts abgeschnitten statt umgebrochen.** *Ein langer Titel ist damit auf dem Gerät, an dem man ihn am ehesten sucht, nicht zu lesen* | `public/style.css` |
| **3b** | **„Mit Fotos (~ 301,5 KB )" trägt ein Leerzeichen vor der Klammer** — es kommt vom `gap: 7px` des `.btn` (`public/style.css:548`), nicht aus dem Text: der Knopf trägt ein `<span>` mit der Größe, und `inline-flex` setzt den Abstand davor. *Die Klammer sieht dadurch aus, als fehlte etwas darin* | `public/app.js:11898` und `:11899` (`#ex-yes`, `#ex-no`), `public/style.css:547` |
| **3c** | **Die Karte „Bewertung: Kriterien" erklärt dem Benutzer das Gewicht, das er nicht stellen kann.** *Der Satz liest sich als Erklärung der Marke `×1`, die er sieht — und beschreibt einen Knopf, den nur der Admin hat* | `public/app.js:8735` |

**3c ist Sprachregel S5** — *„ein Text, den nur die Rolle darüber braucht,
gehört hinter deren Klemme"* (Stolperstein 315) — **an einer Stelle, die 0.22.0
übersehen hat.**

> **NACHGESEHEN AM 10. SEPTEMBER 2026, UND DIE HÄLFTE STEHT SCHON RICHTIG.**
> Der zweite Teil des Satzes ist bereits geklemmt: `ADMIN ?
> t('card.weightRangeHint') : t('card.setByAdmin')` — wer kein Admin ist,
> liest *„Eingestellt wird es vom Admin."* **Der ERSTE Teil ist es nicht:**
> *„Das **Gewicht** bestimmt, wie stark ein Kriterium in den Durchschnitt
> eingeht; bei 1 zählen alle gleich."* steht für jeden da.
> *Der Auftrag nennt das, damit die Runde nicht eine Klemme baut, die schon
> steht — und damit sie entscheidet, ob die Erklärung ganz fällt oder ob der
> Benutzer sie behalten soll, weil er die Marke `×1` ja sieht.*

---

### Befund 4 — eine tote Regel im Stilblatt

**Die Stelle:** `public/style.css:2521`.

```css
.calc-sum:first-of-type > span { border-top: 1px solid var(--line); }
```

**Die Regel soll der ersten Summenzeile des Erklärkastens einen Strich darüber
geben.** `:first-of-type` zählt aber **DIV-Geschwister**, und das erste `div`
im Raster ist `.calc-row.calc-head`. **Die Regel greift nie**; der Strich
entsteht heute aus dem `border-bottom` der Zeile darüber, und niemand hat es
gemerkt.

> **DIE STELLE HEISST NICHT MEHR SO, WIE DER BEFUND SIE NENNT.** Sammelblatt
> und Fahrplan schreiben `.rz-summe:first-of-type` — *das war der Name vor
> 0.24.1 („Der Quelltext spricht Englisch").* **Die Regel ist dieselbe
> geblieben, tot ist sie auch.** *Nachgesehen am 10. September 2026; die
> Papiere sind entsprechend nachzuziehen.*

> **Vorschlag von Claude:** `:not(.calc-sum) + .calc-sum` statt
> `:first-of-type` — das trifft genau die erste Summenzeile, ohne eine Klasse
> ins Markup zu legen. **Wer den Strich nicht will, löscht die Regel** und
> schreibt hin, warum. *Eine Regel, die nichts tut, ist keine dritte
> Möglichkeit.*

---

### Befund 5 — der Hinweis an der Zeitleiste läuft am rechten Rand hinaus

**Die Stellen:** `public/style.css:2576` und `public/app.js`, `showHint()`.

```css
.timeline-hint {
  position: absolute; bottom: 100%; transform: translateX(-50%);
  … white-space: nowrap;
}
```

```js
h.style.left = point.style.left;
```

**Der Kasten steht mittig über seinem Punkt und bricht nicht um.** Am rechten
Ende der Achse ragt er hinaus. **Er erscheint nur beim Überfahren** — auf dem
Finger gibt es ihn gar nicht, dort öffnet die Berührung gleich den Eintrag.
*Es trifft also nur ein schmales Fenster mit Maus.*

> **Vorschlag von Claude:** eine Deckelung der Breite und Umbruch statt
> `nowrap`; ein Anschlag an den Rand der Leiste wäre die vollständige, aber
> teurere Lösung. **Erst messen, wie breit der Kasten überhaupt wird** — der
> Titel eines Eintrags kann beliebig lang sein.

---

### Befund 6 — die Suche findet „übergroß" nicht, wenn man „ÜBERGROSS" eingibt

**Die Stelle:** `db.js:840`, `searchFold()`.

| im Bestand steht | gesucht wird | heute |
|---|---|---|
| `Stichsäge übergroß` | `übergroß` | **Treffer** |
| `Stichsäge übergroß` | `ÜBERGROSS` | **kein Treffer** |
| `Grüße` | `GRÜSSE` | **kein Treffer** |
| `Grüße` | `GRÜßE` | Treffer |

**Der Grund ist keine Nachlässigkeit, sondern Unicode:** `'ÜBERGROSS'
.toLowerCase()` ist `'übergross'` — mit zwei s. Im Bestand steht `übergroß` mit
`ß`. **Die Faltung ist richtig; es gibt nur kein Kleinbuchstaben-`ß`, das aus
`SS` zurückkäme.**

> **Vorschlag von Claude:** `ß` und `ss` in der Faltung gleichsetzen — auf
> beiden Seiten, in derselben Funktion, in der die Groß- und Kleinschreibung
> schon fällt.
>
> **DER PREIS STEHT SOFORT DANEBEN UND GEHÖRT GENANNT:** damit findet „Masse"
> auch „Maße", „Busse" auch „Buße". *Das ist kein Nebeneffekt, sondern dieselbe
> Gleichsetzung, in der anderen Richtung gelesen.* **Für eine SUCHE ist das die
> richtige Seite des Irrtums. Für einen VERGLEICH wäre es falsch** — die
> Faltung der Suche und der Vergleich der Namen sind zwei Funktionen und müssen
> es bleiben; heute sind sie es auch.

> **WARUM ER NICHT SCHON IN 0.24.4 GEFALLEN IST — und das ist entschieden
> worden.** *Jene Runde hat die Faltung angefasst (Befund B8) und `ß`/`ss`
> ausdrücklich ausgenommen: es betrifft Deutsch und nicht Türkisch, und eine
> Runde, die schon zwei Fehler an derselben Funktion repariert, nimmt keinen
> dritten mit.* **Er ist seither billiger:** die Faltung steht an EINER Stelle,
> und beide Hälften der Suche rufen sie.

---

### Befund 7 — die Übersicht braucht beim Betreten rund eine Sekunde

> **DIESER BEFUND WIRD ZUERST GEMESSEN UND DANN GEBAUT.** *„Eine Sekunde fühlt
> sich langsam an" ist keine Zahl.*

**Gemeldet aus dem Betrieb, 5. September 2026**, am Telefon über Mobilfunk
gegen einen entfernten Wirt: *„overview → Einstellung → overview → Eintrag →
overview. All das hat beim Lademoment zu overview eine Zeit von ca. 1 Sekunde.
Lademoment von overview weg ist blitzschnell."* — **und ausdrücklich auch dann,
wenn man sich in Sekunden durchklickt**, jeder Zwischenspeicher also noch warm
ist.

| Ansicht | Abrufe | Bilder | Gefühl |
|---|---|---|---|
| Einstellungen | **zwölf**, darunter `/api/stats` | **0** | blitzschnell |
| Eintrag | drei | 1 | blitzschnell |
| **Übersicht** | fünf | **13 × 45 kB = 585 kB** | **≈ 1 Sekunde** |

**Zwölf Abrufe sind schnell, fünf sind langsam.** *Die Zahl der Abrufe erklärt
es nicht, und die Leitung allein auch nicht.* **Die einzige Größe, die dem
Symptom folgt, ist die Bildmenge.**

#### Was bereits ausgeschlossen ist — gemessen, nicht vermutet

**ES IST NICHT DER SERVER.** Nachgebaut wurde eine verschlüsselte Datenbank mit
den Kennzahlen des Betreibers (13 Einträge, 89 Fotos, 333,5 MB), der echte
Server gestartet, jede Route einzeln gemessen: **die fünf aus `loadAll()`
zusammen ≈ 28 ms kalt, ≈ 9 kB.** *Der Server trägt im schlimmsten Fall rund
120 ms bei.*

**ES IST AUCH NICHT `length(thumb)`** *(0,8 ms gegen 2,0 ms — die Zusage von
0.19.5 hält)* **und keine zu große Kachel** *(512 px kurze Kante gegen 540
Gerätepunkte auf dem Telefon — eher knapp als üppig)*.

#### Bauabschnitt 0 — die eine Beobachtung, die noch fehlt

**Sie passiert im Browser des Betreibers und ist von außen nicht messbar:** im
Netzwerk-Reiter (F12), **„Cache deaktivieren" AUS**, von einem Eintrag zurück
in die Übersicht, und bei den Bild-Abrufen ablesen:

| steht dort … | dann |
|---|---|
| **eine echte Zeit** | der Zwischenspeicher greift nicht — **das wäre der eigentliche Fehler**, und er ist zu suchen. Die Kachel trägt `Cache-Control: private, max-age=86400`; der Browser dürfte gar nicht erst fragen |
| **„(disk cache)" / „(memory cache)"** | die Übertragung ist es nicht — dann bleibt der Neuaufbau, und **(a)** unten ist die ganze Antwort |

#### Was danach gebaut wird

* **(a) Nicht leeren, bevor Ersatz da ist.** `renderList()` (`public/app.js:3121`)
  setzt in der Zeile darauf `app.innerHTML = „Lädt …"` und wartet **erst danach**
  auf `loadAll()`. **Der
  Bildschirm ist leer, bevor überhaupt gefragt wird.** *Kleinster Eingriff,
  größte Wirkung auf das Gefühl — und er hilft in jedem Fall, gleich was die
  Beobachtung sagt.* **Er ändert keine einzige Zahl.**
* **(b) Sofort aus `state.alle` zeichnen, dann nachladen** — *nur, wenn die
  Beobachtung die Übertragung entlastet.* **Hat einen Preis:** hat inzwischen
  jemand anders etwas angelegt, steht kurz der alte Stand da. *Das ist mit der
  Glocke abzugleichen und keine Kleinigkeit.*
* **(c) Weniger als fünf Abrufe** — *nach der Messung der kleinste Gewinn von
  den dreien; die fünf zusammen sind 28 ms.* **Vorschlag: nicht bauen**, und
  hinschreiben, warum.

---

## Die Funktion — der Potenzialmodus wird abschaltbar

**Ein Schalter, und er wirkt an fünf Stellen.** *Das ist der ganze Punkt: ein
abgeschalteter Modus, der an einer Stelle doch noch durchscheint, ist kein
abgeschalteter Modus.*

| wo | was verschwindet | Stelle |
|---|---|---|
| **Eintrag** | der Sternkasten „Potenzial" — **gar nicht erst gezeichnet**, nicht nur eingeklappt | `public/app.js:5186`, dazu `BLOCKS` (1272), `BLOCKS_ALWAYS_OPEN` (1280), `blockHint()` (1379), `blockShow()` (1427) |
| **Sortierung** | die `<optgroup>` mit `potential_desc` / `potential_asc` | `public/app.js:3765` |
| **Kopplung** | dass `potential_desc` den Statusfilter auf „nicht getestet" stellt *(F4)* | `public/app.js:2287` |
| **Übersicht** | die Kopfzahl **◆** an einem ungetesteten Eintrag — *auch dann, wenn schon Potenzialbewertungen in der Datenbank stehen* | `public/app.js:4211` |
| **Systembereich** | *offen (F2)* — ob die Karte „Potenzial: Kriterien" mitverschwindet oder als Einstellort stehen bleibt | `public/app.js:8717` |

**Der Schalter gehört dem Admin und in die Datenbank** — dieselbe Bauform wie
`categoriesFreeCreate` und `tagsFreeCreate`, und aus demselben Grund
*(Projektstand, Abschnitt 11: eine Einstellung, die an allen Einträgen aller
Benutzer erscheint, gehört dem Admin und nicht in `user_settings`)*.

**Die Vorlagen stehen da und sind zu lesen, bevor eine Zeile fällt:**
`public/app.js:8669` *(`createToggle('cat-free', 'categoriesFreeCreate', …)`)*,
`server.js:2527`, `server.js:2795`, `server.js:2835`, `server.js:3376`.

**DIE VERGEBENEN STERNE BLEIBEN STEHEN.** *Ausschalten ist Verbergen und nicht
Löschen: wer ihn wieder einschaltet, findet seinen Bestand vor.* **Was der
Server mit `potentialRating` macht, ist F1** — *er rechnet es heute an zwei
Stellen (`server.js:4083`, `server.js:4574`).*

---

## Die Bauabschnitte — und was dabei WEGFÄLLT

| | was | was fällt |
|---|---|---|
| **BA 0** | **Die Beobachtung zu Befund 7** *(F6)* — der Betreiber liest im Netzwerk-Reiter ab | *nichts — es wird gemessen, nicht gebaut* |
| **BA 1** | **Die fünf Ein- und Zweizeiler:** Befund 1, 3a, 3b, 4 und 5 | **`.calc-sum:first-of-type`** fällt namentlich *(Befund 4)*; `white-space: nowrap` an `.timeline-hint` fällt *(Befund 5)* |
| **BA 2** | **Die Sitzungsliste** *(Befund 2)* — die Fußzeile wandert aus der rollenden Liste | *keine Zeile fällt; der Kommentar an `#msessions` wird neu gerechnet und trägt die neue Zahl mit ihrer Herleitung* |
| **BA 3** | **Befund 3c** — der Gewichtssatz hinter die Adminklemme | **ein Satz der Sprachdateien** wird verschoben, keiner fällt. *Fällt doch einer, steht er hier NAMENTLICH, in allen drei Dateien* |
| **BA 4** | **Befund 6** — `ß`/`ss` in `searchFold()` | *nichts fällt; eine Zeile kommt hinzu* |
| **BA 5** | **Befund 7** — `renderList()` leert nicht mehr ins Blaue *(a)*, alles Weitere nach BA 0 | *nichts fällt* |
| **BA 6** | **Der Potenzialmodus** — Schalter am Server, Schalter in der Karte, fünf Stellen in der Oberfläche | **Die Kopplung `potential_desc → 'untested'` fällt** *(F4)*; **`F_ROUTES` bleibt bei 72** — der Schalter reist über die vorhandene Einstellungsroute, wie `categoriesFreeCreate`. *Kommt doch ein Weg hinzu, steht die neue Zahl im Änderungsprotokoll* |

> **DAS SCHEMA WIRD NICHT ANGEFASST.** *Der Schalter ist eine Zeile in der
> Einstellungstabelle und keine Spalte an einer Grundtabelle.* **Und das
> Austauschformat bleibt bei 15** — der Export trägt `potentialRating` weiter,
> wie F1 es vorschlägt. *Die letzte Runde, die das Schema anfassen darf, ist
> 0.29.0; danach kommt der Bruch.*

---

## Die Nummer und ihre Begründung

**0.26.0 ist ein MINOR — Regel 5.1.**

**Die sechs Befunde und die Messung wären zusammen ein PATCH:** *sieben
Reparaturen, keine neue Fähigkeit — die Installation könnte danach nichts, was
sie vorher nicht konnte.* **Der Potenzialmodus ist eine FUNKTION** — die Installation kann
danach etwas, was sie vorher nicht konnte —, **und eine Funktion nimmt eine
MINOR-Nummer.** *Die Reparaturen fahren mit; deshalb heißt die Runde nach
beidem.*

> **DER BETREIBER HAT DIE FUNKTION AUCH FÜR 0.24.6 ANGEBOTEN** (*„das auch in
> 0.24.6 oder zusammen mit den anderen in 0.25.0"*). **Sie steht hier, weil die
> Nummer es verlangt** — 0.24.6 war eine Reparatur und musste eine PATCH
> bleiben.

**Der Fahrplan rückt nicht.** *0.27.0 bis 0.35.0 stehen, wo sie stehen; 0.32.0
bleibt frei, der Bruch bleibt auf 0.33.0.*

---

## Der Prüfstand — was er halten muss

**Jede Zusage benannt, jede neue mit GEFAHRENER Gegenprobe, fortlaufend
nummeriert ab 795.** *Ein STUMM ist ein Fund und kein Versehen.*

| Befund | Zusage | Gegenprobe zielt auf |
|---|---|---|
| **1** | Nach zwei Uploads hintereinander steht das Eingabefeld noch im Baum — **und sein `onchange` hängt daran** | den Text wieder direkt ins Label setzen |
| **2** | Die Fußzeile ist **kein** Kind der rollenden Liste | `box.appendChild(foot)` zurück |
| **3a/3b** | Die zwei Stilblattregeln stehen da | je eine |
| **3c** | Der Gewichtssatz steht hinter der Adminklemme | die Klemme heraus |
| **4** | `.calc-sum:first-of-type` steht **nirgends** mehr im Stilblatt | die tote Regel zurück |
| **5** | `.timeline-hint` trägt kein `nowrap` und eine Deckelung | `nowrap` zurück |
| **6** | `searchFold('ÜBERGROSS')` und `searchFold('übergroß')` sind **gleich** — **und `searchFold('Masse') === searchFold('Maße')`**, ausdrücklich als Preis geprüft | die Gleichsetzung heraus |
| **7 (a)** | `renderList()` leert erst, wenn geladen ist | die Reihenfolge zurück |
| **Modus** | **fünf Stellen**, je eine Zusage: mit Schalter da, ohne Schalter weg. **Dazu: die Sterne stehen nach dem Aus- und Wiedereinschalten noch in der Datenbank** | je eine — *und eine, die den Schalter am SERVER umgeht und prüft, ob die Oberfläche trotzdem dicht ist* |

> **DER PRÜFSTAND PRÜFT DIE REGEL UND NICHT DIE LAGE**, wo es um das Stilblatt
> geht: der Nachbau hat keine Layoutrechnung, `getBoundingClientRect()` gibt
> dort Nullen. *Dieselbe Wahl wie in 0.25.3.* **Die Messungen gehören als
> Augenschein ins Änderungsprotokoll.**

> **EIN MOCK ANTWORTET WIE DER ECHTE SERVER** (Stolperstein 90). *Der Schalter
> muss im Nachbau genauso in der Antwort stehen wie im Betrieb — sonst prüft
> die Runde ihre eigene Vereinfachung.*

---

## Der Augenschein

**Befund 2, 3a, 3b und 5 sind am Bildschirm entstanden und gehören am
Bildschirm nachgesehen** — im echten Browser, nicht im Nachbau:

| | Lage |
|---|---|
| **2** | zehn Sitzungen, **schmaler** Schirm — steht der Knopf da? |
| **3a** | ein langer Eintragstitel, Telefonbreite — bricht er um? |
| **3b** | „Mit Fotos (~ 301,5 KB)" — klebt die Klammer? |
| **5** | ein Punkt am **rechten** Ende der Zeitleiste, überfahren — bleibt der Kasten drin? |
| **Modus** | aus und wieder ein, in **allen drei Sprachen** — bleibt an keiner Stelle etwas stehen? |

---

## Was ausdrücklich NICHT gebaut wird

| | warum |
|---|---|
| **Die Sprachdurchsicht** *(Punkt 24 im Sammelblatt)* | **sie ist 0.31.0** und braucht eine eigene Fragetafel mit rund fünfzehn Entscheidungen, die nur der Betreiber treffen kann |
| **Die drei mitgelieferten Kriterien auf Deutsch** *(Punkt 23)* | **eine eigene kleine Runde** — die Grundausstattung müsste dorthin wandern, wo die Sprachen liegen. *Keine Zeile, und sie gehört nicht neben sechs Anzeigefehler* |
| **`potentialRating` aus den Antworten des Servers nehmen** | **Vorschlag F1 sagt nein.** *Ausschalten ist Verbergen; ein Export, dem ein Feld fehlt, ist beim Wiedereinschalten nicht mehr derselbe* |
| **Die vergebenen Potenzialsterne löschen** | **niemals beim Ausschalten.** *Wer wieder einschaltet, findet seinen Bestand vor* |
| **`(c)` aus Befund 7 — weniger als fünf Abrufe** | *nach der Messung der kleinste Gewinn: die fünf zusammen sind 28 ms.* **Es steht hier, damit niemand es für vergessen hält** |
| **Der Anschlag der Zeitleiste am Rand** *(die vollständige Lösung zu Befund 5)* | *teurer als der Befund; eine Deckelung genügt.* **Wird sie es nicht, steht es im Änderungsprotokoll** |

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.26.0.md` | **neu** |
| `Doku/Projektstand_Kriterion_0_26_0.md` | `git mv`, **Revision 78** — Abschnitt 2, die Fingerprinttafel, die große Tafel; **und der Potenzialmodus in Abschnitt 3** (die Einstellungstabelle) |
| `Doku/Fahrplan.md` | die Zeile 0.26.0 wird durchgestrichen; **die Ausarbeitungen zu 0.26.0 wandern nicht mit** — sie sind Herleitung |
| `Doku/Fehler_und_Ideen.md` | **die sechs Zeilen fallen heraus** (Regel 2: was gebaut ist, steht nicht mehr hier) — *namentlich: die tote Stilblattregel, der Zeitleistenhinweis, die drei Anzeigefehler, die zwei Fehler aus dem Rundlauf mit 0.24.2, `ß`/`ss`, die Übersichtssekunde* |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
| `README.md` | **nur wenn der Potenzialmodus dort erklärt gehört** — zu entscheiden beim Bauen |

---

## WIE DER NÄCHSTE AUFTRAG AUSZUSEHEN HAT

> **Ab 0.25.0 trägt jeder Auftrag diesen Abschnitt.** *Entschieden vom
> Betreiber am 9. September 2026: „das muss immer in jedem Auftrag drin
> stehen … um dir beim Bauen Arbeit zu sparen, ohne dass wir unsicherer oder
> schlechter werden."* **Er beschreibt die FORM, nicht den Inhalt** — der
> Inhalt kommt aus dem Rundlauf.

**Am Kopf**

1. **Ein Absatz „was in dieser Runde passiert"**, mit dem Wortlaut des
   Betreibers, wenn der Befund aus dem Feld kommt.
2. **Der Fingerprint des Vorgängers**, aus **zwei** Quellen bestätigt: aus der
   laufenden Installation gemeldet **und** am gemergten Stand nachgerechnet.
   *Fehlt eine der beiden, steht das dort — und zwar als offener Punkt und
   nicht als Fußnote.*
3. **Die Fragetafel** mit einer Spalte „Vorschlag von Claude". **Die Spalte ist
   ein Vorschlag und keine Antwort.** *Gebaut wird erst, wenn jede Frage
   beantwortet und im Papier eingetragen ist* (Abschnitt 11 des Projektstands).

**Im Rumpf**

4. **Der Befund**, in nummerierten Teilen, jeder mit der Stelle im Quelltext
   oder einer **Messung am laufenden Server**. *Vermutungen werden als solche
   benannt.*
5. **Die Bauabschnitte**, und darin ausdrücklich: **was WEGFÄLLT** — Sätze der
   Sprachdateien namentlich, Wege mit ihrer `F_ROUTES`-Zahl, Zusagen des
   Prüfstands mit Begründung.
6. **Die Nummer und ihre Begründung** nach Regel 5.1. *Eine Datenbankstufe oder
   eine Funktion ist mindestens MINOR; eine Reparatur ist PATCH.*

**Am Fuß**

7. **Der Prüfstand:** jede Zusage benannt, jede neue mit **gefahrener**
   Gegenprobe, fortlaufend nummeriert. **Ein STUMM ist ein Fund und kein
   Versehen.**
8. **Der Augenschein**, wenn der Befund am Bildschirm entstanden ist.
9. **Was ausdrücklich NICHT gebaut wird.**
10. **Die Papierliste** — Änderungsprotokoll, Projektstand (`git mv`, Revision),
    Fahrplan, Sammelblatt, CHANGELOG, README, `package.json`,
    `package-lock.json`.
11. **Dieser Abschnitt selbst.**

**Und die stehenden Regeln, die keine Runde neu verhandelt**

* **GITHUB, WEG B.** Ein Lauf je Stand. **Ein Push je Runde**, nicht vier —
  `cancel-in-progress` fängt nur ab, was sich überholt, nicht was nacheinander
  fertig läuft.
* **DER FINGERPRINT WIRD VOR DEM EINSPIELEN GERECHNET** und steht im
  Änderungsprotokoll, damit die Installation sich daran messen kann. *Er deckt
  `node_modules` NICHT ab — eine Hebung von Abhängigkeiten bewegt ihn nicht,
  und das gehört dann ausdrücklich ins CHANGELOG.*
* **KEINE ZWEITE WAHRHEIT.** Eine Aussage, zwei Orte — das ist Stolperstein 47,
  und er hat diese Reihe schon dreimal gekostet. *Zuletzt am 10. September
  2026: die große Tafel des Projektstands trug die geplanten Runden mit
  falschen Nummern ein zweites Mal neben dem Fahrplan.*
* **EIN MOCK ANTWORTET WIE DER ECHTE SERVER** (Stolperstein 90). *Eine
  Vereinfachung im Mock hält genau so lange, wie die Vereinfachung stimmt.*
* **`group()` SETZT EINE ÜBERSCHRIFT UND KEINE KLAMMER.** Eine neue Gruppe
  gehört ans Ende ihres Bereichs, sonst zieht sie fremde Prüfungen unter ihren
  Namen.
* **EIN FREMDER SERVER MUSS NICHT DEN PORT BELEGEN — ER MUSS NUR ANTWORTEN.**
  Jede Prüflage am laufenden Server sieht vorher nach.
* **GEGENPROBEN GEHEN MIT, STATT GELÖSCHT ZU WERDEN** (Stolperstein 201). *Wer
  eine Zeile umbaut, auf die ein Rückbau zielt, richtet den Rückbau auf die
  neue Zeile — er wirft ihn nicht weg.*
* **EINE GEGENPROBE LÄUFT GEGEN `git archive HEAD`.** *Ungespeicherte Arbeit
  sieht sie nicht — erst committen, dann fahren.* **Am 10. September 2026 sind
  drei Rückbauten deshalb als „nicht auswertbar" zurückgekommen.**
