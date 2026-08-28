Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Sammelblatt, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an
einer Kopie.

AUFTRAG: **Version 0.12.3 — „Der Export sagt Bescheid, und die Anzeige zieht
nach."**
**Eine PATCH-Runde, und sie ist die erste, die aus dem neuen Fahrplan kommt** —
Projektstand, Abschnitt 10a, dort steht jeder Punkt dieser Runde vollständig
ausgearbeitet.

WORAUF SIE AUFSETZT: 0.12.2 ist gebaut, geschoben **und im Feld bestätigt**,
Fingerprint `e30a19c1`, **3856 Prüfungen**, **172 Rückbauten** in
`gegenprobe.js`, `F_ROUTEN` bei **69**, Formatnummer **10**, **fünf** markierte
Migrationsblöcke, Stolpersteine bis **181**, **neunzehn** Karten im
Systembereich, **elf** Vokabulareinträge, **zwanzig** Vorgänge im
Sicherheitsprotokoll, **dreizehn** Merkmale. Laufzeitabhängigkeiten:
`better-sqlite3-multiple-ciphers`, `express`, `multer`, `sharp`, `nodemailer`.

WAS SICH ÄNDERT, IN EINEM SATZ: Der Export nennt seine Größe, bevor er versucht
wird — und neun kleine Dinge an der Oberfläche, die bei der Durchsicht vom
28. August aufgefallen sind, werden richtiggestellt.

**DIESE RUNDE HAT EINEN ANDEREN CHARAKTER ALS DIE LETZTEN DREI.** 0.12.0 bis
0.12.2 waren eine Sache mit drei Nachschlägen. **Hier liegen zehn Punkte
nebeneinander, die fast nichts miteinander zu tun haben** — einer ist ein
eingetretener Fehler, neun sind Anzeige. Der Schnitt, falls einer nötig wird,
liegt zwischen Punkt 1 und allem Übrigen.

---

0. WAS VOR DEM ERSTEN HANDGRIFF ZU TUN IST — DREI PUNKTE.

   * **DER FINGERPRINT DER LAUFENDEN ANLAGE IST ZU BESTÄTIGEN.** Der Branch
     misst `e30a19c1`, und das Änderungsprotokoll 0.12.2 nennt denselben Wert.
     **Frag ihn trotzdem an der laufenden Anlage ab, bevor du irgendetwas
     baust** — Karte „Kennzahlen" im Systembereich. *Bei 0.9.1 hat sich dort eine
     Datei zu viel gezeigt (Stolperstein 158): der Server lief einwandfrei, jede
     Prüfung war grün, und trotzdem stand auf dem Wirt ein Stand, den kein Commit
     hatte.* Stimmt er, ist der Punkt in einem Satz erledigt; stimmt er nicht,
     ist das der erste Befund dieser Runde und geht allem anderen vor.

   * **DIE BLOB-SUMME IST ZU MESSEN, UND SIE ENTSCHEIDET, OB PUNKT 1 EIN FEHLER
     IST.** Der Betreiber nennt 973 Bilder und eine Datenbankdatei von rund
     660 MB. Als Base64 wären das ungefähr 880 MB in **einem** JSON-String, und
     Nodes Grenze liegt bei etwa 512 MB. **Die Dateigröße ist aber die falsche
     Grundlage** — sie trägt Indizes, das Sicherheitsprotokoll und freie Seiten
     aus Gelöschtem, die Schätzung fiele damit zu hoch aus. Die ehrliche Zahl ist
     eine Abfrage:

     ```sql
     SELECT (SELECT COALESCE(SUM(length(data)),0) FROM photos)
          + (SELECT COALESCE(SUM(length(thumb)),0) FROM photos)
          + (SELECT COALESCE(SUM(length(medium)),0) FROM photos)
          + (SELECT COALESCE(SUM(length(data)),0) FROM attachments)
          + (SELECT COALESCE(SUM(length(data)),0) FROM comment_images)
          + (SELECT COALESCE(SUM(length(thumb)),0) FROM comment_images) AS blob_bytes;
     ```

     **Diese Zahl mal vier Drittel gegen 512 MB — das ist der Befund.** Fällt sie
     darüber, ist der Export der laufenden Anlage **kaputt** und niemand hat es
     bemerkt, weil ihn niemand gebraucht hat; dann ist Punkt 1 ein Fehler und
     rechtfertigt die Runde allein. Fällt sie darunter, ist er eine Verbesserung
     — **bau ihn trotzdem, aber schreib die Zahl auf und stell die Art am Punkt
     richtig.** *Sag mir die Zahl, bevor du weiterbaust.*

   * **Der Git-Tag: nachsehen, ob er inzwischen durchgeht.** `v0.10.0`, `v0.11.0`
     und die drei aus 0.12.x scheiterten in der Arbeitsumgebung an `HTTP 403` —
     Branches gehen durch, Tags nicht. **Leg ihn trotzdem an und schreib auf, ob
     es diesmal ging.** *An der Anlage ändert es nichts; der Vergleichsverweis
     unten in `CHANGELOG.md` zeigt ins Leere, solange er fehlt.*

---

1. DER EXPORT SAGT, WIE GROSS ER WIRD — DER EINZIGE FEHLER DIESER RUNDE.

   **Die Ausarbeitung steht im Projektstand, Abschnitt 10a, unter 0.12.3,
   „Export und Import laufen vollständig durch den Arbeitsspeicher".** Lies sie,
   bevor du anfängst; hier steht nur, was sie nicht sagt.

   **Was heute ist:** `GET /api/export` antwortet mit
   `res.json(exportUmschlag(items))` — **ein** JSON-String, in dem jedes Foto,
   jedes Video und jeder Anhang als Base64 steckt. Der Import nimmt bis 900 MB
   über `multer.memoryStorage()` entgegen.

   **Zu bauen sind zwei Dinge, und das dritte ausdrücklich nicht:**

   **(a) Die Kennzahlen nennen die erwartete Exportgröße.** Der Systembereich
   zeigt heute die Dateigröße der Datenbank (`fs.statSync(DB_FILE).size` nach
   einem `wal_checkpoint`). Daneben gehört die **Blob-Summe mal vier Drittel plus
   Umschlag**. *Es ist dieselbe Zahl, die Punkt 0 misst — sie gehört gebaut und
   nicht einmal von Hand ausgerechnet.*

   **(b) Ein Hinweis ab einem Schwellwert.** *„Export mit Fotos: rund 2,1 GB —
   das übersteigt, was in einem Zug erzeugt werden kann. Nimm die Sicherung."*
   Mit Verweis auf den anderen Weg. **Ein Knopf, der nach zwei Minuten mit einem
   Speicherfehler abbricht, ist die schlechteste Variante** — er sieht aus wie
   ein kaputtes Programm und ist eine erreichte Grenze.

   **(c) Der Export als Strom wird NICHT gebaut.** Er ist ein Umbau an einer
   Stelle, die nachweislich funktioniert, und die Sicherung über `VACUUM INTO`
   ist seit 0.8.70 ohnehin der Hauptweg. *Stellt sich beim Bauen heraus, dass (a)
   und (b) den Fall nicht abfangen, ist das ein Grund anzuhalten und zu fragen —
   kein Grund, (c) mitzunehmen.*

   **DREI FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Welcher Schwellwert?** 512 MB ist die harte Grenze des Strings. Ein
     Warnwert deutlich darunter — **300 MB** — lässt Luft für den Umschlag und
     die Base64-Rundung. *Zu nennen ist die Zahl, bei der es kippt, nicht die,
     bei der es unbequem wird.* **Nenn deine Zahl und den Grund.**
   * **Warnt die Anlage nur, oder verweigert sie?** Verweigern schützt vor dem
     Abbruch, nimmt aber jemandem den Export weg, der weiß, was er tut. *Ich
     neige zu: warnen, und den Knopf trotzdem lassen.* **Entscheide und
     begründe.**
   * **Gilt derselbe Hinweis beim Import?** Dort ist die Dateigröße vorher
     bekannt — die Grenze könnte also **vor** dem Hochladen genannt werden statt
     danach. *Ich neige zu: ja, und es ist der billigere der beiden Fälle.*

   **UND DIE ZAHL GEHÖRT AUFGETEILT, NICHT NUR SUMMIERT.** Im Sammelblatt stand
   dazu eine eigene Zeile — **„Anzeige des Speicherverbrauchs"**, Fotos, Videos,
   Anhänge, Kommentarbilder je einzeln. *Es ist dieselbe Abfrage, ein anderer
   Zweck, und beides in einem Zug zu bauen kostet fast nichts.* Sie steht mit im
   Fahrplan unter dieser Runde.

---

2. NEUN DINGE AN DER OBERFLÄCHE — UND SIE HÄNGEN NICHT ZUSAMMEN.

   **Alle neun stehen ausgearbeitet im Projektstand, Abschnitt 10a, unter
   0.12.3.** Hier stehen nur die Fundstellen und das, was beim Bauen schiefgehen
   kann.

   **2a. `content-visibility` an der Kachel.** *Zwei Zeilen Stylesheet, kein
   JavaScript, und der größte messbare Gewinn dieser Runde.*
   **Was NICHT gebaut wird: Nachladen beim Rollen.** Es steht als „später" im
   Fahrplan, und zwar ausdrücklich **erst dann, wenn (2a) gemessen zu wenig
   gebracht hat.** Blättern mit Seitenzahlen **gar nicht**, weder jetzt noch
   später — es zerschnitte die Suche, und alle Filter und alle elf Sortierungen
   laufen örtlich über den **ganzen** Bestand.
   **Die eine Zahl, die du entscheiden musst:** `contain-intrinsic-size` braucht
   eine geschätzte Kachelhöhe, und sie ist auf Telefon und Desktop verschieden.
   **Zu klein geschätzt springt der Rollbalken, zu groß bleibt Leerraum unter der
   Liste.** *Miss sie, statt sie zu raten.*

   **2b. Die Farbregel am Kommentar.** Heute gilt (`style.css:1345`): linke Kante
   3px in der Farbe der Art, die drei übrigen 1px in Gold. **Künftig: die linke
   Kante bleibt, wie sie ist — Farbe und Breite —, und die drei übrigen nehmen
   dieselbe Farbe an. Eine angepinnte Notiz, die keine eigene Farbe hat, bekommt
   alle vier Kanten in Gold.**
   **Die Falle, die dabei NICHT entsteht, und der Grund gehört ins Protokoll:**
   würde die linke Kante beim Anpinnen dünn, müsste `padding-left` von 10 auf 12
   zurück — sonst begännen die Zeilen angepinnter und nicht angepinnter
   Kommentare auf zwei verschiedenen Linien (Befund C aus 0.12.0, andersherum).
   **Weil die dicke Kante bleibt, ändert sich keine einzige Breite.**
   **Und die vorhandene Begründung im Stylesheet wird UMGESCHRIEBEN, nicht
   gelöscht** — sie sagt heute *„zwei Merkmale, zwei Kanäle"*, und diese
   Entscheidung wird zurückgenommen. *Eine zurückgenommene Entscheidung mit dem
   Grund daneben ist mehr wert als eine verschwundene.*

   **2c. `⌀ 4,2 (3)` am Kriterium.** Heute steht dort `4,2 · 3`
   (`app.js:3690`). Die Kopfzahl darüber schreibt bereits `⌀ 4,2 gewichtet` —
   **die Zeile darunter soll dieselbe Form sprechen.** Dazu ein `title` im
   Klartext: ein Symbol allein liest kein Vorleseprogramm vor.

   **2d. „offen" in der Kopfzeile der Kommentare.** Heute: *„12 Kommentare, davon
   3 Berichte und 5 Aufgaben (2 Erledigt)"*. Künftig `5 Aufgaben (3 offen,
   2 erledigt)`. **Die Verschachtelung bleibt wahr** — das Erledigte steckt
   weiterhin *in* den Aufgaben, sonst schrumpfte die Zahl beim Abhaken.
   **Die Klammer erscheint nur, wenn überhaupt etwas erledigt ist**, sonst stünde
   da „5 Aufgaben (5 offen)".

   **2e. Ein Sprungknopf `+ Kommentar` im Blockkopf.** Er sitzt in genau der
   Kopfzeile, die 2d anfasst. **Ausdrücklich KEIN zweites Formular in einem
   Dialog:** das vorhandene trägt Bilder-Einfügen, Anpinnen, Art-Umschalter und
   Mitwachsen, und ein zweites davon wären zwei Wahrheiten über dasselbe
   Formular.

   **2f. „mehr" ans Ende der Tags-Zeile.** Heute steht der Verweis als
   Geschwister hinter der Wolke und rutscht auf eine eigene Zeile. **Auf der
   Eintragsseite passt es, weil dieselbe Sache dort anders gebaut ist:** dort
   sitzt „mehr" in der Beschriftungszeile über der Wolke (`.wolke-kopf`,
   `space-between`). **Die Übersicht soll tun, was die Eintragsseite tut** —
   `margin-left: auto` ans rechte Ende der Zeile mit **TAGS** und **Und / Oder**,
   die ohnehin da und rechts leer ist.
   **Was NICHT gebaut wird: „mehr" in die Wolke legen und rechts Platz
   freihalten.** Die Wolke wird beschnitten (`max-height` und
   `overflow: hidden`), der Verweis würde mitabgeschnitten — und ein fest
   ausgerechneter Freiraum ist genau der Fehler, an dem 0.12.1 schon einmal hing
   (`right: 92px`, Befund A). **Die Anlage stellt die Schrift von 80 bis 120
   Prozent; eine ausgerechnete Breite kann dabei nur falsch werden.**
   **Und der Nebenbefund gehört ins Protokoll:** dieselbe Wolke wird an zwei
   Stellen verschieden gebaut. *Entscheide, ob das in dieser Runde
   zusammengeführt wird oder ob es als Befund stehenbleibt — beides ist
   vertretbar, stillschweigend übergehen nicht.*

   **2g. Die Versionszeile: das Zeichen davor.** `marke-dunkel.svg` ist die
   Fassung ohne dunkle Kachel, und `app.js:90` hat dafür bereits einen Helfer.
   In `zeigeVersion()` ist es ein Aufruf. **Das Bild bekommt `alt=""` und eine
   Größe in `em`**, damit es mit der 0,67rem-Schrift mitwächst.

   **2h. Die Versionszeile: der Abstand darunter — und das ist ein
   Telefonbefund, kein Desktopbefund.** Die Zeile steht auf
   `margin-bottom: calc(26px + env(safe-area-inset-bottom))`, und auf der
   Anmeldeseite drückt der Flex-Aufbau von `body.anmeldung` sie ohnehin ans
   untere Ende — die 26 Pixel und der Streifen für den Home-Indikator kommen
   obendrauf. **Der Betreiber hat es vor 0.12.0 gesehen; seither ist es größer
   geworden. Am Desktop passt es.** *Fass deshalb nur die Anmeldeseite an, nicht
   die Zeile im Allgemeinen.*

   **2i. Version und Verfahren in den Kennzahlen — NEIN, DAS NICHT.** Es steht im
   Fahrplan unter **0.15.0** und nicht hier. *Es wird hier nur genannt, damit
   niemand es beim Anfassen der Kennzahlen für Punkt 1 „gleich mitnimmt".*

---

3. DREI ZEILEN IN DIE README, UND SIE KOSTEN KEINEN QUELLTEXT.

   Sie stehen im Fahrplan unter 0.13.0 als Teil (d) und (e) von „Gescheiterte
   Anmeldungen" — **aber sie fassen keinen Code an und können deshalb hier
   mitgehen.** *Entscheide selbst, ob du sie mitnimmst; wenn du sie lässt, sag es
   ausdrücklich.*

   * **CrowdSec über das Zugriffsprotokoll des Proxys.** Die Antworten der
     Anmelderoute sind **bereits sauber unterscheidbar**: **401** (Name oder
     Passwort falsch), **429** (ausgebremst), **403** (Passwort richtig, Zugang
     gesperrt). Der Betreiber fährt Nginx Proxy Manager, und dessen Protokoll
     sieht jede dieser Antworten. **Ein Szenario auf `POST /api/login` mit
     401/403/429 sperrt die Adresse heute, ohne dass an Kriterion eine Zeile
     geändert wird.**
   * **Die Rotation des Containerprotokolls ist Dockers Sache**, nicht
     Kriterions: vier Zeilen `logging: driver: json-file` mit `max-size` und
     `max-file` in der `docker-compose.yml`.
   * **Und der Satz, der dazugehört:** das Sicherheitsprotokoll räumt sich schon
     selbst (`PROTOKOLL_TAGE = 180`, beim Start und beim Öffnen der Karte). *Wer
     nach einer Rotation dafür sucht, soll sie nicht bauen.*

   **WAS AUSDRÜCKLICH NICHT IN DIESE RUNDE GEHÖRT:** eine eigene Ausgabezeile
   nach stdout. Sie steht im Fahrplan unter 0.13.0 und hängt an der richtigen
   Adressermittlung — **ohne den Proxy-Punkt sperrte CrowdSec den Proxy statt den
   Angreifer.**

---

4. WAS DIESE RUNDE NICHT ANFASST — UND DAS IST DER GRÖSSERE TEIL DER LISTE.

   Der Fahrplan hat sechs Runden. **Fünf davon sind nicht diese.** Damit beim
   Bauen niemand „das passt doch gerade" denkt:

   | Nicht jetzt | Wann | Warum nicht hier |
   |---|---|---|
   | Proxy, CrowdSec-Zeile, gelöschte Zugänge | **0.13.0** | fasst `auth.js` an, und der Prüfstand muss dafür beide Wege fahren |
   | `rejected_at`, `rejected_grund`, `rejected_von` | **0.14.0** | **Schema und Formatnummer** — eine Schema-Runde verträgt keine Beifracht |
   | Systembereich in Abschnitte, `renderSystem()` zerlegen, Glocke, Gewichtung | **0.15.0** | die größte Umbaufläche des Plans |
   | Trefferkontext in der Suche | **0.16.0** | eigene Prüflage gegen `innerHTML` |
   | Migrationscode raus, Absage an alte Datenbanken | **0.17.0** | **muss NACH 0.14.0**, sonst überlebt deren Block den Rückbau |

   **Und die drei Punkte im Sammelblatt haben gar keine Nummer**, weil keiner
   gebaut werden soll: „Entfällt am einzelnen Kriterium" und „Der QR-Encoder"
   sind `nicht empfohlen`, „Zwei Einträge zu einem machen" ist `später`.

---

5. DIE ZAHLEN AM ENDE.

   * **Die Kennzahl aus Punkt 0 und Punkt 1 — vorher und nachher**, an derselben
     Bestandsgröße: Blob-Summe, geschätzte Exportgröße, Dateigröße der Datenbank.
   * **Der Gewinn aus 2a, gemessen und nicht behauptet:** die Zeit bis zur ersten
     sichtbaren Kachel, **auf dem Telefon**, vorher und nachher. *Nicht die
     Antwortzeit des Servers — die ändert sich nicht.* Ohne diese Messung ist
     „Nachladen beim Rollen" später Arbeit auf Verdacht.
   * **Prüfungszahlen vorher/nachher.** Vorher: **3856**.
   * **Gegenproben.** Vorher: **172 Rückbauten.** *Der volle Lauf über alle steht
     seit drei Runden aus; wenn er in dieser Runde läuft, schreib es auf.*

---

DIE NUMMER:

* **DIE NUMMER IST BEGRÜNDET, NICHT GESETZT.** 0.12.3 ist **PATCH**, und die
  Begründung ist die Frage, die 0.12.1 schon einmal beantwortet hat: *kann die
  Anlage nach dieser Runde etwas, was sie vorher nicht konnte?* **Nein.** Der
  Export exportiert weiterhin; er bricht nur nicht mehr wortlos ab. Die neun
  Anzeigepunkte nehmen nichts weg und legen nichts an. *Der Fahrplan sieht für
  genau diesen Fall die Zeile „0.12.x — Fehlerbereinigung und Verbesserungen,
  die nächste freie PATCH-Zahl" vor.*
  **Sieh trotzdem genau hin:** die Kennzahlen bekommen eine Zahl, die es vorher
  nicht gab. *Wenn du meinst, das kippt die Nummer auf MINOR, sag es mit
  Begründung — und dann heißt die Runde 0.13.0 und alles dahinter rückt.*
* **NICHTS WIRD UNTER EINER SCHON HERAUSGEGEBENEN NUMMER NACHGESCHOBEN.** Kommt
  nach 0.12.3 etwas nach, heißt es 0.12.4.
* **`CHANGELOG.md` bekommt den Eintrag `## [0.12.3] - <JJJJ-MM-TT>`**, Datum
  nach ISO 8601, neueste Version oben, darunter die zutreffenden von **`Added` ·
  `Changed` · `Deprecated` · `Removed` · `Fixed` · `Security`** — englisch, leere
  weggelassen. **Dahinter die beiden eigenen Abschnitte**: „Was du danach von
  Hand tun musst" und „Was gleich bleibt".
* **DER ABSCHNITT `## [Unreleased]` WIRD MITGESCHRIEBEN, WÄHREND GEBAUT WIRD** —
  nicht am Schluss aus dem Gedächtnis gefüllt.
* **DIE VERSION BEKOMMT EINEN GIT-TAG**, `v0.12.3` auf den Commit, der
  herausgeht, und die Vergleichsverweise unten in `CHANGELOG.md`.

---

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Abschnitt 12 des Projektstands.** `Tag`, `Token` und `Index`
  sind Fachbegriffe und bleiben. *Die sechs Abschnittsnamen im Changelog bleiben
  englisch.*
* **„Desktop" und nicht „Schreibtisch".** Festgelegt am 28. August 2026 für die
  lebenden Papiere; die Änderungsprotokolle bleiben, wie sie sind. *Die
  „Schreibtischschublade" in der README ist ein echter Schreibtisch und bleibt.*
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens.
  Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.12.3` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`).
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch keine für den Prüfstand.
* **Keine Zugangsdaten im Chat.** Kein Passwort, kein Schlüssel, kein Token, kein
  TOTP-Geheimnis, kein Wiederherstellungscode — weder von dir noch von mir.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Eine Probe, die ihren Maßstab vom Prüfling bezieht, kann nicht scheitern**
  (Befund B aus 0.12.0) — bei 2a wird gegen die **angeforderte** Fensterbreite
  gemessen, nicht gegen `window.innerWidth`.
* **Ein Mock antwortet wie der echte Server** (Stolperstein 90), **und er
  liefert nicht selbst, was die Prüfung belegen soll** (Stolperstein 102).
* **`jsdom` misst jede Höhe als null.** Das trifft 2a unmittelbar: die Wirkung
  von `content-visibility` ist im Prüfstand **nicht** nachweisbar. *Sag
  ausdrücklich, was du statt dessen prüfst — dass die Regel dasteht, ist keine
  Prüfung ihrer Wirkung.* **Und das ist derselbe Mangel, der im Sammelblatt
  unter „Am Prüfstand" steht; wenn diese Runde ihn schärfer sichtbar macht,
  schreib es dort nach.**
* **Wird es zu viel für einen Durchgang, sag es, sobald du es kommen siehst —
  nicht hinterher.** Der Schnitt liegt zwischen Punkt 1 und Punkt 2.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde steht die
  Antwort vorbehaltlich da: KEIN SCHEMA, KEIN MIGRATIONSBLOCK, KEINE
  FORMATNUMMER.** Punkt 1 rechnet über vorhandene Spalten, Punkt 2 fasst nur die
  Oberfläche an. **Wenn das nach deiner Durchsicht nicht stimmt, ist das ein
  Grund anzuhalten und zu fragen.**
* Das Schema bleibt vollständige DDL in `db.js`.
* **`F_ROUTEN` bleibt bei 69** — es kommt keine schreibende Route dazu, und die
  Zahl wird geprüft. *Prüf, ob das stimmt.*

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer sein,
  und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.12.3.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, neue Stolpersteine (**die Zählung setzt bei
  182 fort** — 181 ist vergeben), die Gegenprobentabelle **aus `gegenprobe.js`**,
  Prüfungszahlen vorher/nachher (vorher: **3856**), Offengebliebenes. **Und die
  Messwerte aus Abschnitt 5.**
* Die Zeile „0.12.3 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen. **Und `public/` gehört dazu**:
  er geht über ALLES darin und nicht über eine Liste erwarteter Namen; eine Datei
  zu viel bewegt ihn genauso wie eine geänderte (Stolperstein 158).
* **Diese Runde ist KEINE Datenbankstufe** — sag es ausdrücklich, statt es
  offenzulassen. **Neue Zeilen in der `.env` gibt es nicht**; sag auch das.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Darunter die drei, die diese Runde belegen:** die
  Kennzahlen öffnen und die geschätzte Exportgröße neben der Datenbankgröße
  sehen; den Exportknopf drücken und den Hinweis bekommen statt eines Abbruchs;
  und einen angepinnten Bericht ansehen — **eine Farbe, nicht zwei.**

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand samt Einspielweg, Abschnitt 4, Abschnitt 5 um die
  zurückgenommene Entscheidung zur Kommentarkennzeichnung aus 2b, Stolpersteine,
  Prüfstand, Versionsgeschichte, **Abschnitt 10 und 10a**). Der Projektstand
  trägt die Version im Dateinamen und wird umbenannt (`git mv` auf
  `Projektstand_Kriterion_0_12_3.md`); alle Verweise sind nachzuziehen.
* **ABSCHNITT 10a WIRD GELEERT, SOWEIT ER DIESE RUNDE BETRIFFT.** Was gebaut ist,
  steht danach im Änderungsprotokoll und im Stand — **nicht mehr im Fahrplan.**
  *Ein Punkt wandert vom Sammelblatt in den Fahrplan und von dort in ein
  Änderungsprotokoll — nie zurück.* **Die fünf übrigen Runden bleiben
  unangetastet.**
* **Das Sammelblatt wird angefasst, und zwar genau an zwei Stellen:** die
  Wegweisertabelle am Anfang von Teil I bekommt den Vermerk, dass 0.12.3 gebaut
  ist; und **falls 2f den Nebenbefund zur doppelt gebauten Tagwolke stehen
  lässt**, kommt er als Zeile in Teil II. Sonst nichts.
* **DAS KONZEPTPAPIER WIRD NICHT ANGEFASST UND NICHT UMBENANNT.** Es ist mit
  0.9.1 geschlossen. **Fällt dir beim Bauen etwas auf, das dort falsch wird, ist
  das ein Befund und gehört gemeldet**, nicht stillschweigend nachgezogen.
* **DAS VIDEOPAPIER WIRD NICHT ANGEFASST.** Teil II — große Dateien bis 2 GB —
  ist im Fahrplan als „danach" vorgemerkt und gehört nicht in diese Runde.
  *Wenn die Blob-Messung aus Punkt 0 etwas ergibt, das dort hineingehört, ist das
  ein Befund und gehört gemeldet.*
* Die README bekommt den Hinweis auf die Exportgrenze — **wonach sie sich
  richtet, ab wann gewarnt wird, und dass die Sicherung der andere Weg ist.**
  Dazu, falls Abschnitt 3 mitkommt, das CrowdSec-Beispiel und die
  Protokollrotation.
* **`CHANGELOG.md` bekommt den Eintrag nach der Form von 0.12.2.** **Der Satz,
  der dort nicht fehlen darf:** ob der Export bei diesem Bestand vorher
  abgebrochen ist oder nicht — **mit der gemessenen Zahl**, nicht mit einer
  Schätzung.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.** Den
  weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber getestet
  ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser hier wird
  dabei entfernt** — es liegt immer nur einer im Repo.
