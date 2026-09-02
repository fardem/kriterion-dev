# Änderungsprotokoll 0.19.3 — „Bestandsläufe verlassen den Anfrageweg"

**Version 0.19.3 · gebaut am 2. September 2026 · Fingerprint `cdbe0925` ·
5170 Prüfungen · 497 Rückbauten in `gegenprobe.js`**

---

**DIESE RUNDE HAT NICHTS NEUES GEBAUT.** Sie nimmt zwei Arbeiten aus dem
Anfrageweg heraus: den Bestandslauf, der bis 0.19.2 den Haupt-Thread anhielt,
und die Übersichtsschleife, die je Eintrag fünfmal einzeln fragte und dabei
holte, was niemand ansieht. **Dieselben Knöpfe, dieselben Zahlen — nur ohne die
Wartezeit.**

> **DIE NUMMER: PATCH.** *Die Installation kann danach nichts, was sie vorher
> nicht konnte.* **KEINE DATENBANKSTUFE:** acht markierte Blöcke,
> Austauschformat **12**, `F_ROUTEN` **70**, neunzehn Karten, **kein neuer
> Index**. **Gesichert werden muss vor dem Einspielen nichts.**
>
> **EINE SACHE ÄNDERT SICH DOCH, und sie gehört ausgesprochen: die Antwort von
> `GET /api/items` WIRD SCHMALER.** Ein Testtag der **Liste** trägt künftig
> `id`, `day`, `rating` und `mine` — und nicht mehr `tags` und `verfasser`. *Am
> **Eintrag** stehen beide unverändert weiter.* **Das ist eine Wegnahme an
> einer öffentlichen Antwort** — vor 1.0.0 erlaubt, aber nicht nebenbei: sie
> steht im CHANGELOG mit Kasten und in Abschnitt 5 des Projektstands.

---

## 0. Was gemessen wurde

**Alles in diesem Abschnitt ist am 2. September 2026 nachgefahren worden**, an
einer **SQLCipher-Datenbank mit 400 Einträgen, 400 Fotos à 512 kB (312 MB),
1200 Schlagwortbindungen, 400 Links, 100 Anhängen, 1200 Bewertungen und 1200
Testtagen**, auf Node 22 mit vier Kernen. **Keine Zahl hier ist geschätzt oder
aus einem älteren Papier übernommen.**

> **WOHER DIESE ZAHLEN KOMMEN, UND ES GEHÖRT DAZUGESAGT (Stolperstein 252):**
> sie stammen aus dem **Messlauf, der diese Runde vorbereitet hat** — derselbe
> Tag, derselbe Quelltext, dieselbe Datenbank; sie stehen im Auftrag 0.19.3
> unter „Was gemessen wurde". **Die bauende Sitzung hat sie nicht ein zweites
> Mal nachgefahren.** *Was sie selbst nachgezählt hat, steht in Abschnitt 10
> als solches da: die Zahl der Prüfungen, die der Rückbauten, die der Abfragen
> je Abruf — und, in Abschnitt F, die eine Zahl, die sie berichtigen musste.*

> **DIE TABELLEN WAREN BIS ZU DIESER RUNDE LEER.** Was 0.19.2 an dieser
> Datenbank über die Übersichtsschleife gemessen hat, war der Leerlauf von
> Abfragen, die nichts finden. Erst mit Inhalt zeigt sich, was sie kosten — und
> welche überhaupt die teuerste ist. *Die Berichtigung steht in Abschnitt 6,
> der neue Stolperstein dazu ist 282.*

### A. Der Bestandslauf hält den Haupt-Thread an, der Thread nicht

Gemessen als **Verspätung eines Taktgebers, der alle 20 ms schlagen soll**,
während 60 Fotozeilen à 512 kB gelesen und zurückgeschrieben werden — mit den
30 ms Pause dazwischen, die der Lauf schon vorher einlegte:

| Lauf | Median | 95 % | größte Verspätung |
|---|---|---|---|
| ohne Last | 0,7 ms | 1,1 ms | 20,0 ms |
| **im Haupt-Thread, wie bis 0.19.2** | 0,9 ms | **133,0 ms** | **200,1 ms** |
| **im eigenen Thread** | 0,5 ms | **0,9 ms** | **1,3 ms** |

**Der Median sagt nichts, das 95. Perzentil sagt alles.** Zwischen den Zeilen
ist der Haupt-Thread frei — beim Lesen und Schreiben einer halben Megabyte Blob
steht er. Im Thread liegt die Verspätung **unter dem Rauschen des Leerlaufs**.

**Und der Thread hat wirklich geschrieben:** 60 Zeilen, 30 MB gelesen und
zurückgeschrieben, **0 Abweisungen**, 2,3 s.
`better-sqlite3-multiple-ciphers` öffnet die verschlüsselte Datei aus einem
Worker-Thread heraus und beschreibt sie. *Verbindungsaufbau im Thread: 19 ms.
`sharp` lädt dort in 76 ms und wandelt um.*

> **DIE ZAHL AUS DEM AUFTRAG 0.19.1 IST NICHT ÜBERNOMMEN WORDEN.** Dort stand
> „die Verzögerung des Haupt-Threads fiel von 126 auf 38 ms". Sie ist an einem
> anderen Aufbau entstanden und hier nicht nachgefahren worden (Stolperstein
> 280).

**WAS DIE MESSUNG NICHT ABDECKT, und das gehört danebengeschrieben:** die
Schleife hat den Blob **unverändert** zurückgeschrieben. Gemessen ist damit die
**Datenbankhälfte** des Laufs — Lesen, Entschlüsseln, Verschlüsseln, Schreiben
—, nicht das Umwandeln. *Das ist Absicht und keine Lücke:* `better-sqlite3` ist
**synchron**, jede seiner Zeilen blockiert den Event Loop; `sharp` läuft
im Threadpool von libuv und blockiert sie nicht. **Die Hälfte, die den Server
anhält, ist genau die gemessene.** *Daraus wurde Stolperstein 283.*

### B. Zwei Schreiber auf einer WAL-Datei — gemessen statt befürchtet

Der Auftrag 0.19.1 hatte diese Runde mit dem Satz zurückgestellt, ein zweiter
Schreiber auf einer WAL-Datei sei heikel. **Nachgemessen ist er es nicht.** Der
Thread fuhr den Lauf, der Haupt-Thread schrieb daneben alle 25 ms eine
Transaktion über fünf Zeilen:

| | geschrieben | abgewiesen | langsamste Schreibung |
|---|---|---|---|
| Thread | 60 Zeilen | **0** | — |
| Haupt-Thread | 88 Transaktionen à 5 Zeilen | **0** | **3,6 ms** |

**Der Grund steht in der Vorgabe von `better-sqlite3`: `busy_timeout` ist
5000 ms** — abgelesen, nicht angenommen. Wer in WAL auf den Schreiblock wartet,
wartet Millisekunden und wird nicht abgewiesen. *In `db.js` steht dazu keine
Zeile; die Vorgabe trägt.* **Sie steht seit dieser Runde im Projektstand**,
Abschnitt 2 — was eine Runde trägt, gehört aufgeschrieben und nicht
vorausgesetzt.

*Der Prüfstand fährt diese Messung seither in klein mit: eine Gruppe erzeugt den
Thread an einer echten, verschlüsselten Datei und schreibt daneben alle 20 ms
weiter. Erwartet und geprüft werden **null** Abweisungen.*

### C. `reclaim()` aus dem Thread kommt durch

`incremental_vacuum` und vor allem `wal_checkpoint(TRUNCATE)` brauchen, dass
kein anderer mehr in der Datei liest. Der Haupt-Thread las währenddessen alle
20 ms weiter — der Punkt kam trotzdem durch:

    Ergebnis: { busy: 0, log: 0, checkpointed: 0 } · WAL 720 kB -> 0 kB · 24 ms

**`busy: 0` heißt: durchgekommen.** *Die drei Nullen danach sind kein Fehler:
nach dem Kürzen ist nichts mehr da, was zu übertragen wäre.*

### D. Die Übersicht fragte 3200-mal

`GET /api/items` fragte in der Schleife **je Eintrag fünfmal** — und in einer
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

> **UND WIE VIELE ES NACHHER SIND, IST NACHGEZÄHLT UND NICHT ÜBERNOMMEN: 405.**
> *Der Auftrag schrieb „wo 9-mal reichten"* — er hatte `testStats` mitgezählt.
> **Nach der Messung in E wird `testStats` ausdrücklich NICHT gebündelt**, es
> bleibt bei 400 Aufrufen; die fünf gebündelten schrumpfen auf je eine.
> **3200 → 405.** *Die Messungen in E und F sind davon unberührt: sie zeigen,
> was die einzelnen Abfragen kosten, und `testStats` steht dort mit beiden
> Werten da — dem einzelnen und dem gebündelten.*

### E. Und sie holte dreierlei, das niemand ansieht

Nachgesehen in `public/app.js`:

* **`zeitleistePunkte()` liest `day`, `rating` und `mine`** — sonst nichts.
  `qTestDays()` holte dazu **die Schlagworte jedes Testtags** (1200 Abfragen)
  und **den Verfasser jedes Testtags**. **Beides ging in der Übersicht
  ungelesen wieder hinaus.**
* **Von den Links braucht die Kachel nur `linkCount`.** Geholt wurden je
  Eintrag die **vollen Zeilen** — `id`, `url`, `sort_order`, `created_at`,
  `user_id` — und davon `.length` genommen.
* **Von den Schlagworten liest die Oberfläche `name` und `.length`.** `qTags`
  holte `t.*` und damit auch `created_at`. *Nachgesehen: **keine einzige
  Stelle** in `public/app.js` liest `created_at` an einem Schlagwort.*

Was das kostet, je über alle 400 Einträge, warm gemessen:

| | vorher | gebündelt | schmal **und** gebündelt |
|---|---|---|---|
| `qTestDays` | **11,61 ms** | 8,68 ms | **3,30 ms** |
| `qLinks` | 2,36 ms | 1,02 ms | **0,47 ms** *(nur `COUNT(*)`)* |
| `qTags` | 3,76 ms | **2,41 ms** | 2,41 ms |
| `schnitteJeKriterium` | 4,18 ms | **2,70 ms** | 2,70 ms |
| `qAnhangZahl` | 1,33 ms | **0,23 ms** | 0,23 ms |
| `testStats` | **1,94 ms** | 2,58 ms | — |

> **`testStats` GEBÜNDELT IST SCHLECHTER, und es ist deshalb NICHT gebaut
> worden.** 1,94 → 2,58 ms: die eine Abfrage mit Fensterfunktion kostet mehr,
> als die 400 Einzelabfragen sparen. **Eine Bündelung ist kein Selbstzweck** —
> daraus wurde Stolperstein 284.

### F. Die ganze Route, am laufenden Server

Beide Stände **abwechselnd** gemessen, damit der Zustand der Zwischenspeicher
keine Rolle spielt — je zehn Abrufe nach drei Aufwärmläufen, drei Durchgänge:

| | Durchgang 1 | Durchgang 2 | Durchgang 3 | Antwortgröße |
|---|---|---|---|---|
| **0.19.2 (`0cdc709d`)** | 60,0 ms | 43,2 ms | 43,8 ms | **495.820 B** |
| **Prototyp dieser Runde** | 23,8 ms | 24,5 ms | 23,2 ms | **342.343 B** |

**Rund 43 ms werden rund 24 ms.**

> **GEMESSEN WURDE EIN PROTOTYP UND NICHT DER GEBAUTE STAND, und das gehört
> danebengeschrieben.** Der Prototyp hatte auch `id` aus dem Testtag der Liste
> weggelassen; **diese Runde behält es** — vier Bytes je Zeile, **gemessene
> 14,1 kB** insgesamt, und es ist die einzige Handhabe, falls die Zeitleiste je
> auf einen Punkt zeigen soll. **Die Antwortgröße des gebauten Standes ist
> damit 342.343 + 14.100 = 356.443 B**: gerechnet aus zwei gemessenen Zahlen,
> nicht selbst gemessen. *Von 484 auf 348 kB, 28 Prozent weniger.* **An der
> Zeitangabe ändert es nichts messbar**: vier Bytes im Zeilenkopf werden weder
> gesucht noch entschlüsselt.
>
> *Der Prototyp ist gegen die damalige Antwort geprüft worden — alle 400
> Einträge, Feld für Feld gleich; verschieden ist nur, was Punkt 3
> ausdrücklich herausnimmt. **Dass der gebaute Stand dasselbe liefert, hält
> seit dieser Runde der Prüfstand fest**, Feld für Feld zwischen Kachel und
> Eintrag.*

**DIE TEILE ERGEBEN NICHT DIE ROUTE, und das ist kein Rechenfehler:** aus der
Tabelle in E kommen rund 15 ms, an der Route sind es rund 19. Der Rest ist das,
was gar nicht mehr entsteht — **rund 140 kB weniger bauen, wandeln und senden**.
*Nachgemessen: `JSON.stringify` der alten Antwort 3,07 ms, der schmalen
2,12 ms.*

> **UND DIE ZAHLEN GELTEN FÜR DIESE FORM DES BESTANDS.** Drei Schlagworte, drei
> Bewertungen, drei Testtage und ein Link je Eintrag. **Wie der echte Bestand
> geformt ist, ist nicht gemessen** — die Richtung stimmt in jedem Fall, die
> Höhe hängt daran. *Der Maschinenfaktor aus 0.19.1 — dreizehn zwischen dieser
> Maschine und dem Wirt — gilt hier genauso.*

---

## 1. Der Bestandslauf zieht in einen eigenen Thread

### GEBAUT

**Zwei neue Dateien.**

* **`bilder.js`** trägt `makeVariants()`, `legeBildAb()` und `istPNG()` samt
  `VARIANTS`, `WEBP_ABLAGE`, `PNG_MAGIE` und `PNG_MAGIE_HEX`. Sie standen bis
  0.19.2 in `server.js`. **Der Grund ist nicht Ordnung, sondern EINE Wahrheit
  über die Ablage:** der Thread braucht dieselbe Umwandlung wie der Anfrageweg,
  und zwei Fassungen davon liefen auseinander (Stolperstein 47). *`server.js`
  requiret es und ruft dieselben Funktionen wie bisher; am Verhalten hat sich
  mit dem Umzug nichts geändert.*
* **`bestandslauf.js`** ist der Worker: eigene Verbindung über `db.js`, eigener
  `sharp.concurrency()`-Aufruf, die Schleife aus `stelleBestandUm()` **und** die
  aus `backfillVariants()`. **Beide, nicht eine** — sie haben dieselbe Bauform
  und dieselbe Aufgabe.

**In `server.js` bleibt, was der Haupt-Thread damit zu tun hat:**
`starteBestandsThread(aufgabe, zeilen, fertig)` erzeugt ihn, nimmt seine
Meldungen entgegen und vergisst ihn beim Ende. `umstellung` bleibt im
Haupt-Thread; `umstellungsStand()` und `/api/stats` **ändern sich nicht**.

### Die Entscheidungen, jede mit ihrem Grund

**Eine Meldung je Zeile, und sie trägt den GANZEN Stand.** *Der Auftrag ließ das
offen.* Eine Meldung am Ende wäre zu wenig — die Karte fragt alle 1500 ms und
sähe während des ganzen Laufs dieselbe Null. Eine je Zeile klingt nach viel und
ist es nicht: die Schleife legt ohnehin 30 ms Pause ein, es sind also höchstens
dreiunddreißig in der Sekunde, und jede trägt sechs Zahlen. **Dass sie den
STAND trägt und keine ZUNAHME, ist die eigentliche Entscheidung:** der
Haupt-Thread ersetzt damit, statt zu addieren — eine Zunahme hinge an der
Vollständigkeit der Meldungsfolge, ein voller Stand kann gar nicht
auseinanderlaufen.

**Der Schlüssel reist nicht über `workerData`.** Der Thread liest ihn denselben
Weg wie der Haupt-Thread, über `keys.js` und die Umgebung. *`workerData` wird
beim Erzeugen strukturiert kopiert — ein Schlüssel darin stünde in einem zweiten
Speicher.* Über `workerData` gehen **Nummern**: welche Aufgabe und welche
Zeilen.

**`db.js` ist doppelt ausführbar — nachgesehen, nicht vorausgesetzt.** Der
Auftrag ließ die Wahl zwischen einem Schalter „nur öffnen, nicht wandern" und
dem Nachweis. **Es ist der Nachweis geworden**, und er steht als Liste im
Quelltext über `const db = open(DB_FILE)`: `CREATE TABLE/INDEX IF NOT EXISTS`,
acht Migrationsblöcke, die jeder zuerst nach ihrer Spalte fragen, `UPDATE OR
IGNORE`, `INSERT OR IGNORE`, ein `renumberCriteria()`, das nur schreibt, wo die
Nummer abweicht. **Ein `VACUUM` wäre es nicht — und genau deshalb steht keines
darin;** es liegt in `maintainStorage()` und bleibt im Haupt-Thread.

**EIN SCHALTER IST TROTZDEM DAZUGEKOMMEN, und er betrifft nur das Reden:**
`keys.js` hält seine Ansagen an den Betreiber im Neben-Thread zurück
(`isMainThread`). *Der Schlüsselhinweis ist ein halber Bildschirm; er stünde
sonst bei jedem Umstellungslauf ein zweites Mal im Containerprotokoll, und wer
ihn einmal gelesen hat, liest ihn beim zweiten Mal nicht besser.*

**`reclaim()` bleibt am Ende des Laufs und läuft im Thread** — Abschnitt C
belegt, dass es dort durchkommt.

**Ein Fehler im Thread reißt den Server nicht ab.** `worker.on('error')` setzt
`umstellung.laeuft = false`, schreibt die Zeile ins Protokoll und lässt den Rest
stehen — dieselbe Regel wie bisher für eine einzelne Zeile. *Das `catch` an der
Route ist damit weggefallen: das Netz hängt jetzt am Thread.*

**Ein Thread je Lauf, danach beendet.** Kein Threadpool, kein Dauerläufer. *Die
19 ms Verbindungsaufbau und die 76 ms für `sharp` fallen einmal an; ein
Dauerläufer hielte dafür eine zweite Verbindung auf die Datenbank offen, solange
der Server läuft.* Der Thread schließt seine Verbindung und schließt
`parentPort` — ohne das hielte der offene Kanal ihn am Leben.

**`process.on('SIGTERM')` beendet erst die Threads, dann die Datei.**
Andersherum schriebe einer in eine Datei, deren WAL gerade gekürzt wird.
*`terminate()` ohne `await`: der Abschluss darf nicht warten, und ein beendeter
Thread schreibt keine Zeile mehr. Die halb umgestellte Zeile bleibt PNG — der
Knopf holt sie beim nächsten Lauf nach, und genau dafür ist er nie endgültig.*

**UND DIE LAUFENDEN THREADS STEHEN IN EINER MENGE, nicht in einer Variablen.**
*Im Regelfall läuft höchstens einer — aber das Nachrüsten fängt 1500 ms nach
dem Start an, und wer in genau diesem Augenblick den Umstellungsknopf drückt,
hat zwei.* **Eine Variable trüge dann nur den zweiten, und der erste schriebe
weiter in eine Datei, deren WAL gerade gekürzt wird.** `umstellung.laeuft`
fängt das nicht ab: es bewacht zwei **Umstellungen** und nicht zwei Läufe.

**Die Frage, ob es überhaupt etwas nachzurüsten gibt, bleibt im Haupt-Thread.**
Ohne sie entstünde bei jedem Start ein Thread für eine leere Liste. *Und
`maintainStorage()` ist nicht mehr `async`: es enthält nichts Asynchrones und
wird seit dieser Runde als **Abschluss eines Threads** gerufen — eine dort
geworfene Zusage fände keinen Empfänger, und eine unbehandelte Zusage nimmt in
Node den ganzen Server mit.*

### ABWEICHUNG: der Fingerprint kannte die Datei des Threads nicht

**Der Auftrag hat es vorausgesehen und zum Nachsehen aufgegeben — nachgesehen
ist es, und es traf zu.** `bestandslauf.js` wird nicht requiret, sondern an
`new Worker` gereicht; es steht damit in **keiner `require.cache`** des
Haupt-Threads und fiele aus der abgeleiteten Dateiliste heraus. **Der Server
führt es trotzdem aus, und genau das ist der Maßstab dieser Liste.**

**Gebaut ist die kleinstmögliche Antwort, die keine zweite Liste ist:** der Pfad
steht als `const BESTANDSLAUF` an **einer** Stelle, `new Worker` liest sie und
`bildeFingerprint()` liest dieselbe. *Eine Prüfung hält beide gegeneinander, und
eine zweite belegt am laufenden Server, dass eine Änderung an `bestandslauf.js`
den Fingerprint wirklich bewegt.* **Daraus wurde Stolperstein 286.**

### ABWEICHUNG: die README ist doch angefasst worden

**Der Auftrag sagt „DIE README WIRD NICHT ANGEFASST", und die Begründung dort
trägt — für das, was sie meint:** die README kennt kein „Instanz" mehr, und die
Kartenzahl ändert sich nicht. **Sie trägt aber auch den Handgriff**, mit dem ein
Betreiber die Prüfsummen der ausgelieferten Dateien von Hand nachrechnet
(`for f in … ; do sha256sum …`), **und der Prüfstand hält ihn gegen den
abgeleiteten Modulgraphen.** Ohne `bilder.js` und `bestandslauf.js` darin nennt
er zwei Dateien zu wenig — und dieser Handgriff wird im Ernstfall gebraucht
(Stolperstein 158). *Zwei Namen in einer Zeile; sonst ist die README
unangetastet.*

*Der Modulgraph im Prüfstand folgt dafür seit dieser Runde auch dem, was an
`new Worker` geht — abgeleitet aus derselben Zeile, nicht als gepflegte Liste
daneben.*

---

## 2. Die Übersicht fragt einmal statt vierhundertmal

### GEBAUT

In `GET /api/items` ziehen **fünf** Abfragen vor die Schleife, in dieselbe
Bauform, die 0.19.2 für die Fotos gebaut hat: **einmal fragen, in eine Karte
legen, in der Schleife nachschlagen.** *Aus 3200 Abfragen je Abruf werden
**405** — die fünf schrumpfen auf je eine, `testStats` bleibt bei 400.*

| statt | tritt |
|---|---|
| `qTags.all(it.id)` je Eintrag | `qAlleTags` — eine Abfrage über `item_tags`, nach `item_id` gruppiert |
| `qLinks.all(it.id).length` je Eintrag | `qLinkZahlen` — `SELECT item_id, COUNT(*) … GROUP BY item_id` |
| `qAnhangZahl.get(it.id)` je Eintrag | `qAnhangZahlen` — dieselbe Form |
| `schnitteJeKriterium(it.id)` je Eintrag | `qSchnittJeKriteriumAlle` — dieselbe Abfrage mit `r.item_id` in `SELECT` und `GROUP BY` |
| `qCat.get(…)` je Eintrag | `qAlleKategorien` — die Kategorien einmal in eine Karte |

**`testStats` BLEIBT, WIE ES IST** — Abschnitt E hat die gebündelte Form
gemessen, und sie ist langsamer.

**DIE EINZELFASSUNGEN BLEIBEN STEHEN, wo `detail()` sie braucht** — `qTags`,
`qLinks`, `qCat`, `schnitteJeKriterium()`, `qTestDays()`. *Dort geht es um
**einen** Eintrag, und eine zweite Bauform daneben wäre keine Ersparnis, sondern
eine zweite Wahrheit.*

> **EINE EINZELFASSUNG IST GANZ WEGGEFALLEN, und das ist eine Abweichung mit
> Grund:** `qAnhangZahl` fragte **nur** die Übersicht. `detail()` holt die
> Dateien selbst (`qAttachments`) und zählt sie im Browser. **Eine Abfrage, die
> niemand mehr ruft, ist kein Vorrat, sondern eine Zeile, die beim nächsten
> Lesen erklärt werden muss.**

### Was ausdrücklich nicht passiert ist

* **Kein `IN (…)` mit vierhundert Nummern.** Geholt wird alles und in der
  Schleife nachgeschlagen — dieselbe Begründung wie bei den Fotos.
* **Die Reihenfolge ist geblieben.** `qAlleTags` sortiert
  `it.item_id, t.name COLLATE NOCASE`, `qAlleTestTageSchmal`
  `item_id, day DESC, id DESC`: **zuerst nach `item_id`, dann wie bisher.**
  *Wer nur gruppiert, bekommt Einfügereihenfolge — und die Zeitleiste ihre
  Punkte verdreht.*
* **`item_id` fällt beim Einsortieren wieder weg.** Es ist der Schlüssel der
  Karte und kein Feld des Schlagworts; bliebe es stehen, trüge die Kachel ein
  Feld, das der Eintrag nicht hat.

---

## 3. Die Übersicht holt nicht mehr, was sie nicht zeigt

### a) Die Testtage der Listenantwort sind schmal

Ein Testtag der **Liste** trägt `id`, `day`, `rating` und `mine` — **nicht mehr
`tags` und `verfasser`**. Gebaut als `qAlleTestTageSchmal` mit
`testTageJeEintrag(benutzerId)` daneben; **`qTestDays()` in seiner alten Form
bleibt** und wird von `detail()` gerufen. **Zwei Formen für zwei Fragen, und der
Unterschied steht an beiden geschrieben.**

**NACHGEZÄHLT UND NICHT DEM KOMMENTAR GEGLAUBT, der das seit 0.17.0 behauptet.**
`testDays` wird an fünf Stellen gelesen; vier davon arbeiten auf dem Objekt aus
`detail()`, erkennbar an dem, was danebensteht:

| Stelle in `public/app.js` | liest daneben | also |
|---|---|---|
| `blockZusammenfassung()` (890) | `item.links`, `item.description` | Einzelansicht |
| Vergleich, `zeitpunkteVon()` (3327) | `it.ratings` | Einzelansicht |
| `drawSwitches()` (4432) | `item.tested`, `item.rejected` | Einzelansicht |
| Zeitleiste des Eintrags (5222–5235) | `sparkline(item.testDays)` | Einzelansicht |
| **`zeitleistePunkte()` (2762)** | `it.id`, `it.title` | **Liste** |

**`id` bleibt trotzdem drin.** Es kostet vier Bytes je Zeile und ist die einzige
Handhabe, falls die Zeitleiste je auf einen Punkt zeigen soll. *Was das an der
Antwortgröße ausmacht, steht in Abschnitt F.*

*Was das spart:* **11,61 ms werden 3,30 ms**, und die 1200 Abfragen nach den
Schlagworten der Testtage fallen ganz weg. *Von der Antwort gehen 96 kB ab.*

### b) Von den Links wird nur gezählt

`it.linkCount` kommt aus `SELECT item_id, COUNT(*) … GROUP BY item_id` statt aus
der Länge einer Zeilenmenge, die sonst niemand ansieht. *2,36 → 0,47 ms.* **Und
mit Rückfall auf 0:** eine Karte kennt nur, was sie gefunden hat — ohne ihn
trüge die Kachel eines Eintrags ohne Link gar kein Feld.

### c) `qTags` nennt seine Spalten

`t.*` wird `t.id, t.name`, geführt als **`TAG_SPALTEN` an einer Stelle** — genau
wie `PHOTO_SPALTEN` seit 0.19.2. **Die Einzelfassung für `detail()` liest
dieselbe Konstante**, sonst wäre es die zweite Wahrheit, gegen die diese
Bündelung überhaupt abgesichert wird. *Nachgesehen: `created_at` eines
Schlagworts wird in `public/app.js` nirgends gelesen.*

### Und das ist eine Wegnahme an einer öffentlichen Antwort

**Sie ist benannt und nicht stillschweigend gemacht:** im CHANGELOG mit Kasten,
in Abschnitt 5 des Projektstands mit dem Grund, und hier. **Vor 1.0.0 ist so
etwas erlaubt — aber niemand soll es aus einem Diff erfahren müssen.**

---

## 4. Die letzten acht „Instanz" im Bildschirmtext

**Acht Stellen, alle in `public/app.js`, alle im Bildschirmtext**, dieselbe
Ersetzung wie in 0.19.1: „Instanz" wird „Installation", gleiches Geschlecht,
gleiche Beugung, kein weiterer Eingriff.

| Zeile | Anfang der Stelle |
|---|---|
| 6358 | „Beim Anmelden fragt die Installation zusätzlich nach dem Code …" |
| 6428 | „… danach gibt ihn die Installation nicht mehr heraus" |
| 6499 | „… Die Installation speichert weder Adresse noch …" |
| 7698 | „… die Installation bewahrt ihn nirgends" |
| 7879 | „… die Installation speichert beides nicht." |
| 8156 | „Ohne Mailzugang läuft die Installation vollständig …" |
| 8809 | „… Installation still — bei … sind das etwa …" |
| 9067 | „… Deshalb fragt die Installation einmal nach deinem Passwort …" |

**DIE KOMMENTARE SIND NICHT ANGEFASST** — 33 Vorkommen in `public/app.js`,
37 in `server.js`, eines in `public/index.html`. *Sie sind kein Bildschirmtext,
und sie umzubenennen bewegte nur den Fingerprint.*

**UND DIE EINE ZEILE IN `server.js` BLEIBT:** „Die Instanz laeuft weiter …" ist
eine **Protokollzeile für den Betreiber** und keine Bildschirmmeldung. *Der
Auftrag ließ die Wahl; entschieden ist, sie zu lassen.* **Sie bleibt gezählt:**
der neue Wächter verlangt in `server.js` **genau eine** solche Zeile und nennt
sie beim Wortlaut — eine Ausnahme ohne Zahl deckte den nächsten echten Treffer
mit zu.

**Der Wächter zählt Nicht-Kommentarzeilen, nicht Vorkommen** — und er liest
dabei auch Kommentare **mitten in einer Zeile**: `public/app.js` baut seine
Oberfläche aus Vorlagen-Strings, und ein Kommentar darin fängt hinter einer
geöffneten Einsetzung an. *Der gemeinsame Wächter über den Cookienamen misst am
Zeilenanfang und hätte acht solcher Zeilen für Bildschirmtext gehalten.*

---

## 5. Was ausdrücklich NICHT gebaut wurde

**a) `testStats` GEBÜNDELT.** Gemessen 1,94 → 2,58 ms. Sie wäre langsamer und
stünde nur dabei, weil ihre vier Nachbarn es sind.

**b) EIN THREADPOOL ODER EIN DAUERLÄUFER-THREAD.** Ein Thread je Lauf, danach
beendet.

**c) DIE MELDUNG DES FORTSCHRITTS ÜBER EINEN OFFENEN KANAL.** Die Karte fragt
alle 1500 ms, und nach 0.19.2 kostet diese Frage Millisekunden.

**d) `detail()` UMSCHREIBEN.** Dort ist die Zeilenzahl einstellig.

**e) EINE ZÄHLERTABELLE ODER EIN ZWISCHENSPEICHER FÜR DIE KENNZAHLEN.** In
0.19.2 erwogen und verworfen.

**f) DIE THUMB-GEOMETRIE.** Das ist 0.19.4.

**g) DIE ABLEITUNGEN AUF WebP.** Die fahren in 0.21.0 mit.

---

## 6. BERICHTIGUNG: die Aufschlüsselung aus 0.19.2 war an leeren Tabellen entstanden

`Doku/Aenderungsprotokoll_0.19.2.md`, Abschnitt 11, nannte für fünf Abfragen der
Übersichtsschleife einzelne Millisekundenwerte und eine Summe daraus. **Diese
Zahlen sind an einer Datenbank entstanden, in der `tags`, `ratings` und
`test_days` LEER waren.** Gemessen wurde damit, was eine Abfrage kostet, die
**nichts findet** — eine Untergrenze und nicht der Preis am Bestand.

**Und der größte Posten fehlte ganz:** `qTestDays` stand nicht in der Liste,
weil es ohne Testtage nichts zu holen gab. Mit Inhalt ist es mit **11,61 ms**
der teuerste Einzelposten der ganzen Route — **mehr als die fünf genannten
zusammen.**

*Der Kasten steht seit dem 2. September im Änderungsprotokoll 0.19.2; hier steht
er ein zweites Mal, weil diese Runde auf den berichtigten Zahlen gebaut ist.*
**Es ist die vierte Zahl in dieser Kette, und sie ist auf dieselbe Weise
entstanden wie die drei davor: nicht erfunden, sondern an einem Aufbau erhoben,
der die Frage gar nicht stellen konnte.** *Daraus wurde Stolperstein 282.*

---

## 6a. BEFUND BEIM BAUEN: jede Gegenprobe seit 0.19.1 war unauswertbar

**Gefunden hat es der erste Gegenprobenlauf seit 0.19.1 — der dieser Runde.**
Die Zusage *„Und die Arbeitsdatei ist nicht mehr verfolgt"* (Gruppe „Die
Compose-Datei wird nicht überschrieben", gebaut in 0.19.1) ruft
`git ls-files` **ohne Auffangnetz**.

**EINE GEGENPROBENKOPIE HAT KEIN `.git`** — sie entsteht über
`git archive HEAD`. Der Aufruf wirft dort, und weil er **vor** jeder
Zusicherung steht, **riss er den ganzen Lauf ab**, statt eine Prüfung rot zu
färben (Stolpersteine 103 und 161). *Die Tabelle meldete für jeden einzelnen
Rückbau „LAUF ABGERISSEN", ganz gleich, was er bewirkte.*

**0.19.2 HAT KEINEN LAUF GEFAHREN, deshalb ist es dort nicht aufgefallen.** *Ein
Werkzeug, das nur am Ende einer Runde gebraucht wird, verrottet zwischen zwei
Runden, ohne dass irgendetwas rot wird.*

**GEBAUT:** gefragt wird nur dort, wo es ein Git gibt. Wo keines ist, steht
statt der Frage **ihre Voraussetzung** da — dass hier wirklich keine Ablage ist
— und nicht ein grüner Punkt ohne Gegenstand. *Die Zahl der Prüfungen bleibt in
beiden Fällen dieselbe, und stillschweigend übersprungen wird nichts.*

> **UND DIESELBE FALLE STAND ZWEIMAL IN DIESER RUNDE:** die neuen Zusagen zu
> Punkt 2 und 3 griffen ungeschützt auf `it.testDays.map` zu, und die Rückbauten
> 136 und 137 nehmen genau dieses Feld weg — auch sie rissen den Lauf ab.
> **Jeder Zugriff der neuen Gruppen geht jetzt durch eine Klammer.** *Der erste
> Gegenprobenlauf einer Runde gehört vor das Schreiben der Papiere und nicht
> danach.*

---

## 7. Was je Datei geändert wurde

| Datei | Was |
|---|---|
| `bilder.js` | **NEU.** `makeVariants()`, `legeBildAb()`, `istPNG()` samt `VARIANTS`, `WEBP_ABLAGE`, `PNG_MAGIE`, `PNG_MAGIE_HEX` — aus `server.js` herausgezogen, Zeile für Zeile unverändert. |
| `bestandslauf.js` | **NEU.** Der Worker: eigene Verbindung über `db.js`, eigener `sharp.concurrency()`, beide Schleifen, `reclaim()` am Ende, eine Meldung je Zeile. |
| `server.js` | **Punkt 1:** `starteBestandsThread()`, `BESTANDSLAUF` an einer Stelle, `bestandsThread` für SIGTERM, `ruesteVorschaubilderNach()` statt `backfillVariants()`, `maintainStorage()` nicht mehr `async`, der Fingerprint liest `BESTANDSLAUF` mit. **Punkt 2:** `qAlleTags`, `qLinkZahlen`, `qAnhangZahlen`, `qAlleKategorien`, `qSchnittJeKriteriumAlle` mit `schnitteJeEintrag()`. **Punkt 3:** `TAG_SPALTEN`, `qAlleTestTageSchmal` mit `testTageJeEintrag()`, `linkCount` aus `COUNT(*)`. `qAnhangZahl` ist weggefallen. |
| `db.js` | Der Nachweis der Wiederholbarkeit als Liste über `const db = open(DB_FILE)` — er trägt diese Runde und stünde sonst nirgends. |
| `keys.js` | Die Ansagen an den Betreiber bleiben im Haupt-Thread (`isMainThread`). |
| `public/app.js` | **Punkt 4:** acht Stellen im Bildschirmtext. |
| `pruefung.js` | Eine Gruppe für den Bestandslauf am echten Thread (ohne Server), eine für Kachel gegen Eintrag, ein Wächter über „Instanz" im Bildschirmtext, der Fingerprint über `bestandslauf.js`, der Modulgraph folgt `new Worker`. Zwei vorhandene Zusagen umgedreht statt gelöscht: die Testtage der Übersicht und „steht die Installation still". **Die Dateiliste des Sprachwächters kennt jetzt dreizehn statt elf Dateien.** **Und `git ls-files` reißt keine Gegenprobe mehr ab** (Abschnitt 6a). |
| `gegenprobe.js` | **Sechzehn neue** — fünfzehn ab Nummer 491 und **W14** am Prüfstand selbst. **Acht mitgegangen** (136, 137, 431–435, 458). **Keiner weggefallen.** |
| `README.md` | Zwei Dateinamen im Handgriff zum Nachrechnen der Prüfsummen. *Sonst unangetastet.* |
| `CHANGELOG.md` | Abschnitt **0.19.3**, mit Kasten wegen der schmaleren Listenantwort. |
| `Doku/Aenderungsprotokoll_0.19.3.md` | **NEU** — dieses Papier. |
| `Doku/Projektstand_Kriterion_0_19_3.md` | **`git mv`** aus `_0_19_2`. Kopf (Revision 51), Betriebsstand samt `busy_timeout`, **Abschnitt 5** wegen der schmaleren Listenantwort, **Stolpersteine 282 bis 286**, Prüfstand, Versionsgeschichte, Fahrplan. |
| `package.json`, `package-lock.json` | Version **0.19.3**. |

---

## 8. Der Fahrplan rückt nicht

**0.19.3 ist die Nummer, die dort schon stand, und der Name bleibt** —
„Bestandsläufe verlassen den Anfrageweg". *Er ist der Grund für die
Reihenfolge, und der gilt weiter: 0.19.4 und 0.21.0 fahren beide über den ganzen
Bildbestand.* **Was in der Zeile ergänzt ist: die Übersichtsschleife und die
acht Benennungen.**

---

## 9. Neue Stolpersteine

**Fünf, und sie zählen bei 282 weiter** — 281 war vergeben. *Die ersten vier
standen als Kandidaten im Auftrag; der fünfte kam beim Bauen dazu.*

| Nr. | Kernsatz |
|---|---|
| **282** | **Eine Messung an einer leeren Tabelle misst den Leerlauf und nicht den Preis** — und schlimmer: **sie verbirgt den größten Posten**, weil der ohne Inhalt gar nicht auftaucht. *`qTestDays` fehlte in der Aufschlüsselung von 0.19.2 vollständig und ist mit Inhalt teurer als die fünf genannten zusammen.* **Wer eine Abfrage misst, füllt vorher die Tabellen, aus denen sie liest.** |
| **283** | **`better-sqlite3` ist synchron — jede seiner Zeilen hält den Event Loop an.** Was daneben asynchron ist (`sharp` im Threadpool von libuv), hält sie nicht an. **Wer eine Blockade sucht, sucht das Synchrone** — und eine Pause ZWISCHEN den Zeilen hilft nicht gegen eine Blockade WÄHREND einer. *Der Median verrät es nicht; das 95. Perzentil schon.* |
| **284** | **Eine Bündelung ist kein Selbstzweck.** `testStats` gebündelt ist mit 2,58 ms langsamer als 400 Einzelabfragen mit 1,94 — die eine Abfrage mit Fensterfunktion kostet mehr, als das Bündeln spart. **Sie lohnt, wo sie etwas spart, und sonst nicht** — und „ihre vier Nachbarn sind es auch" ist kein Grund. |
| **285** | **Wer fragt, was er nicht anzeigt, bezahlt es zweimal** — beim Holen und beim Senden. *Die Übersicht holte je Testtag dessen Schlagworte (1200 Abfragen) und dessen Verfasser; gelesen hat beides dort nie jemand.* **Vor jeder Bündelung gehört die Frage, ob das Gebündelte überhaupt gelesen wird** — sonst wird eine Verschwendung bloß billiger. |
| **286** | **Ein Modul, das nur in einem Thread lebt, steht in keiner `require.cache`.** Eine Dateiliste, die aus dem Modulgraphen abgeleitet wird, sieht es deshalb nicht — **obwohl der Server es ausführt.** *Der Fingerprint kennte eine ausgelieferte Datei nicht, und das wäre eine halbe Aussage.* **Was an `new Worker` geht, gehört in dieselbe Ableitung** — über die eine Zeile, mit der der Thread erzeugt wird, und nicht über eine zweite gepflegte Liste. |

---

## 10. Die Zahlen

| | vorher (0.19.2) | nachher (0.19.3) |
|---|---|---|
| Prüfungen | 5108 | **5170** |
| Rückbauten in `gegenprobe.js` | 481 | **497** |
| höchste Rückbaunummer | 490 | **505** |
| Stolpersteine | 281 | **286** |
| Routen (`F_ROUTEN`) | 70 | **70** |
| Karten im Systembereich | 19 | **19** |
| markierte Migrationsblöcke | 8 | **8** |
| Austauschformat | 12 | **12** |
| Indizes auf `photos` | 3 | **3** |
| ausgelieferte Module | 7 | **9** |
| Abfragen je `GET /api/items` (400 Einträge) | 3200 | **405** *(nachgezählt)* |
| `GET /api/items` an 312 MB | 43 ms warm | **24 ms warm** *(am Prototyp gemessen)* |
| Antwortgröße derselben Route | 495.820 B | **356.443 B** *(342.343 gemessen + 14.100 gemessen)* |
| Verspätung des Haupt-Threads im Lauf (95 %) | 133,0 ms | **0,9 ms** |
| Fingerprint | `0cdc709d` | **`cdbe0925`** |

---

## 11. Die Gegenprobentabelle

**Gefahren wurden die sechzehn neuen Rückbauten und die acht mitgegangenen** —
nicht der volle Lauf über alle 497. *Jeder einzelne ist ein vollständiger
Prüflauf: rund sieben Minuten, in mehreren Nebenspuren nebeneinander.*

> **UND ES IST DER ERSTE AUSWERTBARE LAUF SEIT 0.19.1.** Der erste Anlauf
> dieser Runde meldete für **jeden** Rückbau „LAUF ABGERISSEN" — die Ursache
> steht in Abschnitt 6a. *Was hier steht, ist der Lauf danach.*

GEGENPROBE_PLATZHALTER

---

## 12. Offen geblieben

**IM FELD NOCH NICHT BESTÄTIGT.** *Nach dem Einspielen gehört ein Blick in
Systembereich → Datenbank → Kennzahlen: steht dort ein anderer Wert als der
Fingerprint oben, liegt auf dem Wirt eine Datei, die kein Commit trägt
(Stolperstein 158).* **Ein hartes Neuladen gehört davor.**

> **UND VORHER GEHÖRT `0cdc709d` EINGESPIELT.** Auf dem Wirt lief zuletzt
> `f4f8a479` — das ist 0.19.2 **ohne ihre zweite Hälfte**: der deckende Index
> `idx_photos_kachel` und die eine Fotoabfrage der Übersicht sind erst in
> `0cdc709d` dazugekommen. *Wird 0.19.3 darüber gespielt, trägt der nächste
> Feldbeleg zwei Runden zugleich, und wenn etwas klemmt, ist nicht mehr zu
> sagen, welche es war.*

**DER EINE NACHWEIS, DER NUR AM WIRT ZU FÜHREN IST, STEHT WEITER AUS** — und er
steht seit 0.19.1 aus: ein PNG einfügen, den Schalter aus- und wieder
einschalten und **den Umstellungslauf fahren** — währenddessen in der Übersicht
blättern und im Systembereich klicken. **Reagiert die Oberfläche durchgehend,
ist Punkt 1 im Feld belegt.**

**Weiter offen, unverändert:**

- **Der volle Gegenprobenlauf** über alle 497 Rückbauten — rund vierzig Stunden,
  seit einundzwanzig Runden ausstehend. *Diese Runde hat die sechzehn neuen und
  die acht mitgegangenen gefahren; der Rest steht aus.*
- **`JSON.stringify` kostet 2,12 ms** für die schmale Antwort. *Nicht zu ändern,
  aber die Zahl gehört daneben: sie ist die Untergrenze dessen, was diese Route
  kosten kann.*
- **Wie der echte Bestand geformt ist, ist nicht gemessen.** Alle Zahlen zu
  Punkt 2 und 3 gelten für drei Schlagworte, drei Bewertungen, drei Testtage und
  einen Link je Eintrag.
