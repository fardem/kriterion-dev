# Änderungsprotokoll 0.19.0 — „Die Bildablage"

**Version 0.19.0 · gebaut am 1. September 2026 · Fingerprint `5fe43053` ·
5055 Prüfungen · 450 Rückbauten in `gegenprobe.js`**

---

**SAMMELBLATT Nr. 15** — aufgefallen im Betrieb am **28. August 2026** aus der
Frage nach der Größe der Datenbank; am **30. August** um den engeren Ausschnitt
und das Bildformat erweitert; am **1. September** gemessen und gebaut.

**Der Befund in einem Satz:** *679 der 1032 Bilder lagen als PNG im Original —
435,7 MB von 568,9 MB des gesamten Bildbestands.* Es sind Bildschirmfotos, die
mit Strg+V hereinkommen; der Browser legt die Zwischenablage als PNG ab, und der
Server hat sie unverändert gespeichert.

**Das Ergebnis der Messung in einem Satz:** *als WebP im Verfahren
`nearLossless` bei `quality: 60` werden aus 435,7 MB **161,9 MB**, ohne dass
eines von hundert Bildern sichtbar schlechter wird.*

> **DIE NUMMER: MINOR.** *Drei Dinge kann die Instanz danach: Bilder
> platzsparend ablegen, ohne sie zu verschlechtern; den vorhandenen Bestand auf
> Knopfdruck nachziehen; und den Bildausschnitt enger wählen.*

> **DIES IST EINE DATENBANKSTUFE — ausdrücklich gesagt.** Es kommt der **achte**
> markierte Migrationsblock dazu (`photos.zoom`), und das **Austauschformat geht
> von 11 auf 12**. **Die Sicherung des Datenverzeichnisses ist PFLICHT und nicht
> Empfehlung**, und im Changelog steht ein Kasten über den Änderungen.
> **`F_ROUTEN` geht von 69 auf 70**, `BESTAETIGUNG_ZWECKE` von **sieben auf
> acht**; es bleibt bei **achtzehn** Karten in fünf Abschnitten und **acht**
> persönlichen Schlüsseln — nachgezählt und nicht angenommen.

> **UND ES GIBT EINEN ZWEITEN GRUND FÜR DIE SICHERUNG, der schwerer wiegt als
> die Spalte:** der Knopf „Alle PNG nach WebP umstellen" **überschreibt
> Bildbytes**. Die PNG-Fassung ist danach weg, es gibt keinen Papierkorb dafür
> und keinen Rückweg. *Der Knopf läuft nur, wenn jemand ihn drückt; das
> Einspielen allein ändert an vorhandenen Bildern nichts.*

---

## Inhalt

1. [Was gebaut ist](#1-was-gebaut-ist)
2. [Die Messung, auf der die Runde steht](#2-die-messung-auf-der-die-runde-steht)
3. [Die nachgeholte `effort`-Messung — und was dabei herauskam](#3-die-nachgeholte-effort-messung--und-was-dabei-herauskam)
4. [Die Ablage im Server](#4-die-ablage-im-server)
5. [Der Knopf](#5-der-knopf)
6. [Der engere Ausschnitt](#6-der-engere-ausschnitt)
7. [Die Kennzahlen: ein Durchgang statt zweier](#7-die-kennzahlen-ein-durchgang-statt-zweier)
8. [Die Asymmetrie der beiden Bildwege](#8-die-asymmetrie-der-beiden-bildwege)
9. [Die Entscheidungen dieser Runde](#9-die-entscheidungen-dieser-runde)
10. [Abweichungen, mit Begründung](#10-abweichungen-mit-begründung)
11. [Was je Datei geändert wurde](#11-was-je-datei-geändert-wurde)
12. [Der Prüfstand](#12-der-prüfstand)
13. [Gegenproben](#13-gegenproben)
14. [Neue Stolpersteine](#14-neue-stolpersteine)
15. [Die Zahlen](#15-die-zahlen)
16. [Was ausdrücklich nicht gebaut ist](#16-was-ausdrücklich-nicht-gebaut-ist)
17. [Offen geblieben](#17-offen-geblieben)

---

## 1. Was gebaut ist

**Drei Stücke und eine Beigabe.**

1. **Jedes ankommende PNG wird ein WebP.** Erkannt an den ersten acht Bytes,
   umgewandelt mit `nearLossless: true, quality: 60, effort: 4`, `mime_type`
   mitgezogen. **Nur wenn das Ergebnis kleiner ist und WebP das Bild überhaupt
   fassen kann** (höchstens 16383 px je Kante); sonst bleibt die Vorlage
   unberührt. **JPEG, GIF und vorhandenes WebP werden nicht angefasst.** Ein
   **Schalter** im Reiter „Datenbank" (Vorgabe an, nur der Eigentümer) schaltet
   es ab.
2. **Ein Knopf zieht den vorhandenen Bestand nach.**
   `POST /api/bilder/umstellen`, **zweitbestätigt**, kehrt sofort zurück (202),
   arbeitet Zeile für Zeile mit 30 ms Pause, meldet den Fortschritt als Feld in
   `/api/stats` und ruft danach `reclaim()`.
3. **Der Bildausschnitt lässt sich enger ziehen.** `photos.zoom`, 100 bis 400
   Prozent, achter Migrationsblock, Austauschformat 12. **Es wird nichts
   geschnitten** — die drei Werte sind `object-position` und eine Skalierung.

**Und die Beigabe:** `/api/stats` geht **einmal** statt zweimal durch `photos`
und liefert dabei die Aufteilung nach Format mit.

---

## 2. Die Messung, auf der die Runde steht

> **DIESE RUNDE IST GEMESSEN UND NICHT GESCHÄTZT.** Vier Messläufe an der
> **echten Instanz** mit **je hundert zufällig gezogenen Bildern**. *Wo eine
> Zahl fehlt, steht das ausdrücklich da (Stolperstein 252) — siehe Abschnitt 3.*

### Der Bestand, gezählt

| | Anzahl | Original | `thumb` | `medium` | zusammen |
|---|---|---|---|---|---|
| **PNG** | **679** | **435,7 MB** | 9,6 MB | 36,1 MB | 481,4 MB |
| JPEG | 344 | 61,5 MB | 4,7 MB | 20,3 MB | 86,4 MB |
| WebP | 9 | 0,6 MB | 0,1 MB | 0,3 MB | 1,0 MB |
| **zusammen** | **1032** | **497,7 MB** | **14,4 MB** | **56,7 MB** | **568,9 MB** |

Dazu **35 Kommentarbilder** (1,3 MB groß + 0,3 MB klein, nie ein Original) und
**6 Videos** (46,7 MB), die beide unberührt bleiben.

**Das Gewicht liegt am Original, nicht an den Ableitungen** — 497,7 von 568,9 MB.

### Wie die Bilder beschaffen sind

**92 von 100** zufällig gezogenen PNG sind **fotografisch**. *Der Betreiber macht
Bildschirmfotos **von Fotos**: eine Ansicht ist offen, und statt die Datei zu
laden wird der Bildschirm abgelichtet.* **Es sind also weder reine
Bedienoberflächen noch reine Aufnahmen, sondern beides gemischt — oft im selben
Bild.**

**100 von 100 haben einen Alphakanal**, und er trägt nichts. **Er kostet auch
nichts:** libwebp wirft einen durchgehend undurchsichtigen Alphakanal von selbst
weg — die WebP-Datei ist mit und ohne ihn **byte-identisch** (72.950 = 72.950).
*Nachgestellt im Prüflauf dieser Runde an erzeugtem Material: 1.039.086 =
1.039.086 Bytes.* **Da ist nichts zu holen.**

### Die Leiter, an hundert echten Bildern

*Stichprobe 53,2 MB PNG, alles mit `effort: 4`. „max" ist die **größte
Abweichung eines einzelnen Farbwerts im ganzen Durchlauf** — nicht der
Durchschnitt, der schlimmste Einzelfall. „Bilder>30" zählt, an wie vielen
Bildern diese Abweichung über 30 von 255 liegt, also über der Grenze, ab der man
sie an einer Kante sieht.*

| Verfahren | für alle 679 PNG | mittl. MAE | **max** | **Bilder>30** |
|---|---|---|---|---|
| `lossless` | 216,6 MB | 0 | **0** | **0 von 100** |
| `nearLossless` 80 | 182,4 MB | 0,30 | **1** | **0 von 100** |
| **`nearLossless` 60** | **161,9 MB** | **0,53** | **2** | **0 von 100** |
| `nearLossless` 40 | 155,0 MB | 0,82 | **4** | **0 von 100** |
| `nearLossless` 20 | 153,6 MB | 1,13 | **8** | **0 von 100** |
| `quality: 100` | 88,1 MB | 0,78 | **115** | **11 von 100** |
| `quality: 98` | 81,9 MB | 0,82 | **116** | **11 von 100** |
| `quality: 95` | 66,1 MB | 0,97 | **116** | **11 von 100** |
| `quality: 90` | 46,8 MB | 1,31 | **112** | **11 von 100** |

**DIE ENTSCHEIDENDE ZEILE IST `quality: 100`.** Die höchste verlustbehaftete
Güte, die es überhaupt gibt, beschädigt **dieselben elf Bilder** mit **derselben
Abweichung** wie `quality: 90`. **Der verlustbehaftete Kodierer franst an harten
Kanten grundsätzlich aus; eine höhere Güte ändert daran nichts.** *Das ist keine
Frage der Einstellung, sondern des Verfahrens.*

### Warum 60 und nicht 80 oder 40

**Der Gewinn viertelt sich mit jedem Schritt** (34,2 → 20,5 → 6,9 → 1,4 MB),
**die Abweichung verdoppelt sich** (1 → 2 → 4 → 8). Die beiden Kurven kreuzen
sich bei 60.

* **80** kostet **20,5 MB mehr** für max 1 statt max 2. *Beides ist unsichtbar —
  0,4 % gegen 0,8 % des Wertebereichs.*
* **40** bringt **6,9 MB** und verdoppelt die Abweichung auf 4. *Vertretbar, aber
  6,9 MB sind 4 % des Bestands.*
* **20** bringt **1,4 MB**. *Der Punkt, an dem man Qualität für nichts hergibt.*

> **UND `nearLossless` 60 SCHLÄGT DAS REINE VERLUSTFREIE:** 161,9 MB gegen
> 216,6 MB — **55 MB kleiner**, bei einer größten Abweichung von **2 von 255**.
> **Wer „so exakt wie möglich" will, nimmt trotzdem nicht `lossless`.**

### Was `nearLossless` ist

**Es ist kein Gütewert, sondern ein drittes Verfahren.** WebP hat **zwei**
Bitströme: `VP8` (verlustbehaftet, aus dem Videocodec) und `VP8L` (verlustfrei).
*Die Leiter `quality: 90…100` fährt den ersten.* **`nearLossless` fährt den
zweiten** — nachgeprüft an der Chunk-Kennung der erzeugten Dateien, und der
Prüflauf dieser Runde nagelt sie fest: **`nearLossless` 60 ergibt `VP8L`,
`quality: 90` ergibt `VP8 `.**

Es ist eine **Vorbehandlung**: vor dem verlustfreien Kodieren werden Pixelwerte
dort minimal angeglichen, wo man es nicht sieht. **Der `quality`-Wert steuert
dabei nicht die Bildgüte, sondern wie stark geglättet wird** — 100 heißt gar
nicht, 1 heißt maximal.

**Heraus kommt eine gewöhnliche WebP-Datei.** Kein Sonderformat, keine Frage der
Lesbarkeit im Browser, keine neue Abhängigkeit — `sharp` kann es seit je
(nachgeprüft an **0.35.3 / libvips 8.18.3 / libwebp 1.6.0**).

---

## 3. Die nachgeholte `effort`-Messung — und was dabei herauskam

**Der Auftrag hat es ausdrücklich verlangt:** `effort: 4` war für `nearLossless`
**nicht separat gemessen**; der Wert stammte aus der Messung am rein
verlustfreien Weg und war auf `nearLossless` **übertragen**. *Die Übertragung war
plausibel — beide fahren denselben `VP8L`-Kodierer —, belegt war sie nicht.*

> **UND SIE IST AM ECHTEN BESTAND WEITERHIN NICHT BELEGT.** Der bauende Lauf
> kommt der laufenden Instanz nicht bei; gemessen wurde an **erzeugtem**
> Material. **Das steht hier, weil es sonst wieder passiert (Stolperstein 252):
> eine Zahl, die nicht am echten Bestand gemessen wurde, ist keine Messung am
> echten Bestand.**

**Zwei Läufe, je zwölf erzeugte PNG in Bildschirmgröße, `nearLossless` 60 über
`effort` 1 bis 6, Größe UND Zeit.**

**Lauf 1 — Material mit Pixelrauschen** (Rauschen je Pixel über einem Verlauf,
harte Kanten obenauf), 50,2 MB PNG:

| effort | Größe | vom PNG | Zeit gesamt | je Bild |
|---|---|---|---|---|
| 1 | 16,58 MB | 33,0 % | 19.559 ms | 1.630 ms |
| 2 | 16,82 MB | 33,5 % | 18.819 ms | 1.568 ms |
| 3 | 16,82 MB | 33,5 % | 18.308 ms | 1.526 ms |
| **4** | **16,82 MB** | **33,5 %** | **17.723 ms** | **1.477 ms** |
| 5 | 14,55 MB | 29,0 % | 25.679 ms | 2.140 ms |
| 6 | 14,55 MB | 29,0 % | 24.585 ms | 2.049 ms |

**Lauf 2 — Material mit räumlich zusammenhängendem Rauschen** (weichgezeichnet,
harte Kanten und ein Textband danach obenauf — so sieht ein Bildschirmfoto **von
einem Foto** aus), 38,3 MB PNG:

| effort | Größe | vom PNG | Zeit gesamt | je Bild |
|---|---|---|---|---|
| 1 | 11,08 MB | 28,9 % | 16.791 ms | 1.399 ms |
| 2 | 11,04 MB | 28,8 % | 16.238 ms | 1.353 ms |
| 3 | 11,04 MB | 28,8 % | 15.613 ms | 1.301 ms |
| **4** | **11,04 MB** | **28,8 %** | **16.341 ms** | **1.362 ms** |
| 5 | 10,82 MB | 28,2 % | 20.197 ms | 1.683 ms |
| 6 | 10,82 MB | 28,2 % | 18.979 ms | 1.582 ms |

**DAS ERGEBNIS SIND ZWEI VERSCHIEDENE ANTWORTEN AUF DIESELBE FRAGE.** Bei
Pixelrauschen bringen `effort` 5 und 6 **13,5 %** — die Übertragung „ab 2 flach"
wäre damit widerlegt. Bei fotoähnlichem Material sind 2, 3 und 4 in der Summe
**byte-identisch**, und 5 und 6 bringen **2,0 %** bei **24 %** mehr Zeit — dort
hält sie.

**`effort: 4` BLEIBT**, und zwar aus dem Ergebnis von Lauf 2: der echte Bestand
ist zu 92 % fotografisch, und dort kostet die letzte Stufe ein Viertel mehr
Rechenzeit für zwei Prozent. *Die Rechenzeit fällt bei jedem einzelnen Upload
an, die zwei Prozent einmal.*

> **DIE LEHRE IST STOLPERSTEIN 270**, und sie ist größer als diese Zahl:
> **dasselbe Verfahren beantwortet dieselbe Frage verschieden, je nachdem, woran
> gemessen wird.** *Dieselbe Falle hat schon die Messung zur Bildablage selbst
> gestellt — eine Empfehlung „verlustfrei, ohne Einstellung" stand auf
> Prüfbildern, die Bedienoberflächen zeigten.*

**Zum Vergleich mitgemessen, rein verlustfrei** (daher stammt die übertragene
Annahme), Material 2: `effort` 1 bis 4 ergeben durchgehend **10,97 MB**, 5 und 6
**10,93 MB** — *dieselbe Form der Kurve, und damit ist die Übertragung in ihrer
**Form** belegt, in ihrer **Zahl** nicht.*

**Nebenher reproduziert, und es ist derselbe Fund wie in der Messung zum
verlustfreien Weg:** `effort: 5` war in **allen vier** hier gefahrenen Leitern
**langsamer als `effort: 6`**.

### Was in dieser Runde außerdem nachgestellt wurde

| Behauptung des Auftrags | nachgestellt |
|---|---|
| `nearLossless` fährt `VP8L`, `quality` fährt `VP8` | **ja** — Chunk-Kennung `VP8L` gegen `VP8 ` |
| ein undurchsichtiger Alphakanal kostet nichts | **ja** — byte-identisch, 1.039.086 = 1.039.086 |
| WebP kann höchstens 16383 px je Kante | **ja** — 16383 geht, 16384 wirft „Processed image is too large for the WebP format" |
| `nearLossless` 60 weicht höchstens um 2 von 255 ab | **ja** — am erzeugten Material max 2; im Prüflauf als Zusage festgenagelt |
| ein PNG, das als WebP größer wäre, bleibt PNG | **NEIN — nicht nachstellbar.** Neun Anläufe (1×1 bis 256×256, Rauschen, Palette, Graustufen, mit und ohne Alpha) ergaben ausnahmslos ein **kleineres** WebP. Der Fall kommt am echten Bestand vor; mit erzeugtem Material ließ er sich nicht herstellen. *Siehe Abschnitt 10c.* |

---

## 4. Die Ablage im Server

**`legeBildAb()`** steht im Abschnitt „Die Ablage des Originals" in `server.js`,
zwischen `makeVariants()` und der Speicherpflege.

```
Wenn die ankommenden Bytes mit 89 50 4E 47 0D 0A 1A 0A beginnen (PNG):
    versuche sharp(...).webp({ nearLossless: true, quality: 60, effort: 4 })
    ist das Ergebnis KLEINER als die Vorlage:  nimm es, mime_type = 'image/webp'
    sonst oder bei Fehler:                     behalte die Vorlage unverändert
Sonst: unverändert.
```

* **Die Erkennung geht über die ersten acht Bytes, nicht über den gemeldeten
  Typ.** *Ein Byte-Vergleich, kein Dekodieren — er kostet nichts, und er glaubt
  dem Browser nicht auf sein Wort.*
* **`mime_type` wird mitgezogen.** *Sonst läge WebP unter dem Namen `image/png`
  in der Tabelle, und der nächste Export trüge die Lüge weiter. Die Auslieferung
  selbst fällt nicht darauf herein — sie liest die ersten Bytes —, aber eine
  falsche Spalte bleibt eine falsche Spalte.*
* **Ausdrücklich OHNE `failOn: 'none'`**, anders als `makeVariants()`: eine
  Vorlage, an der `sharp` etwas zu beanstanden hat, soll hier **nicht halb**
  umgewandelt werden. *Bei einer Ableitung ist ein Rest besser als nichts, beim
  Original nicht.*
* **Die Ableitungen kommen aus der Vorlage, nicht aus der Ablagefassung.** *Beide
  Wege ergäben dasselbe Bild, aber ein zweites Dekodieren wäre Arbeit ohne
  Ertrag — und `.rotate()` liest EXIF, das in der WebP-Fassung nicht mehr steht.*

**Der Schalter** heißt `bilderUmwandeln`, liegt in `settings` (global) und geht
über **`PUT /api/settings`** — keine eigene Route. **Er ist Eigentümersache**,
und dafür bekommt die Route einen **dritten Rang**: bis 0.18.1 kannte sie zwei
Hälften — was in `PERSOENLICHE_SCHLUESSEL` steht, ist persönlich, alles Übrige
Adminsache. **`EIGENTUEMER_SCHLUESSEL` steht jetzt als eigene Liste daneben**,
und die Ableitung bleibt: was in keiner der beiden Listen steht, ist weiterhin
Adminsache.

> **STRG+V UND DATEIAUSWAHL SIND DERSELBE WEG.** In `req.files` steht eine Datei
> und sonst nichts — der Server kann die beiden nicht unterscheiden, und ein
> Feld im Formular wäre eine **Behauptung des Browsers** darüber, wie das Archiv
> speichern soll. **Er braucht die Unterscheidung auch nicht:** die
> Zwischenablage liefert immer PNG, eine Kamera JPEG; der Bestand belegt es mit
> **679 zu 344**.

---

## 5. Der Knopf

**`POST /api/bilder/umstellen`**, `nurEigentuemer` **und**
`zweiteBestaetigungNoetig('bilder')`.

* **Er kehrt sofort zurück (202).** *Acht Minuten Rechenzeit an einer offenen
  HTTP-Verbindung sind das, was beim Import ausdrücklich vermieden wird.*
* **Gearbeitet wird wie in `backfillVariants()`:** Zeile für Zeile, **30 ms
  Pause** dazwischen. *Das Vorbild stand schon da und hat dieselbe Aufgabe.*
* **Je Bild eine eigene Transaktion — und dafür steht ausdrücklich KEIN
  `db.transaction()` um das einzelne `UPDATE`:** eine einzelne Anweisung **ist**
  in SQLite ihre eigene Transaktion. *Eine Klammer darum sagte, es geschehe mehr
  als eines, und das wäre unwahr.*
* **Der Fortschritt geht als Feld in `/api/stats`** — `{ laeuft, gesamt,
  erledigt, umgestellt, geblieben, gespart }` oder `null`. **Keine zweite
  Route.** *Er bleibt nach dem Ende mit `laeuft: false` stehen: die Karte fragt
  während des Laufs nach, und die letzte Antwort soll sagen können, was
  herauskam.*
* **Zweimal drücken startet nicht zweimal** — der zweite Aufruf bekommt **409**.
* **`thumb` und `medium` werden NICHT neu gerechnet.** *Sie sind aus demselben
  Bild entstanden und bleiben gültig.*
* **`reclaim()` danach.** *Sonst wächst die Datei erst und schrumpft nie.*
* **Eine Zeile reißt den Lauf nicht ab.** *Sie bleibt, wie sie ist, wird als
  „geblieben" gezählt und ins Protokoll genannt.*

**Der Dialog davor beschönigt nichts:** wie viele Bilder, wie viel Platz, die
erwartete Größe danach, **dass die PNG-Fassung nicht mehr da ist**, und dass
eine Sicherung des Datenverzeichnisses die einzige Rückfahrkarte ist.
*„Unwiderruflich" ist hier richtig und nicht wie beim Löschen falsch — für
Bildbytes gibt es keinen Papierkorb.*

> **ER WAR ALS WIRTSSKRIPT `bilder.js` GEPLANT**, in der Bauform von `zugang.js`
> und `schluessel.js`. **Der Knopf ist die bessere Wahl, nicht die bequemere:**
> es ist keine einmalige Umstellung, sondern eine Funktion, die bleibt (der
> Schalter kann ein Jahr aus stehen, eine alte Sicherung bringt PNG zurück, der
> Bestand wächst wieder); der Server ist der bessere Schreiber (ein Wirtsskript
> müsste die Instanz anhalten — fremder Schreiber auf einer WAL-Datei); und es
> gäbe sonst **zwei Werkzeuge für eine Sache**.

---

## 6. Der engere Ausschnitt

**`photos.zoom REAL NOT NULL DEFAULT 100`** — ein Prozentwert. **100 heißt „so
weit wie das Bild hergibt"** und ist damit genau der Zustand bis 0.18.1; **400**
heißt viermal so nah.

* **Die Vorgabe ist der heutige Zustand**, wie bei `focus_x`/`focus_y`: jede
  vorhandene Zeile steht damit ohne Umschreiben richtig da. *Das geht auch
  technisch — `ALTER TABLE ADD COLUMN` nimmt in SQLite eine **konstante**
  Vorgabe an (Stolperstein 105).*
* **Der achte Migrationsblock** heißt `migration0190()` und ist markiert wie die
  sieben davor, damit die Bereinigung in 0.21.0 ihn findet.
* **Austauschformat 12.** Der Wert geht in den Export und wird beim Import
  gelesen; **fehlt er**, gilt die Vorgabe — *dieselbe Regel wie beim Fokuspunkt,
  und deshalb steht dort keine Fallunterscheidung nach Formatnummer:
  entschieden wird über das **Vorhandensein** des Feldes.*
* **Es wird nichts geschnitten.** Der Zoom ist ein `transform: scale()` am
  Bild, der Behälter beschneidet. **Kein Neurechnen, keine zweite Fassung.**

**Die Grenzen und ihre Begründung:** **unter 100** deckte das Bild den
quadratischen Behälter nicht mehr, und der Rand zeigte **Leere statt Bild** —
das ist die Antwort auf die Frage, die der Auftrag stellt. **Über 400** sähe man
die 1600px-Ableitung und nicht mehr das Motiv.

**Beschnitten wird an EINER Stelle.** Bis 0.18.1 stand die Spanne zweimal da —
einmal in der Route (`zahl()`), einmal im Import (`im()`). **`ANZEIGEWERTE` ist
jetzt die eine Tafel für alle drei Werte**, und die beiden Wege unterscheiden
sich nur noch darin, **was bei Unsinn geschieht**: die Route sagt ab (dort sitzt
jemand davor), der Import nimmt die Vorgabe (die Datei ist, wie sie ist).

**Die Bedienung sitzt dort, wo der Fokuspunkt gesetzt wird**, und geht über
**dieselbe Route** — `PUT /api/photos/:id/focus`, ein Feld mehr. *Ein Schieber
und kein Mausrad: ein Rad gäbe es auf dem Telefon nicht.*

> **EIN FEHLENDES `zoom` BEHÄLT SEINEN WERT (Stolperstein 271).** Zwei
> Bedienungen führen auf dieselbe Route: das **Ziehen** setzt den Punkt und
> schickt kein `zoom` mit, der **Schieber** schickt alle drei. Ein stilles
> Zurücksetzen auf 100 nähme dem Bedienenden bei jedem Zug den eingestellten
> Ausschnitt weg. **Ein mitgeschickter Unsinn ist dagegen eine Absage.**

> **DER WERT GEHT ALS EIGENSCHAFT `--zoom` AN DIE OBERFLÄCHE UND NICHT ALS
> `transform` (Stolperstein 272).** Ein Inline-Stil schlägt jede Regel aus dem
> Stilblatt — auch `.card:hover .card-img img { transform: scale(1.03) }`.
> **Die Kacheln mit eingestelltem Ausschnitt — und nur die — hätten ihre
> Bewegung beim Überfahren verloren.**

---

## 7. Die Kennzahlen: ein Durchgang statt zweier

**Beim Messen aufgefallen, mit der Bildablage nicht verwandt** — und deshalb in
dieser Runde und nicht in einer eigenen.

`/api/stats` fragte `photos` **zweimal** hintereinander ab: einmal
`WHERE art != 'video'`, einmal `WHERE art = 'video'`. **Jeder Durchlauf ist ein
voller Tabellendurchgang über alle Blobs.**

**Gemessen an einer eigens gebauten Datenbank in der Größe der echten**
(679 PNG, 344 JPEG, 9 WebP, 606 MB):

| | kalt | warm |
|---|---|---|
| **zwei getrennte Durchläufe (bis 0.18.1)** | 6.566 ms | **4.230 ms** |
| **ein `GROUP BY`** | 3.235 ms | **2.990 ms** |

*`COUNT(*)` allein kostet 0 ms — teuer ist der Durchgang, nicht das Zählen.*

**Die gemessenen 2.990 ms sind der Wert MIT der Formataufteilung** — sie steckt
in derselben Zeile schon drin. **Die Karte bekommt eine Auskunft dazu und wird
dabei um 1,2 Sekunden schneller.**

*Die Formaterkennung läuft über `hex(substr(data,1,8))` und Ähnliches — SQLite
holt die ersten Bytes, ohne das Blob zu lesen.*

**Die vorhandenen Felder ändern sich nicht** — `photoCount`, `photoBytes`,
`videoCount`, `videoBytes` behalten Namen und Bedeutung; sie werden nur anders
**gerechnet**, nicht anders **gemeint**. Die Aufteilung kommt **daneben**.
**Videos stehen ausdrücklich nicht in der Aufteilung:** bei einer Videozeile
trägt `data` die Videodatei.

---

## 8. Die Asymmetrie der beiden Bildwege

**Teil (c) des Fahrplans, und der Teil, der wirklich fehlte.**

| Weg | Was in der Datenbank landet |
|---|---|
| Foto am **Eintrag** (`photos`) | **das Original** (ein PNG als WebP), dazu 1600px- und 400px-JPEG |
| Bild im **Kommentar** (`comment_images`) | **nur** 1600px- und 400px-JPEG — **kein Original** |

**Aufgeschrieben ist es an einer Stelle im Quelltext** — im Kopf des Abschnitts
„Bildableitungen" in `server.js`, wo `makeVariants()` steht — **und im
Projektstand, Abschnitt 4.**

**Die offene Frage des Fahrplans ist beantwortet: NEIN**, das Kommentarbild
bekommt auch künftig kein Original. *Es wäre einheitlich, und es vergrößerte die
Datenbank an der Stelle, an der die meisten Bilder anfallen; im Kommentar gibt es
kein Vollbild in dem Sinn, in dem der Eintrag eines hat.* **Die Begründung wird
aufgeschrieben, nicht die Verschiebung.**

**Und der Generationsverlust steht im selben Absatz, mit Zahlen:** beim
wiederholten Ein- und Ausspielen summiert sich das Kommentarbild, weil der
Import das gespeicherte JPEG erneut als JPEG kodiert — **MAE 0,06 nach einer
Runde, 0,10 nach sechs.** *Es läuft aus statt davonzulaufen, und die erste
Kodierung kostet mit 1,89 ohnehin ein Vielfaches.* **Kein Handlungsbedarf — aber
wer es entdeckt, soll die Zahlen daneben finden und es nicht für schlimmer
halten, als es ist.**

---

## 9. Die Entscheidungen dieser Runde

1. **`nearLossless` 60 und nicht `lossless`.** *55 MB gegen eine größte
   Abweichung von 2 von 255. Wer die Abwägung anders trifft, nimmt `lossless`;
   beides ist vertretbar, und die Entscheidung steht hier, damit sie nicht in
   einem halben Jahr als Versehen gelesen wird.*
2. **Ein Schalter, aber nicht nach Herkunft.** *Der Server sieht den Unterschied
   zwischen Strg+V und Dateiauswahl gar nicht; das Format bildet ihn ohnehin ab;
   und es wären zwei Formate für denselben Inhalt, entschieden dadurch, wie er
   hereinkam.*
3. **Ein Knopf statt eines Wirtsskripts.** *Begründet in Abschnitt 5.*
4. **Der Import wandelt nicht um.** *Er ist ein einziger HTTP-Aufruf über den
   ganzen Bestand. Die Folge — eine alte Sicherung bringt PNG zurück — ist
   gewollt, und der Knopf ist die Antwort darauf.*
5. **Kein Rückweg „WebP wieder nach PNG".** *Er stellte nicht die Datei wieder
   her, die dagewesen ist, sondern eine neue mit denselben Pixeln.*
6. **`effort: 4` bleibt.** *Begründet in Abschnitt 3, mit den Zahlen daneben.*
7. **Achtzehn Karten bleiben achtzehn.** *Schalter und Knopf stehen in
   „Kennzahlen", neben der Aufstellung, die sie erklärt — eine eigene Karte für
   zwei Bedienelemente stünde neben ihrer eigenen Begründung.*

---

## 10. Abweichungen, mit Begründung

**a) DIE `effort`-LEITER IST NICHT AM ECHTEN BESTAND GEMESSEN.** *Der Auftrag
verlangt „dieselbe Stichprobe"; diese Umgebung kommt der laufenden Instanz nicht
bei.* **Gemessen wurde an erzeugtem Material, das Ergebnis steht in Abschnitt 3
samt seiner Grenze, und die Lehre daraus ist Stolperstein 270.** *`effort: 4`
bleibt — die Entscheidung ist damit belegt, aber nicht am echten Bestand.*

**b) DIE ZAHLEN DER MESSUNG AUS DEM AUFTRAG SIND ÜBERNOMMEN UND NICHT NEU
ERHOBEN.** *Die Tabellen in Abschnitt 2 stammen aus den vier Messläufen an der
echten Instanz, die dem Auftrag zugrunde liegen.* **Was in dieser Runde
nachgestellt wurde, steht in der Tabelle am Ende von Abschnitt 3** — vier
Behauptungen, alle vier bestätigt.

**c) EINER DER BEIDEN RÜCKFÄLLE IST NICHT NACHGESTELLT.** *„Ein PNG, das nach
der Umwandlung größer wäre, bleibt PNG" — der Auftrag sagt dazu „gemessen kommt
das vor", und das gilt für den echten Bestand.* **Mit erzeugtem Material ließ er
sich nicht herstellen:** neun Anläufe — 1×1 bis 256×256, Rauschen, Palette,
Graustufen, mit und ohne Alpha — ergaben ausnahmslos ein **kleineres** WebP.
*Der Grund ist strukturell: das kleinste mögliche PNG ist 68 Bytes groß
(Signatur, IHDR, IDAT, IEND), das kleinste mögliche WebP 36 — am unteren Ende
kann PNG gar nicht gewinnen, und am oberen komprimiert `VP8L` durchweg besser
als zlib.* **Die Zeile steht im Quelltext, der Rückbau dazu (433) ist als STUMM
gekennzeichnet mit dieser Begründung, und der ANDERE Rückfall — WebP kann
höchstens 16383 px je Kante — ist nachgestellt.** *Auch das ist eine Zahl, die
fehlt, und sie steht deshalb ausdrücklich da (Stolperstein 252).*

**d) DER STOLPERSTEIN 269 TRUG SELBST EINE FALSCHE ZAHL.** Er sagte, in
`gegenprobe.js` stünden 422 Einträge und die Nummern reichten bis **429**.
**Nachgezählt sind es 422 Einträge, davon 419 mit Nummer** (die übrigen heißen
`W2`, `W5`, `W6`), **und die höchste war 430.** *Berichtigt, mit einem Vermerk
darüber, dass ausgerechnet der Stolperstein über falsche Zahlen eine trug.*

**e) DER FORTSCHRITT BLEIBT NACH DEM LAUF STEHEN**, statt auf `null`
zurückzuspringen. *Der Auftrag sagt „`{ läuft, erledigt, gesamt }` oder
`null`"; die Form ist dieselbe, nur verschwindet der letzte Stand nicht im
Augenblick des Fertigwerdens.* **Sonst sähe die Karte nicht den Abschluss,
sondern nur das Verschwinden.**

**f) DER STAND TRÄGT DREI FELDER MEHR** als die drei genannten: `umgestellt`,
`geblieben` und `gespart`. *Ohne sie könnte die Karte nach dem Lauf nur „fertig"
sagen und nicht, was herausgekommen ist — und die Zusage „nach dem Lauf liegt
kein PNG mehr da" wäre an einer Instanz mit einem winzigen PNG schlicht falsch.*

---

## 11. Was je Datei geändert wurde

| Datei | Was |
|---|---|
| `server.js` | **Der Abschnitt „Die Ablage des Originals"** — `WEBP_ABLAGE`, `PNG_MAGIE`, `istPNG()`, `bilderUmwandeln()`, `legeBildAb()`, dazu `umstellung`, `umstellungsStand()`, `qOffenePNG` und `stelleBestandUm()`. **Der Kopf des Abschnitts „Bildableitungen"** trägt die Asymmetrie der beiden Bildwege. **`EIGENTUEMER_SCHLUESSEL`** als dritter Rang in `PUT /api/settings`; der Schalter in `GET`/`PUT /api/settings`. **`POST /api/items/:id/photos`** legt über `legeBildAb()` ab. **`/api/stats`** mit einer `GROUP BY`-Abfrage statt zweier, `bildFormate` und `umstellung`. **Die neue Route `POST /api/bilder/umstellen`.** **`ANZEIGEWERTE`/`anzeigeWert()`** und `PUT /api/photos/:id/focus` mit `zoom`; `qPhotos`, Export und Import ziehen `zoom` mit. **`AUSTAUSCH_FORMAT` 11 → 12.** |
| `db.js` | **Spalte `zoom` in der DDL** samt Begründung, die Spaltentafel für `art` um `zoom` ergänzt, **`migration0190()`** als achter markierter Block und im Export des Moduls. |
| `auth.js` | **`BESTAETIGUNG_ZWECKE` um `'bilder'`** — der achte Zweck und der einzige, der Bytes überschreibt. |
| `public/app.js` | **`fokus()` → `ausschnitt()`**, liefert den ganzen Stil samt `--zoom`. **Der Schieber im Ausschnittmodus** samt Zeichnen und Speichern über EINEN Weg. **`BILDER_UMWANDELN`** in `ladeEinstellungen()`. **Die Karte „Kennzahlen"** bekommt den Abschnitt „Bildablage" (Aufstellung, Schalter, Knopf, Fortschrittszeile) und **erstmals einen Behandler** (`ruesteKennzahlenAus`), dazu `BILDFORMATE`, `umstellungsZeile()` und `verfolgeUmstellung()`. |
| `public/style.css` | **`transform: scale(var(--zoom, 1))`** an `.card-img img` und `.thumb img`, die Überfahrregel rechnet beides zusammen, und auf dem Finger fällt nur die Überfahrvergrößerung weg. **`.vzoom`** (der Schieber) und **`.kv .k .zusatz`** (der Zusatz an einer Formatzeile). |
| `pruefung.js` | **`sharp`** als Werkzeug der Prüfung (kein neues Paket), **`WEBP_BASE64`**, **`GIF_BASE64`**, **`machPruefPNG()`** und **`groessteAbweichung()`**. Neue Gruppen: **„Die Bildablage: PNG kommt herein, WebP geht in die Tabelle"**, **„Die Bildablage: die Rechte"**, **„Die Bildablage in der Oberflaeche"**; erweitert sind **„Fokuspunkt der Vorschau"** und **„Fokuspunkt in der Oberflaeche"**. Nachgezogen: F_ROUTEN 69 → 70, `BESTAETIGUNG_ZWECKE` 7 → 8, Migrationsfunktionen und markierte Blöcke 7 → 8, Formatnummer 11 → 12 an fünf Stellen, Rückbauzahl 422 → 450. **Neu ist ausserdem die Gruppe „MIGRATION 0.19.0 — ENTFAELLT MIT 1.0“**, und sie hat gleich etwas gefunden (Stolperstein 273). Der Mock beantwortet `PUT /api/photos/:id/focus` und `PUT /api/settings` und liefert `bildFormate`, `umstellung` und `bilderUmwandeln`. |
| `gegenprobe.js` | **28 neue Rückbauten ab Nummer 431** — zwölf an der Ablage, sieben am Ausschnitt, neun an der Oberfläche. **Rückbau 233 ist mitgegangen** statt gelöscht zu werden (Stolperstein 201): er nimmt der Exportdatei ihre Formatnummer und zeigt jetzt auf die 12. |
| `README.md` | Der Abschnitt **„Speicherbedarf"** sagt, dass ein eingefügtes Bildschirmfoto als WebP abgelegt wird, wo der Schalter steht und was der Knopf tut — und dass die **Ableitungen JPEG bleiben**. Der **engere Ausschnitt** in der Bedienung, `photos.zoom` im Datenmodell, der Schalter bei `settings`. |
| `CHANGELOG.md` | Der Eintrag **mit Kasten** — Sicherung Pflicht, und der Knopf überschreibt Bytes. |
| `package.json` / `package-lock.json` | Version **0.19.0** (zweimal in der Lockdatei). |
| `Doku/Projektstand_…` | **Umbenannt auf `_0_19_0`**; Kopf (Revision 48), Betriebsstand, Abschnitt 4 (Bilder und Videos, samt Spaltentafel), die Schematabelle (0.16.0 nachgetragen, 0.19.0 neu, dreizehn Datenbankstufen / acht Blöcke), der Einspielweg, **Stolpersteine 270–272 und die Berichtigung an 269**, Prüfstand, Abschnitt 8, Versionsgeschichte, Fahrplan und **Abschnitt 10a neu geschrieben**. |
| `Doku/Fehler_und_Ideen.md` | Der Wegweiser führt **0.19.0 als GEBAUT**; **Punkt 5** ist neu — die Ableitungen auf WebP, mit dem Grund, der sich geändert hat. |
| `Doku/Auftrag_0.19.0.md` | *(bleibt bis zum nächsten Auftrag liegen)* |

---

## 12. Der Prüfstand

**5055 von 5055 bestanden** — **136 neue Prüfungen netto**
gegenüber 4919 in 0.18.1.

| Gruppe | vorher | nachher | wofür |
|---|---|---|---|
| **Die Bildablage: PNG kommt herein, WebP geht in die Tabelle** *(neu)* | — | **46** | ein PNG liegt als WebP da — **an den Bytes und am VP8L-Bitstrom geprüft, nicht an der Spalte**; das Bild ist dabei **unversehrt** (größte Abweichung ≤ 2 von 255, gleiche Maße); die Messung fände einen verlustbehafteten Kodierer **und** ein Bild anderer Maße wirklich; JPEG, GIF und vorhandenes WebP bleiben **byte-genau**; ein PNG, das größer würde, bleibt PNG; die Ableitungen bleiben JPEG; die Aufteilung nach Format samt **Summenprobe gegen `photoCount`/`photoBytes`**; der Schalter in beiden Stellungen; der Import wandelt nicht um; der Knopf: ohne Bestätigung 403, mit 202, zweimal 409, der Fortschritt in `/api/stats`, danach **kein umstellbares PNG mehr, die Ableitungen unberührt und das Bild weiterhin unversehrt** |
| **Die Bildablage: die Rechte** *(neu)* | — | **11** | Schalter und Knopf gehören dem **Eigentümer** — der gewöhnliche Benutzer und der Admin ohne Eigentümerrolle bekommen 403, **und die Stellung verschiebt sich dabei nicht**; lesen darf den Schalter jeder; die Eigentümerin braucht **zusätzlich** ihr Passwort |
| **Die Bildablage in der Oberflaeche** *(neu)* | — | **28** | es bleibt bei **achtzehn** Karten; der Abschnitt „Bildablage" steht in „Kennzahlen"; je Format eine Zeile mit Zahl und Größe, **ein Format ohne Bilder bekommt keine Zeile mit einer Null**; der Schalter geht über `PUT /api/settings` und **über keine eigene Route**; der Knopf **schreibt nicht sofort los**, sondern fragt das Passwort, und der Dialog nennt Zahl, Verlust und Sicherung; die drei Gegenlagen (kein PNG, ein Lauf unterwegs, ein Lauf durch); der Admin ohne Eigentümerrolle sieht die Zahlen und **weder Schalter noch Knopf** |
| **Fokuspunkt der Vorschau** | 12 | **22** | der Zoom: Vorgabe, Setzen, Runden auf ganze Prozent, **Beschneiden nach unten und oben**, Text als Absage, **ein fehlendes Feld behält den Wert**, Übersicht, Export, Import — und **ein unsinniger Wert in der Datei fällt auf die Vorgabe, statt das Einspielen abzubrechen** |
| **Fokuspunkt in der Oberflaeche** | 8 | **33** | `ausschnitt()` liefert beide Hälften, der Zoom wird zum **Faktor**, `fokus()` gibt es nicht mehr daneben, **die Kachel trägt `--zoom` wirklich**; der Schieber: Spanne wie im Server, Ziehen zeichnet **ohne zu schicken**, **der Rahmen zieht sich wirklich zusammen**, Loslassen schickt alle drei Werte in EINEM Ruf, und **ein Griff an den Schieber setzt keinen Fokuspunkt** |, **und das Stilblatt rechnet ihn wirklich ein** — an der Kachel, an der Vorschaukachel, beim Überfahren (multiplizierend) und auf dem Telefon *(nachgetragen, weil Rückbau 453 stumm blieb)*
| **MIGRATION 0.19.0 — ENTFAELLT MIT 1.0** *(neu)* | — | **16** | die Prüflage aus 0.18.1 trägt die Spalte nicht und **wirklich Fotos**; die Migration ergänzt sie und **nennt im Protokoll die Zahl**; die Fokuspunkte bleiben, `zoom` steht auf 100; **kein `UPDATE` im Block**, die Vorgabe steht am `ALTER TABLE`, in der DDL **und im Verhalten**; `zoom` ist die **letzte** Spalte der DDL; ein zweiter Lauf bleibt stumm; eine frische Instanz trägt sie ohne Migration — **und migriert wie frisch tragen dieselben Spalten in derselben Reihenfolge** |
| **zusammen** | | | **+136** |

**Nachgezogen und nicht neu:** die Zahl der schreibenden Routen (69 → 70), der
Zwecke der zweiten Bestätigung (7 → 8, **mit einer eigenen Zeile für den Namen
des achten**), der Migrationsfunktionen und markierten Blöcke (7 → 8, **mit
einer eigenen Zeile dafür, dass der achte zu 0.19.0 gehört**), die Formatnummer
(11 → 12 an fünf Stellen) und die Zahl der Rückbauten (422 → 450).

> **UND DIE GEGENPROBE HAT DIE PRÜFLAGE SELBST BERICHTIGT.** Der erste Lauf
> über die neuen Rückbauten meldete an **458** *ABGERISSEN* statt roter Punkte:
> der Rückbau lässt den Upload mit 500 scheitern, die Antwort trug dann `error`
> statt `photos`, und `.length` darauf riss den ganzen Prüflauf mit
> (Stolperstein 161). **Dieselbe Falle steckte an einem Dutzend weiterer
> Stellen** — 440 (der Fortschritt fehlt) und 441 (die Aufteilung fehlt) hätten
> sie ebenso ausgelöst, und 450 (der Schieber fehlt) auch. *Jede Stelle liest
> ihre Felder jetzt durch eine Klammer (`letztesFoto()`, `formate()`, `zieh()`),
> und eine zusätzliche Prüfung hält fest, dass der Schieber überhaupt da ist —
> ohne sie wäre „es wurde nichts geschickt" trivial wahr.*
> **Ein abgerissener Lauf ist kein stummer Rückbau: er belegt gar nichts.**

> **DIE FRAGE DES AUFTRAGS — „erkennt man an der Prüfung, dass das Bild wirklich
> unversehrt ist, oder nur, dass eine Funktion gerufen wurde?"** — ist der Grund
> für `groessteAbweichung()`. **Die Prüfung dekodiert die abgelegte Datei und
> hält Pixel gegen Pixel.** *Und sie hat ihre eigene Gegenprobe: dieselbe
> Vorlage durch `quality: 70` muss sie finden, und ein Bild anderer Maße
> ebenfalls (Stolperstein 106).*

---

## 13. Gegenproben

**28 neue Rückbauten, ab Nummer 431** — die Zahl steht bei **450**, die höchste
Nummer bei **458**. *Die ZAHL und die HÖCHSTE NUMMER sind nicht dasselbe
(Stolperstein 269).*

| Nummern | woran |
|---|---|
| **431–441, 458** | die Ablage: gar nicht umwandeln · `mime_type` nicht mitziehen · auch ein größeres Ergebnis nehmen *(als STUMM erwartet, siehe unten)* · dem gemeldeten Typ glauben · **der verlustbehaftete Kodierer statt `nearLossless`** · der Schalter wirkt nicht · der Schalter ist nicht mehr Eigentümersache · die Umstellung ohne zweite Bestätigung · zweimal drücken startet zweimal · der Fortschritt fehlt · die Aufteilung nach Format fehlt · **ein Bild, das WebP nicht fassen kann, reißt den Upload ab** (458) |
| **442–448** | der Ausschnitt: nicht speichern · nicht beschneiden · **ein fehlender Wert setzt zurück** · nicht in den Export · nicht aus dem Import · **die Migration rüstet die Spalte nicht nach** · die Formatnummer bleibt bei 11 |
| **449–457** | die Oberfläche: der Zoom kommt nicht an der Kachel an · der Schieber fehlt · er schickt bei jedem Zwischenschritt · **der Griff an ihn setzt den Fokuspunkt mit** · das Stilblatt rechnet den Zoom nicht ein · der Knopf fragt kein Passwort · **der Dialog sagt nicht mehr, was verloren geht** · der Knopf bleibt ohne PNG bedienbar · Schalter und Knopf stehen jedem Admin |

> **EIN RÜCKBAU IST ALS STUMM ERWARTET, und das ist ein Befund und keine
> Ausrede.** Nummer 433 nimmt den Größenvergleich weg (`if (webp.length <
> buf.length)` → `if (true)`). **Der Fall kommt am echten Bestand vor, ließ
> sich aber mit erzeugtem Material nicht herstellen:** neun Anläufe — 1×1 bis
> 256×256, Rauschen, Palette, Graustufen, mit und ohne Alpha — ergaben
> ausnahmslos ein **kleineres** WebP, und schon das kleinste mögliche PNG (68
> Bytes) ist größer als das kleinste mögliche WebP (36). **Er bleibt trotzdem
> in der Liste:** verschwindet die Zeile aus dem Quelltext, greift sein
> Suchtext ins Leere, und genau das meldet der Prüfstand. *Der Rückbau bewacht
> damit das Vorhandensein der Regel, auch wo er ihre Wirkung nicht zeigen
> kann.* **Der andere Rückfall — WebP kann höchstens 16383 px je Kante — ist
> dagegen nachgestellt** (Rückbau 458 und eine eigene Prüfung).

**Rückbau 233 ist MITGEGANGEN statt gelöscht zu werden (Stolperstein 201):** er
nahm der Exportdatei ihre Formatnummer und zeigte auf die 11; er zeigt jetzt auf
die 12 und bleibt derselbe Fund. *Ein Rückbau, dessen Suchtext ins Leere greift,
sähe aus wie einer, der nichts bewirkt — der Prüfstand fängt genau das ab
(„Jeder Suchtext kommt in seiner Datei genau einmal vor"), und er hat es in
dieser Runde auch getan.*

### Der gefahrene Lauf

**Alle 28 neuen Rückbauten sind gefahren**, in vier Spuren, je Rückbau ein
vollständiger Prüflauf von rund sechs Minuten. **Kein Lauf ist abgerissen,
keiner an der Zeitgrenze gestorben, kein Prozess hat das Aufräumen überlebt.**

| # | Rückbau | Namentlich rot |
|---|---|---|
| 431 | Ein ankommendes PNG wird gar nicht mehr umgewandelt | 9 Prüfungen, darunter „Und liegt danach als WebP in der Tabelle" (3 Gruppen) |
| 432 | Der `mime_type` wird nicht mitgezogen | „Und liegt danach als WebP in der Tabelle", „Das eingespielte PNG ist jetzt WebP" |
| 433 | Auch ein größeres Ergebnis wird genommen | **STUMM — angekündigt und begründet, siehe unten** |
| 434 | Die Erkennung glaubt dem gemeldeten Typ | 4 Prüfungen, darunter „Ein GIF behält seinen Typ" (2 Gruppen) |
| 435 | Der verlustbehaftete Kodierer statt `nearLossless` | 4 Prüfungen, darunter „Und zwar der verlustfreie Bitstrom VP8L" (3 Gruppen) |
| 436 | Der Schalter wirkt nicht mehr — es wird immer umgewandelt | 3 Prüfungen, darunter „Und die Stellung steht danach wirklich auf aus" (3 Gruppen) |
| 437 | Der Schalter der Bildablage ist nur noch Adminsache | 3 Prüfungen, darunter „Auch der Admin ohne Eigentuemerrolle nicht" (2 Gruppen) |
| 438 | Die Umstellung läuft ohne zweite Bestätigung | 5 Prüfungen, darunter „Und die Eigentuemerin braucht zusaetzlich ihr Passwort" (4 Gruppen) |
| 439 | Zweimal drücken startet zwei Läufe | „Ein zweiter Druck startet keinen zweiten Lauf", „Und am Ende ist jedes vorgesehene Bild erledigt" |
| 440 | Der Fortschritt steht nicht mehr in den Kennzahlen | 6 Prüfungen, darunter „Und nennt dabei, wie viele Bilder sie vorhat" (2 Gruppen) |
| 441 | Die Aufstellung nach Format fällt aus den Kennzahlen | 7 Prüfungen, darunter „Die Kennzahlen führen die Fotos nach Format auf" (2 Gruppen) |
| 442 | Der Zoomwert wird gar nicht erst gespeichert | 6 Prüfungen, darunter „Der Ausschnitt laesst sich enger ziehen" (2 Gruppen) |
| 443 | Der Zoomwert wird nicht mehr beschnitten | „Ein Wert unter 100 wird auf 100 eingefangen", „Und einer ueber 400 auf 400" |
| 444 | Ein Ruf ohne Zoomwert setzt ihn auf die Vorgabe zurück | „Ein Ruf ohne Ausschnitt laesst ihn stehen" |
| 445 | Der Ausschnitt geht nicht in die Exportdatei | „Und den engeren Ausschnitt mit" |
| 446 | Der eingespielte Ausschnitt wird verworfen | „Und der eingespielte Ausschnitt ebenso" |
| 447 | Der achte Migrationsblock rüstet die Spalte nicht nach | 8 Prüfungen, darunter „Ein zweiter Lauf ergaenzt nichts mehr und bleibt stumm" (3 Gruppen) |
| 448 | Die Formatnummer bleibt bei 11, obwohl der Ausschnitt mitgeht | 5 Prüfungen, darunter „Die Formatnummer steht auf 12" (6 Gruppen) |
| 449 | Der Zoom kommt nicht an der Kachel an | 6 Prüfungen, darunter „Fehlende Werte landen in der Mitte und auf dem weitesten Ausschnitt" (2 Gruppen) |
| 450 | Der Schieber für die Weite steht nicht mehr im Betrachter | 9 Prüfungen, darunter „Im Ausschnittmodus steht ein Schieber für die Weite" (2 Gruppen) |
| 451 | Der Schieber schickt bei jedem Zwischenschritt | „Und es schickt dabei noch nichts" |
| 452 | Der Griff an den Schieber setzt den Fokuspunkt mit | „Ein Griff an den Schieber setzt keinen Fokuspunkt" |
| 453 | Das Stilblatt rechnet den Zoom nicht mehr ein | **ZUERST STUMM — ein FUND und eine Lücke im Prüfstand; nach dem Schließen: „Das Stilblatt rechnet den Ausschnitt an der Kachel ein"** |
| 454 | Der Knopf der Umstellung fragt kein Passwort | 5 Prüfungen, darunter „Der Knopf schreibt nicht sofort los" (2 Gruppen) |
| 455 | Der Dialog sagt nicht mehr, was verloren geht | „Und dass die PNG-Fassung danach nicht mehr da ist" |
| 456 | Der Knopf bleibt bedienbar, obwohl kein PNG mehr dasteht | „Ohne PNG ist der Knopf nicht bedienbar", „Und der Knopf ist so lange tot" |
| 457 | Schalter und Knopf stehen jedem Admin | „Aber keinen Schalter", „Und keinen Knopf" |
| 458 | Ein Bild, das WebP nicht fassen kann, reißt den Upload ab | 4 Prüfungen, darunter „Ein PNG, das WebP nicht fassen kann, bleibt PNG" (2 Gruppen) |

> **DIE ZEILE „Jeder Suchtext kommt in seiner Datei genau einmal vor" STEHT IN
> DIESER TABELLE NICHT.** Sie wird bei **jedem** gefahrenen Rückbau rot, weil er
> seine Zeile gerade ersetzt hat — sie ist die Selbstprobe und kein Befund
> (Stolperstein 213). *Die Zahlen oben sind ohne sie gezählt; das Werkzeug
> zählt sie mit, und der Unterschied ist genau eins je Zeile.*

**Zusammen 100 rote Punkte** über die 26 Rückbauten, die auf Anhieb wirkten —
**und zwei stumme, von denen nur einer angekündigt war.** *Nach dem Schließen der
Lücke sind es 101 über 27, und stumm bleibt allein der angekündigte 433.*

> **453 KAM STUMM ZURÜCK, UND DAS WAR EIN FUND.** Der Rückbau nimmt
> `transform: scale(var(--zoom, 1))` aus dem Stilblatt; der eingestellte
> Ausschnitt ist danach an **keiner** Kachel mehr zu sehen — und **kein
> einziger Punkt wurde rot.** *Der Prüfstand belegte, dass `--zoom` an der
> Kachel **steht**, und nirgends, dass es jemand **liest**.* **Das ist
> Stolperstein 272 andersherum:** dort schlug der Inline-Stil die Regel, hier
> gab es die Regel gar nicht. **Vier Zusagen sind nachgetragen** — die Kachel,
> die Vorschaukachel, die Überfahrvergrößerung *(sie **multipliziert** mit dem
> eingestellten Wert, statt ihn zu ersetzen)* und das Telefon *(dort fällt die
> Vergrößerung weg und der Ausschnitt bleibt)*. **Geprüft wird am Text und
> nicht an der Lage** — jsdom rechnet keine Lage aus (Stolperstein 223).
> **Nachgefahren gegen den geschlossenen Stand: er wird rot** — „Das Stilblatt
> rechnet den Ausschnitt an der Kachel ein", **5053 von 5055 bestanden, 0 STUMM.**

> **GEFAHREN IST DER VOLLE LAUF NICHT.** 450 Rückbauten zu je einem vollen
> Prüflauf sind rund vierzig Stunden hintereinander. *Gefahren sind die 28
> neuen dieser Runde — sie stehen oben, einzeln.* **Der volle Lauf steht seit
> achtzehn Runden aus und steht weiter aus** (Abschnitt 17).

---

## 14. Neue Stolpersteine

**270. Dasselbe Verfahren beantwortet dieselbe Frage verschieden, je nachdem,
woran gemessen wird.** *Die `effort`-Leiter: 13,5 % bei Pixelrauschen, 2,0 % bei
fotoähnlichem Material.* **Wer an Beispielmaterial misst, misst das
Beispielmaterial.** Die Zahl gehört an den echten Bestand — und wo das nicht
geht, gehört genau dieser Satz daneben und nicht das Ergebnis allein.

**271. Ein Wert, den ZWEI Bedienungen über dieselbe Route setzen, darf beim
Fehlen nicht auf die Vorgabe zurückfallen.** *Ein `zoom`, das bei jedem Zug am
Fokuspunkt auf 100 zurückspränge, nähme dem Bedienenden den eingestellten
Ausschnitt weg — genau dann, wenn er ihn feinjustiert.* **Ein fehlendes Feld
behält seinen Wert, ein mitgeschickter Unsinn ist eine Absage.**

**272. Ein Inline-Stil schlägt jede Regel aus dem Stilblatt — auch die, die man
behalten wollte.** *Der Zoom als `style="transform:…"` hätte die
Überfahrvergrößerung ausgehebelt, und zwar nur an den Kacheln mit eingestelltem
Ausschnitt.* **Ein Fehler, der genau an den Stellen auftritt, an denen jemand
etwas eingestellt hat, fällt beim Ausprobieren am seltensten auf.**

**273. `ALTER TABLE ADD COLUMN` hängt eine Spalte IMMER HINTEN AN — wer sie in
der DDL an ihren logischen Platz stellt, bekommt zwei verschiedene
Datenbanken.** *`photos.zoom` stand zunächst neben `focus_x`/`focus_y`, wo es
inhaltlich hingehört; eine frische Instanz trug es dort, eine migrierte am
Ende.* **Gefunden hat es der Prüfstand beim allerersten Lauf der neuen
Migrationsgruppe** — mit der Zeile, die 0.16.0 dafür hinterlassen hat.
*Ohne sie wäre der Unterschied still geblieben, bis irgendwann ein `SELECT *`
zwei Reihenfolgen geliefert hätte.* **Eine nachgerüstete Spalte steht in der DDL
am ENDE ihrer Tabelle, und der Grund gehört danebengeschrieben.**

**274. Ein Wert, der an einem Element steht, ist nicht geprüft, solange nicht
auch geprüft ist, dass ihn jemand liest.** *Drei Prüfungen belegten den engeren
Ausschnitt — `ausschnitt()` rechnet ihn, die Kachel trägt ihn, der Schieber
schreibt ihn — und keine, dass das Stilblatt ihn einrechnet.* **Ohne
`transform: scale(var(--zoom, 1))` ist er an keiner Kachel mehr zu sehen, und
alle drei bleiben grün.** *Gefunden hat es die Gegenprobe und nicht der
Prüflauf: Rückbau 453 kam stumm zurück.* **Wo ein Wert die Grenze zwischen zwei
Dateien überquert, gehört an beide Enden eine Prüfung.**

---

## 15. Die Zahlen

| | vorher (0.18.1) | nachher (0.19.0) |
|---|---|---|
| Prüfungen | 4919 | **5055** |
| Rückbauten in der Liste | 422 | **450** |
| höchste Rückbaunummer | 430 | **458** |
| schreibende Routen (`F_ROUTEN`) | 69 | **70** |
| Zwecke der zweiten Bestätigung | 7 | **8** |
| markierte Migrationsblöcke | 7 | **8** |
| Austauschformat | 11 | **12** |
| Karten im Systembereich | 18 | **18** |
| persönliche Schlüssel | 8 | **8** |
| Stolpersteine | 269 | **274** |
| Fingerprint | `7b12ead4` | **`5fe43053`** |

**Gefahrene Gegenproben dieser Runde:** **28 von 28**, in vier Spuren, **100 rote Punkte** ohne die Selbstprobe · **kein abgerissener Lauf** · **zwei stumme**, davon einer angekündigt (433) und einer ein Befund (453 — Lücke geschlossen, nachgefahren, jetzt rot). *Die Tabelle steht in Abschnitt 13.*

---

## 16. Was ausdrücklich nicht gebaut ist

**a) DIE ABLEITUNGEN AUF WEBP** — Teil (b) des Fahrplans. *Er bleibt liegen, und
**der Grund hat sich geändert**: bisher hieß es „später, wenn Platz wirklich
knapp wird"; nach dieser Runde sind die Ableitungen mit **71,1 MB die größere
Hälfte**.* **Und `medium` ist JPEG q84 und damit verlustbehaftet** — was man in
der Anwendung anschaut, ist die Ableitung und nicht das Original. **Warum
trotzdem nicht jetzt:** es berührt die Auslieferung (`setzeBildHeader`) und
damit einen zweiten Weg, und ob `medium` ebenfalls `nearLossless` werden sollte,
ist **nicht gemessen**. *Steht als Punkt 5 im Sammelblatt.*

**b) DIE AUFTEILUNG NACH HERKUNFT** — „Original behalten bei Dateiauswahl,
umwandeln bei Strg+V". *Begründet in Abschnitt 4.*

**c) DIE UMWANDLUNG BEIM IMPORT.** *Begründet in Abschnitt 9, Punkt 4.*

**d) DAS ORIGINAL AM KOMMENTARBILD.** *Begründet in Abschnitt 8.*

**e) AVIF.** *Kleiner, aber langsamer zu rechnen und in älteren Browsern nicht
überall da. Für eine Instanz, die zehn Jahre laufen soll, ist WebP die sichere
Wahl — und `nearLossless` gibt es dort, wo es gebraucht wird.*

**f) EIN WIRTSSKRIPT `bilder.js`.** *Ersetzt durch den Knopf, begründet in
Abschnitt 5.*

**g) EIN RÜCKWEG „WebP wieder nach PNG".** *Er stellte nicht das PNG wieder her,
das dagewesen ist, sondern ein neues mit denselben Pixeln.*

**h) DIE VIER MESSSKRIPTE** (`bildstand.js`, `bildwahl.js`, `bildguete.js`,
`bildregel.js`) **kommen nicht ins Repo.** *Ihre Zahlen stehen in Abschnitt 2.
Was von ihnen bleiben soll, ist die Aufstellung nach Format — und die steht
jetzt in der Karte.*

---

## 17. Offen geblieben

* **Die `effort`-Leiter am echten Bestand** (Stolperstein 270). *Was fehlt:
  dieselbe Leiter über hundert gezogene Bilder der Instanz, Größe **und** Zeit.
  Ergibt sich dort ein Gewinn wie in Lauf 1, ist `effort: 5` eine eigene kleine
  Runde wert — mehr nicht.*
* **Die acht Handgriffe am Wirt** — sie stehen im Projektstand, Abschnitt 8, und
  im Chat der Runde mit ihren Befehlen.
* **Der Migrationsblock 0.19.0 ist am echten Bestand noch nicht gefahren.** *Am
  Prüfstand ist er belegt; am Wirt fehlt die Protokollzeile „photos um zoom
  ergaenzt (Migration auf 0.19.0)" und die Zahl, die sie nennt.*
* **Die Ableitungen auf WebP** — mit dem neuen Grund, als Punkt 5 im
  Sammelblatt.
* **Ob `medium` `nearLossless` werden sollte** — nicht gemessen, braucht einen
  eigenen Lauf.
* **Der volle Gegenprobenlauf** — seit achtzehn Runden ausstehend.
* **Weiterhin ausstehend, unverändert seit 0.16.0:** der Teilexport ein drittes
  Mal mit Mitschrift — **und ein Teil in eine Zweitinstanz eingespielt, nicht in
  die laufende** —, sowie beide Netze am echten Wirt.
