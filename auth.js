const crypto = require('crypto');
const { db, ordneBestandZu } = require('./db');

/* EINE EINSTELLUNG, FUENF WIRKUNGEN.

   Ein Kopf vom Aufrufer ist nie eine Feststellung, sondern eine Behauptung.
   X-Forwarded-For darf nur dort geglaubt werden, wo ausdruecklich eingestellt
   ist, dass ein Proxy davorsteht -- sonst setzt ihn der Aufrufer bei jedem
   Versuch neu und bekommt bei jedem Versuch einen frischen Zaehler; die
   Anmeldebremse je Adresse greift dann nie.

   HINTER_PROXY=1 (an):  X-Forwarded-For wird gelesen, der Keks traegt Secure
                         und das Praefix __Host-, HSTS wird gesetzt.
   fehlt (aus, Vorgabe): allein req.socket.remoteAddress. Der richtige Zustand
                         fuer "direkt im Heimnetz, Port 3100".

   Umgebungsvariable und nicht settings-Tabelle: sie entscheidet ueber
   Netzwerkvertrauen, nicht ueber eine Vorliebe. Ein uebernommener
   Admin-Zugang koennte sie sonst selbst umlegen.

   EINE ADRESSLISTE, WER DEN KOPF SETZEN DARF, IST BEWUSST NICHT GEBAUT: die
   Einstellung ist ein Ja/Nein, kein Adressbuch. Ist die Anlage je aus
   mehreren Netzen gleichzeitig erreichbar, gehoert das nachgeliefert. */
const HINTER_PROXY = /^(1|true|ja|an|yes|on)$/i.test(String(process.env.HINTER_PROXY || '').trim());

/* Der Keksname haengt an der Einstellung: das Praefix __Host- ist eine
   Zusage des Namens an den Browser -- nur ueber HTTPS gesetzt, ohne Domain,
   mit Path=/ -- und ohne Secure verwuerfe der Browser den Keks stillschweigend.
   WER DIE EINSTELLUNG UMLEGT, MELDET DAMIT ALLE EINMALIG AB: der alte Name
   wird nicht mehr gelesen. Kein Datenverlust, nur eine neue Anmeldung. */
const COOKIE_NAME = HINTER_PROXY ? '__Host-kriterion_session' : 'kriterion_session';
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

// Gleiche Rechnung, aber ohne Ereignisschleife -- nur fuer den Startvorgang,
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
// und ist damit wieder frei -- "die Beitraege bleiben stehen, aber ohne den
// Namen" laesst sich nicht anders einhalten. Die Zahl ist die alte id, und
// genau die steht auch in user_id: die Oberflaeche kann daraus
// "Geloeschter Benutzer 7" bilden, ohne dass irgendwo ein Name aufbewahrt wird.
const grabsteinName = (id) => `geloescht-${id}`;
// Damit ein lebender Zugang nicht wie ein Grabstein aussehen kann. Der Preis
// dieser Namensvergabe, ehrlich benannt: das Muster ist als Benutzername
// gesperrt.
const GRABSTEIN_MUSTER = /^geloescht-\d+$/i;

// Der EIGENTUEMER mit der kleinsten Nummer -- wer ihn ruft, meint den
// Eigentuemer der Anlage, nie den Angemeldeten (dafuer gibt es req.benutzer).
// Gefragt wird die ROLLE, nicht die kleinste id: sonst nennte das Protokoll
// einen geloeschten Zugang als Eigentuemer.
const holeBenutzer = () =>
  db.prepare("SELECT id, username, password_hash FROM users " +
             "WHERE role = 'eigentuemer' ORDER BY id LIMIT 1").get() || null;

// Der Kandidat zur Anmeldung. Die Spalte traegt COLLATE NOCASE, das Suchen
// findet also auch eine abweichende Schreibweise -- entschieden wird trotzdem
// erst danach mit safeEqual, und das vergleicht Zeichen fuer Zeichen. Damit
// bleibt die Anmeldung genau so streng wie vorher; die Abfrage sucht nur den
// Kandidaten heraus, den es vorher zwangslaeufig nur einmal gab.
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
// einen zweiten Aufruf. Die Rolle steht fest auf 'eigentuemer': wer die Anlage
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
  // Anlage lief es ins Leere, weil es noch keinen Benutzer gab -- dieser Weg
  // liefert ihn erst jetzt nach.
  ordneBestandZu();
  return { id: r.lastInsertRowid, username: String(name).trim() };
}

// Aendert Name und/oder Passwort DES ANGEMELDETEN Benutzers. Das bisherige
// Passwort ist Pflicht -- sonst genuegte eine fremde offene Sitzung, um den
// Zugang zu uebernehmen. Die Klemme am Anfang ist die einzige Schicht gegen
// einen Aufruf ohne Benutzer-Id: better-sqlite3 buende eine fehlende Nummer
// sonst still als NULL.
async function aendereZugang(benutzerId, altesPasswort, neuerName, neuesPasswort) {
  const id = Number(benutzerId);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error('Ein Zugangswechsel braucht den angemeldeten Benutzer.');
  const u = db.prepare('SELECT id, username, password_hash FROM users WHERE id = ?').get(id);
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
  db.prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?').run(name, hash, u.id);
  return { username: name, passwortGewechselt: wechselt };
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
const listeZugaenge = () => db.prepare(
  `SELECT u.id, u.username, u.role, u.status, u.last_login, u.created_at,
          (SELECT COUNT(*) FROM items i WHERE i.user_id = u.id) AS eintraege
     FROM users u ORDER BY u.id`
).all();

// Zaehlt die Eigentuemer, die sich noch anmelden koennen. Ein gesperrter oder
// geloeschter zaehlt nicht mit -- sonst liesse sich die Anlage verriegeln,
// indem man den letzten Eigentuemer sperrt statt ihn herabzustufen.
const zahlEigentuemer = () => db.prepare(
  "SELECT COUNT(*) AS n FROM users WHERE role = 'eigentuemer' AND status = 'aktiv'"
).get().n;

async function legeZugangAn(name, passwort, rolle = 'user') {
  pruefeVorgaben(name, passwort);
  if (!ROLLEN.includes(rolle)) throw new Error('Diese Rolle gibt es nicht.');
  const sauber = String(name).trim();
  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE').get(sauber))
    throw new Error('Diesen Benutzernamen gibt es bereits.');
  const hash = await hashePasswort(passwort);
  const r = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
    .run(sauber, hash, rolle);
  return { id: r.lastInsertRowid, username: sauber, role: rolle };
}

// Setzt ein Passwort ohne das bisherige zu kennen -- fuer den Admin, der es
// zuruecksetzt, und fuer zugang.js. Die Sitzungen fallen dabei ALLE: wer ein
// fremdes Passwort neu setzt, will den bisherigen Inhaber draussen haben.
async function setzeNeuesPasswort(benutzerId, neuesPasswort) {
  const u = holeZugang(benutzerId);
  if (!u) throw new Error('Diesen Zugang gibt es nicht.');
  if (u.status === 'geloescht') throw new Error('Dieser Zugang ist gelöscht.');
  if (String(neuesPasswort || '').length < PASSWORT_MIN)
    throw new Error(`Das Passwort muss mindestens ${PASSWORT_MIN} Zeichen lang sein.`);
  const hash = await hashePasswort(neuesPasswort);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, u.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
  return { id: u.id, username: u.username };
}

function setzeRolle(benutzerId, rolle) {
  const u = holeZugang(benutzerId);
  if (!u) throw new Error('Diesen Zugang gibt es nicht.');
  if (u.status === 'geloescht') throw new Error('Dieser Zugang ist gelöscht.');
  if (!ROLLEN.includes(rolle)) throw new Error('Diese Rolle gibt es nicht.');
  // Der letzte Eigentuemer darf nicht verschwinden -- weder durch Herabstufen
  // noch weiter unten durch Sperren oder Loeschen. Ohne ihn kaeme niemand mehr
  // an Rollen, Export und Import, und der einzige Ausweg waere zugang.js.
  if (u.role === 'eigentuemer' && rolle !== 'eigentuemer' && zahlEigentuemer() <= 1)
    throw new Error('Das ist der letzte Eigentümer der Anlage — vorher einen zweiten bestimmen.');
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(rolle, u.id);
  return { id: u.id, username: u.username, role: rolle };
}

function setzeStatus(benutzerId, status) {
  const u = holeZugang(benutzerId);
  if (!u) throw new Error('Diesen Zugang gibt es nicht.');
  if (u.status === 'geloescht') throw new Error('Dieser Zugang ist gelöscht.');
  if (status !== 'aktiv' && status !== 'gesperrt')
    throw new Error('Dieser Status lässt sich hier nicht setzen.');
  if (u.role === 'eigentuemer' && status !== 'aktiv' && zahlEigentuemer() <= 1)
    throw new Error('Das ist der letzte Eigentümer der Anlage — vorher einen zweiten bestimmen.');
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, u.id);
  // Erste von zwei Schichten. requireAuth wuerde eine laufende Sitzung ohnehin
  // abweisen; das Wegraeumen haelt die Tabelle sauber und wirkt sofort.
  if (status !== 'aktiv') db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
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
    // SEINE Beitraege in FREMDEN Eintraegen -- das zweite Haekchen
    kommentare: eins(`SELECT COUNT(*) n FROM comments WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    bewertungen: eins(`SELECT COUNT(*) n FROM ratings WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id),
    testtage: eins(`SELECT COUNT(*) n FROM test_days WHERE user_id = ? AND item_id NOT IN (${seine})`, id, id)
  };
}

/* Der Grabstein. Die Zeile wird NICHT entfernt -- sie bleibt mit ihrer id
   stehen, damit user_id weiterhin auf etwas zeigt und die Beitraege sichtbar
   bleiben, nur ohne Namen. Entfernte man sie, machte ON DELETE SET NULL den
   Bestand herrenlos und ordneBestandZu() schoebe ihn beim naechsten Start still
   dem Eigentuemer zu: fremde Aussagen unter fremdem Namen.
   Mitgeloescht wird, was rein persoenlich ist: Sitzungen, Favoriten,
   Einstellungen. Inhalte nur auf ausdrueckliche Ansage. */
function entferneZugang(benutzerId, optionen = {}) {
  const u = holeZugang(benutzerId);
  if (!u) throw new Error('Diesen Zugang gibt es nicht.');
  if (u.status === 'geloescht') throw new Error('Dieser Zugang ist bereits gelöscht.');
  if (u.role === 'eigentuemer' && zahlEigentuemer() <= 1)
    throw new Error('Das ist der letzte Eigentümer der Anlage — vorher einen zweiten bestimmen.');
  const zahlen = zaehleBestand(u.id);
  db.transaction(() => {
    // Reihenfolge: erst die Eintraege, dann der Rest. Umgekehrt zaehlte das
    // zweite Haekchen Zeilen mit, die das erste ohnehin mitgenommen haette.
    if (optionen.eintraege) db.prepare('DELETE FROM items WHERE user_id = ?').run(u.id);
    if (optionen.beitraege) {
      db.prepare('DELETE FROM comments WHERE user_id = ?').run(u.id);
      db.prepare('DELETE FROM ratings WHERE user_id = ?').run(u.id);
      db.prepare('DELETE FROM test_days WHERE user_id = ?').run(u.id);
    }
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM item_pins WHERE user_id = ?').run(u.id);
    db.prepare('DELETE FROM user_settings WHERE user_id = ?').run(u.id);
    db.prepare("UPDATE users SET username = ?, password_hash = '', role = 'user', " +
               "status = 'geloescht', email = NULL WHERE id = ?")
      .run(grabsteinName(u.id), u.id);
  })();
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
// Ohne Sperre laesst sich ein Passwort beliebig oft raten. Der Zaehler darf
// im Arbeitsspeicher liegen; ein Neustart als Ruecksetzung ist hinnehmbar.
//
// Gezaehlt wird ZWEIMAL -- je IP und je Benutzername.
// Die IP-Bremse allein sieht verteiltes Raten gegen EINEN Namen nicht: zehn
// Rechner mit je neun Versuchen bleiben unter jeder Schwelle.
//
// DER NAME WIRD NUR VERZOEGERT, NIE GESPERRT, und das ist der ganze
// Unterschied zur IP. Eine harte Namenssperre waere ein Werkzeug gegen fremde
// Zugaenge: wer "faruk" kennt, sperrte ihn mit zehn falschen Passwoertern fuer
// fuenf Minuten aus. Eine wachsende Verzoegerung bremst das Raten genauso und
// laesst den Richtigen durch -- er wartet hoechstens vier Sekunden.
// Die Kennwerte selbst sind unveraendert.
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

   Ohne Proxy zaehlt allein die tatsaechliche Verbindung. Der Kopf wird nicht
   einmal angesehen; er koennte nur luegen.

   Mit Proxy zaehlt der LETZTE Eintrag der Kette und nicht der erste: ein
   Proxy haengt die Gegenstelle, die er wirklich sieht, hinten an. Alles davor
   kann der Aufrufer selbst hineingeschrieben haben -- genau der erste Eintrag
   also, den die alte Fassung nahm. */
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
function parseCookies(req) {
  const h = req.headers.cookie;
  if (!h) return {};
  const out = {};
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) { crypto.timingSafeEqual(ba, ba); return false; }
  return crypto.timingSafeEqual(ba, bb);
}

// Liefert die Benutzerzeile oder null -- nicht mehr ja/nein. Die Sitzung muss
// wissen, WER sich da angemeldet hat; sie hinterher ueber "der erste Benutzer"
// zu erraten waere heute richtig und morgen falsch.
// Der Status wird hier NICHT geprueft. Ein gesperrter Zugang soll
// erfahren, dass er gesperrt ist -- das darf er
// aber erst, wenn er sein Passwort richtig eingegeben hat. Sonst waere die
// Meldung ein Werkzeug zum Durchprobieren von Benutzernamen. Die Entscheidung
// faellt deshalb eine Ebene hoeher, in der Anmelderoute.
async function pruefeAnmeldung(name, passwort) {
  const u = holeBenutzerNachNamen(name);
  // Auch ohne Zugang wird gerechnet, sonst verraet die Antwortzeit, ob der
  // Benutzername stimmt. Ein GRABSTEIN traegt einen leeren Hash -- ohne den
  // Rueckfall auf den Blindwert waere er messbar schneller abgewiesen als ein
  // lebender Zugang mit falschem Passwort.
  const nameStimmt = u ? safeEqual(name || '', u.username) : false;
  const passwortStimmt = await pruefePasswort(passwort || '',
    (u && u.password_hash) ? u.password_hash : BLINDWERT);
  return (nameStimmt && passwortStimmt) ? u : null;
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
  return token;
}

function destroySession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

function pruneSessions() {
  db.prepare(`DELETE FROM sessions WHERE last_seen < datetime('now', '-${SESSION_DAYS} days')`).run();
}

// Liefert den Benutzer hinter dem Keks oder null. Der JOIN ist die Aussage:
// eine Sitzung ohne Benutzer gilt nicht. Im Betrieb kann es sie nicht geben --
// beim Anlegen ist die Id Pflicht, bestehende wurden beim Umstieg nachgezogen,
// und mit dem Benutzer gehen seine Sitzungen ueber die Kaskade mit. Bliebe doch
// eine herrenlose Zeile liegen, waere sie ein Schluessel zu niemandem.
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

// Secure haengt an derselben Einstellung wie der gelesene Kopf: wer hinter
// einem Proxy betreibt, hat HTTPS und soll den Keks nie im Klartext schicken.
// Ohne Proxy darf es NICHT gesetzt werden -- der Browser verwuerfe den Keks
// bei http://<adresse>:3100, und niemand kaeme mehr herein.
const SICHER = HINTER_PROXY ? '; Secure' : '';
const sessionCookie = (t) =>
  `${COOKIE_NAME}=${t}; HttpOnly; Path=/; SameSite=Lax${SICHER}; Max-Age=${SESSION_DAYS * 86400}`;
const clearCookie = () => `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax${SICHER}; Max-Age=0`;

// req.benutzer ist ab hier fuer jeden geschuetzten Endpunkt gesetzt:
// { id, username, role, status }. Genau EINE Abfrage je Anfrage: wer den
// Benutzer braucht, nimmt req.benutzer und fragt die Datenbank nicht noch
// einmal. Der Status wird hier durchgesetzt -- zweite von zwei Stellen neben
// der Anmelderoute; ohne diese bliebe ein gerade gesperrter Zugang bis zum
// Ablauf seines Kekses drin. 401 und nicht 403: der Zugang gilt nicht mehr,
// die Oberflaeche gehoert auf die Anmeldeseite.
function requireAuth(req, res, next) {
  const token = parseCookies(req)[COOKIE_NAME];
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
  COOKIE_NAME, HINTER_PROXY, PASSWORT_MIN, parseCookies, pruefeAnmeldung, legeSitzungAn, destroySession,
  sitzungsBenutzer, pruneSessions, sessionCookie, clearCookie, requireAuth,
  clientIp, checkThrottle, noteFailure, noteSuccess,
  holeBenutzer, holeBenutzerNachNamen, benutzerVorhanden, legeErstenBenutzerAn, aendereZugang,
  hashePasswort, pruefePasswort,
  // Zugangsverwaltung; Rufer sind server.js und zugang.js.
  ROLLEN, ZUSTAENDE, grabsteinName, GRABSTEIN_MUSTER,
  holeZugang, listeZugaenge, zahlEigentuemer,
  legeZugangAn, setzeNeuesPasswort, setzeRolle, setzeStatus, zaehleBestand, entferneZugang
};
