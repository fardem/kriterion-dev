const crypto = require('crypto');
const nodemailer = require('nodemailer');

/* ================= Der Uebersetzer =================
   TEXT IST DATEN UND NICHT PROGRAMM -- 0.24.0, Bauabschnitt 2. Die vier Briefe
   und die Absagen dieser Datei stehen seither in public/languages/<code>.json.
   ER WIRD GEREICHT UND NICHT GEHOLT: t() lebt in server.js, und server.js
   requiret diese Datei -- der Weg zurueck waere ein Ring. Beim Start reicht
   server.js den Helfer herein; bis dahin steht hier die Klammerform, damit ein
   vergessener Griff auffaellt statt still zu bleiben.
   DASSELBE t() UND KEINE ZWEITE AUSFERTIGUNG: eine eigene Ladung hier waere
   eine zweite Wahrheit ueber dieselbe Datei (Stolperstein 47). */
let t = (locale, key) => `\u27e6${key}\u27e7`;
function setTranslator(fn) { t = fn; }

/* EIN FEHLER MIT SCHLUESSEL, OHNE DIE KLASSE `Message` -- 0.24.0. Die Klasse
   wohnt in auth.js, und auth.js requiret DIESE Datei; der Weg zurueck waere
   ein Ring. Was der Fehler-Handler in server.js braucht, ist nicht die Klasse,
   sondern die FORM: ein `key`, seine `values` und ein `status`. */
const message = (key, values = {}) =>
  Object.assign(new Error(key), { key, values, status: 400 });

/* ================= Der Mailversand =================

   DIE EINZIGE VERBINDUNG NACH DRAUSSEN. Die Instanz antwortet sonst nur auf
   Anfragen; hier baut sie von sich aus eine Verbindung zu einem fremden
   Server auf. Jede Entscheidung in dieser Datei steht unter dieser
   Ueberschrift.

   E-MAIL IST EINE BEQUEMLICHKEIT, KEINE VORAUSSETZUNG -- eine Instanz ohne
   Mailzugang laeuft vollstaendig. Jeder Link, der verschickt wird, ist im
   Verwaltungsbereich zusaetzlich zum Kopieren sichtbar; schlaegt der Versand
   fehl, bricht nichts ab. Deshalb wirft in dieser Datei NICHTS nach aussen:
   send() liefert ein Ergebnis, nie eine Ausnahme.

   NUR AUSGEHEND: kein Empfang, kein offener Port, kein Abholen.

   IMMER UEBER DEN SMTP-ZUGANG EINES ANBIETERS, nie unmittelbar vom
   Hausanschluss -- dort fehlen rDNS und SPF/DKIM, und die Mail landet im
   besten Fall im Spam. */

/* ---- Die Anbietervorlagen ----
   Eine gepflegte Liste im Quelltext, kein Freitext: der Server speichert
   einen Schluessel, also muss er die Liste kennen.

   'eigen' STEHT MIT IN DER LISTE UND IST DOCH KEINE VORLAGE -- dort traegt
   der Eigentuemer Server, Port und Verschluesselung selbst ein. Es als Fehlen
   eines Eintrags zu bauen haette der Frage "welcher Anbieter" zwei
   Antwortarten gegeben.

   PORT UND VERSCHLUESSELUNG GEHOEREN ZUSAMMEN: 465 ist von Anfang an
   verschluesselt (implizites TLS), 587 beginnt im Klartext und schaltet mit
   STARTTLS um. Ein Port ohne die passende Angabe ergibt eine Verbindung, die
   entweder haengt oder im Klartext bleibt. */
const PROVIDERS = [
  { key: 'gmx',    name: 'GMX',           server: 'mail.gmx.net',       port: 587, sicher: false },
  { key: 'web',    name: 'Web.de',        server: 'smtp.web.de',        port: 587, sicher: false },
  { key: 'gmail',  name: 'Gmail',         server: 'smtp.gmail.com',     port: 465, sicher: true },
  { key: 'strato', name: 'Strato',        server: 'smtp.strato.de',     port: 465, sicher: true },
  { key: 'ionos',  name: 'IONOS',         server: 'smtp.ionos.de',      port: 587, sicher: false },
  { key: 'eigen',  name: 'Eigener Server', server: '',                  port: 587, sicher: false }
];

/* DREI HINWEISE GEHOEREN AN DEN BILDSCHIRM, und sie stehen hier statt in
   app.js: sie haengen am Anbieter, und der Server kennt die Anbieterliste.
   Zwei Ausfertigungen derselben Hinweise liefen auseinander, sobald ein
   Anbieter dazukommt. Der dritte gilt fuer alle und steht deshalb ohne
   Schluessel darunter. */
const HINTS = {
  gmail: 'mail.hintGmail',
  gmx: 'mail.hintGmx',
  web: 'mail.hintWebDe'
};
const HINT_ALWAYS = 'mail.hintAlways';

/* ---- Die Frist ----
   SMTP KANN MINUTENLANG NICHTS SAGEN, und nodemailers Vorgaben sind fuer
   einen Menschen vor dem Bildschirm unbrauchbar (bis zu zehn Minuten).

   DIE ZAHL IST HERGELEITET: ein vollstaendiges SMTP-Gespraech ueber TLS sind
   rund acht Umlaeufe; bei schlechten 300 ms sind das unter drei Sekunden.
   SEND_MS gibt dem den achtfachen Abstand.

   DIE AEUSSERE SCHRANKE IST DIE TRAGENDE, und der Unterschied ist
   NACHGESTELLT: die drei Fristen darunter sind Fristen je ABSCHNITT und eine
   auf UNTAETIGKEIT. socketTimeout laeuft ab, wenn der Socket still liegt --
   ein Empfaenger, der alle drei Sekunden EIN Byte schickt, haelt ihn ewig am
   Leben (gemessen: nach 45 Sekunden haengt der Versand noch). Nur ein
   Wettlauf ueber dem GANZEN Versand ist eine Frist auf die Gesamtdauer.
   DIE DREI DARUNTER BLEIBEN TROTZDEM STEHEN: sie sind der schnellere Weg und
   nennen den Abschnitt, an dem es klemmte. */
const SEND_MS = 20 * 1000;
const CONNECT_MS = 7 * 1000;
const GREETING_MS = 7 * 1000;

/* ---- Was in settings liegt ----
   DER MAILZUGANG GEHOERT DEM EIGENTUEMER, NICHT DEM ADMIN, und das ist die
   tragende Entscheidung dieser Datei: der SMTP-Server sieht JEDE Mail, und
   jede traegt einen Link, der ein Passwort setzt. Duerfte ein ADMIN den
   Server eintragen, liefe die Ruecksetzmail des Eigentuemers ueber einen
   Server seiner Wahl.

   ER LIEGT IN settings UND NICHT IN DER .env: die .env traegt, was VOR dem
   Oeffnen der Datenbank lesbar sein muss, und der Mailzugang muss das nicht.
   Damit liegt das Mailpasswort in der VERSCHLUESSELTEN Datenbank, und die
   Exportdatei traegt settings nicht mit.

   DER SCHLUESSEL IST EINER UND NICHT SECHS: sechs waeren sechs Stellen, an
   denen ein halb geschriebener Zugang entstehen kann. */
const SETTING_KEY = 'mailzugang';

const EMPTY = { provider: '', server: '', port: 0, sicher: false, benutzer: '', password: '', sender: '' };

// Wie eine Adresse aussehen darf. BEWUSST GROB: eine Adresse laesst sich am
// Muster ohnehin nicht auf Gueltigkeit pruefen -- den Beweis liefert erst die
// Mail, die ankommt. Was hier abgewiesen wird, ist das, was gar keine Adresse
// sein kann: kein @, Leerzeichen, zwei @, nichts davor oder dahinter.
const ADDRESS_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const isAddress = (a) => ADDRESS_PATTERN.test(String(a || '').trim());

const providerOf = (key) => PROVIDERS.find(a => a.key === key) || null;

/* WAS DIE OBERFLAECHE JE ANBIETER BRAUCHT -- seit 0.17.3, und der Grund ist der
   Dialog. Dort wechselt mit der Auswahl ZWEIERLEI: der Hinweis, der zu genau
   diesem Anbieter gehoert, und die drei festen Werte, die dann gelten. Beides
   muss vorliegen, BEVOR gespeichert wird; ein Ruf an den Server je Auswahl
   waere eine Anfrage fuer eine Angabe, die im Quelltext steht.
   BEIDES KOMMT WEITERHIN VON HIER UND NICHT AUS app.js: zwei Ausfertigungen
   liefen auseinander, sobald ein Anbieter dazukommt oder einer den Port
   wechselt (Stolperstein 102). Die Liste selbst ist unveraendert -- fuenf
   Vorlagen und "Eigener Server".
   KEIN GEHEIMNIS DABEI. Server, Port und Verschluesselung stehen in jeder
   Anleitung des Anbieters; das PASSWORT kommt hier so wenig heraus wie in
   state(). */
const forChoice = () => PROVIDERS.map(a => ({
  key: a.key, name: a.name,
  server: a.server, port: a.port, sicher: a.sicher,
  hint: HINTS[a.key] || ''
}));

/* Loest den gespeicherten Zugang zu dem auf, was der Versand wirklich braucht.
   DIE VORLAGE GEWINNT UEBER DAS GESPEICHERTE, ausser bei 'eigen': wer GMX
   gewaehlt hat und bei dem der Anbieter morgen den Port wechselt, bekommt den
   neuen Port aus dem Quelltext. Stuenden die Werte auch bei einer Vorlage in
   der Datenbank, waeren sie eine eingefrorene Kopie und liefen auseinander. */
function resolve(raw) {
  const z = { ...EMPTY, ...(raw && typeof raw === 'object' ? raw : {}) };
  const v = providerOf(z.provider);
  if (!v) return { ...EMPTY };
  if (v.key === 'eigen') {
    return { ...z, server: String(z.server || '').trim(),
             port: Number(z.port) || 0, sicher: z.sicher === true };
  }
  return { ...z, server: v.server, port: v.port, sicher: v.sicher };
}

/* Der Zustand fuer den Bildschirm. DAS PASSWORT KOMMT HIER NIE HERAUS -- nur
   die Feststellung, DASS eines gesetzt ist. Nie die Laenge, nie der Anfang,
   nie Sternchen mit der richtigen Zahl: aus jedem davon liesse sich etwas
   ableiten, und keines davon hilft dem, der die Karte ansieht. */
function state(raw) {
  const z = resolve(raw);
  const v = providerOf(z.provider);
  return {
    provider: z.provider, providerName: v ? v.name : '',
    server: z.server, port: z.port, sicher: z.sicher,
    benutzer: z.benutzer, sender: z.sender,
    passwordSet: Boolean(z.password),
    hint: HINTS[z.provider] || '', hintAlways: HINT_ALWAYS
  };
}

/* Ist der Zugang vollstaendig? ERST DER GEGENSTAND, DANN DIE EIGENSCHAFT
   (Stolperstein 81): ein leerer Zugang ist nicht "in Ordnung", er ist keiner.
   'eigen' braucht Server und Port zusaetzlich -- bei einer Vorlage stehen sie
   im Quelltext und koennen gar nicht fehlen. */
function configured(raw) {
  const z = resolve(raw);
  if (!providerOf(z.provider)) return false;
  if (!z.server || !z.port) return false;
  return Boolean(z.benutzer && z.password && isAddress(z.sender));
}

/* Prueft, was von aussen hereinkommt, und liefert den Wert zum Speichern.
   WIRFT MIT KLARTEXT -- der Aufrufer gibt die Message unveraendert weiter.
   DAS PASSWORT DARF LEER BLEIBEN UND HEISST DANN "unveraendert": sonst muesste
   der Eigentuemer es bei jeder Aenderung am Absender neu tippen, und ein
   Formular, das ein Geheimnis zum Aendern einer Nebensache verlangt, wird
   irgendwann mit einem falschen Wert gespeichert. Ein leerer Zugang wird
   ausdruecklich zugelassen: so wird der Versand wieder abgeschaltet. */
function checkInput(ein, before) {
  const e = ein && typeof ein === 'object' ? ein : {};
  const old = resolve(before);
  const provider = String(e.provider || '').trim();
  if (!provider) return { ...EMPTY };
  const v = providerOf(provider);
  if (!v) throw message('mail.providerUnknown');

  const benutzer = String(e.benutzer ?? '').trim();
  const sender = String(e.sender ?? '').trim();
  // Ein neues Passwort wird genommen, wie es ist -- NICHT beschnitten. Ein
  // Leerzeichen am Ende kann Teil des Passworts sein, und ein stillschweigend
  // abgeschnittenes Zeichen ergaebe eine Absage, die niemand erklaeren kann.
  const password = typeof e.password === 'string' && e.password !== ''
    ? e.password : String(old.password || '');

  if (!benutzer) throw message('mail.userMissing');
  if (!password) throw message('mail.passwordMissing');
  if (!isAddress(sender)) throw message('mail.senderInvalid');

  const out = { provider, benutzer, password, sender, server: '', port: 0, sicher: false };
  if (v.key !== 'eigen') return out;

  const server = String(e.server || '').trim();
  const port = Number(e.port);
  if (!server) throw message('mail.serverMissing');
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw message('mail.portRange', { min: 1, max: 65535 });
  return { ...out, server, port, sicher: e.sicher === true };
}

/* Eine Marke ueber den Zugang, mit der sich "seit dem Test hat sich nichts
   geaendert" belegen laesst. SIE TRAEGT DAS PASSWORT NICHT IM KLARTEXT und
   auch nicht seine Laenge: gehasht wird der ganze Zugang in einem Zug.
   Sie steht hier und nicht in server.js, weil sie die Felder dieser Datei
   kennt -- eine zweite Aufzaehlung daneben liefe beim naechsten Feld
   auseinander. */
function mark(raw) {
  const z = resolve(raw);
  return crypto.createHash('sha256')
    .update(JSON.stringify([z.provider, z.server, z.port, z.sicher, z.benutzer, z.password, z.sender]))
    .digest('hex').slice(0, 16);
}

/* ---- Der Versand selbst ----
   LIEFERT EIN ERGEBNIS, WIRFT NIE: ein Aufrufer, der ein try/catch vergisst,
   koennte sonst den Tokenweg mitreissen -- und der Token ist die Sache, die
   auf jeden Fall entstehen muss.

   REINER TEXT, KEIN HTML, KEINE BILDER, KEINE ANHAENGE. Ein Zaehlpixel waere
   ausgerechnet in einer Mail, die ein Passwortsetzen ankuendigt, eine
   Rueckmeldung an einen Dritten.

   DER LINK STEHT IM ROHEN BRIEF UMBROCHEN, UND DAS IST RICHTIG SO: der Rumpf
   geht als quoted-printable hinaus, dessen Zeilen enden bei 76 Zeichen, und
   die Adresse bekommt deshalb einen WEICHEN Umbruch (`=` am Zeilenende). Jedes
   Mailprogramm setzt ihn beim Anzeigen wieder zusammen. Wer im Pruefstand am
   rohen Brief nach dem Schluessel sucht, findet ihn nicht -- dort wird
   dekodiert, wie ein Empfaenger es auch tut (Stolperstein 90). */
function buildTransport(z) {
  return nodemailer.createTransport({
    host: z.server, port: z.port, secure: z.sicher === true,
    auth: { user: z.benutzer, pass: z.password },
    connectionTimeout: CONNECT_MS, greetingTimeout: GREETING_MS, socketTimeout: SEND_MS,
    // Die Instanz schickt eine Handvoll Mails im Monat. Eine offen gehaltene
    // Verbindung waere eine Verbindung nach draussen, die ohne Anlass steht.
    pool: false
  });
}

async function send(locale, raw, to, subject, text) {
  const z = resolve(raw);
  /* DER GRUND IST SEIT 0.24.0 EIN SCHLUESSEL, WO ER AUS DIESER DATEI KOMMT --
     und ein SATZ, wo ihn der Anbieter geschrieben hat (shortReason). Beides
     steht am Bildschirm; nur das erste laesst sich uebersetzen. */
  if (!configured(z)) return { ok: false, reason: t(locale, 'mail.noAccount') };
  if (!isAddress(to)) return { ok: false, reason: t(locale, 'mail.recipientInvalid') };
  let transport = null;
  try {
    transport = buildTransport(z);
    /* DER WETTLAUF IST DIE ZUSAGE. Er steht hier und nicht beim Aufrufer:
       eine Frist, die jede Route selbst setzen muesste, waere an der Route
       vergessen, die als naechste dazukommt. */
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
    /* WAS AUS DER MELDUNG DES ANBIETERS UEBERNOMMEN WIRD, IST BESCHNITTEN --
       und der Grund ist nicht die Laenge: manche Server geben die
       Anmeldedaten in der Absage zurueck ("535 5.7.8 Username and Password
       not accepted for <benutzer>"). Der Anfang traegt den Fehlercode, und
       der ist das, was hilft. */
    return { ok: false, reason: shortReason(locale, e) };
  } finally {
    // Auch im Fehlerfall: eine haengende Verbindung nach draussen ist genau
    // das, was diese Instanz nicht offen halten soll (Stolperstein 134 in
    // seiner Form fuer Sockets).
    try { if (transport) transport.close(); } catch {}
  }
}

function shortReason(locale, e) {
  const raw = String((e && e.message) || t(locale, 'mail.unknownError')).replace(/\s+/g, ' ').trim();
  return raw.length > 120 ? raw.slice(0, 117) + '…' : raw;
}

/* ---- Die vier Briefe ----
   SIE STEHEN SEIT 0.24.0 IN DER SPRACHDATEI und nicht mehr hier: ein Brief ist
   Text, und Text ist Daten (Konzept, Abschnitt 0, Satz 1). Was hier bleibt,
   ist der Griff -- welcher Brief zu welchem Anlass gehoert und welche Werte er
   braucht.
   EIN SCHLUESSEL JE BRIEF, NICHT EINER JE ZEILE. Der Uebersetzer sieht den
   Brief am Stueck, so wie ihn der Empfaenger sieht; die Umbrueche stehen als
   \n in der Datei. `mail.einladung.z1` bis `z14` waeren vierzehn Schluessel,
   von denen keiner fuer sich einen Sinn ergibt.
   DER BETREFF ZIEHT AUS server.js MIT HIERHER (Konzept 4.6): der Text gehoert
   zur Sache, und der Betreff ist Teil des Briefes. Der Titel der Installation
   bleibt ein Platzhalter -- er ist Inhalt und wird nicht uebersetzt.
   DER LINK STEHT IM FRAGMENT (#/invite/…) UND GEHT DAMIT NIE AN DEN SERVER
   -- in der Mail genauso wie beim Kopieren. Das traegt hier zusaetzlich: ein
   Vorschaudienst, der Links im Postfach vorab abruft, holt nur die Seite und
   nie das Fragment. Die Frist ab dem ersten Oeffnen kann er deshalb nicht
   ausloesen.
   JEDER BRIEF LIEFERT BETREFF UND TEXT ZUSAMMEN: zwei Aufrufe fuer einen Brief
   liessen sich an der naechsten Stelle halb vergessen. */
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
  isAddress, providerOf, forChoice, resolve, state, configured, checkInput, mark,
  send, setTranslator,
  mailInvite, mailReset, mailConfirm, mailTest
};
