/* Kriterion — Pruefstand: der Rahmen der Oberflaechenpruefungen buildDom()
   baut ein vollstaendiges jsdom-Fenster mit einem gestellten Server dahinter. */
const H = require('./frame.js');

module.exports = (function (__dirname, require) {
const {
  fs, os, path, attachments, TEXT, BASE_SOURCE, BASE_SCRIPT, group,
  check, equal, BASE, open, shortRun, names
} = H;

/* ================= Oberflaeche (echtes DOM) ================= */
// Baut eine Oberflaeche im echten DOM auf.
/* Das Passwort der Prueflage fuer die zweite Bestaetigung. */
const DOM_PASSWORD = 'chefinnen-langes-wort';

/* Das Sicherheitsprotokoll der Prueflage. */
/* `zahlen` SEIT 0.13.0: die Zahlen an den Filterpillen. */
const DOM_LOG = {
  days: 180, limit: 100, total: 7,
  counts: { all: 7, failed: 2, logins: 1, users: 3, twofactor: 0, inventory: 1 },
  rows: [
    { id: 7, at: '2026-08-24 09:15:00', event: 'user.role', actor: 1, actorName: 'chefin',
      target: 2, targetName: 'bert', detail: 'admin' },
    { id: 6, at: '2026-08-24 08:00:00', event: 'export', actor: 1, actorName: 'chefin',
      target: null, targetName: null, detail: null },
    { id: 5, at: '2026-08-23 22:40:00', event: 'user.password', actor: null, actorName: null,
      target: 3, targetName: 'carla', detail: null },
    { id: 4, at: '2026-08-23 21:05:00', event: 'login.fail', actor: null, actorName: null,
      target: null, targetName: null, detail: null }
  ]
};

/* DIE GRUPPEN DES PROTOKOLLFILTERS FUER DEN MOCK -- GELESEN und nicht
   abgeschrieben. */
const DOM_PROT_GROUPS = (() => {
  const q = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-protgruppen-'));
  const g = JSON.parse(shortRun(
    `console.log(JSON.stringify(require('./auth').LOG_GROUPS));`, q));
  fs.rmSync(q, { recursive: true, force: true });
  return g;
})();

/* Fuellt den Dialog der zweiten Bestaetigung und drueckt den Knopf. */
/* DIE RUECKFRAGE AUS confirmBox() BEANTWORTEN -- 0.22.0. */
function placeConfirm(w, ja = true, transcript = null) {
  const observer = new w.MutationObserver(() => {
    for (const bd of w.document.querySelectorAll('.backdrop')) {
      const modal = bd.querySelector('.modal');
      if (!modal || modal.querySelector('input, textarea, select') || bd.dataset.staged) continue;
      const button = modal.querySelector(ja ? '[data-yes]' : '[data-no]');
      if (!button) continue;
      bd.dataset.staged = '1';
      if (transcript) transcript.push(modal.textContent.replace(/\s+/g, ' ').trim());
      button.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    }
  });
  observer.observe(w.document.body, { childList: true, subtree: true });
  return observer;
}

async function confirmImDom(d, password = 'chefinnen-langes-wort', cancel = false, code) {
  const field = d.w.document.getElementById('confirm-pass');
  if (!field) return false;
  const button = field.closest('.modal')?.querySelector(cancel ? '[data-no]' : '[data-yes]');
  if (!button) return false;
  field.value = password;
  // Das Codefeld steht nur bei Zugaengen mit zweitem Faktor da.
  const codeField = d.w.document.getElementById('confirm-code');
  if (codeField && code !== undefined) codeField.value = code;
  const before = d.sent.length;
  button.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
  if (cancel) {
    // Wartet, ob nach dem Abbruch eine Anfrage ausbleibt.
    await new Promise(r => setTimeout(r, 20));
    return true;
  }
  await until(d.w, (x) => x.document.getElementById('confirm-pass') !== field &&
    d.sent.length > before && openRequests(x) === 0, 3000, 'die Antwort auf die Bestaetigung');
  return true;
}

const DOM_PROVIDER = [
  { key: 'google', name: 'Google', template: 'https://www.google.com/search?q=%s',
    own: false, present: true, active: false, isDefault: false },
  { key: 'bing', name: 'Bing', template: 'https://www.bing.com/search?q=%s',
    own: false, present: true, active: true, isDefault: false },
  { key: 'ddg', name: 'DuckDuckGo', template: 'https://duckduckgo.com/?q=%s',
    own: false, present: true, active: false, isDefault: false },
  { key: 'startpage', name: 'Startpage', template: 'https://www.startpage.com/sp/search?query=%s',
    own: false, present: true, active: true, isDefault: true },
  { key: 'brave', name: 'Brave Search', template: 'https://search.brave.com/search?q=%s',
    own: false, present: true, active: false, isDefault: false },
  { key: 'ecosia', name: 'Ecosia', template: 'https://www.ecosia.org/search?q=%s',
    own: false, present: true, active: false, isDefault: false },
  { key: 'eigen1', name: 'Forum <b>X</b>', template: 'https://forum.beispiel.de/suche?q=%s',
    own: true, present: true, active: true, isDefault: false },
  { key: 'eigen2', name: '', template: '', own: true, present: false, active: false, isDefault: false },
  { key: 'eigen3', name: '', template: '', own: true, present: false, active: false, isDefault: false }
];

/* criteriaWeights und ownValues sind die beiden Stellschrauben der
   Gewichtung. */
/* DIESELBE ZUORDNUNG WIE `HINTS` IN mail.js, und sie steht hier, weil der
   Nachbau den Server nicht fragen kann. Die TEXTE stehen nicht hier. */
const MAIL_HINT_KEYS = { gmail: 'mail.hintGmail', gmx: 'mail.hintGmx', web: 'mail.hintWebDe' };
const DE_TEXTS = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'));
// Prueft einen Oberflaechentext ueber seinen Schluessel; Platzhalter werden uebersprungen.
const shows = (text, key) => {
  const flat = String(text || '').replace(/\s+/g, ' ');
  const parts = String(DE_TEXTS[key] ?? '').split(/\{[^}]*\}/)
    .map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  return parts.length > 0 && parts.every(p => flat.includes(p));
};

function buildDom(JSDOM, { withoutLanguage = false, settings = { filters: null }, hash = '', tags = [], overviewItems = null, setup = false, loggedIn = true, users = null, testDays = null, secondEntry = null, criteriaWeights = [1.5, 1, 0.5], ownValues = [3, 3, 3], withoutRating = false,
  /* ZU WELCHEM KASTEN JEDES DER DREI KRITERIEN GEHOERT, seit 0.21.0. */
  criteriaPhases = ['after', 'after', 'after'],
  /* UND WELCHE ZAHL DER POTENZIALKASTEN DANN TRAEGT. Stellbar, weil „ohne
     Zahl kein Knopf" auch fuer den zweiten Kasten zu belegen ist. */
  potentialValue = undefined,
  /* OB DER BEISPIELEINTRAG UNGETESTET IST, seit 0.21.0. */
  /* DIE KOMMENTARE DES BEISPIELEINTRAGS, stellbar seit 0.30.0 -- wie
     `openInventory` fuer die Ansicht „Offen". */
  commentInventory = null,
  /* DIE TESTTAGE DES BEISPIELEINTRAGS, stellbar seit 0.30.1 -- wie
     `commentInventory` fuer die Kommentare. */
  dayInventory = null,
  untested = false, openInventory = null, trashInventory = null, backupStatus = null, backupCopies = null, sessionsInventory = null, logInventory = null,
  publicAddress = '', mailStatus = null, mailError = false, ownAddress = 'chefin@beispiel.de',
  tokenThrottle = 0, signup = false, requestsStatus = null, twoFactorState = null, statsExport = null,
  statsMethod = undefined,
  /* DIE BILDABLAGE IN DEN KENNZAHLEN, seit 0.19.0 -- stellbar, weil die Karte
     drei Lagen zeigen muss: es liegt PNG da (der Knopf ist bedienbar), es
     liegt keines mehr da (er ist es nicht), und ein Lauf ist unterwegs. */
  statsImageFormats = undefined,
  statsSwitch = null,
  /* DER ZWEITE BESTANDSLAUF, seit 0.19.4 -- eigenes Feld und nicht dasselbe:
     die Karte muss auseinanderhalten koennen, welcher der beiden laeuft. */
  statsGeometry = null,
  convertImages = true,
  uploadLimits = null,
  twoFactorCodes = null, loginFactor = false, searchError = false, searchThrottles = null,
  categories = [{ id: 21, name: 'Werkzeug', usage_count: 2, language: 'de' },
                { id: 22, name: 'Material', usage_count: 0, language: 'de' }],
  /* DIE ERSTELLUNGSSPRACHE DER DREI KRITERIEN -- 0.25.0. */
  criteriaLanguages = ['de', 'de', 'de'],
  /* DIE NAMEN JE SPRACHE, seit 0.24.5 -- `{ en: { 21: 'Tool' }, tr: { … } }`. */
  categoryNames = null, criterionNames = null,
  /* Die Ablehnung am Beispieleintrag, seit 0.14.0. */
  rejection = null,
  /* WEM DER EINTRAG GEHOERT, seit 0.15.0. Vorgabe ist "einem anderen" (bert)
     -- so stand er hier immer. */
  /* WELCHE VERGLEICHSZAHL DER RECHENWEG TRAEGT, seit 0.17.0. */
  calculationEqual = undefined,
  /* WIE VIELE STIMMEN JE KRITERIENZEILE STECKEN, seit 0.17.2. */
  voteColumns = null,
  entryMine = false } = {}) {
  // Aus demselben Paket wie JSDOM, das der Aufrufer mitbringt -- require ist
// hier ein Griff in den Zwischenspeicher, kein zweites Laden.
  const { VirtualConsole } = require('jsdom');
  // Die Anbieter kommen ueber /api/settings. Wer eigene Einstellungen
// mitgibt, ueberschreibt gezielt -- alles Uebrige bleibt bei der Vorgabe.
  settings = { searchProviders: DOM_PROVIDER, searchNames: 3, ...settings };
  /* DIE DREI VOKABELTAFELN, WIE SIE DER ECHTE SERVER SCHICKT -- 0.24.4. */
  {
    const languageDirectory = path.join(__dirname, 'public', 'languages');
    const codes = fs.readdirSync(languageDirectory)
      .filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
    const defaultsOf = (code) => Object.fromEntries(
      Object.entries(JSON.parse(fs.readFileSync(path.join(languageDirectory, `${code}.json`), 'utf8')))
        .filter(([k]) => k.startsWith('vocabulary.'))
        .map(([k, v]) => [k.slice('vocabulary.'.length), v]));
    const entered = Object.fromEntries(Object.entries(settings.vocabulary || {})
      .filter(([, v]) => typeof v === 'string' && v.trim()).map(([k, v]) => [k, v.trim()]));
    const readerLanguage = settings.language || 'de';
    if (!settings.vocabularyDefaults)
      settings.vocabularyDefaults = Object.fromEntries(codes.map(c => [c, defaultsOf(c)]));
    if (!settings.vocabulariesOwn)
      settings.vocabulariesOwn = Object.fromEntries(
        codes.map(c => [c, c === readerLanguage ? { ...entered } : {}]));
    /* UND DER RUECKFALL WIE AM SERVER: was fuer EINE Sprache eingetragen ist,
       steht in jeder anderen, fuer die nichts dasteht -- „lieber ein Wort in
       der falschen Sprache als gar keines" (0.24.3, F3). */
    if (!settings.vocabularies)
      settings.vocabularies = Object.fromEntries(
        codes.map(c => [c, { ...settings.vocabularyDefaults[c], ...entered }]));
  }
  /* DIE ZWEI NAMENSTAFELN WERDEN KOPIERT -- 0.24.5. */
  categoryNames = categoryNames ? JSON.parse(JSON.stringify(categoryNames)) : null;
  criterionNames = criterionNames ? JSON.parse(JSON.stringify(criterionNames)) : null;
  /* Vier Zugaenge, und jeder steht fuer eine andere Lage -- die Eigentuemerin
     (die Fragende selbst), ein zweiter Admin, ein gewoehnlicher Benutzer und
     ein Grabstein. */
  users = users || {
    ich: 1, mayRoles: true, owner: 1,
    users: [
      { id: 1, username: 'chefin', role: 'owner', status: 'active', last_login: '2026-08-01 09:00:00', created_at: '2026-01-01 09:00:00', entries: 5 },
      /* bert TRAEGT ohnePasswort UND der Grabstein AUCH, und das ist die
         eigentliche Lage: beide tragen in Wahrheit den leeren Hash. */
      { id: 2, username: 'bert', role: 'admin', status: 'active', last_login: null, created_at: '2026-02-01 09:00:00', entries: 2, withoutPassword: true },
      { id: 3, username: 'carla', role: 'user', status: 'locked', last_login: null, created_at: '2026-03-01 09:00:00', entries: 0, withoutPassword: false },
      { id: 4, username: 'deleted-4', role: 'user', status: 'deleted', last_login: null, created_at: '2026-04-01 09:00:00', entries: 1, withoutPassword: true }
    ]
  };
  /* Der Papierkorb der Prueflage. Zwei Zeilen, zwei Lagen: eine von einem
     lebenden Zugang, eine von einem Grabstein. */
  /* Die eigenen Anmeldungen der Prueflage. */
  const log = logInventory || DOM_LOG;
  /* Der Mailzugang der Prueflage. */
  /* Die Warteschlange der Prueflage, 0.9.1. VORGABE IST "AN, MIT ZWEI
     ZEILEN": der interessantere Zustand ist der mit Inhalt. */
  requestsStatus = requestsStatus || {
    an: true, deliveryReady: true, deliveryReason: '', cap: 20, hours: 24,
    requests: [
      { id: 11, username: 'neuling', email: 'neuling@beispiel.de',
        created_at: '2026-08-20 09:00:00', confirmed_at: '2026-08-20 09:05:00' },
      { id: 12, username: 'zweiter', email: 'zweiter@beispiel.de',
        created_at: '2026-08-21 10:00:00', confirmed_at: '2026-08-21 10:30:00' }
    ]
  };
  // belegt wird GERECHNET und nicht gestellt -- am echten Server zaehlt es die
// Zeilen, und ein Mock mit eigener Zahl deckte genau das zu.
  const requestsMock = () => ({ ...requestsStatus, used: requestsStatus.requests.length });
  /* ---- Der zweite Faktor im Mock, 0.10.0 ---- FESTE, ERFUNDENE WERTE. */
  const ZF_MOCK_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  const ZF_MOCK_GROUPS = 'GEZD GNBV GY3T QOJQ GEZD GNBV GY3T QOJQ';
  const ZF_MOCK_ROW = 'otpauth://totp/Kriterion%3Achefin?secret=' + ZF_MOCK_SECRET +
    '&issuer=Kriterion&algorithm=SHA1&digits=6&period=30';
  const ZF_MOCK_CODE = '123456';
  let zfStatusMock = twoFactorState || { an: false, since: null, codesOpen: 0, codesTotal: 0 };
  let zfTicketMock = 'ausweis-1', zfTicketCounter = 1;
  let zfCodesMock = twoFactorCodes ||
    ['AAAAA-BBBBB', 'CCCCC-DDDDD', 'EEEEE-FFFFF', 'GGGGG-HHHHH',
     'JJJJJ-KKKKK', 'MMMMM-NNNNN', 'PPPPP-QQQQQ', 'RRRRR-SSSSS'];
  const MAIL_DENIED = 'Das kann nur der Eigentümer dieser Installation.';
  /* DIE ANBIETERLISTE, WIE SIE ÜBER /api/mail HEREINKOMMT -- seit 0.17.3 samt
     Hinweis und den drei festen Werten je Anbieter. */
  const MAIL_PROVIDER_MOCK = [
    { key: 'gmx', name: 'GMX', server: 'mail.gmx.net', port: 587, secure: false,
      hint: 'GMX verlangt, den Versand über fremde Programme im Konto erst freizuschalten.' },
    { key: 'web', name: 'Web.de', server: 'smtp.web.de', port: 587, secure: false,
      hint: 'Web.de verlangt, den Versand über fremde Programme im Konto erst freizuschalten.' },
    { key: 'gmail', name: 'Gmail', server: 'smtp.gmail.com', port: 465, secure: true,
      hint: 'Gmail verlangt Zwei-Faktor und ein App-Passwort — das Kontopasswort wird abgewiesen.' },
    { key: 'strato', name: 'Strato', server: 'smtp.strato.de', port: 465, secure: true, hint: '' },
    { key: 'ionos', name: 'IONOS', server: 'smtp.ionos.de', port: 587, secure: false, hint: '' },
    { key: 'eigen', name: 'Eigener Server', server: '', port: 587, secure: false, hint: '' }
  ];
  mailStatus = mailStatus || { provider: 'gmx', server: 'mail.gmx.net', port: 587, secure: false,
    user: 'instanz@gmx.de', sender: 'instanz@gmx.de', passwordSet: true,
    testedAt: '2026-08-20 08:30:00' };
  const mailCardMock = () => ({
    provider: mailStatus.provider || '',
    providerName: (MAIL_PROVIDER_MOCK.find(a => a.key === mailStatus.provider) || {}).name || '',
    server: mailStatus.server || '', port: mailStatus.port || 0, secure: mailStatus.secure === true,
    user: mailStatus.user || '', sender: mailStatus.sender || '',
    passwordSet: Boolean(mailStatus.passwordSet),
    /* DIE DREI HINWEISE KOMMEN AUS DER SPRACHDATEI UND NICHT AUS DIESER ZEILE
       -- 0.31.1. */
    hint: MAIL_HINT_KEYS[mailStatus.provider]
      ? DE_TEXTS[MAIL_HINT_KEYS[mailStatus.provider]] : '',
    hintAlways: DE_TEXTS['mail.hintAlways'],
    providerList: MAIL_PROVIDER_MOCK,
    configured: Boolean(mailStatus.provider && mailStatus.user &&
                          mailStatus.passwordSet && mailStatus.sender),
    addressSet: Boolean(publicAddress), address: publicAddress,
    deadlineMinutes: 15, testedAt: mailStatus.testedAt || null, seconds: 20
  });
  /* Was der Server ueber den Versand sagt -- NACHGERECHNET, nicht gesetzt. */
  const deliveryState = (empfaenger) => {
    const k = mailCardMock();
    if (!k.configured) return { delivery: 'aus', deliveryReason: 'Es ist kein Mailzugang eingerichtet.' };
    if (!k.addressSet) return { delivery: 'aus', deliveryReason:
      'Ohne PUBLIC_ADDRESS in der .env wird nicht verschickt — der Server wüsste nicht, ' +
      'worauf der Link zeigen soll.' };
    if (!empfaenger) return { delivery: 'aus', deliveryReason:
      'Für diesen Zugang ist keine E-Mail-Adresse hinterlegt.' };
    return mailError
      ? { delivery: 'fehlgeschlagen', deliveryReason: 'Message failed: 550 abgelehnt' }
      : { delivery: 'ok', deliveryReason: '' };
  };
  /* Welcher Zugang eine Adresse hinterlegt hat. */
  const userAddresses = { 1: 'chefin@beispiel.de', 2: 'bert@beispiel.de', 3: '', 4: '' };
  const sessions = sessionsInventory || [
    { id: 'a'.repeat(64), loggedInAt: '2026-08-20 08:00:00',
      lastSeen: '2026-08-24 07:30:00', current: true },
    { id: 'b'.repeat(64), loggedInAt: '2026-08-18 19:15:00',
      lastSeen: '2026-08-23 21:00:00', current: false },
    { id: 'c'.repeat(64), loggedInAt: '2026-08-01 11:00:00',
      lastSeen: '2026-08-22 09:45:00', current: false }
  ];

  const trash = trashInventory || [
    { id: 501, title: 'Weggeworfenes', deleted_at: '2026-08-01 09:00:00',
      deletedBy: { id: 1, name: 'chefin', deleted: false },
      files: 3, bytes: 2048, daysOpen: 12 },
    { id: 502, title: 'Von einem Grabstein', deleted_at: '2026-08-10 11:30:00',
      deletedBy: { id: 4, name: null, deleted: true },
      files: 0, bytes: 512, daysOpen: 27 }
  ];
  /* Die Sicherung der Prueflage. Vorgabe: eingerichtet, mit einer Sicherung
     von vor drei Tagen. */
  // Die Grenzen beim Hochladen in MB, mit der Spanne des Servers.
  const uploadLimitsMock = { photo: 30, commentImage: 20, video: 20, commentVideo: 20, attachment: 50,
    ...(uploadLimits || {}) };
  const UPLOAD_RANGES_MOCK = { photo: { min: 1, max: 50, fallback: 30 },
    commentImage: { min: 1, max: 50, fallback: 20 }, video: { min: 1, max: 100, fallback: 20 },
    commentVideo: { min: 1, max: 100, fallback: 20 }, attachment: { min: 1, max: 100, fallback: 50 } };
  const backup = backupStatus || {
    configured: true, root: '/backup', place: 'taeglich', filePath: '/backup/taeglich',
    // Die Vorgabe ist die EMPFOHLENE Lage -- ausserhalb. Die Gegenlage steht
// als eigener Aufbau in der Gruppe darunter.
    inWorkDir: false,
    dbBytes: 52428800, durationSeconds: 1, reachable: true, number: 2,
    last: { file: 'kriterion-2026-08-20-03-00-00.sqlite', bytes: 52428800,
              at: '2026-08-20 03:00:00', daysAgo: 3, outdated: false },
    // Seit 0.8.91: die Vorgabe ist "nie gewechselt". Die drei Lagen des
// Wechsels bekommen ihre eigenen Aufbauten in der Gruppe darunter.
    changedAt: null, outdated: 0,
    /* DIE AUFRAEUMREGEL, seit 0.20.0. VORGABE: Schalter AUS, 3 und 30, und
       die Regel trifft nichts -- genau die Lage einer frischen Installation. */
    cleanup: {
      an: false, keep: 3, days: 30,
      limits: { keep: { fallback: 3, min: 1, max: 20 },
                 days: { fallback: 30, min: 7, max: 365 } },
      reachable: true, matched: [], bytes: 0,
      reason: 'Alle 2 Backups sind unter den jüngsten 3.',
      /* DIE VOLLSTAENDIGE LISTE -- in der Vorgabelage die beiden Kopien, die
         `zahl: 2` daneben behauptet. */
      files: [
        { nr: 1, file: 'kriterion-2026-08-20-03-00-00.sqlite', at: '2026-08-20 03:00:00',
          daysAgo: 3, bytes: 52428800, affected: false, outdated: false },
        { nr: 2, file: 'kriterion-2026-08-13-03-00-00.sqlite', at: '2026-08-13 03:00:00',
          daysAgo: 10, bytes: 52428800, affected: false, outdated: false }
      ],
      oldCount: 0, oldBytes: 0, oldFiles: []
    }
  };
  /* DIE KOPIEN AM ORT -- die Liste, aus der der Mock seine Vorschau WIRKLICH
     rechnet. */
  const cleanupCopies = (backupCopies || []).slice();
  // DER QUELLTEXT STEHT OBEN UND WIRD EINMAL GELESEN -- 0.30.0, F4.
  const source = BASE_SOURCE;
  /* Die dreistellige Stimmenzahl der zweiten Kriterienzeile. */
  const MATCH_MANY = 128;
  /* SCHNITT UND STIMMENZAHL STEHEN ALS PAAR und nicht als zwei Listen: sie
     gehoeren zusammen, und zwei getippte Listen liefen frueher oder spaeter
     auseinander. */
  const columns = voteColumns || [{ avg: 3.4, count: 5 },
    { avg: 4.1, count: MATCH_MANY }, { avg: null, count: 0 }];
  /* JEDE ZEILE TRAEGT IHRE ERSTELLUNGSSPRACHE -- 0.25.0, wie am echten Server
     (`rating_criteria.language`). */
  const criteria = [
    { id: 7, name: 'Zuerst', sort_order: 0, usage_count: 2, weight: criteriaWeights[0],
      phase: criteriaPhases[0], language: criteriaLanguages[0] },
    { id: 8, name: 'Dann', sort_order: 1, usage_count: 0, weight: criteriaWeights[1],
      phase: criteriaPhases[1], language: criteriaLanguages[1] },
    { id: 9, name: 'Zuletzt', sort_order: 2, usage_count: 1, weight: criteriaWeights[2],
      phase: criteriaPhases[2], language: criteriaLanguages[2] }
  ];
  /* Verfasser im Mock: der falsche Server muss antworten wie der echte, sonst
     verschwindet genau die Pruefung, fuer die er gebaut ist. */
  const vChefin = { id: 1, name: 'chefin', deleted: false };
  const vBert = { id: 2, name: 'bert', deleted: false };
  const vTomb = { id: 4, name: null, deleted: true };
  // Ein Benutzername ist Eingabe, keine Konstante.
  const vBad = { id: 5, name: 'Verfasser <b id="boese-link">X</b>', deleted: false };
  /* DIE KOPFZAHL DES POTENZIALKASTENS -- 0.21.0. */
  const potentialAverage = criteriaPhases.includes('before')
    ? (potentialValue === undefined ? 4.2 : potentialValue) : null;
  const example = {
    id: 1, title: 'Beispiel', description: 'Eine Beschreibung.\nZweite Zeile.',
    rejected: !!rejection, tested: !untested, favorite: false, category: null,
    /* Der echte Server liefert die drei Felder IMMER aus -- leer, wenn nichts
       dasteht. */
    rejected_at: rejection?.at ?? null,
    rejected_reason: rejection?.reason ?? null,
    rejectedAuthor: rejection?.author ?? null,
    /* ZWEI ANGABEN NACH HAUSMUSTER, seit 0.15.0, und sie werden GERECHNET wie
       im echten Server: `mine` aus dem Verfasser des EINTRAGS, `rejectedMine`
       aus dem der BEGRUENDUNG -- beide gegen die Nummer der Fragenden. */
    mine: entryMine,
    rejectedMine: !!(rejection?.author && rejection.author.id === users.ich),
    author: entryMine ? vChefin : vBert,
    /* ZWEI ZEILEN, UND SIE SIND VERSCHIEDENER ART -- ein Mock mit lauter
       Bildern naehme genau die Pruefungen weg, fuer die er hier gebraucht
       wird. */
    photos: [{ id: 5, mime_type: 'image/png', focus_x: 50, focus_y: 50, sort_order: 0,
               kind: 'image', duration: null },
             { id: 6, mime_type: 'video/mp4', focus_x: 50, focus_y: 50, sort_order: 1,
               kind: 'video', duration: 42 }],
    /* Sieben Adressen und eine Suchzeile -- an der letzten haengt die
       Pruefung der Kennzeichnung. */
    links: [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: 80 + i, url: `https://beispiel.de/${i}`, sort_order: i,
        created_at: '2026-08-01 10:00:00', mine: false, author: vBert })),
      { id: 84, url: 'https://beispiel.de/4', sort_order: 4,
        created_at: '2026-08-01 10:30:00', mine: false, author: vBad },
      { id: 85, url: 'https://beispiel.de/5', sort_order: 5,
        created_at: '2026-08-02 11:30:00', mine: true, author: vChefin },
      { id: 86, url: 'https://beispiel.de/6', sort_order: 6,
        created_at: '2026-08-03 12:00:00', mine: false, author: null },
      { id: 87, url: 'Handbuch 3000', sort_order: 7,
        created_at: '2026-08-04 13:00:00', mine: false, author: vTomb }
    ],
    comments: commentInventory || [
      /* mine und bilderEntfernt an JEDEM Kommentar: der echte Server liefert
         beides seit 0.8.3, und ein Mock, der die Antwort vereinfacht, loescht
         genau die Pruefung, fuer die er gebaut ist. */
      { id: 61, text: 'Angepinnte Notiz', kind: 'note', pinned: true, author: vChefin,
        mine: true, imagesRemoved: 0,
        created_at: '2026-08-03 09:00:00', updated_at: null, images: [] },
      { id: 62, text: 'Ein Bericht', kind: 'report', pinned: false, author: vBert,
        mine: false, imagesRemoved: 1,
        created_at: '2026-08-02 09:00:00', updated_at: null,
        images: [{ id: 71, filename: 'a.jpg', sort_order: 0 },
                 { id: 72, filename: 'b.jpg', sort_order: 1 }] },
      // Der Grabstein: die Antwort nennt nur die Nummer, die Beschriftung
      // entsteht in app.js.
      { id: 63, text: 'Gewöhnliche Notiz', kind: 'note', pinned: false, author: vTomb,
        mine: false, imagesRemoved: 2,
        created_at: '2026-08-01 09:00:00', updated_at: '2026-08-01 10:00:00', images: [] },
      // Der vierte traegt alles, was am Kommentartext haengt: Markup, das
      // niemals Markup werden darf; eine Adresse mit & in der Abfragezeile
      // (zerlegt wird der Rohtext, nicht der maskierte); ein nachlaufendes
      // Komma und ein nachlaufender Punkt; www.
      { id: 64, text: 'Siehe <b>hier</b>: https://beispiel.de/pfad?a=1&b=2, dazu www.beispiel.de. '
          + 'Nicht beispiel.de und nicht javascript:alert(1)',
        kind: 'note', pinned: false, author: null, mine: false, imagesRemoved: 0,
        created_at: '2026-07-31 09:00:00', updated_at: null, images: [] },
      { id: 65, text: 'Eine Aufgabe', kind: 'task', pinned: false, author: vChefin,
        mine: true, imagesRemoved: 0,
        created_at: '2026-07-30 09:00:00', updated_at: null, images: [] },
      { id: 66, text: 'Schon erledigt', kind: 'done', pinned: false, author: vChefin,
        mine: true, imagesRemoved: 0,
        created_at: '2026-07-29 09:00:00', updated_at: null, images: [] }
    ],
    attachments: [
      /* Vier Verfasserlagen wie an der Linkzeile: zwei vom Verfasser des
         Eintrags (dort steht kein Name), eine von der Fragenden (mine) und
         eine herrenlose. */
      { id: 41, filename: 'notiz.txt', mime_type: 'text/plain', size: 120, sort_order: 0, preview: 'text',
        created_at: '2026-08-01 10:00:00', mine: false, author: vBert },
      { id: 42, filename: 'foto.png', mime_type: 'image/png', size: 2048, sort_order: 1, preview: 'image',
        created_at: '2026-08-01 11:00:00', mine: false, author: vBert },
      { id: 43, filename: 'doku.pdf', mime_type: 'application/pdf', size: 900000, sort_order: 2, preview: 'pdf',
        created_at: '2026-08-02 12:00:00', mine: true, author: vChefin },
      { id: 44, filename: 'archiv.zip', mime_type: 'application/zip', size: 5242880, sort_order: 3, preview: 'keine',
        created_at: '2026-08-03 13:00:00', mine: false, author: null }
    ],
    tags: tags.filter(t => t.assigned),
    // mine: der echte Server sagt zu jedem Testtag, ob er dem Abrufenden
    // gehoert.
    testDays: dayInventory || [{ id: 3, day: '2026-08-01', rating: 4, mine: true, author: vChefin,
                 tags: [{ id: 91, name: 'Regen' }] }],
    // avg und count stehen an jeder Zeile.
    /* DREI ZEILEN, UND SIE SIND VERSCHIEDEN LANG -- das ist seit 0.14.0 keine
       Zierde mehr, sondern der Gegenstand: die Sternreihen sollen an
       derselben Stelle beginnen, und eine Prueflage, in der alle Zahlen
       gleich lang sind, kann diesen Fehler gar nicht tragen. */
    ratings: criteria.map((c, i) => ({
      criterion_id: c.id, name: c.name, value: ownValues[i], weight: c.weight,
      // DIE PHASE REIST AN DER ZEILE MIT, wie beim echten Server -- der
// Browser teilt `ratings` danach in seine beiden Kaesten.
      phase: c.phase,
      avg: columns[i].avg, count: columns[i].count })),
    avgRating: withoutRating ? null : 3, testCount: 1, testAvg: 4, testLast: 4,
    /* ---- DER RECHENWEG -- 0.16.0 ------------------------------------------
       WIE DER ECHTE SERVER: er entsteht dort IN gesamtSchnitt(), also in
       derselben Schleife wie avgRating -- nur die bewerteten Kriterien, das
       dritte hat kein avg und faellt heraus. */
    calc: (() => {
      const rows = criteria
        .map((c, i) => ({ criterionId: c.id, average: columns[i].avg, weight: c.weight,
                          phase: c.phase }))
        // NUR DER KASTEN „after" -- wie im echten Server, wo die Menge nach
        // Phase geschnitten ist, BEVOR gesamtSchnitt() sie sieht.
        .filter(z => z.phase === 'after')
        .filter(z => z.average != null)
        .map(z => ({ ...z, product: z.average * z.weight }));
      const sum = rows.reduce((n, z) => n + z.product, 0);
      const divisor = rows.reduce((n, z) => n + z.weight, 0);
      /* OHNE JEDE BEWERTUNG GIBT ES KEINE ZAHL UND KEINEN RECHENWEG -- der
         echte Server liefert dann avgRating null und einen Weg ohne Zeilen. */
      /* ---- DIE VERGLEICHSZAHL OHNE GEWICHTE -- 0.17.0 ---- WIE DER ECHTE
         SERVER: sie entsteht dort IN derselben Schleife, aus DERSELBEN Menge,
         und ihr Teiler ist die ZAHL der bewerteten Kriterien. */
      const equalSum = rows.reduce((n, z) => n + z.average, 0);
      const equal = calculationEqual === undefined ? 4 : calculationEqual;
      if (withoutRating) return { rows: [], sum: 0, divisor: 0, raw: null, result: null,
        equalSum: 0, equalDivisor: 0, equalRaw: null, equalResult: null };
      return { rows, sum, divisor, raw: divisor ? sum / divisor : null, result: 3,
        equalSum, equalDivisor: rows.length,
        equalRaw: rows.length ? equalSum / rows.length : null,
        equalResult: equal };
    })(),
    /* ---- DIE ZWEITE KOPFZAHL UND IHR RECHENWEG -- 0.21.0
       ------------------- WIE DER ECHTE SERVER, und das heisst hier vor
       allem: aus der ANDEREN Menge, durch DIESELBE Rechnung. */
    potentialRating: potentialAverage,
    potentialCalc: (() => {
      const rows = criteria
        .map((c, i) => ({ criterionId: c.id, average: columns[i].avg, weight: c.weight,
                          phase: c.phase }))
        .filter(z => z.phase === 'before')
        .filter(z => z.average != null)
        .map(z => ({ ...z, product: z.average * z.weight }));
      const sum = rows.reduce((n, z) => n + z.product, 0);
      const divisor = rows.reduce((n, z) => n + z.weight, 0);
      const equalSum = rows.reduce((n, z) => n + z.average, 0);
      return { rows, sum, divisor, raw: divisor ? sum / divisor : null,
        result: potentialAverage,
        equalSum, equalDivisor: rows.length,
        equalRaw: rows.length ? equalSum / rows.length : null,
        equalResult: rows.length ? potentialAverage : null };
    })(),
    // Reine Anzeige, seit 0.8.6 in der Verfasserzeile. Ohne dieses Feld
// zeichnete die Zeile ins Leere und jede Pruefung darauf waere blind.
    created_at: '2026-07-20 14:30:00'
  };
  /* Die Antwort des neuen Endpunkts GET /api/items/:id/votes -- wer welchen
     Wert vergeben hat, je Kriterium. */
  const matchResponse = [
    { criterion_id: 7, votes: [
      { id: 501, value: 3, mine: true, author: vChefin },
      { id: 502, value: 4, mine: false, author: vBert },
      { id: 503, value: 2, mine: false, author: vTomb },
      { id: 504, value: 4, mine: false, author: null },
      { id: 505, value: 4, mine: false, author: { id: 3, name: 'carla', deleted: false } }] },
    /* DIE ZWEITE ZEILE TRAEGT ABSICHTLICH EINE DREISTELLIGE STIMMENZAHL. */
    { criterion_id: 8, votes: [
      { id: 506, value: 3, mine: true, author: vChefin },
      { id: 507, value: 5, mine: false, author: vBert },
      ...Array.from({ length: MATCH_MANY - 2 }, (unused, i) => ({
        id: 600 + i, value: 4, mine: false,
        author: { id: 100 + i, name: `stimme${i}`, deleted: false } }))] }
  ];
  const overview = [{
    id: 1, title: 'Beispiel', rejected: false, tested: true, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: 3, testCount: 2, testAvg: 4, testLast: 4,
    updated_at: '2026-08-01 10:00:00'
  }];
  /* Der Bestand fuer die Ansicht "Offen". */
  const open = openInventory || [
    { id: 65, kind: 'task', text: 'Eine Aufgabe', created_at: '2026-07-30 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: true, author: vChefin },
    { id: 66, kind: 'done', text: 'Schon erledigt', created_at: '2026-07-29 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: true, author: vChefin },
    { id: 61, kind: 'note', text: 'Angepinnte Notiz', created_at: '2026-08-03 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: true, author: vChefin },
    { id: 62, kind: 'report', text: 'Ein Bericht', created_at: '2026-08-02 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: false, author: vBert },
    { id: 67, kind: 'task', text: 'Fremde Aufgabe', created_at: '2026-07-28 09:00:00',
      item: { id: 2, title: 'Zweites' }, mine: false, author: vBert },
    { id: 68, kind: 'task', text: 'Herrenlose Aufgabe', created_at: '2026-07-27 09:00:00',
      item: { id: 2, title: 'Zweites' }, mine: false, author: vTomb }
  ];
  const sent = [];
  // Zaehler fuer searchThrottles -- welche Suchanfrage gerade hinausgeht.
  let searchThrottle = 0;

  /* jsdom kennt <video> als Element, aber nicht seine Methoden: pause() und
     load() melden sich als jsdomError. */
  const silenceConsole = new VirtualConsole();
  silenceConsole.forwardTo(console, { jsdomErrors: 'none' });
  silenceConsole.on('jsdomError', (e) => {
    if (!/Not implemented: HTMLMediaElement/.test(e?.message || ''))
      console.error(e?.type === 'unhandled-exception' ? e.cause?.stack : e?.message);
  });
  const dom = new JSDOM(
    `<!DOCTYPE html><html lang="de"><body><div id="app"></div>` +
    `<p class="version-row" id="version"></p></body></html>`,
    { runScripts: 'dangerously', url: `${BASE}/${hash}`, virtualConsole: silenceConsole });
  const w = dom.window;
  const answer = async (url, opt = {}) => {
    /* DER KOPF WIRD MITGESCHRIEBEN -- 0.24.5. */
    const askedLanguage = Object.entries((opt && opt.headers) || {})
      .find(([h]) => h.toLowerCase() === 'accept-language');
    sent.push({ method: opt.method || 'GET', url, body: opt.body ? JSON.parse(opt.body) : null,
                language: askedLanguage ? askedLanguage[1] : null });
    const give = (o, status = 200) => ({ ok: status < 400, status, json: async () => o });
    /* DIE SPRACHDATEI KOMMT AUS DER ECHTEN DATEI -- 0.24.0, Bauabschnitt 1. */
    /* DASSELBE MUSTER WIE readLanguages() IM SERVER -- BCP 47 und nicht „zwei
       Kleinbuchstaben". */
    const languageFile = /^\/languages\/([a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|[0-9]{3}))?)\.json$/
      .exec(String(url));
    if (languageFile) {
      // `withoutLanguage`: die Lage, in der die Datei fehlt (Entscheidung A1).
      if (withoutLanguage) return give({}, 404);
      const file = path.join(__dirname, 'public', 'languages', `${languageFile[1]}.json`);
      if (!fs.existsSync(file)) return give({}, 404);
      return give(JSON.parse(fs.readFileSync(file, 'utf8')));
    }
    /* DIE ZWEI SPRACHFELDER SEIT 0.24.3. */
    if (url === '/api/config') return give({ title: 'Oeffentlich', version: require('./package.json').version,
      setupRequired: setup, minPassword: 10, signup,
      language: 'de',
      languages: fs.readdirSync(path.join(__dirname, 'public', 'languages'))
        .filter(f => f.endsWith('.json')).sort()
        .map(f => ({ code: f.slice(0, -5), name: f.slice(0, -5) })) });
    if (url === '/api/session') return give({ authenticated: loggedIn });
    /* Der Weg VOR der Anmeldung. */
    const TOKEN_DENIAL_MOCK = 'Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern.';
    const tokenState = { ['d'.repeat(64)]: { username: 'carla', withoutPassword: true },
                        ['f'.repeat(64)]: { username: 'dora', withoutPassword: false } };
    if (url === '/api/token/check' && opt.method === 'POST') {
      /* DIE ANMELDEBREMSE ALS EIGENE LAGE, seit 0.9.0. */
      if (tokenThrottle > 0) {
        tokenThrottle--;
        return give({ error: 'Zu viele Fehlversuche. Bitte in 300 Sekunden erneut versuchen.' }, 429);
      }
      const t = tokenState[JSON.parse(opt.body || '{}').token];
      // minuten: die Frist ab dem ersten Oeffnen, seit 0.9.0. Die Seite liest
// sie aus der Antwort.
      return t ? give({ ...t, minPassword: 10, minutes: 15 }) : give({ error: TOKEN_DENIAL_MOCK }, 400);
    }
    if (url === '/api/token/redeem' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      const t = tokenState[k.token];
      if (!t) return give({ error: TOKEN_DENIAL_MOCK }, 400);
      if (String(k.password || '').length < 10)
        return give({ error: 'Das Passwort muss mindestens 10 Zeichen lang sein.' }, 400);
      return give({ ok: true, username: t.username });
    }
    /* Die eigene Adresse steht seit 0.9.0 in dieser Antwort, und der Mock
       liefert sie mit -- sonst bliebe das Feld in der Karte "Zugang" leer und
       jede Pruefung darauf blind. */
    /* DER ZWEITE FAKTOR REIST SEIT 0.10.0 IN DIESER ANTWORT MIT, und der Mock
       liefert ihn -- sonst bliebe der Block in der Karte "Zugang" leer und
       jede Pruefung darauf blind. */
    if (url === '/api/account' && (opt.method || 'GET') === 'GET')
      return give({ username: 'chefin', minPassword: 10, email: ownAddress,
                   twoFactor: zfStatusMock });
    /* PUT auf den eigenen Zugang. */
    if (url === '/api/account' && opt.method === 'PUT') {
      const k = JSON.parse(opt.body || '{}');
      if (k.email !== undefined) ownAddress = String(k.email || '');
      return give({ username: k.username || 'chefin',
                   passwordChanged: Boolean(k.newPassword), email: ownAddress });
    }
    /* DIE ANMELDUNG IN ZWEI SCHRITTEN, 0.10.0. */
    if (url === '/api/login' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== 'chefins-wort-100')
        return give({ error: 'Benutzername oder Passwort stimmt nicht.' }, 401);
      if (!loginFactor) return give({ ok: true });
      return give({ twoFactor: true, ticket: zfTicketMock, seconds: 120 });
    }
    if (url === '/api/login/second' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.ticket !== zfTicketMock)
        return give({ error: 'Die Anmeldung ist abgelaufen. Bitte noch einmal von vorn.' }, 401);
      const input = String(k.code || '');
      if (input !== ZF_MOCK_CODE && !zfCodesMock.includes(input)) {
        // DER ALTE AUSWEIS IST VERBRAUCHT, ein frischer liegt der Absage bei --
// sonst kostete ein Tippfehler das ganze Passwort noch einmal.
        zfTicketMock = 'ausweis-' + (++zfTicketCounter);
        return give({ error: 'Der Code stimmt nicht.', ticket: zfTicketMock, seconds: 120 }, 401);
      }
      zfTicketMock = 'ausweis-' + (++zfTicketCounter);
      return give({ ok: true });
    }
    /* ---- Der zweite Faktor, 0.10.0 ---- DER MOCK ZIEHT WIRKLICH MIT
: einschalten macht "an", ausschalten macht "aus", und
       die Zahl der Wiederherstellungscodes aendert sich. */
    if (url === '/api/two-factor/start' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== 'chefins-wort-100') return give({ error: 'Das Passwort stimmt nicht.' }, 403);
      if (zfStatusMock.an) return give({ error: 'Der zweite Faktor ist bereits eingeschaltet.' }, 400);
      return give({ secret: ZF_MOCK_SECRET, groups: ZF_MOCK_GROUPS,
                   row: ZF_MOCK_ROW, digits: 6, seconds: 30 });
    }
    if (url === '/api/two-factor/on' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== 'chefins-wort-100') return give({ error: 'Das Passwort stimmt nicht.' }, 403);
      if (String(k.code) !== ZF_MOCK_CODE) return give({ error: 'Der Code stimmt nicht.' }, 400);
      zfStatusMock = { an: true, since: '2026-08-26 10:00:00', codesOpen: 8, codesTotal: 8 };
      return give({ ...zfStatusMock, codes: zfCodesMock });
    }
    if (url === '/api/two-factor/codes' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== 'chefins-wort-100') return give({ error: 'Das Passwort stimmt nicht.' }, 403);
      if (String(k.code) !== ZF_MOCK_CODE) return give({ error: 'Der Code stimmt nicht.' }, 403);
      zfCodesMock = zfCodesMock.map((c, i) => `NEU${String(i)}A-BCDEF`);
      zfStatusMock = { ...zfStatusMock, codesOpen: 8, codesTotal: 8 };
      return give({ ...zfStatusMock, codes: zfCodesMock });
    }
    if (url === '/api/two-factor' && opt.method === 'DELETE') {
      const k = JSON.parse(opt.body || '{}');
      if (!zfStatusMock.an) return give({ error: 'Der zweite Faktor ist nicht eingeschaltet.' }, 400);
      if (k.password !== 'chefins-wort-100') return give({ error: 'Das Passwort stimmt nicht.' }, 403);
      if (String(k.code) !== ZF_MOCK_CODE) return give({ error: 'Der Code stimmt nicht.' }, 403);
      zfStatusMock = { an: false, since: null, codesOpen: 0, codesTotal: 0 };
      return give({ ...zfStatusMock });
    }
    /* ---- Der Mailversand, 0.9.0 ---- DER MOCK ANTWORTET WIE DER ECHTE
       SERVER, und das heisst hier vor allem: er kann FEHLSCHLAGEN. */
    if (url === '/api/mail' && (opt.method || 'GET') === 'GET') {
      if (settings.isOwner === false) return give({ error: MAIL_DENIED }, 403);
      return give(mailCardMock());
    }
    /* ---- Die Selbstanmeldung, 0.9.1 ---- ER ANTWORTET WIE DER ECHTE SERVER
, und das heisst hier vor allem: ER ZIEHT MIT. */
    /* Die beiden Routen VOR der Anmeldung. */
    if (url === '/api/signup' && opt.method === 'POST') {
      return give({ ok: true, message:
        'Danke. Konnte zu diesen Angaben eine Anfrage entstehen, liegt jetzt eine E-Mail in ' +
        'deinem Postfach — bestätige darin, dass die Adresse dir gehört. Danach entscheidet ' +
        'ein Admin, ob ein Zugang angelegt wird.' });
    }
    if (url === '/api/signup/confirm' && opt.method === 'POST') {
      // Ein gueltiger Schluessel und die EINE Absage fuer alles andere --
// wortgleich wie am echten Server.
      const k = JSON.parse(opt.body || '{}').key;
      if (k === 'd'.repeat(64)) return give({ ok: true });
      return give({ error:
        'Dieser Bestätigungslink gilt nicht mehr. Stell die Anfrage bitte noch einmal.' }, 400);
    }
    if (url === '/api/requests' && (opt.method || 'GET') === 'GET') {
      if (settings.isAdmin === false) return give({ error: 'Das darf nur ein Admin.' }, 403);
      return give(requestsMock());
    }
    if (url === '/api/signup/toggle' && opt.method === 'PUT') {
      if (settings.isAdmin === false) return give({ error: 'Das darf nur ein Admin.' }, 403);
      const an = JSON.parse(opt.body || '{}').an === true;
      if (an && !requestsStatus.deliveryReady)
        return give({ error: 'Die Selbstanmeldung lässt sich ohne funktionierenden Versand nicht ' +
          'einschalten. ' + requestsStatus.deliveryReason }, 400);
      requestsStatus.an = an;
      return give(requestsMock());
    }
    if (/^\/api\/requests\/\d+\/approve$/.test(url) && opt.method === 'POST') {
      const nr = Number(url.split('/')[3]);
      const row = requestsStatus.requests.find(a => a.id === nr);
      if (!row) return give({ error: 'Diese Anfrage gibt es nicht.' }, 404);
      requestsStatus.requests = requestsStatus.requests.filter(a => a.id !== nr);
      // Die Rolle steht fest auf 'user' -- wie am echten Server, wo sie im
// Aufruf verdrahtet ist und aus keiner Anfrage gelesen wird.
      return give({ id: 90 + nr, username: row.username, email: row.email, role: 'user',
        withoutPassword: true, token: 'e'.repeat(64), purpose: 'invite', days: 7, minutes: 15,
        link: `https://kriterion.beispiel.de/#/invite/${'e'.repeat(64)}`,
        linkSource: 'einstellung', delivery: 'ok', deliveryReason: '', ...requestsMock() });
    }
    if (/^\/api\/requests\/\d+$/.test(url) && opt.method === 'DELETE') {
      const nr = Number(url.split('/')[3]);
      if (!requestsStatus.requests.some(a => a.id === nr))
        return give({ error: 'Diese Anfrage gibt es nicht.' }, 404);
      requestsStatus.requests = requestsStatus.requests.filter(a => a.id !== nr);
      return give({ ok: true, ...requestsMock() });
    }
    if (url === '/api/mail' && opt.method === 'PUT') {
      if (settings.isOwner === false) return give({ error: MAIL_DENIED }, 403);
      const k = JSON.parse(opt.body || '{}');
      mailStatus.provider = String(k.provider || '');
      if (mailStatus.provider === 'eigen') {
        mailStatus.server = String(k.server || ''); mailStatus.port = Number(k.port) || 0;
        mailStatus.secure = k.secure === true;
      }
      mailStatus.user = String(k.user || '');
      mailStatus.sender = String(k.sender || '');
      if (k.password) mailStatus.passwordSet = true;
      if (!mailStatus.provider) mailStatus.passwordSet = false;
      /* DIE MARKE FAELLT, WEIL DER ZUGANG SICH GEAENDERT HAT -- so wie beim
         echten Server, der sie ueber den Hash ueber den Zugang verwirft und
         nicht ueber ein ausdrueckliches Loeschen. */
      mailStatus.testedAt = null;
      return give(mailCardMock());
    }
    if (url === '/api/mail/test' && opt.method === 'POST') {
      if (settings.isOwner === false) return give({ error: MAIL_DENIED }, 403);
      if (!ownAddress)
        return give({ error: 'Für deinen Zugang ist keine E-Mail-Adresse hinterlegt. ' +
          'Trag sie im Systembereich unter „Zugang“ ein — die Testmail geht ' +
          'ausschließlich an die eigene Adresse.' }, 400);
      if (mailError)
        return give({ ok: false, reason: 'Message failed: 550 abgelehnt',
                     sentTo: ownAddress, ...mailCardMock() });
      mailStatus.testedAt = '2026-08-25 12:00:00';
      return give({ ok: true, reason: '', sentTo: ownAddress, ...mailCardMock() });
    }
    if (url === '/api/titles') return give({ publicTitle: 'Oeffentlich', appTitle: 'Intern' });
    /* ---- DIE NAMEN JE SPRACHE, WIE localeOf(req) SIE ENTSCHEIDET -- 0.24.5
       ---- DER MOCK ANTWORTET WIE DER ECHTE SERVER, und das heisst hier vor
       allem: ER HOERT DEN KOPF NICHT. */
    const personalLanguage = () => settings.language || 'de';
    /* WELCHE SPRACHE DIE GRUNDZEILE TRAEGT. */
    const baseLanguageMock = () =>
      ((settings.languages || []).find(a => a.isDefault) || {}).code || 'de';
    /* DIE KETTE IM MOCK -- 0.25.0, und sie ist Schritt fuer Schritt dieselbe
       wie `chainFor()` in server.js: die Sprache des
       Lesers, sonst die Vorgabe, sonst die Erstellungssprache der Zeile,
       sonst der Originaltext ohne Sprachangabe. */
    const chainMock = (row, per, locale) => {
      const std = baseLanguageMock();
      const at = (code) => (code != null && code === row.language)
        ? row.name : ((per || {})[code] || {})[row.id];
      const own = at(locale);
      if (own !== undefined) return { name: own, from: locale };
      for (const code of [std, row.language]) {
        const back = at(code);
        if (back !== undefined) return { name: back, from: code };
      }
      return { name: row.name, from: null };
    };
    /* WAS EINE LISTE DES SERVERS TRAEGT -- der Name der Kette UND der
       Vermerk. */
    const withNames = (rows, table) => rows.map(z => {
      const hit = chainMock(z, table, personalLanguage());
      if (hit.from === personalLanguage()) return { ...z, name: hit.name };
      return { ...z, name: hit.name,
               nameFallback: hit.from === null ? true : hit.from };
    });
    /* SCHREIBEN AUF EINEN NAMEN -- 0.24.5, mit 0.25.0 an die Kette angepasst. */
    const writeNameMock = (rows, table, id, body) => {
      const row = rows.find(z => z.id === id);
      if (!row) return null;
      const language = !body || body.language === undefined
        ? (row.language === undefined ? null : row.language) : String(body.language);
      if (body && body.clearName === true) {
        if (language === row.language) return null;   // der Originaltext bleibt
        if (table && table[language]) delete table[language][id];
        return row;
      }
      const name = String((body && body.name) || '').trim();
      if (!name) return row;
      if (language === row.language) { row.name = name; return row; }
      if (!table) return row;
      if (!table[language]) table[language] = {};
      table[language][id] = name;
      return row;
    };
    if (url === '/api/criteria') return give(withNames(criteria, criterionNames));
    if (url === '/api/criteria/order') return give(withNames(criteria, criterionNames));
    if (url === '/api/tags') return give(tags);
    /* NICHT LEER. */
    if (url === '/api/product-categories') return give(withNames(categories, categoryNames));
    /* Der eigene Name steht seit 0.8.6 in dieser Antwort, und der Mock
       liefert ihn mit -- sonst bliebe die Kopfzeile leer und jede Pruefung
       darauf blind. */
    /* zweifaktor SEIT 0.10.0: daran haengt, ob das Bestaetigungsfenster ein
       zweites Feld zeigt. */
    /* DIE NAMENSTAFELN JE SPRACHE -- 0.24.5, mit 0.25.0 umgebaut, und NUR
       FUER DEN ADMIN, wie am echten Server (`namesAll()` in server.js). */
    const namesTableMock = (rows, per) => {
      const codes = fs.readdirSync(path.join(__dirname, 'public', 'languages'))
        .filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
      const out = Object.fromEntries(codes.map(c => [c, {}]));
      for (const code of codes)
        for (const z of rows) {
          const hit = chainMock(z, per, code);
          out[code][z.id] = { name: hit.name, from: hit.from };
        }
      return out;
    };
    if (url === '/api/settings' && (opt.method || 'GET') === 'GET')
      return give({ name: 'chefin', trashDays: 30, convertImages,
        uploadLimits: { ...uploadLimitsMock }, uploadLimitRanges: UPLOAD_RANGES_MOCK,
        twoFactor: zfStatusMock.an === true,
        ...(settings.isAdmin === false ? {} : {
          categoryNames: namesTableMock(categories, categoryNames),
          criterionNames: namesTableMock(criteria, criterionNames) }),
        ...settings });
    /* SCHREIBEND, seit 0.19.0 -- und der Mock AENDERT SEINE ANTWORT WIRKLICH
: sonst waere „der Haken ist gesetzt" von „der Haken
       springt zurueck" nicht zu unterscheiden. */
    if (url === '/api/settings' && opt.method === 'PUT') {
      const sentBody = opt.body ? JSON.parse(opt.body) : {};
      if (sentBody.convertImages !== undefined) convertImages = !!sentBody.convertImages;
      // Die Grenzen beim Hochladen: dieselbe Spanne und dieselbe Absage wie am Server.
      if (sentBody.uploadLimits) {
        if (settings.isOwner === false)
          return give({ error: 'Das kann nur der Eigentümer dieser Installation.' }, 403);
        for (const [k, v] of Object.entries(sentBody.uploadLimits)) {
          const g = UPLOAD_RANGES_MOCK[k];
          if (!g || !Number.isInteger(v) || v < g.min || v > g.max)
            return give({ error: `Die Grenze muss eine ganze Zahl von ${g?.min} bis ${g?.max} MB sein.` }, 400);
          uploadLimitsMock[k] = v;
        }
        return give({ uploadLimits: { ...uploadLimitsMock } });
      }
      /* EIN SPRACHWECHSEL ANTWORTET MIT DEM SATZ DER NEUEN SPRACHE -- 0.24.4,
         und der echte Server tut genau das (nachgemessen: `localeOf(req)`
         liest den persoenlichen Schluessel, der in derselben Anfrage
         geschrieben wurde). */
      if (typeof sentBody.language === 'string' && sentBody.language) {
        const file = path.join(__dirname, 'public', 'languages', `${sentBody.language}.json`);
        if (fs.existsSync(file)) {
          /* DER PERSOENLICHE SCHLUESSEL ZIEHT WIRKLICH MIT -- 0.24.5, und der
             echte Server tut nichts anderes: `PUT /api/settings` schreibt
             ihn, und JEDE weitere Anfrage liest ihn in `localeOf(req)`. */
          settings.language = sentBody.language;
          const words = Object.fromEntries(
            Object.entries(JSON.parse(fs.readFileSync(file, 'utf8')))
              .filter(([k]) => k.startsWith('vocabulary.'))
              .map(([k, v]) => [k.slice('vocabulary.'.length), v]));
          return give({ language: sentBody.language, vocabulary: words,
                        vocabularies: { ...settings.vocabularies, [sentBody.language]: words },
                        vocabulariesOwn: settings.vocabulariesOwn,
                        vocabularyDefaults: settings.vocabularyDefaults });
        }
      }
      /* UND EIN WECHSEL DER VORGABESPRACHE ANTWORTET MIT DEN BEIDEN
         NAMENSTAFELN -- 0.24.6 (F4). */
      if (sentBody.languageDefault !== undefined || sentBody.languageOn !== undefined) {
        const std = sentBody.languageDefault !== undefined
          ? String(sentBody.languageDefault) : baseLanguageMock();
        const pool = Array.isArray(sentBody.languageOn)
          ? sentBody.languageOn
          : (settings.languages || []).filter(a => a.active).map(a => a.code);
        settings.languages = (settings.languages || []).map(a => ({ ...a,
          isDefault: a.code === std, active: pool.includes(a.code) || a.code === std }));
        return give({ languages: settings.languages,
          ...(settings.isAdmin === false ? {} : {
            categoryNames: namesTableMock(categories, categoryNames),
            criterionNames: namesTableMock(criteria, criterionNames) }) });
      }
      /* NUR DER GEAENDERTE WERT ZURUECK, nicht die ganze Antwort: bis 0.18.1
         fiel dieser Weg auf `give({})` durch, und mehrere Karten lesen aus
         dem Ergebnis. */
      return give({ convertImages });
    }
    if (url === '/api/settings') return give({ name: 'chefin', trashDays: 30,
      convertImages, twoFactor: zfStatusMock.an === true,
      uploadLimits: { ...uploadLimitsMock }, uploadLimitRanges: UPLOAD_RANGES_MOCK, ...settings });
    /* DER PAPIERKORB IM MOCK, und er muss BEIDE Zustaende koennen: gefuellt
       und leer. */
    if (url === '/api/trash') {
      if (settings.isAdmin === false)
        return give({ error: 'Das verwaltet nur der Admin.' }, 403);
      return give({ days: 30, rows: trash });
    }
    /* Die Sicherung. Sie steht hinter dem EIGENTUEMER, und der Mock macht das
       mit -- antwortete er jedem mit 200, waere die Rolle unpruefbar. */
    if (String(url).split('?')[0] === '/api/backup' && (opt.method || 'GET') === 'GET') {
      if (settings.isOwner === false)
        return give({ error: 'Das kann nur der Eigentümer dieser Installation.' }, 403);
      /* DIE VORSCHAU RECHNET WIRKLICH -- und zwar aus den Werten der ABFRAGE,
         wie der echte Server. */
      const q = String(url).split('?')[1] || '';
      const numberOut = (n) => {
        const m = q.match(new RegExp(`(?:^|&)${n}=([^&]*)`));
        return m ? Number(decodeURIComponent(m[1])) : null;
      };
      const gr = backup.cleanup && backup.cleanup.limits;
      if (!gr || !q) return give(backup);
      const b = numberOut('keep'), t = numberOut('days');
      for (const [value, span, event] of [[b, gr.keep, 'Immer behalten'],
                                         [t, gr.days, 'Erst löschen ab']]) {
        if (value === null) continue;
        if (!Number.isInteger(value) || value < span.min || value > span.max)
          return give({ error: `${event} muss eine ganze Zahl von ${span.min} bis ` +
                              `${span.max} sein.` }, 400);
      }
      const keep = b === null ? backup.cleanup.keep : b;
      const days = t === null ? backup.cleanup.days : t;
      //          die Mindestzahl                  das Alter
      const matched = cleanupCopies.slice(keep).filter(z => z.daysAgo > days);
      /* DIE VOLLSTAENDIGE LISTE MIT NUMMER UND MARKEN, wie der echte Server
         sie liefert -- juengste zuerst. */
      const names = new Set(matched.map(z => z.file));
      const oldNames = new Set((backup.cleanup.oldFiles || []).map(z => z.file));
      return give({ ...backup, cleanup: { ...backup.cleanup, keep, days,
        files: cleanupCopies.map((z, i) => ({ ...z, nr: i + 1,
          affected: names.has(z.file), outdated: oldNames.has(z.file) })),
        matched, bytes: matched.reduce((n, z) => n + z.bytes, 0),
        reason: matched.length ? '' : (cleanupCopies.length <= keep
          ? `Alle ${cleanupCopies.length} Backups sind unter den jüngsten ${keep}.`
          : `Die älteste ist ${cleanupCopies[cleanupCopies.length - 1].daysAgo} Tage alt.`) } });
    }
    /* Und der Loeschweg. */
    if (url === '/api/backup/cleanup' && opt.method === 'POST') {
      if (settings.isOwner === false)
        return give({ error: 'Das kann nur der Eigentümer dieser Installation.' }, 403);
      const k = JSON.parse(opt.body || '{}');
      if (k.kind !== 'rule' && k.kind !== 'outdated')
        return give({ error: 'Diese Art des Aufräumens gibt es nicht.' }, 400);
      const a = backup.cleanup || {};
      const outdatedFiles = k.kind === 'outdated'
        ? (a.oldFiles || [])
        : cleanupCopies.slice(a.keep).filter(z => z.daysAgo > a.days);
      const names = new Set(outdatedFiles.map(z => z.file));
      for (let i = cleanupCopies.length - 1; i >= 0; i--)
        if (names.has(cleanupCopies[i].file)) cleanupCopies.splice(i, 1);
      const bytes = outdatedFiles.reduce((n, z) => n + z.bytes, 0);
      backup.number = Math.max(0, (backup.number || 0) - outdatedFiles.length);
      if (k.kind === 'outdated') { backup.outdated = 0; a.oldCount = 0; a.oldBytes = 0;
                                  a.oldFiles = []; }
      backup.cleanup = { ...a, matched: [], bytes: 0,
                               reason: 'Alle Backups sind unter den jüngsten ' + a.keep + '.' };
      return give({ ok: true, kind: k.kind, removed: outdatedFiles.length, notDeleted: 0, bytes,
                   reachable: true, number: backup.number, last: backup.last,
                   changedAt: backup.changedAt ?? null,
                   outdated: backup.outdated ?? 0,
                   cleanup: backup.cleanup });
    }
    /* Und die beiden Schreibwege, die ihren Stand WIRKLICH aendern
: ein Mock, der stur denselben Stand zurueckgaebe,
       machte "die Karte zeichnet sich neu" von "die Karte blieb stehen"
       ununterscheidbar. */
    if (url === '/api/backup/dir' && opt.method === 'PUT') {
      const place = String(JSON.parse(opt.body || '{}').place || '');
      if (place.includes('..') || place.startsWith('/'))
        return give({ error: 'Der Unterordner liegt im eingerichteten Backup-Ordner.' }, 400);
      backup.place = place;
      backup.filePath = place ? `/backup/${place}` : '/backup';
      backup.error = null;
      // gewechseltAm und veraltet gehen MIT -- der echte Server breitet
      // letzteSicherung() auch hier aus, und ein Mock, der sie weglaesst,
      // liesse die Karte nach dem Speichern harmloser aussehen als die Lage.
      return give({ ok: true, place, filePath: backup.filePath, reachable: true,
                   number: backup.number, last: backup.last,
                   changedAt: backup.changedAt ?? null,
                   outdated: backup.outdated ?? 0 });
    }
    if (url === '/api/backup' && opt.method === 'POST') {
      const file = 'kriterion-2026-08-23-19-00-00.sqlite';
      backup.number = (backup.number || 0) + 1;
      backup.last = { file, bytes: 52428800, at: '2026-08-23 19:00:00', daysAgo: 0 };
      backup.reachable = true;
      /* `cleaned` STEHT AUSDRUECKLICH DA UND IST null: der Schalter der
         Prueflage ist aus, also hat der Anschluss nichts getan. */
      return give({ ok: true, file, filePath: backup.filePath, bytes: 52428800, ms: 512,
                   reachable: true, number: backup.number, last: backup.last,
                   changedAt: backup.changedAt ?? null,
                   outdated: backup.outdated ?? 0, cleaned: null });
    }
    /* Und die beiden Wege, die den Bestand WIRKLICH aendern: ein Mock, der beim Zurueckholen zwar antwortet, aber dieselbe
       Liste weiterliefert, macht "die Karte zeichnet sich neu" von "die Karte
       blieb stehen" ununterscheidbar -- beide Faelle blieben gruen. */
    if (/^\/api\/trash\/\d+\/restore$/.test(url) && opt.method === 'POST') {
      const nr = Number(url.split('/')[3]);
      const removed = trash.findIndex(z => z.id === nr);
      if (removed < 0) return give({ error: 'Nicht gefunden' }, 404);
      const [row] = trash.splice(removed, 1);
      return give({ ok: true, itemId: 77, title: row.title, items: 1,
                   authorUnknown: row.id === 502 ? ['dora'] : [] });
    }
    if (/^\/api\/trash\/\d+$/.test(url) && opt.method === 'DELETE') {
      const nr = Number(url.split('/').pop());
      const removed = trash.findIndex(z => z.id === nr);
      if (removed < 0) return give({ error: 'Nicht gefunden' }, 404);
      trash.splice(removed, 1);
      return { ok: true, status: 204, json: async () => ({}) };
    }
    /* Die eigenen Anmeldungen. */
    if (url === '/api/sessions' && (opt.method || 'GET') === 'GET')
      return give({ sessions: sessions.slice(), days: 30 });
    if (url === '/api/sessions' && opt.method === 'DELETE') {
      const n = sessions.filter(z => !z.current).length;
      for (let i = sessions.length - 1; i >= 0; i--) if (!sessions[i].current) sessions.splice(i, 1);
      return give({ ended: n });
    }
    if (/^\/api\/sessions\/[0-9a-f]+$/.test(url) && opt.method === 'DELETE') {
      const k = url.split('/').pop();
      const removed = sessions.findIndex(z => z.id === k);
      if (removed < 0) return give({ error: 'Diese Anmeldung gibt es nicht mehr.' }, 404);
      sessions.splice(removed, 1);
      return give({ ended: 1 });
    }
    if (url === '/api/users' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      const newerUser = { id: 9, username: k.username, role: k.role || 'user',
                            status: 'active', withoutPassword: k.sendInvite === true };
      // Auch hier zieht der Mock wirklich mit: die Liste danach ist eine andere.
      users.users.push({ ...newerUser, last_login: null,
                               created_at: '2026-08-24 09:00:00', entries: 0 });
      /* DER VERSANDZUSTAND KOMMT VOM SERVER, seit 0.9.0 -- und der Mock
         rechnet ihn NACH statt ihn zu setzen: mit Mailzugang und Adresse geht
         etwas hinaus, ohne eines von beiden nicht. */
      return give(k.sendInvite === true
        ? { ...newerUser, token: 'e'.repeat(64), purpose: 'invite', days: 7, minutes: 15,
            ...deliveryState(k.email) }
        : newerUser);
    }
    // Die Karte "Zugaenge" holt sich die Liste selbst.
    if (url === '/api/users') return give(users);
    /* Der Link fuer einen vorhandenen Zugang. */
    if (/^\/api\/users\/\d+\/token$/.test(url) && opt.method === 'POST') {
      const nr = Number(url.split('/')[3]);
      const z = (users.users || []).find(q => q.id === nr) || {};
      /* WOHER DIE ADRESSE KAM, gehoert in die Antwort -- der echte Server
         sagt es seit 0.8.90. Die Vorgabe ist der Browserweg; eine Prueflage
         kann ueber publicAddress den anderen Zustand stellen, und ohne beide
         liesse sich die Zeile im Linkkasten gar nicht pruefen. */
      return give({ id: nr, username: z.username, token: 'd'.repeat(64),
                   purpose: (JSON.parse(opt.body || '{}').purpose) || 'invite',
                   days: 7, minutes: 15, withoutPassword: Boolean(z.withoutPassword),
                   link: publicAddress ? `${publicAddress}/#/invite/${'d'.repeat(64)}` : null,
                   linkSource: publicAddress ? 'einstellung' : 'browser',
                   // Am BESTEHENDEN Zugang haengt die Adresse an der Zeile und
// nicht am Formular; userAddresses sagt, welche eine hat.
                   ...deliveryState(userAddresses[nr]) });
    }
    /* Die zweite Bestaetigung. */
    if (url === '/api/confirm' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== DOM_PASSWORD)
        return Promise.resolve({ ok: false, status: 403,
          json: () => Promise.resolve({ error: 'Das Passwort stimmt nicht.' }) });
      return give({ ok: true, purpose: k.purpose, seconds: 120 });
    }
    /* SEIT 0.13.0 KENNT DIE ROUTE EINE AUSWAHL. */
    if (String(url).split('?')[0] === '/api/security-log') {
      /* DERSELBE NAME, DEN DER SERVER LIEST -- 0.35.0. Bis dahin stand hier
         `gruppe`, und weil der Browser denselben deutschen Namen schickte,
         sah der Pruefstand einen Filter, den es am echten Server nie gab. */
      const group = (String(url).match(/[?&]group=([^&]*)/) || [])[1];
      if (!group) return give(log);
      const kinds = DOM_PROT_GROUPS[decodeURIComponent(group)];
      if (!kinds) return give({ error: 'Diese Ansicht gibt es nicht.' }, 400);
      const rows = (log.rows || []).filter(z => kinds.includes(z.event));
      return give({ ...log, rows, group: decodeURIComponent(group),
                   total: (log.counts || {})[decodeURIComponent(group)] ?? rows.length });
    }

    if (/^\/api\/users\/\d+\/inventory$/.test(url))
      return give({ username: 'bert', entries: 2, foreignComments: 3, foreignRatings: 1,
                   foreignTestDays: 0, comments: 4, ratings: 2, testDays: 1 });
    /* GET /api/items?q=... -- der Suchweg, seit 0.11.0. */
    /* ---- DIE BEIDEN ZAHLEN, DIE MIT DER LISTE MITREISEN -- 0.16.0 ---- WIE
       DER ECHTE SERVER, und darauf kommt es an:
       `offeneAufgaben` wird aus DERSELBEN Menge gerechnet, aus der /api/open
       seine Liste nimmt -- kind = 'task'. */
    const includingHeadCounts = (list, wasSearch) => list.map(i => {
      const row = {
        openTasks: open.filter(z => z.kind === 'task' && z.item?.id === i.id).length,
        ...i
      };
      if (!settings.bellSeen)
        for (const k of ['newComments', 'newRatings', 'newFrom']) delete row[k];
      /* DER TREFFERKONTEXT STEHT NUR IN DER ANTWORT AUF EINE SUCHE -- 0.18.0,
         und der Mock macht das mit. */
      if (!wasSearch) delete row.foundAt;
      return row;
    });
    if (url.startsWith('/api/items?q=')) {
      if (searchError) return give({ error: 'Die Suche ist gerade nicht erreichbar.' }, 500);
      const qRaw = decodeURIComponent(url.slice('/api/items?q='.length));
      const qMock = qRaw.trim().toLowerCase();
      const source = overviewItems || overview;
      // DIESELBE FORM WIE OHNE SUCHE: der echte Server geht durch dieselbe
      // Schleife.
      const response = give(includingHeadCounts(
        qMock ? source.filter(i => String(i.title || '').toLowerCase().includes(qMock)) : source, !!qMock));
      /* EINE STELLBARE VERZOEGERUNG JE ANFRAGE, seit 0.11.0. */
      if (Array.isArray(searchThrottles)) {
        const ms = searchThrottles[searchThrottle++] || 0;
        if (ms > 0) return new Promise(r => setTimeout(() => r(response), ms));
      }
      return response;
    }
    if (url === '/api/items') return give(includingHeadCounts(overviewItems || overview));
    /* Ein ZWEITER Eintrag, nur fuer den Vergleich: dort holt die Ansicht
       mehrere Detailantworten nebeneinander. */
    if (secondEntry && url === `/api/items/${secondEntry.id}`) return give(secondEntry);
    /* PUT auf den Eintrag: der echte Server antwortet mit detail() NACH der
       Aenderung, der Mock muss das nachmachen. */
    if (url === '/api/items/1' && opt.method === 'PUT') {
      const core = JSON.parse(opt.body || '{}');
      /* DIE DREI ANGABEN ZUR ABLEHNUNG SCHREIBT DER SERVER ZUSAMMEN, und der
         Mock muss das nachmachen: die Oberflaeche schickt `rejectedReason`
         und bekommt `rejected_reason` samt Datum und Verfasserobjekt zurueck. */
      const togglesIn = core.rejected === true && !example.rejected;
      const reasonRaw = String(core.rejectedReason ?? '').replace(/\s+/g, ' ').trim();
      if (core.rejected !== undefined) example.rejected = !!core.rejected;
      if (togglesIn) {
        example.rejected_at = '2026-08-29 09:12:00';
        example.rejectedAuthor = vChefin;
        example.rejectedMine = vChefin.id === users.ich;
        example.rejected_reason = reasonRaw;
      } else if (core.rejectedReason !== undefined) {
        example.rejected_reason = reasonRaw;
        /* WER ENTFERNT, WIRD NICHT VERFASSER -- wie im echten Server seit
           0.15.0. */
        if (!example.rejectedAuthor && reasonRaw) {
          example.rejectedAuthor = vChefin;
          example.rejectedMine = vChefin.id === users.ich;
        }
      }
      delete core.rejected; delete core.rejectedReason;
      Object.assign(example, core);
      return give(example);
    }
    /* VOR dem Sammelfall darunter: startsWith('/api/items/1') faenge diesen
       Pfad sonst ab und lieferte den ganzen Eintrag. */
    if (url === '/api/items/1/inventory')
      return give({ photos: 1,
                   ownFiles: 5, foreignFiles: 7,
                   ownLinks: 6, foreignLinks: 8,
                   ownComments: 2, foreignComments: 4,
                   ownRatings: 1, foreignRatings: 3,
                   ownTestDays: 1, foreignTestDays: 2 });
    /* Wer welchen Wert vergeben hat -- seit 0.8.6 ein eigener Endpunkt hinter
       nurAdmin, und der Mock macht BEIDES mit. */
    if (url === '/api/items/1/votes') {
      if (settings.isAdmin === false)
        return give({ error: 'Das verwaltet nur der Admin.' }, 403);
      return give(matchResponse);
    }
    // Der Weg fuer eine fremde Bewertung. Der echte Server antwortet mit dem
    // neu gezeichneten Eintrag -- UND die Stimme ist danach wirklich weg.
    if (/^\/api\/ratings\/\d+$/.test(url) && opt.method === 'DELETE') {
      const removed = Number(url.split('/').pop());
      for (const z of matchResponse) z.votes = z.votes.filter(st => st.id !== removed);
      return give(example);
    }
    /* PUT auf ein Kriterium. */
    if (/^\/api\/criteria\/\d+$/.test(url) && opt.method === 'PUT') {
      const k = criteria.find(c => c.id === Number(url.split('/').pop()));
      const body = JSON.parse(opt.body || '{}');
      if (body.weight !== undefined) {
        const g = Number(body.weight);
        if (!Number.isFinite(g) || g < 0.2 || g > 2)
          return give({ error: 'Das Gewicht muss eine Zahl zwischen 0,2 und 2 sein.' }, 400);
        k.weight = Math.round(g * 100) / 100;
      }
      /* DER NAME GEHT SEIT 0.24.5 DURCH writeNameMock -- bis 0.24.4 stand
         hier `k.name = body.name`, und damit landete eine UEBERSETZUNG in der
         Grundzeile: der Mock kannte die Sprachangabe des Rumpfes nicht,
         obwohl die Karte sie seit 0.24.3 mitschickt. */
      /* UND DAS ✕ -- 0.25.0 (F5). */
      if (body.clearName === true) {
        const cleared = writeNameMock(criteria, criterionNames, k.id, body);
        if (!cleared) return give(
          { error: 'Der Originaltext lässt sich nicht entfernen.' }, 400);
        return give(withNames([{ ...cleared }], criterionNames)[0]);
      }
      if (body.name) writeNameMock(criteria, criterionNames, k.id, body);
      return give(withNames([{ ...k }], criterionNames)[0]);
    }
    /* UND DASSELBE AN DER KATEGORIE -- 0.24.5. */
    if (/^\/api\/product-categories\/\d+$/.test(url) && opt.method === 'PUT') {
      const body = JSON.parse(opt.body || '{}');
      const row = writeNameMock(categories, categoryNames, Number(url.split('/').pop()), body);
      if (!row) return give(body.clearName === true
        ? { error: 'Der Originaltext lässt sich nicht entfernen.' }
        : { error: 'Diese Kategorie gibt es nicht mehr.' }, body.clearName === true ? 400 : 404);
      return give(withNames([{ ...row }], categoryNames)[0]);
    }
    /* DER EINE GRIFF FUER DIE UNBEKANNTE ERSTELLUNGSSPRACHE -- 0.25.0 (F2). */
    if (url === '/api/names/language' && opt.method === 'PUT') {
      const body = JSON.parse(opt.body || '{}');
      if (typeof body.language !== 'string' || !body.language)
        return give({ error: 'Diese Sprache steht nicht zur Wahl.' }, 400);
      let n = 0, m = 0;
      for (const z of categories) if (z.language == null) { z.language = body.language; n++; }
      for (const z of criteria) if (z.language == null) { z.language = body.language; m++; }
      return give({ categories: n, criteria: m,
                    categoryNames: namesTableMock(categories, categoryNames),
                    criterionNames: namesTableMock(criteria, criterionNames) });
    }
    /* Die Ansicht "Offen". */
    if (url === '/api/open')
      return give(open.filter(z => z.kind === 'task').map(z => ({
        id: z.id, text: z.text, created_at: z.created_at,
        item: z.item, mine: z.mine, author: z.author })));
    /* PUT auf einen Kommentar: der echte Server schreibt die Art und
       antwortet mit dem neu gebauten Eintrag. */
    if (/^\/api\/comments\/\d+$/.test(url) && opt.method === 'PUT') {
      const nr = Number(url.split('/').pop());
      const body = JSON.parse(opt.body || '{}');
      if (body.kind !== undefined) {
        const row = open.find(z => z.id === nr);
        if (row) row.kind = body.kind;
        const k = example.comments.find(c => c.id === nr);
        if (k) k.kind = body.kind;
      }
      return give(example);
    }
    /* LOESCHEN ZIEHT WIRKLICH MIT. */
    if (/^\/api\/photos\/\d+$/.test(url) && opt.method === 'DELETE') {
      const pathId = Number(url.slice(url.lastIndexOf('/') + 1));
      example.photos = example.photos.filter(p => p.id !== pathId);
      return give({ ok: true });
    }
    /* DER AUSSCHNITT, seit 0.19.0. */
    if (/^\/api\/photos\/\d+\/focus$/.test(url) && opt.method === 'PUT') {
      const nr = Number(url.split('/')[3]);
      const k = (v, min, max) => Math.min(max, Math.max(min, Number(v)));
      const f = example.photos.find(p => p.id === nr);
      if (f) {
        const sentBody = opt.body ? JSON.parse(opt.body) : {};
        f.focus_x = k(sentBody.x, 0, 100); f.focus_y = k(sentBody.y, 0, 100);
        if (sentBody.zoom !== undefined) f.zoom = k(sentBody.zoom, 100, 400);
      }
      return give(example);
    }
    if (url.startsWith('/api/items/1')) return give(example);
    // Endpunkte, die den ganzen Eintrag zurueckgeben.
    if (/^\/api\/comments\/\d+/.test(url) || /^\/api\/comment-images\/\d+$/.test(url) ||
        /^\/api\/items\/1\/comments$/.test(url))
      return give(example);
    if (url.startsWith('/api/attachments/41/preview'))
      return give({ kind: 'text', text: 'Erste Zeile\nZweite Zeile', shortened: false });
    /* Die Kennzahlen stehen seit 0.8.5 hinter nurAdmin, und der Mock macht
       das mit. */
    if (url === '/api/stats') {
      if (settings.isAdmin === false)
        return give({ error: 'Das verwaltet nur der Admin.' }, 403);
      /* Der Fingerprint gehoert seit 0.8.10 dazu. */
      /* videoCount/videoBytes und papierkorbCount/papierkorbBytes stehen
         hier, weil die Karten sie LESEN: die Exportkarte rechnet die
         erwartete Groesse aus videoBytes, die Kennzahlenkarte zeigt den
         Papierkorb als eigene Zeile. */
      /* `export` und die Kommentarbilder stehen hier seit 0.12.3, aus
         demselben Grund wie die beiden Absaetze darueber: die Karten LESEN
         sie. */
      return give({ dbBytes: 1, photoCount: 0, photoBytes: 0, itemCount: 1,
        videoCount: 0, videoBytes: 0,
        commentCount: 0, linkCount: 0, testDayCount: 0, attachmentCount: 4, attachmentBytes: 6144,
        trashCount: 2, trashBytes: 2560,
        commentImageCount: 3, commentImageBytes: 1536,
        export: statsExport || { envelope: 4096, photos: 65536, videos: 32768,
          attachments: 8192, commentImages: 2048,
          warnFrom: 300 * 1024 * 1024, limit: 483183799 },
        version: require('./package.json').version, fingerprint: 'a1b2c3d4',
        /* DIE AUFTEILUNG NACH FORMAT und der Stand eines Laufs. */
        imageFormats: statsImageFormats === undefined
          ? { png: { count: 12, bytes: 6291456 }, jpeg: { count: 5, bytes: 524288 },
              webp: { count: 2, bytes: 65536 } }
          : statsImageFormats,
        conversion: statsSwitch,
        geometry: statsGeometry,
        /* DIE ALGORITHM, seit 0.16.0 -- dieselben Werte, die db.js aus der
           geoeffneten Datei abliest. */
        method: statsMethod === undefined
          ? { cipher: 'sqlcipher', keyBits: 256, journal: 'WAL', passwords: 'scrypt' }
          : statsMethod,
        keyFromEnv: false, keyHex: 'ab'.repeat(32) });
    }
    return give({});
  };
  /* Zaehlt die offenen Anfragen fuer openRequests(). Abgezogen wird erst nach
     einem Durchlauf des Event Loop: dann hat die Seite die Antwort verarbeitet. */
  w.fetch = (url, opt) => {
    PENDING.set(w, openRequests(w) + 1);
    return answer(url, opt).finally(() =>
      setTimeout(() => PENDING.set(w, openRequests(w) - 1), 0));
  };
  /* DIE UEBERSETZUNG KOMMT AUS DEM GRUNDDOKUMENT -- 0.30.0, F4. Gelaufen wird
     sie im Zusammenhang DIESES Fensters; geteilt ist allein die Uebersetzung. */
  try { BASE_SCRIPT.runInContext(dom.getInternalVMContext()); }
  catch (e) { silenceConsole.emit('jsdomError', e instanceof Error ? e : new Error(String(e))); }
  return { w, sent, criteria, example, matchResponse, categoryNames, criterionNames };
}
/* ---- WARTEN, BIS ETWAS DASTEHT ----
   Fragt die Bedingung alle `stepMs` und wirft an der Grenze. Die Bedingung
   darf ein Promise liefern; zurueck kommt ihr erster wahrer Wert. */
const UNTIL_STEP = 5;
async function until(w, condition, limitMs = 3000, what = 'die Bedingung', stepMs = UNTIL_STEP) {
  const end = Date.now() + limitMs;
  for (;;) {
    let there = false;
    try { there = await condition(w); } catch { there = false; }
    if (there) return there;
    if (Date.now() >= end)
      throw new Error(`until(): ${what} ist in ${limitMs} ms nicht eingetreten`);
    await new Promise(r => setTimeout(r, stepMs));
  }
}

// Die Anfragen eines Fensters an den gestellten Server, die noch keine Antwort haben.
const PENDING = new WeakMap();
const openRequests = (w) => PENDING.get(w) || 0;

/* DIE TAGZEILE AUFKLAPPEN -- 0.24.0 (Bauabschnitt 0.2). */
async function openTagRow(w) {
  const button = w.document.getElementById('f-weitere');
  if (button && button.getAttribute('aria-expanded') === 'false') button.onclick();
  await until(w, (x) => x.document.getElementById('f-tagrow'), 200, 'die Tagzeile');
  return w.document.getElementById('f-tagrow');
}


/* WARTEN, BIS DIE SUCHE DURCH IST: der Debounce ist abgelaufen, und keine
   Suchanfrage ist mehr unterwegs. */
async function waitSearch(w, limitMs = 3000) {
  await until(w, (x) => x.eval('searchClock') === null && !x.eval('state.searchRunning') &&
    openRequests(x) === 0, limitMs, 'das Ende der Suche');
}

/* ---- Einen Abschnitt des Systembereichs zeichnen ----
   Eine Karte steht frueher da als ihr Inhalt: gewartet wird, bis die
   Anfragen, mit denen die Karten nachladen, beantwortet sind. */
async function sysSection(w, key) {
  w.history.replaceState(null, '', `#/system/${key}`);
  await w.renderSystem();
  await until(w, (x) => openRequests(x) === 0, 3000, `die Karten des Abschnitts ${key}`);
}

/* ---- DER NAME UND DAS MERKMAL EINER SPRACHPILLE -- 0.25.0 ---------------
   SEIT DIESER RUNDE TRAEGT EINE SPRACHPILLE ZWEI ANGABEN: den Namen der
   Sprache und dahinter ein Merkmal -- einen Punkt `●` fuer „fuer jede Zeile
   ist etwas eingetragen" oder die ZAHL der fehlenden Zellen. */
const pillName = (b) => ((b && b.firstChild && b.firstChild.textContent) || '').trim();
const pillMark = (b) => {
  const mark = b && b.querySelector ? b.querySelector('.n, .dot') : null;
  return mark ? (mark.textContent || '').trim() : '';
};

/* EIN DURCHGANG DURCH ALLE ABSCHNITTE -- Karten, Reiter und der ganze Text. */
/* ================= Der Bildschirmtext-Waechter: der Leser =================
   0.22.0. */
function screenTextsFrom(src) {
  const out = [];
  let i = 0;
  const n = src.length;
  const row = (pos) => src.slice(0, pos).split('\n').length;
  // Ein Schraegstrich beginnt ein Ausdrucksliteral, wenn davor kein Wert steht.
  const regexAllowed = (pos) => {
    let j = pos - 1;
    while (j >= 0 && /\s/.test(src[j])) j--;
    if (j < 0) return true;
    return /[(,=:\[!&|?{};+\-*%<>~^]/.test(src[j]) ||
      /\b(return|typeof|case|in|of|do|else)$/.test(src.slice(Math.max(0, j - 6), j + 1));
  };
  // Liest Code; mit `stop` bis zur schliessenden Klammer eines ${…}.
  function code(stop) {
    let depth = 0;
    while (i < n) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
      if (c === "'" || c === '"') {
        const start = i; i++; let s = '';
        while (i < n && src[i] !== c) {
          if (src[i] === '\\') { s += src[i + 1]; i += 2; continue; }
          if (src[i] === '\n') break;
          s += src[i]; i++;
        }
        i++; out.push({ text: s, row: row(start) }); continue;
      }
      if (c === '`') { i++; template(); continue; }
      if (c === '/' && regexAllowed(i)) {
        i++; let cls = false;
        while (i < n && (cls || src[i] !== '/') && src[i] !== '\n') {
          if (src[i] === '\\') { i += 2; continue; }
          if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false;
          i++;
        }
        i++; while (i < n && /[a-z]/.test(src[i])) i++; continue;
      }
      if (stop) { if (c === '{') depth++; else if (c === '}') { if (depth === 0) { i++; return; } depth--; } }
      i++;
    }
  }
  // Liest eine Vorlage: Text bis zum Backtick, ${…} geht zurueck in den Code.
  function template() {
    let s = ''; const start = i;
    while (i < n) {
      const c = src[i];
      if (c === '\\') { s += src[i + 1]; i += 2; continue; }
      if (c === '`') { i++; break; }
      if (c === '$' && src[i + 1] === '{') {
        if (s.trim()) out.push({ text: s, row: row(start) });
        s = ''; i += 2; code(true); continue;
      }
      s += c; i++;
    }
    if (s.trim()) out.push({ text: s, row: row(start) });
  }
  code(false);
  return out;
}
/* Die Serverdateien: nur die Texte hinter `error:`, samt Fortsetzungszeilen
   mit `+`. Alles andere in server.js ist keine Bildschirmsprache. */
function serverTextsFrom(src) {
  const out = [];
  const re = /error:\s*/g; let m;
  while ((m = re.exec(src))) {
    const j = m.index + m[0].length;
    let endRecord = j, q = null, depth = 0;
    while (endRecord < src.length) {
      const c = src[endRecord];
      if (q) { if (c === '\\') { endRecord += 2; continue; } if (c === q) q = null; endRecord++; continue; }
      if (c === "'" || c === '"' || c === '`') { q = c; endRecord++; continue; }
      if (c === '{' || c === '(') depth++;
      if (c === '}' || c === ')') { if (depth === 0) break; depth--; }
      if (c === ';') break;
      endRecord++;
    }
    const row = src.slice(0, m.index).split('\n').length;
    for (const t of screenTextsFrom(src.slice(j, endRecord) + ' ')) out.push({ text: t.text, row });
  }
  return out;
}
/* DIE VERBOTSLISTE DER RUNDE 0.22.0 (Konzept, 4.3) -- Woerter, die den
   Bildschirm verlassen haben. */
const SCREEN_BAN = [
  [/\bträgt\b|\btrifft\b|\btragen\b/, 'trägt/trifft (für gilt)'],
  [/\bfallen\b|\bfällt\b/, 'fallen/fällt (für enden)'],
  [/\bBlick\b/, 'Blick (für Besuch)'], [/\bTafel\b/, 'Tafel'], [/Grabstein/, 'Grabstein'], [/\bWirt\b/, 'Wirt'],
  [/Sicherungsweg|Austauschweg/, 'Sicherungsweg/Austauschweg'],
  [/Haus verlässt|Hausanschluss|aus dem Haus/, 'das Haus'],
  [/TLS von Anfang an/, 'TLS von Anfang an'], [/Ableitung/, 'Ableitung'], [/nachziehen|nachgezogen/, 'nachziehen'],
  [/[Hh]ereinkommen/, 'Hereinkommen'],
  [/\bliegen\b(?<!zwischen [^.]*liegen)(?<!Zukunft liegen)/, 'liegen (für gespeichert sein)'],
  [/\bProbe\b/, 'Probe (für Vorschau)'], [/\bNäher\b/, 'Näher (für Zoom)'],
  [/\bElemente?\b/, 'Element (für Foto/Video)'], [/Betriebsart/, 'Betriebsart'], [/Rohtext/, 'Rohtext'],
  [/\bRechnung\b/, 'Rechnung (für Berechnung)'], [/Zustand zurücksetzen/, 'Zustand zurücksetzen'],
  [/\bKasten\b/, 'Kasten'], [/Passwortspeicher/, 'Passwortspeicher'], [/\bUmgebung\b/, 'Umgebung'],
  [/\bgezogen\b/, 'gezogen (für erstellt)'], [/\bStück\b/, 'Stück (für Dateien)'],
  [/\bBoden\b|\bSchere\b|\bDeckel\b|\bPille\b|\bKiste\b|\bKlemme\b|\bWächter\b|Stolperstein|Rückbau|Bestandslauf|Migrationsblock|Austauschformat/, 'ein Bild des Projekts'],
  [/Fingerprint(?!\))/, 'Fingerprint ohne Erklärung'],
  [/Systembereich|Selbstanmeldung|Suchanbieter|Startanbieter|Bildablage|\bStimmen?\b|Gesamtschnitt|Sicherungsort|Zielort|Verwaltungsbereich|Rücksetzlink|Wunsch-Benutzername|Zugänge\b|Bewertungskriterien|Freigeben|Freigegeben|unwiderruflich|stillgelegt|Alles anzeigen|Kopien?\b|Sicherung(?!\s+der\s+Datenbank)|\bsichern\b/, 'ein Wort, das das Wörterbuch ersetzt hat'],
  [/\bZugangs?\b(?! anfragen)(?!\?)/, 'Zugang (für Benutzer/Konto)'],
  [/\b0\.\d+\.\d+\b/, 'eine Versionsnummer'],
];
// Adressen und Selektoren sind kein Bildschirmtext: '/api/items', '#/system', '.thumb'.
const isAddress = (t) => /^[\/#.][^ ]*$/.test(t.trim());
function screenViolations(texts) {
  const out = [];
  for (const t of texts) {
    if (isAddress(t.text)) continue;
    for (const [re, name] of SCREEN_BAN)
      if (re.test(t.text)) out.push(`Z. ${t.row} [${name}]: ${t.text.trim().replace(/\s+/g, ' ').slice(0, 90)}`);
  }
  return out;
}

async function sysPass(d) {
  const cards = [], pieces = [];
  const tab = [...d.w.document.querySelectorAll('.sys-tab')]
    .map(a => a.getAttribute('href'));
  for (const address of tab) {
    d.w.history.replaceState(null, '', address);
    await d.w.renderSystem();
    await until(d.w, (x) => openRequests(x) === 0, 3000, `die Karten unter ${address}`);
    cards.push(...[...d.w.document.querySelectorAll('.sys-grid > .sys-card h3')]
      .map(h => h.textContent.trim()));
    pieces.push(d.w.document.getElementById('app')?.textContent || '');
  }
  return { cards, tab, text: pieces.join('\n') };
}


/* ================= DREI LESER DES STILBLATTS -- hierher in 0.34.0 =========
   Sie standen bis 0.33.2 mitten in checkUi() und werden seit dem Umzug von
   drei Modulen gebraucht: Export, Stilblatt und Sprache. */
  const css123 = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  const regel123 = (choice) => (css123.match(new RegExp(choice.replace(/\./g, '\\.') + ' \\{[^}]*\\}')) || [''])[0];
  /* WAS AUSSERHALB JEDER MEDIENABFRAGE STEHT. */
  const withoutMedia = (() => {
    const raw = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    let outcome = '', i = 0;
    while (i < raw.length) {
      const a = raw.indexOf('@media', i);
      if (a < 0) { outcome += raw.slice(i); break; }
      outcome += raw.slice(i, a);
      let j = raw.indexOf('{', a), depth = 0;
      if (j < 0) break;
      for (; j < raw.length; j++) {
        if (raw[j] === '{') depth++;
        else if (raw[j] === '}' && --depth === 0) { j++; break; }
      }
      i = j;
    }
    return outcome.replace(/\s+/g, ' ');
  })();


return {
  DOM_PASSWORD, DOM_LOG, DOM_PROT_GROUPS, placeConfirm, confirmImDom,
  DOM_PROVIDER, MAIL_HINT_KEYS, DE_TEXTS, shows, buildDom, openTagRow,
  waitSearch, until, UNTIL_STEP, openRequests, sysSection, pillName, pillMark,
  screenTextsFrom, serverTextsFrom, SCREEN_BAN, isAddress,
  screenViolations, sysPass, css123, regel123, withoutMedia
};
})(H.__dirname, H.require);
