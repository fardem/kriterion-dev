Projekt Kriterion. Angehängt: Quelltext als ZIP, Projektstand, Konzeptpapier
zum Mehrbenutzerbetrieb und das Änderungsprotokoll 0.8.4.

AUFTRAG: Stufe G3 — „Der Systembereich lernt die Rechte", auf Version 0.8.5.
Es ist die einzige Stelle, an der die Rechteschicht aus Stufe F noch keine
Entsprechung auf dem Bildschirm hat: der Server verweigert längst jedes
Schreiben, aber die Oberfläche bietet es weiter an. Es ist kein Loch — es ist
genau die Bauform, gegen die hier schon zweimal entschieden wurde: EIN KNOPF,
DER ZUVERLÄSSIG EINE FEHLERMELDUNG ERZEUGT, SIEHT AUS WIE EIN FEHLER.

Sechs Dinge, in dieser Reihenfolge:

1. Die Karten des Systembereichs nach Rolle. Heute hängt genau EINE an der
   Rolle („Zugänge"); bei den Kriterien sind immerhin die Bedienelemente
   ausgeblendet. Ein gewöhnlicher Benutzer sieht sonst alles: Titel mit
   Eingabefeldern und Speichern-Knopf, Kennzahlen samt Speicherverbrauch,
   Export und Import als vollständige Kacheln, Kategorien und Tags mit ✎ und ✕,
   Vokabular zum Bearbeiten.

   Die Regel ist nicht „weg mit allem, was der Benutzer nicht darf", sondern:
   WAS VERSCHWINDET, SIND DIE KARTEN, NICHT DIE DATEN. Vokabular und
   `appTitle` müssen weiter ausgeliefert werden — das Vokabular IST jede
   Beschriftung der Oberfläche, der Titel steht in der Kopfzeile. Es geht um
   den Bildschirm, nicht um die Antwort.

   Drei Karten bleiben ausdrücklich für JEDEN stehen, auch ohne Rolle:
   „Zugang" (der eigene Zugang — Selbstbezug, geht niemanden sonst an),
   „Darstellung" (Schriftgröße, Zeitleiste, Blockanordnung — alles
   persönlich) und die persönliche Hälfte von „Links". Zur Karte „Links"
   siehe Punkt 3 unten, sie ist der Sonderfall.

2. `GET /api/stats` hinter `nurAdmin`. Das NIMMT DIE ENTSCHEIDUNG „Die
   Kennzahlen selbst sieht weiterhin jeder" AUS 0.7.2 ZURÜCK — ausdrücklich
   und mit Ansage, keine stillschweigende Verschärfung. Die Kennzahlen sagen,
   wie groß der Bestand und die Datenbank sind; das ist eine Aussage über die
   Anlage als Ganzes, nicht über den Einzelnen.

   Lesende Route, also KEIN Eintrag in `F_ROUTEN` — die Liste führt nur
   schreibende. Der Wächter steht trotzdem davor; genau dasselbe Muster wie
   bei `GET /api/items/:id/bestand` seit 0.8.2.

   Der Schlüsselwert in derselben Antwort bleibt, wie er ist: den bekommt
   weiterhin nur der Eigentümer, und das ist eine zweite, engere Klemme im
   selben Rumpf. Nicht zusammenlegen.

3. Kategorien und Tags bekommen das Muster der Kriterienkarte: Zeilen
   sichtbar, ✎ und ✕ weg. Nicht die Karte verstecken — WER NICHT VERWALTEN
   DARF, DARF TROTZDEM NACHSEHEN, was es gibt. Bei den Kriterien ist genau
   das schon gebaut und geprüft; hier wird es übernommen, nicht neu erfunden.

   Die beiden Anlegen-Häkchen aus 0.8.4 stehen in diesen Karten bereits hinter
   `ADMIN` — nicht doppelt klammern.

   DIE KARTE „LINKS" IST DER SONDERFALL und im Konzeptpapier nicht bedacht:
   sie mischt Persönliches (sichtbare Linkzeilen, Zahl der Anbieternamen) mit
   Adminsachen (Vorrat, Startanbieter, die drei eigenen Anbieter) in EINER
   Karte. Sie darf deshalb weder ganz bleiben noch ganz verschwinden. Sag mir
   vor dem Bauen, wie du sie schneidest — zwei Karten oder eine Karte mit
   einem Adminteil.

4. Die `AUTH_RESET`-Zeile in der Karte „Zugang" berichtigen. Dort steht
   weiterhin „vergessen heißt `AUTH_RESET=1` am Server". Das ist seit 0.8.0
   FALSCH — `AUTH_RESET` wird abgelehnt, der Weg heißt `zugang.js` auf dem
   Wirt. Die Karte „Zugänge" nennt zwei Bildschirmzeilen tiefer schon den
   richtigen Befehl. Eine falsche Anleitung auf dem Bildschirm ist schlimmer
   als eine fehlende: sie wird befolgt.

Haltepunkt: nach Punkt 4.

5. Die Kachel „Zugänge" über die volle Breite. Sie trägt eine Liste mit Namen,
   Rolle, Status, Eintragszahl und bis zu vier Bedienelementen je Zeile und
   steht heute im selben Raster wie „Titel" — das ist zu eng für das, was
   drinsteht.

6. Dezente Trennlinien zwischen den Abschnitten der Linkliste im Systemmenü.

Die Reihenfolge ist nicht beliebig. Punkte 1 bis 4 stellen Aussagen richtig —
ein Knopf, den es nicht geben darf, und eine Anleitung, die in die Irre führt.
Punkte 5 und 6 machen denselben Bildschirm nur besser lesbar. Deshalb liegt
der Haltepunkt dazwischen und nicht am Ende: bleibt die Zeit knapp, ist die
Stufe inhaltlich trotzdem fertig.

Zu beachten: KEIN Punkt fasst das Schema an. Kommt dir doch einer in die
Quere, gilt die Bauregel, und du sagst es vorher — so wie beim Eingriffsvermerk
in 0.8.3. Es entsteht voraussichtlich KEINE neue schreibende Route, `F_ROUTEN`
bleibt bei 46. Die Punkte 1, 3, 5 und 6 sind Oberfläche, Punkt 2 ist der
einzige Servereingriff, Punkt 4 ist ein Satz.

DREI DINGE, DIE BEIM LESEN DES QUELLTEXTS SCHON AUFGEFALLEN SIND — sie
ersetzen Schritt 3 des Vorgehens nicht, sie sparen nur eine Runde:

* `renderSystem()` holt `/api/stats` in EINEM `Promise.all` mit fünf anderen
  Abrufen, und der ganze Block hängt in einem `try/catch`, das bei einem
  Fehler `return`t. Geht `stats` hinter `nurAdmin`, bekommt ein gewöhnlicher
  Benutzer eine Absage — und damit BLEIBT DER GESAMTE SYSTEMBEREICH LEER,
  auch die drei Karten, die ihm zustehen. Das ist die konkreteste Falle
  dieser Stufe: Punkt 2 ist ohne Punkt 1 nicht zu haben.
* Die Karte „Export" liest `stats.photoBytes` und `stats.attachmentBytes` für
  ihre Größenschätzung. Sie steht ohnehin nur dem Eigentümer offen, aber die
  Datenabhängigkeit gehört beim Umbau mitgedacht.
* Das Konzeptpapier spricht von „neun Karten". Es sind ZWÖLF: Titel, Zugang,
  Kennzahlen, Export, Import, Kategorien, Tags, Bewertungskriterien, Zugänge,
  Darstellung, Links, Vokabular. Die Zahl im Papier ist veraltet, die
  Aufzählung dort nicht falsch — sie nennt nur nicht alle.

Auflage aus Stolperstein 74: wird ein Endpunkt eingeschränkt, sind die
Prüfungen der Vorgängerversion die ersten Betroffenen. Hier namentlich:
„Die Kennzahlen selbst sieht weiterhin jeder" (Gruppe „Was dem Eigentuemer
gehoert") und „Tags und Kategorien bleiben unangetastet bedienbar" (Gruppe
„Linkliste und Aktionszeichen"). UMDREHEN, NICHT LÖSCHEN. In 0.8.3 und 0.8.4
ist das je zweimal vorgekommen und hat funktioniert.

Für die Oberflächenprüfungen steht die Prüflage schon bereit: `eSysUser` baut
den Systembereich mit `istAdmin: false`. Daneben gehört ein Aufbau MIT Rolle,
sonst bliebe verdeckt, ob eine Karte an der Rolle hängt oder schlicht fehlt.

Entschieden und NICHT zu bauen, nur ins Papier: „Ansicht für Vokabular und
Titel gar nicht" aus dem ersten Entwurf lässt sich nicht wörtlich einlösen und
wird auch nicht versucht. Das Vokabular ist jede Beschriftung, der Titel steht
in der Kopfzeile — beide müssen ausgeliefert werden, sonst hat der Benutzer
eine Oberfläche ohne Wörter. Was verschwindet, sind die Karten.


VORGEHEN — in dieser Reihenfolge:

1. Lies den Projektstand (besonders Abschnitt 5, Abschnitt 6 Stolpersteine,
   Abschnitt 11), den Block „Stufe G3" im Konzeptpapier und das
   Änderungsprotokoll 0.8.4.
2. Sieh dir die betroffenen Dateien im ZIP an, bevor du etwas vorschlägst.
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
6. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch.
* Versionsnummer in `package.json` auf die im Auftrag genannte setzen. Drei
  Zahlen, keine Buchstaben.
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
  (Stolperstein 81). Bei verschwindenden Karten heißt das: nicht nur „ist weg"
  prüfen, sondern daneben belegen, dass sie mit Rolle DA ist.
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

AM ENDE DES CHATS liefere mir:

* `kriterion.zip` (Ordner `kriterion/` oberste Ebene, ohne `.env`, `data/`,
  `node_modules/`, `package-lock.json`, `Doku/`)
* ein `Aenderungsprotokoll_0.8.5.md` als Rohstoff für die spätere
  Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit Begründung,
  neue Stolpersteine mit Nummer und Kernsatz, die Gegenprobentabelle,
  Prüfungszahlen vorher/nachher, was für „Vorgemerkt für 1.0" anfällt,
  Offengebliebenes
* die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten, und ohne Platzhalter, die die Shell frisst

Projektstand und Konzeptpapier NICHT anfassen und keinen Auftragsblock für
die nächste Stufe bauen. Das kommt erst, wenn ich gemeldet habe, dass 0.8.5
eingespielt ist und sauber läuft.

Zum Einspielen: die Versionsnummer im Footer kommt aus `package.json` und
sagt NICHTS über die übrigen Dateien. Nach dem `--build` mit einer Textstelle
gegenprüfen, die es nur in der neuen `public/app.js` gibt — sie steckt fest im
Docker-Abbild und nicht im eingehängten Verzeichnis. Siehe Projektstand
Abschnitt 2.


ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* STUFE G4 auf 0.8.6 — „Die Linkliste bekommt Verfasser." Links dürfen von
  jedem eingetragen werden; löschen darf sie der Eintrager oder der Admin, und
  der Name des Eintragers steht ab zwei Zugängen an der Zeile. Das kehrt die
  Zeile „Titel, Beschreibung, Fotos, Dateien, LINKS, Tags, Kategorie" in der
  Rechtetabelle des Konzeptpapiers um und macht Links zum fünften Träger neben
  Eintrag, Kommentar, Testtag und Bewertung. Umfang: `user_id` an `links` samt
  Umstiegsblock und `ON DELETE SET NULL`; Bestandszeilen fallen an den
  EINTRAGSVERFASSER, nicht an den Eigentümer; Export und Import nennen den
  Namen, also Formatnummer 6 → 7; Sortieren bleibt beim Eintragsverfasser und
  Admin (ändert keine Aussage, ist umkehrbar); Platz in der Zeile prüfen, sie
  trägt schon Domain, Pfad und bis zu vier Anbieternamen. Ein gelöschter Link
  bekommt AUSDRÜCKLICH keinen Vermerk — er ist eine ganze Aussage, die geht,
  kein Loch in einer bleibenden.
  G4 fasst die Linkliste AM EINTRAG an, nicht die Karte „Links" im
  Systembereich — die beiden gehen sich nicht ins Gehege.
* Stufe H (Tokens) bleibt 0.8.7, Stufe I bleibt 0.9.0.
* `README.md` ist seit 0.8.3 nicht mehr nachgezogen. Offen sind dort: die
  beiden Anlegen-Häkchen im Systembereich, dass das Anlegen von Tags und
  Kategorien abschaltbar ist, und der Umschalter „meine / alle" im Vergleich.
  Dazu kommt, was diese Stufe an den Karten ändert. Gehört in eine eigene
  Runde zusammen mit Projektstand und Konzeptpapier, nicht hier.
