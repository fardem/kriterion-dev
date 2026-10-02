/* Kriterion — Pruefstand: einstellbare Bitrate der Proxys, Ersatz veralteter Proxys im Hintergrund,
   „Proxy“ in der Liste, Groesse des Videos und Knopfleiste im Vollbild. */
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
  const swapped = await until2(() => proxyRow(clipId)?.name !== first.name, 10000);
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
  const allNew = await until2(() => [clipId, xId, yId, zId].every(id => proxyRow(id)?.video_bps === rateOf(2e6)), 30000);
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
  const renewed = await until2(() => [clipId, xId, yId, zId].every(id => proxyRow(id)?.video_bps === rateOf(3.5e6)), 20000);
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
      /\.lb-title \{[^}]*flex-shrink: 100; \}/.test(css), 'Regel fehlt');
    check('Der Kopf von „Dateien“ bricht um, und im Vollbild rollt auch das Wurzelelement nicht: die Seite bleibt so breit wie der Bildschirm',
      /\.block-head:has\(> \.ahead-acts\) \{ flex-wrap: wrap; \}/.test(css) &&
      /\.ahead-acts \{ display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; min-width: 0; \}/.test(css) &&
      /html:has\(> body\.lb-open\) \{ overflow: hidden; \}/.test(css), 'Regel fehlt');
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
