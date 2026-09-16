const crypto = require('crypto');
const nodemailer = require('nodemailer');

/* Der Uebersetzer. Die vier Briefe und die Absagen dieser Datei stehen in
   public/languages/<code>.json. t() lebt in server.js und wird beim Start
   hereingereicht -- der Weg zurueck waere ein Ring. Bis dahin steht hier die
   Klammerform, damit ein vergessener Griff auffaellt. */
let t = (locale, key) => `\u27e6${key}\u27e7`;
function setTranslator(fn) { t = fn; }

/* Ein Fehler mit Schluessel, ohne die Klasse `Message` aus auth.js -- die
   requiret diese Datei. Der Fehler-Handler in server.js braucht nur die Form:
   `key`, `values`, `status`. */
const message = (key, values = {}) =>
  Object.assign(new Error(key), { key, values, status: 400 });

/* Der Mailversand -- die einzige Verbindung nach draussen, und nur
   ausgehend. Nichts in dieser Datei wirft: send() liefert ein Ergebnis.
   Verschickt wird immer ueber den SMTP-Zugang eines Anbieters.

   Die Anbietervorlagen. Eine Liste im Quelltext, kein Freitext: der Server
   speichert einen Schluessel. 'eigen' steht mit darin und ist doch keine
   Vorlage -- dort traegt der Eigentuemer Server, Port und Verschluesselung
   selbst ein. Port und Verschluesselung gehoeren zusammen: 465 ist implizites
   TLS, 587 beginnt im Klartext und schaltet mit STARTTLS um. */
const PROVIDERS = [
  { key: 'gmx',    name: 'GMX',           server: 'mail.gmx.net',       port: 587, secure: false },
  { key: 'web',    name: 'Web.de',        server: 'smtp.web.de',        port: 587, secure: false },
  { key: 'gmail',  name: 'Gmail',         server: 'smtp.gmail.com',     port: 465, secure: true },
  { key: 'strato', name: 'Strato',        server: 'smtp.strato.de',     port: 465, secure: true },
  { key: 'ionos',  name: 'IONOS',         server: 'smtp.ionos.de',      port: 587, secure: false },
  /* „Eigener Server" ist eine Beschreibung und keine Marke, also traegt der
     Eintrag einen Schluessel daneben. Die fuenf Marken haben keinen.
     Uebersetzt wird in server.js (providerList). */
  { key: 'eigen',  name: 'Eigener Server', nameKey: 'mail.ownServer',
    server: '',                  port: 587, secure: false }
];

/* Drei Hinweise am Bildschirm, je Anbieter. Sie stehen hier, weil der
   Server die Anbieterliste kennt. Der vierte gilt fuer alle. */
const HINTS = {
  gmail: 'mail.hintGmail',
  gmx: 'mail.hintGmx',
  web: 'mail.hintWebDe'
};
const HINT_ALWAYS = 'mail.hintAlways';

/* Die drei Fristen. nodemailers Vorgaben reichen bis zu zehn Minuten; die
   Zahlen hier stehen fest und lassen sich nur ueber den Pruefschalter aus
   keys.js kuerzen, und zwar alle drei mit demselben Teiler.
   Die aeussere Schranke ist die tragende: socketTimeout laeuft nur bei
   Untaetigkeit ab. Die drei darunter nennen den Abschnitt, an dem es
   klemmte. */
const keys = require('./keys');
const SEND_SHIPPED = 20 * 1000;
const CONNECT_SHIPPED = 7 * 1000;
const GREETING_SHIPPED = 7 * 1000;
const SEND_MS = keys.mailDeadline(SEND_SHIPPED);
const CONNECT_MS = keys.mailDeadline(CONNECT_SHIPPED);
const GREETING_MS = keys.mailDeadline(GREETING_SHIPPED);

/* Der Mailzugang liegt unter einem Schluessel in settings und gehoert dem
   Eigentuemer, nicht dem Admin: der SMTP-Server sieht jede Mail. In settings
   und nicht in der .env, damit das Mailpasswort in der verschluesselten
   Datenbank liegt; die Exportdatei traegt settings nicht mit. */
const SETTING_KEY = 'mailzugang';

const EMPTY = { provider: '', server: '', port: 0, secure: false, user: '', password: '', sender: '' };

// Wie eine Adresse aussehen darf. Bewusst grob: abgewiesen wird nur, was
// gar keine Adresse sein kann -- kein @, Leerzeichen, zwei @, nichts davor
// oder dahinter.
const ADDRESS_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const isAddress = (a) => ADDRESS_PATTERN.test(String(a || '').trim());

const providerOf = (key) => PROVIDERS.find(a => a.key === key) || null;

/* Was der Dialog je Anbieter braucht: der Hinweis und die drei festen
   Werte, die mit der Auswahl gelten -- beides muss vorliegen, bevor
   gespeichert wird. Kein Geheimnis dabei; das Passwort kommt hier so wenig
   heraus wie in state(). */
const forChoice = () => PROVIDERS.map(a => ({
  key: a.key, name: a.name, nameKey: a.nameKey || '',
  server: a.server, port: a.port, secure: a.secure,
  hint: HINTS[a.key] || ''
}));

/* Loest den gespeicherten Zugang zu dem auf, was der Versand braucht. Die
   Vorlage gewinnt ueber das Gespeicherte, ausser bei 'eigen': wechselt ein
   Anbieter den Port, kommt der neue aus dem Quelltext. */
function resolve(raw) {
  const z = { ...EMPTY, ...(raw && typeof raw === 'object' ? raw : {}) };
  const v = providerOf(z.provider);
  if (!v) return { ...EMPTY };
  if (v.key === 'eigen') {
    return { ...z, server: String(z.server || '').trim(),
             port: Number(z.port) || 0, secure: z.secure === true };
  }
  return { ...z, server: v.server, port: v.port, secure: v.secure };
}

/* Der Zustand fuer den Bildschirm. Das Passwort kommt nie heraus -- nur die
   Feststellung, dass eines gesetzt ist, und nicht seine Laenge. */
function state(raw) {
  const z = resolve(raw);
  const v = providerOf(z.provider);
  return {
    provider: z.provider, providerName: v ? v.name : '',
    providerNameKey: (v && v.nameKey) || '',
    server: z.server, port: z.port, secure: z.secure,
    user: z.user, sender: z.sender,
    passwordSet: Boolean(z.password),
    hint: HINTS[z.provider] || '', hintAlways: HINT_ALWAYS
  };
}

/* Ist der Zugang vollstaendig? Erst der Gegenstand, dann die Eigenschaft:
   ein leerer Zugang ist keiner. 'eigen' braucht Server und Port zusaetzlich. */
function configured(raw) {
  const z = resolve(raw);
  if (!providerOf(z.provider)) return false;
  if (!z.server || !z.port) return false;
  return Boolean(z.user && z.password && isAddress(z.sender));
}

/* Prueft, was von aussen hereinkommt, und liefert den Wert zum Speichern.
   Wirft mit Schluessel; der Aufrufer gibt die Message weiter.
   Ein leeres Passwort heisst „unveraendert", ein leerer Zugang schaltet den
   Versand ab. */
function checkInput(input, before) {
  const e = input && typeof input === 'object' ? input : {};
  const old = resolve(before);
  const provider = String(e.provider || '').trim();
  if (!provider) return { ...EMPTY };
  const v = providerOf(provider);
  if (!v) throw message('mail.providerUnknown');

  const user = String(e.user ?? '').trim();
  const sender = String(e.sender ?? '').trim();
  // Ein neues Passwort wird genommen, wie es ist -- nicht beschnitten: ein
  // Leerzeichen am Ende kann dazugehoeren.
  const password = typeof e.password === 'string' && e.password !== ''
    ? e.password : String(old.password || '');

  if (!user) throw message('mail.userMissing');
  if (!password) throw message('mail.passwordMissing');
  if (!isAddress(sender)) throw message('mail.senderInvalid');

  const out = { provider, user, password, sender, server: '', port: 0, secure: false };
  if (v.key !== 'eigen') return out;

  const server = String(e.server || '').trim();
  const port = Number(e.port);
  if (!server) throw message('mail.serverMissing');
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw message('mail.portRange', { min: 1, max: 65535 });
  return { ...out, server, port, secure: e.secure === true };
}

/* Eine Marke ueber den Zugang: damit laesst sich belegen, dass sich seit dem
   Test nichts geaendert hat. Gehasht wird der ganze Zugang in einem Zug, das
   Passwort steht nicht im Klartext darin. */
function mark(raw) {
  const z = resolve(raw);
  return crypto.createHash('sha256')
    .update(JSON.stringify([z.provider, z.server, z.port, z.secure, z.user, z.password, z.sender]))
    .digest('hex').slice(0, 16);
}

/* Der Versand. Liefert ein Ergebnis und wirft nie -- der Token muss auf
   jeden Fall entstehen. Reiner Text, kein HTML, keine Bilder, keine
   Anhaenge.
   Der Rumpf geht als quoted-printable hinaus; ein langer Link bekommt darin
   einen weichen Umbruch, den jedes Mailprogramm wieder zusammensetzt. */
function buildTransport(z) {
  return nodemailer.createTransport({
    host: z.server, port: z.port, secure: z.secure === true,
    auth: { user: z.user, pass: z.password },
    connectionTimeout: CONNECT_MS, greetingTimeout: GREETING_MS, socketTimeout: SEND_MS,
    // Keine offen gehaltene Verbindung nach draussen.
    pool: false
  });
}

async function send(locale, raw, to, subject, text) {
  const z = resolve(raw);
  /* Der Grund ist ein Schluessel, wo er aus dieser Datei kommt, und ein Satz,
     wo ihn der Anbieter geschrieben hat (shortReason). */
  if (!configured(z)) return { ok: false, reason: t(locale, 'mail.noAccount') };
  if (!isAddress(to)) return { ok: false, reason: t(locale, 'mail.recipientInvalid') };
  let transport = null;
  try {
    transport = buildTransport(z);
    /* Der Wettlauf ueber den ganzen Versand. Er steht hier und nicht beim
       Aufrufer: eine Frist je Route waere an der naechsten vergessen. */
    let clock;
    const deadline = new Promise((_, error) => {
      clock = setTimeout(() => error(new Error(t(locale, 'mail.timeout'))), SEND_MS);
    });
    try {
      await Promise.race([
        transport.sendMail({ from: z.sender, to: to, subject: subject, text }),
        deadline
      ]);
    } finally { clearTimeout(clock); }
    return { ok: true, reason: '' };
  } catch (e) {
    /* Die Meldung des Anbieters wird beschnitten: manche Server geben die
       Anmeldedaten in der Absage zurueck. Der Anfang traegt den Fehlercode. */
    return { ok: false, reason: shortReason(locale, e) };
  } finally {
    // Auch im Fehlerfall: keine haengende Verbindung nach draussen.
    try { if (transport) transport.close(); } catch {}
  }
}

function shortReason(locale, e) {
  const raw = String((e && e.message) || t(locale, 'mail.unknownError')).replace(/\s+/g, ' ').trim();
  return raw.length > 120 ? raw.slice(0, 117) + '…' : raw;
}

/* Die vier Briefe. Die Texte stehen in der Sprachdatei; hier steht nur der
   Griff -- welcher Brief zu welchem Anlass gehoert. Ein Schluessel je Brief
   und nicht je Zeile: der Uebersetzer sieht ihn am Stueck.
   Jeder Brief liefert Betreff und Text zusammen. Der Link darin steht im
   Fragment (#/invite/…) und geht nie an den Server. */
const mail = (locale, kind, values) => ({
  subject: t(locale, `mail.${kind}.subject`, values),
  text: t(locale, `mail.${kind}.body`, values)
});
const mailInvite = (locale, values) => mail(locale, 'invite', values);
const mailReset = (locale, values) => mail(locale, 'reset', values);
const mailConfirm = (locale, values) => mail(locale, 'confirm', values);
const mailTest = (locale, values) => mail(locale, 'test', values);

module.exports = {
  PROVIDERS, HINTS, HINT_ALWAYS, SETTING_KEY,
  SEND_MS, CONNECT_MS, GREETING_MS,
  SEND_SHIPPED, CONNECT_SHIPPED, GREETING_SHIPPED,
  isAddress, providerOf, forChoice, resolve, state, configured, checkInput, mark,
  send, setTranslator,
  mailInvite, mailReset, mailConfirm, mailTest
};
