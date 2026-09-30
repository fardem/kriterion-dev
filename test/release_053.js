/* Kriterion — Pruefstand: Papierkorb fuer Dateien, Dateien aus Backups zurueckholen, Sortieren nach
   Typ, Erweiterte Infos mit Audio, Container und H.264, Angaben zu Fotos des Eintrags, ⓘ im Vollbild,
   README und Anleitung in drei Sprachen. */
const H = require('./frame.js');
const D = require('./dom.js');
const { buildDom, until, openRequests } = D;

async function run() {
  const { fs, os, path, crypto, __dirname, group, check, equal, open, withCsrf, jar, KEY } = H;
  await H.mainServerReady();
  let JSDOM = null;
  try { ({ JSDOM } = require('jsdom')); } catch { JSDOM = null; }
  const read = (name) => fs.readFileSync(path.join(__dirname, ...name.split('/')), 'utf8');
  const DE = JSON.parse(read('public/languages/de.json'));
  const deText = (key, values = {}) => {
    const form = typeof DE[key] === 'object' ? DE[key][values.n === 1 ? 'one' : 'other'] : DE[key];
    return String(form).replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
  };
  const HEX = /^[0-9a-f]{32}$/;
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const until2 = async (test, ms = 8000) => {
    for (const t0 = Date.now(); Date.now() - t0 < ms; await wait(100)) if (await test()) return true;
    return false;
  };

  /* ---- Server und Accounts ---- */
  // Die Basis teilt sich das Modul mit release_041 bis release_052; die Module laufen nacheinander.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-korb-'));
  const dir = path.join(root, 'data');
  const backupRoot = path.join(root, 'backup');
  fs.mkdirSync(dir);
  fs.mkdirSync(backupRoot);
  const filesDir = path.join(dir, 'files');
  const copyDir = path.join(backupRoot, 'kriterion-files');
  let B = null;
  B = H.startFurtherServer(dir, { BACKUP_DIR: backupRoot }, 7340);
  await B.ready;
  const pw = (user) => user + '-langes-wort-53';
  await B.call('POST', '/api/setup', { user: 'eigen', password: pw('eigen') });
  await B.call('POST', '/api/users', { username: 'zweit', password: pw('zweit'), role: 'user' });
  await B.call('POST', '/api/users', { username: 'dritt', password: pw('dritt'), role: 'admin' });
  const cookies = {};
  for (const user of ['eigen', 'zweit', 'dritt']) {
    const login = await fetch(B.base + '/api/login', { method: 'POST',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user, password: pw(user) }) });
    cookies[user] = jar('', login);
  }
  const as = async (who, method, url, body) => {
    const a = await fetch(B.base + url, { method,
      headers: withCsrf(cookies[who], body ? { 'content-type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined });
    return { status: a.status, content: await a.json().catch(() => null) };
  };
  const raw = async (who, id) => {
    const a = await fetch(`${B.base}/api/attachments/${id}/raw`, { headers: withCsrf(cookies[who], {}) });
    return a.status === 200 ? Buffer.from(await a.arrayBuffer()) : null;
  };
  const inDb = (fn) => {
    const d = open(path.join(dir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    try { return fn(d); } finally { d.close(); }
  };
  const upload = (who, itemId, files, folderId = null) => H.sendFiles(B.base, cookies[who], itemId, files, folderId);
  const filesOf = async (itemId) => (await as('eigen', 'GET', `/api/items/${itemId}`)).content?.attachments || [];
  const fileNamed = async (itemId, name) => (await filesOf(itemId)).find(a => a.filename === name);
  const diskName = (id) => inDb(d => d.prepare('SELECT name FROM disk_files WHERE attachment_id = ?').get(id)?.name);
  const onDisk = (name) => fs.existsSync(path.join(filesDir, name));
  const content = {};
  for (const n of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) content[n] = Buffer.concat([Buffer.from(`Datei ${n}\n`), crypto.randomBytes(3000)]);
  async function backupNow() {
    await H.nextSecond();
    const r = await as('eigen', 'POST', '/api/backup');
    if (r.status === 202)
      await until2(async () => (await as('eigen', 'GET', '/api/backup')).content?.copy?.running === false, 20000);
    return (await as('eigen', 'GET', '/api/backup')).content?.copy?.file || r.content?.file || '';
  }
  const trashRows = async () => (await as('dritt', 'GET', '/api/trash')).content?.rows || [];
  const newItem = async (title) => (await as('eigen', 'POST', '/api/items', { title })).content.id;
  // Fuellt einen Eintrag bis FILES_PER_ENTRY mit leeren Zeilen, ohne 100 Uploads.
  const fill = (itemId) => inDb(d => {
    const n = d.prepare('SELECT COUNT(*) AS n FROM attachments WHERE item_id = ?').get(itemId).n;
    const add = d.prepare(`INSERT INTO attachments (item_id, filename, data) VALUES (?, ?, x'')`);
    d.transaction(() => { for (let i = n; i < 100; i++) add.run(itemId, `leer-${i}.txt`); })();
  });
  const unfill = (itemId) => inDb(d => d.prepare("DELETE FROM attachments WHERE item_id = ? AND filename LIKE 'leer-%'")
    .run(itemId));

  group('Papierkorb fuer Dateien: Loeschen legt ab');
  const x = await newItem('Eintrag X');
  const folderMade = await as('zweit', 'POST', `/api/items/${x}/folders`, { name: 'Ordner 1' });
  const folderOne = (folderMade.content?.folders || []).find(f => f.name === 'Ordner 1')?.id;
  await upload('zweit', x, [{ name: 'A.txt', content: content.A }, { name: 'B.txt', content: content.B }], folderOne);
  await upload('zweit', x, [{ name: 'C.txt', content: content.C }]);
  const bFile = await fileNamed(x, 'B.txt');
  const bDisk = diskName(bFile.id);
  inDb(d => d.prepare(`INSERT INTO attachment_stills (attachment_id, duration, still) VALUES (?, 12.5, ?)`)
    .run(bFile.id, Buffer.from('standbild')));
  inDb(d => d.prepare(`INSERT INTO attachment_editing (attachment_id, edit_all) VALUES (?, 1)`).run(bFile.id));
  const dropped = await as('zweit', 'DELETE', `/api/attachments/${bFile.id}`);
  const row = inDb(d => d.prepare("SELECT id, title, content FROM trash WHERE json_extract(content, '$.kind') = 'file'")
    .get());
  const kept = inDb(d => d.prepare('SELECT trash_id, attachment_id FROM disk_files WHERE name = ?').get(bDisk));
  check('Geloescht: die Datei fehlt im Eintrag, eine Zeile in trash beschreibt sie',
    dropped.status === 200 && !(dropped.content?.attachments || []).some(a => a.filename === 'B.txt') &&
    row?.title === 'B.txt' && JSON.parse(row.content).file.folder?.name === 'Ordner 1' &&
    JSON.parse(row.content).item.title === 'Eintrag X', `${dropped.status} ${row?.title}`);
  check('Die Datei bleibt auf der Platte, gehalten ueber trash_id; Standbild in trash_bytes',
    onDisk(bDisk) && kept?.trash_id === row.id && kept?.attachment_id === null &&
    inDb(d => d.prepare('SELECT COUNT(*) AS n FROM trash_bytes WHERE trash_id = ?').get(row.id).n) === 1,
    JSON.stringify(kept));
  const listed = (await trashRows()).find(z => z.id === row.id);
  check('Die Karte „Papierkorb“ nennt die Datei mit Eintrag, Ordner und Groesse; Admins sehen sie',
    listed?.kind === 'file' && listed?.entry === 'Eintrag X' && listed?.folder === 'Ordner 1' &&
    listed?.size === content.B.length && listed?.daysOpen === 30 && listed?.createdBy?.name === 'zweit',
    JSON.stringify(listed));

  group('Papierkorb fuer Dateien: Wiederherstellen');
  const byAdmin = await as('dritt', 'POST', `/api/trash/${row.id}/restore`);
  const byAuthor = await as('zweit', 'POST', `/api/trash/${row.id}/restore`);
  check('Nur der Eigentuemer-Admin stellt wieder her; Admin und Verfasser: 403',
    byAdmin.status === 403 && byAuthor.status === 403, `${byAdmin.status} ${byAuthor.status}`);
  await as('zweit', 'DELETE', `/api/folders/${folderOne}`);
  const back = await as('eigen', 'POST', `/api/trash/${row.id}/restore`);
  const bBack = await fileNamed(x, 'B.txt');
  const folders = (await as('eigen', 'GET', `/api/items/${x}`)).content?.folders || [];
  check('Zurueck im Eintrag, mit Verfasser und Datum von vorher; die Zeile im Papierkorb ist fort',
    back.status === 200 && back.content?.kind === 'file' && bBack?.author?.name === 'zweit' &&
    bBack?.created_at === bFile.created_at && !inDb(d => d.prepare('SELECT 1 FROM trash WHERE id = ?').get(row.id)),
    `${back.status} ${JSON.stringify(bBack?.author)} ${bBack?.created_at}`);
  check('Der geloeschte Ordner entsteht neu mit seinem Namen, die Datei liegt darin',
    folders.some(f => f.name === 'Ordner 1' && f.id !== folderOne && f.id === bBack?.folder), JSON.stringify(folders));
  check('Inhalt, Standbild und „Bearbeiten durch alle“ sind wieder da; der Name auf der Platte bleibt',
    equal([...(await raw('eigen', bBack.id))], [...content.B]) && diskName(bBack.id) === bDisk &&
    inDb(d => d.prepare('SELECT duration FROM attachment_stills WHERE attachment_id = ?').get(bBack.id)?.duration) === 12.5 &&
    inDb(d => d.prepare('SELECT edit_all FROM attachment_editing WHERE attachment_id = ?').get(bBack.id)?.edit_all) === 1,
    diskName(bBack.id));

  group('Papierkorb fuer Dateien: Frist, Grenze und geloeschter Eintrag');
  {
    const cFile = await fileNamed(x, 'C.txt');
    const cDisk = diskName(cFile.id);
    await as('zweit', 'DELETE', `/api/attachments/${cFile.id}`);
    const cRow = (await trashRows()).find(z => z.title === 'C.txt');
    fill(x);
    const full = await as('eigen', 'POST', `/api/trash/${cRow.id}/restore`);
    unfill(x);
    check('Bei 100 Dateien im Eintrag bleibt die Datei im Papierkorb: 400',
      full.status === 400 && full.content?.error === deText('server.fileCap', { cap: 100, entryOne: 'Eintrag' }) &&
      (await trashRows()).some(z => z.id === cRow.id), `${full.status} ${full.content?.error}`);
    inDb(d => d.prepare("UPDATE trash SET deleted_at = datetime('now', '-31 days') WHERE id = ?").run(cRow.id));
    const after = await trashRows();
    check('Nach 30 Tagen faellt die Zeile; die Datei kommt in die Loeschliste und dann von der Platte',
      !after.some(z => z.id === cRow.id) && !inDb(d => d.prepare('SELECT 1 FROM disk_files WHERE name = ?').get(cDisk)) &&
      await until2(() => !onDisk(cDisk)), `${after.length} ${onDisk(cDisk)}`);
    const y = await newItem('Eintrag Y');
    await upload('eigen', y, [{ name: 'G.txt', content: content.G }]);
    const gFile = await fileNamed(y, 'G.txt');
    await as('eigen', 'DELETE', `/api/attachments/${gFile.id}`);
    await as('eigen', 'DELETE', `/api/items/${y}`);
    const entryRow = (await trashRows()).find(z => z.kind === 'entry' && z.title === 'Eintrag Y');
    const orphan = (await trashRows()).find(z => z.kind === 'file' && z.title === 'G.txt');
    check('Ist der Eintrag geloescht, bleibt die Datei eine eigene Zeile; die Karte weiss es',
      !!entryRow && orphan?.entryThere === false, JSON.stringify(orphan));
    const lost = await as('eigen', 'POST', `/api/trash/${orphan.id}/restore`);
    const again = await as('eigen', 'POST', `/api/trash/${entryRow.id}/restore`);
    const y2 = again.content?.itemId;
    const offered = await as('eigen', 'GET', `/api/items/${y2}/deleted-files`);
    check('Ohne Eintrag: 404; nach dem Wiederherstellen des Eintrags erscheint die Datei an ihm',
      lost.status === 404 && lost.content?.error === deText('server.fileEntryGone', { entryOne: 'Eintrag' }) &&
      y2 && y2 !== y &&
      equal((offered.content?.trash || []).map(z => z.filename), ['G.txt']), `${lost.status} ${y2}`);
    const got = await as('eigen', 'POST', `/api/items/${y2}/deleted-files`, { trash: [orphan.id] });
    check('„Gelöschte Dateien …“ holt sie aus dem Papierkorb zurueck',
      got.status === 200 && got.content?.fetched === 1 && (got.content?.attachments || []).some(a => a.filename === 'G.txt') &&
      equal([...(await raw('eigen', (got.content.attachments.find(a => a.filename === 'G.txt')).id))], [...content.G]),
      `${got.status} ${got.content?.fetched}`);
  }

  group('Dateien aus Backups zurueckholen: B zurueck, D bleibt');
  const z = await newItem('Eintrag Z');
  await upload('eigen', z, ['A', 'B', 'C'].map(n => ({ name: n + '.txt', content: content[n] })));
  const first = await backupNow();
  const purge = async (itemId, name) => {
    const f = await fileNamed(itemId, name);
    await as('eigen', 'DELETE', `/api/attachments/${f.id}`);
    const r = (await trashRows()).find(t => t.kind === 'file' && t.title === name);
    await as('eigen', 'DELETE', `/api/trash/${r.id}`);
    return f;
  };
  const zb = await purge(z, 'B.txt');
  await upload('eigen', z, [{ name: 'D.txt', content: content.D }]);
  const offer = await as('eigen', 'GET', `/api/items/${z}/deleted-files`);
  const bOffer = (offer.content?.backups || []).find(f => f.filename === 'B.txt');
  check('Der Dialog nennt B aus dem Backup, sonst nichts; A, C und D sind da',
    offer.status === 200 && offer.content?.place === true && equal((offer.content.backups || []).map(f => f.filename), ['B.txt']) &&
    bOffer?.backup === first && bOffer?.missing === false && bOffer?.older === false && offer.content.unreadable === 0,
    JSON.stringify(offer.content));
  const denied = [await as('dritt', 'GET', `/api/items/${z}/deleted-files`),
    await as('zweit', 'POST', `/api/items/${z}/deleted-files`, { backup: [{ name: first, file: bOffer.file }] })];
  check('Nur der Eigentuemer-Admin: Admin und Account bekommen 403',
    denied.every(r => r.status === 403), denied.map(r => r.status).join(' '));
  const logBefore = inDb(d => d.prepare("SELECT COUNT(*) AS n FROM security_log WHERE event = 'backup.fetch'").get().n);
  const fetched = await as('eigen', 'POST', `/api/items/${z}/deleted-files`, { backup: [{ name: first, file: bOffer.file }] });
  const names = (fetched.content?.attachments || []).map(a => a.filename).sort();
  const bNew = (fetched.content?.attachments || []).find(a => a.filename === 'B.txt');
  check('Zurueckgeholt: B ist wieder da, D bleibt; der Inhalt ist derselbe',
    fetched.status === 200 && fetched.content?.fetched === 1 && equal(fetched.content?.refused, []) &&
    equal(names, ['A.txt', 'B.txt', 'C.txt', 'D.txt']) && equal([...(await raw('eigen', bNew.id))], [...content.B]),
    `${fetched.status} ${names.join(' ')}`);
  check('Verfasser und Datum wie im Backup; eine Zeile backup.fetch im Sicherheitsprotokoll',
    bNew?.author?.name === 'eigen' && bNew?.created_at === zb.created_at &&
    inDb(d => d.prepare("SELECT COUNT(*) AS n FROM security_log WHERE event = 'backup.fetch'").get().n) === logBefore + 1,
    `${bNew?.created_at} ${zb.created_at}`);
  check('Danach bietet der Dialog B nicht mehr an',
    ((await as('eigen', 'GET', `/api/items/${z}/deleted-files`)).content?.backups || []).length === 0, 'backups');

  group('Dateien aus Backups zurueckholen: aeltere Fassung, fehlende Kopie, fremder Schluessel');
  {
    const a = await fileNamed(z, 'A.txt');
    const oldName = diskName(a.id), fresh = crypto.randomBytes(16).toString('hex');
    // Wie nach einem Speichern im Document Server: neuer Name auf der Platte, saves steigt.
    inDb(d => {
      d.prepare('UPDATE disk_files SET name = ? WHERE name = ?').run(fresh, oldName);
      d.prepare('INSERT INTO attachment_editing (attachment_id, saves) VALUES (?, 1)').run(a.id);
    });
    fs.renameSync(path.join(filesDir, oldName), path.join(filesDir, fresh));
    const c = await fileNamed(z, 'C.txt');
    const cDisk = diskName(c.id);
    await purge(z, 'C.txt');
    fs.rmSync(path.join(copyDir, cDisk));
    const stamp = new Date(fs.statSync(path.join(backupRoot, first)).mtimeMs);
    const two = (n) => String(n).padStart(2, '0');
    const olderName = `A (Backup ${two(stamp.getDate())}.${two(stamp.getMonth() + 1)}.${stamp.getFullYear()}).txt`;
    fs.writeFileSync(path.join(backupRoot, 'kriterion-2000-01-01-00-00-00.sqlite'), crypto.randomBytes(8192));
    const o = (await as('eigen', 'GET', `/api/items/${z}/deleted-files`)).content || {};
    const aOffer = (o.backups || []).find(f => f.older);
    const cOffer = (o.backups || []).find(f => f.filename === 'C.txt');
    check('Oefter gespeichert: die Fassung aus dem Backup als eigene Datei mit Datum im Namen',
      aOffer?.filename === olderName && aOffer?.missing === false, JSON.stringify(o.backups));
    check('Fehlt die Kopie in kriterion-files/, steht die Datei mit missing; ein fremdes Backup zaehlt als nicht lesbar',
      cOffer?.missing === true && o.unreadable === 1, `${JSON.stringify(cOffer)} ${o.unreadable}`);
    const r = await as('eigen', 'POST', `/api/items/${z}/deleted-files`,
      { backup: [{ name: first, file: aOffer.file }, { name: first, file: cOffer.file }] });
    const older = (r.content?.attachments || []).find(f => f.filename === olderName);
    check('Die aeltere Fassung kommt daneben, die fehlende Kopie wird mit Grund abgelehnt',
      r.status === 200 && r.content?.fetched === 1 && !!older && (r.content?.attachments || []).some(f => f.filename === 'A.txt') &&
      equal((r.content?.refused || []).map(f => f.reason), [DE['server.backupCopyMissing']]) &&
      equal([...(await raw('eigen', older.id))], [...content.A]), JSON.stringify(r.content?.refused));
    fs.rmSync(path.join(backupRoot, 'kriterion-2000-01-01-00-00-00.sqlite'));
  }

  group('Dateien aus Backups zurueckholen: aus der Datenbank eines alten Backups');
  {
    await upload('eigen', z, [{ name: 'E.txt', content: content.E }]);
    const second = await backupNow();
    const e = await fileNamed(z, 'E.txt');
    // Ein Backup von vor 0.50.0: der Inhalt steht in attachments.data, ohne Zeile in disk_files.
    const old = 'kriterion-2001-01-01-00-00-00.sqlite';
    fs.copyFileSync(path.join(backupRoot, second), path.join(backupRoot, old));
    const d = open(path.join(backupRoot, old));
    try {
      // Den Account 999 gibt es in keinem der beiden Staende; vor 0.48.0 gab es den Trigger nicht.
      d.pragma('foreign_keys = OFF');
      d.exec('DROP TRIGGER IF EXISTS disk_files_kept');
      d.prepare('UPDATE attachments SET data = ?, user_id = 999 WHERE id = ?').run(content.E, e.id);
      d.prepare('DELETE FROM disk_files WHERE attachment_id = ?').run(e.id);
    } finally { d.close(); }
    const later = new Date(Date.now() + 60000);
    fs.utimesSync(path.join(backupRoot, old), later, later);
    await purge(z, 'E.txt');
    const o = (await as('eigen', 'GET', `/api/items/${z}/deleted-files`)).content || {};
    const eOffer = (o.backups || []).find(f => f.filename === 'E.txt');
    const r = await as('eigen', 'POST', `/api/items/${z}/deleted-files`, { backup: [{ name: eOffer.backup, file: eOffer.file }] });
    const eNew = (r.content?.attachments || []).find(f => f.filename === 'E.txt');
    const eDisk = eNew ? diskName(eNew.id) : null;
    check('Aus der Datenbank eines alten Backups, neu verschluesselt unter neuem Namen',
      eOffer?.backup === old && r.content?.fetched === 1 && HEX.test(eDisk || '') && eDisk !== diskName(e.id) &&
      onDisk(eDisk) && equal([...(await raw('eigen', eNew.id))], [...content.E]), `${eOffer?.backup} ${eDisk}`);
    check('Fehlt der Account des Backups, steht die Datei ohne Verfasser da', !eNew?.author, JSON.stringify(eNew?.author));
  }

  group('Dateien aus Backups zurueckholen: Eintrag aus dem Papierkorb, Grenze, laufendes Backup');
  {
    const w = await newItem('Eintrag W');
    await upload('eigen', w, [{ name: 'F.txt', content: content.F }]);
    const third = await backupNow();
    await purge(w, 'F.txt');
    await as('eigen', 'DELETE', `/api/items/${w}`);
    const entryRow = (await trashRows()).find(t => t.kind === 'entry' && t.title === 'Eintrag W');
    const w2 = (await as('eigen', 'POST', `/api/trash/${entryRow.id}/restore`)).content?.itemId;
    const o = (await as('eigen', 'GET', `/api/items/${w2}/deleted-files`)).content || {};
    const fOffer = (o.backups || []).find(f => f.filename === 'F.txt');
    check('Nach dem Papierkorb traegt der Eintrag eine neue Nummer; Anlagedatum und Titel finden ihn im Backup',
      w2 && w2 !== w && fOffer?.backup === third, `${w} ${w2} ${JSON.stringify(o.backups)}`);
    fill(w2);
    const full = await as('eigen', 'POST', `/api/items/${w2}/deleted-files`, { backup: [{ name: third, file: fOffer.file }] });
    unfill(w2);
    check('Bei 100 Dateien im Eintrag: abgelehnt mit Grund',
      full.content?.fetched === 0 && equal((full.content?.refused || []).map(f => f.reason), [deText('server.fileCap', { cap: 100, entryOne: 'Eintrag' })]),
      JSON.stringify(full.content?.refused));
    fs.writeFileSync(path.join(copyDir, '.lock'), 'anderer Lauf\n');
    const busy = await as('eigen', 'POST', `/api/items/${w2}/deleted-files`, { backup: [{ name: third, file: fOffer.file }] });
    fs.rmSync(path.join(copyDir, '.lock'));
    const now = await as('eigen', 'POST', `/api/items/${w2}/deleted-files`, { backup: [{ name: third, file: fOffer.file }] });
    check('Haelt ein anderer Lauf das Lockfile, wird nichts geholt; danach geht es',
      busy.content?.fetched === 0 && equal((busy.content?.refused || []).map(f => f.reason), [DE['server.backupRunning']]) &&
      now.content?.fetched === 1, `${busy.content?.fetched} ${now.content?.fetched}`);
  }

  await B.stop();
  fs.rmSync(root, { recursive: true, force: true });
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
