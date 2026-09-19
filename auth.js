const crypto = require('crypto');
const { db, assignInventory } = require('./db');
const { logLine, logWarn, logFail } = require('./log');
/* DER PRUEFSCHALTER. keys.js haengt an keiner anderen Datei des Repositorys;
   dieses require macht deshalb keinen Kreis auf. */
const keys = require('./keys');
// Nur wegen istAdresse: die Frage "sieht das ueberhaupt nach einer Adresse
// aus" wird an drei Stellen gestellt (Anlegen, eigener Zugang, Versand), und
// drei Muster nebeneinander liefen auseinander.
const mail = require('./mail');
/* Nur wegen der Rechnung: Base32, HMAC ueber den Zaehler, das Fenster. Alles,
   was eine Zeile hat, steht hier -- dieselbe Teilung wie bei mail.js. */
const zf = require('./twofactor');

/* ================= Die Fehlerklasse „Message" ================= */
/* Ein Fehler dieser Datei traegt einen Schluessel und keinen Satz; den Satz
   liest server.js aus der Sprachdatei. */
/* Der Uebersetzer fuer die zwei Antworten, die diese Datei selbst gibt.
   Er nimmt die Anfrage und nicht die Sprache. */
let translate = (req, key) => `\u27e6${key}\u27e7`;
function setTranslator(fn) { translate = fn; }

/* Die Locale des Vergleichs, beim Start hereingereicht. */
let comparisonLocale = () => undefined;
function setCompareLocale(fn) { comparisonLocale = fn; }

class Message extends Error {
  constructor(key, values = {}, status = 400) {
    super(key);
    this.name = 'Message';
    this.key = key;
    this.values = values;
    this.status = status;
  }
}

/* BEHIND_PROXY -- ein Kopf vom Aufrufer ist eine Behauptung und keine
   Feststellung. */
/* Die Umgebungsvariablen heissen englisch, der alte Name gilt weiter und
   meldet sich im Containerprotokoll. */
function fromEnv(name, oldName) {
  const value = process.env[name];
  if (String(value ?? '').trim() !== '') return value;
  const old = process.env[oldName];
  if (String(old ?? '').trim() !== '') {
    logWarn(`${oldName} is called ${name} now -- the old name ` +
      'is still read. Please update your .env.');
    return old;
  }
  return value;
}

const BEHIND_PROXY = /^(1|true|ja|an|yes|on)$/i.test(String(fromEnv('BEHIND_PROXY', 'HINTER_PROXY') || '').trim());

/* Kam diese Anfrage ueber den Proxy? Daran haengen Cookiename, Secure und
   HSTS, je Anfrage. */
function viaProxy(req) {
  if (!BEHIND_PROXY) return false;
  const chain = String((req && req.headers && req.headers['x-forwarded-proto']) || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return chain.length > 0 && chain[chain.length - 1] === 'https';
}

/* Zwei Cookienamen, keiner mit bedingtem Secure. */
const COOKIE_NAME = 'kriterion_session';
const COOKIE_SECURE = `__Host-${COOKIE_NAME}`;
const cookieName = (req) => viaProxy(req) ? COOKIE_SECURE : COOKIE_NAME;

/* Der Token gegen fremde Formulare, in denselben zwei Formen. Er reist OHNE
   HttpOnly: das Skript muss ihn lesen koennen, um ihn mitzuschicken. */
const CSRF_NAME = 'kriterion_csrf';
const CSRF_SECURE = `__Host-${CSRF_NAME}`;
const csrfName = (req) => viaProxy(req) ? CSRF_SECURE : CSRF_NAME;
const CSRF_HEADER = 'x-csrf-token';

/* Die oeffentliche Adresse -- hier steht nur, welcher Wert gilt. Alles ab ?
   und # sowie Zugangsdaten werden abgewiesen, ein Pfad ist erlaubt. */
/* Das Feld heisst `problem` und nicht wie die Absage einer Route: der Satz
   landet auf dem Bildschirm des Wirts und hat keinen Schluessel in der
   Sprachdatei. */
function checkPublicAddress(raw) {
  const value = String(raw || '').trim();
  if (!value) return { address: '', set: false };
  let u;
  try { u = new URL(value); }
  catch { return { address: '', set: true, problem: 'That is not a complete address.' }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:')
    return { address: '', set: true, problem: 'Only http:// and https:// are possible.' };
  if (!u.hostname)
    return { address: '', set: true, problem: 'The host name is missing.' };
  if (u.username || u.password)
    return { address: '', set: true, problem: 'Credentials do not belong in the address.' };
  if (u.search) return { address: '', set: true, problem: 'A query (?) is not allowed.' };
  if (u.hash) return { address: '', set: true, problem: 'A fragment (#) is not allowed.' };
  // Ohne abschliessenden Schraegstrich, damit der Link genau eine Form hat.
  const address = (u.origin + u.pathname).replace(/\/+$/, '');
  return { address, set: true };
}
const PUBLIC_ADDRESS = checkPublicAddress(fromEnv('PUBLIC_ADDRESS', 'OEFFENTLICHE_ADRESSE'));

const SESSION_DAYS = 30;

// --- Passwoerter -------------------------------------------------------
// scrypt aus Nodes eingebautem crypto, keine neue Abhaengigkeit.
const PASSWORD_MIN = 10;
/* Die ausgelieferte Kostenstufe, als Zahl und nicht als Umgebungsvariable:
   `N` ist eine Sicherheitsgrenze. */
const SCRYPT_SHIPPED = 16384;
const SCRYPT = { N: keys.scryptCost(SCRYPT_SHIPPED), r: 8, p: 1, keylen: 64 };

function scryptCompute(password, salt, k) {
  return new Promise((done, error) => {
    crypto.scrypt(password, salt, k.keylen, { N: k.N, r: k.r, p: k.p },
      (e, buf) => e ? error(e) : done(buf));
  });
}

function buildValue(salt, hash, k) {
  return `scrypt$${k.N}$${k.r}$${k.p}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return buildValue(salt, await scryptCompute(String(password), salt, SCRYPT), SCRYPT);
}

// Gleiche Rechnung, aber ohne Event Loop -- nur fuer den Startvorgang,
// wo ohnehin niemand wartet.
function hashPasswordSync(password) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(String(password), salt, SCRYPT.keylen,
    { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return buildValue(salt, h, SCRYPT);
}

async function checkPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const want = Buffer.from(parts[4 + 1], 'hex');
  if (!want.length) return false;
  let got;
  try {
    got = await scryptCompute(String(password), Buffer.from(parts[4], 'hex'),
      { N: +parts[1], r: +parts[2], p: +parts[3], keylen: want.length });
  } catch { return false; }
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

// Gegen Zeitmessung am Benutzernamen: ein unbekannter Name darf nicht messbar
// schneller abgewiesen werden als ein falsches Passwort.
const DUMMY_VALUE = hashPasswordSync(crypto.randomBytes(16).toString('hex'));

// --- Zugang ------------------------------------------------------------
// Drei Rollen als Leiter: user < admin < eigentuemer (Begruendung am Schema
// in db.js).
const ROLES = ['user', 'admin', 'owner'];

// Der Name eines geloeschten Zugangs. Der urspruengliche wird ueberschrieben
// und ist damit wieder frei.
const tombstoneName = (id) => `deleted-${id}`;
/* Damit ein lebender Zugang nicht wie ein Grabstein aussehen kann: das Muster
   ist als Benutzername gesperrt, in beiden Schreibweisen -- der Grabstein
   hiess frueher `geloescht-<nr>`. */
const TOMBSTONE_PATTERN = /^(deleted|geloescht)-\d+$/i;

// Der EIGENTUEMER mit der kleinsten Nummer -- wer ihn ruft, meint den
// Eigentuemer der Instanz, nie den Angemeldeten (dafuer gibt es
// req.benutzer).
const getUser = () =>
  db.prepare("SELECT id, username, password_hash FROM users " +
             "WHERE role = 'owner' ORDER BY id LIMIT 1").get() || null;

// Der Kandidat zur Anmeldung.
const getUserByName = (name) =>
  db.prepare('SELECT id, username, password_hash, role, status FROM users WHERE username = ?')
    .get(String(name || '')) || null;

const userExists = () => db.prepare('SELECT COUNT(*) n FROM users').get().n > 0;

// Der Name steht fuer sich, weil er an zwei Wegen geprueft wird: beim Anlegen
// (immer mit Passwort) und beim blossen Umbenennen in changeUser().
function checkName(name) {
  const n = String(name || '').trim();
  if (!n) throw new Message('login.usernameMissing');
  if (TOMBSTONE_PATTERN.test(n))
    throw new Message('login.nameReserved');
  return n;
}

function checkRules(name, password) {
  checkName(name);
  if (String(password || '').length < PASSWORD_MIN)
    throw new Message('login.passwordTooShort', { min: PASSWORD_MIN });
}

// Legt den ersten Zugang an.
async function createFirstUser(name, password) {
  checkRules(name, password);
  const hash = await hashPassword(password);
  const r = db.prepare(
    "INSERT INTO users (username, password_hash, role) " +
    "SELECT ?, ?, 'owner' WHERE NOT EXISTS (SELECT 1 FROM users)"
  ).run(String(name).trim(), hash);
  if (r.changes === 0) throw new Message('server.setupDone');
  // Zweite Aufrufstelle des Auffangnetzes aus db.js: beim Start einer leeren
  // Instanz lief es ins Leere, weil es noch keinen Benutzer gab -- dieser Weg
  // liefert ihn erst jetzt nach.
  assignInventory();
  // Die erste Zeile des Sicherheitsprotokolls: die Instanz bekommt ihren
// Eigentuemer. Er handelt an sich selbst -- es gibt sonst niemanden.
  log('user.new', { actor: r.lastInsertRowid, target: r.lastInsertRowid, detail: 'owner' });
  return { id: r.lastInsertRowid, username: String(name).trim() };
}

// Aendert Name und/oder Passwort DES ANGEMELDETEN Benutzers.
/* Die Adresse aendert nur, wer sie hat -- sonst boege ein Admin die naechste
   Ruecksetzmail auf ein Postfach seiner Wahl. */
async function changeUser(userId, oldPassword, newName, newPassword, newAddress) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Ein Zugangswechsel braucht den angemeldeten Benutzer.');
  const u = db.prepare('SELECT id, username, password_hash, email FROM users WHERE id = ?').get(id);
  if (!u) throw new Message('login.noUserYet');
  if (!await checkPassword(String(oldPassword || ''), u.password_hash))
    throw new Message('login.oldPasswordWrong');
  const name = String(newName || '').trim() || u.username;
  const changes = String(newPassword || '').length > 0;
  // checkName laeuft auf BEIDEN Wegen; checkRules greift nur beim
// Passwortwechsel.
  if (changes) checkRules(name, newPassword);
  else checkName(name);
  // Die Spalte traegt UNIQUE COLLATE NOCASE.
  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE AND id != ?').get(name, u.id))
    throw new Message('login.usernameTaken');
  const hash = changes ? await hashPassword(newPassword) : u.password_hash;
  /* Die Adresse wird GEPRUEFT, bevor irgendetwas geschrieben wird -- eine
     Absage, die den Namen schon gewechselt hat, waere schlimmer als keine. */
  const addressMeant = newAddress !== undefined;
  const address = addressMeant ? String(newAddress || '').trim() : null;
  if (addressMeant && address && !mail.isAddress(address))
    throw new Message('login.emailInvalid');
  /* Ist die Adresse schon vergeben? */
  if (addressMeant && address &&
      db.prepare('SELECT 1 FROM users WHERE email = ? COLLATE NOCASE AND id != ?')
        .get(address, u.id))
    throw new Message('login.emailTaken');
  db.prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?').run(name, hash, u.id);
  if (addressMeant)
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(address || null, u.id);
  /* Protokolliert wird, was sich wirklich bewegt hat; 'both' heisst „mehr
     als eines". */
  const renamed = name !== u.username;
  const addressNew = addressMeant && (address || null) !== (u.email || null);
  const moved = [renamed && 'name', changes && 'password', addressNew && 'address'].filter(Boolean);
  const detail = moved.length > 1 ? 'both' : moved[0] || null;
  if (detail) log('user.self', { actor: u.id, target: u.id, detail });
  return { username: name, passwordChanged: changes, email: addressMeant ? address : (u.email || '') };
}

/* Zugangsverwaltung -- ein Ort, zwei Rufer: die Verwaltungskarte in server.js
   und usertool.js auf dem Wirt. */

const getUser2 = (id) =>
  db.prepare('SELECT id, username, role, status, email, last_login, created_at FROM users WHERE id = ?')
    .get(Number(id)) || null;

// Die Liste fuer die Verwaltungskarte.
/* Abgeleitet aus password_hash und nicht aus last_login: „hat sich nie
   angemeldet" ist nicht dasselbe wie „kann sich nicht anmelden". */
const listUsers = () => db.prepare(
  `SELECT u.id, u.username, u.role, u.status, u.last_login, u.created_at,
          (u.password_hash = '') AS withoutPassword,
          (SELECT COUNT(*) FROM items i WHERE i.user_id = u.id) AS entries
     FROM users u ORDER BY u.id`
).all().map(z => ({ ...z, withoutPassword: Boolean(z.withoutPassword) }));

// Zaehlt die Eigentuemer, die sich noch anmelden koennen.
const ownerCount = () => db.prepare(
  "SELECT COUNT(*) AS n FROM users WHERE role = 'owner' AND status = 'active'"
).get().n;

/* „Ohne Passwort" wird ausdruecklich verlangt und nie durch Weglassen. */
async function createUser(name, password, role = 'user', withoutPassword = false, actor, address) {
  if (withoutPassword === true) checkName(name);
  else checkRules(name, password);
  if (!ROLES.includes(role)) throw new Message('login.roleUnknown');
  const clean = String(name).trim();
  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE').get(clean))
    throw new Message('login.usernameTaken');
  /* Die Adresse beim Anlegen, und nur hier. */
  const mailAddress = String(address || '').trim();
  if (mailAddress && !mail.isAddress(mailAddress))
    throw new Message('login.emailInvalid');
  // Und dieselbe Frage wie in changeUser -- die Begruendung steht dort. Hier
// gibt es noch keine eigene Zeile, also auch kein `id != ?`.
  if (mailAddress &&
      db.prepare('SELECT 1 FROM users WHERE email = ? COLLATE NOCASE').get(mailAddress))
    throw new Message('login.emailTaken');
  const hash = withoutPassword === true ? '' : await hashPassword(password);
  const acting = checkActor(actor);
  const r = db.prepare('INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, ?, ?)')
    .run(clean, hash, role, mailAddress || null);
  log('user.new', { actor: acting, target: r.lastInsertRowid, detail: role });
  return { id: r.lastInsertRowid, username: clean, role: role,
           withoutPassword: hash === '', email: mailAddress };
}

// Setzt ein Passwort ohne das bisherige zu kennen -- fuer den Admin, der es
// zuruecksetzt, und fuer usertool.js.
async function setNewPassword(userId, newPassword, actor) {
  const acting = checkActor(actor);
  const u = getUser2(userId);
  if (!u) throw new Message('server.userUnknown');
  if (u.status === 'deleted') throw new Message('server.userDeleted');
  if (String(newPassword || '').length < PASSWORD_MIN)
    throw new Message('login.passwordTooShort', { min: PASSWORD_MIN });
  const hash = await hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, u.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
  log('user.password', { actor: acting, target: u.id });
  return { id: u.id, username: u.username };
}

function setRole(userId, role, actor) {
  const acting = checkActor(actor);
  const u = getUser2(userId);
  if (!u) throw new Message('server.userUnknown');
  if (u.status === 'deleted') throw new Message('server.userDeleted');
  if (!ROLES.includes(role)) throw new Message('login.roleUnknown');
  // Der letzte Eigentuemer darf nicht verschwinden -- weder durch Herabstufen
  // noch weiter unten durch Sperren oder Loeschen.
  if (u.role === 'owner' && role !== 'owner' && ownerCount() <= 1)
    throw new Message('login.lastOwner');
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, u.id);
  log('user.role', { actor: acting, target: u.id, detail: role });
  return { id: u.id, username: u.username, role: role };
}

function setStatus(userId, status, actor) {
  const acting = checkActor(actor);
  const u = getUser2(userId);
  if (!u) throw new Message('server.userUnknown');
  if (u.status === 'deleted') throw new Message('server.userDeleted');
  if (status !== 'active' && status !== 'locked')
    throw new Message('login.statusNotSettable');
  if (u.role === 'owner' && status !== 'active' && ownerCount() <= 1)
    throw new Message('login.lastOwner');
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, u.id);
  // Erste von zwei Schichten.
  /* Der zweite Faktor bleibt dabei stehen. */
  if (status !== 'active') {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(u.id);
  }
  log('user.status', { actor: acting, target: u.id, detail: status });
  return { id: u.id, username: u.username, status };
}

/* Was an einem Zugang haengt, getrennt nach eigen und fremd -- die Zahlen
   tragen den Loeschdialog. IS NOT statt !=, weil user_id nullbar ist. */
function countInventory(userId) {
  const id = Number(userId);
  const one = (sql, ...w) => db.prepare(sql).get(...w).n;
  const ownItems = 'SELECT id FROM items WHERE user_id = ?';
  return {
    entries: one('SELECT COUNT(*) n FROM items WHERE user_id = ?', id),
    // an SEINEN Eintraegen, von anderen geschrieben -- faellt mit den Eintraegen
    foreignComments: one(`SELECT COUNT(*) n FROM comments WHERE user_id IS NOT ? AND item_id IN (${ownItems})`, id, id),
    foreignRatings: one(`SELECT COUNT(*) n FROM ratings WHERE user_id IS NOT ? AND item_id IN (${ownItems})`, id, id),
    foreignTestDays: one(`SELECT COUNT(*) n FROM test_days WHERE user_id IS NOT ? AND item_id IN (${ownItems})`, id, id),
    foreignLinks: one(`SELECT COUNT(*) n FROM links WHERE user_id IS NOT ? AND item_id IN (${ownItems})`, id, id),
    foreignFiles: one(`SELECT COUNT(*) n FROM attachments WHERE user_id IS NOT ? AND item_id IN (${ownItems})`, id, id),
    // SEINE Beitraege in FREMDEN Eintraegen -- das zweite Haekchen
    comments: one(`SELECT COUNT(*) n FROM comments WHERE user_id = ? AND item_id NOT IN (${ownItems})`, id, id),
    ratings: one(`SELECT COUNT(*) n FROM ratings WHERE user_id = ? AND item_id NOT IN (${ownItems})`, id, id),
    testDays: one(`SELECT COUNT(*) n FROM test_days WHERE user_id = ? AND item_id NOT IN (${ownItems})`, id, id),
    // Der fuenfte und der sechste Traeger.
    links: one(`SELECT COUNT(*) n FROM links WHERE user_id = ? AND item_id NOT IN (${ownItems})`, id, id),
    files: one(`SELECT COUNT(*) n FROM attachments WHERE user_id = ? AND item_id NOT IN (${ownItems})`, id, id)
  };
}

/* Der Grabstein. Die Zeile bleibt mit ihrer id stehen, damit user_id auf
   etwas zeigt und die Beitraege ohne Namen sichtbar bleiben. */
function removeUser(userId, options = {}, actor) {
  const acting = checkActor(actor);
  const u = getUser2(userId);
  if (!u) throw new Message('server.userUnknown');
  if (u.status === 'deleted') throw new Message('login.userDeleted');
  if (u.role === 'owner' && ownerCount() <= 1)
    throw new Message('login.lastOwner');
  const counts = countInventory(u.id);
  db.transaction(() => {
    // Reihenfolge: erst die Eintraege, dann der Rest. Umgekehrt zaehlte das
// zweite Haekchen Zeilen mit, die das erste ohnehin mitgenommen haette.
    if (options.entries) db.prepare('DELETE FROM items WHERE user_id = ?').run(u.id);
    if (options.posts) {
      db.prepare('DELETE FROM comments WHERE user_id = ?').run(u.id);
      db.prepare('DELETE FROM ratings WHERE user_id = ?').run(u.id);
      db.prepare('DELETE FROM test_days WHERE user_id = ?').run(u.id);
      // Der Dialog nennt seine Links und Dateien; also gehen sie hier auch
// mit. Eine Zahl im Dialog, die nichts bewirkt, waere schlimmer als keine.
      db.prepare('DELETE FROM links WHERE user_id = ?').run(u.id);
      db.prepare('DELETE FROM attachments WHERE user_id = ?').run(u.id);
    }
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
    // Die Kaskade an tokens.user_id greift hier nie -- die Zeile bleibt ja als
// Grabstein stehen. Also von Hand, aus demselben Grund wie beim Sperren.
    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM item_pins WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM user_settings WHERE user_id = ?').run(u.id);
    /* Der zweite Faktor geht mit, wie die Token: die Kaskade greift am
       Grabstein nie. */
    db.prepare('DELETE FROM two_factor WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM two_factor_codes WHERE user_id = ?').run(u.id);
    db.prepare("UPDATE users SET username = ?, password_hash = '', role = 'user', " +
               "status = 'deleted', email = NULL WHERE id = ?")
      .run(tombstoneName(u.id), u.id);
  })();
  /* Nach der Transaktion und nicht darin. Die Zeile bleibt stehen: der
     Grabstein traegt seine Nummer weiter, target zeigt auf etwas. */
  log('user.delete', { actor: acting, target: u.id });
  return { id: u.id, name: u.username, tombstone: tombstoneName(u.id), counts, options };
}

// --- AUTH_RESET wird abgelehnt ------------------------------------------
// Ein Zuruecksetzen ueber eine Umgebungsvariable gibt es nicht: es machte
// alle Zugaenge und Zuordnungen mit einem Schlag kaputt.
if (process.env.AUTH_RESET) {
  logWarn('AUTH_RESET has not been carried out since version 0.8.0 and ' +
    'has no effect. The line can be removed from .env. Forgotten password: ' +
    'docker compose exec kriterion node usertool.js passwort <name> -- ' +
    'remove an account: node usertool.js entfernen <name>.');
}

// AUTH_USER/AUTH_PASSWORD werden nicht mehr gelesen. Der erste Zugang entsteht
// ueber die Einrichtungsseite; wer die Zeilen noch in der .env hat, erfaehrt es.
if (process.env.AUTH_USER || process.env.AUTH_PASSWORD) {
  logWarn('AUTH_USER/AUTH_PASSWORD are no longer read and can be ' +
    'removed from .env. The first account is created on the setup page.');
}

// --- Bremse gegen Durchprobieren ---------------------------------------
// Ohne Sperre laesst sich ein Passwort beliebig oft raten. Die Zaehler liegen
// in login_attempts: im Arbeitsspeicher setzte ein Neustart sie auf null.
const SOFT_LIMIT = 5;    // ab hier verzoegerte Antwort
const HARD_LIMIT = 10;   // ab hier gesperrt -- NUR bei der IP
const BLOCK_SECONDS = 5 * 60;
// Wie lange eine Zeile ohne neuen Versuch stehen bleibt.
const ATTEMPT_KEEP_MINUTES = 60;

const keyIp = (ip) => `ip:${ip}`;
const keyName = (name) =>
  `name:${String(name || '').trim().toLocaleLowerCase(comparisonLocale())}`;

/* `blocked` rechnet SQLite aus: zwei Uhren -- die der Datenbank und die des
   Prozesses -- waeren zwei Wahrheiten darueber, wann eine Sperre endet. */
const qAttempt = db.prepare(
  `SELECT tries, until, (until IS NOT NULL AND until > datetime('now')) AS blocked,
          CAST(ROUND((julianday(until) - julianday('now')) * 86400) AS INTEGER) AS lefts
     FROM login_attempts WHERE who = ?`);
const bumpAttempt = db.prepare(
  `INSERT INTO login_attempts (who, tries) VALUES (?, 1)
     ON CONFLICT(who) DO UPDATE SET tries = tries + 1, seen_at = datetime('now')`);
const blockAttempt = db.prepare(
  `UPDATE login_attempts SET until = datetime('now', ?) WHERE who = ?`);
const delAttempt = db.prepare('DELETE FROM login_attempts WHERE who = ?');

// Dieselbe Kurve fuer beide Zaehler: eine zweite Rechnung daneben waere eine
// zweite Wahrheit darueber, wie stark gebremst wird.
function delay(count) {
  const over = Math.max(0, count - SOFT_LIMIT + 1);
  return over > 0 ? Math.min(over * 700, 4000) : 0;
}

/* Eine Funktion, zwei Aufrufstellen: beim Start und stuendlich. Eine laufende
   Sperre bleibt stehen, auch wenn ihre Zeile alt ist. */
const delAttemptsOld = db.prepare(
  `DELETE FROM login_attempts WHERE seen_at < datetime('now', ?)
     AND (until IS NULL OR until <= datetime('now'))`);
function cleanupAttempts() {
  const n = delAttemptsOld.run(`-${ATTEMPT_KEEP_MINUTES} minutes`).changes;
  if (n) logLine(`Login attempts: ${n} row(s) idle for more than ` +
    `${ATTEMPT_KEEP_MINUTES} minutes and removed.`);
  return n;
}

/* Die Adresse des Aufrufers -- Grundlage der Anmeldebremse. */
function clientIp(req) {
  if (BEHIND_PROXY) {
    const chain = String(req.headers['x-forwarded-for'] || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    if (chain.length) return chain[chain.length - 1];
  }
  return req.socket.remoteAddress || 'unbekannt';
}

function checkThrottle(ip, name) {
  let delayMs = 0;
  const a = qAttempt.get(keyIp(ip));
  if (a) {
    // Eine Sekunde als Untergrenze: 0 hiesse "gleich wieder", und das stimmt nicht.
    if (a.blocked) return { blocked: true, retryInSec: Math.max(1, a.lefts) };
    if (a.until) delAttempt.run(keyIp(ip));
    else delayMs = delay(a.tries);
  }
  const b = qAttempt.get(keyName(name));
  if (b) delayMs = Math.max(delayMs, delay(b.tries));
  /* Kurz gestellt wartet die Route kuerzer, die Kurve bleibt die Kurve:
     gezaehlt, gesperrt und geantwortet wird wie ohne Schalter. */
  return { blocked: false, delayMs: keys.brakeWait(delayMs) };
}

function noteFailure(ip, name) {
  bumpAttempt.run(keyIp(ip));
  const a = qAttempt.get(keyIp(ip));
  /* Jeder weitere Fehlversuch schiebt das Ende nach hinten -- wer waehrend
     der Sperre weiterraet, verlaengert sie. */
  if (a.tries >= HARD_LIMIT) blockAttempt.run(`+${BLOCK_SECONDS} seconds`, keyIp(ip));
  // Ohne until: der Name bekommt bewusst keine harte Sperre.
  if (String(name || '').trim()) bumpAttempt.run(keyName(name));
}

function noteSuccess(ip, name) {
  delAttempt.run(keyIp(ip));
  if (String(name || '').trim()) delAttempt.run(keyName(name));
}

// --- Sitzungen ---------------------------------------------------------
/* Liest alle Cookies des Hosts. */
function parseCookies(req) {
  const h = req.headers.cookie;
  if (!h) return {};
  const out = {};
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    let value;
    try { value = decodeURIComponent(part.slice(i + 1).trim()); }
    catch { continue; }
    out[part.slice(0, i).trim()] = value;
  }
  return out;
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) { crypto.timingSafeEqual(ba, ba); return false; }
  return crypto.timingSafeEqual(ba, bb);
}

// Liefert die Benutzerzeile oder null. Die Sitzung muss wissen, WER sich da
// angemeldet hat.
async function checkLogin(name, password) {
  const u = getUserByName(name);
  // Auch ohne Zugang wird gerechnet, sonst verraet die Antwortzeit, ob der
  // Benutzername stimmt.
  const nameMatches = u ? safeEqual(name || '', u.username) : false;
  const passwordMatches = await checkPassword(password || '',
    (u && u.password_hash) ? u.password_hash : DUMMY_VALUE);
  if (nameMatches && passwordMatches) return u;
  /* Die einzige Protokollzeile, die ein Fremder ausloesen kann. Der getippte
     Name geht nicht mit in die Tabelle. */
  log('login.fail', { actor: null, target: nameMatches ? u.id : null });
  return null;
}

// Eine Sitzung entsteht in dieser Anwendung ausschliesslich durch eine
// Anmeldung -- ueber die Anmeldeseite oder ueber die Ersteinrichtung.
function createSession(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Eine Sitzung braucht einen Benutzer.');
  }
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, id);
  db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`).run(id);
  /* Hier und nicht an den drei Aufrufstellen einzeln: eine Sitzung entsteht
     ausschliesslich durch eine Anmeldung. */
  log('login.ok', { actor: id, target: id });
  return token;
}

function destroySession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  // Mit der Sitzung faellt ihre offene Freigabe.
  dropRelease(token);
}

function pruneSessions() {
  db.prepare(`DELETE FROM sessions WHERE last_seen < datetime('now', '-${SESSION_DAYS} days')`).run();
}

/* Meine Sitzungen. */
const sessionIdOf = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

/* SQLite kann SHA-256 nicht rechnen, also entsteht die Kennung hier. Die
   Abfrage greift ueber idx_sessions_user. */
function sessionsOf(userId, ownToken) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Eine Sitzungsliste braucht den angemeldeten Benutzer.');
  return db.prepare(
    `SELECT token, created_at, last_seen FROM sessions
      WHERE user_id = ? AND last_seen >= datetime('now', '-${SESSION_DAYS} days')
      ORDER BY last_seen DESC, created_at DESC`
  ).all(id).map(z => ({
    id: sessionIdOf(z.token),
    loggedInAt: z.created_at,
    lastSeen: z.last_seen,
    // Die eigene ist markiert, damit die Karte sie nicht mit "alle anderen"
// wegnimmt -- man wuerde sich sonst selbst hinauswerfen.
    current: Boolean(ownToken) && z.token === ownToken
  }));
}

// Beendet EINE Sitzung des angemeldeten Benutzers.
function endSession(userId, sessionId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Das Beenden braucht den angemeldeten Benutzer.');
  const z = db.prepare('SELECT token FROM sessions WHERE user_id = ?').all(id)
    .find(r => sessionIdOf(r.token) === String(sessionId || ''));
  if (!z) return 0;
  return db.prepare('DELETE FROM sessions WHERE token = ? AND user_id = ?')
    .run(z.token, id).changes;
}

/* Ein Ort, zwei Rufer: der Passwortwechsel in PUT /api/account und der Knopf
   „alle anderen beenden". */
function endOtherSessions(userId, ownToken) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Das Beenden braucht den angemeldeten Benutzer.');
  return db.prepare('DELETE FROM sessions WHERE token != ? AND user_id = ?')
    .run(String(ownToken || ''), id).changes;
}

/* Token: ein Mechanismus, zwei Anlaesse. */
const TOKEN_DAYS = 7;
// Wie lange die BENUTZTE Zeile als Spur stehen bleibt, gerechnet ab Ablauf.
// Eine Schwelle statt zweier: ein Wert, eine Regel, eine Gegenprobe.
const TOKEN_TRACE_DAYS = 30;
const TOKEN_PURPOSES = ['invite', 'reset'];

/* Die Frist ab dem ersten Oeffnen. Ein Vorschaudienst loest sie nicht aus:
   der Schluessel steht im Fragment und geht nie an den Server. */
const TOKEN_DEADLINE_MINUTES = 15;

// Liefert den Ablauf, der danach gilt -- fuer den Aufrufer, der ihn nennen
// will.
const setDeadline = db.prepare(
  `UPDATE tokens SET expires_at = datetime('now', ?)
    WHERE hash = ? AND used_at IS NULL AND expires_at > datetime('now', ?)`);
function startTokenDeadline(hash) {
  const modifier = `+${TOKEN_DEADLINE_MINUTES} minutes`;
  // ZWEI MODIFIKATOREN WAEREN ZWEI ARGUMENTE -- hier steht
// derselbe zweimal, einmal als neuer Wert und einmal als Schranke davor.
  setDeadline.run(modifier, String(hash || ''), modifier);
  return TOKEN_DEADLINE_MINUTES;
}

const tokenHash = (raw) => crypto.createHash('sha256').update(String(raw)).digest('hex');

/* Eine Funktion, zwei Aufrufstellen: beim Start und beim Oeffnen der Karte.
   Eine Instanz, die drei Monate durchlaeuft, raeumte sonst nicht auf. */
const delTokensOld = db.prepare("DELETE FROM tokens WHERE expires_at < datetime('now', ?)");
function cleanupTokens() {
  const n = delTokensOld.run(`-${TOKEN_TRACE_DAYS} days`).changes;
  if (n) logLine(`Tokens: ${n} row(s) expired for more than ` +
    `${TOKEN_TRACE_DAYS} days and removed.`);
  return n;
}

/* Erzeugt einen Token und gibt den Klartext genau einmal zurueck; danach
   steht er nirgends mehr. Die Rechtefrage entscheidet server.js. */
function createToken(userId, purpose, actor) {
  const acting = checkActor(actor);
  const u = getUser2(userId);
  if (!u) throw new Message('server.userUnknown');
  if (u.status !== 'active') throw new Message('login.userInactive');
  if (!TOKEN_PURPOSES.includes(purpose)) throw new Message('server.purposeUnknown');
  const plain = crypto.randomBytes(32).toString('hex');
  db.prepare(
    `INSERT INTO tokens (hash, user_id, purpose, expires_at)
     VALUES (?, ?, ?, datetime('now', ?))`
  ).run(tokenHash(plain), u.id, purpose, `+${TOKEN_DAYS} days`);
  // Ein Link IST ein Passwortersatz auf Zeit -- deshalb steht sein Entstehen im
// Sicherheitsprotokoll, und zwar mit dem Anlass. Der Schluessel selbst nie.
  log('link.new', { actor: acting, target: u.id, detail: purpose });
  return {
    plain, purpose, id: u.id, username: u.username,
    // Der Bildschirmtext leitet sich aus dem ZUSTAND ab, nicht aus zweck --
    // sonst stuenden zwei Wahrheiten nebeneinander, sobald jemand einen
    // Einladungslink an einen Zugang schickt, der laengst ein Passwort hat.
    withoutPassword: !db.prepare('SELECT password_hash h FROM users WHERE id = ?').get(u.id).h,
    days: TOKEN_DAYS
  };
}

/* Schlaegt den Token nach -- er ist der Schluessel und kein verglichener
   Wert. */
function checkToken(plain) {
  const raw = String(plain || '');
  if (!raw) return null;
  const z = db.prepare(
    `SELECT t.hash, t.user_id, t.purpose, t.expires_at, u.username, u.status, u.password_hash
       FROM tokens t JOIN users u ON u.id = t.user_id
      WHERE t.hash = ? AND t.used_at IS NULL AND t.expires_at > datetime('now')`
  ).get(tokenHash(raw));
  if (!z || z.status !== 'active') return null;
  return {
    hash: z.hash, id: z.user_id, username: z.username, purpose: z.purpose,
    expires_at: z.expires_at, withoutPassword: !z.password_hash
  };
}

/* Loest ein. Eine Transaktion; alle uebrigen offenen Token dieses Benutzers
   fallen mit, die Sitzungen ueber setNewPassword. */
async function redeemToken(plain, newPassword) {
  const token = checkToken(plain);
  if (!token) throw new Message('server.linkExpired');
  if (String(newPassword || '').length < PASSWORD_MIN)
    throw new Message('login.passwordTooShort', { min: PASSWORD_MIN });
  // Ausserhalb der Transaktion: scrypt rechnet absichtlich lange, und eine
// Transaktion soll nicht so lange offen stehen.
  const hash = await hashPassword(newPassword);
  db.transaction(() => {
    // Zwischen der Frage in checkToken und dieser Zeile liegt das await auf
    // hashPassword, und scrypt gibt den Event Loop frei. Ohne `AND used_at IS
    // NULL` sehen zwei gleichzeitige Anfragen beide ein freies Token, und die
    // zweite ueberschreibt das Passwort der ersten. `changes` sagt, wer zuerst
    // da war.
    const taken = db.prepare(
      "UPDATE tokens SET used_at = datetime('now') WHERE hash = ? AND used_at IS NULL"
    ).run(token.hash);
    if (!taken.changes) throw new Message('server.linkExpired');
    db.prepare('DELETE FROM tokens WHERE user_id = ? AND used_at IS NULL').run(token.id);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, token.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(token.id);
  })();
  // Der Einloesende handelt an sich selbst -- er ist ja gerade dabei, sein
// eigenes Passwort zu setzen. Die Zeile steht NACH der Transaktion.
  log('link.use', { actor: token.id, target: token.id, detail: token.purpose });
  return { id: token.id, username: token.username, purpose: token.purpose };
}

/* Die Selbstanmeldung. Eine Anfrage ist noch kein Zugang -- der Admin
   schaltet immer frei. */
const REQUEST_HOURS = 24;
/* Kuerzer als die sieben Tage des Einladungslinks: dort hat ein Admin den
   Zugang angelegt, hier steht die Zeile auf der Behauptung eines Fremden. */
const REQUEST_CAP = 20;
/* Eine Laengengrenze, und sie gilt nur hier: das ist die einzige Stelle, an
   der ein Fremder etwas in die Datenbank schreibt. */
const REQUEST_NAME_MAX = 64;
const REQUEST_MAIL_MAX = 254;

/* Der Deckel zaehlt bestaetigte und unbestaetigte zusammen: sonst fuellte
   ein Angreifer die Tabelle mit Unbestaetigten, ohne eine Mail zu lesen. */
const qRequestCount = db.prepare('SELECT COUNT(*) n FROM requests');
const countRequests = () => qRequestCount.get().n;

/* Wie cleanupTokens(), mit drei Aufrufstellen: Start, Karte und Anfrageroute
   -- die dritte vor der Deckelpruefung. */
const delRequestsOld = db.prepare(
  "DELETE FROM requests WHERE confirmed_at IS NULL AND created_at < datetime('now', ?)");
function cleanupRequests() {
  const n = delRequestsOld.run(`-${REQUEST_HOURS} hours`).changes;
  if (n) logLine(`Sign-up: ${n} unconfirmed request(s) older than ` +
    `${REQUEST_HOURS} hours removed.`);
  return n;
}

/* Legt eine Anfrage an und liefert den Klartext des Schluessels -- oder null,
   die stille Verwerfung: unbrauchbarer Name, unbrauchbare Adresse, Name
   vergeben, Adresse vergeben, Deckel erreicht. */
const qRequestName = db.prepare('SELECT 1 FROM requests WHERE username = ? COLLATE NOCASE');
const qRequestMail = db.prepare('SELECT 1 FROM requests WHERE email = ? COLLATE NOCASE');
const qUserMail = db.prepare('SELECT 1 FROM users WHERE email = ? COLLATE NOCASE');
function createRequest(name, address) {
  const clean = String(name || '').trim();
  const post = String(address || '').trim();
  if (clean.length > REQUEST_NAME_MAX || post.length > REQUEST_MAIL_MAX) return null;
  try { checkName(clean); } catch { return null; }
  if (!mail.isAddress(post)) return null;
  // Erst raeumen, dann zaehlen: der Deckel soll sich auf das beziehen, was
// wirklich noch offen ist.
  cleanupRequests();
  if (countRequests() >= REQUEST_CAP) return null;
  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE').get(clean)) return null;
  if (qUserMail.get(post)) return null;
  if (qRequestName.get(clean)) return null;
  if (qRequestMail.get(post)) return null;
  const plain = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO requests (hash, username, email) VALUES (?, ?, ?)')
    .run(tokenHash(plain), clean, post);
  /* Keine Protokollzeile: sie waere die zweite, die ein Fremder ausloesen
     kann, und hier gaebe es keinen Deckel. */
  return plain;
}

/* Bestaetigt eine Anfrage. Liefert ja/nein und nichts ueber die Zeile, mit
   einer einzigen Absage fuer alle Faelle. */
const setConfirmed = db.prepare(
  `UPDATE requests SET confirmed_at = datetime('now')
    WHERE hash = ? AND created_at > datetime('now', ?)`);
function confirmRequest(plain) {
  const raw = String(plain || '');
  if (!raw) return false;
  // Erst raeumen: eine verfallene Zeile darf sich nicht nachtraeglich
// bestaetigen lassen, nur weil sie noch dasteht.
  cleanupRequests();
  return setConfirmed.run(tokenHash(raw), `-${REQUEST_HOURS} hours`).changes > 0;
}

/* Was der Admin sieht: ausschliesslich die bestaetigten. Sonst stuende dort
   die Adresse eines Menschen, der von der Sache nichts weiss. */
const qRequests = db.prepare(
  `SELECT id, username, email, created_at, confirmed_at
     FROM requests WHERE confirmed_at IS NOT NULL ORDER BY confirmed_at ASC, id ASC`);
const listRequests = () => qRequests.all();
const getRequest = (id) => db.prepare(
  'SELECT id, username, email, created_at, confirmed_at FROM requests WHERE id = ?')
  .get(Number(id) || 0) || null;
const removeRequest = (id) =>
  db.prepare('DELETE FROM requests WHERE id = ?').run(Number(id) || 0).changes > 0;

/* Das Sicherheitsprotokoll. Es haelt fest, wer Zugang hatte und wer die
   Instanz als Ganzes angefasst hat -- nichts darueber, was jemand gesagt hat. */
const EVENTS = [
  'login.ok', 'login.fail', 'confirm.fail',
  'user.new', 'user.role', 'user.status', 'user.password',
  'user.delete', 'user.self',
  'link.new', 'link.use',
  /* 'request.approve' und 'request.reject' -- die Entscheidung des Admins
     ueber eine Selbstanmeldung. Kein Name und keine Adresse in beiden. */
  'request.approve', 'request.reject',
  /* 'key' -- der Wechsel des Datenbankschluessels. Er laeuft ueber keytool.js
     auf dem Wirt und traegt immer das leere `actor` von dort. */
  /* 'twofactor.on', 'twofactor.off' und 'twofactor.reset'. Der dritte sagt,
     dass ein Wiederherstellungscode verbraucht wurde. */
  'twofactor.on', 'twofactor.off', 'twofactor.reset',
  /* 'backup.delete' -- eine entfernte alte Sicherung, eine Zeile je Kopie. */
  'export', 'import', 'backup', 'backup.delete', 'key'
];
/* Die geschlossene Liste fuer merkmal. */
const DETAILS = ['user', 'admin', 'owner', 'active', 'locked',
                  'invite', 'reset', 'merge', 'replace',
                  'name', 'password', 'address', 'both', 'part'];

// Eine Frist, laenger als die dreissig Tage von Papierkorb und Tokenspur: ein
// Protokoll, das den Vorfall vergisst, bevor jemand ihn bemerkt, ist keins.
const LOG_DAYS = 180;
// Wie viele Zeilen die Karte hoechstens holt. Die GESAMTZAHL steht daneben,
// damit aus "hundert Zeilen" nicht "hundert Vorgaenge" gelesen wird.
const LOG_LIMIT = 100;

const insertLog = db.prepare(
  'INSERT INTO security_log (event, actor, target, detail) VALUES (?, ?, ?, ?)');

/* WER HANDELT -- die Nummer des Angemeldeten oder FROM_HOST fuer usertool.js. */
const FROM_HOST = 'wirt';
function checkActor(actor) {
  if (actor === FROM_HOST) return null;
  const n = Number(actor);
  if (!Number.isInteger(n) || n <= 0)
    throw new Error('Dieser Vorgang braucht den Handelnden — eine Nummer oder VOM_WIRT.');
  return n;
}

/* Schreibt EINE Zeile. */
function log(event, { actor = null, target = null, detail = null } = {}) {
  try {
    if (!EVENTS.includes(event)) throw new Error(`Unbekannter Vorgang: ${event}`);
    if (detail != null && !DETAILS.includes(detail))
      throw new Error(`Unbekanntes Merkmal: ${detail}`);
    const nr = (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n > 0 ? n : null;
    };
    insertLog.run(event, nr(actor), nr(target), detail);
  } catch (e) {
    logFail('Security log:', e.message);
  }
}

/* Dieselbe Bauform wie cleanupTokens() und raeumePapierkorbAuf(): EINE
   Funktion, ZWEI Aufrufstellen -- beim Start und beim Oeffnen der Karte. */
const delLogOld = db.prepare("DELETE FROM security_log WHERE at < datetime('now', ?)");
function cleanupLog() {
  const n = delLogOld.run(`-${LOG_DAYS} days`).changes;
  if (n) logLine(`Security log: ${n} row(s) older than ` +
    `${LOG_DAYS} days removed.`);
  return n;
}

/* Die juengsten Zeilen fuer die Karte, samt Gesamtzahl. */
/* DIE GRUPPEN DES FILTERS -- eine geschlossene Liste ueber einer
   geschlossenen Liste. */
const LOG_GROUPS = {
  // Die Ansicht, um die es geht: wer an der Tuer gescheitert ist. Beide Zeilen
// sagen dasselbe -- jemand konnte nicht belegen, wer er ist.
  failed: ['login.fail', 'confirm.fail'],
  logins: ['login.ok'],
  users: ['user.new', 'user.role', 'user.status', 'user.password',
          'user.delete', 'user.self', 'link.new', 'link.use',
          'request.approve', 'request.reject'],
  twofactor: ['twofactor.on', 'twofactor.off', 'twofactor.reset'],
  // 'backup.delete' steht in DERSELBEN Gruppe wie 'backup': wer nachsieht,
  // was mit dem Bestand geschehen ist, sucht das Anlegen und das Wegraeumen
  // einer Kopie am selben Ort.
  inventory: ['export', 'import', 'backup', 'backup.delete', 'key']
};

const LOG_COLUMNS =
  `SELECT p.id, p.at, p.event, p.actor, p.target, p.detail,
          CASE WHEN uw.status = 'deleted' THEN NULL ELSE uw.username END AS actorName,
          CASE WHEN uz.status = 'deleted' THEN NULL ELSE uz.username END AS targetName
     FROM security_log p
     LEFT JOIN users uw ON uw.id = p.actor
     LEFT JOIN users uz ON uz.id = p.target`;
const qLog = db.prepare(`${LOG_COLUMNS} ORDER BY p.id DESC LIMIT ?`);
/* JE GRUPPE EINE VORBEREITETE ABFRAGE, beim Laden gebaut. */
const qLogGroup = Object.fromEntries(Object.entries(LOG_GROUPS).map(([k, kinds]) =>
  [k, db.prepare(`${LOG_COLUMNS} WHERE p.event IN (${kinds.map(() => '?').join(',')})` +
                 ' ORDER BY p.id DESC LIMIT ?')]));
const qLogCount = db.prepare('SELECT COUNT(*) n FROM security_log');
const qLogPerKind = db.prepare('SELECT event, COUNT(*) n FROM security_log GROUP BY event');

/* WELCHE GRUPPE WIE VIELE ZEILEN HAT -- die Zahlen an den Filterpillen. */
function logCounts() {
  const perKind = Object.fromEntries(qLogPerKind.all().map(z => [z.event, z.n]));
  const out = { all: 0 };
  for (const [k, kinds] of Object.entries(LOG_GROUPS))
    out[k] = kinds.reduce((n, a) => n + (perKind[a] || 0), 0);
  out.all = Object.values(perKind).reduce((n, x) => n + x, 0);
  return out;
}

/* `group` ist ein Schluessel aus LOG_GROUPS oder null fuer alle. */
function readLog(limit = LOG_LIMIT, group = null) {
  const rows = group
    ? qLogGroup[group].all(...LOG_GROUPS[group], limit)
    : qLog.all(limit);
  const counts = logCounts();
  /* DIE FELDNAMEN DIESER ANTWORT SIND NOCH DEUTSCH -- sie ziehen mit
     public/app.js um, wo ihr einziger Leser steht. */
  return {
    rows: rows,
    // Die Zahl der Zeilen DIESER Ansicht -- sonst stuende unter einer
// gefilterten Liste die Gesamtzahl aller Vorgaenge und widerspraeche ihr.
    total: group ? counts[group] : qLogCount.get().n,
    counts,
    group: group || null,
    days: LOG_DAYS,
    limit: limit
  };
}

/* --- Die zweite Bestaetigung --------------------------------------------
   WAS DIE INSTANZ ALS GANZES TRIFFT, WIRD EIN ZWEITES MAL BESTAETIGT. */
const RELEASE_MS = 120 * 1000;
/* ACHT WEGE UEBER SIEBEN ROUTEN. */
const CONFIRM_PURPOSES = ['export', 'import', 'role', 'password', 'remove', 'link', 'mail',
                             'images', 'backup'];
/* DER SCHLUESSEL IST DIE GANZE BINDUNG: Sitzungstoken, Zweck und Ziel. */
const releases = new Map(); // "token|zweck|ziel" -> Ablauf in ms

const releaseTarget = (z) => {
  const n = Number(z);
  return Number.isInteger(n) && n > 0 ? n : null;
};
const releaseKey = (token, purpose, target) =>
  `${String(token)}|${purpose}|${releaseTarget(target) ?? ''}`;

function createRelease(token, purpose, target) {
  if (!token) throw new Error('Eine Freigabe braucht die Sitzung.');
  if (!CONFIRM_PURPOSES.includes(purpose)) throw new Message('server.purposeUnknown');
  releases.set(releaseKey(token, purpose, target), Date.now() + RELEASE_MS);
  return { purpose, seconds: RELEASE_MS / 1000 };
}

/* Prueft UND verbraucht in einem. */
function useRelease(token, purpose, target) {
  if (!token) return false;
  const k = releaseKey(token, purpose, target);
  const until = releases.get(k);
  if (until === undefined) return false;
  releases.delete(k);
  return Date.now() <= until;
}

// Mit der Sitzung fallen ihre Freigaben.
function dropRelease(token) {
  if (!token) return;
  const front = `${String(token)}|`;
  for (const k of releases.keys()) if (k.startsWith(front)) releases.delete(k);
}

/* --- Der zweite Faktor ---------------------------------------------------
   WER WILL, SICHERT SEINEN ZUGANG MIT EINEM CODE AUS EINER APP AUF SEINEM
   TELEFON. */
const qTwoFactor = db.prepare(
  'SELECT user_id, secret, confirmed_at, last_counter FROM two_factor WHERE user_id = ?');
const getTwoFactor = (userId) => qTwoFactor.get(Number(userId) || 0) || null;

/* DIE EINE FRAGE, AN DER ALLES HAENGT: verlangt dieser Zugang einen zweiten
   Faktor? */
const twoFactorOn = (userId) => {
  const z = getTwoFactor(userId);
  return Boolean(z && z.confirmed_at);
};

const qCodesLeft = db.prepare(
  'SELECT COUNT(*) n FROM two_factor_codes WHERE user_id = ? AND used_at IS NULL');
const qCodesTotal = db.prepare('SELECT COUNT(*) n FROM two_factor_codes WHERE user_id = ?');

/* WAS DIE KARTE SIEHT -- UND DAS GEHEIMNIS IST NIE DARIN. */
function twoFactorState(userId) {
  const id = Number(userId) || 0;
  const z = getTwoFactor(id);
  if (!z || !z.confirmed_at) return { an: false, since: null, codesOpen: 0, codesTotal: 0 };
  return {
    an: true, since: z.confirmed_at,
    codesOpen: qCodesLeft.get(id).n, codesTotal: qCodesTotal.get(id).n
  };
}

/* DIE EINE ABSAGE. Falsch, abgelaufen, aus dem uebernaechsten Fenster, schon
   verbraucht, ein erfundener Wiederherstellungscode -- alles dasselbe Wort. */
const TWO_FACTOR_DENIAL = 'login.codeWrong';

/* SCHRITT EINS: das Geheimnis entsteht und geht EINMAL ueber das Netz --
   danach nie wieder, auch nicht an den Eigentuemer. */
function startTwoFactor(userId, instanceName, username) {
  const id = Number(userId) || 0;
  if (twoFactorOn(id)) throw new Message('login.twoFactorAlreadyOn');
  const secret = zf.newSecret();
  db.prepare(
    `INSERT INTO two_factor (user_id, secret, confirmed_at, last_counter)
     VALUES (?, ?, NULL, NULL)
     ON CONFLICT(user_id) DO UPDATE SET
       secret = excluded.secret, confirmed_at = NULL, last_counter = NULL,
       created_at = datetime('now')`
  ).run(id, secret);
  return {
    // Der Feldname bleibt deutsch, bis app.js mitzieht.
    secret: secret, groups: zf.groupsOfFour(secret),
    row: zf.otpauthLine(instanceName, username, secret),
    digits: zf.DIGITS, seconds: zf.STEP_SECONDS
  };
}

/* Legt RECOVERY_COUNT frische Codes an und liefert die KLARTEXTE genau einmal
   zurueck -- danach stehen sie nirgends mehr, auch nicht in der Datenbank. */
const insertCode = db.prepare(
  'INSERT INTO two_factor_codes (hash, user_id) VALUES (?, ?)');
function createRecoveryCodes(userId) {
  const id = Number(userId) || 0;
  const plains = zf.newRecoveryCodes();
  db.transaction(() => {
    db.prepare('DELETE FROM two_factor_codes WHERE user_id = ?').run(id);
    // tokenHash() WIRD WIEDERVERWENDET und nicht ein zweites Mal geschrieben:
    // zwei Ausfertigungen derselben Rechnung liefen beim naechsten Griff
    // auseinander.
    for (const k of plains) insertCode.run(tokenHash(k), id);
  })();
  return plains.map(zf.recoveryDisplay);
}

/* SCHRITT ZWEI: ein gueltiger Code aus dem Telefon schaltet ein. */
function turnTwoFactorOn(userId, input, actor, now = Date.now()) {
  const id = Number(userId) || 0;
  const z = getTwoFactor(id);
  if (!z) throw new Message('login.twoFactorNotBegun');
  if (z.confirmed_at) throw new Message('login.twoFactorAlreadyOn');
  const counter = zf.checkCode(z.secret, input, now);
  if (counter === null) throw new Message(TWO_FACTOR_DENIAL);
  db.prepare(
    `UPDATE two_factor SET confirmed_at = datetime('now'), last_counter = ?
      WHERE user_id = ?`).run(counter, id);
  const codes = createRecoveryCodes(id);
  log('twofactor.on', { actor: checkActor(actor), target: id });
  return { ...twoFactorState(id), codes };
}

/* Prueft einen zweiten Faktor UND verbraucht ihn in einem Zug. Liefert die
   ART ('app' oder 'wieder') oder null. */
const useCounter = db.prepare(
  `UPDATE two_factor SET last_counter = ?
    WHERE user_id = ? AND (last_counter IS NULL OR last_counter < ?)`);
const useRecoveryCode = db.prepare(
  `UPDATE two_factor_codes SET used_at = datetime('now')
    WHERE hash = ? AND user_id = ? AND used_at IS NULL`);
function checkTwoFactor(userId, input, now = Date.now()) {
  const id = Number(userId) || 0;
  const z = getTwoFactor(id);
  if (!z || !z.confirmed_at) return null;
  if (zf.isCodeForm(input)) {
    const counter = zf.checkCode(z.secret, input, now);
    if (counter === null) return null;
    if (!useCounter.run(counter, id, counter).changes) return null;
    return 'app';
  }
  if (zf.isRecoveryForm(input)) {
    const hash = tokenHash(zf.recoveryNormal(input));
    if (!useRecoveryCode.run(hash, id).changes) return null;
    /* DIE EINZIGE ZEILE IM PROTOKOLL, DIE SAGT, DASS EIN TELEFON WEG IST. */
    log('twofactor.reset', { actor: id, target: id });
    return 'wieder';
  }
  return null;
}

/* Frische Wiederherstellungscodes fuer den, der seine verbraucht hat. Hinter
   Passwort UND gueltigem Code -- die Route stellt beides sicher. */
function refreshRecoveryCodes(userId) {
  const id = Number(userId) || 0;
  if (!twoFactorOn(id)) throw new Message('server.twoFactorOff');
  return createRecoveryCodes(id);
}

/* Ausschalten. ALLEIN DER BETROFFENE -- oder usertool.js auf dem Wirt, und
   das ist am leeren `actor` zu erkennen. */
function turnTwoFactorOff(userId, actor) {
  const id = Number(userId) || 0;
  if (!getTwoFactor(id)) return false;
  db.transaction(() => {
    db.prepare('DELETE FROM two_factor WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM two_factor_codes WHERE user_id = ?').run(id);
  })();
  log('twofactor.off', { actor: checkActor(actor), target: id });
  return true;
}

/* --- Der Ausweis zwischen den beiden Schritten der Anmeldung ------------
   WIE WIRD DIE ANMELDUNG ZWEISTUFIG, OHNE EINEN ZWEITEN ZUSTAND ZU ERZEUGEN? */
const LOGIN_TICKET_MS = RELEASE_MS;
const tickets = new Map(); // schluessel -> { id, bis }

function createLoginTicket(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Ein Ausweis braucht einen Zugang.');
  // Beim Anlegen einmal durchsehen.
  const now = Date.now();
  for (const [k, a] of tickets) if (a.until <= now) tickets.delete(k);
  const key = crypto.randomBytes(32).toString('hex');
  tickets.set(key, { id, until: now + LOGIN_TICKET_MS });
  return { ticket: key, seconds: LOGIN_TICKET_MS / 1000 };
}

/* Prueft UND verbraucht in einem, wie useRelease. */
function useLoginTicket(key) {
  const k = String(key || '');
  if (!k) return null;
  const a = tickets.get(k);
  if (a === undefined) return null;
  tickets.delete(k);
  return Date.now() <= a.until ? a.id : null;
}

// Liefert den Benutzer hinter dem Cookie oder null.
function sessionUser(token) {
  if (!token) return null;
  const b = db.prepare(
    `SELECT u.id, u.username, u.role, u.status
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.last_seen >= datetime('now', '-${SESSION_DAYS} days')`
  ).get(token);
  if (!b) return null;
  db.prepare(`UPDATE sessions SET last_seen = datetime('now') WHERE token = ?`).run(token);
  return b;
}

/* Secure haengt am NAMEN und nicht mehr an der Einstellung: __Host- IMMER mit
   Secure, der Heimnetzname NIE. */
/* ABGELEITET UND NICHT GEWUERFELT: der Token braucht damit keine Zeile
   neben der Sitzung und ueberlebt jeden Neustart. Wer ihn hat, hat daraus
   den Sitzungstoken nicht -- SHA-256 laeuft nur in eine Richtung. */
const csrfToken = (token) =>
  crypto.createHash('sha256').update('csrf:' + String(token)).digest('hex');

/* OHNE HttpOnly, und das ist der Zweck: der Sitzungscookie bleibt dem Skript
   verborgen, dieser hier nicht. */
const csrfCookie = (req, token) =>
  `${csrfName(req)}=${csrfToken(token)}; Path=/; SameSite=Lax` +
  `${viaProxy(req) ? '; Secure' : ''}; Max-Age=${SESSION_DAYS * 86400}`;

/* BEIDE COOKIES AUF EINMAL: ein Weg, der nur den einen setzte, liesse den
   Browser mit einer Sitzung ohne Token zurueck. */
const sessionCookie = (req, token) => [
  `${cookieName(req)}=${token}; HttpOnly; Path=/; SameSite=Lax` +
  `${viaProxy(req) ? '; Secure' : ''}; Max-Age=${SESSION_DAYS * 86400}`,
  csrfCookie(req, token)
];
/* GELOESCHT WERDEN BEIDE NAMEN, nicht nur der des eigenen Wegs. */
const clearCookie = () => [
  `${COOKIE_SECURE}=; HttpOnly; Path=/; SameSite=Lax; Secure; Max-Age=0`,
  `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
  `${CSRF_SECURE}=; Path=/; SameSite=Lax; Secure; Max-Age=0`,
  `${CSRF_NAME}=; Path=/; SameSite=Lax; Max-Age=0`
];

/* DER SITZUNGSTOKEN DIESER ANFRAGE -- der EINE Leseweg. */
const sessionToken = (req) => parseCookies(req)[cookieName(req)];
/* Und derselbe Weg fuer den Token daneben. */
const csrfCookieValue = (req) => parseCookies(req)[csrfName(req)];

/* Verglichen wird die KOPFZEILE mit dem abgeleiteten Wert und nicht mit dem
   Cookie: wer einen Cookie setzen kann, setzt sonst beide. */
const csrfOk = (req, token) =>
  safeEqual(String(req.headers[CSRF_HEADER] || ''), csrfToken(token));

// req.benutzer ist ab hier fuer jeden geschuetzten Endpunkt gesetzt: { id,
// username, role, status }.
function requireAuth(req, res, next) {
  const token = sessionToken(req);
  const user = sessionUser(token);
  if (!user) {
    return res.status(401).json({ error: translate(req, 'login.notSignedIn') });
  }
  if (user.status !== 'active') {
    destroySession(token);
    return res.status(401).json({
      error: translate(req, user.status === 'deleted'
        ? 'server.accountGone' : 'login.accountLocked')
    });
  }
  req.user = user;
  next();
}

module.exports = {
  setCompareLocale,
  // Die Fehlerklasse; Rufer sind server.js (uebersetzt) und diese Datei.
  Message, setTranslator,
  COOKIE_NAME, COOKIE_SECURE, cookieName, sessionToken, viaProxy,
  CSRF_NAME, CSRF_SECURE, csrfName, CSRF_HEADER,
  csrfToken, csrfCookie, csrfCookieValue, csrfOk,
  BEHIND_PROXY, PASSWORD_MIN, SESSION_DAYS, fromEnv,
  PUBLIC_ADDRESS, checkPublicAddress, parseCookies, checkLogin, createSession, destroySession,
  sessionUser, pruneSessions, sessionCookie, clearCookie, requireAuth,
  clientIp, checkThrottle, noteFailure, noteSuccess, cleanupAttempts,
  // Die Kurve und die gewaehlte Kostenstufe gehen mit hinaus.
  delay, SCRYPT_COST: SCRYPT.N, SCRYPT_SHIPPED,
  // Meine Sitzungen und die Token; Rufer ist server.js.
  sessionIdOf, sessionsOf, endSession, endOtherSessions,
  TOKEN_DAYS, TOKEN_DEADLINE_MINUTES, tokenHash,
  cleanupTokens, createToken, checkToken, redeemToken, startTokenDeadline,
  // Die Selbstanmeldung; Rufer ist server.js.
  REQUEST_HOURS, REQUEST_CAP, REQUEST_NAME_MAX, REQUEST_MAIL_MAX,
  countRequests, cleanupRequests,
  createRequest, confirmRequest, listRequests, getRequest, removeRequest,
  // Das Sicherheitsprotokoll; Rufer sind server.js und usertool.js.
  EVENTS, DETAILS, LOG_LIMIT, LOG_GROUPS, FROM_HOST,
  log, cleanupLog, readLog,
  // Die zweite Bestaetigung.
  CONFIRM_PURPOSES, RELEASE_MS, createRelease, useRelease,
  // Der zweite Faktor; Rufer sind server.js und usertool.js.
  TWO_FACTOR_DENIAL, LOGIN_TICKET_MS,
  twoFactorOn, twoFactorState, startTwoFactor, turnTwoFactorOn,
  checkTwoFactor, refreshRecoveryCodes, turnTwoFactorOff,
  createLoginTicket, useLoginTicket,
  getUser, getUserByName, userExists, createFirstUser, changeUser,
  hashPassword, checkPassword,
  // Zugangsverwaltung; Rufer sind server.js und usertool.js.
  ROLES,
  getUser2, listUsers, ownerCount,
  createUser, setNewPassword, setRole, setStatus, countInventory, removeUser
};
