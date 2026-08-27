> **DIESER AUFTRAG IST ABGEARBEITET — 0.11.0 IST GEBAUT.** Er steht hier als
> Beleg, was verlangt war; **was daraus wurde, steht im Änderungsprotokoll
> 0.11.0.** Zwei Stellen sind seit Revision 26 der Papiere überholt und binden
> nicht mehr:
>
> * **Das Ideenpapier `Doku/Ideen_und_Vorschlaege.md` gibt es nicht mehr.** Es
>   ist mit `Roadmap.md` zu **`Doku/Fehler_und_Ideen.md`** zusammengezogen.
> * **Die Liste „ZUM VORMERKEN" am Ende ist abgelöst.** Alles Offene daraus
>   steht im Sammelblatt, jeder Punkt mit der Version, die ihn nötig gemacht
>   hat. *Wer wissen will, was noch offen ist, liest dort und nicht hier.*

Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Ideenpapier, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht
an einer Kopie.

AUFTRAG: **Version 0.11.0 — „Suche und Bestand."**
**Die zweite Runde nach dem Stufenplan, die zweite unter Semantic Versioning —
und die erste, die etwas Bestehendes umbaut statt etwas Neues danebenzustellen.**

WORAUF SIE AUFSETZT: 0.10.0 ist gebaut, geschoben **und im Feld bestätigt**,
Fingerprint `dc8c16f7`, **3676 Prüfungen**, 42 Gegenproben, `F_ROUTEN` bei
**69**, Formatnummer **10**, **fünf** markierte Migrationsblöcke, Stolpersteine
bis **163**, **neunzehn** Karten im Systembereich, elf Vokabulareinträge,
**zwanzig** Vorgänge im Sicherheitsprotokoll, **dreizehn** Merkmale,
`BESTAETIGUNG_ZWECKE` bei **sieben**, **53** Portbasen im Prüfstand.
Laufzeitabhängigkeiten: `better-sqlite3-multiple-ciphers`, `express`, `multer`,
`sharp`, `nodemailer`.

WAS SICH ÄNDERT, IN EINEM SATZ: Die Suche zieht vom Browser auf den Server, wer
oft dasselbe sucht, kann es sich merken — und wer denselben Gegenstand zweimal
anlegt, erfährt es beim Tippen und kann die beiden Einträge zu einem machen.

**DIESER AUFTRAG HAT EINEN ANDEREN SCHWERPUNKT ALS DER LETZTE.** Bei 0.10.0 war
alles neu und nichts stand im Weg. **Hier steht überall schon etwas.** Die Suche
gibt es, die gespeicherte Filterstellung gibt es, und an einem Eintrag hängen
**acht Tabellen**. Die Fragen dieser Runde sind deshalb fast alle Fragen nach
dem, was beim Umbauen kaputtgeht — nicht nach dem, was dazukommt.

---

0. WAS AUS DEM FELD ZURÜCKKAM — FÜNF PUNKTE, ZWEI DAVON SIND ARBEIT.

   * **0.10.0 LÄUFT IM FELD.** Der zweite Faktor ist eingespielt und tut, was er
     soll. **Das steht im Projektstand, Abschnitt 2**, und ist damit erledigt.
   * **DER FINGERPRINT DER LAUFENDEN ANLAGE IST NICHT GEMELDET — und der fehlt.**
     Der Branch misst `dc8c16f7`. Ob die Anlage auf dem Wirt denselben Wert
     meldet, weiß niemand. **Genau dort hat sich bei 0.9.1 eine Datei zu viel
     gezeigt** (Befund V, Stolperstein 158): der Server lief einwandfrei, jede
     Prüfung war grün, und trotzdem stand auf dem Wirt ein Stand, den kein
     Commit hatte. **Frag den Wert ab, bevor du irgendetwas baust** — Karte
     „Anlage" im Systembereich. Stimmt er, ist der Punkt in einem Satz erledigt;
     stimmt er nicht, ist das der erste Befund dieser Runde und geht allem
     anderen vor.
   * **Der Git-Tag `v0.10.0` ist weiterhin NICHT geschoben.** Der Push scheitert
     in der Arbeitsumgebung mit `HTTP 403` — Branches gehen durch, Tags nicht.
     Die Befehle stehen im Projektstand, Abschnitt 8, und in
     `Doku/Aenderungsprotokoll_0.10.0.md` unter „Offen geblieben". **Wirkung:
     der Vergleichsverweis am Ende von `CHANGELOG.md` zeigt ins Leere, an der
     Anlage ändert es nichts.** *Ändert sich daran bis zum Ende dieser Runde
     nichts, gilt dasselbe für `v0.11.0` — bau es trotzdem, und schreib es
     wieder auf.*
   * **Der Schlüsselwechsel auf der echten Anlage steht weiterhin aus.** Er
     braucht keine Runde und keinen Auftrag; das Ergebnis gehört in den
     Projektstand, Abschnitt 2. **Nicht Teil dieser Runde.**

   * **DIE MARKE BEKOMMT DEN AKZENT STATT GOLD — UND SIE WIRD GRÖSSER. Das ist
     eine Rücknahme aus 0.10.0, und sie ist ausdrücklich gewollt.** Die Frage
     stand dort schon einmal und wurde **am Papier** entschieden: Gold behalten,
     im Projektstand, Abschnitt 5, als gewollt festhalten. **An der laufenden
     Anlage gesehen, trägt die Begründung nicht.** In der Kopfzeile stehen zwei
     warme Farben nebeneinander, die nichts voneinander wissen — der
     hervorgehobene Strich in Gold, der Knopf daneben in `--accent`. **Eine
     Farbe ist besser als zwei.** Zu tun ist zweierlei:

     **Erstens die Farbe.** Der hervorgehobene Strich geht von `--gold`
     (`#ffc531`) auf `--accent` (`#ff7a1a`). Er steht in **zwei** Dateien, und
     beide sind zu ändern: `public/marke-dunkel.svg` und `public/favicon.svg`,
     jeweils die vierte `path`-Zeile. *Der Rest der Marke bleibt `#838c95`.*
     **Und der Abschnitt „Die Marke trägt Gold, und das ist gewollt (0.10.0)"
     im Projektstand, Abschnitt 5, wird UMGESCHRIEBEN, nicht gelöscht** — eine
     zurückgenommene Entscheidung mit dem Grund daneben ist mehr wert als eine
     verschwundene. *Der Satz, der dabei stehen bleiben darf: Gold ist die Farbe
     der Bewertung. Der Satz, der ihn schlägt: die Marke ist nicht die
     Bewertung, sie ist die Anlage.*

     **Zweitens die Höhe: die Marke soll so hoch stehen wie Titel und Unterzeile
     zusammen.** Heute steht in der Kopfzeile `MARK(32)` neben einem Stapel aus
     `h1` (1,23 rem) und `.count` (0,77 rem) — der Stapel misst rund 40 px.
     **Und die Kachel täuscht:** der gezeichnete Strich läuft im `viewBox` von
     y=6 bis y=26, füllt also nur **62,5 %** der Höhe. Bei 32 px ist das
     Sichtbare 20 px hoch gegen 40 px Text — **die halbe Höhe, und genau das
     sieht man.** **Rechne die Zahl aus, statt sie zu schätzen**, und nimm dabei
     die wirkliche Zeilenhöhe des Stapels, nicht die Schriftgröße.

     **Es gibt zwei Wege dorthin, und sie sind nicht gleichwertig — entscheide
     und begründe:** die Kachel größer ziehen (nur die Kopfzeile ändert sich),
     oder das `viewBox` enger legen, sodass 32 px auch 32 px zeichnen. **Der
     zweite Weg wirkt überall**: auf den Reiter des Browsers, auf das Lesezeichen
     und auf die neun Anmeldeseiten, die über `MARKENZEILE()` mit `MARK(34)`
     dieselbe Datei laden. *Er ist wahrscheinlich der richtige — aber dann
     gehört die Anmeldeseite mitentschieden, nicht mitgeschleift.*

     **Und die Nebenwirkung gehört genannt:** eine geänderte Datei in `public/`
     bewegt den Fingerprint. Das ist normal und steht im Changelog — aber wer
     nach dem Einspielen im Reiter noch die alte Marke sieht, sieht einen
     zwischengespeicherten Stand und keine kaputte Anlage. **Ein Satz dazu unter
     „Was du danach von Hand tun musst."**

   **UND EIN BEFUND, DEN ICH SCHON MITBRINGE: DIE ZAHLEN IM IDEENPAPIER SIND
   ÜBERHOLT.** Abschnitt 3.3 nennt `public/app.js` mit 3.857 Zeilen,
   `renderDetail()` mit 1.310 und `renderSystem()` mit 825. Nachgezählt am
   heutigen Stand: **`public/app.js` 6.101 Zeilen, `renderDetail()` 1.499,
   `renderSystem()` 2.030, `server.js` 4.823, `pruefung.js` 24.567.**
   `renderSystem()` ist seit der Messung **auf das Zweieinhalbfache gewachsen**
   und damit die längste Funktion der Anlage. **Das Ideenpapier ist Quelle und
   nicht Stand** — aber wer aus 3.3 zitiert, zitiert falsche Zahlen.
   **Entscheide, was damit geschieht**: nachziehen, oder den Abschnitt als
   überholt kennzeichnen und die Zahlen dorthin nehmen, wo der Stand steht.
   *Was NICHT zur Debatte steht, ist ein Aufräumen von `renderSystem()` in
   dieser Runde.* Die Regel aus dem Ideenpapier bleibt: beim nächsten Anfassen
   je einen Block herausziehen, nicht als eigenes Vorhaben.

---

1. DREI TEILE, UND SIE SIND UNGLEICH GROSS.

   Der Fahrplan nennt für 0.11.0 drei Dinge: **Volltextsuche, gespeicherte
   Ansichten, Doppelerkennung samt Zusammenführen.** Sie sind hier einzeln
   aufgeschrieben, weil sie verschieden schwer sind und weil der Schnitt, falls
   einer nötig wird, zwischen ihnen läge und nicht mitten in einem.

   **1a. DIE SUCHE ZIEHT AUF DEN SERVER.**

   **Was heute ist**, und das ist gemessen, nicht behauptet: `GET /api/items`
   liefert bei **jedem** Blick in die Übersicht den ganzen Bestand. Je Eintrag
   baut der Server ein Feld `searchText` aus Titel, Beschreibung, Kategorie,
   Tags, Testtag-Tags, Linkadressen und **sämtlichen Kommentartexten**; gefiltert
   und gesucht wird danach vollständig im Browser, in einer Zeile
   (`public/app.js`, `visibleItems()`: `out.filter(i => (i.searchText ||
   '').includes(q))`).

   **Frisch gemessen an einem echten Server auf dem Stand 0.10.0**, je Eintrag
   4 Kommentare:

   | Einträge | Antwortzeit | Antwortgröße | ohne `searchText` |
   |---:|---:|---:|---:|
   | 100 | 29 ms | 0,30 MB | 0,11 MB |
   | 300 | 64 ms | 0,91 MB | 0,32 MB |

   **`searchText` ist 64 % der Antwort.** Das ist genau der Teil, den das
   Ideenpapier in 3.1 herausnehmen will, und die Messung stützt den Vorschlag
   deutlicher als die alten Zahlen dort (die sind von vor 0.8.50 und kennen
   weder Videos noch Verfasser).

   **DIE ZWEITE MESSUNG IST EINE ABSAGE AN DAS NAHELIEGENDE, und sie ist die
   wichtigste dieser Runde.** Die eingebaute SQLite kann **FTS5** — nachgesehen:
   Version 3.49.2, `ENABLE_FTS5` ist übersetzt, `trigram` und
   `unicode61 remove_diacritics 2` legen beide an. **Es käme also keine
   Abhängigkeit dazu.** Trotzdem: an 1000 Einträgen mit je 4 Kommentaren
   (1,47 MB Suchtext) kostet

   * ein schlichter `LIKE '%…%'`-Durchlauf über eine Textspalte **rund 1 ms**,
   * dieselbe Suche über einen FTS5-Trigramm-Index **0,06 bis 1,5 ms**,
   * und der Index selbst **2,91 MB — doppelt so viel wie der Text, den er
     indiziert.**

   **Bei dieser Größenordnung lohnt der Index nicht.** Er kostet eine weitere
   Tabelle, eine Auffrischung bei jedem Schreiben an sieben Stellen und einen
   Neuaufbau bei jedem Einspielen — für eine Millisekunde. **Und er ändert das
   Verhalten für den Menschen:** heute findet die Suche **jeden Teilstring ab
   einem Zeichen**, weil `includes()` das tut. `unicode61` findet nur Präfixe,
   `trigram` braucht **drei** Zeichen. Wer FTS5 nimmt, nimmt dem Benutzer etwas
   weg, was er heute hat. **Mein Vorschlag ist deshalb: kein FTS5, ein
   serverseitiger Durchlauf** — aber ich will deine Begründung dazu, nicht deine
   Zustimmung. Wenn du meinst, die Rechnung geht anders auf, sag es mit Zahlen.

   **VIER FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Wo wird der Suchtext gebildet — bei jeder Anfrage neu oder gespeichert?**
     Heute entsteht er bei jeder Anfrage aus sieben Quellen. Bleibt es dabei,
     kostet die Runde **keine Schemaänderung**. Wird er gespeichert, ist eine
     Spalte an `items` der **sechste Migrationsblock**, und den will ich nicht;
     eine eigene Tabelle wäre keiner. **Sag, was du nimmst, und was es beim
     Schreiben kostet**: ein gespeicherter Suchtext muss bei jeder Änderung an
     Titel, Beschreibung, Kategorie, Tags, Testtagen, Links **und Kommentaren**
     nachgezogen werden — das sind sieben Stellen, und eine vergessene ist eine
     zweite Wahrheit.
   * **Wie sieht die Route aus?** *Ich neige zu: `GET /api/items?q=…`* — dieselbe
     Route, ein zusätzlicher Parameter, damit die Oberfläche nicht zwei Wege für
     dieselbe Liste kennt. **Sie ist lesend und steht damit NICHT in
     `F_ROUTEN`** (dieselbe Regel wie bei `GET /api/offen`); `F_ROUTEN` bleibt
     bei 69, **und die Zahl wird ausdrücklich geprüft.** Prüf, ob das stimmt.
   * **DIE NAMEN SIND SCHON VERGEBEN, und das ist die Falle.** In dieser Anlage
     bedeuten `suche`, `suchAnbieter`, `suchNamen` und `suchvorlage` seit jeher
     **die Websuche nach dem Namen eines Gegenstands** bei Google, Bing oder
     DuckDuckGo — eine ganz andere Sache. Ein neues `suche` daneben wären zwei
     Wahrheiten über ein Wort. **Entscheide die Namen, bevor du baust**, und
     schreib sie auf.
   * **`testDays` nur mitliefern, wenn die Zeitleiste eingeschaltet ist** —
     Punkt 2 aus Ideenpapier 3.1. Der Server kennt die Einstellung bereits
     (`zeitleisteAn(benutzerId)`). **Und hier liegt eine Falle, die ich
     ausdrücklich benenne:** die Oberfläche liest `it.testDays` **nicht nur** für
     die Zeitleiste — die Kachel zählt daraus die eigenen Testtage. Wer das Feld
     wegnimmt, macht die Kachel still falsch, und zwar nur bei dem, der die
     Zeitleiste abgeschaltet hat. **Das ist Stolperstein 102 in Reinform: zu
     jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine Prüfung
     an der echten Antwort.** Such alle Lesestellen, nicht die erste.

   **WAS NICHT IN DIESE RUNDE GEHÖRT:** Nachladen beim Scrollen (Punkt 3 aus
   3.1) — und Blättern mit Seitenzahlen **gar nicht**, weder jetzt noch später.
   Das Kartenraster mit durchgehender Suche ist eine Bedienidee, und Blättern
   zerschneidet sie.

   **1b. GESPEICHERTE ANSICHTEN.**

   **Was heute ist:** es gibt genau **eine** gemerkte Filterstellung je Zugang.
   Sie steht in `settings` unter dem persönlichen Schlüssel `filters`
   (`PERSOENLICHE_SCHLUESSEL` in `server.js`) und wird bei jeder Änderung
   stillschweigend überschrieben. Kategorie, Tags samt Und/Oder, getestet,
   Favorit, neu, Sortierung.

   **Was dazukommt:** mehrere davon, benannt, umschaltbar.

   **FÜNF FRAGEN:**

   * **Wo liegen sie?** *Ich neige zu: ein weiterer persönlicher Schlüssel in
     `settings`, als JSON-Liste* — es ist genau die Form, die `filters` schon
     hat, es gibt keine Fremdschlüssel darauf, und eine Ansicht ist kein Träger
     wie Eintrag, Kommentar, Testtag, Bewertung, Link oder Datei. **Die
     unangenehme Hälfte der Frage:** eine Ansicht nennt Kategorien und Tags über
     ihre Nummer. Wird eine Kategorie gelöscht, kennt JSON keine Kaskade — die
     Ansicht zeigt dann ins Leere. **Sag, was dann passiert**, und bau es so,
     dass es nicht als Fehler aussieht. *Eine eigene Tabelle mit Fremdschlüsseln
     löste das, kostete aber zwei weitere Tabellen samt Kaskade; wenn du sie für
     richtiger hältst, begründe es genau an dieser Frage.*
   * **Persönlich oder teilbar?** *Ich neige zu: persönlich, ganz* — dieselbe
     Linie wie `filters`, `bloecke` und `zeitleiste`. Eine geteilte Ansicht wäre
     ein neuer Träger und eine neue Rechtefrage, und beides sprengt die Runde.
   * **Gehört der Suchbegriff in die Ansicht?** Er steht heute **nicht** in
     `state.filters`, sondern daneben. Eine Ansicht „Bosch, ungetestet" wäre
     erst mit ihm vollständig — und eine gespeicherte Suche ist etwas anderes
     als ein gespeicherter Filter. **Entscheide es und begründe es an der Frage,
     was ein Mensch erwartet, wenn er eine Ansicht anklickt.**
   * **Wie viele?** Ein Namensfeld ohne Deckel ist ein Speicherfüller, und die
     Anlage deckelt sonst überall (zwanzig Anfragen, acht Wiederherstellungscodes).
     **Nenn eine Zahl und den Grund.**
   * **Was wird aus der einen gemerkten Stellung von heute?** Sie darf beim
     Einspielen nicht verschwinden — wer 0.10.0 fährt, hat eine, und sie ist
     seine. *Ich neige zu: sie bleibt, was sie ist — die zuletzt benutzte
     Stellung —, und die Ansichten stehen daneben.* Prüf, ob das ohne
     Migrationscode geht. **Wenn du meinst, es geht nicht, ist das ein Grund
     anzuhalten und zu fragen.**

   **1c. DOPPELERKENNUNG UND ZUSAMMENFÜHREN — DER TEIL, DER DIE RUNDE SPRENGEN
   KANN.**

   Es sind **zwei** Vorhaben in einer Zeile des Fahrplans, und sie sind
   verschieden schwer wie Tag und Nacht.

   **Die Doppelerkennung ist klein.** Ideenpapier 4.6: im Anlegen-Dialog, nach
   dem Tippen des Titels, eine unaufdringliche Zeile *„Ähnlich: Bosch GSR 18V
   (2024), Bosch GSR 18V-60"* mit Sprungmarken. **Kein Blockieren, keine
   Rückfrage.** Vergleich über den Titel, ohne Rücksicht auf Groß- und
   Kleinschreibung und Sonderzeichen, Teilstrings **ab vier Zeichen**. Kein
   Schema. *Trigramme oder Levenshtein braucht es nicht: Titel sind kurz, und
   Menschen tippen denselben Gegenstand meist ähnlich.* **Der Grund, warum das
   überhaupt zählt, steht im Ideenpapier und ist gut:** bei einem Zugang weiß
   man, was man eingetragen hat; bei vier Zugängen und 300 Einträgen legt der
   zweite Mensch dieselbe Maschine ein zweites Mal an — **und dann stehen die
   Bewertungen an zwei Stellen.** Eine Sache, zwei Wahrheiten, genau das, wogegen
   die ganze Doktrin sonst kämpft.

   **Das Zusammenführen ist groß, und ich habe nachgezählt.** An einem Eintrag
   hängen **acht Tabellen**: `photos`, `links`, `test_days`, `ratings`,
   `comments`, `item_tags`, `attachments`, `item_pins`. **Zwei davon tragen eine
   UNIQUE-Schranke, die beim Zusammenführen bricht — und das ist kein Randfall,
   sondern der Normalfall:**

   * `ratings` hat `UNIQUE(item_id, criterion_id, user_id)`. Derselbe Mensch hat
     dasselbe Kriterium an **beiden** Einträgen bewertet. Welche Bewertung
     gewinnt?
   * `test_days` hat `UNIQUE(item_id, day, user_id)`. Derselbe Mensch am selben
     Tag an beiden.

   **Ein schlichtes `UPDATE … SET item_id = ?` läuft dort auf einen
   Constraint-Fehler.** Wer das nicht vorher weiß, merkt es beim ersten echten
   Doppeleintrag.

   **SIEBEN FRAGEN, und zu jeder gehört eine Entscheidung, nicht eine Aufzählung
   der Möglichkeiten:**

   * **Was gewinnt bei einer doppelten Bewertung?** Der höhere Wert, der neuere,
     der des Ziels? *Ich neige zu: der des Ziels bleibt, der andere fällt weg —
     und der Dialog sagt vorher, wie viele wegfallen.* **Eine Bewertung
     stillschweigend zu überschreiben ist eine Aussage über einen Menschen**, und
     die Anlage macht die sonst nirgends von selbst.
   * **Dasselbe für Testtage.**
   * **Was wird aus dem Verlierer?** Löschen oder in den Papierkorb? **Achtung,
     und das ist eine echte Falle:** der Papierkorb aus 0.8.70 serialisiert einen
     Eintrag **samt allem, was daran hängt**. Nach dem Zusammenführen hängt
     nichts mehr daran — die Wiederherstellung gäbe eine leere Hülle zurück.
     **Das ist schlechter als gar kein Papierkorbeintrag**, weil es aussieht wie
     eine Rettung und keine ist. Entscheide es und sag es dem Menschen im Dialog.
   * **Titel, Beschreibung, Kategorie, `tested`, `rejected`, `updated_at`,
     Favorit** — je eine Entscheidung, keine Sammelantwort.
   * **Wer darf zusammenführen?** Zwei Einträge, womöglich zwei Verfasser.
     *Ich neige zu: nur der Admin* — es ist ein Eingriff, der **fremde Zeilen
     bewegt**, und die Doktrin sagt: was fremde Zeilen bewegt, geht nicht an der
     Rollenleiter vorbei. **Und die zweite Bestätigung aus 0.8.90 gehört davor**,
     weil es unumkehrbar ist. `BESTAETIGUNG_ZWECKE` ginge damit von **sieben auf
     acht** — sag, ob das stimmt, oder ob es an einen vorhandenen Zweck passt.
   * **Kommt ein Vorgang ins Sicherheitsprotokoll?** *Ich neige zu: ja* —
     `VORGAENGE` von **zwanzig auf einundzwanzig**. Es ist der erste Eingriff der
     Anlage, der zwei Einträge zu einem macht, und er ist nicht rückgängig zu
     machen. **Ohne Freitext**, wie überall: Nummern, keine Titel.
   * **Und die Route?** Sie ist schreibend, kommt also in `F_ROUTEN`: **69 → 70**,
     Art `nurAdmin` und `zweitbestaetigt`. Prüf die Zahl ausdrücklich.

   **SAG ES, WENN DAS ZUSAMMENFÜHREN DIE RUNDE ZU BREIT MACHT — sobald du es
   kommen siehst, nicht hinterher.** Der Schnitt läge sauber: Suche und Ansichten
   und **Doppelerkennung** bleiben in 0.11.0, das **Zusammenführen** bekommt eine
   eigene Runde. *Was dagegen spricht und mitzudenken ist: eine Doppelerkennung
   ohne Zusammenführen ist ein Hinweis ohne Heilmittel* — der Mensch sieht, dass
   er den Gegenstand zweimal hat, und kann nichts tun außer einen davon von Hand
   leerzuräumen. **Das ist kein Ausschlussgrund, aber es gehört in die
   Begründung.**

---

2. WAS DER MENSCH SIEHT — UND DIESE RUNDE KANN DIE ANLAGE VERSCHLECHTERN.

   **Das ist neu gegenüber 0.10.0, und es ist der ernsteste Satz dieses
   Papiers.** Der zweite Faktor konnte nichts kaputtmachen: wer ihn nicht
   einschaltete, merkte nichts. **Die Suche merkt jeder, sofort, bei jedem
   Tastendruck.** Heute ist sie augenblicklich, weil sie im Arbeitsspeicher des
   Browsers läuft. Serverseitig heißt: **jeder Tastendruck ist eine Anfrage über
   das Netz.**

   * **Wie oft wird gefragt?** Entprellen? Ab wie vielen Zeichen überhaupt?
     **Entscheide es und begründe es**, und nimm den Fall mit, der wehtut: ein
     Raspberry Pi über WLAN.
   * **Was steht da, während gesucht wird?** Eine Liste, die zwischen zwei
     Tastendrücken leer wird, ist schlechter als eine, die 0,3 MB gekostet hat.
   * **Was, wenn die Suchanfrage scheitert?** Heute **kann** sie nicht scheitern.
     Ab dieser Runde schon. Der Rückfall gehört gebaut und geprüft, nicht
     gehofft.
   * **Und die ehrliche Gegenrechnung:** die Runde nimmt 64 % aus einer Antwort,
     die alle 30 Sekunden einmal kommt, und legt dafür eine Anfrage auf jeden
     Tastendruck. **Rechne nach, dass sich das lohnt**, statt es zu behaupten —
     mit den Zahlen aus 1a und einer Messung der neuen Route.
   * **Die Ansichten stehen bei den Filtern**, nicht in einer neuen Karte. Es
     bleibt bei **neunzehn**. Sag, wenn du eine eigene für richtiger hältst, und
     begründe es an der Frage, wo ein Mensch danach sucht.
   * **„Ähnlich: …" ist eine Zeile, kein Dialog.** Kein Blockieren, keine
     Rückfrage, Sprungmarken hinein.
   * **Die Marke aus Punkt 0 ist der einzige Eingriff dieser Runde, den JEDE
     Seite trägt** — Kopfzeile, Reiter, neun Anmeldeseiten. **Sie gehört an den
     Anfang der Runde und nicht ans Ende**, damit sie in jedem der drei
     Prüfläufe mitläuft und nicht nur im letzten.
   * **Der Zusammenführen-Dialog zeigt ZAHLEN, bevor geklickt wird:** wie viele
     Fotos, Kommentare, Bewertungen, Testtage, Links, Dateien und Tags umziehen
     — **und wie viele wegfallen.** Eine Beteuerung, dass nichts verlorengeht,
     ist keine Zahl.

---

3. DIE MISSBRAUCHSSEITE — VIER DINGE.

   * **`%` UND `_` SIND PLATZHALTER.** Ein Suchbegriff, der ungeprüft in ein
     `LIKE` geht, verhält sich anders, als er aussieht: `%` findet alles.
     `ESCAPE` oder Vorabbereinigung — **entscheide, bau es und prüf es**,
     einschließlich der Gegenlage, dass ein Mensch das Prozentzeichen auch
     **suchen** können muss.
   * **Die Suche darf nicht MEHR liefern als die Liste heute.** `GET /api/items`
     zeigt jedem alles — die Suche ist damit kein neuer Zugang zu fremden
     Kommentaren, **solange sie dieselbe Menge trifft.** Prüf, dass sie es tut,
     und dass sie nichts zurückgibt, was die Liste verschweigt (Papierkorb,
     abgelehnte Einträge, fremde Entwürfe).
   * **Der Suchbegriff kommt NICHT ins Sicherheitsprotokoll.** Freitext gehört
     dort nicht hinein — dieselbe Linie wie bei der Selbstanmeldung
     (Projektstand, Abschnitt 5). *Beim Zusammenführen gilt dasselbe: die
     Nummern, nicht die Titel.*
   * **Braucht die Suche eine Bremse?** *Ich neige zu: nein* — sie steht hinter
     der Anmeldung, und die Anmeldebremse verteidigt gegen Fremde, nicht gegen
     Zugänge. **Sag es ausdrücklich, statt es offenzulassen.**

---

4. DER PRÜFSTAND HAT EIN EIGENES PROBLEM, UND ES IST GEMESSEN.

   **Die Portbasen sind fast alle.** Nachgerechnet am heutigen Stand:

   * **53 Basen**, die niedrigste ist `HAUPT_BASIS` 3900, das höchste Fenster
     endet bei **6879**.
   * **Die Spanne aller Basen beträgt damit 2980**, `VERSATZ_STUFE` steht bei
     **3000**. **Es sind zwanzig Nummern Luft** — und ein Fenster ist 60 breit.
   * **Oben passt also keine neue Basis mehr dazu.** Der Wächter am Ende des
     Laufs rechnet das nach und wird rot.

   **Zwei Auswege, und beide sind zu entscheiden, bevor eine Prüflage gebaut
   wird:**

   * **In eine Lücke innerhalb der Spanne gehen.** Es gibt welche; sie sind
     auszuzählen, nicht zu schätzen (Stolpersteine 64, 127 und 152). Keine
     entstehende Nummer darf auf der Sperrliste liegen: **4045, 4190, 5060, 5061,
     6000, 6566, 6665–6669, 6679, 6697, 10080.**
   * **`VERSATZ_STUFE` anheben.** Nachgerechnet: **es geht, aber nur knapp.** Bei
     einer Stufe ab etwa 3200 wandert Nebenspur 1 auf **10080** — und die steht
     auf der Sperrliste. Brauchbar bleibt ungefähr **3100 bis 3140**, also genau
     Platz für **ein** weiteres Fenster. *Die obere Schranke „höchste Nummer aller
     Spuren unter 32768" ist dabei nicht das Problem; die Sperrliste ist es.*

   **Was daraus folgt, und es gehört ins Änderungsprotokoll dieser Runde:** die
   heutige Aufteilung trägt noch **eine** neue Prüflage mit eigener Basis, dann
   ist Schluss. Wer danach eine braucht, muss die Fenster schmaler machen, Lagen
   zusammenlegen oder die Spuren anders legen. **Das ist kein Auftrag für diese
   Runde — aber es ist der Punkt, an dem der Prüfstand das nächste Mal
   anhält, und er soll niemanden überraschen.**

---

LESEWEGE — WAS DU WIRKLICH BRAUCHST:

* **Am Stück lesen:** dieser Auftrag, `Doku/Aenderungsprotokoll_0.10.0.md`
  (Abschnitte 2 bis 5 — die Abweichungen, die Befunde A bis G und die
  Stolpersteine 159 bis 163). **Befund F und Stolperstein 163 sind die
  lehrreichsten** — eine Schranke hinter einer anderen Absage prüft nichts.
* **Ideenpapier `Doku/Ideen_und_Vorschlaege.md`, drei Abschnitte und sonst
  nichts:** **3.1** (`/api/items` liefert den ganzen Bestand — die Herkunft von
  Teil 1a), **3.3** (die zu großen Funktionen — **mit den überholten Zahlen aus
  Punkt 0**) und **4.6** (Doppelerkennung). *Der Rest des Papiers gehört nicht in
  diese Runde.*
* **Abschnittsweise, über die Überschriften angesteuert:** Projektstand
  Abschnitt 2 (Betriebsstand und Einspielweg), 4 (die Karten und der
  Funktionsumfang — **der ganze Abschnitt**, denn diese Runde fasst Vorhandenes
  an), 5 (Entscheidungen — **darin Semantic Versioning, Keep a Changelog und
  was bei Kriterion die öffentliche Schnittstelle ist**), 6 (**Stolpersteine 13,
  47, 61, 81, 90, 102, 106, 138, 145, 154, 158 und 159 bis 163**), 7 (Prüfstand,
  besonders die Portbasen), 8 (offene Betriebspunkte), 10 (**der Fahrplan**),
  12 (Arbeitsweise samt Sprachregel).
* **`CHANGELOG.md` im Wurzelverzeichnis, den Kopf, den Eintrag `## [0.10.0]` und
  `## [Unreleased]`** — 0.10.0 ist die Vorlage, nach der dein Eintrag auszusehen
  hat.
* **Das Konzeptpapier gar nicht.** Es ist mit 0.9.1 geschlossen; „Suche und
  Bestand" ist keine Stufe daraus. **Fällt dir beim Bauen etwas auf, das dort
  falsch wird, ist das ein Befund und gehört gemeldet**, nicht stillschweigend
  nachgezogen.
* **Gezielt greppen, nie am Stück lesen:** `pruefung.js` (24 567 Zeilen). Was du
  brauchst, findest du über `gruppe('…')`, `F_ROUTEN`, `starteWeiterenServer`,
  `PRUEFLAGEN`, `baueDom`, `PORT_VERSATZ`, `pbBasen` und `kurzlauf`.
* **Der Quelltext, den es wirklich braucht:** `server.js` (`GET /api/items` samt
  `searchText`, `POST /api/items`, `PUT`/`DELETE /api/items/:id`,
  `PERSOENLICHE_SCHLUESSEL`, `GET`/`PUT /api/settings`, `zeitleisteAn`,
  `zweiteBestaetigung`, `papierkorb`), `db.js` (**das Schema am Stück** — es sind
  die acht Tabellen aus 1c und ihre UNIQUE-Schranken), `public/app.js`
  (`visibleItems`, `renderList`, `zeichneFilter`, `zeitleistePunkte`, der
  Anlegen-Dialog, `EINSTELLUNGEN`/`state.filters`), `auth.js` (`VORGAENGE`,
  `protokolliere`, `BESTAETIGUNG_ZWECKE`).
* **Nicht lesen, solange keine bestimmte Frage dorthin führt:** die
  Änderungsprotokolle vor `0.10.0`, das Videopapier, das Konzeptpapier,
  `schluessel.js`, `anhaenge.js`, `keys.js`, `mail.js`, `zweifaktor.js`.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies nach den Lesewegen. Nicht mehr, und nicht am Stück.
2. **Frag den Fingerprint der laufenden Anlage ab** (Punkt 0) und sieh dir die
   betroffenen Stellen im Repo an, bevor du etwas vorschlägst.
3. **Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen.** Die Fragen aus 1a, 1b, 1c und aus den Punkten 0, 2, 3 und 4
   gehören hierher, nicht in den Bau. **Unstimmigkeiten zwischen Projektstand,
   Ideenpapier und Quelltext sagst du jetzt.**
4. **MISS, BEVOR DU DICH FESTLEGST.** Die Zahlen in 1a stammen aus einem
   Prüfbestand — nicht aus einem echten. **Bau dir einen Bestand über die echten
   Routen, miss die heutige Antwort und miss die neue**, bevor du entscheidest,
   ob der Suchtext gespeichert wird und ob FTS5 draußen bleibt. *Eine Zusage über
   Antwortzeiten, die erst der Prüfstand belegt, ist eine Runde zu spät.*
5. Erst nach meinem OK bauen. Gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
6. **Kommt eine neue Prüflage mit eigener Portbasis dazu, wird sie
   AUSGERECHNET, nicht geschätzt** — siehe Punkt 4 oben; **die Spanne ist fast
   voll, und das ist diesmal keine Formalie.**
7. Neue Prüfungen in `pruefung.js`. **Was mindestens hineingehört**, und die
   Liste ist keine Obergrenze:
   * **die Suche findet dasselbe wie heute** — an einem Bestand mit Umlauten,
     Groß- und Kleinschreibung, Kommentartext und Testtag-Tags, **je eine Lage
     für jede der sieben Quellen des Suchtexts**;
   * **ein Teilstring ab einem Zeichen findet weiterhin**, wenn das die
     Entscheidung ist — und wenn nicht, ist die Änderung geprüft und steht im
     Changelog;
   * **`%` und `_` im Suchbegriff verhalten sich wie Text**, nicht wie
     Platzhalter, **samt der Gegenlage**, dass man sie suchen kann;
   * **die Suche liefert nicht mehr als die Liste** — kein Papierkorb, nichts,
     was `GET /api/items` verschweigt;
   * **`searchText` steht nicht mehr in der Antwort von `GET /api/items`**, und
     **kein Feld sonst ist dabei verschwunden** — Feld für Feld gegen die alte
     Antwort;
   * **`testDays` fehlt genau dann, wenn die Zeitleiste aus ist** — und **die
     Kachel bleibt trotzdem richtig** (Stolperstein 102, alle Lesestellen);
   * **eine gespeicherte Ansicht überlebt Abmelden und Anmelden**, ist
     persönlich, und **ein anderer Zugang sieht sie nicht**;
   * **eine Ansicht mit gelöschter Kategorie oder gelöschtem Tag** verhält sich
     wie entschieden und wirft nichts;
   * **der Deckel für Ansichten greift**;
   * **die eine gemerkte Filterstellung aus 0.10.0 überlebt das Einspielen** — an
     einer Anlage mit vorhandenem `filters`-Eintrag nachgestellt;
   * **„Ähnlich: …" findet den Doppeleintrag** über Groß-/Kleinschreibung,
     Sonderzeichen und Teilstrings ab vier Zeichen — **und blockiert nichts**;
   * **das Zusammenführen bewegt ALLE acht Tabellen** — je eine Prüfung, keine
     Sammelprüfung;
   * **die beiden UNIQUE-Schranken** an `ratings` und `test_days` verhalten sich
     wie entschieden, **an einem Bestand, der sie wirklich reißt**;
   * **der Verlierer verschwindet wie entschieden**, und der Papierkorb enthält
     danach, was angesagt ist — **nicht eine leere Hülle**;
   * **kein Admin-fremder Zugang führt zusammen**, und **ohne zweite Bestätigung
     geht es nicht**;
   * **`F_ROUTEN` trägt die neue Route mit ihrer Art**, und die **Zahl** wird
     ausdrücklich geprüft; **die Suchroute steht NICHT darin**;
   * **die Oberfläche:** suchen, Ansicht speichern, Ansicht wählen, Ansicht
     löschen, „Ähnlich" sehen, zusammenführen — jedes über ein **wirklich
     zugestelltes** Ereignis (Stolperstein 61);
   * **zu jedem Feld, das die Oberfläche aus einer Antwort liest, eine Prüfung an
     der echten Antwort** (Stolperstein 102);
   * **die Marke trägt den Akzent und nicht mehr Gold** — geprüft an **beiden**
     SVG-Dateien und nicht an einer; **und sie steht so hoch wie der Stapel
     daneben**, gemessen am gezeichneten Strich, nicht an der Kachel;
   * **die Abhängigkeitszahl bleibt, wo sie ist** — diese Runde nimmt keine auf;
   * **der Sprachwächter bleibt grün** — er sieht auch die Papiere dieser Runde
     an.
8. **Die Gegenproben laufen über `gegenprobe.js`** und liefern **eine** Tabelle.
   **Nenn im Vorschlag, welche Rückbauten du fahren willst.** Ich erwarte
   **mindestens zwanzig**, und die Liste wird **gegen die Liste der neuen
   Verhaltensweisen gehalten**, nicht gegen ein Gefühl für die Zahl. Darunter
   mindestens: die Suche über jede der sieben Quellen, die Platzhalter, die
   fehlenden `testDays`, die Kachelzahl daneben, die Persönlichkeit der
   Ansichten, der Deckel, jede der acht Tabellen beim Zusammenführen, beide
   UNIQUE-Schranken, das Adminrecht und die zweite Bestätigung.
   **Ein Rückbau, der KEINE Prüfung rot macht, ist ein FUND** und wird
   untersucht, nicht abgehakt — in 0.10.0 war einer darunter, und er hat eine
   echte Lücke aufgedeckt (Befund F, Stolperstein 163). **Ein Rückbau, der den
   Lauf ABREISST statt ihn rot zu machen, ist ein Baufehler am Rückbau**
   (Stolpersteine 138 und 161): er ändert die Wirkung, nicht die Form — keine
   Platzhalterzahl, kein weggenommenes DDL. **Jede Lesestelle in einer neuen
   Gruppe läuft über ein Auffangnetz.**
9. **DREI PRÜFLÄUFE:** einer nach dem Bau, einer nach den neuen Prüfungen,
   einer zum Schluss gegen genau den Stand, der geschoben wird. **Und die
   Gegenproben laufen gegen einen COMMITTETEN Stand** — `git archive HEAD` kennt
   nichts, was nur im Arbeitsbaum liegt.
10. **KEINE HILFSDATEIEN IM ARBEITSBAUM.** Was du zum Messen brauchst, läuft
    über `node -e` oder liegt außerhalb des Repos.

---

DIE BEIDEN RICHTLINIEN GELTEN WEITER — sie sind ab 0.10.0 gesetzt und stehen im
Projektstand, Abschnitt 5: **Semantic Versioning 2.0.0** für die Nummern,
**Keep a Changelog 1.1.0** für `CHANGELOG.md`. Was das für diese Runde heißt:

* **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.11.0 ist MINOR, weil Funktionen
  dazukommen. **Aber sieh genau hin:** `searchText` fällt aus der Antwort von
  `GET /api/items` heraus, und das ist eine **Wegnahme**. Ob die Antwort einer
  Route zur öffentlichen Schnittstelle gehört, steht in Abschnitt 5 — **lies es
  nach und schreib den Grund für die Nummer ins Änderungsprotokoll**, in einem
  Satz. *Stellt sich beim Bauen heraus, dass etwas anderes bricht — Schema,
  Austauschformat, `.env`, die Werkzeuge auf dem Wirt —, ist das ein Grund
  anzuhalten und zu fragen, nicht ein Grund, die Nummer stillschweigend anders
  zu wählen.*
* **NICHTS WIRD UNTER EINER SCHON HERAUSGEGEBENEN NUMMER NACHGESCHOBEN.** Kommt
  nach 0.11.0 etwas nach, heißt es 0.11.1.
* **`CHANGELOG.md` bekommt den Eintrag `## [0.11.0] - <JJJJ-MM-TT>`**, Datum nach
  ISO 8601, neueste Version oben, darunter die zutreffenden von **`Added` ·
  `Changed` · `Deprecated` · `Removed` · `Fixed` · `Security`** — englisch, leere
  weggelassen. **Dahinter die beiden eigenen Abschnitte**: „Was du danach von
  Hand tun musst" und „Was gleich bleibt".
* **DER ABSCHNITT `## [Unreleased]` WIRD MITGESCHRIEBEN, WÄHREND GEBAUT WIRD** —
  nicht am Schluss aus dem Gedächtnis gefüllt.
* **WAS DU ENTFERNST, STEHT UNTER `Removed` — UND EINEN SATZ WEITER UNTEN.** Eine
  weggenommene Datei bleibt beim Einspielen über den alten Ordner liegen und
  verschiebt den Fingerprint. Sie gehört deshalb **auch** nach „Was du danach von
  Hand tun musst".
* **DIE VERSION BEKOMMT EINEN GIT-TAG**, `v0.11.0` auf den Commit, der
  herausgeht, und die Vergleichsverweise unten in `CHANGELOG.md`. *Der Push
  scheitert in dieser Umgebung an `HTTP 403`; leg ihn trotzdem an und schreib
  es auf, wie bei `v0.10.0`.* **Nachgesehen: das Repo trägt vierzehn Tags** —
  `0.8.3` bis `v0.8.91`, gemischt mit und ohne `v`; `v0.10.0` folgt den beiden
  jüngsten.

---

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.** `Tag`, `Token` und `Index`
  sind Fachbegriffe und bleiben. *Die sechs Abschnittsnamen im Changelog bleiben
  englisch.*
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens.
  Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.11.0` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`).
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch keine für den Prüfstand, und
  auch keine, die „nur" indiziert. `nodemailer` war die Ausnahme einer Runde und
  bleibt es.
* **Keine Zugangsdaten im Chat.** Kein Passwort, kein Schlüssel, kein Token, kein
  TOTP-Geheimnis, kein Wiederherstellungscode — weder von dir noch von mir. Die
  Prüfungen arbeiten mit erfundenen Werten, und das genügt. Kommt trotzdem eines
  ins Gespräch, **sagst du es und nennst das Gegenmittel**, statt darüber
  hinwegzugehen.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Eine Lage, die zwei Schranken zugleich reißt, prüft keine von beiden**
  (Stolperstein 154).
* **Eine Schranke, die hinter einer anderen Absage steht, prüft sich nur, wenn
  die erste durchgelassen wird** (Stolperstein 163) — beim Zusammenführen liegen
  Recht, zweite Bestätigung und UNIQUE-Schranke hintereinander.
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106) — Ausnahme bleibt der Sprachwächter.
* **Ein Mock antwortet wie der echte Server** (Stolperstein 90). Der DOM-Mock
  bekommt die neuen Endpunkte, **und er liefert nicht selbst,
  was die Prüfung belegen soll** (Stolperstein 102).
* **Wird es zu viel für einen Durchgang, sag es, sobald du es kommen siehst —
  nicht hinterher.** Der Schnitt liegt zwischen Doppelerkennung und
  Zusammenführen (siehe 1c); der Rest bekäme eine eigene MINOR-Runde.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde steht die
  Antwort vorbehaltlich da:** die Suche braucht **kein** Schema, die Ansichten
  brauchen **kein** Schema, das Zusammenführen braucht **keins** — es bewegt
  vorhandene Zeilen. **Wenn das nach deiner Durchsicht nicht stimmt, ist das ein
  Grund anzuhalten und zu fragen.**
* Das Schema bleibt vollständige DDL in `db.js`.
* Einmaliger Migrationscode stünde gebündelt in `migration0110()`. **Die Marke
  darüber lautet weiterhin `// MIGRATION 0.9.x — ENTFAELLT MIT 1.0`** — sie ist
  der Wortlaut, den alle fünf vorhandenen Blöcke tragen, und ein sechster mit
  anderem Wortlaut wäre eine zweite Schreibweise für dieselbe Sache. *Die Marke
  ist ein Suchwort, kein Termin.* **Der Code wird voraussichtlich nicht
  gebraucht.**
* **Und die Sonderregel dieser Runde:** das Zusammenführen ist der erste
  Eingriff, der Zeilen zwischen zwei Eltern verschiebt. Er läuft in **einer**
  Transaktion oder gar nicht. Ein halb zusammengeführter Eintrag ist schlimmer
  als zwei ganze.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer sein,
  und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.11.0.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, neue Stolpersteine (**die Zählung setzt bei
  164 fort** — 159 bis 163 sind vergeben), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (vorher: **3676**),
  Offengebliebenes. **Und die Messwerte** aus Schritt 4 — vorher und nachher, an
  derselben Bestandsgröße.
* Die Zeile „0.11.0 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen. **Und `public/` gehört dazu**:
  er geht über ALLES darin und nicht über eine Liste erwarteter Namen; eine Datei
  zu viel bewegt ihn genauso wie eine geänderte (Stolperstein 158).
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses als
  PFLICHT, wenn das Zusammenführen mitkommt** — es bewegt Zeilen unumkehrbar,
  und das wiegt schwerer als eine neue Tabelle. Kommt es nicht mit, sag
  ausdrücklich, dass es keine Datenbankstufe ist. **Neue Zeilen in der `.env`
  gibt es voraussichtlich nicht**; sag es ausdrücklich, statt es offenzulassen.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Darunter die drei, die diese Runde belegen:** nach
  einem Kommentartext suchen und den Eintrag finden; eine Ansicht speichern,
  abmelden, anmelden, Ansicht wählen; und einen Doppeleintrag anlegen, die Zeile
  „Ähnlich" sehen und die beiden zusammenführen.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg, Abschnitt 4, Abschnitt 5 um die
  Entscheidungen dieser Runde **und um die zurückgenommene Goldentscheidung aus
  Punkt 0**, Stolpersteine, Prüfstand samt den Portbasen aus Punkt 4,
  Versionsgeschichte, Abschnitt 10, Abschnitt 11). Der Projektstand
  trägt die Version im Dateinamen und wird umbenannt (`git mv` auf
  `Projektstand_Kriterion_0_11_0.md`); alle Verweise sind nachzuziehen.
* **Das Ideenpapier wird angefasst, und zwar genau an drei Stellen:** 3.1 und 4.6
  sind mit dieser Runde eingelöst und bekommen die Marke, die 4.1, 4.3, 4.4, 4.5
  und 5.2 schon tragen; **3.3 bekommt die berichtigten Zahlen oder den Vermerk,
  dass die alten überholt sind** (Punkt 0). Sonst nichts.
* **DAS KONZEPTPAPIER WIRD NICHT ANGEFASST UND NICHT UMBENANNT.** Es ist mit
  0.9.1 geschlossen. **Fällt dir beim Bauen etwas auf, das dort falsch wird, ist
  das ein Befund und gehört gemeldet**, nicht stillschweigend nachgezogen.
* Die README bekommt die Suche und die Ansichten: **wonach gesucht wird** (die
  sieben Quellen, ausdrücklich einschließlich der Kommentare), wie eine Ansicht
  gespeichert wird, und — falls es mitkommt — **was Zusammenführen bedeutet und
  dass es nicht rückgängig zu machen ist.**
* **`CHANGELOG.md` bekommt den Eintrag nach der Form von 0.10.0.** **Der Satz,
  der dort nicht fehlen darf:** die Suche findet ab dieser Version dasselbe wie
  vorher, sie fragt nur den Server statt den Browser — **oder, falls die
  Entscheidung anders ausfällt, genau worin sie sich unterscheidet.**
  **Und unter `Changed` die Marke**: neue Farbe, neue Höhe, zwei geänderte
  Dateien in `public/` — mit dem Hinweis auf den Reiter, der den alten Stand
  noch eine Weile zwischenspeichert.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.** Den
  weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber getestet
  ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser hier wird
  dabei entfernt** — es liegt immer nur einer im Repo.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **Der Schlüsselwechsel auf der echten Anlage** — geprobt, gefahren noch nicht.
  Er läuft über `./schluessel.sh wechseln` auf dem Wirt und **braucht keine Runde
  und keinen Auftrag**; das Ergebnis gehört in den Projektstand, Abschnitt 2.
* **Der QR-Encoder als eigene Runde.** Aus 0.10.0 herausgenommen, entschieden und
  nicht vergessen; die Maße stehen im Projektstand, Abschnitt 10 — die
  `otpauth://`-Zeile ist 100 bis 203 Zeichen lang, also Version 5 bis 8 im
  Bytemodus.
* **DER FAHRPLAN NACH DIESER RUNDE**, im Projektstand, Abschnitt 10:
  **0.11.x — Fehlerbereinigung und Verbesserungen**: die nächste freie
  PATCH-Zahl, so viele davon, wie es braucht.
  **0.12.0 — vermutlich Bereinigung von Code und Datenbankstruktur**: die
  Struktur wird als Grundlage festgeschrieben, Migrationscode fällt heraus,
  **ab dort gibt es keinen Rückweg auf ältere Fassungen.**
  **1.0.0 — die Zusage.** *Herausgeben lässt sich die Anlage mit jeder Nummer;
  1.0.0 ist nicht das Herausgehen, sondern der Punkt, ab dem die öffentliche
  Schnittstelle festliegt.*
* **Nachladen beim Scrollen** — Punkt 3 aus Ideenpapier 3.1, und erst dann, wenn
  Punkt 1 und 2 gemessen zu wenig gebracht haben. **Blättern mit Seitenzahlen
  nicht, nie.**
* **Eine Zeile in der Karte „Anlage", die die abweichende Datei beim Namen
  nennt.** Der Fingerprint sagt heute nur, DASS etwas abweicht. **Vorgemerkt für
  die Nacharbeitsrunde.**
* **Ein echter Teillauf im Prüfstand.** `pruefung.js` ist EIN Ablauf; der
  Namensfilter filtert die Ausgabe, nicht die Arbeit. `gegenprobe.js` und
  `PORT_VERSATZ` mildern das, sie beheben es nicht. **Und die Portbasen sind
  fast alle** — siehe Punkt 4.
* **Die zu großen Funktionen** — `renderSystem()` steht bei 2030 Zeilen,
  `renderDetail()` bei 1499. **Nicht als Vorhaben, sondern beim nächsten
  Anfassen je ein Block heraus** (Ideenpapier 3.3).
* **Ein Versanddienst über HTTPS**, falls SMTP am Anschluss nachweislich nicht
  durchkommt. Zweiter Weg im Code, ohne Bibliothek, mit `fetch`.
* **Ein Satz in die README: eine Anlage ist ein Sachgebiet** (Ideenpapier 4.8a).
  Vorgemerkt für 1.0, kostet einen Absatz.
* **Teil II des Videopapiers — große Dateien bis 2 GB.** Eine neue Funktion, also
  MINOR nach 1.0.0; die Nummer ergibt sich, wenn die Runde drankommt.
