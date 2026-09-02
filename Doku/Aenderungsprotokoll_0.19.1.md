# Änderungsprotokoll 0.19.1 — „Was 0.19.0 falsch gemacht hat"

**Version 0.19.1 · gebaut am 2. September 2026 · Fingerprint `b0c4da5b` ·
5104 Prüfungen · 472 Rückbauten in `gegenprobe.js`**

---

**DIESE RUNDE HAT NICHTS NEUES GEBAUT.** Sie räumt auf, was die Runde davor
hinterlassen hat — **vier belegte Fehler, zwei falsche Zahlen in den eigenen
Papieren, ein widerlegter Satz, zwei Benennungen und eine Auslieferungsfalle.**

> **DIE NUMMER: PATCH.** *Der Maßstab ist nicht der Aufwand, sondern die Frage:
> kann die Installation danach etwas, was sie vorher nicht konnte? Die Antwort
> ist bei jedem der zehn Punkte **nein**.* Dieselben Knöpfe, dieselben
> Ergebnisse — nur richtig, schnell und richtig benannt.
>
> **DIES IST KEINE DATENBANKSTUFE.** Kein Migrationsblock, keine
> Schemaänderung: es bleibt bei **acht** markierten Blöcken, bei
> **Austauschformat 12**, bei `F_ROUTEN` **70** und bei **acht** Zwecken der
> zweiten Bestätigung. **Gesichert werden muss vor dem Einspielen nichts** —
> außer dem, was Punkt 8 über die Compose-Datei sagt.
>
> **EINE ZAHL ÄNDERT SICH DOCH: die Karten.** Punkt 4 gibt der Bildablage eine
> eigene Kachel; aus achtzehn werden **neunzehn**. *Das ist keine neue Funktion
> — es ist dieselbe Bedienung an einem eigenen Platz.*

---

## 0. Was gemessen wurde, bevor gebaut wurde

**Alles in diesem Abschnitt ist nachgefahren** — teils an einer verschlüsselten
Datenbank in der Größenordnung der echten, teils in einem echten Chromium, teils
an der laufenden Installation. **Keine Zahl hier ist geschätzt.**

### A. Die Bestandskarte las jedes Bild — bei jedem Klick

Gemessen an einer **SQLCipher-Datenbank mit 400 Zeilen à 512 kB (205 MB)**:

| Abfrage | Zeit |
|---|---|
| `COUNT(*)` allein | 0,0 ms |
| `COUNT(*), SUM(length(data))` **ohne** `GROUP BY` | **0,0 ms** |
| `COUNT(*), SUM(length(data))` **mit** `GROUP BY` | **778 ms** |
| die Abfrage aus 0.19.0 (mit `hex(substr(...))`) | **919 ms** |
| `SUM(length(hex(data)))` — liest garantiert alles, als Obergrenze | 753 ms |
| `hex(substr(data,1,8))` **ohne** `GROUP BY` | **657 ms** |
| nur die Größe gruppiert, über eine **materialisierte** Zwischenabfrage | **0,1 ms** |
| `art` + `mime_type`, materialisiert | **0,2 ms** |

**Zwei Befunde, und beide widersprechen dem, was bis zu dieser Runde im
Quelltext stand.**

1. **`substr()` auf einem Blob liest das Blob.** 657 ms auch ohne `GROUP BY`,
   also das 0,87-fache der Obergrenze. *Der Kommentar bei `server.js` sagte das
   Gegenteil — siehe Punkt 9a.*
2. **`length()` auf einem Blob ist kostenlos — aber nur außerhalb eines
   `GROUP BY`.** SQLite liest die Länge aus dem Satzkopf; sobald die Spalte durch
   den Sortierer der Gruppierung muss, wird das Blob materialisiert. **Das
   Zusammenlegen der beiden Durchläufe hat den Fehler erst gebaut.**

**Hochgerechnet auf die echte Installation (606 MB): rund 2,7 Sekunden** — und
zwar bei **jedem** Zeichnen des Systembereichs, der sich bei **jedem**
Abschnittswechsel neu zeichnet. *Im Feld gemeldet als „ca. 3 Sekunden
Ladezeit".*

> **UND WÄHREND EINER UMSTELLUNG WIRD DARAUS EINE SELBSTBLOCKADE.**
> `verfolgeUmstellung()` fragt `/api/stats` **alle 1500 ms** ab, solange der Lauf
> läuft. **Eine Abfrage, die 2700 ms kostet, alle 1500 ms gestellt, lastet den
> Haupt-Thread zu 180 % aus** — und `setInterval` wartet die Antwort nicht ab,
> die Anfragen stapeln sich also zusätzlich.
>
> **SIE IST HERGELEITET UND NICHT AM WIRT NACHGEMESSEN**, und das gehört
> dazugesagt. *Der Beleg ist einfach zu führen: nach dieser Runde denselben Lauf
> noch einmal fahren. Sind die Aussetzer weg und dauert er ein Vielfaches
> weniger, war es das.* **Die gemessene Zahl gehört dann als Nachtrag hierher.**

### B. Der engere Ausschnitt erreichte die Bildränder nicht

Gemessen **in echtem Chromium**, Kachel 313 × 313, `object-fit: cover`,
Zoom 250 %, Fokuspunkt jeweils in eine Ecke gesetzt. Gemessen wurde, wie viel von
der **gesuchten** Bildecke auf der Kachel zu sehen ist:

| Fokuspunkt | vorher | mit `transform-origin` |
|---|---|---|
| oben-links | **0,0 %** | 30,7 % |
| oben-rechts | **0,0 %** | 30,7 % |
| unten-links | **0,0 %** | 15,4 % |
| unten-rechts | **0,0 %** | 15,4 % |

**Von der gewählten Ecke war kein einziger Bildpunkt zu sehen**, in keiner der
vier Richtungen. *Der Grund: `ausschnitt()` lieferte `object-position` und
`--zoom`, aber kein `transform-origin` — `scale()` vergrößerte also um die
Mitte. Was man sah, war erst der `object-position`-Ausschnitt und davon noch
einmal der mittige Teil.* **Je enger man zog, desto weiter waren die Ränder
weg.**

### C. Ein Dialog aus dem Vollbild heraus lag dahinter

```
.backdrop  z-index: 60      jeder Bestätigungsdialog
.lightbox  z-index: 90      das Vollbild
```

*Im Feld gemeldet: Löschen im Vollbild sah aus, als reagiere nichts; die
Rückfrage stand erst da, wenn man das Vollbild schloss.* **Betroffen war jeder
Dialog, den man aus dem Vollbild heraus auslöst, nicht nur das Löschen.**

### D. Der Umstellungslauf und was er wirklich kostet

**Im Feld gefahren: 679 von 679 umgestellt, 272,1 MB gespart, rund eine
Stunde** — also **~5,3 s je Bild**. Nachgefahren an einer verschlüsselten
Datenbank auf einem Xeon 2,1 GHz, vier Kerne:

| | je Bild | Anteil |
|---|---|---|
| Lesen aus der Tabelle | 2 ms | 0 % |
| **Kodieren (sharp)** | **346 ms** | **88 %** |
| Schreiben in die Tabelle | 16 ms | 4 % |
| Pause (30 ms) | 30 ms | 8 % |

*Das wären 4,5 Minuten für 679 Bilder.* **Die Feldmaschine ist also rund
dreizehnmal langsamer je Bild — eine Zahl, die kein Server vorher kennen kann.**
Daraus folgt Punkt 5: **keine erfundene Minutenangabe am Knopf.**

> **ZWEI VERDÄCHTIGE SIND AUSGESCHLOSSEN, und beide durch eine Messung am Wirt
> selbst.**
>
> * **Die CPU nicht:** `sharp.concurrency()` steht dort schon auf **1**, der
>   Container ist unbeschränkt (`NanoCpus=0 Quota=0/0 Cpuset= Memory=0`) und hat
>   vier Kerne. *libvips nimmt sich die Maschine also nicht.*
> * **Die Platte nicht:** `fsync` über 4 MB kostet dort **6 ms im Median, 7 ms im
>   schlimmsten Fall** — eine SSD. *679 Checkpoints ergeben fünf Sekunden auf die
>   ganze Stunde.*
>
> **Übrig bleibt die Selbstblockade aus Abschnitt A**, und die behebt Punkt 1.
> *0.19.2 („Bestandsläufe verlassen den Anfrageweg") bleibt trotzdem richtig —
> ein Bestandslauf hat im Anfrageweg nichts verloren, gleich wer ihn gerade
> ausbremst —, ist aber nach diesem Befund **nicht mehr die vermutete Heilung**,
> sondern die saubere Bauform.*

### E. Die Vorhersage von 0.19.0 hat gehalten

Vorhergesagt waren **161,9 MB**; tatsächlich belegen die umgestellten Bilder
435,7 − 272,1 = **163,6 MB**. **Abweichung 1,0 %.** *Eine Messung, die sich
bestätigt, ist genauso berichtenswert wie eine, die sich nicht bestätigt.* **Der
Beleg ist im Änderungsprotokoll 0.19.0 nachgetragen und steht im Quelltext neben
der Vorhersage.**

### F. Rückbau 433 ist widerlegt

Nach dem Lauf stand in `bildFormate` **kein `png` mehr** — 679 von 679
umgestellt, **keines geblieben**. Dazu **achtzehn** Laborversuche (neun in
0.19.0, neun danach: Palette mit 8 und mit 256 Farben, reiner Text, Graustufen,
Alpha, 1×1, Flächen): **PNG gewinnt nie über die Größe.** *Der einzige Fall, in
dem PNG liegen bleibt, ist der, in dem WebP nicht kann — über 16383 Bildpunkte je
Kante, und der ist als Rückbau 458 gebaut und geprüft.*

---

## 1. Die Bestandskarte fragt wieder schnell

### GEBAUT

Die Abfrage in `GET /api/stats` ist **zerlegt**:

* **Die Aufteilung nach `art`** — `photoCount`, `photoBytes`, `videoCount`,
  `videoBytes` — kommt über eine **materialisierte Zwischenabfrage**, damit
  `length(data)` seine Abkürzung behält:

  ```sql
  WITH x AS MATERIALIZED (SELECT art AS a, length(data) AS o FROM photos)
  SELECT a, COUNT(*) AS n, COALESCE(SUM(o),0) AS o FROM x GROUP BY 1
  ```

  **Gemessen 0,1 ms.** *Ein Durchgang bleibt ein Durchgang — die Zusammenlegung
  aus 0.19.0 war richtig gedacht und nur falsch gebaut.*

* **Die Aufteilung nach Format** (`bildFormate`) kommt aus **`mime_type`** statt
  aus dem Inhalt, ebenfalls materialisiert. **Gemessen 0,2 ms gegen 919 ms.**

### Die Entscheidung, und sie ist hier getroffen

**0.19.0 hat ausdrücklich anders entschieden:** *„erkannt wird am Inhalt, nicht
an `mime_type` — die Spalte ist eine Angabe des Hochladenden."* **Dieser Satz
bleibt richtig, wo er hingehört: am Upload.** `legeBildAb()` sieht weiter in die
ersten acht Bytes und glaubt dem gemeldeten Typ nicht.

**Er ist für eine Kennzahl auf einer Karte aufgehoben**, und der Grund ist eine
Abwägung: *2,7 Sekunden bei jedem Klick gegen die Möglichkeit, dass eine Zeile
falsch gezählt wird, weil jemand beim Hochladen einen falschen Typ gemeldet hat.*
**Und der Knopf bleibt davon unberührt:** `qOffenePNG` sucht weiter am Inhalt
(`hex(substr(data,1,8))`), läuft aber nur auf Verlangen. **Die Karte kann sich
also verzählen, der Knopf nie das Falsche tun.**

*Was aufgehoben wurde, steht mit dem Grund an der Abfrage — nicht gelöscht
(Stolperstein 201).*

> **DIE ABWEICHUNG IST GEMESSEN UND NICHT BEHAUPTET.** Der Prüfstand stellt sie
> über den gewöhnlichen Weg her: **ein JPEG, das sich beim Hochladen
> `image/png` nennt.** *Der Filter lässt es durch (es fängt mit `image/` an),
> `rasterBild()` ebenfalls (es IST ein Rasterbild), und `legeBildAb()` lässt den
> gemeldeten Typ stehen, weil die ersten acht Bytes kein PNG sind.* **Die Karte
> zählt die Zeile als PNG; der Umstellungslauf nimmt sie nicht mit.**

### Die Formatzeile auf der Karte

`mime_type` liefert `image/webp`, `image/jpeg`, … — die Karte zeigt weiter
`WebP`, `JPEG`, `GIF`, `PNG`. **Die Zuordnung steht an EINER Stelle**
(`BILD_MIME_FORMAT` in `server.js`), nicht je einmal im Server und in der
Oberfläche; `BILDFORMATE` in `public/app.js` kennt nur noch Schlüssel und Namen
(Stolperstein 47).

---

## 2. Der engere Ausschnitt erreicht die Bildränder

### GEBAUT

`ausschnitt(p)` liefert zusätzlich **`transform-origin`** auf denselben Punkt wie
`object-position`:

```
object-position:X% Y%;transform-origin:X% Y%;--zoom:F
```

**Gerechnet wird der Zoom weiter im Stilblatt** und nicht inline — Stolperstein
272 gilt unverändert: ein Inline-`transform` schlüge die Überfahrregel.
*`transform-origin` ist kein `transform` und darf deshalb mit hinaus.*

**Das Wertepaar wird EINMAL gerechnet und zweimal ausgegeben.** *Zwei Rechenwege
liefen früher oder später auseinander, und dann zöge die Vergrößerung an einem
anderen Punkt als der Ausschnitt.*

### Was dabei geprüft wird

* **Die Wirkung steht als Messung in den Papieren, nicht als Prüfung** — jsdom
  rechnet keine Lage aus (Stolperstein 223). **Geprüft wird am Text:**
  `ausschnitt()` liefert `transform-origin` mit demselben Wertepaar wie
  `object-position` — *an einem unsymmetrischen Paar (12/87), damit ein
  vertauschtes auffällt* — und es geht **kein `transform`** hinaus.
* **Die vier Zusagen aus 0.19.0 zum Stilblatt bleiben grün.** *Sie sind erst
  nachgetragen worden, weil Rückbau 453 stumm blieb; sie durften dabei nicht
  wieder verlorengehen.*

---

## 3. Ein Dialog aus dem Vollbild heraus ist zu sehen

### GEBAUT

**Die Stapelordnung ist einmal ganz aufgeschrieben und festgenagelt**, statt eine
Zahl hochzusetzen. Sie steht als zehn benannte Stufen in `:root`, mit **einem
Satz je Ebene, warum sie dort liegt**:

| Stufe | Wofür |
|---|---|
| **2** | der Ausschnittrahmen im Betrachter — sein Schleier liegt über dem Bild, aber unter allem Anfassbaren |
| **3** | die Bedienung IM Betrachter — Werkzeugecke und Weitenschieber |
| **4** | die Blätterpfeile des Vollbilds |
| **5** | der Schwebehinweis der Zeitleiste |
| **20** | die klebende Kopfzeile |
| **30** | ihr eingeklapptes Menü |
| **40** | die Vergleichsleiste am unteren Rand |
| **90** | das Vollbild |
| **100** | **der Bestätigungsdialog — er gehört über das Vollbild** |
| **120** | die Meldung |

> **DIE ORDNUNG WURDE SORTIERT UND NICHT DURCHEINANDERGEWORFEN.** *Nur
> `.backdrop` hat den Platz gewechselt (60 → 100); alle übrigen Werte stehen, wo
> sie standen — sie sind nur nicht mehr über 2600 Zeilen verstreut.* **Der
> Schleier des Ausschnittrahmens und der Schieber `.vzoom` liegen weiterhin
> innerhalb des Vollbilds und behalten ihre Verhältnisse zueinander.**

**Eine Prüfung hält die Reihenfolge fest**, damit die nächste Kachel sie nicht
wieder aufmacht — und ausdrücklich, dass **keine einzelne Regel mehr ihre eigene
Zahl trägt**.

---

## 4. Die Bildablage bekommt eine eigene Kachel

### GEBAUT

Der Abschnitt „Bildablage" hat die Karte „Kennzahlen" verlassen und ist eine
eigene Karte im Abschnitt **Datenbank**. **Damit sind es neunzehn Karten.**

**Warum sie in 0.19.0 in „Kennzahlen" saß:** dort stand ausdrücklich *„es bleibt
bei achtzehn Karten"*, und der Abschnitt war zwei Zeilen und ein Schalter groß.
*Inzwischen trägt er zwei bis fünf Formatzeilen, einen Schalter mit Erläuterung,
einen Knopf, eine Fortschrittszeile und eine Meldung* — **die Karte war zu groß
geworden, und das ist im Feld aufgefallen.**

**Nachgezogen:** `SYS_KARTEN` und die Zuordnung zum Abschnitt, die fünf Zusagen
im Prüfstand, die die Achtzehn namentlich nannten, die Kartenzahl in Projektstand
und README.

> **DER KOMMENTAR BEI `pruefung.js` ZU DEN „NEUNZEHN KARTEN" IST GELESEN
> WORDEN, BEVOR ER ANGEFASST WURDE** — er stammt aus 0.16.0. **Sein Grund gilt
> unverändert:** die Ansichten stehen bei den Filtern und nicht in einer eigenen
> Karte. *Seine ZAHL war seit 0.16.0 falsch — damals waren es achtzehn — und ist
> mit dieser Runde zufällig richtig geworden.* **Er bleibt deshalb stehen; die
> Zahl der Karten wird an der Stelle geprüft, an der sie hingehört, und nicht in
> einem Kommentar über Ansichten.**

**Die Karte steht auch dann da, wenn kein Bild abliegt** — sie sagt dann genau
das. *Eine Karte, die je nach Bestand da ist oder nicht, ließe den Systembereich
unter der Hand die Gestalt wechseln; die Kartenzahl wäre dann keine Zahl mehr.*

**„Kennzahlen" ist damit wieder die einzige Karte ohne Behandler.** *Die
Auslassung in `SYS_KARTEN` ist genau dafür vorgesehen und kostet nichts.*

---

## 5. Der Knopf sagt vorher, dass es dauert

### GEBAUT

Der Dialog der zweiten Bestätigung vor „Alle PNG nach WebP umstellen" nennt
zusätzlich zur Menge auch die Dauer — **und zwar ohne Zahl**:

> *„… Wie lange das dauert, hängt an dieser Maschine und ist hier nicht
> gemessen — rechne mit Minuten bis Stunden. Der Lauf stört den Betrieb, solange
> er läuft."*

### Warum keine Zahl

**Weil der Server sie nicht kennt.** *Gemessen: 394 ms je Bild an der
nachgefahrenen Maschine gegen 5,3 s im Feld — Faktor dreizehn.* Eine Schätzung
wäre auf der einen Maschine beruhigend falsch und auf der anderen erschreckend
falsch. **Wenn eine Zahl fehlt, steht das ausdrücklich da** (Stolperstein 252).

*Der Prüfstand hält beide Hälften fest: dass der Satz dasteht — und dass im
Dialog **keine** Zeitangabe in Sekunden, Minuten oder Stunden steht.*

### Was ausdrücklich NICHT gebaut wurde

**Keine Restlaufzeit in der Fortschrittszeile.** *Sie wäre aus dem gemessenen
Takt zwar ehrlich zu rechnen — aber wenn der Satz oben seine Arbeit tut, braucht
es sie nicht, und sie kostet eine Anzeige, die bei jedem Umlauf springt.*

---

## 6. Die Threadzahl von sharp wird ausdrücklich gesetzt

### GEBAUT

```js
sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));
```

### Und die Ehrlichkeit gehört dazu

**Auf der Installation, die den Befund gemeldet hat, ändert diese Zeile nichts**
— dort steht die Vorgabe schon auf 1. *Sie steht da, weil sharp seine Vorgabe vom
Image abhängig macht: unter glibc ohne jemalloc ist sie 1, unter musl oder mit
jemalloc kann sie die Kernzahl sein.* **Wer Kriterion auf einer fremden Maschine
betreibt, bekäme sonst einen Wartungslauf, der sich die ganze Maschine nimmt.**

> **UND `os.cpus()` IST IM CONTAINER NICHT DIE WAHRHEIT ÜBER DAS KONTINGENT.**
> Es meldet die Kerne des **Wirts**, nicht das, was dem Container zugeteilt ist.
> *Wer den Container auf eine CPU begrenzt, bekommt trotzdem die halbe Kernzahl
> des Wirts.* **Der Satz steht als Vorbehalt daneben** (Stolperstein 278); ob
> daraus mehr wird — das Lesen der cgroup-Grenze —, ist eine Frage für 0.19.2.

---

## 7. „Instanz" heißt „Installation"

### GEBAUT

* **Der fünfte Abschnitt des Systembereichs** heißt **„Installation"**.
  *Einwortig wie seine vier Nachbarn (Persönlich · Bestand · Zugänge ·
  Datenbank).*
* **Siebzehn Stellen im Bildschirmtext** — überwiegend Varianten von *„der
  Eigentümer der Instanz"* in `server.js` (5), `auth.js` (3) und
  `public/app.js` (9) — heißen jetzt **„dieser Installation"**.
* **Die README** ist ganz nachgezogen: **58 Vorkommen**, wortweise ersetzt.
  *Deutsch macht das leicht — „die Instanz" und „die Installation" sind beide
  weiblich und beugen gleich.*

### Warum nicht „von Kriterion"

**Weil `title_app` einstellbar ist.** *Wer seinen Bestand „Produktliste" nennt,
läse sonst eine Meldung über „Kriterion" und müsste erst überlegen, was gemeint
ist.* **Der Produktname steht dort, wo das Produkt gemeint ist** (README,
Papiere); **die neutrale Form dort, wo die konkrete Anlage gemeint ist**
(Meldungen).

### DIE FALLE, und sie war der eigentliche Grund für die Länge dieses Punktes

**Dieser Abschnitt ist schon einmal umbenannt worden** — bis 0.17.0 hieß er
„Anlage". Alte Adressen werden still übersetzt; der Kommentar dort sagte voraus,
was jetzt anstand: *„käme je ein zweiter alter Name dazu, steht er als Zeile
daneben und nicht als zweites `if`."*

**Die Tafel wird EINMAL nachgeschlagen und nicht verkettet:**

```js
const SYS_ALTE_ABSCHNITTE = { anlage: 'installation', instanz: 'installation' };
```

**und ausdrücklich nicht** `{ anlage: 'instanz', instanz: 'installation' }` —
*sonst landete `#/system/anlage` bei einem Schlüssel, den es nicht mehr gibt, und
der älteste Link wäre ausgerechnet der einzige, der ins Leere führt.* **Beide
alten Adressen haben eine Prüfung bekommen**, in einer Schleife statt zweimal
abgeschrieben — und **Rückbau 459 baut genau die Verkettung ein.**

### Was ausdrücklich NICHT angefasst ist

**Die rund 150 Vorkommen in Kommentaren** (`server.js`, `public/app.js`,
`public/style.css`). *Das ist Binnensprache unter Entwicklern; ein Rundumschlag
brächte einen riesigen Diff und niemandem einen Gewinn.* **Diese Entscheidung
steht hier, damit sie beim nächsten Mal nicht jemand doch „berichtigt".**

> **DREI KOMMENTARE SIND DOCH MITGEGANGEN, und das ist die Ausnahme mit Grund:**
> der Kopfkommentar von `SYS_ABSCHNITTE`, der von `SYS_ALTE_ABSCHNITTE` und die
> Überschrift der Karte „Titel". *Sie beschreiben den umbenannten Abschnitt
> selbst — ein Kommentar, der eine Sache bei einem Namen nennt, den es nicht
> mehr gibt, ist kein Stilthema, sondern falsch.*

---

## 8. Die Compose-Datei wird nicht mehr überschrieben

### Der Befund

```
.env.example          im Repo    .env               in .gitignore   → sauber
docker-compose.yml    im Repo    docker-compose.yml NICHT ignoriert → wird überschrieben
```

*Wer das ZIP von GitHub über seinen Ordner entpackt, verliert seine angepasste
`docker-compose.yml` — Port, Einhängung des Sicherungsorts, Containername.* **Im
Feld passiert.**

### GEBAUT — genau das Muster, das `.env` schon hat

* `docker-compose.yml` → **`docker-compose.example.yml`** (`git mv`)
* `docker-compose.yml` in die `.gitignore`, **direkt neben `.env`**
* **README:** der Kopierschritt in **beiden** Einspielwegen und ein Pflichtsatz
  in derselben Form wie bei `.env`, samt der Absage, die ohne ihn kommt
  („no configuration file provided: not found")

**Der Stopp kommt geschenkt:** *ohne Compose-Datei bricht `docker compose up` von
sich aus ab. Karg, aber es hält an.* **Ein zusätzliches Startskript ist
ausdrücklich nicht gebaut worden** — neue Maschinerie für wenig Gewinn, und die
README fängt es ab.

**Der Prüfstand liest seither die Vorlage** — `docker-compose.example.yml`. *Er
fände die Arbeitsdatei in einer frischen Kopie gar nicht, und `gegenprobe.js`,
das über `git archive HEAD` kopiert, erst recht nicht.*

---

## 9. Drei Berichtigungen in den eigenen Papieren

**Nicht verhandelbar.** *Es standen zwei falsche Messungen und ein widerlegter
Satz im Quelltext und im Änderungsprotokoll — das ist die Sorte Fehler, gegen die
dieses Projekt gebaut ist.*

### a) Die Behauptung über `substr`

`server.js` sagte, `hex(substr(data,1,8))` hole die ersten Bytes und lasse das
Blob dabei ungelesen. **Falsch, gemessen 657 ms.** *Die Berichtigung nennt die
Zahl und den Grund und steht an derselben Stelle.*

### b) Die Messung, die es nicht gegeben haben kann

`server.js` und `Doku/Aenderungsprotokoll_0.19.0.md` trugen eine Tabelle mit vier
Zeiten, angeblich gemessen an einer Datenbank „in der Größe der echten (679 PNG,
344 JPEG, 9 WebP, 606 MB)" — der beste Wert knapp unter drei Sekunden. **Eine
Datenbank mit 606 MB Bilddaten beantwortet diese Abfrage nicht in drei Sekunden**
— nachgemessen sind es bei 205 MB schon 919 ms.

**Die Zahlen sind gestrichen und durch die nachgefahrene Messung ersetzt**, mit
einem Satz dazu, dass die alte falsch war und woran das gelegen haben dürfte:
*sie dürften an einer Datenbank ohne Bilddaten entstanden sein.*

### c) Der Satz zu Rückbau 433

`Doku/Aenderungsprotokoll_0.19.0.md` und `gegenprobe.js` sagten, der Fall komme
am echten Bestand vor und lasse sich nur mit erzeugtem Material nicht
herstellen. **Der erste Halbsatz ist widerlegt** (Abschnitt F).

**Der Rückbau bleibt und bleibt als STUMM erwartet** — *er bewacht das
Vorhandensein der Regel, auch wo er ihre Wirkung nicht zeigen kann.* **Nur seine
Begründung ist berichtigt:** achtzehn Versuche, kein Gegenbeispiel, und am echten
Bestand 679 von 679 umgestellt.

> **UND DER FELDBELEG ZU 0.19.0 STEHT DANEBEN:** vorhergesagt 161,9 MB,
> tatsächlich 163,6 MB, **Abweichung 1,0 %.** *Eine Messung, die sich bestätigt,
> ist so berichtenswert wie eine, die es nicht tut.*

### Und ein Wächter hält sie fern

**Eine Berichtigung, die nur aus gutem Willen besteht, hält nicht.** *Genau so ist
der Satz aus dem Auftrag zu 0.19.0 in den Quelltext gekommen.* Der Prüfstand
durchsucht deshalb **sechs Dateien** — `server.js`, `public/app.js`,
`gegenprobe.js`, `README.md`, `CHANGELOG.md` und das Änderungsprotokoll 0.19.0 —
nach den drei berichtigten Behauptungen und **prüft daneben, dass die
Berichtigungen selbst dastehen**.

> **DIE ALTEN SÄTZE STEHEN ÜBERALL IN INDIREKTER REDE, auch hier.** *Ein
> Wächter über Text kann eine zitierte Berichtigung nicht von einer Behauptung
> unterscheiden; würde der alte Wortlaut irgendwo wörtlich stehenbleiben, müsste
> der Wächter eine Ausnahme dafür tragen — und eine Ausnahme ist genau die Lücke,
> durch die der Satz beim nächsten Abschreiben zurückkommt.* **Was gestrichen
> wurde, ist hier vollständig beschrieben; was dastand, ist an keiner Stelle
> mehr nachzulesen, und das ist der Zweck.**

---

## 10. `Faden` → `Thread` in der Sprachliste

Der Sprachwächter hat einen Eintrag mehr bekommen:

```js
['Faden', 'Thread'],
```

*Der Maßstab ist das Wort, das ein deutschsprachiger Entwickler im Gespräch
benutzen würde — und das ist Thread.* **Der Eintrag kommt hinein, weil das Wort
in dieser Runde tatsächlich gefallen ist** (die Zahl der Threads, die sich sharp
nehmen darf) **und weil 0.19.2 voll davon sein wird.**

> **`Faden` TRIFFT NUR AM WORTANFANG, und das ist keine Feinheit.** *„Pfaden"
> trägt die Buchstabenfolge mitten drin, und der Dativ Plural von Pfad kommt im
> Quelltext und in den Papieren viermal vor.* **Ohne die Ausnahme hätte der
> Wächter beim ersten Lauf vier falsche Treffer gemeldet** — und ein Wächter,
> der jedes zweite Wort anmeckert, wird abgeschaltet. *Die Ausnahme steht neben
> der von `Abbild`/`Abbildung` und hat wie diese ihre eigene Gegenprobe.*

**Im Quelltext stand `Faden` vorher nirgends** — nachgesehen über das ganze Repo.

### ABWEICHUNG VOM AUFTRAG: die Zahl stimmte nicht

**Der Auftrag sagt, der Wächter führe „zwölf Übersetzungen" und bekomme „eine
dreizehnte".** *Nachgezählt trug die Liste **dreizehn Zeilen für elf Wörter*** —
`Doppelgänger` und `Rückschritt` stehen je zweimal darin, einmal mit Umlaut und
einmal ohne. **Nach dieser Runde sind es vierzehn Zeilen für zwölf Wörter**, und
genau das prüft der Prüfstand jetzt ausdrücklich. *In einer Runde, die zwei
ungemessene Zahlen wegräumt, wird die dritte nicht abgeschrieben.*

---

## 11. Was je Datei geändert wurde

| Datei | Was |
|---|---|
| `server.js` | **Punkt 1:** `/api/stats` zerlegt — zwei materialisierte Abfragen, die Formataufteilung aus `mime_type`; die Zuordnung `BILD_MIME_FORMAT` neu, an **einer** Stelle. **Punkt 6:** `os` als Modul, `sharp.concurrency(...)` mit Vorbehalt. **Punkt 7:** fünf Bildschirmtexte. **Punkt 9:** die beiden Berichtigungen am Kommentar der Abfrage, der Feldbeleg neben der Vorhersage. |
| `auth.js` | **Punkt 7:** drei Bildschirmtexte (derselbe Satz an drei Stellen). |
| `public/app.js` | **Punkt 2:** `ausschnitt()` liefert `transform-origin`. **Punkt 4:** `karteBildablage()` und `ruesteBildablageAus()` neu, `karteKennzahlen()` ohne Behandler, `SYS_KARTEN` mit neunzehn Zeilen. **Punkt 5:** der Dauerhinweis im Dialog. **Punkt 7:** `SYS_ABSCHNITTE`, `SYS_ALTE_ABSCHNITTE` mit zwei Zeilen, neun Bildschirmtexte. |
| `public/style.css` | **Punkt 3:** die Stapelordnung als zehn benannte Stufen in `:root`, mit einem Satz je Ebene; alle elf `z-index`-Regeln lesen sie. **Punkt 2:** der Kommentar an `.card-img img` sagt, woher der Vergrößerungspunkt kommt. |
| `pruefung.js` | **Punkt 10:** die Sprachliste und ihre Ausnahme. Neue Gruppen für die Stapelordnung, die Compose-Datei und die berichtigten Behauptungen; die Zusagen zu `ausschnitt()`, zur Bildablage, zur Threadzahl und zu den beiden alten Adressen. Kartenzahl **19**, Rückbauzahl **472**, die Compose-Vorlage statt der Arbeitsdatei. |
| `gegenprobe.js` | **22 neue** (459 bis 479 und W13). **Vier mitgegangen** (44, 346, 347, 377). **Punkt 9c:** die Begründung von 433 berichtigt. |
| `.gitignore` | `docker-compose.yml`, direkt neben `.env`. |
| `docker-compose.yml` → `docker-compose.example.yml` | **`git mv`.** Der Inhalt ist unverändert. |
| `README.md` | Der Compose-Pflichtschritt in beiden Einspielwegen, die Kartenzahl **neunzehn**, „Bildablage" in der Abschnittstabelle, `#/system/installation`, die beiden alten Adressen — und **58 Vorkommen** von „Instanz". |
| `CHANGELOG.md` | Abschnitt **0.19.1**, **mit Kasten** wegen der Compose-Datei. |
| `Doku/Aenderungsprotokoll_0.19.0.md` | **Punkt 9:** die gestrichene Messung, der berichtigte Satz zu Rückbau 433 (an zwei Stellen), der nachgetragene Feldbeleg. |
| `Doku/Aenderungsprotokoll_0.19.1.md` | **NEU** — dieses Papier. |
| `Doku/Projektstand_Kriterion_0_19_1.md` | **`git mv`** aus `_0_19_0`. Kopf (Revision 49), der Satz zur Runde, Betriebsstand, der Systembereich (neunzehn Karten, „Installation", beide alten Adressen), **Stolpersteine 275–278**, Prüfstand, Abschnitt 8, Versionsgeschichte, Fahrplan und 10a. *Kein anderes lebendes Papier nennt den alten Dateinamen — nachgesehen über das ganze Repo.* |
| `Doku/Fehler_und_Ideen.md` | **Punkt 7 neu** — die Vorschaubilder werden zu klein gerechnet (eingetragen als 0.19.3); die Übersicht nach Art nachgezogen. |
| `package.json`, `package-lock.json` | Version **0.19.1**. |

---

## 12. Der Prüfstand

**5104 von 5104 grün.** *Vorher 5055 — **49
neue**, keine weggefallen.*

| Gruppe | vorher | nachher | wofür |
|---|---|---|---|
| **Die Bildablage: PNG kommt herein, WebP geht in die Tabelle** | 46 | **56** | die Karte zählt nach `mime_type`, der Knopf sucht am Inhalt; die Bauform beider Abfragen am Text |
| **Fokuspunkt in der Oberflaeche** | 33 | **35** | `transform-origin` mit demselben Wertepaar, und kein `transform` |
| **Die Stapelordnung — 0.19.1** *(neu)* | — | **8** | zehn Stufen in `:root`, aufsteigend; Dialog über Vollbild; keine Zahl mehr in einer einzelnen Regel |
| **Die Bildablage in der Oberflaeche** | 28 | **33** | die eigene Karte, „Kennzahlen" ohne den Unterabschnitt, der Dauerhinweis ohne Zeitangabe |
| **Die Threadzahl von sharp — 0.19.1** *(neu)* | — | **3** | die Threadzahl ist gesetzt, plausibel und mit Vorbehalt |
| **Die berichtigten Behauptungen stehen nirgends mehr** *(neu)* | — | **6** | der Wächter über sechs Dateien, und die Berichtigungen selbst |
| **Die Compose-Datei wird nicht ueberschrieben** *(neu)* | — | **7** | Vorlage, Ignorierliste, Pflichtschritt und Folge |
| **Der Sprachwaechter** | 24 | **27** | `Faden` → `Thread`, die Ausnahme am Wortanfang, vierzehn Zeilen für zwölf Wörter |
| **Aus „Anlage" wird „Instanz" wird „Installation"** | 9 | **14** | beide alten Adressen, die Tafel ohne Verkettung |
| **zusammen** | | | **+49** |

> **ZWEI ZUSAGEN SIND UMGEDREHT WORDEN STATT ZU VERSCHWINDEN** (Stolperstein 74):
> *„Es bleibt bei achtzehn Karten"* sagt jetzt, dass die Bildablage eine Karte
> für sich ist und in „Kennzahlen" nicht mehr steht; *„Die Karte trägt einen
> Abschnitt „Bildablage""* ist zur Gegenprobe geworden.

> **DREI ZUSAGEN HÄNGEN AM TEXT UND NICHT AM ERGEBNIS**, und der Grund ist
> derselbe wie beim Stilblatt: sie sind Zusagen über die **Laufzeit**, und die
> lässt sich am Prüfstand nicht messen — eine Prüflage mit 400 Zeilen à 512 kB
> dauerte länger als der ganze Lauf. **Die Wirkung steht als Messung in diesem
> Papier; die Prüfung hält fest, dass die Bauform noch da ist.**

---

## 13. Gegenproben

**472 Rückbauten, 22 davon neu.**

| # | Rückbau | Punkt |
|---|---|---|
| 459 | Die Tafel der alten Adressen wird verkettet | 7 |
| 460 | Die Aufteilung nach Format liest wieder den Inhalt | 1 |
| 461 | Die Größen werden wieder unmittelbar gruppiert | 1 |
| 462 | Der Knopf sucht am gemeldeten Typ statt am Inhalt | 1 |
| 463 | Die Zuordnung von `mime_type` auf den Schlüssel ist leer | 1 |
| 464 | Der Ausschnitt liefert keinen `transform-origin` mehr | 2 |
| 465 | Der Vergrößerungspunkt steht auf der Mitte statt auf dem Fokuspunkt | 2 |
| 466 | Der Dialog liegt wieder unter dem Vollbild | 3 |
| 467 | Der Dialog trägt seine Stufe wieder als Zahl in der Regel | 3 |
| 468 | Die Meldung liegt unter dem Dialog | 3 |
| 469 | Die Bildablage fällt aus der Kartentabelle | 4 |
| 470 | Die Karte „Bildablage" steht im Abschnitt „Bestand" | 4 |
| 471 | Die Karte „Bildablage" verschwindet ohne Bilder | 4 |
| 472 | Der Dialog sagt nicht mehr, dass es dauern kann | 5 |
| 473 | Der Dialog erfindet doch eine Minutenangabe | 5 |
| 474 | Die Threadzahl von sharp wird nicht mehr gesetzt | 6 |
| 475 | Die Threadzahl von sharp ist die volle Kernzahl | 6 |
| 476 | Die Absage nennt wieder „den Eigentümer der Instanz" | 7 |
| 477 | Die `docker-compose.yml` steht nicht mehr in der `.gitignore` | 8 |
| 478 | Die README nennt den Pflichtschritt zur Compose-Datei nicht mehr | 8 |
| 479 | Die Berichtigung zu `substr()` fällt aus dem Quelltext | 9 |
| **W13** | Die Sprachliste verliert ihren jüngsten Eintrag | 10 |

> **JEDE NEUE ZUSAGE FASST IHRE FELDER DURCH EINE KLAMMER** (Stolperstein 161).
> *Ein Rückbau, der den Lauf abreißt, belegt nichts — die Helfer `letztesFoto()`
> und `formate()` aus 0.19.0 tun das für den Bildweg, und die neuen Zusagen
> lesen den Quelltext über `fs.existsSync` und Rückfallwerte statt über blanke
> Zugriffe.*

> **VIER VORHANDENE SIND MITGEGANGEN statt gelöscht zu werden**
> (Stolperstein 201): **44** und **377** zeigten auf Bildschirmtexte, die jetzt
> „dieser Installation" sagen; **346** auf die Tafel der alten Adressen, die eine
> zweite Zeile bekommen hat; **347** auf den Abschnitt, der jetzt „Installation"
> heißt. *Ein Rückbau, der ins Leere greift, ist stumm und verfälscht die
> Tabelle (Stolperstein 192).*

> **DER VOLLE LAUF IST NICHT GEFAHREN.** *Er dauert bei 472
> Rückbauten und rund fünfeinhalb Minuten je Prüflauf etwa vierzig Stunden.* **Der
> Prüfstand fängt den wichtigsten Fall trotzdem bei jedem Lauf ab:** *„Jeder
> Suchtext kommt in seiner Datei genau einmal vor"* — **genau diese Zeile hat die
> vier mitgegangenen Rückbauten gemeldet.**

---

## 14. Neue Stolpersteine

**Vier, und sie zählen bei 275 weiter** — 274 war vergeben.

| Nr. | Kernsatz |
|---|---|
| **275** | **`length()` auf einem Blob ist kostenlos — aber nicht im `GROUP BY`. Und `substr()` war es nie.** Gemessen an 205 MB: ohne Gruppierung 0,0 ms, mit 778 ms, materialisiert wieder 0,1 ms. *Wer zwei Abfragen zusammenlegt, misst danach noch einmal — eine Zusammenlegung ist keine Optimierung, sondern eine Änderung.* |
| **276** | **`transform: scale()` ohne `transform-origin` sperrt die Ränder aus.** Die Vergrößerung verankert sonst in der Mitte, und der eingestellte Punkt kommt nie an den Rand. *Der Fehler wächst genau mit der Einstellung, um derentwillen es die Funktion gibt.* |
| **277** | **Eine Messung, die um Größenordnungen zu gut aussieht, ist keine Messung.** Die drei Sekunden für 606 MB hätten auffallen müssen. *Die Probe ist billig: Was ist die Obergrenze? Wie viel Arbeit müsste die Abfrage mindestens tun?* **Wo eine Zahl in ein Papier wandert, gehört daneben, WORAN sie gemessen wurde.** |
| **278** | **Im Container meldet `os.cpus()` den Wirt, nicht das Kontingent.** Eine Rechnung über die Kernzahl verteilt damit Threads, die es nicht gibt. *Die Grenze steht in der cgroup und nicht in `os`; solange sie nicht gelesen wird, gehört der Vorbehalt als Satz neben die Zeile.* |

---

## 15. Die Zahlen

| | vorher (0.19.0) | nachher (0.19.1) |
|---|---|---|
| Prüfungen | 5055 | **5104** |
| Rückbauten in `gegenprobe.js` | 450 | **472** |
| höchste Rückbaunummer | 458 | **479** |
| Stolpersteine | 274 | **278** |
| Routen (`F_ROUTEN`) | 70 | **70** |
| Zwecke in `BESTAETIGUNG_ZWECKE` | 8 | **8** |
| Karten im Systembereich | 18 in 5 Abschnitten | **19 in 5 Abschnitten** |
| markierte Migrationsblöcke | 8 | **8** |
| Austauschformat | 12 | **12** |
| Wörter im Sprachwächter | 13 Zeilen / 11 Wörter | **14 Zeilen / 12 Wörter** |
| Abhängigkeiten | 5 + 1 zum Entwickeln | **5 + 1 zum Entwickeln** |
| Fingerprint | `5fe43053` | **`b0c4da5b`** |

---

## 16. Was ausdrücklich nicht passiert ist

- **Kein Schema, keine Migration, kein neuer Zweck, keine neue Route.**
- **Keine neue Abhängigkeit**, auch nicht zum Messen.
- **Keine Binärdatei im Repo, keine Tags.**
- **DIE PAUSE IST NICHT AN DIE ARBEIT GEBUNDEN WORDEN.** *Erwogen und verworfen:
  sie halbiert die Dichte der Blockade, nicht die Blockade. Wer während der fünf
  Sekunden klickt, wartet fünf Sekunden.* **Die 30 ms bleiben, wie sie sind.**
- **`reclaim()` LÄUFT NICHT STÜCKWEISE.** *Ausgeschlossen, nicht weggelassen: es
  läuft einmal nach der Schleife, die gemeldeten Aussetzer waren über die ganze
  Stunde verteilt. Wären sie davon gekommen, hätten sie am Ende sitzen müssen.*
- **KEINE NIEDRIGE PRIORITÄT (`nice`).** *`os.setPriority` gibt es und es wirkt
  — nur auf den ganzen Prozess. Der Server würde mitverlangsamt, und ein
  blockierter Thread bleibt blockiert, gleich welcher Priorität.*
- **DER LAUF ZIEHT NICHT IN EINEN EIGENEN THREAD.** *Das ist die richtige Lösung
  des Aussetzers und die Runde 0.19.2 — sie braucht einen eigenen Auftrag; ein
  zweiter Schreiber auf einer WAL-Datei ist heikel.*
- **KEINE RESTLAUFZEIT IN DER FORTSCHRITTSZEILE** (Punkt 5).
- **DIE ABLEITUNGEN SIND NICHT ANGEFASST.** *`thumb` ist 400 px auf der langen
  Kante, die Kachel fordert die kurze — das ist 0.19.3 und steht als Punkt 7 im
  Sammelblatt.*
- **KEIN STARTSKRIPT FÜR DIE COMPOSE-DATEI** (Punkt 8).
- **DIE RUND 150 „Instanz" IN KOMMENTAREN SIND GEBLIEBEN** (Punkt 7).

---

## 17. Offen geblieben

> ## ✅ IM FELD BESTÄTIGT — 2. September 2026
>
> **Die laufende Installation meldet `b0c4da5b`** — genau den gebauten Wert
> (Stolperstein 158). *Auf dem Wirt liegt keine Datei, die kein Commit trägt.*
>
> ### ⚠ UND DER RUNDLAUF HAT DREI BEFUNDE GEBRACHT — SIE SIND 0.19.2
>
> **1. Die Bestandskarte war weiter langsam.** *„Etwas schneller, ca. zwei
> Sekunden — immer noch langsamer als nötig."* **Punkt 1 hat nur die eine von
> zwei Ursachen getroffen.** Die zweite: `art` steht in der Spaltenreihenfolge
> **hinter** drei Blobs, und wer sie aus dem Satz liest, muss dessen
> Overflow-Ketten lesen und entschlüsseln. *`MATERIALIZED` hilft dagegen
> nichts.* **Damit sind auch zwei Zahlen dieses Papiers zu berichtigen** —
> siehe den Kasten unten.
>
> **2. Der engere Ausschnitt erreichte die Ränder immer noch nicht.**
> *„Verhält sich genauso wie vorher; nach links und rechts kann man gar nicht
> verschieben."* **`transform-origin` an der Kachel war richtig und blieb
> wirkungslos**, weil der Betrachter gar keinen anderen Wert als 50 zulässt:
> sein Spielraum rechnete den Zoom nicht ein. *Eine der beiden Hälften zu
> bauen und die andere für gegeben zu halten, ist derselbe Fehler wie
> Stolperstein 274 — nur andersherum.*
>
> **3. Die beiden Dialogtexte waren zu lang.** *Sie sagten dasselbe zweimal und
> erklärten nebenher, woher eine fehlende Zahl kommt.*
>
> ### ⚠ BERICHTIGT IN 0.19.2 — ZWEI ZAHLEN DIESES PAPIERS WAREN NICHT AN DIESEM GEGENSTAND GEMESSEN
>
> **In Abschnitt 0.A stehen „0,1 ms" und „0,2 ms" für die materialisierten
> Zwischenabfragen. Diese beiden Zahlen sind aus dem Auftrag übernommen und
> nicht an der echten Tabellenform nachgefahren worden.** An `photos` — wo
> `art` hinter `data`, `thumb` und `medium` steht — kostet dieselbe Form
> **1343 ms**; nur die Aufteilung nach `mime_type` (Spalte 2, vor den Blobs)
> liegt wirklich bei **7,8 ms**.
>
> **Die übrigen Zahlen des Abschnitts halten:** `length()` verliert seine
> Abkürzung im Sortierer einer Gruppierung, und `substr()` liest das Blob. *Was
> fehlte, war die zweite Ursache — nicht die erste.*
>
> **Das ist die dritte übernommene Zahl in dieser Kette, und sie ist auf
> dieselbe Weise entstanden wie die beiden, die diese Runde gestrichen hat:
> gemessen an einem anderen Gegenstand als dem, über den sie etwas sagt.**
> *Die Lehre steht als Stolperstein 280.*

**DIESE RUNDE WAR IM FELD NOCH NICHT BESTÄTIGT, als dieses Papier geschrieben
wurde.** *Nach dem Einspielen gehört ein
Blick in Systembereich → Datenbank → Kennzahlen:* steht dort ein anderer Wert als
der Fingerprint oben, liegt auf dem Wirt eine Datei, die kein Commit trägt
(Stolperstein 158). **Ein hartes Neuladen gehört davor.**

**UND DER EINE NACHWEIS, DER NUR AM WIRT ZU FÜHREN IST:** ein PNG einfügen, den
Schalter aus- und wieder einschalten und **den Umstellungslauf über die wenigen
offenen Bilder fahren** — währenddessen im Systembereich klicken. **Reagiert die
Oberfläche jetzt, war die Selbstblockade aus Abschnitt A die Ursache**, und die
gemessene Zahl gehört hierher.

**Weiter offen, unverändert:**

- **Der volle Gegenprobenlauf** über alle 472 Rückbauten — rund
  vierzig Stunden, seit neunzehn Runden ausstehend.
- **Die Aussetzer während eines Bestandslaufs sind hergeleitet erklärt und nicht
  am Wirt nachgemessen** (Abschnitt A). *0.19.2 bleibt richtig, ist aber nach
  diesem Befund die saubere Bauform und nicht die vermutete Heilung.*
- **Weitere Vorkommen von „Instanz" im Bildschirmtext.** *Der Auftrag nennt
  siebzehn Stellen namentlich, und genau die sind gebaut. Beim Nacharbeiten sind
  in `public/app.js` acht weitere sichtbare Stellen aufgefallen — Zeilen 6296,
  6366, 6437, 7636, 7817, 8094, 8707 und 8965 —, die keine Variante von „der
  Eigentümer der Instanz" sind und deshalb nicht auf der Liste standen.* **Sie
  sind absichtlich nicht mitgenommen worden:** der Auftrag zählt die Stellen
  ausdrücklich, und eine stillschweigend erweiterte Zahl wäre in dieser Runde
  der falsche Handgriff. *Sie gehören in die nächste PATCH-Runde.*
