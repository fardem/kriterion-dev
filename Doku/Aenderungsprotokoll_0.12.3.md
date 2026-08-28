# Änderungsprotokoll 0.12.3 — „Der Export sagt Bescheid, und die Anzeige zieht nach"

**Version 0.12.3 · gebaut am 28. August 2026 · Fingerprint `0d04b540` ·
Erste Runde aus dem neuen Fahrplan · KEINE Datenbankstufe, kein
Migrationsblock, keine neue Formatnummer, keine neue Zeile in der `.env`,
keine neue Abhängigkeit**

**Diese Runde hat einen anderen Charakter als die drei davor.** 0.12.0 bis
0.12.2 waren eine Sache mit zwei Nachschlägen. Hier liegen zehn Punkte
nebeneinander, die fast nichts miteinander zu tun haben: **einer ist ein
Fehler, neun sind Anzeige.** Dazu kam ein elfter aus dem Gespräch, während
gebaut wurde — die Beschriftung am zweiten Faktor.

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.3 ist **PATCH**. Die Frage
lautet: *kann die Anlage nach dieser Runde etwas, was sie vorher nicht konnte?*
**Nein.** Der Export exportiert weiterhin; er bricht nur nicht mehr wortlos ab.
Die neun Anzeigepunkte nehmen nichts weg und legen nichts an. Die Kennzahlen
bekommen eine Zahl, die es vorher nicht gab — **das ist eine Anzeige über
vorhandene Daten und keine neue Fähigkeit**; nichts ist danach erreichbar, was
vorher unerreichbar war.

---

## Inhalt

1. [Was vor dem ersten Handgriff geprüft wurde](#1-was-vor-dem-ersten-handgriff-geprüft-wurde)
2. [Punkt 1: der Export sagt seine Größe an](#2-punkt-1-der-export-sagt-seine-größe-an)
3. [Die drei Entscheidungen, die vor dem Bau standen](#3-die-drei-entscheidungen-die-vor-dem-bau-standen)
4. [Punkt 2: die neun Punkte an der Oberfläche](#4-punkt-2-die-neun-punkte-an-der-oberfläche)
5. [Der elfte Punkt: die Beschriftung am zweiten Faktor](#5-der-elfte-punkt-die-beschriftung-am-zweiten-faktor)
6. [Punkt 3: drei Zeilen in die README](#6-punkt-3-drei-zeilen-in-die-readme)
7. [Was gebaut wurde, je Datei](#7-was-gebaut-wurde-je-datei)
8. [Die Messwerte](#8-die-messwerte)
9. [Der Prüfstand](#9-der-prüfstand)
10. [Gegenproben](#10-gegenproben)
11. [Abweichungen vom Auftrag, mit Begründung](#11-abweichungen-vom-auftrag-mit-begründung)
12. [Neue Stolpersteine](#12-neue-stolpersteine)
13. [Was ausdrücklich nicht passiert ist](#13-was-ausdrücklich-nicht-passiert-ist)
14. [Offen geblieben](#14-offen-geblieben)

---

## 1. Was vor dem ersten Handgriff geprüft wurde

**DER FINGERPRINT DES BRANCHES STIMMT.** Der Auftrag nennt `e30a19c1`, das
Änderungsprotokoll 0.12.2 denselben Wert, und der Branch misst ihn ebenfalls —
nachgerechnet über dieselben dreizehn Dateien, die `bildeFingerprint()` liest
(die geladenen Module samt `package.json`, dazu alles unter `public/`).

> **WAS DAMIT NICHT GEPRÜFT IST: die laufende Anlage.** Diese Runde ist ohne
> Zugriff auf den Wirt gebaut worden. Der Wert oben belegt, dass **Quelltext und
> Papier** übereinstimmen — nicht, dass auf dem Server derselbe Dateisatz liegt.
> **Das gehört an der Karte „Kennzahlen" abgelesen und verglichen**, und zwar
> vor dem Einspielen: bei 0.9.1 hat sich dort eine Datei zu viel gezeigt
> (Stolperstein 158), der Server lief einwandfrei, jede Prüfung war grün — und
> trotzdem stand auf dem Wirt ein Stand, den kein Commit hatte.

**DIE BLOB-SUMME IST NICHT GEMESSEN, UND SIE KONNTE ES HIER NICHT SEIN.** Sie
braucht die Datenbank des Betriebs, und die liegt auf dem Wirt. *Der Auftrag
sagt an dieser Stelle selbst, wie sie zu gewinnen ist:* **„sie gehört gebaut und
nicht einmal von Hand ausgerechnet."** Genau das ist Teil (a) — die Zahl steht
ab dieser Version im Systembereich unter **Kennzahlen → „Export, alles"** und
wird dort abgelesen, ohne dass jemand eine Abfrage tippt.

**Was daran hängt:** ob Punkt 1 ein `Fehler` oder eine `Verbesserung` ist.
Liegt die Zahl über 512 MB, war der Export kaputt und niemand hat es bemerkt,
weil ihn niemand gebraucht hat. Liegt sie darunter, war diese Runde Vorsorge.
**Gebaut gehört sie in beiden Fällen**, und deshalb steht die Runde hier
vollständig.

> **DIE SCHÄTZUNG AUS DER DATEIGRÖSSE FÄLLT ZU HOCH AUS, UND ZWAR AUS ZWEI
> GRÜNDEN.** Der Auftrag nennt einen: die Datei trägt Indizes, das
> Sicherheitsprotokoll und freie Seiten aus Gelöschtem. **Der zweite ist beim
> Bauen dazugekommen und wiegt schwerer:** die Vorschaubilder gehen gar nicht
> mit in den Export. `photos.thumb` steht in keiner Exportdatei, `comment_images.thumb`
> ebenso wenig. Die Abfrage im Auftrag zählt beide mit — sie ist die Summe über
> die Blob-Spalten, und das ist etwas anderes als die Summe über das, was
> geschrieben wird. **Gebaut ist deshalb die zweite.** Näheres unter
> [Abweichungen](#11-abweichungen-vom-auftrag-mit-begründung).

> **DIE ZEILE OBEN IST ZULETZT GEBILDET**, nach der letzten Änderung an einer
> ausgelieferten Datei — `package.json` eingeschlossen. Sie geht über **alles**
> in `public/` und nicht über eine Liste erwarteter Namen: **eine Datei zu viel
> bewegt sie genauso wie eine geänderte** (Stolperstein 158). Abgefragt ist sie
> am laufenden Server über `GET /api/stats`, nicht nachgerechnet.
> *`pruefung.js` und `gegenprobe.js` gehen nicht ein — sie werden vom Server nie
> geladen und liegen nicht in `public/`. Der Wert bewegt sich deshalb nicht mehr,
> wenn nur noch am Prüfstand oder an den Papieren gearbeitet wird.*

**DER GIT-TAG SCHEITERT WEITERHIN.** `v0.12.3` ist angelegt und der Push am
28. August 2026 erneut versucht: **`error: RPC failed; HTTP 403`**, dasselbe
Bild wie bei `v0.10.0`, `v0.11.0` und den dreien aus 0.12.x. Branches gehen
durch, Tags nicht. *An der Anlage ändert es nichts; der Vergleichsverweis unten
in `CHANGELOG.md` zeigt ins Leere, solange der Tag fehlt.* Der Hinweis dort ist
nachgezogen.

---

## 2. Punkt 1: der Export sagt seine Größe an

### Was vorher war

`GET /api/export` antwortete mit `res.json(exportUmschlag(items))` — **einem**
JSON-String, in dem jedes Foto, jedes Video und jeder Anhang als Base64 steckt.
Base64 kostet ein Drittel Aufschlag, und Node hält keinen String über rund
512 MB (`MAX_STRING_LENGTH = 536.870.888`). Reißt die Grenze, wirft
`JSON.stringify` mit `RangeError: Invalid string length`; der Wurf fand den
Fehlerbehandler, und der Browser bekam nach zwei Minuten eine **500 ohne
Auskunft** — nachdem der Server den Speicher für den halben Bestand schon
belegt hatte.

**Am Einzelexport gab es diese Klemme längst** (`austauschBytes()` gegen
`AUSTAUSCH_MAX`, seit die Videos da sind). Am vollen Export fehlte sie. *Das ist
die eigentliche Merkwürdigkeit dieses Punktes: der seltenere Weg war
abgesichert, der häufigere nicht.*

### (a) Die Kennzahlen nennen die erwartete Exportgröße

Der Systembereich zeigte bisher die **Dateigröße der Datenbank**
(`fs.statSync(DB_FILE).size` nach einem `wal_checkpoint`). Daneben steht jetzt
eine zweite Zahl — **„Export, alles"**.

**ZWEI FRAGEN, ZWEI ZAHLEN, und sie dürfen auseinanderliegen.** Die eine sagt,
wie viel Platz die Anlage auf der Platte braucht; sie trägt Indizes, das
Protokoll und freie Seiten. Die andere sagt, wie groß die Datei wird, die das
Haus verlässt: Base64 statt Bytes, dafür ohne alles, was nicht mitgeht.
**Dass die erste die zweite überschreiten kann, ist kein Fehler**, und das steht
im Quelltext daneben, damit es niemand als einen liest.

**Und die Zahl kommt aufgeteilt, nicht summiert.** Der Server liefert in
`/api/stats` unter `export` fünf Werte: `umschlag`, `fotos`, `videos`,
`anhaenge`, `kommentarbilder` — dazu `warnAb` und `grenze`. *Das ist zugleich
die Zeile „Anzeige des Speicherverbrauchs" aus Teil II des Sammelblatts:
dieselbe Abfrage, anderer Zweck.* Ohne die Aufteilung könnte die Exportkarte an
keinem ihrer drei Schalter sagen, was er auslöst.

**Kommentarbilder haben dabei ihre erste eigene Zeile bekommen.** Sie liegen als
Blob in derselben Datei wie Fotos und Anhänge, gehen mit dem Dateischalter in
den Export — und fehlten ausgerechnet in der Aufstellung, die erklären soll,
wovon die Datenbank so groß ist.

### (b) Der Hinweis ab einem Schwellwert

Die Exportkarte rechnet jetzt live. **Die Zahlen an den beiden Knöpfen folgen
den Häkchen** — vorher standen dort feste Werte aus dem Aufbau (`stats.photoBytes * 1.34`
und so weiter), jeder für sich gerechnet: wer Dateien und Videos ankreuzte, fand
nirgends, was dabei herauskommt.

Ab **300 MB** steht darunter ein Kasten:

> **Export mit Fotos: rund 2,1 GB.** Eine Exportdatei ist ein einziger Text, und
> der kann nicht größer als 460,8 MB werden — auch ohne Fotos bleiben noch rund
> 640 MB.
> Für eine vollständige Kopie ist die Karte **Sicherung** der richtige Weg: sie
> schreibt den ganzen Bestand und braucht dafür keinen nennenswerten
> Arbeitsspeicher. **Der Knopf bleibt trotzdem** — die Zahl ist eine Schätzung,
> und wer weiß, was er tut, soll es versuchen dürfen.

**„Auch ohne Fotos" ist ein eigener Satz und keine Formulierung.** Bleibt der
Weg ohne Fotos unter der Marke, nennt die Warnung ihn als Ausweg. Reißt er sie
mit, wäre derselbe Satz eine Falschaussage — wer dann zum zweiten Knopf greift,
kommt nicht davon. Beide Lagen stehen im Prüfstand.

**Und beim Import steht der Hinweis vor dem Einlesen.** Dort ist die Größe ja
vorher bekannt, sie steht an der Datei. Vorher las `readAsText()` erst die ganze
Datei in **einen** String — dieselbe Grenze, nur im Browser —, und der Dialog
sagte danach *„Die Datei ließ sich nicht als Export lesen."* **Das ist die
falsche Auskunft:** sie klingt nach einer kaputten Datei; in Wahrheit war sie zu
groß.

### Die Absage steht vor dem Bau

Über `AUSTAUSCH_MAX` sagt die Route jetzt mit einer lesbaren Meldung ab —
**bevor** sie anfängt zu bauen. Kein Speicherbedarf, kein Warten, ein Satz.

**Das ist nicht Teil (c).** Es wird nichts umgebaut, was funktioniert; der
Abbruch bleibt ein Abbruch und bekommt nur seinen Namen. *Ein Knopf, der nach
zwei Minuten mit einem Speicherfehler aufgibt, sieht aus wie ein kaputtes
Programm; er ist aber eine erreichte Grenze — und der Unterschied liegt allein
darin, ob die Anlage es vorher sagt.* Genau das verlangt (b).

**Ein Netz bleibt darunter.** Die Absage rechnet, sie misst nicht. Fällt die
Schätzung zu niedrig aus, wirft `res.json` — Express baut den String **vor** dem
Kopf und vor dem Senden, die Antwort ist an dieser Stelle also noch unberührt
und kann die Absage nachreichen. **Der Dateikopf muss dabei wieder weg**, sonst
lädt der Browser die Fehlermeldung als Exportdatei herunter.

---

## 3. Die drei Entscheidungen, die vor dem Bau standen

**WELCHER SCHWELLWERT? → 300 MB warnen, `AUSTAUSCH_MAX` absagen.** Es sind zwei
Zahlen mit zwei Aufgaben, und sie dürfen deshalb nicht dieselbe sein:

| | Wert | Aufgabe |
|---|---|---|
| `AUSTAUSCH_MAX` | `MAX_STRING_LENGTH × 0,9` ≈ **460,8 MB** | **gemessen** — daran zerbricht der String |
| `AUSTAUSCH_WARN` | **300 MB** | **geschätzt** — davor soll jemand die Sicherung nehmen |

**Die Luft dazwischen ist der Preis der Schätzung.** Sie deckt den Umschlag, die
Base64-Rundung auf ein Vielfaches von vier und den Text, den keine Blob-Spalte
trägt. *Genannt wird in der Meldung die Zahl, bei der es kippt — nicht die, bei
der es unbequem wird:* der Schwellwert steht in keiner Meldung, nur die Grenze.

**WARNEN ODER VERWEIGERN? → Warnen, und den Knopf lassen.** Die Zahl ist eine
Schätzung, und eine Schätzung darf niemandem den Export wegnehmen, dessen Datei
am Ende doch gepasst hätte. Wer die Grenze wirklich reißt, bekommt sie von der
Route gesagt — mit derselben Rechnung, und dort ist sie keine Höflichkeit mehr,
sondern die Feststellung, dass es diese Datei nicht geben kann.

**GILT DAS AUCH BEIM IMPORT? → Ja, und es ist der billigere Fall.** Dort steht
die Größe an der Datei, bevor irgendetwas gelesen wird. Gefragt wird mit
demselben Schwellwert; *dieselbe Physik auf beiden Seiten, dieselbe Zahl.*

---

## 4. Punkt 2: die neun Punkte an der Oberfläche

### 2a — Nur zeichnen, was zu sehen ist

`content-visibility: auto` an der Kachel, mit `contain-intrinsic-size`. **Zwei
Zeilen Stylesheet, kein JavaScript**, keine Änderung an Route, Suche, Filter
oder Sortierung.

**DIE ZAHL IST GEMESSEN UND NICHT GERATEN**, wie der Auftrag es verlangt —
Chromium, 250 Kacheln mit Foto, Tags, Bewertungen und Zeitleiste:

| Schirm | Kachel |
|---|---|
| 390 × 844 | **178 × 305 px** |
| 834 × 1112 | **255 × 374 px** |
| 1440 × 900 | **301 × 399 px** |

Sie sind verschieden, **weil das Bild quadratisch ist**: die Kachelhöhe hängt an
der Spaltenbreite, und die steht in `.grid`. Deshalb bekommt jede der drei
Rasterstufen ihre eigene Zahl — eine einzige für alle wäre auf zwei von drei
Schirmen falsch.

**`auto` vor der Zahl ist der eigentliche Griff.** Der Browser merkt sich die
zuletzt **wirklich gezeichnete** Höhe und nimmt sie danach; die geschätzte gilt
nur bis zum ersten Zeichnen. *Damit gilt „zu klein geschätzt springt der
Rollbalken, zu groß bleibt Leerraum" nur für den ersten Aufbau und nie wieder.*

### 2b — Ein Kasten, eine Farbe

**Farbe sagt die Art, Form sagt die Anpinnung.** Die drei übrigen Kanten nehmen
die Farbe der linken an; bei einer Notiz, die keine eigene Farbe hat, wird der
ganze Rahmen golden.

| | nicht angepinnt | angepinnt |
|---|---|---|
| **Bericht** | dicke orange Linie links | dieselbe, dazu drei dünne **orange** Kanten |
| **Aufgabe** | dicke blaue Linie links | dieselbe, dazu drei dünne **blaue** Kanten |
| **Erledigt** | dicke grüne Linie links | dieselbe, dazu drei dünne **grüne** Kanten |
| **Notiz** | nichts | **alle vier** Kanten dünn in **Gold** |

**Es ändert sich keine einzige Breite.** Würde die linke Kante beim Anpinnen von
3px auf 1px dünn, müsste `padding-left` von 10 auf 12 zurück — sonst begännen die
Zeilen angepinnter und nicht angepinnter Kommentare in derselben Liste auf zwei
verschiedenen Linien (Befund C aus 0.12.0, nur andersherum). *Weil die dicke
Kante bleibt, wird hier nur umgefärbt.*

**Die alte Begründung ist umgeschrieben und nicht gelöscht.** Sie sagte *„zwei
Merkmale, zwei Kanäle, die sich nie ins Gehege kommen"*, und diese Entscheidung
ist zurückgenommen — der Gedanke ist sauber, sein Preis wurde erst dort
sichtbar, wo beide Merkmale zugleich auftreten. **Eine zurückgenommene
Entscheidung mit dem Grund daneben ist mehr wert als eine verschwundene**, und
der Prüfstand hält fest, dass sie dasteht.

**Erkennbar bleibt die Anpinnung an zwei anderen Zeichen:** am 📌 in der
Kopfzeile und daran, dass Angepinntes oben steht. Die Farbe war nie das einzige
Signal, und deshalb kostet der Wechsel nichts.

### 2c — `⌀ 4,2 (3)` am Kriterium

Statt `4,2 · 3`. **Dieselbe Form, die die Kopfzahl darüber schon spricht**
(`⌀ 4,2 gewichtet`); der Mittelpunkt sagte weder das eine noch das andere, er
trennte nur zwei Zahlen, die verschiedene Dinge meinen. Dazu ein `title` im
Klartext — *„Durchschnitt 3,4 aus 5 Stimmen"* —, denn ein Symbol allein liest
kein Vorleseprogramm vor.

### 2d — „offen" in der Kopfzeile der Kommentare

`5 Aufgaben (3 offen, 2 erledigt)` statt `5 Aufgaben (2 Erledigt)`.

**Die Verschachtelung bleibt wahr:** das Erledigte steckt weiterhin *in* den
Aufgaben, sonst schrumpfte die Zahl beim Abhaken. **Die offenen werden ABGEZOGEN
und nicht gezählt** — `aufgaben - fertig` kann von der Summe nicht abweichen,
eine zweite Zählung über `kind = 'task'` schon. **Die Klammer erscheint nur, wenn
überhaupt etwas erledigt ist**, sonst stünde da „5 Aufgaben (5 offen)" — eine
Zahl, die nichts hinzufügt.

### 2e — Ein Sprungknopf `+ Kommentar` im Blockkopf

Er sitzt in genau der Kopfzeile, die 2d anfasst. **Ausdrücklich kein zweites
Formular:** das vorhandene trägt Bilder-Einfügen, Anpinnen, Art-Umschalter und
Mitwachsen, und ein zweites davon wären zwei Wahrheiten über dasselbe Formular.

**Als `button` und nicht als Verweis** — `kopf.onclick` nimmt jeden Klick auf ein
`button` aus, und ohne das klappte der Sprung den Block im selben Atemzug ein.
**Ist der Block zu, wird er zuerst aufgeklappt**, auf demselben Weg wie beim
Klick auf die Kopfzeile: ein Sprung auf ein `display: none` landete irgendwo.

### 2f — „mehr" ans Ende der Tags-Zeile

„mehr"/„weniger" und „zurücksetzen" stehen jetzt am **rechten Ende der Zeile mit
TAGS und Und/Oder**, die ohnehin da und rechts leer ist. Als Geschwister hinter
der Wolke rutschten sie auf eine eigene Zeile und kosteten so viel Platz wie eine
ganze Reihe Tags.

**Sie stehen im Aufbau VOR der Wolke und nicht dahinter.** Die Zeile bricht um,
und die Reihenfolge im Aufbau entscheidet, auf welcher Zeile etwas landet.
Gemessen wird die Wolke trotzdem vorher — `begrenzeWolke()` braucht sie im
Dokument.

**Beide in einem Kasten** und nicht zweimal `margin-left: auto`: zwei Elemente
mit je einer selbsttätigen Außenkante teilen sich den freien Platz und stünden
auseinandergezogen da. **Keine ausgerechnete Breite, nirgends** — die Anlage
stellt die Schrift von 80 bis 120 Prozent, und genau daran hing 0.12.1 schon
einmal (`right: 92px`, Befund A).

> **DER NEBENBEFUND BLEIBT STEHEN, und das ist eine Entscheidung.** Dieselbe
> Tagwolke wird an zwei Stellen verschieden gebaut: auf der Eintragsseite sitzt
> „mehr" in einer eigenen Kopfzeile (`.wolke-kopf`, `space-between`), in der
> Übersicht als Kind der Filterzeile. **Zusammengeführt wird das hier nicht** —
> die beiden Zeilen tragen Verschiedenes (die Filterzeile trägt Und/Oder und
> die Auswahl, die Kopfzeile nur eine Beschriftung), und eine gemeinsame
> Bauform müsste beides können. *Das ist eine eigene Runde und keine
> Beifracht.* Er steht als Zeile in Teil II des Sammelblatts.

### 2g — Das Zeichen vor der Versionszeile

`MARK()` liefert dieselbe durchsichtige Fassung, die auf allen neun
Anmeldeseiten steht — **ein Aufruf und kein zweites Bild** (Stolperstein 145).
`alt=""` steckt in `MARK()`: das Zeichen steht unmittelbar neben dem Namen der
Anlage, und ein Vorleseprogramm sägte ihn sonst zweimal.

**Die Größe steht im Stylesheet und in `em`** — die Zeile läuft auf `0,67rem`,
und die Anlage stellt die Schrift von 80 bis 120 Prozent. Eine feste Pixelzahl
bliebe stehen, während die Schrift daneben mitwüchse. Die Zeile ist dafür auf
Flex umgestellt: `.marke` ist ein Block und säße im Textfluss auf einer eigenen
Zeile.

### 2h — Der Abstand darunter, nur auf der Anmeldeseite

`26px` → `10px`, jeweils plus `env(safe-area-inset-bottom)`.

**Das ist ein Telefonbefund und kein Desktopbefund**, und deshalb fällt er an
`body.anmeldung` und nicht an der Zeile im Allgemeinen: dort drückt der
Flex-Aufbau die Zeile ohnehin ans untere Ende, und die 26 Pixel und der Streifen
für den Home-Indikator kommen obendrauf. **Im angemeldeten Bereich steht die
Zeile hinter dem Inhalt und braucht ihre 26 Pixel** — dort bleibt alles, wie es
war. **Der Streifen bleibt in beiden Fällen:** er ist kein Abstand, sondern die
Fläche, in der das Telefon seinen eigenen Balken zeichnet.

### 2i — Version und Verfahren in den Kennzahlen: **nicht gebaut**

Steht im Fahrplan unter **0.15.0**. *Es ist beim Anfassen der Kennzahlen für
Punkt 1 nicht „gleich mitgenommen" worden.*

---

## 5. Der elfte Punkt: die Beschriftung am zweiten Faktor

**Aus dem Gespräch, während gebaut wurde**, an einem Bildschirmfoto des
Bestätigungsfensters: *„welche APP … warum nicht einfach den 2FA-Code eingeben.
Es geht um das Verfahren an sich, doch nicht ob das eine App ist."*

**Der Einwand trifft, und er trifft härter als er gemeint war.** „Code aus deiner
App" war **zweimal** falsch:

1. **Es fragt nach der Herkunft statt nach der Sache.** Die Beschriftung eines
   Feldes soll sagen, was hineingehört — nicht, woher der Mensch es hat.
2. **Es stimmt für die Hälfte der Fälle nicht.** Dasselbe Feld nimmt auch einen
   **Wiederherstellungscode** entgegen; der Server sieht der Eingabe an, was
   gemeint ist (`istCodeform` gegen `istWiederform`, ein Feld für beide Formen).
   **Ein Wiederherstellungscode kommt von einem Zettel und aus keiner App.**

| | vorher | jetzt |
|---|---|---|
| Bestätigungsfenster | `Code aus deiner App` | **`Code des zweiten Faktors`** |
| Anmeldung, Schritt 2 | `Sechsstelliger Code` | **`Code des zweiten Faktors`** |
| Anmeldung, Zeile darüber | „Noch der Code aus deiner App." | **„Noch der zweite Faktor."** |
| Karte „Zugang" | „…nach dem Code aus deiner App." | **„…nach dem Code des zweiten Faktors."** |

*„Sechsstelliger Code" war aus demselben Grund falsch: der Wiederherstellungscode
hat zehn Zeichen.*

**Und im Bestätigungsfenster steht jetzt auch der zweite Weg.** An der Anmeldung
stand er seit jeher darunter; im Dialog stand er nirgends — wer sein Telefon
nicht zur Hand hatte, sah dort ein Feld, das er nicht füllen konnte.

> **ZWEI STELLEN SPRECHEN WEITERHIN VON DER APP, und das ist richtig so.** Auf
> der Einrichtungsseite (*„den sechsstelligen Code aus der App eintragen"*) hat
> man gerade eben einen QR-Code in eine App gescannt — dort **ist** es die App.
> Und am Wiederherstellungscode (*„ersetzt dabei den Code aus der App"*) ist der
> Gegensatz zur App genau der Punkt. *Der Maßstab ist nicht das Wort, sondern
> ob die Aussage stimmt.*

---

## 6. Punkt 3: drei Zeilen in die README

**Mitgenommen** — sie fassen keinen Quelltext an.

- **CrowdSec über das Zugriffsprotokoll des Proxys.** Die Antworten der
  Anmelderoute sind bereits sauber unterscheidbar: **401** (Name oder Passwort
  falsch), **429** (ausgebremst), **403** (Passwort richtig, Zugang gesperrt).
  Ein Szenario auf `POST /api/login` sperrt die Adresse damit heute, **ohne dass
  an Kriterion eine Zeile geändert wird.**
- **Die Rotation des Containerprotokolls ist Dockers Sache**, nicht Kriterions —
  vier Zeilen `logging: driver: json-file` mit `max-size` und `max-file`.
- **Und der Satz, der dazugehört:** das Sicherheitsprotokoll räumt sich schon
  selbst (`PROTOKOLL_TAGE = 180`, beim Start und beim Öffnen der Karte). *Wer
  dafür eine Rotation sucht, soll sie nicht bauen.*

**Was ausdrücklich nicht mitgeht:** eine eigene Ausgabezeile nach stdout. Sie
steht im Fahrplan unter 0.13.0 und hängt an der richtigen Adressermittlung —
**ohne den Proxy-Punkt sperrte CrowdSec den Proxy statt den Angreifer.**

---

## 7. Was gebaut wurde, je Datei

### `server.js`

| Stelle | Was |
|---|---|
| `AUSTAUSCH_WARN` | neu, `300 MB`, neben `AUSTAUSCH_MAX` — mit dem Absatz, warum es zwei Zahlen sind |
| `austauschTeile(itemId, schalter)` | neu; rechnet je Art und wahlweise über den **ganzen Bestand** (`itemId === null`) |
| `austauschUmschlagBytes(itemId)` | neu; misst den Text, schätzt die Form je Datensatz |
| `austauschBytes(itemId, schalter)` | umgebaut: ruft die beiden und zählt zusammen |
| `GET /api/stats` | `commentImageCount`/`commentImageBytes` und der Block `export` dazu |
| `GET /api/export` | Absage **vor** dem Bau; `try/catch` um `res.json` als Netz, mit `removeHeader` |

**Die Videozeile hat dabei einen stillen Fehler verloren.** `austauschBytes()`
rechnete `length(data) + COALESCE(length(medium), 0)`; geschrieben wird aber
`p.medium || p.thumb`. Bei einem Video ohne `medium` fiel das Standbild aus der
Rechnung. Jetzt steht `COALESCE(length(medium), length(thumb), 0)` — dieselbe
Wahl wie im Quelltext daneben.

### `public/app.js`

| Stelle | Was |
|---|---|
| `exportSumme()` / `exportGesamt()` | neu, an einem Ort — die Karte und die Kennzahlen lesen dieselbe Rechnung |
| Kennzahlenkarte | Zeile „Kommentarbilder", Zeile „Export, alles" |
| Exportkarte | lebende Zahlen an beiden Knöpfen, `#ex-warn` darunter |
| `exportZahlen()` | neu; hängt an den beiden Häkchen und zeichnet die Warnung |
| `importGroesseGeprueft()` | neu; fragt **vor** `readAsText()` |
| `passwortFenster()` | Beschriftung, dazu der Hinweis auf den Wiederherstellungscode |
| `showZweiterFaktor()` | Beschriftung und Unterzeile |
| `zeichneZweifaktor()` | Satz in der Karte „Zugang" |
| `kommentarZahlen()` | `(n offen, m erledigt)` |
| Kriterienzeile | `⌀ x,y (n)` samt `title` |
| Kommentar-Blockkopf | `#cjump` samt Behandler |
| `drawFilters()` | `.frow-rechts` vor der Wolke |
| `zeigeVersion()` | `MARK()` davor |

### `public/style.css`

| Stelle | Was |
|---|---|
| `.card` | `content-visibility: auto`, `contain-intrinsic-size: auto 400px` |
| `.card` in den beiden Medienabfragen | `auto 375px` bzw. `auto 305px` |
| `.cmt.pinned.bericht` / `.aufgabe` / `.erledigt` | neu — drei Regeln statt einer Ausnahme |
| `.cmt.pinned` | Begründung umgeschrieben, Regel unverändert |
| `.frow-rechts` | neu, samt `order: 2` in der Telefonstufe |
| `.version-zeile` | Flex, `gap`; `.version-zeile .marke { height: 1.5em }` |
| `body.anmeldung .version-zeile` | `margin-bottom` auf 10px |

### Papiere

`README.md` (Exportgrenze an zwei Stellen, CrowdSec und Protokollrotation),
`CHANGELOG.md`, `Doku/Projektstand_Kriterion_0_12_3.md` (umbenannt),
`Doku/Fehler_und_Ideen.md`, dieses Protokoll. `package.json` und
`package-lock.json` auf `0.12.3`.

---

## 8. Die Messwerte

### Die Kachel und das Zeichnen — 2a

**Gemessen in Chromium, 1000 Kacheln mit Foto, Tags, drei Bewertungen und einem
Testtag.** Das Telefon ist vierfach gedrosselt (`Emulation.setCPUThrottlingRate`),
sonst misst ein Wirt mit vier Kernen etwas, das kein Telefon je erlebt. Sieben
Läufe je Lage, Mittelwert:

| Schirm | | Layout | Stil | erzwungenes Layout *(Median / Ausschlag)* |
|---|---|---:|---:|---:|
| **Telefon** 390 × 844, 4× | ohne | **397 ms** | 563 ms | 0 ms / **72 ms** |
| | mit | **168 ms** | 462 ms | 0 ms / 1 ms |
| **Desktop** 1440 × 900 | ohne | 88 ms | 141 ms | 13 ms / 15 ms |
| | mit | 78 ms | 191 ms | 18 ms / 22 ms |

*Layout, Stil und Skript sind kumulativ seit dem Laden der Seite und kommen aus
`Performance.getMetrics` über CDP; das erzwungene Layout ist ein eigener
`offsetHeight` am Raster, unmittelbar nachdem die Kacheln im Dokument stehen.*

**AUF DEM TELEFON HALBIERT SICH DIE AUFBAUZEIT** — 397 auf 168 ms. Ein zweiter
Lauf mit fünf Runden kam auf 361 → 186 ms; die Richtung ist in beiden dieselbe
und der Abstand deutlich größer als die Streuung.
**Und der Ausschlag beim erzwungenen Layout ist die zweite Hälfte des
Befundes:** ohne die Regel kostete einer von sieben Läufen 72 ms an einer
einzigen Stelle, mit ihr keiner mehr als eine Millisekunde. *Der Median sagt
dazu nichts — genau solche einzelnen Spitzen sind es, die man auf dem Gerät als
Hänger bemerkt.*

**AM DESKTOP ÄNDERT SICH IM RAUSCHEN NICHTS**, und beim Stil kostet es sogar
etwas (141 → 191 ms). *Das ist kein Widerspruch, sondern die Erwartung:* wo
nichts zu sparen ist, bleibt nur die Buchführung der Containment-Regel übrig.
Der Projektstand hat es so vorhergesagt — *„auf dem Telefon ist das spürbar, am
Desktop kaum."*

> **WAS DIESE ZAHL NICHT IST: die Antwortzeit des Servers.** Die ändert sich
> nicht und war auch nie das Problem — `GET /api/items` liefert seit 0.11.0
> 0,52 MB bei tausend Einträgen. **Kein Ladeproblem, ein Zeichenproblem.**

**Und damit ist die Voraussetzung für „Nachladen beim Rollen" beantwortet:** der
Fahrplan sieht es *erst dann* vor, *wenn (2a) gemessen zu wenig gebracht hat.*
**Es hat genug gebracht.** Der Punkt bleibt liegen, wo er liegt.

### Die Kachelhöhe

Siehe [2a](#2a--nur-zeichnen-was-zu-sehen-ist). 178 × 305, 255 × 374, 301 × 399 px.

### Die Blob-Summe und die Exportgröße

**Nicht gemessen** — sie braucht die Datenbank des Betriebs. Sie steht ab dieser
Version in den Kennzahlen und ist dort abzulesen; siehe
[Abschnitt 1](#1-was-vor-dem-ersten-handgriff-geprüft-wurde) und
[Abschnitt 14](#14-offen-geblieben).

---

## 9. Der Prüfstand

| | vorher | nachher |
|---|---:|---:|
| Prüfungen | **3856** | **3954** |
| davon grün | 3855 | **3954** |

*3946 nach dem Bauen, 3952 nach dem Schließen der drei Funde aus den
Gegenproben (Abschnitt 10), 3954 nach der Durchsicht am Ende (unten).*

**Der Branch kam mit einer roten Prüfung an, und sie stand nicht im Auftrag.**
Der Sprachwächter fand in `Doku/Fehler_und_Ideen.md:618` das Wort
`Zeichenkette` statt `String` — hereingekommen mit dem letzten Merge in den
Sammelblatt-Text, also
**nach** 0.12.2 und ohne dass ein Lauf sie gesehen hätte. Ein Wort, und der
Branch war wieder grün. *Der Auftrag nennt als Ausgangswert 3856 Prüfungen; das
ist die Zahl der Prüfungen und nicht die der bestandenen.*

**Vier Prüfungen mussten nachgezogen werden**, weil sie den alten Wortlaut
festhielten: die drei Stellen mit `(1 Erledigt)` und die Durchschnittsspalte mit
`3,4 · 5`. *Sie sind nicht gelöscht, sondern auf den neuen Wortlaut gestellt —
und um die Aussage erweitert, die vorher nicht geprüft war.*

**Was neu dazukam, in zwei Gruppen und drei Erweiterungen:**

- **„Die Exportgröße sagt sich an"** — die Rechnung an der Funktion (Umschlag
  ohne Schalter, jeder Schalter einzeln, Videos ohne Fotos, alles zusammen), die
  beiden Kennzahlenzeilen, die lebenden Zahlen an den Knöpfen, beide Lagen der
  Warnung.
- **„Die Anzeige zieht nach — 0.12.3"** — 2a, 2b, 2f, 2g und 2h am Stylesheet
  und am Aufbau.
- **In „Videos: Kennzahlen und Austausch"**: die Gegenrechnung zur Exportgröße
  **aus der Datenbank**, samt dem Beleg, dass die Vorschaubilder nicht
  mitgezählt werden — und den Quelltextwächtern auf die Reihenfolge in der
  Exportroute.
- **In „Kommentare in der Oberfläche"**: der Sprungknopf, mit einem wirklich
  zugestellten Klick.
- **In den beiden Gruppen zum zweiten Faktor**: die Beschriftungen.

> **WAS AM PRÜFSTAND NICHT NACHWEISBAR IST, UND ES STEHT DORT AUCH SO.**
> **`jsdom` misst jede Höhe als null.** Die Wirkung von `content-visibility`
> ist dort **nicht** zu zeigen — der Prüfstand kann nur festhalten, **dass** die
> Regel dasteht, dass sie `auto` trägt und dass jede Rasterstufe ihre eigene
> Zahl hat. **Dass die Regel dasteht, ist keine Prüfung ihrer Wirkung**, und
> genau dieser Satz steht als Kommentar über der Gruppe, damit niemand die
> grünen Punkte für eine Messung hält. Gemessen wurde in Chromium; die Zahlen
> stehen oben in [Abschnitt 8](#8-die-messwerte).
>
> **Dasselbe traf 2f.** „mehr" erscheint nur, wenn die Wolke wirklich
> beschnitten ist — in `jsdom` misst nichts, `begrenzeWolke()` steigt dort
> ausdrücklich aus, und der Knopf entsteht nie. **Geprüft wird deshalb über
> „zurücksetzen"**, das an der Auswahl hängt und sich mit einem echten Klick auf
> eine Marke herstellen lässt. *Ein von Hand gesetzter Zustand nähme genau den
> Weg heraus, um den es geht.*
>
> **Und das ist derselbe Mangel, der im Sammelblatt unter „Am Prüfstand" steht.**
> Diese Runde macht ihn schärfer sichtbar: er trifft jetzt nicht mehr nur
> Ausrichtung und Trefferflächen, sondern eine Eigenschaft, die **ausschließlich**
> im Zeichnen wirkt. Nachgetragen ist er dort.

**`F_ROUTEN` bleibt bei 69**, nachgeprüft: es kommt keine schreibende Route
dazu. Beide neuen Auskünfte hängen an `GET /api/stats`, und das ist eine
lesende Route.

---

## 10. Gegenproben

**Vorher: 172 Rückbauten. Nachher: 184.** Zwölf sind dazugekommen — `171` bis
`182` —, und sie zielen auf die **Rechnung** und auf die **Klemme**, nicht auf
die Anzeige daneben: *eine Zahl, die falsch gerechnet wird, sieht am Bildschirm
genauso aus wie eine richtige.* **Drei von ihnen haben eine Lücke aufgedeckt,
und alle drei sind im selben Zug geschlossen worden.**

**Der erste Lauf über die zwölf, drei Nebenspuren, rund 340 Sekunden je
Rückbau.** Erwartet ist eine Notiz, gemeldet wird, was wirklich rot wurde:

| Nr | Rückbau | Datei | rot geworden |
|---|---|---|---:|
| **171** | Der Umschlag fällt weg | `server.js` | **STUMM — ein FUND** |
| 172 | Die Vorschaubilder werden mitgezählt | `server.js` | 2 |
| 173 | Der Export baut erst und sagt danach ab | `server.js` | 1 |
| 174 | Der Warnwert liegt auf der Grenze | `server.js` | 2 |
| 175 | Die Videos zählen auch ohne Fotos mit | `public/app.js` | 2 |
| 176 | Die Kachel zeichnet wieder alles | `public/style.css` | 1 |
| 177 | Die geschätzte Kachelhöhe gilt für immer | `public/style.css` | 2 |
| 178 | Der angepinnte Bericht trägt wieder zwei Farben | `public/style.css` | 3 |
| 179 | Der Verweis rutscht wieder hinter die Wolke | `public/app.js` | 1 |
| **180** | Die offenen Aufgaben werden gezählt statt abgezogen | `public/app.js` | **0 — ein FUND** |
| 181 | Das Codefeld fragt wieder nach der App | `public/app.js` | 2 |
| **182** | Der Sprungknopf klappt den Block nicht auf | `public/app.js` | **0 — ein FUND** |

### Drei Funde, und alle drei sind geschlossen

**Ein Rückbau, der keine einzige Prüfung rot macht, ist ein Fund — nicht ein
Erfolg.** Der Treiber meldete nur **171** als STUMM; **180 und 182 sahen
gedeckt aus, waren es aber nicht.** *Beide hatten genau einen roten Punkt, und
der kam vom Sprachwächter — an einem Wort in einem Dokument, das mit dem
Rückbau nichts zu tun hatte.* **Ein unbeteiligter roter Punkt maskiert einen
stummen Rückbau**, und das ist der eigentliche Nebenbefund dieses Laufs.

**171 — der Umschlag.** `austauschBytes()` ohne `austauschUmschlagBytes()` ist
am Verhalten nicht zu fassen: der Umschlag fällt erst ins Gewicht, wenn die
Summe nahe an `AUSTAUSCH_MAX` liegt, und das wären rund 460 MB Prüflage. Die
Kennzahlen lesen den Umschlag getrennt und merkten davon nichts. **Geschlossen
mit einem Quelltextwächter** — dieselbe Bauform, die der Prüfstand für die
Rechtezeile am Export schon führt —, dazu der Beleg, dass der Einzelexport
dieselbe Rechnung liest.

**180 — der Rückbau war rechnerisch ein No-op.** Ersetzt wurde
`aufgaben - fertig` durch `zaehle('task')`, und das ist **dasselbe**:
`aufgaben` zählt `task` und `done`, `fertig` zählt `done`, die Differenz **ist**
die Zahl der `task`-Zeilen. *Ein Rückbau, der nichts verändert, sieht aus wie
eine Lücke im Prüfstand und ist keine — er ist eine Lücke im Rückbau.*
**Geschlossen, indem er jetzt die Verschachtelung selbst zurückbaut:** die
Gesamtzahl statt der offenen.

**182 — die Prüflage hatte den Block schon offen.** Die Zeile *„Der Block
bleibt dabei offen"* konnte nicht scheitern, weil er es ohnehin war
(Stolperstein 81, in seiner reinsten Form). **Geschlossen mit einer zweiten
Lage:** die Prüfung klappt den Block erst zu und drückt dann den Knopf.

*Nach dem Schließen stehen 3952 Prüfungen; die drei Rückbauten sind noch einmal
gefahren worden.*

> **DER LAUF IST NICHT ÜBER ALLE 184 GEGANGEN.** Er fährt je Rückbau den vollen
> Prüflauf; bei rund 340 Sekunden und drei Nebenspuren wären das über zwanzig
> Stunden. **Gefahren sind die zwölf neuen** — das belegt, dass die neuen
> Prüfungen rot werden können, und nicht, dass die alten es noch tun. *Der volle
> Lauf steht damit seit vier Runden aus und bleibt ein offener Punkt.*
>
> **UND EINE EINSCHRÄNKUNG DER METHODE GEHÖRT DAZU:** `gegenprobe.js` baut seine
> Kopie über `git archive HEAD`, und HEAD ist während des Laufs weitergerückt —
> die Papiere sind zwischendurch committet worden. **Der geprüfte Quelltext war
> in allen zwölf Läufen derselbe**, die Dokumente daneben nicht. *Genau daher
> kommt der rote Sprachwächter in den späteren Läufen: er sah ein Wort, das erst
> in diesem Lauf entstanden ist.*

> **DER VOLLE LAUF ÜBER ALLE 184 IST AUCH IN DIESER RUNDE NICHT GEFAHREN.** Er
> fährt je Rückbau den vollen Prüflauf; bei rund 330 Sekunden je Lauf und drei
> Nebenspuren sind das über zwanzig Stunden. **Gefahren sind die zwölf neuen** —
> das belegt, dass die neuen Prüfungen rot werden können, und nicht, dass die
> alten es noch tun. *Der volle Lauf steht damit seit vier Runden aus und bleibt
> ein offener Punkt.*

---

## 11. Abweichungen vom Auftrag, mit Begründung

**1. Die Blob-Abfrage aus dem Auftrag ist nicht die, die gebaut wurde.** Der
Auftrag nennt eine Summe über die Blob-Spalten — `photos.data`, `photos.thumb`,
`photos.medium`, `attachments.data`, `comment_images.data`,
`comment_images.thumb`. **Gebaut ist die Summe über das, was der Export wirklich
schreibt**, und die ist kleiner:

| Spalte | im Auftrag | geht in die Datei |
|---|---|---|
| `photos.data` (Foto) | ja | **ja** |
| `photos.thumb` | ja | **nein** — nie |
| `photos.medium` | ja | **nur beim Video**, als Standbild |
| `attachments.data` | ja | **ja**, mit dem Dateischalter |
| `comment_images.data` | ja | **ja**, mit dem Dateischalter |
| `comment_images.thumb` | ja | **nein** — nie |

*Der Auftrag selbst nennt den Maßstab: „Die Dateigröße ist die falsche
Grundlage … die Schätzung fiele damit zu hoch aus."* **Genau dieses Argument
trifft die Vorschaubilder ein zweites Mal** — sie liegen in der Datenbank und
gehen nicht mit. **Eine Warnung, die zu früh kommt, wird weggeklickt**, und
damit wäre der ganze Punkt verloren. Der Prüfstand rechnet die Zahl aus der
Datenbank nach und belegt ausdrücklich, dass die Vorschaubilder **nicht**
mitgezählt sind.

**2. Der Umschlag wird geschätzt, nicht gemessen.** Der Auftrag sagt „plus
Umschlag" und lässt offen, wie. Gemessen wird der **Text** (Titel,
Beschreibungen, Kommentare, Tagnamen über die Verknüpfung, Adressen);
**geschätzt** wird die **Form** — Feldnamen, Klammern, Anführungszeichen — mit
einer Obergrenze je Datensatz (`UMSCHLAG_JE`, 320 Bytes je Eintrag, 150 je
Kommentar, 70 je Bewertung, 90 je Zeitpunkt, 110 je Foto, 130 je Datei). *Die
Zahlen stehen beieinander und sind abzählbar; sie exakt zu messen hieße, die
Datei zu bauen — und das soll die Ansage ja gerade ersparen.*

**3. Die Absage vor dem Bau ist mehr, als (b) wörtlich verlangt.** Der Auftrag
entscheidet „warnen, und den Knopf trotzdem lassen". **Das gilt für den
Schwellwert und ist so gebaut.** An der harten Grenze dagegen gibt es die Datei
nicht — dort ist die Absage keine Wegnahme, sondern die Feststellung. *Der
Auftrag begründet sie selbst: „Ein Knopf, der nach zwei Minuten mit einem
Speicherfehler abbricht, ist die schlechteste Variante."* Der Einzelexport sagt
an derselben Grenze seit jeher ab; **hier ist der volle Export der Nachzügler
und nicht der Vorreiter.**

**4. „zurücksetzen" ist mit „mehr" umgezogen.** Der Auftrag nennt nur „mehr".
**Wäre nur „mehr" umgezogen, stünde „zurücksetzen" allein unter der Wolke** —
und dann kostete es die ganze Zeile, die der Punkt gerade einspart. Es ist
dieselbe Zeile Quelltext und dieselbe Entscheidung.

**5. Der Nebenbefund zur doppelt gebauten Tagwolke bleibt stehen.** Der Auftrag
lässt beides zu. Zusammengeführt wird nicht: die beiden Zeilen tragen
Verschiedenes, und eine gemeinsame Bauform müsste beides können. Er steht als
Zeile in Teil II des Sammelblatts.

**6. Eine rote Prüfung, die es vor der Runde schon gab, ist mitrepariert.** Ein
Wort in `Doku/Fehler_und_Ideen.md`. *Der Auftrag lässt am Sammelblatt genau zwei
Stellen zu — dies ist eine dritte, und sie ist kein Umbau, sondern die
Bedingung dafür, dass `npm test` gegen diesen Stand grün läuft.*

**7. Die Beschriftung am zweiten Faktor stand nicht im Auftrag.** Sie kam aus
dem Gespräch, während gebaut wurde; siehe [Abschnitt 5](#5-der-elfte-punkt-die-beschriftung-am-zweiten-faktor).

**8. Drei Grenzen statt zwei — aus einer Durchsicht am Ende der Runde.** Die
Warnung an der Karte nannte zunächst `AUSTAUSCH_MAX` als die Zahl, „ab der es
kippt". **Das ist falsch, und es fiel erst beim Nebeneinanderlegen der Texte
auf:** `AUSTAUSCH_MAX` ist *unsere Marge* (90 % der Stringgrenze, mit Luft für
die Schätzung), während die Route in ihrer Meldung 512 MB nannte — *dieselbe
Sache, zwei Zahlen.* **Ein Text kann sehr wohl größer werden als 460,8 MB, nur
eben nicht größer als 512.**
`/api/stats` liefert deshalb jetzt **drei** Werte: `warnAb` (wo gewarnt wird),
`grenze` (wo abgesagt wird) und `string` (wie lang ein Text in Node überhaupt
werden kann). **Genannt wird in jeder Meldung die letzte** — sie ist die
einzige, die eine Tatsache ist; die beiden anderen sind Entscheidungen. *Und
die getippte 512 ist damit auch aus den beiden Serverantworten verschwunden,
die Einzelexport-Absage eingeschlossen: die Zahl kommt aus Node und steht an
einem Ort.*

---

## 12. Neue Stolpersteine

**182. Eine Schätzung über Blob-Spalten ist etwas anderes als eine Schätzung
über das, was geschrieben wird — und die naheliegende ist die falsche.** Die
Summe über alle Blob-Spalten ist leicht zu tippen und sieht vollständig aus. Sie
zählt aber `photos.thumb` und `comment_images.thumb` mit, und beide gehen nie in
eine Exportdatei. **Bei einem Bestand aus vielen kleinen Bildern ist das kein
Rundungsfehler**, sondern ein spürbarer Anteil. **WER EINE GRÖSSE VORHERSAGT,
MUSS DIE QUELLE ZÄHLEN, DIE GESCHRIEBEN WIRD — NICHT DIE, DIE DANEBEN LIEGT.**
*Und der Preis des Fehlers ist nicht die falsche Zahl, sondern die Warnung, die
zu früh kommt: eine Warnung, die man dreimal grundlos gesehen hat, klickt man
beim vierten Mal weg.*

**183. Zwei Zahlen mit zwei Aufgaben dürfen nicht dieselbe sein, auch wenn sie
dasselbe zu messen scheinen.** `AUSTAUSCH_WARN` und `AUSTAUSCH_MAX` sehen beide
aus wie „die Grenze". Die eine ist **gemessen** und sagt, wo der String
zerbricht; die andere ist **geschätzt** und sagt, wo jemand besser die Sicherung
nimmt. **Fielen sie zusammen, verlöre die Warnung ihren Zweck** — sie käme genau
dann, wenn es ohnehin nicht mehr geht. **DIE LUFT ZWISCHEN BEIDEN IST DER PREIS
DER SCHÄTZUNG und keine Bequemlichkeit.** *Genannt wird in der Meldung trotzdem
die gemessene: zu nennen ist die Zahl, bei der es kippt, nicht die, bei der es
unbequem wird.*

**184. `content-visibility` lässt sich am Prüfstand nicht belegen, und das ist
kein Grund, es nicht zu prüfen — sondern einer, es dazuzuschreiben.** `jsdom`
misst jede Höhe als null; die Wirkung ist dort nachweislich unsichtbar. **Was
bleibt, ist die Feststellung, dass die Regel dasteht** — und die ist ohne den
Satz daneben gefährlicher als keine Prüfung: **eine grüne Zeile, die aussieht
wie ein Beleg, ist schlechter als eine Lücke, die man sieht.** *Deshalb steht
über der Gruppe ausdrücklich, was sie nicht zeigt, und die Messung steht im
Änderungsprotokoll statt im Prüfstand.*

**185. Wo eine Zeile umbricht, entscheidet die Reihenfolge im Aufbau — und keine
Regel im Stylesheet holt das zurück.** `margin-left: auto` schiebt ein Element
an das rechte Ende **seiner Zeile**; auf welcher Zeile es steht, hat der Aufbau
schon entschieden. Ein Verweis hinter einer Wolke, die die Breite füllt, landet
auf der nächsten Zeile — mit oder ohne Außenkante. **DIE ANORDNUNG IST HIER EINE
FRAGE DES AUFBAUS UND NICHT DES STYLESHEETS**, und deshalb prüft der Prüfstand
die Reihenfolge der Kindknoten und nicht nur die Regel. *Für die Spaltenansicht
auf dem Telefon stellt `order` sie wieder um — dort gibt es rechts keinen freien
Platz, und „mehr" gehört hinter das, was es aufklappt.*

**186. Ein Feld, das zwei Formen annimmt, darf keine von beiden in seiner
Beschriftung ausschließen.** „Code aus deiner App" und „Sechsstelliger Code"
waren beide für den Wiederherstellungscode falsch — er hat zehn Zeichen und
kommt von einem Zettel. **Der Quelltext wusste es besser als die Oberfläche:**
`istCodeform` und `istWiederform` stehen dort ausdrücklich als Paar, „damit EIN
Eingabefeld beide Formen auseinanderhält". **WER EIN FELD BESCHRIFTET, BESCHREIBT
DAS VERFAHREN UND NICHT DAS GERÄT** — das Gerät kann wechseln, das Verfahren
nicht. *Und der Fehler ist unauffällig: eine Beschriftung, die für die Hälfte der
Fälle falsch ist, fällt keinem auf, der zur anderen Hälfte gehört.*

---

## 13. Was ausdrücklich nicht passiert ist

- **Kein Schema, kein Migrationsblock, keine Formatnummer.** Punkt 1 rechnet über
  vorhandene Spalten, Punkt 2 fasst nur die Oberfläche an. **Das Austauschformat
  bleibt bei 10.**
- **Keine neue Zeile in der `.env`.** Auch keine für den Schwellwert: er ist eine
  Eigenschaft von Node und nicht des Betriebs.
- **Keine neue Abhängigkeit, nicht eine** — auch keine für den Prüfstand. *Die
  Messungen in [Abschnitt 8](#8-die-messwerte) sind mit einem Browser gefahren,
  der in der Arbeitsumgebung ohnehin liegt; kein Werkzeug davon ist ins Repo
  gekommen und keines steht in `package.json`.*
- **Kein Export als Strom.** Er ist Teil (c) und ausdrücklich nicht diese Runde:
  ein Umbau an einer Stelle, die nachweislich funktioniert, und die Sicherung ist
  seit 0.8.70 ohnehin der Hauptweg.
- **Kein Nachladen beim Rollen, kein Blättern mit Seitenzahlen.** Ersteres steht
  im Fahrplan als „später" und ist durch die Messung erledigt; letzteres
  zerschnitte die Suche.
- **Kein zweites Kommentarformular in einem Dialog.**
- **Version und Verfahren in den Kennzahlen (2i)** — steht unter 0.15.0.
- **Keine eigene Protokollzeile nach stdout** — steht unter 0.13.0 und hängt an
  der Adressermittlung.
- **`F_ROUTEN` bleibt bei 69.** Es kommt keine schreibende Route dazu.
- **Das Konzeptpapier und das Videopapier sind nicht angefasst.**

---

## 14. Offen geblieben

- **DIE BLOB-SUMME DER LAUFENDEN ANLAGE.** Sie entscheidet, ob Punkt 1 ein
  eingetretener Fehler war oder Vorsorge. **Abzulesen im Systembereich unter
  Kennzahlen → „Export, alles"**, sobald diese Version läuft. *Liegt sie über
  512 MB, gehört die Art des Punktes im Fahrplan von `Verbesserung` auf `Fehler`
  gestellt — und der Satz im CHANGELOG bekommt seine Zahl.*
- **Der Fingerprint der laufenden Anlage** ist nicht gegengeprüft worden — kein
  Zugriff auf den Wirt. Vor dem Einspielen gegen `e30a19c1` halten, danach gegen
  den Wert im Kopf dieses Papiers.
- **Der Git-Tag `v0.12.3`** ist angelegt, aber nicht geschoben (HTTP 403). Die
  fünf Vergleichsverweise im CHANGELOG zeigen ins Leere.
- **Der volle Gegenprobenlauf** über alle 184 Rückbauten steht seit vier Runden
  aus.
- **Die doppelt gebaute Tagwolke** — Übersicht gegen Eintragsseite. Steht als
  Zeile in Teil II des Sammelblatts.
- **Der Prüfstand kann Zeichnen und Layout nicht messen.** Diese Runde hat den
  Mangel geschärft; nachgetragen im Sammelblatt unter „Am Prüfstand".
