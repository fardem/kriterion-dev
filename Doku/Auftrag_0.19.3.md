# Auftrag 0.19.3 — „Bestandsläufe verlassen den Anfrageweg"

**Vorher: Version 0.19.2 · Fingerprint `0cdc709d` · 5108 Prüfungen · 481
Rückbauten (höchste Nummer 490) · 281 Stolpersteine · `F_ROUTEN` 70 ·
acht Zwecke der zweiten Bestätigung · acht Migrationsblöcke ·
Austauschformat 12 · neunzehn Karten im Systembereich**

> **DIESE RUNDE BAUT NICHTS NEUES.** Sie nimmt zwei Arbeiten aus dem
> Anfrageweg heraus: den Bestandslauf, der heute den Haupt-Thread anhält, und
> die Übersichtsschleife, die je Eintrag fünfmal einzeln fragt und dabei holt,
> was niemand ansieht. **Alles hier ist heute gemessen, nicht vermutet** — und
> wo eine Zahl steht, steht daneben, woran sie gemessen wurde.

---

## 0. Was vor dem ersten Handgriff zu tun ist

1. **`git status` muss leer sein**, und der Arbeitsbranch steht fest.
2. **`npm test` einmal gegen den Ausgangsstand** — er muss **5108 von 5108**
   melden. Meldet er etwas anderes, ist der Ausgangsstand nicht der, von dem
   dieses Papier ausgeht; **dann erst klären, dann bauen.**
3. **Dieses Papier ganz lesen, bevor die erste Zeile fällt.** Punkt 1 und
   Punkt 2 sind unabhängig, Punkt 2 und Punkt 3 fassen dieselbe Schleife an —
   wer sie einzeln baut, baut sie zweimal.

> **UND EINE SACHE VORWEG, DIE KEIN BAUPUNKT IST.** Auf dem Wirt läuft
> **`f4f8a479`**. Das ist 0.19.2 **ohne ihre zweite Hälfte**: der deckende
> Index `idx_photos_kachel` und die eine Fotoabfrage der Übersicht sind erst
> in `0cdc709d` dazugekommen. **Vor dieser Runde gehört `0cdc709d`
> eingespielt und der Fingerprint bestätigt** — sonst trägt der nächste
> Feldbeleg zwei Runden zugleich, und wenn dann etwas klemmt, ist nicht mehr
> zu sagen, welche es war.

---

## Die Nummer: PATCH, und der Grund steht in Abschnitt 5.1

Der Maßstab ist nicht der Aufwand, sondern die Frage: **kann die Installation
danach etwas, was sie vorher nicht konnte?** Die Antwort ist bei allen vier
Punkten **nein**. Dieselben Knöpfe, dieselben Zahlen — nur ohne die Wartezeit.

**Kein Schema, keine Migration, kein neuer Zweck, keine neue Route.** Das
Austauschformat bleibt **12**, `F_ROUTEN` bleibt **70**, die Zahl der
Migrationsblöcke bleibt **acht**, die Kartenzahl bleibt **neunzehn**.

> **EINE SACHE ÄNDERT SICH DOCH, und sie gehört ausgesprochen: die Antwort von
> `GET /api/items` wird SCHMALER.** Punkt 3 nimmt drei Felder heraus, die die
> Übersicht nie liest. **Das ist eine Wegnahme an einer öffentlichen Antwort**
> — vor 1.0.0 erlaubt, aber nicht nebenbei: Abschnitt 5 des Projektstands
> beschreibt diese Antwort, und er ist mit nachzuziehen. *Was genau
> herausfällt und warum es niemand vermisst, steht bei Punkt 3.*

---

## Was gemessen wurde

**Alles in diesem Abschnitt ist am 2. September 2026 nachgefahren worden**, an
einer **SQLCipher-Datenbank mit 400 Einträgen, 400 Fotos à 512 kB (312 MB),
1200 Schlagwortbindungen, 400 Links, 100 Anhängen, 1200 Bewertungen und 1200
Testtagen**, auf Node 22 mit vier Kernen. **Keine Zahl hier ist geschätzt oder
aus einem älteren Papier übernommen.**

> **DIE TABELLEN WAREN BIS HEUTE LEER, und das ist der Grund für Abschnitt G.**
> Was 0.19.2 an dieser Datenbank über die Übersichtsschleife gemessen hat, war
> der Leerlauf von Abfragen, die nichts finden. Erst mit Inhalt zeigt sich,
> was sie kosten — und welche überhaupt die teuerste ist.

### A. Der Bestandslauf hält den Haupt-Thread an, der Thread nicht

Gemessen als **Verspätung eines Taktgebers, der alle 20 ms schlagen soll**,
während 60 Fotozeilen à 512 kB gelesen und zurückgeschrieben werden — mit den
30 ms Pause dazwischen, die der Lauf heute schon einlegt:

| Lauf | Median | 95 % | größte Verspätung |
|---|---|---|---|
| ohne Last | 0,7 ms | 1,1 ms | 20,0 ms |
| **im Haupt-Thread, so wie heute** | 0,9 ms | **133,0 ms** | **200,1 ms** |
| **im eigenen Thread** | 0,5 ms | **0,9 ms** | **1,3 ms** |

**Der Median sagt nichts, das 95. Perzentil sagt alles.** Zwischen den Zeilen
ist der Haupt-Thread frei — beim Lesen und Schreiben einer halben Megabyte
Blob steht er. Im Thread liegt die Verspätung **unter dem Rauschen des
Leerlaufs**.

**Und der Thread hat wirklich geschrieben:** 60 Zeilen, 30 MB gelesen und
zurückgeschrieben, **0 Abweisungen**, 2,3 s. `better-sqlite3-multiple-ciphers`
öffnet die verschlüsselte Datei aus einem Worker-Thread heraus und beschreibt
sie. *Verbindungsaufbau im Thread: 19 ms. `sharp` lädt dort in 76 ms und
wandelt um.*

> **DIE ZAHL AUS DEM AUFTRAG 0.19.1 WIRD NICHT ÜBERNOMMEN.** Dort stand „die
> Verzögerung des Haupt-Threads fiel von 126 auf 38 ms". Sie ist an einem
> anderen Aufbau entstanden und hier nicht nachgefahren worden; **was oben
> steht, ist neu gemessen.** *Stolperstein 280 — eine Zahl, die an einem
> anderen Gegenstand entstanden ist, ist für diesen keine Messung.*

**WAS DIE MESSUNG NICHT ABDECKT, und das gehört danebengeschrieben:** die
Schleife hat den Blob **unverändert** zurückgeschrieben. Gemessen ist damit
die **Datenbankhälfte** des Laufs — Lesen, Entschlüsseln, Verschlüsseln,
Schreiben —, nicht das Umwandeln. *Das ist Absicht und keine Lücke:*
`better-sqlite3` ist **synchron**, jede seiner Zeilen blockiert die
Ereignisschleife; `sharp` läuft im Faden­pool von libuv und blockiert sie
nicht. **Die Hälfte, die den Server anhält, ist genau die gemessene.**

### B. Zwei Schreiber auf einer WAL-Datei — gemessen statt befürchtet

Der Auftrag 0.19.1 hat diese Runde mit dem Satz zurückgestellt, ein zweiter
Schreiber auf einer WAL-Datei sei heikel. **Nachgemessen ist er es nicht.**
Der Thread fuhr den Lauf, der Haupt-Thread schrieb daneben alle 25 ms eine
Transaktion über fünf Zeilen:

| | geschrieben | abgewiesen | langsamste Schreibung |
|---|---|---|---|
| Thread | 60 Zeilen | **0** | — |
| Haupt-Thread | 88 Transaktionen à 5 Zeilen | **0** | **3,6 ms** |

**Der Grund steht in der Vorgabe von `better-sqlite3`: `busy_timeout` ist
5000 ms** — abgelesen, nicht angenommen. Wer in WAL auf den Schreiblock
wartet, wartet Millisekunden und wird nicht abgewiesen. *In `db.js` steht
dazu keine Zeile; die Vorgabe trägt. **Sie gehört trotzdem in den
Projektstand**, sonst hängt diese Runde an etwas Ungeschriebenem.*

### C. `reclaim()` aus dem Thread kommt durch

`incremental_vacuum` und vor allem `wal_checkpoint(TRUNCATE)` brauchen, dass
kein anderer mehr in der Datei liest. Der Haupt-Thread las währenddessen alle
20 ms weiter — der Punkt kam trotzdem durch:

    Ergebnis: { busy: 0, log: 0, checkpointed: 0 } · WAL 720 kB -> 0 kB · 24 ms

**`busy: 0` heißt: durchgekommen.** Wäre er es nicht, stünde dort eine 1, und
die WAL-Datei bliebe stehen. *Die drei Nullen danach sind kein Fehler: nach
dem Kürzen ist nichts mehr da, was zu übertragen wäre.*

### D. Die Übersicht fragt 3200-mal, wo 9-mal reichten

`GET /api/items` fragt in der Schleife **je Eintrag fünfmal** — und in einer
davon noch einmal **je Testtag**:

| Abfrage | Zahl der Abfragen |
|---|---|
| `qTags` | 400 |
| `qLinks` | 400 |
| `qAnhangZahl` | 400 |
| `schnitteJeKriterium` | 400 |
| `testStats` | 400 |
| `qTestDays` → `qTestDaysRoh` | 400 |
| `qTestDays` → **`qTestDayTags`, je Testtag** | **1200** |
| **zusammen** | **3200** |

### E. Und sie holt dreierlei, das niemand ansieht

**Das ist der eigentliche Fund dieser Vorarbeit, und er ist größer als das
Bündeln.** Nachgesehen in `public/app.js`:

* **`zeitleistePunkte()` liest `day`, `rating` und `mine`** — sonst nichts
  (`public/app.js:2759`). `qTestDays()` holt dazu **die Schlagworte jedes
  Testtags** (1200 Abfragen) und **den Verfasser jedes Testtags** (1200
  Namensauflösungen). **Beides geht in der Übersicht ungelesen wieder
  hinaus.**
* **Von den Links braucht die Kachel nur `linkCount`.** Heute holt
  `qLinks.all(it.id)` je Eintrag die **vollen Zeilen** — `id`, `url`,
  `sort_order`, `created_at`, `user_id` — und nimmt davon `.length`.
* **Von den Schlagworten liest die Oberfläche `name` und `.length`.** `qTags`
  holt `t.*` und damit auch `created_at`. *Nachgesehen: **keine einzige
  Stelle** in `public/app.js` liest `created_at` an einem Schlagwort.*

Was das kostet, je über alle 400 Einträge, warm gemessen:

| | heute | gebündelt | schmal **und** gebündelt |
|---|---|---|---|
| `qTestDays` | **11,61 ms** | 8,68 ms | **3,30 ms** |
| `qLinks` | 2,36 ms | 1,02 ms | **0,47 ms** *(nur `COUNT(*)`)* |
| `qTags` | 3,76 ms | **2,41 ms** | 2,41 ms |
| `schnitteJeKriterium` | 4,18 ms | **2,70 ms** | 2,70 ms |
| `qAnhangZahl` | 1,33 ms | **0,23 ms** | 0,23 ms |
| `testStats` | **1,94 ms** | 2,58 ms | — |

> **`testStats` GEBÜNDELT IST SCHLECHTER, und das steht hier, damit es niemand
> trotzdem baut.** 1,94 → 2,58 ms: die eine Abfrage mit Fensterfunktion kostet
> mehr, als die 400 Einzelabfragen sparen. **Eine Bündelung ist kein
> Selbstzweck** — sie lohnt, wo sie etwas spart, und sonst nicht.

### F. Die ganze Route, am laufenden Server gegen einen Prototyp

Beide Stände **abwechselnd** gemessen, damit der Zustand der Zwischenspeicher
keine Rolle spielt — je zehn Abrufe nach drei Aufwärmläufen, drei Durchgänge:

| | Durchgang 1 | Durchgang 2 | Durchgang 3 | Antwortgröße |
|---|---|---|---|---|
| **heute (`0cdc709d`)** | 60,0 ms | 43,2 ms | 43,8 ms | **495.820 B** |
| **Prototyp** | 23,8 ms | 24,5 ms | 23,2 ms | **342.343 B** |

**Rund 43 ms werden rund 24 ms, und die Antwort fällt von 484 auf 334 kB —
31 Prozent weniger.** *Der Prototyp ist gegen die heutige Antwort geprüft
worden: alle 400 Einträge, Feld für Feld gleich; verschieden ist nur, was
Punkt 3 ausdrücklich herausnimmt.*

**DIE TEILE ERGEBEN NICHT DIE ROUTE, und das ist kein Rechenfehler:** aus der
Tabelle in E kommen rund 15 ms, an der Route sind es rund 19. Der Rest ist
das, was gar nicht mehr entsteht — **150 kB weniger bauen, wandeln und
senden**. *Nachgemessen: `JSON.stringify` der heutigen Antwort 3,07 ms, der
schmalen 2,12 ms.*

> **UND DIE ZAHLEN GELTEN FÜR DIESE FORM DES BESTANDS.** Drei Schlagworte,
> drei Bewertungen, drei Testtage und ein Link je Eintrag. **Wie der echte
> Bestand geformt ist, ist nicht gemessen** — die Richtung stimmt in jedem
> Fall, die Höhe hängt daran. *Der Maschinenfaktor aus 0.19.1 — dreizehn
> zwischen dieser Maschine und dem Wirt — gilt hier genauso.*

### G. BERICHTIGUNG: die Aufschlüsselung aus 0.19.2 war an leeren Tabellen entstanden

`Doku/Aenderungsprotokoll_0.19.2.md`, Abschnitt 11, nannte für die fünf
Abfragen einzelne Millisekundenwerte und eine Summe daraus. **Diese Zahlen
sind an einer Datenbank entstanden, in der `tags`, `ratings` und `test_days`
LEER waren.** Gemessen wurde damit, was eine Abfrage kostet, die **nichts
findet** — eine Untergrenze und nicht der Preis am Bestand.

**Und der größte Posten fehlte ganz:** `qTestDays` stand nicht in der Liste,
weil es ohne Testtage nichts zu holen gab. Mit Inhalt ist es mit **11,61 ms**
der teuerste Einzelposten der ganzen Route — mehr als die fünf genannten
zusammen.

**Die Berichtigung ist bereits eingetragen** (Kasten im Änderungsprotokoll
0.19.2, Abschnitt 11); dieser Auftrag trägt sie hier ein zweites Mal, weil
die bauende Sitzung sonst mit den alten Zahlen rechnet. **Es ist die vierte
Zahl in dieser Kette, und sie ist auf dieselbe Weise entstanden wie die drei
davor: nicht erfunden, sondern an einem Aufbau erhoben, der die Frage gar
nicht stellen konnte.** *Kandidat für einen neuen Stolperstein — siehe
Bauregeln.*

---

## 1. Der Bestandslauf zieht in einen eigenen Thread

### Der Befund

`stelleBestandUm()` (`server.js:514`) und `backfillVariants()`
(`server.js:5762`) laufen beide im Haupt-Thread. Zwischen ihren Zeilen liegt
eine Pause von 30 ms, damit der Server ansprechbar bleibt — **während einer
Zeile ist er es nicht.** Abschnitt A misst 133 ms im 95. Perzentil und
200 ms im schlechtesten Fall.

*Der im Feld gemeldete Aussetzer geht nach heutigem Stand auf die
Kennzahlenabfrage zurück (0.19.1 Punkt 1, 0.19.2 Punkt 1) und nicht auf den
Lauf.* **Diese Runde ist deshalb die saubere Bauform und nicht die Heilung** —
und sie steht **vor** 0.19.4 und 0.21.0, weil beide über den ganzen
Bildbestand fahren.

### GEBAUT WIRD

* **Ein neues Modul `bilder.js`** mit `makeVariants()`, `legeBildAb()` und
  `istPNG()` — heute stehen sie in `server.js` (Zeilen 319, 430 und
  Umgebung). **Der Grund ist nicht Ordnung, sondern EINE Wahrheit über die
  Ablage:** der Thread braucht dieselbe Umwandlung wie der Anfrageweg, und
  zwei Fassungen davon liefen auseinander (Stolperstein 47). *`server.js`
  requiret es und ruft dieselben Funktionen wie bisher.*
* **Ein neues Modul `bestandslauf.js`** als Worker: eigene Verbindung über
  `db.js`, eigener `sharp.concurrency()`-Aufruf, die Schleife aus
  `stelleBestandUm()` und die aus `backfillVariants()`. **Beide, nicht eine**
  — sie haben dieselbe Bauform und dieselbe Aufgabe.
* **Der Stand reist über `postMessage` zurück.** `umstellung` bleibt im
  Haupt-Thread und wird aus den Meldungen des Threads fortgeschrieben;
  `umstellungsStand()` und `/api/stats` ändern sich **nicht**. *Eine Meldung
  je Zeile ist zu viel und eine am Ende zu wenig — die Karte fragt alle
  1500 ms, also reicht eine Meldung je Zeile mit Zusammenfassung; entschieden
  wird das beim Bauen und im Änderungsprotokoll begründet.*
* **`reclaim()` bleibt am Ende des Laufs und läuft im Thread** — Abschnitt C
  belegt, dass es dort durchkommt.
* **Ein Fehler im Thread reißt den Server nicht ab.** `worker.on('error')`
  setzt `umstellung.laeuft = false`, schreibt die Zeile ins Protokoll und
  lässt den Rest stehen — dieselbe Regel wie heute für eine einzelne Zeile.
* **Der Thread wird je Lauf erzeugt und danach beendet.** Kein Fadenpool, kein
  Dauerläufer: `backfillVariants()` läuft einmal beim Start, die Umstellung
  auf Knopfdruck. *19 ms Verbindungsaufbau und 76 ms für `sharp` fallen
  einmal an; ein Dauerläufer hielte dafür eine zweite Verbindung auf die
  Datenbank offen, solange der Server läuft.*

### Was dabei zu prüfen ist

* **`db.js` darf im Thread nichts tun, was zweimal schadet.** Es legt Tabellen
  an, fährt Migrationen und schreibt den Schlüsselhinweis. **Nachsehen und
  entscheiden:** entweder ein Schalter „nur öffnen, nicht wandern", oder der
  Nachweis, dass alles darin doppelt ausführbar ist. *`CREATE TABLE IF NOT
  EXISTS` ist es; ein `VACUUM` wäre es nicht.*
* **`maintainStorage()` bleibt, wo es ist.** Es läuft einmal nach dem
  Nachrüsten und fasst die ganze Datei an — das gehört nicht in denselben
  Thread wie die Schleife.
* **Der Schlüssel geht NICHT über `workerData`.** Der Thread liest ihn
  denselben Weg wie der Haupt-Thread, über `keys.js` und die Umgebung. *Ein
  Schlüssel, der durch eine Nachricht reist, steht in einem zweiten Speicher.*
* **`process.on('SIGTERM')` schließt heute `db`.** Läuft ein Thread, gehört er
  vorher beendet — sonst schreibt er in eine Datei, deren WAL gerade gekürzt
  wird.

---

## 2. Die Übersicht fragt einmal statt vierhundertmal

### GEBAUT WIRD

In `GET /api/items` (`server.js:2958`) ziehen vier Abfragen **vor** die
Schleife, in dieselbe Bauform, die 0.19.2 für die Fotos gebaut hat: **einmal
fragen, in eine Karte legen, in der Schleife nachschlagen.**

| statt | tritt |
|---|---|
| `qTags.all(it.id)` je Eintrag | eine Abfrage über `item_tags`, nach `item_id` gruppiert |
| `qAnhangZahl.get(it.id)` je Eintrag | `SELECT item_id, COUNT(*) … GROUP BY item_id` |
| `schnitteJeKriterium(it.id)` je Eintrag | dieselbe Abfrage mit `r.item_id` in `SELECT` und `GROUP BY` |
| `qCat.get(…)` je Eintrag | die Kategorien einmal in eine Karte |

**`testStats` BLEIBT, WIE ES IST** — Abschnitt E hat die gebündelte Form
gemessen und sie ist langsamer.

**DIE EINZELFASSUNGEN BLEIBEN ALLE STEHEN**, denn `detail()` braucht sie: dort
geht es um **einen** Eintrag, und eine zweite Bauform daneben wäre keine
Ersparnis, sondern eine zweite Wahrheit. *Genau wie `qPhotos` neben
`qAlleFotos` seit 0.19.2 — und mit derselben Prüfung: **die gebündelte und
die einzelne Fassung müssen dieselben Spalten lesen**, sonst trägt die Kachel
etwas anderes als der Eintrag.*

### Was ausdrücklich nicht passieren darf

* **Kein `IN (…)` mit vierhundert Nummern.** Geholt wird alles und in der
  Schleife nachgeschlagen — dieselbe Begründung wie bei den Fotos: die
  gefilterte Übersicht wirft dann etwas weg, und das ist billiger als die
  Liste zu binden.
* **Die Reihenfolge muss bleiben.** `qTags` sortiert `t.name COLLATE NOCASE`,
  die Testtage `day DESC, id DESC`. Wer gruppiert, sortiert **zuerst nach
  `item_id`** und dann wie bisher — sonst stehen die Schlagworte einer Kachel
  in einer anderen Folge als am Eintrag, und die Zeitleiste bekommt ihre
  Punkte verdreht.

---

## 3. Die Übersicht holt nicht mehr, was sie nicht zeigt

### GEBAUT WIRD

**a) Die Testtage der Listenantwort werden schmal.** In der Antwort von
`GET /api/items` trägt ein Testtag künftig **`id`, `day`, `rating` und
`mine`** — und **nicht mehr `tags` und `verfasser`**.

*Warum es niemand vermisst:* `zeitleistePunkte()` (`public/app.js:2759`) ist
die **einzige** Stelle, die dieses Feld aus der Listenantwort liest, und sie
nimmt `day`, `rating` und `mine`. **`id` bleibt trotzdem drin** — es kostet
vier Bytes und ist die einzige Handhabe, falls die Zeitleiste je auf einen
Punkt zeigen soll.

> **DAS IST NACHGESEHEN UND NICHT GEGLAUBT, denn `testDays` wird an fünf
> Stellen gelesen.** Vier davon arbeiten auf dem Objekt aus `detail()` und
> nicht auf der Liste — **erkennbar daran, was daneben steht:**
>
> | Stelle | liest daneben | also |
> |---|---|---|
> | `blockZusammenfassung()` (890) | `item.links`, `item.description` | Einzelansicht — die Liste hat beides nicht |
> | Vergleich, `zeitpunkteVon()` (3327) | `it.ratings`, `r.gewicht` | Einzelansicht — die Liste trägt keine `ratings` |
> | `drawSwitches()` (4432) | `item.tested`, `item.rejected` im Schalterblock | Einzelansicht |
> | Zeitleiste des Eintrags (5222–5235) | `sparkline(item.testDays)` | Einzelansicht |
> | **`zeitleistePunkte()` (2762)** | `it.id`, `it.title` | **Liste** |
>
> *Der Kommentar in `server.js` behauptet dasselbe seit 0.17.0. **Er hat
> recht — aber niemand hatte es seither nachgezählt.** Wer diese Runde baut,
> zählt es noch einmal: die Zeilennummern oben verschieben sich mit jeder
> Änderung an `public/app.js`.*

*Was das spart:* **11,61 ms werden 3,30 ms**, und die 1200 Abfragen nach den
Schlagworten der Testtage fallen ganz weg. *Von der Antwort gehen 96 kB ab.*

> **DER PROTOTYP HAT AUCH `id` WEGGELASSEN, dieser Auftrag will es behalten** —
> also sind die 334 kB aus Abschnitt F um **14,1 kB zu tief**. Gemessen, nicht
> überschlagen. **Die Zeitangabe ändert sich dadurch nicht messbar**; vier
> Bytes je Zeile werden weder gesucht noch entschlüsselt, sie stehen im
> Zeilenkopf.

**`qTestDays()` in seiner heutigen Form BLEIBT** — `detail()` ruft es, und
dort zeigt die Zeile am Eintrag Schlagworte und Verfasser. **Zwei Formen für
zwei Fragen, und der Unterschied gehört an beide geschrieben.**

**b) Von den Links wird nur gezählt.** `it.linkCount` kommt aus
`SELECT item_id, COUNT(*) … GROUP BY item_id` statt aus der Länge einer
Zeilenmenge, die sonst niemand ansieht. *2,36 → 0,47 ms.*

**c) `qTags` nennt seine Spalten.** `t.*` wird `t.id, t.name`. *Nachgesehen:
`created_at` eines Schlagworts wird in `public/app.js` nirgends gelesen.*
**Die Einzelfassung für `detail()` zieht mit** — dieselben Spalten in
derselben Folge, sonst greift die Prüfung aus Punkt 2 nicht.

### Und das ist eine Wegnahme an einer öffentlichen Antwort

**Sie gehört benannt und nicht stillschweigend gemacht.** Abschnitt 5 des
Projektstands beschreibt `GET /api/items`; dort ist einzutragen, dass die
Testtage der **Liste** schmaler sind als die der **Einzelansicht**, mit dem
Grund. **Der CHANGELOG bekommt eine Zeile dazu** — vor 1.0.0 ist so etwas
erlaubt, aber niemand soll es aus einem Diff erfahren müssen.

---

## 4. Die letzten acht „Instanz" im Bildschirmtext

0.19.1 hat siebzehn Stellen umbenannt, weil der Auftrag genau siebzehn
aufgezählt hatte. **Acht sind stehen geblieben** — alle in `public/app.js`,
alle im Bildschirmtext, nachgezählt am heutigen Stand:

| Zeile | Anfang der Stelle |
|---|---|
| 6358 | „Beim Anmelden fragt die Instanz zusätzlich nach dem Code …" |
| 6428 | „… danach gibt ihn die Instanz nicht mehr heraus" |
| 6499 | „… Die Instanz speichert weder Adresse noch …" |
| 7698 | „… die Instanz bewahrt ihn nirgends" |
| 7879 | „… die Instanz speichert beides nicht." |
| 8156 | „Ohne Mailzugang läuft die Instanz vollständig …" |
| 8809 | „… Instanz still — bei … sind das etwa …" |
| 9067 | „… Deshalb fragt die Instanz einmal nach deinem Passwort …" |

**GEBAUT WIRD:** dieselbe Ersetzung wie in 0.19.1 — „Instanz" wird
„Installation", gleiches Geschlecht, gleiche Beugung, kein weiterer Eingriff.

**WAS AUSDRÜCKLICH NICHT ANGEFASST WIRD:** die **Kommentare**. In
`public/app.js` stehen 33 weitere Vorkommen, in `server.js` 36, dazu eines in
`public/index.html` — alle in Kommentaren. *Sie sind kein Bildschirmtext, und
sie umzubenennen bewegte nur den Fingerprint.* **Eine Zeile bleibt in
`server.js:5880`:** „Die Instanz laeuft weiter …" ist eine Protokollzeile für
den Betreiber und keine Bildschirmmeldung. **Auch sie bleibt** — oder sie
wird mitgenommen und im Änderungsprotokoll begründet. *Entschieden wird das
beim Bauen; was nicht entschieden werden darf, ist es zu übersehen.*

**Danach ist „Instanz" im Bildschirmtext auf null.** Eine Prüfung hält das
fest — und sie zählt **Nicht-Kommentarzeilen**, nicht Vorkommen.

---

## Was ausdrücklich NICHT gebaut wird

**a) `testStats` GEBÜNDELT.** Gemessen: 1,94 → 2,58 ms. **Sie wäre langsamer**
und stünde nur dabei, weil ihre vier Nachbarn es sind.

**b) EIN FADENPOOL ODER EIN DAUERLÄUFER-THREAD.** Ein Thread je Lauf, danach
beendet. Ein Dauerläufer hielte eine zweite Verbindung auf die Datenbank
offen, solange der Server läuft — für zwei Läufe, von denen einer beim Start
und einer auf Knopfdruck läuft.

**c) DIE MELDUNG DES FORTSCHRITTS ÜBER EINEN OFFENEN KANAL.** Die Karte fragt
alle 1500 ms, und nach 0.19.2 kostet diese Frage Millisekunden. **Ein
WebSocket wäre eine neue Bauform für ein gelöstes Problem.**

**d) `detail()` UMSCHREIBEN.** Dort ist die Zeilenzahl einstellig; die
Bündelung spart dort nichts und brächte eine zweite Bauform.

**e) EINE ZÄHLERTABELLE ODER EIN ZWISCHENSPEICHER FÜR DIE KENNZAHLEN.** In
0.19.2 erwogen und verworfen: bei 4,4 ms warm gibt es nichts zu sparen, und
sie wäre eine zweite Wahrheit über denselben Bestand (Stolperstein 47).

**f) DIE THUMB-GEOMETRIE.** `thumb` ist 400 px auf der **langen** Kante, die
Kachel fordert die kurze. **Das ist 0.19.4** — es ändert die Ableitungsregel
**und** braucht einen Lauf über 1034 Bilder. *Genau deshalb steht diese Runde
davor.*

**g) DIE ABLEITUNGEN AUF WebP.** Sie fahren in 0.21.0 mit, wo ohnehin über
Verfahren entschieden wird — **ein** Durchgang über den Bestand statt zwei.

---

## Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere. Der
  Sprachwächter läuft mit. *`Thread` steht seit 0.19.1 in der Sprachliste und
  ist die verlangte Form; `Faden` ist es nicht.*
* **Keine neue Abhängigkeit.** `worker_threads` gehört zu Node.
* **Keine Binärdateien im Repo. Keine Tags.**
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt.**
  *Diese Runde berichtigt zum vierten Mal eine übertragene Zahl — sie ist der
  denkbar schlechteste Ort für eine fünfte.*
* **Neue Stolpersteine ab 282.** Kandidaten aus dem Befund, die Nummerierung
  entscheidet die bauende Sitzung:
  - *Eine Messung an einer leeren Tabelle misst den Leerlauf und nicht den
    Preis.* Und schlimmer: **sie verbirgt den größten Posten**, weil der ohne
    Inhalt gar nicht auftaucht.
  - *`better-sqlite3` ist synchron — jede seiner Zeilen hält die
    Ereignisschleife an.* Was daneben asynchron ist (`sharp`), hält sie nicht
    an; **wer eine Blockade sucht, sucht das Synchrone.**
  - *Eine Bündelung ist kein Selbstzweck.* `testStats` gebündelt ist
    langsamer als vierhundert Einzelabfragen.
  - *Wer fragt, was er nicht anzeigt, bezahlt es zweimal* — beim Holen und
    beim Senden.
* **Neue Rückbauten ab 491**, für jeden gebauten Punkt mindestens einer.
  **Ein Rückbau, der den Lauf abreißt, belegt nichts** (Stolperstein 161) —
  jede neue Zusage fasst ihre Felder durch eine Klammer.
* **Rückbau 44 und die anderen mitgehen lassen, nicht löschen**
  (Stolperstein 201), wo ihr Suchtext sich durch diese Runde verschiebt.
  *Betroffen sind mindestens die Rückbauten 488 bis 490 — sie stehen an
  derselben Schleife.*
* **Der Prüfstand wächst von 5108**, die Rückbauliste von 481 (höchste
  Nummer 490).

### Was aus den letzten Runden mitzunehmen ist

* **Vor dem Nummerieren wird gezählt, nicht geblättert** (Stolperstein 168).
* **Ein stummer Rückbau ist ein Fund und keine Formalie.**
* **Was aufgehoben wird, wird mit dem Grund hingeschrieben und nicht
  gelöscht** (Stolperstein 201).
* **Zwei Tabellen über dieselbe Sache dürfen sich nicht widersprechen**
  (Stolperstein 47) — in dieser Runde gleich dreimal: `bilder.js` gegen den
  Anfrageweg, die gebündelte Fassung gegen die einzelne, die schmale
  Testtagsform gegen die volle.
* **Eine Zahl, die an einem anderen Gegenstand gemessen wurde, ist für diesen
  keine Messung** (Stolperstein 280).

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen.**
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: **`git status` muss leer
  sein**, und **`npm test` läuft ein letztes Mal gegen genau diesen Stand.**
  **Und danach kein Prüflauf mehr, den du abbrichst.**
* **`Doku/Aenderungsprotokoll_0.19.3.md`** liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, die Entscheidungen mit ihrer Begründung,
  neue Stolpersteine (**ab 282**), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (**vorher: 5108**),
  Rückbauten vorher/nachher (**vorher: 481, höchste Nummer 490**),
  Offengebliebenes.
* Die Zeile „0.19.3 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
  *Zwei neue Dateien, `bilder.js` und `bestandslauf.js`, gehen in den
  Fingerprint ein — die Liste wird abgeleitet und nicht gepflegt, sie kommen
  von selbst hinein. **`bestandslauf.js` aber nur, wenn er auch geladen
  wurde**: ein Modul, das nur im Thread lebt, steht nicht in der
  `require.cache` des Haupt-Threads. **Das ist nachzusehen und im Papier zu
  benennen** — ein Fingerprint, der eine ausgelieferte Datei nicht kennt, ist
  eine halbe Aussage.*
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.** Kein
  Migrationsblock, keine Schemaänderung, kein neuer Index, das Austauschformat
  bleibt 12. **Gesichert werden muss vor dem Einspielen nichts.**
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im
  Chat, nicht in den Dokumenten.** Darunter: **die Übersicht öffnen** *(sie
  kommt spürbar schneller als mit 0.19.2)*, **die Zeitleiste ansehen** *(die
  Punkte stehen, wo sie standen)*, **einen Eintrag öffnen** *(die Testtage
  tragen dort weiter ihre Schlagworte und ihren Verfasser)*, **die
  Linkzahl an einer Kachel gegen die Liste im Eintrag halten** *(dieselbe
  Zahl)* und **den Systembereich nach „Instanz" absuchen** *(nichts mehr)*.
* **UND DER EINE NACHWEIS, DER NUR AM WIRT ZU FÜHREN IST:** ein PNG einfügen,
  den Schalter aus- und wieder einschalten und **den Umstellungslauf fahren**
  — währenddessen in der Übersicht blättern und im Systembereich klicken.
  **Reagiert die Oberfläche durchgehend, ist Punkt 1 im Feld belegt**, und die
  Beobachtung gehört ins Änderungsprotokoll. *Das ist zugleich der Nachweis,
  der seit 0.19.1 aussteht.*

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_19_3`), und **alle
  Verweise sind nachzuziehen.** Kopf, Betriebsstand, Stolpersteine, Prüfstand,
  Versionsgeschichte, **Fahrplan** — und **Abschnitt 5**, wegen der schmaleren
  Listenantwort aus Punkt 3.

* **NEU IN DEN PROJEKTSTAND, weil es bisher nirgends steht:** dass
  `busy_timeout` auf **5000 ms** steht — als Vorgabe von `better-sqlite3` und
  nicht als Zeile in `db.js`. **Diese Runde hängt daran** (Abschnitt B), und
  was eine Runde trägt, gehört aufgeschrieben und nicht vorausgesetzt.

* **Der Fahrplan rückt NICHT.** 0.19.3 ist die Nummer, die dort schon steht;
  Punkt 2 bis 4 kommen dazu, ohne die Art der Runde zu ändern. **Der Name
  bleibt „Bestandsläufe verlassen den Anfrageweg"** — er ist der Grund für die
  Reihenfolge, und der gilt weiter. *Was in der Zeile zu ergänzen ist: die
  Übersichtsschleife und die acht Benennungen.*

* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2: **eine Zeile je
  Änderung**, die Abschnittsnamen vor der Zeile — **mit Kasten**, wegen der
  schmaleren Listenantwort.

* **Das Sammelblatt** bekommt nichts Neues; Punkt 7 (die Vorschaubilder)
  bleibt als 0.19.4 stehen, wo er steht.

* **DIE README WIRD NICHT ANGEFASST.** Sie kennt kein „Instanz" mehr
  (nachgezählt: null), und die Kartenzahl ändert sich nicht.

* **DAS KONZEPTPAPIER UND DAS VIDEOPAPIER WERDEN NICHT ANGEFASST.**

* **`Doku/Auftrag_0.19.1.md` fällt mit diesem Auftrag weg** — *es liegt immer
  nur einer im Repo, und was 0.19.1 und 0.19.2 gebracht haben, steht in ihren
  Änderungsprotokollen.* **Dieser hier fällt weg, wenn der nächste geschrieben
  wird.**

### Der Fahrplan steht anderswo, und das mit Absicht

> **DER PLAN STEHT IM PROJEKTSTAND, ABSCHNITT 10 — und sonst nirgends.** Ein
> Auftrag ist kein Ort für den Fahrplan: er wird beim Schreiben des nächsten
> weggeworfen, und was darin stand, wäre dann weg.

---

## Was danach offen bleibt

*Damit es nicht wieder gefunden werden muss:*

- **Der volle Gegenprobenlauf** über alle Rückbauten — rund vierzig Stunden,
  seit einundzwanzig Runden ausstehend.
- **`JSON.stringify` kostet 2,12 ms** für die schmale Antwort. *Nicht zu
  ändern, aber die Zahl gehört daneben: sie ist die Untergrenze dessen, was
  diese Route kosten kann.*
- **Wie der echte Bestand geformt ist, ist nicht gemessen.** Alle Zahlen zu
  Punkt 2 und 3 gelten für drei Schlagworte, drei Bewertungen, drei Testtage
  und einen Link je Eintrag.
