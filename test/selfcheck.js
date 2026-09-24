/* Kriterion — Pruefstand: der Pruefstand ueber sich selbst Die Gegenproben
   greifen, die Laenge der Funktionen wird gemessen, das Skript auf dem Wirt
   ist ausfuehrbar, die berichtigten Behauptungen stehen nirgends mehr, und
   die Compose-Datei wird nicht ueberschrieben. */
const H = require('./frame.js');

async function run() {
  const {
   fs, path, execFileSync, spawnSync, attachments, sharp, segment, CODE, COMMENT, REGEX,
   readmeFlat, __dirname, require, group, check, equal, PORT, open,
   benchFiles
  } = H;
  /* Dieses Modul ruft den Hauptserver. Es startet ihn fuer sich --
     siehe mainServerReady() in test/frame.js. */
  await H.mainServerReady();

  /* ================= Die Gegenproben greifen — 0.13.0 ================== EIN
     RUECKBAU, DER INS LEERE GREIFT, SIEHT AUS WIE EINER, DER NICHTS BEWIRKT. */
  group('Die Gegenproben greifen');

  const gpList = require('./counterproof').REGRESSIONS;
  // Die Zahl der Rueckbauten steht ausdruecklich da: eine Zahl in einem
  // Papier ist eine Behauptung, eine Zahl im Pruefstand ist ein Beleg. Wie
  // sie Runde fuer Runde gewachsen ist, steht in den Aenderungsprotokollen.
  check(`Es sind genau 1149 Rueckbauten`, gpList.length === 1149, `${gpList.length}`);
  const gpTwice = gpList.map(r => r.nr).filter((n, i, a) => a.indexOf(n) !== i);
  check('Und keine Nummer steht zweimal', gpTwice.length === 0, gpTwice.join(' '));
  /* JEDER GREIFT: der Suchtext kommt in seiner Datei GENAU EINMAL vor. */
  /* JEDE DATEI EINMAL LESEN -- 0.35.0, BA 7. Die Schleife las fuer jeden der
     ueber tausend Rueckbauten seine Datei neu ein und legte danach ein
     split() ueber den ganzen Inhalt; es sind 32 verschiedene Dateien, und
     counterproof.js allein misst 437 kB. */
  const gpFail = [];
  const gpText = new Map();
  const gpFileText = (file) => {
    if (!gpText.has(file)) gpText.set(file, fs.readFileSync(file, 'utf8'));
    return gpText.get(file);
  };
  for (const r of gpList) {
    const file = path.join(__dirname, r.file);
    if (!fs.existsSync(file)) { gpFail.push(`${r.nr}: ${r.file} gibt es nicht`); continue; }
    if (r.copy) continue;
    const n = gpFileText(file).split(r.search).length - 1;
    if (n !== 1) gpFail.push(`${r.nr} (${r.file}): ${n} Treffer`);
  }
  /* UND DIE ZAHL DER GELESENEN DATEIEN STEHT DA: sie ist der Beleg, dass die
     Schleife wirklich nur einmal je Datei liest. */
  // Fuenfundvierzig: Rueckbauten fassen auch die Compose-Vorlage und ein Pruefmodul an.
  check('Der Waechter liest hoechstens fuenfundvierzig Dateien',
    gpText.size <= 45, `${gpText.size} Dateien fuer ${gpList.length} Rueckbauten`);
  check('Jeder Suchtext kommt in seiner Datei genau einmal vor',
    gpFail.length === 0, gpFail.join(' · '));
  // Ein Ersatz, der dem Suchtext gleicht, baut nichts zurueck -- die Kopie
// waere wortgleich mit dem Kopf des Zweiges, und alles bliebe gruen.
  const gpEqual = gpList.filter(r => r.search !== undefined && r.search === r.replacement);
  check('Und kein Ersatz ist mit seinem Suchtext wortgleich',
    gpEqual.length === 0, gpEqual.map(r => r.nr).join(' '));
  // Jeder Eintrag traegt entweder eine Textersetzung ODER eine Kopie, nie
// beides und nie keines von beiden.
  const gpForm = gpList.filter(r =>
    (r.copy === undefined) === (r.search === undefined || r.replacement === undefined));
  check('Jeder Rueckbau traegt entweder Suche und Ersatz oder eine Kopie',
    gpForm.length === 0, gpForm.map(r => r.nr).join(' '));
  // Und er nennt die Gruppe, in der die roten Punkte erwartet werden.
  const gpWithoutExpected = gpList.filter(r => !r.expected || !r.name);
  check('Und jeder nennt Name und erwartete Gruppe',
    gpWithoutExpected.length === 0, gpWithoutExpected.map(r => r.nr).join(' '));

  /* ---- JEDER RUECKBAU LAESST EINE LADBARE DATEI ZURUECK — 0.35.2, BA 7 ----
     Gegenprobe 330 setzte `${tMark(…, 'entry.grade',` auf `${tH(…, { word: '',`
     und liess die schliessende Klammer des alten Rufs stehen. public/app.js
     liess sich danach nicht mehr laden, und der Treiber meldete ABGERISSEN
     statt ROT. EIN RUECKBAU, DER DIE DATEI ZERBRICHT, BELEGT NICHTS: er zeigt
     nicht, dass die Pruefung greift, sondern nur, dass kaputter Code kaputt
     ist. Gemessen wird hier, nicht von Hand.
     KOMPILIERT UND NICHT AUSGEFUEHRT: `new vm.Script` uebersetzt den Text und
     laeuft ihn nicht. Der Rumpf steht dabei in derselben Huelle, in die Node
     ein Modul stellt -- sonst waere `return` auf oberster Ebene ein Fehler,
     und counterproof.js traegt eines. Die Zeile mit `#!` faellt davor weg:
     Node nimmt sie heraus, vm.Script nicht. */
  const vm = require('vm');
  const gpShell = (text) =>
    '(function (exports, require, module, __filename, __dirname) {'
    + text.replace(/^#![^\n]*/, '') + '\n});';
  const gpTorn = [];
  let gpCompiled = 0;
  for (const r of gpList) {
    if (r.replacement === undefined || !r.file.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(__dirname, ...r.file.split('/')), 'utf8');
    /* Ein Suchtext, der nicht trifft, wird weiter oben gemeldet -- hier
       waere er ein zweites Mal dieselbe Meldung. */
    if (!src.includes(r.search)) continue;
    gpCompiled++;
    try { new vm.Script(gpShell(src.replace(r.search, r.replacement)), { filename: r.file }); }
    catch (e) { gpTorn.push(`${r.nr} (${r.file}): ${e.message}`); }
  }
  check('Der Waechter uebersetzt jeden Rueckbau an einer .js-Datei',
    gpCompiled > 700, `${gpCompiled} von ${gpList.length} Rueckbauten`);
  check('Und jeder laesst eine Datei zurueck, die sich uebersetzen laesst',
    gpTorn.length === 0, gpTorn.slice(0, 6).join(' · ') || 'keine abgerissen');
  /* UND DER WAECHTER FAENGT DEN FALL, DEN ER MEINT: eine Klammer, die stehen
     bleibt. Gestellt und nachgemessen -- ohne diese Zeile waere die darueber
     auch dann gruen, wenn gar nichts mehr uebersetzt wuerde. */
  const gpBroken = 'const a = f(1,\n  2);'.replace('f(1,', 'g(1, { x: 1,');
  let gpCaught = false;
  try { new vm.Script(gpShell(gpBroken), { filename: 'gestellt.js' }); }
  catch { gpCaught = true; }
  check('Und er faengt einen Rueckbau, der die Klammer stehen laesst',
    gpCaught, 'der Waechter sieht den gestellten Abriss nicht');

  /* ---- DIE MELDUNG „STUMM" MUSS EINEN STUMMEN RUECKBAU AUCH SEHEN KOENNEN. */
  const gpRead = require('./counterproof').readRun;
  check('Der Leser der Gegenprobe ist von aussen erreichbar',
    typeof gpRead === 'function', typeof gpRead);
  const gpOnlySelf = gpRead([
    '── Die Gegenproben greifen ─────',
    '  ✗ Jeder Suchtext kommt in seiner Datei genau einmal vor',
    '  4346 von 4347 Pruefungen bestanden'
  ].join('\n'));
  check('Ein Lauf, der NUR die Selbstprobe rot macht, gilt als stumm',
    gpOnlySelf.red.length === 1 && gpOnlySelf.byContentRed.length === 0,
    JSON.stringify([gpOnlySelf.red.length, gpOnlySelf.byContentRed.length]));
  /* DIE GEGENLAGE, sonst belegt die Zeile darueber nichts: dieselbe Selbstprobe
     mit EINER inhaltlichen Zeile daneben gilt sehr wohl als greifend. */
  const gpIncludingContent = gpRead([
    '── Die Begruendung kommt zur Ruhe — 0.15.0 ─────',
    '  ✗ Escape schliesst das Feld, ohne etwas zu schicken',
    '── Die Gegenproben greifen ─────',
    '  ✗ Jeder Suchtext kommt in seiner Datei genau einmal vor',
    '  4345 von 4347 Pruefungen bestanden'
  ].join('\n'));
  check('Und einer mit einer inhaltlichen Zeile daneben nicht',
    gpIncludingContent.red.length === 2 && gpIncludingContent.byContentRed.length === 1 &&
    gpIncludingContent.byContentRed[0].group === 'Die Begruendung kommt zur Ruhe — 0.15.0',
    JSON.stringify(gpIncludingContent.byContentRed));
  /* UND DIE DRITTE LAGE, an der es bis 0.16.0 falsch stand: eine ANDERE rote
     Zeile IN der Gruppe „Die Gegenproben greifen". */
  const gpOwnGroup = gpRead([
    '── Die Gegenproben greifen ─────',
    '  ✗ Jeder Suchtext kommt in seiner Datei genau einmal vor',
    '  ✗ Eine Nummer als Argument greift NICHT in die Namen hinein',
    '  4345 von 4347 Pruefungen bestanden'
  ].join('\n'));
  check('Eine ANDERE rote Zeile derselben Gruppe zaehlt sehr wohl',
    gpOwnGroup.red.length === 2 && gpOwnGroup.byContentRed.length === 1 &&
    gpOwnGroup.byContentRed[0].name === 'Eine Nummer als Argument greift NICHT in die Namen hinein',
    JSON.stringify(gpOwnGroup.byContentRed));

  /* ---- EIN ABGERISSENER LAUF MUSS SAGEN, WARUM -- 0.20.1. */
  const gpTeardown = gpRead([
    '── Alte Sicherungen aufraeumen: der echte Ordner ─────',
    '  ✓ Sieben Kopien liegen im Ordner',
    '  ✗ Die Nummern laufen von 1 bis 7',
    'node:events:497',
    '      throw er;',
    'Error: listen EADDRINUSE: address already in use 127.0.0.1:6110'
  ].join('\n'));
  check('Ein Lauf ohne Schlussblock gilt als abgerissen',
    gpTeardown.ranThrough === false && gpTeardown.teardown === null,
    JSON.stringify([gpTeardown.ranThrough, gpTeardown.teardown]));
  check('Und er hebt die letzten Zeilen auf, damit der Grund lesbar bleibt',
    gpTeardown.tail?.includes('Error: listen EADDRINUSE: address already in use 127.0.0.1:6110'),
    JSON.stringify(gpTeardown.tail));
  /* UND DER BERICHT MUSS SIE AUCH DRUCKEN. Ein Schwanz, den nur der Leser
     kennt, hilft niemandem: gelesen wird die Tabelle. */
  const gpTable = require('./counterproof').writeTable;
  const printed = [];
  const realLog = console.log;
  console.log = (...parts) => printed.push(parts.join(' '));
  try {
    gpTable([{ nr: '568', name: 'Ein Rueckbau', file: 'server.js', trace: 0,
                 seconds: 79, code: 1, ...gpTeardown }]);
  } finally { console.log = realLog; }
  check('Und der Bericht druckt sie unter den Abriss',
    printed.some(z => z.includes('LAUF ABGERISSEN')) &&
    printed.some(z => z.includes('EADDRINUSE')),
    JSON.stringify(printed.filter(z => /ABGERISSEN|│/.test(z))));

  /* ---- WELCHES ARGUMENT WELCHEN RUECKBAU MEINT -- 0.16.0. */
  const gpMatches = require('./counterproof').matchesRegression;
  check('Die Regel, welches Argument welchen Rueckbau meint, ist von aussen erreichbar',
    typeof gpMatches === 'function', typeof gpMatches);
  const gpCase = { nr: '83', name: 'SHA-256 statt SHA-1' };
  check('Eine Nummer als Argument greift NICHT in die Namen hinein',
    gpMatches(gpCase, '256') === false, JSON.stringify(gpMatches(gpCase, '256')));
  /* DIE GEGENLAGE, sonst belegte die Zeile darueber nichts: dieselbe Nummer
     an ihrem eigenen Rueckbau greift sehr wohl -- die Regel darf nicht
     einfach alles abweisen, was aus Ziffern besteht. */
  check('Und dieselbe Nummer greift an ihrem eigenen Rueckbau',
    gpMatches({ nr: '256', name: 'Ein anderer Rueckbau' }, '256') === true,
    JSON.stringify(gpMatches({ nr: '256', name: 'Ein anderer Rueckbau' }, '256')));
  // Der Weg ueber den Namen bleibt, solange das Argument kein reiner Zahlwert
// ist: wer nach Text sucht, schreibt Text.
  check('Ein Text als Argument greift weiterhin in die Namen',
    gpMatches(gpCase, 'sha') === true && gpMatches(gpCase, 'SHA-256') === true,
    JSON.stringify([gpMatches(gpCase, 'sha'), gpMatches(gpCase, 'SHA-256')]));
  // Die Wortnummern sind keine reinen Ziffernfolgen und gehen deshalb weiter
// ueber beide Wege -- sonst waeren W2, W5 und W6 unerreichbar geworden.
  check('Und die Wortnummern bleiben erreichbar',
    gpMatches({ nr: 'W2', name: 'Eine Portbasis' }, 'W2') === true &&
    gpMatches({ nr: 'W2', name: 'Eine Portbasis' }, 'w2') === true,
    'W2 / w2');
  /* UND DIE PROBE AN DER ECHTEN LISTE. */
  const gp256 = gpList.find(r => r.nr === '256');
  const gp83 = gpList.find(r => r.nr === '83');
  check('Die beiden Rueckbauten des Befundes stehen in der Liste',
    !!gp256 && !!gp83 && /256/.test(gp83.name),
    `${gp256 ? gp256.nr : '—'} / ${gp83 ? gp83.name : '—'}`);
  if (gp256 && gp83) {
    const gpHit = gpList.filter(r => gpMatches(r, '256')).map(r => r.nr);
    check('Das Argument 256 waehlt an der echten Liste genau einen Rueckbau',
      gpHit.length === 1 && gpHit[0] === '256', gpHit.join(' '));
  }

  /* ---- KEIN FREMDER SERVER, BEVOR DIE GEGENPROBEN LOSFAHREN -- 0.21.0 ----
     DER BEFUND: sieben Server aus abgebrochenen Laeufen hingen noch an den
     Ports 6180 bis 6242, mitten im Fenster der Mailgruppe. */
  const gpForeign = require('./counterproof').foreignServer;
  check('Die Suche nach fremden Servern ist von aussen erreichbar',
    typeof gpForeign === 'function', typeof gpForeign);
  const gpFound = typeof gpForeign === 'function' ? gpForeign() : [];
  /* DER GEGENSTAND SIND DIE SERVER DIESES LAUFS. */
  const gpOwn = gpFound.find(f => f.script === 'server.js' && f.wo === __dirname);
  check('Und sie findet die laufenden Server dieses Laufs',
    Boolean(gpOwn), `${gpFound.length} gefunden: ` +
    gpFound.map(f => `${f.pid}:${f.script}`).slice(0, 6).join(' '));
  /* UND SIE SAGT, WO EINER LIEGT UND AUF WELCHEM PORT. */
  check('Und sie nennt zu jedem Fund Verzeichnis und Port',
    Boolean(gpOwn) && gpOwn.wo === __dirname && /^\d+$/.test(gpOwn.port || ''),
    JSON.stringify(gpOwn));
  /* SICH SELBST MELDET SIE NICHT. Der Treiber ist kein fremder Server -- ohne
     diese Zeile braeche er an sich selbst ab und faende nie einen Rueckbau. */
  check('Und sich selbst meldet sie nicht',
    !gpFound.some(f => f.pid === process.pid),
    `eigene Nummer ${process.pid}, gefunden ${gpFound.map(f => f.pid).join(' ')}`);
  /* DER TREIBER RUFT SIE AUCH -- und geht, statt zu warnen. */
  const gpSource = fs.readFileSync(path.join(__dirname, 'counterproof.js'), 'utf8');
  const gpOneLine = gpSource.replace(/\s+/g, ' ');
  /* SEIT 0.30.0 SIND ES ZWEI BLICKE (F7): der ueber die Befehlszeile und der
     ueber die Ports. */
  check('Der Treiber sieht vor dem ersten Rueckbau nach und bricht ab',
    gpOneLine.includes('const foreign = foreignServer(); const busy = foreignPort(foreign.map(f => f.port)); if (foreign.length || busy.length) {') &&
    /if \(foreign\.length \|\| busy\.length\) \{[\s\S]{0,1400}?process\.exit\(1\);/.test(gpSource) &&
    gpSource.indexOf('const foreign = foreignServer();') <
      gpSource.indexOf('await runAll(list, traces, level)'),
    (gpOneLine.match(/const foreign = foreignServer\(\)[^;]*/) || ['(nicht gefunden)'])[0]);
  /* UND SIE SUCHT NACH BEIDEN NAMEN. Ein liegengebliebener PRUEFLAUF belegt
     genauso Ports wie ein liegengebliebener Server -- er startet ja welche. */
  check('Und sie sucht nach beiden Namen -- Server wie Prueflauf',
    gpSource.includes('const script = parts.find(t => /(^|\\/)(server\\.js|testbench\\.js|test\\/[a-z0-9_]+\\.js)$/.test(t));'),
    (gpSource.match(/const script = parts\.find[^\n]*/g) || ['(nicht gefunden)']).pop());
  /* UND `pruefung.js` STEHT IN KEINER ZEILE CODE MEHR. */
  const gpCode = gpSource.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
  check('Und der Name, den es nie gab, steht in keiner Zeile Code mehr',
    !/pruefung\.js/.test(gpCode), 'pruefung.js steht noch im Code von counterproof.js');

  /* ================= Die Wartezeiten des Pruefstands — 0.35.0 =============
     BEFUND test/dom.js:1316 DER MESSUNG ZUR 0.35.0: 626 feste Wartezeiten in
     den Modulen unter test/, zusammen 59.635 ms. Die Module laufen
     nacheinander, also liegt jede dieser Millisekunden auf der Laufzeit.
     DIESE RUNDE BAUT DAS WERKZEUG UND NIMMT DIE ELF TEUERSTEN STELLEN: die
     Wartezeiten von 1100 ms in test/roundtrip.js warteten auf die naechste
     Sekundengrenze der Uhr und warteten dafuer im Mittel doppelt so lange wie
     noetig. Die uebrigen 615 Stellen warten auf das Neuzeichnen eines
     Fensters; jede von ihnen braucht ihre eigene Bedingung, und das ist eine
     eigene Runde. */
  group('Die Wartezeiten des Pruefstands — 0.35.0');
  {
    const wtRead = (f) => fs.readFileSync(path.join(__dirname, 'test', f), 'utf8');
    const wtDom = wtRead('dom.js');
    const wtFrame = wtRead('frame.js');
    const wtRound = wtRead('roundtrip.js');
    /* DAS WERKZEUG STEHT DA UND WIRFT AN DER GRENZE. */
    check('Der Helfer steht in test/dom.js',
      /async function until\(w, condition, limitMs = \d+, what = /.test(wtDom),
      (wtDom.match(/.*async function until\(.*/) || ['(nicht gefunden)'])[0].trim());
    check('Und er wirft an der Grenze, statt stillschweigend weiterzulaufen',
      /throw new Error\(`until\(\): \$\{what\} ist in \$\{limitMs\} ms nicht eingetreten`\)/.test(wtDom),
      (wtDom.match(/.*until\(\): .*/) || ['(kein Wurf)'])[0].trim());
    check('Und er fragt in Fuenf-Millisekunden-Schritten',
      /const UNTIL_STEP = 5;/.test(wtDom),
      (wtDom.match(/const UNTIL_STEP = .*/) || ['(keine Schrittweite)'])[0]);
    /* UND DIE SEKUNDENGRENZE HAT IHREN EIGENEN HELFER. */
    check('Der Helfer fuer die Sekundengrenze steht in test/frame.js',
      /async function nextSecond\(limitMs = \d+\)/.test(wtFrame),
      (wtFrame.match(/.*async function nextSecond\(.*/) || ['(nicht gefunden)'])[0].trim());
    check('Und er wartet auf die Grenze und nicht auf eine Dauer',
      /while \(Math\.floor\(Date\.now\(\) \/ 1000\) === now\)/.test(wtFrame),
      (wtFrame.match(/.*Math\.floor\(Date\.now\(\) \/ 1000\).*/) || ['(keine Grenze)'])[0].trim());
    /* UND DIE ELF STELLEN SIND WIRKLICH UMGESTELLT. */
    const wtElf = (wtRound.match(/await nextSecond\(\);/g) || []).length;
    check('Die elf Stellen in test/roundtrip.js rufen den Helfer',
      wtElf === 11, `${wtElf} Aufrufe`);
    check('Und es steht dort keine Wartezeit von 1100 ms mehr',
      !/setTimeout\(r, 1100\)/.test(wtRound),
      (wtRound.match(/.*setTimeout\(r, 1100\).*/) || ['keine mehr'])[0].trim());
    // Bleiben duerfen der Schritt in nextSecond() und Wartezeiten, die pruefen, dass nichts geschieht.
    const WAITS_REMAINING = 30;
    let wtSum = 0, wtCount = 0;
    const wtBare = [];
    for (const f of fs.readdirSync(path.join(__dirname, 'test')))
      if (/\.js$/.test(f)) {
        const lines = wtRead(f).split('\n');
        lines.forEach((z, i) => {
          const m = z.match(/setTimeout\(r,\s*(\d+)\)/);
          if (!m) return;
          wtSum += Number(m[1]); wtCount++;
          const before = (lines[i - 1] || '').trim();
          if (!/^\/\/|\*\/$/.test(before)) wtBare.push(`test/${f}:${i + 1}`);
        });
      }
    check(`Die Zahl der festen Wartezeiten in test/ ist genau die der bleibenden (${WAITS_REMAINING})`,
      wtCount === WAITS_REMAINING, `${wtCount} Stellen, zusammen ${wtSum} ms`);
    check('Und jede bleibende hat einen Kommentar in der Zeile darueber',
      wtBare.length === 0, wtBare.join(' · ') || 'alle kommentiert');
  }

  /* ================= Die Ersatztexte der Rueckbauten — 0.34.1 =============
     Ein Suchtext, der nicht mehr passt, faellt sofort auf: der Rueckbau
     bricht ab und wird gemeldet. */
  group('Die Ersatztexte der Rueckbauten — 0.34.1');

  const rpWord = /[A-Za-z_$][A-Za-z0-9_$]*/g;
  const rpFiles = (() => {
    const found = [];
    (function walk(where) {
      for (const e of fs.readdirSync(where, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === 'data') continue;
        const p = path.join(where, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(js|html)$/.test(e.name)) found.push(p);
      }
    })(__dirname);
    return found;
  })();
  const rpAllWords = new Set();
  for (const f of rpFiles)
    for (const m of fs.readFileSync(f, 'utf8').matchAll(rpWord)) rpAllWords.add(m[0]);
  check('Der Waechter sieht die Woerter des ganzen Projekts',
    rpFiles.length >= 40 && rpAllWords.size > 20000,
    `${rpFiles.length} Dateien, ${rpAllWords.size} verschiedene Woerter`);

  const rpUnknown = [];
  for (const r of gpList) {
    if (!r.replacement) continue;
    const miss = [...new Set([...r.replacement.matchAll(rpWord)].map(m => m[0]))]
      .filter(n => !rpAllWords.has(n));
    if (miss.length) rpUnknown.push(`${r.nr} ${r.file}: ${miss.join(' ')}`);
  }
  check('Kein Ersatztext nennt ein Wort, das es im Projekt nirgends gibt',
    rpUnknown.length === 0, rpUnknown.slice(0, 6).join(' · '));

  /* Die schaerfere Fassung. Gelesen wird nur CODE: ein Name in einem Text ist
     keine Benennung. */
  const rpCodeNames = (text, file) => {
    const found = new Set();
    for (const part of segment(text, file))
      if (part.kind === CODE)
        for (const m of part.value.matchAll(rpWord)) found.add(m[0]);
    return found;
  };
  const rpBuiltIn = new Set([...Object.getOwnPropertyNames(Array.prototype),
    ...Object.getOwnPropertyNames(String.prototype),
    ...Object.getOwnPropertyNames(Object.prototype),
    ...Object.getOwnPropertyNames(Promise.prototype)]);
  const rpBench = new Set([...benchFiles(), 'counterproof.js']);
  const rpFrame = new Set([
    ...rpCodeNames(fs.readFileSync(path.join(__dirname, 'test', 'frame.js'), 'utf8'), 'test/frame.js'),
    ...rpCodeNames(fs.readFileSync(path.join(__dirname, 'test', 'dom.js'), 'utf8'), 'test/dom.js')]);
  const rpStrange = [];
  let rpChecked = 0;
  for (const r of gpList) {
    if (!r.replacement || !rpBench.has(r.file)) continue;
    rpChecked++;
    const here = rpCodeNames(fs.readFileSync(path.join(__dirname, ...r.file.split('/')), 'utf8'), r.file);
    const searched = rpCodeNames(r.search || '', r.file);
    const miss = [...rpCodeNames(r.replacement, r.file)]
      .filter(n => !here.has(n) && !rpFrame.has(n) && !searched.has(n)
        && !rpBuiltIn.has(n) && !(n in globalThis));
    if (miss.length) rpStrange.push(`${r.nr} ${r.file}: ${miss.join(' ')}`);
  }
  /* 27 WURDEN 29 MIT 0.35.2: der Routenwaechter und die Gestaltprobe
     bekommen je eine Gegenprobe auf ihren eigenen Leser. */
  /* UND 29 WURDEN 31 MIT 0.36.0: der Waechter ueber die Einsetzungen und die
     Gruppe ueber npm audit bekommen je eine. */
  /* UND 31 WURDEN 32: das Verzeichnis der lesenden Routen bekommt eine
     Gegenprobe auf eine falsche Klemme. */
  /* UND 32 WURDEN 33: die Zeitstempel der Sitzungen bekommen eine. */
  // Und 35: eine feste Wartezeit in test/ui_translator.js.
  check('Der Waechter sieht die Rueckbauten auf Pruefstandsdateien',
    rpChecked === 35, `${rpChecked} Rueckbauten`);
  check('Und jeder ihrer Namen steht in der Zieldatei, im Rahmen oder im Suchtext',
    rpStrange.length === 0, rpStrange.slice(0, 6).join(' · '));

  /* Und der Waechter wuerde den Fall von W2 wirklich melden. */
  const rpGone = 'const B = ' + 'starte' + 'WeiterenServer(' + 'frisch' + 'Dir, {}, 4000);';
  const rpToday = 'const B = start' + 'FurtherServer(fresh' + 'Dir, {}, 4000);';
  const rpKnown = (line) => [...line.matchAll(rpWord)].map(m => m[0]).every(n => rpAllWords.has(n));
  check('Der Leser wuerde einen alten Namen im Ersatztext melden',
    !rpKnown(rpGone) && rpKnown(rpToday),
    `alt: ${rpKnown(rpGone)} · heute: ${rpKnown(rpToday)}`);

  /* ================= Die Kommentare je Datei — 0.34.1 ====================
     Bis 0.34.0 bewachte eine Zeile die Kommentare: mehr als tausend ueber
     acht Dateien. */
  group('Die Kommentare je Datei — 0.34.1');
  {
    const crAll = require('./tools/comments.js').measureAll();
    const COMMENT_ROWS = [
      ['testbench.js', 77],
      ['test/batchrun.js', 87],
      ['test/dom.js', 340],
      ['test/firstlogin.js', 34],
      ['test/frame.js', 240],
      ['test/keychange.js', 81],
      ['test/release_029.js', 60],
      ['test/release_030.js', 253],
      ['test/release_031.js', 463],
      ['test/release_041.js', 37],
      ['test/roundtrip.js', 3312],
      ['test/selfcheck.js', 235],
      ['test/source.js', 943],
      ['test/ui_entry.js', 637],
      ['test/ui_export.js', 456],
      ['test/ui_inventory.js', 244],
      ['test/ui_language.js', 293],
      ['test/ui_overview.js', 499],
      ['test/ui_style.js', 608],
      ['test/ui_system.js', 692],
      ['test/ui_translator.js', 105],
      ['counterproof.js', 1639],
      ['server.js', 1591],
      ['auth.js', 290],
      ['db.js', 136],
      ['mail.js', 43],
      ['keys.js', 40],
      ['attachments.js', 61],
      ['images.js', 27],
      ['batchrun.js', 28],
      ['log.js', 4],
      ['usertool.js', 21],
      ['twofactor.js', 34],
      ['keytool.js', 39],
      ['public/app.js', 1970],
      ['public/theme.js', 3],
      ['public/style.css', 1223],
    ];
    // Kommentar- und Codezeilen ueber alle Dateien, gemessen mit tools/comments.js.
    const COMMENT_TOTAL = { comment: 16845, code: 69093 };
    check('Der Waechter sieht alle siebenunddreissig Dateien',
      crAll.each.length === 37 && COMMENT_ROWS.length === 37,
      `${crAll.each.length} gemessen, ${COMMENT_ROWS.length} genannt`);
    const crWrong = [];
    for (let i = 0; i < COMMENT_ROWS.length; i++) {
      const [name, rows] = COMMENT_ROWS[i];
      const here = crAll.each[i];
      if (!here || here.file !== name || here.comment !== rows)
        crWrong.push(`${name}: ${rows} genannt, ${here ? here.comment : '—'} gezaehlt`);
    }
    check('Und jede traegt die Zahl, die hier steht',
      crWrong.length === 0, crWrong.slice(0, 8).join(' · '));
    check('Und die Zahl ueber alles steht ebenso',
      crAll.comment === COMMENT_TOTAL.comment && crAll.code === COMMENT_TOTAL.code,
      `${crAll.comment} Kommentar (${COMMENT_TOTAL.comment} genannt), ` +
      `${crAll.code} Code (${COMMENT_TOTAL.code} genannt), ${crAll.share.toFixed(1)} Prozent`);

    /* Die beiden bindenden Grenzen -- 0.34.1, Zusagen 4 und 5. Die Zahlen
       darueber fangen jede Bewegung, diese beiden fangen die Richtung.
       DAS STILBLATT WIRD GEZAEHLT UND NICHT GEDECKELT: sein Kommentar traegt
       Kontrastwerte und Pixelmasse, und eine Quote naehme gemessene Zahlen
       heraus. Es steht deshalb mit seiner eigenen Zahl da. */
    const crJs = crAll.each.filter(r => r.file !== 'public/style.css');
    const crJsRows = crJs.reduce((n, r) => n + r.rows, 0);
    const crJsComment = crJs.reduce((n, r) => n + r.comment, 0);
    const crJsShare = crJsComment / crJsRows * 100;
    check('Der Anteil ueber allen JavaScript-Dateien bleibt unter einem Fuenftel',
      crJsShare <= 20, `${crJsShare.toFixed(1)} Prozent`);
    const crCss = crAll.each.find(r => r.file === 'public/style.css');
    check('Und das Stilblatt steht mit seiner eigenen Zahl da',
      crCss && crCss.comment > 0 && crCss.comment / crCss.rows < 0.45,
      crCss ? `${(crCss.comment / crCss.rows * 100).toFixed(0)} Prozent` : 'nicht gemessen');
    const crOver = crJs.filter(r => r.comment / r.rows > 0.30)
      .map(r => `${r.file} ${(r.comment / r.rows * 100).toFixed(0)}%`);
    check('Und keine JavaScript-Datei liegt ueber dreissig Prozent',
      crOver.length === 0, crOver.join(' · '));
  }

  /* ================= Die Groesse der Funktionen — 0.16.0 ================
     SIE MISST, SIE WEIST NICHT AB. */
  group('Die Groesse der Funktionen wird gemessen');

  function functionLengths(source) {
    const rows = String(source).split('\n');
    const found = [];
    let open = null;
    for (let i = 0; i < rows.length; i++) {
      const z = rows[i];
      if (!open) {
        const m = z.match(/^(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/);
        if (m) { open = { name: m[1], from: i }; continue; }
        // Auch die Pfeilform am linken Rand, solange ihr Rumpf geklammert ist.
        const a = z.match(/^const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(?[^)]*\)?\s*=>\s*\{$/);
        if (a) { open = { name: a[1], from: i }; continue; }
      } else if (z === '}' || z === '};') {
        found.push({ name: open.name, from: open.from + 1, rows: i - open.from + 1 });
        open = null;
      }
    }
    return found.sort((a, b) => b.rows - a.rows || a.name.localeCompare(b.name));
  }

  /* ---- DAS WERKZEUG AN EINER GESTELLTEN VORLAGE ---- Ohne diese vier Zeilen
     koennte functionLengths() die leere Liste liefern und alles darunter
     bliebe gruen -- eine Erfolgsmeldung, die ihren eigenen Fund nicht sehen
     kann, ist schlimmer als keine. */
  const flProbe = [
    'function eins() {',                 // 3 Zeilen
    '  return 1;',
    '}',
    '',
    'const zwei = (a) => {',             // 5 Zeilen
    '  if (a) {',
    '    return 2;',
    '  }',
    '};',
    '',
    'async function drei() {',           // 2 Zeilen
    '}'
  ].join('\n');
  const flMeasured = functionLengths(flProbe);
  check('Das Werkzeug findet die Funktionen der gestellten Vorlage',
    equal(flMeasured.map(f => f.name), ['zwei', 'eins', 'drei']),
    JSON.stringify(flMeasured.map(f => `${f.name}:${f.rows}`)));
  check('Und es zaehlt ihre Zeilen richtig',
    equal(flMeasured.map(f => f.rows), [5, 3, 2]),
    JSON.stringify(flMeasured.map(f => f.rows)));
  // Die Gegenlage: eine Datei ohne Funktion liefert die leere Liste und keinen
// Fehler -- das Stilblatt ist genau so eine.
  check('Und eine Vorlage ohne Funktion liefert die leere Liste',
    functionLengths('.a { color: red; }\n').length === 0);

  /* ---- DIE MESSUNG AN DEN AUSGELIEFERTEN DATEIEN ---- GENANNT, NICHT
     GEPRUEFT: der Block darunter ist eine Auskunft. */
  const flFiles = ['public/app.js', 'server.js', 'auth.js', 'db.js', 'attachments.js',
                     'twofactor.js', 'usertool.js', 'keytool.js', 'mail.js', 'keys.js',
                     ...benchFiles(), 'counterproof.js'];
  const flStatus = new Map();
  console.log('');
  console.log('  ── Die laengsten Funktionen je Datei ──────────────────────');
  for (const name of flFiles) {
    const filePath = path.join(__dirname, name);
    if (!fs.existsSync(filePath)) continue;
    const source = fs.readFileSync(filePath, 'utf8');
    const list = functionLengths(source);
    flStatus.set(name, { list, rows: source.split('\n').length });
    const peak = list.slice(0, 3)
      .map(f => `${f.name} ${f.rows}`).join(' · ') || '—';
    console.log(`     ${name.padEnd(16)} ${String(source.split('\n').length).padStart(6)} Zeilen` +
                `  ·  ${String(list.length).padStart(3)} Funktionen  ·  ${peak}`);
  }
  console.log('  ──────────────────────────────────────────────────────────');

  /* ---- UND DIE BEHAUPTUNG, DIE ROT WERDEN DARF ---- ERST DAS VORHANDENSEIN,
     DANN DIE EIGENSCHAFT: eine Messung, die gar nichts
     gefunden hat, liefert `undefined` -- und jede Aussage darueber waere
     entweder wahr oder unfalsifizierbar. */
  const flLongest = (file) => (flStatus.get(file)?.list || [])[0];
  check('Die Messung findet in public/app.js ueberhaupt Funktionen',
    (flStatus.get('public/app.js')?.list || []).length > 50,
    `${(flStatus.get('public/app.js')?.list || []).length} gefunden`);
  check('Und in server.js ebenso',
    (flStatus.get('server.js')?.list || []).length > 30,
    `${(flStatus.get('server.js')?.list || []).length} gefunden`);
  /* DIE BEHAUPTUNG DIESER RUNDE. */
  check('Die laengste Funktion in public/app.js heisst renderDetail',
    flLongest('public/app.js')?.name === 'renderDetail',
    `${flLongest('public/app.js')?.name} mit ${flLongest('public/app.js')?.rows} Zeilen`);
  check('Und die laengste in server.js heisst importInto',
    flLongest('server.js')?.name === 'importInto',
    `${flLongest('server.js')?.name} mit ${flLongest('server.js')?.rows} Zeilen`);
  /* UND DASS renderSystem() WIRKLICH ZERFALLEN IST. Das ist die Zusage dieser
     Runde, und sie waere ohne diese Zeile nur eine Behauptung im Protokoll. */
  const flSystem = (flStatus.get('public/app.js')?.list || []).find(f => f.name === 'renderSystem');
  check('renderSystem() steht ueberhaupt noch in public/app.js', !!flSystem,
    'die Funktion gibt es nicht mehr');
  check('Und sie ist unter 300 Zeilen geblieben',
    !!flSystem && flSystem.rows < 300, `${flSystem?.rows} Zeilen`);

  group('Das Skript auf dem Wirt ist ausfuehrbar');

  /* ZWEI HAELFTEN, DIE ZUSAMMENGEHOEREN -- dieselbe Bauform wie beim
     Sicherungsort (Einhaengung und Variable). */
  {
    const hostScripts = ['keytool.sh'];
    check('Der Lauf kennt das Skript auf dem Wirt',
      hostScripts.every(n => fs.existsSync(path.join(__dirname, n))),
      hostScripts.join(' · '));
    const withoutRight = hostScripts.filter(n => {
      try { return (fs.statSync(path.join(__dirname, n)).mode & 0o111) === 0; }
      catch { return true; }
    });
    check('Es traegt das Ausfuehrungsrecht',
      withoutRight.length === 0, `ohne Recht: ${withoutRight.join(' · ') || '—'}`);
    /* Und die zweite Haelfte: der Einspielweg in der README zieht es nach.
       Ohne sie steht das Recht zwar im Repo, kommt auf dem Wirt aber nicht an. */
    const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
    check('Der Einspielweg in der README zieht das Recht nach',
      /chmod \+x kriterion\/keytool\.sh/.test(readme),
      'die Zeile "chmod +x kriterion/keytool.sh" fehlt');
    check('Und er sagt, warum sie noetig ist',
      /python3 -m zipfile -e[\s\S]{0,200}?Ausführungsrecht/.test(readme),
      'der Grund steht nicht daneben');
  }

  group('Die berichtigten Behauptungen stehen nirgends mehr');

  /* DREI BERICHTIGUNGEN AUS 0.19.1, und sie sind der Grund, warum es dieses
     Projekt gibt: es standen zwei falsche Messungen und ein widerlegter Satz
     im Quelltext und im Aenderungsprotokoll. */
  {
    const corrected = [
      ['ohne das Blob zu lesen', 'die Behauptung ueber substr()'],
      ['3.235', 'die Messung, die es nicht gegeben haben kann'],
      ['2.990', 'die Messung, die es nicht gegeben haben kann'],
      ['kommt am echten Bestand vor', 'der widerlegte Satz zu Rueckbau 433'],
      ['kommt am ECHTEN Bestand vor', 'der widerlegte Satz zu Rueckbau 433']
    ];
    /* DIE SECHSTE DATEI LIEGT UNTER Doku/ UND FEHLT IM OEFFENTLICHEN STAND
       -- 0.35.0, siehe Doku/Veroeffentlichen.md. Sie wird gelesen, wenn sie
       dasteht; die fuenf uebrigen sind Pflicht. */
    const SEARCH_OPTIONAL = 'Doku/Aenderungsprotokoll_0.19.0.md';
    const searchAlways = ['server.js', 'public/app.js', 'counterproof.js', 'README.md',
                        'CHANGELOG.md'];
    const searched = [...searchAlways,
      ...(fs.existsSync(path.join(__dirname, ...SEARCH_OPTIONAL.split('/')))
          ? [SEARCH_OPTIONAL] : [])];
    const matched = [];
    for (const file of searched) {
      const full = path.join(__dirname, ...file.split('/'));
      if (!fs.existsSync(full)) { matched.push(`${file}: gibt es nicht`); continue; }
      const text = fs.readFileSync(full, 'utf8');
      for (const [sentence, event] of corrected)
        if (text.includes(sentence)) matched.push(`${file}: ${event} („${sentence}")`);
    }
    /* ERST DAS VORHANDENSEIN DES GEGENSTANDS: ein Waechter,
       der auf null Dateien laeuft, ist gruen und belegt nichts. */
    check('Der Waechter sieht die fuenf Pflichtdateien an, und die sechste wenn sie dasteht',
      searchAlways.every(d => fs.existsSync(path.join(__dirname, ...d.split('/'))))
      && searched.length >= 5,
      `${searched.length} Dateien · ` +
      (searchAlways.filter(d => !fs.existsSync(path.join(__dirname, ...d.split('/')))).join(' · ')
       || 'alle da'));
    check('Keine der drei berichtigten Behauptungen steht noch irgendwo',
      matched.length === 0, matched.join(' · '));
    /* UND DIE BERICHTIGUNGEN STEHEN WIRKLICH DA. */
    const serverText = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    check('Stattdessen steht im Server, dass substr() das Blob sehr wohl liest',
      /substr\(\) AUF EINEM BLOB LIEST DAS BLOB/.test(serverText),
      'die Berichtigung fehlt');
    /* UND DIE NACHGEFAHRENE MESSUNG STEHT MIT IHREM GEGENSTAND DANEBEN --
       Zeilenzahl und Groesse der Datei, an der sie entstanden ist. */
    check('Und die nachgefahrene Messung mit ihrer Datenbankgroesse daneben',
      /400 ZEILEN A 512 kB \(312 MB\)/.test(serverText) && /1338,8 ms/.test(serverText),
      'die nachgefahrene Messung fehlt');
    const gpText = fs.readFileSync(path.join(__dirname, 'counterproof.js'), 'utf8');
    /* RUECKBAU 433 BLEIBT UND BLEIBT ALS STUMM ERWARTET -- er bewacht das
       Vorhandensein der Regel, auch wo er ihre Wirkung nicht zeigen kann. */
    const rb433 = require('./counterproof').REGRESSIONS.find(r => r.nr === '433');
    check('Rueckbau 433 steht weiter in der Liste und weiter als STUMM erwartet',
      !!rb433 && /STUMM/.test(rb433.expected), JSON.stringify(rb433 && rb433.expected));
    check('Und seine Begruendung nennt jetzt die achtzehn Versuche und den echten Bestand',
      /achtzehn Laborversuche/.test(gpText) && /679 von 679/.test(gpText),
      'die berichtigte Begruendung fehlt');
  }

  group('Die Compose-Datei wird nicht ueberschrieben');

  /* DER BEFUND AUS DEM BETRIEB: `.env.example` liegt im Repo und `.env` in
     der .gitignore -- sauber. */
  {
    const ignored = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8')
      .split('\n').map(z => z.trim());
    check('Die Vorlage liegt im Repo',
      fs.existsSync(path.join(__dirname, 'docker-compose.example.yml')),
      'docker-compose.example.yml fehlt');
    /* UND DIE ALTE LIEGT NICHT MEHR DANEBEN. */
    const store = (() => {
      try {
        return String(execFileSync('git', ['ls-files'],
          { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] }))
          .split('\n').map(z => z.trim());
      } catch { return null; }
    })();
    if (store)
      check('Und die Arbeitsdatei ist nicht mehr verfolgt',
        !store.includes('docker-compose.yml') &&
        store.includes('docker-compose.example.yml'),
        store.filter(z => /^docker-compose/.test(z)).join(' · ') || '(keine)');
    else
      check('Und die Ablage laesst sich hier nicht befragen — eine Kopie ohne .git',
        !fs.existsSync(path.join(__dirname, '.git')),
        'git ls-files ist gescheitert, obwohl ein .git danebensteht');
    check('Die Arbeitsdatei steht in der .gitignore',
      ignored.includes('docker-compose.yml'), ignored.join(' · '));
    /* DIESELBE ZEILE FUER `.env` STEHT DANEBEN -- ohne sie bliebe die Zusage
       darueber auch dann gruen, wenn jemand das Muster nur zur Haelfte
       uebernaehme. */
    check('Und `.env` steht weiterhin daneben',
      ignored.includes('.env'), ignored.join(' · '));
    /* DER PFLICHTSCHRITT IN DER README, in derselben Form wie bei `.env`:
       einmal im Schritt und einmal im Pflichtsatz darunter. */
    /* AUS DREI WURDEN ZWEI: die Erstinstallation steht in nummerierten
       Schritten, und beide Wege -- ueber git und ueber das ZIP -- laufen
       durch denselben Schritt. Wer nur einen von beiden liest, findet ihn
       trotzdem, weil sie sich vorher wieder treffen. */
    const copyRows = (readmeFlat.match(/cp docker-compose\.example\.yml docker-compose\.yml/g) || []);
    check('Die README nennt den Kopierschritt im Schritt und im Pflichtsatz',
      copyRows.length === 2, `${copyRows.length} Nennungen`);
    check('Und sagt ausdruecklich, dass er Pflicht ist',
      /Der Schritt `cp docker-compose\.example\.yml docker-compose\.yml` ist Pflicht/
        .test(readmeFlat),
      'der Pflichtsatz fehlt');
    /* UND SIE SAGT, WAS OHNE IHN GESCHIEHT. Ein Pflichtschritt ohne Folge
       liest sich wie eine Empfehlung. */
    check('Und was ohne ihn geschieht',
      /no configuration file provided/.test(readmeFlat),
      'die Absage von docker compose steht nicht daneben');
  }

  /* ================= Die Anleitung liegt in zwei Dateien — 0.34.2 =========
     Der Betrieb steht in der README, die Bedienung im Handbuch. Der Schnitt
     traegt nur, solange keine Sache an beiden Stellen steht. */
  group('Die Anleitung liegt in zwei Dateien — 0.34.2');
  {
    const guideRead = n => fs.readFileSync(path.join(__dirname, n), 'utf8');
    const readme = guideRead('README.md');
    const handbook = guideRead('manual-de.md');
    /* ERST DAS VORHANDENSEIN: ueber zwei leeren Dateien waere jede Verneinung
       darunter wahr. */
    check('Beide Dateien tragen wirklich etwas',
      readme.split('\n').length > 300 && handbook.split('\n').length > 300,
      `${readme.split('\n').length} / ${handbook.split('\n').length} Zeilen`);

    const tops = s => (s.match(/^## .+$/gm) || []).map(z => z.slice(3).trim());
    const readmeTops = tops(readme);
    const handbookTops = tops(handbook);
    check('Und beide haben mehr als fuenf Abschnitte',
      readmeTops.length > 5 && handbookTops.length > 5,
      `${readmeTops.length} / ${handbookTops.length} Abschnitte`);
    /* KEINE UEBERSCHRIFT STEHT IN BEIDEN. Eine Sache an zwei Stellen ist der
       Anfang zweier Fassungen derselben Sache. */
    const doubled = readmeTops.filter(n => handbookTops.includes(n));
    check('Kein Abschnitt steht in beiden Dateien',
      doubled.length === 0, doubled.join(' · '));

    /* JEDE ZEIGT AUF DIE ANDERE, und zwar mit dem Dateinamen. */
    check('Die README nennt das Handbuch beim Namen',
      /manual-de\.md/.test(readme), 'der Verweis auf manual-de.md fehlt');
    check('Und das Handbuch die README',
      /README\.md/.test(handbook), 'der Verweis auf README.md fehlt');

    /* UND DER SCHNITT LIEGT WIRKLICH DORT, WO ER LIEGEN SOLL -- namentlich,
       damit ein zurueckgewanderter Abschnitt auffaellt. */
    const BENCH_ONLY = ['Anmeldung', 'Benutzer und Rollen', 'Übersicht', 'Eintrag',
      'Kommentare', 'Bewertung', 'Einstellungen', 'Export und Import', 'Vokabular',
      'Sprache', 'Hell oder dunkel', 'Auf dem Handy und auf dem Tablett', 'Schriftgröße'];
    const HOST_ONLY = ['Erstinstallation', 'Konfiguration', 'Der Schlüssel', 'Backup',
      'Update', 'Hinter einem Reverse Proxy', 'Befehle auf dem Server', 'Fehlerbehebung'];
    check('Die Bedienung steht vollstaendig im Handbuch',
      BENCH_ONLY.every(n => handbookTops.includes(n)),
      BENCH_ONLY.filter(n => !handbookTops.includes(n)).join(' · '));
    check('Und der Betrieb vollstaendig in der README',
      HOST_ONLY.every(n => readmeTops.includes(n)),
      HOST_ONLY.filter(n => !readmeTops.includes(n)).join(' · '));

    /* ---- DAS INHALTSVERZEICHNIS ---- Es steht als FETTE ZEILE und nicht als
       Ueberschrift: eine zweite Ebene „Inhalt" stuende in beiden Dateien und
       fiele der Zusage darueber zum Opfer. */
    /* DIE SPRUNGMARKE WIRD GEBILDET WIE BEI GitHub: klein schreiben,
       Satzzeichen und Gedankenstriche weg, Leerzeichen zu Bindestrichen. Der
       Bindestrich selbst bleibt -- aus zwei Leerzeichen um einen
       Gedankenstrich werden deshalb zwei. */
    const anchorOf = (text) => text.toLowerCase().trim()
      .replace(/[\u0000-\u001f!-,./:-@[-^`{-~\u00a0-\u00a9\u00ab-\u00b4\u00b6-\u00b9\u00bb-\u00bf\u00d7\u00f7\u2000-\u206f\u2e00-\u2e7f]/g, '')
      .replace(/ /g, '-');
    /* GELESEN WIRD OHNE DIE CODEZAEUNE: eine Raute darin ist keine
       Ueberschrift, und ein Klammerpaar darin keine Sprungmarke. */
    const guideParts = (text) => {
      const heads = [], marks = [];
      let fence = false;
      for (const z of text.split('\n')) {
        if (z.trim().startsWith('```')) { fence = !fence; continue; }
        if (fence) continue;
        if (z.startsWith('## ')) heads.push(['h2', z.slice(3).trim()]);
        else if (z.startsWith('### ')) heads.push(['h3', z.slice(4).trim()]);
        for (const m of z.matchAll(/\]\(#([^)]+)\)/g)) marks.push(m[1]);
      }
      return { heads, marks };
    };
    for (const [name, text] of [['README.md', readme], ['manual-de.md', handbook]]) {
      const { heads, marks } = guideParts(text);
      /* ERST DAS VORHANDENSEIN: ueber einer Datei ohne Sprungmarken waere
         jede Verneinung darunter wahr. */
      check(`${name} traegt ein Inhaltsverzeichnis`,
        /^\*\*Inhalt\*\*$/m.test(text) && marks.length >= 7,
        `${marks.length} Sprungmarken`);
      /* UND „Inhalt" IST KEINE UEBERSCHRIFT DER ZWEITEN EBENE. */
      check(`Und „Inhalt" steht dort nicht als Abschnitt`,
        !heads.some(([k, t]) => k === 'h2' && t === 'Inhalt'),
        heads.filter(([k]) => k === 'h2').map(([, t]) => t).join(' · '));
      const there = new Set(heads.map(([, t]) => anchorOf(t)));
      const dead = marks.filter(m => !there.has(m));
      check(`Und jede seiner Sprungmarken trifft eine Ueberschrift in ${name}`,
        dead.length === 0, dead.join(' · ') || `${marks.length} Marken, alle treffen`);
      const missing = heads.filter(([k, t]) => k === 'h2' && !marks.includes(anchorOf(t)))
        .map(([, t]) => t);
      check(`Und jeder Abschnitt von ${name} steht im Inhaltsverzeichnis`,
        missing.length === 0, missing.join(' · ') || `${heads.length} Ueberschriften`);
    }
  }


  /* ==================== Die Lizenz geht mit hinaus ====================
     Ohne LICENSE ist der Stand rechtlich unklar; ohne den Abschnitt in der
     README weiss niemand, was die Abhaengigkeiten mitbringen. */
  group('Die Lizenz geht mit hinaus');
  {
    const licText = fs.readFileSync(path.join(__dirname, 'LICENSE'), 'utf8');
    check('LICENSE nennt MIT', /^MIT License$/m.test(licText), licText.slice(0, 60));
    check('Und traegt einen Urheberrechtsvermerk mit Jahr',
      /^Copyright \(c\) 20\d\d .+$/m.test(licText),
      (licText.match(/^Copyright.*$/m) || ['keiner'])[0]);
    /* DER HAFTUNGSAUSSCHLUSS IST DER TEIL, DEN EIN KUERZEN ZUERST TRIFFT. */
    check('Und den Haftungsausschluss', /WITHOUT WARRANTY OF ANY KIND/.test(licText)
      && /IN NO EVENT SHALL/.test(licText), `${licText.length} Zeichen`);

    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    check('package.json traegt dieselbe Lizenz', pkg.license === 'MIT',
      JSON.stringify(pkg.license));

    const rd = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
    check('Die README traegt das Abzeichen',
      /!\[Lizenz\]\(https:\/\/img\.shields\.io\/badge\/Lizenz-MIT-/.test(rd),
      'das Abzeichen fehlt');
    check('Und einen eigenen Abschnitt', /^## Lizenz$/m.test(rd),
      'der Abschnitt „Lizenz" fehlt');
    /* DIE AUSKUNFT UEBER libvips DARF NICHT STILL WEGFALLEN: sie ist der
       einzige Punkt, an dem MIT nicht die ganze Antwort ist. */
    check('Und nennt die LGPL der Bildbibliothek',
      /LGPL/.test(rd) && /sharp-libvips/.test(rd),
      'LGPL oder sharp-libvips fehlt im Abschnitt');

    /* DER TRANSPARENZVERMERK DARF NICHT STILL WEGFALLEN. Der Zeitraum steht
       statt einer Versionsnummer: gefordert ist die Form, nicht der Monat. */
    check('Und sagt, wie der Code entstanden ist',
      /^## Wie dieser Code entstanden ist$/m.test(rd) && /Claude Code/.test(rd)
      && /[A-ZÄÖÜ][a-zäöüß]+\s+bis\s+[A-ZÄÖÜ][a-zäöüß]+\s+20\d\d/.test(rd),
      'der Abschnitt, das Werkzeug oder der Zeitraum fehlt');

    /* KEINE ABHAENGIGKEIT DARF DIE WEITERGABE UNTER MIT VERHINDERN. LGPL
       darf, GPL und AGPL nicht -- sie greifen auf das ganze Werk durch. */
    const modRoot = path.join(__dirname, 'node_modules');
    const packs = [];
    for (const e of fs.readdirSync(modRoot, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      if (e.name.startsWith('@')) {
        for (const s of fs.readdirSync(path.join(modRoot, e.name), { withFileTypes: true }))
          if (s.isDirectory()) packs.push(path.join(e.name, s.name));
      } else if (!e.name.startsWith('.')) packs.push(e.name);
    }
    const strict = [];
    for (const name of packs) {
      let lic;
      try {
        lic = JSON.parse(fs.readFileSync(path.join(modRoot, name, 'package.json'), 'utf8')).license;
      } catch { continue; }
      if (typeof lic !== 'string') continue;
      if (/(^|[^L])GPL-[23]/.test(lic) || /AGPL/.test(lic)) strict.push(`${name} (${lic})`);
    }
    check('Keine Abhaengigkeit steht unter GPL oder AGPL',
      strict.length === 0, strict.join(' · ') || `${packs.length} Pakete gelesen`);
  }

  /* ============ Der Treiber sieht den Rueckgabewert — 0.34.4 ============
     test/frame.js schreibt die Meldung, raeumt danach auf und beendet erst
     dann. Stirbt ein Modul in dieser Luecke, liegt eine vollstaendige Meldung
     vor und der Rueckgabewert ist trotzdem nicht 0. Bis 0.34.3 hat der
     Treiber nur die Meldung gelesen und einen solchen Lauf fuer bestanden
     gehalten. */
  group('Der Treiber sieht den Rueckgabewert — 0.34.4');
  {
    /* Die Probe in test/frame.js liegt hinter dem Schreiben der Meldung und
       vor dem Aufraeumen. Sie greift nur, wenn die Umgebungsvariable den
       Modulnamen traegt; ein Lauf ohne sie merkt nichts davon. */
    const driverFrame = fs.readFileSync(path.join(__dirname, 'test', 'frame.js'), 'utf8');
    const driverAt = t => driverFrame.indexOf(t);
    check('Die Probe liegt zwischen Meldung und Aufraeumen',
      driverAt('TESTBENCH_REPORT') < driverAt('TESTBENCH_DIE_AFTER_REPORT')
      && driverAt('TESTBENCH_DIE_AFTER_REPORT') < driverAt('DER HAUPTSERVER GEHOERT DAZU'),
      'die Reihenfolge in test/frame.js stimmt nicht');

    /* Ein Teillauf ueber eine Gruppe, die nur test/source.js traegt. Dieses
       Modul startet keinen Server: der Lauf kostet vier Sekunden und keine
       Portnummer, und er kann dem laufenden Lauf nichts wegnehmen. */
    const driver = spawnSync(process.execPath,
      ['testbench.js', 'Kein Stolpersteinverweis mehr'],
      { cwd: __dirname, encoding: 'utf8',
        env: { ...process.env, TESTBENCH_DIE_AFTER_REPORT: 'source' } });
    const driverText = (driver.stdout || '') + (driver.stderr || '');
    const driverRed = driverText.split('\n').filter(z => z.includes('✗')).join(' | ');
    /* ERST DAS VORHANDENSEIN: kaeme aus dem Kindprozess gar nichts, waere
       jede Verneinung darunter wahr. */
    check('Der Teillauf laeuft ueberhaupt',
      /Pruefungen bestanden/.test(driverText), JSON.stringify(driverText.slice(0, 160)));
    /* Das Modul hat seine sieben Zahlen gemeldet -- die achte Pruefung ist
       die des Treibers. Fuenf und sechs waren es bis 0.35.2; die Gruppe hat
       zwei Pruefungen dazubekommen, seit sie das Stilblatt und die
       SQL-Kommentare des Schemas mitliest. Die Meldung nennt die Zahlen und NICHT den Satz, in dem
       sie stehen: counterproof.js liest `\d+ von \d+ Pruefungen bestanden` als
       Gesamtzahl des Laufs und nimmt den ersten Treffer. Stuende der Satz hier,
       traege jeder Gegenprobebericht, in dem diese Pruefung rot wird, die Zahl
       des Teillaufs statt die des Laufs. */
    const driverScore = driverText.match(/(\d+) von (\d+) Pruefungen bestanden/);
    check('Das Modul meldet seine Zahlen noch',
      driverScore && driverScore[1] === '7' && driverScore[2] === '8',
      `bestanden ${driverScore ? driverScore[1] : '—'} von ${driverScore ? driverScore[2] : '—'}`);
    check('Und der Treiber nennt den Rueckgabewert beim Wert',
      /Das Modul source meldet keinen Fehler, endete aber mit Rueckgabewert 9/.test(driverText),
      driverRed);
    check('Und es ist die einzige rote Zeile',
      (driverText.match(/✗/g) || []).length === 1, driverRed);
    check('Der Lauf endet rot', driver.status === 1, `Code ${driver.status}`);
  }

  /* ============ Die Schalterprobe haengt nicht am Elternlauf — 0.35.0 =====
     test/release_030.js startet ein Kind, um zu
     belegen, dass die Zeitzeile OHNE Schalter nicht dasteht -- und hat
     TESTBENCH_TIME dabei an das Kind vererbt. Die Pruefung war gruen, weil
     der Elternprozess zufaellig keinen Schalter trug: derselbe Stand meldete
     mit TESTBENCH_TIME=1 nur 6892 von 6893.

     GEPRUEFT WIRD DER QUELLTEXT und nicht ein zweiter Lauf. Ein Lauf, der die
     Lage nachstellt, kostet elf Sekunden und belegt am Ende dieselbe Zeile. */
  group('Die Schalterprobe haengt nicht am Elternlauf — 0.35.0');
  {
    const switchText = fs.readFileSync(
      path.join(__dirname, 'test', 'release_030.js'), 'utf8');
    const probeAt = switchText.indexOf('const tProbe =');
    const claimAt = switchText.indexOf('Und ohne ihn nicht');
    check('Die Probe ohne Schalter steht vor der Behauptung ueber sie',
      probeAt > -1 && claimAt > probeAt,
      `tProbe bei ${probeAt}, Behauptung bei ${claimAt}`);
    /* Und sie raeumt den Schalter ausdruecklich weg, statt process.env
       unbesehen zu uebernehmen. Ohne diese Zeile belegt die Pruefung nur,
       wie der Elternlauf gerade gestartet worden ist. */
    const probeCall = switchText.slice(probeAt, switchText.indexOf('});', probeAt));
    check('Und sie raeumt TESTBENCH_TIME im Kind ausdruecklich weg',
      /TESTBENCH_TIME:\s*''/.test(probeCall), JSON.stringify(probeCall));
  }

  /* ---------------------------------------------------------------- */
  group('Bekannte Luecken in den Abhaengigkeiten');

  /* DER SCHRITT „Bekannte Luecken" LAEUFT AUF DER WERKBANK und bis zu dieser
     Fassung nirgends sonst: wer oertlich prueft, sah eine neue Meldung erst
     nach dem Push. */
  {
    const naRun = spawnSync('npm', ['audit', '--json'], {
      cwd: __dirname, encoding: 'utf8', timeout: 120000 });
    let naReport = null;
    try { naReport = JSON.parse(naRun.stdout || ''); } catch {}
    /* OHNE NETZ WIRD UEBERSPRUNGEN, UND DIE GRUPPE SAGT ES. Ein Pruefstand,
       der ohne Netz rot wird, ist kein Pruefstand -- und einer, der still
       ausfaellt, belegt nichts. */
    const naOffline = !naReport || Boolean(naReport.error);
    if (naOffline) {
      const naWhy = (naReport && (naReport.message
        || (naReport.error && (naReport.error.summary || naReport.error.detail))))
        || `Rueckgabewert ${naRun.status}, ${(naRun.stderr || '').split('\n')[0]}`;
      H.skipped += 1;
      console.log(`  … uebersprungen: npm audit hat keine Auskunft gegeben — ${naWhy}`);
    } else {
      const naCounts = (naReport.metadata && naReport.metadata.vulnerabilities) || {};
      const naNames = Object.keys(naReport.vulnerabilities || {});
      check('npm audit meldet keine einzige Luecke',
        Number(naCounts.total) === 0 && naNames.length === 0,
        `${JSON.stringify(naCounts)} · ${naNames.slice(0, 8).join(' ')}`);
      /* UND DIE AUSKUNFT IST WIRKLICH EINE: eine leere Tafel machte die Zeile
         darueber wahr, ohne etwas zu belegen. */
      check('Und die Auskunft nennt die gezaehlten Stufen',
        ['info', 'low', 'moderate', 'high', 'critical']
          .every(z => Number.isFinite(Number(naCounts[z]))),
        JSON.stringify(naCounts));
    }
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
