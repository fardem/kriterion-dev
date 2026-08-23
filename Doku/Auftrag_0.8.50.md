Projekt Kriterion. Quelltext und Dokumente liegen im Repo `fardem/kriterion`;
Projektstand, Konzeptpapier, das Ideenpapier, das Videopapier, das
Gewichtungspapier und die Änderungsprotokolle 0.8.6, 0.8.10, 0.8.20, 0.8.30,
0.8.31 und 0.8.40 stehen dort unter `Doku/`. Gearbeitet wird im Repo, nicht an
einer Kopie.

AUFTRAG: **Version 0.8.50 — „Kurzvideos am Fotoplatz."**
DIES IST KEINE STUFE DES MEHRBENUTZERBETRIEBS — der ist mit G4 bis auf H und I
gebaut. Es ist die nächste Runde des Stufenplans, **und es ist eine
Datenbankstufe**: vollständige DDL in `db.js`, ein **Umstiegsblock mit
Marken**, ein eigener Prüfabschnitt, ein Eintrag unter „Vorgemerkt für 1.0" —
und die **Sicherung des Datenverzeichnisses gehört in den Einspielweg**.

Ausgearbeitet liegt die Sache in `Konzept_Video_und_grosse_Dateien.md`,
**Teil I, Abschnitte 2 bis 9.** **Lies das Papier ganz, bevor du etwas
vorschlägst** — auch Teil II, aber **nur um zu wissen, was diese Runde NICHT
tut.** Abschnitte 10 bis 14 sind 1.1.0 und ausdrücklich nicht Gegenstand:
kein zweiter Speicherort, keine eigene Verschlüsselung, kein stückweises
Hochladen, keine `uploads`-Tabelle. Dieser Auftrag wiederholt das Papier
nicht, er schneidet es in Punkte, setzt die Zahlen dieser Version ein und
benennt, was seit dem Schreiben des Papiers dazugekommen ist — **und drei
Stellen, an denen das Papier mit dem heutigen Quelltext nicht zusammengeht.**

WARUM DIESE RUNDE JETZT KOMMT: 0.8.40 (Gewichtung) ist gebaut, Abdruck
`49d2ae53`, 1807 Prüfungen. Beide Bindungen des Stufenplans sind erfüllt:
**0.8.20 liegt vor 0.8.50** (der Videoweg liefert inline aus und durfte erst
gebaut werden, als „der ausgelieferte Typ kommt nie aus der Datenbank" auch am
Fotoweg gilt), und **0.8.70 liegt danach** (der Papierkorb serialisiert einen
Eintrag und soll das einmal tun, nicht einmal und einmal nachgezogen).

WAS SICH ÄNDERT, IN EINEM SATZ: Ein **Kurzvideo bis 20 MB** liegt in
derselben Reihe wie die Fotos, mit einem **Standbild**, das der Browser des
Hochladenden erzeugt — der Server öffnet nie ein Video.

DIE ENTSCHEIDUNG, AN DER DAS GANZE HÄNGT, UND SIE IST BAULICH: **`ffmpeg`
kommt nicht ins Abbild.** Das Standbild macht der Browser über `<video>` und
`<canvas>`, bevor hochgeladen wird. Vier Folgen, alle gewollt: keine neue
Abhängigkeit; der Server speichert Bytes und liefert Bytes; wer ein Video
nicht abspielen kann, kann es nicht hochladen (und das ist richtig — ein
Videoplatz, der nicht abspielt, ist ein kaputter Platz); und **das Standbild
ist nicht überprüfbar** — es ist eine Vorschau, keine Aussage, und das gehört
als Kommentar in den Quelltext, damit es niemand später für einen Beleg hält.

**DIESELBE TABELLE, KEINE ZWEITE.** Fotos und Videos stehen in **einer**
Reihenfolge; zwei Tabellen hießen zwei sortierte Listen und damit zwei
Quellen für die Frage, was das Hauptbild ist. Daraus folgt, dass jede
vorhandene Regel von selbst greift — Rechte, Kaskade, Reihenfolge,
Fokuspunkt, Verschlüsselung, Sicherung. Nichts davon muss durchgesetzt
werden, und nichts davon darf eine Ausnahme bekommen. **Abschnitt 3a des
Papiers ist die Liste; geh sie beim Vorschlag einzeln durch und sag zu jeder
Zeile, ob sie wirklich von selbst gilt.**

**ES GIBT VORAUSSICHTLICH EINE NEUE SCHREIBENDE ROUTE**, und damit geht
`F_ROUTEN` von **46 auf 47**. Das ist die erste seit langem; Punkt 2 stellt
die Frage ausdrücklich, weil sie auch anders beantwortet werden kann.

**DIE FORMATNUMMER GEHT 9 → 10.** Das Papier sagt es im Kopfvermerk richtig;
0.8.30 hat die 7 belegt, 0.8.31 die 8, 0.8.40 die 9.

Fünf Punkte. Die Bündelung folgt der Sache; bei jedem Punkt steht, warum er so
geschnitten ist.

---

1. DAS SCHEMA UND DER UMSTIEG. Der kleinste Punkt der Runde, und trotzdem der
   erste — alles Weitere setzt die beiden Spalten voraus.

   `photos` bekommt

       art   TEXT NOT NULL DEFAULT 'bild'   -- 'bild' | 'video'
       dauer INTEGER                        -- Sekunden, nur bei Video

   Was die vorhandenen Spalten bei einem Video bedeuten, steht in Abschnitt 3
   des Papiers als Tabelle: `data` trägt die Videodatei, `thumb` und `medium`
   das Standbild, `focus_x`/`focus_y` wirken auf das Standbild. **Diese
   Tabelle gehört als Kommentar an die beiden Spalten** — sie ist die einzige
   Stelle, an der steht, warum `data` je nach `art` etwas anderes ist.

   DER UMSTIEGSBLOCK, gebaut wie `umstieg0840()` und mit denselben Marken:

       // UMSTIEG 0.8.50 — ENTFAELLT MIT 1.0
       function umstieg0850() { … }
       umstieg0850();
       // ENDE UMSTIEG 0.8.50

   Er ist der **fünfte markierte Block** im Projekt — nach `umstieg083()`,
   `umstieg0830()`, `umstieg0831()` und `umstieg0840()`. `PRAGMA
   table_info(photos)` entscheidet, ob etwas zu tun ist; einmalig,
   wiederholbar und im Normalfall stumm.

   **ES SIND ZWEI SPALTEN IN EINEM BLOCK, UND SIE WERDEN EINZELN GEPRÜFT.**
   Ein Block, der beim Vorhandensein von `art` zurückkehrt, ließe `dauer`
   fehlen, wenn ein Lauf dazwischen abgebrochen ist. Das ist unwahrscheinlich
   und trotzdem billiger zu verhindern als zu finden: frag jede Spalte
   einzeln. **Stell nach, was `ALTER TABLE` bei zwei Anweisungen tut, wenn die
   zweite scheitert** — und sag es im Vorschlag.

   **BESTANDSZEILEN BEKOMMEN `'bild'`, und die Vorgabe kommt aus dem `DEFAULT`
   der Spalte, nicht aus einem `UPDATE`** — dieselbe Bauform wie bei
   `gewicht` in 0.8.40. `dauer` bleibt bei den Bestandszeilen `NULL`, und das
   ist richtig: ein Foto hat keine Dauer. Die Frage gehört trotzdem
   ausdrücklich beantwortet, weil Stolperstein 20 sie verlangt.

   **`ordneBestandZu()` wird NICHT angefasst.** Dort geht es um `user_id`; ein
   Foto gehört seinem Eintrag, nicht einem Verfasser (Änderungsprotokoll
   0.8.31, Abschnitt 7: *„Fotos sind weiterhin kein Träger"*). Sag es im
   Vorschlag ausdrücklich, damit klar ist, dass die Frage gestellt und
   verneint wurde.

   **KEIN `CHECK`-CONSTRAINT auf `art`**, obwohl es hier verlockender ist als
   beim Gewicht — zwei erlaubte Werte lassen sich hinschreiben. Der Grund ist
   derselbe wie in 0.8.40 und steht dort im Quelltext: die Menge der erlaubten
   Werte stünde dann zweimal. **Und die Begründung „SQLite kann das nicht"
   gilt nachweislich nicht** — Stolperstein 107. Wenn du es anders siehst, sag
   es vorher.

   **`idx_photos_item` bleibt, wie er ist.** Ein Index über `art` bringt
   nichts: die Zeilen je Eintrag sind einstellig, und gefiltert wird nirgends
   nach Art. Ein Index ist ohnehin kein Umstieg (0.8.20, an `sessions`
   nachgestellt).

   **VORGEMERKT FÜR 1.0:** der markierte Block bekommt sofort seinen Eintrag —
   Datei, Zeilenzahl, Prüfabschnitt, was bleibt (die beiden Spalten) und was
   fällt (der Block). Wie bei den vier davor gehört dazu der Satz, was
   **nicht** mitfällt. Und die Prüfung „Ein Sprung von 0.8.20 fährt ALLE
   Umstiege in einem Start" ist zu **erweitern, nicht zu verdoppeln** — sie
   steht im Abschnitt von 0.8.31 und gehört inzwischen allen Blöcken.

2. DER WEG HEREIN. Zwei Teile in einem Vorgang — die Videodatei und ein JPEG —,
   und genau daran hängt die eine Frage dieses Punktes.

   **SAG MIR VORHER, WELCHEN WEG DU NIMMST. Ich neige zur eigenen Route.**

   `POST /api/items/:id/photos` gibt es, sie steht hinter
   `nurEintragVerfasser`, und sie hat einen `fileFilter` auf `^image\/` samt
   `limits: { fileSize: 30 * 1024 * 1024 }`. Zwei Wege sind denkbar:

   * **eine eigene Route `POST /api/items/:id/videos`** hinter derselben
     Klemme, mit eigenem `multer` (zwei benannte Felder, eigene Größe) —
     `F_ROUTEN` geht auf **47**, die Art bleibt `nurEintragVerfasser`;
   * **die vorhandene Route erweitern** — dann müsste ihr `fileFilter` gelockert
     und `rasterBild()` je nach Feld umgangen werden, und eine Route trüge
     zwei Gestalten.

   Der `fileFilter` auf `^image\/` ist eine **grobe erste Schranke**, die
   ausdrücklich nichts trägt (der Kommentar sagt es); die tragende Prüfung ist
   `rasterBild()`. Ihn zu lockern nähme trotzdem die erste Schranke weg, und
   zwar für den Fotoweg mit. Deshalb die eigene Route.

   **DAS STANDBILD LÄUFT DURCH DENSELBEN WEG WIE JEDES FOTO:** `rasterBild()`
   und `makeVariants()`. Damit gilt für es dieselbe Regel wie für
   Kommentarbilder — was `sharp` nicht als Bild lesen kann, kommt nicht
   herein. **Auf die Videodatei wird `rasterBild()` ausdrücklich NICHT
   angewandt**, und der Grund gehört als Kommentar daneben: der Server öffnet
   nie ein Video.

   **`VIDEO_MAX = 20 * 1024 * 1024` steht an genau einer Stelle**, wie
   `ANHANG_MAX` und `GEWICHT_MIN`. Warum 20 und nicht 50, steht gemessen in
   Abschnitt 7 des Papiers — 50 MB kosten beim Lesen eine halbe Sekunde, mit
   dem ganzen Blob im Arbeitsspeicher. Der Satz gehört an die Konstante.

   **DIE ENDUNGSLISTE STEHT IN `anhaenge.js`, NICHT IN `server.js`** —
   `.mp4`, `.m4v`, `.webm`, `.mov`. Sie ist dieselbe Liste, die Punkt 3 zum
   Ausliefern braucht, und zwei Listen für dieselbe Frage liefen auseinander.
   `.mov` ist der Grenzfall, den die Praxis erzwingt (jedes iPhone liefert
   ihn); die Antwort ist nicht, ihn zu verbieten, sondern die Standbildprüfung
   im Browser entscheiden zu lassen.

   **`sort_order` zählt weiter wie bisher** — ein Video hängt sich hinten an
   die vorhandenen Fotos, in derselben Nummerierung. `touch.run()` wie beim
   Foto.

   WAS VON SELBST FOLGT und **nicht** angefasst wird:
   `PUT /api/items/:id/photo-order`, `DELETE /api/photos/:id`,
   `PUT /api/photos/:id/focus` und die Kaskade an `items`. Geh sie im Vorschlag
   trotzdem einzeln durch (Abschnitt 3a des Papiers) und sag zu jeder, warum
   sie unberührt bleibt.

3. DIE AUSLIEFERUNG — UND DER WÄCHTER, DER SEIT 0.8.20 AUF DIESE RUNDE WARTET.

   Im Projektstand, Abschnitt 5, steht seit 0.8.20 wörtlich:

   > **Dagegen hilft kein Merksatz, sondern ein Wächter im Prüfstand:** keine
   > Zeile in `server.js` setzt den Content-Type selbst. Wer eine Auslieferung
   > ergänzt, wird namentlich rot — **gedacht für 0.8.50**, wo ein Video inline
   > ausgeliefert wird.

   **Das ist jetzt.** Der Wächter zählt wörtlich `res.set('Content-Type'`,
   `res.setHeader('Content-Type'` und `res.type(` in `server.js`. Wer den
   Videoweg dort baut, wird rot — und das ist keine Panne, sondern die
   Aufforderung, sich für einen der beiden Wege in `anhaenge.js` zu
   entscheiden.

   **DER RICHTIGE WEG IST `setzeBildKopfzeilen()` UND DAMIT `typAusBytes()`,
   und hier steht die erste Stelle, an der das Papier mit dem Quelltext nicht
   zusammengeht.** Abschnitt 6 sagt: *„Der ausgelieferte Typ kommt aus der
   Positivliste in Abschnitt 5, **nach Endung**"*. **`photos` speichert aber
   keinen Dateinamen** — es gibt dort keine Endung. Der Fotoweg entscheidet
   seit 0.8.20 nach den **ersten Bytes**, und für ein Video geht das genauso:
   MP4, M4V und MOV sind ISO-BMFF und tragen `ftyp` an Byte 4 (die Marken
   `isom`, `mp41`, `mp42`, `avc1`, `M4V `, `qt  `), WebM beginnt mit dem
   EBML-Kopf `1A 45 DF A3`. `typAusBytes()` liest `ftyp` **heute schon** —
   für AVIF. **Stell die Marken nach, statt sie zu glauben**, an echten
   Dateien, und sag, was dabei herauskommt.

   Daraus folgt für `anhaenge.js`:

   * `typAusBytes()` erkennt zusätzlich `video/mp4`, `video/webm` und
     `video/quicktime`;
   * die Endungstabelle in `setzeBildKopfzeilen()` wächst mit — sonst hieße
     die ausgelieferte Datei `foto-7.bin`;
   * `INLINE_ERLAUBT` bekommt die drei Videotypen, sonst geht das Video als
     `attachment` heraus und wird heruntergeladen statt abgespielt;
   * `sicherheitsRegel()` bleibt bei `default-src 'none'; sandbox` — **sag im
     Vorschlag, ob `sandbox` das Abspielen behindert; stell es nach.**

   **`server.js` ändert an der Route selbst voraussichtlich gar nichts** — sie
   ruft schon heute `anh.setzeBildKopfzeilen(res, blob, …)`, und `blob` ist
   bei `size=thumb`/`size=medium` das Standbild und ohne Größe die Videodatei.
   Wenn das so aufgeht, sag es; wenn nicht, sag warum.

   **UND HIER STEHT DIE ZWEITE STELLE, AN DER DAS PAPIER SICH SELBST
   WIDERSPRICHT.** Abschnitt 6, Punkt 5 verlangt `Accept-Ranges: none` — „bei
   20 MB lädt der Browser die Datei ganz und springt darin selbst". Abschnitt
   10 sagt über denselben Gegenstand: *„iOS Safari spielt ein Video überhaupt
   nicht ab, wenn der Server keine Bereiche anbietet."* Beides kann nicht
   stimmen.

   **Ich neige dazu, Bereiche zu liefern**, und zwar aus zwei Gründen: der
   Blob liegt beim Lesen ohnehin ganz im Arbeitsspeicher, ein `206` mit
   `Content-Range` auf einem Buffer ist ein Dutzend Zeilen — und ein Video,
   das auf dem Handy nicht abspielt, ist genau der kaputte Platz, den Punkt 4
   des Papiers vermeiden will. **Aber es ist eine Erweiterung gegenüber dem
   Papier, und ich will sie nicht ungefragt bauen.** Entscheide du; wenn es
   bei `Accept-Ranges: none` bleibt, gehört der Vorbehalt in den Projektstand
   unter „Offene Betriebspunkte", nicht in eine Fußnote.

4. AM BILDSCHIRM. Das Standbild, die Leiste, das Vollbild und die beiden
   Zählstellen — sie stehen zusammen, weil sie alle an derselben Frage
   hängen: **woran erkennt die Oberfläche ein Video?** Antwort: an `art` aus
   der Antwort, an nichts sonst. Kein Raten am ausgelieferten Typ, keine
   zweite Wahrheit. Konkret heißt das: **`qPhotos` in `server.js` liefert
   `art` und `dauer` mit** — heute holt die Abfrage
   `id, item_id, mime_type, focus_x, focus_y, sort_order, created_at` und
   sonst nichts, und ohne die beiden Felder zeichnete die Oberfläche ins Leere.
   Sie hängen damit an `detail()` **und** an `/api/items` (`mainPhoto`).

   **DIE DRITTE STELLE, AN DER DAS PAPIER MIT DEM QUELLTEXT NICHT ZUSAMMENGEHT
   — UND SIE VERHINDERT, DASS ÜBERHAUPT ETWAS HOCHGELADEN WIRD.** Die
   Sicherheitsregel der Anwendung lautet heute:

       default-src 'self'; img-src 'self' data: blob:; …

   Es gibt **kein `media-src`**, also greift `default-src 'self'` — und die
   Standbildfunktion aus Abschnitt 4 setzt `v.src = URL.createObjectURL(datei)`
   auf ein `<video>`. Eine `blob:`-Adresse an einem `<video>` fällt unter
   `media-src`, nicht unter `img-src`. **Das wird verworfen, und zwar
   wortlos.** Die Regel braucht `media-src 'self' blob:`.

   Das ist eine **Erweiterung der Sicherheitsregel aus 0.8.20**, und sie
   gehört ausdrücklich begründet: `'self'` trägt die Wiedergabe aus der
   eigenen Anlage, `blob:` trägt das Standbild vor dem Hochladen. **Stell
   beides nach, bevor du es einbaust** — sowohl dass es ohne die Erweiterung
   scheitert als auch dass es mit ihr geht. Und der Prüfstand bekommt eine
   Zeile darauf; heute gibt es genau eine Prüfung auf die Regel
   („Nichts wird von fremden Adressen geladen").

   Alles Weitere folgt dem Papier, Abschnitt 8:

   * **Vorschauleiste:** ein ▶ in der Ecke und, wenn `dauer` bekannt ist, die
     Länge als `0:42`. Abgeleitet aus `art` und `dauer`, kein Schalter —
     dieselbe Bauform wie die Gewichtsmarke aus 0.8.40 und die
     Durchschnittsspalte aus 0.7.0.
   * **Vollbild:** statt `<img>` ein `<video controls>`. Blättern mit ← →
     bleibt; **beim Verlassen und beim Blättern wird angehalten** — sonst
     spielt der Ton weiter, während man das nächste Bild ansieht. Das Papier
     sagt nur „beim Verlassen"; das Blättern gehört dazu.
   * **Kein Zoom bei einem Video.** `hatOriginal()` in `public/app.js`
     entscheidet das heute für Kommentarbilder und ist die Stelle dafür.
   * **Auf der Karte ändert sich nichts** — dort steht das Standbild, wie ein
     Foto. Ein Abspielzeichen darauf, sonst nichts.
   * **Kein automatisches Abspielen, nirgends.** Und keine Vorschau beim
     Überfahren.
   * **Der Zähler auf der Karte** heißt heute „3 Fotos". Sag mir, was er bei
     gemischtem Bestand sagen soll; ich neige zu „3 Fotos · 1 Video", und bei
     reinem Bestand zum jeweils einen Wort.

   **DER LÖSCHDIALOG UND DIE KENNZAHLEN WEISEN VIDEOS GETRENNT AUS.**
   `GET /api/items/:id/bestand` liefert heute `fotos` als **eine** Zahl,
   `GET /api/stats` `photoCount` und `photoBytes`. Beides bekommt seine
   Videohälfte. **Das ist kein Beiwerk:** ein Dialog, der „3 Fotos" sagt und
   dabei ein Video mit wegwirft, verschweigt genau die Zeile, um
   derentwillen er dasteht. Die Feldnamen `fotos`, `photoCount` und
   `photoBytes` behalten ihre Bedeutung und bekommen Nachbarn — **nicht** eine
   geänderte Bedeutung; ältere Oberflächen lesen sie sonst falsch.

   **Der Ausschnittmodus (`focus_x`/`focus_y`) gilt am Standbild und bleibt
   unverändert.** Sag im Vorschlag, ob der Ausschnittmodus am Videoplatz
   überhaupt bedienbar bleiben soll — er wirkt auf die Kachel, und die gibt es
   dort ja.

Haltepunkt: **nach Punkt 4.** Dann sind Videos vollständig am Bildschirm,
liegen in der verschlüsselten Datenbank und überstehen jeden Neustart. **Was
dort noch fehlt, ist trotzdem eine echte Lücke und kein Schönheitsfehler:**
ein Export nähme sie nicht mit, und ein Einspielen in eine **frische** Anlage
verlöre sie ganz. Ein Stand am Haltepunkt ist committbar und im eigenen Haus
benutzbar, **aber nicht umzugsfähig**. Sag es dazu, wenn du dort anhältst.

5. EXPORT UND IMPORT, FORMATNUMMER 9 → 10. Ohne diesen Punkt verlöre die Datei
   genau die Angabe, die diese Runde einführt.

   **EIN EIGENER SCHALTER, VORGABE AUS** — wie `files=1` bei den Anhängen und
   aus demselben Grund: ein 20-MB-Video wird als Base64 zu 27 MB, und zwanzig
   davon sind 540 MB in **einer** JSON-Zeichenkette. Node hält keine
   Zeichenkette über rund 512 MB; der Export risse. Der Schalter heißt
   `videos=1` und steht neben `photos` und `files`.

   **DIE OFFENE FRAGE DIESES PUNKTES, UND SIE IST DIE EINZIGE ECHTE LÜCKE IM
   PAPIER.** Abschnitt 9 sagt: bei ausgeschaltetem Schalter enthält die Datei
   „den **Eintrag des Videos** (Name, Dauer, Reihenfolge) und sein
   **Standbild**, nur nicht die Videodatei", und beim Einspielen entstehe „ein
   Platz mit Standbild und dem Vermerk, dass die Datei fehlt".

   **Das geht mit dem heutigen Schema nicht auf.** `photos.data` ist
   `NOT NULL`. Ein Platz ohne Videodatei müsste entweder das Standbild in
   `data` tragen — dann liefert `GET /api/photos/:id/raw` ein JPEG für eine
   Zeile, die `art = 'video'` sagt, und der Abspieler bleibt schwarz —, oder
   `art` bekäme einen dritten Wert, oder es käme eine weitere Spalte dazu.
   Alle drei sind teurer, als der gewonnene Platzhalter wert ist.

   **Ich neige zu: kein Videoeintrag ohne Videodatei.** Beim Export ohne
   Schalter wird die Zeile weggelassen, und der Import **nennt im Protokoll
   und in der Antwort, wie viele Videos die Datei nicht enthielt** — dieselbe
   Haltung wie bei unbekannten Verfassernamen (0.8.30) und ungültigen
   Gewichten (0.8.40): nicht abbrechen, melden. Der Preis ist der, den das
   Papier scheut: stand das Video an erster Stelle, wird das nächste Foto zum
   Hauptbild. **Das ist hinnehmbar und muss gesagt werden**, in der Antwort
   des Imports und in der README.
   **Entscheide du.** Wenn du den Platzhalter willst, ist es eine Spalte mehr
   in Punkt 1, und der Auftrag verschiebt sich entsprechend.

   BEIM EINSPIELEN gilt außerdem: eine Datei **ohne** `art` an ihren Fotos ist
   eine ältere Exportdatei, und alles darin ist ein Bild. Entschieden wird
   über das **Vorhandensein der Felder**, nicht über die Formatnummer — die
   ist im Projekt eine Aussage, keine Bedingung. Und ein Video, dessen
   Standbild sich nicht durch `sharp` lesen lässt, wird **übergangen und
   genannt**, nicht eingespielt: dieselbe Regel wie beim Hochladen.

   **`reclaim()` nach dem Löschen bleibt, wie es ist**, wird aber wichtiger:
   ein gelöschtes Video gibt 20 MB frei. Sieh nach, ob
   `incremental_vacuum` in der heutigen Form dafür reicht, und sag es.

---

VORGEHEN — in dieser Reihenfolge:

1. Lies `Konzept_Video_und_grosse_Dateien.md` **vollständig** — Teil I als
   Bauplan, Teil II nur zur Abgrenzung. Dann im Projektstand Abschnitt 5 (die
   Entscheidungen, darunter „Erstes Foto ist das Hauptbild" und die
   Auslieferungsregel), **Abschnitt 5a — die Sicherheitsregel für
   ausgelieferte Dateien, sie ist für diese Runde der wichtigste Abschnitt
   überhaupt** —, Abschnitt 6 die Stolpersteine, Abschnitt 7 den Prüfstand
   samt den vier Umstiegsabschnitten, Abschnitt 10 den Stufenplan und
   „Vorgemerkt für 1.0", Abschnitt 11 die Bindungen.
2. Sieh dir die betroffenen Stellen im Repo an, bevor du etwas vorschlägst:
   `db.js` (`photos`, `umstieg0840()` als Vorbild), `anhaenge.js`
   (`typAusBytes`, `INLINE_ERLAUBT`, `setzeBildKopfzeilen`, `ausgabeTyp`,
   `sicherheitsRegel`), `server.js` (`CSP_ANWENDUNG`, `upload` samt
   `fileFilter`, `rasterBild`, `makeVariants`, `POST /api/items/:id/photos`,
   `GET /api/photos/:id/raw`, `qPhotos`, `detail()`,
   `GET /api/items/:id/bestand`, `GET /api/stats`, Export und Import),
   `public/app.js` (`openLightbox`, `bildQuelle`, `hatOriginal`,
   `drawViewer`, `drawThumbs`, `uploadFiles`, die Karte, der Löschdialog),
   `pruefung.js` (`F_ROUTEN`, die Fotogruppen, „Fotos: Auslieferung
   (Sicherheitsregel)", „Die Sicherheitsregel fuer die Anwendung selbst", die
   Abschnitte „UMSTIEG 0.8.31" und „UMSTIEG 0.8.40" als Vorbild).
3. Besprich, was du ändern willst, und warte auf meine Bestätigung. Nicht
   sofort bauen. **Die Fragen aus den Punkten 2, 3, 4 und 5 gehören hierher,
   nicht in den Bau** — die eigene Route, die Bereichsauslieferung, der
   Kartenzähler, der Ausschnittmodus und der Platzhalter im Export.
   Unstimmigkeiten zwischen Papier und Quelltext sagst du jetzt; drei stehen
   oben, und ich erwarte, dass du weitere findest.
4. Erst nach meinem OK bauen — gezielte Änderungen, keine Neuerzeugung ganzer
   Dateien.
5. Neue Prüfungen in `pruefung.js`. **Das Papier hat keine Prüfliste — anders
   als das Gewichtungspapier.** Du stellst sie selbst auf, und sie ist der
   erste Teil des Vorschlags, nicht der letzte. Jede mit Gegenprobe: Regel
   probeweise zurückbauen, zeigen, dass genau diese Prüfung namentlich rot
   wird. Vor dem Deuten roter Punkte per `diff` belegen, dass der Quelltext
   der ist, den du zu prüfen glaubst. **Die Gegenproben laufen in einer Kopie
   des Arbeitsbaums** (Stolperstein 100).
   **Was mindestens hineingehört**, und die Liste ist keine Obergrenze:
   * frische Anlage trägt `art = 'bild'` an allen Bestandszeilen, `dauer` NULL;
   * die Auslieferung: eine **echte** kleine MP4- und eine echte WebM-Datei
     hochladen und den **ausgelieferten Bytestrom samt Kopfzeilen** ansehen —
     Typ, `Content-Disposition: inline`, `nosniff`, Sicherheitsregel. Dieselbe
     Schärfe wie bei der SVG-Probe aus 0.8.20;
   * eine Datei mit **falscher Endung im Namen** und Videobytes, und eine mit
     Videoendung und Bildbytes: beide Male entscheidet der Inhalt;
   * `size=thumb` und `size=medium` an einer Videozeile liefern ein **Bild**,
     ohne Größe die **Videodatei**;
   * der Wächter „server.js setzt den Content-Type an keiner Stelle selbst"
     bleibt grün — und **eine Gegenprobe, die ihn probeweise verletzt**, macht
     ihn namentlich rot;
   * die Sicherheitsregel der Anwendung trägt `media-src` mit `blob:`, und
     eine Gegenprobe ohne `blob:` wird rot;
   * Rechte: ein Fremder lädt kein Video hoch (403), der Verfasser schon, und
     nach dem 403 steht **keine Zeile** in `photos`;
   * Reihenfolge: ein Video zwischen zwei Fotos, umsortiert, gelöscht — die
     Nummerierung bleibt lückenlos;
   * Löschdialog und Kennzahlen nennen Fotos und Videos getrennt und richtig;
   * Export und Import in beiden Schalterstellungen, dazu eine **ältere**
     Datei ohne `art`.
6. **Der Umstieg bekommt einen eigenen Prüfabschnitt**, gebaut wie „UMSTIEG
   0.8.40 — ENTFAELLT MIT 1.0": eine Datenbank aus 0.8.40 nachstellen —
   dieselbe Anlage, nur ohne die beiden neuen Spalten und **mit Fotos darin**
   — und belegen, dass der Umstieg sie ergänzt, dass die Bestandszeilen auf
   `'bild'` und `NULL` stehen, dass ein zweiter Lauf stumm bleibt und dass
   eine **frische** Anlage beide Spalten ohne Umstieg trägt. Dazu die Probe,
   dass **jede der beiden Spalten einzeln** nachgerüstet wird.
   **Dazu die Probe, die seit 0.8.31 dazugehört:** ein Lauf, der **alle**
   Umstiegsblöcke hintereinander fährt. Sie steht im Abschnitt von 0.8.31 und
   ist zu **erweitern, nicht zu verdoppeln**.
   **Und jede Lesestelle auf die neuen Spalten wird im Prüfstand abgefangen**
   — fehlt die Spalte, sollen die Prüfungen rot werden, nicht der Lauf
   abreißen (Stolperstein 103; in 0.8.40 hat genau das zugeschlagen und
   **keinen einzigen Namen** genannt).
7. Für die Rechteprüfung gilt unverändert: zwei vorbereitete Sitzungen, zu
   jeder Verweigerung der Erfolgsfall daneben und die Nachschau, dass nichts
   geschrieben wurde. **Hier ausdrücklich mit einem echten mehrteiligen
   Upload**, nicht mit einem nachgereichten `INSERT` — der Wächter steht vor
   `multer`, und ein `INSERT` liefe an beidem vorbei (die Lehre aus 0.8.31).
8. **Für den Doppelgänger in `baueDom` gilt Stolperstein 90 verschärft:** er
   muss `art` und `dauer` an **allen** Fotozeilen liefern, und die Prüflage
   braucht **beides nebeneinander** — mindestens ein Bild und mindestens ein
   Video, das Video **nicht** an erster Stelle, damit sich Hauptbild und
   Abspielzeichen unabhängig belegen lassen. Ein Doppelgänger mit lauter
   Bildern nähme genau die Prüfungen weg, für die er gebaut wird.
   **Und die Lehre aus 0.8.40 gilt hier doppelt:** eine Prüfung darauf, dass
   an einer Zeile etwas **nicht** steht, gehört hinter eine Prüfung darauf,
   dass es die Zeile überhaupt gibt (Stolperstein 81).
9. Neue Bedienelemente werden per `dispatchEvent` gedrückt, samt Durchlauf der
   Ereignisschleife. `.click()` genügt nicht.
10. Am Ende `npm test` vollständig laufen lassen und das Ergebnis zeigen.

REGELN:

* Deutsch in Kommentaren, Oberfläche, Meldungen und im Gespräch.
* IM CHAT KNAPP BLEIBEN. Kurze Sätze, kein Nacherzählen des eigenen
  Vorgehens. Was ich sehen muss: Entscheidungen, Rückfragen, Zahlen, Befunde.
* Versionsnummer in `package.json` auf `0.8.50` setzen, `package-lock.json`
  nachziehen (`npm install --package-lock-only`) — sonst wird der Prüfstand
  namentlich rot.
* Vorausgesetzt wird eine Datenbank aus 0.8.0 oder neuer.
* Kommentare zeitlos. Fachliche Warnung ja, Entstehungsgeschichte nein.
  Einzige Ausnahme sind die Marken aus der Bauregel.
* **Kein neuer Eintrag im Vokabular.** „Video" ist ein Wort über den
  Gegenstand — aber es ist keiner der elf einstellbaren Begriffe, und es wird
  auch keiner. Die elf bleiben elf. *Sag mir, wenn du das anders siehst; es
  ist die einzige Stelle dieser Runde, an der ich unsicher bin.*
* **`ffmpeg` und jede andere neue Abhängigkeit sind ausgeschlossen.** Nicht
  eine. Wer eine braucht, hat den falschen Weg gewählt.
* Nicht anfassen ohne Rückfrage: Farbschema, Anmeldebremse je Benutzername,
  Verschlüsselungsmodell, Dateiname `katalog.sqlite`, die Einstellung
  `HINTER_PROXY` und alles, was daran hängt. **Die Sicherheitsregel der
  Anwendung wird angefasst — aber nur um `media-src`, nur mit der Begründung
  aus Punkt 4 und nur nach meinem OK.**
* Eine Prüfung, die bei fehlendem Gegenstand grün bleibt, kann gar nicht
  scheitern — erst das Vorhandensein prüfen, dann die Eigenschaft
  (Stolperstein 81). **In 0.8.40 hat genau das zugeschlagen:** die Gegenprobe
  „das Gewichtsfeld erscheint auch bei Kategorien und Tags" blieb stumm, weil
  der Doppelgänger keine Kategorien lieferte.
* **Ein Wächter über den Quelltext prüft Code, nicht den Kommentar daneben**
  (Stolperstein 106). Wer eine Textprüfung schreibt, filtert die
  Kommentarzeilen weg — und belegt mit einer Gegenprobe, dass sie danach
  überhaupt noch etwas liest.
* **Zu jedem Feld, das die Oberfläche aus der Antwort liest, gehört eine
  Prüfung an der echten Antwort** (Stolperstein 102). Das betrifft hier `art`
  und `dauer` an den Fotozeilen von `detail()` und `/api/items`.
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

**`umstieg0850()` ist der fünfte markierte Block im Projekt** — nach
`umstieg083()` (0.8.3), `umstieg0830()` (0.8.30), `umstieg0831()` (0.8.31) und
`umstieg0840()` (0.8.40).

AM ENDE DES CHATS:

* Der Stand ist committet und auf den Arbeitszweig geschoben. Sinnvoll
  geschnittene Commits mit deutschen Meldungen; der Haltepunkt bekommt einen
  eigenen, damit er in der Historie steht.
* Kein ZIP, kein Dateiversand. Vor dem letzten Push: `git status` muss leer
  sein, und `npm test` läuft ein letztes Mal gegen genau diesen Stand.
* `Doku/Aenderungsprotokoll_0.8.50.md` liegt im Zweig, als Rohstoff für die
  spätere Dokumentenpflege: was gebaut wurde je Datei, Abweichungen mit
  Begründung, neue Stolpersteine mit Nummer und Kernsatz (**die Zählung setzt
  bei 108 fort**), die Gegenprobentabelle, Prüfungszahlen vorher/nachher
  (vorher: **1807**), Offengebliebenes.
* Die Zeile „0.8.50 — Abdruck `…`" gehört ins Änderungsprotokoll, ZULETZT
  gebildet, nach der letzten Änderung an einer ausgelieferten Datei — die
  Versionsnummer in `package.json` eingeschlossen, denn `server.js` lädt sie.
  Diese Runde fasst voraussichtlich `db.js`, `server.js`, `anhaenge.js`,
  `public/app.js` und `public/style.css` an; `auth.js` bleibt unberührt.
* **Der Einspielweg dieser Runde nennt die Sicherung des Datenverzeichnisses
  ausdrücklich** — es ist eine Datenbankstufe. Der Weg gehört in den Chat, mit
  den Befehlen und dem erwarteten Ergebnis.
* Die Befehle zum Nachprüfen auf dem Server mit erwartetem Ergebnis — im Chat,
  nicht in den Dokumenten. Für diese Runde ausdrücklich dabei: die Abfrage
  `PRAGMA table_info(photos)` im Container, eine Zählung
  `SELECT art, COUNT(*) FROM photos GROUP BY art` (erwartet unmittelbar nach
  dem Einspielen: nur `bild`), ein `curl -I` auf
  `/api/photos/<id>/raw` **eines vorhandenen Fotos** vor und nach dem
  Einspielen (die Kopfzeilen müssen gleich sein — die Runde darf an der
  Auslieferung vorhandener Fotos nichts ändern), und der Abdruckvergleich.

---

ZUM SCHLUSS DIESER RUNDE — DOKUMENTE UND CHANGELOG:

Diese drei Punkte sind Teil des Auftrags und werden am Ende abgearbeitet, nach
dem grünen Prüflauf:

* **Die Doku-Papiere sind nachzuziehen, README eingeschlossen.** Also:
  Projektstand (Kopf, Betriebsstand, Funktionsumfang, Abschnitt 5 um die
  Entscheidungen dieser Runde, Stolpersteine, Prüfstand samt fünftem
  Umstiegsabschnitt, Versionsgeschichte, Stufenplan, „Vorgemerkt für 1.0",
  Abschnitt 11), das Videopapier (Teil I als erledigt kennzeichnen, samt jeder
  Stelle, an der gebaut wurde, was dort anders steht), das
  Mehrbenutzer-Konzeptpapier, das Ideenpapier und die README. Der Projektstand
  und das Mehrbenutzerpapier tragen die Version im Dateinamen und werden
  entsprechend umbenannt (`git mv`, damit die Historie mitwandert); alle
  Verweise darauf sind nachzuziehen.
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

* **Teil II des Videopapiers — große Dateien bis 2 GB**, beschlossen für
  **1.1.0**, also nach 1.0. Zweiter Speicherort, eigene Verschlüsselung im
  Zählermodus, Bereichsabfragen, stückweises Hochladen, Aufräumen verwaister
  Dateien, Platzprüfung. Teil I braucht davon nichts, und die beiden teilen
  sich keinen Code außer der Positivliste der Formate.
* **0.8.60 — „Was ist offen, was ist neu"**: Ansicht „Offen" über alle
  Einträge, Filter „Neu seit …". Keine Schemaänderung.
* **0.8.70 — Sicherung und Papierkorb.** Sie liegt bewusst **nach** dieser
  Runde: der Papierkorb serialisiert einen Eintrag, und mit Videos wird das
  einmal gebaut statt einmal gebaut und einmal nachgezogen.
* **Die Vorschau der Rangfolge im Systembereich** aus 0.8.40 ist weiterhin
  offen und weiterhin vorgemerkt.
* **4.2 „Abgelehnt mit Datum und Begründung"** aus dem Ideenpapier ist
  weiterhin offen und weiterhin nicht zusammengelegt.
* **Eine Trusted-Proxy-Adressliste** aus 0.8.20 ist weiterhin nicht gebaut und
  bleibt vorgemerkt.
* **Umkodieren auf dem Server, Videos in Kommentaren, automatisches Abspielen
  und ein Video gleichzeitig als Anhang und am Fotoplatz** sind ausdrücklich
  abgelehnt — Abschnitt 16 des Videopapiers, und das bleibt so.
