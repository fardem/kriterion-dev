Projekt Kriterion. Angehängt: Quelltext als ZIP, Projektstand, Konzeptpapier
zum Mehrbenutzerbetrieb und das Änderungsprotokoll 0.8.3.

AUFTRAG: Stufe G2, zweite Hälfte, Rest — auf Version 0.8.4. Dazu drei
Nacharbeiten am Eingriffsvermerk aus 0.8.3 und eine neue Kleinigkeit.
Fünf Dinge, in dieser Reihenfolge:

1. Der Eingriffsvermerk sagt, WER eingegriffen hat: „2 Bilder vom Admin
   entfernt". Die Rolle, nicht die Person — kein Name, kein Zeitpunkt, keine
   Kette. Der Satz ist nur so lange wahr, wie `DELETE /api/comment-images/:id`
   hinter `darfAendern` steht; eine Prüfung bindet die Beschriftung an die
   Klemme. Die Kopfzeile wird dadurch länger — sieh dir den Umbruch in der
   schmalen Spalte an und sag, wenn es kippt.
2. `updated_at` bei den Bildwegen des Verfassers. Anhängen ist Bearbeiten,
   also ist Entfernen es auch; heute setzt keiner von beiden „bearbeitet".
   `updated_at` ist eine Aussage ÜBER DEN VERFASSER: er setzt es, der Eingriff
   des Admins NIE — sonst sähe die fremde Löschung aus wie seine eigene
   Bearbeitung. An der Löschroute gilt damit genau eines von beiden, nie beides
   und nie keines. „Ein Merkmal umzuschalten ist keine Bearbeitung" bleibt
   unberührt: Anpinnen und Art setzen weiterhin nichts.
3. Zahlen in der Kopfzeile des Kommentarblocks. Links und Dateien haben ihren
   Hinweis, Kommentare als einziger Block nicht — aufgeklappt sieht man nicht,
   wie viele es sind. Wortlaut:

       12 Kommentare, davon 3 Berichte und 5 ToDo's (2 Done)

   „Davon", nicht Mittelpunkte: die Zahlen dahinter sind TEILMENGEN, keine
   Summanden. Die Klammer nistet die zweite Ebene ein — `Done` steckt IN den
   ToDo's, nicht daneben. Sonst schrumpfte die Zahl beim Abhaken, und 3 + 5 + 2
   ergäbe mehr Kommentare, als es gibt.

   Randfälle: eine Gruppe mit null verschwindet ganz („davon 0 Berichte" ist
   keine Auskunft); ohne erledigte fällt die Klammer weg; bei einem einzigen
   greift die Einzahl, also auch `berichtEinzahl` und `aufgabeEinzahl`; bei
   null Kommentaren bleibt der Hinweis ganz leer, wie bei den Links.

   „Kommentar" bleibt eine FESTE Beschriftung und wird kein zwölftes
   Vokabelwort: anders als Sache und Zeitpunkt verschiebt es sich nicht mit dem
   Gegenstand, und es steht an sechs Stellen, die alle mitziehen müssten. Die
   NOTIZ bleibt ungenannt — sie ist der Zustand ohne Markierung, hat kein
   eigenes Wort, keinen Knopf und keine Kante; wer rechnen will, kommt selbst
   auf sie. Die ANPINNUNG steht nicht in der Zeile: sie ist die zweite,
   unabhängige Achse, und zwei Achsen in einer Zeile sind nicht mehr lesbar.

   DERSELBE volle Satz auch im eingeklappten Zustand — eingeklappt ist gerade
   der Moment, in dem man nicht hineinsieht. Damit weicht der Kommentarblock
   von den übrigen ab, die dort eine sehr kurze Kurzfassung tragen (`keine`,
   `3`, `leer`); das ist ausdrücklich entschieden. Gebildet wird der Text an
   EINEM Ort, nicht an zweien. Ob die Kopfzeile dabei umbricht, ist im Browser
   anzusehen, nicht im Prüfstand — sag es, wenn es kippt.
4. Zwei Anlegen-Schalter im Systembereich: `tagsFreiAnlegen`,
   `kategorienFreiAnlegen`, global, Vorgabe an, als Ableitung beim Lesen. Drei
   Anlegewege am Server, jeweils HINTER dem Nachschlagen des vorhandenen
   Namens — nur so bleibt „Zuweisen darf immer jeder" baulich wahr. Den
   Sonderfall am Testtag beachten: dort bleibt die Eingabe stehen.
5. Vergleichsansicht: Umschalter „meine / alle". Die Kopfzeile schaltet mit,
   die Testtagzeile ebenso (gezählt über `mine`). Vorgabestellung „alle". Der
   Umschalter ist Ansichtszustand im Speicher, keine Einstellung. Bei genau
   einem Zugang erscheint er nicht. Die Zahl für „meine" bildet der Klient:
   bei einem Bewerter hat jedes Kriterium höchstens eine Stimme, Stufe 1 des
   Zweistufenmittels ist also der eigene Wert. Kein zweiter Rechenweg im
   Server — aber ein zweiter Rundungsort für eine andere Zahl, und der gehört
   kommentiert.

Haltepunkt: nach Punkt 4.

Die Reihenfolge ist nicht beliebig. Punkt 4 setzt zwei Schalter IN den
Systembereich, und Stufe G3 sortiert den Systembereich nach Rollen — erst
einräumen, dann aufräumen. Punkt 4 muss deshalb in diese Version, Punkt 5 hat
keine solche Bindung und steht darum hinter dem Haltepunkt.

Zu beachten: KEIN Punkt fasst das Schema an. Kommt dir doch einer in die
Quere, gilt die Bauregel, und du sagst es vorher — so wie beim Eingriffsvermerk
in 0.8.3. Jede neue schreibende Route gehört in `F_ROUTEN` (aktuell 46); bei
Punkt 4 ändern sich voraussichtlich nur zwei Arten, keine Zahl. Punkte 3, 4
und 5 bringen Bedienelemente, also `dispatchEvent` samt Durchlauf der
Ereignisschleife.

Entschieden und NICHT zu bauen, nur ins Papier: der Eingriffsvermerk bleibt
für ALLE sichtbar, nicht nur für den Verfasser. Das Loch, das ein entferntes
Bild hinterlässt, ist für jeden Leser da; ein Vermerk, den nur einer sieht,
wäre eine Benachrichtigung, und die hat Kriterion nicht. Dazu der allgemeine
Satz: ein Vermerk gehört dorthin, wo aus einer Aussage etwas HERAUSGENOMMEN
wird — nicht dorthin, wo eine ganze Aussage verschwindet. Damit bleibt die
Ausnahme von „kein Änderungsverlauf" auf einen Fall begrenzt.


VORGEHEN — in dieser Reihenfolge:

1. Lies den Projektstand (besonders Abschnitt 5, Abschnitt 6 Stolpersteine,
   Abschnitt 11), die Blöcke „Stufe G2, zweite Hälfte" und „Stufe G3" im
   Konzeptpapier und das Änderungsprotokoll 0.8.3.
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
  (Stolperstein 81).
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
  `node_modules/`, `package-lock.json`)
* ein `Aenderungsprotokoll_0.8.4.md` als Rohstoff für die spätere
  Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit Begründung,
  neue Stolpersteine mit Nummer und Kernsatz, die Gegenprobentabelle,
  Prüfungszahlen vorher/nachher, was für „Vorgemerkt für 1.0" anfällt,
  Offengebliebenes
* die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten, und ohne Platzhalter, die die Shell frisst

Projektstand und Konzeptpapier NICHT anfassen und keinen Auftragsblock für
die nächste Stufe bauen. Das kommt erst, wenn ich gemeldet habe, dass 0.8.4
eingespielt ist und sauber läuft.


ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* Stufe G3 rückt auf 0.8.5 — „Der Systembereich lernt die Rechte", unverändert
  wie im Konzeptpapier beschrieben.
* NEUE STUFE G4 auf 0.8.6 — „Die Linkliste bekommt Verfasser." Links dürfen
  von jedem eingetragen werden; löschen darf sie der Eintrager oder der Admin,
  und der Name des Eintragers steht ab zwei Zugängen an der Zeile. Das kehrt
  die Zeile „Titel, Beschreibung, Fotos, Dateien, LINKS, Tags, Kategorie" in
  der Rechtetabelle des Konzeptpapiers um und macht Links zum fünften Träger
  neben Eintrag, Kommentar, Testtag und Bewertung. Umfang: `user_id` an
  `links` samt Umstiegsblock und `ON DELETE SET NULL`; Bestandszeilen fallen
  an den EINTRAGSVERFASSER, nicht an den Eigentümer; Export und Import nennen
  den Namen, also Formatnummer 6 → 7; Sortieren bleibt beim Eintragsverfasser
  und Admin (ändert keine Aussage, ist umkehrbar); Platz in der Zeile prüfen,
  sie trägt schon Domain, Pfad und bis zu vier Anbieternamen. Ein gelöschter
  Link bekommt AUSDRÜCKLICH keinen Vermerk — er ist eine ganze Aussage, die
  geht, kein Loch in einer bleibenden.
* Stufe H (Tokens) rückt auf 0.8.7, Stufe I bleibt 0.9.0.
