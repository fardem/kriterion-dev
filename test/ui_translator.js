/* Kriterion — Pruefstand: die Oberflaeche: der Sprachhelfer Der Sprachhelfer
   und die Ladung, die Fremddatei und der Dateiname, und die Serverseite, die
   aus der Datei spricht. */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  buildDom
} = D;

async function run() {
  const {
   fs, os, path, spawn, segment, CODE, TEXT, __dirname, require, group,
   check, equal, KEY, PORT_OFFSET, PORT, PASSWORD, endKind, CASES,
   LANGUAGE_BASE, call
  } = H;
  /* Dieses Modul ruft den Hauptserver. Es startet ihn fuer sich --
     siehe mainServerReady() in test/frame.js. */
  await H.mainServerReady();
  /* DIESES MODUL BAUT FENSTER. Fehlt jsdom, sagt es das und haelt an. */
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch { console.log('  … uebersprungen: jsdom fehlt (npm install)'); return; }

  /* ============ Keine feste Farbe im Stilblatt — 0.23.0 ============ DER
     WAECHTER DER RUNDE, und er entsteht im ERSTEN Bauabschnitt und nicht am
     Ende: er ist die einzige Zusicherung, dass die Bestandsaufnahme
     vollstaendig war. */
  /* ================= Der Sprachhelfer und die Ladung — 0.24.0
     ================= TEXT IST DATEN UND NICHT PROGRAMM (Konzept, Abschnitt
     0, Satz 1). */
  group('Der Sprachhelfer und die Ladung — 0.24.0');
  {
    /* DER HELFER WIRD NIE NACH EINER EIGENSCHAFT GEFRAGT -- und genau daran
       hingen zwei Befunde aus dem Betrieb vom 7. */
    const HELPER_REACH = /(?<![A-Za-z0-9_$])(?<!(?<!\.)\.)t\.([A-Za-z_$][\w$]*)/g;
    const spAppCode = segment(
      fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8'), 'public/app.js')
      .filter(z => z.kind === CODE).map(z => z.value).join('\n');
    const spReach = [...spAppCode.matchAll(HELPER_REACH)].map(m => 't.' + m[1]);
    check('Der Sprachhelfer wird nie nach einer Eigenschaft gefragt',
      spReach.length === 0, spReach.join(' ') || '(keine)');
    /* UND DER LESER FINDET SO ETWAS WIRKLICH -- sonst waere die Zeile
       darueber gruen, weil sie nichts sieht. */
    const spProbe = (text) => [...text.matchAll(HELPER_REACH)].length;
    check('Und der Leser wuerde eine solche Stelle finden',
      spProbe('const x = t.parentElement;') === 1 &&
      spProbe('idx = [...t.parentElement.children].indexOf(tile);') === 1 &&
      spProbe('const y = obj.t.name;') === 0,
      `blank ${spProbe('const x = t.parentElement;')}, ` +
      `ausgebreitet ${spProbe('idx = [...t.parentElement.children].indexOf(tile);')}, ` +
      `Eigenschaft ${spProbe('const y = obj.t.name;')}`);

    const spFile = path.join(__dirname, 'public', 'languages', 'de.json');
    check('Die Sprachdatei liegt unter public/languages/ und heisst de.json',
      fs.existsSync(spFile), spFile);
    const spRaw = fs.readFileSync(spFile, 'utf8');
    let spTexts = null;
    try { spTexts = JSON.parse(spRaw); } catch (e) { spTexts = null; }
    // Erst das Vorhandensein, dann jede Aussage darueber (Stolperstein 81).
    check('Sie ist lesbares JSON', !!spTexts && typeof spTexts === 'object',
      spTexts ? `${Object.keys(spTexts).length} Schluessel` : '(nicht lesbar)');
    /* DIE LOCALE IM KOPF. An ihr haengen Datum, Zahl, Sortierung und die
       Mehrzahl -- eine Datei ohne sie ist keine (Konzept 6). */
    check('Sie traegt _locale: "de-DE"', spTexts?._locale === 'de-DE', String(spTexts?._locale));
    check('Und Intl kennt diese Locale',
      Intl.DateTimeFormat.supportedLocalesOf([spTexts?._locale || 'xx-XX']).length === 1,
      String(spTexts?._locale));
    /* EIN TEXT IST EIN STRING ODER EIN OBJEKT { one, other } -- SONST NICHTS. */
    const spCrooked = Object.entries(spTexts || {}).filter(([k, v]) => {
      if (k === '_locale') return typeof v !== 'string';
      if (typeof v === 'string') return false;
      if (v && typeof v === 'object')
        return Object.keys(v).sort().join() !== 'one,other'
          || typeof v.one !== 'string' || typeof v.other !== 'string';
      return true;
    }).map(([k]) => k);
    check('Jeder Wert ist ein String oder ein Objekt { one, other }',
      spCrooked.length === 0, spCrooked.join(' · ') || 'alle in Ordnung');
    /* KEIN HTML IN EINEM TEXT (Konzept 4.2). Der Helfer maskiert den Text
       ausdruecklich NICHT -- er maskiert nur die eingesetzten Werte. */
    const spSharp = Object.entries(spTexts || {}).filter(([, v]) =>
      (typeof v === 'string' ? [v] : Object.values(v || {})).some(x => /[<>]/.test(String(x))))
      .map(([k]) => k);
    check('Kein Wert trägt ein < oder ein >', spSharp.length === 0,
      spSharp.join(' · ') || 'keiner');
    /* UND DER WAECHTER FINDET WIRKLICH EINES -- ohne diese Zeile bliebe die
       Zeile darueber auch dann gruen, wenn der Ausdruck nie trifft. */
    check('Und der Wächter findet ein eingebautes < wirklich',
      /[<>]/.test('<b>'), 'Gegenlage mit <b>');

    /* ---- Der Helfer im Browser ---- */
    const spDom = buildDom(JSDOM, { settings: { filters: null } });
    await new Promise(r => setTimeout(r, 80));
    const spW = spDom.w;
    /* DIE GESTELLTEN TEXTE WERDEN IN DIE GELADENEN GESCHOBEN. */
    const spSet = (obj) => spW.eval(`TEXTS = ${JSON.stringify(obj)}; TEXTS_FALLBACK = TEXTS;`);
    const spReal = () => spW.eval(`TEXTS = ${spRaw}; TEXTS_FALLBACK = TEXTS;`);
    spSet({
      _locale: 'de-DE',
      'probe.einfach': 'Ein fester Satz.',
      'probe.platzhalter': 'Es sind {n} von {total}.',
      'probe.vokabel': 'Der Knopf heißt „{entryOne}".',
      'probe.plural': { one: '{n} Kommentar', other: '{n} Kommentare' },
      'probe.unbekannt': 'Hier fehlt {niemand}.'
    });
    check('t() gibt einen festen Satz unverändert zurück',
      spW.t('probe.einfach') === 'Ein fester Satz.', spW.t('probe.einfach'));
    check('t() setzt benannte Platzhalter ein',
      spW.t('probe.platzhalter', { n: 3, total: 7 }) === 'Es sind 3 von 7.',
      spW.t('probe.platzhalter', { n: 3, total: 7 }));
    /* EIN VOKABELPLATZHALTER KOMMT AUS `V`, ohne dass ihn jemand mitgibt --
       die vierzehn Namen sind dieselben wie heute im Quelltext. */
    check('Ein Vokabelplatzhalter kommt aus V, ohne ihn mitzugeben',
      spW.t('probe.vokabel') === 'Der Knopf heißt „Eintrag".', spW.t('probe.vokabel'));
    /* EIN UNBEKANNTER PLATZHALTER BLEIBT STEHEN. Ein leerer Fleck waere kein
       Fund -- `{niemand}` am Bildschirm ist einer. */
    check('Ein unbekannter Platzhalter bleibt stehen',
      spW.t('probe.unbekannt') === 'Hier fehlt {niemand}.', spW.t('probe.unbekannt'));
    /* DIE MEHRZAHL WAEHLT Intl.PluralRules UND NICHT `n === 1`. */
    check('Intl.PluralRules("de-DE").select(0) ist „other" und nicht „one"',
      new Intl.PluralRules('de-DE').select(0) === 'other',
      new Intl.PluralRules('de-DE').select(0));
    for (const [n, wanted] of [[0, '0 Kommentare'], [1, '1 Kommentar'], [2, '2 Kommentare']])
      check(`Die Mehrzahl bei n = ${n} ist „${wanted}"`,
        spW.t('probe.plural', { n }) === wanted, spW.t('probe.plural', { n }));
    /* tH() MASKIERT JEDEN EINGESETZTEN WERT -- Stolperstein 18 in Dateiform. */
    const spBad = { n: '<b>', total: 1 };
    check('tH() maskiert einen Wert mit einem <',
      spW.tH('probe.platzhalter', spBad) === 'Es sind &lt;b&gt; von 1.',
      spW.tH('probe.platzhalter', spBad));
    check('Und t() maskiert ihn nicht',
      spW.t('probe.platzhalter', spBad) === 'Es sind <b> von 1.',
      spW.t('probe.platzhalter', spBad));
    /* AUCH DAS VOKABELWORT WIRD IN tH() MASKIERT. Es kommt vom Admin und ist
       damit Benutzertext -- genau der Fall, den Stolperstein 18 nennt. */
    spW.eval("V = { ...V, entryOne: '<i>Modell</i>' };");
    check('tH() maskiert auch das Vokabelwort',
      spW.tH('probe.vokabel') === 'Der Knopf heißt „&lt;i&gt;Modell&lt;/i&gt;".',
      spW.tH('probe.vokabel'));
    spW.eval("V = { ...V, entryOne: 'Eintrag' };");
    /* EIN FEHLENDER SCHLUESSEL IST SICHTBAR UND NIE STILL. */
    check('Ein fehlender Schlüssel liefert ⟦schluessel⟧',
      spW.t('gibt.es.nicht') === '⟦gibt.es.nicht⟧', spW.t('gibt.es.nicht'));
    /* DER RUECKFALL AUF DIE VORGABESPRACHE. */
    spW.eval("TEXTS = { _locale: 'de-DE' };");
    check('Fehlt ein Schlüssel in der gewählten Sprache, greift die Vorgabesprache',
      spW.t('probe.einfach') === 'Ein fester Satz.', spW.t('probe.einfach'));
    check('Und fehlt er auch dort, steht ⟦…⟧ da',
      spW.t('probe.nichtda') === '⟦probe.nichtda⟧', spW.t('probe.nichtda'));
    spReal();
    /* DIE ECHTE DATEI TRAEGT DIE DREI SCHLUESSEL DIESES BAUABSCHNITTS. */
    check('Der Rückfallsatz von api() steht in der Datei',
      spW.t('error.serverStatus', { status: 500 }) === 'Der Server meldet einen Fehler (500).',
      spW.t('error.serverStatus', { status: 500 }));
    spW.close();

    /* ---- Die Ladung in boot() ---- */
    /* SCHEITERT SIE, ZEICHNET boot() EINEN EINZIGEN FESTEN SATZ UND HAELT AN
       (Entscheidung A1). */
    const spWithout = buildDom(JSDOM, { withoutLanguage: true });
    await new Promise(r => setTimeout(r, 120));
    check('Fehlt die Sprachdatei, steht ein einziger fester Satz da',
      spWithout.w.document.getElementById('app')?.textContent === 'Die Sprachdatei fehlt.',
      JSON.stringify(spWithout.w.document.getElementById('app')?.textContent?.slice(0, 80)));
    // UND SONST NICHTS: keine Anmeldemaske, keine Leiste, kein Knopf.
    check('Und boot() zeichnet nichts weiter',
      spWithout.w.document.querySelectorAll('#app *').length === 0,
      `${spWithout.w.document.querySelectorAll('#app *').length} Knoten`);
    spWithout.w.close();
    /* UND DIE GEGENLAGE: mit Datei zeichnet dieselbe Seite ihre Ansicht. */
    const spIncluding = buildDom(JSDOM, {});
    await new Promise(r => setTimeout(r, 120));
    check('Mit Datei zeichnet dieselbe Seite ihre Ansicht',
      spIncluding.w.document.querySelectorAll('#app *').length > 0
        && spIncluding.w.document.getElementById('app').textContent !== 'Die Sprachdatei fehlt.',
      `${spIncluding.w.document.querySelectorAll('#app *').length} Knoten`);
    spIncluding.w.close();

    /* ---- Der Helfer im Server ---- */
    /* KEIN LITERAL MEHR AN DEN DREI STELLEN DIESES BAUABSCHNITTS. */
    const spApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    const spSrv = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    check('api() liest seinen Rückfallsatz über t()',
      /let m = t\('error\.serverStatus', \{ status: res\.status \}\);/.test(spApp)
        && !/Der Server meldet einen Fehler/.test(spApp),
      (spApp.match(/let m = [^\n]*/) || ['(nicht gefunden)'])[0]);
    check('Der Fehler-Handler übersetzt seine zwei Sätze',
      /t\(locale, 'server\.error'\)/.test(spSrv)
        && /t\(locale, 'server\.errorUnknown'\)/.test(spSrv)
        && !/Auf dem Server ist ein Fehler aufgetreten/.test(spSrv)
        && !/'Unbekannter Fehler'/.test(spSrv),
      'Literale im Handler: ' + String(/Auf dem Server ist ein Fehler aufgetreten/.test(spSrv)));
    /* DIE KLASSE `Message`: Schluessel, Werte, Status -- und sie erbt von
       Error, damit jeder vorhandene try/catch sie weiter faengt. */
    const spM = new (require('./auth').Message)('probe.schluessel', { n: 2 }, 409);
    check('Eine Meldung ist ein Error und trägt Schlüssel, Werte und Status',
      spM instanceof Error && spM.key === 'probe.schluessel'
        && spM.values.n === 2 && spM.status === 409,
      JSON.stringify([spM.key, spM.values, spM.status]));
    // Und ihr `message` ist der SCHLUESSEL: wer sie versehentlich als Text
// ausgibt, sieht einen Schluessel und keinen halben Satz.
    check('Und ihre Meldung ist der Schlüssel selbst',
      spM.message === 'probe.schluessel', spM.message);
    /* DIE VORGABESPRACHE STEHT NICHT MEHR IM QUELLTEXT -- 0.24.3,
       Bauabschnitt 1. */
    /* GELESEN WIRD DER CODE UND NICHT DIE DATEI: der Kommentar an dieser
       Stelle ZITIERT die alte Konstante, weil dort steht, was sie ersetzt hat
       -- und ein Waechter, der ein Zitat fuer eine Benennung haelt, verboete
       das Aufschreiben. */
    const spSrvCode = segment(spSrv, 'server.js')
      .filter(z => z.kind === CODE).map(z => z.value).join('\n');
    check('Die Vorgabesprache steht nicht mehr als Konstante im Quelltext',
      !/const LANGUAGE_DEFAULT\s*=/.test(spSrvCode), 'const LANGUAGE_DEFAULT steht noch da');
    // Und der Leser wuerde sie wirklich finden -- an einem gestellten Fall.
    check('Und der Leser wuerde eine solche Konstante melden',
      /const LANGUAGE_DEFAULT\s*=/.test("const LANGUAGE_DEFAULT = 'de';"),
      'der Leser sieht die Konstante nicht');
    check('Sie wird aus den Einstellungen gelesen',
      /SELECT value FROM settings WHERE key = 'languageDefault'/.test(spSrv)
        && /function languageDefault\(\)/.test(spSrv),
      (spSrv.match(/function languageDefault[\s\S]{0,120}/) || ['(nicht gefunden)'])[0]);
    // Und localeOf() haengt daran und nicht an einem eigenen zweiten Weg.
    check('Und localeOf(req) haengt an ihr',
      /function localeOf\(req\)[\s\S]{0,400}?languageDefault\(\)/.test(spSrv),
      (spSrv.match(/function localeOf[\s\S]{0,120}/) || ['(nicht gefunden)'])[0]);
    /* FEHLT DIE PFLICHTDATEI, STARTET DER SERVER TROTZDEM -- 0.24.3, F6. */
    const spCopy = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-sprache-'));
    for (const e of fs.readdirSync(__dirname, { withFileTypes: true })) {
      if (['node_modules', 'data', '.git'].includes(e.name)) continue;
      const target = path.join(spCopy, e.name);
      if (e.isDirectory()) fs.cpSync(path.join(__dirname, e.name), target, { recursive: true });
      else if (e.isFile()) fs.copyFileSync(path.join(__dirname, e.name), target);
    }
    fs.symlinkSync(path.join(__dirname, 'node_modules'), path.join(spCopy, 'node_modules'));
    for (const f of fs.readdirSync(path.join(spCopy, 'public', 'languages')))
      fs.rmSync(path.join(spCopy, 'public', 'languages', f));
    const spStart = await new Promise((done) => {
      const dataVerz = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-sprachdaten-'));
      const spPort = LANGUAGE_BASE + PORT_OFFSET;
      const kindS = spawn(process.execPath, ['server.js'], { cwd: spCopy,
        env: { ...process.env, PORT: String(spPort), DATA_DIR: dataVerz, ENCRYPTION_KEY: KEY } });
      // Vermerkt, damit beide Waechter am Ende auch diese Lage ansehen -- und
// damit ihr Kind aufgeraeumt wird, falls es wider Erwarten laeuft.
      CASES.push({ base: LANGUAGE_BASE, port: spPort, kind: kindS, directory: dataVerz });
      let prot = '';
      kindS.stdout.on('data', d => { prot += d; });
      kindS.stderr.on('data', d => { prot += d; });
      kindS.on('exit', (code) => { fs.rmSync(dataVerz, { recursive: true, force: true });
                                   done({ code, prot }); });
      setTimeout(() => { kindS.kill('SIGKILL'); }, 20000);
    });
    /* code === null HEISST: er lief noch, als der SIGKILL nach 20 Sekunden
       kam. */
    check('Ohne eine einzige Sprachdatei startet der Server trotzdem',
      spStart.code === null, `Rueckgabe ${spStart.code}`);
    check('Und er sagt namentlich, welche fehlt',
      /\[languages\][^\n]*en\.json is missing/.test(spStart.prot),
      spStart.prot.split('\n').find(z => /\[languages\]/.test(z)) || '(kein Wort davon)');
    fs.rmSync(spCopy, { recursive: true, force: true });
  }


  /* ====== Die Fremddatei und der Dateiname — 0.24.3, F6 ==================
     SEIT DIESER RUNDE IST DAS VERZEICHNIS DIE LISTE. */
  group('Die Fremddatei und der Dateiname — 0.24.3');
  {
    const ffCopy = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-fremd-'));
    for (const e of fs.readdirSync(__dirname, { withFileTypes: true })) {
      if (['node_modules', 'data', '.git'].includes(e.name)) continue;
      const target = path.join(ffCopy, e.name);
      if (e.isDirectory()) fs.cpSync(path.join(__dirname, e.name), target, { recursive: true });
      else if (e.isFile()) fs.copyFileSync(path.join(__dirname, e.name), target);
    }
    fs.symlinkSync(path.join(__dirname, 'node_modules'), path.join(ffCopy, 'node_modules'));
    const ffLanguages = path.join(ffCopy, 'public', 'languages');
    /* DREI FREMDDATEIEN, jede fuer eine Klammer. */
    fs.writeFileSync(path.join(ffLanguages, 'fr.json'), '{ "card.active": ', 'utf8');
    /* `de_DE` MIT UNTERSTRICH UND NICHT „erfunden": eine Locale wird an Intl
       gehalten und nicht an einem Muster gemessen -- und Intl nimmt jedes
       STRUKTURELL gueltige Kuerzel an, auch ein ausgedachtes. */
    fs.writeFileSync(path.join(ffLanguages, 'it.json'),
      JSON.stringify({ _locale: 'de_DE', _name: 'Erfunden' }), 'utf8');
    // Und der falsche Dateiname -- ein Wort, keine Sprachkennung.
    fs.writeFileSync(path.join(ffLanguages, 'Meine Sprache.json'),
      JSON.stringify({ _locale: 'de-DE', _name: 'Meine' }), 'utf8');

    const ffPort = LANGUAGE_BASE + 1 + PORT_OFFSET;
    const ffData = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-fremddaten-'));
    const ffKind = spawn(process.execPath, ['server.js'], { cwd: ffCopy,
      env: { ...process.env, PORT: String(ffPort), DATA_DIR: ffData, ENCRYPTION_KEY: KEY } });
    CASES.push({ base: LANGUAGE_BASE, port: ffPort, kind: ffKind, directory: ffData });
    let ffLog = '';
    ffKind.stdout.on('data', d => { ffLog += d; });
    ffKind.stderr.on('data', d => { ffLog += d; });
    const ffBase = `http://127.0.0.1:${ffPort}`;
    let ffUp = false;
    for (let i = 0; i < 120 && !ffUp; i++) {
      await new Promise(r => setTimeout(r, 100));
      try { ffUp = (await fetch(`${ffBase}/api/config`)).ok; } catch {}
    }
    /* DIE ERSTE UND WICHTIGSTE ZUSICHERUNG: er kommt hoch. Alles Weitere
       waere ohne sie eine Aussage ueber einen Server, den es nicht gibt. */
    check('Mit drei unbrauchbaren Dateien im Verzeichnis startet der Server trotzdem',
      ffUp === true, ffLog.split('\n').slice(-6).join(' · '));
    const ffConfig = ffUp ? await (await fetch(`${ffBase}/api/config`)).json() : {};
    /* GEFRAGT WIRD HINTER DER ANMELDUNG. Bis zum 8. */
    let ffCookie = '';
    const ffCall = async (method, filePath, body) => {
      const opt = { method, headers: {} };
      if (ffCookie) opt.headers.cookie = ffCookie;
      if (body !== undefined) {
        opt.headers['content-type'] = 'application/json';
        opt.body = JSON.stringify(body);
      }
      const a = await fetch(ffBase + filePath, opt);
      const setCookie = a.headers.get('set-cookie');
      if (setCookie) ffCookie = setCookie.split(';')[0];
      return { status: a.status, content: await a.json().catch(() => null) };
    };
    const ffSetup = ffUp
      ? await ffCall('POST', '/api/setup', { user: 'fremdanna', password: PASSWORD })
      : { status: 0 };
    check('Und eine Instanz mit drei unbrauchbaren Dateien laesst sich einrichten',
      ffSetup.status === 200 || ffSetup.status === 201, `Status ${ffSetup.status}`);
    const ffSettings = ffUp ? (await ffCall('GET', '/api/settings')).content : {};
    /* UND ER FUEHRT GENAU DIE BRAUCHBAREN. Ohne diese Zeile bliebe offen, ob
       er die drei uebergangen oder alle sechs angenommen hat. */
    check('Und er fuehrt genau die drei brauchbaren Sprachen',
      equal(((ffSettings && ffSettings.languages) || []).map(a => a.code).sort(), ['de', 'en', 'tr']),
      JSON.stringify(ffSettings && ffSettings.languages));
    check('Und die Vorgabesprache ist eine davon',
      ['de', 'en', 'tr'].includes(ffConfig.language), JSON.stringify(ffConfig.language));
    /* JEDE DER DREI WIRD NAMENTLICH GEMELDET, mit dem Grund daneben. Ein
       „irgendetwas stimmt nicht" liesse den Eigentuemer die Datei suchen. */
    check('Die Datei mit kaputtem JSON wird namentlich gemeldet',
      /\[languages\][^\n]*fr\.json/.test(ffLog),
      ffLog.split('\n').filter(z => /\[languages\]/.test(z)).join(' · ') || '(kein Wort davon)');
    check('Die Datei mit unbrauchbarer _locale ebenso',
      /\[languages\][^\n]*it\.json/.test(ffLog),
      ffLog.split('\n').filter(z => /\[languages\]/.test(z)).join(' · ') || '(kein Wort davon)');
    check('Und die Datei mit dem falschen Namen ebenso',
      /\[languages\][^\n]*Meine Sprache\.json/.test(ffLog),
      ffLog.split('\n').filter(z => /\[languages\]/.test(z)).join(' · ') || '(kein Wort davon)');
    /* UND JEDE MELDUNG SAGT, WORAN ES LAG. */
    check('Und jede Meldung nennt ihren Grund',
      new Set(ffLog.split('\n').filter(z => /\[languages\]/.test(z))
        .map(z => z.replace(/^.*zaehlt nicht als Sprache: /, ''))).size === 3,
      ffLog.split('\n').filter(z => /\[languages\]/.test(z)).join(' · '));
    /* UND DIE OBERFLAECHE LAEUFT: ein Server, der zwar horcht, aber bei der
       ersten Anfrage an einer halben Sprachtafel stirbt, waere nichts wert. */
    const ffPage = ffUp ? await (await fetch(`${ffBase}/`)).text() : '';
    check('Und die Seite kommt heraus',
      ffPage.includes('<div id="app"'), `${ffPage.length} Zeichen`);

    /* MIT await -- 0.34.0. */
    await endKind(ffKind);
    fs.rmSync(ffData, { recursive: true, force: true });
    fs.rmSync(ffCopy, { recursive: true, force: true });
  }

  /* ================= Die Serverseite spricht aus der Datei — 0.24.0
     ========== Bauabschnitt 2: server.js, auth.js und mail.js sagen keinen
     Satz mehr selbst. */
  group('Die Serverseite spricht aus der Datei — 0.24.0');
  {
    const sdDe = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'));
    /* EINE MELDUNG AUS auth.js, AN EINEM ZUGANG: das falsche bisherige
       Passwort. */
    const sdAccount = await call('PUT', '/api/account', { oldPassword: 'falsch-falsch-falsch' });
    check('Eine Meldung aus auth.js kommt als error mit Satz und Status heraus',
      sdAccount.status === 400 && sdAccount.content?.error === 'Das bisherige Passwort stimmt nicht.',
      `Status ${sdAccount.status} · ${JSON.stringify(sdAccount.content)}`);
    /* UND EINE AN EINER ANMELDUNG: der Token, den es nicht gibt. */
    const sdToken = await call('POST', '/api/token/check', { token: 'a'.repeat(64) });
    check('Und eine über eine Absagekonstante ebenso',
      sdToken.status === 400 &&
      sdToken.content?.error === 'Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern.',
      `Status ${sdToken.status} · ${JSON.stringify(sdToken.content)}`);
    /* DER ZWEITE FAKTOR: seine Absage ist ein Schluessel geworden, und der
       Satz steht in der Datei. */
    check('Die Absage des zweiten Faktors ist ein Schlüssel mit Satz in der Datei',
      require('./auth').TWO_FACTOR_DENIAL === 'login.codeWrong' &&
      sdDe['login.codeWrong'] === 'Der Code stimmt nicht.',
      `${require('./auth').TWO_FACTOR_DENIAL} · ${sdDe['login.codeWrong']}`);
    /* DIE VIER BRIEFE SAMT BETREFF. Sie sind aus mail.js in die Datei
       gezogen, die Betreffzeilen aus server.js dazu. */
    for (const kind of ['invite', 'reset', 'confirm', 'test']) {
      const subject = sdDe[`mail.${kind}.subject`], text = sdDe[`mail.${kind}.body`];
      check(`Der Brief „${kind}" steht mit Betreff und Text in der Datei`,
        typeof subject === 'string' && typeof text === 'string' && text.includes('\n'),
        `${JSON.stringify(subject)} · ${String(text).length} Zeichen`);
      check(`Und beide tragen den Titel der Installation als Platzhalter`,
        subject.includes('{instanceTitle}') && text.includes('{instanceTitle}') && text.includes('{username}'),
        `${subject} · ${String(text).slice(0, 60)}`);
    }
    /* DIE DREI LINKBRIEFE TRAGEN DEN LINK, DER TESTBRIEF NICHT -- er ist der
       eine, der keinen hat, und das ist der Unterschied, den ein Uebersetzer
       sehen muss. */
    check('Die drei Briefe mit Link tragen {link}, die Testmail nicht',
      ['invite', 'reset', 'confirm'].every(a => sdDe[`mail.${a}.body`].includes('{link}')) &&
      !sdDe['mail.test.body'].includes('{link}'),
      ['invite', 'reset', 'confirm', 'test']
        .map(a => `${a}:${sdDe[`mail.${a}.body`].includes('{link}')}`).join(' '));
    /* UND DIE BEIDEN GRIFFE SIND WIRKLICH GEREICHT. */
    const sdSrv = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    check('server.js reicht den Übersetzer an mail.js und an auth.js',
      /mail\.setTranslator\(t\);/.test(sdSrv) &&
      /auth\.setTranslator\(\(req, key, values\) =>/.test(sdSrv),
      `mail: ${/mail\.setTranslator/.test(sdSrv)} · auth: ${/auth\.setTranslator/.test(sdSrv)}`);
    /* DIE VORGABEN DER FUENFZEHN VOKABELWOERTER KOMMEN AUS DER DATEI -- eine
       Vorgabe, ein Ort (Stolperstein 47). */
    const sdVok = Object.keys(sdDe).filter(k => k.startsWith('vocabulary.'));
    check('Die fuenfzehn Vokabelvorgaben stehen in der Sprachdatei',
      sdVok.length === 15 && sdDe['vocabulary.entryOne'] === 'Eintrag'
        && sdDe['vocabulary.grade'] === 'Note',
      `${sdVok.length} Wörter: ${sdVok.map(k => k.slice(10)).join(' ')}`);
    // Im Server steht sie nicht mehr; die zweite Ausfertigung in app.js faellt
// mit Bauabschnitt 3, und die Zeile dazu steht in dessen Gruppe.
    check('Und im Server steht keine zweite Liste mehr',
      !/VOKABULAR_VORGABE/.test(sdSrv), `VOKABULAR_VORGABE in server.js: ${/VOKABULAR_VORGABE/.test(sdSrv)}`);
    /* ---- ZUSAGE 7 DER RUNDE 0.32.0: KEIN VOKABELWORT STEHT ZUSAMMENGESETZT
       -- EIN FREIES WORT DARF NIE IN EIN ANDERES VERBAUT WERDEN (Leitplanke
       L6, seit 0.21.0): „Potenzialkriterien" liest sich harmlos, und wer
       „Potenzial" in „Erwartung" umbenennt, liest „Erwartungkriterien" --
       ohne Fugen-s, und niemand hat es geschrieben. */
    const VOC_NAMES = sdVok.map(k => k.slice('vocabulary.'.length));
    const sdGlued = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const [k, v] of Object.entries(file))
        for (const text of (typeof v === 'string' ? [v] : Object.values(v)))
          for (const name of VOC_NAMES)
            if (new RegExp(`\\p{L}\\{${name}\\}|\\{${name}\\}\\p{L}`, 'u').test(String(text)))
              sdGlued.push(`${code}/${k}: ${String(text).slice(0, 50)}`);
    }
    check('Zusage 7: kein Vokabelwort steht zusammengesetzt — in keiner der drei Dateien',
      sdGlued.length === 0, sdGlued.slice(0, 6).join(' · ') || 'keines');
    /* UND DER LESER FINDET WIRKLICH ETWAS. */
    check('Und der Leser faende „{potential}kriterien" — das Beispiel aus L6',
      /\p{L}\{potential\}|\{potential\}\p{L}/u.test('Die {potential}kriterien') &&
      !/\p{L}\{grade\}|\{grade\}\p{L}/u.test('Zuletzt: {grade}'),
      'der Leser trennt Fuge und Trennzeichen nicht');
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
