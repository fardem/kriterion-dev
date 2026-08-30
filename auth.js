const crypto = require('crypto');
const { db, ordneBestandZu } = require('./db');
// Nur wegen istAdresse: die Frage "sieht das ueberhaupt nach einer Adresse
// aus" wird an drei Stellen gestellt (Anlegen, eigener Zugang, Versand), und
// drei Muster nebeneinander liefen auseinander. Die Antwort steht deshalb dort,
// wo die Adresse gebraucht wird.
const mail = require('./mail');
/* Nur wegen der Rechnung: Base32, HMAC ueber den Zaehler, das Fenster. Alles,
   was eine Zeile hat, steht hier -- dieselbe Teilung wie bei mail.js. */
const zf = require('./zweifaktor');

/* EINE EINSTELLUNG, ZWEI WIRKUNGEN -- BIS 0.12.4 WAREN ES FUENF.

   Ein Kopf vom Aufrufer ist nie eine Feststellung, sondern eine Behauptung.
   X-Forwarded-For und X-Forwarded-Proto duerfen nur dort geglaubt werden, wo
   ausdruecklich eingestellt ist, dass ein Proxy davorsteht -- sonst setzt der
   Aufrufer den einen bei jedem Versuch neu und bekommt einen frischen Zaehler
   (die Anmeldebremse je Adresse greift dann nie) und den anderen, um sich als
   HTTPS auszugeben.

   HINTER_PROXY=1 (an):  die beiden Koepfe werden ueberhaupt angesehen, und ein
                         http:// in OEFFENTLICHE_ADRESSE meldet sich am Start.
   fehlt (aus, Vorgabe): kein Kopf wird angesehen -- allein
                         req.socket.remoteAddress, und jede Anfrage gilt als
                         Klartext. Richtig fuer "direkt im Heimnetz, Port 3100".

   WAS NICHT MEHR AN IHR HAENGT: Cookiename, Secure und HSTS. Die drei
   entscheidet seit 0.13.0 die EINZELNE ANFRAGE ueber X-Forwarded-Proto, und
   der Grund ist der Betrieb: die Instanz ist aus zwei Netzen zugleich
   erreichbar, und eine Einstellung je Prozess kann immer nur einen davon
   bedienen. Mit HINTER_PROXY=1 kam ueber http://<server-ip>:3100 niemand mehr
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
const HINTER_PROXY = /^(1|true|ja|an|yes|on)$/i.test(String(process.env.HINTER_PROXY || '').trim());

/* KAM DIESE ANFRAGE UEBER DEN PROXY? Die eine Frage, an der seit 0.13.0
   Cookiename, Secure und HSTS haengen -- je Anfrage und nicht je Prozess.
   DER LETZTE EINTRAG DER KETTE und nicht der erste, aus demselben Grund wie
   bei der Adresse: was davor steht, kann der Aufrufer selbst hineingeschrieben
   haben; was der naechste Proxy anhaengt, sieht er wirklich.
   NUR MIT HINTER_PROXY: ohne die Einstellung steht kein Proxy davor, und dann
   ist der Kopf nichts als eine Behauptung.
   OHNE req.socket UND OHNE req.protocol: diese Frage sieht ausschliesslich in
   die Kopfzeilen. Sie wird auch aus requireAuth heraus gestellt, und dort
   reicht der Pruefstand ein req herein, das nur `headers` traegt. */
function ueberProxy(req) {
  if (!HINTER_PROXY) return false;
  const kette = String((req && req.headers && req.headers['x-forwarded-proto']) || '')
    .split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  return kette.length > 0 && kette[kette.length - 1] === 'https';
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
const cookieName = (req) => ueberProxy(req) ? COOKIE_SICHER : COOKIE_NAME;

/* --- Die oeffentliche Adresse -------------------------------------------
   SIE STEHT HIER UND NICHT IN server.js, weil sie dieselbe Sorte Einstellung
   ist wie HINTER_PROXY darueber: Netzwerkvertrauen, nicht Vorliebe -- also
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
function pruefeOeffentlicheAdresse(roh) {
  const wert = String(roh || '').trim();
  if (!wert) return { adresse: '', gesetzt: false };
  let u;
  try { u = new URL(wert); }
  catch { return { adresse: '', gesetzt: true, fehler: 'Das ist keine vollständige Adresse.' }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:')
    return { adresse: '', gesetzt: true, fehler: 'Nur http:// und https:// sind möglich.' };
  if (!u.hostname)
    return { adresse: '', gesetzt: true, fehler: 'Es fehlt der Rechnername.' };
  if (u.username || u.password)
    return { adresse: '', gesetzt: true, fehler: 'Zugangsdaten gehören nicht in die Adresse.' };
  if (u.search) return { adresse: '', gesetzt: true, fehler: 'Eine Abfrage (?) ist nicht erlaubt.' };
  if (u.hash) return { adresse: '', gesetzt: true, fehler: 'Ein Fragment (#) ist nicht erlaubt.' };
  // Ohne abschliessenden Schraegstrich, damit der Link genau eine Form hat.
  const adresse = (u.origin + u.pathname).replace(/\/+$/, '');
  return { adresse, gesetzt: true };
}
const OEFFENTLICHE_ADRESSE = pruefeOeffentlicheAdresse(process.env.OEFFENTLICHE_ADRESSE);

const SESSION_DAYS = 30;

// --- Passwoerter -------------------------------------------------------
// scrypt aus Nodes eingebautem crypto, keine neue Abhaengigkeit. Die Kennwerte
// stehen im gespeicherten Wert mit drin, damit sie sich spaeter anheben lassen,
// ohne alte Eintraege unlesbar zu machen.
const PASSWORT_MIN = 10;
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function scryptRechne(passwort, salz, k) {
  return new Promise((fertig, fehler) => {
    crypto.scrypt(passwort, salz, k.keylen, { N: k.N, r: k.r, p: k.p },
      (e, buf) => e ? fehler(e) : fertig(buf));
  });
}

function baueWert(salz, hash, k) {
  return `scrypt$${k.N}$${k.r}$${k.p}$${salz.toString('hex')}$${hash.toString('hex')}`;
}

async function hashePasswort(passwort) {
  const salz = crypto.randomBytes(16);
  return baueWert(salz, await scryptRechne(String(passwort), salz, SCRYPT), SCRYPT);
}

// Gleiche Rechnung, aber ohne Event Loop -- nur fuer den Startvorgang,
// wo ohnehin niemand wartet.
function hashePasswortSync(passwort) {
  const salz = crypto.randomBytes(16);
  const h = crypto.scryptSync(String(passwort), salz, SCRYPT.keylen,
    { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return baueWert(salz, h, SCRYPT);
}

async function pruefePasswort(passwort, gespeichert) {
  const t = String(gespeichert || '').split('$');
  if (t.length !== 6 || t[0] !== 'scrypt') return false;
  const soll = Buffer.from(t[4 + 1], 'hex');
  if (!soll.length) return false;
  let ist;
  try {
    ist = await scryptRechne(String(passwort), Buffer.from(t[4], 'hex'),
      { N: +t[1], r: +t[2], p: +t[3], keylen: soll.length });
  } catch { return false; }
  return ist.length === soll.length && crypto.timingSafeEqual(ist, soll);
}

// Gegen Zeitmessung am Benutzernamen: ein unbekannter Name darf nicht messbar
// schneller abgewiesen werden als ein falsches Passwort. Deshalb rechnet die
// Pruefung auch dann, wenn es gar keinen Zugang gibt -- gegen diesen Blindwert.
const BLINDWERT = hashePasswortSync(crypto.randomBytes(16).toString('hex'));

// --- Zugang ------------------------------------------------------------
// Drei Rollen als Leiter: user < admin < eigentuemer (Begruendung am Schema
// in db.js).
const ROLLEN = ['user', 'admin', 'eigentuemer'];
const ZUSTAENDE = ['aktiv', 'gesperrt', 'geloescht'];

// Der Name eines geloeschten Zugangs. Der urspruengliche wird ueberschrieben
// und ist damit wieder frei. Die Zahl ist die alte id, und genau die steht
// auch in user_id -- die Oberflaeche bildet daraus "Geloeschter Benutzer 7",
// ohne dass irgendwo ein Name aufbewahrt wird.
const grabsteinName = (id) => `geloescht-${id}`;
// Damit ein lebender Zugang nicht wie ein Grabstein aussehen kann. Der Preis
// dieser Namensvergabe, ehrlich benannt: das Muster ist als Benutzername
// gesperrt.
const GRABSTEIN_MUSTER = /^geloescht-\d+$/i;

// Der EIGENTUEMER mit der kleinsten Nummer -- wer ihn ruft, meint den
// Eigentuemer der Instanz, nie den Angemeldeten (dafuer gibt es req.benutzer).
// Gefragt wird die ROLLE, nicht die kleinste id: sonst nennte das Protokoll
// einen geloeschten Zugang als Eigentuemer.
const holeBenutzer = () =>
  db.prepare("SELECT id, username, password_hash FROM users " +
             "WHERE role = 'eigentuemer' ORDER BY id LIMIT 1").get() || null;

// Der Kandidat zur Anmeldung. Die Spalte traegt COLLATE NOCASE, das Suchen
// findet also auch eine abweichende Schreibweise -- entschieden wird trotzdem
// erst danach mit safeEqual, Zeichen fuer Zeichen.
const holeBenutzerNachNamen = (name) =>
  db.prepare('SELECT id, username, password_hash, role, status FROM users WHERE username = ?')
    .get(String(name || '')) || null;

const benutzerVorhanden = () => db.prepare('SELECT COUNT(*) n FROM users').get().n > 0;

// Der Name steht fuer sich, weil er an zwei Wegen geprueft wird: beim Anlegen
// (immer mit Passwort) und beim blossen Umbenennen in aendereZugang(). Ohne die
// zweite Stelle koennte sich jemand in geloescht-7 umbenennen und saehe aus wie
// der Grabstein eines anderen.
function pruefeName(name) {
  const n = String(name || '').trim();
  if (!n) throw new Error('Bitte einen Benutzernamen angeben.');
  if (GRABSTEIN_MUSTER.test(n))
    throw new Error('Dieser Name ist für gelöschte Zugänge vorgesehen und nicht frei wählbar.');
  return n;
}

function pruefeVorgaben(name, passwort) {
  pruefeName(name);
  if (String(passwort || '').length < PASSWORT_MIN)
    throw new Error(`Das Passwort muss mindestens ${PASSWORT_MIN} Zeichen lang sein.`);
}

// Legt den ersten Zugang an. Das Einfuegen entscheidet selbst, ob es der erste
// ist -- eine Pruefung davor liesse zwischen Pruefung und Einfuegen Platz fuer
// einen zweiten Aufruf. Die Rolle steht fest auf 'eigentuemer': wer die Instanz
// einrichtet, dem gehoert sie.
async function legeErstenBenutzerAn(name, passwort) {
  pruefeVorgaben(name, passwort);
  const hash = await hashePasswort(passwort);
  const r = db.prepare(
    "INSERT INTO users (username, password_hash, role) " +
    "SELECT ?, ?, 'eigentuemer' WHERE NOT EXISTS (SELECT 1 FROM users)"
  ).run(String(name).trim(), hash);
  if (r.changes === 0) throw new Error('Die Einrichtung ist bereits abgeschlossen.');
  // Zweite Aufrufstelle des Auffangnetzes aus db.js: beim Start einer leeren
  // Instanz lief es ins Leere, weil es noch keinen Benutzer gab -- dieser Weg
  // liefert ihn erst jetzt nach.
  ordneBestandZu();
  // Die erste Zeile des Sicherheitsprotokolls: die Instanz bekommt ihren
  // Eigentuemer. Er handelt an sich selbst -- es gibt sonst niemanden.
  protokolliere('zugang.neu', { wer: r.lastInsertRowid, ziel: r.lastInsertRowid, merkmal: 'eigentuemer' });
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
async function aendereZugang(benutzerId, altesPasswort, neuerName, neuesPasswort, neueAdresse) {
  const id = Number(benutzerId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Ein Zugangswechsel braucht den angemeldeten Benutzer.');
  const u = db.prepare('SELECT id, username, password_hash, email FROM users WHERE id = ?').get(id);
  if (!u) throw new Error('Es ist noch kein Zugang eingerichtet.');
  if (!await pruefePasswort(String(altesPasswort || ''), u.password_hash))
    throw new Error('Das bisherige Passwort stimmt nicht.');
  const name = String(neuerName || '').trim() || u.username;
  const wechselt = String(neuesPasswort || '').length > 0;
  // pruefeName laeuft auf BEIDEN Wegen; pruefeVorgaben greift nur beim
  // Passwortwechsel.
  if (wechselt) pruefeVorgaben(name, neuesPasswort);
  else pruefeName(name);
  // Die Spalte traegt UNIQUE COLLATE NOCASE. Ohne diese Frage kaeme ab dem
  // zweiten Zugang die rohe SQLite-Meldung als 400 heraus -- unverstaendlich
  // an einer Stelle, an der man nur einen Namen tippt.
  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE AND id != ?').get(name, u.id))
    throw new Error('Diesen Benutzernamen gibt es bereits.');
  const hash = wechselt ? await hashePasswort(neuesPasswort) : u.password_hash;
  /* Die Adresse wird GEPRUEFT, bevor irgendetwas geschrieben wird -- eine
     Absage, die den Namen schon gewechselt hat, waere schlimmer als keine. */
  const adresseGemeint = neueAdresse !== undefined;
  const adresse = adresseGemeint ? String(neueAdresse || '').trim() : null;
  if (adresseGemeint && adresse && !mail.istAdresse(adresse))
    throw new Error('Das ist keine gültige E-Mail-Adresse.');
  db.prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?').run(name, hash, u.id);
  if (adresseGemeint)
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(adresse || null, u.id);
  /* Der eigene Zugang ist der erste Griff einer uebernommenen Sitzung: er
     sperrt den Richtigen aus. Ein Aufruf, der nichts bewegt, ist kein Vorgang
     und schreibt deshalb keine Zeile. Die Adresse zaehlt mit -- sie
     entscheidet, WOHIN der naechste Ruecksetzlink geht. 'beides' heisst "mehr
     als eines", deshalb wird GEZAEHLT statt verschachtelt. */
  const umbenannt = name !== u.username;
  const adresseNeu = adresseGemeint && (adresse || null) !== (u.email || null);
  const bewegt = [umbenannt && 'name', wechselt && 'passwort', adresseNeu && 'adresse'].filter(Boolean);
  const merkmal = bewegt.length > 1 ? 'beides' : bewegt[0] || null;
  if (merkmal) protokolliere('zugang.selbst', { wer: u.id, ziel: u.id, merkmal });
  return { username: name, passwortGewechselt: wechselt, email: adresseGemeint ? adresse : (u.email || '') };
}

/* --- Zugangsverwaltung --------------------------------------------------
   EIN Ort, zwei Rufer: die Verwaltungskarte in server.js und der Befehl
   zugang.js auf dem Wirt. Die Rechtefrage steht hier ausdruecklich NICHT --
   wer etwas darf, entscheidet server.js an der Route; zugang.js laeuft auf dem
   Wirt und hat damit ohnehin alles. Diese Funktionen fuehren nur aus. */

const holeZugang = (id) =>
  db.prepare('SELECT id, username, role, status, email, last_login, created_at FROM users WHERE id = ?')
    .get(Number(id)) || null;

// Die Liste fuer die Verwaltungskarte. Die Zahl der Eintraege steht dabei, weil
// sie die Entscheidung traegt -- genau wie der Verwendungszaehler neben dem
// Loeschknopf der Kriterien.
/* ohnePasswort WIRD AUS password_hash ABGELEITET UND NICHT AUS last_login:
   last_login IS NULL heisst "hat sich noch nie angemeldet", und das ist nicht
   dasselbe wie "kann sich nicht anmelden". Die Karte braucht das Zweite, und
   es steht dort, wo auch pruefeAnmeldung entscheidet.
   AUSGELIEFERT WIRD DER HASH NICHT, nur die abgeleitete Frage darauf. */
const listeZugaenge = () => db.prepare(
  `SELECT u.id, u.username, u.role, u.status, u.last_login, u.created_at,
          (u.password_hash = '') AS ohnePasswort,
          (SELECT COUNT(*) FROM items i WHERE i.user_id = u.id) AS eintraege
     FROM users u ORDER BY u.id`
).all().map(z => ({ ...z, ohnePasswort: Boolean(z.ohnePasswort) }));

// Zaehlt die Eigentuemer, die sich noch anmelden koennen. Ein gesperrter oder
// geloeschter zaehlt nicht mit -- sonst liesse sich die Instanz verriegeln,
// indem man den letzten Eigentuemer sperrt statt ihn herabzustufen.
const zahlEigentuemer = () => db.prepare(
  "SELECT COUNT(*) AS n FROM users WHERE role = 'eigentuemer' AND status = 'aktiv'"
).get().n;

/* OHNE PASSWORT WIRD AUSDRUECKLICH VERLANGT, nie durch blosses Weglassen:
   ohnePasswort === true ist die einzige Form. Sonst legte ein Fehler im
   Aufrufer wortlos einen Zugang an, in den sich niemand anmelden kann.
   DER LEERE HASH IST DIE SPERRE, und zwar doppelt: pruefeAnmeldung faellt bei
   leerem Hash auf BLINDWERT zurueck, und pruefePasswort weist einen Wert, der
   nicht nach scrypt aussieht, schon am Format ab. */
async function legeZugangAn(name, passwort, rolle = 'user', ohnePasswort = false, wer, adresse) {
  if (ohnePasswort === true) pruefeName(name);
  else pruefeVorgaben(name, passwort);
  if (!ROLLEN.includes(rolle)) throw new Error('Diese Rolle gibt es nicht.');
  const sauber = String(name).trim();
  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE').get(sauber))
    throw new Error('Diesen Benutzernamen gibt es bereits.');
  /* DIE ADRESSE BEIM ANLEGEN, und nur hier: ohne sie hat die Einladungsmail
     keinen Empfaenger, und den Zugang gibt es in diesem Augenblick noch nicht,
     also kann ihn auch niemand selbst eintragen. Alles Spaetere laeuft ueber
     aendereZugang und damit ueber den Betroffenen -- die Begruendung steht
     dort. Geprueft VOR dem Anlegen: ein Zugang, der steht, und eine Absage
     daneben waeren zwei Aussagen ueber denselben Aufruf. */
  const mailAdresse = String(adresse || '').trim();
  if (mailAdresse && !mail.istAdresse(mailAdresse))
    throw new Error('Das ist keine gültige E-Mail-Adresse.');
  const hash = ohnePasswort === true ? '' : await hashePasswort(passwort);
  const handelt = handelnder(wer);
  const r = db.prepare('INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, ?, ?)')
    .run(sauber, hash, rolle, mailAdresse || null);
  protokolliere('zugang.neu', { wer: handelt, ziel: r.lastInsertRowid, merkmal: rolle });
  return { id: r.lastInsertRowid, username: sauber, role: rolle,
           ohnePasswort: hash === '', email: mailAdresse };
}

// Setzt ein Passwort ohne das bisherige zu kennen -- fuer den Admin, der es
// zuruecksetzt, und fuer zugang.js. Die Sitzungen fallen dabei ALLE: wer ein
// fremdes Passwort neu setzt, will den bisherigen Inhaber draussen haben.
async function setzeNeuesPasswort(benutzerId, neuesPasswort, wer) {
  const handelt = handelnder(wer);
  const u = holeZugang(benutzerId);
  if (!u) throw new Error('Diesen Zugang gibt es nicht.');
  if (u.status === 'geloescht') throw new Error('Dieser Zugang ist gelöscht.');
  if (String(neuesPasswort || '').length < PASSWORT_MIN)
    throw new Error(`Das Passwort muss mindestens ${PASSWORT_MIN} Zeichen lang sein.`);
  const hash = await hashePasswort(neuesPasswort);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, u.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
  protokolliere('zugang.passwort', { wer: handelt, ziel: u.id });
  return { id: u.id, username: u.username };
}

function setzeRolle(benutzerId, rolle, wer) {
  const handelt = handelnder(wer);
  const u = holeZugang(benutzerId);
  if (!u) throw new Error('Diesen Zugang gibt es nicht.');
  if (u.status === 'geloescht') throw new Error('Dieser Zugang ist gelöscht.');
  if (!ROLLEN.includes(rolle)) throw new Error('Diese Rolle gibt es nicht.');
  // Der letzte Eigentuemer darf nicht verschwinden -- weder durch Herabstufen
  // noch weiter unten durch Sperren oder Loeschen. Ohne ihn kaeme niemand mehr
  // an Rollen, Export und Import, und der einzige Ausweg waere zugang.js.
  if (u.role === 'eigentuemer' && rolle !== 'eigentuemer' && zahlEigentuemer() <= 1)
    throw new Error('Das ist der letzte Eigentümer der Instanz — vorher einen zweiten bestimmen.');
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(rolle, u.id);
  protokolliere('zugang.rolle', { wer: handelt, ziel: u.id, merkmal: rolle });
  return { id: u.id, username: u.username, role: rolle };
}

function setzeStatus(benutzerId, status, wer) {
  const handelt = handelnder(wer);
  const u = holeZugang(benutzerId);
  if (!u) throw new Error('Diesen Zugang gibt es nicht.');
  if (u.status === 'geloescht') throw new Error('Dieser Zugang ist gelöscht.');
  if (status !== 'aktiv' && status !== 'gesperrt')
    throw new Error('Dieser Status lässt sich hier nicht setzen.');
  if (u.role === 'eigentuemer' && status !== 'aktiv' && zahlEigentuemer() <= 1)
    throw new Error('Das ist der letzte Eigentümer der Instanz — vorher einen zweiten bestimmen.');
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
  if (status !== 'aktiv') {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(u.id);
  }
  protokolliere('zugang.status', { wer: handelt, ziel: u.id, merkmal: status });
  return { id: u.id, username: u.username, status };
}

/* Was an einem Zugang haengt, getrennt nach eigen und fremd. Die Zahlen tragen
   den Loeschdialog: "seine Eintraege loeschen" nimmt ueber die Kaskade auch
   FREMDE Kommentare, Bewertungen und Testtage mit, und das darf nicht wortlos
   geschehen.
   IS NOT statt != , weil user_id nullbar ist: eine herrenlose Zeile ist eine
   fremde und faellt bei != aus dem Vergleich heraus. */
function zaehleBestand(benutzerId) {
  const id = Number(benutzerId);
  const eins = (sql, ...w) => db.prepare(sql).get(...w).n;
  const seine = 'SELECT id FROM items WHERE user_id = ?';
  return {
    eintraege: eins('SELECT COUNT(*) n FROM items WHERE user_id = ?', id),
    // an SEINEN Eintraegen, von anderen geschrieben -- faellt mit den Eintraegen
    fremdKommentare: eins(`SELECT COUNT(*) n FROM comments WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    fremdBewertungen: eins(`SELECT COUNT(*) n FROM ratings WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    fremdTesttage: eins(`SELECT COUNT(*) n FROM test_days WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    fremdLinks: eins(`SELECT COUNT(*) n FROM links WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    fremdDateien: eins(`SELECT COUNT(*) n FROM attachments WHERE user_id IS NOT ? AND item_id IN (${seine})`, id, id),
    // SEINE Beitraege in FREMDEN Eintraegen -- das zweite Haekchen
    kommentare: eins(`SELECT COUNT(*) n FROM comments WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    bewertungen: eins(`SELECT COUNT(*) n FROM ratings WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    testtage: eins(`SELECT COUNT(*) n FROM test_days WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    // Der fuenfte und der sechste Traeger. Ohne sie saehe ein Zugang, der
    // zwanzig Links und ein Dutzend Dateien in fremden Eintraegen hinterlassen
    // hat, im Dialog leer aus.
    links: eins(`SELECT COUNT(*) n FROM links WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    dateien: eins(`SELECT COUNT(*) n FROM attachments WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id)
  };
}

/* Der Grabstein. Die Zeile wird NICHT entfernt -- sie bleibt mit ihrer id
   stehen, damit user_id weiterhin auf etwas zeigt und die Beitraege sichtbar
   bleiben, nur ohne Namen. Entfernte man sie, machte ON DELETE SET NULL den
   Bestand herrenlos und ordneBestandZu() schoebe ihn beim naechsten Start still
   dem Eigentuemer zu: fremde Aussagen unter fremdem Namen.
   Mitgeloescht wird, was rein persoenlich ist: Sitzungen, Favoriten,
   Einstellungen. Inhalte nur auf ausdrueckliche Ansage. */
function entferneZugang(benutzerId, optionen = {}, wer) {
  const handelt = handelnder(wer);
  const u = holeZugang(benutzerId);
  if (!u) throw new Error('Diesen Zugang gibt es nicht.');
  if (u.status === 'geloescht') throw new Error('Dieser Zugang ist bereits gelöscht.');
  if (u.role === 'eigentuemer' && zahlEigentuemer() <= 1)
    throw new Error('Das ist der letzte Eigentümer der Instanz — vorher einen zweiten bestimmen.');
  const zahlen = zaehleBestand(u.id);
  db.transaction(() => {
    // Reihenfolge: erst die Eintraege, dann der Rest. Umgekehrt zaehlte das
    // zweite Haekchen Zeilen mit, die das erste ohnehin mitgenommen haette.
    if (optionen.eintraege) db.prepare('DELETE FROM items WHERE user_id = ?').run(u.id);
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
    db.prepare('DELETE FROM zweifaktor WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM zweifaktor_codes WHERE user_id = ?').run(u.id);
    db.prepare("UPDATE users SET username = ?, password_hash = '', role = 'user', " +
               "status = 'geloescht', email = NULL WHERE id = ?")
      .run(grabsteinName(u.id), u.id);
  })();
  /* NACH der Transaktion, nicht darin: eine Protokollzeile, die einen Vorgang
     mitreisst, ueber den sie berichtet, waere die falsche Reihenfolge. Die
     Zeile bleibt stehen -- der Grabstein traegt seine Nummer weiter, ziel
     zeigt also weiterhin auf etwas. */
  protokolliere('zugang.weg', { wer: handelt, ziel: u.id });
  return { id: u.id, name: u.username, grabstein: grabsteinName(u.id), zahlen, optionen };
}

// --- AUTH_RESET wird abgelehnt ------------------------------------------
// Ein Zuruecksetzen ueber eine Umgebungsvariable gibt es nicht: es machte alle
// Zugaenge und Zuordnungen mit einem Schlag kaputt. Passwort und Zugaenge
// verwaltet zugang.js auf dem Wirt. Still weglassen waere falsch: wer die
// Zeile in der .env stehen hat, muss es erfahren -- der Start bricht nicht ab,
// sagt es aber laut.
if (process.env.AUTH_RESET) {
  console.warn('[Kriterion] AUTH_RESET wird seit Version 0.8.0 nicht mehr ausgefuehrt und ist ' +
    'wirkungslos. Die Zeile kann aus der .env entfernt werden. Passwort vergessen: ' +
    'docker compose exec kriterion node zugang.js passwort <name> -- ' +
    'Zugang entfernen: node zugang.js entfernen <name>.');
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

const schluesselIp = (ip) => `ip:${ip}`;
const schluesselName = (name) => `name:${String(name || '').trim().toLowerCase()}`;

// Dieselbe Kurve fuer beide Zaehler: eine zweite Rechnung daneben waere eine
// zweite Wahrheit darueber, wie stark gebremst wird.
function verzoegerung(count) {
  const ueber = Math.max(0, count - SOFT_LIMIT + 1);
  return ueber > 0 ? Math.min(ueber * 700, 4000) : 0;
}

/* Die Adresse des Aufrufers -- Grundlage der Anmeldebremse.
   Ohne Proxy zaehlt allein die tatsaechliche Verbindung; der Kopf wird nicht
   einmal angesehen, er koennte nur luegen. Mit Proxy zaehlt der LETZTE
   Eintrag der Kette und nicht der erste: ein Proxy haengt die Gegenstelle,
   die er wirklich sieht, hinten an -- alles davor kann der Aufrufer selbst
   hineingeschrieben haben. */
function clientIp(req) {
  if (HINTER_PROXY) {
    const kette = String(req.headers['x-forwarded-for'] || '')
      .split(',').map(t => t.trim()).filter(Boolean);
    if (kette.length) return kette[kette.length - 1];
  }
  return req.socket.remoteAddress || 'unbekannt';
}

function checkThrottle(ip, name) {
  let delayMs = 0;
  const a = attempts.get(schluesselIp(ip));
  if (a) {
    if (a.until && Date.now() < a.until) {
      return { blocked: true, retryInSec: Math.ceil((a.until - Date.now()) / 1000) };
    }
    if (a.until) attempts.delete(schluesselIp(ip));
    else delayMs = verzoegerung(a.count);
  }
  const b = attempts.get(schluesselName(name));
  if (b) delayMs = Math.max(delayMs, verzoegerung(b.count));
  return { blocked: false, delayMs };
}

function noteFailure(ip, name) {
  const a = attempts.get(schluesselIp(ip)) || { count: 0, until: 0 };
  a.count++;
  if (a.count >= HARD_LIMIT) a.until = Date.now() + BLOCK_MS;
  attempts.set(schluesselIp(ip), a);
  // Ohne until: der Name bekommt bewusst keine harte Sperre.
  if (String(name || '').trim()) {
    const b = attempts.get(schluesselName(name)) || { count: 0, until: 0 };
    b.count++;
    attempts.set(schluesselName(name), b);
  }
}

function noteSuccess(ip, name) {
  attempts.delete(schluesselIp(ip));
  if (String(name || '').trim()) attempts.delete(schluesselName(name));
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
   stillschweigend heraus. Kein eigener Fehlerpfad, keine Meldung, keine Zeile
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
    let wert;
    try { wert = decodeURIComponent(part.slice(i + 1).trim()); }
    catch { continue; }
    out[part.slice(0, i).trim()] = wert;
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
// hat. Sonst waere die Meldung ein Werkzeug zum Durchprobieren von Namen. Die
// Entscheidung faellt eine Ebene hoeher, in der Anmelderoute.
async function pruefeAnmeldung(name, passwort) {
  const u = holeBenutzerNachNamen(name);
  // Auch ohne Zugang wird gerechnet, sonst verraet die Antwortzeit, ob der
  // Benutzername stimmt. Ein GRABSTEIN traegt einen leeren Hash -- ohne den
  // Rueckfall auf den Blindwert waere er messbar schneller abgewiesen als ein
  // lebender Zugang mit falschem Passwort.
  const nameStimmt = u ? safeEqual(name || '', u.username) : false;
  const passwortStimmt = await pruefePasswort(passwort || '',
    (u && u.password_hash) ? u.password_hash : BLINDWERT);
  if (nameStimmt && passwortStimmt) return u;
  /* DIE EINZIGE ZEILE, DIE EIN FREMDER AUSLOESEN KANN -- und sie steht HIER,
     weil nur hier bekannt ist, ob der getippte Name ueberhaupt einen Zugang
     traf. Der getippte Name selbst geht NICHT in die Tabelle: sonst landete
     frueher oder spaeter ein ins falsche Feld getipptes Passwort darin.
     Geschrieben wird nur, wenn es bis hierher gekommen ist -- der gesperrte
     Fall ruft diese Funktion gar nicht erst, und damit ist die Bremse der
     Deckel ueber der Tabelle. */
  protokolliere('anmeldung.fehl', { wer: null, ziel: nameStimmt ? u.id : null });
  return null;
}

// Eine Sitzung entsteht in dieser Anwendung ausschliesslich durch eine
// Anmeldung -- ueber die Anmeldeseite oder ueber die Ersteinrichtung. Deshalb
// wird last_login genau hier mitgeschrieben und nicht an beiden Aufrufstellen
// einzeln: eine Stelle kann nicht auseinanderlaufen.
function legeSitzungAn(benutzerId) {
  const id = Number(benutzerId);
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
  protokolliere('anmeldung.ok', { wer: id, ziel: id });
  return token;
}

function destroySession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  // Mit der Sitzung faellt ihre offene Freigabe.
  verwirfFreigabe(token);
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
const sitzungsKennung = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

/* SQLite kann SHA-256 nicht rechnen, also wird die Kennung hier gebildet und
   nicht in der Abfrage. Das traegt, weil je Benutzer eine Handvoll Zeilen
   dastehen -- die Abfrage selbst greift ueber idx_sessions_user. */
function sitzungenVon(benutzerId, eigenerToken) {
  const id = Number(benutzerId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Eine Sitzungsliste braucht den angemeldeten Benutzer.');
  return db.prepare(
    `SELECT token, created_at, last_seen FROM sessions
      WHERE user_id = ? AND last_seen >= datetime('now', '-${SESSION_DAYS} days')
      ORDER BY last_seen DESC, created_at DESC`
  ).all(id).map(z => ({
    kennung: sitzungsKennung(z.token),
    angemeldetAm: z.created_at,
    zuletztGesehen: z.last_seen,
    // Die eigene ist markiert, damit die Karte sie nicht mit "alle anderen"
    // wegnimmt -- man wuerde sich sonst selbst hinauswerfen.
    diese: Boolean(eigenerToken) && z.token === eigenerToken
  }));
}

// Beendet EINE Sitzung des angemeldeten Benutzers. Die Klemme auf user_id ist
// die ganze Rechtefrage dieser Funktion: ohne sie beendete eine fremde Kennung
// eine fremde Sitzung.
function beendeSitzung(benutzerId, kennung) {
  const id = Number(benutzerId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Das Beenden braucht den angemeldeten Benutzer.');
  const z = db.prepare('SELECT token FROM sessions WHERE user_id = ?').all(id)
    .find(r => sitzungsKennung(r.token) === String(kennung || ''));
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
function beendeAndereSitzungen(benutzerId, eigenerToken) {
  const id = Number(benutzerId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Das Beenden braucht den angemeldeten Benutzer.');
  return db.prepare('DELETE FROM sessions WHERE token != ? AND user_id = ?')
    .run(String(eigenerToken || ''), id).changes;
}

/* --- Token: ein Mechanismus, zwei Anlaesse ------------------------------
   32 Zufallsbytes, gespeichert wird nur der Hash, einmal gueltig, Ablauf nach
   sieben Tagen, beim Einloesen fallen alle Sitzungen dieses Benutzers.
   Die Begruendung zu Hash und Spalten steht am Schema in db.js.

   DER LINK IST EIN PASSWORTERSATZ AUF ZEIT: er steht nach der Weitergabe in
   einem fremden Verlauf, deshalb ist er kurzlebig und gilt genau einmal. Die
   Oberflaeche sagt das an der Stelle, an der er kopiert wird. */
const TOKEN_TAGE = 7;
// Wie lange die BENUTZTE Zeile als Spur stehen bleibt, gerechnet ab Ablauf.
// Eine Schwelle statt zweier: ein Wert, eine Regel, eine Gegenprobe.
const TOKEN_SPUR_TAGE = 30;
const TOKEN_ZWECKE = ['einladung', 'ruecksetzung'];

/* --- Die Frist ab dem ersten Oeffnen ------------------------------------
   SIEBEN TAGE SIND DIE FRIST FUER DAS LESEN DER MAIL, NICHT FUER DAS LIEGEN
   DES LINKS. Solange niemand geoeffnet hat, laufen die sieben Tage weiter. Ab
   dem ERSTEN Oeffnen ist der Link erwiesenermassen angekommen -- und hat in
   einem fremden Postfach nichts mehr verloren.

   WARUM DAS HIER TRAEGT: der uebliche Grund gegen kurze Fristen an
   Einmal-Links sind Vorschaudienste, die Links vorab holen und verbrennen.
   Der Schluessel steht im FRAGMENT (#/einladung/…), und ein Fragment geht nie
   an den Server -- ein Vorschaudienst loest die Frist also gerade NICHT aus.

   INNERHALB DER FRIST DARF BELIEBIG OFT GEOEFFNET WERDEN: NUR DER ERSTE
   Aufruf schreibt herunter, der zweite sieht einen Ablauf, der naeher liegt
   als die Frist, und ruehrt ihn nicht an.

   KEINE NEUE SPALTE: geschrieben wird ablauf, die es laengst gibt. Der Preis,
   ehrlich benannt -- hinterher ist nicht mehr zu sehen, OB ein Link schon
   einmal geoeffnet wurde, nur noch, wann er ablaeuft. */
const TOKEN_FRIST_MINUTEN = 15;

// Liefert den Ablauf, der danach gilt -- fuer den Aufrufer, der ihn nennen
// will. Schreibt HOECHSTENS herunter, nie hinauf: ein zweiter Aufruf darf die
// Frist nicht verlaengern, sonst haelt sie ein Neuladen im Minutentakt offen.
const setzeFrist = db.prepare(
  `UPDATE tokens SET ablauf = datetime('now', ?)
    WHERE hash = ? AND benutzt_am IS NULL AND ablauf > datetime('now', ?)`);
function beginneTokenFrist(hash) {
  const modifikator = `+${TOKEN_FRIST_MINUTEN} minutes`;
  // ZWEI MODIFIKATOREN WAEREN ZWEI ARGUMENTE (Stolperstein 119) -- hier steht
  // derselbe zweimal, einmal als neuer Wert und einmal als Schranke davor.
  setzeFrist.run(modifikator, String(hash || ''), modifikator);
  return TOKEN_FRIST_MINUTEN;
}

const tokenHash = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');

/* Dieselbe Bauform wie raeumePapierkorbAuf(): EINE Funktion, ZWEI
   Aufrufstellen -- beim Start und beim Oeffnen der Karte. Eine Instanz, die
   drei Monate durchlaeuft, raeumte sonst drei Monate lang nicht auf.
   ZWEI MODIFIKATOREN WAEREN ZWEI ARGUMENTE (Stolperstein 119); hier steht
   einer, und er wird gebunden statt in den String geschrieben. */
const delTokenAlt = db.prepare("DELETE FROM tokens WHERE ablauf < datetime('now', ?)");
function raeumeTokensAuf() {
  const n = delTokenAlt.run(`-${TOKEN_SPUR_TAGE} days`).changes;
  if (n) console.log(`[Kriterion] Token: ${n} Zeile(n) laenger als ` +
    `${TOKEN_SPUR_TAGE} Tage abgelaufen und entfernt.`);
  return n;
}

/* Erzeugt einen Token und gibt den KLARTEXT genau einmal zurueck -- er steht
   danach nirgends mehr, auch nicht in der Datenbank. Wer ihn verliert, erzeugt
   einen neuen.
   Die Rechtefrage steht hier ausdruecklich NICHT: wer einladen darf,
   entscheidet server.js an der Route -- dieselbe Trennung wie bei der
   uebrigen Zugangsverwaltung. */
function erzeugeToken(benutzerId, zweck, wer) {
  const handelt = handelnder(wer);
  const u = holeZugang(benutzerId);
  if (!u) throw new Error('Diesen Zugang gibt es nicht.');
  if (u.status !== 'aktiv') throw new Error('Dieser Zugang ist nicht aktiv.');
  if (!TOKEN_ZWECKE.includes(zweck)) throw new Error('Diesen Zweck gibt es nicht.');
  const klartext = crypto.randomBytes(32).toString('hex');
  db.prepare(
    `INSERT INTO tokens (hash, user_id, zweck, ablauf)
     VALUES (?, ?, ?, datetime('now', ?))`
  ).run(tokenHash(klartext), u.id, zweck, `+${TOKEN_TAGE} days`);
  // Ein Link IST ein Passwortersatz auf Zeit -- deshalb steht sein Entstehen im
  // Sicherheitsprotokoll, und zwar mit dem Anlass. Der Schluessel selbst nie.
  protokolliere('link.neu', { wer: handelt, ziel: u.id, merkmal: zweck });
  return {
    klartext, zweck, id: u.id, username: u.username,
    // Der Bildschirmtext leitet sich aus dem ZUSTAND ab, nicht aus zweck --
    // sonst stuenden zwei Wahrheiten nebeneinander, sobald jemand einen
    // Einladungslink an einen Zugang schickt, der laengst ein Passwort hat.
    ohnePasswort: !db.prepare('SELECT password_hash h FROM users WHERE id = ?').get(u.id).h,
    tage: TOKEN_TAGE
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
function pruefeToken(klartext) {
  const t = String(klartext || '');
  if (!t) return null;
  const z = db.prepare(
    `SELECT t.hash, t.user_id, t.zweck, t.ablauf, u.username, u.status, u.password_hash
       FROM tokens t JOIN users u ON u.id = t.user_id
      WHERE t.hash = ? AND t.benutzt_am IS NULL AND t.ablauf > datetime('now')`
  ).get(tokenHash(t));
  if (!z || z.status !== 'aktiv') return null;
  return {
    hash: z.hash, id: z.user_id, username: z.username, zweck: z.zweck,
    ablauf: z.ablauf, ohnePasswort: !z.password_hash
  };
}

/* Loest ein. EINE Transaktion: entweder steht das neue Passwort UND der Token
   ist verbraucht, oder es hat sich nichts bewegt.
   ALLE UEBRIGEN OFFENEN TOKEN DIESES BENUTZERS FALLEN MIT -- das steht so
   nicht im Konzeptpapier und gehoert trotzdem hierher: laege noch ein
   aelterer Link in einem fremden Verlauf, setzte er hinterher ein zweites Mal
   ein Passwort. "Einmal gueltig" waere dann nur fuer den einen Link wahr.
   DIE SITZUNGEN FALLEN ueber setzeNeuesPasswort -- dort steht die Regel schon,
   und ein zweiter Ort dafuer waere ein zweiter, der auseinanderlaufen kann. */
async function loeseTokenEin(klartext, neuesPasswort) {
  const t = pruefeToken(klartext);
  if (!t) throw new Error('Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern.');
  if (String(neuesPasswort || '').length < PASSWORT_MIN)
    throw new Error(`Das Passwort muss mindestens ${PASSWORT_MIN} Zeichen lang sein.`);
  // Ausserhalb der Transaktion: scrypt rechnet absichtlich lange, und eine
  // Transaktion soll nicht so lange offen stehen.
  const hash = await hashePasswort(neuesPasswort);
  db.transaction(() => {
    db.prepare("UPDATE tokens SET benutzt_am = datetime('now') WHERE hash = ?").run(t.hash);
    db.prepare('DELETE FROM tokens WHERE user_id = ? AND benutzt_am IS NULL').run(t.id);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, t.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(t.id);
  })();
  // Der Einloesende handelt an sich selbst -- er ist ja gerade dabei, sein
  // eigenes Passwort zu setzen. Die Zeile steht NACH der Transaktion.
  protokolliere('link.ein', { wer: t.id, ziel: t.id, merkmal: t.zweck });
  return { id: t.id, username: t.username, zweck: t.zweck };
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
const ANFRAGE_STUNDEN = 24;
/* WARUM DEUTLICH KUERZER ALS DIE SIEBEN TAGE DES EINLADUNGSLINKS: dort ist
   geprueft, WER den Link bekommt -- ein Admin hat den Zugang angelegt. Hier
   ist noch gar nichts geprueft; die Zeile steht auf nichts als der Behauptung
   eines Fremden. Eine Anfrage, die einen Tag lang nicht bestaetigt wird, ist
   entweder verirrt oder nie gewollt gewesen. */
const ANFRAGE_DECKEL = 20;
/* EINE LAENGENGRENZE, UND SIE GILT NUR HIER: das ist die einzige Stelle im
   Projekt, an der ein FREMDER etwas in die Datenbank schreibt. Ohne Grenze
   passte in jede der zwanzig Zeilen, was der Rumpf hergibt (zwei Megabyte).
   SIE IST KEINE ZWEITE WAHRHEIT UEBER BENUTZERNAMEN -- pruefeName bleibt
   unveraendert, begrenzt wird die EINGABE VON AUSSEN. 254 ist die Laenge, die
   eine Mailadresse ueberhaupt haben darf. */
const ANFRAGE_NAME_MAX = 64;
const ANFRAGE_MAIL_MAX = 254;

/* Der Deckel zaehlt BESTAETIGTE UND UNBESTAETIGTE ZUSAMMEN. Zaehlte er nur
   die bestaetigten, fuellte ein Angreifer die Tabelle mit Unbestaetigten,
   ohne je eine Mail zu lesen -- und der Admin saehe davon nichts. */
const qAnfragenZahl = db.prepare('SELECT COUNT(*) n FROM anfragen');
const zaehleAnfragen = () => qAnfragenZahl.get().n;

/* Dieselbe Bauform wie raeumeTokensAuf(), aber mit DREI Aufrufstellen --
   Start, Karte und die Anfrageroute. Die dritte steht VOR der Deckelpruefung,
   sonst blockierten zwanzig laengst verfallene Zeilen die Selbstanmeldung
   noch einen weiteren Tag.
   GERAEUMT WIRD NUR DAS UNBESTAETIGTE: eine bestaetigte Anfrage wartet auf
   den Admin, so lange es dauert.
   EIN MODIFIKATOR, und er wird GEBUNDEN statt in den String geschrieben
   (Stolperstein 119). */
const delAnfragenAlt = db.prepare(
  "DELETE FROM anfragen WHERE bestaetigt_am IS NULL AND created_at < datetime('now', ?)");
function raeumeAnfragenAuf() {
  const n = delAnfragenAlt.run(`-${ANFRAGE_STUNDEN} hours`).changes;
  if (n) console.log(`[Kriterion] Selbstanmeldung: ${n} unbestaetigte Anfrage(n) aelter als ` +
    `${ANFRAGE_STUNDEN} Stunden entfernt.`);
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

   GEPRUEFT WIRD MIT pruefeName UND mail.istAdresse, wie an einem echten
   Zugang: was nie ein Zugang werden koennte, kommt gar nicht erst in die
   Warteschlange. VERGLICHEN WIRD OHNE RUECKSICHT AUF GROSS UND KLEIN -- zwei
   Adressen, die sich nur in der Schreibweise unterscheiden, sind dasselbe
   Postfach. */
const qAnfrageName = db.prepare('SELECT 1 FROM anfragen WHERE username = ? COLLATE NOCASE');
const qAnfrageMail = db.prepare('SELECT 1 FROM anfragen WHERE email = ? COLLATE NOCASE');
const qBenutzerMail = db.prepare('SELECT 1 FROM users WHERE email = ? COLLATE NOCASE');
function legeAnfrageAn(name, adresse) {
  const sauber = String(name || '').trim();
  const post = String(adresse || '').trim();
  if (sauber.length > ANFRAGE_NAME_MAX || post.length > ANFRAGE_MAIL_MAX) return null;
  try { pruefeName(sauber); } catch { return null; }
  if (!mail.istAdresse(post)) return null;
  // Erst raeumen, dann zaehlen: der Deckel soll sich auf das beziehen, was
  // wirklich noch offen ist.
  raeumeAnfragenAuf();
  if (zaehleAnfragen() >= ANFRAGE_DECKEL) return null;
  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE').get(sauber)) return null;
  if (qBenutzerMail.get(post)) return null;
  if (qAnfrageName.get(sauber)) return null;
  if (qAnfrageMail.get(post)) return null;
  const klartext = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO anfragen (hash, username, email) VALUES (?, ?, ?)')
    .run(tokenHash(klartext), sauber, post);
  /* KEINE PROTOKOLLZEILE. Sie waere die einzige neben der gescheiterten
     Anmeldung, die ein FREMDER ausloesen kann -- und damit die zweite Stelle,
     an der sich die Tabelle von aussen vollschreiben liesse. Beim Anmelden
     traegt die Bremse den Deckel; hier gaebe es keinen. Der Vorgang, auf den
     es ankommt, ist ohnehin die Entscheidung des Admins, und die steht drin. */
  return klartext;
}

/* Bestaetigt eine Anfrage. LIEFERT ja/nein UND NICHTS UEBER DIE ZEILE -- der
   Bestaetigende weiss ja, was er angefragt hat, und wer den Schluessel nur
   raet, soll aus der Antwort keinen Namen und keine Adresse ziehen.
   EINE EINZIGE ABSAGE FUER ALLE FAELLE -- erfunden, verfallen, schon
   bestaetigt, laengst freigeschaltet. Dieselbe Ueberlegung wie beim Token:
   das Heilmittel ist in jedem Fall dasselbe, naemlich die Anfrage neu stellen.
   ZWEIMAL KLICKEN IST UNSCHAEDLICH: bestaetigt_am wird nur gesetzt, wo es noch
   leer ist, und der zweite Aufruf trifft dieselbe Zeile und meldet ebenfalls
   Erfolg. Wer neu laedt, soll nicht vor einer Absage stehen. */
const setzeBestaetigt = db.prepare(
  `UPDATE anfragen SET bestaetigt_am = datetime('now')
    WHERE hash = ? AND created_at > datetime('now', ?)`);
function bestaetigeAnfrage(klartext) {
  const t = String(klartext || '');
  if (!t) return false;
  // Erst raeumen: eine verfallene Zeile darf sich nicht nachtraeglich
  // bestaetigen lassen, nur weil sie noch dasteht.
  raeumeAnfragenAuf();
  return setzeBestaetigt.run(tokenHash(t), `-${ANFRAGE_STUNDEN} hours`).changes > 0;
}

/* Was der Admin sieht: AUSSCHLIESSLICH DIE BESTAETIGTEN. Eine unbestaetigte
   Anfrage erscheint nicht -- sonst stuende dort die Adresse eines Menschen,
   der von der ganzen Sache nichts weiss, und der Admin koennte sie
   freischalten. Genau die Luecke schliesst die Bestaetigungsmail.
   DER SCHLUESSEL KOMMT HIER NIE HERAUS, auch nicht sein Hash: die Karte
   braucht die Nummer, und mehr hat sie mit dem Geheimnis nicht zu tun. */
const qAnfragen = db.prepare(
  `SELECT id, username, email, created_at, bestaetigt_am
     FROM anfragen WHERE bestaetigt_am IS NOT NULL ORDER BY bestaetigt_am ASC, id ASC`);
const listeAnfragen = () => qAnfragen.all();
const holeAnfrage = (id) => db.prepare(
  'SELECT id, username, email, created_at, bestaetigt_am FROM anfragen WHERE id = ?')
  .get(Number(id) || 0) || null;
const entferneAnfrage = (id) =>
  db.prepare('DELETE FROM anfragen WHERE id = ?').run(Number(id) || 0).changes > 0;

/* --- Das Sicherheitsprotokoll -------------------------------------------
   ES HAELT FEST, WER ZUGANG HATTE UND WER DIE INSTANZ ALS GANZES ANGEFASST
   HAT -- und ausdruecklich nichts darueber, was jemand GESAGT hat. Die
   Begruendung zu Spalten und Grenzen steht am Schema in db.js.

   ZWANZIG VORGAENGE, und die Liste ist die Entscheidung. Was nicht darin
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
const VORGAENGE = [
  'anmeldung.ok', 'anmeldung.fehl', 'bestaetigung.fehl',
  'zugang.neu', 'zugang.rolle', 'zugang.status', 'zugang.passwort',
  'zugang.weg', 'zugang.selbst',
  'link.neu', 'link.ein',
  /* 'anfrage.frei' und 'anfrage.ab' -- die Entscheidung des Admins ueber
     eine Selbstanmeldung. NICHT DOPPELT zu zugang.neu und link.neu: keine der
     beiden sagt, dass der Zugang aus einer SELBSTANMELDUNG kam. Die Ablehnung
     hinterliesse ohne ihre Zeile gar keine Spur.
     KEIN NAME UND KEINE ADRESSE in beiden: anfrage.frei traegt den neuen
     Zugang als ziel, anfrage.ab gar keines.
     KEINE ZEILE FUER DIE ANFRAGE UND DIE BESTAETIGUNG -- das waeren die
     einzigen neben der gescheiterten Anmeldung, die ein Fremder ausloesen
     kann. */
  'anfrage.frei', 'anfrage.ab',
  /* 'schluessel' -- der Wechsel des Datenbankschluessels. Er
     laeuft ueber schluessel.js auf dem Wirt und traegt deshalb IMMER das leere
     `wer` von dort: "ueber den Wirt". Ein Handelnder stuende hier nur als
     Behauptung, denn wer den Befehl ausfuehren kann, koennte sie setzen.
     DIE ZEILE NENNT, DASS GEWECHSELT WURDE, NIE WOHIN. Kein Merkmal, kein
     Ziel, kein Wert -- weder der alte noch der neue. Das ist die schaerfste
     Auslegung des Merksatzes zu Kontrollausgaben, und sie gilt hier ohne jede
     Ausnahme: die eine Stelle, an der ein Schluessel zum Abschreiben steht,
     ist der Bildschirm des Wirts, nicht diese Tabelle. */
  /* 'zweifaktor.an', 'zweifaktor.aus' und 'zweifaktor.wieder'.
     DER DRITTE IST DER, AUF DEN ES ANKOMMT: ein verbrauchter
     Wiederherstellungscode ist die einzige Zeile im ganzen Protokoll, die
     sagt, dass jemandem das Telefon abhanden gekommen ist.
     KEIN VIERTER FUER DEN FALSCHEN CODE: eine gescheiterte zweite Stufe IST
     eine gescheiterte Anmeldung und schreibt 'anmeldung.fehl'.
     KEIN NEUES MERKMAL -- 'an' und 'aus' tragen den Betroffenen als wer UND
     als ziel. MERKMALE bleibt bei dreizehn. */
  'zweifaktor.an', 'zweifaktor.aus', 'zweifaktor.wieder',
  'export', 'import', 'sicherung', 'schluessel'
];
/* Die geschlossene Liste fuer merkmal. NICHTS ausserhalb davon kommt in die
   Tabelle -- damit ist "kein Freitext von aussen" baulich wahr und nicht bloss
   beabsichtigt. Wer einen Vorgang ergaenzt, ergaenzt hier oder nimmt null.
   'teil' SEIT 0.13.0 UND OHNE NUMMER: 0.12.4 schrieb "teil 1/5" hierher, und
   weil das kein Merkmal aus dieser Liste ist, fiel die GANZE Zeile weg -- ein
   Bestand, der in fuenf Teilen hinausging, hinterliess im Protokoll nichts.
   Die geschlossene Liste hat also gehalten, was sie zusagt; falsch war die
   Aufrufstelle. DIE NUMMER DES TEILS STEHT IM DATEINAMEN und gehoert nicht
   hierher: sie waere Freitext, und genau den gibt es in dieser Spalte nicht. */
const MERKMALE = ['user', 'admin', 'eigentuemer', 'aktiv', 'gesperrt',
                  'einladung', 'ruecksetzung', 'merge', 'replace',
                  'name', 'passwort', 'adresse', 'beides', 'teil'];

// Eine Frist, laenger als die dreissig Tage von Papierkorb und Tokenspur: ein
// Protokoll, das den Vorfall vergisst, bevor jemand ihn bemerkt, ist keins.
// Ein halbes Jahr deckt auch eine lange Abwesenheit ab.
const PROTOKOLL_TAGE = 180;
// Wie viele Zeilen die Karte hoechstens holt. Die GESAMTZAHL steht daneben,
// damit aus "hundert Zeilen" nicht "hundert Vorgaenge" gelesen wird.
const PROTOKOLL_GRENZE = 100;

const insProtokoll = db.prepare(
  'INSERT INTO sicherheitsprotokoll (was, wer, ziel, merkmal) VALUES (?, ?, ?, ?)');

/* WER HANDELT -- die Nummer des Angemeldeten oder VOM_WIRT fuer zugang.js.
   KEIN VORGABEWERT, und die Klemme darunter ist keine Zierde: ein vergessenes
   Argument waere still eine FALSCHAUSSAGE -- die Zeile behauptete dann, der
   Vorgang sei ueber den Wirt gelaufen. Dieselbe Ueberlegung wie bei qComments
   in server.js, nur mit umgekehrtem Vorzeichen: null ist hier ein gueltiger
   Wert, undefined nicht. */
const VOM_WIRT = 'wirt';
function handelnder(wer) {
  if (wer === VOM_WIRT) return null;
  const n = Number(wer);
  if (!Number.isInteger(n) || n <= 0)
    throw new Error('Dieser Vorgang braucht den Handelnden — eine Nummer oder VOM_WIRT.');
  return n;
}

/* Schreibt EINE Zeile. Die Rechtefrage steht hier ausdruecklich NICHT -- wer
   etwas darf, entscheidet server.js an der Route; zugang.js laeuft auf dem
   Wirt und hat ohnehin alles. Diese Funktion haelt nur fest.
   SIE WIRFT NIE. Ein Protokoll, das den Vorgang mitreisst, ueber den es
   berichten soll, waere schlimmer als keins -- geschrieben wird deshalb NACH
   dem Vorgang, und ein Fehlschlag geht ins Containerprotokoll.
   DIE BEIDEN LISTEN WERDEN GEPRUEFT, nicht vorausgesetzt: ein vertippter
   Vorgangsname faellt sonst erst auf, wenn ihn jemand in der Karte sucht. */
function protokolliere(was, { wer = null, ziel = null, merkmal = null } = {}) {
  try {
    if (!VORGAENGE.includes(was)) throw new Error(`Unbekannter Vorgang: ${was}`);
    if (merkmal != null && !MERKMALE.includes(merkmal))
      throw new Error(`Unbekanntes Merkmal: ${merkmal}`);
    const nr = (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n > 0 ? n : null;
    };
    insProtokoll.run(was, nr(wer), nr(ziel), merkmal);
  } catch (e) {
    console.error('[Kriterion] Sicherheitsprotokoll:', e.message);
  }
}

/* Dieselbe Bauform wie raeumeTokensAuf() und raeumePapierkorbAuf(): EINE
   Funktion, ZWEI Aufrufstellen -- beim Start und beim Oeffnen der Karte. Eine
   Instanz, die ein halbes Jahr durchlaeuft, raeumte sonst ein halbes Jahr lang
   nicht auf.
   EIN MODIFIKATOR, und er wird GEBUNDEN statt in den String geschrieben
   (Stolperstein 119). */
const delProtokollAlt = db.prepare("DELETE FROM sicherheitsprotokoll WHERE am < datetime('now', ?)");
function raeumeProtokollAuf() {
  const n = delProtokollAlt.run(`-${PROTOKOLL_TAGE} days`).changes;
  if (n) console.log(`[Kriterion] Sicherheitsprotokoll: ${n} Zeile(n) aelter als ` +
    `${PROTOKOLL_TAGE} Tage entfernt.`);
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
const PROTOKOLL_GRUPPEN = {
  // Die Ansicht, um die es geht: wer an der Tuer gescheitert ist. Beide Zeilen
  // sagen dasselbe -- jemand konnte nicht belegen, wer er ist.
  gescheitert: ['anmeldung.fehl', 'bestaetigung.fehl'],
  anmeldungen: ['anmeldung.ok'],
  zugaenge: ['zugang.neu', 'zugang.rolle', 'zugang.status', 'zugang.passwort',
             'zugang.weg', 'zugang.selbst', 'link.neu', 'link.ein',
             'anfrage.frei', 'anfrage.ab'],
  zweifaktor: ['zweifaktor.an', 'zweifaktor.aus', 'zweifaktor.wieder'],
  bestand: ['export', 'import', 'sicherung', 'schluessel']
};

const PROT_SPALTEN =
  `SELECT p.id, p.am, p.was, p.wer, p.ziel, p.merkmal,
          CASE WHEN uw.status = 'geloescht' THEN NULL ELSE uw.username END AS werName,
          CASE WHEN uz.status = 'geloescht' THEN NULL ELSE uz.username END AS zielName
     FROM sicherheitsprotokoll p
     LEFT JOIN users uw ON uw.id = p.wer
     LEFT JOIN users uz ON uz.id = p.ziel`;
const qProtokoll = db.prepare(`${PROT_SPALTEN} ORDER BY p.id DESC LIMIT ?`);
/* JE GRUPPE EINE VORBEREITETE ABFRAGE, beim Laden gebaut. Die Fragezeichen
   entstehen aus der GESCHLOSSENEN Liste und nie aus einer Anfrage; die Werte
   werden gebunden und nicht in den String geschrieben (Stolperstein 119). */
const qProtokollGruppe = Object.fromEntries(Object.entries(PROTOKOLL_GRUPPEN).map(([k, arten]) =>
  [k, db.prepare(`${PROT_SPALTEN} WHERE p.was IN (${arten.map(() => '?').join(',')})` +
                 ' ORDER BY p.id DESC LIMIT ?')]));
const qProtokollZahl = db.prepare('SELECT COUNT(*) n FROM sicherheitsprotokoll');
const qProtokollJeArt = db.prepare('SELECT was, COUNT(*) n FROM sicherheitsprotokoll GROUP BY was');

/* WELCHE GRUPPE WIE VIELE ZEILEN HAT -- die Zahlen an den Filterpillen. Sie
   zaehlen ueber die GANZE Tabelle und nicht ueber die geholten hundert: eine
   Zahl, die nur ihren eigenen Ausschnitt zaehlt, sagt genau das nicht, was man
   von ihr wissen will. */
function protokollZahlen() {
  const jeArt = Object.fromEntries(qProtokollJeArt.all().map(z => [z.was, z.n]));
  const raus = { alle: 0 };
  for (const [k, arten] of Object.entries(PROTOKOLL_GRUPPEN))
    raus[k] = arten.reduce((n, a) => n + (jeArt[a] || 0), 0);
  raus.alle = Object.values(jeArt).reduce((n, x) => n + x, 0);
  return raus;
}

/* `gruppe` ist ein Schluessel aus PROTOKOLL_GRUPPEN oder null fuer alle. Ein
   unbekannter Wert wird HIER nicht abgefangen -- die Route weist ihn ab, denn
   ein stillschweigendes "dann eben alles" saehe aus wie ein Erfolg. */
function leseProtokoll(grenze = PROTOKOLL_GRENZE, gruppe = null) {
  const zeilen = gruppe
    ? qProtokollGruppe[gruppe].all(...PROTOKOLL_GRUPPEN[gruppe], grenze)
    : qProtokoll.all(grenze);
  const zahlen = protokollZahlen();
  return {
    zeilen,
    // Die Zahl der Zeilen DIESER Ansicht -- sonst stuende unter einer
    // gefilterten Liste die Gesamtzahl aller Vorgaenge und widerspraeche ihr.
    gesamt: gruppe ? zahlen[gruppe] : qProtokollZahl.get().n,
    zahlen,
    gruppe: gruppe || null,
    tage: PROTOKOLL_TAGE,
    grenze
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
const FREIGABE_MS = 120 * 1000;
/* SIEBEN WEGE UEBER SECHS ROUTEN -- 'mail' kommt dazu. Wer den
   Mailzugang setzt, entscheidet, ueber wessen Server JEDER kuenftige
   Ruecksetzlink dieser Instanz laeuft; das trifft die Instanz als Ganzes und
   liegt damit in derselben Zeile wie Export und Import.
   Die Zahl steht im Projektstand und wird dort nachgezaehlt, nicht
   abgeschrieben -- Stolperstein 137. */
const BESTAETIGUNG_ZWECKE = ['export', 'import', 'rolle', 'passwort', 'entfernen', 'link', 'mail'];
/* DER SCHLUESSEL IST DIE GANZE BINDUNG: Sitzungstoken, Zweck und Ziel. Ein
   einziger Platz je Sitzung waere eine stille Falle -- eine Anfrage, die zwei
   Zwecke braucht (Rolle UND Passwort in einem Rumpf), verloere mit dem ersten
   Verbrauch den zweiten und schiene an der Schranke zu scheitern, obwohl beide
   bestaetigt waren. */
const freigaben = new Map(); // "token|zweck|ziel" -> Ablauf in ms

const freigabeZiel = (z) => {
  const n = Number(z);
  return Number.isInteger(n) && n > 0 ? n : null;
};
const freigabeSchluessel = (token, zweck, ziel) =>
  `${String(token)}|${zweck}|${freigabeZiel(ziel) ?? ''}`;

function erzeugeFreigabe(token, zweck, ziel) {
  if (!token) throw new Error('Eine Freigabe braucht die Sitzung.');
  if (!BESTAETIGUNG_ZWECKE.includes(zweck)) throw new Error('Diesen Zweck gibt es nicht.');
  freigaben.set(freigabeSchluessel(token, zweck, ziel), Date.now() + FREIGABE_MS);
  return { zweck, sekunden: FREIGABE_MS / 1000 };
}

/* Prueft UND verbraucht in einem. Zwei Funktionen -- eine, die nachsieht, und
   eine, die verbraucht -- waeren zwei Stellen, und die Route, die die zweite
   vergisst, saehe von aussen genauso aus wie die richtige.
   VERBRAUCHT WIRD AUCH DIE ABGELAUFENE: sonst bliebe sie liegen und ein
   zweiter Versuch sagte dasselbe. */
function verbraucheFreigabe(token, zweck, ziel) {
  if (!token) return false;
  const k = freigabeSchluessel(token, zweck, ziel);
  const bis = freigaben.get(k);
  if (bis === undefined) return false;
  freigaben.delete(k);
  return Date.now() <= bis;
}

// Mit der Sitzung fallen ihre Freigaben. Ohne das ueberlebten sie eine
// Abmeldung im Arbeitsspeicher und stuenden einer neuen Sitzung mit demselben
// Token -- den es zwar nicht zweimal gibt, aber eine Zusicherung, die von
// dieser Annahme lebt, ist keine.
function verwirfFreigabe(token) {
  if (!token) return;
  const vorn = `${String(token)}|`;
  for (const k of freigaben.keys()) if (k.startsWith(vorn)) freigaben.delete(k);
}

/* --- Der zweite Faktor ---------------------------------------------------
   WER WILL, SICHERT SEINEN ZUGANG MIT EINEM CODE AUS EINER APP AUF SEINEM
   TELEFON. Die Rechnung steht in zweifaktor.js; hier stehen die Zeilen und
   die Regeln darum herum.

   FREIWILLIG, JE ZUGANG, UND JEDER SCHALTET IHN FUER SICH SELBST EIN -- nicht
   aus Hoeflichkeit, sondern aus Bauart: EINSCHALTEN kann nur, wer das
   Geheimnis auf sein Telefon bekommt; ein Admin, der es fuer einen anderen
   taete, sperrte ihn aus. AUSSCHALTEN darf nur der Betroffene, sonst waere
   der zweite Faktor an der Rollenleiter vorbei abschaltbar. Der einzige Weg
   daneben ist zugang.js auf dem Wirt.

   DIE RECHTEFRAGE STEHT HIER AUSDRUECKLICH NICHT: welche Nummer
   hereingereicht wird, entscheidet server.js an der Route. */
const qZweifaktor = db.prepare(
  'SELECT user_id, geheim, bestaetigt_am, letzter_zaehler FROM zweifaktor WHERE user_id = ?');
const holeZweifaktor = (benutzerId) => qZweifaktor.get(Number(benutzerId) || 0) || null;

/* DIE EINE FRAGE, AN DER ALLES HAENGT: verlangt dieser Zugang einen zweiten
   Faktor? Sie sieht auf bestaetigt_am und nicht auf das Vorhandensein der
   Zeile -- ein angefangenes, nie bestaetigtes Einschalten darf niemanden
   aussperren. Genau daran kippte die Sache sonst: wer den Knopf drueckt, den
   Bildschirm schliesst und sich neu anmeldet, stuende vor einer Frage, deren
   Antwort auf keinem Telefon steht. */
const zweifaktorAn = (benutzerId) => {
  const z = holeZweifaktor(benutzerId);
  return Boolean(z && z.bestaetigt_am);
};

const qCodesOffen = db.prepare(
  'SELECT COUNT(*) n FROM zweifaktor_codes WHERE user_id = ? AND benutzt_am IS NULL');
const qCodesGesamt = db.prepare('SELECT COUNT(*) n FROM zweifaktor_codes WHERE user_id = ?');

/* WAS DIE KARTE SIEHT -- UND DAS GEHEIMNIS IST NIE DARIN. Dieselbe Linie wie
   beim Mailpasswort: die Karte sagt "an" oder "aus", nie den Wert, nie die
   Laenge, nie den Anfang. Was sie zusaetzlich sagt, ist die ZAHL der uebrigen
   Wiederherstellungscodes -- "noch 6 von 8". Sie verraet nichts und ist das
   Einzige, was rechtzeitig warnt, bevor der letzte verbraucht ist. */
function zweifaktorStand(benutzerId) {
  const id = Number(benutzerId) || 0;
  const z = holeZweifaktor(id);
  if (!z || !z.bestaetigt_am) return { an: false, seit: null, codesOffen: 0, codesGesamt: 0 };
  return {
    an: true, seit: z.bestaetigt_am,
    codesOffen: qCodesOffen.get(id).n, codesGesamt: qCodesGesamt.get(id).n
  };
}

/* DIE EINE ABSAGE. Falsch, abgelaufen, aus dem uebernaechsten Fenster, schon
   verbraucht, ein erfundener Wiederherstellungscode -- alles dasselbe Wort.
   Dieselbe Ueberlegung wie beim Token: das Heilmittel ist in jedem
   dieser Faelle dasselbe, naemlich einen frischen Code vom Telefon ablesen.
   "Der Code ist abgelaufen" waere ausserdem eine Auskunft an den, der raet --
   er wuesste, dass er die richtige Ziffernfolge hat und nur zu spaet war. */
const ZWEITER_FAKTOR_ABSAGE = 'Der Code stimmt nicht.';

/* SCHRITT EINS: das Geheimnis entsteht und geht EINMAL ueber das Netz --
   danach nie wieder, auch nicht an den Eigentuemer.

   NOCH IST NICHTS EINGESCHALTET: bestaetigt_am bleibt leer, bis ein Code aus
   dem Telefon belegt, dass die App dasselbe rechnet.

   EIN ZWEITER AUFRUF ERSETZT DAS ANGEFANGENE GEHEIMNIS. AN EINEM BESTAETIGTEN
   FAKTOR WIRD ABGEWIESEN: erst ausschalten -- sonst waere dieser Knopf der
   Weg, einen laufenden zweiten Faktor aus einer uebernommenen Sitzung heraus
   gegen einen eigenen zu tauschen. */
function beginneZweifaktor(benutzerId, instanzName, benutzername) {
  const id = Number(benutzerId) || 0;
  if (zweifaktorAn(id)) throw new Error('Der zweite Faktor ist bereits eingeschaltet.');
  const geheim = zf.neuesGeheimnis();
  db.prepare(
    `INSERT INTO zweifaktor (user_id, geheim, bestaetigt_am, letzter_zaehler)
     VALUES (?, ?, NULL, NULL)
     ON CONFLICT(user_id) DO UPDATE SET
       geheim = excluded.geheim, bestaetigt_am = NULL, letzter_zaehler = NULL,
       created_at = datetime('now')`
  ).run(id, geheim);
  return {
    geheim, gruppen: zf.inVierergruppen(geheim),
    zeile: zf.otpauthZeile(instanzName, benutzername, geheim),
    ziffern: zf.ZIFFERN, sekunden: zf.SCHRITT_SEKUNDEN
  };
}

/* Legt WIEDER_ZAHL frische Codes an und liefert die KLARTEXTE genau einmal
   zurueck -- danach stehen sie nirgends mehr, auch nicht in der Datenbank.
   EINE TRANSAKTION: entweder sind die alten fort UND die neuen da, oder es hat
   sich nichts bewegt. Ein halber Satz waere schlimmer als der alte. */
const insCode = db.prepare(
  'INSERT INTO zweifaktor_codes (hash, user_id) VALUES (?, ?)');
function legeWiederCodesAn(benutzerId) {
  const id = Number(benutzerId) || 0;
  const klartexte = zf.neueWiederCodes();
  db.transaction(() => {
    db.prepare('DELETE FROM zweifaktor_codes WHERE user_id = ?').run(id);
    // tokenHash() WIRD WIEDERVERWENDET und nicht ein zweites Mal geschrieben:
    // zwei Ausfertigungen derselben Rechnung liefen beim naechsten Griff
    // auseinander. Dieselbe Ueberlegung wie bei der Selbstanmeldung.
    for (const k of klartexte) insCode.run(tokenHash(k), id);
  })();
  return klartexte.map(zf.wiederAnzeige);
}

/* SCHRITT ZWEI: ein gueltiger Code aus dem Telefon schaltet ein. Erst hier
   entstehen die Wiederherstellungscodes -- vorher waeren sie ein Zettel fuer
   einen Faktor, den es womoeglich nie gibt.
   DER BESTAETIGENDE CODE ZAEHLT ALS VERBRAUCHT. Ohne das truege er unmittelbar
   danach ein zweites Mal, naemlich an der ersten Anmeldung, und "ein Code gilt
   genau einmal" waere an seiner ersten Anwendung falsch. */
function schalteZweifaktorEin(benutzerId, eingabe, wer, jetzt = Date.now()) {
  const id = Number(benutzerId) || 0;
  const z = holeZweifaktor(id);
  if (!z) throw new Error('Es ist kein zweiter Faktor angefangen.');
  if (z.bestaetigt_am) throw new Error('Der zweite Faktor ist bereits eingeschaltet.');
  const zaehler = zf.pruefeCode(z.geheim, eingabe, jetzt);
  if (zaehler === null) throw new Error(ZWEITER_FAKTOR_ABSAGE);
  db.prepare(
    `UPDATE zweifaktor SET bestaetigt_am = datetime('now'), letzter_zaehler = ?
      WHERE user_id = ?`).run(zaehler, id);
  const codes = legeWiederCodesAn(id);
  protokolliere('zweifaktor.an', { wer: handelnder(wer), ziel: id });
  return { ...zweifaktorStand(id), codes };
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
const verbraucheZaehler = db.prepare(
  `UPDATE zweifaktor SET letzter_zaehler = ?
    WHERE user_id = ? AND (letzter_zaehler IS NULL OR letzter_zaehler < ?)`);
const verbraucheWieder = db.prepare(
  `UPDATE zweifaktor_codes SET benutzt_am = datetime('now')
    WHERE hash = ? AND user_id = ? AND benutzt_am IS NULL`);
function pruefeZweitenFaktor(benutzerId, eingabe, jetzt = Date.now()) {
  const id = Number(benutzerId) || 0;
  const z = holeZweifaktor(id);
  if (!z || !z.bestaetigt_am) return null;
  if (zf.istCodeform(eingabe)) {
    const zaehler = zf.pruefeCode(z.geheim, eingabe, jetzt);
    if (zaehler === null) return null;
    if (!verbraucheZaehler.run(zaehler, id, zaehler).changes) return null;
    return 'app';
  }
  if (zf.istWiederform(eingabe)) {
    const hash = tokenHash(zf.wiederNormal(eingabe));
    if (!verbraucheWieder.run(hash, id).changes) return null;
    /* DIE EINZIGE ZEILE IM PROTOKOLL, DIE SAGT, DASS EIN TELEFON WEG IST. Sie
       steht HIER und nicht an der Route: es gibt drei Rufer (Anmeldung,
       Tokenweg, zweite Bestaetigung), und drei Ausfertigungen derselben Zeile
       liefen auseinander. wer und ziel sind derselbe Mensch -- er handelt an
       sich selbst, wie beim Einloesen eines Links. */
    protokolliere('zweifaktor.wieder', { wer: id, ziel: id });
    return 'wieder';
  }
  return null;
}

/* Frische Wiederherstellungscodes fuer den, der seine verbraucht hat. Hinter
   Passwort UND gueltigem Code -- die Route stellt beides sicher.
   DER FALL, DEN NIEMAND PLANT, IST DER LETZTE VERBRAUCHTE CODE. Ohne diesen Weg
   bliebe dafuer nur zugang.js auf dem Wirt; mit ihm sieht der Betroffene an
   der Karte, dass es eng wird ("noch 1 von 8"), und holt sich neue. */
function erneuereWiederCodes(benutzerId) {
  const id = Number(benutzerId) || 0;
  if (!zweifaktorAn(id)) throw new Error('Der zweite Faktor ist nicht eingeschaltet.');
  return legeWiederCodesAn(id);
}

/* Ausschalten. ALLEIN DER BETROFFENE -- oder zugang.js auf dem Wirt, und das
   ist am leeren `wer` zu erkennen.
   BEIDE TABELLEN IN EINER TRANSAKTION: ein Faktor ohne Codes oder Codes ohne
   Faktor waeren beide ein halber Zustand.
   LIEFERT ja/nein: war gar keiner an, ist nichts geschehen, und der Aufrufer
   soll das sagen koennen. */
function schalteZweifaktorAus(benutzerId, wer) {
  const id = Number(benutzerId) || 0;
  if (!holeZweifaktor(id)) return false;
  db.transaction(() => {
    db.prepare('DELETE FROM zweifaktor WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM zweifaktor_codes WHERE user_id = ?').run(id);
  })();
  protokolliere('zweifaktor.aus', { wer: handelnder(wer), ziel: id });
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
const ANMELDE_AUSWEIS_MS = FREIGABE_MS;
const ausweise = new Map(); // schluessel -> { id, bis }

function erzeugeAnmeldeAusweis(benutzerId) {
  const id = Number(benutzerId);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Ein Ausweis braucht einen Zugang.');
  // Beim Anlegen einmal durchsehen. Die Karte waechst sonst mit jeder
  // Anmeldung, die zwischen den beiden Schritten abgebrochen wird -- und wer
  // sie fuellen will, braucht dafuer jedes Mal das richtige Passwort.
  const jetzt = Date.now();
  for (const [k, a] of ausweise) if (a.bis <= jetzt) ausweise.delete(k);
  const schluessel = crypto.randomBytes(32).toString('hex');
  ausweise.set(schluessel, { id, bis: jetzt + ANMELDE_AUSWEIS_MS });
  return { ausweis: schluessel, sekunden: ANMELDE_AUSWEIS_MS / 1000 };
}

/* Prueft UND verbraucht in einem, wie verbraucheFreigabe. Zwei Funktionen --
   eine, die nachsieht, und eine, die verbraucht -- waeren zwei Stellen, und die
   Route, die die zweite vergisst, saehe von aussen genauso aus wie die richtige.
   VERBRAUCHT WIRD AUCH DER ABGELAUFENE: sonst bliebe er liegen und ein zweiter
   Versuch sagte dasselbe. */
function verbraucheAnmeldeAusweis(schluessel) {
  const k = String(schluessel || '');
  if (!k) return null;
  const a = ausweise.get(k);
  if (a === undefined) return null;
  ausweise.delete(k);
  return Date.now() <= a.bis ? a.id : null;
}

// Liefert den Benutzer hinter dem Cookie oder null. Der JOIN ist die Aussage:
// eine Sitzung ohne Benutzer gilt nicht -- bliebe doch eine herrenlose Zeile
// liegen, waere sie ein Schluessel zu niemandem.
// Nebenwirkung mit Absicht: der Zugriff frischt last_seen auf.
function sitzungsBenutzer(token) {
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
const sessionCookie = (req, t) =>
  `${cookieName(req)}=${t}; HttpOnly; Path=/; SameSite=Lax` +
  `${ueberProxy(req) ? '; Secure' : ''}; Max-Age=${SESSION_DAYS * 86400}`;
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
const sitzungsToken = (req) => parseCookies(req)[cookieName(req)];

// req.benutzer ist ab hier fuer jeden geschuetzten Endpunkt gesetzt:
// { id, username, role, status }. Genau EINE Abfrage je Anfrage.
// Der Status wird hier durchgesetzt -- zweite von zwei Stellen neben der
// Anmelderoute; ohne diese bliebe ein gerade gesperrter Zugang bis zum Ablauf
// seines Cookies drin. 401 und nicht 403: der Zugang gilt nicht mehr.
function requireAuth(req, res, next) {
  const token = sitzungsToken(req);
  const benutzer = sitzungsBenutzer(token);
  if (!benutzer) {
    return res.status(401).json({ error: 'Nicht angemeldet' });
  }
  if (benutzer.status !== 'aktiv') {
    destroySession(token);
    return res.status(401).json({
      error: benutzer.status === 'geloescht'
        ? 'Diesen Zugang gibt es nicht mehr.'
        : 'Dieser Zugang ist gesperrt.'
    });
  }
  req.benutzer = benutzer;
  next();
}

module.exports = {
  COOKIE_NAME, COOKIE_SICHER, cookieName, sitzungsToken, ueberProxy,
  HINTER_PROXY, PASSWORT_MIN, SESSION_DAYS,
  OEFFENTLICHE_ADRESSE, pruefeOeffentlicheAdresse, parseCookies, pruefeAnmeldung, legeSitzungAn, destroySession,
  sitzungsBenutzer, pruneSessions, sessionCookie, clearCookie, requireAuth,
  clientIp, checkThrottle, noteFailure, noteSuccess,
  // Meine Sitzungen und die Token; Rufer ist server.js.
  sitzungsKennung, sitzungenVon, beendeSitzung, beendeAndereSitzungen,
  TOKEN_TAGE, TOKEN_SPUR_TAGE, TOKEN_ZWECKE, TOKEN_FRIST_MINUTEN, tokenHash,
  raeumeTokensAuf, erzeugeToken, pruefeToken, loeseTokenEin, beginneTokenFrist,
  // Die Selbstanmeldung; Rufer ist server.js.
  ANFRAGE_STUNDEN, ANFRAGE_DECKEL, ANFRAGE_NAME_MAX, ANFRAGE_MAIL_MAX,
  zaehleAnfragen, raeumeAnfragenAuf,
  legeAnfrageAn, bestaetigeAnfrage, listeAnfragen, holeAnfrage, entferneAnfrage,
  // Das Sicherheitsprotokoll; Rufer sind server.js und zugang.js.
  VORGAENGE, MERKMALE, PROTOKOLL_TAGE, PROTOKOLL_GRENZE, PROTOKOLL_GRUPPEN, VOM_WIRT,
  protokolliere, raeumeProtokollAuf, leseProtokoll,
  // Die zweite Bestaetigung.
  BESTAETIGUNG_ZWECKE, FREIGABE_MS, erzeugeFreigabe, verbraucheFreigabe, verwirfFreigabe,
  // Der zweite Faktor; Rufer sind server.js und zugang.js.
  ZWEITER_FAKTOR_ABSAGE, ANMELDE_AUSWEIS_MS,
  zweifaktorAn, zweifaktorStand, beginneZweifaktor, schalteZweifaktorEin,
  pruefeZweitenFaktor, erneuereWiederCodes, schalteZweifaktorAus,
  erzeugeAnmeldeAusweis, verbraucheAnmeldeAusweis,
  holeBenutzer, holeBenutzerNachNamen, benutzerVorhanden, legeErstenBenutzerAn, aendereZugang,
  hashePasswort, pruefePasswort,
  // Zugangsverwaltung; Rufer sind server.js und zugang.js.
  ROLLEN, ZUSTAENDE, grabsteinName, GRABSTEIN_MUSTER,
  holeZugang, listeZugaenge, zahlEigentuemer,
  legeZugangAn, setzeNeuesPasswort, setzeRolle, setzeStatus, zaehleBestand, entferneZugang
};
