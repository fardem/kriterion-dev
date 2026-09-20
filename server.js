const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const zlib = require('zlib');
const express = require('express');
const multer = require('multer');
const { Worker } = require('worker_threads');
const attachments = require('./attachments');
const { logLine, logWarn, logFail } = require('./log');
// Eine Quelle fuer die Versionsnummer: die package.json.
const VERSION = require('./package.json').version;
const sharp = require('sharp');
/* WIE VIELE THREADS libvips SICH NEHMEN DARF, ausdruecklich gesetzt.
   UND os.cpus() IST IM CONTAINER NICHT DIE WAHRHEIT UEBER DAS KONTINGENT: es
   meldet die Kerne des Wirts. */
sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));
/* DIE BILDABLEITUNGEN STEHEN IN images.js und nicht mehr hier. */
/* `isPng` STEHT HIER NICHT MEHR: die einzige Stelle, die es im Server rief,
   war die Schleife des Bestandslaufs -- und die faehrt im Thread. */
const { makeVariants, VARIANTS, storeImage, IMAGE_STORES, IMAGE_STORE_DEFAULT, isImageStore } = require('./images');
const { db, DATA_DIR, DB_FILE, keyFromEnv, keyHex, renumberCriteria, method, searchFold, emailsDoubled } = require('./db');
/* DERSELBE TREIBER, EIN ZWEITER GRIFF. */
const Database = require('better-sqlite3-multiple-ciphers');
const auth = require('./auth');
/* DER PRUEFSCHALTER FUER DIE ANSAGE BEIM START. */
const keys = require('./keys');
const mail = require('./mail');

/* ================= Die Sprachdateien ================= */
/* TEXT IST DATEN UND NICHT PROGRAMM. */
const LANGUAGE_DIR = path.join(__dirname, 'public', 'languages');

/* DIE SPRACHE DER AUSLIEFERUNG, Vorgabe (1) des Betreibers. */
const LANGUAGE_FALLBACK = 'en';

/* WIE EINE SPRACHKENNUNG AUSSIEHT -- BCP 47, und nicht aus Geschmack: GENAU
   DIESE Zeichenfolge steht in <html lang>, und Intl erwartet sie fuer Datum,
   Zahl und Sortierung. */
const LANGUAGE_NAME = /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|[0-9]{3}))?$/;

/* EINE ZEILE INS CONTAINERPROTOKOLL, und die Datei zaehlt nicht. */
/* DIE BEGRUENDUNG IST ENGLISCH, und nicht nur der Rahmen um sie
   herum. */
const languageSkip = (file, why) => console.error(
  `[languages] ${file} does not count as a language: ${why}`);

function readLanguages() {
  const out = {};
  for (const file of fs.readdirSync(LANGUAGE_DIR).sort()) {
    if (!file.endsWith('.json')) continue;
    const code = file.slice(0, -'.json'.length);
    if (!LANGUAGE_NAME.test(code)) {
      languageSkip(file, 'the leading part is not a language tag under BCP 47');
      continue;
    }
    let texts;
    try {
      texts = JSON.parse(fs.readFileSync(path.join(LANGUAGE_DIR, file), 'utf8'));
    } catch (e) {
      languageSkip(file, `it cannot be read (${e.message})`);
      continue;
    }
    // Ein Array ist auch ein Objekt -- und traegt trotzdem keine Schluessel.
    if (!texts || typeof texts !== 'object' || Array.isArray(texts)) {
      languageSkip(file, 'it does not carry an object');
      continue;
    }
    if (typeof texts._locale !== 'string') {
      languageSkip(file, '_locale is missing from the head of the file');
      continue;
    }
    /* DIE LOCALE WIRD AN Intl GEHALTEN UND NICHT AN EINEM MUSTER GEMESSEN:
       wer entscheidet, ob eine Locale brauchbar ist, ist der, der sie
       benutzt. */
    try { new Intl.PluralRules(texts._locale); }
    catch {
      languageSkip(file, `Intl does not know the locale "${texts._locale}"`);
      continue;
    }
    out[code] = texts;
  }
  return out;
}
const LANGUAGES = readLanguages();
/* IN DER FOLGE DES VERZEICHNISSES, und die ist sortiert gelesen -- damit die
   Pillenreihe in jeder Ansicht dieselbe Reihenfolge hat. */
const LANGUAGE_CODES = Object.keys(LANGUAGES);
if (!LANGUAGES[LANGUAGE_FALLBACK]) console.error(
  `[languages] ${LANGUAGE_FALLBACK}.json is missing or does not count -- the ` +
  `fallback points at ${LANGUAGE_CODES[0] || '(no language)'} instead.`);

/* WORAUF JEDER RUECKFALL ZEIGT. Im Normalfall die Auslieferungssprache; fehlt
   sie, die erste Datei, die es gibt. */
const languageBase = () =>
  LANGUAGES[LANGUAGE_FALLBACK] ? LANGUAGE_FALLBACK : LANGUAGE_CODES[0];
const NO_TEXTS = {};
const textsOf = (locale) =>
  LANGUAGES[locale] || LANGUAGES[languageBase()] || NO_TEXTS;

// Eine Mehrzahlregel je Sprache, einmal gebaut.
const LANGUAGE_PLURAL = Object.fromEntries(Object.entries(LANGUAGES)
  .map(([code, texts]) => [code, new Intl.PluralRules(texts._locale)]));
const PLURAL_LAST_RESORT = new Intl.PluralRules(LANGUAGE_FALLBACK);
const pluralOf = (locale) =>
  LANGUAGE_PLURAL[locale] || LANGUAGE_PLURAL[languageBase()] || PLURAL_LAST_RESORT;
// Und dieselbe Locale fuer Zahlen und Daten -- aus derselben einen Quelle.
const localeTag = (locale) => textsOf(locale)._locale || LANGUAGE_FALLBACK;

/* DIE VORGABESPRACHE DER INSTALLATION -- GELESEN UND NICHT GESCHRIEBEN. */
const qLanguageDefault = db.prepare(
  `SELECT value FROM settings WHERE key = 'languageDefault'`);
function languageDefault() {
  const row = qLanguageDefault.get();
  let stored = null;
  if (row) { try { stored = JSON.parse(row.value); } catch { stored = row.value; } }
  return typeof stored === 'string' && LANGUAGES[stored] ? stored : languageBase();
}

/* ---- Der Vorrat der Sprachen ---------------------------------------------
   ZWEI SCHLUESSEL UND NICHT EINER, anders als bei den Suchmaschinen: dort
   steht der Standard IMMER im Vorrat, und die Liste sagt damit alles. */
function languagePool() {
  const stored = getSetting('languageOn', null);
  const kept = Array.isArray(stored)
    ? stored.filter((c, i, a) => LANGUAGES[c] && a.indexOf(c) === i) : null;
  // Hier faellt eine Sprache aus dem Vorrat, fuer die keine Datei mehr liegt.
  const pool = kept && kept.length ? kept : LANGUAGE_CODES.slice();
  const std = languageDefault();
  return pool.includes(std) ? pool : [std, ...pool];
}

/* DER NAME EINER SPRACHE STEHT IN IHRER EIGENEN SPRACHE -- wer die
   Oberflaeche gerade nicht lesen kann, findet seine trotzdem. */
function languageName(code) {
  const own = LANGUAGES[code] && LANGUAGES[code]._name;
  if (typeof own === 'string' && own.trim()) return own.trim();
  try {
    const shown = new Intl.DisplayNames([localeTag(code)], { type: 'language' }).of(code);
    if (shown && shown !== code) return shown;
  } catch { /* Intl kennt die Kennung nicht -- dann bleibt sie selbst stehen. */ }
  return code;
}

/* WAS DER SYSTEMBEREICH BRAUCHT: jede Sprache, fuer die eine Datei liegt, mit
   ihrem Namen und den zwei Kennzeichnungen. */
function languageEntries() {
  const pool = languagePool();
  const std = languageDefault();
  return LANGUAGE_CODES.map(code => ({
    code, name: languageName(code),
    isDefault: code === std, active: pool.includes(code),
    /* UND IHRE STELLUNGSREGEL. `_afterNumber` sagt, welche Form
       hinter einer ZAHL steht: `one` im Tuerkischen, `plural` sonst. */
    afterNumber: LANGUAGES[code]._afterNumber === 'one' ? 'one' : 'plural'
  }));
}

/* SCHREIBT VORGABE UND VORRAT, AUFGERAEUMT -- dieselbe Bauform wie
   writePool() bei den Suchmaschinen: es soll nur EINE Aussage ueber den
   Zustand geben und nicht zwei, die sich widersprechen koennen. */
function writeLanguages(isDefault, active) {
  const known = (c) => !!LANGUAGES[c];
  let std = known(isDefault) ? isDefault : languageDefault();
  let set = (Array.isArray(active) ? active : languagePool())
    .filter((c, i, a) => known(c) && a.indexOf(c) === i);
  // Zweite Schicht derselben Klemme, siehe den Hinweis in languagePool().
  if (!set.includes(std)) set.push(std);
  // In kanonischer Reihenfolge, damit die gespeicherte Liste nicht die
// Klickfolge des Eigentuemers festhaelt.
  const ordered = LANGUAGE_CODES.filter(c => set.includes(c));
  putSetting.run('languageDefault', JSON.stringify(std));
  putSetting.run('languageOn', JSON.stringify(ordered));
}

/* WAS DER BROWSER VERLANGT -- der Kopf `Accept-Language`. */
function acceptedLanguage(req, pool) {
  const header = String((req && req.headers && req.headers['accept-language']) || '');
  if (!header) return null;
  const wishes = header.split(',').map(part => {
    const [date, ...rest] = part.split(';');
    const q = rest.map(x => /^\s*q\s*=\s*([0-9.]+)\s*$/.exec(x))
      .filter(Boolean).map(m => Number(m[1]))[0];
    return { date: date.trim(), q: Number.isFinite(q) ? q : 1 };
  }).filter(w => w.date && w.date !== '*');
  // Stabil sortiert: bei gleichem Gewicht bleibt die Reihenfolge des Kopfes.
  wishes.sort((a, b) => b.q - a.q);
  for (const { date } of wishes) {
    if (pool.includes(date)) return date;
    const base = date.split('-')[0];
    if (pool.includes(base)) return base;
  }
  return null;
}

/* WELCHE SPRACHE EINE ANTWORT TRAEGT. DREI QUELLEN,
   UND DIE REIHENFOLGE STEHT: 1. */
function localeOf(req) {
  const pool = languagePool();
  const chosen = req && req.user ? getUserSetting(req.user.id, 'language', null) : null;
  if (typeof chosen === 'string' && pool.includes(chosen)) return chosen;
  return acceptedLanguage(req, pool) || languageDefault();
}

/* DIE LOCALE DES VERGLEICHS, und sie ist NICHT die
   des Lesers. */
const compareLocale = () => localeTag(languageDefault());

/* DER HELFER -- dieselbe Regel wie im Browser, mit der Sprache davor. */
function t(locale, key, values = {}) {
  const texts = textsOf(locale);
  const raw = texts[key] !== undefined
    ? texts[key] : textsOf(languageDefault())[key];
  if (raw === undefined) return `⟦${key}⟧`;
  const rule = pluralOf(locale);
  const record = typeof raw === 'object'
    ? (rule.select(values.n) === 'one' ? raw.one : raw.other) : raw;
  /* DAS VOKABULAR WIRD ERST GEHOLT, WENN EIN PLATZHALTER ES BRAUCHT -- es
     kommt aus der Datenbank, und die meisten Meldungen tragen kein
     Vokabelwort. */
  let vocab = null;
  return String(record).replace(/\{(\w+)\}/g, (whole, name) => {
    if (values[name] !== undefined) return String(values[name]);
    /* IN DER SPRACHE DES SATZES UND NICHT IN DER DER INSTALLATION. */
    if (vocab === null) vocab = vocabulary(locale);
    return vocab[name] !== undefined ? String(vocab[name]) : whole;
  });
}

/* EINE MELDUNG IST EIN SCHLUESSEL UND KEIN SATZ. */
const Message = auth.Message;

/* mail.js BEKOMMT DEN UEBERSETZER GEREICHT. */
mail.setTranslator(t);
/* UND auth.js EBENSO -- fuer die zwei Antworten, die requireAuth() selbst
   gibt. */
auth.setTranslator((req, key, values) => t(localeOf(req), key, values));
/* UND DIE LOCALE DES VERGLEICHS DAZU -- aus demselben Grund und auf demselben
   Weg: auth.js darf server.js nicht requiren, braucht die Regel aber fuer den
   Schluessel seiner Anmeldebremse. */
auth.setCompareLocale(compareLocale);

/* WAS EIN GEFANGENER FEHLER SAGT. */
/* UND WAS ER DEM BETREIBER SAGT. Der Leser bekommt „Unbekannter Fehler" und
   keinen Stapelabzug; der Betreiber bekommt den echten Fehler ins
   Containerprotokoll. */
const errorText = (req, e) => {
  if (!(e && e.key)) logFail(e && e.stack ? e.stack : e);
  return (e && e.key)
    ? t(localeOf(req), e.key, e.values || {})
    : t(localeOf(req), 'server.errorUnknown');
};

const PORT = process.env.PORT || 3000;

/* ---- Die oeffentliche Adresse ---- OHNE SIE BAUT DER BROWSER DES ADMINS DEN
   EINLADUNGSLINK aus location. */
const PUBLIC = auth.PUBLIC_ADDRESS;

/* Was die Antwort ueber den Link sagt. */
const linkInfo = (plain) => PUBLIC.address
  ? { link: `${PUBLIC.address}/#/invite/${plain}`, linkSource: 'einstellung' }
  : { link: null, linkSource: 'browser' };

/* ---- Der Versand eines Tokenlinks ---- DER TOKEN ENTSTEHT ZUERST, DIE
   ANTWORT TRAEGT DEN LINK IMMER, UND DER VERSAND IST EIN FELD DARIN: E-Mail
   ist eine Bequemlichkeit und keine Voraussetzung. */
/* DIE DREI GRUENDE SIND SCHLUESSEL UND KEINE SAETZE. */
async function sendTokenLink(target, token, readerLocale) {
  const account = mail.resolve(getSetting(mail.SETTING_KEY, null));
  if (!mail.configured(account))
    return { delivery: 'aus', deliveryReason: t(readerLocale, 'mail.noAccount') };
  if (!PUBLIC.address)
    return { delivery: 'aus', deliveryReason: t(readerLocale, 'server.noPublicAddress') };
  if (!target.email)
    return { delivery: 'aus', deliveryReason: t(readerLocale, 'server.noUserAddress') };
  const values2 = {
    title: getSetting('title_public', 'Bewertungskatalog'),
    username: target.username, link: `${PUBLIC.address}/#/invite/${token.plain}`,
    // `tage` und `minuten` sind PLATZHALTER der Sprachdatei und keine
// Bezeichner -- sie heissen so, wie der Satz sie ruft.
    days: auth.TOKEN_DAYS, minutes: auth.TOKEN_DEADLINE_MINUTES
  };
  const invite = token.purpose === 'invite';
  /* DIE SPRACHE DES EMPFAENGERS UND NICHT DIE DES ABSENDERS. */
  const locale = languageOf(token.id);
  const letter = invite ? mail.mailInvite(locale, values2)
                          : mail.mailReset(locale, values2);
  const e = await mail.send(account, target.email, letter.subject, letter.text);
  /* DER BRIEF GEHT IN DER SPRACHE DES EMPFAENGERS HINAUS, DER GRUND DANEBEN
     ABER IN DER DES LESERS: die Karte, in der er steht, gehoert dem Admin. */
  return e.ok ? { delivery: 'ok', deliveryReason: '' }
              : { delivery: 'fehlgeschlagen', deliveryReason: sendWhy(e, readerLocale) };
}

/* Die eine Stelle, die aus dem Grund eines Versands einen Satz macht --
   dieselbe Bauform wie deliveryWhy() eine Seite weiter unten. Kommt der Grund
   vom Anbieter, gibt es nichts zu uebersetzen. */
const sendWhy = (e, locale) => (e.reasonKey ? t(locale, e.reasonKey) : e.reason);

/* ---- Der Beleg der letzten Testmail --------------------------------------
   Er belegt „mit DIESEN Werten ist einmal wirklich eine Mail hinausgegangen"
   und haengt am Hash ueber den Zugang. */
const MAILTEST_KEY = 'mailtestOk';
function mailTestState(raw) {
  const test = getSetting(MAILTEST_KEY, null);
  return test && test.mark && test.mark === mail.mark(raw) ? test : null;
}

/* ---- Kann diese Instanz ueberhaupt verschicken --------------------------
   DREI VORAUSSETZUNGEN, UND ALLE DREI SIND NOETIG. */
/* DER GRUND IST EIN SCHLUESSEL UND KEIN SATZ. */
function deliveryReady() {
  const raw = getSetting(mail.SETTING_KEY, null);
  if (!mail.configured(raw)) return { ok: false, key: 'server.noAccountOwner' };
  if (!mailTestState(raw)) return { ok: false, key: 'server.noTestMail' };
  if (!PUBLIC.address) return { ok: false, key: 'server.noPublicAddress' };
  return { ok: true, key: '' };
}
/* UND DIE EINE STELLE, DIE DARAUS EINEN SATZ MACHT. */
const deliveryWhy = (b, locale) => (b.key ? t(locale, b.key) : '');

/* ---- Die Bestaetigungsmail der Selbstanmeldung -------------------------
   DER DRITTE MAILANLASS. */
async function sendConfirm(name, address, plain, locale) {
  const account = mail.resolve(getSetting(mail.SETTING_KEY, null));
  if (!mail.configured(account) || !PUBLIC.address)
    return { ok: false, reasonKey: '', reason: 'aus' };
  const title = getSetting('title_public', 'Bewertungskatalog');
  /* HIER GIBT ES NOCH KEINEN ZUGANG, an dem eine Sprache haengen koennte --
     der Brief geht an jemanden, der sich gerade erst anmeldet. */
  const letter = mail.mailConfirm(locale, { title, username: name,
    link: `${PUBLIC.address}/#/confirm/${plain}`,
    hours: auth.REQUEST_HOURS });
  return mail.send(account, address, letter.subject, letter.text);
}

const app = express();
app.use(express.json({ limit: '2mb' }));
/* Gilt fuer die ganze Anwendung. nosniff: der Browser darf den Typ nie selbst
   erraten. */
const CSP_APP =
  "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; " +
  "style-src 'self' 'unsafe-inline'; script-src 'self'; frame-src 'self'; " +
  "frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Content-Security-Policy', CSP_APP);
  if (auth.viaProxy(req)) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
});
/* DIE AUSLIEFERUNG GEHT GEZIPPT HINAUS, gezippt einmal beim Start und nicht
   je Anfrage. Die Fassungen stehen im Arbeitsspeicher und nicht als Datei
   neben dem Original. NUR TEXT -- ein Bild wuerde groesser. */
/* DIE FUENF TYPEN STEHEN ALS TAFEL DA und werden nicht von express erfragt:
   zwei Waechter halten server.js frei von jedem solchen Ruf. Die Werte sind
   die, die express.static fuer dieselben Endungen liefert. */
const PACK_TYPES = new Map([
  ['.css', 'text/css; charset=UTF-8'],
  ['.js', 'application/javascript; charset=UTF-8'],
  ['.json', 'application/json; charset=UTF-8'],
  ['.html', 'text/html; charset=UTF-8'],
  ['.svg', 'image/svg+xml']
]);
const PACKED = new Map();
{
  const root = path.join(__dirname, 'public');
  for (const file of filesUnder(root)) {
    if (!PACK_TYPES.has(path.extname(file))) continue;
    const raw = fs.readFileSync(file);
    const small = zlib.gzipSync(raw, { level: 9 });
    /* GEZIPPT GROESSER ALS ROH KOMMT VOR -- bei sehr kurzen Dateien. Dann
       bleibt es beim Original, und die Anfrage geht an express.static. */
    if (small.length >= raw.length) continue;
    const at = fs.statSync(file).mtime;
    PACKED.set('/' + path.relative(root, file).split(path.sep).join('/'), {
      small, at,
      /* DIESELBE FORM WIE DIE MARKE VON express.static -- schwach, aus Groesse
         und Zeitpunkt. Sie gehoert zur GEZIPPTEN Fassung und traegt deshalb
         ein eigenes Zeichen. */
      tag: `W/"${raw.length.toString(16)}-${at.getTime().toString(16)}-gz"`
    });
  }
}
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const name = req.path === '/' ? '/index.html' : req.path;
  const one = PACKED.get(name);
  // Wer nicht gzip sagt, bekommt die Datei wie bisher.
  if (!one || !/\bgzip\b/.test(req.headers['accept-encoding'] || '')) return next();
  res.set('Content-Type', PACK_TYPES.get(path.extname(name)));
  res.set('Content-Encoding', 'gzip');
  res.set('Vary', 'Accept-Encoding');
  res.set('ETag', one.tag);
  res.set('Last-Modified', one.at.toUTCString());
  if (req.headers['if-none-match'] === one.tag) return res.status(304).end();
  res.end(req.method === 'HEAD' ? undefined : one.small);
});
app.use(express.static(path.join(__dirname, 'public')));

/* 40 Fotos je Anfrage, 30 MB je Datei. Die 40 ist eine Schranke der ANFRAGE
   und keine Obergrenze je Eintrag -- eine solche gibt es bei Fotos nicht. Der
   Browser teilt groessere Auswahlen in Buendel von PHOTO_COUNT auf. */
const PHOTO_COUNT = 40;
const PHOTO_MAX = 30 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PHOTO_MAX },
  // Erste, grobe Schranke am gemeldeten Typ.
  fileFilter: (req, file, cb) =>
    /^image\//.test(file.mimetype)
      ? cb(null, true)
      : cb(new Message('server.imagesOnly'))
});

/* DIE GRENZEN REISEN AM GESUCH MIT: der Fehler-Handler sieht die Route nicht
   mehr. */
function capped(mw, caps) {
  return (req, res, next) => { req.caps = caps; mw(req, res, next); };
}

/* Was als Foto hereinkommt, muss ein Rasterbild sein -- dem INHALT nach. */
const GRID_FORMATS = ['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff'];
async function gridImage(buf) {
  try {
    const m = await sharp(buf).metadata();
    return GRID_FORMATS.includes(m.format);
  } catch { return false; }
}

const touch = db.prepare(`UPDATE items SET updated_at = datetime('now') WHERE id = ?`);
/* "bearbeitet" am Kommentar. EINE Stelle fuer beide Bildwege -- anhaengen und
   entfernen sind dieselbe Aussage ueber denselben Menschen. */
const commentEdited = db.prepare(`UPDATE comments SET updated_at = datetime('now') WHERE id = ?`);
/* DIE BEIDEN ABFRAGEN STEHEN EINMAL DA. Bis dahin trugen
   beide Helfer ihr db.prepare im Rumpf; GET /api/settings ruft sie
   mindestens 29 Mal je Anfrage. */
const qSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
const qUserSetting = db.prepare(
  'SELECT value FROM user_settings WHERE user_id = ? AND key = ?');
const getSetting = (k, fallback) => {
  const r = qSetting.get(k);
  if (!r) return fallback;
  try { return JSON.parse(r.value); } catch { return r.value; }
};
const putSettingS = db.prepare(
  'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
);
// Die Schranke gegen die zweite Wahrheit: ein persoenlicher Schluessel, der
// in die globale Tabelle geschrieben wird, gilt still fuer alle statt fuer
// den, der ihn gesetzt hat -- und solange nur einer angemeldet ist, faellt
// das niemandem auf.
const putSetting = { run: (k, v) => {
  if (PERSONAL_KEYS.includes(k))
    throw new Error(`'${k}' ist persoenlich und gehoert nicht in die globale Tabelle`);
  putSettingS.run(k, v);
} };

/* ---- Persoenliche Einstellungen ---- */
// Die persoenliche Haelfte von settings.
/* ACHT, vorher neun: `zuletztGesehen` trug die Pille „Neu seit
   ..." und hat mit ihr keinen Rufer mehr. */
/* NEUN: `strip` -- die Mindestgroesse der Kacheln im
   Bildstreifen, persoenlich je Zugang, ein Wert fuer alle Geraete, dieselbe
   Maschine wie `font` (E11). */
/* ZEHN: `theme` -- hell, dunkel oder wie das Geraet. */
/* ELF: `language` -- die Sprache, in der DIESER Zugang die
   Oberflaeche, die Meldungen und seine Mails liest. */
const PERSONAL_KEYS = ['filters', 'font', 'blocks', 'linkRows', 'timeline', 'searchNames',
                                'bellSeen', 'views', 'strip', 'theme', 'language'];

/* DER DRITTE RANG IN DERSELBEN ROUTE. */
/* SECHS: `languageDefault` und `languageOn` -- die Vorgabesprache
   der Installation und der Vorrat, aus dem der Benutzer waehlen darf. */
/* SIEBEN: `potentialMode` -- der Schalter, der den ganzen
   Potenzialmodus aus- und wieder einschaltet. */
/* ACHT? NEIN -- ES BLEIBEN SIEBEN, und genau deshalb steht der
   Satz hier. */
const OWNER_KEYS = ['imageStore',
                                'backupCleanup', 'backupKeep', 'backupDays',
                                'languageDefault', 'languageOn', 'potentialMode'];

// DIE KLEMME IST DIE EINZIGE SCHICHT: better-sqlite3 bindet ein fehlendes
// Argument STILL als NULL, und `WHERE user_id = NULL` ist in SQL nie wahr.
const getUserSetting = (userId, k, fallback) => {
  if (userId == null)
    throw new Error(`getUserSetting('${k}') ohne Benutzer aufgerufen`);
  const r = qUserSetting.get(userId, k);
  if (!r) return fallback;
  try { return JSON.parse(r.value); } catch { return r.value; }
};
const putUserSettingS = db.prepare(
  'INSERT INTO user_settings (user_id, key, value) VALUES (?, ?, ?) ' +
  'ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value'
);
// Dieselbe Klemme auch auf dem Schreibweg: ein stilles INSERT mit user_id
// NULL scheiterte zwar am NOT NULL, aber erst in der Datenbank und mit einer
// Message, die nicht sagt, wer den Benutzer vergessen hat.
const putUserSetting = (userId, k, value) => {
  if (userId == null)
    throw new Error(`putUserSetting('${k}') ohne Benutzer aufgerufen`);
  putUserSettingS.run(userId, k, value);
};

/* WELCHER SCHLUESSEL AUF DER FORMATZEILE DER KARTE STEHT -- die Zuordnung von
   mime_type auf den Schluessel steht HIER UND NUR HIER. */
const IMAGE_MIME_FORMAT = {
  'image/png': 'png', 'image/jpeg': 'jpeg', 'image/webp': 'webp', 'image/gif': 'gif'
};
const formatFromMime = (m) => IMAGE_MIME_FORMAT[String(m || '').trim().toLowerCase()] || 'other';

/* DIE WAHL AUS DEM REITER „Datenbank" -- frueher ein Haekchen. */
const imageStore = () => {
  const v = getSetting('imageStore', IMAGE_STORE_DEFAULT);
  return isImageStore(v) ? v : IMAGE_STORE_DEFAULT;
};

/* ---- Den vorhandenen Bestand nachziehen ---- DIES WAR ALS WIRTSSKRIPT
   `images.js` GEPLANT, in der Bauform von usertool.js und keytool.js. */
/* EINE ABBILDUNG UND NICHT ZWEI VARIABLEN: es gibt mehr als einen Lauf, der
   einen Stand meldet. */
const batchStates = { conversion: null, geometry: null };

/* Der Stand fuer /api/stats -- oder null, solange in dieser Laufzeit nie
   einer lief. */
const batchState = (task) =>
  batchStates[task] && { ...batchStates[task] };

/* WELCHE ZEILEN DER BESTANDSLAUF ANSIEHT: ALLE FOTOZEILEN und nicht nur die
   PNG. */
const qConvertRows = db.prepare(
  "SELECT id FROM photos WHERE kind != 'video'");

/* WELCHE ZEILEN DAS ERNEUERN DER KACHELN ANSIEHT: ALLE ZEILEN, UND NICHT DIE
   FAELLIGEN. */
const qTileRows = db.prepare('SELECT id FROM photos');

/* Die vier Abfragen der Bestandskarte, vorbereitet: sie laufen bei jedem
   Zeichnen des Systembereichs.
   BERICHTIGT: substr() AUF EINEM BLOB LIEST DAS BLOB, gemessen 657 ms bei
   205 MB.

   GEMESSEN AN EINER SQLCIPHER-DATEI MIT 400 ZEILEN A 512 kB (312 MB):
     COUNT(*)                                        0,0 ms
     mime_type gruppiert (Spalte 2, VOR den Blobs)   8,7 ms
     kind gruppiert (Spalte 7, HINTER den Blobs)  1338,8 ms */
const qImageKinds = db.prepare('SELECT kind AS a FROM photos GROUP BY 1');
const qPerKind = db.prepare(
  'SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos WHERE kind IS ?');
const qPerFormat = db.prepare(`
  WITH x AS MATERIALIZED (
    SELECT mime_type AS m, length(data) AS o FROM photos WHERE kind IS ?)
  SELECT m, COUNT(*) AS n, COALESCE(SUM(o),0) AS o FROM x GROUP BY 1`);
/* Die Videozeile traegt neben `data` auch eine Ableitung, und die geht mit in
   die Exportdatei -- dieselbe Rechnung wie in exchangeParts(). */
const qVideoExportBytes = db.prepare(`
  SELECT COALESCE(SUM(length(data) + COALESCE(length(medium), length(thumb), 0)),0) AS n
    FROM photos WHERE kind IS ?`);

/* ================= DER BESTANDSLAUF IN EINEM EIGENEN THREAD
   ========= DIE SCHLEIFEN SELBST STEHEN IN batchrun.js, und die Begruendung
   mit ihren Messungen steht dort im Kopf. */
const batchThreads = new Set();

/* DER PFAD STEHT AN EINER STELLE, und das ist keine Ordnungsliebe: der
   Fingerprint liest ihn ein zweites Mal. */
const BATCHRUN = path.join(__dirname, 'batchrun.js');

/* EIN FEHLER IM THREAD REISST DEN SERVER NICHT AB -- dieselbe Regel wie heute
   fuer eine einzelne Zeile. */
/* `store` IST DAS VERFAHREN DER ABLAGE UND GEHT NUR DEN BESTANDSLAUF AN. */
function startBatchThread(task, rows, done, store) {
  const w = new Worker(BATCHRUN, { workerData: { task, rows, store } });
  batchThreads.add(w);
  /* DER STAND WIRD ERSETZT UND NICHT FORTGESCHRIEBEN. */
  w.on('message', (m) => { if (m && m.kind === 'status') batchStates[task] = m.status; });
  w.on('error', (e) => {
    if (batchStates[task]) batchStates[task].running = false;
    logFail(`Inventory run (${task}) aborted:`, e.message);
  });
  w.on('exit', () => { batchThreads.delete(w); if (done) done(); });
  return w;
}

/* ================= Speicherpflege ================= */
function reclaim() {
  try { db.pragma('incremental_vacuum'); db.pragma('wal_checkpoint(TRUNCATE)'); } catch {}
}

/* ================= Der Schutz gegen fremde Formulare =================
   EIN WAECHTER VOR ALLEN ROUTEN und keiner je Route: der zweite Weg vergaesse
   frueher oder spaeter eine. */
/* DIE OFFENEN ROUTEN STEHEN VOR DER ANMELDUNG und koennen den Token nicht
   haben -- sie stehen hier namentlich und nirgends sonst. */
const CSRF_FREE = [
  'POST /api/setup',
  'POST /api/login',
  'POST /api/login/second',
  'POST /api/logout',
  'POST /api/token/check',
  'POST /api/token/redeem',
  'POST /api/signup',
  'POST /api/signup/confirm'
];
const CSRF_FREE_SET = new Set(CSRF_FREE);
const WRITING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);
app.use((req, res, next) => {
  const token = auth.sessionToken(req);
  /* Der Token reist mit der Sitzung: ein Browser, der eine Sitzung hat und
     den Cookie nicht, bekommt ihn an der naechsten Antwort. */
  if (token && auth.csrfCookieValue(req) !== auth.csrfToken(token))
    res.append('Set-Cookie', auth.csrfCookie(req, token));
  if (!WRITING_METHODS.has(req.method)) return next();
  /* OHNE SITZUNG ENTSCHEIDET DIE ANMELDUNG: ein fremdes Formular ohne Cookie
     kommt an keine Zeile heran, und 403 statt 401 verschoebe die Auskunft. */
  if (!token) return next();
  /* Der Schraegstrich am Ende faellt weg: express fuehrt `/api/login/` auf
     dieselbe Route, und die Ausnahme gilt der Route. */
  const where = req.path.length > 1 ? req.path.replace(/\/+$/, '') : req.path;
  if (CSRF_FREE_SET.has(`${req.method} ${where}`)) return next();
  if (auth.csrfOk(req, token)) return next();
  res.status(403).json({ error: t(localeOf(req), 'server.deniedOrigin') });
});

/* ================= Oeffentlich ================= */
// Liefert ausschliesslich den Titel VOR der Anmeldung. Der zweite Titel darf
// hier unter keinen Umstaenden auftauchen.
app.get('/api/config', (req, res) => {
  // setupRequired sagt nur, DASS noch eingerichtet werden muss -- nie etwas
// ueber den Bestand. Wer die Seite aufruft, saehe es ohnehin.
  /* registrierung: die Anmeldeseite muss wissen, ob sie das Formular zeigen
     soll. */
  /* DAS EINE SPRACHFELD. Die Anmeldeseite spricht die
     VORGABESPRACHE der Installation und sonst nichts -- vom Betreiber am 8. */
  res.json({
    title: getSetting('title_public', 'Bewertungskatalog'), version: VERSION,
    setupRequired: !auth.userExists(), minPassword: auth.PASSWORD_MIN,
    signup: getSetting('signup', false) === true,
    language: languageDefault()
  });
});

/* DAS MANIFEST. */
app.get('/api/manifest.json', (req, res) => {
  /* UND SIE SETZT DEN AUSGELIEFERTEN TYP NICHT SELBST -- das ist kein
     Versehen. */
  const name = getSetting('title_public', 'Bewertungskatalog');
  res.json({
    name, short_name: name,
    start_url: '/', scope: '/', display: 'standalone',
    background_color: '#0e1012', theme_color: '#0e1012',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
  });
});

// Erste Einrichtung. Steht vor der Anmeldung, weil es dahinter noch nichts
// gibt -- und ist genau deshalb nur solange offen, wie kein Zugang existiert.
app.post('/api/setup', async (req, res) => {
  if (auth.userExists()) {
    return res.status(409).json({ error: t(localeOf(req), 'server.setupDone')});
  }
  const { user, password } = req.body || {};
  let created;
  try {
    created = await auth.createFirstUser(user, password);
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
  // Gleich angemeldet: ein zweites Formular unmittelbar nach dem ersten waere
// nur eine Huerde ohne Gewinn.
  res.set('Set-Cookie', auth.sessionCookie(req, auth.createSession(created.id)));
  res.json({ ok: true });
});

app.post('/api/login', async (req, res) => {
  const ip = auth.clientIp(req);
  /* DER GETIPPTE NAME HEISST HIER `username` UND NICHT `user`: `user` ist der
     ANGEMELDETE (req.user), und zwei Bedeutungen unter einem Namen in einer
     Route sind eine zu viel. */
  const { user: username, password } = req.body || {};
  // Gezaehlt wird je IP UND je Name.
  const throttle = auth.checkThrottle(ip, username);
  if (throttle.blocked) {
    return res.status(429).json({
      error: t(localeOf(req), 'server.throttled', { seconds: throttle.retryInSec })});
  }
  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));

  const user = await auth.checkLogin(username, password);
  if (!user) {
    auth.noteFailure(ip, username);
    return res.status(401).json({ error: t(localeOf(req), 'server.loginWrong')});
  }
  /* Erste von zwei Stellen: ein gesperrter Zugang kommt nicht herein. */
  if (user.status !== 'active') {
    return res.status(403).json({
      error: t(localeOf(req), 'server.accountLocked')});
  }
  /* DER ZWEITE FAKTOR -- UND HIER, NACH DER PASSWORTPRUEFUNG. */
  /* DER ZAEHLER DER BREMSE WIRD HIER NICHT ZURUECKGESETZT. */
  if (auth.twoFactorOn(user.id)) {
    return res.json({ twoFactor: true, ...auth.createLoginTicket(user.id) });
  }
  auth.noteSuccess(ip, username);
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(req, auth.createSession(user.id)));
  res.json({ ok: true });
});

/* DER ZWEITE SCHRITT DER ANMELDUNG. */
app.post('/api/login/second', async (req, res) => {
  const ip = auth.clientIp(req);
  const { ticket, code } = req.body || {};
  /* DIE BREMSE STEHT GANZ VORN -- dieselbe Reihenfolge wie an POST /api/login
     und POST /api/confirm: ein gesperrter Aufrufer bekommt an JEDER Stelle
     dieselbe 429 und nirgends stattdessen eine Auskunft ueber seinen Ausweis. */
  const throttle = auth.checkThrottle(ip, null);
  if (throttle.blocked) {
    return res.status(429).json({
      error: t(localeOf(req), 'server.throttled', { seconds: throttle.retryInSec })});
  }
  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));
  const id = auth.useLoginTicket(ticket);
  if (!id) {
    auth.noteFailure(ip, null);
    return res.status(401).json({ error: t(localeOf(req), 'server.sessionExpired')});
  }
  const account = auth.getUser2(id);
  const name = account ? account.username : null;
  /* ZWEITE NACHSCHAU AUF DEN STATUS. Zwischen den beiden Schritten liegen bis
     zu zwei Minuten, und in denen kann ein Admin gesperrt haben. */
  if (!account || account.status !== 'active') {
    return res.status(403).json({ error: t(localeOf(req), 'server.accountLocked')});
  }
  if (!auth.checkTwoFactor(id, code)) {
    auth.noteFailure(ip, name);
    /* DIESELBE ZEILE WIE BEI EINEM FALSCHEN PASSWORT, und kein eigener
       Vorgang daneben: eine gescheiterte zweite Stufe IST eine gescheiterte
       Anmeldung. */
    auth.log('login.fail', { actor: null, target: id });
    /* EIN FRISCHER AUSWEIS LIEGT DER ABSAGE BEI. Der alte ist verbraucht --
       "genau einmal" bleibt woertlich wahr. */
    return res.status(401).json({
      error: t(localeOf(req), auth.TWO_FACTOR_DENIAL), ...auth.createLoginTicket(id)});
  }
  auth.noteSuccess(ip, name);
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(req, auth.createSession(id)));
  res.json({ ok: true });
});

/* ABGEMELDET WIRD DER BROWSER UND NICHT DIE VERBINDUNGSART. */
app.post('/api/logout', (req, res) => {
  const cookies = auth.parseCookies(req);
  for (const cookie of new Set([cookies[auth.COOKIE_SECURE], cookies[auth.COOKIE_NAME]].filter(Boolean)))
    auth.destroySession(cookie);
  res.set('Set-Cookie', auth.clearCookie());
  res.json({ ok: true });
});

// Bewusst nur ja/nein: der Endpunkt liegt VOR der Anmeldung und darf ueber den
// Benutzer nichts verraten. Deshalb das Boolean um die Zeile herum.
app.get('/api/session', (req, res) => {
  res.json({ authenticated: Boolean(auth.sessionUser(auth.sessionToken(req))) });
});

/* ---- Der Token vor der Anmeldung ---- ZWEI SCHREIBENDE ROUTEN DER ART
   'offen' -- im Kopf steht keine Rechtefrage, also MUSS die Schranke im Rumpf
   stehen, und sie heisst Token. */
const TOKEN_DENIAL = 'server.linkExpired';

// true = weitermachen. Bei false ist die Antwort bereits geschrieben.
async function tokenThrottleFree(req, res) {
  const throttle = auth.checkThrottle(auth.clientIp(req), null);
  if (throttle.blocked) {
    res.status(429).json({
      error: t(localeOf(req), 'server.throttled', { seconds: throttle.retryInSec })});
    return false;
  }
  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));
  return true;
}

/* Was auf der Seite steht, BEVOR das Passwort gesetzt wird. */
app.post('/api/token/check', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenThrottleFree(req, res)) return;
  const token = auth.checkToken((req.body || {}).token);
  if (!token) { auth.noteFailure(ip, null); return res.status(400).json({ error: t(localeOf(req), TOKEN_DENIAL)}); }
  /* HIER BEGINNT DIE FRIST, und nur hier: dies ist die eine Stelle, an der
     belegt ist, dass ein BROWSER den Schluessel in der Hand hat -- er steht
     im Fragment und kommt nur von dort. */
  const minutes = auth.startTokenDeadline(token.hash);
  res.json({
    username: token.username, withoutPassword: token.withoutPassword,
    minPassword: auth.PASSWORD_MIN, minutes
  });
});

/* Das Einloesen. Der Mindestwert von zehn Zeichen gilt unveraendert; die
   Regel steht in auth.redeemToken. */
app.post('/api/token/redeem', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenThrottleFree(req, res)) return;
  const { token, password } = req.body || {};
  let result;
  try { result = await auth.redeemToken(token, password); }
  catch (e) { auth.noteFailure(ip, null); return res.status(400).json({ error: errorText(req, e) }); }
  auth.noteSuccess(ip, null);
  /* DER ZWEITE FAKTOR WIRD AUCH HIER VERLANGT -- UND DAS IST EINE
     SICHERHEITSFRAGE, KEINE BEQUEMLICHKEITSFRAGE. */
  if (auth.twoFactorOn(result.id)) {
    return res.json({
      ok: true, username: result.username, twoFactor: true,
      ...auth.createLoginTicket(result.id)
    });
  }
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(req, auth.createSession(result.id)));
  res.json({ ok: true, username: result.username });
});

/* ---- Die Selbstanmeldung vor der Anmeldung ---- ZWEI SCHREIBENDE ROUTEN DER
   ART 'offen'. */

/* DIE EINE ANTWORT. */
/* SIE IST EINE FUNKTION UND KEINE KONSTANTE, und
   das aendert an ihrer Zusage nichts: Byte fuer Byte DIESELBE Antwort fuer
   jede Lage, nur eben in der Sprache dessen, der sie liest. */
const requestAnswer = (locale) => ({ ok: true, message: t(locale, 'server.signupThanks') });

app.post('/api/signup', async (req, res) => {
  if (!await tokenThrottleFree(req, res)) return;
  /* DER SCHALTER FUEHRT ZU DERSELBEN ANTWORT WIE ALLES ANDERE und nicht zu
     einer Absage. */
  const an = getSetting('signup', false) === true;
  const { name, address } = req.body || {};
  /* FORM IST OEFFENTLICH, EXISTENZ IST ES NICHT. */
  if (!String(name ?? '').trim())
    return res.status(400).json({ error: t(localeOf(req), 'login.usernameMissing') });
  if (!mail.isAddress(address))
    return res.status(400).json({ error: t(localeOf(req), 'login.emailInvalid') });
  const plain = an ? auth.createRequest(name, address) : null;
  res.json(requestAnswer(localeOf(req)));
  /* ERST DIE ANTWORT, DANN DER VERSAND (Begruendung bei sendConfirm): ein
     Weg, der auf den Mailserver wartet, waere an der Uhr von einem still
     verworfenen zu unterscheiden. */
  if (plain) {
    sendConfirm(String(name).trim(), String(address).trim(), plain, localeOf(req))
      .catch(e => logFail('Bestaetigungsmail:', e && e.message));
  }
});

/* Die Bestaetigung. SIE LEGT KEINEN ZUGANG AN, SETZT KEIN PASSWORT UND MELDET
   NIEMANDEN AN -- sie setzt einen Zeitpunkt in einer Zeile. */
app.post('/api/signup/confirm', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenThrottleFree(req, res)) return;
  if (!auth.confirmRequest((req.body || {}).key)) {
    auth.noteFailure(ip, null);
    return res.status(400).json({ error:
      t(localeOf(req), 'server.confirmExpired')});
  }
  auth.noteSuccess(ip, null);
  res.json({ ok: true });
});

/* ================= Ab hier geschuetzt ================= */
app.use('/api', auth.requireAuth);

/* ================= Rechte ================================================
   EIN Ort fuer die Regel, mehrere Eingaenge. */
function isOwner(req) { return req.user.role === 'owner'; }
function isAdmin(req) { return req.user.role === 'admin' || isOwner(req); }

const DENIED_ADMIN = 'server.deniedAdmin';
const DENIED_OWNER = 'server.deniedOwner';
const DENIED_ENTRY = 'server.deniedEntry';
const DENIED_SELF = 'server.deniedSelf';
const DENIED_TAG_NEW = 'server.deniedTagNew';
const DENIED_CATEGORY_NEW = 'server.deniedCategoryNew';

function adminOnly(req, res, next) {
  if (!isAdmin(req)) return res.status(403).json({ error: t(localeOf(req), DENIED_ADMIN)});
  next();
}

function ownerOnly(req, res, next) {
  if (!isOwner(req)) return res.status(403).json({ error: t(localeOf(req), DENIED_OWNER)});
  next();
}

/* ---- Die zweite Bestaetigung ---- WAS DIE INSTANZ ALS GANZES TRIFFT, WIRD
   EIN ZWEITES MAL BESTAETIGT. */
const DENIED_CONFIRM = 'server.deniedConfirm';

// true = weitermachen. Bei false ist die Antwort bereits geschrieben. 403 und
// NICHT 401: der Zugang gilt weiter, nur diese eine Handlung nicht.
function secondConfirm(req, res, purpose, target = null) {
  const token = auth.sessionToken(req);
  if (auth.useRelease(token, purpose, target)) return true;
  res.status(403).json({ error: t(localeOf(req), DENIED_CONFIRM), confirm: purpose});
  return false;
}

/* Dieselbe Frage als Waechter in der Routenzeile. Das Ziel kommt aus der
   Adresse -- beim vollen Export und beim Import gibt es keins. */
const secondConfirmNeeded = (purpose) => (req, res, next) => {
  const target = req.params.id !== undefined ? req.params.id
             : (req.query && req.query.part !== undefined ? req.query.part : null);
  if (secondConfirm(req, res, purpose, target)) next();
};

// Verfasser oder Admin.
function mayChange(req, authorId) {
  return isAdmin(req) || (authorId != null && authorId === req.user.id);
}

// Nur der Verfasser -- und ausdruecklich auch der Admin nicht.
function selfOnly(req, authorId) {
  return authorId != null && authorId === req.user.id;
}

/* Wer einen NEUEN Namen anlegen darf -- Tag oder Kategorie. */
const freeCreate = (key) => getSetting(key, true) !== false;
/* DER POTENZIALMODUS. */
const potentialMode = () => getSetting('potentialMode', true) !== false;
function mayCreate(req, key) {
  return isAdmin(req) || freeCreate(key);
}

/* Alles, was an einem Eintrag haengt -- Fotos, Dateien, Links, Tags,
   Kategorie, die Merkmale --, richtet sich nach dem Verfasser DES EINTRAGS. */
const qEntryAuthor = db.prepare('SELECT user_id FROM items WHERE id = ?');

// true = weitermachen. Bei false ist die Antwort bereits geschrieben.
function entryFree(req, res, itemId) {
  const z = qEntryAuthor.get(itemId);
  if (!z) { res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')}); return false; }
  if (!mayChange(req, z.user_id)) { res.status(403).json({ error: t(localeOf(req), DENIED_ENTRY)}); return false; }
  return true;
}

function entryAuthorOnly(req, res, next) {
  if (entryFree(req, res, req.params.id)) next();
}

// Die Felder von PUT /api/items/:id, die dem Verfasser gehoeren.
/* `rejectedReason` STEHT MIT DABEI, UND DAS IST DIE GROBE HAELFTE DER KLEMME:
   an die Begruendung kommt ueberhaupt nur, wer den Eintrag aendern darf. */
const AUTHOR_ONLY_FIELDS = ['title', 'description', 'rejected', 'rejectedReason',
                              'tested', 'productCategoryId'];

/* Wer an einen fremden ZUGANG darf. Ein Admin ist der Sheriff im Dorf -- er
   legt Benutzer an, sperrt sie und loescht sie. */
function mayTouchUser(req, target) {
  return target.role === 'user' ? isAdmin(req) : isOwner(req);
}
const DENIED_USER = 'server.deniedUser';
const DENIED_ROLE = 'server.deniedRole';
const DENIED_OWN_USER = 'server.deniedOwnUser';

/* ---- Zugang ---- */
// Der angemeldete Benutzer, nicht der erste: ab dem zweiten Zugang saehe
// sonst jeder den Namen des Eigentuemers.
app.get('/api/account', (req, res) => {
  // Die eigene Adresse steht hier und nirgends sonst: sie gehoert dem, der
// sie hat.
  /* DER ZUSTAND DES ZWEITEN FAKTORS REIST HIER MIT -- deshalb kommt keine
     lesende Route dazu: die Karte "Zugang" holt diese Antwort ohnehin. */
  res.json({ username: req.user.username, minPassword: auth.PASSWORD_MIN,
             email: auth.getUser2(req.user.id)?.email || '',
             twoFactor: auth.twoFactorState(req.user.id) });
});

app.put('/api/account', async (req, res) => {
  const { oldPassword, username, newPassword, email } = req.body || {};
  let result;
  try {
    // WESSEN Zugang. Ohne diese Angabe aenderte jeder den des Eigentuemers,
// sobald er dessen Passwort raet.
    result = await auth.changeUser(req.user.id, oldPassword, username, newPassword, email);
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
  // Alle anderen Sitzungen DIESES Benutzers fallen.
  auth.endOtherSessions(req.user.id, auth.sessionToken(req));
  res.json(result);
});

/* ---- Meine Sitzungen ---- PERSOENLICH: EIN ADMIN SIEHT KEINE FREMDEN
   SITZUNGEN -- fuer den Ernstfall gibt es das Sperren, und setzeStatus
   loescht sie mit. */
app.get('/api/sessions', (req, res) => {
  const ownOne = auth.sessionToken(req);
  res.json({ sessions: auth.sessionsOf(req.user.id, ownOne), days: auth.SESSION_DAYS });
});

app.delete('/api/sessions', (req, res) => {
  const ownOne = auth.sessionToken(req);
  res.json({ ended: auth.endOtherSessions(req.user.id, ownOne) });
});

/* DIE ANGABE HEISST `sessionId` UND NICHT `id`: der Waechter ueber die Routen
   weist jede Route mit Selbstbezug ab, die eine Nummer AUS DER ADRESSE
   nimmt. */
app.delete('/api/sessions/:sessionId', (req, res) => {
  const ownOne = auth.sessionToken(req);
  // Die eigene ueber diesen Weg zu beenden waere ein zweiter Abmeldeweg neben
  // POST /api/logout -- und einer, nach dem die Oberflaeche weiterliefe, als
  // waere nichts gewesen.
  if (auth.sessionIdOf(ownOne || '') === String(req.params.sessionId)) {
    return res.status(400).json({ error: t(localeOf(req), 'server.sessionOwn')});
  }
  const n = auth.endSession(req.user.id, req.params.sessionId);
  if (!n) return res.status(404).json({ error: t(localeOf(req), 'server.sessionUnknown')});
  res.json({ ended: n });
});

/* ---- Der zweite Faktor ---- VIER SCHREIBENDE ROUTEN, ALLE DER ART
   'selbstbezug': die Benutzernummer kommt aus req.user und steht in keinem
   Pfad. */

// Das bisherige Passwort, an allen vier Wegen dieselbe Frage. Sie steht
// EINMAL hier und nicht viermal daneben.
async function ownPasswordMatches(req, res, password) {
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (row && await auth.checkPassword(String(password || ''), row.password_hash)) return true;
  res.status(403).json({ error: t(localeOf(req), 'server.passwordWrong')});
  return false;
}

/* Schritt eins. */
app.post('/api/two-factor/start', async (req, res) => {
  if (!await ownPasswordMatches(req, res, (req.body || {}).password)) return;
  try {
    res.json(auth.startTwoFactor(req.user.id,
      getSetting('title_public', 'Bewertungskatalog'), req.user.username));
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* Schritt zwei. HIER ENTSTEHEN DIE WIEDERHERSTELLUNGSCODES, und sie stehen in
   dieser einen Antwort. */
app.post('/api/two-factor/on', async (req, res) => {
  const { password, code } = req.body || {};
  if (!await ownPasswordMatches(req, res, password)) return;
  try {
    res.json(auth.turnTwoFactorOn(req.user.id, code, req.user.id));
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* Frische Wiederherstellungscodes -- der Fall, den niemand plant: der letzte
   ist verbraucht. */
app.post('/api/two-factor/codes', async (req, res) => {
  const { password, code } = req.body || {};
  if (!await ownPasswordMatches(req, res, password)) return;
  if (!auth.checkTwoFactor(req.user.id, code))
    return res.status(403).json({ error: t(localeOf(req), auth.TWO_FACTOR_DENIAL)});
  try {
    /* ERST DIE CODES, DANN DER STAND -- und die Reihenfolge ist keine
       Geschmacksfrage. */
    const codes = auth.refreshRecoveryCodes(req.user.id);
    res.json({ ...auth.twoFactorState(req.user.id), codes });
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* Ausschalten. */
app.delete('/api/two-factor', async (req, res) => {
  const { password, code } = req.body || {};
  if (!auth.twoFactorOn(req.user.id))
    return res.status(400).json({ error: t(localeOf(req), 'server.twoFactorOff')});
  if (!await ownPasswordMatches(req, res, password)) return;
  if (!auth.checkTwoFactor(req.user.id, code))
    return res.status(403).json({ error: t(localeOf(req), auth.TWO_FACTOR_DENIAL)});
  auth.turnTwoFactorOff(req.user.id, req.user.id);
  res.json({ ...auth.twoFactorState(req.user.id) });
});

/* ---- Die Freigabe holen ---- EINE ROUTE FUER ALLE SIEBEN WEGE. Sie prueft
   DASSELBE Passwort noch einmal, nicht ein zweites Geheimnis. */
app.post('/api/confirm', async (req, res) => {
  const ip = auth.clientIp(req);
  const name = req.user.username;
  const throttle = auth.checkThrottle(ip, name);
  if (throttle.blocked) {
    return res.status(429).json({
      error: t(localeOf(req), 'server.throttled', { seconds: throttle.retryInSec })});
  }
  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));
  const { password, purpose, target, targets, code } = req.body || {};
  if (!auth.CONFIRM_PURPOSES.includes(purpose))
    return res.status(400).json({ error: t(localeOf(req), 'server.purposeUnknown')});
  /* MEHRERE ZIELE IN EINER ANFRAGE, und der Grund ist der Code des zweiten
     Faktors: er gilt GENAU EINMAL. */
  let targetList;
  if (targets !== undefined) {
    if (target !== undefined)
      return res.status(400).json({ error: t(localeOf(req), 'server.targetEitherOr')});
    if (!Array.isArray(targets) || !targets.length)
      return res.status(400).json({ error: t(localeOf(req), 'server.targetsMissing')});
    /* Die Zahl der Ziele ist gedeckelt wie die Zahl der Teile: eine
       Bestellung ueber zehntausend Freigaben legte sie im Arbeitsspeicher ab
       und nichts raeumte sie vor ihrem Ablauf wieder weg. */
    if (targets.length > EXCHANGE_PART_MAX)
      return res.status(400).json({ error: t(localeOf(req), 'server.targetsTooMany', { cap: EXCHANGE_PART_MAX })});
    targetList = targets.map(z => Number(z));
    if (!targetList.every(n => Number.isInteger(n) && n > 0))
      return res.status(400).json({ error: t(localeOf(req), 'server.targetNotNumber')});
    // Doppelte sind ein Fehler und keine stillschweigend halbierte
    // Bestellung: wer zweimal dieselbe Nummer schickt, hat sich verzaehlt,
    // und eine Antwort mit weniger Freigaben als bestellt saehe aus wie ein
    // Erfolg.
    if (new Set(targetList).size !== targetList.length)
      return res.status(400).json({ error: t(localeOf(req), 'server.targetTwice')});
  } else targetList = [target ?? null];
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!row || !await auth.checkPassword(String(password || ''), row.password_hash)) {
    auth.noteFailure(ip, name);
    // Die zweite der beiden Zeilen, bei denen das SCHEITERN der Vorgang ist.
    auth.log('confirm.fail', { actor: req.user.id, target: req.user.id });
    return res.status(403).json({ error: t(localeOf(req), 'server.passwordWrong')});
  }
  /* FRAGT DIESE STELLE ZUSAETZLICH DEN CODE -- aber NUR bei Zugaengen, die
     einen zweiten Faktor eingeschaltet haben. */
  if (auth.twoFactorOn(req.user.id) && !auth.checkTwoFactor(req.user.id, code)) {
    auth.noteFailure(ip, name);
    auth.log('confirm.fail', { actor: req.user.id, target: req.user.id });
    return res.status(403).json({ error: t(localeOf(req), auth.TWO_FACTOR_DENIAL), twoFactor: true});
  }
  auth.noteSuccess(ip, name);
  const ownOne = auth.sessionToken(req);
  try {
    // Alle Freigaben in EINER Antwort.
    let last;
    for (const z of targetList) last = auth.createRelease(ownOne, purpose, z);
    res.json({ ok: true, ...last, targets: targetList });
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* ---- Das Sicherheitsprotokoll ---- NUR DER EIGENTUEMER: es nennt Vorgaenge
   ueber andere Zugaenge, und ein Admin saehe darin die Verwaltungsvorgaenge
   des Eigentuemers ueber ihn selbst. */
app.get('/api/security-log', ownerOnly, (req, res) => {
  auth.cleanupLog();
  /* DIE AUSWAHL GEHT AN DEN SERVER und nicht an den Browser: die Karte holt
     die hundert JUENGSTEN Zeilen, und darin findet man die gescheiterten
     Anmeldungen nicht -- sie stehen zwischen allem anderen. */
  const group = req.query.group;
  if (group !== undefined && !Object.prototype.hasOwnProperty.call(auth.LOG_GROUPS, group))
    return res.status(400).json({ error: t(localeOf(req), 'server.viewUnknown')});
  res.json(auth.readLog(auth.LOG_LIMIT, group));
});

/* ---- Zugaenge verwalten ---- Die Vorgaenge selbst stehen in auth.js, weil
   usertool.js auf dem Wirt dieselben ruft -- zwei Wege zum selben Grabstein
   liefen auseinander. */

// Liest die Zielzeile und beantwortet in einem, ob der Anfragende an sie
// darf.
function targetUserFree(req, res, id, selfAllowed = false) {
  const target = auth.getUser2(id);
  if (!target) { res.status(404).json({ error: t(localeOf(req), 'server.userUnknown')}); return null; }
  if (target.status === 'deleted') {
    res.status(400).json({ error: t(localeOf(req), 'server.userDeleted')}); return null;
  }
  if (!selfAllowed && target.id === req.user.id) {
    res.status(403).json({ error: t(localeOf(req), DENIED_OWN_USER)}); return null;
  }
  if (!mayTouchUser(req, target)) { res.status(403).json({ error: t(localeOf(req), DENIED_USER)}); return null; }
  return target;
}

app.get('/api/users', adminOnly, (req, res) => {
  // Zweite Aufrufstelle des Aufraeumens; die erste steht beim Start.
  auth.cleanupTokens();
  res.json({
    users: auth.listUsers(),
    ich: req.user.id,
    mayRoles: isOwner(req),
    owner: auth.ownerCount(),
    /* WELCHE ADRESSEN MEHRFACH VERGEBEN SIND. */
    emailsDoubled: emailsDoubled()
  });
});

// Die Zahlen fuer den Loeschdialog. Lesend, deshalb kein Eintrag in F_ROUTEN.
app.get('/api/users/:id/inventory', adminOnly, (req, res) => {
  const target = auth.getUser2(req.params.id);
  if (!target) return res.status(404).json({ error: t(localeOf(req), 'server.userUnknown')});
  res.json({ username: target.username, ...auth.countInventory(target.id) });
});

// Anlegen.
app.post('/api/users', adminOnly, async (req, res) => {
  const { username, password, role, sendInvite, email } = req.body || {};
  const wanted = role || 'user';
  if (wanted !== 'user' && !isOwner(req))
    return res.status(403).json({ error: t(localeOf(req), DENIED_ROLE)});
  try {
    /* MIT EINLADUNG ENTSTEHT DER ZUGANG OHNE PASSWORT und bekommt den Link im
       selben Zug. */
    const created = await auth.createUser(username, password, wanted, sendInvite === true,
                                             req.user.id, email);
    if (sendInvite !== true) return res.json(created);
    const token = auth.createToken(created.id, 'invite', req.user.id);
    /* ERST DER TOKEN, DANN DER VERSAND, und die Reihenfolge ist die ganze
       Zusage: der Link steht in der Antwort, egal was der Mailserver sagt. */
    const v = await sendTokenLink({ username: created.username, email: created.email }, token, localeOf(req));
    res.json({ ...created, token: token.plain, purpose: token.purpose, days: token.days,
               minutes: auth.TOKEN_DEADLINE_MINUTES, ...linkInfo(token.plain), ...v });
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* Der Link fuer einen VORHANDENEN Zugang -- einladen oder zuruecksetzen.
   targetUserFree entscheidet, damit gilt die Rollenleiter auch hier. */
app.post('/api/users/:id/token', adminOnly, async (req, res) => {
  const target = targetUserFree(req, res, req.params.id);
  if (!target) return;
  /* DIE RECHTEFRAGE STEHT VOR DER BESTAETIGUNGSFRAGE, und das ist keine
     Geschmacksfrage: wer ohnehin nicht darf, soll erfahren, DASS er nicht
     darf -- und nicht erst nach seinem Passwort gefragt werden. */
  if (!secondConfirm(req, res, 'link', target.id)) return;
  const purpose = (req.body || {}).purpose || 'invite';
  try {
    const token = auth.createToken(target.id, purpose, req.user.id);
    // Erst der Token, dann der Versand -- dieselbe Reihenfolge wie am Anlegen,
// und aus demselben Grund.
    const v = await sendTokenLink(target, token, localeOf(req));
    res.json({ id: token.id, username: token.username, token: token.plain,
               purpose: token.purpose, days: token.days, minutes: auth.TOKEN_DEADLINE_MINUTES,
               withoutPassword: token.withoutPassword,
               ...linkInfo(token.plain), ...v });
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

// Rolle, Status und Passwort.
app.put('/api/users/:id', adminOnly, async (req, res) => {
  const { role, status, password } = req.body || {};
  const roleOnly = role !== undefined && status === undefined && password === undefined;
  const target = targetUserFree(req, res, req.params.id, roleOnly);
  if (!target) return;
  if (role !== undefined && !isOwner(req))
    return res.status(403).json({ error: t(localeOf(req), DENIED_ROLE)});
  /* DIE ZWEITE BESTAETIGUNG STEHT IM RUMPF UND NICHT IN DER ROUTENZEILE, weil
     erst der Rumpf sagt, WELCHE Rechteklasse gemeint ist: Rolle und fremdes
     Passwort verlangen sie, Sperren und Freigeben nicht. */
  if (role !== undefined && !secondConfirm(req, res, 'role', target.id)) return;
  if (password !== undefined && !secondConfirm(req, res, 'password', target.id)) return;
  try {
    let result = { id: target.id, username: target.username };
    if (role !== undefined) result = { ...result, ...auth.setRole(target.id, role, req.user.id) };
    if (status !== undefined) result = { ...result, ...auth.setStatus(target.id, status, req.user.id) };
    if (password !== undefined) { await auth.setNewPassword(target.id, password, req.user.id); result.passwordSet = true; }
    res.json(result);
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

// Entfernen heisst Grabstein: die Zeile bleibt mit ihrer Nummer stehen, die
// Beitraege bleiben sichtbar.
app.delete('/api/users/:id', adminOnly, (req, res) => {
  const target = targetUserFree(req, res, req.params.id);
  if (!target) return;
  // Rechtefrage vor Bestaetigungsfrage, wie an der Tokenroute.
  if (!secondConfirm(req, res, 'remove', target.id)) return;
  try {
    res.json(auth.removeUser(target.id, {
      entries: req.query.entries === '1',
      posts: req.query.posts === '1'
    }, req.user.id));
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* ---- Der Mailversand ----------------------------------------------------
   DREI ENDPUNKTE, EINE RECHTEZEILE: DER MAILZUGANG GEHOERT DEM EIGENTUEMER,
   GANZ -- eintragen, einsehen, Testmail. */

/* Was die Karte sieht. DIE ANBIETERLISTE KOMMT MIT: der Server speichert
   einen Schluessel, also muss die Oberflaeche die Namen von ihm bekommen. */
/* `req`: die drei Hinweise aus mail.js sind Schluessel, und uebersetzt werden
   sie HIER -- an der Stelle, an der die Anfrage in der Hand liegt und damit
   feststeht, welche Sprache die Antwort traegt. */
function mailCard(req) {
  const raw = getSetting(mail.SETTING_KEY, null);
  // Der Vergleich steht in mailTestState() weiter oben -- eine
// Rechnung, zwei Rufer.
  const test = mailTestState(raw);
  const state = mail.state(raw);
  return {
    ...state,
    /* UND DER NAME DES GEWAEHLTEN ANBIETERS EBENSO. */
    providerName: state.providerNameKey
      ? t(localeOf(req), state.providerNameKey) : state.providerName,
    // Auch die beiden Hinweise am gewaehlten Anbieter sind Schluessel.
    hint: state.hint ? t(localeOf(req), state.hint) : '',
    hintAlways: t(localeOf(req), state.hintAlways),
    /* SAMT HINWEIS UND DEN DREI FESTEN WERTEN JE ANBIETER. */
    /* UND DER EINE ANBIETERNAME, DER KEINE MARKE IST. */
    providerList: mail.forChoice().map(a =>
      ({ ...a, name: a.nameKey ? t(localeOf(req), a.nameKey) : a.name,
         hint: a.hint ? t(localeOf(req), a.hint) : '' })),
    configured: mail.configured(raw),
    // Der ZUSTAND der oeffentlichen Adresse, nicht die Adresse selbst -- die
// steht in der Karte "Zugaenge", wo der Link entsteht.
    addressSet: Boolean(PUBLIC.address),
    address: PUBLIC.address,
    deadlineMinutes: auth.TOKEN_DEADLINE_MINUTES,
    testedAt: test ? test.at : null,
    seconds: Math.round(mail.SEND_MS / 1000),
    /* Die Folge der Testmarke fuer die Selbstanmeldung, : der Eigentuemer
       soll an DIESER Karte sehen, was er dem Schalter des Admins antut, wenn
       er den Mailzugang aendert. */
    signup: getSetting('signup', false) === true
  };
}

app.get('/api/mail', ownerOnly, (req, res) => res.json(mailCard(req)));

app.put('/api/mail', ownerOnly, secondConfirmNeeded('mail'), (req, res) => {
  let fresh;
  try { fresh = mail.checkInput(req.body, getSetting(mail.SETTING_KEY, null)); }
  catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
  putSetting.run(mail.SETTING_KEY, JSON.stringify(fresh));
  /* DIE MARKE WIRD HIER AUSDRUECKLICH NICHT GELOESCHT: sie haengt am HASH
     UEBER DEN ZUGANG, den mailCard(req) nachrechnet -- passt er nicht mehr,
     gilt sie nicht mehr. */
  res.json(mailCard(req));
});

/* Die Testmail geht AN DIE EIGENE ADRESSE DES ANFORDERNDEN und nirgendwo
   sonst -- ein Knopf mit freiem Adressfeld waere ein offener Mailverteiler
   hinter einer Anmeldung. */
app.post('/api/mail/test', ownerOnly, async (req, res) => {
  const ownOne = auth.getUser2(req.user.id);
  if (!ownOne || !ownOne.email) {
    return res.status(400).json({ error:
      t(localeOf(req), 'server.ownEmailMissing')});
  }
  const raw = getSetting(mail.SETTING_KEY, null);
  if (!mail.configured(raw))
    return res.status(400).json({ error: t(localeOf(req), 'server.mailAccountMissing')});
  const locale = localeOf(req);
  const letter = mail.mailTest(locale, { title: getSetting('title_public', 'Bewertungskatalog'),
                                          username: ownOne.username });
  const e = await mail.send(raw, ownOne.email, letter.subject, letter.text);
  if (e.ok) {
    putSetting.run(MAILTEST_KEY,
      JSON.stringify({ mark: mail.mark(raw), at: new Date().toISOString().slice(0, 19).replace('T', ' ') }));
  }
  // 200 AUCH BEIM FEHLSCHLAG: der Versuch ist gelaufen, und sein Ergebnis ist
// die Antwort.
  /* `address` UND NICHT `an`. */
  /* `sentTo` UND NICHT `address`. */
  res.json({ ok: e.ok, reason: sendWhy(e, locale), sentTo: ownOne.email, ...mailCard(req) });
});

/* ---- Die Selbstanmeldung hinter der Anmeldung ---------------------------
   VIER ENDPUNKTE, EINE RECHTEZEILE: ADMIN -- sehen, schalten, freischalten,
   ablehnen. */
function requestCard(locale) {
  const b = deliveryReady();
  return {
    an: getSetting('signup', false) === true,
    deliveryReady: b.ok, deliveryReason: deliveryWhy(b, locale),
    requests: auth.listRequests(),
    cap: auth.REQUEST_CAP, used: auth.countRequests(),
    hours: auth.REQUEST_HOURS
  };
}

app.get('/api/requests', adminOnly, (req, res) => {
  // Zweite Aufrufstelle des Aufraeumens; die erste steht beim Start, die
// dritte an der Anfrageroute selbst.
  auth.cleanupRequests();
  res.json(requestCard(localeOf(req)));
});

app.put('/api/signup/toggle', adminOnly, (req, res) => {
  const an = (req.body || {}).an === true;
  /* NUR DAS EINSCHALTEN IST GEBUNDEN. */
  if (an) {
    const b = deliveryReady();
    if (!b.ok) return res.status(400).json({ error:
      t(localeOf(req), 'server.signupNeedsMail', { reason: deliveryWhy(b, localeOf(req)) })});
  }
  putSetting.run('signup', JSON.stringify(an));
  res.json(requestCard(localeOf(req)));
});

/* Die Freischaltung. */
app.post('/api/requests/:id/approve', adminOnly, async (req, res) => {
  const a = auth.getRequest(req.params.id);
  if (!a || !a.confirmed_at)
    return res.status(404).json({ error: t(localeOf(req), 'server.requestUnknown')});
  let created, token;
  try {
    created = await auth.createUser(a.username, null, 'user', true, req.user.id, a.email);
    token = auth.createToken(created.id, 'invite', req.user.id);
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
  auth.removeRequest(a.id);
  /* DIE ZEILE NENNT DEN NEUEN ZUGANG UND NICHT DEN NAMEN DES ANFRAGENDEN. */
  auth.log('request.approve', { actor: req.user.id, target: created.id });
  const v = await sendTokenLink({ username: created.username, email: created.email }, token, localeOf(req));
  res.json({ ...created, token: token.plain, purpose: token.purpose, days: token.days,
             minutes: auth.TOKEN_DEADLINE_MINUTES, ...linkInfo(token.plain), ...v,
             ...requestCard(localeOf(req)) });
});

/* Die Ablehnung. DIE ZEILE IST WEG, UND ES ENTSTEHT NICHTS -- kein Zugang,
   kein Token, keine Mail. */
app.delete('/api/requests/:id', adminOnly, (req, res) => {
  const a = auth.getRequest(req.params.id);
  if (!a || !a.confirmed_at)
    return res.status(404).json({ error: t(localeOf(req), 'server.requestUnknown')});
  auth.removeRequest(a.id);
  auth.log('request.reject', { actor: req.user.id });
  res.json({ ok: true, ...requestCard(localeOf(req)) });
});

/* ---- Titel (nach der Anmeldung) ---- */
app.get('/api/titles', (req, res) => res.json({
  publicTitle: getSetting('title_public', 'Bewertungskatalog'),
  appTitle: getSetting('title_app', 'Model Bewertungen')
}));

app.put('/api/titles', adminOnly, (req, res) => {
  const p = (req.body.publicTitle || '').trim();
  const a = (req.body.appTitle || '').trim();
  if (!p || !a) return res.status(400).json({ error: t(localeOf(req), 'server.titlesBoth')});
  putSetting.run('title_public', JSON.stringify(p));
  putSetting.run('title_app', JSON.stringify(a));
  res.json({ publicTitle: p, appTitle: a });
});

/* ---- Einstellungen (Filterwahl, Vokabular, Schriftgroesse) ---- */
// Das Vokabular benennt die Oberflaeche um.
/* DIE VORGABEN DER VIERZEHN WOERTER STEHEN IN DER SPRACHDATEI. */
const VOCABULARY_PREFIX = 'vocabulary.';
const vocabularyDefault = (locale) => Object.fromEntries(
  Object.entries(textsOf(locale || languageDefault()))
    .filter(([k]) => k.startsWith(VOCABULARY_PREFIX))
    .map(([k, v]) => [k.slice(VOCABULARY_PREFIX.length), v]));

const FONT_LEVELS = [80, 90, 100, 110, 120];
/* DIE STUFEN DES BILDSTREIFENS, IN BILDPUNKTEN (E11). */
const STRIP_LEVELS = [60, 80, 100, 120, 150];
/* DIE DREI STUFEN DES FARBSCHEMAS. DIE VORGABE IST `dark` UND NICHT
   `device`: wer nichts einstellt, sieht, was er heute sieht. */
const THEME_LEVELS = ['light', 'dark', 'device'];
const THEME_DEFAULT = 'dark';

// Anordnung und Einklappzustand der Bloecke in der Detailansicht. Verschoben
// wird nur innerhalb des jeweiligen Bereichs, deshalb zwei getrennte Listen.
const BLOCK_DEFAULT = {
  // VORHER STEHT VOR NACHHER: geschaetzt wird, bevor bewertet wird, und die
// Anordnung sagt es.
  side: ['kategorie', 'tags', 'potenzial', 'bewertung'],
  bottom: ['beschreibung', 'testtage', 'links', 'dateien', 'kommentare']
};
const ALL_BLOCKS = [...BLOCK_DEFAULT.side, ...BLOCK_DEFAULT.bottom];

/* WELCHE BLOECKE IHREN EINKLAPPZUSTAND NICHT MEHR SPEICHERN. */
const BLOCKS_ALWAYS_OPEN = ['potenzial', 'bewertung'];
const CLOSED_BLOCKS = ALL_BLOCKS.filter(k => !BLOCKS_ALWAYS_OPEN.includes(k));

// Unbekanntes fliegt raus, Fehlendes haengt sich in der Vorgabereihenfolge
// hinten an -- ein spaeter hinzugekommener Block taucht so von selbst auf.
function sortArea(stored, fallback) {
  const clean = (Array.isArray(stored) ? stored : [])
    .filter((k, i, a) => fallback.includes(k) && a.indexOf(k) === i);
  return [...clean, ...fallback.filter(k => !clean.includes(k))];
}

// Persoenlich. Anordnung und Einklappzustand gelten global ueber alle
// Eintraege hinweg -- aber je Benutzer, nicht fuer alle gemeinsam.
function blocks(userId) {
  const g = getUserSetting(userId, 'blocks', null) || {};
  return {
    side: sortArea(g.side, BLOCK_DEFAULT.side),
    bottom: sortArea(g.bottom, BLOCK_DEFAULT.bottom),
    closed: (Array.isArray(g.closed) ? g.closed : []).filter(k => CLOSED_BLOCKS.includes(k))
  };
}

/* DIE GESPEICHERTE FORM, und sie ist die EINE
   gespeicherte Form dieses Abschnitts. */
function vocabularyStored(raw, code) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const flat = Object.values(raw).some(v => typeof v === 'string');
  return flat ? { [code]: raw } : raw;
}

/* DAS VOKABULAR IN DER SPRACHE DES LESERS, mit zwei Rueckfaellen in dieser
   Folge (Nachtrag zu E9): 1. */
function vocabulary(locale) {
  const read = locale || languageDefault();
  /* DIE GESPEICHERTE flache Form ist die der VORGABESPRACHE -- sie stammt aus
     einer Zeit, in der es nur eine gab, und das war beim Bestand Deutsch. */
  const perLanguage = vocabularyStored(getSetting('vocabulary', null), languageDefault());
  const own = perLanguage[read] || {};
  /* DER ZUERST ANGELEGTE Satz -- und LEERE werden dabei uebergangen. */
  const first = Object.values(perLanguage).find(
    w => w && typeof w === 'object' && Object.values(w).some(v => typeof v === 'string' && v.trim())) || {};
  const out = {};
  for (const [k, fallback] of Object.entries(vocabularyDefault(read))) {
    const mine = typeof own[k] === 'string' ? own[k].trim() : '';
    const earliest = typeof first[k] === 'string' ? first[k].trim() : '';
    out[k] = mine || earliest || fallback;   // leeres Feld faellt zurueck
  }
  return out;
}

/* WAS DIE KARTE „VOKABULAR" BRAUCHT: je Sprache, fuer die eine Datei liegt,
   der Satz, den ein Leser DIESER Sprache saehe. */
const vocabularyAll = () =>
  Object.fromEntries(LANGUAGE_CODES.map(code => [code, vocabulary(code)]));

/* UND ZWEI TAFELN DANEBEN, die Reparatur von B1 und B4. */
const vocabularyOwnAll = () => {
  const perLanguage = vocabularyStored(getSetting('vocabulary', null), languageDefault());
  return Object.fromEntries(LANGUAGE_CODES.map(code => {
    const own = perLanguage[code] || {};
    const out = {};
    for (const k of Object.keys(vocabularyDefault(code))) {
      const word = typeof own[k] === 'string' ? own[k].trim() : '';
      if (word) out[k] = word;
    }
    return [code, out];
  }));
};
const vocabularyDefaultsAll = () =>
  Object.fromEntries(LANGUAGE_CODES.map(code => [code, vocabularyDefault(code)]));
// Sichtbare Zeilen der Linkliste, bevor aufgeklappt werden muss.
const LINK_ROW_LEVELS = [3, 5, 8, 12];
const timelineOn = (userId) => getUserSetting(userId, 'timeline', true) !== false;

/* ---- Suchanbieter ---- */
// Fuer Linkzeilen, die keine Adresse sind.
const SEARCH_PROVIDERS = [
  { key: 'google',    name: 'Google',       template: 'https://www.google.com/search?q=%s' },
  { key: 'bing',      name: 'Bing',         template: 'https://www.bing.com/search?q=%s' },
  { key: 'ddg',       name: 'DuckDuckGo',   template: 'https://duckduckgo.com/?q=%s' },
  { key: 'startpage', name: 'Startpage',    template: 'https://www.startpage.com/sp/search?query=%s' },
  { key: 'brave',     name: 'Brave Search', template: 'https://search.brave.com/search?q=%s' },
  { key: 'ecosia',    name: 'Ecosia',       template: 'https://www.ecosia.org/search?q=%s' }
];
const SEARCH_DEFAULT = SEARCH_PROVIDERS[0].template;
// Drei Plaetze fuer eigene Anbieter. Der Schluessel haengt am Platz, nicht am
// Namen: sonst verloere ein Umbenennen den Standard und den Vorrat.
const OWN_SLOTS = 3;
const ownKey = (i) => `eigen${i + 1}`;
// Vier Namen a 20 Zeichen sind auf dem Handy die Obergrenze.
const SEARCH_NAME_LENGTH = 20;
const SEARCH_NAME_LEVELS = [1, 2, 3, 4];

// Nur http und https, und der Platzhalter muss vorkommen.
const searchTemplateOk = (v) =>
  typeof v === 'string' && v.length <= 300 &&
  /^https?:\/\/[^\s]+$/i.test(v) && v.includes('%s');

// Ein Anbietername ist freier Text und wird als Beschriftung gerendert -- die
// erste Stelle in der Linkliste, an der das gilt.
const searchNameClean = (v) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, SEARCH_NAME_LENGTH) : '';

// Eigene Anbieter. Ein Platz zaehlt nur, wenn Name UND Vorlage dastehen --
// halb ausgefuellt gibt es ihn nicht, weder im Vorrat noch in der Auswahl.
function searchOwn() {
  const g = getSetting('searchOwn', null);
  const out = [];
  for (let i = 0; i < OWN_SLOTS; i++) {
    const e = Array.isArray(g) ? g[i] : null;
    const name = searchNameClean(e && e.name);
    const template = e && typeof e.template === 'string' ? e.template.trim() : '';
    // Halb ausgefuellt gibt es nicht.
    out.push(name && searchTemplateOk(template) ? { name, template } : null);
  }
  return out;
}

// Alle neun Plaetze in kanonischer Reihenfolge: sechs eingebaute, dann die
// eigenen. `present` sagt, ob der Platz ueberhaupt jemanden traegt.
function allProviders() {
  const own = searchOwn();
  return [
    ...SEARCH_PROVIDERS.map(a => ({ ...a, own: false, present: true })),
    ...own.map((e, i) => ({
      key: ownKey(i), name: e ? e.name : '',
      template: e ? e.template : '', own: true, present: !!e
    }))
  ];
}

// Der Vorrat: Liste der Schluessel, Standard zuerst. sucheAktiv[0] ist die
// einzige Wahrheit darueber, wer Standard ist.
function searchPool() {
  const all = allProviders();
  const da = (k) => all.some(a => a.key === k && a.present);
  const stored = getSetting('searchOn', null);
  // Hier faellt ein weggefallener Anbieter aus dem Vorrat -- war er der
// Standard, rueckt damit keys[0] nach.
  let keys = Array.isArray(stored)
    ? stored.filter((k, i, a) => da(k) && a.indexOf(k) === i)
    : [];
  // Ein leerer Vorrat macht jede Suchzeile unbenutzbar: mindestens einer
// bleibt drin, und das ist im Zweifel der eingebaute erste.
  if (!keys.length) keys = [SEARCH_PROVIDERS[0].key];
  return keys;
}

// Was die Oberflaeche braucht: alle neun Plaetze mit Vorrat- und
// Standardkennzeichnung, in kanonischer Reihenfolge.
function searchProviders() {
  const pool = searchPool();
  return allProviders().map(a => ({
    key: a.key, name: a.name, template: a.template,
    own: a.own, present: a.present,
    active: pool.includes(a.key),
    isDefault: pool[0] === a.key
  }));
}

// Vorlage des Standardanbieters, nur fuer die Antwort an die Oberflaeche.
function searchTemplate() {
  const pool = searchPool();
  const matched = allProviders().find(a => a.key === pool[0]);
  return matched && searchTemplateOk(matched.template) ? matched.template : SEARCH_DEFAULT;
}

// Schreibt den Vorrat, normalisiert: Standard zuerst, die uebrigen in
// kanonischer Reihenfolge.
function writePool(isDefault, active) {
  const all = allProviders();
  const da = (k) => all.some(a => a.key === k && a.present);
  let set = active.filter(da);
  // Zweite Schicht des Nachrueckens, siehe den Hinweis in searchPool.
  if (!da(isDefault)) isDefault = set[0] || SEARCH_PROVIDERS[0].key;
  if (!set.includes(isDefault)) set.push(isDefault);
  const rest = all.map(a => a.key)
    .filter(k => k !== isDefault && set.includes(k));
  putSetting.run('searchOn', JSON.stringify([isDefault, ...rest]));
}

/* ---- FUENF EINSTELLUNGEN MIT FESTER STUFENLISTE --------------------------
   Die Liste steht einmal, Leser wie Schreiber lesen aus ihr. Alle fuenf sind
   persoenlich: ein Wert je Zugang und fuer alle Geraete. */
const PICK_SETTINGS = {
  linkRows:    { list: LINK_ROW_LEVELS,    cast: Number, fallback: 5,
                 wrong: 'server.linkRowsUnknown' },
  searchNames: { list: SEARCH_NAME_LEVELS, cast: Number, fallback: 2,
                 wrong: 'server.searchNamesUnknown' },
  font:        { list: FONT_LEVELS,        cast: Number, fallback: 100,
                 wrong: 'server.fontUnknown' },
  theme:       { list: THEME_LEVELS,       cast: String, fallback: THEME_DEFAULT,
                 wrong: 'server.themeUnknown' },
  strip:       { list: STRIP_LEVELS,       cast: Number, fallback: 80,
                 wrong: 'server.stripUnknown' }
};
/* Der Leser: was nicht in der Liste steht, faellt auf die Vorgabe zurueck. */
const pick = (userId, key) => {
  const a = PICK_SETTINGS[key];
  const v = a.cast(getUserSetting(userId, key, a.fallback));
  return a.list.includes(v) ? v : a.fallback;
};
/* DIE SPRACHE DIESES ZUGANGS. */
const languageOf = (userId) => {
  const chosen = getUserSetting(userId, 'language', null);
  return typeof chosen === 'string' && languagePool().includes(chosen)
    ? chosen : languageDefault();
};

/* --- Der Bezugspunkt der Glocke ------------------------------------------
   Persoenlich, wie der Favorit. */
const bellSeen = (userId) => getUserSetting(userId, 'bellSeen', null);

/* --- Die gespeicherten Ansichten -----------------------------------------
   MEHRERE BENANNTE FILTERSTELLUNGEN NEBEN DER EINEN, DIE ES SCHON GIBT. */
const VIEWS_CAP = 8;
const VIEW_NAME_LENGTH = 40;
const VIEW_TERM_LENGTH = 200;
const VIEWS_CHARS = 8000;
const views = (userId) => {
  const w = getUserSetting(userId, 'views', []);
  return Array.isArray(w) ? w : [];
};

// Die Antwort mischt beide Haelften; die Oberflaeche merkt davon nichts.
const qUserCount = db.prepare("SELECT COUNT(*) AS n FROM users WHERE status != 'deleted'");

app.get('/api/settings', (req, res) => res.json({
  userCount: qUserCount.get().n,
  // Der eigene Name fuer die Kopfzeile. Er steht auch in GET /api/account --
// das ist keine zweite Wahrheit, beide lesen dieselbe angemeldete Zeile.
  name: req.user.username,
  isAdmin: isAdmin(req),
  isOwner: isOwner(req),
  filters: getUserSetting(req.user.id, 'filters', null),
  views: views(req.user.id),
  // Der Deckel kommt vom Server, damit die Zahl an einer Stelle steht: die
  // Oberflaeche laesst danach den Knopf zum Speichern weg, und der Server
  // verweigert es ohnehin.
  viewsCap: VIEWS_CAP,
  vocabulary: vocabulary(localeOf(req)),
  /* UND DIE VIERZEHN WOERTER JE SPRACHE -- fuer den Umschalter in der Karte
     „Vokabular". */
  vocabularies: vocabularyAll(),
  /* UND ZWEI TAFELN DANEBEN. */
  vocabulariesOwn: vocabularyOwnAll(),
  vocabularyDefaults: vocabularyDefaultsAll(),
  /* UND DIE NAMEN DER KATEGORIEN UND KRITERIEN JE SPRACHE, die
     Reparatur von D1. */
  ...(isAdmin(req)
    ? { categoryNames: categoryNamesAll(), criterionNames: criterionNamesAll() } : {}),
  font: pick(req.user.id, 'font'),
  strip: pick(req.user.id, 'strip'),
  theme: pick(req.user.id, 'theme'),
  language: languageOf(req.user.id),
  blocks: blocks(req.user.id),
  linkRows: pick(req.user.id, 'linkRows'),
  timeline: timelineOn(req.user.id),
  /* DER BEZUGSPUNKT DER GLOCKE. */
  bellSeen: bellSeen(req.user.id),
  search: searchTemplate(),
  searchProviders: searchProviders(),
  searchNames: pick(req.user.id, 'searchNames'),
  /* JEDE SPRACHE, FUER DIE EINE DATEI LIEGT -- mit Namen, Vorgabe- und
     Vorratskennzeichnung. */
  languages: languageEntries(),
  // Abgeleitet beim Lesen, nicht in der Datenbank nachgetragen.
  tagsFreeCreate: freeCreate('tagsFreeCreate'),
  categoriesFreeCreate: freeCreate('categoriesFreeCreate'),
  /* DER POTENZIALMODUS. */
  potentialMode: potentialMode(),
  /* DIE WAHL DER BILDABLAGE, als Haekchen und als
     Wahl aus dreien. */
  imageStore: imageStore(),
  imageStores: Object.keys(IMAGE_STORES),
  /* Fragt die zweite Bestaetigung bei DIESEM Zugang zusaetzlich den Code? */
  twoFactor: auth.twoFactorOn(req.user.id),
  // Die Frist des Papierkorbs. Sie steht HIER und nicht nur in GET
// /api/trash: den Loeschdialog sieht jeder, die Karte nur der Admin.
  trashDays: TRASH_DAYS
}));

app.put('/api/settings', (req, res) => {
  /* Die Antwort mischt zwei Haelften, die Rechte auch: persoenliche
     Schluessel schreibt jeder fuer sich, Vokabular und Suchanbieter gehoeren
     dem Admin. */
  /* EINE ABSAGE WIRFT, STATT ZU ANTWORTEN: der Wurf verlaesst die
     Transaktion weiter unten, und sie nimmt zurueck, was schon geschrieben
     war. */
  const refuse = (key, values) => { throw new Message(key, values); };
  /* Nimmt eine der fuenf Stufeneinstellungen an und schreibt sie. */
  const take = (key) => {
    if (req.body[key] === undefined) return;
    const a = PICK_SETTINGS[key];
    const v = a.cast(req.body[key]);
    if (!a.list.includes(v)) refuse(a.wrong);
    putUserSetting(req.user.id, key, JSON.stringify(v));
  };
  const foreign = Object.keys(req.body || {}).filter(k => !PERSONAL_KEYS.includes(k));
  if (foreign.length && !isAdmin(req))
    return res.status(403).json({ error: t(localeOf(req), DENIED_ADMIN)});
  /* DIE ENGERE FRAGE STEHT DANEBEN UND NICHT ANSTELLE DER OBEREN: was dem
     Eigentuemer gehoert, ist auch Adminsache -- nur eben nicht jedem Admin. */
  const ownerOnly2 = Object.keys(req.body || {}).filter(k => OWNER_KEYS.includes(k));
  if (ownerOnly2.length && !isOwner(req))
    return res.status(403).json({ error: t(localeOf(req), DENIED_OWNER)});

  /* ---- ALLES WEITERE IN EINER TRANSAKTION ---------------------------------
     Sonst schreibt ein Rumpf mit `{font: 80, strip: 999}` das erste Feld und
     antwortet dann mit 400. Die beiden Rechteabsagen bleiben aussen. */
  let answer;
  try {
    answer = db.transaction(() => {

      /* DIE BEIDEN WERTE DER AUFRAEUMREGEL -- geprueft hier, geschrieben
         weiter unten bei den uebrigen globalen Schaltern. */
      const ruleValues = {};
      for (const [k, range, event] of [['backupKeep', CLEANUP_KEEP, 'server.ruleKeep'],
                                      ['backupDays', CLEANUP_DAYS, 'server.ruleDays']]) {
        if (req.body[k] === undefined) continue;
        const g = checkRuleValue(req.body[k], range, event);
        if (g.error) refuse(g.error, g.values);
        ruleValues[k] = g.value;
      }

      /* DIE WAHL DER BILDABLAGE -- geprueft hier, geschrieben weiter unten
         bei den uebrigen globalen Schaltern. */
      let storeWanted = null;
      if (req.body.imageStore !== undefined) {
        if (!isImageStore(req.body.imageStore)) refuse('server.imageStoreUnknown');
        storeWanted = req.body.imageStore;
      }

      /* DIE ANSICHTEN -- geprueft hier, geschrieben gleich darunter
         zusammen mit `filters`. */
      let viewsText = null;
      if (req.body.views !== undefined) {
        const input = Array.isArray(req.body.views) ? req.body.views : [];
        if (input.length > VIEWS_CAP) refuse('server.viewCap', { cap: VIEWS_CAP });
        const clean = [];
        const names = new Set();
        for (const a of input) {
          const name = a && typeof a.name === 'string'
            ? a.name.trim().slice(0, VIEW_NAME_LENGTH) : '';
          // Halb ausgefuellt gibt es nicht -- und wortlos verschlucken erst
          // recht nicht, sonst sucht man die Ansicht spaeter in der Liste.
          if (!name) refuse('server.viewNameMissing');
          /* ZWEI ANSICHTEN MIT DEMSELBEN NAMEN SIND EINE ZU VIEL: der Name ist
             das Einzige, woran ein Mensch sie auseinanderhaelt. */
          const key = name.toLocaleLowerCase(compareLocale());
          if (names.has(key)) refuse('server.viewExists', { name });
          names.add(key);
          clean.push({
            name,
            q: a && typeof a.q === 'string' ? a.q.slice(0, VIEW_TERM_LENGTH) : '',
            filters: a && a.filters && typeof a.filters === 'object' ? a.filters : null
          });
        }
        viewsText = JSON.stringify(clean);
        if (viewsText.length > VIEWS_CHARS) refuse('server.viewsTooBig');
      }

      if (req.body.filters !== undefined)
        putUserSetting(req.user.id, 'filters', JSON.stringify(req.body.filters));
      if (viewsText !== null)
        putUserSetting(req.user.id, 'views', viewsText);
      /* DAS VOKABULAR JE SPRACHE. Der Rumpf traegt
         dieselbe Form wie die Ablage: ein Objekt je Sprachkennung. */
      if (req.body.vocabulary !== undefined) {
        /* EINE FLACHE FORM IM RUMPF MEINT DIE SPRACHE DES RUFERS und nicht die
           der Installation: wer fuenfzehn Woerter ohne Sprachkennung schickt,
           meint den Satz, den er gerade vor sich hat. */
        const incoming = vocabularyStored(req.body.vocabulary, localeOf(req));
        const next = { ...vocabularyStored(getSetting('vocabulary', null), languageDefault()) };
        for (const [code, words] of Object.entries(incoming)) {
          if (!LANGUAGES[code] || !words || typeof words !== 'object') continue;
          const clean = {};
          /* EIN LEERES FELD FAELLT HERAUS UND WIRD NICHT ZUR VORGABE,
             die Reparatur von B2, und es ist die eine Zeile, an der sie haengt. */
          for (const k of Object.keys(vocabularyDefault(code))) {
            const v = typeof words[k] === 'string' ? words[k].trim().slice(0, 40) : '';
            if (v) clean[k] = v;
          }
          /* UND EINE SPRACHE OHNE EIN EINZIGES WORT FAELLT GANZ HERAUS. */
          if (Object.keys(clean).length) next[code] = clean;
          else delete next[code];
        }
        putSetting.run('vocabulary', JSON.stringify(next));
      }
      take('font');
      take('strip');
      /* DIE KLEMME STEHT AM SERVER UND NICHT NUR IN DER PILLENREIHE. */
      take('theme');
      if (req.body.blocks !== undefined) {
        const input = req.body.blocks || {};
        putUserSetting(req.user.id, 'blocks', JSON.stringify({
          side: sortArea(input.side, BLOCK_DEFAULT.side),
          bottom: sortArea(input.bottom, BLOCK_DEFAULT.bottom),
          closed: (Array.isArray(input.closed) ? input.closed : []).filter(k => CLOSED_BLOCKS.includes(k))
        }));
      }
      take('linkRows');
      if (req.body.timeline !== undefined)
        putUserSetting(req.user.id, 'timeline', JSON.stringify(!!req.body.timeline));
      /* DER MERKZEITPUNKT KOMMT VON DER SERVERUHR, NIE VOM AUFRUFER. */
      if (req.body.bellSeen !== undefined)
        putUserSetting(req.user.id, 'bellSeen',
          JSON.stringify(db.prepare(`SELECT datetime('now', '-1 second') AS t`).get().t));
      // Eigene Anbieter zuerst: ein frisch angelegter muss im selben Zug in
      // den Vorrat aufgenommen werden koennen.
      if (req.body.searchOwn !== undefined) {
        const input = Array.isArray(req.body.searchOwn) ? req.body.searchOwn : [];
        const clean = [];
        for (let i = 0; i < OWN_SLOTS; i++) {
          const e = input[i] || {};
          const name = searchNameClean(e.name);
          const template = typeof e.template === 'string' ? e.template.trim() : '';
          if (!name && !template) { clean.push(null); continue; }   // Platz
                                                                    // geraeumt
                                                                    // Halb
                                                                    // ausgefuellt
                                                                    // gibt es
                                                                    // nicht --
                                                                    // und wortlos
                                                                    // verschlucken
                                                                    // erst recht
                                                                    // nicht,
                                                                    // sonst sucht
                                                                    // man den
                                                                    // Anbieter
                                                                    // spaeter in
                                                                    // der Liste.
          if (!name) refuse('server.searchEngineName');
          if (!searchTemplateOk(template)) refuse('server.searchUrlForm');
          clean.push({ name, template });
        }
        putSetting.run('searchOwn', JSON.stringify(clean));
        // Faellt ein Anbieter weg, der im Vorrat oder sogar Standard war,
        // raeumt das Zurueckschreiben das auf: der erste aktive rueckt nach.
        const pool = searchPool();
        writePool(pool[0], pool);
      }
      // Der Vorrat kommt als Liste von Schluesseln, Standard zuerst.
      if (req.body.searchOn !== undefined) {
        const all = allProviders();
        const input = (Array.isArray(req.body.searchOn) ? req.body.searchOn : [])
          .filter(k => typeof k === 'string' && all.some(a => a.key === k && a.present));
        // Den letzten aus dem Vorrat zu nehmen macht jede Suchzeile unbenutzbar.
        if (!input.length) refuse('server.searchEngineLast');
        writePool(input[0], input);
      }
      /* DIE SPRACHE GEGEN DEN VORRAT. */
      if (req.body.language !== undefined) {
        const wanted = String(req.body.language);
        if (!languagePool().includes(wanted)) refuse('server.languageUnknown');
        putUserSetting(req.user.id, 'language', JSON.stringify(wanted));
      }
      take('searchNames');
      // Die beiden Anlegen-Schalter sind global und damit Adminsache -- ueber
      // die Ableitung ganz oben, ohne zweite Liste und ohne eigene Route.
      for (const k of ['tagsFreeCreate', 'categoriesFreeCreate'])
        if (req.body[k] !== undefined) putSetting.run(k, JSON.stringify(!!req.body[k]));
      /* DIE WAHL DER BILDABLAGE. */
      if (storeWanted !== null) putSetting.run('imageStore', JSON.stringify(storeWanted));
      /* DER POTENZIALMODUS, derselbe Weg wie der Schalter darueber, und
         dieselbe Rechtezeile: er steht in OWNER_KEYS, und die Schranke ganz oben
         an dieser Route weist einen Admin ab, bevor hier eine Zeile faellt. */
      if (req.body.potentialMode !== undefined)
        putSetting.run('potentialMode', JSON.stringify(!!req.body.potentialMode));
      /* DIE AUFRAEUMREGEL DER SICHERUNGEN -- derselbe Weg, dieselbe
         Rechtezeile (OWNER_KEYS ganz oben), und die beiden Zahlen sind oben schon
         geprueft. */
      if (req.body.backupCleanup !== undefined)
        putSetting.run('backupCleanup', JSON.stringify(!!req.body.backupCleanup));
      for (const [k, v] of Object.entries(ruleValues)) putSetting.run(k, JSON.stringify(v));
      /* VORGABESPRACHE UND VORRAT. */
      const languagesTouched =
        req.body.languageDefault !== undefined || req.body.languageOn !== undefined;
      if (languagesTouched)
        writeLanguages(
          req.body.languageDefault !== undefined ? String(req.body.languageDefault) : languageDefault(),
          req.body.languageOn);
      return { filters: getUserSetting(req.user.id, 'filters', null),
                 vocabulary: vocabulary(localeOf(req)), vocabularies: vocabularyAll(),
                 vocabulariesOwn: vocabularyOwnAll(),
                 vocabularyDefaults: vocabularyDefaultsAll(),
                 views: views(req.user.id), viewsCap: VIEWS_CAP,
                 font: pick(req.user.id, 'font'), strip: pick(req.user.id, 'strip'),
                 theme: pick(req.user.id, 'theme'),
                 language: languageOf(req.user.id),
                 blocks: blocks(req.user.id),
                 linkRows: pick(req.user.id, 'linkRows'), timeline: timelineOn(req.user.id),
                 search: searchTemplate(), searchProviders: searchProviders(),
                 searchNames: pick(req.user.id, 'searchNames'),
                 tagsFreeCreate: freeCreate('tagsFreeCreate'),
                 categoriesFreeCreate: freeCreate('categoriesFreeCreate'),
                 potentialMode: potentialMode(),
                 languages: languageEntries(),
                 /* UND DIE BEIDEN NAMENSTAFELN, WENN DIE SPRACHFRAGE
                    BERUEHRT WAR. */
                 ...(isAdmin(req) && languagesTouched
                   ? { categoryNames: categoryNamesAll(), criterionNames: criterionNamesAll() } : {}),
                 imageStore: imageStore(), imageStores: Object.keys(IMAGE_STORES) };

    })();
  } catch (e) {
    /* Nur die eigenen Absagen werden zur Antwort; alles andere geht an den
       Fehlerweg von Express. */
    if (e instanceof Message)
      return res.status(e.status).json({ error: errorText(req, e) });
    throw e;
  }
  res.json(answer);
});

/* ---- Bewertungskriterien (Skala fest 1-5) ---- */

/* --- Das Gewicht eines Kriteriums ----------------------------------------
   DER GUELTIGE BEREICH STEHT GENAU HIER. */
const WEIGHT_MIN = 0.2, WEIGHT_MAX = 2.0;

/* ZU WELCHEM KASTEN EIN KRITERIUM GEHOEREN KANN. */
const PHASES = ['before', 'after'];
const PHASE_DEFAULT = 'after';

/* ABGEWIESEN WIRD, WAS ETWAS ANDERES BEDEUTET -- GERUNDET WIRD, WAS DASSELBE
   BEDEUTET. */
function validWeight(raw) {
  const g = Number(raw);
  if (!Number.isFinite(g) || g < WEIGHT_MIN || g > WEIGHT_MAX) return null;
  // Auf Hundertstel festlegen. Nicht als Schranke gedacht, sondern gegen den
// Rest der Gleitkommarechnung: 1.2000000000000002 hat niemand eingegeben.
  return Math.round(g * 100) / 100;
}

/* EINE ZAHL IN EINER MELDUNG -- aus der Sprache und nicht mehr
   aus einem festen Zeichen. */
const number = (n, locale = languageDefault()) => new Intl.NumberFormat(
  localeTag(locale), { maximumFractionDigits: 2, useGrouping: false })
  .format(Number(n) || 0);

// Die Reihenfolge ist frei bestimmbar und gilt ueberall gleich.
const qCriteria = db.prepare(`
  SELECT c.id, c.name, c.language, c.sort_order, c.weight, c.phase, c.created_at,
         (SELECT COUNT(DISTINCT r.item_id) FROM ratings r
           WHERE r.criterion_id = c.id AND r.value > 0) AS usage_count
  FROM rating_criteria c ORDER BY c.sort_order, c.id`);
// Und dieselbe Liste mit den Namen der gelesenen Sprache.
const criteriaFor = (locale) => named(qCriteria.all(), criterionNames(locale));

/* --- Die Kriterien gehoeren dem Admin -------------------------------------
   Ein neues Kriterium erscheint sofort an jedem Eintrag, ein geloeschtes nimmt
   ueberall die vergebenen Sterne mit. */

app.get('/api/criteria', (req, res) => res.json(criteriaFor(localeOf(req))));

// KEIN Gewicht beim Anlegen. Ein neues Kriterium startet auf 1,0 -- der Wert
// steht in der DDL -- und wird danach in der Zeile eingestellt.
app.post('/api/criteria', adminOnly, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  /* DIE PHASE IST FREIWILLIG UND HAT DIE VORGABE 'after' -- so legt die Karte
     „Bewertungskriterien" weiter an, ohne ein Feld mitzuschicken. */
  const phase = req.body.phase === undefined ? PHASE_DEFAULT : String(req.body.phase);
  if (!PHASES.includes(phase))
    return res.status(400).json({ error: t(localeOf(req), 'server.criterionEitherOr')});
  // UNIQUE(name) IST GLOBAL: ein Name, ein Kasten. Die Frage kennt deshalb
// keine Phase -- „Wunsch" gibt es einmal oder gar nicht.
  if (db.prepare('SELECT 1 FROM rating_criteria WHERE name = ? COLLATE NOCASE').get(name))
    return res.status(409).json({ error: t(localeOf(req), 'server.criterionExists')});
  /* UND ES BEKOMMT SEINE SPRACHE SOFORT. Dieselbe
     Zeile wie an der Kategorie und aus demselben Grund. */
  const critNew = newLanguage(req);
  if (critNew === null)
    return res.status(400).json({ error: t(localeOf(req), 'server.languageUnknown')});
  const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM rating_criteria').get().m + 1;
  const i = db.prepare(
    'INSERT INTO rating_criteria (name, sort_order, phase, language) VALUES (?, ?, ?, ?)')
    .run(name, pos, phase, critNew);
  /* DIE ANTWORT TRAEGT DEN NAMEN DER GELESENEN SPRACHE -- hier ist das der
     eben eingetragene: ein frisches Kriterium hat noch keine Uebersetzung. */
  res.status(201).json(named([db.prepare('SELECT * FROM rating_criteria WHERE id = ?')
    .get(i.lastInsertRowid)], criterionNames(localeOf(req)))[0]);
});

// Muss vor '/api/criteria/:id' stehen, sonst faengt der Platzhalter das Wort
// "order" als Id ab.
app.put('/api/criteria/order', adminOnly, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE rating_criteria SET sort_order = ? WHERE id = ?');
  db.transaction(() => ids.forEach((cid, i) => s.run(i, cid)))();
  renumberCriteria();   // schliesst Luecken, falls nicht alle Ids mitkamen
  res.json(criteriaFor(localeOf(req)));
});

app.put('/api/criteria/:id', adminOnly, (req, res) => {
  /* DER KASTEN LAESST SICH NACH DEM ANLEGEN NICHT MEHR WECHSELN, und der
     Versuch wird ABGEWIESEN und nicht still uebergangen: ein uebergangenes
     Feld sieht fuer den Aufrufer aus wie ein gesetztes. */
  if (req.body.phase !== undefined)
    return res.status(400).json({ error: t(localeOf(req), 'server.criterionKindFixed')});
  const critRow = db.prepare('SELECT id, name, language FROM rating_criteria WHERE id = ?')
    .get(req.params.id);
  if (!critRow) return res.status(404).json({ error: t(localeOf(req), 'server.criterionGone')});
  const critLanguage = namedLanguage(req, critRow.language);
  if (critLanguage === false)
    return res.status(400).json({ error: t(localeOf(req), 'server.languageUnknown')});
  /* DAS ✕ AM FELD, dieselbe Stelle wie an der Kategorie: VOR
     der Namensfrage, weil ein Raeumen keinen Namen mitschickt. */
  if (req.body.clearName === true)
    return sendCleared(req, res, 'criterion_names', 'criterion_id', critRow, critLanguage,
      () => named([db.prepare('SELECT * FROM rating_criteria WHERE id = ?').get(critRow.id)],
        criterionNames(localeOf(req)))[0]);
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  /* DER NAMENSSTREIT GILT JE SPRACHE. */
  const clash = critLanguage === critRow.language
    ? db.prepare('SELECT id FROM rating_criteria WHERE name = ? COLLATE NOCASE AND id != ?')
        .get(name, req.params.id)
    : db.prepare(`SELECT criterion_id AS id FROM criterion_names
                  WHERE language = ? AND name = ? COLLATE NOCASE AND criterion_id != ?`)
        .get(critLanguage, name, req.params.id);
  if (clash) return res.status(409).json({ error: t(localeOf(req), 'server.nameExists')});
  // Das Gewicht ist FREIWILLIG: das Umbenennen schickt nur den Namen und darf
// das Gewicht nicht mit anfassen.
  let weight = null;
  if (req.body.weight !== undefined) {
    weight = validWeight(req.body.weight);
    if (weight === null) return res.status(400).json({
      error: t(localeOf(req), 'server.weightRange',
        { min: number(WEIGHT_MIN, localeOf(req)), max: number(WEIGHT_MAX, localeOf(req)) })});
  }
  /* NAME UND GEWICHT IN EINEM UPDATE: zwei Anweisungen hintereinander
     koennten halb durchlaufen. */
  const critRenameBase = writeName('criterion_names', 'criterion_id',
    req.params.id, critLanguage, name, critRow.language);
  db.prepare('UPDATE rating_criteria SET name = ?, weight = COALESCE(?, weight) WHERE id = ?')
    .run(critRenameBase ? name : critRow.name, weight, req.params.id);
  res.json(named([db.prepare('SELECT * FROM rating_criteria WHERE id = ?').get(req.params.id)],
    criterionNames(localeOf(req)))[0]);
});

app.delete('/api/criteria/:id', adminOnly, (req, res) => {
  db.prepare('DELETE FROM rating_criteria WHERE id = ?').run(req.params.id);
  renumberCriteria();
  res.status(204).end();
});

/* ======== DIE KETTE ==============================
   EIN AUFLOESER, UND ZWAR GENAU EINER. */
const qCriterionBase = db.prepare('SELECT id, name, language FROM rating_criteria');
const qCategoryBase = db.prepare('SELECT id, name, language FROM product_categories');
const qCriterionNamesAll = db.prepare(
  'SELECT criterion_id AS id, language, name FROM criterion_names');
const qCategoryNamesAll = db.prepare(
  'SELECT category_id AS id, language, name FROM category_names');

/* WAS FUER EINE ZEILE IN WELCHER SPRACHE EINGETRAGEN IST -- einmal gebaut und
   danach so oft befragt, wie die Kette Schritte hat. */
function nameIndex(translated) {
  const per = new Map();
  for (const z of translated) {
    let m = per.get(z.id);
    if (!m) per.set(z.id, m = new Map());
    m.set(z.language, z.name);
  }
  return per;
}

/* DIE KETTE FUER EINE ZEILE. */
function chainFor(row, entered, locale, std) {
  const at = (code) => (code != null && code === row.language)
    ? row.name : (entered ? entered.get(code) : undefined);
  const own = at(locale);
  if (own !== undefined) return { name: own, from: locale, fallback: false };
  for (const code of [std, row.language]) {
    const back = at(code);
    if (back !== undefined) return { name: back, from: code, fallback: true };
  }
  return { name: row.name, from: null, fallback: true };
}

/* DIE TAFEL FUER EINE SPRACHE: Kennung -> was die Kette ergibt. */
function nameTable(baseRows, translated, locale) {
  const per = nameIndex(translated);
  const std = languageDefault();
  const out = new Map();
  for (const row of baseRows) out.set(row.id, chainFor(row, per.get(row.id), locale, std));
  return out;
}
const criterionNames = (locale) => nameTable(qCriterionBase.all(), qCriterionNamesAll.all(), locale);
const categoryNames = (locale) => nameTable(qCategoryBase.all(), qCategoryNamesAll.all(), locale);

/* ======== DIESELBE KETTE ALS TAFEL JE SPRACHE ============================
   WAS EIN LESER DIESER SPRACHE SAEHE, je Sprache einmal ausgerechnet. */
const namesAll = (baseRows, translated) => {
  const per = nameIndex(translated);
  const std = languageDefault();
  const out = {};
  for (const code of LANGUAGE_CODES) {
    const table = {};
    for (const row of baseRows) {
      const hit = chainFor(row, per.get(row.id), code, std);
      table[row.id] = { name: hit.name, from: hit.from };
    }
    out[code] = table;
  }
  return out;
};
const categoryNamesAll = () => namesAll(qCategoryBase.all(), qCategoryNamesAll.all());
const criterionNamesAll = () => namesAll(qCriterionBase.all(), qCriterionNamesAll.all());

/* SETZT DIE NAMEN EINER TAFEL IN EINE LISTE EIN. */
const named = (rows, table, key = 'id') => rows.map(z => {
  const hit = table.get(z[key]);
  if (!hit) return z;
  if (!hit.fallback) return { ...z, name: hit.name };
  return { ...z, name: hit.name, nameFallback: hit.from === null ? true : hit.from };
});

/* `baseLanguage()` IST WEGGEFALLEN: sie beantwortete „in welcher Sprache ist
   dieser Name geschrieben" mit „in der, die gerade Vorgabe ist". */

/* SCHREIBT EINEN NAMEN JE SPRACHE. Gibt `true` zurueck, wenn die GRUNDZEILE
   gemeint war -- dann muss der Rufer sie umbenennen. */
function writeName(table, column, id, language, name, rowLanguage) {
  if (language === rowLanguage) return true;
  db.prepare(`INSERT INTO ${table} (${column}, language, name) VALUES (?, ?, ?)
              ON CONFLICT(${column}, language) DO UPDATE SET name = excluded.name`)
    .run(id, language, name);
  return false;
}

/* RAEUMT EINEN EINTRAG WEG, das ✕ am Feld. Gibt zurueck, ob es
   etwas zu raeumen gab. */
function dropName(table, column, id, language) {
  return db.prepare(`DELETE FROM ${table} WHERE ${column} = ? AND language = ?`)
    .run(id, language).changes > 0;
}

/* DIE ANTWORT AUF DAS ✕. Sie steht hier und nicht zweimal in
   den beiden Schreibwegen: es ist dieselbe Frage und dieselbe Absage. */
function sendCleared(req, res, table, column, row, language, respond) {
  if (language === row.language)
    return res.status(400).json({ error: t(localeOf(req), 'server.nameOriginalStays')});
  dropName(table, column, row.id, language);
  return res.json(respond());
}

/* WELCHE SPRACHE EIN SCHREIBWEG MEINT: ohne Angabe die Zeile selbst. */
const namedLanguage = (req, rowLanguage) => {
  const wanted = req.body && req.body.language;
  if (wanted === undefined) return rowLanguage;
  return typeof wanted === 'string' && LANGUAGES[wanted] ? wanted : false;
};

/* DIE SPRACHE EINER NEUEN ZEILE. */
const newLanguage = (req) => {
  const wanted = req.body && req.body.language;
  if (wanted === undefined) return localeOf(req);
  return typeof wanted === 'string' && LANGUAGES[wanted] ? wanted : null;
};

/* ======== DER EINE GRIFF FUER DIE UNBEKANNTE ERSTELLUNGSSPRACHE ==
   DIE ANTWORT AUF F2: die Migration fuellt nichts, und die Karte fragt EINMAL
   nach. */
app.put('/api/names/language', adminOnly, (req, res) => {
  const wanted = req.body && req.body.language;
  if (typeof wanted !== 'string' || !LANGUAGES[wanted])
    return res.status(400).json({ error: t(localeOf(req), 'server.languageUnknown')});
  const categories = db.prepare('UPDATE product_categories SET language = ? WHERE language IS NULL')
    .run(wanted).changes;
  const criteria = db.prepare('UPDATE rating_criteria SET language = ? WHERE language IS NULL')
    .run(wanted).changes;
  res.json({ categories, criteria,
             categoryNames: categoryNamesAll(), criterionNames: criterionNamesAll() });
});

/* ---- Kategorien ---- */
/* SORTIERT WIRD NACH DEM NAMEN DER GRUNDTABELLE UND NICHT NACH DEM
   UEBERSETZTEN. */
app.get('/api/product-categories', (req, res) => res.json(named(db.prepare(`
  SELECT c.*, (SELECT COUNT(*) FROM items i WHERE i.product_category_id = c.id) AS usage_count
  FROM product_categories c ORDER BY c.name COLLATE NOCASE`).all(),
  categoryNames(localeOf(req)))));

app.post('/api/product-categories', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  const found = db.prepare('SELECT * FROM product_categories WHERE name = ? COLLATE NOCASE').get(name);
  if (found) return res.json(found);
  // HINTER dem Nachschlagen: eine VORHANDENE Kategorie zuzuweisen bleibt fuer
// jeden offen, nur ein NEUER Name haengt am Schalter.
  if (!mayCreate(req, 'categoriesFreeCreate'))
    return res.status(403).json({ error: t(localeOf(req), DENIED_CATEGORY_NEW)});
  /* UND SIE BEKOMMT IHRE SPRACHE SOFORT. */
  const catNew = newLanguage(req);
  if (catNew === null)
    return res.status(400).json({ error: t(localeOf(req), 'server.languageUnknown')});
  const i = db.prepare('INSERT INTO product_categories (name, language) VALUES (?, ?)')
    .run(name, catNew);
  res.status(201).json(named([db.prepare('SELECT * FROM product_categories WHERE id = ?')
    .get(i.lastInsertRowid)], categoryNames(localeOf(req)))[0]);
});

// Umbenennen und loeschen wirkt auf JEDEN Eintrag, der die Kategorie traegt
// -- also Adminsache, wie bei den Kriterien.
app.put('/api/product-categories/:id', adminOnly, (req, res) => {
  const catRow = db.prepare('SELECT id, name, language FROM product_categories WHERE id = ?')
    .get(req.params.id);
  if (!catRow) return res.status(404).json({ error: t(localeOf(req), 'server.categoryGone')});
  const catLanguage = namedLanguage(req, catRow.language);
  if (catLanguage === false)
    return res.status(400).json({ error: t(localeOf(req), 'server.languageUnknown')});
  /* DAS ✕ AM FELD. */
  if (req.body.clearName === true)
    return sendCleared(req, res, 'category_names', 'category_id', catRow, catLanguage,
      () => named([db.prepare('SELECT * FROM product_categories WHERE id = ?').get(catRow.id)],
        categoryNames(localeOf(req)))[0]);
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  /* Der Namensstreit gilt je Sprache -- dieselbe Ueberlegung wie am
     Kriterium. */
  const clash = catLanguage === catRow.language
    ? db.prepare('SELECT id FROM product_categories WHERE name = ? COLLATE NOCASE AND id != ?')
        .get(name, req.params.id)
    : db.prepare(`SELECT category_id AS id FROM category_names
                  WHERE language = ? AND name = ? COLLATE NOCASE AND category_id != ?`)
        .get(catLanguage, name, req.params.id);
  if (clash) return res.status(409).json({ error: t(localeOf(req), 'server.nameExists')});
  if (writeName('category_names', 'category_id', req.params.id, catLanguage, name, catRow.language))
    db.prepare('UPDATE product_categories SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json(named([db.prepare('SELECT * FROM product_categories WHERE id = ?').get(req.params.id)],
    categoryNames(localeOf(req)))[0]);
});

app.delete('/api/product-categories/:id', adminOnly, (req, res) => {
  db.prepare('DELETE FROM product_categories WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

/* ---- Tags ---- */
// Beide Verwendungen getrennt: usage_count zaehlt Eintraege, test_usage_count
// Testtage.
app.get('/api/tags', (req, res) => res.json(db.prepare(`
  SELECT t.*,
         (SELECT COUNT(*) FROM item_tags it WHERE it.tag_id = t.id) AS usage_count,
         (SELECT COUNT(*) FROM test_day_tags dt WHERE dt.tag_id = t.id) AS test_usage_count
  FROM tags t ORDER BY t.name COLLATE NOCASE`).all()));

/* EINEN TAG FUER SICH ANLEGEN (B7). */
app.post('/api/tags', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  const found = findTag(name);
  if (found) return res.json(found);
  if (!mayCreate(req, 'tagsFreeCreate'))
    return res.status(403).json({ error: t(localeOf(req), DENIED_TAG_NEW)});
  res.status(201).json(createTag(name));
});

app.put('/api/tags/:id', adminOnly, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  if (!db.prepare('SELECT 1 FROM tags WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: t(localeOf(req), 'server.tagGone')});
  const clash = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE AND id != ?').get(name, req.params.id);
  if (clash) return res.status(409).json({ error: t(localeOf(req), 'server.tagExists')});
  db.prepare('UPDATE tags SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json(db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id));
});

app.delete('/api/tags/:id', adminOnly, (req, res) => {
  db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

/* Nachschlagen und Anlegen sind ZWEI Schritte, weil die Klemme dazwischen
   gehoert: einen VORHANDENEN Tag zuzuweisen darf immer jeder, nur ein neuer
   Name haengt am Schalter. */
function findTag(name) {
  return db.prepare('SELECT * FROM tags WHERE name = ? COLLATE NOCASE').get(name.trim());
}

function createTag(name) {
  const i = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name.trim());
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(i.lastInsertRowid);
}

// Tags AM EINTRAG gehoeren dem Verfasser und dem Admin.
app.post('/api/items/:id/tags', entryAuthorOnly, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.tagMissing')});
  // Erst nachschlagen, dann die Klemme: einen vorhandenen Tag vergibt auch
// hier jeder, der an den Eintrag darf.
  let date = findTag(name);
  if (!date) {
    if (!mayCreate(req, 'tagsFreeCreate')) return res.status(403).json({ error: t(localeOf(req), DENIED_TAG_NEW)});
    date = createTag(name);
  }
  db.prepare('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)').run(req.params.id, date.id);
  touch.run(req.params.id);
  res.status(201).json(detail(req.params.id, req.user.id, localeOf(req)));
});

app.delete('/api/items/:id/tags/:tagId', entryAuthorOnly, (req, res) => {
  db.prepare('DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?').run(req.params.id, req.params.tagId);
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.user.id, localeOf(req)));
});

/* ================= Eintraege ================= */
const qAttachments = db.prepare(`SELECT id, filename, mime_type, size, sort_order, created_at, user_id
  FROM attachments WHERE item_id = ? ORDER BY sort_order, id`);
// Reihenfolge durchgaengig chronologisch, in Gruppen: Angepinntes zuerst
// (Anpinnen schlaegt die Art), dann Aufgaben, Berichte, Notizen.
const qCommentsRaw = db.prepare(`
  SELECT * FROM comments WHERE item_id = ?
  ORDER BY pinned DESC,
           CASE WHEN pinned = 1 THEN 0
                WHEN kind = 'task' THEN 0
                WHEN kind = 'report' THEN 1
                ELSE 2 END,
           id`);
// 'done' hat hier ABSICHTLICH keinen eigenen Zweig: ein erledigtes Todo
// faellt ueber das ELSE zu den Notizen und reiht sich dort nach Alter ein.

/* --- Aus einer Nummer wird ein Verfasser ----------------------------------
   EIN Ort, der das tut; die Gegenrichtung steht im Import. */
const qAuthorRows = db.prepare('SELECT id, username, status FROM users');
function authorCard() {
  const m = new Map();
  for (const u of qAuthorRows.all()) {
    const removed = u.status === 'deleted';
    // Der Grabsteinname geht NICHT hinaus.
    m.set(u.id, { id: u.id, name: removed ? null : u.username, deleted: removed });
  }
  return m;
}
const authorFrom = (card, id) => (id == null ? null : (card.get(id) || null));

/* ---- DIE MARKIERUNG: `@name` im Kommentartext --------------------------
   In Kommentaren, Berichten, Notizen und Aufgaben laesst sich ein Zugang mit
   `@name` markieren. */
const MENTION_RX = /(?<![\p{L}\p{N}_.@-])@([\p{L}\p{N}](?:[\p{L}\p{N}_.-]*[\p{L}\p{N}_])?)/gu;

/* DIE NAMENSTAFEL -- einmal je Schreibvorgang, nicht je Handgriff. */
const mentionTable = () => {
  const table = new Map();
  for (const u of qAuthorRows.all()) {
    if (u.status === 'deleted') continue;
    table.set(String(u.username).trim().toLocaleLowerCase(compareLocale()), u.id);
  }
  return table;
};

/* WEN DIESER TEXT MARKIERT -- eine Liste aus { userId, handle }, je Zugang
   EINMAL. */
function mentionsIn(text) {
  const table = mentionTable();
  const out = new Map();
  MENTION_RX.lastIndex = 0;
  let hit;
  while ((hit = MENTION_RX.exec(String(text ?? ''))) !== null) {
    const handle = hit[1];
    const id = table.get(handle.toLocaleLowerCase(compareLocale()));
    if (id != null && !out.has(id)) out.set(id, { userId: id, handle });
  }
  return [...out.values()];
}

const qMentionsClear = db.prepare('DELETE FROM comment_mentions WHERE comment_id = ?');
const qMentionsAdd = db.prepare(
  'INSERT OR IGNORE INTO comment_mentions (comment_id, user_id, handle) VALUES (?, ?, ?)');
/* NEU GESCHRIEBEN UND NICHT ERGAENZT. */
function setMentions(commentId, text) {
  const found = mentionsIn(text);
  qMentionsClear.run(commentId);
  for (const m of found) qMentionsAdd.run(commentId, m.userId, m.handle);
  return found;
}

/* UND DIE GEGENRICHTUNG: was ein Kommentar markiert, als Angabe an der
   Antwort. */
const qMentionsOfItem = db.prepare(
  `SELECT m.comment_id, m.user_id, m.handle FROM comment_mentions m
     JOIN comments c ON c.id = m.comment_id
    WHERE c.item_id = ? ORDER BY m.comment_id, m.user_id`);

/* UND DIE BILDER EINMAL FUER DEN GANZEN EINTRAG. Dieselbe
   Bauform wie qMentionsOfItem darueber: eine Abfrage mit JOIN statt einer je
   Kommentar. Ein Eintrag mit vierzig Kommentaren setzte vierzig ab. */
const qCommentImagesOfItem = db.prepare(
  `SELECT i.comment_id, i.id, i.filename, i.sort_order FROM comment_images i
     JOIN comments c ON c.id = i.comment_id
    WHERE c.item_id = ? ORDER BY i.comment_id, i.sort_order, i.id`);

/* UND DIE GEGENRICHTUNG (B6 B). Aus einem NAMEN wird ein Verfasser. */
function authorByName(card, name) {
  const clean = String(name ?? '').trim();
  if (!clean) return null;
  const tomb = /^deleted-(\d+)$/i.exec(clean);
  if (tomb) return { id: Number(tomb[1]), name: null, deleted: true };
  for (const a of card.values()) if (a.name === clean) return a;
  return null;
}

/* Jeder Kommentar sagt, ob er MIR gehoert -- daran haengen fuenf
   Bedienelemente. */
function qComments(itemId, userId, card) {
  if (userId == null) throw new Error('qComments() ohne Benutzer aufgerufen');
  const list = qCommentsRaw.all(itemId);
  /* DIE MARKIERUNGEN EINMAL FUER DEN GANZEN EINTRAG. */
  const markedPer = new Map();
  for (const z of qMentionsOfItem.all(itemId)) {
    if (!markedPer.has(z.comment_id)) markedPer.set(z.comment_id, []);
    markedPer.get(z.comment_id).push({ handle: z.handle, author: authorFrom(card, z.user_id) });
  }
  /* UND DIE BILDER EBENSO. */
  const imagesPer = new Map();
  for (const z of qCommentImagesOfItem.all(itemId)) {
    if (!imagesPer.has(z.comment_id)) imagesPer.set(z.comment_id, []);
    imagesPer.get(z.comment_id).push({ id: z.id, filename: z.filename, sort_order: z.sort_order });
  }
  for (const c of list) {
    c.pinned = !!c.pinned;
    c.images = imagesPer.get(c.id) || [];
    c.mine = c.user_id === userId;
    c.author = authorFrom(card, c.user_id);
    /* WEN DIESER KOMMENTAR MARKIERT. */
    c.mentions = markedPer.get(c.id) || [];
    // Der Eingriffsvermerk.
    c.imagesRemoved = c.images_removed;
    delete c.images_removed;
    // Wie der Eingriffsvermerk darueber: die Spalte heisst in der Datenbank
// mit Unterstrich und am Bildschirm ohne.
    c.dueDate = c.due_date || null;
    delete c.due_date;
    delete c.user_id;
  }
  return list;
}

// art und dauer gehen mit hinaus: woran die Oberflaeche ein Video erkennt,
// ist allein die Spalte art -- nicht der ausgelieferte Typ und nichts sonst.
const PHOTO_COLUMNS = 'id, item_id, mime_type, focus_x, focus_y, zoom, sort_order, created_at, kind, duration';
/* ---- DIE FASSUNG DER KACHEL ---------------------------------------------
   SIE STEHT NEBEN DER LISTE UND NICHT IN IHR: die Liste ist zugleich die
   Spaltenliste von `idx_photos_tile`, und `length(thumb)` indiziert nicht. */
/* DER ALIAS HEISST `thumbLength` und nicht mehr `fassung` -- er
   reist an der Zeile bis in den Browser, und dort las ihn `p.fassung`. */
const PHOTO_VERSION = 'length(thumb) AS thumbLength';
const qPhotos = db.prepare(`SELECT ${PHOTO_COLUMNS}, ${PHOTO_VERSION} FROM photos WHERE item_id = ? ORDER BY sort_order, id`);
/* DIESELBEN SPALTEN FUER ALLE EINTRAEGE AUF EINMAL -- die Uebersicht ruft
   sie, detail() ruft die Zeile darueber. */
const qAllPhotos = db.prepare(`SELECT ${PHOTO_COLUMNS}, ${PHOTO_VERSION} FROM photos ORDER BY item_id, sort_order, id`);
/* `t.*` IST EINE SPALTENLISTE: ein Schlagwort traegt id, name und created_at,
   und `created_at` wird in public/app.js an einem Schlagwort nirgends
   gelesen. */
const TAG_COLUMNS = 't.id, t.name';
const qTags = db.prepare(`SELECT ${TAG_COLUMNS} FROM tags t JOIN item_tags it ON it.tag_id = t.id WHERE it.item_id = ? ORDER BY t.name COLLATE NOCASE`);
/* DIESELBEN SPALTEN FUER ALLE EINTRAEGE AUF EINMAL, dieselbe
   Bauform wie qAllPhotos. */
const qAllTags = db.prepare(`SELECT it.item_id, ${TAG_COLUMNS} FROM tags t
  JOIN item_tags it ON it.tag_id = t.id ORDER BY it.item_id, t.name COLLATE NOCASE`);
const qLinks = db.prepare('SELECT id, url, sort_order, created_at, user_id FROM links WHERE item_id = ? ORDER BY sort_order, id');
/* DIE UEBERSICHT ZAEHLT NUR. */
const qLinkCounts = db.prepare('SELECT item_id, COUNT(*) n FROM links GROUP BY item_id');
const qCat = db.prepare('SELECT id, name FROM product_categories WHERE id = ?');
/* Und dieselbe Frage fuer die ganze Liste. */
const qAllCategories = db.prepare('SELECT id, name FROM product_categories');
/* --- Schnitt und Anzahl je Kriterium --------------------------------------
   EINE Abfrage, gruppiert -- kein zweiter JOIN auf `ratings` neben dem in
   detail(): drei Bewerter ergaeben sonst einen neunfachen Zaehler. */
const qAveragePerCriterion = db.prepare(`
  SELECT r.criterion_id, AVG(r.value * 1.0) AS average, COUNT(*) AS count,
         c.weight, c.phase
    FROM ratings r JOIN rating_criteria c ON c.id = r.criterion_id
   WHERE r.item_id = ? AND r.value > 0
   GROUP BY r.criterion_id, c.weight, c.phase`);

/* ZWEI KARTEN JE EINTRAG, EINE JE PHASE. */
function cardPerPhase(rows) {
  const box = { before: new Map(), after: new Map() };
  for (const z of rows) {
    // Ein unbekannter Wert in der Spalte kaeme nur aus einer Schreibung an
// PHASEN vorbei.
    if (box[z.phase]) box[z.phase].set(z.criterion_id, z);
  }
  return box;
}

function averagesPerCriterion(itemId) {
  return cardPerPhase(qAveragePerCriterion.all(itemId));
}

/* DIESELBE ABFRAGE FUER ALLE EINTRAEGE AUF EINMAL. */
const qAveragePerCriterionAll = db.prepare(`
  SELECT r.item_id, r.criterion_id, AVG(r.value * 1.0) AS average, COUNT(*) AS count,
         c.weight, c.phase
    FROM ratings r JOIN rating_criteria c ON c.id = r.criterion_id
   WHERE r.value > 0
   GROUP BY r.item_id, r.criterion_id, c.weight, c.phase`);

// Je Eintrag DIESELBEN ZWEI KARTEN wie am einzelnen -- ueber denselben
// cardPerPhase().
function averagesPerEntry() {
  const raw = new Map();
  for (const z of qAveragePerCriterionAll.all()) {
    if (!raw.has(z.item_id)) raw.set(z.item_id, []);
    raw.get(z.item_id).push(z);
  }
  const all = new Map();
  for (const [itemId, rows] of raw) all.set(itemId, cardPerPhase(rows));
  return all;
}

// Was ein Eintrag OHNE eine einzige Sternzeile mitbringt -- zwei leere
// Kaesten.
const EMPTY_BOXES = () => ({ before: new Map(), after: new Map() });

/* Wer welchen Wert vergeben hat -- je Kriterium eine Liste. Wieder eine
   EIGENE Abfrage, Begruendung bei qAveragePerCriterion. */
const qVotesRaw = db.prepare(`
  SELECT id, criterion_id, user_id, value FROM ratings
   WHERE item_id = ? AND value > 0 ORDER BY criterion_id, id`);

function votesPerCriterion(itemId, userId, card) {
  if (userId == null) throw new Error('stimmenJeKriterium() ohne Benutzer aufgerufen');
  const m = new Map();
  for (const z of qVotesRaw.all(itemId)) {
    if (!m.has(z.criterion_id)) m.set(z.criterion_id, []);
    m.get(z.criterion_id).push({
      id: z.id, value: z.value, mine: z.user_id === userId,
      author: authorFrom(card, z.user_id)
    });
  }
  return m;
}

// Gesamtschnitt: erst je Kriterium ueber alle Benutzer, dann ueber die
// Kriterien -- NICHT flach ueber alle Bewertungszeilen.
function totalAverage(card, calc) {
  let counter = 0, denominator = 0;
  /* DIE VERGLEICHSZAHL. Was kaeme heraus, wenn alle Kriterien
     gleich zaehlten? */
  let sameCounter = 0;
  const rows = [];
  for (const z of card.values()) {
    const product = z.average * z.weight;
    counter += product; denominator += z.weight;
    sameCounter += z.average;
    rows.push({ criterionId: z.criterion_id, average: z.average, weight: z.weight, product });
  }
  // UNGERUNDET, wie hier gerechnet wird.
  if (calc) Object.assign(calc,
    { rows, sum: counter, divisor: denominator, raw: denominator ? counter / denominator : null,
      equalSum: sameCounter, equalDivisor: rows.length,
      equalRaw: rows.length ? sameCounter / rows.length : null,
      equalResult: rows.length
        ? Math.round((sameCounter / rows.length) * 10) / 10 : null });
  // Kein Nenner heisst: kein bewertetes Kriterium, also keine Zahl. Bei
// mindestens einer Zeile ist er mindestens WEIGHT_MIN und damit nie null.
  if (!denominator) return null;
  return Math.round((counter / denominator) * 10) / 10;
}

const qTestDaysRaw = db.prepare('SELECT id, day, rating, user_id FROM test_days WHERE item_id = ? ORDER BY day DESC, id DESC');
const qTestDayTags = db.prepare(`SELECT t.id, t.name FROM tags t
  JOIN test_day_tags dt ON dt.tag_id = t.id WHERE dt.test_day_id = ?
  ORDER BY t.name COLLATE NOCASE`);
// Jeder Testtag sagt, ob er MIR gehoert -- die Zeitleiste zeichnet die
// eigenen Punkte gefuellt und fremde als Ring.
function qTestDays(itemId, userId, card) {
  if (userId == null) throw new Error('qTestDays() ohne Benutzer aufgerufen');
  const days = qTestDaysRaw.all(itemId);
  for (const date of days) {
    date.tags = qTestDayTags.all(date.id);
    date.mine = date.user_id === userId;
    // Der Name steht neben `mine`, er ersetzt es nicht: die Zeitleiste
    // unterscheidet eigene von fremden Punkten ueber die Fuellung und braucht
    // dafuer keinen Namen, die Zeile im Eintrag braucht ihn.
    date.author = authorFrom(card, date.user_id);
    delete date.user_id;
  }
  return days;
}

/* ---- DIE SCHMALE FASSUNG FUER DIE LISTE ---------------------------------
   ZWEI FORMEN FUER ZWEI FRAGEN: qTestDays() darueber beantwortet „was steht
   an DIESEM Eintrag" und zeigt Schlagworte und Verfasser. */
const qAllTestDaysNarrow = db.prepare(
  'SELECT item_id, id, day, rating, user_id FROM test_days ORDER BY item_id, day DESC, id DESC');

function testDaysPerEntry(userId) {
  if (userId == null) throw new Error('testTageJeEintrag() ohne Benutzer aufgerufen');
  const per = new Map();
  for (const date of qAllTestDaysNarrow.all()) {
    if (!per.has(date.item_id)) per.set(date.item_id, []);
    // mine kommt vom Server, wie in qTestDays(): die Zeitleiste zeichnet die
// eigenen Punkte gefuellt und fremde als Ring.
    per.get(date.item_id).push({ id: date.id, day: date.day, rating: date.rating,
                             mine: date.user_id === userId });
  }
  return per;
}
const qTestStats = db.prepare(`
  SELECT COUNT(*) AS cnt, AVG(rating * 1.0) AS avg,
         (SELECT rating FROM test_days WHERE item_id = ? ORDER BY day DESC, id DESC LIMIT 1) AS last
  FROM test_days WHERE item_id = ?`);

function testStats(id) {
  const r = qTestStats.get(id, id);
  // Fehlender Wert ist nicht Null: ohne Testtage bleiben alle drei Kennzahlen
  // leer, damit die Sortierung "keine Erfahrung" von "schlecht" unterscheiden
  // kann und solche Eintraege in beide Richtungen hinten stehen.
  return r.cnt ? { testCount: r.cnt, testAvg: Math.round(r.avg * 10) / 10, testLast: r.last }
               : NO_TESTS;
}
/* KEIN GEMEINSAMER WERT FUER DIE LEEREN DREI: Object.assign kopiert, also
   teilt sich niemand das Objekt. */
const NO_TESTS = { testCount: null, testAvg: null, testLast: null };

const qMyPin = db.prepare('SELECT 1 FROM item_pins WHERE user_id = ? AND item_id = ?');

// detail() braucht den Benutzer: "favorite" heisst "habe ICH als Favorit
// markiert" -- dieselbe Antwort sieht fuer zwei Leute verschieden aus.
/* DIE SPRACHE STEHT IN DER SIGNATUR UND WIRD NICHT INNEN GEHOLT. */
function detail(id, userId, locale) {
  if (userId == null) throw new Error('detail() ohne Benutzer aufgerufen');
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!it) return null;
  // EINMAL je Aufruf: Eintrag, Kommentare, Testtage und Stimmen greifen alle
// darauf zu.
  const card = authorCard();
  it.rejected = !!it.rejected; it.tested = !!it.tested;
  it.author = authorFrom(card, it.user_id);
  /* WEM DER EINTRAG GEHOERT, SAGT DER SERVER -- wie am Kommentar, an der
     Linkzeile und am Anhang. */
  it.mine = it.user_id === userId;
  delete it.user_id;
  /* WEM DIE BEGRUENDUNG GEHOERT, und es ist eine EIGENE Angabe neben `mine`:
     wer abgelehnt hat, muss nicht der sein, dem der Eintrag gehoert. */
  it.rejectedMine = it.rejected_by != null && it.rejected_by === userId;
  /* WER ABGELEHNT HAT, GEHT ALS VERFASSEROBJEKT HINAUS UND NIE ALS NUMMER --
     dieselbe EINE Abbildung wie am Eintrag: aus einem Grabstein wird
     „Geloeschter Benutzer 7" und nicht sein freigegebener Name. */
  it.rejectedAuthor = authorFrom(card, it.rejected_by);
  delete it.rejected_by;
  it.favorite = !!qMyPin.get(userId, id);
  it.category = it.product_category_id
    ? named([qCat.get(it.product_category_id)], categoryNames(locale))[0] : null;
  it.photos = qPhotos.all(id);
  /* Nur die Angaben, nie die Bytes. Die Art der Vorschau entscheidet der
     Server anhand der Endung -- die Oberflaeche soll das nicht selbst raten. */
  it.attachments = qAttachments.all(id).map(a2 => ({
    id: a2.id, filename: a2.filename, mime_type: a2.mime_type, size: a2.size,
    sort_order: a2.sort_order, created_at: a2.created_at,
    preview: attachments.previewKind(a2.filename),
    mine: a2.user_id === userId, author: authorFrom(card, a2.user_id)
  }));
  /* Die Linkzeile sagt wie Kommentar, Testtag und Stimme, wem sie gehoert --
     an `mine` haengt das Loeschkreuz, und bei einem Grabstein liesse es sich
     aus dem Verfasserobjekt nicht zurueckrechnen. */
  it.links = qLinks.all(id).map(l => ({
    id: l.id, url: l.url, sort_order: l.sort_order, created_at: l.created_at,
    mine: l.user_id === userId, author: authorFrom(card, l.user_id)
  }));
  it.tags = qTags.all(id);
  it.testDays = qTestDays(id, userId, card);
  it.comments = qComments(id, userId, card);
  // Die eigene Sterne-Zeile.
  it.ratings = named(db.prepare(`
    SELECT c.id AS criterion_id, c.name, c.weight, c.phase, COALESCE(r.value, 0) AS value
    FROM rating_criteria c LEFT JOIN ratings r
      ON r.criterion_id = c.id AND r.item_id = ? AND r.user_id = ?
    ORDER BY c.sort_order, c.id`).all(id, userId),
    criterionNames(locale), 'criterion_id');
  // Neben der eigenen Zeile stehen Schnitt und Zahl der Bewerter ueber alle
// -- angehaengt aus der gruppierten Abfrage, nicht aus einem zweiten JOIN.
  const averages = averagesPerCriterion(id);
  // WER WELCHEN WERT VERGEBEN HAT, STEHT HIER AUSDRUECKLICH NICHT: diese
  // Antwort geht an jeden, und eine Angabe darueber, wie eine EINZELNE PERSON
  // bewertet hat, ist mehr, als eine Bewertung aussagen soll.
  for (const r of it.ratings) {
    // Aus dem Kasten, zu dem das Kriterium gehoert. Ein Griff in den anderen
// ginge ins Leere -- die beiden Karten teilen keine Kennung.
    const box = averages[r.phase];
    const z = box && box.get(r.criterion_id);
    r.avg = z ? Math.round(z.average * 10) / 10 : null;
    r.count = z ? z.count : 0;
  }
  /* DIE AUFSTELLUNG GEHT NUR AM EINZELNEN EINTRAG MIT -- dort steht die
     Kopfzahl, und dort wird gefragt, wie sie zustande kommt. */
  /* ZWEIMAL DIESELBE RECHNUNG UEBER ZWEI GETRENNTE MENGEN, und das
     ist die ganze Zweiteilung. */
  const calc = {};
  it.avgRating = totalAverage(averages.after, calc);
  it.calc = { ...calc, result: it.avgRating };
  const potentialCalc = {};
  it.potentialRating = totalAverage(averages.before, potentialCalc);
  it.potentialCalc = { ...potentialCalc, result: it.potentialRating };
  Object.assign(it, testStats(id));
  return it;
}

const qMyPins = db.prepare('SELECT item_id FROM item_pins WHERE user_id = ?');
const qAllItems = db.prepare('SELECT * FROM items ORDER BY updated_at DESC');
/* VORBEREITET UND NICHT JE EINTRAG UEBERSETZT. Beide Abfragen standen in der
   Schleife darunter und wurden damit einmal je Eintrag uebersetzt. */
const qAttachmentCounts = db.prepare('SELECT item_id, COUNT(*) n FROM attachments GROUP BY item_id');

/* ANFANG DES GETEILTEN KERNS -- er steht zweimal, hier und in
   public/app.js, Zeichen fuer Zeichen gleich. Ein Waechter haelt ihn
   gleich, und eine gemeinsame Tafel von Faellen prueft beide Fassungen. */
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
/* ENDE DES GETEILTEN KERNS */

/* ================= Die Volltextsuche ================= SIE SUCHT SIEBEN
   QUELLEN: Titel, Beschreibung, Kategoriename, Tags am Eintrag, Tags an
   Testtagen, Linkadressen und saemtliche Kommentartexte. */
/* ---- DIE SIEBEN QUELLEN STEHEN GENAU EINMAL ------------------
   FRUEHER STAND DIE BEDINGUNG NUR IM `WHERE`, und die Antwort warf weg,
   WELCHE der sieben getroffen hatte. */
const FULLTEXT_SOURCES = [
  { key: 'description',
    value: 'CASE WHEN instr(kkl(i.description), :q) > 0 THEN i.description END' },
  { key: 'comment',
    value: `(SELECT k.text FROM comments k
             WHERE k.item_id = i.id AND instr(kkl(k.text), :q) > 0
             ORDER BY k.id LIMIT 1)` },
  { key: 'link',
    value: `(SELECT l.url FROM links l
             WHERE l.item_id = i.id AND instr(kkl(l.url), :q) > 0
             ORDER BY l.sort_order, l.id LIMIT 1)` },
  { key: 'testDay',
    value: `(SELECT tt.name FROM test_days d
              JOIN test_day_tags dt ON dt.test_day_id = d.id
              JOIN tags tt ON tt.id = dt.tag_id
             WHERE d.item_id = i.id AND instr(kkl(tt.name), :q) > 0
             ORDER BY tt.name, tt.id LIMIT 1)` },
  { key: 'tag',
    value: `(SELECT t.name FROM item_tags it JOIN tags t ON t.id = it.tag_id
             WHERE it.item_id = i.id AND instr(kkl(t.name), :q) > 0
             ORDER BY t.name, t.id LIMIT 1)` },
  { key: 'category',
    value: 'CASE WHEN instr(kkl(c.name), :q) > 0 THEN c.name END' },
  { key: 'title',
    value: 'CASE WHEN instr(kkl(i.title), :q) > 0 THEN i.title END' }
];

/* DER FILTER BLEIBT DIE ODER-KETTE, und das ist keine Formsache: SQLite
   bricht sie beim ersten Treffer ab. */
const qFulltext = db.prepare(`
  SELECT i.id,
         ${FULLTEXT_SOURCES.map(q => `${q.value} AS f_${q.key}`).join(',\n         ')}
    FROM items i
    LEFT JOIN product_categories c ON c.id = i.product_category_id
   WHERE ${FULLTEXT_SOURCES.map(q => `(${q.value}) IS NOT NULL`).join('\n      OR ')}`);

/* Nur diese beiden der sieben Quellen tragen Auszeichnung. */
const MARKUP_SOURCES = new Set(['description', 'comment']);

/* WIE LANG EIN AUSSCHNITT IST -- GEMESSEN UND NICHT GESCHAETZT. */
const SNIPPET_LENGTH = 56;
const SNIPPET_LEAD = 4;

/* WEISSRAUM WIRD EINGEEBNET -- ABER NUR IM TEXT UND NIE IM BEGRIFF. Ein
   Kommentar traegt Absaetze; die Kachelzeile ist EINE Zeile. */
const oneLine = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/* KEINE SPRACHE MEHR (B8). */
function snippet(text, term) {
  const row = oneLine(text);
  const b = String(term ?? '');
  if (!b) return row.slice(0, SNIPPET_LENGTH);
  let flat = '';
  const back = [];
  let raw = 0;
  for (const c of row) {
    const piece = searchFold(c);
    for (let k = 0; k < piece.length; k++) back.push(raw);
    flat += piece;
    raw += c.length;
  }
  const hit = flat.indexOf(searchFold(b));
  const pos = hit < 0 ? -1 : back[hit];
  /* GEFUNDEN WIRD SIE HIER NORMALERWEISE WIEDER -- gesucht hat SQLite auf dem
     Rohtext, geschnitten wird auf dem eingeebneten. Steht der Begriff allein im
     Ziel eines Links, faellt er dabei weg, und der Ausschnitt faengt vorn an. */
  const from = pos < 0 ? 0 : Math.max(0, pos - SNIPPET_LEAD);
  const to = from + SNIPPET_LENGTH;
  return (from > 0 ? '…' : '') + row.slice(from, to) + (to < row.length ? '…' : '');
}

/* DER BEGRIFF WIRD GENAU SO ZUGESCHNITTEN WIE VORHER IM BROWSER: aussen
   getrimmt, klein geschrieben. */
/* DIE NADEL FAELLT DURCH DIESELBE FALTUNG WIE DER HEUHAUFEN, und sie nimmt
   KEINE Sprache mehr entgegen. */
const fulltextTerm = (raw) => (typeof raw === 'string' ? searchFold(raw.trim()) : '');

/* WAS JE EINTRAG HERAUSKOMMT: die erste getroffene Quelle der festen Folge,
   ihr Ausschnitt und die Zahl der WEITEREN getroffenen Quellen. */
/* OHNE SPRACHE (B8). Sie wurde nur an snippet() weitergereicht,
   und der Ausschnitt haengt seit dieser Runde an keiner mehr. */
const fulltextHits = (term) => new Map(qFulltext.all({ q: term }).map(r => {
  const hit = FULLTEXT_SOURCES.filter(q => r['f_' + q.key] != null);
  const first = hit[0];
  return [r.id, first ? {
    source: first.key,
    /* Die Marken kommen VOR dem Schneiden heraus: ein halbes `**` stuende
       sonst sichtbar im Ausschnitt. */
    text: snippet(MARKUP_SOURCES.has(first.key)
      ? markupPlain(r['f_' + first.key]) : r['f_' + first.key], term),
    others: hit.length - 1
  } : null];
}));

/* ---- ZWEI ZAHLEN, DIE MIT DER LISTE MITREISEN ----------------
   BEIDE HAENGEN AN EINER ANTWORT, DIE ES OHNEHIN GIBT, und das ist der ganze
   Punkt. */
const qOpenPerEntry = db.prepare(
  `SELECT item_id, COUNT(*) AS n FROM comments WHERE kind = 'task' GROUP BY item_id`);
/* WAS SEIT DEM BEZUGSPUNKT DAZUGEKOMMEN IST -- Kommentare und Bewertungen
   getrennt gefragt, weil sie in verschiedenen Tabellen stehen. */
/* DIE EIGENE HAND ZAEHLT NICHT -- `user_id IS NOT ?` in beiden Abfragen. */
/* UND SAGT DIESELBE ABFRAGE AUCH, WAS DAVON MICH MARKIERT, Zusage 1. */
const qNewComments = db.prepare(
  `SELECT c.item_id AS item_id, c.user_id AS user_id, COUNT(*) AS n,
          SUM(CASE WHEN m.comment_id IS NULL THEN 0 ELSE 1 END) AS marked
     FROM comments c
     LEFT JOIN comment_mentions m ON m.comment_id = c.id AND m.user_id = ?
    WHERE c.created_at > ? AND c.user_id IS NOT ?
    GROUP BY c.item_id, c.user_id`);
const qNewRatings = db.prepare(
  `SELECT item_id, user_id, COUNT(*) AS n FROM ratings
    WHERE set_at IS NOT NULL AND set_at > ? AND value > 0 AND user_id IS NOT ?
    GROUP BY item_id, user_id`);

app.get('/api/items', (req, res) => {
  let rows = qAllItems.all();
  const term = fulltextTerm(req.query.q);
  /* DIE FUNDSTELLEN KOMMEN AUS DERSELBEN ABFRAGE WIE DER FILTER -- kein
     zweiter Weg und keine Abfrage je Eintrag. */
  const hits = term ? fulltextHits(term) : new Map();
  if (term) rows = rows.filter(r => hits.has(r.id));
  /* DIE ZEITLEISTE EINMAL FUER DIE GANZE LISTE GEFRAGT, nicht je Eintrag:
     eine persoenliche Einstellung aendert sich innerhalb einer Antwort nicht. */
  const timeline = timelineOn(req.user.id);
  // Eine Abfrage fuer die ganze Liste statt einer je Zeile.
  const myPins = new Set(qMyPins.all(req.user.id).map(p => p.item_id));
  // Einmal fuer die ganze Liste, nicht je Eintrag -- sonst stuende dieselbe
// Abfrage bei hundert Eintraegen hundertmal.
  const card = authorCard();
  const openPer = new Map(qOpenPerEntry.all().map(z => [z.item_id, z.n]));
  /* OHNE GESPEICHERTEN BEZUGSPUNKT GIBT ES KEINE GLOCKE -- dieselbe Lage und
     dieselbe Antwort wie bei „Neu seit meinem letzten Besuch". */
  const reference = bellSeen(req.user.id);
  const newCommentsPer = new Map(), newRatingsPer = new Map(), newFromPer = new Map();
  /* DIE VIERTE KARTE: wie viele der neuen Kommentare MICH
     markieren. */
  const newMarkedPer = new Map();
  if (reference) {
    /* WER EINEN KOMMENTAR GESCHRIEBEN HAT -- je Eintrag eine Menge von
       Zugangsnummern. */
    /* DIE EINDEUTIGKEIT KOMMT AUS DEM GROUP BY, NICHT AUS DER MENGE. */
    const actor = (id, uid) => {
      if (!newFromPer.has(id)) newFromPer.set(id, new Set());
      newFromPer.get(id).add(uid);
    };
    /* BEIDE ABFRAGEN BEKOMMEN DENSELBEN ZWEITEN WERT. */
    for (const z of qNewComments.all(req.user.id, reference, req.user.id)) {
      newCommentsPer.set(z.item_id, (newCommentsPer.get(z.item_id) || 0) + z.n);
      /* WAS DAVON MICH MARKIERT -- aus DERSELBEN Zeile und nicht aus einer
         zweiten Abfrage (Zusage 1). */
      if (z.marked) newMarkedPer.set(z.item_id, (newMarkedPer.get(z.item_id) || 0) + z.marked);
      actor(z.item_id, z.user_id);
    }
    for (const z of qNewRatings.all(reference, req.user.id))
      newRatingsPer.set(z.item_id, (newRatingsPer.get(z.item_id) || 0) + z.n);
  }
  /* DIE FOTOS ALLER EINTRAEGE IN EINER ABFRAGE -- vorher eine je Eintrag. */
  const photosPer = new Map();
  for (const f of qAllPhotos.all()) {
    if (!photosPer.has(f.item_id)) photosPer.set(f.item_id, []);
    photosPer.get(f.item_id).push(f);
  }
  /* UND DIE UEBRIGEN FUENF DERSELBE WEG. */
  const tagsPer = new Map();
  for (const z of qAllTags.all()) {
    if (!tagsPer.has(z.item_id)) tagsPer.set(z.item_id, []);
    tagsPer.get(z.item_id).push(z);
    delete z.item_id;
  }
  const linkCountPer = new Map(qLinkCounts.all().map(z => [z.item_id, z.n]));
  const attachmentCountPer = new Map(qAttachmentCounts.all().map(z => [z.item_id, z.n]));
  const averagesPer = averagesPerEntry();
  /* DIE KATEGORIEN DER UEBERSICHT, mit den Namen der gelesenen Sprache.
     Einmal gebaut und nicht je Kachel: die Uebersicht zeigt Hunderte. */
  const catPer = new Map(named(qAllCategories.all(), categoryNames(localeOf(req)))
    .map(k => [k.id, k]));
  // Die Testtage nur, wenn die Zeitleiste ueberhaupt an ist -- wie bisher.
  const testDaysPer = timeline ? testDaysPerEntry(req.user.id) : null;
  for (const it of rows) {
    it.rejected = !!it.rejected; it.tested = !!it.tested;
    it.author = authorFrom(card, it.user_id);
    /* WEM DER EINTRAG GEHOERT, ALS JA/NEIN. */
    it.mine = it.user_id === req.user.id;
    delete it.user_id;
    it.favorite = myPins.has(it.id);
    const ph = photosPer.get(it.id) || [];
    // Das erste Element ist das Hauptbild, gleich welcher Art -- bei einem
// Video steht dort sein Standbild.
    it.mainPhoto = ph[0] || null;
    it.photoCount = ph.filter(p2 => p2.kind !== 'video').length;
    it.videoCount = ph.filter(p2 => p2.kind === 'video').length;
    it.category = it.product_category_id ? (catPer.get(it.product_category_id) || null) : null;
    it.tags = tagsPer.get(it.id) || [];
    /* NUR DIE ZAHL, NICHT DIE ZEILEN. */
    it.linkCount = linkCountPer.get(it.id) || 0;
    it.attachmentCount = attachmentCountPer.get(it.id) || 0;
    // Dieselbe Rechnung wie in detail(), ueber denselben Helfer.
    const boxes = averagesPer.get(it.id) || EMPTY_BOXES();
    it.avgRating = totalAverage(boxes.after);
    /* DIE ZWEITE ZAHL STEHT NEBEN DER ERSTEN UND NICHT STATT IHRER -- auch an
       einem getesteten Eintrag. */
    it.potentialRating = totalAverage(boxes.before);
    Object.assign(it, testStats(it.id));
    /* DIE ZEITLEISTE BRAUCHT DIE TESTTAGE SELBST, nicht nur ihre Anzahl --
       und dazu, wem sie gehoeren. */
    if (timeline) it.testDays = testDaysPer.get(it.id) || [];
    /* DIE BESCHREIBUNG FAELLT AUS DER LISTE, WIE BISHER. */
    delete it.description;
    /* UND DIE DREI ANGABEN ZUR ABLEHNUNG EBENSO. */
    delete it.rejected_at; delete it.rejected_reason; delete it.rejected_by;
    /* DIE ZAHL DER OFFENEN AUFGABEN AN DIESEM EINTRAG. */
    it.openTasks = openPer.get(it.id) || 0;
    /* DER TREFFERKONTEXT. */
    if (term) it.foundAt = hits.get(it.id);
    /* DREI ANGABEN, UND SIE STEHEN ODER FEHLEN GEMEINSAM. */
    if (reference) it.newComments = newCommentsPer.get(it.id) || 0;
    if (reference) it.newRatings = newRatingsPer.get(it.id) || 0;
    if (reference) it.newFrom = [...(newFromPer.get(it.id) || [])].map(uid => authorFrom(card, uid));
    /* DIE VIERTE ANGABE, UND SIE STEHT MIT DEN DREI ANDEREN ODER GAR NICHT. */
    if (reference) it.newMarked = newMarkedPer.get(it.id) || 0;
  }
  res.json(rows);
});

app.get('/api/items/:id', (req, res) => {
  const it = detail(req.params.id, req.user.id, localeOf(req));
  if (!it) return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
  res.json(it);
});

/* ---- Woran ein Verweis haengt ---- */
/* Die Marke nennt Titel und Stellung; die Stellung kommt beim Fragen heraus
   und reist nicht in der Adresse mit. */
const qCommentRef = db.prepare(`
  SELECT k.id, k.item_id AS itemId, i.title AS itemTitle,
         (SELECT COUNT(*) FROM comments v WHERE v.item_id = k.item_id AND v.id <= k.id) AS number
    FROM comments k JOIN items i ON i.id = k.item_id
   WHERE k.id = ?`);

/* Dieselbe Schranke wie am Eintrag und keine zweite: angemeldet sein
   genuegt, denn GET /api/items/:id verlangt auch nicht mehr. */
app.get('/api/comment-refs', (req, res) => {
  /* Zweihundert je Ruf -- ein Eintrag mit mehr Verweisen holt den Rest
     beim naechsten Zeichnen. */
  const ids = [...new Set(String(req.query.ids || '').split(',')
    .map(x => Number(x)).filter(Number.isInteger))].slice(0, 200);
  res.json(ids.map(x => qCommentRef.get(x)).filter(Boolean));
});

app.post('/api/items', (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: t(localeOf(req), 'server.titleMissing')});
  // Der Anlegende ist der Verfasser. req.user steht an jedem geschuetzten
// Endpunkt (auth.js, requireAuth).
  const i = db.prepare('INSERT INTO items (title, description, user_id) VALUES (?, ?, ?)')
    .run(title, req.body.description || '', req.user.id);
  res.status(201).json(detail(i.lastInsertRowid, req.user.id, localeOf(req)));
});

/* DIE BEGRUENDUNG EINER ABLEHNUNG -- EINE ZEILE TEXT. */
const REASON_LENGTH = 200;
const reasonText = (v) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, REASON_LENGTH) : '';

app.put('/api/items/:id', (req, res) => {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!it) return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
  const b = req.body || {};

  /* DIESE ROUTE TRAEGT ZWEI RECHTEKLASSEN IN EINEM RUMPF, und das ist
     verlangt: `favorite` ist persoenlich -- jeder setzt seinen eigenen an
     jedem Eintrag, auch an einem fremden (item_pins). */
  const authorOnlyFields = AUTHOR_ONLY_FIELDS.filter(f => b[f] !== undefined);
  if (authorOnlyFields.length && !mayChange(req, it.user_id))
    return res.status(403).json({ error: t(localeOf(req), DENIED_ENTRY)});

  /* ---- Die Klemme an der Begruendung ---- ZURUECKNEHMEN DARF DAS MERKMAL,
     WER DEN EINTRAG AENDERN DARF; UMSCHREIBEN DARF DIE BEGRUENDUNG NUR, WER
     SIE GETROFFEN HAT. */
  const turnsOn = b.rejected !== undefined && !!b.rejected && !it.rejected;
  const removedReason = b.rejectedReason !== undefined && !reasonText(b.rejectedReason);
  if (b.rejectedReason !== undefined && !turnsOn && !removedReason &&
      it.rejected_by != null && !selfOnly(req, it.rejected_by))
    return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});

  // "Getestet" laesst sich nicht zuruecknehmen, solange Testtage eingetragen sind.
  if (b.tested === false) {
    const n = db.prepare('SELECT COUNT(*) n FROM test_days WHERE item_id = ?').get(req.params.id).n;
    if (n > 0) {
      return res.status(409).json({
        error: t(localeOf(req), 'server.testedStays', { n })});
    }
  }

  // Der Favorit ist KEINE Spalte von items und laeuft deshalb nicht durch die
// Klemme darunter.
  if (b.favorite !== undefined) {
    if (b.favorite) db.prepare('INSERT OR IGNORE INTO item_pins (user_id, item_id) VALUES (?, ?)')
      .run(req.user.id, req.params.id);
    else db.prepare('DELETE FROM item_pins WHERE user_id = ? AND item_id = ?')
      .run(req.user.id, req.params.id);
  }

  const sets = [], vals = [];
  const put = (col, v) => { sets.push(`${col} = ?`); vals.push(v); };
  if (b.title !== undefined) put('title', String(b.title).trim());
  if (b.description !== undefined) put('description', b.description);
  if (b.rejected !== undefined) put('rejected', b.rejected ? 1 : 0);
  /* DIE DREI ANGABEN SIND EINE AUSSAGE UND WERDEN ZUSAMMEN GESCHRIEBEN. */
  if (turnsOn) {
    // datetime('now') wie an created_at und updated_at daneben: die Zeit
    // kommt aus der Datenbank und nie aus dem Rumpf -- und auch nicht aus
    // einer zweiten Quelle in JS, die um Sekunden danebenlaege.
    sets.push(`rejected_at = datetime('now')`);
    put('rejected_by', req.user.id);
    put('rejected_reason', reasonText(b.rejectedReason));
  } else if (b.rejectedReason !== undefined) {
    put('rejected_reason', reasonText(b.rejectedReason));
    /* WER ENTFERNT, WIRD NICHT VERFASSER. */
    if (it.rejected_by == null && !removedReason) put('rejected_by', req.user.id);
  }
  if (b.tested !== undefined) put('tested', b.tested ? 1 : 0);
  if (b.productCategoryId !== undefined) put('product_category_id', b.productCategoryId);
  if (sets.length) {
    sets.push(`updated_at = datetime('now')`);
    db.prepare(`UPDATE items SET ${sets.join(', ')} WHERE id = ?`).run(...vals, req.params.id);
  }
  res.json(detail(req.params.id, req.user.id, localeOf(req)));
});

/* Die Zahlen fuer den Loeschdialog am Eintrag. Lesend, deshalb kein Eintrag
   in F_ROUTEN; der Waechter steht trotzdem davor. */
app.get('/api/items/:id/inventory', entryAuthorOnly, (req, res) => {
  const id = req.params.id, ich = req.user.id;
  const one = (sql, ...w) => db.prepare(sql).get(...w).n;
  res.json({
    // Zwei Zeilen, nicht eine Summe: ein Dialog, der "3 Fotos" sagt und dabei
    // ein Video mit wegwirft, verschweigt genau die Zeile, um derentwillen er
    // dasteht.
    photos: one("SELECT COUNT(*) n FROM photos WHERE item_id = ? AND kind != 'video'", id),
    videos: one("SELECT COUNT(*) n FROM photos WHERE item_id = ? AND kind = 'video'", id),
    ownFiles: one('SELECT COUNT(*) n FROM attachments WHERE item_id = ? AND user_id = ?', id, ich),
    foreignFiles: one('SELECT COUNT(*) n FROM attachments WHERE item_id = ? AND user_id IS NOT ?', id, ich),
    ownLinks: one('SELECT COUNT(*) n FROM links WHERE item_id = ? AND user_id = ?', id, ich),
    foreignLinks: one('SELECT COUNT(*) n FROM links WHERE item_id = ? AND user_id IS NOT ?', id, ich),
    ownComments: one('SELECT COUNT(*) n FROM comments WHERE item_id = ? AND user_id = ?', id, ich),
    foreignComments: one('SELECT COUNT(*) n FROM comments WHERE item_id = ? AND user_id IS NOT ?', id, ich),
    ownRatings: one('SELECT COUNT(*) n FROM ratings WHERE item_id = ? AND value > 0 AND user_id = ?', id, ich),
    foreignRatings: one('SELECT COUNT(*) n FROM ratings WHERE item_id = ? AND value > 0 AND user_id IS NOT ?', id, ich),
    ownTestDays: one('SELECT COUNT(*) n FROM test_days WHERE item_id = ? AND user_id = ?', id, ich),
    foreignTestDays: one('SELECT COUNT(*) n FROM test_days WHERE item_id = ? AND user_id IS NOT ?', id, ich)
  });
});

// Loeschen darf der Verfasser und der Admin.
app.delete('/api/items/:id', entryAuthorOnly, (req, res) => {
  // Das Loeschen geht durch den Papierkorb: der Eintrag wird serialisiert und
// in DERSELBEN Transaktion entfernt.
  intoTrash(req.params.id, req.user.id);
  reclaim();
  res.status(204).end();
});

/* ---- Fotos ---- */
// Der Waechter steht VOR multer: die Datei eines Fremden soll gar nicht erst
// eingelesen werden.
app.post('/api/items/:id/photos', entryAuthorOnly,
         capped(upload.array('photos', PHOTO_COUNT),
                { count: PHOTO_COUNT, bytes: PHOTO_MAX, key: 'server.uploadCap' }),
         async (req, res, next) => {
  try {
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
    /* ERST ALLE PRUEFEN UND ABLEITEN, DANN SCHREIBEN: scheitert die fuenfte von
       zehn Dateien, darf keine der vier davor in der Datenbank stehen. Eine
       ungeeignete Datei laesst gar nichts zurueck. */
    const ready = [];
    for (const f of req.files || []) {
      if (!await gridImage(f.buffer))
        return res.status(400).json({ error: t(localeOf(req), 'server.imagesOnly')});
      /* DIE ABLEITUNGEN KOMMEN AUS DER VORLAGE, NICHT AUS DER ABLAGEFASSUNG. */
      const v = await makeVariants(f.buffer, DEFAULT_CROP);
      /* STRG+V UND DATEIAUSWAHL SIND DERSELBE WEG: in `req.files` steht eine
         Datei und sonst nichts. Ein Feld im Formular waere eine Behauptung
         des Browsers darueber, wie das Archiv speichern soll. */
      /* DAS VERFAHREN GEHT ALS ARGUMENT HINEIN, und die Verzweigung
         hier ist damit weggefallen. */
      const start = await storeImage(f.buffer, f.mimetype, imageStore());
      ready.push({ mime: start.mime, data: start.data, thumb: v.thumb, medium: v.medium });
    }
    const into = db.prepare('INSERT INTO photos (item_id, mime_type, data, thumb, medium, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    db.transaction(() => {
      let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM photos WHERE item_id = ?')
        .get(req.params.id).m + 1;
      for (const p of ready)
        into.run(req.params.id, p.mime, p.data, p.thumb, p.medium, pos++);
    })();
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.user.id, localeOf(req)));
  } catch (e) { next(e); }
});

/* ---- Videos ---- EIGENE ROUTE, nicht die Fotoroute erweitert: deren
   fileFilter auf ^image\/ zu lockern naehme sie dem Fotoweg mit ab. */
// 20 MB und nicht 50, und die Zahl ist gemessen: 50 MB kosten beim Lesen aus
// der verschluesselten Datenbank eine halbe Sekunde -- mit dem ganzen Blob im
// Arbeitsspeicher, denn eine BLOB-Zeile wird nicht stueckweise gelesen.
const VIDEO_MAX = 20 * 1024 * 1024;
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: VIDEO_MAX },
  // Erste, grobe Schranke am gemeldeten Typ, wie am Fotoweg.
  fileFilter: (req, file, cb) => {
    const good = file.fieldname === 'video' ? /^video\//.test(file.mimetype)
                                           : /^image\//.test(file.mimetype);
    cb(good ? null : new Message('server.videoNeedsStill'), good);
  }
});

// Der Waechter steht VOR multer, wie am Fotoweg: die Datei eines Fremden soll
// gar nicht erst eingelesen werden.
app.post('/api/items/:id/videos', entryAuthorOnly,
  capped(videoUpload.fields([{ name: 'video', maxCount: 1 }, { name: 'stillFrame', maxCount: 1 }]),
         { count: 1, bytes: VIDEO_MAX, key: 'server.videoOne' }),
  async (req, res, next) => {
    try {
      if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
        return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
      const video = req.files?.video?.[0], stillFrame = req.files?.stillFrame?.[0];
      if (!video || !stillFrame)
        return res.status(400).json({ error: t(localeOf(req), 'server.videoStill')});
      /* DER INHALT ENTSCHEIDET, nicht die Endung im Namen und nicht der
         gemeldete Typ -- dieselbe Regel wie am Fotoweg, nur mit dem Erkenner,
         der auch beim Ausliefern entscheidet. */
      if (!Object.values(attachments.VIDEO_TYPES).includes(attachments.typeFromBytes(video.buffer)))
        return res.status(400).json({ error: t(localeOf(req), 'server.videosOnly')});
      // Das Standbild geht denselben Weg wie jedes Foto: was sharp nicht als
// Bild lesen kann, kommt nicht herein.
      if (!await gridImage(stillFrame.buffer))
        return res.status(400).json({ error: t(localeOf(req), 'server.stillNotImage')});
      // Die Dauer ist eine Angabe des Hochladenden wie der gemeldete Typ:
// gespeichert und angezeigt, nie tragend. Unsinniges wird zu NULL.
      const d = Math.round(Number(req.body.duration));
      const duration = Number.isFinite(d) && d > 0 && d <= 24 * 3600 ? d : null;
      /* AUCH DAS STANDBILD WIRD ZUGESCHNITTEN, mit den Vorgaben. */
      const v = await makeVariants(stillFrame.buffer, DEFAULT_CROP);
      /* Kaeme hier nichts heraus, bliebe die Zeile OHNE Standbild -- und zwar
         dauerhaft: das Nachruesten beim Start laesst Videozeilen aus, weil es
         sonst aus der Videodatei ableiten wuerde. */
      if (!v.thumb || !v.medium)
        return res.status(400).json({ error: t(localeOf(req), 'server.stillNoPreview')});
      // sort_order zaehlt weiter wie bisher: ein Video haengt sich hinten an
// die vorhandenen Zeilen, in derselben Nummerierung.
      const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM photos WHERE item_id = ?')
        .get(req.params.id).m + 1;
      db.prepare(`INSERT INTO photos (item_id, mime_type, data, thumb, medium, sort_order, kind, duration)
                  VALUES (?, ?, ?, ?, ?, ?, 'video', ?)`)
        .run(req.params.id, video.mimetype, video.buffer, v.thumb, v.medium, pos, duration);
      touch.run(req.params.id);
      res.status(201).json(detail(req.params.id, req.user.id, localeOf(req)));
    } catch (e) { next(e); }
  });

/* NUR DIE SPALTE, DIE GEBRAUCHT WIRD: `SELECT *` zieht an einer Videozeile
   bis zu 20 MB `data` mit, auch wenn nur die Kachel von rund 200 kB verlangt
   ist. Fehlt die Ableitung, wird das Original nachgeholt. */
const qPhotoBytes = {
  data:   db.prepare('SELECT id, kind, data AS bytes FROM photos WHERE id = ?'),
  thumb:  db.prepare('SELECT id, kind, thumb AS bytes FROM photos WHERE id = ?'),
  medium: db.prepare('SELECT id, kind, medium AS bytes FROM photos WHERE id = ?')
};
/* Der ausgelieferte Typ kommt aus den ersten Bytes, nie aus photos.mime_type:
   die Spalte ist eine Angabe des Hochladenden. */
app.get('/api/photos/:id/raw', (req, res) => {
  const want = req.query.size === 'thumb' ? 'thumb'
             : req.query.size === 'medium' ? 'medium' : 'data';
  const p = qPhotoBytes[want].get(req.params.id);
  if (!p) return res.status(404).end();
  let blob = p.bytes;
  let rangeable = p.kind === 'video';
  if (want !== 'data') {
    if (blob) rangeable = false;
    else blob = qPhotoBytes.data.get(req.params.id).bytes;
  }
  attachments.setImageHeader(res, blob, { name: `foto-${p.id}`, maxAge: 86400 });
  if (!rangeable) return res.send(blob);
  res.set('Accept-Ranges', 'bytes');
  const b = attachments.rangeOut(req.headers.range, blob.length);
  if (!b) return res.send(blob);
  // Ungueltiges wird abgewiesen, nicht zurechtgebogen: ein Abspieler, der
// etwas anderes bekommt als er verlangt hat, zeigt Bildsalat statt Fehler.
  if (b.invalid) {
    res.set('Content-Range', `bytes */${blob.length}`);
    return res.status(416).end();
  }
  res.set('Content-Range', `bytes ${b.from}-${b.to}/${blob.length}`);
  res.status(206).send(blob.slice(b.from, b.to + 1));
});

/* --- Der Ausschnitt der Vorschau: drei Werte, EINE Spanne ----------------
   Zwei Wege setzen sie, die Route darunter und der Import; sie unterscheiden
   sich in genau einem Punkt: WAS BEI UNSINN GESCHIEHT. */
const ZOOM_MIN = 100, ZOOM_MAX = 400;
const DISPLAY_VALUES = {
  focus_x: { min: 0, max: 100, fallback: 50, digits: 1 },
  focus_y: { min: 0, max: 100, fallback: 50, digits: 1 },
  // Ganze Prozent: ein Ausschnitt von 137,4 % ist keine Angabe, die jemand
// machen wollte, und der Schieber kann sie gar nicht erzeugen.
  zoom:    { min: ZOOM_MIN, max: ZOOM_MAX, fallback: ZOOM_MIN, digits: 0 }
};
// null heisst "das war keine Zahl". Was das wert ist, entscheidet der Rufer.
function displayValue(name, raw) {
  const g = DISPLAY_VALUES[name];
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const f = 10 ** g.digits;
  return Math.min(g.max, Math.max(g.min, Math.round(n * f) / f));
}

/* DIE VORGABE ALS ZUSCHNITT. */
const DEFAULT_CROP = { fx: DISPLAY_VALUES.focus_x.fallback,
                            fy: DISPLAY_VALUES.focus_y.fallback,
                            zoom: DISPLAY_VALUES.zoom.fallback };

/* ---- DIE KACHEL WIRD NACH DEM SPEICHERN NEU ERZEUGT ------------
   FRUEHER SCHRIEB DIESE ROUTE DREI ZAHLEN UND WAR FERTIG. */
const REFRESH_MS = 15000;
function refreshTile(id, done) {
  let out2 = false;
  const once = () => { if (!out2) { out2 = true; clearTimeout(clock); done(); } };
  const clock = setTimeout(once, REFRESH_MS);
  /* DIE UHR DARF DEN PROZESS NICHT AM LEBEN HALTEN: sie ist eine Schranke und
     kein Termin. Ohne unref() haengt ein Herunterfahren bis zu 15 Sekunden. */
  clock.unref?.();
  try { startBatchThread('crop', [{ id: Number(id) }], once); }
  catch (e) { logFail('Tile not renewed:', e.message); once(); }
}

/* Ausschnitt eines Fotos. Drei Zahlen -- und eine neue Kachel
   daraus. */
app.put('/api/photos/:id/focus', (req, res) => {
  const p = db.prepare('SELECT item_id, zoom FROM photos WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: t(localeOf(req), 'server.photoGone')});
  // Die Eintragsnummer kommt erst aus der Kindzeile -- deshalb die
// zweite Form desselben Aufrufs, nicht eine zweite Regel.
  if (!entryFree(req, res, p.item_id)) return;
  const x = displayValue('focus_x', req.body.x), y = displayValue('focus_y', req.body.y);
  if (x === null || y === null) return res.status(400).json({ error: t(localeOf(req), 'server.cropInvalid')});
  /* DER ZOOM DARF FEHLEN und behaelt dann seinen Wert. */
  let z = p.zoom;
  if (req.body.zoom !== undefined) {
    z = displayValue('zoom', req.body.zoom);
    if (z === null) return res.status(400).json({ error: t(localeOf(req), 'server.cropInvalid')});
  }
  db.prepare('UPDATE photos SET focus_x = ?, focus_y = ?, zoom = ? WHERE id = ?')
    .run(x, y, z, req.params.id);
  touch.run(p.item_id);
  /* ERST ERZEUGEN, DANN ANTWORTEN. */
  refreshTile(req.params.id, () => res.json(detail(p.item_id, req.user.id, localeOf(req))));
});

/* ---- Anhaenge ---- Die Sicherheit haengt vollstaendig an der Auslieferung,
   siehe attachments.js. */
const ATTACHMENT_MAX = 50 * 1024 * 1024;
const ATTACHMENT_COUNT = 20;
const attachmentUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: ATTACHMENT_MAX } });

/* HOCHLADEN DARF JEDER -- dieselbe Regel wie an der Linkzeile und aus
   demselben Grund: eine Datei erscheint nur dort, wo man sie hinsetzt. */
app.post('/api/items/:id/attachments',
         capped(attachmentUpload.array('files', ATTACHMENT_COUNT),
                { count: ATTACHMENT_COUNT, bytes: ATTACHMENT_MAX, key: 'server.uploadCap' }),
         (req, res, next) => {
  try {
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
    const da = db.prepare('SELECT COUNT(*) n FROM attachments WHERE item_id = ?').get(req.params.id).n;
    const fresh = (req.files || []).length;
    if (da + fresh > ATTACHMENT_COUNT)
      return res.status(400).json({ error: t(localeOf(req), 'server.fileCap', { cap: ATTACHMENT_COUNT })});
    let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM attachments WHERE item_id = ?')
      .get(req.params.id).m + 1;
    const into = db.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order, user_id)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const f of req.files || []) {
      // Nur der Name, nie ein Pfad: ein hochgeladenes "../../etwas" soll
// nichts weiter sein als ein merkwuerdiger Dateiname.
      const name = path.basename(String(f.originalname || 'datei')).slice(0, 200) || 'datei';
      into.run(req.params.id, name, String(f.mimetype || '').slice(0, 120), f.buffer.length, f.buffer,
              pos++, req.user.id);
    }
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.user.id, localeOf(req)));
  } catch (e) { next(e); }
});

// Herunterladen bzw. Einbetten. Einzige Stelle, die Anlagenbytes ausliefert.
app.get('/api/attachments/:id/raw', (req, res) => {
  const a = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).end();
  attachments.setHeader(res, a.filename, { inline: req.query.inline === '1' });
  res.send(a.data);
});

// Vorschau von Text und .docx: der Inhalt wird gelesen und als JSON
// geschickt, nie als Datei ausgeliefert.
app.get('/api/attachments/:id/preview', (req, res) => {
  const a = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: t(localeOf(req), 'server.fileGone')});
  const kind = attachments.previewKind(a.filename);
  if (kind === 'text') return res.json({ kind, ...attachments.textPreview(a.data) });
  if (kind === 'docx') {
    const v = attachments.docxPreview(a.data);
    if (!v) return res.status(422).json({ error: t(localeOf(req), 'server.fileNotText')});
    return res.json({ kind, ...v });
  }
  res.status(400).json({ error: t(localeOf(req), 'server.noTextPreview')});
});

/* LOESCHEN DARF DER HOCHLADENDE ODER DER ADMIN. */
app.delete('/api/attachments/:id', (req, res) => {
  const a = db.prepare('SELECT item_id, user_id FROM attachments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: t(localeOf(req), 'server.fileGone')});
  if (!mayChange(req, a.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM attachments WHERE id = ?').run(req.params.id);
  // Sortiernummern lueckenlos halten, wie bei Fotos und Links.
  const rest = db.prepare('SELECT id FROM attachments WHERE item_id = ? ORDER BY sort_order, id').all(a.item_id);
  const s2 = db.prepare('UPDATE attachments SET sort_order = ? WHERE id = ?');
  rest.forEach((r, i) => s2.run(i, r.id));
  touch.run(a.item_id);
  reclaim();
  res.json(detail(a.item_id, req.user.id, localeOf(req)));
});

app.put('/api/items/:id/photo-order', entryAuthorOnly, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE photos SET sort_order = ? WHERE id = ? AND item_id = ?');
  db.transaction(() => ids.forEach((pid, i) => s.run(i, pid, req.params.id)))();
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.user.id, localeOf(req)));
});

/* AUS DER ZEILE WIRD NUR DIE EINTRAGSNUMMER GEBRAUCHT.
   `SELECT *` zog data, thumb und medium mit, also bei einem Video bis zu
   20 MB, nur um danach zu loeschen. */
const qPhotoItem = db.prepare('SELECT item_id FROM photos WHERE id = ?');
app.delete('/api/photos/:id', (req, res) => {
  const p = qPhotoItem.get(req.params.id);
  if (!p) return res.status(404).json({ error: t(localeOf(req), 'server.photoGone')});
  if (!entryFree(req, res, p.item_id)) return;
  db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
  const rest = db.prepare('SELECT id FROM photos WHERE item_id = ? ORDER BY sort_order, id').all(p.item_id);
  const s = db.prepare('UPDATE photos SET sort_order = ? WHERE id = ?');
  rest.forEach((r, i) => s.run(i, r.id));
  touch.run(p.item_id);
  reclaim();
  res.status(204).end();
});

/* ---- Links ---- */
// Ein Wort ist keine Adresse.
const ADDRESS_PATTERN = [
  // name.endung, auch mehrstufig, auch mit Portnummer und Pfad dahinter
  /^[^\s/?#:]+(\.[^\s/?#:]+)*\.[a-z]{2,24}(:\d{1,5})?(?=$|[/?#])/i,
  // IP-Nummer -- im Heimnetz die haeufigere Schreibweise
  /^\d{1,3}(\.\d{1,3}){3}(:\d{1,5})?(?=$|[/?#])/,
  // Rechnername mit Portnummer, etwa nas:8080
  /^[a-z0-9][a-z0-9-]*:\d{1,5}(?=$|[/?#])/i
];
// Bewusst keine Liste echter Endungen: sie waere pflegebeduerftig und
// trotzdem lueckenhaft.
function normalizeLink(raw) {
  const address = String(raw || '').trim();
  if (!address) return '';
  if (/^https?:\/\//i.test(address)) return address;
  return ADDRESS_PATTERN.some(m => m.test(address)) ? 'https://' + address : address;
}

/* EINTRAGEN DARF JEDER -- wie den Kommentar, den Testtag und die Bewertung. */
app.post('/api/items/:id/links', (req, res) => {
  const url = normalizeLink(req.body.url);
  if (!url) return res.status(400).json({ error: t(localeOf(req), 'server.linkMissing')});
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
  const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM links WHERE item_id = ?')
    .get(req.params.id).m + 1;
  db.prepare('INSERT INTO links (item_id, url, sort_order, user_id) VALUES (?, ?, ?, ?)')
    .run(req.params.id, url, pos, req.user.id);
  touch.run(req.params.id);
  res.status(201).json(detail(req.params.id, req.user.id, localeOf(req)));
});

/* SORTIEREN BLEIBT BEIM EINTRAGSVERFASSER UND ADMIN -- ausdruecklich, nicht
   aus Versehen: die Reihenfolge aendert keine Aussage und ist umkehrbar,
   dieselbe Ueberlegung wie beim Anpinnen eines Kommentars. */
app.put('/api/items/:id/link-order', entryAuthorOnly, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE links SET sort_order = ? WHERE id = ? AND item_id = ?');
  db.transaction(() => ids.forEach((lid, i) => s.run(i, lid, req.params.id)))();
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.user.id, localeOf(req)));
});

/* LOESCHEN DARF DER EINTRAGER ODER DER ADMIN. */
app.delete('/api/links/:id', (req, res) => {
  const l = db.prepare('SELECT * FROM links WHERE id = ?').get(req.params.id);
  if (!l) return res.status(404).json({ error: t(localeOf(req), 'server.linkGone')});
  if (!mayChange(req, l.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM links WHERE id = ?').run(req.params.id);
  const rest = db.prepare('SELECT id FROM links WHERE item_id = ? ORDER BY sort_order, id').all(l.item_id);
  const s = db.prepare('UPDATE links SET sort_order = ? WHERE id = ?');
  rest.forEach((r, i) => s.run(i, r.id));
  touch.run(l.item_id);
  res.status(204).end();
});

/* ---- Testtage ---- */
app.post('/api/items/:id/test-days', (req, res) => {
  const day = String(req.body.day || '').trim();
  const rating = Number(req.body.rating);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return res.status(400).json({ error: t(localeOf(req), 'server.dateInvalid')});
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: t(localeOf(req), 'server.gradeRange')});
  const today = new Date().toISOString().slice(0, 10);
  if (day > today) return res.status(400).json({ error: t(localeOf(req), 'server.dateFuture')});
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});

  // Der eigene Tag.
  const existing = db.prepare('SELECT id FROM test_days WHERE item_id = ? AND day = ? AND user_id = ?')
    .get(req.params.id, day, req.user.id);
  // Das Konfliktziel MUSS dem UNIQUE der Tabelle entsprechen; passt es nicht,
  // lehnt SQLite die Anweisung rundheraus ab ("ON CONFLICT clause does not
  // match any PRIMARY KEY or UNIQUE constraint") -- der Eintrag stuerbe mit
  // 500, statt still falsch zu laufen.
  db.prepare(`INSERT INTO test_days (item_id, day, rating, user_id) VALUES (?, ?, ?, ?)
              ON CONFLICT(item_id, day, user_id) DO UPDATE SET rating = excluded.rating`)
    .run(req.params.id, day, rating, req.user.id);
  db.prepare(`UPDATE items SET tested = 1, updated_at = datetime('now') WHERE id = ?`).run(req.params.id);
  res.status(201).json({ ...detail(req.params.id, req.user.id, localeOf(req)), replaced: !!existing });
});

// Die NOTE eines fremden Testtags aendert niemand, auch der Admin nicht.
app.put('/api/test-days/:id', (req, res) => {
  const rating = Number(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: t(localeOf(req), 'server.gradeRange')});
  const testDay = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!testDay) return res.status(404).json({ error: t(localeOf(req), 'server.dayUnknown')});
  if (!selfOnly(req, testDay.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('UPDATE test_days SET rating = ? WHERE id = ?').run(rating, req.params.id);
  touch.run(testDay.item_id);
  res.json(detail(testDay.item_id, req.user.id, localeOf(req)));
});

app.delete('/api/test-days/:id', (req, res) => {
  const testDay = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!testDay) return res.status(404).json({ error: t(localeOf(req), 'server.dayUnknown')});
  // Loeschen darf der Admin, aendern nicht -- der Unterschied ist die ganze
// Regel aus Teil IV.
  if (!mayChange(req, testDay.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM test_days WHERE id = ?').run(req.params.id);
  touch.run(testDay.item_id);
  res.json(detail(testDay.item_id, req.user.id, localeOf(req)));
});

// Tags am Testtag. Derselbe Vorrat wie am Eintrag -- ein hier neu getippter
// Name legt den Tag auch fuer die Eintraege an.
app.post('/api/test-days/:id/tags', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.tagMissing')});
  const testDay = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!testDay) return res.status(404).json({ error: t(localeOf(req), 'server.dayUnknown')});
  // Ein Tag am Testtag gehoert dem Testtag und teilt dessen Eigentuemer
// (deshalb hat er keine eigene user_id).
  if (!selfOnly(req, testDay.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  /* AM TESTTAG GIBT ES KEINE WOLKE -- die Eingabe ist der einzige
     Zuweisungsweg und bleibt deshalb auf dem Bildschirm stehen. */
  let date = findTag(name);
  if (!date) {
    if (!mayCreate(req, 'tagsFreeCreate')) return res.status(403).json({ error: t(localeOf(req), DENIED_TAG_NEW)});
    date = createTag(name);
  }
  db.prepare('INSERT OR IGNORE INTO test_day_tags (test_day_id, tag_id) VALUES (?, ?)').run(testDay.id, date.id);
  touch.run(testDay.item_id);
  res.status(201).json(detail(testDay.item_id, req.user.id, localeOf(req)));
});

app.delete('/api/test-days/:id/tags/:tagId', (req, res) => {
  const testDay = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!testDay) return res.status(404).json({ error: t(localeOf(req), 'server.dayUnknown')});
  if (!selfOnly(req, testDay.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM test_day_tags WHERE test_day_id = ? AND tag_id = ?').run(testDay.id, req.params.tagId);
  touch.run(testDay.item_id);
  res.json(detail(testDay.item_id, req.user.id, localeOf(req)));
});

/* ---- Bewertungen ---- */
// Hier steht bewusst KEIN Waechter: beide Wege treffen baulich nur die eigene
// Zeile -- das ON CONFLICT trifft (item_id, criterion_id, user_id), das
// DELETE traegt "AND user_id = ?".
/* VOR DEM TEST WIRD NICHT BEWERTET. */
const qCritPhase = db.prepare('SELECT phase FROM rating_criteria WHERE id = ?');
const qItemTested = db.prepare('SELECT tested FROM items WHERE id = ?');

app.put('/api/items/:id/ratings', (req, res) => {
  const v = Math.max(0, Math.min(5, Number(req.body.value) || 0));
  /* GEPRUEFT WIRD NUR EIN WERT GROESSER NULL. */
  if (v > 0) {
    const crit = qCritPhase.get(req.body.criterionId);
    const entry = qItemTested.get(req.params.id);
    if (crit && crit.phase === 'after' && entry && !entry.tested)
      return res.status(400).json({
        error: t(localeOf(req), 'server.ratingBeforeTest')});
  }
  // Die eigene Bewertung. Konfliktziel und UNIQUE in db.js gehoeren
// zusammen -- siehe die Bemerkung beim Testtag eine Bildschirmseite hoeher.
  /* DER ZEITPUNKT GEHT BEI BEIDEN WEGEN MIT -- beim Anlegen UND beim
     Ueberschreiben. */
  db.prepare(`INSERT INTO ratings (item_id, criterion_id, value, user_id, set_at)
              VALUES (?, ?, ?, ?, datetime('now'))
              ON CONFLICT(item_id, criterion_id, user_id)
              DO UPDATE SET value = excluded.value, set_at = excluded.set_at`)
    .run(req.params.id, req.body.criterionId, v, req.user.id);
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.user.id, localeOf(req)));
});

/* HIER STAND `DELETE /api/items/:id/ratings` -- das Sammel-Zuruecksetzen
   hinter dem Knopf „Meine Bewertung zuruecksetzen". */

/* Wer welchen Wert vergeben hat -- die Ansicht des Admins. NUR DER ADMIN: wer
   wie bewertet hat, ist eine Angabe ueber einzelne Personen. */
app.get('/api/items/:id/votes', adminOnly, (req, res) => {
  const votes = votesPerCriterion(req.params.id, req.user.id, authorCard());
  res.json([...votes].map(([criterion_id, list]) => ({ criterion_id, votes: list })));
});

/* Eine EINZELNE fremde Bewertung entfernen. */
app.delete('/api/ratings/:id', (req, res) => {
  const r = db.prepare('SELECT id, item_id, user_id FROM ratings WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: t(localeOf(req), 'server.ratingUnknown')});
  if (!mayChange(req, r.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM ratings WHERE id = ?').run(r.id);
  touch.run(r.item_id);
  res.json(detail(r.item_id, req.user.id, localeOf(req)));
});

/* ---- Kommentare ---- */
// Alles ausser 'report' ist eine Notiz -- so gelten auch aeltere
// Exportdateien ohne diese Angabe als gewoehnliche Notiz.
const KIND_VALUES = ['note', 'report', 'task', 'done'];
const kindValue = (v) => (KIND_VALUES.includes(v) ? v : 'note');

// Bilder in Kommentaren. Anders als bei den Anhaengen ist hier NUR Bild
// erlaubt: jede Datei geht durch sharp und wird neu kodiert gespeichert.
const IMAGE_MAX = 20 * 1024 * 1024;
const IMAGE_COUNT = 6;
const commentImageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: IMAGE_MAX } });

/* DAS KOMMENTARBILD IST EBENFALLS WEBP. */
async function encodeCommentImage(buf) {
  const big = await sharp(buf, { failOn: 'none' }).rotate()
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: VARIANTS.medium.q, effort: 4 }).toBuffer();
  const small = await sharp(buf, { failOn: 'none' }).rotate()
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: VARIANTS.thumb.q, effort: 4 }).toBuffer();
  return { big, small };
}

function saveCommentImages(commentId, files) {
  let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM comment_images WHERE comment_id = ?')
    .get(commentId).m + 1;
  const into = db.prepare(`INSERT INTO comment_images (comment_id, filename, data, thumb, sort_order)
                          VALUES (?, ?, ?, ?, ?)`);
  for (const d of files) into.run(commentId, d.name, d.big, d.small, pos++);
}

// Aus hochgeladenen Dateien kodierte Bilder machen. Gibt null zurueck, wenn
// eine Datei kein lesbares Bild ist -- dann wird gar nichts gespeichert.
async function encodeAll(files) {
  const out = [];
  for (const f of files || []) {
    try {
      const { big, small } = await encodeCommentImage(f.buffer);
      out.push({ name: path.basename(String(f.originalname || 'bild.jpg')).slice(0, 200), big, small });
    } catch { return { error: 'server.imageUnreadable', values: { name: f.originalname } }; }
  }
  return { images: out };
}

// Bilder kommen zusammen mit dem Text, nicht danach: sonst entstuende bei
// einem Abbruch ein leerer Kommentar mit Bildern.
/* ---- DAS FAELLIGKEITSDATUM ------------------------ EIN
   ORT, DER ES ZURECHTRUECKT, und beide Wege (Anlegen und Aendern) rufen ihn. */
const DUE_FORM = /^\d{4}-\d{2}-\d{2}$/;
function dueValue(raw) {
  if (raw === null) return { value: null };
  const text = String(raw).trim();
  if (!text) return { value: null };
  if (!DUE_FORM.test(text)) return { error: 'server.dueInvalid' };
  const [year, month, day] = text.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  // Der Kalender selbst: schiebt er den Tag, gab es ihn nicht.
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day)
    return { error: 'server.dueInvalid' };
  return { value: text };
}

app.post('/api/items/:id/comments',
         capped(commentImageUpload.array('images', IMAGE_COUNT),
                { count: IMAGE_COUNT, bytes: IMAGE_MAX, key: 'server.uploadCap' }),
         async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: t(localeOf(req), 'server.textMissing')});
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});

    const k = await encodeAll(req.files);
    if (k.error) return res.status(400).json({ error: t(localeOf(req), k.error, k.values) });

    const pinned = req.body.pinned === '1' || req.body.pinned === true;
    /* DAS DATUM DARF SCHON BEIM ANLEGEN MITKOMMEN. */
    const due = dueValue(req.body.dueDate === undefined ? null : req.body.dueDate);
    if (due.error) return res.status(400).json({ error: t(localeOf(req), due.error) });
    // Der Schreibende ist der Verfasser.
    const fresh = db.prepare('INSERT INTO comments (item_id, text, kind, pinned, user_id, due_date) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.params.id, text, kindValue(req.body.kind), pinned ? 1 : 0, req.user.id, due.value);
    /* DIE MARKIERUNGEN ENTSTEHEN MIT DEM TEXT. */
    setMentions(fresh.lastInsertRowid, text);
    if (k.images.length) saveCommentImages(fresh.lastInsertRowid, k.images);
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.user.id, localeOf(req)));
  } catch (e) { next(e); }
});

// Text und Merkmale lassen sich einzeln aendern: die Umschalter in der
// Kopfzeile schicken nur ihr eigenes Feld, ohne den Text anzufassen.
app.put('/api/comments/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: t(localeOf(req), 'server.commentGone')});

  /* DIE ZWEITE ROUTE MIT ZWEI RECHTEKLASSEN IN EINEM RUMPF. TEXT -- nur der
     Verfasser, AUCH DER ADMIN NICHT. */
  if (req.body.text !== undefined && !selfOnly(req, c.user_id))
    return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  /* DAS DATUM GEHOERT ZUR ART UND NICHT ZUM TEXT: es ist eine
     Angabe UEBER die Aufgabe und keine Aussage IN ihr, und deshalb darf es
     dieselbe Runde setzen, die auch die Aufgabenmarke setzt. */
  if ((req.body.kind !== undefined || req.body.pinned !== undefined
       || req.body.dueDate !== undefined) && !mayChange(req, c.user_id))
    return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  // GEPRUEFT VOR DEM ERSTEN UPDATE, wie die Rechtefragen darueber: eine
// Absage, die den Text schon gewechselt hat, waere schlimmer als keine.
  let due = null;
  if (req.body.dueDate !== undefined) {
    due = dueValue(req.body.dueDate);
    if (due.error) return res.status(400).json({ error: t(localeOf(req), due.error) });
  }

  if (req.body.text !== undefined) {
    const text = String(req.body.text).trim();
    if (!text) return res.status(400).json({ error: t(localeOf(req), 'server.textMissing')});
    db.prepare(`UPDATE comments SET text = ?, updated_at = datetime('now') WHERE id = ?`).run(text, c.id);
    /* UND SIE WERDEN NEU AUFGELOEST. */
    setMentions(c.id, text);
  }
  // Eine Aenderung der Merkmale ist keine Bearbeitung des Textes und setzt
  // deshalb kein "bearbeitet" -- sonst stuende das an jedem angepinnten
  // Kommentar, ohne dass jemand am Text war.
  if (req.body.kind !== undefined)
    db.prepare('UPDATE comments SET kind = ? WHERE id = ?').run(kindValue(req.body.kind), c.id);
  if (req.body.pinned !== undefined)
    db.prepare('UPDATE comments SET pinned = ? WHERE id = ?').run(req.body.pinned ? 1 : 0, c.id);
  // Wie die beiden darueber: keine Bearbeitung des Textes, also kein
// „bearbeitet" -- ein gerücktes Datum ist keine geaenderte Aussage.
  if (due) db.prepare('UPDATE comments SET due_date = ? WHERE id = ?').run(due.value, c.id);

  touch.run(c.item_id);
  res.json(detail(c.item_id, req.user.id, localeOf(req)));
});

// Bilder an einem bestehenden Kommentar nachreichen.
app.post('/api/comments/:id/images',
         capped(commentImageUpload.array('images', IMAGE_COUNT),
                { count: IMAGE_COUNT, bytes: IMAGE_MAX, key: 'server.uploadCap' }),
         async (req, res, next) => {
  try {
    const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
    if (!c) return res.status(404).json({ error: t(localeOf(req), 'server.commentGone')});
    // HINZUFUEGEN nur der Verfasser -- ein Bild an einem fremden Kommentar
// waere ein Zusatz zu einer fremden Aussage.
    if (!selfOnly(req, c.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
    const da = db.prepare('SELECT COUNT(*) n FROM comment_images WHERE comment_id = ?').get(c.id).n;
    if (da + (req.files || []).length > IMAGE_COUNT)
      return res.status(400).json({ error: t(localeOf(req), 'server.imageCap', { cap: IMAGE_COUNT })});
    const k = await encodeAll(req.files);
    if (k.error) return res.status(400).json({ error: t(localeOf(req), k.error, k.values) });
    /* Anhaengen IST Bearbeiten -- und hierher kommt nach der Klemme oben nur
       der Verfasser. */
    if (k.images.length) {
      saveCommentImages(c.id, k.images);
      commentEdited.run(c.id);
    }
    touch.run(c.item_id);
    res.status(201).json(detail(c.item_id, req.user.id, localeOf(req)));
  } catch (e) { next(e); }
});

// LOESCHEN darf der Admin, hinzufuegen nicht.
app.delete('/api/comment-images/:id', (req, res) => {
  const b = db.prepare(`SELECT ci.id, ci.comment_id, c.item_id, c.user_id FROM comment_images ci
                        JOIN comments c ON c.id = ci.comment_id WHERE ci.id = ?`).get(req.params.id);
  if (!b) return res.status(404).json({ error: t(localeOf(req), 'server.imageGone')});
  if (!mayChange(req, b.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM comment_images WHERE id = ?').run(b.id);
  /* HIER GILT GENAU EINES VON BEIDEN, NIE BEIDES UND NIE KEINES -- deshalb
     ein if/else und nicht zwei Bedingungen nebeneinander. */
  if (b.user_id !== req.user.id)
    db.prepare('UPDATE comments SET images_removed = images_removed + 1 WHERE id = ?').run(b.comment_id);
  else
    commentEdited.run(b.comment_id);
  // Sortiernummern lueckenlos halten, wie bei Fotos, Links und Dateien.
  const rest = db.prepare('SELECT id FROM comment_images WHERE comment_id = ? ORDER BY sort_order, id').all(b.comment_id);
  const u = db.prepare('UPDATE comment_images SET sort_order = ? WHERE id = ?');
  rest.forEach((r, i) => u.run(i, r.id));
  touch.run(b.item_id);
  reclaim();
  res.json(detail(b.item_id, req.user.id, localeOf(req)));
});

// Bild eines Kommentars ausliefern. Dieselben Regeln wie bei den Anhaengen.
/* DER KOPF KOMMT AUS DEN BYTES UND NICHT AUS EINEM ERFUNDENEN DATEINAMEN. */
app.get('/api/comment-images/:id/raw', (req, res) => {
  const b = db.prepare('SELECT * FROM comment_images WHERE id = ?').get(req.params.id);
  if (!b) return res.status(404).end();
  const blob = req.query.size === 'thumb' && b.thumb ? b.thumb : b.data;
  attachments.setImageHeader(res, blob, { name: `bild-${b.id}` });
  res.send(blob);
});

app.delete('/api/comments/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  // Ein Kommentar, den es nicht gibt, antwortet weiterhin mit 204 -- das war
// schon vorher so und ist keine Rechtefrage.
  if (c && !mayChange(req, c.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  if (c) touch.run(c.item_id);
  res.status(204).end();
});

/* ---- Offene Aufgaben quer ueber alle Eintraege ---------------------------
   Eine LESENDE Route ohne Waechter: wer angemeldet ist, sieht die Kommentare
   ohnehin in jedem Eintrag. */
/* ---- DIE ORDNUNG ----------------------------------
   ERST DAS DATUM, DANN DER EINTRAG. */
const qOpenTasks = db.prepare(`
  SELECT c.id, c.text, c.created_at, c.user_id, c.item_id, c.due_date,
         i.title, i.updated_at
    FROM comments c JOIN items i ON i.id = c.item_id
   WHERE c.kind = 'task'
   ORDER BY CASE WHEN c.due_date IS NULL THEN 1 ELSE 0 END,
            c.due_date,
            i.updated_at DESC, c.item_id, c.id`);
app.get('/api/open', (req, res) => {
  const card = authorCard();
  res.json(qOpenTasks.all().map(z => ({
    id: z.id, text: z.text, created_at: z.created_at,
    dueDate: z.due_date || null,
    item: { id: z.item_id, title: z.title },
    mine: z.user_id === req.user.id,
    author: authorFrom(card, z.user_id)
  })));
});

/* ---- Kennzahlen ---- */
// NUR DER ADMIN. Die Zahlen sagen, wie gross der Bestand und wie belegt die
// Datenbank ist -- eine Aussage ueber die Instanz als Ganzes.
app.get('/api/stats', adminOnly, (req, res) => {
  let dbBytes = 0;
  try { db.pragma('wal_checkpoint(PASSIVE)'); dbBytes = fs.statSync(DB_FILE).size; } catch {}
  /* DIE AUFTEILUNG DES BILDBESTANDS. */
  const kinds = qImageKinds.all().map(z => z.a);
  const p = { n: 0, o: 0 }, vi = { n: 0, o: 0 };
  const imageFormats = {};
  /* DIE EXPORTGROESSE DER BILDER FAELLT HIER MIT AB. */
  let exportPhotoBytes = 0, exportVideoBytes = 0;
  for (const kind of kinds) {
    const z = qPerKind.get(kind);
    if (kind === 'video') {
      vi.n += z.n; vi.o += z.o;
      exportVideoBytes += qVideoExportBytes.get(kind).n;
      continue;
    }
    p.n += z.n; p.o += z.o;
    exportPhotoBytes += z.o;
    /* AUSDRUECKLICH OHNE VIDEOS: bei einer Videozeile traegt `data` die
       Videodatei -- ihr Format gehoert in keine Zeile, die „Fotos am Eintrag
       nach Format" ueberschrieben ist. */
    for (const g of qPerFormat.all(kind)) {
      const k = formatFromMime(g.m);
      const f = imageFormats[k] || (imageFormats[k] = { count: 0, bytes: 0 });
      f.count += g.n; f.bytes += g.o;
    }
  }
  const an = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(size),0) AS o FROM attachments').get();
  /* Der Papierkorb steht GETRENNT da, aus demselben Grund wie die Videos:
     sonst wundert sich jemand ueber eine Datenbank, die nach dem Aufraeumen
     groesser ist als vorher. */
  const pk = db.prepare(`SELECT COUNT(*) AS n,
      COALESCE(SUM(length(content)),0) + COALESCE((SELECT SUM(length(data)) FROM trash_bytes),0) AS o
    FROM trash`).get();
  /* Kommentarbilder standen bisher in keiner Zeile. */
  const ci = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) + COALESCE(SUM(length(thumb)),0) AS o FROM comment_images').get();
  res.json({
    version: VERSION,
    // Der Fingerprint steht hier und nicht in /api/config: er ist dieselbe
    // Art Aussage wie die Zahlen darunter -- eine ueber die INSTANZ ALS
    // GANZES.
    fingerprint: FINGERPRINT.value,
    /* DIE ACHTZEHN EINZELWERTE. */
    fingerprintFiles: FINGERPRINT.files,
    /* WAS UNTER DER HAUBE LAEUFT -- abgelesen in db.js, hier nur
       durchgereicht. */
    method: { ...method(), passwords: 'scrypt' },
    dbBytes, photoCount: p.n, photoBytes: p.o,
    videoCount: vi.n, videoBytes: vi.o,
    attachmentCount: an.n, attachmentBytes: an.o,
    trashCount: pk.n, trashBytes: pk.o,
    commentImageCount: ci.n, commentImageBytes: ci.o,
    /* DIE FOTOS AM EINTRAG NACH FORMAT -- die Auskunft, um derentwillen die
       Abfrage oben zusammengelegt wurde. */
    imageFormats,
    /* WIE WEIT DIE UMSTELLUNG IST -- ODER null. */
    conversion: batchState('conversion'),
    /* DER ZWEITE LAUF, und er steht als EIGENES Feld daneben und
       nicht im selben: die Karte muss auseinanderhalten koennen, was gerade
       laeuft. */
    geometry: batchState('geometry'),
    /* DIE ERWARTETE EXPORTGROESSE, je Schalter getrennt. */
    export: {
      envelope: exchangeEnvelopeBytes(),
      /* DIE BILDBYTES KOMMEN AUS DER SCHLEIFE OBEN und nicht aus zwei eigenen
         Abfragen. */
      ...exchangeParts({ withFiles: true }),
      photos: Math.round(exportPhotoBytes * 4 / 3),
      videos: Math.round(exportVideoBytes * 4 / 3),
      /* DREI ZAHLEN UND NICHT ZWEI, weil sie drei verschiedene Dinge sagen:
         `warnAb` ab hier steht ein Hinweis -- geschaetzt, nimmt nichts weg. */
      warnFrom: EXCHANGE_WARN, limit: EXCHANGE_MAX, string: EXCHANGE_STRING
    },
    itemCount: db.prepare('SELECT COUNT(*) n FROM items').get().n,
    commentCount: db.prepare('SELECT COUNT(*) n FROM comments').get().n,
    linkCount: db.prepare('SELECT COUNT(*) n FROM links').get().n,
    testDayCount: db.prepare('SELECT COUNT(*) n FROM test_days').get().n,
    keyFromEnv,
    // Nur wenn der Schluessel ohnehin schon neben der Datenbank liegt.
    keyHex: (keyFromEnv || !isOwner(req)) ? null : keyHex
  });
});

/* Den vorhandenen Bestand nachziehen -- der Knopf aus dem Reiter „Datenbank". */
app.post('/api/images/convert', ownerOnly, secondConfirmNeeded('images'), (req, res) => {
  /* ZWEIMAL DRUECKEN STARTET NICHT ZWEIMAL. */
  if (batchStates.conversion && batchStates.conversion.running)
    return res.status(409).json({ error: t(localeOf(req), 'server.convertRunning')});
  const rows = qConvertRows.all();
  /* DREI ZAHLEN STATT VIER: `derived` zaehlte die neu gerechneten
     Ableitungspaare, und die zweite Haelfte des Laufs ist mit jener Runde
     gefallen. */
  batchStates.conversion = { running: true, total: rows.length, done: 0,
                                 converted: 0, stayed: 0, freed: 0 };
  logLine(`Inventory run started: ${rows.length} photo row(s) ` +
    `are looked at; the storage method is "${imageStore()}".`);
  res.status(202).json(batchState('conversion'));
  /* DIE ANTWORT IST SCHON HINAUS, WENN DER THREAD ANFAENGT --
     laeuft die Schleife nicht mehr hier, sondern in batchrun.js. */
  /* DAS VERFAHREN REIST MIT UND WIRD NICHT IM THREAD GELESEN. */
  startBatchThread('conversion', rows, null, imageStore());
});

/* ================= Das Austauschformat ================= EINE ABBILDUNG JE
   EINTRAG, und sie steht hier statt mitten in der Exportroute: gerufen wird
   sie an drei Stellen -- voller Export, Einzelexport, Papierkorb. */

// Die Formatnummer ist eine AUSSAGE, keine Bedingung: weder der Import noch
// die Oberflaeche lesen sie.
/* VIERZEHN: die Namen der Kriterien und Kategorien JE
   SPRACHE gehen mit hinaus. */
/* UND DIE ERSTELLUNGSSPRACHE DER GRUNDZEILE -- Formatnummer 15. Keine Zeile
   entsteht ohne Sprachvermerk, und der Import ist ein Anlegeweg wie jeder
   andere. */
/* UND DAS FAELLIGKEITSDATUM AM KOMMENTAR -- Formatnummer 16. */
/* UND DIE PROGRAMMFASSUNG NEBEN DER FORMATNUMMER -- Nummer 17,
   Frage F16 jener Runde. */
/* UND DIE AUSZEICHNUNG IN KOMMENTAR UND BESCHREIBUNG -- Nummer 18. Die
   Nummer ist ein Hinweis und keine Schranke: eine aeltere Fassung nimmt die
   Datei herein und zeigt die Marken als Text. */
const EXCHANGE_FORMAT = 18;

/* DIE AELTESTE DATEI, DIE NOCH HEREINKOMMT, Frage F15. WARUM ES
   EINE UNTERGRENZE GIBT. */
const EXCHANGE_FORMAT_MIN = 14;

/* DIE NAMEN JE SPRACHE, WIE SIE IN DIE DATEI GEHEN. */
function exchangeNames(sql) {
  const out = {};
  for (const z of db.prepare(sql).all())
    (out[z.language] || (out[z.language] = {}))[z.base] = z.name;
  return out;
}
const exchangeCriterionNames = () => exchangeNames(`
  SELECT n.language, c.name AS base, n.name FROM criterion_names n
  JOIN rating_criteria c ON c.id = n.criterion_id
  ORDER BY n.language, c.sort_order, c.id`);
const exchangeCategoryNames = () => exchangeNames(`
  SELECT n.language, c.name AS base, n.name FROM category_names n
  JOIN product_categories c ON c.id = n.category_id
  ORDER BY n.language, c.name COLLATE NOCASE`);

/* IN WELCHER SPRACHE DER GRUNDNAME GESCHRIEBEN IST, Formatnummer 15.
   { <name der grundzeile>: <sprachkennung> }, ueber den NAMEN wie
   criteriaWeights daneben. */
const exchangeLanguages = (sql) => Object.fromEntries(
  db.prepare(sql).all().map(z => [z.name, z.language]));
const exchangeCriterionLanguages = () => exchangeLanguages(
  'SELECT name, language FROM rating_criteria WHERE language IS NOT NULL ORDER BY sort_order, id');
const exchangeCategoryLanguages = () => exchangeLanguages(
  'SELECT name, language FROM product_categories WHERE language IS NOT NULL ORDER BY name COLLATE NOCASE');

// Die Grenze, an der eine Exportdatei zerbraeche, mit Luft davor.
const EXCHANGE_STRING = require('buffer').constants.MAX_STRING_LENGTH;
const EXCHANGE_MAX = Math.floor(EXCHANGE_STRING * 0.9);

/* Der Wert, ab dem die Instanz WARNT -- deutlich unter der Grenze, an der sie
   ABSAGT. */
const EXCHANGE_WARN = 300 * 1024 * 1024;

// Der Trichter der Exportdatei. Base64 blaeht um ein Drittel auf, und das ist
// der Preis dafuer, dass eine Textdatei Bytes tragen kann.
const FUNNEL_FILE = { extension: '_base64', take: (buf) => buf.toString('base64') };

/* Der Trichter des Papierkorbs. */
function funnelStore(collector) {
  return { extension: '_ref', take: (buf) => { collector.push(buf); return collector.length - 1; } };
}

/* Die Gegenrichtung, einmal fuer beide Formen. */
function bytesOf(o, name, source) {
  const b64 = o[name + '_base64'];
  if (b64) return Buffer.from(b64, 'base64');
  const nr = o[name + '_ref'];
  if (source && nr != null) return source(nr);
  return null;
}

/* EINE Karte von der Id auf den Namen, einmal je Aufruf gebaut und an vier
   Stellen benutzt -- statt vier LEFT JOINs auf users. */
function authorNames() {
  const names = new Map(db.prepare('SELECT id, username FROM users').all().map(u => [u.id, u.username]));
  return (id) => (id == null ? null : (names.get(id) || null));
}

/* Die Lage, in der ein Paket entsteht: wessen Favoriten gelten, wie die Bytes
   hinausgehen und welche Schalter stehen. */
function bundleState(userId, switches = {}) {
  return {
    authorName: authorNames(),
    pins: new Set(qMyPins.all(userId).map(p => p.item_id)),
    funnel: switches.funnel || FUNNEL_FILE,
    withPhotos: switches.withPhotos !== false,
    withFiles: !!switches.withFiles,
    withVideos: !!switches.withVideos
  };
}

// Die Abbildung je Eintrag. Sie kommt genau einmal vor; ein Waechter im
// Pruefstand haelt das fest.
/* ---- DIE SECHS ABFRAGEN DES EXPORTS -------------------------------------
   Vorbereitet und nicht im Rumpf darunter: dort wuerde ein Export ueber
   tausend Eintraege sechstausend Mal denselben Text uebersetzen. */
const qBundleTestDays = db.prepare(
  'SELECT id, day, rating, user_id FROM test_days WHERE item_id = ? ORDER BY day, id');
const qBundleRatings = db.prepare(`SELECT c.name, r.value, r.user_id FROM ratings r
                         JOIN rating_criteria c ON c.id = r.criterion_id WHERE r.item_id = ?
                         ORDER BY c.sort_order, c.id, r.user_id`);
const qBundleComments = db.prepare(
  'SELECT id, text, kind, pinned, created_at, updated_at, user_id, due_date FROM comments WHERE item_id = ? ORDER BY id');
const qBundleCommentImages = db.prepare(
  'SELECT filename, data FROM comment_images WHERE comment_id = ? ORDER BY sort_order, id');
const qBundlePhotos = db.prepare(
  'SELECT mime_type, data, thumb, medium, focus_x, focus_y, zoom, kind, duration FROM photos WHERE item_id = ? ORDER BY sort_order, id');
const qBundleAttachments = db.prepare(
  'SELECT filename, mime_type, data, user_id FROM attachments WHERE item_id = ? ORDER BY sort_order, id');

function entryAsBundle(it, situation) {
  const { authorName, pins, funnel, withPhotos, withFiles, withVideos } = situation;
  const extension = funnel.extension;
  const o = {
    title: it.title, description: it.description,
    rejected: !!it.rejected, tested: !!it.tested, favorite: pins.has(it.id),
    // Der Eintrag selbst nennt seinen Verfasser: ohne dieses Feld schoebe
// eine ersetzende Wiederherstellung ALLE Eintraege dem Einspielenden zu.
    author: authorName(it.user_id),
    /* WANN, WARUM UND VON WEM abgelehnt wurde. */
    rejected_at: it.rejected_at, rejected_reason: it.rejected_reason,
    rejected_author: authorName(it.rejected_by),
    created_at: it.created_at, updated_at: it.updated_at,
    category: it.product_category_id ? qCat.get(it.product_category_id).name : null,
    tags: qTags.all(it.id).map(x => x.name),
    // Ein Link ist keine nackte String mehr, sondern eine Adresse mit
// Verfasser -- wie an den vier anderen Traegern.
    links: qLinks.all(it.id).map(l => ({ url: l.url, author: authorName(l.user_id) })),
    // ORDER BY day, id: zwei Leute duerfen denselben Tag eintragen.
    testDays: qBundleTestDays.all(it.id)
      .map(x => ({ day: x.day, rating: x.rating, author: authorName(x.user_id),
                   tags: qTestDayTags.all(x.id).map(y => y.name) })),
    // Dasselbe hier: je Kriterium steht eine Zeile JE BEWERTER in der
// Tabelle.
    ratings: qBundleRatings.all(it.id)
      .map(r => ({ name: r.name, value: r.value, author: authorName(r.user_id) })),
    comments: qBundleComments.all(it.id).map(c => ({
        text: c.text, kind: c.kind, pinned: !!c.pinned, author: authorName(c.user_id),
        created_at: c.created_at, updated_at: c.updated_at,
        /* DAS FAELLIGKEITSDATUM, Formatnummer 16. Ein Feld, das im Export
           fehlt, ist beim naechsten Einspielen weg. */
        ...(c.due_date ? { dueDate: c.due_date } : {}),
        // Kommentarbilder folgen dem Schalter der Dateien; ein dritter waere
// zu viel. Die Merkmale gehen immer mit, sie kosten nichts.
        images: withFiles
          ? qBundleCommentImages.all(c.id)
              .map(b2 => ({ filename: b2.filename, ['data' + extension]: funnel.take(b2.data) }))
          : []
      })),
    photos: [], attachments: []
  };
  if (withPhotos) {
    o.photos = qBundlePhotos.all(it.id).map(p => {
        /* DER AUSSCHNITT GEHT MIT -- alle DREI Werte, seit Formatnummer 12.
           Ohne `zoom` in der Datei ginge er beim Einspielen verloren, und die
           Zweitinstanz zeigte einen anderen Ausschnitt als die erste. */
        const z = { mime_type: p.mime_type, focus_x: p.focus_x, focus_y: p.focus_y,
                    zoom: p.zoom, kind: p.kind };
        if (p.kind !== 'video') { z['data' + extension] = funnel.take(p.data); return z; }
        z.duration = p.duration;
        /* OHNE DEN SCHALTER BLEIBT DIE ZEILE ALS MARKE STEHEN -- ohne Bytes. */
        if (withVideos) {
          z['data' + extension] = funnel.take(p.data);
          /* Das Standbild geht EIGENS mit. */
          const sb = p.medium || p.thumb;
          if (sb) z['standbild' + extension] = funnel.take(sb);
        }
        return z;
      });
  }
  if (withFiles) {
    // author wie an den fuenf anderen Traegern; ohne das Feld kaemen
// eingespielte Dateien herrenlos herein. Dafuer steht die Formatnummer 8.
    o.attachments = qBundleAttachments.all(it.id)
      .map(a2 => ({ filename: a2.filename, mime_type: a2.mime_type,
                    author: authorName(a2.user_id), ['data' + extension]: funnel.take(a2.data) }));
  }
  return o;
}

/* Der Umschlag um die Eintraege. */
function exportEnvelope(items) {
  const title = getSetting('title_app', 'Kriterion');
  // Zusaetzliches Feld, damit die Kriterienreihenfolge den Export ueberlebt.
  const critRows = db.prepare('SELECT name, weight, phase FROM rating_criteria ORDER BY sort_order, id').all();
  /* Die Gewichte kommen als EIGENES Feld daneben, criteria bleibt eine Liste
     von Namen: auf Objekte umgestellt liefe eine aeltere Instanz durch
     String() und bekaeme ein Kriterium namens "[object Object]". */
  const criteriaWeights = {};
  for (const c of critRows) if (c.weight !== 1) criteriaWeights[c.name] = c.weight;
  /* UND DIE PHASE IM SELBEN MUSTER, ein drittes Feld neben den
     beiden. */
  const criteriaPhase = {};
  for (const c of critRows) if (c.phase !== 'after') criteriaPhase[c.name] = c.phase;
  return { exported_at: new Date().toISOString(), title, version: EXCHANGE_FORMAT,
           /* WOMIT GESCHRIEBEN, F14. `version` sagt, WELCHE FELDER
              zu erwarten sind; `appVersion` sagt, WAS die Datei geschrieben
              hat. */
           appVersion: VERSION,
           criteria: critRows.map(c => c.name), criteriaWeights, criteriaPhase,
           criteriaNames: exchangeCriterionNames(),
           criteriaLanguages: exchangeCriterionLanguages(),
           categoryNames: exchangeCategoryNames(),
           categoryLanguages: exchangeCategoryLanguages(), items };
}

// Der Dateiname einer Exportdatei. Aus dem Titel der Instanz, damit zwei
// Instanzen nicht zwei gleichnamige Dateien im Ordner ablegen.
function exportName(suffix) {
  const title = getSetting('title_app', 'Kriterion');
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kriterion';
  return `${slug}-export${suffix}-${new Date().toISOString().slice(0, 10)}.json`;
}

/* WAS DER EXPORT AN BYTES WIRKLICH SCHREIBT -- je Art getrennt und vor dem
   ersten Handgriff. */
/* ================= WAS HIER STAND, UND WARUM ES FORT IST =================
   EIN ZWEIG FUER EINEN EINZELNEN EINTRAG: `onlyOne`, `values`, `and()`, `wo()`
   und vierzehn Einsetzungen. Beide verbliebenen Rufer reichten `null`. */
function exchangeParts(switches) {
  const one = (sql) => db.prepare(sql).get().n || 0;
  const base64 = (n) => Math.round(n * 4 / 3);
  const parts = { photos: 0, videos: 0, attachments: 0, commentImages: 0 };
  if (switches.withPhotos)
    parts.photos = base64(one(
      `SELECT COALESCE(SUM(length(data)),0) n FROM photos WHERE kind != 'video'`));
  /* Der Videoschalter haengt am Fotoschalter, wie in entryAsBundle(): ohne
     Fotos wird die Liste gar nicht erst gebaut, und der Haken an den Videos
     bliebe eine Angabe ohne Wirkung. */
  if (switches.withPhotos && switches.withVideos)
    parts.videos = base64(one(
      `SELECT COALESCE(SUM(length(data) + COALESCE(length(medium), length(thumb), 0)),0) n
         FROM photos WHERE kind = 'video'`));
  if (switches.withFiles) {
    parts.attachments = base64(one(
      `SELECT COALESCE(SUM(length(data)),0) n FROM attachments`));
    // Kommentarbilder folgen dem Schalter der Dateien -- dort und hier.
    parts.commentImages = base64(one(
      `SELECT COALESCE(SUM(length(ci.data)),0) n FROM comment_images ci
         JOIN comments c ON c.id = ci.comment_id`));
  }
  return parts;
}

/* DER UMSCHLAG -- alles, was die Datei traegt und keine Blob-Spalte ist. */
const ENVELOPE_PER = { entry: 320, comment: 150, rating: 70, testDay: 90, photo: 110, file: 130 };
function exchangeEnvelopeBytes() {
  const one = (sql) => db.prepare(sql).get().n || 0;
  /* Die Tags gehen NICHT ueber die Vorratstabelle, sondern ueber die
     Verknuepfung: derselbe Name steht an zwanzig Eintraegen und kostet in der
     Datei zwanzigmal Platz. */
  const text =
      one(`SELECT COALESCE(SUM(length(COALESCE(title,'')) + length(COALESCE(description,''))),0) n
              FROM items`)
    + one(`SELECT COALESCE(SUM(length(COALESCE(text,''))),0) n FROM comments`)
    + one(`SELECT COALESCE(SUM(length(t.name)),0) n FROM item_tags it
              JOIN tags t ON t.id = it.tag_id`)
    + one(`SELECT COALESCE(SUM(length(url)),0) n FROM links`);
  const form =
      one(`SELECT COUNT(*) n FROM items`) * ENVELOPE_PER.entry
    + one(`SELECT COUNT(*) n FROM comments`) * ENVELOPE_PER.comment
    + one(`SELECT COUNT(*) n FROM ratings`) * ENVELOPE_PER.rating
    + one(`SELECT COUNT(*) n FROM test_days`) * ENVELOPE_PER.testDay
    + one(`SELECT COUNT(*) n FROM photos`) * ENVELOPE_PER.photo
    + one(`SELECT COUNT(*) n FROM attachments`) * ENVELOPE_PER.file;
  return text + form;
}

/* ---- Der Export in Teilen ----------------------------------------------
   WOZU. */
const EXCHANGE_PART_MAX = 999;

/* Die Groesse JE EINTRAG, in EINER Abfrage statt in zehn je Eintrag. */
const qPartSizes = db.prepare(`
  SELECT i.id,
    COALESCE((SELECT SUM(length(p.data)) FROM photos p
               WHERE p.item_id = i.id AND p.kind != 'video'), 0) AS photo,
    COALESCE((SELECT SUM(length(p.data) + COALESCE(length(p.medium), length(p.thumb), 0))
                FROM photos p WHERE p.item_id = i.id AND p.kind = 'video'), 0) AS video,
    COALESCE((SELECT SUM(length(a.data)) FROM attachments a WHERE a.item_id = i.id), 0) AS attachment,
    COALESCE((SELECT SUM(length(ci.data)) FROM comment_images ci
                JOIN comments c ON c.id = ci.comment_id WHERE c.item_id = i.id), 0) AS commentImage,
    length(COALESCE(i.title,'')) + length(COALESCE(i.description,'')) AS text,
    COALESCE((SELECT SUM(length(c.text)) FROM comments c WHERE c.item_id = i.id), 0) AS commentText,
    COALESCE((SELECT SUM(length(t.name)) FROM item_tags it JOIN tags t ON t.id = it.tag_id
               WHERE it.item_id = i.id), 0) AS tagtext,
    COALESCE((SELECT SUM(length(l.url)) FROM links l WHERE l.item_id = i.id), 0) AS linktext,
    (SELECT COUNT(*) FROM comments c WHERE c.item_id = i.id) AS nk,
    (SELECT COUNT(*) FROM ratings r WHERE r.item_id = i.id) AS nb,
    (SELECT COUNT(*) FROM test_days d WHERE d.item_id = i.id) AS nz,
    (SELECT COUNT(*) FROM photos p WHERE p.item_id = i.id) AS nf,
    (SELECT COUNT(*) FROM attachments a WHERE a.item_id = i.id) AS nd,
    i.title AS title
  FROM items i ORDER BY i.id`);

// Was EIN Eintrag in der Datei kostet -- Blobs nach Schalter, Text und Form
// immer. Dieselbe Rechnung wie exchangeBytes(), nur aus einer fertigen Zeile.
function partBytes(z, switches) {
  const base64 = (n) => Math.round(n * 4 / 3);
  let n = 0;
  if (switches.withPhotos) n += z.photo;
  if (switches.withPhotos && switches.withVideos) n += z.video;
  if (switches.withFiles) n += z.attachment + z.commentImage;
  return base64(n) + z.text + z.commentText + z.tagtext + z.linktext
    + ENVELOPE_PER.entry + z.nk * ENVELOPE_PER.comment + z.nb * ENVELOPE_PER.rating
    + z.nz * ENVELOPE_PER.testDay + z.nf * ENVELOPE_PER.photo + z.nd * ENVELOPE_PER.file;
}

/* Der Schnittplan. Er sagt, WIE VIELE Teile es gibt und WELCHE Eintraege in
   jeden gehoeren -- und er nennt die Eintraege, die in keinen Teil passen. */
const EXCHANGE_PART_MIN = 1024 * 1024;
function exchangePlan(switches, targetWanted) {
  const targetSize = Math.min(EXCHANGE_WARN,
    Math.max(EXCHANGE_PART_MIN, Number(targetWanted) > 0 ? Number(targetWanted) : EXCHANGE_WARN));
  const rows = qPartSizes.all();
  const reason = exchangeEnvelopeFrame();
  const parts = [];
  const tooBig = [];
  let open = null;
  for (const z of rows) {
    const b = partBytes(z, switches);
    if (reason + b > EXCHANGE_MAX) { tooBig.push({ id: z.id, title: z.title, bytes: reason + b }); continue; }
    // Ein neuer Teil, sobald dieser Eintrag den laufenden ueber den Zielwert
// hoebe. Der erste Eintrag eroeffnet immer -- sonst entstuende ein leerer.
    if (!open || open.bytes + b > targetSize) {
      open = { nr: parts.length + 1, from: z.id, to: z.id, count: 0, bytes: reason };
      parts.push(open);
    }
    open.to = z.id;
    open.count++;
    open.bytes += b;
  }
  return { parts, tooBig: tooBig,
           total: parts.reduce((n, part) => n + part.bytes, 0),
           targetSize, fallback: EXCHANGE_WARN, smallest: EXCHANGE_PART_MIN,
           limit: EXCHANGE_MAX, string: EXCHANGE_STRING };
}

/* Was der Umschlag OHNE Eintraege kostet -- Titel, Zeitstempel, Formatnummer
   und die Kriterienliste. */
function exchangeEnvelopeFrame() {
  const title = getSetting('title_app', 'Kriterion');
  const critRows = db.prepare('SELECT name, weight, phase FROM rating_criteria ORDER BY sort_order, id').all();
  return JSON.stringify({ exported_at: new Date().toISOString(), title, version: EXCHANGE_FORMAT,
                          // Wie am Umschlag darueber -- der Rahmen misst, was
// der Umschlag KOSTET, und dieses Feld kostet mit.
                          appVersion: VERSION,
                          criteria: critRows.map(c => c.name),
                          criteriaWeights: Object.fromEntries(
                            critRows.filter(c => c.weight !== 1).map(c => [c.name, c.weight])),
                          criteriaNames: exchangeCriterionNames(),
                          criteriaLanguages: exchangeCriterionLanguages(),
                          categoryNames: exchangeCategoryNames(),
                          categoryLanguages: exchangeCategoryLanguages(),
                          // Der Rahmen misst, was der Umschlag KOSTET -- also
                          // gehoert das dritte Feld hier genauso hinein wie
                          // in die Datei.
                          criteriaPhase: Object.fromEntries(
                            critRows.filter(c => c.phase !== 'after').map(c => [c.name, c.phase])),
                          items: [] }).length;
}

/* Wie viele Bytes eine Datei traegt, BEVOR sie gebaut wird -- als eine Zahl. */
function exchangeBytes(switches) {
  const parts = exchangeParts(switches);
  return parts.photos + parts.videos + parts.attachments + parts.commentImages + exchangeEnvelopeBytes();
}

/* ---- Export ---- */
// Nur der Eigentuemer.
/* DIE ZWEITE BESTAETIGUNG ALS WAECHTER, und hier gab es keine Wahl: der Knopf
   loest eine BROWSERNAVIGATION aus, damit die Datei an der Platte
   vorbeilaeuft. */
/* Der Schnittplan. */
app.get('/api/export/plan', ownerOnly, (req, res) => {
  res.json(exchangePlan({
    withPhotos: req.query.photos !== '0',
    withFiles: req.query.files === '1',
    withVideos: req.query.videos === '1'
  }, req.query.target));
});

app.get('/api/export', ownerOnly, secondConfirmNeeded('export'), (req, res) => {
  const switches = {
    withPhotos: req.query.photos !== '0',
    // Eigener Schalter, Vorgabe aus: bei 50 MB je Datei waere die Exportdatei
// sonst schnell unhandlich -- Base64 blaeht zusaetzlich um ein Drittel auf.
    withFiles: req.query.files === '1',
    /* Dasselbe fuer die Videos, und aus demselben Grund nur schaerfer: ein
       20-MB-Video wird als Base64 zu 27 MB, und zwanzig davon sind 533 MB in
       EINEM String. */
    withVideos: req.query.videos === '1'
  };
  /* DIE ABSAGE STEHT VOR DEM BAU, nicht hinter dem Abbruch -- dieselbe
     Bauform wie am Einzelexport eine Seite weiter unten. */
  /* DAS FENSTER. Ohne `von`/`bis` ist es der ganze Bestand -- der alte Weg,
     Zeile fuer Zeile derselbe. */
  const number = (w) => { const n = Number(w); return Number.isInteger(n) && n > 0 ? n : null; };
  const from = number(req.query.from), to = number(req.query.to);
  /* DIE VIER ABFRAGEANGABEN STEHEN FEST IN DER OBERFLAECHE. */
  const part = number(req.query.part), parts = number(req.query.parts);
  const asPart = from !== null || to !== null || part !== null || parts !== null;
  if (asPart && (from === null || to === null || part === null || parts === null))
    return res.status(400).json({ error: t(localeOf(req), 'server.partExportIncomplete')});
  if (asPart && (from > to || part > parts || parts > EXCHANGE_PART_MAX))
    return res.status(400).json({ error: t(localeOf(req), 'server.partExportMismatch')});

  const big = exchangeBytes(switches);
  if (!asPart && big > EXCHANGE_MAX)
    return res.status(413).json({ error:
      t(localeOf(req), 'server.exportTooBig', { mb: Math.round(big / 1048576), limit: Math.round(EXCHANGE_STRING / 1048576) })});
  const situation = bundleState(req.user.id, switches);
  const items = (asPart
    ? db.prepare('SELECT * FROM items WHERE id BETWEEN ? AND ? ORDER BY id').all(from, to)
    : db.prepare('SELECT * FROM items ORDER BY id').all()).map(it => entryAsBundle(it, situation));
  /* Ein Teil steht als solcher im Protokoll -- sonst saehe ein Bestand, der
     in fuenf Teilen hinausgeht, aus wie fuenf volle Exporte. */
  auth.log('export', { actor: req.user.id, detail: asPart ? 'part' : null });
  res.set('Content-Disposition',
    `attachment; filename="${exportName(asPart ? `-teil-${part}-von-${parts}` : '')}"`);
  /* DAS NETZ UNTER DER SCHAETZUNG. Die Absage oben rechnet, sie misst nicht
     -- faellt sie zu niedrig aus, wirft `res.json` genau hier. */
  try { res.json(exportEnvelope(items)); }
  catch (e) {
    if (!(e instanceof RangeError)) throw e;
    res.removeHeader('Content-Disposition');
    res.status(413).json({ error:
      t(localeOf(req), 'server.exportGrew', { limit: Math.round(EXCHANGE_STRING / 1048576) })});
  }
});

/* ================= WAS HIER STAND, UND WARUM ES FORT IST =================
   GET /api/items/:id/export -- der Eintrag als einzelne Datei, 26 Runden ohne
   Rufer. Voller Export und Teilexport tragen dieselben Buendel. */

/* ---- Import ---- */
const IMPORT_MAX = 900 * 1024 * 1024;
const importUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: IMPORT_MAX } });

/* DER DESERIALISIERER, und er steht hier statt im Routenrumpf -- aus
   demselben Grund wie die Abbildung eine Seite weiter oben: das
   Wiederherstellen aus dem Papierkorb braucht ihn genauso wie die Datei. */
/* ================= WAS HIER STAND, UND WARUM ES FORT IST =================
   DREI UEBERSETZER FUER EINE DATEI MIT DEUTSCHEN FELDNAMEN -- `photoFromFile`,
   `valueFromFile` und `authorFromFile`. */

/* ---- DIE ANWEISUNGEN DES IMPORTS ----
   Sie standen bis dahin als db.prepare in den Schleifen: je Eintrag, je
   Kommentar, je Foto und je Tag wurde derselbe Text neu uebersetzt. */
const iDropItems = db.prepare('DELETE FROM items');
const iDropCategories = db.prepare('DELETE FROM product_categories');
const iDropTags = db.prepare('DELETE FROM tags');
const iCatFind = db.prepare('SELECT id FROM product_categories WHERE name = ? COLLATE NOCASE');
const iCatAdd = db.prepare('INSERT INTO product_categories (name, language) VALUES (?, ?)');
const iTagFind = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE');
const iTagAdd = db.prepare('INSERT INTO tags (name) VALUES (?)');
const iCritFind = db.prepare('SELECT id FROM rating_criteria WHERE name = ? COLLATE NOCASE');
const iCritLast = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM rating_criteria');
const iCritAdd = db.prepare(
  'INSERT INTO rating_criteria (name, sort_order, weight, phase, language) VALUES (?, ?, ?, ?, ?)');
const iItemAdd = db.prepare(`INSERT INTO items
        (title, description, rejected, rejected_at, rejected_reason, rejected_by,
         tested, product_category_id, created_at, updated_at, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')), COALESCE(?, datetime('now')), ?)`);
const iPinAdd = db.prepare('INSERT OR IGNORE INTO item_pins (user_id, item_id) VALUES (?, ?)');
const iItemTagAdd = db.prepare('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)');
const iLinkAdd = db.prepare('INSERT INTO links (item_id, url, sort_order, user_id) VALUES (?, ?, ?, ?)');
// OR REPLACE bleibt: die Datei ist die Wahrheit, der spaetere Wert gewinnt.
const iTestDayAdd = db.prepare(
  'INSERT OR REPLACE INTO test_days (item_id, day, rating, user_id) VALUES (?, ?, ?, ?)');
const iTestDayTagAdd = db.prepare(
  'INSERT OR IGNORE INTO test_day_tags (test_day_id, tag_id) VALUES (?, ?)');
const iRatingAdd = db.prepare(
  'INSERT OR REPLACE INTO ratings (item_id, criterion_id, value, user_id) VALUES (?, ?, ?, ?)');
const iCommentAdd = db.prepare(`INSERT INTO comments (item_id, text, kind, pinned, created_at, updated_at, user_id, due_date)
                      VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')), ?, ?, ?)`);
const iCommentImageAdd = db.prepare(`INSERT INTO comment_images (comment_id, filename, data, thumb, sort_order)
                      VALUES (?, ?, ?, ?, ?)`);
const iPhotoAdd = db.prepare(`INSERT INTO photos (item_id, mime_type, data, thumb, medium, focus_x, focus_y, zoom, sort_order, kind, duration)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const iAttachmentAdd = db.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order, user_id)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`);
const iUserByName = db.prepare('SELECT id FROM users WHERE username = ?');
const iCritNameAdd = db.prepare(
  'INSERT OR REPLACE INTO criterion_names (criterion_id, language, name) VALUES (?, ?, ?)');
const iCatNameAdd = db.prepare(
  'INSERT OR REPLACE INTO category_names (category_id, language, name) VALUES (?, ?, ?)');

/* SUCHEN, UND WENN NICHTS DASTEHT, ANLEGEN. Was beim Anlegen neben dem Namen
   steht, liefert `extra` -- als Funktion, damit es nur gerechnet wird, wenn
   wirklich angelegt wird. */
const findOrCreate = (find, add, name, extra = () => []) => {
  const f = find.get(name);
  return f ? f.id : add.run(name, ...extra()).lastInsertRowid;
};

/* Was vor der Transaktion anfaellt: Bildvarianten und Kommentarbilder. Beides
   ist asynchron und hat deshalb in einer Transaktion nichts zu suchen. */
async function importPrepare(payload, bytesSource) {
  const prepared = [];
  // Kommentarbilder je Kommentarobjekt, damit sie in der Transaktion
// bereitliegen.
  const commentImages = new Map();
  /* Die laute Haelfte der Videos: nicht abbrechen, melden -- dieselbe Haltung
     wie bei unbekannten Verfassernamen und ungueltigen Gewichten. */
  let videosWithoutFile = 0, videosUnreadable = 0;
  for (const it of payload.items) {
    const photos = [];
    for (const p of it.photos || []) {
      /* ENTSCHIEDEN WIRD UEBER DAS VORHANDENSEIN DER FELDER, nicht ueber die
         Formatnummer -- die ist im Projekt eine Aussage, keine Bedingung. */
      const isVideo = p.kind === 'video';
      const buf = bytesOf(p, 'data', bytesSource);
      if (!buf) {
        // Ein Videoplatz ohne Videodatei: so steht er in einer Datei, die
// ohne den Schalter geschrieben wurde.
        if (isVideo) videosWithoutFile++;
        continue;
      }
      /* Bei einem Video kommen die Varianten aus dem STANDBILD, nie aus data:
         dort steht die Videodatei. */
      const template = isVideo ? bytesOf(p, 'standbild', bytesSource) : buf;
      /* DEN AUSSCHNITT AUS DER DATEI UEBERNEHMEN -- alle drei Werte, ueber
         DIESELBE Tafel, die auch die Route benutzt. */
      const im = (name, raw) => displayValue(name, raw) ?? DISPLAY_VALUES[name].fallback;
      const crop = { fx: im('focus_x', p.focus_x), fy: im('focus_y', p.focus_y),
                          zoom: im('zoom', p.zoom) };
      const v = template ? await makeVariants(template, crop) : { thumb: null, medium: null };
      // Dieselbe Schaerfe wie beim Hochladen: fehlt EINE der beiden
// Varianten, wird die Zeile nicht angelegt.
      if (isVideo && (!v.thumb || !v.medium)) { videosUnreadable++; continue; }
      // Die Dauer ist eine Angabe wie der gemeldete Typ, und sie wird
// genauso beschnitten wie beim Hochladen.
      const d = Math.round(Number(p.duration));
      photos.push({ mime: p.mime_type || (isVideo ? 'video/mp4' : 'image/jpeg'),
                    buf, thumb: v.thumb, medium: v.medium,
                    fx: crop.fx, fy: crop.fy, zoom: crop.zoom,
                    kind: isVideo ? 'video' : 'image',
                    duration: isVideo && Number.isFinite(d) && d > 0 && d <= 24 * 3600 ? d : null });
    }
    const attachments = [];
    for (const a2 of it.attachments || []) {
      const buf = bytesOf(a2, 'data', bytesSource);
      if (!buf) continue;
      attachments.push({
        name: path.basename(String(a2.filename || 'datei')).slice(0, 200) || 'datei',
        mime: String(a2.mime_type || '').slice(0, 120), buf,
        // Roh mitgenommen und erst in der Transaktion aufgeloest: authorId()
// liegt dort und zaehlt mit.
        hasAuthor: 'author' in a2, author: a2.author
      });
    }
    // Kommentarbilder vorab kodieren -- in der Transaktion darf nichts
// Langsames oder Asynchrones mehr passieren.
    for (const c of it.comments || []) {
      const done = [];
      for (const b2 of c.images || []) {
        const raw = bytesOf(b2, 'data', bytesSource);
        if (!raw) continue;
        try {
          const { big, small } = await encodeCommentImage(raw);
          done.push({ name: path.basename(String(b2.filename || 'bild.jpg')).slice(0, 200), big, small });
        } catch { /* unlesbares Bild wird stillschweigend uebergangen */ }
      }
      if (done.length) commentImages.set(c, done);
    }
    prepared.push({ it, photos, attachments });
  }
  return { prepared, commentImages, videosWithoutFile, videosUnreadable };
}

/* Die beiden Tafeln aus der Datei -- Gewichte und Kaesten -- ausdruecklich
   AUSSERHALB der Transaktion: die Antwort muss die verworfenen Gewichte
   nennen, und der Konflikt wird vor dem ersten Schreiben abgewiesen. */
function importTables(payload) {
  const lower = (name) => String(name).trim().toLocaleLowerCase(compareLocale());
  const fileWeights = new Map();
  const weightsDropped = new Set();
  const rawWeights = payload.criteriaWeights;
  if (rawWeights && typeof rawWeights === 'object' && !Array.isArray(rawWeights)) {
    for (const [name, raw] of Object.entries(rawWeights)) {
      const clean = String(name || '').trim();
      if (!clean) continue;
      const g = validWeight(raw);
      if (g === null) { weightsDropped.add(clean); continue; }
      fileWeights.set(lower(clean), g);
    }
  }
  const filePhases = new Map();
  const rawPhases = payload.criteriaPhase;
  if (rawPhases && typeof rawPhases === 'object' && !Array.isArray(rawPhases)) {
    for (const [name, value] of Object.entries(rawPhases)) {
      const clean = String(name || '').trim();
      if (!clean || !PHASES.includes(value)) continue;
      filePhases.set(lower(clean), value);
    }
  }
  /* DIESELBE LOCALE WIE BEIM SCHREIBEN DER TAFEL DARUEBER -- zwei
     verschiedene Regeln fuer denselben Schluessel faenden einander nie. */
  const phaseFrom = (name) => filePhases.get(lower(name)) || PHASE_DEFAULT;

  const qPhaseOf = db.prepare('SELECT name, phase FROM rating_criteria WHERE name = ? COLLATE NOCASE');
  const conflicts = [];
  for (const name of Array.isArray(payload.criteria) ? payload.criteria : []) {
    const clean = String(name || '').trim();
    if (!clean) continue;
    const da = qPhaseOf.get(clean);
    if (da && da.phase !== phaseFrom(clean)) conflicts.push(da.name);
  }
  if (conflicts.length) {
    /* EIN GANZER SATZ JE ZAHLFORM UND KEIN ZUSAMMENGEKLEBTER. */
    const e = new Message('server.criteriaConflict',
                          { n: conflicts.length, names: conflicts.join(', ') });
    e.denial = true;
    throw e;
  }
  return { fileWeights, weightsDropped, phaseFrom, lower };
}

async function importInto(payload, userId, mode2, bytesSource = null) {
  /* ---- DIE ABWEISUNG EINER ZU ALTEN DATEI ------------------------------
     SIE STEHT VOR DER ERSTEN ZEILE ARBEIT, nicht erst vor der Transaktion:
     eine Datei, die nicht hereinkommt, kostet keine Bildvarianten. */
  const fileFormat = Number(payload && payload.version);
  if (!Number.isFinite(fileFormat) || fileFormat < EXCHANGE_FORMAT_MIN) {
    const e = new Message('server.exportTooOld', {
      format: Number.isFinite(fileFormat) ? fileFormat : '?',
      oldest: EXCHANGE_FORMAT_MIN
    });
    e.denial = true;
    throw e;
  }
  // Ableitungen vorab erzeugen: das geht nicht innerhalb einer Transaktion,
// weil es asynchron ist.
  const { prepared, commentImages, videosWithoutFile, videosUnreadable } =
    await importPrepare(payload, bytesSource);

  /* `names`: die eingespielten Namen je Sprache. Sie stehen in
     derselben Zaehlung wie alles andere -- was der Import anlegt, zaehlt er. */
  const stats = { items: 0, photos: 0, videos: 0, comments: 0, links: 0, testDays: 0,
                  attachments: 0, names: 0 };
  // Die Nummern der neu angelegten Eintraege.
  const newIds = [];

  /* EIN Ort, der aus einem Namen eine Id macht -- die Gegenrichtung zur Karte
     im Export. */
  const nameStore = new Map();
  const unknownNames = new Set();
  let assigned = 0;
  const authorId = (name) => {
    const clean = String(name == null ? '' : name).trim();
    if (!clean) return userId;
    let id = nameStore.get(clean);
    if (id === undefined) {
      const u = iUserByName.get(clean);
      id = u ? u.id : null;
      nameStore.set(clean, id);
    }
    if (id == null) { unknownNames.add(clean); return userId; }
    // Der eigene Name ist kein Fremdverweis: er zaehlt nicht als zugeordnet,
// sonst meldete jede selbst erzeugte Datei eine Zuordnung, die keine ist.
    if (id !== userId) assigned++;
    return id;
  };

  const { fileWeights, weightsDropped, phaseFrom, lower } = importTables(payload);

  // Ein einziger Vorgang: bricht etwas ab, bleibt der Bestand unveraendert.
  db.transaction(() => {
    if (mode2 === 'replace') {
      /* DIESE DREI ZEILEN FUELLEN DEN PAPIERKORB AUSDRUECKLICH NICHT. */
      iDropItems.run();
      iDropCategories.run();
      iDropTags.run();
    }
    /* DIE ERSTELLUNGSSPRACHE AUS DER DATEI, Formatnummer 15. Eine
       Datei der Nummer 14 und aelter traegt das Feld nicht; dann bleibt die
       Spalte leer, und die Karte fragt einmal nach. */
    const fileLanguage = (raw) => {
      const out = new Map();
      if (!raw || typeof raw !== 'object') return out;
      for (const [base, code] of Object.entries(raw))
        if (typeof code === 'string' && LANGUAGES[code])
          out.set(String(base).trim().toLocaleLowerCase(compareLocale()), code);
      return out;
    };
    const critLanguages = fileLanguage(payload.criteriaLanguages);
    const catLanguages = fileLanguage(payload.categoryLanguages);
    const languageOf = (table, name) => table.get(lower(name)) || null;
    /* DREI TAFELN, EIN MUSTER. Ein bekanntes Kriterium
       behaelt sein Gewicht; ein NEU angelegtes bekommt Gewicht und Kasten aus
       der Datei, sonst 1,0 und 'after'. */
    const catByName = (name) => name
      ? findOrCreate(iCatFind, iCatAdd, name, () => [languageOf(catLanguages, name)])
      : null;
    const tagByName = (name) => findOrCreate(iTagFind, iTagAdd, name);
    const critByName = (name) => findOrCreate(iCritFind, iCritAdd, name, () => {
      const g = fileWeights.get(lower(name));
      return [iCritLast.get().m + 1, g === undefined ? 1.0 : g, phaseFrom(name),
              languageOf(critLanguages, name)];
    });

    // Kriterien vorab in der Reihenfolge der Datei anlegen.
    for (const name of Array.isArray(payload.criteria) ? payload.criteria : []) {
      const clean = String(name || '').trim();
      if (clean) critByName(clean);
    }

    for (const { it, photos, attachments } of prepared) {
      // Der genannte Verfasser, wenn es ihn gibt -- sonst der Einspielende.
      const itemAuthor = authorId(it.author);
      /* WER ABGELEHNT HAT -- ueber dieselbe Abbildung wie jeder andere
         Verfasser, aber mit einem Unterschied, und der ist der Punkt: EIN
         FEHLENDER NAME BLEIBT LEER UND FAELLT NICHT AN DEN EINSPIELENDEN. */
      const rejectedBy = String(it.rejected_author == null ? '' : it.rejected_author).trim()
        ? authorId(it.rejected_author) : null;
      /* EINE DATEI DER FORMATNUMMER 10 UND AELTER TRAEGT DIE DREI FELDER
         NICHT. */
      const id = iItemAdd
        .run(it.title || 'Ohne Titel', it.description || '',
             it.rejected ? 1 : 0,
             it.rejected_at == null ? null : String(it.rejected_at),
             it.rejected_reason == null ? null : reasonText(String(it.rejected_reason)),
             rejectedBy,
             it.tested ? 1 : 0,
             catByName(it.category), it.created_at || null, it.updated_at || null,
             itemAuthor).lastInsertRowid;
      newIds.push(id);
      // Der Favorit bleibt beim Einspielenden, auch wenn der Eintrag einem
// anderen zufaellt: favorite heisst "habe ICH als Favorit markiert".
      if (it.favorite) iPinAdd.run(userId, id);
      stats.items++;

      for (const name of it.tags || []) iItemTagAdd.run(id, tagByName(name));

      // Dieselbe Regel wie beim Anlegen, damit sie an einer Stelle steht.
      /* ZWEI FORMEN, EINE SCHLEIFE: bis Formatnummer 6 ist ein Link ein
         nackter String, ab 7 ein Objekt mit url und author. */
      let lpos = 0;
      (it.links || []).forEach((entry) => {
        const raw = (entry && typeof entry === 'object') ? entry.url : entry;
        const clean = normalizeLink(raw);
        if (!clean) return;
        const toWhom = (entry && typeof entry === 'object' && 'author' in entry)
          ? authorId(entry.author) : itemAuthor;
        iLinkAdd.run(id, clean, lpos++, toWhom);
        stats.links++;
      });

      for (const date of it.testDays || []) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date.day || '')) continue;
        const simple = iTestDayAdd
          .run(id, date.day, Math.max(1, Math.min(5, Number(date.rating) || 1)), authorId(date.author));
        // Aeltere Exportdateien haben hier kein Feld -- dann bleibt der
// Testtag einfach ohne Tags.
        for (const name of Array.isArray(date.tags) ? date.tags : []) {
          const clean = String(name || '').trim();
          if (clean) iTestDayTagAdd.run(simple.lastInsertRowid, tagByName(clean));
        }
        stats.testDays++;
      }

      // Wie bei Eintrag, Kommentar und Testtag: der genannte Verfasser, sonst
// der Einspielende.
      for (const r of it.ratings || []) {
        const value = Math.max(0, Math.min(5, Number(r.value) || 0));
        iRatingAdd.run(id, critByName(r.name), value, authorId(r.author));
      }

      for (const c of it.comments || []) {
        // Aeltere Exportdateien kennen kind und pinned nicht -- dann gilt der
// Kommentar als gewoehnliche Notiz.
        /* UND DAS FAELLIGKEITSDATUM (Formatnummer 16). */
        const cDue = c.dueDate === undefined ? { value: null } : dueValue(c.dueDate);
        const simple = iCommentAdd
            .run(id, c.text || '', kindValue(c.kind), c.pinned ? 1 : 0,
                 c.created_at || null, c.updated_at || null, authorId(c.author),
                 cDue.error ? null : cDue.value);
        /* UND DIE MARKIERUNGEN WERDEN IN DIESER INSTANZ NEU AUFGELOEST. Das
           Austauschformat bleibt 16 und traegt KEINE Zugangsnummern: sie
           bedeuten in einer fremden Instanz etwas anderes. */
        setMentions(simple.lastInsertRowid, c.text || '');
        stats.comments++;
        (commentImages.get(c) || []).forEach((b2, i) =>
          iCommentImageAdd.run(simple.lastInsertRowid, b2.name, b2.big, b2.small, i));
      }

      // Fortlaufend neu nummeriert: uebergangene Videos hinterlassen keine
// Luecke in der Reihenfolge.
      photos.forEach((p, i) => {
        iPhotoAdd.run(id, p.mime, p.buf, p.thumb, p.medium, p.fx, p.fy, p.zoom, i, p.kind, p.duration);
        if (p.kind === 'video') stats.videos++; else stats.photos++;
      });

      /* Fehlt das Feld (aeltere Exportdatei oder Export ohne Dateien), bleibt
         der Eintrag einfach ohne Anhaenge. */
      attachments.forEach((a2, i) => {
        const whose = a2.hasAuthor ? authorId(a2.author) : itemAuthor;
        iAttachmentAdd.run(id, a2.name, a2.mime, a2.buf.length, a2.buf, i, whose);
        stats.attachments++;
      });
    }
    /* DIE NAMEN JE SPRACHE, Formatnummer 14. */
    for (const [add, byName, raw] of [
      [iCritNameAdd, critByName, payload.criteriaNames],
      [iCatNameAdd, catByName, payload.categoryNames]]) {
      if (!raw || typeof raw !== 'object') continue;
      for (const [language, words] of Object.entries(raw)) {
        if (!LANGUAGES[language] || !words || typeof words !== 'object') continue;
        for (const [base, name] of Object.entries(words)) {
          const clean = String(name || '').trim();
          const id = clean && base ? byName(base) : null;
          if (!id) continue;
          add.run(id, language, clean);
          stats.names++;
        }
      }
    }
  })();

  renumberCriteria();
  reclaim();

  /* Die laute Haelfte. */
  const unknown = [...unknownNames].sort();
  if (unknown.length)
    logLine(`Import: unknown authors assigned to the importing ` +
                `account (${unknown.length}): ${unknown.join(', ')}`);
  /* Dieselbe Bauform eine Zeile tiefer: ein Gewicht, das die Spanne
     verlaesst, bricht nichts ab und verschwindet auch nicht wortlos. */
  const dropped = [...weightsDropped].sort();
  if (dropped.length)
    logLine(`Import: invalid weight reset to 1.0 ` +
                `(${dropped.length}): ${dropped.join(', ')}`);
  /* Und dieselbe Bauform ein drittes Mal, an den Videos. */
  if (videosWithoutFile)
    logLine(`Import: ${videosWithoutFile} video(s) were not contained ` +
                `in the file and were skipped.`);
  if (videosUnreadable)
    logLine(`Import: ${videosUnreadable} video(s) without a readable ` +
                `still image skipped.`);
  return { ok: true, mode: mode2, ...stats,
           authorAssigned: assigned, authorUnknown: unknown,
           weightsDropped: dropped, videosWithoutFile, videosUnreadable, newIds };
}

/* Nur der Eigentuemer. */
/* DIE ZWEITE BESTAETIGUNG STEHT VOR multer, aus demselben Grund wie der
   Waechter darueber: eine bis zu 900 MB grosse Datei soll gar nicht erst
   eingelesen werden, wenn die Handlung ohnehin abgewiesen wird. */
app.post('/api/import', ownerOnly, secondConfirmNeeded('import'),
         capped(importUpload.single('file'),
                { count: 1, bytes: IMPORT_MAX, key: 'server.importOne' }),
         async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: t(localeOf(req), 'server.noFile')});
    const mode = req.body.mode === 'replace' ? 'replace' : 'merge';
    let payload;
    try { payload = JSON.parse(req.file.buffer.toString('utf8')); }
    catch { return res.status(400).json({ error: t(localeOf(req), 'server.exportInvalid')}); }
    if (!payload || !Array.isArray(payload.items))
      return res.status(400).json({ error: t(localeOf(req), 'server.exportEmpty')});
    // newIds bleibt hier liegen: eine Datei mit hundert Eintraegen liefert
// hundert Nummern, mit denen die Oberflaeche nichts anfaengt.
    const { newIds, ...response } = await importInto(payload, req.user.id, mode);
    auth.log('import', { actor: req.user.id, detail: mode });
    res.json(response);
  } catch (e) {
    /* EINE ABSAGE AUS importInto() IST KEIN FEHLER DER INSTANZ, sondern eine
       Auskunft ueber die Datei -- sie geht als 400 mit Message hinaus und
       nicht als 500 durch das Auffangnetz. */
    if (e && e.denial) return res.status(400).json({ error: errorText(req, e) });
    next(e);
  }
});


/* ================= Der Papierkorb ================= Beim Loeschen eines
   Eintrags wird er im vorhandenen Austauschformat serialisiert und als EINE
   Zeile abgelegt -- in DERSELBEN Transaktion wie das Loeschen. */

const TRASH_DAYS = 30;

const insertTrash = db.prepare(
  'INSERT INTO trash (title, content, deleted_by) VALUES (?, ?, ?)');
const insertTrashBytes = db.prepare(
  'INSERT INTO trash_bytes (trash_id, part, data) VALUES (?, ?, ?)');
const qTrashBytes = db.prepare(
  'SELECT data FROM trash_bytes WHERE trash_id = ? AND part = ?');
const delTrashOld = db.prepare(
  "DELETE FROM trash WHERE deleted_at < datetime('now', ?)");

/* DIE NUMMERN, DIE GERADE EINGESPIELT WERDEN -- ohne sie sehen zwei
   gleichzeitige Anfragen dieselbe Zeile und legen den Eintrag zweimal an.
   Nicht als DELETE: `trash_bytes` haengt mit ON DELETE CASCADE daran. */
const trashRestoring = new Set();

/* ZWEI AUFRUFSTELLEN, beide noetig -- beim Start und beim Oeffnen der Karte. */
function cleanupTrash() {
  const n = delTrashOld.run(`-${TRASH_DAYS} days`).changes;
  if (n) logLine(`Trash: ${n} row(s) older than ` +
    `${TRASH_DAYS} days removed.`);
  return n;
}
// Erste Aufrufstelle: der Start. Die zweite steht an GET /api/trash.
cleanupTrash();
// Und dasselbe fuer die abgelaufenen Token, nach derselben Bauform: erste
// Aufrufstelle hier, zweite an GET /api/users.
auth.cleanupTokens();
// Und dasselbe fuer das Sicherheitsprotokoll: erste Aufrufstelle hier, zweite
// an GET /api/security-log.
auth.cleanupLog();
/* Und die unbestaetigten Anfragen. */
auth.cleanupRequests();
/* Und die Anmeldeversuche. Sie sind die einzigen, die KEINE Karte haben, an
   der ein zweiter Ruf haengen koennte -- deshalb eine Uhr statt eines Rufers. */
auth.cleanupAttempts();
setInterval(auth.cleanupAttempts, 60 * 60 * 1000).unref();

/* Der Weg hinein. */
function intoTrash(itemId, actor) {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  if (!it) return null;
  const collector = [];
  const situation = bundleState(actor, {
    // Ohne Schalter: der Papierkorb ist kein Export, sondern der Rueckweg.
// Ein Rueckweg, der die Videos wegliesse, waere keiner.
    withPhotos: true, withFiles: true, withVideos: true, funnel: funnelStore(collector)
  });
  return db.transaction(() => {
    const envelope = exportEnvelope([entryAsBundle(it, situation)]);
    const p = insertTrash.run(it.title, JSON.stringify(envelope), actor);
    collector.forEach((buf, nr) => insertTrashBytes.run(p.lastInsertRowid, nr, buf));
    db.prepare('DELETE FROM items WHERE id = ?').run(it.id);
    return p.lastInsertRowid;
  })();
}

/* Die Liste. LESEND, deshalb kein Eintrag in F_ROUTEN -- der Waechter steht
   trotzdem davor. */
/* ANLEGER UND ANLAGEDATUM KOMMEN AUS DEM PAKET (B6 B, Schritt 1 aus
   F7). */
const qTrash = db.prepare(`SELECT p.id, p.title, p.deleted_at, p.deleted_by,
    json_extract(p.content, '$.items[0].author') AS created_by,
    json_extract(p.content, '$.items[0].created_at') AS created_at,
    (SELECT COUNT(*) FROM trash_bytes b WHERE b.trash_id = p.id) AS files,
    length(p.content) + COALESCE(
      (SELECT SUM(length(b.data)) FROM trash_bytes b WHERE b.trash_id = p.id), 0) AS bytes
  FROM trash p ORDER BY p.deleted_at DESC, p.id DESC`);

app.get('/api/trash', adminOnly, (req, res) => {
  cleanupTrash();
  const card = authorCard();
  res.json({
    // Die Zahl steht in der Antwort und wird nicht aus der Liste gezaehlt:
    // die Karte nennt sie auch dann, wenn sie die Liste noch gar nicht
    // gezeichnet hat.
    days: TRASH_DAYS,
    rows: qTrash.all().map(z => ({
      id: z.id, title: z.title, deleted_at: z.deleted_at,
      // Wer geloescht hat, in derselben Form wie jeder Verfasser -- damit die
      // Oberflaeche denselben einen Weg von der Nummer zum Namen geht und ein
      // Grabstein "Gelöschter Benutzer 7" heisst.
      deletedBy: authorFrom(card, z.deleted_by),
      /* UND WER IHN ANGELEGT HAT, WANN (B6 B). */
      createdBy: z.created_by ? authorByName(card, z.created_by) : null,
      created_at: z.created_at || null,
      files: z.files, bytes: z.bytes,
      // Die Frist rechnet der Server: die Zahl TRASH_DAYS steht an einer
// Stelle, und die Oberflaeche baut sie nicht nach.
      daysOpen: Math.max(0, TRASH_DAYS - Math.floor(
        (Date.now() - Date.parse(z.deleted_at.replace(' ', 'T') + 'Z')) / 86400000))
    }))
  });
});

/* Wiederherstellen. Es legt einen NEUEN Eintrag an und stellt nicht den alten
   zurueck -- die alte Nummer ist weg, und daran haengt nichts mehr. */
app.post('/api/trash/:id/restore', ownerOnly, async (req, res, next) => {
  let claimed = null;
  try {
    const z = db.prepare('SELECT * FROM trash WHERE id = ?').get(req.params.id);
    if (!z) return res.status(404).json({ error: t(localeOf(req), 'server.trashGone')});
    /* IN ANSPRUCH NEHMEN, BEVOR DER EVENT LOOP FREI WIRD -- zwischen `has`
       und `add` liegt keine Anweisung, die ihn freigibt. */
    if (trashRestoring.has(z.id))
      return res.status(409).json({ error: t(localeOf(req), 'server.trashRestoring')});
    trashRestoring.add(z.id);
    claimed = z.id;
    let envelope;
    try { envelope = JSON.parse(z.content); }
    catch { return res.status(500).json({ error: t(localeOf(req), 'server.trashUnreadable')}); }
    // Die Bytes kommen aus der Nebentabelle, Zeile fuer Zeile -- nie alle
// zugleich in einem String.
    const source = (nr) => {
      const b = qTrashBytes.get(z.id, nr);
      return b ? b.data : null;
    };
    const result = await importInto(envelope, req.user.id, 'merge', source);
    // Erst nach dem Einspielen: scheitert es, bleibt die Zeile liegen.
    db.prepare('DELETE FROM trash WHERE id = ?').run(z.id);
    reclaim();
    res.json({ ...result, itemId: result.newIds[0] ?? null, title: z.title });
  } catch (e) {
    /* DERSELBE WEG WIE AM IMPORT. */
    if (e && e.denial) return res.status(400).json({ error: errorText(req, e) });
    next(e);
  } finally {
    // Auch auf jedem Fehlerweg: sonst bliebe die Nummer bis zum Neustart
    // gesperrt, und der Eintrag waere nicht mehr zurueckzuholen.
    if (claimed !== null) trashRestoring.delete(claimed);
  }
});

// Endgueltig entfernen. Dieselbe Rechtezeile wie das Wiederherstellen: wer
// einen Rueckweg nehmen darf, darf ihn auch schliessen.
app.delete('/api/trash/:id', ownerOnly, (req, res) => {
  const n = db.prepare('DELETE FROM trash WHERE id = ?').run(req.params.id).changes;
  if (!n) return res.status(404).json({ error: t(localeOf(req), 'server.trashGone')});
  reclaim();
  res.status(204).end();
});


/* ================= Die Sicherung ================= DIE ROLLENTEILUNG, und
   sie gehoert in die Oberflaeche und nicht nur in die Dokumente: VACUUM INTO
   -- der SICHERUNGSWEG. */

const BACKUP_DIR = String(auth.fromEnv('BACKUP_DIR', 'SICHERUNG_DIR') || '').trim();
// Gemessen an einer verschluesselten Instanz: rund 10 ms je MB.
const BACKUP_MS_PER_MB = 20;
const BACKUP_PATTERN = /^kriterion-.+\.sqlite$/;
/* --- Die Aufraeumregel: ZWEI BEDINGUNGEN, und beide muessen zutreffen ---
   Geloescht wird eine Kopie nur, wenn sie BEIDES ist: nicht unter den N
   juengsten UND aelter als X Tage. */
const CLEANUP_KEEP = { fallback: 3, min: 1, max: 20 };
const CLEANUP_DAYS = { fallback: 30, min: 7, max: 365 };
const DAY_MS = 86400000;
// Positivliste statt Liste des Verbotenen: JEDES Segment faengt mit einem
// Buchstaben oder einer Ziffer an.
const PLACE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._-]*(\/[A-Za-z0-9][A-Za-z0-9 ._-]*)*$/;

/* Liegt der eine Pfad im anderen? */
const liesIn = (inside, outside) => inside === outside || inside.startsWith(outside + path.sep);

/* Das Anwendungsverzeichnis -- der Ort, an dem diese Datei liegt. */
const APP_DIR = (() => {
  try { return fs.realpathSync(__dirname); } catch { return path.resolve(__dirname); }
})();

/* Die Lage wird bei JEDER Anfrage gelesen und nicht beim Start festgehalten:
   wer das Verzeichnis nachtraeglich einhaengt, soll es nicht mit einem
   Neustart bezahlen. */
function backupState() {
  /* DER GRUND IST EIN SCHLUESSEL UND KEIN SATZ. */
  if (!BACKUP_DIR)
    return { input: false, reason: 'server.backupDirNotSet', values: {} };
  let root;
  try { root = fs.realpathSync(BACKUP_DIR); }
  catch { return { input: false, reason: 'server.backupDirGone', values: { folder: BACKUP_DIR } }; }
  try { if (!fs.statSync(root).isDirectory())
    return { input: false, reason: 'server.backupDirNotDir', values: { folder: BACKUP_DIR } }; }
  catch { return { input: false, reason: 'server.backupDirUnreadable', values: { folder: BACKUP_DIR } }; }
  let data;
  try { data = fs.realpathSync(DATA_DIR); } catch { data = path.resolve(DATA_DIR); }
  // EINE SICHERUNG NEBEN DEM ORIGINAL IST KEINE. Beide Richtungen, denn beide
// sind falsch: der Sicherungsort im Datenverzeichnis und umgekehrt.
  if (liesIn(root, data) || liesIn(data, root))
    return { input: false, reason: 'server.backupInDataDir', values: {} };
  return { input: true, root, inWorkDir: liesIn(root, APP_DIR) };
}

/* Der eingestellte Ort, geprueft. */
function checkPlace(raw) {
  const situation = backupState();
  if (!situation.input) return { error: situation.reason, values: situation.values };
  const s = String(raw == null ? '' : raw).trim();
  if (!s) return { place: '', filePath: situation.root };
  // `deckel` ist ein Platzhalter der Sprachdatei und kein Bezeichner.
  if (s.length > 200) return { error: 'server.subDirTooLong', values: { cap: 200 } };
  if (!PLACE_PATTERN.test(s))
    return { error: 'server.subDirForm', values: {} };
  let real;
  try { real = fs.realpathSync(path.resolve(situation.root, s)); }
  catch { return { error: 'server.subDirGone', values: { folder: s } }; }
  try { if (!fs.statSync(real).isDirectory())
    return { error: 'server.subDirNotDir', values: { folder: s } }; }
  catch { return { error: 'server.subDirUnreadable', values: { folder: s } }; }
  // DIE PRUEFUNG HAENGT AM AUFGELOESTEN PFAD. Erst hier faellt ein Symlink
// auf, der aus der Wurzel herausfuehrt -- am String saehe er harmlos aus.
  if (!liesIn(real, situation.root))
    return { error: 'server.subDirOutside', values: { folder: s } };
  return { place: s, filePath: real };
}

/* "Letzte Sicherung vor N Tagen" kommt aus dem DATEISYSTEM, nicht aus einem
   Schluessel in settings. */
/* ZWEI SCHLUESSEL IM UMLAUF -- die unangenehmste Falle des ganzen Projekts. */
function changeMark() {
  const raw = getSetting('keyChangedAt', null);
  if (!raw) return null;
  const ms = Date.parse(String(raw).replace(' ', 'T') + 'Z');
  return Number.isFinite(ms) ? { at: raw, ms } : null;
}

/* DIE LISTE DER KOPIEN AM ORT -- EINMAL AUFGEBAUT UND VON DREIEN GENUTZT. */
function backupList(filePath) {
  let names;
  try { names = fs.readdirSync(filePath); }
  catch { return null; }
  const files = [];
  for (const n of names) {
    if (!BACKUP_PATTERN.test(n)) continue;
    try {
      const st = fs.lstatSync(path.join(filePath, n));
      if (st.isFile()) files.push({ name: n, time: st.mtimeMs, bytes: st.size });
    } catch { /* eine Datei, die zwischen readdir und stat verschwindet */ }
  }
  files.sort((a, b) => b.time - a.time);
  return files;
}

function lastBackup(filePath) {
  const mark = changeMark();
  const changedAt = mark ? mark.at : null;
  const files = backupList(filePath);
  if (files === null)
    return { reachable: false, last: null, number: 0, changedAt, outdated: 0 };
  // Ohne Wechsel ist KEINE Kopie veraltet -- und nicht etwa jede.
  const outdated = mark ? files.filter(d => d.time < mark.ms).length : 0;
  if (!files.length)
    return { reachable: true, last: null, number: 0, changedAt, outdated: 0 };
  const j = files[0];
  return { reachable: true, number: files.length, changedAt, outdated, last: {
    file: j.name, bytes: j.bytes,
    // Dieselbe Schreibweise wie jeder Zeitstempel der Instanz ("2026-08-23
    // 19:56:01", UTC): die Oberflaeche hat genau einen Weg, aus einem
    // Zeitstempel ein Datum zu machen, und der erwartet diese Form.
    at: new Date(j.time).toISOString().slice(0, 19).replace('T', ' '),
    daysAgo: Math.max(0, Math.floor((Date.now() - j.time) / 86400000)),
    // Auch die JUENGSTE Kopie kann aelter sein als der Wechsel -- dann ist
// ueberhaupt keine brauchbare da, und das ist die schaerfste Lage.
    outdated: Boolean(mark && j.time < mark.ms)
  } };
}

/* ================= Alte Sicherungen aufraeumen ===========================
   DIE REGEL STEHT AN GENAU EINER STELLE und ist eine reine Funktion: Liste
   und zwei Werte hinein, die zu loeschenden Namen heraus. */
function ruleHit(files, keep, days, now, changeMs) {
  const usable = files
    .filter(d => changeMs == null || d.time >= changeMs)
    .sort((a, b) => b.time - a.time);
  const limit = now - days * DAY_MS;
  //          der Boden                    die Schere
  return usable.slice(keep).filter(d => d.time < limit);
}

/* Die beiden Werte, geprueft. */
/* `key` UND NICHT MEHR DER NAME DER REGEL. */
function checkRuleValue(raw, range, key) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < range.min || n > range.max)
    return { error: key, values: { min: range.min, max: range.max } };
  return { value: n };
}

/* Der eingestellte Stand der Regel. */
function cleanupStatus() {
  const b = checkRuleValue(getSetting('backupKeep', CLEANUP_KEEP.fallback),
                            CLEANUP_KEEP, 'server.ruleKeep');
  const rule = checkRuleValue(getSetting('backupDays', CLEANUP_DAYS.fallback),
                            CLEANUP_DAYS, 'server.ruleDays');
  return {
    an: getSetting('backupCleanup', false) === true,
    keep: b.error ? CLEANUP_KEEP.fallback : b.value,
    days: rule.error ? CLEANUP_DAYS.fallback : rule.value
  };
}

/* Eine Zeile der Vorschau: dieselbe Schreibweise wie jeder Zeitstempel der
   Instanz, damit die Oberflaeche genau einen Weg hat, daraus ein Datum zu
   machen. */
const cleanupRow = (d, now) => ({
  file: d.name, bytes: d.bytes,
  at: new Date(d.time).toISOString().slice(0, 19).replace('T', ' '),
  daysAgo: Math.max(0, Math.floor((now - d.time) / DAY_MS))
});

/* DIE VORSCHAU -- sie steht immer da, auch wenn der Schalter aus ist: sie ist
   die Auskunft darueber, was die Regel bei den eingestellten Werten bedeutet. */
/* DIE VIER GRUENDE SIND SCHLUESSEL UND KEINE SAETZE. */
function cleanupPreview(filePath, keep, days, locale) {
  const files = backupList(filePath);
  if (files === null) return { reachable: false, files: [], matched: [], bytes: 0, reason: '' };
  const mark = changeMark();
  const now = Date.now();
  const old = mark ? files.filter(d => d.time < mark.ms) : [];
  const usable = mark ? files.filter(d => d.time >= mark.ms) : files;
  const matched = ruleHit(files, keep, days, now, mark ? mark.ms : null);
  let reason = '';
  if (!matched.length) {
    if (!files.length) reason = t(locale, 'server.cleanupNoBackups');
    else if (!usable.length)
      reason = t(locale, 'server.backupsBeforeKey', { n: files.length });
    else if (usable.length <= keep)
      reason = t(locale, 'server.cleanupAllYoungest', { n: usable.length, keep: keep });
    else {
      // Die AELTESTE der Kopien, die der Boden nicht mehr deckt -- sie ist
      // die, die als naechste faellt, und ihr Alter ist die Auskunft, auf die
      // es ankommt.
      const next2 = usable[usable.length - 1];
      const from2 = Math.max(0, Math.floor((now - next2.time) / DAY_MS));
      reason = t(locale, 'server.cleanupOldestAge', { n: from2 });
    }
  }
  /* DIE VOLLSTAENDIGE LISTE, JUENGSTE ZUERST UND NUMMERIERT. */
  const hitNames = new Set(matched.map(d => d.name));
  const oldMs = mark ? mark.ms : null;
  return {
    reachable: true,
    files: files.map((d, i) => ({
      ...cleanupRow(d, now), nr: i + 1,
      affected: hitNames.has(d.name),
      outdated: oldMs != null && d.time < oldMs
    })),
    matched: matched.map(d => cleanupRow(d, now)),
    bytes: matched.reduce((n, d) => n + d.bytes, 0),
    reason,
    oldCount: old.length,
    oldBytes: old.reduce((n, d) => n + d.bytes, 0),
    oldFiles: old.map(d => cleanupRow(d, now))
  };
}

/* DAS LOESCHEN. */
/* EINE ZEILE JE ENTFERNTER KOPIE, und das ist eine Entscheidung. */
const logRemoved = (actor, number) => {
  for (let i = 0; i < number; i++) auth.log('backup.delete', { actor });
};

function removeBackups(folder, names) {
  let removed = 0, bytes = 0;
  const stayed = [];
  for (const n of names) {
    const short = path.basename(String(n));
    if (short !== String(n) || !BACKUP_PATTERN.test(short)) { stayed.push(short); continue; }
    const full = path.join(folder, short);
    try {
      const st = fs.lstatSync(full);
      if (!st.isFile()) { stayed.push(short); continue; }
      fs.unlinkSync(full);
      removed++; bytes += st.size;
    } catch (e) {
      stayed.push(short);
      logFail(`Backup ${short} not removed: ${e.message}`);
    }
  }
  return { removed, bytes, stayed };
}

// Lesend, deshalb kein Eintrag in F_ROUTEN -- der Waechter steht trotzdem
// davor, und zwar der des Exports: die Antwort nennt einen Pfad des Wirts.
app.get('/api/backup', ownerOnly, (req, res) => {
  const situation = backupState();
  const place = getSetting('backupPlace', '');
  let dbBytes = 0;
  // MIT wal_checkpoint, wie bei den Kennzahlen: ohne ihn steht der frisch
  // geschriebene Bestand noch in der WAL, die Datei sieht winzig aus, und die
  // Ansage der Dauer waere zu niedrig.
  try { db.pragma('wal_checkpoint(PASSIVE)'); dbBytes = fs.statSync(DB_FILE).size; } catch {}
  // Die erwartete Dauer wird aus der Groesse gerechnet und VORHER genannt:
// waehrend VACUUM INTO laeuft, steht die Instanz.
  const duration = Math.max(1, Math.round(dbBytes / 1048576 * BACKUP_MS_PER_MB / 1000));
  /* Die Marke steht auch dann in der Antwort, wenn der Zielort nicht
     erreichbar ist: DASS gewechselt wurde, ist eine Aussage ueber die Instanz
     und haengt nicht am Sicherungsort. */
  const mark = changeMark();
  const changedAt = mark ? mark.at : null;
  /* DIE VORSCHAU RECHNET MIT DEN WERTEN AUS DER ABFRAGE, WENN WELCHE
     DASTEHEN, und sonst mit den eingestellten. */
  const status2 = cleanupStatus();
  let keep = status2.keep, days = status2.days;
  if (req.query.keep !== undefined) {
    const g = checkRuleValue(req.query.keep, CLEANUP_KEEP, 'server.ruleKeep');
    if (g.error) return res.status(400).json({ error: t(localeOf(req), g.error, g.values) });
    keep = g.value;
  }
  if (req.query.days !== undefined) {
    const g = checkRuleValue(req.query.days, CLEANUP_DAYS, 'server.ruleDays');
    if (g.error) return res.status(400).json({ error: t(localeOf(req), g.error, g.values) });
    days = g.value;
  }
  /* DIE GRENZEN GEHEN MIT HINAUS. */
  const rule = { ...status2, keep, days,
                  limits: { keep: CLEANUP_KEEP, days: CLEANUP_DAYS } };
  /* DREI ANTWORTEN AUS EINEM GRUNDOBJEKT. Sie trugen zum
     grossen Teil dieselben Felder; jede Zeile stand dreimal da.
     UEBERSETZT WIRD HIER. */
  const base = { place, dbBytes, durationSeconds: duration, cleanup: rule };
  // Was kein erreichbarer Ort meldet -- zweimal dasselbe.
  const off = { ...base, reachable: false, last: null, changedAt, outdated: 0 };
  if (!situation.input) return res.json({ ...off, configured: false,
    reason: t(localeOf(req), situation.reason, situation.values) });
  // Die Lage der WURZEL, nicht die des gewaehlten Unterverzeichnisses: sie ist
// eine Eigenschaft der Einrichtung und aendert sich mit dem Zielort nicht.
  const here = { configured: true, root: situation.root, inWorkDir: situation.inWorkDir };
  const target = checkPlace(place);
  if (target.error) return res.json({ ...off, ...here,
    error: t(localeOf(req), target.error, target.values) });
  res.json({ ...base, ...here, filePath: target.filePath, ...lastBackup(target.filePath),
             cleanup: { ...rule, ...cleanupPreview(target.filePath, keep, days, localeOf(req)) } });
});

/* Der Ort ist eine Einstellung der INSTANZ und gehoert damit in settings,
   nicht in user_settings: zwei Leute mit verschiedenen Orten haetten zwei
   Wahrheiten ueber dieselbe Sache. */
app.put('/api/backup/dir', ownerOnly, (req, res) => {
  const checked = checkPlace(req.body?.place);
  if (checked.error) return res.status(400).json({ error: t(localeOf(req), checked.error, checked.values) });
  putSetting.run('backupPlace', JSON.stringify(checked.place));
  res.json({ ok: true, place: checked.place, filePath: checked.filePath, ...lastBackup(checked.filePath) });
});

app.post('/api/backup', ownerOnly, (req, res) => {
  const situation = backupState();
  if (!situation.input) return res.status(400).json({ error: t(localeOf(req), situation.reason, situation.values) });
  const target = checkPlace(getSetting('backupPlace', ''));
  if (target.error) return res.status(400).json({ error: t(localeOf(req), target.error, target.values) });
  /* NAME MIT DATUM UND UHRZEIT. Ueberschreiben waere die schlechteste
     Antwort: eine Sicherung, die die vorige frisst, ist keine. */
  const mark = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const file = path.join(target.filePath, `kriterion-${mark}.sqlite`);
  if (fs.existsSync(file))
    return res.status(409).json({ error: t(localeOf(req), 'server.backupConcurrent')});
  /* GESCHRIEBEN WIRD UNTER EINEM ARBEITSNAMEN, umbenannt wird erst danach. */
  const becoming = file + '.wird';
  try { if (fs.existsSync(becoming)) fs.unlinkSync(becoming); } catch {}
  const t0 = Date.now();
  try {
    db.prepare('VACUUM INTO ?').run(becoming);
    fs.renameSync(becoming, file);
  } catch (e) {
    try { if (fs.existsSync(becoming)) fs.unlinkSync(becoming); } catch {}
    logFail('Backup failed:', e.message);
    // Fester Text wie ueberall bei einem Fehler DES SERVERS: ein SQL-Fehler
    // nennt Pfade und Tabellen, und die gehoeren ins Protokoll, nicht in die
    // Antwort.
    return res.status(500).json({ error: t(localeOf(req), 'server.backupFailed')});
  }
  const ms = Date.now() - t0;
  let bytes = 0;
  try { bytes = fs.statSync(file).size; } catch {}
  logLine(`Backup written: ${path.basename(file)} ` +
    `(${bytes} bytes, ${ms} ms).`);
  // Eine vollstaendige Kopie, die das Haus verlaesst -- dieselbe Zeile wie
// der Export.
  auth.log('backup', { actor: req.user.id });
  /* ---- DAS AUFRAEUMEN, UND ZWAR HIER UND NIRGENDS SONST ---- Der Aufruf
     steht am Ende dieser Route, NACH `rename` und `statSync`: erst dort steht
     fest, dass eine frische, vollstaendige Kopie da ist. */
  let cleaned = null;
  try {
    const rule = cleanupStatus();
    if (rule.an) {
      const matched = ruleHit(backupList(target.filePath) || [], rule.keep, rule.days,
                                   Date.now(), (changeMark() || {}).ms ?? null);
      if (matched.length) {
        const out2 = removeBackups(target.filePath, matched.map(d => d.name));
        cleaned = { removed: out2.removed, notDeleted: out2.stayed.length, bytes: out2.bytes };
        if (out2.removed) {
          logLine(`Old backups removed: ${out2.removed} ` +
            `(${out2.bytes} bytes freed)` +
            `${out2.stayed.length ? `, ${out2.stayed.length} kept` : ''}.`);
          logRemoved(req.user.id, out2.removed);
        }
      }
    }
  } catch (e) {
    // Die Sicherung ist gelungen; dieser Fehler ist eine Angabe daneben und
// darf die Antwort nicht in eine Absage verwandeln.
    logFail('Clearing up after the backup failed:', e.message);
    cleaned = { removed: 0, notDeleted: 0, bytes: 0, failed: true };
  }
  res.json({ ok: true, file: path.basename(file), filePath: target.filePath, bytes, ms,
             ...lastBackup(target.filePath), cleaned });
});

/* ---- DIE LOESCHROUTE ----------------------------------------------------
   POST /api/backup/cleanup -- die einundsiebzigste schreibende Route. */
app.post('/api/backup/cleanup', ownerOnly,
         secondConfirmNeeded('backup'), (req, res) => {
  const situation = backupState();
  if (!situation.input) return res.status(400).json({ error: t(localeOf(req), situation.reason, situation.values) });
  const target = checkPlace(getSetting('backupPlace', ''));
  if (target.error) return res.status(400).json({ error: t(localeOf(req), target.error, target.values) });
  const kind = String(req.body?.kind || '');
  if (kind !== 'rule' && kind !== 'outdated')
    return res.status(400).json({ error: t(localeOf(req), 'server.cleanupUnknown')});
  const files = backupList(target.filePath);
  if (files === null)
    return res.status(400).json({ error: t(localeOf(req), 'server.backupDirUnreachable')});
  const mark = changeMark();
  /* DIE GRENZEN HALTEN, BEVOR IRGENDETWAS GELOESCHT WIRD. */
  let matched;
  if (kind === 'outdated') {
    if (!mark) return res.status(400).json({
      error: t(localeOf(req), 'server.keyNeverChanged')});
    matched = files.filter(d => d.time < mark.ms);
  } else {
    const b = checkRuleValue(getSetting('backupKeep', CLEANUP_KEEP.fallback),
                              CLEANUP_KEEP, 'server.ruleKeep');
    if (b.error) return res.status(400).json({ error: t(localeOf(req), b.error, b.values) });
    const rule = checkRuleValue(getSetting('backupDays', CLEANUP_DAYS.fallback),
                              CLEANUP_DAYS, 'server.ruleDays');
    if (rule.error) return res.status(400).json({ error: t(localeOf(req), rule.error, rule.values) });
    matched = ruleHit(files, b.value, rule.value, Date.now(), mark ? mark.ms : null);
  }
  const out2 = removeBackups(target.filePath, matched.map(d => d.name));
  if (out2.removed) {
    logLine(`Old backups removed (${kind}): ${out2.removed} ` +
      `(${out2.bytes} bytes freed)${out2.stayed.length ? `, ${out2.stayed.length} kept` : ''}.`);
    /* NUR DIE ZAHL INS SICHERHEITSPROTOKOLL. */
    logRemoved(req.user.id, out2.removed);
  }
  /* DIE ANTWORT NENNT, WAS WIRKLICH GELOESCHT WURDE, und traegt die Vorschau
     frisch daneben: die Karte zeichnet sich daraus neu, statt ihren alten
     Stand fortzuschreiben. */
  const after = cleanupStatus();
  res.json({ ok: true, kind, removed: out2.removed, notDeleted: out2.stayed.length, bytes: out2.bytes,
             ...lastBackup(target.filePath),
             cleanup: { ...after,
                           limits: { keep: CLEANUP_KEEP, days: CLEANUP_DAYS },
                           ...cleanupPreview(target.filePath, after.keep, after.days, localeOf(req)) } });
});

/* ---- DIE SICHERUNGSPROBE --------------------------
   EINE SICHERUNG OHNE PROBE IST EINE VERMUTUNG. */
app.post('/api/backup/check', ownerOnly, (req, res) => {
  const situation = backupState();
  if (!situation.input)
    return res.status(400).json({ error: t(localeOf(req), situation.reason, situation.values) });
  const target = checkPlace(getSetting('backupPlace', ''));
  if (target.error)
    return res.status(400).json({ error: t(localeOf(req), target.error, target.values) });
  const files = backupList(target.filePath);
  if (files === null)
    return res.status(400).json({ error: t(localeOf(req), 'server.backupDirUnreachable') });
  /* DIE NUMMER WIRD GEPRUEFT UND NICHT GEGLAUBT: `files[nr - 1]` mit einem
     "0" oder einem "1e3" griffe daneben, und `undefined` faende erst die
     naechste Zeile. */
  const nr = Number(req.body && req.body.nr);
  const file = Number.isInteger(nr) && nr >= 1 && nr <= files.length ? files[nr - 1] : null;
  if (!file) return res.status(404).json({ error: t(localeOf(req), 'server.backupGone') });

  const full = path.join(target.filePath, file.name);
  let probe = null;
  try {
    probe = new Database(full, { readonly: true });
    probe.pragma("cipher='sqlcipher'");
    probe.pragma(`key="x'${keyHex}'"`);
    /* DER ERSTE GRIFF IST DER, DER DIE ENTSCHEIDUNG FAELLT. */
    probe.prepare('SELECT COUNT(*) AS n FROM sqlite_master').get();
  } catch {
    if (probe) { try { probe.close(); } catch {} }
    return res.json({ ok: false, reason: 'key', at: file.time, bytes: file.bytes, nr });
  }
  try {
    /* VIER ZAHLEN, UND SIE TRAGEN DIE NAMEN DER KARTE „KENNZAHLEN" --
       dort stehen Fotos und Videos getrennt, und ein Wort „Bilder" gibt es
       nicht. */
    const one = (sql) => probe.prepare(sql).get();
    const out = {
      ok: true, nr, at: file.time, bytes: file.bytes,
      itemCount: one('SELECT COUNT(*) AS n FROM items').n,
      photoCount: one("SELECT COUNT(*) AS n FROM photos WHERE COALESCE(kind, 'photo') <> 'video'").n,
      userCount: one("SELECT COUNT(*) AS n FROM users WHERE status <> 'deleted'").n,
      contentUntil: one('SELECT MAX(updated_at) AS t FROM items').t || null
    };
    probe.close();
    return res.json(out);
  } catch {
    try { probe.close(); } catch {}
    // Sie laesst sich oeffnen und kennt `items` nicht: eine fremde
// SQLite-Datei, keine Sicherung dieser Instanz.
    return res.json({ ok: false, reason: 'foreign', at: file.time, bytes: file.bytes, nr });
  }
});

// Einmal beim Start ins Protokoll -- wer den Ort falsch stehen hat, sieht es
// hier und nicht erst am Knopf.
/* DER GRUND WIRD UEBERSETZT UND NICHT ROH HINGESCHRIEBEN. */
{
  const situation = backupState();
  logLine('Backup location: ' + (situation.input
    ? situation.root
    : `off -- ${t('en', situation.reason, situation.values)}`));
}

/* Der letzte Fehler-Handler. */
app.use((err, req, res, next) => {
  console.error(err);
  const locale = localeOf(req);
  /* EINE MELDUNG WIRD HIER UEBERSETZT UND SONST NIRGENDS. */
  /* GEFRAGT WIRD NACH `key` UND NICHT NACH DER KLASSE: auth.js wirft die
     Klasse `Message`, mail.js baut sich dieselbe Form selbst -- es ist ein
     Blatt im Abhaengigkeitsbaum und darf auth.js nicht requiren. */
  if (err && err.key)
    return res.status(err.status || 400).json({ error: t(locale, err.key, err.values || {}) });
  /* multer wirft auf Englisch; die Zahl kommt aus `req.caps`. */
  if (err instanceof multer.MulterError && req.caps) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error:
        t(locale, 'server.uploadSize', { mb: Math.round(req.caps.bytes / 1048576) })});
    if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT')
      return res.status(400).json({ error: t(locale, req.caps.key, { cap: req.caps.count })});
  }
  const rank = err.status || err.statusCode || (err instanceof multer.MulterError ? 400 : 500);
  if (rank >= 500) return res.status(500).json({ error: t(locale, 'server.error') });
  res.status(rank).json({ error: err.message || t(locale, 'server.errorUnknown') });
});

/* ================= Start ================= */
/* AUSDRUECKLICH NUR BILDER. */
/* ================= EIN BESTANDSLAUF NIMMT DEN SERVER NICHT MIT ============
   Aufgefallen an der Meldung „ein Server, der von selbst endet, ist ein
   Fund". */
const BACKFILL_RETRY_MS = 30 * 1000;
let backfillTries = 0;
function backfillThumbnails() {
  try { return backfillRun(); }
  catch (e) {
    /* DREI VERSUCHE UND DANN RUHE. */
    backfillTries++;
    logFail(`Bringing the tiles up to date could not reach the ` +
      `database (${e.code || e.message}) -- attempt ${backfillTries} of 3.` +
      (backfillTries < 3 ? ` Trying again in ${BACKFILL_RETRY_MS / 1000} s.`
                         : ' It is due again on the next start.'));
    if (backfillTries < 3) setTimeout(backfillThumbnails, BACKFILL_RETRY_MS).unref();
  }
}
function backfillRun() {
  const open = db.prepare(
    "SELECT id FROM photos WHERE (thumb IS NULL OR medium IS NULL) AND kind != 'video'").all();
  if (!open.length) return refreshTiles();
  /* maintainStorage() ERST DANACH, und deshalb steht es hier im Abschluss und
     nicht in einer Kette daneben: es fasst die ganze Datei an (beim ersten
     Mal ein VACUUM) und darf nicht neben der Schleife laufen. */
  startBatchThread('thumbnails', open, refreshTiles);
}

/* DIE KACHELN ERNEUERN als Geometrie, als Zuschnitt. */
function refreshTiles() {
  const rows = qTileRows.all();
  if (!rows.length) return maintainStorage();
  startBatchThread('geometry', rows, maintainStorage);
}

/* NICHT MEHR `async`, und das ist keine Kosmetik: nichts darin
   ist asynchron, und seit dieser Runde wird es als ABSCHLUSS eines Threads
   gerufen. */
function maintainStorage() {
  if (db.pragma('auto_vacuum', { simple: true }) !== 2) {
    db.pragma('auto_vacuum = INCREMENTAL');
    db.exec('VACUUM');
    db.pragma('wal_checkpoint(TRUNCATE)');
    logLine('Automatic storage reclaim set up.');
  } else {
    const free = db.pragma('freelist_count', { simple: true });
    const page = db.pragma('page_size', { simple: true });
    if (free * page > 32 * 1024 * 1024) { reclaim(); }
  }
}

/* ---- Versions-Fingerprint ---- */
// Die Versionsnummer kommt aus der package.json und sagt NICHTS ueber die
// uebrigen Dateien.
function filesUnder(directory) {
  const out2 = [];
  for (const e of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, e.name);
    if (e.isDirectory()) out2.push(...filesUnder(full));
    else if (e.isFile()) out2.push(full);
  }
  return out2;
}

/* ER LIEFERT ZWEI DINGE AUS EINEM LAUF: den Gesamtwert und die
   achtzehn Einzelwerte. */
function buildFingerprint() {
  const ran = Object.keys(require.cache).filter(f =>
    f.startsWith(__dirname + path.sep) && !f.split(path.sep).includes('node_modules'));
  /* UND DIE DATEI, DIE NUR IM THREAD LEBT. */
  const list = [...new Set([...ran, BATCHRUN,
                             ...filesUnder(path.join(__dirname, 'public'))])]
    .map(f => path.relative(__dirname, f).split(path.sep).join('/'))
    .sort();
  const h = crypto.createHash('sha256');
  const files = [];
  for (const rel of list) {
    const bytes = fs.readFileSync(path.join(__dirname, rel));
    // Der NAME gehoert mit hinein, sonst bliebe der Fingerprint gleich, wenn
// zwei Dateien ihre Inhalte tauschen oder eine umbenannt wird.
    h.update(rel); h.update('\0');
    h.update(bytes); h.update('\0');
    // DIESELBEN BYTES, EINMAL GELESEN -- der Einzelwert entsteht aus der Puffer,
// die der Gesamtwert gerade verarbeitet hat.
    files.push({ name: rel,
      hash: crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8) });
  }
  return { value: h.digest('hex').slice(0, 8), files };
}

// Beim Start, nach allen require-Aufrufen: erst dann ist require.cache
// vollstaendig.
const FINGERPRINT = buildFingerprint();

/* Sauberes Herunterfahren. */
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    /* ERST DIE THREADS, DANN DIE DATEI. */
    for (const w of batchThreads) { try { w.terminate(); } catch {} }
    try { db.pragma('wal_checkpoint(TRUNCATE)'); db.close(); } catch {}
    process.exit(0);
  });
}

app.listen(PORT, () => {
  // holeBenutzer() ist hier RICHTIG: beim Start gibt es keine Anfrage und
// damit keinen angemeldeten Benutzer.
  const u = auth.getUser();
  logLine(`Running on port ${PORT} -- ` +
    (u ? `owner: ${u.username}` : 'no account yet, set it up in the browser'));
  /* DER PRUEFSCHALTER SAGT SICH AN, F1 und F2. */
  if (keys.testbenchSwitch())
    logLine(`TEST SWITCH ACTIVE (${keys.TESTBENCH_NAME}) -- ` +
      `scrypt N=${auth.SCRYPT_COST}, mail timeouts ${mail.SEND_MS}/${mail.CONNECT_MS}/` +
      `${mail.GREETING_MS} ms. FOR THE TEST BENCH ONLY -- where anyone works ` +
      `with this instance, it belongs removed.`);
  /* Die Betriebsart gehoert ins Protokoll: an ihr haengt, ob die Koepfe des
     Proxys ueberhaupt angesehen werden. */
  logLine(`Behind proxy: ${auth.BEHIND_PROXY ? 'on' : 'off'} -- ` +
    (auth.BEHIND_PROXY
      ? 'X-Forwarded-For and X-Forwarded-Proto are read; over HTTPS that means ' +
        `${auth.COOKIE_SECURE} with Secure and HSTS, over the home network ${auth.COOKIE_NAME}`
      : `no header is read, every request counts as plain: ${auth.COOKIE_NAME} without Secure`));
  /* Die oeffentliche Adresse gehoert ins Protokoll: an ihr haengt, welchen
     Link ein Empfaenger bekommt. */
  if (PUBLIC.problem) {
    logWarn(`PUBLIC_ADDRESS is unusable: ${PUBLIC.problem} ` +
      'The instance keeps running; the invitation link is built by the admin browser, as before.');
  } else if (PUBLIC.address) {
    logLine(`Public address: ${PUBLIC.address} -- ` +
      'invitation links are built from it.');
    if (auth.BEHIND_PROXY && PUBLIC.address.startsWith('http://')) {
      // Widerspruch, aber kein Verlust: ein falscher Link ist ein toter Link.
// Eine Absage waere hier haerter als der Schaden.
      logWarn('Behind a proxy and still http:// in ' +
        'PUBLIC_ADDRESS -- links sent out then lead past the proxy and into ' +
        'the house without HTTPS.');
    }
  } else {
    logLine('Public address: not set -- ' +
      'the invitation link is built by the admin browser.');
  }
  /* Der Mailversand gehoert ins Protokoll, in derselben Form wie die Adresse
     darueber: wer ihn eingerichtet glaubt und es nicht ist, sieht es hier. */
  {
    const raw = getSetting(mail.SETTING_KEY, null);
    const z = mail.state(raw);
    if (mail.configured(raw)) {
      /* DER ANBIETERNAME KOMMT HIER AUF ENGLISCH. */
      const providerShown = z.providerNameKey
        ? t('en', z.providerNameKey) : z.providerName;
      logLine(`Mail delivery: ${providerShown} via ${z.server}:${z.port} ` +
        `(${z.secure ? 'TLS' : 'STARTTLS'}), sender ${z.sender}.` +
        (PUBLIC.address ? '' : ' Without PUBLIC_ADDRESS nothing is sent all the same.'));
    } else {
      logLine('Mail delivery: not set up -- invitation and reset ' +
        'links are there to copy in the admin area, as before.');
    }
  }
  /* DAS NACHRUESTEN, DAS NACHZIEHEN UND DIE SPEICHERPFLEGE, 1500 ms nach dem
     Horchen. */
  setTimeout(backfillThumbnails, 1500);
});
