# Änderungsprotokoll 0.17.4 — „Fordern und nutzen"

**Version 0.17.4 · gebaut am 31. August 2026 · Fingerprint `d3113d62` ·
4811 Prüfungen · 385 Rückbauten in `gegenprobe.js`**

---

**EINE RUNDE, DIE EINEN PUNKT DER VORIGEN ZURÜCKNIMMT.** Gemeldet am 31. August
2026, unmittelbar nach dem Einspielen von 0.17.3 und **mit Bildern vom laufenden
Betrieb**: *„das Einzige, was mir gefällt, ist das mit der Mailkachel — der Rest
ist schlechter geworden."* **Punkt 1 von 0.17.3 war falsch**, und diese Runde
baut an seiner Stelle die Regel, die gemeint war.

> **DIE NUMMER: PATCH.** *Projektstand 5.1: „Dritte Zahl (PATCH) nur für
> abwärtskompatible Fehlerbehebungen."* **Diese Runde bringt keine Funktion** —
> sie nimmt eine Zeile aus dem Stilblatt zurück und setzt drei Maße daneben. Die
> Instanz kann danach nichts, was sie vorher nicht konnte.

> **DIES IST KEINE DATENBANKSTUFE.** Kein Schema, kein Migrationsblock, keine
> neue Formatnummer: es bleibt bei **sieben** markierten Blöcken und beim
> Austauschformat **11**. **Diese Runde fasst nur `public/style.css` an** — kein
> Quelltext auf dem Server, kein Zeichenweg in `public/app.js`.

---

## Inhalt

1. [Was 0.17.3 falsch gemacht hat](#1-was-0173-falsch-gemacht-hat)
2. [Die Regel, die gemeint war](#2-die-regel-die-gemeint-war)
3. [Alle Fälle, und wie sie gemessen dastehen](#3-alle-fälle-und-wie-sie-gemessen-dastehen)
4. [Die drei Maße, die nachgezogen sind](#4-die-drei-maße-die-nachgezogen-sind)
5. [Die Entscheidungen dieser Runde](#5-die-entscheidungen-dieser-runde)
6. [Abweichungen — was nicht baubar war und was bleibt](#6-abweichungen--was-nicht-baubar-war-und-was-bleibt)
7. [Was je Datei geändert wurde](#7-was-je-datei-geändert-wurde)
8. [Der Prüfstand](#8-der-prüfstand)
9. [Gegenproben](#9-gegenproben)
10. [Neue Stolpersteine](#10-neue-stolpersteine)
11. [Die Zahlen](#11-die-zahlen)
12. [Was ausdrücklich nicht passiert ist](#12-was-ausdrücklich-nicht-passiert-ist)
13. [Offen geblieben](#13-offen-geblieben)

---

## 1. Was 0.17.3 falsch gemacht hat

**0.17.3 hat eine Zeile in das Stilblatt gesetzt: `.sys-grid { align-items:
start }`.** Die Begründung stand daneben und las sich schlüssig:

> *„Ein Raster zieht jedes Kind auf die Höhe der höchsten Zelle seiner Reihe.
> Der Leerraum stand deshalb unter dem Inhalt IN der Kachel und nicht in der
> Liste — und genau deshalb hat die Messung zu 0.17.2 ihn nicht gesehen."*

**Der erste Satz stimmt. Der zweite ist falsch, und das war nachprüfbar.**

### Drei Dinge waren falsch, und sie hängen zusammen

**ERSTENS: DER LEERRAUM WAR NICHT DA, WO DER SATZ IHN VERMUTETE.** Nachgemessen
in Chromium bei 1600 × 913 stand unter **keiner** Liste Luft: `Höhe` war gleich
`scrollHeight`, an **allen sieben** Kacheln des Abschnitts „Bestand".
`max-height: max-content` tat genau das, was es sollte — eine Liste mit zwei
Einträgen forderte zwei Zeilen und keine zehn.

**ZWEITENS: DIE GEMELDETEN KACHELN KONNTEN VON DER ZEILE GAR NICHT BETROFFEN
SEIN.** Der Befund kam von „Anfragen" und „Zugänge". **Beide tragen `.breit`,
also `grid-column: 1 / -1`.** Eine solche Kachel steht immer allein in ihrer
Reihe; es gibt keine Nachbarin, an der sie sich strecken könnte. *`align-items`
wirkt zwischen Geschwistern — an einer Kachel ohne Geschwister richtet es
nichts an, weder Gutes noch Schlechtes.*

**DRITTENS: DIE TABELLE UNTER „NACHGEMESSEN IN CHROMIUM" WAR NICHT GEMESSEN.**
Die Zahlen 605 → 186 → 136 sind aus dem Auftrag übernommen worden. *Chromium
stand die ganze Zeit zur Verfügung.* **Das ist der schwerere der drei Fehler:
beim ersten war die Erklärung falsch, beim dritten der Beleg.**

### Was die Zeile stattdessen angerichtet hat

**Sie hat die gleiche Höhe aufgehoben, die vorher da war.** Gemessen bei
1600 × 913, dieselbe Lage vor und nach dem Rückbau:

| Abschnitt | mit `align-items: start` (0.17.3) | ohne (0.17.4) |
|---|---|---|
| **Persönlich** — Zugang / Sitzungen / Darstellung | **1055 / 470 / 389** | **1055 / 1055 / 1055** |
| **Bestand**, sieben Kacheln | **350 / 322 / 667 / 841 / 394 / 909 / 206** | **804 / 804 / 804 · 909 / 909 / 909 · 225** |

**Das ist die Treppe, die der Betreiber am Bild gesehen hat.** *Der Satz „der
Rest ist schlechter geworden" hat eine Zahl: sieben Kacheln, die vorher in drei
Reihen standen, standen danach in sieben Höhen.*

> **DER BEFUND VON 0.17.3 IST DAMIT NICHT ERLEDIGT, SONDERN UNBESTÄTIGT.** *Der
> gemeldete Leerraum ist auf keiner der Messungen dieser Runde
> wiederaufgetaucht.* **Das ist in Abschnitt 13 als offene Frage vermerkt und
> nicht als geschlossene Sache.**

---

## 2. Die Regel, die gemeint war

**Sie steht in zwei Sätzen, und sie ist erst nach vier Anläufen richtig
aufgeschrieben worden:**

> **DIE REIHE** ist so hoch wie ihre höchste **starre** Kachel. Gibt es keine,
> ist sie so hoch wie die größte **Forderung** der dynamischen —
> `min(Einträge, 10)`, beim Sicherheitsprotokoll `min(Einträge, 15)`, mindestens
> eine Zeile.
>
> **DIE LISTE** zeigt, was in ihre Kachel passt, und rollt, wenn nicht alles
> passt.

### Der Satz, an dem es zweimal gescheitert ist

**WAS EINE LISTE FORDERT, IST NICHT, WAS SIE NUTZT.** *Der Deckel begrenzt die
Forderung und nicht die Nutzung.* **Beim ersten Anlauf war der Deckel eine reine
Forderung** — dann bliebe eine Kachel neben einer hohen Nachbarin unten leer.
**Beim zweiten war er eine harte Grenze** — dann zeigte eine Liste nie mehr als
zehn Zeilen, auch wenn Platz für zwanzig da ist. *Der Betreiber hat beides
berichtigt; richtig ist die Unterscheidung.*

### Drei Zeilen im Stilblatt, und jede beantwortet eine andere Frage

| Zeile | Frage | Antwort |
|---|---|---|
| `flex-basis: 27.95rem` | **Was fordere ich?** | Höchstens zehn Zeilen. Mehr verlangt die Liste nie, und deshalb zieht sie die Rasterzeile nie weiter auf. |
| `max-height: max-content` | **Was fordere ich wirklich?** | Nur, was dasteht. Ohne diese Zeile forderte auch eine Liste mit zwei Einträgen ihre zehn. |
| `flex-grow: 1` | **Was nutze ich?** | Alles, was die Kachel hergibt. Steht daneben eine höhere Kachel, zeigt die Liste **mehr** als zehn Zeilen. |

**`min-height: 0` ist die vierte und die, an der es sonst scheitert:** ohne sie
wächst ein Flexkind über seinen Anteil hinaus, statt zu rollen. *Wer nur die
`max-height` streicht, bekommt genau das.*

> **KEINE DIESER VIER ZEILEN IST NEU.** *Sie standen seit 0.17.2 alle so da.*
> **Neu ist, dass `align-items: start` sie nicht mehr aushebelt** — und dass
> jetzt im Stilblatt steht, welche Zeile welche Frage beantwortet. *Der
> Unterschied zwischen fordern und nutzen war die ganze Zeit gebaut und
> nirgends aufgeschrieben.*

---

## 3. Alle Fälle, und wie sie gemessen dastehen

**Der Betreiber hat verlangt, alle Fälle ordentlich durchzugehen.** *Jede Zeile
dieser Tabelle ist in Chromium bei 1600 × 913 an einer echten Instanz gemessen —
nicht gerechnet, nicht übernommen.*

### A — Die dynamische Kachel steht allein in ihrer Reihe

| Lage | Erwartet | Gemessen |
|---|---|---|
| „Zugänge", **7** Einträge | so hoch wie sieben Einträge, rollt nicht | Kachel **589**, Liste **315**, rollt **nein** |
| „Papierkorb", **0** Einträge | **eine** Zeile | Kachel **225**, Liste **42** = eine `.mrow` |
| „Sicherheitsprotokoll", **35** Vorgänge | fünfzehn Zeilen, rollt | Liste **525** = 15 × 35 px, rollt **ja** |
| Protokoll, **0** Vorgänge | **eine** Zeile | Liste **35** = eine `.prot-zeile` |

### B — Mehrere dynamische nebeneinander, keine starre dabei

**Abschnitt „Bestand", Reihe 1: Kategorien, Tags, Bewertungskriterien.**
*Gemessen mit 2 Kategorien, 0 Tags und 50 Kriterien.*

| Kachel | Einträge | Forderung | Liste gemessen | rollt |
|---|---:|---|---:|---|
| Kategorien | 2 | 2 Zeilen | **91** | nein |
| Tags | 0 | 1 Zeile | **42** | nein |
| Bewertungskriterien | 50 | **10** Zeilen (Deckel) | **419** = 10 × 41,92 px | **ja** |

**Die Reihe ist 804 Pixel hoch — die größte Forderung, und die kommt von den
Kriterien.** *Die beiden Nachbarinnen sind ebenso hoch, ihre Listen aber nicht:
`max-height: max-content` hält sie bei 91 und 42.* **Der Rest der Kachel bleibt
leer, und genau das ist die Zusage** — *„bekommt eine dynamische dadurch mehr
Platz, als ihre Liste braucht, bleibt der Rest leer."*

### C — Eine dynamische neben einer starren

**Abschnitt „Persönlich": Zugang (starr, 1055 px), Meine Sitzungen (dynamisch),
Darstellung (starr).**

| Fall | Lage | Erwartet | Gemessen |
|---|---|---|---|
| **C1** | Reihe hat eine starre Kachel | Reihe = Höhe der starren | **1055 / 1055 / 1055** |
| **C2** | Liste hat **mehr** als zehn Einträge (22 Sitzungen) | nutzt **mehr** als den Deckel | Liste **852** px — *der Deckel wäre 419* |
| **C3** | Liste hat **weniger** (2 Sitzungen) | Rest bleibt leer | Liste **267**, Kachel **1055** |

**C2 ist der Fall, an dem die Regel hängt.** *852 Pixel sind mehr als das
Doppelte des Deckels.* **Wäre der Deckel eine `max-height` in Pixeln, stünde
dort 419 und die Liste rollte, obwohl 433 Pixel darunter leer blieben.**

### D — In einem Fenster

**Glockentafel und Grabsteine tragen dieselbe Klasse `.manage-list`, stehen aber
in einem `.modal`.** *Dort gibt es keine Reihe und keine Nachbarin, an der sich
etwas ausrichten könnte, und das Fenster deckelt längst bei `88dvh` mit eigenem
Rollbalken.* **Ein zweiter Deckel darin wäre eine Grenze in einer Grenze** — wer
ein Fenster eigens öffnet, will sehen, was darin steht.

**Gebaut als eine Regel und nicht als zwei Klassen im Markup:**
`.modal .manage-list { flex: 0 1 auto; max-height: none; }` — *die Frage ist
nicht, WELCHE Liste es ist, sondern WO sie steht.*

### E — Auf dem Telefon

**Unverändert.** Dort steht jede Kachel allein in ihrer Zeile, und der Deckel
hängt am Fenstermaß (`62dvh`) statt an einer Zeilenzahl. *Die Regel für die
leere Liste gilt auch dort — sie steht an der Liste und nicht am Umbruchpunkt.*

---

## 4. Die drei Maße, die nachgezogen sind

### 4.1 Das Sicherheitsprotokoll deckelt bei fünfzehn statt zehn

**0.17.3 hat beide Listen auf zehn gesetzt, „damit es eine Regel ist".** *Das
Protokoll hat dabei doppelt verloren: zwei Zeilen weniger UND die schmaleren
Zeilen.* **Gemessen: bei elf Vorgängen rollte es schon** — Deckel 350 px, Inhalt
384.

> **ZWEI ZAHLEN, UND SIE SIND KEINE ZWEITE WAHRHEIT ÜBER DIESELBE SACHE
> (Stolperstein 47).** Eine `.mrow` ist eine **Bedienzeile** mit Knöpfen und
> Auswahlfeldern und misst 41,92 px. Eine `.prot-zeile` ist eine **Textzeile**
> mit Trennlinie und misst 35. *Zwei verschiedene Dinge dürfen zwei Maße haben;
> ein gemeinsames Maß wäre hier keine Regel, sondern ein Fehler an einer der
> beiden.* **Das Protokoll ist außerdem die einzige dieser Listen, die man
> DURCHSIEHT, statt in ihr etwas anzuklicken.**

`.prot-liste` fordert damit **`35rem`** statt `23.3rem` — fünfzehn Zeilen zu
35 px bei Wurzelschrift 15.

### 4.2 Eine leere Liste ist eine Zeile hoch

**Sie fällt nicht mehr auf null zusammen.** *Die Meldung steht in jedem
Zeichenweg als `.hint` schon drin — hier bekommt sie das Maß einer Zeile, ohne
deren Hintergrund und in der gedämpften Farbe: es ist keine Zeile, es ist die
Auskunft, dass keine da ist.*

**EINE REGEL UND NICHT SECHS ZEICHENWEGE:** Kategorien, Tags, Kriterien,
Papierkorb, Zugänge und das Protokoll melden ihre Leere alle so. *Wer eine
siebte Liste dazustellt, bekommt das Maß mit.*

**Zwei Maße auch hier, aus demselben Grund wie oben:** `.manage-list > .hint`
bekommt **2.795rem** und rückt 9 px ein wie eine `.mrow`, `.prot-liste > .hint`
bekommt **2.333rem** und rückt 2 px ein wie eine `.prot-zeile`.

> **`margin: 0` IST KEINE KOSMETIK, SONDERN EIN GEMESSENER FEHLER.** *Das
> Protokoll meldet seine Leere als `<p class="hint">`, die anderen fünf Listen
> als `<span>`.* **Ein `<p>` trägt die Vorgabemarge des Browsers von 1em** —
> gemessen in Chromium 13,05 px oben und unten, die leere Liste stand **68 px**
> hoch statt 35. *Gefunden beim Nachmessen, nicht beim Schreiben.*

### 4.3 Die Listen in einem Fenster tragen den Deckel nicht

*Siehe Abschnitt 3 D.*

---

## 5. Die Entscheidungen dieser Runde

| Frage | Entscheidung | Warum |
|---|---|---|
| **Was ist ein Deckel — Forderung oder Grenze?** | **Forderung.** Er steht in `flex-basis`, nicht in `max-height`. | Eine Grenze klemmt beides: was die Liste fordert UND wie hoch sie werden darf. *Der Unterschied ist die ganze Regel.* |
| **Zehn Zeilen für beide Listen?** | **Nein — zehn für die Bedienlisten, fünfzehn fürs Protokoll.** | Eine `.mrow` und eine `.prot-zeile` sind zwei verschiedene Dinge. *Stolperstein 47 verbietet zwei Zahlen für DIESELBE Sache, nicht zwei Maße für zwei Sachen.* |
| **Wie hoch ist eine leere Liste?** | **Eine Zeile.** | Null wäre stumm. *Der Unterschied zwischen „es liegt nichts vor" und „hier fehlt etwas" muss sichtbar bleiben.* |
| **Die leere Meldung als eigene Klasse im Markup?** | **Nein — als Regel am Elternteil.** | Sechs Zeichenwege müssten sie tragen und ein siebter sie vergessen. *Die Regel greift dort, wo die Liste steht.* |
| **Der Deckel auch in einem Fenster?** | **Nein.** | Dort gibt es keine Reihe, an der sich etwas ausrichten könnte, und das Fenster deckelt schon. |
| **Die Zeile aus 0.17.3 still entfernen?** | **Nein — mit Begründung im Stilblatt, im Prüfstand und im Papier.** | *Eine zurückgenommene Entscheidung, die verschwindet, kommt wieder (Stolperstein 201).* Der Rückbau 369 ist deshalb **umgedreht** und nicht gelöscht. |

---

## 6. Abweichungen — was nicht baubar war und was bleibt

### 6.1 Eine starre Kachel, die NIEDRIGER ist als die Forderung der dynamischen

**Der Betreiber hat für diesen Fall B gewählt: die starre Kachel gewinnt auch
dann, wenn sie niedriger ist.** *Wörtlich: „ist dieser nicht dynamische Kachel
nur hundert Pixel, dann haben wir auch nur hundert Pixel für den dynamischen."*

**DAS IST MIT REINEM CSS-RASTER NICHT BAUBAR, UND DAS GEHÖRT HIERHIN STATT IN
EINE STILLE AUSLASSUNG.** Eine Rasterzeile ist immer mindestens so hoch wie der
höchste Beitrag ihrer Kinder; eine Kachel, die zehn Zeilen fordert, zieht die
Zeile auf. *Um sie zu übergehen, müsste die Höhe der starren Kachel gemessen und
als Zahl an die dynamische zurückgegeben werden — das ist JavaScript, das bei
jeder Größenänderung nachrechnet, und es wäre eine zweite Wahrheit über eine
Höhe, die das Raster schon kennt.*

**DER FALL TRITT IM BESTAND NICHT AUF, und das ist nachgesehen und nicht
vermutet:**

| Reihe | Starre Kacheln | Höchste Forderung einer dynamischen | Wer gewinnt |
|---|---|---|---|
| Persönlich | Zugang **1055**, Darstellung | Sitzungen ≈ **600** | **die starre** |
| Bestand, Reihe 1 | *keine* | Kriterien **804** | Fall B, kein Konflikt |
| Bestand, Reihe 2 | Vokabular / Links / Suchanbieter **909** | *keine dynamische* | — |
| Bestand, Reihe 3 | *keine* | Papierkorb **225** | Fall B, kein Konflikt |
| Zugänge, alle vier | alle `.breit` — jede allein in ihrer Reihe | — | — |

**Käme eine Reihe dazu, in der eine niedrige starre Kachel neben einer langen
Liste steht, stünde die Liste zu hoch da.** *Dann ist der Ort dieser Zeilen der
Punkt, an dem nachgesehen wird — nicht das Stilblatt.*

### 6.2 „Anfragen" bei ausgeschalteter Selbstanmeldung meldet gar nichts

**Die Zusage „jede leere Liste ist eine Zeile hoch" hat eine Ausnahme, und sie
ist gewollt.** Ist die Selbstanmeldung **aus**, bleibt die Liste leer statt eine
Zeile zu melden: *der Zustand steht zwei Zeilen darüber („Selbstanmeldung:
aus") und am Knopf darunter.* **Eine Zeile „zurzeit liegt keine Anfrage vor"
wäre dort eine zweite Auskunft über dieselbe Sache** — und die missverständliche
dazu, denn es liegt nicht keine vor, sondern es kann keine geben.

*Ist die Selbstanmeldung **an** und liegt nichts vor, meldet die Liste ihre
Leere wie alle anderen und ist eine Zeile hoch.*

### 6.3 Der Deckel ist eine Höhe, keine Zahl von Einträgen

**`27.95rem` sind zehn **Standardzeilen** zu 41,92 px.** Eine Liste, deren
Zeilen höher sind, zeigt entsprechend weniger. *Der deutlichste Fall ist „Meine
Sitzungen": eine `.mrow.sitz` ist ein Raster über drei Zeilen — Name, Anmeldezeit,
letzter Zugriff — und misst rund **81 px**, also fast zwei Standardzeilen.*
**Innerhalb des Deckels stünden dort vier Sitzungen, nicht zehn.**

**Angefasst ist das nicht**, und zwar aus zwei Gründen: *erstens* stünde sonst an
jeder Liste eine eigene Zahl — sechs Zahlen für eine Regel; *zweitens* tritt der
Fall gar nicht ein, weil die Kachel daneben („Zugang", 1055 px) der Liste ohnehin
**852 px** gibt. **Gemessen: 22 Sitzungen, davon rund zehn sichtbar.**

---

## 7. Was je Datei geändert wurde

| Datei | Was |
|---|---|
| `public/style.css` | **`align-items: start` an `.sys-grid` entfernt**, mit dem Rücknahmevermerk an seiner Stelle. `.manage-list`: Wert unverändert, der Kommentar darüber neu geschrieben (fordern / wirklich fordern / nutzen). `.prot-liste`: **`23.3rem` → `35rem`**. **Drei neue Regeln**: die leere Meldung (Sammelregel plus je ein eigenes Maß), und die Liste im Fenster. Der Kommentar am Telefonumbruch nachgezogen. |
| `pruefung.js` | Gruppe umbenannt in **„Fordern und nutzen — 0.17.4"**; die Prüfung auf `align-items` **umgedreht**; die Prüfung „ausserhalb jeder Medienabfrage" gestrichen; der Deckel je Liste mit **eigener Zahl** geprüft; **sechs neue Prüfungen** (Nutzung über den Deckel hinaus, die leere Meldung in drei Prüfungen, die Liste im Fenster). Die Rückbauzahl auf **385**. |
| `gegenprobe.js` | Rückbau **369 umgedreht** — er setzt `align-items: start` jetzt wieder, statt es wegzunehmen. **340, 356 und 371** auf `35rem` nachgezogen. **Fünf neue** (389, 390, 391, 392, 393). Zehn Verweise auf den alten Gruppennamen nachgezogen. |
| `Doku/Aenderungsprotokoll_0.17.3.md` | **Berichtigungskasten über Abschnitt 1** — was falsch war, und dass die Tabelle darunter nicht gemessen wurde. *Der Abschnitt selbst bleibt stehen.* |
| `Doku/Aenderungsprotokoll_0.17.4.md` | **NEU** — dieses Papier. |
| `Doku/Projektstand_Kriterion_0_17_4.md` | Umbenannt aus `..._0_17_3.md`; Abschnitte 2, 5.6, 6, 7, 8, 9 und die Fahrplantafel nachgezogen. |
| `Doku/Fehler_und_Ideen.md` | Der Punkt zur Kachelhöhe aus 0.17.3 auf **zurückgenommen und neu gebaut**; der unbestätigte Leerraum als offene Frage. |
| `README.md` | Der Satz zur Listenhöhe im Systembereich nachgezogen. |
| `CHANGELOG.md` | Abschnitt **0.17.4**. |
| `package.json`, `package-lock.json` | Version **0.17.4**. |

---

## 8. Der Prüfstand

**4811 von 4811 grün.** *Vorher 4805.*

| | Prüfungen |
|---|---:|
| 0.17.3 | 4805 |
| **weggefallen** | **−1** *(„Und es steht ausserhalb jeder Medienabfrage" — die Regel, auf die sie zeigte, gibt es nicht mehr)* |
| **neu** | **+7** |
| **0.17.4** | **4811** |

### Die sieben neuen

| Prüfung | Was sie festhält |
|---|---|
| Das Kachelraster streckt seine Kinder wieder | `align-items` steht an `.sys-grid` **gar nicht** — die umgedrehte Prüfung von 0.17.3 |
| `.manage-list` / `.prot-liste` nutzt mehr als seinen Deckel, wenn die Kachel es hergibt | `flex: 1 1` **und** `max-height: max-content` **und** keine Pixelzahl — *zwei Prüfungen, eine je Liste* |
| Die Meldung einer leeren Liste steht auf der Höhe einer Zeile | `display: flex` + `align-items: center` |
| Und sie trägt die Vorgabemarge ihres Absatzes nicht mit | `margin: 0` |
| Eine leere Bedienliste fällt nicht auf null zusammen | **2.795rem**, 9 px Einzug |
| Und ein leeres Protokoll ebenso wenig, nach seinem eigenen Maß | **2.333rem**, 2 px Einzug |
| In einem Fenster trägt die Liste keinen Deckel | `flex: 0 1 auto` + `max-height: none` |

> **DIE WIRKUNG IST NICHT GEPRÜFT, SONDERN GEMESSEN — und das ist keine Lücke,
> sondern die Regel.** *jsdom rechnet keine Lage aus (Stolperstein 223).* **Die
> gemessenen Zahlen stehen deshalb in Abschnitt 3 dieses Papiers und nicht in
> einer Prüfung, die sie nicht messen kann.** *Gemessen wurde mit Chromium über
> das DevTools-Protokoll an einer echten Instanz — kein Werkzeug im Baum, keine
> neue Abhängigkeit.*

---

## 9. Gegenproben

**385 Rückbauten, gefahren wurden die zehn dieser Runde.** *Ein Rückbau, der
keine einzige Prüfung namentlich rot macht, ist ein Fund und kein Erfolg.*

| # | Rückbau | Namentlich rot |
|---|---|---|
| 340 | Die Liste verliert die Zeile, an der es sonst scheitert | „.prot-liste darf dafuer unter seinen Inhalt schrumpfen", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 356 | Das Sicherheitsprotokoll fordert wieder alle seine Zeilen | „.prot-liste fordert seinen Deckel in rem und nicht in Pixeln", „.prot-liste fordert seinen eigenen Deckel", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 369 | Das Kachelraster streckt seine Kinder wieder **nicht** | „Das Kachelraster streckt seine Kinder wieder", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 371 | Das Sicherheitsprotokoll deckelt wieder bei zehn Zeilen | „.prot-liste fordert seinen eigenen Deckel", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 389 | Die leere Bedienliste faellt wieder auf null zusammen | „Eine leere Bedienliste faellt nicht auf null zusammen", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 390 | Die Liste im Fenster bekommt den Deckel wieder | „In einem Fenster traegt die Liste keinen Deckel", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 391 | Die Liste nutzt den Platz der Kachel nicht mehr | 5 Prüfungen, darunter „.manage-list nutzt mehr als seinen Deckel, wenn die Kachel es hergibt" (2 Gruppen) |
| 392 | Das leere Protokoll bekommt das Mass der Bedienzeile | „Und ein leeres Protokoll ebenso wenig, nach seinem eigenen Mass", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |
| 393 | Die leere Meldung traegt die Vorgabemarge wieder mit | „Und sie traegt die Vorgabemarge ihres Absatzes nicht mit", „Jeder Suchtext kommt in seiner Datei genau einmal vor" |

> **DIE ZEILE „Jeder Suchtext kommt in seiner Datei genau einmal vor" IST DIE
> SELBSTPROBE UND KEIN BEFUND.** Sie wird bei **jedem** gefahrenen Rückbau rot,
> denn er hat seinen Suchtext gerade ersetzt; der Leser in `gegenprobe.js`
> rechnet sie deshalb heraus, wenn er „stumm" meldet (Stolperstein 213).

> **RÜCKBAU 369 IST DER, DER UMGEDREHT WURDE — und man sieht es an seinem
> Namen.** *Bis 0.17.3 hieß er „Das Kachelraster streckt seine Kinder wieder"
> und nahm `align-items: start` weg; jetzt heißt er „…wieder **nicht**" und
> setzt die Zeile zurück.* **Die Entscheidung ist zurückgenommen, der Rückbau
> bleibt** — er muss nur in die andere Richtung rot machen (Stolperstein 201).

> **RÜCKBAU 391 IST DER STRENGSTE DIESER RUNDE.** *Er setzt `flex-grow` auf 0
> und trifft damit vier Prüfungen auf einmal — darunter die eine, die den
> Unterschied zwischen fordern und nutzen festhält.* **Genau so soll es sein:
> die Zusage hängt an einer einzigen Ziffer, und wenn die fällt, fällt sie
> laut.**

---

## 10. Neue Stolpersteine

**Fünf, und sie zählen bei 251 weiter** — 250 war vergeben. *Der volle Wortlaut
steht im Projektstand, Abschnitt 6.*

| Nr. | Kernsatz |
|---|---|
| **251** | **Der Stilblattleser im Prüfstand liefert EINE Zeile.** `ohneMedien` presst allen Weißraum auf ein Leerzeichen; ein Zeilenanker (`^` mit `m`) greift darin nie. *Wer eine eigene Regel von einer Sammelregel trennen will, verankert am `}` davor.* |
| **252** | **Eine Zahl aus einem Auftrag ist keine Messung** — auch dann nicht, wenn sie im Papier unter „nachgemessen" steht. *Stolperstein 140 sagt „messen statt annehmen"; er sagt nicht, dass eine übernommene Zahl eine Annahme ist. Sie ist eine.* |
| **253** | **Eine Regel, die zwischen Geschwistern wirkt, kann an einer Kachel nichts anrichten, die allein in ihrer Reihe steht.** `.breit` heißt `grid-column: 1 / -1`; `align-items` erreicht so eine Kachel nie. *Bevor eine Rasterregel als Ursache gilt, gehört nachgesehen, ob die gemeldete Kachel überhaupt eine Nachbarin hat.* |
| **254** | **Was ein Flexkind FORDERT, ist nicht, was es NUTZT.** `flex-basis` ist die Forderung, `flex-grow` die Nutzung, `max-height` klemmt beides. *Ein Deckel in `max-height` nimmt der Kachel die geschenkte Höhe wieder weg — ein Deckel in `flex-basis` nicht.* |
| **255** | **Ein `<p>` trägt die Vorgabemarge des Browsers, ein `<span>` nicht.** Wer dieselbe Meldung in zwei Zeichenwegen unterschiedlich auszeichnet, bekommt zwei Höhen — hier 68 px gegen 35. |

> **252 IST DER SCHWERSTE DIESER RUNDE**, und er steht hier, weil er beim
> Schreiben von 0.17.3 entstanden ist und nicht beim Bauen von 0.17.4. *Ein
> Papier, das „nachgemessen" schreibt, wo nichts gemessen wurde, ist schlimmer
> als eines, das die Zahl weglässt: es beendet die Frage.*

---

## 11. Die Zahlen

| | vorher (0.17.3) | nachher (0.17.4) |
|---|---|---|
| Prüfungen | 4805 | **4811** |
| Rückbauten in `gegenprobe.js` | 380 | **385** |
| Stolpersteine | 250 | **255** |
| Routen (`F_ROUTEN`) | 69 | **69** |
| Zwecke in `BESTAETIGUNG_ZWECKE` | 7 | **7** |
| Karten im Systembereich | 18 in 5 Abschnitten | **18 in 5 Abschnitten** |
| persönliche Schlüssel | 8 | **8** |
| markierte Migrationsblöcke | 7 | **7** |
| Austauschformat | 11 | **11** |
| Abhängigkeiten | 5 + 1 zum Entwickeln | **5 + 1 zum Entwickeln** |
| Versionsnummern in der README | 6 | **6** |
| Fingerprint | `ebd36b66` | **`d3113d62`** |

---

## 12. Was ausdrücklich nicht passiert ist

- **Kein Quelltext außerhalb des Stilblatts.** `public/app.js`, `server.js` und
  alle Module sind unangetastet — *die Zeichenwege liefern schon alles, was die
  Regel braucht.*
- **Keine neue Route.** `F_ROUTEN` bleibt bei **69**.
- **Keine neue Karte, keine Karte weniger.** Achtzehn in fünf Abschnitten.
- **Kein Schema, kein Migrationsblock, keine neue Formatnummer.** Sieben
  markierte Blöcke, Austauschformat **11**.
- **Keine neue Abhängigkeit**, auch nicht zum Messen: Chromium wird über das
  DevTools-Protokoll gefahren, und den WebSocket-Client bringt Node mit. *Das
  Messwerkzeug liegt außerhalb des Baums und wird nicht ausgeliefert.*
- **Kein Rückbau gelöscht.** *369 ist umgedreht, 340, 356 und 371 sind
  mitgegangen (Stolperstein 201).*
- **Der Deckel von zehn Zeilen für die Bedienlisten ist nicht angefasst** — er
  war richtig und bleibt.
- **Punkt 2, 3 und 4 aus 0.17.3 sind nicht angefasst.** *Die Mailkachel, der
  Erklärkasten und der Filterrücksetzer stehen, wie sie stehen.*
- **Keine Tags gesetzt**, kein Tag-Push.

---

## 13. Offen geblieben

**DIESE RUNDE IST IM FELD NOCH NICHT BESTÄTIGT.** *Nach dem Einspielen gehört
ein Blick in Systembereich → Datenbank → Kennzahlen:* steht dort ein anderer
Wert als der Fingerprint oben, liegt auf dem Wirt eine Datei, die kein Commit
trägt (Stolperstein 158).

### Die offene Frage aus 0.17.3

**DER LEERRAUM, DER 0.17.3 AUSGELÖST HAT, IST NICHT REPRODUZIERT.** *Auf keiner
Messung dieser Runde stand unter einer Liste Luft — weder vor noch nach dem
Rückbau.* **Drei Dinge sind zu prüfen, wenn er wieder auftritt:**

1. **Der Fingerprint in Systembereich → Datenbank → Kennzahlen.** Stimmt er
   nicht mit dem des Papiers überein, läuft eine andere Fassung als die
   beschriebene.
2. **Ein harter Neuladen.** Das Stilblatt liegt im Zwischenspeicher des
   Browsers; eine alte Fassung erklärt jeden Befund an einer Höhe.
3. **Die drei Zahlen an der betroffenen Liste** — `flexBasis`, die gemessene
   Höhe und `scrollHeight`. *Sind die letzten beiden gleich, steht keine Luft in
   der Liste, und der Leerraum sitzt woanders (Stolperstein 246).*

### Was diese Runde im Feld belegen soll

1. **Der Abschnitt „Bestand" auf einem breiten Schirm.** *Drei gleich hohe
   Kacheln in Reihe 1, drei in Reihe 2 — keine Treppe.*
2. **Der Abschnitt „Persönlich".** *Die Sitzungsliste steht neben „Zugang" und
   zeigt mehr als zehn Zeilen, ohne dass etwas leer bleibt.*
3. **Das Sicherheitsprotokoll.** *Fünfzehn Zeilen, bevor es rollt.*
4. **Eine leere Liste** — Tags oder Papierkorb. *Eine Zeile hoch, mit ihrer
   Meldung darin.*

### Was aus den Runden davor weiterhin aussteht

*Unverändert; siehe Projektstand, Abschnitt 8.*
