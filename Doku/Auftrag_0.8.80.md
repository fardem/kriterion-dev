Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Ideenpapier, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht
an einer Kopie.

AUFTRAG: **Version 0.8.80 — „Einladung, Rücksetzung, Sitzungen."**
DIES IST WIEDER EINE STUFE DES MEHRBENUTZERBETRIEBS — **Stufe H, Tokens.** Es
ist die erste seit G4 (0.8.30); dazwischen liegen mit 0.8.40 bis 0.8.70 vier
Runden, die nicht dazugehörten. Danach fehlt nur noch **Stufe I** (Mailversand
und Selbstanmeldung, 0.9.0).

Ausgearbeitet liegt die Sache **an einer einzigen Stelle**: im
**Konzeptpapier `Doku/Konzept_Mehrbenutzerbetrieb_Kriterion_0_8_71.md`**,
dort Abschnitt 4 (das Datenmodell, der Satz „Offen für Stufe H"), Abschnitt 9
(Verwaltung, samt der Notiz, warum der Einmalcode entfallen ist), Abschnitt 10
(Registrierung und Tokens) und Abschnitt 11 (E-Mail, und warum sie hier noch
nicht kommt). **Das Ideenpapier sagt zu dieser Stufe nichts** — such dort nicht.
Dieser Auftrag wiederholt das Konzeptpapier nicht, er schneidet es in Punkte,
setzt die Zahlen dieser Version ein und benennt die Fragen, die vor dem Bauen
zu beantworten sind.

**Vier Punkte. Die ersten drei sind ein Stück und hängen aneinander, der
vierte steht für sich** — er ist der Haltepunkt-Kandidat, nicht umgekehrt.

WARUM DIESE RUNDE JETZT KOMMT: 0.8.70 („Sicherung und Papierkorb") ist gebaut,
Fingerprint `1aa9266a`, **2381 Prüfungen**, `F_ROUTEN` bei **51**, Formatnummer
**10**, **fünf** markierte Migrationsblöcke, Stolpersteine bis **122**, fünfzehn
Karten im Systembereich, elf Vokabulareinträge. Der Stufenplan hat für H keine
Bindung nach vorn offen — sie ist schlicht die nächste.

WAS SICH ÄNDERT, IN EINEM SATZ: Ein neuer Zugang bekommt sein Passwort
**selbst**, über einen Link mit begrenzter Haltbarkeit, statt es vom Admin
gesagt zu bekommen — und jeder sieht, **wo er überall angemeldet ist**.

**DIE TRAGENDE FRAGE DIESER RUNDE STEHT VOR DEM ERSTEN PUNKT, UND SIE IST KEINE
TECHNISCHE: WIE KOMMT DER LINK ZUM EMPFÄNGER?** Mailversand ist **Stufe I** und
bleibt bei 0.9.0. Diese Stufe liegt davor. Also gibt es genau eine Antwort: der
Admin **kopiert den Link und gibt ihn weiter** — mündlich, per Zettel, per
Messenger. Das ist keine Notlösung, die man verschweigt, sondern die Bauform:
der Link ist damit ein **Passwortersatz auf Zeit**, er steht danach in einem
fremden Verlauf, und alles, was diese Runde entscheidet — Haltbarkeit,
Einmaligkeit, was die Absage verrät —, folgt daraus. **Schreib das in die
Oberfläche, nicht nur in die Dokumente.** Wer den Link kopiert, muss an der
Stelle lesen, was er da gerade in der Hand hat.

---

LESEWEGE — WAS DU LIEST UND WAS AUSDRÜCKLICH NICHT:

Der Prüfstand hat über 15.000 Zeilen, der Projektstand über 4.000. **Beide
werden nicht am Stück gelesen.** Das ist keine Bequemlichkeit, sondern die
Bedingung dafür, dass diese Runde in einem Durchgang fertig wird.

* **Ganz lesen:** diesen Auftrag; im Konzeptpapier die Abschnitte 4, 9, 10, 11
  und die Stufenliste ab „Stufe G4".
* **Abschnittsweise lesen, über die Überschriften angesteuert:** Projektstand
  Abschnitt 2 (Betriebsstand und Einspielweg), 3 (Zugang und Verschlüsselung —
  **für diese Runde der wichtigste**), 4 (Funktionsumfang, besonders die Karte
  „Zugänge" und „Passwort ändern"), 5 (Entscheidungen — vor allem „Löschen
  entwertet, es löscht nicht" und die Rollenleiter), 5a (Sicherheitsregel für
  ausgelieferte Dateien), 6 (Stolpersteine — **13, 47, 51, 53, 60, 74, 119 sind
  die dieser Runde**), 7 (Prüfstand), 10 (Stufenplan), 11 (Merkzettel),
  12 (Arbeitsweise samt Sprachregel).
* **Gezielt greppen, nie am Stück lesen:** `pruefung.js`. Was du brauchst,
  findest du über `gruppe('…')`, über `F_ROUTEN` und über `baueDom`.
* **Nicht lesen, solange keine bestimmte Frage dorthin führt:** die
  Änderungsprotokolle `0.8.6` bis `0.8.70`. Sie sind Rohstoff vergangener
  Runden; alles, was daraus bindet, steht im Projektstand. Ebenso das
  Videopapier — Teil I ist gebaut, Teil II betrifft 1.1.0, und diese Runde
  berührt weder das eine noch das andere.
* **Der Quelltext, den es wirklich braucht:** `auth.js` **ganz** (Sitzungen,
  Hashen, Anmeldung, Bremse, Zugangsverwaltung — sie ist die Datei dieser
  Runde), `db.js` die DDL zu `users` und `sessions` samt Kommentaren,
  `server.js` die Anmelde- und Zugangsrouten sowie `PUT /api/account`,
  `public/app.js` die Anmeldeseite und die Karte „Zugänge", `zugang.js` ganz
  (klein, und du musst wissen, was es tut, um es **nicht** anzufassen).

---

1. DER TOKEN — EIN MECHANISMUS, ZWEI ANLÄSSE.

   32 Zufallsbytes. Gespeichert wird **nur der Hash**. Einmal gültig. Ablauf
   nach **sieben Tagen**. Beim Einlösen fallen **alle** Sitzungen dieses
   Benutzers. So steht es im Konzeptpapier, Abschnitt 10, und daran wird nicht
   gerüttelt.

   **DIE SCHEMAFRAGE IST DIESMAL SCHON BEANTWORTET — ABER NICHT VON DIR.**
   `tokens` ist eine **neue Tabelle**, und 0.8.70 hat nachgestellt und belegt,
   dass `CREATE TABLE IF NOT EXISTS` eine fehlende Tabelle bei jedem Start
   anlegt (anders als eine Spalte, Stolperstein 13). Es bleibt also bei
   **fünf** markierten Blöcken und **keinem** neuen Eintrag unter „Vorgemerkt
   für 1.0". **Trotzdem: nachstellen, nicht abschreiben.** Dieselbe Probe wie
   damals, an dieser Tabelle. Ein Beleg aus der Vorrunde ist ein guter Grund,
   es zu erwarten — kein Grund, es nicht zu prüfen.

   **VIER FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Welcher Hash?** Das Projekt hasht Passwörter mit **scrypt**, absichtlich
     langsam. Ein Token trägt 256 Bit Zufall — da ist scrypt der falsche Griff:
     langsam ohne Gewinn, und **nicht nachschlagbar**, weil jede Zeile einzeln
     durchgerechnet werden müsste. *Ich neige zu SHA-256, einmal, ohne Salz* —
     dann ist der Hash ein Schlüssel, über den der Server die Zeile **findet**,
     statt sie zu suchen. Das ist eine **Abweichung von der Linie des
     Projekts** und gehört begründet, nicht nebenbei gemacht. Sag dazu auch, ob
     der zeitunabhängige Vergleich (`safeEqual`) hier überhaupt noch etwas tut,
     wenn nachgeschlagen und nicht verglichen wird.
   * **Braucht es die Spalte `zweck`?** Einladung und Rücksetzung tun am Ende
     dasselbe: ein Passwort setzen. *Ich neige dazu, sie zu behalten* — der
     Text am Bildschirm ist ein anderer („Willkommen" gegen „Neues Passwort
     setzen"), und ein Vorgang mit zwei Anlässen soll sagen können, welcher es
     war. Widersprich, wenn du meinst, dass eine Spalte ohne Wirkung auf den
     Ablauf eine zweite Wahrheit ist.
   * **Was wird aus `benutzt_am`?** Zeile stehen lassen mit Datum oder löschen?
     *Ich neige zum Stehenlassen* — es ist die einzige Spur, dass eine
     Einladung angenommen wurde, und das Sicherheitsprotokoll aus 0.8.90 wird
     sie brauchen. Dann braucht es aber ein **Aufräumen**, sonst wächst die
     Tabelle für immer.
   * **Wann wird aufgeräumt?** *Beim Start UND beim Öffnen der Karte* — die
     Bauform steht seit 0.8.70 als `raeumePapierkorbAuf()` da, zwei
     Aufrufstellen einer Funktion, jede im Prüfstand einzeln belegt.
     **Schreib sie ab, erfinde sie nicht neu.** Und **Stolperstein 60 und 119
     hängen unmittelbar daran**: `datetime('now')` löst nur auf die Sekunde
     auf, und mehrere Modifikatoren gehören als **getrennte Argumente**
     übergeben, nicht in einen String.

2. DER ZUGANG OHNE PASSWORT — SCHEMAFRAGE UND SICHERHEITSFRAGE IN EINEM.

   Heute legt der Admin einen Zugang **mit erstem Passwort** an. Mit der
   Einladung legt er ihn **ohne** an. `users.password_hash` ist `NOT NULL` —
   es muss also etwas drinstehen.

   *Ich neige zum **leeren Hash**, wie beim Grabstein.* **Und das ist heute
   schon sicher, wenn ich `auth.js` richtig lese:** `pruefeAnmeldung()` fällt
   bei leerem Hash auf `BLINDWERT` zurück, und den kennt niemand — die
   Anmeldung kann gar nicht gelingen. **Nachstellen, nicht glauben.** Trägt es,
   kommt **keine** neue Klemme dazu, und das ist die bessere Bauform: eine
   Sperre, die es nicht gibt, kann nicht vergessen werden. Trägt es nicht,
   gehört die Klemme hin — und dann an **zwei** Stellen mit je eigener
   Gegenprobe (Stolperstein 51 und 53).

   **KEIN VIERTER ZUSTAND.** `ZUSTAENDE` hat drei (`aktiv`, `gesperrt`,
   `geloescht`), und jede Stelle, die `status` liest, kennt sie. Ein
   `'eingeladen'` dazu hieße, sie alle anzufassen. *Ich neige dazu, „hat sich
   noch nie angemeldet" aus `last_login IS NULL` abzuleiten* — kein Schema,
   keine zweite Wahrheit. Sag, ob das trägt: **was ist mit jemandem, dessen
   Passwort zurückgesetzt wurde und der sich seitdem nicht gemeldet hat?**
   Der hat ein `last_login`, aber kein gültiges Passwort. Wenn die Ableitung
   daran zerbricht, sag es jetzt und nicht beim Bauen.

   **BLEIBT „PASSWORT ZURÜCKSETZEN" IN DER KARTE „ZUGÄNGE"?** Heute setzt der
   Admin dort direkt ein neues. Mit dem Token gibt es einen **zweiten Weg zum
   selben Ziel** — genau die Form von Stolperstein 47. *Ich neige dazu, beide
   zu behalten und die Karte den Link bevorzugen zu lassen:* der direkte Weg
   kommt ohne den Browser des anderen aus und ist damit nicht dasselbe in
   grün. Aber es gehört **entschieden und benannt**, nicht offengelassen.

   **`zugang.js` AUF DEM WIRT BLEIBT UNANGETASTET.** Es ist der Notweg, wenn
   niemand mehr hereinkommt, und es hat in 0.8.0 ausdrücklich den Einmalcode
   dieser Stufe ersetzt (Konzeptpapier, Abschnitt 9). Wer es anfasst, macht
   den Notweg von der Stufe abhängig, die ihn ersetzen sollte.

3. DIE ROUTE VOR DER ANMELDUNG — DIE SICHERHEITSFRAGE DER RUNDE.

   Der Token wird eingelöst, **bevor** jemand angemeldet ist. Das ist eine
   **schreibende Route mit der Art `'offen'`** — die vierte neben
   `POST /api/setup`, `POST /api/login` und `POST /api/logout`, und die erste
   seit langem. Eine offene schreibende Route ist im Prüfstand kein Sonderfall,
   aber sie ist einer im Kopf: dort steht keine Rechtefrage, also muss die
   Schranke **im Rumpf** stehen, und sie heißt Token.

   **FÜNF FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Greift die Anmeldebremse?** Ohne sie ist die Route ein Werkzeug zum
     Durchprobieren. `checkThrottle` schlüsselt heute nach **IP und
     Benutzername** — beim Token gibt es keinen Namen. *Ich neige zu: die
     IP-Hälfte greift unverändert, die Namenshälfte entfällt.* Nachsehen und
     sagen, ob das ohne Umbau geht.
   * **Sieht die Absage immer gleich aus?** Abgelaufen, schon benutzt,
     erfunden — drei verschiedene Meldungen sind drei Auskünfte an jemanden,
     der rät. *Aber ich will darüber streiten lassen:* ein **abgelaufener**
     Link ist der häufigste harmlose Fall, und eine gleichlautende Absage
     schickt ehrliche Leute in die Irre. Entscheide und begründe — und wenn du
     die Ausnahme machst, sag, was sie preisgibt.
   * **Was steht auf der Seite, bevor der Token geprüft ist?** Der
     Benutzername? Dann verrät ein geratener Token ihn. *Ich neige zu: der
     Server nennt den Namen erst, wenn der Token trägt* — das Formular selbst
     ist dann schon die Bestätigung.
   * **Wie kommt die Seite zustande?** Eine eigene HTML-Datei, ein Zustand der
     Anmeldeseite, ein Weg über `public/app.js`? *Ich neige zum Zustand der
     vorhandenen Anmeldeseite* — eine zweite ausgelieferte Seite hieße eine
     zweite Stelle für Kopfzeilen, CSP und die Sicherheitsregel aus
     Abschnitt 5a. Wenn du doch eine eigene Datei baust, gilt für sie
     **dieselbe** Regel, ohne Sonderweg.
   * **Der Mindestwert von zehn Zeichen** aus 0.5.0 gilt unverändert für jedes
     über einen Token gesetzte Passwort. Das ist keine Frage, das ist eine
     Feststellung — aber sie gehört geprüft, denn der Weg dorthin ist neu.

4. MEINE SITZUNGEN. Der Punkt, der für sich steht.

   `sessions` trägt heute `token` (Primärschlüssel), `user_id`, `created_at`
   und `last_seen`. **Mehr nicht.** Eine Liste daraus kann sagen: angemeldet
   am, zuletzt gesehen, und welche davon die eigene ist.

   **DIE SCHARFE FRAGE: WIE WIRD EINE SITZUNG ADRESSIERT, OHNE IHREN TOKEN IN
   EINE URL ZU SCHREIBEN?** Der Token ist Primärschlüssel **und** Geheimnis; in
   einem Pfad steht er im Zugriffsprotokoll, in der Verlaufsliste und
   womöglich im Referrer. Drei Wege:

   * **Eine Kennung, aus dem Token gerechnet und nie gespeichert** — etwa die
     ersten Stellen eines SHA-256. Kein Schema, nicht rückwärts auflösbar, und
     die Eindeutigkeit innerhalb **eines** Benutzers ist beim Lesen prüfbar.
   * **Eine eigene Spalte an `sessions`** — und das wäre der **sechste**
     Migrationsblock, denn eine Spalte trägt `CREATE TABLE IF NOT EXISTS` nicht
     nach (Stolperstein 13).
   * **Gar keine einzelne Adressierung**, nur „alle anderen beenden" — das gibt
     es als Nebenwirkung des Passwortwechsels bereits (`server.js`, `PUT
     /api/account`).

   *Ich neige zum ersten.* Sag, welchen du nimmst. **Wird es der zweite, ist
   das ein Grund anzuhalten und zu fragen, kein Grund, ihn einzubauen** — es
   wäre der erste Migrationsblock seit 0.8.50 und der sechste überhaupt.

   **UND DIE UNBEQUEME FRAGE DAZU: TAUGT DIE KARTE ÜBERHAUPT ETWAS?** Ohne
   Gerätekennung steht dort „angemeldet am 3. Mai, zuletzt gesehen vor zwei
   Stunden" — und damit lässt sich eine **fremde** Sitzung kaum von einer
   eigenen unterscheiden. Die ehrliche Antwort ist wahrscheinlich: nein, nicht
   sicher. Dann ist die Frage, ob eine Spalte für den Browserkopf dazugehört —
   **und die ist zugleich eine Datenschutzfrage.** Die Anlage speichert heute
   **keine** IP-Adresse und **keinen** Browserkopf; das ist eine Eigenschaft,
   kein Mangel, und passt zu „läuft offline im Heimnetz". *Ich neige dazu, bei
   nichts zu bleiben und die Karte ehrlich zu beschriften:* sie kann „diese
   hier" von „alle anderen" trennen, und mehr braucht der Knopf nicht.
   **Widersprich, wenn du meinst, dass die Karte damit wertlos ist** — dann
   bauen wir sie nicht halb, sondern gar nicht.

   **ZWEI KLEINERE FRAGEN:**

   * **Wo steht die Karte?** „Meine Sitzungen" ist persönlich, kein
     Systembereich für Admins. *Ich neige zu: beim eigenen Zugang, neben
     „Passwort ändern".*
   * **Sieht ein Admin fremde Sitzungen?** *Ich neige zu nein.* Für den
     Ernstfall gibt es das Sperren, und `setzeStatus` löscht die Sitzungen
     bereits mit. Ein zweiter Weg dorthin wäre wieder Stolperstein 47.

   **Der Cookiename kommt aus `auth.COOKIE_NAME` und wird nirgends
   abgeschrieben.** Das steht so im Stufenplan und im Konzeptpapier, seit
   0.8.20 der Name je nach `HINTER_PROXY` ein anderer ist. Ein Wächter über den
   Quelltext gehört dazu.

5. WAS ALLE VIER GEMEINSAM HABEN — UND WAS SIE AUSDRÜCKLICH NICHT TUN.

   * **Kein Mailversand.** Der gehört zu Stufe I und bleibt bei 0.9.0. Kein
     `nodemailer`, keine Absenderadresse, kein Port, keine Einstellung dafür.
   * **Keine Selbstanmeldung.** Der Schalter `registrierung` gehört in die
     Stufe, die sie baut, und das ist nicht diese.
   * **Kein Deckel auf offene Anfragen, keine eigene Zeitsperre für
     Anfragen** — beides ist Missbrauchsschutz für die **Selbstanmeldung**.
     Hier legt nur der Admin an, und der ist angemeldet.
   * **Kein `UNIQUE` auf `users.email`.** Die Entscheidung steht im
     Konzeptpapier, Abschnitt 10, und lautet: wenn überhaupt, dann als
     **partieller Index**, und in derselben Stufe wie die Prüfung im Code. In
     dieser Runde wird die Adresse nicht gebraucht — der Link geht von Hand.
   * **Der Papierkorb und die Sicherung werden nicht berührt.** Auch nicht „bei
     der Gelegenheit".
   * **Die Formatnummer bleibt bei 10.** Tokens stehen nicht im
     Austauschformat, Sitzungen auch nicht. **Sag es ausdrücklich**, damit
     klar ist, dass die Frage gestellt wurde.
   * **Keine neue Abhängigkeit.** Nicht eine. `crypto` ist in Node eingebaut.
   * **Kein neuer Eintrag im Vokabular. Die elf bleiben elf.** Aber eine
     Wortwahl ist zu treffen und durchzuhalten: **„Token" oder
     „Einladungslink"?** Dieselbe Frage wie „Backup oder Sicherung" in 0.8.70,
     und der Sprachwächter verlangt eine Antwort. Am Bildschirm heißt es
     vermutlich anders als im Quelltext — auch das ist eine Entscheidung, keine
     Nachlässigkeit.
   * **`F_ROUTEN` wächst.** Nenn im Vorschlag **jede** neue schreibende Route
     mit ihrer Art und die neue Zahl (heute **51**). Lesende Endpunkte stehen
     wie immer nicht darin — auch die vor der Anmeldung nicht.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies nach den **Lesewegen** oben. Nicht mehr, und vor allem nicht am Stück.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst:
   `auth.js` (`pruefeAnmeldung`, `BLINDWERT`, `legeSitzungAn`, `destroySession`,
   `pruneSessions`, `checkThrottle`, `hashePasswort`, `pruefeVorgaben`,
   `setzeStatus`, `entferneZugang`, `COOKIE_NAME`), `db.js` (die DDL zu `users`
   und `sessions` samt ihrer Kommentare, `idx_sessions_user`), `server.js` (die
   Anmelderoute, `PUT /api/account` und die Stelle, an der es fremde Sitzungen
   beendet, die drei Zugangsrouten samt `zielZugangFrei`), `public/app.js` (die
   Anmeldeseite und die Karte „Zugänge"), `pruefung.js` (`F_ROUTEN`, die
   Gruppen zu Anmeldung, Bremse und Zugängen, `baueDom` samt Mock).
3. Besprich, was du ändern willst, und warte auf meine Bestätigung. **Nicht
   sofort bauen.** Die Fragen aus den Punkten 1 bis 4 gehören hierher, nicht in
   den Bau: der Hash, `zweck`, `benutzt_am`, das Aufräumen, der leere Hash, der
   vierte Zustand, der zweite Rücksetzweg, die Bremse, die Absage, der Name vor
   der Prüfung, die Bauform der Seite, die Adressierung einer Sitzung, der
   Browserkopf und der Ort der Karte. **Unstimmigkeiten zwischen Konzeptpapier
   und Quelltext sagst du jetzt** — das Papier ist an mehreren Stellen älter als
   der Code.
4. Erst nach meinem OK bauen — gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
5. Neue Prüfungen in `pruefung.js`. **Das Konzeptpapier hat keine Prüfliste.**
   Du stellst sie selbst auf, und sie ist der **erste** Teil des Vorschlags,
   nicht der letzte. Jede mit Gegenprobe: Regel probeweise zurückbauen, zeigen,
   dass genau diese Prüfung **namentlich** rot wird. Vor dem Deuten roter Punkte
   per `diff` belegen, dass der Quelltext der ist, den du zu prüfen glaubst.
   **Die Gegenproben laufen in einer Kopie des Arbeitsbaums** (Stolperstein 100),
   **und der Treiber beendet nach jedem Lauf die ganze Prozessgruppe**
   (Stolperstein 122) — sonst hängt der nächste Lauf an einem alten Server.
   **Was mindestens hineingehört**, und die Liste ist keine Obergrenze:
   * **der Rundlauf, und er ist die tragende Prüfung der Runde:** Admin lädt
     ein → der Link führt zum Formular → das Passwort wird gesetzt → die
     Anmeldung gelingt → **derselbe Link ein zweites Mal gelingt nicht**;
   * **die sieben Tage an beiden Seiten**, mit von Hand gesetztem Ausgangswert
     (Stolperstein 60 und 119);
   * **beim Einlösen fallen alle Sitzungen dieses Benutzers** — mit einer
     vorbereiteten zweiten Sitzung, die danach **wirklich** abgewiesen wird,
     und einer Sitzung eines **anderen** Benutzers, die stehen bleibt;
   * **ein Zugang ohne Passwort kann sich nicht anmelden**, und zwar mit jedem
     Passwort — auch mit dem leeren und mit dem Wert, der im Feld steht;
   * **gespeichert ist der Hash, nicht der Token:** eine Nachschau in der
     Datenbank, dass der Klartext dort **nirgends** steht;
   * **die Absage bei abgelaufen, benutzt und erfunden** — so, wie du sie
     entschieden hast, und mit der Begründung im Prüfungsnamen;
   * **die Bremse greift vor der Anmeldung**, belegt am Zählerstand, nicht nur
     an der Meldung;
   * **die Rechte am Einladen in beide Richtungen**, mit zwei vorbereiteten
     Sitzungen, zu jeder Verweigerung der Erfolgsfall daneben und der Nachschau
     in der Datenbank, dass **nichts geschrieben** wurde — **und ein Admin ohne
     Eigentümerrolle gehört dazu**;
   * **die Rollenleiter gilt auch hier:** ein Admin lädt keinen Eigentümer ein
     und kommt nicht an seinesgleichen heran;
   * **„Meine Sitzungen" zeigt nur die eigenen** — mit zwei Benutzern, die je
     zwei Sitzungen haben, und der Nachschau, dass keine fremde Zeile
     durchkommt;
   * **die eigene Sitzung ist markiert** und fällt nicht mit „alle anderen";
   * **der Token steht in keiner Antwort an den Bildschirm** außer der einen,
     die ihn erzeugt — geprüft am vollständigen Antwortrumpf, nicht an einem
     Feld;
   * **`F_ROUTEN` trägt jede neue schreibende Route mit ihrer Art**, und die
     **Zahl** wird ausdrücklich geprüft;
   * **ein Wächter über den Quelltext**, dass der Cookiename nirgends
     abgeschrieben steht, samt Gegenprobe, dass er überhaupt noch Code liest
     (Stolperstein 106);
   * **der Sprachwächter bleibt grün**, und die gewählte Wortwahl steht
     durchgehend.
6. **Ein Migrationsabschnitt im Prüfstand nur, wenn es einen Migrationsblock
   gibt.** Nach dem Stand der Dinge gibt es keinen — dann gehört stattdessen
   die **Probe selbst** hinein: Tabelle von Hand entfernen, Server starten, sie
   ist wieder da. Die Probe „Ein Sprung von 0.8.20 fährt ALLE Migrationen in
   einem Start" wird nur erweitert, wenn wirklich eine dazukommt. **Sag es im
   Vorschlag ausdrücklich**, damit klar ist, dass die Frage gestellt und
   beantwortet wurde.
7. Für die Rechteprüfung gilt unverändert: zwei vorbereitete Sitzungen, zu jeder
   Verweigerung der Erfolgsfall daneben und die Nachschau, dass nichts
   geschrieben wurde. **Und ein Admin ohne Eigentümerrolle gehört dazu** — ohne
   ihn ließe sich „Eigentümer" von „Admin" gar nicht unterscheiden.
8. **Für den Mock in `baueDom` gilt Stolperstein 90 und 115:** er muss die
   Sitzungsliste in **beiden** Zuständen liefern — eine einzelne und mehrere —
   und seine Antwort beim Beenden **wirklich** ändern. Wer die Zahlen einer
   Prüflage misst, misst sie an einem frischen Aufbau. **Und die Lehre aus
   0.8.40 bis 0.8.70 gilt weiter:** eine Prüfung darauf, dass an einer Zeile
   etwas **nicht** steht, gehört hinter eine Prüfung darauf, dass es die Zeile
   überhaupt gibt (Stolperstein 81). **Jede Lesestelle wird abgefangen** — fehlt
   der Gegenstand, sollen die Prüfungen rot werden, nicht der Lauf abreißen
   (Stolperstein 103).
9. Neue Bedienelemente werden per `dispatchEvent` gedrückt, samt Durchlauf des
   Event Loops. `.click()` genügt nicht. **Und eine Karte, die sich beim
   Einhängen selbst nachlädt, reißt den Lauf ab** (Stolperstein 118) — was
   „Meine Sitzungen" braucht, wird dort geholt, wo der Bereich ohnehin lädt.
10. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.** Fachbegriffe werden nicht
  zwanghaft eingedeutscht; die eigenen Bilder des Projekts bleiben.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens.
  Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.8.80` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`) — sonst wird der Prüfstand
  namentlich rot.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein. Einzige
  Ausnahme sind die Marken aus der Bauregel.
* **Keine neue Abhängigkeit.** Nicht eine.
* Nicht anfassen ohne Rückfrage: Farbschema, Anmeldebremse **in ihren
  Kennwerten** (die Anwendung auf eine neue Route ist ausdrücklich Teil des
  Auftrags, das Herunterschrauben der Schwellen nicht), Verschlüsselungsmodell,
  Dateiname `katalog.sqlite`, die Einstellung `HINTER_PROXY` und alles, was
  daran hängt, die Content-Security-Policy, die Sortierung der Übersicht, das
  Austauschformat, `zugang.js`, der Papierkorb und die Sicherung.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106) — mit der einen Ausnahme, die seit 0.8.60 dasteht: der
  Sprachwächter sieht die Kommentare ausdrücklich an.
* **Zu jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine
  Prüfung an der echten Antwort** (Stolperstein 102).
* Wird es zu viel für einen Durchgang: **Haltepunkt nach Punkt 3** — dann steht
  der Token samt Einlösung, und „Meine Sitzungen" folgt in einer eigenen Runde.
  Sag vorher Bescheid, wenn du das kommen siehst. **Punkt 4 hängt nicht an
  1 bis 3** und ist deshalb der saubere Schnitt; umgekehrt geht es nicht.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **In dieser Runde steht
  die Antwort schon halb da** — eine neue Tabelle war in 0.8.70 kein Fall
  dafür. Prüf es trotzdem an dieser Tabelle.
* Das Schema bleibt vollständige DDL in `db.js`. Ein Index über
  `CREATE INDEX IF NOT EXISTS` ist KEIN Fall dafür, eine Tabelle über
  `CREATE TABLE IF NOT EXISTS` nach dem Beleg aus 0.8.70 ebenso wenig.
* Einmaliger Migrationscode steht gebündelt in einer benannten Funktion je
  Version, mit Marken, samt eigenem Prüfabschnitt. Die Marke lautet
  `// MIGRATION 0.8.x — ENTFAELLT MIT 1.0`, die Funktion hieße `migration0880()`.
* Jeder markierte Block bekommt sofort einen Eintrag unter „Vorgemerkt für 1.0"
  im Projektstand.

**Es bleibt bei fünf markierten Blöcken, wenn die Proben das hergeben.** Kommt
über Punkt 4 doch ein sechster dazu, ist das ein Grund **anzuhalten und zu
fragen** — nicht, ihn einzubauen.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; ein Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.80.md` liegt im Branch, als Rohstoff für die
  Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit Begründung,
  neue Stolpersteine mit Nummer und Kernsatz (**die Zählung setzt bei 123
  fort**), die Gegenprobentabelle, Prüfungszahlen vorher/nachher (vorher:
  **2381**), Offengebliebenes.
* Die Zeile „0.8.80 — Fingerprint `…`" gehört ins Änderungsprotokoll, ZULETZT
  gebildet, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, denn `server.js` lädt sie.
  Diese Runde fasst voraussichtlich `db.js`, `auth.js`, `server.js`,
  `public/app.js` und `public/style.css` an; `anhaenge.js`, `keys.js` und
  `zugang.js` bleiben unberührt.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  wieder als PFLICHT** — es ist eine Datenbankstufe, auch ohne Migrationsblock.
  Der Weg gehört in den Chat, mit den Befehlen und dem erwarteten Ergebnis.
  **Seit 0.8.70 gibt es die Sicherung auf Knopfdruck** — nenn sie als den
  bequemeren der beiden Wege, aber sag dazu, dass sie ohne `.env` wertlos ist.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. Für diese Runde ausdrücklich dabei: die Abfrage
  `SELECT name FROM sqlite_master WHERE type='table'` im Container (erwartet:
  `tokens` steht da, **ohne Migrationsblock**), eine Einladung am laufenden
  Betrieb samt Einlösen aus einem zweiten Browser, der Nachweis, dass der
  Klartext des Tokens **nicht** in der Datenbank steht, und der
  Fingerprint-Vergleich.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

Diese drei Punkte sind Teil des Auftrags und werden am Ende abgearbeitet, nach
dem grünen Prüflauf:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Also:
  Projektstand (Kopf, Betriebsstand samt Einspielweg, **Abschnitt 3 Zugang und
  Verschlüsselung**, Funktionsumfang, Abschnitt 5 um die Entscheidungen dieser
  Runde, Stolpersteine, Prüfstand, Versionsgeschichte, Stufenplan, Abschnitt 11)
  und das **Mehrbenutzer-Konzeptpapier** — dort wird **Stufe H als erledigt
  eingetragen**, mit jeder Stelle, an der anders gebaut wurde als beschrieben,
  und Abschnitt 10 behält nur noch, was zu Stufe I gehört. Dazu die README
  (Zugänge anlegen, der neue Weg über den Link, „Meine Sitzungen"). Der
  Projektstand und das Mehrbenutzerpapier tragen die Version im Dateinamen und
  werden entsprechend umbenannt (`git mv`, damit die Historie erhalten bleibt);
  alle Verweise darauf sind nachzuziehen.
* **`Doku/Changelog.md` bekommt einen Abschnitt für diese Stufe** — was sich
  seit der letzten Version geändert hat. **Kurz und prägnant, wie bei den
  meisten Softwareanbietern: nicht zu viel aus dem Quelltext, sondern informativ
  für jemanden, der sich fragt, was das Update für ihn mitbringt.** Drei Blöcke
  wie beim vorhandenen Eintrag: was neu ist, was gleich bleibt, was beim
  Einspielen zu beachten ist.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Stufe.**
  Den weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber
  getestet ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **der
  Auftrag der Vorrunde wird dabei entfernt** — es liegt immer nur einer im
  Repo.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **0.8.90 — Schwere Eingriffe.** Re-Authentifizierung, Sicherheitsprotokoll,
  Schlüssel wechseln. **Diese Runde arbeitet ihr vor:** `tokens.benutzt_am` ist
  der erste Eintrag, den ein Sicherheitsprotokoll führen wollte, und die
  Re-Authentifizierung wird dieselbe Frage stellen wie Punkt 3 — was darf eine
  Route sagen, bevor sie weiß, wer fragt.
* **0.9.0 — Stufe I, Mailversand und Selbstanmeldung.** Sie erbt den Token aus
  dieser Runde unverändert; was hier an Form entschieden wird, gilt dort weiter.
  **Der Sprung auf 0.9.0 ist der größte im ganzen Plan** — ab dort baut die
  Anlage von sich aus eine Verbindung nach außen auf.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird bei jedem
  Seitenaufbau gebraucht; die Frage, wie er nicht ständig neu abgefragt wird,
  gehört in eine eigene Runde.
* **Teil II des Videopapiers — große Dateien bis 2 GB**, beschlossen für 1.1.0.
  Die Vorgabe aus 0.8.70 steht dort: eine Datei über rund 950 MB passt nicht in
  eine Zelle und teilt sich auf mehrere `papierkorb_bytes.nr` auf.
* **Die Vorschau der Rangfolge im Systembereich** aus 0.8.40 ist weiterhin
  offen und weiterhin vorgemerkt.
* **4.2 „Abgelehnt mit Datum und Begründung"** aus dem Ideenpapier ist
  weiterhin offen und weiterhin nicht zusammengelegt.
* **Eine Trusted-Proxy-Adressliste** aus 0.8.20 ist weiterhin nicht gebaut und
  bleibt vorgemerkt.
* **Die Tastaturbedienung beim Sortieren** bleibt für 1.0 vorgemerkt und
  betrifft seit 0.8.50 auch Videos.
* **Die Marke `qt  ` am QuickTime-Video** ist aus 0.8.50 unbelegt geblieben —
  es gab kein Gerät dafür.
* **Der Sprachwächter sieht die Namen von Prüfungen nicht an** (Befund aus
  0.8.60): sie stehen in Strings, nicht in Kommentaren. Wer dort ein
  altes Wort einträgt, fällt nicht auf.
