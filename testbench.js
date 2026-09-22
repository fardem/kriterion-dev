/* Kriterion — Pruefstand: der Treiber node testbench.js alles node
   testbench.js Rechte nur die Module mit "Rechte" im Gruppennamen DIE
   PRUEFLAGEN LIEGEN IN test/, ein Modul je Sachgebiet — 0.34.0. */
const H = require('./test/frame.js');
const {
  fs, os, path, spawn, spawnSync, FILTER, group, check, endBlock, returnValue,
  equal, CASES, SMTP_CASES, SMTP_BASE, SMTP_WIDTH, LANGUAGE_BASE, LANGUAGE_WIDTH,
  FINGERPRINT_BASE, PORT_WIDTH, PORT_OFFSET, MAIN_BASE, MAIN_WIDTH,
  OFFSET_LEVEL, OFFSET_TRACES, endKind, sweepLeftovers, benchFiles
} = H;

/* ================= EIN MODUL FAEHRT ALS EIGENER PROZESS -- 0.34.0 =========
   DAS IST DER GANZE PUNKT DER RUNDE. */
const REPORT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-meldung-'));
const REPORTS = [];

function runModule(name) {
  const where = path.join(REPORT_DIR, name + '.json');
  const r = spawnSync(process.execPath,
    [path.join('test', name + '.js'), ...(FILTER ? [FILTER] : [])],
    { cwd: __dirname, stdio: 'inherit',
      env: { ...process.env, TESTBENCH_REPORT: where } });
  /* KEINE MELDUNG IST EIN FUND UND KEIN LEERER LAUF. */
  let report = null;
  try { report = JSON.parse(fs.readFileSync(where, 'utf8')); } catch {}
  if (!report) {
    console.log(`\n  ✗ Das Modul ${name} hat keine Zahlen gemeldet` +
      `\n      Rueckgabewert ${r.status}, Signal ${r.signal}`);
    H.addCounters({ passedCount: 0, failed: 1, skipped: 0, stillPassed: 0,
                    stillFailed: 0, groupsShown: 0, groupsStill: 0, times: [] });
    REPORTS.push({ moduleName: name, cases: [], smtp: [],
                     abort: `kein Ergebnis (Code ${r.status}, Signal ${r.signal})` });
    return;
  }
  H.addCounters(report);
  REPORTS.push(report);
  if (report.abort)
    console.log(`\n  ✗ Das Modul ${name} ist abgebrochen: ${report.abort}`);
  /* DIE MELDUNG IST DA -- ABER SIE IST NICHT DER GANZE BEWEIS. test/frame.js
     schreibt sie, raeumt danach auf und beendet erst dann; stirbt das Modul
     dazwischen, steht eine saubere Meldung da und der Rueckgabewert ist
     trotzdem nicht 0. Ohne diese Zeile zaehlt ein solcher Lauf als bestanden. */
  if (!report.abort && !report.failed && r.status !== 0) {
    console.log(`\n  ✗ Das Modul ${name} meldet keinen Fehler, endete aber mit` +
      ` Rueckgabewert ${r.status}, Signal ${r.signal}`);
    H.addCounters({ passedCount: 0, failed: 1, skipped: 0, stillPassed: 0,
                    stillFailed: 0, groupsShown: 0, groupsStill: 0, times: [] });
  }
}

/* ================= DIE MODULE UND IHRE REIHENFOLGE ================= SIE IST
   DIE DES EINEN LAUFS VON FRUEHER, soweit sie sich halten laesst: erst der
   Rundlauf, dann die Waechter ueber den Quelltext, dann die Oberflaeche, dann
   die Prueflagen mit eigenen Instanzen, zuletzt der Pruefstand ueber sich
   selbst. */
const MODULE = [
  'roundtrip',
  'source',
  'ui_overview',
  'ui_entry',
  'ui_system',
  'ui_inventory',
  'ui_export',
  'ui_style',
  'ui_translator',
  'ui_language',
  'firstlogin',
  'batchrun',
  'keychange',
  'release_029',
  'release_030',
  'release_031',
  'selfcheck'
];

/* WELCHE GRUPPEN EIN MODUL TRAEGT -- gelesen aus seinem Quelltext und nicht
   aus einer Liste daneben. */
function groupsOf(name) {
  const text = fs.readFileSync(path.join(__dirname, 'test', name + '.js'), 'utf8');
  return [...text.matchAll(/^\s*group\('(.+)'\);\s*$/gm)].map(m => m[1]);
}

/* SELBSTPROBE DES RAHMENS. */
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
     Gruppe, wo sie niemand fuer einen Befund haelt. */
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
    const groups = groupsOf(name);
    /* DER TEILLAUF: ein Modul ohne passende Gruppe startet nicht. */
    if (FILTER && !groups.some(g => g.toLowerCase().includes(FILTER.toLowerCase()))) {
      H.addSkippedGroups(groups.length);
      continue;
    }
    runModule(name);
  }

  /* ================= DIE BEIDEN LETZTEN GRUPPEN ================= SIE
     RECHNEN UEBER ALLE MODULE: wie viele Portbasen der Lauf wirklich vergeben
     hat, und ob irgendein Modul einen Server zurueckgelassen hat. */
  const complete = !H.skippedModules();
  const partialHint = '  … uebersprungen: ein Teillauf startet nicht alle Module, ' +
    'und diese Gruppe rechnet ueber alle.';
  /* DIE BEIDEN LISTEN STEHEN VOR BEIDEN GRUPPEN: die eine rechnet mit den
     Basen, die andere zaehlt die Server. */
  const pbCases = [...CASES.map(l => ({ base: l.base, port: l.port })),
                   ...REPORTS.flatMap(m => m.cases || [])];
  const pbSmtp = [...SMTP_CASES.map(l => ({ base: l.base, port: l.port, kind: l.kind })),
                  ...REPORTS.flatMap(m => m.smtp || [])];

  /* ================= Der Pruefstand ueber sich selbst ================= Zwei
     Waechter, und beide sind aus 0.8.90 heraus entstanden: dort haben
     verwaiste Server acht Gegenproben abreissen lassen, und eine Portbasis
     liegt bis heute auf einer Nummer, die fetch() gar nicht anwaehlt. */

  group('Die Portbasen und der Versatz');
  if (!complete) console.log(partialHint);
  else {

  /* DIE SPERRLISTE VON fetch(). */
  const LOCKPORTS = [1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061,
                      6000, 6566, 6665, 6666, 6667, 6668, 6669, 6679, 6697, 10080];
  // Ein Fenster ist gesperrt, sobald EINE seiner Nummern es ist -- gezogen wird
// zufaellig, und eine Zahl, die nur selten faellt, ist nicht harmlos.
  const pbLocked = (from, width) =>
    LOCKPORTS.filter(p => p >= from && p <= from + width - 1);

  /* Die Fingerprintlage zaehlt HOCH statt zu wuerfeln und braucht deshalb nur
     so viele Nummern, wie sie Server startet. */
  /* DER SMTP-EMPFAENGER AUS 0.9.0 GEHT UEBER DIESELBE LISTE. */
  const pbWidth = (base) => base === FINGERPRINT_BASE ? 10
    : base === SMTP_BASE ? SMTP_WIDTH
    : base === LANGUAGE_BASE ? LANGUAGE_WIDTH : PORT_WIDTH;
  const pbBases = [...new Set([...pbCases.map(l => l.base),
                               ...pbSmtp.map(l => l.base)])].sort((a, b) => a - b);
  /* ERST DER GEGENSTAND: ein Waechter ueber null Basen ist
     gruen und belegt nichts. */
  /* EINUNDSECHZIG SEIT 0.21.0: die Gruppe „Zwei Kaesten, zwei Durchschnitte"
     bringt drei eigene Instanzen mit (die Runde selbst, eine fuer die Datei
     aus dem vorigen Format samt Konflikt, eine frische fuer den Rundlauf
     ueber Export und Import). */
  /* ZWEIUNDSECHZIG SEIT 0.24.0: die Lage „Server ohne de.json" (Bauabschnitt
     1) bringt ihre eigene Basis mit -- sie startet einen Server, der gerade
     NICHT hochkommen soll, und braucht dafuer genau eine Nummer. */
  /* VIERUNDSECHZIG: die Lage des stueckweisen Exports bringt ihre eigene
     Basis mit -- sie startet denselben Server zweimal, vor und nach dem
     Leeren des Importordners. */
  check('Der Lauf hat seine Portbasen vermerkt',
    pbBases.length === 64 && pbCases.length >= 60,
    `${pbBases.length} Basen aus ${pbCases.length} Prueflagen: ${pbBases.join(' ')}`);
  // Und der Empfaenger selbst ist wirklich gelaufen: eine Liste ohne
  // Eintraege machte die Rechnung darueber wahr, ohne etwas zu belegen.
  check('Der SMTP-Empfaenger hat seine Nummern vermerkt',
    pbSmtp.length >= 6 && pbSmtp.every(l => l.base === SMTP_BASE),
    `${pbSmtp.length} Empfaenger, Nummern ${pbSmtp.map(l => l.port).join(' ')}`);
  // Und er bleibt in seinem Fenster.
  check('Und bleibt dabei in seinem Fenster',
    pbSmtp.every(l => l.port - PORT_OFFSET >= SMTP_BASE &&
                      l.port - PORT_OFFSET < SMTP_BASE + SMTP_WIDTH),
    `hoechste ${Math.max(...pbSmtp.map(l => l.port - PORT_OFFSET))}, Fenster bis ${SMTP_BASE + SMTP_WIDTH - 1}`);

  /* JEDE STELLE, DIE EINEN SERVER STARTET, GEHT UEBER EINE DIESER BASEN. */
  /* UEBER ALLE DATEIEN DES PRUEFSTANDS SEIT 0.34.0. */
  const pbStarts = benchFiles().reduce((n, d) =>
    n + (fs.readFileSync(path.join(__dirname, d), 'utf8')
      .match(/spawn\(process\.execPath, \['server\.js'\]/g) || []).length, 0);
  /* VIER SEIT 0.24.0: dazu die Lage, die einen Server OHNE Sprachdatei
     startet und festhaelt, dass er trotzdem hochkommt (Bauabschnitt 1). */
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

  /* DER VERSATZ MUSS GROESSER SEIN ALS DIE SPANNE SAMT BREITE. */
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
// er gruen, wenn pbLocked() nie etwas faende.
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
  if (!complete) console.log(partialHint);
  else {

  /* IN 0.8.90 HABEN ZWEI LAGEN IHRE SERVER ZURUECKGELASSEN, und aufgefallen
     ist es erst, als eine Gegenprobe daran abriss: 48 verwaiste Prozesse
     besetzten Ports, und der Prueflauf redete auf ihnen mit einer FREMDEN
     Datenbank. */
  /* DIE LUECKE AUS GEGENPROBE W4. */
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

  /* UEBER ALLE MODULE HINWEG -- 0.34.0. */
  const wlAll = pbCases.length;
  const wlOpen = [
    ...CASES.filter(l => l.kind.exitCode === null && l.kind.signalCode === null)
      .map(l => `Basis ${l.base}, Port ${l.port}, PID ${l.kind.pid}`),
    ...REPORTS.flatMap(m => (m.cases || []).filter(l => l.open)
      .map(l => `${m.moduleName}: Basis ${l.base}, Port ${l.port}, PID ${l.pid}`))];
  check(`Der Lauf hat ${wlAll} eigene Server gestartet`,
    wlAll >= 35, `${wlAll} Prueflagen`);
  check('Und jeder einzelne von ihnen ist beendet',
    wlOpen.length === 0, wlOpen.join(' · '));
  /* DASSELBE FUER DEN SMTP-EMPFAENGER, seit 0.9.0 -- und er braucht seine
     eigene Zeile, weil er kein KIND ist: er liegt im selben Prozess, und der
     Waechter darueber sieht nur Kinder. */
  const wlSmtp = [
    ...SMTP_CASES.filter(l => l.server.listening).map(l => `Port ${l.port} (${l.kind})`),
    ...REPORTS.flatMap(m => (m.smtp || []).filter(l => l.open)
      .map(l => `${m.moduleName}: Port ${l.port} (${l.kind})`))];
  check('Und kein SMTP-Empfaenger horcht noch',
    wlSmtp.length === 0, wlSmtp.join(' · '));
  }
  /* ---------------------------------------------------------------- */
  endBlock();

  fs.rmSync(REPORT_DIR, { recursive: true, force: true });
  process.exit(returnValue());
})().catch(e => {
  /* DIE URSACHE GEHOERT DAZU -- 0.30.0, BA 2. */
  const chain = [];
  for (let z = e, step = 0; z && step < 5; z = z.cause, step++)
    chain.push(`${z.code ? `[${z.code}] ` : ''}${z.message || z}`);
  console.error('\nPrueflauf abgebrochen:', chain.join('  <-  '));
  if (e && e.stack) console.error(e.stack.split('\n').slice(1, 4).join('\n'));
  fs.rmSync(REPORT_DIR, { recursive: true, force: true });
  process.exit(1);
});
