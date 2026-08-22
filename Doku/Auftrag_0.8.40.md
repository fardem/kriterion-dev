Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, das Ideenpapier, das Gewichtungspapier und die
Änderungsprotokolle 0.8.6, 0.8.10, 0.8.20, 0.8.30 und 0.8.31 stehen dort unter
`Doku/`. Gearbeitet wird im Repo, nicht an einer Kopie.

AUFTRAG: **Version 0.8.40 — „Nicht jedes Kriterium wiegt gleich."**
DIES IST KEINE STUFE DES MEHRBENUTZERBETRIEBS — der ist mit G4 bis auf H und I
gebaut. Es ist die nächste Runde des Stufenplans, **und es ist eine
Datenbankstufe**: vollständige DDL in `db.js`, ein **Umstiegsblock mit
Marken**, ein eigener Prüfabschnitt, ein Eintrag unter „Vorgemerkt für 1.0" —
und die **Sicherung des Datenverzeichnisses gehört in den Einspielweg**.

Ausgearbeitet liegt die Sache vollständig in
`Konzept_Gewichtung_Bewertungskriterien.md`. **Lies es ganz, bevor du etwas
vorschlägst.** Dieser Auftrag wiederholt es nicht, er schneidet es in Punkte,
setzt die Zahlen dieser Version ein und benennt, was seit dem Schreiben des
Papiers dazugekommen ist.

WARUM DIESE RUNDE JETZT KOMMT: 0.8.30 (Stufe G4) und 0.8.31 (Dateien) sind
gebaut, Abdruck `1a801477`. Damit sind die sechs Träger vollständig und der
Weg zur nächsten Zahl des Stufenplans ist frei.

WAS SICH ÄNDERT, IN EINEM SATZ: Jedes Bewertungskriterium bekommt ein
**Gewicht** zwischen 0,2 und 2, einstellbar vom Admin, und der Gesamtschnitt
eines Eintrags wird zum **gewichteten Mittelwert** — bei Gewicht 1 überall
rechnerisch identisch mit heute.

DIE ZUSICHERUNG, DIE DIESE RUNDE TRÄGT, UND SIE IST BAULICH, NICHT GEKLEMMT:
ein Eintrag kommt nie über 5 und nie unter 1. Das ist keine Regel, die
irgendwo durchgesetzt wird — ein gewichteter Mittelwert liegt bei positiven
Gewichten **immer** zwischen dem kleinsten und dem größten gemittelten Wert.
Es gibt keinen Deckel, der vergessen werden könnte, weil es keinen Deckel
gibt. Dieselbe Bauform wie die Rollenleiter aus 0.8.0.

**ES GIBT KEINE NEUE SCHREIBENDE ROUTE.** `PUT /api/criteria/:id` gibt es
bereits, sie steht bereits hinter `nurAdmin` und bereits in `F_ROUTEN`. **Die
Zahl bleibt bei 46, und keine Art wechselt.** Das ist ausdrücklich zu
erwähnen, weil es die erste Runde seit langem ist, in der das gilt.

Fünf Punkte. Die Bündelung folgt der Sache; bei jedem Punkt steht, warum er so
geschnitten ist.

---

1. DAS SCHEMA UND DER UMSTIEG. Der kleinste Punkt der Runde, und trotzdem der
   erste — alles Weitere setzt die Spalte voraus.

   `rating_criteria` bekommt `gewicht REAL NOT NULL DEFAULT 1.0`. Warum `REAL`
   und nicht Hundertstel als `INTEGER`, warum 0 verboten ist und warum die
   Untergrenze 0,2 keine Geschmacksfrage ist, steht im Gewichtungspapier,
   Abschnitt 3 — samt dem Kommentartext, der an die Spalte gehört.

   DER UMSTIEGSBLOCK, gebaut wie `umstieg0830()` und `umstieg0831()` und mit
   denselben Marken:

       // UMSTIEG 0.8.40 — ENTFAELLT MIT 1.0
       function umstieg0840() { … }
       umstieg0840();
       // ENDE UMSTIEG 0.8.40

   Er ist der **vierte markierte Block** im Projekt. `PRAGMA
   table_info(rating_criteria)` entscheidet, ob etwas zu tun ist; einmalig,
   wiederholbar und im Normalfall stumm.

   **BESTANDSZEILEN BEKOMMEN 1,0**, und hier ist die Frage — anders als bei
   den Links und den Dateien — wirklich trivial: jeder andere Wert änderte
   beim Einspielen still sämtliche Gesamtschnitte. Sie gehört trotzdem
   ausdrücklich beantwortet, weil Stolperstein 20 sie verlangt. **Und die
   Vorgabe kommt aus dem `DEFAULT` der Spalte, nicht aus einem `UPDATE`** —
   ein `ALTER TABLE … ADD COLUMN … NOT NULL DEFAULT 1.0` füllt die
   Bestandszeilen selbst.

   **`ordneBestandZu()` wird NICHT angefasst.** Dort geht es um `user_id` und
   um die Frage, wem eine herrenlose Zeile gehört. Ein Gewicht kann nicht
   herrenlos werden — es hat einen `NOT NULL`-Vorgabewert. Sag es im
   Vorschlag ausdrücklich, damit klar ist, dass die Frage gestellt und
   verneint wurde.

   **KEIN `CHECK`-CONSTRAINT.** Das Papier begründet das damit, dass SQLite
   ein CHECK nicht per `ALTER TABLE` nachrüsten kann und eine DDL-only-Lösung
   frische und migrierte Anlagen verschieden baute. **Stell das nach, statt es
   zu glauben** — 0.8.30 hat auf demselben Weg Stolperstein 105 gefunden
   (`ALTER TABLE … ADD COLUMN … REFERENCES` geht nur mit der Vorgabe NULL).
   Wenn das Nachstellen etwas anderes ergibt, sag es.

   **VORGEMERKT FÜR 1.0:** der markierte Block bekommt sofort seinen Eintrag —
   Datei, Zeilenzahl, Prüfabschnitt, was bleibt (die Spalte) und was fällt
   (der Block). Wie bei 0.8.30 und 0.8.31 gehört dazu der Satz, was
   **nicht** mitfällt.

2. DER RECHENWEG — UND DIE EINE FALLE, DIE ALLES KIPPT. Zwei Änderungen im
   Server, beide klein; sie stehen zusammen, weil die zweite ohne die erste
   gefährlich wird.

       // server.js
       const qSchnittJeKriterium = …   // bekommt einen JOIN auf rating_criteria
       function gesamtSchnitt(karte)   // wird ein gewichteter Mittelwert

   **DER NENNER DARF NUR DIE GEWICHTE DER BEWERTETEN KRITERIEN SUMMIEREN.**
   Das ist die eine Stelle, an der ein naheliegender Griff die ganze
   Zusicherung bricht. Ein Nenner über *alle* Kriterien — etwa mit
   `SELECT SUM(gewicht) FROM rating_criteria`, was sauber aussieht — drückt
   einen Eintrag unter 1. Das Papier rechnet es in Abschnitt 2 vor und hat es
   mit 500.000 Zufallsdurchläufen nachgemessen; der kleinste dabei
   aufgetretene Wert war **0,049**.

   **DIE ANTWORT DARAUF IST BAULICH, NICHT SORGFÄLTIG:** das Gewicht reist an
   der Schnittzeile mit, statt separat nachgeschlagen zu werden. Wer eine
   Zeile hat, hat ihr Gewicht; wer keine hat, hat auch keins im Nenner. Zähler
   und Nenner entstehen in **derselben** Schleife aus **derselben** Menge.
   Bau es so, dass die Falle nicht auftreten kann — nicht so, dass sie
   vermieden wird.

   ZUM JOIN, WEIL DER KOMMENTAR ÜBER `qSchnittJeKriterium` DAVOR WARNT: die
   dortige Warnung gilt einem zweiten JOIN auf `ratings`. `rating_criteria`
   ist über `criterion_id` eindeutig; die Zeilenzahl bleibt. Lies den
   Kommentar, bevor du ihn für einen Widerspruch hältst — und schreib ihn so
   um, dass der Nächste es nicht noch einmal tun muss.

   WAS VON SELBST FOLGT und **nicht** angefasst wird: `detail()`,
   `/api/items`, die Sortierung `rating_desc`/`rating_asc` und der Vergleich
   in Stellung „alle" rufen alle dieselbe Funktion. **`avg` und `count` je
   Kriterium bleiben ungewichtet** — sie sind eine Aussage über das Kriterium,
   nicht über den Eintrag; sie zu gewichten hieße, sie mit sich selbst zu
   gewichten. **Gerundet wird weiterhin genau einmal**, am Ende.

3. WO DAS GEWICHT EINGESTELLT WIRD. Die Gültigkeit und das Eingabefeld stehen
   zusammen, weil sie derselbe Vorgang sind — was der Server annimmt und was
   das Feld anbietet, ist ab dieser Runde **eine** Spanne, nicht zwei.

   `GEWICHT_MIN = 0.2`, `GEWICHT_MAX = 2.0` und `gueltigesGewicht()` stehen an
   **genau einer** Stelle; zwei Schreibwege führen darauf (Verwaltung und
   Import). **Abgewiesen wird, was etwas anderes bedeutet — gerundet wird, was
   dasselbe bedeutet:** außerhalb der Spanne kommt eine Absage mit Meldung,
   feiner als ein Hundertstel wird gerundet, und die Rundung ist **nicht
   still** — das Feld zeigt danach den gespeicherten Wert.

   Das ist bewusst **nicht** dieselbe Haltung wie beim Bewertungswert, der mit
   `Math.max(0, Math.min(5, …))` zurechtgebogen wird. Dort kommt der Wert aus
   einem Sterne-Widget, das gar nichts anderes senden kann. Ein Gewicht wird
   von Hand getippt.

   **KOMMA HEREIN, KOMMA HINAUS.** Gelesen wird `1,2` und `1.2`, geschrieben
   wird immer mit Komma. Die Meldung des Servers braucht es ebenfalls —
   „zwischen 0.2 und 2" ist ein Punkt mitten in einem deutschen Satz.

   DAS FELD IST `type="text"` MIT `inputmode="decimal"`, nicht
   `type="number"`. Die drei Gründe stehen im Papier, Abschnitt 7.1, und sie
   gehören als Kommentar in den Quelltext — sonst räumt es jemand auf.

   **DREI FALLSTRICKE, alle im Papier ausgeschrieben**, und der dritte ist der
   heimtückische: ein leeres Feld ist keine Null. `Number('')` ergibt 0, und
   ohne die Klemme davor liefe ein gelöschtes Feld in eine Absage „muss
   zwischen 0,2 und 2 sein", die niemand verlangt hat.

   **ETWAS, DAS DAS PAPIER NOCH NICHT WEISS:** die Kriterienkarte wird von
   `manage()` in `public/app.js` gezeichnet, und **dieselbe Funktion zeichnet
   auch die Karten „Kategorien" und „Tags"**. Das Gewichtsfeld darf dort nicht
   erscheinen. Sag im Vorschlag, wie du das trennst — über den `KIND`-Eintrag
   oder anders.

   **SAG MIR VORHER, WOHIN DAS FELD SOLL — DIE ZEILE IST SCHON BESETZT.** Sie
   trägt heute Griff, Name, Verwendungszähler („12 Einträge"), ✎ und ✕. Das
   Papier zeichnet das Feld zwischen Name und Zähler. **Das ist ungeprüft**,
   und die letzten beiden Runden haben zweimal gezeigt, was passiert, wenn man
   das nicht vorher ansieht: der Verfassername stand am falschen Ende der
   Zeile, und der Prüfstand hat es nicht gemerkt (*was der Prüfstand nicht
   kann, ist Aussehen* — Projektstand Abschnitt 7). Sieh dir die Zeile an,
   bevor du baust.

   **UND EINE FRAGE, DIE DAS PAPIER OFFEN LÄSST** (Abschnitt 14, Punkt 5):
   vorgeschlagen werden **1 · 1,2 · 1,5**, alle bei 1 oder darüber. Der
   Gedanke: in der Praxis macht man das Wichtige schwerer, statt alles andere
   leichter. Wer nach unten will, tippt 0,8. **Willst du einen Vorschlag unter
   1 dabeihaben?** Es ist eine Zeile in `app.js`.

4. WO DAS GEWICHT SICHTBAR WIRD — UND DIE ZWEITE RECHENSTELLE. Beides gehört
   zusammen, weil es dieselbe Frage ist: **bleibt die Zahl nachvollziehbar?**

   `×1,5` hinter dem Kriteriennamen, **nur wenn das Gewicht von 1 abweicht** —
   an drei Orten: im Bewertungsblock am Eintrag, an der Zeilenbeschriftung im
   Vergleich, und als Wort „gewichtet" am Blockkopf. Alles **abgeleitet**,
   kein Schalter, keine Einstellung — dieselbe Bauform wie die
   Durchschnittsspalte, die bei einem Zugang entfällt.

   **DAS IST KEIN BEIWERK.** Der Projektstand nennt heute schon einen
   Rundungspreis: wer die angezeigten Zehntel von Hand mittelt, kann um 0,05
   danebenliegen. Mit Gewichten wird der Zusammenhang zwischen Zeilenwerten
   und Kopfzahl **grundsätzlich** nicht mehr durch Mitteln nachvollziehbar.
   Ohne die Anzeige sähe die Kopfzahl schlicht falsch aus.

   DIE ZWEITE RECHENSTELLE STEHT IM FRONTEND, UND SIE IST ABSICHT.
   `eigenerSchnitt()` in `public/app.js` rechnet die Zahl für die Stellung
   **„meine"** selbst aus, mit ausgeschriebener Begründung. **Bleibt sie
   ungewichtet, zeigt der Umschalter zwei Zahlen nach zwei verschiedenen
   Formeln** — und niemand könnte sagen, ob ein Unterschied von der anderen
   Bewertermenge kommt oder von der fehlenden Gewichtung. Genau die zweite
   Wahrheit, die der Kommentar dort zu vermeiden versucht.

   Dieselbe Falle wie in Punkt 2, an einer zweiten Stelle: der Nenner zählt
   nur die Kriterien, die **ich** bewertet habe.

   **ES SIND UND BLEIBEN GENAU ZWEI RECHENSTELLEN.** Wer eine dritte anlegt —
   etwa in der Kachel der Übersicht —, bricht die Regel. Die Kachel liest
   `avgRating` vom Server, und dabei bleibt es.

   **SAG MIR, WAS DU FÜR RICHTIG HÄLTST — eine Frage, die das Papier nicht
   stellt.** Das Wort „gewichtet" am Blockkopf leitet sich aus
   `it.ratings.some(r => r.gewicht !== 1)` ab, also aus **allen** Kriterien
   des Eintrags. Ein Kriterium mit Gewicht 1,5, das an diesem Eintrag
   **niemand bewertet hat**, geht gar nicht in die Rechnung ein — das Wort
   stünde dann an einer Zahl, die durch keine Gewichtung entstanden ist. Ich
   neige dazu, die Ableitung auf die **bewerteten** Kriterien zu beziehen
   (`r.value > 0 || r.avg != null`), weil das Wort sonst etwas behauptet, was
   an dieser Zahl nicht stattgefunden hat. Aber es macht die Ableitung
   komplizierter, und es ist eine Sache für den Bildschirm — **entscheide du.**

Haltepunkt: **nach Punkt 4.** Dann ist die Gewichtung am Bildschirm
vollständig und in sich stimmig. **Was dort noch fehlt, ist eine echte Lücke
und kein Schönheitsfehler:** ein Export verlöre die Gewichte, und ein Rundlauf
setzte alles auf 1 zurück. Ein Stand am Haltepunkt ist committbar, aber
**nicht einspielbar**. Sag es dazu, wenn du dort anhältst.

5. EXPORT UND IMPORT, FORMATNUMMER 8 → 9. Ohne diesen Punkt verlöre die Datei
   genau die Angabe, die diese Runde einführt.

   **`criteria` bleibt unverändert eine Liste von Namen.** Die Gewichte kommen
   als **zusätzliches Feld** `criteriaGewichte` daneben — und **nur
   Abweichungen werden geschrieben**: ein Kriterium mit Gewicht 1 taucht darin
   nicht auf. Ein ungewichteter Bestand ergibt damit eine Datei, die
   zeichengleich zu heute ist.

   **DIE FORMATNUMMER GEHT 8 → 9**, nicht 7 → 8. Das Papier ist an dieser
   Stelle älter als die Wirklichkeit: G4 hat die 7 belegt, 0.8.31 die 8. Der
   Kopfvermerk im Papier sagt es, der Fließtext an einer Stelle noch nicht —
   **wenn du weitere solche Stellen findest, sag sie.**

   BEIM EINSPIELEN gilt: ein **bekanntes** Kriterium behält sein vorhandenes
   Gewicht — der Import legt Bestand an, er ändert keine Einstellung des
   Ziels, dieselbe Regel wie beim ersetzenden Import, der `users` nicht
   anrührt. Ein **neu angelegtes** bekommt das Gewicht aus der Datei. Und ein
   ungültiges Gewicht **bricht nicht ab**, sondern fällt auf 1,0 zurück und
   wird im Protokoll genannt — dieselbe Haltung wie bei unbekannten
   Verfassernamen.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies `Konzept_Gewichtung_Bewertungskriterien.md` **vollständig**. Es ist
   die Quelle; dieser Auftrag ist nur der Schnitt. Dann im Projektstand
   Abschnitt 5 (die Entscheidungen, darunter „gerundet wird genau einmal" und
   die zweistufige Rechnung aus 0.7.0), Abschnitt 6 die Stolpersteine,
   Abschnitt 7 den Prüfstand samt den beiden Umstiegsabschnitten, Abschnitt 10
   den Stufenplan und „Vorgemerkt für 1.0", Abschnitt 11 die Bindungen.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst:
   `db.js` (`rating_criteria`, `umstieg0830()`/`umstieg0831()` als Vorbild),
   `server.js` (`qCriteria`, `qSchnittJeKriterium`, `gesamtSchnitt()`,
   `detail()`, `PUT /api/criteria/:id`, `POST /api/criteria`, Export und
   Import), `public/app.js` (`manage()` mit seinem `KIND`-Verzeichnis,
   `eigenerSchnitt()`, der Bewertungsblock, die Vergleichsansicht),
   `pruefung.js` (`F_ROUTEN`, die Kriterienprüfungen, die Abschnitte
   „UMSTIEG 0.8.30" und „UMSTIEG 0.8.31" als Vorbild).
3. Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen. Die Fragen aus den Punkten 3 und 4 gehören hierher, nicht in
   den Bau. Unstimmigkeiten zwischen Papier und Quelltext sagst du jetzt — das
   Gewichtungspapier ist auf dem Stand 0.8.6 geschrieben, seine Zeilennummern
   stimmen nicht mehr, und mindestens die Formatnummer ist darin
   weitergerückt.
4. Erst nach meinem OK bauen — gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
5. Neue Prüfungen in `pruefung.js`. **Abschnitt 12 des Gewichtungspapiers
   listet 34 Stück mit Begründung — nimm sie als Ausgangsliste, nicht als
   Obergrenze.** Jede mit Gegenprobe: Regel probeweise zurückbauen, zeigen,
   dass genau diese Prüfung namentlich rot wird. Vor dem Deuten roter Punkte
   per `diff` belegen, dass der Quelltext der ist, den du zu prüfen glaubst.
   **Die Gegenproben laufen in einer Kopie des Arbeitsbaums** (Stolperstein
   100).
6. **Der Umstieg bekommt einen eigenen Prüfabschnitt**, gebaut wie „UMSTIEG
   0.8.31 — ENTFAELLT MIT 1.0": eine Datenbank aus 0.8.31 nachstellen —
   dieselbe Anlage, nur ohne die neue Spalte und mit Kriterien darin — und
   belegen, dass der Umstieg sie ergänzt, dass die Bestandszeilen auf **1,0**
   stehen, dass ein zweiter Lauf stumm bleibt und dass eine **frische** Anlage
   die Spalte ohne Umstieg trägt.
   **Dazu die Probe, die seit 0.8.31 dazugehört:** ein Lauf, der **alle**
   Umstiegsblöcke hintereinander fährt — die Lage, die im Betrieb wirklich
   vorkommt. Sie steht heute im Abschnitt von 0.8.31 und ist zu erweitern,
   nicht zu verdoppeln.
7. **Prüfung 4 des Papiers ist die wichtigste der ganzen Runde:** alle
   Gewichte 1 → `avgRating` bitgleich zum ungewichteten Ergebnis. Sie belegt,
   dass ein Einspielen keine einzige angezeigte Zahl verändert. Sie gehört an
   eine Prüflage mit **mehreren Bewertern und ungleich vielen Stimmen je
   Kriterium** — sonst belegt sie zu wenig.
   **Prüfung 6 und 12 sind die beiden, die man ohne das Papier vergäße.**
8. Für die Rechteprüfung gilt unverändert: zwei vorbereitete Sitzungen, zu
   jeder Verweigerung der Erfolgsfall daneben und die Nachschau, dass nichts
   geschrieben wurde. Hier ausdrücklich: ein gewöhnlicher Benutzer setzt ein
   Gewicht (muss 403 sein), der Admin setzt es (muss gehen), und nach dem 403
   steht der **alte** Wert unverändert in der Datenbank.
9. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen
  Vorgehens. Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.8.40` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`) — sonst wird der Prüfstand
  namentlich rot.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
  Einzige Ausnahme sind die Marken aus der Bauregel.
* **Kein neuer Eintrag im Vokabular.** „Gewicht" ist ein Wort über die
  Rechnung, nicht über den Gegenstand. Die elf Wörter bleiben elf.
* Nicht anfassen ohne Rückfrage: Farbschema, Anmeldebremse je Benutzername,
  Verschlüsselungsmodell, Dateiname `katalog.sqlite`, die Einstellung
  `HINTER_PROXY` und alles, was daran hängt.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81). **In 0.8.31 hat genau das zugeschlagen:** die Gruppe
  „Keine Zeile ohne Benutzer" stand auf null Zeilen und blieb grün.
* **Zu jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine
  Prüfung an der echten Antwort** (Stolperstein 102). Der Doppelgänger bringt
  die Felder selbst mit; er kann eine fehlende Serverantwort nicht bemerken.
  Das betrifft hier `gewicht` an den Kriterienzeilen von `detail()`.
* Neue Bedienelemente werden per `dispatchEvent` gedrückt, samt Durchlauf der
  Ereignisschleife. `.click()` genügt nicht. Für ein Eingabefeld heißt das ein
  echtes `change`-Ereignis, nicht ein Aufruf von `onchange`.
* Wird es zu viel für einen Durchgang: am benannten Haltepunkt anhalten und
  sauber abliefern. Sag vorher Bescheid, wenn du das kommen siehst.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:
Zu 1.0 kommt eine finale Bereinigung. Alles, was bis dahin an der Datenbank
arbeitet, muss sich in einem Zug entfernen lassen.

* Zuerst die Frage, ob es den Code überhaupt braucht.
* Das Schema bleibt vollständige DDL in `db.js`. Ein Index über `CREATE INDEX
  IF NOT EXISTS` ist KEIN Fall dafür.
* Einmaliger Umstiegscode steht gebündelt in einer benannten Funktion je
  Version, mit den Marken `// UMSTIEG 0.8.x — ENTFAELLT MIT 1.0` …
  `// ENDE UMSTIEG 0.8.x`, samt eigenem Prüfabschnitt.
* Jeder markierte Block bekommt sofort einen Eintrag unter „Vorgemerkt für
  1.0" im Projektstand.

**`umstieg0840()` ist der vierte markierte Block im Projekt** — nach
`umstieg083()` (0.8.3), `umstieg0830()` (0.8.30) und `umstieg0831()` (0.8.31).

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitszweig geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; der Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.40.md` liegt im Zweig, als Rohstoff für die
  spätere Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit
  Begründung, neue Stolpersteine mit Nummer und Kernsatz (**die Zählung setzt
  bei 106 fort**), die Gegenprobentabelle, Prüfungszahlen vorher/nachher
  (vorher: **1682**), Offengebliebenes.
* Die Zeile „0.8.40 — Abdruck `…`" gehört ins Änderungsprotokoll, ZULETZT
  gebildet, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, denn `server.js` lädt sie.
  Diese Runde fasst voraussichtlich `db.js`, `server.js`, `public/app.js` und
  `public/style.css` an; `auth.js` bleibt unberührt.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  ausdrücklich** — es ist eine Datenbankstufe. Der Weg gehört in den Chat, mit
  den Befehlen und dem erwarteten Ergebnis.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. Für diese Runde ausdrücklich dabei: die Abfrage
  `PRAGMA table_info(rating_criteria)` im Container, eine Zählung
  `SELECT COUNT(*) FROM rating_criteria WHERE gewicht != 1.0` (erwartet
  unmittelbar nach dem Einspielen: 0), und — der eigentliche Beleg dieser
  Runde — **eine Gegenüberstellung der Gesamtschnitte vor und nach dem
  Einspielen bei unveränderten Gewichten. Sie müssen gleich sein.** Nimm die
  Zahlen vorher ab, nicht hinterher.

Projektstand, Konzeptpapier, Gewichtungspapier, Ideenpapier und README NICHT
anfassen und keinen Auftragsblock für die nächste Runde bauen. Das kommt erst,
wenn ich gemeldet habe, dass 0.8.40 eingespielt ist und sauber läuft.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **Die Vorschau der Rangfolge im Systembereich** — sehen, wie sich die Spitze
  verschiebt, wenn man an einem Gewicht dreht. Das ist es, was Gewichte im
  Alltag richtig bedienbar macht, aber es ist eine eigene Ansicht mit eigenem
  Endpunkt. Steht als Punkt 4 in Abschnitt 14 des Gewichtungspapiers.
* **0.8.50 — Kurzvideos am Fotoplatz**, siehe
  `Konzept_Video_und_grosse_Dateien.md`, Teil I. Sie hebt die Formatnummer
  erneut, dann **9 → 10**.
* **4.2 „Abgelehnt mit Datum und Begründung"** aus dem Ideenpapier ist
  weiterhin offen und weiterhin nicht zusammengelegt.
* **Eine Trusted-Proxy-Adressliste** aus 0.8.20 ist weiterhin nicht gebaut und
  bleibt vorgemerkt.
