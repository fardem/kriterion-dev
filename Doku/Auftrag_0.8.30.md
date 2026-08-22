Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, das Ideenpapier und die Änderungsprotokolle
0.8.6, 0.8.10 und 0.8.20 stehen dort unter `Doku/`. Gearbeitet wird im Repo,
nicht an einer Kopie.

AUFTRAG: **Stufe G4 auf Version 0.8.30 — „Die Linkliste bekommt Verfasser".**
DIES IST EINE STUFE DES UMBAUS, und zwar **die erste Datenbankstufe seit
0.8.3**. Damit gilt alles, was seit 0.8.1 für Schemaänderungen beschlossen
ist: vollständige DDL in `db.js`, ein **Umstiegsblock mit Marken**, ein
eigener Prüfabschnitt, ein Eintrag unter „Vorgemerkt für 1.0" — und die
**Sicherung des Datenverzeichnisses gehört ausdrücklich in den Einspielweg**.

WARUM DIESE STUFE JETZT KOMMT: 0.8.10 und 0.8.20 waren die beiden Runden ohne
Schemaänderung, die vor G4 lagen; beide sind gebaut, eingespielt und
bestätigt (Abdruck `3ab38137`). Der Weg ist frei, und G4 ist die letzte offene
Stufe des Mehrbenutzerbetriebs vor H.

WAS SICH ÄNDERT, IN EINEM SATZ: Heute gehören Links dem **Eintragsverfasser**
— eintragen, sortieren und löschen stehen alle hinter `nurEintragVerfasser`.
Künftig darf **jeder** einen Link eintragen; löschen darf ihn der **Eintrager
oder der Admin**, und ab zwei Zugängen steht sein Name an der Zeile.

DAS KEHRT EINE ZEILE DER RECHTETABELLE UM. „Titel, Beschreibung, Fotos,
Dateien, **Links**, Tags, Kategorie" verliert die Links; sie werden zum
**fünften Träger** neben Eintrag, Kommentar, Testtag und Bewertung. Die Regel
dahinter steht seit 0.8.4 im Projektstand: *was an allen Einträgen aller
Benutzer erscheint, gehört dem Admin; was nur dort erscheint, wo man es
hinsetzt, gehört jedem.* Ein Link erscheint nur dort, wo man ihn hinsetzt.

Fünf Punkte. Die Bündelung folgt der Sache, nicht der Bequemlichkeit — bei
jedem Punkt steht, warum er so geschnitten ist.

---

1. DAS SCHEMA, DER UMSTIEG UND DAS AUFFANGNETZ. Sie gehören zusammen, weil
   sie dieselbe Frage dreimal beantworten: **wem gehört eine Linkzeile, die
   keinen Verfasser hat?**

   `links` trägt heute keine `user_id`:

       -- db.js
       CREATE TABLE IF NOT EXISTS links (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
         url TEXT NOT NULL,
         sort_order INTEGER NOT NULL DEFAULT 0,
         created_at TEXT NOT NULL DEFAULT (datetime('now'))
       );

   Dazu kommt `user_id INTEGER REFERENCES users(id) ON DELETE SET NULL` —
   dieselbe Form wie an den vier anderen Trägern. **Nicht `NOT NULL`**: der
   Grabstein hält die Nummer zwar am Leben, aber die Spalte muss den Fall
   aushalten, in dem eine Zeile in `users` doch verschwindet.

   DER UMSTIEGSBLOCK, gebaut wie `umstieg083()` und mit denselben Marken:

       // UMSTIEG 0.8.30 — ENTFAELLT MIT 1.0
       function umstieg0830() { … }
       umstieg0830();
       // ENDE UMSTIEG 0.8.30

   Einmalig, **wiederholbar und im Normalfall stumm** — `PRAGMA
   table_info(links)` entscheidet, ob überhaupt etwas zu tun ist, genau wie
   beim Vorgänger. `CREATE TABLE IF NOT EXISTS` rüstet eine Spalte in einer
   **vorhandenen** Tabelle nicht nach (Stolperstein 13); eine frische Anlage
   trägt sie dagegen ohne Umstieg, und genau das gehört auch geprüft.

   **BESTANDSZEILEN FALLEN AN DEN EINTRAGSVERFASSER, NICHT AN DEN
   EIGENTÜMER.** Das ist der einzige Punkt dieser Stufe, an dem eine falsche
   Entscheidung stillschweigend Aussagen umschreibt: bis heute *waren* die
   Links des Eintrags die Sache seines Verfassers — sie ihm wegzunehmen und
   dem Eigentümer zu geben, machte aus seinen Links plötzlich fremde.

       UPDATE links SET user_id = (SELECT user_id FROM items WHERE items.id = links.item_id)
        WHERE user_id IS NULL

   DAS AUFFANGNETZ IST EINE ZWEITE, ANDERE FRAGE. `ordneBestandZu()` in
   `db.js` läuft über vier Tabellen — `items`, `comments`, `test_days`,
   `ratings` — und schiebt herrenlose Zeilen dem **Eigentümer** zu. Kommt
   `links` in diese Liste, gilt für dieselbe Tabelle an zwei Stellen zweierlei
   (Umstieg: Eintragsverfasser; Netz: Eigentümer). Bleibt sie draußen, kann
   eine Linkzeile dauerhaft herrenlos werden, und die Prüfgruppe „Keine Zeile
   ohne Benutzer" deckt den fünften Träger nicht ab.
   **SAG MIR, WAS DU FÜR RICHTIG HÄLTST.** Ich neige dazu, `links`
   aufzunehmen: der Umstieg füllt vorher ohnehin alles, das Netz greift nur
   für Zeilen, die *danach* herrenlos werden, und für die ist der Eigentümer
   die eingeführte Antwort. Zwei Regeln für zwei verschiedene Zeitpunkte sind
   keine zweite Wahrheit — aber beide gehören dann im Quelltext nebeneinander
   erklärt, sonst liest der Nächste einen Widerspruch.

   **VORGEMERKT FÜR 1.0:** der markierte Block bekommt sofort seinen Eintrag
   im Projektstand — Datei, Zeilenzahl, Prüfabschnitt, und was zu 1.0 bleibt
   (die Spalte in der DDL) und was fällt (der Block).

2. DIE RECHTE KEHREN SICH UM. Drei Routen, und sie gehen in verschiedene
   Richtungen:

       // server.js
       app.post('/api/items/:id/links',      nurEintragVerfasser, …)   // wird offen
       app.put('/api/items/:id/link-order',  nurEintragVerfasser, …)   // BLEIBT
       app.delete('/api/links/:id', …)                                 // im Rumpf, neue Klemme

   * **EINTRAGEN WIRD OFFEN.** Der Wächter fällt weg; die Route schreibt
     `req.benutzer.id` in die neue Spalte. Vorbild ist `POST
     /api/items/:id/comments` — dieselbe Art in `F_ROUTEN`, dieselbe Bauform.
   * **LÖSCHEN GEHT AN `darfAendern(req, l.user_id)`** — Eintrager oder
     Admin. Heute steht dort `eintragFrei(req, res, l.item_id)`, also die
     Frage nach dem *Eintrag*; künftig ist es die Frage nach der *Zeile*.
     Dieselbe Wendung wie 0.8.2 an `DELETE /api/ratings/:id`.
   * **SORTIEREN BLEIBT BEIM EINTRAGSVERFASSER UND ADMIN.** Es ändert keine
     Aussage und ist umkehrbar — dieselbe Überlegung wie beim Anpinnen. Das
     ist ausdrücklich keine Nachlässigkeit, sondern die Entscheidung aus dem
     Konzeptpapier.

   **`F_ROUTEN` BLEIBT BEI 46 ROUTEN, ABER ZWEI EINTRÄGE WECHSELN IHRE ART.**
   Genau dafür steht die Liste da. Wer die Art ändert, ohne die Liste
   anzufassen, wird namentlich rot — und das ist der Zweck, nicht ein
   Hindernis.

   **STOLPERSTEIN 74 GILT HIER IN VOLLER SCHÄRFE:** die Prüfungen der
   Vorgängerversion sind die ersten Betroffenen. Es gibt heute Prüfungen, die
   belegen, dass ein Fremder **keinen** Link eintragen darf. Die werden mit
   dieser Stufe falsch. **Umdrehen oder umhängen, nicht löschen** — und zu
   jeder Verweigerung gehört weiterhin der Erfolgsfall daneben und die
   Nachschau, dass nichts geschrieben wurde.

3. DER NAME AN DER ZEILE — UND DER PLATZ, DEN ER NICHT HAT. Die Linkzeile
   bekommt `verfasser` und `mine` wie die vier anderen Träger; in `detail()`
   liegt die Verfasserkarte schon bereit (`verfasserAus(karte, …)`), es ist
   dieselbe Handvoll Zeilen wie am Kommentar.

   **DIE ANZEIGE HÄNGT AN `mehrereBenutzer()`**, wie überall sonst: bei einem
   einzigen Zugang steht kein Name an der Zeile — „von mir" ist keine
   Auskunft. Die Schwelle steht in `mehrereBenutzer()` und nirgends sonst.

   ERST NACHSEHEN, DANN BAUEN — DIE ZEILE IST VOLL. Sie trägt heute schon:
   Griff zum Ziehen, laufende Nummer, Domain, Pfad (oder bei einer Suchzeile
   den Rohtext), **bis zu vier Anbieternamen als eigene Klickziele**, Pfeil
   oder Lupe und das ✕. Auf dem Handy ist sie damit am Anschlag. **SAG MIR
   VORHER, WOHIN DER NAME SOLL** — ich sehe drei Möglichkeiten und keine
   davon ist offensichtlich:

   * unter die Domain, in dieselbe Zeile wie die Anbieternamen (dort ist
     schon Platz vorgesehen, aber bei Suchzeilen kollidiert er mit ihnen),
   * rechts vor dem ✕ als kleiner, gedämpfter Text (kostet Breite genau
     dort, wo sie am knappsten ist),
   * gar nicht sichtbar, sondern nur im `title` der Zeile (billig, aber dann
     ist der Name faktisch unsichtbar — und der halbe Zweck der Stufe fiele
     weg).

   Ich neige zur ersten Form mit einer Trennung: bei einer **Adresszeile**
   unter die Domain, bei einer **Suchzeile** hinter die Anbieternamen mit
   eigenem Trennzeichen. Aber das ist eine Sache für den Bildschirm, nicht
   fürs Papier — **entscheide du.**

   DAS ✕ FOLGT DEM RECHT, nicht der Anzeige: wer den Link nicht löschen darf,
   sieht das Zeichen nicht. Und **wer eine Anzeige einschränkt, prüft zuerst,
   was an ihr hängt** (seit 0.8.6) — am ✕ hängt hier nichts weiter, aber die
   Frage gehört vor den Bau, nicht in die Gegenprobe.

4. EXPORT UND IMPORT, FORMATNUMMER 6 → 7. Ohne diesen Punkt kämen
   eingespielte Links herrenlos herein, und ein Export verlöre genau die
   Angabe, die diese Stufe einführt.

   Heute ist ein Link im Export eine nackte Zeichenkette:

       // server.js, Export
       links: qLinks.all(it.id).map(l => l.url),

   Künftig ein Objekt mit `url` und `author`, wie an den vier anderen Trägern
   (`author: verfasserName(l.user_id)`). Damit steigt die Formatnummer von
   **6 auf 7**.

   **DER IMPORT MUSS BEIDE FORMEN LESEN** — eine alte Exportdatei ist kein
   Fehler, sondern der Normalfall nach einem Rückschritt. Eine Zeichenkette
   ist eine Adresse ohne Verfasser; ein Objekt trägt einen Namen. Der
   vorhandene Weg über `verfasser(name)` gilt unverändert: **unbekannte Namen
   fallen an den Einspielenden**, und die Zeile im Protokoll nennt sie.

   DIE EINE FRAGE DAZU: **wem gehört ein Link aus einer Datei der
   Formatnummer 6**, in der gar kein Verfasser steht? „Unbekannter Name"
   trifft es nicht — es steht ja keiner da. Ich halte den **Eintragsverfasser**
   für richtig, dieselbe Antwort wie beim Umstieg und aus demselben Grund:
   die Datei sagt nichts anderes, als dass die Links zu diesem Eintrag
   gehören. Sag mir, ob du das auch so siehst.

Haltepunkt: **nach Punkt 4.** Dann ist die Stufe inhaltlich vollständig —
Schema, Rechte, Anzeige, Austauschformat. Was folgt, ist das Nachziehen an
Stellen, die niemand von selbst sucht.

5. WAS DARAN HÄNGT — ZWEI DIALOGE, DIE DEN FÜNFTEN TRÄGER NICHT KENNEN.
   Beide zählen heute Beiträge auf und beide wären nach Punkt 1 bis 4
   nachweislich unvollständig. Sie stehen zusammen, weil es dieselbe Sorte
   Lücke ist: eine Zahl, die zu klein ist, fällt niemandem auf.

   a) **DER LÖSCHDIALOG AM EINTRAG.** `GET /api/items/:id/bestand` nennt
      Fotos, Dateien und Links als **je eine** Zahl, und Kommentare,
      Bewertungen und Testtage **getrennt nach eigen und fremd** — weil die
      Kaskade dort fremde Beiträge mitnimmt und das nicht wortlos geschehen
      darf. Mit dieser Stufe kann auch ein Link fremd sein. Er gehört damit
      auf dieselbe Seite wie die Kommentare: `eigenLinks` / `fremdLinks`, und
      die Oberfläche nennt sie im Dialog.

   b) **DER LÖSCHDIALOG AM ZUGANG.** `auth.zaehleBestand()` kennt Links
      überhaupt nicht: ein Zugang, der zwanzig Links in fremden Einträgen
      hinterlassen hat, sieht dort **leer** aus. Beide Richtungen gehören
      ergänzt, genau wie bei Kommentaren, Bewertungen und Testtagen — seine
      Links in fremden Einträgen, und fremde Links in seinen Einträgen.

   Dazu die Prüfgruppe **„Keine Zeile ohne Benutzer"**: sie füllt vor dem
   Durchlauf über beide Wege auf, über die eine Zeile entstehen kann. Der
   fünfte Träger gehört in beide.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies den Projektstand (Abschnitt 3 zur Rechteschicht, Abschnitt 5 die
   Entscheidungen — darunter „was an allen Einträgen erscheint, gehört dem
   Admin" —, Abschnitt 6 die Stolpersteine, Abschnitt 7 den Prüfstand samt
   dem Umstiegsabschnitt, Abschnitt 10 den Stufenplan und „Vorgemerkt für
   1.0", Abschnitt 11 die Bindungen) und im Konzeptpapier den Block „Stufe G4
   — offen", die Rechtetabelle in Abschnitt 3 und Teil IV.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst:
   `db.js` (die `links`-Tabelle, `umstieg083()` als Vorbild, `ordneBestandZu`),
   `server.js` (die drei Linkrouten, `detail()`, `qLinks`, Export und Import,
   `GET /api/items/:id/bestand`), `auth.js` (`zaehleBestand`),
   `public/app.js` (`drawLinks()` und die Linkzeile), `pruefung.js`
   (`F_ROUTEN`, die Rechteprüfungen an den Links, „Keine Zeile ohne
   Benutzer", der Abschnitt „UMSTIEG 0.8.3" als Vorbild).
3. Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen. Die Fragen aus den Punkten 1, 3 und 4 gehören hierher, nicht
   in den Bau. Unstimmigkeiten zwischen Papier und Quelltext sagst du jetzt.
4. Erst nach meinem OK bauen — gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
5. Neue Prüfungen in `pruefung.js`, jede mit Gegenprobe: Regel probeweise
   zurückbauen, zeigen, dass genau diese Prüfung namentlich rot wird. Vor dem
   Deuten roter Punkte per `diff` belegen, dass der Quelltext der ist, den du
   zu prüfen glaubst. **Die Gegenproben laufen in einer Kopie des
   Arbeitsbaums** (Stolperstein 100).
6. **Der Umstieg bekommt einen eigenen Prüfabschnitt**, gebaut wie „UMSTIEG
   0.8.3 — ENTFAELLT MIT 1.0": eine Datenbank aus 0.8.20 nachstellen —
   dieselbe Anlage, nur ohne die neue Spalte und mit Linkzeilen darin — und
   belegen, dass der Umstieg sie ergänzt, dass die Bestandszeilen **beim
   Eintragsverfasser** landen und nicht beim Eigentümer, dass ein zweiter Lauf
   stumm bleibt und dass eine **frische** Anlage die Spalte ohne Umstieg trägt.
7. Jede Rechteprüfung braucht zwei vorbereitete Sitzungen, zu jeder
   Verweigerung den Erfolgsfall daneben und die Nachschau, dass nichts
   geschrieben wurde. Für diese Stufe ausdrücklich: ein **Fremder** trägt
   einen Link ein (muss jetzt gehen), löscht seinen eigenen (muss gehen),
   löscht einen fremden (muss 403 sein), der **Admin** löscht einen fremden
   (muss gehen), und der Fremde sortiert um (muss 403 bleiben).
8. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen
  Vorgehens. Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.8.30` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`) — sonst wird der Prüfstand
  namentlich rot.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
  Einzige Ausnahme sind die Marken aus der Bauregel.
* Kein Wort der Oberfläche steht im Quelltext, wenn es das Vokabular kennt.
  Umgekehrt bekommt nichts ein neues Vokabelwort, nur weil es auf dem
  Bildschirm steht.
* Nicht anfassen ohne Rückfrage: Farbschema, Anmeldebremse je Benutzername,
  Verschlüsselungsmodell, Dateiname `katalog.sqlite`, die Einstellung
  `HINTER_PROXY` und alles, was daran hängt.
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

* Zuerst die Frage, ob es den Code überhaupt braucht.
* Das Schema bleibt vollständige DDL in `db.js`. Ein Index über `CREATE INDEX
  IF NOT EXISTS` ist KEIN Fall dafür — er rüstet sich bei jedem Start selbst
  nach, anders als eine neue Spalte.
* Einmaliger Umstiegscode steht gebündelt in einer benannten Funktion je
  Version, mit den Marken `// UMSTIEG 0.8.x — ENTFAELLT MIT 1.0` …
  `// ENDE UMSTIEG 0.8.x`, samt eigenem Prüfabschnitt.
* Jeder markierte Block bekommt sofort einen Eintrag unter „Vorgemerkt für
  1.0" im Projektstand.

**In dieser Runde fällt ausdrücklich etwas darunter** — anders als in den
beiden Runden davor: `umstieg0830()` ist der zweite markierte Block im
Projekt. Er wird gebaut wie der erste und bekommt seinen Eintrag sofort.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitszweig geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; der Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.30.md` liegt im Zweig, als Rohstoff für die
  spätere Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit
  Begründung, neue Stolpersteine mit Nummer und Kernsatz (**die Zählung setzt
  bei 101 fort**), die Gegenprobentabelle, Prüfungszahlen vorher/nachher
  (vorher: **1548**), Offengebliebenes.
* Wie seit 0.8.10: die Zeile „0.8.30 — Abdruck `…`" gehört ins
  Änderungsprotokoll, ZULETZT gebildet, nach der letzten Änderung an einer
  ausgelieferten Datei. Diese Runde fasst `db.js`, `server.js`, `auth.js` und
  `public/app.js` an — alle vier stehen im Abdruck.
* **Der Einspielweg dieser Stufe nennt die Sicherung des Datenverzeichnisses
  ausdrücklich** — es ist die erste Datenbankstufe seit 0.8.3, und ein
  Rückschritt ist ab hier keine reine Dateikopie mehr. Der Weg gehört in den
  Chat, mit den Befehlen und dem erwarteten Ergebnis.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im
  Chat, nicht in den Dokumenten. Für diese Stufe ausdrücklich dabei: die
  Abfrage `PRAGMA table_info(links)` im Container, eine Zählung
  `SELECT COUNT(*) FROM links WHERE user_id IS NULL` (erwartet: 0), und der
  Beleg über zwei Sitzungen, dass ein Fremder einen Link eintragen, aber
  keinen fremden löschen kann.

Projektstand, Konzeptpapier, Ideenpapier und README NICHT anfassen und keinen
Auftragsblock für die nächste Stufe bauen. Das kommt erst, wenn ich gemeldet
habe, dass 0.8.30 eingespielt ist und sauber läuft.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **0.8.40 — Gewichtung der Kriterien**, siehe
  `Konzept_Gewichtung_Bewertungskriterien.md`; sie hebt die Formatnummer
  erneut (7 → 8).
* **Das Ideenpapier schlägt vor, G4 und „Abgelehnt mit Datum und Begründung"
  (4.2) zusammenzulegen**, um eine Formaterhöhung zu sparen. **Das wird hier
  bewusst NICHT getan:** die Regel „jede Stufe muss in einem Chat abzuarbeiten
  sein" wiegt schwerer als eine gesparte Formatnummer, und G4 ist mit Schema,
  Umstieg, Rechtewende, Oberfläche und Austauschformat schon breit genug.
* **Eine Trusted-Proxy-Adressliste** aus 0.8.20 ist weiterhin nicht gebaut und
  bleibt vorgemerkt, falls die Anlage je aus mehreren Netzen zugleich
  erreichbar wird.
