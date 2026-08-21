Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, das Ideenpapier und die Änderungsprotokolle
0.8.6 und 0.8.10 stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an
einer Kopie.

AUFTRAG: „Die Schotten dicht", auf Version 0.8.20.
KEINE STUFE DES UMBAUS — die zweite Runde des neuen Stufenplans (Projektstand,
Abschnitt 10). Kein Schema, kein Umstiegscode, keine neue schreibende Route.
`F_ROUTEN` bleibt bei 46.

WARUM DIESE RUNDE JETZT KOMMT: der Stufenplan bindet ausdrücklich „0.8.10 und
0.8.20 vor 1.0.0" — eine Veröffentlichung heißt fremde Installationen, und
danach stehen die Befunde dieser Runde nicht mehr in einer Anlage, sondern in
allen. Und die Anlage läuft nach Auskunft des Projektstands **hinter einem
echten Reverse Proxy** (Abschnitt 1) — die Lücken dieser Runde sind damit
keine Übung, sie treffen den tatsächlichen Betrieb.

Sieben Befunde aus dem Ideenpapier (Abschnitt 2.1 bis 2.4, 2.6, 2.7), zu fünf
Punkten gebündelt. Die Bündelung folgt der Sache, nicht der Bequemlichkeit —
bei jedem Punkt steht, warum er so geschnitten ist.

1. DIE SVG GEHT MIT IHREM EIGENEN TYP HERAUS. `anhaenge.js` trägt im Kopf
   die Sicherheitsregel des Projekts in acht Punkten — Punkt 1: „Der gemeldete
   Typ des Hochladenden wird gespeichert, aber NIE zum Ausliefern benutzt."
   Punkt 8: „SVG steht bewusst NICHT auf der Vorschauliste." Der Fotoweg
   HÄLT SICH AN KEINEN VON BEIDEN:

       // server.js:1440
       app.get('/api/photos/:id/raw', (req, res) => {
         const p = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
         let blob = p.data, mime = p.mime_type;   // der gemeldete Typ
         ...
         res.set('Content-Type', mime);            // und er geht raus
         res.send(blob);
       });

   Der Upload-Filter prüft `/^image\//` — `image/svg+xml` besteht das.
   `makeVariants()` ruft `sharp(buf, { failOn: 'none' })` OHNE vorherige
   Formatprüfung; `sharp` rastert SVG anstandslos zu Vorschau und mittlerer
   Größe, der Upload sieht also normal aus. Reproduziert im Ideenpapier: eine
   SVG mit `<script>` als Foto hochgeladen, `GET /raw` liefert sie als
   `image/svg+xml`, inline, ohne Content-Security-Policy — Rechtsklick
   „Grafik in neuem Tab öffnen" genügt, und das Skript läuft im Origin der
   Anwendung. Der Session-Cookie ist `HttpOnly` und damit nicht auslesbar,
   aber Skript im richtigen Origin braucht ihn nicht: es ruft die API als das
   Opfer auf. EIN BENUTZER MIT DER ROLLE `user` KÖNNTE DARÜBER AKTIONEN EINES
   ADMINS AUSLÖSEN.

   Der Gegenbeweis, dass das ein Versehen ist und keine Entscheidung: die
   Kommentarbilder machen es richtig. `GET /api/comment-images/:id/raw` ruft
   `anh.setzeKopfzeilen(res, 'bild.jpg', { inline: true })` — fester
   Dateiname, Typ aus der Positivliste, alle Schichten dran. Der sorgfältige
   Weg existiert im Projekt, der Fotoweg benutzt ihn nur nicht.

   ZWEI SCHICHTEN, wie überall sonst im Projekt:

   * BEIM HOCHLADEN ABLEHNEN, was kein Rasterbild ist — nicht am gemeldeten
     Typ, sondern am Ergebnis. `sharp(buf).metadata()` liefert `format`;
     alles außerhalb von `jpeg|png|webp|avif|gif|tiff` wird abgewiesen. Das
     ist dieselbe Regel, die Kommentarbilder schon haben. `metadata()` kommt
     damit zum ERSTEN MAL in den Quelltext — bisher benutzt keine Stelle sie
     (nachgezählt: 0 Treffer).
   * BEIM AUSLIEFERN DEN TYP AUS DEN BYTES ABLEITEN, nie aus `photos.mime_type`.
     Die ersten Bytes sagen eindeutig, was es ist; alles Unbekannte geht als
     `application/octet-stream` mit `Content-Disposition: attachment` raus.
     Damit sind auch BESTANDSDATEN geschützt, ohne Migration — dieselbe
     Ableitung-statt-Speicherung, die `anhaenge.js` schon für Anhänge anwendet.

   Die Spalte `photos.mime_type` bleibt stehen und wird weiter angezeigt —
   sie ist eine Anzeige, keine Ausliefergrundlage mehr.

2. EINE SICHERHEITSREGEL FÜR DIE ANWENDUNG SELBST. Anhänge bekommen
   `default-src 'none'; sandbox`. Die Seite selbst bekommt NICHTS. Sie
   braucht heute auch nichts — nachgezählt: 0 Stellen mit `onclick=` in einer
   Zeichenkette, `esc()` wird durchgängig angewandt, der Kommentartext geht
   nachweislich nie über `innerHTML`. GENAU DESHALB IST EINE CSP HIER BILLIG,
   und sie ist die Schicht, die bei Punkt 1 mitgegriffen hätte — zwei
   Verteidigungen für denselben Fehler, keine für den nächsten, den heute
   niemand sieht.

       // server.js:18, neben dem vorhandenen nosniff
       res.set('Content-Security-Policy',
         "default-src 'self'; img-src 'self' data: blob:; " +
         "style-src 'self'; script-src 'self'; frame-src 'self'; " +
         "frame-ancestors 'none'; base-uri 'none'; form-action 'none'");

   `frame-src 'self'` GEHÖRT HINEIN: die PDF-Vorschau bindet ein `<iframe
   src="/api/attachments/…/raw?inline=1">` auf den eigenen Origin ein
   (`public/app.js:2618`) — ohne die Freigabe zeichnete sie sich nicht mehr.
   ERST NACHSEHEN, DANN GLAUBEN: prüf vor dem Einbau, ob irgendwo ein
   `style="…"`-Attribut gesetzt wird — das erlaubt `style-src` weiterhin,
   `unsafe-inline` wäre nur für `<style>`-Elemente nötig, und beides ist im
   Prüfstand belegbar (echter Server, echter Browser über `jsdom`, Kopfzeile
   ansehen).

3. EIN KOPF VOM AUFRUFER IST NIE EINE FESTSTELLUNG, SONDERN EINE BEHAUPTUNG.
   Die Regel steht seit 0.8.10 im Projektstand, Abschnitt 11, bisher nur für
   den `Host`-Kopf im Konzeptpapier belegt. Hier ist sie NACHWEISLICH
   VERLETZT:

       // auth.js:346
       function clientIp(req) {
         return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
           || req.socket.remoteAddress || 'unbekannt';
       }

   Reproduziert im Ideenpapier: zwölf Anmeldeversuche mit falschem Passwort,
   ohne `X-Forwarded-For` bremst der Server nach zehn Versuchen für einige
   Minuten; MIT EINEM BEI JEDEM VERSUCH GEÄNDERTEN KOPF BREMST ER NIE. Übrig
   bleibt allein die Bremse je Benutzername — die verzögert absichtlich nur,
   sperrt nie, und war nie als alleinige Verteidigung gedacht.

   BEREITS BESCHLOSSEN, NICHT NEU ZU ENTSCHEIDEN (Projektstand, Abschnitt 11):
   „Eine Einstellung, fünf Wirkungen: gelesener Kopf, `Secure` am Keks,
   `Strict-Transport-Security`, `__Host-`-Präfix und der Hinweis in der
   README hängen alle daran." Das ist der Umfang von Punkt 3, nicht mehr und
   nicht weniger — eine Einstellung `hinterProxy` (Vorgabe: **aus**):

   * AUS: `req.socket.remoteAddress`, Punkt. `X-Forwarded-For` wird nicht
     gelesen — der richtige Zustand für „direkt im Heimnetz, Port 3100".
   * AN: der Kopf wird gelesen, `Secure` steht am Keks, `Strict-Transport-
     Security` wird gesetzt, der Kekname trägt das Präfix `__Host-`.

   DREI FRAGEN, DIE ICH VOR DEM BAUEN GEKLÄRT HABEN WILL:

   * WO STEHT DIE EINSTELLUNG — Umgebungsvariable (parallel zu `PORT`,
     `DATA_DIR`, `ENCRYPTION_KEY`) oder ein Schlüssel in der `settings`-
     Tabelle, schreibbar über `PUT /api/settings` wie Vokabular und
     Suchanbieter? Ich neige zur Umgebungsvariable: sie entscheidet über
     Netzwerkvertrauen, nicht über eine Vorliebe, und ein Admin-Zugang, der
     sie über die API umlegen könnte, wäre selbst ein Angriffsziel. Sag mir,
     was du für richtig hältst.
   * WELCHER PROXY IST GEMEINT — sieh auf dem Wirt nach, ob Nginx Proxy
     Manager im selben Docker-Netz wie Kriterion läuft oder über den
     veröffentlichten Port 3100 zugreift, und was `req.socket.remoteAddress`
     bei einer echten Anfrage heute zeigt (`docker compose logs`, testweise
     eine Zeile Protokoll). Bei Bridge-Netzwerk ohne `network_mode: host`
     sieht der Container ohnehin nie die echte Adresse des Besuchers, nur die
     des vorgeschalteten Hops — das ändert, WAS `hinterProxy: aus` in eurem
     Fall überhaupt bedeutet. ERST NACHSEHEN, DANN GLAUBEN.
   * DIE UMBENENNUNG DES KEKSES MELDET JEDEN AN AB. Der Keks heißt heute
     `kriterion_session`; das `__Host-`-Präfix verlangt den Namen wörtlich.
     Wer `hinterProxy` einschaltet, wird beim nächsten Start einmalig
     abgemeldet — kein Datenverlust, aber erwähnenswert, damit es niemanden
     überrascht.

   Kein Alleingang zum Vertrauensmodell des Kopfes: einen anderen Kopf zu
   glauben ist eine Grundsatzentscheidung, keine Bequemlichkeit.

Haltepunkt: nach Punkt 3. Die drei Punkte mit echter Wirkung auf ausgehende
Antworten und auf die Sitzung sind dann fertig; was folgt, ist Aufräumen ohne
Wirkung auf einen echten Aufruf.

4. DER FEHLER-HANDLER ANTWORTET AUF ALLES MIT 400.

       // server.js:2376
       app.use((err, req, res, next) => {
         console.error(err);
         res.status(400).json({ error: err.message || 'Unbekannter Fehler' });
       });

   ZWEI GETRENNTE PROBLEME. Ein Serverfehler wird als Clientfehler gemeldet
   — ein SQL-Fehler, ein `sharp`-Absturz, ein voller Datenträger, alles kommt
   als 400 zurück; für den Prüfstand und für `curl` von Hand ist das
   irreführend, 400 heißt „du hast falsch gefragt", nicht „bei mir ist etwas
   kaputt". Und `err.message` GEHT UNGEFILTERT AN DEN CLIENT — bei einem
   SQL-Fehler stehen darin Tabellen- und Spaltennamen. Kein Drama hinter der
   Anmeldung, aber es widerspricht „was nicht angezeigt werden soll, wird
   nicht geliefert".

   Absichtlich geworfene Fehler behalten ihre 400 — dafür bekommen sie eine
   Markierung (`err.status = 400` oder eine eigene Fehlerklasse). ALLES OHNE
   MARKIERUNG WIRD 500 MIT FESTEM TEXT; die Einzelheiten bleiben im
   Protokoll. Multer-Fehler („Datei zu groß") sind echte 400 und behalten
   ihre Meldung — PRÜF NACH, WO im Quelltext heute mit `throw` oder
   `res.status(4xx)` gearbeitet wird, damit keine bestehende 4xx-Antwort
   still zur 500 wird.

5. KLEINKRAM AM RAND — ZWEI DINGE, DIE ZUSAMMENGEHÖREN, WEIL BEIDE OHNE
   WIRKUNG AUF EINEN ECHTEN AUFRUF SIND.

   a) KEIN SAUBERES HERUNTERFAHREN. Es gibt keinen `SIGTERM`-Handler;
      `docker compose down` beendet den Prozess hart, die WAL-Datei bleibt
      liegen. Bei SQLite ungefährlich — aber wer in genau diesem Moment
      `./data` sichert, sichert einen Zustand mit offener WAL.

          for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => {
            try { db.pragma('wal_checkpoint(TRUNCATE)'); db.close(); } catch {}
            process.exit(0);
          });

      Sechs Zeilen, und die Sicherung des Datenverzeichnisses wird verlässlich.

   b) INDEX AUF `sessions.user_id`. Die Tabelle trägt heute nur den
      Primärschlüssel auf `token`; jede Suche nach den Sitzungen EINES
      Benutzers (Sperren, Löschen, „Meine Sitzungen" ab 0.8.80) liest die
      ganze Tabelle. `CREATE INDEX IF NOT EXISTS idx_sessions_user ON
      sessions(user_id);` neben die übrigen `CREATE INDEX IF NOT EXISTS`-
      Zeilen in `db.js`.

      **KEIN UMSTIEGSCODE NÖTIG, UND DAS IST KEIN VERSEHEN:** anders als eine
      neue SPALTE (`CREATE TABLE IF NOT EXISTS` rüstet die in einer
      vorhandenen Tabelle nicht nach) fasst ein Index die Zeilenform nicht
      an. `CREATE INDEX IF NOT EXISTS` legt ihn bei JEDEM Start an, den er
      noch nicht hat — frische und bestehende Anlage gleichermaßen. Die
      Bauregel unten greift hier nicht, aber PRÜF DAS NACH, bevor du dich
      darauf verlässt.

   EINE VIERTE SACHE, DIE HIER FEHLT UND ABSICHTLICH FEHLT: das Ideenpapier
   bündelt unter demselben Befund (2.7) auch einen `HEALTHCHECK` im
   `Dockerfile` gegen `/api/health` hinter der Anmeldung. DER STUFENPLAN
   NENNT NUR „SAUBERES HERUNTERFAHREN" — ob das Absicht war oder beim
   Formulieren verlorengegangen ist, weiß ich nicht. Sag mir, ob
   `HEALTHCHECK` mit hinein soll; sechs weitere Zeilen, kein Eingriff in
   `/api/health` selbst nötig, weil `/api/config` schon vor der Anmeldung
   antwortet und nichts verrät.

Zu beachten: KEIN Punkt fasst das Schema an. `F_ROUTEN` bleibt bei 46 — es
entsteht keine neue schreibende Route, Punkt 3 ändert nur, wie eine
vorhandene Antwort aussieht. Kommt dir doch ein Schemaeingriff in die Quere,
gilt die Bauregel, und du sagst es vorher.

VORGEHEN — in dieser Reihenfolge:

1. Lies den Projektstand (Abschnitt 1 zum Betrieb hinter dem Reverse Proxy,
   Abschnitt 5a die Sicherheitsregel für Anhänge, Abschnitt 6 Stolpersteine,
   Abschnitt 10 den Stufenplan, Abschnitt 11 die Bindung „Ein Kopf vom
   Aufrufer …"), dazu im Ideenpapier die Abschnitte 2.1 bis 2.4, 2.6 und 2.7
   — dort stehen die Reproduktionen und Messwerte, die zu dieser Runde
   geführt haben.
2. Sieh dir die betroffenen Dateien im Repo an, bevor du etwas vorschlägst:
   `anhaenge.js` (die acht Punkte im Kopf), `server.js` (Fotoweg,
   Fehler-Handler, `app.listen`), `auth.js` (`clientIp`, der Keks), `db.js`
   (die `sessions`-Tabelle und die vorhandenen Indizes).
3. Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen. Die drei Fragen aus Punkt 3 und die eine aus Punkt 5 gehören
   hierher, nicht in den Bau. Unstimmigkeiten zwischen Papier und Quelltext
   sagst du jetzt.
4. Erst nach meinem OK bauen — gezielte Änderungen, keine Neuerzeugung
   ganzer Dateien.
5. Neue Prüfungen in `pruefung.js`, jede mit Gegenprobe: Regel probeweise
   zurückbauen, zeigen, dass genau diese Prüfung namentlich rot wird. Vor dem
   Deuten roter Punkte per `diff` belegen, dass der Quelltext der ist, den du
   zu prüfen glaubst. Für Punkt 1 gehört ein echter Server, ein echter
   Upload einer SVG-Datei und eine SVG-Kontrolle des ausgelieferten Bytestroms
   dazu — eine Prüfung, die nur den gesetzten Kopf ansieht, belegt nicht, was
   tatsächlich herausgeht.
6. `hinterProxy` in beiden Lagen prüfen: aus (Vorgabe) UND an, mit einem
   echten `X-Forwarded-For`-Kopf im Prüfaufruf. Eine Prüfung, die nur die
   Vorgabe ansieht, belegt die Einstellung nicht.
7. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen
  Vorgehens. Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.8.20` setzen.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
  Einzige Ausnahme sind die Marken aus der Bauregel.
* Kein Wort der Oberfläche steht im Quelltext, wenn es das Vokabular kennt.
  Umgekehrt bekommt nichts ein neues Vokabelwort, nur weil es auf dem
  Bildschirm steht.
* Nicht anfassen ohne Rückfrage: Farbschema, Anmeldebremse je Benutzername,
  Verschlüsselungsmodell, Dateiname `katalog.sqlite`.
* Jede Rechteprüfung braucht zwei vorbereitete Sitzungen, zu jeder
  Verweigerung den Erfolgsfall daneben und die Nachschau, dass nichts
  geschrieben wurde.
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

In dieser Runde fällt darunter voraussichtlich nichts: der Index ist eine
Ableitung beim Start, die Einstellung `hinterProxy` rührt kein Schema an, und
die übrigen Punkte sind reiner Anwendungscode.

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitszweig geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; der Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.20.md` liegt im Zweig, als Rohstoff für die
  spätere Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit
  Begründung, neue Stolpersteine mit Nummer und Kernsatz (die Zählung setzt
  bei 96 fort), die Gegenprobentabelle, Prüfungszahlen vorher/nachher,
  Offengebliebenes.
* Wie seit 0.8.10: die Zeile „0.8.20 — Abdruck `…`" gehört ins
  Änderungsprotokoll, ZULETZT gebildet, nach der letzten Änderung an einer
  ausgelieferten Datei — der Abdruck deckt `anhaenge.js`, `auth.js`, `db.js`
  und `server.js` bereits ab (Projektstand, Abschnitt 2), diese Runde ändert
  nichts an seiner Ableitung.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im
  Chat, nicht in den Dokumenten. Für Punkt 1 ausdrücklich dabei: eine
  hochgeladene SVG-Testdatei, `curl` gegen `/api/photos/:id/raw`, und der
  Beleg, dass der ausgelieferte `Content-Type` nicht mehr `image/svg+xml`
  ist.

Projektstand, Konzeptpapier, Ideenpapier und README NICHT anfassen und keinen
Auftragsblock für die nächste Stufe bauen. Das kommt erst, wenn ich gemeldet
habe, dass 0.8.20 eingespielt ist und sauber läuft.

ZUM VORMERKEN, NICHT IN DIESER RUNDE:

* **Stufe G4 auf 0.8.30** — „Die Linkliste bekommt Verfasser", die erste
  Datenbankstufe seit 0.8.3. `user_id` an `links` samt Umstiegsblock,
  Formatnummer 6 → 7. Siehe Konzeptpapier. Die Sicherung des
  Datenverzeichnisses gehört dort wieder ausdrücklich in den Einspielweg.
* Ein TRUSTED-PROXY-ALLOWLIST (nur eine eingetragene Absenderadresse darf den
  Kopf überhaupt setzen) ist in dieser Runde BEWUSST NICHT gebaut — die
  Einstellung `hinterProxy` ist ein Ja/Nein, kein Adressbuch. Wird die Anlage
  je aus mehreren Netzen gleichzeitig erreichbar, gehört das nachgeliefert.
