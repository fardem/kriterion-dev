/* ================= bestandslauf.js — DIE BESTANDSLAEUFE, IN EINEM EIGENEN THREAD ==

   WAS HIER LAEUFT UND WARUM ES NICHT MEHR IM HAUPT-THREAD LAEUFT.
   DREI Schleifen fahren ueber den ganzen Bildbestand: die Umstellung von PNG
   auf WebP (auf Knopfdruck), das Nachruesten fehlender Vorschaubilder und --
   seit 0.19.4 -- das Nachziehen der Vorschaubilder auf die neue Geometrie
   (beide einmal beim Start). Die ersten beiden lasen bis 0.19.2 im
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
const { makeVariants, istPNG, legeBildAb, istAlteAbleitung } = require('./bilder');

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
const melde = (stand) => parentPort.postMessage({ art: 'stand', stand });

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
async function stelleBestandUm(zeilen) {
  const stand = { laeuft: true, gesamt: zeilen.length, erledigt: 0,
                  umgestellt: 0, geblieben: 0, gespart: 0 };
  const hole = db.prepare('SELECT data FROM photos WHERE id = ?');
  const schreib = db.prepare('UPDATE photos SET mime_type = ?, data = ? WHERE id = ?');
  for (const { id } of zeilen) {
    try {
      const z = hole.get(id);
      // Die Zeile kann waehrend des Laufs geloescht oder schon umgestellt
      // worden sein. Beides ist kein Fehler -- nur nichts zu tun.
      if (z && istPNG(z.data)) {
        const ab = await legeBildAb(z.data, 'image/png');
        if (ab.umgewandelt) {
          schreib.run(ab.mime, ab.data, id);
          stand.umgestellt++;
          stand.gespart += z.data.length - ab.data.length;
        } else stand.geblieben++;
      }
    } catch (e) {
      // EINE ZEILE REISST DEN LAUF NICHT AB. Sie bleibt, wie sie ist, wird
      // gezaehlt und genannt -- dieselbe Regel wie beim Nachruesten der
      // Vorschaubilder.
      stand.geblieben++;
      console.error(`[Kriterion] Foto ${id} nicht umgestellt:`, e.message);
    }
    stand.erledigt++;
    melde(stand);
    await new Promise(r => setTimeout(r, 30));
  }
  stand.laeuft = false;
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
  melde(stand);
  console.log(`[Kriterion] Bildumstellung fertig: ${stand.umgestellt} von ` +
    `${stand.gesamt} umgestellt, ${stand.geblieben} blieben PNG, ` +
    `${stand.gespart} Bytes gespart.`);
}

/* ---- Die fehlenden Vorschaubilder nachruesten ----
   AUSDRUECKLICH NUR BILDER. Eine Videozeile traegt in data die Videodatei --
   sharp liefe darauf in einen Fehler, beide Varianten kaemen leer zurueck und
   das vorhandene Standbild waere ueberschrieben. Die Zeile bliebe ausserdem
   bei jedem Start aufs Neue faellig. Und der Kernsatz gilt auch hier: der
   Server oeffnet nie ein Video.  Das Standbild kommt vom Browser.
   WELCHE ZEILEN OFFEN SIND, FRAGT DER HAUPT-THREAD -- er faellt sonst gar
   nicht auf, dass es nichts zu tun gibt, und erzeugte einen Thread fuer eine
   leere Liste. */
async function ruesteVorschaubilderNach(zeilen) {
  console.log(`[Kriterion] Erzeuge Vorschaubilder für ${zeilen.length} Foto(s) ...`);
  const get = db.prepare('SELECT data FROM photos WHERE id = ?');
  const upd = db.prepare('UPDATE photos SET thumb = ?, medium = ? WHERE id = ?');
  let done = 0;
  for (const { id } of zeilen) {
    try {
      const row = get.get(id);
      if (!row) continue;
      const v = await makeVariants(row.data);
      upd.run(v.thumb, v.medium, id);
      done++;
    } catch (e) { console.error(`[Kriterion] Foto ${id} übersprungen:`, e.message); }
    await new Promise(r => setTimeout(r, 30));
  }
  console.log(`[Kriterion] ${done} Vorschaubild(er) erzeugt.`);
}

/* ---- Die Vorschaubilder mit der neuen Geometrie nachziehen -- 0.19.4 ----

   DIE DRITTE AUFGABE, UND SIE IST DIE ERSTE, DIE ETWAS ERSETZT statt etwas
   zu ergaenzen. Das Nachruesten fuellt leere Spalten, die Umstellung
   verschiebt ein Format -- hier wird eine gueltige Ableitung durch eine
   bessere ersetzt. Deshalb steht hier alles, was der Umstellung auch
   zusteht: eine Meldung je Zeile, reclaim() am Ende und ein Fehler, der die
   Zeile kostet und nicht den Lauf.

   WAS DER HAUPT-THREAD SCHICKT, SIND DIE NUMMERN ALLER FOTOZEILEN MIT EINER
   ABLEITUNG -- nicht die der faelligen. Das ist die eine Abweichung vom
   Auftrag, und sie steht auf einer Messung: die Nummern zu holen kostet
   0,5 ms, aber die 1032 `thumb` zu lesen und sharp nach ihren Massen zu
   fragen kostet 275 bis 314 ms. Im Haupt-Thread waere das das Doppelte
   dessen, was 0.19.3 gerade weggeraeumt hat (133 ms im 95. Perzentil), und
   zwar bei jedem Start. HIER kostet es nichts, was jemand merkt.
   DER PREIS DAVON IST EHRLICH ZU NENNEN: ein Thread entsteht auch dann, wenn
   nichts zu tun ist -- 19 ms Verbindung und 76 ms sharp, einmal je Start.
   Gegen 275 ms im Haupt-Thread ist das der bessere Handel.

   ZWEIMAL WIRD GEZAEHLT, UND DAS IST KEINE DOPPELUNG: `geprueft` sind die
   Zeilen, deren Kopf gelesen wurde, `nachgezogen` die, die wirklich eine
   neue Ableitung bekommen haben. Ein Lauf, der 1032 prueft und 0 nachzieht,
   ist der Normalfall nach dem ersten Durchgang -- und er sagt das dann auch,
   statt „1032 erledigt" zu melden.

   `medium` WIRD MITGESCHRIEBEN UND AENDERT SICH NICHT. makeVariants() rechnet
   beide Ableitungen, und ein zweiter Weg, der nur `thumb` schreibt, waere
   eine zweite Wahrheit ueber die Ableitung (Stolperstein 47). Was
   herauskommt, ist fuer `medium` dasselbe Bild wie vorher -- die Kiste ist
   dort unveraendert. */
async function zieheVorschaubilderNach(zeilen) {
  const stand = { laeuft: true, gesamt: zeilen.length, erledigt: 0,
                  geprueft: 0, nachgezogen: 0, uebersprungen: 0, zugenommen: 0 };
  const hole = db.prepare('SELECT data, thumb FROM photos WHERE id = ?');
  const schreib = db.prepare('UPDATE photos SET thumb = ?, medium = ? WHERE id = ?');
  for (const { id } of zeilen) {
    try {
      const z = hole.get(id);
      /* DIE ZEILE KANN WAEHRENDDESSEN VERSCHWUNDEN SEIN oder ihre Ableitung
         verloren haben. Beides ist kein Fehler -- ohne `thumb` ist sie Sache
         des Nachruestens und nicht dieses Laufs. */
      if (z && z.thumb) {
        stand.geprueft++;
        if (await istAlteAbleitung(z.thumb)) {
          const v = await makeVariants(z.data);
          /* NUR SCHREIBEN, WENN WIRKLICH ETWAS HERAUSKAM. Kommt `thumb` leer
             zurueck -- eine Vorlage, an der sharp scheitert --, stuende sonst
             danach NULL in einer Spalte, die vorher ein Bild trug, und die
             Zeile waere beim naechsten Start ein Fall fuers Nachruesten.
             Eine Ableitung, die schlechter ist als keine, gibt es nicht;
             eine, die schlechter ist als die alte, schon. */
          if (v.thumb) {
            schreib.run(v.thumb, v.medium || null, id);
            stand.nachgezogen++;
            stand.zugenommen += v.thumb.length - z.thumb.length;
          } else stand.uebersprungen++;
        }
      }
    } catch (e) {
      stand.uebersprungen++;
      console.error(`[Kriterion] Foto ${id} nicht nachgezogen:`, e.message);
    }
    stand.erledigt++;
    melde(stand);
    /* DIESELBEN 30 ms WIE IN DEN ANDEREN BEIDEN SCHLEIFEN. Sie sind im Thread
       nicht mehr noetig, um den Haupt-Thread zu schonen -- sie halten aber
       die Maschine frei, auf der auch noch etwas anderes laufen darf. */
    await new Promise(r => setTimeout(r, 30));
  }
  stand.laeuft = false;
  /* reclaim() AUS DEMSELBEN GRUND WIE BEI DER UMSTELLUNG: jede ersetzte
     Ableitung gibt ihre alten Seiten frei, und ohne incremental_vacuum gibt
     SQLite sie nicht ans Dateisystem zurueck. Dass der neue `thumb` groesser
     ist als der alte, aendert daran nichts -- die Datei waechst dann eben um
     die Zunahme und nicht um die Summe aus alt und neu. */
  reclaim();
  melde(stand);
  console.log(`[Kriterion] Vorschaubilder nachgezogen: ${stand.nachgezogen} von ` +
    `${stand.geprueft} geprüften Zeilen, ${stand.uebersprungen} übersprungen, ` +
    `${stand.zugenommen} Bytes mehr.`);
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
  if (workerData.aufgabe === 'umstellung') await stelleBestandUm(workerData.zeilen);
  else if (workerData.aufgabe === 'vorschaubilder') await ruesteVorschaubilderNach(workerData.zeilen);
  else if (workerData.aufgabe === 'geometrie') await zieheVorschaubilderNach(workerData.zeilen);
  else throw new Error(`Unbekannte Aufgabe: ${workerData.aufgabe}`);
  db.close();
  parentPort.close();
})();
