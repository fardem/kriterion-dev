# Auftrag 0.19.1 — „Was 0.19.0 falsch gemacht hat"

**Vorher: Version 0.19.0 · Fingerprint `5fe43053` · 5055 Prüfungen · 450
Rückbauten (höchste Nummer 458) · 274 Stolpersteine · `F_ROUTEN` 70 ·
acht Zwecke der zweiten Bestätigung · acht Migrationsblöcke ·
Austauschformat 12 · achtzehn Karten im Systembereich**

> **DIESE RUNDE BAUT NICHTS NEUES.** Sie räumt auf, was die Runde davor
> hinterlassen hat — vier belegte Fehler, zwei falsche Zahlen in den eigenen
> Papieren, ein widerlegter Satz, zwei Benennungen und eine Auslieferungsfalle.
> **Alles hier ist gemessen, nicht vermutet.** Wo eine Zahl steht, steht
> daneben, woran sie gemessen wurde.

---

## 0. Was vor dem ersten Handgriff zu tun ist

1. **`git status` muss leer sein**, und der Arbeitsbranch steht fest.
2. **`npm test` einmal gegen den Ausgangsstand** — er muss **5055 von 5055**
   melden. Meldet er etwas anderes, ist der Ausgangsstand nicht der, von dem
   dieses Papier ausgeht; **dann erst klären, dann bauen.**
3. **Dieses Papier ganz lesen, bevor die erste Zeile fällt.** Mehrere Punkte
   hängen zusammen: Punkt 4 macht aus achtzehn Karten neunzehn, und Punkt 7
   benennt einen Abschnitt um, den der Prüfstand an zwei Stellen namentlich
   festhält.

---

## Die Nummer: PATCH, und der Grund steht in Abschnitt 5.1

Der Maßstab des Projekts ist nicht der Aufwand, sondern die Frage: **kann die
Installation danach etwas, was sie vorher nicht konnte?** Die Antwort ist bei
jedem der zehn Punkte **nein**. Dieselben Knöpfe, dieselben Ergebnisse — nur
richtig, schnell und richtig benannt.

**Kein Schema, keine Migration, kein neuer Zweck, keine neue Route.** Das
Austauschformat bleibt **12**, `F_ROUTEN` bleibt **70**, die Zahl der
Migrationsblöcke bleibt **acht**.

> **EINE ZAHL ÄNDERT SICH DOCH: die Karten.** Punkt 4 gibt der Bildablage eine
> eigene Kachel; aus achtzehn werden **neunzehn**. Das ist keine neue Funktion
> — es ist dieselbe Bedienung an einem eigenen Platz, weil die Karte
> „Kennzahlen" zu groß geworden ist. **Der Prüfstand hält die Achtzehn an fünf
> Stellen fest**; sie sind alle nachzuziehen, und eine davon trägt seit 0.16.0
> den Kommentar „neunzehn Karten im Systembereich" (`pruefung.js:30209`) — auch
> der gehört gelesen und berichtigt.

---

## Was gemessen wurde

**Alles in diesem Abschnitt ist nachgefahren worden**, teils an einer
verschlüsselten Datenbank in der Größenordnung der echten, teils in einem
echten Chromium, teils an der laufenden Installation. **Keine Zahl hier ist
geschätzt.** Sie stehen hier, damit die nächste Sitzung sie nicht noch einmal
erheben muss — und damit sie in die Papiere wandern können.

### A. Die Bestandskarte liest jedes Bild — bei jedem Klick

Gemessen an einer **SQLCipher-Datenbank mit 400 Zeilen à 512 kB (205 MB)**:

| Abfrage | Zeit |
|---|---|
| `COUNT(*)` allein | 0,0 ms |
| `COUNT(*), SUM(length(data))` **ohne** `GROUP BY` | **0,0 ms** |
| `COUNT(*), SUM(length(data))` **mit** `GROUP BY` | **778 ms** |
| die Abfrage aus 0.19.0 (mit `hex(substr(...))`) | **919 ms** |
| `SUM(length(hex(data)))` — liest garantiert alles, als Obergrenze | 753 ms |
| `hex(substr(data,1,8))` **ohne** `GROUP BY` | **657 ms** |
| nur Größe gruppiert, über eine **materialisierte** Zwischenabfrage | **0,1 ms** |
| `art` + `mime_type`, materialisiert | **0,2 ms** |

**Zwei Befunde, und beide widersprechen dem, was heute im Quelltext steht.**

1. **`substr()` auf einem Blob liest das Blob.** 657 ms auch ohne `GROUP BY`,
   also das 0,87-fache der Obergrenze. Der Kommentar bei `server.js:4019` sagt
   das Gegenteil: *„`hex(substr(data,1,8))` holt die ersten Bytes, ohne das Blob
   zu lesen."* **Das ist falsch.**
2. **`length()` auf einem Blob ist kostenlos — aber nur außerhalb eines
   `GROUP BY`.** SQLite liest die Länge aus dem Satzkopf; sobald die Spalte
   durch den Sortierer der Gruppierung muss, wird das Blob materialisiert. **Das
   Zusammenlegen der beiden Durchläufe hat den Fehler erst gebaut.**

**Hochgerechnet auf die echte Installation (606 MB): rund 2,7 Sekunden** — und
zwar bei **jedem** Zeichnen des Systembereichs, der sich bei **jedem
Abschnittswechsel** neu zeichnet. Im Feld gemeldet als „ca. 3 Sekunden
Ladezeit".

> **UND WÄHREND EINER UMSTELLUNG WIRD DARAUS EINE SELBSTBLOCKADE.**
> `verfolgeUmstellung()` (`public/app.js`, um Zeile 8535) fragt `/api/stats`
> **alle 1500 ms** ab, solange der Lauf läuft. **Eine Abfrage, die 2700 ms
> kostet, alle 1500 ms gestellt, lastet den Haupt-Thread zu 180 % aus** — und
> `setInterval` wartet die Antwort nicht ab, die Anfragen stapeln sich also
> zusätzlich. **Der Server beantwortet in dieser Zeit praktisch nichts mehr,
> und der Umstellungslauf selbst kommt kaum noch dran.**
>
> **Das ist die beste Erklärung für den gemeldeten Befund** — „Kriterion
> reagiert ab und an nicht, über die ganze Stunde verteilt". Sie erklärt
> zugleich, warum der Lauf **5,3 s je Bild** brauchte, wo das Kodieren nur
> ~0,35 s kostet.
>
> **SIE IST HERGELEITET UND NICHT AM WIRT NACHGEMESSEN.** Der Beleg ist
> einfach zu führen: **nach dieser Runde denselben Lauf noch einmal fahren.**
> Sind die Aussetzer weg und dauert er ein Vielfaches weniger, war es das.
> Das gehört ins Änderungsprotokoll dieser Runde, nicht als Behauptung,
> sondern als Nachtrag mit der gemessenen Zahl.

### B. Der engere Ausschnitt erreicht die Bildränder nicht

Gemessen **in echtem Chromium**, Kachel 313 × 313, `object-fit: cover`,
Zoom 250 %, Fokuspunkt jeweils in eine Ecke gesetzt. Gemessen wurde, wie viel
von der **gesuchten** Bildecke auf der Kachel zu sehen ist:

| Fokuspunkt | heute | mit `transform-origin` |
|---|---|---|
| oben-links | **0,0 %** | 30,7 % |
| oben-rechts | **0,0 %** | 30,7 % |
| unten-links | **0,0 %** | 15,4 % |
| unten-rechts | **0,0 %** | 15,4 % |

**Von der gewählten Ecke ist heute kein einziger Bildpunkt zu sehen**, in keiner
der vier Richtungen. Der Grund: `ausschnitt()` liefert `object-position` und
`--zoom`, **aber kein `transform-origin`** — `scale()` vergrößert also um die
Mitte. Was man sieht, ist erst der `object-position`-Ausschnitt und *davon*
nochmal der mittige Teil. Je enger man zieht, desto weiter sind die Ränder weg.

### C. Ein Dialog aus dem Vollbild heraus liegt dahinter

```
.backdrop  { … z-index:  60; … }   jeder Bestätigungsdialog (app.js, sechs Stellen)
.lightbox  { … z-index:  90; … }   das Vollbild
```

Im Feld gemeldet: Löschen im Vollbild sieht aus, als reagiere nichts; die
Rückfrage steht erst da, wenn man das Vollbild schließt. **Betrifft jeden
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

Das wären **4,5 Minuten** für 679 Bilder. Die Feldmaschine ist also rund
**dreizehnmal langsamer je Bild** — eine Zahl, die **kein Server vorher kennen
kann**. Daraus folgt für Punkt 5: **keine erfundene Minutenangabe am Knopf.**

**Und der naheliegende Verdacht ist ausgeschlossen:** an der Installation
gemessen ist `sharp.concurrency()` bereits **1**, der Container ist
**unbeschränkt** (`NanoCpus=0 Quota=0/0 Cpuset= Memory=0`) und hat vier Kerne.
libvips nimmt sich also **nicht** die Maschine. Auch hier meldet sharp 0.35.3
unter glibc 2.39 die Vorgabe **1**.

> **ZWEI VERDÄCHTIGE SIND AUSGESCHLOSSEN, und beide durch eine Messung am
> Wirt selbst.**
>
> * **Die CPU nicht:** `sharp.concurrency()` steht dort schon auf **1**, der
>   Container ist unbeschränkt und hat vier Kerne. libvips nimmt sich die
>   Maschine also nicht.
> * **Die Platte nicht:** `fsync` über 4 MB kostet dort **6 ms im Median, 7 ms
>   im schlimmsten Fall** — eine SSD. 679 Checkpoints ergeben fünf Sekunden auf
>   die ganze Stunde.
>
> **Übrig bleibt die Selbstblockade aus Abschnitt A**, und die behebt **Punkt 1
> dieser Runde**. *0.19.2 („Bestandsläufe verlassen den Anfrageweg") bleibt
> trotzdem richtig — ein Bestandslauf hat im Anfrageweg nichts verloren, gleich
> wer ihn gerade ausbremst —, ist aber nach diesem Befund **nicht mehr die
> vermutete Heilung**, sondern die saubere Bauform.*

### E. Die Vorhersage von 0.19.0 hat gehalten

Vorhergesagt waren **161,9 MB**; tatsächlich belegen die umgestellten Bilder
435,7 − 272,1 = **163,6 MB**. **Abweichung 1,0 %.** Das gehört als Feldbeleg in
die Papiere — eine Messung, die sich bestätigt, ist genauso berichtenswert wie
eine, die sich nicht bestätigt.

### F. Rückbau 433 ist widerlegt

Nach dem Lauf steht in `bildFormate` **kein `png` mehr** — 679 von 679
umgestellt, **keines geblieben**. Dazu achtzehn Laborversuche (neun in 0.19.0,
neun danach: Palette 8 und 256 Farben, reiner Text, Graustufen, Alpha, 1×1,
Flächen): **PNG gewinnt nie über die Größe.** Der einzige Fall, in dem PNG
liegen bleibt, ist der, in dem WebP **nicht kann** — über 16383 Bildpunkte je
Kante, und der ist als Rückbau 458 gebaut und geprüft.

**Der Satz *„Der Fall kommt am echten Bestand vor"* stammt aus dem Auftrag zu
0.19.0 und nicht aus einer Messung.** Er ist zu berichtigen (Punkt 9).

---

## 1. Die Bestandskarte fragt wieder schnell

> **DIESER PUNKT IST GRÖSSER, ALS ER AUSSIEHT.** Er behebt nicht nur die
> Ladezeit im Systembereich, sondern aller Voraussicht nach auch die
> **Aussetzer während der Umstellung**: die Fortschrittsanzeige fragt dieselbe
> Abfrage alle 1,5 s ab, die 2,7 s kostet (Abschnitt A). **Wird sie billig,
> löst sich beides auf einmal.**

### GEBAUT WIRD

Die Abfrage in `GET /api/stats` (`server.js`, um Zeile 4030) wird zerlegt:

* **Die Aufteilung nach `art`** — `photoCount`, `photoBytes`, `videoCount`,
  `videoBytes` — kommt über eine **materialisierte Zwischenabfrage**, damit
  `length(data)` seine Abkürzung behält:

  ```sql
  WITH x AS MATERIALIZED (SELECT art AS a, length(data) AS o FROM photos)
  SELECT a, COUNT(*) AS n, COALESCE(SUM(o),0) AS o FROM x GROUP BY 1
  ```

  **Gemessen 0,1 ms.** Ein Durchgang bleibt ein Durchgang — die Zusammenlegung
  aus 0.19.0 war richtig gedacht und nur falsch gebaut.

* **Die Aufteilung nach Format** (`bildFormate`) kommt aus **`mime_type`**
  statt aus dem Inhalt. Gemessen **0,2 ms** gegen **919 ms**.

### Die Entscheidung, und sie ist hier getroffen

**0.19.0 hat ausdrücklich anders entschieden:** *„erkannt wird am Inhalt, nicht
an `mime_type` — die Spalte ist eine Angabe des Hochladenden."* **Dieser Satz
bleibt richtig, wo er hingehört: am Upload.** `legeBildAb()` sieht weiter in die
ersten acht Bytes und glaubt dem gemeldeten Typ nicht.

**Er wird für eine Kennzahl auf einer Karte aufgehoben**, und der Grund ist eine
Abwägung, keine Bequemlichkeit: 2,7 Sekunden bei **jedem** Klick gegen die
Möglichkeit, dass eine Zeile falsch gezählt wird, weil jemand beim Hochladen
einen falschen Typ gemeldet hat. **Und der Knopf bleibt davon unberührt:**
`qOffenePNG` sucht weiter am Inhalt (`hex(substr(data,1,8))`), läuft aber nur
auf Verlangen. **Die Karte kann sich also verzählen, der Knopf nie das Falsche
tun.**

**Was aufgehoben wurde, gehört mit dem Grund hingeschrieben — nicht gelöscht**
(Stolperstein 201). Der Kommentar an der Abfrage sagt beides: warum es einmal
anders war und warum es jetzt so ist.

### Die Formatzeile auf der Karte

`mime_type` liefert `image/webp`, `image/jpeg`, … — die Karte zeigt weiter
`WebP`, `JPEG`, `GIF`, `PNG`. **Die Zuordnung steht an EINER Stelle**, nicht je
einmal im Server und in der Oberfläche.

---

## 2. Der engere Ausschnitt erreicht die Bildränder

### GEBAUT WIRD

`ausschnitt(p)` in `public/app.js` liefert zusätzlich **`transform-origin`** auf
denselben Punkt wie `object-position`:

```
object-position:X% Y%;transform-origin:X% Y%;--zoom:F
```

**Gerechnet wird weiter im Stilblatt** und nicht inline — Stolperstein 272 gilt
unverändert: ein Inline-`transform` schlüge die Überfahrregel. `transform-origin`
ist kein `transform` und darf deshalb mit hinaus.

### Was dabei zu prüfen ist

* **Die vier Ecken sind erreichbar** — der Beleg aus Abschnitt B ist am
  Prüfstand nicht nachstellbar (jsdom rechnet keine Lage aus, Stolperstein 223).
  **Geprüft wird deshalb am Text:** `ausschnitt()` liefert `transform-origin`
  mit demselben Wertepaar wie `object-position`, und das Stilblatt rechnet es
  ein. **Die Wirkung steht als Messung in den Papieren, nicht als Prüfung** —
  dieselbe Haltung wie bei den Lagezahlen aus 0.18.1.
* **Die Überfahrvergrößerung nimmt den Ausschnitt weiter mit** — die vier
  Zusagen aus 0.19.0 („Das Stilblatt rechnet den Ausschnitt an der Kachel ein"
  und die drei daneben) bleiben grün. Sie sind erst nachgetragen worden, weil
  Rückbau 453 stumm blieb; **sie dürfen dabei nicht wieder verlorengehen.**

---

## 3. Ein Dialog aus dem Vollbild heraus ist zu sehen

### GEBAUT WIRD

Die Stapelordnung wird **einmal ganz aufgeschrieben und festgenagelt**, statt
eine Zahl hochzusetzen. Heute im Stilblatt verstreut:

```
.lb-nav     4      .vzoom      3      .backdrop  60      .lightbox  90      .toast  120
```

**Der Dialog gehört über das Vollbild.** Wie die Ordnung danach aussieht,
entscheidet die bauende Sitzung — **aber sie steht danach an einer Stelle
beieinander, mit einem Satz je Ebene, warum sie dort liegt.** Eine Prüfung hält
die Reihenfolge fest, damit die nächste Kachel sie nicht wieder aufmacht.

### Was dabei nicht passieren darf

Der Schleier des Ausschnittrahmens (`box-shadow` mit 9999 px) und der Schieber
`.vzoom` liegen **innerhalb** des Vollbilds und müssen ihre Verhältnisse
zueinander behalten. **Die Ordnung wird sortiert, nicht durcheinandergeworfen.**

---

## 4. Die Bildablage bekommt eine eigene Kachel

### GEBAUT WIRD

Der Abschnitt „Bildablage" verlässt die Karte „Kennzahlen" und wird eine eigene
Karte im Abschnitt **Datenbank**. Damit sind es **neunzehn** Karten.

**Warum sie in 0.19.0 in „Kennzahlen" saß:** dort stand ausdrücklich „es bleibt
bei achtzehn Karten", und der Abschnitt war zwei Zeilen und ein Schalter groß.
Inzwischen trägt er zwei Formatzeilen, einen Schalter mit Erläuterung, einen
Knopf, eine Fortschrittszeile und eine Meldung — **die Karte ist zu groß
geworden, und das ist im Feld aufgefallen.**

### Was nachzuziehen ist

* `ALLE_KARTEN` und die Zuordnung zum Abschnitt in `public/app.js`
* **Fünf Zusagen im Prüfstand nennen die Achtzehn namentlich** —
  `pruefung.js:25681`, `25685`, `25797`, `26628`, `28758`
* Der Kommentar bei `pruefung.js:30209` („neunzehn Karten im Systembereich")
  stammt aus 0.16.0 und ist **zu lesen, bevor er berichtigt wird** — er könnte
  einen Grund tragen, der heute noch gilt
* Die Kartenzahl in Projektstand und README

---

## 5. Der Knopf sagt vorher, dass es dauert

### GEBAUT WIRD

Der Dialog der zweiten Bestätigung vor „Alle PNG nach WebP umstellen" nennt
**zusätzlich zur Menge auch die Dauer** — und zwar **ohne Zahl**:

> *„679 Bilder. Wie lange das dauert, hängt an dieser Maschine und ist hier
> nicht gemessen — rechne mit Minuten bis Stunden. Der Lauf stört den Betrieb,
> solange er läuft."*

### Warum keine Zahl

Weil der Server sie nicht kennt. **Gemessen: 394 ms je Bild hier gegen 5,3 s im
Feld — Faktor dreizehn.** Eine Schätzung wäre auf der einen Maschine
beruhigend falsch und auf der anderen erschreckend falsch. **Wenn eine Zahl
fehlt, steht das ausdrücklich da** (Stolperstein 252).

### Was ausdrücklich NICHT gebaut wird

**Keine Restlaufzeit in der Fortschrittszeile.** Sie wäre aus dem gemessenen
Takt zwar ehrlich zu rechnen — aber wenn der Satz oben seine Arbeit tut,
braucht es sie nicht, und sie kostet eine Anzeige, die bei jedem Umlauf
springt.

---

## 6. Die Fadenzahl von sharp wird ausdrücklich gesetzt

### GEBAUT WIRD

```js
sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));
```

### Und die Ehrlichkeit gehört dazu

**Auf der Installation, die den Befund gemeldet hat, ändert diese Zeile nichts**
— dort steht die Vorgabe schon auf 1. Sie steht hier, weil sharp seine Vorgabe
**vom Abbild abhängig macht**: unter glibc ohne jemalloc ist sie 1, unter musl
oder mit jemalloc kann sie die Kernzahl sein. **Wer Kriterion auf einer fremden
Maschine betreibt, bekommt sonst einen Wartungslauf, der sich die ganze
Maschine nimmt.**

**In den Papieren steht diese Einschränkung dabei.** Eine Zeile, der man eine
Wirkung zuschreibt, die sie im gemessenen Fall nicht hat, ist eine zweite
Unwahrheit — und diese Runde räumt gerade zwei davon weg.

> **UND `os.cpus()` IST IM CONTAINER NICHT DIE WAHRHEIT ÜBER DAS KONTINGENT.**
> Es meldet die Kerne des **Wirts**, nicht das, was dem Container zugeteilt ist.
> Wer den Container auf eine CPU begrenzt, bekommt trotzdem die halbe Kernzahl
> des Wirts. **Das gehört als Satz daneben**, und ob daraus mehr wird, ist eine
> Frage für 0.19.2.

---

## 7. „Instanz" heißt „Installation"

### GEBAUT WIRD

* **Der fünfte Abschnitt des Systembereichs** heißt **„Installation"**.
  *Einwortig wie seine vier Nachbarn (Persönlich · Bestand · Zugänge ·
  Datenbank); „Kriterion Installation" stünde quer in der Reihe, zumal überall
  daneben schon Kriterion draufsteht.*
* **Siebzehn Stellen im Bildschirmtext** — überwiegend Varianten von *„der
  Eigentümer der Instanz"* in `server.js` (103, 106, 866, 1001, 1002),
  `auth.js` (397, 411, 476) und `public/app.js` (263, 5912, 6307, 7149, 7236,
  7237, 7814, 8296, 8665) — heißen künftig **„dieser Installation"**.

### Warum nicht „von Kriterion"

Weil **`title_app` einstellbar ist**. Wer seine Anlage „Produktkatalog" nennt,
liest sonst eine Meldung über „Kriterion" und muss erst überlegen, was gemeint
ist. **Der Produktname steht dort, wo das Produkt gemeint ist** (README,
Papiere); **die neutrale Form dort, wo die konkrete Anlage gemeint ist**
(Meldungen).

### DIE FALLE, und sie ist der eigentliche Grund für die Länge dieses Punktes

```js
const SYS_ALTE_ABSCHNITTE = { anlage: 'instanz' };
```

**Dieser Abschnitt ist schon einmal umbenannt worden** — bis 0.17.0 hieß er
„Anlage". Alte Adressen werden still übersetzt, damit ein Lesezeichen nicht ins
Leere führt; der Kommentar dort sagt voraus, was jetzt ansteht: *„käme je ein
zweiter alter Name dazu, steht er als Zeile daneben und nicht als zweites
`if`."*

**Die Tafel wird EINMAL nachgeschlagen und nicht verkettet.** Sie muss also
lauten:

```js
{ anlage: 'installation', instanz: 'installation' }
```

und **nicht** `{ anlage: 'instanz', instanz: 'installation' }` — sonst landet
`#/system/anlage` bei einem Schlüssel, den es nicht mehr gibt. **Beide alten
Adressen bekommen eine Prüfung.**

### Was ausdrücklich NICHT angefasst wird

**Die rund 150 Vorkommen in Kommentaren** (`server.js` 48, `public/app.js` 57,
`public/style.css` 31). Das ist Binnensprache unter Entwicklern; ein Rundumschlag
brächte einen riesigen Diff und niemandem einen Gewinn. **Die README dagegen
schon** — die liest der Betreiber.

**Diese Entscheidung gehört hingeschrieben**, sonst „berichtigt" es beim
nächsten Mal jemand doch.

---

## 8. Die Compose-Datei wird nicht mehr überschrieben

### Der Befund

```
.env.example          im Repo    .env               in .gitignore   → sauber
docker-compose.yml    im Repo    docker-compose.yml NICHT ignoriert → wird überschrieben
```

Wer das ZIP von GitHub über seinen Ordner entpackt, verliert seine angepasste
`docker-compose.yml`. **Im Feld passiert.**

### GEBAUT WIRD — genau das Muster, das `.env` schon hat

* `docker-compose.yml` → **`docker-compose.example.yml`**
* `docker-compose.yml` in die `.gitignore`
* **README:** ein Pflichtschritt in derselben Form wie bei `.env`
  (`cp docker-compose.example.yml docker-compose.yml`), mit demselben
  ausdrücklichen Satz, dass er Pflicht ist — die Vorlage steht bei Zeile 107.

**Der Stopp kommt geschenkt:** ohne Compose-Datei bricht `docker compose up` von
sich aus ab („no configuration file provided: not found"). Karg, aber es hält
an. **Ein zusätzliches Startskript wird ausdrücklich nicht gebaut** — neue
Maschinerie für wenig Gewinn, und die README fängt es ab.

### In den CHANGELOG-Kasten

Wer per `git pull` aktualisiert, sieht seine `docker-compose.yml` danach als
**unverfolgte Datei**. Wer das ZIP entpackt, **behält** sie — genau das ist der
Zweck. **Beides gehört in den Kasten.**

---

## 9. Drei Berichtigungen in den eigenen Papieren

**Nicht verhandelbar.** Es stehen zwei falsche Messungen und ein widerlegter
Satz im Quelltext und im Änderungsprotokoll — das ist die Sorte Fehler, gegen
die dieses Projekt gebaut ist.

### a) Die Behauptung über `substr`

`server.js:4019`: *„`hex(substr(data,1,8))` holt die ersten Bytes, ohne das Blob
zu lesen."* **Falsch, gemessen 657 ms.** Die Berichtigung nennt die Zahl und
den Grund.

### b) Die Messung, die es nicht gegeben haben kann

`server.js:4006–4017` und `Doku/Aenderungsprotokoll_0.19.0.md:405–415`:

| | kalt | warm |
|---|---|---|
| zwei getrennte Durchläufe | 6.566 ms | 4.230 ms |
| ein `GROUP BY` | 3.235 ms | 2.990 ms |

Angeblich gemessen an „einer Datenbank in der Größe der echten (679 PNG,
344 JPEG, 9 WebP, 606 MB)". **Eine Datenbank mit 606 MB Bilddaten beantwortet
diese Abfrage nicht in drei Millisekunden** — nachgemessen sind es bei 205 MB
schon 919 ms. **Die Zahl ist zu streichen und durch die nachgefahrene Messung
zu ersetzen**, mit einem Satz dazu, dass die alte falsch war und woran das
gelegen haben dürfte.

### c) Der Satz zu Rückbau 433

`Doku/Aenderungsprotokoll_0.19.0.md:604` und `gegenprobe.js:3835`: *„Der Fall
kommt am echten Bestand vor, lässt sich mit erzeugtem Material aber nicht
herstellen."* **Der erste Halbsatz ist widerlegt** (Abschnitt F).

**Der Rückbau bleibt und bleibt als STUMM erwartet** — er bewacht das
Vorhandensein der Regel, auch wo er ihre Wirkung nicht zeigen kann. **Nur seine
Begründung wird berichtigt:** achtzehn Versuche, kein Gegenbeispiel, und am
echten Bestand 679 von 679 umgestellt.

> **UND DER FELDBELEG ZU 0.19.0 GEHÖRT DANEBEN:** vorhergesagt 161,9 MB,
> tatsächlich 163,6 MB, **Abweichung 1,0 %.** Eine Messung, die sich bestätigt,
> ist so berichtenswert wie eine, die es nicht tut.

---

## 10. `Faden` → `Thread` in der Sprachliste

Der Sprachwächter führt zwölf Übersetzungen. **Er bekommt eine dreizehnte**:

```js
['Faden', 'Thread'],
```

*Der Maßstab ist das Wort, das ein deutschsprachiger Entwickler im Gespräch
benutzen würde — und das ist Thread.* Die Liste ist ausdrücklich kurz zu halten;
dieser Eintrag kommt hinein, weil das Wort in dieser Runde tatsächlich gefallen
ist und weil 0.19.2 voll davon sein wird.

**Vorher prüfen, ob `Faden` schon irgendwo im Quelltext steht** — dann wird es
mit demselben Handgriff berichtigt.

---

## Was ausdrücklich NICHT gebaut wird

**a) DIE PAUSE AN DIE ARBEIT BINDEN.** Erwogen und **verworfen**: sie halbiert
die Dichte der Blockade, nicht die Blockade. Wer während der fünf Sekunden
klickt, wartet fünf Sekunden. **Die 30 ms bleiben, wie sie sind.**

**b) `reclaim()` STÜCKWEISE.** **Ausgeschlossen, nicht weggelassen:**
`reclaim()` läuft einmal nach der Schleife; die gemeldeten Aussetzer waren über
die ganze Stunde verteilt. Wären sie davon gekommen, hätten sie am Ende sitzen
müssen.

**c) NIEDRIGE PRIORITÄT (`nice`).** `os.setPriority` gibt es und es wirkt — nur
auf den **ganzen Prozess**. Der Server würde mitverlangsamt. Und ein blockierter
Thread bleibt blockiert, gleich welcher Priorität.

**d) DER LAUF IM EIGENEN THREAD.** Das ist die richtige Lösung des Aussetzers
und **die Runde 0.19.2**. Belegt machbar: `better-sqlite3-multiple-ciphers`
beschreibt die verschlüsselte Datei aus einem Worker-Thread heraus anstandslos,
die Verzögerung des Haupt-Threads fiel von 126 auf 38 ms, die Dauer blieb
gleich. **Sie braucht einen eigenen Auftrag** — ein zweiter Schreiber auf einer
WAL-Datei ist heikel.

**e) DIE ABLEITUNGEN.** `thumb` ist 400 px auf der **langen** Kante, die Kachel
ist quadratisch und fordert die **kurze** — ein 16:9-Bildschirmfoto wird
deshalb immer 1,39× hochgerechnet, auf einem 2×-Bildschirm 2,78×, mit Zoom 250 %
3,48×. **Das ist 0.19.3**, weil es die Ableitungsregel ändert **und** 1034
Thumbs neu berechnen muss — und weil dieser Lauf von 0.19.2 profitiert.
*Ob die Ableitungen dabei auch das Format wechseln, gehört NICHT dorthin,
sondern zu der Runde, die über Verfahren entscheidet, und beides zusammen
ist ein Durchgang statt zwei.*

**f) DIE WÄHLBARE BILDABLAGE.** PNG / WebP verlustfrei / WebP verlustbehaftet
zur Wahl — **eine Funktion, also MINOR.** Steht als 0.21.0 im Fahrplan.

---

## Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere. Der
  Sprachwächter läuft mit.
* **Keine neue Abhängigkeit.**
* **Keine Binärdateien im Repo.**
* **Keine Tags.**
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt.**
  *Diese Runde räumt zwei Zahlen weg, die es nicht waren — sie ist der denkbar
  schlechteste Ort, um eine dritte hinzuzufügen.*
* **Neue Stolpersteine ab 275.** Kandidaten aus dem Befund, die Nummerierung
  entscheidet die bauende Sitzung:
  - *`length()` auf einem Blob ist kostenlos, aber nicht im `GROUP BY`* — und
    `substr()` war es nie.
  - *Eine Messung, die um Größenordnungen zu gut aussieht, ist keine Messung.*
    Die 3,235 ms hätten auffallen müssen.
  - *`transform: scale()` ohne `transform-origin` sperrt die Ränder aus* — die
    Vergrößerung verankert sonst in der Mitte, und der eingestellte Punkt kommt
    nie an den Rand.
  - *Im Container meldet `os.cpus()` den Wirt, nicht das Kontingent.*
* **Neue Rückbauten ab 459**, für jeden gebauten Punkt mindestens einer.
  **Ein Rückbau, der den Lauf abreißt, belegt nichts** (Stolperstein 161) —
  jede neue Zusage fasst ihre Felder durch eine Klammer.
* **Rückbau 233 und die anderen mitgehen lassen, nicht löschen**
  (Stolperstein 201), wo ihr Suchtext sich durch diese Runde verschiebt.
* **Der Prüfstand wächst von 5055 aus**, die Rückbauliste von 450 (höchste
  Nummer 458).

### Was aus den letzten Runden mitzunehmen ist

* **Vor dem Nummerieren wird gezählt, nicht geblättert** (Stolperstein 168).
* **Ein stummer Rückbau ist ein Fund und keine Formalie.** In 0.19.0 war es
  Nummer 453, und dahinter steckte eine echte Lücke im Prüfstand.
* **Was aufgehoben wird, wird mit dem Grund hingeschrieben und nicht gelöscht**
  (Stolperstein 201). Betrifft in dieser Runde Punkt 1 und Punkt 9.
* **Zwei Tabellen über dieselbe Sache dürfen sich nicht widersprechen**
  (Stolperstein 47).

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen.**
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: **`git status` muss leer
  sein**, und **`npm test` läuft ein letztes Mal gegen genau diesen Stand.**
  **Und danach kein Prüflauf mehr, den du abbrichst.**
* **`Doku/Aenderungsprotokoll_0.19.1.md`** liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, die Entscheidungen mit ihrer Begründung,
  neue Stolpersteine (**ab 275**), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (**vorher: 5055**),
  Rückbauten vorher/nachher (**vorher: 450, höchste Nummer 458**),
  Offengebliebenes.
* Die Zeile „0.19.1 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.** Kein
  Migrationsblock, keine Schemaänderung, das Austauschformat bleibt 12.
  **Gesichert werden muss vor dem Einspielen nichts** — außer dem, was Punkt 8
  über die Compose-Datei sagt.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im
  Chat, nicht in den Dokumenten.** Darunter: **den Systembereich durchklicken**
  *(die Abschnitte kommen sofort, nicht nach Sekunden)*, **einen Ausschnitt auf
  eine Bildecke ziehen** *(die Ecke ist zu sehen)*, **im Vollbild ein Bild
  löschen** *(die Rückfrage steht davor)*, **`#/system/anlage` und
  `#/system/instanz` aufrufen** *(beide landen bei „Installation")*, **die
  Kachel „Bildablage" suchen** *(sie steht für sich, nicht mehr in den
  Kennzahlen)* und **den Umstellungsknopf drücken, ohne zu bestätigen** *(der
  Dialog sagt, dass es dauern kann)*.
* **UND DER EINE NACHWEIS, DER NUR AM WIRT ZU FÜHREN IST:** ein PNG einfügen,
  den Schalter aus- und wieder einschalten und **den Umstellungslauf über die
  wenigen offenen Bilder fahren** — währenddessen im Systembereich klicken.
  **Reagiert die Oberfläche jetzt, war die Selbstblockade aus Abschnitt A die
  Ursache**, und die Zahl gehört ins Änderungsprotokoll.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_19_1`), und **alle
  Verweise sind nachzuziehen.** Kopf, Betriebsstand, Stolpersteine, Prüfstand,
  Versionsgeschichte, **Fahrplan** — und die **Kartenzahl: achtzehn wird
  neunzehn.**

* **DER FAHRPLAN IST NACHZUTRAGEN — er steht bisher nirgends.** Abschnitt 10
  kennt weder 0.19.1 noch das, was danach kommt. Einzutragen sind:

  | Version | Name | Art |
  |---|---|---|
  | **0.19.1** | Was 0.19.0 falsch gemacht hat *(diese Runde)* | PATCH |
  | **0.19.2** | Bestandsläufe verlassen den Anfrageweg | PATCH |
  | **0.19.3** | Die Kachel zeigt, was das Original hergibt — thumb-Geometrie und Neuableitung | PATCH |
  | **0.20.0** | Die Oberfläche wird ruhiger — **dazu neu: den Ausschnitt als Rechteck aufziehen** *(Nummer unverändert)* | MINOR |
  | **0.21.0** | **Die wählbare Bildablage** *(neu)* — PNG / WebP verlustfrei / WebP verlustbehaftet zur Wahl; wird PNG abgewählt, bietet die Kachel die Umstellung an. **Und die Ableitungen gehen im selben Durchgang auf WebP** *(Sammelblatt Punkt 5)* | MINOR |
  | **0.22.0** | Bereinigung — der Bruch *(war 0.21.0)* | MINOR, Schema |
  | **0.22.x** | Die Kommentare werden knapp *(war 0.21.x)* | PATCH |
  | **0.23.0** | **Mehrsprachigkeit** *(neu, nur eingetragen)* — Sprachdateien `de`, `en`, `tr` und weitere; alles Sichtbare verlässt den Quelltext | MINOR |
  | **0.30.0** | **Code-Effizienz** *(neu, nur eingetragen)* — Leichen und ineffizienten Code durchgehen. Bauen mit Claude Fable 5.1 + ultracode, die Projektbesprechung mit Opus 5 + ultracode | offen |

  **DIE REIHENFOLGE IST NICHT BELIEBIG, und die Gründe gehören mit eingetragen:**

  * **0.19.2 steht vor jeder Runde mit einem Bestandslauf.** Sonst legt jede
    einzelne davon die Installation wieder für Stunden lahm — 0.19.3 und
    0.20.0 fahren beide über alle 1034 Bilder.
  * **0.19.3 bleibt trotzdem früh**, weil eine unscharfe Kachel jeden Tag zu
    sehen ist, während die wählbare Ablage eine Bequemlichkeit ist. Nach
    0.19.2 kostet ihr Lauf niemanden mehr etwas.
  * **Die Ableitungen auf WebP wandern in die Runde der wählbaren Ablage
    statt in 0.19.3** — dort wird
    ohnehin über Verfahren entschieden, und beides zusammen ist **ein**
    Durchgang über den Bestand statt zwei. *Die thumb-GEOMETRIE gehört
    dagegen nicht dorthin: sie ist ein Fehler und hängt an keinem Verfahren.*
  * **Die Mehrsprachigkeit kommt nach der Oberfläche und nach der
    Bereinigung.** Wer Texte herauszieht, die gleich darauf umbenannt oder
    ganz gelöscht werden, zieht sie zweimal heraus.
  * **Die Bereinigung kommt vor Mehrsprachigkeit und Code-Effizienz**, damit
    keine der beiden toten Code mitschleppt.

  > **DIE BEREINIGUNG RÜCKT ZUM SECHSTEN MAL**, und der Grund gehört
  > danebengeschrieben: die wählbare Bildablage bringt eine Funktion und ist
  > damit MINOR. **Sie ist nicht verschoben worden, weil jemand sie später
  > wollte — ihre Nummer war vorgemerkt und nicht vergeben.**

* **Sammelblatt:** zwei neue Punkte — **die verlustbehaftete Ablage für Fotos
  aus der Zwischenablage** *(gemessen: 5,21 MB JPEG → 34,79 MB PNG aus der
  Zwischenablage → 20,42 MB nearLossless; verlustbehaftet q90 wären 6,64 MB bei
  67 % Ersparnis — und bei einem Bildschirmfoto wäre verlustbehaftet
  **siebenmal größer**, weshalb es eine Wahl braucht und keine Regel)* und
  **die Ableitungen, die zu klein gerechnet werden** *(Verweis auf 0.19.3)*.

* **Die README** bekommt den Compose-Pflichtschritt (Punkt 8), die neue
  Kartenzahl und „Installation" statt „Instanz".

* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2: **eine Zeile je
  Änderung**, die Abschnittsnamen vor der Zeile — **mit Kasten**, wegen der
  Compose-Datei.

* **DAS KONZEPTPAPIER UND DAS VIDEOPAPIER WERDEN NICHT ANGEFASST.**

* **`Doku/Auftrag_0.19.0.md` fällt mit diesem Auftrag weg** — *es liegt immer
  nur einer im Repo, und was 0.19.0 gebracht hat, steht in seinem
  Änderungsprotokoll.* **Dieser hier fällt weg, wenn der nächste geschrieben
  wird.**

### Der Fahrplan steht anderswo, und das mit Absicht

> **DER PLAN STEHT IM PROJEKTSTAND, ABSCHNITT 10 — und sonst nirgends.** Ein
> Auftrag ist kein Ort für den Fahrplan: er wird beim Schreiben des nächsten
> weggeworfen, und was darin stand, wäre dann weg. **Die Tabelle oben ist eine
> Anweisung, sie DORT einzutragen — nicht der Fahrplan selbst.**
