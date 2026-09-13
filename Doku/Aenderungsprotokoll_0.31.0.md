# Änderungsprotokoll 0.31.0 — „Die Sprachdateien werden gegengelesen"

**Auftrag 0.31.0 · 13. September 2026 · gebaut auf 0.30.3 · MINOR, kein
Schemaanteil.**

> **FINGERPRINT DIESER RUNDE: `PLATZHALTER`** — gerechnet am gebauten Stand,
> **als letztes und hinter der letzten Zeile**.
>
> | Quelle | Wert |
> |---|---|
> | **Am Arbeitsbaum nachgerechnet** *(achtzehn Dateien)* | **`PLATZHALTER`** |
> | **Aus dem Server selbst gelesen** *(frisches Datenverzeichnis, `/api/stats`)* | **`PLATZHALTER`** |
> | **Aus der laufenden Installation gemeldet** | *steht aus* |
>
> **ZWEI QUELLEN, EIN WERT.** *Die dritte kommt aus dem Feld, sobald der
> Betreiber eingespielt hat.*

---

## Die Vorlage kam nicht aus diesem Haus

**DER BETREIBER HAT `Doku/I18N_CLEANUP_DE.md` VON GOOGLE GEMINI SCHREIBEN
LASSEN** und sie am 13. September 2026 ins Repo gelegt, mit der Ansage: *„gehe
bitte zeile für zeile durch. und sag mir was davon von google gemini falsch ist
und wir nicht übernehmen sollten."*

**EINUNDSIEBZIG VORSCHLÄGE, JEDER GEGEN DEN QUELLTEXT GEPRÜFT.** *Alle genannten
Schlüssel gibt es, kein Zitat ist falsch — das ist die gute Nachricht.* **Was
nicht übernommen wird, steht im Auftrag mit Grund, und jede Ablehnung ist vom
Betreiber bestätigt.** *Die vier, die am meisten kosteten, wenn sie
durchgegangen wären:*

| Vorschlag | warum nicht |
|---|---|
| `list.openGroupedBy` **„gruppiert" → „sortiert"** | **Die Ansicht gruppiert wirklich.** *`groupsOf()` fasst aufeinanderfolgende Zeilen desselben Eintrags zu EINER Gruppe zusammen. Ein Wort, das die Oberfläche nicht mehr beschreibt, ist kein kürzeres Wort, sondern ein falsches* |
| `login.linkUnaffectedWord` **„nicht" → „unberührt"** | **Das Wort steht HERVORGEHOBEN in zwei Trägersätzen**, und die Hervorhebung sitzt auf der Verneinung. *Mit „unberührt" stünde dort „Dein Link ist davon unberührt betroffen." Gemini nennt nur einen der beiden Sätze* |
| `card.derivativesWebp` **„niemand archiviert sie"** | **Falsch.** *Die Vorschaubilder liegen als BLOB in der Datenbank, und die Sicherung nimmt sie mit. Richtig ist: sie lassen sich jederzeit neu erzeugen* |
| `card.catchUpAsk` **„Erfordert vorherige Sicherung"** | **Eine Sicherung wird nicht VERLANGT.** *Sie fehlt nur, wenn man zurück will — „Rückgängig nur mit einer vorher angelegten Sicherung" sagt dasselbe und behauptet nichts* |

> **UND EINE BERICHTIGUNG MEINER EIGENEN LINIE.** *Der Betreiber, 13. September
> 2026: „ich kenne keinen Deutschen IT'er der statt konvertieren umstellen
> benutzt. Kompression, komprimieren ist auch das wort keiner sagt dazu rechnen.
> und erzeugen wird auch nicht genutzt. Und Fundstelle wird auch nicht genutzt
> sondern Suchtreffer."* **Er hat recht, und die Regel stand längst im Haus:**
> *Abschnitt 12 des Projektstands sagt seit 0.8.60, der Maßstab sei „das Wort,
> das ein deutschsprachiger Entwickler im Gespräch benutzen würde".*

---

## Was gebaut ist

### Bauabschnitt 1 — die elf Code-Lecks

**ELF SCHLÜSSEL TRUGEN KEINEN TEXT, SONDERN EINE KONSTANTE.** *Der Beweis stand
in den beiden anderen Sprachdateien: `entry.targetBlank` hieß auf Deutsch
`_blank`, auf Englisch `_blank` und auf Türkisch `_blank`.* **Ein Text, der in
drei Sprachen gleich lautet, ist kein Text.**

| Schlüssel | Wert | wohin |
|---|---|---|
| `entry.targetBlank` | `_blank` | fest ins Skript |
| `entry.linkRel` | `noopener,noreferrer` | fest ins Skript |
| `entry.imagePrefix` | `image/` | fest ins Skript |
| `list.px10` / `list.px20` | `10px` / `20px` | **`.page-hint` im Stilblatt** |
| `card.composeFile` | `docker-compose.yml` | `COMPOSE_FILE` in `public/app.js` |
| `card.filesQuery` | `&files=1` | fest ins Skript |
| `card.photosQuery` | `photos=1` | fest ins Skript |
| `card.videosQuery` | `&videos=1` | fest ins Skript |
| `list.thumbQuery` | `?size=thumb` | fest ins Skript |
| `card.partQuery` | `&from={from}&to={to}&part={part}&parts={n}` | fest ins Skript |

**1265 SCHLÜSSEL SIND 1254 — IN JEDER DER DREI DATEIEN.** *Die Schlüssel fallen
zusammen, die Texte einzeln, und das ist nachgesehen und nicht vermutet: zwei
Wächter verlangen in jeder Datei genau dieselben Schlüssel, einer davon in
derselben Folge.* **Nähme 0.31.0 die elf nur aus `de.json`, hätten `en.json` und
`tr.json` je „11 zu viel" — sofort, nicht in 0.31.1.**

> **DREI VON ELF STANDEN OHNEHIN SCHON FEST IM SKRIPT — an anderer Stelle.**
> *`public/app.js:1598` filtert seit jeher mit `f.type.startsWith('image/')`,
> und zwanzig Zeilen tiefer stand `f.type.startsWith(t('entry.imagePrefix'))`.
> Ebenso `a.target = '_blank'` und `a.rel = 'noopener noreferrer'` an der
> Kommentarzerlegung.* **Die Sprachdatei hielt eine zweite Fassung derselben
> Konstante — und die ließ sich von jeder Hand ändern, die den Aufrufort nie
> gesehen hat.**
>
> **`list.px10`/`px20` GEHEN NICHT INS SKRIPT, SONDERN IN EINE KLASSE** *(F2)*.
> *Sie standen als Inline-Angabe an einer Bedingung —
> `margin:0 0 ${multipleUsers() ? px10 : px20}` —; eine Konstante im Skript wäre
> derselbe Fehler an anderer Stelle gewesen, denn inline bleibt sie aus dem
> Stilblatt unerreichbar.* **Jetzt: `.page-hint` und `.page-hint.above-pills`,
> beide Maße die alten.**

### Bauabschnitt 2 — die Worttafel

**NEUNUNDVIERZIG TEXTE AUS DEN TAFELN A BIS E.** *Jeder einzeln entschieden;
die Spalte „woher" im Auftrag sagt, wessen Fassung gebaut ist.* **Die
Entscheidungen, die alles andere tragen:**

| | |
|---|---|
| **konvertieren, Kompression, generieren, Suchtreffer** | *Lehnwörter, wo der Fachmann sie spricht (L4)* |
| **Knopf, Kasten, Eintrag, Zugang** | *Hauswörter, die bleiben (L5)* |
| **„Pille" nur im Code** | *was der Nutzer sieht, heißt Knopf (L6)* |
| **„Das Haus verlassen" fällt ersatzlos** | *keine Metaphern in der Oberfläche (L7)* |
| **Aktives Du bleibt** | *kein Infinitiv ohne Anrede (L3)* |
| **Kürzen ja — aber der Grund bleibt, knapp, und der Ausweg immer** | *L2* |

### Bauabschnitt 3 — die Anführungszeichen

**VIERUNDDREISSIG TEXTE ÖFFNETEN MIT `„` UND SCHLOSSEN MIT EINEM GERADEN `"`.**
*Dreiunddreißig Schlüssel, fünfunddreißig Zeichen — `dialog.nameFreedHint`
schließt zweimal, `server.testedStays` ist ein Mehrzahlpaar.* **Sie tragen jetzt
das schließende `“`, und ein Wächter hält es fest.**

> **DIE TÜRKISCHE DATEI BEKOMMT DIESELBE BERICHTIGUNG — und keinen neuen Text.**
> *Sie trug dieselben vierunddreißig; `en.json` hatte keinen einzigen. Der
> Wächter fragt alle drei Dateien, und ohne den türkischen Teil wäre er rot.*
> **Dass das türkische Paar am Ende `“…”` heißen muss statt `„…“`, ist die Sache
> von 0.31.2** — *hier wird nur geschlossen, was offen stand.*

---

## Die Befunde der Runde — was der Auftrag nicht kannte

**ZEHN TEXTE SIND GEÄNDERT, DIE IN KEINER TAFEL STEHEN.** *Keiner davon ist eine
eigene Entscheidung: jeder ist von einer Entscheidung des Auftrags erzwungen,
und die Spalte „gezogen von" nennt sie.* **Das Muster ist dasselbe wie bei
`card.withPhotos` in 0.26.0 — der Auftrag kannte ihn nicht, er ist beim Bauen
aufgefallen.**

### Sieben, weil dieselbe Sache sonst zwei Wörter hätte

| Schlüssel | gezogen von | warum |
|---|---|---|
| `card.convertRunning` | `card.convertProgress` | **DIESELBE ZEILE** *(`id="convert-running"`)*. `switchRow()` zeichnet sie beim Aufbau, `BATCH_RUNS` schreibt sie im Takt neu — es hätte „Umstellung läuft" gestanden und eine Sekunde später „Konvertierung läuft" |
| `card.convertFinished` | `card.convertProgress` | *dieselbe Zeile, Zustand „fertig"* |
| `card.convertDone` | `card.convertProgress` | *derselbe `BATCH_RUNS`-Eintrag, Feld `finished`* |
| `server.convertRunning` | `card.convertProgress` | *die 409-Absage an denselben Lauf* |
| `card.catchUpStore` | `card.catchUpBoth` | **Knopf und Erklärsatz darunter.** *Der Knopf hätte „Vorhandene Bilder umstellen" geheißen, die Zeile unter ihm „Konvertiert {n} PNG-Originale…"* |
| `card.derivativesAsk` | `card.catchUpAsk` | **Die beiden Zweige DESSELBEN Bestätigungsfensters.** *Der eine sagte „neu generiert", der andere „neu gerechnet"* |
| `card.themeHint` | `card.likeDevice` | **Der Satz ZITIERT die Beschriftung.** *„„Wie das Gerät“ folgt der Einstellung des Betriebssystems" — und die Beschriftung heißt seit F3 „Auto"* |

### Zwei, weil der Bildschirmwächter sie fing

**`card.backupDirAdvice` UND `card.backupUnopenableHint` TRAFEN DIE
VERBOTSLISTE** — *„trifft" und „liegen" stehen dort seit 0.22.0.* **Die Liste
wird nicht erweitert, und das steht ausdrücklich an ihr:** *„wer einen davon
später richtigstellt, nimmt ihn hier heraus — und wer einen neuen dazuschreibt,
fällt auf".* **Geändert ist das eine Wort und nichts sonst:**

| | Auftrag | gebaut |
|---|---|---|
| `card.backupDirAdvice` | *„sonst **trifft** ein Fehler am Projektordner…"* | *„sonst **zerstört** ein Fehler am Projektordner…"* |
| `card.backupUnopenableHint` | *„beides darf nicht am selben Ort **liegen**."* | *„beides darf nicht am selben Ort **aufbewahrt werden**."* |

### Und einer, der seit 0.24.3 falsch dastand

**`server.partExportIncomplete` NANNTE DIE VIER ABFRAGEANGABEN — und zwar die
falschen.** *Der Satz hieß „Ein Teilexport braucht von, bis, teil und teile.";
im Server heißen sie seit 0.24.3 `from`, `to`, `part` und `parts`.* **Wer die
Route von Hand ruft, wurde damit in die Irre geschickt.**

> **DER AUFTRAG LÄSST DEN SATZ AUSDRÜCKLICH STEHEN, WEIL ER DIE VIER BENENNT**
> *(Tafel D: „„Parameter unvollständig" sagt nicht, WELCHE fehlen")* — **dann
> muss er sie richtig benennen.** *Er heißt jetzt „Ein Teilexport braucht from,
> to, part und parts."*
>
> **DERSELBE BEFUND HAT EINEN ABSATZ IN `server.js` MITGENOMMEN:** *dort stand
> „DIE VIER ABFRAGEANGABEN HEISSEN NOCH DEUTSCH", und das stimmte seit 0.24.3
> nicht mehr. Der Absatz sagt jetzt, was dasteht.*

---

## Die Absichtszeilen — was der Satz leisten muss

> **WORAUS ÜBERSETZEN 0.31.1 UND 0.31.2? AUS DER ABSICHT, NICHT AUS DEM
> DEUTSCHEN SATZ** *(F22)*. **Der Befund, der das begründet, steht im Auftrag:**
> *`card.exportPartsHint` heißt auf Englisch heute „files that **leaves the
> house**", auf Türkisch „**evden çıkan** dosyaya"; `list.pillHint` spricht auf
> Türkisch von „**hap**", der Tablette.* **Englisch und Türkisch sind Wort für
> Wort aus dem Deutschen entstanden, samt seiner Bilder.**
>
> **DIESE RUNDE TROCKNET DIE QUELLE AUS.** *Sobald „das Haus" und „Pille" aus
> `de.json` verschwunden sind, kann keine Übersetzung sie mehr erben.* **Was
> unten steht, ist der zweite Teil: für jeden Satz, bei dem wörtliches
> Übersetzen schiefgeht, eine Zeile, WAS er leisten muss.**

### A · Wörter, die wörtlich falsch werden

| Schlüssel | deutscher Satz | was der Satz leisten muss |
|---|---|---|
| `card.likeDevice` | „Auto" | **Die dritte Wahl neben „hell" und „dunkel".** *Sie folgt der Einstellung des Betriebssystems.* **NICHT das Fahrzeug** — im Englischen „System" oder „Auto", im Türkischen „Otomatik". Der Kontext ist die Nachbarschaft der beiden anderen Knöpfe, nicht das Wort |
| `list.hitPlace` | „Suchtreffer" | **Die Beschriftung VOR der Stelle, an der der Suchbegriff gefunden wurde** *(„Suchtreffer: Anhangname")*. Englisch steht hier längst richtig mit „Match"; Türkisch sagt heute „Bulunan yer" — „gefundener Ort" — und meint damit etwas anderes |
| `card.itemOne` / `card.itemMany` | „Einzahl" / „Mehrzahl" | **Zwei Feldbeschriftungen in der Vokabelkarte, und sie bezeichnen die GRAMMATISCHE ZAHL.** *Vor ihnen darf kein Hauptwort stehen: an genau diesem Feld trägt der Betreiber ein, wie SEINE Einträge heißen — ein vorgeschriebenes Wort dort ist das, was er ersetzen soll.* **Die fünf Geschwisterpaare tragen weiter eines („Bericht, Einzahl"): sie benennen einen festen Begriff, dieses eine nicht** |
| `server.videoNeedsStill`, `server.videoStill`, `server.stillNoPreview`, `server.stillNotImage` | „Video-Vorschaubild" | **Das Vorschaubild, das zu einem Video gehört.** *Es liegt in denselben Spalten `thumb`/`medium` wie jedes andere Vorschaubild, nur mit `kind = 'video'`.* **NICHT „Standbild"/„still frame"/„kare"** — technisch richtig und für den Benutzer ohne Belang |
| `list.pillHint` | „Ein Klick auf einen der drei Knöpfe setzt den Filter." | **Drei runde Schaltflächen, ein Klick setzt den Filter.** *„Knopf" ist hier das BEDIENELEMENT.* **Türkisch darf daraus keine Arznei machen** — „hap" ist die Tablette; gemeint ist „düğme" |
| `card.exportPartsHint` | „Der Export schreibt den gesamten Bestand in {n} Dateien — mit allen Fotos, allen Anhängen und den Namen aller Verfasser." | **Was alles in die Dateien hineingeht.** *Die Aufzählung ist der Zweck des Satzes: Fotos, Anhänge, Verfassernamen.* **Kein Halbsatz darüber, wohin die Dateien gehen** — „leaves the house" und „evden çıkan" fallen ersatzlos; wer Export drückt, weiß, dass es das System verlässt |

### B · Sätze, deren Bau die Übersetzung tragen muss

| Schlüssel | deutscher Satz | was der Satz leisten muss |
|---|---|---|
| `login.linkUnaffectedWord` | „nicht" | **Das hervorgehobene Stück des Verneinungssatzes.** *Jede Sprache entscheidet selbst, WO es sitzt und WAS es ist: im Deutschen das Wörtchen „nicht", im Türkischen das ganze Verb „etkilenmez".* **Der Trägersatz trägt `{word}` an der Stelle, an der die Sprache es braucht** — das ist die Bauform von 0.25.4 und bleibt |
| `card.nothingToDo` | „, {stayed} bereits aktuell" | **EIN ANGEHÄNGTER TEILSATZ**, kein eigener. *Er schließt an „…, 9 Vorschaubilder neu generiert" an und muss dort grammatisch passen — mit Komma vorn und ohne eigenen Punkt* |
| `card.autoDeleteHint` | „automatisch gelöscht; von Hand geht es nicht." | **DIE FORTSETZUNG EINES SATZES**, der mit „Die Zeilen werden nach {n} Tagen" beginnt und dessen Zahl fett dazwischensteht. *Die Übersetzung muss an genau dieser Bruchstelle andocken; im Türkischen steht das Verb am Ende, und der Bruch liegt damit woanders* |
| `card.backupUnopenableHint` | „lässt sie sich nicht öffnen — beides darf nicht am selben Ort aufbewahrt werden." | **Ebenso eine Fortsetzung** — vor ihr stehen „Die Sicherung ist verschlüsselt." und „Ohne den Schlüssel aus `.env`" |
| `card.languagesFileAfter` | „legt, hat eine Sprache mehr — ohne Neustart. …" | **Ebenso** — vor ihr stehen `card.languagesFileBefore` und `<code>public/languages/</code>`. *Der Satz beginnt mitten im Nebensatz („Wer eine Datei nach … legt")* |
| `card.backupDirAdvice` | „… Einstellung:" | **Der Satz ENDET auf einen Doppelpunkt**, und dahinter setzt der Quelltext `<code>docker-compose.yml</code>`. *Er darf nicht mit einem Punkt schließen* |
| `card.catchUpBoth` | „Konvertiert {n} PNG-Originale und generiert veraltete JPEG-Vorschaubilder neu." | **Was der KNOPF darüber tut**, in der dritten Person. *Zwei Tätigkeiten in einem Satz: Originale konvertieren, veraltete Vorschaubilder neu generieren.* **Türkisch stellt das Verb ans Ende — aus einem Satz mit zwei Verben werden dort leicht zwei Sätze, und das ist in Ordnung, solange beide Hälften dastehen** |
| `server.partExportIncomplete` | „Ein Teilexport braucht from, to, part und parts." | **Die vier Namen sind ABFRAGEANGABEN und werden NICHT übersetzt.** *Sie heißen im Server so, und der Satz ist genau dafür da, sie zu nennen* |
| `card.storeCaveat` | „… wird die Datei dagegen GRÖSSER —…" | **Die Hervorhebung liegt auf dem Gegenteil dessen, was man erwartet.** *Im Deutschen tut das die Großschreibung eines Wortes.* **Wo eine Sprache das nicht kennt, muss sie es anders tragen** — die Aussage „bei Bildschirmfotos mit Text wird es größer statt kleiner" darf nicht in einem Nebensatz verschwinden |

### C · Meldungen, deren Zweck der Ausweg ist

> **DIE REGEL DIESER RUNDE FÜR FEHLERMELDUNGEN** *(L2, F13)*: **Grund knapp,
> Ausweg immer.** *Eine Übersetzung, die den Ausweg wegkürzt, hat den Satz
> zerstört, auch wenn jedes Wort stimmt.*

| Schlüssel | deutscher Satz | was der Satz leisten muss |
|---|---|---|
| `server.exportGrew` | „Die Exportdatei würde {limit} MB überschreiten, da sie im Arbeitsspeicher erzeugt wird. Nimm die Sicherung — die ist durch kein Limit eingeschränkt." | **Drei Dinge, und keines darf fallen:** *die Grenze mit ihrer Zahl, der Grund (die Datei entsteht im Arbeitsspeicher) und der AUSWEG (die Sicherung, die keine Grenze hat).* **Der Ausweg ist der Zweck des Satzes** |
| `server.backupDirGone` | „Den Sicherungsordner {folder} gibt es nicht. Häng ihn auf dem Server ein — angelegt wird er nicht." | **Der Ordner fehlt, der Leser muss ihn einhängen, und der Server legt ihn NICHT an.** *Das dritte Stück ist das wichtigste — ohne es wartet jemand darauf, dass es von selbst geschieht.* **Aktive Anrede, kein Infinitiv** |
| `server.backupDirNotSet` | „Es ist kein Sicherungsordner eingerichtet. Er wird in der docker-compose.yml eingehängt und dort als BACKUP_DIR benannt — beides gehört zusammen." | **ZWEI Handgriffe, die zusammengehören:** *einhängen UND benennen.* **Wer nur einen tut, steht wieder hier.** `docker-compose.yml` und `BACKUP_DIR` sind Namen und bleiben stehen |
| `server.backupConcurrent` | „Dort wird gerade schon eine Sicherung angelegt — bitte noch einmal." | **Kein Fehler, sondern ein Gleichzeitigkeitsfall.** *Der Ton muss das tragen: nichts ist kaputt, es läuft nur schon eine* |
| `card.catchUpAsk` | „… Rückgängig nur mit einer vorher angelegten Sicherung. Dauer: Minuten bis Stunden." | **Was geschieht, was danach weg ist, der einzige Rückweg, und dass es dauert.** *„Rückgängig nur mit…" ist eine Aussage über die Folge und KEINE Bedingung: eine Sicherung wird nicht verlangt* |

### D · Die Briefe

| Schlüssel | deutscher Satz | was der Satz leisten muss |
|---|---|---|
| `mail.invite.body` | „Wer diesen Link hat, kommt in deinen Zugang — gib ihn nicht weiter." | **Der Kernsatz der Einladung, und er ist vom Betreiber selbst formuliert.** *Er sagt die FOLGE („kommt in deinen Zugang") und daraus die Anweisung („gib ihn nicht weiter").* **Keine Banksprache** — nicht „gewährt Kontozugriff, bitte vertraulich behandeln"; das ist dieselbe Aussage ohne Adressat |
| `mail.confirm.body` | „Er öffnet keinen Zugang und setzt kein Passwort — er bestätigt nur, dass die Adresse dir gehört." | **Was der Link NICHT tut, und erst danach, was er tut.** *Die Reihenfolge ist die Beruhigung: wer die Mail unerwartet bekommt, liest zuerst, dass nichts geschieht* |
| `mail.test.body` | „… gehen ab jetzt automatisch hinaus." | **Die Bestätigung, dass der Versand steht** — und dass Einladungen und Rücksetzlinks von nun an ohne Zutun gehen |
| `card.adminOnlyCategory` / `card.adminOnlyTag` | „Mit Häkchen legt jeder neue Kategorien an; ohne Häkchen nur Admins. Vorhandene kann weiterhin jeder auswählen." | **DIE REIHENFOLGE IST DIE AUSSAGE:** *erst der gesetzte Haken, dann der fehlende, dann die Einschränkung des Ganzen.* **Wer mit „Deaktiviert:" beginnt, beschreibt einen Zustand, in dem der Leser gerade nicht ist** |

---

## Der Prüfstand

**ELF ZUSAGEN IN EINER NEUEN GRUPPE** — *„Die Sprachdateien werden gegengelesen
— 0.31.0", vierundzwanzig Prüfungen.*

| | Zusage | wie sie gehalten wird |
|---|---|---|
| **1** | Keine der elf Konstanten steht mehr in einer Sprachdatei | *alle drei Dateien werden gefragt* |
| **2** | Und jede steht als fester Wert im Skript — mit ihrem alten Inhalt | *acht als Literal in `app.js`, die Teilexportadresse über ihr Gerippe, die beiden Abstände als Regel im Stilblatt; dazu: kein Ruf sucht sie noch — auch nicht in `tools/keys.json`* |
| **3** | Die drei Dateien tragen gleich viele Schlüssel — 1254 | *die Zahl steht ausdrücklich da* |
| **4** | Kein Text der drei Dateien mischt `„` mit `"` | *und dreißig deutsche Texte tragen das Paar wirklich* |
| **5** | Die vier Video-Meldungen sagen „Video-Vorschaubild" | *beide Richtungen: das neue Wort steht da, das alte nirgends mehr* |
| **6** | „gruppiert nach" steht weiter da | *und `groupsOf()` gruppiert wirklich* |
| **7** | `login.linkUnaffectedWord` ist „nicht" | *und beide Trägersätze tragen `{word}`, und `tMark()` setzt die Hervorhebung* |
| **8** | Kein Text sagt „das Haus" | *deutsch; `en.json` ist 0.31.1, `tr.json` 0.31.2* |
| **9** | Kein Text sagt „Pille" | *und die Klasse `pill` bleibt — im Stilblatt wie im Quelltext* |
| **10** | Die Vokabelkarte beschriftet ihre Felder mit „Einzahl" und „Mehrzahl" | *und die Karte liest sie wirklich an ihren beiden ersten Feldern* |
| **11** | Die Zahl der Texte im aktiven Du sinkt nicht | *67 waren es, **69** sind es — die Schranke steht auf 69* |

### Und die umgestellten Zusagen

**ACHTZEHN VORHANDENE PRÜFUNGEN LASEN EINEN WORTLAUT, DEN ES NICHT MEHR GIBT.**
*Umgestellt und nicht gelöscht (Stolperstein 201): jede prüft weiterhin
dieselbe Sache, nur am neuen Satz.* **Eine hat dabei ihren Gegenstand
gewechselt, ohne die Sache zu wechseln:**

> *„Und dass die Bytes den Weg des Bildes nicht verraten" hieß die dritte
> Hälfte der Auflage; dort stand die HERLEITUNG. Jetzt steht dort die WIRKUNG —
> „Die Wahl gilt für alles, was hereinkommt" —, und die Zusage heißt „Und dass
> die Wahl für alles gilt, was hereinkommt".* **Sie liest weiterhin die dritte
> Hälfte, nur eben die, die dasteht.** *Das ist die Regel des Betreibers vom
> 11. September 2026: „letztlich zählt nur welche auswirkung es hat."*

**UND DIE BUCHFÜHRUNG DER WORTLAUTPROBE:**

| | damals | heute |
|---|---|---|
| **Sätze im Vergleich** | 1187 | **1189** *(der Abstand von zwei bleibt: die elf fallen auf beiden Seiten)* |
| **Sätze, die andere sind** | 15 | **85** *(37 aus der Worttafel, 5 erzwungene, 32 Anführungszeichen)* |
| **Und sonst kein Zeichen** | 1183 | **1102** *Satz für Satz der Stand von `0681d42`* |

---

## Die Gegenproben

**942 RÜCKBAUTEN WURDEN 954.** *Die zwölf neuen tragen die Nummern 952 bis 963 —
je einer für die elf Zusagen, und zwei für die zweite, weil sie zwei Hälften
hat.* **Jeder nimmt genau EINE Sache zurück:** *einer, der zwei Zusagen zugleich
träfe, sähe in der Tabelle aus wie ein starker Beleg und wäre in Wahrheit einer,
der nicht sagt, welche von beiden ihn gefangen hat.*

| Nr. | was zurückgebaut wird |
|---|---|
| **952** | Ein Code-Leck steht wieder in der deutschen Sprachdatei — *es fällt doppelt auf: an Zusage 1 und an der Deckungsprobe* |
| **953** | Der geöffnete Tab bekommt sein `noopener` nicht mehr — *der stille Fall, den Zusage 2 fängt* |
| **954** | Der Abstand der Listenseite steht wieder inline am Knoten |
| **955** | Die englische Datei trägt einen Schlüssel weniger |
| **956** | Ein Text schließt wieder mit einem geraden Anführungszeichen |
| **957** | Eine der vier Video-Meldungen sagt wieder „Standbild" |
| **958** | „gruppiert nach" heißt wieder „sortiert nach" |
| **959** | Das hervorgehobene Wort des Verneinungssatzes heißt „unberührt" |
| **960** | Der Export verlässt wieder „das Haus" |
| **961** | Der Filterhinweis nennt die Knöpfe wieder „Pillen" |
| **962** | Die Vokabelkarte schreibt wieder „Sache" vor |
| **963** | Ein Satz verliert seine Anrede und wird zum Infinitiv |

**FÜNF VORHANDENE SIND NACHGEZOGEN und nicht ersetzt worden** *(66, 472, 485,
821, 825)*: *ihre Suchtexte standen nach dieser Runde nicht mehr da — vier, weil
der Satz ein anderer ist, und 825, weil der Abstand jetzt aus einer Klasse
kommt.* **Ein Rückbau, dessen Suchtext fehlt, ist ein Fund über die LISTE.**

---

## Der Augenschein

**Gefahren am 13. September 2026 am laufenden Server**, in echtem Chromium
*(141.0.7390.37, 390 × 844, `deviceScaleFactor: 3`, `isMobile: true`)* — **acht
Seiten und ein Bestätigungsfenster, alles auf Deutsch, jedes „Mehr"
aufgeklappt.**

> **ER LIEST DIE SÄTZE VOM BILDSCHIRM UND NICHT AUS DER DATEI.** *Ein Satz, der
> in `de.json` richtig steht und am Aufrufort nie erscheint, ist für den
> Benutzer nicht da.* **Zwei Lagen mussten dafür eigens hergestellt werden:**
> *der Sicherungsordner liegt IM Projektordner (sonst zeichnet die Karte den
> roten Kasten nicht), und ein Eintrag steht im Bestand (sonst gibt es keinen
> Teilexportplan und damit kein Bestätigungsfenster).*

### Was dasteht — neunzehn von neunzehn

| Ort | was der Bildschirm zeigt |
|---|---|
| **Darstellung** | *„Farbschema der Oberfläche. Wirkt sofort und gilt auf jedem Gerät. **„Auto“** folgt der Einstellung des Betriebssystems und wechselt mit ihr. Hell Dunkel **Auto**"* |
| **Darstellung** | *„Schriftgröße der gesamten Oberfläche. Wirkt sofort und gilt auf jedem Gerät."* — **der dritte Satz ist weg** |
| **Bildformate** | *„PNG — **keine Konvertierung** — keine Rechenzeit, größte Ablage"* · *„WebP verlustfrei — Vorgabe — **verlustfrei**, gemessen rund zwei Drittel kleiner"* |
| **Die Auflage** | *„**Verlustbehaftete Kompression spart bei Fotos rund zwei Drittel.** Bei Bildschirmfotos mit Text wird die Datei dagegen GRÖSSER — der Kodierer kann mit harten Kanten nichts anfangen. **Die Wahl gilt für alles, was hereinkommt.**"* |
| **Vorschaubilder** | *„**Die Vorschaubilder sind in jedem Fall WebP.** Sie sind bereits verlustbehaftet und lassen sich jederzeit neu erzeugen."* |
| **Der Bestandslauf** | Knopf *„**Vorhandene Bilder konvertieren**"*, darunter *„**Generiert veraltete JPEG-Vorschaubilder neu.** Die Originale bleiben unberührt."* |
| **Sicherung** | *„Ohne den Schlüssel aus `.env` lässt sie sich nicht öffnen — beides darf nicht **am selben Ort aufbewahrt werden**."* |
| **Sicherungsordner** | *„Der Sicherungsordner liegt im Projektordner von Kriterion. Empfohlen ist ein Ordner außerhalb, am besten auf einer anderen Platte — sonst **zerstört** ein Fehler am Projektordner Original und Sicherung zugleich."* |
| **Sicherheitsprotokoll** | *„Die Zeilen werden nach 180 Tagen automatisch gelöscht; **von Hand geht es nicht**."* |
| **Kategorien / Tags** | *„**Mit Häkchen legt jeder neue Kategorien an; ohne Häkchen nur Admins.** Vorhandene kann weiterhin jeder auswählen."* — und dasselbe für Tags |
| **Vokabelkarte** | *„**Einzahl** (Vorgabe: Eintrag)" / „**Mehrzahl** (Vorgabe: Einträge)"* |
| **Sprachen** | *„… ist die Sprachkennung **nach BCP 47 (z. B. de-DE)**."* |
| **Teilexport-Fenster** | *„Export bestätigen — **Der Export schreibt den gesamten Bestand in 1 Datei — mit allen Fotos, allen Anhängen und den Namen aller Verfasser.**"* |

### Und was nirgends mehr dasteht — zehn von zehn

*„das Haus verlassen" · „Pillen" · „Standbild" · „Fundstelle" · „Wie das Gerät" ·
„Sache, Einzahl" · „Umstellung läuft" · „nichts wird umkodiert" · „Sicherung
geschrieben" · „zuletzt gesehen"*

> **EIN BEFUND AUS DEM AUGENSCHEIN SELBST, und er gehört ins Protokoll, weil er
> beim nächsten Mal wieder passiert:** *der erste Lauf las die Seiten auf
> ENGLISCH und meldete jede deutsche Zeile als fehlend.* **Ein frischer Chromium
> schickt `Accept-Language: en-US`, und die Installation nimmt das beim
> Einrichten als Vorgabesprache.** *Der Lauf setzt sie seither ausdrücklich —
> und er belegt damit nebenbei, dass `en.json` unangetastet ist: dort stand
> weiterhin „nothing is re-encoded" und „the thumbnails do not follow this
> choice".*

---

## Was diese Runde NICHT gebaut hat

| | |
|---|---|
| **`en.json` und `tr.json` bekommen keine neuen Texte** | *nur die elf Streichungen und das schließende Anführungszeichen. Die Übersetzung ist **0.31.1** (englisch) und **0.31.2** (türkisch)* |
| **Kein Schemaanteil** | *Austauschformat bleibt 16, `F_ROUTES` bleibt 73* |
| **Keine Oberfläche ist umgebaut** | *diese Runde fasst Wörter an, keine Anordnung. Die einzige Ausnahme ist `.page-hint` — und die setzt dieselben zehn und zwanzig Pixel wie vorher* |

---

## Nichts zu tun beim Einspielen

**Kein Schemaanteil, kein Migrationsblock, das Austauschformat bleibt 16,
`F_ROUTES` bleibt 73.**

---

## Die Papiere

| | |
|---|---|
| **`Doku/Auftrag_0.31.0.md`** | acht Leitplanken, zweiundzwanzig Fragen, sieben Bauabschnitte |
| **`Doku/I18N_CLEANUP_DE.md`** | die Vorlage von Google Gemini — **bleibt liegen**, sie ist der Gegenstand, gegen den geprüft wurde |
| **`Doku/Aenderungsprotokoll_0.31.0.md`** | dieses Papier, samt den Absichtszeilen für 0.31.1 und 0.31.2 |
| **`Doku/Projektstand_Kriterion_0_31_0.md`** | `git mv`, **Revision 87** |
| **`Doku/Fahrplan.md`** | eine Zeile in der Tafel; **die geplanten Runden rücken nicht** |
| **`CHANGELOG.md`** | ein Eintrag 0.31.0 |
| **`package.json`, `package-lock.json`** | 0.31.0 |
