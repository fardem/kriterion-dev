Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Ideenpapier, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht
an einer Kopie.

AUFTRAG: **Version 0.8.90 — „Schwere Eingriffe."**
DIES IST **KEINE** STUFE DES MEHRBENUTZERBETRIEBS. Der ist mit Stufe H (0.8.80)
bis auf **Stufe I** gebaut, und die bleibt bei 0.9.0. Diese Runde liegt
dazwischen und **arbeitet ihr vor** — an drei Stellen, die alle vier Punkte
unten wieder aufgreifen.

Ausgearbeitet liegt die Sache **nicht** an einer Stelle, und das ist der
Unterschied zur Vorrunde: **das Konzeptpapier sagt zu dieser Runde nichts**,
denn sie gehört nicht zum Mehrbenutzerbetrieb. Was bindet, steht im
**Projektstand**, und zwar an drei Stellen: Abschnitt 11 („Was die Anlage als
Ganzes trifft, wird ein zweites Mal bestätigt" und „Ein Sicherheitsprotokoll
ist kein Änderungsverlauf" — beide ausdrücklich mit „ab 0.8.90"),
Abschnitt 3 (Zugang und Verschlüsselung — **für diese Runde der wichtigste**)
und Abschnitt 10 (Stufenplan). **Das Ideenpapier sagt zu dieser Runde
nichts** — such dort nicht. Dieser Auftrag schneidet die drei Stellen in
Punkte, setzt die Zahlen dieser Version ein und benennt die Fragen, die vor dem
Bauen zu beantworten sind.

**Vier Punkte. Die ersten beiden sind ein Stück und hängen aneinander** — das
Protokoll ist die Tabelle, in die die Re-Authentifizierung schreibt. **Der
dritte ist der schwerste und der gefährlichste**, der vierte steht für sich und
ist der kleinste.

WARUM DIESE RUNDE JETZT KOMMT: 0.8.80 („Einladung, Rücksetzung, Sitzungen") ist
gebaut, Fingerprint `a835ac92`, **2661 Prüfungen**, `F_ROUTEN` bei **56**,
Formatnummer **10**, **fünf** markierte Migrationsblöcke, Stolpersteine bis
**127**, sechzehn Karten im Systembereich, elf Vokabulareinträge. Mit Stufe H
ist der Mehrbenutzerbetrieb bis auf I gebaut; der Stufenplan hat für 0.8.90
keine Bindung nach vorn offen — sie ist schlicht die nächste.

WAS SICH ÄNDERT, IN EINEM SATZ: Wer die Anlage **als Ganzes** anfasst, gibt sein
Passwort noch einmal ein — und was dabei geschieht, steht hinterher nachlesbar
da.

**DIE TRAGENDE FRAGE DIESER RUNDE STEHT VOR DEM ERSTEN PUNKT: WOGEGEN
VERTEIDIGT DAS HIER EIGENTLICH?** Nicht gegen einen Fremden — der kommt ohne
Passwort gar nicht herein. Sondern gegen **eine fremde offene Sitzung**: einen
Bildschirm, der unbeaufsichtigt stehen blieb, einen gestohlenen Cookie, einen
Rechner, an dem jemand anderes sitzt. `aendereZugang()` wendet dieses Prinzip
seit 0.5.0 an und schreibt es auch hin — *„das bisherige Passwort ist Pflicht —
sonst genügte eine fremde offene Sitzung, um den Zugang zu übernehmen."* **Es
fehlt nur bei den schweren Wegen.** Wer das im Kopf behält, beantwortet die
meisten Fragen unten von selbst: die Schranke gehört dorthin, wo eine
übernommene Sitzung **bleibenden** Schaden anrichtet, und nirgendwo sonst.

---

LESEWEGE — WAS DU LIEST UND WAS AUSDRÜCKLICH NICHT:

Der Prüfstand hat über 16.000 Zeilen, der Projektstand über 4.600. **Beide
werden nicht am Stück gelesen.** Das ist keine Bequemlichkeit, sondern die
Bedingung dafür, dass diese Runde in einem Durchgang fertig wird.

* **Ganz lesen:** diesen Auftrag; im Projektstand die **Abschnitte 3 und 11**.
* **Abschnittsweise lesen, über die Überschriften angesteuert:** Projektstand
  Abschnitt 2 (Betriebsstand und Einspielweg), 4 (Funktionsumfang, besonders
  die Karten „Kennzahlen", „Zugänge", „Export", „Import" und „Sicherung"),
  5 (Entscheidungen — vor allem „Löschen entwertet", die Rollenleiter und die
  zehn Einträge aus 0.8.80), 6 (Stolpersteine — **13, 47, 51, 53, 60, 74, 81,
  103, 106, 119, 124 bis 127 sind die dieser Runde**), 7 (Prüfstand),
  8 (offene Betriebspunkte — dort steht ein Merksatz zu Kontrollausgaben, der
  Punkt 3 unmittelbar betrifft), 10 (Stufenplan), 12 (Arbeitsweise samt
  Sprachregel).
* **Gezielt greppen, nie am Stück lesen:** `pruefung.js`. Was du brauchst,
  findest du über `gruppe('…')`, über `F_ROUTEN` und über `baueDom`.
* **Nicht lesen, solange keine bestimmte Frage dorthin führt:** die
  Änderungsprotokolle `0.8.6` bis `0.8.71`. Sie sind Rohstoff vergangener
  Runden; alles, was daraus bindet, steht im Projektstand. **`0.8.80` ist die
  eine Ausnahme** — dort stehen die Antworten auf Fragen, die diese Runde
  wieder stellt (der Hash, die eine Absage, das Auswahlfeld). Ebenso das
  Videopapier und das Konzeptpapier: diese Runde berührt keines von beiden.
* **Der Quelltext, den es wirklich braucht:** `keys.js` **ganz** (klein, und er
  ist die Datei von Punkt 3), `auth.js` die Passwortprüfung, `pruefeVorgaben`,
  `setzeNeuesPasswort`, `setzeRolle`, `setzeStatus`, `entferneZugang`, die
  Token-Hälfte und `beendeAndereSitzungen`, `db.js` die DDL samt der fünf
  Migrationsblöcke, `server.js` die sechs schweren Wege (`PUT /api/account`,
  die drei Zugangsrouten, `POST /api/import`, `GET /api/export`) sowie
  `GET /api/stats` (dort steht der Schlüsselwert), `public/app.js` die Karten
  „Kennzahlen" und „Zugänge".

---

1. DAS PROTOKOLL — DIE TABELLE, IN DIE ALLES ANDERE SCHREIBT.

   **Es hält fest, wer Zugang hatte und wer die Anlage als Ganzes angefasst
   hat.** So steht es im Projektstand, Abschnitt 11, und daran wird nicht
   gerüttelt: **es ist KEIN Änderungsverlauf.** Kein Eintragstitel, kein
   Kommentartext, keine Bewertung, keine Note. Dieselbe Trennlinie wie überall
   — was die **Anlage** betrifft, nicht was jemand **gesagt** hat.

   **DIE SCHEMAFRAGE IST ZUM DRITTEN MAL DIESELBE.** Es ist eine **neue
   Tabelle**, und 0.8.70 wie 0.8.80 haben belegt, dass `CREATE TABLE IF NOT
   EXISTS` eine fehlende Tabelle bei jedem Start anlegt. Es bliebe also bei
   **fünf** markierten Blöcken und **keinem** neuen Eintrag unter „Vorgemerkt
   für 1.0". **Trotzdem: nachstellen, nicht abschreiben.** Dieselbe Probe wie
   zweimal zuvor, an dieser Tabelle. Zwei Belege sind ein guter Grund, es zu
   erwarten — kein Grund, es nicht zu prüfen.

   **SECHS FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Wie heißt das Ding?** Und das ist keine Nebensache: **„Protokoll" ist im
     Projekt vergeben.** So heißt `docker compose logs` — im Einspielweg, in
     Abschnitt 8, in der README („Nach jedem Einspielen lohnt ein Blick ins
     Protokoll"). Zwei verschiedene Dinge unter demselben Wort sind Stolperstein
     47 in der Sprache. *Ich neige zu „Sicherheitsprotokoll" am Bildschirm und
     `sicherheitsprotokoll` im Quelltext* — lang, aber eindeutig. Widersprich,
     wenn dir etwas Besseres einfällt; **eine Antwort ist Pflicht**, und der
     Sprachwächter bekommt einen engen eigenen Wächter daneben, wie bei
     „Sicherung" und bei „Link".
   * **Welche Vorgänge kommen hinein?** *Ich neige zu genau denen aus
     Abschnitt 11* — Export, Import, Rolle vergeben, fremdes Passwort
     zurücksetzen, Zugang entfernen, Schlüssel wechseln — **plus vier, die es
     seit 0.8.0 bzw. 0.8.80 gibt und die dieselbe Grenze berühren:** Anmeldung
     gelungen, Anmeldung gescheitert, Zugang gesperrt/freigegeben, Link erzeugt
     und Link eingelöst. Sag, welche du nimmst, und **begründe jede, die du
     weglässt**. Die scharfe Frage dabei: **gehört die gescheiterte Anmeldung
     hinein?** Sie ist die einzige, die ein Fremder auslösen kann — und damit
     die einzige, mit der sich die Tabelle von außen vollschreiben lässt.
   * **Was steht in einer Zeile?** Zeitpunkt, wer, was, an wem — und sonst?
     **Keine IP-Adresse und kein Browserkopf**: das ist seit 0.8.80 eine
     Eigenschaft der Anlage und kein Mangel, und eine Runde, die sie nebenbei
     aufgibt, hätte die Entscheidung nicht getroffen, sondern übergangen. Wenn
     du meinst, dass ein Sicherheitsprotokoll ohne Adresse wertlos ist,
     **sag es jetzt** — dann ist das eine Datenschutzfrage und gehört
     entschieden, nicht eingebaut.
   * **Wie lange bleibt es stehen?** `raeumePapierkorbAuf()` und
     `raeumeTokensAuf()` stehen als Bauform da, zwei Aufrufstellen einer
     Funktion, jede im Prüfstand einzeln belegt. **Schreib sie ab, erfinde sie
     nicht neu.** *Ich neige zu einer Frist, aber zu einer längeren als
     dreißig Tage* — ein Protokoll, das den Vorfall vergisst, bevor jemand ihn
     bemerkt, ist keins. **Stolperstein 60 und 119 hängen unmittelbar daran.**
   * **Wer darf es sehen?** *Ich neige zum Eigentümer allein.* Es nennt
     Namen und Vorgänge über andere Zugänge; ein Admin, der es liest, sieht die
     Verwaltungsvorgänge des Eigentümers. Widersprich, wenn du meinst, der Admin
     gehöre dazu — aber dann sag, was er sehen darf und was nicht, und **eine
     Liste, die zwei verschiedene Antworten kennt, ist eine zweite Wahrheit.**
   * **Kann man es löschen?** *Ich neige zu nein* — ein Protokoll, das der
     Betroffene selbst wegräumen kann, ist keins. Dann ist das Aufräumen nach
     Frist der **einzige** Weg hinaus, und das gehört benannt.

2. DIE RE-AUTHENTIFIZIERUNG — DIE SCHRANKE.

   **Was die Anlage als Ganzes trifft, wird ein zweites Mal bestätigt.** Die
   Liste steht im Projektstand, Abschnitt 11, und die Grenze ist dort schon
   gezogen: *„nicht ‚gefährlich', sondern dieselbe, an der schon die
   Eigentümerrolle liegt."*

   **DIE SCHEMAFRAGE IST HIER DIE HEIKELSTE DER GANZEN RUNDE.** Eine Sitzung,
   die sich „vor fünf Minuten zweitbestätigt hat", braucht einen Ort für diese
   Angabe. Eine **Spalte an `sessions`** wäre der **sechste** Migrationsblock —
   `CREATE TABLE IF NOT EXISTS` trägt eine Spalte nicht nach (Stolperstein 13).
   **Wird es der sechste, ist das ein Grund anzuhalten und zu fragen, kein
   Grund, ihn einzubauen.**

   *Ich neige deshalb zu gar keinem Zustand:* **das Passwort reist im Rumpf der
   Handlung selbst mit**, wird in derselben Anfrage geprüft und danach
   vergessen — genau die Form, die `aendereZugang()` seit 0.5.0 hat. Kein
   Schema, keine Frist, keine zweite Wahrheit darüber, wann eine Bestätigung
   abläuft. Der Preis, ehrlich benannt: wer drei Zugänge nacheinander entfernt,
   tippt dreimal. **Sag, ob dir das den Umbau wert erscheint** — und wenn du
   ein Zeitfenster willst, sag, wo es liegt und warum es keine Spalte braucht.

   **SECHS FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Welche Wege genau?** Die sechs aus Abschnitt 11 sind gesetzt. *Aber
     0.8.80 hat zwei neue gebracht, die dieselbe Grenze berühren:* **einen
     Einladungs- oder Rücksetzlink erzeugen** übergibt ein Passwortersatz auf
     Zeit, und **einen Zugang ohne Passwort anlegen** übergibt einen Zugang, in
     den der Anlegende selbst nie hereinkommt. Gehören sie dazu? *Ich neige
     zu ja beim Link, nein beim Anlegen* — der Link trifft einen **bestehenden**
     Zugang, das Anlegen erzeugt einen neuen und nimmt niemandem etwas.
     Widersprich, wenn du das anders siehst.
   * **Was passiert mit dem Passwort im Rumpf?** Es steht dann in der Anfrage,
     im Zugriffsprotokoll des Proxys womöglich auch. **Nein: nur wenn es in der
     Adresse stünde.** Im Rumpf eines POST steht es nicht im Zugriffsprotokoll —
     aber das gehört **nachgesehen und hingeschrieben**, nicht angenommen. Und
     die Anmeldebremse: greift sie hier? *Ich neige zu ja, dieselbe wie
     überall* — sonst wäre die Schranke ein Weg, ein Passwort ungebremst
     durchzuprobieren, und zwar **hinter** der Anmeldung, wo niemand hinsieht.
   * **Wie sieht die Absage aus?** Hier ist die Lage **anders als bei den
     Token in 0.8.80**, und der Unterschied gehört benannt: dort wusste der
     Server nicht, wer fragt, und die eine Absage schützte vor dem Durchprobieren.
     Hier ist der Fragende **angemeldet und namentlich bekannt** — eine
     verschleierte Absage schützt niemanden und verwirrt nur. *Ich neige zu:
     „Das Passwort stimmt nicht", klar und deutlich.* Sag, ob du das genauso
     siehst; **eine Regel, die in zwei Runden verschieden ausfällt, gehört
     erklärt, nicht stillschweigend umgedreht.**
   * **Was steht am Bildschirm?** Eine Abfrage vor jedem der sechs bis acht
     Wege — als `prompt()` wie beim Passwortzurücksetzen, als Feld in der
     Karte, als eigener Dialog? *Ich neige zu einem eigenen Dialog nach dem
     Muster der vorhandenen Bestätigungen*, mit dem Satz daneben, **warum**
     gefragt wird. Ein Passwortfeld ohne Begründung sieht aus wie eine Schikane.
   * **Was ist mit `zugang.js`?** Es läuft auf dem Wirt und tut vier von diesen
     Dingen ohne jede Rückfrage. **Das bleibt so, und der Grund steht schon
     da:** Zugriff auf den Wirt **ist** die Berechtigung, eine Rechtefrage dort
     wäre eine Kulisse. **Aber schreibt es ins Protokoll?** *Ich neige zu ja* —
     sonst hat der Notweg als einziger keine Spur, und genau er ist der, den
     man hinterher nachlesen möchte.
   * **Und die Ersteinrichtung?** `POST /api/setup` legt den Eigentümer an und
     meldet gleich an. Es gibt zu diesem Zeitpunkt kein bisheriges Passwort.
     Das ist offensichtlich — **es gehört trotzdem geprüft**, denn die Route
     liegt vor der Anmeldung und ist die vierte ihrer Art.

3. DER SCHLÜSSELWECHSEL — DER SCHWERSTE EINGRIFF, UND DER EINZIGE, DER ALLES
   VERLIEREN KANN.

   **Eines ist schon nachgestellt und muss nicht mehr geprüft werden:**
   `PRAGMA rekey` läuft in `better-sqlite3-multiple-ciphers` durch, die Datei
   ist danach mit dem **neuen** Schlüssel lesbar und mit dem **alten** nicht
   mehr. Das ist die gute Nachricht. **Die schlechte steht in `keys.js`, und
   sie ist der eigentliche Punkt dieser Aufgabe.**

   `loadKey()` liefert `{ hex, fromEnv }` — die Anlage **weiß**, woher ihr
   Schlüssel kommt. Und daran hängt alles:

   * **Kam er aus `data/encryption.key`**, kann die Anlage den Wechsel
     **vollständig zu Ende führen**: neue Datei schreiben, fertig.
   * **Kam er aus der `.env`**, kann sie es **nicht**. Sie kennt den neuen Wert,
     aber die `.env` liegt außerhalb ihrer Reichweite — sie ist per
     `.dockerignore` nicht einmal im Image. **Ab dem Augenblick, in dem der
     Wechsel gelingt, ist die `.env` falsch**, und der nächste
     `docker compose up -d --build` öffnet die Datenbank nicht mehr. Das ist
     kein Schönheitsfehler, das ist der Totalverlust, den die README an drei
     Stellen ankündigt.

   **FÜNF FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Was tut die Anlage im `.env`-Fall?** Drei Möglichkeiten: **abweisen**
     („Schlüsselwechsel geht nur, wenn der Schlüssel neben der Datenbank
     liegt"), **tun und den neuen Wert zum Abschreiben hinlegen**, oder
     **tun und vorher ein Häkchen verlangen** („Ich habe verstanden, dass ich
     die `.env` sofort nachziehen muss"). *Ich neige zum dritten* — aber das
     ist die Entscheidung dieser Runde, und ich will die Begründung lesen. Wer
     abweist, macht den Wechsel genau dort unmöglich, wo die Anlage **richtig**
     eingerichtet ist; das wäre eine Strafe für den sicheren Zustand.
   * **Was passiert bei einem Abbruch mittendrin?** Strom weg, Container
     getötet, Platte voll. `PRAGMA rekey` schreibt die ganze Datei um. **Das
     ist nachzustellen, nicht zu vermuten** — und wenn dabei ein halber Zustand
     entstehen kann, gehört eine Sicherung **davor** in den Ablauf, nicht in
     die Dokumentation. Erinnerung an Stolperstein 8: *eine halbfertige
     Zieldatei nach einem Fehlschlag entfernen* — und an die schärfere Form aus
     0.8.70: **der Fall entsteht gar nicht erst.**
   * **Steht die Anlage dabei still?** Die Sicherung auf Knopfdruck tut das
     schon (`VACUUM INTO`), und die Karte sagt es vorher mit einer Schätzung in
     Sekunden. *Ich neige dazu, es genauso zu machen* — messen, sagen,
     stillstehen. **Und die Sitzungen?** Ein Schlüsselwechsel ändert am
     Passwort nichts; es gibt keinen Grund, irgendjemanden abzumelden. Sag, ob
     du das auch so siehst.
   * **Was ist mit den Sicherungen, die schon dastehen?** Sie sind mit dem
     **alten** Schlüssel verschlüsselt und bleiben es. **Ab dem Wechsel gibt es
     zwei Schlüssel im Umlauf**, und wer die ältere Sicherung je zurückspielt,
     braucht den alten. *Das ist der Punkt, an dem die Karte „Sicherung" und
     die Karte für den Wechsel etwas voneinander wissen müssen* — und es ist
     die unangenehmste Falle der ganzen Runde. Sag, wie du sie entschärfst.
   * **Wie wird der neue Wert angezeigt?** Der Systembereich zeigt den
     **aktuellen** Schlüssel schon zum Abschreiben, nur für den Eigentümer. Der
     neue geht denselben Weg. **Aber Abschnitt 8 des Projektstands trägt einen
     Merksatz, der genau hierher gehört:** *Kontrollausgaben laufen über die
     Länge und das letzte Zeichen, nie über den Inhalt* — er steht dort, weil
     ein Schlüssel schon zweimal aus der Anlage herausgeraten ist. Er gilt für
     **Protokollzeilen und Prüfausgaben**, nicht für die eine Stelle am
     Bildschirm, die zum Abschreiben da ist. **Halte beides auseinander**, und
     halte den Schlüssel aus Punkt 1 heraus: **eine Protokollzeile nennt, DASS
     gewechselt wurde, nie WOHIN.**

4. DIE ÖFFENTLICHE ADRESSE. Der Punkt, der für sich steht.

   Seit 0.8.80 baut **der Browser des Admins** den Einladungslink aus
   `location`; der Server gibt nur den Token heraus. Das ist sicher und braucht
   keine Einstellung — **und es hat genau eine Bruchstelle:** die Adresse, unter
   der der Admin zugreift, ist nicht immer die, die der Empfänger benutzen soll.
   Wer über `http://192.168.1.50:3100` arbeitet und einen Link nach draußen gibt,
   gibt einen Link ins Leere.

   **ENTSCHIEDEN IST DAS SCHON, UND ZWAR SO:**

   * Eine **optionale** Einstellung **`OEFFENTLICHE_ADRESSE` in der `.env`**.
   * **Leer (Vorgabe): alles bleibt wie heute** — der Browser baut. „Läuft im
     Heimnetz" braucht keine Konfiguration, und das soll so bleiben.
   * **Gesetzt: der Server gibt den fertigen Link heraus**, und die Oberfläche
     sagt daneben, **woher** die Adresse kam.
   * **Der Systembereich ZEIGT sie, setzt sie nicht.** Und der Grund ist nicht
     Ordnungsliebe, sondern die Rollenleiter: ein Admin kommt nicht an einen
     anderen Admin oder den Eigentümer. Dürfte er die öffentliche Adresse
     setzen, zeigte in **Stufe I** jede verschickte Rücksetzmail auf seinen
     Server — auch die, die sich der Eigentümer selbst anfordert. **Das wäre
     genau der Weg an der Rollenleiter vorbei, den es nicht geben darf.**
     Dieselbe Linie wie `HINTER_PROXY` (Projektstand, Abschnitt 3): *sie
     entscheidet über Netzwerkvertrauen, nicht über eine Vorliebe.*
   * **Nicht in die Karte „Titel".** Die beiden Titel sind reine Anzeige und
     werden frei getippt; stünde die Adresse daneben, sähe sie aus wie dieselbe
     Sorte Wert. **Gezeigt wird sie dort, wo der Link entsteht** — im
     Linkkasten der Karte „Zugänge", als Zeile darunter.
   * **Ab Stufe I ist sie Pflicht.** Dort verschickt der Server selbst, da gibt
     es keinen Browser zu fragen. Der Satz dahinter, und er gehört ins
     Konzeptpapier: *wer den Link von Hand weitergibt, hat einen Browser, der
     die Adresse kennt; wer ihn verschicken lässt, hat keinen.*

   **VIER FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Wie wird der Wert geprüft?** Schema, Host, Port — und was ist mit einem
     Pfad, einem abschließenden Schrägstrich, einem Fragment? *Ich neige zu:
     Schema und Host sind Pflicht, ein Pfad ist erlaubt, alles ab `?` und `#`
     wird abgewiesen.* **Und `http://` bei gesetztem `HINTER_PROXY`?** Das ist
     ein Widerspruch in sich — sag, ob er eine Absage oder eine Warnung wert
     ist.
   * **Was passiert bei einem unbrauchbaren Wert?** *Ich neige zu: der Start
     meldet es laut und die Anlage läuft weiter, mit dem Browserweg als
     Rückfall* — dieselbe Form wie bei `AUTH_RESET` und beim fehlenden
     Sicherungsort. Ein Start, der an einem Tippfehler in einer **optionalen**
     Einstellung abbricht, ist schlimmer als der Tippfehler.
   * **Steht sie in `GET /api/config`?** **Nein**, und das gehört geprüft: der
     Endpunkt liegt **vor** der Anmeldung und darf über die Anlage nichts
     verraten, was nicht ohnehin dasteht. Die Adresse gehört hinter die
     Adminfrage.
   * **Was sagt die Zeile im Linkkasten?** *Ich neige zu zwei Formen:*
     „Dieser Link zeigt auf `…` — **aus deinem Browser**" bzw. „— **aus der
     Einstellung `OEFFENTLICHE_ADRESSE`**". Wer den falschen Fall vor sich hat,
     soll ihn an dieser Zeile erkennen und nicht am toten Link beim Empfänger.

5. WAS ALLE VIER GEMEINSAM HABEN — UND WAS SIE AUSDRÜCKLICH NICHT TUN.

   * **Kein Mailversand, keine Selbstanmeldung.** Beides ist Stufe I und bleibt
     bei 0.9.0. Kein `nodemailer`, kein Schalter `registrierung`.
   * **Kein Änderungsverlauf an Inhalten.** Die Entscheidung dagegen steht und
     gilt; das Protokoll aus Punkt 1 ist ausdrücklich etwas anderes.
   * **Keine IP-Adresse, kein Browserkopf.** Seit 0.8.80 eine benannte
     Eigenschaft der Anlage. Wer sie aufgeben will, entscheidet das — er
     übergeht es nicht.
   * **Kein zweiter Faktor.** TOTP ist 0.9.10 und bleibt es. Die
     Re-Authentifizierung fragt **dasselbe** Passwort noch einmal, nicht ein
     zweites Geheimnis.
   * **Der Papierkorb, die Sicherung und die Token werden nicht umgebaut** —
     die Token bekommen höchstens eine Protokollzeile.
   * **`zugang.js` bleibt der Notweg** und bekommt keine Rechtefrage. Höchstens
     eine Protokollzeile, siehe Punkt 2.
   * **Die Formatnummer bleibt bei 10.** Das Protokoll steht nicht im
     Austauschformat, der Schlüssel erst recht nicht. **Sag es ausdrücklich**,
     damit klar ist, dass die Frage gestellt wurde.
   * **Keine neue Abhängigkeit.** Nicht eine. `crypto` ist in Node eingebaut,
     und `PRAGMA rekey` kann die Bibliothek, die schon da ist.
   * **Kein neuer Eintrag im Vokabular. Die elf bleiben elf.** Aber **zwei**
     Wortwahlen sind zu treffen und durchzuhalten: der Name des Protokolls
     (Punkt 1) und der Name für das zweite Passwortfragen — „Re-Authentifizierung"
     ist der Fachbegriff, aber am Bildschirm? *Dieselbe Frage wie „Token oder
     Link" in 0.8.80*, und der Sprachwächter verlangt eine Antwort.
   * **`F_ROUTEN` wächst — aber wie viel, ist eine Frage und keine
     Feststellung.** Nenn im Vorschlag **jede** neue schreibende Route mit ihrer
     Art und die neue Zahl (heute **56**). Und die schärfere Frage dazu:
     **braucht die Liste eine neue Art?** Die sechs bis acht schweren Wege
     tragen künftig eine Klemme, die es vorher nicht gab — und die Art
     `'nurEigentuemer'` sagt darüber nichts. Das ist genau der Befund aus
     0.8.30 („die Art `'im Rumpf'` sagt nur, *dass* eine Klemme dasteht, nicht
     *welche*"). Entscheide und begründe.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies nach den **Lesewegen** oben. Nicht mehr, und vor allem nicht am Stück.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst:
   `keys.js` ganz, `auth.js` (`pruefePasswort`, `aendereZugang`,
   `setzeNeuesPasswort`, `setzeRolle`, `setzeStatus`, `entferneZugang`,
   `erzeugeToken`, `checkThrottle`, `raeumeTokensAuf`), `db.js` (die DDL und
   die fünf Migrationsblöcke samt ihren Marken), `server.js` (die sechs
   schweren Wege, `GET /api/stats`, `raeumePapierkorbAuf`), `public/app.js`
   (die Karten „Kennzahlen" und „Zugänge", `zeigeLink`), `pruefung.js`
   (`F_ROUTEN`, die Gruppen zu den Rechten, `baueDom` samt Mock).
3. Besprich, was du ändern willst, und warte auf meine Bestätigung. **Nicht
   sofort bauen.** Die Fragen aus den Punkten 1 bis 4 gehören hierher, nicht in
   den Bau: der Name des Protokolls, seine Vorgänge, seine Zeile, seine Frist,
   wer es sieht; die Form der Re-Authentifizierung, ihre Wege, ihre Absage, ihr
   Bildschirm; der `.env`-Fall beim Schlüsselwechsel, der Abbruch, die alten
   Sicherungen; die Prüfung der Adresse und ihr Rückfall.
   **Unstimmigkeiten zwischen Projektstand und Quelltext sagst du jetzt** — das
   Papier ist an mehreren Stellen älter als der Code.
4. Erst nach meinem OK bauen — gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
5. Neue Prüfungen in `pruefung.js`. **Es gibt keine fertige Prüfliste.** Du
   stellst sie selbst auf, und sie ist der **erste** Teil des Vorschlags, nicht
   der letzte. Jede mit Gegenprobe: Regel probeweise zurückbauen, zeigen, dass
   genau diese Prüfung **namentlich** rot wird. Vor dem Deuten roter Punkte per
   `diff` belegen, dass der Quelltext der ist, den du zu prüfen glaubst.
   **Die Gegenproben laufen in einer Kopie des Arbeitsbaums** (Stolperstein 100),
   **und der Treiber beendet nach jedem Lauf die ganze Prozessgruppe**
   (Stolperstein 122). **Läufst du sie nebeneinander, rechne die Portversätze
   aus** — Stolperstein 127, und er ist in der Vorrunde teuer geworden.
   **Was mindestens hineingehört**, und die Liste ist keine Obergrenze:
   * **die Tabellenprobe zum dritten Mal:** von Hand entfernen, ein Start, sie
     ist wieder da — samt der Gegenlage, dass eine **Spalte** nicht nachwächst;
   * **jeder schwere Weg einzeln, in beide Richtungen:** ohne Passwort
     abgewiesen, mit falschem abgewiesen, mit richtigem durch — **und nach
     jeder Verweigerung die Nachschau in der Datenbank, dass nichts geschrieben
     wurde**. Sechs bis acht Wege heißt sechs bis acht Reihen; eine
     Sammelprüfung sagt nicht, welcher Weg offen steht;
   * **die Anmeldebremse greift auch hinter der Anmeldung**, belegt am
     Übergang, nicht an der Meldung — **und rechne die Schwelle nach**
     (Stolperstein 124: gesperrt wird ab dem elften, nicht ab dem zehnten);
   * **`zugang.js` als echter Prozess**, wie in den Runden zuvor: es tut seine
     vier Dinge weiterhin ohne Rückfrage;
   * **das Protokoll schreibt genau eine Zeile je Vorgang** — mit der Nachschau,
     dass ein **gescheiterter** Vorgang **keine** schreibt (oder eine, wenn du
     dich dafür entscheidest — dann steht es dort);
   * **der Schlüssel steht in keiner Protokollzeile**, geprüft am
     vollständigen Zeileninhalt über **alle** Spalten **aller** Zeilen, nicht
     an einem Feld;
   * **die Frist an beiden Seiten**, mit von Hand gesetztem Ausgangswert und
     der Nachschau, dass wirklich einer dasteht (Stolperstein 60 und 119);
   * **das Aufräumen an BEIDEN Aufrufstellen einzeln** — und die für den Start
     läuft gegen einen **echten Serverstart**, nicht gegen einen kurzen Lauf,
     der die Funktion selbst ruft (Stolperstein 126; genau daran ist die
     Vorrunde einmal stumm geblieben);
   * **wer das Protokoll sehen darf, in beide Richtungen**, mit zwei
     vorbereiteten Sitzungen und **einem Admin ohne Eigentümerrolle**;
   * **der Rundlauf des Schlüsselwechsels:** Bestand anlegen, wechseln, mit dem
     **neuen** Schlüssel lesen, mit dem **alten** nicht mehr — und der Bestand
     ist Feld für Feld derselbe;
   * **der `.env`-Fall und der Dateifall getrennt**, denn sie enden verschieden;
   * **die öffentliche Adresse in beiden Zuständen** — leer und gesetzt —,
     samt der Prüfung, dass sie **nicht** in `GET /api/config` steht, und der
     Zeile im Linkkasten in beiden Formen;
   * **`F_ROUTEN` trägt jede neue schreibende Route mit ihrer Art**, und die
     **Zahl** wird ausdrücklich geprüft;
   * **ein Wächter über den Quelltext** für die gewählte Wortwahl, samt
     Gegenprobe, dass er überhaupt Code liest (Stolperstein 106);
   * **der Sprachwächter bleibt grün** — und er sieht auch die Papiere dieser
     Runde an, nicht nur den Quelltext.
6. **Ein Migrationsabschnitt im Prüfstand nur, wenn es einen Migrationsblock
   gibt.** Nach dem Stand der Dinge gibt es keinen — dann gehört stattdessen
   die **Probe selbst** hinein. Kommt über Punkt 2 doch eine Spalte an
   `sessions` dazu, ist das der **sechste** Block: **anhalten und fragen.**
   **Sag es im Vorschlag ausdrücklich**, damit klar ist, dass die Frage
   gestellt und beantwortet wurde.
7. Für die Rechteprüfung gilt unverändert: zwei vorbereitete Sitzungen, zu jeder
   Verweigerung der Erfolgsfall daneben und die Nachschau, dass nichts
   geschrieben wurde. **Und ein Admin ohne Eigentümerrolle gehört dazu.**
8. **Für den Mock in `baueDom` gilt Stolperstein 90 und 115:** was sich durch
   einen Schreibvorgang ändern soll, muss sich **wirklich** ändern, und wer die
   Zahlen einer Prüflage misst, misst sie an einem frischen Aufbau. **Jede
   Lesestelle wird abgefangen** (Stolperstein 103) — fehlt der Gegenstand,
   sollen die Prüfungen rot werden, nicht der Lauf abreißen. **Und eine
   Prüfung darauf, dass an einer Zeile etwas NICHT steht, gehört hinter eine
   Prüfung darauf, dass es die Zeile überhaupt gibt** (Stolperstein 81).
9. Neue Bedienelemente werden per `dispatchEvent` gedrückt, samt Durchlauf des
   Event Loops. `.click()` genügt nicht. **`confirm` und `prompt` sind in jsdom
   nicht gebaut** und liefern `undefined` — sie werden gestellt, und zwar auf
   **beide** Antworten: ein Abbruch, der trotzdem handelt, ist der schlimmere
   Fehler. **Und eine Karte, die sich beim Einhängen selbst nachlädt, reißt den
   Lauf ab** (Stolperstein 118) — was das Protokoll braucht, wird dort geholt,
   wo der Bereich ohnehin lädt.
10. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.** Fachbegriffe werden nicht
  zwanghaft eingedeutscht; die eigenen Bilder des Projekts bleiben.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens.
  Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.8.90` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`) — sonst wird der Prüfstand
  namentlich rot.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein. Einzige
  Ausnahme sind die Marken aus der Bauregel.
* **Keine neue Abhängigkeit.** Nicht eine.
* Nicht anfassen ohne Rückfrage: Farbschema, Anmeldebremse **in ihren
  Kennwerten** (die Anwendung auf einen neuen Weg ist ausdrücklich Teil des
  Auftrags, das Herunterschrauben der Schwellen nicht), das
  Verschlüsselungs**modell** (der Wechsel des Schlüssels ist Punkt 3, das
  Verfahren bleibt), Dateiname `katalog.sqlite`, die Einstellung
  `HINTER_PROXY` und alles, was daran hängt, die Content-Security-Policy, die
  Sortierung der Übersicht, das Austauschformat, `zugang.js`, der Papierkorb,
  die Sicherung und die Token-Hälfte aus 0.8.80.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106) — mit der einen Ausnahme, die seit 0.8.60 dasteht: der
  Sprachwächter sieht die Kommentare ausdrücklich an.
* **Zu jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine
  Prüfung an der echten Antwort** (Stolperstein 102).
* **Kontrollausgaben laufen über die Länge und das letzte Zeichen, nie über den
  Inhalt** (Projektstand, Abschnitt 8). Das gilt in dieser Runde schärfer als
  je zuvor: sie fasst den Schlüssel an.
* Wird es zu viel für einen Durchgang: **Haltepunkt nach Punkt 2** — dann
  stehen das Protokoll und die Re-Authentifizierung, und der Schlüsselwechsel
  folgt in einer eigenen Runde auf einer freien Nummer. **Punkt 4 hängt an
  keinem der drei** und kann überall mitlaufen. Sag vorher Bescheid, wenn du
  den Haltepunkt kommen siehst; **Punkt 3 allein wäre eine legitime eigene
  Runde**, und das ist keine Niederlage.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **In dieser Runde steht
  die Antwort für Punkt 1 schon halb da** — eine neue Tabelle war in 0.8.70 und
  0.8.80 kein Fall dafür. Prüf es trotzdem an dieser Tabelle. **Für Punkt 2
  steht sie NICHT da:** eine Spalte an `sessions` wäre der sechste Block.
* Das Schema bleibt vollständige DDL in `db.js`. Ein Index über
  `CREATE INDEX IF NOT EXISTS` ist KEIN Fall dafür, eine Tabelle über
  `CREATE TABLE IF NOT EXISTS` nach zwei Belegen ebenso wenig.
* Einmaliger Migrationscode steht gebündelt in einer benannten Funktion je
  Version, mit Marken, samt eigenem Prüfabschnitt. Die Marke lautet
  `// MIGRATION 0.8.x — ENTFAELLT MIT 1.0`, die Funktion hieße `migration0890()`.
* Jeder markierte Block bekommt sofort einen Eintrag unter „Vorgemerkt für 1.0"
  im Projektstand.

**Es bleibt bei fünf markierten Blöcken, wenn die Proben das hergeben.** Kommt
über Punkt 2 doch ein sechster dazu, ist das ein Grund **anzuhalten und zu
fragen** — nicht, ihn einzubauen.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; ein Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.90.md` liegt im Branch, als Rohstoff für die
  Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit Begründung,
  neue Stolpersteine mit Nummer und Kernsatz (**die Zählung setzt bei 128
  fort** — 123 bis 127 sind vergeben), die Gegenprobentabelle, Prüfungszahlen
  vorher/nachher (vorher: **2661**), Offengebliebenes.
* Die Zeile „0.8.90 — Fingerprint `…`" gehört ins Änderungsprotokoll, ZULETZT
  gebildet, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, denn `server.js` lädt sie.
  Diese Runde fasst voraussichtlich `db.js`, `auth.js`, `keys.js`, `server.js`,
  `public/app.js` und `public/style.css` an; `anhaenge.js` bleibt unberührt,
  `zugang.js` höchstens um eine Protokollzeile. **`keys.js` ist seit 0.8.70
  nicht mehr angefasst worden** — es ist die Datei von Punkt 3.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  wieder als PFLICHT** — es ist eine Datenbankstufe, auch ohne
  Migrationsblock. Der Weg gehört in den Chat, mit den Befehlen und dem
  erwarteten Ergebnis. **Und diesmal doppelt:** wer den Schlüssel wechselt,
  braucht die Sicherung **davor**, und die `.env` dazu.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. Für diese Runde ausdrücklich dabei: die Abfrage
  `SELECT name FROM sqlite_master WHERE type='table'` im Container (erwartet:
  die neue Tabelle steht da, **ohne Migrationsblock**), ein schwerer Weg am
  laufenden Betrieb einmal ohne und einmal mit Passwort, der Nachweis, dass der
  Schlüssel **in keiner Protokollzeile** steht, und der Fingerprint-Vergleich.
  **Der Schlüsselwechsel wird auf dem Server NICHT nebenbei ausprobiert** —
  dafür eine Wegwerfanlage, und der Befehl dazu gehört mit in den Chat.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

Diese drei Punkte sind Teil des Auftrags und werden am Ende abgearbeitet, nach
dem grünen Prüflauf:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Also:
  Projektstand (Kopf, Betriebsstand samt Einspielweg, **Abschnitt 3 Zugang und
  Verschlüsselung**, Funktionsumfang, Abschnitt 5 um die Entscheidungen dieser
  Runde, Stolpersteine, Prüfstand, Versionsgeschichte, Stufenplan,
  Abschnitt 11 — dort fallen die beiden Merkposten „ab 0.8.90" heraus, weil sie
  eingelöst sind) und das **Mehrbenutzer-Konzeptpapier** — dort **nur** der
  Kopf und der eine Satz zur öffentlichen Adresse in Abschnitt 11, denn diese
  Runde ist keine Stufe. Dazu die README (die Re-Authentifizierung, das
  Protokoll, der Schlüsselwechsel, die neue Einstellung samt `.env.example`).
  Der Projektstand und das Mehrbenutzerpapier tragen die Version im Dateinamen
  und werden entsprechend umbenannt (`git mv`, damit die Historie erhalten
  bleibt); alle Verweise darauf sind nachzuziehen.
* **`Doku/Changelog.md` bekommt einen Abschnitt für diese Runde** — was sich
  seit der letzten Version geändert hat. **Kurz und prägnant, wie bei den
  meisten Softwareanbietern: nicht zu viel aus dem Quelltext, sondern informativ
  für jemanden, der sich fragt, was das Update für ihn mitbringt.** Drei Blöcke
  wie beim vorhandenen Eintrag: was neu ist, was gleich bleibt, was beim
  Einspielen zu beachten ist. **Der Schlüsselwechsel gehört dort besonders
  vorsichtig beschrieben** — er ist der einzige Knopf im ganzen Projekt, der
  bei falscher Handhabung alles verliert.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Stufe.**
  Den weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber
  getestet ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **der
  Auftrag der Vorrunde wird dabei entfernt** — es liegt immer nur einer im
  Repo.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **0.9.0 — Stufe I, Mailversand und Selbstanmeldung.** Die letzte offene Stufe
  des Mehrbenutzerbetriebs. **Diese Runde arbeitet ihr an drei Stellen vor:**
  die öffentliche Adresse aus Punkt 4 wird dort **Pflicht**; das Protokoll aus
  Punkt 1 bekommt mit „Registrierung angefragt" und „freigeschaltet" seine
  ersten neuen Vorgänge seit dieser Runde; und die Re-Authentifizierung aus
  Punkt 2 entscheidet mit, ob die Mail-Zugangsdaten hinter dieselbe Schranke
  gehören wie der Schlüssel. **Der Sprung auf 0.9.0 ist der größte im ganzen
  Plan** — ab dort baut die Anlage von sich aus eine Verbindung nach außen auf.
* **0.9.10 — Zwei-Faktor.** TOTP und Wiederherstellungscodes. Die
  Re-Authentifizierung aus Punkt 2 ist die Stelle, an der er später
  zusätzlich gefragt würde; wer Punkt 2 baut, macht ihm den Platz frei, ohne
  ihn zu bauen.
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
* **`tokens.created_at` wird von keinem Code gelesen** (Befund aus 0.8.80). Sie
  ist der Eintrag, den das Protokoll aus Punkt 1 führen wollte — **prüf beim
  Bauen, ob sie damit eingelöst ist oder weiterhin nur dasteht.**
* **Der Sprachwächter sieht die Namen von Prüfungen nicht an** (Befund aus
  0.8.60): sie stehen in Strings, nicht in Kommentaren. Wer dort ein altes Wort
  einträgt, fällt nicht auf.
