# Änderungsprotokoll 0.37.0 — „Die Kommentare werden verdichtet"

Gebaut am 19. September 2026, auf 0.36.0. MINOR.

Drei Griffe an denselben Dateien, in dieser Reihenfolge: **jede Versionsnummer
als Herkunftsangabe heraus, jeden Verweis auf ein Papier heraus, dann
verdichten.** Die Reihenfolge spart Arbeit — ein Satz, der nur eine Herkunft
trug, fällt in Schritt 1 oder 2 ganz weg.

| | vorher | nachher |
|---|---:|---:|
| Kommentarzeilen in den 24 ausgelieferten Dateien | 6.387 | **5.259** |
| davon die vierzehn Module | 4.328 | **3.933** |
| davon `public/style.css` | 1.574 | **1.187** |
| davon SQL-Kommentare im `SCHEMA`-String von `db.js` | 485 | **139** |
| Versionsnummern als Herkunftsangabe | 770 | **5** |
| Verweise auf ein Papier | 281 | **0** |
| Blöcke über drei Zeilen (14 Module) | 105 | **3** |
| Blöcke über drei Zeilen (`public/style.css`) | 184 | **8** |
| Dateien, die `tools/comments.js` zählt | 35 | **36** |
| Dateien im Nummernwächter | 20 | **23** |
| Wächter über Papierverweise | 0 | **1** |
| Prüfungen | 7.064 | **7.070** |
| Gruppen in der Schlusstafel | 372 | **373** |
| Rückbauten | 1.062 | **1.065** |

> **FINGERPRINT DIESER RUNDE: `144a80c7`** — der Stand davor war `88f9dcfb`.
> Er geht weiter über **19 Dateien**.
>
> Er ändert sich an **jeder** ausgelieferten Datei bis auf `public/favicon.svg`
> und die drei Sprachdateien: die Runde fasst alle an.

**GEFALLEN IST AUSSCHLIESSLICH KOMMENTAR, und das ist gemessen und nicht
behauptet.** Für jede ausgelieferte JavaScript-Datei ist der Text außerhalb der
Kommentare vor und nach der Runde Zeile für Zeile derselbe — verglichen über
`tools/segments.js`, nicht über eine Zeilenzahl. Für `public/style.css` zählt
der Prüfstand die Zeilen, auf denen außerhalb eines Kommentars etwas steht:
**1.638 vorher wie nachher.**

*In `public/app.js` fällt die Zahl der Zeilen, auf denen Code steht, dabei von
7.170 auf 7.166. Der Codetext ist derselbe: an vier Stellen stand ein Kommentar
zwischen zwei Codestücken derselben Zeile und riss sie auseinander.*

**An den ausgelieferten Dateien sind es 1.647 neue und 2.801 entfernte Zeilen**
— gezählt ohne Leerraum (`git diff -w`).

---

## 1. Die Fragetafel, vor der ersten Zeile

Der Auftrag stellt elf Fragen, und alle elf waren vom Betreiber vor dem Bauen
entschieden. Die Runde ist ohne Rückfrage gefahren.

| | Frage | Entscheidung | gebaut |
|---|---|---|---|
| **F1** | Wie heißt die Meldung aus `REQUIRED_COLUMNS` ohne Nummer? | sie nennt den alten Spaltennamen | ja |
| **F2** | Bekommt `public/style.css` ein Ziel für den Anteil? | nein | ja |
| **F3** | Fällt „Befund" auch dort, wo es kein Verweis ist? | nein, nur mit Nummer | ja |
| **F4** | Wird die README umgestellt oder nur gekürzt? | erst lesen, dann entscheiden | ja |
| **F5** | Zählt der Prüfstand mit? | nein, er muss die Nummern nennen dürfen | ja |
| **F6** | Welche Blockzählweise gilt? | jeder Kommentarteil einzeln | ja |
| **F7** | Was wird aus den 21 Nummern in `db.js` und der einen in `auth.js`? | der Spaltenname tritt an die Stelle der Fassung | ja |
| **F8** | Heißt die Latte „null" oder „genau diese"? | genau diese | ja |
| **F9** | Was wird aus den sechs Gleichlautsummen? | den Filter reparieren, die Summen neu | ja |
| **F10** | Gilt die Drei-Zeilen-Regel auch für `public/style.css`? | **ja** | ja |
| **F11** | Welche Dateiliste nimmt der neue Wächter? | alle ausgelieferten, `CHANGELOG.md` aus | ja |

**F10 hat gegen den Vorschlag des Auftrags entschieden** und BA 5 zum größten
Posten der Runde gemacht: 184 Blöcke einzeln lesen und entscheiden.

---

## 2. Der Vorlauf — was vor dem ersten Bauabschnitt lief

**`tools/gleichlaut.js` hat einen richtigen Kommentarfilter bekommen.** Bis
dahin schnitt eine Regex: `/^[ \t]*\/\/.*$/gm` traf keinen nachgestellten
Zeilenkommentar und hätte ein `//` in einem String mitgenommen. Geschnitten
wird jetzt über `tools/segments.js`.

**Die sechs Gleichlautsummen sind einmal neu eingetragen**, der Stand davor
steht im Kommentar daneben. *Belegt ist die Kommentarfestigkeit an einem
gestellten Fall: ein nachgestellter Kommentar entfernt, alle sechs Summen
unverändert.*

> **DAS WAR NÖTIG, WEIL ZUSAGE 5 DES ERSTEN AUFTRAGS NICHT TRUG.** *Die
> Summen hätten sich bei der ersten gefallenen `//`-Zeile bewegt, und fünf
> Prüfungen wären rot geworden.*

---

## 3. Die zehn Bauabschnitte

### BA 8 — `public/index.html` und die drei Dateien ohne Kommentarlast

Vier Herkunftsangaben in Kommentaren. Sie sind gefallen; die fünf betroffenen
Blöcke stehen auf drei Zeilen, ebenso der über `viewport-fit`. **20 Codezeilen
vorher wie nachher.** `.env.example`, `docker-compose.example.yml` und
`Dockerfile` trugen weder Nummer noch Papierverweis.

### BA 3 — Die zwölf kleinen Module

**311 Zeilen weniger allein in `db.js`**, und sie standen als SQL-Kommentar im
`SCHEMA`-String, wo kein Werkzeug sie gemessen hat. Die DDL selbst ist
unverändert — nachgewiesen über einen Vergleich aller `CREATE`- und
Spaltenzeilen.

*Ein fehlplatzierter Kommentar ist dabei an seine Tabelle gerückt:* „Jeder
Benutzer hat seine eigene Zeile je Kriterium" *stand über `criterion_names` und
gehört über `ratings`.*

### BA 4 — Die fünf Stellen, an denen die Regel etwas kostet

Fünf Stellen trugen eine Versionsnummer **als Daten** und nicht als Kommentar.

| Stelle | was daraus wurde |
|---|---|
| `REQUIRED_COLUMNS` (18 Zeilen) | drei Angaben statt vier; die Fassung fällt |
| der Warnkasten | „is missing, and not present as `items.rejected_grund` either" |
| `LAST_MIGRATING_VERSION` | fällt ganz weg; die README nennt die Fassung |
| das `since` der `LEGACY_TABLES` | fällt |
| `auth.js`:430 | „AUTH_RESET is no longer read and has no effect" |

**Der alte Name steht jetzt auch dann da, wenn die alte Spalte fehlt** — „fehlt,
und unter dem alten Namen liegt sie auch nicht" ist die schärfere Auskunft als
„fehlt". *Neun der achtzehn Zeilen tragen einen alten Namen.*

### BA 1 — `server.js`

197 Versionsnummern, 84 Papierverweise. **179 Stellen liefen über einen
Schreiber, der ausschließlich Kommentarteile anfasst; jede einzelne ist
nachgelesen, 22 davon von Hand geschrieben.** Der dritte Griff hat 39 Blöcke
gelesen und entschieden.

1.536 Kommentarzeilen sind 1.447 geworden, **3.805 Codezeilen vorher wie
nachher.**

### BA 2 — `public/app.js`

323 Versionsnummern, 104 Papierverweise, 29 lange Blöcke. 1.857 Kommentarzeilen
sind 1.761 geworden, der Anteil fällt von 20 auf 19 Prozent.

**Stehen bleiben drei Treffer:** zwei SVG-Pfaddaten in `ICON_SYS` und der
Kommentar über dem Rückfall der Abschnittsadressen, dessen Wortlaut
`test/ui_style.js` verlangt.

### BA 5 — `public/style.css`, der größte Posten

174 Versionsnummern, 73 Papierverweise — **und 184 Blöcke über drei Zeilen, 26
davon über acht.** Jeder ist gelesen und entschieden worden.

**Acht bleiben lang, und alle acht tragen eine Tafel gemessener Werte:** die
Stapelordnung, die Kachelmaße in drei Rasterstufen, die Staffel der
Umbruchpunkte, die Kartenbreiten, die fünf Fassungen des Vokabularkastens, die
Zeilenmaße in drei Sprachen, die Kanten zwischen Bildschirmrand und erstem
Buchstaben und die gerechnete Vorschaureihe. **Der längste misst 15 Zeilen.**

*Die Grenze im Prüfstand stand auf dreißig Zeilen je Block. Sie ist durch zwei
Prüfungen ersetzt: genau acht Blöcke über drei Zeilen, der längste höchstens
fünfzehn.*

### BA 6 — README und Handbuch

Drei Papierverweise sind gefallen. **Die sechs Versionsnummern bleiben** — sie
bestimmen eine Handlung, und `test/source.js` verlangt genau diese sechs.

**Das Urteil über die README hat vier Stellen gefunden, an denen sie etwas
beschreibt, das es nicht mehr gibt.** Alle vier sind berichtigt:

1. **Das Datenmodell führte zwölf Tabellen und Spalten unter ihren früheren
   deutschen Namen** — `anfragen`, `zweifaktor`, `sicherheitsprotokoll`,
   `papierkorb`, `gewicht`, `gesetzt_am`, `rejected_grund`, `rejected_von`,
   `vorher`/`nachher`, `eigentuemer`, `geloescht`. *Die Tabellen heißen seit
   0.24.1 englisch; die Anleitung ist nicht mitgezogen.*
2. **Der Warnkasten** — die README sagte an zwei Stellen, er nenne die Fassung.
3. **„Was `usertool.js` sonst kann, steht im Kopf der Datei"** — der Kopf nennt
   die Befehle seit BA 3 nicht mehr, weil `help()` sie ohnehin druckt.
4. **Das Handbuch nannte nur `geloescht-<nummer>`** als gesperrten
   Benutzernamen; gesperrt sind beide Schreibweisen.

**Was bleibt, ist eine Doppelung:** der Abschnitt „Wenn eine Version die
Datenbank anfasst" wiederholt den Kasten am Anfang von „Eine neuere Version
über eine bestehende einspielen". *Sie aufzulösen heißt umstellen, und das ist
nach F4 keine Aufgabe dieser Runde.*

### BA 9 — Der Prüfstand

**Eine Prüfung war falsch gebaut.** `test/source.js`:583 wollte belegen, dass
„Einladungslink" am Bildschirm steht, und las dafür `public/app.js` — wo das
Wort ausschließlich in drei Kommentaren vorkam. Sie war grün, weil ein
Kommentar dastand. Sie fragt jetzt `public/languages/de.json`.

**Der Nummernwächter las drei ausgelieferte Dateien nicht:** `log.js`,
`Dockerfile` und `docker-compose.example.yml`. Sie stehen jetzt mit einer Latte
von null darin.

**Sechs Prüfungen zitieren Kommentartext im Wortlaut**, nicht vier wie der
Auftrag sagte. Alle sechs sind nachgezogen.

### BA 7 — Der dritte Wächter

**„Kein Papierverweis geht mit hinaus"** — über alle 24 ausgelieferten Dateien,
fünfzehn Verweisformen.

> **ER LIEST DEN ROHEN TEXT** und nicht die `COMMENT`-Teile von
> `tools/segments.js`: die SQL-Kommentare im `SCHEMA`-String von `db.js` stehen
> in einer Vorlage, und der Segmentierer hält eine Vorlage für Text. Ohne das
> stünde die Latte auf null, obwohl dort Verweise stehen.

**`CHANGELOG.md` steht nicht in der Liste**, und der Grund steht beim Wächter:
ein Änderungsprotokoll muss die Papiere nennen dürfen, die es fortschreibt.

*Drei Rückbauten belegen ihn — ein Name in einem gewöhnlichen Kommentar, eine
Abkürzung im Stilblatt und derselbe Name in einer SQL-Kommentarzeile des
Schemas.*

### BA 10 — Die Papiere

**`tools/comments.js` zählt das Stilblatt mit** — es stand als einzige
ausgelieferte Datei in keiner Zählung. *Damit schließt Punkt 43 des
Sammelblatts alle drei Schritte statt zwei.*

**Das Stilblatt bekommt keine Quote** (F2): sein Kommentar trägt Kontrastwerte
und Pixelmaße, und eine Quote nähme gemessene Zahlen heraus. Der Prüfstand
nennt seine Zahl eigens; die Fünftel- und die Dreißig-Prozent-Grenze gelten für
die JavaScript-Dateien.

---

## 4. Was die Runde nicht angefasst hat

* **Kein Verhalten.** Die eine Ausnahme ist BA 4, und sie steht oben namentlich.
* **`public/languages/*.json`** — kein Satz am Bildschirm ändert sich.
* **Der Prüfstand wird nicht verdichtet** (F5). Er muss die Nummern nennen
  dürfen, sonst kann er keine bewachen. *`tools/publish.js` liefert ihn zwar
  mit aus — 68 Dateien gehen hinaus, 21 davon sind der Prüfstand —, aber das
  ist nicht der Grund.*
* **Die README wird nicht umgestellt** (F4).

---

## 5. Was offen bleibt

| | was | wo |
|---|---|---|
| **1** | Die Doppelung in der README auflösen | eigene Zeile im Fahrplan |
| **2** | Ob die gemessenen Zahlen des Stilblatts in ein eigenes Papier wandern | Punkt 42, Entscheidung des Betreibers |
| **3** | „Auffangnetz" und „Grundausstattung" sind Abschnittsnamen in `db.js` und stehen in Dutzenden Prüfnamen | eine eigene Umbenennungsrunde |

*Der dritte Punkt ist beim Bauen aufgefallen: `CLAUDE.md` führt beide Wörter
unter „nicht verwenden", und sie stehen als Überschrift in `db.js` und im Namen
von Rückbauten und Prüfgruppen. Sie in dieser Runde zu ersetzen hieße, den
Prüfstand umzubenennen.*
