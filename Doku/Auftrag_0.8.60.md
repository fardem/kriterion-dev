Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, das Ideenpapier, das Videopapier, das
Gewichtungspapier und die Änderungsprotokolle 0.8.6, 0.8.10, 0.8.20, 0.8.30,
0.8.31, 0.8.40 und 0.8.50 stehen dort unter `Doku/`. Gearbeitet wird im Repo,
nicht an einer Kopie.

AUFTRAG: **Version 0.8.60 — „Was ist offen, was ist neu."**
DIES IST KEINE STUFE DES MEHRBENUTZERBETRIEBS — der ist mit G4 bis auf H und I
gebaut. Es ist die nächste Runde des Stufenplans, **und sie ist ausdrücklich
KEINE Datenbankstufe**: kein `ALTER TABLE`, kein sechster Migrationsblock, kein
neuer Eintrag unter „Vorgemerkt für 1.0", keine neue Formatnummer. Die
Exportdatei bleibt bei **10**. Wenn sich beim Vorschlag herausstellt, dass es
doch eine Schemaänderung braucht, ist das ein Grund anzuhalten und zu fragen —
nicht ein Grund, sie einzubauen.

Ausgearbeitet liegt die Sache im Ideenpapier, **Abschnitte 4.3 und 4.4.**
**Lies beide ganz, bevor du etwas vorschlägst.** Dieser Auftrag wiederholt sie
nicht, er schneidet sie in Punkte, setzt die Zahlen dieser Version ein und
benennt die Fragen, die vor dem Bauen zu beantworten sind.

**Vier Punkte, und der vierte hat mit den ersten dreien nichts zu tun** — er
ist eine Sprachbereinigung, und er steht in dieser Runde, weil sie klein ist
und Platz dafür hat.

WARUM DIESE RUNDE JETZT KOMMT: 0.8.50 (Kurzvideos am Fotoplatz) ist gebaut,
Abdruck `3cb528d6`, 1953 Prüfungen, `F_ROUTEN` bei 47, Formatnummer 10, fünf
markierte Migrationsblöcke. Die Bindung des Stufenplans lautet **0.8.50 vor
0.8.70** — 0.8.60 liegt dazwischen und bindet an nichts. Sie ist die letzte
kleine Runde vor dem Papierkorb, und sie ist mit Absicht klein.

WAS SICH ÄNDERT, IN EINEM SATZ: Zwei Dinge, die es längst gibt, werden
**auffindbar** — offene Aufgaben quer über alle Einträge, und was sich seit
dem letzten Besuch getan hat.

**DAS IST DIE GÜNSTIGSTE ART VON VERBESSERUNG, DIE ES GIBT: vorhandene
Funktionalität erreichbar machen.** Aufgabenkommentare gibt es seit 0.5.9, samt
Farbkante und Weiterschaltknopf. Sichtbar sind sie nur, wenn man ihren Eintrag
öffnet — bei zwanzig Einträgen heißt das zwanzigmal klicken. Ein gebautes
Feature, im Alltag halb tot.

**KEINE ZWEITE WAHRHEIT, UND DAS IST DIE TRAGENDE REGEL DIESER RUNDE.** Die
Übersicht sortiert nach `updated_at`, für alle gleich — sie zeigt, wo etwas
geschieht, nicht wo *ich* zuletzt war. Beide Neuerungen **filtern**, sie
sortieren nichts um, und beide sind **persönlich** wie der Favorit. Wer
daraus eine persönliche Reihenfolge macht, hat den Punkt verfehlt.

---

1. DIE ANSICHT „OFFEN". Der größere der beiden Punkte, und der einzige mit
   einer neuen Ansicht.

   Erreichbar aus der Kopfzeile, neben dem Zahnrad. Sie zeigt **alle nicht
   erledigten Aufgabenkommentare**, gruppiert nach Eintrag, mit Verfasser und
   Datum. Ein Klick springt in den Eintrag. Der Erledigt-Haken lässt sich
   direkt dort setzen.

   **LESEND, ALSO KEIN EINTRAG IN `F_ROUTEN`.** Die Liste ist die Stelle für
   **schreibende** Routen; ein lesender Endpunkt steht nicht darin — fünfmal
   angewandt (`GET /api/users/:id/bestand`, `GET /api/items/:id/bestand`,
   `GET /api/stats`, `GET /api/items/:id/stimmen`, und jetzt hier).
   **`F_ROUTEN` bleibt damit voraussichtlich bei 47**, und das gehört
   ausdrücklich geprüft: der Erledigt-Haken geht über `PUT /api/comments/:id`,
   die es längst gibt. Wenn du eine neue schreibende Route brauchst, sag es
   vorher und begründe sie.

   **EINE ABFRAGE, KEIN ZWEITER RECHENWEG.** `SELECT … FROM comments
   WHERE kind = 'todo' … JOIN items` — und die Bedingung „nicht erledigt"
   steht danach an **zwei** Stellen im Projekt. Sieh nach, wie die
   Detailansicht sie heute schreibt, und benutze denselben Ausdruck. Zwei
   Schreibweisen für dieselbe Frage laufen auseinander.

   **DER UMSCHALTER „MEINE / ALLE"** — dasselbe Muster wie im Vergleich und aus
   demselben Grund: bei einem einzigen Zugang erscheint er nicht. Abgeleitet
   aus der Zahl der Zugänge über `mehrereBenutzer()`, **kein Schalter**.

   **DREI FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Wer darf den Haken an einem FREMDEN Aufgabenkommentar setzen?** Das ist
     die einzige echte Rechtefrage der Runde. Heute entscheidet
     `PUT /api/comments/:id`; sieh nach, was dort steht, und sag, ob das die
     gewollte Antwort ist. **„Löschen ja, umschreiben nein"** ist die Regel des
     Projekts — ein Erledigt-Haken ist kein Umschreiben einer fremden Aussage,
     aber er ist auch nicht nichts. *Ich neige dazu, es zu lassen, wie es ist,
     und die Antwort nur zu benennen.*
   * **Was passiert mit der Zeile, wenn der Haken gesetzt ist?** Verschwindet
     sie sofort, bleibt sie durchgestrichen stehen, oder erst beim nächsten
     Aufbau? *Ich neige zu: sie bleibt stehen, durchgestrichen, bis die Ansicht
     neu geladen wird* — eine Zeile, die unter dem Zeiger verschwindet, nimmt
     die Möglichkeit, den Haken gleich wieder wegzunehmen.
   * **Was steht da, wenn nichts offen ist?** Ein leerer Bildschirm ist eine
     schlechte Antwort.

   **DER ZÄHLER IN DER KOPFZEILE („Offen 7") GEHÖRT NICHT IN DIESE RUNDE.** Das
   Ideenpapier sagt es selbst, und der Grund trägt: er wird bei **jedem**
   Seitenaufbau gebraucht, und die Frage, wie er nicht ständig neu abgefragt
   wird, ist eine eigene. Er kommt unter „Vorgemerkt", nicht in den Bau.

2. DER FILTER „NEU SEIT …". Der kleinere Punkt, und der mit dem Stolperstein.

   Ein Umschalter **„Neu seit …"** in der Filterzeile — genau dort, wo heute
   **★ Favoriten** steht, und nach demselben Muster: er filtert, er ist
   persönlich, er ist mit allen anderen Filtern kombinierbar. Daneben die
   Zahl: *„7 neu seit 19.08."*

   **KEINE SCHEMAÄNDERUNG UND KEIN MIGRATIONSBLOCK.** Der Bezugszeitpunkt ist
   ein persönlicher Schlüssel `zuletztGesehen` in `user_settings` — genau das,
   wofür die Tabelle in Stufe D gebaut wurde. Serverseitig ist es ein
   Vergleich zweier Zeitstempel.

   **DER SCHLÜSSEL GEHÖRT IN `PERSOENLICHE_SCHLUESSEL`, und das ist keine
   Formsache.** Steht er nicht dort, landet er über `putSetting` in der
   **globalen** Tabelle und gilt still für alle — und solange nur einer
   angemeldet ist, fällt das niemandem auf. Die Schranke in `server.js` wirft
   dann laut statt still; genau dafür steht sie da. Eine Prüfung darauf gehört
   dazu.

   **DER MERKZEITPUNKT WIRD BEIM VERLASSEN DER ÜBERSICHT GESETZT, NICHT BEIM
   BETRETEN.** Zeitstempel haben Sekundenauflösung (Stolperstein 15). Wer die
   Übersicht öffnet und in derselben Sekunde kommentiert jemand anderes, sähe
   den Kommentar sonst nie als neu. **Stell das Fenster nach** — schreib eine
   Prüfung, die genau diese Sekunde trifft, und zeig, dass der Kommentar
   ankommt.

   **DREI FRAGEN, DIE VOR DEN BAU GEHÖREN:**

   * **Woran hängt „neu"?** Am `updated_at` des Eintrags — derselben Spalte,
     nach der die Übersicht ohnehin sortiert — oder an den Kommentaren
     einzeln? *Ich neige zu `updated_at`:* es ist eine Quelle statt zweier, und
     der Eintrag rückt ohnehin nach oben, wenn sich an ihm etwas tut. Sag, was
     dabei verlorengeht.
   * **Was tut der Filter beim allerersten Besuch**, wenn nichts gespeichert
     ist? *Ich neige dazu, ihn dann gar nicht erst anzubieten* — ein Filter,
     der beim ersten Klick alles zeigt, erklärt sich nicht.
   * **Erscheint er auch bei einem einzigen Zugang?** Das Ideenpapier begründet
     ihn aus dem Mehrbenutzerbetrieb, der Favoritenfilter daneben erscheint
     aber immer. *Ich neige dazu, ihn immer anzubieten:* auch allein vergisst
     man, was man zuletzt gesehen hat. Entscheide du.

3. WAS BEIDE GEMEINSAM HABEN — UND WAS SIE AUSDRÜCKLICH NICHT TUN.

   * **Sie filtern, sie sortieren nicht.** Die Reihenfolge der Übersicht bleibt
     `updated_at` für alle. Eine Prüfung darauf gehört dazu: derselbe Bestand,
     einmal mit und einmal ohne Filter, **dieselbe Reihenfolge** der
     verbliebenen Einträge.
   * **Sie sind persönlich und liegen beim Benutzer**, nicht in `settings`.
   * **Sie ändern nichts an der Datenbank.** Kein `ALTER TABLE`, kein sechster
     markierter Block, kein Eintrag unter „Vorgemerkt für 1.0". Der
     Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
     deshalb **als Empfehlung, nicht als Pflicht** — und sagt ausdrücklich
     dazu, dass ein Downgrade hier wieder eine reine Dateikopie ist. Das ist
     seit 0.8.30 zum ersten Mal wieder so, und es gehört benannt.
   * **Sie fassen das Austauschformat nicht an.** Formatnummer bleibt 10.
   * **Kein neuer Eintrag im Vokabular.** „Aufgabe" und „Erledigt" sind bereits
     zwei der elf einstellbaren Begriffe — **benutze sie**, statt die Wörter
     fest hinzuschreiben. Das ist die Stelle, an der diese Runde das Vokabular
     ernst nehmen muss: eine Ansicht, die „Offene Aufgaben" überschreibt, während
     der Betreiber sie „Mängel" nennt, ist falsch beschriftet. Die elf bleiben
     elf.

4. DIE SPRACHE IN DEN DOKUMENTEN UND IM QUELLTEXT. Kein Feature, eine
   Bereinigung — und sie steht hier, weil die Runde klein ist.

   **DIE REGEL, UND SIE GILT AB SOFORT AUCH FÜR ALLES WEITERE:**

   > Deutsch bleibt die Sprache. **Fachbegriffe werden aber nicht zwanghaft
   > eingedeutscht.** Wo die deutschsprachige IT ein englisches Wort benutzt,
   > steht dieses Wort — und wo es ein gebräuchliches deutsches gibt, steht
   > das deutsche. Der Maßstab ist weder „möglichst deutsch" noch „möglichst
   > englisch", sondern **das Wort, das ein deutschsprachiger Entwickler im
   > Gespräch benutzen würde.**

   Zwei Beispiele, beide aus dem eigenen Bestand:

   * **Cookie**, nicht „Keks". Das sagt in Deutschland niemand.
   * **Migration**, **migrieren**, **Migrationsblock** — nicht „wandern",
     nicht „Datenüberführung", nicht „Umstieg".

   **DIE REGEL ZIELT AUF ÜBERSETZTE LEHNWÖRTER, NICHT AUF DIE EIGENEN BILDER
   DES PROJEKTS.** „Stolperstein", „Gegenprobe", „Prüfstand", „Wächter" und
   „Klemme" sind keine Übersetzungen von irgendetwas Englischem — sie sind
   eigene Begriffe mit eigener Bedeutung und **bleiben**. Wer sie anfasst,
   nimmt dem Projekt sein Vokabular, nicht sein Denglisch.

   **WAS KONKRET ANSTEHT.** Gezählt am heutigen Stand:

   | heute | soll | in `Doku/` + README | im Quelltext |
   |---|---|---|---|
   | Keks / keks | **Cookie** | 28 | 334 |
   | Umstieg / umstieg | **Migration** | 210 | 71 |
   | Abbild | **Image** | 33 | 10 |
   | Sperrdatei | **Lockfile** | 13 | 6 |
   | Doppelgänger | **Mock** | 36 | — |
   | mehrteilig | **Multipart** | 7 | 4 |
   | Kopfzeile *(HTTP)* | **Header** | 87 | 64 |
   | Bereich *(HTTP)* | **Range** | wenige | wenige |
   | Zweig | **Branch** | 15 | 7 |
   | Rückschritt | **Downgrade** | 7 | — |
   | Ereignisschleife | **Event Loop** | 4 | 8 |
   | Zeichenkette | **String** | 32 | 16 |

   **„Kopfzeile" nur dort, wo ein HTTP-Header gemeint ist** — die Kopfzeile
   der Anwendung (die Leiste mit dem Zahnrad) heißt weiter so. Dasselbe bei
   „Bereich": der Range-Request wird umbenannt, der Blockbereich der
   Detailansicht nicht. **Ein stures Suchen und Ersetzen richtet hier Schaden
   an.**

   **DREI ENTSCHEIDUNGEN, DIE ICH DIR ÜBERLASSE — sag sie im Vorschlag:**

   * **`Umstieg` → `Migration` ist die teuerste.** Sie trifft nicht nur Prosa:
     die Marken `// UMSTIEG 0.8.x — ENTFAELLT MIT 1.0`, die Funktionsnamen
     `umstieg083()` bis `umstieg0850()`, ihre Zeilen in `module.exports`, fünf
     Prüfabschnitte samt Gruppennamen und fünf Einträge unter „Vorgemerkt für
     1.0". *Ich neige dazu, sie zu machen* — die Marken sind ohnehin dafür da,
     zu 1.0 in einem Zug entfernt zu werden, und ein falsches Wort in einer
     Marke schleppt sich bis dahin durch. **Aber es ist ein Umbau über sechs
     Dateien, und er gehört nicht nebenbei gemacht.** Wenn du ihn willst, ist
     er ein eigener Punkt mit eigenem Prüflauf; wenn nicht, bleibt „Umstieg"
     stehen und die Regel gilt ab hier für Neues.
   * **Bezeichner im Quelltext oder nur Prosa?** `keks`, `keksWert`,
     `keksLoeschen()` sind Variablennamen, keine Sätze. *Ich neige dazu, sie
     mitzunehmen* — sie stehen 334-mal da und werden bei jeder Runde gelesen.
     Kommentare, Protokollzeilen und Dokumente auf jeden Fall.
   * **„Abdruck" steht in der Oberfläche**, in der Kennzahlenkarte. Ein
     deutschsprachiger Entwickler sagt **Fingerprint** oder **Prüfsumme**.
     *Ich neige zu „Fingerprint"* — aber das ist die einzige Umbenennung
     dieser Runde, die ein Benutzer sieht, und deshalb deine Entscheidung.

   **DIESER AUFTRAG HÄLT SICH SCHON DARAN.** Er schreibt Branch statt Zweig,
   Downgrade statt Rückschritt, Event Loop statt Ereignisschleife und
   Migration statt Umstieg. Wo er trotzdem „Abdruck" sagt, steht daneben, dass
   es zur Entscheidung ansteht. Wenn dir eine Stelle auffällt, an der er selbst
   gegen die Regel verstößt, sag sie — sie ist dann ein Fehler im Auftrag.

   **UND EIN WÄCHTER IM PRÜFSTAND, damit die Regel nicht bei der guten Absicht
   bleibt.** Dagegen hilft kein Merksatz: eine Wortliste, gesucht in `Doku/`
   und in den Kommentaren des Quelltextes, wird namentlich rot. Mit
   Gegenprobe — und mit dem Beleg, dass der Wächter überhaupt noch etwas liest
   (Stolperstein 106). **Die Liste ist kurz zu halten:** ein Wächter, der jedes
   zweite Wort anmeckert, wird abgeschaltet.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies das Ideenpapier, **Abschnitte 4.3 und 4.4**, vollständig. Dann im
   Projektstand Abschnitt 4 (Funktionsumfang, besonders die Kommentararten und
   das Vokabular), Abschnitt 5 (die Entscheidungen, darunter „Die Liste zeigt,
   wo etwas geschieht" und die Regel zu persönlichen Einstellungen),
   Abschnitt 6 die Stolpersteine — **15 ist der wichtigste dieser Runde** —,
   Abschnitt 7 den Prüfstand, Abschnitt 10 den Stufenplan und Abschnitt 11 die
   Bindungen.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst:
   `server.js` (`PERSOENLICHE_SCHLUESSEL`, `getUserSetting`/`putUserSetting`,
   `qComments` und die Bedingung für „erledigt", `PUT /api/comments/:id`,
   `GET /api/items`, `mehrereBenutzer()`), `public/app.js` (die Filterzeile mit
   ★ Favoriten, `renderList`, `state.filters`, die Kopfzeile, der
   Weiterschaltknopf am Kommentar), `pruefung.js` (`F_ROUTEN`, die Gruppen zu
   Filtern und Favoriten, `baueDom` samt Doppelgänger).
3. Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen. **Die Fragen aus den Punkten 1, 2 und 4 gehören hierher,
   nicht in den Bau** — die Rechtefrage am fremden Haken, das Verhalten der
   Zeile nach dem Haken, der leere Bildschirm, der Bezug von „neu", der erste
   Besuch, der einzelne Zugang, und die drei Sprachentscheidungen.
   Unstimmigkeiten zwischen Ideenpapier und Quelltext sagst du jetzt.
4. Erst nach meinem OK bauen — gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
5. Neue Prüfungen in `pruefung.js`. **Das Ideenpapier hat keine Prüfliste.** Du
   stellst sie selbst auf, und sie ist der erste Teil des Vorschlags, nicht der
   letzte. Jede mit Gegenprobe: Regel probeweise zurückbauen, zeigen, dass
   genau diese Prüfung namentlich rot wird. Vor dem Deuten roter Punkte per
   `diff` belegen, dass der Quelltext der ist, den du zu prüfen glaubst. **Die
   Gegenproben laufen in einer Kopie des Arbeitsbaums** (Stolperstein 100).
   **Was mindestens hineingehört**, und die Liste ist keine Obergrenze:
   * die Ansicht „Offen" zeigt **genau** die nicht erledigten
     Aufgabenkommentare — mit einer Prüflage, die daneben einen **erledigten**,
     eine **Notiz** und einen **Bericht** trägt. Ohne die drei belegte die
     Prüfung nur, dass überhaupt etwas erscheint;
   * gruppiert nach Eintrag, mit Verfasser und Datum an der Zeile — an der
     **echten Antwort** geprüft, nicht nur im Doppelgänger (Stolperstein 102);
   * „meine / alle" erscheint erst ab zwei Zugängen, und die Gegenlage mit
     einem Zugang zeigt ihn **nicht** (erst Vorhandensein, dann Abwesenheit —
     Stolperstein 81);
   * der Erledigt-Haken aus der Ansicht heraus schreibt wirklich: echte
     Antwort, danach Nachschau in der Datenbank;
   * Rechte am fremden Aufgabenkommentar, in beiden Richtungen, mit dem
     Erfolgsfall daneben und der Nachschau, dass nichts geschrieben wurde;
   * `zuletztGesehen` steht in `PERSOENLICHE_SCHLUESSEL` — und eine Gegenprobe,
     die ihn dort herausnimmt, macht die Schranke **laut**;
   * der Merkzeitpunkt wird beim **Verlassen** gesetzt: eine Prüflage, in der
     ein Kommentar in derselben Sekunde entsteht, und er ist danach **neu**;
   * der Filter filtert und **sortiert nicht** — derselbe Bestand mit und ohne
     Filter, dieselbe Reihenfolge der verbliebenen Einträge;
   * kombinierbar mit Status-, Kategorie- und Tagfilter, mindestens ein Paar
     davon zusammen;
   * der erste Besuch ohne gespeicherten Wert;
   * die Überschriften benutzen das **Vokabular**, nicht die festen Wörter —
     mit einer Prüflage, die es umstellt;
   * `F_ROUTEN` bleibt bei 47, und die Zahl wird ausdrücklich geprüft;
   * der Sprachwächter über `Doku/` und die Quelltextkommentare, samt
     Gegenprobe und dem Beleg, dass er noch etwas liest.
6. **Kein Migrationsabschnitt im Prüfstand**, weil es keine Migration gibt.
   Die fünf vorhandenen bleiben unangetastet — auch die Probe „Ein Sprung von
   0.8.20 fährt ALLE Migrationen in einem Start" wird **nicht** erweitert,
   denn es kommt keine dazu. Sag es im Vorschlag ausdrücklich, damit klar ist,
   dass die Frage gestellt und verneint wurde.
7. Für die Rechteprüfung gilt unverändert: zwei vorbereitete Sitzungen, zu
   jeder Verweigerung der Erfolgsfall daneben und die Nachschau, dass nichts
   geschrieben wurde.
8. **Für den Doppelgänger in `baueDom` gilt Stolperstein 90:** er muss
   Aufgabenkommentare in **beiden** Zuständen liefern — offen und erledigt —
   und daneben mindestens eine Notiz. Eine Prüflage mit lauter offenen Aufgaben
   nähme genau die Prüfungen weg, für die sie gebaut wird. **Und die Lehre aus
   0.8.40 und 0.8.50 gilt weiter:** eine Prüfung darauf, dass an einer Zeile
   etwas **nicht** steht, gehört hinter eine Prüfung darauf, dass es die Zeile
   überhaupt gibt (Stolperstein 81). **Jede Lesestelle wird abgefangen** —
   fehlt der Gegenstand, sollen die Prüfungen rot werden, nicht der Lauf
   abreißen (Stolperstein 103; in 0.8.40 und 0.8.50 hat genau das je einmal
   zugeschlagen).
9. Neue Bedienelemente werden per `dispatchEvent` gedrückt, samt Durchlauf des
   Event Loops. `.click()` genügt nicht.
10. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch — **mit der
  Sprachregel aus Punkt 4.** Sie gilt ab sofort für alles, was neu
  geschrieben wird, unabhängig davon, wie weit die Bereinigung des Bestands
  geht.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen
  Vorgehens. Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.8.60` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`) — sonst wird der Prüfstand
  namentlich rot.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
  Einzige Ausnahme sind die Marken aus der Bauregel.
* **Keine neue Abhängigkeit.** Nicht eine.
* Nicht anfassen ohne Rückfrage: Farbschema, Anmeldebremse je Benutzername,
  Verschlüsselungsmodell, Dateiname `katalog.sqlite`, die Einstellung
  `HINTER_PROXY` und alles, was daran hängt, die Content-Security-Policy der
  Anwendung, die Sortierung der Übersicht.
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81).
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106). Wer eine Textprüfung schreibt, filtert die
  Kommentarzeilen weg — und belegt mit einer Gegenprobe, dass sie danach
  überhaupt noch etwas liest. **Der Sprachwächter aus Punkt 4 ist die
  Ausnahme: er sieht ausdrücklich die Kommentare an**, und deshalb gehört zu
  ihm eine eigene Gegenprobe, die zeigt, dass er Code **nicht** anmeckert.
* **Zu jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine
  Prüfung an der echten Antwort** (Stolperstein 102).
* Wird es zu viel für einen Durchgang: **Haltepunkt nach Punkt 2** — dann
  stehen beide Ansichten, und die Sprachbereinigung folgt in einer eigenen
  Runde. Sag vorher Bescheid, wenn du das kommen siehst.

BAUREGEL — datenbankverändernder Code wird rückbaufreundlich gebaut:
**In dieser Runde entsteht keiner.** Die Regel steht trotzdem hier, weil sie
gilt, sobald doch einer entsteht:

* Zuerst die Frage, ob es den Code überhaupt braucht.
* Das Schema bleibt vollständige DDL in `db.js`. Ein Index über `CREATE INDEX
  IF NOT EXISTS` ist KEIN Fall dafür.
* Einmaliger Migrationscode steht gebündelt in einer benannten Funktion je
  Version, mit Marken, samt eigenem Prüfabschnitt.
* Jeder markierte Block bekommt sofort einen Eintrag unter „Vorgemerkt für
  1.0" im Projektstand.

**Es bleibt bei fünf markierten Blöcken.** Kommt in dieser Runde doch ein
sechster dazu, ist das ein Grund anzuhalten und zu fragen — der Auftrag sagt
ausdrücklich, dass keiner vorgesehen ist.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitsbranch geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; der Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.60.md` liegt im Branch, als Rohstoff für die
  spätere Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit
  Begründung, neue Stolpersteine mit Nummer und Kernsatz (**die Zählung setzt
  bei 112 fort**), die Gegenprobentabelle, Prüfungszahlen vorher/nachher
  (vorher: **1953**), Offengebliebenes.
* Die Zeile „0.8.60 — Abdruck `…`" gehört ins Änderungsprotokoll, ZULETZT
  gebildet, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, denn `server.js` lädt sie.
  Diese Runde fasst voraussichtlich `server.js`, `public/app.js` und
  `public/style.css` an; `db.js`, `anhaenge.js` und `auth.js` bleiben
  unberührt. Fasst die Sprachbereinigung sie doch an, ändert das nichts an der
  Reihenfolge — nur an der Liste.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  als Empfehlung, nicht als Pflicht** — es ist keine Datenbankstufe, und ein
  Downgrade ist wieder eine reine Dateikopie. Das ist seit 0.8.30 zum ersten
  Mal wieder so und gehört ausdrücklich gesagt. Der Weg gehört in den Chat,
  mit den Befehlen und dem erwarteten Ergebnis.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. Für diese Runde ausdrücklich dabei: die Abfrage
  `SELECT key FROM user_settings GROUP BY key` im Container (erwartet: der neue
  Schlüssel taucht **erst nach dem ersten Besuch** auf), eine Zählung der
  offenen Aufgaben gegen die Zahl in der Ansicht, und der Abdruckvergleich.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

Diese drei Punkte sind Teil des Auftrags und werden am Ende abgearbeitet, nach
dem grünen Prüflauf:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Also:
  Projektstand (Kopf, Betriebsstand, Funktionsumfang, Abschnitt 5 um die
  Entscheidungen dieser Runde, Stolpersteine, Prüfstand, Versionsgeschichte,
  Stufenplan, Abschnitt 11 — **und Abschnitt 12 um die Sprachregel**), das
  Ideenpapier (4.3 und 4.4 als erledigt kennzeichnen, samt jeder Stelle, an
  der anders gebaut wurde), das Mehrbenutzer-Konzeptpapier und die README. Der
  Projektstand und das Mehrbenutzerpapier tragen die Version im Dateinamen und
  werden entsprechend umbenannt (`git mv`, damit die Historie erhalten bleibt);
  alle Verweise darauf sind nachzuziehen.
* **`Doku/Changelog.md` bekommt einen Abschnitt für diese Stufe** — was sich
  seit der letzten Version geändert hat. **Kurz und prägnant, wie bei den
  meisten Softwareanbietern: nicht zu viel aus dem Quelltext, sondern
  informativ für jemanden, der sich fragt, was das Update für ihn
  mitbringt.** Drei Blöcke wie beim vorhandenen Eintrag: was neu ist, was
  gleich bleibt, was beim Einspielen zu beachten ist.
* **Alles wird fertig gemacht — bis auf den Auftrag für die nächste Stufe.**
  Den weise ich zum Schluss ausdrücklich an, wenn eingespielt und sauber
  getestet ist. Bau ihn nicht ungefragt.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **Der Zähler „Offen 7" in der Kopfzeile.** Er wird bei jedem Seitenaufbau
  gebraucht; die Frage, wie er nicht ständig neu abgefragt wird, gehört in
  eine eigene Runde.
* **0.8.70 — Sicherung und Papierkorb.** Die nächste Stufe, und wieder eine
  Datenbankstufe. Sie serialisiert einen Eintrag — **mit Videos**, seit 0.8.50,
  und das ist der Grund, warum sie danach liegt.
* **Teil II des Videopapiers — große Dateien bis 2 GB**, beschlossen für
  **1.1.0**, also nach 1.0.
* **Die Vorschau der Rangfolge im Systembereich** aus 0.8.40 ist weiterhin
  offen und weiterhin vorgemerkt.
* **4.2 „Abgelehnt mit Datum und Begründung"** aus dem Ideenpapier ist
  weiterhin offen und weiterhin nicht zusammengelegt.
* **Eine Trusted-Proxy-Adressliste** aus 0.8.20 ist weiterhin nicht gebaut und
  bleibt vorgemerkt.
* **Die Tastaturbedienung beim Sortieren** bleibt für 1.0 vorgemerkt und
  betrifft seit 0.8.50 auch Videos.
* **Die Marke `qt  ` am QuickTime-Video** ist aus 0.8.50 unbelegt geblieben —
  es gab kein Gerät dafür. Wer ein iPhone zur Hand hat, lädt ein `.mov` hoch
  und sieht sich die Kopfzeilen an.
