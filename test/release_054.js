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

  group('Bilder: Format, Pixel, EXIF und das Nachlesen');
  {
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    const until2 = async (test, ms = 8000) => {
      for (const t0 = Date.now(); Date.now() - t0 < ms; await wait(100)) if (await test()) return true;
      return false;
    };
    const camera = await H.sharp({ create: { width: 400, height: 300, channels: 3, background: '#468' } }).jpeg()
      .withMetadata({ orientation: 6 })
      .withExif({ IFD0: { Make: 'Canon', Model: 'Canon EOS 20D', DateTime: '2020:04:26 10:00:00' },
        IFD2: { DateTimeOriginal: '2020:04:25 14:22:11', FNumber: '28/10', ExposureTime: '1/125', ISOSpeedRatings: '400',
          FocalLength: '50/1', FocalLengthIn35mmFilm: '80', LensModel: 'EF50mm f/1.8 II' },
        IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '52/1 30/1 0/1', GPSLongitudeRef: 'E', GPSLongitude: '13/1 24/1 0/1' } })
      .toBuffer();
    const plain = await H.sharp({ create: { width: 40, height: 30, channels: 3, background: '#864' } }).png().toBuffer();
    const p = await newItem('Eintrag Bilder');
    await upload('owner', p, [{ name: 'kamera.jpg', content: camera }, { name: 'grafik.png', content: plain }]);
    const files = () => filesOf(p);
    await until2(async () => (await files()).every(f => f.infoSoon === false));
    const [jpg, png] = ['kamera.jpg', 'grafik.png'].map(async n => (await files()).find(f => f.filename === n));
    const j = await jpg, g = await png;
    check('Bilder tragen Format und Pixel; bei Ausrichtung 6 wie angezeigt: 300 × 400',
      j?.codec === 'JPEG' && j?.width === 300 && j?.height === 400 && g?.codec === 'PNG' && g?.width === 40 && g?.height === 30,
      JSON.stringify([j, g].map(f => f && [f.codec, f.width, f.height, f.infoSoon])));
    const info = await as('zweit', 'GET', `/api/attachments/${j?.id}/info`);
    const stored = inDb(d => d.prepare('SELECT info FROM attachment_media WHERE attachment_id = ?').get(j?.id)?.info || '');
    check('EXIF: Zeit, Kamera, Objektiv, Belichtung, Blende, ISO, Brennweite mit Kleinbild; GPS nur als ja',
      equal(info.content?.exif, { taken: '2020-04-25 14:22:11', camera: 'Canon EOS 20D', lens: 'EF50mm f/1.8 II',
        exposure: 0.008, aperture: 2.8, iso: 400, focal: 50, focal35: 80, gps: true }) && info.content?.orientation === 6,
      JSON.stringify(info.content?.exif));
    check('Die Koordinaten stehen nirgends in der Datenbank',
      stored.includes('"gps":true') && !/GPS|Latitude|Longitude|52\.5|13\.4/.test(stored), stored.slice(0, 200));
    const pngInfo = (await as('zweit', 'GET', `/api/attachments/${g?.id}/info`)).content;
    check('Ohne EXIF: `exif` ist null, `orientation` steht trotzdem da',
      pngInfo?.exif === null && 'orientation' in (pngInfo || {}), JSON.stringify(pngInfo).slice(0, 200));

    const old = (info) => { const o = JSON.parse(info); delete o.orientation; delete o.exif; return JSON.stringify(o); };
    inDb(d => d.prepare('UPDATE attachment_media SET info = ? WHERE attachment_id = ?').run(old(stored), j?.id));
    const again = await as('zweit', 'GET', `/api/attachments/${j?.id}/info`);
    check('Eine Zeile aus der Zeit vor EXIF liest der Server bei „Erweiterte Infos“ neu',
      again.content?.exif?.camera === 'Canon EOS 20D' && again.content?.orientation === 6 &&
      JSON.parse(inDb(d => d.prepare('SELECT info FROM attachment_media WHERE attachment_id = ?').get(j?.id).info)).orientation === 6,
      JSON.stringify(again.content).slice(0, 160));
    const clip = inDb(d => Number(d.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, user_id)
      VALUES (?, 'alt.mp4', 'video/mp4', 4, x'00000000', 1)`).run(p).lastInsertRowid));
    const clipInfo = { general: { format: 'MPEG-4' }, video: [{ format: 'AVC' }], audio: [], image: [] };
    inDb(d => d.prepare('INSERT INTO attachment_media (attachment_id, info) VALUES (?, ?)').run(clip, JSON.stringify(clipInfo)));
    check('Ein Video mit alter Zeile liest er nicht neu',
      equal((await as('zweit', 'GET', `/api/attachments/${clip}/info`)).content, clipInfo), 'Video');

    const send = async (url, list) => {
      const fd = new FormData();
      for (const f of list) fd.append(f.field, new Blob([f.content], { type: f.type }), f.name);
      const a = await fetch(B.base + url, { method: 'POST', body: fd, headers: withCsrf(cookies.owner, {}) });
      return { status: a.status, content: await a.json().catch(() => null) };
    };
    const up = await send(`/api/items/${p}/photos`, [{ field: 'photos', name: 'foto.jpg', type: 'image/jpeg', content: camera }]);
    const photo = (up.content?.photos || [])[0];
    const photoInfo = await as('zweit', 'GET', `/api/photos/${photo?.id}/info`);
    check('Fotos des Eintrags: dieselben Angaben aus EXIF',
      up.status === 201 && photoInfo.content?.exif?.camera === 'Canon EOS 20D' && photoInfo.content?.orientation === 6,
      `${up.status} ${JSON.stringify(photoInfo.content?.exif)}`);
    inDb(d => {
      const row = d.prepare('SELECT info FROM photo_media WHERE photo_id = ?').get(photo?.id);
      d.prepare('UPDATE photo_media SET info = ? WHERE photo_id = ?').run(old(row.info), photo?.id);
      d.prepare('UPDATE attachment_media SET info = ? WHERE attachment_id = ?').run(old(stored), j?.id);
    });
    await B.stop();
    const B2 = H.startFurtherServer(dir, {}, 7340);
    await B2.ready;
    const readAgain = await until2(() => inDb(d => {
      const f = d.prepare('SELECT info FROM attachment_media WHERE attachment_id = ?').get(j?.id)?.info;
      const ph = d.prepare('SELECT info FROM photo_media WHERE photo_id = ?').get(photo?.id)?.info;
      return f && ph && JSON.parse(f).orientation === 6 && JSON.parse(ph).orientation === 6;
    }), 10000);
    check('Nach dem Start liest die Warteschlange alte Zeilen von Bildern und Fotos einmal nach',
      readAgain && !('orientation' in JSON.parse(inDb(d => d.prepare('SELECT info FROM attachment_media WHERE attachment_id = ?')
        .get(clip).info))), 'Nachlesen');
    await B2.stop();
  }

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

  group('Bilder: Typ, Vorschaubild und Erweiterte Infos');
  {
    const image = (id, filename, more = {}) => file(id, filename, 2000, '2026-08-05 10:00:00',
      { mime_type: 'image/jpeg', preview: 'image', ...more });
    const m = buildDom(JSDOM, { hash: '#/item/1', extraAttachments: [
      image(60, 'hoch.jpg', { codec: 'JPEG', width: 3024, height: 4032 }), image(61, 'bild.png', { codec: 'PNG', width: 1920, height: 1080 }),
      image(62, 'neu.avif', { codec: 'avif', width: 10, height: 10 }), image(63, 'ohne.png')], settings: { filters: null, userCount: 1 } });
    const w = m.w;
    await settle(w, 8);
    const codecs = ['f60', 'f61', 'f62', 'f63'].map(k => tileOf(w, k)?.querySelector('.acodec')?.textContent ?? '');
    check('Am Vorschaubild steht das Format: JPEG, PNG, AVIF; ohne Angaben nichts',
      equal(codecs, ['JPEG', 'PNG', 'AVIF', '']), codecs.join(' | '));
    w.document.querySelector('.aview-btn[data-view="list"]')?.click();
    await until(w, () => openRequests(w) === 0, 2000, 'die Liste').catch(() => {});
    const kinds = ['f60', 'f61', 'f62', 'f63'].map(k => tileOf(w, k)?.querySelector('.akind')?.textContent);
    check('In der Spalte „Typ“: „PNG · 1920 × 1080“; ohne Angaben „Bild“',
      equal(kinds, ['JPEG · 3024 × 4032', 'PNG · 1920 × 1080', 'AVIF · 10 × 10', DE['entry.kindImage']]), kinds.join(' | '));
    check('Die Beschriftung der Zeile nennt Format und Pixel',
      (tileOf(w, 'f61')?.querySelector('.aface')?.getAttribute('aria-label') || '').includes('PNG · 1920 × 1080'),
      tileOf(w, 'f61')?.querySelector('.aface')?.getAttribute('aria-label'));

    const facts = { general: { format: 'JPEG', size: 2000, recorded: '2020-04-25 14:22:11' }, video: [], audio: [],
      image: [{ format: 'JPEG', width: 4032, height: 3024, bitDepth: 8 }, { format: 'JPEG', width: 256, height: 205 },
        { format: 'JPEG', width: 256, height: 205 }], orientation: 6,
      exif: { taken: '2020-04-25 14:22:11', camera: 'Canon EOS 20D', lens: 'EF50mm f/1.8 II', exposure: 0.008, aperture: 2.8,
        iso: 400, focal: 50, focal35: 80, gps: true } };
    const two = { ...facts, image: [facts.image[0], { format: 'JPEG', width: 256, height: 205 }, { format: 'JPEG', width: 160, height: 120 }],
      orientation: 1, exif: { exposure: 2, focal: 35 } };
    const base = w.fetch;
    w.fetch = (url, opt) => {
      if (/\/api\/attachments\/60\/info$/.test(url)) return Promise.resolve(answerWith(facts));
      if (/\/api\/attachments\/61\/info$/.test(url)) return Promise.resolve(answerWith(two));
      return base(url, opt);
    };
    const dialog = async (key) => {
      menuOf(w, key).find(e => e.textContent === DE['entry.mediaInfo'])?.click();
      await until(w, (x) => x.document.querySelector('.modal.minfo .kv'), 1000, 'die Angaben').catch(() => {});
      const modal = w.document.querySelector('.modal.minfo');
      const out = { heads: [...(modal?.querySelectorAll('.minfo-head') || [])].map(e => e.textContent),
        rows: [...(modal?.querySelectorAll('.kv') || [])].map(r => `${r.querySelector('.k').textContent}: ${r.querySelector('.v').textContent}`) };
      press(w.document.body, 'Escape');
      return out;
    };
    const one = await dialog('f60');
    check('Eine Gruppe „Bild“ für das Hauptbild, darin die Vorschaubilder der Datei',
      equal(one.heads, [DE['entry.mediaGeneral'], DE['entry.kindImage'], DE['entry.mediaShot']]) &&
      one.rows.includes(`${DE['entry.mediaThumbs']}: 2 (256 × 205)`) && DE['entry.mediaThumbs'] === 'Vorschaubilder in der Datei',
      one.heads.join(' | '));
    check('Pixel bei Ausrichtung 6 wie angezeigt: 3024 × 4032',
      one.rows.includes(`${DE['entry.mediaResolution']}: 3024 × 4032`), one.rows.join(' | '));
    const shot = one.rows.slice(one.rows.indexOf(`${DE['entry.mediaTaken']}: 25.04.2020, 14:22`));
    check('„Aufnahme“: Zeit, Kamera, Objektiv, „1/125 s“, „f/2,8“, ISO, Brennweite mit Kleinbild, Ort nur als „ja“',
      equal(shot, ['Aufnahmezeit: 25.04.2020, 14:22', 'Kamera: Canon EOS 20D', 'Objektiv: EF50mm f/1.8 II',
        'Belichtungszeit: 1/125 s', 'Blende: f/2,8', 'ISO: 400', 'Brennweite: 50 mm (Kleinbild 80 mm)', 'Ort in der Datei: ja']),
      shot.join(' | '));
    check('Mit Aufnahmezeit aus EXIF entfällt „Aufnahmedatum“ unter „Allgemein“',
      !one.rows.some(r => r.startsWith(`${DE['entry.mediaRecorded']}:`)), one.rows.slice(0, 4).join(' | '));
    const other = await dialog('f61');
    check('Verschiedene Vorschaubilder stehen alle da; „2 s“ und Brennweite ohne Kleinbild',
      other.rows.includes(`${DE['entry.mediaThumbs']}: 2 (256 × 205, 160 × 120)`) && other.rows.includes('Belichtungszeit: 2 s') &&
      other.rows.includes('Brennweite: 35 mm') && other.rows.includes(`${DE['entry.mediaResolution']}: 4032 × 3024`) &&
      other.rows.some(r => r.startsWith(`${DE['entry.mediaRecorded']}:`)), other.rows.join(' | '));
    w.close();
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
