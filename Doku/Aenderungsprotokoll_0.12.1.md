# Änderungsprotokoll 0.12.1 — „Der Papierkorb wandert ans große Bild"

**Version 0.12.1 · gebaut am 28. August 2026 · Fingerprint `2e3f2e0b` ·
Nacharbeit an 0.12.0, gefunden im Betrieb · KEINE Datenbankstufe, kein
Migrationsblock, der Server unberührt**

**Ein Befund aus dem Feld und nicht vom Schreibtisch.** 0.12.0 war eingespielt
und der Fingerprint `192734a2` bestätigt; einen Tag später kam die Rückmeldung
mit einem Bildschirmfoto vom Telefon: *das Kreuz an der Vorschaukachel ist beim
Durchtouchen viel zu leicht zu treffen.* Das war kein Geschmacksurteil, sondern
eine Beobachtung an der laufenden Anlage.

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.1 ist **PATCH**, und die
Begründung ist eine Frage: *kann die Anlage nach dieser Runde etwas, was sie
vorher nicht konnte?* **Nein.** Ein Foto löschen ging vorher; es geht jetzt an
einer Stelle, an der man es nicht aus Versehen trifft. Der Ausschnittknopf und
der Vollbildknopf tun, was sie vorher taten. **Keine neue Route, keine neue
Abhängigkeit, keine neue `.env`-Zeile, keine Datenbankstufe.** *Der Fahrplan
(Projektstand, Abschnitt 10) sieht für genau diesen Fall „0.12.x —
Fehlerbereinigung und Verbesserungen, die nächste freie PATCH-Zahl" vor.*

---

## Inhalt

1. [Der Befund und warum er einer ist](#1-der-befund-und-warum-er-einer-ist)
2. [Die Entscheidung: was wohin wandert](#2-die-entscheidung-was-wohin-wandert)
3. [Was gebaut wurde, je Datei](#3-was-gebaut-wurde-je-datei)
4. [Zwei Fehler, nebenbei gefunden](#4-zwei-fehler-nebenbei-gefunden)
5. [Eigene Fehler im Bauen](#5-eigene-fehler-im-bauen)
6. [Der Prüfstand](#6-der-prüfstand)
7. [Prüfungszahlen](#7-prüfungszahlen)
8. [Was ausdrücklich nicht passiert ist](#8-was-ausdrücklich-nicht-passiert-ist)
9. [Offen geblieben](#9-offen-geblieben)

---

## 1. Der Befund und warum er einer ist

Die Vorschaureihe unter dem Bildbereich zeigt die Fotos eines Eintrags als
Kacheln. Jede trug oben rechts ein Löschkreuz — am Zeigegerät beim Überfahren,
auf dem Berührungsbildschirm dauerhaft, weil es dort kein Überfahren gibt (das
war eine der Korrekturen aus 0.12.0).

**Nachgemessen, nicht geschätzt:**

| | Maß |
|---|---|
| Kachel auf dem Telefon | **62 × 62 px** |
| Löschkreuz mit Fingermaßen (`pointer: coarse`) | **27 × 27 px** |
| Anteil an der Kachelfläche | **rund ein Fünftel** |
| Lage | **obere rechte Ecke** |

**Die Zahl allein ist noch nicht der Fehler. Die Lage ist es.** Eine Kachelreihe
ist schmal und wird *quer durchgewischt* — der Daumen fährt über sie hinweg und
setzt dabei auf. Er setzt nicht in der Mitte auf, sondern dort, wo er die Reihe
betritt. **Das Kreuz saß damit nicht neben dem Weg des Fingers, sondern darauf.**

**Der Unterschied zu einer Zeile ist der ganze Punkt.** In einer Linkliste oder
einer Kommentarliste steht dasselbe Kreuz auch rechts. Dort ist es harmlos: eine
Zeile ist breit, wird von oben nach unten gelesen und mit einem gezielten Tipp
angefasst, nicht mit einer Wischbewegung durchfahren. **Dieselbe Anordnung ist
in der einen Gestalt richtig und in der anderen falsch** — und genau das
übersieht man, wenn man ein Muster über die ganze Oberfläche zieht, statt es je
Gestalt zu prüfen. *0.12.0 hat das Kreuz auf dem Finger sichtbar gemacht, weil
es unsichtbar war; dass es dort überhaupt nicht hingehört, ist erst im Betrieb
aufgefallen.*

Und die Folge war nicht nur ein Fehlgriff, sondern eine falsche Lesart der
ganzen Reihe: **sie las sich nicht mehr als vier Bilder, sondern als vier
Löschknöpfe.**

---

## 2. Die Entscheidung: was wohin wandert

Vier Wege standen zur Wahl, und drei sind aus einem benennbaren Grund
ausgeschieden.

**Verworfen: langes Drücken löscht.** Der lange Druck ist auf einer
Vorschaukachel **schon vergeben** — er greift die Kachel zum Umsortieren, seit
`makeSortable()` es so macht, und das soll ausdrücklich so bleiben. Eine Geste
zwei Bedeutungen zu geben, von denen eine unwiderruflich ist, ist schlechter als
das Problem.

**Verworfen: ein Bearbeitungsmodus über der Reihe** („Auswählen" / „Fertig", wie
in mancher Fotogalerie). Er löst es, kostet aber einen Zustand mehr und einen
Weg hinein und hinaus. **Für eine Reihe von selten mehr als sechs Kacheln ist
das zu viel Maschine.**

**Verworfen: das Kreuz kleiner oder weiter in die Ecke.** Das verschiebt die
Wahrscheinlichkeit, es beseitigt sie nicht — und es macht das Ziel für den, der
es *treffen* will, schlechter. **Ein Fehlgriff, der seltener passiert, ist immer
noch ein Fehlgriff, und die Folge ist unwiderruflich.**

**Gebaut: gelöscht wird am großen Bild.** Das ist der Weg, den jede Kamera und
jede Fotogalerie geht — man löscht, **was man ansieht**, nicht, was man in einer
Vorschau streift. Das große Bild ist groß, der Zähler daneben sagt, welches von
wie vielen es ist, und die Rückfrage nennt Foto oder Video beim Namen.

**Damit trägt die Kachelreihe auf dem Finger keine Zerstörung mehr.** Sie behält
genau zwei Aufgaben, und beide sind harmlos:

| Geste | Wirkung |
|---|---|
| antippen | zeigt das Bild groß |
| lange drücken, dann ziehen | verschiebt die Kachel |

**Am Zeigegerät bleibt das Kreuz, wo es war.** Dort gibt es kein Danebentippen,
und ein Klick aus der Reihe heraus ist der kürzere Weg, wenn man drei von acht
Fotos wegwerfen will. *Das ist der eine Punkt, an dem sich die beiden Geräte in
der Bedienung wirklich unterscheiden — er steht deshalb als Absatz im
Stylesheet, damit ihn niemand für ein Versehen hält und „aufräumt".*

### Und die Positionierung ist der einzige Unterschied

**Es gibt nicht zwei Bedienungen.** Der Papierkorb steht auf beiden Geräten an
derselben Stelle, in derselben Reihe, mit demselben Zeichen. Verschieden sind
zwei Dinge, und beide hängen am Zeiger und nicht an der Breite:

| | Zeigegerät | Finger |
|---|---|---|
| Größe je Knopf | 30 px | **44 px** |
| Sichtbarkeit | beim Überfahren | **dauerhaft** |

---

## 3. Was gebaut wurde, je Datei

### `public/app.js`

**Drei Zeichen kommen dazu** — `ICON_AUSSCHNITT`, `ICON_VOLLBILD`,
`ICON_PAPIERKORB`. Alle drei in derselben Strichstärke (`1.9`) und demselben
`viewBox` wie die Zeichen der Kopfzeile; sie sollen wie ein Satz aussehen und
nicht wie drei Herkünfte.

**Warum Zeichen und nicht Wörter:** sie liegen **auf** dem Bild und nicht
daneben. Ein Wort verdeckt dort Bildfläche in der Breite des längsten Wortes —
und es hat die Anlage zu einer ausgerechneten Zahl gezwungen (Abschnitt 4,
Befund A). *Der Ausschnitt ist das Zeichen, das jedes Fotoprogramm dafür führt:
zwei ineinandergeschobene rechte Winkel. Es ist nicht hübscher als ein Wort, es
ist **bekannt** — und das ist bei einem Zeichen der ganze Punkt.*

**Die drei Knöpfe stehen jetzt in einem Behälter `.vtools`** statt einzeln am
rechten Rand. Der Papierkorb ist neu; er ruft `DELETE /api/photos/:id` auf das
gerade gezeigte Bild, nach einer Rückfrage, die „Foto" oder „Video" beim Namen
nennt. Danach wird der Eintrag neu geholt und der Index gedeckelt, falls das
letzte Bild weg war.

**Ein Satz in der Erklärung unter dem Ablegefeld** sagt jetzt, wo gelöscht wird.

### `public/style.css`

- **`.vtools`** — eine Flexreihe oben rechts mit 6 px Lücke. **Oben rechts und
  nicht unten:** die Blätterpfeile liegen mittig an den Seitenkanten, der Zähler
  unten in der Mitte, und über die Mitte läuft der Wisch. *Die obere rechte Ecke
  ist die einzige, die von keiner Geste berührt wird* — und ein Papierkorb
  gehört aus dem Daumenbereich heraus und nicht hinein.
- **`.vfocus, .vfull, .vweg`** — 30 × 30 px, rund, derselbe Grund und derselbe
  Rahmen wie die Pillen vorher. Unter `pointer: coarse` **44 × 44**.
- **`.vweg { margin-left: 14px }`** — der Papierkorb steht abgesetzt. *Dieselben
  14 Pixel wie `.pill-sep` in der Filterzeile, und aus demselben Grund: die
  beiden davor stellen etwas ein, dieser hier nimmt etwas weg. Ohne den Abstand
  liest er sich als dritte Einstellung.*
- **Rot erst im Überfahren und in der Rückfrage**, nicht im Ruhezustand. Eine
  dauerhaft rote Fläche auf jedem Foto wäre ein Alarm, der nach einer Woche
  nicht mehr gelesen wird. *Rot bleibt in dieser Anlage dem Zerstören
  vorbehalten, und es soll etwas bedeuten, wenn es auftaucht.*
- **`@media (hover: none) { .thumb .del { display: none } }`** — der Kern. Die
  Zeile stand vorher da und setzte `opacity: 1`; sie setzt jetzt `display: none`.
- **`.vtools.offen`** hält die Reihe im Ausschnittmodus sichtbar. **Kein
  `:has()`** — das wäre der naheliegende Griff (der Zustand hängt am Kind) und
  der schlechtere: ein Browser, der `:has` nicht kennt, verwirft die **ganze**
  Regel, und dann verschwände die Reihe mitsamt dem einzigen Weg aus dem
  Ausschnittmodus heraus, sobald der Zeiger fortgeht. `drawViewer()` setzt die
  Klasse; das kann kein Browser missverstehen.

### `pruefung.js`

Vier neue Zusicherungen, eine geänderte. Siehe Abschnitt 6.

### `gegenprobe.js`

Zwei neue Rückbauten, **164** und **165**.

### Die Papiere

`CHANGELOG.md`, dieses Protokoll, der Projektstand (Revision 29, umbenannt auf
`_0_12_1`), die README (zwei Stellen) und das Sammelblatt (ein Punkt entfernt,
weil er gebaut ist — Regel 2 des Blatts).

---

## 4. Zwei Fehler, nebenbei gefunden

Beide sind **vorbestehend** und keine Folge dieser Runde. Sie fielen auf, weil
der Umbau genau an ihnen vorbeiging.

### Befund A — der Vollbildknopf saß auf einer ausgerechneten Textbreite

`.vfull` stand auf `right: 92px`. **Die 92 waren die Breite des Wortes
„Ausschnitt" bei 100 Prozent Schrift.** Die Anlage stellt die Schrift aber von
80 bis 120 Prozent — bei 120 schoben sich die beiden Pillen übereinander.

*Das stand als Punkt 3 unter „Offen geblieben" im Protokoll zu 0.12.0 und als
Zeile im Sammelblatt. Es ist mit dieser Runde erledigt, ohne dass es dafür einen
eigenen Schritt gebraucht hätte* — **eine Flexreihe braucht die Zahl nicht und
kann deshalb auch nicht falsch werden.**

### Befund B — das Ablegefeld stand auf dem Telefon dauerhaft im Arbeitszustand

`.drop:hover` und `.drop.over` stehen in **einer** Regel: beide färben Rand,
Schrift und Grund in den Akzent. Auf einem Berührungsbildschirm bleibt ein
`:hover` hängen, bis man woanders hintippt — **und damit stand das Feld
dauerhaft so da, als zöge gerade jemand eine Datei darüber.**

**Das ist schlimmer als ein optischer Schönheitsfehler.** `.over` ist die eine
Rückmeldung, die das Feld zu geben hat: *jetzt liegt etwas über dir*. Wenn sie
dauerhaft an ist, sagt sie nichts mehr.

Die Zeile dagegen steht im Abschnitt für `hover: none` und nimmt **nur das
Überfahren** zurück:

```css
.drop:hover:not(.over) {
  border-color: var(--line); color: var(--muted); background: var(--surface);
}
```

*Ohne `:not(.over)` hätte sie den Arbeitszustand gleich mit abgeräumt — beide
Wähler wiegen zwei Klassen, und die spätere gewinnt.* **Nachgemessen: mit dem
Finger meldet der Rand `rgb(38, 44, 51)`, unter der Maus im Überfahren
`rgb(255, 122, 26)`.**

**Warum 0.12.0 ihn nicht gefunden hat, ist die eigentliche Lehre.** Die Durchsicht
dort ist die hängengebliebenen Überfahrzustände durchgegangen — aber sie hat nach
solchen gesucht, die etwas **bewegen** (`transform`). Dieses Feld bewegt nichts;
es färbt sich nur um. **Ein Überfahrzustand, der buchstäblich derselbe ist wie
ein bedeutungstragender Zustand, ist der gefährlichere von beiden** — er fällt
optisch nicht auf, er entwertet eine Rückmeldung. *Steht als Stolperstein 177.*

---

## 5. Eigene Fehler im Bauen

### Der Zustand hing am Kind, gebraucht hat ihn die Mutter

**Der Ausschnittknopf trug seinen Zustand, die Reihe brauchte ihn.** Der erste
Entwurf hielt die Reihe im Ausschnittmodus über `.viewer:has(.vfocus.on)`
sichtbar. Das ist die naheliegende Schreibweise und war die falsche: **ein
Browser, der `:has` nicht kennt, verwirft die ganze Regel** — nicht nur diesen
Teil —, und dann verschwindet die Reihe, sobald der Zeiger fortgeht. Mit ihr
verschwindet der einzige Weg aus dem Ausschnittmodus heraus.

*Ersetzt durch eine Klasse `offen`, die `drawViewer()` setzt.* **Wo ein Zustand
ohnehin in JavaScript entsteht, gehört er an das Element, das ihn braucht, und
nicht in einen Wähler, der ihn errät.**

### Und ein Prüflauf, der aus der Umgebung heraus rot wurde

Der Schlusslauf über die fertige Nummer meldete **14 rote Zeilen** rund um
Mailversand und Selbstanmeldung — die erste nur mit `undefined · undefined`, die
zweite mit „Nicht angemeldet". **An der Sache hatte sich nichts geändert.**

Die Ursache lag daneben: ein versehentlich gestarteter voller Gegenprobenlauf
war vorher mit `pkill` auf den Treiber beendet und seine Wegwerfverzeichnisse
gelöscht worden — **acht `node server.js` liefen danach weiter und hielten ihre
Ports.** *Die Zusicherung „keine Prüflage lässt ihren Server zurück" greift dort
nicht: sie zählt die Server des laufenden Prüflaufs, und diese stammten aus
einem anderen Prozess.*

Aufgeräumt, neu gefahren: **3851 von 3851**. **Ein Prüflauf, der rot wird, ohne
dass sich die Sache geändert hat, ist zuerst eine Frage an die Maschine.**
*Steht als Stolperstein 179 — nach einem abgebrochenen Gegenprobenlauf gehört
`ps` dazu und nicht nur `rm`.*

---

## 6. Der Prüfstand

**Fünf Zusicherungen zu dieser Runde**, vier neu und eine geändert:

| Zusicherung | Was sie festhält |
|---|---|
| „Auf dem Finger trägt die Vorschaukachel kein Kreuz mehr" | `display: none` unter `hover: none` |
| „Am Zeigegerät bleibt es beim Überfahren" | `.thumb:hover .del { opacity: 1 }` steht weiter da |
| „Am Bildbereich gibt es einen Papierkorb" | `.vweg { margin-left: 14px }` — der Abstand ist Teil der Zusage |
| „Und der Vollbildknopf hängt nicht mehr an einer ausgerechneten Breite" | `right: 92px` kommt im Stylesheet nicht mehr vor |
| „Ohne Überfahren ist `.vtools` sichtbar" | *geändert* — prüfte vorher `.vfocus` und `.thumb .del` einzeln |

**Die zweite ist so wichtig wie die erste.** Ohne sie ließe sich das Kreuz
überall entfernen, ohne dass eine Prüfung rot wird — eine Zusicherung, die nur
das Verschwinden festhält, hält ein Verschwinden zu viel nicht auf. *Ein
Weglassen unterscheidet sich in einer Datei nicht von einem Vergessen; nur eine
zweite Zeile in die Gegenrichtung macht daraus eine Entscheidung.*

### Die Gegenprobe

Zwei neue Rückbauten, und beide zielen auf genau das, was diese Runde zusagt:

| # | Rückbau | Was er zurücknimmt | Namentlich rot |
|---|---|---|---|
| 164 | Das Kreuz kehrt auf die Vorschaukachel zurück | die Zeile `@media (hover: none) { .thumb .del { display: none } }` fällt weg | „Auf dem Finger trägt die Vorschaukachel kein Kreuz mehr" |
| 165 | Der Papierkorb rückt an die Einstellknöpfe heran | `margin-left: 14px` wird `0` | „Am Bildbereich gibt es einen Papierkorb" |

**Beide gefahren, beide getroffen, keiner stumm.** Je 3850 von 3851 bestanden,
je **eine** rote Zeile, und beide Male genau die erwartete — in der erwarteten
Gruppe. *328 und 329 Sekunden, in zwei Nebenspuren, jede in einer eigenen Kopie
aus `git archive HEAD`.*

**Dass 165 überhaupt greift, ist der Punkt an ihm.** Ein Abstand sieht wie
Zierde aus, und eine Zusicherung auf eine Zierde wäre Ballast. Hier ist er es
nicht: **er ist die Trennung zwischen Einstellen und Wegnehmen** — dieselbe
Trennung, deren Fehlen den Befund aus Abschnitt 1 überhaupt erzeugt hat.

**Was sie nicht decken:** die Größe der Knöpfe unter `pointer: coarse` und die
Lage der Reihe. Beides ist gemessen — im Browser, an drei Fenstern — und nicht
zugesichert; `jsdom` rechnet kein Layout. *Das ist derselbe offene Punkt wie in
0.12.0 (dort Punkt 6 unter „Offen geblieben") und keine neue Lücke.*

### Gemessen, nicht behauptet

Chromium, echte Fenster, `deviceScaleFactor: 2`:

| Fenster | Reihe | Deckung | Kreuz an der Kachel |
|---|---|---|---|
| 1440 × 900, Maus | 80 × 30 | 1 beim Überfahren | `flex` |
| 834 × 1112, Finger | **108 × 44** | **1 dauerhaft** | **`none`** |
| 390 × 844, Finger | **108 × 44** | **1 dauerhaft** | **`none`** |

---

## 7. Prüfungszahlen

| | vorher | nachher |
|---|---|---|
| Prüfungen | 3848 | **3851** |
| Rückbauten | 165 | **167** |
| `F_ROUTEN` | 69 | **69** |
| Vorgänge | zwanzig | **zwanzig** |
| Merkmale | dreizehn | **dreizehn** |
| Bestätigungszwecke | sieben | **sieben** |
| Karten im Systembereich | neunzehn | **neunzehn** |
| Formatnummer | 10 | **10** |
| Vokabular | elf | **elf** |
| persönliche Schlüssel | acht | **acht** |

*Drei Prüfungen mehr bei fünf berührten Zusicherungen: eine bestehende ist
umgeschrieben worden, und eine lief über eine Liste, die von drei Einträgen auf
zwei geschrumpft ist.*

**Der Server ist unberührt.** `server.js`, `db.js`, `auth.js`, `keys.js`,
`mail.js`, `anhaenge.js`, `zweifaktor.js` und `zugang.js` sind unverändert. Die
einzigen Dateien außerhalb von `public/` und den Papieren, die sich bewegen,
sind `pruefung.js`, `gegenprobe.js` und `package.json` samt Lockfile für die
Nummer.

---

## 8. Was ausdrücklich nicht passiert ist

- **Der lange Druck bleibt das Umsortieren.** Er bekommt keine zweite
  Bedeutung — ausdrücklich so entschieden.
- **Keine zweite Bedienung.** Der Papierkorb steht auf beiden Geräten an
  derselben Stelle im selben Markup; verschieden sind nur Größe und
  Sichtbarkeit, und beide hängen am Zeiger.
- **Kein Bearbeitungsmodus über der Reihe** und keine Mehrfachauswahl. Beides
  wäre ein Zustand mehr für eine Reihe von selten mehr als sechs Kacheln.
- **Keine neue Farbe.** Der Papierkorb kommt mit `--red` und `--red-dim` aus,
  die es beide gibt.
- **Kein Wegfall am Schreibtisch.** Das Kreuz an der Kachel bleibt dort; der
  Papierkorb kommt daneben.
- **Abschnitt 5 des Projektstands ist unberührt.** Wo ein Löschknopf steht, ist
  eine Gestaltungsentscheidung dieser Runde und keine Festschreibung. *Dieselbe
  Linie wie in 0.12.0, und dort ausdrücklich so entschieden.*

---

## 9. Offen geblieben

*Die Liste aus 0.12.0, um den erledigten Punkt gekürzt. Alles Übrige steht
unverändert im Sammelblatt.*

1. **Die Zeile einer Anmeldung läuft bei rund 1024 Pixeln aus ihrer Karte** —
   vorbestehend; der saubere Weg ist eine Behälterabfrage (`@container`).
2. **Eine Meldung kann auf dem Telefon die Vergleichsleiste verdecken.**
3. **Der Hinweis an der Zeitleiste kann auf schmalem Schirm hinauslaufen.**
4. **Die Erklärung unter dem Ablegefeld spricht von „Klick" und „Strg+V".**
   *Sie ist in dieser Runde um einen Satz gewachsen und damit nicht besser
   geworden — eine Fassung, die für beide Geräte gilt, steht weiterhin aus.*
5. **Eine Layoutprobe im Prüfstand.** Die Messungen in Abschnitt 6 liefen von
   Hand in einem echten Browser; sie gehören in den Prüflauf.
6. **Das Nachzeichnen der Filter beim Aufklappen hat keine Prüfung.**
7. **Der volle Gegenprobenlauf über alle 167 Rückbauten** gehört nachgeholt, wo
   Zeit dafür ist. *Gefahren sind in dieser Runde die zwei neuen.*
