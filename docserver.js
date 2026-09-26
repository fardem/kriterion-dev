/* Anzeige von Bueroformaten ueber Euro-Office oder OnlyOffice. Kriterion
   signiert die Konfiguration des Betrachters; der Document Server holt die
   Datei mit eigenem JWT im Header. */
const crypto = require('crypto');
const auth = require('./auth');
const { extension } = require('./attachments');
const { logLine, logWarn } = require('./log');

const OFFICE_TYPES = {
  docx: 'word', doc: 'word', odt: 'word', rtf: 'word',
  xlsx: 'cell', xls: 'cell', ods: 'cell',
  pptx: 'slide', ppt: 'slide', odp: 'slide'
};

const readAddress = (name) => auth.checkPublicAddress(auth.fromEnv(name));
const ADDRESS = readAddress('DOCUMENT_SERVER_ADDRESS');
const INTERNAL = readAddress('DOCUMENT_SERVER_INTERNAL_ADDRESS');
const FETCH = readAddress('INTERNAL_ADDRESS');
const SECRET = String(auth.fromEnv('DOCUMENT_SERVER_SECRET') || '').trim();
// Euro-Office verlangt fuer HS256 mindestens 32 Zeichen.
const SECRET_MIN = 32;

const internalBase = () => INTERNAL.address || ADDRESS.address;
const fetchBase = () => FETCH.address || auth.PUBLIC_ADDRESS.address;

// Schluessel und Werte fuer t(); die Sprachproben lesen `message(` als Ruf.
const message = (key, values = {}) => ({ key, values });

// null oder was in der .env fehlt.
function setupProblem() {
  if (!ADDRESS.address) return message('server.docNoAddress');
  if (!SECRET) return message('server.docNoSecret');
  if (!fetchBase()) return message('server.docFetchUnset');
  return null;
}

const officeType = (filename) => OFFICE_TYPES[extension(filename)] || null;
const scriptOrigin = () => ADDRESS.address ? new URL(ADDRESS.address).origin : '';
const apiScript = () => `${ADDRESS.address}/web-apps/apps/api/documents/api.js`;

/* ---- JWT ---- */
const part = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const mac = (secret, text) => crypto.createHmac('sha256', secret).update(text).digest();
const HEAD = part({ 'alg': 'HS256', 'typ': 'JWT' });

function signWith(secret, payload) {
  const head = HEAD + '.' + part(payload);
  return head + '.' + mac(secret, head).toString('base64url');
}

// Spielraum fuer abweichende Uhren der beiden Container, in Sekunden.
const LEEWAY_S = 60;

function verifyWith(secret, token, nowS = Math.floor(Date.now() / 1000)) {
  if (!token) return { ok: false, reason: 'missing' };
  const parts = String(token).split('.');
  if (parts.length !== 3) return { ok: false, reason: 'form' };
  let head, payload;
  try {
    head = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch { return { ok: false, reason: 'form' }; }
  if (!head || typeof head !== 'object' || !payload || typeof payload !== 'object')
    return { ok: false, reason: 'form' };
  if (head.alg !== 'HS256') return { ok: false, reason: 'alg' };
  const want = mac(secret, parts[0] + '.' + parts[1]);
  const got = Buffer.from(parts[2], 'base64url');
  if (got.length !== want.length || !crypto.timingSafeEqual(got, want))
    return { ok: false, reason: 'signature' };
  if (typeof payload.exp !== 'number') return { ok: false, reason: 'noExp' };
  if (payload.exp + LEEWAY_S < nowS) return { ok: false, reason: 'expired' };
  return { ok: true, payload };
}

const sign = (payload) => signWith(SECRET, payload);

// Fuer die Karte; `fallback` nennt die Variable, deren Wert ersatzweise gilt.
function state() {
  const problem = setupProblem();
  return {
    rows: [
      { name: 'DOCUMENT_SERVER_ADDRESS', value: ADDRESS.address, fallback: null },
      { name: 'DOCUMENT_SERVER_INTERNAL_ADDRESS', value: internalBase(),
        fallback: INTERNAL.address ? null : 'DOCUMENT_SERVER_ADDRESS' },
      { name: 'INTERNAL_ADDRESS', value: fetchBase(),
        fallback: FETCH.address ? null : 'PUBLIC_ADDRESS' }
    ],
    secret: !!SECRET, setup: problem ? problem.key : null
  };
}

/* ---- Abruf durch den Document Server ---- */
let lastTestFetch = null;

function checkFetch(req) {
  if (setupProblem()) return { ok: false, reason: 'setup' };
  const m = /^Bearer\s+(\S+)$/i.exec(String(req.headers.authorization || '').trim());
  const v = verifyWith(SECRET, m ? m[1] : '');
  if (!v.ok) return v;
  const inner = v.payload.payload && typeof v.payload.payload === 'object' ? v.payload.payload : {};
  const url = inner.url || v.payload.url;
  // Ueber fetchBase, damit ein Pfad in der Adresse mitgerechnet wird.
  let same = false;
  try { same = new URL(String(url)).pathname === new URL(fetchBase() + req.path).pathname; }
  catch { same = false; }
  return same ? { ok: true } : { ok: false, reason: 'url' };
}

function recordTestFetch(result) {
  lastTestFetch = { at: Date.now(), ok: result.ok, reason: result.reason || null };
}

/* ---- Konfiguration des Betrachters ---- */
const fileUrl = (id) => `${fetchBase()}/api/document-server/attachments/${Number(id)}`;

// Der Document Server haelt seinen Zwischenspeicher nach diesem Schluessel.
function documentKey(attachment) {
  const text = `${fileUrl(attachment.id)}|${attachment.created_at}|${attachment.size}`;
  return mac(SECRET, text).toString('hex').slice(0, 40);
}

function viewerConfig(attachment, { lang, mobile }) {
  const config = {
    document: {
      fileType: extension(attachment.filename),
      key: documentKey(attachment),
      title: attachment.filename,
      url: fileUrl(attachment.id),
      permissions: { edit: false, comment: false, review: false, download: false, print: true }
    },
    documentType: officeType(attachment.filename),
    editorConfig: { mode: 'view', lang },
    type: mobile ? 'mobile' : 'desktop',
    width: '100%', height: '100%'
  };
  return { ...config, token: sign(config) };
}

/* ---- Pruefung der Verbindung ---- */
const HEALTH_MS = 5000;
const CONVERT_MS = 20000;

async function convert(base, where, body) {
  const r = await fetch(base + where, {
    method: 'POST', body, signal: AbortSignal.timeout(CONVERT_MS),
    headers: { 'content-type': 'application/json', accept: 'application/json' }
  });
  let json = null;
  try { json = JSON.parse(await r.text()); } catch { json = null; }
  return { status: r.status, json };
}

async function check() {
  const problem = setupProblem();
  if (problem) return problem;
  const base = internalBase();
  const unreachable = message('server.docUnreachable', { address: base });
  try {
    const r = await fetch(base + '/healthcheck', { signal: AbortSignal.timeout(HEALTH_MS) });
    if (!r.ok || (await r.text()).trim() !== 'true') return unreachable;
  } catch { return unreachable; }

  const fields = {
    async: false, filetype: 'txt', outputtype: 'docx',
    key: 'probe-' + crypto.randomBytes(16).toString('hex'), title: 'probe.txt',
    url: `${fetchBase()}/api/document-server/probe`
  };
  const body = JSON.stringify({ ...fields, token: sign(fields) });
  lastTestFetch = null;
  let answer;
  try {
    answer = await convert(base, '/converter', body);
    // Aeltere Fassungen kennen nur diesen Pfad.
    if (answer.status === 404) answer = await convert(base, '/ConvertService.ashx', body);
  } catch { return unreachable; }

  const j = answer.json || {};
  if (j.endConvert === true) return message('server.docReady', { address: fetchBase() });
  if (j.error === -8) return message('server.docSecretRejected');
  if (j.error === -4 && lastTestFetch && !lastTestFetch.ok)
    return message('server.docTokenRejected', { reason: lastTestFetch.reason });
  if (j.error === -4 && !lastTestFetch)
    return message('server.docCannotFetch', { address: fetchBase() });
  return message('server.docError', { code: j.error ?? answer.status });
}

/* ---- Start ---- */
function logStart() {
  for (const [name, a] of [['DOCUMENT_SERVER_ADDRESS', ADDRESS],
                           ['DOCUMENT_SERVER_INTERNAL_ADDRESS', INTERNAL],
                           ['INTERNAL_ADDRESS', FETCH]])
    if (a.problem) logWarn(`${name} is unusable: ${a.problem} It counts as empty.`);
  const problem = setupProblem();
  if (!ADDRESS.address) return logLine('Document server: not set up.');
  if (problem) return logWarn(`Document server: ${ADDRESS.address}, but ${
    problem.key === 'server.docNoSecret' ? 'DOCUMENT_SERVER_SECRET' : 'INTERNAL_ADDRESS and PUBLIC_ADDRESS'
  } missing -- documents are not shown through it.`);
  logLine(`Document server: ${ADDRESS.address}, reached at ${internalBase()}, ` +
    `fetches files from ${fetchBase()}.`);
  if (SECRET.length < SECRET_MIN)
    logWarn(`DOCUMENT_SERVER_SECRET has ${SECRET.length} characters; ` +
      `Euro-Office expects at least ${SECRET_MIN} for HS256.`);
  if (auth.BEHIND_PROXY && ADDRESS.address.startsWith('http://'))
    logWarn('Behind a proxy and still http:// in DOCUMENT_SERVER_ADDRESS -- ' +
      'the browser does not load the viewer from there.');
}

module.exports = {
  OFFICE_TYPES, officeType, setupProblem, scriptOrigin, apiScript, state,
  internalBase, fetchBase, signWith, verifyWith, checkFetch, recordTestFetch,
  documentKey, viewerConfig, check, logStart, LEEWAY_S
};
