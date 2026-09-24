const app = document.getElementById('app');

/* ================= Grundlagen ================= */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ================= Die Sprache ================= */
/* TEXT IST DATEN UND NICHT PROGRAMM. */
let LANGUAGE = 'en';
let LOCALE = 'en-GB';
let TEXTS = {};
let TEXTS_FALLBACK = {};
/* WELCHE SPRACHE DIE INSTALLATION VORGIBT -- aus /api/config. */
let LANGUAGE_DEFAULT = 'en';
/* DER VORRAT, aus dem gewaehlt werden darf: [{ code, name }]. Vor der
   Anmeldung aus /api/config, danach aus /api/settings -- dieselbe Liste. */
/* DAS GEDAECHTNIS DES GERAETS -- die zweite Quelle. */
/* EINMAL GEBAUT UND NICHT JE AUFRUF. `new Intl.PluralRules(...)` je Text waere
   bei 46 Mehrzahlstellen und jedem Neuzeichnen eine gut sichtbare Rechnung. */
let PLURAL = new Intl.PluralRules(LOCALE);
/* WELCHE FORM HINTER EINER ZAHL STEHT, und die Auskunft kommt aus
   der SPRACHDATEI und nicht von hier. */
let AFTER_NUMBER = 'plural';

// Den Satz nachschlagen -- in der gewaehlten Sprache, sonst in der Vorgabe.
function languageSentence(key, values) {
  const raw = TEXTS[key] !== undefined ? TEXTS[key] : TEXTS_FALLBACK[key];
  if (raw === undefined) return `⟦${key}⟧`;
  if (typeof raw !== 'object') return raw;
  /* DIE MEHRZAHL WAEHLT Intl.PluralRules UND NICHT `n === 1`. */
  return PLURAL.select(values.n) === 'one' ? raw.one : raw.other;
}

/* DIE WERTE EINSETZEN. */
function fillSentence(sentence, values, mask) {
  return String(sentence).replace(/\{(\w+)\}/g, (whole, name) => {
    let value = values[name];
    if (value === undefined && V && V[name] !== undefined) value = V[name];
    if (value === undefined) return whole;
    return mask ? esc(String(value)) : String(value);
  });
}

// Fuer textContent, title und placeholder: der nackte Text, `**` entfaellt.
function t(key, values = {}) {
  return fillSentence(languageSentence(key, values).replace(/\*\*/g, ''), values, false);
}
// Fuer innerHTML: `**Wort**` wird fett, jeder eingesetzte Wert maskiert.
// Fett vor dem Einsetzen, damit ein `**` in einem Wert nichts auszeichnet.
function tH(key, values = {}) {
  const sentence = languageSentence(key, values).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return fillSentence(sentence, values, true);
}

// Setzt fertiges HTML (`<code>`, `<span>`) in `{word}`, `{word2}` …; Text gehoert in den Satz.
const tMarks = (key, parts, values) => {
  const names = Object.keys(parts), marks = {};
  names.forEach((n, i) => { marks[n] = `\u0001${i}\u0001`; });
  let sentence = tH(key, { ...values, ...marks });
  names.forEach((n, i) => { sentence = sentence.replace(`\u0001${i}\u0001`, parts[n]); });
  return sentence;
};

/* DAS MERKMAL DER ABGELAUFENEN SITZUNG, und es ist ein BEFUND und
   keine Verbesserung. */
const SESSION_GONE = 'kriterion:session-gone';

/* Fotos je Anfrage, dieselbe Zahl wie in server.js. Der Browser teilt danach
   auf; der Server prueft noch einmal, weil die Route auch ohne Browser erreichbar ist. */
const PHOTO_COUNT = 40;
/* Die Grenzen beim Hochladen in MB; die Werte kommen aus GET /api/settings. */
let UPLOAD_LIMITS = { photo: 30, commentImage: 20, video: 20, commentVideo: 20, attachment: 50 };
let UPLOAD_LIMIT_RANGES = {};
// Die erste Datei ueber der Grenze ihrer Art, oder null.
const overLimit = (files, kind) => files.find(f => f.size > UPLOAD_LIMITS[kind] * 1048576) || null;
const tooBigText = (file, kind) => t('entry.tooBig', { name: file.name, mb: UPLOAD_LIMITS[kind] });

/* ZWEI FORMEN, UND DIE ZAHL WAEHLT -- ueber Intl.PluralRules und nicht ueber
   `n === 1`. */
function plural(n, one, other) {
  return PLURAL.select(Number(n) || 0) === 'one' ? one : other;
}

/* DASSELBE, ABER MIT EINER ZAHL DAVOR. `plural()` gilt ueberall
   dort, wo die Form allein von der Zahl abhaengt. */
function counted(n, one, other) {
  return AFTER_NUMBER === 'one' ? one : plural(n, one, other);
}

/* DIE DATEI HOLEN. */
async function loadLanguage(code) {
  const response = await fetch(`/languages/${code}.json`, { credentials: 'same-origin' });
  /* DIE BEIDEN WUERFE TRAGEN KEINEN SATZ, SONDERN EINE LAGE. */
  if (!response.ok) throw new Error(`languages/${code}.json ${response.status}`);
  const data = await response.json();
  // Ohne Locale kein Datum und keine Mehrzahl -- eine Datei ohne sie ist keine.
  if (!data || typeof data !== 'object' || typeof data._locale !== 'string')
    throw new Error(`languages/${code}.json _locale`);
  /* DIE RUECKFALLTAFEL WIRD GEFUELLT, WENN DIESE DATEI DIE VORGABE IST -- und
     das ist sie im Regelfall: nur wer eine ANDERE Sprache gewaehlt hat,
     braucht ueberhaupt zwei Dateien (siehe loadLanguages()). */
  if (code === LANGUAGE_DEFAULT) TEXTS_FALLBACK = data;
  LANGUAGE = code;
  LOCALE = data._locale;
  PLURAL = new Intl.PluralRules(LOCALE);
  /* NUR DIE BEIDEN BEKANNTEN WERTE ZAEHLEN; alles andere -- auch ein
     Tippfehler -- faellt auf `plural`. */
  AFTER_NUMBER = data._afterNumber === 'one' ? 'one' : 'plural';
  TEXTS = data;
  /* UND DIE VORGABE DES VOKABULARS. */
  V = { ...vocabularyDefault(), ...V };
  return data;
}

/* ZWEI DATEIEN, ABER NUR WENN ES SEIN MUSS. */
async function loadLanguages(wanted) {
  await loadLanguage(LANGUAGE_DEFAULT);
  if (!wanted || wanted === LANGUAGE_DEFAULT) return;
  try { await loadLanguage(wanted); }
  catch (e) { console.error(`languages/${wanted}.json`, e); }
}

/* HIER STAND DAS GEDAECHTNIS DES GERAETS (`kriterion.language`). */
/* WAS AM WURZELELEMENT STEHT -- daran haengen Silbentrennung und Vorleser. */
const applyLanguage = () => { document.documentElement.lang = LANGUAGE; };
/* DIE LOCALE DES VERGLEICHS, und sie ist NICHT die
   des Lesers (LOCALE). */
const compareLocale = () => TEXTS_FALLBACK._locale || LOCALE;

/* DIE VORGABEN DES VOKABULARS. */
const VOCABULARY_PREFIX = 'vocabulary.';
const vocabularyDefault = () => Object.fromEntries(
  Object.entries(TEXTS)
    .filter(([k]) => k.startsWith(VOCABULARY_PREFIX))
    .map(([k, v]) => [k.slice(VOCABULARY_PREFIX.length), v]));

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString(LOCALE, { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
/* HIER STAND fmtTagKurz() -- die Kurzform „19.08." fuer die Pille
   „Neu seit ...". */
function fmtDay(day) {
  const d = new Date(day + 'T12:00:00');
  return d.toLocaleDateString(LOCALE, { day:'2-digit', month:'2-digit', year:'numeric' });
}
function weekday(day) {
  return new Date(day + 'T12:00:00').toLocaleDateString(LOCALE, { weekday:'long' });
}
/* EINE ZAHL, WIE SIE DIE SPRACHE SCHREIBT. */
function number(n, digits = 0, atMost = digits) {
  const value = Number(n);
  return new Intl.NumberFormat(LOCALE, { minimumFractionDigits: digits,
    maximumFractionDigits: atMost, useGrouping: false })
    .format(Number.isFinite(value) ? value : 0);
}

function fmtBytes(b) {
  if (!b) return '0 B';
  const u = ['B','KB','MB','GB'];
  const i = Math.min(Math.floor(Math.log(b)/Math.log(1024)), u.length-1);
  return number(b/Math.pow(1024,i), i?1:0) + ' ' + u[i];
}
const today = () => new Date().toLocaleDateString('sv-SE');

/* WIE GROSS DIE EXPORTDATEI WIRD -- gerechnet aus den Teilen, die der Server
   in `stats.export` liefert. */
function exportSum(ex, s) {
  if (!ex) return 0;
  return (ex.envelope || 0)
    + (s.withPhotos ? (ex.photos || 0) : 0)
    + (s.withPhotos && s.withVideos ? (ex.videos || 0) : 0)
    + (s.withFiles ? (ex.attachments || 0) + (ex.commentImages || 0) : 0);
}
// Alles eingeschaltet -- die Zahl fuer die Kennzahlen, wo kein Schalter steht.
const exportTotal = (stats) => exportSum(stats && stats.export,
  { withPhotos: true, withFiles: true, withVideos: true });

/* DER FUENFTE WERT IST WEGGEFALLEN. */
/* DER SCHUTZ GEGEN FREMDE FORMULARE -- der Wert steht in einem Cookie ohne
   HttpOnly, damit genau diese Zeile ihn lesen kann; der Sitzungscookie
   bleibt dem Skript verborgen. */
const CSRF_NAMES = ['__Host-kriterion_csrf', 'kriterion_csrf'];
function csrfHeader() {
  for (const name of CSRF_NAMES) {
    const found = document.cookie.split(';')
      .map(z => z.trim()).find(z => z.startsWith(name + '='));
    if (found) return { 'x-csrf-token': found.slice(name.length + 1) };
  }
  return {};
}

async function api(method, url, body, isForm = false) {
  /* `Accept-Language` AN JEDER ANFRAGE. */
  const opts = { method, credentials: 'same-origin',
                 headers: { 'Accept-Language': LANGUAGE, ...csrfHeader() } };
  if (body !== undefined) {
    if (isForm) opts.body = body;
    else { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  }
  const res = await fetch(url, opts);
  if (res.status === 401) { showLogin(); throw new Error(SESSION_GONE); }
  if (!res.ok) {
    let m = t('error.serverStatus', { status: res.status });
    let j = null;
    try { j = await res.json(); } catch {}
    if (j && j.error) m = j.error;
    // Eine 413 ohne JSON kommt vom Reverse Proxy davor, nicht von Kriterion.
    else if (res.status === 413) m = t('error.proxyTooLarge');
    throw new Error(m);
  }
  return res.status === 204 ? null : res.json();
}

/* `action`: { text, tu } -- ein Knopf in der Meldung. */
function toast(msg, isErr = false, action = null) {
  document.querySelectorAll('.toast').forEach(m => m.remove());
  const el = document.createElement('div');
  el.className = 'toast' + (isErr ? ' err' : '') + (action ? ' with-btn' : '');
  el.textContent = msg;
  const duration = action ? 6000 : 2600;
  if (action) {
    const sep = document.createElement('span');
    sep.className = 'toast-sep';
    sep.textContent = '·';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'toast-btn';
    b.textContent = action.text;
    b.onclick = () => { el.remove(); action.tu(); };
    el.append(sep, b);
    el.style.animationDuration = duration + 'ms';
  }
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

const ICON_PH = `<svg class="ph" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M3.5 17l5-4.5 3.5 3 3-2.5 5.5 4.5"/></svg>`;
// Eine Liste mit Haken -- das Zeichen fuer "was ist noch offen". Es steht
// neben dem Zahnrad und traegt dieselbe Groesse wie dieses.
const ICON_OPEN = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6.5l2 2 3-3.5"/><path d="M3.5 13l2 2 3-3.5"/><path d="M3.5 19.5l2 2 3-3.5"/><path d="M12.5 6.5H21"/><path d="M12.5 13H21"/><path d="M12.5 19.5H21"/></svg>`;
/* DREI STRICHE. Es gibt kein besseres Zeichen fuer "hier ist noch mehr" --
   nicht weil es gut waere, sondern weil es jeder kennt. */
const ICON_MENU = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>`;
/* DIE DREI ZEICHEN AM BILDBEREICH. Sie ersetzen die Woerter "Ausschnitt" und
   "Vollbild" -- und der Papierkorb ist neu. */
const ICON_CROP = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v13a2 2 0 0 0 2 2h13"/><path d="M2 7h13a2 2 0 0 1 2 2v13"/></svg>`;
const ICON_FULLSCREEN = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H3v6"/><path d="M15 21h6v-6"/><path d="M21 9V3h-6"/><path d="M3 15v6h6"/></svg>`;
const ICON_TRASH = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l.9 12.6A1.5 1.5 0 0 0 8.9 21h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
const ICON_SEARCH = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>`;
/* DIE GLOCKE. */
const ICON_BELL = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8.5a6 6 0 1 0-12 0c0 5.2-2 6.5-2 6.5h16s-2-1.3-2-6.5"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/></svg>`;
const ICON_SYS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>`;
/* DIE ZEICHEN DER ZEILENAKTIONEN. */
const char = (paths, strokeWidth = 1.8) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICON_X = char('<path d="M6 6l12 12"/><path d="M18 6L6 18"/>');
const ICON_PEN = char('<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M13.5 6.5l3 3"/>');
const ICON_QUOTE = char('<path d="M9 7v5a5 5 0 0 1-4 5"/><path d="M19 7v5a5 5 0 0 1-4 5"/>');
const ICON_CHECK = char('<path d="M5 12.5l4.5 4.5L19 7"/>', 2.1);
const ICON_BOX = char('<rect x="4" y="4" width="16" height="16" rx="3"/>');
const ICON_BOX_CHECK = char('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12.5l3 3 5-6"/>');
const ICON_RESTORE = char('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-4"/>');
/* Das Zeichen „zuruecksetzen" an der Sternzeile -- ein Kreis, der zurueck
   laeuft, und ausdruecklich kein Kreuz: meine Sterne werden entfernt, nicht
   geloescht. */
const ICON_RESET = char('<path d="M4.5 12a7.5 7.5 0 1 0 2.6-5.7"/><path d="M4 4v5h5"/>');
const ICON_LINK = char('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/>');
const ICON_KEY = char('<circle cx="8" cy="15.5" r="4"/><path d="M11 12.5L20 3.5"/><path d="M17 6.5l2.5 2.5"/><path d="M14.5 9l2 2"/>');
const ICON_LOCK = char('<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>');
const ICON_PIN = char('<path d="M9 4h6l-1 6 2.5 2v2h-9v-2l2.5-2z"/><path d="M12 14v6.5"/>');
/* DAS ZEICHEN DES BERICHTS. */
const ICON_REPORT = char('<path d="M5 21V4.5"/><path d="M5 5.5h10.5l-1.6 3.2 1.6 3.3H5"/>');
/* DAS ZEICHEN „Eintrag entfernen". */
const ICON_ERASE = char('<path d="M8.5 20H20"/><path d="M14.5 5.5l4 4-8 8H6.5l-2-2z"/>');
/* ---- DER HAKEN NACH UNTEN UND NACH OBEN ---- */
const ICON_MORE_DOWN = char('<path d="M6 9.5L12 15.5l6-6"/>', 1.7);
const ICON_MORE_UP   = char('<path d="M6 14.5L12 8.5l6 6"/>', 1.7);
/* DER RUECKWEG IST EIN PFEIL MIT SCHAFT UND KEIN WINKEL: sonst stehen der
   Rueckweg zur Uebersicht und der Pfeil „ein Eintrag zurueck" als zwei
   gleiche Zeichen nebeneinander in derselben Zeile. */
const ICON_BACK_OUT = char('<path d="M19.5 12H5"/><path d="M11 5.5L4.5 12l6.5 6.5"/>', 1.6);

/* EIN LEERER BEREICH SIEHT GEWOLLT AUS UND NICHT KAPUTT. */
const emptyState = (sentence) => `<div class="empty-state"><span class="hint">${esc(sentence)}</span></div>`;

/* Die Marke der Instanz — EIN EINGEBAUTES SVG und keine Datei. */
const MARK = (s = 30) =>
  `<svg class="logo" viewBox="6.5 4.5 19 23" width="${Math.round(s * 19 / 23)}" height="${s}"`
  + ` aria-hidden="true" focusable="false" fill="none" stroke-linecap="round" stroke-width="3">`
  + `<path d="M8 6 V26" stroke="var(--brand-grey)"/>`
  + `<path d="M8 10 H15" stroke="var(--brand-grey)"/>`
  + `<path d="M8 22 H13" stroke="var(--brand-grey)"/>`
  + `<path d="M8 16 H24" stroke="var(--brand-line)"/></svg>`;

const BRAND_LINE = () =>
  `<div class="login-brand">${MARK(36)}<h1>${esc(TITLE_PUBLIC)}</h1></div>`;

function splitUrl(u) {
  try {
    const x = new URL(u);
    const path = (x.pathname === '/' ? '' : x.pathname) + x.search + x.hash;
    return { dom: x.hostname.replace(/^www\./, ''), path };
  } catch { return { dom: u, path: '' }; }
}

/* Sterne-Widget. Skala ist ueberall fest 1-5. */
function stars(value, onPick) {
  const w = document.createElement('span');
  w.className = 'stars';
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span');
    s.className = 'star' + (i <= value ? ' on' : '');
    s.textContent = '★';
    s.dataset.v = i;
    w.appendChild(s);
  }
  // Das Vorschauleuchten geht ueber die STERNE und nicht ueber alle Kinder --
// sonst faerbte das × als sechstes Kind mit, sobald jemand darueberfaehrt.
  const stars = () => [...w.querySelectorAll('.star')];
  w.addEventListener('mouseover', e => {
    if (!e.target.dataset.v) return;
    const h = +e.target.dataset.v;
    stars().forEach((s, i) => s.classList.toggle('on', i < h));
  });
  w.addEventListener('mouseleave', () => {
    stars().forEach((s, i) => s.classList.toggle('on', i < value));
  });
  w.addEventListener('click', e => { if (e.target.dataset.v) onPick(+e.target.dataset.v); });
  return w;
}

/* DER RUECKSETZKNOPF DER STERNZEILE. */
function resetButton(value, onReset) {
  const z = document.createElement('button');
  z.type = 'button';
  z.className = 'rreset' + (value > 0 ? '' : ' blank');
  z.innerHTML = ICON_RESET;
  z.title = t('dialog.removeMyStars');
  z.setAttribute('aria-label', t('dialog.removeMyStars'));
  z.onclick = (e) => { e.preventDefault(); e.stopPropagation(); onReset(); };
  return z;
}

// Mitwachsendes Textfeld.
function autoGrow(el) {
  if (!el) return () => {};
  el.classList.add('ta-auto');
  const fit = () => {
    // Der Zwischenschritt height:auto laesst ein hohes Feld auf zwei Zeilen
    // zusammenfallen; der Browser zieht die Bildlaufposition auf das neue
    // Ende nach und gibt sie nicht von selbst zurueck -- Ergebnis waere ein
    // Sprung bei jedem Tastendruck.
    const side = document.scrollingElement || document.documentElement;
    const before = side ? side.scrollTop : 0;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + el.offsetHeight - el.clientHeight) + 'px';
    if (side && side.scrollTop !== before) side.scrollTop = before;
  };
  el.addEventListener('input', fit);
  fit();
  return fit;
}

/* ---- DAS GERUEST EINES DIALOGS -- Knoten, Klasse, Aufbau, die drei
   Schliesswege und das Abmelden des Tastenhorchers. `cancel` ist der Wert von
   Hintergrundklick und Escape, `keys` bekommt jede Taste vor Escape. */
function openModal(html, atClose, cancel, keys) {
  const bd = document.createElement('div');
  bd.className = 'backdrop';
  bd.innerHTML = html;
  document.body.appendChild(bd);
  const done = (v) => {
    document.removeEventListener('keydown', onKey, true);
    bd.remove();
    atClose(v);
  };
  const onKey = (e) => {
    if (keys && keys(e, done)) return;
    if (e.key === 'Escape') done(cancel);
  };
  document.addEventListener('keydown', onKey, true);
  bd.onclick = (e) => { if (e.target === bd) done(cancel); };
  return { bd, done };
}

// `kind`: die Farbe des Ja-Knopfs -- 'danger' fuer alles, was wegnimmt, 'accent'
// fuer eine Handlung, die etwas anlegt (Freischalten, Link erzeugen).
function confirmBox(title, text, confirmLabel = t('dialog.delete'), kind = 'danger') {
  return new Promise(resolve => {
    const { bd, done } = openModal(`<div class="modal"><h2>${esc(title)}</h2><p>${esc(text)}</p>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('dialog.cancel')}</button>
      <button class="btn btn-${kind === 'accent' ? 'accent' : 'danger'}" data-yes>${esc(confirmLabel)}</button></div></div>`,
      resolve, false);
    bd.querySelector('[data-no]').onclick = () => done(false);
    bd.querySelector('[data-yes]').onclick = () => done(true);
    bd.querySelector('[data-yes]').focus();
  });
}

/* EIN NAME WIRD GEFRAGT -- nach dem Muster von confirmBox() und ausdruecklich
   KEIN prompt(): das steht am oberen Rand des Fensters, sieht in keinem
   Browser wie diese Instanz aus und laesst sich nicht beschriften. */
function nameBox(title, text, fallback = '', okLabel = t('dialog.save'), maxLength = 40) {
  return new Promise(resolve => {
    const { bd, done } = openModal(`<div class="modal"><h2>${esc(title)}</h2><p class="hint">${esc(text)}</p>
      <div class="field"><input class="input" id="nb-name" maxlength="${maxLength}"
        value="${esc(fallback)}" placeholder="${esc(t('dialog.viewName'))}"></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('dialog.cancel')}</button>
      <button class="btn btn-accent" data-yes>${esc(okLabel)}</button></div></div>`,
      resolve, null,
      (e, shut) => {
        if (e.key !== 'Enter' || document.activeElement !== field) return false;
        const w = field.value.trim(); shut(w || null); return true;
      });
    const field = bd.querySelector('#nb-name');
    const take = () => { const w = field.value.trim(); done(w || null); };
    bd.querySelector('[data-no]').onclick = () => done(null);
    bd.querySelector('[data-yes]').onclick = take;
    field.focus(); field.select();
  });
}

// Eine Funktion, weil die Sprache beim Laden des Skripts noch nicht feststeht.
const confirmReason = () => t('dialog.appWideHint');

/* STEHT HIER EIN ZWEITES FELD -- aber nur bei Zugaengen, die einen zweiten
   Faktor eingeschaltet haben. */
function passwordDialog(title, event, reason, withCode) {
  return new Promise(resolve => {
    const { bd, done } = openModal(`<div class="modal"><h2>${esc(title)}</h2>
      <p>${esc(event)}</p>
      ${reason ? `<p class="desc" style="margin:0">${esc(reason)}</p>` : ''}
      <div class="field" style="margin:0"><label>${tH('dialog.yourPassword')}</label>
        <input class="input" id="confirm-pass" type="password" autocomplete="current-password"></div>
      ${/* DAS FELD NENNT DAS VERFAHREN UND NICHT DAS GERAET. */''}
      ${withCode ? `<div class="field" style="margin:10px 0 0"><label>${tH('dialog.twoFactorCode')}</label>
        <input class="input" id="confirm-code" inputmode="text" autocomplete="one-time-code"
          autocapitalize="characters" spellcheck="false" maxlength="16"></div>` : ''}
      <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('dialog.cancel')}</button>
      <button class="btn btn-accent" data-yes>${tH('dialog.confirm')}</button></div></div>`,
      resolve, null);
    const field = bd.querySelector('#confirm-pass');
    const codeField = bd.querySelector('#confirm-code');
    const value = () => ({ password: field.value, ...(codeField ? { code: codeField.value } : {}) });
    bd.querySelector('[data-no]').onclick = () => done(null);
    bd.querySelector('[data-yes]').onclick = () => done(value());
    for (const el of [field, codeField]) {
      if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') done(value()); });
    }
    field.focus();
  });
}

// Ob das Codefeld erscheint, meldet der Server über TWO_FACTOR.
const confirmField = (title, event) => passwordDialog(title, event,
  confirmReason() + (TWO_FACTOR ? ' ' + t('dialog.twoFactorOn') : ''), TWO_FACTOR);

/* Dasselbe Fenster fuer die vier Wege des zweiten Faktors selbst. */
const confirmFieldFree = (title, event, withCode) =>
  passwordDialog(title, event, '', withCode === true);

/* EINE ABFRAGE, EINE ANFRAGE, MEHRERE FREIGABEN. */
async function confirmTwiceMany(purpose, targets, title, event) {
  const input = await confirmField(title, event);
  if (input === null) return false;
  try { await api('POST', '/api/confirm', { ...input, purpose, targets }); }
  catch (e) { toast(e.message, true); return false; }
  return true;
}

async function secondConfirm(purpose, target, title, event) {
  const input = await confirmField(title, event);
  // null heisst abgebrochen -- ein Abbruch, der trotzdem handelt, waere der
  // schlimmere Fehler.
  if (input === null) return false;
  try { await api('POST', '/api/confirm', { ...input, purpose, target: target ?? null }); }
  catch (e) { toast(e.message, true); return false; }
  return true;
}

/* EIN NEUES PASSWORT FUER EINEN ANDEREN, und ausdruecklich KEIN
   prompt(): dort stand das fremde Passwort im Klartext auf dem Bildschirm. */
function newPasswordDialog(title, sentence) {
  return new Promise(resolve => {
    const { bd, done } = openModal(`<div class="modal"><h2>${esc(title)}</h2><p>${esc(sentence)}</p>
      <div class="field" style="margin:0"><label for="np-pass">${tH('dialog.newPassword')}</label>
        <input class="input" id="np-pass" type="password" autocomplete="new-password"></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('dialog.cancel')}</button>
      <button class="btn btn-accent" data-yes>${tH('dialog.setPassword')}</button></div></div>`,
      resolve, null,
      (e, shut) => {
        if (e.key !== 'Enter' || document.activeElement !== field) return false;
        shut(field.value || null); return true;
      });
    const field = bd.querySelector('#np-pass');
    bd.querySelector('[data-no]').onclick = () => done(null);
    bd.querySelector('[data-yes]').onclick = () => done(field.value || null);
    field.focus();
  });
}

/* DAS FENSTER ZUM LOESCHEN EINES BENUTZERS. */
function userDeleteDialog(name, number, b) {
  return new Promise(resolve => {
    const countWord = (n, singular, more) => (n ? [`${n} ${counted(n, singular, more)}`] : []);
    const foreignCount = (b.foreignComments || 0) + (b.foreignRatings || 0) + (b.foreignTestDays || 0)
      + (b.foreignLinks || 0) + (b.foreignFiles || 0);
    const posts = [
      ...countWord(b.comments, t('dialog.comment'), t('dialog.comments')),
      ...countWord(b.ratings, V.ratingOne, V.ratingMany),
      ...(b.testDays ? [`${b.testDays} ${vTime(b.testDays)}`] : []),
      ...countWord(b.links, t('dialog.link'), t('dialog.links')),
      ...countWord(b.files, t('dialog.file'), t('dialog.files'))
    ];
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal" id="delete-user"><h2>${tH('dialog.deleteUserAsk', { name: name })}</h2>
      <p>${tH('dialog.nameFreedHint', { name: name, number: Number(number) })}</p>
      ${b.entries ? `<label class="ex-files"><input type="checkbox" id="bl-entries">
        ${tH('dialog.deleteAlso', { entries: b.entries, thing: vThing(b.entries), name: name,
          extra: foreignCount ? t('dialog.withForeignPosts', { n: foreignCount }) : '' })}</label>` : ''}
      ${posts.length ? `<label class="ex-files"><input type="checkbox" id="bl-posts">
        ${tH('dialog.postsOfOthers', { name: name, thing: vThing(2) })} ${esc(posts.join(', '))}</label>` : ''}
      <p>${tH('dialog.lockInsteadHint')}</p>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('dialog.cancel')}</button>
      <button class="btn btn-danger" data-yes>${tH('dialog.deleteUser')}</button></div></div>`;
    document.body.appendChild(bd);
    const done = v => { document.removeEventListener('keydown', onKey, true); bd.remove(); resolve(v); };
    const take = () => done({
      entries: !!bd.querySelector('#bl-entries')?.checked,
      posts: !!bd.querySelector('#bl-posts')?.checked
    });
    bd.querySelector('[data-no]').onclick = () => done(null);
    bd.querySelector('[data-yes]').onclick = take;
    bd.onclick = e => { if (e.target === bd) done(null); };
    const onKey = e => { if (e.key === 'Escape') done(null); };
    document.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-no]').focus();
  });
}

// Schreibvorgaenge der Reihe nach abarbeiten.
let queue = Promise.resolve();
const enqueue = fn => (queue = queue.then(fn, fn));

/* ================= Anmeldung ================= */
let TITLE_PUBLIC = 'Kriterion';
let VERSION = '';   // kommt von /api/config, steht auch vor der Anmeldung
let TITLE_APP = 'Kriterion';
let MIN_PASSWORD = 10;   // Vorgabe des Servers, kommt mit /api/config
/* Ob diese Instanz Anfragen annimmt. */
let SIGNUP = false;

/* Erste Einrichtung. */
function showSetup(errMsg) {
  document.querySelectorAll('.lightbox, .backdrop, .cmp-bar').forEach(e => e.remove());
  document.body.classList.remove('lb-open');
  document.body.classList.add('login');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${BRAND_LINE()}
    <p class="sub">${tH('login.setupHint')}</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    <div class="field"><label for="su">${tH('login.username')}</label>
      <input class="input" id="su" autocomplete="username" autocapitalize="off" spellcheck="false"></div>
    <div class="field"><label for="sp">${tH('login.password')}</label>
      <input class="input" id="sp" type="password" autocomplete="new-password"></div>
    <div class="field"><label for="sp2">${tH('login.repeatPassword')}</label>
      <input class="input" id="sp2" type="password" autocomplete="new-password"></div>
    <p class="sub" style="margin:0 0 4px">${tH('login.passwordHint', { minPassword: MIN_PASSWORD })}</p>
    <button class="btn btn-accent" id="sb">${tH('login.setup')}</button>
  </div></div>`;
  document.title = TITLE_PUBLIC;

  const u = document.getElementById('su'), p1 = document.getElementById('sp'),
        p2 = document.getElementById('sp2'), b = document.getElementById('sb');
  const submit = async () => {
    if (!u.value.trim()) return showSetup(t('login.usernameMissing'));
    if (p1.value.length < MIN_PASSWORD)
      return showSetup(t('login.passwordTooShort', { min: MIN_PASSWORD }));
    if (p1.value !== p2.value) return showSetup(t('login.passwordsDiffer'));
    b.disabled = true; b.textContent = t('login.settingUp');
    try {
      const res = await fetch('/api/setup', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: u.value, password: p1.value })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        return showSetup(j.error || t('login.setupFailed'));
      }
      location.hash = '#/';
      start();
    } catch { showSetup(t('login.serverUnreachable')); }
  };
  b.onclick = submit;
  [u, p1, p2].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
  u.focus();
}

function showLogin(errMsg) {
  document.querySelectorAll('.lightbox, .backdrop, .cmp-bar').forEach(e => e.remove());
  document.body.classList.remove('lb-open');
  // Teilt der Seite mit, dass jetzt die Anmeldung steht: nur dort teilen sich
// Inhalt und Versionszeile die Fensterhoehe.
  document.body.classList.add('login');
  // Die Anmeldeseite bleibt bei der Vorgabegroesse: der Endpunkt davor liefert
// nur den oeffentlichen Titel, sonst nichts.
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${BRAND_LINE()}
    <p class="sub">${tH('login.required')}</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    <div class="field"><label for="lu">${tH('login.username')}</label>
      <input class="input" id="lu" autocomplete="username" autocapitalize="off" spellcheck="false"></div>
    <div class="field"><label for="lp">${tH('login.password')}</label>
      <input class="input" id="lp" type="password" autocomplete="current-password"></div>
    <button class="btn btn-accent" id="lb">${tH('login.signIn')}</button>
    ${/* DIE SELBSTANMELDUNG — sie steht nur da, wenn der Server sagt, dass
         sie an ist. */''}
    ${SIGNUP ? `<p class="sub login-divider">${tH('login.noAccountYet')}</p>
      <button class="btn login-alt" id="l-request">${tH('login.requestAccess')}</button>` : ''}
    ${/* KEINE SPRACHZEILE UNTER DER MASKE — vom Betreiber am 8. September
         2026 entschieden. */''}
  </div></div>`;
  document.title = TITLE_PUBLIC;
  if (SIGNUP) document.getElementById('l-request').onclick = () => showRequest();

  const u = document.getElementById('lu'), p = document.getElementById('lp'), b = document.getElementById('lb');
  const submit = async () => {
    b.disabled = true; b.textContent = t('login.signingIn');
    try {
      const res = await fetch('/api/login', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: u.value, password: p.value })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        showLogin(j.error || t('login.failed'));
        return;
      }
      const j = await res.json().catch(() => ({}));
      /* DER ZWEITE SCHRITT. */
      if (j.twoFactor) return showSecondFactor(j.ticket);
      location.hash = '#/';
      start();
    } catch { showLogin(t('login.serverUnreachable')); }
  };
  b.onclick = submit;
  [u, p].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
  u.focus();
}

/* Der zweite Schritt der Anmeldung. ES IST EINE SEITE UND KEIN ZUSTAND. */
function showSecondFactor(ticket, errMsg) {
  document.body.classList.add('login');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${BRAND_LINE()}
    <p class="sub">${tH('login.almostDone')}</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    ${/* Nicht "Sechsstelliger Code": hier traegt auch ein
         Wiederherstellungscode, und der hat zehn Zeichen. */''}
    <div class="field"><label for="two-factor-code">${tH('dialog.twoFactorCode')}</label>
      <input class="input" id="two-factor-code" inputmode="text" autocomplete="one-time-code"
        autocapitalize="characters" spellcheck="false" maxlength="16"></div>
    <button class="btn btn-accent" id="two-factor-send">${tH('login.signIn')}</button>
    <p class="sub" style="margin:14px 0 0">${tH('login.noPhoneHint')}</p>
  </div></div>`;
  document.title = TITLE_PUBLIC;
  const c = document.getElementById('two-factor-code'), b = document.getElementById('two-factor-send');
  const submit = async () => {
    b.disabled = true; b.textContent = t('login.signingIn');
    try {
      const res = await fetch('/api/login/second', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, code: c.value })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        /* DER SERVER ENTSCHEIDET, OB ES HIER WEITERGEHT — an einem FELD und
           nicht an einem Statuscode: liegt der Absage ein frischer Ausweis
           bei, war der Code falsch und ein zweiter Anlauf steht offen. */
        if (j.ticket) return showSecondFactor(j.ticket, j.error || t('login.codeWrong'));
        return showLogin(j.error || t('server.sessionExpired'));
      }
      location.hash = '#/';
      start();
    } catch { showSecondFactor(ticket, t('login.serverUnreachable')); }
  };
  b.onclick = submit;
  c.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  c.focus();
}

/* DIE FORM EINER ADRESSE. */
const ADDRESS_FORM = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/* Die Selbstanmeldung: das Formular und die Antwort darauf. ZWEI FELDER UND
   KEIN PASSWORT. */
function showRequest(errMsg, values = {}) {
  document.body.classList.add('login');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${BRAND_LINE()}
    <p class="sub">${tH('login.requestAccessHint')}</p>
    ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
    <div class="field"><label for="req-name">${tH('login.wantedUsername')}</label>
      <input class="input" id="req-name" autocomplete="username" autocapitalize="off"
        spellcheck="false" maxlength="64" value="${esc(values.name || '')}"></div>
    <div class="field"><label for="req-mail">${tH('login.email')}</label>
      <input class="input" id="req-mail" type="email" autocomplete="email" autocapitalize="off"
        spellcheck="false" maxlength="254" value="${esc(values.address || '')}"></div>
    <button class="btn btn-accent" id="req-send">${tH('login.sendRequest')}</button>
    <p class="sub" style="margin:14px 0 0"><a href="#" id="req-back">${tH('login.backToSignIn')}</a></p>
  </div></div>`;
  document.title = TITLE_PUBLIC;
  const n = document.getElementById('req-name'), m = document.getElementById('req-mail'),
        b = document.getElementById('req-send');
  document.getElementById('req-back').onclick = (e) => { e.preventDefault(); showLogin(); };
  /* FORM IST OEFFENTLICH, EXISTENZ IST ES NICHT. */
  const formFault = () => {
    if (!String(n.value).trim()) return t('login.usernameMissing');
    if (!ADDRESS_FORM.test(String(m.value).trim())) return t('login.emailInvalid');
    return '';
  };
  const submit = async () => {
    const fault = formFault();
    if (fault) return showRequest(fault, { name: n.value, address: m.value });
    b.disabled = true; b.textContent = t('login.sending');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n.value, address: m.value })
      });
      const j = await res.json().catch(() => ({}));
      /* NUR DIE BREMSE UND DER AUSFALL FÜHREN ZURÜCK INS FORMULAR. */
      if (!res.ok) return showRequest(j.error || t('login.requestFailed'),
        { name: n.value, address: m.value });
      showRequestThanks(j.message);
    } catch { showRequest(t('login.serverUnreachable'), { name: n.value, address: m.value }); }
  };
  b.onclick = submit;
  [n, m].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
  n.focus();
}

// Die Dankseite. DER TEXT KOMMT VOM SERVER, damit es ihn nur einmal gibt --
// eine zweite Ausfertigung hier liefe beim naechsten Wort auseinander.
function showRequestThanks(message) {
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${BRAND_LINE()}
    <p class="sub" id="req-thanks">${esc(message || '')}</p>
    <p class="sub"><a href="#" id="req-back2">${tH('login.backToSignIn')}</a></p>
  </div></div>`;
  document.getElementById('req-back2').onclick = (e) => { e.preventDefault(); showLogin(); };
}

/* Der Bestätigungslink aus der Selbstanmeldung. */
async function showConfirm(key) {
  document.body.classList.add('login');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${BRAND_LINE()}
    <p class="sub">${tH('login.linkChecking')}</p></div></div>`;
  document.title = TITLE_PUBLIC;
  let res, j = {};
  try {
    res = await fetch('/api/signup/confirm', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    j = await res.json().catch(() => ({}));
  } catch {
    /* KEIN NETZ IST KEINE ABSAGE. Wie bei der Einladungsseite bleibt der
       Schlüssel in der Adresse stehen, und ein Neuladen trägt wieder. */
    return draw(false, t('login.serverUnreachable'), true);
  }
  if (!res.ok) return draw(false, j.error || t('login.confirmLinkExpired'),
    res.status !== 400);
  location.hash = '#/';
  draw(true, '');

  function draw(good, message, again) {
    app.innerHTML = `<div class="login-screen"><div class="login-card">
      ${BRAND_LINE()}
      ${good ? `<p class="sub" id="confirm-ok">${tH('login.requestConfirmedHint')}</p>`
        : `<div class="login-error">${esc(message)}</div>
        ${again ? `<p class="sub">${tH('login.linkUnaffected')}</p><button class="btn btn-accent" id="confirm-again">${tH('login.tryAgain')}</button>`
          : ''}`}
      <p class="sub" style="margin:14px 0 0"><a href="#" id="confirm-back">${tH('login.backToSignIn')}</a></p>
    </div></div>`;
    const fresh = document.getElementById('confirm-again');
    if (fresh) fresh.onclick = () => showConfirm(key);
    document.getElementById('confirm-back').onclick = (e) => {
      e.preventDefault(); location.hash = '#/'; showLogin();
    };
  }
}

/* Der Link aus einer Einladung oder einer Rücksetzung. */
async function showInvite(key) {
  document.querySelectorAll('.lightbox, .backdrop, .cmp-bar').forEach(e => e.remove());
  document.body.classList.remove('lb-open');
  document.body.classList.add('login');
  document.documentElement.style.fontSize = '';
  app.innerHTML = `<div class="login-screen"><div class="login-card">
    ${BRAND_LINE()}
    <p class="sub">${tH('login.linkChecking')}</p></div></div>`;
  document.title = TITLE_PUBLIC;

  let status;
  try {
    const res = await fetch('/api/token/check', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: key })
    });
    status = await res.json().catch(() => ({}));
    /* EINE VORÜBERGEHENDE ABSAGE DARF DEN SCHLÜSSEL NICHT WEGWERFEN. */
    if (res.status === 400) {
      location.hash = '#/';
      return showLogin(status.error || t('login.linkExpired'));
    }
    if (!res.ok) return later(status.error || t('login.linkCheckFailed'));
  } catch { return later(t('login.serverUnreachable')); }

  const min = status.minPassword || MIN_PASSWORD;
  draw();

  /* Die Seite für eine VORÜBERGEHENDE Absage. */
  function later(message) {
    app.innerHTML = `<div class="login-screen"><div class="login-card">
      ${BRAND_LINE()}
      <div class="login-error">${esc(message)}</div>
      <p class="sub">${tH('login.linkUnaffectedRetry')}</p>
      <button class="btn btn-accent" id="eb-again">${tH('login.tryAgain')}</button>
    </div></div>`;
    document.getElementById('eb-again').onclick = () => showInvite(key);
  }

  function draw(errMsg) {
    app.innerHTML = `<div class="login-screen"><div class="login-card">
      ${BRAND_LINE()}
      <p class="sub">${status.withoutPassword
        ? tH('login.welcome', { name: status.username })
        : tH('login.newPasswordFor', { name: status.username })}</p>
      ${errMsg ? `<div class="login-error">${esc(errMsg)}</div>` : ''}
      <div class="field"><label for="ep">${tH('login.password')}</label>
        <input class="input" id="ep" type="password" autocomplete="new-password"></div>
      <div class="field"><label for="ep2">${tH('login.repeatPassword')}</label>
        <input class="input" id="ep2" type="password" autocomplete="new-password"></div>
      ${/* DIE FRIST GEHÖRT AN DIE STELLE, AN DER SIE LÄUFT. */''}
      <p class="sub" style="margin:0 0 4px">${tH('login.minChars', { min: min })}
        ${status.minutes ? `${tH('login.linkValidHint', { n: status.minutes })}` : ''}
        <br>${tH('login.logoutHint')}<br>${tH('login.forgotHint')}</p>
      <button class="btn btn-accent" id="eb">${tH('dialog.setPassword')}</button>
    </div></div>`;

    const p1 = document.getElementById('ep'), p2 = document.getElementById('ep2'),
          b = document.getElementById('eb');
    const submit = async () => {
      if (p1.value.length < min) return draw(t('login.passwordTooShort', { min: min }));
      if (p1.value !== p2.value) return draw(t('login.passwordsDiffer'));
      b.disabled = true; b.textContent = t('login.settingPassword');
      try {
        const res = await fetch('/api/token/redeem', {
          method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: key, password: p1.value })
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          return draw(j.error || t('login.passwordNotSet'));
        }
        const j = await res.json().catch(() => ({}));
        /* DER ZWEITE FAKTOR WIRD AUCH HIER VERLANGT, — sonst wäre der
           Rücksetzlink der Weg daran vorbei. */
        if (j.twoFactor) { location.hash = '#/'; return showSecondFactor(j.ticket); }
        // Angemeldet ist man damit schon -- der Server hat den Cookie
// mitgeschickt. Die Adresse wird geleert: der Link ist verbraucht.
        location.hash = '#/';
        start();
      } catch { draw(t('login.serverUnreachable')); }
    };
    b.onclick = submit;
    [p1, p2].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
    p1.focus();
  }
}

/* ================= Blöcke der Detailansicht ================= */
// Reihenfolge und Einklappzustand gelten global, nicht je Eintrag, und liegen
// auf dem Server.
const BLOCK_DEFAULT = {
  // Vorher steht vor nachher -- geschaetzt wird, bevor bewertet wird.
  side: ['kategorie', 'tags', 'potenzial', 'bewertung'],
  bottom: ['beschreibung', 'testtage', 'links', 'dateien', 'kommentare']
};
/* DIE BEIDEN STERNKAESTEN FUEHREN IHREN EINKLAPPZUSTAND NICHT MEHR IN
   `closed`. */
const BLOCKS_ALWAYS_OPEN = ['potenzial', 'bewertung'];
const CLOSED_BLOCKS = [...BLOCK_DEFAULT.side, ...BLOCK_DEFAULT.bottom]
  .filter(k => !BLOCKS_ALWAYS_OPEN.includes(k));
let BLOCKS = { side: [...BLOCK_DEFAULT.side], bottom: [...BLOCK_DEFAULT.bottom], closed: [] };

// Unbekannte Namen fliegen raus, fehlende hängen sich in der Vorgabereihenfolge
// hinten an. So überlebt die Einstellung auch einen später hinzugekommenen Block.
function sortArea(saved, fallback) {
  const clean = (Array.isArray(saved) ? saved : []).filter((k, i, a) => fallback.includes(k) && a.indexOf(k) === i);
  return [...clean, ...fallback.filter(k => !clean.includes(k))];
}

function takeBlocks(raw) {
  BLOCKS = {
    side: sortArea(raw && raw.side, BLOCK_DEFAULT.side),
    bottom: sortArea(raw && raw.bottom, BLOCK_DEFAULT.bottom),
    closed: (raw && Array.isArray(raw.closed) ? raw.closed : []).filter(k => CLOSED_BLOCKS.includes(k))
  };
}

const saveBlocks = () =>
  api('PUT', '/api/settings', { blocks: BLOCKS }).catch(e => toast(e.message, true));

function sortBlocks() {
  [['side', 'blocks-side'], ['bottom', 'blocks-bottom']].forEach(([area, boxId]) => {
    const box = document.getElementById(boxId);
    if (!box) return;
    BLOCKS[area].forEach(name => {
      const el = box.querySelector(`[data-block="${name}"]`);
      if (el) box.appendChild(el);       // appendChild verschiebt, kopiert nicht
    });
  });
}

/* DIE ZAHLEN AM KOMMENTARBLOCK NEU GEBAUT, und der Grund ist
   gemessen. */
const countMark = (kind, icon, number, word) =>
  `<span class="cnum" data-kind="${kind}"${word ? ` title="${esc(word)}"` : ''}>${icon}${number}</span>`;

/* Die Stellung jedes Kommentars in der zeitlichen Reihenfolge. Eine
   geloeschte Zeile verschiebt die Nummern danach; das ist so entschieden. */
function commentOrder(comments) {
  const order = new Map();
  [...(comments || [])].sort((a, b) => a.id - b.id).forEach((c, i) => order.set(c.id, i + 1));
  return order;
}

function commentNumbers(comments) {
  const list = comments || [];
  const n = list.length;
  if (!n) return { html: '', text: '' };
  const count = (...kinds) => list.filter(c => kinds.includes(c.kind)).length;
  const reports = count('report');
  // Erledigtes zaehlt MIT zu den Aufgaben, nicht daneben.
  const tasks = count('task', 'done');
  const finished = count('done');
  const open = tasks - finished;
  const marks = [String(n)];
  const words = [t('list.commentCount', { n: n })];
  if (reports) {
    marks.push(countMark('report', ICON_REPORT, reports));
    words.push(`${reports} ${vReport(reports)}`);
  }
  if (open) marks.push(countMark('task', ICON_BOX, open));
  if (finished) marks.push(countMark('done', ICON_BOX_CHECK, finished));
  if (tasks) words.push(`${tasks} ${vTask(tasks)}`
    + (finished ? t('list.openCount', { n: open }) : ''));
  return { html: marks.join(' · '), text: words.join(' · ') };
}

// Kurzfassung des Inhalts für die eingeklappte Kopfzeile.
function blockSummary(name, item) {
  switch (name) {
    case 'kategorie': return item.category ? item.category.name : 'keine';
    case 'tags': return String(item.tags.length);
    /* DIE BEIDEN STERNKAESTEN TRAGEN HIER NICHTS, SOBALD SIE EINE ZAHL HABEN (Entscheidung E4). */
    case 'bewertung': return item.avgRating ? '' : t('list.notRatedYet');
    case 'potenzial': return item.potentialRating ? '' : t('list.notEstimatedYet');
    case 'beschreibung': {
      // Ohne Marken: ein halbes `**` stuende hier sonst sichtbar da.
      const text = markupPlain(item.description || '').trim().replace(/\s+/g, ' ');
      if (!text) return 'leer';
      return text.length > 40 ? text.slice(0, 40) + ' …' : text;
    }
    case 'testtage': return String(item.testDays.length);
    case 'links': return String(item.links.length);
    case 'dateien': return String((item.attachments || []).length);
    /* Der Kommentarblock traegt seine Zahlen NICHT hier, sondern in seinem
       eigenen Hinweis in der Kopfzeile -- und die steht auch eingeklappt da. */
    case 'kommentare': return '';
    default: return '';
  }
}

/* WELCHE BLOECKE GERADE OFFEN STEHEN, OBWOHL DIE REGEL SIE ZUKLAPPEN WUERDE
   -- und umgekehrt. */
let GLANCE = new Set();

/* WAS DIE REGEL SAGT, WENN NIEMAND GEKLICKT HAT. ungetestet ->
   Potenzial offen, Bewertung zu; getestet -> umgekehrt. */
const hasStars = (item, phase) => (item.ratings || [])
  .some(r => r.phase === phase && (r.value > 0 || r.avg != null));

function closedByState(name, item) {
  if (name === 'potenzial') return !!item.tested;
  return !item.tested && !hasStars(item, 'after');
}

/* WELCHER BLOCK AN DIESEM EINTRAG GAR NICHT DASTEHT. */
function blockPathAfterState(name, item) {
  return name === 'bewertung' && !item.tested && !hasStars(item, 'after');
}

// Wird nach jedem Neuzeichnen aufgerufen und muss deshalb mehrfach ausführbar
// sein: der Testtagblock etwa schreibt seine Kopfzeile jedes Mal neu.
/* Ein eingeklappter Block zeigt nichts. Wer hinspringt oder den Stift
   drueckt, klappt ihn damit auf -- als Blick, nicht als Einstellung. */
function openBlock(name) {
  const block = document.querySelector(`.block[data-block="${name}"]`);
  if (!block || !block.classList.contains('closed')) return;
  block.classList.remove('closed');
  const caret = block.querySelector('.bcaret');
  if (caret) caret.textContent = '▾';
  const sum = block.querySelector('.bsum');
  if (sum) sum.textContent = '';
}

function setUpBlocksOut(item) {
  document.querySelectorAll('.block[data-block]').forEach(block => {
    const name = block.dataset.block;
    const head = block.querySelector('.block-head');
    if (!head) return;

    if (!head.querySelector('.bgrip')) {
      const handle = document.createElement('span');
      handle.className = 'bgrip'; handle.textContent = '⣿';
      handle.title = t('entry.moveBlock');
      const arrow = document.createElement('span');
      arrow.className = 'bcaret';
      head.prepend(arrow);
      head.prepend(handle);
      const sum = document.createElement('span');
      sum.className = 'bsum';
      head.querySelector('.label').after(sum);
      head.classList.add('block-head-x');
    }

    /* FUER GENAU ZWEI BLOECKE ENTSCHEIDET DER ZUSTAND UND NICHT DIE
       EINSTELLUNG. */
    const afterState = BLOCKS_ALWAYS_OPEN.includes(name);
    const closed = afterState
      ? (GLANCE.has(name) ? !closedByState(name, item) : closedByState(name, item))
      : BLOCKS.closed.includes(name);
    /* DER BLOCK WIRD AUSGEBLENDET UND NICHT ENTFERNT. */
    block.hidden = blockPathAfterState(name, item);
    block.classList.toggle('closed', closed);
    head.querySelector('.bcaret').textContent = closed ? '▸' : '▾';
    const sum = head.querySelector('.bsum');
    // Eine leere Kurzfassung bleibt leer: "()" waere eine Klammer um nichts.
    const short = closed ? blockSummary(name, item) : '';
    sum.textContent = short ? `(${short})` : '';

    // Klick auf die Kopfzeile klappt ein und aus.
    head.onclick = (e) => {
      if (e.target.closest('button, input, select, a, .bgrip')) return;
      if (afterState) {
        /* KEIN saveBlocks(), KEIN PUT /api/settings -- der Klick ist ein
           Blick. */
        if (GLANCE.has(name)) GLANCE.delete(name); else GLANCE.add(name);
      } else {
        BLOCKS.closed = closed ? BLOCKS.closed.filter(k => k !== name) : [...BLOCKS.closed, name];
        saveBlocks();
      }
      setUpBlocksOut(item);
      // Was eingeklappt war, konnte nicht gemessen werden -- die Wolke im
      // Tagblock hat deshalb keine Zeilenbegrenzung.
      if (name === 'tags' && closed && redrawCloud) redrawCloud();
    };

    if (!block.dataset.draggable) {
      block.dataset.draggable = '1';
      const area = BLOCK_DEFAULT.side.includes(name) ? 'side' : 'bottom';
      makeSortable(block, {
        axis: 'y', selector: '.block[data-block]', handle: '.bgrip',
        onDrop: (children) => {
          BLOCKS[area] = children.map(k => k.dataset.block).filter(Boolean);
          saveBlocks();
          toast(t('entry.layoutSaved'));
        }
      });
    }
  });
}

// Versionsnummer.
/* DIE VERSIONSZEILE, und das Zeichen davor ist ein Aufruf und kein zweites
   Bild: MARK() liefert dieselbe durchsichtige Fassung, die auf allen neun
   Anmeldeseiten steht. */
function showVersion() {
  const el = document.getElementById('version');
  if (!el) return;
  el.innerHTML = VERSION ? `${MARK()}<span>${tH('list.brand', { version: VERSION })}</span>` : '';
}

/* ================= Bilder in Kommentaren ================= */
// Bilder aus einem Einfuegevorgang holen.
function imagesFromClipboard(e) {
  const data = e.clipboardData;
  if (!data) return [];
  return [...(data.files || [])].filter(f => f.type.startsWith('image/'));
}

// Dateiauswahl fuer Bilder, ohne dass ein Feld im Aufbau stehen muss.
function pickImages(finished, withVideos = false) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = withVideos ? 'image/*,video/*' : 'image/*';
  inp.multiple = true;
  inp.onchange = () => { finished([...inp.files]); inp.remove(); };
  inp.style.display = 'none';
  document.body.appendChild(inp);
  inp.click();
}

// Multipart-Formular schicken. api() sendet JSON und taugt dafuer nicht.
async function sendForm(path, form) {
  const a = await fetch(path, { method: 'POST', body: form,
    credentials: 'same-origin', headers: csrfHeader() });
  const data = await a.json().catch(() => ({}));
  if (a.status === 401) { showLogin(); throw new Error(SESSION_GONE); }
  if (!a.ok) throw new Error(data.error ||
    (a.status === 413 ? t('error.proxyTooLarge') : t('entry.uploadFailed')));
  return data;
}

/* Ein Standbild aus dem gewaehlten Video ziehen -- IM BROWSER, ohne dass
   der Server das Video je oeffnen muesste. Eintrag und Kommentar rufen es. */
async function stillFrame(file, second = 1) {
  const v = document.createElement('video');
  v.preload = 'metadata'; v.muted = true; v.playsInline = true;
  v.src = URL.createObjectURL(file);
  try {
    await new Promise((ok, fail) => {
      v.onloadedmetadata = ok;
      v.onerror = () => fail(new Error(t('entry.videoUnplayable')));
    });
    // Ein Video ohne Bildmasse -- etwa eine reine Tonspur -- ergaebe eine
    // Zeichenflaeche der Groesse null und damit gar kein Standbild.
    if (!v.videoWidth || !v.videoHeight)
      throw new Error(t('entry.videoNoImage'));
    v.currentTime = Math.min(second, (v.duration || 2) / 2);
    await new Promise((ok, fail) => {
      v.onseeked = ok;
      v.onerror = () => fail(new Error(t('entry.videoUnplayable')));
    });
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    const image = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
    if (!image) throw new Error(t('entry.videoNoThumb'));
    return { image, duration: Math.round(v.duration) || null };
  } finally { URL.revokeObjectURL(v.src); }
}

// Video, Standbild und Dauer als ein Formular.
async function videoForm(file) {
  const { image, duration } = await stillFrame(file);
  const fd = new FormData();
  fd.append('video', file, file.name);
  fd.append('stillFrame', image, 'stillframe.jpg');
  if (duration) fd.append('duration', String(duration));
  return fd;
}

/* ================= Der Ausschnitt der Vorschau ================= ER WIRD NICHT MEHR HIER GERECHNET. */

/* ---- DIE EINE RECHNUNG FUER DEN AUSSCHNITT ---- SIE STEHT
   ZWEIMAL, UND DAS IST DER PUNKT. */
function cropSpecBox(width, height, fx, fy, zoom) {
  const side = Math.min(width, height);   // was die Kachel bei zoom 100 zeigt
  const eng = side * 100 / zoom;          // was sie beim eingestellten Zoom zeigt
  return { links: fx / 100 * (width - eng), top: fy / 100 * (height - eng), edge: eng };
}

/* WELCHE GESTE UNTER EINER BERUEHRUNG LIEGT. */
const HANDLE = 12;
function cropGesture(frame, px, py, handle = HANDLE) {
  const { links, top, edge } = frame;
  const right = links + edge, bottom = top + edge;
  if (px < links || px > right || py < top || py > bottom) return 'neu';
  const g = Math.min(handle, edge / 4);
  const w = px - links <= g, o = right - px <= g;
  const n = py - top <= g, s = bottom - py <= g;
  if (n && w) return 'links-oben';
  if (n && o) return 'rechts-oben';
  if (s && w) return 'links-unten';
  if (s && o) return 'rechts-unten';
  if (n) return 'oben';
  if (s) return 'unten';
  if (w) return 'links';
  if (o) return 'rechts';
  return 'schieben';
}

/* WELCHEN ZEIGER EINE GESTE VERLANGT. */
const HANDLE_CURSORS = {
  'links-oben': 'handle-nwse', 'rechts-unten': 'handle-nwse',
  'rechts-oben': 'handle-nesw', 'links-unten': 'handle-nesw',
  'oben': 'handle-ns', 'unten': 'handle-ns',
  'links': 'handle-ew', 'rechts': 'handle-ew',
  'schieben': 'handle-move'
};
const HANDLE_CLASSES = ['handle-nwse', 'handle-nesw', 'handle-ns', 'handle-ew', 'handle-move'];

/* ================= Tagwolken ================= */
// Sortierung: hervorgehobene Tags (aktiver Filter bzw. vergebener Tag) immer
// vorn, danach nach Haeufigkeit, bei Gleichstand nach Namen.
function sortCloud(tags, highlight) {
  return [...tags].sort((a, b) => {
    const ha = highlight.has(a.id) ? 0 : 1, hb = highlight.has(b.id) ? 0 : 1;
    if (ha !== hb) return ha - hb;
    if (b.usage_count !== a.usage_count) return b.usage_count - a.usage_count;
    return a.name.localeCompare(b.name, LOCALE);
  });
}

// Begrenzt die Wolke auf n Zeilen und meldet, ob dabei etwas abgeschnitten
// wurde.
const CLOUD_GAP = 6;
/* DIE ZEILENHOEHE EINER WOLKE WIRD AN EINER STELLE GEMESSEN. Zwei
   Leser fragen sie: die Begrenzung unten und cloudRows(). */
function cloudLine(box) {
  const first = box.firstElementChild;
  return first ? first.offsetHeight || 0 : 0;
}
/* WIE VIELE REIHEN DIE WOLKE UNGEKUERZT BRAUCHT. */
function cloudRows(box) {
  const height = cloudLine(box);
  if (!height) return 0;
  return Math.round((box.scrollHeight + CLOUD_GAP) / (height + CLOUD_GAP));
}
function limitCloud(box, rows) {
  if (!rows) { box.style.maxHeight = ''; box.style.overflow = ''; return false; }
  if (!box.firstElementChild) return false;
  const height = cloudLine(box);
  // EIN EINGEKLAPPTER BLOCK MISST NULL: seine Kinder stehen auf display:
  // none, und aus der Hoehe 0 entstuende eine feste maxHeight, die nach dem
  // Aufklappen stehenbliebe.
  if (!height) { box.style.maxHeight = ''; box.style.overflow = ''; return false; }
  box.style.maxHeight = (rows * height + (rows - 1) * CLOUD_GAP) + 'px';
  box.style.overflow = 'hidden';
  return box.scrollHeight > box.clientHeight + 1;
}

// Aufklappzustand der beiden Wolken, absichtlich nur fuer die Sitzung im
// Speicher: er sagt nichts ueber den Bestand aus und gehoert nicht auf den
// Server.
const cloudOpen = { overview: false, detail: false };
/* UND DIE MARKEN EINES TESTTAGS. */
const dayTagsOpen = new Set();
/* HIER STAND `MORE_FILTERS_OPEN` -- der Merker, ob die Tagzeile offen
   steht. */

/* ---- DIE VIER ZUSTÄNDE EINES FÄLLIGKEITSDATUMS ---- */
const todayKey = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
/* `erledigt` GEHT ALS ZWEITES EIN UND NICHT ALS FUENFTER ZUSTAND DER ZEILE:
   eine erledigte Aufgabe HAT ein Datum und einen Termin -- sie ist nur nicht
   mehr offen. */
const dueOf = (z, doneToo = false) => {
  if (!z.dueDate) return 'none';
  const settled = doneToo && (z.kind === 'done' || z.done);
  if (z.dueDate < todayKey()) return settled ? 'late' : 'overdue';
  if (settled) return 'done';
  return z.dueDate === todayKey() ? 'today' : 'later';
};

// Wer die Wolke der Detailansicht neu zeichnen kann. Sie laesst sich nur
// messen, wenn ihr Block offen ist.
let redrawCloud = null;

/* ================= Vokabular und Darstellung ================= */
// Die Oberflaeche benennt sich um, die Daten nicht.
/* DIE VORGABE DES VOKABULARS -- DIESELBE LISTE WIE VOKABULAR_VORGABE IM
   SERVER, und das ist keine Doppelung ohne Grund: sie steht hier, damit die
   Oberflaeche schon VOR dem ersten Abruf beschriftet ist. */
let V = {};

// Weiterschaltung des Aufgabenknopfes: Notiz -> Aufgabe -> erledigt -> Notiz.
// Eine Abfolge, kein Entweder-oder -- deshalb ein Knopf statt dreier.
function taskMore(kind) {
  /* `note` IST HIER DER FALSCHE FREUND und bleibt stehen. */
  return { note: 'task', task: 'done', done: 'note', report: 'task' }[kind] || 'task';
}
/* --- Das Gewicht eines Kriteriums: Komma herein, Komma hinaus -------------
   "1,2" und "1.2" ergeben beide 1.2; alles andere ergibt NaN und faellt damit
   beim Server durch gueltigesGewicht(). */
const weightOutText = (raw) => {
  const raw2 = String(raw ?? '').trim();
  return raw2 === '' ? NaN : Number(raw2.replace(',', '.'));
};

/* 1 -> "1", 1.2 -> "1,2", 1.25 -> "1,25". */
const weightText = (g) => number(Math.round(Number(g) * 100) / 100, 0, 2);

/* Die Marke hinter einem Kriteriennamen -- ABGELEITET, kein Schalter: bei
   Gewicht 1 steht dort nichts. */
const weightMark = (g) => (Number(g) === 1 || g == null ? '' : '×' + weightText(g));

const vThing = (n) => counted(n, V.entryOne, V.entryMany);
/* ---- DER ZAEHLER EINER VERWALTUNGSZEILE ---- IN DER
   ZEILE STEHT DIE ZAHL, IM TITEL DAS WORT. */
const countCell = (short, long) =>
  `<span class="mcount" title="${esc(long)}">${esc(short)}</span>`;
const vTime = (n) => counted(n, V.dayOne, V.dayMany);
const vReport = (n) => counted(n, V.reportOne, V.reportMany);
const vTask = (n) => counted(n, V.taskOne, V.taskMany);
const vRating = (n) => counted(n, V.ratingOne, V.ratingMany);

/* Aus dem Verfasserobjekt des Servers wird die Beschriftung -- GENAU HIER und
   nirgends sonst, damit die Karte "Zugaenge" und die Beitraege im Eintrag
   nicht auseinanderlaufen koennen; beide rufen diese Funktion. */
function authorName(v) {
  if (!v) return t('list.noAuthor');
  return v.deleted ? t('list.deletedUser', { id: v.id }) : v.name;
}

let LINK_ROWS = 5;          // sichtbare Zeilen, bevor aufgeklappt wird
let TIMELINE_ON = true;
const LINK_ROW_LEVELS = [3, 5, 8, 12];

// Suchanbieter fuer Linkzeilen, die keine Adresse sind. %s ist der
// Platzhalter fuer den Suchtext.
let SEARCH_PROVIDERS = [];      // alle neun Plaetze, wie der Server sie liefert

/* JEDE SPRACHE, FUER DIE EINE DATEI LIEGT. */
let LANGUAGES = [];
/* DIE FUENFZEHN WOERTER JE SPRACHE, { <kennung>: { ...fuenfzehn } }. */
let VOCABULARIES = {};
/* UND ZWEI TAFELN DANEBEN, die Reparatur von B1, B2 und B4. */
let VOCABULARIES_OWN = {};
let VOCABULARY_DEFAULTS = {};
/* DIE VIER SAETZE AUS EINER ANTWORT UEBERNEHMEN. */
function takeVocabulary(r) {
  if (!r || typeof r !== 'object') return;
  if (r.vocabularies) VOCABULARIES = r.vocabularies;
  if (r.vocabulariesOwn) VOCABULARIES_OWN = r.vocabulariesOwn;
  if (r.vocabularyDefaults) VOCABULARY_DEFAULTS = r.vocabularyDefaults;
  if (r.vocabulary) V = { ...V, ...r.vocabulary };
}
/* WELCHE SPRACHE DER ABSCHNITT „BESTAND" ZEIGT,
   und fuer ALLE VIER KACHELN: die drei Namenskarten UND das
   Vokabular. */
let NAMES_SHOWN = null;
/* DIE NAMEN JE SPRACHE, ALS TAFEL UND AUF EINMAL -- ohne Zwischenspeicher. */
let NAMES_ALL = { cats: {}, crits: {} };
/* DIE ZWEI TAFELN AUS EINER ANTWORT UEBERNEHMEN. */
function takeNames(r) {
  if (!r || typeof r !== 'object') return;
  if (r.categoryNames && typeof r.categoryNames === 'object') NAMES_ALL.cats = r.categoryNames;
  if (r.criterionNames && typeof r.criterionNames === 'object') NAMES_ALL.crits = r.criterionNames;
}
let SEARCH_NAMES = 2;          // wie viele Namen unter einer Suchzeile stehen
const SEARCH_NAME_LEVELS = [1, 2, 3, 4];

// Woran eine Suchzeile erkennbar ist: am fehlenden Schema. Der Server setzt es
// bei allem, was wie eine Adresse aussieht -- was ohne dasteht, ist Suchtext.
const isSearch = (text) => !/^https?:\/\//i.test(String(text || ''));

// Zweite Schranke vor dem Oeffnen.
function searchTemplateOk(v) {
  return typeof v === 'string' && /^https?:\/\/[^\s]+$/i.test(v) && v.includes('%s');
}

// Die Anbieter unter einer Suchzeile: im Vorrat, Vorlage in Ordnung, Standard
// zuerst -- die Reihenfolge kommt fertig vom Server.
function searchList() {
  return SEARCH_PROVIDERS
    .filter(a => a.active && a.present && searchTemplateOk(a.template))
    .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
    .slice(0, SEARCH_NAMES);
}
const searchAddress = (template, text) => template.replace('%s', encodeURIComponent(text));

/* ================= Links im Kommentartext ================= */
// Erkennung und Knotenbau sind getrennt, und das mit Absicht: Schranke 2 kann
// nicht anschlagen, solange Schranke 1 richtig ist.

// Schranke 1. Nur ausdruecklich Geschriebenes gilt: http://, https:// und
// www.
const COMMENT_LINK = /(https?:\/\/|www\.)\S+/gi;

// Nachlaufende Satzzeichen gehoeren nicht zur Adresse.
const LINK_PUNCTUATION = '.,;:!?"\'»«…';
const LINK_BRACKETS = { ')': '(', ']': '[' };
const countChar = (s, z) => s.split(z).length - 1;

function trimLinkEnd(address) {
  for (;;) {
    const last = address.slice(-1);
    if (LINK_PUNCTUATION.includes(last)) { address = address.slice(0, -1); continue; }
    const opening = LINK_BRACKETS[last];
    if (opening && countChar(address, last) > countChar(address, opening)) {
      address = address.slice(0, -1); continue;
    }
    return address;
  }
}

/* ---- DIE HERVORHEBUNG, ALS DRITTES STUECK --------------------------------
   Die Zerlegung kannte frueher zwei Stuecke: gewoehnlichen Text und einen
   Link. */
function splitAtTerm(text, term, rest = {}) {
  const content = String(text ?? '');
  const b = String(term ?? '');
  if (!content) return [];
  if (!b) return [{ text: content, ...rest }];
  const lower = content.toLocaleLowerCase(LOCALE), lowerB = b.toLocaleLowerCase(LOCALE);
  const pieces = [];
  let from = 0;
  for (;;) {
    const i = lower.indexOf(lowerB, from);
    if (i < 0) break;
    if (i > from) pieces.push({ text: content.slice(from, i), ...rest });
    pieces.push({ text: content.slice(i, i + b.length), ...rest, matched: true });
    from = i + b.length;
  }
  if (from < content.length) pieces.push({ text: content.slice(from), ...rest });
  return pieces;
}

// Zerlegt den Rohtext in Stuecke: { text } ist gewoehnlicher Text, { text,
// ziel } ein Link, { text, treffer } eine Fundstelle des Suchbegriffs.
/* DIE MARKIERUNG IST DAS VIERTE STUECK DER ZERLEGUNG, Leitplanke
   L2. */
const MENTION_TAIL = /[\p{L}\p{N}_.-]/u;

/* DIE MARKIERUNGEN EINES ROHTEXTES, ALS STUECKE. Sie laufen VOR der Suche und
   NACH den Links durch dieselbe Kette wie jede andere Zerlegung. */
function splitAtMention(raw, marks, term, rest) {
  const text = String(raw ?? '');
  const list = (marks || []).filter(m => m && m.handle);
  if (!list.length) return splitAtTerm(text, term, rest);
  const pieces = [];
  let from = 0, i = 0;
  while (i < text.length) {
    if (text[i] !== '@') { i++; continue; }
    /* KEIN NAMENSZEICHEN VOR DEM `@`: „bert@beispiel.de" ist eine Adresse.
       Dieselbe Bedingung wie im Muster des Servers, nur ausgeschrieben. */
    if (i > 0 && MENTION_TAIL.test(text[i - 1])) { i++; continue; }
    /* DER LAENGSTE HANDGRIFF ZUERST -- sonst truege „@anna" die Markierung,
       wo „@annabelle" steht und beide Namen vergeben sind. */
    /* KLEIN GESCHRIEBEN MIT DER VERGLEICHSSPRACHE und nicht mit der des
       Lesers: sonst waeren „İstanbul" und „istanbul" fuer den einen derselbe
       Zugang und fuer den anderen zwei. */
    const hit = list.filter(m => text.slice(i + 1, i + 1 + m.handle.length)
        .toLocaleLowerCase(compareLocale()) === String(m.handle).toLocaleLowerCase(compareLocale()))
      .sort((a, b) => b.handle.length - a.handle.length)[0];
    const after = hit ? text[i + 1 + hit.handle.length] : '';
    if (!hit || (after && MENTION_TAIL.test(after))) { i++; continue; }
    if (i > from) for (const s of splitAtTerm(text.slice(from, i), term, rest)) pieces.push(s);
    pieces.push({ ...rest, text: '@' + authorName(hit.author), mention: true });
    from = i = i + 1 + hit.handle.length;
  }
  if (from < text.length)
    for (const s of splitAtTerm(text.slice(from), term, rest)) pieces.push(s);
  return pieces;
}

function splitCommentText(raw, term, marks) {
  const text = String(raw ?? '');
  const pieces = [];
  /* IN EINER ADRESSE WIRD NICHT MARKIERT. Ein `@` in einer URL gehoert zur
     Adresse; wer dort eine Markierung faende, zerschnitte den Link. */
  const take = (raw2, rest) => {
    const out = rest.target ? splitAtTerm(raw2, term, rest) : splitAtMention(raw2, marks, term, rest);
    for (const s of out) pieces.push(s);
  };
  let last = 0, matched;
  COMMENT_LINK.lastIndex = 0;
  while ((matched = COMMENT_LINK.exec(text)) !== null) {
    const address = trimLinkEnd(matched[0]);
    // Nach dem Abschneiden kann ein nacktes "https://" uebrigbleiben. Das ist
    // keine Adresse und wird wieder zu Text.
    if (address.length <= matched[1].length) continue;
    if (matched.index > last) take(text.slice(last, matched.index), {});
    take(address, {
      // angezeigt wird die Adresse, wie geschrieben
      target: /^www\./i.test(address) ? 'https://' + address : address
    });
    last = matched.index + address.length;
  }
  if (last < text.length) take(text.slice(last), {});
  return pieces;
}

/* Ein Stueck als Knoten. EINE FUNDSTELLE WIRD ZU <mark>, alles andere zu
   gewoehnlichem Text -- in beiden Faellen ueber textContent. */
function pieceNode(s) {
  const text = String(s?.text ?? '');
  /* DIE MARKIERUNG IST HERVORGEHOBEN WIE EIN TREFFER DER SUCHE UND DOCH ALS
     EIGENE SACHE ERKENNBAR: ein eigenes Element mit eigener Klasse,
     nicht `<mark>`. */
  if (s?.mention) {
    const at = document.createElement('span');
    at.className = 'mention';
    at.textContent = text;
    return at;
  }
  if (!s?.matched) return document.createTextNode(text);
  const m = document.createElement('mark');
  m.textContent = text;
  return m;
}

// Baut echte DOM-Knoten. Kein innerHTML auf diesem Weg: Maskierung ist damit
// nicht "nicht vergessen worden", sondern baulich unmoeglich.
function buildCommentNodes(pieces) {
  const part = document.createDocumentFragment();
  // Leere Stuecke fallen vorher heraus, damit weiter unten keine Abfrage auf
// "" mitten in der Zusammenfassung eines Links steht.
  const list = (pieces || []).filter(s => String(s?.text ?? '') !== '');
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    // Schranke 2: unmittelbar vor dem Setzen von href noch einmal pruefen.
// Faellt der String durch, wird sie gewoehnlicher Text, nicht Link.
    if (s.target && /^https?:\/\//i.test(String(s.target))) {
      /* EINE ADRESSE VON HIER WIRD DIE MARKE und nicht der Link nach
         draussen -- nur die fremde bleibt so stehen, wie sie dasteht. */
      const row = COMMENT_REFS.get(markupRefOf(s.target));
      if (row) {
        let k = i;
        while (k < list.length && String(list[k].target ?? '') === String(s.target)) k++;
        part.appendChild(markupRefNode(row, ''));
        i = k - 1;
        continue;
      }
      const a = document.createElement('a');
      a.href = String(s.target);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      /* EINE ADRESSE BLEIBT EIN LINK, AUCH WENN DER BEGRIFF MITTEN DARIN
         STEHT. */
      let j = i;
      while (j < list.length && String(list[j].target ?? '') === String(s.target))
        a.appendChild(pieceNode(list[j++]));
      i = j - 1;
      part.appendChild(a);
      continue;
    }
    part.appendChild(pieceNode(s));
  }
  return part;
}

/* DIE HERVORHEBUNG FUER JEDEN TEXT OHNE LINKS -- Titel, Kategorie, Tag,
   Kontextzeile, Linkadresse. */
const raiseHighlight = (text, term) =>
  buildCommentNodes(splitAtTerm(String(text ?? ''), term));

/* DEN INHALT EINES ELEMENTS DURCH HERVORGEHOBENE KNOTEN ERSETZEN. */
function highlightInNode(el, text, term) {
  if (!el || !term) return;
  el.replaceChildren(raiseHighlight(text, term));
}

/* ================= Auszeichnung ================= */
/* Eine Teilmenge von CommonMark. Innerhalb der Teilmenge gilt die
   Spezifikation; was nicht darin liegt, bleibt gewoehnlicher Text. */

// Die Zeichenklassen der Flankenregel. MARKUP_MARK nimmt Satzzeichen und
// Symbole, wie die Spezifikation es verlangt.
const MARKUP_ASCII_MARK = /[!-\/:-@\[-`{-~]/;
const MARKUP_MARK = /[\p{P}\p{S}]/u;
const MARKUP_SPACE = /[ \t\n\v\f\r]/;

// Nur diese Ziele werden ein Link -- dieselbe Schranke wie bei der nackten
// Adresse. Alles andere bleibt der Rohtext, wie er dasteht.
const MARKUP_TARGET = /^https?:\/\//i;

/* ZWEI GRENZEN GEGEN DEN ENDLOSEN TEXT. Die Spezifikation erlaubt die erste
   ausdruecklich und nennt drei Ebenen als Mindestmass; ohne die zweite
   traegt der Stapel ein Zitat aus tausend Zeichen `>` nicht. */
const MARKUP_NESTING = 32;
const MARKUP_DEPTH = 100;

/* ---- Die Inline-Ebene ---- */

// Was links und rechts eines Zeichenlaufs steht, entscheidet ueber Oeffnen
// und Schliessen. Zeilenanfang und Zeilenende zaehlen als Leerraum.
function markupFlanks(text, from, to) {
  const before = from > 0 ? text[from - 1] : '\n';
  const after = to < text.length ? text[to] : '\n';
  const spaceBefore = MARKUP_SPACE.test(before), spaceAfter = MARKUP_SPACE.test(after);
  const markBefore = MARKUP_MARK.test(before), markAfter = MARKUP_MARK.test(after);
  const left = !spaceAfter && (!markAfter || spaceBefore || markBefore);
  const right = !spaceBefore && (!markBefore || spaceAfter || markAfter);
  return { left, right, markBefore, markAfter };
}

/* Ein Code-Abschnitt traegt sich selbst: zwischen zwei gleich langen Laeufen
   von Backticks gilt keine weitere Auszeichnung. Er steht in EINER Zeile --
   ueber den Umbruch hinweg wuerde ein Zaun aus drei Backticks einer. */
function markupCode(text, at) {
  let run = 0;
  while (text[at + run] === '`') run++;
  const open = at + run;
  const stop = text.indexOf('\n', open);
  const line = stop < 0 ? text.length : stop;
  let from = open;
  for (;;) {
    const found = text.indexOf('`', from);
    if (found < 0 || found >= line) return null;
    let n = 0;
    while (text[found + n] === '`') n++;
    if (n === run) {
      let body = text.slice(open, found);
      // Ein Leerzeichen an beiden Enden faellt weg, damit `` ` `` moeglich ist.
      if (body[0] === ' ' && body[body.length - 1] === ' ' && /[^ ]/.test(body))
        body = body.slice(1, -1);
      return { text: body, end: found + n };
    }
    from = found + n;
  }
}

// Das Ziel eines Links, ab der oeffnenden Klammer. Ein Titel dahinter wird
// gelesen und verworfen -- die Teilmenge kennt ihn nicht.
function markupTarget(text, at) {
  let i = at + 1;
  const skip = () => { while (i < text.length && MARKUP_SPACE.test(text[i])) i++; };
  skip();
  let target = '';
  if (text[i] === '<') {
    i++;
    for (;;) {
      if (i >= text.length) return null;
      const c = text[i];
      if (c === '\n' || c === '<') return null;
      if (c === '>') { i++; break; }
      if (c === '\\' && MARKUP_ASCII_MARK.test(text[i + 1] || '')) { target += text[i + 1]; i += 2; continue; }
      target += c; i++;
    }
  } else {
    let depth = 0;
    for (;;) {
      if (i >= text.length) break;
      const c = text[i];
      if (c === '\\' && MARKUP_ASCII_MARK.test(text[i + 1] || '')) { target += text[i + 1]; i += 2; continue; }
      if (MARKUP_SPACE.test(c) || c.charCodeAt(0) < 0x20 || c === '\x7f') break;
      if (c === '(') { if (++depth > MARKUP_NESTING) return null; target += c; i++; continue; }
      if (c === ')') { if (!depth) break; depth--; target += c; i++; continue; }
      target += c; i++;
    }
    if (depth) return null;
  }
  const afterTarget = i;
  skip();
  const quote = text[i];
  if (i > afterTarget && (quote === '"' || quote === "'" || quote === '(')) {
    const close = quote === '(' ? ')' : quote;
    i++;
    for (;;) {
      if (i >= text.length) return null;
      if (text[i] === '\\' && MARKUP_ASCII_MARK.test(text[i + 1] || '')) { i += 2; continue; }
      if (text[i] === close) { i++; break; }
      i++;
    }
    skip();
  }
  if (text[i] !== ')') return null;
  return { target, end: i + 1 };
}

// Die Teilmenge traegt zwei Sterne fuer fett und einen Unterstrich fuer
// kursiv. Jedes andere Paar bleibt stehen, wie es geschrieben wurde.
const markupWrap = (char, used) =>
  (char === '*' && used > 1) ? 'strong' : (char === '_' && used < 2) ? 'em' : '';

/* Die Zeichenlaeufe werden nach der Spezifikation gepaart; erst danach
   entscheidet sich, ob daraus ein Knoten oder wieder Text wird. */
/* DIE STUECKE STEHEN IN EINER VERKETTETEN LISTE UND NICHT IN EINEM FELD:
   `indexOf` und `splice` kosteten dort je Paar die ganze Folge. */
function markupPairs(marks, bottom) {
  let at = bottom;
  /* DIE UNTERE SCHRANKE JE ZEICHEN, LAENGE UND ROLLE, wie die Spezifikation
     sie fuehrt: wo einmal kein Oeffner stand, sucht kein zweiter Schliesser
     noch einmal danach. */
  const floors = new Map();
  while (at < marks.length) {
    const closer = marks[at];
    if (closer.gone || !closer.canClose || !closer.node.text) { at++; continue; }
    const key = `${closer.char}${closer.original % 3}${closer.canOpen ? 'o' : ''}`;
    const floor = Math.max(bottom, (floors.has(key) ? floors.get(key) : -1) + 1);
    let found = -1;
    for (let i = at - 1; i >= floor; i--) {
      const opener = marks[i];
      if (opener.gone || !opener.canOpen || !opener.node.text
          || opener.char !== closer.char) continue;
      /* DIE DREIERREGEL: kann eines der beiden Zeichen beides, darf die Summe
         kein Vielfaches von drei sein -- es sei denn, beide sind es. */
      const odd = (opener.canClose || closer.canOpen)
        && (opener.original + closer.original) % 3 === 0
        && !(opener.original % 3 === 0 && closer.original % 3 === 0);
      if (odd) continue;
      found = i; break;
    }
    if (found < 0) {
      floors.set(key, at - 1);
      if (!closer.canOpen) closer.gone = true;
      at++;
      continue;
    }
    const opener = marks[found];
    const used = (opener.node.text.length >= 2 && closer.node.text.length >= 2) ? 2 : 1;
    const inner = [];
    let deep = 0;
    for (let n = opener.node.next; n && n !== closer.node; n = n.next) {
      inner.push(n);
      if (n.deep > deep) deep = n.deep;
    }
    /* TIEFER ALS HUNDERT EBENEN BLEIBT ALLES TEXT, wie beim Zitat und bei der
       Aufzaehlung: ein tieferer Baum laesst beim Lesen den Stapel ueberlaufen. */
    if (deep >= MARKUP_DEPTH) { at++; continue; }
    opener.node.text = opener.node.text.slice(used);
    closer.node.text = closer.node.text.slice(used);
    const kind = markupWrap(closer.char, used);
    const mark = closer.char.repeat(used);
    const back = kind ? '' : mark + markupFlatten(inner) + mark;
    const made = kind ? { type: kind, mark, children: inner, deep: deep + 1 }
                      : { type: 'text', text: back, raw: back, deep: deep + 1 };
    opener.node.next = made; made.prev = opener.node;
    made.next = closer.node; closer.node.prev = made;
    // Die Zeichen dazwischen sind verbraucht.
    for (let i = found + 1; i < at; i++) marks[i].gone = true;
    if (!opener.node.text) opener.gone = true;
    /* Traegt der Schliesser noch Zeichen, sucht er von derselben Stelle aus
       weiter -- der naechste Oeffner darunter. */
    if (!closer.node.text) { closer.gone = true; at++; }
  }
  marks.length = bottom;
}

// Ein Baum, der nicht gezeichnet wird, faellt auf seinen Rohtext zurueck --
// Zeichen fuer Zeichen, damit kein Teil verschwindet.
function markupFlatten(parts) {
  return (parts || []).map(p => p.raw !== undefined ? p.raw
    : p.type === 'text' ? p.text
    : p.mark + markupFlatten(p.children) + p.mark).join('');
}

// Ob ein Zeichen selbst maskiert ist -- zwei Backslashes heben sich auf.
function markupEscaped(source, at) {
  let n = 0;
  while (at - 1 - n >= 0 && source[at - 1 - n] === '\\') n++;
  return n % 2 === 1;
}

// Benachbarte Textstuecke werden eins; leere fallen heraus.
function markupJoin(parts) {
  const out = [];
  for (const p of parts) {
    /* Die Buchfuehrung der Kette faellt hier weg: der Baum, der herauskommt,
       traegt weder Rueckwege noch die gezaehlte Tiefe. */
    delete p.prev; delete p.next; delete p.deep;
    if (p.type !== 'text') { if (p.children) p.children = markupJoin(p.children); out.push(p); continue; }
    if (!p.text) continue;
    const raw = p.raw === undefined ? p.text : p.raw;
    const last = out[out.length - 1];
    if (last && last.type === 'text') { last.text += p.text; last.raw += raw; continue; }
    out.push({ type: 'text', text: p.text, raw });
  }
  return out;
}

function markupInline(source) {
  const marks = [], brackets = [];
  /* Der Kopf traegt nichts; er haelt nur den Anfang der Kette. */
  const head = { type: 'head' };
  let tail = head;
  const add = (node) => { node.prev = tail; tail.next = node; tail = node; return node; };
  /* Alles hinter einem Stueck abschneiden -- so wird aus einem Paar, das
     kein Link wird, wieder sein Rohtext. */
  const cutAfter = (node) => { node.next = null; tail = node; };
  let pos = 0, plain = '', plainSource = '';
  /* DER ROHTEXT LAEUFT MIT: ein Backslash vor einem Satzzeichen faellt beim
     Zeichnen weg und muss zurueckkommen, wenn ein Paar doch Text bleibt. */
  const flush = () => {
    if (plain) add({ type: 'text', text: plain, raw: plainSource });
    plain = ''; plainSource = '';
  };
  while (pos < source.length) {
    const c = source[pos];
    if (c === '\\' && MARKUP_ASCII_MARK.test(source[pos + 1] || '')) {
      plain += source[pos + 1]; plainSource += source.slice(pos, pos + 2); pos += 2; continue;
    }
    if (c === '`') {
      const span = markupCode(source, pos);
      /* OHNE GEGENSTUECK BLEIBT DER GANZE LAUF TEXT und nicht nur sein erstes
         Zeichen -- sonst faende der Rest ein falsches Gegenstueck. */
      if (!span) {
        let run = 0;
        while (source[pos + run] === '`') run++;
        plain += '`'.repeat(run); plainSource += '`'.repeat(run); pos += run; continue;
      }
      flush();
      add({ type: 'code', text: span.text, raw: source.slice(pos, span.end) });
      pos = span.end; continue;
    }
    if (c === '[') {
      // EIN BILD WIRD NIE GEZEICHNET: das `!` davor macht die Klammer stumm.
      const image = source[pos - 1] === '!' && !markupEscaped(source, pos - 1);
      if (image) { plain = plain.slice(0, -1); plainSource = plainSource.slice(0, -1); }
      flush();
      const node = add({ type: 'text', text: image ? '![' : '[' });
      brackets.push({ node, from: image ? pos - 1 : pos, image, floor: marks.length });
      pos++; continue;
    }
    if (c === ']') {
      const open = brackets.pop();
      if (!open) { plain += c; plainSource += c; pos++; continue; }
      const link = source[pos + 1] === '(' ? markupTarget(source, pos + 1) : null;
      if (!link || !MARKUP_TARGET.test(link.target) || open.image) {
        /* DER ROHTEXT KOMMT ZURUECK, damit nichts Halbes stehenbleibt: ein
           Ziel, das kein Link wird, laesst auch den Namen unberuehrt. */
        flush();
        const end = link ? link.end : pos + 1;
        const back = source.slice(open.from, end);
        open.node.text = back; open.node.raw = back;
        cutAfter(open.node);
        marks.length = open.floor;
        pos = end; continue;
      }
      flush();
      markupPairs(marks, open.floor);
      const inner = [];
      for (let n = open.node.next; n; n = n.next) inner.push(n);
      open.node.type = 'link';
      open.node.target = link.target;
      open.node.children = inner;
      open.node.raw = source.slice(open.from, link.end);
      cutAfter(open.node);
      // EINEN LINK IM LINK GIBT ES NICHT.
      brackets.length = 0;
      pos = link.end; continue;
    }
    if (c === '*' || c === '_') {
      let run = 0;
      while (source[pos + run] === c) run++;
      const flank = markupFlanks(source, pos, pos + run);
      flush();
      const node = add({ type: 'text', text: c.repeat(run) });
      marks.push({ node, char: c, original: run,
        canOpen: c === '*' ? flank.left : flank.left && (!flank.right || flank.markBefore),
        canClose: c === '*' ? flank.right : flank.right && (!flank.left || flank.markAfter) });
      pos += run; continue;
    }
    plain += c; plainSource += c; pos++;
  }
  flush();
  markupPairs(marks, 0);
  // Die Kette wird eingesammelt; markupJoin raeumt die Verweise weg.
  const parts = [];
  for (let n = head.next, next; n; n = next) { next = n.next; parts.push(n); }
  return markupJoin(parts);
}

/* ---- Die Zeilenebene ---- */

const MARKUP_QUOTE = /^ {0,3}>(?: |\t)?/;
const MARKUP_BULLET = /^( {0,3})(-)(?:( +)(.*)|()())$/;
const MARKUP_NUMBER = /^( {0,3})(\d{1,9})\.(?:( +)(.*)|()())$/;
/* Diese vier liegen nicht in der Teilmenge und bleiben Text -- eine
   Absatzzeile beenden sie trotzdem, sonst zoege ein Zitat sie zu sich. */
const MARKUP_RULE = /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const MARKUP_HEADING = /^ {0,3}#{1,6}(?:[ \t]|$)/;
const MARKUP_FENCE = /^ {0,3}(?:`{3,}|~{3,})/;
const MARKUP_ITEM = /^ {0,3}(?:[-+*]|\d{1,9}[.)])(?:[ \t]+\S|[ \t]*$)/;
const MARKUP_MARKER = /^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+/;

const markupOpensBlock = (line) =>
  MARKUP_QUOTE.test(line) || MARKUP_RULE.test(line) || MARKUP_HEADING.test(line)
  || MARKUP_FENCE.test(line) || MARKUP_ITEM.test(line);

// Ob eine Zeile innen auf einem Absatz endet -- nur dann laeuft die naechste
// Zeile ohne eigenes Zeichen mit. Die Zeichen werden dafuer abgetragen.
function markupLazy(line) {
  let rest = String(line);
  for (;;) {
    const marker = rest.match(MARKUP_QUOTE) || rest.match(MARKUP_MARKER);
    if (!marker) break;
    rest = rest.slice(marker[0].length);
  }
  return /\S/.test(rest) && !MARKUP_RULE.test(rest)
    && !MARKUP_HEADING.test(rest) && !MARKUP_FENCE.test(rest);
}

// Ein Zitat nimmt seine Zeilen und wird selbst wieder zerlegt.
function markupQuote(lines, at, depth) {
  const inner = [];
  let i = at, running = false;
  while (i < lines.length) {
    const marker = lines[i].match(MARKUP_QUOTE);
    if (marker) {
      const rest = lines[i].slice(marker[0].length);
      inner.push(rest);
      running = markupLazy(rest);
      i++; continue;
    }
    if (running && /\S/.test(lines[i]) && !markupOpensBlock(lines[i])) { inner.push(lines[i]); i++; continue; }
    break;
  }
  return { block: { type: 'quote', blocks: markupBlocks(inner, depth + 1) }, end: i };
}

// Eine Aufzaehlung sammelt ihre Punkte; eine eingerueckte Folgezeile gehoert
// zum Punkt darueber.
function markupList(lines, at, ordered, depth) {
  const pattern = ordered ? MARKUP_NUMBER : MARKUP_BULLET;
  const items = [];
  let i = at, start = 1, blank = false;
  while (i < lines.length) {
    const m = lines[i].match(pattern);
    if (!m || MARKUP_RULE.test(lines[i])) {
      if (!/\S/.test(lines[i] ?? '')) { blank = true; i++; continue; }
      const last = items[items.length - 1];
      if (last && !blank && !markupOpensBlock(lines[i])) { last.push(lines[i]); i++; continue; }
      break;
    }
    blank = false;
    if (!items.length && ordered) start = Number(m[2]);
    const markerWidth = m[1].length + (ordered ? m[2].length + 1 : 1);
    const spaces = m[3] || '';
    const indent = markerWidth + (spaces.length >= 1 && spaces.length <= 4 ? spaces.length : 1);
    const item = [m[4] ?? ''];
    // EIN PUNKT, DER MIT EINER LEERZEILE ANFAENGT, BLEIBT LEER.
    const bare = (m[4] ?? '') === '';
    let itemBlank = false;
    i++;
    while (i < lines.length) {
      const line = lines[i];
      if (!/\S/.test(line)) { if (bare) break; item.push(''); itemBlank = true; i++; continue; }
      if (line.startsWith(' '.repeat(indent))) { item.push(line.slice(indent)); i++; continue; }
      if (!itemBlank && !markupOpensBlock(line)) { item.push(line); i++; continue; }
      break;
    }
    while (item.length && !/\S/.test(item[item.length - 1])) { item.pop(); blank = true; }
    items.push(item);
  }
  return { block: { type: ordered ? 'number' : 'bullet', start,
                    items: items.map(lns => markupBlocks(lns, depth + 1)) }, end: i };
}

function markupBlocks(lines, depth) {
  const blocks = [];
  // Tiefer als hundert Ebenen bleibt alles Text.
  const deep = depth >= MARKUP_DEPTH;
  let i = 0, text = [];
  const flush = () => {
    while (text.length && !/\S/.test(text[text.length - 1])) text.pop();
    if (text.length) blocks.push({ type: 'text', lines: text });
    text = [];
  };
  while (i < lines.length) {
    const line = lines[i];
    if (!deep && MARKUP_QUOTE.test(line)) { flush(); const r = markupQuote(lines, i, depth); blocks.push(r.block); i = r.end; continue; }
    // EINE TRENNLINIE IST KEINE AUFZAEHLUNG, und sie bleibt Text.
    const rule = MARKUP_RULE.test(line);
    /* MITTEN IN EINEM ABSATZ FAENGT NUR AN, WAS AUCH INHALT HAT -- und eine
       Nummerierung nur bei der Eins. */
    const opens = (m, ordered) => !rule && !deep && m && (!text.length
      || ((m[4] || '') !== '' && (!ordered || Number(m[2]) === 1)));
    if (opens(line.match(MARKUP_BULLET), false)) {
      flush(); const r = markupList(lines, i, false, depth); blocks.push(r.block); i = r.end; continue;
    }
    if (opens(line.match(MARKUP_NUMBER), true)) {
      flush(); const r = markupList(lines, i, true, depth); blocks.push(r.block); i = r.end; continue;
    }
    if (!text.length && !/\S/.test(line)) { i++; continue; }
    text.push(line); i++;
  }
  flush();
  return blocks;
}

// Der Rohtext als Baum. Die Zeilenebene liegt ueber der Inline-Ebene, und
// beide liegen ueber der Zerlegung, die es schon gibt.
function markupParse(raw) {
  return markupBlocks(String(raw ?? '').replace(/\r\n|\r/g, '\n').split('\n'), 0);
}

/* ---- Die Marken heraus ---- */

/* Fuer die Stellen, die nur Text koennen. Sie bekommen denselben Baum und
   lesen aus ihm den Text, den der Leser zeichnen wuerde. */
function markupPlainInline(parts) {
  return parts.map(p => p.type === 'text' || p.type === 'code' ? p.text
    : markupPlainInline(p.children)).join('');
}

function markupPlainBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.type === 'text') { out.push(markupPlainInline(markupInline(b.lines.join('\n')))); continue; }
    if (b.type === 'quote') { out.push(markupPlainBlocks(b.blocks)); continue; }
    for (const item of b.items) out.push(markupPlainBlocks(item));
  }
  return out.join('\n');
}

function markupPlain(raw) {
  return markupPlainBlocks(markupParse(raw));
}

/* ---- Vom Baum zu den Knoten ---- */

/* Das Zeichen fuer „fuehrt nach draussen". Es wird einmal gebaut und danach
   geklont; gesetzt wird es ueber createElementNS und nicht ueber innerHTML. */
let MARKUP_OUT = null;
function markupOutMark() {
  if (!MARKUP_OUT) {
    const ns = 'http://www.w3.org/2000/svg';
    MARKUP_OUT = document.createElementNS(ns, 'svg');
    for (const [name, value] of [['class', 'icon markup-out'], ['viewBox', '0 0 24 24'],
      ['fill', 'none'], ['stroke', 'currentColor'], ['stroke-width', '2'],
      ['stroke-linecap', 'round'], ['stroke-linejoin', 'round'], ['aria-hidden', 'true']])
      MARKUP_OUT.setAttribute(name, value);
    for (const d of ['M14 5h5v5', 'M19 5l-7 7', 'M18 13v6H5V6h6']) {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      MARKUP_OUT.appendChild(path);
    }
  }
  return MARKUP_OUT.cloneNode(true);
}

/* Die Stuecke eines Absatzes als Knoten. In einem Link wird keine nackte
   Adresse mehr gesucht -- ein Link im Link gibt es nicht. */
function markupInlineNodes(parts, into, term, marks, inLink) {
  for (const p of parts) {
    if (p.type === 'text') {
      into.appendChild(inLink ? raiseHighlight(p.text, term)
        : buildCommentNodes(splitCommentText(p.text, term, marks)));
      continue;
    }
    if (p.type === 'code') {
      const code = document.createElement('code');
      code.className = 'markup-code';
      code.appendChild(raiseHighlight(p.text, term));
      into.appendChild(code);
      continue;
    }
    if (p.type === 'link') {
      // Schranke 2, wie bei der nackten Adresse: unmittelbar vor dem href.
      if (!MARKUP_TARGET.test(String(p.target))) {
        into.appendChild(raiseHighlight(markupFlatten([p]), term));
        continue;
      }
      const row = COMMENT_REFS.get(markupRefOf(p.target));
      if (row) {
        into.appendChild(markupRefNode(row, term, markupPlainInline(p.children)));
        continue;
      }
      const a = document.createElement('a');
      a.href = String(p.target);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'markup-link';
      a.title = String(p.target);
      markupInlineNodes(p.children, a, term, marks, true);
      a.appendChild(markupOutMark());
      into.appendChild(a);
      continue;
    }
    const el = document.createElement(p.type === 'strong' ? 'strong' : 'em');
    markupInlineNodes(p.children, el, term, marks, inLink);
    into.appendChild(el);
  }
}

function markupBlockNodes(blocks, into, term, marks) {
  for (const b of blocks) {
    if (b.type === 'text') {
      markupInlineNodes(markupInline(b.lines.join('\n')), into, term, marks, false);
      continue;
    }
    if (b.type === 'quote') {
      const box = document.createElement('blockquote');
      box.className = 'markup-quote';
      markupBlockNodes(b.blocks, box, term, marks);
      into.appendChild(box);
      continue;
    }
    const list = document.createElement(b.type === 'number' ? 'ol' : 'ul');
    list.className = 'markup-list';
    if (b.type === 'number' && b.start !== 1) list.start = b.start;
    for (const item of b.items) {
      const row = document.createElement('li');
      markupBlockNodes(item, row, term, marks);
      list.appendChild(row);
    }
    into.appendChild(list);
  }
}

/* Der Leser. Zwischen den Bloecken steht kein Umbruch: ein Blockelement
   faengt seine Zeile selbst an, und `pre-wrap` zeigte ihn sonst zweimal. */
function markupNodes(raw, term, marks) {
  const part = document.createDocumentFragment();
  markupBlockNodes(markupParse(raw), part, term, marks);
  return part;
}

/* ---- Der Verweis auf einen Kommentar ---- */

/* Was die Marke traegt: Titel des Eintrags und Stellung des Kommentars. Was
   der Leser nicht sehen darf, steht als `null` darin. */
const COMMENT_REFS = new Map();

/* Beim Zeichnen wird die Herkunft geprueft: eine Adresse von anderswoher
   bleibt ein gewoehnlicher Link nach draussen. Heraus kommt der Schluessel
   der Auskunft -- `c` fuer einen Kommentar, `i` fuer einen Eintrag. */
function markupRefOf(target) {
  const here = location.origin + location.pathname;
  const text = String(target ?? '');
  if (!text.startsWith(here + '#/')) return '';
  const found = text.slice(here.length).match(ENTRY_PATTERN);
  if (!found) return '';
  const comment = commentOutAddress(found[2]);
  return comment ? `c${comment}` : `i${Number(found[1])}`;
}

/* AUCH DIE ROH GESCHRIEBENE ADRESSE ZAEHLT: eine eingefuegte Adresse von
   hier soll dieselbe Marke werden wie eine mit Namen. */
function markupRefScan(parts, want) {
  for (const p of parts) {
    if (p.type === 'link') { const k = markupRefOf(p.target); if (k) want.add(k); }
    if (p.type === 'text')
      for (const piece of splitCommentText(p.text, '', []))
        if (piece.target) { const k = markupRefOf(piece.target); if (k) want.add(k); }
    if (p.children) markupRefScan(p.children, want);
  }
}

function markupRefBlocks(blocks, want) {
  for (const b of blocks) {
    if (b.type === 'text') { markupRefScan(markupInline(b.lines.join('\n')), want); continue; }
    if (b.type === 'quote') { markupRefBlocks(b.blocks, want); continue; }
    for (const item of b.items) markupRefBlocks(item, want);
  }
}

// Welche Verweise eines Textes noch keine Auskunft haben.
function markupRefMissing(texts) {
  const want = new Set();
  for (const text of texts) markupRefBlocks(markupParse(text || ''), want);
  return [...want].filter(n => !COMMENT_REFS.has(n));
}

// Ein laufender Ruf ist keine Auskunft: sonst bekaeme die zweite Stelle keine.
const COMMENT_REFS_ASK = new Map();

const markupRefCut = (ask, sign) =>
  ask.filter(k => k[0] === sign).map(k => k.slice(1)).join(',');

async function markupRefAsk(ask) {
  let came = false;
  try {
    const rows = await api('GET',
      `/api/comment-refs?ids=${markupRefCut(ask, 'c')}&items=${markupRefCut(ask, 'i')}`);
    for (const row of rows) COMMENT_REFS.set(row.key, row);
    /* WAS GEFRAGT UND NICHT BEANTWORTET WURDE, GIBT ES NICHT: der Platzhalter
       traegt die Marke und wird nicht noch einmal gefragt. */
    for (const k of ask)
      if (!COMMENT_REFS.has(k)) COMMENT_REFS.set(k, { key: k, gone: true });
    /* AUCH EIN PLATZHALTER IST EINE AUSKUNFT: ohne das Neuzeichnen bliebe die
       rohe Adresse stehen, bis die Ansicht aus einem anderen Grund zeichnet.
       Ein zweiter Ruf folgt daraus nicht -- jeder Schluessel steht jetzt da. */
    came = true;
  } catch {
    /* EIN GESCHEITERTER RUF WIRD VERGESSEN: die naechste Zeichnung fragt
       wieder. Neu gezeichnet wird nicht -- der Ruf fragte sich im Kreis. */
  } finally {
    for (const k of ask) COMMENT_REFS_ASK.delete(k);
  }
  return came;
}

/* Ein Ruf je Zeichnung, gesammelt ueber alle Kommentare und die
   Beschreibung. Die Route achtet auf dieselbe Schranke wie der Eintrag.
   Heraus kommt, ob eine Auskunft ankam -- nur dann lohnt das Neuzeichnen. */
async function markupRefLoad(keys) {
  const running = [...new Set(keys.map(k => COMMENT_REFS_ASK.get(k)).filter(Boolean))];
  /* Nur so viele, wie die Route auf einmal beantwortet -- je Art
     zweihundert; der Rest kommt beim naechsten Zeichnen. */
  const ask = keys.filter(k => !COMMENT_REFS_ASK.has(k)).slice(0, 400);
  if (ask.length) {
    const call = markupRefAsk(ask);
    for (const k of ask) COMMENT_REFS_ASK.set(k, call);
    running.push(call);
  }
  return (await Promise.all(running)).some(Boolean);
}

/* Die Marke statt der Adresse: Titel und Nummer sagen, wohin es geht. */
/* DER SPRUNG STEHT AUSSERHALB DES ZEICHNENS: er entscheidet nach dem Eintrag
   und nicht nach der Adresse, und ein zweiter Klick loest ihn wieder aus. */
let LIT_TIMER = 0;
// Welche Zeile leuchtet -- eine Angabe fuer alle Zeichnungen der Ansicht.
let LIT_COMMENT = 0;

const commentRow = (id) =>
  document.querySelector(`.cmt[data-comment="${Number(id)}"]`);

/* ---- Die Zeile bleibt stehen, bis die Seite ruhig ist ---- Nach dem Sprung
   zieht sie nach: Verweise werden zu Kaesten, Vorschauen kommen an, der
   Kommentarblock wird neu gebaut -- und das Ziel wandert unter dem Leser weg. */
const JUMP_HOLD_MS = 1600;
let JUMP_FRAME = 0, JUMP_OFF = null;
const JUMP_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'];

function commentHoldStop() {
  if (JUMP_FRAME && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(JUMP_FRAME);
  JUMP_FRAME = 0;
  if (JUMP_OFF) JUMP_OFF();
  JUMP_OFF = null;
}

/* Der eigene Ruf loest keines dieser Ereignisse aus: was hier ankommt, kommt
   vom Leser, und dann hat er das letzte Wort. Nachgestellt wird nur, wenn die
   Zeile sich wirklich bewegt hat. */
function commentHold(id, want) {
  commentHoldStop();
  if (typeof requestAnimationFrame !== 'function') return;
  const end = Date.now() + JUMP_HOLD_MS;
  let at = want;
  JUMP_OFF = () => JUMP_EVENTS.forEach(n => window.removeEventListener(n, commentHoldStop));
  JUMP_EVENTS.forEach(n => window.addEventListener(n, commentHoldStop, { passive: true }));
  const step = () => {
    const row = commentRow(id);
    if (!row || Date.now() > end) return commentHoldStop();
    const now = row.getBoundingClientRect().top;
    if (Math.abs(now - at) > 1) {
      row.scrollIntoView({ block: 'center' });
      at = row.getBoundingClientRect().top;
    }
    JUMP_FRAME = requestAnimationFrame(step);
  };
  JUMP_FRAME = requestAnimationFrame(step);
}

const SOFT_OK = () => !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

/* `soft` gilt im eigenen Eintrag: dort steht die Seite schon, und ein
   gleitender Weg zeigt, wohin es ging. */
function commentJump(id, soft) {
  const target = commentRow(id);
  if (!target) { LIT_COMMENT = 0; return false; }
  openBlock('kommentare');
  clearTimeout(LIT_TIMER);
  for (const k of document.querySelectorAll('.cmt.lit')) k.classList.remove('lit');
  LIT_COMMENT = Number(id);
  target.classList.add('lit');
  const smooth = soft && SOFT_OK();
  commentHoldStop();
  target.scrollIntoView?.(smooth ? { behavior: 'smooth', block: 'center' } : { block: 'center' });
  // Ein gleitender Weg vertruege die Richtigstellung Bild fuer Bild nicht.
  if (!smooth) commentHold(id, target.getBoundingClientRect?.().top ?? 0);
  LIT_TIMER = setTimeout(() => {
    LIT_COMMENT = 0;
    for (const k of document.querySelectorAll('.cmt.lit')) k.classList.remove('lit');
  }, 2600);
  return true;
}

/* Ein selbst gesetzter Name gewinnt; die eingefuegte Adresse zieht den Titel
   des Ziels. Ein Verweis auf einen Eintrag traegt keine Nummer. */
function markupRefNode(row, term, name) {
  const a = document.createElement('a');
  a.className = 'markup-ref';
  /* EIN VERWEIS AUF EINEN GELOESCHTEN KOMMENTAR BEKOMMT KEIN KLICKZIEL: die
     Adresse zeigte auf nichts und oeffnete einen neuen Tab auf denselben
     Eintrag. Das Wort steht statt des Titels, denn einen gibt es nicht. */
  if (row.gone) {
    a.classList.add('gone');
    a.appendChild(raiseHighlight(t('entry.refGone'), term));
    return a;
  }
  a.href = entryAddress(row.itemId, '', row.number ? row.id : 0);
  a.title = t('entry.refHint');
  a.appendChild(raiseHighlight(name || row.itemTitle, term));
  if (row.number) {
    const no = document.createElement('span');
    no.className = 'markup-ref-no';
    no.textContent = '#' + row.number;
    a.appendChild(no);
  }
  // Strg-, Umschalt- und Mittelklick bleiben dem Browser.
  a.onclick = (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    /* IM EIGENEN EINTRAG WIRD NICHT NEU GEZEICHNET: der Umweg ueber die
       Adresse baute die ganze Ansicht noch einmal auf. */
    const open = (ENTRY_PATTERN.exec(location.hash || '') || [])[1];
    if (Number(open) !== Number(row.itemId)) return;
    // Steht die Zeile nicht da, holt der Browser den Eintrag neu.
    if (row.number && !commentRow(row.id)) return;
    e.preventDefault();
    /* Die Adresse zieht nach, ohne zu zeichnen -- sonst zeigte sie nach dem
       Sprung noch auf die Zeile davor. */
    const term = termOutAddress((ENTRY_PATTERN.exec(location.hash || '') || [])[2]);
    const want = entryAddress(row.itemId, term, row.number ? row.id : 0);
    if (location.hash !== want && typeof history !== 'undefined'
        && typeof history.replaceState === 'function')
      history.replaceState(null, '', want);
    /* Ein Kasten ohne Nummer zeigt auf den Eintrag selbst: dort gibt es keine
       Zeile zum Anleuchten, also geht es an den Kopf. */
    if (row.number) commentJump(row.id, true);
    else document.querySelector('.title-head')?.scrollIntoView?.(
      SOFT_OK() ? { behavior: 'smooth', block: 'start' } : { block: 'start' });
  };
  return a;
}

/* ================= Das Menue der Auszeichnung ================= */
/* Es haengt ueber der oberen Kante des Feldes und nicht am Schreibzeiger:
   die Schriftgroesse ist einstellbar, eine gerechnete Zeilenhoehe nicht. */

/* Rueckgaengig bleibt brauchbar, solange der Browser die Einsetzung selbst
   vornimmt. `field.value = …` leerte den Stapel des Browsers. */
function markupInsert(field, from, to, text) {
  field.focus();
  field.setSelectionRange(from, to);
  let done = false;
  try { done = document.execCommand('insertText', false, text); }
  catch { done = false; }
  if (!done || field.value.slice(from, from + text.length) !== text) {
    field.value = field.value.slice(0, from) + text + field.value.slice(to);
    field.setSelectionRange(from + text.length, from + text.length);
  }
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

/* DER LEERRAUM AM RAND BLEIBT DRAUSSEN: hinter einem oeffnenden `*` oder `_`
   darf keiner stehen, sonst entsteht keine Auszeichnung. Der Code-Abschnitt
   kennt die Regel nicht, und eine Auswahl aus lauter Leerraum bleibt ganz. */
function markupAround(field, before, after) {
  const from = field.selectionStart, to = field.selectionEnd;
  const raw = field.value.slice(from, to);
  const flanked = before === '**' || before === '_';
  const core = flanked ? raw.trim() : raw;
  const lead = flanked && core ? raw.length - raw.trimStart().length : 0;
  const chosen = core || raw;
  const left = from + lead;
  markupInsert(field, left, left + chosen.length, before + chosen + after);
  field.setSelectionRange(left + before.length, left + before.length + chosen.length);
}

/* Ein Zeichen am Zeilenanfang gilt fuer jede beruehrte Zeile. */
function markupPrefix(field, sign) {
  const value = field.value;
  const from = field.selectionStart ? value.lastIndexOf('\n', field.selectionStart - 1) + 1 : 0;
  let to = value.indexOf('\n', field.selectionEnd);
  if (to < 0) to = value.length;
  const made = value.slice(from, to).split('\n')
    .map((line, i) => (sign === '1. ' ? `${i + 1}. ` : sign) + line).join('\n');
  markupInsert(field, from, to, made);
  field.setSelectionRange(from, from + made.length);
}

/* Die Schalter. Der Schluessel steht buchstaeblich da, damit der Waechter
   ueber die Sprachdatei ihn findet. */
const MARKUP_BUTTONS = [
  { sign: 'B', style: 'mk-b', label: 'entry.markBold', around: ['**', '**'] },
  { sign: 'I', style: 'mk-i', label: 'entry.markItalic', around: ['_', '_'] },
  { sign: '<>', style: 'mk-c', label: 'entry.markCode', around: ['`', '`'] },
  { sign: '„', style: 'mk-q', label: 'entry.markQuote', prefix: '> ' },
  { sign: '•', style: 'mk-l', label: 'entry.markBullet', prefix: '- ' },
  { sign: '1.', style: 'mk-n', label: 'entry.markNumber', prefix: '1. ' },
  { sign: '↗', style: 'mk-a', label: 'entry.markLink', ask: true }
];

let MARKUP_MENU = null, MARKUP_FIELD = null, MARKUP_PICK = null;

function markupMenuBox() {
  if (MARKUP_MENU) return MARKUP_MENU;
  MARKUP_MENU = document.createElement('div');
  MARKUP_MENU.className = 'markup-menu';
  MARKUP_MENU.id = 'markup-menu';
  MARKUP_MENU.hidden = true;
  document.body.appendChild(MARKUP_MENU);
  return MARKUP_MENU;
}

const markupButton = (sign, style, label) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = style;
  button.textContent = sign;
  button.title = label;
  return button;
};

/* Die Frage nach Adresse oder Name. Ist eine Adresse markiert, fehlt der
   Name; sonst fehlt die Adresse. */
function markupAskLink(field) {
  const from = field.selectionStart, to = field.selectionEnd;
  const chosen = field.value.slice(from, to);
  const isAddress = MARKUP_TARGET.test(chosen.trim());
  const row = document.createElement('div');
  row.className = 'markup-ask';
  const input = document.createElement('input');
  input.className = 'input';
  input.placeholder = isAddress ? t('entry.markLinkName') : t('entry.markLinkTarget');
  const take = markupButton('✓', 'mk-ok', t('card.apply'));
  row.appendChild(input);
  row.appendChild(take);
  markupMenuBox().appendChild(row);
  input.focus();
  const done = () => {
    const given = input.value.trim();
    row.remove();
    if (!given) { field.focus(); return; }
    const name = isAddress ? given : (chosen || given);
    const target = isAddress ? chosen.trim() : given;
    markupInsert(field, from, to, `[${name}](${target})`);
  };
  take.onclick = done;
  input.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); done(); }
    if (e.key === 'Escape') { e.preventDefault(); row.remove(); field.focus(); }
  };
}

/* Im Schreibmodus stehen alle Schalter da; im Lesemodus die zwei, die an
   einer Auswahl etwas tun koennen. */
function markupMenuFill(field) {
  const box = markupMenuBox();
  box.replaceChildren();
  if (field) {
    for (const item of MARKUP_BUTTONS) {
      const button = markupButton(item.sign, item.style, t(item.label));
      button.onmousedown = (e) => e.preventDefault();
      button.onclick = () => {
        if (item.around) return markupAround(field, item.around[0], item.around[1]);
        if (item.prefix) return markupPrefix(field, item.prefix);
        markupAskLink(field);
      };
      box.appendChild(button);
    }
    return;
  }
  /* ERST DAS MENUE WEG, DANN ZITIEREN: das Zitat setzt den Fokus in das
     Schreibfeld, und das Menue gehoert dann dorthin. */
  const cite = markupButton('„', 'mk-q', t('entry.quoteSelection'));
  cite.onmousedown = (e) => e.preventDefault();
  cite.onclick = () => { const pick = MARKUP_PICK; markupMenuHide();
    if (pick) quoteInto(pick.text, pick.author, pick.when); };
  const copy = markupButton('⧉', 'mk-cp', t('card.copy'));
  copy.onmousedown = (e) => e.preventDefault();
  copy.onclick = () => { const pick = MARKUP_PICK; markupMenuHide();
    if (pick) copyText(pick.text); };
  box.appendChild(cite);
  box.appendChild(copy);
}

const markupMenuHide = () => { markupMenuBox().hidden = true; MARKUP_PICK = null; };

/* Ein Feld, das die Ansicht inzwischen weggezeichnet hat, haelt das Menue
   nicht laenger offen -- beim Entfernen kommt kein `focusout`. */
function markupLive() {
  if (MARKUP_FIELD && !MARKUP_FIELD.isConnected) { MARKUP_FIELD = null; markupMenuHide(); }
  return MARKUP_FIELD;
}

/* Ueber der Kante der Auswahl, und auf einem schmalen Bildschirm nicht aus
   dem Bild heraus. */
function markupMenuPlace(box) {
  const width = box.offsetWidth, height = box.offsetHeight;
  const left = Math.max(8, Math.min(box.dataset.left * 1, window.innerWidth - width - 8));
  const above = box.dataset.top * 1 - height - 6;
  box.style.left = (left + window.scrollX) + 'px';
  box.style.top = ((above < 4 ? box.dataset.bottom * 1 + 6 : above) + window.scrollY) + 'px';
}

function markupMenuShow(rect) {
  const box = markupMenuBox();
  // An einer Auswahl steht das Menue absolut im Dokument.
  if (box.parentElement !== document.body) document.body.appendChild(box);
  box.classList.remove('docked');
  box.dataset.left = rect.left;
  box.dataset.top = rect.top;
  box.dataset.bottom = rect.bottom;
  box.hidden = false;
  markupMenuPlace(box);
}

/* Die Hoehe der festen Kopfzeile: darunter haelt die angedockte Leiste an. */
const mastheadHeight = () => document.querySelector('.masthead')?.offsetHeight || 0;

/* Im Schreibmodus steht die Leiste im Fluss direkt ueber dem Feld, in dessen
   Behaelter `.markup-wrap`. `position: sticky` laesst sie beim Scrollen bis
   zum Ende des Behaelters mitlaufen; die Knoepfe darunter bleiben frei. */
function markupMenuDock(field) {
  const wrap = field.closest('.markup-wrap');
  if (!wrap) return markupMenuShow(field.getBoundingClientRect());
  const box = markupMenuBox();
  if (box.nextElementSibling !== field) wrap.insertBefore(box, field);
  box.classList.add('docked');
  box.style.left = '';
  box.style.top = mastheadHeight() + 'px';
  box.hidden = false;
}
const markupDocked = () => markupMenuBox().classList.contains('docked');

/* Welches Feld das Menue traegt, steht am Feld und nicht in einer Liste
   daneben. */
const markupField = (node) => node && node.tagName === 'TEXTAREA'
  && node.dataset && node.dataset.markup !== undefined ? node : null;

/* Was im Lesemodus markiert ist -- und ob es ueberhaupt in einem Text
   liegt, der Auszeichnung traegt. */
function markupPickFrom(selection) {
  if (!selection || selection.isCollapsed) return null;
  const at = selection.anchorNode;
  const box = at && (at.nodeType === Node.ELEMENT_NODE ? at : at.parentElement);
  const body = box && box.closest && box.closest('.cmt-body, .desc-view');
  if (!body) return null;
  const text = String(selection).trim();
  if (!text) return null;
  const card = body.closest('.cmt');
  return { text, author: card ? card.dataset.author || '' : '',
           when: card ? card.dataset.when || '' : '',
           rect: selection.getRangeAt(0).getBoundingClientRect() };
}

/* Die Horcher werden EINMAL gesetzt und nicht je Zeichnung -- sonst liefen
   nach zehn geoeffneten Eintraegen dreissig. */
let MARKUP_WIRED = false;
function markupMenuSetUp() {
  if (MARKUP_WIRED) return;
  MARKUP_WIRED = true;
  document.addEventListener('focusin', (e) => {
    const field = markupField(e.target);
    if (!field) return;
    MARKUP_FIELD = field;
    markupMenuFill(field);
    markupMenuDock(field);
  });
  document.addEventListener('focusout', (e) => {
    if (!MARKUP_FIELD || e.target !== MARKUP_FIELD) return;
    if (e.relatedTarget && e.relatedTarget.closest('.markup-menu')) return;
    MARKUP_FIELD = null;
    markupMenuHide();
  });
  /* IM LESEMODUS GIBT ES KEINEN FOKUS UND DAMIT KEINE KANTE: dort erscheint
     das Menue an der Auswahl. */
  document.addEventListener('selectionchange', () => {
    if (markupLive()) return;
    const pick = markupPickFrom(document.getSelection());
    if (!pick) { markupMenuHide(); return; }
    MARKUP_PICK = pick;
    markupMenuFill(null);
    markupMenuShow(pick.rect);
  });
  // Angedockt folgt die Leiste dem Scrollen von selbst; nur ein Feld ohne Behaelter wird nachgesetzt.
  window.addEventListener('scroll', () => {
    if (markupLive() && !markupDocked()) markupMenuShow(MARKUP_FIELD.getBoundingClientRect());
  }, true);
  window.addEventListener('resize', () => {
    if (markupLive()) markupMenuDock(MARKUP_FIELD);
  });
  /* Strg+B und Strg+I -- ueberall sonst steht dasselbe auf denselben
     Tasten. */
  document.addEventListener('keydown', (e) => {
    const field = markupField(e.target);
    if (!field || !(e.ctrlKey || e.metaKey)) return;
    const low = String(e.key).toLowerCase();
    if (low !== 'b' && low !== 'i') return;
    e.preventDefault();
    markupAround(field, low === 'b' ? '**' : '_', low === 'b' ? '**' : '_');
  });
}

/* ---- Zitieren ---- */

/* Zitiert wird in das Feld und nicht ueber die Zwischenablage: ohne sie
   bliebe der Ruf still. */
function quoteInto(text, author, when) {
  const field = document.getElementById('ctext');
  if (!field) return;
  const head = author || when ? t('entry.quoteFrom', { author, date: when }) : '';
  const lines = String(text).split('\n');
  const body = (head ? ['> ' + head] : []).concat(lines.map(z => '> ' + z)).join('\n');
  const at = field.value.length;
  const before = field.value && !field.value.endsWith('\n\n') ? '\n\n' : '';
  markupInsert(field, at, at, before + body + '\n\n');
  field.focus();
  field.setSelectionRange(field.value.length, field.value.length);
}

let FONT = 100;
const FONT_LEVELS = [80, 90, 100, 110, 120];
// Es wird genau ein Wert gesetzt: das Grundmass am Wurzelelement. Alle
// Schriftgroessen im Stylesheet haengen als rem daran.
function applyFont() {
  document.documentElement.style.fontSize = (15 * FONT / 100).toFixed(2) + 'px';
}

/* DER BILDSTREIFEN. */
let STRIP = 80;
const STRIP_LEVELS = [60, 80, 100, 120, 150];
function applyTiles() {
  document.documentElement.style.setProperty('--tile-min', STRIP + 'px');
}

/* ================= DAS FARBSCHEMA ================= DREI STUFEN
   HIER, ZWEI IM STILBLATT. */
const THEME_LEVELS = ['light', 'dark', 'device'];
// Schluessel statt Satz (siehe VERWALTUNGSART) -- Modulebene.
const THEME_NAMES = { light: 'card.light', dark: 'card.dark', device: 'card.likeDevice' };
const DEVICE_LIGHT = '(prefers-color-scheme: light)';
/* DER GEMERKTE WERT IST KEINE ZWEITE WAHRHEIT, SONDERN DAS GEDAECHTNIS DER
   LETZTEN. */
/* DER SCHLUESSEL IM BROWSERSPEICHER, und der alte wird noch gelesen. */
const THEME_KEY = 'kriterion.theme';
const THEME_KEY_0240 = 'kriterion.thema';
let THEME = (() => {
  try {
    const remembered = localStorage.getItem(THEME_KEY) || localStorage.getItem(THEME_KEY_0240);
    return THEME_LEVELS.includes(remembered) ? remembered : 'dark';
  } catch (e) { return 'dark'; }
})();
const effectiveTheme = () => THEME === 'device'
  ? (window.matchMedia && window.matchMedia(DEVICE_LIGHT).matches ? 'light' : 'dark')
  : (THEME === 'light' ? 'light' : 'dark');
/* DIE FARBE DER BROWSERLEISTE WIRD GELESEN UND NICHT ABGESCHRIEBEN. */
function applyTheme() {
  const effective = effectiveTheme();
  document.documentElement.dataset.theme = effective;
  const metaBar = document.querySelector('meta[name="theme-color"]');
  if (metaBar) {
    const reason = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (reason) metaBar.setAttribute('content', reason);
  }
  try { localStorage.setItem(THEME_KEY, THEME); } catch (e) { /* privates Fenster */ }
}
/* SOFORT UND NICHT ERST NACH DEM ABRUF: der Achtzeiler im Kopf setzt
   `data-theme`, aber er kann die Leistenfarbe nicht kennen -- das Stilblatt
   gibt es dort noch nicht. */
applyTheme();
/* UND WER „wie das Geraet" gewaehlt hat, folgt ihm OHNE NEULADEN. */
if (window.matchMedia) {
  const mq = window.matchMedia(DEVICE_LIGHT);
  const follow = () => { if (THEME === 'device') applyTheme(); };
  if (mq.addEventListener) mq.addEventListener('change', follow);
  else if (mq.addListener) mq.addListener(follow);
}

/* DER SCHMALE SCHIRM, ALS FRAGE AN DEN BROWSER. */
const NARROW = '(max-width: 700px), (max-height: 500px) and (max-width: 960px)';
const isNarrow = () => !!(window.matchMedia && window.matchMedia(NARROW).matches);

/* ================= Zustand ================= */
/* DIE VORGABESTELLUNG DER FILTER STEHT GENAU EINMAL -- sonst laufen die
   Abschriften auseinander, sobald jemand einen Filter ergaenzt. */
/* "Ohne Kategorie" ist ein WERT DIESER LISTE und kein Sonderfall daneben --
   deshalb steht er in derselben Auswahl wie jede Kategorie und laesst sich
   mit ihnen zusammen anklicken. */
const CATEGORY_NONE = 'ohne';
/* EINE LISTE UND KEINE EINZELNE NUMMER. */
/* `neu` STEHT HIER NICHT MEHR. Die Pille „Neu seit ..." ist
   gestrichen; ihre Auskunft traegt die Glocke. */
const FILTER_DEFAULT = { categoryIds: [], tagIds: [], tagMode: 'and', tested: 'all',
                         rejected: 'all', favorite: false,
                         sort: 'updated_desc' };

/* ========== DIE SORTIERUNG GAB DEN STATUS VOR ============================
   AUSGEBAUT auf Entscheidung des Betreibers: der Weg ist eine Sackgasse. */
const statusEffective = (f) => f.tested;

const state = {
  items: [], categories: [], tags: [], criteria: [],
  filters: { ...FILTER_DEFAULT },
  search: '', compare: new Set(),
  /* SUCHT DER SERVER, und daraus folgen vier Felder. `all` ist der
     ungefilterte Bestand aus dem letzten loadAll(). */
  all: [], inventory: 0, searchRunning: false, searchError: false,
};

// Die Einstellungen werden einmal beim Start geholt -- auch beim Direkteinstieg
// auf einen Eintrag oder den Systembereich, wo loadAll() gar nicht laeuft.
let SETTINGS = null;

// Abgeleitet, nicht eingestellt.
let USER_COUNT = 1;
let ADMIN = true;
let OWNER = true;
// Der eigene Name in der Kopfzeile.
let NAME = '';
// Die Schwelle steht GENAU HIER und nirgends sonst.
const multipleUsers = () => USER_COUNT > 1;

/* DER BEZUGSPUNKT DER GLOCKE, und der EINZIGE. */
let BELL_SEEN = null;

/* Die beiden Anlegen-Schalter, global und mit Vorgabe an. Der Bildschirm
   haelt sich an dieselbe Regel wie der Server: DER ADMIN KOMMT IMMER DURCH. */
let TAGS_FREE = true;
let CATEGORIES_FREE = true;
/* DER POTENZIALMODUS. AN, solange der Server nichts anderes sagt:
   dieselbe Vorgabe wie am Server, und aus demselben Grund. */
let POTENTIAL_MODE = true;
/* IN WELCHEM VERFAHREN LEGT DIESE INSTANZ ANKOMMENDE PNG AB? Vorgabe wie im
   Server. */
let IMAGE_STORE = 'webp-lossless';
let IMAGE_STORES = ['png', 'webp-lossless', 'webp-lossy'];
/* Ob DIESER Zugang einen zweiten Faktor traegt. */
let TWO_FACTOR = false;
/* Die Frist des Papierkorbs. */
let TRASH_DAYS = 30;
/* DIE GESPEICHERTEN ANSICHTEN. */
let VIEWS = [];
let VIEWS_CAP = 8;
const mayTagCreate = () => ADMIN || TAGS_FREE;
const mayCategoryCreate = () => ADMIN || CATEGORIES_FREE;

async function loadSettings() {
  SETTINGS = await api('GET', '/api/settings');
  if (SETTINGS.userCount) USER_COUNT = SETTINGS.userCount;
  if (SETTINGS.name) NAME = SETTINGS.name;
  if (SETTINGS.isAdmin !== undefined) ADMIN = !!SETTINGS.isAdmin;
  if (SETTINGS.isOwner !== undefined) OWNER = !!SETTINGS.isOwner;
  if (SETTINGS.vocabulary) V = { ...V, ...SETTINGS.vocabulary };
  if (SETTINGS.font) FONT = SETTINGS.font;
  if (SETTINGS.strip) STRIP = SETTINGS.strip;
  if (THEME_LEVELS.includes(SETTINGS.theme)) THEME = SETTINGS.theme;
  takeBlocks(SETTINGS.blocks);
  if (SETTINGS.linkRows) LINK_ROWS = SETTINGS.linkRows;
  if (SETTINGS.timeline !== undefined) TIMELINE_ON = SETTINGS.timeline !== false;
  if (Array.isArray(SETTINGS.views)) VIEWS = SETTINGS.views;
  if (SETTINGS.viewsCap) VIEWS_CAP = SETTINGS.viewsCap;
  // Ausdruecklich nur beim ERSTEN Laden.
  if (SETTINGS.bellSeen) BELL_SEEN = SETTINGS.bellSeen;
  if (Array.isArray(SETTINGS.searchProviders)) SEARCH_PROVIDERS = SETTINGS.searchProviders;
  if (Array.isArray(SETTINGS.languages)) LANGUAGES = SETTINGS.languages;
  // Die vierzehn Woerter JE SPRACHE -- nur die Karte „Vokabular" liest sie.
  if (SETTINGS.vocabularies && typeof SETTINGS.vocabularies === 'object')
    VOCABULARIES = SETTINGS.vocabularies;
  // Und die beiden Tafeln daneben: das Eingetragene und die Vorgaben.
  if (SETTINGS.vocabulariesOwn && typeof SETTINGS.vocabulariesOwn === 'object')
    VOCABULARIES_OWN = SETTINGS.vocabulariesOwn;
  if (SETTINGS.vocabularyDefaults && typeof SETTINGS.vocabularyDefaults === 'object')
    VOCABULARY_DEFAULTS = SETTINGS.vocabularyDefaults;
  /* UND DIE NAMEN JE SPRACHE -- nur die drei Verwaltungskarten lesen sie, und
     nur der Admin bekommt sie ueberhaupt geschickt. */
  takeNames(SETTINGS);
  /* DIE ERSTE DER DREI QUELLEN, und sie schlaegt die beiden
     anderen: was am ZUGANG steht, gilt -- auf jedem Geraet, an dem er sich
     anmeldet. */
  if (typeof SETTINGS.language === 'string' && SETTINGS.language) {
    if (SETTINGS.language !== LANGUAGE) {
      await loadLanguages(SETTINGS.language);
      applyLanguage();
    }
  }
  if (SETTINGS.searchNames) SEARCH_NAMES = SETTINGS.searchNames;
  // Der Server leitet beide beim Lesen ab und liefert sie immer; die Vorgabe
// hier greift nur, wenn die Antwort das Feld gar nicht kennt.
  if (SETTINGS.tagsFreeCreate !== undefined) TAGS_FREE = SETTINGS.tagsFreeCreate !== false;
  if (SETTINGS.categoriesFreeCreate !== undefined)
    CATEGORIES_FREE = SETTINGS.categoriesFreeCreate !== false;
  if (SETTINGS.potentialMode !== undefined)
    POTENTIAL_MODE = SETTINGS.potentialMode !== false;
  if (SETTINGS.imageStore !== undefined) IMAGE_STORE = SETTINGS.imageStore;
  if (Array.isArray(SETTINGS.imageStores) && SETTINGS.imageStores.length)
    IMAGE_STORES = SETTINGS.imageStores;
  if (SETTINGS.trashDays) TRASH_DAYS = SETTINGS.trashDays;
  if (SETTINGS.uploadLimits) UPLOAD_LIMITS = { ...UPLOAD_LIMITS, ...SETTINGS.uploadLimits };
  if (SETTINGS.uploadLimitRanges) UPLOAD_LIMIT_RANGES = SETTINGS.uploadLimitRanges;
  TWO_FACTOR = SETTINGS.twoFactor === true;
  applyFont();
  applyTiles();
  // Berichtigt, was der Achtzeiler im Kopf aus dem Gedaechtnis geraten hat.
  applyTheme();
}

const saveFilters = () => {
  // Die Momentaufnahme mitfuehren.
  if (SETTINGS) SETTINGS.filters = { ...state.filters };
  api('PUT', '/api/settings', { filters: state.filters }).catch(() => {});
};

async function loadAll() {
  const [items, categories, tags, titles] = await Promise.all([
    api('GET', '/api/items'), api('GET', '/api/product-categories'), api('GET', '/api/tags'),
    api('GET', '/api/titles')
  ]);
  /* DER UNGEFILTERTE BESTAND KOMMT HIER UND NUR HIER. `all` ist die Quelle,
     `items` das, was gezeigt wird -- beim Betreten der Uebersicht dasselbe. */
  /* `all` und `items` zeigen hier auf DASSELBE Feld, und das ist gewollt:
     eine Kopie von tausend Objekten waere Arbeit fuer nichts. */
  state.all = items; state.items = items; state.inventory = items.length;
  state.searchError = false;
  state.categories = categories; state.tags = tags;
  TITLE_APP = titles.appTitle; TITLE_PUBLIC = titles.publicTitle;
  document.title = TITLE_APP;
  const settings = SETTINGS;
  if (settings && settings.filters) state.filters = filterNormal(settings.filters);
}

/* EINE GESPEICHERTE FILTERSTELLUNG WIRD BEIM ANWENDEN ZURECHTGERUECKT, nicht
   beim Speichern. */
function filterNormal(raw) {
  const f = { ...FILTER_DEFAULT, ...(raw && typeof raw === 'object' ? raw : {}) };
  f.tagIds = (Array.isArray(f.tagIds) ? f.tagIds : []).filter(id => state.tags.some(tag => tag.id === id));
  /* DIE UEBERSETZUNG DER ALTEN FORM, an genau dieser einen Stelle: frueher
     stand in einer gespeicherten Ansicht EIN Kategoriewert (`categoryId`). */
  if (!Array.isArray(f.categoryIds))
    f.categoryIds = f.categoryId != null ? [f.categoryId] : [];
  else if (f.categoryId != null && !f.categoryIds.length) f.categoryIds = [f.categoryId];
  // Das alte Feld faellt aus der zurechtgerueckten Stellung heraus: sie wird
  // Zeichen fuer Zeichen mit der aktuellen verglichen (welche Ansicht gerade
  // gilt), und ein mitgeschlepptes Feld liesse jede alte Ansicht als "nicht
  // aktiv" erscheinen, obwohl sie genau das zeigt, was sie zeigen soll.
  delete f.categoryId;
  /* NUMMERN, DIE ES NICHT MEHR GIBT, FALLEN WEG -- und der Rest bleibt
     stehen. */
  f.categoryIds = [...new Set(f.categoryIds)].filter(v =>
    v === CATEGORY_NONE || state.categories.some(c => c.id === v));
  if (f.tagMode !== 'or') f.tagMode = 'and';
  f.favorite = f.favorite === true;
  /* DER SCHLUESSEL EINER GESTRICHENEN PILLE FAELLT HERAUS. */
  delete f.fresh;
  return f;
}

/* ================= Die Suche fragt den Server ================= JEDER
   TASTENDRUCK IST EINE ANFRAGE UEBER DAS NETZ. */
const SEARCH_DELAY_MS = 220;
let searchClock = null;
let searchRun = 0;

/* Das Kreuz zum Leeren steht nur da, wenn etwas zu leeren ist. */
function syncSearchBtn() {
  const q = document.getElementById('q'), c = document.getElementById('qclr');
  if (q && c) c.style.display = q.value ? 'block' : 'none';
}

/* Der Begriff wird genau so zugeschnitten wie im Server: aussen getrimmt. */
async function runSearch() {
  const term = state.search.trim();
  const run = ++searchRun;
  if (!term) {
    // Ohne Begriff ist der ganze Bestand die Antwort, und der liegt schon da.
    state.items = state.all;
    state.searchRunning = false; state.searchError = false;
    drawFilters(); drawBody();
    return;
  }
  state.searchRunning = true;
  drawBody();
  try {
    const matched = await api('GET', `/api/items?q=${encodeURIComponent(term)}`);
    if (run !== searchRun) return;          // eine neuere Anfrage ist unterwegs
    state.items = matched;
    state.searchRunning = false; state.searchError = false;
  } catch (e) {
    if (run !== searchRun) return;
    if (e.message === SESSION_GONE) return;   // die Anmeldeseite kommt
// Stehen bleibt, was da ist. Die Zaehlzeile sagt es.
    state.searchRunning = false; state.searchError = true;
  }
  drawFilters(); drawBody();
}

/* ================= Die gespeicherten Ansichten ================= EINE
   ANSICHT IST EINE FILTERSTELLUNG SAMT SUCHBEGRIFF, unter einem Namen. */

// Was gerade eingestellt ist, als Ansicht -- ohne den Namen, der kommt vom
// Menschen.
const viewOutState = () => ({ filters: { ...state.filters }, q: state.search.trim() });

/* GESCHICKT UND DANN ERST UEBERNOMMEN. */
async function sendViews(list) {
  try {
    await api('PUT', '/api/settings', { views: list });
    VIEWS = list;
    if (SETTINGS) SETTINGS.views = list;
    return true;
  } catch (e) { toast(e.message, true); return false; }
}

async function saveView() {
  if (VIEWS.length >= VIEWS_CAP)
    return toast(t('list.viewCapDelete', { viewsCap: VIEWS_CAP }), true);
  const name = await nameBox(t('list.saveViewTitle'),
    t('list.saveViewNote'), '', t('dialog.save'));
  if (!name) return;
  // Derselbe Vergleich wie im Server, und aus demselben Grund: der Name ist
// das Einzige, woran ein Mensch zwei Ansichten auseinanderhaelt.
  if (VIEWS.some(a => a.name.toLocaleLowerCase(compareLocale())
                      === name.toLocaleLowerCase(compareLocale())))
    return toast(t('list.viewExists', { name: name }), true);
  if (await sendViews([...VIEWS, { name, ...viewOutState() }])) {
    toast(t('list.saved'));
    drawFilters();
  }
}

async function viewDelete(name) {
  if (!await confirmBox(t('list.deleteViewAsk'), t('list.removedFromList', { name: name }))) return;
  if (await sendViews(VIEWS.filter(a => a.name !== name))) drawFilters();
}

/* ANGEWANDT WIRD OERTLICH UND SOFORT. */
function applyView(a) {
  state.filters = filterNormal(a.filters);
  /* HIER STAND `STATUS_BY_HAND = true` -- eine gespeicherte Ansicht war eine
     ausdrueckliche Wahl und schlug die Ableitung der Sortierung. */
  state.search = typeof a.q === 'string' ? a.q : '';
  const field = document.getElementById('q');
  if (field) field.value = state.search;
  syncSearchBtn();
  saveFilters();
  if (searchClock) { clearTimeout(searchClock); searchClock = null; }
  runSearch();
}

// Der Debounce. Beim Leeren sofort -- dort ist keine Anfrage im Spiel.
function searchTriggered() {
  if (searchClock) clearTimeout(searchClock);
  if (!state.search.trim()) { searchClock = null; runSearch(); return; }
  searchClock = setTimeout(() => { searchClock = null; runSearch(); }, SEARCH_DELAY_MS);
}

// Fehlender Wert ist nicht Null: Eintraege ohne Testtage stehen bei den
// Testsortierungen immer am Ende, egal in welche Richtung sortiert wird.
function byTest(a, b, field, dir) {
  const av = a[field], bv = b[field];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  return dir === 'desc' ? bv - av : av - bv;
}

// Traegt ein Eintrag die gewaehlten Tags? Getrennt herausgezogen, weil auch
// die Vorschau der Wolke damit rechnet, welche Tags noch Treffer brachten.
function matchesTags(item, tagIds, mode) {
  if (!tagIds.length) return true;
  const ownOnes = new Set((item.tags || []).map(tag => tag.id));
  return mode === 'or'
    ? tagIds.some(id => ownOnes.has(id))
    : tagIds.every(id => ownOnes.has(id));
}

/* Der Parameter ist die Vorschau: die Filterzeile fragt "wie viele blieben
   uebrig, wenn ich DIESEN Umschalter noch druecke" -- dieselbe Frage, die die
   Tagwolke schon fuer ihre gedaempften Tags stellt. */
function visibleItems(filter) {
  const f = filter || state.filters;
  let out = state.items;
  /* EIN ODER UEBER DIE GEWAEHLTEN KATEGORIEN, niemals ein UND: ein Eintrag
     traegt genau eine Kategorie, ein Schnitt waere also immer leer. */
  if (f.categoryIds.length) out = out.filter(i =>
    f.categoryIds.includes(i.category ? i.category.id : CATEGORY_NONE));
  // UND ist die Vorgabe: mit zwei Tags will man fast immer den Schnitt
// ("gruen UND schwer"), nicht die Vereinigung.
  if (f.tagIds.length) out = out.filter(i => matchesTags(i, f.tagIds, f.tagMode));
  /* DIE EINE LESESTELLE DER ABLEITUNG. */
  const status = statusEffective(f);
  if (status === 'tested') out = out.filter(i => i.tested);
  else if (status === 'untested') out = out.filter(i => !i.tested);
  /* DIE ABLEHNUNG IST EIN EIGENES MERKMAL und deshalb eine eigene
     Dreiergruppe -- kein vierter Wert von `tested`. */
  if (f.rejected === 'ja') out = out.filter(i => i.rejected);
  else if (f.rejected === 'nein') out = out.filter(i => !i.rejected);
  // Eigenes Merkmal, eigener Filter -- bewusst NICHT als vierter Wert von
  // `tested`: Favorit und Teststatus sind unabhaengig, und "getestet UND
  // Favorit" muss moeglich bleiben.
  if (f.favorite) out = out.filter(i => i.favorite);
  /* HIER STEHT KEIN FILTER „Neu seit ..." MEHR. */
  /* HIER WIRD NICHT GESUCHT: das macht GET /api/items?q=..., und
     `state.items` traegt bereits nur noch die Treffer. */

  out = [...out].sort((a, b) => {
    // HIER STEHT BEWUSST KEINE Vorsortierung der Favoriten: sie schluege jede
    // eingestellte Sortierung -- ein Favorit ohne Wertung stuende bei
    // "Bewertung hoch nach niedrig" ganz oben.
    switch (f.sort) {
      /* OHNE SPRACHE, UND DAS IST ABSICHT: verglichen werden zwei
         ISO-Zeitstempel („2026-09-05 14:02:11"), also Ziffern. */
      case 'updated_asc': return a.updated_at.localeCompare(b.updated_at);
      case 'rating_desc': return (b.avgRating ?? -1) - (a.avgRating ?? -1);
      case 'rating_asc':  return (a.avgRating ?? 99) - (b.avgRating ?? 99);
      /* SPIEGELBILD DER BEIDEN DARUEBER: -1 in der einen Richtung und 99 in
         der anderen stellen die Eintraege OHNE Zahl in BEIDEN Richtungen
         hinten an. */
      case 'potential_desc': return (b.potentialRating ?? -1) - (a.potentialRating ?? -1);
      case 'potential_asc':  return (a.potentialRating ?? 99) - (b.potentialRating ?? 99);
      case 'title_asc':   return a.title.localeCompare(b.title, LOCALE);
      /* SPIEGELBILD, und die Sprache steht auf BEIDEN Seiten. */
      case 'title_desc':  return b.title.localeCompare(a.title, LOCALE);
      case 'tests_desc':  return byTest(a, b, 'testCount', 'desc');
      case 'tests_asc':   return byTest(a, b, 'testCount', 'asc');
      case 'testavg_desc':return byTest(a, b, 'testAvg', 'desc');
      case 'testavg_asc': return byTest(a, b, 'testAvg', 'asc');
      case 'testlast_desc':return byTest(a, b, 'testLast', 'desc');
      case 'testlast_asc': return byTest(a, b, 'testLast', 'asc');
      default: return b.updated_at.localeCompare(a.updated_at);
    }
  });
  return out;
}

/* ================= Wegweiser ================= */
async function start() {
  document.body.classList.remove('login');
  window.removeEventListener('hashchange', route);
  window.addEventListener('hashchange', route);
  // Die Horcher des Menues stehen einmal und nicht je Zeichnung.
  markupMenuSetUp();
  // Vor dem ersten Aufbau: sonst greift die Schriftgroesse erst nach dem
  // zweiten Klick und der Direkteinstieg auf einen Eintrag zeigt das
  // Vorgabevokabular.
  try { await loadSettings(); }
  catch (e) { if (e.message === SESSION_GONE) return; }
  route();
}
/* Welche Ansicht zuletzt stand -- gebraucht wird das fuer genau eine Frage:
   ob die Uebersicht gerade VERLASSEN wird. */
let LAST_VIEW = null;
/* DER MERKZEITPUNKT WIRD BEIM VERLASSEN GESETZT, NICHT BEIM BETRETEN. */
/* DER BEZUGSPUNKT DER GLOCKE ENTSTEHT BEIM ERSTEN VERLASSEN DER UEBERSICHT. */
const rememberSeen = () => {
  if (BELL_SEEN) return;
  BELL_SEEN = true;
  api('PUT', '/api/settings', { bellSeen: 1 }).catch(() => {});
};
/* ================= Der Suchbegriff in der Adresse ======================
   Frueher lebte der Begriff nur in state.search. */
const ENTRY_PATTERN = /^#\/item\/(\d+)(?:\?(.*))?$/;
/* Beide Namen stehen ausgeschrieben da, und zwar an ihrem Zeichen: der
   Waechter ueber die Abfrageparameter liest sie so. */
const entryAddress = (id, term, comment) => `#/item/${id}`
  + (term ? `?q=${encodeURIComponent(term)}` : '')
  + (!comment ? '' : term ? `&c=${Number(comment)}` : `?c=${Number(comment)}`);
const termOutAddress = (askKey) => {
  try { return new URLSearchParams(askKey || '').get('q') || ''; }
  catch { return ''; }
};
/* Die Adresse des Browsers traegt den Kommentar als Zahl und nicht seine
   Stellung: die Stellung wird beim Zeichnen ermittelt. */
const commentOutAddress = (askKey) => {
  try { return Number(new URLSearchParams(askKey || '').get('c')) || 0; }
  catch { return 0; }
};
/* Vollstaendig, damit der Verweis auch in einer Mail funktioniert. */
const commentAddress = (id, comment) =>
  location.origin + location.pathname + entryAddress(id, '', comment);

/* JEDE ALTE ADRESSE WIRD UEBERSETZT UND NICHT FALLEN GELASSEN. */
const OLD_ADDRESSES = { '#/offen': '#/open' };
const OLD_ADDRESS_ROOTS = { '#/einladung/': '#/invite/', '#/bestaetigung/': '#/confirm/' };
function translateAddress() {
  const h = location.hash || '';
  let fresh = OLD_ADDRESSES[h] || '';
  if (!fresh) for (const [old, now] of Object.entries(OLD_ADDRESS_ROOTS))
    if (h.startsWith(old)) { fresh = now + h.slice(old.length); break; }
  if (!fresh || fresh === h) return false;
  history.replaceState(null, '', fresh);
  return true;
}

function route() {
  translateAddress();
  const h = location.hash || '#/';
  // Die alte Ansicht ist gleich fort; ihre Wolke darf niemand mehr zeichnen.
  redrawCloud = null;
  const m = h.match(ENTRY_PATTERN);
  /* DER SYSTEMBEREICH HAT FUENF ADRESSEN STATT EINER --
     `#/system` und `#/system/<abschnitt>`. */
  const view = SYS_PATTERN.test(h) ? 'system' : h === '#/compare' ? 'compare'
    : h === '#/open' ? 'open' : m ? 'entry' : 'list';
  if (LAST_VIEW === 'list' && view !== 'list') rememberSeen();
  LAST_VIEW = view;
  if (view === 'system') return renderSystem();
  if (view === 'compare') return renderCompare();
  if (view === 'open') return renderOpen();
  if (m) return renderDetail(+m[1], termOutAddress(m[2]), commentOutAddress(m[2]));
  return renderList();
}

/* ================= Die Glocke und der Zähler „Offen" ================= BEIDE
   ZAHLEN KOMMEN AUS DER LISTE, DIE DIE UEBERSICHT OHNEHIN HOLT. */
/* DIE SUMME ENTSTEHT AN GENAU EINER STELLE. */
const freshCount = (i) => (Number(i.newComments) || 0) + (Number(i.newRatings) || 0);
const bellNew = () => (state.all || []).reduce((n, i) => n + freshCount(i), 0);
/* WIE VIELE DAVON MICH MARKIEREN. */
const markedCount = (i) => Number(i.newMarked) || 0;

/* WOHER EINE MELDUNG KOMMT -- die drei Herkuenfte der Tafel. */
const bellOrigin = (i) =>
  markedCount(i) ? 'marked' : (i.mine ? 'mine' : 'other');
const openTotal = () => (state.all || []).reduce((n, i) => n + (Number(i.openTasks) || 0), 0);

/* WAS DORT NEU IST -- in der Zeile mit Zeichen, im Ueberfahrtext mit Worten.
   Dieselbe Trennung wie in commentNumbers(): die Zeile mass in drei Sprachen
   36, 33 und 30 Zeichen und drueckte den Titel zusammen. */
const newWords = (i) => {
  const k = Number(i.newComments) || 0, b = Number(i.newRatings) || 0;
  /* DIE MARKIERUNG STEHT ALS ZEICHEN DANEBEN UND NICHT MEHR IM SATZ. */
  const marked = markedCount(i);
  const comments = k ? t('list.commentCount', { n: k }) : '';
  const markedWords = marked ? t('list.markedCount', { n: marked }) : '';
  return {
    html: [comments ? esc(comments) : '',
           marked ? countMark('marked', '@', marked) : '',
           b ? countMark('rating', '★', b) : ''].filter(Boolean).join(' · '),
    text: [comments, markedWords, b ? `${b} ${vRating(b)}` : ''].filter(Boolean).join(' · ')
  };
};

/* VON WEM. */
const newFromWords = (i) => {
  const names = (Array.isArray(i.newFrom) ? i.newFrom : [])
    .map(authorName).sort((a, b) => String(a).localeCompare(String(b), LOCALE));
  if (!names.length) return '';
  const last = names[names.length - 1], first = names.slice(0, -1).join(', ');
  return t('list.byNames',
    { names: first ? t('list.namesAndLast', { first: first, last: last }) : last });
};

function drawHeadCounts() {
  const open = openTotal();
  /* KEINE NULL AM KNOPF. */
  atElement('open-count', el => {
    el.textContent = open ? String(open) : '';
    el.hidden = !open;
  });
  atElement('open', b => b.title = open
    ? `${open} ${vTask(open)} offen`
    : t('list.openTasks'));
  const fresh = bellNew();
  /* EINE ZAHL IM TITEL, EIN PUNKT AM KNOPF. */
  atElement('bell-dot', el => { el.hidden = !fresh; });
  atElement('bell', b => b.title = fresh
    ? t('list.newsFromOthers', { n: fresh })
    : t('list.noNews'));
}

/* DIE TAFEL. Sie ist die zweite Haelfte der Glocke und nicht ihr Beiwerk:
   eine Meldung, die man nicht anspringen kann, ist eine Mitteilung ohne Weg. */
/* DIE DREI ABSCHNITTE DER TAFEL, F3. */
const BELL_SECTIONS = [['marked', 'list.bellToMe'], ['mine', 'list.bellMine'],
                       ['other', 'list.bellOther']];

function showBellPanel() {
  /* SORTIERT NACH DER SUMME und nicht nach einem der beiden Teile: ein Eintrag
     mit vier neuen Bewertungen stuende sonst unter einem mit einem Kommentar. */
  const rows = (state.all || []).filter(i => freshCount(i) > 0)
    .slice().sort((a, b) => (freshCount(b) - freshCount(a)) || String(a.title).localeCompare(String(b.title), LOCALE));
  const bd = document.createElement('div');
  bd.className = 'backdrop';
  bd.innerHTML = `<div class="modal bell-panel" id="bell-modal"><h2>${tH('list.news')}</h2>
    <p>${tH('list.newCommentsHint')}</p>
    <div class="manage-list" id="bell-list"></div>
    <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('list.close')}</button></div></div>`;
  document.body.appendChild(bd);
  const zu = () => { bd.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = e => {
    if (e.key !== 'Escape') return;
    if ([...document.querySelectorAll('.backdrop')].pop() !== bd) return;
    zu();
  };
  document.addEventListener('keydown', onKey, true);
  bd.querySelector('[data-no]').onclick = zu;
  bd.onclick = e => { if (e.target === bd) zu(); };

  const box = bd.querySelector('#bell-list');
  if (!rows.length) {
    box.innerHTML = `<span class="hint">${tH('list.noNewsDot')}</span>`;
  } else for (const [origin, headKey] of BELL_SECTIONS) {
    const part = rows.filter(i => bellOrigin(i) === origin);
    if (!part.length) continue;
    const head = document.createElement('div');
    head.className = 'bell-head';
    head.dataset.origin = origin;
    head.textContent = t(headKey);
    box.appendChild(head);
    for (const it of part) {
      /* EIN LINK UND KEIN KNOPF: er traegt eine Adresse, laesst sich kopieren
         und in einem neuen Fenster oeffnen. */
      const a = document.createElement('a');
      a.className = 'mrow bell-row';
      a.href = `#/item/${it.id}`;
      a.dataset.mid = String(it.id);
      /* DREI STUECKE: der Titel, WAS dort neu ist, und VON WEM. */
      a.innerHTML = `<span class="mname"></span><span class="mcount"></span>
        <span class="bell-from"></span>`;
      a.querySelector('.mname').textContent = it.title;
      /* HTML UND NICHT TEXT -- newWords() traegt die Zeichen; der lange
         Wortlaut steht im Ueberfahrtext. */
      const counts = newWords(it);
      a.querySelector('.mcount').innerHTML = counts.html;
      a.querySelector('.mcount').title = counts.text;
      a.querySelector('.bell-from').textContent = newFromWords(it);
      a.onclick = () => zu();
      box.appendChild(a);
    }
  }

  /* DER STRICH WIRD BEIM OEFFNEN NACHGEZOGEN, nicht beim Schliessen: wer die
     Tafel gesehen hat, hat sie gesehen. */
  api('PUT', '/api/settings', { bellSeen: 1 }).catch(() => {});
  /* NUR WAS DASTEHT, WIRD ZURUECKGESETZT -- und nichts angelegt. */
  for (const it of (state.all || [])) {
    if (it.newComments) it.newComments = 0;
    if (it.newRatings) it.newRatings = 0;
    if (it.newFrom) it.newFrom = [];
    // Die vierte Angabe geht mit den drei anderen.
    if (it.newMarked) it.newMarked = 0;
  }
  drawHeadCounts();
}

/* ================= Die gemeinsame Kopfzeile der Unteransichten ===========
   Vier Ansichten trugen `<a href="#/" class="back">` fuenfmal im Quelltext.
   Sie steht jetzt einmal. */

/* DIE NACHBARN IN DER REIHENFOLGE DER UEBERSICHT, F2. */
const entryNeighbours = (id) => {
  const list = state.items || [];
  const at = list.findIndex(x => x && x.id === id);
  /* UND ES GIBT KEIN FELD `ordered` DANEBEN, obwohl es sich anbote: „keine
     Reihenfolge" und „am Rand der Reihenfolge" sehen beide genau so aus, wie
     sie aussehen sollen -- zwei gedaempfte Pfeile beziehungsweise einer. */
  if (at < 0) return { prev: null, next: null };
  return {
    prev: at > 0 ? list[at - 1].id : null,
    next: at < list.length - 1 ? list[at + 1].id : null
  };
};

/* DIE ZWEI KNOEPFE AM FUSS DES EINTRAGS -- kurz auf dem Knopf, vollstaendig
   im Titel: als Beschriftung lief der zweite am Telefon aus dem Schirm. */
function entryNav(id) {
  const nb = entryNeighbours(id);
  const stepBtn = (target, word, hint, cls, arrow) =>
    `<button class="btn btn-sm step ${cls}" data-step="${target == null ? '' : Number(target)}"
      ${target == null ? 'disabled' : ''} title="${esc(t(hint))}">${arrow === 'before'
        ? `<span class="step-arrow">\u2039</span> ${tH(word)}`
        : `${tH(word)} <span class="step-arrow">\u203a</span>`}</button>`;
  return `<div class="entry-nav">
    ${stepBtn(nb.prev, 'list.prevInList', 'list.prevHint', 'step-prev', 'before')}
    ${stepBtn(nb.next, 'list.nextInList', 'list.nextHint', 'step-next', 'after')}
  </div>`;
}

/* Der Aufbau. DIE BLAETTERPFEILE STANDEN HIER, links und rechts von der
   Marke -- und genau das war der Fehler. */
function subhead({ searchBox = true } = {}) {
  return `<div class="masthead subhead">
    <a href="#/" class="icon-btn sub-back" title="${esc(t('list.backToList'))}"
      aria-label="${esc(t('list.backToList'))}">${ICON_BACK_OUT}</a>
    <div class="brand">
      ${MARK(32)}
      <div><h1>${esc(TITLE_APP)}</h1></div>
    </div>
    ${/* DAS FELD IST EINE TUER UND KEIN ZWEITER SUCHER. Gesucht wird in der
         Uebersicht, weil dort der Bestand steht; hier ist der Weg dorthin. */''}
    ${searchBox ? `<div class="search-box">
      <span class="ic">${ICON_SEARCH}</span>
      <input class="input" id="sub-q" placeholder="${esc(t('list.searching'))}"
        value="${esc(state.search)}">
    </div>` : ''}
    <div class="mast-rest" id="mast-rest">
      <button class="icon-btn" id="open" title="${esc(t('list.openTasks'))}">${ICON_OPEN}<span class="open-count" id="open-count" hidden></span><span class="mast-word">${tH('list.openTasks')}</span></button>
      <button class="icon-btn" id="sys" title="${esc(t('list.settings'))}">${ICON_SYS}<span class="mast-word">${tH('list.settings')}</span></button>
      <span class="hint who" id="who">${tH('list.signedInAs', { name: NAME })}</span>
      <button class="btn btn-ghost btn-sm" id="out">${tH('list.signOut')}</button>
    </div>
    <button class="icon-btn mast-menu" id="menu" aria-expanded="false"
      aria-controls="mast-rest" aria-label="${esc(t('list.openMenu'))}" title="${esc(t('list.menu'))}">${ICON_MENU}</button>
  </div>`;
}

/* Die Zusagen dazu. */
function wireSubhead({ term = '' } = {}) {
  atElement('open', b => b.onclick = () => { location.hash = '#/open'; });
  atElement('sys', b => b.onclick = () => { location.hash = '#/system'; });
  atElement('out', b => b.onclick = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    showLogin();
  });
  drawHeadCounts();

  /* DER SCHATTEN BEIM ROLLEN -- dieselbe Zeile wie in der Uebersicht und aus
     demselben Grund: die Kopfzeile klebt oben, und dass unter ihr etwas
     liegt, sagt ab acht Bildpunkten der Schatten. */
  const scrollGuard = () =>
    document.querySelector('.masthead')?.classList.toggle('scrolled', (window.scrollY || 0) > 8);
  window.addEventListener('scroll', scrollGuard, { passive: true });
  scrollGuard();

  const menu = document.getElementById('menu');
  const panel = document.getElementById('mast-rest');
  const menuPlaces = (on) => {
    panel.classList.toggle('open', on);
    menu.setAttribute('aria-expanded', on ? 'true' : 'false');
    menu.setAttribute('aria-label', on ? t('list.closeMenu') : t('list.openMenu'));
  };
  menu.onclick = () => menuPlaces(!panel.classList.contains('open'));
  const menuOutside = (e) => {
    if (e.target.closest('#menu') || e.target.closest('#mast-rest')) return;
    menuPlaces(false);
  };
  const menuKey = (e) => { if (e.key === 'Escape') menuPlaces(false); };
  document.addEventListener('click', menuOutside);
  document.addEventListener('keydown', menuKey);

  /* DIE TUER ZUR SUCHE. */
  atElement('sub-q', sq => {
    const over = () => { SEARCH_HANDOFF = true; location.hash = '#/'; };
    sq.addEventListener('pointerdown', (e) => { e.preventDefault(); over(); });
    sq.oninput = () => { state.search = sq.value; over(); };
  });

  window.addEventListener('hashchange', () => {
    document.removeEventListener('click', menuOutside);
    document.removeEventListener('keydown', menuKey);
    window.removeEventListener('scroll', scrollGuard);
  }, { once: true });
}

/* Gesetzt von der Tuer oben, gelesen und geleert von der Uebersicht. Eine
   Marke und keine Einstellung: sie gilt fuer genau einen Sprung. */
let SEARCH_HANDOFF = false;

/* ================= Übersicht ================= */
async function renderList() {
  /* NICHT LEEREN, BEVOR ERSATZ DA IST. */
  if (!app.firstElementChild)
    app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">${tH('list.loading')}</p></div>`;
  try { await loadAll(); }
  catch (e) { if (e.message !== SESSION_GONE) app.innerHTML = `<div class="shell"><p class="hint">${esc(e.message)}</p></div>`; return; }

  app.innerHTML = `<div class="shell">
    <div class="masthead">
      <div class="brand">${MARK(32)}
        <div><h1>${esc(TITLE_APP)}</h1><div class="count" id="count"></div></div></div>
      <div class="search-box">
        <span class="ic">${ICON_SEARCH}</span>
        <input class="input" id="q" placeholder="${esc(t('list.searching'))}" value="${esc(state.search)}">
        <button class="clr" id="qclr" title="${esc(t('list.clearSearch'))}" style="display:none">${ICON_X}</button>
      </div>
      ${/* DIE VIER, DIE AUF DEM TELEFON HINTER DAS ZEICHEN WANDERN, stehen in
           einem eigenen Behaelter -- und sie stehen dort AUCH auf dem breiten
           Schirm. */''}
      <div class="mast-rest" id="mast-rest">
        ${/* DIE GLOCKE STEHT IN DEMSELBEN BEHAELTER wie die beiden anderen
             Zeichenknoepfe: ein Markup, zwei Gestalten. */''}
        ${BELL_SEEN ? `<button class="icon-btn bell" id="bell" title="${esc(t('list.news'))}"
          aria-label="${esc(t('list.news'))}">${ICON_BELL}<span class="bell-dot" id="bell-dot" hidden></span><span class="mast-word">${tH('list.news')}</span></button>` : ''}
        <button class="icon-btn" id="open" title="${esc(t('list.openTasks'))}">${ICON_OPEN}<span class="open-count" id="open-count" hidden></span><span class="mast-word">${tH('list.openTasks')}</span></button>
        <button class="icon-btn" id="sys" title="${esc(t('list.settings'))}">${ICON_SYS}<span class="mast-word">${tH('list.settings')}</span></button>
        <span class="hint who" id="who">${tH('list.signedInAs', { name: NAME })}</span>
        <button class="btn btn-ghost btn-sm" id="out">${tH('list.signOut')}</button>
      </div>
      <button class="btn btn-accent" id="new">+ ${esc(V.entryOne)}</button>
      ${/* Das Zeichen steht IM Markup hinter dem Anlegen-Knopf, damit es auf
           dem Telefon rechts aussen sitzt -- dort, wo ein Menuezeichen
           hingehoert. */''}
      <button class="icon-btn mast-menu" id="menu" aria-expanded="false"
        aria-controls="mast-rest" aria-label="${esc(t('list.openMenu'))}" title="${esc(t('list.menu'))}">${ICON_MENU}</button>
    </div>
    ${/* Nur auf dem schmalen Schirm sichtbar. */''}
    <button class="btn btn-sm filter-toggle" id="filter-toggle"
      aria-expanded="true" aria-controls="filters">${tH('list.filter')}<span class="fcount" id="filter-count"></span></button>
    <div class="filters" id="filters"></div>
    <div id="timeline"></div>
    <div id="body"></div>
  </div>`;

  document.getElementById('new').onclick = openCreate;
  document.getElementById('open').onclick = () => { location.hash = '#/open'; };
  atElement('bell', b => b.onclick = showBellPanel);
  drawHeadCounts();
  document.getElementById('sys').onclick = () => { location.hash = '#/system'; };
  /* DER SCHATTEN DER KOPFZEILE BEIM ROLLEN. */
  const scrollGuard = () =>
    document.querySelector('.masthead')?.classList.toggle('scrolled', (window.scrollY || 0) > 8);
  window.addEventListener('scroll', scrollGuard, { passive: true });
  scrollGuard();
  document.getElementById('out').onclick = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    showLogin();
  };
  const q = document.getElementById('q'), qclr = document.getElementById('qclr');
  // Getippt wird oertlich, gesucht ueber den Debounce. Das Leeren geht ohne
// Anfrage durch -- der ungefilterte Bestand liegt in state.alle.
  q.oninput = () => { state.search = q.value; syncSearchBtn(); searchTriggered(); };
  qclr.onclick = () => { q.value = ''; state.search = ''; syncSearchBtn(); searchTriggered(); q.focus(); };
  syncSearchBtn();

  /* ---- Die Tafel hinter dem Menuezeichen ---- Sie wird ueber EINE Klasse
     geoeffnet und geschlossen; ob sie ueberhaupt eine Tafel ist oder als vier
     Knoepfe in der Kopfzeile steht, entscheidet allein das Stylesheet. */
  const menu = document.getElementById('menu');
  const panel = document.getElementById('mast-rest');
  const menuPlaces = (on) => {
    panel.classList.toggle('open', on);
    menu.setAttribute('aria-expanded', on ? 'true' : 'false');
    menu.setAttribute('aria-label', on ? t('list.closeMenu') : t('list.openMenu'));
  };
  menu.onclick = () => menuPlaces(!panel.classList.contains('open'));

  /* EIN KLICK DANEBEN SCHLIESST, UND ESCAPE AUCH. */
  const menuOutside = (e) => {
    if (e.target.closest('#menu') || e.target.closest('#mast-rest')) return;
    menuPlaces(false);
  };
  const menuKey = (e) => { if (e.key === 'Escape') menuPlaces(false); };
  document.addEventListener('click', menuOutside);
  document.addEventListener('keydown', menuKey);

  /* ---- Der Schalter ueber den Filtern ---- AUF DEM SCHMALEN SCHIRM FANGEN
     DIE FILTER EINGEKLAPPT AN. */
  const filterBox = document.getElementById('filters');
  if (isNarrow()) filterBox.classList.add('closed');
  document.getElementById('filter-toggle').onclick = () => {
    const wasClosed = filterBox.classList.contains('closed');
    filterBox.classList.toggle('closed');
    /* BEIM AUFKLAPPEN WIRD NEU GEZEICHNET, beim Einklappen nicht. */
    if (wasClosed) drawFilters();
    else drawFilterSwitch();
  };

  // "/" springt in die Suche
  document.addEventListener('keydown', listKeys);
  window.addEventListener('hashchange', () => {
    document.removeEventListener('keydown', listKeys);
    document.removeEventListener('click', menuOutside);
    document.removeEventListener('keydown', menuKey);
    window.removeEventListener('scroll', scrollGuard);
  }, { once: true });

  /* DER SCHREIBSTRICH KOMMT AUS DER UNTERANSICHT MIT. */
  if (SEARCH_HANDOFF) {
    SEARCH_HANDOFF = false;
    atElement('q', el => { el.focus(); el.setSelectionRange(el.value.length, el.value.length); });
  }

  drawFilters(); drawBody();
  /* STAND SCHON EIN BEGRIFF IM FELD, wird er jetzt gefragt. */
  if (state.search.trim()) runSearch();
}

function listKeys(e) {
  const mark = document.activeElement?.tagName;
  if (mark === 'INPUT' || mark === 'TEXTAREA' || mark === 'SELECT') return;
  if (document.querySelector('.backdrop')) return;
  if (e.key === '/') { e.preventDefault(); document.getElementById('q')?.focus(); }
}

/* WIE VIELE FILTER GERADE GREIFEN. */
function filterNumber() {
  const f = state.filters, v = FILTER_DEFAULT;
  let n = 0;
  /* GEZAEHLT WIRD DIE ABWEICHUNG VON DER VORGABE. */
  if (f.tested !== v.tested) n++;
  // Die Ablehnung zaehlt EIGENS mit und nicht mit dem Teststatus zusammen: sie
// ist ein zweites Merkmal, und beide zugleich verkleinern die Menge zweimal.
  if (f.rejected !== v.rejected) n++;
  if (f.favorite) n++;
  /* DREI GEWAEHLTE KATEGORIEN ZAEHLEN ALS EIN FILTER und nicht als drei --
     anders als die Tags eine Zeile tiefer, und der Unterschied ist die
     Verknuepfung. */
  if (f.categoryIds.length) n++;
  n += f.tagIds.length;
  return n;
}

/* Der Schalter ueber den Filtern. */
function drawFilterSwitch() {
  const button = document.getElementById('filter-toggle');
  const box = document.getElementById('filters');
  if (!button || !box) return;
  const n = filterNumber();
  const zu = box.classList.contains('closed');
  /* HIER STAND AUCH DIE ABLEITUNG DER SORTIERUNG -- eingeklappt war das Wort
     neben den Statuspillen nicht zu sehen. */
  button.querySelector('.fcount').textContent =
    n ? `· ${t('list.filtersActive', { n })}` : '';
  button.classList.toggle('active', n > 0);
  button.setAttribute('aria-expanded', zu ? 'false' : 'true');
  button.title = zu ? t('list.showFilters') : t('list.hideFilters');
}

function drawFilters() {
  const box = document.getElementById('filters');
  if (!box) return;
  box.innerHTML = '';
  const f = state.filters;
  const redraw = () => { saveFilters(); drawFilters(); drawBody(); };

  /* JEDE ZEILE KOMMT IN DIE LEISTE. */
  const row = (label) => {
    const r = document.createElement('div');
    r.className = 'frow';
    r.innerHTML = `<span class="eyebrow">${esc(label)}</span>`;
    box.appendChild(r);
    return r;
  };
  /* EINE ZWEITE BESCHRIFTUNG IN DERSELBEN ZEILE -- und sie ist das
     Gegenstueck zur ersten und keine Ueberschrift ueber dem, was dahinter
     steht. */
  const secondLabel = (row, text) => {
    const e = document.createElement('span');
    e.className = 'eyebrow eyebrow-with';
    e.textContent = text;
    row.appendChild(e);
    return e;
  };

  // Merkmal (Vorgabe: Teststatus). Beschriftung generisch, weil das Wort
// selbst aus dem Vokabular kommt.
  const r1 = row(t('list.status'));
  const g1 = document.createElement('div'); g1.className = 'pills';
  /* GENAU EINE PILLE IST MARKIERT, UND SIE SAGT: „so steht die Liste gerade
     da". */
  [['all',t('list.all')],['tested',V.testedYes],['untested',V.testedNo]].forEach(([v,l]) => {
    const b = document.createElement('button');
    b.className = 'pill' + (f.tested === v ? ' on' : '');
    b.textContent = l;
    b.onclick = () => { f.tested = v; redraw(); };
    g1.appendChild(b);
  });
  // Eigener Umschalter, kein vierter Wert der Reihe davor: die drei oben sind
  // drei Zustaende EINES Merkmals, der Favorit ist davon unabhaengig und muss
  // sich mit jedem kombinieren lassen.
  const bFav = document.createElement('button');
  bFav.className = 'pill pill-sep' + (f.favorite ? ' on' : '');
  bFav.id = 'f-fav';
  bFav.textContent = t('list.favorites');
  bFav.title = f.favorite ? t('list.showAll') : t('list.onlyFavorites');
  bFav.onclick = () => { f.favorite = !f.favorite; redraw(); };
  g1.appendChild(bFav);

  /* HIER STAND DIE PILLE „Neu seit ...". */
  r1.appendChild(g1);

  /* HIER STANDEN ZWEI ZUSATZBESCHRIFTUNGEN: „folgt der Sortierung: Getestet"
     und „von Hand gewaehlt". */

  /* ---- Die Ablehnung: ZWEITE GRUPPE DERSELBEN ZEILE ---- KEINE EIGENE
     ZEILE. */
  secondLabel(r1, t('list.rejection'));
  const g1b = document.createElement('div');
  g1b.className = 'pills'; g1b.id = 'f-rejected';
  [['all',t('list.all')],['ja',t('list.rejected')],['nein',t('list.notRejected')]].forEach(([v,l]) => {
    const b = document.createElement('button');
    b.className = 'pill' + (f.rejected === v ? ' on' : '');
    b.textContent = l;
    b.onclick = () => { f.rejected = v; redraw(); };
    g1b.appendChild(b);
  });
  r1.appendChild(g1b);

  /* ---- Kategorie ---- MEHRERE ZUGLEICH, UND ES IST EIN ODER. */
  const r2 = row(t('list.category'));
  const g2 = document.createElement('div'); g2.className = 'pills';
  // Ein Klick auf einen Wert nimmt ihn dazu oder wieder heraus -- dieselbe
// Handhabung wie bei den Tags, und die Zeile verhaelt sich damit wie jene.
  const switchCategory = (value) => {
    f.categoryIds = f.categoryIds.includes(value)
      ? f.categoryIds.filter(x => x !== value) : [...f.categoryIds, value];
    redraw();
  };
  const all = document.createElement('button');
  all.className = 'pill' + (f.categoryIds.length ? '' : ' on');
  all.textContent = t('list.all');
  all.onclick = () => { f.categoryIds = []; redraw(); };
  g2.appendChild(all);
  state.categories.forEach(c => {
    const b = document.createElement('button');
    b.className = 'pill' + (f.categoryIds.includes(c.id) ? ' on' : '');
    b.innerHTML = `${esc(c.name)}<span class="n">${Number(c.usage_count)}</span>`;
    b.onclick = () => switchCategory(c.id);
    g2.appendChild(b);
  });
  /* "OHNE" AM ENDE DER ZEILE, mit eigener Zahl. */
  const withoutNumber = state.all.filter(i => !i.category).length;
  if (withoutNumber || f.categoryIds.includes(CATEGORY_NONE)) {
    const b = document.createElement('button');
    b.className = 'pill pill-sep' + (f.categoryIds.includes(CATEGORY_NONE) ? ' on' : '');
    b.id = 'f-cat-none';
    b.innerHTML = `${tH('list.without')}<span class="n">${Number(withoutNumber)}</span>`;
    b.title = t('list.noCategory');
    b.onclick = () => switchCategory(CATEGORY_NONE);
    g2.appendChild(b);
  }
  /* ---- HIER STAND DER UMSCHALTER DER TAGZEILE ---- Er war zuletzt ein Knopf
     am rechten Ende der Kategoriezeile. */
  // Nur Tags mit mindestens einem Eintrag: Tags, die ausschliesslich an
  // Testtagen haengen, lieferten hier null Treffer.
  const filterTags = state.tags.filter(tag => tag.usage_count > 0);
  const tagsPossible = filterTags.length > 0 || f.tagIds.length > 0;
  /* DIE ZEILE STEHT DA, SOBALD ES ETWAS ZU FILTERN GIBT. */
  const tagsOpen = tagsPossible;
  r2.appendChild(g2);

  // Tags
  if (tagsOpen) {
    const r3 = row(t('list.tags'));
    /* GIBT ES NICHTS ZU FILTERN, IST DIE ZEILE GANZ WEG und nicht bloss
       verborgen: eine leere Zeile im Fluss kostet Platz. */
    r3.id = 'f-tagrow';
    /* `frow-tags` SAGT DEM RASTER, DASS DIES DIE TAGZEILE IST. */
    r3.classList.add('frow-tags');

    // Umschalter der Verknuepfung. Auf dem Telefon steht er UNTER der
    // Beschriftung und kleiner; am Schreibtisch weiter daneben.
    const modeBox = document.createElement('div');
    modeBox.className = 'tagmode' + (f.tagIds.length > 1 ? '' : ' idle');
    /* DIE BESCHRIFTUNG IST NICHT DAS BINDEWORT. */
    [['and', t('list.tagModeAnd'), t('list.allTagsHint')],
     ['or', t('list.or'), t('list.anyTagHint')]]
      .forEach(([value, text, explanation]) => {
        const b = document.createElement('button');
        b.className = 'pill pill-mode' + (f.tagMode === value ? ' on' : '');
        b.textContent = text;
        b.title = explanation;
        b.dataset.mode = value;
        b.onclick = () => { f.tagMode = value; redraw(); };
        modeBox.appendChild(b);
      });
    r3.appendChild(modeBox);

    const g3 = document.createElement('div'); g3.className = 'pills cloud';
    /* KEIN „Noch keine Tags" MEHR: die Zeile steht ueberhaupt nur da, wenn es
       einen Tag gibt oder ein Tagfilter greift (siehe `tagsPossible` oben). */
    // Welche Tags brächten null Treffer, wenn man sie zusätzlich anklickt? Nur
// im UND-Modus eine Frage -- im ODER-Modus erweitert jeder Klick.
    const idle = new Set();
    if (f.tagMode === 'and' && f.tagIds.length) {
      const visible = visibleItems();
      filterTags.forEach(tag => {
        if (f.tagIds.includes(tag.id)) return;
        if (!visible.some(i => (i.tags || []).some(x => x.id === tag.id))) idle.add(tag.id);
      });
    }
    sortCloud(filterTags, new Set(f.tagIds)).forEach(tag => {
      const b = document.createElement('button');
      const chosen = f.tagIds.includes(tag.id);
      b.className = 'pill pill-tag' + (chosen ? ' on' : '') + (idle.has(tag.id) ? ' blank' : '');
      b.textContent = tag.name;
      if (idle.has(tag.id)) b.title = t('list.noHitsSelection');
      b.onclick = () => {
        f.tagIds = chosen ? f.tagIds.filter(x => x !== tag.id) : [...f.tagIds, tag.id];
        redraw();
      };
      g3.appendChild(b);
    });
    r3.appendChild(g3);
    /* ---- WIE VIELE REIHEN DIE ZUGEKLAPPTE WOLKE ZEIGT
       ---- DER BETREIBER, 12. SEPTEMBER 2026, MIT DREI BILDERN: „Aufgeklappt
       sieht es gut aus. */
    const cloudLimit = getComputedStyle(r3).display === 'grid' ? 2 : 1;
    // Rest aufklappbar. Der Knopf erscheint nur, wenn wirklich etwas
// abgeschnitten ist.
    const trimmed = limitCloud(g3, cloudOpen.overview ? 0 : cloudLimit);
    /* ---- UND DIE ZEICHEN BEKOMMEN IHRE ZEILE NUR, WENN DIE WOLKE SIE
       TRAEGT. */
    if (cloudRows(g3) > 1) r3.classList.add('tags-deep');
    /* DIE BEIDEN VERWEISE STEHEN HINTER DER WOLKE, als gewoehnliche
       Geschwister -- und ist das wieder die natuerliche
       Reihenfolge: "mehr" gehoert hinter das, was es aufklappt. */
    const right = document.createElement('div');
    // Ans Ende SEINER Zeile, wie der Umschalter darueber.
    right.className = 'frow-right frow-right-end';
    /* ---- ZWEI ZEICHEN STATT ZWEIER WOERTER -- gemessen in drei Sprachen,
       aufgeklappt und mit gesetztem Tagfilter: das Zeilenende mass 180 Pixel
       auf Deutsch, 159 auf Tuerkisch, 109 auf Englisch, von 366. */
    if (trimmed || cloudOpen.overview) {
      const m = document.createElement('button');
      m.className = 'link-btn icon-link';
      m.innerHTML = cloudOpen.overview ? ICON_MORE_UP : ICON_MORE_DOWN;
      m.title = cloudOpen.overview ? t('list.less') : t('list.more');
      m.setAttribute('aria-label', m.title);
      m.onclick = () => { cloudOpen.overview = !cloudOpen.overview; drawFilters(); };
      right.appendChild(m);
    }
    if (f.tagIds.length) {
      const c = document.createElement('button');
      c.className = 'link-btn icon-link';
      c.innerHTML = ICON_RESET;
      c.title = t('list.resetTags');
      c.setAttribute('aria-label', c.title);
      c.onclick = () => { f.tagIds = []; redraw(); };
      right.appendChild(c);
    }
    // Ein leerer Kasten bliebe als Flex-Element stehen und naehme der Wolke
// eine Luecke weg.
    if (right.childElementCount) r3.appendChild(right);
    /* DIE ZEILE SAGT, OB DER UMSCHALTER ZU SEHEN SEIN MUSS. Er
       steht unter der Klappe: verborgen, solange die Wolke zugeklappt ist. */
    if (cloudOpen.overview || f.tagIds.length > 1) r3.classList.add('tags-live');
  }

  /* SORTIEREN UND ANSICHTEN TEILEN SICH EINE ZEILE -- gemessen brauchen sie
     322 und 237 px von 1232, sie passen mit Abstand. */
  const r4 = row(t('list.sort'));
  const sel = document.createElement('select');
  // Eine Kennung wie am Favoritenknopf daneben: ohne sie liesse sich die
  // Sortierung nur ueber ihre Klasse ansprechen, und die tragen alle
  // Auswahlfelder der Instanz.
  sel.id = 'f-sort';
  sel.className = 'select';
  /* ---- DIE RICHTUNG IST KEIN EINTRAG DER LISTE MEHR ---- Sonst stuende jede
     Sortierung zweimal da, einmal je Richtung: dreizehn Eintraege in vier
     Gruppen, mit den Ueberschriften siebzehn Zeilen. */
  /* DIE BEIDEN UEBERSCHRIFTEN KOMMEN AUS DER SPRACHDATEI. */
  const GENERAL = t('list.sortGroupGeneral');
  const HISTORY = t('list.sortGroupHistory');
  /* `start` SAGT, WORAUF EIN WECHSEL AUF DIESE GRUNDLAGE LANDET, und es steht
     an JEDER der sieben: ein stiller Vorgabewert liesse die eine Ausnahme wie
     ein Versehen aussehen. */
  const SORT_BASES = [
    { key: 'updated',  group: GENERAL,      word: () => t('list.sortChanged'),
      down: 'list.dirNewOld',   up: 'list.dirOldNew',  start: 'down' },
    /* „Titel" KANN BEIDE RICHTUNGEN -- und bis dahin nur die
       eine. */
    { key: 'title',    group: GENERAL,      word: () => t('list.sortTitle'),
      down: 'list.dirZA',       up: 'list.dirAZ',     start: 'up' },
    { key: 'rating',   group: V.ratingOne,   word: () => V.ratingOne,
      down: 'list.dirHighLow',  up: 'list.dirLowHigh', start: 'down' },
    /* NUR BEI EINGESCHALTETEM MODUS. Eine Sortierung nach einer Zahl,
       die nirgends zu sehen ist, ordnet nach etwas Unsichtbarem. */
    { key: 'potential', group: V.potential,  word: () => V.potential,
      down: 'list.dirHighLow',  up: 'list.dirLowHigh', start: 'down',
      only: () => POTENTIAL_MODE },
    { key: 'tests',    group: HISTORY,      word: () => V.dayMany,
      down: 'list.dirManyFew',  up: 'list.dirFewMany', start: 'down' },
    { key: 'testavg',  group: HISTORY,      word: () => t('list.sortAvg'),
      down: 'list.dirHighLow',  up: 'list.dirLowHigh', start: 'down' },
    { key: 'testlast', group: HISTORY,      word: () => t('list.sortLast'),
      down: 'list.dirHighLow',  up: 'list.dirLowHigh', start: 'down' }
  ].filter(b => !b.only || b.only());
  /* GELESEN WIRD VON HINTEN: die Kennung endet auf `_desc` oder `_asc`, und
     der Rest davor ist die Grundlage. */
  /* WELCHE RICHTUNG GILT, STEHT IM WERT und in nichts sonst. */
  const sortParts = (value) => {
    const stem = String(value || '').replace(/_(desc|asc)$/, '');
    const b = SORT_BASES.find(x => x.key === stem) || SORT_BASES[0];
    return { base: b, asc: String(value || '').endsWith('_asc') };
  };
  const groups = [];
  for (const b of SORT_BASES) {
    const last = groups[groups.length - 1];
    if (last && last.name === b.group) last.bases.push(b);
    else groups.push({ name: b.group, bases: [b] });
  }
  sel.innerHTML = groups.map(g => `<optgroup label="${esc(g.name)}">`
    + g.bases.map(b => `<option value="${esc(b.key)}">${esc(b.word())}</option>`).join('')
    + `</optgroup>`).join('');
  let picked = sortParts(f.sort);
  sel.value = picked.base.key;
  /* DER UMSCHALTER DANEBEN, und er sagt die KONKRETE Richtung und nicht
     „absteigend": bei „Zuletzt geaendert" steht „neu → alt", bei der
     Bewertung „hoch → niedrig", bei den Testtagen „viele → wenige". */
  const dirBtn = document.createElement('button');
  dirBtn.className = 'btn btn-sm sort-dir';
  dirBtn.id = 'f-sort-dir';
  const drawDir = () => {
    const b = picked.base;
    dirBtn.textContent = t(picked.asc ? b.up : b.down);
    dirBtn.title = t('list.sortFlip');
  };
  drawDir();
  /* ZUSAMMENGESETZT WIRD HIER UND NUR HIER -- an beiden Bedienelementen
     dieselbe Zeile. */
  const applySort = () => { f.sort = picked.base.key + (picked.asc ? '_asc' : '_desc'); redraw(); };
  /* WIRD DIE GANZE LEISTE NEU GEZEICHNET UND NICHT NUR DIE LISTE:
     die Sortierung gibt den Statusfilter vor, und die Statuspillen stehen
     eine Zeile weiter oben. */
  sel.onchange = () => {
    const b = SORT_BASES.find(x => x.key === sel.value) || SORT_BASES[0];
    /* DER WECHSEL NIMMT DIE RICHTUNG DER NEUEN GRUNDLAGE und nicht die der
       alten. */
    picked = { base: b, asc: b.start === 'up' };
    applySort();
  };
  dirBtn.onclick = () => { picked.asc = !picked.asc; applySort(); };
  /* BEIDE IN EINEM KASTEN: die Sortierung und ihre Richtung sind EINE
     Einstellung in zwei Bedienelementen, und sie sollen bei einem Umbruch
     nicht auseinanderfallen. */
  const sortPair = document.createElement('div');
  sortPair.className = 'sort-pair';
  sortPair.appendChild(sel);
  sortPair.appendChild(dirBtn);
  r4.appendChild(sortPair);

  /* ---- Die gespeicherten Ansichten ---- GANZ UNTEN UND NICHT GANZ OBEN: sie
     sind die Zusammenfassung der Zeilen darueber, und man liest sie, nachdem
     man weiss, was einstellbar ist. */
  const r5 = r4;
  secondLabel(r5, t('list.views'));
  const g5 = document.createElement('div'); g5.className = 'pills';
  /* WELCHE ANSICHT GERADE GILT, wird verglichen und nicht gemerkt: ein
     gemerkter Zeiger auf "die aktive Ansicht" liefe auseinander, sobald
     jemand einen Filter von Hand verstellt. */
  const now = JSON.stringify({ filters: filterNormal(state.filters), q: state.search.trim() });
  VIEWS.forEach(a => {
    const b = document.createElement('button');
    const equal = JSON.stringify({ filters: filterNormal(a.filters),
                                    q: typeof a.q === 'string' ? a.q.trim() : '' }) === now;
    b.className = 'pill' + (equal ? ' on' : '');
    b.innerHTML = `<span>${esc(a.name)}</span><span class="view-remove" title="${esc(t('list.deleteView'))}">${ICON_X}</span>`;
    b.onclick = () => applyView(a);
    // Das Kreuz liegt IM Knopf und muss deshalb den Klick anhalten -- sonst
// wuerde die Ansicht im selben Zug angewandt und geloescht.
    b.querySelector('.view-remove').onclick = e => {
      e.preventDefault(); e.stopPropagation(); viewDelete(a.name);
    };
    g5.appendChild(b);
  });
  if (VIEWS.length < VIEWS_CAP) {
    const bNew = document.createElement('button');
    /* EIN TEXT UND KEINE PILLE: eine Pille sieht aus wie die Auswahl einer
       gespeicherten Ansicht. */
    bNew.className = 'link-btn' + (VIEWS.length ? ' link-btn-sep' : '');
    bNew.id = 'view-save';
    bNew.textContent = t('list.saveView');
    bNew.title = t('list.saveViewHint');
    bNew.onclick = saveView;
    g5.appendChild(bNew);
  } else {
    // Der Deckel wird GESAGT und nicht durch einen fehlenden Knopf angedeutet:
// ein Knopf, der einfach nicht mehr da ist, sieht aus wie ein Fehler.
    const towards = document.createElement('span');
    towards.className = 'hint hint-sm';
    towards.textContent = t('list.viewCapNew', { viewsCap: VIEWS_CAP });
    g5.appendChild(towards);
  }
  r5.appendChild(g5);

  /* ---- DER RUECKSETZER FUER DIE FILTERLEISTE ---- ER STAND BIS
     HIERHER NIRGENDS. */
  const filtersSet = filterNumber();
  if (filtersSet) {
    const right5 = document.createElement('div');
    right5.className = 'frow-right frow-right-wide';
    const bBack = document.createElement('button');
    bBack.className = 'link-btn';
    bBack.id = 'filter-reset';
    bBack.textContent = t('list.resetFilters', { filtersSet: filtersSet });
    bBack.title = t('list.resetFiltersHint');
    bBack.onclick = () => {
      /* ZURUECKGESETZT WIRD AUF FILTER_DEFAULT und sonst nichts -- und der
         Weg dorthin ist filterNormal(), derselbe wie beim Anwenden einer
         gespeicherten Ansicht. */
      state.filters = filterNormal({ sort: state.filters.sort });
      /* HIER STAND `STATUS_BY_HAND = false` -- „Filter zuruecksetzen" setzte auch
         die Handwahl zurueck. */
      redraw();
    };
    right5.appendChild(bBack);
    r5.appendChild(right5);
  }

  // Ganz zum Schluss, wenn state.filters steht: der Schalter nennt die Zahl
  // der greifenden Filter, und die aendert sich mit jedem Klick auf eine
  // Pille.
  drawFilterSwitch();
}

function drawBody() {
  const body = document.getElementById('body');
  if (!body) return;
  const list = visibleItems();
  /* DIE ZAEHLZEILE NENNT DEN GANZEN BESTAND, nicht die Trefferzahl der Suche:
     `state.bestand` und nicht `state.items.length`. */
  const cnt = document.getElementById('count');
  if (cnt) {
    let z = `${state.inventory} ${vThing(state.inventory)}` +
      (list.length !== state.inventory ? ` · ${t('list.visibleCount', { length: list.length })}` : '');
    if (state.searchRunning) z += ` · ${t('list.searchingShort')}`;
    else if (state.searchError) z += ` · ${t('list.searchOffline')}`;
    cnt.textContent = z;
  }

  drawTimeline(list);
  body.innerHTML = '';
  // GEFRAGT WIRD DER BESTAND UND NICHT DIE GEZEIGTE MENGE: eine Suche ohne
  // Treffer ist kein leerer Bestand, und "Noch nichts erfasst" waere dort die
  // falsche Auskunft.
  if (!state.inventory) {
    body.innerHTML = `<div class="empty">${ICON_PH}<h2>${tH('list.nothingYet')}</h2>
      <p>${tH('list.emptyHint')}</p></div>`;
    return;
  }
  if (!list.length) {
    body.innerHTML = `<div class="empty">${ICON_PH}<h2>${tH('list.noHits')}</h2>
      <p>${tH('list.noMatch')}</p></div>`;
    drawCompareBar();
    return;
  }
  const grid = document.createElement('div');
  /* WAEHREND DIE SUCHE LAEUFT, BLEIBT DIE ALTE LISTE STEHEN und wird nur
     gedaempft. */
  grid.className = 'grid' + (state.searchRunning ? ' searching' : '');
  list.forEach(it => grid.appendChild(card(it)));
  body.appendChild(grid);
  drawCompareBar();
}

/* ================= Zeitleiste der Testtage ================= */
// Ein Punkt je Testtag über einer gemeinsamen Zeitachse.
const TIMELINE_FROM = 5;   // darunter sagt das Band nichts und bleibt weg

function timelinePoints(list) {
  const points = [];
  for (const it of list)
    for (const d of it.testDays || [])
      // mine kommt vom Server: eigene Punkte werden gefuellt
// gezeichnet, fremde als Ring. Kein neuer Farbkanal -- Gold bleibt Gold.
      points.push({ itemId: it.id, title: it.title, date: d.day, score: d.rating, mine: d.mine !== false });
  return points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// Anteil eines Datums an der Gesamtspanne, 0 bis 1. Bei nur einem einzigen
// Datum gibt es keine Spanne — dann in die Mitte.
function timeShare(date, from, to) {
  const a = Date.parse(from + 'T00:00:00Z'), b = Date.parse(to + 'T00:00:00Z');
  if (!(b > a)) return 0.5;
  return (Date.parse(date + 'T00:00:00Z') - a) / (b - a);
}

function yearMarks(from, to) {
  const j1 = Number(from.slice(0, 4)), j2 = Number(to.slice(0, 4));
  const marks = [];
  for (let j = j1; j <= j2; j++) {
    const date = j === j1 ? from : `${j}-01-01`;
    marks.push({ year: j, share: timeShare(date, from, to) });
  }
  return marks;
}

function drawTimeline(list) {
  const box = document.getElementById('timeline');
  if (!box) return;
  if (!TIMELINE_ON) { box.innerHTML = ''; return; }
  const points = timelinePoints(list);
  // Zwei getrennte Bedingungen mit Absicht: die Schwelle ist eine Frage des
  // Nutzens, die leere Menge eine des Rechnens.
  if (!points.length || points.length < TIMELINE_FROM) { box.innerHTML = ''; return; }

  const from = points[0].date, to = points[points.length - 1].date;
  box.innerHTML = `<div class="timeline">
      <div class="timeline-axis" id="timeline-axis"></div>
      <div class="timeline-field" id="timeline-field"></div>
      <div class="timeline-years" id="timeline-years"></div>
    </div>`;
  const field = box.querySelector('#timeline-field');
  const axis = box.querySelector('#timeline-axis');

  // Waagerechte Hilfslinien je Notenstufe, die mittlere etwas kräftiger
  for (let score = 1; score <= 5; score++) {
    const l = document.createElement('div');
    l.className = 'timeline-line' + (score === 3 ? ' center' : '');
    l.style.bottom = ((score - 1) / 4 * 100) + '%';
    axis.appendChild(l);
  }

  points.forEach(p => {
    const d = document.createElement('button');
    d.className = 'timeline-dot' + (p.mine ? '' : ' foreign');
    d.style.left = (timeShare(p.date, from, to) * 100) + '%';
    d.style.bottom = ((p.score - 1) / 4 * 100) + '%';
    d.dataset.item = p.itemId;
    d.setAttribute('aria-label', t('list.gradeLong', { instanceTitle: p.title, date: fmtDay(p.date), score: p.score }));
    d.onclick = () => { location.hash = `#/item/${p.itemId}`; };
    // Eigenes Hinweisfeld statt title: kein Wartezögern, und der Text bleibt
    // lesbar gesetzt.
    d.onpointerenter = (e) => { if (e.pointerType !== 'touch') showHint(box, d, p); };
    d.onpointerleave = () => hideHint(box);
    field.appendChild(d);
  });

  const years = box.querySelector('#timeline-years');
  const marks = yearMarks(from, to);
  marks.forEach(m => {
    const s = document.createElement('span');
    s.className = 'timeline-year';
    s.style.left = (m.share * 100) + '%';
    s.textContent = m.year;
    years.appendChild(s);
  });

  /* NUR SO VIELE JAHRESZAHLEN, WIE NEBENEINANDER PASSEN. */
  const numberWidth = years.firstElementChild ? years.firstElementChild.offsetWidth : 0;
  const axisWidth = years.clientWidth;
  if (numberWidth && axisWidth && marks.length > 1) {
    const matches = Math.max(1, Math.floor(axisWidth / (numberWidth * 1.5)));
    const step = Math.ceil(marks.length / matches);
    if (step > 1)
      [...years.children].forEach((el, i) => { if (i % step) el.remove(); });
  }
}

function showHint(box, point, p) {
  hideHint(box);
  const line = box.querySelector('.timeline');
  const h = document.createElement('div');
  h.className = 'timeline-hint';
  h.innerHTML = `<strong>${esc(p.title)}</strong><span>${tH('list.gradeShort', { date: fmtDay(p.date), score: p.score })}</span>`;
  h.style.left = point.style.left;
  line.appendChild(h);
  // Erst nach dem Einfuegen hat das Feld eine Breite.
  const axis = line.clientWidth, width = h.offsetWidth;
  if (axis && width)
    h.style.left = hintCenter(parseFloat(point.style.left) / 100 * axis, width, axis) + 'px';
}
/* Die Mitte des Hinweisfelds in Pixeln: ueber dem Punkt, aber so weit nach
   innen, dass das Feld an beiden Raendern in der Zeitleiste bleibt. */
function hintCenter(point, width, axis) {
  if (width >= axis) return axis / 2;
  return Math.min(axis - width / 2, Math.max(width / 2, point));
}
function hideHint(box) { box.querySelector('.timeline-hint')?.remove(); }

/* Die Marke auf der Karte, wenn mehr als ein Element dahintersteht. */
function inventoryText(it) {
  const f = it.photoCount || 0, v = it.videoCount || 0;
  if (f + v < 2) return '';
  const parts = [];
  if (f) parts.push(t('list.photoCount', { n: f }));
  if (v) parts.push(t('list.videoCount', { n: v }));
  return `<div class="photo-count">${parts.join(' · ')}</div>`;
}

/* ================= Der Trefferkontext an der Kachel
   ================= WARUM EIN EINTRAG IN DER TREFFERLISTE STEHT. */
const FINDING_WORDS = {
  description: () => t('list.description'),
  comment: () => t('dialog.comment'),
  link: () => t('dialog.link'),
  testDay: () => t('list.sortDay'),
  tag: () => t('list.tag'),
  category: () => t('list.category'),
  title: () => t('list.title')
};
/* EINE UNBEKANNTE QUELLE HEISST "Fundstelle" UND FAELLT NICHT AUS DER ZEILE. */
const findingWord = (source) => (FINDING_WORDS[source] || (() => t('list.hitPlace')))();

/* DIE VOLLE AUSSAGE STEHT IM UEBERFAHRTEXT. */
const findHover = (f) => t('list.foundIn', { source: findingWord(f.source) }) + (
  f.others > 0 ? t('list.moreHits', { n: f.others }) : '');

function card(it) {
  const a = document.createElement('a');
  /* DER BEGRIFF WANDERT IN DIE ADRESSE DER KACHEL. */
  const term = state.search.trim();
  a.href = entryAddress(it.id, term);
  a.className = 'card' + (state.compare.has(it.id) ? ' picked' : '') + (it.rejected ? ' rejected' : '');
  const badges = [];
  if (it.rejected) badges.push(`<span class="badge badge-rejected">${tH('list.rejectedInline')}</span>`);
  if (it.tested) badges.push(`<span class="badge badge-tested">${esc(V.testedYes)}</span>`);

  const badgeRow = badges.length
    ? `<div class="card-badges">${badges.join('')}</div>` : '';

  const testLine = it.testCount ? `<div class="card-test">
      <span>${it.testCount} ${esc(vTime(it.testCount))}</span>
      <span class="sep">·</span><span>⌀ ${number(it.testAvg, 1)}</span>
      <span class="sep">·</span><span>${tH('list.lastGrade', { testLast: it.testLast })}</span>
    </div>` : '';

  /* DIE ZEILE STEHT UNTER DEM TITEL UND UEBER DEN TAGS -- bei dem, was sie
     erklaert, und nicht am Fuss bei den Zahlen. */
  const f = it.foundAt;
  const findingRow = f ? `<div class="card-find" title="${esc(findHover(f))}">
        <span class="find-source">${esc(findingWord(f.source))}:</span><span
          class="find-text"></span>${f.others ? `<span class="find-more">+${f.others}</span>` : ''}
      </div>` : '';

  a.innerHTML = `
    <div class="card-img">
      ${it.mainPhoto ? `<img src="${esc(imageSource(it.mainPhoto, 'thumb'))}" alt="" loading="lazy">` : ICON_PH}
      ${badgeRow}
      ${it.favorite ? `<div class="card-pin" title="${esc(t('list.favorite'))}">★</div>` : ''}
      ${isVideo(it.mainPhoto) ? `<div class="card-play" title="${esc(t('list.video'))}">▶</div>` : ''}
      ${inventoryText(it)}
    </div>
    <div class="card-body">
      ${it.category ? `<div class="card-cat">${esc(it.category.name)}</div>` : ''}
      <h3 class="card-title">${esc(it.title)}</h3>
      ${findingRow}
      ${it.tags.length ? `<div class="card-tags">${it.tags.slice(0,4).map(tag => `<span class="chip ro">${esc(tag.name)}</span>`).join('')}</div>` : ''}
      ${testLine}
      <div class="card-foot">
        <span class="card-meta-l">
          ${/* EINE KACHEL, EINE ZAHL. */''}
          ${tileNumber(it)}
          ${it.linkCount ? `<span class="link-count">${tH('list.linkCount', { n: it.linkCount })}</span>` : ''}
        </span>
        <button class="pick-box${state.compare.has(it.id) ? ' on' : ''}" title="${esc(state.compare.has(it.id) ? t('list.removeCompare') : t('list.selectCompare'))}">${ICON_CHECK}</button>
      </div>
    </div>`;

  if (f) a.querySelector('.find-text').replaceChildren(raiseHighlight(f.text, term));
  /* DIE HERVORHEBUNG GILT DORT, WO GESUCHT WURDE -- und die Kachel zeigt drei
     der sieben Quellen: Titel, Kategorie und die ersten vier Tags. */
  highlightInNode(a.querySelector('.card-title'), it.title, term);
  if (it.category) highlightInNode(a.querySelector('.card-cat'), it.category.name, term);
  if (term) [...a.querySelectorAll('.card-tags .chip')]
    .forEach((chip, i) => highlightInNode(chip, it.tags[i].name, term));

  const pickBox = a.querySelector('.pick-box');
  pickBox.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    const was = state.compare.has(it.id);
    was ? state.compare.delete(it.id) : state.compare.add(it.id);
    /* NUR DIE KACHEL UND DIE LEISTE und nicht die ganze Liste: von
       state.compare haengen genau drei Dinge ab -- die Klasse am Verweis, die
       Klasse samt Titel am Haken und die Vergleichsleiste. */
    a.classList.toggle('picked', !was);
    pickBox.classList.toggle('on', !was);
    pickBox.title = was ? t('list.selectCompare') : t('list.removeCompare');
    drawCompareBar();
  });
  return a;
}

/* DIE ZAHL AUF DER KACHEL. */
function tileNumber(it) {
  const potential = !it.tested;
  /* IST DER MODUS AUS, STEHT AN DIESER STELLE NICHTS, und das ist
     die Antwort auf F5: kein Platzhalter, kein Strich, die Zeile schliesst
     sich. */
  if (!POTENTIAL_MODE && potential) return '';
  const value = potential ? it.potentialRating : it.avgRating;
  /* „noch nicht eingeschätzt" UND NICHT „keine <Vokabelwort>sterne": das Wort
     aus dem Vokabular wird nirgends zu einem Wort verbaut. */
  if (!value) return `<span class="hint hint-sm">${potential ? tH('list.notEstimatedYet') : tH('list.notRatedYet')}</span>`;
  const char = potential ? '◆' : '★';
  const word = potential ? V.potential : V.ratingOne;
  return `<span class="rating-inline${potential ? ' potential' : ''}" title="${esc(word)}">` +
    `<span class="dot">${char}</span>${number(value, 1)}</span>`;
}

function drawCompareBar() {
  document.querySelector('.cmp-bar')?.remove();
  if (!state.compare.size) return;
  const bar = document.createElement('div');
  bar.className = 'cmp-bar';
  bar.innerHTML = `<span>${tH('list.selectedCount', { size: state.compare.size })}</span>
    <button class="btn btn-sm"${state.compare.size < 2 ? ' disabled' : ''}>${tH('list.compareAction')}</button>
    <button class="btn-x" title="${esc(t('list.clearSelection'))}">${ICON_X}</button>`;
  bar.querySelector('.btn').onclick = () => { if (state.compare.size >= 2) location.hash = '#/compare'; };
  bar.querySelector('.btn-x').onclick = () => { state.compare.clear(); drawBody(); };
  document.body.appendChild(bar);
}

/* ================= Doppelte Eintraege beim Anlegen ================= Bei
   vier Zugaengen und dreihundert Eintraegen legt der zweite Mensch dieselbe
   Maschine ein zweites Mal an -- eine Sache, zwei Wahrheiten. */
const SIMILAR_DIALOG = 4;
const SIMILAR_SHOW = 5;

// Kleinbuchstaben, Ziffern und Buchstaben mit Zeichen darauf bleiben; alles
// andere faellt weg. "Bosch GSR 18V-60" wird zu "boschgsr18v60".
const titleCore = (raw) => String(raw || '').toLocaleLowerCase(LOCALE).replace(/[^0-9a-zäöüßàáâãèéêëìíîïòóôõùúûñç]+/g, '');

function similarEntries(title) {
  const core = titleCore(title);
  if (core.length < SIMILAR_DIALOG) return [];
  const dialog = [];
  for (let i = 0; i + SIMILAR_DIALOG <= core.length; i++)
    dialog.push(core.slice(i, i + SIMILAR_DIALOG));
  const matched = [];
  for (const it of state.all) {
    const k = titleCore(it.title);
    if (k.length < SIMILAR_DIALOG) continue;
    if (dialog.some(f => k.includes(f))) matched.push(it);
    if (matched.length >= SIMILAR_SHOW) break;
  }
  return matched;
}

function openCreate() {
  const bd = document.createElement('div');
  bd.className = 'backdrop';
  bd.innerHTML = `<div class="modal"><h2>${tH('list.createEntry')}</h2>
    <div class="field"><label>${tH('list.title')}</label><input class="input" id="nt" placeholder="${esc(t('list.nameIt'))}">
      <div class="hint hint-sm similar" id="nt-similar"></div></div>
    <div class="field"><label>${tH('list.shortDescription')}</label><textarea class="ta" id="nd" placeholder="${esc(t('list.whatIsIt'))}"></textarea></div>
    <div class="modal-acts"><button class="btn btn-ghost" id="nc">${tH('dialog.cancel')}</button>
    <button class="btn btn-accent" id="ns">${tH('list.create')}</button></div></div>`;
  document.body.appendChild(bd);
  const close = () => bd.remove();
  bd.onclick = e => { if (e.target === bd) close(); };
  document.getElementById('nc').onclick = close;
  const nt = document.getElementById('nt');
  const row = document.getElementById('nt-similar');
  // Die Zeile wird bei jedem Anschlag neu gebildet.
  const drawSimilar = () => {
    const matched = similarEntries(nt.value);
    if (!matched.length) { row.innerHTML = ''; return; }
    // Die Sprungmarken schliessen den Dialog: ein offener Kasten ueber dem
// Eintrag, zu dem man gerade gesprungen ist, waere im Weg.
    row.innerHTML = t('list.similarTitles') + matched
      .map(it => `<a href="#/item/${Number(it.id)}" data-close>${esc(it.title)}</a>`).join(', ');
    row.querySelectorAll('[data-close]').forEach(a => { a.onclick = () => close(); });
  };
  nt.addEventListener('input', drawSimilar);
  const save = async () => {
    const title = nt.value.trim();
    if (!title) return toast(t('list.titleMissing'), true);
    try {
      const it = await api('POST', '/api/items', { title, description: document.getElementById('nd').value.trim() });
      close(); location.hash = `#/item/${it.id}`;
    } catch (e) { toast(e.message, true); }
  };
  document.getElementById('ns').onclick = save;
  nt.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
  nt.focus();
}

/* ================= Offene Aufgaben quer über alle Einträge ================= */
/* Diese Ansicht macht vorhandene Funktionalität erreichbar: Aufgaben samt
   Farbkante und Weiterschaltknopf gibt es im Kommentarblock, sichtbar waren
   sie aber nur im geöffneten Eintrag. */
async function renderOpen() {
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">${tH('list.loading')}</p></div>`;
  let rows;
  try { rows = await api('GET', '/api/open'); }
  catch (e) {
    if (e.message !== SESSION_GONE)
      app.innerHTML = `<div class="shell"><p class="hint">${esc(e.message)}</p></div>`;
    return;
  }

  /* ANSICHTSZUSTAND IM SPEICHER, KEINE EINSTELLUNG -- wie im Vergleich und
     aus demselben Grund: der Umschalter ist eine Linse auf dieselben Daten
     und darf keine zweite Wahrheit werden. */
  let onlyMy = false;

  app.innerHTML = `<div class="shell">
    ${subhead()}
    <h1 class="page-title">${tH('list.openTasks')}</h1>
    <p class="hint page-hint${multipleUsers() ? ' above-pills' : ''}" id="open-hint"></p>
    ${multipleUsers() ? `<div class="pills" id="open-view" style="margin:0 0 20px"></div>` : ''}
    <div id="open-list"></div>
  </div>`;
  wireSubhead();

  function drawView() {
    const box = document.getElementById('open-view');
    if (!box) return;
    box.innerHTML = '';
    [true, false].forEach(my => {
      const b = document.createElement('button');
      b.className = 'pill' + (my === onlyMy ? ' on' : '');
      b.dataset.view = my ? 'meine' : 'alle';
      b.textContent = my ? t('list.mine') : t('list.all');
      b.onclick = () => { onlyMy = my; draw(); };
      box.appendChild(b);
    });
  }

  /* Der Haken schickt die Art AUSDRÜCKLICH, er schaltet nicht weiter. */
  const setCheck = async (z, finished) => {
    try {
      await api('PUT', `/api/comments/${z.id}`, { kind: finished ? 'done' : 'task' });
      z.done = finished;
      draw();
    } catch (e) { toast(e.message, true); }
  };

  /* DIE EINTEILUNG STEHT GANZ OBEN (`dueOf`): der
     Eintrag faerbt sein Datum nach derselben Auskunft, und zwei Einteilungen
     an zwei Orten liefen auseinander. */
  /* VIER ABSCHNITTE UND NICHT DREI, und der vierte ist kein vierter Zustand:
     „ohne Datum" ist die Abwesenheit eines Zustands. */
  const SECTIONS = [['overdue', 'list.dueOverdue'], ['today', 'list.dueToday'],
                    ['later', 'list.dueLater'], ['none', 'list.dueNone']];

  function draw() {
    drawView();
    const visible = onlyMy ? rows.filter(z => z.mine) : rows;
    /* DIE GRUPPIERUNG NACH EINTRAG BLEIBT — INNERHALB DES ABSCHNITTS. */
    const groupsOf = (list) => {
      const out = [];
      for (const z of list) {
        const last = out[out.length - 1];
        if (last && last.id === z.item.id) last.rows.push(z);
        else out.push({ id: z.item.id, title: z.item.title, rows: [z] });
      }
      return out;
    };

    // Ein leerer Bildschirm ist eine schlechte Antwort. Und die beiden Fälle
// sind verschieden: gar nichts offen, oder nichts von mir.
    document.getElementById('open-hint').textContent = !visible.length
      ? (rows.length ? t('list.nothingOpenMine')
                       : t('list.nothingOpen'))
      : t('list.openGroupedBy', { length: visible.length, task: vTask(visible.length) })
        + (multipleUsers() ? (onlyMy ? t('list.showingOwn')
                                         : t('list.showingAll')) : '');

    const box = document.getElementById('open-list');
    box.innerHTML = '';
    SECTIONS.forEach(([key, word]) => {
      const inside = visible.filter(z => dueOf(z) === key);
      if (!inside.length) return;
      // Die Überschrift des Abschnitts. Sie trägt die Zahl -- wer drei
// überfällige Aufgaben hat, soll das sehen, ohne zu zählen.
      const section = document.createElement('div');
      section.className = 'open-section' + (key === 'overdue' ? ' overdue' : '');
      section.dataset.due = key;
      section.textContent = `${t(word)} · ${inside.length}`;
      box.appendChild(section);
      groupsOf(inside).forEach(g => {
      const boxId = document.createElement('div');
      boxId.className = 'open-group';
      boxId.dataset.item = g.id;
      const head = document.createElement('a');
      head.className = 'open-title';
      head.href = `#/item/${g.id}`;
      head.textContent = g.title;
      boxId.appendChild(head);

      g.rows.forEach(z => {
        const el = document.createElement('div');
        el.className = 'open-row' + (z.done ? ' done' : '');
        el.dataset.comment = z.id;

        /* EIN BEDIENZEICHEN FOLGT DEM RECHT, NICHT DER ANZEIGE. */
        if (z.mine || ADMIN) {
          const check = document.createElement('button');
          check.className = 'open-check';
          check.innerHTML = z.done ? ICON_BOX_CHECK : ICON_BOX;
          check.classList.toggle('on', !!z.done);
          check.title = z.done ? t('list.reopen')
                                   : t('list.setDone');
          check.onclick = () => setCheck(z, !z.done);
          el.appendChild(check);
        }

        const text = document.createElement('a');
        text.className = 'open-text';
        text.href = `#/item/${g.id}`;
        text.textContent = z.text;
        el.appendChild(text);

        // Verfasser nur ab zwei Zugängen -- bei einem wiederholte der Name nur,
// wer ohnehin alles geschrieben hat. Dieselbe Schwelle wie überall.
        /* DAS FÄLLIGKEITSDATUM AN DER ZEILE. Es steht nur da, wenn
           eines gesetzt ist; im Abschnitt „Ohne Datum" wäre es ohnehin leer. */
        const when = document.createElement('span');
        when.className = 'open-when';
        when.textContent = (multipleUsers() ? `${authorName(z.author)} · ` : '')
          + (z.dueDate ? fmtDay(z.dueDate) : fmtDate(z.created_at));
        el.appendChild(when);

        boxId.appendChild(el);
      });
      box.appendChild(boxId);
      });
    });
  }

  draw();
}

/* ================= Vergleich ================= */
async function renderCompare() {
  const ids = [...state.compare];
  if (ids.length < 2) { location.hash = '#/'; return; }
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">${tH('list.loading')}</p></div>`;
  let items;
  try { items = await Promise.all(ids.map(id => api('GET', `/api/items/${id}`))); }
  catch (e) { toast(e.message, true); location.hash = '#/'; return; }

  /* ZWEI GRUPPEN VON ZEILEN: erst die Vorher-Kriterien, dann die
     Nachher-Kriterien, jede mit ihrer eigenen Kopfzahl und einer Trennzeile,
     die das Wort traegt. */
  const names = [];
  const weights = new Map();
  const phases = new Map();
  items.forEach(i => i.ratings.forEach(r => {
    if (!names.includes(r.name)) {
      names.push(r.name); weights.set(r.name, r.weight); phases.set(r.name, r.phase);
    }
  }));
  // Die beiden Gruppen, in der Reihenfolge der Kaesten am Eintrag: vorher,
  // dann nachher.
  const GROUPS = [
    { phase: 'before',  word: () => V.potential, average: 'potentialRating' },
    { phase: 'after', word: () => V.ratingOne, average: 'avgRating' }
  ].map(g => ({ ...g, names: names.filter(n => phases.get(n) === g.phase) }));

  /* ANSICHTSZUSTAND IM SPEICHER, KEINE EINSTELLUNG -- wie linksOpen und
     cloudOpen. */
  let onlyMy = false;

  app.innerHTML = `<div class="shell">
    ${subhead()}
    <h1 class="page-title">${tH('list.compare')}</h1>
    <p class="hint page-hint${multipleUsers() ? ' above-pills' : ''}" id="cmp-hint"></p>
    ${multipleUsers() ? `<div class="pills" id="cmp-view" style="margin:0 0 20px"></div>` : ''}
    <div class="cmp-grid" id="cg" style="grid-template-columns:repeat(auto-fit,minmax(264px,1fr))"></div>
  </div>`;
  wireSubhead();

  const cg = document.getElementById('cg');

  /* DIE ZAHL FUER "MEINE" BILDET DER KLIENT. */
  /* MIT DER PHASE ALS ARGUMENT. */
  const ownAverage = (it, phase) => {
    let counter = 0, denominator = 0;
    for (const r of it.ratings) {
      if (r.phase !== phase) continue;
      if (r.value > 0) { counter += r.value * r.weight; denominator += r.weight; }
    }
    if (!denominator) return null;
    return Math.round((counter / denominator) * 10) / 10;
  };
  // Drei Zahlen, ein Schalter: Kriterienwert, Kopfzahl und Testtagzeile
  // schalten gemeinsam um.
  const valueFrom = (it, name) => {
    const r = it.ratings.find(x => x.name === name);
    if (!r) return 0;
    return onlyMy ? r.value : (r.avg || 0);
  };
  // Der Schnitt DER GRUPPE: in der Stellung „alle" die Zahl vom Server, in der
// Stellung „meine" die eigene -- beide je Kasten, nie ueber beide.
  const averageFrom = (it, group) =>
    (onlyMy ? ownAverage(it, group.phase) : it[group.average]);
  const daysFrom = (it) => (onlyMy
    ? (it.testDays || []).filter(td => td.mine).length
    : (it.testCount || 0));
  /* GANZ BLEIBT GANZ, ALLES ANDERE BEKOMMT EINE STELLE -- und zwar auch dann,
     wenn sie nach dem Runden eine Null ist: „7,0" sagt, dass gerechnet wurde,
     „7" saehe aus wie eine glatte Zahl. */
  const asNumber = (v) => (Number.isInteger(v) ? number(v, 0) : number(v, 1));

  function drawView() {
    const box = document.getElementById('cmp-view');
    if (!box) return;
    box.innerHTML = '';
    [true, false].forEach(my => {
      const b = document.createElement('button');
      b.className = 'pill' + (my === onlyMy ? ' on' : '');
      b.dataset.view = my ? 'meine' : 'alle';
      b.textContent = my ? t('list.mine') : t('list.all');
      b.onclick = () => { onlyMy = my; draw(); };
      box.appendChild(b);
    });
  }

  function draw() {
    drawView();
    document.getElementById('cmp-hint').textContent =
      t('list.compared', { length: items.length, thing: vThing(items.length) })
      + t('list.bestValueHint')
      + (multipleUsers()
        ? (onlyMy ? t('list.showingOwnValues') : t('list.showingAvg'))
        : '');

    const bestOf = (name) => Math.max(...items.map(o => valueFrom(o, name)));
    const bestTest = Math.max(...items.map(daysFrom));

    cg.innerHTML = '';
    items.forEach(it => {
      const col = document.createElement('div');
      col.className = 'cmp-col';
      /* JE GRUPPE EINE TRENNZEILE MIT DEM WORT UND DER KOPFZAHL DIESES
         KASTENS, darunter seine Kriterienzeilen. */
      const groupRows = GROUPS.filter(g => g.names.length).map(g => {
        const average = averageFrom(it, g);
        const head = `<div class="cmp-group"><span class="cn">${esc(g.word())}</span>
          <span>${average ? '⌀ ' + number(average, 1) : '–'}</span></div>`;
        return head + g.names.map(n => {
          const v = valueFrom(it, n);
          const best = v > 0 && v === bestOf(n);
          // Die Marke ×1,5 an der Zeilenbeschriftung, abgeleitet wie ueberall:
// bei Gewicht 1 steht dort nichts.
          const mark = weightMark(weights.get(n));
          return `<div class="cmp-crit"><span class="cn">${esc(n)}${
              mark ? ` <span class="cweight" title="${esc(t('list.weightedAvg'))}">${esc(mark)}</span>` : ''}</span>
            <span class="${best ? 'cmp-best' : ''}">${v > 0 ? asNumber(v) + ' / 5' : '–'}</span></div>`;
        }).join('');
      }).join('');
      const days = daysFrom(it);
      const testRow = `<div class="cmp-crit" style="border-top:1px solid var(--line);margin-top:6px;padding-top:9px">
        <span class="cn">${esc(V.dayMany)}</span>
        <span class="${days && days === bestTest ? 'cmp-best' : ''}">${days || '–'}</span></div>`;
      col.innerHTML = `
        <div class="cimg">${it.photos[0] ? `<img src="/api/photos/${Number(it.photos[0].id)}/raw?size=medium" alt="">` : ''}</div>
        <div class="cbody">
          ${it.category ? `<div class="card-cat">${esc(it.category.name)}</div>` : ''}
          <h3>${esc(it.title)}</h3>
          ${groupRows}${testRow}
          <div style="margin-top:12px"><a href="#/item/${Number(it.id)}" class="btn btn-sm" style="width:100%">${tH('list.open')}</a></div>
        </div>`;
      cg.appendChild(col);
    });
  }

  draw();
}

/* ================= Vollbild ================= */
let lightboxOpen = false;

// Adresse eines Bildes.
/* DIE EINE STELLE, AN DER EINE BILDADRESSE ENTSTEHT -- und auch
   die einzige, die die FASSUNG anhaengt. */
function imageSource(p, filesize) {
  if (p.source === 'comment')
    return `/api/comment-images/${p.id}/raw${filesize === 'thumb' ? '?size=thumb' : ''}`;
  // Ein Kommentarvideo hat nur die Kachel; sie ist auch das Poster.
  if (p.source === 'commentVideo')
    return `/api/comment-videos/${p.id}/raw${filesize ? '?size=thumb' : ''}`;
  if (!filesize) return `/api/photos/${p.id}/raw`;
  const f = Number(p.thumbLength);
  const version = filesize === 'thumb' && Number.isFinite(f) ? `&v=${f}` : '';
  return `/api/photos/${p.id}/raw?size=${filesize}${version}`;
}
// Woran die Oberflaeche ein Video erkennt: an art aus der Antwort, an nichts
// sonst. Kein Raten am ausgelieferten Typ, keine zweite Wahrheit.
const isVideo = (p) => p?.kind === 'video';
// Beim Video gehoert der zweite Klick der Abspielsteuerung, nicht dem Zoom.
// Kommentarbilder haben ohnehin kein Original.
const hasOriginal = (p) => p.source !== 'comment' && !isVideo(p);
// 42 -> "0:42", 130 -> "2:10". Ohne bekannte Dauer steht nichts da.
function durationText(s) {
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return '';
  return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
}

// Nach dem Zoom steht der Bildlauf auf 0/0 -- man saehe die linke obere Ecke
// statt der Stelle, die man eben betrachtet hat.
function centerStage(stage) {
  if (!stage) return;
  stage.scrollLeft = Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2);
  stage.scrollTop = Math.max(0, (stage.scrollHeight - stage.clientHeight) / 2);
}

/* `remove` IST FREIWILLIG UND ENTSCHEIDET UEBER DEN PAPIERKORB IM VOLLBILD. */
function openLightbox(photos, startIdx, title, remove, inside) {
  if (!photos.length) return;
  lightboxOpen = true;
  let i = startIdx, zoomed = false;

  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lb-top">
      <span class="lb-title">${esc(title || '')}</span>
      <div class="lb-tools">
        <span class="lb-count"></span>
        <a class="lb-btn download" download title="${esc(t('entry.download'))}">↓</a>
        <button class="lb-btn zoom" title="${esc(t('list.zoomFull'))}">⊕</button>
        ${/* DER PAPIERKORB STEHT ABGESETZT, mit einer groesseren Luecke davor
             -- dieselbe Ueberlegung wie ueber dem grossen Bild darunter: die
             Knoepfe davor stellen etwas ein, dieser hier nimmt etwas weg. */''}
        ${remove ? `<button class="lb-btn remove" title="${esc(t('dialog.delete'))}">${ICON_TRASH}</button>` : ''}
        <button class="lb-btn close" title="${esc(t('list.closeEsc'))}">${ICON_X}</button>
      </div>
    </div>
    <div class="lb-stage"><img alt="" title="${esc(t('list.clickZoomHint'))}">
      <video class="lb-video" controls playsinline hidden></video></div>
    ${photos.length > 1 ? `<button class="lb-nav prev" title="${esc(t('list.previous'))}">‹</button>
                           <button class="lb-nav next" title="${esc(t('list.next'))}">›</button>` : ''}
    ${photos.length > 1 ? `<div class="lb-strip"></div>` : ''}`;
  document.body.appendChild(lb);
  document.body.classList.add('lb-open');

  const stage = lb.querySelector('.lb-stage');
  const img = lb.querySelector('.lb-stage img');
  const player = lb.querySelector('.lb-video');
  const strip = lb.querySelector('.lb-strip');

  /* ---- DER FLIEGENDE WECHSEL ---- DAS VOLLBILD IST DERSELBE FILM, NUR
     GROESSER. */
  const inner = () => (typeof inside === 'function' ? inside() : null) || null;
  let handover = null;
  {
    const el = inner();
    const source = isVideo(photos[i]) ? imageSource(photos[i], '') : null;
    if (el && source && el.getAttribute('src') === source) {
      handover = { source, position: el.currentTime || 0, wasPlaying: !el.paused, open: true };
      el.pause();
      el.removeAttribute('src');
      el.load();
    }
  }

  /* ANHALTEN BEIM BLAETTERN UND BEIM VERLASSEN. */
  const hold = () => {
    if (!player.hidden || player.src) {
      if (handover && player.getAttribute('src') === handover.source) {
        handover.position = player.currentTime || 0;
        handover.wasPlaying = !player.paused;
      }
      player.pause();
      player.removeAttribute('src');
      player.load();
    }
  };

  /* ZURUECK GEHT ES DENSELBEN WEG -- Quelle und Stelle wandern an den inneren
     Abspieler zurueck. */
  const restore = () => {
    if (!handover) return;
    const el = inner();
    if (!el || el.getAttribute('src')) return;
    el.src = handover.source;
    el.currentTime = handover.position;
    if (handover.wasPlaying) el.play()?.catch?.(() => {});
    handover = null;
  };

  // Erst wenn das Original geladen ist, stehen seine Masse fest -- vorher waere
// scrollWidth noch das der kleinen Variante und die Mitte falsch berechnet.
  img.addEventListener('load', () => { if (zoomed) centerStage(stage); });

  function setZoom(on) {
    zoomed = on;
    stage.classList.toggle('zoomed', on);
    // Erst beim Zoom wird das unveraenderte Original geladen.
    img.src = imageSource(photos[i], on ? '' : 'medium');
  }
  function show() {
    if (i < 0) i = photos.length - 1;
    if (i >= photos.length) i = 0;
    zoomed = false;
    stage.classList.remove('zoomed');
    hold();
    const video = isVideo(photos[i]);
    // Statt des Bildes der Abspieler. Kein automatisches Abspielen -- der
// Klick auf die Steuerung startet, sonst nichts.
    img.hidden = video;
    player.hidden = !video;
    if (video) {
      player.poster = imageSource(photos[i], 'medium');
      player.src = imageSource(photos[i], '');
      /* DIE UEBERNOMMENE STELLE GILT EINMAL, beim Oeffnen. */
      if (handover && handover.open && player.getAttribute('src') === handover.source) {
        handover.open = false;
        player.currentTime = handover.position;
        if (handover.wasPlaying) player.play()?.catch?.(() => {});
      }
    } else {
      img.src = imageSource(photos[i], 'medium');
    }
    // Der Download zeigt auf das Original, beim Kommentarbild auf das gespeicherte Bild.
    lb.querySelector('.download').href = imageSource(photos[i], '');
    // Ohne Original kein Zoomknopf -- ein Knopf, der nichts tut, wirkt kaputt.
    lb.querySelector('.zoom').hidden = !hasOriginal(photos[i]);
    img.title = hasOriginal(photos[i]) ? t('list.clickZoomHint') : '';
    lb.querySelector('.lb-count').textContent = `${i + 1} / ${photos.length}`;
    /* BLEIBT NUR EINES UEBRIG, VERSCHWINDEN PFEILE UND STREIFEN. */
    lb.querySelectorAll('.lb-nav').forEach(k => { k.hidden = photos.length < 2; });
    if (strip) {
      strip.hidden = photos.length < 2;
      [...strip.children].forEach((tile, n) => tile.classList.toggle('on', n === i));
      strip.children[i]?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    }
  }
  /* EIGENE FUNKTION UND NICHT EINE SCHLEIFE BEIM OEFFNEN: nach einem Loeschen
     stimmt der Streifen sonst nicht mehr -- er zeigte das entfernte Bild
     weiter, und der Klick darauf fuehrte auf eine Nummer, die es nicht gibt. */
  function buildStrip() {
    if (!strip) return;
    strip.innerHTML = '';
    photos.forEach((p, n) => {
      const tile = document.createElement('button');
      tile.className = 'lb-thumb' + (isVideo(p) ? ' is-video' : '');
      tile.innerHTML = `<img src="${esc(imageSource(p, 'thumb'))}" alt="">` +
        (isVideo(p) ? `<span class="play-badge">▶</span>` : '');
      tile.onclick = () => { i = n; show(); };
      strip.appendChild(tile);
    });
  }
  buildStrip();

  const close = () => {
    hold();
    restore();
    lightboxOpen = false;
    document.removeEventListener('keydown', onKey, true);
    document.body.classList.remove('lb-open');
    lb.remove();
  };
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); i--; show(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); i++; show(); }
  }
  document.addEventListener('keydown', onKey, true);

  lb.querySelector('.close').onclick = close;
  lb.querySelector('.zoom').onclick = () => setZoom(!zoomed);
  /* GELOESCHT WIRD, WAS MAN ANSIEHT -- dieselbe Regel wie ueber dem grossen
     Bild darunter, und dort steht sie ausfuehrlich begruendet. */
  lb.querySelector('.remove')?.addEventListener('click', async () => {
    const removed = photos[i];
    if (!await remove(removed)) return;
    /* WAS GELOESCHT IST, WANDERT NICHT ZURUECK. */
    if (handover && imageSource(removed, '') === handover.source) handover = null;
    photos.splice(i, 1);
    if (!photos.length) { close(); return; }
    buildStrip();
    show();
  });
  // Auf dem Finger zoomt erst der zweite Tipp.
  const DOUBLE_TAP = 300;
  let lastTap = 0;
  img.addEventListener('pointerup', (e) => {
    if (!hasOriginal(photos[i])) return;
    if (e.pointerType !== 'touch') { setZoom(!zoomed); return; }
    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP) { lastTap = 0; setZoom(!zoomed); }
    else lastTap = now;
  });
  lb.querySelector('.prev')?.addEventListener('click', () => { i--; show(); });
  lb.querySelector('.next')?.addEventListener('click', () => { i++; show(); });
  stage.addEventListener('click', e => { if (e.target === stage) close(); });

  let sx = 0, sy = 0, moved = false;
  stage.addEventListener('touchstart', e => {
    if (zoomed || e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; moved = true;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (!moved || zoomed) return;
    moved = false;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { i += dx < 0 ? 1 : -1; show(); }
  }, { passive: true });

  show();
}

/* ================= Ziehen zum Umsortieren ================= */
// Ein Aufruf fuer Vorschaubilder und Linkzeilen. Pointer-Events statt der
// HTML5-Ziehschnittstelle, damit es auch mit dem Finger funktioniert.
const HOLD_MS = 400;      // Millisekunden, bis der Finger greift
const SWIPE_TOLERANCE = 8;   // bewegt er sich vorher weiter, war es Scrollen

function makeSortable(el, { axis = 'x', selector, onClick, onDrop, ignore, handle }) {
  el.addEventListener('pointerdown', e => {
    if (handle && !e.target.closest(handle)) return;
    if (ignore && e.target.closest(ignore)) return;
    const box = el.parentElement;
    const sx = e.clientX, sy = e.clientY;
    const finger = e.pointerType === 'touch';
    let dragging = false;
    // Auf dem Finger erst nach der Haltezeit; mit der Maus sofort.
    let ready = !finger;
    let keep = null;

    // Solange der Browser das Scrollen noch nicht uebernommen hat, laesst es
    // sich abfangen.
    const stopFixed = (ev) => { if (dragging) ev.preventDefault(); };

    const cleanup = () => {
      clearTimeout(keep);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel);
      document.removeEventListener('touchmove', stopFixed);
    };

    const move = ev => {
      const dist = Math.hypot(ev.clientX - sx, ev.clientY - sy);
      if (!ready) {
        // Bewegung vor Ablauf der Haltezeit: das war ein Wisch, kein Griff.
        if (dist > SWIPE_TOLERANCE) { cleanup(); }
        return;
      }
      if (!dragging && dist < (finger ? 0 : 6)) return;
      if (!dragging) { dragging = true; el.classList.add('dragging'); }
      const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(selector);
      if (over && over !== el && over.parentElement === box) {
        const r = over.getBoundingClientRect();
        const after = axis === 'x'
          ? (ev.clientX - r.left) > r.width / 2
          : (ev.clientY - r.top) > r.height / 2;
        box.insertBefore(el, after ? over.nextSibling : over);
      }
    };

    const cancel = () => { el.classList.remove('handle-ready', 'dragging'); cleanup(); };

    const up = () => {
      const dragged = dragging;
      el.classList.remove('handle-ready');
      cleanup();
      if (!dragged) { onClick && onClick(); return; }
      el.classList.remove('dragging');
      onDrop && onDrop([...box.children]);
    };

    if (finger) {
      keep = setTimeout(() => {
        ready = true;
        // Sichtbare Rueckmeldung: von jetzt an haengt die Zeile am Finger.
        el.classList.add('handle-ready');
        if (navigator.vibrate) navigator.vibrate(12);
        document.addEventListener('touchmove', stopFixed, { passive: false });
      }, HOLD_MS);
    }

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', cancel);
  });
}

/* ================= Verlauf der Tagesnoten ================= */
function sparkline(days) {
  // days kommt absteigend; fuer den Verlauf brauchen wir aufsteigend
  const pts = [...days].reverse();
  if (pts.length < 3) return '';
  const w = 520, h = 46, pad = 5;
  const step = (w - pad * 2) / Math.max(1, pts.length - 1);
  const y = v => h - pad - ((v - 1) / 4) * (h - pad * 2);
  const coords = pts.map((d, i) => [pad + i * step, y(d.rating)]);
  const line = coords.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length-1][0].toFixed(1)},${h - pad} L${pad},${h - pad} Z`;
  // Dieselbe Unterscheidung wie in der Zeitleiste ueber dem Kartenraster --
  // eigene Punkte gefuellt, fremde als Ring.
  const dots = coords.map(([x, yy], i) => pts[i].mine === false
    ? `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="2.4" fill="var(--surface)" stroke="var(--gold)" stroke-width="1.4"/>`
    : `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="2.6" fill="var(--gold)"/>`).join('');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${area}" fill="var(--accent-dim)"/>
    <path d="${line}" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    ${dots}</svg>`;
}

/* ================= Detailansicht ================= */
async function renderDetail(id, termAddress, commentWanted) {
  /* DER BLICK GILT FUER EINEN EINTRAG UND ENDET MIT IHM. */
  GLANCE.clear();
  /* DER BEGRIFF KOMMT AUS DER ADRESSE ODER AUS DEM ZUSTAND -- und danach
     stehen beide gleich. */
  const term = (termAddress || state.search).trim();
  if (term) state.search = term;
  const wanted = entryAddress(id, term, commentWanted);
  if (location.hash !== wanted &&
      typeof history !== 'undefined' && typeof history.replaceState === 'function')
    history.replaceState(null, '', wanted);
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">${tH('list.loading')}</p></div>`;
  let item, cats, allTags;
  try {
    [item, cats, allTags] = await Promise.all([
      api('GET', `/api/items/${id}`), api('GET', '/api/product-categories'), api('GET', '/api/tags')
    ]);
  } catch (e) {
    if (e.message !== SESSION_GONE) {
      app.innerHTML = `<div class="shell">${subhead()}<p class="hint">${tH('server.entryUnknown')}</p></div>`;
      wireSubhead({ term });
    }
    return;
  }
  let idx = 0;
  /* Welche Zeile aufleuchtet -- sie ueberlebt damit jedes Neuzeichnen. */
  LIT_COMMENT = Number(commentWanted) || 0;
  let cropMode = false;   // Klick setzt dann den Fokuspunkt statt Vollbild zu oeffnen
  let linksOpen = false;        // nur fuer diese Ansicht, nicht auf dem Server

  app.innerHTML = `<div class="shell">
    ${subhead()}
    <div class="detail">
      <div>
        <div class="viewer" id="viewer"></div>
        <div class="thumbs" id="thumbs"></div>
        ${/* DER HINWEISTEXT STEHT IN EINEM EIGENEN SPAN. */''}
        <label class="drop" id="drop"><input type="file" id="file" accept="image/*,video/*" multiple><span
          id="drop-text">${tH('entry.addMediaHint')}</span></label>
        ${/* EIN SATZ UND KEIN ABSATZ. */''}
        <p class="hint hint-sm" style="margin:8px 2px 0">
          ${tH('entry.photoOrderHint', { mb: UPLOAD_LIMITS.video })} ${tH('entry.clipboardLarger')}</p>
      </div>

      <div class="meta-col">
        ${/* DER TITELBEREICH TRAEGT SEIT DIESER RUNDE EINEN NAMEN, und der
             Name ist der ganze Zweck: auf einem Telefon steht er VOR dem
             Bild. */''}
        <div class="title-head">
          <div class="title-line">
            ${/* EIN MITWACHSENDES FELD UND KEIN EINZEILIGES. */''}
            <textarea class="title-in" id="title" rows="1">${esc(item.title)}</textarea>
            <button class="pin-btn${item.favorite ? ' on' : ''}" id="pin" title="${esc(item.favorite ? t('entry.unmarkFavorite') : t('entry.markFavorite'))}">${item.favorite ? '★' : '☆'}</button>
          </div>
          <div class="hint hint-sm author-row" id="iauthor" hidden></div>
          <div class="switches" style="margin-top:10px">
            <button class="switch" id="sw-test"><span class="knob"></span><span id="sw-test-t"></span></button>
            <button class="switch" id="sw-rej"><span class="knob"></span><span id="sw-rej-t"></span></button>
          </div>
          ${/* DIE MARKE „abgelehnt" WIRD ZUR AUSSAGE und traegt ihren Verfasser.
               EIGENE ZEILE UNTER DEM SCHALTER: ein Satz im Schalter risse ihn
               bei 120 Prozent Schrift ueber die Zeile. */''}
          <div class="hint hint-sm author-row rej-note" id="rej-badge" hidden></div>
          <div class="row-in rej-reason" id="rej-reason-row" hidden>
            <input class="input input-sm" id="rej-reason" maxlength="200"
                   placeholder="${esc(t('entry.rejectReasonHint'))}" style="padding:8px 11px">
          </div>
        </div>

        <div id="blocks-side">
        <div class="block" data-block="kategorie">
          <div class="block-head"><span class="label">${tH('list.category')}</span></div>
          <div class="row-in">
            ${/* DIE MINDESTBREITE STEHT IM STILBLATT und nicht
                 mehr hier: inline schlug sie jede Regel, auch die des
                 schmalen Schirms, und genau die braucht sie. */''}
            <select class="select select-sm" id="cat" style="padding:9px 11px"></select>
            ${mayCategoryCreate() ? `<input class="input input-sm" id="newcat" placeholder="${esc(t('entry.newCategoryHint'))}" style="padding:8px 11px">
            <button class="btn btn-sm" id="newcat-b">${tH('entry.create')}</button>` : ''}
          </div>
        </div>

        <div class="block" data-block="tags">
          <div class="block-head"><span class="label">${tH('list.tags')}</span></div>
          <div class="chips" id="chips"></div>
          <!-- Diese Liste steht ausserhalb der Eingabezeile: die Tageingabe
               am Testtag benutzt sie, und die bleibt in jedem Fall stehen. -->
          <datalist id="tagsug"></datalist>
          ${mayTagCreate() ? `<div class="row-in">
            <input class="input input-sm" id="newtag" list="tagsug" placeholder="${esc(t('entry.tagInputHint'))}" style="padding:8px 11px">
            <button class="btn btn-sm" id="newtag-b">${tH('entry.add')}</button>
          </div>` : ''}
          <div class="cloud-head"><span class="hint">${tH('entry.tagsHint')}</span>
            <button class="link-btn" id="tagcloud-more" hidden>${tH('list.more')}</button></div>
          <div class="pills cloud" id="tagcloud"></div>
        </div>

        ${/* ZWEI STERNKAESTEN, DIESELBE BAUFORM. */''}
        ${/* DER STERNKASTEN STEHT NUR BEI EINGESCHALTETEM MODUS DA,
             und zwar GAR NICHT ERST GEZEICHNET und nicht bloss eingeklappt. */''}
        ${POTENTIAL_MODE ? `<div class="block" data-block="potenzial">
          <div class="block-head"><span class="label">${esc(V.potential)}</span>
            <span class="hint" id="phead"></span>
            ${ADMIN && multipleUsers() ? `<button class="btn btn-ghost btn-sm" id="pwho">${tH('entry.whoRated')}</button>` : ''}</div>
          <div id="potential-ratings"></div>
        </div>` : ''}

        <div class="block" data-block="bewertung">
          <div class="block-head"><span class="label">${esc(V.ratingOne)}</span>
            <span class="hint" id="rhead"></span>
            ${ADMIN && multipleUsers() ? `<button class="btn btn-ghost btn-sm" id="rwho">${tH('entry.whoRated')}</button>` : ''}</div>
          <div id="ratings"></div>
        </div>
        </div>
      </div>
    </div>

    <div id="blocks-bottom">

    <div class="block block-wide" data-block="beschreibung">
      ${/* DIE VORSCHAU IST EIN BEREICH UND KEIN SCHALTER: sie traegt Links,
           und ein Schalter mit Links darin ist fuer ein Vorleseprogramm
           nicht aufloesbar. */''}
      <div class="block-head"><span class="label">${tH('list.description')}</span>
        <button class="mact ed" id="descedit" title="${esc(t('entry.edit'))}">${ICON_PEN}</button></div>
      <div class="desc-view" id="descview"></div>
      <div class="markup-wrap"><textarea class="ta ta-desc" id="desc" data-markup hidden
        placeholder="${esc(t('entry.whatIsThis'))}">${esc(item.description)}</textarea></div>
    </div>

    <div class="block block-wide" id="testblock" data-block="testtage"></div>

    <div class="block block-wide" data-block="links">
      <div class="block-head"><span class="label">${tH('dialog.links')}</span><span class="hint" id="lcount"></span></div>
      <div class="link-scroll" id="links"></div>
      <button class="link-more" id="links-more" hidden></button>
      <div class="row-in">
        <input class="input input-sm" id="newlink" placeholder="${esc(t('entry.linkInputHint'))}" style="padding:9px 11px">
        <button class="btn btn-sm" id="newlink-b">${tH('entry.add')}</button>
      </div>
    </div>

    <div class="block block-wide" data-block="dateien">
      <div class="block-head"><span class="label">${tH('dialog.files')}</span><span class="hint" id="acount"></span></div>
      <div id="atts"></div>
      <div class="row-in">
        <input type="file" id="afile" multiple hidden>
        <button class="btn btn-sm" id="aadd">${tH('entry.attachFiles')}</button>
        <span class="hint">${tH('entry.fileLimitHint', { mb: UPLOAD_LIMITS.attachment })}</span>
      </div>
    </div>

    <div class="block block-wide" data-block="kommentare">
      ${/* DER SPRUNGKNOPF, und er ist ein Sprung und kein zweites Formular. */''}
      <div class="block-head"><span class="label">${tH('dialog.comments')}</span><span class="hint" id="ccount"></span>
        <button class="link-btn" id="cjump" title="${esc(t('entry.jumpToInput'))}">${tH('entry.addComment')}</button></div>
      <div class="cmts" id="cmts"></div>
      <div class="cmt-form">
        <div class="markup-wrap"><textarea class="ta" id="ctext" data-markup placeholder="${esc(t('entry.commentPlaceholder'))}"></textarea></div>
        <div class="cmt-new-imgs" id="cnew-imgs"></div>
        <div class="cmt-form-row">
          <span class="marks">
            <button class="mark pin" id="cpin" title="${esc(t('entry.pinHint'))}">${ICON_PIN}</button>
            <button class="mark kind" id="ckind"></button>
            <button class="mark task" id="ctask"></button>
          </span>
          <button class="btn btn-sm" id="cimg">${tH('entry.addImage')}</button>
          <button class="btn btn-sm btn-accent" id="cadd">${tH('entry.commentAdd')}</button>
        </div>
      </div>
    </div>
    </div>

    ${/* NUR FUER DEN, DER LOESCHEN DARF. */''}
    ${item.mine === true || ADMIN
      ? `<div class="danger-row"><button class="btn btn-danger btn-sm" id="del">${tH('entry.deleteEntry')}</button></div>`
      : ''}

    ${/* ---- DAS BLAETTERN, AM ENDE DES EINTRAGS ---- HIER UND NICHT IN DER
         KOPFZEILE: zwei Pfeile links und rechts von der Marke behaupten, die
         Marke zu blaettern. */''}
    ${entryNav(id)}
  </div>`;
  wireSubhead({ term });

  /* DIE ZWEI KNOEPFE AM FUSS. */
  document.querySelectorAll('.entry-nav .step').forEach(b => {
    b.onclick = () => {
      const to = b.getAttribute('data-step');
      if (to) location.hash = entryAddress(+to, term);
    };
  });

  /* ---- Fotos ---- */
  /* ---- Ein Foto oder Video entfernen ---- EINE FUNKTION, ZWEI RUFER: der
     Papierkorb ueber dem grossen Bild und der im Vollbild. */
  async function deletePhoto(photo) {
    if (!photo) return false;
    const word = isVideo(photo) ? t('list.video') : t('list.photo');
    if (!await confirmBox(t('entry.deleteWordAsk', { word: word }), t('entry.deleteHint', { word: word }))) return false;
    try {
      await api('DELETE', `/api/photos/${photo.id}`);
      item = await api('GET', `/api/items/${id}`);
      if (idx >= item.photos.length) idx = Math.max(0, item.photos.length - 1);
      drawViewer(); drawThumbs();
      return true;
    } catch (err) { toast(err.message, true); return false; }
  }

  function drawViewer() {
    const v = document.getElementById('viewer');
    /* DIE ANSICHT KANN FORT SEIN. */
    if (!v) return;
    // Der Betrachter bleibt bei jedem Neuzeichnen dasselbe Element; innerHTML
    // ersetzt nur die Kinder.
    /* ALLE FUENF. */
    v.onpointerdown = v.onpointermove = v.onpointerup =
      v.onpointerleave = v.onpointercancel = null;
    v.classList.remove('focus-mode', ...HANDLE_CLASSES);
    // Beim Blaettern anhalten, bevor das Element verschwindet -- sonst spielt
// der Ton der abgeraeumten Zeile noch einen Augenblick weiter.
    v.querySelector('video')?.pause();
    const ps = item.photos;
    if (!ps.length) { v.innerHTML = ICON_PH; return; }
    if (idx >= ps.length) idx = 0;
    if (idx < 0) idx = ps.length - 1;
    /* Am Videoplatz steht der Abspieler -- ausser im Ausschnittmodus. */
    const showsVideo = isVideo(ps[idx]) && !cropMode;
    /* Einmal gerechnet: Schieber und Beschriftung nennen denselben Wert. */
    const zoomPercent = Math.round(Number(ps[idx].zoom) || 100);
    v.innerHTML = (showsVideo
        ? `<video controls playsinline preload="metadata"
             poster="/api/photos/${Number(ps[idx].id)}/raw?size=medium"
             src="/api/photos/${Number(ps[idx].id)}/raw"></video>`
        : `<img src="/api/photos/${Number(ps[idx].id)}/raw?size=medium" alt="" title="${esc(t('entry.clickFullscreen'))}">`) + `
      ${idx === 0 ? `<span class="main-flag">${tH('entry.mainImage')}</span>` : ''}
      ${/* EINE REIHE UND NICHT DREI AUSGERECHNETE ABSTAENDE. */''}
      <div class="vtools${cropMode ? ' open' : ''}">
        <button class="vfocus${cropMode ? ' on' : ''}" title="${esc(t('entry.setCrop'))}"
          aria-label="${esc(t('entry.setCrop'))}">${ICON_CROP}</button>
        ${showsVideo ? `<button class="vfull" title="${esc(t('entry.openFullscreen'))}" aria-label="${esc(t('entry.openFullscreen'))}">${ICON_FULLSCREEN}</button>` : ''}
        <button class="vremove" title="${esc(isVideo(ps[idx]) ? t('list.video') : t('list.photo'))} ${esc(t('entry.delete'))}"
          aria-label="${esc(isVideo(ps[idx]) ? t('list.video') : t('list.photo'))} ${esc(t('entry.delete'))}">${ICON_TRASH}</button>
      </div>
      ${/* DER SCHIEBER STEHT NUR IM AUSSCHNITTMODUS, und er steht IM
           BETRACHTER und nicht in einer eigenen Bedienflaeche daneben: der
           Ausschnitt wird an einem Ort eingestellt, nicht an zweien. */''}
      ${cropMode && !showsVideo ? `<div class="vzoom">
        <label for="vzoom-slider">${tH('entry.zoom')}</label>
        <input type="range" id="vzoom-slider" min="100" max="400" step="5"
          value="${Number(zoomPercent)}" aria-label="${esc(t('entry.cropZoom'))}">
        <span class="vzoom-value" id="vzoom-value">${Number(zoomPercent)} %</span>
      </div>` : ''}
      ${ps.length > 1 ? `<button class="vnav prev" title="${esc(t('list.previous'))}">‹</button>
        <button class="vnav next" title="${esc(t('list.next'))}">›</button>
        <span class="vcount">${Number(idx + 1)} / ${Number(ps.length)}</span>` : ''}`;
    const image = v.querySelector('img');
    /* DAS VOLLBILD BEKOMMT DENSELBEN PAPIERKORB -- eine Funktion, zwei Rufer. */
    const innerPlayer = () => v.querySelector('video');
    if (image) image.onclick = () => {
      if (!cropMode)
        openLightbox([...item.photos], idx, item.title, deletePhoto, innerPlayer);
    };
    v.querySelector('.vfull')?.addEventListener('click',
      () => openLightbox([...item.photos], idx, item.title, deletePhoto, innerPlayer));
    v.querySelector('.vfocus').onclick = () => {
      cropMode = !cropMode;
      drawViewer();
      if (cropMode) toast(t('entry.cropHint'));
    };
    /* GELOESCHT WIRD AM GROSSEN BILD, und das ist der Kern dieser Aenderung.
       Vorher sass ein Kreuz auf jeder Vorschaukachel. */
    v.querySelector('.vremove').onclick = () => deletePhoto(ps[idx]);
    if (cropMode && image) setUpCropOut(v, image, ps[idx]);
    if (ps.length > 1) {
      v.querySelector('.prev').onclick = () => { idx--; drawViewer(); markThumb(); };
      v.querySelector('.next').onclick = () => { idx++; drawViewer(); markThumb(); };
    }
  }

  // Ausschnitt festlegen. Der Rahmen zeigt, was die quadratische Vorschau
// spaeter zeigen wird -- ohne ihn muesste man raten.
  function setUpCropOut(v, image, photo) {
    v.classList.add('focus-mode');
    const frame = document.createElement('div');
    frame.className = 'focus-frame';
    v.appendChild(frame);

    // Das Bild steht mit object-fit:contain im Betrachter; gerechnet wird auf
// dem tatsaechlich sichtbaren Rechteck, nicht auf dem Element.
    const rect = () => {
      const r = image.getBoundingClientRect();
      const nb = image.naturalWidth || 1, nh = image.naturalHeight || 1;
      const m = Math.min(r.width / nb, r.height / nh);
      const b = nb * m, h = nh * m;
      return { links: r.left + (r.width - b) / 2, top: r.top + (r.height - h) / 2, width: b, height: h };
    };

    let fx = Number(photo.focus_x ?? 50), fy = Number(photo.focus_y ?? 50);
    /* DIE WEITE WIRD HIER GEMERKT UND NICHT AM foto GELESEN. */
    let zoom = Number(photo.zoom ?? 100) || 100;

    /* WIE GROSS DER SICHTBARE AUSSCHNITT IST UND WIE WEIT ER WANDERN KANN. */
    const dims = () => {
      const f = rect();
      const k = cropSpecBox(f.width, f.height, fx, fy, zoom);
      return { f, eng: k.edge, links: k.links, top: k.top,
               playX: f.width - k.edge, playY: f.height - k.edge };
    };

    const draw = () => {
      const { f, eng, links, top } = dims();
      const vr = v.getBoundingClientRect();
      frame.style.left = (f.links - vr.left + links) + 'px';
      frame.style.top = (f.top - vr.top + top) + 'px';
      frame.style.width = eng + 'px';
      frame.style.height = eng + 'px';
    };
    draw();
    if (!image.complete) image.onload = draw;

    // Aus der Zeigerposition den Fokuspunkt errechnen: der angeklickte Punkt
// soll in der Mitte des Ausschnitts liegen, soweit das Bild das hergibt.
    const outPoint = (e) => {
      const { f, eng, playX, playY } = dims();
      const px = e.clientX - f.links, py = e.clientY - f.top;
      /* GERECHNET WIRD MIT DEMSELBEN `eng` WIE OBEN. */
      fx = playX > 0 ? Math.min(100, Math.max(0, (px - eng / 2) / playX * 100)) : 50;
      fy = playY > 0 ? Math.min(100, Math.max(0, (py - eng / 2) / playY * 100)) : 50;
      draw();
    };

    /* DIE FUENF GESTEN, und sie sind der Kern dieser Runde. */

    const limited = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
    // Der Rahmen im Bildmass -- dasselbe Rechteck, das `draw()` hinlegt.
    const frameBox = () => { const m = dims(); return { links: m.links, top: m.top, edge: m.eng }; };
    // Zeigerlage im Bildmass. Jede Geste rechnet darin, keine in Bildschirmpunkten.
    const inImage = (e) => { const f = rect(); return { x: e.clientX - f.links, y: e.clientY - f.top }; };

    /* NUR DIE LAGE, OHNE DIE WEITE ANZURUEHREN. */
    const setState = (l, o) => {
      const f = rect();
      const eng = Math.min(f.width, f.height) * 100 / zoom;
      const playX = f.width - eng, playY = f.height - eng;
      fx = playX > 0 ? limited(l / playX * 100, 0, 100) : 50;
      fy = playY > 0 ? limited(o / playY * 100, 0, 100) : 50;
      draw();
    };

    /* WEITE UND LAGE IN EINEM ZUG -- fuer alle Gesten, die die Kante aendern. */
    const setBox = (edgeWanted, situation, cap) => {
      const f = rect();
      const sideLength = Math.min(f.width, f.height);
      const up = Math.max(sideLength / 4, Math.min(sideLength, cap ?? sideLength));
      const k = limited(edgeWanted, sideLength / 4, up);
      zoom = limited(Math.round(sideLength * 100 / k / 5) * 5, 100, 400);
      let narrow = sideLength * 100 / zoom;
      /* UND DIE RASTUNG DARF DEN DECKEL NICHT UEBERSPRINGEN, und
         das ist ein Fund aus der Gegenprobe. */
      if (narrow > up + 1e-9 && zoom < 400) {
        zoom = Math.min(400, zoom + 5);
        narrow = sideLength * 100 / zoom;
      }
      const { l, o } = situation(narrow);
      setState(l, o);
    };

    /* DIE ANKER DER ACHT GRIFFE. Je Geste: welche Ecke oder Kante stillsteht,
       und wohin der Rahmen von dort aus waechst. */
    const dragHandle = (gesture, k, p, f) => {
      const right = k.links + k.edge, bottom = k.top + k.edge;
      const centerX = k.links + k.edge / 2, centerY = k.top + k.edge / 2;
      // Wie weit eine Kante nach beiden Seiten reichen darf, ohne dass die
// Mitte wandert -- die kleinere Haelfte gibt den Deckel.
      const aroundCenter = (m, whole) => 2 * Math.min(m, whole - m);
      switch (gesture) {
        case 'links-oben': return setBox(Math.max(right - p.x, bottom - p.y),
          (e) => ({ l: right - e, o: bottom - e }), Math.min(right, bottom));
        case 'rechts-oben': return setBox(Math.max(p.x - k.links, bottom - p.y),
          (e) => ({ l: k.links, o: bottom - e }), Math.min(f.width - k.links, bottom));
        case 'links-unten': return setBox(Math.max(right - p.x, p.y - k.top),
          (e) => ({ l: right - e, o: k.top }), Math.min(right, f.height - k.top));
        case 'rechts-unten': return setBox(Math.max(p.x - k.links, p.y - k.top),
          (e) => ({ l: k.links, o: k.top }), Math.min(f.width - k.links, f.height - k.top));
        case 'links': return setBox(right - p.x,
          (e) => ({ l: right - e, o: centerY - e / 2 }), Math.min(right, aroundCenter(centerY, f.height)));
        case 'rechts': return setBox(p.x - k.links,
          (e) => ({ l: k.links, o: centerY - e / 2 }), Math.min(f.width - k.links, aroundCenter(centerY, f.height)));
        case 'oben': return setBox(bottom - p.y,
          (e) => ({ l: centerX - e / 2, o: bottom - e }), Math.min(bottom, aroundCenter(centerX, f.width)));
        case 'unten': return setBox(p.y - k.top,
          (e) => ({ l: centerX - e / 2, o: k.top }), Math.min(f.height - k.top, aroundCenter(centerX, f.width)));
      }
    };

    /* EIN NEUES RECHTECK: die laengere Seite des aufgezogenen Rechtecks wird
       die Kante -- der Ausschnitt ist immer ein Quadrat, die Kachel auch --,
       aus der linken oberen Ecke folgt der Punkt. */
    const outRect = (a, e) => {
      const f = rect();
      const x1 = limited(a.x - f.links, 0, f.width), y1 = limited(a.y - f.top, 0, f.height);
      const x2 = limited(e.clientX - f.links, 0, f.width), y2 = limited(e.clientY - f.top, 0, f.height);
      setBox(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)),
        () => ({ l: Math.min(x1, x2), o: Math.min(y1, y2) }));
    };

    // Den Rahmen schieben: die Weite bleibt, der Zeiger behaelt seine Stelle
    // IM Rahmen.
    const shift = (user, e) => {
      const p = inImage(e);
      setState(user.crate.links + (p.x - user.p0.x), user.crate.top + (p.y - user.p0.y));
    };

    /* EIN SPEICHERWEG FUER ALLE GESTEN. */
    const save = async () => {
      try {
        item = await api('PUT', `/api/photos/${photo.id}/focus`, { x: fx, y: fy, zoom });
        drawThumbs();
        toast(t('list.saved'));
      } catch (e) { toast(e.message, true); }
    };
    /* DIE MELDUNG KOMMT AUCH DANN, WENN DIE ANSICHT SCHON FORT IST,
       und das ist die Entscheidung und kein Versehen. */

    /* WAS DER ZEIGER ZEIGT, BEVOR JEMAND DRUECKT. */
    const showHandle = (gesture) => {
      v.classList.remove(...HANDLE_CLASSES);
      const kl = HANDLE_CURSORS[gesture];
      if (kl) v.classList.add(kl);
    };

    /* EIN KLICK BLEIBT EIN KLICK: erst ab sechs Bildpunkten Weg ist es ein
       Zug -- darunter geschieht ausserhalb dasselbe wie bisher (der Punkt
       wird gesetzt) und INNERHALB DES RAHMENS NICHTS (Entscheidung E1). */
    const DISTANCE_MIN = 6;
    let user = null;
    v.onpointerdown = (e) => {
      // Der Schieber gehoert nicht zur Flaeche, auf der gezogen wird -- ohne
      // ihn in dieser Liste setzte jeder Griff an den Schieber zugleich den
      // Fokuspunkt auf die Stelle, an der der Schieber steht.
      if (e.target.closest('.vfocus, .vnav, .vzoom')) return;
      const crate = frameBox(), p0 = inImage(e);
      let gesture = cropGesture(crate, p0.x, p0.y);
      /* AUF DEM FINGER GIBT ES DIE ACHT GRIFFE NICHT (Entscheidung E3): eine
         Zone von zwoelf Bildpunkten trifft keine Fingerkuppe, und ein Weg,
         der auf dem Telefon danebengeht, ist schlechter als keiner. */
      if (e.pointerType === 'touch' && gesture !== 'neu') gesture = 'schieben';
      user = { gesture, x: e.clientX, y: e.clientY, crate, p0, dragged: false };
      v.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };
    const carry = (user, e) => {
      if (user.gesture === 'neu') return outRect({ x: user.x, y: user.y }, e);
      if (user.gesture === 'schieben') return shift(user, e);
      return dragHandle(user.gesture, user.crate, inImage(e), rect());
    };
    v.onpointermove = (e) => {
      if (!user) { const p = inImage(e); showHandle(cropGesture(frameBox(), p.x, p.y)); return; }
      if (!user.dragged && Math.hypot(e.clientX - user.x, e.clientY - user.y) < DISTANCE_MIN) return;
      user.dragged = true;
      carry(user, e);
    };
    v.onpointerleave = () => { if (!user) showHandle('neu'); };
    v.onpointerup = (e) => {
      if (!user) return;
      /* DER LETZTE ZUG GEHT DURCH DENSELBEN WEG WIE JEDER ZWISCHENSCHRITT --
         mit dem Anker vom Anfang der Geste. */
      const prev = user;
      user = null;
      if (prev.dragged) {
        carry(prev, e);
        if (prev.gesture !== 'schieben') showZoom();
        return save();
      }
      // Kein Weg: aussen setzt der Klick den Punkt, innen geschieht nichts.
      if (prev.gesture !== 'neu') return;
      outPoint(e);
      save();
    };
    /* EIN ABGEBROCHENER ZUG SPEICHERT, WAS DASTEHT. */
    v.onpointercancel = () => {
      const dragged = user && user.dragged;
      user = null;
      if (dragged) save();
    };

    /* DER SCHIEBER: `input` zeichnet mit, `change` speichert. */
    const slider = v.querySelector('#vzoom-slider');
    // Nach einem Rechteck zeigt der Schieber den neuen Zoom -- beide Wege
// sagen dieselbe Zahl.
    const showZoom = () => {
      if (!slider) return;
      slider.value = String(zoom);
      const value = v.querySelector('#vzoom-value');
      if (value) value.textContent = `${Math.round(zoom)} %`;
    };
    if (slider) {
      const value = v.querySelector('#vzoom-value');
      slider.oninput = () => {
        zoom = Number(slider.value) || 100;
        if (value) value.textContent = `${Math.round(zoom)} %`;
        draw();
      };
      slider.onchange = save;
    }
  }
  const markThumb = () =>
    document.querySelectorAll('#thumbs .thumb').forEach((k, i) => k.classList.toggle('current', i === idx));

  function drawThumbs() {
    const box = document.getElementById('thumbs');
    // Dieselbe Wache wie im Betrachter, aus demselben Grund: der Streifen
    // wird nach jedem Speichern neu gezeichnet, und gespeichert wird hinter
    // einem await.
    if (!box) return;
    box.innerHTML = '';
    item.photos.forEach((p, i) => {
      const tile = document.createElement('div');
      tile.className = 'thumb' + (i === idx ? ' current' : '') + (isVideo(p) ? ' is-video' : '');
      tile.dataset.pid = p.id;
      // Abgeleitet aus art und dauer, kein Schalter: das ▶ in der Ecke und,
// wenn die Dauer bekannt ist, die Laenge daneben.
      const length = isVideo(p) ? durationText(p.duration) : '';
      const word = isVideo(p) ? t('list.video') : t('list.photo');
      tile.innerHTML = `<img src="${esc(imageSource(p, 'thumb'))}" alt="">` +
        (isVideo(p) ? `<span class="play-badge">▶</span>` : '') +
        (length ? `<span class="duration">${esc(length)}</span>` : '') +
        `<span class="num">${Number(i + 1)}</span><span class="del" title="${esc(t(isVideo(p) ? 'entry.deleteVideo' : 'entry.deletePhoto'))}">${ICON_X}</span>`;
      tile.querySelector('.del').onclick = async (e) => {
        e.stopPropagation();
        if (!await confirmBox(t('entry.deleteWordAsk', { word: word }), t('entry.deleteHint', { word: word }))) return;
        try {
          await api('DELETE', `/api/photos/${p.id}`);
          item = await api('GET', `/api/items/${id}`);
          if (idx >= item.photos.length) idx = Math.max(0, item.photos.length - 1);
          drawViewer(); drawThumbs();
        } catch (err) { toast(err.message, true); }
      };
      makeSortable(tile, {
        axis: 'x', selector: '.thumb', ignore: '.del',
        onClick: () => { idx = [...tile.parentElement.children].indexOf(tile); drawViewer(); markThumb(); },
        onDrop: async (children) => {
          const order = children.map(c => +c.dataset.pid);
          const currentId = item.photos[idx]?.id;
          try {
            item = await api('PUT', `/api/items/${id}/photo-order`, { order });
            idx = Math.max(0, item.photos.findIndex(p2 => p2.id === currentId));
            drawViewer(); drawThumbs();
            toast(t('entry.orderSaved'));
          } catch (err) { toast(err.message, true); }
        }
      });
      box.appendChild(tile);
    });
  }

  // Fotos gehen gebuendelt in einem Vorgang, Videos einzeln: jedes bringt sein
// eigenes Standbild mit, und zwei benannte Felder tragen nur ein Paar.
  async function uploadFiles(files) {
    if (!files.length) return;
    const images = files.filter(f => !/^video\//.test(f.type));
    const videos = files.filter(f => /^video\//.test(f.type));
    /* NUR DER TEXT WANDERT, NICHT DAS FELD. */
    const dropText = document.getElementById('drop-text');
    const old = dropText.textContent;
    dropText.textContent = t('entry.uploading');
    let finished = 0;
    try {
      const bigPhoto = overLimit(images, 'photo'), bigVideo = overLimit(videos, 'video');
      if (bigPhoto) throw new Error(tooBigText(bigPhoto, 'photo'));
      if (bigVideo) throw new Error(tooBigText(bigVideo, 'video'));
      if (images.length) {
        /* IN BUENDELN VON PHOTO_COUNT: multer bricht beim naechsten Bild die
           GANZE Anfrage ab, aus 80 gewaehlten Fotos wuerde sonst keines. Eine
           Obergrenze je Eintrag ist das nicht. */
        for (let at = 0; at < images.length; at += PHOTO_COUNT) {
          const bundle = images.slice(at, at + PHOTO_COUNT);
          const fd = new FormData();
          for (const f of bundle) fd.append('photos', f);
          item = await api('POST', `/api/items/${id}/photos`, fd, true);
          finished += bundle.length;
        }
      }
      for (const f of videos) {
        dropText.textContent = t('entry.thumbBuilding');
        const { image, duration } = await stillFrame(f);
        dropText.textContent = t('entry.uploading');
        const fd = new FormData();
        fd.append('video', f, f.name);
        fd.append('stillFrame', image, 'stillframe.jpg');
        if (duration) fd.append('duration', String(duration));
        item = await api('POST', `/api/items/${id}/videos`, fd, true);
        finished++;
      }
      drawViewer(); drawThumbs();
      /* „1 Foto", „1 Video", sonst „3 Dateien" -- „Element" sagt niemand. */
      if (finished) toast(t('entry.added', { count: finished,
        what: counted(finished, videos.length ? t('list.video') : t('list.photo'),
          videos.length ? (images.length ? t('dialog.files') : t('list.videos')) : t('list.photos')) }));
    } catch (err) {
      toast(err.message, true);
      // Was schon durchging, ist durch -- die Anzeige muss es zeigen.
      if (finished) { drawViewer(); drawThumbs(); }
    }
    dropText.textContent = old;
  }

  document.getElementById('file').onchange = e => { uploadFiles([...e.target.files]); e.target.value = ''; };

  // Bilder aus der Zwischenablage — spart bei Bildschirmfotos den Umweg ueber eine Datei
  const onPaste = (e) => {
    const mark = document.activeElement?.tagName;
    if (mark === 'INPUT' || mark === 'TEXTAREA') return;
    const files = [...(e.clipboardData?.files || [])].filter(f => /^image\//.test(f.type));
    if (!files.length) return;
    e.preventDefault();
    uploadFiles(files);
  };
  document.addEventListener('paste', onPaste);

  // Ablegen per Maus direkt auf das Feld
  const drop = document.getElementById('drop');
  ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => uploadFiles([...(e.dataTransfer?.files || [])]
    .filter(f => /^image\//.test(f.type) || /^video\//.test(f.type))));

  // Pfeiltasten blaettern, aber nicht waehrend getippt wird und nicht bei offenem Vollbild
  const keyNav = e => {
    const mark = document.activeElement?.tagName;
    if (mark === 'INPUT' || mark === 'TEXTAREA' || mark === 'SELECT') return;
    if (document.querySelector('.backdrop') || lightboxOpen) return;
    if (!item.photos.length) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); idx--; drawViewer(); markThumb(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); idx++; drawViewer(); markThumb(); }
  };
  document.addEventListener('keydown', keyNav);
  window.addEventListener('hashchange', () => {
    document.removeEventListener('keydown', keyNav);
    document.removeEventListener('paste', onPaste);
  }, { once: true });

  /* WISCHEN BLAETTERT, wie im Vollbild und mit denselben Massen (45 Pixel
     waagerecht, und waagerecht muss deutlicher sein als senkrecht). */
  const stage = document.getElementById('viewer');
  const SWIPE_DISTANCE = 45;
  let swipeX = 0, swipeY = 0, swipes = false;
  stage.addEventListener('touchstart', e => {
    if (cropMode || e.touches.length !== 1 || item.photos.length < 2) return;
    /* NICHT AUF DEM ABSPIELER. */
    if (e.target.closest('video')) return;
    swipeX = e.touches[0].clientX; swipeY = e.touches[0].clientY; swipes = true;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (!swipes || cropMode) return;
    swipes = false;
    const dx = e.changedTouches[0].clientX - swipeX;
    const dy = e.changedTouches[0].clientY - swipeY;
    if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
      idx += dx < 0 ? 1 : -1;
      drawViewer(); markThumb();
    }
  }, { passive: true });

  /* ---- Schalter ---- */
  function drawSwitches() {
    const toggle = document.getElementById('sw-test'), r = document.getElementById('sw-rej');
    const locked = item.testDays.length > 0;
    toggle.className = 'switch' + (item.tested ? ' on-green' : '') + (locked ? ' locked' : '');
    toggle.title = locked ? t('entry.lockedByDays') : '';
    document.getElementById('sw-test-t').textContent = item.tested ? V.testedYes : V.testedNo;
    r.className = 'switch' + (item.rejected ? ' on-red' : '');
    document.getElementById('sw-rej-t').textContent = item.rejected ? t('list.rejected') : t('list.notRejected');
    drawRejection();
  }

  /* DIE AUSSAGE ZUR ABLEHNUNG -- Datum, Verfasser und Grund, und JEDES DER
     DREI DARF FEHLEN. */
  /* OB JEMAND DAS FELD AUSDRUECKLICH GEOEFFNET HAT, ist Ansichtszustand und
     gehoert nicht in `item`: eine Antwort des Servers, die es mitbraechte,
     waere eine Auskunft ueber ein Fenster. */
  let reasonOpen = false;

  function drawRejection() {
    const mark = document.getElementById('rej-badge');
    const row = document.getElementById('rej-reason-row');
    const field = document.getElementById('rej-reason');
    if (!mark || !row || !field) return;

    /* WER WAS DARF, KOMMT VOM SERVER UND WIRD NICHT ZURUECKGERECHNET -- diese
       Seite kennt ihren NAMEN (`NAME`), nicht ihre Nummer, und aus einem
       Grabstein liesse sich ohnehin nichts holen. */
    const may = item.mine === true || ADMIN;
    const mine = may && (item.rejectedMine === true || !item.rejectedAuthor);
    const manage = may;
    const reason = (item.rejected_reason || '').trim();

    /* WANN DAS FELD DASTEHT -- die Regel aus dem Betrieb, 29. August 2026:
       ABGELEHNT UND KEIN GRUND. */
    const open = item.rejected && mine && (!reason || reasonOpen);
    if (!open) reasonOpen = false;
    row.hidden = !open;
    // Der Vorschlag zum Ueberschreiben: beim Oeffnen steht die alte
    // Begruendung im Feld.
    if (open && document.activeElement !== field) field.value = item.rejected_reason || '';

    const parts = [];
    if (item.rejected_at) parts.push(`am ${fmtDate(item.rejected_at)}`);
    if (item.rejectedAuthor && multipleUsers())
      parts.push(`von ${authorName(item.rejectedAuthor)}`);
    const head = parts.length ? t('entry.rejectedBy', { what: parts.join(' ') }) : '';

    /* DAS ✎ STEHT AUCH OHNE BEGRUENDUNG DA. */
    const showPen = item.rejected && mine;
    const showPath = item.rejected && manage && !!reason;
    /* WAEHREND GESCHRIEBEN WIRD, TRITT DIE AUSSAGE ZURUECK: das Feld IST in
       diesem Augenblick die Aussage, und beides nebeneinander waere genau die
       Doppelung, die dieser Ruhezustand aufloest. */
    mark.hidden = !item.rejected || open || (!head && !reason && !showPen);
    mark.innerHTML = '';
    const text = document.createElement('span');
    text.className = 'rej-text';
    if (head) text.appendChild(document.createTextNode(reason ? `${head} — ` : head));
    if (reason) {
      /* DER GRUND IST DIE ENTSCHEIDUNG UND BEKOMMT DAS ROT DES SCHALTERS;
         Datum und Name bleiben grau. */
      const w = document.createElement('span');
      w.className = 'rej-why' + (mine ? ' clickable' : '');
      w.textContent = reason;
      if (mine) { w.title = t('entry.reasonEdit'); w.onclick = openReason; }
      text.appendChild(w);
    }
    mark.appendChild(text);

    // Dieselbe Bauform, dieselben Klassen, dieselben Zeichen wie am Kommentar.
// Eine zweite Bauform fuer dasselbe waere eine zweite Wahrheit.
    const acts = document.createElement('span');
    acts.className = 'acts';
    if (showPen) {
      const b = document.createElement('button');
      b.className = 'mact ed'; b.innerHTML = ICON_PEN;
      b.title = reason ? t('entry.reasonEdit') : t('entry.reasonWrite');
      b.onclick = openReason;
      acts.appendChild(b);
    }
    if (showPath) {
      const b = document.createElement('button');
      b.className = 'mact rm'; b.innerHTML = ICON_X;
      b.title = t('entry.reasonRemove');
      b.onclick = removeReason;
      acts.appendChild(b);
    }
    mark.appendChild(acts);
  }

  /* AUSDRUECKLICH AUFMACHEN -- fuer den einen Fall, den die Regel nicht schon
     abdeckt: es steht ein Grund da, und er soll geaendert werden. */
  function openReason() {
    reasonOpen = true;
    drawRejection();
    const field = document.getElementById('rej-reason');
    if (field) field.focus();
  }

  /* DAS ENTFERNEN GEHT ALS LEERER GRUND HINAUS, und der Server macht daraus
     ein Entfernen: leer nach reasonText() heisst wegnehmen und laeuft ueber
     darfAendern, alles andere ueber nurSelbst. */
  async function removeReason() {
    if (!await confirmBox(t('entry.reasonDeleteAsk'),
      t('entry.reasonDeleteHint'))) return;
    try {
      item = await api('PUT', `/api/items/${id}`, { rejectedReason: '' });
      reasonOpen = false; drawSwitches(); toast(t('entry.reasonRemoved'));
    } catch (e) { toast(e.message, true); }
  }
  document.getElementById('sw-test').onclick = async () => {
    try {
      item = await api('PUT', `/api/items/${id}`, { tested: !item.tested });
      /* DER SCHALTER LEERT DEN BLICK. */
      GLANCE.clear();
      drawSwitches(); drawTestDays(); drawRatings();
    }
    catch (e) { toast(e.message, true); }   // Sperre wird serverseitig begruendet
  };
  document.getElementById('sw-rej').onclick = async () => {
    /* BEIM EINSCHALTEN GEHT DIE ALTE BEGRUENDUNG MIT HINAUS. */
    const core = item.rejected
      ? { rejected: false }
      : { rejected: true, rejectedReason: item.rejected_reason || '' };
    try {
      item = await api('PUT', `/api/items/${id}`, core);
      /* BEIM EINSCHALTEN STEHT DAS FELD OFFEN, WENN KEIN GRUND DASTEHT -- und
         das entscheidet die Regel in drawRejection() und nicht
         dieser Klick. */
      reasonOpen = false;
      drawSwitches();
      const f = document.getElementById('rej-reason');
      if (f && !document.getElementById('rej-reason-row').hidden) f.focus();
    }
    catch (e) { toast(e.message, true); }
  };
  /* Der Grund wird beim Verlassen des Feldes gespeichert, wie Titel und
     Beschreibung daneben -- und mit Enter, weil es eine EINZELNE Zeile ist
     und dort kein Zeilenumbruch im Weg steht. */
  {
    const field = document.getElementById('rej-reason');
    const save = async () => {
      const v = field.value.trim();
      if (v !== (item.rejected_reason || '')) {
        try { item = await api('PUT', `/api/items/${id}`, { rejectedReason: v }); toast(t('list.saved')); }
        catch (e) { toast(e.message, true); field.value = item.rejected_reason || ''; }
      }
      reasonOpen = false;
      drawSwitches();
    };
    field.onblur = save;
    /* ESCAPE SETZT DAS FELD ZURUECK, BEVOR ES SCHLIESST: das Schliessen nimmt
       dem Feld den Zeiger, das loest onblur aus, und save() schriebe sonst
       genau das weg, was gerade verworfen werden sollte. */
    field.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); field.blur(); }
      else if (e.key === 'Escape') {
        e.preventDefault();
        field.value = item.rejected_reason || '';
        reasonOpen = false;
        drawRejection();
      }
    });
  }
  /* Den Knopf NICHT aus dem Ereignis holen: e.currentTarget ist nur waehrend
     der Zustellung gesetzt und steht nach dem ersten await auf null. */
  function drawPin() {
    const b = document.getElementById('pin');
    if (!b) return;
    b.className = 'pin-btn' + (item.favorite ? ' on' : '');
    b.textContent = item.favorite ? '★' : '☆';
    // Der Ueberfahrtext gehoert mit gezeichnet: er benennt die naechste
    // Handlung, nicht das Merkmal -- bliebe er stehen, boete ein gesetzter
    // Favorit weiterhin "Als Favorit markieren" an.
    b.title = item.favorite ? t('entry.unmarkFavorite') : t('entry.markFavorite');
  }
  document.getElementById('pin').onclick = async () => {
    try {
      item = await api('PUT', `/api/items/${id}`, { favorite: !item.favorite });
      drawPin();
    } catch (err) { toast(err.message, true); }
  };

  /* ---- Texte ---- */
  const titleEl = document.getElementById('title');
  /* EIN TITEL HAT KEINE ZEILEN. */
  titleEl.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } };
  const titleFit = autoGrow(titleEl);
  titleEl.onblur = async () => {
    const v = titleEl.value.replace(/[\r\n]+/g, ' ').trim();
    if (titleEl.value !== v) { titleEl.value = v; titleFit(); }
    if (!v || v === item.title) return;
    try { item = await api('PUT', `/api/items/${id}`, { title: v }); toast(t('list.saved')); }
    catch (e) { toast(e.message, true); }
  };
  /* ---- Die Beschreibung: zwei Wege in den Schreibmodus ---- */
  const descEl = document.getElementById('desc');
  const descView = document.getElementById('descview');
  const descFit = autoGrow(descEl);
  function drawDesc() {
    descView.replaceChildren();
    if (!item.description) {
      const hint = document.createElement('span');
      hint.className = 'hint';
      hint.textContent = t('entry.whatIsThis');
      descView.appendChild(hint);
      return;
    }
    const missing = markupRefMissing([item.description]);
    if (missing.length) markupRefLoad(missing).then(came => { if (came) drawDesc(); });
    descView.appendChild(markupNodes(item.description, term, []));
  }
  function descWrite(on) {
    descView.hidden = on;
    descEl.hidden = !on;
    if (!on) return drawDesc();
    descEl.value = item.description;
    descEl.focus();
    descFit();
  }
  document.getElementById('descedit').onclick = () => { openBlock('beschreibung'); descWrite(true); };
  descView.onclick = (e) => {
    if (e.target.closest('a')) return;
    /* WER TEXT MARKIERT, WILL ZITIEREN UND NICHT SCHREIBEN: das Umschalten
       naehme ihm die Auswahl und damit das Menue im Lesemodus. */
    const picked = document.getSelection();
    if (picked && !picked.isCollapsed) return;
    descWrite(true);
  };
  // Escape verwirft und stellt den zuletzt gespeicherten Text her.
  descEl.onkeydown = (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    /* ERST DEN TEXT ZURUECKNEHMEN, DANN UMSCHALTEN: das Verstecken nimmt dem
       Feld den Fokus, und `focusout` speicherte sonst das Verworfene. */
    descEl.value = item.description;
    descWrite(false);
  };
  /* Statt einer geratenen Frist entscheidet das Ziel: liegt es im Menue,
     schreibt gerade jemand eine Marke. */
  descEl.addEventListener('focusout', async (e) => {
    if (e.relatedTarget && e.relatedTarget.closest('.markup-menu')) return;
    const value = descEl.value;
    descWrite(false);
    if (value === item.description) return;
    try { item = await api('PUT', `/api/items/${id}`, { description: value }); drawDesc(); toast(t('list.saved')); }
    catch (err) {
      /* Was nicht gespeichert ist, bleibt im Feld stehen -- die Vorschau
         zeigte sonst den alten Text und der neue waere still fort. */
      descWrite(true);
      descEl.value = value;
      toast(err.message, true);
    }
  });
  drawDesc();

  /* ---- Kategorie ---- */
  /* ---- Wer den Eintrag angelegt hat, und wann ---- Bei genau einem aktiven
     Zugang bleibt die Zeile weg -- "Angelegt von mir" ist keine Information,
     und dann ist auch das Datum keine: es steht schon in der Sortierung. */
  function drawAuthor() {
    const el = document.getElementById('iauthor');
    if (!el) return;
    el.hidden = !multipleUsers();
    el.textContent = multipleUsers()
      ? t('entry.createdByOn', { author: authorName(item.author), created_at: fmtDate(item.created_at) }) : '';
  }

  function drawCat() {
    const s = document.getElementById('cat');
    s.innerHTML = `<option value="">${tH('entry.none')}</option>` + cats.map(c =>
      `<option value="${Number(c.id)}"${item.category && item.category.id === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
    s.onchange = async () => {
      try { item = await api('PUT', `/api/items/${id}`, { productCategoryId: s.value ? +s.value : null }); toast(t('list.saved')); }
      catch (e) { toast(e.message, true); }
    };
    setUpBlocksOut(item);
  }
  const addCat = async () => {
    const el = document.getElementById('newcat');
    const name = el.value.trim();
    if (!name) return;
    try {
      const c = await api('POST', '/api/product-categories', { name });
      item = await api('PUT', `/api/items/${id}`, { productCategoryId: c.id });
      cats = await api('GET', '/api/product-categories');
      el.value = ''; drawCat(); toast(t('list.saved'));
    } catch (e) { toast(e.message, true); }
  };
  // Die Behandler haengen nur an tatsaechlich vorhandenen Elementen: steht der
// Schalter auf aus, gibt es die Anlegezeile gar nicht.
  const newcatEl = document.getElementById('newcat');
  if (newcatEl) {
    document.getElementById('newcat-b').onclick = addCat;
    newcatEl.addEventListener('keydown', e => { if (e.key === 'Enter') addCat(); });
  }

  /* ---- Tags ---- */
  function drawTags() {
    const box = document.getElementById('chips');
    // Kein Hinweis, solange die Wolke darunter leer ist: „Noch keine Tags."
// direkt ueber „Noch keine Tags angelegt." war derselbe Satz zweimal.
    box.innerHTML = item.tags.length || !allTags.length ? '' : `<span class="hint">${tH('entry.noTagsYet')}</span>`;
    item.tags.forEach(tag => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.innerHTML = `${esc(tag.name)} <button title="${esc(t('entry.remove'))}">${ICON_X}</button>`;
      c.querySelector('button').onclick = async () => {
        try { item = await api('DELETE', `/api/items/${id}/tags/${tag.id}`); drawTags(); }
        catch (e) { toast(e.message, true); }
      };
      box.appendChild(c);
    });
    document.getElementById('tagsug').innerHTML = allTags.map(tag => `<option value="${esc(tag.name)}">`).join('');
    drawCloud();
    setUpBlocksOut(item);
  }

  // Wolke aller vorhandenen Tags.
  function drawCloud() {
    const box = document.getElementById('tagcloud');
    const more = document.getElementById('tagcloud-more');
    if (!box) return;
    const assigned = new Set(item.tags.map(tag => tag.id));
    const list = sortCloud(allTags, assigned);
    box.innerHTML = '';
    if (!list.length) { box.innerHTML = `<span class="hint">${tH('entry.noTagsCreated')}</span>`; more.hidden = true; return; }
    list.forEach(tag => {
      const b = document.createElement('button');
      b.className = 'pill pill-tag' + (assigned.has(tag.id) ? ' on' : '');
      b.innerHTML = `${esc(tag.name)}<span class="n">${Number(tag.usage_count)}</span>`;
      b.title = assigned.has(tag.id) ? t('entry.removeTag') : t('entry.setTag');
      b.onclick = async () => {
        try {
          item = assigned.has(tag.id)
            ? await api('DELETE', `/api/items/${id}/tags/${tag.id}`)
            : await api('POST', `/api/items/${id}/tags`, { name: tag.name });
          await loadTagList();
        } catch (e) { toast(e.message, true); }
      };
      box.appendChild(b);
    });
    const trimmed = limitCloud(box, cloudOpen.detail ? 0 : 3);
    more.hidden = !trimmed && !cloudOpen.detail;
    more.textContent = cloudOpen.detail ? t('list.less') : t('list.more');
    more.onclick = () => { cloudOpen.detail = !cloudOpen.detail; drawCloud(); };
  }

  async function loadTagList() {
    allTags = await api('GET', '/api/tags');
    drawTags(); drawTestDays();
  }

  const addTag = async () => {
    const el = document.getElementById('newtag');
    const name = el.value.trim();
    if (!name) return;
    try {
      item = await api('POST', `/api/items/${id}/tags`, { name });
      el.value = '';
      await loadTagList();
    } catch (e) { toast(e.message, true); }
  };
  const newtagEl = document.getElementById('newtag');
  if (newtagEl) {
    document.getElementById('newtag-b').onclick = addTag;
    newtagEl.addEventListener('keydown', e => { if (e.key === 'Enter') addTag(); });
  }

  /* ---- Die beiden Sternkaesten ---- EIN ZEICHNER MIT EINER PHASE, NICHT
     ZWEI ZEICHNER. */
  const BOXES = [
    { phase: 'after', box: 'ratings',           head: 'rhead', button: 'weight-open',
      actor: 'rwho', average: 'avgRating',       removed: 'calc' },
    { phase: 'before',  box: 'potential-ratings', head: 'phead', button: 'pweight-open',
      actor: 'pwho', average: 'potentialRating', removed: 'potentialCalc' }
  ];

  function drawRatings() { for (const k of BOXES) drawBox(k); setUpBlocksOut(item); }

  function drawBox(boxId) {
    const box = document.getElementById(boxId.box);
    if (!box) return;
    const rows = item.ratings.filter(r => r.phase === boxId.phase);
    /* DER KASTEN IST DAS RASTER, nicht die einzelne Zeile: eine Spalte kann
       sich nur dann an ihrer breitesten Zelle ausrichten, wenn alle Zellen im
       SELBEN Raster liegen. */
    const withAverage = multipleUsers();
    box.className = 'rlist' + (withAverage ? '' : ' no-average');
    // Angelegt wird im Systembereich: ein neues Kriterium erscheint an JEDEM
    // Eintrag, das ist eine redaktionelle Entscheidung und keine Notiz am
    // Eintrag.
    box.innerHTML = rows.length ? ''
      : `<span class="hint">${ADMIN
          ? tH('entry.noCriteriaHint')
          : tH('entry.noCriteriaYet')}</span>`;
    // Die Kopfzahl neben der Beschriftung: erst je Kriterium ueber alle, dann
    // ueber die Kriterien -- also genau das Mittel der Zahlen, die rechts in
    // den Zeilen stehen.
    const head = document.getElementById(boxId.head);
    /* DAS WORT "gewichtet" IST ABGELEITET, kein Schalter und keine
       Einstellung -- dieselbe Bauform wie die Durchschnittsspalte, die bei
       einem einzigen Zugang entfaellt. */
    const weightedCalc = rows
      .some(r => (r.value > 0 || r.avg != null) && Number(r.weight) !== 1);
    /* DIE KOPFZAHL IST EIN KNOPF, und er fuehrt zur eigenen
       Rechnung dieses Eintrags. */
    const averageValue = item[boxId.average];
    if (head) {
      head.textContent = '';
      if (averageValue) {
        const b = document.createElement('button');
        b.className = 'link-btn weight-open';
        b.id = boxId.button;
        /* DAS WORT KOMMT AUS DER SPRACHDATEI. */
        b.textContent = '⌀ ' + number(averageValue, 1) +
          (weightedCalc ? ' ' + t('entry.weighted') : '');
        /* DER TITEL SAGT, WESSEN ZAHL DAS IST. */
        b.title = t('entry.avgAllHint');
        // DER ERKLAERKNOPF BEKOMMT DEN RECHENWEG SEINES KASTENS.
        b.onclick = () => showCalc(boxId);
        head.appendChild(b);
      }
    }
    rows.forEach(r => {
      const row = document.createElement('div');
      row.className = 'rrow';
      const n = document.createElement('span');
      n.className = 'rname'; n.textContent = r.name;
      // Die Marke ×1,5 hinter dem Namen.
      const mark = weightMark(r.weight);
      if (mark) {
        const m = document.createElement('span');
        m.className = 'rweight'; m.textContent = mark;
        m.title = t('list.weightedAvg');
        n.append(' ', m);
      }
      const acts = document.createElement('div');
      acts.className = 'racts';
      const set = v => enqueue(async () => {
        try { item = await api('PUT', `/api/items/${id}/ratings`, { criterionId: r.criterion_id, value: v }); drawRatings(); }
        catch (err) { toast(err.message, true); }
      });
      /* DAS ZURUECKSETZEN GEHT UEBER `PUT` MIT 0 und nicht ueber einen
         eigenen Weg: `Math.max(0, ...)` im Server nimmt die Null seit jeher
         an, und eine Zeile mit 0 ist keine Stimme. */
      const s = stars(r.value, set);
      const back = resetButton(r.value, () => {
        const old = r.value;
        set(0);
        toast(t('entry.starsRemoved', { name: r.name }), false, { text: t('entry.undo'), tu: () => set(old) });
      });
      // Kein Loeschkreuz in dieser Zeile.
      acts.append(s);
      // Rechts der Schnitt ueber alle und die Zahl der Bewerter, gedaempft.
      row.append(n, acts);
      /* DIE DURCHSCHNITTSSPALTE IST EINE RASTERZELLE UND HAENGT DESHALB AN
         DER ZEILE, nicht in .racts. */
      if (withAverage) {
        const a = document.createElement('span');
        a.className = 'ravg';
        /* DIESELBE FORM WIE DIE KOPFZAHL DARUEBER, die bereits "⌀ 4,2
           gewichtet" schreibt: das ⌀ ist die Hausform, die Klammer sagt "so
           viele Stimmen". */
        if (r.avg) {
          const votes = `${r.count} ${vRating(r.count)}`;
          const average = number(r.avg, 1);
          /* DIE KLAMMER ERST AB ZWEI. */
          a.textContent = r.count > 1 ? `⌀ ${average} (${r.count})` : `⌀ ${average}`;
          a.title = t('entry.avgOf', { average: average, votes: votes });
        } else {
          /* EIN STRICH, SOLANGE NIEMAND BEWERTET HAT. */
          a.textContent = '–';
          a.title = t('entry.notRatedYet');
        }
        row.append(a);
      }
      /* DIE LETZTE ZELLE DER ZEILE, IN JEDER LAGE: der Ruecksetzknopf in
         seiner eigenen Rasterspalte -- steckte er in der Zelle der Zahl,
         wanderte die Zahl, sobald eine Zeile keinen Knopf traegt. */
      const zz = document.createElement('span');
      zz.className = 'rreset-cell';
      zz.appendChild(back);
      row.append(zz);
      box.appendChild(row);
      /* HIER STEHT AUSDRÜCKLICH KEINE STIMMENLISTE. */
    });
  }
  /* ---- „Stimmen": die Ansicht des Admins ---- Sie hiess frueher „Wer hat
     bewertet". */
  /* ---- Die eigene Rechnung hinter der Kopfzahl ---- DER KASTEN
     LIEST DIE VORHANDENE RECHNUNG, ER RECHNET NICHT NACH. */
  const weightNumber = (n) => {
    const z = Math.round(Number(n) * 100) / 100;
    return number(z, 0, 2);
  };

  /* MIT DEM KASTEN ALS ARGUMENT. */
  function showCalc(boxId) {
    const removed = item[boxId.removed];
    // Ohne Aufstellung kein Kasten. Sie fehlt nur, wenn nichts bewertet ist --
// dann steht aber auch keine Kopfzahl da, an der man klicken koennte.
    if (!removed || !Array.isArray(removed.rows) || !removed.rows.length)
      return toast(t('entry.nothingRatedYet'), true);
    const names = new Map(item.ratings.map(r => [r.criterion_id, r.name]));
    const withWeight = removed.rows.some(z => Number(z.weight) !== 1);
    /* OB DIE GEWICHTUNG UEBERHAUPT ETWAS AENDERT. */
    const sameNumber = Number(removed.equalResult) === Number(removed.result);
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal calc-modal" id="calc-modal">
      <h2>${tH('entry.calcHowAvg', { avg: weightNumber(removed.result) })}</h2>
      ${/* DER VERWEIS ZEIGT IN DEN KASTEN UND NICHT AUS IHM HINAUS. */''}
      ${/* „UEBER ALLE BENUTZER". */''}
      <p>${tH('entry.calcStepsHint',
          { extra: withWeight ? t('entry.calcWithWeight') : t('entry.calcAllEqual') })}</p>
      <div class="calc" id="calc">
        <div class="calc-row calc-head"><span>${tH('entry.criterion')}</span><span>${tH('entry.grade')}</span><span>${tH('entry.weight')}</span><span>${tH('entry.calcGradeWeight')}</span></div>
        ${/* DIE LETZTE KRITERIENZEILE HEISST SO. Sie zieht den
             Strich vor den Summen; das Stilblatt faerbt ihn dort staerker. */''}
        ${removed.rows.map((z, i) => `<div class="calc-row${i === removed.rows.length - 1 ? ' calc-last' : ''}" data-krit="${Number(z.criterionId)}">
          <span class="calc-name">${esc(names.get(z.criterionId) || '—')}</span>
          <span>${esc(weightNumber(z.average))}</span>
          <span>× ${esc(weightNumber(z.weight))}</span>
          <span>${esc(weightNumber(z.product))}</span></div>`).join('')}
        <div class="calc-row calc-sum"><span>${tH('entry.sum')}</span><span></span><span></span>
          <span id="calc-sum">${esc(weightNumber(removed.sum))}</span></div>
        <div class="calc-row calc-sum"><span>${tH('entry.calcDividedBy')}</span><span></span><span></span>
          <span id="calc-divisor">${esc(weightNumber(removed.divisor))}</span></div>
        <div class="calc-row calc-result"><span>${tH('entry.result')}</span><span></span><span></span>
          <span id="calc-result">⌀ ${esc(weightNumber(removed.result))}</span></div>
        ${/* DIE VERGLEICHSZAHL. Die Formel stand Zeile fuer Zeile
             da und liess trotzdem offen, WOFUER die Gewichte gut sind. */''}
        ${withWeight ? `<div class="calc-row calc-same"><span>${tH('entry.calcNoWeights')}</span>
          <span></span><span></span>
          <span id="calc-same">⌀ ${esc(weightNumber(removed.equalResult))}</span></div>` : ''}
      </div>
      ${/* ZWEI ABSAETZE UNTER DER TABELLE UND NICHT DREI. Bei
           sieben Kriterien lief der Kasten ueber `88dvh` hinaus und rollte. */''}
      ${/* ZWEI SAETZE FUER JEDEN, DER DRITTE NUR FUER DEN ADMIN. */''}
      <p>${tH('entry.calcRoundingHint')}${ADMIN ? ` ${tH('entry.weightsWhere', {
        criteria: boxId.phase === 'before' ? t('entry.criteriaPotential') : t('entry.criteriaRating') })}` : ''}</p>
      ${/* WAS DIE GEWICHTUNG AENDERT, IN EINEM SATZ. */''}
      ${withWeight ? (sameNumber
        ? `<p id="calc-same-note">${tH('entry.calcNoChange', { avg: weightNumber(removed.result) })}</p>`
        : `<p id="calc-same-note">${tH('entry.calcIfEqual', {
            equal: weightNumber(removed.equalResult), result: weightNumber(removed.result) })}
            <strong>${tH('entry.calcDifference')}</strong></p>`) : ''}
      <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('list.close')}</button></div></div>`;
    document.body.appendChild(bd);
    const zu = () => { bd.remove(); document.removeEventListener('keydown', onKey, true); };
    /* Escape schliesst nur den OBERSTEN Dialog -- dieselbe Regel wie bei
       „Wer hat bewertet" und den Grabsteinen. */
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if ([...document.querySelectorAll('.backdrop')].pop() !== bd) return;
      zu();
    };
    document.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-no]').onclick = zu;
    bd.onclick = e => { if (e.target === bd) zu(); };
  }

  /* MIT DEM KASTEN ALS ARGUMENT, wie die Rechnung darueber. */
  async function showMatch(boxId) {
    let list;
    try { list = await api('GET', `/api/items/${id}/votes`); }
    catch (e) { return toast(e.message, true); }
    const title = t('entry.whoRatedWord',
      { word: boxId.phase === 'before' ? V.potential : V.ratingOne });
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal" id="votes-modal"><h2>${esc(title)}</h2>
      <p>${tH('entry.adminOnlyHint')}</p>
      <div class="vote-list" id="vote-list"></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('list.close')}</button></div></div>`;
    document.body.appendChild(bd);
    const zu = () => { bd.remove(); document.removeEventListener('keydown', onKey, true); };
    // NUR DER OBERSTE DIALOG SCHLIESST.
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if ([...document.querySelectorAll('.backdrop')].pop() !== bd) return;
      zu();
    };
    document.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-no]').onclick = zu;
    bd.onclick = e => { if (e.target === bd) zu(); };
    drawMatch();

    function drawMatch() {
      const box = bd.querySelector('#vote-list');
      box.innerHTML = '';
      const per = new Map(list.map(z => [z.criterion_id, z.votes]));
      // Reihenfolge und Name kommen aus dem Eintrag: der Endpunkt liefert nur
      // Nummern, Werte und Verfasser.
      let something = false;
      // NUR DIE ZEILEN DIESES KASTENS.
      item.ratings.filter(r => r.phase === boxId.phase).forEach(r => {
        const votes = per.get(r.criterion_id) || [];
        // Ein Kriterium ohne Stimme bekommt gar keine Zeile -- eine leere
// Liste unter einem Namen sagt nichts.
        if (!votes.length) return;
        something = true;
        const row = document.createElement('div');
        row.className = 'vote-row';
        const n = document.createElement('span');
        n.className = 'rname'; n.textContent = r.name;
        const actor = document.createElement('div');
        actor.className = 'rvotes';
        votes.forEach(st => {
          const s2 = document.createElement('span');
          s2.className = 'rvote' + (st.mine ? ' mine' : '');
          s2.appendChild(document.createTextNode(`${authorName(st.author)} ${st.value}`));
          /* Das ✕ steht nur am FREMDEN Wert — den eigenen räumt man mit dem
             Doppelklick auf den Stern weg, und zwei Wege für dieselbe Absicht
             wären einer zu viel. */
          if (!st.mine) {
            const x = document.createElement('button');
            x.className = 'xdel';
            x.innerHTML = ICON_X;
            x.title = t('entry.removeRating');
            x.onclick = async () => {
              if (!await confirmBox(t('entry.removeRatingAsk'),
                t('entry.ratingRemoveHint', { author: authorName(st.author), name: r.name }),
                t('entry.remove'))) return;
              try {
                item = await api('DELETE', `/api/ratings/${st.id}`);
                list = await api('GET', `/api/items/${id}/votes`);
                drawRatings(); drawMatch(); toast(t('entry.ratingRemoved'));
              } catch (e) { toast(e.message, true); }
            };
            s2.appendChild(x);
          }
          actor.appendChild(s2);
        });
        row.append(n, actor);
        box.appendChild(row);
      });
      if (!something) box.innerHTML = `<span class="hint">${tH('entry.noRatingsYet')}</span>`;
    }
  }
  // Der Knopf steht nur beim Admin ab zwei Zugängen; ohne ihn gibt es hier
// nichts anzuhängen. ZWEI KOEPFE, ZWEI KNOEPFE, EINE SCHLEIFE.
  for (const k of BOXES) {
    const el = document.getElementById(k.actor);
    if (el) el.onclick = () => showMatch(k);
  }
  /* HIER HING DER KNOPF „Meine Bewertung zuruecksetzen" -- samt confirmBox und
     samt `DELETE /api/items/:id/ratings` dahinter. */

  /* ---- Testtage ---- */
  function drawTestDays() {
    const box = document.getElementById('testblock');
    if (!item.tested) {
      box.innerHTML = `<div class="block-head"><span class="label">${esc(V.dayMany)}</span></div>
        <div class="test-locked">${tH('entry.testedFirstHint')}</div>`;
      return;
    }
    const n = item.testDays.length;
    box.innerHTML = `<div class="block-head"><span class="label">${esc(V.dayMany)}</span>
        <span class="hint">${n ? tH('entry.daysSummary',
          { n: n, dayWord: vTime(n), average: number(item.testAvg, 1), latest: item.testLast }) : ''}</span></div>
      ${sparkline(item.testDays)}
      <div class="test-scroll" id="tdays"></div>
      <div class="test-add">
        <input type="date" id="tdate" max="${esc(today())}" value="${esc(today())}">
        <span class="hint">${tH('entry.gradeLabel')}</span><span id="tstars"></span>
        <button class="btn btn-sm" id="tadd">${tH('entry.addDay')}</button>
      </div>`;

    const list = box.querySelector('#tdays');
    if (!n) list.innerHTML = emptyState(t('entry.noDaysYet'));
    item.testDays.forEach(d => {
      const row = document.createElement('div');
      row.className = 'trow';
      const date = document.createElement('span');
      date.className = 'tdate'; date.textContent = fmtDay(d.day);
      const wd = document.createElement('span');
      wd.className = 'tweek'; wd.textContent = weekday(d.day);
      // Keine Null bei Tagesnoten: ein Testtag hat eine Note oder wird geloescht.
      const s = stars(d.rating, v => enqueue(async () => {
        try { item = await api('PUT', `/api/test-days/${d.id}`, { rating: v }); drawTestDays(); }
        catch (e) { toast(e.message, true); }
      }));
      const x = document.createElement('button');
      x.className = 'xdel'; x.innerHTML = ICON_X; x.title = t('entry.deleteDay');
      x.onclick = async () => {
        if (!await confirmBox(t('entry.deleteDayAsk'), t('entry.dayDeleteHint', { day: fmtDay(d.day) }))) return;
        try { item = await api('DELETE', `/api/test-days/${d.id}`); drawTestDays(); drawSwitches(); }
        catch (e) { toast(e.message, true); }
      };

      // Tags am Testtag: zwischen Datum und Sternen, derselbe Vorrat wie am
      // Eintrag.
      const tagBox = document.createElement('span');
      tagBox.className = 'ttags';
      (d.tags || []).forEach(tag => {
        const c = document.createElement('span');
        c.className = 'chip chip-xs';
        // Mit Namen, damit „Tag" und „Testtag" nicht zusammenfallen.
        c.innerHTML = `${esc(tag.name)}<button title="${esc(t('entry.tagQuote', { name: tag.name }))}">${ICON_X}</button>`;
        c.querySelector('button').onclick = async () => {
          try { item = await api('DELETE', `/api/test-days/${d.id}/tags/${tag.id}`); drawTestDays(); loadTagList(); }
          catch (e) { toast(e.message, true); }
        };
        tagBox.appendChild(c);
      });
      const plus = document.createElement('button');
      plus.className = 'ttag-add'; plus.textContent = '+'; plus.title = t('entry.addTagDay');
      plus.onclick = () => {
        if (tagBox.querySelector('input')) return;
        const inp = document.createElement('input');
        inp.className = 'input input-sm ttag-in';
        inp.setAttribute('list', 'tagsug');
        inp.placeholder = t('list.tag');
        const close = () => inp.remove();
        inp.onkeydown = async (e) => {
          if (e.key === 'Escape') return close();
          if (e.key !== 'Enter') return;
          const name = inp.value.trim();
          if (!name) return close();
          try { item = await api('POST', `/api/test-days/${d.id}/tags`, { name }); drawTestDays(); loadTagList(); }
          catch (e2) { toast(e2.message, true); }
        };
        inp.onblur = () => setTimeout(close, 120);
        tagBox.appendChild(inp);
        inp.focus();
      };
      tagBox.appendChild(plus);

      /* ---- „MEHR" RECHTS VON DEN MARKEN ---- DER
         BETREIBER HAT DIE ENTSCHEIDUNG NICHT SELBST GETROFFEN, SONDERN EINE
         REGEL DAFUER GEGEBEN: „Beides machbar. */
      const more = document.createElement('button');
      more.className = 'link-btn ttag-more';
      more.hidden = true;

      /* DIE ZEILE SAGT SELBST, OB SIE MARKEN TRAEGT. */
      if ((d.tags || []).length) row.classList.add('trow-tags');

      // Wer den Tag eingetragen hat -- ab zwei Zugängen. Die Zeitleiste
// unterscheidet weiter über die Füllung; hier steht der Name.
      if (multipleUsers()) {
        const from = document.createElement('span');
        from.className = 'tfrom' + (d.mine ? ' mine' : '');
        from.textContent = authorName(d.author);
        row.append(date, wd, from, tagBox, more, s, x);
      } else {
        row.append(date, wd, tagBox, more, s, x);
      }
      list.appendChild(row);

      /* GEMESSEN WIRD ERST IM DOKUMENT. */
      const opened = dayTagsOpen.has(d.id);
      const trimmed = limitCloud(tagBox, opened ? 0 : 1);
      /* SCHNEIDET SIE NICHTS AB, WIRD SIE WIEDER WEGGENOMMEN. */
      if (!trimmed && !opened) limitCloud(tagBox, 0);
      more.hidden = !trimmed && !opened;
      more.textContent = opened ? t('list.less') : t('list.more');
      more.onclick = () => {
        if (opened) dayTagsOpen.delete(d.id); else dayTagsOpen.add(d.id);
        drawTestDays();
      };
    });

    let newRating = 4;
    const starBox = box.querySelector('#tstars');
    const drawNewStars = () => {
      starBox.innerHTML = '';
      starBox.appendChild(stars(newRating, v => { newRating = v; drawNewStars(); }));
    };
    drawNewStars();

    box.querySelector('#tadd').onclick = async () => {
      const day = box.querySelector('#tdate').value;
      if (!day) return toast(t('entry.pickDate'), true);
      try {
        const res = await api('POST', `/api/items/${id}/test-days`, { day, rating: newRating });
        item = res;
        drawTestDays(); drawSwitches();
        toast(res.replaced ? t('entry.gradeReplaced', { day: fmtDay(day) }) : `${V.dayOne} eingetragen`);
      } catch (e) { toast(e.message, true); }
    };
    setUpBlocksOut(item);
  }

  /* ---- Links ---- */
  function drawLinks() {
    const box = document.getElementById('links');
    document.getElementById('lcount').textContent = item.links.length
      ? t('list.linkCount', { n: item.links.length }) : '';
    box.innerHTML = '';
    if (!item.links.length) {
      box.innerHTML = emptyState(t('entry.noLinksYet'));
      return;
    }
    item.links.forEach((l, n) => {
      const search = isSearch(l.url);
      const { dom, path } = splitUrl(l.url);
      // Suchzeile: der Rohtext oben, darunter die Anbieter -- die sind
      // einstellbar, also darf die Zeile nicht verschweigen, wen sie fragt.
      const provider = search ? searchList() : [];
      const isDefault = provider[0] || null;
      const top = search ? l.url : dom;

      /* WANN DER NAME AN DER ZEILE STEHT -- die Regel steht hier und nirgends
         sonst. */
      const foreignRow = (l.author?.id ?? null) !== (item.author?.id ?? null);
      const showFrom = multipleUsers() && foreignRow;
      // Das Datum steht im Ueberfahrtext, nicht in der Zeile: die Zeile ist auf
// dem Handy am Anschlag, und der Name ist die Angabe, um die es geht.
      const entered = showFrom
        ? t('entry.enteredByOn', { author: authorName(l.author), created_at: fmtDate(l.created_at) }) : '';

      /* DAS LOESCHKREUZ FOLGT DEM RECHT, NICHT DER ANZEIGE: der Server laesst
         den Eintrager und den Admin durch (darfAendern). */
      const mayPath = l.mine === true || ADMIN;

      const row = document.createElement('div');
      row.className = 'lrow' + (search ? ' search' : '');
      row.dataset.lid = l.id;
      const reasonText = search
        ? (isDefault ? t('entry.searchForAt', { url: l.url, name: isDefault.name }) : t('entry.searchFor', { url: l.url }))
        : l.url;
      row.title = entered ? `${reasonText} · ${entered}` : reasonText;
      /* Die zweite Zeile traegt den Pfad (bei einer Suchzeile die
         Anbieternamen) und dahinter den Namen. */
      const bottomLinks = search ? '<span class="snames"></span>'
                               : (path ? `<span class="path">${esc(path)}</span>` : '');
      const bottom = bottomLinks + (showFrom
        ? `<span class="lfrom">(${esc(authorName(l.author))})</span>` : '');
      row.innerHTML = `<span class="grip" title="${esc(t('entry.dragToSort'))}">⣿</span>
        <span class="lnum">${Number(n + 1)}</span>
        <span class="lurl"><span class="dom">${esc(top)}</span>${
          bottom ? `<span class="lbottom">${bottom}</span>` : ''
        }</span>
        <span class="go">${search ? ICON_SEARCH : '↗'}</span>
        ${mayPath ? `<button class="xdel" title="${esc(search ? t('entry.removeSearch') : t('entry.removeLink'))}">${ICON_X}</button>` : ''}`;
      /* IN DER LINKLISTE WIRD DIE ADRESSE HERVORGEHOBEN UND NICHT DER
         ANZEIGENAME. */
      highlightInNode(row.querySelector('.dom'), top, term);
      if (!search && path) highlightInNode(row.querySelector('.path'), path, term);

      // Die Namen sind Eingabe des Admins und werden als Beschriftung
      // gerendert -- die erste Stelle in der Linkliste, an der das gilt.
      if (search) {
        const nameBox = row.querySelector('.snames');
        provider.forEach((a, i) => {
          if (i) nameBox.appendChild(document.createTextNode(' · '));
          const s = document.createElement('span');
          s.className = 'sname';
          s.textContent = a.name;
          s.title = t('entry.searchForAt', { url: l.url, name: a.name });
          // Ein Klick auf einen Namen sucht bei genau diesem Anbieter.
          s.onclick = (e) => {
            e.stopPropagation();
            window.open(searchAddress(a.template, l.url), '_blank', 'noopener,noreferrer');
          };
          nameBox.appendChild(s);
        });
      }
      // Der Behandler nur dort, wo das Kreuz auch steht -- an einem fehlenden
// Element risse er den Aufbau der ganzen Liste mit.
      if (mayPath) row.querySelector('.xdel').onclick = async (e) => {
        e.stopPropagation();
        if (!await confirmBox(search ? t('entry.removeSearchAsk') : t('entry.removeLinkAsk'),
          t('entry.removedFromList',
            { what: search ? `„${l.url}"` : dom }), t('entry.remove'))) return;
        try { await api('DELETE', `/api/links/${l.id}`); item = await api('GET', `/api/items/${id}`); drawLinks(); }
        catch (err) { toast(err.message, true); }
      };
      // Ganze Zeile oeffnet den Link; Ziehen sortiert um. Unterschieden wird
// ueber dieselbe Bewegungsschwelle wie bei den Vorschaubildern.
      makeSortable(row, {
        axis: 'y', selector: '.lrow', ignore: '.xdel, .sname',
        onClick: () => {
          if (!search) return window.open(l.url, '_blank', 'noopener,noreferrer');
          // Ohne gueltigen Standard wird nicht ersatzweise woanders gesucht --
// die Zeile sagt dann, dass nichts eingestellt ist.
          if (!isDefault) return toast(ADMIN
            ? t('entry.noSearchEngineHint')
            : t('entry.noSearchEngine'), true);
          window.open(searchAddress(isDefault.template, l.url), '_blank', 'noopener,noreferrer');
        },
        onDrop: async (children) => {
          try {
            item = await api('PUT', `/api/items/${id}/link-order`, { order: children.map(c => +c.dataset.lid) });
            drawLinks(); toast(t('entry.orderSaved'));
          } catch (err) { toast(err.message, true); }
        }
      });
      box.appendChild(row);
    });
    limitLinks();
    setUpBlocksOut(item);
  }

  // Sichtbare Zeilen begrenzen, statt die Liste immer scrollen zu lassen.
  function limitLinks() {
    const box = document.getElementById('links');
    const button = document.getElementById('links-more');
    if (!box || !button) return;
    const rows = [...box.children];
    const tooMany = rows.length > LINK_ROWS;
    if (!tooMany || linksOpen) {
      box.style.maxHeight = '';
      box.style.overflowY = '';
      button.hidden = !tooMany;
      button.textContent = t('entry.showLess');
      button.onclick = () => { linksOpen = false; drawLinks(); };
      return;
    }
    const h = rows[0]?.offsetHeight || 0;
    const gap = 5;   // entspricht dem margin-bottom von .lrow
    box.style.maxHeight = (LINK_ROWS * h + (LINK_ROWS - 1) * gap) + 'px';
    box.style.overflowY = 'hidden';
    /* UND AN DEN ANFANG DER LISTE -- 7. September 2026, aus dem Betrieb. */
    box.scrollTop = 0;
    button.hidden = false;
    // Aus der Sprachdatei, aus demselben Grund wie die
    // Filterzahl: ein Wort neben einer Zahl ist kein Satz und ist deshalb
    // beim Umzug der Texte liegengeblieben.
    button.textContent = t('entry.showAllLinks', { n: rows.length });
    button.onclick = () => { linksOpen = true; drawLinks(); };
  }

  const addLink = async () => {
    const el = document.getElementById('newlink');
    const url = el.value.trim();
    if (!url) return;
    try {
      item = await api('POST', `/api/items/${id}/links`, { url });
      el.value = ''; drawLinks();
      /* ANS ENDE NUR, WENN DIE LISTE NICHT GEKLEMMT IST. */
      const linkBox = document.getElementById('links');
      if (!linkBox.style.maxHeight) linkBox.scrollTop = 1e6;
    } catch (e) { toast(e.message, true); }
  };
  document.getElementById('newlink-b').onclick = addLink;
  document.getElementById('newlink').addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

  /* ---- Dateien ---- */
  // Welche Vorschau möglich ist, entscheidet der Server (Feld `preview`) --
// die Oberfläche rät nicht anhand des Dateinamens herum.
  const openPreview = new Set();

  function filesize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return number(bytes / 1024 / 1024, 1) + ' MB';
  }

  function drawAtts() {
    const box = document.getElementById('atts');
    const list = item.attachments || [];
    document.getElementById('acount').textContent = list.length
      ? t('entry.fileCount', { n: list.length,
          filesize: filesize(list.reduce((s2, a) => s2 + a.size, 0)) }) : '';
    box.innerHTML = '';
    if (!list.length) {
      box.innerHTML = emptyState(t('entry.noFilesYet'));
      return;
    }
    list.forEach(a => {
      const row = document.createElement('div');
      row.className = 'arow';
      const canPreview = a.preview !== 'keine';
      const open = openPreview.has(a.id);
      row.classList.toggle('open', open);
      row.title = canPreview
        ? (open ? t('entry.clickToCollapse') : t('entry.clickToView'))
        : t('entry.clickToDownload');
      /* DIESELBE REGEL WIE AN DER LINKZEILE, und sie steht dort ausfuehrlich:
         der Name nur bei mehreren Zugaengen und nur an einer Zeile, die NICHT
         vom Verfasser des Eintrags stammt. */
      const foreignFile = (a.author?.id ?? null) !== (item.author?.id ?? null);
      const showFrom = multipleUsers() && foreignFile;
      const uploaded = showFrom
        ? t('entry.uploadedByOn', { author: authorName(a.author), created_at: fmtDate(a.created_at) }) : '';
      if (uploaded) row.title = `${row.title} · ${uploaded}`;
      // Das ✕ folgt dem Recht, nicht der Anzeige -- wie am Link.
      const mayPath = a.mine === true || ADMIN;

      row.innerHTML = `<span class="aicon">${a.preview === 'image' ? '▣' : a.preview === 'pdf' ? '▤' : a.preview === 'keine' ? '▪' : '▥'}</span>
        <span class="aname">${esc(a.filename)}</span>
        <span class="asize">${esc(filesize(a.size))}</span>
        ${showFrom ? `<span class="afrom">(${esc(authorName(a.author))})</span>` : ''}
        <span class="ago">${canPreview ? (open ? '▾' : '▸') : '↓'}</span>
        <a class="adl" href="/api/attachments/${Number(a.id)}/raw" download title="${esc(t('entry.download'))}">↓</a>
        ${mayPath ? `<button class="xdel" title="${esc(t('entry.deleteFile'))}">${ICON_X}</button>` : ''}`;

      // Der Behandler nur dort, wo das Kreuz auch steht.
      if (mayPath) row.querySelector('.xdel').onclick = async (e) => {
        e.stopPropagation();
        if (!await confirmBox(t('entry.deleteFileAsk'), t('entry.fileDeleteHint', { filename: a.filename }))) return;
        try { item = await api('DELETE', `/api/attachments/${a.id}`); openPreview.delete(a.id); drawAtts(); }
        catch (e2) { toast(e2.message, true); }
      };

      // Ganze Zeile reagiert, wie bei den Links: was passiert, entscheidet
      // der Dateityp.
      row.onclick = (e) => {
        if (e.target.closest('.xdel, .adl')) return;
        if (!canPreview) return row.querySelector('.adl')?.click();
        if (open) openPreview.delete(a.id); else openPreview.add(a.id);
        drawAtts();
      };
      box.appendChild(row);

      if (canPreview && open) box.appendChild(buildPreview(a));
    });
    setUpBlocksOut(item);
  }

  function buildPreview(a) {
    const boxId = document.createElement('div');
    boxId.className = 'apreview';
    if (a.preview === 'image') {
      // Bilder in einem img-Element: dort wird nichts ausgeführt, und der
// Server schickt sie mit nosniff und enger Sicherheitsregel.
      boxId.innerHTML = `<img src="/api/attachments/${Number(a.id)}/raw?inline=1" alt="${esc(a.filename)}">`;
    } else if (a.preview === 'pdf') {
      // allow-scripts, aber ausdrücklich OHNE allow-same-origin: die
      // eingebauten PDF-Betrachter von Chrome und Edge bestehen selbst aus
      // HTML und JavaScript und bleiben ohne diese Erlaubnis leer.
      boxId.innerHTML = `<iframe src="/api/attachments/${Number(a.id)}/raw?inline=1"
          sandbox="allow-scripts" referrerpolicy="no-referrer" title="${esc(a.filename)}"></iframe>
        <p class="apdf-hint"><span class="hint">${tH('entry.pdfHint')}</span>
          <a class="abtn" href="/api/attachments/${Number(a.id)}/raw?inline=1" target="_blank" rel="noopener noreferrer">${tH('entry.openNewTab')}</a></p>`;
    } else {
      boxId.innerHTML = `<p class="hint">${tH('list.loading')}</p>`;
      api('GET', `/api/attachments/${a.id}/preview`).then(v => {
        // Als Text in den DOM gesetzt, nie als Datei ausgeliefert: der
// Browser interpretiert den Inhalt damit überhaupt nicht.
        boxId.innerHTML = '';
        const pre = document.createElement('pre');
        pre.className = 'atext';
        pre.textContent = v.text || t('entry.empty');
        boxId.appendChild(pre);
        if (v.shortened) {
          const h = document.createElement('p');
          h.className = 'hint';
          h.textContent = t('entry.previewTruncated');
          boxId.appendChild(h);
        }
      }).catch(e => { boxId.innerHTML = `<p class="hint">${esc(e.message)}</p>`; });
    }
    return boxId;
  }

  document.getElementById('aadd').onclick = () => document.getElementById('afile').click();
  document.getElementById('afile').onchange = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    const tooBig = overLimit(files, 'attachment');
    if (tooBig) return toast(tooBigText(tooBig, 'attachment'), true);
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    try {
      toast(t('entry.uploadingTitle'));
      item = await sendForm(`/api/items/${id}/attachments`, fd);
      drawAtts();
      toast(t('entry.filesAttached', { n: files.length }));
    } catch (e2) { toast(e2.message, true); }
  };

  /* ---- Kommentare ---- */
  function drawComments() {
    const box = document.getElementById('cmts');
    /* Der Hinweis steht in der Kopfzeile und bleibt damit auch eingeklappt
       sichtbar -- eingeklappt ist gerade der Moment, in dem man nicht
       hineinsieht. */
    const counts = commentNumbers(item.comments);
    const ccount = document.getElementById('ccount');
    ccount.innerHTML = counts.html;
    ccount.title = counts.text;
    /* Die Nummer ist die Stellung nach `id` und nicht die der Anzeige:
       Anpinnen und das Umstellen der Art bewegen sie damit nicht. */
    const order = commentOrder(item.comments);
    const missing = markupRefMissing(item.comments.map(c => c.text));
    if (missing.length) markupRefLoad(missing).then(came => { if (came) drawComments(); });
    box.innerHTML = item.comments.length ? '' : emptyState(t('entry.noCommentsYet'));
    item.comments.forEach(c => {
      const report = c.kind === 'report', task = c.kind === 'task',
            done = c.kind === 'done';
      const el = document.createElement('div');
      el.className = 'cmt'
        + (report ? ' report' : task ? ' task' : done ? ' done' : '')
        + (c.pinned ? ' pinned' : '');
      /* Die Verfasserzeile des Zitats kommt aus der Zeile selbst und nicht
         aus einem zweiten Zustand daneben. */
      el.dataset.comment = c.id;
      if (LIT_COMMENT === c.id) el.classList.add('lit');
      el.dataset.author = authorName(c.author);
      el.dataset.when = fmtDate(c.created_at);

      /* FUENF FAELLE, DREI ANTWORTEN -- die Spalten der Rechtetabelle:
         Verfasser, anderer, Admin. */
      const mine = c.mine === true;
      const manage = mine || ADMIN;

      /* DER EINGRIFFSVERMERK NENNT DIE ROLLE, NICHT DIE PERSON, und dafuer
         braucht es kein Feld in der Antwort: hochgezaehlt wird nur, wenn ein
         ANDERER als der Verfasser entfernt. */
      /* ---- DAS DATUM SIEHT JEDER, AENDERN DARF ES NUR, WER DARF ---- Stuende
         der ganze Kennzeichenkasten hinter `manage`, saehe das
         Faelligkeitsdatum nur, wer es auch aendern darf. */
      const dueShown = (task || done) && c.dueDate;
      /* EIN RUF UND NICHT ZWEI. Knopf und Text zeigen denselben Zustand;
         zweimal zu fragen hiesse, dass sie auseinanderlaufen koennen. */
      const dueState = c.dueDate ? dueOf(c, true) : 'none';
      el.innerHTML = `<div class="cmt-head">
          ${manage || dueShown ? `<span class="marks">
          ${manage ? `
            ${/* JEDE MARKE NENNT AUCH DEN RUECKWEG: eine gesetzte Marke
                 sagt „aufheben", nicht noch einmal „markieren". */''}
            <button class="mark pin${c.pinned ? ' on' : ''}" title="${esc(c.pinned ? t('entry.unpin') : t('entry.pinHint'))}">${ICON_PIN}</button>
            <button class="mark kind${report ? ' on' : ''}" title="${esc(report ? t('entry.unmarkReport') : t('entry.markReport'))}">${esc(V.reportOne)}</button>
            <button class="mark task${task ? ' on' : ''}${done ? ' on done' : ''}" title="${esc(
              done ? t('entry.unmark')
                       : task ? t('list.setDone')
                                 : t('entry.markTask')
            )}">${esc(done ? V.taskDone : V.taskOne)}</button>
            ${/* ---- DAS FÄLLIGKEITSDATUM ---- NUR AN
                 EINER AUFGABE, und erst, wenn die Marke steht. */''}
            ` : ''}
            ${/* AUCH AN EINER ERLEDIGTEN OHNE DATUM. */''}
            ${manage
              ? (task || done ? `<button class="link-btn cmt-due${
                  c.dueDate ? ` on due-${esc(dueState)}` : ''}"
                  title="${esc(t('entry.dueHint'))}">${c.dueDate
                    ? esc(fmtDay(c.dueDate)) : tH('entry.dueSet')}</button>` : '')
              : `<span class="cmt-due on due-${esc(dueState)}"
                  title="${esc(t('entry.dueHint'))}">${esc(fmtDay(c.dueDate))}</span>`}
          </span>` : ''}
          <span class="cmt-when">${multipleUsers()
            ? `<span class="cmt-from">${esc(authorName(c.author))}</span> · ` : ''
          }${esc(fmtDate(c.created_at))}${c.updated_at ? ` · ${tH('entry.edited')}` : ''}${
            c.imagesRemoved ? ` · <span class="cmt-edited">${
              tH('entry.imagesRemovedAdmin', { n: c.imagesRemoved })}</span>` : ''}</span>
          <span class="acts"><button class="mact cite" title="${esc(t('entry.quoteComment'))}">${ICON_QUOTE}</button>${
            mine ? `<button class="mact ed" title="${esc(t('entry.edit'))}">${ICON_PEN}</button>` : ''
            }${manage ? `<button class="mact rm" title="${esc(t('dialog.delete'))}">${ICON_X}</button>` : ''}</span>
          ${/* DIE NUMMER STEHT GANZ RECHTS UND AUSSERHALB DER AKTIONEN: die
               Gruppe wird beim Bearbeiten unsichtbar, die Nummer bleibt. */''}
          <button class="link-btn cmt-no"
              title="${esc(t('entry.copyCommentLink'))}">#${Number(order.get(c.id))}</button>
        </div>
        <div class="cmt-body"></div>
        <div class="cmt-imgs"></div>`;

      /* Der Text kommt nicht aus der Vorlage, sondern als echte Knoten -- so
         kann hier gar kein Markup entstehen. */
      /* DIE AUSZEICHNUNG LIEGT UEBER DER ZERLEGUNG: Adresse, Markierung und
         Suchtreffer laufen weiter durch dieselben drei Stuecke. */
      el.querySelector('.cmt-body')
        .appendChild(markupNodes(c.text, term, c.mentions));

      // Die Raute kopiert die vollstaendige Adresse ueber denselben Weg wie
      // jeder andere Link im Haus.
      el.querySelector('.cmt-no').onclick = () =>
        copyText(commentAddress(id, c.id), t('card.linkCopied'));
      el.querySelector('.cite').onclick = () =>
        quoteInto(c.text, authorName(c.author), fmtDate(c.created_at));

      const flip = async (field, value) => {
        try { item = await api('PUT', `/api/comments/${c.id}`, { [field]: value }); drawComments(); }
        catch (e) { toast(e.message, true); }
      };
      // Die Knoepfe stehen nur da, wo sie auch gedrueckt werden duerfen --
// ein Behandler an einem fehlenden Element risse den Aufbau mit.
      if (manage) {
        el.querySelector('.pin').onclick = () => flip('pinned', !c.pinned);
        // Die Art ist ein Wert, keine zwei Merkmale: wer Aufgabe drueckt,
        // waehrend Bericht an ist, waehlt Aufgabe -- ein zweiter Druck auf
        // denselben Knopf nimmt sie wieder zurueck auf Notiz.
        el.querySelector('.kind').onclick = () => flip('kind', report ? 'note' : 'report');
        el.querySelector('.task').onclick = () => flip('kind', taskMore(c.kind));
        /* AUS DEM VERWEIS WIRD DAS FELD. */
        const dueButton = el.querySelector('.cmt-due');
        if (dueButton) dueButton.onclick = () => {
          const field = document.createElement('input');
          field.type = 'date';
          field.className = 'input input-sm cmt-due-in';
          field.value = c.dueDate || '';
          field.onchange = () => flip('dueDate', field.value || null);
          /* ZURUECK ZUM KNOPF UND NICHT DIE GANZE LISTE NEU: verliert das Feld
             den Fokus, ohne dass jemand ein Datum gewaehlt hat, aendert sich
             kein Datenstand. */
          field.onblur = () => { if (field.isConnected) field.replaceWith(dueButton); };
          dueButton.replaceWith(field);
          field.focus();
          try { field.showPicker(); } catch { /* nicht jeder Browser kann das */ }
        };
      }

      // Bilder und dahinter Videos als Kacheln unter dem Text; ein Klick oeffnet
// das Vollbild. Das ✕ nur bei Verfasser oder Admin -- ansehen darf jeder.
      const imgBox = el.querySelector('.cmt-imgs');
      const media = [...(c.images || []).map(x => ({ id: x.id, source: 'comment' })),
        ...(c.videos || []).map(x => ({ id: x.id, source: 'commentVideo', kind: 'video',
                                         duration: x.duration }))];
      media.forEach((m, i) => {
        const video = isVideo(m);
        const length = video ? durationText(m.duration) : '';
        const k = document.createElement('div');
        k.className = 'cmt-img' + (video ? ' is-video' : '');
        k.innerHTML = `<img src="${esc(imageSource(m, 'thumb'))}" alt="" loading="lazy">` +
          (video ? `<span class="play-badge">▶</span>` : '') +
          (length ? `<span class="duration">${esc(length)}</span>` : '') +
          (manage ? `<button class="del" title="${esc(t(video ? 'entry.deleteVideo' : 'entry.deleteImage'))}">${ICON_X}</button>` : '');
        k.querySelector('img').onclick = () => {
          openLightbox(media, i, item.title);
          if (video) document.querySelector('.lightbox .lb-video')?.play?.()?.catch?.(() => {});
        };
        if (manage) k.querySelector('.del').onclick = async (e) => {
          e.stopPropagation();
          const word = t('list.video');
          if (!await confirmBox(video ? t('entry.deleteWordAsk', { word }) : t('entry.deleteImageAsk'),
            video ? t('entry.deleteHint', { word }) : t('entry.imageDeleteHint'))) return;
          try { item = await api('DELETE', `/api/comment-${video ? 'videos' : 'images'}/${m.id}`); drawComments(); }
          catch (err) { toast(err.message, true); }
        };
        imgBox.appendChild(k);
      });

      if (manage) el.querySelector('.rm').onclick = async () => {
        if (!await confirmBox(t('entry.deleteCommentAsk'),
          t('entry.commentDeleteHint',
            { extra: media.length ? t('entry.withAllImages') : '' }))) return;
        try { await api('DELETE', `/api/comments/${c.id}`); item = await api('GET', `/api/items/${id}`); drawComments(); }
        catch (e) { toast(e.message, true); }
      };

      // Der Bearbeitenmodus haengt am ✎, und das gibt es nur beim Verfasser.
// Damit faellt auch "+ Bild" weg -- es steht ausschliesslich hier drin.
      if (mine) el.querySelector('.ed').onclick = () => {
        const wrap = document.createElement('div');
        wrap.className = 'cmt-edit';
        wrap.innerHTML = `<div class="markup-wrap"><textarea class="ta" data-markup></textarea></div>
          <div class="acts"><button class="btn btn-ghost btn-sm addimg">${tH('entry.addImage')}</button>
          <button class="btn btn-ghost btn-sm cancel">${tH('dialog.cancel')}</button>
          <button class="btn btn-accent btn-sm save">${tH('dialog.save')}</button></div>`;
        const ta = wrap.querySelector('textarea');
        ta.value = c.text;
        el.querySelector('.cmt-body').replaceWith(wrap);
        el.querySelector('.acts').style.visibility = 'hidden';
        autoGrow(ta);   // erst nach dem Einhaengen, vorher ist scrollHeight null
        ta.focus();

        // Beim Bearbeiten hat der Kommentar schon eine Id -- Bilder gehen
// deshalb sofort an den Server, ohne auf das Speichern zu warten.
        const addLater = async (files) => {
          const images = files.filter(f => !/^video\//.test(f.type));
          const videos = files.filter(f => /^video\//.test(f.type));
          if (!files.length) return;
          const big = overLimit(images, 'commentImage') || overLimit(videos, 'commentVideo');
          if (big) return toast(tooBigText(big, big.type.startsWith('video/') ? 'commentVideo' : 'commentImage'), true);
          let sent = 0;
          try {
            if (images.length) {
              const fd = new FormData();
              images.forEach(f => fd.append('images', f));
              item = await sendForm(`/api/comments/${c.id}/images`, fd);
              sent += images.length;
            }
            // Ein Video je Anfrage, jedes mit seinem Standbild.
            for (const f of videos) {
              item = await sendForm(`/api/comments/${c.id}/videos`, await videoForm(f));
              sent++;
            }
            toast(t('entry.imagesAttached', { n: sent }));
          } catch (e) { toast(e.message, true); }
          if (sent) drawComments();
        };
        wrap.querySelector('.addimg').onclick = () => pickImages(addLater, true);
        ta.addEventListener('paste', (e) => {
          const images = imagesFromClipboard(e);
          if (!images.length) return;
          e.preventDefault();
          addLater(images);
        });

        wrap.querySelector('.cancel').onclick = () => drawComments();
        wrap.querySelector('.save').onclick = async () => {
          const v = ta.value.trim();
          if (!v) return toast(t('server.textMissing'), true);
          try { item = await api('PUT', `/api/comments/${c.id}`, { text: v }); drawComments(); toast(t('list.saved')); }
          catch (e) { toast(e.message, true); }
        };
      };
      box.appendChild(el);
    });
    setUpBlocksOut(item);
  }
  /* ---- Neuer Kommentar ---- */
  // Bilder werden hier gesammelt und erst mit dem Absenden geschickt: der
  // Kommentar hat noch keine Id, und bei einem Abbruch entstuende sonst ein
  // leerer Kommentar mit Bildern.
  const fitCtext = autoGrow(document.getElementById('ctext'));
  let newImages = [], newVideo = null;
  let newPinned = false, newKind = 'note';

  function drawNewMarks() {
    const pin = document.getElementById('cpin');
    pin.classList.toggle('on', newPinned);
    pin.title = newPinned ? t('entry.unpin') : t('entry.pinHint');
    const kind = document.getElementById('ckind');
    kind.classList.toggle('on', newKind === 'report');
    kind.textContent = V.reportOne;
    /* GEGEN DAS LITERAL UND NICHT GEGEN DIE SPRACHDATEI. */
    kind.title = newKind === 'report' ? t('entry.unmarkReport') : t('entry.markReport');
    const taskBtn = document.getElementById('ctask');
    const finished = newKind === 'done';
    taskBtn.classList.toggle('on', newKind === 'task' || finished);
    taskBtn.classList.toggle('done', finished);
    taskBtn.textContent = finished ? V.taskDone : V.taskOne;
    taskBtn.title = finished ? t('entry.unmark')
      : newKind === 'task' ? t('list.setDone')
                           : t('entry.markTask');
  }
  function drawNewImages() {
    const box = document.getElementById('cnew-imgs');
    box.innerHTML = '';
    newImages.forEach((f, i) => {
      const k = document.createElement('div');
      k.className = 'cmt-img';
      const url = URL.createObjectURL(f);
      k.innerHTML = `<img src="${esc(url)}" alt=""><button class="del" title="${esc(t('entry.removeAgain'))}">${ICON_X}</button>`;
      // Die erzeugte Adresse wieder freigeben, sobald das Bild steht.
      k.querySelector('img').onload = () => URL.revokeObjectURL(url);
      k.querySelector('.del').onclick = () => { newImages.splice(i, 1); drawNewImages(); };
      box.appendChild(k);
    });
    if (!newVideo) return;
    // Das Video zeigt sein Standbild mit dem Abspielzeichen.
    const k = document.createElement('div');
    k.className = 'cmt-img is-video';
    const url = URL.createObjectURL(newVideo.image);
    k.innerHTML = `<img src="${esc(url)}" alt=""><span class="play-badge">▶</span>` +
      `<button class="del" title="${esc(t('entry.removeAgain'))}">${ICON_X}</button>`;
    k.querySelector('img').onload = () => URL.revokeObjectURL(url);
    k.querySelector('.del').onclick = () => { newVideo = null; drawNewImages(); };
    box.appendChild(k);
  }
  const takeImages = async (files) => {
    const images = files.filter(f => f.type.startsWith('image/'));
    const videos = files.filter(f => f.type.startsWith('video/'));
    if (!images.length && !videos.length) return;
    const big = overLimit(images, 'commentImage') || overLimit(videos, 'commentVideo');
    if (big) return toast(tooBigText(big, big.type.startsWith('video/') ? 'commentVideo' : 'commentImage'), true);
    if (videos.length > 1 || (videos.length && newVideo)) return toast(t('server.videoOne'), true);
    if (newImages.length + images.length + (newVideo || videos.length ? 1 : 0) > 6)
      return toast(t('entry.imageCapHint'), true);
    if (videos.length) {
      try { newVideo = { file: videos[0], ...await stillFrame(videos[0]) }; }
      catch (e) { return toast(e.message, true); }
    }
    newImages = [...newImages, ...images];
    drawNewImages();
  };
  drawNewMarks();

  document.getElementById('cpin').onclick = () => { newPinned = !newPinned; drawNewMarks(); };
  document.getElementById('ckind').onclick =
    () => { newKind = newKind === 'report' ? 'note' : 'report'; drawNewMarks(); };
  document.getElementById('ctask').onclick =
    () => { newKind = taskMore(newKind); drawNewMarks(); };
  document.getElementById('cimg').onclick = () => pickImages(takeImages, true);

  /* Der Sprung ans Schreibfeld. */
  document.getElementById('cjump').onclick = () => {
    if (BLOCKS.closed.includes('kommentare')) {
      BLOCKS.closed = BLOCKS.closed.filter(k => k !== 'kommentare');
      saveBlocks();
      setUpBlocksOut(item);
    }
    const field = document.getElementById('ctext');
    if (!field) return;
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    field.focus({ preventScroll: true });
  };
  document.getElementById('ctext').addEventListener('paste', (e) => {
    const images = imagesFromClipboard(e);
    if (!images.length) return;   // Text weiterhin normal einfügen
    e.preventDefault();
    takeImages(images);
  });

  document.getElementById('cadd').onclick = async () => {
    const ta = document.getElementById('ctext');
    const v = ta.value.trim();
    if (!v) return toast(t('server.textMissing'), true);
    const fd = new FormData();
    fd.append('text', v);
    fd.append('kind', newKind);
    fd.append('pinned', newPinned ? '1' : '0');
    newImages.forEach(f => fd.append('images', f));
    if (newVideo) {
      fd.append('video', newVideo.file, newVideo.file.name);
      fd.append('stillFrame', newVideo.image, 'stillframe.jpg');
      if (newVideo.duration) fd.append('duration', String(newVideo.duration));
    }
    try {
      item = await sendForm(`/api/items/${id}/comments`, fd);
      ta.value = ''; fitCtext();
      newImages = []; newVideo = null; newPinned = false; newKind = 'note';
      drawNewImages(); drawNewMarks(); drawComments();
    } catch (e) { toast(e.message, true); }
  };

  /* Die Zahlen kommen vom Server, nicht aus dem geladenen Eintrag: nur dort
     lassen sich eigene von fremden Beiträgen trennen, und zwei Quellen für
     dieselbe Aussage wären zwei Wahrheiten. */
  atElement('del', del => del.onclick = async () => {
    let b;
    try { b = await api('GET', `/api/items/${id}/inventory`); }
    catch (e) { return toast(e.message, true); }

    const countWord = (n, one, more) => (n ? [`${n} ${counted(n, one, more)}`] : []);
    // Fotos und Dateien haengen am Eintrag und gehoeren seinem Verfasser. Ein
// Link kann fremd sein und steht deshalb bei den Beitraegen, nicht hier.
    const content = [
      ...countWord(b.photos, t('list.photo'), t('list.photos')),
      // Eigene Zeile, nicht als Foto getarnt: ein Dialog, der "3 Fotos" sagt
      // und dabei ein Video mit wegwirft, verschweigt genau das, um
      // dessentwillen er dasteht.
      ...countWord(b.videos, t('list.video'), t('list.videos'))
    ];
    const own = [
      ...countWord(b.ownLinks, t('dialog.link'), t('dialog.links')),
      ...countWord(b.ownFiles, t('dialog.file'), t('dialog.files')),
      ...countWord(b.ownComments, t('dialog.comment'), t('dialog.comments')),
      ...countWord(b.ownRatings, V.ratingOne, V.ratingMany),
      ...(b.ownTestDays ? [`${b.ownTestDays} ${vTime(b.ownTestDays)}`] : [])
    ];
    const foreign = [
      ...countWord(b.foreignLinks, t('dialog.link'), t('dialog.links')),
      ...countWord(b.foreignFiles, t('dialog.file'), t('dialog.files')),
      ...countWord(b.foreignComments, t('dialog.comment'), t('dialog.comments')),
      ...countWord(b.foreignRatings, V.ratingOne, V.ratingMany),
      ...(b.foreignTestDays ? [`${b.foreignTestDays} ${vTime(b.foreignTestDays)}`] : [])
    ];

    // Zuerst die Zahlen, zuletzt der Papierkorb.
    const sentences = [t('entry.titleDeleteHint', { title: item.title })];
    if (content.length) sentences.push(t('entry.alsoGoes', { what: content.join(', ') }));
    if (own.length) sentences.push(t('entry.alsoFromMe', { what: own.join(', ') }));
    if (foreign.length) sentences.push(t('entry.andFromOthers', { what: foreign.join(', ') }));
    sentences.push(t('entry.trashHint', { trashDays: TRASH_DAYS }));

    if (!await confirmBox(t('entry.deleteEntryAsk'), sentences.join(' '))) return;
    try { await api('DELETE', `/api/items/${id}`); state.compare.delete(id); location.hash = '#/'; }
    catch (e) { toast(e.message, true); }
  });

  // Ab hier kann das Aufklappen des Tagblocks die Wolke nachmessen lassen.
  redrawCloud = drawCloud;

  // Gespeicherte Anordnung anwenden, bevor die Blöcke gefüllt werden.
  sortBlocks();
  drawViewer(); drawThumbs(); drawSwitches(); drawAuthor(); drawCat(); drawTags();
  drawRatings(); drawTestDays(); drawLinks(); drawAtts(); drawComments();
  /* Ein Sprung ohne Markierung liesse den Leser suchen, welche der zwoelf
     Zeilen gemeint war. */
  if (LIT_COMMENT) commentJump(LIT_COMMENT);
}

/* ================= Der Systembereich ================= ACHTZEHN KARTEN IN
   FUENF ABSCHNITTEN, JEDER MIT EIGENER ADRESSE. */

/* DIE FUENF ABSCHNITTE, IN DER REIHENFOLGE DER RECHTELEITER: was jedem
   gehoert, steht vorn; was nur der Eigentuemer sieht, steht hinten. */
/* DIE NAMEN SIND RUFE UND KEINE WERTE. */
const SYS_SECTIONS = [
  { key: 'personal',     name: () => t('card.personal') },
  { key: 'inventory',    name: () => t('card.inventory') },
  // „Benutzer"; der Schluessel bleibt, ein Bildschirmtext
// benennt keine Adresse um.
  { key: 'users',        name: () => t('card.user') },
  { key: 'database',     name: () => t('card.database') },
  { key: 'installation', name: () => t('card.installation') }
];

/* DIE ADRESSE IST DIE EINE WAHRHEIT UEBER DEN OFFENEN ABSCHNITT. */
const SYS_PATTERN = /^#\/system(?:\/([a-z]+))?$/;
const sysUrl = (key) => `#/system/${key}`;

/* DIE UEBERSETZUNG ALTER ABSCHNITTSADRESSEN IST IN 0.19.2 ABGEBAUT WORDEN --
   und spaeter zurueckgekommen. */

/* Was eine Karte nicht zeigt, bekommt auch keinen Behandler. */
const atElement = (id, tu) => { const el = document.getElementById(id); if (el) tu(el); };

/* DIE ABLAGE UEBER DAS SKRIPT GIBT DER BROWSER NUR IM SICHEREN KONTEXT HERAUS
   -- https, localhost, 127.0.0.1. Ueber eine Adresse im Netz fehlt sie, und
   dann kopiert ein kurzlebiges Feld. */
function copyByField(text) {
  const pick = window.getSelection();
  const spans = [];
  for (let i = 0; i < pick.rangeCount; i++) spans.push(pick.getRangeAt(i));
  const before = document.activeElement;
  let from = null, to = null;
  // Ein Feld vom Typ email oder number wirft beim Lesen der Schreibstelle.
  try { from = before.selectionStart; to = before.selectionEnd; } catch { from = null; }
  const box = document.createElement('textarea');
  box.value = text;
  box.setAttribute('readonly', '');
  box.className = 'copy-spare';
  let done = false;
  try {
    document.body.appendChild(box);
    box.select();
    box.setSelectionRange(0, text.length);
    done = document.execCommand('copy');
  } catch { done = false; }
  box.remove();
  /* AUSWAHL UND FOKUS KOMMEN ZURUECK: das Menue im Lesemodus haengt an der
     Auswahl, und ein Schreibfeld verloere sonst seine Stelle. */
  try {
    pick.removeAllRanges();
    for (const span of spans) pick.addRange(span);
  } catch { /* ohne Auswahl gibt es nichts zurueckzustellen */ }
  if (before && before.isConnected && before.focus) {
    before.focus();
    if (from !== null) { try { before.setSelectionRange(from, to); } catch { /* kein Feld */ } }
  }
  return done;
}

/* Erst ueber das Skript, dann ueber das Feld, und erst wenn beides abweist,
   sagt der Toast warum. */
function copyText(text, message = t('card.copied'), byHand = 'card.copyByHand') {
  const overField = () => {
    if (copyByField(text)) toast(message);
    else toast(t(byHand), true);
  };
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(text).then(() => toast(message), overField);
  else overField();
}
// Ein Horcher fuer alle Kopierknoepfe mit data-copy -- auch fuer die, die
// erst spaeter in die Seite kommen (die Wiederherstellungscodes).
document.addEventListener('click', e => {
  const b = e.target && e.target.closest ? e.target.closest('[data-copy]') : null;
  if (b) copyText(b.dataset.copy);
});

/* DER KASTEN „Auf dem Server", Regel S5. */
function serverBox(sentence, command) {
  if (!OWNER) return '';
  return `<div class="server-box"><div class="server-head">${tH('card.onTheServer')}</div>
    <p class="desc">${esc(sentence)}</p>
    <div class="server-row"><code>${esc(command)}</code><button type="button" class="btn btn-sm"
      data-copy="${esc(command)}">${tH('card.copy')}</button></div></div>`;
}

/* „MEHR": DIE ZWEITE EBENE DER ERKLAERTEXTE. */
/* „MEHR" WIRD BREITENABHAENGIG, und der Grund ist
   GEMESSEN und nicht geschaetzt. */
const more = (html) =>
  `<details class="more"><summary>${tH('card.more')}</summary><div class="more-text">${html}</div></details>`;

/* UND DIE MESSUNG SELBST -- sie laeuft NACH dem Zeichnen und nicht davor: wie
   viele Zeilen ein Satz braucht, weiss erst der Browser. */
function trimMore(root) {
  if (!root || isNarrow()) return;
  for (const box of [...root.querySelectorAll('details.more')]) {
    const text = box.querySelector('.more-text');
    if (!text) continue;
    const wasOpen = box.open;
    box.open = true;
    const line = parseFloat(getComputedStyle(text).lineHeight) || 0;
    const high = text.getBoundingClientRect().height;
    box.open = wasOpen;
    if (!line || high > line * 1.5) continue;
    /* AUS DEM AUFKLAPPER WIRD EIN ABSATZ, und der Inhalt wandert als KNOTEN
       hinueber -- nicht als String. */
    const plain = document.createElement('p');
    plain.className = 'desc more-plain';
    while (text.firstChild) plain.appendChild(text.firstChild);
    box.replaceWith(plain);
  }
}

/* „GESPEICHERT" -- ein Muster fuer alle Felder der Einstellungen: der Toast, und die Karte, in der gespeichert wurde, zeigt es
   400 ms lang am Rand (Stilblatt 1.2). */
/* ---- EINE PILLENREIHE -- `get` und `set` lesen und schreiben den Wert,
   `label` beschriftet, `apply` macht ihn sofort sichtbar, `key` ist der
   Schluessel in PUT /api/settings, `mark` sagt, woran das Aufleuchten haengt. */
function pillRow({ boxId, levels, get, set, label, apply, key, mark }) {
  const box = document.getElementById(boxId);
  if (!box) return;
  const draw = () => {
    box.innerHTML = '';
    levels.forEach(level => {
      const b = document.createElement('button');
      b.className = 'pill' + (get() === level ? ' on' : '');
      b.textContent = label(level);
      b.onclick = async () => {
        const before = get();
        set(level);
        if (apply) apply();          // sofort sichtbar, auch wenn das Speichern scheitert
        draw();
        try { await api('PUT', '/api/settings', { [key]: level }); saved(mark ? b : undefined); }
        catch (e) { set(before); if (apply) apply(); draw(); toast(e.message, true); }
      };
      box.appendChild(b);
    });
  };
  draw();
}

function saved(el = document.activeElement) {
  toast(t('list.saved'));
  const card = el && el.closest ? el.closest('.sys-card') : null;
  if (!card) return;
  card.classList.remove('saved');
  void card.offsetWidth;   // erzwingt den Neustart der Animation
  card.classList.add('saved');
  card.addEventListener('animationend', () => card.classList.remove('saved'), { once: true });
}


/* ---- Die Karten des Systembereichs ---- `visible` ist die Klemme, `markup`
   das Aussehen, `wireUp` die Behandler. */
const SYS_CARDS = [
  { key: 'myaccount',    section: 'personal', visible: () => true,
    markup: cardUser,       wireUp: setUpUserOut },
  { key: 'sessions',     section: 'personal', visible: () => true,
    markup: cardSessions,    wireUp: setUpSessionsOut },
  { key: 'appearance',   section: 'personal', visible: () => true,
    markup: cardAppearance,  wireUp: setUpAppearanceOut },

  { key: 'categories',   section: 'inventory', visible: () => true,
    markup: cardCategories,   wireUp: setUpCategoriesOut },
  { key: 'tags',         section: 'inventory', visible: () => true,
    markup: cardTags,         wireUp: setUpTagsOut },
  { key: 'criteria',     section: 'inventory', visible: () => true,
    markup: () => cardCriteria('after'),
    wireUp: (g) => setUpCriteriaOut(g, 'after') },
  /* DIE ZWEITE KRITERIENKARTE, direkt hinter der ersten. */
  { key: 'potentialcriteria', section: 'inventory', visible: () => true,
    markup: () => cardCriteria('before'),
    wireUp: (g) => setUpCriteriaOut(g, 'before') },
  { key: 'vocabulary',   section: 'inventory', visible: () => ADMIN,
    markup: cardVocabulary,    wireUp: setUpVocabularyOut },
  { key: 'links',        section: 'inventory', visible: () => true,
    markup: cardLinks,        wireUp: setUpLinksOut },
  { key: 'searchengines', section: 'inventory', visible: () => ADMIN,
    markup: cardSearchProvider, wireUp: setUpSearchProviderOut },
  { key: 'trash',        section: 'inventory', visible: () => ADMIN,
    markup: cardTrash,   wireUp: setUpTrashOut },

  { key: 'accounts',     section: 'users', visible: () => ADMIN,
    markup: cardUsers,     wireUp: setUpUsersOut },
  { key: 'requests',     section: 'users', visible: (g) => ADMIN && !!g.requests,
    markup: cardRequests,     wireUp: setUpRequestsOut },
  { key: 'log',          section: 'users', visible: (g) => OWNER && !!g.log,
    markup: cardLog,    wireUp: setUpLogOut },
  { key: 'mail',         section: 'users', visible: (g) => OWNER && !!g.mailStatus,
    markup: cardMailDelivery,  wireUp: setUpMailDeliveryOut },

  { key: 'stats',        section: 'database', visible: () => ADMIN,
    markup: cardStats,    wireUp: setUpStatsOut },
  { key: 'imagestore',   section: 'database', visible: () => ADMIN,
    markup: cardImageStore,   wireUp: setUpImageStoreOut },
  // Admins sehen die Grenzen, aendern kann sie der Eigentuemer.
  { key: 'limits',       section: 'database', visible: () => ADMIN,
    markup: cardLimits,       wireUp: setUpLimitsOut },
  { key: 'backup',       section: 'database', visible: () => OWNER,
    markup: cardBackup,    wireUp: setUpBackupOut },
  // Direkt hinter "Backup": die eine Karte legt Backups an, die andere raeumt sie weg.
  { key: 'cleanup',      section: 'database', visible: () => OWNER,
    markup: cardCleanup,   wireUp: setUpCleanupOut },
  { key: 'export',       section: 'database', visible: () => OWNER,
    markup: cardExport,       wireUp: setUpExportOut },

  { key: 'titles',       section: 'installation', visible: () => ADMIN,
    markup: cardTitle,        wireUp: setUpTitleOut },
  /* Die zweite Karte des Abschnitts. */
  { key: 'languages',    section: 'installation', visible: () => OWNER,
    markup: cardLanguages,    wireUp: setUpLanguagesOut }
];

/* WELCHE ABSCHNITTE FUER DIESEN ZUGANG ETWAS ZU ZEIGEN HABEN. */
function sysVisibleSections(fetched) {
  return SYS_SECTIONS.filter(a =>
    SYS_CARDS.some(k => k.section === a.key && k.visible(fetched)));
}


/* `keepScroll`: DIE BILDLAUFSTELLUNG UEBERLEBT DAS NEUZEICHNEN. */
async function renderSystem({ keepScroll = false } = {}) {
  const side = document.scrollingElement || document.documentElement;
  const scrollBefore = keepScroll && side ? side.scrollTop : 0;
  app.innerHTML = `<div class="shell"><p class="hint" style="padding-top:44px">${tH('list.loading')}</p></div>`;
  const fetched = {};
  try {
    /* DIE KENNZAHLEN WERDEN NUR GEHOLT, WENN SIE AUCH ANGEZEIGT WERDEN. */
    [fetched.stats, fetched.titles, fetched.cats, fetched.tags, fetched.crits, fetched.account,
     fetched.trash, fetched.backup, fetched.sessions, fetched.log,
     fetched.mailStatus, fetched.requests] = await Promise.all([
      ADMIN ? api('GET', '/api/stats') : null, api('GET', '/api/titles'),
      api('GET', '/api/product-categories'), api('GET', '/api/tags'), api('GET', '/api/criteria'),
      api('GET', '/api/account'), ADMIN ? api('GET', '/api/trash') : null,
      OWNER ? api('GET', '/api/backup') : null, api('GET', '/api/sessions'),
      OWNER ? api('GET', '/api/security-log') : null,
      OWNER ? api('GET', '/api/mail') : null,
      ADMIN ? api('GET', '/api/requests') : null
    ]);
  } catch (e) { if (e.message !== SESSION_GONE) toast(e.message, true); return; }
  // Die Frist kommt vom Server, auch hier. Die Karte rechnet sie nicht nach.
  if (fetched.trash && fetched.trash.days) TRASH_DAYS = fetched.trash.days;

  /* WELCHER ABSCHNITT OFFEN IST, ENTSCHEIDET DIE ADRESSE -- und wenn die auf
     einen zeigt, den es fuer diesen Zugang nicht gibt, faellt sie auf den
     ersten sichtbaren zurueck. */
  const visibleOnes = sysVisibleSections(fetched);
  const fromAddress = (SYS_PATTERN.exec(location.hash || '') || [])[1] || '';
  const desired = fromAddress;
  const open = visibleOnes.find(a => a.key === desired) || visibleOnes[0];
  const cards = SYS_CARDS.filter(k => k.section === open.key && k.visible(fetched));
  const cardMarkup = cards.map(k => k.markup(fetched)).join('\n');

  app.innerHTML = `<div class="shell">
    ${/* OHNE SUCHFELD, auf jedem Geraet. */''}
    ${subhead({ searchBox: false })}
    <h1 class="page-title">${tH('list.settings')}</h1>
    <p class="hint" style="margin:0 0 16px">${ADMIN
      ? tH('card.settingsHintAll')
      : tH('card.settingsHint')}</p>
    ${/* EIN MARKUP, ZWEI GESTALTEN -- dieselbe Bauform wie das Menue der
         Kopfzeile. */''}
    ${/* DER SCHALTER DARUEBER GEHOERT DEM TELEFON, und es ist dieselbe Bauform wie
         der Filterschalter der Uebersicht. */''}
    <button class="btn btn-sm sys-toggle" id="sys-toggle"
      aria-expanded="false" aria-controls="sys-tabs">${tH('card.sections')}<span class="fcount">${esc(open.name())}</span></button>
    <nav class="sys-tabs" id="sys-tabs" aria-label="${esc(t('card.sectionsHint'))}">
      ${visibleOnes.map(a => `<a class="sys-tab${a === open ? ' on' : ''}"
        href="${esc(sysUrl(a.key))}"${
        a === open ? ' aria-current="page"' : ''}>${esc(a.name())}</a>`).join('')}
    </nav>
    <div class="sys-grid">
      ${cardMarkup}
    </div></div>`;
  wireSubhead();

  /* ---- Der Schalter ueber den Abschnitten ---- EINGEKLAPPT FAENGT ER AN,
     und die Bedingung ist dieselbe wie im Stilblatt (isNarrow) -- genau wie
     beim Filterschalter der Uebersicht. */
  atElement('sys-toggle', b => {
    const tabs = document.getElementById('sys-tabs');
    if (isNarrow()) tabs.classList.add('closed');
    b.setAttribute('aria-expanded', tabs.classList.contains('closed') ? 'false' : 'true');
    b.onclick = () => {
      const shut = tabs.classList.toggle('closed');
      b.setAttribute('aria-expanded', shut ? 'false' : 'true');
    };
  });

  for (const k of cards) if (k.wireUp) k.wireUp(fetched);

  /* DIE ADRESSE WIRD NACHGEZOGEN, NICHT DIE ANSICHT VERBOGEN. */
  if (location.hash !== sysUrl(open.key) &&
      typeof history !== 'undefined' && typeof history.replaceState === 'function')
    history.replaceState(null, '', sysUrl(open.key));

  /* UND ZULETZT DIE BILDLAUFSTELLUNG, nach dem Zeichnen und
     nach dem Verdrahten: vorher waere die Seite noch die Ladezeile hoch, und
     ein gesetzter scrollTop verpuffte an einer Seite ohne Hoehe. */
  if (keepScroll && side && scrollBefore) side.scrollTop = scrollBefore;

  /* UND DIE AUFKLAPPER, DIE SICH NICHT LOHNEN, FALLEN WEG. NACH dem Zeichnen und nach dem Verdrahten, aus demselben
     Grund wie die Bildlaufstellung eine Zeile hoeher: vorher haette der
     Inhalt keine Hoehe, und die Messung maesse nichts. */
  trimMore(app);
}


/* ---- Karte „Titel" — Abschnitt „Installation" ---- */
function cardTitle(fetched) {
  const { titles } = fetched;
  return `<div class="sys-card">
        <h3>${tH('list.title')}</h3>
        <p class="desc">${tH('card.publicTitleHint')} ${tH('card.internalTitleHint')}</p>
        <div class="field"><label>${tH('card.titleBeforeLogin')}</label>
          <input class="input" id="tp" value="${esc(titles.publicTitle)}"></div>
        <div class="field"><label>${tH('card.titleAfterLogin')}</label>
          <input class="input" id="ta2" value="${esc(titles.appTitle)}"></div>
        <button class="btn btn-accent btn-sm" id="tsave">${tH('card.saveTitle')}</button>
      </div>`;
}
function setUpTitleOut() {
  atElement('tsave', tsave => tsave.onclick = async () => {
    const p = document.getElementById('tp').value.trim();
    const a = document.getElementById('ta2').value.trim();
    try {
      const r = await api('PUT', '/api/titles', { publicTitle: p, appTitle: a });
      TITLE_PUBLIC = r.publicTitle; TITLE_APP = r.appTitle;
      document.title = TITLE_APP;
      toast(t('card.titleSaved'));
    } catch (e) { toast(e.message, true); }
  });
}


/* ---- Karte „Sprachen" — Abschnitt „Installation" ---- */
/* DIESELBE BAUFORM WIE DER VORRAT DER SUCHMASCHINEN, und aus demselben Grund:
   der Eigentuemer kuratiert, der Benutzer waehlt daraus. */
function cardLanguages() {
  return `<div class="sys-card">
        <h3>${tH('card.languages')}</h3>
        <p class="desc">${tH('card.languagesHint')}</p>
        ${more(t('card.languagesUsersHint'))}
        <div class="engine-list" id="langs"></div>
        ${/* DIE PFADE STEHEN IM QUELLTEXT UND NICHT IN DER SPRACHDATEI: ein
             Verzeichnisname ist ein technischer Name und in jeder Sprache
             derselbe (Regel S8). */''}
        ${more(tMarks('card.languagesFileHint', { word: '<code>public/languages/</code>' }))}
      </div>`;
}
function setUpLanguagesOut() {
  drawLanguages();
}

  /* --- Die Sprachen der Installation --- */
  // Zurueck kommt immer der aufgeraeumte Zustand; gezeichnet wird daraus und
// nicht aus der eigenen Annahme -- dieselbe Regel wie bei sendProvider().
  async function sendLanguages(body, message) {
    try {
      const s = await api('PUT', '/api/settings', body);
      if (Array.isArray(s.languages)) LANGUAGES = s.languages;
      /* UND DIE NAMENSTAFELN MIT, die Reparatur von E3. */
      takeNames(s);
      drawLanguages();
      toast(message);
    } catch (e) { drawLanguages(); toast(e.message, true); }
  }
  /* DIE ANSAGE NACH DEM UMSCHALTEN. */
  const languageGaps = (code) => ({
    names: namesMissing('cats', code) + namesMissing('crits', code),
    words: VOCABULARY_FIELDS.filter(
      ([, key]) => !(((VOCABULARIES_OWN || {})[code] || {})[key])).length
  });
  const languageGapLine = (code) => {
    const gaps = languageGaps(code);
    return t('card.languageDefaultNow', { language: languageNameOf(code),
      names: t('card.names', { n: gaps.names }),
      words: t('card.wordsMissing', { n: gaps.words }) });
  };
  // Der Vorrat als Liste von Kennungen -- dieselbe Form, in der der Server
// ihn speichert.
  const languagePool = () => LANGUAGES.filter(a => a.active).map(a => a.code);

  function drawLanguages() {
    const box = document.getElementById('langs');
    if (!box) return;
    box.innerHTML = '';
    LANGUAGES.forEach(a => {
      const row = document.createElement('div');
      row.className = 'engine';
      row.dataset.k = a.code;
      const hk = document.createElement('input');
      hk.type = 'checkbox';
      hk.checked = !!a.active;
      /* DIE VORGABESPRACHE LAESST SICH NICHT HERAUSNEHMEN -- die Klemme steht
         hier UND am Server (writeLanguages). */
      hk.disabled = !!a.isDefault;
      hk.title = t(a.isDefault ? 'card.languageDefaultTip' : 'card.addToSelection');
      hk.onchange = () => {
        const keys = languagePool();
        sendLanguages({ languageOn: hk.checked ? [...keys, a.code] : keys.filter(k => k !== a.code) },
          t('card.languagePoolSaved'));
      };
      const st = document.createElement('button');
      st.type = 'button';
      st.className = 'sdefault' + (a.isDefault ? ' on' : '');
      st.textContent = t('card.standard');
      st.title = t('card.languageDefaultTip');
      // Vorgabe werden nimmt zugleich in den Vorrat auf: eine Vorgabesprache
// ausserhalb des Vorrats ist ein Zustand, den es nicht geben darf.
      st.onclick = () => sendLanguages({ languageDefault: a.code }, t('card.languageDefaultSaved'));
      const nm = document.createElement('span');
      nm.className = 'engine-name';
      nm.textContent = a.name;
      row.append(hk, st, nm);
      box.appendChild(row);
    });
    /* UND DIE ANSAGE DARUNTER, solange der Vorgabesprache etwas fehlt. */
    const gapCode = (LANGUAGES.find(a => a.isDefault) || {}).code;
    const gaps = gapCode ? languageGaps(gapCode) : { names: 0, words: 0 };
    if (gapCode && gaps.names + gaps.words > 0) {
      const note = document.createElement('p');
      note.className = 'langnote';
      note.textContent = languageGapLine(gapCode);
      box.appendChild(note);
    }
  }


/* ---- Karte „Zugang" — Abschnitt „Persönlich" ---- */
/* ZWEI KLEMMEN, UND BEIDE SITZEN HIER -- an derselben Stelle wie die Karte
   selbst und nicht an einer zweiten Abfrage daneben. */
function cardUser(fetched) {
  const { account } = fetched;
  return `<div class="sys-card">
        <h3>${tH('card.myAccount')}</h3>
        <p class="desc">${tH('card.accountHint')}</p>
        <div class="field"><label>${tH('login.username')}</label>
          <input class="input" id="acc-user" autocomplete="username" autocapitalize="off"
            spellcheck="false" value="${esc(account.username || '')}"></div>
        ${/* DIE EIGENE ADRESSE STEHT HIER UND NICHT IN DER KARTE „ZUGÄNGE“:
             sie gehört dem, der sie hat. */''}
        <div class="field"><label>${tH('login.email')} <span class="hint">${
          SIGNUP ? t('card.required') : t('card.optional')}</span></label>
          <input class="input" id="acc-mail" type="email" autocomplete="email"
            autocapitalize="off" spellcheck="false" value="${esc(account.email || '')}"
            placeholder="${esc(t('card.noneStoredYet'))}"></div>
        <div class="field"><label>${tH('card.oldPassword')} <span class="hint">${tH('card.neededToSave')}</span></label>
          <input class="input" id="acc-old" type="password" autocomplete="current-password"></div>
        ${/* DIE VORGABE STEHT AM FELD, FÜR DAS SIE GILT. */''}
        <div class="field"><label>${tH('dialog.newPassword')}
          <span class="hint">${tH('card.minCharsHint', { minPassword: MIN_PASSWORD })}</span></label>
          <input class="input" id="acc-new" type="password" autocomplete="new-password"></div>
        <div class="field"><label>${tH('card.repeatNewPassword')}</label>
          <input class="input" id="acc-new2" type="password" autocomplete="new-password"></div>
        <p class="desc" style="margin:0 0 10px">${SIGNUP
          ? `${tH('card.addressRequiredHint')} `
          : ''}${tH('card.resetMailHint')}</p>
        ${serverBox(t('card.forgotPasswordHint'), 'docker compose exec kriterion node usertool.js password <name>')}
        <button class="btn btn-accent btn-sm" id="acc-save" style="margin-top:10px">${tH('dialog.save')}</button>

        ${/* DER ZWEITE FAKTOR STEHT IN DIESER KARTE UND BEKOMMT KEINE EIGENE
             — es bleibt bei neunzehn. */''}
        <div class="two-factor-block" id="two-factor-block"></div>
      </div>`;
}
function setUpUserOut(fetched) {
  document.getElementById('acc-save').onclick = async () => {
    const old = document.getElementById('acc-old').value;
    const name = document.getElementById('acc-user').value.trim();
    const new1 = document.getElementById('acc-new').value;
    const new2 = document.getElementById('acc-new2').value;
    const address = document.getElementById('acc-mail').value.trim();
    if (!old) return toast(t('card.oldPasswordNeeded'), true);
    if (!name) return toast(t('login.usernameMissing'), true);
    if (new1 !== new2) return toast(t('card.passwordsDiffer'), true);
    if (new1 && new1.length < MIN_PASSWORD)
      return toast(t('login.passwordTooShort', { min: MIN_PASSWORD }), true);
    try {
      // Die Adresse geht IMMER mit, auch leer: der Server unterscheidet
      // „nicht angefasst“ (Feld fehlt) von „löschen“ (leer).
      const r = await api('PUT', '/api/account', {
        oldPassword: old, username: name, newPassword: new1, email: address
      });
      toast(r.passwordChanged ? t('card.passwordChanged') : t('list.saved'));
      // Die Kopfzeile nennt den Namen.
      NAME = name;
      renderSystem();   // leert die Passwortfelder
    } catch (e) { toast(e.message, true); }
  };
  drawTwoFactor(fetched.account.twoFactor);
}

  /* --- Der zweite Faktor in der Karte „Zugang“ --- DIESELBE BAUFORM WIE
     drawRequests(): die Karte zeichnet sich aus der ANTWORT der Handlung neu
     und fragt nicht ein zweites Mal nach. */
  function drawTwoFactor(status) {
    const box = document.getElementById('two-factor-block');
    if (!box || !status) return;
    box.innerHTML = status.an ? `
      <div class="two-factor-state two-factor-on">
        ${tH('card.twoFactorStateOn', { since: fmtDate(status.since) })}
        <div class="two-factor-count">${tH('card.recoveryCodes')}
          <strong>${tH('card.codesLeft', { codesLeft: status.codesOpen, codesTotal: status.codesTotal })}</strong>${status.codesOpen <= 2
            ? ` — <strong>${tH('card.codesRunningOut')}</strong>` : ''}</div>
      </div>
      <div class="row-in" style="margin-top:10px">
        <button class="btn btn-sm" id="two-factor-new">${tH('card.newRecoveryCodes')}</button>
        <button class="btn btn-ghost btn-sm" id="two-factor-off">${tH('card.twoFactorOff')}</button>
      </div>` : `
      <div class="two-factor-state two-factor-off">${tH('card.twoFactorStateOff')}</div>
      <p class="desc" style="margin:8px 0 10px">${tH('card.twoFactorHint')}</p>
      <button class="btn btn-sm" id="two-factor-on">${tH('card.twoFactorOn')}</button>`;

    /* Das Passwort wird an ALLEN Wegen verlangt, auch am Einschalten. */
    const ask = (title, event, withCode) => confirmFieldFree(title, event, withCode);

    atElement('two-factor-on', b => b.onclick = async () => {
      const e = await ask(t('card.twoFactorOn'),
        t('card.passwordNeeded'), false);
      if (e === null) return;
      try { showSecret(await api('POST', '/api/two-factor/start', { password: e.password })); }
      catch (err) { toast(err.message, true); }
    });

    atElement('two-factor-new', b => b.onclick = async () => {
      const e = await ask(t('card.newRecoveryCodes'),
        t('card.codesInvalidHint'), true);
      if (e === null) return;
      try {
        const r = await api('POST', '/api/two-factor/codes', e);
        drawTwoFactor(r);
        showAgainCodes(r.codes);
        toast(t('card.recoveryCodesMade'));
      } catch (err) { toast(err.message, true); }
    });

    atElement('two-factor-off', b => b.onclick = async () => {
      const e = await ask(t('card.twoFactorOff'),
        t('card.twoFactorOffHint'), true);
      if (e === null) return;
      try {
        drawTwoFactor(await api('DELETE', '/api/two-factor', e));
        TWO_FACTOR = false;
        toast(t('card.twoFactorTurnedOff'));
      } catch (err) { toast(err.message, true); }
    });
  }

  /* Schritt eins am Bildschirm: der Schlüssel steht da, und zwar in
     VIERERGRUPPEN — zweiunddreißig Zeichen am Stück sind der Weg, an dem
     Menschen aufgeben. */
  function showSecret(d) {
    const box = document.getElementById('two-factor-block');
    if (!box) return;
    box.innerHTML = `
      <div class="warn-box two-factor-setup">
        <strong>${tH('card.twoFactorStep1')}</strong>
        ${tH('card.shownOnceHint')}
        <div class="two-factor-key" id="two-factor-secret">${esc(d.groups)}</div>
        <div class="row-in" style="margin:8px 0 0">
          <button class="btn btn-sm" id="two-factor-copy">${tH('card.copyKey')}</button>
          <a class="btn btn-sm" id="two-factor-row" href="${esc(d.row)}">${tH('card.openInApp')}</a>
        </div>
        <p class="desc" style="margin:10px 0 0">${tH('card.openAppHint')}</p>
      </div>
      <div class="field" style="margin:12px 0 0"><label for="two-factor-check">${tH('card.twoFactorStep2', { digits: d.digits })}</label>
        <input class="input" id="two-factor-check" inputmode="numeric" autocomplete="one-time-code"
          spellcheck="false" maxlength="6"></div>
      <p class="desc" style="margin:0 0 10px">${tH('card.twoFactorProofHint')}</p>
      <div class="row-in">
        <button class="btn btn-accent btn-sm" id="two-factor-done">${tH('card.turnOn')}</button>
        <button class="btn btn-ghost btn-sm" id="two-factor-cancel">${tH('dialog.cancel')}</button>
      </div>`;
    const field = document.getElementById('two-factor-check');
    document.getElementById('two-factor-copy').onclick = () =>
      copyText(d.secret, t('card.keyCopied'), 'card.typeByHand');
    document.getElementById('two-factor-cancel').onclick = () => renderSystem();
    document.getElementById('two-factor-done').onclick = async () => {
      const e = await confirmFieldFree(t('card.twoFactorOn'),
        t('card.passwordAgainHint'), false);
      if (e === null) return;
      try {
        const r = await api('POST', '/api/two-factor/on', { password: e.password, code: field.value });
        drawTwoFactor(r);
        showAgainCodes(r.codes);
        TWO_FACTOR = true;
        toast(t('card.twoFactorTurnedOn'));
      } catch (err) { toast(err.message, true); }
    };
    field.focus();
  }

  /* DIE WIEDERHERSTELLUNGSCODES WERDEN GENAU EINMAL GEZEIGT, und der
     Bildschirm sagt es an derselben Stelle — mit demselben Ernst wie beim
     Einladungslink, und im selben Kasten. */
  function showAgainCodes(codes) {
    const box = document.getElementById('two-factor-block');
    if (!box || !Array.isArray(codes)) return;
    const boxId = document.createElement('div');
    boxId.className = 'warn-box';
    boxId.id = 'two-factor-codebox';
    boxId.innerHTML = `<strong>${tH('card.yourRecoveryCodes', { length: codes.length })}</strong>
      ${tH('card.recoveryCodesHint')}
      <div class="two-factor-codes">${codes.map(c => `<span>${esc(c)}</span>`).join('')}</div>
      ${/* DER SERVER-BEFEHL STAND HIER FUER JEDEN BENUTZER. Jetzt: ein Satz fuer
   alle, der Kasten nur fuer den Eigentuemer. */''}
      <p class="desc" style="margin:8px 0 0">${tH('card.allCodesUsed')}</p>
      ${serverBox(t('card.twoFactorOffUser'), 'docker compose exec kriterion node usertool.js twofactor <name>')}`;
    box.appendChild(boxId);
  }


/* ---- Karte „Meine Sitzungen" — Abschnitt „Persönlich" ---- */
function cardSessions() {
  return `<div class="sys-card">
        <h3>${tH('card.mySessions')}</h3>
        <p class="desc">${tH('card.sessionsHint')}</p>
        <div class="manage-list" id="msessions"></div>
        ${/* DIE FUSSZEILE STEHT NEBEN DER LISTE UND NICHT DARIN. */''}
        <div class="session-foot" id="msessions-foot"></div>
      </div>`;
}
function setUpSessionsOut(fetched) {
  drawSessions(fetched.sessions);
}

  /* --- Meine Sitzungen --- Gezeichnet wird aus dem, was oben schon geholt
     wurde -- eine Karte, die sich beim Einhaengen selbst nachlaedt, laeuft
     als herrenlose Zusage weiter. */
  function drawSessions(d) {
    const box = document.getElementById('msessions');
    if (!box) return;
    const doc = box.ownerDocument;
    const foot = doc.getElementById('msessions-foot');
    const list = (d && Array.isArray(d.sessions)) ? d.sessions : null;
    if (!list) {
      box.innerHTML = `<span class="hint">${tH('card.loginsLoadFailed')}</span>`;
      // UND DIE FUSSZEILE MIT -- sie steht ausserhalb der Liste
// und wuerde sonst die Zahl der letzten geglueckten Abfrage weitertragen.
      if (foot) foot.innerHTML = '';
      return;
    }
    box.innerHTML = '';
    const other = list.filter(z => !z.current).length;
    for (const z of list) {
      const row = doc.createElement('div');
      row.className = 'mrow session' + (z.current ? ' session-mine' : '');
      row.dataset.session = z.id || '';
      row.innerHTML = `<span class="mname">${z.current
          ? `${tH('card.thisSession')} <span class="user-mine">${tH('card.here')}</span>` : tH('card.otherSession')}</span>
        <span class="session-time">${tH('card.signedInAt', { signedInAt: fmtDate(z.loggedInAt) })}</span>
        <span class="session-time">${tH('card.lastSeen', { lastSeen: fmtDate(z.lastSeen) })}</span>`;
      if (!z.current) {
        const w = doc.createElement('span');
        w.className = 'user-act';
        w.innerHTML = `<button class="mact rm session-x" title="${esc(t('card.endThisSession'))}">${ICON_X}</button>`;
        row.appendChild(w);
        w.querySelector('.session-x').onclick = async () => {
          try { await api('DELETE', `/api/sessions/${z.id}`); toast(t('card.sessionEnded')); }
          catch (e) { return toast(e.message, true); }
          sessionsNew();
        };
      }
      box.appendChild(row);
    }
    /* DIE ZAHL IST DIE AUSKUNFT DIESER KARTE. */
    if (!foot) return;
    foot.innerHTML = other
      ? `<p class="desc" style="margin:10px 0 8px">${tH('card.otherSessionsHint', { n: other })}
          ${tH('card.sessionIdleHint', { days: d.days || 30 })}</p>
         <button class="btn btn-sm" id="sessions-all">${tH('card.endOtherSessions')}</button>`
      : `<p class="desc" style="margin:10px 0 0">${tH('card.onlySessionHint')}</p>`;
    const all = doc.getElementById('sessions-all');
    if (all) all.onclick = async () => {
      if (!await confirmBox(t('card.endSessionsAsk'), t('card.thisSessionStays'), t('card.end'))) return;
      try {
        const r = await api('DELETE', '/api/sessions');
        const n = r && r.ended ? r.ended : 0;
        toast(t('card.sessionsEnded', { n: n }));
      } catch (e) { return toast(e.message, true); }
      sessionsNew();
    };
  }
  async function sessionsNew() {
    const box = document.getElementById('msessions');
    if (!box) return;
    let d;
    try { d = await api('GET', '/api/sessions'); }
    catch (e) {
      if (box.isConnected) box.innerHTML = `<span class="hint">${esc(e.message)}</span>`;
      return;
    }
    if (box.isConnected) drawSessions(d);
  }


/* ---- Karte „Darstellung" — Abschnitt „Persönlich" ---- */
function cardAppearance() {
  return `<div class="sys-card">
        <h3>${tH('card.appearance')}</h3>
        ${/* DIE SPRACHE STEHT UEBER DEM FARBSCHEMA: sie entscheidet ueber
             jedes Wort der Karte darunter, und was weiter reicht, steht
             weiter oben. */''}
        <p class="desc">${tH('card.languageHint')}</p>
        <div class="pills" id="lang"></div>

        <p class="desc" style="margin:16px 0 8px">${tH('card.themeHint')}</p>
        <div class="pills" id="theme"></div>

        <p class="desc" style="margin:16px 0 8px">${tH('card.fontSizeHint')}</p>
        <div class="pills" id="fsize"></div>

        <p class="desc" style="margin:16px 0 8px">${tH('card.stripSizeHint')}</p>
        <div class="pills" id="tiles"></div>

        <p class="desc" style="margin:16px 0 8px">${tH('card.timelineHint')}</p>
        <label class="ex-files"><input type="checkbox" id="timeline-on"> ${tH('card.showTimeline')}</label>

        <p class="desc" style="margin:16px 0 8px">${tH('card.blocksHint')}</p>
        <button class="btn btn-ghost btn-sm" id="breset">${tH('card.restoreLayout')}</button>
      </div>`;
}
function setUpAppearanceOut() {
  drawLanguagePills();
  drawTheme();
  drawFont();
  drawStrip();
  /* --- Zeitleiste --- */
  const zl = document.getElementById('timeline-on');
  zl.checked = TIMELINE_ON;
  zl.onchange = async () => {
    const before = TIMELINE_ON;
    TIMELINE_ON = zl.checked;
    try { await api('PUT', '/api/settings', { timeline: TIMELINE_ON }); saved(); }
    catch (e) { TIMELINE_ON = before; zl.checked = before; toast(e.message, true); }
  };
  atElement('breset', breset => breset.onclick = async () => {
    if (!await confirmBox(t('card.restoreLayoutAsk'),
      t('card.blocksResetHint'),
      t('card.restore'))) return;
    BLOCKS = { side: [...BLOCK_DEFAULT.side], bottom: [...BLOCK_DEFAULT.bottom], zu: [] };
    try { await api('PUT', '/api/settings', { blocks: BLOCKS }); toast(t('card.layoutRestored')); }
    catch (e) { toast(e.message, true); }
  });
}

  /* --- Sprache, dieselbe Bauform wie das Farbschema darunter --- DIE NAMEN
     STEHEN IN IHRER EIGENEN SPRACHE: wer die Oberfläche gerade nicht lesen
     kann, findet seine trotzdem. */
  function drawLanguagePills() {
    const box = document.getElementById('lang');
    if (!box) return;
    box.innerHTML = '';
    // Nur der Vorrat, und nur, wenn es ueberhaupt etwas zu waehlen gibt.
    const choices = LANGUAGES.filter(a => a.active);
    if (choices.length < 2) return;
    choices.forEach(a => {
      const b = document.createElement('button');
      b.className = 'pill' + (LANGUAGE === a.code ? ' on' : '');
      b.textContent = a.name;
      b.onclick = async () => {
        if (LANGUAGE === a.code) return;
        try {
          /* DIE ANTWORT WIRD ANGENOMMEN UND NICHT WEGGEWORFEN. */
          takeVocabulary((await api('PUT', '/api/settings', { language: a.code })));
          await loadLanguages(a.code);
          applyLanguage();
          // Die ganze Ansicht neu -- die Karte selbst steht mitten darin.
          await renderSystem();
        } catch (e) { toast(e.message, true); }
      };
      box.appendChild(b);
    });
  }

  /* --- Farbschema, dieselbe Bauform wie die Schriftgröße darunter
     --- DREI PILLEN STATT FÜNF, und die mittlere ist die Vorgabe. */
  /* DREI REIHEN NACH DEMSELBEN MUSTER -- Farbschema, Schriftgroesse und der
     Bildstreifen: sofort sichtbar, bei einem Fehlschlag zurueck auf den alten
     Wert. */
  function drawTheme() { pillRow({ boxId: 'theme', levels: THEME_LEVELS,
    get: () => THEME, set: v => { THEME = v; }, label: v => t(THEME_NAMES[v]),
    apply: applyTheme, key: 'theme', mark: true }); }
  function drawFont() { pillRow({ boxId: 'fsize', levels: FONT_LEVELS,
    get: () => FONT, set: v => { FONT = v; }, label: v => v + ' %',
    apply: applyFont, key: 'font', mark: true }); }
  function drawStrip() { pillRow({ boxId: 'tiles', levels: STRIP_LEVELS,
    get: () => STRIP, set: v => { STRIP = v; }, label: v => v + t('card.px'),
    apply: applyTiles, key: 'strip', mark: true }); }


/* ---- Karte „Kategorien" — Abschnitt „Bestand" ---- */
function cardCategories() {
  return `<div class="sys-card">
        <h3>${tH('card.categories')}</h3>
        ${/* WAS HINTER EINER ROLLE LIEGT, WIRD IHR NICHT ERKLAERT (Regel S5): der
             Benutzer sieht die Liste und einen Satz, der Admin die Werkzeuge. */''}
        <p class="desc">${ADMIN
          ? tH('card.categoriesHint')
          : t('card.categoriesAdminHint')}</p>
        ${/* DIE SPRACHZEILE, F8b. */''}
        ${ADMIN && LANGUAGES.filter(a => a.active).length > 1
          ? `<div class="pills" id="ncatlang" style="margin-bottom:12px"></div>` : ''}
        ${/* DER KASTEN FUER DIE UNBEKANNTE ERSTELLUNGSSPRACHE. */''}
        ${ADMIN ? `<div class="namegap" id="nunknown" hidden></div>` : ''}
        <div class="manage-list" id="mcats"></div>
        ${/* DAS ANLEGEFELD. */''}
        ${manageCreate('cat')}
        ${ADMIN ? `<p class="desc" style="margin:16px 0 8px">${tH('card.adminOnlyCategory')}</p>
        <label class="ex-files"><input type="checkbox" id="cat-free">
          ${tH('card.anyoneNewCategory')}</label>` : ''}
      </div>`;
}
function setUpCategoriesOut(fetched) {
  // OHNE AUSWAHL, UND DAS IST KEINE AUSNAHME. Diese Kachel zeigt
  // ALLE Kategorien; ihre Auswahl IST die Tafel.
  drawNameLanguages('ncatlang', 'cats');
  drawNamesUnknown(fetched);
  manageList('mcats', namesFrom(fetched, 'cats'), 'cat', fetched);
  setUpManageCreate('cat', fetched);
  createToggle('cat-free', 'categoriesFreeCreate', () => CATEGORIES_FREE, v => { CATEGORIES_FREE = v; });
}

/* ---- Karte „Tags" — Abschnitt „Bestand" ---- */
function cardTags() {
  return `<div class="sys-card">
        <h3>${tH('list.tags')}</h3>
        <p class="desc">${ADMIN
          ? tH('card.tagsHint')
          : t('card.tagsAdminHint')}</p>
        <div class="manage-list" id="mtags"></div>
        ${/* DAS ANLEGEFELD -- fuer die Tags eine Zeile mehr als ein Eingabefeld, weil
             es sonst keinen Weg gaebe, einen Tag FUER SICH anzulegen. */''}
        ${manageCreate('tag')}
        ${ADMIN ? `<p class="desc" style="margin:16px 0 8px">${tH('card.adminOnlyTag')}</p>
        <label class="ex-files"><input type="checkbox" id="tag-free">
          ${tH('card.anyoneNewTag')}</label>` : ''}
      </div>`;
}
function setUpTagsOut(fetched) {
  manageList('mtags', fetched.tags, 'tag', fetched);
  setUpManageCreate('tag', fetched);
  createToggle('tag-free', 'tagsFreeCreate', () => TAGS_FREE, v => { TAGS_FREE = v; });
}

/* ---- Karte „Bewertungskriterien" — Abschnitt „Bestand" ---- */
/* EINE FUNKTION FUER BEIDE KARTEN. */
const CRIT_CARD = {
  after:  { list: 'mcrits',  field: 'newcrit',  button: 'newcrit-b' },
  before: { list: 'mpcrits', field: 'newpcrit', button: 'newpcrit-b' }
};

function cardCriteria(phase) {
  const before = phase === 'before';
  const k = CRIT_CARD[phase];
  return `<div class="sys-card">
        <h3>${tH('card.criteriaLabel', { label: before ? V.potential : V.ratingOne })}</h3>
        ${/* EIN SATZ AN DER KARTE, DIE FOLGEN HINTER „Mehr" -- und der
             Benutzer liest nur, was er tun kann (Regel S5). */''}
        ${before ? `<p class="desc">${tH('card.potentialStarsHint')}
             ${ADMIN ? t('card.criteriaHint') : t('card.listAdminHint')}</p>
           ${ADMIN ? more(tH('card.criteriaTip')) : ''}`
          : `<p class="desc">${ADMIN
          ? t('card.criteriaHintDelete')
          : tH('card.criteriaAdminHint')}</p>
           ${ADMIN ? more(tH('card.orderAppliesNote')) : ''}`}
        ${/* DIESELBE SPRACHZEILE WIE AN DEN KATEGORIEN, und aus demselben
             Grund. */''}
        ${ADMIN && LANGUAGES.filter(a => a.active).length > 1
          ? `<div class="pills" id="${k.list}-lang" style="margin-bottom:12px"></div>` : ''}
        ${/* DIE LISTE WIRD GEDAEMPFT, WENN DER MODUS AUS IST, F2. */''}
        <div class="manage-list${before && !POTENTIAL_MODE ? ' list-quiet' : ''}" id="${k.list}"></div>
        ${/* NICHT DER NAECHSTLIEGENDE WEG -- die Begruendung steht darunter. */''}
        <p class="desc" style="margin:10px 0 0">${tH('card.weightExplainHint')} ${ADMIN
            ? t('card.weightRangeHint')
            : t('card.weightSystemDefault')}</p>
        <!-- Ein Textfeld MIT Vorschlagsliste, kein Auswahlfeld: feste Stufen decken 0,2 bis 2 nicht
             ab, und ein Eintrag "anderer Wert ..." waere ein Moduswechsel -- erst waehlen, dann
             tippen, zwei Bedienformen fuer dieselbe Sache. Dasselbe Muster wie die Tageingabe am
             Eintrag (#newtag mit list="tagsug").
             ZWEI VORSCHLAEGE UNTER 1: die Liste ist der einzige Ort, an dem der Bereich unter 1
             ueberhaupt sichtbar wird. Ohne sie bliebe er da und waere nur nicht auffindbar.
             Sie kostet eine Zeile und der Server merkt davon nichts -- alles zwischen 0,2 und 2
             laesst sich ohnehin eintippen. -->
        ${/* DIE VORSCHLAGSLISTE STEHT NUR EINMAL IM DOKUMENT: sie gehoert dem
             Gewichtsfeld, und zwei `datalist` mit derselben Kennung waeren
             zwei Knoten fuer einen Verweis. */''}
        ${before ? '' : `<datalist id="weightsug">
          <option value="0,5"><option value="0,8"><option value="1"><option value="1,2"><option value="1,5">
        </datalist>`}
        ${ADMIN ? `<div class="row-in" style="margin-top:12px">
          <input class="input input-sm" id="${k.field}" placeholder="${esc(t('card.newCriterion'))}" style="padding:8px 11px">
          <button class="btn btn-sm" id="${k.button}">${tH('entry.create')}</button>
        </div>` : ''}
        ${/* DER SCHALTER DES POTENZIALMODUS, und er steht IN dieser
             Karte. */''}
        ${before ? `${!POTENTIAL_MODE
            ? `<p class="desc" id="pot-off" style="margin:16px 0 0">${tH('card.potentialModeOff')}</p>` : ''}
          ${ADMIN ? `<p class="desc" style="margin:16px 0 8px">${tH('card.potentialModeHint')}</p>
          <label class="ex-files"><input type="checkbox" id="pot-mode"${OWNER ? '' : ' disabled'}>
            ${tH('card.potentialModeLabel')}</label>
          ${OWNER ? '' : `<p class="desc">${tH('card.potentialModeOwner')}</p>`}` : ''}` : ''}
      </div>`;
}
/* DIE ZEILEN EINER KRITERIENKARTE. EIN Ausdruck fuer die Liste UND
   fuer die Pillenreihe darueber. */
function critRows(fetched, phase) {
  return namesFrom(fetched, 'crits').filter(c => c.phase === phase);
}
function setUpCriteriaOut(fetched, phase) {
  const k = CRIT_CARD[phase];
  // NUR DIE ZEILEN DIESES KASTENS.
  const rows = critRows(fetched, phase);
  drawNameLanguages(`${k.list}-lang`, 'crits', rows);
  manageList(k.list, rows, 'crit', fetched);
  // Hier wird angelegt, nicht am Eintrag. Das Feld gibt es nur
// fuer den Admin -- der Server verweigert es allen anderen ohnehin.
  const critField = document.getElementById(k.field);
  if (critField) {
    const addCrit = async () => {
      const name = critField.value.trim();
      if (!name) return;
      // DIE PHASE SCHICKT DIE KARTE MIT. Ohne sie legte die zweite Karte
// Bewertungskriterien an -- der Server hat die Vorgabe 'after'.
      try { await api('POST', '/api/criteria', { name, phase }); critField.value = ''; toast(t('card.criterionCreated')); adminNew(fetched); }
      catch (e) { toast(e.message, true); }
    };
    document.getElementById(k.button).onclick = addCrit;
    critField.addEventListener('keydown', e => { if (e.key === 'Enter') addCrit(); });
  }
  /* DER SCHALTER DES POTENZIALMODUS, und nur an der Potenzialkarte. */
  if (phase === 'before') createToggle('pot-mode', 'potentialMode',
    () => POTENTIAL_MODE, v => { POTENTIAL_MODE = v; },
    () => renderSystem({ keepScroll: true }));
}

  /* --- Die beiden Anlegen-Schalter --- Nur der Admin bekommt sie zu sehen;
     ein Haken, der zuverlaessig 403 erzeugt, saehe aus wie ein Fehler. */
  /* `after`, UND NUR EIN RUFER BRAUCHT ES. */
  const createToggle = (id, key, read, remember, after) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.checked = read();
    el.onchange = async () => {
      const before = read();
      remember(el.checked);
      try { await api('PUT', '/api/settings', { [key]: el.checked }); saved(); if (after) after(); }
      catch (e) { remember(before); el.checked = before; toast(e.message, true); }
    };
  };


  /* --- Kategorien, Tags und Kriterien verwalten --- */
  // Dieselbe Liste fuer alle drei. Kriterien haben zusaetzlich einen Griff,
// weil bei ihnen die Reihenfolge etwas bedeutet.
  /* DIE TABELLE HAELT DEN SCHLUESSEL, DAS WORT HOLT DIE LESESTELLE. */
  const MANAGE_KIND = {
    cat: {
      /* `create`: die Karte kann anlegen, und WIE sie es
         tut, steht hier -- Kennung des Feldes, Kennung des Knopfes, der
         Platzhalter und die Meldung danach. */
      create: { field: 'newmcat', button: 'newmcat-b',
                hint: 'card.newCategory', done: 'card.categoryCreated' },
      /* `perLanguage`: diese Liste traegt einen Namen JE SPRACHE,
         und das Umbenennen sagt deshalb, welche gemeint ist. */
      perLanguage: true,
      url: '/api/product-categories', askKey: 'card.deleteCategoryAsk',
      warning: e => t('card.categoryDeleteHint', { name: e.name, usage_count: e.usage_count, thing: vThing(e.usage_count) })
    },
    tag: {
      create: { field: 'newmtag', button: 'newmtag-b',
                hint: 'card.newTag', done: 'card.tagCreated' },
      url: '/api/tags', askKey: 'card.deleteTagAsk',
      // Beide Verwendungen nennen: sonst wird ein scheinbar ungenutzter Tag
// entfernt und reisst die Kennzeichnungen an den Testtagen mit.
      counter: e => `${e.usage_count} ${vThing(e.usage_count)} · ${e.test_usage_count} ${vTime(e.test_usage_count)}`,
      /* ZWEI ZAHLEN OHNE WORT. */
      shortCounter: e => `${e.usage_count} · ${e.test_usage_count}`,
      /* DAS „und" KAM AUS DEM QUELLTEXT und kommt jetzt aus der Sprachdatei. */
      /* DIE WERTE STEHEN AN BEIDEN RUFEN UND NICHT IN EINER VARIABLEN -- der
         Platzhalterwaechter liest die Rufstelle, und ein Wert, der in einem
         Bezeichner dorthin reist, ist fuer ihn nicht gereicht. */
      warning: e => {
        const things = `${e.usage_count} ${vThing(e.usage_count)}`;
        const times = `${e.test_usage_count} ${vTime(e.test_usage_count)}`;
        return e.test_usage_count
          ? t('card.marksGoneToo', { name: e.name, things: things, times: times })
          : t('card.tagDeleteHint', { name: e.name, things: things, times: times });
      }
    },
    crit: {
      url: '/api/criteria', askKey: 'card.deleteCriterionAsk', sortable: true,
      // DAS GEWICHTSFELD GEHOERT ALLEIN HIERHER.
      weight: true,
      perLanguage: true,
      warning: e => t('card.criterionDeleteHint', { name: e.name })
    }
  };

  /* DIE ANLEGEZEILE EINER VERWALTUNGSKARTE. */
  const manageCreate = (kind) => {
    const spec = MANAGE_KIND[kind].create;
    if (!spec || !ADMIN) return '';
    return `<div class="row-in" style="margin-top:12px">
          <input class="input input-sm" id="${spec.field}" placeholder="${esc(t(spec.hint))}" style="padding:8px 11px">
          <button class="btn btn-sm" id="${spec.button}">${tH('entry.create')}</button>
        </div>`;
  };
  function setUpManageCreate(kind, fetched) {
    const spec = MANAGE_KIND[kind].create;
    if (!spec) return;
    const field = document.getElementById(spec.field);
    if (!field) return;
    const add = async () => {
      const name = field.value.trim();
      if (!name) return;
      /* OHNE SPRACHANGABE, dieselbe Regel wie beim Umbenennen: angelegt wird
         IMMER die Grundzeile, und der Umschalter darueber fasst sie nicht
         an. */
      try {
        await api('POST', MANAGE_KIND[kind].url, { name });
        field.value = '';
        toast(t(spec.done));
        /* DIE NAMENSTAFELN ZIEHT adminNew() NACH. */
        adminNew(fetched);
      } catch (e) { toast(e.message, true); }
    };
    document.getElementById(spec.button).onclick = add;
    field.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  }

  function manageList(boxId, list, kind, fetched) {
    const box = document.getElementById(boxId);
    if (!box) return;
    const spec = MANAGE_KIND[kind];
    // Umbenennen und Loeschen gehoeren dem Admin -- bei allen dreien, und bei
    // den Kriterien auch das Sortieren.
    const may = ADMIN;
    box.innerHTML = '';
    if (!list.length) { box.innerHTML = `<span class="hint">${tH('card.nothingCreatedYet')}</span>`; return; }
    list.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'mrow' + (spec.sortable && may ? ' drag' : '');
      row.dataset.mid = entry.id;
      const url = spec.url;
      /* Die Zeile war schon besetzt: Griff, Name, Verwendungszaehler, ✎ und
         ✕. */
      const weightField = spec.weight
        ? (may
          ? `<span class="mweight" title="${esc(t('list.weightedAvg'))}">×<input class="mweight-field"
               type="text" inputmode="decimal" list="weightsug" aria-label="${esc(t('entry.weight'))}"
               value="${esc(weightText(entry.weight))}"></span>`
          : `<span class="mweight mweight-fixed" title="${esc(t('list.weightedAvg'))}">×${esc(weightText(entry.weight))}</span>`)
        : '';
      /* DER VERMERK AM RUECKFALL. */
      /* ZWEI SAETZE UND NICHT EINER. */
      /* BEIDE SCHLUESSEL STEHEN WOERTLICH DA und nicht als Variable. */
      /* UND SAGT DER ZWEITE SATZ ETWAS ANDERES. */
      /* UND NENNT DER SATZ BEIDE SPRACHEN. */
      const fallbackName = entry.nameFallback === true
        ? '' : languageNameOf(entry.nameFallback);
      const shownName = languageNameOf(namesLanguage());
      const fallbackMark = entry.nameFallback === undefined ? ''
        : (entry.nameFallback === true
          ? `<span class="mfallback" title="${esc(t('card.nameOriginal'))}">${
              tH('card.nameOriginal')}</span>`
          : `<span class="mfallback" title="${esc(t('card.nameFallback',
              { missing: shownName, language: fallbackName }))}">${
              tH('card.nameFallback',
              { missing: shownName, language: fallbackName })}</span>`);
      /* DAS ✕ AM FELD. */
      const mayClear = may && spec.perLanguage && entry.nameFallback === undefined &&
        entry.language !== namesLanguage();
      /* DER VERMERK STEHT AM ENDE DER ZEILE UND NICHT IM NAMENSKASTEN: in
         `.mnamebox` war er in der ersten Kachel vollstaendig zu sehen und in
         den beiden anderen nicht. */
      if (entry.nameFallback !== undefined) row.classList.add('withback');
      row.innerHTML = `${spec.sortable && may ? `<span class="grip" title="${esc(t('entry.dragToSort'))}">⣿</span>` : ''}
        <span class="mname${
          entry.nameFallback === undefined ? '' : ' back'}">${esc(entry.name)}</span>
        ${weightField}
        ${mayClear ? `<button class="mact nx" title="${esc(t('card.nameRemove'))}">${ICON_ERASE}</button>` : ''}
        ${countCell(spec.shortCounter ? spec.shortCounter(entry) : String(entry.usage_count),
                    spec.counter ? spec.counter(entry) : `${entry.usage_count} ${vThing(entry.usage_count)}`)}
        ${may ? `<button class="mact ed" title="${esc(t('card.rename'))}">${ICON_PEN}</button>
        <button class="mact rm" title="${esc(t('dialog.delete'))}">${ICON_X}</button>` : ''}
        ${fallbackMark}`;
      if (!may) { box.appendChild(row); return; }
      if (spec.sortable) {
        // Ziehen wie bei Fotos und Links: Pointer-Events, gleiche Schwelle.
// Die Knoepfe und das Umbenennfeld bleiben ausgenommen.
        makeSortable(row, {
          axis: 'y', selector: '.mrow', ignore: '.mact, input',
          onDrop: async (children) => {
            try {
              await api('PUT', '/api/criteria/order', { order: children.map(c => +c.dataset.mid) });
              toast(t('entry.orderSaved'));
              adminNew(fetched);
            } catch (e) { toast(e.message, true); adminNew(fetched); }
          }
        });
      }
      /* NACH EINEM GEWICHTSWECHSEL WIRD DIE LISTE NICHT NEU GEZEICHNET. */
      const weightInput = row.querySelector('.mweight-field');
      if (weightInput) weightInput.onchange = async () => {
        const g = weightOutText(weightInput.value);
        // Ein leeres oder unlesbares Feld schickt GAR NICHTS: wer den Inhalt
        // loescht und wegklickt, hat es sich anders ueberlegt und meint nicht
        // "Gewicht 0".
        if (Number.isNaN(g)) { weightInput.value = weightText(entry.weight); return; }
        try {
          /* DER NAME GEHT DAHIN ZURUECK, WO ER HERKOMMT. */
          /* UND GEHT DER VIERTE SCHRITT OHNE SPRACHANGABE
             ZURUECK. */
          const nameLanguage = entry.nameFallback === true
            ? null : (entry.nameFallback || namesLanguage());
          const now = await api('PUT', `${url}/${entry.id}`, spec.perLanguage
            ? { name: entry.name, weight: g,
                ...(nameLanguage === null ? {} : { language: nameLanguage }) }
            : { name: entry.name, weight: g });
          // Den Datensatz IN DER LISTE nachziehen statt neu zu laden -- sonst
// zeigte die naechste Zeichnung wieder den alten Wert.
          entry.weight = now.weight;
          // Zeigt die Rundung mit: 1,234 steht danach als 1,23 im Feld. Die
// Rundung ist damit nicht still.
          weightInput.value = weightText(now.weight);
          toast(t('card.weightSaved'));
        } catch (e) {
          toast(e.message, true);
          // Kein Wert im Feld, der nicht gespeichert ist.
          weightInput.value = weightText(entry.weight);
        }
      };
      row.querySelector('.ed').onclick = () => {
        const inp = document.createElement('input');
        inp.className = 'medit';
        /* IM FELD STEHT NUR DAS EINGETRAGENE -- dieselbe Entscheidung wie an den
           vierzehn Vokabelfeldern. */
        inp.value = entry.nameFallback ? '' : entry.name;
        if (entry.nameFallback) inp.placeholder = entry.name;
        row.querySelector('.mname').replaceWith(inp);
        const mark = row.querySelector('.mfallback');
        if (mark) mark.remove();
        inp.focus(); inp.select();
        const save = async () => {
          const name = inp.value.trim();
          /* EIN LEERES FELD SCHICKT GAR NICHTS, und ist das an
             einer Zeile OHNE Eintrag der gewoehnliche Fall: wer das ✎ oeffnet
             und wieder wegklickt, hat es sich anders ueberlegt. */
          if (!name || name === entry.name) return adminNew(fetched);
          /* DIE SPRACHE GEHT MIT, und NUR an den
             beiden Listen, die eine haben. */
          const body = spec.perLanguage ? { name, language: namesLanguage() } : { name };
          try { await api('PUT', `${url}/${entry.id}`, body); toast(t('card.renamed'));
                adminNew(fetched); }
          catch (e) { toast(e.message, true); adminNew(fetched); }
        };
        inp.onblur = save;
        inp.onkeydown = e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') adminNew(fetched); };
      };
      /* DAS ✕ RAEUMT EINEN EINTRAG WEG UND LOESCHT NICHTS SONST. */
      const clearKnob = row.querySelector('.nx');
      if (clearKnob) clearKnob.onclick = async () => {
        if (!await confirmBox(t('card.nameRemoveAsk'),
          t('card.nameRemoveHint', { language: languageNameOf(namesLanguage()) }),
          t('dialog.delete'))) return;
        try {
          await api('PUT', `${url}/${entry.id}`,
            { clearName: true, language: namesLanguage() });
          toast(t('card.nameRemoved'));
          adminNew(fetched);
        } catch (e) { toast(e.message, true); }
      };
      row.querySelector('.rm').onclick = async () => {
        if (!await confirmBox(t(spec.askKey), spec.warning(entry))) return;
        try { await api('DELETE', `${url}/${entry.id}`); toast(t('card.deleted')); adminNew(fetched); }
        catch (e) { toast(e.message, true); }
      };
      box.appendChild(row);
    });
  }
  function drawAdmin(fetched) {
    /* DURCH namesFrom() UND NICHT AUS `fetched`. */
    manageList('mcats', namesFrom(fetched, 'cats'), 'cat', fetched);
    /* UND DIE PILLENREIHEN MIT. Sie tragen seit dieser Runde eine
       ZAHL, und die aendert sich mit jedem Umbenennen, Anlegen und Raeumen. */
    drawNameLanguages('ncatlang', 'cats');
    drawNamesUnknown(fetched);
    manageList('mtags', fetched.tags, 'tag', fetched);
    // BEIDE KRITERIENLISTEN, aus DERSELBEN Antwort.
    for (const phase of Object.keys(CRIT_CARD)) {
      const rows = critRows(fetched, phase);
      drawNameLanguages(`${CRIT_CARD[phase].list}-lang`, 'crits', rows);
      manageList(CRIT_CARD[phase].list, rows, 'crit', fetched);
    }
  }
  async function adminNew(fetched) {
    /* UND DIE NAMENSTAFELN MIT. */
    const [cats, tags, crits, settings] = await Promise.all([
      api('GET', '/api/product-categories'), api('GET', '/api/tags'), api('GET', '/api/criteria'),
      api('GET', '/api/settings')
    ]);
    [fetched.cats, fetched.tags, fetched.crits] = [cats, tags, crits];
    takeNames(settings);
    drawAdmin(fetched);
  }


/* ---- Karte „Vokabular" — Abschnitt „Bestand" ---- */
function cardVocabulary() {
  return `<div class="sys-card">
        <h3>${tH('card.vocabulary')}</h3>
        <p class="desc">${tH('card.vocabularyHint')}</p>
        ${/* FUENFZEHN FELDER AUS EINER TABELLE, und
             sind es fuenfzehn. */''}
        ${/* DIE SPRACHZEILE UEBER DEN FELDERN, F3. */''}
        ${LANGUAGES.filter(a => a.active).length > 1
          ? `<div class="pills" id="vlang" style="margin-bottom:12px"></div>` : ''}
        <div class="vocabulary-grid">
        ${/* DER HINWEIS FOLGT DER KACHEL UND NICHT DEM LESER. */''}
        ${/* UND DIE FEHLENDEN ZELLEN GEDAEMPFT MARKIERT. */''}
          ${VOCABULARY_FIELDS.map(([id, key, name]) => `<div class="field${
            vocabularyShown()[key] ? '' : ' gap'}"><label for="${id}">${esc(name())}
            <span class="hint">${tH('card.defaultValue', { defaultWord: vocabularyDefaultShown()[key] })}</span></label>
            <input class="input input-sm" id="${id}" maxlength="40" value="${esc(vocabularyShown()[key] || '')}"></div>`).join('')}
        </div>
        <div class="vocabulary-preview" id="vpreview"></div>
        <div class="row-in" style="margin-top:12px">
          <button class="btn btn-accent btn-sm" id="vsave">${tH('card.saveVocabulary')}</button>
          <button class="btn btn-ghost btn-sm" id="vreset">${tH('card.restoreDefaults')}</button>
        </div>
      </div>`;
}
/* DIE TABELLE DER VOKABELFELDER: Kennung, Schluessel, Beschriftung. */
/* AUCH HIER RUFE STATT WERTE, aus demselben Grund wie bei
   SYS_SECTIONS: die Vorgabe steht in der Sprachdatei, und die ist beim
   Auswerten dieser Zeile noch nicht geladen. */
/* UND DIE BESCHRIFTUNGEN -- Rufe und keine Werte: diese Zeile wird beim Laden
   der Datei ausgewertet, und da gibt es noch keinen Text. */
const VOCABULARY_FIELDS = [
  ['v1', 'entryOne', () => t('card.itemOne')], ['v2', 'entryMany', () => t('card.itemMany')],
  ['v3', 'testedYes', () => t('card.testedYes')], ['v4', 'testedNo', () => t('card.testedNo')],
  ['v5', 'dayOne', () => t('card.dayOne')], ['v6', 'dayMany', () => t('card.dayMany')],
  ['v7', 'reportOne', () => t('card.reportOne')], ['v8', 'reportMany', () => t('card.reportMany')],
  ['v9', 'taskOne', () => t('card.taskOne')], ['v10', 'taskMany', () => t('card.taskMany')],
  ['v11', 'taskDone', () => t('card.taskDone')],
  /* DAS WORT FUER DEN ZWEITEN STERNKASTEN. */
  ['v12', 'potential', () => t('card.potential')],
  /* UND DAS PAAR FUER DEN ERSTEN: Kastenkopf, Sortierung,
     Vergleich, Kachel, Karte, Glocke und Loeschdialoge lesen es. */
  ['v13', 'ratingOne', () => t('card.ratingOne')],
  ['v14', 'ratingMany', () => t('card.ratingMany')],
  /* UND DAS FUENFZEHNTE, Strang 2. */
  ['v15', 'grade', () => t('card.grade')]
];
/* WELCHE SPRACHE DIE KARTEN „KATEGORIEN" UND „KRITERIEN" GERADE ZEIGEN. */
const namesLanguage = () => {
  const ok = LANGUAGES.some(a => a.active && a.code === NAMES_SHOWN);
  return ok ? NAMES_SHOWN : LANGUAGE;
};
/* WELCHE SPRACHE DIE GRUNDZEILE TRAEGT -- die Vorgabe der Installation. */
const baseNamesLanguage = () => (LANGUAGES.find(a => a.isDefault) || {}).code || LANGUAGE;
/* WIE EINE SPRACHE HEISST -- in ihrer EIGENEN Sprache, wie ueberall in dieser
   Oberflaeche: der Server schickt den Namen mit (`languageName()` dort), und
   die Kennung bleibt stehen, wenn keiner ankommt. */
const languageNameOf = (code) =>
  ((LANGUAGES.find(a => a.code === code) || {}).name) || code;
/* WELCHE FORM EINE SPRACHE HINTER EINER ZAHL NIMMT. */
const afterNumberOf = (code) =>
  (((LANGUAGES.find(a => a.code === code) || {}).afterNumber) === 'one' ? 'one' : 'plural');
/* DIE LISTE IN DER GEZEIGTEN SPRACHE, und RECHNET SIE
   NICHT MEHR MIT. */
function namesFrom(fetched, key) {
  const rows = fetched[key] || [];
  const code = namesLanguage();
  const shown = (NAMES_ALL[key] || {})[code];
  if (!shown) return rows;
  return rows.map(z => {
    if (!z || z.id === undefined) return { ...z };
    const hit = shown[z.id];
    if (!hit || hit.name === undefined) return { ...z };
    /* UND DER STEMPEL DES SERVERS MUSS AUSDRUECKLICH WEG. */
    if (hit.from === code) return { ...z, name: hit.name, nameFallback: undefined };
    return { ...z, name: hit.name, nameFallback: hit.from === null ? true : hit.from };
  });
}
/* WIE VIELE ZELLEN EINER SPRACHE NICHT EINGETRAGEN SIND. */
/* UND ZAEHLT SIE JE KACHEL. `only` ist die Menge der Kennungen,
   die eine Kachel wirklich zeigt; ohne Angabe zaehlt sie die ganze Tafel. */
const namesMissing = (key, code, only) => {
  const table = (NAMES_ALL[key] || {})[code];
  if (!table) return 0;
  return Object.entries(table).filter(([id, z]) =>
    (!only || only.has(Number(id))) && (!z || z.from !== code)).length;
};
/* WIE VIELE ZEILEN GAR KEINE ERSTELLUNGSSPRACHE HABEN -- ueber BEIDE Tafeln,
   weil der eine Knopf beide Tabellen schreibt. */
const namesWithoutLanguage = () => {
  const base = baseNamesLanguage();
  let n = 0;
  for (const key of ['cats', 'crits']) {
    const table = (NAMES_ALL[key] || {})[base];
    if (table) n += Object.values(table).filter(z => z && z.from === null).length;
  }
  return n;
};
/* DIE PILLENREIHE UEBER EINER ADMINLISTE. */
function drawNameLanguages(boxId, key, rows) {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.innerHTML = '';
  const shownCode = namesLanguage();
  /* DIE KENNUNGEN DIESER KACHEL. */
  const only = rows ? new Set(rows.map(z => z.id)) : null;
  LANGUAGES.filter(a => a.active).forEach(a => {
    const b = document.createElement('button');
    b.className = 'pill' + (shownCode === a.code ? ' on' : '');
    const gaps = namesMissing(key, a.code, only);
    /* DER NAME GEHT DURCH esc(), die Zahl ist eine Zahl -- innerHTML ist
       innerHTML, auch wenn beides aus der eigenen Antwort kommt. */
    b.innerHTML = esc(a.name) + (gaps
      ? `<span class="n">${Number(gaps)}</span>`
      : '<span class="dot" aria-hidden="true">●</span>');
    b.title = gaps ? t('card.languageMissing', { n: gaps }) : t('card.languageComplete');
    b.onclick = () => { NAMES_SHOWN = a.code; renderSystem({ keepScroll: true }); };
    box.appendChild(b);
  });
  /* UND DER RAHMEN AN DER KACHEL. */
  const card = box.closest('.sys-card');
  if (card) card.classList.toggle('gaps', namesMissing(key, shownCode, only) > 0);
}
/* DER KASTEN FUER DIE UNBEKANNTE ERSTELLUNGSSPRACHE. Die
   Migration fuellt nichts, und hier wird EINMAL nachgefragt. */
function drawNamesUnknown(fetched) {
  const box = document.getElementById('nunknown');
  if (!box) return;
  const open = namesWithoutLanguage();
  box.innerHTML = '';
  box.hidden = open === 0;
  if (!open) return;
  const code = namesLanguage();
  const line = document.createElement('p');
  line.className = 'desc';
  line.style.margin = '0 0 8px';
  line.textContent = `${t('card.namesUnknown', { n: open })} — ${t('card.namesUnknownHint')}`;
  const knob = document.createElement('button');
  knob.className = 'btn btn-sm';
  knob.id = 'nassign';
  knob.textContent = t('card.namesAssign', { language: languageNameOf(code) });
  knob.onclick = async () => {
    try {
      const r = await api('PUT', '/api/names/language', { language: code });
      /* DIE TAFELN KOMMEN AUS DERSELBEN ANTWORT und nicht aus einem zweiten
         Abruf -- dieselbe Bauform wie beim Wechsel der Vorgabesprache. */
      takeNames(r);
      toast(t('card.namesAssigned',
        { n: (r.categories || 0) + (r.criteria || 0), language: languageNameOf(code) }));
      adminNew(fetched);
    } catch (e) { toast(e.message, true); }
  };
  box.append(line, knob);
}
/* WELCHE SPRACHE DER ABSCHNITT „BESTAND" GERADE ZEIGT, STEHT AN
   EINER EINZIGEN STELLE -- in `namesLanguage()` weiter oben, und sie gilt
   fuer ALLE VIER KACHELN. */
/* DIE VIERZEHN WOERTER, DIE IN DEN FELDERN STEHEN: das, was fuer
   diese Sprache EINGETRAGEN ist, und sonst nichts. */
const vocabularyShown = () => VOCABULARIES_OWN[namesLanguage()] || {};
/* WAS EIN LESER DIESER SPRACHE SAEHE -- mit Rueckfall, und genau dafuer gibt
   es die Tafel des Servers. */
const vocabularyEffective = () => {
  const code = namesLanguage();
  if (code === LANGUAGE) return V;
  return VOCABULARIES[code] || V;
};
/* UND DIE VORGABE DER GEZEIGTEN SPRACHE, die Reparatur von B4. */
const vocabularyDefaultShown = () =>
  VOCABULARY_DEFAULTS[namesLanguage()] || vocabularyDefault();

function setUpVocabularyOut() {
  drawVocabularyLanguages();
  // Die Probe zeigt dieselben Textbausteine, die die Oberfläche später
// benutzt — damit sich Einzahl und Mehrzahl vor dem Speichern prüfen lassen.
  const vFields = () => Object.fromEntries(VOCABULARY_FIELDS.map(([id, key]) =>
    [key, document.getElementById(id).value]));
  function drawPreview() {
    const w = vFields();
    /* DER RUECKFALL DER VORSCHAU IST DER SATZ DER GEZEIGTEN SPRACHE, und nicht mehr `V`, der Satz des Lesers. */
    const e = vocabularyEffective();
    const entryWord = w.entryOne.trim() || e.entryOne;
    const sm = w.entryMany.trim() || e.entryMany;
    const z1 = w.dayOne.trim() || e.dayOne;
    const zm = w.dayMany.trim() || e.dayMany;
    const ja = w.testedYes.trim() || e.testedYes;
    const no = w.testedNo.trim() || e.testedNo;
    const reportWord = w.reportOne.trim() || e.reportOne;
    const bm = w.reportMany.trim() || e.reportMany;
    const a1 = w.taskOne.trim() || e.taskOne;
    const at = w.taskMany.trim() || e.taskMany;
    const doneWord = w.taskDone.trim() || e.taskDone;
    const potentialWord = w.potential.trim() || e.potential;
    const rateOne = w.ratingOne.trim() || e.ratingOne;
    const rateMany = w.ratingMany.trim() || e.ratingMany;
    /* DIE MEHRZAHL IN DER VORSCHAU: MIT ZAHL, WO DIE ZAHL SIE WAEHLT -- und
       OHNE, wo die Sprache hinter einer Zahl die Einzahl verlangt. */
    const many = (n, word) =>
      (afterNumberOf(namesLanguage()) === 'one' ? esc(word) : `${n} ${esc(word)}`);
    document.getElementById('vpreview').innerHTML =
      `<span class="label">${tH('card.preview')}</span>
       <span>+ ${esc(entryWord)}</span><span>${tH('card.delete', { entryWord: entryWord })}</span><span>${many(7, sm)}</span>
       <span>${esc(ja)} / ${esc(no)}</span>
       <span>1 ${esc(z1)}</span><span>${many(3, zm)}</span>
       <span>${tH('card.markAs', { reportWord: reportWord })}</span><span>${many(2, bm)}</span>
       <span>${tH('card.markAs', { reportWord: a1 })}</span><span>${many(4, at)}</span>
       <span>${tH('card.setTo', { doneWord: doneWord })}</span>
       ${/* DIE PROBE ZEIGT DAS WORT SO, WIE ES SPAETER STEHT -- getrennt und
            nie verbaut. */''}
       <span>${tH('card.criteriaPotential', { potentialWord: potentialWord })}</span><span>${tH('card.sortPotentialDesc', { potentialWord: potentialWord })}</span>
       <span>${tH('card.criteriaPotential', { potentialWord: rateOne })}</span><span>${tH('card.sortPotentialDesc', { potentialWord: rateOne })}</span><span>${many(2, rateMany)}</span>`;
  }
  /* DER UMSCHALTER. */
  /* WIE VIELE DER VIERZEHN WOERTER EINER SPRACHE FEHLEN. */
  function vocabularyMissing(code) {
    return VOCABULARY_FIELDS.filter(
      ([, key]) => !(((VOCABULARIES_OWN || {})[code] || {})[key])).length;
  }
  function drawVocabularyLanguages() {
    const box = document.getElementById('vlang');
    if (!box) return;
    box.innerHTML = '';
    LANGUAGES.filter(a => a.active).forEach(a => {
      const b = document.createElement('button');
      b.className = 'pill' + (namesLanguage() === a.code ? ' on' : '');
      /* PUNKT UND ZAHL WIE AN DEN NAMENSKARTEN, und
         ausdruecklich dieselbe Gestalt: es ist dieselbe Frage („was fehlt
         dieser Sprache") an einem anderen Bestand. */
      const gaps = vocabularyMissing(a.code);
      b.innerHTML = esc(a.name) + (gaps
        ? `<span class="n">${Number(gaps)}</span>`
        : '<span class="dot" aria-hidden="true">●</span>');
      b.title = gaps ? t('card.wordsMissing', { n: gaps }) : t('card.languageComplete');
      b.onclick = () => {
        /* DIESELBE ANGABE WIE AN DEN NAMENSKARTEN. Wer hier
           umschaltet, schaltet den ganzen Abschnitt um, und umgekehrt. */
        NAMES_SHOWN = a.code;
        /* MIT DER BILDLAUFSTELLUNG. */
        renderSystem({ keepScroll: true });
      };
      box.appendChild(b);
    });
    /* UND DER ROTE RAHMEN AN DER KACHEL, solange der GEZEIGTEN Sprache etwas
       fehlt -- dieselbe Zeile wie an den Namenskarten. */
    const card = box.closest('.sys-card');
    if (card) card.classList.toggle('gaps', vocabularyMissing(namesLanguage()) > 0);
  }
  // Die Karte steht nur dem Admin offen; ohne sie gibt es weder Felder noch
  // Probe.
  VOCABULARY_FIELDS.forEach(([id]) =>
    atElement(id, field => field.addEventListener('input', drawPreview)));
  if (document.getElementById('vpreview')) drawPreview();

  /* GESPEICHERT WIRD JE SPRACHE, F3. */
  const vocabularyBody = (words) => ({ [namesLanguage()]: words });
  /* DIE DREI TAFELN ZIEHEN MIT, ueber takeVocabulary() weiter oben. */
  atElement('vsave', vsave => vsave.onclick = async () => {
    try {
      const r = await api('PUT', '/api/settings', { vocabulary: vocabularyBody(vFields()) });
      takeVocabulary(r);
      toast(t('card.vocabularySaved'));
      // Leere Felder bleiben leer, der Hinweis sagt die Vorgabe -- und die
// Bildlaufstellung bleibt, wo sie war.
      renderSystem({ keepScroll: true });
    } catch (e) { toast(e.message, true); }
  });
  atElement('vreset', vreset => vreset.onclick = async () => {
    if (!await confirmBox(t('card.restoreDefaultsAsk'),
      t('card.vocabularyResetHint'),
      t('card.reset'))) return;
    try {
      // Leer heisst Vorgabe: der Server setzt fuer jedes leere Feld sein Wort ein.
      const empty = Object.fromEntries(VOCABULARY_FIELDS.map(([, k]) => [k, '']));
      const r = await api('PUT', '/api/settings', { vocabulary: vocabularyBody(empty) });
      takeVocabulary(r);
      toast(t('card.defaultsRestored'));
      renderSystem({ keepScroll: true });
    } catch (e) { toast(e.message, true); }
  });
}


/* ---- Karte „Links" — Abschnitt „Bestand" ---- */
function cardLinks() {
  return `<div class="sys-card">
        <h3>${tH('dialog.links')}</h3>
        <p class="desc">${tH('card.linkRowsHint')}</p>
        <div class="pills" id="lrows"></div>

        <p class="desc sys-part">${tH('card.linkListHint')}</p>
        <p class="desc" style="margin:0 0 8px">${tH('card.engineCountHint')}</p>
        <div class="pills" id="snames"></div>
      </div>`;
}
function setUpLinksOut() {
  drawLinkRows();
  drawSearchNames();
}

  /* --- Sichtbare Linkzeilen --- */
  /* UND ZWEI OHNE SOFORTIGE WIRKUNG: die Zahl der Zeilen wirkt beim naechsten
     Zeichnen der Linkliste, die Zahl der Namen beim naechsten Aufbau. */
  function drawLinkRows() { pillRow({ boxId: 'lrows', levels: LINK_ROW_LEVELS,
    get: () => LINK_ROWS, set: v => { LINK_ROWS = v; }, label: v => v + t('card.rows'),
    key: 'linkRows' }); }
  function drawSearchNames() { pillRow({ boxId: 'snames', levels: SEARCH_NAME_LEVELS,
    get: () => SEARCH_NAMES, set: v => { SEARCH_NAMES = v; }, label: v => t('card.names', { n: v }),
    key: 'searchNames' }); }


/* ---- Karte „Suchanbieter" — Abschnitt „Bestand" ---- */
function cardSearchProvider() {
  return `<div class="sys-card">
        <h3>${tH('card.searchEngines')}</h3>
        <p class="desc">${tH('card.engineCheckboxHint')}</p>
        ${more(t('card.searchUsersHint'))}
        <div class="engine-list" id="engines"></div>

        <p class="desc sys-part">${tMarks('card.ownEnginesHint', {
          word: '<code>%s</code>', word2: '<code>http://</code>', word3: '<code>https://</code>' })}</p>
        <div class="engine-own" id="engines-own"></div>
        ${more(tMarks('card.searchDomainTip', {
          word: '<code>https://www.google.com/search?q=site%3Aforum.beispiel.de+%s</code>',
          word2: '<code>%3A</code>' }))}
      </div>`;
}
function setUpSearchProviderOut() {
  drawProvider();
  drawOwn();
}

  /* --- Suchanbieter --- */
  // Der Vorrat als Liste von Schluesseln, Standard zuerst -- dieselbe Form,
  // in der der Server sie speichert.
  const poolList = () => {
    const std = SEARCH_PROVIDERS.find(a => a.active && a.isDefault);
    const rest = SEARCH_PROVIDERS.filter(a => a.active && a !== std).map(a => a.key);
    return std ? [std.key, ...rest] : rest;
  };

  async function sendProvider(body, message) {
    try {
      const s = await api('PUT', '/api/settings', body);
      if (Array.isArray(s.searchProviders)) SEARCH_PROVIDERS = s.searchProviders;
      drawProvider(); drawOwn();
      toast(message);
    } catch (e) { drawProvider(); drawOwn(); toast(e.message, true); }
  }

  function drawProvider() {
    const box = document.getElementById('engines');
    if (!box) return;
    box.innerHTML = '';
    SEARCH_PROVIDERS.forEach(a => {
      const row = document.createElement('div');
      row.className = 'engine' + (a.present ? '' : ' blank');
      row.dataset.k = a.key;
      const hk = document.createElement('input');
      hk.type = 'checkbox';
      hk.checked = !!a.active;
      hk.disabled = !a.present;
      hk.title = t('card.addToSelection');
      hk.onchange = () => {
        const keys = poolList();
        sendProvider({ searchOn: hk.checked ? [...keys, a.key] : keys.filter(k => k !== a.key) },
          t('card.selectionSaved'));
      };
      const st = document.createElement('button');
      st.type = 'button';
      st.className = 'sdefault' + (a.isDefault ? ' on' : '');
      st.textContent = t('card.standard');
      st.disabled = !a.present;
      st.title = t('card.searchLineHint');
      // Start nimmt zugleich in die Auswahl auf: ein Startanbieter ausserhalb
// des Vorrats ist ein Zustand, den es nicht geben darf.
      st.onclick = () => sendProvider(
        { searchOn: [a.key, ...poolList().filter(k => k !== a.key)] },
        t('list.saved'));
      // Der Name kommt aus dem Verwaltungsbereich und ist freier Text --
// textContent statt innerHTML, damit Maskierung nicht vergessbar ist.
      const nm = document.createElement('span');
      nm.className = 'engine-name';
      nm.textContent = a.present ? a.name : '—';
      row.append(hk, st, nm);
      box.appendChild(row);
    });
  }

  function drawOwn() {
    const box = document.getElementById('engines-own');
    if (!box) return;
    box.innerHTML = '';
    SEARCH_PROVIDERS.filter(a => a.own).forEach((a, i) => {
      const row = document.createElement('div');
      row.className = 'engine-slot';
      const nm = document.createElement('input');
      nm.className = 'input input-sm'; nm.id = `se-name-${i + 1}`;
      nm.maxLength = 20; nm.placeholder = t('card.name'); nm.value = a.name || '';
      const vl = document.createElement('input');
      vl.className = 'input input-sm'; vl.id = `se-vorlage-${i + 1}`;
      vl.maxLength = 300; vl.placeholder = 'https://forum.beispiel.de/suche?q=%s';
      vl.value = a.template || '';
      const b3 = document.createElement('button');
      b3.className = 'btn btn-sm'; b3.id = `se-b-${i + 1}`;
      b3.textContent = t('card.apply');
      b3.onclick = () => sendOwn();
      row.append(nm, vl, b3);
      box.appendChild(row);
    });
  }

  /* Immer alle Plaetze auf einmal: der Server bekommt den ganzen Stand und
     raeumt danach auf. DIE ZAHL DER PLAETZE KOMMT VOM SERVER -- als festes
     Array stuende sie ein zweites Mal neben OWN_SLOTS. */
  function sendOwn() {
    const list = SEARCH_PROVIDERS.filter(a => a.own).map((a, i) => ({
      name: document.getElementById(`se-name-${i + 1}`)?.value || '',
      template: document.getElementById(`se-vorlage-${i + 1}`)?.value || ''
    }));
    return sendProvider({ searchOwn: list }, t('list.saved'));
  }


/* ---- Karte „Papierkorb" — Abschnitt „Bestand" ---- */
function cardTrash() {
  return `<div class="sys-card">
        <h3>${tH('card.trash')}</h3>
        <p class="desc">${tH('card.trashKeepsHint', { trashDays: TRASH_DAYS })}
          ${OWNER ? '' : t('card.trashOwnerHint')}</p>
        <div class="manage-list" id="mtrash"></div>
      </div>`;
}
function setUpTrashOut(fetched) {
  drawTrash(fetched);
}

  /* --- Papierkorb --- */
  /* Gezeichnet wird aus dem, was oben schon geholt wurde -- dieselbe Bauform
     wie bei den drei Verwaltungskarten. */
  async function trashNew(fetched) {
    try { fetched.trash = await api('GET', '/api/trash'); }
    catch (e) {
      const box = document.getElementById('mtrash');
      if (box) box.innerHTML = `<span class="hint">${esc(e.message)}</span>`;
      return;
    }
    drawTrash(fetched);
  }
  function drawTrash(fetched) {
    const box = document.getElementById('mtrash');
    if (!box) return;
    const rows = Array.isArray(fetched.trash && fetched.trash.rows) ? fetched.trash.rows : [];
    box.innerHTML = '';
    if (!rows.length) {
      box.innerHTML = `<span class="hint">${tH('card.noDeletedEntries')}</span>`;
      return;
    }
    rows.forEach(z => {
      const row = document.createElement('div');
      row.className = 'mrow trash';
      row.dataset.pkid = z.id;
      const open = Number(z.daysOpen);
      /* DIE ZEILE NENNT DAS LOESCHDATUM UND NICHT DEN ANLEGER (B6
         B), entschieden vom Betreiber am 8. */
      const meta = [
        t('card.deletedByOn', { deletedAt: fmtDate(z.deleted_at), deletedBy: authorName(z.deletedBy) }),
        t('card.daysLeft', { n: open }),
        fmtBytes(z.bytes)
      ];
      // Die Knoepfe stehen nur beim Eigentuemer -- der Server verweigert es
      // ohnehin, und ein Knopf, der zuverlaessig eine Fehlermeldung erzeugt,
      // sieht aus wie ein Fehler.
      /* DAS ZEICHEN STEHT NEBEN DEM SATZ UND NICHT IN IHM (B6 A). */
      row.innerHTML = `<span class="mname">${esc(z.title)}</span>
        ${OWNER ? `<button class="mact trash-back" title="${esc(t('card.restore'))}">${ICON_RESTORE} ${tH('card.restore')}</button>
        <button class="mact rm trash-remove" title="${esc(t('card.deleteForGood'))}">${ICON_X}</button>` : ''}
        <span class="trash-meta">${esc(meta.join(' · '))}</span>`;
      box.appendChild(row);
      const back = row.querySelector('.trash-back');
      if (back) back.onclick = async () => {
        try {
          const r = await api('POST', `/api/trash/${z.id}/restore`);
          // Die unbekannten Verfasser stehen in der Antwort und gehoeren
// gesagt: sie sind beim Zurueckholen an MICH gefallen.
          const open = (r && Array.isArray(r.authorUnknown)) ? r.authorUnknown : [];
          toast(t('card.restored', { instanceTitle: z.title }) +
            (open.length ? t('card.postsAssignedHint', { names: open.join(', ') }) : ''));
          trashNew(fetched);
        } catch (e) { toast(e.message, true); }
      };
      const removed = row.querySelector('.trash-remove');
      if (removed) removed.onclick = async () => {
        if (!await confirmBox(t('card.deleteForGoodAsk'),
          t('card.purgeHint', { instanceTitle: z.title }),
          t('card.deleteForGood'))) return;
        try {
          await api('DELETE', `/api/trash/${z.id}`);
          toast(t('card.deletedForGood'));
          trashNew(fetched);
        } catch (e) { toast(e.message, true); }
      };
    });
  }


/* ---- Karte „Zugänge" — Abschnitt „Zugänge" ---- */
function cardUsers() {
  return `<div class="sys-card wide">
        <h3>${tH('card.user')}</h3>
        <p class="desc">${tH('card.usersHint')}</p>
        ${more(`${tH('card.lockInsteadHint')} ${OWNER
            ? t('card.rolesYouOnly')
            : t('card.rolesOwnerHint')}`)}
        ${/* DER KASTEN ZU DEN DOPPELTEN ADRESSEN. */''}
        <div id="user-doubles"></div>
        <div class="manage-list" id="musers"></div>
        ${/* DER KNOPF ZU DEN GRABSTEINEN. */''}
        <div class="row-in" id="user-remove-row" style="margin-top:8px"></div>

        <p class="desc" style="margin:16px 0 8px">${tH('card.newUserHint')}</p>
        <div class="user-new">
          <input class="input input-sm" id="user-name" placeholder="${esc(t('login.username'))}"
            autocomplete="off" autocapitalize="off" spellcheck="false">
          ${/* DIE ADRESSE BEIM ANLEGEN, und nur hier: ohne sie hat die
               Einladungsmail keinen Empfänger, und den Zugang gibt es in
               diesem Augenblick noch nicht. */''}
          <input class="input input-sm" id="user-mail" type="email" placeholder="${esc(t('card.emailOptional'))}"
            autocomplete="off" autocapitalize="off" spellcheck="false">
          <select class="input input-sm" id="user-kind">
            <option value="link">${tH('card.userPicksPassword')}</option>
            <option value="passwort">${tH('card.iSetPassword')}</option>
          </select>
          <input class="input input-sm" id="user-pass" type="password" placeholder="${esc(t('card.firstPassword'))}"
            autocomplete="new-password" hidden>
          ${OWNER ? `<select class="input input-sm" id="user-role">
            <option value="user">${tH('card.user')}</option>
            <option value="admin">${tH('card.admin')}</option>
            <option value="eigentuemer">${tH('card.owner')}</option>
          </select>` : ''}
          <button class="btn btn-accent btn-sm" id="user-create">${tH('card.createWithLink')}</button>
        </div>
        <div id="user-link"></div>

        ${/* DIESELBE KLEMME WIE IN DER KARTE „ZUGANG“, und aus demselben
             Grund: der Befehl läuft auf dem Wirt, und dort sitzt in der Regel
             der Eigentümer. */''}
        ${OWNER
          ? `<div style="margin-top:16px">${serverBox(t('card.lockedOutHint'), 'docker compose exec kriterion node usertool.js password <name>')}</div>`
          : `<p class="desc" style="margin:16px 0 0">${tH('card.lockedOutCard')}</p>`}
      </div>`;
}
function setUpUsersOut() {
  drawUsers();
  /* EINE WAHL, EIN KNOPF. */
  const userKind = document.getElementById('user-kind');
  const userCreate = document.getElementById('user-create');
  const userPass = document.getElementById('user-pass');

  const userKindSet = () => {
    if (!userKind || !userCreate || !userPass) return;
    const link = userKind.value === 'link';
    userPass.hidden = link;
    // Geleert, nicht bloß versteckt: ein Passwort, das man nicht mehr sieht,
// aber noch mitschickt, wäre die unangenehmste Art von Überraschung.
    if (link) userPass.value = '';
    userCreate.textContent = link ? t('card.createWithLink') : t('entry.create');
  };
  if (userKind) userKind.onchange = userKindSet;
  userKindSet();

  if (userCreate) userCreate.onclick = async () => {
    const nameField = document.getElementById('user-name');
    const mailField = document.getElementById('user-mail');
    const roleField = document.getElementById('user-role');
    const byInvite = !userKind || userKind.value === 'link';
    const body = { username: nameField.value.trim() };
    if (mailField && mailField.value.trim()) body.email = mailField.value.trim();
    if (byInvite) body.sendInvite = true;
    else body.password = userPass.value;
    if (roleField) body.role = roleField.value;
    if (!body.username) return toast(t('login.usernameMissing'), true);
    try {
      const d = await api('POST', '/api/users', body);
      nameField.value = ''; userPass.value = '';
      if (mailField) mailField.value = '';
      toast(byInvite ? t('card.userCreatedLink') : t('card.userCreated'));
      if (byInvite) showLink(d);
    } catch (e) { return toast(e.message, true); }
    drawUsers();
  };

}

  /* --- Zugaenge --- Was ein Zugang mit sich machen laesst, entscheidet der
     Server. */
  /* SCHLUESSEL STATT SATZ, wie bei VERWALTUNGSART -- Modulebene. */
  const ROLE_WORD = { user: 'card.user', admin: 'card.admin', owner: 'card.owner' };
  const rolesWord = (role) => (ROLE_WORD[role] ? t(ROLE_WORD[role]) : role);
  // Schluessel statt Satz (siehe VERWALTUNGSART) -- Modulebene.
  const STATUS_WORD = { active: 'card.active', locked: 'card.locked', deleted: 'card.deletedLower' };
  const statusWord = (status) => (STATUS_WORD[status] ? t(STATUS_WORD[status]) : status);

  /* DIE VOLLSTÄNDIGE ADRESSE BAUT DER BROWSER, nicht der Server. */
  const buildInviteUrl = (key) =>
    `${location.origin}${location.pathname}#/invite/${key}`;

  /* WER DEN LINK KOPIERT, MUSS AN DIESER STELLE LESEN, WAS ER IN DER HAND
     HÄLT. */
  /* WOHER DIE ADRESSE KAM, GEHOERT AN DIE STELLE, AN DER DER LINK ENTSTEHT. */
  const linkOrigin = (d) => d.linkSource === 'einstellung'
    ? tMarks('card.fromServerSetting', { word: '<code>PUBLIC_ADDRESS</code>' })
    : tH('card.fromYourBrowser');

  /* WAS DER VERSAND GEMACHT HAT, STEHT NEBEN DEM LINK UND NICHT ANSTELLE VON
     IHM. */
  const deliveryRow = (d) => {
    /* DIE ADRESSE STEHT HIER NICHT: an einem BESTEHENDEN Zugang hat sie der
       Betroffene selbst eingetragen, und ein Admin bekommt fremde Postfächer
       nicht zu sehen. */
    if (d.delivery === 'ok')
      return `<p class="user-send user-send-ok">${tH('card.testMailSent')}</p>`;
    if (d.delivery === 'fehlgeschlagen')
      return `<p class="user-send user-send-fail"><strong>${tH('card.deliveryFailed')}</strong> —
        ${tH('card.passLinkByHandEnd', { reason: d.deliveryReason || t('card.noValue') })}</p>`;
    if (d.delivery === 'aus')
      return `<p class="user-send">${tH('card.noMailSent')} ${esc(d.deliveryReason || '')}
        ${tH('card.passLinkByHand')}</p>`;
    return '';
  };

  /* EINE FUNKTION, ZWEI RUFER -- das Anlegen in der Karte "Zugaenge" und das
     Freischalten in der Karte "Anfragen". */
  function showLink(d, boxId = 'user-link') {
    const box = document.getElementById(boxId);
    if (!box || !d || !d.token) return;
    /* DER ANDERE KASTEN WIRD GELEERT: die Kennungen darin sind feste Namen,
       und zwei Kaesten nebeneinander ergaeben sie doppelt -- der Knopf
       "Kopieren" kopierte dann den falschen Link. */
    for (const other of ['user-link', 'signup-link']) {
      if (other !== boxId) {
        const k = document.getElementById(other);
        if (k) k.innerHTML = '';
      }
    }
    // Der Server gibt den fertigen Link nur heraus, wenn die Einstellung steht.
// Sonst baut ihn der Browser wie bisher.
    const address = d.link || buildInviteUrl(d.token);
    box.innerHTML = `<div class="warn-box" style="margin:12px 0 0">
      <strong>${d.purpose === 'reset'
        ? tH('card.resetLinkFor', { name: d.username || '' })
        : tH('card.inviteLinkFor', { name: d.username || '' })}</strong>
      ${tH('card.linkHolderHint', { days: d.days || 7, minutes: d.minutes || 15 })}
      <div class="user-link-row"><input class="input input-sm" id="user-link-field" readonly
        value="${esc(address)}"><button class="btn btn-sm" id="user-link-copy">${tH('card.copy')}</button></div>
      <p class="user-link-origin" id="user-link-origin">${tH('card.linkPointsTo')}
        <code>${esc(new URL(address).origin)}</code> — <strong>${linkOrigin(d)}</strong>.</p>
      ${deliveryRow(d)}
    </div>`;
    const field = document.getElementById('user-link-field');
    field.focus(); field.select();
    document.getElementById('user-link-copy').onclick = () => {
      // Das Feld bleibt markiert: traegt kein Weg, steht der Link wenigstens da.
      field.select();
      copyText(address, t('card.linkCopied'), 'card.copyByHandLink');
    };
  }

  async function drawUsers() {
    const box = document.getElementById('musers');
    if (!box) return;
    /* Was nach dem await gebraucht wird, wird VORHER geholt -- dieselbe Regel
       wie bei e.currentTarget, nur eine Ebene hoeher: hier ist es `document`
       selbst. */
    const doc = box.ownerDocument;
    let data;
    try { data = await api('GET', '/api/users'); }
    catch (e) { if (box.isConnected) box.innerHTML = `<span class="hint">${esc(e.message)}</span>`; return; }
    if (!box.isConnected) return;
    box.innerHTML = '';
    /* ---- DIE DOPPELTEN ADRESSEN ---- SIE STEHEN NUR DA,
       WENN ES WELCHE GIBT. */
    const doubles = doc.getElementById('user-doubles');
    if (doubles) {
      const list = Array.isArray(data.emailsDoubled) ? data.emailsDoubled : [];
      doubles.innerHTML = !list.length ? '' : `<div class="warn-box" style="margin:0 0 12px">
        <strong>${tH('card.emailsDoubled')}</strong>
        ${list.map(z => `<div class="kv"><span class="k">${esc(z.address)}</span><span class="v">${
          esc(z.names || '')}</span></div>`).join('')}
        <p style="margin:9px 0 0">${tH('card.emailsDoubledHint')}</p></div>`;
    }
    /* GRABSTEINE STEHEN NICHT MEHR ZWISCHEN DEN LEBENDEN. */
    userTombstones = data.users.filter(z => z.status === 'deleted');
    for (const z of data.users.filter(z => z.status !== 'deleted')) {
      const self = z.id === data.ich;
      // Genau die Regel des Servers, einmal hier: an einen Admin oder den
// Eigentuemer kommt nur der Eigentuemer.
      const may = !self && (z.role === 'user' ? true : data.mayRoles);
      const row = doc.createElement('div');
      row.className = 'mrow user' + (z.status === 'locked' ? ' user-locked' : '');
      row.dataset.mid = z.id;
      // Dieselbe Beschriftung wie an jedem Beitrag im Eintrag -- eine
      // Funktion, zwei Rufer.
      /* "Noch kein Passwort" steht NICHT als vierter Zustand in der
         Datenbank: ZUSTAENDE hat drei, und jede Stelle, die status liest,
         kennt sie. */
      const waiting = z.withoutPassword;
      row.innerHTML = `<span class="mname">${esc(authorName({ id: z.id, name: z.username, deleted: false }))}${
          self ? ' <span class="user-mine">(du)</span>' : ''}</span>
        ${/* ROLLE ALS MARKE, ZUSTAND ALS PUNKT. Die
             Marke ist Form, keine Farbe: gefuellt, umrandet, neutral. */''}
        <span class="user-role"><span class="role-badge ${esc(z.role)}">${esc(rolesWord(z.role))}</span></span>
        <span class="user-status" title="${waiting ? esc(t('card.inviteOpen')) : esc(statusWord(z.status))}"><span
          class="user-dot ${waiting ? 'invited' : esc(z.status)}"></span>${esc(statusWord(z.status))}${
          waiting ? ` <span class="user-waiting">· ${tH('card.noPasswordYet')}</span>` : ''}</span>
        ${countCell(String(z.entries), `${z.entries} ${vThing(z.entries)}`)}`;
      if (may) {
        const tool = doc.createElement('span');
        tool.className = 'user-act';
        tool.innerHTML =
          `${data.mayRoles ? `<select class="input input-sm user-role-sel">
             <option value="user"${z.role === 'user' ? ' selected' : ''}>${tH('card.user')}</option>
             <option value="admin"${z.role === 'admin' ? ' selected' : ''}>${tH('card.admin')}</option>
             <option value="eigentuemer"${z.role === 'owner' ? ' selected' : ''}>${tH('card.owner')}</option>
           </select>` : ''}
           <button class="mact user-lock-btn" title="${esc(z.status === 'active' ? t('card.lock') : t('card.unlock'))}">${
             z.status === 'active' ? ICON_LOCK : ICON_CHECK}</button>
           <button class="mact user-link-btn" title="${esc(z.withoutPassword ? t('card.createInviteLink')
             : t('card.createResetLink'))}">${ICON_LINK}</button>
           <button class="mact user-pass-btn" title="${esc(t('card.presetPassword'))}">${ICON_KEY}</button>
           <button class="mact rm user-x" title="${esc(t('dialog.deleteUser'))}">${ICON_X}</button>`;
        row.appendChild(tool);

        const roleField = tool.querySelector('.user-role-sel');
        if (roleField) roleField.onchange = async () => {
          // Vor dem ersten await lesen: danach ist das Feld schon neu gezeichnet.
          const fresh = roleField.value;
          if (!await secondConfirm('role', z.id, t('card.roleGiven'),
            t('card.getsRoleHint', { username: z.username, role: rolesWord(fresh) }))) { drawUsers(); return; }
          try { await api('PUT', `/api/users/${z.id}`, { role: fresh }); toast(t('card.roleChanged')); }
          catch (e) { toast(e.message, true); }
          drawUsers();
        };

        tool.querySelector('.user-lock-btn').onclick = async () => {
          const fresh = z.status === 'active' ? 'locked' : 'active';
          if (fresh === 'locked' && !await confirmBox(t('card.lockAsk', { username: z.username }),
            t('card.lockUserHint'),
            t('card.lock'))) return;
          try { await api('PUT', `/api/users/${z.id}`, { status: fresh }); toast(fresh === 'active' ? t('card.unlocked') : t('card.locked')); }
          catch (e) { toast(e.message, true); }
          drawUsers();
        };

        /* BEIDE WEGE BLEIBEN, UND DIE KARTE BEVORZUGT DEN LINK. */
        tool.querySelector('.user-link-btn').onclick = async () => {
          const purpose = z.withoutPassword ? 'invite' : 'reset';
          if (purpose === 'reset' && !await confirmBox(t('card.resetLinkAsk'),
            t('card.oldPasswordValid', { username: z.username }) +
            t('card.oldLinkVoid'), t('card.create'))) return;
          if (!await secondConfirm('link', z.id,
            purpose === 'reset' ? t('card.resetLink') : t('card.inviteLink'),
            t('card.linkHolderUser', { username: z.username }))) return;
          try { showLink(await api('POST', `/api/users/${z.id}/token`, { purpose })); }
          catch (e) { toast(e.message, true); }
          drawUsers();
        };

        tool.querySelector('.user-pass-btn').onclick = async () => {
          const fresh = await newPasswordDialog(t('card.setPasswordFor', { username: z.username }),
            t('card.minCharsSessions', { minPassword: MIN_PASSWORD }));
          if (fresh === null || !fresh.trim()) return;
          if (!await secondConfirm('password', z.id, t('card.presetPassword'),
            t('card.getsPasswordHint', { username: z.username }))) return;
          try { await api('PUT', `/api/users/${z.id}`, { password: fresh }); toast(t('card.passwordSet')); }
          catch (e) { toast(e.message, true); }
          drawUsers();
        };

        tool.querySelector('.user-x').onclick = async () => {
          let b;
          try { b = await api('GET', `/api/users/${z.id}/inventory`); }
          catch (e) { return toast(e.message, true); }
          /* EIN FENSTER MIT ZWEI HAEKCHEN. */
          const choice = await userDeleteDialog(z.username, z.id, b);
          if (!choice) return;
          if (!await secondConfirm('remove', z.id, t('dialog.deleteUser'),
            t('card.deleteUserHint', { username: z.username }))) return;
          try {
            /* `entries` UND `posts` STATT `eintraege` UND `beitraege`, F7. */
            await api('DELETE', `/api/users/${z.id}?entries=${choice.entries ? 1 : 0}&posts=${choice.posts ? 1 : 0}`);
            toast(t('card.userDeleted'));
          } catch (e) { toast(e.message, true); }
          drawUsers();
        };
      }
      box.appendChild(row);
    }
    if (!data.users.some(z => z.status !== 'deleted'))
      box.innerHTML = `<span class="hint">${tH('card.noUsersYet')}</span>`;
    drawTombstoneButton();
  }

  /* --- Gelöschte Zugänge, im eigenen Fenster --- REINE OBERFLÄCHE. */
  let userTombstones = [];
  function drawTombstoneButton() {
    const row = document.getElementById('user-remove-row');
    if (!row) return;
    row.innerHTML = '';
    if (!userTombstones.length) return;
    const n = userTombstones.length;
    const b = row.ownerDocument.createElement('button');
    b.className = 'btn btn-ghost btn-sm';
    b.id = 'deleted-users';
    b.textContent = t('card.deletedUsersCount', { n: n });
    b.title = t('card.showDeletedUsers');
    b.onclick = showTombstones;
    row.appendChild(b);
  }

  function showTombstones() {
    const doc = document;
    const bd = doc.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal" id="tombstone-modal"><h2>${tH('card.deletedUsers')}</h2>
      <p>${tH('card.nameFreedHint')}</p>
      <div class="manage-list" id="tombstone-list"></div>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('list.close')}</button></div></div>`;
    doc.body.appendChild(bd);
    const zu = () => { bd.remove(); doc.removeEventListener('keydown', onKey, true); };
    /* Escape schliesst nur den OBERSTEN Dialog -- dieselbe Regel wie bei "Wer
       hat bewertet": ein Horcher, der jeden Hintergrund schliesst, waere eine
       Falle fuer den naechsten, der einen Dialog dazubaut. */
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if ([...doc.querySelectorAll('.backdrop')].pop() !== bd) return;
      zu();
    };
    doc.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-no]').onclick = zu;
    bd.onclick = e => { if (e.target === bd) zu(); };
    const box = bd.querySelector('#tombstone-list');
    if (!userTombstones.length) {
      box.innerHTML = `<span class="hint">${tH('card.noUserDeleted')}</span>`;
      return;
    }
    for (const z of userTombstones) {
      const row = doc.createElement('div');
      row.className = 'mrow user user-remove';
      row.dataset.mid = z.id;
      // Dieselbe Beschriftung wie ueberall: eine Funktion, zwei Rufer.
      row.innerHTML = `<span class="mname">${esc(authorName({ id: z.id, name: z.username, deleted: true }))}</span>
        <span class="user-status">${tH('card.deletedLower')}</span>
        ${countCell(String(z.entries), `${z.entries} ${vThing(z.entries)}`)}`;
      box.appendChild(row);
    }
  }


/* ---- Karte „Anfragen" — Abschnitt „Zugänge" ---- */
function cardRequests(fetched) {
  const { requests } = fetched;
  return `<div class="sys-card wide">
        <h3>${tH('card.requests')}</h3>
        <p class="desc">${tH('card.signupHint')}${requests.an ? '' : ` <strong>${tH('card.signupOffNow')}</strong>`}</p>
        ${more(tH('card.approveRejectHint', { hours: requests.hours }))}
        <div class="kv"><span class="k">${tH('card.signup')}</span><span class="v" id="signup-state">${
          requests.an ? `<strong class="mail-on">${tH('card.on')}</strong>`
                      : `<strong class="mail-off">${tH('card.off')}</strong>`
        }</span></div>
        <div class="kv"><span class="k">${tH('card.openRequests')}</span><span class="v" id="signup-used">${tH('card.ofAtMost', { used: requests.used, cap: requests.cap })}</span></div>
        ${requests.an && !requests.deliveryReady ? `<p class="warn-box" id="signup-broken" style="margin:10px 0 0">
          <strong>${tH('card.mailBrokenHint')}</strong> ${esc(requests.deliveryReason)}</p>` : ''}
        ${!requests.an && !requests.deliveryReady ? `<p class="desc" id="signup-notready">
          <strong>${tH('card.needsMailHint')}</strong>
          ${esc(requests.deliveryReason)}</p>` : ''}
        <div class="row-in" style="margin-top:10px">
          <button class="btn btn-sm${requests.an ? '' : ' btn-accent'}" id="signup-toggle"${
            !requests.an && !requests.deliveryReady ? ' disabled' : ''}>${
            requests.an ? t('card.turnSignupOff') : t('card.turnSignupOn')}</button>
        </div>
        <div class="manage-list" id="mrequests" style="margin-top:14px"></div>
        <div id="signup-link"></div>
      </div>`;
}
function setUpRequestsOut(fetched) {
  drawRequests(fetched.requests);
  const signupToggle = document.getElementById('signup-toggle');
  if (signupToggle) signupToggle.onclick = async () => {
    // Vor dem await lesen: danach steht am Knopf schon der andere Text.
    const fresh = !(fetched.requests && fetched.requests.an);
    try {
      const d = await api('PUT', '/api/signup/toggle', { an: fresh });
      fetched.requests = d;
      /* DER EINE MERKER ZIEHT MIT. */
      SIGNUP = !!d.an;
      toast(fresh ? t('card.signupOn') : t('card.signupOff'));
      drawRequests(d);
      const broken = document.getElementById('signup-broken');
      if (broken && (!d.an || d.deliveryReady)) broken.remove();
    } catch (e) { toast(e.message, true); }
  };
}

  /* Die Warteschlange der Selbstanmeldung. */
  function drawRequests(status) {
    const box = document.getElementById('mrequests');
    if (!box || !status) return;
    const doc = box.ownerDocument;
    const state = document.getElementById('signup-state');
    /* „an" UND „aus" KOMMEN AUS DEM WOERTERBUCH. Sie
       standen fest im Quelltext, und in einer englisch oder tuerkisch
       eingestellten Instanz stand hier deutscher Text. */
    if (state) state.innerHTML = status.an
      ? `<strong class="mail-on">${tH('card.on')}</strong>`
      : `<strong class="mail-off">${tH('card.off')}</strong>`;
    const used = document.getElementById('signup-used');
    if (used) used.textContent = t('card.ofAtMost', { used: status.used, cap: status.cap });
    const toggle = document.getElementById('signup-toggle');
    if (toggle) {
      toggle.textContent = status.an ? t('card.turnSignupOff') : t('card.turnSignupOn');
      toggle.disabled = !status.an && !status.deliveryReady;
    }
    box.innerHTML = '';
    if (!status.requests.length) {
      /* KURZ, ABER NICHT STUMM: wer die Karte ansieht, soll den Unterschied
         zwischen „es liegt nichts vor" und „hier fehlt etwas" sehen. */
      box.innerHTML = status.an
        ? `<span class="hint">${tH('card.noConfirmedRequest')}</span>`
        : '';
      return;
    }
    for (const a of status.requests) {
      const row = doc.createElement('div');
      row.className = 'mrow user';
      row.dataset.mid = a.id;
      /* NAME UND ADRESSE STEHEN HIER, und sie sind Freitext von aussen --
         deshalb geht jedes Feld durch esc(). */
      row.innerHTML = `<span class="mname">${esc(a.username)}</span>
        <span class="user-role">${esc(a.email)}</span>
        <span class="user-status">${tH('card.requestedAt', { created_at: fmtDate(a.created_at) })}</span>
        <span class="mcount">${tH('card.confirmed', { confirmedAt: fmtDate(a.confirmed_at) })}</span>`;
      const tool = doc.createElement('span');
      tool.className = 'user-act';
      tool.innerHTML =
        `<button class="mact signup-approve" title="${esc(t('card.approveHint'))}">${ICON_CHECK}</button>
         <button class="mact rm signup-reject" title="${esc(t('card.rejectHint'))}">${ICON_X}</button>`;
      row.appendChild(tool);
      tool.querySelector('.signup-approve').onclick = async () => {
        if (!await confirmBox(t('card.approveAsk', { username: a.username }),
          t('card.signupResultHint', { email: a.email }),
          t('card.approve'), 'accent')) return;
        try {
          const d = await api('POST', `/api/requests/${a.id}/approve`);
          toast(t('card.approvedLinkBelow'));
          showLink(d, 'signup-link');
          drawRequests(d);
          drawUsers();
        } catch (e) { toast(e.message, true); }
      };
      tool.querySelector('.signup-reject').onclick = async () => {
        if (!await confirmBox(t('card.rejectRequestAsk', { username: a.username }),
          t('card.rejectQuietHint'), t('card.reject'))) return;
        try {
          const d = await api('DELETE', `/api/requests/${a.id}`);
          toast(t('card.requestRejected'));
          drawRequests(d);
        } catch (e) { toast(e.message, true); }
      };
      box.appendChild(row);
    }
  }


/* ---- Karte „Sicherheitsprotokoll" — Abschnitt „Zugänge" ---- */
function cardLog(fetched) {
  const { log } = fetched;
  return `<div class="sys-card wide">
        <h3>${tH('card.securityLog')}</h3>
        <p class="desc">${tH('card.logHint')}</p>
        <p class="desc">${tH('card.logKeepsHint', { n: log.days })}</p>
        ${/* DIE FILTERLEISTE. Sie steht VOR der Liste, wie jede Filterreihe
             in dieser Instanz -- man waehlt, bevor man liest. */''}
        <div class="pills" id="log-filter" style="margin:0 0 12px"></div>
        <div class="log-list" id="log-list"></div>
        <p class="hint hint-sm" id="log-foot" style="margin:10px 2px 0"></p>
      </div>`;
}
function setUpLogOut(fetched) {
  // Beim Zeichnen steht wieder "Alle" -- Ansichtszustand, keine Einstellung.
  logGroup = '';
  drawLog(fetched.log);
}

  /* --- Das Sicherheitsprotokoll --- Gezeichnet wird aus dem, was oben schon
     geholt wurde -- dieselbe Bauform wie bei den Verwaltungskarten und aus
     demselben Grund. */
  // Schluessel statt Satz (siehe VERWALTUNGSART) -- Modulebene.
  const EVENT_WORD = {
    'login.ok': 'card.signedIn',
    'login.fail': 'card.loginFailed',
    'confirm.fail': 'card.confirmFailed',
    'user.new': 'card.userCreated',
    'user.role': 'card.roleGiven',
    'user.password': 'card.passwordSet',
    'user.delete': 'card.userDeleted',
    'user.self': 'card.ownAccountChanged',
    'link.new': 'card.linkCreated',
    'link.use': 'card.linkUsed',
    /* DIE FUENF, DIE FRUEHER FEHLTEN. */
    'request.approve': 'card.requestApproved',
    'request.reject': 'card.requestRejected',
    'twofactor.on': 'card.twoFactorTurnedOn',
    'twofactor.off': 'card.twoFactorTurnedOff',
    'twofactor.reset': 'card.recoveryCodeUsed',
    'export': 'card.exportCreated',
    'import': 'card.imported',
    'backup': 'card.backupWritten',
    // Eine Zeile je entferntem Backup, deshalb der Singular.
    'backup.delete': 'card.oldBackupDeleted',
    // Die Zeile nennt, DASS gewechselt wurde, nie WOHIN -- sie traegt weder
    // Ziel noch Merkmal, und der Handelnde ist immer leer: gewechselt wird
    // auf dem Wirt.
    'key': 'card.keyChanged'
  };
  // Der Status ist der eine Vorgang, dessen Wort am Merkmal haengt: "locked"
  // und "entsperrt" sind zwei verschiedene Aussagen und sollen auch zwei
  // verschiedene Zeilen sein.
  const eventWord = (z) => z.event === 'user.status'
    ? (z.detail === 'active' ? t('card.userUnlocked') : t('card.userLocked'))
    : (EVENT_WORD[z.event] ? t(EVENT_WORD[z.event]) : z.event);
  // Was hinter dem Vorgang noch zu sagen ist. Die Rolle beim Rollenwechsel,
// der Anlass beim Link, die Betriebsart beim Import -- sonst nichts.
  /* EIN MERKMAL OHNE WORT VERSCHWINDET SPURLOS -- detailWord() faellt still
     auf den leeren String zurueck, und deshalb faellt ein fehlendes Wort
     niemandem auf. */
  // Schluessel statt Satz (siehe VERWALTUNGSART) -- Modulebene.
  const DETAIL_WORD = {
    user: 'card.user', admin: 'card.admin', owner: 'card.owner',
    invite: 'card.invite', reset: 'card.resetLabel',
    merge: 'card.merged', replace: 'card.replacing',
    name: 'card.name', password: 'login.password', address: 'card.address',
    both: 'card.severalValues', part: 'card.inParts'
  };
  const detailWord = (z) => (z.event === 'user.status' || !DETAIL_WORD[z.detail]
    ? '' : t(DETAIL_WORD[z.detail]));

  /* WER GEHANDELT HAT. */
  const logActor = (z) => {
    if (z.actor != null) return authorName({ id: z.actor, name: z.actorName, deleted: z.actorName == null });
    return z.event === 'login.fail' ? '—' : t('card.viaCommandLine');
  };
  const logTarget = (z) => {
    if (z.target == null) return z.event === 'login.fail' ? t('card.unknownName') : '';
    if (z.target === z.actor) return '';
    return authorName({ id: z.target, name: z.targetName, deleted: z.targetName == null });
  };

  /* DIE ANSICHTEN DES PROTOKOLLS. */
  // Schluessel statt Satz (siehe VERWALTUNGSART) -- Modulebene.
  const LOG_VIEW = [
    ['', 'list.all'],
    ['failed', 'card.failed'],
    ['logins', 'card.logins'],
    ['users', 'card.user'],
    ['twofactor', 'card.twoFactor'],
    ['inventory', 'card.database']
  ];
  const LOG_VIEW_HELP = {
    '': 'card.logAllHint',
    failed: 'card.loginsFailed',
    logins: 'card.loginsOk',
    users: 'card.logUsersHint',
    twofactor: 'card.logTwoFactorHint',
    inventory: 'card.logDataHint'
  };
  // Welche Ansicht gerade gilt. Ansichtszustand und keine Einstellung: beim
// naechsten Aufruf steht wieder "Alle", wie beim Umschalter "meine / alle".
  let logGroup = '';

  /* DER SPRUNG ZUM ZUGANG. */
  function jumpToUser(id) {
    const row = document.querySelector(`#musers .mrow[data-mid="${Number(id) || 0}"]`);
    if (!row) return toast(t('card.userGone'), true);
    row.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    row.classList.add('mrow-flash');
    setTimeout(() => row.classList.remove('mrow-flash'), 1600);
  }

  /* EIN NAME WIRD ZUM KNOPF, wenn er eine Nummer hat -- und nur dann. */
  const logNameField = (doc, cls, text, id, before = '') => {
    const field = doc.createElement('span');
    field.className = cls;
    if (!text) return field;
    // Der Pfeil steht VOR dem Knopf und nicht in ihm: er gehoert der Zeile und
// ist kein Teil des Namens, auf den man klickt.
    if (before) field.appendChild(doc.createTextNode(before));
    if (id == null) { field.appendChild(doc.createTextNode(text)); return field; }
    const b = doc.createElement('button');
    b.className = 'link-btn log-jump';
    b.dataset.mid = String(id);
    b.textContent = text;
    b.title = t('card.jumpToUser');
    b.onclick = () => jumpToUser(id);
    field.appendChild(b);
    return field;
  };

  function drawLogFilter(d) {
    const box = document.getElementById('log-filter');
    if (!box) return;
    const numbers = (d && d.counts && typeof d.counts === 'object') ? d.counts : {};
    box.innerHTML = '';
    for (const [key, word] of LOG_VIEW) {
      const b = document.createElement('button');
      const n = Number(numbers[key || 'all']) || 0;
      /* GEDAEMPFT BEI NULL, wie jede Pille in dieser Lage:
         eine Ansicht ohne Zeilen fuehrt garantiert auf eine leere Liste. */
      const empty = n === 0 && logGroup !== key;
      b.className = 'pill' + (logGroup === key ? ' on' : '') + (empty ? ' blank' : '');
      b.dataset.group = key;
      b.innerHTML = `${esc(t(word))}<span class="n">${Number(n)}</span>`;
      b.title = LOG_VIEW_HELP[key] ? t(LOG_VIEW_HELP[key]) : '';
      b.onclick = () => logNew(key);
      box.appendChild(b);
    }
  }

  /* NACHGELADEN WIRD BEIM KLICK, und zwar NUR diese Karte -- dieselbe Bauform
     wie sessionsNew() und trashNew(). DER NAME DES PARAMETERS HEISST `group`
     UND NICHT `gruppe`: der Server liest ihn unter diesem Namen. */
  async function logNew(group) {
    logGroup = group || '';
    let d;
    try {
      d = await api('GET', '/api/security-log' +
        (logGroup ? `?group=${encodeURIComponent(logGroup)}` : ''));
    } catch (e) {
      const box = document.getElementById('log-list');
      if (box) box.innerHTML = `<p class="hint">${esc(e.message)}</p>`;
      return;
    }
    drawLog(d);
  }

  function drawLog(d) {
    const box = document.getElementById('log-list');
    const foot = document.getElementById('log-foot');
    if (!box) return;
    const doc = box.ownerDocument;
    drawLogFilter(d);
    const rows = (d && Array.isArray(d.rows)) ? d.rows : [];
    if (!rows.length) {
      /* ZWEI LEERE FAELLE, ZWEI SAETZE. */
      box.innerHTML = logGroup
        ? `<p class="hint">${tH('card.noEventKind')} ${esc(String(d && d.days || ''))} ${tH('card.daysDot')}</p>`
        : `<p class="hint">${tH('card.noEventYet')}</p>`;
      if (foot) foot.textContent = '';
      return;
    }
    box.innerHTML = '';
    for (const z of rows) {
      const row = doc.createElement('div');
      row.className = 'log-row';
      row.dataset.event = z.event;
      const whom = logTarget(z), markText = detailWord(z);
      const time = doc.createElement('span');
      time.className = 'log-time'; time.textContent = fmtDate(z.at);
      const event = doc.createElement('span');
      event.className = 'log-event'; event.textContent = eventWord(z);
      row.appendChild(time); row.appendChild(event);
      // Der Handelnde ist anklickbar, wenn er eine Nummer hat -- "—" und
// "ueber usertool.js auf dem Wirt" haben keine.
      row.appendChild(logNameField(doc, 'log-actor', logActor(z),
        z.actor != null ? z.actor : null));
      row.appendChild(logNameField(doc, 'log-target', whom,
        z.target != null ? z.target : null, '→ '));
      const detailEl = doc.createElement('span');
      detailEl.className = 'log-detail';
      /* DIESELBE MARKE WIE IN DER BENUTZERLISTE hinter dem Rollenwort. */
      if (markText && ROLE_WORD[z.detail]) {
        const mark = doc.createElement('span');
        mark.className = 'role-badge ' + z.detail;
        mark.textContent = markText;
        detailEl.appendChild(mark);
      } else detailEl.textContent = markText || '';
      row.appendChild(detailEl);
      box.appendChild(row);
    }
    if (foot) {
      const total = Number(d.total) || rows.length;
      const kind = logGroup ? t('card.ofThisKind') : '';
      foot.textContent = total > rows.length
        ? t('card.logNewestHint', { length: rows.length, total: total, kind: kind })
        : t('card.eventCount', { n: total, kind: kind });
    }
  }


/* ---- Karte „Mailversand" — Abschnitt „Zugänge" ---- */
function cardMailDelivery(fetched) {
  const { mailStatus } = fetched;
  /* `.breit` WIE DIE DREI NACHBARN. */
  return `<div class="sys-card wide">
        <h3>${tH('card.mailDelivery')}</h3>
        ${/* DIE ACHTZEHNTE KARTE, und sie gehört dem EIGENTÜMER — nicht dem
             Admin, obwohl der die Einladungen verschickt. */''}
        <p class="desc">${tH('card.emailOptionalHint')}</p>
        ${/* „eingerichtet" KAM AUS DEM QUELLTEXT UND SEIN GEGENTEIL AUS DER
             SPRACHDATEI: die Absage las `card.notConfigured`, die Zusage
             stand fest auf Deutsch da. */''}
        <div class="kv"><span class="k">${tH('card.state')}</span><span class="v">${mailStatus.configured
          ? `<strong class="mail-on">${tH('card.configured')}</strong>`
          : `<strong class="mail-off">${tH('card.notConfigured')}</strong>`}</span></div>
        ${/* ---- DIE KARTE ZEIGT, DER DIALOG STELLT EIN ---- Hier standen einmal neun
             Bedienelemente in vier Spaltenaufteilungen, dazwischen vier
             Erklaersaetze. */''}
        <div class="kv"><span class="k">${tH('card.provider')}</span><span class="v">${mailProviderRow(mailStatus)}</span></div>
        <div class="kv"><span class="k">${tH('card.sender')}</span><span class="v">${mailStatus.sender
          ? esc(mailStatus.sender)
          : `<strong class="mail-off">${tH('card.notSet')}</strong>`}</span></div>
        <div class="kv"><span class="k">${tH('card.publicAddress')}</span><span class="v">${mailStatus.addressSet
          ? esc(mailStatus.address)
          : `<strong class="mail-off">${tH('card.notSetNoSend')}</strong>`}</span></div>
        <div class="kv"><span class="k">${tH('card.lastTestedOk')}</span><span class="v">${mailStatus.testedAt
          ? esc(mailStatus.testedAt) : tH('card.never')}</span></div>
        ${mailStatus.addressSet ? '' : `<p class="warn-box" style="margin:10px 0 0">
          ${tMarks('card.withoutServerSetting', { word: '<code>PUBLIC_ADDRESS</code>' })}</p>`}
        ${/* ZWEI KNÖPFE, und der erste sagt, was er tut: einrichten, wenn
             noch nichts steht, ändern, wenn etwas steht. */''}
        <div class="row-in" style="margin-top:14px">
          <button class="btn btn-accent btn-sm" id="mail-setup">${tH('card.mailAccount')} ${
            mailStatus.configured ? tH('card.change') : tH('card.setUp')}</button>
          <button class="btn btn-sm" id="mail-test">${tH('card.testMailToMe')}</button>
        </div>
        <p class="desc" style="margin:10px 0 0">${tH('card.testMailGoesHint', { seconds: mailStatus.seconds })}</p>
        <div id="mail-result"></div>
      </div>`;
}

/* DIE ANBIETERZEILE DER KARTE: Name · Server:Port · Verschlüsselung, in EINER
   Zeile — „Eigener Server · smtp.beispiel.de:587 · STARTTLS". */
function mailProviderRow(m) {
  if (!m.provider) return `<strong class="mail-off">${tH('card.noneChosenYet')}</strong>`;
  const parts = [esc(m.providerName || m.provider)];
  if (m.server && m.port) {
    parts.push(`${esc(m.server)}:${m.port}`);
    parts.push(m.secure ? 'SSL/TLS' : 'STARTTLS');
  }
  return parts.join(' · ');
}

/* ---- Der Dialog „Mailzugang einrichten" ---- EINE SPALTE,
   BESCHRIFTUNG ÜBER DEM FELD, HINWEIS UNTER SEINER SACHE. */
function mailDialog(mailStatus) {
  return new Promise(resolve => {
    const list = Array.isArray(mailStatus.providerList) ? mailStatus.providerList : [];
    const template = (key) => list.find(a => a.key === key) || null;
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="modal mail-dialog" id="mail-dialog">
      <h2>${tH('card.mailAccount')} ${mailStatus.configured ? tH('card.change') : tH('card.setUp')}</h2>
      <div class="field"><label for="mail-provider">${tH('card.provider')}</label>
        <select class="input" id="mail-provider">
          <option value=""${mailStatus.provider ? '' : ' selected'}>${tH('card.noDelivery')}</option>
          ${list.map(a => `<option value="${esc(a.key)}"${
            a.key === mailStatus.provider ? ' selected' : ''}>${esc(a.name)}</option>`).join('')}
        </select></div>
      ${/* DER HINWEIS ZUM GEWÄHLTEN ANBIETER — DARUNTER, NICHT DANEBEN, und
           er wechselt mit der Auswahl. */''}
      <p class="desc mail-hint" id="mail-provider-hint"></p>
      ${/* DIE FESTEN WERTE EINER VORLAGE — GELESEN UND NICHT EINGESTELLT. */''}
      <div class="field" id="mail-fixed-field"><label>${tH('card.serverPortHint')}</label>
        <div class="mail-fixed" id="mail-fixed"></div></div>
      <div id="mail-custom">
        <div class="field"><label for="mail-server">${tH('card.server')}</label>
          <input class="input" id="mail-server" value="${esc(mailStatus.server || '')}"
            autocapitalize="off" spellcheck="false"></div>
        <div class="field"><label for="mail-port">${tH('card.port')}</label>
          <input class="input" id="mail-port" type="number" min="1" max="65535"
            value="${esc(mailStatus.port || '')}"></div>
        <div class="field"><label for="mail-secure">${tH('card.encryption')}</label>
          <select class="input" id="mail-secure">
            <option value="starttls"${mailStatus.secure ? '' : ' selected'}>${tH('card.startTls')}</option>
            <option value="tls"${mailStatus.secure ? ' selected' : ''}>${tH('card.sslTls')}</option>
          </select></div>
        <p class="desc mail-hint">${tH('card.smtpOnlyHint')}</p>
      </div>
      <div class="field"><label for="mail-user">${tH('card.providerUsername')}</label>
        <input class="input" id="mail-user" value="${esc(mailStatus.user || '')}"
          autocomplete="off" autocapitalize="off" spellcheck="false"></div>
      <div class="field"><label for="mail-pass">${tH('card.providerPassword')}</label>
        <input class="input" id="mail-pass" type="password" autocomplete="new-password"
          placeholder="${mailStatus.passwordSet
            ? esc(t('card.leaveEmptyHint')) : esc(t('card.notSet'))}"></div>
      <div class="field"><label for="mail-sender">${tH('card.senderAddress')}</label>
        <input class="input" id="mail-sender" type="email" value="${esc(mailStatus.sender || '')}"
          autocomplete="off" autocapitalize="off" spellcheck="false"></div>
      <p class="desc mail-hint" id="mail-sender-hint">${esc(mailStatus.hintAlways)}</p>
      <div class="modal-acts"><button class="btn btn-ghost" data-no>${tH('dialog.cancel')}</button>
        <button class="btn btn-accent" id="mail-save">${tH('dialog.save')}</button></div></div>`;
    document.body.appendChild(bd);
    const field = (id) => bd.querySelector('#mail-' + id);
    const selection = field('provider');
    const hint = bd.querySelector('#mail-provider-hint');
    const fixedField = bd.querySelector('#mail-fixed-field');
    const ownBox = bd.querySelector('#mail-custom');
    const senderHint = bd.querySelector('#mail-sender-hint');

    /* WAS DIE AUSWAHL UMSTELLT, an EINER Stelle. */
    const afterSelection = () => {
      const v = template(selection.value);
      const own = selection.value === 'eigen';
      hint.textContent = v && v.hint ? v.hint : '';
      hint.hidden = !(v && v.hint);
      fixedField.hidden = !v || own;
      if (v && !own) bd.querySelector('#mail-fixed').textContent =
        `${v.server} · ${v.port} · ${v.secure ? 'SSL/TLS' : 'STARTTLS'}`;
      ownBox.hidden = !own;
      for (const id of ['user', 'pass', 'sender']) field(id).disabled = !v;
      senderHint.hidden = !v;
    };
    selection.onchange = afterSelection;
    afterSelection();

    const finished = (v) => {
      document.removeEventListener('keydown', onKey, true); bd.remove(); resolve(v);
    };
    /* Escape schliesst nur den OBERSTEN Dialog -- steht die zweite
       Bestaetigung darueber, gehoert die Taste ihr. */
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if ([...document.querySelectorAll('.backdrop')].pop() !== bd) return;
      finished(false);
    };
    document.addEventListener('keydown', onKey, true);
    bd.querySelector('[data-no]').onclick = () => finished(false);
    bd.onclick = e => { if (e.target === bd) finished(false); };

    bd.querySelector('#mail-save').onclick = async () => {
      const body = {
        provider: selection.value,
        server: field('server').value.trim(),
        port: Number(field('port').value),
        secure: field('secure').value === 'tls',
        user: field('user').value.trim(),
        // LEER HEISST "unveraendert", nicht "loeschen": sonst muesste das
        // Passwort bei jeder Aenderung am Absender neu getippt werden, und
        // ein Formular, das ein Geheimnis fuer eine Nebensache verlangt, wird
        // irgendwann mit einem falschen Wert gespeichert.
        password: field('pass').value,
        sender: field('sender').value.trim()
      };
      if (!await secondConfirm('mail', null, t('card.saveMailAccount'),
        t('card.mailServerHint'))) return;
      try {
        await api('PUT', '/api/mail', body);
        toast(t('card.mailAccountSaved'));
        finished(true);
      } catch (e) { toast(e.message, true); }
    };
    selection.focus();
  });
}
function setUpMailDeliveryOut(fetched) {
  /* NUR FUER DEN EIGENTUEMER; die Klemme steht in SYS_CARDS, und die
     Endpunkte darunter weisen jeden anderen ohnehin ab. */
  const { mailStatus } = fetched;
  const mailButton = document.getElementById('mail-setup');
  if (mailButton && mailStatus) {
    /* DER DIALOG BEKOMMT DEN ZUSTAND MIT, den die Karte ohnehin schon hat --
       kein zweiter Ruf an den Server fuer dieselbe Auskunft. */
    mailButton.onclick = async () => {
      if (await mailDialog(mailStatus)) renderSystem();
    };

    const mailResult = (text, good) => {
      const box = document.getElementById('mail-result');
      if (box) box.innerHTML = `<p class="warn-box ${good ? 'mail-ok' : ''}"
        style="margin:10px 0 0">${esc(text)}</p>`;
    };

    document.getElementById('mail-test').onclick = async (e) => {
      /* e.currentTarget IST NACH DEM ERSTEN await NULL --
         der Knopf wird deshalb VOR dem Ruf festgehalten. */
      const button = e.currentTarget;
      button.disabled = true; button.textContent = t('card.sending');
      try {
        const r = await api('POST', '/api/mail/test', {});
        mailResult(r.ok
          ? t('card.testMailHint', { address: r.sentTo })
          : t('card.sendFailed', { reason: r.reason }), r.ok);
        if (r.ok) toast(t('card.testMailSentShort'));
      } catch (err) { mailResult(err.message, false); }
      button.disabled = false; button.textContent = t('card.testMailToMe');
    };
  }
}


/* ---- Die Bildablage in der Karte „Kennzahlen" ---- DIE NAMEN UND DIE
   REIHENFOLGE STEHEN AN EINER STELLE. */
/* RUFE STATT WERTE (siehe SYS_SECTIONS). */
const IMAGE_FORMATS = [
  // Der Hinweis am PNG haengt an der Wahl und steht deshalb in der Karte selbst.
  { key: 'png',     name: () => 'PNG',  hint: () => '' },
  { key: 'jpeg',    name: () => 'JPEG', hint: () => t('card.staysUnchanged') },
  { key: 'webp',    name: () => t('card.webp'), hint: () => t('card.targetFormat') },
  { key: 'gif',     name: () => 'GIF',  hint: () => t('card.staysUnchanged') },
  { key: 'other', name: () => t('card.otherFormat'), hint: () => '' }
];

/* WIE DIE DREI VERFAHREN AUF DEM BILDSCHIRM HEISSEN. DIE SCHLUESSEL
   KOMMEN VOM SERVER, DIE WOERTER VON HIER. */
const IMAGE_STORE_WORDS = {
  'png':           { name: () => t('card.storePng'),
                     hint: () => t('card.storePngHint') },
  'webp-lossless': { name: () => t('card.storeLossless'),
                     hint: () => t('card.storeLosslessHint') },
  'webp-lossy':    { name: () => t('card.storeLossy'),
                     hint: () => t('card.storeLossyHint') }
};

/* Die Fortschrittszeile. */
function switchRow(u) {
  if (!u) return '';
  if (u.running)
    return `<p class="hint hint-sm" style="margin:8px 2px 0" id="convert-running">${tH('card.convertRunning')} ` +
           `${tH('card.progressOf', { done: u.done, total: u.total })}</p>`;
  /* DER FERTIGSATZ NENNT EINE HAELFTE und nicht zwei -- weder die umgestellten
     ORIGINALE noch die neu gerechneten ABLEITUNGEN einzeln. */
  /* EIN SATZ STATT VIER BRUCHSTUECKE. Die beiden Nachsaetze koennen
     WEGFALLEN, und genau das war der Grund, den Satz drumherum aufzubrechen. */
  return `<p class="hint hint-sm" style="margin:8px 2px 0" id="convert-running">${
    tH('card.convertFinished', { converted: u.converted, total: u.total,
      stayed: u.stayed ? t('card.stayedCurrent', { stayed: u.stayed }) : '',
      freed: u.freed > 0 ? t('card.freedBytes', { freed: fmtBytes(u.freed) }) : '' })}</p>`;
}

/* Die zweite Fortschrittszeile, fuer das Nachziehen der Geometrie. */
function geometryRow(g) {
  if (!g) return '';
  if (g.running)
    return `<p class="hint hint-sm" style="margin:8px 2px 0" id="thumbs-running">${tH('card.thumbnails')} ` +
           `${tH('card.refreshProgress', { done: g.done, total: g.total })}</p>`;
  if (!g.renewed && !g.skipped) return '';
  /* DIE ZAHL DARF IN BEIDE RICHTUNGEN ZEIGEN. */
  const d = g.grown || 0;
  /* „mehr" UND „weniger" KAMEN AUS DEM QUELLTEXT und kommen jetzt aus der
     Sprachdatei -- derselbe Fund wie das „und" in der Tagwarnung. */
  return `<p class="hint hint-sm" style="margin:8px 2px 0" id="thumbs-running">${
    tH('card.thumbsRefreshed', { renewed: g.renewed, checked: g.checked,
      skipped: g.skipped ? t('card.skipped', { skipped: g.skipped }) : '',
      change: !d ? '' : (d > 0 ? t('card.moreBytes', { bytes: fmtBytes(Math.abs(d)) })
                                : t('card.lessBytes', { bytes: fmtBytes(Math.abs(d)) })) })}</p>`;
}

/* ---- Karte „Kennzahlen" — Abschnitt „Datenbank" ---- SIE TRAEGT
   WIEDER EINEN BEHANDLER, und zwar genau einen: den Verweis „Dateien zeigen"
   unter dem Fingerprint. */
function cardStats(fetched) {
  const { stats } = fetched;
  return `<div class="sys-card">
        <h3>${tH('card.metrics')}</h3>
        <p class="desc">${tH('card.metricsHint')}</p>
        <div class="kv"><span class="k">${esc(V.entryMany)}</span><span class="v">${stats.itemCount}</span></div>
        <div class="kv"><span class="k">${tH('list.photos')}</span><span class="v">${stats.photoCount} · ${fmtBytes(stats.photoBytes)}</span></div>
        <div class="kv"><span class="k">${tH('list.videos')}</span><span class="v">${stats.videoCount} · ${fmtBytes(stats.videoBytes)}</span></div>
        <div class="kv"><span class="k">${tH('dialog.comments')}</span><span class="v">${stats.commentCount}</span></div>
        <div class="kv"><span class="k">${tH('dialog.links')}</span><span class="v">${stats.linkCount}</span></div>
        <div class="kv"><span class="k">${esc(V.dayMany)}</span><span class="v">${stats.testDayCount}</span></div>
          <div class="kv"><span class="k">${tH('dialog.files')}</span><span class="v">${stats.attachmentCount} · ${fmtBytes(stats.attachmentBytes)}</span></div>
        ${/* Der Papierkorb steht GETRENNT da, aus demselben Grund wie die
             Videos: sonst wundert sich jemand ueber eine Datenbank, die nach
             dem Aufraeumen groesser ist als vorher. */''}
        ${/* Kommentarbilder standen bisher in keiner Zeile, obwohl sie als
             Blob in derselben Datei liegen wie Fotos und Anhaenge. */''}
        <div class="kv"><span class="k">${tH('card.commentImages')}</span><span class="v">${stats.commentImageCount || 0} · ${fmtBytes(stats.commentImageBytes)}</span></div>
        <div class="kv"><span class="k">${tH('card.trash')}</span><span class="v">${stats.trashCount || 0} · ${fmtBytes(stats.trashBytes)}</span></div>
        <div class="kv"><span class="k">${tH('card.database')}</span><span class="v">${fmtBytes(stats.dbBytes)}</span></div>
        ${/* DIE ZWEITE GROESSENANGABE, und sie beantwortet eine andere Frage
             als die Zeile darueber. */''}
        ${exportTotal(stats) ? `<div class="kv"><span class="k">${tH('card.exportSizeAll')}</span><span class="v">≈ ${fmtBytes(exportTotal(stats))}</span></div>` : ''}
        ${/* Der Fingerprint beantwortet, was die Versionsnummer nicht kann:
             ob die Dateien, die hier laufen, WIRKLICH zusammengehoeren. */''}
        ${/* DIE VERSION STAND IN DER ANTWORT SCHON IMMER, gezeigt hat die
             Karte sie nie -- sie lief nur in die Fusszeile. */''}
        <div class="kv"><span class="k">${tH('card.version')}</span><span class="v">${esc(stats.version || '—')}</span></div>
        <div class="kv"><span class="k">${tH('card.fingerprint')}</span><span class="v"><code>${esc(stats.fingerprint || '—')}</code></span></div>
        ${/* ---- DIE ACHTZEHN DATEIEN ---- DER
             FINGERPRINT SAGT NUR, DASS ETWAS ANDERS IST, und nicht, WAS. */''}
        ${(stats.fingerprintFiles || []).length ? `<div class="kv kv-act">
          <button class="link-btn" id="fp-files" aria-expanded="false"
            aria-controls="fp-list">${tH('card.showFiles')}</button></div>
        <div class="fp-list" id="fp-list" hidden>${stats.fingerprintFiles.map(z =>
          `<div class="fp-row"><span class="fp-name">${esc(z.name)}</span><code>${esc(z.hash)}</code></div>`).join('')}</div>` : ''}
        ${/* DER KLARTEXTSCHLUESSEL GEHOERT DEM EIGENTUEMER. */''}
        <div style="margin-top:14px">${stats.keyFromEnv
          ? `<div class="ok-box">${tMarks('card.keyFromSetting', {
              word: '<code>ENCRYPTION_KEY</code>',
              word2: '<code>.env</code>', word3: '<code>data/</code>' })}</div>`
          : (OWNER
            ? `<div class="warn-box">${tH('card.keyBesideHint')}
              <p style="margin:9px 0 6px">${tMarks('card.keyIntoEnv', { word: '<code>.env</code>' })}</p>
              <code class="keyline" id="keyline">ENCRYPTION_KEY=${esc(stats.keyHex || '')}</code>
              ${serverBox(t('card.restartHint'), 'docker compose up -d')}
            </div>`
            : `<div class="warn-box">${tMarks('card.keyStillBeside', { word: '<code>ENCRYPTION_KEY</code>' })}</div>`)}
        </div>
        ${/* ---- DIE VERFAHREN ---- AUS DEM BETRIEB: „was benutzt ihr
             eigentlich?" Die Antwort stand im Quelltext und sonst nirgends. */''}
        ${stats.method ? `<div class="sys-part"></div>
        <h4 class="sys-sub">${tH('card.techMethods')}</h4>
        ${/* SIE HEISST „Verschlüsselung" UND NICHT „Datenbank": eine Zeile
             mit dieser Beschriftung steht in derselben Karte schon — die
             Belegung auf der Platte. */''}
        <div class="kv"><span class="k">${tH('card.encryption')}</span><span class="v">${esc(stats.method.cipher || '—')}</span></div>
        <div class="kv"><span class="k">${tH('card.key')}</span><span class="v">${
          stats.method.keyBits ? t('card.keyBits', { keyBits: stats.method.keyBits }) : '—'}</span></div>
        <div class="kv"><span class="k">${tH('card.journal')}</span><span class="v">${esc(stats.method.journal || '—')}</span></div>
        <div class="kv"><span class="k">${tH('card.passwords')}</span><span class="v">${esc(stats.method.passwords || '—')}</span></div>` : ''}
      </div>`;
}

/* DER VERWEIS UNTER DEM FINGERPRINT. */
function setUpStatsOut() {
  const button = document.getElementById('fp-files');
  const list = document.getElementById('fp-list');
  // Ohne Liste kein Knopf: die Karte zeichnet beide oder keinen von beiden.
  if (!button || !list) return;
  button.onclick = () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    list.hidden = open;
    button.textContent = open ? t('card.showFiles') : t('card.hideFiles');
  };
}

/* ---- Karte „Bildablage" — Abschnitt „Datenbank" ---- SIE HAT DIE KARTE
   „Kennzahlen" VERLASSEN, und der Grund ist gewachsen und nicht erfunden. */
function cardImageStore(fetched) {
  const stats = fetched.stats || {};
  const bf = stats.imageFormats || {};
  const rows = IMAGE_FORMATS.filter(f => bf[f.key] && bf[f.key].count);
  const png = bf.png ? bf.png.count : 0;
  // Solange einer laeuft, ist der Knopf tot: der Server sagt dem zweiten Ruf
  // ohnehin ab, und ein Knopf, der zuverlaessig eine Absage erzeugt, sieht
  // aus wie ein Fehler.
  const running = !!(stats.conversion && stats.conversion.running);
  return `<div class="sys-card">
        <h3>${tH('card.imageFormats')}</h3>
        <p class="desc">${tH('card.formatsHint')}</p>
        ${rows.length ? rows.map(f => {
          const z = bf[f.key];
          // Der Hinweis am PNG sagt nur dann etwas, wenn die Umwandlung an ist.
          /* Der Hinweis am PNG sagt nur dann etwas, wenn ueberhaupt umkodiert
             wird -- bei 'png' bleibt jedes PNG, wie es hereinkam. */
          const hint = f.key === 'png'
            ? (IMAGE_STORE === 'png' ? '' : t('card.webpOnUpload')) : f.hint();
          return `<div class="kv"><span class="k">${f.name()}${
            hint ? ` <span class="extra">— ${hint}</span>` : ''
          }</span><span class="v">${z.count} · ${fmtBytes(z.bytes)}</span></div>`;
        }).join('') : `<p class="hint hint-sm" style="margin:2px 2px 0">${tH('card.noPhotosYet')}</p>`}
        ${OWNER ? `
        ${/* ---- DIE WAHL IST EIN KNOPF „Standard" JE ZEILE ---- DIESELBE BAUFORM
             WIE „Suchanbieter" UND „Sprachen": die Oberfläche hat für „eines
             von mehreren ist der Standard" genau eine Gestalt. */''}
        <h4 class="sys-sub">${tH('card.storeMethod')}</h4>
        <div class="engine-list" style="margin-top:6px">${IMAGE_STORES.map(k => {
          const w = IMAGE_STORE_WORDS[k];
          return `<div class="engine" data-store="${esc(k)}">
            <button type="button" class="sdefault${k === IMAGE_STORE ? ' on' : ''}"
              data-store-pick="${esc(k)}">${tH('card.standard')}</button>
            <span class="engine-name">${w ? esc(w.name()) : esc(k)}${
              w ? ` <span class="extra">— ${esc(w.hint())}</span>` : ''}</span>
          </div>`;
        }).join('')}</div>
        ${/* DIE AUFLAGE STEHT IMMER DA UND NICHT ERST NACH DEM EINSCHALTEN. */''}
        <p class="hint hint-sm" style="margin:8px 2px 0">${tH('card.storeCaveat')}</p>
        ${/* WAS DIE ABLEITUNGEN TUN, STEHT DANEBEN UND NICHT IN DER WAHL. Sie
             folgen ihr nicht — sie sind immer WebP. */''}
        <p class="hint hint-sm" style="margin:6px 2px 0">${tH('card.derivativesWebp')}</p>
        <div class="row-in" style="margin-top:12px">
          <button class="btn btn-sm" id="convert-run"${running || !(png && IMAGE_STORE !== 'png') ? ' disabled' : ''}>${tH('card.catchUpStore')}</button>
        </div>
        ${/* UND DIE ZEILE DARUNTER SAGT, WAS ER ANFASST — sie steht nur da,
             wenn es etwas zu sagen gibt. */''}
        ${running || !(png && IMAGE_STORE !== 'png') ? '' :
          `<p class="hint hint-sm" style="margin:6px 2px 0">${
            tH('card.catchUpBoth', { n: png })}</p>`}
        ${switchRow(stats.conversion)}
        ${geometryRow(stats.geometry)}` : ''}
      </div>`;
}


/* ---- Karte „Grenzen beim Hochladen" — Abschnitt „Datenbank" ---- */
const LIMIT_KINDS = [['photo', 'card.limitPhoto'], ['commentImage', 'card.limitCommentImage'],
  ['video', 'card.limitVideo'], ['commentVideo', 'card.limitCommentVideo'],
  ['attachment', 'card.limitAttachment']];
function cardLimits() {
  return `<div class="sys-card">
        <h3>${tH('card.uploadLimits')}</h3>
        <p class="desc">${tH('card.uploadLimitsHint')}</p>
        ${LIMIT_KINDS.map(([kind, label]) => {
          const g = UPLOAD_LIMIT_RANGES[kind] || {};
          return `<div class="field"><label for="limit-${kind}">${tH(label)}</label>
          <p class="desc" style="margin:0 0 6px">${tH('card.limitRange', { min: g.min, max: g.max })}</p>
          <input class="input" id="limit-${kind}" type="number" inputmode="numeric" data-limit="${kind}"
            min="${Number(g.min)}" max="${Number(g.max)}" step="1" value="${Number(UPLOAD_LIMITS[kind])}"${
            OWNER ? '' : ' disabled'}></div>`;
        }).join('')}
        <p class="hint hint-sm" style="margin:6px 2px 0">${tH('card.proxyBodyHint')}</p>
      </div>`;
}
function setUpLimitsOut() {
  if (!OWNER) return;
  document.querySelectorAll('[data-limit]').forEach(el => {
    el.onchange = async () => {
      try {
        const r = await api('PUT', '/api/settings', { uploadLimits: { [el.dataset.limit]: Number(el.value) } });
        if (r.uploadLimits) UPLOAD_LIMITS = { ...UPLOAD_LIMITS, ...r.uploadLimits };
        saved(el);
      } catch (e) {
        el.value = UPLOAD_LIMITS[el.dataset.limit];
        toast(e.message, true);
      }
    };
  });
}


/* WAS DIE UHR VERFOLGEN KANN -- eine Tafel und keine zweite Uhr. */
/* DER FERTIGSATZ IST EIN RUF, wie der Fortschrittssatz darueber
   schon immer einer war (siehe SYS_SECTIONS). */
const BATCH_RUNS = [
  { field: 'conversion', id: 'convert-running',
    text: (u) => t('card.convertProgress', { done: u.done, total: u.total }),
    finished: () => t('card.convertDone') },
  { field: 'geometry', id: 'thumbs-running',
    text: (g) => t('card.thumbnailsProgress', { done: g.done, total: g.total }),
    finished: () => t('card.thumbnailsRefreshed') }
];

/* DIE UHR, DIE DEN LAEUFEN ZUSIEHT. */
let inventoryClock = null;
function followBatchRun() {
  if (inventoryClock) return;
  const inFlight = new Set();
  const stop = () => { clearInterval(inventoryClock); inventoryClock = null; };
  inventoryClock = setInterval(async () => {
    if (!BATCH_RUNS.some(l => document.getElementById(l.id))) return stop();
    let s;
    // Ein Fehlschlag haelt an, statt im Sekundentakt weiterzufragen: wer die
// Sitzung verloren hat, bekommt sonst eine Meldung je Umlauf.
    try { s = await api('GET', '/api/stats'); } catch { return stop(); }
    const finished = [];
    for (const l of BATCH_RUNS) {
      const row = document.getElementById(l.id), status = s[l.field];
      if (!row || !status) continue;
      if (status.running) { row.textContent = l.text(status); inFlight.add(l.field); }
      else if (inFlight.delete(l.field)) finished.push(l.finished());
    }
    if (inFlight.size) return;
    stop();
    /* FERTIG HEISST: DIE GANZE KARTE NEU. */
    for (const message of finished) toast(message);
    if (finished.length) renderSystem();
  }, 1500);
}

function setUpImageStoreOut(fetched) {
  /* DIE DREI KNOEPFE „Standard" -- frueher ein createToggle() auf ein
     Haekchen. */
  for (const b of document.querySelectorAll('[data-store-pick]')) {
    b.onclick = async () => {
      const wanted = b.dataset.storePick;
      if (wanted === IMAGE_STORE) return;
      const before = IMAGE_STORE;
      IMAGE_STORE = wanted;
      try {
        const back = await api('PUT', '/api/settings', { imageStore: wanted });
        if (back && back.imageStore) IMAGE_STORE = back.imageStore;
        saved();
      } catch (e) { IMAGE_STORE = before; toast(e.message, true); }
      /* UND DER BESTAND BLEIBT, WIE ER IST -- F5, und das ist die Zusage, an
         der hier nichts zu tun ist. */
      renderSystem();
    };
  }

  atElement('convert-run', (button) => {
    button.onclick = async () => {
      const bf = (fetched.stats && fetched.stats.imageFormats) || {};
      const png = bf.png || { count: 0, bytes: 0 };
      // Der Dialog nennt vorher Zahl und Platz; die PNG-Fassung bringt danach
      // nur ein Backup des Datenverzeichnisses zurueck.
      /* DER DIALOG SAGT DREI DINGE UND SONST NICHTS: was geschieht, was
         danach weg ist, und dass es dauern kann. */
      /* UND DIE ZAHL IN SEINEM SATZ NENNT DIE EINE HAELFTE. */
      const ok = await secondConfirm('images', null, t('card.catchUpStore'),
        t('card.catchUpAsk', { n: png.count, bytes: fmtBytes(png.bytes),
                               after: fmtBytes(Math.round(png.bytes * 0.37)) }));
      if (!ok) return;
      try { await api('POST', '/api/images/convert', {}); }
      catch (e) { return toast(e.message, true); }
      /* NEU ZEICHNEN STATT DIE ZEILE VON HAND EINZUSETZEN: die Antwort auf
         /api/stats traegt den Lauf jetzt, die Karte baut sich daraus auf, und
         ruesteKennzahlenAus() haengt die Uhr gleich unten selbst an. */
      renderSystem();
    };
  });

  // Laeuft beim Oeffnen der Karte schon einer -- weil jemand sie neu geladen
  // hat, von woanders zurueckkommt oder der Server gerade erst angefangen hat
  // --, wird weitergezaehlt.
  if (fetched.stats && BATCH_RUNS.some(l => fetched.stats[l.field] && fetched.stats[l.field].running))
    followBatchRun();
}


/* DER NAME DER COMPOSE-DATEI. */
const COMPOSE_FILE = 'docker-compose.yml';

/* ---- Karte „Backup" — Abschnitt „Datenbank" ---- */
function cardBackup() {
  return `<div class="sys-card">
        <h3>${tH('card.backup')}</h3>
        <p class="desc">${tH('card.backupWhatHint')}</p>
        ${/* Der Hinweis auf den Schluessel steht am Knopf: das Backup ist ohne .env wertlos. */''}
        <div class="warn-box" style="margin:0 0 14px"><strong>${tH('card.backupEncrypted')}</strong>
          ${tMarks('card.withoutKeyFrom', { word: '<code>.env</code>' })}</div>
        <div id="backup-box"></div>
      </div>`;
}
function setUpBackupOut(fetched) {
  drawBackup(fetched);
}

  /* --- Backup --- */
  /* Gezeichnet wird aus dem, was oben schon geholt wurde; nach jedem
     Schreiben traegt die Antwort den neuen Stand, und die Karte zeichnet sich
     daraus neu. */
  function drawBackup(fetched) {
    const box = document.getElementById('backup-box');
    if (!box) return;
    const d = fetched.backup || {};
    if (!d.configured) {
      box.innerHTML = `<div class="warn-box">${esc(d.reason || t('card.noBackupDir'))}</div>`;
      return;
    }
    /* Diese Karte sagt nur etwas ueber das letzte Backup. */
    const last = d.last;
    const stateBox = d.error
      ? `<div class="warn-box" style="margin:0 0 12px">${esc(d.error)}</div>`
      : (!d.reachable
        ? `<div class="warn-box" style="margin:0 0 12px">${tH('server.backupDirUnreachable')}</div>`
        : (last
          ? `<div class="kv"><span class="k">${tH('card.lastBackup')}</span><span class="v">${tH('card.daysAgo', { n: last.daysAgo })}</span></div>
             <div class="kv"><span class="k">${tH('dialog.file')}</span><span class="v"><code>${esc(last.file)}</code></span></div>
             <div class="kv"><span class="k">${tH('card.size')}</span><span class="v">${fmtBytes(last.bytes)}</span></div>`
          : `<p class="desc" style="margin:0 0 12px">${tH('card.noBackupYet')}</p>`));

    // Nach einem Schluesselwechsel oeffnen sich die Backups von vorher nur mit dem alten.
    const changeBox = !d.changedAt ? '' : (
      last && last.outdated
        ? `<div class="warn-box" style="margin:0 0 12px">${tH('card.noBackupForKey', { changedAt: fmtDate(d.changedAt) })}
             <strong>${tH('card.backupNowHint')}</strong></div>`
        : (d.outdated
          ? `<div class="warn-box" style="margin:0 0 12px"><strong>${
               tH('card.backupsBeforeChange', { n: d.outdated })}</strong>
               (${esc(fmtDate(d.changedAt))}). ${tH('card.opensOnlyWith', { n: d.outdated })}</div>`
          : `<div class="ok-box" style="margin:0 0 12px">${tH('card.keyChangedHint', { changedAt: fmtDate(d.changedAt) })}</div>`));
    // Rot oder gruen an erster Stelle: die Lage des Backup-Ordners.
    const situation = d.inWorkDir
      ? `<div class="warn-box" id="backup-place" style="margin:0 0 12px">${tH('card.backupDirHint')} <code>${COMPOSE_FILE}</code>.</div>`
      : `<div class="ok-box" id="backup-place" style="margin:0 0 12px">${tH('card.backupDirOutsideHint')}</div>`;
    box.innerHTML = `
      ${situation}
      <div class="field"><label>${tH('card.backupDir')}</label>
        <p class="desc" style="margin:0 0 6px">${tMarks('card.configuredIs',
          { word: `<code>${esc(d.root || '')}</code>` })} ${tH('card.subDirOptional')}</p>
        <input class="input" id="backup-dir" value="${esc(d.place || '')}" placeholder="${esc(t('card.noSubDir'))}"
          autocapitalize="off" spellcheck="false"></div>
      <button class="btn btn-sm" id="backup-dir-save">${tH('dialog.save')}</button>
      <div class="sys-part"></div>
      ${stateBox}
      ${changeBox}
      <p class="desc" style="margin:0 0 10px">${tH('card.duringBackupHint', { dbBytes: fmtBytes(d.dbBytes), durationSeconds: d.durationSeconds })}</p>
      <button class="btn btn-accent btn-sm" id="backup-run">${tH('card.backupNow')}</button>`;

    document.getElementById('backup-dir-save').onclick = async () => {
      const value = document.getElementById('backup-dir').value;
      try {
        const r = await api('PUT', '/api/backup/dir', { place: value });
        // changedAt und outdated wandern mit, sonst verschwaende der Kasten
        // ueber die alten Backups beim ersten Speichern des Ortes.
        fetched.backup = { ...fetched.backup, place: r.place, filePath: r.filePath, error: null,
                      reachable: r.reachable, last: r.last, number: r.number,
                      changedAt: r.changedAt, outdated: r.outdated };
        saved();
        drawBackup(fetched);
      } catch (e) { toast(e.message, true); }
    };
    // Der Knopf sperrt sich, solange das Backup entsteht: VACUUM INTO laeuft synchron.
    document.getElementById('backup-run').onclick = async (e) => {
      const button = e.currentTarget;
      button.disabled = true;
      button.textContent = t('card.backupRunning');
      try {
        const r = await api('POST', '/api/backup');
        fetched.backup = { ...fetched.backup, reachable: r.reachable, last: r.last, number: r.number,
                      changedAt: r.changedAt, outdated: r.outdated };
        /* EINE MELDUNG UND NICHT ZWEI: toast() raeumt die vorige weg, zwei
           hintereinander hiessen also, die erste zu verschlucken. */
        toast(t('card.backupWrittenFile', { file: r.file, bytes: fmtBytes(r.bytes) }) +
              (r.cleaned && r.cleaned.removed
                ? ` · ${t('card.oldBackupsFreed',
                    { n: r.cleaned.removed, bytes: fmtBytes(r.cleaned.bytes) })}`
                : ''));
        // Wurde aufgeraeumt, zeichnet sich der Abschnitt neu: die Karte
        // "Alte Backups" zeigte sonst entfernte Dateien.
        if (r.cleaned && r.cleaned.removed) return renderSystem();
        drawBackup(fetched);
      } catch (err) {
        toast(err.message, true);
        button.disabled = false;
        button.textContent = t('card.backupNow');
      }
    };
  }


/* ---- Karte „Alte Backups" — Abschnitt „Datenbank", hinter „Backup" ---- */
function cardCleanup() {
  return `<div class="sys-card">
        <h3>${tH('card.oldBackups')}</h3>
        ${/* ZWEI SAETZE, UND JEDER TRAEGT EINE TATSACHE: dass es weg ist, und
             was ueberhaupt in Frage kommt. */''}
        <p class="desc">${tH('card.cleanupHint')}</p>
        <div id="cleanup-box"></div>
      </div>`;
}
function setUpCleanupOut(fetched) {
  drawCleanup(fetched);
}

  /* --- Alte Backups --- Gezeichnet wird aus dem, was oben schon geholt wurde. */
  function drawCleanup(fetched) {
    const box = document.getElementById('cleanup-box');
    if (!box) return;
    const d = fetched.backup || {};
    const a = d.cleanup || {};
    /* OHNE EINGERICHTETEN ORT SAGT DIE KARTE GENAU DAS UND SONST NICHTS. */
    if (!d.configured) {
      box.innerHTML = `<div class="warn-box">${tH('card.noBackupDirCard')}</div>`;
      return;
    }
    const gB = (a.limits && a.limits.keep) || { min: 1, max: 20, fallback: 3 };
    const gT = (a.limits && a.limits.days) || { min: 7, max: 365, fallback: 30 };
    const keep = Number.isInteger(a.keep) ? a.keep : gB.fallback;
    const days = Number.isInteger(a.days) ? a.days : gT.fallback;

    /* Die Liste aller Backups, juengste zuerst, nummeriert. Der Knopf heisst
       nur „prüfen": die Zeile misst am Telefon 366 px. */
    const row = (z) => {
      const mark = z.affected ? `<span class="cleanup-badge remove">${tH('card.deleteLower')}</span>`
                  : z.outdated ? `<span class="cleanup-badge old">${tH('card.oldKey')}</span>` : '';
      return `<div class="mrow">
        <span class="mname">#${z.nr} · ${esc(fmtDate(z.at))}</span>${mark}
        ${/* DIE GRÖSSE STEHT VORN, SEIT DER VERWEIS DANEBEN STEHT. */''}
        <span class="mcount">${esc(fmtBytes(z.bytes))} · ${
          tH('card.daysAgo', { n: z.daysAgo })}</span>
        <button class="link-btn backup-check" data-nr="${z.nr}">${tH('card.checkBackup')}</button>
        </div><div class="backup-probe" id="probe-${z.nr}" hidden></div>`;
    };
    const all = Array.isArray(a.files) ? a.files : [];
    const matched = Array.isArray(a.matched) ? a.matched : [];
    const oldCount = Number(a.oldCount) || 0;

    const listBox = !a.reachable
      ? `<div class="warn-box" style="margin:0 0 12px">${esc(d.error ||
           t('server.backupDirUnreachable'))}</div>`
      : (all.length
        ? `<div class="label" style="margin:0 0 6px">${tH('card.backupsCount', { length: all.length })}</div>
           <div class="manage-list" id="cleanup-list">${all.map(row).join('')}</div>`
        : `<p class="hint hint-sm" style="margin:2px 2px 0">${tH('card.noBackupInFolder')}</p>`);

    /* WAS DIE REGEL JETZT TREFFEN WUERDE -- eine Zeile unter der Liste, und
       in ihr steht die Zahl, die Summe und sonst nichts. */
    const stateBox = !a.reachable ? '' : (matched.length
      ? `<p class="desc" style="margin:10px 0 6px">${tH('card.deleteFreesHint',
           { n: matched.length, bytes: fmtBytes(a.bytes || 0) })}</p>`
      : `<p class="desc" style="margin:10px 0 6px">${tH('card.nothingDeleted')} ${
           esc(a.reason || '')}</p>`);

    /* Die Backups von vor dem Schluesselwechsel: eigene Zahl, eigene Summe,
       eigener Knopf. */
    const outdatedBox = !oldCount ? '' : `
      <div class="sys-part"></div>
      <p class="desc" style="margin:0 0 8px">${tH('card.cleanupKeepsHint',
        { n: oldCount, bytes: fmtBytes(a.oldBytes || 0) })}</p>
      <div class="row-in">
        <button class="btn btn-sm" id="cleanup-old">${
          tH('card.oldKeyBackupsDelete', { n: oldCount })}</button>
      </div>`;

    box.innerHTML = `
      <label class="ex-files"><input type="checkbox" id="cleanup-toggle"${a.an ? ' checked' : ''}>
        ${tH('card.cleanupAfterBackup')}</label>
      ${/* WAS DER HAKEN TUT, IN EINEM HALBEN SATZ. Ohne ihn ist der Knopf der
           einzige Weg -- das ist die ganze Auskunft, die er braucht. */''}
      <p class="hint hint-sm" style="margin:6px 2px 0">${tH('card.onlyOnButton')}</p>
      <div class="sys-part"></div>
      <div class="field"><label for="cleanup-keep">${tH('card.keepAtLeast')}</label>
        <p class="desc" style="margin:0 0 6px">${tH('card.keepAtLeastNote', { min: gB.min, max: gB.max })}</p>
        <input class="input" id="cleanup-keep" type="number" inputmode="numeric"
          min="${Number(gB.min)}" max="${Number(gB.max)}" step="1" value="${Number(keep)}"></div>
      <div class="field"><label for="cleanup-days">${tH('card.deleteFromAge')}</label>
        <p class="desc" style="margin:0 0 6px">${tH('card.backupDeleteRule', { keep: keep, min: gT.min, max: gT.max })}</p>
        <input class="input" id="cleanup-days" type="number" inputmode="numeric"
          min="${Number(gT.min)}" max="${Number(gT.max)}" step="1" value="${Number(days)}"></div>
      <div class="sys-part"></div>
      ${listBox}
      ${stateBox}
      <div class="row-in">
        <button class="btn btn-accent btn-sm" id="cleanup-run"${matched.length ? '' : ' disabled'}>${tH('card.deleteNow')}</button>
      </div>
      ${outdatedBox}`;

    /* --- Der Schalter. Bei einem Fehlschlag geht die Stellung zurueck --
       sonst zeigte der Bildschirm etwas anderes an, als der Server haelt. */
    atElement('cleanup-toggle', (el) => {
      el.onchange = async () => {
        const before = !el.checked;
        try {
          await api('PUT', '/api/settings', { backupCleanup: el.checked });
          fetched.backup = { ...fetched.backup,
                               cleanup: { ...a, an: el.checked } };
          toast(el.checked ? t('card.cleanupOn') : t('card.cleanupOff'));
        } catch (e) { el.checked = before; toast(e.message, true); }
      };
    });

    /* --- Die beiden Zahlenfelder. */
    const values = () => ({
      keep: Number(document.getElementById('cleanup-keep')?.value),
      days: Number(document.getElementById('cleanup-days')?.value)
    });
    let previewRun = 0;
    const previewNew = async () => {
      const w = values();
      if (!Number.isInteger(w.keep) || !Number.isInteger(w.days)) return;
      const run = ++previewRun;
      let fresh;
      try {
        fresh = await api('GET', `/api/backup?keep=${w.keep}&days=${w.days}`);
      } catch { return; }   // eine Zahl ausserhalb der Grenzen: die Liste bleibt stehen
      /* NUR DIE JUENGSTE ANTWORT ZAEHLT. */
      if (run !== previewRun) return;
      if (!document.getElementById('cleanup-box')) return;
      fetched.backup = fresh;
      drawCleanup(fetched);
    };
    for (const [id, key] of [['cleanup-keep', 'backupKeep'],
                                    ['cleanup-days', 'backupDays']])
      atElement(id, (el) => {
        el.oninput = previewNew;
        el.onchange = async () => {
          const n = Number(el.value);
          try {
            await api('PUT', '/api/settings', { [key]: n });
            fetched.backup = { ...fetched.backup,
                                 cleanup: { ...(fetched.backup || {}).cleanup,
                                               [id === 'cleanup-keep' ? 'keep' : 'days']: n } };
            saved();
          } catch (e) { toast(e.message, true); }
        };
      });

    /* --- Die beiden Knoepfe. */
    const clear = async (kind, title, event) => {
      if (!(await secondConfirm('backup', null, title, event))) return;
      let r;
      try { r = await api('POST', '/api/backup/cleanup', { kind }); }
      catch (e) { return toast(e.message, true); }
      fetched.backup = { ...fetched.backup, reachable: r.reachable, last: r.last,
                           number: r.number, changedAt: r.changedAt, outdated: r.outdated,
                           cleanup: { ...(fetched.backup || {}).cleanup, ...r.cleanup } };
      toast(t('card.backupsDeleted', { n: r.removed, bytes: fmtBytes(r.bytes),
        extra: r.notDeleted ? t('card.notDeleted', { notDeleted: r.notDeleted }) : '' }));
      // Die Karte "Backup" nennt das letzte Backup, und das kann jetzt ein anderes sein.
      renderSystem();
    };
    atElement('cleanup-run', (button) => {
      button.onclick = () => clear('rule', t('card.deleteBackups'),
        t('card.backupsPurgeHint',
          { n: matched.length, bytes: fmtBytes(a.bytes || 0) }));
    });
    atElement('cleanup-old', (button) => {
      button.onclick = () => clear('outdated', t('card.deleteOldKeyBackups'),
        t('card.oldKeyBackupsPurge',
          { n: oldCount, bytes: fmtBytes(a.oldBytes || 0) }));
    });

    /* ---- Die Probe eines Backups ---- Ohne Rueckfrage: sie liest nur. */
    box.querySelectorAll('.backup-check').forEach(button => {
      button.onclick = async () => {
        const nr = Number(button.dataset.nr);
        const out = document.getElementById('probe-' + nr);
        const word = button.textContent;
        button.disabled = true;
        button.textContent = t('card.checkRunning');
        try {
          const r = await api('POST', '/api/backup/check', { nr });
          if (out) {
            out.hidden = false;
            /* DREI ANTWORTEN, DREI SAETZE. */
            out.innerHTML = r.ok
              ? `<span class="probe-ok">${esc(V.entryMany)} ${Number(r.itemCount)} · ${
                   tH('list.photos')} ${Number(r.photoCount)} · ${tH('card.checkUsers')} ${Number(r.userCount)}${
                   r.contentUntil ? ` · ${tH('card.checkUntil')} ${esc(fmtDate(r.contentUntil))}` : ''}</span>`
              : `<span class="probe-no">${
                   r.reason === 'key' ? tH('card.checkKeyWrong') : tH('card.checkForeign')}</span>`;
          }
        } catch (e) { toast(e.message, true); }
        button.disabled = false;
        button.textContent = word;
      };
    });
  }


/* ---- Karte „Export und Import" — Abschnitt „Datenbank" ---- */
function cardExport(fetched) {
  const { stats } = fetched;
  return `<div class="sys-card">
        <h3>${tH('card.exportAndImport')}</h3>
        ${/* DIE ROLLENTEILUNG GEHOERT AN DIE KARTE, nicht nur in die Doku. */''}
        <p class="desc">${tH('card.exportPurposeHint')}</p>
        <p class="desc">${tH('card.exportWritesHint')}</p>
        ${/* DIE ZAHLEN AN DEN KNOEPFEN SIND LEBENDIG. */''}
        ${/* EIN KIND JE KNOPF UND NICHT DREI. `.btn` ist `inline-flex` mit
             `gap: 7px`. */''}
        <div class="row-in">
          <button class="btn btn-accent btn-sm" id="ex-yes"><span>${tMarks('card.withPhotos',
            { word: '<span id="ex-gr-yes">…</span>' })}</span></button>
          <button class="btn btn-sm" id="ex-no"><span>${tMarks('card.withoutPhotos',
            { word: '<span id="ex-gr-no">…</span>' })}</span></button>
        </div>
        <label class="ex-files"><input type="checkbox" id="ex-files">
          ${tH('card.includeFiles', { size: fmtBytes((stats.export?.attachments || 0) + (stats.export?.commentImages || 0)) })}</label>
        ${/* Eigener Schalter, Vorgabe aus. */''}
        <label class="ex-files"><input type="checkbox" id="ex-videos">
          ${tH('card.includeVideos', { size: fmtBytes(stats.export?.videos || 0) })}</label>
        ${stats.videoCount ? `<p class="hint hint-sm" style="margin:6px 2px 0">
          ${tH('card.videosExcludedHint')}</p>` : ''}
        ${/* DER HINWEIS STEHT VOR DEM KNOPF UND NICHT HINTER DEM ABBRUCH. */''}
        <div id="ex-warn"></div>
        ${/* DER WEG, WENN DIE EINE DATEI NICHT GEHT. */''}
        <div class="ex-parts">
          <div class="row-in" style="align-items:baseline">
            <button class="btn btn-sm" id="ex-plan">${tH('card.exportInParts')}</button>
            <label class="hint hint-sm" style="display:flex;align-items:baseline;gap:6px">
              ${tH('card.atMost')}
              ${/* DIE BESCHRIFTUNG KOMMT AUS DEM WERT. */''}
              <select class="input input-sm" id="ex-target" style="width:auto">
                ${[52428800, 104857600, 209715200, 314572800].map(v =>
                  `<option value="${v}"${v === 314572800 ? ' selected' : ''}>${
                    v / 1048576} MB</option>`).join('')}
              </select>
              ${tH('card.perFile')}
            </label>
          </div>
          <div id="ex-plan-out"></div>
        </div>
        ${/* ---- DER IMPORT STEHT IN DERSELBEN KARTE UND EINE STUFE TIEFER
             ---- ZUSAMMENGELEGT, WEIL SIE DASSELBE MEINEN: die eine Datei
             geht hinaus, dieselbe Datei kommt herein. */''}
        <div class="sys-part"></div>
        <h4 class="sys-sub">${tH('card.import')}</h4>
        <p class="desc">${tH('card.importHint')}</p>
        <label class="drop drop-quiet" id="imp-drop"><input type="file" id="imp" accept="application/json,.json">
          ${tH('card.pickExportFile')}</label>
      </div>`;
}
function setUpExportOut(fetched) {
  atElement('ex-yes', b => b.onclick = () => runExport(true));
  atElement('ex-no', b => b.onclick = () => runExport(false));
  for (const id of ['ex-files', 'ex-videos'])
    atElement(id, e => e.addEventListener('change', () => exportNumbers(fetched)));
  exportNumbers(fetched);
  atElement('ex-plan', b => b.onclick = drawPartPlan);
  // Aendert sich ein Schalter oder die Teilgroesse, gilt der gezeichnete Plan
// nicht mehr -- ein stehengebliebener Plan naennte falsche Grenzen.
  for (const id of ['ex-files', 'ex-videos', 'ex-target'])
    atElement(id, e => e.addEventListener('change', () => {
      const boxId = document.getElementById('ex-plan-out');
      if (boxId) boxId.innerHTML = '';
    }));
  atElement('imp', imp => imp.onchange = e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) askImport(file, fetched.stats && fetched.stats.export);
  });
}

  // Dateien haben einen eigenen Schalter mit Vorgabe aus: bei 50 MB je Datei
// waere die Exportdatei sonst schnell unhandlich.
  const withFiles = () => (document.getElementById('ex-files')?.checked ? '&files=1' : '') +
                           (document.getElementById('ex-videos')?.checked ? '&videos=1' : '');

  /* ---- DER HINWEIS VOR DEM LAUF ---- Er sagt an, was kommt, und stellt die
     drei Wege nebeneinander. KEIN HAEKCHEN „nicht mehr zeigen": wer
     exportiert, tut es selten. */
  function longRunNotice(titleKey) {
    return new Promise(resolve => {
      const { bd, done } = openModal(`<div class="modal"><h2>${tH(titleKey)}</h2>
        <p>${tH('card.runTakesTime')} ${tH('card.runNoProgress')} ${tH('card.runKeepOpen')}</p>
        <div class="warn-box"><strong>${tH('card.whichWayHeading')}</strong>
          <ul style="margin:6px 0 0 18px">
            <li><strong>${tH('card.wayFile')}</strong> — ${tH('card.wayFileHint')}</li>
            <li><strong>${tH('card.exportInParts')}</strong> — ${tH('card.wayPartsHint')}</li>
            <li><strong>${tH('card.backup')}</strong> — ${tH('card.wayBackupHint')}</li>
          </ul>
          <p style="margin:8px 0 0">${tH('card.onlyBackupComplete')} ${tH('card.exportOnlyEntries')}</p></div>
        <div class="modal-acts">
          <button class="btn btn-ghost" data-no>${tH('dialog.cancel')}</button>
          <button class="btn btn-accent" data-yes>${tH('card.carryOn')}</button>
        </div></div>`, resolve, false);
      bd.querySelector('[data-no]').onclick = () => done(false);
      bd.querySelector('[data-yes]').onclick = () => done(true);
      bd.querySelector('[data-yes]').focus();
    });
  }

  /* DER EXPORT BLEIBT EINE NAVIGATION -- die Datei laeuft damit an der Platte
     vorbei statt vollstaendig im Speicher zu stehen. */
  const runExport = async (withPhotos) => {
    if (!await longRunNotice('card.exportRunTitle')) return;
    if (!await secondConfirm('export', null, t('card.confirmExport'),
      t('card.exportHint'))) return;
    window.location = `/api/export?photos=${withPhotos ? 1 : 0}` + withFiles();
  };

  /* DIE GROESSEN AN DEN KNOEPFEN, und sie folgen den Haekchen. */
  function exportNumbers(fetched) {
    /* `stats` bleibt null, wer nicht Admin ist. */
    const ex = fetched.stats && fetched.stats.export;
    if (!ex) return;
    const toggle = {
      withFiles: !!document.getElementById('ex-files')?.checked,
      withVideos: !!document.getElementById('ex-videos')?.checked
    };
    const withPhotos = exportSum(ex, { ...toggle, withPhotos: true });
    const withoutPhotos = exportSum(ex, { ...toggle, withPhotos: false });
    atElement('ex-gr-yes', e => e.textContent = fmtBytes(withPhotos));
    atElement('ex-gr-no', e => e.textContent = fmtBytes(withoutPhotos));
    atElement('ex-warn', boxId => {
      if (withPhotos <= ex.warnFrom) { boxId.innerHTML = ''; return; }
      // „Auch ohne Fotos" ist der schlimmere Fall und gehoert deshalb gesagt:
// wer ihn hat, kommt mit dem zweiten Knopf nicht davon.
      const alsoWithout = withoutPhotos > ex.warnFrom;
      boxId.innerHTML = `<div class="warn-box" style="margin:12px 0 0">
        ${tH('card.exportOversizeHint',
          { withPhotos: fmtBytes(withPhotos), rest: alsoWithout
              ? t('card.sizeWithoutPhotos', { withoutPhotos: fmtBytes(withoutPhotos) })
              : t('card.withoutPhotosSize', { withoutPhotos: fmtBytes(withoutPhotos) }) })}
        <p style="margin:9px 0 0">${tH('card.usePartsHint')}</p></div>`;
    });
  }

  /* ---- Der Export in Teilen ---- JEDER TEIL IST EINE VOLLSTAENDIGE
     EXPORTDATEI. */
  const partSwitch = () => 'photos=1' + withFiles();
  async function drawPartPlan() {
    const boxId = document.getElementById('ex-plan-out');
    if (!boxId) return;
    const target = document.getElementById('ex-target')?.value || '';
    boxId.innerHTML = `<p class="hint hint-sm" style="margin:10px 2px 0">${tH('card.calculating')}</p>`;
    let plan;
    try { plan = await api('GET', `/api/export/plan?${partSwitch()}&target=${encodeURIComponent(target)}`); }
    catch (e) { boxId.innerHTML = `<p class="hint hint-sm">${esc(e.message)}</p>`; return; }

    const n = (plan.parts || []).length;
    if (!n && !(plan.tooBig || []).length) {
      boxId.innerHTML = `<p class="hint hint-sm" style="margin:10px 2px 0">${tH('card.nothingToExport')}</p>`;
      return;
    }
    /* EIN EINTRAG, DER FUER SICH ALLEIN ZU GROSS IST, WIRD BEIM NAMEN GENANNT
       und nicht stillschweigend uebergangen. */
    const tooBigBox = (plan.tooBig || []).length ? `<div class="warn-box" style="margin:10px 0 0">
      ${tH('card.aloneOverLimit', { n: plan.tooBig.length, thing: vThing(plan.tooBig.length),
        string: fmtBytes(plan.string) })}
      <ul style="margin:6px 0 0 18px">${plan.tooBig.map(z =>
        `<li>${esc(z.title)} — ${esc(fmtBytes(z.bytes))}</li>`).join('')}</ul>
      <p style="margin:8px 0 0">${tH('card.withoutVideosHint')}</p></div>` : '';

    boxId.innerHTML = `${tooBigBox}
      ${n ? `<p class="desc" style="margin:10px 0 6px">${tH('card.eachAtMost', { n: n, targetSize: fmtBytes(plan.targetSize) })} <strong>${tH('card.partIsComplete')}</strong></p>
      <div class="manage-list" id="ex-part-list">${plan.parts.map(part => `
        <div class="mrow">
          <span class="mname">${tH('card.partOf', { part: part.nr, count: part.count })} ${esc(vThing(part.count))}</span>
          <button class="mact ex-part-load" data-nr="${Number(part.nr)}" data-from="${Number(part.from)}" data-to="${Number(part.to)}"
            disabled>${tH('card.load')}</button>
          <span class="trash-meta">${esc(fmtBytes(part.bytes))}</span>
        </div>`).join('')}</div>
      ${/* DER KNOPF NENNT DIE HANDLUNG UND NICHT DIE MECHANIK. */''}
      <p class="hint hint-sm" style="margin:10px 2px 6px">${tH('card.exportPasswordHint',
        { extra: TWO_FACTOR ? t('card.andTwoFactorCode') : '' })}</p>
      <div class="row-in"><button class="btn btn-accent btn-sm" id="ex-confirm">
        ${tH('card.confirmOnce', { n: n })}</button></div>
      ${/* DER EINSPIELWEG GEHOERT AN DIE KARTE UND NICHT IN DIE
           DOKUMENTATION. */''}
      <p class="hint hint-sm" style="margin:10px 2px 0">${tH('card.partOrderHint')}</p>` : ''}`;

    /* GEFRAGT WIRD EINMAL, GEPRUEFT WIRD JE TEIL. Ohne das muesste das Passwort
       je Datei getippt werden -- bei fünf Teilen fünfmal. */
    atElement('ex-confirm', b => b.onclick = async () => {
      const ok = await confirmTwiceMany('export', plan.parts.map(part => part.nr),
        t('card.confirmExport'),
        t('card.exportPartsHint', { n: n }));
      if (!ok) return;
      b.disabled = true;
      b.textContent = t('card.partsConfirmed');
      boxId.querySelectorAll('.ex-part-load').forEach(k => { k.disabled = false; });
    });

    /* JEDER KNOPF GILT GENAU EINMAL, weil die Freigabe verbraucht wird. */
    boxId.querySelectorAll('.ex-part-load').forEach(k => {
      k.onclick = () => {
        window.location = `/api/export?${partSwitch()}` +
          `&from=${k.dataset.from}&to=${k.dataset.to}&part=${k.dataset.nr}&parts=${n}`;
        k.disabled = true;
        k.innerHTML = `${ICON_CHECK} ${tH('card.partLoaded')}`;
      };
    });
  }


/* DER BILLIGERE DER BEIDEN FAELLE: beim Import steht die Groesse VOR dem
   Einlesen fest. */
async function importSizeTested(file, limits) {
  const warnFrom = limits && limits.warnFrom;
  if (!warnFrom || file.size <= warnFrom) return true;
  const limit = limits.string;
  return confirmBox(t('card.fileVeryBig'),
    t('card.fileTooBig', { size: fmtBytes(file.size), limit: fmtBytes(limit) }),
    t('card.tryAnyway'));
}

function askImport(file, limits) {
  let info = null;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const j = JSON.parse(reader.result);
      const withPhotos = (j.items || []).some(i => (i.photos || []).some(p => p.data_base64));
      info = { count: (j.items || []).length, date: j.exported_at, title: j.title, withPhotos };
    } catch { info = null; }
    show();
  };
  // Erst fragen, dann lesen. Andersherum stuende der Browser schon minutenlang
// an der Datei, bevor die Warnung ueberhaupt erscheinen koennte.
  importSizeTested(file, limits).then(more => { if (more) reader.readAsText(file); });

  function show() {
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    if (!info) {
      bd.innerHTML = `<div class="modal"><h2>${tH('card.importNotPossible')}</h2>
        <p>${tH('card.fileNotExport')}</p>
        <div class="modal-acts"><button class="btn" data-close>${tH('list.close')}</button></div></div>`;
      document.body.appendChild(bd);
      bd.querySelector('[data-close]').onclick = () => bd.remove();
      bd.onclick = e => { if (e.target === bd) bd.remove(); };
      return;
    }
    bd.innerHTML = `<div class="modal"><h2>${tH('card.import')}</h2>
      <p>${tH('card.fileContainsHint', { n: info.count, thing: vThing(info.count),
        /* EIGENE BESCHRIFTUNG STATT DER GELIEHENEN. */
        rest: info.withPhotos ? t('card.withPhotosPlain') : t('card.withoutPhotosPlain'),
        from: info.title ? t('card.createdFrom', { title: info.title }) : '',
        when: info.date ? t('card.onDate', { date: fmtDate(info.date.replace('T',' ').slice(0,19)) }) : '' })}</p>
      <p>${tH('card.importQuestion')}</p>
      <div class="warn-box">${tH('card.replaceExplainHint')}<br><br>
        ${tH('card.mergeExplainHint')}</div>
      <div class="modal-acts">
        <button class="btn btn-ghost" data-cancel>${tH('dialog.cancel')}</button>
        <button class="btn" data-merge>${tH('card.merge')}</button>
        <button class="btn btn-danger" data-replace>${tH('card.replace')}</button>
      </div></div>`;
    document.body.appendChild(bd);
    const close = () => bd.remove();
    bd.querySelector('[data-cancel]').onclick = close;
    bd.onclick = e => { if (e.target === bd) close(); };

    const run = async (mode) => {
      if (!await longRunNotice('card.importRunTitle')) return;
      if (mode === 'replace' && !await confirmBox(t('card.replaceAsk'),
        t('card.importWipeHint'), t('card.replace'))) return;
      if (!await secondConfirm('import', null, t('card.confirmImport'),
        mode === 'replace'
          ? t('card.importReplaceHint')
          : t('card.importAddHint'))) return;
      close();
      const busy = document.createElement('div');
      busy.className = 'backdrop';
      busy.innerHTML = `<div class="modal"><h2>${tH('card.importRunning')}</h2>
        <p>${tH('card.convertPatienceHint')}</p></div>`;
      document.body.appendChild(busy);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', mode);
      try {
        const r = await api('POST', '/api/import', fd, true);
        busy.remove();
        // Die Verfasser, die dem Einspielenden zugefallen sind, wie beim Papierkorb.
        const open = Array.isArray(r.authorUnknown) ? r.authorUnknown : [];
        toast(t('card.importedCounts', { items: r.items, thing: vThing(r.items),
          photos: r.photos, videos: r.videos || 0, attachments: r.attachments }) +
          (open.length ? t('card.postsAssignedHint', { names: open.join(', ') }) : ''));
        /* Nicht abbrechen, melden -- und laut genug, dass es auffaellt: fehlt
           ein Video, kann das naechste Foto zum Hauptbild geworden sein. */
        const missing = (r.videosWithoutFile || 0) + (r.videosUnreadable || 0);
        if (missing) toast(t('card.videosMissing', { n: missing }), true);
        location.hash = '#/';
        if (location.hash === '#/') renderList();
      } catch (e) { busy.remove(); toast(e.message, true); }
    };
    bd.querySelector('[data-merge]').onclick = () => run('merge');
    bd.querySelector('[data-replace]').onclick = () => run('replace');
  }
}

/* ================= Start ================= */
let setupNeeded = false;
(async function boot() {
  /* BEIDES VOR DEM ERSTEN ZEICHNEN: hier steht noch
     nichts am Bildschirm, also blitzt auch nichts auf. */
  let cfg = null;
  try {
    cfg = await fetch('/api/config', { credentials: 'same-origin' }).then(r => r.json());
    if (cfg && cfg.title) TITLE_PUBLIC = cfg.title;
    if (cfg && cfg.version) VERSION = cfg.version;
    if (cfg && cfg.minPassword) MIN_PASSWORD = cfg.minPassword;
    if (cfg && cfg.setupRequired) setupNeeded = true;
    SIGNUP = Boolean(cfg && cfg.signup);
  } catch {}
  /* DIE ZWEITE UND DRITTE QUELLE DER SPRACHE. */
  if (cfg && cfg.language) LANGUAGE_DEFAULT = cfg.language;
  try {
    await loadLanguages(LANGUAGE_DEFAULT);
  } catch (e) {
    /* DER EINE FESTE SATZ IM QUELLTEXT. */
    app.textContent = 'Die Sprachdatei fehlt.';
    return;
  }
  /* WAS DIE SEITE SPRICHT, STEHT AM WURZELELEMENT. */
  applyLanguage();
  try { showVersion(); } catch {}
  document.title = TITLE_PUBLIC;
  // Die Einrichtung geht vor: ohne Zugang hilft keine Anmeldemaske.
  if (setupNeeded) return showSetup();
  /* Ein Link aus einer Einladung oder Rücksetzung geht VOR der Anmeldemaske,
     aber NACH der Einrichtung: wer einen bekommen hat, will nicht erst ein
     Passwort eingeben, das er ja gerade nicht kennt. */
  translateAddress();
  const invite = (location.hash || '').match(/^#\/invite\/([0-9a-f]{16,128})$/);
  if (invite) return showInvite(invite[1]);
  /* Der Bestätigungslink der Selbstanmeldung, — an derselben Stelle und aus
     demselben Grund wie der Einladungslink: wer ihn anklickt, meint ihn, auch
     wenn im Browser noch jemand angemeldet ist. */
  const best = (location.hash || '').match(/^#\/confirm\/([0-9a-f]{16,128})$/);
  if (best) return showConfirm(best[1]);
  try {
    const s = await fetch('/api/session', { credentials: 'same-origin' }).then(r => r.json());
    if (s.authenticated) start(); else showLogin();
  } catch { showLogin(t('login.serverUnreachable')); }
})();
