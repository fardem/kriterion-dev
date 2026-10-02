/* Kriterion — Pruefstand: Wartung mit Abgleich, Loeschen nach Namen, fehlende Dateien, Pruefung der
   Datenbank und die Karte „Speicher und Wartung“. */
const H = require('./frame.js');
const D = require('./dom.js');
const { buildDom, until, openRequests, placeConfirm } = D;

async function run() {
  const { fs, os, path, crypto, __dirname, group, check, equal, open, withCsrf, jar } = H;
  await H.mainServerReady();
  let JSDOM = null;
  try { ({ JSDOM } = require('jsdom')); } catch { JSDOM = null; }
  const read = (name) => fs.readFileSync(path.join(__dirname, ...name.split('/')), 'utf8');
  const DE = JSON.parse(read('public/languages/de.json'));
  const deText = (key, values = {}) => {
    const form = typeof DE[key] === 'object' ? DE[key][values.n === 1 ? 'one' : 'other'] : DE[key];
    return String(form).replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
  };
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const until2 = async (test, ms = 8000) => {
    for (const t0 = Date.now(); Date.now() - t0 < ms; await wait(100)) if (await test()) return true;
    return false;
  };
  const hex = () => crypto.randomBytes(16).toString('hex');

  /* ---- Server und Accounts ---- */
  // Die Basis teilt sich das Modul mit release_041 bis release_054; die Module laufen nacheinander.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-055-'));
  const dir = path.join(root, 'data');
  const backupRoot = path.join(root, 'backup');
  fs.mkdirSync(dir);
  fs.mkdirSync(backupRoot);
  const filesDir = path.join(dir, 'files');
  const uploadDir = path.join(filesDir, 'upload');
  const copyDir = path.join(backupRoot, 'kriterion-files');
  const pw = (user) => user + '-langes-wort-55';
  const cookies = {};
  let B = H.startFurtherServer(dir, { BACKUP_DIR: backupRoot }, 7340);
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
      headers: withCsrf(cookies[who], body ? { 'content-type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined });
    return { status: a.status, content: await a.json().catch(() => null) };
  };
  const raw = async (who, id) => {
    const a = await fetch(`${B.base}/api/attachments/${id}/raw`, { headers: withCsrf(cookies[who], {}) });
    return a.status === 200 ? Buffer.from(await a.arrayBuffer()) : Buffer.alloc(0);
  };
  const inDb = (fn) => {
    const d = open(path.join(dir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    try { return fn(d); } finally { d.close(); }
  };
  const upload = (who, itemId, files, folderId = null) => H.sendFiles(B.base, cookies[who], itemId, files, folderId);
  const filesOf = async (itemId) => (await as('owner', 'GET', `/api/items/${itemId}`)).content?.attachments || [];
  const fileNamed = async (itemId, name) => (await filesOf(itemId)).find(a => a.filename === name);
  const diskName = (id) => (id == null ? null
    : inDb(d => d.prepare('SELECT name FROM disk_files WHERE attachment_id = ?').get(id)?.name));
  const onDisk = (name) => fs.existsSync(path.join(filesDir, name));
  const there = (name) => { try { fs.lstatSync(path.join(filesDir, name)); return true; } catch { return false; } };
  const plant = (name, bytes) => { fs.writeFileSync(path.join(filesDir, name), bytes); return name; };
  const content = {};
  for (const n of ['A', 'B', 'C', 'D', 'E']) content[n] = Buffer.concat([Buffer.from(`Datei ${n}\n`), crypto.randomBytes(3000)]);
  async function backupNow() {
    await H.nextSecond();
    const r = await as('owner', 'POST', '/api/backup');
    if (r.status === 202)
      await until2(async () => (await as('owner', 'GET', '/api/backup')).content?.copy?.running === false, 20000);
    return (await as('owner', 'GET', '/api/backup')).content?.copy?.file || r.content?.file || '';
  }
  const newItem = async (title) => (await as('owner', 'POST', '/api/items', { title })).content.id;
  const scan = async () => (await as('owner', 'GET', '/api/maintenance')).content || {};
  const byName = (rows) => Object.fromEntries((rows || []).map(f => [f.name, f]));

  const x = await newItem('Eintrag W');
  const folderMade = await as('zweit', 'POST', `/api/items/${x}/folders`, { name: 'Ordner W' });
  const folderW = (folderMade.content?.folders || []).find(f => f.name === 'Ordner W')?.id;
  await upload('zweit', x, [{ name: 'A.txt', content: content.A }, { name: 'B.txt', content: content.B }], folderW);
  await upload('zweit', x, [{ name: 'C.txt', content: content.C }]);
  const firstBackup = await backupNow();
  const listFile = path.join(backupRoot, firstBackup.replace(/\.sqlite$/, '.files'));

  group('Wartung: der Abgleich nennt jeden Eintrag ohne Verweis');
  const foreignFile = plant('notiz.txt', Buffer.from('fremd'));
  const oldDir = 'alt', linkName = 'verweis';
  fs.mkdirSync(path.join(filesDir, oldDir, 'tief'), { recursive: true });
  fs.writeFileSync(path.join(filesDir, oldDir, 'eins'), Buffer.alloc(100));
  fs.writeFileSync(path.join(filesDir, oldDir, 'tief', 'zwei'), Buffer.alloc(300));
  const target = path.join(root, 'ziel.txt');
  fs.writeFileSync(target, 'ziel');
  fs.symlinkSync(target, path.join(filesDir, linkName));
  const linkSize = fs.lstatSync(path.join(filesDir, linkName)).size;
  const same = crypto.randomBytes(2000);
  const hexCopied = plant(hex(), same);
  fs.writeFileSync(path.join(copyDir, hexCopied), same);
  const hexUnnamed = plant(hex(), crypto.randomBytes(2000));
  const hexNamed = plant(hex(), crypto.randomBytes(2000));
  fs.appendFileSync(listFile, `${hexNamed} 2000\n`);
  const known = diskName((await fileNamed(x, 'C.txt'))?.id);
  const byUser = await as('zweit', 'GET', '/api/maintenance');
  const byAdmin = await as('dritt', 'GET', '/api/maintenance');
  const first = await as('owner', 'GET', '/api/maintenance');
  check('Den Abgleich ruft nur der Eigentuemer-Admin; Benutzer und Admin bekommen 403',
    byUser.status === 403 && byAdmin.status === 403 && first.status === 200,
    `${byUser.status} ${byAdmin.status} ${first.status}`);
  const names = (first.content?.unknown || []).map(f => f.name);
  const planted = [foreignFile, oldDir, linkName, hexCopied, hexUnnamed, hexNamed].sort((a, b) => a.localeCompare(b));
  check('Er nennt jeden Eintrag ohne Verweis mit jedem Namen, nach Namen sortiert; upload/ und bekannte Dateien nicht',
    equal(names, planted) && !!known, names.join(' '));
  const u = byName(first.content?.unknown);
  check('Ein Verzeichnis traegt Zahl und Groesse seiner Dateien, ein symbolischer Link seine eigene Groesse',
    u[oldDir]?.kind === 'dir' && u[oldDir]?.files === 2 && u[oldDir]?.size === 400 && u[linkName]?.kind === 'link' &&
    u[linkName]?.size === linkSize && u[foreignFile]?.kind === 'file' && u[foreignFile]?.size === 5,
    JSON.stringify([u[oldDir], u[linkName], u[foreignFile]]));
  check('Je Eintrag das Datum der Aenderung in der Form des Servers',
    (first.content?.unknown || []).every(f => /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(f.at)),
    (first.content?.unknown || []).map(f => f.at).join(' '));
  check('Die Gruende: fremder Name (c), Kopie gleicher Laenge (a), von keinem Backup genannt (b), von einem genannt',
    u[foreignFile]?.why === 'foreign' && u[oldDir]?.why === 'foreign' && u[linkName]?.why === 'foreign' &&
    u[hexCopied]?.why === 'copied' && u[hexUnnamed]?.why === 'unnamed' && u[hexNamed]?.why === 'named',
    names.map(n => `${n.slice(0, 6)}=${u[n]?.why}`).join(' '));
  check('Frei sind die Faelle (a) bis (c); die genannte Datei bleibt',
    [foreignFile, oldDir, linkName, hexCopied, hexUnnamed].every(n => u[n]?.free === true) && u[hexNamed]?.free === false,
    names.map(n => `${n.slice(0, 6)}=${u[n]?.free}`).join(' '));
  const stats = (await as('owner', 'GET', '/api/stats')).content || {};
  check('„Speicher und Wartung“ zaehlt dieselben Eintraege und Bytes',
    stats.disk?.unknownCount === 6 && stats.disk?.unknownBytes === 5 + 400 + linkSize + 6000 &&
    stats.disk?.copiedCount === undefined, JSON.stringify(stats.disk));

  group('Wartung: Loeschen nach Namen');
  const notPicked = plant('bleibt.txt', Buffer.from('bleibt'));
  const logBefore = B.log().length;
  const delAdmin = await as('dritt', 'DELETE', '/api/files/unknown', { names: [hexUnnamed] });
  const del = await as('owner', 'DELETE', '/api/files/unknown',
    { names: [...planted, known, 'upload', '../ziel.txt', `${oldDir}/eins`] });
  check('Der Admin bekommt 403; der Eigentuemer loescht genau die fuenf freien Eintraege',
    delAdmin.status === 403 && del.status === 200 && del.content?.removed === 5 &&
    del.content?.bytes === 5 + 400 + linkSize + 4000,
    `${delAdmin.status} ${del.status} ${del.content?.removed} ${del.content?.bytes}`);
  check('Das Verzeichnis ist samt Inhalt weg; der symbolische Link ist weg, sein Ziel bleibt',
    !there(oldDir) && !there(linkName) && fs.existsSync(target) && !there(foreignFile) &&
    !there(hexCopied) && !there(hexUnnamed), `${there(oldDir)} ${there(linkName)} ${fs.existsSync(target)}`);
  check('Die genannte Datei, die bekannte Datei und upload/ bleiben; ein Name mit Pfad wirkt nicht',
    onDisk(hexNamed) && onDisk(known) && fs.existsSync(uploadDir) && fs.existsSync(target),
    `${onDisk(hexNamed)} ${onDisk(known)} ${fs.existsSync(uploadDir)}`);
  check('Ein freier Eintrag, den niemand gewaehlt hat, bleibt', there(notPicked), 'geloescht');
  check('Die Antwort traegt die neue Liste und die neuen Zahlen',
    equal((del.content?.unknown || []).map(f => f.name).sort(), [notPicked, hexNamed].sort()) &&
    del.content?.disk?.unknownCount === 2, JSON.stringify((del.content?.unknown || []).map(f => f.name)));
  const delLog = B.log().slice(logBefore).split('\n').filter(z => z.includes('without a reference removed'));
  check('Das Server-Log nennt das Loeschen in einer Zeile, mit Zahl, Bytes und Namen',
    delLog.length === 1 && delLog[0].includes(`removed: 5 (${5 + 400 + linkSize + 4000} bytes)`) &&
    delLog[0].includes(foreignFile) && delLog[0].includes(hexUnnamed), delLog.join(' | ') || '(keine Zeile)');

  group('Wartung: ohne Backup-Ordner und mit einem Backup ohne Liste');
  const listText = fs.readFileSync(listFile, 'utf8');
  fs.unlinkSync(listFile);
  const hexLone = plant(hex(), crypto.randomBytes(1000));
  const noList = byName((await scan()).unknown);
  const noListDel = await as('owner', 'DELETE', '/api/files/unknown', { names: [hexLone] });
  check('Hat ein Backup keine Dateiliste, bleibt eine Datei, die kein Backup nennt',
    noList[hexLone]?.why === 'unlisted' && noList[hexLone]?.free === false && noListDel.content?.removed === 0 &&
    onDisk(hexLone), `${noList[hexLone]?.why} ${noListDel.content?.removed}`);
  fs.writeFileSync(listFile, listText);
  await restart({ BACKUP_DIR: '' });
  plant('rest.log', Buffer.from('x'));
  const lone = await scan();
  const nf = byName(lone.unknown);
  check('Ohne Backup-Ordner bleibt jede Datei mit einem Namen von Kriterion; ein fremder Name ist frei',
    nf[hexLone]?.why === 'noFolder' && nf[hexLone]?.free === false && nf[hexNamed]?.why === 'noFolder' &&
    nf['rest.log']?.why === 'foreign' && nf['rest.log']?.free === true && lone.folder === false,
    JSON.stringify([nf[hexLone], nf['rest.log']]));
  const nfDel = await as('owner', 'DELETE', '/api/files/unknown', { names: [hexLone, 'rest.log'] });
  check('Und Loeschen nimmt nur den fremden Namen',
    nfDel.status === 200 && nfDel.content?.removed === 1 && onDisk(hexLone) && !there('rest.log'),
    `${nfDel.status} ${nfDel.content?.removed}`);
  const nfBack = await as('owner', 'POST', '/api/files/missing', { names: [hexLone] });
  check('Zurueckholen ohne Backup-Ordner: 409 mit Grund',
    nfBack.status === 409 && nfBack.content?.error === DE['server.backupDirUnreachable'], `${nfBack.status}`);
  await restart({ BACKUP_DIR: backupRoot });

  group('Wartung: fehlende Dateien');
  const aFile = await fileNamed(x, 'A.txt'), bFile = await fileNamed(x, 'B.txt');
  const aDisk = diskName(aFile?.id), bDisk = diskName(bFile?.id);
  await upload('zweit', x, [{ name: 'D.txt', content: content.D }, { name: 'E.txt', content: content.E },
    { name: 'G.txt', content: crypto.randomBytes(1500) }]);
  const dFile = await fileNamed(x, 'D.txt'), eFile = await fileNamed(x, 'E.txt'), gFile = await fileNamed(x, 'G.txt');
  const dDisk = diskName(dFile?.id), eDisk = diskName(eFile?.id), gDisk = diskName(gFile?.id);
  await backupNow();
  fs.truncateSync(path.join(copyDir, gDisk), 7);
  fs.unlinkSync(path.join(filesDir, gDisk));
  const eGone = await as('zweit', 'DELETE', `/api/attachments/${eFile?.id}`);
  fs.rmSync(path.join(copyDir, dDisk), { force: true });
  fs.unlinkSync(path.join(filesDir, aDisk));
  fs.truncateSync(path.join(filesDir, bDisk), 10);
  fs.unlinkSync(path.join(filesDir, dDisk));
  fs.unlinkSync(path.join(filesDir, eDisk));
  const before = await fileNamed(x, 'A.txt');
  const m = await scan();
  const ms = byName(m.missing);
  check('Der Abgleich prueft die Dateien neu; vorher zeigt der Eintrag nichts',
    eGone.status === 200 && before?.missing === false &&
    equal(Object.keys(ms).sort(), [aDisk, bDisk, dDisk, eDisk, gDisk].sort()),
    `${eGone.status} ${before?.missing} ${Object.keys(ms).length}`);
  check('Fehlende und verkuerzte Dateien stehen mit Eintrag, Ordner und Dateiname da',
    ms[aDisk]?.place === 'entry' && ms[aDisk]?.item?.id === x && ms[aDisk]?.item?.title === 'Eintrag W' &&
    ms[aDisk]?.folder === 'Ordner W' && ms[aDisk]?.filename === 'A.txt' && ms[bDisk]?.filename === 'B.txt' &&
    ms[dDisk]?.folder === null, JSON.stringify(ms[aDisk]));
  check('Eine Datei im Papierkorb steht mit dem Titel aus dem Papierkorb da',
    ms[eDisk]?.place === 'trash' && ms[eDisk]?.trash === 'E.txt' && ms[eDisk]?.item === null, JSON.stringify(ms[eDisk]));
  check('Mit Kopie gleicher Laenge laesst sie sich zurueckholen; sonst nennt die Liste den Grund',
    ms[aDisk]?.copy === true && ms[bDisk]?.copy === true && ms[eDisk]?.copy === true &&
    ms[dDisk]?.copy === false && ms[dDisk]?.why === 'noCopy' && ms[gDisk]?.copy === false && ms[gDisk]?.why === 'noCopy',
    JSON.stringify([ms[dDisk], ms[gDisk]]));
  const after = await fileNamed(x, 'A.txt');
  check('Danach zeigt der Eintrag die Datei als fehlend', after?.missing === true, JSON.stringify(after));
  const backAdmin = await as('dritt', 'POST', '/api/files/missing', { names: [aDisk] });
  const backLog = B.log().length;
  const back = await as('owner', 'POST', '/api/files/missing',
    { names: [aDisk, bDisk, dDisk, eDisk, gDisk, hex(), 'notiz.txt'] });
  check('Der Admin bekommt 403; der Eigentuemer holt die drei Dateien mit Kopie zurueck',
    backAdmin.status === 403 && back.status === 200 && back.content?.restored === 3,
    `${backAdmin.status} ${back.status} ${back.content?.restored}`);
  check('Danach liefern sie wieder ihren Inhalt, und der Eintrag zeigt nichts mehr',
    (await raw('zweit', aFile?.id)).equals(content.A) && (await raw('zweit', bFile?.id)).equals(content.B) &&
    (await fileNamed(x, 'A.txt'))?.missing === false && onDisk(eDisk), `${onDisk(aDisk)} ${onDisk(eDisk)}`);
  check('Ohne Kopie gleicher Laenge bleibt die Datei in der Liste; unter upload/ bleibt nichts liegen',
    equal((back.content?.missing || []).map(f => f.name).sort(), [dDisk, gDisk].sort()) && !onDisk(gDisk) &&
    fs.readdirSync(uploadDir).length === 0,
    `${JSON.stringify((back.content?.missing || []).map(f => f.name))} ${fs.readdirSync(uploadDir).join(' ')}`);
  const backRows = B.log().slice(backLog).split('\n').filter(z => z.includes('restored from the backup folder'));
  check('Das Server-Log nennt das Zurueckholen in einer Zeile mit den Namen',
    backRows.length === 1 && backRows[0].includes(': 3: ') && backRows[0].includes(aDisk), backRows.join(' | ') || '(keine)');

  group('Wartung: waehrend eines Backups');
  await restart({ BACKUP_DIR: backupRoot, KRITERION_TESTBENCH: 'pruefstand:scrypt=1024:mail=40:brake=10:hold=1500' });
  await upload('zweit', x, [{ name: 'F.txt', content: crypto.randomBytes(2000) }]);
  await H.nextSecond();
  const busy = await as('owner', 'POST', '/api/backup');
  const busyDel = await as('owner', 'DELETE', '/api/files/unknown', { names: [hexNamed] });
  const busyBack = await as('owner', 'POST', '/api/files/missing', { names: [dDisk] });
  await until2(async () => (await as('owner', 'GET', '/api/backup')).content?.copy?.running === false, 20000);
  check('Waehrend die Kopie eines Backups laeuft, wird nichts geloescht und nichts zurueckgeholt: 409',
    busy.status === 202 && busyDel.status === 409 && busyBack.status === 409 &&
    busyDel.content?.error === DE['server.backupRunning'] && onDisk(hexNamed),
    `${busy.status} ${busyDel.status} ${busyBack.status}`);
  await restart({ BACKUP_DIR: backupRoot });

  group('Wartung: Pruefung der Datenbank');
  const healthy = (await scan()).check || {};
  check('Eine gesunde Datenbank: in Ordnung, mit Dauer',
    healthy.ok === true && equal(healthy.quick, ['ok']) && equal(healthy.keys, []) && Number.isFinite(healthy.ms),
    JSON.stringify(healthy));
  inDb(d => {
    d.pragma('foreign_keys = OFF');
    d.prepare("INSERT INTO folders (item_id, name) VALUES (987654, 'verwaist')").run();
  });
  const broken = (await scan()).check || {};
  check('Ein verletzter Fremdschluessel wird mit Tabelle, Ziel und Zahl gemeldet',
    broken.ok === false && (broken.keys || []).some(k => k.table === 'folders' && k.parent === 'items' && k.count === 1),
    JSON.stringify(broken));
  check('Repariert wird nichts: die Zeile steht danach noch',
    inDb(d => d.prepare('SELECT COUNT(*) AS n FROM folders WHERE item_id = 987654').get().n) === 1, 'Zeile fehlt');
  inDb(d => d.prepare('DELETE FROM folders WHERE item_id = 987654').run());
  check('Die Pruefung laeuft in batchrun.js mit eigener Verbindung',
    /new Worker\(BATCHRUN, \{ workerData: \{ task: 'check' \} \}\)/.test(read('server.js')) &&
    /workerData\.task === 'check'\) checkDatabase\(\)/.test(read('batchrun.js')) &&
    /quick_check\(20\)/.test(read('batchrun.js')) && /foreign_key_check/.test(read('batchrun.js')),
    'kein Thread mit der Aufgabe check');
  inDb(d => {
    d.prepare("INSERT INTO settings (key, value) VALUES ('ballast-055', ?)").run('x'.repeat(200000));
    d.prepare("DELETE FROM settings WHERE key = 'ballast-055'").run();
  });
  const free = (await as('owner', 'GET', '/api/stats')).content?.dbFree;
  const pages = inDb(d => d.pragma('freelist_count', { simple: true }) * d.pragma('page_size', { simple: true }));
  check('Freie Seiten der Datenbank: freelist_count mal page_size in GET /api/stats',
    pages > 100000 && free === pages, `${free} statt ${pages}`);
  await restart({ BACKUP_DIR: backupRoot, KRITERION_TESTBENCH: 'pruefstand:scrypt=1024:mail=40:brake=10:checkwait=1' });
  const early = (await scan()).check || {};
  let late = {};
  await until2(async () => { late = (await scan()).check || {}; return !late.running; }, 10000);
  check('Dauert die Pruefung laenger als die Wartezeit, meldet die Route sie als laufend; eine Nachfrage holt das Ergebnis',
    early.running === true && early.ok === undefined && late.ok === true && !late.running,
    `${JSON.stringify(early)} -> ${JSON.stringify(late)}`);
  check('Die Wartezeit ist kuerzer als die 60 s eines Reverse Proxy',
    /const CHECK_WAIT_MS = BENCH\.checkwait \|\| 20000;/.test(read('server.js')), 'keine Grenze von 20 s');

  await B.stop();
  fs.rmSync(root, { recursive: true, force: true });

  if (!JSDOM) { check('jsdom fehlt: die Karte bleibt ungeprueft', false, 'npm install'); return; }

  group('Wartung: die Karte');
  {
    const hexA = 'a'.repeat(32), hexM = 'b'.repeat(32), hexT = 'c'.repeat(32), hexP = 'd'.repeat(32);
    const maintenance = {
      unknown: [
        { name: 'alt', kind: 'dir', size: 400, files: 2, at: '2026-10-02 08:00:00', why: 'foreign', free: true },
        { name: hexA, kind: 'file', size: 2000, files: null, at: '2026-10-02 09:00:00', why: 'named', free: false },
        { name: 'notiz.txt', kind: 'file', size: 5, files: null, at: '2026-10-02 10:00:00', why: 'foreign', free: true }],
      missing: [
        { name: hexM, place: 'entry', filename: 'A.txt', folder: 'Ordner W', item: { id: 1, title: 'Eintrag W' },
          trash: null, size: 3000, copy: true, why: null },
        { name: hexT, place: 'trash', filename: null, folder: null, item: null, trash: 'E.txt', size: 3000,
          copy: false, why: 'noCopy' },
        { name: hexP, place: 'previous', filename: 'Bericht.docx', folder: null, item: { id: 1, title: 'Eintrag W' },
          trash: null, size: 3000, copy: true, why: null }],
      dbFree: 0, folder: true,
      check: { ok: false, quick: ['ok'], keys: [{ table: 'folders', parent: 'items', count: 2 }], ms: 1234 } };
    const d = buildDom(JSDOM, { maintenance: JSON.parse(JSON.stringify(maintenance)) });
    const w = d.w;
    await until(w, (z) => z.document.getElementById('count') && openRequests(z) === 0, 3000, 'die Uebersicht');
    await D.sysSection(w, 'database');
    const knob = w.document.getElementById('maint-run');
    check('Der Eigentuemer-Admin sieht den Knopf „Abgleich“ unter dem Hinweis',
      !!knob && knob.textContent.trim() === DE['card.maintRun'] &&
      w.document.body.textContent.includes(DE['card.maintHint']), knob ? knob.textContent : 'kein Knopf');
    knob?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await until(w, (z) => z.document.getElementById('maint-unknown') && openRequests(z) === 0, 3000, 'die Liste');
    const rows = [...w.document.querySelectorAll('#maint-unknown .mrow')];
    const pickOf = (row) => row.querySelector('input.maint-pick');
    check('Die Liste zeigt jeden Eintrag; gesperrt ist nur die Datei, die bleibt',
      rows.length === 3 && rows.map(r => pickOf(r)?.disabled).join() === 'false,true,false' &&
      rows[0].textContent.includes(deText('card.maintDir', { n: 2 })) &&
      rows[1].textContent.includes(DE['card.maintNamed']) && rows[2].textContent.includes(DE['card.maintForeign']),
      rows.map(r => r.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
    check('Die Ueberschrift nennt die Zahl', w.document.body.textContent.includes(deText('card.maintUnknown', { n: 3 })),
      'keine Zahl');
    const missRows = [...w.document.querySelectorAll('#maint-missing .mrow')];
    const link = missRows[0]?.querySelector('a');
    check('Fehlende Dateien: Eintrag als Link, Ordner, Ort und Grund; ohne Kopie gesperrt',
      missRows.length === 3 && link?.getAttribute('href') === '#/item/1' && link?.textContent === 'Eintrag W' &&
      missRows[0].textContent.includes('Ordner W') && missRows[0].textContent.includes(DE['card.maintCopyThere']) &&
      missRows[1].textContent.includes(DE['card.maintInTrash']) && missRows[1].textContent.includes(DE['card.maintNoCopy']) &&
      missRows[1].querySelector('input').disabled && missRows[2].textContent.includes(DE['card.maintPrevious']),
      missRows.map(r => r.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
    const warn = w.document.querySelector('#maint-out .warn-box');
    check('Die Pruefung nennt Fehler, Dauer und jeden verletzten Fremdschluessel',
      !!warn && warn.textContent.includes(deText('card.maintCheckBad', { seconds: '1,2' })) &&
      warn.textContent.includes(deText('card.maintKeys', { n: 2, table: 'folders', parent: 'items' })),
      warn ? warn.textContent : 'kein Kasten');
    const deleteKnob = w.document.getElementById('maint-delete');
    const allKnob = w.document.getElementById('maint-all');
    const lockedBefore = deleteKnob?.disabled;
    allKnob?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    check('„Alle auswählen“ waehlt die freien Eintraege; erst dann ist „Löschen“ frei',
      lockedBefore === true && deleteKnob?.disabled === false && allKnob?.textContent === DE['entry.pickNone'] &&
      !w.document.querySelector(`#maint-unknown input[data-name="${hexA}"]`).checked, `${lockedBefore} ${deleteKnob?.disabled}`);
    const transcript = [];
    const yes = placeConfirm(w, true, transcript);
    deleteKnob?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await until(w, (z) => d.sent.some(s => s.method === 'DELETE' && s.url === '/api/files/unknown') &&
      openRequests(z) === 0 && z.document.querySelectorAll('#maint-unknown .mrow').length === 1, 3000, 'das Loeschen');
    const sentDelete = d.sent.find(s => s.method === 'DELETE' && s.url === '/api/files/unknown');
    check('Nach der Rueckfrage gehen genau die gewaehlten Namen hinaus',
      equal(sentDelete?.body?.names, ['alt', 'notiz.txt']) &&
      transcript[0]?.includes(deText('card.maintDeleteAsk', { n: 2, bytes: '405 B' })),
      `${JSON.stringify(sentDelete?.body)} · ${transcript[0]}`);
    check('Danach steht nur noch die Datei, die bleibt, und die Pruefung steht weiter da',
      w.document.querySelectorAll('#maint-unknown .mrow').length === 1 && !!w.document.querySelector('#maint-out .warn-box'),
      `${w.document.querySelectorAll('#maint-unknown .mrow').length}`);
    const backPick = w.document.querySelector(`#maint-missing input[data-name="${hexM}"]`);
    if (backPick) { backPick.checked = true; backPick.dispatchEvent(new w.Event('change', { bubbles: true })); }
    w.document.getElementById('maint-restore')?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await until(w, (z) => d.sent.some(s => s.method === 'POST' && s.url === '/api/files/missing') &&
      openRequests(z) === 0, 3000, 'das Zurueckholen');
    yes.disconnect();
    const sentBack = d.sent.find(s => s.method === 'POST' && s.url === '/api/files/missing');
    check('Zurueckholen schickt den gewaehlten Namen und zeichnet die Liste neu',
      equal(sentBack?.body?.names, [hexM]) && w.document.querySelectorAll('#maint-missing .mrow').length === 2,
      JSON.stringify(sentBack?.body));
    w.close();

    const clean = buildDom(JSDOM, { maintenanceRunning: 1, maintenance: { unknown: [], missing: [], dbFree: 0,
      folder: true, check: { ok: true, quick: ['ok'], keys: [], ms: 480 } } });
    await until(clean.w, (z) => z.document.getElementById('count') && openRequests(z) === 0, 3000, 'die Uebersicht');
    await D.sysSection(clean.w, 'database');
    clean.w.document.getElementById('maint-run')?.dispatchEvent(new clean.w.MouseEvent('click', { bubbles: true }));
    const cleanText = () => clean.w.document.getElementById('maint-out')?.textContent || '';
    await until(clean.w, () => cleanText().includes(DE['card.maintCheckRunning']), 3000, 'die laufende Pruefung');
    const runningText = cleanText();
    await until(clean.w, () => cleanText().includes(DE['card.maintClean']) &&
      !cleanText().includes(DE['card.maintCheckRunning']), 6000, 'das Ergebnis');
    check('Laeuft die Pruefung noch, sagt die Karte es und fragt nach',
      runningText.includes(DE['card.maintCheckRunning']) &&
      clean.sent.filter(z => z.url === '/api/maintenance').length === 2, runningText.replace(/\s+/g, ' ').trim());
    check('Ohne Befund: ein Satz dafuer und „In Ordnung“ mit der Dauer',
      cleanText().includes(DE['card.maintClean']) && cleanText().includes(deText('card.maintCheckOk', { seconds: '0,5' })) &&
      !clean.w.document.getElementById('maint-delete'), cleanText().replace(/\s+/g, ' ').trim());
    clean.w.close();

    const admin = buildDom(JSDOM, { settings: { filters: null, isAdmin: true, isOwner: false } });
    await until(admin.w, (z) => z.document.getElementById('count') && openRequests(z) === 0, 3000, 'die Uebersicht');
    await D.sysSection(admin.w, 'database');
    check('Ein Admin sieht die Karte ohne den Knopf',
      admin.w.document.body.textContent.includes(DE['card.storage']) && !admin.w.document.getElementById('maint-run'),
      'Knopf beim Admin');
    admin.w.close();
  }

  group('Wartung: „fehlt“ an der Datei');
  {
    const vChefin = { id: 1, name: 'chefin', deleted: false };
    const file = (id, filename, more = {}) => ({ id, filename, mime_type: 'text/plain', size: 3000, sort_order: id,
      preview: 'keine', created_at: '2026-10-02 08:00:00', mine: true, author: vChefin, folder: null, ...more });
    const e = buildDom(JSDOM, { hash: '#/item/1',
      extraAttachments: [file(70, 'weg.txt', { missing: true }), file(71, 'da.txt', { missing: false })] });
    await until(e.w, (z) => z.document.querySelector('#atts .atile[data-key="f71"]') && openRequests(z) === 0,
      3000, 'die Kacheln');
    const tile = (key) => e.w.document.querySelector(`#atts .atile[data-key="${key}"]`);
    const gone = tile('f70'), here = tile('f71');
    check('Eine fehlende Datei zeigt „fehlt“ in Kachel und Liste und im Namen fuer Screenreader',
      gone?.querySelector('.ameta')?.textContent.includes(DE['entry.fileMissing']) &&
      gone?.querySelector('.anote')?.textContent === DE['entry.fileMissing'] &&
      gone?.querySelector('.astate.fail')?.textContent === '⚠' &&
      gone?.querySelector('.aface')?.getAttribute('aria-label').endsWith(DE['entry.fileMissing']),
      gone ? gone.textContent.replace(/\s+/g, ' ').trim() : 'keine Kachel');
    check('Eine vorhandene Datei zeigt nichts davon',
      !here?.querySelector('.astate') && here?.querySelector('.anote')?.textContent === '' &&
      !here?.querySelector('.ameta')?.textContent.includes(DE['entry.fileMissing']), here ? here.textContent : 'keine Kachel');
    e.w.close();
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
