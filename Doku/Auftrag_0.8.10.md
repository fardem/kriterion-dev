Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, das Ideenpapier und das Änderungsprotokoll 0.8.6
stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an einer Kopie.

AUFTRAG: „Werkzeug", auf Version 0.8.10.
KEINE STUFE DES UMBAUS — die erste Runde des neuen Stufenplans (Projektstand,
Abschnitt 10). Fünf Punkte. Kein Schema, kein Umstiegscode, keine neue
schreibende Route. `F_ROUTEN` bleibt bei 46.

WARUM DIESE RUNDE ZUERST KOMMT, steht im Stufenplan und bindet: ohne
festgenagelte Abhängigkeiten ist jeder Bau ein anderer, und ohne Prüflauf bei
jedem Push läuft der Prüfstand nur, wenn jemand daran denkt. Beides sichert
alles Folgende ab. NICHTS AN DIESER RUNDE IST FÜR DEN BENUTZER SICHTBAR —
bis auf eine Zeile im Systembereich.

Fünf Dinge, in dieser Reihenfolge:

1. DER BAU WIRD WIEDERHOLBAR. `package-lock.json` liegt nicht im Repo — nicht
   ausgeschlossen, nur nie eingecheckt. Damit löst jeder Bau `^11.5.0`,
   `^4.21.0`, `^2.0.1` und `^0.33.5` neu auf: zwei Leute, die dasselbe ZIP
   bauen, bekommen verschiedene Abhängigkeitsbäume, und derselbe Mensch nach
   drei Monaten einen anderen als heute. DER EIGENE CODE IST AUF DIE ZEILE
   GENAU KONTROLLIERT, DIE PAKETE DARUNTER SIND ES NICHT.

   Die Datei wird eingecheckt, und der `Dockerfile` bekommt sie zu sehen:

       COPY package.json package-lock.json ./
       RUN npm ci --omit=dev

   `npm ci` STATT `npm install` IST DER EIGENTLICHE PUNKT. Ohne den Wechsel
   liegt die Datei im Repo und wird beim Bauen ignoriert — das wäre ein
   Merker, der nichts bewirkt.

   Prüf mit, dass `package-lock.json` nicht in `.dockerignore` steht (heute
   nicht, aber es entscheidet darüber, ob `npm ci` überhaupt etwas findet),
   und BAU DAS ABBILD EINMAL WIRKLICH — `npm ci` bricht ab, wo `npm install`
   nachgäbe. Ein Prüflauf belegt das nicht.

2. `sharp` HOCHZIEHEN. Für `sharp` unter 0.35 meldet `npm audit` geerbte
   Lücken aus libvips mit dem Schweregrad „high". `sharp` verarbeitet JEDES
   hochgeladene Bild — Fotos wie Kommentarbilder — und ist damit die Stelle
   mit dem größten Verhältnis von Angriffsfläche zu Vertrauen: sie bekommt
   fremde Bytes und liest sie in C.

   ERST NACHSEHEN, DANN GLAUBEN: sag mir, was `npm audit` heute wirklich
   meldet und welche Version tatsächlich verfügbar ist. Der Sprung ist als
   Bruch gekennzeichnet; benutzt werden `resize`, `rotate`, `jpeg` und
   `metadata`. Der Prüfstand deckt die Bildwege ab, die Prüfung dafür gibt es
   also schon — sie ist der Beleg, nicht meine Erwartung.

   IN DERSELBEN FRAGE MIT ZU KLÄREN: `node:20-bookworm-slim` steht im
   `Dockerfile`, geprüft wird hier gegen Node 22. Nach dem veröffentlichten
   Zeitplan ist Node 20 seit April 2026 ohne Pflege. Sieh nach, ob das
   stimmt, und sag mir, was du vorschlägst — HOCHZIEHEN HEISST, DASS
   `better-sqlite3-multiple-ciphers` DORT ÜBERSETZT WERDEN MUSS, und das ist
   der riskanteste Teil der ganzen Runde. Zwei Zahlen (Abbild und Prüflauf)
   gehören danach zusammen.

3. EIN VERSIONSNACHWEIS, DER WIRKLICH TRÄGT. Die Versionsnummer kommt aus
   `package.json` und sagt NICHTS über die übrigen Dateien: wurden
   `package.json` und `server.js` ersetzt, `public/app.js` aber nicht, zeigt
   die Fußzeile die neue Version, während die Oberfläche sich alt verhält.
   Der heutige Ausweg — eine Textstelle je Version, von Hand gesucht und in
   die Dokumente geschrieben — ist eine Notlösung mit zwei Wahrheiten über
   dieselbe Sache.

   Der Server bildet beim Start einen kurzen Abdruck (SHA-256, acht Zeichen)
   über die Dateien, DIE ER WIRKLICH AUSLIEFERT.

   DIE LISTE WIRD ABGELEITET, NICHT GEPFLEGT — eine Ableitung beim Lesen ist
   besser als eine zweite Liste, die auseinanderläuft. Vorschlag: alle `.js`
   im Wurzelverzeichnis plus alles unter `public/`, nach Namen sortiert.
   Sag mir, wenn du es anders schneiden willst.

   DIE FALLE STEHT SCHON FEST, und sie ist der Grund, warum das kein
   Dreizeiler ist: `pruefung.js` und `Doku/` liegen im Repo, aber NICHT im
   Abbild (`.dockerignore`). Ein Abdruck, der sie mitzählt, ist im Container
   ein anderer als auf der Platte — und damit wertlos. Was nicht ausgeliefert
   wird, gehört nicht hinein. Dazu gehört eine Prüfung, nicht nur ein
   Kommentar.

   SAG MIR VOR DEM BAUEN, WO DER ABDRUCK STEHT. Zwei Wege, und sie sind
   nicht gleichwertig:

   * `GET /api/stats`, hinter `nurAdmin` — er ist dieselbe Art Aussage wie
     die Kennzahlen: eine über die ANLAGE ALS GANZES. Die Karte „Kennzahlen"
     zeigt ihn. Nachprüfen kostet dann eine Anmeldung im Befehl.
   * `GET /api/config`, neben der Versionsnummer — nachprüfen ohne Anmeldung,
     eine Zeile. ABER: die Liste dort ist AUSDRÜCKLICH ABGESCHLOSSEN, mit
     Kommentar und mit der Prüfung „Vor der Anmeldung wird sonst nichts
     verraten", die den Schlüsselsatz Zeichen für Zeichen vergleicht. Wer
     dort etwas hinzufügt, dreht diese Prüfung UM UND SCHREIBT DEN KOMMENTAR
     NEU — löschen gilt nicht (Stolperstein 74).

   Ich neige zum ersten. Sag mir, was du für richtig hältst, und begründe es.

   Die Fußzeile bleibt bei der blanken Versionsnummer: eine Zahl, die auf
   jedem Bildschirm steht und die niemand liest, ist keine Auskunft.

Haltepunkt: nach Punkt 3.

4. DER PRÜFSTAND LÄSST SICH IN TEILEN AUFRUFEN. 8.700 Zeilen, ein Durchlauf,
   alles oder nichts. `node pruefung.js Rechte` soll nur zeigen, was in
   Gruppen mit „Rechte" im Namen steht.

   HIER STIMMT DIE BEGRÜNDUNG DES IDEENPAPIERS NICHT, und ich sage es
   vorher: die Datei ist EIN langer Ablauf, in dem die Prüflagen
   aufeinander aufbauen — Server werden einmal gestartet, Bestände
   nacheinander erzeugt. Ein Namensfilter kann deshalb die AUSGABE
   einschränken, nicht die ARBEIT. Wer wartet, wartet weiter. Der Gewinn ist
   trotzdem echt, nur ein anderer: beim Deuten roter Punkte verschwindet das
   Rauschen. BAU ES ALS DAS, WAS ES IST, und schreib die Begründung so hin —
   oder sag mir, dass es den Aufwand nicht wert ist.

   EINE REGEL GEHÖRT DAZU, sonst wird daraus eine Falle: EIN GEFILTERTER LAUF
   SAGT AM ENDE AUSDRÜCKLICH, DASS ER GEFILTERT WAR, und wie viele Gruppen er
   übersprungen hat. Sonst liest sich „alles in Ordnung" nach einem Teillauf
   wie ein vollständiger Beleg — genau die Sorte stiller Fehlschluss, gegen
   die Stolperstein 81 anschreibt. Der Rückgabewert eines gefilterten Laufs
   ist ebenfalls zu bedenken.

   AUFTEILEN IN MEHRERE DATEIEN AUSDRÜCKLICH NICHT: die gemeinsame Umgebung
   — Serverstart, Kekse, Doppelgänger — ist der Wert dieser Datei.

5. DER PRÜFLAUF BEI JEDEM PUSH. Es gibt kein `.github/`. Der Prüfstand ist
   außergewöhnlich gut und läuft nur, wenn jemand daran denkt.

   Eine Datei, `.github/workflows/pruefstand.yml`: bei `push` und
   `pull_request`, `npm ci`, `npm test`, dazu `npm audit --audit-level=high`.
   Die Node-Version ist DIE AUS DEM ABBILD, nicht die zufällig neueste —
   siehe Punkt 2.

   ZWEI DINGE, DIE ICH VORHER WISSEN WILL:
   * Das Repo ist PRIVAT. Für private Repos sind die Minuten bei GitHub
     Actions gedeckelt, nicht frei. Sieh nach, was der Tarif hergibt, und
     sag mir die Zahl — ein Prüflauf, der mitten im Monat stehenbleibt, ist
     schlechter als keiner, weil man sich auf ihn verlässt.
   * `npm audit --audit-level=high` macht den Lauf ROT, solange Punkt 2 nicht
     erledigt ist. Das ist gewollt und die Reihenfolge steht deshalb so da.
     Bleibt nach Punkt 2 etwas übrig, gehört es GEMELDET, nicht durch ein
     Herabsetzen der Schwelle weggeräumt.

Die Reihenfolge ist nicht beliebig. Punkte 1 bis 3 gehen auf den Server:
wiederholbarer Bau, geschlossene Lücke, ein Nachweis, der trägt. Punkte 4 und
5 sind Werkzeug am Rand und ändern an der ausgelieferten Anwendung nichts.
Deshalb liegt der Haltepunkt dazwischen: bleibt die Zeit knapp, ist die Runde
inhaltlich trotzdem fertig.

Zu beachten: KEIN Punkt fasst das Schema an. Kommt dir doch einer in die
Quere, gilt die Bauregel, und du sagst es vorher. Es entsteht KEINE neue
schreibende Route, `F_ROUTEN` bleibt bei 46. Punkt 3 ist der einzige Eingriff
in den Anwendungscode; die Punkte 1, 2 und 5 fassen nur den Bau an, Punkt 4
nur den Prüfstand.

DREI DINGE, DIE BEIM LESEN SCHON AUFGEFALLEN SIND — sie ersetzen Schritt 3
des Vorgehens nicht, sie sparen nur eine Runde:

* `.dockerignore` schließt `pruefung.js` und `Doku` aus, `package-lock.json`
  nicht. Für Punkt 1 ist das richtig, für Punkt 3 ist es die Falle.
* Der `Dockerfile` ist ZWEISTUFIG. `COPY package.json ./` steht in der
  Bauphase, `COPY . .` unmittelbar danach — die Laufzeitstufe holt sich
  alles über `COPY --from=builder`. Der Wechsel auf `npm ci` gehört an die
  erste Stelle, und die zweite bringt die Sperrdatei ohnehin mit.
* Der Prüfstand hat bereits eine gepflegte Dateiliste (`GEPRUEFT` im Wächter
  auf den alten Namen). SIE IST NICHT DIE LISTE FÜR DEN ABDRUCK: dort stehen
  `docker-compose.yml`, `Dockerfile` und `.env.example`, die der Server nie
  ausliefert. Zwei Listen, die beide „die Dateien" heißen, laufen auseinander
  — das ist der Grund für die Ableitung in Punkt 3.

Auflage aus Stolperstein 74: wird ein Endpunkt erweitert oder eingeschränkt,
sind die Prüfungen der Vorgängerversion die ersten Betroffenen. Hier
namentlich „Vor der Anmeldung wird sonst nichts verraten", falls der Abdruck
nach `/api/config` geht, und „Die Kennzahlen nennen sie ebenfalls", falls er
nach `/api/stats` geht. UMDREHEN ODER UMHÄNGEN, NICHT LÖSCHEN. In 0.8.3 bis
0.8.6 ist das je zweimal vorgekommen und hat funktioniert.

Für die Oberflächenprüfungen steht die Prüflage bereit: `baueDom()` antwortet
auf `/api/config` und `/api/stats`. WANDERT DER ABDRUCK IN EINE DIESER
ANTWORTEN, MUSS DER DOPPELGÄNGER IHN KENNEN — antwortet er ohne ihn, zeichnet
die Karte nichts, und jede Prüfung darauf wäre blind (Stolperstein 90).

Entschieden und NICHT zu bauen, nur ins Papier: den Prüfstand in mehrere
Dateien zu zerlegen (siehe Punkt 4), und `npm audit` in den Server einzubauen
— das ist Betrieb, nicht Anwendung.


VORGEHEN — in dieser Reihenfolge:

1. Lies den Projektstand (besonders Abschnitt 10 mit dem Stufenplan,
   Abschnitt 5, Abschnitt 6 Stolpersteine, Abschnitt 11), dazu in
   `Ideen_und_Vorschlaege.md` die Abschnitte 2.5, 5.1, 5.4 und 5.5 — dort
   stehen die Messwerte und die Befunde, die zu dieser Runde geführt haben.
2. Sieh dir die betroffenen Dateien im Repo an, bevor du etwas vorschlägst:
   `Dockerfile`, `.dockerignore`, `package.json`, den Kopf von `server.js`
   und den Prüfrahmen am Anfang von `pruefung.js`.
3. Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen. Unstimmigkeiten zwischen Papier und Quelltext sagst du jetzt.
4. Erst nach meinem OK bauen — gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
5. Neue Prüfungen in `pruefung.js`, jede mit Gegenprobe: Regel probeweise
   zurückbauen, zeigen, dass genau diese Prüfung namentlich rot wird. Vor dem
   Deuten roter Punkte per `diff` belegen, dass der Quelltext der ist, den du
   zu prüfen glaubst. Bricht ein Rückbau den Lauf ab, ohne einen Namen zu
   nennen, gehört eine engere zweite Gegenprobe daneben (Stolperstein 82).
   Liefern zwei Gegenproben dieselbe Punktliste, prüfen sie dieselbe Sache —
   dann gehört die Prüfung gespalten (Stolperstein 72).
6. WAS SICH NUR AUSSERHALB DES PRÜFSTANDS BELEGEN LÄSST, WIRD AUSSERHALB
   BELEGT: `docker compose build` läuft einmal wirklich, und du zeigst mir
   die Ausgabe. Der Prüfstand kennt weder `npm ci` noch das Abbild.
7. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch. Das gilt
  auch für die neue Datei unter `.github/` — die Schlüsselwörter sind
  englisch, die Kommentare nicht.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen
  Vorgehens. Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf die im Auftrag genannte setzen. Drei
  Zahlen, keine Buchstaben. `0.8.10` ist gültig und sortiert nach `0.8.9` —
  das ist geprüft, und der Zehnerschritt ist Absicht (Projektstand,
  Abschnitt 10).
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
  Einzige Ausnahme sind die Marken aus der Bauregel.
* Kein Wort der Oberfläche steht im Quelltext, wenn es das Vokabular kennt.
  Umgekehrt bekommt nichts ein neues Vokabelwort, nur weil es auf dem
  Bildschirm steht — die Liste bleibt bei elf.
* Nicht anfassen ohne Rückfrage: Farbschema, Anmeldebremse,
  Verschlüsselungsmodell, Dateiname `katalog.sqlite`.
* Jede Rechteprüfung braucht zwei vorbereitete Sitzungen, zu jeder
  Verweigerung den Erfolgsfall daneben und die Nachschau, dass nichts
  geschrieben wurde. Wo eine Bedingung mit einem meist wahren ODER beginnt,
  braucht die Prüflage einen Rufer, für den der erste Teil falsch ist.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* Neue Bedienelemente werden per `dispatchEvent` gedrückt, samt Durchlauf der
  Ereignisschleife. `.click()` genügt nicht.
* Wird es zu viel für einen Durchgang: am benannten Haltepunkt anhalten und
  sauber abliefern. Sag vorher Bescheid, wenn du das kommen siehst.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:
Zu 1.0 kommt eine finale Bereinigung. Alles, was bis dahin an der Datenbank
arbeitet, muss sich in einem Zug entfernen lassen.

* Zuerst die Frage, ob es den Code überhaupt braucht. Eine Ableitung beim
  Lesen ist besser — die muss später gar nicht entfernt werden.
* Das Schema bleibt vollständige DDL in `db.js`. Neue Spalten und Tabellen
  dort ergänzen. ABER: `CREATE TABLE IF NOT EXISTS` rüstet in einer
  vorhandenen Tabelle nichts nach, und einen anderen Weg gibt es seit 0.8.1
  nicht — eine neue Spalte braucht deshalb BEIDES, die DDL und einen
  markierten Umstiegsblock.
* Einmaliger Umstiegscode steht gebündelt in einer benannten Funktion je
  Version, nicht verteilt über mehrere Dateien.
* Marken um den Block, wörtlich:
  `// UMSTIEG 0.8.x — ENTFAELLT MIT 1.0` … `// ENDE UMSTIEG 0.8.x`
* Die zugehörigen Prüfungen tragen dieselbe Marke und stehen in einem eigenen
  Abschnitt in `pruefung.js`.
* Dauerhafte Auffangnetze sind kein Umstiegscode und bekommen keine Marke.
* Jeder markierte Block bekommt sofort einen Eintrag unter „Vorgemerkt für
  1.0" im Projektstand: Datei, Funktion, Zeilenzahl, Zahl der Prüfungen, in
  einem Satz die Begründung.

In dieser Runde fällt darunter voraussichtlich nichts. Der Abdruck ist eine
ABLEITUNG BEIM START und rührt die Datenbank nicht an — genau der Fall, den
der erste Punkt der Bauregel meint.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitszweig geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; der Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Das Repo ist privat, der Server zieht nicht
  selbst — das Einspielpaket holt sich der Mensch über „Download ZIP" von
  GitHub. Der gepushte Stand IST also das Auslieferungspaket. Vor dem letzten
  Push deshalb: `git status` muss leer sein — MIT AUSNAHME DES NEUEN
  `package-lock.json`, DAS DIESMAL AUSDRÜCKLICH DAZUGEHÖRT —, und `npm test`
  läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.10.md` liegt im Zweig, als Rohstoff für die
  spätere Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit
  Begründung, neue Stolpersteine mit Nummer und Kernsatz, die
  Gegenprobentabelle, Prüfungszahlen vorher/nachher, was für „Vorgemerkt für
  1.0" anfällt, Offengebliebenes.
* NEU AB DIESER VERSION: das Änderungsprotokoll nennt den ABDRUCK der
  Version, in einer eigenen Zeile — „0.8.10 — Abdruck `a3f91c02`". Er wird
  ZULETZT gebildet, nach der letzten Änderung an einer ausgelieferten Datei;
  jede spätere Änderung macht die Zeile falsch.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im
  Chat, nicht in den Dokumenten, und ohne Platzhalter, die die Shell frisst.
  Wo eine Anmeldung nötig ist, gehört sie in den Befehl hinein: `kekse.txt`
  entsteht nicht von selbst.

Projektstand, Konzeptpapier, Ideenpapier und README NICHT anfassen und keinen
Auftragsblock für die nächste Stufe bauen. Das kommt erst, wenn ich gemeldet
habe, dass 0.8.10 eingespielt ist und sauber läuft.

Zum Einspielen, siehe Projektstand Abschnitt 2: `public/app.js` steckt fest im
Docker-Abbild und nicht im eingehängten Verzeichnis — ohne `--build` läuft die
alte Oberfläche weiter. DIESE RUNDE IST DIE LETZTE, DIE DAFÜR EINE TEXTSTELLE
BRAUCHT: nenn mir im Chat eine Stelle, die es nur in der neuen `public/app.js`
gibt, zum Gegenprüfen mit `curl -s http://localhost:3100/app.js | grep -c` —
und daneben den Abdruck aus Punkt 3, der sie ab der nächsten Version ersetzt.


ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* 0.8.20 „DIE SCHOTTEN DICHT" — SVG am Fotoweg (der ausgelieferte Typ kommt
  nie aus der Datenbank, samt Wächter im Prüfstand), `X-Forwarded-For` nur
  hinter einer ausdrücklichen Einstellung, `Secure` am Keks, eine
  Sicherheitsregel für die Anwendung selbst, ein Fehler-Handler, der nicht
  auf alles mit 400 antwortet, sauberes Herunterfahren und ein Index auf
  `sessions.user_id`. Kein Schema. **Ist die Anlage bereits von außen
  erreichbar, tauscht 0.8.20 mit dieser Runde den Platz** — dann zuerst die
  Löcher, dann das Werkzeug.
* Danach 0.8.30, Stufe G4 („Die Linkliste bekommt Verfasser") — die erste
  Datenbankstufe seit 0.8.3, Formatnummer 6 → 7. Die Sicherung des
  Datenverzeichnisses gehört dort wieder ausdrücklich in den Einspielweg.
* Der Abschnitt der README über die Textstelle zum Gegenprüfen wird durch
  Punkt 3 dieser Runde überholt. Er gehört in der Doku-Runde NACH dem
  Einspielen durch drei Sätze über den Abdruck ersetzt — zusammen mit dem,
  was Punkt 1 am Einspielweg ändert (`npm ci`, Sperrdatei).
