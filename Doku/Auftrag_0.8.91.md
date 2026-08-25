Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Ideenpapier, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht
an einer Kopie.

AUFTRAG: **Version 0.8.91 — „Der Schlüssel lässt sich wechseln."**
DIES IST **KEINE** STUFE DES MEHRBENUTZERBETRIEBS. Der ist mit Stufe H
(0.8.80) bis auf **Stufe I** gebaut, und die bleibt bei 0.9.0. Diese Runde holt
nach, was aus 0.8.90 herausgefallen ist — **Punkt 3, der Schlüsselwechsel** —,
und sie holt ihn auf einer freien Nummer nach, weil er eine eigene Runde
verdient.

**EIN PUNKT, UND DAVOR EIN WERKZEUGPUNKT.** Das ist die ganze Runde, und die
Kürze ist Absicht: der Schlüsselwechsel ist **der einzige Knopf im ganzen
Projekt, der bei falscher Handhabung alles verliert**. Er bekommt keinen
Nachbarn.

WARUM DIESE RUNDE JETZT KOMMT: 0.8.90 („Schwere Eingriffe") ist gebaut und
eingespielt, Fingerprint `aeb336bf`, **2909 Prüfungen**, `F_ROUTEN` bei **57**,
Formatnummer **10**, **fünf** markierte Migrationsblöcke, Stolpersteine bis
**133**, siebzehn Karten im Systembereich, elf Vokabulareinträge, vierzehn
Vorgänge im Sicherheitsprotokoll. Die zweite Bestätigung steht bereit; sie
bekommt hier ihren **achten** Weg. Das Sicherheitsprotokoll bekommt seinen
**fünfzehnten** Vorgang.

WAS SICH ÄNDERT, IN EINEM SATZ: Der Eigentümer kann den Schlüssel der
Datenbank wechseln, ohne die Anlage neu aufzusetzen — und die Anlage sagt ihm
vorher, was er danach von Hand tun muss.

---

0. DAS WERKZEUG — ES KOMMT VOR DEN BAU, UND ES IST KEINE ANLAGE.

   **Die Runde 0.8.90 hat an einer Stelle sehr viel Zeit gekostet: den
   Gegenproben.** 24 Rückbauten, jeder ein VOLLSTÄNDIGER Prüflauf von vier bis
   sechs Minuten, zusammen knapp zwei Stunden — und einmal ganz von vorn, weil
   der Treiber defekt war. Die Wurzel ist bekannt und steht in `pruefung.js`
   selbst: *der Namensfilter filtert die AUSGABE, nicht die ARBEIT.*

   **Diese drei Stücke werden gebaut, BEVOR am Schlüssel etwas geschieht.** Sie
   fassen **keine ausgelieferte Datei** an — der Fingerprint bewegt sich nicht,
   `F_ROUTEN` bewegt sich nicht, das Schema bewegt sich nicht.

   * **W1 — `gegenprobe.js`, ein Treiber im Repo.** Er kennt eine Liste von
     Rückbauten (Name, betroffene Datei, gesuchter Text, Ersatz, Prüfgruppe),
     fährt jeden in einer eigenen Kopie und schreibt **eine** Tabelle: welcher
     Rückbau welche Prüfungen **namentlich** rot gemacht hat.
     **Die Kopie entsteht über `git archive HEAD`** und nicht über `cp` — sie
     ist damit atomar gegen den Arbeitsbaum (Stolperstein 100).
     **Aufgeräumt wird über `/proc/<pid>/cwd`** und nicht über die
     Befehlszeile: ein mit `cwd` gestarteter Kindprozess trägt den Pfad dort
     gar nicht (**Stolperstein 133** — genau daran ist 0.8.90 gescheitert).
     **Ein Rückbau, der KEINE Prüfung rot macht, ist ein FUND und wird als
     solcher gemeldet** — nicht als Erfolg. In 0.8.90 waren zwei davon dabei,
     und beide haben eine Lücke im Prüfstand aufgedeckt.
   * **W2 — `PORT_VERSATZ`.** Eine Umgebungsvariable, die `pruefung.js` auf
     **jede** Portbasis addiert. Heute liegen **29 Basen** zwischen 4000 und
     5959. Mit einem Versatz je Nebenspur kann der Treiber mehrere Rückbauten
     nebeneinander fahren.
     **DIE ZAHL WIRD AUSGERECHNET, NICHT GESCHÄTZT** (Stolperstein 127 und 64):
     der Versatz muss größer sein als die Spanne aller Basen, und keine
     entstehende Nummer darf auf der Sperrliste von `fetch()` liegen (6000,
     6665–6669, 6697). **Ein Wächter im Prüfstand rechnet das nach** und wird
     rot, wenn eine Basis oder ein Versatz das verletzt.
   * **W3 — ein Wächter über die eigenen Prüflagen.** `starteWeiterenServer`
     merkt sich jedes Kind; am Ende des Laufs prüft der Prüfstand, dass **alle**
     beendet sind. In 0.8.90 haben zwei neue Lagen ihre Server zurückgelassen,
     und aufgefallen ist es erst an einer abgerissenen Gegenprobe.

   **DREI FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Wo stehen die Rückbauten?** In `gegenprobe.js` selbst, oder in einer
     eigenen Datei daneben? *Ich neige zu: in `gegenprobe.js`, als eine Liste
     ganz oben* — dieselbe Bauform wie `F_ROUTEN`: die Liste IST die
     Entscheidung, und sie steht dort, wo man sie sucht.
   * **Wie viele Nebenspuren?** *Ich neige zu höchstens vier* und dazu, die
     Zahl als Argument zu nehmen. Mehr Spuren heißen mehr gleichzeitige Server,
     und der Rechner hat nicht beliebig viele Kerne.
   * **Läuft `gegenprobe.js` in `npm test` mit?** *Ich neige zu nein* — er
     dauert länger als der Prüflauf selbst und gehört an das Ende einer Runde,
     nicht an jeden Lauf. Ein eigener Aufruf, und der Prüfstand kennt ihn
     nicht.

   **W1 bis W3 dürfen fallen, wenn die Runde zu breit wird** — aber dann sag es
   vorher. Sie sind der Grund, warum diese Runde überhaupt Platz für viele
   Gegenproben hat.

---

1. DER SCHLÜSSELWECHSEL — DER SCHWERSTE EINGRIFF, UND DER EINZIGE, DER ALLES
   VERLIEREN KANN.

   **VIER DINGE SIND SCHON NACHGESTELLT UND MÜSSEN NICHT NOCH EINMAL GEMESSEN
   WERDEN.** Sie stehen im Änderungsprotokoll 0.8.90, Abschnitt 4 A, und sie
   sind die Grundlage dieser Runde:

   | | |
   |---|---|
   | `PRAGMA rekey` im **WAL-Modus** | **läuft NICHT** — *„Rekeying is not supported in WAL journal mode."* Stolperstein 128 |
   | Mit `journal_mode = DELETE` davor | läuft durch; danach wieder auf `WAL`. An 20 000 und 200 000 Zeilen nachgestellt, `integrity_check` `ok`, Bestand feldgleich |
   | **Abbruch mittendrin** (`kill -9`) | **folgenlos**: das Rollback-Journal stellt den alten Stand her, der **alte** Schlüssel öffnet, der neue wird abgewiesen. **Kein halber Zustand** |
   | **Journal verloren** | **alles verloren** (`database disk image is malformed`) — *das* ist der Grund für die Sicherung davor, nicht der Abbruch selbst |
   | Dauer | rund **20 ms je MB** (5189 ms für 261 MB) — genau `SICHERUNG_MS_JE_MB` |
   | Platzbedarf | das Journal wächst auf **die Größe der Datenbank** |

   **DIE EIGENTLICHE SCHWIERIGKEIT STEHT IN `keys.js`, UND SIE IST NICHT
   TECHNISCH.** `loadKey()` liefert `{ hex, fromEnv }` — die Anlage **weiß**,
   woher ihr Schlüssel kommt. Daran hängt alles:

   * **Kam er aus `data/encryption.key`**, kann die Anlage den Wechsel
     **vollständig zu Ende führen**: neue Datei schreiben, fertig.
   * **Kam er aus der `.env`**, kann sie es **nicht**. Sie kennt den neuen
     Wert, aber die `.env` liegt außerhalb ihrer Reichweite — sie ist per
     `.dockerignore` nicht einmal im Image. **Ab dem Augenblick, in dem der
     Wechsel gelingt, ist die `.env` falsch**, und der nächste
     `docker compose up -d --build` öffnet die Datenbank nicht mehr.

   **UND EINE STELLE, DIE DAS VERSCHÄRFT:** `GET /api/stats` liefert heute
   `keyHex: (keyFromEnv || !istEigentuemer(req)) ? null : keyHex`. Im
   `.env`-Fall zeigt die Anlage also **gar keinen Schlüssel** — mit der
   Begründung, die dort im Quelltext steht: *„Kommt er aus der Umgebung, gibt
   es nichts abzuschreiben."* Nach einem Wechsel gibt es sehr wohl etwas
   abzuschreiben. **Das ist die Stelle, an der diese Runde eine Entscheidung
   treffen muss.**

   **ACHT FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Was tut die Anlage im `.env`-Fall?** Drei Möglichkeiten: **abweisen**
     („Schlüsselwechsel geht nur, wenn der Schlüssel neben der Datenbank
     liegt"), **tun und den neuen Wert zum Abschreiben hinlegen**, oder **tun
     und vorher ein Häkchen verlangen** („Ich habe verstanden, dass ich die
     `.env` sofort nachziehen muss").
     *Ich neige zum dritten — und zu einem Nachtrag, den 0.8.90 vorgeschlagen
     hat:* der neue Wert bleibt **bis zum nächsten Neustart** über
     `GET /api/stats` abrufbar, nur für den Eigentümer, mit rotem Kasten
     daneben. Geht das Fenster zu, bevor jemand kopiert hat, wären die Daten
     sonst beim nächsten `up -d` verloren. Der Wert verschwindet mit dem
     Neustart — also genau dann, wenn die Aussage aufhört zu stimmen.
     **Wer abweist, macht den Wechsel genau dort unmöglich, wo die Anlage
     RICHTIG eingerichtet ist; das wäre eine Strafe für den sicheren Zustand.**
   * **Woher kommt der neue Wert?** *Ich neige zu: die Anlage erzeugt ihn,
     `crypto.randomBytes(32)`, wie `loadKey()` es tut.* Ein von Hand
     eingegebener Schlüssel wäre die eine Stelle, an der ein schwacher Wert
     hereinkäme, und es gibt keinen Grund, einen zu wählen. Widersprich, wenn
     du einen siehst.
   * **Was ist mit den Sicherungen, die schon dastehen?** Sie sind mit dem
     **alten** Schlüssel verschlüsselt und bleiben es. **Ab dem Wechsel gibt es
     zwei Schlüssel im Umlauf.** *Ich neige zu drei Dingen zusammen:* eine
     Marke `schluesselGewechseltAm` in `settings` (kein Schema — `settings`
     gibt es), die Karte „Sicherung" markiert **jede Kopie, die älter ist,
     rot**, und die Wechselkarte nennt **vorher** die letzte Sicherung samt
     Alter. **Das ist die unangenehmste Falle der ganzen Runde** — sag, ob das
     reicht.
   * **Steht die Anlage dabei still, und fallen die Sitzungen?** *Ich neige zu:
     ja zum Stillstand, mit Ansage in Sekunden aus dem gemessenen Wert (20 ms
     je MB) — und nein zu den Sitzungen.* Ein Schlüsselwechsel ändert am
     Passwort nichts; es gibt keinen Grund, irgendjemanden abzumelden.
   * **Was, wenn zu wenig Platz frei ist?** Das Journal wächst auf die Größe
     der Datenbank. *Ich neige zu: vorher prüfen und mit Begründung absagen,
     statt es zu versuchen* — dieselbe Form wie beim Sicherungsort.
   * **Gehört der Wechsel hinter die zweite Bestätigung?** *Ich neige zu ja* —
     er ist der **achte** Weg und bekommt keine neue Form, sondern die
     vorhandene: `POST /api/bestaetigung` mit einem neuen Zweck, dann die
     Handlung. Widersprich, wenn du meinst, hier gehöre etwas Schärferes hin.
   * **Was steht in der Protokollzeile?** *Ich neige zu: `schluessel` als
     fünfzehnter Vorgang, ohne Merkmal.* **Eine Protokollzeile nennt, DASS
     gewechselt wurde, nie WOHIN.** Der Merksatz aus Abschnitt 8 des
     Projektstands gilt hier schärfer als je zuvor: *Kontrollausgaben laufen
     über die Länge und das letzte Zeichen, nie über den Inhalt.* Er gilt für
     Protokollzeilen und Prüfausgaben — **nicht** für die eine Stelle am
     Bildschirm, die zum Abschreiben da ist. **Halte beides auseinander.**
   * **Bekommt `zugang.js` einen Befehl `schluessel`?** Die Frage ist neu und
     gehört gestellt: auf dem Wirt liegt die `.env`, dort ließe sich der
     Wechsel **vollständig** zu Ende führen — Datei und `.env` in einem Zug.
     *Ich neige trotzdem zu nein, jedenfalls in dieser Runde:* `zugang.js` hat
     bisher **keine** Datei außerhalb der Datenbank angefasst, und die `.env`
     zu schreiben wäre ein neuer Charakter. Widersprich, wenn du das anders
     siehst — aber dann gehört auch beantwortet, was passiert, wenn die `.env`
     gar nicht da ist, wo der Befehl sie vermutet.

---

2. WAS DIESE RUNDE AUSDRÜCKLICH NICHT TUT.

   * **Kein Mailversand, keine Selbstanmeldung.** Beides ist Stufe I und bleibt
     bei 0.9.0.
   * **Das Verschlüsselungs*modell* bleibt.** Gewechselt wird der Schlüssel,
     nicht das Verfahren. `cipher='sqlcipher'` bleibt, die Schlüssellänge
     bleibt, `katalog.sqlite` bleibt.
   * **Kein zweiter Faktor.** TOTP ist 0.9.10.
   * **Die Formatnummer bleibt bei 10.** Der Schlüssel steht nicht im
     Austauschformat. **Sag es ausdrücklich**, damit klar ist, dass die Frage
     gestellt wurde.
   * **Keine neue Abhängigkeit.** `PRAGMA rekey` kann die Bibliothek, die schon
     da ist.
   * **Kein neuer Eintrag im Vokabular. Die elf bleiben elf.**
   * **Der Papierkorb, die Token und die zweite Bestätigung werden nicht
     umgebaut** — die Bestätigung bekommt einen achten Zweck, mehr nicht.
   * **Nicht anfassen ohne Rückfrage:** Farbschema, Anmeldebremse in ihren
     Kennwerten, Dateiname `katalog.sqlite`, `HINTER_PROXY`,
     `OEFFENTLICHE_ADRESSE`, die Content-Security-Policy, die Sortierung der
     Übersicht, das Austauschformat, der Papierkorb, die Sicherung **als
     Vorgang** (ihre Karte bekommt nur die rote Markierung aus Punkt 1) und die
     Token-Hälfte aus 0.8.80.
   * **`F_ROUTEN` wächst um EINS: 57 → 58.** Nenn die neue Route mit ihrer Art
     und die neue Zahl. Eine neue **Art** braucht es nicht — `'nurEigentuemer,
     zweitbestaetigt'` gibt es seit 0.8.90.
   * **Es bleibt bei FÜNF markierten Migrationsblöcken.** Diese Runde bringt
     **keine** neue Tabelle und **keine** neue Spalte. `schluesselGewechseltAm`
     ist eine Zeile in `settings`, kein Schema. **Sag es ausdrücklich.**

---

LESEWEGE — WAS DU LIEST UND WAS AUSDRÜCKLICH NICHT:

* **Ganz lesen:** diesen Auftrag; `keys.js` (50 Zeilen, und er ist die Datei
  dieser Runde); im **Änderungsprotokoll 0.8.90** den **Abschnitt 4** (die
  Befunde, darunter die vier Messungen zum `rekey`).
* **Abschnittsweise, über die Überschriften angesteuert:** Projektstand
  Abschnitt 2 (Betriebsstand und Einspielweg), **Abschnitt 3** (Zugang und
  Verschlüsselung — für diese Runde der wichtigste), 4 (die Karten
  „Kennzahlen" und „Sicherung"), 5 (Entscheidungen), 6 (**Stolpersteine 8, 60,
  81, 100, 103, 106, 119, 120, 122, 124, 126, 127 und 128 bis 133**),
  7 (Prüfstand), 8 (der Merksatz zu Kontrollausgaben), 10 (Stufenplan),
  12 (Arbeitsweise samt Sprachregel).
* **Gezielt greppen, nie am Stück lesen:** `pruefung.js` (18 900 Zeilen). Was
  du brauchst, findest du über `gruppe('…')`, über `F_ROUTEN`, über
  `starteWeiterenServer` und über `baueDom`.
* **Nicht lesen, solange keine bestimmte Frage dorthin führt:** die
  Änderungsprotokolle `0.8.6` bis `0.8.80`, das Videopapier, das
  Ideenpapier und das Konzeptpapier — **diese Runde berührt keines davon.**
  `0.8.90` ist die eine Ausnahme, siehe oben.
* **Der Quelltext, den es wirklich braucht:** `keys.js` ganz, `db.js` (`open()`
  und die Stelle, an der `journal_mode` gesetzt wird), `server.js`
  (`GET /api/stats`, die Sicherungskarte samt `pruefeOrt` und
  `SICHERUNG_MS_JE_MB`, die zweite Bestätigung), `auth.js` (`VORGAENGE`,
  `protokolliere`, `BESTAETIGUNG_ZWECKE`), `public/app.js` (die Karten
  „Kennzahlen" und „Sicherung").

---

VORGEHEN — in dieser Reihenfolge:

1. Lies nach den **Lesewegen** oben. Nicht mehr, und vor allem nicht am Stück.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst.
3. **Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen.** Die Fragen aus Punkt 0 und Punkt 1 gehören hierher, nicht in
   den Bau. **Unstimmigkeiten zwischen Projektstand und Quelltext sagst du
   jetzt.**
4. Erst nach meinem OK bauen — **W1 bis W3 zuerst**, dann der Schlüsselwechsel.
   Gezielte Änderungen, keine Neuerzeugung ganzer Dateien.
5. Neue Prüfungen in `pruefung.js`. **Was mindestens hineingehört**, und die
   Liste ist keine Obergrenze:
   * **der Rundlauf:** Bestand anlegen, wechseln, mit dem **neuen** Schlüssel
     lesen, mit dem **alten** nicht mehr — und der Bestand ist **Feld für
     Feld** derselbe, samt `integrity_check`;
   * **die Umschaltung des Journals**, in beide Richtungen: vorher WAL,
     währenddessen DELETE, danach wieder WAL — und ein Wechsel **ohne** die
     Umschaltung wird namentlich rot;
   * **der `.env`-Fall und der Dateifall GETRENNT**, denn sie enden
     verschieden;
   * **der Abbruch:** `kill -9` mitten hinein, danach öffnet der **alte**
     Schlüssel, der neue nicht;
   * **zu wenig Platz:** die Absage kommt, und die Datei ist unangetastet;
   * **die alten Sicherungen:** die Marke steht, und die Karte markiert jede
     ältere Kopie rot — in **beiden** Lagen (vor und nach dem Wechsel);
   * **der Schlüssel steht in KEINER Protokollzeile**, geprüft am
     vollständigen Zeileninhalt über **alle** Spalten **aller** Zeilen — weder
     der alte noch der neue;
   * **und in keiner Kontrollausgabe:** was der Start und der Wechsel ins
     Containerprotokoll schreiben, wird angesehen;
   * **die zweite Bestätigung am achten Weg**, in beide Richtungen, mit der
     Nachschau, dass nach einer Verweigerung **nichts** gewechselt wurde;
   * **`F_ROUTEN` trägt die neue Route mit ihrer Art**, und die **Zahl** wird
     ausdrücklich geprüft;
   * **die Karte am Bildschirm:** Häkchen erzwungen, Dauer angesagt, Wert
     einmalig gezeigt, Abbruch **und** Bestätigung gestellt;
   * **der Wächter aus W2** rechnet die Portversätze nach;
   * **der Wächter aus W3** hält fest, dass keine Prüflage ihren Server
     zurücklässt;
   * **der Sprachwächter bleibt grün** — und er sieht auch die Papiere dieser
     Runde an.
6. **Kein Migrationsabschnitt im Prüfstand** — es gibt keinen Block. **Sag es
   ausdrücklich**, damit klar ist, dass die Frage gestellt wurde.
7. **Die Gegenproben laufen über `gegenprobe.js`** und liefern **eine**
   Tabelle. **Nenn im Vorschlag, welche Rückbauten du fahren willst** — ich
   erwarte mindestens: die Journalumschaltung, der `.env`-Fall, die
   Platzprüfung, die Marke an den Sicherungen, die zweite Bestätigung am achten
   Weg, die Protokollzeile, und **je einer für W2 und W3**.
   **Ein Rückbau, der nichts rot macht, wird gemeldet und untersucht** — in
   0.8.90 waren zwei davon dabei, und beide haben eine Lücke gefunden.
8. **DREI PRÜFLÄUFE, NICHT ZEHN:** einer nach dem Bau, einer nach den neuen
   Prüfungen, einer zum Schluss gegen genau den Stand, der geschoben wird.
9. **KEINE HILFSDATEIEN IM ARBEITSBAUM.** Was du zum Messen brauchst, läuft
   über `node -e` oder liegt außerhalb des Repos. In 0.8.90 haben drei
   kurzlebige Hilfsdateien eine falsche Fährte gelegt.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.**
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens.
  Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.8.91` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`).
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
* **Keine neue Abhängigkeit. Nicht eine.**
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106) — Ausnahme bleibt der Sprachwächter.
* **Zu jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine
  Prüfung an der echten Antwort** (Stolperstein 102).
* **Wird es zu viel für einen Durchgang: Haltepunkt nach Punkt 0.** Dann steht
  das Werkzeug, und der Schlüsselwechsel folgt auf 0.8.92. Sag vorher Bescheid,
  wenn du den Haltepunkt kommen siehst.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde steht
  die Antwort schon da:** keine neue Tabelle, keine neue Spalte, also kein
  Block. `schluesselGewechseltAm` ist eine Zeile in `settings`.
* Das Schema bleibt vollständige DDL in `db.js`.
* Einmaliger Migrationscode stünde gebündelt in `migration0891()` mit der Marke
  `// MIGRATION 0.8.x — ENTFAELLT MIT 1.0`. **Er wird nicht gebraucht — und
  wenn du meinst, doch, ist das ein Grund anzuhalten und zu fragen, kein Grund,
  ihn einzubauen.**

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.91.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, neue Stolpersteine (**die Zählung setzt
  bei 134 fort** — 128 bis 133 sind vergeben), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (vorher: **2909**),
  Offengebliebenes.
* Die Zeile „0.8.91 — Fingerprint `…`" gehört ins Änderungsprotokoll, ZULETZT
  gebildet, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen. Diese Runde fasst
  voraussichtlich `keys.js`, `db.js`, `auth.js`, `server.js` und
  `public/app.js` an; `anhaenge.js` und `zugang.js` bleiben unberührt.
  **`gegenprobe.js` und `pruefung.js` stehen NICHT im Fingerprint** — der
  Server lädt sie nicht und liefert sie nicht aus.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  wieder als PFLICHT — und diesmal doppelt:** wer den Schlüssel wechselt,
  braucht die Sicherung **davor**, und die `.env` dazu. Der Weg gehört in den
  Chat, mit den Befehlen und dem erwarteten Ergebnis.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Der Schlüsselwechsel wird auf dem Server NICHT
  nebenbei ausprobiert** — dafür eine Wegwerfanlage, und der Befehl dazu gehört
  mit in den Chat.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg, **Abschnitt 3**, Funktionsumfang,
  Abschnitt 5 um die Entscheidungen dieser Runde, Stolpersteine, Prüfstand,
  Versionsgeschichte, Stufenplan). **Das Konzeptpapier bleibt unberührt** —
  diese Runde ist keine Stufe und berührt keine seiner Regeln; **sag es
  ausdrücklich**, statt es stillschweigend zu übergehen. Dazu die README (der
  Schlüsselwechsel, die zwei Schlüssel im Umlauf, die Sicherungen davor).
  Der Projektstand trägt die Version im Dateinamen und wird umbenannt
  (`git mv`); alle Verweise sind nachzuziehen.
* **`Doku/Changelog.md` bekommt einen Abschnitt für diese Runde** — drei Blöcke
  wie bei den vorhandenen Einträgen. **Der Schlüsselwechsel gehört dort
  besonders vorsichtig beschrieben:** er ist der einzige Knopf im ganzen
  Projekt, der bei falscher Handhabung alles verliert. Wer ihn drückt, muss
  vorher wissen, was er danach von Hand tun muss.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Stufe.**
  Den weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber
  getestet ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **der
  Auftrag der Vorrunde wird dabei entfernt** — es liegt immer nur einer im
  Repo.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **0.9.0 — Stufe I, Mailversand und Selbstanmeldung.** Die letzte offene Stufe
  des Mehrbenutzerbetriebs. **0.8.90 hat ihr an drei Stellen vorgearbeitet:**
  die öffentliche Adresse ist gebaut und wird dort **Pflicht**; das
  Sicherheitsprotokoll bekommt mit „Registrierung angefragt" und
  „freigeschaltet" seine nächsten Vorgänge; und die zweite Bestätigung
  entscheidet mit, ob die Mail-Zugangsdaten hinter dieselbe Schranke gehören
  wie der Schlüssel. **Der Sprung auf 0.9.0 ist der größte im ganzen Plan** —
  ab dort baut die Anlage von sich aus eine Verbindung nach außen auf.
* **0.9.10 — Zwei-Faktor.** TOTP und Wiederherstellungscodes. Die zweite
  Bestätigung aus 0.8.90 ist die Stelle, an der er später zusätzlich gefragt
  würde.
* **Ein echter Teillauf im Prüfstand.** `pruefung.js` ist EIN Ablauf; der
  Namensfilter filtert die Ausgabe, nicht die Arbeit. W1 und W2 mildern das,
  sie beheben es nicht. Wenn die Datei weiter wächst, gehört das in eine eigene
  Runde — und es ist ein Umbau, kein Nachtrag.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird bei jedem
  Seitenaufbau gebraucht.
* **Teil II des Videopapiers — große Dateien bis 2 GB**, beschlossen für 1.1.0.
