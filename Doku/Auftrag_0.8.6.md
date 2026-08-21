Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier zum Mehrbenutzerbetrieb und das Änderungsprotokoll
0.8.5 stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an einer Kopie.

AUFTRAG: „Berichtigungen aus dem Betrieb", auf Version 0.8.6.
KEINE STUFE DES UMBAUS — eine Runde Nacharbeit. Fünf Punkte, alle beim Ansehen
von 0.8.5 aufgefallen. Kein Schema, kein Umstiegscode.

Fünf Dinge, in dieser Reihenfolge:

1. Die Bewertungsdetails gehören dem Admin. Unter der Sternzeile steht heute je
   Kriterium, WER WELCHEN WERT VERGEBEN HAT — mit Namen, für jeden sichtbar.
   Das ist mehr, als eine Bewertung aussagen soll. Künftig zeigt die Zeile nur
   noch den eigenen Wert und den Durchschnitt; die Namensliste sieht der ADMIN
   IN EINER EIGENEN ANSICHT, die er ausdrücklich aufruft.

   DAS NIMMT DIE STIMMENLISTE AUS 0.8.2 ZURÜCK — ausdrücklich und mit Ansage.
   Und sie ist seither DIE VORAUSSETZUNG DES LÖSCHWEGS: das ✕ an einer fremden
   Bewertung hängt an ihrer Zeile. Verschwindet die Liste ersatzlos, kann der
   Admin keine fremde Bewertung mehr entfernen. Die eigene Ansicht ist deshalb
   KEIN ZUSATZ, SONDERN DIE BEDINGUNG — sie trägt den Löschweg weiter.
   `DELETE /api/ratings/:id` bleibt unverändert; was sich ändert, ist, von wo
   aus er gerufen wird. Er bleibt in `F_ROUTEN` bei `'im Rumpf'`.

   DIE STIMMEN MÜSSEN AUS `detail()` HERAUS. Sie hängen dort an jeder
   Kriterienzeile (`r.stimmen`), und `GET /api/items/:id` liefert an jeden.
   Nach Stolperstein 79 gilt: WAS NICHT ANGEZEIGT WERDEN DARF, WIRD NICHT
   GELIEFERT — sonst hängt die Regel daran, dass die Oberfläche mitspielt.
   Der Weg ist ein eigener lesender Endpunkt hinter `nurAdmin`, genau das
   Muster von `GET /api/stats` seit 0.8.5: KEIN Eintrag in `F_ROUTEN`, die
   Liste führt nur schreibende. Die Zahl bleibt bei 46.
   `stimmenJeKriterium()` bleibt, wo sie ist, und bekommt einen zweiten Rufer.

   Sag mir vor dem Bauen, WIE DER ADMIN DIE ANSICHT AUFRUFT — ein Zeichen an
   der Kriterienzeile, ein Knopf im Blockkopf, oder etwas anderes. Und ob die
   Ansicht ein Dialog ist oder ein Aufklapper.

   `avg` und `count` bleiben, wie sie sind: der Schnitt und die Zahl der
   Bewerter sind keine Aussage über eine Person.

2. Die Linkliste scrollt am Finger nicht mehr in sich selbst. Wer auf dem Handy
   die Seite herunterzieht und dabei über die Linkliste kommt, scrollt plötzlich
   nur noch die Liste statt der Seite. Ursache ist `box.style.overflowY = 'auto'`
   in `begrenzeLinks()`.

   DER EINFACHSTE WEG IST DER BESTE: `hidden` statt `auto`. Die Liste bekommt
   keinen eigenen Bildlauf mehr, sondern wird abgeschnitten — und der Knopf
   „alle N anzeigen" STEHT SCHON DA und klappt sie auf. Damit scrollt am Finger
   immer die Seite, und die Einstellung „sichtbare Zeilen" behält ihren Sinn.
   Eine Haltezeit wie beim Ziehen ist die aufwendigere und ungewohntere Lösung;
   sie ist beim Scrollen nicht üblich und verzögerte jedes Wischen um 0,4 s.

   BEI DER TAGWOLKE MITPRÜFEN: `begrenzeWolke()` setzt `overflow` ebenso, und
   dort hängt zusätzlich Stolperstein 61 daran (die Wolke wird beim Aufklappen
   neu gezeichnet). Wenn dort dasselbe Verhalten auftritt, gehört es mit
   berichtigt — sag es vorher, wenn du es kommen siehst.

Haltepunkt: nach Punkt 2.

3. Die Lücke im Kartenraster. Die Kachel „Zugänge" geht seit 0.8.5 über die
   volle Breite. Steht sie nicht am Anfang einer Rasterzeile, lässt CSS Grid
   davor eine Lücke.

   EINE FESTE POSITION LÖST DAS NICHT: wie viele Karten in eine Zeile passen,
   hängt an der Fensterbreite (`auto-fit`, `minmax(300px, 1fr)`), und wie viele
   Karten es überhaupt gibt, hängt an der Rolle — dreizehn beim Eigentümer, elf
   beim Admin. Position 10 stimmt bei drei Spalten und ist bei zwei falsch.
   Richtig ist `grid-auto-flow: dense` am `.sys-grid`: das Raster zieht eine
   nachfolgende schmale Karte in die Lücke, unter jeder Breite und bei jeder
   Kartenzahl. Die Reihenfolge im Quelltext bleibt, wie sie ist.

   Wenn `dense` in der Prüfung nicht belegbar ist — jsdom rechnet kein Layout —,
   dann sag es und prüfe am Stylesheet, nicht am Gefühl (Stolperstein 30).

4. „Angelegt von" bekommt ein Datum. Die Zeile in der Detailansicht nennt den
   Verfasser, aber nicht wann. `items.created_at` steht in der Antwort, es ist
   reine Anzeige. BEI GENAU EINEM ZUGANG bleibt die Zeile weg wie bisher —
   dann ist auch das Datum kein Gewinn, es steht schon in der Sortierung.

5. „Angemeldet als" in der Kopfzeile, neben dem Knopf „Abmelden". AUCH BEI
   EINEM EINZIGEN ZUGANG anzeigen: es ist eine Aussage über MICH, nicht über
   andere — derselbe Grund, aus dem die Karte „Zugang" in 0.8.5 für jeden
   stehenbleibt.

   Der Name steht in `GET /api/account`. Die Kopfzeile wird aber auch beim
   Direkteinstieg auf einen Eintrag gezeichnet, und dort läuft `loadAll()`
   nicht (Stolperstein 16). Prüf, ob der Name an `/api/settings` gehört — dort
   stehen `benutzerZahl`, `istAdmin` und `istEigentuemer` schon aus genau
   diesem Grund. Sag mir, wofür du dich entscheidest.

Die Reihenfolge ist nicht beliebig. Punkte 1 und 2 stellen etwas richtig — eine
Angabe über Personen, die niemanden angeht, und ein Bedienelement, das auf dem
Handy das Falsche tut. Punkte 3 bis 5 machen dieselben Bildschirme nur besser.
Deshalb liegt der Haltepunkt dazwischen: bleibt die Zeit knapp, ist die Runde
inhaltlich trotzdem fertig.

Zu beachten: KEIN Punkt fasst das Schema an. Kommt dir doch einer in die Quere,
gilt die Bauregel, und du sagst es vorher. Es entsteht voraussichtlich KEINE
neue schreibende Route, `F_ROUTEN` bleibt bei 46. Punkt 1 ist der einzige
Servereingriff, Punkte 2 bis 5 sind Oberfläche.

ZWEI DINGE, DIE BEIM LESEN DES QUELLTEXTS SCHON AUFGEFALLEN SIND — sie
ersetzen Schritt 3 des Vorgehens nicht, sie sparen nur eine Runde:

* `stimmenJeKriterium()` wird HEUTE NUR AUS `detail()` GERUFEN und wirft ohne
  Benutzer (`if (benutzerId == null) throw`). Der neue Endpunkt muss den
  Benutzer also weitergeben; die Klemme am Funktionsanfang bleibt und ist kein
  Auffangnetz, sondern Absicht (Stolperstein 59).
* Die Oberfläche zeichnet die Liste heute unter `if (!mehrereBenutzer() || !(r.stimmen || []).length) return;`.
  DAS IST EINE BEDINGUNG MIT EINEM MEIST WAHREN ODER — die Prüflage für die
  neue Ansicht braucht deshalb einen Rufer, für den der erste Teil falsch ist
  (Stolperstein 73). Zwei Zugänge genügen nicht; es braucht einen Aufbau MIT
  und einen OHNE Adminrolle.

Auflage aus Stolperstein 74: wird ein Endpunkt eingeschränkt, sind die
Prüfungen der Vorgängerversion die ersten Betroffenen. Hier namentlich alles,
was die Stimmenliste an der Kriterienzeile prüft — in `pruefung.js` unter
anderem „Jede Stimme nennt Name und Wert", „Die eigene Stimme ist
gekennzeichnet", „Der Admin bekommt ein ✕ an jeder fremden Stimme", „Ein
Kriterium ohne Stimme bekommt gar keine Liste", „Und keine Stimmenliste unter
den Sternen", dazu die serverseitigen „Die eigene Stimme ist als solche
gekennzeichnet" und „Jede Stimme nennt ihre Nummer". UMDREHEN ODER UMHÄNGEN,
NICHT LÖSCHEN — sie gehören an die neue Ansicht, nicht in den Papierkorb. In
0.8.3, 0.8.4 und 0.8.5 ist das je zweimal vorgekommen und hat funktioniert.

Für die Oberflächenprüfungen steht die Prüflage bereit: `baueDom()` liefert
`stimmen` an jeder Kriterienzeile des Beispieleintrags, mit vier Lagen
nebeneinander (eigene, fremde lebende, Grabstein, herrenlos). Wandern die
Stimmen in einen eigenen Endpunkt, MUSS DER DOPPELGÄNGER IHN KENNEN — antwortet
er mit dem leeren Objekt, zeichnet die Ansicht nichts, und jede Prüfung darauf
wäre blind (dieselbe Überlegung wie bei `/api/users` und `/api/stats`).

Entschieden und NICHT zu bauen, nur ins Papier: eine anonyme Werteliste
(„3 · 4 · 2" ohne Namen) wurde verworfen. Der Admin wüsste dann nicht, wessen
Bewertung er entfernt, und für alle anderen wäre es eine Zahlenreihe ohne
Aussage.


VORGEHEN — in dieser Reihenfolge:

1. Lies den Projektstand (besonders Abschnitt 5, Abschnitt 6 Stolpersteine,
   Abschnitt 11), den Block „0.8.6" im Konzeptpapier und das
   Änderungsprotokoll 0.8.5.
2. Sieh dir die betroffenen Dateien im Repo an, bevor du etwas vorschlägst.
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
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen Vorgehens,
  keine Zusammenfassung dessen, was ohnehin im Protokoll steht. Was ich sehen
  muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
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

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitszweig geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; der Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Das Repo ist privat, der Server zieht nicht
  selbst — das Einspielpaket holt sich der Mensch über „Download ZIP" von
  GitHub. Der gepushte Stand IST also das Auslieferungspaket, und was nicht im
  Zweig steht, kommt nicht auf den Server. Vor dem letzten Push deshalb:
  `git status` muss leer sein, und `npm test` läuft ein letztes Mal gegen
  genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.6.md` liegt im Zweig, als Rohstoff für die
  spätere Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit
  Begründung, neue Stolpersteine mit Nummer und Kernsatz, die
  Gegenprobentabelle, Prüfungszahlen vorher/nachher, was für „Vorgemerkt für
  1.0" anfällt, Offengebliebenes.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten, und ohne Platzhalter, die die Shell frisst. Wo eine
  Anmeldung nötig ist, gehört sie in den Befehl hinein: `kekse.txt` entsteht
  nicht von selbst.

Projektstand, Konzeptpapier und README NICHT anfassen und keinen Auftragsblock
für die nächste Stufe bauen. Das kommt erst, wenn ich gemeldet habe, dass
0.8.6 eingespielt ist und sauber läuft.

Zum Einspielen, siehe Projektstand Abschnitt 2: `public/app.js` steckt fest im
Docker-Abbild und nicht im eingehängten Verzeichnis — ohne `--build` läuft die
alte Oberfläche weiter, und die Versionsnummer im Footer taugt nicht als Beleg,
sie kommt aus `package.json` und sagt nichts über die übrigen Dateien. Nenn mir
deshalb im Chat eine Textstelle, die es nur in der neuen `public/app.js` gibt,
zum Gegenprüfen mit `curl -s http://localhost:3100/app.js | grep -c`.


ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* STUFE G4 auf 0.8.7 — „Die Linkliste bekommt Verfasser." Links dürfen von
  jedem eingetragen werden; löschen darf sie der Eintrager oder der Admin, und
  der Name des Eintragers steht ab zwei Zugängen an der Zeile. Das kehrt die
  Zeile „Titel, Beschreibung, Fotos, Dateien, LINKS, Tags, Kategorie" in der
  Rechtetabelle des Konzeptpapiers um und macht Links zum fünften Träger neben
  Eintrag, Kommentar, Testtag und Bewertung. Umfang: `user_id` an `links` samt
  Umstiegsblock und `ON DELETE SET NULL`; Bestandszeilen fallen an den
  EINTRAGSVERFASSER, nicht an den Eigentümer; Export und Import nennen den
  Namen, also Formatnummer 6 → 7; Sortieren bleibt beim Eintragsverfasser und
  Admin; Platz in der Zeile prüfen, sie trägt schon Domain, Pfad und bis zu
  vier Anbieternamen. Ein gelöschter Link bekommt AUSDRÜCKLICH keinen Vermerk.
  ERSTE DATENBANKSTUFE SEIT 0.8.3 — die Sicherung des Datenverzeichnisses
  gehört wieder ausdrücklich in den Einspielweg.
* Stufe H (Tokens) wird 0.8.8, Stufe I bleibt 0.9.0.
* Der README-Abschnitt zur Stimmenliste unter der Sternzeile wird durch Punkt 1
  dieser Runde falsch. Er ist in 0.8.5 gerade erst geschrieben worden und
  gehört in der Doku-Runde NACH dem Einspielen berichtigt — zusammen mit dem,
  was Punkt 1 an der Adminansicht neu schafft.
