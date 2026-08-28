# Änderungsprotokoll 0.12.2 — „Die Kachelreihe füllt die Breite"

**Version 0.12.2 · gebaut am 28. August 2026 · Fingerprint `e30a19c1` ·
Nacharbeit an 0.12.0/0.12.1, gefunden im Betrieb · KEINE Datenbankstufe, kein
Migrationsblock, der Server unberührt**

**Der zweite Befund vom selben Gerät, am selben Tag.** 0.12.1 hatte den
Papierkorb ans große Bild gebracht; beim Nachsehen fiel auf dem Bildschirmfoto
etwas anderes auf: **die Vorschaureihe unter dem Bild hört rechts früher auf als
der Bildbereich darüber.** Der Auftrag dazu war knapp und ließ beide Wege offen —
*entweder dort noch eine Kachel unterbringen und die Breite komplett nutzen, mit
gleich breitem Rand links und rechts, oder die Kacheln etwas vergrößern, so dass
der Rand ausgenutzt wird.*

**Die gebaute Lösung tut beides, und zwar je nach Gerät von selbst** — das ist
kein Kompromiß, sondern die Eigenschaft des gewählten Mittels.

**DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.2 ist **PATCH**. Eine
Kachelreihe, die die Breite nicht ausnutzt, ist ein Fehler und kein fehlendes
Bedienelement; es kommt nichts hinzu, was vorher nicht ging. **Und 0.12.1 war
schon vergeben:** sie ist am selben Tag herausgegangen, mit Fingerprint
`2e3f2e0b` in den Papieren. *Eine einmal vergebene Zahl wird nicht
umgeschrieben — Semantic Versioning, Punkt 3. Dieses Projekt hat genau daran
schon einmal einen offenen Punkt bekommen („Zwei Dateisätze tragen die Nummer
0.9.1"), und der steht bis heute im Projektstand.*

---

## Inhalt

1. [Der Befund, und warum er zwei Pixel groß ist](#1-der-befund-und-warum-er-zwei-pixel-groß-ist)
2. [Die Frage vor der Lösung: gehört das Löschen so, wie es ist?](#2-die-frage-vor-der-lösung-gehört-das-löschen-so-wie-es-ist)
3. [Vier Wege, und warum es das Raster wurde](#3-vier-wege-und-warum-es-das-raster-wurde)
4. [Die Zahl 60, und was sie kostet](#4-die-zahl-60-und-was-sie-kostet)
5. [Was gebaut wurde, je Datei](#5-was-gebaut-wurde-je-datei)
6. [Was es am Ziehen ändert](#6-was-es-am-ziehen-ändert)
7. [Der Prüfstand](#7-der-prüfstand)
8. [Prüfungszahlen](#8-prüfungszahlen)
9. [Was ausdrücklich nicht passiert ist](#9-was-ausdrücklich-nicht-passiert-ist)
10. [Offen geblieben](#10-offen-geblieben)

---

## 1. Der Befund, und warum er zwei Pixel groß ist

Die Vorschaureihe stand als umbrechender Flexkasten da: `flex-wrap: wrap`, ein
Abstand von 7 Pixeln, und die Kachel mit **62 Pixeln fest**.

**Eine feste Kachelbreite in einem umbrechenden Kasten heißt: die Spaltenzahl
ist eine Treppe über der Fensterbreite, und was nicht mehr hineinpasst, bleibt
als Streifen rechts liegen.** Wie breit dieser Streifen ist, hängt vom Zufall
der Gerätebreite ab — er ist `(Kasten + 7) mod 69`.

**Nachgemessen im Browser, ein Eintrag mit zwölf Fotos:**

| Fenster | Kasten | Kacheln je Reihe | Rest rechts |
|---|---|---|---|
| **360 px** *(das gemeldete Gerät)* | 336 | **4+4+4** | **67 px** |
| 390 px | 366 | 5+5+2 | 28 px |
| 412 px | 388 | 5+5+2 | 50 px |
| 428 px | 404 | 5+5+2 | 66 px |

**Auf dem gemeldeten Gerät scheitert die fünfte Kachel an ZWEI Pixeln.** Fünf
brauchen 5 × 62 + 4 × 7 = **338**, der Kasten misst **336**. Zwei Pixel — und
dafür bleiben 67 leer, ein Fünftel der Breite.

**Warum das so ins Auge fällt und an anderen Stellen nicht:** der Bildbereich
darüber reicht bis an beide Kanten, das Ablegefeld darunter ebenso. Dazwischen
liegt eine Reihe, die vorher aufhört. *Es ist nicht die Leere, die stört, es ist
die gebrochene Flucht* — dieselbe Ordnung, um die es in 0.12.0 beim Wegfall der
Kastenebene ging.

---

## 2. Die Frage vor der Lösung: gehört das Löschen so, wie es ist?

Der Auftrag stellte zuerst etwas anderes fest — sinngemäß: *auf dem Schreibtisch
sollen Löschen und Ausschnitt über das große Bild gehen, zusätzlich soll das
Löschen auch über die Vorschaukacheln gehen; auf dem Telefon soll das Kreuz an
der Kachel ausgeblendet und **auch nicht antippbar** sein.*

**Das ist seit 0.12.1 genau so gebaut — und der Nachweis ist keine Behauptung,
sondern eine Treffprobe.** `document.elementFromPoint()` auf die Ecke, in der
das Kreuz sitzt:

| Gerät | was an der Kreuzecke liegt |
|---|---|
| Finger (360, 390, 834 px) | **`.thumb`** — die Kachel selbst |
| Maus (1440 px) | **`.del`** — das Kreuz |

**`display: none` nimmt das Kreuz aus dem Trefferbaum heraus.** Es ist dort also
weder zu sehen noch zu treffen. *Ein `opacity: 0` hätte das nicht geleistet:
unsichtbar, aber weiterhin antippbar — auf einem Bildschirmfoto sähe beides
gleich aus.* **Genau dieser Unterschied bekommt in dieser Runde eine eigene
Zusicherung und einen eigenen Rückbau** (Abschnitt 7), denn er ist der Kern des
Befundes aus 0.12.1: nicht dass man das Kreuz *sieht*, sondern dass man es
*trifft*.

**Gebaut wurde daran deshalb nichts.** Das steht hier trotzdem, weil eine Frage,
die mit „ist schon so" beantwortet wird, sonst nirgends aktenkundig wird — und
in einem halben Jahr als neue Frage zurückkommt.

---

## 3. Vier Wege, und warum es das Raster wurde

Vier Lösungswege wurden unabhängig voneinander ausgearbeitet, jeder mit
ausgerechnetem Verhalten über alle sechs gemessenen Breiten, und anschließend
aus drei Blickwinkeln bewertet — **Robustheit, Hausregeln, Bruchgefahr**.
Alle drei kürten denselben Sieger, jeder mit 9 von 10.

| Weg | Was er tut | Warum nicht |
|---|---|---|
| **Raster mit `auto-fill`** | zählt die Spalten aus der Breite aus, verteilt den Rest in die Spalten | **gebaut** |
| Fünf Spalten fest (Flex) | teilt den Kasten durch fünf | Der Telefonabschnitt deckt Kästen von 296 bis 676 Pixeln ab, Faktor 2,3. Fünf Spalten heißen dort 53,6 Pixel beim schmalsten und 129,6 beim breitesten Fall. **Quer gehalten wären es 156.** |
| Fünf Spalten fest (Raster) | dasselbe mit `repeat(5, 1fr)` | dieselbe Rechnung, dasselbe Ergebnis |
| Kleinere Lücke (`gap: 6px`) | dreht nur an einer Stellschraube | Gewinnt bei 360 und 428, **verliert bei 390 und 412** (dort wächst der Rest von 28 auf 32 und von 50 auf 54). Der Rest verschwindet nicht, er zieht um. |

**Der Ausschlag gab ein Satz, der schon im Stylesheet steht.** Beim Kartenraster
der Übersicht ist dieselbe Entscheidung längst gefallen und begründet worden:
*„auto-fill mit 150 als Mindestmaß braucht dafür keinen zweiten Umbruchpunkt:
unter 320 Pixeln Breite fällt es von selbst auf eine Spalte zurück."* Eine feste
Spaltenzahl wäre **die einzige Ausnahme von einer Regel gewesen, die dieses
Projekt für denselben Fall schon getroffen hat.**

### `auto-fill` und nicht `auto-fit`

Die beiden sehen gleich aus, solange genug Kacheln da sind, und gehen bei
**wenigen** auseinander: `auto-fit` klappt die leeren Spalten zusammen und
verteilt ihren Platz auf die vorhandenen. **Ein Eintrag mit zwei Fotos bekäme
auf 366 Pixeln zwei Kacheln von 179,5 Pixeln** — zwei Platten, fast so hoch wie
das Ablegefeld darunter, und die Reihe sähe bei jedem Eintrag anders aus als
beim nächsten.

*Die Vorschau ist eine Reihe gleich großer Marken. Wie groß sie sind, darf an
der Breite des Schirms hängen — nicht daran, wie viele Fotos jemand hochgeladen
hat.*

---

## 4. Die Zahl 60, und was sie kostet

`minmax(60px, 1fr)`. **Die Untergrenze entscheidet allein darüber, WANN eine
Spalte dazukommt**; wie breit die Kachel dann wirklich wird, rechnet das Raster
aus, und schmaler als die Untergrenze wird sie nie.

**Der erste Entwurf stand auf 62 — der heutigen Kachelgröße — und war schlechter.**
Mit 62 bekäme das gemeldete 360er-Gerät weiterhin nur **vier** Kacheln (dann
allerdings 78,75 Pixel breit und bündig). Das wäre der zweite der beiden
angebotenen Wege gewesen. **Mit 60 bekommt es fünf**, und das war der erste und
zuerst genannte.

**Warum nicht 61,6, also genau auf die Kante?** Weil das der nächste Fehler mit
Ansage wäre: ein Pixel mehr Seitenrand, ein Pixel mehr Abstand, und die fünfte
Kachel ist wieder weg, ohne dass jemand die Vorschaureihe angefasst hätte. **60
lässt acht Pixel Luft.**

### Gemessen, nicht gerechnet — zwölf Fotos, echte Fenster

| Kasten | vorher | nachher | Rest rechts |
|---|---|---|---|
| 336 *(Fenster 360)* | 4+4+4 zu 62 | **5+5+2 zu 61,6** | 67 → **0** |
| 366 *(Fenster 390)* | 5+5+2 zu 62 | **5+5+2 zu 67,6** | 28 → **0** |
| 388 *(Fenster 412)* | 5+5+2 zu 62 | **5+5+2 zu 72,0** | 50 → **0** |
| 404 *(Fenster 428)* | 5+5+2 zu 62 | **6+6 zu 61,5** | 66 → **0** |
| 798 *(Tablett 834)* | 11+1 zu 62 | *unverändert* | 46 |
| 576 *(Schreibtisch 1440)* | 8+4 zu 62 | *unverändert* | 31 |

**Bei 428 Pixeln fällt eine ganze Zeile weg.** Und die Kachel wächst mit dem
Schirm, statt fest zu stehen — *beides zusammen ist der Punkt: mehr Kacheln, wo
sie hineinpassen, größere, wo nicht.*

### Der Preis, ausgeschrieben

**An drei Kastenbreiten — 328, 395 und 462 — trifft die Kachel ihre Untergrenze
und misst dort 60 statt 62 Pixel.** Zwei Pixel weniger als heute, und immer noch
weit über dem Fingermaß von 44. *Das ist die unvermeidliche Eigenschaft jedes
Verfahrens, das die Spaltenzahl aus der Breite ableitet: der Verlauf ist eine
Säge und keine Gerade, und unmittelbar vor jeder Stufe ist die Kachel am
größten, unmittelbar danach am kleinsten.* Wer die beiden Geräte nebeneinander
legt, sieht auf dem breiteren die kleineren Kacheln. **Das lässt sich nicht
wegrechnen, nur erklären — und es steht deshalb im Stylesheet.**

---

## 5. Was gebaut wurde, je Datei

### `public/style.css` — zwei Zeilen und eine Begründung

Im Telefonabschnitt, unmittelbar hinter der Deckelung des Bildbereichs, weil die
Vorschaureihe auch im Markup direkt darunter steht:

```css
.thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); }
.thumb  { width: auto; height: auto; aspect-ratio: 1/1; }
```

**`height: auto` ist keine Zutat, sondern die Bedingung.** Neben einer festen
Höhe von 62 bliebe das Seitenverhältnis wirkungslos, und aus der Kachel würde
ein liegendes Rechteck. **`width: auto` ebenso** — ein Rasterkind mit fester
Breite nimmt seine Spur nicht an und stünde mit 62 Pixeln in einer 72 Pixel
breiten Spalte, den Rest wieder daneben.

*`aspect-ratio` ist kein neuer Begriff im Stylesheet: die Karte der Übersicht,
der Anhangbereich und die Vergleichsspalte führen ihn bereits.*

**Die Grundregel bleibt unangetastet.** Sie gilt am Schreibtisch, und dort ändert
sich nichts.

### `pruefung.js`

Fünf neue Zusicherungen. Siehe Abschnitt 7.

### `gegenprobe.js`

Fünf neue Rückbauten, **166 bis 170**.

### Die Papiere

`CHANGELOG.md`, dieses Protokoll, der Projektstand (Revision 30, umbenannt auf
`_0_12_2`) und die README.

---

## 6. Was es am Ziehen ändert

**Der Prüfstand deckt den Ziehweg der Vorschaureihe überhaupt nicht ab**, und
das ist bei dieser Änderung keine Nebensache. `jsdom` rechnet kein Layout —
`getBoundingClientRect()` liefert dort lauter Nullen, `document.elementFromPoint`
ist an vier Stellen durch eine Attrappe ersetzt, und keine einzige Prüfung
schickt einen Zeiger auf eine Kachel. **Ein Bruch am Umsortieren der Fotos würde
von `npm test` nicht bemerkt.** *Das ist ein vorbestehender Zustand und keine
Folge dieser Runde — aber die Runde fasst genau dieses Bauteil an.*

**Deshalb von Hand im echten Browser, mit beiden Zeigerarten:**

| Fenster | Zeiger | Griff gemeldet | Kachel verschoben | nach dem Neuladen |
|---|---|---|---|---|
| 360 px *(Raster)* | Finger, nach 0,52 s | ja | **ja** | **hält** |
| 390 px *(Raster)* | Finger, nach 0,52 s | ja | **ja** | **hält** |
| 1440 px *(unverändert)* | Maus | ja | **ja** | **hält** |

*Verglichen wurden die Fotokennungen und nicht die Nummern an der Kachel — die
Nummer ist die Position und steht nach jedem Umsortieren wieder als 1 bis 12 da.
Der erste Anlauf verglich sie und meldete „unverändert", obwohl verschoben
worden war.*

**Warum es trägt:** `makeSortable` arbeitet am DOM und nicht am Layoutverfahren.
Es hängt die Kachel mit `insertBefore` im Elternknoten um, und ein Raster ohne
eigene Flußangabe setzt seine Kinder in Markup-Reihenfolge zeilenweise — dieselbe
Reihenfolge, die der umbrechende Kasten erzeugte. **Das Ziel wird dabei größer,
nicht kleiner:** die Mittenprüfung misst an der gemessenen Kachel, und die ist
jetzt 61,5 bis 72 statt 62 Pixel breit.

### Eine echte Verhaltensänderung, und sie wird nicht verschwiegen

**Bisher lag rechts in jeder vollen Zeile ein toter Streifen** — 67 Pixel auf dem
gemeldeten Gerät —, auf dem ein Finger sicher keine Kachel griff. **Den gibt es
nicht mehr; die Zeile ist lückenlos Kachel.** Wer auf der Reihe aufsetzt und
länger als die Haltezeit ruhig liegen bleibt, greift jetzt an jeder Stelle eine.

*Das ist die gewollte Folge des Auftrags — die Breite soll ausgenutzt werden —
und der tote Streifen war ein Versehen, keine Auslassstelle mit Absicht.* Die
Wischtoleranz fängt weiterhin jeden Finger ab, der sich **vor** Ablauf der
Haltezeit bewegt, und das ist der normale Fall beim Scrollen.

---

## 7. Der Prüfstand

**Fünf neue Zusicherungen:**

| Zusicherung | Was sie festhält |
|---|---|
| „Und zwar herausgenommen, nicht nur unsichtbar gemacht" | die Regel für das Kreuz darf nicht auf `opacity`/`visibility` lauten |
| „Die Vorschaureihe steht auf dem Telefon als Raster" | `repeat(auto-fill, minmax(60px, 1fr))` |
| „Und zwar mit auto-fill, das die leeren Spalten offenhält" | **kein** `auto-fit` in dieser Regel |
| „Und die Kachel gibt dafür ihre festen Maße ab und bleibt quadratisch" | `width: auto; height: auto; aspect-ratio: 1/1` |
| „Am Schreibtisch bleibt die Kachel bei ihren festen 62 Pixeln" | die Grundregel ist unangetastet |

**Die erste und die letzte zeigen in die Gegenrichtung**, und beide braucht es.
Die erste hält den Unterschied fest, auf den es beim Löschkreuz ankommt —
*unsichtbar ist nicht dasselbe wie unantastbar*. Die letzte sichert, dass der
Schreibtisch unberührt bleibt: die Pixelmessung von Hand belegt das zwar, aber
**eine Messung von Hand färbt nichts rot.**

### Die Gegenprobe

| # | Rückbau | Namentlich rot |
|---|---|---|
| 166 | Das Kreuz an der Kachel wird nur durchsichtig, nicht herausgenommen | „Und zwar herausgenommen, nicht nur unsichtbar gemacht" |
| 167 | Die Vorschaureihe fällt auf den umbrechenden Kasten zurück | „Die Vorschaureihe steht auf dem Telefon als Raster" |
| 168 | Die leeren Spalten klappen zusammen (`auto-fit`) | „Und zwar mit auto-fill …" |
| 169 | Die Kachel behält ihre feste Höhe und wird zum Rechteck | „… bleibt quadratisch" |
| 170 | Die Grundgröße der Kachel verrutscht | „Am Schreibtisch bleibt die Kachel bei ihren festen 62 Pixeln" |

**Alle fünf gefahren, alle fünf getroffen, keiner stumm.** Drei von ihnen färben
*zwei* Zeilen — das ist kein Streuschaden, sondern die Bauart der Zusicherungen:
wer die Rasterregel entfernt, nimmt zugleich die Grundlage für die Frage, ob dort
`auto-fill` steht.

| # | bestanden | rote Zeilen | Dauer |
|---|---|---|---|
| 166 | 3854 von 3856 | 2 | 346 s |
| 167 | 3854 von 3856 | 2 | 347 s |
| 168 | 3854 von 3856 | 2 | 332 s |
| 169 | 3855 von 3856 | 1 | 331 s |
| 170 | 3855 von 3856 | 1 | 319 s |

**168 und 169 mussten zweimal gefahren werden, und der erste Anlauf war meine
eigene Schuld.** Während die Gegenprobe lief, habe ich die Server aufgeräumt, die
für die Fingerprint-Messung offenstanden — mit einem `kill` auf `server.js`.
**Das trifft die Prüfserver der Gegenprobe genauso**, denn sie heißen gleich; die
beiden Läufe rissen nach rund hundert Sekunden mit „fetch failed" ab. *Sie hatten
ihre roten Zeilen zu diesem Zeitpunkt bereits gezeigt — und das zählt nicht: ein
abgerissener Lauf beweist nichts (Stolpersteine 138, 161, 170).* Neu gefahren,
ohne dass währenddessen irgendetwas angefasst wurde, mit dem Ergebnis oben.

**Das ist die Gegenrichtung zu Stolperstein 179**, der aus der Runde davor stammt:
dort blieben nach einem abgeschossenen Gegenprobenlauf Server stehen und färbten
einen späteren Prüflauf rot. **Beides ist dieselbe Ursache** — die Prozesse der
Gegenprobe und die eigenen sind am Namen nicht zu unterscheiden. *Der Eintrag ist
entsprechend erweitert worden.*

**166 ist der wichtigste von den fünfen.** Er ersetzt `display: none` durch
`opacity: 0` — und das Ergebnis sieht auf einem Bildschirmfoto **richtig aus**.
*Wenn dafür keine Zeile rot wird, sichert der Prüfstand nur das Aussehen und
nicht das Verhalten.*

### Eine Falle beim Schreiben, zum dritten Mal

**Der Prüfstand liest den ROHEN Text des Stylesheets, Kommentare eingeschlossen**
(Stolperstein 175). Die Zusicherung über die drei Umbruchpunkte sammelt ihre
Zahlen aus `@media[^{]+\{` — **eine Medienbedingung, die in einem Kommentar nur
zitiert wird, zählt mit.** Der Erklärtext dieser Runde spricht deshalb von „der
Telefonregel" und schreibt keine Bedingung aus. *Dieselbe Vorsicht gilt für
`katalog`/`kartei` und für eine ausgeschriebene feste Schriftgröße — beide haben
eigene Zusicherungen, die jede Zeile der Datei lesen.*

**Und die Papiere werden ebenso gelesen.** Der Schlusslauf dieser Runde wurde
einmal rot, weil in diesem Protokoll das Wort stand, das der Sprachwächter als
deutsche Ersatzform für *Downgrade* führt. **Gemeint war es hier nicht so** — es
ging um eine Verschlechterung und nicht um eine ältere Fassung —, aber das kann
der Wächter nicht wissen, und ein Wort mit zwei Bedeutungen ist genau das,
wogegen eine feste Wortliste steht. *Ersetzt durch „Bruchgefahr". Und diese
Zeile schreibt es nicht aus, sonst fiele sie selbst darüber.*

---

## 8. Prüfungszahlen

| | vorher | nachher |
|---|---|---|
| Prüfungen | 3851 | **3856** |
| Rückbauten | 167 | **172** |
| `F_ROUTEN` | 69 | **69** |
| Vorgänge | zwanzig | **zwanzig** |
| Merkmale | dreizehn | **dreizehn** |
| Bestätigungszwecke | sieben | **sieben** |
| Karten im Systembereich | neunzehn | **neunzehn** |
| Formatnummer | 10 | **10** |
| Vokabular | elf | **elf** |
| persönliche Schlüssel | acht | **acht** |

**Der Server ist unberührt**, und diesmal auch `public/app.js`: die einzige
ausgelieferte Datei, die sich bewegt, ist **`public/style.css`** — dazu
`pruefung.js`, `gegenprobe.js` und `package.json` samt Lockfile für die Nummer.

---

## 9. Was ausdrücklich nicht passiert ist

- **Am Schreibtisch ändert sich nichts.** Nachgemessen: die Eintragsseite ist bei
  1100, 1280 und 1440 Pixeln **Pixel für Pixel dieselbe**. Der Vergleich fand
  sonst zwei Zeitstempel („08:00" gegen „08:01") und einen Zähler („Neu seit
  28.08. 1" gegen „0") — Zustand zweier Läufe, kein Layout.
- **Das Tablett bleibt, wie es war.** Bei 834 Pixeln stehen weiterhin 11+1
  Kacheln mit 46 Pixeln Rest. *Der Grund ist nicht Bequemlichkeit, sondern ein
  Unterschied in der Sache: auf dem Telefon bricht die Reihe schon bei acht
  Fotos um, auf dem Tablett erst bei zwölf.* **Ein Rest hinter der letzten
  Kachel ist ein Rand; ein Rest hinter einer vollen Zeile ist ein Loch.** Steht
  in Abschnitt 10.
- **Das Löschkreuz wird nicht angefasst.** Es steht am Zeigegerät auf der Kachel
  und auf dem Berührungsbildschirm nirgends, seit 0.12.1 — genau so, wie es der
  Auftrag beschreibt (Abschnitt 2).
- **Der lange Druck bleibt das Umsortieren.**
- **Kein vierter Umbruchpunkt.** Die Spaltenzahl fällt aus der Breite; es bleibt
  bei **1024, 860 und 700**.
- **Keine neue Farbe, kein neuer Begriff im Stylesheet.** Raster mit `auto-fill`
  und `aspect-ratio` stehen beide schon mehrfach darin.
- **Das Kreuz an den Bildern eines Kommentars bleibt sichtbar und antippbar.**
  Es sieht aus wie derselbe Fall und ist keiner: die Kachel dort misst 86 statt 62
  Pixel, das Kreuz sitzt 3 Pixel von der Ecke eingerückt statt bündig, die Bilder
  stehen selten zu mehr als dreien nebeneinander — **und es gibt für sie keinen
  zweiten Löschweg.** Nähme man es dort weg, ließe sich ein Bild am Kommentar
  auf dem Telefon gar nicht mehr entfernen. *Geprüft und bewusst gelassen.*
- **Abschnitt 5 des Projektstands ist unberührt.** Wie eine Kachelreihe ihre
  Breite aufteilt, ist eine Gestaltungsentscheidung und keine Festschreibung.
  *Dieselbe Linie wie in 0.12.0 und 0.12.1.*

---

## 10. Offen geblieben

1. **Das Tablett behält seinen Rest von 46 Pixeln** (Kasten 798, 11+1 Kacheln).
   Dieselben zwei Zeilen im 1024er Abschnitt lösten es — 12 Spalten zu 60,1
   Pixeln —, und der Schreibtisch bei 1100 und darüber bliebe unberührt. *Nicht
   mitgeliefert, weil der Befund vom Telefon kam und die Reihe auf dem Tablett
   erst ab zwölf Fotos überhaupt umbricht.* **Eine Zeile Arbeit, wenn es
   gewünscht wird.**
2. **Der Ziehweg der Vorschaureihe hat keine einzige Prüfung** (Abschnitt 6).
   Vorbestehend, und mit `jsdom` nicht zu heilen — es gehört zu Punkt 3.
3. **Eine Layoutprobe im Prüfstand.** Alle Messungen dieser Runde liefen von Hand
   in einem echten Browser: Spaltenzahl, Kachelbreite, Rest rechts, die
   Treffprobe am Kreuz und der Pixelvergleich. *Sie gehören in den Prüflauf, und
   dafür braucht er etwas, das Layout rechnet.* **Das ist inzwischen der dritte
   Punkt in Folge, der daran hängt.**
4. **Das Abspielzeichen am Video wächst nicht mit.** Es steht fest auf 16 Pixeln
   und ist auf einer Kachel von 72 anteilig kleiner als auf einer von 62 (22
   statt 26 Prozent der Kante). Nachziehen ließe es sich nicht ohne weiteres:
   sein Wähler führt die Vorschaureihe des Vollbilds mit, und die soll unberührt
   bleiben. *Es braucht einen eigenen, herausgelösten Wähler — klein, aber eine
   eigene Entscheidung.*
5. **Das Vorschaubild wird auf der langen Seite mit 400 Pixeln gerechnet.** Je
   breiter die Kachel, desto näher rückt sie an diese Grenze; ein Panorama liegt
   bei einer Kachel von 72 Pixeln und dreifacher Dichte bereits darüber. *Die
   Anlage trägt dieselbe Unschärfe an der Karte der Übersicht längst und
   sehenden Auges — dort läuft dasselbe Bild bei doppelter bis zweieinhalbfacher
   Hochrechnung.* Kein neuer Fehler, aber die Kachel rückt näher heran.
6. **Die Erklärung unter dem Ablegefeld spricht von „Klick" und „Strg+V".**
   Unverändert offen aus 0.12.1.
7. **Die Zeile einer Anmeldung läuft bei rund 1024 Pixeln aus ihrer Karte**,
   **eine Meldung kann die Vergleichsleiste verdecken**, und **der Hinweis an der
   Zeitleiste kann auf schmalem Schirm hinauslaufen.** Alle drei unverändert.
8. **Der volle Gegenprobenlauf über alle 172 Rückbauten** gehört nachgeholt, wo
   Zeit dafür ist. *Gefahren sind in dieser Runde die fünf neuen.*
