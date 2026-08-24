Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, das Ideenpapier, das Videopapier, das
Gewichtungspapier und die Änderungsprotokolle 0.8.6, 0.8.10, 0.8.20, 0.8.30,
0.8.31, 0.8.40, 0.8.50 und 0.8.60 stehen dort unter `Doku/`. Gearbeitet wird im
Repo, nicht an einer Kopie.

AUFTRAG: **Version 0.8.70 — „Sicherung und Papierkorb."**
DIES IST KEINE STUFE DES MEHRBENUTZERBETRIEBS — der ist mit G4 bis auf H und I
gebaut. Es ist die nächste Runde des Stufenplans, **und sie ist wieder eine
Datenbankstufe**: die Sicherung des Datenverzeichnisses gehört als **Pflicht**
in den Einspielweg, nicht als Empfehlung. Das war in 0.8.60 anders und ist
jetzt wieder wie in 0.8.30 bis 0.8.50.

Ausgearbeitet liegt die Sache an drei Stellen: **Ideenpapier 4.5** (der
Papierkorb) und **5.2** (die Rollenteilung von Sicherung und Export), dazu
**Projektstand Abschnitt 10, Punkt 8**. **Lies alle drei ganz, bevor du etwas
vorschlägst.** Dieser Auftrag wiederholt sie nicht, er schneidet sie in Punkte,
setzt die Zahlen dieser Version ein und benennt die Fragen, die vor dem Bauen
zu beantworten sind.

**Drei Punkte, und sie hängen zusammen** — der dritte ist der kleinste und
liefert zugleich das Stück, das der erste braucht.

WARUM DIESE RUNDE JETZT KOMMT: 0.8.60 („Was ist offen, was ist neu") ist
gebaut, Fingerprint `ab68b523`, 2087 Prüfungen, `F_ROUTEN` bei 47, Formatnummer
10, fünf markierte Migrationsblöcke, Stolpersteine bis 116. **Die Bindung des
Stufenplans ist eingelöst: 0.8.50 vor 0.8.70.** Der Papierkorb serialisiert
einen Eintrag, und seit 0.8.50 trägt ein Eintrag Videos — die Serialisierung
wird deshalb **einmal** gebaut statt einmal gebaut und einmal nachgezogen.
Genau dafür lag diese Runde hinten.

WAS SICH ÄNDERT, IN EINEM SATZ: Zwei Wege zurück, die es heute nicht gibt — ein
**gelöschter Eintrag** ist dreißig Tage lang wiederherstellbar, und eine
**Sicherung der ganzen Anlage** entsteht auf Knopfdruck statt von Hand auf dem
Wirt.

**DIE TRAGENDE REGEL DIESER RUNDE: DER PAPIERKORB FASST KEINE EINZIGE
BESTEHENDE ABFRAGE AN.** Kein `geloescht`-Zustand an `items`. Der würde jede
Abfrage im ganzen System berühren, und jede vergessene Stelle wäre ein stiller
Fehler. Ein gelöschter Eintrag ist **wirklich weg** — er liegt nur zusätzlich
noch als Paket daneben. Das Ideenpapier sagt selbst, dass die *Form* hier
wichtiger ist als die Idee; wer daran rüttelt, baut die Runde neu.

---

1. DER PAPIERKORB. Der größere der drei Punkte.

   Beim Löschen eines Eintrags wird er **im vorhandenen Austauschformat**
   serialisiert und als **eine Zeile** in einer eigenen Tabelle abgelegt — in
   **derselben Transaktion** wie das Löschen. Danach läuft die Kaskade wie
   heute. Im Systembereich eine Karte „Papierkorb" mit Titel, Datum und
   Löschendem, dazu „Wiederherstellen" und „Endgültig entfernen". Nach dreißig
   Tagen fällt eine Zeile heraus.

   **DIE TABELLE STEHT IM IDEENPAPIER, ABSCHNITT 4.5, UND IST DER ENTWURF —
   NICHT DIE VORGABE.** Prüf sie gegen das, was das Projekt sonst tut, und sag,
   wo du abweichst. Zwei Dinge fallen mir schon beim Lesen auf und gehören
   beantwortet: `geloescht_von` mit `ON DELETE SET NULL` erzeugt einen weiteren
   Träger mit `user_id`-Charakter — **gehört er in `ordneBestandZu()` oder
   ausdrücklich nicht?** (Stolperstein 104 hängt daran.) Und der Entwurf nennt
   `titel` neben `inhalt`, damit die Liste lesbar ist, ohne zu entpacken — das
   ist eine **bewusste Doppelung** und gehört als solche im Quelltext benannt,
   sonst räumt sie der Nächste als zweite Wahrheit weg.

   **DIE ENTSCHEIDENDE FRAGE ZUERST, UND SIE IST EINE SCHEMAFRAGE:
   BRAUCHT EINE NEUE TABELLE ÜBERHAUPT EINEN MIGRATIONSBLOCK?** `CREATE TABLE
   IF NOT EXISTS` legt eine **Tabelle** bei jedem Start an — anders als eine
   **Spalte**, die es in einer vorhandenen Tabelle nie nachträgt
   (Stolperstein 13). Wenn das trägt, bleibt es bei **fünf** markierten Blöcken,
   und es kommt **kein** Eintrag unter „Vorgemerkt für 1.0" dazu.
   **Nachstellen, nicht glauben** — dieselbe Probe wie beim Index auf
   `sessions.user_id` in 0.8.20: Tabelle von Hand aus einer bestehenden Anlage
   entfernen, Server einmal starten, nachsehen. *Ich neige dazu, dass kein
   Block nötig ist.* Wenn du zu einem anderen Schluss kommst, sag es vorher —
   ein sechster Block ist ein Grund anzuhalten und zu fragen, kein Grund, ihn
   einzubauen.

   **DER GROSSE STOLPERSTEIN DIESER RUNDE: WIE GROSS DARF EINE ZEILE WERDEN?**
   Seit 0.8.50 kann ein Eintrag zwanzig Videos zu je 20 MB tragen. Als Base64
   in **einem** String sind das rund 540 MB, und **Node hält keinen String über
   etwa 512 MB** — der Export weiß das und schaltet Fotos, Dateien und Videos
   deshalb einzeln zu. Ein Papierkorb, der stumpf alles einpackt, reißt genau
   an dem Eintrag, den zu verlieren am meisten wehtut. **Das ist die Frage, die
   vor den Bau gehört**, und ich habe keine fertige Antwort. Drei Wege sehe ich:

   * **Zippen** (`zlib` ist in Node eingebaut, also keine neue Abhängigkeit) —
     hilft gegen die Dateigröße, **nicht** gegen die Stringgrenze, denn der
     String entsteht vorher.
   * **Die Blobs an der JSON vorbeiführen** — die Videos und Fotos als eigene
     Zeilen oder als angehängte Bytes, nicht als Base64 im Text.
   * **Eine Grenze ziehen und sie benennen** — ab einer bestimmten Größe wandert
     der Eintrag ohne seine Videos in den Papierkorb, und der Dialog sagt das
     vorher. Eine Ansage ist besser als ein Abriss.

   **Sag, welchen du nimmst und warum, und was der Preis ist.** Was du nicht
   tun sollst: es unentschieden lassen und hoffen, dass niemand zwanzig Videos
   an einem Eintrag hat.

   **DREI WEITERE FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Wer darf wiederherstellen?** Löschen darf heute der Verfasser des
     Eintrags oder der Admin (`nurEintragVerfasser`). Der Papierkorb hält
     **fremde** Beiträge — Kommentare, Bewertungen und Testtage anderer sind
     über die Kaskade mit hineingewandert. Wiederherstellen ist damit näher am
     **Import** als am Löschen, und der steht hinter `nurEigentuemer`.
     *Ich neige zu: sehen darf ihn der Admin, wiederherstellen und endgültig
     entfernen darf der Eigentümer.* Begründe, wenn du anders entscheidest —
     und ob „sehen" wirklich harmlos ist: im Titel eines gelöschten Eintrags
     kann stehen, was niemand mehr lesen soll.
   * **Was wird beim Wiederherstellen aus dem Verfasser?** Der Import ordnet
     über den **Namen** zu und legt einen **neuen** Eintrag an — die alte
     Nummer ist weg, und daran hängt nichts mehr. Das ist richtig so und soll
     bleiben. Aber: was passiert mit einem Beitrag, dessen Zugang inzwischen
     entfernt wurde? Der Import kennt die Antwort schon; **schreib sie hin,
     statt sie neu zu erfinden.**
   * **Wann wird aufgeräumt?** Der Vorschlag sagt „beim Start". Eine Anlage,
     die drei Monate durchläuft, räumt dann drei Monate lang nicht auf.
     *Ich neige zu: beim Start UND beim Öffnen der Karte* — zwei Aufrufstellen
     einer Funktion, wie bei `ordneBestandZu()`, und der Prüfstand belegt jede
     einzeln. Sag, ob das trägt.

   **UND EINE ENTSCHEIDUNG, DIE ICH DIR ÜBERLASSE:** Der Löschdialog nennt
   heute Zahlen, getrennt nach eigen und fremd, und begründet sich damit, dass
   Löschen unwiderruflich ist. **Mit dem Papierkorb ist es das nicht mehr.**
   Bleibt der Dialog, wie er ist, sagt er etwas Falsches; verschwindet er, geht
   die Auskunft über den Umfang verloren. *Ich neige dazu, ihn zu behalten und
   seinen Schlusssatz umzuschreiben.* Entscheide du — es ist die einzige
   Änderung dieser Runde an etwas, das täglich benutzt wird.

2. DIE SICHERUNG AUF KNOPFDRUCK.

   Eine Karte „Sicherung" im Systembereich, beim Eigentümer wie Export und
   Import. Ein Knopf, ein einstellbarer Zielort, ein Hinweis „letzte Sicherung
   vor N Tagen". `VACUUM INTO` erzeugt eine **verschlüsselte**, vollständige
   und konsistente Kopie — nachgestellt und im Projektstand festgehalten: ohne
   Schlüssel meldet sie „file is not a database".

   **DIE ROLLENTEILUNG GEHÖRT IN DIE OBERFLÄCHE, NICHT NUR IN DIE DOKUMENTE.**
   `VACUUM INTO` ist der **Sicherungsweg**, der JSON-Export der
   **Austauschweg**. Die Kopie ist konstant im Speicherbedarf und vollständig;
   der Export überlebt einen Formatwechsel und braucht keinen Schlüssel. Wer
   die beiden Karten nebeneinander sieht, muss ohne Rückfrage wissen, welche er
   will. Ein Satz je Karte reicht — aber er muss dastehen.

   **DER HINWEIS AUF DEN SCHLÜSSEL GEHÖRT AN DEN KNOPF**, nicht in die
   Dokumentation: die Kopie ist ohne `.env` wertlos. Das ist dieselbe Falle,
   die die README beim Backup ausführlich beschreibt — hier steht sie an der
   Stelle, an der jemand sie tatsächlich tappt.

   **DIE SICHERHEITSFRAGE DER RUNDE, UND SIE IST KEINE FORMSACHE: DER ZIELORT
   IST EINGABE UND WIRD ZU EINEM DATEIPFAD.** Das Projekt hat für genau diese
   Klasse eine Regel — *ein Kopf vom Aufrufer ist nie eine Feststellung* — und
   für Dateinamen eine ausgearbeitete Antwort in `anhaenge.js`. Hier schreibt
   der Server erstmals **an einen Ort, den jemand angeben darf**. `../` gehört
   dazu, ein absoluter Pfad, ein Gerätename, ein Symlink. **Sag im Vorschlag,
   wie eng du es fasst und woran die Prüfung hängt.** *Ich neige zu: der Ort
   ist eine Einstellung des Eigentümers, kein Feld am Knopf, und er wird gegen
   eine kurze Positivliste geprüft statt gegen eine Liste des Verbotenen.*
   Ein Verzeichnis, das es nicht gibt, ist eine Absage mit sprechender
   Begründung — nicht ein stilles Anlegen.

   **DREI FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **`VACUUM INTO` läuft synchron.** `better-sqlite3` blockiert den Prozess,
     und der Prozess ist der Server. Bei einer Datenbank von zwei Gigabyte
     steht die Anlage währenddessen. **Nachmessen, nicht schätzen:** wie lange
     dauert es bei welcher Größe? Und dann sagen, ob das hinnehmbar ist, ob der
     Knopf vorher warnt oder ob es einen anderen Weg braucht.
   * **Was, wenn die Zieldatei schon da ist?** `VACUUM INTO` scheitert dann —
     nachstellen statt glauben. Überschreiben wäre die schlechteste Antwort:
     eine Sicherung, die die vorige Sicherung frisst, ist keine. *Ich neige zu
     einem Namen mit Datum und Uhrzeit.*
   * **Woher kommt „letzte Sicherung vor N Tagen"?** Aus einem Schlüssel in
     `settings` oder aus dem Dateisystem am Zielort? Ein Schlüssel ist eine
     **Behauptung** über die Datei, das Dateisystem ist die **Sache** —
     dieselbe Frage wie beim Merker gegen den Index in 0.6.2, und dort ist sie
     zugunsten der Sache entschieden worden. *Ich neige entsprechend*, sehe
     aber, dass ein unerreichbarer Zielort dann keine Auskunft liefert. Sag,
     was du daraus machst.

   **DER SICHERUNGSORT DARF NICHT IM DATENVERZEICHNIS LIEGEN**, und die Vorgabe
   steht ausdrücklich daneben: eine Sicherung neben dem Original ist keine.
   **Denk daran, was im Container erreichbar ist** — ein Pfad, den es außerhalb
   gibt, muss auch eingehängt sein, sonst schreibt die Anlage in eine Schicht,
   die beim nächsten `docker compose up --build` verschwindet. Das gehört in
   den Einspielweg und in die README, nicht nur in eine Fehlermeldung.

3. EINEN EINZELNEN EINTRAG EXPORTIEREN. Der kleinste Punkt — und der, der dem
   Papierkorb sein Werkzeug liefert.

   `GET /api/export` baut heute **alle** Einträge in einem Zug: eine Abbildung
   je Eintrag, mitten in der Route. Der Papierkorb braucht dieselbe Abbildung
   für **einen**. Zieh sie heraus, in **eine** Funktion, und ruf sie an beiden
   Stellen — **zwei Rechenwege für dieselbe Datei liefen auseinander**, und die
   Runde hätte den Fehler eingebaut, den sie verhindern soll.

   Daraus folgt der dritte Punkt fast von selbst: wenn die Funktion einmal
   dasteht, ist „diesen Eintrag als Datei" ein Knopf am Eintrag und eine
   lesende Route.

   **ZWEI FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Hinter welchem Wächter steht der Einzelexport?** Der volle Export steht
     hinter `nurEigentuemer`, und die Begründung dafür trägt: eine Exportdatei
     kann unter fremdem Namen schreiben. Bei **einem** Eintrag ist die Lage
     milder, aber nicht anders. *Ich neige dazu, es beim Eigentümer zu lassen* —
     aber wenn du meinst, dass jeder seinen eigenen Eintrag ziehen darf,
     begründe es an der Frage „was kann jemand mit dieser Datei tun".
   * **Bleibt die Formatnummer bei 10?** Eine Datei mit einem Eintrag ist
     dieselbe Form wie eine mit hundert. *Ich neige zu ja.* Wenn der Papierkorb
     dagegen ein Feld ergänzt, das der Import lesen muss, ist es **11** — sag
     das dann ausdrücklich und trag es nach.

4. WAS ALLE DREI GEMEINSAM HABEN — UND WAS SIE AUSDRÜCKLICH NICHT TUN.

   * **Der Papierkorb liegt in der verschlüsselten Datenbank** und damit im
     Datenverzeichnis, in der Sicherung und in `VACUUM INTO`. **Die Kennzahlen
     weisen ihn getrennt aus** — sonst wundert sich jemand über eine Datenbank,
     die nach dem Aufräumen größer ist als vorher. Dieselbe Bauform wie bei den
     Videos in 0.8.50: die alten Feldnamen behalten ihre Bedeutung und bekommen
     Nachbarn.
   * **Keine bestehende Abfrage ändert sich.** Kein `geloescht` an `items`,
     kein `WHERE`-Zusatz irgendwo. Eine Prüfung darauf gehört dazu.
   * **Keine neue Abhängigkeit.** Nicht eine. `zlib` ist in Node eingebaut und
     zählt nicht als neue.
   * **Kein neuer Eintrag im Vokabular.** „Papierkorb" und „Sicherung" sind
     Wörter über den Gegenstand, so wie „Foto" und „Video". **Die elf bleiben
     elf.** Wo die Karten den Bestand benennen, benutzen sie das Vokabular —
     eine Karte, die „3 Einträge im Papierkorb" schreibt, während der Betreiber
     sie „Maschinen" nennt, ist falsch beschriftet.
   * **Die Sprachregel aus 0.8.60 gilt** (Projektstand Abschnitt 12). Der
     Sprachwächter im Prüfstand liest `Doku/` und die Kommentare des
     Quelltextes; wer ein übersetztes Lehnwort neu einträgt, wird namentlich
     rot. **Backup oder Sicherung?** Beides ist gebräuchlich; entscheide dich
     für **eines** und halte es durch — zwei Wörter für dieselbe Sache sind
     genau das, was die Regel verhindern soll.
   * **`F_ROUTEN` wächst diesmal**, und das ist in Ordnung — aber es gehört
     vorher gesagt. Nenn im Vorschlag **jede** neue schreibende Route mit ihrer
     Absicherung und die neue Zahl. Lesende Endpunkte stehen wie immer nicht in
     der Liste.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies **Ideenpapier 4.5 und 5.2** vollständig, dann im Projektstand
   Abschnitt 2 (Betriebsstand und Einspielweg), Abschnitt 4 (Funktionsumfang,
   besonders der Systembereich und die Löschdialoge), Abschnitt 5 (die
   Entscheidungen, darunter „Löschen entwertet, es löscht nicht" und die Regeln
   zu Verfasser und Kaskade), Abschnitt 5a (die Sicherheitsregel für
   ausgelieferte Dateien), Abschnitt 6 die Stolpersteine — **13, 104 und 108
   sind die wichtigsten dieser Runde** —, Abschnitt 7 den Prüfstand,
   Abschnitt 10 Punkt 8 und den Stufenplan, Abschnitt 11 die Bindungen und
   Abschnitt 12 die Arbeitsweise samt Sprachregel.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst:
   `db.js` (die vollständige DDL, die fünf Migrationsblöcke samt Marken,
   `ordneBestandZu()`, `DATA_DIR`), `server.js` (`GET /api/export` und die
   Abbildung je Eintrag, `POST /api/import` samt `verfasser()`,
   `DELETE /api/items/:id`, `GET /api/items/:id/bestand`, `GET /api/stats`,
   `reclaim()`, `nurEigentuemer`), `public/app.js` (`renderSystem()` und die
   dreizehn Karten, der Löschdialog am Eintrag), `pruefung.js` (`F_ROUTEN`, die
   Gruppen zu Export und Import, „Der Bau ist wiederholbar", `baueDom` samt
   Mock).
3. Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen. **Die Fragen aus den Punkten 1, 2 und 3 gehören hierher, nicht
   in den Bau** — die Größe einer Papierkorbzeile, der Migrationsblock, das
   Recht am Wiederherstellen, der Verfasser, der Aufräumzeitpunkt, der
   Löschdialog, der Zielort, die Dauer von `VACUUM INTO`, die vorhandene
   Zieldatei, die Herkunft von „letzte Sicherung", der Wächter am Einzelexport
   und die Formatnummer. Unstimmigkeiten zwischen Ideenpapier und Quelltext
   sagst du jetzt.
4. Erst nach meinem OK bauen — gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
5. Neue Prüfungen in `pruefung.js`. **Das Ideenpapier hat keine Prüfliste.** Du
   stellst sie selbst auf, und sie ist der erste Teil des Vorschlags, nicht der
   letzte. Jede mit Gegenprobe: Regel probeweise zurückbauen, zeigen, dass
   genau diese Prüfung namentlich rot wird. Vor dem Deuten roter Punkte per
   `diff` belegen, dass der Quelltext der ist, den du zu prüfen glaubst. **Die
   Gegenproben laufen in einer Kopie des Arbeitsbaums** (Stolperstein 100).
   **Was mindestens hineingehört**, und die Liste ist keine Obergrenze:
   * **der Rundlauf, und er ist die tragende Prüfung der Runde:** ein Eintrag
     mit Fotos, Video, Dateien, Links, Tags, Kommentaren aller vier Arten,
     Bewertungen und Testtagen **mehrerer Verfasser** wird gelöscht,
     wiederhergestellt und **Feld für Feld** gegen den Ausgangsstand gehalten.
     Eine Prüflage mit einem nackten Titel belegte genau nichts;
   * **die neue Zeile entsteht in derselben Transaktion wie das Löschen** —
     eine Gegenprobe, die den Fehlschlag erzwingt, und danach steht der Eintrag
     **unverändert** da, nicht halb;
   * **keine bestehende Abfrage ändert sich:** derselbe Bestand, dieselbe
     Übersicht, dieselbe Detailansicht — vor und nach dem Bau;
   * **die Rechte am Papierkorb in beiden Richtungen**, mit zwei vorbereiteten
     Sitzungen, zu jeder Verweigerung der Erfolgsfall daneben und der Nachschau
     in der Datenbank, dass nichts geschrieben wurde;
   * **die dreißig Tage:** eine Zeile mit von Hand gesetztem altem Datum fällt
     heraus, eine von gestern bleibt — und die Grenze wird an **beiden** Seiten
     geprüft (Stolperstein 60: der Ausgangswert wird von Hand gesetzt);
   * **die Kennzahl weist den Papierkorb getrennt aus**, und die alten Zahlen
     bedeuten unverändert dasselbe;
   * **`VACUUM INTO` an einer echten Anlage:** die Kopie entsteht, sie ist
     **ohne Schlüssel nicht lesbar**, sie ist **mit** Schlüssel vollständig, und
     der Ausgangsstand ist danach unverändert;
   * **der Zielort in beide Richtungen:** ein erlaubter Ort geht durch, `../`,
     ein absoluter Pfad und das Datenverzeichnis selbst werden mit sprechender
     Begründung abgewiesen — und **nach jeder Absage liegt keine Datei da**;
   * **eine vorhandene Zieldatei** wird nicht überschrieben;
   * **der Einzelexport liefert dieselbe Form wie der volle Export**, geprüft
     an einer Datei, die durch den **Import** wieder hereinkommt — nicht nur am
     JSON;
   * **eine Funktion, nicht zwei:** ein Wächter über den Quelltext, dass die
     Abbildung je Eintrag genau einmal vorkommt, samt Gegenprobe, dass er
     überhaupt noch Code liest (Stolperstein 106);
   * **`F_ROUTEN` trägt jede neue schreibende Route mit ihrer Art**, und die
     **Zahl** wird ausdrücklich geprüft;
   * **die Karten benutzen das Vokabular**, mit einer Prüflage, die es
     umstellt;
   * **der Sprachwächter bleibt grün**, und die neue Wortwahl steht in seiner
     Liste, falls sie eine Übersetzung ersetzt.
6. **Ein Migrationsabschnitt im Prüfstand nur, wenn es einen Migrationsblock
   gibt.** Ergibt die Probe aus Punkt 1, dass `CREATE TABLE IF NOT EXISTS` die
   Tabelle von selbst anlegt, entsteht **kein sechster Abschnitt** — dann
   gehört stattdessen die **Probe selbst** in den Prüfstand: Tabelle von Hand
   entfernen, Server starten, sie ist wieder da. Und die Probe „Ein Sprung von
   0.8.20 fährt ALLE Migrationen in einem Start" wird nur erweitert, wenn
   wirklich eine dazukommt. Sag es im Vorschlag ausdrücklich, damit klar ist,
   dass die Frage gestellt und beantwortet wurde.
7. Für die Rechteprüfung gilt unverändert: zwei vorbereitete Sitzungen, zu
   jeder Verweigerung der Erfolgsfall daneben und die Nachschau, dass nichts
   geschrieben wurde. **Und ein Admin ohne Eigentümerrolle gehört dazu** —
   ohne ihn ließe sich „Eigentümer" von „Admin" gar nicht unterscheiden.
8. **Für den Mock in `baueDom` gilt Stolperstein 90 und 115:** er muss den
   Papierkorb in **beiden** Zuständen liefern — gefüllt und leer — und seine
   Antwort beim Wiederherstellen und beim endgültigen Entfernen **wirklich**
   ändern. Wer die Zahlen einer Prüflage misst, misst sie an einem frischen
   Aufbau. **Und die Lehre aus 0.8.40 bis 0.8.60 gilt weiter:** eine Prüfung
   darauf, dass an einer Zeile etwas **nicht** steht, gehört hinter eine
   Prüfung darauf, dass es die Zeile überhaupt gibt (Stolperstein 81). **Jede
   Lesestelle wird abgefangen** — fehlt der Gegenstand, sollen die Prüfungen rot
   werden, nicht der Lauf abreißen (Stolperstein 103).
9. Neue Bedienelemente werden per `dispatchEvent` gedrückt, samt Durchlauf des
   Event Loops. `.click()` genügt nicht.
10. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.** Fachbegriffe werden nicht
  zwanghaft eingedeutscht; die eigenen Bilder des Projekts bleiben.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen
  Vorgehens. Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.8.70` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`) — sonst wird der Prüfstand
  namentlich rot.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
  Einzige Ausnahme sind die Marken aus der Bauregel.
* **Keine neue Abhängigkeit.** Nicht eine.
* Nicht anfassen ohne Rückfrage: Farbschema, Anmeldebremse je Benutzername,
  Verschlüsselungsmodell, Dateiname `katalog.sqlite`, die Einstellung
  `HINTER_PROXY` und alles, was daran hängt, die Content-Security-Policy der
  Anwendung, die Sortierung der Übersicht, das Austauschformat über das
  hinaus, was Punkt 3 verlangt.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106) — mit der einen Ausnahme, die seit 0.8.60 dasteht: der
  Sprachwächter sieht die Kommentare ausdrücklich an.
* **Zu jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine
  Prüfung an der echten Antwort** (Stolperstein 102).
* Wird es zu viel für einen Durchgang: **Haltepunkt nach Punkt 1** — dann steht
  der Papierkorb samt Einzelserialisierung, und die Sicherung folgt in einer
  eigenen Runde. Sag vorher Bescheid, wenn du das kommen siehst. **Punkt 3
  gehört dabei zu Punkt 1**, nicht zu Punkt 2: ohne die herausgezogene Funktion
  gibt es keinen Papierkorb.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **In dieser Runde ist das
  die Kernfrage von Punkt 1** — eine neue Tabelle ist womöglich gar kein Fall
  dafür.
* Das Schema bleibt vollständige DDL in `db.js`. Ein Index über `CREATE INDEX
  IF NOT EXISTS` ist KEIN Fall dafür, und eine Tabelle über
  `CREATE TABLE IF NOT EXISTS` allem Anschein nach ebenso wenig — nachstellen.
* Einmaliger Migrationscode steht gebündelt in einer benannten Funktion je
  Version, mit Marken, samt eigenem Prüfabschnitt. Die Marke lautet seit 0.8.60
  `// MIGRATION 0.8.x — ENTFAELLT MIT 1.0`, die Funktion heißt `migration0870()`.
* Jeder markierte Block bekommt sofort einen Eintrag unter „Vorgemerkt für
  1.0" im Projektstand.

**Es bleibt bei fünf markierten Blöcken, wenn die Probe aus Punkt 1 das
hergibt.** Kommt doch ein sechster dazu, ist das kein Grund anzuhalten — aber
ein Grund, ihn ausdrücklich zu begründen und einzutragen.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; der Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.70.md` liegt im Branch, als Rohstoff für die
  spätere Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit
  Begründung, neue Stolpersteine mit Nummer und Kernsatz (**die Zählung setzt
  bei 117 fort**), die Gegenprobentabelle, Prüfungszahlen vorher/nachher
  (vorher: **2087**), Offengebliebenes.
* Die Zeile „0.8.70 — Fingerprint `…`" gehört ins Änderungsprotokoll, ZULETZT
  gebildet, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, denn `server.js` lädt sie.
  Diese Runde fasst voraussichtlich `db.js`, `server.js`, `public/app.js` und
  `public/style.css` an; `anhaenge.js`, `auth.js` und `keys.js` bleiben
  unberührt.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  wieder als PFLICHT** — es ist eine Datenbankstufe, und ein Downgrade ist
  keine reine Dateikopie mehr. Das war in 0.8.60 anders und gehört ausdrücklich
  gesagt. Der Weg gehört in den Chat, mit den Befehlen und dem erwarteten
  Ergebnis.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. Für diese Runde ausdrücklich dabei: die Abfrage
  `SELECT name FROM sqlite_master WHERE type='table'` im Container (erwartet:
  die neue Tabelle steht da, **auch ohne Migrationsblock**), ein gelöschter und
  wiederhergestellter Eintrag am laufenden Betrieb, eine Sicherung auf
  Knopfdruck samt dem Versuch, sie **ohne** Schlüssel zu öffnen, und der
  Fingerprint-Vergleich.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

Diese drei Punkte sind Teil des Auftrags und werden am Ende abgearbeitet, nach
dem grünen Prüflauf:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Also:
  Projektstand (Kopf, Betriebsstand samt Einspielweg, Funktionsumfang,
  Abschnitt 5 um die Entscheidungen dieser Runde, Stolpersteine, Prüfstand,
  Versionsgeschichte, Stufenplan, Abschnitt 10 Punkt 8 als **erledigt**,
  Abschnitt 11), das Ideenpapier (4.5 und 5.2 als erledigt kennzeichnen, samt
  jeder Stelle, an der anders gebaut wurde), das Mehrbenutzer-Konzeptpapier und
  die README. Der Projektstand und das Mehrbenutzerpapier tragen die Version im
  Dateinamen und werden entsprechend umbenannt (`git mv`, damit die Historie
  erhalten bleibt); alle Verweise darauf sind nachzuziehen.
* **`Doku/Changelog.md` bekommt einen Abschnitt für diese Stufe** — was sich
  seit der letzten Version geändert hat. **Kurz und prägnant, wie bei den
  meisten Softwareanbietern: nicht zu viel aus dem Quelltext, sondern
  informativ für jemanden, der sich fragt, was das Update für ihn
  mitbringt.** Drei Blöcke wie beim vorhandenen Eintrag: was neu ist, was
  gleich bleibt, was beim Einspielen zu beachten ist.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Stufe.**
  Den weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber
  getestet ist. Bau ihn nicht ungefragt.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60. Er wird bei jedem
  Seitenaufbau gebraucht; die Frage, wie er nicht ständig neu abgefragt wird,
  gehört in eine eigene Runde.
* **0.8.80 — Stufe H, Tokens.** Einladung und Rücksetzung, dazu „Meine
  Sitzungen". Die nächste Stufe des Mehrbenutzerbetriebs; sie nimmt den
  Cookienamen aus `auth.COOKIE_NAME` und schreibt ihn nirgends ab.
* **Teil II des Videopapiers — große Dateien bis 2 GB**, beschlossen für
  **1.1.0**, also nach 1.0. **Dieser Punkt berührt den Papierkorb**: was heute
  eine Papierkorbzeile sprengt, sprengt sie dann erst recht. Was du in Punkt 1
  entscheidest, gehört dort als Vorgabe vermerkt.
* **Die Vorschau der Rangfolge im Systembereich** aus 0.8.40 ist weiterhin
  offen und weiterhin vorgemerkt.
* **4.2 „Abgelehnt mit Datum und Begründung"** aus dem Ideenpapier ist
  weiterhin offen und weiterhin nicht zusammengelegt.
* **Eine Trusted-Proxy-Adressliste** aus 0.8.20 ist weiterhin nicht gebaut und
  bleibt vorgemerkt.
* **Die Tastaturbedienung beim Sortieren** bleibt für 1.0 vorgemerkt und
  betrifft seit 0.8.50 auch Videos.
* **Die Marke `qt  ` am QuickTime-Video** ist aus 0.8.50 unbelegt geblieben —
  es gab kein Gerät dafür. Wer ein iPhone zur Hand hat, lädt ein `.mov` hoch
  und sieht sich die Header an.
* **Der Sprachwächter sieht die Namen von Prüfungen nicht an** (Befund aus
  0.8.60): sie stehen in Strings, nicht in Kommentaren. Wer dort ein
  altes Wort einträgt, fällt nicht auf.
