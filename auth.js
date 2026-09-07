const crypto = require('crypto');
const { db, assignInventory } = require('./db');
// Nur wegen istAdresse: die Frage "sieht das ueberhaupt nach einer Adresse
// aus" wird an drei Stellen gestellt (Anlegen, eigener Zugang, Versand), und
// drei Muster nebeneinander liefen auseinander. Die Antwort steht deshalb dort,
// wo die Adresse gebraucht wird.
const mail = require('./mail');
/* Nur wegen der Rechnung: Base32, HMAC ueber den Zaehler, das Fenster. Alles,
   was eine Zeile hat, steht hier -- dieselbe Teilung wie bei mail.js. */
const zf = require('./twofactor');

/* ================= Die Fehlerklasse „Message" ================= */
/* EIN FEHLER IST EIN SCHLUESSEL UND KEIN SATZ -- 0.24.0, Bauabschnitt 1.
   Bis dahin warf diese Datei rund vierzig deutsche Saetze als `new Error`,
   die server.js faengt und im Feld `error` weiterreicht -- der
   Bildschirmtext-Waechter sah keinen davon, weil er nur das Feld selbst
   liest und nicht, was hineinlaeuft. Kuenftig traegt der Fehler den
   Schluessel, und den Satz liest der Waechter in de.json.
   SIE STEHT HIER UND NICHT IN server.js, obwohl sie DORT uebersetzt wird:
   server.js requiret diese Datei, der Weg zurueck waere ein Ring. Eine eigene
   Datei dafuer verbietet der Auftrag -- und fuer sieben Zeilen waere sie auch
   zu viel.
   SIE ERBT VON Error, damit jeder vorhandene try/catch sie weiter faengt und
   der Wurf seine Spur behaelt. `message` traegt den SCHLUESSEL: wer sie
   versehentlich als Text ausgibt, sieht einen Schluessel und keinen halben
   Satz -- das faellt auf, ein halber Satz nicht.
   `status` GEHOERT AN DIE MELDUNG, weil er zu ihr gehoert und nicht zur
   Aufrufstelle: „Der Code stimmt nicht." ist 400, wo immer sie geworfen wird. */
/* DER UEBERSETZER FUER DIE ZWEI ANTWORTEN, DIE DIESE DATEI SELBST GIBT.
   requireAuth() antwortet unmittelbar und wirft nicht -- ein Wurf liefe durch
   den Fehler-Handler und schriebe bei JEDER nicht angemeldeten Anfrage eine
   Zeile auf die Konsole. Dafuer braucht diese Datei t(), und t() lebt in
   server.js; gereicht wird es beim Start, wie bei mail.js.
   ER NIMMT DIE ANFRAGE UND NICHT DIE SPRACHE: welche Sprache eine Antwort
   traegt, entscheidet server.js -- hier ist nur bekannt, WELCHE Anfrage es
   ist. */
let translate = (req, key) => `\u27e6${key}\u27e7`;
function setTranslator(fn) { translate = fn; }

class Message extends Error {
  constructor(key, values = {}, status = 400) {
    super(key);
    this.name = 'Message';
    this.key = key;
    this.values = values;
    this.status = status;
  }
}

/* EINE EINSTELLUNG, ZWEI WIRKUNGEN -- BIS 0.12.4 WAREN ES FUENF.

   Ein Kopf vom Aufrufer ist nie eine Feststellung, sondern eine Behauptung.
   X-Forwarded-For und X-Forwarded-Proto duerfen nur dort geglaubt werden, wo
   ausdruecklich eingestellt ist, dass ein Proxy davorsteht -- sonst setzt der
   Aufrufer den einen bei jedem Versuch neu und bekommt einen frischen Zaehler
   (die Anmeldebremse je Adresse greift dann nie) und den anderen, um sich als
   HTTPS auszugeben.

   BEHIND_PROXY=1 (an):  die beiden Koepfe werden ueberhaupt angesehen, und ein
                         http:// in PUBLIC_ADDRESS meldet sich am Start.
   fehlt (aus, Vorgabe): kein Kopf wird angesehen -- allein
                         req.socket.remoteAddress, und jede Anfrage gilt als
                         Klartext. Richtig fuer "direkt im Heimnetz, Port 3100".

   WAS NICHT MEHR AN IHR HAENGT: Cookiename, Secure und HSTS. Die drei
   entscheidet seit 0.13.0 die EINZELNE ANFRAGE ueber X-Forwarded-Proto, und
   der Grund ist der Betrieb: die Instanz ist aus zwei Netzen zugleich
   erreichbar, und eine Einstellung je Prozess kann immer nur einen davon
   bedienen. Mit BEHIND_PROXY=1 kam ueber http://<server-ip>:3100 niemand mehr
   herein -- der Server antwortete mit 200, der Browser verwarf den
   Secure-Cookie stillschweigend, und im Serverprotokoll stand davon nichts.

   Umgebungsvariable und nicht settings-Tabelle: sie entscheidet ueber
   Netzwerkvertrauen, nicht ueber eine Vorliebe -- ein uebernommener
   Admin-Zugang koennte sie sonst selbst umlegen.

   EINE ADRESSLISTE, WER DEN KOPF SETZEN DARF, IST WEITERHIN NICHT GEBAUT, und
   das ist eine Entscheidung und kein Uebersehen: sie ist die Antwort auf die
   OFFENE PORTFREIGABE 3100 und nicht auf die zwei Netze. Solange der Port im
   eigenen Netz offen steht, kann dort jemand X-Forwarded-For selbst setzen und
   die Anmeldebremse umgehen -- ein gewoehnlicher Browser tut das nicht, ein
   absichtlicher Aufruf schon. Sie gehoert in eine eigene Runde, weil sie eine
   neue .env-Zeile braucht und eine falsch gesetzte Liste die Bremse auf die
   Adresse des Proxys zieht: ein einziger Angreifer sperrte damit fuenf Minuten
   lang ALLE aus. In eine Runde, die den Zugang offenhalten soll, gehoert kein
   neuer Weg, ihn zu verlieren. */
/* DIE UMGEBUNGSVARIABLEN HEISSEN SEIT 0.24.1 ENGLISCH -- UND DER ALTE NAME
   GILT WEITER (F9). Eine `.env`, die nach dem Einspielen nicht mehr gilt, ist
   der eine Fall, in dem ein Betreiber im Dunkeln steht: die Instanz startet
   und verhaelt sich anders, ohne dass etwas rot waere. Wer den alten Namen
   stehen laesst, bekommt stattdessen eine Zeile ins Containerprotokoll und
   Zeit zum Nachziehen.
   LEER ZAEHLT ALS NICHT GESETZT: in der `.env.example` stehen die Zeilen
   auskommentiert oder leer da, und ein leerer neuer Name darf einen gesetzten
   alten nicht verdecken. */
function fromEnv(name, alterName) {
  const value = process.env[name];
  if (String(value ?? '').trim() !== '') return value;
  const old = process.env[alterName];
  if (String(old ?? '').trim() !== '') {
    console.warn(`[Kriterion] ${alterName} heisst jetzt ${name} — der alte Name ` +
      'wird noch gelesen. Bitte in der .env nachziehen.');
    return old;
  }
  return value;
}

const BEHIND_PROXY = /^(1|true|ja|an|yes|on)$/i.test(String(fromEnv('BEHIND_PROXY', 'HINTER_PROXY') || '').trim());

/* KAM DIESE ANFRAGE UEBER DEN PROXY? Die eine Frage, an der seit 0.13.0
   Cookiename, Secure und HSTS haengen -- je Anfrage und nicht je Prozess.
   DER LETZTE EINTRAG DER KETTE und nicht der erste, aus demselben Grund wie
   bei der Adresse: was davor steht, kann der Aufrufer selbst hineingeschrieben
   haben; was der naechste Proxy anhaengt, sieht er wirklich.
   NUR MIT BEHIND_PROXY: ohne die Einstellung steht kein Proxy davor, und dann
   ist der Kopf nichts als eine Behauptung.
   OHNE req.socket UND OHNE req.protocol: diese Frage sieht ausschliesslich in
   die Kopfzeilen. Sie wird auch aus requireAuth heraus gestellt, und dort
   reicht der Pruefstand ein req herein, das nur `headers` traegt. */
function viaProxy(req) {
  if (!BEHIND_PROXY) return false;
  const chain = String((req && req.headers && req.headers['x-forwarded-proto']) || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return chain.length > 0 && chain[chain.length - 1] === 'https';
}

/* ZWEI NAMEN NEBENEINANDER, UND KEIN NAME MIT BEDINGTEM Secure.
   Das Praefix __Host- ist eine Zusage des Namens an den Browser -- nur ueber
   HTTPS gesetzt, ohne Domain, mit Path=/ -- und ohne Secure verwuerfe der
   Browser den Cookie stillschweigend. Der Heimnetzweg kann diese Zusage nicht
   halten und bekommt deshalb einen EIGENEN Namen ohne beides.

   EIN NAME MIT BEDINGTEM Secure WAERE DER FEHLER, den diese Runde ausdruecklich
   nicht baut: wer im eigenen Netz eine Klartextverbindung verbiegen kann,
   setzte damit einen Cookie, den die HTTPS-Seite anschliessend AUCH annaehme --
   und genau dagegen gibt es __Host-.

   GELESEN WIRD JE ANFRAGE GENAU EIN NAME und nicht beide nacheinander. Das ist
   dieselbe Zusage von der Lesestelle her: ein Klartextcookie geht auch an die
   HTTPS-Seite (er traegt kein Secure), und wer ihn dort gelten liesse, haette
   __Host- fuer nichts. WER DIE EINSTELLUNG UMLEGT, MELDET DAMIT WEITERHIN ALLE
   EINMALIG AB, die ueber HTTPS kommen: ihr Name wird dann nicht mehr gelesen.

   DER NAME ENTSTEHT GENAU EINMAL; der sichere wird daraus gebaut. Ein zweites
   Literal daneben liefe auseinander, und ein Waechter im Pruefstand haelt
   genau das fest. */
const COOKIE_NAME = 'kriterion_session';
const COOKIE_SICHER = `__Host-${COOKIE_NAME}`;
const cookieName = (req) => viaProxy(req) ? COOKIE_SICHER : COOKIE_NAME;

/* --- Die oeffentliche Adresse -------------------------------------------
   SIE STEHT HIER UND NICHT IN server.js, weil sie dieselbe Sorte Einstellung
   ist wie BEHIND_PROXY darueber: Netzwerkvertrauen, nicht Vorliebe -- also
   .env und nicht settings. GEBAUT wird der Link in server.js; hier steht nur,
   welcher Wert gilt.

   ALLES AB ? UND # WIRD ABGEWIESEN: das Fragment traegt bereits den
   Schluessel des Links. Ein PFAD ist erlaubt -- die Instanz kann unter einem
   Unterpfad haengen. ZUGANGSDATEN IN DER ADRESSE WERDEN ABGEWIESEN: sie
   stuenden sonst in jedem verschickten Link.

   EIN UNBRAUCHBARER WERT BRICHT DEN START NICHT AB, sondern meldet sich laut
   und faellt auf den Browserweg zurueck. Ein Start, der an einem Tippfehler
   in einer OPTIONALEN Einstellung abbricht, ist schlimmer als der
   Tippfehler. */
/* DAS FELD HEISST `problem` UND NICHT WIE DIE ABSAGE EINER ROUTE: der Satz
   darin ist der eine Text dieser Datei, der auf dem BILDSCHIRM DES WIRTS
   landet und nicht am Bildschirm des Benutzers -- er hat keinen Schluessel in
   der Sprachdatei und soll auch keinen bekommen. Der Waechter ueber die drei
   Serverdateien verlangt hinter dem Absagefeld einen Schluessel; hier stuende
   einer falsch. */
function checkPublicAddress(raw) {
  const value = String(raw || '').trim();
  if (!value) return { address: '', set: false };
  let u;
  try { u = new URL(value); }
  catch { return { address: '', set: true, problem: 'Das ist keine vollständige Adresse.' }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:')
    return { address: '', set: true, problem: 'Nur http:// und https:// sind möglich.' };
  if (!u.hostname)
    return { address: '', set: true, problem: 'Es fehlt der Rechnername.' };
  if (u.username || u.password)
    return { address: '', set: true, problem: 'Zugangsdaten gehören nicht in die Adresse.' };
  if (u.search) return { address: '', set: true, problem: 'Eine Abfrage (?) ist nicht erlaubt.' };
  if (u.hash) return { address: '', set: true, problem: 'Ein Fragment (#) ist nicht erlaubt.' };
  // Ohne abschliessenden Schraegstrich, damit der Link genau eine Form hat.
  const address = (u.origin + u.pathname).replace(/\/+$/, '');
  return { address, set: true };
}
const PUBLIC_ADDRESS = checkPublicAddress(fromEnv('PUBLIC_ADDRESS', 'OEFFENTLICHE_ADRESSE'));

const SESSION_DAYS = 30;

// --- Passwoerter -------------------------------------------------------
// scrypt aus Nodes eingebautem crypto, keine neue Abhaengigkeit. Die Kennwerte
// stehen im gespeicherten Wert mit drin, damit sie sich spaeter anheben lassen,
// ohne alte Eintraege unlesbar zu machen.
const PASSWORD_MIN = 10;
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

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
// schneller abgewiesen werden als ein falsches Passwort. Deshalb rechnet die
// Pruefung auch dann, wenn es gar keinen Zugang gibt -- gegen diesen Blindwert.
const DUMMY_VALUE = hashPasswordSync(crypto.randomBytes(16).toString('hex'));

// --- Zugang ------------------------------------------------------------
// Drei Rollen als Leiter: user < admin < eigentuemer (Begruendung am Schema
// in db.js).
const ROLES = ['user', 'admin', 'owner'];
const STATES = ['active', 'locked', 'deleted'];

// Der Name eines geloeschten Zugangs. Der urspruengliche wird ueberschrieben
// und ist damit wieder frei. Die Zahl ist die alte id, und genau die steht
// auch in user_id -- die Oberflaeche bildet daraus "Geloeschter Benutzer 7",
// ohne dass irgendwo ein Name aufbewahrt wird.
const tombstoneName = (id) => `deleted-${id}`;
/* Damit ein lebender Zugang nicht wie ein Grabstein aussehen kann. Der Preis
   dieser Namensvergabe, ehrlich benannt: das Muster ist als Benutzername
   gesperrt.
   BEIDE SCHREIBWEISEN BLEIBEN GESPERRT -- 0.24.1. Bis 0.24.0 hiess der
   Grabstein `geloescht-<nr>`; die Migration schreibt ihn um. Bliebe die alte
   Schreibweise danach frei, koennte sich jemand `geloescht-7` nennen und
   saehe aus wie der Grabstein, der diese Zeile einmal war. Das Wort steht
   hier als WERT in einem Muster und nicht als Name im Quelltext. */
const TOMBSTONE_PATTERN = /^(deleted|geloescht)-\d+$/i;

// Der EIGENTUEMER mit der kleinsten Nummer -- wer ihn ruft, meint den
// Eigentuemer der Instanz, nie den Angemeldeten (dafuer gibt es req.benutzer).
// Gefragt wird die ROLLE, nicht die kleinste id: sonst nennte das Protokoll
// einen geloeschten Zugang als Eigentuemer.
const getUser = () =>
  db.prepare("SELECT id, username, password_hash FROM users " +
             "WHERE role = 'owner' ORDER BY id LIMIT 1").get() || null;

// Der Kandidat zur Anmeldung. Die Spalte traegt COLLATE NOCASE, das Suchen
// findet also auch eine abweichende Schreibweise -- entschieden wird trotzdem
// erst danach mit safeEqual, Zeichen fuer Zeichen.
const getUserByName = (name) =>
  db.prepare('SELECT id, username, password_hash, role, status FROM users WHERE username = ?')
    .get(String(name || '')) || null;

const userExists = () => db.prepare('SELECT COUNT(*) n FROM users').get().n > 0;

// Der Name steht fuer sich, weil er an zwei Wegen geprueft wird: beim Anlegen
// (immer mit Passwort) und beim blossen Umbenennen in changeUser(). Ohne die
// zweite Stelle koennte sich jemand in geloescht-7 umbenennen und saehe aus wie
// der Grabstein eines anderen.
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

// Legt den ersten Zugang an. Das Einfuegen entscheidet selbst, ob es der erste
// ist -- eine Pruefung davor liesse zwischen Pruefung und Einfuegen Platz fuer
// einen zweiten Aufruf. Die Rolle steht fest auf 'owner': wer die Instanz
// einrichtet, dem gehoert sie.
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

// Aendert Name und/oder Passwort DES ANGEMELDETEN Benutzers. Das bisherige
// Passwort ist Pflicht -- sonst genuegte eine fremde offene Sitzung, um den
// Zugang zu uebernehmen. Die Klemme am Anfang ist die einzige Schicht gegen
// einen Aufruf ohne Benutzer-Id: better-sqlite3 buende eine fehlende Nummer
// sonst still als NULL.
/* DIE ADRESSE GEHOERT DEM, DER SIE HAT -- deshalb steht sie HIER, am eigenen
   Zugang, und nicht in der Zugangsverwaltung. Ein Admin, der eine BESTEHENDE
   fremde Adresse umschreiben duerfte, boege die naechste Ruecksetzmail des
   Betroffenen auf ein Postfach seiner Wahl. Beim ANLEGEN ist es ein anderer
   Fall -- dort gibt es noch niemanden, der sie setzen koennte, und ohne sie
   hat die Einladungsmail keinen Empfaenger.
   undefined HEISST "nicht angefasst", der leere String "loeschen". Ohne diese
   Unterscheidung koennte eine Adresse nie wieder entfernt werden. */
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
  // Die Spalte traegt UNIQUE COLLATE NOCASE. Ohne diese Frage kaeme ab dem
  // zweiten Zugang die rohe SQLite-Meldung als 400 heraus -- unverstaendlich
  // an einer Stelle, an der man nur einen Namen tippt.
  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE AND id != ?').get(name, u.id))
    throw new Message('login.usernameTaken');
  const hash = changes ? await hashPassword(newPassword) : u.password_hash;
  /* Die Adresse wird GEPRUEFT, bevor irgendetwas geschrieben wird -- eine
     Absage, die den Namen schon gewechselt hat, waere schlimmer als keine. */
  const addressMeant = newAddress !== undefined;
  const address = addressMeant ? String(newAddress || '').trim() : null;
  if (addressMeant && address && !mail.isAddress(address))
    throw new Message('login.emailInvalid');
  db.prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?').run(name, hash, u.id);
  if (addressMeant)
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(address || null, u.id);
  /* Der eigene Zugang ist der erste Griff einer uebernommenen Sitzung: er
     sperrt den Richtigen aus. Ein Aufruf, der nichts bewegt, ist kein Vorgang
     und schreibt deshalb keine Zeile. Die Adresse zaehlt mit -- sie
     entscheidet, WOHIN der naechste Ruecksetzlink geht. 'both' heisst "mehr
     als eines", deshalb wird GEZAEHLT statt verschachtelt. */
  const renamed = name !== u.username;
  const addressNew = addressMeant && (address || null) !== (u.email || null);
  const moved = [renamed && 'name', changes && 'password', addressNew && 'address'].filter(Boolean);
  const detail = moved.length > 1 ? 'both' : moved[0] || null;
  if (detail) log('user.self', { actor: u.id, target: u.id, detail });
  return { username: name, passwordChanged: changes, email: addressMeant ? address : (u.email || '') };
}

/* --- Zugangsverwaltung --------------------------------------------------
   EIN Ort, zwei Rufer: die Verwaltungskarte in server.js und der Befehl
   usertool.js auf dem Wirt. Die Rechtefrage steht hier ausdruecklich NICHT --
   wer etwas darf, entscheidet server.js an der Route; usertool.js laeuft auf dem
   Wirt und hat damit ohnehin alles. Diese Funktionen fuehren nur aus. */

const getUser2 = (id) =>
  db.prepare('SELECT id, username, role, status, email, last_login, created_at FROM users WHERE id = ?')
    .get(Number(id)) || null;

// Die Liste fuer die Verwaltungskarte. Die Zahl der Eintraege steht dabei, weil
// sie die Entscheidung traegt -- genau wie der Verwendungszaehler neben dem
// Loeschknopf der Kriterien.
/* ohnePasswort WIRD AUS password_hash ABGELEITET UND NICHT AUS last_login:
   last_login IS NULL heisst "hat sich noch nie angemeldet", und das ist nicht
   dasselbe wie "kann sich nicht anmelden". Die Karte braucht das Zweite, und
   es steht dort, wo auch checkLogin entscheidet.
   AUSGELIEFERT WIRD DER HASH NICHT, nur die abgeleitete Frage darauf. */
const listUsers = () => db.prepare(
  `SELECT u.id, u.username, u.role, u.status, u.last_login, u.created_at,
          (u.password_hash = '') AS withoutPassword,
          (SELECT COUNT(*) FROM items i WHERE i.user_id = u.id) AS entries
     FROM users u ORDER BY u.id`
).all().map(z => ({ ...z, withoutPassword: Boolean(z.withoutPassword) }));

// Zaehlt die Eigentuemer, die sich noch anmelden koennen. Ein gesperrter oder
// geloeschter zaehlt nicht mit -- sonst liesse sich die Instanz verriegeln,
// indem man den letzten Eigentuemer sperrt statt ihn herabzustufen.
const ownerCount = () => db.prepare(
  "SELECT COUNT(*) AS n FROM users WHERE role = 'owner' AND status = 'active'"
).get().n;

/* OHNE PASSWORT WIRD AUSDRUECKLICH VERLANGT, nie durch blosses Weglassen:
   ohnePasswort === true ist die einzige Form. Sonst legte ein Fehler im
   Aufrufer wortlos einen Zugang an, in den sich niemand anmelden kann.
   DER LEERE HASH IST DIE SPERRE, und zwar doppelt: checkLogin faellt bei
   leerem Hash auf BLINDWERT zurueck, und checkPassword weist einen Wert, der
   nicht nach scrypt aussieht, schon am Format ab. */
async function createUser(name, password, role = 'user', withoutPassword = false, actor, address) {
  if (withoutPassword === true) checkName(name);
  else checkRules(name, password);
  if (!ROLES.includes(role)) throw new Message('login.roleUnknown');
  const clean = String(name).trim();
  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE').get(clean))
    throw new Message('login.usernameTaken');
  /* DIE ADRESSE BEIM ANLEGEN, und nur hier: ohne sie hat die Einladungsmail
     keinen Empfaenger, und den Zugang gibt es in diesem Augenblick noch nicht,
     also kann ihn auch niemand selbst eintragen. Alles Spaetere laeuft ueber
     changeUser und damit ueber den Betroffenen -- die Begruendung steht
     dort. Geprueft VOR dem Anlegen: ein Zugang, der steht, und eine Absage
     daneben waeren zwei Aussagen ueber denselben Aufruf. */
  const mailAddress = String(address || '').trim();
  if (mailAddress && !mail.isAddress(mailAddress))
    throw new Message('login.emailInvalid');
  const hash = withoutPassword === true ? '' : await hashPassword(password);
  const acting = checkActor(actor);
  const r = db.prepare('INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, ?, ?)')
    .run(clean, hash, role, mailAddress || null);
  log('user.new', { actor: acting, target: r.lastInsertRowid, detail: role });
  return { id: r.lastInsertRowid, username: clean, role: role,
           withoutPassword: hash === '', email: mailAddress };
}

// Setzt ein Passwort ohne das bisherige zu kennen -- fuer den Admin, der es
// zuruecksetzt, und fuer usertool.js. Die Sitzungen fallen dabei ALLE: wer ein
// fremdes Passwort neu setzt, will den bisherigen Inhaber draussen haben.
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
  // noch weiter unten durch Sperren oder Loeschen. Ohne ihn kaeme niemand mehr
  // an Rollen, Export und Import, und der einzige Ausweg waere usertool.js.
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
  // Erste von zwei Schichten. requireAuth wuerde eine laufende Sitzung ohnehin
  // abweisen; das Wegraeumen haelt die Tabelle sauber und wirkt sofort.
  // MIT DEN SITZUNGEN FALLEN DIE OFFENEN TOKEN. Ein Einladungs- oder
  // Ruecksetzlink, der eine frische Sperre ueberlebte, waere ein Weg an ihr
  // vorbei: er setzt ein Passwort, und beim naechsten Freigeben stuende der
  // Zugang unter fremder Hand.
  /* DER ZWEITE FAKTOR BLEIBT DABEI AUSDRUECKLICH STEHEN, und das ist keine
     Vergesslichkeit neben den beiden Zeilen darueber. Naehme ihn das Sperren
     mit, waere "sperren und wieder freigeben" der Weg, an dem ein Admin einen
     FREMDEN zweiten Faktor abstreift -- und danach mit einem selbst gesetzten
     Passwort hereinkaeme. Ein Sperren ist umkehrbar und nimmt niemandem etwas;
     der Faktor gehoert dem Betroffenen und ueberlebt es. */
  if (status !== 'active') {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(u.id);
  }
  log('user.status', { actor: acting, target: u.id, detail: status });
  return { id: u.id, username: u.username, status };
}

/* Was an einem Zugang haengt, getrennt nach eigen und fremd. Die Zahlen tragen
   den Loeschdialog: "seine Eintraege loeschen" nimmt ueber die Kaskade auch
   FREMDE Kommentare, Bewertungen und Testtage mit, und das darf nicht wortlos
   geschehen.
   IS NOT statt != , weil user_id nullbar ist: eine herrenlose Zeile ist eine
   fremde und faellt bei != aus dem Vergleich heraus. */
function countInventory(userId) {
  const id = Number(userId);
  const one = (sql, ...w) => db.prepare(sql).get(...w).n;
  const seine = 'SELECT id FROM items WHERE user_id = ?';
  return {
    entries: one('SELECT COUNT(*) n FROM items WHERE user_id = ?', id),
    // an SEINEN Eintraegen, von anderen geschrieben -- faellt mit den Eintraegen
    foreignComments: one(`SELECT COUNT(*) n FROM comments WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    foreignRatings: one(`SELECT COUNT(*) n FROM ratings WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    foreignTestDays: one(`SELECT COUNT(*) n FROM test_days WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    foreignLinks: one(`SELECT COUNT(*) n FROM links WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    foreignFiles: one(`SELECT COUNT(*) n FROM attachments WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    // SEINE Beitraege in FREMDEN Eintraegen -- das zweite Haekchen
    kommentare: one(`SELECT COUNT(*) n FROM comments WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    bewertungen: one(`SELECT COUNT(*) n FROM ratings WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    testtage: one(`SELECT COUNT(*) n FROM test_days WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    // Der fuenfte und der sechste Traeger. Ohne sie saehe ein Zugang, der
    // zwanzig Links und ein Dutzend Dateien in fremden Eintraegen hinterlassen
    // hat, im Dialog leer aus.
    links: one(`SELECT COUNT(*) n FROM links WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    files: one(`SELECT COUNT(*) n FROM attachments WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id)
  };
}

/* Der Grabstein. Die Zeile wird NICHT entfernt -- sie bleibt mit ihrer id
   stehen, damit user_id weiterhin auf etwas zeigt und die Beitraege sichtbar
   bleiben, nur ohne Namen. Entfernte man sie, machte ON DELETE SET NULL den
   Bestand herrenlos und assignInventory() schoebe ihn beim naechsten Start still
   dem Eigentuemer zu: fremde Aussagen unter fremdem Namen.
   Mitgeloescht wird, was rein persoenlich ist: Sitzungen, Favoriten,
   Einstellungen. Inhalte nur auf ausdrueckliche Ansage. */
function removeUser(userId, optionen = {}, actor) {
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
    if (optionen.entries) db.prepare('DELETE FROM items WHERE user_id = ?').run(u.id);
    if (optionen.beitraege) {
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
    /* DER ZWEITE FAKTOR GEHT MIT, aus demselben Grund wie die Token: die
       Kaskade greift am Grabstein nie. HIER ist es richtig und beim SPERREN
       ausdruecklich falsch -- dort bliebe der Zugang bestehen, und ein Admin
       haette in "sperren und freigeben" einen Weg, einen fremden zweiten
       Faktor abzustreifen. Hier gibt es den Zugang danach nicht mehr; der Name
       wird frei, und wer ihn neu vergibt, bekommt eine neue Nummer. */
    db.prepare('DELETE FROM two_factor WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM two_factor_codes WHERE user_id = ?').run(u.id);
    db.prepare("UPDATE users SET username = ?, password_hash = '', role = 'user', " +
               "status = 'deleted', email = NULL WHERE id = ?")
      .run(tombstoneName(u.id), u.id);
  })();
  /* NACH der Transaktion, nicht darin: eine Protokollzeile, die einen Vorgang
     mitreisst, ueber den sie berichtet, waere die falsche Reihenfolge. Die
     Zeile bleibt stehen -- der Grabstein traegt seine Nummer weiter, target
     zeigt also weiterhin auf etwas. */
  log('user.delete', { actor: acting, target: u.id });
  return { id: u.id, name: u.username, tombstone: tombstoneName(u.id), counts, optionen };
}

// --- AUTH_RESET wird abgelehnt ------------------------------------------
// Ein Zuruecksetzen ueber eine Umgebungsvariable gibt es nicht: es machte alle
// Zugaenge und Zuordnungen mit einem Schlag kaputt. Passwort und Zugaenge
// verwaltet usertool.js auf dem Wirt. Still weglassen waere falsch: wer die
// Zeile in der .env stehen hat, muss es erfahren -- der Start bricht nicht ab,
// sagt es aber laut.
if (process.env.AUTH_RESET) {
  console.warn('[Kriterion] AUTH_RESET wird seit Version 0.8.0 nicht mehr ausgefuehrt und ist ' +
    'wirkungslos. Die Zeile kann aus der .env entfernt werden. Passwort vergessen: ' +
    'docker compose exec kriterion node usertool.js passwort <name> -- ' +
    'Zugang entfernen: node usertool.js entfernen <name>.');
}

// AUTH_USER/AUTH_PASSWORD werden nicht mehr gelesen. Der erste Zugang entsteht
// ueber die Einrichtungsseite; wer die Zeilen noch in der .env hat, erfaehrt es.
if (process.env.AUTH_USER || process.env.AUTH_PASSWORD) {
  console.warn('[Kriterion] AUTH_USER/AUTH_PASSWORD werden nicht mehr gelesen und koennen ' +
    'aus der .env entfernt werden. Der erste Zugang entsteht ueber die Einrichtungsseite.');
}

// --- Bremse gegen Durchprobieren ---------------------------------------
// Ohne Sperre laesst sich ein Passwort beliebig oft raten. Der Zaehler darf im
// Arbeitsspeicher liegen; ein Neustart als Ruecksetzung ist hinnehmbar.
//
// Gezaehlt wird ZWEIMAL -- je IP und je Benutzername: die IP-Bremse allein
// sieht verteiltes Raten gegen EINEN Namen nicht.
//
// DER NAME WIRD NUR VERZOEGERT, NIE GESPERRT. Eine harte Namenssperre waere
// ein Werkzeug GEGEN fremde Zugaenge: wer "faruk" kennt, sperrte ihn mit zehn
// falschen Passwoertern aus. Eine wachsende Verzoegerung bremst das Raten
// genauso und laesst den Richtigen durch -- hoechstens vier Sekunden.
const attempts = new Map(); // 'ip:…' | 'name:…' -> { count, until }
const SOFT_LIMIT = 5;    // ab hier verzoegerte Antwort
const HARD_LIMIT = 10;   // ab hier gesperrt -- NUR bei der IP
const BLOCK_MS = 5 * 60 * 1000;

const keyIp = (ip) => `ip:${ip}`;
const keyName = (name) => `name:${String(name || '').trim().toLowerCase()}`;

// Dieselbe Kurve fuer beide Zaehler: eine zweite Rechnung daneben waere eine
// zweite Wahrheit darueber, wie stark gebremst wird.
function delay(count) {
  const over = Math.max(0, count - SOFT_LIMIT + 1);
  return over > 0 ? Math.min(over * 700, 4000) : 0;
}

/* Die Adresse des Aufrufers -- Grundlage der Anmeldebremse.
   Ohne Proxy zaehlt allein die tatsaechliche Verbindung; der Kopf wird nicht
   einmal angesehen, er koennte nur luegen. Mit Proxy zaehlt der LETZTE
   Eintrag der Kette und nicht der erste: ein Proxy haengt die Gegenstelle,
   die er wirklich sieht, hinten an -- alles davor kann der Aufrufer selbst
   hineingeschrieben haben. */
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
  const a = attempts.get(keyIp(ip));
  if (a) {
    if (a.until && Date.now() < a.until) {
      return { blocked: true, retryInSec: Math.ceil((a.until - Date.now()) / 1000) };
    }
    if (a.until) attempts.delete(keyIp(ip));
    else delayMs = delay(a.count);
  }
  const b = attempts.get(keyName(name));
  if (b) delayMs = Math.max(delayMs, delay(b.count));
  return { blocked: false, delayMs };
}

function noteFailure(ip, name) {
  const a = attempts.get(keyIp(ip)) || { count: 0, until: 0 };
  a.count++;
  if (a.count >= HARD_LIMIT) a.until = Date.now() + BLOCK_MS;
  attempts.set(keyIp(ip), a);
  // Ohne until: der Name bekommt bewusst keine harte Sperre.
  if (String(name || '').trim()) {
    const b = attempts.get(keyName(name)) || { count: 0, until: 0 };
    b.count++;
    attempts.set(keyName(name), b);
  }
}

function noteSuccess(ip, name) {
  attempts.delete(keyIp(ip));
  if (String(name || '').trim()) attempts.delete(keyName(name));
}

// --- Sitzungen ---------------------------------------------------------
/* DIESE FUNKTION SIEHT ALLE COOKIES DES HOSTS AN, nicht nur die eigenen. Auf
   demselben Namen kann eine ganz andere Anwendung sitzen, und von Hand setzen
   laesst sich ohnehin jeder -- der Kopf `Cookie:` ist eine Liste von Fremden.

   DESHALB DARF EIN EINZELNER WERT DEN GANZEN KOPF NICHT ZU FALL BRINGEN.
   decodeURIComponent('%') wirft `URIError: URI malformed`; requireAuth ruft
   diese Funktion bei JEDER geschuetzten Anfrage, der Fehler-Handler machte
   daraus eine 500, und der Browser mit dem kaputten Cookie kaeme nicht mehr
   herein, bis jemand ihn von Hand loescht.

   DER NAME BLEIBT ROH, DER WERT WIRD VERSUCHT: ein Cookie, dessen Wert sich
   nicht dekodieren laesst, ist fuer diese Instanz kein Cookie und faellt
   stillschweigend heraus. Kein eigener Fehlerpfad, keine Message, keine Zeile
   im Sicherheitsprotokoll -- ein fremder Cookie ist kein Vorgang dieser
   Instanz, und eine Zeile, die ein Fremder ausloesen kann, gibt es schon.
   UND ER FAELLT EINZELN HERAUS UND NICHT ALS GANZER KOPF: neben dem kaputten
   steht der eigene, gueltige, und genau der soll ankommen. */
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
// DER STATUS WIRD HIER NICHT GEPRUEFT: ein gesperrter Zugang soll erfahren,
// dass er gesperrt ist -- aber erst, wenn er sein Passwort richtig eingegeben
// hat. Sonst waere die Message ein Werkzeug zum Durchprobieren von Namen. Die
// Entscheidung faellt eine Ebene hoeher, in der Anmelderoute.
async function checkLogin(name, password) {
  const u = getUserByName(name);
  // Auch ohne Zugang wird gerechnet, sonst verraet die Antwortzeit, ob der
  // Benutzername stimmt. Ein GRABSTEIN traegt einen leeren Hash -- ohne den
  // Rueckfall auf den Blindwert waere er messbar schneller abgewiesen als ein
  // lebender Zugang mit falschem Passwort.
  const nameMatches = u ? safeEqual(name || '', u.username) : false;
  const passwordMatches = await checkPassword(password || '',
    (u && u.password_hash) ? u.password_hash : DUMMY_VALUE);
  if (nameMatches && passwordMatches) return u;
  /* DIE EINZIGE ZEILE, DIE EIN FREMDER AUSLOESEN KANN -- und sie steht HIER,
     weil nur hier bekannt ist, ob der getippte Name ueberhaupt einen Zugang
     traf. Der getippte Name selbst geht NICHT in die Tabelle: sonst landete
     frueher oder spaeter ein ins falsche Feld getipptes Passwort darin.
     Geschrieben wird nur, wenn es bis hierher gekommen ist -- der gesperrte
     Fall ruft diese Funktion gar nicht erst, und damit ist die Bremse der
     Deckel ueber der Tabelle. */
  log('login.fail', { actor: null, target: nameMatches ? u.id : null });
  return null;
}

// Eine Sitzung entsteht in dieser Anwendung ausschliesslich durch eine
// Anmeldung -- ueber die Anmeldeseite oder ueber die Ersteinrichtung. Deshalb
// wird last_login genau hier mitgeschrieben und nicht an beiden Aufrufstellen
// einzeln: eine Stelle kann nicht auseinanderlaufen.
function createSession(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Eine Sitzung braucht einen Benutzer.');
  }
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, id);
  db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`).run(id);
  /* HIER und nicht an den drei Aufrufstellen einzeln -- aus demselben Grund
     wie last_login darueber: eine Sitzung entsteht ausschliesslich durch eine
     Anmeldung, ueber die Anmeldeseite, die Ersteinrichtung oder das Einloesen
     eines Links. Eine Stelle kann nicht auseinanderlaufen. */
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

/* --- Meine Sitzungen ----------------------------------------------------
   WIE WIRD EINE SITZUNG ADRESSIERT, OHNE IHREN TOKEN IN EINE URL ZU SCHREIBEN?
   Der Token ist Primaerschluessel UND Geheimnis; in einem Pfad stuende er im
   Zugriffsprotokoll, in der Verlaufsliste und womoeglich im Referrer.
   Genommen ist eine KENNUNG, aus dem Token gerechnet und nirgends gespeichert:
   der volle SHA-256, nicht die ersten Stellen -- damit stellt sich die Frage
   nach der Eindeutigkeit gar nicht erst. Wer die Kennung kennt, kann damit
   nichts oeffnen.

   WAS DIE LISTE NICHT ENTHAELT, UND ZWAR ABSICHTLICH: keine IP-Adresse und
   keinen Browserkopf -- die Instanz speichert beides nicht. Die Karte kann
   damit "diese hier" von "alle anderen" trennen und die ZAHL nennen, und mehr
   braucht der Knopf daneben nicht. */
const sessionIdOf = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

/* SQLite kann SHA-256 nicht rechnen, also wird die Kennung hier gebildet und
   nicht in der Abfrage. Das traegt, weil je Benutzer eine Handvoll Zeilen
   dastehen -- die Abfrage selbst greift ueber idx_sessions_user. */
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
    diese: Boolean(ownToken) && z.token === ownToken
  }));
}

// Beendet EINE Sitzung des angemeldeten Benutzers. Die Klemme auf user_id ist
// die ganze Rechtefrage dieser Funktion: ohne sie beendete eine fremde Kennung
// eine fremde Sitzung.
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

/* EIN ORT, ZWEI RUFER: der Passwortwechsel in PUT /api/account und der Knopf
   "alle anderen beenden". Stuende die Zeile zweimal im Quelltext, waere das
   der Fall aus Stolperstein 47 -- zwei Wege zu derselben Sache, und keiner
   von beiden traegt allein eine Gegenprobe.
   "AND user_id = ?" GEHOERT DAZU: ohne die Klemme wirft ein Passwortwechsel
   jeden anderen Benutzer gleich mit hinaus. */
function endOtherSessions(userId, ownToken) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Das Beenden braucht den angemeldeten Benutzer.');
  return db.prepare('DELETE FROM sessions WHERE token != ? AND user_id = ?')
    .run(String(ownToken || ''), id).changes;
}

/* --- Token: ein Mechanismus, zwei Anlaesse ------------------------------
   32 Zufallsbytes, gespeichert wird nur der Hash, einmal gueltig, Ablauf nach
   sieben Tagen, beim Einloesen fallen alle Sitzungen dieses Benutzers.
   Die Begruendung zu Hash und Spalten steht am Schema in db.js.

   DER LINK IST EIN PASSWORTERSATZ AUF ZEIT: er steht nach der Weitergabe in
   einem fremden Verlauf, deshalb ist er kurzlebig und gilt genau einmal. Die
   Oberflaeche sagt das an der Stelle, an der er kopiert wird. */
const TOKEN_DAYS = 7;
// Wie lange die BENUTZTE Zeile als Spur stehen bleibt, gerechnet ab Ablauf.
// Eine Schwelle statt zweier: ein Wert, eine Regel, eine Gegenprobe.
const TOKEN_TRACE_DAYS = 30;
const TOKEN_PURPOSES = ['invite', 'reset'];

/* --- Die Frist ab dem ersten Oeffnen ------------------------------------
   SIEBEN TAGE SIND DIE FRIST FUER DAS LESEN DER MAIL, NICHT FUER DAS LIEGEN
   DES LINKS. Solange niemand geoeffnet hat, laufen die sieben Tage weiter. Ab
   dem ERSTEN Oeffnen ist der Link erwiesenermassen angekommen -- und hat in
   einem fremden Postfach nichts mehr verloren.

   WARUM DAS HIER TRAEGT: der uebliche Grund gegen kurze Fristen an
   Einmal-Links sind Vorschaudienste, die Links vorab holen und verbrennen.
   Der Schluessel steht im FRAGMENT (#/invite/…), und ein Fragment geht nie
   an den Server -- ein Vorschaudienst loest die Frist also gerade NICHT aus.

   INNERHALB DER FRIST DARF BELIEBIG OFT GEOEFFNET WERDEN: NUR DER ERSTE
   Aufruf schreibt herunter, der zweite sieht einen Ablauf, der naeher liegt
   als die Frist, und ruehrt ihn nicht an.

   KEINE NEUE SPALTE: geschrieben wird ablauf, die es laengst gibt. Der Preis,
   ehrlich benannt -- hinterher ist nicht mehr zu sehen, OB ein Link schon
   einmal geoeffnet wurde, nur noch, wann er ablaeuft. */
const TOKEN_DEADLINE_MINUTES = 15;

// Liefert den Ablauf, der danach gilt -- fuer den Aufrufer, der ihn nennen
// will. Schreibt HOECHSTENS herunter, nie hinauf: ein zweiter Aufruf darf die
// Frist nicht verlaengern, sonst haelt sie ein Neuladen im Minutentakt offen.
const setDeadline = db.prepare(
  `UPDATE tokens SET expires_at = datetime('now', ?)
    WHERE hash = ? AND used_at IS NULL AND expires_at > datetime('now', ?)`);
function startTokenDeadline(hash) {
  const modifier = `+${TOKEN_DEADLINE_MINUTES} minutes`;
  // ZWEI MODIFIKATOREN WAEREN ZWEI ARGUMENTE (Stolperstein 119) -- hier steht
  // derselbe zweimal, einmal als neuer Wert und einmal als Schranke davor.
  setDeadline.run(modifier, String(hash || ''), modifier);
  return TOKEN_DEADLINE_MINUTES;
}

const tokenHash = (raw) => crypto.createHash('sha256').update(String(raw)).digest('hex');

/* Dieselbe Bauform wie raeumePapierkorbAuf(): EINE Funktion, ZWEI
   Aufrufstellen -- beim Start und beim Oeffnen der Karte. Eine Instanz, die
   drei Monate durchlaeuft, raeumte sonst drei Monate lang nicht auf.
   ZWEI MODIFIKATOREN WAEREN ZWEI ARGUMENTE (Stolperstein 119); hier steht
   einer, und er wird gebunden statt in den String geschrieben. */
const delTokensOld = db.prepare("DELETE FROM tokens WHERE expires_at < datetime('now', ?)");
function cleanupTokens() {
  const n = delTokensOld.run(`-${TOKEN_TRACE_DAYS} days`).changes;
  if (n) console.log(`[Kriterion] Token: ${n} Zeile(n) laenger als ` +
    `${TOKEN_TRACE_DAYS} Tage abgelaufen und entfernt.`);
  return n;
}

/* Erzeugt einen Token und gibt den KLARTEXT genau einmal zurueck -- er steht
   danach nirgends mehr, auch nicht in der Datenbank. Wer ihn verliert, erzeugt
   einen neuen.
   Die Rechtefrage steht hier ausdruecklich NICHT: wer einladen darf,
   entscheidet server.js an der Route -- dieselbe Trennung wie bei der
   uebrigen Zugangsverwaltung. */
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

/* Schlaegt den Token NACH -- er ist der Schluessel, nicht ein Wert, der
   verglichen wird. Deshalb kein zeitunabhaengiger Vergleich: wer den Hash
   bilden kann, hat den Token bereits.
   EINE EINZIGE ABSAGE FUER ALLE FAELLE -- abgelaufen, schon benutzt,
   erfunden, Zugang gesperrt, Frist verstrichen. Drei Meldungen waeren drei
   Auskuenfte an jemanden, der raet, und dem Ehrlichen helfen sie nicht: das
   Heilmittel ist jedes Mal dasselbe, naemlich beim Admin einen neuen Link
   holen.
   Liefert die Benutzerzeile oder null -- nie ja/nein: der Aufrufer muss den
   Namen nennen koennen, sobald der Token traegt. VORHER nennt ihn niemand,
   sonst verriete ein geratener Token einen Benutzernamen. */
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

/* Loest ein. EINE Transaktion: entweder steht das neue Passwort UND der Token
   ist verbraucht, oder es hat sich nichts bewegt.
   ALLE UEBRIGEN OFFENEN TOKEN DIESES BENUTZERS FALLEN MIT -- das steht so
   nicht im Konzeptpapier und gehoert trotzdem hierher: laege noch ein
   aelterer Link in einem fremden Verlauf, setzte er hinterher ein zweites Mal
   ein Passwort. "Einmal gueltig" waere dann nur fuer den einen Link wahr.
   DIE SITZUNGEN FALLEN ueber setNewPassword -- dort steht die Regel schon,
   und ein zweiter Ort dafuer waere ein zweiter, der auseinanderlaufen kann. */
async function redeemToken(plain, newPassword) {
  const token = checkToken(plain);
  if (!token) throw new Message('server.linkExpired');
  if (String(newPassword || '').length < PASSWORD_MIN)
    throw new Message('login.passwordTooShort', { min: PASSWORD_MIN });
  // Ausserhalb der Transaktion: scrypt rechnet absichtlich lange, und eine
  // Transaktion soll nicht so lange offen stehen.
  const hash = await hashPassword(newPassword);
  db.transaction(() => {
    db.prepare("UPDATE tokens SET used_at = datetime('now') WHERE hash = ?").run(token.hash);
    db.prepare('DELETE FROM tokens WHERE user_id = ? AND used_at IS NULL').run(token.id);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, token.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(token.id);
  })();
  // Der Einloesende handelt an sich selbst -- er ist ja gerade dabei, sein
  // eigenes Passwort zu setzen. Die Zeile steht NACH der Transaktion.
  log('link.use', { actor: token.id, target: token.id, detail: token.purpose });
  return { id: token.id, username: token.username, purpose: token.purpose };
}

/* --- Die Selbstanmeldung ------------------------------------------------
   EINE ANFRAGE IST NOCH KEIN ZUGANG, und der Admin schaltet frei -- IMMER.
   Es gibt keine Betriebsart, in der der geklickte Link allein hereinlaesst.

   DER BESTAETIGUNGSLINK HAT KEINE PASSWORTKRAFT: wer ihn anklickt, belegt,
   dass die Adresse ihm gehoert. Ohne ihn koennte jeder eine FREMDE Adresse in
   die Liste des Admins schreiben, und beim Freischalten ginge einer Person,
   die nie gefragt hat, eine Mail mit Passwortkraft zu.

   DER SCHLUESSEL GEHT DENSELBEN WEG WIE EIN TOKEN -- 32 Zufallsbytes, nur der
   Hash wird gespeichert; tokenHash() wird dabei WIEDERVERWENDET. */
const REQUEST_HOURS = 24;
/* WARUM DEUTLICH KUERZER ALS DIE SIEBEN TAGE DES EINLADUNGSLINKS: dort ist
   geprueft, WER den Link bekommt -- ein Admin hat den Zugang angelegt. Hier
   ist noch gar nichts geprueft; die Zeile steht auf nichts als der Behauptung
   eines Fremden. Eine Anfrage, die einen Tag lang nicht bestaetigt wird, ist
   entweder verirrt oder nie gewollt gewesen. */
const REQUEST_CAP = 20;
/* EINE LAENGENGRENZE, UND SIE GILT NUR HIER: das ist die einzige Stelle im
   Projekt, an der ein FREMDER etwas in die Datenbank schreibt. Ohne Grenze
   passte in jede der zwanzig Zeilen, was der Rumpf hergibt (zwei Megabyte).
   SIE IST KEINE ZWEITE WAHRHEIT UEBER BENUTZERNAMEN -- checkName bleibt
   unveraendert, begrenzt wird die EINGABE VON AUSSEN. 254 ist die Laenge, die
   eine Mailadresse ueberhaupt haben darf. */
const REQUEST_NAME_MAX = 64;
const REQUEST_MAIL_MAX = 254;

/* Der Deckel zaehlt BESTAETIGTE UND UNBESTAETIGTE ZUSAMMEN. Zaehlte er nur
   die bestaetigten, fuellte ein Angreifer die Tabelle mit Unbestaetigten,
   ohne je eine Mail zu lesen -- und der Admin saehe davon nichts. */
const qRequestCount = db.prepare('SELECT COUNT(*) n FROM requests');
const countRequests = () => qRequestCount.get().n;

/* Dieselbe Bauform wie cleanupTokens(), aber mit DREI Aufrufstellen --
   Start, Karte und die Anfrageroute. Die dritte steht VOR der Deckelpruefung,
   sonst blockierten zwanzig laengst verfallene Zeilen die Selbstanmeldung
   noch einen weiteren Tag.
   GERAEUMT WIRD NUR DAS UNBESTAETIGTE: eine bestaetigte Anfrage wartet auf
   den Admin, so lange es dauert.
   EIN MODIFIKATOR, und er wird GEBUNDEN statt in den String geschrieben
   (Stolperstein 119). */
const delRequestsOld = db.prepare(
  "DELETE FROM requests WHERE confirmed_at IS NULL AND created_at < datetime('now', ?)");
function cleanupRequests() {
  const n = delRequestsOld.run(`-${REQUEST_HOURS} hours`).changes;
  if (n) console.log(`[Kriterion] Selbstanmeldung: ${n} unbestaetigte Anfrage(n) aelter als ` +
    `${REQUEST_HOURS} Stunden entfernt.`);
  return n;
}

/* Legt eine Anfrage an und liefert den KLARTEXT des Bestaetigungsschluessels
   -- oder null, wenn nichts entstehen soll.

   NULL IST KEIN FEHLER UND KEINE ABSAGE, sondern die stille Verwerfung: der
   Aufrufer schreibt in JEDEM Fall dieselbe Antwort. Fuenf Lagen enden hier
   bei null -- unbrauchbarer Name, unbrauchbare Adresse, Name schon vergeben,
   Adresse schon vergeben, Deckel erreicht. Die sechste (Schalter aus) faellt
   schon an der Route.

   JE ADRESSE HOECHSTENS EINE OFFENE ANFRAGE, und das ist eine Entscheidung
   ueber den VERSAND: ohne sie waere das Formular ein Weg, einer fremden
   Adresse beliebig viele Bestaetigungsmails zu schicken. Der Preis, ehrlich
   benannt -- geht die eine Mail verloren, wartet der Anfragende bis zum
   Verfall.

   GEPRUEFT WIRD MIT checkName UND mail.isAddress, wie an einem echten
   Zugang: was nie ein Zugang werden koennte, kommt gar nicht erst in die
   Warteschlange. VERGLICHEN WIRD OHNE RUECKSICHT AUF GROSS UND KLEIN -- zwei
   Adressen, die sich nur in der Schreibweise unterscheiden, sind dasselbe
   Postfach. */
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
  /* KEINE PROTOKOLLZEILE. Sie waere die einzige neben der gescheiterten
     Anmeldung, die ein FREMDER ausloesen kann -- und damit die zweite Stelle,
     an der sich die Tabelle von aussen vollschreiben liesse. Beim Anmelden
     traegt die Bremse den Deckel; hier gaebe es keinen. Der Vorgang, auf den
     es ankommt, ist ohnehin die Entscheidung des Admins, und die steht drin. */
  return plain;
}

/* Bestaetigt eine Anfrage. LIEFERT ja/nein UND NICHTS UEBER DIE ZEILE -- der
   Bestaetigende weiss ja, was er angefragt hat, und wer den Schluessel nur
   raet, soll aus der Antwort keinen Namen und keine Adresse ziehen.
   EINE EINZIGE ABSAGE FUER ALLE FAELLE -- erfunden, verfallen, schon
   bestaetigt, laengst freigeschaltet. Dieselbe Ueberlegung wie beim Token:
   das Heilmittel ist in jedem Fall dasselbe, naemlich die Anfrage neu stellen.
   ZWEIMAL KLICKEN IST UNSCHAEDLICH: confirmed_at wird nur gesetzt, wo es noch
   leer ist, und der zweite Aufruf trifft dieselbe Zeile und meldet ebenfalls
   Erfolg. Wer neu laedt, soll nicht vor einer Absage stehen. */
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

/* Was der Admin sieht: AUSSCHLIESSLICH DIE BESTAETIGTEN. Eine unbestaetigte
   Anfrage erscheint nicht -- sonst stuende dort die Adresse eines Menschen,
   der von der ganzen Sache nichts weiss, und der Admin koennte sie
   freischalten. Genau die Luecke schliesst die Bestaetigungsmail.
   DER SCHLUESSEL KOMMT HIER NIE HERAUS, auch nicht sein Hash: die Karte
   braucht die Nummer, und mehr hat sie mit dem Geheimnis nicht zu tun. */
const qRequests = db.prepare(
  `SELECT id, username, email, created_at, confirmed_at
     FROM requests WHERE confirmed_at IS NOT NULL ORDER BY confirmed_at ASC, id ASC`);
const listRequests = () => qRequests.all();
const getRequest = (id) => db.prepare(
  'SELECT id, username, email, created_at, confirmed_at FROM requests WHERE id = ?')
  .get(Number(id) || 0) || null;
const removeRequest = (id) =>
  db.prepare('DELETE FROM requests WHERE id = ?').run(Number(id) || 0).changes > 0;

/* --- Das Sicherheitsprotokoll -------------------------------------------
   ES HAELT FEST, WER ZUGANG HATTE UND WER DIE INSTANZ ALS GANZES ANGEFASST
   HAT -- und ausdruecklich nichts darueber, was jemand GESAGT hat. Die
   Begruendung zu Spalten und Grenzen steht am Schema in db.js.

   EINUNDZWANZIG VORGAENGE, und die Liste ist die Entscheidung. Was nicht darin
   steht, steht mit Begruendung im Aenderungsprotokoll seiner Runde -- eine
   stillschweigend weggelassene Zeile waere von einer entschiedenen nicht zu
   unterscheiden.

   EINE REGEL MIT EINER BENANNTEN AUSNAHME: ein GESCHEITERTER Vorgang schreibt
   NICHTS. Ausgenommen sind die beiden, bei denen das Scheitern selbst der
   Vorgang ist -- die gescheiterte Anmeldung und die gescheiterte zweite
   Bestaetigung. Beide sind das, wonach man hinterher sucht.

   DIE GESCHEITERTE ANMELDUNG IST DIE EINZIGE ZEILE, DIE EIN FREMDER AUSLOESEN
   KANN, und damit die einzige, mit der sich die Tabelle von aussen
   vollschreiben liesse. Ihr Deckel ist die Bremse, die es schon gibt:
   geschrieben wird NUR, wenn die Anfrage die Passwortpruefung wirklich
   erreicht hat -- der gesperrte Fall schreibt nichts. Damit sind es hoechstens
   HARD_LIMIT Zeilen je Adresse und BLOCK_MS, und die Obergrenze ist eine
   Eigenschaft der Instanz statt einer Regel, die jemand durchsetzen muesste.
   Der Preis, ehrlich benannt: verteiltes Raten aus vielen Adressen schreibt
   weiterhin viele Zeilen. Die Frist traegt es, und die ersten zehn je Adresse
   sind die Spur, auf die es ankommt. */
const EVENTS = [
  'login.ok', 'login.fail', 'confirm.fail',
  'user.new', 'user.role', 'user.status', 'user.password',
  'user.delete', 'user.self',
  'link.new', 'link.use',
  /* 'request.approve' und 'request.reject' -- die Entscheidung des Admins ueber
     eine Selbstanmeldung. NICHT DOPPELT zu zugang.neu und link.neu: keine der
     beiden sagt, dass der Zugang aus einer SELBSTANMELDUNG kam. Die Ablehnung
     hinterliesse ohne ihre Zeile gar keine Spur.
     KEIN NAME UND KEINE ADRESSE in beiden: anfrage.frei traegt den neuen
     Zugang als ziel, anfrage.ab gar keines.
     KEINE ZEILE FUER DIE ANFRAGE UND DIE BESTAETIGUNG -- das waeren die
     einzigen neben der gescheiterten Anmeldung, die ein Fremder ausloesen
     kann. */
  'request.approve', 'request.reject',
  /* 'key' -- der Wechsel des Datenbankschluessels. Er
     laeuft ueber keytool.js auf dem Wirt und traegt deshalb IMMER das leere
     `actor` von dort: "ueber den Wirt". Ein Handelnder stuende hier nur als
     Behauptung, denn wer den Befehl ausfuehren kann, koennte sie setzen.
     DIE ZEILE NENNT, DASS GEWECHSELT WURDE, NIE WOHIN. Kein Merkmal, kein
     Ziel, kein Wert -- weder der alte noch der neue. Das ist die schaerfste
     Auslegung des Merksatzes zu Kontrollausgaben, und sie gilt hier ohne jede
     Ausnahme: die eine Stelle, an der ein Schluessel zum Abschreiben steht,
     ist der Bildschirm des Wirts, nicht diese Tabelle. */
  /* 'twofactor.on', 'twofactor.off' und 'twofactor.reset'.
     DER DRITTE IST DER, AUF DEN ES ANKOMMT: ein verbrauchter
     Wiederherstellungscode ist die einzige Zeile im ganzen Protokoll, die
     sagt, dass jemandem das Telefon abhanden gekommen ist.
     KEIN VIERTER FUER DEN FALSCHEN CODE: eine gescheiterte zweite Stufe IST
     eine gescheiterte Anmeldung und schreibt 'login.fail'.
     KEIN NEUES MERKMAL -- 'an' und 'aus' tragen den Betroffenen als wer UND
     als ziel. MERKMALE bleibt bei dreizehn. */
  'twofactor.on', 'twofactor.off', 'twofactor.reset',
  /* 'backup.delete' -- eine entfernte alte Sicherung, seit 0.20.0. Sie steht
     NEBEN 'backup' und nicht an seiner Stelle: das eine legt eine Kopie an,
     das andere wirft welche weg, und die beiden Vorgaenge sind gegenlaeufig.
     EINE ZEILE JE ENTFERNTER KOPIE. Die ZAHL der entfernten Kopien gehoert ins
     Protokoll, eine Spalte dafuer gibt es aber nicht -- `actor` und `target` sind
     Benutzernummern, `detail` ist eine geschlossene Liste ohne Ziffern, und
     Freitext gibt es hier ausdruecklich nicht. Damit ist die Zahl die
     ZEILENZAHL, und das ist dieselbe Aussage in der Form, die die Tabelle
     traegt.
     KEIN DATEINAME, KEIN PFAD, KEINE BYTES: das Protokoll haelt Vorgaenge
     fest, keine Orte auf dem Wirt -- dieselbe Regel wie beim
     `backup`-Eintrag daneben. Die freigegebenen Bytes stehen in der Antwort
     und im Containerprotokoll. MERKMALE bleibt deshalb bei vierzehn. */
  'export', 'import', 'backup', 'backup.delete', 'key'
];
/* Die geschlossene Liste fuer merkmal. NICHTS ausserhalb davon kommt in die
   Tabelle -- damit ist "kein Freitext von aussen" baulich wahr und nicht bloss
   beabsichtigt. Wer einen Vorgang ergaenzt, ergaenzt hier oder nimmt null.
   'part' SEIT 0.13.0 UND OHNE NUMMER: 0.12.4 schrieb "teil 1/5" hierher, und
   weil das kein Merkmal aus dieser Liste ist, fiel die GANZE Zeile weg -- ein
   Bestand, der in fuenf Teilen hinausging, hinterliess im Protokoll nichts.
   Die geschlossene Liste hat also gehalten, was sie zusagt; falsch war die
   Aufrufstelle. DIE NUMMER DES TEILS STEHT IM DATEINAMEN und gehoert nicht
   hierher: sie waere Freitext, und genau den gibt es in dieser Spalte nicht. */
const DETAILS = ['user', 'admin', 'owner', 'active', 'locked',
                  'invite', 'reset', 'merge', 'replace',
                  'name', 'password', 'address', 'both', 'part'];

// Eine Frist, laenger als die dreissig Tage von Papierkorb und Tokenspur: ein
// Protokoll, das den Vorfall vergisst, bevor jemand ihn bemerkt, ist keins.
// Ein halbes Jahr deckt auch eine lange Abwesenheit ab.
const LOG_DAYS = 180;
// Wie viele Zeilen die Karte hoechstens holt. Die GESAMTZAHL steht daneben,
// damit aus "hundert Zeilen" nicht "hundert Vorgaenge" gelesen wird.
const LOG_LIMIT = 100;

const insertLog = db.prepare(
  'INSERT INTO security_log (event, actor, target, detail) VALUES (?, ?, ?, ?)');

/* WER HANDELT -- die Nummer des Angemeldeten oder FROM_HOST fuer usertool.js.
   KEIN VORGABEWERT, und die Klemme darunter ist keine Zierde: ein vergessenes
   Argument waere still eine FALSCHAUSSAGE -- die Zeile behauptete dann, der
   Vorgang sei ueber den Wirt gelaufen. Dieselbe Ueberlegung wie bei qComments
   in server.js, nur mit umgekehrtem Vorzeichen: null ist hier ein gueltiger
   Wert, undefined nicht. */
const FROM_HOST = 'wirt';
function checkActor(actor) {
  if (actor === FROM_HOST) return null;
  const n = Number(actor);
  if (!Number.isInteger(n) || n <= 0)
    throw new Error('Dieser Vorgang braucht den Handelnden — eine Nummer oder VOM_WIRT.');
  return n;
}

/* Schreibt EINE Zeile. Die Rechtefrage steht hier ausdruecklich NICHT -- wer
   etwas darf, entscheidet server.js an der Route; usertool.js laeuft auf dem
   Wirt und hat ohnehin alles. Diese Funktion haelt nur fest.
   SIE WIRFT NIE. Ein Protokoll, das den Vorgang mitreisst, ueber den es
   berichten soll, waere schlimmer als keins -- geschrieben wird deshalb NACH
   dem Vorgang, und ein Fehlschlag geht ins Containerprotokoll.
   DIE BEIDEN LISTEN WERDEN GEPRUEFT, nicht vorausgesetzt: ein vertippter
   Vorgangsname faellt sonst erst auf, wenn ihn jemand in der Karte sucht. */
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
    console.error('[Kriterion] Sicherheitsprotokoll:', e.message);
  }
}

/* Dieselbe Bauform wie cleanupTokens() und raeumePapierkorbAuf(): EINE
   Funktion, ZWEI Aufrufstellen -- beim Start und beim Oeffnen der Karte. Eine
   Instanz, die ein halbes Jahr durchlaeuft, raeumte sonst ein halbes Jahr lang
   nicht auf.
   EIN MODIFIKATOR, und er wird GEBUNDEN statt in den String geschrieben
   (Stolperstein 119). */
const delLogOld = db.prepare("DELETE FROM security_log WHERE at < datetime('now', ?)");
function cleanupLog() {
  const n = delLogOld.run(`-${LOG_DAYS} days`).changes;
  if (n) console.log(`[Kriterion] Sicherheitsprotokoll: ${n} Zeile(n) aelter als ` +
    `${LOG_DAYS} Tage entfernt.`);
  return n;
}

/* Die juengsten Zeilen fuer die Karte, samt Gesamtzahl. Die NAMEN kommen ueber
   einen JOIN und nicht aus der Tabelle -- ein Grabstein liefert dabei null,
   und daraus macht die Oberflaeche "Geloeschter Benutzer <nr>", genau wie an
   jedem Beitrag im Eintrag. */
/* DIE GRUPPEN DES FILTERS -- eine geschlossene Liste ueber einer geschlossenen
   Liste. Sie steht hier und nicht in der Oberflaeche: die Auswahl geht an den
   SERVER, denn die Karte holt die hundert JUENGSTEN Zeilen. Ein Filter, der
   erst im Browser greift, durchsuchte nur diese hundert -- und genau darin
   findet man die gescheiterten Anmeldungen nicht, weil sie zwischen allem
   anderen stehen. Das war der Befund.
   JEDER VORGANG STEHT IN GENAU EINER GRUPPE, und ein Waechter im Pruefstand
   rechnet das nach: ein neuer Vorgang, der in keiner steht, waere unter keiner
   Ansicht zu finden -- ausser unter "alle", und dort sucht ihn niemand.
   DIE WOERTER AM BILDSCHIRM STEHEN IN DER OBERFLAECHE, wie bei den Vorgaengen
   selbst: hier stehen Schluessel und Zuordnung, dort die deutsche Beschriftung. */
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
/* JE GRUPPE EINE VORBEREITETE ABFRAGE, beim Laden gebaut. Die Fragezeichen
   entstehen aus der GESCHLOSSENEN Liste und nie aus einer Anfrage; die Werte
   werden gebunden und nicht in den String geschrieben (Stolperstein 119). */
const qLogGroup = Object.fromEntries(Object.entries(LOG_GROUPS).map(([k, kinds]) =>
  [k, db.prepare(`${LOG_COLUMNS} WHERE p.event IN (${kinds.map(() => '?').join(',')})` +
                 ' ORDER BY p.id DESC LIMIT ?')]));
const qLogCount = db.prepare('SELECT COUNT(*) n FROM security_log');
const qLogPerKind = db.prepare('SELECT event, COUNT(*) n FROM security_log GROUP BY event');

/* WELCHE GRUPPE WIE VIELE ZEILEN HAT -- die Zahlen an den Filterpillen. Sie
   zaehlen ueber die GANZE Tabelle und nicht ueber die geholten hundert: eine
   Zahl, die nur ihren eigenen Ausschnitt zaehlt, sagt genau das nicht, was man
   von ihr wissen will. */
function logCounts() {
  const perKind = Object.fromEntries(qLogPerKind.all().map(z => [z.event, z.n]));
  const out = { all: 0 };
  for (const [k, kinds] of Object.entries(LOG_GROUPS))
    out[k] = kinds.reduce((n, a) => n + (perKind[a] || 0), 0);
  out.all = Object.values(perKind).reduce((n, x) => n + x, 0);
  return out;
}

/* `group` ist ein Schluessel aus LOG_GROUPS oder null fuer alle. Ein
   unbekannter Wert wird HIER nicht abgefangen -- die Route weist ihn ab, denn
   ein stillschweigendes "dann eben alles" saehe aus wie ein Erfolg. */
function readLog(limit = LOG_LIMIT, group = null) {
  const rows = group
    ? qLogGroup[group].all(...LOG_GROUPS[group], limit)
    : qLog.all(limit);
  const counts = logCounts();
  /* DIE FELDNAMEN DIESER ANTWORT SIND NOCH DEUTSCH -- sie ziehen mit
     public/app.js in Bauabschnitt 4 um, wo ihr einziger Leser steht. */
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
   WAS DIE INSTANZ ALS GANZES TRIFFT, WIRD EIN ZWEITES MAL BESTAETIGT.
   Verteidigt wird nicht gegen den Fremden -- der kommt ohne Passwort gar
   nicht herein --, sondern gegen die FREMDE OFFENE SITZUNG.

   WARUM EINE FREIGABE UND NICHT DAS PASSWORT IM RUMPF DER HANDLUNG: an zwei
   der sieben Wege geht das nicht.
     * GET /api/export ist eine BROWSERNAVIGATION -- ein Rumpf ist dort
       baulich unmoeglich, und in die Adresse gehoert ein Passwort nie.
     * POST /api/import traegt seinen Waechter VOR multer, damit die bis zu
       900 MB grosse Datei eines Fremden gar nicht erst eingelesen wird. Ein
       Passwort im Multipart-Rumpf waere erst DANACH lesbar.
   Die Freigabe kann beides, weil sie VOR der Handlung steht und nicht in ihr.

   SIE BRAUCHT KEIN SCHEMA und liegt im Arbeitsspeicher, neben attempts: ein
   Neustart als Ruecksetzung kostet ein zweites Tippen.

   GEBUNDEN AN DEN SITZUNGSTOKEN, nicht an den Benutzer -- eine zweite offene
   Sitzung desselben Menschen muss selbst bestaetigen. GEBUNDEN AN ZWECK UND
   ZIEL: eine Freigabe fuer den Export entfernt keinen Zugang.
   EINMAL GUELTIG. */
const RELEASE_MS = 120 * 1000;
/* ACHT WEGE UEBER SIEBEN ROUTEN. 'mail' kam mit 0.9.0 dazu: wer den
   Mailzugang setzt, entscheidet, ueber wessen Server JEDER kuenftige
   Ruecksetzlink dieser Instanz laeuft; das trifft die Instanz als Ganzes und
   liegt damit in derselben Zeile wie Export und Import.
   'images' kommt mit 0.19.0 dazu und ist der einzige Zweck der Liste, der
   BYTES UEBERSCHREIBT: die Umstellung der Bildablage schreibt jeden PNG-Blob
   der Instanz um, und die alte Fassung ist danach weg. Es gibt dafuer keinen
   Papierkorb und keinen Rueckweg -- die Rueckfahrkarte ist die Sicherung des
   Datenverzeichnisses. Genau deshalb steht er hier und nicht bloss hinter
   nurEigentuemer.
   'backup' kommt mit 0.20.0 dazu und ist der ZWEITE, der Bytes entfernt --
   und der erste, der GANZE DATEIEN vom Dateisystem des Wirts nimmt. Eine
   geloeschte Sicherung holt nichts zurueck: es gibt keinen Papierkorb dafuer,
   und die Vorschau in der Karte ist der Ersatz. Der Zweck deckt beide Wege der
   einen Route -- die Regel einmal anwenden und die veralteten Kopien
   wegraeumen; beide entfernen Dateien, und der Unterschied ist, WELCHE.
   Die Zahl steht im Projektstand und wird dort nachgezaehlt, nicht
   abgeschrieben -- Stolperstein 137. */
const CONFIRM_PURPOSES = ['export', 'import', 'role', 'password', 'remove', 'link', 'mail',
                             'images', 'backup'];
/* DER SCHLUESSEL IST DIE GANZE BINDUNG: Sitzungstoken, Zweck und Ziel. Ein
   einziger Platz je Sitzung waere eine stille Falle -- eine Anfrage, die zwei
   Zwecke braucht (Rolle UND Passwort in einem Rumpf), verloere mit dem ersten
   Verbrauch den zweiten und schiene an der Schranke zu scheitern, obwohl beide
   bestaetigt waren. */
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
  return { purpose, sekunden: RELEASE_MS / 1000 };
}

/* Prueft UND verbraucht in einem. Zwei Funktionen -- eine, die nachsieht, und
   eine, die verbraucht -- waeren zwei Stellen, und die Route, die die zweite
   vergisst, saehe von aussen genauso aus wie die richtige.
   VERBRAUCHT WIRD AUCH DIE ABGELAUFENE: sonst bliebe sie liegen und ein
   zweiter Versuch sagte dasselbe. */
function useRelease(token, purpose, target) {
  if (!token) return false;
  const k = releaseKey(token, purpose, target);
  const until = releases.get(k);
  if (until === undefined) return false;
  releases.delete(k);
  return Date.now() <= until;
}

// Mit der Sitzung fallen ihre Freigaben. Ohne das ueberlebten sie eine
// Abmeldung im Arbeitsspeicher und stuenden einer neuen Sitzung mit demselben
// Token -- den es zwar nicht zweimal gibt, aber eine Zusicherung, die von
// dieser Annahme lebt, ist keine.
function dropRelease(token) {
  if (!token) return;
  const front = `${String(token)}|`;
  for (const k of releases.keys()) if (k.startsWith(front)) releases.delete(k);
}

/* --- Der zweite Faktor ---------------------------------------------------
   WER WILL, SICHERT SEINEN ZUGANG MIT EINEM CODE AUS EINER APP AUF SEINEM
   TELEFON. Die Rechnung steht in twofactor.js; hier stehen die Zeilen und
   die Regeln darum herum.

   FREIWILLIG, JE ZUGANG, UND JEDER SCHALTET IHN FUER SICH SELBST EIN -- nicht
   aus Hoeflichkeit, sondern aus Bauart: EINSCHALTEN kann nur, wer das
   Geheimnis auf sein Telefon bekommt; ein Admin, der es fuer einen anderen
   taete, sperrte ihn aus. AUSSCHALTEN darf nur der Betroffene, sonst waere
   der zweite Faktor an der Rollenleiter vorbei abschaltbar. Der einzige Weg
   daneben ist usertool.js auf dem Wirt.

   DIE RECHTEFRAGE STEHT HIER AUSDRUECKLICH NICHT: welche Nummer
   hereingereicht wird, entscheidet server.js an der Route. */
const qTwoFactor = db.prepare(
  'SELECT user_id, secret, confirmed_at, last_counter FROM two_factor WHERE user_id = ?');
const getTwoFactor = (userId) => qTwoFactor.get(Number(userId) || 0) || null;

/* DIE EINE FRAGE, AN DER ALLES HAENGT: verlangt dieser Zugang einen zweiten
   Faktor? Sie sieht auf confirmed_at und nicht auf das Vorhandensein der
   Zeile -- ein angefangenes, nie bestaetigtes Einschalten darf niemanden
   aussperren. Genau daran kippte die Sache sonst: wer den Knopf drueckt, den
   Bildschirm schliesst und sich neu anmeldet, stuende vor einer Frage, deren
   Antwort auf keinem Telefon steht. */
const twoFactorOn = (userId) => {
  const z = getTwoFactor(userId);
  return Boolean(z && z.confirmed_at);
};

const qCodesLeft = db.prepare(
  'SELECT COUNT(*) n FROM two_factor_codes WHERE user_id = ? AND used_at IS NULL');
const qCodesTotal = db.prepare('SELECT COUNT(*) n FROM two_factor_codes WHERE user_id = ?');

/* WAS DIE KARTE SIEHT -- UND DAS GEHEIMNIS IST NIE DARIN. Dieselbe Linie wie
   beim Mailpasswort: die Karte sagt "an" oder "aus", nie den Wert, nie die
   Laenge, nie den Anfang. Was sie zusaetzlich sagt, ist die ZAHL der uebrigen
   Wiederherstellungscodes -- "noch 6 von 8". Sie verraet nichts und ist das
   Einzige, was rechtzeitig warnt, bevor der letzte verbraucht ist. */
function twoFactorState(userId) {
  const id = Number(userId) || 0;
  const z = getTwoFactor(id);
  if (!z || !z.confirmed_at) return { an: false, seit: null, codesOpen: 0, codesTotal: 0 };
  return {
    an: true, seit: z.confirmed_at,
    codesOpen: qCodesLeft.get(id).n, codesTotal: qCodesTotal.get(id).n
  };
}

/* DIE EINE ABSAGE. Falsch, abgelaufen, aus dem uebernaechsten Fenster, schon
   verbraucht, ein erfundener Wiederherstellungscode -- alles dasselbe Wort.
   Dieselbe Ueberlegung wie beim Token: das Heilmittel ist in jedem
   dieser Faelle dasselbe, naemlich einen frischen Code vom Telefon ablesen.
   "Der Code ist abgelaufen" waere ausserdem eine Auskunft an den, der raet --
   er wuesste, dass er die richtige Ziffernfolge hat und nur zu spaet war. */
const TWO_FACTOR_DENIAL = 'login.codeWrong';

/* SCHRITT EINS: das Geheimnis entsteht und geht EINMAL ueber das Netz --
   danach nie wieder, auch nicht an den Eigentuemer.

   NOCH IST NICHTS EINGESCHALTET: confirmed_at bleibt leer, bis ein Code aus
   dem Telefon belegt, dass die App dasselbe rechnet.

   EIN ZWEITER AUFRUF ERSETZT DAS ANGEFANGENE GEHEIMNIS. AN EINEM BESTAETIGTEN
   FAKTOR WIRD ABGEWIESEN: erst ausschalten -- sonst waere dieser Knopf der
   Weg, einen laufenden zweiten Faktor aus einer uebernommenen Sitzung heraus
   gegen einen eigenen zu tauschen. */
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
    // Der Feldname bleibt deutsch, bis app.js in Bauabschnitt 4 mitzieht.
    secret: secret, groups: zf.groupsOfFour(secret),
    row: zf.otpauthLine(instanceName, username, secret),
    ziffern: zf.DIGITS, sekunden: zf.STEP_SECONDS
  };
}

/* Legt RECOVERY_COUNT frische Codes an und liefert die KLARTEXTE genau einmal
   zurueck -- danach stehen sie nirgends mehr, auch nicht in der Datenbank.
   EINE TRANSAKTION: entweder sind die alten fort UND die neuen da, oder es hat
   sich nichts bewegt. Ein halber Satz waere schlimmer als der alte. */
const insertCode = db.prepare(
  'INSERT INTO two_factor_codes (hash, user_id) VALUES (?, ?)');
function createRecoveryCodes(userId) {
  const id = Number(userId) || 0;
  const plains = zf.newRecoveryCodes();
  db.transaction(() => {
    db.prepare('DELETE FROM two_factor_codes WHERE user_id = ?').run(id);
    // tokenHash() WIRD WIEDERVERWENDET und nicht ein zweites Mal geschrieben:
    // zwei Ausfertigungen derselben Rechnung liefen beim naechsten Griff
    // auseinander. Dieselbe Ueberlegung wie bei der Selbstanmeldung.
    for (const k of plains) insertCode.run(tokenHash(k), id);
  })();
  return plains.map(zf.recoveryDisplay);
}

/* SCHRITT ZWEI: ein gueltiger Code aus dem Telefon schaltet ein. Erst hier
   entstehen die Wiederherstellungscodes -- vorher waeren sie ein Zettel fuer
   einen Faktor, den es womoeglich nie gibt.
   DER BESTAETIGENDE CODE ZAEHLT ALS VERBRAUCHT. Ohne das truege er unmittelbar
   danach ein zweites Mal, naemlich an der ersten Anmeldung, und "ein Code gilt
   genau einmal" waere an seiner ersten Anwendung falsch. */
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
   ART ('app' oder 'wieder') oder null.

   ZWEI FORMEN, EIN FELD: sechs Ziffern sind ein Code aus der App, zehn
   Zeichen ein Wiederherstellungscode. Die Form entscheidet -- ein Umschalter
   daneben waere eine Frage, die sich aus der Eingabe schon beantwortet.

   "GENAU EINMAL" STEHT IN DER BEDINGUNG DES UPDATE UND NICHT IN EINER
   PRUEFUNG DAVOR: zwischen Lesen und Schreiben laege sonst Platz fuer einen
   zweiten Aufruf mit demselben Code.

   DER ZAEHLER MUSS ECHT GROESSER SEIN als der zuletzt verbrauchte -- damit ist
   nach einer Anmeldung auch das Fenster DAVOR tot. */
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
    /* DIE EINZIGE ZEILE IM PROTOKOLL, DIE SAGT, DASS EIN TELEFON WEG IST. Sie
       steht HIER und nicht an der Route: es gibt drei Rufer (Anmeldung,
       Tokenweg, zweite Bestaetigung), und drei Ausfertigungen derselben Zeile
       liefen auseinander. wer und ziel sind derselbe Mensch -- er handelt an
       sich selbst, wie beim Einloesen eines Links. */
    log('twofactor.reset', { actor: id, target: id });
    return 'wieder';
  }
  return null;
}

/* Frische Wiederherstellungscodes fuer den, der seine verbraucht hat. Hinter
   Passwort UND gueltigem Code -- die Route stellt beides sicher.
   DER FALL, DEN NIEMAND PLANT, IST DER LETZTE VERBRAUCHTE CODE. Ohne diesen Weg
   bliebe dafuer nur usertool.js auf dem Wirt; mit ihm sieht der Betroffene an
   der Karte, dass es eng wird ("noch 1 von 8"), und holt sich neue. */
function refreshRecoveryCodes(userId) {
  const id = Number(userId) || 0;
  if (!twoFactorOn(id)) throw new Message('server.twoFactorOff');
  return createRecoveryCodes(id);
}

/* Ausschalten. ALLEIN DER BETROFFENE -- oder usertool.js auf dem Wirt, und das
   ist am leeren `actor` zu erkennen.
   BEIDE TABELLEN IN EINER TRANSAKTION: ein Faktor ohne Codes oder Codes ohne
   Faktor waeren beide ein halber Zustand.
   LIEFERT ja/nein: war gar keiner an, ist nichts geschehen, und der Aufrufer
   soll das sagen koennen. */
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
   WIE WIRD DIE ANMELDUNG ZWEISTUFIG, OHNE EINEN ZWEITEN ZUSTAND ZU ERZEUGEN?
   Eine halbe Sitzung waere eine zweite Wahrheit ueber "angemeldet" -- genau
   das, was Abschnitt 1 des Konzeptpapiers ausschliesst. sessions bleibt die
   EINE Antwort, und vor dem zweiten Schritt entsteht dort keine Zeile.

   GENOMMEN IST DIE BAUFORM DER FREIGABE: ein kurzlebiger Wert im
   Arbeitsspeicher, neben freigaben und attempts. Kein Schema, kein
   Migrationsblock, und er verfaellt von selbst. DIESELBE FRIST WIE DIE
   FREIGABE -- zwei Minuten reichen, um einen Code vom Telefon abzulesen.

   ER TRAEGT DIE BENUTZERNUMMER UND KOMMT NUR VON HIER. Der zweite Schritt
   liest sie NIE aus dem Rumpf -- sonst waere der Ausweis eine Eintrittskarte
   fuer einen beliebigen Zugang, und das richtige Passwort eines Zugangs
   oeffnete jeden anderen. */
const LOGIN_TICKET_MS = RELEASE_MS;
const tickets = new Map(); // schluessel -> { id, bis }

function createLoginTicket(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Ein Ausweis braucht einen Zugang.');
  // Beim Anlegen einmal durchsehen. Die Karte waechst sonst mit jeder
  // Anmeldung, die zwischen den beiden Schritten abgebrochen wird -- und wer
  // sie fuellen will, braucht dafuer jedes Mal das richtige Passwort.
  const now = Date.now();
  for (const [k, a] of tickets) if (a.until <= now) tickets.delete(k);
  const key = crypto.randomBytes(32).toString('hex');
  tickets.set(key, { id, until: now + LOGIN_TICKET_MS });
  return { ticket: key, sekunden: LOGIN_TICKET_MS / 1000 };
}

/* Prueft UND verbraucht in einem, wie useRelease. Zwei Funktionen --
   eine, die nachsieht, und eine, die verbraucht -- waeren zwei Stellen, und die
   Route, die die zweite vergisst, saehe von aussen genauso aus wie die richtige.
   VERBRAUCHT WIRD AUCH DER ABGELAUFENE: sonst bliebe er liegen und ein zweiter
   Versuch sagte dasselbe. */
function useLoginTicket(key) {
  const k = String(key || '');
  if (!k) return null;
  const a = tickets.get(k);
  if (a === undefined) return null;
  tickets.delete(k);
  return Date.now() <= a.until ? a.id : null;
}

// Liefert den Benutzer hinter dem Cookie oder null. Der JOIN ist die Aussage:
// eine Sitzung ohne Benutzer gilt nicht -- bliebe doch eine herrenlose Zeile
// liegen, waere sie ein Schluessel zu niemandem.
// Nebenwirkung mit Absicht: der Zugriff frischt last_seen auf.
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
   Secure, der Heimnetzname NIE. Ueber http verwuerfe der Browser einen
   Secure-Cookie stillschweigend, und niemand kaeme herein; ueber https ohne
   Secure gaebe der Name seine Zusage auf. Zwei Namen, zwei Wege, eine Regel je
   Weg -- und keine Bedingung, die man falsch stellen kann. */
const sessionCookie = (req, token) =>
  `${cookieName(req)}=${token}; HttpOnly; Path=/; SameSite=Lax` +
  `${viaProxy(req) ? '; Secure' : ''}; Max-Age=${SESSION_DAYS * 86400}`;
/* GELOESCHT WERDEN BEIDE NAMEN, nicht nur der des eigenen Wegs. Wer sich
   abmeldet, meint diesen Browser und nicht diese Verbindungsart -- ein
   stehengebliebener Cookie des anderen Wegs waere ein Zugang, den niemand mehr
   erwartet. Der Browser wendet an, was er anwenden kann: eine
   Secure-Loeschzeile ueber http laesst er liegen, und dort gibt es diesen
   Cookie ohnehin nicht. */
const clearCookie = () => [
  `${COOKIE_SICHER}=; HttpOnly; Path=/; SameSite=Lax; Secure; Max-Age=0`,
  `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
];

/* DER SITZUNGSTOKEN DIESER ANFRAGE -- der EINE Leseweg. Erzeugen und
   Verbrauchen einer Freigabe, die Sitzungsliste, "alle anderen beenden" und
   die Rechteschranke haengen alle daran; zwei Lesewege nebeneinander liefen
   auseinander, und der Unterschied faellt erst auf, wenn eine Freigabe nicht
   passt oder jemand sich selbst hinauswirft. */
const sessionToken = (req) => parseCookies(req)[cookieName(req)];

// req.benutzer ist ab hier fuer jeden geschuetzten Endpunkt gesetzt:
// { id, username, role, status }. Genau EINE Abfrage je Anfrage.
// Der Status wird hier durchgesetzt -- zweite von zwei Stellen neben der
// Anmelderoute; ohne diese bliebe ein gerade gesperrter Zugang bis zum Ablauf
// seines Cookies drin. 401 und nicht 403: der Zugang gilt nicht mehr.
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
  // Die Fehlerklasse; Rufer sind server.js (uebersetzt) und diese Datei.
  Message, setTranslator,
  COOKIE_NAME, COOKIE_SICHER, cookieName, sessionToken, viaProxy,
  BEHIND_PROXY, PASSWORD_MIN, SESSION_DAYS, fromEnv,
  PUBLIC_ADDRESS, checkPublicAddress, parseCookies, checkLogin, createSession, destroySession,
  sessionUser, pruneSessions, sessionCookie, clearCookie, requireAuth,
  clientIp, checkThrottle, noteFailure, noteSuccess,
  // Meine Sitzungen und die Token; Rufer ist server.js.
  sessionIdOf, sessionsOf, endSession, endOtherSessions,
  TOKEN_DAYS, TOKEN_TRACE_DAYS, TOKEN_PURPOSES, TOKEN_DEADLINE_MINUTES, tokenHash,
  cleanupTokens, createToken, checkToken, redeemToken, startTokenDeadline,
  // Die Selbstanmeldung; Rufer ist server.js.
  REQUEST_HOURS, REQUEST_CAP, REQUEST_NAME_MAX, REQUEST_MAIL_MAX,
  countRequests, cleanupRequests,
  createRequest, confirmRequest, listRequests, getRequest, removeRequest,
  // Das Sicherheitsprotokoll; Rufer sind server.js und usertool.js.
  EVENTS, DETAILS, LOG_DAYS, LOG_LIMIT, LOG_GROUPS, FROM_HOST,
  log, cleanupLog, readLog,
  // Die zweite Bestaetigung.
  CONFIRM_PURPOSES, RELEASE_MS, createRelease, useRelease, dropRelease,
  // Der zweite Faktor; Rufer sind server.js und usertool.js.
  TWO_FACTOR_DENIAL, LOGIN_TICKET_MS,
  twoFactorOn, twoFactorState, startTwoFactor, turnTwoFactorOn,
  checkTwoFactor, refreshRecoveryCodes, turnTwoFactorOff,
  createLoginTicket, useLoginTicket,
  getUser, getUserByName, userExists, createFirstUser, changeUser,
  hashPassword, checkPassword,
  // Zugangsverwaltung; Rufer sind server.js und usertool.js.
  ROLES, STATES, tombstoneName, TOMBSTONE_PATTERN,
  getUser2, listUsers, ownerCount,
  createUser, setNewPassword, setRole, setStatus, countInventory, removeUser
};
