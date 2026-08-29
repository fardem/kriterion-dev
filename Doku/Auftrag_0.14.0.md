Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, Sammelblatt, Videopapier und die
Änderungsprotokolle stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an
einer Kopie.

AUFTRAG: **Version 0.14.0 — „Die Entscheidung wird mitgeschrieben."**
**Eine MINOR-Runde, und sie ist die dritte aus dem Fahrplan** — Projektstand,
Abschnitt 10a, dort steht sie ausgearbeitet. **Sie ist die erste Runde seit
0.8.50, die das Schema anfasst.** *Punkt 1 und Punkt 6 stehen nicht im
Fahrplan: es sind Befunde aus dem Betrieb und kamen später dazu.*

WORAUF SIE AUFSETZT: 0.13.2 ist gebaut und geschoben, Fingerprint `15188676`,
**4131 Prüfungen**, **218 Rückbauten** in `gegenprobe.js`, `F_ROUTEN` bei
**69**, Formatnummer **10**, **fünf** markierte Migrationsblöcke (0.8.3, 0.8.30,
0.8.31, 0.8.40, 0.8.50), Stolpersteine bis **201**, **neunzehn** Karten im
Systembereich, **elf** Vokabulareinträge, **zwanzig** Vorgänge im
Sicherheitsprotokoll, **vierzehn** Merkmale, **sieben** Zwecke der zweiten
Bestätigung. Laufzeitabhängigkeiten: `better-sqlite3-multiple-ciphers`,
`express`, `multer`, `nodemailer`, `sharp`.

WAS SICH ÄNDERT, IN EINEM SATZ: Das Häkchen „abgelehnt" wird zu einer Aussage —
mit **Datum**, **Grund** und **Verfasser** — und damit hält die Anlage endlich
auch ihr Ergebnis fest, nicht bloß den Weg dorthin. **Dazu zwei Befunde aus dem
Betrieb**, die nichts damit zu tun haben und trotzdem mitfahren: ein kaputter
Cookiewert sperrt einen Browser aus, und die Sternreihen der Kriterienliste
stehen nicht auf einer Linie.

**DIESE RUNDE HAT IHR RISIKO NICHT IN DER FUNKTION, SONDERN IM
MIGRATIONSBLOCK.** Die Funktion selbst ist klein: drei Spalten, ein Feld im
Dialog, eine Zeile an der Marke. **Der Block, der die Spalten in eine
bestehende Datenbank nachrüstet, ist der Teil, bei dem ein Fehler Daten kostet**
— und es ist der erste seit fünf Runden ohne Schema. *Der Schnitt, falls einer
nötig wird, beginnt bei Punkt 6 und geht dann zwischen Punkt 5 und Punkt 4;
**Punkt 1 wird nie geschnitten**, er repariert Laufendes, und **Punkt 2 und 3
gehören zusammen** — Spalten ohne Eingabe wären eine Spalte, die niemand
füllt.*

---

0. WAS VOR DEM ERSTEN HANDGRIFF ZU TUN IST — FÜNF PUNKTE, UND VIER DAVON SIND
   NACHLESE. **DER ERSTE IST EINE ENTSCHEIDUNG, DIE VOR DEM BAUEN FÄLLT.**

   * **PUNKT 1 KANN AUCH VORGEZOGEN WERDEN — ENTSCHEIDE DAS ZUERST.** Der
     kaputte Cookiewert (siehe Punkt 1) ist ein Fehler in der Verfügbarkeit und
     drei Zeilen groß. Er kann **als 0.13.3 vorab** hinausgehen, bevor diese
     Runde beginnt, oder als Punkt 1 mitfahren. **Für das Vorziehen spricht:**
     ein Browser, der ausgesperrt ist, wartet sonst eine ganze MINOR-Runde. *Der
     Fahrplan sagt zu 0.14.0 ausdrücklich „als Schema-Runde keine Beifracht".*
     **Für das Mitfahren spricht:** eine eigene Runde kostet den vollen
     Papierweg für drei Zeilen. **Sag, wofür du dich entscheidest, und begründe
     es** — beides ist vertretbar, aber nicht beides zugleich.

   * **DER FINGERPRINT IST ZU BESTÄTIGEN.** Die laufende Anlage muss
     `15188676` melden. **Bei 0.9.1 hat sich auf dem Wirt eine Datei zu viel
     gezeigt (Stolperstein 158):** der Server lief einwandfrei, jede Prüfung war
     grün, und trotzdem lag dort ein Stand, den kein Commit hatte. *Ohne diese
     Gegenprobe steht nicht fest, dass auf dem Wirt der Stand liegt, den dieser
     Auftrag voraussetzt.*

   * **ZWEI FELDBELEGE STEHEN SEIT ZWEI RUNDEN AUS.** Sie kosten keine Zeile
     Code und sind ohne mich zu haben:

     1. **Der Teilexport am echten Bestand (0.12.4, offen seit dem 28. August).**
        Systembereich → Export → *In Teilen exportieren*, 300 MB. **Wie viele
        Teile, und stimmen die Dateigrößen ungefähr mit der Ansage?** Dann alle
        Teile bestätigen und laden — **mit eingeschaltetem zweitem Faktor, denn
        genau dafür ist 0.13.0 gebaut** —, und danach nachsehen, dass im
        Sicherheitsprotokoll **keine** Zeile `bestaetigung.fehl` steht. *Und der
        eine Handgriff, der wirklich zählt: einen Teil in eine **Zweitanlage**
        einspielen, nicht in die laufende.*
     2. **Beide Netze am echten Wirt (0.13.0, offen seit dem 28. August).**
        Über HTTPS anmelden und angemeldet bleiben; **im selben Browser** über
        `http://<server-ip>:3100` anmelden und ebenso angemeldet bleiben.
        *Solange das nicht gefahren ist, ist die tragende Zusage von 0.13.0 nur
        an Prüflagen belegt.*

     **Bis das gelaufen ist, sind 0.12.4 und 0.13.0 nicht im Feld bestätigt.**
     Sag mir die Ergebnisse, sobald du sie hast — sie gehören ins
     Änderungsprotokoll dieser Runde als Nachlese, nicht in ein neues.

   * **DIE TAGS BLEIBEN DEINE SACHE, UND DER GRUND IST GEKLÄRT.** Es ist **kein**
     Problem der GitHub-Rechte: `GET /info/refs?service=git-receive-pack`
     antwortet mit 200 samt GitHub-Kopfzeilen, ein Branchpush auf denselben
     Commit geht durch, und nur `POST /git-receive-pack` mit `refs/tags/*`
     bekommt **403 ohne einen einzigen GitHub-Header** — GitHub sieht die
     Anfrage nie. **Der Git-Proxy der Arbeitsumgebung weist sie nach der Ref-Art
     ab.** Die Befehle stehen im Projektstand, Abschnitt 8; **`v0.12.3` bis
     `v0.13.2` warten auf den Merge des Arbeitsbranches.** Ich lege `v0.14.0`
     weiterhin an und versuche den Push — geht er unerwartet durch, ist das ein
     Befund und gehört ins Protokoll.

   * **DER VOLLE GEGENPROBENLAUF STEHT SEIT ACHT RUNDEN AUS.** 218 Rückbauten
     zu je einem vollen Prüflauf sind über zwanzig Stunden; das ist der Grund,
     und er wird nicht besser. **Entscheide zu Beginn, ob er einmal ganz läuft**
     — und wenn ja, dann *vor* dem Bau, damit er nicht am Ende die Runde
     blockiert. *Läuft er nicht, schreib auf, dass er wieder aussteht.*
     **Für diese Runde spricht mehr dafür als sonst:** sie fasst das Schema an,
     und ein Migrationsblock ist der Ort, an dem eine Gegenprobe am meisten
     wert ist.

---

1. **DER KAPUTTE COOKIEWERT — DIESER PUNKT WIRD NIE GESCHNITTEN.**

   **Befund aus dem Gegenlesen zu 0.13.0, und er ist älter als jede Runde
   dieses Jahres.** `parseCookies()` in `auth.js` ruft `decodeURIComponent()`
   auf **jeden** Wert:

   ```
   Cookie: kriterion_session=%   →   URIError: URI malformed
   ```

   **Die Funktion sieht ALLE Cookies des Hosts an, nicht nur die eigenen.** Ein
   fremder Cookie mit einem `%` im Wert genügt — gesetzt von irgendeiner
   anderen Anwendung auf demselben Namen oder von Hand. `requireAuth` ruft die
   Funktion bei **jeder geschützten Anfrage**; der Fehler-Handler macht daraus
   eine **500**, und dieser eine Browser kommt nicht mehr herein, bis jemand den
   Cookie löscht. *Die Zeile stammt aus Commit `158b6d9` und ist von 0.13.0 bis
   0.13.2 nicht berührt worden — nachgesehen, nicht vermutet.*

   **Zu bauen ist die kleine Fassung:** die Schleife überspringt einen Wert, der
   sich nicht dekodieren lässt, statt abzubrechen. **Der Name bleibt roh, der
   Wert wird versucht** — ein Cookie, dessen Wert nicht dekodierbar ist, ist für
   diese Anlage kein Cookie.

   **Was ausdrücklich NICHT gebaut wird:** ein eigener Fehlerpfad, eine Meldung
   an den Benutzer oder eine Zeile im Sicherheitsprotokoll. *Ein fremder Cookie
   ist kein Vorgang dieser Anlage, und eine Zeile, die ein Fremder auslösen
   kann, gibt es schon genug (Abschnitt 3 des Projektstands).*

   **Die Prüfung muss den Fehler vorher zeigen können.** Eine Prüflage mit
   einem gültigen Cookie belegt nichts: sie braucht **einen zweiten Cookie mit
   kaputtem Wert neben dem gültigen** — und danach eine Anfrage, die **200**
   liefert statt 500. *Eine Lage, die nur einen Cookie kennt, belegt nichts
   über zwei (Stolperstein 189, in neuer Gestalt).*

---

2. **DREI SPALTEN UND EIN MIGRATIONSBLOCK — DER TEIL, BEI DEM SORGFALT ZÄHLT.**

   An `items` kommen dazu:

   * `rejected_at` — **wann** abgelehnt wurde.
   * `rejected_grund` — **warum**, eine Zeile Text.
   * `rejected_von` — **wer** es entschieden hat.

   **`rejected` selbst bleibt, wie es ist.** *Ein zweites Feld „Ergebnis" neben
   `rejected` wären zwei Wahrheiten über dieselbe Sache (Stolperstein 47). Das
   vorhandene Merkmal bekommt, was ihm fehlt — mehr nicht.*

   **DIE DDL BLEIBT DER ORT DER WAHRHEIT** (`db.js`), **und die Spalten brauchen
   trotzdem einen Migrationsblock**: `CREATE TABLE IF NOT EXISTS` rührt eine
   vorhandene Tabelle nicht an (Stolperstein 13). Der Block trägt die Marke
   `// MIGRATION 0.14.0 — ENTFAELLT MIT 1.0` wie seine fünf Vorgänger. **Damit
   sind es sechs.**

   **DIE BAUFORM DES BLOCKS STEHT FEST, UND SIE IST NICHT VERHANDELBAR
   (Stolperstein 108):**

   * **Jede Spalte wird EINZELN gefragt**, nicht der Block als Ganzes. Ein
     Block, der beim Vorhandensein der ersten Spalte zurückkehrt, ließe die
     zweite und dritte für immer fehlen.
   * **Alle drei `ALTER TABLE` laufen in EINER `db.transaction()`.** Ohne sie
     überlebt bei einem Abbruch die erste Spalte und die übrigen fehlen.
   * *Die Transaktion verhindert den Riss, die Einzelabfrage überlebt ihn — nur
     das Zweite hilft gegen einen Riss, der in einer früheren Version
     entstanden ist.*

   **`rejected_von` ist ein Fremdschlüssel auf `users` und steht auf
   `ON DELETE SET NULL`** wie alle sechs vorhandenen Träger (Stolperstein 54).
   **Damit sind es sieben** — und Stolperstein 105 gilt: ein `REFERENCES` in
   einem `ALTER TABLE ... ADD COLUMN` verhält sich nicht wie eines in der DDL.
   **Sieh nach, was SQLite hier wirklich tut, statt es abzuschreiben**, und
   schreib das Ergebnis auf; es ist eine Antwort, die noch nicht in den Papieren
   steht.

   **Die Prüfung, die hier fehlen würde:** eine, die den Block **an einer
   Datenbank ohne die Spalten** fahren lässt und danach die Zeilen zählt. *Ein
   Migrationsblock, der nur an einer frischen Anlage geprüft wird, ist gar nicht
   geprüft — frisch hat die DDL die Spalten schon.* **Und eine zweite, die ihn
   ZWEIMAL fahren lässt.**

---

3. **DER GRUND WIRD EINGEGEBEN UND ANGEZEIGT — SONST IST DIE SPALTE EINE, DIE
   NIEMAND FÜLLT.**

   **Heute** sitzt „abgelehnt" als Schalter in der Detailansicht (`sw-rej-t`)
   und schickt unmittelbar `PUT /api/items/:id` mit `{ rejected: … }`.

   **Danach:**

   * **Beim EINSCHALTEN erscheint ein Feld für den Grund** — offen im Dialog und
     nicht hinter einem Aufklappen. *Ein Feld, das man erst suchen muss, bleibt
     leer.*
   * **Die Marke „abgelehnt" wird zur Aussage:** *„Abgelehnt am 14.03.2026 von
     Anna — Lieferzeit über 6 Monate."* **Aussagen tragen in dieser Anlage ihren
     Verfasser**, und deshalb steht der Name dabei.
   * **Am Grabstein steht kein Name** — dieselbe Regel wie überall sonst: ein
     entfernter Zugang hat keinen Namen mehr. *Die Abbildung von der Nummer auf
     den Namen ist eine Stelle, kein zweiter Weg.*
   * **In der Kachelansicht bleibt die Marke, wie sie ist.** *Ein Grund gehört
     an den Eintrag und nicht in eine Kachelreihe; wer ihn dort hineinschreibt,
     baut eine zweite Anzeige derselben Sache.*

   **Sag, was beim AUSSCHALTEN passiert** — das ist eine der vier Entscheidungen
   weiter unten.

---

4. **DIE KLEMME: ZURÜCKNEHMEN DARF, WER DEN EINTRAG ÄNDERN DARF; UMSCHREIBEN
   DARF DIE BEGRÜNDUNG NUR, WER SIE GETROFFEN HAT.**

   **Heute** steht `rejected` in `NUR_VERFASSER_FELDER` (`server.js:765`) und
   läuft damit über `darfAendern` — **Verfasser oder Admin**. Wer die Begründung
   hinschreibt, ist also nicht zwingend der Verfasser des Eintrags.

   **Die Regel gibt es schon** — „Löschen ja, umschreiben nein", `nurSelbst`
   (`server.js:726`). **Sie braucht die Zeile**, angewandt auf `rejected_grund`.
   *Und es ist eine Verschärfung gegenüber heute: an diesen Feldern gilt derzeit
   `darfAendern`.*

   **Die Prüfung braucht drei Zugänge und nicht zwei:** den Verfasser des
   Eintrags, den Ablehnenden und einen Admin, der keines von beiden ist. *Mit
   zwei Zugängen lässt sich „Verfasser des Eintrags" von „Verfasser der
   Begründung" gar nicht unterscheiden, und jede Prüfung darauf bliebe grün,
   auch wenn überall `darfAendern` stünde.*

---

5. **DAS AUSTAUSCHFORMAT GEHT AUF 11 — UND DER IMPORT LIEST WEITERHIN 10.**

   `AUSTAUSCH_FORMAT` (`server.js:3297`) steht auf **10** und geht auf **11**.
   Die drei neuen Felder gehen mit hinaus und wieder hinein.

   * **Eine Datei der Nummer 10 bleibt einspielbar** — dieselbe Zusage wie bei
     jedem Formatsprung davor. Die drei Felder fehlen dann und bleiben leer.
   * **`rejected_von` wandert als NAME hinaus, nicht als Nummer.** *Eine
     Zugangsnummer bedeutet in einer fremden Anlage etwas anderes; genau so
     verfährt das Format schon heute mit den Verfassern.* **Sieh nach, wie es
     das tut, und mach es genauso** — nicht ähnlich.
   * **Der Rundlauf gehört in die Prüfung:** hinaus, hinein, Feld für Feld
     verglichen, samt der drei neuen. *Ein Format, dessen Rundlauf nicht
     geprüft ist, ist eine Behauptung.*

---

6. **DIE STERNREIHE STEHT NICHT AUF EINER LINIE — EIN BEFUND AUS DEM BETRIEB
   VOM 29. AUGUST 2026.**

   In der Kriterienliste eines Eintrags steht rechts die eigene Sternreihe und
   daneben der Schnitt, `⌀ 3,0 (2)`. **Eine Zeile, die noch niemand bewertet
   hat, trägt dort nichts — und ihre Sterne rutschen dadurch nach rechts.** Sie
   beginnen nicht an derselben Stelle wie die der Zeilen darüber und darunter.

   **DIE URSACHE STEHT SEIT LANGEM IM STILBLATT:**

   ```css
   .rrow .ravg { … min-width: 52px; text-align: right; }
   ```

   Der Kommentar darüber sagt sogar, wozu die Zahl da ist: *„Feste
   Mindestbreite: sonst wackelt die Sternreihe, sobald eine Zeile keine Zahl
   hat."* **Die Absicht ist richtig, die Zahl ist zu klein** — und sie ist eine
   feste Pixelzahl in einer Anlage, die ihre Schrift von 80 bis 120 Prozent
   stellt. *Dasselbe Muster wie Befund A aus 0.12.1 (`right: 92px`) und wie die
   Ausrichtung, die 0.13.1 in Ordnung gebracht hat.*

   **NACHGEMESSEN IN CHROMIUM, gleiche Prüflage, drei Schriftgrößen** — der
   linke Rand der Sternreihe:

   | Schrift | Zeile mit Zahl | Zeile ohne Zahl | Unterschied |
   |---|---|---|---|
   | 80 % | 408,5 px | 408,5 px | **0 px** |
   | 100 % | 379,3 px | 392,3 px | **13 px** |
   | 120 % | 350,2 px | 376,2 px | **26 px** |

   **Bei 80 Prozent stimmt es zufällig** — dort ist der Text genau 52 px breit.
   *Die Zahl war einmal richtig und wächst seither auseinander.*

   **UND ES IST NICHT NUR DIE LEERE ZEILE.** Auch unter den Zeilen **mit** Zahl
   steht die Reihe nur so lange auf einer Linie, wie alle Zahlen gleich lang
   sind: `⌀ 5,0 (128)` ist bei 100 Prozent 79,5 px breit und schiebt die Sterne
   dieser einen Zeile **14,5 px nach links**. **Die Zusage „alle Sternreihen
   beginnen an derselben Stelle" gilt heute für keinen der beiden Fälle.**

   **Zu entscheiden ist der Weg, und beide sind vertretbar:**

   * **(a) Die Mindestbreite in `ch` statt in Pixeln.** Die Spalte ist in
     Festbreitenschrift gesetzt, `⌀ 5,0 (128)` sind zwölf Zeichen. **Wächst mit
     der Schrift, kostet eine Zeile.** *Bleibt aber eine Zahl — bei vierstelliger
     Stimmenzahl bricht sie wieder.*
   * **(b) Der ganze Block wird EIN Raster**, und die Spalte misst sich an ihrer
     breitesten Zelle. **Dann steht gar keine Zahl mehr im Stilblatt.** *Der
     Preis: die Zeilen sind heute einzelne Flex-Kästen mit eigener Trennlinie
     unten — wer sie zu Rasterzellen macht, muss die Trennlinie neu ziehen.*

   **Meine Neigung ist (b)**, weil es das Muster ganz auflöst statt die Zahl zu
   vergrößern — aber **(a) ist die kleinere Änderung**, und wenn die Runde eng
   wird, ist sie die richtige. *Sag, wofür du dich entscheidest, und begründe
   es.*

   **Die Prüfung braucht beide schwierigen Zeilen:** eine **ohne** Bewertung und
   eine mit **langer** Zahl. *Eine Prüflage, in der alle Zahlen gleich lang
   sind, kann den Fehler gar nicht tragen (Stolperstein 189).* **Gemessen wird
   in Chromium, nicht in jsdom** — dort ist jede Breite null; der Prüflauf
   sichert die Regel im Stilblatt und den Aufbau, die Zahlen kommen ins
   Änderungsprotokoll.

   **Was NICHT gebaut wird:** ein Text wie „noch keine Bewertung" in der leeren
   Spalte. *Neben fünf leeren Sternen wäre das dieselbe Aussage zweimal — die
   Begründung steht seit jeher im Quelltext daneben und gilt weiter.*

   **Und der Blick daneben lohnt:** dieselbe Spalte gibt es in der Ansicht
   „Wer hat bewertet" und im Vergleich (`.cmp-crit`). **Sieh nach, ob dort
   dasselbe Muster steht** — und wenn ja, nimm es mit; eine halb behobene
   Ausrichtung ist schlechter als eine benannte.

---

7. **WAS AUSDRÜCKLICH NICHT GEBAUT WIRD.**

   * **KEIN dreiwertiger Zustand** *offen / genommen / verworfen*. Klingt
     vollständiger, ist aber ein Neubau: `rejected` müsste weg, jeder Filter und
     das Austauschformat müssten mit. **Und „genommen" ist bei einem
     Bewertungsarchiv nicht die Gegenfrage zu „abgelehnt"** — man lehnt ab, ohne
     dass etwas anderes genommen wird.
   * **KEIN `tested_at` und kein Grund an „getestet".** Die Symmetrie ist
     verlockend, aber **„getestet" ist ein Zustand und keine Entscheidung.** Wer
     beides gleich behandelt, baut die Hälfte umsonst.
   * **KEINE Begründung im Sicherheitsprotokoll.** Sie ist Inhalt und kein
     Vorgang; **Freitext von außen kommt in diese Tabelle nicht hinein**
     (Projektstand, Abschnitt 11). *Ob der Vorgang selbst eine Zeile bekommt,
     ist eine eigene Frage — sie steht unten und ist nicht vorentschieden.*
   * **KEINE Adressliste für `X-Forwarded-For`.** Sie ist die zweite Hälfte von
     Punkt 2 aus 0.13.0 und gehört in eine eigene Runde. *Sie hier
     mitzunehmen hieße, eine Schema-Runde mit einem Betriebsrisiko zu
     verquicken.*
   * **KEIN Fließsatz an der Tagwolke.** Zurückgestellt in 0.13.1, mit
     Rechnung, in `Doku/Fehler_und_Ideen.md`, Teil II.

---

DIE FÜNF ENTSCHEIDUNGEN — **jede will beantwortet werden, mit Begründung, im
Änderungsprotokoll:**

* **Wird `rejected_grund` beim Zurücknehmen des Merkmals gelöscht oder
  behalten?** Behalten heißt: wer erneut ablehnt, sieht die alte Begründung
  stehen. Löschen heißt: eine Angabe geht verloren, die niemand
  wiederherstellen kann. *Mein Vorschlag: behalten, und beim erneuten Setzen als
  Vorschlag zum Überschreiben anbieten.*
* **Ist der Grund Pflicht?** Ein Pflichtfeld erzieht, ein freiwilliges bleibt
  leer. *Mein Vorschlag: freiwillig — aber das Feld steht offen im Dialog.*
* **Bekommt das Ablehnen eine Zeile im Sicherheitsprotokoll?** Der **Vorgang**
  wäre zulässig, der **Text** nicht. *Wäge ab: `VORGAENGE` ist eine geschlossene
  Liste von zwanzig, und jede neue Zeile ist eine Entscheidung für immer.*
* **Zählt `PUT /api/items/:id` mit den neuen Feldern als neue schreibende
  Route?** *Prüf, ob `F_ROUTEN` bei 69 bleibt* — und wenn nicht, sag es mit
  Begründung.
* **Und die fünfte, aus Punkt 6: Mindestbreite in `ch` oder ein Raster für den
  ganzen Block?** *Meine Neigung steht dort; die Entscheidung ist deine.*

---

AUFLAGEN — sie gelten unverändert und sind keine Formsache:

* **Deutsch** in Kommentaren, Oberfläche, Meldungen und im Gespräch. `Tag`,
  `Token`, `Index`, `String`, `Cookie` bleiben; „Desktop" statt „Schreibtisch";
  die Abschnittsnamen im Changelog bleiben englisch.
* **KEINE NEUE ABHÄNGIGKEIT, NICHT EINE** — auch keine für den Prüfstand.
* **Keine Zugangsdaten im Chat.** Kein Passwort, kein Schlüssel, kein Token,
  kein TOTP-Geheimnis, kein Wiederherstellungscode — weder von dir noch von mir.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein —
  **außer dort, wo eine zurückgenommene Entscheidung sonst wiederkäme.**
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Eine Probe, die ihren Maßstab vom Prüfling bezieht, kann nicht scheitern**
  (Befund B aus 0.12.0).
* **Eine Prüflage, die die Eigenschaft gar nicht tragen KANN, ebenso wenig**
  (Stolperstein 189) — hier heißt das: **eine Anlage, die die Spalten schon hat,
  belegt nichts über den Migrationsblock.**
* **Eine Prüfgruppe, die einen Schalter nie einschaltet, belegt nichts über den
  Zustand mit Schalter.** *Diese Frage gehört an jede neue Gruppe: welcher
  Schalter bleibt hier durchweg aus, und trägt er etwas zur Sache bei?*
* **Ein Mock antwortet wie der echte Server** (Stolperstein 90), **und er
  liefert nicht selbst, was die Prüfung belegen soll** (Stolperstein 102).
* **NEU AUS 0.13.2 — und für diese Runde besonders:** *wer eine Entscheidung
  zurücknimmt, sucht die Prüfungen, die sie festhalten, und nimmt sie mit*
  (Stolperstein 201). **Punkt 4 nimmt eine Entscheidung zurück** — an
  `rejected_grund` gilt künftig `nurSelbst` statt `darfAendern`. *Sieh nach,
  welche vorhandenen Prüfungen die alte Regel festhalten.*
* **Und der Zwilling dazu** (Stolperstein 199): *was du in einen Kommentar
  schreibst, schreibst du im selben Zug in eine Prüfung.*
* **Wird es zu viel für einen Durchgang, sag es, sobald du es kommen siehst —
  nicht hinterher.** Zuerst fällt **Punkt 6** (er hängt an nichts), dann der
  Schnitt zwischen Punkt 5 und Punkt 4. **Punkt 1 steht außerhalb** und wird nie
  geschnitten; **Punkt 2 und 3 fallen nur zusammen** — Spalten ohne Eingabe
  wären eine Spalte, die niemand füllt.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:

* Zuerst die Frage, ob es den Code überhaupt braucht. **Für diese Runde lautet
  die Antwort ausdrücklich JA: SCHEMA, MIGRATIONSBLOCK UND FORMATNUMMER.** Das
  unterscheidet sie von den letzten fünf Runden. *Wenn deine Durchsicht zu einem
  anderen Ergebnis kommt — etwa dass zwei Spalten reichen —, ist das ein Grund
  anzuhalten und zu fragen, nicht stillschweigend abzuweichen.*
* Das Schema bleibt vollständige DDL in `db.js`; der Block ist der Nachrüster
  und fällt zu 1.0 weg.
* **Die Sicherung des Datenverzeichnisses ist bei dieser Runde PFLICHT und nicht
  Empfehlung** — sag das im Einspielweg deutlich. *Bei den letzten fünf Runden
  stand dort „Empfehlung"; bei einem Migrationsblock ist das falsch.*
* **`F_ROUTEN` bleibt bei 69**, solange keine schreibende Route dazukommt.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer sein,
  und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
  **Und danach kein Prüflauf mehr, den du abbrichst** — abgebrochene Läufe
  hinterlassen Server mit `ppid=1` auf den festen Portbasen, und der nächste
  Lauf wird davon rot, ohne dass am Code etwas falsch wäre. *In 0.13.2 hat das
  einen Lauf mit 31 roten Punkten erzeugt; der Aufräumwächter des Laufs zählt
  nur seine eigenen Server.*
* `Doku/Aenderungsprotokoll_0.14.0.md` liegt im Branch: was gebaut wurde je
  Datei, Abweichungen mit Begründung, **die vier Entscheidungen mit ihrer
  Begründung**, neue Stolpersteine (**die Zählung setzt bei 202 fort** — 201 ist
  vergeben), die Gegenprobentabelle **aus `gegenprobe.js`**, Prüfungszahlen
  vorher/nachher (vorher: **4131**), Rückbauten vorher/nachher (vorher: **218**),
  Offengebliebenes — **und die Ergebnisse der beiden Feldbelege aus Abschnitt 0,
  sobald sie da sind.**
* Die Zeile „0.14.0 — Fingerprint `…`" gehört ins Änderungsprotokoll, **ZULETZT
  gebildet**, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, **und `package-lock.json`
  trägt sie ein zweites Mal.** *In 0.13.1 ist genau das vergessen worden und
  hat einen roten Lauf gekostet.* **`public/` gehört dazu**: der Fingerprint geht
  über ALLES darin und nicht über eine Liste erwarteter Namen (Stolperstein 158).
* **DIESE RUNDE IST EINE DATENBANKSTUFE — sag es ausdrücklich**, mit der Nummer
  des Migrationsblocks, der neuen Formatnummer und dem Satz, dass die Sicherung
  Pflicht ist.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. **Darunter die drei, die diese Runde belegen:** einen
  Eintrag ablehnen und Datum, Grund und Namen an der Marke sehen; als anderer
  Zugang versuchen, die Begründung umzuschreiben, und abgewiesen werden; und
  **eine Datenbank aus 0.13.2 starten und die drei Spalten danach vorfinden.**

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Projektstand
  (Kopf, Betriebsstand **samt Einspielweg — dort steht die Sicherungspflicht**,
  die Schematabelle in Abschnitt 2, Abschnitt 4, Abschnitt 5, Stolpersteine,
  Prüfstand, Versionsgeschichte, **Abschnitt 10 und 10a**). Der Projektstand
  trägt die Version im Dateinamen und wird umbenannt (`git mv` auf
  `Projektstand_Kriterion_0_14_0.md`); alle Verweise sind nachzuziehen.
* **ABSCHNITT 10a WIRD GELEERT, SOWEIT ER DIESE RUNDE BETRIFFT.** Was gebaut
  ist, steht danach im Änderungsprotokoll und im Stand — **nicht mehr im
  Fahrplan.** *Ein Punkt wandert vom Sammelblatt in den Fahrplan und von dort in
  ein Änderungsprotokoll — nie zurück.* **Die drei übrigen Runden bleiben
  unangetastet.**
* **Das Sammelblatt wird an genau einer Stelle angefasst:** die
  Wegweisertabelle am Anfang von Teil I bekommt den Vermerk, dass 0.14.0 gebaut
  ist. Sonst nichts — **es sei denn, beim Bauen fällt etwas an, das dort
  hingehört**; dann kommt es als Zeile in Teil II.
* **DAS KONZEPTPAPIER WIRD NICHT ANGEFASST UND NICHT UMBENANNT.** Es ist mit
  0.9.1 geschlossen. **Fällt dir etwas auf, das dort falsch wird, ist das ein
  Befund und gehört gemeldet**, nicht stillschweigend nachgezogen.
* **DAS VIDEOPAPIER WIRD NICHT ANGEFASST.**
* **Die README bekommt drei Dinge:** was an der Marke „abgelehnt" jetzt steht,
  **dass eine Sicherung vor dem Einspielen dieser Version Pflicht ist**, und die
  neue Formatnummer samt der Zusage, dass Dateien der Nummer 10 weiterhin
  hineingehen.
* **`CHANGELOG.md` bekommt den Eintrag nach der Form von 0.13.0** — der letzten
  MINOR-Runde —, mit beiden eigenen Abschnitten am Ende.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Runde.** Den
  weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber getestet
  ist. **Bau ihn nicht ungefragt.** Und wenn du ihn baust: **dieser hier wird
  dabei entfernt** — es liegt immer nur einer im Repo.
