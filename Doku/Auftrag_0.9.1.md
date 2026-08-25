Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Ideenpapier, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht
an einer Kopie.

AUFTRAG: **Version 0.9.1 — „Stufe I₂: die Selbstanmeldung."**
**Das ist die letzte offene Stufe.** Mit ihr ist Teil II des Konzeptpapiers
vollständig, und der Stufenplan ist abgearbeitet.

**DIESER AUFTRAG IST KURZ GEHALTEN, UND DAS HAT EINEN GRUND.** Der Ablauf ist
**entschieden** und steht im Konzeptpapier, Abschnitt 10 („Registrierung und
Tokens") und Abschnitt 11 („E-Mail"). *Was dort steht, wird nicht neu
verhandelt und hier nicht abgeschrieben — es wird gelesen.* Dieser Auftrag
nennt nur, was **darüber hinaus** zu entscheiden ist, und die Regeln des
Hauses.

WORAUF SIE AUFSETZT: 0.9.0 ist gebaut, geschoben und **auf der echten Anlage
eingespielt**, Fingerprint `82dc8550`, **3192 Prüfungen**, 33 Gegenproben,
`F_ROUTEN` bei **59**, Formatnummer **10**, **fünf** markierte
Migrationsblöcke, Stolpersteine bis **148**, **achtzehn** Karten im
Systembereich, elf Vokabulareinträge, **fünfzehn** Vorgänge im
Sicherheitsprotokoll, **dreizehn** Merkmale, `BESTAETIGUNG_ZWECKE` bei
**sieben**. Laufzeitabhängigkeiten: `better-sqlite3-multiple-ciphers`,
`express`, `multer`, `sharp`, `nodemailer`.

WAS SICH ÄNDERT, IN EINEM SATZ: Wer einen Zugang haben will, kann von selbst
danach fragen — und muss dabei belegen, dass ihm die Adresse gehört, bevor
überhaupt ein Admin die Anfrage zu sehen bekommt.

---

0. WAS AUS DEM FELD ZURÜCKKAM — DREI PUNKTE, ZWEI DAVON SIND ARBEIT.

   * **Der Versand läuft.** Die erste echte Einladungsmail ist angekommen,
     Absender und Link stimmten, der Rumpf stand als reiner Text da. Das ist
     die Feldbestätigung für 0.9.0; sie gehört in den **Projektstand**,
     Abschnitt 2, nicht in dieses Papier.
   * **`OEFFENTLICHE_ADRESSE` ist die Voraussetzung dieser Runde**, nicht nur
     eine Empfehlung. Ohne sie verschickt die Anlage nichts, und ohne Versand
     läuft die Selbstanmeldung ins Leere. **Nenn das in der README an der
     Stelle, an der der Schalter erklärt wird** — nicht als Fußnote.
   * **EINE ZEILE AM BILDSCHIRM IST ZU LANG UND WIRD GEKÜRZT.** Auf der
     Einladungsseite steht heute: *„Du hast jetzt 15 Minuten Zeit. Seit dem
     ersten Öffnen läuft eine Frist; danach musst du beim Admin einen neuen
     Link holen. Neu laden darfst du in dieser Zeit, so oft du willst."*
     Der letzte Satz sagt dasselbe wie der Text der Mail und steht dort
     ebenfalls zu breit. **Kürzen, beide Stellen, ohne die Auskunft zu
     verlieren:** die Frist, was danach zu tun ist, und dass Neuladen
     unschädlich ist. *Ein Satz weniger, nicht eine Auskunft weniger.*

---

1. DIE SELBSTANMELDUNG — DER ABLAUF STEHT, DIE LÜCKEN NICHT.

   **Gelesen wird Konzeptpapier Abschnitt 10**, dort der Block „Entschieden für
   0.9.1" mit den fünf Schritten, der Absatz über die immer gleiche Antwort,
   der Absatz über die Kopplung des Schalters an den Versand und der Absatz
   „Zwei Betriebsarten wird es NICHT geben". Dazu Abschnitt 11, Absatz „Mit
   0.9.1 kommt ein DRITTER dazu" — der dritte Mailanlass.

   **DAS BLEIBT UNANGETASTET, EGAL WAS SONST ENTSCHIEDEN WIRD:**

   * **Der Admin schaltet frei. Immer.** Kein Betrieb, in dem der geklickte
     Link allein hereinlässt.
   * **Die Bestätigungsmail hat KEINE Passwortkraft.** Wer ihren Link
     anklickt, sagt „ja, das bin ich" — mehr nicht. Sie legt keinen Zugang an,
     sie setzt kein Passwort, sie meldet niemanden an.
   * **Die Antwort auf eine Anfrage sieht IMMER gleich aus** — unbekannter
     Name, bekannter Name, bekannte Adresse, Deckel erreicht, Schalter aus.
     Gleicher Statuscode, gleicher Rumpf **Byte für Byte**.
   * **Das Sicherheitsprotokoll nimmt keinen Freitext von außen.** Weder der
     gewünschte Name noch die Adresse gehören in eine Protokollzeile.

   **SIEBEN FRAGEN, DIE VOR DEN BAU GEHÖREN.** Zu jeder gehört ein Vorschlag
   von dir und eine Begründung, nicht nur eine Wahl:

   * **Woran hängt der Bestätigungslink?** `tokens.user_id` zeigt auf einen
     Zugang — den gibt es hier noch nicht. *Ich neige zu: ein eigener Hash in
     der neuen Tabelle*, nach demselben Muster wie `tokens` (32 Zufallsbytes,
     gespeichert wird nur der Hash, SHA-256 ohne Salz, Begründung wie in
     Abschnitt 10, Abweichung 1). **`tokens` um einen Zweck zu erweitern, der
     auf nichts zeigt, wäre die schlechtere Wahl** — sag es, wenn du das anders
     siehst.
   * **Wie lange lebt eine unbestätigte Anfrage?** Das Papier sagt „verfallen"
     und nennt keine Zahl. *Ich neige zu 24 Stunden* — deutlich kürzer als die
     sieben Tage des Einladungslinks, denn hier ist noch nichts geprüft.
     **Und wer räumt auf:** beim Start, bei jeder Anfrage, oder beides?
   * **Wogegen zählt der Deckel?** Zwanzig steht im Papier. *Ich neige zu:
     gegen die **bestätigten** und die **unbestätigten** zusammen* — sonst
     füllt ein Angreifer die Tabelle mit Unbestätigten, ohne je eine Mail zu
     lesen. **Was passiert bei Erreichen, ist die schärfere Frage:** die
     Antwort bleibt dieselbe, die Anfrage wird still verworfen.
   * **Was sieht der Admin?** Name, Adresse, Zeitpunkt der Anfrage,
     Zeitpunkt der Bestätigung. *Ich neige zu: eine eigene Karte im
     Systembereich* (achtzehn werden neunzehn) statt eines Anbaus an
     „Zugänge" — die Karte ist nur da, wenn der Schalter an ist oder Anfragen
     offen sind. **Sag, wenn du die andere Aufteilung für richtiger hältst.**
   * **Wer darf freischalten?** *Ich neige zu: jeder Admin* — es entsteht ein
     Zugang mit der Rolle `user`, und das darf der Admin ohnehin. **Die
     Rollenleiter wird dabei nicht berührt**, weil aus einer Anfrage nie etwas
     anderes als ein `user` wird. Prüf, ob das wirklich baulich wahr ist und
     nicht nur beabsichtigt.
   * **Was steht in den Protokollzeilen?** Freischaltung und Ablehnung
     gehören hinein — **ohne den Namen des Anfragenden**, siehe oben. *Ich
     neige zu zwei neuen Vorgängen* (`anfrage.frei`, `anfrage.ab`); die
     Freischaltung erzeugt daneben ohnehin schon `zugang.neu` und `link.neu`.
     **Prüf, ob das nicht doppelt ist** — eine Zeile, die nichts Neues sagt,
     gehört nicht in diese Tabelle.
   * **Wie viele Routen kommen dazu, und welche Art hat jede?** Zwei stehen
     **vor** der Anmeldung (Anfrage und Bestätigung), die übrigen dahinter.
     `F_ROUTEN` wächst entsprechend, **und die Zahl wird ausdrücklich
     geprüft.** Ein lesender Endpunkt mit Wächter steht wie immer **nicht**
     dort.

---

2. DER SCHALTER — UND WARUM ER SICH NIE VON SELBST UMLEGT.

   **Einschalten geht nur, wenn seit der letzten Änderung am Mailzugang eine
   Testmail durchgekommen ist.** Die Marke dafür ist `mailtestOk` aus 0.9.0,
   und die Prüfung darauf steht schon in `mailKarte()` — der Hash über den
   Zugang verwirft die Marke bei jeder Änderung. **Nimm den vorhandenen
   Mechanismus, bau keinen zweiten** (Stolperstein 145: zwei Mechanismen für
   eine Zusage sind einer zu viel).

   **Ausschalten geht immer.** Und geht der Versand später kaputt, **bleibt
   der Schalter an** und die Karte sagt es rot. Ein Schalter, der sich selbst
   umlegt, wäre die zweite Wahrheit aus Abschnitt 1 des Konzeptpapiers.

   **Wer darf schalten?** Der Schalter ist eine Einstellung wie andere auch —
   *ich neige zu: Admin genügt.* Der **Mailzugang** dahinter bleibt beim
   Eigentümer, daran ändert sich nichts. **Begründe, wenn du es anders siehst.**

---

3. DIE MISSBRAUCHSSEITE — DREI DINGE, UND SIE SIND NICHT DASSELBE.

   * **Die Anmeldebremse greift an der Anfrageroute**, mit unangetasteten
     Kennwerten und ohne Namenshälfte — genauso wie an den beiden Tokenrouten
     aus 0.8.80.
   * **Der Deckel** begrenzt, was die Tabelle aufnimmt (siehe Punkt 1).
   * **Die immer gleiche Antwort** verhindert das Durchprobieren von Namen und
     Adressen. **Das ist die schwerste der drei**, denn sie muss auch dann
     halten, wenn die Wege verschieden lang sind: eine Anfrage, die eine Mail
     verschickt, dauert länger als eine, die still verworfen wird. **Miss das,
     behaupte es nicht** — und wenn die Zeiten auseinanderlaufen, ist das ein
     Befund und eine Entscheidung, keine Fußnote.

---

LESEWEGE — WAS DU WIRKLICH BRAUCHST:

* **Am Stück lesen:** dieser Auftrag, **Konzeptpapier Abschnitt 10 und 11**
  (die Abschnitte, nicht das Papier), `Doku/Aenderungsprotokoll_0.9.0.md`
  Abschnitte zum Versand und zur Frist.
* **Abschnittsweise, über die Überschriften angesteuert:** Projektstand
  Abschnitt 2 (Betriebsstand und Einspielweg), 3 (Zugang und Verschlüsselung —
  Tokens, Anmeldebremse, öffentliche Adresse, Sicherheitsprotokoll), 4 (die
  Karten), 5 (Entscheidungen), 6 (**Stolpersteine 20, 61, 74, 81, 90, 102,
  106, 137, 138, 145**), 7 (Prüfstand), 11 (was bindet), 12 (Arbeitsweise samt
  Sprachregel).
* **Gezielt greppen, nie am Stück lesen:** `pruefung.js` (über 20 000 Zeilen).
  Was du brauchst, findest du über `gruppe('…')`, `F_ROUTEN`,
  `starteWeiterenServer`, `PRUEFLAGEN`, `baueDom`, `smtpEmpfaenger` und
  `PORT_VERSATZ`.
* **Der Quelltext, den es wirklich braucht:** `mail.js` (ganz — es sind 355
  Zeilen), `auth.js` (`VORGAENGE`, `MERKMALE`, `protokolliere`, der Tokenteil
  samt `beginneTokenFrist`, die Anmeldebremse), `server.js`
  (`GET /api/config`, `getSetting`/`putSetting`, `mailKarte`,
  `versendeTokenLink`, `POST /api/users`, die beiden Tokenrouten), `db.js`
  (das Schema als DDL), `public/app.js` (die Anmeldeseite, `showEinladung`,
  `renderSystem`, die Karte „Mailversand").
* **Nicht lesen, solange keine bestimmte Frage dorthin führt:** die
  Änderungsprotokolle vor `0.8.80`, das Videopapier, das Ideenpapier,
  `schluessel.js`, `anhaenge.js`, `keys.js`.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies nach den Lesewegen. Nicht mehr, und nicht am Stück.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst.
3. **Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen.** Die sieben Fragen aus Punkt 1 und die aus den Punkten 2
   und 3 gehören hierher, nicht in den Bau. **Unstimmigkeiten zwischen
   Konzeptpapier, Projektstand und Quelltext sagst du jetzt.**
4. Erst nach meinem OK bauen. Gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
5. **Der SMTP-Empfänger aus 0.9.0 wird wiederverwendet, nicht neu gebaut.**
   Seine Portbasis steht in der Liste, die der Wächter nachrechnet; kommt eine
   weitere Prüflage mit eigener Basis dazu, wird sie **ausgerechnet, nicht
   geschätzt** (Stolperstein 127 und 64) — keine entstehende Nummer darf auf
   der Sperrliste liegen: 4045, 4190, 5060, 5061, 6000, 6566, 6665–6669, 6679,
   6697, 10080.
6. Neue Prüfungen in `pruefung.js`. **Was mindestens hineingehört**, und die
   Liste ist keine Obergrenze:
   * **die immer gleiche Antwort** — fünf Lagen, Statuscode und Rumpf Byte für
     Byte gleich, dazu die Laufzeiten;
   * **der Schalter aus:** die Route weist ab, das Formular erscheint nicht,
     `GET /api/config` sagt es;
   * **der Schalter lässt sich ohne durchgekommene Testmail nicht einschalten**
     — und nach einer Änderung am Mailzugang auch nicht mehr;
   * **die Bestätigungsmail geht am echten SMTP-Gespräch hinaus**, Empfänger,
     Absender und Link stimmen, und ihr Link **legt keinen Zugang an**;
   * **die unbestätigte Anfrage erscheint beim Admin NICHT** — und verfällt;
   * **der Deckel:** die einundzwanzigste Anfrage wird verworfen, die Liste
     bleibt bei zwanzig, und die Antwort ist dieselbe;
   * **die Freischaltung:** aus der Anfrage wird ein Zugang **mit** Token, die
     Zeile ist weg, die Protokollzeilen stehen, und der Token öffnet den
     Passwortweg aus 0.8.80 **unverändert**;
   * **die Ablehnung:** die Zeile ist weg, **kein** Zugang entstanden, die
     Protokollzeile steht — und der Name steht **nicht** darin;
   * **die Rolle:** aus einer Anfrage wird nie etwas anderes als `user`,
     auch nicht mit einer mitgeschickten Rolle in `body`, `query` oder Kopf;
   * **die Anmeldebremse greift an der Anfrageroute**, mit unangetasteten
     Kennwerten;
   * **`F_ROUTEN` trägt die neuen Routen mit ihrer Art**, und die **Zahl** wird
     ausdrücklich geprüft;
   * **die Karte am Bildschirm:** die Liste der offenen Anfragen mit
     Freischalten und Ablehnen, jedes über ein **wirklich zugestelltes**
     Ereignis (Stolperstein 61), und die rote Zeile, wenn der Versand kaputt
     ist, während der Schalter an bleibt;
   * **zu jedem Feld, das die Oberfläche aus der Antwort liest, eine Prüfung an
     der echten Antwort** (Stolperstein 102) — das ist die Quelle von vier
     stummen Gegenproben der Vorrunde;
   * **die neue Tabelle wächst bei jedem Start nach**, an einer Anlage ohne sie
     nachgestellt, samt der Gegenlage an einer Spalte (Stolperstein 20);
   * **die gekürzten Zeilen aus Punkt 0** stehen am Bildschirm und im Mailtext;
   * **die Abhängigkeitszahl bleibt, wo sie ist** — diese Runde nimmt keine
     auf;
   * **der Sprachwächter bleibt grün** — er sieht auch die Papiere dieser Runde
     an.
7. **Kein Migrationsabschnitt im Prüfstand** — es gibt keinen Block.
   Stattdessen die Probe: das Schema einer gewachsenen Anlage ist nach dem
   Start dasselbe wie das einer frischen. **Sag es ausdrücklich.**
8. **Die Gegenproben laufen über `gegenprobe.js`** und liefern **eine**
   Tabelle. **Nenn im Vorschlag, welche Rückbauten du fahren willst.** Ich
   erwarte **mindestens zwanzig**, und die Liste wird **gegen die Liste der
   neuen Verhaltensweisen gehalten**, nicht gegen ein Gefühl für die Zahl.
   Darunter mindestens: die gleiche Antwort, der Deckel, die stille
   Verwerfung, das Verfallen, die Kopplung des Schalters, die Passwortlosigkeit
   des Bestätigungslinks, die feste Rolle `user`, die Anmeldebremse, die
   Protokollzeile ohne Namen, und der Tokenweg aus 0.8.80 unverändert.
   **Ein Rückbau, der KEINE Prüfung rot macht, ist ein FUND** und wird
   untersucht, nicht abgehakt — in der Vorrunde waren zehn darunter, und einer
   davon hat tote Zeilen im Quelltext aufgedeckt.
   **Zwei Worte aus 0.9.0 gelten weiter:** ein Rückbau, der seine Spur zum
   Stehen bringt, läuft in die Zeitgrenze und heißt so (Stolperstein 146) —
   und ein schlecht gezielter Rückbau nimmt die **Wirkung** weg statt den
   **Mechanismus** und wird dann rot statt stumm.
9. **DREI PRÜFLÄUFE:** einer nach dem Bau, einer nach den neuen Prüfungen,
   einer zum Schluss gegen genau den Stand, der geschoben wird.
10. **KEINE HILFSDATEIEN IM ARBEITSBAUM.** Was du zum Messen brauchst, läuft
    über `node -e` oder liegt außerhalb des Repos.

---

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.**
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens.
  Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.9.1` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`).
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch keine für den Prüfstand.
  `nodemailer` war die Ausnahme einer Runde und bleibt es.
* **Keine Zugangsdaten im Chat.** Kein Mailpasswort, kein Schlüssel, kein
  Token — weder von dir noch von mir. Die Prüfungen arbeiten mit erfundenen
  Werten, und das genügt. **Das gilt auch für eine Mail, die aus dem Betrieb
  hereingereicht wird:** ein echter Einladungslink ist ein Passwortersatz auf
  Zeit. Kommt einer trotzdem ins Gespräch, **sagst du es und nennst das
  Gegenmittel**, statt darüber hinwegzugehen.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106) — Ausnahme bleibt der Sprachwächter.
* **Ein Mock antwortet wie der echte Server** (Stolperstein 90). Der DOM-Mock
  bekommt die neuen Endpunkte, **und er liefert nicht selbst, was die Prüfung
  belegen soll** (Stolperstein 102).
* **Wird es zu viel für einen Durchgang, sag es, sobald du es kommen siehst —
  nicht hinterher.** Der Schnitt läge dann hinter der Bestätigungsmail und vor
  der Freischaltung; der Rest würde 0.9.2.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde steht
  die Antwort vorbehaltlich da:** eine neue Tabelle, keine neue Spalte, also
  kein Block. `CREATE TABLE IF NOT EXISTS` legt sie bei jedem Start an
  (Stolperstein 13).
* Das Schema bleibt vollständige DDL in `db.js`.
* Einmaliger Migrationscode stünde gebündelt in `migration091()` mit der Marke
  `// MIGRATION 0.9.x — ENTFAELLT MIT 1.0`. **Er wird voraussichtlich nicht
  gebraucht — und wenn du meinst, doch, ist das ein Grund anzuhalten und zu
  fragen, kein Grund, ihn einzubauen.**

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.9.1.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, neue Stolpersteine (**die Zählung setzt
  bei 149 fort** — 141 bis 148 sind vergeben), die Gegenprobentabelle **aus
  `gegenprobe.js`**, Prüfungszahlen vorher/nachher (vorher: **3192**),
  Offengebliebenes.
* Die Zeile „0.9.1 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  als PFLICHT** — es ist eine Datenbankstufe. **Neue Zeilen in der `.env` gibt
  es nicht**; sag es ausdrücklich, statt es offenzulassen.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Darunter der eine, der diese Runde belegt:** den
  Schalter einschalten, eine Anfrage stellen, die Bestätigungsmail bekommen,
  freischalten, das Passwort setzen.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg, Abschnitt 3, Funktionsumfang,
  Abschnitt 5 um die Entscheidungen dieser Runde, Stolpersteine, Prüfstand,
  Versionsgeschichte, Stufenplan, Abschnitt 11 — dort **fallen die eingelösten
  Merkposten heraus**). Der Projektstand trägt die Version im Dateinamen und
  wird umbenannt (`git mv`); alle Verweise sind nachzuziehen.
* **Das Konzeptpapier wird ANGEFASST — es ist eine Stufe, und es ist die
  letzte.** Stufe I₂ wird als erledigt eingetragen, Abschnitt 10 wird auf das
  gebracht, was **gebaut** ist, und die Datei wird nach
  `Konzept_Mehrbenutzerbetrieb_Kriterion_0_9_1.md` umbenannt (`git mv`), mit
  allen Verweisen. **Schreib den Satz hin, der feststellt, dass der Stufenplan
  abgearbeitet ist** — und was von dem Papier ab jetzt noch gilt: die
  Entscheidungen, nicht die Stufen.
* Die README bekommt die Selbstanmeldung: der Schalter, **dass
  `OEFFENTLICHE_ADRESSE` und ein geprüfter Mailzugang seine Voraussetzung
  sind**, der Weg vom Formular bis zum Passwort, und **dass die Anlage ohne
  all das vollständig läuft** — dann legt eben nur der Admin an.
* **`Doku/Changelog.md` bekommt einen Abschnitt für diese Runde** — drei Blöcke
  wie bei den vorhandenen Einträgen. **Der Satz, der dort nicht fehlen darf:**
  niemand kommt durch die Selbstanmeldung herein, ohne dass ein Admin ihn
  hereinlässt.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.**
  Den weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber
  getestet ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser
  hier wird dabei entfernt** — es liegt immer nur einer im Repo, so wie
  `Doku/Auftrag_0.9.0.md` beim Anlegen dieses Papiers weggefallen ist.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **Der Schlüsselwechsel auf der echten Anlage steht an** — geprobt ist er
  (elf Sekunden Stillstand an 662,5 MB), gefahren noch nicht. Er läuft über
  `./schluessel.sh wechseln` auf dem Wirt und **braucht keine Runde und keinen
  Auftrag**; das Ergebnis gehört in den Projektstand, Abschnitt 2.
* **0.9.10 — Zwei-Faktor.** TOTP und Wiederherstellungscodes. Die zweite
  Bestätigung aus 0.8.90 ist die Stelle, an der er zusätzlich gefragt würde.
  **Und die Bindung aus dem Konzeptpapier gilt dort:** ein zweiter Faktor
  braucht kein Netz und darf nie ausfallen — der Satz „E-Mail ist
  Bequemlichkeit, nie Voraussetzung" trägt dort **nicht**.
* **Eine Runde für Fehlerbehebung und Nacharbeit, etwa auf 0.9.20.** Der
  Stufenplan ist mit dieser Runde durch; danach ist der richtige Zeitpunkt,
  das Aufgelaufene abzuräumen statt weiterzubauen.
* **Ein Versanddienst über HTTPS**, falls SMTP am Anschluss nachweislich nicht
  durchkommt. Zweiter Weg im Code, ohne Bibliothek, mit `fetch`.
* **Ein echter Teillauf im Prüfstand.** `pruefung.js` ist EIN Ablauf; der
  Namensfilter filtert die Ausgabe, nicht die Arbeit. `gegenprobe.js` und
  `PORT_VERSATZ` mildern das, sie beheben es nicht.
* **Der Zähler „Offen 7" in der Kopfzeile** aus 0.8.60 wird bei jedem
  Seitenaufbau gebraucht.
* **Teil II des Videopapiers — große Dateien bis 2 GB**, beschlossen für 1.1.0.
