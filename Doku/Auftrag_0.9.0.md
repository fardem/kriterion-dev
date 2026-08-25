Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Ideenpapier, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht
an einer Kopie.

AUFTRAG: **Version 0.9.0 — „Stufe I: der Server verschickt selbst."**
DIES IST **DIE LETZTE OFFENE STUFE** des Mehrbenutzerbetriebs. A bis H sind
gebaut; mit dieser Runde ist Teil II des Konzeptpapiers vollständig, und das
Papier wird zum letzten Mal fortgeschrieben.

**ZWEI PUNKTE, UND SIE HÄNGEN ANEINANDER.** Der Mailversand ist der Weg, die
Selbstanmeldung ist der erste, der ihn wirklich braucht. Beides in einer Runde,
**mit einem ausdrücklichen Abbruchpunkt dazwischen** — siehe Punkt 0.

WARUM DIESER SPRUNG DER GRÖSSTE IM GANZEN PLAN IST, und das ist keine
Redewendung: **bis heute antwortet die Anlage nur auf Anfragen. Ab dieser Runde
baut sie von sich aus eine Verbindung zu einem fremden Server auf.** Das ist
eine Änderung der Betriebsart, nicht eine weitere Funktion. Alles, was diese
Runde entscheidet, entscheidet sie unter dieser Überschrift.

WORAUF SIE AUFSETZT: 0.8.91 ist gebaut und geschoben, Fingerprint `a810f529`,
**3010 Prüfungen**, 18 Gegenproben, `F_ROUTEN` bei **57**, Formatnummer **10**,
**fünf** markierte Migrationsblöcke, Stolpersteine bis **140**, siebzehn Karten
im Systembereich, elf Vokabulareinträge, **fünfzehn** Vorgänge im
Sicherheitsprotokoll, `BESTAETIGUNG_ZWECKE` bei **sechs** (sechs Wege über fünf
Routen). Keine Laufzeitabhängigkeit außer `better-sqlite3-multiple-ciphers`,
`express`, `multer` und `sharp`.

**NOTIZ ZUM STAND — UNBESTÄTIGT.** Der Schlüsselwechsel aus 0.8.91 ist gebaut,
grün geprüft und eingespielt, **aber auf der echten Anlage noch nicht
gefahren**: `./schluessel.sh zeigen` ist gelaufen (662,5 MB Datenbank, 728,7 MB
Bedarf, Platz reichlich, „zuletzt gewechselt: nie"), `./schluessel.sh wechseln`
**noch nicht**. Das Ergebnis wird nachgeliefert. **Behandle den Wechsel bis
dahin als unbestätigt** — nicht als kaputt, aber auch nicht als belegt. Kommt
das Ergebnis herein, gehört es in den **Projektstand**, Abschnitt 2, und nicht
in diesen Auftrag. **Diese Runde fasst `schluessel.js`, `schluessel.sh` und
`db.js#wechsleSchluessel` nicht an.** Steht der Wechsel bei Rundenende immer
noch aus, ist das kein Grund zu warten und kein Grund, etwas nachzubessern.

WAS SICH ÄNDERT, IN EINEM SATZ: Wer einen Zugang bekommen soll, bekommt seinen
Link per Mail statt über die Schulter — und wer einen haben will, kann von
selbst danach fragen, ohne dass ihn deshalb schon jemand hereinlässt.

---

0. DER SCHNITT — UND DER ABBRUCHPUNKT, DER SCHON IM KONZEPTPAPIER STEHT.

   **Die Runde hat zwei Hälften, und die erste trägt allein.** Das Konzeptpapier
   nennt den Schnitt seit Langem: *„Abbruchpunkt: nach dem Versand, vor der
   Selbstregistrierung."* Er steht in Teil III, Zeile für Stufe I, und er ist
   nicht als Notausgang gemeint, sondern als Bauform.

   * **Erste Hälfte — der Versand.** `nodemailer`, die Anbietervorlagen, die
     Zugangsdaten in der `.env`, „gesetzt/nicht gesetzt" am Bildschirm, die
     Testmail, die öffentliche Adresse als Pflicht **für den Versand**. Danach
     verschickt die Anlage die Links, die es **schon gibt** — Einladung und
     Rücksetzung aus 0.8.80. **Kein neuer Anlass, nur ein neuer Weg.**
   * **Zweite Hälfte — die Selbstanmeldung.** Der Schalter `registrierung`, das
     Formular vor der Anmeldung, die Liste der offenen Anfragen beim Admin, die
     Freischaltung, die daraus einen Zugang samt Token macht.

   **DREI FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Eine Runde oder zwei?** *Ich neige zu: einer Runde mit dem Abbruchpunkt
     als Rückfallposition* — die zweite Hälfte ist ohne die erste sinnlos, und
     die erste ohne die zweite bereits nützlich. **Wird es zu breit, endet die
     Runde als 0.9.0 nach dem Versand, und die Selbstanmeldung wird 0.9.1.**
     Dann heißt die Runde nicht mehr „Stufe I", sondern „Stufe I, erste
     Hälfte", und das Konzeptpapier wird entsprechend fortgeschrieben.
     **Sag es, sobald du den Abbruchpunkt kommen siehst — nicht hinterher.**
   * **Braucht diese Runde einen Werkzeugpunkt?** *Ich neige zu nein.* 0.8.91
     hat `gegenprobe.js`, `PORT_VERSATZ` und die beiden Wächter über den
     Prüfstand gebaut; das Werkzeug steht. **Was fehlt, ist ein winziger
     SMTP-Empfänger im Prüfstand** — und der gehört zu Punkt 1, nicht in einen
     eigenen Punkt. **Er kommt aus `net`, nicht aus dem Netz** (siehe Punkt 1).
   * **Wo endet die erste Hälfte genau?** *Ich neige zu: sie endet, wenn eine
     Einladung aus 0.8.80 als Mail beim Empfänger ankommt und der Link daneben
     trotzdem zum Kopieren dasteht.* Das ist eine prüfbare Grenze, und alles
     davor ist die vollständige erste Hälfte.

---

1. DER MAILVERSAND — DIE ERSTE VERBINDUNG NACH DRAUSSEN.

   **Was das Konzeptpapier dazu festgelegt hat, gilt und wird nicht neu
   verhandelt** (Abschnitt 11): `nodemailer`, nur ausgehend, kein offener Port.
   Anbietervorlagen für GMX, Web.de, Gmail, Strato und IONOS plus „eigener
   Server", nach dem Muster der Suchanbieter. Immer über den SMTP-Zugang eines
   Anbieters, nie direkt vom Hausanschluss — rDNS und SPF/DKIM fehlen dort, und
   die Mail landet im besten Fall im Spam. Drei Hinweise gehören an den
   Bildschirm: **Gmail** braucht Zwei-Faktor und ein App-Passwort, **GMX**
   verlangt die Freischaltung des Versands über fremde Programme, und **die
   Absenderadresse muss zum Konto gehören.**

   **UND DER SATZ, DER ÜBER ALLEM STEHT** — er ist die wichtigste
   Entwurfsentscheidung des ganzen Vorhabens und steht deshalb hier noch einmal
   wörtlich: *„Jeder Link, der verschickt wird, ist im Verwaltungsbereich
   zusätzlich zum Kopieren sichtbar. Schlägt der Versand fehl, bricht nichts ab:
   der Admin sieht ‚Versand fehlgeschlagen' und daneben den Link."*
   **E-Mail ist eine Bequemlichkeit, keine Voraussetzung.** Eine Anlage ohne
   Mailzugang muss nach dieser Runde **genau so vollständig** laufen wie vorher.
   Wenn eine Entscheidung dieser Runde diesen Satz auch nur ankratzt, ist die
   Entscheidung falsch, nicht der Satz.

   **NEUN FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Die neue Abhängigkeit — und sie ist die erste seit Langem.** Bisher galt
     in jedem Auftrag „keine neue Abhängigkeit, nicht eine". **Hier wird eine
     aufgenommen, und das ist der Grund, warum sie nachgewiesen gehört statt
     geglaubt.** *Ich neige zu `nodemailer`* — das Konzeptpapier nennt ihn wegen
     MIT-0 und **keiner** Laufzeitabhängigkeiten, und das passt zur Linie des
     Projekts (Nodes eingebautes `crypto` statt einer Bibliothek). **Nachprüfen,
     nicht abschreiben:** `npm ls --omit=dev` nach der Aufnahme, die Zahl der
     hinzugekommenen Pakete, die Größe von `node_modules` vorher/nachher, und
     die Lizenz aus dem Paket selbst. **Ist der Baum nicht flach, sag es und
     halte an** — dann ist die Frage neu zu stellen, und `net` plus SMTP von
     Hand ist die Gegenrechnung. Der Prüfstand hält die Zahl anschließend fest.
   * **Wo liegen die Zugangsdaten?** *In der `.env`, und die Begründung ist
     schärfer als bei der öffentlichen Adresse.* Der SMTP-Server sieht **jede**
     Mail, die durch ihn geht — und jede dieser Mails trägt einen Link, der ein
     Passwort setzt. Dürfte ein Admin den Server eintragen, liefe **die
     Rücksetzmail des Eigentümers** über einen Server seiner Wahl. Das ist genau
     der Weg an der Rollenleiter vorbei, den es nicht geben darf.
     **Das ist eine ausdrückliche Ausnahme von der Regel** „`.env` trägt nur,
     was **vor** dem Öffnen der Datenbank lesbar sein muss" (Projektstand,
     Abschnitt 11). Die Ausnahme steht auf der Rollenleiter, nicht auf der
     Ladereihenfolge — **schreib sie als Ausnahme hin**, sonst steht sie
     morgen als Widerspruch da.
   * **Und wo bleibt dann die Auswahlliste?** Das Konzeptpapier beschreibt sie
     als Bedienelement; mit Zugangsdaten in der `.env` kann sie das nicht sein.
     *Ich neige zu: die Vorlagen stehen als Liste im Quelltext, und die `.env`
     wählt sie über einen Namen aus* — `MAIL_ANBIETER=gmx` holt Server, Port und
     Verschlüsselung aus der Liste; `MAIL_ANBIETER=eigen` macht `MAIL_SERVER`,
     `MAIL_PORT` und `MAIL_VERSCHLUESSELUNG` scharf. Einzutragen bleiben
     `MAIL_BENUTZER`, `MAIL_PASSWORT` und `MAIL_ABSENDER`. **Die `.env.example`
     trägt jede Vorlage als Block mit ihrem Namen**, und die Karte am Bildschirm
     **zeigt** die aufgelösten Werte, ohne sie setzen zu können. Damit bleibt
     die Bauform der Suchanbieter erhalten — eine gepflegte Liste, kein
     Freitext —, und die Rollenleiter bleibt heil. **Das weicht vom
     Konzeptpapier ab; die Abweichung gehört dort eingetragen, nicht
     stillschweigend gebaut.**
   * **Was zeigt die Oberfläche?** *Ich neige zu: eine neue Karte
     „Mailversand", siebzehn Karten werden achtzehn.* Sie zeigt Anbieter,
     Server, Port, Verschlüsselung und Absender im Klartext, das Passwort **nur
     als „gesetzt" oder „nicht gesetzt"** — nie als Länge, nie als Anfang, nie
     als Sternchen mit richtiger Zahl. Dazu der Zustand der öffentlichen
     Adresse und der Knopf für die Testmail. **Für wen?** *Ich neige zum
     Admin* — er ist es, der die Einladungen verschickt, und wer nicht sehen
     kann, ob der Versand steht, erfährt es erst, wenn jemand wartet.
   * **Wohin geht die Testmail?** **An die eigene Adresse des Anfordernden, und
     nirgendwo sonst.** Ein Knopf mit freiem Adressfeld wäre ein offener
     Mailverteiler hinter einer Anmeldung — die Anlage würde für jeden, der
     einen Adminzugang hat, fremde Post verschicken. *Hat der Zugang keine
     Adresse hinterlegt, wird abgesagt, mit Begründung und dem Weg dorthin.*
     Widersprich, wenn du das anders siehst — aber dann beantworte, was die
     Anlage tut, wenn jemand tausend Adressen durchprobiert.
   * **Die öffentliche Adresse wird Pflicht — aber Pflicht wofür?** Das
     Konzeptpapier sagt „ab Stufe I ist sie Pflicht", und wörtlich gelesen hieße
     das: ohne sie startet die Anlage nicht. *Ich neige ausdrücklich zu einer
     engeren Auslegung: Pflicht **für den Versand**, nicht für den Start.* Eine
     Anlage ohne Mail braucht sie nicht, und ein Startabbruch bräche **jede
     vorhandene Installation** beim Einspielen dieser Version — genau das, was
     der Einspielweg nie tun darf. Gebaut heißt das: **ohne sie wird nicht
     verschickt**, die Karte sagt warum, und der Link steht wie immer daneben.
     **Das ist eine Abweichung vom Wortlaut des Konzeptpapiers** und gehört dort
     nachgezogen.
   * **Was steht in der Mail?** *Ich neige zu: reiner Text, kein HTML, keine
     Bilder, keine Zählpixel, keine Anhänge.* Eine Mail, die ein Passwortsetzen
     ankündigt, hat keinen Grund, etwas nachzuladen. Inhalt: wer die Anlage ist,
     wozu der Link dient, wie lange er gilt (**sieben Tage**, unverändert aus
     0.8.80), und dass er **einmal** einlösbar ist. **Der Link steht im Fragment
     (`#/einladung/…`) und geht damit nie an den Server** — das gilt in der Mail
     genauso wie beim Kopieren.
   * **Was, wenn der Versand hängt?** SMTP kann minutenlang nichts sagen. *Ich
     neige zu: harte Frist, und die Antwort wartet nicht darauf.* Der Token
     entsteht **zuerst**, die Antwort trägt den Link **immer**, und das Ergebnis
     des Versands ist ein **Feld** in derselben Antwort (`versand: 'ok'` /
     `'fehlgeschlagen'` / `'aus'`). **Nenn die Frist als Zahl und begründe sie**
     — geraten wird sie nicht.
   * **Was gehört ins Sicherheitsprotokoll?** *Ich neige zu: der Versand
     **nicht**.* Eine Zeile „Mail an X verschickt" wäre ein Zustellprotokoll,
     kein Sicherheitsprotokoll — und die Adresse wäre Freitext von außen, den
     diese Tabelle ausdrücklich nicht aufnimmt. **Der Anlass steht schon drin**
     (`link.neu`), und mehr braucht es nicht. Widersprich, wenn du meinst, der
     Unterschied zwischen „Link erzeugt" und „Link verschickt" gehöre
     festgehalten — aber dann sag, **ohne** die Adresse.

---

2. DIE SELBSTANMELDUNG — DER ERSTE WEG, AUF DEM EIN FREMDER DIE ANLAGE ANSPRICHT.

   **Was das Konzeptpapier festgelegt hat** (Abschnitt 10): Es bleibt allein der
   Schalter `registrierung`; „Mehrbenutzerbetrieb ein" ist gestrichen und kommt
   nicht wieder — *ein Zustand, keine zweite Wahrheit*. Der Anfragende gibt
   **nur** Benutzername und E-Mail-Adresse an, **kein Passwort**. Der Admin
   prüft und schaltet frei. **Erst danach** erzeugt der Server einen Token, und
   der Benutzer setzt sein Passwort selbst — **der Tokenweg aus 0.8.80 wird
   unverändert geerbt**, samt Ablauf nach sieben Tagen, Einmaligkeit, dem
   Fallenlassen aller übrigen offenen Links und dem Mindestwert von zehn
   Zeichen.

   **UND DER SATZ, DER DIE GANZE FORM TRÄGT:** *„Die Antwort auf eine
   Registrierung sieht immer gleich aus, egal ob Name oder Adresse bereits
   existieren."* — „Danke, die Anfrage liegt beim Admin." **Andernfalls ist das
   Formular ein Werkzeug zum Durchprobieren von Adressen.** Dieselbe Überlegung
   trägt seit 0.8.80 die **eine** Absage am Token. Sie gilt hier ohne Ausnahme,
   und sie gilt auch dann, wenn die Anfrage aus einem ganz anderen Grund
   scheitert — siehe die Frage zum Deckel.

   **ACHT FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Wo stehen die offenen Anfragen?** *Ich neige zu einer eigenen Tabelle
     `registrierungen`* — Name, Adresse, `created_at`, dazu die Adresse des
     Aufrufers für die Zeitsperre. **Eine neue TABELLE braucht keinen
     Migrationsblock** (Stolperstein 20, dreimal nachgestellt): `CREATE TABLE IF
     NOT EXISTS` legt sie bei jedem Start an. Das wäre die **vierte**
     Datenbankstufe ohne Block, und es bliebe bei **fünf** markierten Blöcken.
     **Sag es ausdrücklich** — und wenn du meinst, es brauche doch einen, ist
     das ein Grund anzuhalten und zu fragen, kein Grund, ihn einzubauen.
   * **Hat eine Anfrage einen Zustand?** *Ich neige zu nein.* Eine Anfrage ist
     offen (die Zeile steht) oder erledigt (die Zeile ist weg) — freigeschaltet
     oder abgelehnt. Ein Zustandsfeld hieße, abgelehnte Anfragen aufzuheben, und
     das wäre eine Namensliste von Leuten, die nicht hereindurften. **Was
     bleibt, ist die Zeile im Sicherheitsprotokoll** — die stellt den Vorgang
     fest, ohne die Adresse aufzubewahren.
   * **Welche Vorgänge kommen dazu?** Der Projektstand hat zwei vorgemerkt:
     „Registrierung angefragt" und „freigeschaltet". *Ich neige zu **drei**:
     `registrierung.an`, `registrierung.frei`, `registrierung.weg`* — ohne den
     dritten hinterließe eine Ablehnung **gar keine** Spur, und die Ablehnung
     ist der Vorgang, bei dem man später wissen will, dass er stattgefunden hat.
     Fünfzehn Vorgänge würden achtzehn. **Und die Frage dazu:** schreibt die
     Freischaltung **zwei** Zeilen (`registrierung.frei` und `zugang.neu`) oder
     eine? *Ich neige zu zwei* — es sind zwei Feststellungen, und die zweite
     entsteht ohnehin auf dem vorhandenen Weg.
   * **Steht der Name in der Protokollzeile?** Die Tabelle nimmt **keinen
     Freitext von außen** auf, und ein selbst gewählter Benutzername ist genau
     das. *Ich neige zu: `registrierung.an` trägt **kein** Ziel — die Zeile
     stellt fest, DASS angefragt wurde. `registrierung.frei` trägt die
     Benutzernummer, denn ab da gibt es einen Zugang.* Dieselbe Schärfe wie beim
     Schlüsselwechsel aus 0.8.91, aus demselben Grund.
   * **Der Deckel und die Zeitsperre.** Das Konzeptpapier schlägt **20** offene
     Anfragen vor und eine Zeitsperre pro IP. *Ich neige zu: der Deckel bei 20,
     und die Zeitsperre ist **die vorhandene Anmeldebremse**, unverändert in
     ihren Kennwerten* — dieselbe Entscheidung wie an den beiden Tokenrouten in
     0.8.80. Eine zweite Bremse mit eigenen Zahlen wäre eine zweite Wahrheit
     über dieselbe Frage. **UND DER PUNKT, AN DEM ES KIPPEN KANN:** ist der
     Deckel erreicht, **bleibt die Antwort dieselbe** — sonst sagt das Formular
     „voll" und ist damit wieder ein Werkzeug, diesmal zum Ausmessen der Anlage.
     *Die Anfrage wird still verworfen, und der Admin sieht am Zähler, dass
     seine Liste voll ist.*
   * **Steht der Schalter beim Admin oder beim Eigentümer?** *Ich neige zum
     Admin* — er legt ohnehin Zugänge an, und die Freischaltung bleibt bei ihm;
     der Schalter gibt ihm keine Macht, die er nicht hätte. **Gehört er hinter
     die zweite Bestätigung?** *Ich neige zu nein:* die sechs Wege dort sind
     Handlungen, die man nicht zurücknehmen kann. Ein Schalter, den man
     zurücklegt, ist keine davon. `BESTAETIGUNG_ZWECKE` bliebe bei **sechs**.
   * **Woher weiß die Anmeldeseite, dass es das Formular gibt?** Sie liegt
     **vor** der Anmeldung, also muss der Schalter dort ankommen. *Ich neige zu:
     ein Feld `registrierung` in `GET /api/config`.* Das steht scheinbar im
     Widerspruch dazu, dass die **öffentliche Adresse** dort ausdrücklich
     **nicht** steht — ist aber keiner: die Adresse sagt etwas über das
     Netzwerkvertrauen der Anlage, der Schalter nur, ob ein Formular angezeigt
     wird. **Und verschweigen ließe er sich ohnehin nicht**, denn die Route
     darunter antwortet so oder so. **Schreib die Unterscheidung hin**, sonst
     liest sie später jemand als Aufweichung.
   * **Die Eindeutigkeit der Adresse.** `users.email` hat bewusst **kein**
     `UNIQUE`; `ALTER TABLE` kann keines nachrüsten, und die gewanderte und die
     frische Datenbank wären verschieden gebaut. Der richtige Weg wäre ein
     **partieller Index** (`CREATE UNIQUE INDEX IF NOT EXISTS … ON users(email)
     WHERE email IS NOT NULL`), und er gehört in **dieselbe** Stufe wie die
     Prüfung im Code. *Ich neige zu: nicht in dieser Runde.* Die Registrierung
     braucht ihn nicht — sie antwortet ohnehin immer gleich, und die
     Entscheidung fällt beim Freischalten, wo ein Mensch hinsieht. **Ein Index,
     der auf einem gewachsenen Bestand angelegt wird, kann scheitern**, und
     zwar genau dann, wenn schon zwei Zugänge dieselbe Adresse tragen —
     mitten im Start, in einer Runde, die ohnehin die größte ist. **Widersprich,
     wenn du das anders siehst**, aber dann gehört die Frage beantwortet, was
     der Start tut, wenn er die Doppelung vorfindet.

---

3. WAS DIESE RUNDE AUSDRÜCKLICH NICHT TUT.

   * **Kein Mailempfang.** Kein offener Port, kein IMAP, kein Abholen. Nur
     ausgehend.
   * **Keine Benachrichtigungsmails.** Es gibt **zwei** Anlässe für eine Mail —
     den Tokenlink und die Testmail. Nicht „jemand hat kommentiert", nicht
     „etwas ist offen", nicht „eine Anfrage liegt vor". Wer das später will,
     bekommt eine eigene Runde und eine eigene Entscheidung darüber, wer
     zustimmt.
   * **Kein Versanddienst über HTTPS.** Brevo, Mailjet und Postmark sind
     vorgemerkt für den Fall, dass SMTP am Anschluss nachweislich nicht
     durchkommt — **erst bauen, wenn das eingetreten ist**, nicht vorher.
   * **Kein Zwei-Faktor.** TOTP ist 0.9.10, und dort gilt der Satz „E-Mail ist
     Bequemlichkeit, nie Voraussetzung" **nicht** — ein zweiter Faktor darf
     nicht ausfallen können. Das ist eine Bindung für die nächste Runde, kein
     Punkt für diese.
   * **Die Formatnummer bleibt bei 10.** Weder Mailzugang noch offene Anfrage
     stehen im Austauschformat. **Sag es ausdrücklich**, damit klar ist, dass
     die Frage gestellt wurde.
   * **Kein neuer Eintrag im Vokabular. Die elf bleiben elf.** „Registrierung"
     ist ein Wort über die Anlage, keins über die Sache, die bewertet wird.
   * **Der Tokenweg aus 0.8.80 wird geerbt, nicht umgebaut.** Sieben Tage,
     einmal gültig, alle übrigen Links fallen mit, SHA-256 ohne Salz, die **eine**
     Absage vor der Anmeldung. Wer daran etwas ändern will, hält an und fragt.
   * **Der Schlüsselwechsel, der Papierkorb, die Sicherung und die zweite
     Bestätigung werden nicht umgebaut.** Siehe die Notiz oben: `schluessel.js`,
     `schluessel.sh` und `wechsleSchluessel` bleiben unberührt.
   * **Nicht anfassen ohne Rückfrage:** Farbschema, Anmeldebremse **in ihren
     Kennwerten**, Dateiname `katalog.sqlite`, `HINTER_PROXY`, die
     Content-Security-Policy, die Sortierung der Übersicht, das Austauschformat,
     der Papierkorb, die Sicherung, `ordneBestandZu()` und die Rollenleiter.
   * **`F_ROUTEN` wächst.** Ich erwarte **vier** neue schreibende Routen — die
     Anfrage, die Freischaltung, die Ablehnung und die Testmail —, also **57 →
     61**. **Nenn jede mit ihrer Art und die neue Zahl**; weicht sie ab, sag
     warum. Ein **lesender** Endpunkt für die Liste der offenen Anfragen steht
     wie immer **nicht** in `F_ROUTEN`, auch mit Wächter nicht. Die Route vor der
     Anmeldung trägt die Art `'offen'` — und dann steht dort **weder** eine
     Klemme im Rumpf **noch** ein Wächter in der Zeile (Stolperstein 101).
   * **Es bleibt bei FÜNF markierten Migrationsblöcken.** Eine neue Tabelle,
     keine neue Spalte. **Sag es ausdrücklich.**

---

LESEWEGE — WAS DU LIEST UND WAS AUSDRÜCKLICH NICHT:

* **Ganz lesen:** diesen Auftrag; im **Konzeptpapier** die Abschnitte **10 und
  11** (Registrierung und Tokens; E-Mail — sie sind die Vorlage dieser Runde,
  und der Abschnitt „Der Punkt, der das Offline-Prinzip erhält" ist ihr Kern);
  in `server.js` die **beiden Tokenrouten** samt `POST /api/users/:id/token`
  und der Stelle, an der `link` und `linkQuelle` entstehen.
* **Abschnittsweise, über die Überschriften angesteuert:** Projektstand
  Abschnitt 2 (Betriebsstand und Einspielweg), **Abschnitt 3** (Zugang und
  Verschlüsselung — Tokens, Anmeldebremse, öffentliche Adresse,
  Sicherheitsprotokoll), 4 (die Karten), 5 (Entscheidungen), 6
  (**Stolpersteine 20, 57, 60, 74, 81, 90, 101, 102, 104, 106, 118 und 120**),
  7 (Prüfstand), 8 (der Merksatz zu Kontrollausgaben und die offenen
  Betriebspunkte), 10 (Stufenplan), 11 (was für kommende Stufen bindet),
  12 (Arbeitsweise samt Sprachregel).
* **Gezielt greppen, nie am Stück lesen:** `pruefung.js` (19 900 Zeilen). Was du
  brauchst, findest du über `gruppe('…')`, über `F_ROUTEN`, über
  `starteWeiterenServer`, über `PRUEFLAGEN` und über `baueDom`.
* **Nicht lesen, solange keine bestimmte Frage dorthin führt:** die
  Änderungsprotokolle `0.8.6` bis `0.8.71`, das Videopapier, das Ideenpapier.
  Aus `0.8.80` brauchst du den Abschnitt zum Token, aus `0.8.90` den zur
  öffentlichen Adresse, aus `0.8.91` **nichts** — diese Runde berührt den
  Schlüsselwechsel nicht.
* **Der Quelltext, den es wirklich braucht:** `auth.js`
  (`OEFFENTLICHE_ADRESSE`, `pruefeOeffentlicheAdresse`, `VORGAENGE`,
  `MERKMALE`, `protokolliere`, der Tokenteil), `server.js`
  (`GET /api/config`, `POST /api/setup`, die Anmeldebremse und
  `tokenBremseFrei`, `POST /api/users/:id/token`, `POST /api/token/pruefen`,
  `POST /api/token/einloesen`, `PERSOENLICHE_SCHLUESSEL` und `putSetting`),
  `db.js` (das Schema als DDL), `public/app.js` (die Anmeldeseite, die Karte
  „Zugänge" mit dem Linkkasten, `renderSystem`).

---

VORGEHEN — in dieser Reihenfolge:

1. Lies nach den **Lesewegen** oben. Nicht mehr, und vor allem nicht am Stück.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst.
3. **Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen.** Die Fragen aus den Punkten 0, 1 und 2 gehören hierher, nicht
   in den Bau. **Unstimmigkeiten zwischen Konzeptpapier, Projektstand und
   Quelltext sagst du jetzt** — in dieser Runde sind zwei schon benannt (die
   Auswahlliste und der Wortlaut „Pflicht"), und es können weitere darunter
   liegen.
4. Erst nach meinem OK bauen — **die erste Hälfte zuerst und vollständig**,
   dann die zweite. Gezielte Änderungen, keine Neuerzeugung ganzer Dateien.
5. **Der SMTP-Empfänger im Prüfstand kommt aus `net`**, nicht aus dem Netz: ein
   Server von wenigen Dutzend Zeilen, der `EHLO`, `MAIL FROM`, `RCPT TO`, `DATA`
   und `QUIT` beantwortet und das Geschriebene aufhebt. **Keine zweite
   Entwicklungsabhängigkeit.** Seine Portbasis wird **in die Liste eingetragen**,
   die der Wächter aus 0.8.91 nachrechnet — sonst kollidiert sie mit dem
   Portversatz der Nebenspuren, und die Gegenproben stehen wieder still.
   **Die Basis wird ausgerechnet, nicht geschätzt** (Stolperstein 127 und 64):
   keine entstehende Nummer darf auf der Sperrliste liegen — 4045, 4190, 5060,
   5061, 6000, 6566, 6665–6669, 6679, 6697, 10080.
6. Neue Prüfungen in `pruefung.js`. **Was mindestens hineingehört**, und die
   Liste ist keine Obergrenze:
   * **der Versand am echten SMTP-Gespräch:** eine Einladung geht hinaus, und
     der Empfänger, der Absender und der Link im Rumpf stimmen;
   * **das Offline-Prinzip in beide Richtungen:** ist kein Zugang eingerichtet,
     entsteht der Token **trotzdem** und die Antwort trägt den Link; **schlägt
     der Versand fehl** (Empfänger antwortet mit Fehler, Empfänger antwortet gar
     nicht, Empfänger bricht die Verbindung ab), entsteht der Token **trotzdem**
     und die Antwort trägt den Link **und** den Grund;
   * **die Frist:** ein Empfänger, der schweigt, hält die Antwort nicht länger
     auf als die genannte Zahl — gemessen, nicht behauptet;
   * **die öffentliche Adresse:** ohne sie wird **nicht** verschickt, mit ihr
     steht die volle Adresse im Rumpf, und sie kommt **nie** aus dem
     `Host`-Kopf — geprüft mit einem gefälschten Kopf;
   * **das Passwort steht in KEINER Antwort, KEINER Protokollzeile und KEINER
     Kontrollausgabe** — geprüft am vollständigen Inhalt über **alle** Spalten
     **aller** Zeilen und an dem, was Start und Versand ins Containerprotokoll
     schreiben. *Kontrollausgaben laufen über die Länge und das letzte Zeichen,
     nie über den Inhalt.*
   * **die Testmail geht an die eigene Adresse** — und ein mitgegebenes
     Adressfeld ändert daran nichts, auch nicht in `body`, `query` oder Kopf;
   * **die Registrierung antwortet immer gleich:** unbekannter Name, bekannter
     Name, bekannte Adresse, Deckel erreicht, Schalter aus — **Antwortkörper und
     Statuscode Byte für Byte gleich**, und die Laufzeiten weit genug
     beieinander, dass sie nichts verraten;
   * **der Schalter aus:** die Route weist ab, das Formular erscheint nicht, und
     `GET /api/config` sagt es;
   * **der Deckel:** die einundzwanzigste Anfrage wird verworfen, die Liste
     bleibt bei zwanzig, und die Antwort ist dieselbe;
   * **die Freischaltung:** aus der Anfrage wird ein Zugang **mit** Token, die
     Zeile ist weg, die Protokollzeilen stehen, und der Token öffnet den
     Passwortweg aus 0.8.80 unverändert;
   * **die Ablehnung:** die Zeile ist weg, **kein** Zugang entstanden, die
     Protokollzeile steht — und der Name steht **nicht** darin;
   * **die Anmeldebremse greift an der Registrierungsroute**, mit unangetasteten
     Kennwerten;
   * **`F_ROUTEN` trägt die vier neuen Routen mit ihrer Art**, und die **Zahl**
     wird ausdrücklich geprüft;
   * **die Karte am Bildschirm:** „gesetzt/nicht gesetzt" statt des Passworts,
     die drei Anbieterhinweise, der Testmailknopf mit Erfolg **und** Fehlschlag,
     die Liste der offenen Anfragen mit Freischalten und Ablehnen — jedes über
     ein **wirklich zugestelltes** Ereignis (Stolperstein 61);
   * **zu jedem Feld, das die Oberfläche aus der Antwort liest, eine Prüfung an
     der echten Antwort** (Stolperstein 102) — `versand`, `link`, `linkQuelle`;
   * **die neue Tabelle wächst bei jedem Start nach**, an einer Anlage ohne sie
     nachgestellt, samt der Gegenlage an einer Spalte (Stolperstein 20);
   * **die Abhängigkeitszahl:** was `npm ls --omit=dev` liefert, wird
     festgehalten — wächst der Baum später still, wird es namentlich rot;
   * **der Sprachwächter bleibt grün** — und er sieht auch die Papiere dieser
     Runde an.
7. **Kein Migrationsabschnitt im Prüfstand** — es gibt keinen Block. Stattdessen
   die Probe: das Schema einer gewachsenen Anlage ist nach dem Start dasselbe
   wie das einer frischen. **Sag es ausdrücklich.**
8. **Die Gegenproben laufen über `gegenprobe.js`** und liefern **eine** Tabelle.
   **Nenn im Vorschlag, welche Rückbauten du fahren willst.** Ich erwarte
   **mindestens zwanzig**, und die Liste wird **gegen die Liste der neuen
   Verhaltensweisen gehalten**, nicht gegen ein Gefühl für die Zahl — das ist
   die Lehre aus Befund L der Vorrunde. Darunter mindestens: die gleiche
   Antwort, der Deckel, die stille Verwerfung, das Offline-Prinzip bei
   Fehlschlag, die Frist, die Pflicht der öffentlichen Adresse, der `Host`-Kopf,
   die Testmail an die eigene Adresse, der Schalter, die Anmeldebremse an der
   neuen Route, die Protokollzeile ohne Namen, und der Tokenweg aus 0.8.80
   unverändert.
   **Ein Rückbau, der KEINE Prüfung rot macht, ist ein FUND** und wird
   untersucht, nicht abgehakt — in 0.8.90 waren zwei darunter, in 0.8.91 wieder
   zwei, und alle vier haben eine echte Lücke aufgedeckt.
9. **DREI PRÜFLÄUFE:** einer nach dem Bau, einer nach den neuen Prüfungen, einer
   zum Schluss gegen genau den Stand, der geschoben wird.
10. **KEINE HILFSDATEIEN IM ARBEITSBAUM.** Was du zum Messen brauchst, läuft
    über `node -e` oder liegt außerhalb des Repos.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.**
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens.
  Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.9.0` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`). **Die neue Abhängigkeit wird
  festgenagelt**, so wie `sharp` und die übrigen: `npm ci` muss denselben Baum
  bauen wie hier.
* **Keine Zugangsdaten im Chat.** Kein Mailpasswort, kein Schlüssel, kein
  Token — weder von dir noch von mir. Die Prüfungen arbeiten mit erfundenen
  Werten, und das genügt.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
* **Genau eine neue Laufzeitabhängigkeit, und sie ist begründet und
  nachgemessen.** Eine zweite gibt es nicht — auch keine
  Entwicklungsabhängigkeit für den Prüfstand.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106) — Ausnahme bleibt der Sprachwächter.
* **Ein Mock antwortet wie der echte Server** (Stolperstein 90). Der
  SMTP-Empfänger im Prüfstand ist einer: er darf nicht nur „ok" sagen, sondern
  muss auch fehlschlagen, schweigen und abbrechen können.
* **Wird es zu viel für einen Durchgang: Abbruchpunkt nach der ersten Hälfte.**
  Sag vorher Bescheid, wenn du ihn kommen siehst.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde steht
  die Antwort vorbehaltlich da:** eine neue Tabelle, keine neue Spalte, also
  kein Block.
* Das Schema bleibt vollständige DDL in `db.js`.
* Einmaliger Migrationscode stünde gebündelt in `migration090()` mit der Marke
  `// MIGRATION 0.9.x — ENTFAELLT MIT 1.0`. **Er wird voraussichtlich nicht
  gebraucht — und wenn du meinst, doch, ist das ein Grund anzuhalten und zu
  fragen, kein Grund, ihn einzubauen.**

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.9.0.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, neue Stolpersteine (**die Zählung setzt
  bei 141 fort** — 134 bis 140 sind vergeben), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (vorher: **3010**),
  Offengebliebenes.
* Die Zeile „0.9.0 — Fingerprint `…`" gehört ins Änderungsprotokoll, ZULETZT
  gebildet, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen. **Ein neues serverseitiges
  Modul bewegt den Fingerprint**, und das ist beabsichtigt; `node_modules`
  steht nicht darin, `nodemailer` also auch nicht.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  als PFLICHT** — es ist eine Datenbankstufe. Dazu die neuen Zeilen der `.env`:
  **sie kommen dazu, es verschwindet keine.** Der Weg gehört in den Chat, mit
  den Befehlen und dem erwarteten Ergebnis.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Der erste echte Versand wird nicht nebenbei
  ausprobiert:** dafür die Testmail an die eigene Adresse, und der Befehl dazu
  gehört mit in den Chat.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg und `.env`, **Abschnitt 3**,
  Funktionsumfang, Abschnitt 5 um die Entscheidungen dieser Runde,
  Stolpersteine, Prüfstand, Versionsgeschichte, Stufenplan, Abschnitt 11 —
  dort **fallen die eingelösten Merkposten heraus**). Der Projektstand trägt
  die Version im Dateinamen und wird umbenannt (`git mv`); alle Verweise sind
  nachzuziehen.
* **Das Konzeptpapier wird diesmal ANGEFASST — es ist eine Stufe.** Stufe I
  wird als erledigt eingetragen, die Abschnitte 10 und 11 werden auf das
  gebracht, was **gebaut** ist (samt der beiden benannten Abweichungen), und
  die Datei wird nach `Konzept_Mehrbenutzerbetrieb_Kriterion_0_9_0.md`
  umbenannt (`git mv`), mit allen Verweisen. **Mit dieser Runde ist Teil II
  vollständig** — schreib den Satz hin, der das feststellt, und was von dem
  Papier ab jetzt noch gilt: die Entscheidungen, nicht die Stufen.
* Die README bekommt den Mailversand (die `.env`-Zeilen, die drei
  Anbieterhinweise, die Testmail) und die Selbstanmeldung (der Schalter, der
  Weg vom Formular bis zum Passwort, und **dass es ohne Mail vollständig
  läuft**).
* **`Doku/Changelog.md` bekommt einen Abschnitt für diese Runde** — drei Blöcke
  wie bei den vorhandenen Einträgen. **Der Satz, der dort nicht fehlen darf:**
  wer keinen Mailzugang einträgt, verliert nichts — die Links stehen weiter zum
  Kopieren da.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.**
  Den weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber
  getestet ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **der
  Auftrag der Vorrunde wird dabei entfernt** — es liegt immer nur einer im Repo.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **Der Wechseltest auf der echten Anlage steht aus** (siehe die Notiz oben).
  Kommt das Ergebnis, gehört es in den Projektstand — und falls es einen Befund
  gibt, in eine eigene Berichtigungsrunde auf einer freien Nummer.
* **0.9.10 — Zwei-Faktor.** TOTP und Wiederherstellungscodes. Die zweite
  Bestätigung aus 0.8.90 ist die Stelle, an der er später zusätzlich gefragt
  würde. **Und die Bindung aus dem Konzeptpapier gilt dort:** ein zweiter Faktor
  braucht kein Netz und darf nie ausfallen — der Satz „E-Mail ist Bequemlichkeit,
  nie Voraussetzung" trägt dort **nicht**.
* **Ein Versanddienst über HTTPS**, falls SMTP am Anschluss nachweislich nicht
  durchkommt. Zweiter Weg im Code, ohne Bibliothek, mit `fetch`.
* **Ein echter Teillauf im Prüfstand.** `pruefung.js` ist EIN Ablauf; der
  Namensfilter filtert die Ausgabe, nicht die Arbeit. `gegenprobe.js` und
  `PORT_VERSATZ` mildern das, sie beheben es nicht.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird bei jedem
  Seitenaufbau gebraucht.
* **Teil II des Videopapiers — große Dateien bis 2 GB**, beschlossen für 1.1.0.
