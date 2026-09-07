/* ================= batchrun.js — DIE BESTANDSLAEUFE, IN EINEM EIGENEN THREAD ==

   WAS HIER LAEUFT UND WARUM ES NICHT MEHR IM HAUPT-THREAD LAEUFT.
   DREI Schleifen fahren ueber den ganzen Bildbestand: die Umstellung von PNG
   auf WebP (auf Knopfdruck), das Nachruesten fehlender Vorschaubilder und --
   seit 0.19.4 -- das Erneuern der Kacheln (beide einmal beim Start). Seit
   0.19.5 kommt eine VIERTE Aufgabe dazu, und sie ist keine Schleife: EINE
   Zeile, gerufen beim Speichern des Ausschnitts. Warum auch sie hier faehrt
   und nicht im Haupt-Thread, steht als Messung bei refreshOneTile(). Die ersten beiden lasen bis 0.19.2 im
   Haupt-Thread eine halbe Megabyte Blob, wandelten sie um und schrieben sie
   zurueck --
   `better-sqlite3` ist SYNCHRON, und jede seiner Zeilen haelt die
   Event Loop an. Die 30 ms Pause zwischen den Zeilen halfen dagegen
   nicht: sie liegt ZWISCHEN den Zeilen, und angehalten wird WAEHREND einer.

   GEMESSEN AM 2. SEPTEMBER 2026, als Verspaetung eines Taktgebers, der alle
   20 ms schlagen soll, waehrend 60 Fotozeilen a 512 kB gelesen und
   zurueckgeschrieben werden (400 Eintraege, 400 Fotos, 312 MB, Node 22, vier
   Kerne):

                                Median     95 %      groesste Verspaetung
     ohne Last                  0,7 ms     1,1 ms    20,0 ms
     im Haupt-Thread            0,9 ms   133,0 ms   200,1 ms
     in diesem Thread           0,5 ms     0,9 ms     1,3 ms

   DER MEDIAN SAGT NICHTS, DAS 95. PERZENTIL SAGT ALLES: zwischen den Zeilen
   ist der Haupt-Thread frei, waehrend einer steht er. Im Thread liegt die
   Verspaetung unter dem Rauschen des Leerlaufs.

   ZWEI SCHREIBER AUF EINER WAL-DATEI SIND NACHGEMESSEN UND NICHT BEFUERCHTET.
   Der Thread fuhr den Lauf, der Haupt-Thread schrieb daneben alle 25 ms eine
   Transaktion ueber fuenf Zeilen: 60 Zeilen und 88 Transaktionen gingen
   durch, NULL Abweisungen, die langsamste Schreibung 3,6 ms. Der Grund ist
   die Vorgabe von `better-sqlite3`: `busy_timeout` steht auf 5000 ms --
   abgelesen, nicht angenommen. Wer in WAL auf den Schreiblock wartet, wartet
   Millisekunden und wird nicht abgewiesen.

   DER SCHLUESSEL REIST NICHT MIT. Er kommt hier denselben Weg wie im
   Haupt-Thread -- ueber `keys.js` aus der Umgebung oder aus der Datei neben
   der Datenbank. Ein Schluessel, der durch eine Nachricht reist, staende in
   einem zweiten Speicher, und `workerData` wird beim Erzeugen des Threads
   strukturiert kopiert.

   WAS UEBER workerData KOMMT, SIND NUMMERN: welche Aufgabe zu fahren ist und
   welche Zeilen. Die Auswahl trifft der Haupt-Thread, weil er die Antwort auf
   den Knopfdruck sofort mit `gesamt` beschriften muss.
   BEIM NACHZIEHEN DER GEOMETRIE SCHICKT ER MEHR, ALS FAELLIG IST, und der
   Grund steht bei der Schleife: welche Zeile faellig ist, sagt erst der Kopf
   ihres `thumb`, und den zu lesen kostete im Haupt-Thread 275 bis 314 ms.

   DASS db.js HIER EIN ZWEITES MAL LAEUFT, IST NACHGESEHEN UND NICHT
   VORAUSGESETZT (siehe den Kasten ueber der eigenen Verbindung in db.js):
   alles darin ist doppelt ausfuehrbar. Still ist es dabei auch -- die
   Ansagen an den Betreiber macht der Haupt-Thread, und keys.js haelt sie im
   Neben-Thread zurueck.

   WAS HIER NICHT LAEUFT: maintainStorage(). Es fasst die ganze Datei an
   (VACUUM beim ersten Mal) und gehoert nicht in denselben Thread wie die
   Schleife; der Haupt-Thread ruft es weiterhin, nachdem dieser hier fertig
   ist. */
const os = require('os');
const { parentPort, workerData } = require('worker_threads');
const sharp = require('sharp');
/* DIESELBE ZAHL WIE IN server.js, und sie steht aus demselben Grund hier: ein
   Thread ist ein eigener Prozessraum fuer libvips-Einstellungen nicht, aber
   sharp wird in diesem Thread EIGENS geladen und traegt dort wieder seine
   Vorgabe. Wer sie nicht setzt, bekommt unter musl oder mit jemalloc die
   Kernzahl -- und ausgerechnet der Wartungslauf naehme sich dann die ganze
   Maschine (Stolperstein 278: os.cpus() ist im Container nicht das
   Kontingent). Gemessen laedt sharp im Thread in 76 ms. */
sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));
const { db } = require('./db');
const { makeVariants, isPng, storeImage, isUncropped } = require('./images');

/* WIE DER STAND ZURUECKREIST -- EINE MELDUNG JE ZEILE, UND SIE TRAEGT DEN
   GANZEN STAND.

   Eine Meldung am Ende waere zu wenig: die Karte im Systembereich fragt alle
   1500 ms nach und saehe waehrend des ganzen Laufs dieselbe Null. Eine
   Meldung je Zeile klingt nach viel und ist es nicht -- die Schleife legt
   zwischen zwei Zeilen ohnehin 30 ms Pause ein, es sind also hoechstens
   dreiunddreissig in der Sekunde, und jede traegt sechs Zahlen.

   SIE TRAEGT DEN STAND UND KEINE ZUNAHME, und das ist die eigentliche
   Entscheidung: der Haupt-Thread ERSETZT damit, statt zu addieren. Eine
   Zunahme muesste er aufsummieren, und dann haengt die angezeigte Zahl an der
   Vollstaendigkeit der Meldungsfolge; ein voller Stand kann gar nicht
   auseinanderlaufen. Zwei Wahrheiten ueber denselben Fortschritt gibt es so
   nicht (Stolperstein 47). */
const report = (status) => parentPort.postMessage({ kind: 'status', status });

/* ---- Die Umstellung von PNG auf WebP ----
   WORTGLEICH ZUR FASSUNG AUS 0.19.2, bis auf zwei Dinge: der Stand steht in
   einer oertlichen Abbildung statt in `umstellung` (das bleibt im
   Haupt-Thread), und er geht je Zeile als Meldung hinaus.
   JE BILD EINE EIGENE TRANSAKTION -- und dafuer steht hier bewusst KEIN
   db.transaction() um das einzelne UPDATE: eine einzelne Anweisung IST in
   SQLite ihre eigene Transaktion. Eine Klammer darum sagte, es geschehe mehr
   als eines, und das waere unwahr.
   WAS AUSDRUECKLICH NICHT PASSIERT: thumb und medium werden NICHT neu
   gerechnet. Sie sind aus demselben Bild entstanden und bleiben gueltig; ein
   Neurechnen kostete Zeit und aenderte nichts. */
async function convertInventory(rows) {
  const status = { running: true, total: rows.length, erledigt: 0,
                  umgestellt: 0, geblieben: 0, gespart: 0 };
  const get = db.prepare('SELECT data FROM photos WHERE id = ?');
  const write = db.prepare('UPDATE photos SET mime_type = ?, data = ? WHERE id = ?');
  for (const { id } of rows) {
    try {
      const z = get.get(id);
      // Die Zeile kann waehrend des Laufs geloescht oder schon umgestellt
      // worden sein. Beides ist kein Fehler -- nur nichts zu tun.
      if (z && isPng(z.data)) {
        const start = await storeImage(z.data, 'image/png');
        if (start.umgewandelt) {
          write.run(start.mime, start.data, id);
          status.umgestellt++;
          status.gespart += z.data.length - start.data.length;
        } else status.geblieben++;
      }
    } catch (e) {
      // EINE ZEILE REISST DEN LAUF NICHT AB. Sie bleibt, wie sie ist, wird
      // gezaehlt und genannt -- dieselbe Regel wie beim Nachruesten der
      // Vorschaubilder.
      status.geblieben++;
      console.error(`[Kriterion] Foto ${id} nicht umgestellt:`, e.message);
    }
    status.erledigt++;
    report(status);
    await new Promise(r => setTimeout(r, 30));
  }
  status.running = false;
  /* reclaim() DANACH, UND ES LAEUFT IM THREAD. Ohne ihn waechst die Datei
     erst und schrumpft nie: die alten Blobs geben ihre Seiten frei, aber
     SQLite gibt sie ohne incremental_vacuum nicht ans Dateisystem zurueck.
     Dieselbe Ueberlegung wie beim Papierkorb.
     DASS ER AUS EINEM ZWEITEN THREAD DURCHKOMMT, IST NACHGEMESSEN:
     wal_checkpoint(TRUNCATE) braucht, dass kein anderer mehr in der Datei
     LIEST -- der Haupt-Thread las waehrenddessen alle 20 ms weiter, und der
     Punkt kam trotzdem durch: { busy: 0, log: 0, checkpointed: 0 }, WAL von
     720 kB auf 0, 24 ms. `busy: 0` heisst durchgekommen; waere er es nicht,
     stuende dort eine 1 und die WAL-Datei bliebe stehen. Die drei Nullen
     danach sind kein Fehler: nach dem Kuerzen ist nichts mehr da, was zu
     uebertragen waere. */
  reclaim();
  report(status);
  console.log(`[Kriterion] Bildumstellung fertig: ${status.umgestellt} von ` +
    `${status.total} umgestellt, ${status.geblieben} blieben PNG, ` +
    `${status.gespart} Bytes gespart.`);
}

/* ---- WORAUS EINE ZEILE IHRE KACHEL ENTSTEHT -- 0.19.5 ----

   ZWEI SCHLEIFEN UND EINE ROUTE FRAGEN DASSELBE, also steht es einmal.
   `cropFrom()` macht aus den drei Spalten das Rezept, `sourceFrom()`
   sagt, aus welchem Blob sie erzeugt wird.

   AM FOTO IST DIE VORLAGE `data` -- das Original. AM VIDEO STEHT DORT DIE
   VIDEODATEI, und der Kernsatz gilt weiter: der Server oeffnet nie ein
   Video. Seine Vorlage ist `medium`, die Ableitung seines Standbilds; das
   Standbild selbst kommt vom Browser und liegt nirgends mehr.
   WAS DAS KOSTET, UND ES GEHOERT GENANNT: die Videokachel entsteht damit aus
   einem JPEG, das schon eines war -- eine zweite Kodierung. Sie faellt EINMAL
   an (danach ist die Kachel quadratisch und der Lauf laesst sie in Ruhe), und
   sie kauft zwei Dinge: bei `zoom > 100` zeigt die Kachel wieder den
   eingestellten Ausschnitt (ohne sie zeigte sie nach dieser Runde den
   Mittenschnitt, denn der CSS-Zuschnitt ist weg), und bei `zoom = 100` faellt
   sie von 910 x 512 auf 512 x 512 -- dasselbe Bild, weniger Bytes.
   IHRE KANTE FAELLT DABEI UNTER 512, wenn eng gezogen wird: aus einem
   1600 x 900 grossen `medium` wird bei `zoom` 235 eine 383er Kachel. Das ist
   weniger als die 512 eines Fotos und immer noch mehr, als heute zu sehen
   ist. Mehr gibt die Zeile nicht her.

   `medium` WIRD AM VIDEO NICHT MITGESCHRIEBEN. makeVariants() rechnet es
   zwar, aber es entstuende aus sich selbst -- eine dritte JPEG-Kodierung
   desselben Standbilds, die kein Bildpunkt besser wird. Eine Ableitung, die
   schlechter ist als die alte, gibt es nicht. */
const isVideoRow = (z) => z && z.kind === 'video';
const sourceFrom = (z) => (isVideoRow(z) ? z.medium : z.data);
const cropFrom = (z) => ({ fx: Number(z.focus_x), fy: Number(z.focus_y),
                               zoom: Number(z.zoom) });

/* ---- Die fehlenden Vorschaubilder nachruesten ----
   AUSDRUECKLICH NUR BILDER. Eine Videozeile traegt in data die Videodatei --
   sharp liefe darauf in einen Fehler, beide Varianten kaemen leer zurueck und
   das vorhandene Standbild waere ueberschrieben. Die Zeile bliebe ausserdem
   bei jedem Start aufs Neue faellig. Und der Kernsatz gilt auch hier: der
   Server oeffnet nie ein Video.  Das Standbild kommt vom Browser.
   WELCHE ZEILEN OFFEN SIND, FRAGT DER HAUPT-THREAD -- er faellt sonst gar
   nicht auf, dass es nichts zu tun gibt, und erzeugte einen Thread fuer eine
   leere Liste. */
async function backfillThumbnails(rows) {
  console.log(`[Kriterion] Erzeuge Vorschaubilder für ${rows.length} Foto(s) ...`);
  /* DER ZUSCHNITT GEHT MIT -- 0.19.5. Eine Zeile, der die Ableitung fehlt,
     traegt ihre drei Zahlen trotzdem (sie stehen in eigenen Spalten und nicht
     im Bild); ohne sie entstuende hier eine ungeschnittene Kachel, die der
     Lauf gleich danach ein zweites Mal anfassen muesste. */
  const get = db.prepare(
    'SELECT data, kind, medium, focus_x, focus_y, zoom FROM photos WHERE id = ?');
  const upd = db.prepare('UPDATE photos SET thumb = ?, medium = ? WHERE id = ?');
  let done = 0;
  for (const { id } of rows) {
    try {
      const row = get.get(id);
      if (!row) continue;
      const v = await makeVariants(row.data, cropFrom(row));
      upd.run(v.thumb, v.medium, id);
      done++;
    } catch (e) { console.error(`[Kriterion] Foto ${id} übersprungen:`, e.message); }
    await new Promise(r => setTimeout(r, 30));
  }
  console.log(`[Kriterion] ${done} Vorschaubild(er) erzeugt.`);
}

/* ---- Die Kacheln erneuern -- 0.19.4 als Geometrie, seit 0.19.5 als Zuschnitt --

   DIE DRITTE AUFGABE, UND SIE IST DIE ERSTE, DIE ETWAS ERSETZT statt etwas
   zu ergaenzen. Das Nachruesten fuellt leere Spalten, die Umstellung
   verschiebt ein Format -- hier wird eine gueltige Ableitung durch eine
   bessere ersetzt. Deshalb steht hier alles, was der Umstellung auch
   zusteht: eine Meldung je Zeile, reclaim() am Ende und ein Fehler, der die
   Zeile kostet und nicht den Lauf.

   SIE IST ERWEITERT UND NICHT VERDOPPELT -- 0.19.5. Bis 0.19.4 zog sie die
   Ableitung auf die neue Geometrie nach; ab jetzt RECHNET sie den eingestellten
   Ausschnitt hinein. Es ist dieselbe Schleife, dieselbe Aufgabe (`geometrie`)
   und dieselbe Fortschrittszeile: was sich geaendert hat, ist die Frage, wann
   eine Zeile faellig ist, und was makeVariants() mitbekommt.
   WARUM SIE MIT DIESER RUNDE EIN ZWEITES MAL UEBER DEN BESTAND FAEHRT: der
   CSS-Zuschnitt im Browser faellt in derselben Runde weg. Eine Zeile mit
   `zoom > 100` zeigte danach den falschen Ausschnitt, und zwar sofort nach
   dem Einspielen. Wer nur eine der beiden Haelften baut, schneidet zweimal
   oder gar nicht.

   WARUM AUCH DIE ZEILEN MIT `zoom = 100` MITKOMMEN, obwohl sich an ihrem
   BILD nichts aendert: erstens, weil die Frage sonst kein Festpunkt waere --
   „quadratisch" ist eine Zusage ueber die Kachel und nicht ueber die Zeile,
   und eine Regel mit zwei Zweigen faellt an der ersten kleinen Vorlage
   zurueck. Zweitens, weil es Bytes SPART: gemessen an 36 nachgebauten
   Vorlagen in zwoelf Seitenverhaeltnissen faellt die Summe der Kacheln um
   34,2 % (im Mittel 34,8 -> 22,9 kB). Bei 16:9 sind es -44 %, bei 21:9 -58 %,
   an den beiden Kameras des Bestands -26 bzw. -33 %.
   DIE EINE AUSNAHME IST DAS PANORAMA, und sie gehoert genannt: ein 32:9-Foto
   lag als 1280 x 180 (230k Bildpunkte) und wird 512 x 512 (262k) -- gemessen
   zwischen -10 % und +116 %, je nachdem, wie viel Struktur darin steckt.
   ES IST TROTZDEM RICHTIG: seine Kachel war bis heute um das 1,66fache
   hochgezogen (180 Bildpunkte auf 299 CSS-Punkte), und danach ist sie scharf.

   WAS DER HAUPT-THREAD SCHICKT, SIND DIE NUMMERN ALLER ZEILEN MIT EINER
   ABLEITUNG -- nicht die der faelligen. Das ist die eine Abweichung vom
   Auftrag 0.19.4, und sie steht auf einer Messung: die Nummern zu holen
   kostet 0,5 ms, aber die 1032 `thumb` zu lesen und sharp nach ihren Massen
   zu fragen kostet 275 bis 314 ms. Im Haupt-Thread waere das das Doppelte
   dessen, was 0.19.3 gerade weggeraeumt hat (133 ms im 95. Perzentil), und
   zwar bei jedem Start. HIER kostet es nichts, was jemand merkt.
   DER PREIS DAVON IST EHRLICH ZU NENNEN: ein Thread entsteht auch dann, wenn
   nichts zu tun ist -- 19 ms Verbindung und 76 ms sharp, einmal je Start.

   ZWEIMAL WIRD GEZAEHLT, UND DAS IST KEINE DOPPELUNG: `geprueft` sind die
   Zeilen, deren Kopf gelesen wurde, `nachgezogen` die, die wirklich eine
   neue Ableitung bekommen haben. Ein Lauf, der 1032 prueft und 0 nachzieht,
   ist der Normalfall nach dem ersten Durchgang -- und er sagt das dann auch,
   statt „1032 erledigt" zu melden.

   `medium` WIRD AM FOTO MITGESCHRIEBEN UND AENDERT SICH NICHT. makeVariants()
   rechnet beide Ableitungen, und ein zweiter Weg, der nur `thumb` schreibt,
   waere eine zweite Wahrheit ueber die Ableitung (Stolperstein 47). Was
   herauskommt, ist fuer `medium` dasselbe Bild wie vorher -- die Kiste ist
   dort unveraendert, und geschnitten wird es ausdruecklich nicht.
   AM VIDEO WIRD ES NICHT MITGESCHRIEBEN, und der Grund steht oben bei
   sourceFrom(): dort IST `medium` die Vorlage, und es aus sich selbst neu zu
   kodieren machte es nur schlechter. */
async function refreshTiles(rows) {
  const status = { running: true, total: rows.length, erledigt: 0,
                  geprueft: 0, nachgezogen: 0, uebersprungen: 0, zugenommen: 0 };
  const get = db.prepare(
    'SELECT data, thumb, medium, kind, focus_x, focus_y, zoom FROM photos WHERE id = ?');
  for (const { id } of rows) {
    try {
      const z = get.get(id);
      /* DIE ZEILE KANN WAEHRENDDESSEN VERSCHWUNDEN SEIN oder ihre Ableitung
         verloren haben. Beides ist kein Fehler -- ohne `thumb` ist sie Sache
         des Nachruestens und nicht dieses Laufs. */
      if (z && z.thumb) {
        status.geprueft++;
        if (await isUncropped(z.thumb)) {
          const grown = await refreshRow(id, z);
          if (grown === null) status.uebersprungen++;
          else { status.nachgezogen++; status.zugenommen += grown; }
        }
      }
    } catch (e) {
      status.uebersprungen++;
      console.error(`[Kriterion] Foto ${id} nicht nachgezogen:`, e.message);
    }
    status.erledigt++;
    report(status);
    /* DIESELBEN 30 ms WIE IN DEN ANDEREN BEIDEN SCHLEIFEN. Sie sind im Thread
       nicht mehr noetig, um den Haupt-Thread zu schonen -- sie halten aber
       die Maschine frei, auf der auch noch etwas anderes laufen darf. */
    await new Promise(r => setTimeout(r, 30));
  }
  status.running = false;
  /* reclaim() AUS DEMSELBEN GRUND WIE BEI DER UMSTELLUNG: jede ersetzte
     Ableitung gibt ihre alten Seiten frei, und ohne incremental_vacuum gibt
     SQLite sie nicht ans Dateisystem zurueck. Ob der neue `thumb` groesser
     oder kleiner ist als der alte, aendert daran nichts -- die Datei waechst
     oder schrumpft dann eben um die Differenz und nicht um die Summe. */
  reclaim();
  report(status);
  console.log(`[Kriterion] Kacheln erneuert: ${status.nachgezogen} von ` +
    `${status.geprueft} geprüften Zeilen, ${status.uebersprungen} übersprungen, ` +
    `${status.zugenommen} Bytes mehr.`);
}

/* ---- EINE ZEILE ERNEUERN -- die Stelle, an der beide Rufer zusammenkommen ---

   DIE SCHLEIFE OBEN RUFT SIE JE FAELLIGER ZEILE, DIE AUFGABE `zuschnitt`
   GENAU EINMAL. Zwei Fassungen davon liefen frueher oder spaeter auseinander,
   und die eine schriebe dann etwas anderes als die andere (Stolperstein 47).

   ZURUECK KOMMT DIE DIFFERENZ IN BYTES ODER null. `null` heisst „nicht
   geschrieben" und ist kein Fehler, sondern das Ergebnis: eine Vorlage, an
   der sharp scheitert, darf die vorhandene Kachel NICHT ersetzen -- danach
   stuende NULL in einer Spalte, die vorher ein Bild trug, und die Zeile waere
   beim naechsten Start ein Fall fuers Nachruesten. Eine Ableitung, die
   schlechter ist als keine, gibt es nicht; eine, die schlechter ist als die
   alte, schon.

   DIE VIDEOZEILE BEKOMMT NUR IHRE KACHEL. Ihr `medium` ist die Vorlage --
   siehe sourceFrom() weiter oben. */
const writeBoth = db.prepare('UPDATE photos SET thumb = ?, medium = ? WHERE id = ?');
const writeTile = db.prepare('UPDATE photos SET thumb = ? WHERE id = ?');
async function refreshRow(id, z) {
  const source = sourceFrom(z);
  if (!source) return null;
  const v = await makeVariants(source, cropFrom(z));
  if (!v.thumb) return null;
  if (isVideoRow(z)) writeTile.run(v.thumb, id);
  else writeBoth.run(v.thumb, v.medium || null, id);
  return v.thumb.length - (z.thumb ? z.thumb.length : 0);
}

/* ---- Die vierte Aufgabe: EINE Zeile, auf ausdruecklichen Knopfdruck -- 0.19.5

   WARUM SIE UEBERHAUPT IN DEN THREAD GEHT, und das ist eine Messung und kein
   Geschmack. Der Auftrag setzt die Grenze bei rund 150 ms: darunter lohnt der
   Thread seine 19 ms Verbindung und 76 ms sharp nicht, darueber schon.

   ERSTENS DAS ERZEUGEN SELBST. Gemessen an fuenf Vorlagen in den Massen und
   Bytes des echten Bestands (5,4 bis 12,7 MB, 4032x3024 und 6192x4128), je
   fuenf Durchgaenge, vier Kerne: rotate + extract + resize + mozjpeg kostet
   im Median 157,3 ms und im 95. Perzentil 247,0 ms. Ohne den Zuschnitt sind
   es 113,4 / 189,5 ms -- der Zuschnitt kostet also nicht das Kodieren,
   sondern das DEKODIEREN: `extract` nimmt libjpeg sein Shrink-on-Load, mit
   dem es sonst gleich in 1/2, 1/4 oder 1/8 der Masse dekodiert. Am teuersten
   ist deshalb `zoom = 100`, wo der Ausschnitt am groessten ist -- nicht
   `zoom = 400`.

   ZWEITENS, UND DAS IST DER GROESSERE POSTEN: DAS ZURUECKSCHREIBEN. An einer
   frisch geoeffneten, verschluesselten Datei mit 12,7-MB-Originalen:

     sharp laden          51,9 ms      Blob lesen (12,7 MB)   67,4 ms
     db-Modul laden        2,6 ms      erzeugen              175,4 ms
     Datei oeffnen         3,2 ms      Kachel schreiben      473,7 ms
                                       ------------------------------
                                       zusammen              774,5 ms

   473,7 ms fuer 20 kB Kachel -- WEIL SQLITE DEN GANZEN SATZ NEU SCHREIBT und
   der das Original traegt. Nachgemessen an fuenf Groessen in einer warmen
   Datei: 1,3 ms bei 0,05 MB, 2,8 bei 0,5, 8,7 bei 2, 23,4 bei 6 und 48,2 bei
   12,7 MB -- linear in der Groesse des ORIGINALS und nicht in der der Kachel.
   Der Rest bis 473,7 ms ist der kalte Seitencache: `cache_size` steht auf
   2 MB, ein 12,7-MB-Satz passt nicht hinein und wird zum Schreiben ein
   zweites Mal gelesen und entschluesselt.
   UND DESHALB WIRD `medium` MITGESCHRIEBEN UND NICHT GESPART: `SET thumb` und
   `SET thumb, medium` kosten dasselbe (48,2 gegen 49,2 ms bei 12,7 MB). Ein
   zweiter Schreibweg fuer den Einzelfall waere eine zweite Wahrheit fuer
   1 ms.

   AN DER ROUTE GEMESSEN, also von der Anfrage bis zur Antwort: 494 bis 873 ms
   ueber fuenfzehn Faelle. DER MEDIAN LIEGT WEIT UEBER DER GRENZE -- also
   Thread, und zwar nicht knapp. Dieselbe Lesart wie in 0.19.3: der Median
   sagt nichts, das 95. Perzentil sagt alles. Im Haupt-Thread staende die
   Event Loop dafuer fuenfmal so lange wie die 133 ms, die 0.19.3 gerade
   freigeraeumt hat.

   GEMESSEN UND VERWORFEN: den Zuschnitt NACH der Skalierung zu nehmen (das
   ganze Bild so skalieren, dass der Ausschnitt genau 512 traegt, dann
   herausschneiden) haelt das Shrink-on-Load und kostet im Median 148,7 ms --
   also fast dasselbe, denn bei weitem Ausschnitt spart es und bei engem
   skaliert es das ganze Bild unnoetig gross. Die Bytes sind auf 0,5 % gleich.
   Es waere eine zweite Rechnung mit zwei zusaetzlichen Rundungen fuer nichts.

   DER STAND REIST HIER NICHT ZURUECK. Es gibt keine Karte, die ihn zeigte --
   der Benutzer wartet vor einem Knopf und nicht vor einer Fortschrittszeile.
   Gemeldet wird das Ergebnis, damit der Haupt-Thread weiss, ob er die
   Antwort mit einer neuen Fassung beschriften darf. */
async function refreshOneTile(rows) {
  const id = rows && rows[0] && rows[0].id;
  const z = id ? db.prepare(
    'SELECT data, thumb, medium, kind, focus_x, focus_y, zoom FROM photos WHERE id = ?')
    .get(id) : null;
  let ok = false;
  if (z) {
    try { ok = await refreshRow(id, z) !== null; }
    catch (e) { console.error(`[Kriterion] Kachel ${id} nicht erneuert:`, e.message); }
  }
  parentPort.postMessage({ kind: 'refreshed', id, ok });
}

/* DIESELBE SPEICHERPFLEGE WIE IN server.js, und sie steht in beiden Dateien:
   sie besteht aus zwei Pragmas auf DER EIGENEN VERBINDUNG, und eine Verbindung
   laesst sich nicht ueber eine Threadgrenze reichen. Was hier steht, ist keine
   zweite Wahrheit ueber dasselbe, sondern derselbe Satz an zwei Verbindungen.
   Der Abschluss darf nichts werfen -- die Datei ist geschrieben, und ein
   misslungenes Aufraeumen macht sie nicht schlechter. */
function reclaim() {
  try { db.pragma('incremental_vacuum'); db.pragma('wal_checkpoint(TRUNCATE)'); } catch {}
}

/* DER THREAD FAEHRT GENAU EINE AUFGABE UND ENDET DANN. Kein Threadpool, kein
   Dauerlaeufer: Nachruesten und Nachziehen laufen einmal beim Start, die
   Umstellung auf Knopfdruck. Ein Dauerlaeufer hielte fuer diese drei Laeufe
   eine zweite Verbindung auf die Datenbank offen, solange der Server laeuft.
   DIE VERBINDUNG WIRD GESCHLOSSEN, bevor der Thread endet: eine offene
   Verbindung, die mit dem Thread verschwindet, laesst ihre WAL-Seiten liegen.
   parentPort.close() DANACH -- ohne ihn haelt der offene Kanal den Thread am
   Leben, und der Haupt-Thread bekaeme sein 'exit' nie. */
(async () => {
  if (workerData.task === 'umstellung') await convertInventory(workerData.rows);
  else if (workerData.task === 'vorschaubilder') await backfillThumbnails(workerData.rows);
  else if (workerData.task === 'geometrie') await refreshTiles(workerData.rows);
  else if (workerData.task === 'zuschnitt') await refreshOneTile(workerData.rows);
  else throw new Error(`Unbekannte Aufgabe: ${workerData.task}`);
  db.close();
  parentPort.close();
})();
