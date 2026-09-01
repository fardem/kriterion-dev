# Auftrag 0.19.0 — „Die Bildablage"

**Sammelblatt Nr. 15**, aufgefallen im Betrieb am **28. August 2026** aus der
Frage nach der Größe der Datenbank; **um Teil (d) und (e) erweitert am
30. August**; **gemessen am 1. September 2026** an der laufenden Instanz.

**Der Befund in einem Satz:** *679 der 1032 Bilder liegen als PNG im
Original — 435,7 MB von 568,9 MB des gesamten Bildbestands.* Es sind
Bildschirmfotos, die mit Strg+V hereinkommen; der Browser legt die
Zwischenablage als PNG ab, und der Server speichert sie unverändert.

**Das Ergebnis der Messung in einem Satz:** *als WebP im Verfahren
`nearLossless` werden aus 435,7 MB **161,9 MB**, ohne dass ein einziges von
hundert Bildern sichtbar schlechter wird.*

> **DIESE RUNDE IST GEMESSEN UND NICHT GESCHÄTZT.** Vier Messläufe an der
> **echten Instanz** mit **je hundert zufällig gezogenen Bildern** liegen
> zugrunde; sie stehen weiter unten mit ihren Zahlen. *Wo eine Zahl fehlt, steht
> das ausdrücklich da — auch das gehört zur Messung (Stolperstein 252).*

---

## 0. Was vor dem ersten Handgriff zu tun ist

> **0.18.1 IST EINGESPIELT UND IM FELD BESTÄTIGT.** Die laufende Instanz meldet
> **`7b12ead4`** — genau den gebauten Wert (Stolperstein 158). *Die Feldbelege
> stehen im Änderungsprotokoll 0.18.1, im Betriebsstand und in der
> Fingerprintliste; diese Runde muss sie **nicht** nachtragen.*
>
> **WAS AUS DEN RUNDEN DAVOR NOCH NICHT AM BILDSCHIRM GESEHEN IST**, führt der
> Projektstand in **Abschnitt 8**. *Fällt einer durch, ist das ein Befund für die
> nächste Runde und kein Grund, diese hier zu erweitern.*
>
> **Weiterhin ausstehend, unverändert seit 0.16.0:** der Teilexport ein drittes
> Mal mit Mitschrift — **und ein Teil in eine Zweitinstanz eingespielt, nicht in
> die laufende** —, sowie beide Netze am echten Wirt.

**LIES ZUERST, WAS DA IST.** Diese Runde fasst den Weg an, über den **jedes
Bild der Instanz** läuft, und sie legt eine **neue Spalte** an. Beides verzeiht
keine Annahme.

**UND LIES DEN FAHRPLAN GEGEN DIESES PAPIER.** Abschnitt 10a des Projektstands
sagt zu Teil (a): *„Was NICHT gebaut werden soll: die vorhandenen Originale
umwandeln."* **Dieser Auftrag hebt das auf** — begründet, mit Zahlen, im
nächsten Abschnitt. *Wer den Fahrplan liest und dieses Papier nicht, baut das
Falsche.*

---

## Die Nummer: MINOR — und diesmal eine Datenbankstufe

**0.19.0.** Abschnitt 5.1 des Projektstands: *„Zweite Zahl (MINOR) für alles,
was die Instanz danach kann und vorher nicht konnte."*

**Drei Dinge kann sie danach:** Bilder platzsparend ablegen, ohne sie zu
verschlechtern; **den vorhandenen Bestand auf Knopfdruck nachziehen**; und den
Bildausschnitt enger wählen.

> **DIES IST EINE DATENBANKSTUFE, und zwar wegen des Ausschnitts.** Der
> Zoomwert ist eine **gespeicherte Spalte**: es kommt der **achte**
> Migrationsblock dazu (heute sieben: `migration083` bis `migration0160`), und
> das **Austauschformat geht von 11 auf 12** — der Wert muss in den Export, sonst
> geht er beim Einspielen verloren.
>
> **DARAUS FOLGT: die Sicherung des Datenverzeichnisses ist PFLICHT und nicht
> Empfehlung**, und **im Changelog steht ein Kasten über den Änderungen.**

> **ZUR ABGRENZUNG:** die **Optikrunde** ist **0.20.0**, die **Bereinigung**
> **0.21.0**, der **Kommentarschnitt** **0.21.x**. *Nichts davon wird hier
> hereingezogen — auch nicht „weil man gerade dran ist".*

---

## Was gemessen wurde — und warum der Fahrplan an einer Stelle überholt ist

### Der Bestand, gezählt und nicht geschätzt

| | Anzahl | Original | `thumb` | `medium` | zusammen |
|---|---|---|---|---|---|
| **PNG** | **679** | **435,7 MB** | 9,6 MB | 36,1 MB | 481,4 MB |
| JPEG | 344 | 61,5 MB | 4,7 MB | 20,3 MB | 86,4 MB |
| WebP | 9 | 0,6 MB | 0,1 MB | 0,3 MB | 1,0 MB |
| **zusammen** | **1032** | **497,7 MB** | **14,4 MB** | **56,7 MB** | **568,9 MB** |

Dazu **35 Kommentarbilder** (1,3 MB groß + 0,3 MB klein, nie ein Original) und
**6 Videos** (46,7 MB), die beide unberührt bleiben.

**Das Gewicht liegt am Original, nicht an den Ableitungen** — 497,7 von
568,9 MB. *Genau die Frage stellt der Fahrplan („Liegt das Gewicht am Original,
ist die Umstellung der Ableitungen die kleinere Hälfte"), und die Antwort ist:
ja, das Gewicht liegt dort.*

### Wie die Bilder beschaffen sind

**92 von 100** zufällig gezogenen PNG sind **fotografisch** — bei ihnen liefert
ein verlustbehafteter Kodierer eine kleinere Datei als ein verlustfreier. *Der
Betreiber macht Bildschirmfotos **von Fotos**: eine Ansicht ist offen, und statt
die Datei zu laden wird der Bildschirm abgelichtet.* **Es sind also weder reine
Bedienoberflächen noch reine Aufnahmen, sondern beides gemischt — oft im selben
Bild.**

**100 von 100 haben einen Alphakanal.** *Er trägt nichts; Bildschirmfotos sind
durchgehend undurchsichtig.*

> **UND ER KOSTET AUCH NICHTS — NACHGEMESSEN:** libwebp wirft einen
> durchgehend undurchsichtigen Alphakanal von selbst weg. Die WebP-Datei ist mit
> und ohne ihn **byte-identisch** (72.950 = 72.950). **Da ist nichts zu holen,
> und wer es später „optimieren" will, optimiert nichts.**

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
Abweichung** wie `quality: 90`. Es sind immer dieselben — die mit harten Kanten.
**Der verlustbehaftete Kodierer franst dort grundsätzlich aus; eine höhere Güte
ändert daran nichts.** *Das ist keine Frage der Einstellung, sondern des
Verfahrens.*

### Was `nearLossless` ist — und was es nicht ist

**Es ist kein Gütewert, sondern ein drittes Verfahren.** WebP hat **zwei**
Bitströme: `VP8` (verlustbehaftet, aus dem Videocodec) und `VP8L` (verlustfrei,
ein anderer Algorithmus). *Die Leiter `quality: 90…100` fährt den ersten.*
**`nearLossless` fährt den zweiten** — nachgeprüft an der Chunk-Kennung der
erzeugten Dateien: **jede `nearLossless`-Ausgabe trägt `VP8L`.**

Es ist eine **Vorbehandlung**: vor dem verlustfreien Kodieren werden Pixelwerte
dort minimal angeglichen, wo man es nicht sieht; das senkt die Unordnung, und
der verlustfreie Packer kommt besser damit zurecht. **Der `quality`-Wert steuert
dabei nicht die Bildgüte, sondern wie stark geglättet wird** — 100 heißt gar
nicht, 1 heißt maximal.

**Heraus kommt eine gewöhnliche WebP-Datei.** Kein Sonderformat, keine Frage der
Lesbarkeit im Browser, keine neue Abhängigkeit — `sharp` kann es seit je.

### Warum 60 und nicht 80 oder 40

**Der Gewinn viertelt sich mit jedem Schritt** (34,2 → 20,5 → 6,9 → 1,4 MB),
**die Abweichung verdoppelt sich** (1 → 2 → 4 → 8). Die beiden Kurven kreuzen
sich bei 60.

* **80** kostet **20,5 MB mehr** für max 1 statt max 2. *Beides ist unsichtbar —
  0,4 % gegen 0,8 % des Wertebereichs. Man bezahlt für einen Unterschied, den
  kein Bildschirm darstellt.*
* **40** bringt **6,9 MB** und verdoppelt die Abweichung auf 4. *Vertretbar, aber
  6,9 MB sind 4 % des Bestands.*
* **20** bringt **1,4 MB**. *Das ist der Punkt, an dem man Qualität für nichts
  hergibt.*

> **UND `nearLossless` 60 SCHLÄGT DAS REINE VERLUSTFREIE:** 161,9 MB gegen
> 216,6 MB — **55 MB kleiner**, bei einer größten Abweichung von **2 von 255** im
> ganzen Bestand. **Wer „so exakt wie möglich" will, nimmt trotzdem nicht
> `lossless`.**

### Der Punkt, an dem dieses Papier den Fahrplan aufhebt

**Der Fahrplan sagt zu (a):** *„Verlustbehaftet und unumkehrbar — und bei einem
Bildschirmfoto ist PNG die bessere Wahl: scharfe Kanten und Text leiden unter
JPEG sichtbar."*

**Der Satz ist richtig — über JPEG.** Er ist auch richtig über verlustbehaftetes
WebP; die Spalte „Bilder>30" belegt es. **Er ist falsch über `nearLossless`,
und `nearLossless` gab es in der Überlegung vom 28. August nicht.**

> **DIE GEGENREDE GEHÖRT MIT AUFGESCHRIEBEN, WEIL SIE STIMMT.** Der Fahrplan
> führt unter „Draußen üblich": *„Das Original wird nicht angefasst. Immich,
> Nextcloud Photos und Piwigo rechnen ausnahmslos Ableitungen daneben."*
> **Diese Runde weicht davon ab, und zwar bewusst.**
>
> **Die Begründung, und sie muss diese Abweichung tragen:** Der Bestand besteht
> zu 92 % aus **Bildschirmfotos**, nicht aus Aufnahmen einer Kamera. Ein
> Bildschirmfoto hat kein Negativ und keine EXIF-Herkunft; es ist selbst schon
> eine Ableitung. **Und die Änderung beträgt im schlimmsten gemessenen Einzelfall
> 2 von 255** — gegen **274 MB**.
>
> **Wer diese Abwägung anders trifft, nimmt `lossless` statt `nearLossless` 60
> und zahlt 55 MB.** *Beides ist vertretbar; die Entscheidung ist gefallen und
> steht hier, damit sie nicht in einem halben Jahr als Versehen gelesen wird.*

### Was NICHT gemessen ist

> **`effort: 4` IST FÜR `nearLossless` NICHT SEPARAT GEMESSEN.** Der Wert stammt
> aus der Messung am rein verlustfreien Weg (dort waren `effort` 2 bis 6 an vier
> von sechs Bildern **byte-identisch**, und `effort` 5 war in **allen sechs**
> Läufen langsamer als 6). **Weil `nearLossless` denselben `VP8L`-Kodierer
> benutzt, ist die Übertragung plausibel — belegt ist sie nicht.**
>
> **Das ist in zehn Minuten nachzuholen** und gehört in diese Runde: dieselbe
> Stichprobe, `nearLossless` 60 über `effort` 1 bis 6, Größe **und** Zeit.
> *Kommt etwas anderes heraus als „ab 2 flach", gilt das Gemessene und nicht
> dieser Satz.*

---

## 1. Jedes PNG wird beim Hereinkommen ein WebP

### GEBAUT WIRD

**In `makeVariants()`s Umfeld — genauer: dort, wo heute `f.buffer` unverändert
in `photos.data` geschrieben wird** (`server.js` ~3014) — **ein Schritt davor:**

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
* **`mime_type` MUSS mitgezogen werden.** *Sonst liegt WebP unter dem Namen
  `image/png` in der Tabelle, die Auslieferung setzt den falschen Kopf, und der
  nächste Export trägt die Lüge weiter.*
* **Der Rückfall ist nicht Zierde.** WebP kann höchstens **16383 px je Kante**
  (nachgemessen: bei 16384 wirft `sharp` „Processed image is too large for the
  WebP format"). *Und ein PNG, das nach der Umwandlung größer wäre, bleibt
  PNG — gemessen kommt das vor.*

**JPEG, GIF und vorhandenes WebP werden NICHT angefasst.**

* **JPEG:** eine Neukodierung wäre verlustbehaftet, und `makeVariants()` ruft
  `.rotate()` — die Ausrichtung hängt an den EXIF-Daten.
* **GIF:** `sharp` liest ohne `animated: true` **nur die erste Seite**. Eine
  Umwandlung verlöre die Bewegung, und zwar still.
* **BMP** wird schon heute abgewiesen: `RASTER_FORMATE` (`server.js` ~190) führt
  `jpeg, png, webp, avif, gif, tiff` — **kein bmp**. *Nachgeprüft an der
  laufenden Instanz: der Upload wird zurückgewiesen.*

### Die Entscheidungen, und sie sind hier getroffen

**a) EIN SCHALTER — ABER NICHT NACH HERKUNFT.** *Der Fahrplan sah unter (e) einen
Schalter im Reiter „Datenbank" vor, und er kommt* (Punkt 1a1). **Was ausdrücklich
NICHT kommt, ist die Aufteilung „Original behalten bei Dateiauswahl, umwandeln
bei Strg+V".**

> **ERSTENS KANN DER SERVER DAS GAR NICHT SEHEN.** In `public/app.js` führen
> **drei** Einstiege auf **dieselbe** Funktion und damit auf dieselbe Route:
> `#file.onchange` (~4236), `onPaste` (~4245) und das Ablegen per Maus (~4253).
> **In `req.files` steht eine Datei und sonst nichts.** *Baubar wäre es — ein
> Feld im Formular —, aber dann entschiede eine **Behauptung des Browsers**, wie
> das Archiv speichert.*
>
> **ZWEITENS TUT DAS FORMAT ES SCHON.** Ein Browser legt die Zwischenablage
> **immer als PNG** ab; eine Aufnahme aus Kamera oder Telefon ist **JPEG**. Der
> Bestand belegt es: **679 PNG gegen 344 JPEG.** *Die Regel „PNG umwandeln, JPEG
> in Ruhe lassen" trifft damit genau die Unterscheidung, die gemeint ist — ohne
> dem Browser etwas zu glauben.*
>
> **DRITTENS WÄREN ES ZWEI FORMATE FÜR DENSELBEN INHALT**, entschieden dadurch,
> wie er hereinkam. *Dasselbe Bildschirmfoto läge als WebP vor, wenn es eingefügt
> wurde, und als PNG, wenn es vorher gespeichert und dann ausgewählt wurde —
> und hinterher sieht man das keinem Bild mehr an.* **Ein Schalter sagt eine
> Sache: dieses Archiv wandelt um, oder es tut es nicht.**

**a1) DER SCHALTER.** **„PNG-Originale beim Hereinkommen umwandeln"** — an/aus,
**Vorgabe an**, **nur für den Eigentümer** (`nurEigentuemer`, `server.js:662`),
im Reiter **„Datenbank"**. *Dort steht schon alles andere, was über Platz redet.*

* **Über `PUT /api/settings`** (~1678), wie die anderen Einstellungen — **keine
  eigene Route.**
* **Aus heißt aus:** ankommende PNG bleiben PNG, byte-genau. *Das ist die Zeile,
  die dem Verhalten von Immich, Nextcloud und Piwigo entspricht — wer die
  Abweichung nicht mitgehen will, hat sie hier.*
* **Der Schalter ist nie endgültig** — in beide Richtungen holt der Knopf aus
  Punkt 2 nach, was in der anderen Stellung entstanden ist. *Genau deshalb ist
  er billig.*

**b) STRG+V UND DATEIAUSWAHL SIND DERSELBE WEG.** Beide gehen durch
`POST /api/items/:id/photos`; der Browser schickt in beiden Fällen ein PNG, und
der Server kann sie nicht unterscheiden. **Eine Regel an einer Stelle deckt
beide ab.** *Dasselbe gilt für die drei Einfügestellen, die der Fahrplan
aufzählt.*

**c) DER IMPORT BLEIBT UNANGETASTET.** *Keine Umwandlung, keine Meldung.*

> **BEGRÜNDUNG, WEIL ES EINE ASYMMETRIE IST:** Der Import ist **ein einziger
> HTTP-Aufruf** über den ganzen Bestand. Er dekodiert heute schon jedes Bild und
> rechnet zwei Ableitungen (`server.js` ~4373) — das sind bei 1032 Bildern
> bereits Minuten. **Eine Umwandlung obendrauf verlängerte ausgerechnet das
> Wiederherstellen**, also den Vorgang, bei dem man am wenigsten warten will.
>
> *Node selbst schnitte den Aufruf nicht ab — `requestTimeout` (300 s) gilt für
> das **Empfangen** des Rumpfes, die Verarbeitung ist unbegrenzt (`timeout = 0`,
> nachgesehen). Ein Reverse-Proxy davor täte es sehr wohl.*
>
> **Die Folge, und sie gehört benannt:** Wer eine **alte** Sicherung einspielt,
> holt PNG zurück. **Das Wirtsskript aus Punkt 2 ist die Antwort darauf** — es
> läuft danach noch einmal. *Der Betreiber hat diesen Weg ausdrücklich gewählt:
> nichts davon soll in die Oberfläche.*

**d) WAS EXPORT UND IMPORT SONST TUN, BLEIBT.** *Nachgesehen und
unproblematisch:* Der Export schreibt nur das Original (`server.js` ~3920), der
Import schreibt es **byte-genau** zurück (~4643) und rechnet `thumb`/`medium`
**neu aus dem unberührten Original**. **Es summiert sich also nichts** — der
zehnte Import liefert dieselben Ableitungen wie der erste.

> **EINE AUSNAHME, DIE BEIM NACHSEHEN AUFFIEL UND HIER NUR NOTIERT WIRD:** Beim
> **Kommentarbild** gibt es kein Original; der Import kodiert das gespeicherte
> JPEG erneut als JPEG (`server.js` ~4414). **Dort summiert es sich.**
> *Gemessen: MAE 0,06 nach einer Runde, 0,10 nach sechs — es läuft aus, statt
> davonzulaufen, und die erste Kodierung kostet ohnehin schon 1,89.* **Kein
> Handlungsbedarf, aber es gehört aufgeschrieben (Punkt 4).**

---

## 2. Der Knopf: den vorhandenen Bestand umstellen

> **DIES WAR ALS WIRTSSKRIPT `bilder.js` GEPLANT, IN DER BAUFORM VON
> `zugang.js` UND `schluessel.js`. Es wird stattdessen ein Knopf** — und das
> ist die bessere Wahl, nicht die bequemere:
> * **Es ist keine einmalige Umstellung, sondern eine Funktion, die bleibt.**
>   Der Schalter aus Punkt 1a1 kann ein Jahr aus stehen; eine alte Sicherung
>   bringt PNG zurück; der Bestand wächst wieder. *Ein Werkzeug, das man über
>   `docker compose exec` aufrufen muss, wird in keinem dieser Fälle benutzt.*
> * **Der Server ist ohnehin der bessere Schreiber.** Ein Wirtsskript müsste die
>   Instanz anhalten (fremder Schreiber auf einer WAL-Datei); der Server schreibt
>   in seiner eigenen Verbindung, Zeile für Zeile, im laufenden Betrieb.
> * **Und es gäbe sonst zwei Werkzeuge für eine Sache.**

### GEBAUT WIRD

**Im Reiter „Datenbank", bei der Einstellung aus Punkt 1a1, nur für den
Eigentümer:** die Aufstellung des Bildbestands nach Format und darunter der
Knopf **„Alle PNG nach WebP umstellen"**.

```
Fotos am Eintrag
  PNG    679   435,7 MB      [ Alle PNG nach WebP umstellen ]
  JPEG   344    61,5 MB      (bleiben unangetastet)
  WebP     9     0,6 MB
```

**Der Ablauf:**

* **`POST /api/bilder/umstellen`** startet und **kehrt sofort zurück** (202).
  *Acht Minuten Rechenzeit an einer offenen HTTP-Verbindung sind das, was beim
  Import ausdrücklich vermieden wird (Punkt 1c) — hier gilt derselbe Satz.*
* **Gearbeitet wird wie in `backfillVariants()`** (`server.js` ~5199): Zeile für
  Zeile, **je Bild eine eigene Transaktion**, und **30 ms Pause dazwischen**,
  damit der Server ansprechbar bleibt. *Das Vorbild steht schon da und hat
  dieselbe Aufgabe.*
* **Der Fortschritt geht als Feld in `/api/stats`** — `{ läuft, erledigt,
  gesamt }` oder `null`. **Keine zweite Route dafür.** Die Karte fragt nach,
  solange es läuft.
* **Zweimal drücken startet nicht zweimal.** *Ein Lauf zur Zeit; der zweite
  Aufruf bekommt eine Absage und keine zweite Schleife.*
* **Dieselbe Regel wie in Punkt 1**, Zeichen für Zeichen: nur PNG, nur wenn
  kleiner, `mime_type` mitziehen, sonst unverändert.
* **`thumb` und `medium` werden NICHT neu gerechnet.** *Sie sind aus demselben
  Bild entstanden und bleiben gültig.*
* **`reclaim()` danach.** *Sonst wächst die Datei erst und schrumpft nie —
  dieselbe Überlegung wie beim Papierkorb.*

### Die zweite Bestätigung — und damit acht Zwecke

**Der Lauf schreibt jeden PNG-Blob der Instanz um, und die alten Bytes sind
danach weg.** *Das ist genau die Art Vorgang, für die es die zweite Bestätigung
gibt.* **`BESTAETIGUNG_ZWECKE` geht von sieben auf acht.**

> **UND DER DIALOG SAGT ES VORHER, ohne zu beschönigen:** wie viele Bilder,
> wie viel Platz, **dass die PNG-Fassung danach nicht mehr da ist**, und dass
> eine Sicherung des Datenverzeichnisses davor die einzige Rückfahrkarte ist.
> *„Unwiderruflich" ist hier richtig und nicht wie beim Löschen falsch.*

### Was das für die Messwerkzeuge heißt

**Die vier Messskripte dieser Runde** (`bildstand.js`, `bildwahl.js`,
`bildguete.js`, `bildregel.js`) **kommen NICHT ins Repo.** *Sie haben ihre
Arbeit getan; ihre Zahlen stehen oben in diesem Papier und gehören ins
Änderungsprotokoll.* **Was von ihnen bleiben soll, ist die Aufstellung nach
Format — und die steht künftig in der Karte.**

---

## 3. Der engere Ausschnitt

### GEBAUT WIRD

**Eine dritte gespeicherte Angabe neben `focus_x` und `focus_y`** — der
Zoomwert. **Es wird weiterhin nichts geschnitten:** `fokus()` liefert heute zwei
Prozentwerte als `object-position`, die Datei bleibt ganz. **Der Zoom ist ein
`object-position` + eine Skalierung — reine Anzeige, ohne jede Neuberechnung.**

* **Neue Spalte in `photos`**, mit Vorgabe, die den heutigen Zustand bedeutet.
  *Wie `focus_x REAL NOT NULL DEFAULT 50` — der Wert für „nicht gezoomt" ist die
  Vorgabe, damit jede vorhandene Zeile ohne Umschreiben richtig steht.*
* **Der achte Migrationsblock.** *Markiert wie die sieben davor, damit die
  Bereinigung in 0.21.0 ihn findet.*
* **Austauschformat 12.** *Der Wert geht in den Export und wird beim Import
  gelesen; **fehlt er** (Datei der Formatnummer 11 oder älter), **gilt die
  Vorgabe** — dieselbe Regel wie beim Fokuspunkt, der genauso eingeführt wurde.*
* **Die Bedienung sitzt dort, wo heute der Fokuspunkt gesetzt wird.** *Kein
  zweiter Ort, keine zweite Bedienfläche.*

> **DIE GRENZEN GEHÖREN FESTGELEGT UND BEGRÜNDET:** wie weit darf gezoomt
> werden, und was passiert am Rand? *Ein Zoom, der über die Bildkante
> hinausläuft, zeigt Leere — das ist beim Fokuspunkt heute schon die Frage, und
> die Antwort muss zu beiden passen.* **Der Server beschneidet den Wert wie
> `focus_x`/`focus_y`, und zwar an einer Stelle.**

---

## 4. Die Asymmetrie der beiden Bildwege gehört aufgeschrieben

**Teil (c) des Fahrplans, und der Teil, der heute wirklich fehlt.**

| Weg | Was in der Datenbank landet |
|---|---|
| Foto am **Eintrag** (`photos`) | **das Original** (nach dieser Runde: PNG als WebP), dazu 1600px- und 400px-JPEG |
| Bild im **Kommentar** (`comment_images`) | **nur** 1600px- und 400px-JPEG — **kein Original** |

**Ein Absatz am Quelltext beider Wege und eine Zeile im Projektstand.** *Wer in
einem halben Jahr fragt „warum ist das eine Bild schärfer als das andere",
findet die Antwort heute nur im Quelltext.*

**Dazu gehört die Antwort auf die offene Frage des Fahrplans:** *Soll das
Kommentarbild künftig auch sein Original behalten?* — **Nein.** Es wäre
einheitlich, und es vergrößerte die Datenbank an der Stelle, an der die meisten
Bilder anfallen. *Im Kommentar gibt es kein Vollbild in dem Sinn, in dem der
Eintrag eines hat.* **Die Begründung wird aufgeschrieben, nicht die
Verschiebung.**

**Und der Generationsverlust aus Punkt 1(d) gehört in denselben Absatz** — mit
den gemessenen Zahlen, damit niemand ihn später neu entdeckt und für schlimmer
hält, als er ist.

---

## 5. Die Bestandskarte macht zwei Durchläufe, wo einer reicht

**Beim Messen aufgefallen, mit der Bildablage nicht verwandt — und deshalb hier
und nicht in einer eigenen Runde.**

`/api/stats` fragt `photos` **zweimal** hintereinander ab: einmal
`WHERE art != 'video'`, einmal `WHERE art = 'video'` (`server.js` ~3696/3697).
**Jeder Durchlauf ist ein voller Tabellendurchgang.**

**Gemessen an einer eigens gebauten Datenbank in der Größe der echten**
(679 PNG, 344 JPEG, 9 WebP, 606 MB):

| | kalt | warm |
|---|---|---|
| **zwei getrennte Durchläufe (heute)** | 6.566 ms | **4.230 ms** |
| **ein `GROUP BY art`** | 3.235 ms | **2.990 ms** |

*`COUNT(*)` allein kostet 0 ms — teuer ist der Durchgang, nicht das Zählen.*

**Zusammengelegt zu einer Abfrage** — und zwar zu **derselben**, die Punkt 2 für
die Aufstellung nach Format braucht:

```sql
SELECT art, <Format aus den ersten Bytes>, COUNT(*), SUM(length(data))
  FROM photos GROUP BY 1, 2
```

> **DAS IST DER ANGENEHME TEIL DIESER RUNDE: die Anzeige kostet nichts.** Die
> gemessenen **2.990 ms** sind der Wert **mit** der Formataufteilung — sie ist in
> derselben Zeile schon drin. **Die Karte bekommt eine Auskunft dazu und wird
> dabei um 1,2 Sekunden schneller.**
>
> *Die Formaterkennung läuft über `hex(substr(data,1,8))` und Ähnliches — SQLite
> holt die ersten Bytes, ohne das Blob zu lesen. Der Durchgang durch die Tabelle
> ist der Preis, nicht das Schnüffeln, und den zahlt die Karte heute zweimal.*

**Die vorhandenen Felder ändern sich nicht** — `photoCount`, `photoBytes`,
`videoCount`, `videoBytes` behalten Namen und Bedeutung; die Aufteilung kommt
**daneben**. *Dieselbe Regel wie bei den Videos und dem Papierkorb: die alten
Zahlen behalten ihre Aussage und bekommen einen Nachbarn.*

---

## 6. Was ausdrücklich NICHT gebaut wird

**a) DIE ABLEITUNGEN AUF WEBP** — Teil (b) des Fahrplans.

> **Er bleibt liegen, und der Grund hat sich durch diese Runde geändert.**
> *Bisher hieß es „später, wenn Platz wirklich knapp wird".* **Nach dieser Runde
> sind die Ableitungen mit 71,1 MB die größere Hälfte** — die Originale schrumpfen
> auf 161,9 MB, aber `thumb` und `medium` bleiben, wie sie sind.
>
> **Und es ist ein Befund dazugekommen, der aufgeschrieben gehört:** `medium`
> ist **JPEG q84** und damit **verlustbehaftet** — es franst an Text genauso aus
> wie die verlustbehafteten WebP-Stufen oben. **Was man in der Anwendung
> anschaut, ist die Ableitung und nicht das Original.** *Diese Runde macht das
> Archiv unversehrt und lässt die Anzeige, wie sie ist. Das ist vertretbar, aber
> es ist eine halbe Antwort, und die nächste Runde muss sie kennen.*
>
> **Warum trotzdem nicht jetzt:** es berührt die **Auslieferung**
> (`setzeBildHeader`) und damit einen zweiten Weg. *Und die Frage, ob `medium`
> ebenfalls `nearLossless` werden sollte, ist **nicht gemessen** — sie braucht
> einen eigenen Lauf, nicht eine Vermutung im Vorbeigehen.*

**b) DIE AUFTEILUNG NACH HERKUNFT** — „Original behalten bei Dateiauswahl,
umwandeln bei Strg+V". *Begründet in Punkt 1(a): der Server sieht den
Unterschied nicht, das Format bildet ihn ohnehin ab, und es wären zwei Formate
für denselben Inhalt.*

**c) DIE UMWANDLUNG BEIM IMPORT.** *Begründet in Punkt 1(c).*

**d) DAS ORIGINAL AM KOMMENTARBILD.** *Begründet in Punkt 4.*

**e) AVIF.** *Der Fahrplan stellt die Frage und beantwortet sie schon: kleiner,
aber langsamer zu rechnen und in älteren Browsern nicht überall da.* **Für eine
Instanz, die zehn Jahre laufen soll, ist WebP die sichere Wahl** — und
`nearLossless` gibt es dort, wo es gebraucht wird.

**f) EIN WIRTSSKRIPT `bilder.js`.** *Es war geplant und ist durch den Knopf
ersetzt — begründet in Punkt 2.* **Zwei Werkzeuge für eine Sache wären eines zu
viel.**

**g) EIN RÜCKWEG „WebP wieder nach PNG".** *Er ginge — WebP ist verlustfrei
kodiert und dekodiert zu genau den Pixeln, die drin stehen. Aber er stellte
nicht das PNG wieder her, das dagewesen ist, sondern ein neues mit denselben
Pixeln.* **Ein Knopf, der „zurück" verspricht und etwas anderes liefert, ist
schlechter als keiner.** Die Rückfahrkarte ist die Sicherung, und der Dialog
sagt das.

---

## Bauregeln

* **Deutsch** in Kommentaren, Oberfläche, Meldungen und im Gespräch. `Tag`,
  `Token`, `Index`, `String`, `Cookie` bleiben; **„Desktop"** und nicht
  „Schreibtisch"; die Abschnittsnamen im Changelog bleiben englisch.
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE.** *`sharp` kann `nearLossless` seit je —
  nachgeprüft an 0.35.3 / libvips 8.18.3.*
* **Keine Zugangsdaten im Gespräch.** Kein Passwort, kein Schlüssel, kein Token,
  kein TOTP-Geheimnis, kein Wiederherstellungscode.
* **KEINE BINÄRDATEIEN INS REPO.** *Es sind 69 Dateien und keine einzige binär.
  Die Prüfbilder stehen als Base64-Konstanten in `pruefung.js` (`PNG_BASE64`
  ~18853, `MP4_BASE64`, `WEBM_BASE64`) — dort gehört ein WebP-Prüfbild ebenfalls
  hin.* **Verlustfreiheit ist an einem erzeugten Bild zu belegen; dafür braucht
  es keine echte Aufnahme.**
* **DIES IST EINE DATENBANKSTUFE.** **Achter Migrationsblock, Austauschformat
  12.** *Kommt deine Durchsicht zu einem anderen Ergebnis, ist das ein Grund
  anzuhalten und zu fragen, nicht stillschweigend abzuweichen.*
* **Die Sicherung des Datenverzeichnisses ist PFLICHT.** **Im Changelog steht ein
  Kasten über den Änderungen.**
* **`F_ROUTEN` GEHT VON 69 AUF 70** — `POST /api/bilder/umstellen`. *Die
  Einstellung selbst braucht keine: sie geht über `PUT /api/settings`, und der
  Fortschritt ist ein Feld in `/api/stats`. Eine neue Spalte ist erst recht
  keine Route.*
* **`BESTAETIGUNG_ZWECKE` GEHT VON SIEBEN AUF ACHT** — die Umstellung des
  Bestands. *Achtzehn Karten in fünf Abschnitten und acht persönliche Schlüssel
  bleiben.* **Nachzählen, nicht annehmen.**
* **Kommentare sind zeitlos.** Eine fachliche Warnung ja, eine
  Entstehungsgeschichte nein — **außer dort, wo eine zurückgenommene Entscheidung
  sonst wiederkäme** (Stolperstein 201). *Der Satz „das Original wird nicht
  angefasst" ist so eine: er stand im Fahrplan, er ist aufgehoben, und der Grund
  gehört an den Quelltext.*
* **Neue Stolpersteine zählen bei 270 weiter.** 269 ist vergeben.
* **Neue Rückbauten zählen bei 431 weiter.** *In `gegenprobe.js` stehen **422**
  Einträge, aber die Nummern reichen bis **430** — die Anzahl ist nicht die
  höchste Nummer (Stolperstein 269).*
* **TAGS WERDEN NICHT MEHR GESETZT** — kein Tag, kein Tag-Push.
* **Die Frage an jede Gruppe bleibt:** *was sieht jemand, der das Projekt nicht
  gebaut hat?* — **und für diese Runde besonders: erkennt man an der Prüfung,
  dass das Bild wirklich unversehrt ist, oder nur, dass eine Funktion gerufen
  wurde?**

### Was aus den letzten Runden mitzunehmen ist

1. **Eine Behauptung aus einem Papier gehört nachgelesen, bevor sie gebaut wird**
   (Stolperstein 248) — *auch aus diesem hier, und aus dem Fahrplan besonders:
   dieses Papier hebt dessen Teil (a) auf.*
2. **Eine Zahl, die nicht selbst gemessen wurde, ist keine Messung**
   (Stolperstein 252). *Der Abschnitt „Was NICHT gemessen ist" steht oben, weil
   genau das sonst wieder passiert.*
3. **Ein Befund, den man nicht nachstellen kann, ist unerklärt und nicht
   erledigt** (Stolperstein 257).
4. **Gemessen wird am echten Bestand, nicht an Beispielmaterial.** *Diese Runde
   ist dreimal in dieselbe Falle gelaufen: eine Empfehlung „verlustfrei, ohne
   Einstellung" stand auf Prüfbildern, die Bedienoberflächen zeigten — der echte
   Bestand ist zu 92 % fotografisch, und die Empfehlung war falsch.* **Das gehört
   als Stolperstein aufgeschrieben.**

### Zu den Agenten — rationell und nicht ängstlich

1. **Nie gegen einen wandernden Arbeitsbaum.** Ein Nachlauf gehört gegen einen
   festgeschriebenen Commit.
2. **Nie neben einem laufenden Prüflauf oder einer Gegenprobe.** Spur 0 der
   Gegenprobe fährt **ohne Portversatz**.
3. **Einer mit einer scharfen Frage schlägt sechzehn mit einer weichen.**

**Und aufgeräumt wird nach Prozessnummer, nie nach Namen.**

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen.**
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: **`git status` muss leer
  sein**, und **`npm test` läuft ein letztes Mal gegen genau diesen Stand.**
  **Und danach kein Prüflauf mehr, den du abbrichst.**
* **`Doku/Aenderungsprotokoll_0.19.0.md`** liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, die Entscheidungen mit ihrer Begründung,
  neue Stolpersteine (**ab 270**), die Gegenprobentabelle **aus `gegenprobe.js`**,
  Prüfungszahlen vorher/nachher (**vorher: 4919**), Rückbauten vorher/nachher
  (**vorher: 422, höchste Nummer 430**), Offengebliebenes.
* Die Zeile „0.19.0 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
  *Diese Runde fasst `public/app.js` und `public/style.css` an — der Fingerprint
  ändert sich also ohnehin.*
* **DIESE RUNDE IST EINE DATENBANKSTUFE — sag es ausdrücklich**, und sag dazu,
  **was vor dem Einspielen zu sichern ist**.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im Chat,
  nicht in den Dokumenten.** Darunter:
  **ein Bildschirmfoto mit Strg+V einfügen** *(in der Datenbank liegt WebP, und
  der Text darauf ist im Vollbild scharf)*, **ein JPEG hochladen** *(es liegt
  unverändert da)*, **ein GIF hochladen** *(unverändert, und die Bewegung ist
  noch da)*, **den Schalter ausschalten und wieder einfügen** *(jetzt liegt PNG
  da)*, **den Knopf drücken** *(die Karte zählt herunter, danach steht dort kein
  PNG mehr, und die Bilder sehen aus wie vorher)*, **den Knopf als normaler
  Admin suchen** *(er ist nicht da)*, **einen Ausschnitt enger ziehen, neu
  laden** *(er bleibt)*, und **exportieren und in eine ZWEITINSTANZ einspielen**
  *(der Ausschnitt kommt mit)*.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_19_0`), und **alle
  Verweise sind nachzuziehen.** Kopf, Betriebsstand, Stolpersteine, Prüfstand,
  Versionsgeschichte, **Abschnitt 10 und 10a** — **und der Abschnitt über
  Schema und Migrationen: es sind danach acht Blöcke und Austauschformat 12.**
* **Abschnitt 10a wird für 0.19.0 neu geschrieben, nicht ergänzt.** *Die
  Einschätzung „Claude: nicht empfohlen für (a)" ist durch die Messung
  überholt; sie stehenzulassen hieße, zwei Wahrheiten über dieselbe Sache zu
  führen (Stolperstein 47).* **Was aufgehoben wurde, gehört mit dem Grund
  hingeschrieben — nicht gelöscht.**
* **Sammelblatt:** Punkt 15 verlässt Teil I und geht in den Wegweiser. *Was von
  ihm liegen bleibt — die Ableitungen auf WebP —, bekommt eine eigene Zeile mit
  dem Grund, warum es liegen bleibt, **und mit dem neuen Befund zu `medium`**.*
* **Die README** bekommt den Satz, dass eingefügte Bildschirmfotos als WebP
  abgelegt werden, und den engeren Ausschnitt. *Und weiterhin gilt: die Nummer
  bleibt nur, wo sie eine Handlung bestimmt.*
* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2: **eine Zeile je
  Änderung**, die Abschnittsnamen vor der Zeile — **und diesmal MIT Kasten
  darüber**, weil vor dem Einspielen zu sichern ist.
* **DAS KONZEPTPAPIER UND DAS VIDEOPAPIER WERDEN NICHT ANGEFASST.**
* **`Doku/Auftrag_0.18.0.md` fällt mit diesem Auftrag weg** — *es liegt immer nur
  einer im Repo, und was 0.18.0 gebracht hat, steht in seinem
  Änderungsprotokoll.* **Dieser hier fällt weg, wenn der nächste geschrieben
  wird.**

### Der Fahrplan steht anderswo, und das mit Absicht

> **DER PLAN STEHT IM PROJEKTSTAND, ABSCHNITT 10 — und sonst nirgends.** Ein
> Auftrag ist kein Ort für den Fahrplan: er wird beim Schreiben des nächsten
> weggeworfen, und was darin stand, wäre dann weg. **Trag 0.19.0 dort ein, wenn
> die Runde steht.**
