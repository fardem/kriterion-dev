/* Kriterion — Pruefstand: einstellbare Bitrate der Proxys, Ersatz veralteter Proxys im Hintergrund,
   „Proxy“ in der Liste, Groesse des Videos und Knopfleiste im Vollbild; Filter „Eigene Werte“ und Vollbild am Telefon;
   Titel in der Mail und die Fehler aus der Durchsicht. */
const H = require('./frame.js');
const D = require('./dom.js');
const { buildDom, until, openRequests } = D;

async function run() {
  const { fs, os, path, __dirname, group, check, equal, open, withCsrf, jar } = H;
  await H.mainServerReady();
  let JSDOM = null;
  try { ({ JSDOM } = require('jsdom')); } catch { JSDOM = null; }
  const read = (name) => fs.readFileSync(path.join(__dirname, ...name.split('/')), 'utf8');
  const DE = JSON.parse(read('public/languages/de.json'));
  const deText = (key, values = {}) => String(DE[key]).replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const until2 = async (test, ms = 8000) => {
    for (const t0 = Date.now(); Date.now() - t0 < ms; await wait(100)) if (await test()) return true;
    return false;
  };
  const VP = require(path.join(__dirname, 'videoproxy.js'));
  const serverSource = read('server.js');

  group('Proxy: Bitrate aus Basis, Bildrate und Pixeln');
  {
    const v = (width, height, frameRate) => ({ format: 'HEVC', width, height, frameRate });
    const at = (base, ...video) => VP.videoBitRate(base, v(...video));
    const got = [at(5e6, 3840, 2160, 30), at(5e6, 3840, 2160, 25), at(5e6, 1920, 1080, 60), at(8e6, 3840, 2160, 60),
      at(5e6, 1280, 720, 30), at(5e6, 2160, 3840, 30), at(1e6, 1280, 720, 24), at(5e6, null, null, null)];
    check('Die Basis gilt fuer 1080p30; Bildrate und Pixel des Proxys im Verhaeltnis, hoechstens 10 Mbit/s',
      equal(got, [5000000, 4166667, 10000000, 10000000, 2222222, 5000000, 355556, 5000000]), JSON.stringify(got));
    check('Die Pixel des Proxys rechnet nur videoproxy.js', typeof VP.proxyPixels === 'function' &&
      equal(VP.proxyPixels(v(3840, 2160)), { width: 1920, height: 1080 }) &&
      !/function proxyPixels/.test(serverSource) && /\.\.\.videoproxy\.proxyPixels\(v\)/.test(serverSource),
      JSON.stringify(VP.proxyPixels(v(3840, 2160))));
    const line = VP.ffmpegArgs('C', 'http://127.0.0.1:1/x', '/tmp/o.mp4', v(3840, 2160, 25), 6.5e6).join(' ');
    const need = VP.expectedBytes({ general: { duration: 100 }, video: [v(3840, 2160, 25)], audio: [] }, 6.5e6);
    check('ffmpeg bekommt die Bitrate aus der Basis; der Platz im RAM folgt ihr',
      line.includes('-b:v 5416667 -maxrate 5416667 -bufsize 10833334 -g 50') &&
      need === Math.ceil(100 * (5416667 + 128000) / 8 * 1.1), `${need} ${line}`);
  }

  /* ---- Server und Accounts ---- */
  // Die Basis teilt sich das Modul mit release_041 bis release_055; die Module laufen nacheinander.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-056-'));
  const dir = path.join(root, 'data');
  const backupRoot = path.join(root, 'backup');
  fs.mkdirSync(dir);
  fs.mkdirSync(backupRoot);
  const proxyDir = path.join(dir, 'files', 'proxy');
  const pw = (user) => user + '-langes-wort-56';
  const cookies = {};
  const bench = (more = '') => ({ BACKUP_DIR: backupRoot,
    KRITERION_TESTBENCH: `pruefstand:scrypt=1024:mail=40:brake=10:ffmpeg=1:qsv=1${more}` });
  let B = H.startFurtherServer(dir, bench(), 7340);
  await B.ready;
  await B.call('POST', '/api/setup', { user: 'owner', password: pw('owner') });
  await B.call('POST', '/api/users', { username: 'zweit', password: pw('zweit'), role: 'user' });
  await B.call('POST', '/api/users', { username: 'dritt', password: pw('dritt'), role: 'admin' });
  async function login() {
    for (const user of ['owner', 'zweit', 'dritt']) {
      const r = await fetch(B.base + '/api/login', { method: 'POST',
        headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user, password: pw(user) }) });
      cookies[user] = jar('', r);
    }
  }
  await login();
  async function restart(env) {
    await B.stop();
    B = H.startFurtherServer(dir, env, 7340);
    await B.ready;
    await login();
  }
  const as = async (who, method, url, body) => {
    const a = await fetch(B.base + url, { method,
      headers: withCsrf(cookies[who], body !== undefined ? { 'content-type': 'application/json' } : {}),
      body: body !== undefined ? JSON.stringify(body) : undefined });
    return { status: a.status, content: await a.json().catch(() => null) };
  };
  const inDb = (fn) => {
    const d = open(path.join(dir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    try { return fn(d); } finally { d.close(); }
  };
  const upload = (who, itemId, files) => H.sendFiles(B.base, cookies[who], itemId, files, null);
  const fileNamed = async (itemId, name) =>
    ((await as('owner', 'GET', `/api/items/${itemId}`)).content?.attachments || []).find(a => a.filename === name);
  const proxyRow = (id) => inDb(d => d.prepare(`SELECT p.disk_file_id, p.name, p.size, p.state, p.reason, r.video_bps
    FROM proxy_files p JOIN disk_files f ON f.id = p.disk_file_id LEFT JOIN proxy_rates r ON r.disk_file_id = p.disk_file_id
    WHERE f.attachment_id = ?`).get(id));
  const factsOf = (id) => inDb(d => JSON.parse(d.prepare('SELECT info FROM attachment_media WHERE attachment_id = ?').get(id).info));
  const proxyOf = async (id, v, headers = {}) => {
    const a = await fetch(`${B.base}/api/attachments/${id}/raw?size=proxy${v == null ? '' : `&v=${v}`}`,
      { headers: withCsrf(cookies['zweit'], headers) });
    return { status: a.status, headers: a.headers, bytes: Buffer.from(await a.arrayBuffer()) };
  };
  const stats = async () => (await as('dritt', 'GET', '/api/stats')).content?.proxy || {};
  const benchLine = (bytes) => { const at = bytes.indexOf('proxy '); return at < 0 ? '' : bytes.toString('latin1', at, bytes.indexOf('\n', at)); };
  // Die Logzeile kommt ueber die Pipe nach der Zeile in der Datenbank; until2() wartet auf beides.
  const count = (text) => B.log().split(text).length - 1;

  group('Proxy: die Bitrate in den Einstellungen');
  const before = (await as('dritt', 'GET', '/api/settings')).content?.proxyRate;
  const byAdmin = await as('dritt', 'PUT', '/api/settings', { proxyRate: 6 });
  check('Vorgabe 5 Mbit/s; aendern darf nur der Eigentuemer-Admin', before === 5 && byAdmin.status === 403,
    `${before} ${byAdmin.status}`);
  const refused = [];
  for (const wrong of [0.9, 8.1, 5.55, '5', null, true]) refused.push(await as('owner', 'PUT', '/api/settings', { proxyRate: wrong }));
  check('Abgelehnt: unter 1, ueber 8, zwei Stellen nach dem Komma, Text, null und true',
    refused.every(r => r.status === 400 && r.content?.error === deText('server.proxyRate', { min: 1, max: 8 })),
    refused.map(r => `${r.status} ${r.content?.error}`).join(' | '));
  const saved = await as('owner', 'PUT', '/api/settings', { proxyRate: 6.5 });
  const edges = [await as('owner', 'PUT', '/api/settings', { proxyRate: 1 }), await as('owner', 'PUT', '/api/settings', { proxyRate: 8 })];
  check('6,5 wird gespeichert und zurueckgegeben; 1 und 8 sind erlaubt',
    saved.status === 200 && saved.content?.proxyRate === 6.5 && edges.every(r => r.status === 200) &&
    edges.map(r => r.content?.proxyRate).join() === '1,8', `${saved.status} ${JSON.stringify(saved.content?.proxyRate)}`);
  await as('owner', 'PUT', '/api/settings', { proxyRate: 1.1 });
  const stored = inDb(d => d.prepare("SELECT value FROM settings WHERE key = 'proxyRate'").get()?.value);
  check('In der Datenbank steht die Zahl mit einer Stelle nach dem Komma; GET nennt sie jedem',
    stored === '1.1' && (await as('zweit', 'GET', '/api/settings')).content?.proxyRate === 1.1, String(stored));
  await as('owner', 'PUT', '/api/settings', { proxyRate: 5 });

  group('Proxy: Ersatz im Hintergrund');
  await as('owner', 'PUT', '/api/settings', { proxyOn: true });
  const item = (await as('owner', 'POST', '/api/items', { title: 'Eintrag P' })).content.id;
  await upload('zweit', item, [{ name: 'clip.mp4', content: H.testMp4({ pad: 11 }) }]);
  const clipId = (await fileNamed(item, 'clip.mp4'))?.id;
  await until2(() => proxyRow(clipId)?.state === 'ready', 20000);
  const facts = factsOf(clipId);
  const rateOf = (base) => VP.videoBitRate(base, facts.video[0]);
  const first = proxyRow(clipId) || {};
  check('Ein neuer Proxy merkt sich die Bitrate, mit der er entstand',
    first.state === 'ready' && first.video_bps === rateOf(5e6) && (await stats()).stale === 0,
    JSON.stringify(first));
  // run=1000: der stuendliche Lauf mit sweepProxyDir() und proxySoon() jede Sekunde.
  await restart(bench(':ffmpeghold=2500:proxyhold=6000:run=1000'));
  const old = await proxyOf(clipId, first.size);
  await as('owner', 'PUT', '/api/settings', { proxyRate: 1 });
  const busy = await stats();
  await wait(300);
  const during = await proxyOf(clipId, first.size);
  await wait(900);
  const still = await stats();
  check('Nach dem Aendern zaehlt die Karte den Proxy als veraltet; bis der neue fertig ist, spielt der alte, und er wartet nur einmal',
    busy.stale === 1 && busy.waiting === 1 && during.status === 200 && during.bytes.equals(old.bytes) &&
    proxyRow(clipId)?.name === first.name && still.waiting === 1, `${JSON.stringify(busy)} ${during.status} ${still.waiting}`);
  const swapped = await until2(() => proxyRow(clipId)?.name !== first.name &&
    count(`Proxy for file ${clipId} replaced in `) === 1, 10000);
  const next = proxyRow(clipId) || {};
  const fresh = await proxyOf(clipId, next.size);
  check('Der neue ersetzt den alten mit der neuen Bitrate; das Log nennt den Ersatz',
    swapped && next.state === 'ready' && next.video_bps === rateOf(1e6) && next.size !== first.size &&
    benchLine(fresh.bytes).includes(` -b:v ${rateOf(1e6)} `) && count(`Proxy for file ${clipId} replaced in `) === 1 &&
    (await stats()).stale === 0, JSON.stringify(next));
  const heldWhole = await proxyOf(clipId, first.size);
  const heldPart = await proxyOf(clipId, first.size, { range: 'bytes=10-109' });
  const plain = await proxyOf(clipId);
  check('Die Adresse mit dem `v` des alten liefert weiter den alten, auch in Bereichen; ohne `v` kommt der neue',
    heldWhole.bytes.equals(old.bytes) && heldPart.status === 206 &&
    heldPart.headers.get('content-range') === `bytes 10-109/${first.size}` && heldPart.bytes.equals(old.bytes.subarray(10, 110)) &&
    plain.bytes.equals(fresh.bytes) && fs.existsSync(path.join(proxyDir, first.name)),
    `${heldPart.status} ${heldPart.headers.get('content-range')}`);
  const gone = await until2(() => !fs.existsSync(path.join(proxyDir, first.name)), 12000);
  const late = await proxyOf(clipId, first.size);
  check('Nach der Frist ist die alte Datei geloescht, und auch das alte `v` bekommt den neuen',
    gone && late.status === 200 && late.bytes.equals(fresh.bytes), `${gone} ${late.status}`);

  group('Proxy: abgespielte zuerst, Fehlschlag und Neustart');
  await upload('zweit', item, [{ name: 'x.mp4', content: H.testMp4({ pad: 21 }) }, { name: 'y.mp4', content: H.testMp4({ pad: 22 }) },
    { name: 'z.mp4', content: H.testMp4({ pad: 23 }) }]);
  const [xId, yId, zId] = [(await fileNamed(item, 'x.mp4'))?.id, (await fileNamed(item, 'y.mp4'))?.id, (await fileNamed(item, 'z.mp4'))?.id];
  await until2(() => [xId, yId, zId].every(id => proxyRow(id)?.state === 'ready'), 30000);
  await as('owner', 'PUT', '/api/settings', { proxyRate: 2 });
  await wait(300);
  const played = await proxyOf(xId);
  const allNew = await until2(() => [clipId, xId, yId, zId].every(id => proxyRow(id)?.video_bps === rateOf(2e6)) &&
    [xId, yId, zId].every(id => count(`Proxy for file ${id} replaced in `) === 1) &&
    count(`Proxy for file ${clipId} replaced in `) === 2, 30000);
  const at = (id) => B.log().indexOf(`Proxy for file ${id} replaced in `);
  check('Ein veraltetes Video, das gerade spielt, kommt in der Warteschlange nach vorn',
    played.status === 200 && allNew && at(zId) >= 0 && at(zId) < at(xId) && at(xId) < at(yId) && at(yId) < B.log().lastIndexOf(`Proxy for file ${clipId} replaced in `),
    [zId, xId, yId, clipId].map(id => `${id}:${at(id)}`).join(' '));
  const kept = Object.fromEntries([clipId, xId, yId, zId].map(id => [id, proxyRow(id)]));
  await restart(bench(':ffmpegfail=1:run=1000'));
  await as('owner', 'PUT', '/api/settings', { proxyRate: 3 });
  const failedAll = await until2(() => [clipId, xId, yId, zId].every(id => count(`Proxy for file ${id} not replaced, the old one stays: `) === 1), 20000);
  const stillOld = await proxyOf(xId, kept[xId].size);
  check('Scheitert der Ersatz, bleibt der alte Proxy: Zeile, Datei und Abspielen; die Karte zaehlt ihn weiter als veraltet',
    failedAll && [clipId, xId, yId, zId].every(id => equal(proxyRow(id), kept[id]) && fs.existsSync(path.join(proxyDir, kept[id].name))) &&
    stillOld.status === 200 && stillOld.bytes.length === kept[xId].size && (await stats()).stale === 4 && (await stats()).failed === 0,
    JSON.stringify(proxyRow(xId)));
  await wait(1500);
  check('Bis zum Neustart kein neuer Versuch, auch nicht beim Abspielen',
    count(`Proxy for file ${xId} not replaced`) === 1 && (await stats()).waiting === 0, String(count(`Proxy for file ${xId} not replaced`)));
  await as('owner', 'PUT', '/api/settings', { proxyRate: 3.5 });
  const again = await until2(() => [clipId, xId, yId, zId].every(id => count(`Proxy for file ${id} not replaced`) === 2), 20000);
  check('Eine neue Bitrate versucht es wieder', again, String(count(`Proxy for file ${xId} not replaced`)));
  await restart(bench());
  const restarted = await until2(() => [clipId, xId, yId, zId].every(id => proxyRow(id)?.video_bps === rateOf(3.5e6)), 20000);
  check('Nach dem Neustart entstehen sie mit der eingestellten Bitrate', restarted && (await stats()).stale === 0,
    [clipId, xId, yId, zId].map(id => proxyRow(id)?.video_bps).join(' '));

  group('Proxy: Bestand ohne gemerkte Bitrate');
  await B.stop();
  const names = Object.fromEntries([clipId, xId].map(id => [id, proxyRow(id)?.name]));
  inDb(d => d.prepare('DELETE FROM proxy_rates').run());
  B = H.startFurtherServer(dir, bench(), 7340);
  await B.ready;
  await login();
  const renewed = await until2(() => [clipId, xId, yId, zId].every(id => proxyRow(id)?.video_bps === rateOf(3.5e6)) &&
    count(`Proxy for file ${clipId} replaced in `) === 1, 20000);
  check('Ein Proxy ohne Zeile in proxy_rates gilt als veraltet und wird beim Start ersetzt',
    renewed && proxyRow(clipId)?.name !== names[clipId] && proxyRow(xId)?.name !== names[xId] &&
    count(`Proxy for file ${clipId} replaced in `) === 1, JSON.stringify(proxyRow(clipId)));
  const xRow = proxyRow(xId);
  await as('zweit', 'DELETE', `/api/attachments/${xId}`);
  const binned = ((await as('owner', 'GET', '/api/trash')).content?.rows || []).find(z => z.title === 'x.mp4');
  await as('owner', 'DELETE', `/api/trash/${binned?.id}`);
  const purged = await until2(() => !fs.existsSync(path.join(proxyDir, xRow.name)), 8000);
  check('Endgueltig geloescht: auch die gemerkte Bitrate ist weg',
    purged && !inDb(d => d.prepare('SELECT 1 FROM proxy_rates WHERE disk_file_id = ?').get(xRow.disk_file_id)),
    String(purged));

  await B.stop();
  fs.rmSync(root, { recursive: true, force: true });

  /* ---- Fehler aus der Durchsicht: Server ---- */
  // Hinter dem Proxy: X-Forwarded-For waehlt die Adresse, von der ein Versuch zaehlt.
  const rRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-0563-'));
  const rDir = path.join(rRoot, 'data'), rBackup = path.join(rRoot, 'backup');
  fs.mkdirSync(rDir);
  fs.mkdirSync(rBackup);
  const rEnv = (more = '') => ({ BACKUP_DIR: rBackup, BEHIND_PROXY: '1', PUBLIC_ADDRESS: 'https://kriterion.beispiel.de',
    KRITERION_TESTBENCH: `pruefstand:scrypt=1024:mail=40:brake=10${more}` });
  const rPw = 'chefin-langes-wort-0563';
  let R = H.startFurtherServer(rDir, rEnv(), 7340);
  await R.ready;
  await R.call('POST', '/api/setup', { user: 'chefin', password: rPw });
  await R.call('PUT', '/api/settings', { languageDefault: 'de' });
  const rFree = (purpose, target = null) => R.call('POST', '/api/confirm', { password: rPw, purpose, target });
  const rPost = async (url, body, address, cookie = '') => {
    const headers = { 'content-type': 'application/json', ...(address ? { 'x-forwarded-for': address } : {}) };
    const a = await fetch(R.base + url, { method: 'POST', headers: cookie ? withCsrf(cookie, headers) : headers,
      body: JSON.stringify(body) });
    return { status: a.status, content: await a.json().catch(() => null), cookie: jar(cookie, a) };
  };
  const rRestart = async (more) => {
    await R.stop();
    R = H.startFurtherServer(rDir, rEnv(more), 7340);
    await R.ready;
    await R.call('POST', '/api/login', { user: 'chefin', password: rPw });
  };

  group('Mail: der Titel der Installation in Betreff und Text');
  const confirmKey = (letter) => (letter.core.match(/#\/confirm\/([0-9a-f]{64})/) || [])[1];
  const letterTo = (E, address) => E.letters().filter(b => new RegExp(`^To: ${address.replace(/\./g, '\\.')}$`, 'm').test(b.head)).pop();
  const E = H.smtpEmpfaenger('ok');
  {
    await R.call('PUT', '/api/titles', { publicTitle: 'Werkstatt Süd', appTitle: 'Bewertungen' });
    await rFree('mail');
    await R.call('PUT', '/api/mail', { provider: 'eigen', server: '127.0.0.1', port: E.port, secure: false,
      user: 'konto', password: 'geheim-0563', sender: 'kriterion@beispiel.de' });
    await R.call('PUT', '/api/account', { oldPassword: rPw, username: 'chefin', email: 'chefin@beispiel.de' });
    await R.call('POST', '/api/mail/test', {});
    await R.call('POST', '/api/users', { username: 'bert', sendInvite: true, email: 'bert@beispiel.de' });
    await R.call('PUT', '/api/signup/toggle', { an: true });
    await rPost('/api/signup', { name: 'clara', address: 'clara@beispiel.de' });
    await until2(() => ['chefin', 'bert', 'clara'].every(n => letterTo(E, `${n}@beispiel.de`)), 8000);
    // Betreff nach RFC 2047: =?UTF-8?Q?…?= oder =?UTF-8?B?…?=, auch ueber mehrere Zeilen.
    const subjectOf = (head) => (head.replace(/\r?\n[ \t]+/g, ' ').split('\n').find(z => /^Subject:/i.test(z)) || '')
      .replace(/^Subject:\s*/i, '').replace(/=\?utf-8\?([QB])\?([^?]*)\?=\s*/gi, (m, kind, text) => (kind.toUpperCase() === 'B'
        ? Buffer.from(text, 'base64') : Buffer.from(text.replace(/_/g, ' ')
          .replace(/=([0-9A-F]{2})/gi, (x, h) => String.fromCharCode(parseInt(h, 16))), 'binary')).toString('utf8'));
    const seen = ['chefin', 'bert', 'clara'].map(n => {
      const b = letterTo(E, `${n}@beispiel.de`) || { head: '', core: '' };
      return { n, subject: subjectOf(b.head), core: b.core };
    });
    check('Testmail, Einladung und Bestaetigung nennen den Titel in Betreff und Text; kein Platzhalter bleibt stehen',
      seen.every(s => s.subject.includes('Werkstatt Süd') && s.core.includes('„Werkstatt Süd“') &&
        !/\{\w+\}/.test(s.subject + s.core)), seen.map(s => `${s.n}: ${s.subject}`).join(' | '));
    check('Die drei Aufrufe in server.js uebergeben instanceTitle, den Namen aus den Sprachdateien',
      (read('server.js').match(/instanceTitle: getSetting\('title_public'|const instanceTitle = getSetting\('title_public'/g) || []).length === 3,
      'Aufruf');
  }

  group('Mail: das gespeicherte Passwort und der Grund eines Fehlers');
  {
    const F = H.smtpEmpfaenger('fehler');
    await rFree('mail');
    const foreign = await R.call('PUT', '/api/mail', { provider: 'eigen', server: 'smtp.fremd.example', port: 25, secure: false,
      user: 'konto', password: '', sender: 'kriterion@beispiel.de' });
    await rFree('mail');
    const same = await R.call('PUT', '/api/mail', { provider: 'eigen', server: '127.0.0.1', port: F.port, secure: false,
      user: 'konto', password: '', sender: 'kriterion@beispiel.de' });
    check('Ein leeres Passwort uebernimmt das gespeicherte nur fuer denselben Server',
      foreign.status === 400 && foreign.content?.error === DE['mail.passwordMissing'] && same.status === 200,
      `${foreign.status} ${foreign.content?.error} · ${same.status}`);
    const key = confirmKey(letterTo(E, 'clara@beispiel.de') || { core: '' });
    await rPost('/api/signup/confirm', { key });
    const asked = ((await R.call('GET', '/api/requests')).content?.requests || []).find(a => a.username === 'clara');
    const approved = await R.call('POST', `/api/requests/${asked?.id}/approve`);
    check('Scheitert der Versand beim Freischalten, nennt die Antwort den Grund',
      approved.content?.delivery === 'fehlgeschlagen' && String(approved.content?.deliveryReason || '').length > 0,
      `${approved.content?.delivery} · ${JSON.stringify(approved.content?.deliveryReason)}`);
    await F.stop();
    await rFree('mail');
    await R.call('PUT', '/api/mail', { provider: 'eigen', server: '127.0.0.1', port: E.port, secure: false,
      user: 'konto', password: '', sender: 'kriterion@beispiel.de' });
  }

  group('Anmeldebremse: parallele Versuche, Kopf nur aus dem eigenen Netz');
  {
    const burst = await Promise.all(Array.from({ length: 15 }, () =>
      rPost('/api/login', { user: 'chefin', password: 'falsch-falsch-falsch' }, '203.0.113.5')));
    const n = (s) => burst.filter(a => a.status === s).length;
    check('15 parallele Fehlversuche von einer Adresse: 10 werden geprueft, 5 gesperrt',
      n(401) === 10 && n(429) === 5, burst.map(a => a.status).join(' '));
    const m = read('auth.js').match(/const PRIVATE_PEER =\s*\/(.+)\/i;/);
    const peer = m ? new RegExp(m[1], 'i') : /$^/;
    const inside = ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.1', '192.168.1.5', '100.64.0.1', '100.127.1.1',
      '::1', 'fd12::1', 'fc00::2', 'fe80::1'];
    const outside = ['203.0.113.5', '172.32.0.1', '172.15.0.1', '100.128.0.1', '192.169.0.1', '8.8.8.8', '2001:db8::1', '::ffff:203.0.113.5'];
    check('X-Forwarded-For gilt nur von Loopback, privaten Netzen, CGNAT, ULA und Link-local',
      !!m && inside.every(a => peer.test(a)) && !outside.some(a => peer.test(a)) &&
      /PRIVATE_PEER\.test\(peer\.replace\(\/\^::ffff:\/i, ''\)\)/.test(read('auth.js')),
      `${inside.filter(a => !peer.test(a)).join(' ')} | ${outside.filter(a => peer.test(a)).join(' ')}`);
    const dora = await R.call('POST', '/api/users', { username: 'dora', password: 'doras-langes-wort-0563' });
    const login = await rPost('/api/login', { user: 'dora', password: 'doras-langes-wort-0563' }, '203.0.113.8');
    const put = async () => {
      const a = await fetch(R.base + '/api/account', { method: 'PUT',
        headers: withCsrf(login.cookie, { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.9' }),
        body: JSON.stringify({ oldPassword: 'falsch-falsch-falsch', username: 'dora' }) });
      return a.status;
    };
    const tries = [];
    for (let i = 0; i < 11; i++) tries.push(await put());
    const start = await rPost('/api/two-factor/start', { password: 'falsch-falsch-falsch' }, '203.0.113.9', login.cookie);
    check('Das alte Passwort am eigenen Account und das Passwort des zweiten Faktors zaehlen wie eine Anmeldung',
      dora.status === 200 && login.status === 200 && tries.slice(0, 10).every(s => s === 400) && tries[10] === 429 &&
      start.status === 429, `${tries.join(' ')} · ${start.status}`);
    await rPost('/api/signup', { name: 'emil', address: 'emil@beispiel.de' });
    await until2(() => letterTo(E, 'emil@beispiel.de'), 8000);
    const key = confirmKey(letterTo(E, 'emil@beispiel.de') || { core: '' });
    for (let i = 0; i < 9; i++) await rPost('/api/login', { user: 'emil', password: 'falsch-falsch-falsch' }, '203.0.113.10');
    const confirmed = await rPost('/api/signup/confirm', { key }, '203.0.113.10');
    const tenth = await rPost('/api/login', { user: 'emil', password: 'falsch-falsch-falsch' }, '203.0.113.10');
    const after = await rPost('/api/login', { user: 'chefin', password: rPw }, '203.0.113.10');
    check('Der Link der Registrierung setzt den Zaehler der Adresse nicht zurueck',
      !!key && confirmed.status === 200 && tenth.status === 401 && after.status === 429,
      `${confirmed.status} ${tenth.status} ${after.status}`);
  }

  group('Server: Testtag, Vorschaubild, letzter Eigentuemer');
  {
    const itemId = (await R.call('POST', '/api/items', { title: 'Eintrag R' })).content?.id;
    const latest = new Date(Date.now() + 14 * 3600000).toISOString().slice(0, 10);
    const later = new Date(Date.parse(latest) + 86400000).toISOString().slice(0, 10);
    const dayOk = await R.call('POST', `/api/items/${itemId}/test-days`, { day: latest, rating: 4 });
    const dayLate = await R.call('POST', `/api/items/${itemId}/test-days`, { day: later, rating: 4 });
    check('Ein Testtag darf bis zum Datum in UTC+14 liegen: nach Mitternacht in Deutschland und der Tuerkei kein Fehler',
      dayOk.status === 201 && dayLate.status === 400 && dayLate.content?.error === DE['server.dateFuture'] &&
      /Date\.now\(\) \+ 14 \* 3600000/.test(read('server.js')), `${latest} ${dayOk.status} · ${later} ${dayLate.status}`);
    const login = await rPost('/api/login', { user: 'chefin', password: rPw });
    const fd = new FormData();
    const picture = await H.sharp({ create: { width: 320, height: 240, channels: 3, background: '#36c' } }).jpeg().toBuffer();
    fd.append('photos', new Blob([picture], { type: 'image/jpeg' }), 'foto.jpg');
    await fetch(`${R.base}/api/items/${itemId}/photos`, { method: 'POST', body: fd, headers: withCsrf(login.cookie, {}) });
    const photoId = (await R.call('GET', `/api/items/${itemId}`)).content?.photos?.[0]?.id;
    const d = open(path.join(rDir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    try { d.prepare('UPDATE photos SET thumb = NULL WHERE id = ?').run(photoId); } finally { d.close(); }
    const tile = await fetch(`${R.base}/api/photos/${photoId}/raw?size=thumb`, { headers: withCsrf(login.cookie, {}) });
    const tileBytes = Buffer.from(await tile.arrayBuffer());
    check('Fehlt das Vorschaubild eines Fotos, liefert ?size=thumb das Original statt 500',
      tile.status === 200 && tileBytes.equals(picture), `${tile.status} ${tileBytes.length} von ${picture.length}`);
    const ober = (await R.call('POST', '/api/users', { username: 'ober', password: 'obers-langes-wort-0563', role: 'owner' })).content?.id;
    const locked = await R.call('PUT', `/api/users/${ober}`, { status: 'locked' });
    await rFree('role', ober);
    const demoted = await R.call('PUT', `/api/users/${ober}`, { role: 'user' });
    await R.call('PUT', `/api/users/${ober}`, { status: 'active' });
    check('Die Sperre „letzter Eigentuemer“ zaehlt nur aktive: ein gesperrter Eigentuemer laesst sich herabstufen',
      locked.status === 200 && demoted.status === 200 && demoted.content?.role === 'user',
      `${locked.status} ${demoted.status} ${demoted.content?.error || ''}`);
  }

  group('Server: Lockfile und Backup-Ordner');
  {
    const lock = path.join(rBackup, 'kriterion-files', '.lock');
    fs.writeFileSync(path.join(rBackup, 'kriterion-files'), 'eine Datei statt des Ordners');
    const crash = await R.call('POST', '/api/files/missing', { names: [] }).catch(e => ({ status: 0, content: e.message }));
    const alive = await fetch(R.base + '/api/config').then(a => a.status).catch(() => 0);
    check('Laesst sich das Lockfile nicht anlegen, endet „Zurueckholen“ mit 500; der Server laeuft weiter',
      crash.status === 500 && alive === 200, `${crash.status} ${alive}`);
    fs.rmSync(path.join(rBackup, 'kriterion-files'), { force: true });
    await R.stop();
    fs.mkdirSync(path.dirname(lock), { recursive: true });
    fs.writeFileSync(lock, 'anderer-rechner 1 2026-10-03T00:00:00.000Z\n');
    const aborted = path.join(rBackup, 'kriterion-2026-10-03-00-00-00.sqlite.wird');
    fs.writeFileSync(aborted, '');
    R = H.startFurtherServer(rDir, rEnv(), 7340);
    await R.ready;
    check('Findet der Start ein abgebrochenes Backup, loescht er das Lockfile; sonst sperrte es 24 h',
      !fs.existsSync(lock), String(fs.existsSync(lock)));
    fs.rmSync(aborted, { force: true });
    await rRestart(':hold=4000');
    await rFree('backup');
    const rule = await R.call('POST', '/api/backup/cleanup', { kind: 'rule', keep: 0, days: 30 });
    check('„Jetzt loeschen“ rechnet mit den Werten aus dem Rumpf, nicht mit den gespeicherten',
      rule.status === 400 && rule.content?.error === deText('server.ruleKeep', { min: 1, max: 20 }),
      `${rule.status} ${rule.content?.error}`);
    const itemId = (await R.call('POST', '/api/items', { title: 'Eintrag mit Datei' })).content?.id;
    const login = await rPost('/api/login', { user: 'chefin', password: rPw });
    await H.sendFiles(R.base, login.cookie, itemId, [{ name: 'F.txt', content: Buffer.from('x'.repeat(2000)) }], null);
    await H.nextSecond();
    const started = await R.call('POST', '/api/backup');
    const held = await until2(() => fs.existsSync(lock), 3000);
    await R.stop();
    check('SIGTERM waehrend der Kopie gibt das Lockfile frei', started.status === 202 && held && !fs.existsSync(lock),
      `${started.status} ${held} ${fs.existsSync(lock)}`);
  }
  await E.stop();
  fs.rmSync(rRoot, { recursive: true, force: true });

  if (!JSDOM) { check('jsdom fehlt: Karte, Liste und Vollbild bleiben ungeprueft', false, 'npm install'); return; }

  group('Proxy: Bitrate in der Karte');
  {
    const cardOf = (w) => [...w.document.querySelectorAll('.sys-card')]
      .find(c => c.querySelector('h3')?.textContent === DE['card.proxyTitle']);
    const owner = buildDom(JSDOM, { settings: { filters: null, proxyOn: true, proxyRate: 6.5 },
      statsProxy: { checked: true, quickSync: true, driver: 'Intel iHD driver - 25.2.3', reason: null, detail: null, tmpfs: true,
        tmpTotal: 2147483648, tmpFree: 1610612736, ready: 3, failed: 0, bytes: 31457280, waiting: 2, stale: 2 } });
    const w = owner.w;
    await until(w, (z) => z.document.getElementById('count') && openRequests(z) === 0, 3000, 'die Uebersicht');
    await D.sysSection(w, 'installation');
    const field = w.document.getElementById('proxy-rate');
    const text = cardOf(w)?.textContent.replace(/\s+/g, ' ') || '';
    check('Der Eigentuemer-Admin sieht das Feld mit 1 bis 8 in Schritten von 0,1, den Hinweis und die veralteten',
      !!field && field.value === '6.5' && field.min === '1' && field.max === '8' && field.step === '0.1' &&
      text.includes(DE['card.proxyRate']) && text.includes(DE['card.proxyRateHint']) && text.includes(`${DE['card.proxyStale']}2`),
      `${field?.value} ${text.slice(0, 300)}`);
    const change = async (value) => {
      field.value = value;
      const sent = owner.sent.length;
      field.dispatchEvent(new w.Event('change', { bubbles: true }));
      await until(w, (z) => owner.sent.length > sent && openRequests(z) === 0, 2000, 'das Speichern').catch(() => {});
      return owner.sent.slice(sent).find(s => s.method === 'PUT' && s.url === '/api/settings');
    };
    const put = await change('7.5');
    check('Das Feld speichert proxyRate als Zahl', equal(put?.body, { proxyRate: 7.5 }) && field.value === '7.5' &&
      w.eval('SETTINGS.proxyRate') === 7.5, JSON.stringify(put?.body));
    await change('8.5');
    check('Einen Wert ausserhalb weist der Server ab; das Feld zeigt wieder den gespeicherten',
      field.value === '7.5' && w.document.querySelector('.toast')?.textContent === deText('server.proxyRate', { min: 1, max: 8 }),
      `${field.value} ${w.document.querySelector('.toast')?.textContent}`);
    w.close();
    const admin = buildDom(JSDOM, { settings: { filters: null, isAdmin: true, isOwner: false, proxyOn: true, proxyRate: 6.5 } });
    await until(admin.w, (z) => z.document.getElementById('count') && openRequests(z) === 0, 3000, 'die Uebersicht');
    await D.sysSection(admin.w, 'installation');
    const adminText = cardOf(admin.w)?.textContent.replace(/\s+/g, ' ') || '';
    check('Ein Admin liest die Bitrate ohne Feld; ohne veraltete keine Zeile dafuer',
      !admin.w.document.getElementById('proxy-rate') && adminText.includes(`${DE['card.proxyRate']}6,5`) &&
      !adminText.includes(DE['card.proxyStale']), adminText.slice(0, 300));
    admin.w.close();
  }

  const MB = 1024 * 1024;
  const vChefin = { id: 1, name: 'chefin', deleted: false };
  const video = (id, filename, more = {}) => ({ id, filename, mime_type: 'video/mp4', size: 3000, sort_order: id,
    preview: 'video', still: 1234, duration: 42, codec: 'HEVC', created_at: '2026-10-02 08:00:00', mine: true,
    author: vChefin, folder: null, ...more });

  group('Proxy in der Liste');
  {
    const m = buildDom(JSDOM, { hash: '#/item/1', settings: { filters: null, userCount: 1, filesView: 'list' },
      extraAttachments: [video(80, 'clip.mp4', { proxy: { size: 40 * MB, width: 1920, height: 1080 } }), video(81, 'ohne.mp4', { proxy: null })] });
    const w = m.w;
    await until(w, (z) => z.document.querySelector('#atts .atile[data-key="f81"]') && openRequests(z) === 0, 3000, 'die Liste');
    const mark = (k) => w.document.querySelector(`#atts .atile[data-key="${k}"] .aacts .aproxy`);
    check('Mit Proxy steht „Proxy“ in der Spalte vor Bearbeiten und Link; der Titel nennt Pixel und Groesse',
      w.document.getElementById('atts').classList.contains('aproxy-on') && mark('f80')?.hidden === false &&
      mark('f80')?.textContent === DE['entry.proxyMark'] &&
      mark('f80')?.title === `${DE['entry.proxyMark']} · 1920 × 1080 · ${w.eval(`filesize(${40 * MB})`)}` &&
      mark('f80')?.parentElement.firstElementChild === mark('f80'), `${mark('f80')?.hidden} ${mark('f80')?.title}`);
    check('Ohne Proxy steht dort nichts', mark('f81')?.hidden === true && mark('f81')?.title === '', String(mark('f81')?.hidden));
    w.close();
    const none = buildDom(JSDOM, { hash: '#/item/1', settings: { filters: null, userCount: 1, filesView: 'list' },
      extraAttachments: [video(81, 'ohne.mp4', { proxy: null })] });
    await until(none.w, (z) => z.document.querySelector('#atts .atile[data-key="f81"]') && openRequests(z) === 0, 3000, 'die Liste');
    check('Ohne einen Proxy im Eintrag bekommt die Liste keine eigene Spalte',
      !none.w.document.getElementById('atts').classList.contains('aproxy-on'), none.w.document.getElementById('atts').className);
    none.w.close();
    const css = read('public/style.css');
    const narrow = css.slice(css.indexOf('@media (max-width: 700px), (max-height: 500px) and (max-width: 960px)'));
    check('Die Spalte: 44 px, Bearbeiten und Link ruecken nach; am Telefon fehlt sie wie die Knoepfe',
      /\.alist \.aproxy-on \.aacts \{ grid-template-columns: 44px 36px 36px; \}/.test(css) &&
      /\.aproxy-on \.aedit \{ grid-column: 2; \}/.test(css) && /\.aproxy-on \.alink \{ grid-column: 3; \}/.test(css) &&
      /\.alist \.aproxy-on \.acols-rest \{ width: 160px; \}/.test(css) && /\.alist \.aacts, \.alist \.acols \{ display: none; \}/.test(narrow),
      'Regel fehlt');
  }

  group('Vollbild: Groesse des Videos und Knopfleiste');
  {
    const m = buildDom(JSDOM, { hash: '#/item/1', settings: { filters: null, userCount: 1 },
      extraAttachments: [video(80, 'clip.mp4', { proxy: { size: 40 * MB, width: 1920, height: 1080 } }), video(81, 'ohne.mp4')] });
    const w = m.w;
    await until(w, (z) => z.document.querySelector('#atts .atile[data-key="f81"]') && openRequests(z) === 0, 3000, 'die Kacheln');
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {} });
    let watched = null, disconnected = 0;
    w.ResizeObserver = class { constructor(cb) { this.cb = cb; } observe(el) { watched = { el, cb: this.cb }; } disconnect() { disconnected++; } };
    w.document.querySelector('#atts .atile[data-key="f80"] .aface')?.click();
    const player = w.document.querySelector('.lightbox .lb-video');
    const stage = w.document.querySelector('.lightbox .lb-stage');
    const size = { w: 0, h: 0, sw: 412, sh: 703 };
    Object.defineProperty(player, 'videoWidth', { configurable: true, get: () => size.w });
    Object.defineProperty(player, 'videoHeight', { configurable: true, get: () => size.h });
    Object.defineProperty(stage, 'clientWidth', { configurable: true, get: () => size.sw });
    Object.defineProperty(stage, 'clientHeight', { configurable: true, get: () => size.sh });
    const box = () => `${player.style.width}×${player.style.height}`;
    Object.assign(size, { w: 3840, h: 2160 });
    player.dispatchEvent(new w.Event('loadedmetadata'));
    const wide = box();
    Object.assign(size, { w: 2160, h: 3840 });
    player.dispatchEvent(new w.Event('resize'));
    const tall = box();
    Object.assign(size, { w: 640, h: 360, sw: 1000, sh: 700 });
    watched?.cb();
    const small = box();
    check('Das Video bekommt Breite und Hoehe in Pixeln: so gross, wie die Buehne erlaubt, nie groesser als es selbst',
      wide === '412px×231px' && tall === '395px×703px' && small === '640px×360px' && watched?.el === stage, `${wide} ${tall} ${small}`);
    Object.assign(size, { w: 0, h: 0 });
    player.dispatchEvent(new w.Event('resize'));
    const cleared = box();
    let intoView = 0;
    w.Element.prototype.scrollIntoView = function () { intoView++; };
    const strip = w.document.querySelector('.lightbox .lb-strip');
    strip.getBoundingClientRect = () => ({ left: 0, width: 412 });
    [...strip.children].forEach((c, n) => { c.getBoundingClientRect = () => ({ left: 500 + 70 * n, width: 62 }); });
    strip.scrollLeft = 0;
    w.document.querySelector('.lightbox .lb-nav.next')?.click();
    const shownAt = [...strip.children].findIndex(c => c.classList.contains('on'));
    check('Beim Blaettern rollt nur der Streifen, bis das gezeigte Video in seiner Mitte steht; die Seite dahinter bleibt',
      shownAt > 0 && strip.scrollLeft === 325 + 70 * shownAt && intoView === 0, `${shownAt} ${strip.scrollLeft} ${intoView}`);
    w.document.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    check('Ohne Abmessungen gilt wieder das Stilblatt; Schliessen beendet die Beobachtung der Buehne',
      cleared === '×' && disconnected === 1, `${cleared} ${disconnected}`);
    w.close();
    const css = read('public/style.css');
    check('Die Knoepfe oben brechen um, zuerst weicht der Titel; die Leiste schrumpft nicht mehr auf null',
      /\.lb-tools \{ display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; \}/.test(css) &&
      /\.lb-title \{[^}]*flex: 1 1 0; min-width: 0; \}/.test(css), 'Regel fehlt');
    check('Der Kopf von „Dateien“ bricht um, und im Vollbild rollt auch das Wurzelelement nicht: die Seite bleibt so breit wie der Bildschirm',
      /\.block-head:has\(> \.ahead-acts\) \{ flex-wrap: wrap; \}/.test(css) &&
      /\.ahead-acts \{ display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; min-width: 0; \}/.test(css) &&
      /html:has\(> body\.lb-open\) \{ overflow: hidden; \}/.test(css), 'Regel fehlt');
  }

  const ownEntry = (id, title, tested, share) => ({ id, title, rejected: false, tested, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null, testCount: 0,
    updated_at: `2026-08-0${id} 10:00:00`, share });
  const listReady = (x) => !!x.document.getElementById('count') && openRequests(x) === 0;
  const detailReady = (x) => !!x.document.querySelector('#viewer img') && openRequests(x) === 0;

  group('Eigene Werte: eine Gruppe in der Statuszeile');
  {
    const items = [ownEntry(1, 'U-keine', false, { before: 'none', after: null }),
      ownEntry(2, 'U-teil', false, { before: 'partial', after: null }),
      ownEntry(3, 'G-keine', true, { before: 'full', after: 'none' }),
      ownEntry(4, 'G-teil', true, { before: 'none', after: 'partial' }),
      ownEntry(5, 'G-voll', true, { before: 'none', after: 'full' })];
    const m = buildDom(JSDOM, { overviewItems: items, settings: { filters: null, userCount: 1, partialShare: 75 } });
    const w = m.w;
    await until(w, listReady, 2000, 'die Uebersicht').catch(() => {});
    const own = () => w.document.getElementById('f-own');
    const pills = () => [...(own()?.querySelectorAll('.pill') || [])];
    const statusRow = () => w.document.getElementById('f-rejected')?.parentElement;
    const labels = [...(statusRow()?.querySelectorAll(':scope > .eyebrow') || [])].map(e => e.textContent);
    const counted = deText('list.ownValuesHint', { testedNo: 'Ungetestet', testedYes: 'Getestet', potential: 'Potenzial', ratingOne: 'Bewertung' });
    check('Die Zeile „Potenzial / Bewertung“ entfaellt; „◆ ★: Keine · Teilweise“ steht am Ende der Statuszeile, ohne „Alle“',
      !w.document.getElementById('f-shares') && !!own() && own().parentElement === statusRow() &&
      statusRow().lastElementChild === own() && equal(labels, ['Status', 'Ablehnung', '◆ ★']) &&
      equal(pills().map(b => b.textContent), ['Keine', 'Teilweise']), `${labels.join(' | ')} · ${pills().map(b => b.textContent).join(' ')}`);
    check('Der Titel der Knoepfe nennt, was zaehlt; bei „Teilweise“ zuerst die Schwelle',
      pills()[0]?.title === counted && pills()[1]?.title === `${deText('list.sharePartialHint', { share: 75 })}\n${counted}`,
      JSON.stringify(pills().map(b => b.title)));
    const shown = () => w.visibleItems().map(i => i.title).sort();
    const click = async (el) => { el?.click(); await until(w, listReady, 1000, 'das Filtern').catch(() => {}); };
    await click(pills()[0]);
    check('„Keine“: ungetestete ohne eigenes Potenzial, getestete ohne eigene Bewertung; ein Filter, gespeichert als `own`',
      equal(shown(), ['G-keine', 'U-keine']) && w.filterNumber() === 1 &&
      m.sent.some(x => x.method === 'PUT' && x.url === '/api/settings' && x.body?.filters?.own === 'none' &&
        !('potential' in x.body.filters) && !('rating' in x.body.filters)), shown().join(' '));
    await click(pills()[1]);
    check('„Teilweise“: jeder Eintrag zaehlt mit der Phase, in der er steht', equal(shown(), ['G-teil', 'U-teil']), shown().join(' '));
    await click(pills()[1]);
    check('Ein zweiter Klick schaltet aus', shown().length === 5 && w.filterNumber() === 0 &&
      !pills().some(b => b.classList.contains('on')), `${shown().length} ${w.filterNumber()}`);
    await click(statusRow()?.querySelector('.pills')?.children[1]);
    await click(pills()[0]);
    check('Mit dem Status „Getestet“ zaehlt nur die Bewertung', equal(shown(), ['G-keine']), shown().join(' '));
    w.close();
  }

  group('Eigene Werte: alte Filter, ohne Potenzialmodus, ohne Kriterien');
  {
    const items = [ownEntry(1, 'U', false, { after: null }), ownEntry(2, 'G-keine', true, { after: 'none' }),
      ownEntry(3, 'G-voll', true, { after: 'full' })];
    const m = buildDom(JSDOM, { overviewItems: items, settings: { filters: { potential: 'partial', rating: 'none' }, userCount: 1 } });
    const w = m.w;
    await until(w, listReady, 2000, 'die Uebersicht').catch(() => {});
    const f = w.eval('state.filters');
    const normal = w.filterNormal({ potential: 'none', rating: 'partial', own: 'partial' });
    check('Gespeicherte Werte von „Potenzial“ und „Bewertung“ entfallen beim Laden, auch in Ansichten',
      !('potential' in f) && !('rating' in f) && f.own === 'all' && w.filterNumber() === 0 && w.visibleItems().length === 3 &&
      !('potential' in normal) && !('rating' in normal) && normal.own === 'partial', `${JSON.stringify(f)} ${JSON.stringify(normal)}`);
    w.document.getElementById('f-own')?.querySelector('.pill')?.click();
    await until(w, listReady, 1000, 'das Filtern').catch(() => {});
    check('Ohne Potenzialmodus fallen ungetestete Eintraege bei „Keine“ heraus',
      equal(w.visibleItems().map(i => i.title), ['G-keine']), w.visibleItems().map(i => i.title).join(' '));
    w.close();
    const n = buildDom(JSDOM, { overviewItems: items.map(i => ({ ...i, share: {} })), settings: { filters: { own: 'none' }, userCount: 1 } });
    await until(n.w, listReady, 2000, 'die Uebersicht').catch(() => {});
    check('Ohne Kriterien fehlt die Gruppe, und ein gespeicherter Wert gilt als „Alle“',
      !n.w.document.getElementById('f-own') && n.w.visibleItems().length === 3 && n.w.filterNumber() === 0,
      `${n.w.visibleItems().length} ${n.w.filterNumber()}`);
    n.w.close();
  }

  group('Vollbild: Zurueck, Fokus und die Seite dahinter');
  {
    const d = buildDom(JSDOM, { hash: '#/item/1', settings: { filters: null, userCount: 1 } });
    const w = d.w, doc = w.document;
    await until(w, detailReady, 3000, 'die Detailansicht').catch(() => {});
    const lb = () => doc.querySelector('.lightbox');
    const opener = doc.querySelector('#viewer .vfocus');
    opener?.focus();
    const lengthBefore = w.history.length;
    doc.querySelector('#viewer img')?.click();
    const behind = [...doc.body.children].filter(el => el !== lb() && !el.classList.contains('toast'));
    check('Das Vollbild legt einen Eintrag im Verlauf an; ✕ hat den Fokus, die Seite dahinter ist inert',
      !!lb() && w.history.length === lengthBefore + 1 && typeof w.history.state?.lightbox === 'number' &&
      doc.activeElement === lb()?.querySelector('.close') && behind.length > 0 &&
      behind.every(el => el.hasAttribute('inert')) && !lb()?.hasAttribute('inert'),
      `${w.history.length - lengthBefore} ${doc.activeElement?.className} ${behind.map(el => `${el.id || el.className}:${el.hasAttribute('inert')}`).join(' ')}`);
    w.history.back();
    await until(w, () => !lb(), 1000, 'das Schliessen').catch(() => {});
    check('Zurueck schliesst das Vollbild; die Adresse bleibt, die Seite ist wieder frei, der Fokus kehrt zurueck',
      !lb() && w.location.hash === '#/item/1' && !doc.querySelector('[inert]') && !!opener && doc.activeElement === opener,
      `${!!lb()} ${w.location.hash} ${doc.activeElement?.className}`);
    doc.querySelector('#viewer img')?.click();
    const marked = w.history.state?.lightbox;
    lb()?.querySelector('.close')?.click();
    await until(w, () => w.history.state === null, 1000, 'der Schritt zurueck').catch(() => {});
    check('✕ nimmt den eigenen Eintrag im Verlauf zurueck', !lb() && typeof marked === 'number' &&
      w.history.state === null && w.location.hash === '#/item/1', `${marked} ${JSON.stringify(w.history.state)}`);
    doc.querySelector('#viewer img')?.click();
    lb()?.querySelector('.remove')?.click();
    await until(w, (x) => !!x.document.querySelector('.backdrop'), 1000, 'die Rueckfrage').catch(() => {});
    check('Ein Dialog ueber dem Vollbild ist nicht inert', !!doc.querySelector('.backdrop') &&
      !doc.querySelector('.backdrop').closest('[inert]'), doc.querySelector('.backdrop')?.outerHTML.slice(0, 80));
    doc.querySelector('.backdrop [data-no]')?.click();
    await until(w, (x) => !x.document.querySelector('.backdrop'), 1000, 'die geschlossene Rueckfrage').catch(() => {});
    w.location.hash = '#/';
    await until(w, (x) => !lb() && listReady(x), 2000, 'die Uebersicht').catch(() => {});
    await wait(50);
    check('Ein Wechsel der Ansicht schliesst das Vollbild, ohne im Verlauf zurueckzugehen',
      !lb() && w.location.hash === '#/' && !doc.querySelector('[inert]'), `${!!lb()} ${w.location.hash}`);
    w.close();
  }

  group('Vollbild: Wischen und Tipp neben das Bild');
  {
    const d = buildDom(JSDOM, { hash: '#/item/1', settings: { filters: null, userCount: 1 } });
    const w = d.w, doc = w.document;
    await until(w, detailReady, 3000, 'die Detailansicht').catch(() => {});
    doc.querySelector('#viewer img')?.click();
    const lb = () => doc.querySelector('.lightbox');
    const count = () => lb()?.querySelector('.lb-count')?.textContent;
    const stage = lb()?.querySelector('.lb-stage');
    const player = lb()?.querySelector('.lb-video');
    const touch = (target, type, points) => {
      const e = new w.Event(type, { bubbles: true });
      const list = points.map(([x, y]) => ({ clientX: x, clientY: y }));
      Object.defineProperty(e, 'touches', { value: type === 'touchend' ? [] : list });
      Object.defineProperty(e, 'changedTouches', { value: type === 'touchend' ? list : [list[list.length - 1]] });
      target?.dispatchEvent(e);
    };
    const swipe = (target) => { touch(target, 'touchstart', [[300, 200]]); touch(target, 'touchend', [[150, 205]]); };
    swipe(stage);
    const first = count();
    swipe(player);
    const onVideo = count();
    touch(stage, 'touchstart', [[300, 200]]);
    touch(stage, 'touchstart', [[300, 200], [340, 260]]);
    touch(stage, 'touchend', [[150, 205]]);
    const twoFingers = count();
    w.visualViewport = { scale: 2 };
    swipe(stage);
    const pinched = count();
    w.visualViewport = undefined;
    check('Wischen blaettert nur mit einem Finger, nicht auf dem Video und nicht bei gezoomter Seite',
      first === '2 / 2' && onVideo === '2 / 2' && twoFingers === '2 / 2' && pinched === '2 / 2', `${first} ${onVideo} ${twoFingers} ${pinched}`);
    swipe(stage);
    check('Daneben blaettert es weiter', count() === '1 / 2', count());
    const tap = (type) => {
      stage?.dispatchEvent(new w.PointerEvent('pointerdown', { pointerType: type, bubbles: true }));
      stage?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    };
    tap('touch');
    const afterTouch = !!lb();
    tap('mouse');
    check('Ein Tipp mit dem Finger neben das Bild schliesst nicht, ein Klick mit der Maus schon', afterTouch && !lb(),
      `${afterTouch} ${!!lb()}`);
    w.close();
  }

  group('Vollbild: Kopfzeile, quer und deckend');
  {
    const d = buildDom(JSDOM, { hash: '#/item/1', settings: { filters: null, userCount: 1 } });
    const w = d.w, doc = w.document;
    await until(w, detailReady, 3000, 'die Detailansicht').catch(() => {});
    doc.querySelector('#viewer img')?.click();
    const top = doc.querySelector('.lightbox .lb-top');
    const tools = top?.querySelector('.lb-tools');
    check('✕ steht ausserhalb der Knopfleiste am Ende der Kopfzeile; 🗑 ist der erste Knopf der Leiste',
      !!top?.lastElementChild?.classList.contains('close') && !tools?.querySelector('.close') &&
      !!tools?.firstElementChild?.classList.contains('remove'), tools?.innerHTML.slice(0, 120));
    w.close();
    const css = read('public/style.css');
    check('✕ bleibt oben rechts, auch wenn die Leiste umbricht',
      /\.lb-top > \.close \{ flex-shrink: 0; align-self: flex-start; \}/.test(css), 'Regel fehlt');
    const across = (css.match(/@media \(max-height: 500px\) and \(max-width: 960px\) \{[\s\S]*?\n\}/) || [''])[0];
    check('Am Telefon quer: kein Streifen, die Kopfzeile mit 6 px Abstand oben und unten',
      /\.lb-strip \{ display: none; \}/.test(across) &&
      /\.lb-top \{ padding-top: calc\(6px \+ env\(safe-area-inset-top\)\); padding-bottom: 6px; \}/.test(across),
      across.slice(0, 80) || 'Block fehlt');
    check('Das Vollbild ist im dunklen Schema deckend',
      /--lb-bg: rgb\(var\(--scrim-rgb\)\);/.test(css) && !/--lb-bg: rgba\(/.test(css), 'Regel fehlt');
  }

  group('Infos: ein Name fuer Bilder, Videos und Dokumente');
  {
    const [de, en, tr] = ['de', 'en', 'tr'].map(l => JSON.parse(read(`public/languages/${l}.json`)));
    check('Ein Schluessel: „Infos“, „Info“, „Bilgi“; den eigenen fuer Dokumente gibt es nicht mehr',
      de['entry.mediaInfo'] === 'Infos' && en['entry.mediaInfo'] === 'Info' && tr['entry.mediaInfo'] === 'Bilgi' &&
      ![de, en, tr].some(x => 'entry.docInfo' in x), `${de['entry.mediaInfo']} ${en['entry.mediaInfo']} ${tr['entry.mediaInfo']}`);
    const d = buildDom(JSDOM, { hash: '#/item/1', settings: { filters: null, userCount: 1 }, extraAttachments: [video(80, 'clip.mp4')] });
    const w = d.w, doc = w.document;
    await until(w, (x) => x.document.querySelector('#atts .atile[data-key="f80"]') && openRequests(x) === 0, 3000, 'die Kacheln').catch(() => {});
    const escape = () => doc.activeElement?.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    const menuOf = (key) => {
      doc.querySelector(`#atts .atile[data-key="${key}"] .amore`)?.click();
      const out = [...doc.querySelectorAll('.fmenu-list > *')].map(e => e.textContent);
      escape();
      return out;
    };
    const titleOf = async (key) => {
      doc.querySelector(`#atts .atile[data-key="${key}"] .amore`)?.click();
      [...doc.querySelectorAll('.fmenu-item')].find(e => e.textContent === 'Infos')?.click();
      await until(w, (x) => x.document.querySelector('.modal.minfo h2'), 1000, 'der Dialog').catch(() => {});
      const title = doc.querySelector('.modal.minfo h2')?.textContent;
      doc.querySelector('.modal.minfo [data-yes]')?.click();
      await until(w, (x) => !x.document.querySelector('.modal.minfo') && openRequests(x) === 0, 2000, 'das Schliessen').catch(() => {});
      return title;
    };
    const has = ['f42', 'f80', 'f43'].map(k => menuOf(k).includes('Infos'));
    const titles = [await titleOf('f42'), await titleOf('f43')];
    check('Bild, Video und PDF haben im Menue „Infos“; der Dialog heisst bei Bild und PDF „Infos“',
      equal(has, [true, true, true]) && equal(titles, ['Infos', 'Infos']), `${has.join(' ')} · ${titles.join(' ')}`);
    w.close();
  }

  /* ---- Fehler aus der Durchsicht: Oberflaeche ---- */
  const answerWith = (o, status = 200) => ({ ok: status < 400, status, json: async () => o });

  group('Uebersicht: ◆ ★ statt „Eigene Werte“, Weiter, Sortierung ohne Potenzialmodus');
  {
    const items = [ownEntry(1, 'U-keine', false, { before: 'none', after: null }),
      ownEntry(2, 'G-keine', true, { before: 'full', after: 'none' }),
      ownEntry(3, 'G-teil', true, { before: 'none', after: 'partial' })];
    const m = buildDom(JSDOM, { overviewItems: items, settings: { filters: null, userCount: 1, partialShare: 75 } });
    const w = m.w;
    await until(w, listReady, 2000, 'die Uebersicht').catch(() => {});
    const own = w.document.getElementById('f-own');
    const label = own?.previousElementSibling;
    const counted = deText('list.ownValuesHint', { testedNo: 'Ungetestet', testedYes: 'Getestet', potential: 'Potenzial', ratingOne: 'Bewertung' });
    check('Die Gruppe heisst „◆ ★“; ihr Titel nennt die Woerter aus dem Vokabular, „Eigene Werte“ steht nirgends',
      label?.textContent === '◆ ★' && label?.title === counted && !('list.ownValues' in DE) &&
      !w.document.getElementById('filters')?.textContent.includes('Eigene Werte') &&
      [...(own?.querySelectorAll('.pill') || [])][1]?.title === `${deText('list.sharePartialHint', { share: 75 })}\n${counted}` &&
      ['de', 'en', 'tr'].every(l => !/eigene Werte|own values|Kendi değerleriniz/i.test(
        JSON.parse(read(`public/languages/${l}.json`))['list.sharePartialHint'])), `${label?.textContent} · ${label?.title}`);
    w.eval("state.filters.sort = 'title_asc'");
    const nb = w.eval('entryNeighbours(3)');
    w.eval("state.filters.tested = 'tested'");
    const outside = w.eval('entryNeighbours(1)');
    const all = w.eval('state.items.map(i => i.id)'), at = all.indexOf(1);
    check('„‹“ und „›“ folgen Filter und Sortierung der Uebersicht; faellt der Eintrag heraus, gilt der ganze Bestand',
      nb.prev === 2 && nb.next === 1 && outside.prev === (all[at - 1] ?? null) && outside.next === (all[at + 1] ?? null),
      `${JSON.stringify(nb)} ${JSON.stringify(outside)} ${all}`);
    w.close();
    const p = buildDom(JSDOM, { overviewItems: items, settings: { filters: { sort: 'potential_desc' }, userCount: 1, potentialMode: false } });
    await until(p.w, listReady, 2000, 'die Uebersicht').catch(() => {});
    const quiet = p.w.document.getElementById('f-own')?.previousElementSibling;
    check('Ohne Potenzialmodus: „★“ mit eigenem Titel; eine Sortierung nach Potenzial gilt als „Geändert“',
      quiet?.textContent === '★' && quiet?.title === deText('list.ownRatingHint', { testedYes: 'Getestet', ratingOne: 'Bewertung' }) &&
      equal(p.w.visibleItems().map(i => i.id), [3, 2, 1]) && p.w.document.getElementById('f-sort')?.value === 'updated',
      `${quiet?.textContent} · ${p.w.visibleItems().map(i => i.id)} · ${p.w.document.getElementById('f-sort')?.value}`);
    p.w.close();
  }

  group('Einstellungen: Schwelle in beiden Karten, Standardanordnung');
  {
    const a = buildDom(JSDOM, { settings: { filters: null, userCount: 1, partialShare: 80 } });
    await until(a.w, listReady, 2000, 'die Uebersicht').catch(() => {});
    await D.sysSection(a.w, 'inventory');
    const doc = a.w.document;
    const after = doc.getElementById('partial-share'), before = doc.getElementById('partial-share-before');
    const cardOf = (el) => el?.closest('.sys-card')?.querySelector('h3')?.textContent;
    const hint = deText('card.partialShareHint', { potential: 'Potenzial', ratingOne: 'Bewertung' });
    check('Die Schwelle steht in „Bewertung: Kriterien“ und in „Potenzial: Kriterien“, mit einem Hinweis auf beide',
      after?.value === '80' && before?.value === '80' && cardOf(after) === 'Bewertung: Kriterien' &&
      cardOf(before) === 'Potenzial: Kriterien' &&
      [...doc.querySelectorAll('.sys-card p.desc')].filter(e => e.textContent === hint).length === 2,
      `${cardOf(after)} ${after?.value} · ${cardOf(before)} ${before?.value}`);
    const asked = [];
    const base = a.w.fetch;
    a.w.fetch = (url, opt) => {
      const body = opt?.body ? JSON.parse(opt.body) : {};
      if (url !== '/api/settings' || opt?.method !== 'PUT' || body.partialShare === undefined) return base(url, opt);
      asked.push(body.partialShare);
      return Promise.resolve(answerWith({ partialShare: body.partialShare }));
    };
    if (before) before.value = '60';
    before?.dispatchEvent(new a.w.Event('change'));
    await until(a.w, () => a.w.eval('PARTIAL_SHARE') === 60 && after?.value === '60', 1000, 'das Mitnehmen').catch(() => {});
    check('Eine Aenderung in einer Karte speichert den einen Wert und steht sofort auch in der anderen',
      equal(asked, [60]) && after?.value === '60' && before?.value === '60', `${asked} ${after?.value} ${before?.value}`);
    a.w.fetch = base;
    await D.sysSection(a.w, 'personal');
    doc.getElementById('breset')?.click();
    await until(a.w, (x) => x.document.querySelector('.backdrop [data-yes]'), 1000, 'die Rueckfrage').catch(() => {});
    doc.querySelector('.backdrop [data-yes]')?.click();
    await until(a.w, (x) => x.document.querySelector('.toast')?.textContent === DE['card.layoutRestored'] && openRequests(x) === 0,
      2000, 'das Speichern').catch(() => {});
    check('„Standardanordnung wiederherstellen“ setzt `closed`; danach laesst sich jeder Block wieder pruefen',
      a.w.eval('Array.isArray(BLOCKS.closed) && !("zu" in BLOCKS)'), a.w.eval('JSON.stringify(BLOCKS)'));
    a.w.close();
  }

  group('Detailansicht: spaete Antworten, Kommentar, Anlegen, Dialog');
  {
    const d = buildDom(JSDOM, { settings: { filters: null, userCount: 1 } });
    const w = d.w, doc = w.document;
    await until(w, listReady, 2000, 'die Uebersicht').catch(() => {});
    const base = w.fetch;
    w.fetch = (url, opt) => (url === '/api/items/1' ? wait(150).then(() => base(url, opt)) : base(url, opt));
    const late = w.renderDetail(1);
    w.history.replaceState(null, '', '#/');
    await w.renderList();
    await late;
    w.fetch = base;
    check('Eine spaete Antwort der Detailansicht zeichnet nicht ueber die neuere Uebersicht',
      !!doc.getElementById('body') && !doc.getElementById('viewer') && w.location.hash === '#/',
      `${!!doc.getElementById('body')} ${!!doc.getElementById('viewer')} ${w.location.hash}`);
    doc.getElementById('new')?.click();
    const nt = doc.getElementById('nt'), ns = doc.getElementById('ns'), bd = doc.querySelector('.backdrop');
    nt?.dispatchEvent(new w.Event('pointerdown', { bubbles: true }));
    bd?.click();
    const kept = !!bd?.isConnected;
    if (nt) nt.value = 'Doppelt';
    ns?.click();
    ns?.click();
    nt?.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await until(w, (x) => !x.document.querySelector('.backdrop') && openRequests(x) === 0, 2000, 'das Anlegen').catch(() => {});
    const created = d.sent.filter(x => x.method === 'POST' && x.url === '/api/items').length;
    check('Text markieren und neben dem Dialog loslassen schliesst ihn nicht; doppelt geklickt entsteht ein Eintrag',
      kept && created === 1, `${kept} ${created}`);
    w.location.hash = '#/item/1';
    await until(w, detailReady, 3000, 'die Detailansicht').catch(() => {});
    doc.querySelector('#cmts .cmt[data-comment="61"] .ed')?.click();
    const ta = doc.querySelector('#cmts .cmt[data-comment="61"] .cmt-edit textarea');
    if (ta) ta.value = 'Neuer Entwurf';
    const fresh = await (await base('/api/items/1', {})).json();
    fresh.comments = fresh.comments.map(c => (c.id === 61 ? { ...c, images: [{ id: 99, filename: 'neu.png', sort_order: 0 }] } : c));
    w.fetch = (url, opt) => (url === '/api/comments/61/images' ? Promise.resolve(answerWith(fresh)) : base(url, opt));
    const paste = new w.Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', { value: { files: [new w.File(['x'], 'neu.png', { type: 'image/png' })] } });
    ta?.dispatchEvent(paste);
    await until(w, (x) => x.document.querySelector('#cmts .cmt[data-comment="61"] .cmt-img') &&
      x.document.querySelector('#cmts .cmt[data-comment="61"] .cmt-edit textarea'), 2000, 'der Editor').catch(() => {});
    w.fetch = base;
    check('Ein Bild am offenen Editor: der Editor bleibt offen, der ungespeicherte Text bleibt stehen',
      doc.querySelector('#cmts .cmt[data-comment="61"] .cmt-edit textarea')?.value === 'Neuer Entwurf',
      String(doc.querySelector('#cmts .cmt[data-comment="61"] .cmt-edit textarea')?.value));
    const ctext = doc.getElementById('ctext');
    if (ctext) ctext.value = 'Einmal';
    let posted = 0;
    w.fetch = (url, opt) => {
      if (url !== '/api/items/1/comments' || opt?.method !== 'POST') return base(url, opt);
      posted++;
      return wait(50).then(() => answerWith(fresh));
    };
    doc.getElementById('cadd')?.click();
    doc.getElementById('cadd')?.click();
    await until(w, () => ctext?.value === '' && !doc.getElementById('cadd')?.disabled, 2000, 'der Kommentar').catch(() => {});
    w.fetch = base;
    check('„Kommentieren“ ist gesperrt, solange die Anfrage laeuft: ein Doppelklick schickt einen Kommentar',
      posted === 1 && ctext?.value === '', `${posted} ${JSON.stringify(ctext?.value)}`);
    check('Ein Ladefehler heisst nur bei 404 „unbekannt“; sonst steht der Grund da',
      w.eval("loadFailed({ status: 500, message: 'Netz weg' })") === 'Netz weg' &&
      w.eval("loadFailed({ status: 404, message: 'x' })") === deText('server.entryUnknown', { entryOne: 'Eintrag' }),
      `${w.eval("loadFailed({ status: 500, message: 'Netz weg' })")} · ${w.eval("loadFailed({ status: 404, message: 'x' })")}`);
    w.close();
  }

  group('Vollbild: Anmeldung, ein einzelnes Element; Infos aufklappbar');
  {
    const d = buildDom(JSDOM, { hash: '#/item/1', settings: { filters: null, userCount: 1 } });
    const w = d.w, doc = w.document;
    await until(w, detailReady, 3000, 'die Detailansicht').catch(() => {});
    doc.querySelector('#viewer img')?.click();
    const opened = !!doc.querySelector('.lightbox') && !!doc.querySelector('[inert]');
    w.showLogin();
    const key = new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    doc.body.dispatchEvent(key);
    check('Laeuft die Sitzung bei offenem Vollbild ab, ist die Anmeldung frei: kein inert, keine verschluckten Tasten',
      opened && !doc.querySelector('[inert]') && !doc.querySelector('.lightbox') && !key.defaultPrevented &&
      w.eval('LIGHTBOX_CLOSE') === null, `${opened} ${doc.querySelectorAll('[inert]').length} ${key.defaultPrevented}`);
    w.close();
    const e = buildDom(JSDOM, { hash: '#/item/1', settings: { filters: null, userCount: 1 } });
    await until(e.w, detailReady, 3000, 'die Detailansicht').catch(() => {});
    e.w.openLightbox([{ id: 6, mime_type: 'video/mp4', kind: 'video', duration: 42 }], 0, 'Eins');
    const player = e.w.document.querySelector('.lightbox .lb-video');
    let paused = 0;
    if (player) player.pause = () => { paused++; };
    e.w.document.body.dispatchEvent(new e.w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    check('Bei einem einzigen Element tut die Pfeiltaste nichts: das Video laeuft weiter',
      !!player && paused === 0, `${!!player} ${paused}`);
    e.w.document.body.dispatchEvent(new e.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    const box = e.w.document.createElement('div');
    box.innerHTML = e.w.mediaInfoHtml({ general: { format: 'MPEG-4', size: 1000 }, video: [{ format: 'AVC', width: 1920, height: 1080, chroma: '4:2:0' }],
      audio: [{ format: 'AAC', channels: 2 }], proxy: { state: 'ready', width: 1920, height: 1080 } });
    const folds = [...box.querySelectorAll('details.minfo-group')];
    check('Infos: „Allgemein“ steht offen; Video, Audio und Proxy sind beim Oeffnen zugeklappt',
      equal([...box.querySelectorAll('h3.minfo-head')].map(h => h.textContent), [DE['entry.mediaGeneral']]) &&
      equal(folds.map(f => f.querySelector('summary.minfo-head')?.textContent), [DE['entry.kindVideo'], DE['entry.mediaAudio'], DE['entry.mediaProxy']]) &&
      folds.every(f => !f.open) && DE['entry.mediaChroma'] === 'Chroma Subsampling',
      `${[...box.querySelectorAll('.minfo-head')].map(h => `${h.tagName}:${h.textContent}`).join(' ')}`);
    e.w.close();
  }

  group('Quelltext: kleine Fehler aus der Durchsicht');
  {
    const app = read('public/app.js'), srv = read('server.js'), css = read('public/style.css');
    const x = buildDom(JSDOM, { settings: { filters: null, userCount: 1 } });
    await until(x.w, listReady, 2000, 'die Uebersicht').catch(() => {});
    check('Die Groesse des Exports mit Dateien zaehlt Kommentarvideos mit',
      x.w.exportSum({ envelope: 1, attachments: 2, commentImages: 3, commentVideos: 4 }, { withFiles: true }) === 10,
      String(x.w.exportSum({ envelope: 1, attachments: 2, commentImages: 3, commentVideos: 4 }, { withFiles: true })));
    x.w.eval('state.compare.add(1); state.compare.add(2); drawCompareBar();');
    const shown = !!x.w.document.querySelector('.cmp-bar');
    x.w.document.querySelector('.cmp-bar .btn-x')?.click();
    const cleared = !x.w.document.querySelector('.cmp-bar');
    x.w.eval('state.compare.add(1); drawCompareBar();');
    x.w.location.hash = '#/open';
    await until(x.w, (z) => openRequests(z) === 0 && !z.document.getElementById('count'), 2000, 'die offenen Aufgaben').catch(() => {});
    check('Die Vergleichsleiste: ✕ wirkt, und ausserhalb der Uebersicht steht sie nicht',
      shown && cleared && !x.w.document.querySelector('.cmp-bar'), `${shown} ${cleared} ${!!x.w.document.querySelector('.cmp-bar')}`);
    x.w.close();
    check('Upload, Loeschen und Kommentar nach einem await zeichnen nur in der Ansicht, die noch steht',
      /if \(!v \|\| !here\(\)\) return;/.test(app) && /if \(!box \|\| !here\(\)\) return;/.test(app) &&
      /function drawComments\(\) \{\n    if \(!here\(\)\) return;/.test(app) &&
      (app.match(/const run = \+\+VIEW_RUN;/g) || []).length === 6, 'Pruefung fehlt');
    check('Offene Aufgaben zaehlen nur offene; „Links“ misst beim Aufklappen neu; der Ordnerwechsel laedt die Einstellungen neu',
      /const stillOpen = visible\.filter\(z => !z\.done\)\.length;/.test(app) &&
      /\$\{inside\.filter\(z => !z\.done\)\.length\}/.test(app) &&
      /if \(name === 'links' && closed && redrawLinks\) redrawLinks\(\);/.test(app) && /redrawLinks = limitLinks;/.test(app) &&
      /await api\('PUT', '\/api\/backup\/dir', \{ place: value \}\);\n        saved\(\);\n[^\n]*\n        renderSystem\(\{ keepScroll: true \}\);/.test(app),
      'Stelle fehlt');
    check('Pfeiltaste und Wischen bei einem Element, das Ende der Konvertierung vor der ersten Abfrage, das Zitiermenue unter der Kopfzeile',
      /const step = \(d\) => \{ if \(photos\.length < 2\) return; i \+= d; show\(\); \};/.test(app) &&
      /const inFlight = new Set\(BATCH_RUNS\.filter\(l => stats\?\.\[l\.field\]\?\.running\)\.map\(l => l\.field\)\);/.test(app) &&
      /followBatchRun\(fetched\.stats\);/.test(app) && /above < mastheadHeight\(\) \+ 4/.test(app), 'Stelle fehlt');
    check('Server: ein geschlossener Browser beendet das Warten auf drain; die Kopie bleibt, wenn das Umbenennen scheitert',
      /function untilDrained\(res\) \{\n  if \(res\.destroyed\) return Promise\.reject/.test(srv) &&
      !/res\.once\('drain', r\)/.test(srv) &&
      /if \(fs\.existsSync\(diskPath\(f\.name\)\)\) fs\.rmSync\(diskPath\(f\.name, true\), \{ force: true \}\);/.test(srv) &&
      /if \(HELD_LOCK\) backup\.dropLock\(HELD_LOCK\);/.test(srv),
      'Stelle fehlt');
    const phone = css.slice(css.indexOf('/* ---- Telefon ---- */'));
    const folded = css.slice(css.indexOf('/* ---- Eingeklappte Kopfzeile ---- */'), css.indexOf('/* ---- Telefon ---- */'));
    const narrowCard = css.slice(css.indexOf('@container (max-width: 560px) {'));
    check('Stilblatt: Benutzerzeile bricht in schmalen Karten um; „Von vorn“ und die Upload-Anzeige am Telefon frei; Reiter nach dem Drehen',
      /\.mrow\.user \{ flex-wrap: wrap; row-gap: 4px; \}/.test(narrowCard.slice(0, narrowCard.indexOf('\n}'))) &&
      /\.vspot \{ top: 62px; \}/.test(phone) && /\.upload-bar \{ top: auto; bottom: calc\(16px \+ env\(safe-area-inset-bottom\)\); \}/.test(phone) &&
      /\.filters\.closed, \.sys-tabs\.closed \{ display: none; \}/.test(folded) && (css.match(/\.sys-tabs\.closed/g) || []).length === 1,
      'Regel fehlt');
  }

  group('Werkzeuge, Image und Texte aus der Durchsicht');
  {
    const ks = read('keytool.sh'), bt = read('backuptool.js');
    check('keytool.sh: ein gescheitertes cp bricht ab, der neue Schluessel steht nicht in den Argumenten',
      /-exec sh -c 'cp -a "\$@" "\$0"\/' "\$ZIEL" \{\} \+; then/.test(ks) && !/-exec cp [^\n]*\;/.test(ks) &&
      /\$\{NEW_KEY:\+-e NEW_KEY\}/.test(ks) && !/NEW_KEY=\$NEW_KEY/.test(ks) &&
      /\[ -e data\/encryption\.key \] && \[ ! -r data\/encryption\.key \]/.test(ks), 'Stelle fehlt');
    check('keytool.sh und .env.example nennen die echte Logzeile und die richtige Karte',
      ks.includes('„Key loaded from ENCRYPTION_KEY.“') && read('keys.js').includes("logLine('Key loaded from ENCRYPTION_KEY.')") &&
      read('.env.example').includes(`Karte "${DE['card.versionTitle'].replace('ü', 'ue')}"`), 'Text');
    check('backuptool nennt nach einem Abbruch das Backup mit der Zeit aus dem Namen, nicht die Nr.',
      /const again = `Zu Ende führen: \.\/backuptool\.sh restore \$\{nameTime\(chosen\.d\.name\)\}`;/.test(bt) &&
      !bt.includes('derselben Auswahl'), 'Stelle fehlt');
    check('Das Backup der .env vom Schluesselwechsel kommt weder ins Image noch ins Repository',
      read('.dockerignore').split('\n').includes('.env.before-key-change-*') &&
      read('.gitignore').split('\n').includes('.env.before-key-change-*'), 'Zeile fehlt');
    const [de, en, tr] = ['de', 'en', 'tr'].map(l => JSON.parse(read(`public/languages/${l}.json`)));
    const app = read('public/app.js');
    check('Texte: Suchmaschinen unter „Installation“, „(du)“ und „… eingetragen“ als Schluessel, example.com statt beispiel.de',
      de['entry.noSearchEngineHint'].includes(de['card.installation']) && en['entry.noSearchEngineHint'].includes(en['card.installation']) &&
      tr['entry.noSearchEngineHint'].includes(tr['card.installation']) &&
      [de, en, tr].every(x => x['card.youMarker'] && x['entry.dayAdded']?.includes('{dayOne}') && x['entry.quoted']?.includes('{text}')) &&
      !/\(du\)|eingetragen`|forum\.beispiel|„\$\{l\.url\}"/.test(app), 'Text');
    check('Die Meldung zur Aufraeumregel nennt das Feld mit seinem Namen',
      de['server.ruleDays'].startsWith(`„${de['card.deleteFromAge'].replace(/ \(Tage\)$/, '')}“`) &&
      tr['server.ruleDays'].startsWith(`“${tr['card.deleteFromAge'].replace(/ \(gün\)$/, '')}”`), `${de['server.ruleDays']} · ${tr['server.ruleDays']}`);
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
