/* Kriterion — Pruefstand: Dateien umbenennen, Format und Pixel der Bilder, EXIF, Vorschaubilder in der
   Bilddatei, „Infos“ zu Dokumenten, der zugeklappte Kopf von „Dateien“, Texte, Filter nach Potenzial und
   Bewertung. */
const H = require('./frame.js');
const D = require('./dom.js');
const { buildDom, until, openRequests } = D;

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

  /* ---- Server und Accounts ---- */
  // Die Basis teilt sich das Modul mit release_041 bis release_053; die Module laufen nacheinander.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-054-'));
  const dir = path.join(root, 'data');
  fs.mkdirSync(dir);
  const B = H.startFurtherServer(dir, {}, 7340);
  await B.ready;
  const pw = (user) => user + '-langes-wort-54';
  await B.call('POST', '/api/setup', { user: 'owner', password: pw('owner') });
  await B.call('POST', '/api/users', { username: 'zweit', password: pw('zweit'), role: 'user' });
  const cookies = {};
  for (const user of ['owner', 'zweit']) {
    const login = await fetch(B.base + '/api/login', { method: 'POST',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user, password: pw(user) }) });
    cookies[user] = jar('', login);
  }
  const as = async (who, method, url, body) => {
    const a = await fetch(B.base + url, { method,
      headers: withCsrf(cookies[who], body !== undefined ? { 'content-type': 'application/json' } : {}),
      body: body !== undefined ? JSON.stringify(body) : undefined });
    return { status: a.status, content: await a.json().catch(() => null), headers: a.headers };
  };
  const inDb = (fn) => {
    const d = open(path.join(dir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    try { return fn(d); } finally { d.close(); }
  };
  const upload = (who, itemId, files, folderId = null) => H.sendFiles(B.base, cookies[who], itemId, files, folderId);
  const filesOf = async (itemId) => (await as('owner', 'GET', `/api/items/${itemId}`)).content?.attachments || [];
  const fileNamed = async (itemId, name) => (await filesOf(itemId)).find(a => a.filename === name);
  const newItem = async (title) => (await as('owner', 'POST', '/api/items', { title })).content.id;
  const bytes = (text) => Buffer.concat([Buffer.from(text), crypto.randomBytes(500)]);

  group('Dateien umbenennen: die Route');
  {
    const x = await newItem('Eintrag Namen');
    const made = await as('zweit', 'POST', `/api/items/${x}/folders`, { name: 'Ordner N' });
    const folder = (made.content?.folders || []).find(f => f.name === 'Ordner N')?.id;
    await upload('zweit', x, [{ name: 'A.docx', content: bytes('A') }, { name: 'B.docx', content: bytes('B') }], folder);
    await upload('zweit', x, [{ name: 'C.docx', content: bytes('C') }, { name: 'D.docx', content: bytes('D') },
      { name: 'Notiz.txt', content: bytes('Notiz') }]);
    const a = await fileNamed(x, 'A.docx'), c = await fileNamed(x, 'C.docx'), note = await fileNamed(x, 'Notiz.txt');
    const rename = (who, id, filename) => as(who, 'PUT', `/api/attachments/${id}`, { filename });
    const logRows = () => inDb(d => d.prepare('SELECT COUNT(*) AS n FROM security_log').get().n);
    const logBefore = logRows();

    const foreign = await rename('owner', a.id, 'Fremd');
    const gone = await rename('zweit', 999999, 'Weg');
    check('Nur wer hochgeladen hat, auch kein Admin: 403; eine fehlende Datei: 404',
      foreign.status === 403 && gone.status === 404 && (await fileNamed(x, 'A.docx'))?.id === a.id,
      `${foreign.status} ${gone.status}`);
    const refused = [];
    for (const value of ['', '   ', '...', '. .', 42, null, 'a\u0007b', 'x'.repeat(196)]) {
      const r = await rename('zweit', a.id, value);
      if (r.status !== 400) refused.push(`${JSON.stringify(value).slice(0, 12)}: ${r.status}`);
    }
    const tooLong = await rename('zweit', a.id, 'x'.repeat(196));
    check('Ohne Namen vor der Endung, nur Punkte, Steuerzeichen oder ueber 200 Zeichen: 400',
      refused.length === 0 && tooLong.content?.error === deText('server.fileName', { max: 195 }),
      refused.join(' · ') || tooLong.content?.error);

    const taken = await rename('zweit', a.id, 'b');
    const otherGroup = await rename('zweit', a.id, 'C');
    check('Im selben Ordner abgelehnt, ohne Gross- und Kleinschreibung; in einer anderen Gruppe erlaubt',
      taken.status === 409 && taken.content?.error === deText('server.fileNameTaken', { name: 'b.docx' }) &&
      otherGroup.status === 200 && (otherGroup.content?.attachments || []).some(f => f.id === a.id && f.filename === 'C.docx'),
      `${taken.status} ${taken.content?.error} · ${otherGroup.status}`);
    const loose = await rename('zweit', c.id, 'd');
    const ownCase = await rename('zweit', c.id, 'c.DOCX');
    check('Ohne Ordner zaehlt die Gruppe ohne Ordner; die eigene Datei steht nicht im Weg',
      loose.status === 409 && loose.content?.error === deText('server.nameTakenLoose', { name: 'd.docx' }) &&
      ownCase.status === 200 && (await filesOf(x)).find(f => f.id === c.id)?.filename === 'c.docx',
      `${loose.status} ${loose.content?.error} · ${ownCase.status}`);

    const before = inDb(d => d.prepare('SELECT updated_at FROM items WHERE id = ?').get(x).updated_at);
    await H.nextSecond();
    const kept = await rename('zweit', note.id, '../ordner/Neu.pdf');
    const download = await fetch(`${B.base}/api/attachments/${note.id}/raw`, { headers: withCsrf(cookies.zweit, {}) });
    const after = inDb(d => d.prepare('SELECT updated_at FROM items WHERE id = ?').get(x).updated_at);
    check('Die Endung bleibt, der Pfad faellt weg: „Neu.pdf.txt“, ausgeliefert als Text',
      kept.status === 200 && (kept.content?.attachments || []).find(f => f.id === note.id)?.filename === 'Neu.pdf.txt' &&
      /Neu\.pdf\.txt/.test(download.headers.get('content-disposition') || '') &&
      /^text\/plain/.test(download.headers.get('content-type') || ''),
      `${kept.status} ${download.headers.get('content-disposition')} ${download.headers.get('content-type')}`);
    check('Der Eintrag gilt als geaendert; kein Eintrag im Sicherheitsprotokoll',
      after > before && logRows() === logBefore, `${before} → ${after}, ${logBefore} → ${logRows()}`);

    inDb(d => d.prepare(`INSERT INTO attachment_previous (attachment_id, session_key, filename, mime_type, size, data)
      VALUES (?, 'k', 'C.doc', 'application/msword', 1, x'00')`).run(a.id));
    await rename('zweit', a.id, 'Fassung');
    check('Die vorige Fassung bekommt den neuen Namen mit ihrer eigenen Endung',
      inDb(d => d.prepare('SELECT filename FROM attachment_previous WHERE attachment_id = ?').get(a.id)?.filename) ===
      'Fassung.doc', 'vorige Fassung');
    await as('zweit', 'DELETE', `/api/attachments/${note.id}`);
    check('Der Papierkorb nennt den neuen Namen',
      inDb(d => d.prepare("SELECT title FROM trash WHERE json_extract(content, '$.kind') = 'file'").get()?.title) ===
      'Neu.pdf.txt', 'Papierkorb');
  }

  await B.stop();
  fs.rmSync(root, { recursive: true, force: true });

  /* ---- Oberflaeche ---- */
  if (!JSDOM) { check('jsdom steht bereit', false, 'npm install'); return; }
  const tileOf = (w, key) => w.document.querySelector(`#atts .atile[data-key="${key}"]`);
  const press = (el, key) => el?.dispatchEvent(new el.ownerDocument.defaultView.KeyboardEvent('keydown',
    { key, bubbles: true, cancelable: true }));
  const settle = (w, n, what = 'die Kacheln') => until(w, (x) =>
    x.document.querySelectorAll('#atts .atile').length >= n && openRequests(x) === 0, 3000, what).catch(() => {});
  const vChefin = { id: 1, name: 'chefin', deleted: false };
  const file = (id, filename, size, created, more = {}) => ({ id, filename, mime_type: 'application/octet-stream', size,
    sort_order: id, preview: 'keine', created_at: created, mine: true, author: vChefin, folder: null, ...more });
  const answerWith = (o, status = 200) => ({ ok: status < 400, status, json: async () => o });
  const menuOf = (w, key) => {
    tileOf(w, key)?.querySelector('.amore')?.click();
    return [...w.document.querySelectorAll('.fmenu-item')];
  };

  group('Dateien umbenennen: Menü und Dialog');
  {
    const foreign = { id: 2, name: 'zweit', deleted: false };
    const m = buildDom(JSDOM, { hash: '#/item/1', extraAttachments: [file(49, 'bericht.docx', 4000, '2026-08-05 09:00:00'),
      file(52, 'fremd.txt', 10, '2026-08-05 12:00:00', { mine: false, author: foreign })], settings: { filters: null, userCount: 2 } });
    const w = m.w;
    await settle(w, 6);
    const sent = [];
    const base = w.fetch;
    w.fetch = (url, opt) => {
      if (opt?.method !== 'PUT' || !/^\/api\/attachments\/\d+$/.test(url)) return base(url, opt);
      const body = JSON.parse(opt.body);
      sent.push(body);
      if (body.filename === 'doppelt') return Promise.resolve(answerWith({ error: 'Schon da.' }, 409));
      const f = m.example.attachments.find(a => a.id === Number(url.split('/').pop()));
      if (f) f.filename = body.filename + '.docx';
      return Promise.resolve(answerWith(m.example));
    };
    const label = DE['entry.renameFileMenu'];
    const foreignMenu = menuOf(w, 'f52').map(e => e.textContent);
    press(w.document.querySelector('.fmenu-list'), 'Escape');
    const ownMenu = menuOf(w, 'f49');
    check('„Umbenennen …“ steht im Menü „…“ der eigenen Datei, bei einer fremden nicht',
      ownMenu.some(e => e.textContent === label) && !foreignMenu.includes(label) && label === 'Umbenennen …',
      `${ownMenu.map(e => e.textContent).join(' | ')} / ${foreignMenu.join(' | ')}`);
    ownMenu.find(e => e.textContent === label)?.click();
    await until(w, (x) => x.document.querySelector('.modal #nb-name'), 1000, 'der Dialog').catch(() => {});
    const field = w.document.querySelector('.modal #nb-name');
    check('Der Dialog zeigt den Namen ohne Endung, die Endung steht fest dahinter',
      w.document.querySelector('.modal h2')?.textContent === DE['entry.renameFile'] && field?.value === 'bericht' &&
      w.document.querySelector('.modal .arename-ext')?.textContent === '.docx' && field?.getAttribute('maxlength') === '195' &&
      w.document.activeElement === field, w.document.querySelector('.modal')?.innerHTML.slice(0, 300));
    field.value = 'doppelt';
    press(field, 'Enter');
    await until(w, () => sent.length === 1 && !w.document.querySelector('.modal [data-yes]')?.disabled, 1000, 'die Ablehnung')
      .catch(() => {});
    check('Lehnt der Server ab, bleibt der Dialog offen und nennt den Grund',
      !!w.document.querySelector('.modal #nb-name') && w.document.body.textContent.includes('Schon da.'), sent.length);
    field.value = '  Bericht final ';
    press(field, 'Enter');
    await until(w, (x) => !x.document.querySelector('.modal'), 1000, 'das Schliessen').catch(() => {});
    check('Enter speichert den Namen ohne Endung; die Kachel zeigt den neuen Namen, der Fokus steht auf „…“',
      equal(sent, [{ filename: 'doppelt' }, { filename: 'Bericht final' }]) &&
      tileOf(w, 'f49')?.querySelector('.aname')?.textContent === 'Bericht final.docx' &&
      w.document.activeElement === tileOf(w, 'f49')?.querySelector('.amore'),
      `${JSON.stringify(sent)} ${tileOf(w, 'f49')?.querySelector('.aname')?.textContent} ${w.document.activeElement?.className}`);
    menuOf(w, 'f49').find(e => e.textContent === label)?.click();
    await until(w, (x) => x.document.querySelector('.modal #nb-name'), 1000, 'der Dialog').catch(() => {});
    press(w.document.querySelector('.modal #nb-name'), 'Escape');
    check('Esc bricht ab, ohne Anfrage; der Fokus geht zurueck auf „…“',
      !w.document.querySelector('.modal') && sent.length === 2 &&
      w.document.activeElement === tileOf(w, 'f49')?.querySelector('.amore'), w.document.activeElement?.className);
    w.close();
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
