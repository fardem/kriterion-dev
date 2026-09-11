# Änderungsprotokoll 0.27.0 — „Die wählbare Bildablage"

**Eine Funktion mit einer Auflage, dazu die Ableitungen · gebaut am 10.
September 2026 auf 0.26.0 (`9ad0be7b`).**

> **FINGERPRINT DIESER RUNDE: `9f6741b5`** — gerechnet am fertigen Stand,
> **vor dem Einspielen**.
>
> **AUS DREI QUELLEN, und die dritte ist die stärkste:**
>
> | Quelle | Wert |
> |---|---|
> | Am Arbeitsbaum nachgerechnet *(dieselben achtzehn Dateien, die der Handgriff in der README nennt)* | **`9f6741b5`** |
> | Aus dem **Server selbst** gelesen, mit frischem Datenverzeichnis gestartet und über `/api/stats` befragt | **`9f6741b5`** |
> | **Aus der laufenden Installation gemeldet** *(Betreiber, 11. September 2026)* | **`9f6741b5`** |
>
> **DIE DRITTE ZEILE IST KEINE DRITTE RECHNUNG, SONDERN DER BEWEIS:** *sie sagt,
> dass das EINGESPIELTE dasselbe ist wie das GEBAUTE.* **Der offene Punkt, der
> hier bis zum Einspielen stand, ist damit geschlossen.**
>
> **ER HAT WÄHREND DIESER RUNDE VIERMAL GEWECHSELT:**
>
> | | |
> |---|---|
> | `ca68c8c0` | der Stand, wie er nach dem Bauen dalag |
> | `56e508ab` | nach der Antwort auf F7 — *„behalten, aber kürzer"* |
> | `286739a4` | nach dem **zweiten** Anlauf — die gekürzte Fassung war kein deutscher Satz mehr |
> | `276c4f75` | nach dem **dritten** — die Empfehlung fällt, der Schlüssel wird umbenannt |
> | **`9f6741b5`** | nachdem die Herleitung der Güte 90 in `images.js` nachgetragen wurde |
>
> *Die ersten drei Male ging es um DENSELBEN SATZ — drei Sprachdateien, beim
> dritten dazu `public/app.js`. Beim vierten hat sich **nur ein Kommentar**
> geändert: die nachgetragene Herleitung der Güte 90 in `images.js`.* **Ein
> Kommentar bewegt den Fingerprint genauso wie eine Anweisung**, *und das ist
> kein Mangel der Rechnung, sondern ihr Zweck.*
>
> **KEINER DER DREI GRIFFE WAR EINE VERFEINERUNG** — jeder war eine
> Zurückweisung mit einem eigenen Grund. *Die Begründungen stehen bei BA 6, in
> einer Tafel; sie gehören dorthin und nicht hierher.* **Gilt: `9f6741b5`.**

> **DIE FRAGETAFEL IST NACH DEM BAUEN DURCHGEGANGEN WORDEN UND NICHT DAVOR,
> und das gehört als erstes ins Papier.** *Der Betreiber hat die Runde am
> 10. September 2026 mit den Worten in Auftrag gegeben:* **„Keine Ahnung was
> wir damals für die 27.0 ausgemacht haben."** *Damit lag keine Antwortspalte
> vor; gebaut wurde nach der Vorschlagsspalte.*
>
> **NOCH AM SELBEN TAG IST DIE TAFEL VOLLSTÄNDIG DURCHGEGANGEN WORDEN**, in
> zwei Runden: F1, F3, F4 und F6 zuerst, dann F5, F7, F8 und F10. *F2 war im
> Auftrag selbst vorgegeben, F9 hatte gar keine Wahl zu treffen.*
>
> **NEUN SIND WIE VORGESCHLAGEN. EINE WEICHT AB — F7:** *der Satz an der
> Einfügestelle nennt die FOLGE und gibt keinen Rat.* **Er hat drei Anläufe
> gebraucht** (BA 6).
>
> **REGEL 11 DES PROJEKTSTANDS („ein Vorschlag ist keine Antwort") IST IN
> DIESER RUNDE TROTZDEM NICHT ERFÜLLT** — sie verlangt die Antwort VOR der
> ersten Zeile, und die lag nicht vor. *Das steht hier als offener Punkt und
> nicht als Fußnote: dass das Ergebnis hinterher bestätigt wurde, macht die
> Reihenfolge nicht richtig.*
>
> **EIN ZUSATZ DES BETREIBERS IST IN DIE BAUFORM EINGEGANGEN:** *„die heutige
> Einstellung wie wir Bilder reinholen ist unter den Knopf ‚standart' zu
> finden."* **Die Wahl ist deshalb keine Auswahlliste und keine Reihe
> Radioknöpfe geworden, sondern drei Zeilen mit je einem Knopf „Standard"** —
> dieselbe Bauform, die „Suchanbieter" und „Sprachen" schon tragen.
> *Nachgesehen: Radioknöpfe kommen in dieser Oberfläche überhaupt nicht vor.*

---

## Die Versionsnummer

**0.27.0 ist ein MINOR — Regel 5.1.**

**Nicht, weil es eine Wahl gibt — die gibt es seit 0.19.0 als Häkchen.**
*Sondern weil ein **drittes Verfahren** dazukommt: die Installation kann danach
etwas ablegen, was sie vorher nicht konnte.*

**Und die Migration allein würde es schon tragen** — ein gespeicherter Wert
ändert seine Gestalt. *Die Ableitungen wären für sich ein PATCH; sie fahren
mit, weil ein Durchgang über den Bestand billiger ist als zwei.*

| | |
|---|---|
| **`F_ROUTES`** | **72 — unverändert.** Die Wahl reist über die vorhandene Einstellungsroute, der Bestandslauf über `POST /api/images/convert` |
| **Austauschformat** | **15 — unverändert.** Im Export steht der MIME-Typ längst an jedem Bild |
| **Schema** | **nicht angefasst.** Die Wahl ist eine Zeile in der Einstellungstabelle |
| **Migrationsblöcke** | **10 → 11.** Der elfte übersetzt `convertImages` nach `imageStore` |
| **`OWNER_KEYS`** | **7 → 7.** `convertImages` fällt, `imageStore` kommt — *einer geht, einer kommt, und das steht hier, weil eine unveränderte Zahl sonst wie ein vergessener Eintrag aussieht* |
| **Karten** | **19 — unverändert** |

### Die Zahl, die nicht stimmte — F1, zweiter Teil

**Der Auftrag hat eine Unstimmigkeit gemeldet und das Nachzählen verlangt:**
*„Fahrplan und Projektstand sprechen vom Bruch als ‚zehn Migrationsblöcke',
`db.js` trägt aber vierzehn Migrationsfunktionen."*

**NACHGEZÄHLT, UND BEIDE ZAHLEN STIMMEN — sie zählen Verschiedenes:**

| | vor dieser Runde | Erklärung |
|---|---|---|
| **markierte** Blöcke | **10** | tragen die Marke `— ENTFAELLT MIT 1.0` und fallen mit dem Bruch |
| Blöcke insgesamt | **14** | dazu die vier Umbenennungsblöcke aus 0.24.1 bis 0.24.3 |
| Migrations**funktionen** | **16** | 0.24.1 allein hat drei (Tabellen, Spalten, Werte) |

**Die Papiere zählen die MARKIERTEN, und das ist richtig:** *sie sprechen vom
Bruch, und nur die markierten fallen dort weg.* **Keine Zahl war
stehengeblieben.** *Diese Runde macht aus den zehn elf.*

---

## Die Fragetafel

| # | Antwort | | |
|---|---|---|---|
| **F1** | Ein weiterer Migrationsblock, der alte Schlüssel fällt in demselben Griff. Die Zahl der Blöcke ist nachgezählt (siehe oben) | wie vorgeschlagen | **entschieden** |
| **F2** | Die Vorgabe einer frischen Installation bleibt **WebP verlustfrei** | wie vorgeschlagen | **vom Betreiber vorgegeben** |
| **F3** | Die Wahl trifft **nur das Original**; die Ableitungen gehen unabhängig davon auf WebP | wie vorgeschlagen | **entschieden** |
| **F4** | **`medium` wird NICHT `nearLossless`** — gemessen, und die Messung spricht deutlich dagegen | wie vorgeschlagen, **jetzt mit Zahlen** | **entschieden** |
| **F5** | Der Bestand wird auf Knopfdruck nachgezogen, **niemals beim Umschalten** | wie vorgeschlagen | **entschieden** |
| **F6** | Zwischenablage und hochgeladenes PNG werden **gleich** behandelt; die Karte nennt den Preis | wie vorgeschlagen | **entschieden** |
| **F7** | Der billigste Weg steht als Satz **an der Einfügestelle** | **ABWEICHUNG — die FOLGE steht dort, die Empfehlung fällt** | **entschieden** |
| **F8** | 0.27.0 bleibt **MINOR** | wie vorgeschlagen | **entschieden** |
| **F9** | **Kein neuer Weg** — `F_ROUTES` bleibt bei 72 | wie vorgeschlagen | *keine Wahl zu treffen* |
| **F10** | Die Klemme wird **geerbt**: Eigentümer, sieben Schlüssel | wie vorgeschlagen | **entschieden** |

> **DIE VIERTE SPALTE IST NEU UND SIE IST DER PUNKT.** *Bisher trug diese Tafel
> nur, WAS entschieden wurde. Wenn die Antworten — wie in dieser Runde — erst
> nach dem Bauen kommen, muss auch dastehen, WELCHE von wem.* **„Wie
> vorgeschlagen" und „entschieden" sind zwei verschiedene Aussagen**, und eine
> Tafel, die sie in eine Spalte legt, lässt den Unterschied verschwinden.

> **DIE EINE ABWEICHUNG IST F7, UND SIE IST GRÖSSER ALS „kürzer".** *Der
> Vorschlag lautete: sag dem Benutzer den billigsten Weg. Entschieden ist:*
> **sag ihm die FOLGE und sonst nichts** — „Wir sind nicht sein Papa und er
> nicht ein Kindergartenkind." **Der Rat fällt, der Befund bleibt.** *Die drei
> Anläufe und ihre Gründe stehen bei BA 6.*

---

## BA 0 — die Messung zu `medium` (F4)

> **DIE RUNDE HAT GEMESSEN, BEVOR SIE GEBAUT HAT.** *Der Fahrplan nennt die
> Frage seit dem 2. September ausdrücklich als ungemessen, und eine Ersparnis,
> die man nicht gemessen hat, ist eine Vermutung.*

**Was gemessen wurde:** `medium` als JPEG q84 (heute) gegen WebP q84, q80, q75
und WebP `nearLossless` 60 — **an drei selbstgebauten Bildarten**, je gegen die
**verlustfreie Fassung derselben Ableitung**. *Gemessen wird, was das VERFAHREN
kostet, nicht was das Verkleinern kostet.*

| Bildart | JPEG q84 | WebP q84 | WebP q80 | WebP q75 | WebP `nearLossless` 60 |
|---|---|---|---|---|---|
| **Foto** *(Verlauf, Körnung)* | 119 146 B · MAE 2,97 | +49,3 % · 2,43 | +0,9 % · 2,79 | −26,3 % · 3,08 | **+500,8 %** · 0,99 |
| **Bildschirmfoto mit Text** | 165 535 B · MAE 1,03 | −19,3 % · 0,49 | −25,1 % · 0,59 | −31,3 % · 0,71 | **−91,7 %** · 0,07 |
| **Strichzeichnung** | 186 407 B · MAE 1,32 | −21,8 % · 0,45 | −27,8 % · 0,55 | −34,2 % · 0,68 | **−22,4 %** · 0,00 |

**DIE ANTWORT AUF F4 IST NEIN, UND SIE IST DEUTLICH.** *`nearLossless` ist am
Bildschirmfoto großartig (−91,7 %) und an einem Foto eine Katastrophe
(+500,8 % — 716 kB gegen 119 kB).* **Eine Regel, die eine Bildart um das
Sechsfache teurer macht, ist keine Ersparnis, sondern eine Verschiebung.**

> **EIN FEHLER IN DER ERSTEN MESSUNG GEHÖRT GENANNT.** *Der erste Lauf verglich
> RGBA gegen RGB — die SVG-Vorlagen kommen mit Alphakanal heraus, JPEG hat
> keinen — und meldete für JEDES Verfahren dieselbe Abweichung (21,82 / 21,85 /
> 21,88).* **Eine Zahl, die sich nicht rührt, ist ein Fund und kein Ergebnis.**
> *Auf drei Kanäle gebracht, noch einmal gefahren; die Tafel oben ist die
> zweite Messung.*

---

## BA 1 — aus dem Häkchen wird die Wahl

**`imageStore` mit drei Werten löst `convertImages` ab.** Die Tafel steht in
`images.js` und **nur dort**:

```js
const IMAGE_STORES = {
  'png':           null,
  'webp-lossless': { nearLossless: true, quality: 60, effort: 4 },
  'webp-lossy':    { quality: 90, effort: 4 }
};
const IMAGE_STORE_DEFAULT = 'webp-lossless';
```

### Die Größe 90 ist ÜBERNOMMEN und nicht ermittelt — nachgeholt am 11.9.

**Die Zahl kommt aus der Messung des Betriebs vom 2. September** (6,64 MB,
67 % kleiner) **und nicht aus einer eigenen Reihe.** *Bei `thumb` und `medium`
steht eine: sieben Gütestufen, drei Bildarten, Bytes gegen Abweichung. Hier
stand zunächst nur die eine Zahl — und die Karte behauptet auf ihr „rund zwei
Drittel kleiner".* **Das ist ein Unterschied im Vorgehen, und er gehört
benannt, nicht verwischt.**

**Nachgeholt am 11. September 2026**, an denselben drei Bildarten, je gegen das
PNG, das hereinkam — **Foto** (PNG 2,47 MB, verlustfrei 0,68 MB):

| Güte | Größe | gegen verlustfrei | größte Abweichung |
|---|---|---|---|
| q85 | 0,18 MB | −74 % | 16 von 255 |
| **q90** | **0,28 MB** | **−59 %** | **11 von 255** |
| q95 | 0,44 MB | −36 % | 8 von 255 |

**ES GIBT KEINEN KNICK IN DIESER KURVE** — anders als bei `nearLossless`, wo
sich Gewinn und Abweichung bei 60 kreuzen und die 60 damit begründet ist.
*Hier kauft jede Stufe Platz mit Bildpunkten, gleichmäßig.* **Die Messung
widerspricht der übernommenen Zahl nicht — sie bestätigt sie aber auch nicht
als die einzig richtige.** *q90 ist eine vertretbare Wahl in der Mitte, und sie
steht, weil die Karte auf ihr steht.*

**UND SIE SCHÄRFT DIE AUFLAGE:** an einem Bildschirmfoto mit Text liegt q90 um
**1016 %** über dem verlustfreien, an einer Strichzeichnung um **18 %**. *Kein
Wert dieser Reihe dreht das um — q75 liegt dort immer noch 729 % darüber.*
**Es ist keine Frage der Güte, sondern des Verfahrens.**

**`null` heißt „nicht umkodieren" und ist kein fehlender Eintrag.** *Der
Schlüssel steht in der Tafel, damit „kennt sie ihn?" und „was tut sie damit?"
dieselbe Tafel haben — ein Verfahren, das nur als `if` im Rumpf vorkäme, ließe
sich von außen nicht aufzählen, und genau das braucht die Karte.*

### Der Migrationsblock — der elfte markierte

| alte Stellung | wird | |
|---|---|---|
| `convertImages` = `true` | `imageStore` = `'webp-lossless'` | |
| `convertImages` = `false` | `imageStore` = `'png'` | |
| **gar keine Zeile** | **gar keine Zeile** | *die Vorgabe greift beim Lesen* |

**DIE DRITTE ZEILE IST DIE, DIE MAN FALSCH MACHT.** *Wer sie „der
Vollständigkeit halber" mit der Vorgabe füllte, schriebe eine ENTSCHEIDUNG in
eine Instanz, in der nie jemand eine getroffen hat — und nähme damit jeder
späteren Änderung der Vorgabe die Wirkung.*

**Der alte Schlüssel fällt in DEMSELBEN Griff, und zwar in einer Transaktion.**
*Zwischen dem Schreiben der neuen und dem Löschen der alten Zeile gibt es einen
Augenblick, in dem beide dastehen; er darf keinen Absturz überleben.*

**Eine vorhandene Wahl gewinnt gegen das alte Häkchen** — das ist der Weg
zurück aus einem Stand, der 0.27.0 schon gesehen hat und noch einmal auf 0.26.0
lief. *Dort schriebe die alte Fassung wieder `convertImages`; sie zu nehmen
hieße, eine Wahl aus dreien mit einem Häkchen zu erschlagen.*

### Was NAMENTLICH weggefallen ist

**Im Quelltext:** der Schlüssel `convertImages`, die Ableitung
`convertImages()`, das Feld in beiden Antworten von `/api/settings`, der
Schreibzweig, und die Verzweigung am Fotoweg
(`convertImages() ? storeImage(...) : {…}`). *Er steht danach in keiner Zeile
Code mehr — nur noch in Herleitungen, die sagen, was weggefallen ist, und im
Migrationsblock, der ihn übersetzt.*

**In den Sprachdateien, in allen drei Sprachen:**

| Schlüssel | was er war |
|---|---|
| `card.convertOnUpload` | die Beschriftung des Häkchens |
| `card.pasteWebpHint` | sein Erklärsatz |
| `card.convertAllPng` | „Alle PNG in WebP umwandeln" |
| `card.noPngLeft` | „Keine PNG-Fotos mehr vorhanden." |
| `card.convertPngWebp` | die Überschrift des Bestätigungsfensters |
| `card.pngConverting` | sein Text *(ein Mehrzahlpaar)* |
| `card.stayedPng` | „, {geblieben} blieben PNG" |

**Achtzehn kommen dazu**, fünf ändern ihren Wortlaut. *Die Sprachdateien tragen
danach **1238** Schlüssel und **1320** flache Werte.*

---

## BA 2 — `storeImage()` liest die Wahl

**Das Verfahren ist ein ARGUMENT und keine Kenntnis.** *Bis 0.26.0 wusste die
Funktion, wie abgelegt wird, und der Rufer wusste, OB. Das ging, solange es
zwei Stellungen gab. Bei DREI Werten müsste der Rufer zwei kennen und der Rumpf
den dritten — eine Wahl an zwei Orten.*

**DIE GRÖSSENPRÜFUNG GILT IN JEDEM VERFAHREN.** *Sie ist Rückbau 433 und steht
ausdrücklich außerhalb der Verzweigung: wer sie für einen Weg abschaltete,
machte aus einer Wahl eine Wette.* **Am verlustbehafteten Weg ist sie sogar
schärfer gebraucht** — an einem Bild mit wenigen Farben und harten Kanten liegt
q90 gemessen über dem PNG-Umfang derselben Vorlage.

---

## BA 3 — die Karte „Bildablage"

**Drei Zeilen, jede mit einem Knopf „Standard".** *Dieselbe Bauform wie
„Suchanbieter" und „Sprachen" — die Oberfläche hat für „eines von mehreren ist
der Standard" genau eine Gestalt, und sie steht dort schon zweimal.* **Ohne das
Häkchen der beiden anderen:** dort gibt es einen VORRAT, aus dem gewählt wird,
und daneben den Standard. **Hier gibt es keinen Vorrat** — die Installation
legt in EINEM Verfahren ab.

**Die Zeilen kommen aus der Liste des Servers**, die Wörter aus einer Tafel im
Browser. *Ein viertes Verfahren im Server erschiene damit als `webp-irgendwas`
in der Karte — sichtbar unfertig statt unsichtbar.*

**Die Auflage steht immer da und nicht erst nach dem Einschalten.** *Wer sie
erst nach dem Umschalten läse, hätte schon gewählt.* Drei Hälften, und jede
hält eine andere: **wofür** das Verfahren gut ist, **wofür ausdrücklich
nicht**, und dass die beiden **aus den Bytes nicht zu unterscheiden** sind.

**Der Knopf ist nicht mehr tot, wenn kein PNG mehr dasteht.** *Er hat seit
dieser Runde eine zweite Hälfte, und die fällt unabhängig davon an. Ein toter
Knopf verspräche, es gäbe nichts zu tun, und das wäre unwahr.*

---

## BA 4 — die Ableitungen auf WebP

**Die Zahlen sind NEU GESETZT und nicht übernommen.** *`q` hieß bis 0.26.0
JPEG-Güte und heißt jetzt WebP-Güte; dieselbe Zahl bedeutet in den beiden
Verfahren nicht dasselbe.* **Wer 78 und 84 stehen ließe, machte `medium` an
einem Foto um 49,3 % größer als vorher.**

| | Bytes gegen heute | mittlere Abweichung (heute) |
|---|---|---|
| **`medium`, WebP q76** | −21 / −30 / −33 % | 3,02 (2,97) / 0,69 (1,03) / 0,66 (1,32) |
| **`medium`, WebP q78** ✔ | **−9 / −27 / −30 %** | **2,91 (2,97) / 0,63 (1,03) / 0,60 (1,32)** |
| **`medium`, WebP q80** | +1 / −25 / −28 % | 2,79 (2,97) / 0,59 (1,03) / 0,55 (1,32) |
| **`thumb`, WebP q82** ✔ | **−52 / −5 / −6 %** | **1,39 (1,35) / 0,88 (2,56) / 1,14 (3,03)** |
| **`thumb`, WebP q84** | −45 / −2 / −1 % | 1,39 (1,35) / 0,83 (2,56) / 1,05 (3,03) |
| **`thumb`, WebP q86** | −31 / **+2** / **+4** % | 1,37 (1,35) / 0,75 (2,56) / 0,96 (3,03) |

*(Reihenfolge: Foto / Bildschirmfoto mit Text / Strichzeichnung.)*

**Bei `medium` 78 kreuzen sich die Kurven:** es ist die höchste Güte, bei der
auch das Foto noch kleiner wird. **Bei `thumb` 82 und nicht 84**, weil die
Marge bleiben soll — bei 84 liegt das Bildschirmfoto nur noch 2 % unter heute,
bei 86 darüber.

> **DAS FOTO IST DIE EINE AUSNAHME, UND SIE GEHÖRT GENANNT:** *die Abweichung
> seiner Kachel steigt von 1,35 auf 1,39 — vier Hundertstel einer Stufe von
> 255, während die Kachel um mehr als die Hälfte schrumpft.* **Das ist der
> Tausch, und er steht hier, damit ihn niemand für übersehen hält.**

**Das Kommentarbild geht denselben Weg** und holt seine Güte aus derselben
Tafel. *Bis 0.26.0 standen 84 und 78 ein zweites Mal in `server.js` — zufällig
dieselben Zahlen, und niemand hätte gemerkt, wenn eine der beiden Stellen sie
geändert hätte.* **Seine Geometrie bleibt seine eigene** (400 und 1600, ohne
Zuschnitt): es hat weder Fokuspunkt noch Zoom.

**Das Standbild am Video wird ebenfalls WebP** — als Folge und nicht als
Entscheidung: der Browser schickt es als JPEG, und der Server rechnet daraus
`thumb` und `medium`. **Der Kernsatz gilt weiter: der Server öffnet nie ein
Video.**

---

## BA 5 — der Bestandslauf zieht beide Hälften

**Zwei Fragen je Zeile, und sie sind unabhängig:**

| | |
|---|---|
| das **Original** | liegt es als PNG da, und will das gewählte Verfahren etwas damit? *Bei „PNG" will es nichts — dann ist die Zeile trotzdem nicht umsonst angefasst* |
| die **Ableitung** | ist `thumb` oder `medium` noch JPEG? Dann werden **beide** neu aus dem **Original** gerechnet |

**AUS DEM ORIGINAL UND NICHT AUS DEM ALTEN JPEG.** *Ein JPEG nach WebP
umzukodieren wäre eine zweite verlustbehaftete Runde über dieselben Bildpunkte.*
**Die Reihenfolge ist deshalb nicht beliebig:** gerechnet wird aus den Bytes,
die hereinkamen, und nicht aus denen, die gerade geschrieben wurden — die
WebP-Fassung trägt kein EXIF mehr, und `.rotate()` braucht es.

**Original und Ableitung derselben Zeile gehen in EINEM UPDATE hinaus**, damit
es keinen Augenblick gibt, in dem eine Ableitung zu einem Original gehört, das
es so nicht mehr gibt.

### Die Auswahl wählt großzügig — und das ist eine Messung

**Bis 0.26.0 wählte der Lauf am INHALT aus** (`hex(substr(data,1,8))`) und fand
damit genau die offenen PNG. **Die zweite Frage lässt sich so nicht stellen:**
`thumb` steht in der Spaltenreihenfolge **hinter** `data`, und wer sie anfasst,
muss die ganze Kette der Overflow-Seiten des Originals lesen und entschlüsseln
— **die 1338-ms-Klasse**, und zwar im Haupt-Thread, bevor die 202 hinausgeht.

**Also wählt die Abfrage jede Fotozeile aus und der Thread entscheidet** —
dieselbe Bauform, die `qTileRows` seit 0.19.4 hat. *Was es kostet, ist ehrlich
zu nennen: der Lauf fährt über jede Fotozeile, auch über die, an denen nichts
zu tun ist. Was es spart, ist eine Sekunde Haupt-Thread bei jedem Knopfdruck.*

**`total` heißt damit „angesehen" und nicht „umgestellt".** *Die Karte sagt das
auch so, und sie zählt getrennt, was wirklich geschehen ist — Originale und
Ableitungspaare.* **Eine Summe daraus wäre kürzer und falsch:** an einer Zeile
kann beides, eines oder nichts geschehen sein.

**Die Videozeile ist nicht dabei** — in `data` liegt dort die Videodatei, und
ihr `medium` IST das Standbild und nicht dessen Ableitung.

**Das Verfahren wird EINMAL gelesen, beim Start des Laufs.** *Wer während eines
Laufs umschaltet, bekommt seine Wahl beim nächsten; sonst träfe ein Umschalten
die eine Hälfte der Zeilen anders als die andere.*

---

## BA 6 — der Satz an der Einfügestelle (F7)

**Zwei Sätze statt einem unter dem Ablegefeld.** *Bis 0.21.1 standen dort fünf,
0.22.0 hat sie auf einen gekürzt; der zweite steht aus demselben Grund wie die
Videogrenze — Regel S1: eine Folge, die man kennen muss, darf stehen.*

**Er steht an der Einfügestelle und nicht in der Karte:** dort trifft ihn
jemand in dem Augenblick, in dem er die Wahl noch hat. *Wer die Karte
„Bildformate" liest, fügt gerade kein Bild ein.*

**Und er steht unabhängig vom Verfahren da.** *Die Folge gilt in jedem der drei
— bei „PNG" am deutlichsten, denn dort bleiben die 34,79 MB liegen.*

### Der Wortlaut — drei Anläufe, und jeder ist aus einem anderen Grund gefallen

| | Fassung | woran sie gescheitert ist |
|---|---|---|
| **1** | *„Aus dem Netz ist ,Bild speichern unter' und dann hochladen der günstigste Weg: die Zwischenablage enthält keine Datei, sondern Bildpunkte — als PNG oft ein Vielfaches der ursprünglichen Datei."* | **zu lang.** *„Behalten, aber kürzer"* |
| **2** | *„Aus dem Netz besser ,Bild speichern unter' und hochladen — eingefügt wird daraus ein PNG, oft um ein Vielfaches größer."* | **kein deutscher Satz mehr.** *„Der Satz ist mehr als kaputt … wenn schon Hinweis ein trockenes aber gebräuchliche form von Satz."* |
| **3** | **„Das Einfügen über die Zwischenablage führt zu erheblich größeren Dateien."** | — |

**DIE DRITTE IST NICHT NUR KÜRZER, SIE SAGT ETWAS ANDERES: sie stellt fest,
statt zu raten.** *Die Empfehlung ist ausdrücklich weggefallen, und das ist die
Entscheidung des Betreibers vom 10. September 2026:*

> „Eine Empfehlung, was man mit einem Bild aus dem Netz macht, lass bitte weg.
> Welche Folgen … hat, wird im kurzen Satz erklärt und der Rest ist Usersache.
> … Wir sind nicht sein Papa und er nicht ein Kindergartenkind."

**DER ZWEITE ANLAUF IST DER LEHRREICHE:** *er ist beim Kürzen entstanden, und
beim Kürzen fällt zuerst das Verb.* **Was übrig blieb, war Telegrammstil und
hat es trotzdem durch drei Sprachdateien und einen grünen Prüflauf geschafft**
— *keine Zusage dieses Prüfstands fragt nach Grammatik, und keine kann es. Wer
einen Satz kürzt, liest ihn danach laut.*

**DER SCHLÜSSEL HEISST DESHALB JETZT `entry.clipboardLarger`** und nicht mehr
`entry.uploadIsCheaper`. *Der alte Name sagte, was der Satz EMPFIEHLT — und der
Satz empfiehlt nichts mehr.* **Ein Name, der etwas anderes behauptet als sein
Inhalt, ist eine zweite Wahrheit im Kleinen** (Stolperstein 47).

**DER PRÜFSTAND HÄLT BEIDES FEST:** dass die Folge dasteht **und dass keine
Empfehlung danebensteht**. *Ohne die zweite Zusage wäre die Entscheidung eine
Laune und käme beim nächsten Aufräumen zurück.* **Gegenprobe 824** nimmt den
Satz aus der Zeile, in der er GEZEICHNET wird — nicht aus der Sprachdatei: ein
Satz, der dort steht und nirgends erscheint, ist genau der Fall, an dem
Gegenprobe 485 einmal STUMM geblieben ist.

---

## Zwei Befunde, die der Auftrag nicht kannte

### 1 — das Kommentarbild wurde unter falschem Namen ausgeliefert

**`GET /api/comment-images/:id/raw` setzte seinen Kopf aus dem festen
Dateinamen `'bild.jpg'`** und damit ausnahmslos `image/jpeg`. *Das war keine
Aussage über das Bild, sondern eine über den Kodierer — und beide stimmten
zufällig überein, solange `encodeCommentImage()` ausnahmslos JPEG erzeugte.*

**Mit dieser Runde wurde die Zeile zur Lüge:** WebP-Bytes unter `image/jpeg`,
dazu `nosniff` — *der Browser hätte sie gar nicht erst angezeigt.*

**GEFUNDEN HAT ES DER PRÜFSTAND und nicht das Auge.** *Die Zusage
„Kommentarbild wird als WebP ausgeliefert" wurde rot, während die Bytes längst
stimmten.* **Die Route liest jetzt die Bytes, wie die Fotoroute** — und ein
Bestand aus 0.26.0, dessen Kommentarbilder JPEG sind, geht weiterhin als JPEG
hinaus, ohne dass es dafür eine Verzweigung bräuchte.

### 2 — die Fertigmeldung stand halb auf Deutsch

**`switchRow()` setzte „von" und „umgewandelt" als deutschen Text im Quelltext
zwischen zwei übersetzte Stücke.** *Eine englische Oberfläche las „Conversion
done: 7 von 12 umgewandelt", eine türkische dasselbe.* **Gefunden beim Umbau
dieser Zeile**, die ohnehin neue Zahlen bekommen musste. Der Satz steht jetzt
ganz in der Sprachdatei.

---

## Der Prüfstand

**6497 von 6497 Prüfungen** — *6412 vor dieser Runde.*

| | Zusage | gebaut als |
|---|---|---|
| **1** | Die Einstellung kennt **genau drei** Werte, ein vierter wird abgewiesen | Absage 400 an `PUT /api/settings`, geprüft gegen die Tafel in `images.js`; dazu fünf Werte falscher Gestalt |
| **2** | Sie gehört dem **Eigentümer** | `OWNER_KEYS`, geprüft mit drei Rollen an einer Prüflage mit drei Zugängen |
| **3** | Eine **frische** Installation steht auf „WebP verlustfrei" | und zwar **abgeleitet**, ohne Zeile in der Einstellungstabelle |
| **4** | `storeImage()` **liest** die Wahl | dreimal dasselbe Bild, dreimal andere Bytes |
| **5** | Die **Größenprüfung** gilt in jedem Verfahren | in allen dreien ist das Abgelegte nie größer als die Vorlage |
| **6** | Die Ableitungen sind **WebP**, und ihr MIME-Typ sagt es | Bytes **und** Kopf, an `thumb`, `medium`, Kommentarbild und Standbild |
| **7** | Der Lauf zieht **Originale und Ableitungen** | an einer Zeile, deren Ableitungen von Hand auf JPEG gesetzt wurden — so, wie ein Bestand aus 0.26.0 sie trägt |
| **8** | **Umschalten allein** rührt den Bestand nicht an | dreimal umgeschaltet, kein Lauf, das Bild byte-genau dasselbe |
| **9** | Die Karte nennt die **Auflage** | drei Hälften einzeln geprüft, in allen drei Sprachen vorhanden |
| **10** | Die Migration übersetzt **beide** alten Stellungen | drei echte Altbestände, dazu die vierte Lage (vorhandene Wahl gewinnt) |
| **11** | `convertImages` steht **nirgends** mehr | im Code gesucht, ohne Kommentare; in `db.js` genau drei Zeilen, alle im Block, der ihn wegnimmt |

### Die Gegenproben — 813 bis 824

**Elf neue, und jede fährt gegen GENAU EINE der elf Zusagen — dazu ein
zwölfter (824), nachgetragen zu F7.** *Die Rückbautabelle trägt danach
**815** Einträge.*

| Nr | Rueckbau | rot | wo |
|---|---|---|---|
| **813** | Ein vierter Wert kommt durch | **9** | Die Bildablage: die Rechte |
| **814** | Die Wahl wird gewöhnliche Adminsache | **6** | Die Bildablage: die Rechte |
| **815** | Die Vorgabe einer frischen Installation wird verstellt | **10** | Die Bildablage: die Rechte |
| **816** | Die Wahl wird wieder fest verdrahtet | **3** | PNG kommt herein, WebP geht in die Tabelle |
| **817** | Die Größenprüfung gilt nicht mehr für jedes Verfahren | **STUMM → 2** | *siehe unten* |
| **818** | Die Ableitungen werden wieder JPEG | **15** | PNG kommt herein, WebP geht in die Tabelle |
| **819** | Der Bestandslauf lässt die Ableitungen aus | **3** | PNG kommt herein, WebP geht in die Tabelle |
| **820** | Der Lauf hängt am Umschalten | **1** | Die Bildablage in der Oberfläche |
| **821** | Die Karte nennt die Auflage nicht mehr | **2** | Die Bildablage in der Oberfläche |
| **822** | Die Migration biegt eine Richtung falsch ab | **3** | Die Datenbankstufe 0.27.0 |
| **823** | Der alte Schlüssel bleibt stehen | **7** | Die Datenbankstufe 0.27.0 |
| **824** | Der Satz an der Einfügestelle wird nicht gezeichnet | **3** | Der Eintrag am Bildschirm |

> **817 IST BEIM ERSTEN LAUF STUMM GEBLIEBEN — UND DAS IST DER WERTVOLLSTE
> EINZELNE BEFUND DIESER RUNDE.** *Der Rueckbau schaltet die Größenprüfung
> NUR für den verlustbehafteten Weg ab. Keine einzige Prüfung wurde rot.*
>
> **DER GRUND WAR DER PRÜFFALL UND NICHT DIE ZUSAGE.** *Geprüft wurde an einem
> Bild mit weichen Verläufen — und daran gewinnt JEDES WebP-Verfahren über die
> Größe.* **Eine Regel, die im Prüffall nie greift, lässt sich abschalten,
> ohne dass etwas rot wird.**
>
> **GESUCHT WURDE DER FALL, IN DEM VERLUSTBEHAFTET VERLIERT — und es gibt ihn:**
> wenige Farben, harte Kanten, große Fläche.
>
> | Vorlage | PNG | WebP q90 | verlustfrei |
> |---|---|---|---|
> | 1200×800, 2 Farben, 400 Kästchen | 9 331 | **14 154** *(+52 %)* | 1 680 |
> | 64×64, 2 Farben | 200 | **276** *(+38 %)* | 70 |
> | 1200×800, 2 Farben, 40 Kästchen | 5 859 | 3 226 | 238 |
> | 2000×2000 einfarbig weiß | 15 107 | 7 172 | 212 |
>
> **VERLUSTFREI GEWINNT IN ALLEN VIER FÄLLEN, VERLUSTBEHAFTET VERLIERT IN
> ZWEIEN.** *Das ist der Grund, aus dem die Größenprüfung am verlustbehafteten
> Weg schärfer gebraucht ist als am anderen — und der Satz stand vorher schon
> so im Quelltext, war aber nicht geprüft.*
> **Die Zusage hat jetzt einen Gegenstand**, und die Gegenlage steht daneben
> (*„verlustbehaftet wäre hier GRÖSSER als das PNG"*), damit die Probe ihn nicht
> unbemerkt wieder verliert. **Nachgefahren: 817 ist danach rot.**

> **UND 824 IST NACHGETRAGEN, NICHT MITGEPLANT.** *Der Auftrag sieht für BA 6
> keine Zusage vor — ein Satz an einer Einfügestelle sah nach nichts aus, was
> zu bewachen wäre.* **Er ist es geworden, als der Betreiber ihn zur Sache
> gemacht hat:** dreimal zurückgewiesen, am Ende mit einer eigenen Aussage
> („die Folge ja, der Rat nein"). *Eine entschiedene Sache bekommt eine Zusage;
> sonst ist sie beim nächsten Aufräumen wieder offen.*

> **DIE NEUNZEHN ALTEN DIESER SACHE STEHEN NICHT ZWEIMAL DA** — 431, 435, 436,
> 437, 454 bis 457, 462, 472, 485, 493, 506 bis 508, 522 bis 524 und 810.
> *Ihr Suchtext hätte nach dem Umbau ins Leere gegriffen; sie sind
> MITGEGANGEN und zeigen auf die Zeilen, die dieselbe Sache jetzt tragen*
> (Stolperstein 201). **Ein zweiter Rückbau daneben wäre eine zweite Wahrheit
> über denselben Fund.**

---

## Der Augenschein

**Diese Runde ändert, wie Bilder aussehen — das ist angesehen und nicht
gerechnet worden.**

| | Lage | Befund |
|---|---|---|
| **1** | `medium` an Text: JPEG q84 gegen WebP q78, 1:1 | **kein Unterschied zu sehen** — bei 9 % weniger Bytes und kleinerer Abweichung |
| **2** | Die drei Verfahren an einem Bildschirmfoto | **alle drei sehen gleich aus — und der Preis steht daneben:** PNG 222 kB, verlustfrei 13 kB, verlustbehaftet q90 **149 kB**. *Faktor **11,2** gegen verlustfrei* |
| **3** | Dieselben drei an einer Strichzeichnung | verlustbehaftet ist **1,2fach** größer als verlustfrei |
| **4** | Dieselben drei an einem Foto | hier gewinnt verlustbehaftet: 0,28 gegen 0,68 MB — **59 % kleiner** |

> **DIE AUFLAGE HÄLT, UND SIE IST SCHÄRFER ALS GEMELDET.** *Der Betreiber hat
> „siebenmal größer" gemessen; an einem Bildschirmfoto mit 22 Zeilen Text sind
> es **elfmal**.* **Die Richtung ist dieselbe, die Zahl hängt am Bild** — und
> genau deshalb steht in der Karte „ein Vielfaches" und keine Zahl.

---

## Was ausdrücklich NICHT gebaut wird

| | warum |
|---|---|
| **Eine Weiche zwischen Zwischenablage und Upload** | *aus den Bytes sind die beiden nicht zu unterscheiden (F6)* |
| **`medium` auf verlustfrei** | **gemessen und verworfen** — +500,8 % am Foto |
| **AVIF** | *ein viertes Verfahren, das diese Runde nicht gemessen hat* |
| **Ein Umkodieren beim Umschalten** | **niemals** *(F5)* |
| **Das Anfassen bestehender JPEG-Originale** | *Kriterion fasst JPEG nicht an, und das bleibt so* |
| **Das Umkodieren vorhandener KOMMENTARBILDER** | **NEU IN DIESER LISTE, und der Grund ist derselbe wie eine Zeile darüber:** ein Kommentarbild hat **kein Original**, aus dem es sich neu rechnen ließe. Ein vorhandenes JPEG nach WebP zu bringen wäre eine zweite verlustbehaftete Runde über dieselben Bildpunkte. **Neue sind WebP; die alten bleiben, wie sie sind** |
| **Das Umkodieren des Video-Standbilds im Bestandslauf** | *ihr `medium` IST das Standbild und nicht dessen Ableitung; es aus sich selbst neu zu kodieren machte es nur schlechter* |

---

## Die Papiere

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.27.0.md` | **dieses** |
| `Doku/Projektstand_Kriterion_0_27_0.md` | `git mv`, **Revision 79** |
| `Doku/Fahrplan.md` | die Zeile 0.27.0 ist durchgestrichen; die Ausarbeitungen bleiben als Herleitung |
| `Doku/Fehler_und_Ideen.md` | Punkt 5 und Punkt 6 fallen heraus *(Regel 2)* |
| `Doku/Auftrag_0.27.0.md` | **fällt mit dem nächsten Auftrag** — es liegt immer nur einer im Repo |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
| `README.md` | die Bildablage, die Ableitungen und der Schlüssel in `settings` |
