# Änderungsprotokoll 0.12.4 — „Der Export geht in Teilen"

**Version 0.12.4 · gebaut am 28. August 2026 · Fingerprint `ca991cf5` ·
Nacharbeit an 0.12.3, ausgelöst durch eine Messung im Feld · KEINE
Datenbankstufe, kein Migrationsblock, keine neue Formatnummer, keine neue Zeile
in der `.env`, keine neue Abhängigkeit**

**0.12.3 hat gemessen, 0.12.4 antwortet.** Die laufende Anlage meldete beim
Druck auf den Exportknopf **760 MB gegen Nodes Grenze von 512 MB** — der Export
war nicht gefährdet, er war kaputt. Seit 0.12.3 sagte er das sauber an; er
lieferte nur nichts mehr. *Der Betreiber hat den Punkt in einem Satz gestellt:
„wozu brauche ich dann diese Funktion, wenn sie nicht funktioniert?"*

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.4 ist **PATCH**, und die
Frage dahinter ist eine echte: *kann die Anlage danach etwas, was sie vorher
nicht konnte?* **Streng genommen ja** — einen Bestand über 512 MB ausführen.
**Gezählt wird sie trotzdem als Fehlerbereinigung**, weil die Fähigkeit nicht
neu ist, sondern zurückkommt: der Export ist der Austauschweg, seit es ihn
gibt, und er ist an einer Grenze ausgefallen, die niemand gezogen hat. *Der
Fahrplan sieht für genau diesen Fall die Zeile „0.12.x — Fehlerbereinigung und
Verbesserungen, die nächste freie PATCH-Zahl" vor.* **Entschieden hat das der
Betreiber; die Gegenlesart steht unten in Abschnitt 8.**

---

## Inhalt

1. [Die Frage vor der Lösung: Strom oder Teile?](#1-die-frage-vor-der-lösung-strom-oder-teile)
2. [Wie geschnitten wird](#2-wie-geschnitten-wird)
3. [Eine Abfrage, mehrere Freigaben](#3-eine-abfrage-mehrere-freigaben)
4. [Der Rundlauf — die Bedingung des Betreibers](#4-der-rundlauf--die-bedingung-des-betreibers)
5. [Was gebaut wurde, je Datei](#5-was-gebaut-wurde-je-datei)
6. [Der Prüfstand](#6-der-prüfstand)
7. [Gegenproben](#7-gegenproben)
8. [Entscheidungen und Abweichungen](#8-entscheidungen-und-abweichungen)
9. [Neue Stolpersteine](#9-neue-stolpersteine)
10. [Was ausdrücklich nicht passiert ist](#10-was-ausdrücklich-nicht-passiert-ist)
11. [Offen geblieben](#11-offen-geblieben)

---

## 1. Die Frage vor der Lösung: Strom oder Teile?

**Der Vorschlag aus dem Betrieb lautete: „kann man nicht die Datei in Stücken
runterladen und dann wird es zusammengebaut".** Der Gedanke trifft; die
Ausführung ist eine andere, und der Unterschied ist der ganze Punkt dieser
Runde.

**Es gab zwei ernsthafte Antworten:**

| | löst den Weg **hinaus** | löst den Weg **zurück** | neues Format | neuer Leser |
|---|---|---|---|---|
| **Der Export als Strom** *(Teil c, seit 0.8.6 zurückgestellt)* | ja | **nein** | nein | **ja** |
| **Export in vollständigen Teildateien** | ja | **ja** | **nein** | **nein** |

**DER STROM HÄTTE NUR DIE HÄLFTE GELÖST, und das ist keine Kleinigkeit.** Die
Exportroute ließe sich streamen — Umschlag schreiben, dann Eintrag für Eintrag,
dann schließen; jeder Eintrag wäre ein eigener String, und Nodes Grenze für
einen *einzelnen* String träfe nie das Ganze. **Die Gegenrichtung bleibt dabei
zu:**

```
readAsText(datei)              → ein String von 760 MB im Browser
buffer.toString('utf8')        → ein String von 760 MB am Server
```

**Beides sind dieselbe Grenze, nur andersherum.** Eine gestreamte Datei könnte
diese Anlage **nicht wieder einspielen** — und der Export heißt in diesem
Projekt seit 0.8.70 ausdrücklich der **Austauschweg**: für Umzug, Archiv und
Weitergabe. *Ein Austauschweg, der nur hinaus führt, ist ein halber.* Ihn ganz
zu machen hieße, einen zeilenweisen Leser für JSON zu schreiben — auf dem
Pfad, der fremde Dateien annimmt und unter fremden Namen schreibt. **Das ist
keine Beifracht, das ist eine eigene Runde mit eigener Prüflage.**

**DIE TEILE LÖSEN BEIDE RICHTUNGEN, UND SIE TUN ES OHNE EINE ZEILE AM IMPORT.**
Jeder Teil ist eine **vollständige Exportdatei**: derselbe Umschlag, dieselbe
Formatnummer 10, nur weniger Einträge darin. Der Import sieht n gewöhnliche
Exportdateien und weiß von Teilen nichts. *Was der Betreiber „zusammenbauen"
nannte, geschieht damit beim Einspielen — und dafür gibt es den Knopf
„Zusammenführen" seit es den Import gibt.*

> **UND DAS IST DER GRUND, WARUM DIE BEDINGUNG DES BETREIBERS ERFÜLLBAR WAR.**
> Sie lautete: *„wenn es sich genauso ein und ausspielen lässt."* Bei einem
> Strom wäre die ehrliche Antwort „nein, nicht in dieser Runde" gewesen.

---

## 2. Wie geschnitten wird

**AN EINTRAGSGRENZEN, NIE MITTEN HINEIN.** Ein halber Eintrag wäre kein
gültiger Export, und der Import müsste zwei Teile kennen, um ihn zu verstehen —
genau das soll nicht entstehen. *Der Eintrag ist die kleinste Einheit, die der
Import versteht; er ist damit auch die kleinste Einheit, die ein Teil tragen
kann.*

**DIE GRENZEN SIND EINTRAGSNUMMERN UND KEINE POSITIONEN.** Ein Fenster heißt
`von=318&bis=640` und nicht „die zweiten dreihundert". Wer zwischen dem Plan
und dem Herunterladen einen Eintrag anlegt, verschöbe sonst **jedes Fenster
dahinter**: einer fiele heraus, ein anderer käme zweimal. *Über Nummern bleibt
jedes Fenster das, was der Plan genannt hat — auch eine Stunde später.*

**DIE GRÖSSE JE EINTRAG KOMMT AUS EINER EINZIGEN ABFRAGE.** `austauschTeile()`
rechnet je Eintrag mit rund zehn vorbereiteten Anweisungen; bei tausend
Einträgen wären das zehntausend, und der Plan bräuchte länger als der Export.
`qTeilGroessen` holt alles in einem Zug — **gemessen: 119 ms für 1000
Einträge**. *Gezählt wird dasselbe wie in `austauschTeile()`, nämlich rohe
Bytes; der Base64-Aufschlag und der Umschlag kommen danach in JS dazu, aus
denselben Konstanten. So steht der Faktor an einem Ort, auch wenn die Abfrage
eine andere ist — und eine Prüfung hält beide Summen gegeneinander.*

**DER UMSCHLAG FÄLLT JE TEIL AN, NICHT EINMAL.** Titel, Zeitstempel,
Formatnummer und die ganze Kriterienliste stehen in **jeder** Datei — jeder Teil
ist ja eine vollständige. Er wird nicht geschätzt, sondern gebaut und gemessen
(`austauschUmschlagRahmen()`): bei einer Handvoll Kriterien sind das ein paar
hundert Bytes, und bei vielen kleinen Teilen ist das kein Rundungsfehler mehr.

**EIN EINTRAG, DER FÜR SICH ALLEIN ZU GROSS IST, PASST IN KEINEN TEIL.** Zwanzig
Videos zu je 20 MB sind als Base64 533 MB in **einem** Eintrag. **Er wird
namentlich genannt und nicht stillschweigend übergangen** — *ein stiller Verlust
wäre der schlimmere Ausgang.* Wer ihn sieht, weiß, dass er die Videos abwählen
oder diesen einen Eintrag von Hand behandeln muss; die Karte sagt beides.

**DIE TEILGRÖSSE IST WÄHLBAR, ABER NUR NACH UNTEN.** 50 bis 300 MB. Nach oben
deckelt `AUSTAUSCH_WARN`: darüber baute die Anlage Teile, vor denen sie im
selben Atemzug warnt. Nach unten deckelt ein Megabyte — *bei einem kleineren
Zielwert entstünden bei tausend Einträgen tausend Dateien, und der Import wäre
tausend Handgriffe.* **Der Wunsch dahinter ist echt und nicht erfunden:** wer
seine Teile auf einen Datenträger oder durch eine Hochladegrenze bringen muss,
braucht kleinere als 300 MB.

---

## 3. Eine Abfrage, mehrere Freigaben

**Die zweite Bestätigung wird VERBRAUCHT** (`auth.js`, `verbraucheFreigabe`).
Fünf Teile hießen damit fünf Passwortabfragen — und bei eingeschaltetem zweitem
Faktor fünfmal auch den Code.

**Der Schlüssel einer Freigabe ist Sitzung, Zweck UND Ziel.** Genau dieses Ziel
trägt jetzt die Teilnummer: der Mensch tippt **einmal**, die Oberfläche holt
**n** Freigaben, und jede geht einzeln mit dem Passwort an den Server und wird
dort gegen den Hash gehalten.

> **ZUSAMMENGEFASST WIRD DIE EINGABE UND NICHT DIE PRÜFUNG.** Die Schranke wird
> dadurch nicht milder: **jeder Teil braucht seine eigene Freigabe, und eine
> Freigabe für Teil 1 lässt Teil 2 nicht durch.** Beides steht als Prüfung im
> Lauf. *Was entfällt, ist das fünfmalige Tippen desselben Wortes — und das war
> nie die Schranke, sondern ihr Preis.*

**REIHUM UND NICHT NEBENEINANDER.** Die Anmeldebremse zählt je Adresse, und n
gleichzeitige Anfragen mit demselben Passwort sähen aus wie ein Versuch, sie zu
umgehen. **Bricht eine ab, brechen alle ab** — eine halbe Freigabe wäre ein
Export, der mitten in der Reihe stehenbleibt und dessen Grund niemand sieht.

**Der Plan selbst steht ohne zweite Bestätigung**, nur hinter `nurEigentuemer`.
*Es verlässt nichts das Haus:* die Antwort nennt Nummern, Größen und die Titel
der Einträge, die zu groß sind — und die sieht der Eigentümer ohnehin an jeder
Kachel. **Die Bestätigung steht an den Teilen selbst, und das ist die richtige
Stelle: dort gehen die Bytes hinaus.**

---

## 4. Der Rundlauf — die Bedingung des Betreibers

**Die Zusage lautete: „wenn es sich genauso ein und ausspielen lässt."** Eine
Zusicherung auf die Schnittstelle wäre hier zu wenig gewesen. **Gefahren ist
der ganze Weg**, dreimal, und er steht seither als Prüfung im Lauf.

| Prüflage | Einträge | Teile | Ergebnis |
|---|---:|---:|---|
| 1000 Einträge, je ein Foto, Tags, Bewertungen, Testtage | 1000 | 6 | **Feld für Feld dasselbe** |
| 60 Einträge, reich: Kommentare aller vier Arten, Anpinnung, Kommentarbilder, Anhänge, Links, Kategorien, Favoriten, Umlaute und Markup im Text | 60 | 60 | **Feld für Feld dasselbe** |
| Im Prüfstand, dauerhaft: 6 Einträge, je 4 Kommentare, Anhang, Link, Tags, Bewertungen, Testtag | 6 | mehrere | **Feld für Feld dasselbe** |

**JEDES MAL IN EINE FRISCHE, ZWEITE ANLAGE** — Teil 1 mit „Ersetzen", die
übrigen mit „Zusammenführen" — und danach verglichen, was der Export überhaupt
tragen kann: Titel, Beschreibung, abgelehnt, getestet, Favorit, Tags, Links,
Zahl der Fotos, Dateinamen der Anhänge, Testtage samt Note, Bewertungen je
Kriterium, und jeder Kommentar mit Art, Anpinnung und Text.

> **WAS DER VERGLEICH AUSDRÜCKLICH NICHT NIMMT:** die Nummern (sie werden beim
> Einspielen neu vergeben) und den Zeitpunkt des Einspielens. **Verglichen wird
> der Bestand als Aussage, nicht als Datei** — alles andere hieße, dem Import
> etwas vorzuwerfen, was er nie versprochen hat.

**Und die Schätzung hat sich dabei bewährt:** die wirklich geschriebenen Dateien
lagen bei 0,99 MB, angesagt waren 1,00 MB. *Der Prüfstand hält die Spanne
zwischen 70 % und 110 % der Ansage fest.*

---

## 5. Was gebaut wurde, je Datei

### `server.js`

| Stelle | Was |
|---|---|
| `AUSTAUSCH_TEIL_MAX`, `AUSTAUSCH_TEIL_MIN` | neu — höchstens 999 Teile, kleinstes Ziel 1 MB |
| `qTeilGroessen` | neu; alle Eintragsgrößen in **einer** Abfrage |
| `teilBytes(zeile, schalter)` | neu; was ein Eintrag in der Datei kostet, aus einer fertigen Zeile |
| `austauschUmschlagRahmen()` | neu; was der Umschlag **ohne** Einträge kostet — gebaut, nicht geschätzt |
| `austauschPlan(schalter, ziel)` | neu; der Schnittplan samt der Liste der zu großen Einträge |
| `GET /api/export/plan` | neu, lesend, `nurEigentuemer`, **ohne** zweite Bestätigung |
| `GET /api/export` | nimmt `von`, `bis`, `teil`, `teile`; ohne sie unverändert der Weg von 0.12.3 |
| `zweiteBestaetigungNoetig` | liest das Ziel jetzt auch aus `?teil=` |
| Protokoll | ein Teil steht als `teil k/n` im Sicherheitsprotokoll |

### `public/app.js`

| Stelle | Was |
|---|---|
| `zweiteBestaetigungMehrfach()` | neu; eine Abfrage, je Ziel eine Freigabe, reihum |
| Exportkarte | Knopf „In Teilen exportieren", Auswahl der Teilgröße |
| `zeichneTeilplan()` | neu; Plan holen, Liste zeichnen, freigeben, je Teil laden |
| `exportZahlen()` | die Warnung nennt jetzt den Weg in Teilen als die Antwort |

### `public/style.css`

`.ex-teile` — der abgesetzte Bereich unter den beiden Knöpfen, mit
gestrichelter Linie darüber. *Es ist derselbe Export, aber ein anderer Weg
hinaus; wer die eine Datei bekommt, soll gar nicht erst hinschauen müssen.*

### `pruefung.js`

Die Gruppe **„Der Export in Teilen"**, 36 Prüfungen, mit zwei eigenen Anlagen.
`VERSATZ_STUFE` von 3000 auf 3500 (siehe Stolperstein 187).

### Papiere

`README.md`, `CHANGELOG.md`, `Doku/Projektstand_Kriterion_0_12_4.md`
(umbenannt), dieses Protokoll. `package.json` und `package-lock.json` auf
`0.12.4`.

---

## 6. Der Prüfstand

| | vorher | nachher |
|---|---:|---:|
| Prüfungen | **3954** | **3992** |
| davon grün | 3954 | **3992** |

**Der Kern der neuen Gruppe ist der Rundlauf selbst**, und er läuft mit jedem
`npm test`: zwei Anlagen, sechs Teile hinaus, sechs hinein, Vergleich Feld für
Feld. *Das ist die Bedingung des Betreibers, und sie gehört nicht in ein
Papier, sondern in den Lauf.*

**Daneben, und jede einzeln:**

- Die Fenster **stoßen aneinander und überlappen sich nicht**, und zusammen
  decken sie jeden Eintrag **genau einmal**.
- Jeder Teil trägt **denselben Umschlag** und **die Formatnummer 10**.
- Die **angesagte Größe trifft die wirkliche** (70–110 %), und kein Teil reißt
  die Grenze.
- Eine **halbe Fensterangabe wird abgewiesen** und nicht als Vollexport gelesen.
- Eine **Freigabe für Teil 1 lässt Teil 2 nicht durch** und ist nach dem
  Gebrauch **verbraucht**.
- Ein **zu großer Eintrag steht namentlich da** und steckt in keinem Teil —
  und **ohne die Dateien passt er wieder hinein.**
- Die Teilgröße wird **nach oben und nach unten** gedeckelt, beide Richtungen
  einzeln geprüft.

> **DIE PRÜFLAGE TRÄGT ECHTE BYTES, und das ist kein Zufall.** Sie hängt an
> jeden Eintrag einen Anhang von 420 KB: **Anhänge gehen als Bytes hinein und
> als Bytes wieder heraus, ohne durch die Bildverarbeitung zu laufen.** Damit
> misst die Lage den **Schnitt** und nicht `sharp`. *Ein Bestand ohne Bytes
> ergäbe immer genau einen Teil, und die halbe Gruppe bliebe grün, ohne etwas
> zu belegen.*
>
> **Und der zu große Eintrag entsteht über die Datenbank**, nicht über die
> Routen: `zeroblob()` legt 400 MB Länge an, ohne die Bytes zu schreiben —
> `length()` sieht sie trotzdem, und genau darüber rechnet der Plan. *400 MB
> durch multer zu schicken dauerte länger als der ganze Lauf.*

---

## 7. Gegenproben

**Vorher: 184 Rückbauten. Nachher: 195.** Neun sind dazugekommen — `183` bis
`191` —, und sie zielen auf den **Schnitt** und auf die **Schranke**:
*ein Schnitt, der einen Eintrag doppelt oder gar nicht vergibt, fällt am
Bildschirm nicht auf — erst beim Einspielen, und dann ist der Bestand schon
falsch.*

| Nr | Rückbau |
|---|---|
| 183 | Der Schnitt lässt die Fenster überlappen |
| 184 | Der Umschlag je Teil fällt aus der Rechnung |
| 185 | Ein zu großer Eintrag wird still übergangen |
| 186 | Eine halbe Fensterangabe geht als Vollexport durch |
| 187 | Eine Freigabe gilt wieder für alle Teile |
| 188 | Jeder Teil trägt den ganzen Bestand |
| 189 | Die Teilgröße lässt sich über den Warnwert stellen |
| 190 | Alle Teile heißen gleich |
| 191 | Die Oberfläche holt nur eine Freigabe statt einer je Teil |

**Jeder der neun greift nachweislich** — der Suchtext kommt in seiner Datei
genau einmal vor; nachgesehen, bevor sie in die Liste kamen. *Ein Rückbau, der
ins Leere greift, sieht aus wie einer, der nichts bewirkt, und wäre damit ein
falscher Fund (Erfahrung aus 0.12.3, Rückbau 180).*

> **GEFAHREN SIND SIE IN DIESER RUNDE NICHT.** Jeder fährt den vollen Prüflauf;
> bei rund 340 Sekunden und drei Nebenspuren wären das über zwei Stunden allein
> für die neun. *Der volle Lauf über alle 195 steht damit seit fünf Runden aus
> und bleibt ein offener Punkt — siehe Abschnitt 11.*

---

## 8. Entscheidungen und Abweichungen

**1. Teile statt Strom — entschieden vom Betreiber, begründet in Abschnitt 1.**
Der Strom bleibt damit das, was er seit 0.8.6 ist: zurückgestellt, und jetzt
mit einem zusätzlichen Grund. *Er löst die Hälfte, die ohnehin die einfachere
ist.*

**2. Die Nummer: PATCH, und die Gegenlesart steht hier.** Nach der eigenen
Regel des Projekts — *„kann die Anlage danach etwas, was sie vorher nicht
konnte?"* — wäre **MINOR** vertretbar: ein Bestand über 512 MB geht jetzt
hinaus, und vorher ging er nicht. **Dagegen steht, dass die Fähigkeit nicht neu
ist, sondern zurückkommt.** Der Export war der Austauschweg, seit es ihn gibt;
0.12.3 hat gemessen, dass er ausgefallen war. *Der Betreiber hat PATCH gewählt,
und die Fahrplanzeile „0.12.x — die nächste freie PATCH-Zahl" trägt sie.*
**Wer später anders liest, findet hier beide Seiten.**

**3. Die wählbare Teilgröße stand in keinem Auftrag.** Sie ist beim Bauen
dazugekommen, und zwar aus zwei Gründen: *wer seine Teile auf einen Datenträger
oder durch eine Hochladegrenze bringen muss, braucht kleinere als 300 MB* — und
ohne sie ließe sich der Rundlauf an keiner Prüflage zeigen, die klein genug ist,
um in einem Prüflauf zu laufen. **Der zweite Grund ist ein Werkzeuggrund und
allein hätte er nicht gereicht; der erste trägt.**

**4. `zweiteBestaetigungNoetig` liest jetzt die Abfrage mit.** Bisher kam das
Ziel nur aus `req.params.id`. **Die Abfrage IST Teil der Adresse**, und gelesen
wird ausdrücklich nur `teil` — für jede andere Route ändert sich nichts, weil
keine andere diesen Parameter kennt. *Geprüft ist beides: dass eine Freigabe je
Teil verlangt wird, und dass die Freigabe für Teil 1 Teil 2 nicht durchlässt.*

**5. `VERSATZ_STUFE` von 3000 auf 3500.** Kein Wunsch, sondern eine Folge:
siehe Stolperstein 187.

**6. Ein Teil steht als solcher im Sicherheitsprotokoll** (`teil k/n`). Ohne den
Vermerk sähe ein Bestand, der in fünf Teilen hinausgeht, aus wie **fünf volle
Exporte** — und das Protokoll ist der Ort, an dem später jemand nachsieht, was
das Haus verlassen hat.

---

## 9. Neue Stolpersteine

**187. Eine Prüflage mehr kann eine Zahl kippen, die mit ihr nichts zu tun
hat.** Der Rundlauf braucht **zwei** Anlagen; damit wuchs die Spanne aller
Portbasen von 2980 auf 3100 — und über einen Wächter, der seit jeher verlangt,
dass der **Versatz je Nebenspur größer ist als diese Spanne**, riss damit die
Gegenprobe. *Bei Gleichheit fängt die nächste Spur genau dort an, wo die vorige
aufhört.*
**UND ES LIESS SICH NICHT DURCH EINE KLEINERE BASIS UMGEHEN:** unterhalb der
vorhandenen Basen war kein Fenster von 60 Nummern mehr frei — die Lücken tragen
entweder zu wenig Platz oder eine Nummer von der Sperrliste von `fetch()`
(4045, 5060/5061, 6000). **WÄCHST DIE SPANNE, WÄCHST DER VERSATZ MIT**, und
weil beide Zahlen an einem Ort stehen und gegeneinander geprüft werden, hat es
genau eine Zeile gekostet. *Hätten sie an zwei Orten gestanden, wäre der Fehler
erst in einer Gegenprobe aufgefallen — und dort sieht er aus wie ein zufällig
abgerissener Lauf.*

**188. Ein Fenster über Positionen ist etwas anderes als ein Fenster über
Nummern, und der Unterschied zeigt sich erst unter Nebenläufigkeit.** „Die
zweiten dreihundert Einträge" ist eine Aussage über den Bestand **zum Zeitpunkt
der Frage**; `von=318&bis=640` ist eine über die Einträge selbst. **Zwischen dem
Plan und dem letzten Teil liegen Minuten**, und in dieser Zeit kann jemand
anlegen oder löschen. **BEI POSITIONEN VERSCHIEBT DAS JEDES FENSTER DAHINTER**
— einer fällt heraus, ein anderer kommt zweimal, und beides fällt erst beim
Einspielen auf. *Wer einen Bestand in Stücken ausgibt, nummeriert die Stücke
nach dem, was darin steht, und nicht nach ihrer Reihenfolge.*

**189. Eine Prüflage ohne Bytes kann einen Schnitt nach Größe nicht prüfen.**
Der erste Anlauf der Gruppe lief gegen einen Bestand aus Titeln und
Kommentaren: **immer genau ein Teil**, und die halbe Gruppe blieb grün, ohne
etwas zu belegen. **DER GEGENSTAND MUSS DIE EIGENSCHAFT TRAGEN, die geprüft
wird** (Stolperstein 81, in einer neuen Kleidung: hier fehlte nicht der
Gegenstand, sondern seine Größe). *Genommen wurden Anhänge und nicht Fotos —
sie gehen als Bytes hinein und als Bytes wieder heraus, ohne durch die
Bildverarbeitung zu laufen. Damit misst die Lage den Schnitt und nicht `sharp`.*

**190. Ein Weg, der nur hinaus führt, ist ein halber Austauschweg — und die
Gegenrichtung ist leicht zu übersehen, weil sie an einer anderen Stelle
klemmt.** Der Export baut den String in `JSON.stringify`; der Import baut ihn in
`readAsText()` und `buffer.toString('utf8')`. **Es ist dieselbe Grenze, sie
steht nur woanders**, und wer nur die eine sieht, baut einen Strom und hält das
Problem für gelöst. **WER EINEN AUSTAUSCHWEG ANFASST, PRÜFT BEIDE RICHTUNGEN,
BEVOR ER SICH FÜR EINE LÖSUNG ENTSCHEIDET** — und am besten an einem echten
Rundlauf, nicht an der Schnittstelle.

---

## 10. Was ausdrücklich nicht passiert ist

- **Kein Strom.** Er bleibt zurückgestellt, jetzt mit einem Grund mehr.
- **Kein neues Austauschformat.** Die Formatnummer bleibt **10**; ein Teil ist
  von einer gewöhnlichen Exportdatei nicht zu unterscheiden.
- **Keine Zeile am Import.** Er weiß von Teilen nichts und muss es nicht.
- **Kein Schema, kein Migrationsblock, keine neue `.env`-Zeile, keine neue
  Abhängigkeit.**
- **Keine schreibende Route.** `F_ROUTEN` bleibt bei **69** — der Plan ist
  lesend.
- **Kein Zusammenfügen im Browser.** Der naheliegende Weg wäre gewesen, n
  Dateien im Browser aneinanderzuhängen; er scheitert an derselben Grenze,
  diesmal in V8, und er bräuchte eine Datei, die keine Anlage lesen kann.
- **Kein automatisches Herunterladen aller Teile hintereinander.** Jeder Teil
  hat seinen Knopf. *Mehrere Navigationen kurz hintereinander bricht ein
  Browser ab, und ein Export, der bei Teil 3 stillschweigend aufhört, wäre
  schlimmer als drei Klicks.*

---

## 11. Offen geblieben

- **Der Import liest die Datei weiterhin als einen String.** Für Teile reicht
  das — jeder ist klein genug. **Eine einzelne Datei über 512 MB lässt sich
  weiterhin nicht einspielen**, gleich woher sie kommt. *Das trifft niemanden,
  der mit dieser Anlage exportiert hat; es trifft, wer eine solche Datei von
  woanders bekommt.*
- **Der volle Gegenprobenlauf** über alle 195 Rückbauten steht seit fünf Runden
  aus. Die neun neuen sind auf Vorhandensein geprüft, aber nicht gefahren.
- **Der Git-Tag `v0.12.4` ist angelegt und lässt sich aus dieser Umgebung nicht
  schieben — und in dieser Runde ist zum ersten Mal nachgemessen worden, warum.**
  Es ist **kein** Problem der GitHub-Rechte: `GET /info/refs?service=git-receive-pack`
  antwortet mit **200** samt `X-Github-Request-Id`, ein Branchpush auf denselben
  Commit geht durch, und nur `POST /git-receive-pack` mit `refs/tags/*` bekommt
  **403 — ohne einen einzigen GitHub-Header.** *GitHub sieht die Anfrage nie;
  der Git-Proxy der Arbeitsumgebung weist sie ab, und zwar nach der Ref-Art.*
  **Die Befehle für den Rechner des Betreibers stehen im Projektstand,
  Abschnitt 8.** *Bis 0.12.3 stand hier „Push von einer Stelle mit den nötigen
  Rechten" — das war die falsche Diagnose und hat fünf Runden lang gehalten.*
- **Die Zahl der Teile bei echtem Bestand ist noch nicht gesehen.** Bei 760 MB
  und 300 MB je Teil sollten es **drei** sein. *Das gehört nach dem Einspielen
  abgelesen und hier nachgetragen — zusammen mit der Antwort auf die eine
  Frage, die zählt: ob der Rundlauf auch am echten Bestand stimmt.*
