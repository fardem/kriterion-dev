Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Ideenpapier, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht
an einer Kopie.

AUFTRAG: **Version 0.9.10 — „Der zweite Faktor."**
**Die erste Runde nach dem Stufenplan.** Teil II des Konzeptpapiers ist mit
0.9.1 abgearbeitet; was jetzt kommt, ist keine Stufe mehr, sondern eine Runde
wie 0.8.90 — sie steht im Projektstand, Abschnitt 10, nicht im Konzeptpapier.

**DIESER AUFTRAG IST LÄNGER ALS DER LETZTE, UND DAS HAT EINEN GRUND.** Bei
0.9.1 stand der Ablauf im Konzeptpapier und musste nur gelesen werden. **Hier
steht er nirgends.** Zum zweiten Faktor gibt es im ganzen Bestand genau einen
bindenden Satz, und der steht unten unter Punkt 1. Alles Übrige ist zu
entscheiden — deshalb hat dieser Auftrag mehr Fragen als der letzte und weniger
Verweise.

WORAUF SIE AUFSETZT: 0.9.1 ist gebaut, geschoben und **nachgezogen**,
Fingerprint `3cf1b093`, **3451 Prüfungen**, 58 Gegenproben, `F_ROUTEN` bei
**64**, Formatnummer **10**, **fünf** markierte Migrationsblöcke, Stolpersteine
bis **157**, **neunzehn** Karten im Systembereich, elf Vokabulareinträge,
**siebzehn** Vorgänge im Sicherheitsprotokoll, **dreizehn** Merkmale,
`BESTAETIGUNG_ZWECKE` bei **sieben**. Laufzeitabhängigkeiten:
`better-sqlite3-multiple-ciphers`, `express`, `multer`, `sharp`, `nodemailer`.

WAS SICH ÄNDERT, IN EINEM SATZ: Wer will, sichert seinen Zugang mit einem
zweiten Faktor — einem Code aus einer App auf seinem Telefon, der ohne Netz
entsteht und alle dreißig Sekunden ein anderer ist.

---

0. WAS AUS DEM FELD ZURÜCKKAM — FÜNF PUNKTE, EINER DAVON IST ARBEIT.

   * **Die Selbstanmeldung ist eingespielt.** Ob der ganze Weg — Anfrage,
     Bestätigungsmail, Freischaltung, Passwort — an der echten Anlage
     durchgelaufen ist, steht noch aus; **sobald er es ist, gehört das in den
     Projektstand, Abschnitt 2**, und nicht in dieses Papier.
   * **Fünf Befunde aus dem Betrieb sind in 0.9.1 behoben worden**, alle an
     derselben Karte, und sie stehen dort als Befunde M, N, P, Q und R: die
     Karte „Anfragen" verdeckte ihren eigenen Schalter (Stolperstein 155); der
     Weg zur Anfrage war ein Verweis in einer Fußzeile und wurde übersehen;
     Marke und Name standen gestapelt statt nebeneinander; der Strich über dem
     Anfrageknopf teilte die Karte in zwei; und `marke-hell.svg` lag Byte für
     Byte als zweite Fassung von `favicon.svg` daneben. **Alles erledigt; hier
     steht es nur, damit die Runde weiß, woher der Schwerpunkt kommt:** was ein
     Mensch nicht findet, ist nicht gebaut — und **fünf Befunde an einer
     einzigen Karte sind eine Aussage über den Prüfstand**, nicht über die
     Karte. Er prüft, was gebaut ist, und findet deshalb nie, was fehlt.
   * **DIE MARKE TRÄGT GOLD, NICHT DEN AKZENT — und das ist zu entscheiden.**
     Die Frage stand in diesem Papier zunächst anders: der hervorgehobene
     Strich in `public/marke-dunkel.svg` und `public/favicon.svg` sei `#ffc531`
     und laufe damit aus der Farbwelt. **Nachgesehen: `#ffc531` ist genau
     `--gold`** — die Farbe der Sterne, seit jeher der zweite Signalwert der
     Anlage neben `--accent` (`#ff7a1a`). Die Marke läuft also nicht aus der
     Farbwelt heraus, sie nimmt den zweiten Wert daraus.
     **Damit ist es eine Gestaltungsfrage und keine Berichtigung.** Auf der
     Anmeldekarte stehen jetzt drei warme Werte übereinander: Gold in der
     Marke, `--accent-dim`/`--accent-line` am zweiten Weg, voller Akzent am
     Anmeldeknopf. **Entscheide das und bau es**: entweder den Strich auf
     `--accent` ziehen, oder Gold behalten und im Projektstand, Abschnitt 5,
     als gewollt festhalten — *Gold ist die Farbe der Bewertung, und Kriterion
     ist ein Bewertungsarchiv; dafür lässt sich etwas sagen.* **Was nicht geht,
     ist beides offen lassen.**
   * **`favicon.svg` und `marke-hell.svg` — ERLEDIGT.** Es liegt nur noch
     `favicon.svg`; `marke-hell.svg` ist entfernt, in der Oberfläche war sie
     nie geladen. Der Prüfstand hält jetzt allgemein fest, dass in `public/`
     keine Datei zweimal unter zwei Namen liegt — verglichen über den Inhalt
     (Stolperstein 157). **Nichts mehr zu tun.**
   * **Der Schlüsselwechsel auf der echten Anlage steht weiterhin aus.** Er
     braucht keine Runde und keinen Auftrag; das Ergebnis gehört in den
     Projektstand, Abschnitt 2. **Nicht Teil dieser Runde.**

---

1. DER ZWEITE FAKTOR — WAS FESTSTEHT, UND ES IST WENIG.

   **Der eine bindende Satz, aus dem Konzeptpapier, Teil III:**

   > *Ein zweiter Faktor über TOTP braucht ausdrücklich kein Netz und darf
   > deshalb nie ausfallen — der Satz „E-Mail ist Bequemlichkeit, nie
   > Voraussetzung" trägt dort NICHT.*

   **Daraus folgt zweierlei, und beides ist nicht verhandelbar:**

   * **Kein Code per Mail, kein Code per SMS.** Der zweite Faktor entsteht auf
     dem Telefon, aus einem Geheimnis und der Uhr. Die Anlage schickt dafür
     nichts hinaus.
   * **Ein Ausfall des Mailversands darf niemanden aussperren** — und ein
     Ausfall des zweiten Faktors darf es genauso wenig. Deshalb gehören die
     **Wiederherstellungscodes** zur selben Runde und nicht in eine spätere;
     ohne sie ist ein verlorenes Telefon ein verlorener Zugang.

   **DAS BLEIBT UNANGETASTET, EGAL WAS SONST ENTSCHIEDEN WIRD:**

   * **Freiwillig, je Zugang.** Niemand wird gezwungen, und die Anlage läuft
     ohne zweiten Faktor vollständig — dieselbe Linie wie beim Mailversand und
     bei der Selbstanmeldung.
   * **Der Notweg über den Wirt bleibt.** `zugang.js` muss einen zweiten Faktor
     abnehmen können, sonst ist „niemand kommt mehr herein" ein Zustand ohne
     Ausweg.
   * **Keine neue Abhängigkeit, nicht eine.** TOTP ist HMAC-SHA1 über einen
     Zähler, und `crypto` kann das seit jeher.
   * **Die Anmeldebremse greift auch am zweiten Faktor.** Sechs Ziffern sind
     eine Million; ungebremst ist das kein Faktor, sondern eine Verzögerung.

   **DREI VORGABEN SIND INZWISCHEN GESETZT** — sie kamen als Antwort auf dieses
   Papier und stehen damit nicht mehr zur Wahl:

   * **DIE APP IST GOOGLE AUTHENTICATOR.** Sie kann genau das, was das
     Konzeptpapier meint — RFC 6238, und zwar in der Standardform: **HMAC-SHA1,
     sechs Ziffern, dreißig Sekunden, Base32-Geheimnis**. *Daraus folgt eine
     Fessel, und sie ist die wichtigste dieser Runde:* **bau nichts Klügeres.**
     SHA-256 statt SHA-1, acht Ziffern statt sechs, sechzig Sekunden statt
     dreißig — jedes davon ist für sich besser und wird von Google
     Authenticator **stillschweigend falsch** oder gar nicht gelesen. Wer davon
     abweicht, sperrt genau die App aus, für die gebaut wird. **Die Werte
     stehen fest und gehören als solche in den Quelltext, mit dem Grund
     daneben.** *Und die Kehrseite gehört geprüft:* dieselben Werte sind
     Vorgabe in jedem anderen Prüfgerät — Aegis, 1Password, iOS-Passwörter —,
     die Anlage bindet sich also nicht an einen Anbieter, sondern an den
     Standard.
   * **ES GIBT EINEN QR-CODE.** Google Authenticator kennt zwei Wege hinein:
     einen Code scannen oder den Base32-Schlüssel von Hand eintippen. **Der
     zweite ist der Weg, an dem Menschen aufgeben** — zweiunddreißig Zeichen aus
     einem Alphabet ohne 0, 1 und 8, auf einem Telefon. *Der Vorbehalt aus
     diesem Papier gilt trotzdem weiter, und du nimmst ihn ernst:* **keine
     Bibliothek, nicht eine** — also ein eigener Encoder, Reed-Solomon über
     GF(256), Maskenwahl und Formatbits, einige hundert Zeilen. **Er ist die
     einzige Stelle dieser Runde, die die Runde sprengen kann.**
     *Drei Dinge machen ihn tragbar, und alle drei sind Bedingung:* er ist
     **gegen bekannte Vorgaben prüfbar** (dieselbe Zeichenkette ergibt dieselbe
     Matrix, weltweit); er **trägt nichts Sicherheitskritisches** — er zeichnet
     eine Zeichenkette, die ohnehin auf der Seite steht; und **der abtippbare
     Schlüssel steht immer daneben**, in Vierergruppen. *Der QR-Code ist die
     Bequemlichkeit, der getippte Schlüssel ist die Zusage.* **Sag vor dem Bau,
     wo der Encoder liegt und wie er geprüft wird** — und sag es ehrlich, wenn
     er die Runde zu breit macht: dann fällt er heraus und bekommt eine eigene,
     und das ist kein Rückschritt.
   * **JEDER SCHALTET IHN FÜR SICH SELBST EIN.** Kein Admin schaltet ihn für
     jemanden ein und keiner für jemanden aus. *Der Grund ist nicht Höflichkeit,
     sondern Bauart:* **einschalten** kann nur, wer das Geheimnis auf sein
     Telefon bekommt — ein Admin, der es für einen anderen täte, sperrte ihn
     aus. **Ausschalten** darf nur der Betroffene, sonst wäre der zweite Faktor
     an der Rollenleiter vorbei abschaltbar und sicherte nichts. **Der einzige
     Weg daneben ist `zugang.js` auf dem Wirt** — dieselbe Linie wie beim
     Schlüsselwechsel: was alles kann, läuft nicht über die Oberfläche.
     *Ob ein Admin ihn später VERLANGEN kann, ist eine andere Frage und gehört
     nicht in diese Runde.*

   **ACHT FRAGEN, DIE VOR DEN BAU GEHÖREN.** Zu jeder gehört ein Vorschlag von
   dir und eine Begründung, nicht nur eine Wahl. **Die drei Vorgaben oben
   beantworten Teile davon schon** — was sie beantworten, wird nicht noch einmal
   aufgemacht, und was sie offen lassen, steht weiter zur Entscheidung:

   * **Wo liegt das Geheimnis, und in welcher Form?** *Ich neige zu: eine eigene
     Tabelle*, nach dem Muster von `anfragen` — `CREATE TABLE IF NOT EXISTS`
     legt sie bei jedem Start an, und es bleibt bei fünf markierten Blöcken.
     Spalten an `users` wären der **sechste Block**, und den will ich nicht.
     **Die unangenehme Hälfte der Frage ist die Form:** ein TOTP-Geheimnis muss
     im **Klartext** liegen, denn die Anlage rechnet den Code damit nach. Das
     ist der Unterschied zu Passwort und Token, und er gehört ausdrücklich
     benannt — die verschlüsselte Datenbank ist die einzige Schicht darüber.
     **Sag, was daraus für Export, Sicherung und Kontrollausgaben folgt.**
   * **Wie kommt das Geheimnis auf das Telefon?** **Entschieden: mit QR-Code**
     (siehe oben). *Offen bleibt das Wie:* wo der Encoder liegt (eigene Datei
     neben `bilder.js`? in `auth.js`?), ob er die **Matrix** liefert und die
     Oberfläche sie als SVG zeichnet oder ob er das SVG selbst schreibt, und
     **wie er geprüft wird** — Prüfvorgaben mit bekanntem Ergebnis, dazu die
     Bauteile einzeln (Findemuster, Taktlinien, Formatbits) statt nur ein
     Gesamtvergleich. **Und die Grenze gehört genannt:** eine `otpauth://`-Zeile
     mit Anlagennamen und Zugangsnamen liegt bei rund achtzig Zeichen — sag,
     welche Version und welche Fehlerkorrektur du nimmst und was passiert, wenn
     ein langer Name darüber hinauswächst.
   * **Wie wird die Anmeldung zweistufig, ohne einen zweiten Zustand zu
     erzeugen?** Eine halbe Sitzung wäre eine zweite Wahrheit über
     „angemeldet" — genau das, was Abschnitt 1 des Konzeptpapiers ausschließt.
     *Ich neige zu: ein kurzlebiger Ausweis im Arbeitsspeicher*, nach dem
     Muster der Freigabe aus 0.8.90 (`freigaben`, `FREIGABE_MS`) — kein
     Schema, keine Zeile, und er verfällt von selbst. **Und die Auskunft „dieser
     Zugang hat einen zweiten Faktor" kommt erst NACH richtigem Passwort**;
     davor wäre sie ein Werkzeug zum Durchprobieren von Namen. Prüf, ob das
     baulich wirklich so ist.
   * **Was ist mit dem Tokenweg aus 0.8.80?** Wer sein Passwort über einen
     Einladungs- oder Rücksetzlink setzt, wird gleich angemeldet. *Ich neige zu:
     der zweite Faktor wird auch dort verlangt* — sonst ist der Rücksetzlink der
     Weg daran vorbei, und der geht über eine Mail, also über einen fremden
     Server. **Das ist eine Sicherheitsfrage, keine Bequemlichkeitsfrage.**
     **Und der Sonderfall gehört mitentschieden:** ein Zugang ohne Passwort, der
     seinen ersten Link einlöst, kann noch keinen zweiten Faktor haben.
   * **Wer darf ihn abschalten?** **Entschieden: allein der Betroffene selbst**
     (siehe oben), hinter seinem Passwort **und** einem gültigen Code. *Offen
     bleibt, ob das mit den bestehenden Wegen zusammengeht* — besonders mit
     `PUT /api/users/:id` (ein Admin setzt ein fremdes Passwort) und
     `entferneZugang`. **Prüf das und sag es**: kann ein Admin heute über einen
     dieser Wege einen fremden zweiten Faktor mittelbar loswerden? Wenn ja, ist
     das die Lücke, und sie gehört in derselben Runde geschlossen.
   * **Die Wiederherstellungscodes.** Wie viele, wie lang, wie gespeichert, wie
     oft gültig? *Ich neige zu: acht Stück, gespeichert wie ein Token* —
     SHA-256 ohne Salz, denn sie sind Zufall und nicht ratbar; **jeder genau
     einmal**, gezeigt genau einmal beim Einschalten. **Und sag, was passiert,
     wenn der letzte verbraucht ist** — das ist der Fall, den niemand plant.
   * **Fragt die zweite Bestätigung aus 0.8.90 zusätzlich den Code?** Das
     Konzeptpapier nennt sie als die Stelle, an der er *zusätzlich* gefragt
     würde. *Ich neige zu: ja, aber nur bei Zugängen, die ihn eingeschaltet
     haben* — sie verteidigt gegen die **übernommene offene Sitzung**, und genau
     dort trägt ein zweiter Faktor am meisten. Wer ihn nicht will, merkt
     nichts. **`BESTAETIGUNG_ZWECKE` bleibt dabei bei sieben** — es kommt kein
     Zweck dazu, nur eine zweite Frage an derselben Stelle. Prüf, ob das
     stimmt.
   * **Zeitfenster, Drift und Wiederverwendung.** *Ich neige zu: ±1 Fenster*
     (also 30 Sekunden vor und zurück) und **ein Code gilt genau einmal** —
     sonst ist ein mitgelesener Code noch eine halbe Minute wert. **Wo der
     verbrauchte Zähler steht, ist Teil der ersten Frage.** Und: wie viele
     Routen kommen dazu, welche Art hat jede? `F_ROUTEN` wächst, **und die Zahl
     wird ausdrücklich geprüft.**

---

2. WAS DER MENSCH SIEHT — UND ES IST DIE HÄLFTE DER RUNDE.

   **0.9.1 hat zwei Befunde aus dem Betrieb geliefert, und beide waren
   Oberfläche, nicht Server.** Eine Karte, die ihren eigenen Schalter verdeckte,
   und ein Weg, der zu leise war. **Diese Runde ist die falsche, um das noch
   einmal zu machen.** Deshalb steht der Bildschirm hier gleichberechtigt neben
   dem Ablauf:

   * **Wo wird der zweite Faktor eingeschaltet?** *Ich neige zu: in der Karte
     „Zugang"* — sie gehört jedem, dort stehen Name, Passwort und Adresse, und
     dorthin gehört auch das. **Keine neue Karte**; es bleibt bei neunzehn.
     **Sag, wenn du eine eigene für richtiger hältst**, und begründe es an der
     Frage, wo ein Mensch danach sucht.
   * **Der Zustand muss ohne Klick zu sehen sein.** „An seit …" oder „aus" steht
     da, wo der Zugang steht — nicht hinter einem Knopf, den man erst drückt.
   * **Die Wiederherstellungscodes werden genau einmal gezeigt**, und der
     Bildschirm sagt an derselben Stelle, dass sie danach nicht wiederkommen —
     mit demselben Ernst wie beim Einladungslink.
   * **Die Absage bei falschem Code ist EINE** und nennt nicht, ob der Code
     falsch war oder abgelaufen. Dieselbe Überlegung wie beim Token: das
     Heilmittel ist in beiden Fällen dasselbe.

---

3. DIE MISSBRAUCHSSEITE — DREI DINGE, UND SIE SIND NICHT DASSELBE.

   * **Die Anmeldebremse greift am zweiten Faktor**, mit unangetasteten
     Kennwerten. Sechs Ziffern sind eine Million; bei zehn Versuchen je Adresse
     und fünf Minuten Sperre ist das eine Zusage, sonst nicht. **Prüf
     ausdrücklich, ob der zweite Schritt überhaupt in die Bremse fällt** — er
     hat einen anderen Weg als `POST /api/login`.
   * **Ein Code gilt einmal.** Wer über die Schulter sieht, hat sonst dreißig
     Sekunden.
   * **Das Geheimnis kommt aus keiner Antwort heraus, sobald es bestätigt ist.**
     Beim Einschalten muss es einmal über das Netz — danach nie wieder,
     **auch nicht an den Eigentümer**. Dieselbe Linie wie beim Mailpasswort:
     die Karte sagt „an" oder „aus", nie den Wert.

---

LESEWEGE — WAS DU WIRKLICH BRAUCHST:

* **Am Stück lesen:** dieser Auftrag, `Doku/Aenderungsprotokoll_0.9.1.md`
  (Abschnitte 2 bis 5 — die Abweichungen, die Fragen, die Befunde A bis U und
  die Stolpersteine 149 bis 157). **Die Befunde M bis U sind die aus dem
  Betrieb; lies die zuerst.**
* **Abschnittsweise, über die Überschriften angesteuert:** Projektstand
  Abschnitt 2 (Betriebsstand und Einspielweg), 3 (**der ganze Abschnitt** —
  Zugang, Tokens, Sitzungen, Anmeldebremse, zweite Bestätigung,
  Sicherheitsprotokoll, Selbstanmeldung), 4 (die Karten), 5 (Entscheidungen),
  6 (**Stolpersteine 13, 20, 47, 61, 74, 81, 90, 102, 106, 138, 145, 149 bis
  157**), 7 (Prüfstand), 8 (offene Betriebspunkte), 10 (**der Fahrplan bis zur
  Veröffentlichung** — er ist nach 0.9.1 festgelegt worden), 12 (Arbeitsweise
  samt Sprachregel).
* **Vom Konzeptpapier NUR den einen Satz** aus Teil III, der oben zitiert ist.
  **Das Papier ist mit 0.9.1 geschlossen** — siehe unten.
* **Gezielt greppen, nie am Stück lesen:** `pruefung.js` (über 22 000 Zeilen).
  Was du brauchst, findest du über `gruppe('…')`, `F_ROUTEN`,
  `starteWeiterenServer`, `PRUEFLAGEN`, `baueDom`, `PORT_VERSATZ` und
  `kurzlauf`.
* **Der Quelltext, den es wirklich braucht:** `auth.js` (`pruefeAnmeldung`, die
  Anmeldebremse, der Tokenteil, `freigaben`/`erzeugeFreigabe`, `VORGAENGE`,
  `MERKMALE`, `protokolliere`, der Anfragenteil aus 0.9.1 als **Muster für eine
  Tabelle ohne Block**), `server.js` (`POST /api/login`, die beiden
  Tokenrouten, `zweiteBestaetigung`, `PUT /api/account`, `PUT /api/users/:id`),
  `db.js` (das Schema als DDL, besonders `tokens` und `anfragen`),
  `zugang.js` (**ganz** — es sind 250 Zeilen und es ist der Notweg),
  `public/app.js` (`showLogin`, `showEinladung`, die Karte „Zugang" in
  `renderSystem`).
* **Nicht lesen, solange keine bestimmte Frage dorthin führt:** die
  Änderungsprotokolle vor `0.9.0`, das Videopapier, das Ideenpapier,
  `schluessel.js`, `anhaenge.js`, `keys.js`, `mail.js`.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies nach den Lesewegen. Nicht mehr, und nicht am Stück.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst.
3. **Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen.** Die acht Fragen aus Punkt 1 und die aus den Punkten 0, 2
   und 3 gehören hierher, nicht in den Bau. **Unstimmigkeiten zwischen
   Projektstand, Konzeptpapier und Quelltext sagst du jetzt.**
4. **Stell TOTP nach, bevor du es baust.** Rechne einen Code gegen einen
   bekannten Testvektor aus RFC 6238 nach — zwanzig Zeilen über `node -e`.
   Eine Zusage über einen Algorithmus, die erst der Prüfstand belegt, ist eine
   Runde zu spät.
5. Erst nach meinem OK bauen. Gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
6. **Kommt eine neue Prüflage mit eigener Portbasis dazu, wird sie
   AUSGERECHNET, nicht geschätzt** (Stolpersteine 64, 127 und 152) — keine
   entstehende Nummer darf auf der Sperrliste liegen (4045, 4190, 5060, 5061,
   6000, 6566, 6665–6669, 6679, 6697, 10080), **und die Spanne aller Basen
   muss unter `VERSATZ_STUFE` bleiben.** Der Wächter am Ende des Laufs rechnet
   beides nach; in 0.9.1 hat er zugeschlagen.
7. Neue Prüfungen in `pruefung.js`. **Was mindestens hineingehört**, und die
   Liste ist keine Obergrenze:
   * **der Rundlauf:** einschalten, Geheimnis bekommen, Code nachrechnen,
     bestätigen, abmelden, mit Code anmelden, abschalten;
   * **die Codes werden gegen einen bekannten Testvektor geprüft**, nicht nur
     gegen die eigene Rechnung — sonst prüft die Anlage sich selbst;
   * **ein Code gilt GENAU EINMAL** — derselbe zweimal geht nicht durch;
   * **das Zeitfenster:** ein Code aus dem Fenster davor und danach trägt, einer
     aus dem übernächsten nicht;
   * **ohne Code kommt niemand herein** — auch nicht mit richtigem Passwort;
   * **die Auskunft, DASS ein zweiter Faktor gefordert ist, kommt erst nach
     richtigem Passwort** — bei falschem Passwort sieht die Antwort aus wie
     immer;
   * **die Wiederherstellungscodes:** jeder genau einmal, gehasht gespeichert,
     der Klartext steht in **keiner Spalte keiner Zeile**;
   * **das Geheimnis steht in keiner Antwort**, sobald es bestätigt ist — und
     in keiner Kontrollausgabe;
   * **der Tokenweg aus 0.8.80 fragt ebenfalls** — und der Sonderfall „erster
     Link, noch kein Passwort" verhält sich wie entschieden;
   * **ein Admin schaltet den zweiten Faktor eines anderen NICHT ab**, der
     Eigentümer auch nicht;
   * **`zugang.js` kann es** — an einem echten Prozess, nicht an einer
     abgefangenen Funktion;
   * **die Anmeldebremse greift am zweiten Schritt**, mit unangetasteten
     Kennwerten;
   * **die neue Tabelle wächst bei jedem Start nach**, an einer Anlage ohne sie
     nachgestellt, samt der Gegenlage an einer Spalte (Stolperstein 13);
   * **`F_ROUTEN` trägt die neuen Routen mit ihrer Art**, und die **Zahl** wird
     ausdrücklich geprüft;
   * **die Karte am Bildschirm:** einschalten, Codes einmal sehen, abschalten —
     jedes über ein **wirklich zugestelltes** Ereignis (Stolperstein 61);
   * **zu jedem Feld, das die Oberfläche aus der Antwort liest, eine Prüfung an
     der echten Antwort** (Stolperstein 102);
   * **die Abhängigkeitszahl bleibt, wo sie ist** — diese Runde nimmt keine auf;
   * **der Sprachwächter bleibt grün** — er sieht auch die Papiere dieser Runde
     an.
8. **Die Gegenproben laufen über `gegenprobe.js`** und liefern **eine** Tabelle.
   **Nenn im Vorschlag, welche Rückbauten du fahren willst.** Ich erwarte
   **mindestens zwanzig**, und die Liste wird **gegen die Liste der neuen
   Verhaltensweisen gehalten**, nicht gegen ein Gefühl für die Zahl. Darunter
   mindestens: der Code gilt einmal, das Zeitfenster, die Bremse, die
   Wiederherstellungscodes, das Geheimnis in der Antwort, der Tokenweg, der
   Admin am fremden Faktor, die Auskunft vor richtigem Passwort.
   **Ein Rückbau, der KEINE Prüfung rot macht, ist ein FUND** und wird
   untersucht, nicht abgehakt — in 0.9.1 waren vier darunter, und **jeder
   einzelne hat eine echte Lücke in der Prüfung aufgedeckt**. Drei weitere
   rissen den Lauf ab statt ihn rot zu machen (Stolperstein 138): **jede
   Lesestelle in einer neuen Gruppe läuft über ein Auffangnetz**, sonst
   passiert das wieder.
9. **DREI PRÜFLÄUFE:** einer nach dem Bau, einer nach den neuen Prüfungen,
   einer zum Schluss gegen genau den Stand, der geschoben wird.
10. **KEINE HILFSDATEIEN IM ARBEITSBAUM.** Was du zum Messen brauchst, läuft
    über `node -e` oder liegt außerhalb des Repos.

---

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.** `TOTP`, `Base32`,
  `QR-Code` und `Token` sind Fachbegriffe und bleiben.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens.
  Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.9.10` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`). **Nachgeprüft: `0.9.10`
  sortiert über `0.9.1`** — drei Zahlen, nicht vier.
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch keine für den Prüfstand.
  `nodemailer` war die Ausnahme einer Runde und bleibt es.
* **Keine Zugangsdaten im Chat.** Kein Passwort, kein Schlüssel, kein Token,
  **kein TOTP-Geheimnis und kein Wiederherstellungscode** — weder von dir noch
  von mir. Die Prüfungen arbeiten mit erfundenen Werten, und das genügt.
  Kommt trotzdem eines ins Gespräch, **sagst du es und nennst das Gegenmittel**,
  statt darüber hinwegzugehen.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Eine Lage, die zwei Schranken zugleich reißt, prüft keine von beiden**
  (Stolperstein 154) — bei einem zweiten Faktor gibt es viele davon.
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106) — Ausnahme bleibt der Sprachwächter.
* **Ein Mock antwortet wie der echte Server** (Stolperstein 90). Der DOM-Mock
  bekommt die neuen Endpunkte, **und er liefert nicht selbst, was die Prüfung
  belegen soll** (Stolperstein 102).
* **Wird es zu viel für einen Durchgang, sag es, sobald du es kommen siehst —
  nicht hinterher.** Der Schnitt läge dann hinter dem Rundlauf mit
  Wiederherstellungscodes und **vor** der zweiten Bestätigung; der Rest würde
  0.9.11.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde steht
  die Antwort vorbehaltlich da:** eine neue Tabelle, keine neue Spalte, also
  kein Block. `CREATE TABLE IF NOT EXISTS` legt sie bei jedem Start an
  (Stolperstein 13).
* Das Schema bleibt vollständige DDL in `db.js`.
* Einmaliger Migrationscode stünde gebündelt in `migration0910()`. **Die Marke
  darüber lautet weiterhin `// MIGRATION 0.9.x — ENTFAELLT MIT 1.0`** — sie ist
  der Wortlaut, den alle fünf vorhandenen Blöcke tragen, und ein sechster mit
  anderem Wortlaut wäre eine zweite Schreibweise für dieselbe Sache. *Dass die
  Bereinigung nach dem neuen Fahrplan auf 0.9.60 liegt und nicht auf 1.0,
  ändert daran nichts; die Marke ist ein Suchwort, kein Termin.* **Der Code
  wird voraussichtlich nicht gebraucht — und wenn du meinst, doch, ist das ein
  Grund anzuhalten und zu fragen, kein Grund, ihn einzubauen.**

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.9.10.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, neue Stolpersteine (**die Zählung setzt
  bei 158 fort** — 149 bis 157 sind vergeben), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (vorher: **3451**),
  Offengebliebenes.
* Die Zeile „0.9.10 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen. **Und `public/` gehört
  dazu**: seit 0.9.1 liegen dort **zwei** SVG-Dateien, die mitzählen —
  `marke-dunkel.svg` und `favicon.svg`.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  als PFLICHT** — es ist eine Datenbankstufe. **Neue Zeilen in der `.env` gibt
  es voraussichtlich nicht**; sag es ausdrücklich, statt es offenzulassen.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Darunter der eine, der diese Runde belegt:** den
  zweiten Faktor einschalten, abmelden, mit Code anmelden, und einmal mit einem
  Wiederherstellungscode statt des Telefons.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg, Abschnitt 3, Funktionsumfang,
  Abschnitt 5 um die Entscheidungen dieser Runde, Stolpersteine, Prüfstand,
  Versionsgeschichte, Abschnitt 10, Abschnitt 11). Der Projektstand trägt die
  Version im Dateinamen und wird umbenannt (`git mv` auf
  `Projektstand_Kriterion_0_9_10.md`); alle Verweise sind nachzuziehen.
* **DAS KONZEPTPAPIER WIRD NICHT ANGEFASST UND NICHT UMBENANNT.** Es ist mit
  0.9.1 geschlossen: der Stufenplan ist abgearbeitet, und Zwei-Faktor ist keine
  Stufe davon. Sein Kopf sagt „gebaut bis Version 0.9.1", und das bleibt wahr —
  er beschreibt den Stand, bis zu dem das Papier trägt. **Fällt dir beim Bauen
  etwas auf, das dort falsch wird, ist das ein Befund und gehört gemeldet**,
  nicht stillschweigend nachgezogen.
* Die README bekommt den zweiten Faktor: wo er eingeschaltet wird, was auf dem
  Telefon zu tun ist, was die Wiederherstellungscodes sind und **wo sie
  hingehören** — und **dass die Anlage ohne all das vollständig läuft**.
  Dazu der Notweg über `zugang.js`, an derselben Stelle wie das vergessene
  Passwort.
* **`Doku/Changelog.md` bekommt einen Abschnitt für diese Runde** — drei Blöcke
  wie bei den vorhandenen Einträgen. **Der Satz, der dort nicht fehlen darf:**
  wer den zweiten Faktor nicht einschaltet, merkt von dieser Version nichts.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.**
  Den weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber
  getestet ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser
  hier wird dabei entfernt** — es liegt immer nur einer im Repo, so wie
  `Doku/Auftrag_0.9.1.md` beim Anlegen dieses Papiers weggefallen ist.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **Der Schlüsselwechsel auf der echten Anlage** — geprobt, gefahren noch
  nicht. Er läuft über `./schluessel.sh wechseln` auf dem Wirt und **braucht
  keine Runde und keinen Auftrag**; das Ergebnis gehört in den Projektstand,
  Abschnitt 2.
* **DER FAHRPLAN BIS ZUR VERÖFFENTLICHUNG STEHT** — festgelegt nach 0.9.1 und
  im Projektstand, Abschnitt 10, eingetragen:
  **0.9.20 — Suche und Bestand** (Volltextsuche, gespeicherte Ansichten,
  Doppelerkennung samt Zusammenführen; eine Datenbankstufe).
  **0.9.30 — Fehlerbereinigung und Verbesserungen**; das ist die Runde, die
  bisher ohne Nummer dastand. *Der Auftrag zu 0.9.1 nannte dafür irrtümlich
  0.9.20, wo schon „Suche und Bestand" steht — berichtigt.*
  **0.9.60 — vermutlich Bereinigung von Code und Datenbankstruktur**: die
  Struktur wird als Grundlage festgeschrieben, Migrationscode fällt heraus,
  **ab dort gibt es keinen Rückweg auf ältere Fassungen.** Das ist der Inhalt,
  der bisher unter 1.0.0 stand.
  **0.9.90 — die Veröffentlichung**, und nicht 1.0.0. *Warum 0.9.90 und nicht
  0.9.9: sortiert wird zahlweise, und `0.9.9` läge damit VOR `0.9.10` — die
  Veröffentlichung stünde in der Vergangenheit.*
  **Was mit der Eins geschieht, ist offen** und steht in Abschnitt 8.
* **Der QR-Encoder als eigene Runde**, falls er diese hier zu breit macht. Er
  ist der eine Teil, bei dem das ausdrücklich erlaubt ist: der abtippbare
  Schlüssel trägt den Weg auch ohne ihn.
* **Ein Versanddienst über HTTPS**, falls SMTP am Anschluss nachweislich nicht
  durchkommt. Zweiter Weg im Code, ohne Bibliothek, mit `fetch`.
* **Ein echter Teillauf im Prüfstand.** `pruefung.js` ist EIN Ablauf; der
  Namensfilter filtert die Ausgabe, nicht die Arbeit. `gegenprobe.js` und
  `PORT_VERSATZ` mildern das, sie beheben es nicht.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird bei jedem
  Seitenaufbau gebraucht.
* **Teil II des Videopapiers — große Dateien bis 2 GB.** Es stand auf 1.1.0;
  mit der Veröffentlichung auf 0.9.90 hängt seine Nummer an derselben
  Entscheidung wie die Eins.
