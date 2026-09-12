# Änderungsprotokoll 0.30.0 — „Der Prüfstand wird schnell, das Telefon wird ruhig"

**Fünf geplante Punkte, vier Befunde aus dem Betrieb und zwei aus dem
Nachmessen · 12. September 2026 · gebaut auf 0.29.0 (`0336d3a5`).**

> **FINGERPRINT DIESER RUNDE: `2363b00a`** — gerechnet am gebauten Stand,
> **vor dem Einspielen**. Er deckt `node_modules` nicht ab und hängt an jeder
> Datei der Liste — auch an einem Kommentar.
>
> **ACHTZEHN DATEIEN, WIE IN DEN BEIDEN VORRUNDEN.**
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(dieselben achtzehn Dateien)* | **`2363b00a`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`2363b00a`** |
> | **Aus der laufenden Installation gemeldet** | *steht aus — trägt der Betreiber nach* |
>
> **ZWEI QUELLEN, EIN WERT.** *Die dritte kommt aus dem Feld und steht hier als
> offener Punkt und nicht als Fußnote.*

> **DIE ZAHL, AN DER DIESE RUNDE GEMESSEN IST:**
>
> | | Lauf | Gruppen | Prüfungen |
> |---|---|---|---|
> | **vorher** *(0.29.0, dieselbe Maschine)* | **464,4 s** | 329 | 6662 von 6662 grün |
> | **nachher** *(0.30.0)* | **261,3 s** | **329** | **6690 von 6690 grün** |
>
> **PFLICHT WAREN 280 SEKUNDEN, ZIEL 250** *(F6)*. **Erreicht sind 261,3 — die
> Pflicht mit 19 Sekunden Abstand, das Ziel um 11 Sekunden verfehlt.** *Die
> Zahl der Prüfgruppen ist dabei nicht gesunken und die Zahl der Prüfungen
> gestiegen.*
>
> **UND DER GRÖSSTE GEWINN IST NICHT DER LAUF, SONDERN DIE GEGENPROBE.** *Sie
> fährt den ganzen Prüfstand einmal JE RÜCKBAU — 203 gesparte Sekunden je
> Rückbau, und die Liste trägt 906.*

---

## Die Versionsnummer

**0.30.0 IST MINOR — Regel 5.1 —, UND DER GRUND IST EINE EINZIGE ENTSCHEIDUNG**
*(F1 und F2)*. *Eine Installation, die ihre Kostenstufe und ihre Mailfristen aus
einem Schalter nehmen kann, **kann etwas, was sie vorher nicht konnte**. Das ist
eine Funktion und keine Reparatur.*

> **FIELEN F1 UND F2 AUF „NEIN", WÄRE DIE RUNDE PATCH GEWESEN und hieße 0.29.1.**
> *Der Betreiber hat beide mit „ja" beantwortet, am 12. September 2026, vor der
> ersten Zeile.*

**KEIN SCHEMAANTEIL.** *Keine Tabelle, keine Spalte, kein Index, kein
Migrationsblock.* **Das Austauschformat bleibt 16, die Migrationsblöcke bleiben
zwölf, `F_ROUTES` bleibt 73.**

---

## Was diese Runde am Auftrag berichtigt hat

**VIER ANTWORTEN DES AUFTRAGS HAT DIE MESSUNG BERICHTIGT**, und drei davon
hätten beim Bauen einen Schaden angerichtet.

| | der Auftrag sagte | gemessen |
|---|---|---|
| **die Sternzeile** *(F12)* | *der schmale Dreispalter fällt, und der Kasten wird kleiner* | **er würde GRÖSSER — 607 statt 580 px**, jeder Name bricht fünfzeilig um, und die Seite rollt seitlich. *Projektstand 5.3 behält recht; gebaut ist weniger Luft in derselben Bauform* |
| **die Vokabelkarte** *(F14)* | *der dritte Weg: Beschriftung und Feld in EINE Zeile* | **er bricht ALLE VIERZEHN Beschriftungen um, drei davon dreizeilig** — *also genau das, was er am Vorschlag des Betreibers widerlegen sollte. Gebaut ist dasselbe Mittel wie am Bewertungskasten* |
| **C1a** | *49 Pixel* | **98 Pixel** *(537 → 439)*. *Die Zeilenhöhe des Namens war im Auftrag nicht mitgerechnet* |
| **die Schlüsselzahl** | *„die Sprachdateien stehen danach wieder auf 1346 — einer weniger, einer mehr"* | **1347** — *weil die neue Wache beim Bauen einen zweiten festsitzenden Satz gefunden hat* |

> **UND EINE ANTWORT HAT DIE MESSUNG NICHT BERICHTIGT, SONDERN ERLEDIGT:** *F8
> war eine Frage („greift der Lauf bei jedem Push wirklich?"), und sie ließ sich
> durch Nachsehen beantworten statt durch Bauen.* **Der Commit `d82b3d5` ändert
> ausschließlich `Doku/Auftrag_0.30.0.md` und hat Lauf 726 ausgelöst: 454
> Sekunden, grün.** *Dieselbe Beobachtung an drei weiteren reinen
> Papier-Commits. Es war nicht die Einrichtung, sondern der Blick.*

---

## Die Bauabschnitte

### BA 4 — Die Zeitmessung *(sie kam zuerst)*

**„OHNE DIESE ZAHL IST JEDE BESCHLEUNIGUNG GERATEN" steht seit dem 8. September
im Fahrplan** — deshalb steht dieser Abschnitt vor allen anderen.

**GEBAUT SIND ZWEI SACHEN UND EIN SCHALTER:**

* **Ein Zeitnehmer an `group()`**, der jede Gruppe schließt, sobald die nächste
  beginnt — und die letzte in `endBlock()`.
* **Eine Schlusstafel**, immer, im Schlussblock und nicht daneben: die zehn
  teuersten Gruppen mit Zeit und Anteil, darunter **zwei** Zahlen — die Zeit in
  den Gruppen und die des ganzen Laufs. *Sie sind verschieden: die Summe der
  Gruppen lässt weg, was zwischen ihnen liegt.*
* **Die Zeit JE Gruppe nur auf Schalter** *(F5)* — `TESTBENCH_ZEIT=1`. *Eine
  Zeile je Gruppe macht die Ausgabe um 329 Zeilen länger.*

> **DER SCHALTER IST EINE UMGEBUNGSVARIABLE UND KEIN ZWEITES ARGUMENT:**
> *`argv[2]` trägt den Namensfilter, und `node testbench.js Rechte 1` sähe aus
> wie ein zweiter Name.*
>
> **GEMESSEN WIRD AUCH, WAS DER FILTER ÜBERGEHT — GEZEIGT WIRD ES NICHT.** *Der
> Filter nimmt die Ausgabe weg und nicht die Arbeit; die Tafel zeigt trotzdem
> nur die gezeigten Gruppen. Sonst stünde in einem gefilterten Lauf der Name
> einer Gruppe, die er gerade verschweigt.*

**DIE TAFEL IST EINE REINE FUNKTION**, und das ist kein Geschmack: *„die ZEHN
teuersten" lässt sich an einem Lauf mit zwei Gruppen nicht belegen.* **Die
Zusage fährt sie an zwanzig gestellten Zahlen, in null Millisekunden.**

**UND KEINE ZEILE DER TAFEL SIEHT AUS WIE EINE GRUPPE ODER EIN ROTER PUNKT:**
*`counterproof.js` liest die Ausgabe und erkennt Gruppen an „── " am
Zeilenanfang, rote Punkte an genau zwei Leerzeichen vor einem Kreuz.*

### BA 1 — Der Wächter erkennt den Prüflauf

**DER BEFUND IST EIN TIPPFEHLER, UND ER STAND SEIT 0.21.0 DA.** *Der Kommentar
über `foreignServer()` sagte: „ein Prozess zählt als fremd, wenn sein Befehl auf
server.js oder testbench.js endet." Der Ausdruck drei Zeilen darunter suchte
nach `pruefung.js` — einer Datei, die es in diesem Repository nie gegeben hat.*

> **DAMIT FAND DER WÄCHTER GENAU DEN FALL NICHT, FÜR DEN ES IHN GIBT.**
> *Neunzehn Rückbauten sind hintereinander als ABGERISSEN gemeldet worden.*
>
> **UND DIE ZUSAGE DANEBEN HAT IHN NICHT GEFUNDEN, WEIL SIE IHN ZITIERT HAT.**
> *Sie las den Quelltext und verglich ihn mit demselben Namen, den der Ausdruck
> trug — eine Zusage, die ihren Gegenstand abschreibt, prüft sich selbst.*
> **Seit dieser Runde startet sie einen ECHTEN `node testbench.js` und sucht ihn
> wieder** *(Zusage 1)*; die alte Zeile bleibt daneben stehen, damit ein
> Tippfehler auch dann auffällt, wenn gerade kein Prozess läuft.

**DAZU DER PORTBLICK** *(F7)*. *Der Wächter kennt eine Lücke und benennt sie
selbst: einen Server aus `node -e "require('./server.js')"` findet kein Muster
über die Befehlszeile.* **`/proc/net/tcp` findet ihn.**

| | was er sieht | was er nicht sieht |
|---|---|---|
| **der Blick über die Befehlszeile** | auch einen Server, der gerade erst startet und noch nicht horcht | einen, dessen Befehl ihn nicht verrät |
| **der Blick auf die Ports** | jeden, der horcht — gleich wie er gestartet wurde | einen, der noch nicht horcht |

**DIE SPANNE DER PORTBASEN STEHT EINMAL DA**, im Prüfstand (`PORT_SPAN_FROM`,
`PORT_SPAN_TO`), und die Gegenprobe liest sie von dort — *wie `OFFSET_LEVEL`
schon seit 0.12.4*. **Beide Zahlen werden nachgerechnet und nicht behauptet:**
die Gruppe „Die Portbasen und der Versatz" hält sie gegen die Basen, die der
Lauf wirklich benutzt hat, samt Fensterbreite und Versatz aller Nebenspuren.

### BA 2 — Das Wartefenster und die Meldung

**ZWÖLF SEKUNDEN WURDEN DREISSIG.** *Beobachtet in 0.8.10 und 0.8.30, beide
Male neben einem gleichzeitigen Image-Bau.*

> **DREISSIG UND NICHT SECHZIG:** *ein Fenster, das zu weit steht, verwandelt
> einen echten Fehlstart in eine halbe Minute Warten je Prüflage — bei 78
> Servern wäre das eine Stunde, in der niemand etwas sieht.*

**DIE TEURERE HÄLFTE WAR ABER DIE MELDUNG.** *„Zweitserver nicht erreichbar"
schickte auf eine Suche durch 78 Server.* **Jetzt nennt sie Portbasis, Port,
Verzeichnis und die gewartete Zeit** — und sie steht als eigene Funktion da,
damit die Zusage sie FAHREN kann, statt dreißig Sekunden auf einen Fehlstart zu
warten.

**UND ZWEI MELDUNGEN SIND DAZUGEKOMMEN, die nicht im Auftrag standen:**

* **Ein Server, der von selbst endet, sagt es** — mit Portbasis, Port,
  Verzeichnis und den letzten sechs Zeilen seiner Ausgabe. *Bis hierher fiel er
  erst an der nächsten Anfrage auf, und zwar als „fetch failed" ohne Ort.*
* **Der Abbruch nennt die Ursachenkette.** *undici packt den echten Fehler in
  `cause`; ohne ihn sucht man in der falschen Datei.*

> **DIESE ZWEITE MELDUNG HAT IN DERSELBEN RUNDE EINEN BEFUND GEFUNDEN, der zwei
> Stunden unsichtbar war** — siehe Befund 11 weiter unten. **Ein Werkzeug, das
> sagt, was es sieht, zahlt sich in derselben Stunde aus.**

### BA 3 — Der Aufräumer beim Start

**AM 8. SEPTEMBER 2026 GESEHEN: sieben verwaiste Server, zweieinhalb Stunden
alt.** *Der Wächter „Keine Prüflage lässt ihren Server zurück" greift nur beim
ordentlichen Ende.*

**ERKANNT WIRD AM WEGWERFVERZEICHNIS UND NICHT AM NAMEN.** *`node server.js`
heißt der Server des Betreibers auch — und den darf dieser Aufräumer unter
keinen Umständen anfassen.* **Ein Prozess zählt nur dann als Rest, wenn sein
`DATA_DIR` unter `<tmp>/kriterion-…` liegt.** *Ein Bestand liegt dort nie.*

**UND ER ZÄHLT NUR, WAS NICHT VON DIESEM LAUF ABSTAMMT.** *Während des Laufs
leben bis zu 78 eigene Server mit genau solchen Verzeichnissen; ein Aufräumer,
der sie mitnähme, brächte den Lauf um, den er schützen soll.* **Die Abstammung
wird über `/proc/<pid>/stat` nach oben verfolgt.**

> **DIE ZUSAGE DAZU FÄHRT EINEN ECHTEN REST**, und das war die schwierigere
> Hälfte: *ein KIND dieses Laufs ist keiner.* **Gebaut wird deshalb ein ENKEL:**
> ein kurzlebiger Helfer startet den Server losgelöst und beendet sich selbst —
> danach hängt der Server an der Eins und ist ein Rest wie jeder andere.

### BA 5 — Die vier Hebel

**GEMESSEN WAREN 464,4 SEKUNDEN, UND ZWÖLF GRUPPEN TRUGEN 210 DAVON.**

| Hebel | was gebaut ist | gemessen |
|---|---|---|
| **F3 — die Anmeldebremse** | die Kurve an der REINEN Funktion belegt, für jeden Zählerstand; die Wartezeit der Route über den Prüfschalter geteilt | *sechs Gruppen von zusammen 82 s auf rund 8* |
| **F2 — die Mailfristen** | alle drei über EINEN Teiler kurz gestellt | *der Mailversand von 48,8 s auf rund 2* |
| **F1 — die Kostenstufe** | `scrypt` N über denselben Schalter | *verteilt über den ganzen Lauf, rund 35 s* |
| **F4 — das Grunddokument** | `public/app.js` einmal gelesen und einmal übersetzt statt 174-mal | *der Sprachhelfer blieb bei 20,4 s — der Gewinn liegt verteilt* |

#### Der Prüfschalter — und seine drei Klammern

**EINE GEWÖHNLICHE UMGEBUNGSVARIABLE, DIE EINE SICHERHEITSGRENZE SENKT, SENKT
SIE AUCH AUF DEM WIRT** — *aus Versehen, weil sie so heißt, wie man sie errät.*

```
KRITERION_TESTBENCH=pruefstand:scrypt=1024:mail=40:brake=10
```

| Klammer | was sie hält |
|---|---|
| **die Marke** | `SCRYPT_N=1024` bewirkt nichts, `KRITERION_TESTBENCH=1` bewirkt nichts. Nur die vollständige Form wird gelesen |
| **der Boden** | `scrypt` nie unter 1024 und immer eine Zweierpotenz, die Mailfristen nie unter 100 ms, die Bremse nie unter 10 ms. Was darunter steht, wird **gehoben** statt abgewiesen |
| **die Ansage** | läuft ein Server mit gesetztem Schalter, steht beim Start eine Zeile im Protokoll. *Ein Schalter, der still wirkt, ist der gefährliche Fall* |

> **ER STEHT IN `keys.js`, UND DAS IST KEINE VERLEGENHEIT.** *Diese Datei ist
> die eine, die liest, WAS DIE INSTALLATION AUS IHRER UMGEBUNG NIMMT, bevor
> irgendetwas läuft — bis hierher war das nur der Schlüssel. Sie hängt an keiner
> anderen Datei des Hauses, und deshalb können `auth.js` und `mail.js` sie beide
> lesen, ohne einander zu brauchen.* **Eine NEUE Datei wäre die neunzehnte im
> Fingerprint gewesen** *(dieselbe Überlegung wie F17)*.
>
> **DIE DREI MAILFRISTEN GEHEN ÜBER EINEN TEILER UND NICHT EINZELN.** *Ihr
> Verhältnis zueinander ist die Sache, die der Lauf belegt — die äußere Schranke
> ist fast dreimal so weit wie Gruß und Verbindung. Wer sie einzeln stellte,
> könnte das Verhältnis umdrehen und prüfte dann eine Verdrahtung, die es im
> Betrieb nicht gibt.*
>
> **UND BEI DER BREMSE WIRD NUR DAS WARTEN GESENKT.** *Die Kurve bleibt die
> ausgelieferte — `delay()` liefert weiter 700 · k, gedeckelt bei 4000 —, weich
> ab fünf und hart ab zehn bleiben, wo sie sind, und die harte Sperre dauert
> ihre fünf Minuten.* **Der Schutz vor dem Durchprobieren ist die SPERRE und
> nicht die Verzögerung.**
>
> **ZEHN UND NICHT VIERZIG BEI DER BREMSE, und das ist gemessen:** *bei vierzig
> blieben 18 Millisekunden übrig, und das ist im Rauschen einer HTTP-Antwort
> nicht mehr sicher von null zu unterscheiden.* **Die Prüfungen, die „ohne
> Verzögerung" gegen „verzögert" halten, brauchen einen Abstand, den man messen
> kann.**

#### Und die Route wartet wirklich

**DIE KURVE AN DER FUNKTION UND DIE VERDRAHTUNG AN DER ROUTE** — beides, sonst
belegte der Lauf eine Formel, die niemand ruft. **Ein Server fährt ausdrücklich
OHNE den Schalter**, sechs Anmeldeversuche, und der sechste wartet die
ausgelieferten 700 ms ab *(Zusage 7)*.

> **DER BELEG IST DABEI STÄRKER GEWORDEN UND NICHT SCHWÄCHER.** *Bis hierher
> deckte der Lauf die sechs Zählerstände ab, durch die er zufällig ging; jetzt
> sind es alle einundzwanzig von 0 bis 20 — und in null Millisekunden.*

#### Das Grunddokument für `jsdom`

**174 AUFBAUTEN, UND JEDER HAT `public/app.js` NEU GELESEN UND NEU ÜBERSETZT.**
*13.299 Zeilen, je Fenster.*

**JETZT STEHT BEIDES EINMAL DA:** der Quelltext als String und die Übersetzung
als `vm.Script`. **Ausgeführt wird sie weiterhin JE FENSTER und in dessen
eigenem Zusammenhang** — *jede Prüflage bekommt ihre eigenen Werte, ihre eigenen
Zähler und ihr eigenes Dokument. Nichts wird geteilt außer der Übersetzung.*

> **UND DER FEHLERWEG BLEIBT DERSELBE.** *Ein `<script>` im Dokument meldet
> einen Fehler an die virtuelle Konsole und lässt den Aufbau weiterlaufen; ein
> nackter `runInContext` würfe ihn nach außen und RISSE DEN LAUF AB, statt eine
> Zusage rot zu färben* (Stolperstein 161).
>
> **EIN NEBENGEWINN, DER KEINER IST:** *der Quelltext steht damit auch nicht
> mehr IM Dokument. Bis hierher hing er als `<script>` im Kopf — ausdrücklich
> im Kopf und nicht im Rumpf, damit er nicht in `document.body.textContent`
> steht und jede Textprüfung Wörter findet, die auf dem Bildschirm gar nicht
> stehen.* **Wer gar nicht erst im Dokument steht, steht auch in keinem Text.**

### BA 6 — Die Nachschau am Lauf bei jedem Push

**KEIN CODE, EIN BELEG** *(F8, Regel 2)*.

| Lauf | Commit | was er anfasst | Ergebnis |
|---|---|---|---|
| **726** | `d82b3d5` | **nur** `Doku/Auftrag_0.30.0.md` | **454 s, grün** |
| 724 | `41655e8` | nur Papiere | 438 s, grün |
| 719 · 710 | — | nur Papiere | grün |

**`.github/workflows/pruefstand.yml` hängt an `push:` ohne Zweigfilter**, also
auch an einem Commit, der nur ein Papier ändert. **Es war nicht die Einrichtung,
sondern der Blick.**

**AN DIE STELLE DES SAMMELBLATTPUNKTES TRITT EIN SATZ IN DER README:** *ein
Papier ist Prüfstoff, und wer eines ändert, fährt den Lauf.*

### BA 7 — Die Tagzeile

**DER BETREIBER, 12. SEPTEMBER 2026, MIT BILD:** *„ich möchte das das ‚und' und
‚Oder' kleiner unter dem tag kateogier überschrift sind und zwar kleiner. tag
soll grundsätzlich wenn man filter aufklappt zu sehen sein. … danach soll rechts
davon die tags aufgelistet werden und rechte ende dann das mehr button. wenn das
mit einer zeile nicht klappt dann bitte 2 zeilig machen."*

**ES KLAPPT NICHT MIT EINER ZEILE, UND ES IST ZWEIZEILIG.**

| | vorher *(0.29.0)* | nachher *(0.30.0)* |
|---|---|---|
| **Filterkasten, aufgeklappt** | **291 px** | **267 px** |
| **Tagzeile** | **69 px** *(drei Rasterzeilen)* | **46 px** *(zwei)* |
| **„und/Oder"** | daneben, y = 327, 270 px breit | **darunter**, y = 352, 74 px |
| **Beschriftungsspalte** | 35 px | **74 px** |
| **Umschalter „Tags"** | da | **weg** |
| **erste Kachel** | y = 502 | **y = 479** |

*Gemessen am 12. September 2026 in echtem Chromium bei 390 × 844,
`deviceScaleFactor: 3`, `isMobile: true`, an einer laufenden Installation mit
zehn Marken, sechs Einträgen und zwei Zugängen — dieselben Daten, dieselbe
Sitzung, nur ein anderer Auslieferungsstand.*

**DER PREIS IST EIN SICHTBARER TAG WENIGER** *(F10)*: die Beschriftungsspalte
wächst, weil „und/Oder" darunter steht. **Der Rest steht hinter „mehr", wie
vorher auch.**

**WAS MIT DEM UMSCHALTER GEFALLEN IST:**

* `MORE_FILTERS_OPEN` — *ein Merker über einen Zustand, den es nur noch in einer
  Fassung gibt, ist ein Feld ohne Leser.*
* **Vier Regeln im Stilblatt** (`.tag-toggle` samt Winkel und Unterstrich).
* **`list.tagsCount` in drei Sprachen** und sein Eintrag in `tools/keys.json`.
  *„Tags (2)" stand am Umschalter, damit ein greifender Filter hinter der
  ZUGEKLAPPTEN Zeile nicht unsichtbar wird — es gibt keine zugeklappte Zeile
  mehr.* **`list.tags` bleibt: die Zeile trägt weiter ihre Beschriftung.**

### BA 8 — Der Bewertungskasten

**DER BETREIBER, MIT ZWEI INSTALLATIONEN:** *„bei einem user ist die anordnung
der sterne gut aber bei mehr user nimmt es durch den umbruch in der kopfzeile
und in den sternenzeile viel zu viel platz."*

| | vorher | nachher |
|---|---|---|
| **Kopfzeile** | **81 px, ZWEI Zeilen** | **42 px, EINE Zeile** |
| **der Knopf** | „Wer hat bewertet", **159 px** | **„Wer?", 67 px** |
| **der Kasten** *(zwei Zugänge, fünf Kriterien)* | **537 px** | **439 px** |
| **je Kriterium** | 82 px | **70 px** |
| **Name bricht um** | nein | **nein** |
| **Seite rollt seitlich** | nein | **nein** |
| **derselbe Kasten mit EINEM Zugang** | **336 px** | **336 px — unverändert** |
| **am Schreibtisch (1280 px), zwei Zugänge** | **304 px** | **304 px — unverändert** |

> **DIE ZWEIZEILIGE STERNZEILE BLEIBT, und das hat die Messung entschieden und
> nicht der Geschmack** *(F12)*. *Zurückgenommen wächst der Kasten von 580 auf
> 607 px, die Namensspalte fällt auf 54, jeder Name bricht fünfzeilig um, und
> die Seite ROLLT seitlich: drei Spalten brauchen 362 px nebeneinander, die
> Liste hat 366.* **Projektstand 5.3 behält recht.**
>
> **GEBAUT IST C1a UND NICHT C1** *(Betreiber, 12. September 2026)*. *Die Regeln
> stehen unter `:not(.no-average)` — die Fassung mit EINEM Zugang bleibt genau
> so, wie der Betreiber sie „gut" nennt.* **Wer „gut" sagt, bekommt nicht
> ungefragt etwas anderes.**
>
> **DIE GRENZE DES KNOPFES IST GEFAHREN:** *mit „⌀ 4,5 gewichtet" daneben passt
> ein Knopf bis 98 px in eine Zeile, ab 127 px bricht sie.* **Die Zusage hält
> deshalb die LÄNGE des Wortes und nicht seinen Wortlaut** — eine Sprachdatei
> kann ihn länger machen. *`entry.whoRated` behält seinen Schlüssel; der Titel
> des Fensters dahinter (`entry.whoRatedWord`) bleibt der ganze Satz, denn dort
> ist Platz.*

### BA 9 — „gewichtet" kommt aus dem Wörterbuch

**DAS WORT STAND SEIT 0.16.0 FEST IM QUELLTEXT UND IN KEINER SPRACHDATEI.**
*In einer englisch oder türkisch eingestellten Installation stand dort deutscher
Text.* **Es ist der fünfte solche Fund in sechs Runden.**

> **DIE EIGENTLICHE ANTWORT IST NICHT DER SCHLÜSSEL, SONDERN DIE WACHE.** *Den
> Schlüssel nachzutragen repariert EINEN Satz; fünf Funde in sechs Runden sind
> keine fünf Versehen, sondern eine Masche im Netz.*

**KEIN VORHANDENER WÄCHTER KONNTE IHN FINDEN:**

| Wächter | was er liest | warum er vorbeisieht |
|---|---|---|
| die Restprobe | die **Sprachdatei** gegen eine Urfassung | das Wort steht gar nicht in ihr |
| `SCREEN_BAN` | die Texte des Moduls auf **verbotene** Wörter | „gewichtet" steht auf keiner Verbotsliste |
| der Bezeichnerwächter | **Namen** | es ist ein Wert und kein Name |

**DIE NEUE WACHE LIEST WERTE.** *Jeden Text, den der Zerleger in
`public/app.js` findet, gegen die tausend Wortpaare des Wörterbuchs — mit drei
Sieben davor, und jedes hat einen Grund:*

1. **Eine Kennung ist kein Satz.** *Reine Kleinschreibung ohne Leerzeichen ist
   ein `id`, eine Klasse, eine Adresse oder ein gespeicherter Wert — deutsche
   `id` sind ein eigener Befund (Sammelblatt 25) und nicht dieser.*
2. **Markup ist kein Satz.** *Aus einer Vorlage bleibt der Text ZWISCHEN den
   Marken.*
3. **Ein Bruchstück mitten in einer Marke** *(`" alt="`)* **ist keines von
   beidem.**

**VIER BENANNTE AUSNAHMEN BLEIBEN**, und keine gehört in eine Sprachdatei: *die
drei Befehle, die auf dem Wirt getippt werden, die Beispieladresse — und der
eine Satz „Die Sprachdatei fehlt." (ohne die Datei gibt es keinen Schlüssel, mit
dem sich sagen ließe, dass sie fehlt).*

> **UND SIE HAT BEIM BAUEN SOFORT DREI WEITERE GEFUNDEN.** *„an" und „aus" am
> Schalter der Registrierung und „eingerichtet" am Mailversand — und die letzte
> Stelle ist die lehrreichste: **dieselbe Zeile** las für das Gegenteil schon
> `card.notConfigured`, und die Zusage stand fest auf Deutsch daneben.*
> **Für „an" und „aus" gab es die Schlüssel längst** (`card.on`, `card.off`);
> `card.configured` ist der eine, der dazukam.

**DIE SPRACHDATEIEN STEHEN DANACH AUF 1347** — *einer weniger (`list.tagsCount`),
zwei mehr (`entry.weighted`, `card.configured`), alle drei namentlich.*

### BA 10 — Das Fälligkeitsdatum bekommt Farbe

**DER BETREIBER, MIT BILD:** *„Datum feld muss farblich zum todo zugeordnet
werden können. passend zum status. ob fertig, oder noch offen. so sieht es aus
als ob das einfach nur ein datumstempel von dem erstellungstag oder so. man wird
es nicht beachten!"*

**ER HAT RECHT, UND DAS STILBLATT SAGTE ES SELBST:** *ein gesetztes Datum stand
in der gewöhnlichen Textfarbe — und drei Elemente weiter rechts steht in
derselben Zeile das Erstellungsdatum des Kommentars.*

| Zustand | vorher | nachher |
|---|---|---|
| **überfällig** | `rgb(233,236,239)` | **`var(--red)`** — dasselbe Rot wie die Überschrift in „Offen" |
| **heute** | `rgb(233,236,239)` | `rgb(233,236,239)`, **Gewicht 600** |
| **später** | `rgb(233,236,239)` | **`var(--muted)`** |
| **erledigt** | *stand gar nicht da* | **`var(--faint)`, durchgestrichen** |
| *der Zeitstempel daneben* | `rgb(97,106,115)` | *unverändert* |

> **VIER ZUSTÄNDE, VIER FARBEN — und das war zuerst nicht so.** *Gemessen trugen
> „später" und „erledigt" beide `var(--muted)`, und dann unterschied sie allein
> der Strich.* **Wer zwei von vier gleich färbt, hat drei.**
>
> **„HEUTE" IST NICHT ROT, UND DAS IST ABSICHT:** *heute fällig ist kein Fehler,
> sondern ein Termin.* **Rot bleibt dem vorbehalten, was VERSÄUMT ist.**

**UND `dueOf()` IST NACH OBEN GEWANDERT.** *Sie lag INNERHALB von `renderOpen()`
und war von dort aus nirgends zu erreichen; eine zweite Einteilung daneben wäre
genau die zweite Wahrheit aus Stolperstein 47.* **Beide Orte fragen dieselbe
Funktion.**

> **`todayKey` WIRD BEI JEDEM AUFRUF GERECHNET und nicht einmal beim Laden:**
> *eine Seite, die über Mitternacht offen bleibt, färbte sonst bis zum Neuladen
> nach dem Tag von gestern.*

**UND DAS DATUM STEHT KÜNFTIG AUCH AN EINER ERLEDIGTEN AUFGABE** — *gedämpft und
durchgestrichen.* **Bis hierher verschwand es beim Abhaken: die Spalte behielt
es, der Bildschirm zeigte es nicht.**

### BA 11 — Die Vokabelkarte *(unter Vorbehalt gebaut)*

**DIESER ABSCHNITT STAND ALS EINZIGER UNTER VORBEHALT** *(F14: „erst messen,
dann entscheiden")*, **und der Vorbehalt hat sich gelohnt.**

| Fassung | Karte | Beschriftungen mit Umbruch | dreizeilig | Feldbreite |
|---|---|---|---|---|
| **heute, einspaltig** | **1203 px** | **2 von 14** | 0 | 366 px |
| **V1 — Beschriftung neben dem Feld** *(„der dritte Weg")* | 982 px | **14 von 14** | **3** | 195 px |
| **V2 — weniger Luft, gleiche Bauform** | **1056 px** | **2 von 14** | **0** | **366 px** |
| V3 — daneben **und** enger | 853 px | 14 von 14 | 2 | 168 px |
| Z — zwei Spalten *(der Vorschlag des Betreibers)* | 733 px | 14 von 14 | 2 | 177 px |

> **DER DRITTE WEG SCHEITERT AN GENAU DERSELBEN MESSUNG WIE DER VORSCHLAG, DEN
> ER ERSETZEN SOLLTE.** *Die Beschriftung neben das Feld zu stellen bricht alle
> vierzehn um, drei davon dreizeilig — also schlechter als die zwei Spalten.*
>
> **GEBAUT IST V2** *(Betreiber, 12. September 2026, nach der Messung)*:
> **dasselbe Mittel wie am Bewertungskasten — weniger Luft, gleiche Bauform.**
> *147 Pixel, und es bricht keine Beschriftung zusätzlich um.*

**UND EINE LEHRE AUS DEM MESSEN SELBST, zum zweiten Mal in dieser Runde:** *die
erste Reihe dieser Tafel war falsch.* **Eine Navigation auf DIESELBE Adresse
wechselt nur den Anker und lädt gar nicht neu** — das eingespritzte Stilblatt
der vorigen Fassung überlebt sie, und die nächste Messung misst zwei Fassungen
übereinander. *Jede Zahl oben ist nach einem erzwungenen frischen Ladevorgang
entstanden.*

---

## Befund 11 — ein Bestandslauf nahm den Server mit

**ER IST BEIM BAUEN DIESER RUNDE AUFGEFALLEN, und zwar an der neuen Meldung aus
BA 2.**

**WAS PASSIERT IST:** *der Prüflauf legt für den Teilexport einen Anhang von 400
MB an und schreibt ihn über eine ZWEITE Verbindung in dieselbe Datei. Das dauert
sieben bis zwölf Sekunden, und solange ist die Datenbank gesperrt. Fällt der
Zeitzünder des Bestandslaufs in dieses Fenster, antwortet SQLite mit
`SQLITE_BUSY` — die Ausnahme steht in einem `setTimeout` und hat KEINEN Rufer
über sich.* **Node beendet den Prozess mit Code 1, und die nächste Anfrage
bekommt ECONNREFUSED.**

> **ES IST KEIN FEHLER DIESER RUNDE, SONDERN EINER, DEN SIE SICHTBAR GEMACHT
> HAT.** *Der Zünder steht seit 0.19.3 da, und bis hierher fiel er nur nie in
> das Fenster. Sichtbar wurde er, weil der Lauf schneller geworden ist — eine
> andere Reihenfolge, dasselbe Zeitfenster.*
>
> **ZWEI STUNDEN LANG SAH ER AUS WIE „fetch failed".** *Erst die Meldung „ein
> Server, der von selbst endet, sagt es" hat die Stelle genannt — mit
> Stapelspur und `code: 'SQLITE_BUSY'`.*

**DIE ANTWORT IST NICHT „LÄNGER WARTEN", SONDERN „NICHT STERBEN".** *Ein
Bestandslauf, der beim Start nicht an die Datenbank kommt, ist kein Grund, die
laufende Installation zu beenden.* **Er sagt es und versucht es später noch
einmal — dreimal, dann Ruhe, und beim nächsten Start steht es ohnehin wieder
an.**

---

## Was NICHT gebaut wurde

| | warum |
|---|---|
| **Den Prüflauf parallel fahren** | *das ist genau der Portstreit, an dem die Gegenprobe schon einmal neunzehn Rückbauten falsch gemeldet hat* |
| **Ein echter Teillauf** | *`testbench.js` ist EIN langer Ablauf; der echte Teillauf IST die Aufteilung in Module und steht auf 0.34.0* |
| **Die zweizeilige Sternzeile umkehren** | *gemessen: 580 → 607 px, fünfzeilige Namen, die Seite rollt* |
| **Zwei Spalten in der Vokabelkarte** | *gemessen: alle vierzehn Beschriftungen brechen um* |
| **Der dritte Weg der Vokabelkarte** | *gemessen: alle vierzehn, drei davon dreizeilig — schlechter als das, was er ersetzen sollte* |
| **Der Selbsttest als Datei im Baum** | *er wäre die neunzehnte im Fingerprint* |
| **„Stimmen" als Wort am Bildschirm** | *`SCREEN_BAN` sperrt es seit 0.22.0* |
| **`@name` in Kommentaren** | *vom Betreiber am 12. September bestellt — und er hat den Platz selbst genannt: **0.32.0*** |
| **Die sieben übrigen deutschen `id`** | *Punkt 25 des Sammelblatts — ein Befund über den Wächter und keiner dieser Runde* |

---

## Der Prüfstand

**6690 VON 6690 PRÜFUNGEN GRÜN, 329 GRUPPEN, 261,3 SEKUNDEN.**

**ACHT ZUSAGEN FAHREN EINEN ECHTEN PROZESS ODER EINEN LAUFENDEN SERVER** und
lesen nicht den Quelltext: *der Wächter an einem echt gestarteten `node
testbench.js`, der Portblick an einem echt horchenden Socket, der Aufräumer an
einem echt hinterlassenen Server, die Route an einem Server ohne Schalter, die
Schlusstafel an einem gefahrenen Lauf in beiden Schalterstellungen, die Tagzeile
und das Fälligkeitsdatum an gezeichneten Fenstern.*

> **EINE ZUSAGE, DIE NUR DEN AUSDRUCK ANSIEHT, BLIEBE GRÜN, WENN ER DASTEHT UND
> NICHTS TRIFFT.** *Genau das war Befund 1, und zwar neun Runden lang.*

### Die Gegenproben

**EINUNDZWANZIG NEUE, 895 bis 915** — je eine für jede neue Zusage dieser Runde.

**UND FÜNF ALTE SIND NACHGEZOGEN:** *604, 605, 636, 658 und 889 — ihre Suchtexte
standen nach dieser Runde nicht mehr da.* **Ein Rückbau, dessen Suchtext fehlt,
ist ein Fund über die LISTE und keiner über den Baum** *(in 0.29.0 waren es
fünf, in dieser Runde wieder)*.

> **605 IST DER LEHRREICHSTE VON ALLEN.** *Er setzt den Namen zurück, der von
> 0.21.0 bis 0.30.0 im Wächter stand — `pruefung.js`.* **Bis hierher machte er
> genau eine Zusage rot: die, die denselben Namen zitierte.** *Jetzt macht er
> zwei rot, und die zweite startet einen echten Prozess.*

---

## Die Papiere dieser Runde

| Datei | was |
|---|---|
| `Doku/Aenderungsprotokoll_0.30.0.md` | **neu** — dieses Blatt |
| `Doku/Projektstand_Kriterion_0_30_0.md` | `git mv`, **Revision 83**; Abschnitt 5.3 trägt den Prüfschalter samt seinen drei Klammern |
| `Doku/Fahrplan.md` | 0.30.0 durchgestrichen, mit der gemessenen Zahl |
| `Doku/Fehler_und_Ideen.md` | **drei Punkte gefallen** *(Regel 2)* — das Wartefenster, das Papier zwischen zwei Runden, die Verwechslung von Abriss und Störung |
| `Doku/Auftrag_0.30.0.md` | bleibt, bis der nächste ihn ablöst — es liegt immer nur einer im Repo |
| `CHANGELOG.md` · `package.json` · `package-lock.json` | die Nummer |
| `README.md` | drei Abschnitte: wo die Zeit hingeht, der Prüfschalter samt Grenzen, „ein Papier ist Prüfstoff" |
