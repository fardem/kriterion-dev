/* Kriterion — Pruefstand: Videos in Kommentaren, der Download je Foto und
   Video, die drei Fehler aus dem Betrieb, das Wort Backup, die englischen
   Bezeichnungen und die Grenzen beim Hochladen. */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  buildDom, until, openRequests
} = D;

async function run() {
  const {
   fs, os, path, crypto, sharp, __dirname, group, check, equal,
   BASE, DATA, open, call, shareMain, jar, withCsrf, shortRun
  } = H;
  await H.mainServerReady();
  let JSDOM = null;
  try { ({ JSDOM } = require('jsdom')); } catch { JSDOM = null; }

  /* ---- Helfer ---- */
  // Ein Multipart-Formular; ohne eigenes Cookie mit dem des Pruefers.
  async function send(url, fields = {}, files = [], cookieLine = H.cookie, method = 'POST') {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.append(k, String(v));
    for (const f of files) fd.append(f.field, new Blob([f.content], { type: f.type }), f.name);
    const a = await fetch(BASE + url, { method, body: fd, headers: withCsrf(cookieLine) });
    return { status: a.status, content: await a.json().catch(() => null) };
  }
  // Ein zweiter Zugang mit eigenem Cookie.
  async function account(username, role) {
    const password = `${username}-langes-wort-41`;
    await call('POST', '/api/users', { username, password, role });
    const a = await fetch(BASE + '/api/login', { method: 'POST',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user: username, password }) });
    let cookieLine = jar('', a);
    const as = async (method, url, body) => {
      const opt = { method, headers: withCsrf(cookieLine) };
      if (body !== undefined) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(body); }
      const r = await fetch(BASE + url, opt);
      cookieLine = jar(cookieLine, r);
      return { status: r.status, content: await r.json().catch(() => null) };
    };
    return { as, cookie: () => cookieLine };
  }
  // Ein MP4 nach den ersten Bytes; der Server kodiert es nicht um und spielt es nicht ab.
  const mp4 = (size = 4096) => {
    const b = crypto.randomBytes(size);
    Buffer.from([0, 0, 0, 0x20]).copy(b, 0);
    Buffer.from('ftypisom', 'latin1').copy(b, 4);
    return b;
  };
  const still = await sharp({ create: { width: 64, height: 48, channels: 3,
    background: { r: 40, g: 140, b: 90 } } }).png().toBuffer();
  const videoFiles = (video = mp4(), picture = still) => [
    { field: 'video', name: 'clip.mp4', type: 'video/mp4', content: video },
    { field: 'stillFrame', name: 'stillframe.jpg', type: 'image/png', content: picture }];
  const newItem = async (title) => (await call('POST', '/api/items', { title })).content.id;
  const rawOf = async (url, headers = {}) => {
    const a = await fetch(BASE + url, { headers: withCsrf(H.cookie, headers) });
    return { status: a.status, headers: a.headers, bytes: Buffer.from(await a.arrayBuffer()) };
  };
  const db = () => open(path.join(DATA, 'katalog.sqlite'));
  const DE = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'));
  const deText = (key, values = {}) =>
    String(DE[key]).replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

  /* ================= Die neue Tabelle an einer bestehenden Datenbank ================= */
  group('Kommentarvideos: die Tabelle kommt beim Start dazu');
  {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-kv-'));
    const file = path.join(dir, 'katalog.sqlite');
    const schemaOf = (d) => d.prepare(`SELECT type, name, sql FROM sqlite_master
      WHERE name NOT LIKE 'sqlite_%' ORDER BY name`).all();
    shortRun("require('./db'); console.log('ok');", dir);
    // Der Bestand einer Fassung ohne die Tabelle.
    let d = open(file);
    d.exec('DROP INDEX idx_comment_videos_comment; DROP TABLE comment_videos;');
    const before = schemaOf(d);
    d.close();
    check('Der Aufbau steht: der Bestand hat keine Tabelle comment_videos',
      !before.some(z => z.name === 'comment_videos') && before.length > 20, `${before.length} Eintraege`);
    shortRun("require('./db'); console.log('ok');", dir);
    d = open(file);
    const after = schemaOf(d);
    const columns = d.prepare('PRAGMA table_info(comment_videos)').all().map(c => c.name);
    d.close();
    check('Nach dem Start hat er die Tabelle comment_videos samt Index',
      after.some(z => z.name === 'comment_videos' && z.type === 'table') &&
      after.some(z => z.name === 'idx_comment_videos_comment' && z.type === 'index'),
      after.filter(z => /comment_videos/.test(z.name)).map(z => z.name).join(', ') || 'fehlt');
    check('Und data ist ihre letzte Spalte',
      columns[columns.length - 1] === 'data', columns.join(', '));
    const rest = after.filter(z => !/comment_videos/.test(z.name));
    check('Keine andere Tabelle und kein anderer Index hat sich geaendert',
      equal(rest, before), `${rest.length} vorher ${before.length}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }

  /* ================= Hochladen und Absagen ================= */
  group('Kommentarvideos: Hochladen und Absagen');
  const cvItem = await newItem('Kommentarvideos');
  const cvVideo = mp4(6000);
  const cvCreated = await send(`/api/items/${cvItem}/comments`,
    { text: 'Mit Video', duration: 7 }, videoFiles(cvVideo));
  const cvComment = (cvCreated.content?.comments || []).find(c => c.text === 'Mit Video');
  const cvRow = cvComment?.videos?.[0];
  check('Ein Kommentar nimmt ein Video mit Standbild an',
    cvCreated.status === 201 && !!cvRow, `${cvCreated.status} ${JSON.stringify(cvComment?.videos)}`);
  check('Und nennt es mit Dateiname und Dauer',
    cvRow?.filename === 'clip.mp4' && cvRow?.duration === 7, JSON.stringify(cvRow));
  {
    const d = db();
    const z = d.prepare('SELECT data, thumb FROM comment_videos WHERE id = ?').get(cvRow?.id ?? 0);
    d.close();
    check('Das Video liegt Byte fuer Byte so da, wie es kam',
      !!z && Buffer.compare(z.data, cvVideo) === 0, z ? `${z.data.length} Bytes` : 'keine Zeile');
    check('Und die Kachel ist aus dem Standbild entstanden',
      !!z?.thumb && (await sharp(z.thumb).metadata()).format === 'webp', z?.thumb ? 'da' : 'fehlt');
  }
  const cvNoStill = await send(`/api/items/${cvItem}/comments`, { text: 'Ohne Standbild' },
    [videoFiles()[0]]);
  check('Ohne Standbild wird abgesagt',
    cvNoStill.status === 400 && cvNoStill.content?.error === deText('server.videoStill'),
    `${cvNoStill.status} ${cvNoStill.content?.error}`);
  const cvLarge = await send(`/api/items/${cvItem}/comments`, { text: 'Zu gross' },
    videoFiles(mp4(20 * 1024 * 1024 + 1)));
  check('Ueber 20 MB wird abgesagt',
    cvLarge.status === 400 && cvLarge.content?.error === deText('server.uploadSize', { mb: 20 }),
    `${cvLarge.status} ${cvLarge.content?.error}`);
  const cvWrong = await send(`/api/items/${cvItem}/comments`, { text: 'Kein Video' },
    videoFiles(Buffer.from('kein Video, nur Text '.repeat(40))));
  check('Mit falschem Typ wird abgesagt',
    cvWrong.status === 400 && cvWrong.content?.error === deText('server.videosOnly'),
    `${cvWrong.status} ${cvWrong.content?.error}`);
  const sixImages = Array.from({ length: 6 }, (_, i) =>
    ({ field: 'images', name: `b${i}.png`, type: 'image/png', content: still }));
  const cvSeven = await send(`/api/items/${cvItem}/comments`, { text: 'Sieben' },
    [...sixImages, ...videoFiles()]);
  check('Als siebtes Bild oder Video wird abgesagt',
    cvSeven.status === 400 && cvSeven.content?.error === deText('server.imageCap', { cap: 6 }),
    `${cvSeven.status} ${cvSeven.content?.error}`);
  const cvTwo = await send(`/api/items/${cvItem}/comments`, { text: 'Zwei Videos' },
    [...videoFiles(), videoFiles()[0]]);
  check('Zwei Videos in einem Zug werden abgesagt',
    cvTwo.status === 400 && cvTwo.content?.error === deText('server.videoOne'),
    `${cvTwo.status} ${cvTwo.content?.error}`);
  // Das Nachreichen an einem bestehenden Kommentar zaehlt Bilder und Videos zusammen.
  const cvFive = await send(`/api/items/${cvItem}/comments`, { text: 'Fuenf Bilder' },
    sixImages.slice(0, 5));
  const cvFiveId = (cvFive.content?.comments || []).find(c => c.text === 'Fuenf Bilder')?.id;
  const cvLater = await send(`/api/comments/${cvFiveId}/videos`, { duration: 3 }, videoFiles());
  check('Ein Video laesst sich an einen bestehenden Kommentar haengen',
    cvLater.status === 201 &&
    (cvLater.content?.comments || []).find(c => c.id === cvFiveId)?.videos?.length === 1,
    `${cvLater.status} ${JSON.stringify(cvLater.content?.error || '')}`);
  const cvLaterSeven = await send(`/api/comments/${cvFiveId}/videos`, {}, videoFiles());
  check('Und das siebte wird dort ebenso abgesagt',
    cvLaterSeven.status === 400 && cvLaterSeven.content?.error === deText('server.imageCap', { cap: 6 }),
    `${cvLaterSeven.status} ${cvLaterSeven.content?.error}`);
  const bernd = await account('bernd', 'user');
  const cvStranger = await send(`/api/comments/${cvComment?.id}/videos`, {}, videoFiles(),
    bernd.cookie());
  check('An einen fremden Kommentar haengt niemand ein Video',
    cvStranger.status === 403, `${cvStranger.status}`);

  /* ================= Die Auslieferung ================= */
  group('Kommentarvideos: Auslieferung mit Range');
  {
    const url = `/api/comment-videos/${cvRow?.id}/raw`;
    const whole = await rawOf(url);
    check('Das Video kommt als video/mp4 und ganz',
      whole.status === 200 && whole.headers.get('content-type') === 'video/mp4' &&
      Buffer.compare(whole.bytes, cvVideo) === 0,
      `${whole.status} ${whole.headers.get('content-type')} ${whole.bytes.length}`);
    const part = await rawOf(url, { range: 'bytes=10-19' });
    check('Auf Range antwortet es mit 206 und Content-Range',
      part.status === 206 && part.headers.get('content-range') === `bytes 10-19/${cvVideo.length}` &&
      Buffer.compare(part.bytes, cvVideo.subarray(10, 20)) === 0,
      `${part.status} ${part.headers.get('content-range')}`);
    const bad = await rawOf(url, { range: `bytes=${cvVideo.length + 5}-` });
    check('Auf eine ungueltige Range mit 416',
      bad.status === 416 && bad.headers.get('content-range') === `bytes */${cvVideo.length}`,
      `${bad.status} ${bad.headers.get('content-range')}`);
    const tile = await rawOf(`${url}?size=thumb`);
    check('Und ?size=thumb liefert ein Bild',
      tile.status === 200 && /^image\//.test(tile.headers.get('content-type') || ''),
      `${tile.status} ${tile.headers.get('content-type')}`);
    check('Der Dateiname nennt das Video und seine Nummer',
      /filename="video-\d+\.mp4"/.test(whole.headers.get('content-disposition') || ''),
      whole.headers.get('content-disposition'));
  }

  /* ================= Loeschen ================= */
  group('Kommentarvideos: Loeschen und der Zaehler');
  {
    const anja = await account('anja', 'admin');
    const fresh = async (text) => {
      const r = await send(`/api/items/${cvItem}/comments`, { text }, videoFiles());
      const c = (r.content?.comments || []).find(z => z.text === text);
      return { comment: c?.id, video: c?.videos?.[0]?.id };
    };
    const removed = (commentId) => {
      const d = db();
      const n = d.prepare('SELECT images_removed AS n FROM comments WHERE id = ?').get(commentId)?.n;
      d.close();
      return n;
    };
    const a = await fresh('Loeschen durch den Verfasser');
    const own = await call('DELETE', `/api/comment-videos/${a.video}`);
    check('Der Verfasser loescht sein Video',
      own.status === 200 && removed(a.comment) === 0, `${own.status}, Zaehler ${removed(a.comment)}`);
    const b = await fresh('Loeschen durch den Admin');
    const foreign = await bernd.as('DELETE', `/api/comment-videos/${b.video}`);
    check('Ein anderer Benutzer bekommt 403', foreign.status === 403, `${foreign.status}`);
    const admin = await anja.as('DELETE', `/api/comment-videos/${b.video}`);
    check('Der Admin loescht es, und images_removed steigt',
      admin.status === 200 && removed(b.comment) === 1, `${admin.status}, Zaehler ${removed(b.comment)}`);
    const shown = (admin.content?.comments || []).find(c => c.id === b.comment);
    check('Die Antwort traegt den Zaehler als imagesRemoved',
      shown?.imagesRemoved === 1 && shown?.videos?.length === 0, JSON.stringify(shown?.imagesRemoved));
    check('Der Wortlaut am Bildschirm nennt Bild oder Video',
      DE['entry.imagesRemovedAdmin']?.one === '{n} Bild oder Video vom Admin entfernt' &&
      DE['entry.imagesRemovedAdmin']?.other === '{n} Bilder oder Videos vom Admin entfernt',
      JSON.stringify(DE['entry.imagesRemovedAdmin']));
  }

  /* ================= Rundlauf ================= */
  group('Kommentarvideos: Rundlauf mit Format 19');
  let rtFile = null;
  {
    await shareMain('export');
    const a = await fetch(`${BASE}/api/export?files=1`, { headers: withCsrf(H.cookie) });
    try { rtFile = JSON.parse(await a.text()); } catch { rtFile = null; }
    const item = rtFile?.items?.find(i => i.title === 'Kommentarvideos');
    const c = item?.comments?.find(z => z.text === 'Mit Video');
    check('Die Exportdatei traegt Format 19', rtFile?.version === 19, JSON.stringify(rtFile?.version));
    check('Der Kommentar traegt sein Video samt Standbild',
      c?.videos?.length === 1 && Buffer.from(c.videos[0].data_base64 || '', 'base64').equals(cvVideo) &&
      !!c.videos[0].still_base64 && c.videos[0].duration === 7,
      JSON.stringify(c?.videos?.map(v => Object.keys(v))));
    // Ohne den Schalter der Dateien stehen dort keine Videos.
    await shareMain('export');
    const b = await fetch(`${BASE}/api/export`, { headers: withCsrf(H.cookie) });
    const without = JSON.parse(await b.text());
    const c2 = without.items.find(i => i.title === 'Kommentarvideos')
      ?.comments?.find(z => z.text === 'Mit Video');
    check('Ohne den Schalter der Dateien bleibt die Liste leer',
      Array.isArray(c2?.videos) && c2.videos.length === 0, JSON.stringify(c2?.videos));
  }
  const importJson = async (payload) => {
    await shareMain('import');
    return send('/api/import', { mode: 'merge' }, [{ field: 'file', name: 'export.json',
      type: 'application/json', content: Buffer.from(JSON.stringify(payload)) }]);
  };
  {
    const one = { ...rtFile, items: rtFile.items.filter(i => i.title === 'Kommentarvideos')
      .map(i => ({ ...i, title: 'Kommentarvideos zurueck' })) };
    const back = await importJson(one);
    check('Die Datei kommt wieder herein', back.status === 200 && back.content?.commentVideos >= 1,
      `${back.status} ${JSON.stringify(back.content?.commentVideos ?? back.content?.error)}`);
    const list = (await call('GET', '/api/items')).content || [];
    const id = list.find(i => i.title === 'Kommentarvideos zurueck')?.id;
    const c = ((await call('GET', `/api/items/${id}`)).content?.comments || [])
      .find(z => z.text === 'Mit Video');
    const v = c?.videos?.[0];
    const bytes = v ? (await rawOf(`/api/comment-videos/${v.id}/raw`)).bytes : Buffer.alloc(0);
    const tile = v ? (await rawOf(`/api/comment-videos/${v.id}/raw?size=thumb`)).bytes : Buffer.alloc(0);
    const orig = (await rawOf(`/api/comment-videos/${cvRow?.id}/raw?size=thumb`)).bytes;
    check('Das Video kommt Byte fuer Byte gleich zurueck', bytes.equals(cvVideo),
      `${bytes.length} Bytes`);
    check('Samt Standbild, ebenfalls Byte fuer Byte', tile.length > 0 && tile.equals(orig),
      `${tile.length} und ${orig.length} Bytes`);
    check('Und mit Namen und Dauer', v?.filename === 'clip.mp4' && v?.duration === 7, JSON.stringify(v));
    // Eine Datei im Format 18 kennt das Feld nicht und kommt weiter herein.
    const old = { ...rtFile, version: 18, items: rtFile.items.filter(i => i.title === 'Kommentarvideos')
      .map(i => ({ ...i, title: 'Format 18', comments: i.comments.map(({ videos, ...rest }) => rest) })) };
    const r18 = await importJson(old);
    check('Eine Datei mit Format 18 kommt weiter herein',
      r18.status === 200 && r18.content?.items === 1, `${r18.status} ${JSON.stringify(r18.content?.error || '')}`);
    // Ein Video ohne lesbares Standbild wird uebergangen und gezaehlt.
    const broken = { ...rtFile, items: rtFile.items.filter(i => i.title === 'Kommentarvideos')
      .map(i => ({ ...i, title: 'Ohne Standbild', comments: i.comments.map(z => ({ ...z,
        videos: (z.videos || []).map(v2 => ({ ...v2, still_base64: Buffer.from('kein Bild').toString('base64') })) })) })) };
    const rb = await importJson(broken);
    check('Ein Video ohne lesbares Standbild wird uebergangen und gezaehlt',
      rb.status === 200 && rb.content?.commentVideos === 0 && rb.content?.videosUnreadable >= 1,
      JSON.stringify({ c: rb.content?.commentVideos, u: rb.content?.videosUnreadable }));
  }

  /* ================= Papierkorb ================= */
  group('Kommentarvideos: der Papierkorb');
  {
    const id = await newItem('In den Papierkorb');
    const v = mp4(5000);
    const r = await send(`/api/items/${id}/comments`, { text: 'Weg damit', duration: 4 }, videoFiles(v));
    const vid = (r.content?.comments || [])[0]?.videos?.[0]?.id;
    const tileBefore = (await rawOf(`/api/comment-videos/${vid}/raw?size=thumb`)).bytes;
    const gone = await call('DELETE', `/api/items/${id}`);
    const trashId = ((await call('GET', '/api/trash')).content?.rows || [])
      .find(z => z.title === 'In den Papierkorb')?.id;
    const d = db();
    const parts = d.prepare('SELECT data FROM trash_bytes WHERE trash_id = ?').all(trashId ?? 0)
      .map(z => z.data);
    d.close();
    check('Der Papierkorb nimmt den Eintrag', gone.status < 300 && !!trashId, `${gone.status} ${trashId}`);
    check('trash_bytes traegt Video und Standbild byte-gleich',
      parts.some(b => b.equals(v)) && parts.some(b => b.equals(tileBefore)),
      `${parts.length} Teile`);
    const back = await call('POST', `/api/trash/${trashId}/restore`);
    const c = ((await call('GET', `/api/items/${back.content?.itemId}`)).content?.comments || [])[0];
    const nv = c?.videos?.[0];
    const bytes = nv ? (await rawOf(`/api/comment-videos/${nv.id}/raw`)).bytes : Buffer.alloc(0);
    const tile = nv ? (await rawOf(`/api/comment-videos/${nv.id}/raw?size=thumb`)).bytes : Buffer.alloc(0);
    check('Das Zurueckholen stellt beide ohne Umkodieren her',
      back.status === 200 && bytes.equals(v) && tile.equals(tileBefore),
      `${back.status} ${bytes.length}/${tile.length}`);
  }

  /* ================= Am Bildschirm ================= */
  group('Kommentarvideos am Bildschirm');
  if (!JSDOM) check('jsdom steht bereit', false, 'npm install');
  else {
    const who = { id: 1, name: 'chefin', deleted: false };
    const dm = buildDom(JSDOM, { hash: '#/item/1', commentInventory: [
      { id: 90, text: 'Mit Bild und Video', kind: 'note', pinned: false, author: who, mine: true,
        imagesRemoved: 0, created_at: '2026-09-20 09:00:00', updated_at: null,
        images: [{ id: 71, filename: 'a.jpg', sort_order: 0 }],
        videos: [{ id: 91, filename: 'v.mp4', duration: 65, sort_order: 0 }] }] });
    const w = dm.w;
    await until(w, (x) => x.document.querySelector('.cmt-imgs .cmt-img') && openRequests(x) === 0,
      2000, 'die Kacheln des Kommentars');
    const tiles = [...w.document.querySelectorAll('.cmt-imgs .cmt-img')];
    check('Die Videokachel steht hinter dem Bild', tiles.length === 2 &&
      !tiles[0].classList.contains('is-video') && tiles[1].classList.contains('is-video'),
      tiles.map(k => k.className).join(' | '));
    check('Mit dem Abspielzeichen und der Laenge', !!tiles[1]?.querySelector('.play-badge') &&
      tiles[1]?.querySelector('.duration')?.textContent === '1:05',
      tiles[1]?.innerHTML?.slice(0, 160));
    check('Die Kachel ist das Bild aus dem Standbild',
      tiles[1]?.querySelector('img')?.getAttribute('src') === '/api/comment-videos/91/raw?size=thumb',
      tiles[1]?.querySelector('img')?.getAttribute('src'));
    check('Beim Verfasser traegt sie das Kreuz mit dem Wort Video',
      tiles[1]?.querySelector('.del')?.title === DE['entry.deleteVideo'], tiles[1]?.querySelector('.del')?.title);
    check('Der Knopf im Schreibfeld heisst „+ Bild/Video"',
      w.document.getElementById('cimg')?.textContent === '+ Bild/Video',
      w.document.getElementById('cimg')?.textContent);
    tiles[1]?.querySelector('img')?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await until(w, (x) => x.document.querySelector('.lightbox'), 2000, 'die Bildansicht');
    const lb = w.document.querySelector('.lightbox');
    check('Ein Klick oeffnet die Bildansicht mit dem Abspieler',
      !!lb && !lb.querySelector('.lb-video')?.hidden &&
      lb.querySelector('.lb-video')?.getAttribute('src') === '/api/comment-videos/91/raw',
      lb?.querySelector('.lb-video')?.getAttribute('src'));
    check('Und das Standbild ist das Poster',
      lb?.querySelector('.lb-video')?.getAttribute('poster') === '/api/comment-videos/91/raw?size=thumb',
      lb?.querySelector('.lb-video')?.getAttribute('poster'));
    lb?.querySelector('.close')?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    w.close();
  }

  /* ================= Der Download ================= */
  group('Download je Foto und Video in der Bildansicht');
  if (JSDOM) {
    const who = { id: 1, name: 'chefin', deleted: false };
    const dm = buildDom(JSDOM, { hash: '#/item/1', commentInventory: [
      { id: 90, text: 'Mit Bild und Video', kind: 'note', pinned: false, author: who, mine: true,
        imagesRemoved: 0, created_at: '2026-09-20 09:00:00', updated_at: null,
        images: [{ id: 71, filename: 'a.jpg', sort_order: 0 }],
        videos: [{ id: 91, filename: 'v.mp4', duration: 5, sort_order: 0 }] }] });
    const w = dm.w;
    await until(w, (x) => x.document.querySelector('.cmt-imgs .cmt-img') && openRequests(x) === 0,
      2000, 'die Kacheln des Kommentars');
    const linkOf = () => {
      const a = w.document.querySelector('.lightbox .lb-tools .download');
      const out = a ? { href: a.getAttribute('href'), download: a.hasAttribute('download'),
        title: a.title, text: a.textContent } : null;
      w.document.querySelector('.lightbox .close')?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      return out;
    };
    w.openLightbox([{ id: 5, kind: 'image' }], 0, 'Beispiel');
    const photo = linkOf();
    w.openLightbox([{ id: 6, kind: 'video' }], 0, 'Beispiel');
    const video = linkOf();
    const tiles = () => [...w.document.querySelectorAll('.cmt-imgs .cmt-img img')];
    tiles()[0]?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const image = linkOf();
    tiles()[1]?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const cvideo = linkOf();
    const good = (l, url) => !!l && l.href === url && l.download;
    check('Das Foto: ein Link mit download auf das Original', good(photo, '/api/photos/5/raw'),
      JSON.stringify(photo));
    check('Das Video am Eintrag ebenso', good(video, '/api/photos/6/raw'), JSON.stringify(video));
    check('Das Kommentarbild', good(image, '/api/comment-images/71/raw'), JSON.stringify(image));
    check('Das Kommentarvideo', good(cvideo, '/api/comment-videos/91/raw'), JSON.stringify(cvideo));
    check('Zeichen und Titel wie am Anhang',
      photo?.text === '↓' && photo?.title === DE['entry.download'], JSON.stringify(photo));
    w.close();
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
