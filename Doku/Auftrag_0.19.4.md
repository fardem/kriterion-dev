# Auftrag 0.19.4 — „Die Kachel zeigt, was das Original hergibt"

**Vorher: Version 0.19.3 · Fingerprint `cdbe0925` (am 2. September 2026 im Feld
bestätigt) · 5170 Prüfungen · 497 Rückbauten (höchste Nummer 505) ·
286 Stolpersteine · `F_ROUTEN` 70 · acht Zwecke der zweiten Bestätigung ·
acht Migrationsblöcke · Austauschformat 12 · neunzehn Karten im Systembereich ·
neun ausgelieferte Module**

> **DIESE RUNDE BAUT EINEN FEHLER ZURÜCK, DER SEIT DEM ERSTEN TAG DA IST.**
> `thumb` ist 400 Bildpunkte auf der **langen** Kante; jede Stelle, die ein
> `thumb` zeigt, schneidet es mit `object-fit: cover` zu und braucht deshalb
> die **kurze**. Ein 16:9-Bildschirmfoto wird auf der Kachel damit **immer**
> hochgerechnet.
>
> **UND SIE IST DIE ERSTE RUNDE, DIE DEN BESTANDSLAUF AUS 0.19.3 BENUTZT.**
> Genau dafür stand 0.19.3 davor.

---

## 0. Was vor dem ersten Handgriff zu tun ist

1. **`git status` muss leer sein**, und der Arbeitsbranch steht fest.
2. **`npm test` einmal gegen den Ausgangsstand** — er muss **5170 von 5170**
   melden. Meldet er etwas anderes, ist der Ausgangsstand nicht der, von dem
   dieses Papier ausgeht; **dann erst klären, dann bauen.**
3. **Dieses Papier ganz lesen, bevor die erste Zeile fällt.** Abschnitt 1 ist
   eine Messung und kein Baupunkt — **wer ihn überspringt, baut auf geraten.**

> **UND EINE SACHE VORWEG, DIE KEIN BAUPUNKT IST.** Auf dem Wirt läuft
> `cdbe0925`, und das ist der gebaute Stand dieser Vorrunde — **zum ersten Mal
> seit 0.19.1 stimmt der Wirt wieder mit dem Repo überein.** *0.19.2 ist dabei
> nie einzeln gelaufen; sie ist mit 0.19.3 mitgereist. Was der Betreiber an
> Geschwindigkeit meldet, gehört deshalb zwei Runden zugleich und ist nicht
> aufzuteilen.* **Für diese Runde heißt das: der nächste Feldbeleg trägt wieder
> genau eine Runde, und das soll so bleiben.**

---

## Die Nummer: PATCH

**Der Maßstab ist nicht der Aufwand, sondern die Frage: kann die Installation
danach etwas, was sie vorher nicht konnte?** Nein. Dieselben Knöpfe, dieselben
Bilder, dieselbe Antwort — die Kachel ist nur scharf.

**Kein Schema, keine Migration, kein neuer Zweck, keine neue Route, keine neue
Karte.** Das Austauschformat bleibt **12**, `F_ROUTEN` bleibt **70**, die Zahl
der Migrationsblöcke bleibt **acht**.

> **EINE SACHE WÄCHST, und sie gehört ausgesprochen: die Datenbank.** Ein
> `thumb` mit 400 auf der **kurzen** Kante trägt bei 16:9 rund **das Dreifache
> an Bildpunkten**. Heute stehen alle `thumb` zusammen bei **14,4 MB** von
> 568,9 MB des Bildbestands *(gemessen am 1. September 2026 an der laufenden
> Installation)*. **Wie viel daraus wird, ist NICHT gemessen — das ist
> Abschnitt 1.**

---

## 1. Was zu messen ist, BEVOR gebaut wird

**DIESE RUNDE HAT KEINE MESSUNG IM RÜCKEN, und das ist der Unterschied zu
0.19.3.** Dort stand jede Zahl vor dem ersten Handgriff fest. Hier stehen drei
Fragen offen, und **jede einzelne kann die Bauform ändern**. *Wer sie
überspringt, trägt eine Schätzung in ein Papier — und die vierte berichtigte
Zahl dieser Kette wäre die fünfte (Stolperstein 280).*

### A. Was die Kachel wirklich fordert

**Gemessen wird am echten Bildschirm, nicht am Stylesheet.** Die Übersicht
setzt `repeat(auto-fill, minmax(240px, 1fr))`, die Kachel ist `aspect-ratio:
1/1` — **wie breit sie wirklich ist, hängt am Fenster.** Der bisher genannte
Wert **313 px** stammt von einem Bildschirm und ist keine Regel.

**Zu erheben, an den Geräten, die wirklich benutzt werden:**

| | zu messen |
|---|---|
| Kachelbreite in CSS-Pixeln | am breitesten und am schmalsten Fenster |
| `devicePixelRatio` | je Gerät — ein 2×-Bildschirm verdoppelt die Forderung |
| der engere Ausschnitt | `zoom` bis 400 % vervielfacht sie noch einmal |

**Daraus folgt die Zahl, und nicht andersherum.** *Heute ist die kurze Kante
bei 16:9 rechnerisch 225 px; eine Kachel von 313 px auf einem 2×-Bildschirm
fordert 626. **Ob die Antwort 400, 512 oder 640 heißt, entscheidet diese
Messung** — und was sie kostet, entscheidet B.*

### B. Was es an der Datenbank kostet

**An hundert zufällig gezogenen Bildern des echten Bestands**, wie es 0.19.0
für die WebP-Leiter gemacht hat:

* die Größe des heutigen `thumb` je Bild,
* die Größe des neuen `thumb` **je erwogener Zahl** (400, 512, 640),
* **hochgerechnet auf alle 1032 Bilder** — heute 14,4 MB.

> **UND DIE VERSUCHUNG STEHT HIER, DAMIT SIE NIEMAND ÜBERSIEHT:** `q: 78` an
> der Ableitung zu senken, um das Wachstum aufzufangen. **Das ist eine zweite
> Änderung an derselben Zeile**, und sie macht die Messung unlesbar — erst die
> Geometrie, und wenn danach jemand an der Güte drehen will, ist das eine
> eigene Runde mit eigener Messung.

### C. Ob der Lauf seine Zeilen billig findet

**Der Lauf muss wissen, welche `thumb` noch die alte Geometrie tragen.** Ein
Merker in der Datenbank wäre ein Schema und ist ausgeschlossen; die Zeile sagt
es aber selbst — **die kurze Kante des gespeicherten `thumb`**. `sharp`
liest die Maße aus dem **Kopf** der JPEG-Datei und dekodiert sie dafür nicht.

**Zu messen:** was es kostet, für alle 1032 Zeilen `thumb` zu lesen und den
Kopf zu befragen. *Ist es billig, läuft der Lauf wie `backfillVariants()` beim
Start und endet nach einem Durchgang von selbst. Ist es teuer, wird es ein
Knopf wie die PNG-Umstellung.* **Die Entscheidung fällt an dieser Zahl und
nicht am Geschmack.**

---

## 2. Die Ableitungsregel folgt der Anzeigeregel

### Der Befund, und er ist eine Regel und kein Einzelfall

**Nachgesehen im Stylesheet — es gibt genau zwei Anzeigearten, und jede fordert
eine andere Kante:**

| Anzeige | wo | fordert |
|---|---|---|
| `object-fit: cover` | Kachel der Übersicht (`.card-img img`), Streifen am Eintrag (`.thumb img`), Kommentarbild (`.cmt-img img`), Streifen im Vollbild (`.lb-thumb img`) | **die kurze Kante** |
| `object-fit: contain` | Betrachter am Eintrag (`.viewer img`), Bühne im Vollbild (`.lb-stage img`) | **die lange Kante** |

**`cover` füllt und schneidet ab, `contain` passt ein und lässt Rand.** Wer
einschneidet, braucht die kurze Kante groß genug; wer einpasst, die lange.

> **DARAUS FOLGT UNMITTELBAR: `medium` BLEIBT, WIE ES IST.** 1600 auf der
> **langen** Kante ist für `contain` genau richtig. **Wer beide Ableitungen
> „der Ordnung halber" gleich behandelt, macht `medium` schlechter** — und
> nebenbei die Datenbank deutlich größer. *`medium` ist in dieser Runde
> ausdrücklich nicht anzufassen.*

### GEBAUT WIRD

**In `bilder.js`** *(dort steht `makeVariants()` seit 0.19.3, nicht mehr in
`server.js`)*: `VARIANTS.thumb` bekommt die kurze Kante, `VARIANTS.medium`
bleibt unverändert. Heute steht dort eine Zeile für beide:

    .resize(v.px, v.px, { fit: 'inside', withoutEnlargement: true })

**`fit: 'inside'` begrenzt die LANGE Kante. Für `thumb` wird daraus `fit:
'outside'`, das die KURZE begrenzt.** *Die Tafel `VARIANTS` trägt die
Unterscheidung, nicht ein `if` in der Schleife: eine Ableitung, die ihre Regel
in einer Verzweigung versteckt, ist beim nächsten Lesen eine Suche.*

### DIE FALLE, UND SIE IST DER EIGENTLICHE BAUPUNKT

**`fit: 'outside'` KENNT KEINE OBERE GRENZE FÜR DIE LANGE KANTE.** Ein
Bildschirmfoto über zwei Monitore — 5120 × 1440 — ergibt bei kurzer Kante 400
ein `thumb` von **1422 × 400**. Ein Panorama macht daraus ein Vielfaches. *Aus
der Ableitung, die klein sein soll, wird die größte in der Tabelle.*

**GEBAUT WIRD DESHALB EINE ZWEITE GRENZE**, und ihre Zahl gehört gemessen wie
alles andere: die lange Kante bekommt einen Deckel. **Was dabei NICHT passieren
darf: serverseitig zuschneiden.** *Der Ausschnitt entsteht im Browser über
`object-position` und `transform` aus dem Fokuspunkt (`ausschnitt()` in
`public/app.js`); ein am Server beschnittenes `thumb` nähme dem Fokuspunkt
seine Fläche, und der eingestellte Ausschnitt zeigte danach etwas anderes.*
**Die Ableitung skaliert, sie schneidet nicht.**

---

## 3. Der Bestand wird nachgezogen — im Thread aus 0.19.3

### GEBAUT WIRD

**Eine dritte Aufgabe für `bestandslauf.js`.** Das Modul kennt seit 0.19.3
`umstellung` und `vorschaubilder`; hier kommt das Nachziehen der Vorschaubilder
mit neuer Geometrie dazu. **Der Haupt-Thread ruft es über
`starteBestandsThread(aufgabe, zeilen, fertig)` wie die beiden anderen.**

* **Die Auswahl der Zeilen trifft der Haupt-Thread**, wie beim Nachrüsten:
  sonst entsteht ein Thread für eine leere Liste (19 ms Verbindung, 76 ms
  `sharp`).
* **Der Stand reist wie gehabt zurück** — eine Meldung je Zeile, und sie trägt
  den **ganzen** Stand und keine Zunahme.
* **`reclaim()` am Ende**, wie bei der Umstellung: die alten `thumb` geben ihre
  Seiten frei, und ohne `incremental_vacuum` gibt SQLite sie nicht zurück.
* **Ein Fehler an einer Zeile reißt den Lauf nicht ab.**

### WAS SICH NICHT NACHZIEHEN LÄSST, und das gehört benannt

**VIDEOZEILEN KÖNNEN NICHT.** Bei `art = 'video'` steht in `data` die
Videodatei; `thumb` und `medium` sind aus dem **Standbild** entstanden, das der
Browser beim Hochladen mitgeschickt hat. **Es gibt keine Vorlage mehr, aus der
sich neu ableiten ließe** — und der Kernsatz gilt weiter: *der Server öffnet
nie ein Video.* **Diese Kacheln behalten die alte Geometrie**, bis jemand das
Video neu hochlädt. *Das ist keine Lücke, sondern eine Folge der Bauform, und
sie gehört in den Projektstand.*

**KOMMENTARBILDER HABEN KEIN ORIGINAL.** In `comment_images` steht in `data`
das 1600-px-JPEG und daneben `thumb` — **ein Original gibt es dort
ausdrücklich nicht** (die Entscheidung steht in `bilder.js`). Ein neues `thumb`
entstünde also aus einem JPEG, das schon eines ist. **Zu entscheiden, mit
Begründung im Änderungsprotokoll:**

* *dafür:* die Kommentarkachel ist genauso unscharf wie die Übersichtskachel,
  und `data` mit 1600 px reicht für jede erwogene Zahl locker;
* *dagegen:* es ist eine zweite Kodierung. **Die Zahl dazu steht schon da:**
  MAE 0,06 nach einer Runde, 0,10 nach sechs — *es läuft aus statt
  davonzulaufen, und die erste Kodierung kostet mit 1,89 ohnehin ein
  Vielfaches.*

**DER IMPORT ZIEHT VON SELBST MIT.** Er rechnet `thumb` und `medium` neu aus
dem Original — eine eingespielte Datei trägt danach die neue Geometrie, ohne
dass jemand etwas drückt. *Und der Export ist gar nicht berührt: `photos.thumb`
geht nie in eine Austauschdatei.* **Deshalb bleibt das Austauschformat 12.**

---

## 4. Was ausdrücklich NICHT gebaut wird

**a) `medium`.** Siehe Abschnitt 2: `contain` will die lange Kante, und 1600
ist richtig.

**b) EINE ÄNDERUNG AN `q: 78`.** Eine zweite Änderung an derselben Zeile macht
die Messung unlesbar.

**c) DIE ABLEITUNGEN AUF WebP.** Die fahren in 0.21.0 mit, wo ohnehin über
Verfahren entschieden wird — **ein** Durchgang über den Bestand statt zwei.
*Die Geometrie hängt an keinem Verfahren; genau deshalb steht sie hier und
nicht dort.*

**d) EIN ZUSCHNITT AM SERVER.** Siehe Abschnitt 2.

**e) EIN MERKER IN DER DATENBANK.** Kein Schema. Die Zeile sagt selbst, welche
Geometrie sie trägt.

**f) EIN ZWEITER BESTANDSLAUF NEBEN DEM VORHANDENEN.** `bestandslauf.js` gibt
es seit 0.19.3, und es fährt schon zwei Aufgaben. Eine dritte ist eine Zeile,
ein zweites Modul wäre eine zweite Wahrheit (Stolperstein 47).

---

## Bauregeln

* **Deutsch überall** — Quelltext, Kommentare, Meldungen, Papiere. Der
  Sprachwächter läuft mit. *Und seine Dateiliste ist **gepflegt**: wer eine
  Quelltextdatei anlegt, trägt sie dort ein — in 0.19.3 hat er zwei neue
  Dateien nicht angesehen, und in einer stand ein Wort aus seiner eigenen
  Sperrliste (Stolperstein 286).*
* **Keine neue Abhängigkeit.**
* **Keine Binärdateien im Repo. Keine Tags.**
* **Jede Zahl in den Papieren ist gemessen oder als ungemessen benannt.**
  *Diese Runde fängt mit einer Messung an, damit es dabei bleibt.*
* **Neue Stolpersteine ab 287.** Kandidat aus dem Befund, die Nummerierung
  entscheidet die bauende Sitzung:
  - *Die Ableitungsregel folgt der Anzeigeregel.* Wer mit `cover` anzeigt,
    braucht die **kurze** Kante; wer mit `contain` anzeigt, die **lange**. Eine
    Ableitung, die beide gleich behandelt, ist für eine der beiden falsch — und
    zwar seit dem ersten Tag und ohne dass irgendetwas rot wird.
* **Neue Rückbauten ab 506**, für jeden gebauten Punkt mindestens einer.
  **Ein Rückbau, der den Lauf abreißt, belegt nichts** (Stolperstein 161) —
  jede neue Zusage fasst ihre Felder durch eine Klammer. *In 0.19.3 ist genau
  das zweimal passiert.*
* **Rückbau 44 und die anderen mitgehen lassen, nicht löschen**
  (Stolperstein 201), wo ihr Suchtext sich durch diese Runde verschiebt.
  *Betroffen ist mindestens 435 — er steht an `WEBP_ABLAGE` in derselben Datei.*
* **Der Prüfstand wächst von 5170**, die Rückbauliste von 497 (höchste
  Nummer 505).
* **UND DER GEGENPROBENLAUF GEHÖRT VOR DAS SCHREIBEN DER PAPIERE, nicht
  danach.** *In 0.19.3 hat er drei Dinge gefunden, die sonst niemand gefunden
  hätte — darunter eine Zusage, die grün blieb, obwohl ihr Gegenstand
  abgeschaltet war.*

### Was aus den letzten Runden mitzunehmen ist

* **Vor dem Nummerieren wird gezählt, nicht geblättert** (Stolperstein 168).
* **Ein stummer Rückbau ist ein Fund und keine Formalie.**
* **Was aufgehoben wird, wird mit dem Grund hingeschrieben und nicht gelöscht**
  (Stolperstein 201).
* **Zwei Tabellen über dieselbe Sache dürfen sich nicht widersprechen**
  (Stolperstein 47).
* **Eine Messung an einer leeren Tabelle misst den Leerlauf** (Stolperstein
  282) — hier: eine Messung an erzeugtem Material misst das Material
  (Stolperstein 270). **Gezogen wird aus dem echten Bestand.**

---

## Am Ende des Chats

* Der Stand ist committet und auf den Arbeitsbranch geschoben. **Sinnvoll
  geschnittene Commits mit deutschen Meldungen.**
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: **`git status` muss leer
  sein**, und **`npm test` läuft ein letztes Mal gegen genau diesen Stand.**
* **`Doku/Aenderungsprotokoll_0.19.4.md`** liegt im Branch: was gebaut wurde je
  Datei, die Messungen aus Abschnitt 1 mit ihrem Aufbau, Abweichungen mit
  Begründung, die Entscheidungen mit ihrer Begründung, neue Stolpersteine
  (**ab 287**), die Gegenprobentabelle **aus `gegenprobe.js`**, Prüfungszahlen
  vorher/nachher (**vorher: 5170**), Rückbauten vorher/nachher (**vorher: 497,
  höchste Nummer 505**), Offengebliebenes.
* Die Zeile „0.19.4 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** **`public/` gehört dazu** (Stolperstein 158).
  *Es kommt keine Datei dazu; die neun ausgelieferten Module bleiben neun.*
* **DIESE RUNDE IST KEINE DATENBANKSTUFE — sag es ausdrücklich.** Kein
  Migrationsblock, keine Schemaänderung, kein neuer Index, das Austauschformat
  bleibt 12. **ABER: der Lauf überschreibt jede `thumb`-Spalte.** *Die alten
  Ableitungen sind danach weg — sie sind aus dem Original wiederherstellbar,
  und genau deshalb ist es keine Stufe. Eine Sicherung schadet trotzdem nie,
  und der Dialog sagt das, falls es ein Knopf wird.*
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — **im
  Chat, nicht in den Dokumenten.** Darunter: **eine Kachel mit einem
  16:9-Bildschirmfoto ansehen** *(sie ist scharf, auch mit engerem
  Ausschnitt)*, **den Streifen am Eintrag ansehen** *(dieselbe Schärfe)*, **den
  Betrachter daneben** *(unverändert — `medium` ist nicht angefasst)* und **die
  Kennzahlen** *(`thumb` ist gewachsen, und um wie viel steht im
  Änderungsprotokoll)*.
* **UND DER EINE NACHWEIS, DER SEIT 0.19.1 AUSSTEHT, IST IN DIESER RUNDE
  ENDLICH BILLIG ZU FÜHREN:** der Lauf über den Bestand ist der Anlass. **Ihn
  fahren und dabei in der Übersicht blättern und im Systembereich klicken** —
  reagiert die Oberfläche durchgehend, ist der Thread aus 0.19.3 im Feld
  belegt, und die Beobachtung gehört in beide Änderungsprotokolle.

---

## Die Dokumente

* **Der Projektstand wird umbenannt** (`git mv` auf `_0_19_4`), und **alle
  Verweise sind nachzuziehen.** Kopf, Betriebsstand, Stolpersteine, Prüfstand,
  Versionsgeschichte, **Fahrplan** — und **Abschnitt 5**, denn die
  Ableitungsregel ist eine Entscheidung, die nicht rückgängig gemacht werden
  soll: *die Ableitung folgt der Anzeige.*

* **NEU IN DEN PROJEKTSTAND, weil es bisher nirgends steht:** dass **die
  Videokacheln die alte Geometrie behalten** und warum — es gibt keine Vorlage
  mehr. *Eine Ausnahme, die nirgends steht, sieht beim nächsten Lesen wie ein
  Fehler aus.*

* **Der Fahrplan rückt NICHT.** 0.19.4 ist die Nummer, die dort schon steht,
  und der Name bleibt. **Was in der Zeile zu ersetzen ist: die Zahl 1034.**
  *Gezählt sind es **1032** Bilder (Projektstand, Abschnitt 10a, Messung vom
  1. September 2026); das Sammelblatt trägt 1034 und ist mitzuziehen.*

* **`CHANGELOG.md`** bekommt den Eintrag in der Form ab 0.17.2: **eine Zeile je
  Änderung**, die Abschnittsnamen vor der Zeile — **mit Kasten**, wegen des
  Laufs über den Bestand und wegen der wachsenden Datenbank.

* **Das Sammelblatt** verliert Punkt 7: er ist gebaut. *Erledigtes bleibt dort
  nicht als durchgestrichene Zeile stehen — ein gestrichener Punkt sieht beim
  Lesen aus wie ein offener.* **Was von ihm bleibt, steht danach im
  Änderungsprotokoll und im Projektstand.**

* **DIE README WIRD NUR ANGEFASST, WENN EINE DATEI DAZUKOMMT.** Sie trägt den
  Handgriff, mit dem sich die Prüfsummen der ausgelieferten Dateien nachrechnen
  lassen, und der Prüfstand hält ihn gegen den Modulgraphen. *Nach heutigem
  Plan kommt keine Datei dazu — dann bleibt sie unangetastet.*

* **DAS KONZEPTPAPIER UND DAS VIDEOPAPIER WERDEN NICHT ANGEFASST.**

* **`Doku/Auftrag_0.19.3.md` fällt mit diesem Auftrag weg** — *es liegt immer
  nur einer im Repo, und was 0.19.3 gebracht hat, steht in ihrem
  Änderungsprotokoll.* **Dieser hier fällt weg, wenn der nächste geschrieben
  wird.**

### Der Fahrplan steht anderswo, und das mit Absicht

> **DER PLAN STEHT IM PROJEKTSTAND, ABSCHNITT 10 — und sonst nirgends.** Ein
> Auftrag ist kein Ort für den Fahrplan: er wird beim Schreiben des nächsten
> weggeworfen, und was darin stand, wäre dann weg.

---

## Was danach offen bleibt

*Damit es nicht wieder gefunden werden muss:*

- **Der volle Gegenprobenlauf** über alle Rückbauten — rund vierzig Stunden,
  seit zweiundzwanzig Runden ausstehend. *0.19.3 hat die vierundzwanzig
  gefahren, die sie anfasste; der Rest steht aus.*
- **Die Zeitprobe mit dem zu engen Fenster** *(„Eine Sekunde vor Ablauf trägt
  der Link noch")* wird unter Last rot, ohne dass an ihr etwas falsch wäre.
  *In 0.19.3 ist sie in einer Gegenprobe wieder aufgetaucht. Der Weg wäre
  klein: ein Fenster, das nicht an einer Sekunde hängt.*
- **Ob `medium` ebenfalls `nearLossless` werden sollte**, ist nicht gemessen —
  eigener Lauf, berührt die Auslieferung. *Steht im Projektstand, Abschnitt 10.*
- **Die `effort`-Leiter am echten Bestand.** Dieselbe Leiter über hundert
  gezogene Bilder, Größe **und** Zeit.
