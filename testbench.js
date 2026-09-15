/* Kriterion — Pruefstand: der Treiber
 *
 *   node testbench.js            alles
 *   node testbench.js Rechte     nur die Module mit "Rechte" im Gruppennamen
 *
 * DIE PRUEFLAGEN LIEGEN IN test/, ein Modul je Sachgebiet — 0.34.0. Diese
 * Datei startet sie, sammelt ihre Zahlen ein und schreibt den Schlussblock.
 * Der gemeinsame Rahmen steht in test/rahmen.js, der Rahmen der
 * Oberflaechenpruefungen in test/dom.js.
 *
 * WARUM JE EIN PROZESS: buildDom() baut ein vollstaendiges jsdom-Fenster,
 * und der Speicher kommt nach w.close() nicht herunter -- rund zehn Megabyte
 * je Fenster. In einer einzigen Datei summierte sich das auf 2842 MB
 * (gemessen am 15. September 2026); ein Prozess gibt seinen Speicher beim
 * Ende an das Betriebssystem zurueck.
 *
 * EIN TEILLAUF STARTET NUR DIE MODULE, DIE ER ZEIGT. Bis 0.33.2 nahm der
 * Filter die Ausgabe weg und nicht die Arbeit; seit 0.34.0 nimmt er beides.
 *
 * Laeuft gegen echte Server mit echter, verschluesselter Datenbank in
 * Wegwerfverzeichnissen; der Bestand unter data/ wird nicht angefasst.
 * Die Oberflaechenpruefungen brauchen jsdom:  npm install
 */
const H = require('./test/rahmen.js');
const {
  fs, os, path, spawn, spawnSync, FILTER, group, check, endBlock, returnValue,
  equal, CASES, SMTP_CASES, SMTP_BASE, SMTP_WIDTH, LANGUAGE_BASE, LANGUAGE_WIDTH,
  FINGERPRINT_BASE, PORT_WIDTH, PORT_OFFSET, MAIN_BASE, MAIN_WIDTH,
  OFFSET_LEVEL, OFFSET_TRACES, endKind, sweepLeftovers, pruefstandDateien
} = H;

/* ================= EIN MODUL FAEHRT ALS EIGENER PROZESS -- 0.34.0 =========
   DAS IST DER GANZE PUNKT DER RUNDE. Ein Modul in einem eigenen Prozess gibt
   seinen Speicher beim Ende an das Betriebssystem zurueck; eine einzige Datei
   kann das nicht. Gemessen am 15. September 2026 am Stand vor dem Umzug:
   2842 MB Spitze, und die Kurve kam nie wieder herunter.

   NACHEINANDER UND NICHT NEBENEINANDER. Damit bleiben alle Portbasen, wie sie
   sind: die Spanne waechst nicht, der Versatz bleibt gueltig, und der
   Waechter "Die Portbasen und der Versatz" rechnet dieselbe Rechnung wie
   vorher. Nebenlaeufig braeuchte jedes Modul ein eigenes Fenster, und die
   Spanne spraenge den Versatz (Stolperstein 127).

   DIE ZAHLEN KOMMEN UEBER EINE DATEI ZURUECK und nicht ueber die Ausgabe:
   counterproof.js liest die Ausgabe und erkennt Gruppen an "-- " am
   Zeilenanfang und rote Punkte an zwei Leerzeichen vor einem Kreuz. Eine
   Meldezeile dazwischen waere eine dritte Sorte Zeile.

   DER FILTER GEHT MIT: ein gestartetes Modul filtert seine eigenen Gruppen
   genau so, wie es frueher der eine Lauf getan hat. */
const MELDEORDNER = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-meldung-'));
const MODULLAGE = [];

function modulFahren(name) {
  const weg = path.join(MELDEORDNER, name + '.json');
  const r = spawnSync(process.execPath,
    [path.join('test', name + '.js'), ...(FILTER ? [FILTER] : [])],
    { cwd: __dirname, stdio: 'inherit',
      env: { ...process.env, PRUEFSTAND_MELDUNG: weg } });
  /* KEINE MELDUNG IST EIN FUND UND KEIN LEERER LAUF. Ein Modul, das gar nicht
     erst startet, liefe sonst als "null Pruefungen" durch, und der Lauf bliebe
     gruen -- genau der stille Fehlschluss aus Stolperstein 81. */
  let stand = null;
  try { stand = JSON.parse(fs.readFileSync(weg, 'utf8')); } catch {}
  if (!stand) {
    console.log(`\n  ✗ Das Modul ${name} hat keine Zahlen gemeldet` +
      `\n      Rueckgabewert ${r.status}, Signal ${r.signal}`);
    H.zaehlerDazu({ passedCount: 0, failed: 1, skipped: 0, stillPassed: 0,
                    stillFailed: 0, groupsShown: 0, groupsStill: 0, zeiten: [] });
    MODULLAGE.push({ modul: name, faelle: [], smtp: [],
                     abbruch: `kein Ergebnis (Code ${r.status}, Signal ${r.signal})` });
    return;
  }
  H.zaehlerDazu(stand);
  MODULLAGE.push(stand);
  if (stand.abbruch)
    console.log(`\n  ✗ Das Modul ${name} ist abgebrochen: ${stand.abbruch}`);
}

/* ================= DIE MODULE UND IHRE REIHENFOLGE =================
   SIE IST DIE DES EINEN LAUFS VON FRUEHER, soweit sie sich halten laesst:
   erst der Rundlauf, dann die Waechter ueber den Quelltext, dann die
   Oberflaeche, dann die Prueflagen mit eigenen Instanzen, zuletzt der
   Pruefstand ueber sich selbst.
   DIE BEIDEN LETZTEN GRUPPEN STEHEN IM TREIBER und nicht in einem Modul:
   sie rechnen ueber ALLE Module -- die Portbasen und die Server, die keiner
   zurueckgelassen haben darf. Ein Modul kann das nicht sagen. */
const MODULE = [
  'rundlauf',
  'quelltext',
  'oberflaeche_uebersicht',
  'oberflaeche_eintrag',
  'oberflaeche_system',
  'oberflaeche_bestand',
  'oberflaeche_export',
  'oberflaeche_stil',
  'oberflaeche_sprachhelfer',
  'oberflaeche_sprache',
  'erstanmeldung',
  'bestandslauf',
  'schluesselwechsel',
  'stand_029',
  'stand_030',
  'stand_031',
  'pruefstand'
];

/* WELCHE GRUPPEN EIN MODUL TRAEGT -- gelesen aus seinem Quelltext und nicht
   aus einer Liste daneben. Eine Liste liefe mit den Gruppen auseinander
   (Stolperstein 47); der Quelltext ist die Gruppe selbst.
   GEBRAUCHT WIRD DAS FUER DEN TEILLAUF: ein Modul, auf dessen Gruppen der
   Filter nicht passt, wird gar nicht erst gestartet. */
function gruppenVon(name) {
  const text = fs.readFileSync(path.join(__dirname, 'test', name + '.js'), 'utf8');
  return [...text.matchAll(/^\s*group\('(.+)'\);\s*$/gm)].map(m => m[1]);
}

/* SELBSTPROBE DES RAHMENS. Mit gesetztem TESTBENCH_PROBE laeuft NICHT der
   Prueflauf, sondern nur der Rahmen darueber: zwei gestellte Gruppen mit
   gestellten Ergebnissen. Damit ist die Regel des gefilterten Laufs pruefbar,
   ohne den ganzen Durchlauf ein zweites Mal zu fahren -- und ohne dass der
   Rahmen sich selbst bestaetigt: die Gruppe "Der Gruppenfilter" faehrt diese
   Probe als eigenen Prozess und sieht sich Ausgabe und Rueckgabewert an. */
if (process.env.TESTBENCH_PROBE) {
  const state = process.env.TESTBENCH_PROBE;
  group('Rechte am Eintrag');
  check('gezeigt und grün', true);
  check('gezeigt und rot', state !== 'rot-gezeigt');
  group('Fotos und Vorschau');
  check('übergangen und grün', true);
  check('übergangen und rot', state !== 'rot-uebergangen');
  endBlock();
  process.exit(returnValue());
}

(async function treiber() {
  /* ERST AUFRAEUMEN, DANN STARTEN -- und die Meldung steht VOR der ersten
     Gruppe, wo sie niemand fuer einen Befund haelt. Wer nichts liegen gelassen
     hat, liest hier auch nichts. */
  {
    const sweep = sweepLeftovers();
    if (sweep.cleared.length) {
      console.log(`\nEin frueherer Lauf hat ${sweep.cleared.length} Server stehen lassen -- ` +
        `beendet und ihre Verzeichnisse entfernt.`);
      for (const z of sweep.cleared)
        console.log(`  PID ${z.pid}${z.port ? `  PORT=${z.port}` : ''}  ${z.where}`);
      if (sweep.left)
        console.log(`  ${sweep.left} davon leben noch -- von Hand nachsehen.`);
    }
  }

  for (const name of MODULE) {
    const gruppen = gruppenVon(name);
    /* DER TEILLAUF: ein Modul ohne passende Gruppe startet nicht. Seine
       Gruppen zaehlen trotzdem als uebergangen -- sonst behauptete der
       Schlussblock, es gaebe nur die Gruppen der gestarteten Module. */
    if (FILTER && !gruppen.some(g => g.toLowerCase().includes(FILTER.toLowerCase()))) {
      H.uebergangenDazu(gruppen.length);
      continue;
    }
    modulFahren(name);
  }

  /* ================= DIE BEIDEN LETZTEN GRUPPEN =================
     SIE RECHNEN UEBER ALLE MODULE: wie viele Portbasen der Lauf wirklich
     vergeben hat, und ob irgendein Modul einen Server zurueckgelassen hat.
     In einem TEILLAUF hat niemand alle Module gefahren -- die Basen waeren
     unvollstaendig, und die Zusage „63 Basen" waere rot, ohne dass etwas
     kaputt ist. Ein Fehlalarm bei jedem Teillauf ist schlimmer als keine
     Zusage: er wird nach dem dritten Mal ueberlesen.
     DIE GRUPPE STEHT TROTZDEM DA, damit die Zahl der Gruppen in beiden
     Laeufen dieselbe ist -- sie sagt nur, warum sie nichts rechnet. */
  const vollstaendig = !H.moduleAusgelassen();
  const nurTeillauf = '  … uebersprungen: ein Teillauf startet nicht alle Module, ' +
    'und diese Gruppe rechnet ueber alle.';
  /* DIE BEIDEN LISTEN STEHEN VOR BEIDEN GRUPPEN: die eine rechnet mit den
     Basen, die andere zaehlt die Server. Innerhalb einer Gruppe erklaert
     reichten sie nicht bis zur naechsten. */
  const pbLagen = [...CASES.map(l => ({ base: l.base, port: l.port })),
                   ...MODULLAGE.flatMap(m => m.faelle || [])];
  const pbSmtp = [...SMTP_CASES.map(l => ({ base: l.base, port: l.port, kind: l.kind })),
                  ...MODULLAGE.flatMap(m => m.smtp || [])];

  /* ================= Der Pruefstand ueber sich selbst =================
     Zwei Waechter, und beide sind aus 0.8.90 heraus entstanden: dort haben
     verwaiste Server acht Gegenproben abreissen lassen, und eine Portbasis
     liegt bis heute auf einer Nummer, die fetch() gar nicht anwaehlt. Sie
     stehen am ENDE, weil beide erst dann etwas zu sagen haben. */

  group('Die Portbasen und der Versatz');
  if (!vollstaendig) console.log(nurTeillauf);
  else {

  /* DIE SPERRLISTE VON fetch(). Sie steht in der Fetch-Spezifikation als "bad
     ports" und ist in undici -- der Fetch-Umsetzung von Node -- eingebaut: ein
     Aufruf auf eine dieser Nummern scheitert mit "bad port", noch bevor eine
     Verbindung entsteht. Der Server LAEUFT dort und meldet es auch; nur die
     Bereitschaftspruefung kommt nie an ihn heran, und der Lauf reisst ab, statt
     eine Pruefung namentlich rot zu faerben. Genau das ist Stolperstein 127.
     NUR DIE NUMMERN AB 1024 stehen hier: darunter liegt keine Portbasis dieses
     Laufs, und die vollstaendige Liste waere laenger, ohne mehr zu sagen. */
  const LOCKPORTS = [1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061,
                      6000, 6566, 6665, 6666, 6667, 6668, 6669, 6679, 6697, 10080];
  // Ein Fenster ist gesperrt, sobald EINE seiner Nummern es ist -- gezogen wird
  // zufaellig, und eine Zahl, die nur selten faellt, ist nicht harmlos.
  const pbLocked = (from, width) =>
    LOCKPORTS.filter(p => p >= from && p <= from + width - 1);

  /* Die Fingerprintlage zaehlt HOCH statt zu wuerfeln und braucht deshalb nur
     so viele Nummern, wie sie Server startet. Sie bekommt trotzdem ihr eigenes
     Fenster, damit der Waechter sie mitrechnet. */
  /* DER SMTP-EMPFAENGER AUS 0.9.0 GEHT UEBER DIESELBE LISTE. Er startet keinen
     Server ueber spawn -- er liegt im eigenen Prozess --, und der Waechter
     ueber die Startstellen sieht ihn deshalb NICHT. Gesehen werden muss er
     trotzdem: seine Nummern entstehen genauso aus Basis plus Versatz, und eine
     Basis, die nicht ueber die vermerkte Liste laeuft, wird von keinem
     Waechter gesehen (Stolperstein 139). Er zaehlt hoch statt zu wuerfeln und
     bekommt deshalb ein eigenes, schmales Fenster -- wie die Fingerprintlage. */
  const pbWidth = (base) => base === FINGERPRINT_BASE ? 10
    : base === SMTP_BASE ? SMTP_WIDTH
    : base === LANGUAGE_BASE ? LANGUAGE_WIDTH : PORT_WIDTH;
  const pbBases = [...new Set([...pbLagen.map(l => l.base),
                               ...pbSmtp.map(l => l.base)])].sort((a, b) => a - b);
  /* ERST DER GEGENSTAND (Stolperstein 81): ein Waechter ueber null Basen ist
     gruen und belegt nichts. Die ZAHL ausdruecklich, wie bei F_ROUTES -- eine
     Prueflage, die still verschwindet, faellt sonst niemandem auf. */
  /* EINUNDSECHZIG SEIT 0.21.0: die Gruppe „Zwei Kaesten, zwei Durchschnitte"
     bringt drei eigene Instanzen mit (die Runde selbst, eine fuer die Datei aus
     dem vorigen Format samt Konflikt, eine frische fuer den Rundlauf ueber
     Export und Import).
     IHRE BASEN SIND ZWEIMAL UMGEZOGEN, und beide Male aus demselben Grund.
     Der erste Anlauf spannte sie mit 20 Abstand -- die Fenster ueberlappten
     einander, und der dritte Server bekam einen Port, auf dem schon der zweite
     horchte: seine Einrichtung ging an die falsche Instanz, und der Import
     antwortete mit 401.
     DER ZWEITE ANLAUF NAHM 5260, 5320 UND 5380 -- und das waren GENAU DIE DREI
     BASEN DER MAILGRUPPE. Aufgefallen ist es an fuenfzehn roten Punkten IM
     MAILVERSAND, also an einer ganz anderen Stelle als der Ursache; allein
     gefahren blieb die Gruppe gruen. EINE BELEGTE BASIS SIEHT IN DER LISTE WIE
     EINE FREIE AUS, sobald man doppelte Eintraege wegwirft -- und genau das
     hatte der Blick auf die Liste getan.
     DER DRITTE ANLAUF SUCHTE SIE NICHT MEHR VON HAND, sondern rechnete sie aus
     der Liste aus, die DIESE PRUEFUNG druckt: sie ist die einzige
     vollstaendige, weil sie aus PRUEFLAGEN kommt und nicht aus einem
     Suchmuster ueber den Quelltext. Zehn Basen stehen an Aufrufstellen, die
     ein Suchmuster nicht findet.
     EIN ZWEITER SERVER AUF DEMSELBEN PORT FAELLT NICHT VON SELBST AUF: die
     Bereitschaftspruefung bekommt ja eine Antwort (Stolperstein 139). Deshalb
     steht die Zahl hier ausdruecklich -- sie ist die einzige Stelle, an der
     eine doppelt vergebene Basis sichtbar wird.
     7180, 7240 UND 7300 SIND DIE ERSTEN DREI FREIEN WINDOW, und sie liegen am
     oberen Ende: die Spanne aller Basen misst damit 3460 und bleibt unter dem
     Versatz von 3500. Wer eine weitere Basis anhaengt, faellt an der Zeile
     „Der Versatz je Nebenspur ist groesser als die Spanne aller Basen" auf --
     dort ist dann eine Luecke weiter unten zu nehmen. */
  /* ZWEIUNDSECHZIG SEIT 0.24.0: die Lage „Server ohne de.json" (Bauabschnitt
     1) bringt ihre eigene Basis mit -- sie startet einen Server, der gerade
     NICHT hochkommen soll, und braucht dafuer genau eine Nummer.
     DREIUNDSECHZIG SEIT 0.24.5: die Gruppe „Die Namenstafeln je Sprache"
     braucht einen eigenen Server, weil sie den PERSOENLICHEN SCHLUESSEL des
     Rufers setzt -- am Hauptserver blieb er danach stehen und jede spaetere
     Prueflage mit einem Sprachkopf laese in Wahrheit ihn.
     IHRE BASIS IST 5000 UND NICHT DIE NAECHSTE FREIE OBEN. 7360 haette die
     Spanne aller Basen auf 3520 gebracht und damit ueber den Versatz von 3500
     -- der Absatz darueber sagt genau das voraus und nennt den Ausweg: eine
     Luecke weiter unten. Die Luecke zwischen 4950 und 5070 ist die einzige, die
     bleibt, und sie ist knapp: 5010 haette 5060 und 5061 gedeckt, und die
     stehen auf der Sperrliste von fetch() -- der Server liefe dort und waere
     nicht anzuwaehlen (Stolperstein 127). 5000 deckt 5000 bis 5059, keine
     gesperrte Nummer, und die Spanne bleibt 3460. Es kostet zehn Nummern
     Ueberschneidung mit dem Fenster von 4950; das ist die kleinste, die zu
     haben war, und rund ein Fuenftel dessen, was die dicht gepackten Basen
     zwischen 4380 und 4440 sich seit je teilen. */
  check('Der Lauf hat seine Portbasen vermerkt',
    pbBases.length === 63 && pbLagen.length >= 60,
    `${pbBases.length} Basen aus ${pbLagen.length} Prueflagen: ${pbBases.join(' ')}`);
  // Und der Empfaenger selbst ist wirklich gelaufen: eine Liste ohne
  // Eintraege machte die Rechnung darueber wahr, ohne etwas zu belegen
  // (Stolperstein 81).
  check('Der SMTP-Empfaenger hat seine Nummern vermerkt',
    pbSmtp.length >= 6 && pbSmtp.every(l => l.base === SMTP_BASE),
    `${pbSmtp.length} Empfaenger, Nummern ${pbSmtp.map(l => l.port).join(' ')}`);
  // Und er bleibt in seinem Fenster. Zaehlt jemand mehr Empfaenger auf, als
  // das Fenster deckt, laufen ihre Nummern in die naechste Basis hinein --
  // und der Waechter darueber saehe davon nichts.
  check('Und bleibt dabei in seinem Fenster',
    pbSmtp.every(l => l.port - PORT_OFFSET >= SMTP_BASE &&
                      l.port - PORT_OFFSET < SMTP_BASE + SMTP_WIDTH),
    `hoechste ${Math.max(...pbSmtp.map(l => l.port - PORT_OFFSET))}, Fenster bis ${SMTP_BASE + SMTP_WIDTH - 1}`);

  /* JEDE STELLE, DIE EINEN SERVER STARTET, GEHT UEBER EINE DIESER BASEN. Der
     Waechter zaehlt die Startstellen im Quelltext nach: der Hauptserver,
     startFurtherServer und die Fingerprintlage. Wer eine vierte ergaenzt und
     sie nicht vermerkt, faellt hier auf -- ihre Ports gingen sonst am Versatz
     vorbei, und genau daran sind zwei Gegenproben haengengeblieben. */
  /* UEBER ALLE DATEIEN DES PRUEFSTANDS SEIT 0.34.0. Bis dahin stand jede
     Startstelle in testbench.js; jetzt liegen zwei im Rahmen und die uebrigen
     in den Modulen. Wer nur die eine Datei laese, zaehlte drei statt fuenf --
     und meldete einen Fehler, wo keiner ist. */
  const pbStarts = pruefstandDateien().reduce((n, d) =>
    n + (fs.readFileSync(path.join(__dirname, d), 'utf8')
      .match(/spawn\(process\.execPath, \['server\.js'\]/g) || []).length, 0);
  /* VIER SEIT 0.24.0: dazu die Lage, die einen Server OHNE Sprachdatei
     startet und festhaelt, dass er trotzdem hochkommt (Bauabschnitt 1).
     FUENF SEIT 0.24.3: die Fremddateilage (F6) startet einen Server, in
     dessen Sprachverzeichnis drei unbrauchbare Dateien liegen. Sie teilt
     sich das Fenster von LANGUAGE_BASE mit der Lage darueber -- zwei
     Nummern, zwei Lagen, und beide vermerkt. */
  check('Es gibt genau fuenf Stellen, die einen Server starten',
    pbStarts === 5, `${pbStarts} Stellen`);

  const pbToday = pbBases
    .map(b => [b, pbLocked(b, pbWidth(b))])
    .filter(([, t]) => t.length);
  check('Keine Portbasis deckt eine Nummer, die fetch() nicht anwaehlt',
    pbToday.length === 0,
    pbToday.map(([b, t]) => `${b}–${b + pbWidth(b) - 1} trifft ${t.join(', ')}`).join(' · '));
  const pbMain = pbLocked(MAIN_BASE, MAIN_WIDTH);
  check('Und der Hauptserver ebenso wenig',
    pbMain.length === 0,
    `${MAIN_BASE}–${MAIN_BASE + MAIN_WIDTH - 1} trifft ${pbMain.join(', ')}`);

  /* DER VERSATZ MUSS GROESSER SEIN ALS DIE SPANNE SAMT BREITE. Bei Gleichheit
     faengt die naechste Spur genau dort an, wo die vorige aufhoert -- und der
     Hauptserver liegt UNTER der kleinsten Basis, also zaehlt er mit. */
  const pbBottom = Math.min(MAIN_BASE, ...pbBases);
  const pbTop = Math.max(...pbBases.map(b => b + pbWidth(b) - 1),
                          MAIN_BASE + MAIN_WIDTH - 1);
  const pbSpan = pbTop - pbBottom + 1;
  check('Der Versatz je Nebenspur ist groesser als die Spanne aller Basen',
    OFFSET_LEVEL >= pbSpan,
    `Versatz ${OFFSET_LEVEL}, Spanne ${pbSpan} (${pbBottom}–${pbTop})`);

  /* JEDE SPUR EINZELN NACHGERECHNET, nicht nur die erste: die Sperrliste ist
     nicht gleichmaessig verteilt -- 6000 trifft Spur 1, 6665 bis 6697 treffen
     sie ebenfalls, und eine Rechnung, die nur eine Spur ansieht, belegt fuer
     die anderen drei nichts. */
  const pbTraceHit = [];
  for (let trace = 1; trace < OFFSET_TRACES; trace++) {
    const v = trace * OFFSET_LEVEL;
    for (const b of [...pbBases, MAIN_BASE]) {
      const width = b === MAIN_BASE ? MAIN_WIDTH : pbWidth(b);
      const t = pbLocked(b + v, width);
      if (t.length) pbTraceHit.push(`Spur ${trace}, Basis ${b} → ${t.join(', ')}`);
    }
  }
  check(`Alle ${OFFSET_TRACES} Nebenspuren bleiben von der Sperrliste frei`,
    pbTraceHit.length === 0, pbTraceHit.join(' · '));
  // Und die Gegenlage: der Waechter faengt ueberhaupt etwas. Ohne sie bliebe
  // er gruen, wenn pbLocked() nie etwas faende (Stolperstein 81).
  check('Und der Waechter faengt eine gesperrte Nummer, wenn eine dasteht',
    pbLocked(5990, PORT_WIDTH).join() === '6000' &&
    pbLocked(4000, PORT_WIDTH).join() === '4045',
    `${pbLocked(5990, PORT_WIDTH)} / ${pbLocked(4000, PORT_WIDTH)}`);
  // Die hoechste entstehende Nummer bleibt unter dem fluechtigen Bereich, den
  // der Kern selbst vergibt (ab 32768) -- sonst besetzte irgendwann eine
  // fremde Verbindung genau die Nummer, auf die eine Prueflage wartet.
  check('Die hoechste Nummer aller Spuren bleibt unter 32768',
    pbTop + (OFFSET_TRACES - 1) * OFFSET_LEVEL < 32768,
    `hoechste Nummer ${pbTop + (OFFSET_TRACES - 1) * OFFSET_LEVEL}`);

  }
  group('Keine Prueflage laesst ihren Server zurueck');
  if (!vollstaendig) console.log(nurTeillauf);
  else {

  /* IN 0.8.90 HABEN ZWEI LAGEN IHRE SERVER ZURUECKGELASSEN, und aufgefallen
     ist es erst, als eine Gegenprobe daran abriss: 48 verwaiste Prozesse
     besetzten Ports, und der Prueflauf redete auf ihnen mit einer FREMDEN
     Datenbank. Nachgesehen wurde damals von Hand; hier steht es als Pruefung.
     GEZAEHLT WIRD AM PROZESS, nicht an einer Absicht: exitCode bzw.
     signalCode traegt erst dann etwas, wenn das Kind wirklich beendet ist. */
  /* DIE LUECKE AUS GEGENPROBE W4. Der Rueckbau "endKind fragt nicht, ob das
     Kind schon vorbei ist" blieb STUMM: ein gewoehnlicher Lauf laesst kein
     Kind von selbst enden, und deshalb hat niemand gemerkt, dass das Warten
     auf ein Ereignis aus der Vergangenheit FUER IMMER haengt. Genau daran sind
     zwei Gegenproben stehengeblieben.
     GEPRUEFT WIRD MIT EINEM ZEITWAECHTER, denn der Fehlerfall ist ein Haenger
     und kein falscher Wert -- ohne ihn bliebe die Pruefung nicht rot, sondern
     der ganze Lauf stuende still. */
  {
    const alreadyPath = spawn(process.execPath, ['-e', 'process.exit(0)']);
    await new Promise(r => alreadyPath.on('exit', r));
    check('Der Aufbau steht: das Kind ist wirklich schon beendet',
      alreadyPath.exitCode !== null || alreadyPath.signalCode !== null,
      `exitCode ${alreadyPath.exitCode}, signalCode ${alreadyPath.signalCode}`);
    let came = false;
    await Promise.race([
      endKind(alreadyPath).then(() => { came = true; }),
      new Promise(r => setTimeout(r, 3000))
    ]);
    check('beendeKind kehrt auch bei einem SCHON beendeten Kind zurueck',
      came, 'es haengt -- ein on(exit) nach dem Ende feuert nie');
  }

  /* UEBER ALLE MODULE HINWEG -- 0.34.0. Seit dem Umzug gibt es kein
     gemeinsames CASES mehr: jedes Modul fuehrt seine eigene Liste und meldet
     am Ende, wie viele Server es gestartet hat und welche davon noch offen
     sind. Der Treiber legt seine eigenen daneben und haelt die Zusage ueber
     alle zusammen -- sonst belegte sie nur noch den Rest, der nicht umgezogen
     ist. DER NAME DES MODULS STEHT DABEI: ein liegengebliebener Server ist
     erst dann zu finden, wenn man weiss, wer ihn gestartet hat. */
  const wlAll = pbLagen.length;
  const wlOpen = [
    ...CASES.filter(l => l.kind.exitCode === null && l.kind.signalCode === null)
      .map(l => `Basis ${l.base}, Port ${l.port}, PID ${l.kind.pid}`),
    ...MODULLAGE.flatMap(m => (m.faelle || []).filter(l => l.offen)
      .map(l => `${m.modul}: Basis ${l.base}, Port ${l.port}, PID ${l.pid}`))];
  check(`Der Lauf hat ${wlAll} eigene Server gestartet`,
    wlAll >= 35, `${wlAll} Prueflagen`);
  check('Und jeder einzelne von ihnen ist beendet',
    wlOpen.length === 0, wlOpen.join(' · '));
  /* DASSELBE FUER DEN SMTP-EMPFAENGER, seit 0.9.0 -- und er braucht seine
     eigene Zeile, weil er kein KIND ist: er liegt im selben Prozess, und der
     Waechter darueber sieht nur Kinder. Ein Empfaenger, der offen bleibt,
     haelt am Ende des Laufs einen Port besetzt und den Prozess am Leben --
     dasselbe Fehlerbild wie ein zurueckgelassener Server, nur ohne PID. */
  const wlSmtp = [
    ...SMTP_CASES.filter(l => l.server.listening).map(l => `Port ${l.port} (${l.kind})`),
    ...MODULLAGE.flatMap(m => (m.smtp || []).filter(l => l.offen)
      .map(l => `${m.modul}: Port ${l.port} (${l.kind})`))];
  check('Und kein SMTP-Empfaenger horcht noch',
    wlSmtp.length === 0, wlSmtp.join(' · '));
  }
  /* ---------------------------------------------------------------- */
  endBlock();

  fs.rmSync(MELDEORDNER, { recursive: true, force: true });
  process.exit(returnValue());
})().catch(e => {
  /* DIE URSACHE GEHOERT DAZU -- 0.30.0, BA 2. „Prueflauf abgebrochen: fetch
     failed" nennt weder die Stelle noch den Grund: undici packt den echten
     Fehler (ECONNREFUSED, ECONNRESET, EAI_AGAIN) in `cause`, und ohne ihn
     sucht man den Fehler in der falschen Datei. Dieselbe Ueberlegung wie beim
     Wartefenster: eine Meldung, die auf eine Suche durch 78 Server schickt,
     ist die teurere Haelfte des Befundes.
     UND DIE KETTE GANZ: ein `cause` kann selbst eines tragen. */
  const chain = [];
  for (let z = e, step = 0; z && step < 5; z = z.cause, step++)
    chain.push(`${z.code ? `[${z.code}] ` : ''}${z.message || z}`);
  console.error('\nPrueflauf abgebrochen:', chain.join('  <-  '));
  if (e && e.stack) console.error(e.stack.split('\n').slice(1, 4).join('\n'));
  fs.rmSync(MELDEORDNER, { recursive: true, force: true });
  process.exit(1);
});
