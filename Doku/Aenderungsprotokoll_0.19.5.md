# Änderungsprotokoll 0.19.5 — „Der Ausschnitt wird eingerechnet, nicht gezogen"

**PATCH · 3. September 2026 · eine Entscheidung aus 0.19.4 wird umgekehrt, und
zwar in beiden Hälften zugleich.** *Angefasst sind `bilder.js`,
`bestandslauf.js`, `server.js`, `public/app.js`, `public/style.css`,
`pruefung.js`, `gegenprobe.js`, `package.json` und die Papiere.*

**KEINE DATENBANKSTUFE** — kein Migrationsblock, keine Schemaänderung, kein
neuer Index, kein neuer Zweck der zweiten Bestätigung, keine neue Route, keine
neue Karte, keine neue ausgelieferte Datei. Austauschformat **12**, `F_ROUTEN`
**70**, acht Migrationsblöcke, neunzehn Karten, neun ausgelieferte Module.

> **ABER: DER LAUF ÜBERSCHREIBT JEDE `thumb`-SPALTE — ZUM ZWEITEN MAL NACH
> 0.19.4.** *Wiederherstellbar aus dem Original und den drei Zahlen `focus_x`,
> `focus_y`, `zoom`, und genau deshalb keine Stufe: `photos.data` wird nicht
> angefasst, und die drei Zahlen stehen unverändert in ihren Spalten.*

---

## Der Feldbeleg zu 0.19.4 — er gehört zuerst hierher

**0.19.4 IST IM FELD BESTÄTIGT.** An der laufenden Installation nachgesehen
(13 Einträge, 89 Fotos, 368,7 MB): **jede Fotozeile trägt einen `thumb` mit
512 auf der kurzen Kante, aus dem Original gerechnet.**

| Vorlage | Original | `thumb` bis 0.19.4 |
|---|---|---|
| Sky-Watcher (15 Fotos) | `4032 × 3024` | `512 × 683` |
| Hohem | `6192 × 4128` | `768 × 512` |

**Der Verdacht, die Ableitung ziehe von einer kleineren Variante, ist damit
widerlegt.** *Die Sky-Watcher-Zeilen liegen mit `4032x3024` in `data` und
`1200x1600` als `medium` — also mit EXIF-Ausrichtung; genau der Fall, auf den
Abschnitt „Die Falle" unten zielt.*

**UND TROTZDEM WAR EINE KACHEL UNSCHARF** — die, an der jemand den Ausschnitt
benutzt hat. Das Hauptbild des Hohem steht auf `zoom = 235`; alle zehn anderen
Fotos desselben Eintrags stehen auf 100 und sind scharf. *Kein neuer Fehler:
die Grenze, die 0.19.4 gemessen und ausdrücklich offen gelassen hat.*

---

## Die zurückgenommene Entscheidung — mit Datum und Grund

**BIS 0.19.4 GALT:** *„Die Ableitung skaliert, sie schneidet nicht."* Die
Begründung stand in `bilder.js` und in Abschnitt 5 des Projektstands: ein am
Server beschnittenes `thumb` nähme dem Fokuspunkt seine Fläche, und der
eingestellte Ausschnitt zeigte danach etwas anderes.

**AB DEM 3. SEPTEMBER 2026 GILT DAS NICHT MEHR.** *Der Satz ist nicht gelöscht,
sondern umgedreht* (Stolperstein 201) — **und die Begründung fällt aus einem
genau benennbaren Grund: sie galt, solange der Browser den Ausschnitt aus dem
ganzen `thumb` zog.** Diese Runde nimmt ihm das weg. **Beides gehört in
dieselbe Runde, oder keines von beidem** — wer serverseitig schneidet und den
CSS-Zoom stehen lässt, schneidet zweimal; wer den CSS-Zoom entfernt und nicht
schneidet, zeigt den Mittenschnitt.

**Was es bringt, in Quellpunkten je Anzeigepunkt** auf der 299 px breiten
Kachel (die Kachelbreite ist aus 0.19.4, in Chromium gemessen):

| | `thumb` + CSS-Zoom (bis 0.19.4) | eingerechnet (ab 0.19.5) |
|---|---|---|
| `zoom` 100 | 1,71× | 1,71× |
| **`zoom` 235** | **0,73× — 1,37fach hochgezogen** | **5,88×** |
| `zoom` 400 | 0,43× — 2,34fach | 5,88× |

**Der eingerechnete Weg ist von der Weite des Ausschnitts unabhängig.** *Das ist
der ganze Punkt.*

> **`focus_x`, `focus_y` UND `zoom` BLEIBEN, WIE SIE SIND** — Spanne,
> Genauigkeit, Route, Bedienung. **Sie hören auf, eine Anweisung an den Browser
> zu sein, und werden das Rezept für die Kachel.** *Deshalb bleibt der
> Ausschnitt jederzeit änderbar: das Original ist unangetastet.*

---

## 1. Die Messungen, die vor dem Bauen standen

### A. Was der Zuschnitt kostet

**AUFBAU.** Fünf Vorlagen in den Maßen und Bytes des echten Bestands:
`6192 × 4128` (12,7 und 9,0 MB) und `4032 × 3024` (7,5 · 6,7 · 5,4 MB), eine
davon mit **EXIF-Ausrichtung 6**. *Der echte Bestand liegt bei 4,9 bis 11,7 MB
je Foto; die Vorlagen sind nachgebaut — Verläufe, Struktur und ein
Rauschanteil, also weder eine einfarbige Fläche noch reines Rauschen.*
**Der echte Bestand selbst stand für diese Messung nicht zur Verfügung; das
gehört gesagt.** Node 22, vier Kerne, `sharp.concurrency` 2, je Fall fünf
Durchgänge, Median.

| Weg | Median | 95. Perzentil | schlechtester |
|---|---|---|---|
| **ohne Zuschnitt** (0.19.4) | 113,4 ms | 189,5 ms | 189,5 ms |
| **Zuschnitt VOR der Skalierung** (gebaut) | **157,3 ms** | **247,0 ms** | 247,0 ms |
| Zuschnitt NACH der Skalierung (verworfen) | 148,7 ms | 205,2 ms | 205,2 ms |

*Der erste Aufruf nach dem Laden von `sharp` kostet 270,8 ms.*

**WARUM DER ZUSCHNITT ÜBERHAUPT KOSTET, und die Antwort ist nicht das
Kodieren:** `extract()` nimmt libjpeg sein **Shrink-on-Load**, mit dem es sonst
gleich in 1/2, 1/4 oder 1/8 der Maße dekodiert. **Am teuersten ist deshalb
`zoom = 100`** — dort ist der Ausschnitt am größten —, nicht `zoom = 400`.
*An der 12,7-MB-Vorlage: 247,0 ms bei `zoom` 100 gegen 155,1 ms bei 400.*

**GEMESSEN UND VERWORFEN: den Zuschnitt NACH der Skalierung zu nehmen.** Das
ganze Bild so skalieren, dass der Ausschnitt genau 512 trägt, dann
herausschneiden — das hält das Shrink-on-Load und kostet im Median 8,6 ms
weniger. *Die Bytes sind auf 0,5 % gleich.* **Es wäre eine zweite Rechnung mit
zwei zusätzlichen Rundungen für nichts**, und bei engem Ausschnitt skaliert es
das ganze Bild unnötig groß.

### Und was daneben noch kostet — die Aufschlüsselung

**DAS ERZEUGEN IST NICHT DER GRÖSSTE POSTEN.** An einer frisch geöffneten,
verschlüsselten Datei mit 12,7-MB-Originalen — also genau der Lage, die der
Thread vorfindet:

| Schritt | |
|---|---|
| `sharp` laden | 51,9 ms |
| `db.js` laden | 2,6 ms |
| Datei öffnen | 3,2 ms |
| Blob lesen (12,7 MB) | 67,4 ms |
| erzeugen | 175,4 ms |
| **Kachel schreiben** | **473,7 ms** |
| **zusammen** | **774,5 ms** |

**473,7 ms für 20 kB Kachel — weil SQLite den GANZEN Satz neu schreibt, und der
trägt das Original.** Nachgemessen an fünf Größen in einer warmen Datei:

| Original | `SET thumb` | `SET thumb, medium` |
|---|---|---|
| 0,05 MB | 1,3 ms | 2,1 ms |
| 0,5 MB | 2,8 ms | 3,7 ms |
| 2 MB | 8,7 ms | 9,2 ms |
| 6 MB | 23,4 ms | 24,2 ms |
| 12,7 MB | 48,2 ms | 49,2 ms |

**Linear in der Größe des ORIGINALS und nicht in der der Kachel.** *Der Rest
bis 473,7 ms ist der kalte Seitencache: `cache_size` steht auf 2 MB, ein
12,7-MB-Satz passt nicht hinein und wird zum Schreiben ein zweites Mal gelesen
und entschlüsselt.* **UND DESHALB WIRD `medium` MITGESCHRIEBEN UND NICHT
GESPART:** der Unterschied ist eine Millisekunde, ein zweiter Schreibweg wäre
eine zweite Wahrheit.

### Die Entscheidung, die daran hängt

**AN DER ROUTE GEMESSEN**, an einem echten Server mit echter verschlüsselter
Datenbank, von der Anfrage bis zur Antwort, fünfzehn Fälle: **494 bis 873 ms.**

**Die Grenze des Auftrags liegt bei rund 150 ms. Der Median des Erzeugens liegt
darüber, das 95. Perzentil deutlich, und die Route als Ganzes um ein
Vielfaches. → ÜBER `starteBestandsThread`.** *Dieselbe Lesart wie in 0.19.3:
der Median sagt nichts, das 95. Perzentil sagt alles. Im Haupt-Thread stünde
die Event Loop fünfmal so lange wie die 133 ms, die 0.19.3 gerade freigeräumt
hat.*

### B. Was die zugeschnittene Kachel an Bytes kostet

**AUFBAU.** 36 nachgebaute Vorlagen: **zwölf Seitenverhältnisse** (die beiden
Kameras des Bestands, vier Bildschirmformate, quadratisch, 21:9, 32:9, Telefon
hochkant) × **drei Rauschstufen**. Gemessen wird `length(thumb)` der heutigen
Ableitung gegen die zugeschnittene bei `zoom` 100. **Auch hier: nachgebaut, nicht
der echte Bestand.**

| | heute | eingerechnet | |
|---|---|---|---|
| **Summe (36)** | **1252,0 kB** | **824,2 kB** | **−34,2 %** |
| **Mittel** | **34,8 kB** | **22,9 kB** | |

Je Form, über die drei Rauschstufen gemittelt:

| Form | heute | eingerechnet | Δ |
|---|---|---|---|
| 16:9 (1080p / 1440p / 4K) | `910 × 512` | `512 × 512` | **−44 %** |
| 21:9 | `1223 × 512` | `512 × 512` | **−58 %** |
| 9:16 Telefon | `512 × 910` | `512 × 512` | −44 % |
| 3:2 Hohem | `768 × 512` | `512 × 512` | −33 % |
| 4:3 Sky-Watcher | `683 × 512` | `512 × 512` | −26 % |
| 1:1 | `512 × 512` | `512 × 512` | −0,4 % |
| **32:9 Panorama** | `1280 × 180` | `512 × 512` | **−10 % bis +116 %** |

**DIE ERWARTUNG HAT GEHALTEN — MIT EINER AUSNAHME, UND DIE IST DAS PANORAMA.**
*Es lag als 1280 × 180 (230k Bildpunkte) da und wird 512 × 512 (262k) — bei
wenig Struktur 10 % kleiner, bei viel 116 % größer.* **Es ist trotzdem
richtig:** seine Kachel war bis heute um das **1,66fache hochgezogen** (180
Bildpunkte auf 299 CSS-Punkte), und danach ist sie scharf.

**UND DER ENGE AUSSCHNITT KOSTET, wie der Auftrag vermutet hat:** dieselbe
Fläche zeigt mehr Detail und kodiert schlechter.

| Vorlage | `zoom` 150 | 235 | 300 | 400 |
|---|---|---|---|---|
| Hohem `6192 × 4128` | +6,3 % | +47,6 % | +83,8 % | +141,2 % |
| Sky-Watcher `4032 × 3024` | +19,1 % | +72,3 % | +114,0 % | +170,7 % |

*Gegen den heutigen Stand gerechnet bleibt die Hohem-Kachel bei `zoom` 235 mit
19,0 gegen 19,3 kB knapp darunter, die Sky-Watcher-Kachel liegt mit 26,3 gegen
20,6 kB darüber.* **Am echten Bestand mit einer einzigen Zeile über `zoom` 100
fällt das gegen die 34,2 % nicht ins Gewicht.**

### C. Was `length(thumb)` in der Fotoabfrage kostet

**Das ist keine Kür, sondern Voraussetzung** (Abschnitt 5 des Auftrags) — und
es greift in die Spaltenlage, an der 0.19.2 hängengeblieben ist. **AUFBAU:**
eine echte verschlüsselte Datei, 400 Einträge, 1032 Fotozeilen, 754 MB, Blobs
in den Maßen des Bestands (512 kB Original, 200 kB `medium`, 20 kB `thumb`).

| Abfrage | kalt | warm | Abfrageplan |
|---|---|---|---|
| heute (0.19.4) | 2,2 ms | 1,9 ms | SCAN … USING **COVERING** INDEX |
| **+ `length(thumb)`** | **17,1 ms** | **2,9 ms** | SCAN … USING INDEX |
| + `hex(substr(thumb,1,1))` | 1859,0 ms | 1796,2 ms | SCAN … USING INDEX |
| + `length(thumb)`, **ohne** den Index | 2457,8 ms | 2449,0 ms | SCAN + TEMP B-TREE |

**`length()` hat in SQLite seine Abkürzung, `substr()` hatte sie nie** — 0.19.1
an einer zweiten Stelle bestätigt, und diesmal mit dem Faktor **109** zwischen
beiden. *Die Länge steht im Satzkopf, und der liegt am Anfang des Satzes; der
Inhalt liegt in Overflow-Ketten, die gelesen und entschlüsselt werden müssen.*

**DER INDEX VERLIERT SEINE DECKUNG UND BLEIBT TROTZDEM DER GEWINN:** ohne ihn
kostet dieselbe Abfrage das **140fache**, weil `art` und `dauer` hinter den
Blobs stehen (0.19.2). **+15 ms kalt und +1 ms warm sind der Preis für eine
Kachel, die sich sofort ändert statt nach 24 Stunden.**

---

## 2. Was gebaut wurde, je Datei

### `bilder.js` — die Rechnung, die Falle und der optionale Zuschnitt

| # | Was | Womit belegt |
|---|---|---|
| **1** | **`zuschnittKiste(breite, hoehe, fx, fy, zoom)`** — die Rechnung des Ausschnitts, ohne Rundung | `seite = min(b,h)` · `kante = seite · 100 / zoom` · `links = fx/100 · (b − kante)`. **Sie steht ZWEIMAL** — hier und in `public/app.js` —, und das lässt sich nicht vermeiden: der Browser zeichnet den Rahmen live, der Server schneidet, dazwischen liegt HTTP. **Der Prüfstand hält beide über 140 Wertepaare gegeneinander** (Stolperstein 293) |
| **2** | `makeVariants(buf, **zuschnitt**)` — ein Argument mehr, kein zweiter Weg | Ist er gesetzt, wird `thumb` daraus eingerechnet; ist er es nicht, bleibt alles wie in 0.19.4. *Ein zweiter Ableitungsweg daneben wäre eine zweite Wahrheit (Stolperstein 47).* Ohne Zuschnitt gerufen wird an einer Zeile, deren Maße sich nicht lesen lassen |
| **3** | Die Tafel `VARIANTS` trägt **`schneidet`** | `thumb: { …, schneidet: true }`, `medium: { …, schneidet: false }`. **`medium` WIRD NICHT GESCHNITTEN** — es wird mit `contain` gezeigt, also ganz, und der Editor zeichnet den Rahmen darauf. *Die Unterscheidung steht in der Tafel und nicht als `if (name === 'thumb')` in der Schleife* |
| **4** | **`schnittRechteck()` rechnet in den GEDREHTEN Maßen** | `extract()` tut es, `metadata()` meldet die gespeicherten — **und `metadata()` NACH `.rotate()` im selben Rohr meldet ebenfalls die gespeicherten.** *Nachgemessen: 4032 × 3024 mit Ausrichtung 6 → das erzeugte Bild ist 3024 × 4032; eine Marke, die gespeichert oben links lag, findet sich bei `fx = 100, fy = 0` und in keiner anderen Ecke.* Stolperstein 288 an einer zweiten Stelle — **und diesmal wirft es nicht, es schneidet daneben** |
| **5** | Die Kiste wird **gegen den Rand geklammert**, erst die Kante, dann die Ecke | Ein Zuschnitt an der Bildecke (`fx = 100`) ragt nach dem Runden sonst einen Bildpunkt über den Rand, und `sharp` quittiert das mit einem Fehler. *Die Kachel entstünde gar nicht.* |
| **6** | **`withoutEnlargement` bleibt** | Ist der Ausschnitt kleiner als 512, bleibt die Kachel kleiner. *Es kostete Bytes und trüge keinen Bildpunkt mehr; der Browser zieht sie beim Anzeigen ohnehin auf, und das Ergebnis ist Bildpunkt für Bildpunkt dasselbe.* Gemessen: `1920 × 1080` bei `zoom` 400 ergibt **270 × 270** |
| **7** | Die Fälligkeitsfrage heißt jetzt **„ist die Kachel quadratisch?"** | `traegtAlteGeometrie` (lange Kante genau 400) reichte nicht mehr: eine Zeile mit `zoom = 235` und 512er kurzer Kante trägt die Geometrie aus 0.19.4 und braucht trotzdem einen Schnitt. **Eine zugeschnittene Kachel IST quadratisch, eine ungeschnittene nur, wenn die Vorlage es war** — „eingerechnet" und „quadratisch" fallen zusammen, ohne Merkerspalte |
| **8** | **Der Deckel von 1280 bleibt in der Tafel** | Er gilt nur noch für die ungeschnittene Ableitung — eine quadratische Kachel hat keine Kante, die davonlaufen könnte. *Er bleibt, weil `makeVariants()` auch ohne Zuschnitt gerufen wird* |

**`ALTE_THUMB_KANTE` ist weggefallen** — die 400 beschrieb den Zustand, den
0.19.4 vorfand, und die neue Frage kommt ohne sie aus.

### `bestandslauf.js` — die Aufgabe wird erweitert, nicht verdoppelt

| # | Was | Womit belegt |
|---|---|---|
| **1** | Die Aufgabe **`geometrie`** schneidet jetzt den Ausschnitt hinein | Dieselbe Schleife, dieselbe Fortschrittszeile, dieselbe Aufgabenkennung. **Was sich geändert hat, ist die Frage nach der Fälligkeit und das zweite Argument an `makeVariants()`** |
| **2** | **`vorlageAus()` / `zuschnittAus()`** — eine Wahrheit für beide Schleifen und die Route | Am Foto ist die Vorlage `data`, **am Video `medium`**: in `data` steht die Videodatei, und der Kernsatz gilt weiter — *der Server öffnet nie ein Video* |
| **3** | **Auch die Zeilen mit `zoom = 100` kommen mit** | Zwei Gründe, und beide sind gemessen: **die Frage wäre sonst kein Festpunkt** (eine Regel mit zwei Zweigen fällt an der ersten kleinen Vorlage zurück), und **es spart 34,2 % der Kachelbytes** |
| **4** | **`backeZeile()`** — die Stelle, an der beide Rufer zusammenkommen | Die Schleife ruft sie je fälliger Zeile, die neue Aufgabe genau einmal. *Zurück kommt die Differenz in Bytes oder `null`; `null` heißt „nicht geschrieben" und ist kein Fehler* |
| **5** | Die **vierte Aufgabe `zuschnitt`** — eine Zeile, auf ausdrücklichen Knopfdruck | Sie meldet `{ art: 'eingerechnet', id, ok }` zurück; einen Stand meldet sie nicht, denn es gibt keine Karte, die ihn zeigte |
| **6** | Am Video wird **nur `thumb`** geschrieben | Sein `medium` IST die Vorlage; es aus sich selbst neu zu kodieren machte es nur schlechter. *Am Foto wird `medium` mitgeschrieben — der Unterschied kostet 1 ms* |

### `server.js`

| # | Was | Womit belegt |
|---|---|---|
| **1** | **`PUT /api/photos/:id/focus` erzeugt die Kachel neu, und die Antwort wartet darauf** | Kein 202: es ist eine Zeile, der Benutzer wartet davor, und eine Kachel, die „gleich" richtig wird, ist schlechter als eine, die es beim Zurückkommen ist. **`detail()` steht IM Abschluss** — es liest die Fassung mit, und die soll die neue sein |
| **2** | **Schlägt das Erzeugen fehl, ist der Ausschnitt trotzdem gespeichert** | Das `UPDATE` der drei Zahlen steht VOR dem Thread. *Die Zeile behält ihre alte Kachel — eine Ableitung, die schlechter ist als die alte, gibt es nicht* |
| **3** | Eine **Frist von 15 Sekunden** über dem Thread | Ein Thread, der hängt, hängte sonst die Anfrage mit. **Das Siebzehnfache des schlechtesten gemessenen Falls (873 ms)**; die Uhr trägt `unref()`, sonst hinge ein Herunterfahren daran |
| **4** | **`PHOTO_FASSUNG = 'length(thumb) AS fassung'`** — neben der Spaltenliste, nicht in ihr | `PHOTO_SPALTEN` ist zugleich die Spaltenliste des deckenden Index, und `length(thumb)` lässt sich nicht indizieren. *Die Messung dazu steht oben unter 1C* |
| **5** | **`qKachelZeilen` hat keine Bedingung mehr** | Bis 0.19.4 stand dort `art != 'video'`. **Die Videozeile hat sehr wohl eine Vorlage**, und sie braucht das Erzeugen, weil der CSS-Zuschnitt wegfällt. *Die anderen beiden Abfragen behalten ihr `art != 'video'`: dort wird `data` umgestellt, und das ist am Video die Videodatei* |
| **6** | Hochladen, Videoupload und **Einspielen erzeugen mit** | Sonst trüge jede frisch angelegte Zeile eine ungeschnittene Kachel, bis der Bestandslauf beim nächsten Start darüberfährt — *an einem gerade eingespielten Bestand ist das der ganze Bestand* |

### `public/app.js` und `public/style.css` — der Zuschnitt fällt im Browser weg

| Stelle | bis 0.19.4 | ab 0.19.5 |
|---|---|---|
| `.card-img img` | `cover` + `object-position` + `transform: scale(var(--zoom))` | die zugeschnittene Kachel **ist** das sichtbare Quadrat; `cover` wird zum Leerlauf und **bleibt trotzdem stehen** |
| `.thumb img` | dasselbe | dasselbe |
| `.card:hover .card-img img` | `scale(calc(var(--zoom, 1) * 1.03))` | `scale(1.03)` — **die drei Prozent bleiben** |
| auf dem Telefon | `scale(var(--zoom, 1))` | `transform: none` — *jetzt darf dort `none` stehen* |
| `ausschnitt(p)` | erzeugte den Inline-Stil | **weggefallen** |
| `bildQuelle(p, 'thumb')` | `…/raw?size=thumb` | `…/raw?size=thumb&v=<length(thumb)>` — **an einer Stelle gebaut**, die Kachel der Übersicht und der Streifen am Eintrag bauten ihre Adresse bis 0.19.4 selbst zusammen |
| `masse()` im Editor | rechnete den Ausschnitt selbst | ruft `zuschnittKiste()` |

**`object-fit: cover` BLEIBT AN ALLEN VIER STELLEN**, obwohl es Leerlauf ist:
eine Zeile, deren Maße sich nicht lesen ließen, trägt eine ungeschnittene
Ableitung, und ohne `cover` verzerrte sie dort.

### `db.js` — die Kommentare am Schema

**Zwei Sätze im Schema waren nach dieser Runde falsch** und sind umgedreht
statt gelöscht (Stolperstein 201): *„Schneidet nichts weg … die beiden Werte
verschieben nur das sichtbare Fenster"* am Fokuspunkt und *„die Anzeige
skaliert (transform: scale) … Kein Neurechnen, keine zweite Fassung"* am Zoom.
**Was von beiden gilt, ist der tragende Teil: das ORIGINAL bleibt ganz.**

> **UND EIN BEFUND BEIM BAUEN, der hier steht, weil er den Server gekostet
> hätte.** Das ganze Schema ist **EIN Template-String**, und die Kommentare
> darin sind SQL-Kommentare. *Der übrige Quelltext dieses Projekts setzt
> Bezeichner in Kommentaren gewohnheitsmäßig in Backticks* — **hier drin
> beendet ein Backtick den String**, aus der DDL wird Quelltext, und der Server
> startet nicht mehr. **Gefunden hat es `node --check`, bevor es jemand anderes
> tat.** *Über dem Schema steht seither eine Zeile, die es sagt.*

---

## 3. Die Entscheidung zu `.lb-thumb` — eine Verhaltensänderung, ausdrücklich

**`.lb-thumb img` (der Streifen im Vollbild) zeigte bis 0.19.4 KEINEN
Ausschnitt.** Er setzte `ausschnitt()` gar nicht und zeigte einen Mittenschnitt
— *nicht aus einem Grund, sondern weil es dort niemand nachgetragen hat.*

**MIT EINER ZUGESCHNITTENEN KACHEL ZEIGT ER DEN EINGESTELLTEN AUSSCHNITT MIT.**

> **ENTSCHIEDEN: ja, und es ist eine Verbesserung** — eine Kachel, ein Bild,
> überall dasselbe. **Aber es ist eine Verhaltensänderung und keine
> Nebensache**, und sie steht deshalb hier. *Wer sie nicht wollte, bräuchte
> eine dritte Ableitung — und das wäre eine Schemaänderung und damit eine
> andere Runde.*

**`.cmt-img img` (das Kommentarbild) bleibt, wie es ist.** Kommentarbilder
haben weder Fokuspunkt noch Zoom.

> **UND EINE BERICHTIGUNG AN DEN EIGENEN PAPIEREN.** Das Änderungsprotokoll
> 0.19.4 und der Projektstand schreiben: *„Neu hereinkommende Kommentarbilder
> tragen die neue Geometrie trotzdem — beide Wege rufen dieselbe
> `makeVariants()`."* **Das stimmt nicht.** Kommentarbilder gehen durch
> `kodiereKommentarBild()` in `server.js` und werden dort mit **1600 auf der
> langen Kante** (`gross`) und **400 auf der langen Kante** (`klein`)
> abgeleitet — eine eigene Rechnung, die `makeVariants()` nie gerufen hat.
> *Die Aussage ist berichtigt; am Verhalten ändert diese Runde dort nichts.*

---

## 4. Die Videokachel — was der Auftrag nicht vorgesehen hat

**DER AUSSCHNITTEDITOR IST AM VIDEO OFFEN, SCHIEBER EINGESCHLOSSEN.** *Im
Ausschnittmodus zeigt der Betrachter das Standbild statt des Abspielers, und
`ruesteAusschnittAus()` läuft darauf wie an einem Foto.* **Ein Video kann
deshalb `zoom > 100` tragen** — und hätte nach dem Wegfall des CSS-Zuschnitts
den Mittenschnitt gezeigt, obwohl der Editor etwas anderes einstellt.

**GEBAUT: die Videokachel wird aus `medium` erzeugt.** Das ist die Ableitung
ihres Standbilds; das Standbild selbst kommt vom Browser und liegt nirgends
mehr. **Was das kostet, gehört genannt:** eine zweite JPEG-Kodierung, einmalig.
**Was es kauft:** bei `zoom > 100` zeigt die Kachel wieder den eingestellten
Ausschnitt, bei `zoom = 100` fällt sie von 910 × 512 auf 512 × 512 — dasselbe
Bild, weniger Bytes. **Ihre Kante fällt bei engem Ausschnitt unter 512**
(aus 1600 × 900 bei `zoom` 235: 383 px). *Mehr gibt die Zeile nicht her.*

---

## 5. Neue Stolpersteine — 293 bis 297

293. **EINE REGEL, DIE AUF BEIDEN SEITEN DER LEITUNG GEBRAUCHT WIRD, STEHT
    ZWEIMAL — UND MUSS DESHALB GEGENEINANDER GEPRÜFT WERDEN.** Der Browser
    zeichnet den Rahmen live, der Server schneidet ihn, und dazwischen liegt HTTP;
    eine gemeinsame Fassung gibt es nicht. **Also steht sie auf jeder Seite in
    GENAU EINER Funktion, und der Prüfstand hält beide gegeneinander** — im
    Fall des Ausschnitts über 140 Wertepaare aus sieben Bildmaßen, vier
    Zoomstufen und fünf Punkten. *Ohne diese Zusage laufen sie beim nächsten
    Anfassen auseinander, und niemand merkt es: die Kachel zeigt ja ein Bild,
    nur das falsche.*

294. **`extract()` RECHNET IN DEN GEDREHTEN MASSEN, UND SHARP SAGT SIE NICHT.**
    Stolperstein 288 an einer zweiten Stelle — und diesmal wirft es nicht,
    **es schneidet daneben.** *Nachgemessen: `metadata()` meldet 4032 × 3024
    mit Ausrichtung 6, `sharp(x).rotate().metadata()` meldet **ebenfalls**
    4032 × 3024 — die Eingangsmaße —, und das erzeugte Bild ist 3024 × 4032.*
    **Die gedrehten Maße gibt es nur über den EXIF-Vermerk selbst.** Wer die
    Kiste aus den gemeldeten baut, schneidet an der falschen Stelle; bei 3024
    Breite läge ein `left` von 3500 sogar außerhalb, und dann wirft es doch.

295. **`extract()` NIMMT DER JPEG-DEKODIERUNG IHR SHRINK-ON-LOAD.** libjpeg
    dekodiert sonst gleich in 1/2, 1/4 oder 1/8 der Maße; mit einem Zuschnitt
    davor muss es das ganze Bild dekodieren. **Der Zuschnitt kostet damit das
    DEKODIEREN und nicht das Kodieren — und der teuerste Fall ist der WEITESTE
    Ausschnitt, nicht der engste.** *Gemessen an einem 6192 × 4128: 247,0 ms
    bei `zoom` 100 gegen 155,1 ms bei `zoom` 400; ohne Zuschnitt 189,2 ms.*
    **Wer die Kosten eines Zuschnitts nach der Größe des Ausschnitts schätzt,
    schätzt in die falsche Richtung.**

296. **EINE SPALTE ZU ÄNDERN SCHREIBT DEN GANZEN SATZ NEU.** Eine 20-kB-Kachel
    in eine Zeile zu schreiben, die ein 12,7-MB-Original trägt, kostet
    **473,7 ms an einer frisch geöffneten Datei** und 48,2 ms an einer warmen —
    **linear in der Größe des ORIGINALS und nicht in der der Kachel.**
    *`SET thumb` und `SET thumb, medium` kosten dabei dasselbe (48,2 gegen
    49,2 ms): wer eine Spalte spart, spart nichts.* **Und der kalte Fall ist
    der Regelfall**, denn `cache_size` steht auf 2 MB — ein großer Satz passt
    nicht hinein und wird zum Schreiben ein zweites Mal gelesen und
    entschlüsselt.

297. **EIN MERKMAL, DAS „SCHON BEARBEITET" VON „NOCH NICHT" TRENNT, MUSS OHNE
    DIE VORLAGE AUSKOMMEN — sonst ist die Auswahl kein Festpunkt.** „Ist die
    Kachel quadratisch und hat sie die Zielkante?" wäre die naheliegende Frage
    gewesen und genau der Fehler: **mit `withoutEnlargement` ist eine zugeschnittene
    Kachel kleiner als die Zielkante, sobald der Ausschnitt es ist** (kleines
    Original, enger Ausschnitt), und sie fiele bei jedem Start zurück in die
    Auswahl. *Gefragt wird deshalb nur nach dem, was das Verfahren
    ZWANGSLÄUFIG hinterlässt — ein Quadrat.* **Der Preis ist ein Fall, den die
    Frage nicht sieht, und er gehört benannt: eine quadratische Vorlage.** Ihre
    ungeschnittene Kachel ist ebenfalls 512 × 512. *Bei `zoom = 100` macht das
    nichts — beide Wege liefern dasselbe Bild; bei `zoom > 100` bleibt sie
    weich, bis jemand ihren Ausschnitt das nächste Mal speichert. Im Bestand
    ist unter 89 Fotos kein quadratisches.*

---

## 6. Der Gegenprobenlauf

**Rückbauten vorher: 514, höchste Nummer 522. Nachher: 532, höchste Nummer
540.** *Achtzehn neue, alle in der Reihe ab 523.*

| Bereich | Nummern |
|---|---|
| Das Erzeugen selbst | 523 (die Tafel schneidet nicht), 524 (`medium` wird mitgeschnitten), 525 (gespeicherte statt gedrehte Maße), 526 (Kiste ohne Klammer am Rand), 527 (Hochrechnen auf die Zielkante), 530 (der Lauf schneidet ohne Zuschnitt) |
| Die Rufer | 528 (Hochladen), 529 (Einspielen), 531 (Videovorlage aus `data`), 532 (die vierte Aufgabe fehlt) |
| Die Route | 533 (das Ergebnis reist nicht zurück), 534 (sie schneidet nicht), 535 (sie wartet nicht) |
| Die Fassung | 536 (die Spalte), 537 (die Adresse) |
| Die zweite Hälfte | 538 (**der CSS-Zuschnitt kommt zurück** — es wird zweimal geschnitten), 539 (die Rechnung im Browser läuft der im Server davon) |
| Die Karte | 540 (die Fortschrittszeile kennt nur eine Richtung — sie sagte „mehr", wo Platz frei geworden ist) |

**ELF VORHANDENE SIND MITGEGANGEN statt gelöscht zu werden** (Stolperstein
201): 446, 483, 506 bis 508, 510, 511, 513, 514, 516 bis 518 und 522 zeigten
auf Zeilen, die diese Runde umgebaut hat.

**VIER SIND DABEI IN EINE ANDERE DATEI GEWANDERT, und das ist der
bemerkenswerte Teil.** 449, 453, 464 und 465 bauten den Zuschnitt **im
Browser** zurück — den gibt es nicht mehr. *Ein Rückbau, dessen Gegenstand
abgebaut wird, hat gewöhnlich keinen Ort mehr (so ist es 0.17.3 und 0.19.2
ergangen).* **Hier gibt es einen: die Zusage ist dieselbe geblieben, nur die
Stelle ist eine andere.** Sie zeigen jetzt auf `bilder.js` und
`bestandslauf.js`. **453 kehrt sich dabei um** — er hat die Zeile aus dem
Stilblatt genommen und setzt sie jetzt wieder ein.

**KEINER IST WEGGEFALLEN.**

*Der volle Gegenprobenlauf über alle 532 Rückbauten steht weiter aus — er
dauert rund vierzig Stunden.* **Gefahren ist die Teilmenge dieser Runde:
einundzwanzig Rückbauten in drei Nebenspuren, je ein vollständiger Prüflauf von
rund 390 Sekunden.**

> **EINUNDZWANZIG GEFAHREN, EINER STUMM — UND DER EINE IST EIN FUND.**
> **Rückbau 529** nimmt dem Import seinen Zuschnitt: eine eingespielte Zeile
> trägt danach eine ungeschnittene Kachel, und **kein einziger Punkt wurde
> rot.** *An einem gerade eingespielten Bestand ist das der ganze Bestand, und
> bis der Bestandslauf darüberfährt, liegt ein Neustart dazwischen.*
> **Die Lücke ist geschlossen:** vier neue Prüfungen spielen ein Foto mit
> `focus_x` 0, `focus_y` 0 und `zoom` 400 ein und sehen nach, dass die Kachel
> danach **225 × 225** misst (900 kurze Kante durch vier) und **das rote
> Viertel links oben** zeigt — und dass die Fassung an der eingespielten Zeile
> steht. *Nachgefahren, jetzt rot.*
> **Das ist der Sinn der Gegenprobe** (Stolperstein 274): ein stummer Rückbau
> ist die Stelle, an der der Prüfstand wegsieht.

| # | Rückbau | Namentlich rot |
|---|---|---|
| 449 | Der Zoom kommt nicht in den Zuschnitt | 8 Prüfungen in 3 Gruppen, darunter „Nach dem Speichern zeigt die Kachel die gewählte Ecke" |
| 453 | Die Überfahrregel hängt wieder am Ausschnitt | 4 in 3 Gruppen, darunter „Im Stylesheet steht kein `--zoom` mehr" |
| 464 | Der Zuschnitt verliert eine seiner beiden Achsen | „Die gegenüberliegende Ecke ebenso", „Beide Rechnungen kommen auf denselben Ausschnitt — 140 Fälle" |
| 465 | Der Zuschnitt sitzt in der Mitte statt auf dem Fokuspunkt | 5 in 2 Gruppen, darunter „Der Zuschnitt rechnet in den GEDREHTEN Maßen" |
| **523** | Die Kachel wird wieder ungeschnitten abgeleitet | **18 in 4 Gruppen** — die ganze Runde hängt daran |
| 524 | `medium` wird mitgeschnitten | 5 in 4 Gruppen, darunter „`medium` bleibt ungeschnitten" und „byte-genau dasselbe geblieben" |
| 525 | Der Zuschnitt rechnet in den gespeicherten Maßen | „Der Zuschnitt rechnet in den GEDREHTEN Maßen — die Marke liegt rechts oben" |
| **526** | Die Zuschnittkiste wird nicht gegen den Rand geklammert | **75 in 11 Gruppen** — `sharp` wirft, und die halbe Videostrecke fällt mit |
| 527 | Ein zu kleiner Ausschnitt wird hochgerechnet | 5 in 4 Gruppen, darunter „Ein kleines Bild wird nicht vergrößert" |
| 528 | Beim Hochladen wird die Kachel nicht eingerechnet | „Ein frisch hochgeladenes 16:9-Foto trägt eine quadratische 512er Kachel" |
| **529** | **Beim Einspielen wird die Kachel nicht eingerechnet** | **STUMM — ein FUND.** *Lücke geschlossen, nachgefahren* |
| 530 | Der Bestandslauf schneidet ohne Zuschnitt | 13 in 3 Gruppen |
| 531 | Die Videozeile schneidet aus der Videodatei | 7 in 3 Gruppen, darunter „Die Videokachel ist aus ihrem `medium` eingerechnet" |
| 532 | Der Thread kennt die Aufgabe `zuschnitt` nicht | 11 in 3 Gruppen |
| 533 | Das Ergebnis der einzelnen Zeile wird nicht gemeldet | „Die einzelne Zeile wird eingerechnet und das Ergebnis gemeldet", „Eine Zeile, die es nicht gibt, meldet `ok:false` und wirft nicht" |
| 534 | Das Speichern schneidet die Kachel nicht neu | 8 in 2 Gruppen |
| 535 | Die Antwort kommt, bevor die Kachel steht | 8 in 2 Gruppen, darunter „Und die Fassung in der Antwort ist die der NEUEN Kachel" |
| 536 | Die Fassung fällt aus der Fotoabfrage | 6 in 3 Gruppen, darunter „Die Fassung steht neben der Spaltenliste und nicht in ihr" |
| 537 | Die Bildadresse trägt die Fassung nicht mehr | „Die Kachel-Adresse entsteht nur in `bildQuelle()`", „Dafür trägt ihre Adresse die Fassung der Kachel" |
| 538 | Der Zuschnitt im Browser kommt zurück | „Im Stylesheet steht kein `--zoom` mehr", „Und an der Vorschaukachel ebenso wenig" |
| 539 | Die Rechnung im Browser läuft der im Server davon | 5 in 3 Gruppen, darunter „Beide Rechnungen kommen auf denselben Ausschnitt — 140 Fälle" und „Der Rahmen wird beim Zuziehen kleiner" |

**NACHGEFAHREN, in zwei Nebenspuren, je 384 s:**

| # | Rückbau | Namentlich rot |
|---|---|---|
| **529** | Beim Einspielen wird die Kachel nicht eingerechnet | **„Der Import schneidet den Ausschnitt in die Kachel"** — *nicht mehr stumm* |
| **540** | Die Fortschrittszeile kennt nur eine Richtung | **„Und wenn die Kacheln kleiner geworden sind, sagt sie ‚weniger'"** |

**Zwei gefahren, null stumm.** *Die Grundlage stand dabei bei 5237 von 5237.*

> **`Jeder Suchtext kommt in seiner Datei genau einmal vor` wird bei JEDEM
> gefahrenen Rückbau rot** — er hat seinen Suchtext gerade ersetzt. *Die
> Tabelle zählt ihn deshalb nicht mit; genau daran ist Rückbau 265 in 0.15.0
> durchgerutscht (Stolperstein 213).*

---

## 7. Prüfstand

**Vorher: 5207 Prüfungen. Nachher: 5237 — dreißig netto.**

*Zwei Gruppen sind umgeschrieben, eine ist neu:*

* **„Die Ableitung folgt der Anzeige — 0.19.4"** prüft ihre Zusagen jetzt an
  `makeVariants()` selbst statt über den Server. **Das ist kein Rückzug,
  sondern die Folge der Runde:** der Anfrageweg liefert eine zugeschnittene Kachel,
  und die ist immer quadratisch. *Die Zusagen gelten der ungeschnittenen
  Ableitung, und die muss dieselbe bleiben.*
* **„Der Ausschnitt steckt in der Kachel — 0.19.5"** ist neu. **Die Vorlagen sind
  nicht einfarbig:** wo der Ausschnitt SITZT, lässt sich an einer einfarbigen
  Fläche gar nicht zeigen. Jede Vorlage trägt vier verschieden gefärbte
  Viertel; welches die Kachel zeigt, sagt ihr Mittelwert.
* **„Fokuspunkt in der Oberfläche"** prüft die umgekehrte Zusage: `--zoom` darf
  im Stilblatt **nicht mehr** stehen, und die Adresse muss die Fassung tragen.

| Gruppe | vorher | nachher |
|---|---|---|
| **Der Ausschnitt steckt in der Kachel — 0.19.5** *(neu)* | — | **27** |
| Die Ableitung folgt der Anzeige — 0.19.4 | 15 | **13** |
| Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3 | 45 | **49** |
| Fokuspunkt in der Oberflaeche | 35 | **34** |
| Die Bildablage in der Oberflaeche | 39 | **40** |
| Die Bestandskarte fragt einmal *(die Fassung neben der Spaltenliste)* | — | **+1** |
| **zusammen** | **5207** | **5237** |

*Die 13 der 0.19.4-Gruppe sind zwei weniger als vorher, und das ist kein
Verlust: das Seitenverhältnis der ungeschnittenen Ableitung ist ohne Server
eine Rechnung und keine Messung, und die zweite Zeile dazu war ihre eigene
Wiederholung.*

*Die 27 der neuen Gruppe sind 23 aus dem Bauen und **vier aus der
Gegenprobe** — sie schließen die Lücke, die Rückbau 529 stumm aufgedeckt hat.*

---

## 7a. Die Papiere

| Papier | Was daran geändert wurde |
|---|---|
| `Doku/Projektstand_Kriterion_0_19_5.md` | **`git mv`** aus `_0_19_4`. Kopf (**Revision 53**), der Ein-Satz-Block, Betriebsstand (0.19.5 voran, 0.19.4 als **im Feld bestätigt** darunter), Fingerprinttafel, **Abschnitt 4** (die Ableitungsregel und die Videotafel), **Abschnitt 5.6** (der Fokuspunkt), **Stolpersteine 293 bis 297** und drei Anmerkungen an 272, 274 und 276 *(ihr Gegenstand ist mit dieser Runde weggefallen, ihre Lehre nicht)*, Prüfstand samt der Tafel je Version, offene Betriebspunkte, Versionsgeschichte, Fahrplan samt 10a — **und Abschnitt 12**, dessen Regel über den Weg eines Punktes berichtigt ist. *Kein anderes lebendes Papier nennt den alten Dateinamen — nachgesehen über das ganze Repo.* |
| `Doku/Aenderungsprotokoll_0.19.5.md` | **neu** — dieses Blatt |
| `Doku/Auftrag_0.19.5.md` | bleibt bis zum nächsten Auftrag liegen; `Doku/Auftrag_0.19.4.md` ist mit ihm weggefallen |
| `CHANGELOG.md` | Eintrag **mit Kasten** — wegen des zweiten Laufs über den Bestand |
| `README.md` | **zwei Berichtigungen, und das ist eine benannte Abweichung vom Auftrag.** Er sagt: *„Die README wird nur angefasst, wenn eine Datei dazukommt."* Es kommt keine dazu. **Aber zwei Sätze darin waren nach dieser Runde falsch:** *„Zugeschnitten wird nichts"* am Bildausschnitt und *„eine Kachel (400 px)"* bei den Varianten — die zweite war schon seit 0.19.4 falsch. *Ein Papier, das die Bedienung beschreibt, darf sie nicht falsch beschreiben; die Abweichung steht hier, damit sie niemand suchen muss.* |
| `Doku/Fehler_und_Ideen.md` | **nicht angefasst** — diese Runde hat keinen Punkt daraus gebaut und keinen hineingelegt |
| Konzeptpapier und Videopapier | **nicht angefasst** |

---

## 8. Was offen bleibt

- **Die quadratische Vorlage** wird von der Fälligkeitsfrage nicht erkannt
  (Stolperstein 297). *Sie heilt sich beim nächsten Speichern ihres
  Ausschnitts; im Bestand kommt sie nicht vor.*
- **`reclaim()` am Ende des Erzeugens hat keine Gegenprobe, die greift**
  (Rückbau 516, erwartet stumm). *Dieselbe Lücke besteht seit 0.19.3 an der
  Umstellung.*
- **Der volle Gegenprobenlauf** über alle Rückbauten — rund vierzig Stunden.
- **Die Zeitprobe mit dem zu engen Fenster** wird unter Last rot.
- **Ob `medium` ebenfalls `nearLossless` werden sollte**, ist nicht gemessen.
- **Die `effort`-Leiter am echten Bestand** (Stolperstein 270).
- **Der Rest der Kacheln bleibt am 2×-Bildschirm bei `zoom` 100 um 1,17fach
  hochgezogen.** *Daran ändert diese Runde nichts.*
- **Ein Hinweis im Editor, wenn der Ausschnitt enger gezogen wird, als die
  Vorlage hergibt.** *Verworfen mit Zahlen (Abschnitt 7g des Auftrags); der
  Server kennt nach dem Erzeugen die Größe des Ausschnitts und könnte es sagen.*
- **Die Wartezeit beim Speichern des Ausschnitts liegt bei 494 bis 873 ms**,
  und drei Viertel davon sind das Zurückschreiben des Satzes (Stolperstein
  296). *Kürzer würde es nur mit den Blobs in einer eigenen Tabelle — und das
  ist eine Schemaänderung.*

---

## 9. Der Fingerprint

**0.19.5 — Fingerprint `f228a06d`**

*Zuletzt gebildet, nach der letzten Änderung an einer ausgelieferten Datei — die
Versionsnummer in `package.json` eingeschlossen, und `package-lock.json` trägt
sie ein zweites Mal. `public/` gehört dazu (Stolperstein 158).*
