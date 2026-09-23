/* Kriterion — Pruefstand: die Staende 0.30.0 bis 0.30.3 Der Waechter ueber
   den Prueflauf, die Schlusstafel, die Anmeldebremse, das Faelligkeitsdatum
   und die Tagzeile in drei Bauabschnitten. */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  buildDom, sysSection, screenTextsFrom, SCREEN_BAN, until, openRequests
} = D;

async function run() {
  const {
   fs, os, path, spawn, execFileSync, __dirname, require, group, check,
   timeTable, equal, KEY, PORT_SPAN_FROM, PORT_SPAN_TO, PORT, DATA,
   shortRun, CASES, READY_TRIES, READY_STEP, readyFailure,
   startFurtherServer, leftovers, sweepLeftovers, parentOf, ourOwn
  } = H;

/* ===================================================================== */
/* ================= DIE ZUSAGEN DER RUNDE 0.30.0 ====================== */
/* Jede neue Zusage mit gefahrener Gegenprobe, fortlaufend ab 895. ACHT VON
   IHNEN FAHREN EINEN ECHTEN PROZESS ODER EINEN LAUFENDEN SERVER und lesen
   nicht den Quelltext -- eine Zusage, die nur den Ausdruck ansieht, bliebe
   gruen, wenn er dasteht und nichts trifft. */
async function check0300() {

  /* ---- BA 1: der Waechter erkennt den Prueflauf --------------------- */
  group('Der Waechter erkennt den Prueflauf — 0.30.0');
  {
    const cp = require('./counterproof.js');
    /* GEFAHREN UND NICHT GELESEN. */
    const wDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-waechter-'));
    const wSleep = "setTimeout(() => {}, 8000);";
    fs.writeFileSync(path.join(wDir, 'testbench.js'), wSleep);
    fs.writeFileSync(path.join(wDir, 'server.js'), wSleep);
    fs.writeFileSync(path.join(wDir, 'werkzeug.js'), wSleep);
    const wKinds = ['testbench.js', 'server.js', 'werkzeug.js'].map(n =>
      spawn(process.execPath, [path.join(wDir, n)], { cwd: wDir, env: { ...process.env, PORT: '' } }));
    // Jeder Prozess traegt sein Skript in der Befehlszeile, sobald node gestartet ist.
    await until(null, () => wKinds.every((k, i) => {
      try { return fs.readFileSync(`/proc/${k.pid}/cmdline`, 'utf8').includes(path.join(wDir, ['testbench.js', 'server.js', 'werkzeug.js'][i])); }
      catch { return false; }
    }), 5000, 'der Start der drei Prozesse');
    const wSeen = cp.foreignServer();
    const wHas = (n) => wSeen.some(z => z.pid === wKinds[n].pid);
    check('Der Waechter sieht einen ECHT gestarteten node testbench.js',
      wHas(0), `gesehen: ${wSeen.map(z => `${z.pid} ${z.script}`).join(' · ') || '—'}`);
    check('Und einen node server.js ebenso — wie seit 0.21.0',
      wHas(1), `gesehen: ${wSeen.map(z => z.script).join(' · ') || '—'}`);
    /* UND ER FAERBT SICH NICHT AN JEDEM WERKZEUG. */
    check('Und ein anderes Werkzeug laesst er in Ruhe',
      !wHas(2), 'der Waechter faerbt sich an einem beliebigen Skript');
    for (const k of wKinds) { try { k.kill('SIGKILL'); } catch {} }

    /* ---- DER PORTBLICK (F7) ---- Er findet, was kein Muster ueber die
       Befehlszeile je findet: einen Server aus `node -e
       "require('./server.js')"`. */
    const wSpan = cp.portSpan();
    check('Die Spanne der Portbasen kommt aus dem Pruefstand und ist eine Spanne',
      wSpan.from === PORT_SPAN_FROM && wSpan.to === PORT_SPAN_TO && wSpan.to > wSpan.from,
      JSON.stringify(wSpan));
    const net = require('net');
    /* EINE FREIE NUMMER WIRD GESUCHT UND NICHT GESETZT, und das ist die Lehre
       aus dem ersten gefahrenen Gegenprobenlauf dieser Runde: die Gegenprobe
       faehrt VIER Spuren nebeneinander, und die oberste reicht mit ihrem
       Versatz bis an das obere Ende der Spanne. */
    const listenOn = async (from, step) => {
      for (let i = 0; i < 40; i++) {
        const port = from - i * step;
        const server = net.createServer(() => {});
        const ok = await new Promise(done => {
          server.once('error', () => done(false));
          server.listen(port, '127.0.0.1', () => done(true));
        });
        if (ok) return { server, port };
        try { server.close(); } catch {}
      }
      return { server: null, port: 0 };
    };
    const wIn = await listenOn(PORT_SPAN_TO, 1);
    check('Der Aufbau steht: ein Socket horcht wirklich in der Spanne',
      !!wIn.server && wIn.port >= PORT_SPAN_FROM && wIn.port <= PORT_SPAN_TO,
      `Port ${wIn.port}`);
    const wBusy = wIn.server ? cp.foreignPort([]) : [];
    check('Der Portblick findet einen horchenden Port in der Spanne',
      wBusy.includes(wIn.port), `gefunden: ${wBusy.join(' ') || '—'}`);
    /* UND ER SIEHT NICHT AUSSERHALB DER SPANNE NACH. Sonst meldete er jeden
       Dienst des Wirts und waere nach dem zweiten Mal abgeschaltet. */
    const wOut = await listenOn(PORT_SPAN_TO + 211, -1);
    check('Und einen ausserhalb der Spanne meldet er nicht',
      !!wOut.server && wOut.port > PORT_SPAN_TO &&
      !cp.foreignPort([]).includes(wOut.port), `Port ${wOut.port}`);
    if (wIn.server) await new Promise(r => wIn.server.close(r));
    if (wOut.server) await new Promise(r => wOut.server.close(r));
    fs.rmSync(wDir, { recursive: true, force: true });
  }

  /* ---- BA 2: das Wartefenster und die Meldung ----------------------- */
  group('Das Wartefenster und seine Meldung — 0.30.0');
  {
    check('Das Wartefenster ist groesser als zwoelf Sekunden',
      READY_TRIES * READY_STEP > 12000,
      `${READY_TRIES} x ${READY_STEP} ms = ${READY_TRIES * READY_STEP / 1000} s`);
    /* DIE MELDUNG WIRD GEBAUT UND NICHT GELESEN: dieselbe Funktion, die der
       Zweitserver wirft. */
    const mText = readyFailure(6180, 6213, '/tmp/kriterion-beispiel', 'ausgabe des servers');
    check('Und die Meldung nennt Portbasis, Port und Verzeichnis',
      /6180/.test(mText) && /6213/.test(mText) && /\/tmp\/kriterion-beispiel/.test(mText),
      JSON.stringify(mText.slice(0, 120)));
    check('Und sie nennt auch, wie lange gewartet wurde',
      new RegExp(`${READY_TRIES * READY_STEP / 1000} s gewartet`).test(mText),
      JSON.stringify(mText.slice(0, 120)));
    check('Und sie traegt die Ausgabe des Servers weiter',
      /ausgabe des servers/.test(mText), JSON.stringify(mText.slice(-60)));
  }

  /* ---- BA 3: der Aufraeumer beim Start ------------------------------ */
  group('Der Pruefstand raeumt beim Start auf — 0.30.0');
  {
    /* AN EINEM ECHT HINTERLASSENEN SERVER GEFAHREN. */
    const aDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-rest-'));
    const aScript =
      `const { spawn } = require('child_process');` +
      `const k = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], ` +
      `{ detached: true, stdio: 'ignore', env: { ...process.env, DATA_DIR: ${JSON.stringify(aDir)} } });` +
      `k.unref(); console.log(k.pid);`;
    const aBorn = Number(execFileSync(process.execPath, ['-e', aScript],
      { encoding: 'utf8', env: { ...process.env, DATA_DIR: aDir } }).trim());
    // Der Helfer ist fort, sobald der Enkel an der Eins haengt.
    await until(null, () => parentOf(aBorn) === 1, 5000, 'das Ende des Helfers');
    const aAlive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
    check('Der Aufbau steht: ein echter Rest laeuft und ist nicht unser Kind',
      aAlive(aBorn) && !ourOwn(aBorn) && parentOf(aBorn) !== process.pid,
      `PID ${aBorn}, lebt ${aAlive(aBorn)}, Vater ${parentOf(aBorn)}`);
    const aFound = leftovers();
    check('Der Aufraeumer findet ihn — am Wegwerfverzeichnis und nicht am Namen',
      aFound.some(z => z.pid === aBorn),
      aFound.map(z => `${z.pid} ${z.where}`).join(' · ') || 'nichts gefunden');
    const aSweep = sweepLeftovers();
    await until(null, () => !aAlive(aBorn), 5000, 'das Ende des Rests').catch(() => {});
    check('Und er raeumt ihn wirklich weg — der Prozess lebt danach nicht mehr',
      !aAlive(aBorn), `PID ${aBorn} lebt noch`);
    check('Und das Wegwerfverzeichnis ist mit fort',
      !fs.existsSync(aDir), aDir);
    check('Und er sagt, was er angefasst hat',
      aSweep.cleared.some(z => z.pid === aBorn) && aSweep.left === 0,
      `${aSweep.cleared.length} geraeumt, ${aSweep.left} uebrig`);
    /* UND DIE ANDERE HAELFTE: die EIGENEN Server dieses Laufs bleiben stehen.
       Ohne sie waere ein Aufraeumer, der alles mitnimmt, hier genauso gruen. */
    const aOwn = CASES.filter(l => l.kind.exitCode === null && l.kind.signalCode === null);
    check('Und die eigenen Server dieses Laufs laesst er ausdruecklich stehen',
      aOwn.every(l => !leftovers().some(z => z.pid === l.kind.pid)),
      `${aOwn.length} eigene Server laufen gerade`);
  }

  /* ---- Der Rest einer NEBENSPUR gehoert ihr ------------------------- */
  /* GEMESSEN AM 21. SEPTEMBER 2026: bei vier Spuren wurde die Gruppe darueber
     in neun von zwoelf Laeufen rot. Alle vier stellten einen Rest hin, und
     wer zuerst raeumte, nahm die drei fremden mit -- danach fand keine der
     anderen ihren eigenen. */
  group('Ein Rest gehoert dem Lauf, der ihn hinterlassen hat — 0.38.5');
  {
    // Laeuft die Zeit ab, sagen es die Pruefungen danach.
    const bUntil = (condition, what) => until(null, condition, 10000, what).catch(() => false);
    const bDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-fremd-'));
    /* Eine Nummer, die lebt und nicht diese ist: der Vater dieses Prozesses. */
    const bForeign = process.ppid;
    const bScript = (run) =>
      `const { spawn } = require('child_process');` +
      `const k = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], ` +
      `{ detached: true, stdio: 'ignore', env: { ...process.env, ` +
      `DATA_DIR: ${JSON.stringify(bDir)}, KRITERION_RUN: ${JSON.stringify(String(run))} } });` +
      `k.unref(); console.log(k.pid);`;
    const bBorn = Number(execFileSync(process.execPath, ['-e', bScript(bForeign)],
      { encoding: 'utf8' }).trim());
    const bAlive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
    /* Der Helfer ist fort, sobald der Enkel an der Eins haengt. */
    await bUntil(() => parentOf(bBorn) === 1, 'das Ende des ersten Helfers');
    check('Der Aufbau steht: ein Rest mit fremder, lebender Laufnummer',
      bAlive(bBorn) && bForeign !== process.pid && bAlive(bForeign),
      `PID ${bBorn}, fremder Lauf ${bForeign}`);
    check('Der Aufraeumer laesst ihn stehen — er gehoert der Nebenspur',
      !leftovers().some(z => z.pid === bBorn),
      leftovers().map(z => `${z.pid} ${z.where}`).join(' · ') || 'nichts gefunden');
    /* UND DIE GEGENRICHTUNG, sonst belegte die Zeile darueber nur, dass der
       Aufraeumer gar nichts findet: dieselbe Lage mit einer TOTEN Laufnummer. */
    const bDead = Number(execFileSync(process.execPath,
      ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }).trim());
    await bUntil(() => !bAlive(bDead), 'das Ende des toten Laufs');
    const bOrphan = Number(execFileSync(process.execPath, ['-e', bScript(bDead)],
      { encoding: 'utf8' }).trim());
    await bUntil(() => parentOf(bOrphan) === 1, 'das Ende des zweiten Helfers');
    check('Die Gegenlage steht: derselbe Rest mit einer toten Laufnummer',
      bAlive(bOrphan) && !bAlive(bDead), `PID ${bOrphan}, toter Lauf ${bDead}`);
    check('Und diesen findet er',
      leftovers().some(z => z.pid === bOrphan),
      leftovers().map(z => `${z.pid} ${z.where}`).join(' · ') || 'nichts gefunden');
    /* AUFGERAEUMT WIRD VON HAND: sweepLeftovers() naehme den fremden nicht
       mit, und stehenlassen darf ihn dieser Lauf auch nicht. */
    for (const pid of [bBorn, bOrphan]) { try { process.kill(pid, 'SIGKILL'); } catch {} }
    await bUntil(() => !bAlive(bBorn) && !bAlive(bOrphan), 'das Ende beider Reste');
    check('Und beide sind danach fort — die Prueflage laesst nichts stehen',
      !bAlive(bBorn) && !bAlive(bOrphan), `${bBorn} ${bAlive(bBorn)}, ${bOrphan} ${bAlive(bOrphan)}`);
    fs.rmSync(bDir, { recursive: true, force: true });
  }

  /* ---- BA 4: die Schlusstafel --------------------------------------- */
  group('Die Schlusstafel sagt, wo die Zeit hingeht — 0.30.0');
  {
    /* AN GESTELLTEN ZAHLEN GEFAHREN: „die ZEHN teuersten" laesst sich an
       einem Lauf mit zwei Gruppen nicht belegen, und der eigene Lauf hat
       seine Tafel noch nicht gedruckt, wenn diese Zeile laeuft. */
    const tRows = Array.from({ length: 20 }, (_, i) => ({ name: `Gruppe ${i}`, ms: (i + 1) * 1000 }));
    const tLines = timeTable(tRows, 300000);
    const tNamed = tLines.filter(z => /^ {4}Gruppe /.test(z));
    check('Die Tafel nennt genau zehn Gruppen, auch wenn es zwanzig gibt',
      tNamed.length === 10, `${tNamed.length} Zeilen`);
    check('Und es sind die zehn TEUERSTEN, die teuerste zuerst',
      /Gruppe 19/.test(tNamed[0]) && /Gruppe 10/.test(tNamed[9]) &&
      !tNamed.some(z => /Gruppe [0-9] /.test(z)),
      tNamed.map(z => z.trim().split(/\s\s+/)[0]).join(' · '));
    check('Und die Zeile darunter nennt die Gesamtzeit des Laufs',
      /300\.0 s im ganzen Lauf/.test(tLines[tLines.length - 1]),
      JSON.stringify(tLines[tLines.length - 1]));
    check('Und die Zeit in den Gruppen daneben — es sind zwei verschiedene Zahlen',
      /210\.0 s in Gruppen/.test(tLines[tLines.length - 1]),
      JSON.stringify(tLines[tLines.length - 1]));
    /* UND SIE KOMMT MIT WENIGER ALS ZEHN AUS. Eine Tafel, die auf genau zehn
       besteht, waere bei einem gefilterten Lauf leer oder kaputt. */
    const tFew = timeTable([{ name: 'Eine', ms: 5000 }], 5000);
    check('Und bei weniger als zehn Gruppen nennt sie die, die es gibt',
      tFew.filter(z => /^ {4}Eine/.test(z)).length === 1 && /1 VON 1 GRUPPEN/.test(tFew[0]),
      tFew.join(' | '));
    /* UND SIE STEHT WIRKLICH IM SCHLUSSBLOCK EINES GEFAHRENEN LAUFS. */
    const tProbe = require('child_process').spawnSync(process.execPath, ['testbench.js'],
      { cwd: __dirname, encoding: 'utf8',
        env: { ...process.env, TESTBENCH_PROBE: '1', TESTBENCH_TIME: '' } });
    check('Und ein gefahrener Lauf traegt sie in seinem Schlussblock',
      /DIE TEUERSTEN 2 VON 2 GRUPPEN:/.test(tProbe.stdout) &&
      /s in Gruppen, .* s im ganzen Lauf\./.test(tProbe.stdout),
      JSON.stringify(tProbe.stdout.split('\n').slice(-8).join(' | ')));
    /* DIE ZEIT JE GRUPPE NUR AUF SCHALTER (F5) -- gefahren in beiden
       Stellungen, sonst belegte die Zeile nur eine davon. */
    const tWith = require('child_process').spawnSync(process.execPath, ['testbench.js'],
      { cwd: __dirname, encoding: 'utf8',
        env: { ...process.env, TESTBENCH_PROBE: '1', TESTBENCH_TIME: '1' } });
    check('Mit dem Schalter steht die Zeit auch je Gruppe da',
      /⏱ [0-9]+\.[0-9] s/.test(tWith.stdout),
      JSON.stringify(tWith.stdout.split('\n').slice(0, 8).join(' | ')));
    check('Und ohne ihn nicht — er ist ein Schalter und keine Ansichtssache',
      !/⏱/.test(tProbe.stdout), 'die Zeile steht auch ohne Schalter da');
  }

  /* ---- BA 5: die Anmeldebremse an der Funktion (F3) ----------------- */
  group('Die Anmeldebremse — an der reinen Funktion — 0.30.0');
  {
    /* DIE KURVE FUER JEDEN ZAEHLERSTAND UND IN NULL MILLISEKUNDEN. */
    const bCurve = JSON.parse(shortRun(
      `const a = require('./auth');` +
      `console.log(JSON.stringify(Array.from({length: 21}, (_, i) => a.delay(i))));`, DATA));
    const bWanted = Array.from({ length: 21 }, (_, i) => {
      const over = Math.max(0, i - 5 + 1);
      return over > 0 ? Math.min(over * 700, 4000) : 0;
    });
    check('delay() liefert fuer JEDEN Zaehlerstand von 0 bis 20 den Wert der Kurve',
      equal(bCurve, bWanted), JSON.stringify(bCurve));
    check('Und unterhalb der weichen Schwelle wartet sie gar nicht',
      bCurve.slice(0, 5).every(z => z === 0), JSON.stringify(bCurve.slice(0, 6)));
    check('Und oberhalb steigt sie in Schritten von 700 ms',
      bCurve[5] === 700 && bCurve[6] === 1400 && bCurve[7] === 2100,
      JSON.stringify(bCurve.slice(5, 8)));
    check('Und sie ist bei vier Sekunden gedeckelt — eine Bremse, keine Sperre',
      bCurve[10] === 4000 && bCurve[20] === 4000, JSON.stringify([bCurve[10], bCurve[20]]));
  }

  /* ---- BA 5: der Pruefschalter (F1, F2) ----------------------------- */
  group('Der Pruefschalter und seine Grenzen — 0.30.0');
  {
    const withoutSwitch = { ...process.env };
    delete withoutSwitch.KRITERION_TESTBENCH;
    /* DIE LETZTE ZEILE UND NICHT DIE GANZE AUSGABE -- dieselbe Bauform wie
       shortRun(). */
    const ask = (code, environment) => execFileSync(process.execPath, ['-e', code],
      { cwd: __dirname, encoding: 'utf8', env: environment }).trim().split('\n').pop().trim();
    /* DIE AUSLIEFERUNG TRAEGT N = 16384 -- FESTGENAGELT. */
    const sShipped = ask(`const a = require('./auth'); console.log(a.SCRYPT_SHIPPED + ' ' + a.SCRYPT_COST);`,
      { ...withoutSwitch, DATA_DIR: DATA, ENCRYPTION_KEY: KEY });
    check('Die Auslieferung traegt scrypt N = 16384, und sie rechnet auch damit',
      sShipped === '16384 16384', sShipped);
    /* UND SIE LAESST SICH NICHT MIT EINER GEWOEHNLICHEN UMGEBUNGSVARIABLEN
       SENKEN. Vier plausible Namen, und keiner greift. */
    const sTricked = ask(`const a = require('./auth'); console.log(a.SCRYPT_COST);`,
      { ...withoutSwitch, DATA_DIR: DATA, ENCRYPTION_KEY: KEY,
        SCRYPT_N: '1024', SCRYPT: '1024', N: '1024', KRITERION_SCRYPT: '1024',
        KRITERION_TESTBENCH: '1' });
    check('Und keine gewoehnliche Umgebungsvariable senkt sie',
      sTricked === '16384', `N = ${sTricked}`);
    const sSwitched = ask(`const a = require('./auth'); console.log(a.SCRYPT_COST);`,
      { ...withoutSwitch, DATA_DIR: DATA, ENCRYPTION_KEY: KEY,
        KRITERION_TESTBENCH: 'pruefstand:scrypt=1024' });
    check('Der Pruefschalter dagegen schon — das ist der einzige Weg',
      sSwitched === '1024', `N = ${sSwitched}`);
    /* UND AUCH ER KANN NICHT BELIEBIG WEIT. */
    const sFloor = ask(`const a = require('./auth'); console.log(a.SCRYPT_COST);`,
      { ...withoutSwitch, DATA_DIR: DATA, ENCRYPTION_KEY: KEY,
        KRITERION_TESTBENCH: 'pruefstand:scrypt=2' });
    check('Und unter seinen Boden kommt auch er nicht',
      sFloor === '1024', `N = ${sFloor}`);
    /* DIE DREI MAILFRISTEN, DIESELBE KLAMMER. */
    const mShipped = ask(`const m = require('./mail');` +
      `console.log([m.SEND_SHIPPED, m.CONNECT_SHIPPED, m.GREETING_SHIPPED,` +
      ` m.SEND_MS, m.CONNECT_MS, m.GREETING_MS].join(' '));`, withoutSwitch);
    check('Die Auslieferung traegt 20 s, 7 s und 7 s — und rechnet auch damit',
      mShipped === '20000 7000 7000 20000 7000 7000', mShipped);
    const mTricked = ask(`const m = require('./mail'); console.log([m.SEND_MS, m.GREETING_MS].join(' '));`,
      { ...withoutSwitch, SEND_MS: '300', MAIL_TIMEOUT: '300', KRITERION_MAIL: '300',
        KRITERION_TESTBENCH: 'pruefstand' });
    check('Und keine gewoehnliche Umgebungsvariable stellt sie kurz',
      mTricked === '20000 7000', mTricked);
    const mSwitched = ask(`const m = require('./mail'); console.log([m.SEND_MS, m.CONNECT_MS, m.GREETING_MS].join(' '));`,
      { ...withoutSwitch, KRITERION_TESTBENCH: 'pruefstand:mail=40' });
    check('Der Pruefschalter stellt alle drei kurz — mit DEMSELBEN Teiler',
      mSwitched === '500 175 175', mSwitched);
    /* DAS VERHAELTNIS IST DIE SACHE. Waere es umkehrbar, pruefte der Lauf
       eine Verdrahtung, die es im Betrieb nicht gibt. */
    const [mSend, mConnect] = mSwitched.split(' ').map(Number);
    check('Und das Verhaeltnis der drei bleibt genau erhalten',
      Math.abs(mSend / mConnect - 20000 / 7000) < 0.05, `${mSend} zu ${mConnect}`);
    /* UND DIE ANMELDEBREMSE: NUR DAS WARTEN, NICHT DIE KURVE. */
    const bSwitched = ask(`const k = require('./keys'); const a = require('./auth');` +
      `console.log([a.delay(5), k.brakeWait(a.delay(5))].join(' '));`,
      { ...withoutSwitch, DATA_DIR: DATA, ENCRYPTION_KEY: KEY,
        KRITERION_TESTBENCH: 'pruefstand:brake=10' });
    check('Kurz gestellt wartet die Route kuerzer — die KURVE bleibt die Kurve',
      bSwitched === '700 70', bSwitched);
  }

  /* ---- BA 5: und die Route wartet wirklich (Zusage 7) --------------- */
  group('Und die Route wartet wirklich — 0.30.0');
  {
    /* EINMAL, AM LAUFENDEN SERVER UND OHNE SCHALTER. */
    const rDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-warten-'));
    const R = startFurtherServer(rDir, { KRITERION_TESTBENCH: '' }, 7180);
    await R.ready;
    await R.call('POST', '/api/setup', { user: 'chefin', password: 'chefins-langes-wort' });
    R.cookieRemove();
    const rTimes = [];
    for (let i = 1; i <= 6; i++) {
      const t0 = Date.now();
      await R.call('POST', '/api/login', { user: 'chefin', password: 'ganz-sicher-falsch' });
      rTimes.push(Date.now() - t0);
    }
    check('Die ersten fuenf Versuche kommen ohne Verzoegerung zurueck',
      rTimes.slice(0, 5).every(z => z < 700), JSON.stringify(rTimes));
    /* DER SECHSTE IST DER ERSTE GEBREMSTE: checkThrottle liest den Zaehler,
       BEVOR noteFailure ihn hochzaehlt -- weich ab fuenf heisst also, dass
       der sechste wartet. */
    check('Und der sechste wartet die ausgelieferten 700 ms wirklich ab',
      rTimes[5] >= 700, `Versuch 6: ${rTimes[5]} ms (Versuch 1: ${rTimes[0]} ms)`);
    /* UND ER TRAEGT DEN SCHALTER WIRKLICH NICHT -- sonst belegte die Zeile
       darueber nur, dass dieser eine Server langsam ist. */
    check('Dieser Server faehrt ausdruecklich OHNE den Pruefschalter',
      !/PRUEFSCHALTER AKTIV/.test(R.log()), 'der Schalter steht doch');
    await R.stop();
    fs.rmSync(rDir, { recursive: true, force: true });
  }

  /* ---- BA 9 und die neue Wache (Zusagen 20 und 21) ----------------- */
  group('Kein deutscher Bildschirmsatz sitzt fest — die neue Wache — 0.30.0');
  {
    const gLanguages = ['de', 'en', 'tr'].map(code => JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8')));
    check('„gewichtet" steht als Schluessel in allen drei Sprachdateien',
      gLanguages.every(f => typeof f['entry.weighted'] === 'string' && f['entry.weighted'].length > 2),
      gLanguages.map(f => JSON.stringify(f['entry.weighted'])).join(' · '));
    check('Und in jeder Sprache mit ihrem eigenen Wort',
      new Set(gLanguages.map(f => f['entry.weighted'])).size === 3,
      gLanguages.map(f => f['entry.weighted']).join(' · '));
    const gApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    check('Und die Kopfzeile liest ihn, statt das Wort zu tragen',
      /weightedCalc \? ' ' \+ t\('entry\.weighted'\)/.test(gApp) &&
      !/' gewichtet'/.test(gApp), 'das feste Wort steht noch im Quelltext');

    /* ================= DIE WACHE, DIE WERTE LIEST -- Zusage 21 ========= DEN
       SCHLUESSEL NACHZUTRAGEN REPARIERT EINEN SATZ; eine Wache faengt den
       naechsten. */
    const GERMAN_WORDS = Object.create(null);
    {
      const dict = JSON.parse(fs.readFileSync(path.join(__dirname, 'tools', 'dictionary.json'), 'utf8'));
      for (const [word, english] of Object.entries(dict.words))
        if (word !== english) GERMAN_WORDS[word] = english;
    }
    const bareText = (t) => t.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ')
      .replace(/<[^>]*$/, ' ').replace(/^[^<]*>/, ' ');
    const isName = (t) => /^[a-z0-9][a-z0-9._#/-]*$/.test(t.trim()) || /^#\//.test(t.trim());
    const insideMark = (t) => /=\s*"$/.test(t) || (/="/.test(t) && !/>/.test(t));
    const germanWordsIn = (t) => bareText(t).split(/[^A-Za-zÄÖÜäöüß]+/)
      .filter(x => x.length > 2).map(x => x.toLowerCase()).filter(w => GERMAN_WORDS[w]);
    /* DIE BENANNTEN AUSNAHMEN, und jede hat einen Grund und keinen Platz in
       einer Sprachdatei: die drei Befehle sie werden auf dem WIRT getippt und
       sind an usertool.js gebunden -- `passwort` und `zweifaktor` sind dort
       Argumente und keine Woerter die zwei Adressen `forum.beispiel.de` ist
       ein Beispiel und keine Sprache der eine Satz „Die Sprachdatei fehlt."
       -- ohne die Datei gibt es keinen Schluessel, mit dem sich sagen liesse,
       dass sie fehlt (Entscheidung A1 aus 0.24.0) */
    const SENTENCE_EXCEPTIONS = [
      'docker compose exec kriterion node usertool.js passwort <name>',
      'docker compose exec kriterion node usertool.js zweifaktor <name>',
      /* ZWEI BEISPIELADRESSEN UND EINE ABFRAGE. */
      'https://forum.beispiel.de/suche?q=%s',
      'site%3Aforum.beispiel.de',
      /* `?gruppe=` STAND HIER BIS 0.35.0 -- der Parameter heisst jetzt
         `group`, und damit traegt die Adresse kein deutsches Wort mehr. */
      'Die Sprachdatei fehlt.'
    ];
    const gTexts = screenTextsFrom(gApp);
    check('Die Wache liest ueberhaupt etwas: die Texte von app.js',
      gTexts.length > 4000, `${gTexts.length} Texte`);
    check('Und sie kennt deutsche Woerter',
      Object.keys(GERMAN_WORDS).length > 1000 &&
      germanWordsIn('Die Sterne sind gewichtet').includes('gewichtet'),
      `${Object.keys(GERMAN_WORDS).length} Wortpaare`);
    /* ERST DER BEFUND AM GESTELLTEN SATZ: eine Wache, die
       nichts faende, waere gruen und belegte nichts. */
    check('Und sie WUERDE ein festes deutsches Wort am Bildschirm finden',
      germanWordsIn("<strong>eingerichtet</strong>").length === 1 &&
      germanWordsIn(" gewichtet").length === 1,
      'die Wache sieht das Wort nicht');
    check('Und an einer Kennung faerbt sie sich nicht',
      isName('f-rejected') && isName('#/offen') && isName('kategorie') && !isName('Die Marke ist weg'),
      'das Sieb ueber die Kennungen greift nicht');
    check('Und an einem Bruchstueck mitten in einer Marke ebenso wenig',
      insideMark('" alt="') && insideMark('/raw?size=medium" alt="" title="') &&
      !insideMark('<strong class="mail-on">eingerichtet</strong>'),
      'das Sieb ueber die Marken greift nicht');
    const gStuck = gTexts
      .filter(z => !isName(z.text) && !insideMark(z.text))
      .filter(z => germanWordsIn(z.text).length > 0)
      .filter(z => !SENTENCE_EXCEPTIONS.some(x => z.text.includes(x)));
    check('KEIN deutscher Bildschirmsatz sitzt mehr fest in public/app.js',
      gStuck.length === 0,
      gStuck.map(z => `${z.row}: ${JSON.stringify(z.text.slice(0, 60))}`).join(' · '));
    /* DIE ZAHL DER AUSNAHMEN STEHT AUSDRUECKLICH DA. */
    check('Und es sind genau fuenf benannte Ausnahmen — zwei Befehle, zwei Adressen, ein Satz',
      SENTENCE_EXCEPTIONS.length === 5 &&
      SENTENCE_EXCEPTIONS.filter(x => x.startsWith('docker')).length === 2 &&
      SENTENCE_EXCEPTIONS.filter(x => /beispiel\.de/.test(x)).length === 2,
      SENTENCE_EXCEPTIONS.join(' · '));
    /* UND DIE DREI FUNDE DIESER RUNDE STEHEN JETZT IM WOERTERBUCH. */
    check('„an", „aus" und „eingerichtet" kommen jetzt aus der Sprachdatei',
      /tH\('card\.on'\)/.test(gApp) && /tH\('card\.off'\)/.test(gApp) &&
      /tH\('card\.configured'\)/.test(gApp) &&
      gLanguages.every(f => typeof f['card.configured'] === 'string'),
      'einer der drei steht noch fest im Quelltext');
  }

  /* ---- BA 10: das Faelligkeitsdatum (Zusagen 22 bis 24) ------------- */
  group('Das Faelligkeitsdatum bekommt Farbe — 0.30.0');
  {
    const dApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    const dCode = dApp.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
    /* EINE EINZIGE EINTEILUNG. */
    check('`dueOf` steht genau EINMAL im Code — und nicht mehr in renderOpen()',
      (dCode.match(/const dueOf = /g) || []).length === 1 &&
      (dCode.match(/const todayKey = /g) || []).length === 1,
      `dueOf ${(dCode.match(/const dueOf = /g) || []).length}x, ` +
      `todayKey ${(dCode.match(/const todayKey = /g) || []).length}x`);
    /* GENAU ZWEI RUFER, und das ist die Zahl und nicht „mindestens zwei": die
       Ansicht „Offen" und die Zeile im Eintrag. */
    check('Und beide Orte fragen dieselbe Funktion — genau zwei Rufer',
      (dCode.match(/dueOf\(/g) || []).length === 2, `${(dCode.match(/dueOf\(/g) || []).length} Aufrufe`);
    /* ---- SEIT 0.30.1 SIND ES FUENF ZUSTAENDE UND DREI FARBEN -- Befund 7
       ---- DIE FARBE SAGT DEN ZUSTAND UND NICHT MEHR NUR DIE FRIST. */
    const dCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    const dRule = (name) => (dCss.match(new RegExp(`\\.cmt-due\\.due-${name} \\{([^}]*)\\}`)) || [])[1] || '';
    const dStates = ['overdue', 'today', 'later', 'late', 'done'];
    const dColours = dStates.map(n => (dRule(n).match(/color: ([^;]+);/) || [])[1]);
    check('Fuenf Zustaende tragen drei Farben',
      dColours.every(Boolean) && new Set(dColours).size === 3, JSON.stringify(dColours));
    check('Und jeder Zustand ist von jedem anderen unterscheidbar',
      new Set(dStates.map(n => dRule(n).replace(/\s+/g, ' ').trim())).size === 5,
      JSON.stringify(dStates.map(n => dRule(n).replace(/\s+/g, ' ').trim()))); 
    /* DIE ZUORDNUNG AUSDRUECKLICH und nicht bloss „drei verschiedene": eine
       vertauschte Zuordnung -- gruen fuer gerissen, rot fuer gehalten --
       waere ebenfalls dreifarbig und sagte das Gegenteil. */
    check('Offen ist blau, gerissen ist rot, gehalten ist gruen',
      /var\(--blue\)/.test(dRule('later')) && /var\(--blue\)/.test(dRule('today')) &&
      /var\(--red\)/.test(dRule('overdue')) && /var\(--red\)/.test(dRule('late')) &&
      /var\(--green\)/.test(dRule('done')),
      JSON.stringify(dColours));
    /* „ZU SPAET FERTIG" BLEIBT SICHTBAR ZU SPAET. */
    check('Eine erledigte Aufgabe mit gerissener Frist bleibt rot — und durchgestrichen',
      /var\(--red\)/.test(dRule('late')) && /line-through/.test(dRule('late')), dRule('late'));
    check('Und „ueberfaellig" traegt dasselbe Rot wie die Ueberschrift in „Offen"',
      /\.cmt-due\.due-overdue \{ color: var\(--red\); \}/.test(dCss) &&
      /\.open-section\.overdue \{ color: var\(--red\); \}/.test(dCss),
      dRule('overdue'));
    check('Und „heute" sticht durch das Gewicht heraus, nicht durch Rot',
      /font-weight: 600/.test(dRule('today')) && !/--red/.test(dRule('today')), dRule('today'));
    check('Und „erledigt" ist durchgestrichen',
      /line-through/.test(dRule('done')), dRule('done'));
    /* DER STRICH BLEIBT, UND ZWAR AN BEIDEN ERLEDIGTEN (F17). */
    check('Und der Strich steht an BEIDEN erledigten, an keiner offenen',
      ['late', 'done'].every(n => /line-through/.test(dRule(n))) &&
      ['overdue', 'today', 'later'].every(n => !/line-through/.test(dRule(n))),
      JSON.stringify(dStates.map(n => /line-through/.test(dRule(n)))));
    /* UND GEFAHREN: vier Aufgaben, vier Klassen. Eine Zusage, die nur das
       Stilblatt liest, bliebe gruen, wenn die Klasse nie gesetzt wird. */
    const dToday = (() => { const d = new Date(); const p = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; })();
    const dShift = (days) => { const d = new Date(Date.now() + days * 86400000);
      const p = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
    /* VIER AUFGABEN IN VIER ZUSTAENDEN. `mine` an jeder: der Verweis steht
       nur da, wo jemand ihn auch bedienen darf. */
    const dWho = { id: 1, name: 'chefin' };
    const dRow = (id, kind, text, due) => ({ id, kind, text, dueDate: due, pinned: false,
      mine: true, imagesRemoved: 0, author: dWho, images: [],
      created_at: '2026-09-01 09:00:00', updated_at: null });
    /* FUENF AUFGABEN SEIT 0.30.1, und die fuenfte ist der Kern des Befundes:
       eine ERLEDIGTE, deren Frist noch nicht abgelaufen war. */
    const dComments = [
      dRow(91, 'task', 'Gestern', dShift(-1)),
      dRow(92, 'task', 'Heute', dToday),
      dRow(93, 'task', 'Morgen', dShift(1)),
      dRow(94, 'done', 'Erledigt', dShift(-2)),
      dRow(95, 'done', 'Erledigt und gehalten', dShift(4))
    ];
    /* JSDOM WIRD HIER GEHOLT UND NICHT VORAUSGESETZT: der Prueflauf laeuft
       auch ohne es und sagt das dann deutlich. */
    let JSDOMd;
    try { ({ JSDOM: JSDOMd } = require('jsdom')); } catch { JSDOMd = null; }
    check('jsdom steht fuer die vier Zustaende bereit', !!JSDOMd, 'ohne jsdom keine Oberflaechenprobe');
    const dDom = buildDom(JSDOMd, { hash: '#/item/1', commentInventory: dComments });
    await until(dDom.w, (x) => x.document.querySelector('.cmt-head') && openRequests(x) === 0,
      2000, 'die Kommentare der Detailansicht');
    const dSeen = [...dDom.w.document.querySelectorAll('.cmt-due')]
      .map(b => (b.className.match(/due-[a-z]+/) || ['—'])[0]);
    check('Fuenf Aufgaben, fuenf Zustaende — gefahren und nicht am Markup gelesen',
      equal(dSeen, ['due-overdue', 'due-today', 'due-later', 'due-late', 'due-done']),
      JSON.stringify(dSeen));
    /* UND DIE ERLEDIGTE ZEIGT IHR DATUM. Bis 0.30.0 verschwand es beim
       Abhaken: die Spalte behielt es, der Bildschirm zeigte es nicht. */
    const dDone = [...dDom.w.document.querySelectorAll('.cmt')]
      .find(c => (c.querySelector('.cmt-body')?.textContent || '').trim() === 'Erledigt und gehalten');
    check('Eine ERLEDIGTE Aufgabe zeigt ihr Datum und kennzeichnet es als erledigt',
      !!dDone?.querySelector('.cmt-due.due-done') &&
      (dDone.querySelector('.cmt-due')?.textContent || '').trim().length > 4,
      JSON.stringify(dDone?.querySelector('.cmt-due')?.outerHTML?.slice(0, 120)));
    /* UND DIE ZU SPAET ERLEDIGTE STEHT DANEBEN UND SIEHT ANDERS AUS. */
    const dLate = [...dDom.w.document.querySelectorAll('.cmt')]
      .find(c => (c.querySelector('.cmt-body')?.textContent || '').trim() === 'Erledigt');
    check('Und die ZU SPAET erledigte daneben traegt einen anderen Zustand',
      !!dLate?.querySelector('.cmt-due.due-late') &&
      !dLate.querySelector('.cmt-due.due-done'),
      JSON.stringify(dLate?.querySelector('.cmt-due')?.outerHTML?.slice(0, 120)));
    dDom.w.close();
  }

  /* ---- BA 8 und BA 11: die beiden Kaesten (Zusagen 17 bis 19, 25, 26) ---- */
  group('Der Bewertungskasten und die Vokabelkarte — 0.30.0');
  {
    const kApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    const kCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    /* DER SCHMALE ABSCHNITT ALLEIN. */
    const K_NARROW = '@media (max-width: 700px), (max-height: 500px) and (max-width: 960px) {';
    const kNarrow = kCss.slice(kCss.lastIndexOf(K_NARROW));
    const kWide = kCss.slice(0, kCss.lastIndexOf(K_NARROW));
    check('Der schmale Abschnitt steht da und ist der letzte',
      kNarrow.length > 1000 && kWide.length > 1000, `${kNarrow.length} / ${kWide.length} Zeichen`);

    /* ---- DIE KOPFZEILE (Zusage 17) ---- GEMESSEN AM 12. SEPTEMBER 2026 in
       echtem Chromium bei 390 x 844, an einer Anlage mit ZWEI Zugaengen und
       gesetzten Gewichten: „⌀ 3,5 gewichtet" + „Wer hat bewertet" (159 px) 81
       px, ZWEI Zeilen „⌀ 3,5 gewichtet" + „Wer?" ( 67 px) 42 px, EINE Zeile
       DIE GRENZE IST GEFAHREN: „Bewerter" (98 px) passt, „Abgestimmt?" (127)
       nicht. */
    const kButton = ['de', 'en', 'tr'].map(code => JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'))['entry.whoRated']);
    check('Der Knopf heisst in jeder Sprache hoechstens acht Zeichen',
      kButton.every(w => typeof w === 'string' && w.length > 0 && w.length <= 8),
      JSON.stringify(kButton));
    check('Und auf Deutsch heisst er „Wer?" — 67 statt 159 Pixel',
      kButton[0] === 'Wer?', JSON.stringify(kButton[0]));
    /* UND DER FENSTERTITEL BLEIBT DER GANZE SATZ. */
    const kTitle = ['de', 'en', 'tr'].map(code => JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'))['entry.whoRatedWord']);
    check('Der Titel des Fensters dahinter bleibt der ganze Satz',
      kTitle.every(w => typeof w === 'string' && w.includes('{word}') && w.length > 12),
      JSON.stringify(kTitle));

    /* ---- DIE STERNZEILE (Zusagen 18 und 19) ---- DIE ZWEIZEILIGE FORM
       BLEIBT, und das hat die Messung entschieden und nicht der Geschmack:
       zurueckgenommen waechst der Kasten von 580 auf 607 px, die Namensspalte
       faellt auf 54, jeder Name bricht fuenfzeilig um, und die Seite ROLLT
       seitlich (Projektstand 5.3 behaelt recht, F12). */
    check('Die zweizeilige Sternzeile bleibt — die Regel steht unveraendert da',
      /\.rlist:not\(\.no-average\) \{ grid-template-columns: auto 1fr auto; \}/.test(kNarrow) &&
      /\.rlist:not\(\.no-average\) \.rrow \.rname \{\s*grid-column: 1 \/ -1;/.test(kNarrow),
      '(die Regel aus Projektstand 5.3 fehlt)');
    check('Und die Luft geht NUR dort weg, wo die vierte Spalte steht',
      /\.rlist:not\(\.no-average\) \.rrow \.rname \{ padding-top: 4px; line-height: 1\.35; \}/.test(kNarrow) &&
      /\.rlist:not\(\.no-average\) \.rrow \.rreset-cell \{ padding-bottom: 5px; \}/.test(kNarrow),
      (kNarrow.match(/\.rlist:not\(\.no-average\) \.rrow \.rname \{ padding[^\n]*/) || ['(nicht gefunden)'])[0]);
    /* UND KEINE DIESER REGELN STEHT OHNE DIE KLAMMER. */
    check('Und keine von ihnen trifft die Fassung mit einem einzigen Zugang',
      !/^\s*\.rrow \.rname \{ padding-top: 4px/m.test(kNarrow) &&
      !/^\s*\.rrow > \* \{ padding-bottom: 5px/m.test(kNarrow),
      'eine der Regeln steht ohne die Klammer');
    /* UND AM SCHREIBTISCH AENDERT SICH NICHTS (Zusage 26). Gemessen: der
       Kasten misst dort 304 px vorher wie nachher, bei einem Zugang 290. */
    check('Und am Schreibtisch steht keine der beiden Regeln',
      !/\.rrow \.rname \{ padding-top: 4px/.test(kWide) &&
      !/rreset-cell \{ padding-bottom: 5px/.test(kWide),
      'eine der Regeln steht ausserhalb der Umbruchstelle');

    /* ---- DIE VOKABELKARTE (Zusage 25) ---- GEMESSEN, UND DIE MESSUNG HAT
       DEN VORSCHLAG DES AUFTRAGS WIDERLEGT: heute, einspaltig 1203 px 2 von
       14 Umbruechen zwei Spalten (Vorschlag) 733 px 14 von 14, zwei
       dreizeilig Beschriftung neben dem Feld 982 px 14 von 14, DREI
       dreizeilig diese Fassung 1056 px 2 von 14, keine dreizeilig GEBAUT IST
       DASSELBE MITTEL WIE AM BEWERTUNGSKASTEN: weniger Luft, gleiche Bauform
       (F14, zweite Runde). */
    const V_NARROW = '@container (max-width: 420px)';
    const kContainer = kCss.slice(kCss.indexOf(V_NARROW));
    check('Die Vokabelkarte bleibt einspaltig — zwei Spalten sind gemessen widerlegt',
      /\.vocabulary-grid \{ grid-template-columns: 1fr; \}/.test(kContainer),
      '(die Regel aus dcef9dc fehlt)');
    check('Und ihre Luft geht weg, ohne die Bauform anzufassen',
      /\.vocabulary-grid \.field \{ margin-bottom: 4px; \}/.test(kContainer) &&
      /\.vocabulary-grid \.field label \{ line-height: 1\.25; \}/.test(kContainer) &&
      /\.vocabulary-grid \.field label \.hint \{ display: inline; margin-left: 4px; \}/.test(kContainer),
      (kContainer.match(/\.vocabulary-grid \.field \{[^\n]*/) || ['(nicht gefunden)'])[0]);
    /* UND DIE BESCHRIFTUNG BLEIBT UEBER DEM FELD. Daneben zu stellen ist der
       „dritte Weg" -- und er bricht alle vierzehn um. */
    check('Und die Beschriftung steht weiter UEBER dem Feld, nicht daneben',
      !/\.vocabulary-grid \.field \{[^}]*flex-direction: row/.test(kContainer),
      'die Beschriftung steht neben dem Feld');
    check('Und am Schreibtisch aendert sich auch hier nichts',
      /\.vocabulary-grid \.field \{ margin-bottom: 10px; display: flex; flex-direction: column; \}/
        .test(kCss.slice(0, kCss.indexOf(V_NARROW))),
      'die Karte am Schreibtisch ist mitgewandert');
  }
}

/* ================================================================= 0.30.1 —
   „Was der Rundlauf mit 0.30.0 gefunden hat" ACHT BEFUNDE, SIEBEN
   BAUABSCHNITTE, und alle ausser einem sind Oberflaeche. */
async function check0301() {
  const uCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  const uApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  /* DER SCHMALE ABSCHNITT, und zwar derselbe, den 0.30.0 schon liest: die
     Regeln dieser Runde muessen DORT stehen und nicht global. */
  const uNarrow = (uCss.match(/@media \(max-width: 700px\), \(max-height: 500px\) and \(max-width: 960px\) \{[\s\S]*$/) || [''])[0];
  let JSDOMu;
  try { ({ JSDOM: JSDOMu } = require('jsdom')); } catch { JSDOMu = null; }

  /* ---- Zusage 1 und 2: die Tagzeile rueckt nach oben ---------------- */
  group('Die Tagzeile rueckt nach oben — 0.30.1');
  {
    check('jsdom steht fuer die Tagzeile bereit', !!JSDOMu, 'ohne jsdom keine Oberflaechenprobe');
    /* DIE ZEILE AUF `1fr` IST DIE GANZE REPARATUR. */
    /* SEIT 0.30.2 SIND ES DREI ZEILEN: Beschriftung, die beiden Zeichen, der
       Umschalter. */
    check('Die ersten Rasterzeilen der Tagzeile sind so hoch wie ihr Inhalt',
      /\.frow-tags \{ grid-template-rows: auto 1fr; \}/.test(uNarrow) &&
      /\.frow-tags\.tags-deep \{ grid-template-rows: auto auto 1fr; \}/.test(uNarrow),
      (uNarrow.match(/\.frow-tags[^\n{]*\{ grid-template-rows[^}]*\}/g) || ['(keine Regel)']).join(' | '));
    /* UND SIE STEHT IM SCHMALEN ABSCHNITT UND NICHT GLOBAL: am Schreibtisch
       ist die Tagzeile einzeilig, und dort gibt es die zweite Rasterzeile gar
       nicht. */
    check('Und sie steht nur im schmalen Abschnitt',
      (uCss.match(/\.frow-tags[^\n{]*\{ grid-template-rows/g) || []).length === 2 &&
      (uNarrow.match(/\.frow-tags[^\n{]*\{ grid-template-rows/g) || []).length === 2);
    check('Der Umschalter steht weiter in der zweiten Zeile und oben darin',
      /\.frow-tags > \.tagmode \{ grid-column: 1; grid-row: 2; margin-right: 0;\s*align-self: start; \}/.test(uNarrow),
      (uNarrow.match(/\.frow-tags > \.tagmode \{[^}]*\}/) || ['(keine Regel)'])[0]);
    /* DIE MARKEN SIND KLEINER ALS DIE KATEGORIEN -- GERECHNET UND NICHT
       ABGESCHRIEBEN. */
    const uPill = Number(((uCss.match(/\.pill \{[^}]*font-size: ([\d.]+)rem/) || [])[1]));
    const uTagWide = Number(((uCss.match(/\.pill-tag \{ font-family: var\(--mono\); font-size: ([\d.]+)rem; \}/) || [])[1]));
    const uTagNarrow = Number(((uNarrow.match(/\.pill-tag \{ font-size: ([\d.]+)rem; padding: 4px 10px; \}/) || [])[1]));
    check('Der Tag war schon vorher kleiner als die Kategorie',
      uTagWide > 0 && uPill > 0 && uTagWide < uPill, `${uTagWide}rem gegen ${uPill}rem`);
    check('Und am Telefon ist sie noch eine Stufe kleiner',
      uTagNarrow > 0 && uTagNarrow < uTagWide, `${uTagNarrow}rem gegen ${uTagWide}rem`);
    /* DIE FESTSCHRIFT BLEIBT, UND DAS IST EINE MESSUNG UND KEINE MEINUNG. */
    check('Und sie traegt weiterhin die Festschrift',
      /\.pill-tag \{ font-family: var\(--mono\)/.test(uCss) &&
      !/\.pill-tag \{[^}]*font-family: inherit/.test(uNarrow),
      (uNarrow.match(/\.pill-tag \{[^}]*\}/) || ['(keine Regel)'])[0]);
    /* UND DIE KATEGORIENPILLE IST NICHT MITGEGANGEN: der Befund ist die Zahl
       der Tags und nicht die Groesse aller Pillen. */
    check('Die Kategorienpille bleibt, wie sie war',
      !/\.pill \{ font-size/.test(uNarrow),
      (uNarrow.match(/\.pill \{[^}]*\}/) || ['(keine Regel)'])[0]);
  }

  /* ---- Zusage 3 und 4: die Testtagzeile ----------------------------- */
  group('Die Testtagzeile ordnet sich nach ihrem Inhalt — 0.30.1');
  {
    /* DER WOCHENTAG FAELLT AN DER BREITE UND NICHT AM GERAET. Im Quelltext
       kommt kein Geraetename vor; gefragt wird der schmale Abschnitt. */
    check('Der Wochentag faellt, wo der Platz fehlt',
      /\.trow \.tweek \{ display: none; \}/.test(uNarrow));
    check('Und er steht weiterhin da, wo Platz ist',
      /\.trow \.tweek \{ font-size: \.73rem;/.test(uCss) &&
      !/\.trow \.tweek \{ display: none/.test(uCss.replace(uNarrow, '')));
    check('Und kein Geraetename steht im Stilblatt',
      !/ultra|max phone|iphone|ipad|galaxy/i.test(uCss.replace(/\/\*[\s\S]*?\*\//g, ' ')));
    /* OHNE MARKEN WAECHST DER MARKENKASTEN IN DEN FREIEN PLATZ UND SCHIEBT
       DIE STERNE ANS ENDE. */
    check('Ohne Tags behaelt der Tagkasten seinen Inhalt als Grundmass',
      /\.trow \.ttags \{ flex: 1 1 auto; \}/.test(uNarrow));
    check('Mit Tags schrumpft er, statt die Zeile vor sich herzutragen',
      /\.trow-tags \.ttags \{ flex: 1 1 0; \}/.test(uNarrow));
    check('Und mit Tags bricht die Zeile vor den Sternen um',
      /\.trow-tags::after \{ content: ''; flex-basis: 100%; height: 0; order: 1; \}/.test(uNarrow) &&
      /\.trow-tags \.tfrom, \.trow-tags \.stars \{ order: 2; \}/.test(uNarrow));
    /* UND GEFAHREN: drei Testtage, drei Lagen. Eine Zusage, die nur das
       Stilblatt liest, bliebe gruen, wenn die Klasse nie gesetzt wird. */
    const uDays = [
      { id: 41, day: '2026-08-01', rating: 3, mine: true, author: { id: 1, name: 'chefin' }, tags: [] },
      { id: 42, day: '2026-08-02', rating: 4, mine: true, author: { id: 1, name: 'chefin' },
        tags: [{ id: 91, name: 'BIOS' }, { id: 92, name: 'Gelb' }] },
      { id: 43, day: '2026-08-03', rating: 2, mine: true, author: { id: 1, name: 'chefin' },
        tags: [91, 92, 93, 94, 95, 96, 97].map((n, i) => ({ id: n, name: 'Tag' + i })) }
    ];
    const uDom = buildDom(JSDOMu, { hash: '#/item/1', dayInventory: uDays });
    await until(uDom.w, (x) => x.document.querySelector('.trow') && openRequests(x) === 0,
      2000, 'die Testtage der Detailansicht');
    const uRows = [...uDom.w.document.querySelectorAll('.trow')];
    check('Drei Testtage stehen da', uRows.length === 3, String(uRows.length));
    check('Nur die Zeilen MIT Tags tragen die Klasse',
      equal(uRows.map(r => r.classList.contains('trow-tags')), [false, true, true]),
      JSON.stringify(uRows.map(r => r.classList.contains('trow-tags'))));
    /* „MEHR" STEHT RECHTS VON DEN MARKEN UND NICHT AM ZEILENENDE -- so steht
       es in der Bestellung, und es stimmt auch baulich: am Zeilenende stuende
       es hinter den Sternen und sagte nichts mehr darueber, WAS da noch
       kommt. */
    const uOrder = (r) => [...r.children].map(e =>
      ['ttags', 'ttag-more', 'stars', 'tdate', 'tweek', 'tfrom', 'xdel']
        .find(n => e.classList.contains(n)) || e.className.split(' ')[0]);
    check('Und „mehr" steht zwischen den Tags und den Sternen',
      uRows.every(r => {
        const o = uOrder(r);
        return o.indexOf('ttags') >= 0 && o.indexOf('ttag-more') === o.indexOf('ttags') + 1 &&
               o.indexOf('stars') > o.indexOf('ttag-more');
      }), JSON.stringify(uOrder(uRows[2] || uRows[0])));
    /* DIE BEGRENZUNG SELBST WIRD GEFAHREN UND NICHT GELESEN. */
    const uBox = uDom.w.document.createElement('div');
    const uChild = uDom.w.document.createElement('span');
    uBox.appendChild(uChild);
    Object.defineProperty(uChild, 'offsetHeight', { value: 29, configurable: true });
    Object.defineProperty(uBox, 'scrollHeight', { value: 120, configurable: true });
    Object.defineProperty(uBox, 'clientHeight', { value: 29, configurable: true });
    const uTrimmed = uDom.w.limitCloud(uBox, 1);
    check('Eine Reihe begrenzt, und die Begrenzung meldet den Rest',
      uTrimmed === true && uBox.style.maxHeight === '29px' && uBox.style.overflow === 'hidden',
      `${uTrimmed} · ${uBox.style.maxHeight} · ${uBox.style.overflow}`);
    /* UND EINE BEGRENZUNG UEBER NICHTS WIRD WIEDER WEGGENOMMEN: eine feste
       Hoehe an einem Kasten, der ohnehin hineinpasst, stuende der Zeile im
       Weg, sobald ein Tag seine Hoehe aendert. */
    Object.defineProperty(uBox, 'scrollHeight', { value: 29, configurable: true });
    const uEng = uDom.w.limitCloud(uBox, 1);
    uDom.w.limitCloud(uBox, 0);
    check('Und passt alles hinein, bleibt keine Grenze stehen',
      uEng === false && !uBox.style.maxHeight && !uBox.style.overflow,
      `${uEng} · „${uBox.style.maxHeight}" · „${uBox.style.overflow}"`);
    /* ---- UND DER AUFBAU RUFT SIE AUCH -- 0.30.1, nachgetragen ---- DIE
       GEGENPROBE HAT ES GEFUNDEN, und das ist ihr Zweck. */
    const uCalls = [];
    const uReal = uDom.w.limitCloud;
    uDom.w.limitCloud = (box, rows) => {
      uCalls.push({ cls: box && box.className, rows });
      return uReal(box, rows);
    };
    await uDom.w.renderDetail(1);
    await until(uDom.w, (x) => openRequests(x) === 0 &&
      uCalls.some(c => /(^|\s)ttags(\s|$)/.test(c.cls || '')), 2000, 'die Tags der Testtage');
    uDom.w.limitCloud = uReal;
    check('Und der Aufbau begrenzt die Tags eines Testtags auf EINE Reihe',
      uCalls.some(c => /(^|\s)ttags(\s|$)/.test(c.cls || '') && c.rows === 1),
      JSON.stringify(uCalls.slice(0, 8)));
    uDom.w.close();
  }

  /* ---- Zusage 5: der Zaehler ---------------------------------------- */
  group('In der Zeile die Zahl, im Titel das Wort — 0.30.1');
  {
    /* EIN HELFER UND NICHT VIER STELLEN. */
    const uCode = uApp.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
    check('Der Zaehler entsteht an EINER Stelle',
      (uCode.match(/const countCell = /g) || []).length === 1,
      String((uCode.match(/const countCell = /g) || []).length));
    check('Und keine Zeile baut ihre Zaehlerzelle mehr selbst',
      !/<span class="mcount">\$\{[^}]*vThing/.test(uCode),
      (uCode.match(/<span class="mcount">[^<]*</g) || []).join(' || ') || '(keine)');
    /* DREI RUFSTELLEN FUER FUENF LISTEN: Kategorien, Tags und Kriterien
       teilen sich manageList(), dazu kommen die Zugaenge und das
       Grabsteinfenster. */
    check('Und drei Rufstellen tragen fuenf Listen',
      (uCode.match(/countCell\(/g) || []).length === 3,
      String((uCode.match(/countCell\(/g) || []).length));
    /* GEFAHREN AM SYSTEMBEREICH: die Tagkarte traegt ZWEI Zahlen, und ihr
       Titel nennt beide Woerter. */
    /* MIT MARKEN IM BESTAND: eine leere Karte hat keine Zeilen, und eine
       Pruefung an null Zeilen bliebe gruen und belegte nichts. */
    const uSys = buildDom(JSDOMu, { tags: [
      { id: 91, name: 'BIOS', usage_count: 4, test_usage_count: 2 },
      { id: 92, name: 'Gelb', usage_count: 1, test_usage_count: 0 }] });
    await until(uSys.w, (x) => x.document.getElementById('count') && openRequests(x) === 0,
      2000, 'die Uebersicht');
    /* DERSELBE WEG WIE UEBERALL IM SYSTEMBEREICH: der Abschnitt „Bestand"
       wird geoeffnet, sonst steht seine Karte gar nicht im Dokument. */
    await sysSection(uSys.w, 'inventory');
    const uTagRow = uSys.w.document.querySelector('#mtags .mrow .mcount');
    check('Die Tagkarte zeigt zwei Zahlen ohne Wort',
      !!uTagRow && /^\d+ · \d+$/.test(uTagRow.textContent.trim()),
      uTagRow ? uTagRow.textContent.trim() : '(keine Zeile)');
    check('Und ihr Titel nennt beide Woerter',
      !!uTagRow && /\d+ .+ · \d+ .+/.test(uTagRow.getAttribute('title') || ''),
      uTagRow ? uTagRow.getAttribute('title') : '(kein Titel)');
    uSys.w.close();
  }

  /* ---- Zusage 7: das Datum sieht auch, wer es nicht aendern darf ----- */
  group('Das Faelligkeitsdatum sieht jeder, der den Eintrag sieht — 0.30.1');
  {
    const uWho = { id: 7, name: 'bert' };
    const uRow = (id, kind, text, due) => ({ id, kind, text, dueDate: due, pinned: false,
      mine: false, imagesRemoved: 0, author: uWho, images: [],
      created_at: '2026-09-01 09:00:00', updated_at: null });
    const uComments = [uRow(81, 'task', 'Fremde Aufgabe mit Frist', '2026-09-30')];
    /* EIN ZUGANG, DER WEDER VERFASSER NOCH ADMIN IST. */
    const uForeign = buildDom(JSDOMu, { hash: '#/item/1', commentInventory: uComments,
      settings: { filters: null, isAdmin: false } });
    await until(uForeign.w, (x) => x.document.querySelector('.cmt-head') && openRequests(x) === 0,
      2000, 'die Kommentare der Detailansicht');
    const uDue = uForeign.w.document.querySelector('.cmt-due');
    check('Das Datum steht da, obwohl der Leser es nicht aendern darf', !!uDue,
      uForeign.w.document.querySelector('.cmt-head')?.outerHTML?.slice(0, 160) || '(kein Kopf)');
    /* UND ES IST KEIN KNOPF. */
    check('Und es ist ein Text und kein Knopf',
      !!uDue && uDue.tagName === 'SPAN',
      uDue ? uDue.tagName : '(kein Element)');
    check('Und die Kennzeichen daneben stehen nicht da',
      !uForeign.w.document.querySelector('.cmt-head .mark'),
      String(uForeign.w.document.querySelectorAll('.cmt-head .mark').length));
    check('Und es traegt trotzdem seinen Zustand',
      !!uDue && /due-[a-z]+/.test(uDue.className), uDue ? uDue.className : '(kein Element)');
    uForeign.w.close();
    /* UND WER AENDERN DARF, BEKOMMT WEITER EINEN KNOPF -- auch an einer
       ERLEDIGTEN OHNE DATUM. */
    const uOwn = buildDom(JSDOMu, { hash: '#/item/1', commentInventory: [
      { id: 82, kind: 'done', text: 'Erledigt, ohne Datum', dueDate: null, pinned: false,
        mine: true, imagesRemoved: 0, author: { id: 1, name: 'chefin' }, images: [],
        created_at: '2026-09-01 09:00:00', updated_at: null }] });
    await until(uOwn.w, (x) => x.document.querySelector('.cmt-head') && openRequests(x) === 0,
      2000, 'die Kommentare der Detailansicht');
    const uAfter = uOwn.w.document.querySelector('.cmt-due');
    check('Eine erledigte Aufgabe ohne Datum bekommt wieder einen Knopf',
      !!uAfter && uAfter.tagName === 'BUTTON',
      uAfter ? `${uAfter.tagName} „${uAfter.textContent.trim()}"` : '(kein Element)');
    uOwn.w.close();
  }
}

/* ================================================================= 0.30.2 —
   „Die Tagzeile bekommt ihre Breite zurück" EIN BEFUND, EIN BAUABSCHNITT. */
async function check0302() {
  const vCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  const vApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  const vNarrow = (vCss.match(/@media \(max-width: 700px\), \(max-height: 500px\) and \(max-width: 960px\) \{[\s\S]*$/) || [''])[0];
  let JSDOMv;
  try { ({ JSDOM: JSDOMv } = require('jsdom')); } catch { JSDOMv = null; }

  group('Die Tagzeile traegt Zeichen statt Woerter — 0.30.2');
  {
    check('jsdom steht fuer die Tagzeile bereit', !!JSDOMv, 'ohne jsdom keine Oberflaechenprobe');
    /* ---- Zusage 1: zwei Zeichen, und beide sind keine neue Form ----
       `ICON_STEP_BACK` und `ICON_STEP_FWD` sind derselbe Haken, nur gedreht. */
    check('Der Haken entsteht aus demselben Helfer wie die vorhandenen',
      /const ICON_MORE_DOWN = char\(/.test(vApp) && /const ICON_MORE_UP\s+= char\(/.test(vApp),
      (vApp.match(/const ICON_MORE_[A-Z]+\s*= [^\n]{0,40}/g) || ['(nicht gefunden)']).join(' · '));
    /* DER RUECKSETZER BEKOMMT KEIN EIGENES ZEICHEN: `ICON_RESET` steht schon
       an der Sternzeile und heisst dort „zuruecksetzen". */
    check('Der Ruecksetzer nimmt den Kreispfeil, den es schon gibt',
      /c\.innerHTML = ICON_RESET;/.test(vApp) && /const ICON_RESET = char\(/.test(vApp));
    check('Und kein Kreuz — das heisst im Haus „weg"',
      !/c\.innerHTML = ICON_X;/.test(vApp));
    /* ---- Zusage 2: das Wort ist umgezogen und nicht gefallen ---- Ein
       Zeichen allein liest kein Vorleseprogramm vor. */
    for (const key of ['list.more', 'list.less', 'list.resetTags']) {
      const vName = key.split('.')[1];
      check(`Der Schluessel ${key} steht weiter in allen drei Sprachen`,
        ['de', 'en', 'tr'].every(sp => {
          const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'languages', sp + '.json'), 'utf8'));
          return typeof d[key] === 'string' && d[key].trim().length > 0;
        }), vName);
    }
    check('Und er steht im TITEL des Verweises, nicht in seinem Text',
      /m\.title = cloudOpen\.overview \? t\('list\.less'\) : t\('list\.more'\);/.test(vApp) &&
      /c\.title = t\('list\.resetTags'\);/.test(vApp));
    check('Und beide sagen ihr Wort auch dem Vorleseprogramm',
      (vApp.match(/setAttribute\('aria-label', [mc]\.title\)/g) || []).length === 2);

    /* ---- Zusage 3: die dritte Spalte ist weg ---- */
    /* SEIT 0.30.3 HAENGEN DIESE DREI AN `tags-deep`: die Anordnung gilt nur,
       wo die Wolke die zweite Rasterzeile auch ausfuellt. */
    check('Die beiden Verweise stehen in Spalte eins, unter der Beschriftung',
      /\.frow-tags\.tags-deep > \.frow-right-end \{ grid-column: 1; grid-row: 2;/.test(vNarrow),
      (vNarrow.match(/\.frow-tags[^\n{]*> \.frow-right-end[^\n]*/) || ['(keine Regel)'])[0]);
    check('Und die Zeile traegt drei Rasterzeilen',
      /\.frow-tags\.tags-deep \{ grid-template-rows: auto auto 1fr; \}/.test(vNarrow));
    check('Und der Umschalter steht in der dritten',
      /\.frow-tags\.tags-deep > \.tagmode \{ grid-row: 3; \}/.test(vNarrow));
    /* ---- UND ZUGEKLAPPT IST ER VERBORGEN -- nachgetragen, 0.30.2 ---- DIE
       GEGENPROBE HAT ES GEFUNDEN, und das ist ihr Zweck. */
    check('Und zugeklappt ist er verborgen — die Regel haengt an der Verneinung',
      /\.frow-tags:not\(\.tags-live\) > \.tagmode \{ display: none; \}/.test(vNarrow),
      (vNarrow.match(/\.frow-tags[^\n{]*\.tagmode \{[^}]*\}/g) || ['(keine Regel)']).join(' · '));
    /* DAS ZEICHEN IST EIN ZIEL FUER DEN FINGER und kein Buchstabe: dreissig
       Pixel im Quadrat, dasselbe Mass, das der Ruecksetzer der Sternzeile am
       groben Zeiger traegt. */
    check('Ein Zeichenverweis ist ein Ziel fuer den Finger',
      /\.link-btn\.icon-link \{[^}]*width: 30px; height: 30px;/.test(vCss),
      (vCss.match(/\.link-btn\.icon-link \{[^}]*\}/) || ['(keine Regel)'])[0].replace(/\s+/g, ' ').slice(0, 120));
    check('Und er traegt keinen Unterstrich mehr — der gehoert unter ein Wort',
      /\.link-btn\.icon-link \{[^}]*text-decoration: none;/.test(vCss));

    /* ---- Zusage 4: der Umschalter geht unter die Klappe ----
       GEFAHREN UND NICHT GELESEN: drei Lagen, drei Antworten. */
    const vBuild = (tags, klicks) => buildDom(JSDOMv, { tags });
    const vTags = [
      { id: 41, name: 'Alu', usage_count: 3, test_usage_count: 0 },
      { id: 42, name: 'Stahl', usage_count: 2, test_usage_count: 0 },
      { id: 43, name: 'Holz', usage_count: 1, test_usage_count: 0 }
    ];
    const vZu = buildDom(JSDOMv, { tags: vTags });
    const vChosen = (w, n) => until(w, (x) => openRequests(x) === 0 &&
      x.document.querySelectorAll('#f-tagrow .pill-tag.on').length === n, 2000, `${n} gewaehlte Tags`);
    await until(vZu.w, (x) => x.document.getElementById('f-tagrow') && openRequests(x) === 0,
      2000, 'die Tagzeile der Uebersicht');
    const vRow = () => vZu.w.document.getElementById('f-tagrow');
    check('Zugeklappt und ohne Auswahl ist der Umschalter verborgen',
      !!vRow() && !vRow().classList.contains('tags-live'),
      vRow() ? vRow().className : '(keine Zeile)');
    /* EIN TAG GENUEGT NICHT: der Umschalter entscheidet erst ab zweien ueber
       das Ergebnis. */
    vRow()?.querySelector('.pill-tag')?.click();
    await vChosen(vZu.w, 1);
    check('Mit EINEM gewaehlten Tag bleibt er verborgen',
      !!vRow() && !vRow().classList.contains('tags-live'),
      vRow() ? vRow().className : '(keine Zeile)');
    /* AB ZWEIEN GREIFT ER, UND DANN STEHT ER DA -- sonst waere es derselbe
       Befund, wegen dessen bis 0.30.0 „Tags (2)" am alten Umschalter stand:
       ein Filter, der greift und nicht zu sehen ist. */
    [...(vRow()?.querySelectorAll('.pill-tag') || [])].find(b => !b.classList.contains('on'))?.click();
    await vChosen(vZu.w, 2);
    check('Ab ZWEI gewaehlten Tags steht er da — er greift dann',
      !!vRow() && vRow().classList.contains('tags-live'),
      vRow() ? vRow().className : '(keine Zeile)');
    vZu.w.close();
    /* UND AUFGEKLAPPT STEHT ER IMMER DA. */
    const vOpen = buildDom(JSDOMv, { tags: vTags });
    await until(vOpen.w, (x) => x.document.getElementById('f-tagrow') && openRequests(x) === 0,
      2000, 'die Tagzeile der Uebersicht');
    const vOpenRow = () => vOpen.w.document.getElementById('f-tagrow');
    vOpen.w.limitCloud = () => true;
    vOpenRow()?.querySelector('.pill-tag')?.click();
    await vChosen(vOpen.w, 1);
    vOpenRow()?.querySelector('.pill-tag.on')?.click();
    await vChosen(vOpen.w, 0);
    check('Der Griff zum Aufklappen steht da, sobald etwas abgeschnitten ist',
      !!vOpenRow()?.querySelector('.frow-right-end .link-btn'),
      vOpenRow() ? vOpenRow().innerHTML.slice(0, 120) : '(keine Zeile)');
    vOpenRow()?.querySelector('.frow-right-end .link-btn')?.click();
    await until(vOpen.w, (x) => openRequests(x) === 0 &&
      x.document.querySelector('#f-tagrow .frow-right-end .link-btn')?.title === x.t('list.less'),
      2000, 'die aufgeklappte Tagzeile');
    check('Aufgeklappt steht er da, auch ohne Auswahl',
      !!vOpenRow() && vOpenRow().classList.contains('tags-live'),
      vOpenRow() ? vOpenRow().className : '(keine Zeile)');
    /* UND DER HAKEN DREHT SICH: nach unten, solange zugeklappt ist, nach oben,
       wenn offen. Gemessen am Titel, denn der sagt, was der Griff tut. */
    const vCheck = vOpenRow()?.querySelector('.frow-right-end .link-btn');
    check('Und der Haken zeigt dann nach oben und sagt „weniger"',
      !!vCheck && vCheck.getAttribute('title') === 'weniger' &&
      vCheck.innerHTML.includes('M6 14.5L12 8.5l6 6'),
      vCheck ? `„${vCheck.getAttribute('title')}"` : '(kein Griff)');
    vOpen.w.close();
  }
}

/* ================================================================= 0.30.3 —
   „Die zugeklappte Tagzeile fuellt, was sie ohnehin kostet" EIN BEFUND, DREI
   BAUABSCHNITTE. */
async function check0303() {
  const wCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  const wApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  const wNarrow = (wCss.match(/@media \(max-width: 700px\), \(max-height: 500px\) and \(max-width: 960px\) \{[\s\S]*$/) || [''])[0];
  let JSDOMw;
  try { ({ JSDOM: JSDOMw } = require('jsdom')); } catch { JSDOMw = null; }

  group('Die zugeklappte Tagzeile fuellt ihre Hoehe — 0.30.3');
  {
    check('jsdom steht fuer die Tagzeile bereit', !!JSDOMw, 'ohne jsdom keine Oberflaechenprobe');

    /* ---- Zusage 1: die Zeilenhoehe wird an EINER Stelle gemessen ---- Zwei
       Leser fragen sie. */
    check('Die Zeilenhoehe einer Wolke wird an EINER Stelle gemessen',
      /function cloudLine\(box\) \{/.test(wApp) &&
      (wApp.match(/firstElementChild;\s*\n\s*return first \? first\.offsetHeight/g) || []).length === 1,
      (wApp.match(/first\.offsetHeight[^\n]*/g) || ['(nicht gefunden)']).join(' | '));
    check('Und beide Leser fragen dort',
      /function limitCloud\(box, rows\) \{[\s\S]{0,400}?const height = cloudLine\(box\);/.test(wApp) &&
      /function cloudRows\(box\) \{\s*\n\s*const height = cloudLine\(box\);/.test(wApp));

    /* ---- Zusage 2: cloudRows zaehlt die Reihen UNGEKUERZT ---- GEFAHREN UND
       NICHT GELESEN, und zwar am Mock: jsdom rechnet keine Hoehen, also
       bekommt die Zeile einen Kasten, der welche nennt. */
    const wEmpty = buildDom(JSDOMw, { tags: [] });
    await until(wEmpty.w, (x) => x.document.getElementById('count') && openRequests(x) === 0,
      2000, 'die Uebersicht');
    const wWindow = wEmpty.w;
    const wBox = (high, full) => ({ firstElementChild: { offsetHeight: high }, scrollHeight: full });
    check('cloudRows zaehlt EINE Reihe als eine',
      wWindow.cloudRows(wBox(27, 27)) === 1, String(wWindow.cloudRows(wBox(27, 27))));
    check('Und ZWEI Reihen als zwei — auch hinter einer Begrenzung',
      wWindow.cloudRows(wBox(27, 60)) === 2, String(wWindow.cloudRows(wBox(27, 60))));
    check('Und dreissig Reihen als dreissig',
      wWindow.cloudRows(wBox(27, 30 * 27 + 29 * 6)) === 30,
      String(wWindow.cloudRows(wBox(27, 30 * 27 + 29 * 6))));
    /* EIN EINGEKLAPPTER BLOCK MISST NULL -- seine Kinder stehen auf
       display: none. Null heisst „nicht messbar" und nicht „keine Reihe". */
    check('Eine Wolke ohne messbare Hoehe meldet null Reihen',
      wWindow.cloudRows(wBox(0, 0)) === 0 &&
      wWindow.cloudRows({ firstElementChild: null, scrollHeight: 0 }) === 0);
    /* ---- Zusage 3: beide rechnen mit derselben Zeilenhoehe ---- DIE
       BEGRENZUNG SETZT EINE HOEHE, DER ZAEHLER LIEST EINE -- und was die eine
       fuer zwei Reihen haelt, muss die andere ebenso. */
    const wMeasure = { firstElementChild: { offsetHeight: 27 }, scrollHeight: 999,
      clientHeight: 0, style: {} };
    wWindow.limitCloud(wMeasure, 2);
    check('Was die Begrenzung fuer zwei Reihen haelt, haelt der Zaehler ebenso',
      wMeasure.style.maxHeight === '60px' &&
      wWindow.cloudRows(wBox(27, parseInt(wMeasure.style.maxHeight, 10))) === 2,
      `Begrenzung ${wMeasure.style.maxHeight}`);
    wEmpty.w.close();

    /* ---- Zusage 4 und 5: zwei Reihen am Telefon, eine am Schreibtisch ----
       DIE ZAHL HAENGT AM STILBLATT UND NICHT AN EINER ZWEITEN BEDINGUNG: das
       Raster gibt es nur im schmalen Abschnitt, also ist `display: grid` die
       Antwort auf „steht die Zeile am Telefon". */
    const wTags = [
      { id: 61, name: 'Alu', usage_count: 3, test_usage_count: 0 },
      { id: 62, name: 'Stahl', usage_count: 2, test_usage_count: 0 },
      { id: 63, name: 'Holz', usage_count: 1, test_usage_count: 0 }
    ];
    const wDom = buildDom(JSDOMw, { tags: wTags });
    await until(wDom.w, (x) => x.document.getElementById('f-tagrow') && openRequests(x) === 0,
      2000, 'die Tagzeile der Uebersicht');
    const w = wDom.w;
    const wRow = () => w.document.getElementById('f-tagrow');
    const wChosen = (n) => until(w, (x) => openRequests(x) === 0 &&
      x.document.querySelectorAll('#f-tagrow .pill-tag.on').length === n, 2000, `${n} gewaehlte Tags`);
    let wCalls = [];
    const wRealLimit = w.limitCloud;
    w.limitCloud = (box, rows) => { wCalls.push(rows); return wRealLimit(box, rows); };
    /* JSDOM MELDET FUER EIN DIV KEIN RASTER -- das ist der Schreibtisch. */
    wCalls = [];
    wRow()?.querySelector('.pill-tag')?.click();
    await wChosen(1);
    check('Am Schreibtisch zeigt die zugeklappte Wolke EINE Reihe',
      wCalls.length > 0 && wCalls[wCalls.length - 1] === 1, `gerufen mit ${wCalls.join(', ')}`);
    /* UND JETZT DAS TELEFON: die Antwort des Stilblatts wird fuer diese eine
       Zeile getauscht -- jsdom wertet den schmalen Abschnitt nicht aus. */
    const wRealStyle = w.getComputedStyle.bind(w);
    w.getComputedStyle = (el, ...rest) =>
      (el && el.id === 'f-tagrow') ? { display: 'grid' } : wRealStyle(el, ...rest);
    wCalls = [];
    wRow()?.querySelector('.pill-tag.on')?.click();
    await wChosen(0);
    check('Am Telefon zeigt sie ZWEI — die Hoehe ist ohnehin bezahlt',
      wCalls.length > 0 && wCalls[wCalls.length - 1] === 2, `gerufen mit ${wCalls.join(', ')}`);
    /* ---- Zusage 6: aufgeklappt gilt keine Begrenzung ---- Die Zahl gilt nur
       zugeklappt. */
    w.limitCloud = (box, rows) => { wCalls.push(rows); return true; };
    wCalls = [];
    wRow()?.querySelector('.pill-tag')?.click();
    await wChosen(1);
    wRow()?.querySelector('.frow-right-end .link-btn')?.click();
    await until(w, (x) => openRequests(x) === 0 &&
      x.document.querySelector('#f-tagrow .frow-right-end .link-btn')?.title === x.t('list.less'),
      2000, 'die aufgeklappte Tagzeile');
    check('Aufgeklappt gilt keine Begrenzung',
      wCalls[wCalls.length - 1] === 0, `gerufen mit ${wCalls.join(', ')}`);

    /* ---- Zusage 7: die Anordnung gilt nur, wo die Wolke sie traegt ---- BEI
       EINEM JUNGEN BESTAND GIBT ES KEINE ZWEITE REIHE ZU ZEIGEN -- gemessen
       mit drei Tags blieb die Zeile bei 62 und die Wolke bei 27, mit zwei
       Reihen genauso. */
    w.limitCloud = wRealLimit;
    const wRealCounter = w.cloudRows;
    w.cloudRows = () => 2;
    wRow()?.querySelector('.pill-tag')?.click();
    await wChosen(0);
    check('Ab ZWEI Reihen traegt die Zeile `tags-deep`',
      !!wRow()?.classList.contains('tags-deep'), wRow() ? wRow().className : '(keine Zeile)');
    w.cloudRows = () => 1;
    /* EIN KLICK AUF DIE ERSTE PILLE UND NICHT AUF EINE GEWAEHLTE: sortCloud()
       stellt die gewaehlten nach vorn, der erste Klick hat die eine also
       wieder abgewaehlt -- und `.pill-tag.on` traf danach ins Leere. */
    wRow()?.querySelector('.pill-tag')?.click();
    await wChosen(1);
    check('Bei EINER Reihe traegt sie es nicht',
      !!wRow() && !wRow().classList.contains('tags-deep'),
      wRow() ? wRow().className : '(keine Zeile)');
    w.cloudRows = wRealCounter;
    wDom.w.close();

    /* ---- Zusage 8 bis 10: was ohne `tags-deep` gilt ---- DIE GRUNDREGEL
       GREIFT WIEDER -- die Zeichen stehen am Zeilenende, wie an jeder anderen
       Filterzeile. */
    for (const [wName, wRule] of [
      ['Die Verweise stehen nur MIT `tags-deep` in Spalte eins',
        /\.frow-tags\.tags-deep > \.frow-right-end \{ grid-column: 1;/],
      ['Die dritte Rasterzeile gibt es nur MIT `tags-deep`',
        /\.frow-tags\.tags-deep \{ grid-template-rows: auto auto 1fr; \}/],
      ['Und der Umschalter steht nur dort in der dritten',
        /\.frow-tags\.tags-deep > \.tagmode \{ grid-row: 3; \}/]
    ]) check(wName, wRule.test(wNarrow), (wNarrow.match(wRule) || ['(keine Regel)'])[0]);
    /* UND KEINE DER DREI STEHT OHNE TRAEGER DA. */
    check('Und keine der drei steht daneben noch ohne Traeger',
      !/\.frow-tags > \.frow-right-end \{/.test(wNarrow) &&
      !/\.frow-tags \{ grid-template-rows: auto auto 1fr; \}/.test(wNarrow) &&
      !/\.frow-tags > \.tagmode \{ grid-row: 3; \}/.test(wNarrow),
      (wNarrow.match(/\.frow-tags[^\n{]*\{[^}]{0,60}/g) || []).slice(0, 6).join(' | '));
    check('Ohne `tags-deep` traegt die Zeile zwei Rasterzeilen — die Bauform von 0.30.1',
      /\.frow-tags \{ grid-template-rows: auto 1fr; \}/.test(wNarrow));
    check('Und der Umschalter steht dann in der zweiten',
      /\.frow-tags > \.tagmode \{ grid-column: 1; grid-row: 2;/.test(wNarrow));
    /* DIE WOLKE SPANNT IN BEIDEN FASSUNGEN UEBER ALLE RASTERZEILEN -- `1 / -1`
       nennt keine Zahl und gilt deshalb fuer zwei wie fuer drei. */
    check('Und die Wolke spannt in beiden Fassungen ueber alle Rasterzeilen',
      /\.frow-tags > \.pills\.cloud \{ grid-row: 1 \/ -1;/.test(wNarrow));

    /* ---- Zusage 11 und 12: die beiden anderen Wolken bleiben ---- KEINE VON
       BEIDEN HAT EIN LOCH ZU FUELLEN: die Wolke im Eintrag steht in keinem
       Raster mit Beschriftungsspalte und traegt ihr „mehr" als Wort in einem
       eigenen Kasten; die Tagzeile eines Testtags ist eine Flexzeile, und
       0.30.1 hat sie genau dafuer gebaut. */
    check('Die Wolke im Eintrag bleibt bei DREI Reihen',
      /limitCloud\(box, cloudOpen\.detail \? 0 : 3\)/.test(wApp));
    check('Und die Tagzeile eines Testtags bei EINER',
      /limitCloud\(tagBox, opened \? 0 : 1\)/.test(wApp));
  }
}
  await check0300();
  await check0301();
  await check0302();
  await check0303();
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
