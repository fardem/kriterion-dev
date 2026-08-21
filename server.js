const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const anh = require('./anhaenge');
// Eine Quelle fuer die Versionsnummer: die package.json. Die fuehrende Null
// sagt, dass sich noch alles aendern darf; die Veroeffentlichung bekaeme 1.0.0.
const VERSION = require('./package.json').version;
const sharp = require('sharp');
const { db, DATA_DIR, DB_FILE, keyFromEnv, keyHex, renumberCriteria } = require('./db');
const auth = require('./auth');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json({ limit: '2mb' }));
// Gilt fuer die ganze Anwendung: der Browser darf den Typ nie selbst erraten.
app.use((req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); next(); });
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^image\//.test(file.mimetype) ? cb(null, true) : cb(new Error('Nur Bilddateien sind erlaubt'))
});

const touch = db.prepare(`UPDATE items SET updated_at = datetime('now') WHERE id = ?`);
/* "bearbeitet" am Kommentar. EINE Stelle fuer beide Bildwege -- anhaengen und
   entfernen sind dieselbe Aussage ueber denselben Menschen, und zwei Anweisungen
   desselben Wortlauts liefen frueher oder spaeter auseinander.
   updated_at ist eine Aussage UEBER DEN VERFASSER: nur er loest es aus. Der
   Eingriff eines Admins setzt es nie -- sonst saehe seine Loeschung aus wie eine
   Bearbeitung durch den Verfasser. Am Kommentartext steht dieselbe Regel
   ausgeschrieben in PUT /api/comments/:id. */
const kommentarBearbeitet = db.prepare(`UPDATE comments SET updated_at = datetime('now') WHERE id = ?`);
const getSetting = (k, fallback) => {
  const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(k);
  if (!r) return fallback;
  try { return JSON.parse(r.value); } catch { return r.value; }
};
const putSettingS = db.prepare(
  'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
);
// Die Schranke gegen die zweite Wahrheit: ein persoenlicher Schluessel, der in
// die globale Tabelle geschrieben wird, gilt still fuer alle statt fuer den,
// der ihn gesetzt hat -- und solange nur einer angemeldet ist, faellt das
// niemandem auf. Deshalb hier laut statt still.
const putSetting = { run: (k, v) => {
  if (PERSOENLICHE_SCHLUESSEL.includes(k))
    throw new Error(`'${k}' ist persoenlich und gehoert nicht in die globale Tabelle`);
  putSettingS.run(k, v);
} };

/* ---- Persoenliche Einstellungen ---- */
// Die persoenliche Haelfte von settings. Die Liste wird zur Laufzeit von der
// Schranke oben gelesen -- eine Liste, die nur der Pruefstand ansieht, loescht
// der Naechste als unbenutzt weg.
const PERSOENLICHE_SCHLUESSEL = ['filters', 'schrift', 'bloecke', 'linkZeilen', 'zeitleiste', 'suchNamen'];

// DIE KLEMME IST DIE EINZIGE SCHICHT: better-sqlite3 bindet ein fehlendes
// Argument STILL als NULL, und `WHERE user_id = NULL` ist in SQL nie wahr.
// Ohne die Klemme lieferte eine vergessene Aufrufstelle wortlos die Vorgaben
// statt zu scheitern.
const getUserSetting = (benutzerId, k, fallback) => {
  if (benutzerId == null)
    throw new Error(`getUserSetting('${k}') ohne Benutzer aufgerufen`);
  const r = db.prepare('SELECT value FROM user_settings WHERE user_id = ? AND key = ?')
    .get(benutzerId, k);
  if (!r) return fallback;
  try { return JSON.parse(r.value); } catch { return r.value; }
};
const putUserSettingS = db.prepare(
  'INSERT INTO user_settings (user_id, key, value) VALUES (?, ?, ?) ' +
  'ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value'
);
// Dieselbe Klemme auch auf dem Schreibweg: ein stilles INSERT mit user_id NULL
// scheiterte zwar am NOT NULL, aber erst in der Datenbank und mit einer
// Meldung, die nicht sagt, wer den Benutzer vergessen hat.
const putUserSetting = (benutzerId, k, wert) => {
  if (benutzerId == null)
    throw new Error(`putUserSetting('${k}') ohne Benutzer aufgerufen`);
  putUserSettingS.run(benutzerId, k, wert);
};

/* ================= Bildableitungen ================= */
const VARIANTS = { thumb: { px: 400, q: 78 }, medium: { px: 1600, q: 84 } };
async function makeVariants(buf) {
  const out = {};
  for (const [name, v] of Object.entries(VARIANTS)) {
    try {
      out[name] = await sharp(buf, { failOn: 'none' }).rotate()
        .resize(v.px, v.px, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: v.q, mozjpeg: true }).toBuffer();
    } catch { out[name] = null; }
  }
  return out;
}

/* ================= Speicherpflege ================= */
function reclaim() {
  try { db.pragma('incremental_vacuum'); db.pragma('wal_checkpoint(TRUNCATE)'); } catch {}
}

/* ================= Oeffentlich ================= */
// Liefert ausschliesslich den Titel VOR der Anmeldung. Der zweite Titel darf
// hier unter keinen Umstaenden auftauchen.
// Die Versionsnummer ist nichts Schuetzenswertes -- sie steht auch vor der
// Anmeldung, damit die Anmeldeseite sie zeigen kann.
app.get('/api/config', (req, res) => {
  // setupRequired sagt nur, DASS noch eingerichtet werden muss -- nie etwas
  // ueber den Bestand. Wer die Seite aufruft, saehe es ohnehin.
  res.json({
    title: getSetting('title_public', 'Bewertungskatalog'), version: VERSION,
    setupRequired: !auth.benutzerVorhanden(), minPassword: auth.PASSWORT_MIN
  });
});

// Erste Einrichtung. Steht vor der Anmeldung, weil es dahinter noch nichts
// gibt -- und ist genau deshalb nur solange offen, wie kein Zugang existiert.
app.post('/api/setup', async (req, res) => {
  if (auth.benutzerVorhanden()) {
    return res.status(409).json({ error: 'Die Einrichtung ist bereits abgeschlossen.' });
  }
  const { user, password } = req.body || {};
  let angelegt;
  try {
    angelegt = await auth.legeErstenBenutzerAn(user, password);
  } catch (e) { return res.status(400).json({ error: e.message }); }
  // Gleich angemeldet: ein zweites Formular unmittelbar nach dem ersten waere
  // nur eine Huerde ohne Gewinn.
  res.set('Set-Cookie', auth.sessionCookie(auth.legeSitzungAn(angelegt.id)));
  res.json({ ok: true });
});

app.post('/api/login', async (req, res) => {
  const ip = auth.clientIp(req);
  const { user, password } = req.body || {};
  // Gezaehlt wird je IP UND je Name. Die IP sperrt hart, der Name verzoegert
  // nur -- sonst waere die Bremse ein Werkzeug, um einen bekannten Zugang
  // auszusperren. Die Begruendung steht in auth.js.
  const t = auth.checkThrottle(ip, user);
  if (t.blocked) {
    return res.status(429).json({
      error: `Zu viele Fehlversuche. Bitte in ${t.retryInSec} Sekunden erneut versuchen.`
    });
  }
  if (t.delayMs) await new Promise(r => setTimeout(r, t.delayMs));

  const benutzer = await auth.pruefeAnmeldung(user, password);
  if (!benutzer) {
    auth.noteFailure(ip, user);
    return res.status(401).json({ error: 'Benutzername oder Passwort stimmt nicht.' });
  }
  /* Erste von zwei Stellen: ein gesperrter Zugang kommt nicht herein.
     ERST HIER, nach der Passwortpruefung, und das ist der ganze Punkt: ein
     gesperrter Zugang soll erfahren, dass er gesperrt ist -- sonst liest sich
     das wie ein falsches Passwort und der Betroffene probiert weiter, bis die
     Bremse zuschlaegt. Vor der Pruefung waere dieselbe Meldung ein Werkzeug
     zum Durchprobieren von Namen.
     Kein noteFailure: das Passwort war richtig, es ist kein Fehlversuch. */
  if (benutzer.status !== 'aktiv') {
    return res.status(403).json({
      error: benutzer.status === 'geloescht'
        ? 'Diesen Zugang gibt es nicht mehr.'
        : 'Dieser Zugang ist gesperrt. Der Admin kann ihn wieder freigeben.'
    });
  }
  auth.noteSuccess(ip, user);
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(auth.legeSitzungAn(benutzer.id)));
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  auth.destroySession(auth.parseCookies(req)[auth.COOKIE_NAME]);
  res.set('Set-Cookie', auth.clearCookie());
  res.json({ ok: true });
});

// Bewusst nur ja/nein: der Endpunkt liegt VOR der Anmeldung und darf ueber den
// Benutzer nichts verraten. Deshalb das Boolean um die Zeile herum.
app.get('/api/session', (req, res) => {
  res.json({ authenticated: Boolean(auth.sitzungsBenutzer(auth.parseCookies(req)[auth.COOKIE_NAME])) });
});

/* ================= Ab hier geschuetzt ================= */
app.use('/api', auth.requireAuth);

/* ================= Rechte ================================================
   EIN Ort fuer die Regel, mehrere Eingaenge: stuende die Rollenfrage zweimal
   im Quelltext, liefen die Stellen auseinander und keine Gegenprobe belegte
   mehr etwas. Deshalb steht sie GENAU EINMAL, naemlich in der Adminfrage
   unten; ein Waechter im Pruefstand zaehlt die Vorkommen und wird bei zweien
   rot.

   Drei Rollen als Leiter -- user < admin < eigentuemer:
     Benutzer    -- role = 'user'. Schreibt eigene Beitraege, sonst nichts.
     Admin       -- role = 'admin'. Verwaltet: Kriterien, Tags, Kategorien,
                    Titel, Vokabular, Suchanbieter. Loescht fremde Beitraege.
                    Legt BENUTZER an, sperrt und loescht sie -- an einen Admin
                    oder Eigentuemer kommt er nicht.
     Eigentuemer -- role = 'eigentuemer'. Alles vom Admin, dazu: Rollen
                    vergeben, an Admins ran, und was die Anlage als GANZES
                    betrifft -- Export, Import, Schluesselwert.
   Der Eigentuemer ist ein vergebbares Recht, keine Nummer; die Begruendung
   fuer einen dritten Rollenwert statt eines zweiten Feldes steht in db.js am
   Schema.

   Vier Fragen, vier Antworten -- und keine davon steht ein zweites Mal:
     Adminfrage / Eigentuemerfrage -- wer ist der Anfragende
     darfAendern-Frage             -- Verfasser ODER Admin
     nurSelbst-Frage               -- Verfasser, und ausdruecklich der Admin NICHT

   Solange nur ein Zugang besteht, verweigert nichts davon etwas: der Einzige
   ist Eigentuemer und Admin zugleich.
   Der Reihenfolge wegen: die Eigentuemerfrage steht ZUERST, weil die
   Adminfrage sie ruft. Damit ist "ein Eigentuemer ist immer auch Admin"
   baulich wahr und keine Regel, die irgendwo durchgesetzt werden muesste.
   Beide fragen nur req.benutzer -- keine Datenbankabfrage je Anfrage. */
function istEigentuemer(req) { return req.benutzer.role === 'eigentuemer'; }
function istAdmin(req) { return req.benutzer.role === 'admin' || istEigentuemer(req); }

const VERWEIGERT_ADMIN = 'Das verwaltet nur der Admin.';
const VERWEIGERT_EIGEN = 'Das kann nur der Eigentümer der Anlage.';
const VERWEIGERT_EINTRAG = 'Diesen Eintrag ändert nur, wer ihn angelegt hat — oder der Admin.';
const VERWEIGERT_SELBST = 'Das ändert nur, wer es geschrieben hat.';
const VERWEIGERT_TAG_NEU = 'Neue Tags legt nur der Admin an. Vorhandene lassen sich weiterhin vergeben.';
const VERWEIGERT_KAT_NEU = 'Neue Kategorien legt nur der Admin an. Vorhandene lassen sich weiterhin wählen.';

function nurAdmin(req, res, next) {
  if (!istAdmin(req)) return res.status(403).json({ error: VERWEIGERT_ADMIN });
  next();
}

function nurEigentuemer(req, res, next) {
  if (!istEigentuemer(req)) return res.status(403).json({ error: VERWEIGERT_EIGEN });
  next();
}

// Verfasser oder Admin. EINE HERRENLOSE ZEILE (user_id IS NULL) GEHOERT DEM
// ADMIN: ohne die Klemme auf null waere sie fuer jeden offen -- und genau die
// entsteht, wenn ein Fremdschluessel mit ON DELETE SET NULL zuschlaegt.
// ordneBestandZu() raeumt sie beim naechsten Start dem Eigentuemer zu; bis
// dahin darf sie nicht jedem gehoeren.
function darfAendern(req, verfasserId) {
  return istAdmin(req) || (verfasserId != null && verfasserId === req.benutzer.id);
}

// Nur der Verfasser -- und ausdruecklich auch der Admin nicht. Fuer alles, was
// eine fremde AUSSAGE umschriebe statt sie zu entfernen: Kommentartext, Note
// eines Testtags, Tags an einem fremden Testtag, Bilder an einem fremden
// Kommentar. Loeschen ja, umschreiben nein -- eine fremde Aussage unter
// fremdem Namen zu veraendern ist die Art Funktion, die man spaeter bereut.
function nurSelbst(req, verfasserId) {
  return verfasserId != null && verfasserId === req.benutzer.id;
}

/* Wer einen NEUEN Namen anlegen darf -- Tag oder Kategorie. Zwei globale
   Schalter, Vorgabe an, ABGELEITET BEIM LESEN: ein Schluessel, der nicht in
   settings steht, gilt als eingeschaltet. Damit braucht kein Bestand angefasst
   zu werden, es entsteht kein Umstiegscode, und zu 1.0 ist nichts
   zurueckzubauen.
   Der Unterschied zu den Kriterien: ein neuer Tag erscheint nur dort, wo man
   ihn hinsetzt, ein neues Kriterium ueberall. Deshalb ein Schalter und keine
   feste Regel -- der Nutzen kommt erst mit dem dritten Zugang, wenn einer
   "Alu" und der naechste "Aluminium" tippt und nur der Admin aufraeumen darf.
   DER ADMIN KOMMT IMMER DURCH: ihm gehoert das Umbenennen und Loeschen, und
   ein Schalter, den er erst umlegen muesste, um selbst etwas anzulegen, waere
   eine Schranke gegen sich selbst.
   DIE KLEMME SITZT AN JEDEM ANLEGEWEG HINTER DEM NACHSCHLAGEN DES VORHANDENEN
   NAMENS -- nur so bleibt "Zuweisen darf immer jeder" baulich wahr statt eine
   Behauptung. */
const freiAnlegen = (schluessel) => getSetting(schluessel, true) !== false;
function darfAnlegen(req, schluessel) {
  return istAdmin(req) || freiAnlegen(schluessel);
}

/* Alles, was an einem Eintrag haengt -- Fotos, Dateien, Links, Tags, Kategorie,
   die Merkmale --, richtet sich nach dem Verfasser DES EINTRAGS. Zwei Formen
   desselben Aufrufs, weil die Wege verschieden ankommen: die einen kennen die
   Eintragsnummer als :id, die anderen holen sie erst aus der Kindzeile. Beide
   fragen dieselbe Funktion; die Regel steht trotzdem nur einmal da. */
const qEintragVerfasser = db.prepare('SELECT user_id FROM items WHERE id = ?');

// true = weitermachen. Bei false ist die Antwort bereits geschrieben.
function eintragFrei(req, res, itemId) {
  const z = qEintragVerfasser.get(itemId);
  if (!z) { res.status(404).json({ error: 'Nicht gefunden' }); return false; }
  if (!darfAendern(req, z.user_id)) { res.status(403).json({ error: VERWEIGERT_EINTRAG }); return false; }
  return true;
}

function nurEintragVerfasser(req, res, next) {
  if (eintragFrei(req, res, req.params.id)) next();
}

// Die Felder von PUT /api/items/:id, die dem Verfasser gehoeren. `favorite`
// steht bewusst NICHT dabei: der Favorit ist persoenlich, jeder setzt seinen
// eigenen an jedem Eintrag. Deshalb sitzt die Klemme dort IM Rumpf und nicht
// vor der Route.
const NUR_VERFASSER_FELDER = ['title', 'description', 'rejected', 'tested', 'productCategoryId'];

/* Wer an einen fremden ZUGANG darf. Ein Admin ist der Sheriff im
   Dorf -- er legt Benutzer an, sperrt sie und loescht sie. An seinesgleichen
   kommt er nicht: koennte ein Admin einen anderen sperren, waere die
   Verwaltung ein Wettrennen, und der Schnellste bliebe allein uebrig.
   Die Regel steht hier und nirgends sonst; die vier Routen rufen sie. */
function darfAnZugang(req, ziel) {
  return ziel.role === 'user' ? istAdmin(req) : istEigentuemer(req);
}
const VERWEIGERT_ZUGANG = 'An einen Admin oder den Eigentümer kommt nur der Eigentümer der Anlage.';
const VERWEIGERT_ROLLE = 'Rollen vergibt nur der Eigentümer der Anlage.';
const VERWEIGERT_SELBST_ZUGANG = 'Den eigenen Zugang ändert man unter „Zugang“, nicht hier.';

/* ---- Zugang ---- */
// Der angemeldete Benutzer, nicht der erste: ab dem zweiten Zugang saehe
// sonst jeder den Namen des Eigentuemers.
app.get('/api/account', (req, res) => {
  res.json({ username: req.benutzer.username, minPassword: auth.PASSWORT_MIN });
});

app.put('/api/account', async (req, res) => {
  const { oldPassword, username, newPassword } = req.body || {};
  let ergebnis;
  try {
    // WESSEN Zugang. Ohne diese Angabe aenderte jeder den des Eigentuemers,
    // sobald er dessen Passwort raet.
    ergebnis = await auth.aendereZugang(req.benutzer.id, oldPassword, username, newPassword);
  } catch (e) { return res.status(400).json({ error: e.message }); }
  // Alle anderen Sitzungen DIESES Benutzers fallen. Wer das Passwort wechselt,
  // will meist genau das; die eigene bleibt, sonst wuerde man sich selbst
  // hinauswerfen. "AND user_id = ?" gehoert dazu: ohne die Klemme wirft ein
  // Passwortwechsel jeden anderen Benutzer gleich mit hinaus.
  const eigener = auth.parseCookies(req)[auth.COOKIE_NAME];
  db.prepare('DELETE FROM sessions WHERE token != ? AND user_id = ?')
    .run(eigener || '', req.benutzer.id);
  res.json(ergebnis);
});

/* ---- Zugaenge verwalten ----
   Die Vorgaenge selbst stehen in auth.js, weil zugang.js auf dem Wirt
   dieselben ruft -- zwei Wege zum selben Grabstein liefen auseinander.
   Hier steht nur, WER sie ausloesen darf. */

// Liest die Zielzeile und beantwortet in einem, ob der Anfragende an sie darf.
// true = weitermachen; bei false ist die Antwort bereits geschrieben.
// GEPRUEFT WIRD VOR JEDEM SCHREIBEN, in allen drei Routen -- eine Absage, die
// die halbe Aenderung schon geschrieben hat, waere schlimmer als keine.
function zielZugangFrei(req, res, id, selbstErlaubt = false) {
  const ziel = auth.holeZugang(id);
  if (!ziel) { res.status(404).json({ error: 'Diesen Zugang gibt es nicht.' }); return null; }
  if (ziel.status === 'geloescht') {
    res.status(400).json({ error: 'Dieser Zugang ist gelöscht.' }); return null;
  }
  if (!selbstErlaubt && ziel.id === req.benutzer.id) {
    res.status(403).json({ error: VERWEIGERT_SELBST_ZUGANG }); return null;
  }
  if (!darfAnZugang(req, ziel)) { res.status(403).json({ error: VERWEIGERT_ZUGANG }); return null; }
  return ziel;
}

app.get('/api/users', nurAdmin, (req, res) => {
  res.json({
    zugaenge: auth.listeZugaenge(),
    ich: req.benutzer.id,
    darfRollen: istEigentuemer(req),
    eigentuemer: auth.zahlEigentuemer()
  });
});

// Die Zahlen fuer den Loeschdialog. Lesend, deshalb kein Eintrag in F_ROUTEN.
app.get('/api/users/:id/bestand', nurAdmin, (req, res) => {
  const ziel = auth.holeZugang(req.params.id);
  if (!ziel) return res.status(404).json({ error: 'Diesen Zugang gibt es nicht.' });
  res.json({ username: ziel.username, ...auth.zaehleBestand(ziel.id) });
});

// Anlegen. Der Admin darf das -- aber nur BENUTZER: eine Rolle zu vergeben ist
// Sache des Eigentuemers, und ueber das Anlegen waere sie sonst fuer jeden
// Admin offen, ohne dass irgendwo "Rolle" steht. Dieselbe Ueberlegung wie beim
// Import, den eine Exportdatei sonst unter fremdem Namen schreiben liesse.
app.post('/api/users', nurAdmin, async (req, res) => {
  const { username, passwort, rolle } = req.body || {};
  const gewuenscht = rolle || 'user';
  if (gewuenscht !== 'user' && !istEigentuemer(req))
    return res.status(403).json({ error: VERWEIGERT_ROLLE });
  try {
    res.json(await auth.legeZugangAn(username, passwort, gewuenscht));
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

// Rolle, Status und Passwort. Drei Rechteklassen in einem Rumpf, alle vor dem
// ersten Schreiben geprueft:
//   Rolle    -- nur der Eigentuemer, und auch am eigenen Zugang (sich selbst
//               herabstufen ist erlaubt, solange ein anderer Eigentuemer bleibt;
//               das haelt auth.setzeRolle fest).
//   Status   -- Admin an Benutzern, Eigentuemer an allen, nie am eigenen.
//   Passwort -- dieselbe Regel wie Status. Das EIGENE laeuft ueber
//               PUT /api/account, wo das bisherige Passwort verlangt wird.
app.put('/api/users/:id', nurAdmin, async (req, res) => {
  const { rolle, status, passwort } = req.body || {};
  const nurRolle = rolle !== undefined && status === undefined && passwort === undefined;
  const ziel = zielZugangFrei(req, res, req.params.id, nurRolle);
  if (!ziel) return;
  if (rolle !== undefined && !istEigentuemer(req))
    return res.status(403).json({ error: VERWEIGERT_ROLLE });
  try {
    let ergebnis = { id: ziel.id, username: ziel.username };
    if (rolle !== undefined) ergebnis = { ...ergebnis, ...auth.setzeRolle(ziel.id, rolle) };
    if (status !== undefined) ergebnis = { ...ergebnis, ...auth.setzeStatus(ziel.id, status) };
    if (passwort !== undefined) { await auth.setzeNeuesPasswort(ziel.id, passwort); ergebnis.passwortGesetzt = true; }
    res.json(ergebnis);
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

// Entfernen heisst Grabstein: die Zeile bleibt mit ihrer Nummer stehen, die
// Beitraege bleiben sichtbar. Die beiden Haekchen sind Ausnahmen davon und
// stehen in der Abfrage, damit sie in der Adresse sichtbar sind.
app.delete('/api/users/:id', nurAdmin, (req, res) => {
  const ziel = zielZugangFrei(req, res, req.params.id);
  if (!ziel) return;
  try {
    res.json(auth.entferneZugang(ziel.id, {
      eintraege: req.query.eintraege === '1',
      beitraege: req.query.beitraege === '1'
    }));
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

/* ---- Titel (nach der Anmeldung) ---- */
app.get('/api/titles', (req, res) => res.json({
  publicTitle: getSetting('title_public', 'Bewertungskatalog'),
  appTitle: getSetting('title_app', 'Model Bewertungen')
}));

app.put('/api/titles', nurAdmin, (req, res) => {
  const p = (req.body.publicTitle || '').trim();
  const a = (req.body.appTitle || '').trim();
  if (!p || !a) return res.status(400).json({ error: 'Beide Titel müssen ausgefüllt sein.' });
  putSetting.run('title_public', JSON.stringify(p));
  putSetting.run('title_app', JSON.stringify(a));
  res.json({ publicTitle: p, appTitle: a });
});

/* ---- Einstellungen (Filterwahl, Vokabular, Schriftgroesse) ---- */
// Das Vokabular benennt die Oberflaeche um. Unter der Haube aendert sich
// nichts: Feldnamen in Datenbank und Export bleiben, damit aeltere
// Exportdateien einspielbar bleiben.
const VOKABULAR_VORGABE = {
  sacheEinzahl: 'Eintrag', sacheMehrzahl: 'Einträge',
  merkmalJa: 'Getestet', merkmalNein: 'Ungetestet',
  zeitpunktEinzahl: 'Testtag', zeitpunktMehrzahl: 'Testtage',
  berichtEinzahl: 'Bericht', berichtMehrzahl: 'Berichte',
  aufgabeEinzahl: 'Aufgabe', aufgabeMehrzahl: 'Aufgaben',
  aufgabeErledigt: 'Erledigt'
};
const SCHRIFT_STUFEN = [80, 90, 100, 110, 120];

// Anordnung und Einklappzustand der Bloecke in der Detailansicht. Verschoben
// wird nur innerhalb des jeweiligen Bereichs, deshalb zwei getrennte Listen.
const BLOCK_VORGABE = {
  seite: ['kategorie', 'tags', 'bewertung'],
  unten: ['beschreibung', 'testtage', 'links', 'dateien', 'kommentare']
};
const ALLE_BLOECKE = [...BLOCK_VORGABE.seite, ...BLOCK_VORGABE.unten];

// Unbekanntes fliegt raus, Fehlendes haengt sich in der Vorgabereihenfolge
// hinten an -- ein spaeter hinzugekommener Block taucht so von selbst auf.
function ordneBereich(gespeichert, vorgabe) {
  const sauber = (Array.isArray(gespeichert) ? gespeichert : [])
    .filter((k, i, a) => vorgabe.includes(k) && a.indexOf(k) === i);
  return [...sauber, ...vorgabe.filter(k => !sauber.includes(k))];
}

// Persoenlich. Anordnung und Einklappzustand gelten global ueber alle
// Eintraege hinweg -- aber je Benutzer, nicht fuer alle gemeinsam.
function bloecke(benutzerId) {
  const g = getUserSetting(benutzerId, 'bloecke', null) || {};
  return {
    seite: ordneBereich(g.seite, BLOCK_VORGABE.seite),
    unten: ordneBereich(g.unten, BLOCK_VORGABE.unten),
    zu: (Array.isArray(g.zu) ? g.zu : []).filter(k => ALLE_BLOECKE.includes(k))
  };
}

function vokabular() {
  const gespeichert = getSetting('vokabular', null) || {};
  const out = {};
  for (const [k, vorgabe] of Object.entries(VOKABULAR_VORGABE)) {
    const v = typeof gespeichert[k] === 'string' ? gespeichert[k].trim() : '';
    out[k] = v || vorgabe;   // leeres Feld faellt auf die Vorgabe zurueck
  }
  return out;
}
// Sichtbare Zeilen der Linkliste, bevor aufgeklappt werden muss.
const LINKZEILEN_STUFEN = [3, 5, 8, 12];
// Persoenlich.
const linkZeilen = (benutzerId) => {
  const n = Number(getUserSetting(benutzerId, 'linkZeilen', 5));
  return LINKZEILEN_STUFEN.includes(n) ? n : 5;
};
const zeitleisteAn = (benutzerId) => getUserSetting(benutzerId, 'zeitleiste', true) !== false;

/* ---- Suchanbieter ---- */
// Fuer Linkzeilen, die keine Adresse sind. Gespeichert wird eine Vorlage mit
// %s als Platzhalter; der Rohtext bleibt roh in der Datenbank, deshalb folgen
// vorhandene Suchzeilen einem spaeteren Anbieterwechsel von selbst.
//
// Die Liste steht hier und nicht in app.js: der Server speichert Schluessel,
// also muss er die Liste kennen. Eine Liste, eine Pruefung, eine Stelle --
// doppelt gehaltene Vorgaben pruefen sich nur halb.
const SUCHANBIETER = [
  { schluessel: 'google',    name: 'Google',       vorlage: 'https://www.google.com/search?q=%s' },
  { schluessel: 'bing',      name: 'Bing',         vorlage: 'https://www.bing.com/search?q=%s' },
  { schluessel: 'ddg',       name: 'DuckDuckGo',   vorlage: 'https://duckduckgo.com/?q=%s' },
  { schluessel: 'startpage', name: 'Startpage',    vorlage: 'https://www.startpage.com/sp/search?query=%s' },
  { schluessel: 'brave',     name: 'Brave Search', vorlage: 'https://search.brave.com/search?q=%s' },
  { schluessel: 'ecosia',    name: 'Ecosia',       vorlage: 'https://www.ecosia.org/search?q=%s' }
];
const SUCHE_VORGABE = SUCHANBIETER[0].vorlage;
// Drei Plaetze fuer eigene Anbieter. Der Schluessel haengt am Platz, nicht am
// Namen: sonst verloere ein Umbenennen den Standard und den Vorrat.
const EIGEN_PLAETZE = 3;
const eigenSchluessel = (i) => `eigen${i + 1}`;
// Vier Namen a 20 Zeichen sind auf dem Handy die Obergrenze.
const SUCHNAME_LAENGE = 20;
const SUCHNAMEN_STUFEN = [1, 2, 3, 4];

// Nur http und https, und der Platzhalter muss vorkommen. Die Vorlage ist
// Eingabe aus dem Systembereich und landet in einem window.open -- ohne diese
// Schranke waere javascript:%s moeglich. Geprueft wird zweimal, hier beim
// Speichern und noch einmal in der Oberflaeche vor dem Oeffnen.
const suchvorlageOk = (v) =>
  typeof v === 'string' && v.length <= 300 &&
  /^https?:\/\/[^\s]+$/i.test(v) && v.includes('%s');

// Ein Anbietername ist freier Text und wird als Beschriftung gerendert -- die
// erste Stelle in der Linkliste, an der das gilt. Maskiert wird in der
// Oberflaeche; hier faellt nur weg, was die Zeile zerreissen wuerde.
const suchnameSauber = (v) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, SUCHNAME_LAENGE) : '';

// Eigene Anbieter. Ein Platz zaehlt nur, wenn Name UND Vorlage dastehen --
// halb ausgefuellt gibt es ihn nicht, weder im Vorrat noch in der Auswahl.
function sucheEigene() {
  const g = getSetting('sucheEigene', null);
  const out = [];
  for (let i = 0; i < EIGEN_PLAETZE; i++) {
    const e = Array.isArray(g) ? g[i] : null;
    const name = suchnameSauber(e && e.name);
    const vorlage = e && typeof e.vorlage === 'string' ? e.vorlage.trim() : '';
    // Halb ausgefuellt gibt es nicht. Dieselbe Regel steht noch einmal im
    // Schreibweg (dort mit 400); von aussen ist dieser Leseweg deshalb nur
    // ueber einen von Hand in die Datenbank gesetzten halben Platz erreichbar.
    out.push(name && suchvorlageOk(vorlage) ? { name, vorlage } : null);
  }
  return out;
}

// Alle neun Plaetze in kanonischer Reihenfolge: sechs eingebaute, dann die
// eigenen. `vorhanden` sagt, ob der Platz ueberhaupt jemanden traegt.
function alleAnbieter() {
  const eigene = sucheEigene();
  return [
    ...SUCHANBIETER.map(a => ({ ...a, eigen: false, vorhanden: true })),
    ...eigene.map((e, i) => ({
      schluessel: eigenSchluessel(i), name: e ? e.name : '',
      vorlage: e ? e.vorlage : '', eigen: true, vorhanden: !!e
    }))
  ];
}

// Der Vorrat: Liste der Schluessel, Standard zuerst. sucheAktiv[0] ist die
// einzige Wahrheit darueber, wer Standard ist.
function suchVorrat() {
  const alle = alleAnbieter();
  const da = (k) => alle.some(a => a.schluessel === k && a.vorhanden);
  const gespeichert = getSetting('sucheAktiv', null);
  // Hier faellt ein weggefallener Anbieter aus dem Vorrat -- war er der
  // Standard, rueckt damit keys[0] nach. ACHTUNG: dieselbe Wirkung hat die
  // Klemme in schreibeVorrat; eine Gegenprobe muss beide zugleich zurueckbauen,
  // sonst bleibt sie gruen.
  let keys = Array.isArray(gespeichert)
    ? gespeichert.filter((k, i, a) => da(k) && a.indexOf(k) === i)
    : [];
  // Ein leerer Vorrat macht jede Suchzeile unbenutzbar: mindestens einer
  // bleibt drin, und das ist im Zweifel der eingebaute erste.
  if (!keys.length) keys = [SUCHANBIETER[0].schluessel];
  return keys;
}

// Was die Oberflaeche braucht: alle neun Plaetze mit Vorrat- und
// Standardkennzeichnung, in kanonischer Reihenfolge. Wer angezeigt wird und
// in welcher Reihenfolge, entscheidet allein `aktiv` und `standard`.
function suchAnbieter() {
  const vorrat = suchVorrat();
  return alleAnbieter().map(a => ({
    schluessel: a.schluessel, name: a.name, vorlage: a.vorlage,
    eigen: a.eigen, vorhanden: a.vorhanden,
    aktiv: vorrat.includes(a.schluessel),
    standard: vorrat[0] === a.schluessel
  }));
}

// Vorlage des Standardanbieters, nur fuer die Antwort an die Oberflaeche.
function suchvorlage() {
  const vorrat = suchVorrat();
  const treffer = alleAnbieter().find(a => a.schluessel === vorrat[0]);
  return treffer && suchvorlageOk(treffer.vorlage) ? treffer.vorlage : SUCHE_VORGABE;
}

// Schreibt den Vorrat, normalisiert: Standard zuerst, die uebrigen in
// kanonischer Reihenfolge. Damit gibt es nur eine Aussage ueber die
// Reihenfolge und nicht zwei, die sich widersprechen koennen.
function schreibeVorrat(standard, aktive) {
  const alle = alleAnbieter();
  const da = (k) => alle.some(a => a.schluessel === k && a.vorhanden);
  let menge = aktive.filter(da);
  // Zweite Schicht des Nachrueckens, siehe den Hinweis in suchVorrat.
  if (!da(standard)) standard = menge[0] || SUCHANBIETER[0].schluessel;
  if (!menge.includes(standard)) menge.push(standard);
  const rest = alle.map(a => a.schluessel)
    .filter(k => k !== standard && menge.includes(k));
  putSetting.run('sucheAktiv', JSON.stringify([standard, ...rest]));
}

// Zahl der Namen unter einer Suchzeile -- persoenlich, als einzige der vier
// Sucheinstellungen. Vorrat, eigene Anbieter und Startanbieter
// bleiben global und Sache des Admins: der Admin kuratiert, der
// Benutzer bestimmt die Dichte. Das Ziel des Zeilenklicks ist damit fuer alle
// gleich -- bei einem gemeinsamen Bestand richtig.
const suchNamen = (benutzerId) => {
  const n = Number(getUserSetting(benutzerId, 'suchNamen', 2));
  return SUCHNAMEN_STUFEN.includes(n) ? n : 2;
};

// Persoenlich.
const schriftgroesse = (benutzerId) => {
  const n = Number(getUserSetting(benutzerId, 'schrift', 100));
  return SCHRIFT_STUFEN.includes(n) ? n : 100;
};

// Die Antwort mischt beide Haelften; die Oberflaeche merkt davon nichts.
// Persoenlich sind filters, schrift, bloecke, linkZeilen, zeitleiste und
// suchNamen; global bleiben vokabular und die drei Sucheinstellungen (suche,
// sucheEigene, sucheAktiv). Fuer zwei Benutzer sieht dieselbe Antwort deshalb
// an sechs Stellen verschieden aus und an allen uebrigen gleich.
// Dazu drei abgeleitete Angaben, keine Einstellungen -- sie stehen in keiner
// der beiden Haelften und lassen sich nicht schreiben:
//   benutzerZahl: bei genau einem Zugang entfaellt die Durchschnittsspalte,
//     "3,4 · 1" ist keine Information. Geliefert wird die ZAHL, die Schwelle
//     entscheidet die Oberflaeche -- sonst stuende sie an zwei Orten.
//     Gezaehlt werden nur ZUGAENGE, DIE ES NOCH GIBT: ein Grabstein ist kein
//     zweiter Bewerter, und die Durchschnittsspalte haengt an dieser Zahl.
//   Adminfrage: die Verwaltungskarten halten sich danach. Kommt aus
//     req.benutzer, ausdruecklich NICHT aus holeBenutzer() -- das lieferte den
//     ERSTEN Benutzer, nicht den angemeldeten.
//   Eigentuemerfrage: die Kachel fuer Export und Import bekommt nur zu sehen,
//     wem die Anlage gehoert. Der Server verweigert beides ohnehin; das Feld
//     erspart der Oberflaeche eine zweite Wahrheit darueber.
// Sie haengen hier, weil ladeEinstellungen() beim Start ohnehin laeuft, auch
// beim Direkteinstieg auf einen Eintrag.
const qBenutzerZahl = db.prepare("SELECT COUNT(*) AS n FROM users WHERE status != 'geloescht'");

app.get('/api/settings', (req, res) => res.json({
  benutzerZahl: qBenutzerZahl.get().n,
  // Der eigene Name fuer die Kopfzeile. Er steht auch in GET /api/account --
  // das ist keine zweite Wahrheit, beide lesen dieselbe angemeldete Zeile.
  // Hier, weil ladeEinstellungen() beim Start ohnehin laeuft und die Kopfzeile
  // ihn damit ohne zweiten Abruf hat.
  name: req.benutzer.username,
  istAdmin: istAdmin(req),
  istEigentuemer: istEigentuemer(req),
  filters: getUserSetting(req.benutzer.id, 'filters', null),
  vokabular: vokabular(),
  schrift: schriftgroesse(req.benutzer.id),
  bloecke: bloecke(req.benutzer.id),
  linkZeilen: linkZeilen(req.benutzer.id),
  zeitleiste: zeitleisteAn(req.benutzer.id),
  suche: suchvorlage(),
  suchAnbieter: suchAnbieter(),
  suchNamen: suchNamen(req.benutzer.id),
  // Abgeleitet beim Lesen, nicht in der Datenbank nachgetragen. Die Oberflaeche
  // laesst danach die Zeile "+ neu anlegen" weg; die Auswahl aus dem
  // Vorhandenen bleibt in jedem Fall stehen.
  tagsFreiAnlegen: freiAnlegen('tagsFreiAnlegen'),
  kategorienFreiAnlegen: freiAnlegen('kategorienFreiAnlegen')
}));

app.put('/api/settings', (req, res) => {
  /* Die Antwort mischt zwei Haelften, die Rechte auch. Persoenliche
     Schluessel schreibt jeder fuer sich, alles andere -- Vokabular und
     Suchanbieter -- gehoert dem Admin: der Admin kuratiert, der Benutzer
     bestimmt die Dichte.
     ABGELEITET AUS EINER LISTE, nicht aus einer zweiten: was nicht persoenlich
     ist, ist Adminsache -- auch jeder Schluessel, der spaeter dazukommt. Eine
     zweite Liste daneben liefe auseinander.
     GEPRUEFT VOR DEM ERSTEN SCHREIBEN: eine Absage, die die persoenliche
     Haelfte schon geschrieben hat, waere schlimmer als gar keine. */
  const fremd = Object.keys(req.body || {}).filter(k => !PERSOENLICHE_SCHLUESSEL.includes(k));
  if (fremd.length && !istAdmin(req))
    return res.status(403).json({ error: VERWEIGERT_ADMIN });

  if (req.body.filters !== undefined)
    putUserSetting(req.benutzer.id, 'filters', JSON.stringify(req.body.filters));
  if (req.body.vokabular !== undefined) {
    const ein = req.body.vokabular || {};
    const sauber = {};
    for (const k of Object.keys(VOKABULAR_VORGABE)) {
      const v = typeof ein[k] === 'string' ? ein[k].trim().slice(0, 40) : '';
      sauber[k] = v || VOKABULAR_VORGABE[k];
    }
    putSetting.run('vokabular', JSON.stringify(sauber));
  }
  if (req.body.schrift !== undefined) {
    const n = Number(req.body.schrift);
    if (!SCHRIFT_STUFEN.includes(n))
      return res.status(400).json({ error: 'Diese Schriftgröße gibt es nicht.' });
    putUserSetting(req.benutzer.id, 'schrift', JSON.stringify(n));
  }
  if (req.body.bloecke !== undefined) {
    const ein = req.body.bloecke || {};
    putUserSetting(req.benutzer.id, 'bloecke', JSON.stringify({
      seite: ordneBereich(ein.seite, BLOCK_VORGABE.seite),
      unten: ordneBereich(ein.unten, BLOCK_VORGABE.unten),
      zu: (Array.isArray(ein.zu) ? ein.zu : []).filter(k => ALLE_BLOECKE.includes(k))
    }));
  }
  if (req.body.linkZeilen !== undefined) {
    const n = Number(req.body.linkZeilen);
    if (!LINKZEILEN_STUFEN.includes(n))
      return res.status(400).json({ error: 'Diese Zeilenzahl gibt es nicht.' });
    putUserSetting(req.benutzer.id, 'linkZeilen', JSON.stringify(n));
  }
  if (req.body.zeitleiste !== undefined)
    putUserSetting(req.benutzer.id, 'zeitleiste', JSON.stringify(!!req.body.zeitleiste));
  // Eigene Anbieter zuerst: ein frisch angelegter muss im selben Zug in den
  // Vorrat aufgenommen werden koennen.
  if (req.body.sucheEigene !== undefined) {
    const ein = Array.isArray(req.body.sucheEigene) ? req.body.sucheEigene : [];
    const sauber = [];
    for (let i = 0; i < EIGEN_PLAETZE; i++) {
      const e = ein[i] || {};
      const name = suchnameSauber(e.name);
      const vorlage = typeof e.vorlage === 'string' ? e.vorlage.trim() : '';
      if (!name && !vorlage) { sauber.push(null); continue; }   // Platz geraeumt
      // Halb ausgefuellt gibt es nicht -- und wortlos verschlucken erst recht
      // nicht, sonst sucht man den Anbieter spaeter in der Liste.
      if (!name)
        return res.status(400).json({ error: 'Ein eigener Suchanbieter braucht einen Namen.' });
      if (!suchvorlageOk(vorlage))
        return res.status(400).json({
          error: 'Die Vorlage muss mit http:// oder https:// beginnen und %s als Platzhalter enthalten.'
        });
      sauber.push({ name, vorlage });
    }
    putSetting.run('sucheEigene', JSON.stringify(sauber));
    // Faellt ein Anbieter weg, der im Vorrat oder sogar Standard war, raeumt
    // das Zurueckschreiben das auf: der erste aktive rueckt nach.
    const vorrat = suchVorrat();
    schreibeVorrat(vorrat[0], vorrat);
  }
  // Der Vorrat kommt als Liste von Schluesseln, Standard zuerst. Unbekannte
  // Schluessel und einen Standard ausserhalb des Vorrats richtet
  // schreibeVorrat gerade.
  if (req.body.sucheAktiv !== undefined) {
    const alle = alleAnbieter();
    const ein = (Array.isArray(req.body.sucheAktiv) ? req.body.sucheAktiv : [])
      .filter(k => typeof k === 'string' && alle.some(a => a.schluessel === k && a.vorhanden));
    // Den letzten aus dem Vorrat zu nehmen macht jede Suchzeile unbenutzbar.
    // Ersatzweise auf den eingebauten ersten zu wechseln waere schlimmer als
    // eine Absage: es hiesse, ab jetzt wortlos woanders zu suchen.
    if (!ein.length)
      return res.status(400).json({ error: 'Mindestens ein Suchanbieter muss in der Auswahl bleiben.' });
    schreibeVorrat(ein[0], ein);
  }
  if (req.body.suchNamen !== undefined) {
    const n = Number(req.body.suchNamen);
    if (!SUCHNAMEN_STUFEN.includes(n))
      return res.status(400).json({ error: 'Diese Zahl an Anbieternamen gibt es nicht.' });
    putUserSetting(req.benutzer.id, 'suchNamen', JSON.stringify(n));
  }
  // Die beiden Anlegen-Schalter sind global und damit Adminsache -- ueber die
  // Ableitung ganz oben, ohne zweite Liste und ohne eigene Route.
  for (const k of ['tagsFreiAnlegen', 'kategorienFreiAnlegen'])
    if (req.body[k] !== undefined) putSetting.run(k, JSON.stringify(!!req.body[k]));
  res.json({ filters: getUserSetting(req.benutzer.id, 'filters', null), vokabular: vokabular(),
             schrift: schriftgroesse(req.benutzer.id), bloecke: bloecke(req.benutzer.id),
             linkZeilen: linkZeilen(req.benutzer.id), zeitleiste: zeitleisteAn(req.benutzer.id),
             suche: suchvorlage(), suchAnbieter: suchAnbieter(),
             suchNamen: suchNamen(req.benutzer.id),
             tagsFreiAnlegen: freiAnlegen('tagsFreiAnlegen'),
             kategorienFreiAnlegen: freiAnlegen('kategorienFreiAnlegen') });
});

/* ---- Bewertungskriterien (Skala fest 1-5) ---- */
// Die Reihenfolge ist frei bestimmbar und gilt ueberall gleich: Detailansicht
// und Vergleich lesen beide aus derselben Sortierung.
//
// COUNT(DISTINCT r.item_id), nicht COUNT(*). Die Oberflaeche
// beschriftet diese Zahl mit dem Vokabelwort fuer Eintraege ("3 Eintraege") --
// und ab dem zweiten Bewerter sind Zeile und Eintrag nicht mehr dasselbe. Ein
// Kriterium, das drei Leute an EINEM Eintrag bewertet haben, meldete sonst
// drei. Die Zahl steht in der Verwaltungskarte neben dem Loeschknopf, also
// genau dort, wo sie die Entscheidung tragen soll.
// Die Bedingung value > 0 bleibt: ein zurueckgesetztes Kriterium hinterlaesst
// eine Zeile mit 0, und die ist keine Verwendung.
const qCriteria = db.prepare(`
  SELECT c.id, c.name, c.sort_order, c.created_at,
         (SELECT COUNT(DISTINCT r.item_id) FROM ratings r
           WHERE r.criterion_id = c.id AND r.value > 0) AS usage_count
  FROM rating_criteria c ORDER BY c.sort_order, c.id`);

/* --- Die Kriterien gehoeren dem Admin -------------------------------------
   Was an allen Eintraegen aller Benutzer erscheint, gehoert dem Admin: ein
   neues Kriterium erscheint sofort an jedem Eintrag auf jedem Bildschirm, ein
   geloeschtes nimmt ueberall die vergebenen Sterne mit. Deshalb liegen alle
   vier Wege hier hinter derselben Klemme -- anlegen, umbenennen, sortieren,
   loeschen.

   EIN benannter Waechter fuer vier Routen, nicht vier Abfragen. Er steht oben
   im Rechteblock hinter requireAuth und deckt von dort aus auch Titel, Tags
   und Kategorien mit ab -- die Regel steht nicht ein zweites Mal da.
   Solange nur ein Zugang besteht, verweigert er nichts: der Einzige ist immer
   auch Admin. */

app.get('/api/criteria', (req, res) => res.json(qCriteria.all()));

app.post('/api/criteria', nurAdmin, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name fehlt' });
  if (db.prepare('SELECT 1 FROM rating_criteria WHERE name = ? COLLATE NOCASE').get(name))
    return res.status(409).json({ error: 'Dieses Kriterium gibt es bereits.' });
  const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM rating_criteria').get().m + 1;
  const i = db.prepare('INSERT INTO rating_criteria (name, sort_order) VALUES (?, ?)').run(name, pos);
  res.status(201).json(db.prepare('SELECT * FROM rating_criteria WHERE id = ?').get(i.lastInsertRowid));
});

// Muss vor '/api/criteria/:id' stehen, sonst faengt der Platzhalter das Wort
// "order" als Id ab.
app.put('/api/criteria/order', nurAdmin, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE rating_criteria SET sort_order = ? WHERE id = ?');
  db.transaction(() => ids.forEach((cid, i) => s.run(i, cid)))();
  renumberCriteria();   // schliesst Luecken, falls nicht alle Ids mitkamen
  res.json(qCriteria.all());
});

app.put('/api/criteria/:id', nurAdmin, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name fehlt' });
  if (!db.prepare('SELECT 1 FROM rating_criteria WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Dieses Kriterium gibt es nicht mehr.' });
  const clash = db.prepare('SELECT id FROM rating_criteria WHERE name = ? COLLATE NOCASE AND id != ?')
    .get(name, req.params.id);
  if (clash) return res.status(409).json({ error: 'Diesen Namen gibt es bereits.' });
  db.prepare('UPDATE rating_criteria SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json(db.prepare('SELECT * FROM rating_criteria WHERE id = ?').get(req.params.id));
});

app.delete('/api/criteria/:id', nurAdmin, (req, res) => {
  db.prepare('DELETE FROM rating_criteria WHERE id = ?').run(req.params.id);
  renumberCriteria();
  res.status(204).end();
});

/* ---- Kategorien ---- */
app.get('/api/product-categories', (req, res) => res.json(db.prepare(`
  SELECT c.*, (SELECT COUNT(*) FROM items i WHERE i.product_category_id = c.id) AS usage_count
  FROM product_categories c ORDER BY c.name COLLATE NOCASE`).all()));

app.post('/api/product-categories', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name fehlt' });
  const found = db.prepare('SELECT * FROM product_categories WHERE name = ? COLLATE NOCASE').get(name);
  if (found) return res.json(found);
  // HINTER dem Nachschlagen: eine VORHANDENE Kategorie zuzuweisen bleibt fuer
  // jeden offen, nur ein NEUER Name haengt am Schalter. Stuende die Klemme
  // davor, naehme sie das Zuweisen mit.
  if (!darfAnlegen(req, 'kategorienFreiAnlegen'))
    return res.status(403).json({ error: VERWEIGERT_KAT_NEU });
  const i = db.prepare('INSERT INTO product_categories (name) VALUES (?)').run(name);
  res.status(201).json(db.prepare('SELECT * FROM product_categories WHERE id = ?').get(i.lastInsertRowid));
});

// Umbenennen und loeschen wirkt auf JEDEN Eintrag, der die Kategorie
// traegt -- also Adminsache, wie bei den Kriterien. Das ANLEGEN haengt am
// Schalter kategorienFreiAnlegen, Vorgabe an; zuweisen darf immer jeder.
app.put('/api/product-categories/:id', nurAdmin, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name fehlt' });
  if (!db.prepare('SELECT 1 FROM product_categories WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Diese Kategorie gibt es nicht mehr.' });
  const clash = db.prepare('SELECT id FROM product_categories WHERE name = ? COLLATE NOCASE AND id != ?')
    .get(name, req.params.id);
  if (clash) return res.status(409).json({ error: 'Diesen Namen gibt es bereits.' });
  db.prepare('UPDATE product_categories SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json(db.prepare('SELECT * FROM product_categories WHERE id = ?').get(req.params.id));
});

app.delete('/api/product-categories/:id', nurAdmin, (req, res) => {
  db.prepare('DELETE FROM product_categories WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

/* ---- Tags ---- */
// Beide Verwendungen getrennt: usage_count zaehlt Eintraege, test_usage_count
// Testtage. Getrennte Unterabfragen statt zweier JOINs -- die wuerden sich
// gegenseitig vervielfachen und beide Zahlen verfaelschen.
app.get('/api/tags', (req, res) => res.json(db.prepare(`
  SELECT t.*,
         (SELECT COUNT(*) FROM item_tags it WHERE it.tag_id = t.id) AS usage_count,
         (SELECT COUNT(*) FROM test_day_tags dt WHERE dt.tag_id = t.id) AS test_usage_count
  FROM tags t ORDER BY t.name COLLATE NOCASE`).all()));

app.put('/api/tags/:id', nurAdmin, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name fehlt' });
  if (!db.prepare('SELECT 1 FROM tags WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Diesen Tag gibt es nicht mehr.' });
  const clash = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE AND id != ?').get(name, req.params.id);
  if (clash) return res.status(409).json({ error: 'Diesen Tag gibt es bereits.' });
  db.prepare('UPDATE tags SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json(db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id));
});

app.delete('/api/tags/:id', nurAdmin, (req, res) => {
  db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

/* Nachschlagen und Anlegen sind ZWEI Schritte, weil die Klemme dazwischen
   gehoert: einen VORHANDENEN Tag zuzuweisen darf immer jeder, nur ein neuer
   Name haengt am Schalter. Ein gemeinsamer Helfer, der beides in einem Zug
   taete, truege die Klemme in seinem eigenen Rumpf -- und dann liesse sich an
   keinem der beiden Wege noch gegenpruefen, dass sie dort wirklich wirkt.
   Der Import geht an beiden vorbei: er gehoert dem Eigentuemer und legt seine
   Tags selbst an. */
function findeTag(name) {
  return db.prepare('SELECT * FROM tags WHERE name = ? COLLATE NOCASE').get(name.trim());
}

function legeTagAn(name) {
  const i = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name.trim());
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(i.lastInsertRowid);
}

// Tags AM EINTRAG gehoeren dem Verfasser und dem Admin.
// Ein Tag am Eintrag beschreibt den Eintrag, und die Kategorie
// faehrt ohnehin im selben PUT wie der Titel -- offen fuer alle hiesse, ein
// Fremder duerfte umkategorisieren, aber den Titel nicht geraderuecken. Wer
// etwas beizutragen hat, schreibt einen Kommentar.
app.post('/api/items/:id/tags', nurEintragVerfasser, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Tag-Name fehlt' });
  // Erst nachschlagen, dann die Klemme: einen vorhandenen Tag vergibt auch
  // hier jeder, der an den Eintrag darf. Die Wolke im Block bleibt deshalb
  // bedienbar, wenn der Schalter aus ist -- nur die Eingabezeile verschwindet.
  let tag = findeTag(name);
  if (!tag) {
    if (!darfAnlegen(req, 'tagsFreiAnlegen')) return res.status(403).json({ error: VERWEIGERT_TAG_NEU });
    tag = legeTagAn(name);
  }
  db.prepare('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)').run(req.params.id, tag.id);
  touch.run(req.params.id);
  res.status(201).json(detail(req.params.id, req.benutzer.id));
});

app.delete('/api/items/:id/tags/:tagId', nurEintragVerfasser, (req, res) => {
  db.prepare('DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?').run(req.params.id, req.params.tagId);
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

/* ================= Eintraege ================= */
const qAttachments = db.prepare(`SELECT id, filename, mime_type, size, sort_order, created_at
  FROM attachments WHERE item_id = ? ORDER BY sort_order, id`);
// Reihenfolge durchgaengig chronologisch, in Gruppen: Angepinntes zuerst
// (Anpinnen schlaegt die Art), dann Aufgaben, dann Berichte, dann Notizen.
// Innerhalb jeder Gruppe steht das Aelteste oben. Der gemischte Block der
// Angepinnten bleibt einer: dort entscheidet allein das Alter, nicht die Art.
// Zwei Bloecke mit gegenlaeufiger Zeitrichtung laesen sich schlechter; wer
// sein aktuelles Fazit oben haben will, pinnt es an.
// Sortiert wird nach id, nicht nach created_at: innerhalb eines Eintrags
// stimmen beide immer ueberein -- auch nach einem Import, der stets einen
// neuen Eintrag anlegt und dessen Kommentare in Dateireihenfolge schreibt.
// created_at kommt dagegen ungeprueft aus der Datei und hat nur
// Sekundenaufloesung.
const qCommentsRoh = db.prepare(`
  SELECT * FROM comments WHERE item_id = ?
  ORDER BY pinned DESC,
           CASE WHEN pinned = 1 THEN 0
                WHEN kind = 'task' THEN 0
                WHEN kind = 'report' THEN 1
                ELSE 2 END,
           id`);
// 'done' hat hier ABSICHTLICH keinen eigenen Zweig: ein erledigtes Todo faellt
// ueber das ELSE zu den Notizen und reiht sich dort nach Alter ein. Das ist
// keine vergessene Zeile -- wer sie "nachtraegt", aendert das Verhalten.
const qCommentImages = db.prepare(
  'SELECT id, filename, sort_order FROM comment_images WHERE comment_id = ? ORDER BY sort_order, id');

/* --- Aus einer Nummer wird ein Verfasser ----------------------------------
   EIN Ort, der das tut; die Gegenrichtung -- aus einem Namen eine Nummer --
   steht im Import und hat aus demselben Grund genau einen.

   Geliefert wird ein OBJEKT und nicht der blosse Name: ein Grabstein hat
   keinen Namen mehr, seine Zeile traegt geloescht-<nr>. Die Oberflaeche bildet
   daraus "Geloeschter Benutzer 7". So bleibt das Muster geloescht-<zahl> in
   auth.js und wandert nicht in einen zweiten Quelltext, wo beide Stellen
   auseinanderlaufen koennten.
   Eine HERRENLOSE Zeile (user_id IS NULL) bekommt ausdruecklich null; das Feld
   fehlt nie, sonst waere "diese Zeile hat keinen Verfasser" von "diese Antwort
   kennt das Feld noch nicht" nicht zu unterscheiden.

   Die Karte wird EINMAL je Anfrage gebaut und durchgereicht statt je Zeile
   nachzuschlagen: die Uebersicht traegt Eintraege und Testtage zugleich.
   Fuer die Karte steht hier bewusst KEINE Klemme wie bei benutzerId. Ein
   fehlendes Argument faellt hier von selbst laut auf -- `karte.get` gibt es
   dann nicht. Still wird nur eine fehlende SQL-Bindung. */
const qVerfasserZeilen = db.prepare('SELECT id, username, status FROM users');
function verfasserKarte() {
  const m = new Map();
  for (const u of qVerfasserZeilen.all()) {
    const weg = u.status === 'geloescht';
    // Der Grabsteinname geht NICHT hinaus. Er ist freigegeben und kann laengst
    // einem anderen Menschen gehoeren; eine Antwort, die ihn mitschickt, laedt
    // dazu ein, ihn irgendwann anzuzeigen. Was die Oberflaeche braucht, ist
    // die Nummer -- daraus wird "Geloeschter Benutzer 7".
    m.set(u.id, { id: u.id, name: weg ? null : u.username, geloescht: weg });
  }
  return m;
}
const verfasserAus = (karte, id) => (id == null ? null : (karte.get(id) || null));

/* Jeder Kommentar sagt, ob er MIR gehoert -- dasselbe Muster wie am Testtag
   und an der Stimme. Daran haengen fuenf Bedienelemente auf dem Bildschirm,
   und ohne diese Angabe muesste die Oberflaeche aus dem Verfasserobjekt
   zurueckrechnen, wem eine Zeile gehoert. Das waere eine zweite Wahrheit --
   und bei einem Grabstein (name: null) ginge es gar nicht.
   KEIN VORGABEWERT fuer benutzerId, und die Klemme darunter ist deshalb keine
   Zierde: better-sqlite3 bindet ein fehlendes Argument still als NULL, und
   `null === null` waere hier obendrein wahr -- eine vergessene Aufrufstelle
   erklaerte also wortlos jede herrenlose Zeile zur eigenen. */
function qComments(itemId, benutzerId, karte) {
  if (benutzerId == null) throw new Error('qComments() ohne Benutzer aufgerufen');
  const liste = qCommentsRoh.all(itemId);
  for (const c of liste) {
    c.pinned = !!c.pinned;
    c.images = qCommentImages.all(c.id);
    c.mine = c.user_id === benutzerId;
    c.verfasser = verfasserAus(karte, c.user_id);
    // Der Eingriffsvermerk. Eine EIGENE Angabe neben dem Text, nie in ihm --
    // ein Admin, der in ein fremdes Textfeld schriebe, taete genau das, was
    // ihm verwehrt ist.
    c.bilderEntfernt = c.images_removed;
    delete c.images_removed;
    delete c.user_id;
  }
  return liste;
}

const qPhotos = db.prepare('SELECT id, item_id, mime_type, focus_x, focus_y, sort_order, created_at FROM photos WHERE item_id = ? ORDER BY sort_order, id');
const qTags = db.prepare('SELECT t.* FROM tags t JOIN item_tags it ON it.tag_id = t.id WHERE it.item_id = ? ORDER BY t.name COLLATE NOCASE');
const qLinks = db.prepare('SELECT id, url, sort_order FROM links WHERE item_id = ? ORDER BY sort_order, id');
const qCat = db.prepare('SELECT id, name FROM product_categories WHERE id = ?');
/* --- Schnitt und Anzahl je Kriterium --------------------------------------
   EINE Abfrage, gruppiert -- ausdruecklich KEIN zweiter JOIN neben den, der in
   detail() die eigene Sternzeile holt. Zwei JOINs auf dieselbe Tabelle
   vervielfachen sich: drei Bewerter an einem Kriterium
   ergaeben dreimal dieselbe Zeile, und der Schnitt daraus waere zwar zufaellig
   richtig, der Zaehler aber neunfach. Deshalb hier gruppiert und drueben per
   Map angehaengt.
   Gezaehlt und gemittelt wird ueber Werte > 0, wie ueberall: ein
   zurueckgesetztes Kriterium hinterlaesst eine Zeile mit 0, und die ist keine
   Stimme. */
const qSchnittJeKriterium = db.prepare(`
  SELECT criterion_id, AVG(value * 1.0) AS schnitt, COUNT(*) AS anzahl
    FROM ratings WHERE item_id = ? AND value > 0 GROUP BY criterion_id`);

function schnitteJeKriterium(itemId) {
  const m = new Map();
  for (const z of qSchnittJeKriterium.all(itemId)) m.set(z.criterion_id, z);
  return m;
}

/* Wer welchen Wert vergeben hat -- je Kriterium eine Liste. Wieder eine EIGENE
   Abfrage und kein dritter JOIN neben den beiden darueber; die Begruendung
   steht bei qSchnittJeKriterium und gilt hier genauso.
   Nur Werte > 0, wie ueberall: ein zurueckgesetztes Kriterium hinterlaesst
   eine Zeile mit 0, und die ist keine Stimme.
   Die id steht mit dabei, weil sie der einzige Weg zu einer einzelnen fremden
   Bewertung ist -- ohne sie waere DELETE /api/ratings/:id vom Bildschirm aus
   nicht erreichbar.
   `mine` statt der Verfassernummer zum Vergleichen: dieselbe Ueberlegung wie
   am Testtag -- die Oberflaeche soll nicht selbst ausrechnen muessen, wem eine
   Zeile gehoert. Am eigenen Wert steht deshalb kein Loeschkreuz; dafuer gibt
   es die Sterne und den Ruecksetzer. */
const qStimmenRoh = db.prepare(`
  SELECT id, criterion_id, user_id, value FROM ratings
   WHERE item_id = ? AND value > 0 ORDER BY criterion_id, id`);

function stimmenJeKriterium(itemId, benutzerId, karte) {
  if (benutzerId == null) throw new Error('stimmenJeKriterium() ohne Benutzer aufgerufen');
  const m = new Map();
  for (const z of qStimmenRoh.all(itemId)) {
    if (!m.has(z.criterion_id)) m.set(z.criterion_id, []);
    m.get(z.criterion_id).push({
      id: z.id, wert: z.value, mine: z.user_id === benutzerId,
      verfasser: verfasserAus(karte, z.user_id)
    });
  }
  return m;
}

// Gesamtschnitt: erst je Kriterium ueber alle Benutzer, dann ueber die
// Kriterien. NICHT flach ueber alle Bewertungszeilen -- sonst zaehlte ein
// Kriterium, das drei Leute bewertet haben, dreifach gegen eines, das nur
// einer bewertet hat, und die Kopfzahl waere aus den angezeigten Zeilenwerten
// nicht mehr nachvollziehbar.
// Gerundet wird GENAU EINMAL, hier am Ende. Je Kriterium vorzurunden und dann
// zu mitteln waere ein zweiter Rundungsort fuer dieselbe Zahl -- SQL und
// JavaScript muessten dafuer gleich runden. Der Preis ist bekannt und steht im
// Konzept: wer die angezeigten Zehntel von Hand mittelt, kann um bis zu 0,05
// danebenliegen.
// Bei EINEM Benutzer liefert das Zweistufenmittel dasselbe wie ein flaches --
// jedes Kriterium hat dann hoechstens eine Stimme.
function gesamtSchnitt(karte) {
  const werte = [...karte.values()].map(z => z.schnitt);
  if (!werte.length) return null;
  const a = werte.reduce((s, v) => s + v, 0) / werte.length;
  return Math.round(a * 10) / 10;
}

const qTestDaysRoh = db.prepare('SELECT id, day, rating, user_id FROM test_days WHERE item_id = ? ORDER BY day DESC, id DESC');
const qTestDayTags = db.prepare(`SELECT t.id, t.name FROM tags t
  JOIN test_day_tags dt ON dt.tag_id = t.id WHERE dt.test_day_id = ?
  ORDER BY t.name COLLATE NOCASE`);
// Jeder Testtag sagt, ob er MIR gehoert -- die Zeitleiste zeichnet die
// eigenen Punkte gefuellt und fremde als Ring. Geliefert wird "mine", nicht
// die user_id: eine Id in der Antwort waere eine Angabe ueber eine Person,
// die niemand liest.
// KEIN VORGABEWERT fuer benutzerId, und die Klemme darunter ist deshalb keine
// Zierde -- dieselbe Begruendung wie bei detail():
// better-sqlite3 bindet ein fehlendes Argument still als NULL, und
// "user_id = NULL" ist in SQL nie wahr. Ohne die Klemme lieferte eine
// vergessene Aufrufstelle wortlos lauter fremde Punkte.
function qTestDays(itemId, benutzerId, karte) {
  if (benutzerId == null) throw new Error('qTestDays() ohne Benutzer aufgerufen');
  const tage = qTestDaysRoh.all(itemId);
  for (const t of tage) {
    t.tags = qTestDayTags.all(t.id);
    t.mine = t.user_id === benutzerId;
    // Der Name steht neben `mine`, er ersetzt es nicht: die Zeitleiste
    // unterscheidet eigene von fremden Punkten ueber die Fuellung und braucht
    // dafuer keinen Namen, die Zeile im Eintrag braucht ihn.
    t.verfasser = verfasserAus(karte, t.user_id);
    delete t.user_id;
  }
  return tage;
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
  return r.cnt
    ? { testCount: r.cnt, testAvg: Math.round(r.avg * 10) / 10, testLast: r.last }
    : { testCount: null, testAvg: null, testLast: null };
}

const qMeinPin = db.prepare('SELECT 1 FROM item_pins WHERE user_id = ? AND item_id = ?');

// detail() braucht den Benutzer: "favorite" heisst "habe ICH als Favorit
// markiert", nicht "ist Favorit" -- dieselbe Antwort sieht fuer zwei Leute
// verschieden aus.
//
// KEIN VORGABEWERT, und die Klemme darunter ist deshalb keine Zierde:
// better-sqlite3 bindet ein FEHLENDES Argument still als NULL -- nur zu
// WENIGE Argumente werfen. Ein Aufruf ohne Benutzer faende also nie einen
// Favoriten und lieferte ueberall wortlos favorite: false, statt aufzufallen.
// Die Klemme ist die EINZIGE Schicht darunter, nicht die zweite.
function detail(id, benutzerId) {
  if (benutzerId == null) throw new Error('detail() ohne Benutzer aufgerufen');
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!it) return null;
  // EINMAL je Aufruf: Eintrag, Kommentare, Testtage und Stimmen greifen alle
  // darauf zu.
  const karte = verfasserKarte();
  it.rejected = !!it.rejected; it.tested = !!it.tested;
  it.verfasser = verfasserAus(karte, it.user_id);
  delete it.user_id;
  it.favorite = !!qMeinPin.get(benutzerId, id);
  it.category = it.product_category_id ? qCat.get(it.product_category_id) : null;
  it.photos = qPhotos.all(id);
  // Nur die Angaben, nie die Bytes. Die Art der Vorschau entscheidet der
  // Server anhand der Endung -- die Oberflaeche soll das nicht selbst raten.
  it.attachments = qAttachments.all(id).map(a2 => ({ ...a2, preview: anh.vorschauArt(a2.filename) }));
  it.links = qLinks.all(id);
  it.tags = qTags.all(id);
  it.testDays = qTestDays(id, benutzerId, karte);
  it.comments = qComments(id, benutzerId, karte);
  // Die eigene Sterne-Zeile. Ohne die Bedingung auf user_id
  // vervielfacht der LEFT JOIN das Kriterium -- bei zwei Bewertern kaeme jedes
  // Kriterium zweimal, und das Widget zeigte zwei Reihen Sterne fuer dieselbe
  // Sache. Ein Bedienelement zeigt den Zustand, den es veraendert; der Schnitt
  // ueber alle steht daneben in avg und count -- angehaengt aus
  // einer gruppierten Abfrage, nicht aus einem zweiten JOIN.
  it.ratings = db.prepare(`
    SELECT c.id AS criterion_id, c.name, COALESCE(r.value, 0) AS value
    FROM rating_criteria c LEFT JOIN ratings r
      ON r.criterion_id = c.id AND r.item_id = ? AND r.user_id = ?
    ORDER BY c.sort_order, c.id`).all(id, benutzerId);
  // Neben der eigenen Zeile stehen Schnitt und Zahl der Bewerter
  // ueber alle. Angehaengt aus der gruppierten Abfrage, nicht aus einem
  // zweiten JOIN -- siehe die Bemerkung bei qSchnittJeKriterium.
  // Ein Kriterium, das niemand bewertet hat, bekommt avg: null und count: 0;
  // die Oberflaeche zeigt dort nichts.
  const schnitte = schnitteJeKriterium(id);
  // WER WELCHEN WERT VERGEBEN HAT, STEHT HIER AUSDRUECKLICH NICHT. Diese
  // Antwort geht an jeden, und eine Angabe darueber, wie eine EINZELNE PERSON
  // bewertet hat, ist mehr, als eine Bewertung aussagen soll. Was nicht
  // angezeigt werden darf, wird nicht geliefert -- sonst haengt die Regel
  // daran, dass die Oberflaeche mitspielt.
  // Die Liste holt der Admin ueber GET /api/items/:id/stimmen.
  // avg und count bleiben: der Schnitt und die Zahl der Bewerter sind keine
  // Aussage ueber eine Person.
  for (const r of it.ratings) {
    const z = schnitte.get(r.criterion_id);
    r.avg = z ? Math.round(z.schnitt * 10) / 10 : null;
    r.count = z ? z.anzahl : 0;
  }
  it.avgRating = gesamtSchnitt(schnitte);
  Object.assign(it, testStats(id));
  return it;
}

const qMeinePins = db.prepare('SELECT item_id FROM item_pins WHERE user_id = ?');

app.get('/api/items', (req, res) => {
  const rows = db.prepare('SELECT * FROM items ORDER BY updated_at DESC').all();
  // Eine Abfrage fuer die ganze Liste statt einer je Zeile. Die
  // Sortierung bleibt updated_at fuer alle -- die Uebersicht zeigt, wo etwas
  // geschieht, nicht wo ich zuletzt war. Nach vorn zieht der eigene Favorit
  // erst in der Oberflaeche, und nur fuer den, dem er gehoert.
  const meinePins = new Set(qMeinePins.all(req.benutzer.id).map(p => p.item_id));
  // Einmal fuer die ganze Liste, nicht je Eintrag -- sonst stuende dieselbe
  // Abfrage bei hundert Eintraegen hundertmal.
  const karte = verfasserKarte();
  for (const it of rows) {
    it.rejected = !!it.rejected; it.tested = !!it.tested;
    it.verfasser = verfasserAus(karte, it.user_id);
    delete it.user_id;
    it.favorite = meinePins.has(it.id);
    const ph = qPhotos.all(it.id);
    it.mainPhoto = ph[0] || null;
    it.photoCount = ph.length;
    it.category = it.product_category_id ? qCat.get(it.product_category_id) : null;
    it.tags = qTags.all(it.id);
    const links = qLinks.all(it.id);
    it.linkCount = links.length;
    it.attachmentCount = db.prepare('SELECT COUNT(*) n FROM attachments WHERE item_id = ?').get(it.id).n;
    // Dieselbe Rechnung wie in detail(), ueber denselben Helfer. Zwei
    // Rechenwege fuer die Kachel und die Zeile daneben waeren zwei Wahrheiten
    // ueber dieselbe Zahl.
    it.avgRating = gesamtSchnitt(schnitteJeKriterium(it.id));
    Object.assign(it, testStats(it.id));
    // Die Zeitleiste braucht die Testtage selbst, nicht nur ihre Anzahl --
    // und dazu, wem sie gehoeren.
    it.testDays = qTestDays(it.id, req.benutzer.id, karte);
    // Ein zusammengefasstes Suchfeld statt der vollstaendigen Kommentarstruktur:
    // damit findet die Suche auch Kommentare, ohne sie einzeln mitzuschicken.
    // Tags an Testtagen stehen hier mit drin: der Filter kennt sie nicht, die
    // Suche soll sie trotzdem finden.
    const comments = db.prepare('SELECT text FROM comments WHERE item_id = ?').all(it.id).map(c => c.text);
    const tagTags = it.testDays.flatMap(d => d.tags.map(t => t.name));
    it.searchText = [it.title, it.description, it.category ? it.category.name : '',
      ...it.tags.map(t => t.name), ...tagTags, ...links.map(l => l.url), ...comments]
      .join(' \u0001 ').toLowerCase();
    delete it.description;
  }
  res.json(rows);
});

app.get('/api/items/:id', (req, res) => {
  const it = detail(req.params.id, req.benutzer.id);
  if (!it) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(it);
});

app.post('/api/items', (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Titel fehlt' });
  // Der Anlegende ist der Verfasser. req.benutzer steht an
  // jedem geschuetzten Endpunkt (auth.js, requireAuth). BEWUSST OHNE ?.: fiele
  // es je weg, soll das mit einem Fehler auffallen und nicht als stille Zeile
  // ohne Benutzer, die der naechste Start heimlich nachtraegt.
  const i = db.prepare('INSERT INTO items (title, description, user_id) VALUES (?, ?, ?)')
    .run(title, req.body.description || '', req.benutzer.id);
  res.status(201).json(detail(i.lastInsertRowid, req.benutzer.id));
});

app.put('/api/items/:id', (req, res) => {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!it) return res.status(404).json({ error: 'Nicht gefunden' });
  const b = req.body || {};

  /* DIESE ROUTE TRAEGT ZWEI RECHTEKLASSEN IN EINEM RUMPF, und das ist
     kein Schoenheitsfehler, sondern verlangt: `favorite` ist persoenlich --
     jeder setzt seinen eigenen Favoriten an jedem Eintrag, auch an einem
     fremden (item_pins). Alles andere gehoert dem Verfasser und dem Admin.
     Deshalb sitzt die Klemme hier und nicht als Waechter vor der Route.
     UND SIE SITZT VOR DEM ERSTEN SCHREIBEN: der Favorit eine Bildschirmseite
     weiter unten ist der erste Schreibvorgang; eine Absage, die ihn schon
     ausgefuehrt hat, waere schlimmer als gar keine.
     Zur Gegenprobe gehoeren BEIDE Richtungen -- die Klemme ganz weg macht die
     Verweigerung rot und muss den Favoriten gruen lassen, die Klemme ueber die
     ganze Route macht den Favoriten rot. Nur zusammen belegen sie die
     Ausnahme. */
  const nurVerfasserFelder = NUR_VERFASSER_FELDER.filter(f => b[f] !== undefined);
  if (nurVerfasserFelder.length && !darfAendern(req, it.user_id))
    return res.status(403).json({ error: VERWEIGERT_EINTRAG });

  // "Getestet" laesst sich nicht zuruecknehmen, solange Testtage eingetragen sind.
  if (b.tested === false) {
    const n = db.prepare('SELECT COUNT(*) n FROM test_days WHERE item_id = ?').get(req.params.id).n;
    if (n > 0) {
      const v = vokabular();
      // Vokabelwoerter stehen ohne Artikel und ohne Fall da: nach einer Zahl
      // im Nominativ und in Anfuehrungszeichen. Beides bleibt bei jedem Wort
      // richtig, gleich welches Geschlecht.
      return res.status(409).json({
        error: `Solange ${n} ${n === 1 ? v.zeitpunktEinzahl : v.zeitpunktMehrzahl} eingetragen ` +
               `${n === 1 ? 'ist' : 'sind'}, lässt sich „${v.merkmalJa}" nicht zurücknehmen. ` +
               `Bitte zuerst die Liste leeren.`
      });
    }
  }

  // Der Favorit ist KEINE Spalte von items und laeuft deshalb
  // nicht durch die Klemme darunter. Zwei Folgen, beide gewollt:
  //   1. Er trifft nur den eigenen Platz. Ohne die Bedingung auf user_id
  //      setzten und nahmen sich alle gegenseitig die Favoriten.
  //   2. ER RUEHRT updated_at NICHT AN: als Spalte liefe er mit durch das
  //      UPDATE und schoebe den Eintrag in JEDER Uebersicht nach oben. Das
  //      steht quer zu "die Liste zeigt, wo etwas geschieht, nicht wo ICH
  //      zuletzt war" -- ein persoenlicher Favorit ist genau Letzteres. Wer
  //      hier ein touch.run() hinsetzt, macht die eigene Ablage zur Nachricht
  //      an alle.
  if (b.favorite !== undefined) {
    if (b.favorite) db.prepare('INSERT OR IGNORE INTO item_pins (user_id, item_id) VALUES (?, ?)')
      .run(req.benutzer.id, req.params.id);
    else db.prepare('DELETE FROM item_pins WHERE user_id = ? AND item_id = ?')
      .run(req.benutzer.id, req.params.id);
  }

  const sets = [], vals = [];
  const put = (col, v) => { sets.push(`${col} = ?`); vals.push(v); };
  if (b.title !== undefined) put('title', String(b.title).trim());
  if (b.description !== undefined) put('description', b.description);
  if (b.rejected !== undefined) put('rejected', b.rejected ? 1 : 0);
  if (b.tested !== undefined) put('tested', b.tested ? 1 : 0);
  if (b.productCategoryId !== undefined) put('product_category_id', b.productCategoryId);
  if (sets.length) {
    sets.push(`updated_at = datetime('now')`);
    db.prepare(`UPDATE items SET ${sets.join(', ')} WHERE id = ?`).run(...vals, req.params.id);
  }
  res.json(detail(req.params.id, req.benutzer.id));
});

/* Die Zahlen fuer den Loeschdialog am Eintrag -- dieselbe Bauform wie
   GET /api/users/:id/bestand. Lesend, deshalb kein Eintrag in F_ROUTEN; der
   Waechter steht trotzdem davor, denn wer nicht loeschen darf, braucht die
   Zahlen nicht.

   GETRENNT NACH EIGEN UND FREMD AUS SICHT DES LOESCHENDEN. Die Frage, die der
   Dialog beantworten muss, lautet "was nehme ich ANDEREN weg" -- nicht "was
   gehoert dem Verfasser". Loescht ein Admin einen fremden Eintrag, sind auch
   die Beitraege des Verfassers fremd, und genau das soll dastehen.

   IS NOT statt !=, weil user_id leer sein darf: eine herrenlose Zeile ist eine
   fremde und fiele bei != aus dem Vergleich heraus.

   value > 0 bei den Bewertungen: eine zurueckgesetzte Zeile steht mit 0 in der
   Tabelle und ist keine Stimme -- dieselbe Bedingung wie beim Schnitt, bei der
   Stimmenliste und beim Verwendungszaehler der Kriterien. Die Zahl im Dialog
   und die Namen darunter im Bewertungsblock muessen dasselbe meinen. */
app.get('/api/items/:id/bestand', nurEintragVerfasser, (req, res) => {
  const id = req.params.id, ich = req.benutzer.id;
  const eins = (sql, ...w) => db.prepare(sql).get(...w).n;
  res.json({
    fotos: eins('SELECT COUNT(*) n FROM photos WHERE item_id = ?', id),
    dateien: eins('SELECT COUNT(*) n FROM attachments WHERE item_id = ?', id),
    links: eins('SELECT COUNT(*) n FROM links WHERE item_id = ?', id),
    eigenKommentare: eins('SELECT COUNT(*) n FROM comments WHERE item_id = ? AND user_id = ?', id, ich),
    fremdKommentare: eins('SELECT COUNT(*) n FROM comments WHERE item_id = ? AND user_id IS NOT ?', id, ich),
    eigenBewertungen: eins('SELECT COUNT(*) n FROM ratings WHERE item_id = ? AND value > 0 AND user_id = ?', id, ich),
    fremdBewertungen: eins('SELECT COUNT(*) n FROM ratings WHERE item_id = ? AND value > 0 AND user_id IS NOT ?', id, ich),
    eigenTesttage: eins('SELECT COUNT(*) n FROM test_days WHERE item_id = ? AND user_id = ?', id, ich),
    fremdTesttage: eins('SELECT COUNT(*) n FROM test_days WHERE item_id = ? AND user_id IS NOT ?', id, ich)
  });
});

// Loeschen darf der Verfasser und der Admin. Die Kaskade raeumt dabei
// fremde Kommentare, Bewertungen und Favoriten mit weg -- richtig, ein
// Kommentar ohne Eintrag ergibt nichts, aber es darf nicht wortlos geschehen:
// der Dialog in der Oberflaeche nennt die Zahlen vorher, getrennt nach eigen
// und fremd, aus GET /api/items/:id/bestand.
app.delete('/api/items/:id', nurEintragVerfasser, (req, res) => {
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  reclaim();
  res.status(204).end();
});

/* ---- Fotos ---- */
// Der Waechter steht VOR multer: die Datei eines Fremden soll gar nicht erst
// eingelesen werden.
app.post('/api/items/:id/photos', nurEintragVerfasser, upload.array('photos', 40), async (req, res, next) => {
  try {
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: 'Nicht gefunden' });
    let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM photos WHERE item_id = ?')
      .get(req.params.id).m + 1;
    const ins = db.prepare('INSERT INTO photos (item_id, mime_type, data, thumb, medium, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    for (const f of req.files || []) {
      const v = await makeVariants(f.buffer);
      ins.run(req.params.id, f.mimetype, f.buffer, v.thumb, v.medium, pos++);
    }
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.benutzer.id));
  } catch (e) { next(e); }
});

app.get('/api/photos/:id/raw', (req, res) => {
  const p = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).end();
  let blob = p.data, mime = p.mime_type;
  if (req.query.size === 'thumb' && p.thumb) { blob = p.thumb; mime = 'image/jpeg'; }
  else if (req.query.size === 'medium' && p.medium) { blob = p.medium; mime = 'image/jpeg'; }
  res.set('Content-Type', mime);
  res.set('Cache-Control', 'private, max-age=86400');
  res.send(blob);
});

// Fokuspunkt eines Fotos. Zwei Prozentwerte, sonst nichts -- das Bild selbst
// wird nie veraendert.
app.put('/api/photos/:id/focus', (req, res) => {
  const p = db.prepare('SELECT item_id FROM photos WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Nicht gefunden' });
  // Die Eintragsnummer kommt erst aus der Kindzeile -- deshalb die
  // zweite Form desselben Aufrufs, nicht eine zweite Regel.
  if (!eintragFrei(req, res, p.item_id)) return;
  const zahl = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n * 10) / 10)) : null;
  };
  const x = zahl(req.body.x), y = zahl(req.body.y);
  if (x === null || y === null) return res.status(400).json({ error: 'Ungültiger Fokuspunkt' });
  db.prepare('UPDATE photos SET focus_x = ?, focus_y = ? WHERE id = ?').run(x, y, req.params.id);
  touch.run(p.item_id);
  res.json(detail(p.item_id, req.benutzer.id));
});

/* ---- Anhaenge ----
 * Die Sicherheit haengt vollstaendig an der Auslieferung, siehe anhaenge.js.
 * Deshalb wird beim Hochladen bewusst NICHT nach Typen gefiltert: eine
 * Positivliste dort waere leicht zu umgehen und wiegte in falscher Sicherheit.
 */
const ANHANG_MAX = 50 * 1024 * 1024;
const ANHANG_ZAHL = 20;
const anhangUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: ANHANG_MAX } });

app.post('/api/items/:id/attachments', nurEintragVerfasser, anhangUpload.array('files', ANHANG_ZAHL), (req, res, next) => {
  try {
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: 'Nicht gefunden' });
    const da = db.prepare('SELECT COUNT(*) n FROM attachments WHERE item_id = ?').get(req.params.id).n;
    const neu = (req.files || []).length;
    if (da + neu > ANHANG_ZAHL)
      return res.status(400).json({ error: `Mehr als ${ANHANG_ZAHL} Dateien je Eintrag sind nicht vorgesehen.` });
    let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM attachments WHERE item_id = ?')
      .get(req.params.id).m + 1;
    const ins = db.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order)
                            VALUES (?, ?, ?, ?, ?, ?)`);
    for (const f of req.files || []) {
      // Nur der Name, nie ein Pfad: ein hochgeladenes "../../etwas" soll
      // nichts weiter sein als ein merkwuerdiger Dateiname.
      const name = path.basename(String(f.originalname || 'datei')).slice(0, 200) || 'datei';
      ins.run(req.params.id, name, String(f.mimetype || '').slice(0, 120), f.buffer.length, f.buffer, pos++);
    }
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.benutzer.id));
  } catch (e) { next(e); }
});

// Herunterladen bzw. Einbetten. Einzige Stelle, die Anlagenbytes ausliefert.
app.get('/api/attachments/:id/raw', (req, res) => {
  const a = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).end();
  anh.setzeKopfzeilen(res, a.filename, { inline: req.query.inline === '1' });
  res.send(a.data);
});

// Vorschau von Text und .docx: der Inhalt wird gelesen und als JSON
// geschickt, nie als Datei ausgeliefert. Der Browser interpretiert ihn damit
// ueberhaupt nicht.
app.get('/api/attachments/:id/preview', (req, res) => {
  const a = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Nicht gefunden' });
  const art = anh.vorschauArt(a.filename);
  if (art === 'text') return res.json({ art, ...anh.textVorschau(a.data) });
  if (art === 'docx') {
    const v = anh.docxVorschau(a.data);
    if (!v) return res.status(422).json({ error: 'Diese Datei lässt sich nicht als Text lesen.' });
    return res.json({ art, ...v });
  }
  res.status(400).json({ error: 'Für diese Datei gibt es keine Textvorschau.' });
});

app.delete('/api/attachments/:id', (req, res) => {
  const a = db.prepare('SELECT item_id FROM attachments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Nicht gefunden' });
  if (!eintragFrei(req, res, a.item_id)) return;
  db.prepare('DELETE FROM attachments WHERE id = ?').run(req.params.id);
  // Sortiernummern lueckenlos halten, wie bei Fotos und Links.
  const rest = db.prepare('SELECT id FROM attachments WHERE item_id = ? ORDER BY sort_order, id').all(a.item_id);
  const s2 = db.prepare('UPDATE attachments SET sort_order = ? WHERE id = ?');
  rest.forEach((r, i) => s2.run(i, r.id));
  touch.run(a.item_id);
  reclaim();
  res.json(detail(a.item_id, req.benutzer.id));
});

app.put('/api/items/:id/photo-order', nurEintragVerfasser, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE photos SET sort_order = ? WHERE id = ? AND item_id = ?');
  db.transaction(() => ids.forEach((pid, i) => s.run(i, pid, req.params.id)))();
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

app.delete('/api/photos/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Nicht gefunden' });
  if (!eintragFrei(req, res, p.item_id)) return;
  db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
  const rest = db.prepare('SELECT id FROM photos WHERE item_id = ? ORDER BY sort_order, id').all(p.item_id);
  const s = db.prepare('UPDATE photos SET sort_order = ? WHERE id = ?');
  rest.forEach((r, i) => s.run(i, r.id));
  touch.run(p.item_id);
  reclaim();
  res.status(204).end();
});

/* ---- Links ---- */
// Ein Wort ist keine Adresse. Bekaeme jede Eingabe ohne Schema stumm
// "https://" davor, wuerde aus "Handbuch 3000" eine Zeile, die beim Klick ins
// Leere laeuft. Deshalb wird unterschieden:
//   1. mit http:// oder https:// davor  -> Adresse, unveraendert
//   2. sieht aus wie eine Adresse       -> Adresse, mit https:// davor
//   3. alles andere                     -> Suchtext, roh gespeichert
// Woran die Oberflaeche das spaeter erkennt: am fehlenden Schema. Deshalb
// braucht es keine eigene Spalte -- eine gespeicherte Adresse traegt immer
// eins.
const ADRESSMUSTER = [
  // name.endung, auch mehrstufig, auch mit Portnummer und Pfad dahinter
  /^[^\s/?#:]+(\.[^\s/?#:]+)*\.[a-z]{2,24}(:\d{1,5})?(?=$|[/?#])/i,
  // IP-Nummer -- im Heimnetz die haeufigere Schreibweise
  /^\d{1,3}(\.\d{1,3}){3}(:\d{1,5})?(?=$|[/?#])/,
  // Rechnername mit Portnummer, etwa nas:8080
  /^[a-z0-9][a-z0-9-]*:\d{1,5}(?=$|[/?#])/i
];
// Bewusst keine Liste echter Endungen: sie waere pflegebeduerftig und trotzdem
// lueckenhaft. Der Preis ist ein seltener Fehlgriff wie "v2.beta", das als
// Adresse durchgeht. Die Zeile zeigt sofort, wofuer sie sich entschieden hat.
function normalisiereLink(roh) {
  const t = String(roh || '').trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return ADRESSMUSTER.some(m => m.test(t)) ? 'https://' + t : t;
}

app.post('/api/items/:id/links', nurEintragVerfasser, (req, res) => {
  const url = normalisiereLink(req.body.url);
  if (!url) return res.status(400).json({ error: 'Adresse oder Suchbegriff fehlt' });
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Nicht gefunden' });
  const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM links WHERE item_id = ?')
    .get(req.params.id).m + 1;
  db.prepare('INSERT INTO links (item_id, url, sort_order) VALUES (?, ?, ?)').run(req.params.id, url, pos);
  touch.run(req.params.id);
  res.status(201).json(detail(req.params.id, req.benutzer.id));
});

app.put('/api/items/:id/link-order', nurEintragVerfasser, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE links SET sort_order = ? WHERE id = ? AND item_id = ?');
  db.transaction(() => ids.forEach((lid, i) => s.run(i, lid, req.params.id)))();
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

app.delete('/api/links/:id', (req, res) => {
  const l = db.prepare('SELECT * FROM links WHERE id = ?').get(req.params.id);
  if (!l) return res.status(404).json({ error: 'Nicht gefunden' });
  if (!eintragFrei(req, res, l.item_id)) return;
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return res.status(400).json({ error: 'Ungültiges Datum' });
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Note muss zwischen 1 und 5 liegen' });
  const today = new Date().toISOString().slice(0, 10);
  if (day > today) return res.status(400).json({ error: 'Das Datum kann nicht in der Zukunft liegen.' });
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Nicht gefunden' });

  // Der eigene Tag. Zwei Leute am selben Datum sind kein Konflikt,
  // sondern zwei Testtage -- ersetzt wird nur, was einem selbst gehoert, und
  // "replaced" in der Antwort meint dasselbe.
  const existing = db.prepare('SELECT id FROM test_days WHERE item_id = ? AND day = ? AND user_id = ?')
    .get(req.params.id, day, req.benutzer.id);
  // Das Konfliktziel MUSS dem UNIQUE der Tabelle entsprechen; passt es nicht,
  // lehnt SQLite die Anweisung rundheraus ab ("ON CONFLICT clause does not
  // match any PRIMARY KEY or UNIQUE constraint") -- der Eintrag stuerbe mit 500,
  // statt still falsch zu laufen. Wer hier etwas aendert, aendert db.js mit.
  // Das Konfliktziel enthaelt user_id: ersetzt wird nur die eigene Zeile,
  // nie die eines anderen.
  db.prepare(`INSERT INTO test_days (item_id, day, rating, user_id) VALUES (?, ?, ?, ?)
              ON CONFLICT(item_id, day, user_id) DO UPDATE SET rating = excluded.rating`)
    .run(req.params.id, day, rating, req.benutzer.id);
  db.prepare(`UPDATE items SET tested = 1, updated_at = datetime('now') WHERE id = ?`).run(req.params.id);
  res.status(201).json({ ...detail(req.params.id, req.benutzer.id), replaced: !!existing });
});

// Die NOTE eines fremden Testtags aendert niemand, auch der Admin
// nicht. Sie ist die Aussage dieser Zeile, genau wie eine Bewertung:
// loeschen ja, umschreiben nein.
app.put('/api/test-days/:id', (req, res) => {
  const rating = Number(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Note muss zwischen 1 und 5 liegen' });
  const t = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Nicht gefunden' });
  if (!nurSelbst(req, t.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
  db.prepare('UPDATE test_days SET rating = ? WHERE id = ?').run(rating, req.params.id);
  touch.run(t.item_id);
  res.json(detail(t.item_id, req.benutzer.id));
});

app.delete('/api/test-days/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Nicht gefunden' });
  // Loeschen darf der Admin, aendern nicht -- der Unterschied ist die ganze
  // Regel aus Teil IV.
  if (!darfAendern(req, t.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
  db.prepare('DELETE FROM test_days WHERE id = ?').run(req.params.id);
  touch.run(t.item_id);
  res.json(detail(t.item_id, req.benutzer.id));
});

// Tags am Testtag. Derselbe Vorrat wie am Eintrag -- ein hier neu getippter
// Name legt den Tag auch fuer die Eintraege an.
app.post('/api/test-days/:id/tags', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Tag-Name fehlt' });
  const t = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Nicht gefunden' });
  // Ein Tag am Testtag gehoert dem Testtag und teilt dessen
  // Eigentuemer (deshalb hat er keine eigene user_id). "Regen" an
  // einem fremden Testtag zu ergaenzen hiesse, eine fremde Beobachtung
  // umzuschreiben.
  if (!nurSelbst(req, t.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
  /* AM TESTTAG GIBT ES KEINE WOLKE -- die Eingabe ist der einzige
     Zuweisungsweg und bleibt deshalb auf dem Bildschirm stehen. Ein
     unbekannter Name faellt hier mit sprechender Meldung durch, statt dass die
     Zeile verschwaende: sonst naehme der Schalter das Zuweisen mit, und
     "Zuweisen darf immer jeder" gilt. */
  let tag = findeTag(name);
  if (!tag) {
    if (!darfAnlegen(req, 'tagsFreiAnlegen')) return res.status(403).json({ error: VERWEIGERT_TAG_NEU });
    tag = legeTagAn(name);
  }
  db.prepare('INSERT OR IGNORE INTO test_day_tags (test_day_id, tag_id) VALUES (?, ?)').run(t.id, tag.id);
  touch.run(t.item_id);
  res.status(201).json(detail(t.item_id, req.benutzer.id));
});

app.delete('/api/test-days/:id/tags/:tagId', (req, res) => {
  const t = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Nicht gefunden' });
  if (!nurSelbst(req, t.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
  db.prepare('DELETE FROM test_day_tags WHERE test_day_id = ? AND tag_id = ?').run(t.id, req.params.tagId);
  touch.run(t.item_id);
  res.json(detail(t.item_id, req.benutzer.id));
});

/* ---- Bewertungen ---- */
// Hier steht bewusst KEIN Waechter. Beide Wege treffen baulich nur die
// eigene Zeile -- das ON CONFLICT trifft (item_id, criterion_id, user_id), das
// DELETE traegt "AND user_id = ?". Eine Klemme daneben waere eine
// zweite Wahrheit ueber dieselbe Sache und liesse sich
// obendrein nicht gegenpruefen: ihr Rueckbau bliebe stumm, weil die
// Eindeutigkeitsregel den Fall ohnehin verhindert.
// Fremde Bewertungen einzeln zu loeschen hat keinen Endpunkt; sie fallen nur
// mit dem Eintrag oder mit dem Zugang ihres Verfassers.
app.put('/api/items/:id/ratings', (req, res) => {
  const v = Math.max(0, Math.min(5, Number(req.body.value) || 0));
  // Die eigene Bewertung. Konfliktziel und UNIQUE in db.js gehoeren
  // zusammen -- siehe die Bemerkung beim Testtag eine Bildschirmseite hoeher.
  db.prepare(`INSERT INTO ratings (item_id, criterion_id, value, user_id) VALUES (?, ?, ?, ?)
              ON CONFLICT(item_id, criterion_id, user_id) DO UPDATE SET value = excluded.value`)
    .run(req.params.id, req.body.criterionId, v, req.benutzer.id);
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

app.delete('/api/items/:id/ratings', (req, res) => {
  // Zuruecksetzen meint ausschliesslich die EIGENEN Werte. Ohne die
  // zweite Bedingung raeumte der Knopf im Blockkopf die Bewertungen aller
  // anderen gleich mit weg -- und zwar wortlos. Die Beschriftung sagt es
  // dazu: "Meine Bewertung zuruecksetzen".
  db.prepare('DELETE FROM ratings WHERE item_id = ? AND user_id = ?')
    .run(req.params.id, req.benutzer.id);
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

/* Wer welchen Wert vergeben hat -- die Ansicht des Admins.
   NUR DER ADMIN. Wer wie bewertet hat, ist eine Angabe ueber einzelne
   Personen; die Sternzeile am Eintrag zeigt deshalb nur noch den eigenen Wert
   und den Schnitt. Diese Liste ruft der Admin ausdruecklich auf.
   Lesende Route, also KEIN Eintrag in der Liste der schreibenden Routen -- der
   Waechter davor ist derselbe wie bei GET /api/stats und
   GET /api/items/:id/bestand.
   Sie ist zugleich die VORAUSSETZUNG DES LOESCHWEGS: ohne die id gaebe es vom
   Bildschirm aus keinen Weg zu einer einzelnen fremden Bewertung, und
   DELETE /api/ratings/:id waere unerreichbar.
   Der Benutzer wird durchgereicht, weil stimmenJeKriterium() ihn braucht --
   `mine` unterscheidet die eigene Stimme von den fremden, und am eigenen Wert
   steht kein Loeschkreuz.
   Nur Kriterien MIT Stimmen stehen in der Antwort; den Namen je Kriterium
   liefert sie nicht, den hat die Oberflaeche aus dem Eintrag. Zwei Quellen
   fuer denselben Namen waeren zwei Wahrheiten.
   KEINE SCHWELLE bei einem einzigen Zugang: der Server liefert, die
   Oberflaeche entscheidet ueber mehrereBenutzer(), ob sie den Aufruf ueberhaupt
   anbietet -- dieselbe Aufteilung wie bei der Durchschnittsspalte. */
app.get('/api/items/:id/stimmen', nurAdmin, (req, res) => {
  const stimmen = stimmenJeKriterium(req.params.id, req.benutzer.id, verfasserKarte());
  res.json([...stimmen].map(([criterion_id, liste]) => ({ criterion_id, stimmen: liste })));
});

/* Eine EINZELNE fremde Bewertung entfernen -- der Weg, den es bis hierher
   nicht gab: eine fremde Zeile fiel nur mit dem Eintrag oder mit dem Zugang
   ihres Verfassers.
   Die beiden Wege darueber brauchen keine Klemme, weil sie baulich nur die
   eigene Zeile treffen. HIER ist eine noetig, denn hier steht eine fremde
   Nummer in der Adresse.
   darfAendern und nicht nurSelbst: loeschen darf der Admin. Ein Weg, den
   fremden WERT zu aendern, entsteht damit ausdruecklich nicht -- die Note ist
   die Aussage der Zeile, genau wie beim Testtag. Loeschen ja, umschreiben
   nein.
   An einer Bewertungszeile haengt nichts; die einzige Kaskade in diesem Umfeld
   ist die am Eintrag, und die kuendigt der Loeschdialog an. */
app.delete('/api/ratings/:id', (req, res) => {
  const r = db.prepare('SELECT id, item_id, user_id FROM ratings WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Nicht gefunden' });
  if (!darfAendern(req, r.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
  db.prepare('DELETE FROM ratings WHERE id = ?').run(r.id);
  touch.run(r.item_id);
  res.json(detail(r.item_id, req.benutzer.id));
});

/* ---- Kommentare ---- */
// Alles ausser 'report' ist eine Notiz -- so gelten auch aeltere Exportdateien
// ohne diese Angabe als gewoehnliche Notiz.
// Klemmt Unbekanntes auf 'note'. Alles, was hier nicht steht, kommt nicht in
// die Datenbank -- auch nicht aus einer Exportdatei.
const KIND_WERTE = ['note', 'report', 'task', 'done'];
const kindWert = (v) => (KIND_WERTE.includes(v) ? v : 'note');

// Bilder in Kommentaren. Anders als bei den Anhaengen ist hier NUR Bild
// erlaubt: jede Datei geht durch sharp und wird neu kodiert gespeichert. Was
// sharp nicht als Bild lesen kann, wird abgewiesen -- eine als .png getarnte
// HTML-Datei kommt damit gar nicht erst in die Datenbank.
const BILD_MAX = 20 * 1024 * 1024;
const BILD_ZAHL = 6;
const kommentarBildUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: BILD_MAX } });

async function kodiereKommentarBild(buf) {
  const gross = await sharp(buf, { failOn: 'none' }).rotate()
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  const klein = await sharp(buf, { failOn: 'none' }).rotate()
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  return { gross, klein };
}

function speichereKommentarBilder(commentId, dateien) {
  let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM comment_images WHERE comment_id = ?')
    .get(commentId).m + 1;
  const ins = db.prepare(`INSERT INTO comment_images (comment_id, filename, data, thumb, sort_order)
                          VALUES (?, ?, ?, ?, ?)`);
  for (const d of dateien) ins.run(commentId, d.name, d.gross, d.klein, pos++);
}

// Aus hochgeladenen Dateien kodierte Bilder machen. Gibt null zurueck, wenn
// eine Datei kein lesbares Bild ist -- dann wird gar nichts gespeichert.
async function kodiereAlle(dateien) {
  const out = [];
  for (const f of dateien || []) {
    try {
      const { gross, klein } = await kodiereKommentarBild(f.buffer);
      out.push({ name: path.basename(String(f.originalname || 'bild.jpg')).slice(0, 200), gross, klein });
    } catch { return { fehler: `„${f.originalname}" ist kein lesbares Bild.` }; }
  }
  return { bilder: out };
}

// Bilder kommen zusammen mit dem Text, nicht danach: sonst entstuende bei
// einem Abbruch ein leerer Kommentar mit Bildern.
app.post('/api/items/:id/comments', kommentarBildUpload.array('images', BILD_ZAHL), async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Text fehlt' });
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: 'Nicht gefunden' });

    const k = await kodiereAlle(req.files);
    if (k.fehler) return res.status(400).json({ error: k.fehler });

    const angepinnt = req.body.pinned === '1' || req.body.pinned === true;
    // Der Schreibende ist der Verfasser.
    const neu = db.prepare('INSERT INTO comments (item_id, text, kind, pinned, user_id) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, text, kindWert(req.body.kind), angepinnt ? 1 : 0, req.benutzer.id);
    if (k.bilder.length) speichereKommentarBilder(neu.lastInsertRowid, k.bilder);
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.benutzer.id));
  } catch (e) { next(e); }
});

// Text und Merkmale lassen sich einzeln aendern: die Umschalter in der
// Kopfzeile schicken nur ihr eigenes Feld, ohne den Text anzufassen.
app.put('/api/comments/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Nicht gefunden' });

  /* DIE ZWEITE ROUTE MIT ZWEI RECHTEKLASSEN IN EINEM RUMPF.
       TEXT       -- nur der Verfasser. AUCH DER ADMIN NICHT. Eine fremde
                     Aussage unter fremdem Namen zu veraendern ist die Art
                     Funktion, die man spaeter bereut.
       ART/ANPINNUNG -- Verfasser oder Admin. Die Anpinnung wirkt auf die
                     Sortierung fuer ALLE ("pinned DESC" steht ganz vorn), und
                     bei vielen angepinnten Kommentaren mehrerer Leute braucht
                     jemand ein Mittel dagegen. Sie aendert keine Aussage und
                     ist jederzeit umkehrbar.
     Beide Fragen stehen VOR dem ersten UPDATE: sonst waere ein abgelehnter
     Ruf, der Text und Anpinnung zugleich schickt, zur Haelfte ausgefuehrt. */
  if (req.body.text !== undefined && !nurSelbst(req, c.user_id))
    return res.status(403).json({ error: VERWEIGERT_SELBST });
  if ((req.body.kind !== undefined || req.body.pinned !== undefined) && !darfAendern(req, c.user_id))
    return res.status(403).json({ error: VERWEIGERT_SELBST });

  if (req.body.text !== undefined) {
    const text = String(req.body.text).trim();
    if (!text) return res.status(400).json({ error: 'Text fehlt' });
    db.prepare(`UPDATE comments SET text = ?, updated_at = datetime('now') WHERE id = ?`).run(text, c.id);
  }
  // Eine Aenderung der Merkmale ist keine Bearbeitung des Textes und setzt
  // deshalb kein "bearbeitet" -- sonst stuende das an jedem angepinnten
  // Kommentar, ohne dass jemand am Text war.
  if (req.body.kind !== undefined)
    db.prepare('UPDATE comments SET kind = ? WHERE id = ?').run(kindWert(req.body.kind), c.id);
  if (req.body.pinned !== undefined)
    db.prepare('UPDATE comments SET pinned = ? WHERE id = ?').run(req.body.pinned ? 1 : 0, c.id);

  touch.run(c.item_id);
  res.json(detail(c.item_id, req.benutzer.id));
});

// Bilder an einem bestehenden Kommentar nachreichen.
app.post('/api/comments/:id/images', kommentarBildUpload.array('images', BILD_ZAHL), async (req, res, next) => {
  try {
    const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
    if (!c) return res.status(404).json({ error: 'Nicht gefunden' });
    // HINZUFUEGEN nur der Verfasser -- ein Bild an einem fremden
    // Kommentar waere ein Zusatz zu einer fremden Aussage. Das Entfernen darf
    // der Admin (siehe die Loeschroute weiter unten); der Unterschied ist
    // Absicht und ausdruecklich entschieden.
    if (!nurSelbst(req, c.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
    const da = db.prepare('SELECT COUNT(*) n FROM comment_images WHERE comment_id = ?').get(c.id).n;
    if (da + (req.files || []).length > BILD_ZAHL)
      return res.status(400).json({ error: `Mehr als ${BILD_ZAHL} Bilder je Kommentar sind nicht vorgesehen.` });
    const k = await kodiereAlle(req.files);
    if (k.fehler) return res.status(400).json({ error: k.fehler });
    /* Anhaengen IST Bearbeiten -- und hierher kommt nach der Klemme oben nur
       der Verfasser. Ein Vermerk kann an diesem Weg deshalb gar nicht
       entstehen: der Admin haengt nichts an.
       KEIN BILD, KEINE BEARBEITUNG: ein Ruf ohne Datei hat nichts angehaengt,
       und "bearbeitet" waere dann eine Aussage ueber nichts. */
    if (k.bilder.length) {
      speichereKommentarBilder(c.id, k.bilder);
      kommentarBearbeitet.run(c.id);
    }
    touch.run(c.item_id);
    res.status(201).json(detail(c.item_id, req.benutzer.id));
  } catch (e) { next(e); }
});

// LOESCHEN darf der Admin, hinzufuegen nicht. c.user_id steht deshalb
// mit im SELECT -- eine Spalte, die man vergleicht, muss auch im Ergebnis
// stehen, sonst ist der Vergleich gegen undefined und die Pruefung dazu kann
// gar nicht scheitern.
app.delete('/api/comment-images/:id', (req, res) => {
  const b = db.prepare(`SELECT ci.id, ci.comment_id, c.item_id, c.user_id FROM comment_images ci
                        JOIN comments c ON c.id = ci.comment_id WHERE ci.id = ?`).get(req.params.id);
  if (!b) return res.status(404).json({ error: 'Nicht gefunden' });
  if (!darfAendern(req, b.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
  db.prepare('DELETE FROM comment_images WHERE id = ?').run(b.id);
  /* HIER GILT GENAU EINES VON BEIDEN, NIE BEIDES UND NIE KEINES -- deshalb ein
     if/else und nicht zwei Bedingungen nebeneinander.

     DER EINGRIFFSVERMERK. Hochgezaehlt NUR, wenn ein anderer als der
     Verfasser entfernt -- wer bei sich aufraeumt, greift in keine fremde
     Aussage ein. Eine HERRENLOSE Zeile (user_id IS NULL) hat keinen
     Verfasser, also ist jeder Entfernende ein anderer; die Bedingung faellt
     dort von selbst richtig aus.
     Nicht zuruecksetzbar: es gibt keinen Weg, der die Zahl je verkleinert.
     Ein blankes UPDATE auf die eine Zeile -- kein OR REPLACE, an einem
     Kommentar haengen Bilder, und die duerfen dabei nicht mitgehen.

     "BEARBEITET" dagegen im anderen Zweig: Entfernen ist Bearbeiten, genau wie
     Anhaengen. Es steht nur dem Verfasser zu -- traege der Kommentar nach dem
     Eingriff eines Admins "bearbeitet", saehe die fremde Loeschung aus wie
     seine eigene Bearbeitung. */
  if (b.user_id !== req.benutzer.id)
    db.prepare('UPDATE comments SET images_removed = images_removed + 1 WHERE id = ?').run(b.comment_id);
  else
    kommentarBearbeitet.run(b.comment_id);
  // Sortiernummern lueckenlos halten, wie bei Fotos, Links und Dateien.
  const rest = db.prepare('SELECT id FROM comment_images WHERE comment_id = ? ORDER BY sort_order, id').all(b.comment_id);
  const u = db.prepare('UPDATE comment_images SET sort_order = ? WHERE id = ?');
  rest.forEach((r, i) => u.run(i, r.id));
  touch.run(b.item_id);
  reclaim();
  res.json(detail(b.item_id, req.benutzer.id));
});

// Bild eines Kommentars ausliefern. Dieselben Regeln wie bei den Anhaengen.
// Der Name ist immer .jpg, weil beim Hochladen neu kodiert wurde -- damit
// steht der ausgelieferte Typ ohnehin fest.
app.get('/api/comment-images/:id/raw', (req, res) => {
  const b = db.prepare('SELECT * FROM comment_images WHERE id = ?').get(req.params.id);
  if (!b) return res.status(404).end();
  anh.setzeKopfzeilen(res, 'bild.jpg', { inline: true });
  res.send(req.query.size === 'thumb' && b.thumb ? b.thumb : b.data);
});

app.delete('/api/comments/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  // Ein Kommentar, den es nicht gibt, antwortet weiterhin mit 204 -- das war
  // schon vorher so und ist keine Rechtefrage.
  if (c && !darfAendern(req, c.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  if (c) touch.run(c.item_id);
  res.status(204).end();
});

/* ---- Kennzahlen ---- */
// NUR DER ADMIN. Die Zahlen sagen, wie gross der Bestand und wie belegt die
// Datenbank ist -- das ist eine Aussage ueber die Anlage als Ganzes und nicht
// ueber den Einzelnen. Lesende Route, deshalb steht sie in keiner Liste
// schreibender Routen; der Waechter davor ist derselbe wie bei
// GET /api/users/:id/bestand.
// Der Schluesselwert weiter unten im Rumpf bleibt eine ZWEITE, engere Klemme:
// den bekommt weiterhin nur der Eigentuemer. Zusammenlegen liesse sich das
// nicht -- es sind zwei verschiedene Fragen an dieselbe Antwort.
app.get('/api/stats', nurAdmin, (req, res) => {
  let dbBytes = 0;
  try { db.pragma('wal_checkpoint(PASSIVE)'); dbBytes = fs.statSync(DB_FILE).size; } catch {}
  const p = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos').get();
  const an = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(size),0) AS o FROM attachments').get();
  res.json({
    version: VERSION,
    // Der Abdruck steht hier und nicht in /api/config: er ist dieselbe Art
    // Aussage wie die Zahlen darunter -- eine ueber die ANLAGE ALS GANZES.
    // Und die Liste in /api/config ist ausdruecklich abgeschlossen; was
    // dort steht, sieht jeder, der die Adresse kennt. Der Abdruck nagelt
    // den laufenden Dateisatz fest und geht deshalb nicht vor die Anmeldung.
    abdruck: ABDRUCK,
    dbBytes, photoCount: p.n, photoBytes: p.o,
    attachmentCount: an.n, attachmentBytes: an.o,
    itemCount: db.prepare('SELECT COUNT(*) n FROM items').get().n,
    commentCount: db.prepare('SELECT COUNT(*) n FROM comments').get().n,
    linkCount: db.prepare('SELECT COUNT(*) n FROM links').get().n,
    testDayCount: db.prepare('SELECT COUNT(*) n FROM test_days').get().n,
    keyFromEnv,
    // Nur wenn der Schluessel ohnehin schon neben der Datenbank liegt. Kommt er
    // aus der Umgebung, gibt es nichts abzuschreiben -- und dann hat er in
    // einer Antwort auch nichts verloren.
    // Und nur an den Eigentuemer. Er steht in derselben Rechtezeile
    // wie Export und Import -- alles, was die Anlage als Ganzes
    // betrifft. Ein Admin verwaltet den Bestand, er oeffnet nicht die Datei.
    keyHex: (keyFromEnv || !istEigentuemer(req)) ? null : keyHex
  });
});

/* ---- Export ---- */
// Nur der Eigentuemer. Die Exportdatei ist der gesamte Bestand in
// einer Datei, die das Haus verlaesst -- mit allen Fotos, allen Anhaengen und
// den Namen aller Verfasser. "Alles sehen darf jeder" gilt fuer
// den Bildschirm, nicht fuer die Mitnahme.
// HINZUNEHMENDE FOLGE, und sie gehoert in den Betrieb: ein Admin ohne
// Eigentuemerrecht kann keine Sicherung mehr ziehen.
app.get('/api/export', nurEigentuemer, (req, res) => {
  const withPhotos = req.query.photos !== '0';
  // Eigener Schalter, Vorgabe aus: bei 50 MB je Datei waere die Exportdatei
  // sonst schnell unhandlich -- Base64 blaeht zusaetzlich um ein Drittel auf.
  const withFiles = req.query.files === '1';
  // favorite nennt den Favoriten DESSEN, DER EXPORTIERT -- dieselbe
  // Bedeutung wie im Feld favorite der Schnittstelle. Der Feldname bleibt,
  // damit aeltere Dateien einspielbar bleiben.
  // BEWUSST: der Verfasser kommt zu Eintrag, Bewertung, Kommentar und
  // Testtag, NICHT zum Favoriten. Er ist eine Aussage ueber einen Eintrag und
  // nicht sein Inhalt; eine Liste fremder Favoriten in der Datei waere
  // Ablage, kein Bestand.
  const exportPins = new Set(qMeinePins.all(req.benutzer.id).map(p => p.item_id));
  // EINE Karte von der Id auf den Namen, einmal je Aufruf gebaut und
  // an vier Stellen benutzt -- statt vier LEFT JOINs auf users. Ein Ort, der
  // aus einer Id einen Namen macht; die Gegenrichtung im Import hat aus
  // demselben Grund ebenfalls genau einen.
  // Der Name wird geliefert, NICHT die Id: eine nackte Id liest niemand, und
  // sie waere in einer Datei, die das Haus verlaesst, eine Angabe ueber eine
  // Person ohne jeden Nutzen. Wo eine Zeile herrenlos ist (ON DELETE SET NULL),
  // steht ausdruecklich null -- das Feld fehlt nie, damit sich "kein Verfasser"
  // von "altes Dateiformat" unterscheiden laesst.
  const namen = new Map(db.prepare('SELECT id, username FROM users').all().map(u => [u.id, u.username]));
  const verfasserName = (id) => (id == null ? null : (namen.get(id) || null));
  const items = db.prepare('SELECT * FROM items ORDER BY id').all().map(it => {
    const o = {
      title: it.title, description: it.description,
      rejected: !!it.rejected, tested: !!it.tested, favorite: exportPins.has(it.id),
      // Der Eintrag selbst nennt seinen Verfasser: ohne dieses Feld schoebe
      // eine ersetzende Wiederherstellung ALLE Eintraege dem Einspielenden zu.
      author: verfasserName(it.user_id),
      created_at: it.created_at, updated_at: it.updated_at,
      category: it.product_category_id ? qCat.get(it.product_category_id).name : null,
      tags: qTags.all(it.id).map(t => t.name),
      links: qLinks.all(it.id).map(l => l.url),
      // ORDER BY day, id: zwei Leute duerfen denselben Tag eintragen. Ohne
      // die zweite Bedingung haetten die beiden Zeilen keine feste
      // Reihenfolge in der Datei.
      testDays: db.prepare('SELECT id, day, rating, user_id FROM test_days WHERE item_id = ? ORDER BY day, id').all(it.id)
        .map(t => ({ day: t.day, rating: t.rating, author: verfasserName(t.user_id),
                     tags: qTestDayTags.all(t.id).map(x => x.name) })),
      // Dasselbe hier: je Kriterium steht eine Zeile JE BEWERTER in der Tabelle.
      // Ohne den Verfasser fielen sie beim Einspielen alle auf dieselbe Zeile
      // und ueberschrieben einander -- nur die letzte ueberlebte.
      ratings: db.prepare(`SELECT c.name, r.value, r.user_id FROM ratings r
                           JOIN rating_criteria c ON c.id = r.criterion_id WHERE r.item_id = ?
                           ORDER BY c.sort_order, c.id, r.user_id`).all(it.id)
        .map(r => ({ name: r.name, value: r.value, author: verfasserName(r.user_id) })),
      comments: db.prepare('SELECT id, text, kind, pinned, created_at, updated_at, user_id FROM comments WHERE item_id = ? ORDER BY id')
        .all(it.id).map(c => ({
          text: c.text, kind: c.kind, pinned: !!c.pinned, author: verfasserName(c.user_id),
          created_at: c.created_at, updated_at: c.updated_at,
          // Kommentarbilder folgen dem Schalter der Dateien; ein dritter waere
          // zu viel. Die Merkmale gehen immer mit, sie kosten nichts.
          images: withFiles
            ? db.prepare('SELECT filename, data FROM comment_images WHERE comment_id = ? ORDER BY sort_order, id')
                .all(c.id).map(b2 => ({ filename: b2.filename, data_base64: b2.data.toString('base64') }))
            : []
        })),
      photos: [], attachments: []
    };
    if (withPhotos) {
      o.photos = db.prepare('SELECT mime_type, data, focus_x, focus_y FROM photos WHERE item_id = ? ORDER BY sort_order, id').all(it.id)
        .map(p => ({ mime_type: p.mime_type, focus_x: p.focus_x, focus_y: p.focus_y,
                     data_base64: p.data.toString('base64') }));
    }
    if (withFiles) {
      o.attachments = db.prepare('SELECT filename, mime_type, data FROM attachments WHERE item_id = ? ORDER BY sort_order, id')
        .all(it.id)
        .map(a2 => ({ filename: a2.filename, mime_type: a2.mime_type, data_base64: a2.data.toString('base64') }));
    }
    return o;
  });
  const title = getSetting('title_app', 'Kriterion');
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kriterion';
  // Zusaetzliches Feld, damit die Kriterienreihenfolge den Export ueberlebt.
  // Bestehende Feldnamen bleiben unveraendert, aeltere Dateien ohne dieses
  // Feld lassen sich weiterhin einspielen.
  const criteria = db.prepare('SELECT name FROM rating_criteria ORDER BY sort_order, id').all().map(c => c.name);
  res.set('Content-Disposition', `attachment; filename="${slug}-export-${new Date().toISOString().slice(0,10)}.json"`);
  // Formatnummer 6 (mit Verfassernamen). Sie ist eine AUSSAGE, keine
  // Bedingung: weder der Import noch die Oberflaeche lesen sie. Entschieden
  // wird ueber das Vorhandensein der Felder -- nur so bleiben aeltere Dateien
  // lesbar, ohne dass irgendwo eine Fallunterscheidung nach Nummer steht.
  res.json({ exported_at: new Date().toISOString(), title, version: 6, criteria, items });
});

/* ---- Import ---- */
const importUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 900 * 1024 * 1024 } });

/* Nur der Eigentuemer. EINE EXPORTDATEI KANN UNTER FREMDEM NAMEN SCHREIBEN:
   sie nennt zu jedem Eintrag, jeder Bewertung, jedem Kommentar und jedem
   Testtag einen Verfasser, und der Import ordnet sie einem vorhandenen Zugang
   zu. Das Umschreiben fremder Beitraege ist dem Admin ausdruecklich verboten
   -- ueber einen offenen Import waere genau das fuer jeden moeglich, ohne
   dass irgendwo "aendern" steht.
   Der Waechter steht VOR multer: eine bis zu 900 MB grosse Datei eines Fremden
   soll gar nicht erst eingelesen werden.
   BEIDE MODI, nicht nur "ersetzen": das Zusammenfuehren legt genauso Zeilen
   unter fremdem Namen an, es wirft nur nichts weg. */
app.post('/api/import', nurEigentuemer, importUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Keine Datei übermittelt' });
    const mode = req.body.mode === 'replace' ? 'replace' : 'merge';
    let payload;
    try { payload = JSON.parse(req.file.buffer.toString('utf8')); }
    catch { return res.status(400).json({ error: 'Die Datei ist kein gültiger Export.' }); }
    if (!payload || !Array.isArray(payload.items))
      return res.status(400).json({ error: 'Die Datei enthält nichts zum Einspielen.' });

    // Ableitungen vorab erzeugen: das geht nicht innerhalb einer Transaktion,
    // weil es asynchron ist.
    const prepared = [];
    // Kommentarbilder je Kommentarobjekt, damit sie in der Transaktion
    // bereitliegen. WeakMap geht nicht -- die Objekte werden dort mehrfach
    // nachgeschlagen.
    const kommentarBilder = new Map();
    for (const it of payload.items) {
      const photos = [];
      for (const p of it.photos || []) {
        if (!p.data_base64) continue;
        const buf = Buffer.from(p.data_base64, 'base64');
        const v = await makeVariants(buf);
        // Fokuspunkt aus der Datei uebernehmen; aeltere Exportdateien haben
        // ihn nicht und landen auf der Mitte.
        const im = (v2, vorgabe) => {
          const n = Number(v2);
          return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : vorgabe;
        };
        photos.push({ mime: p.mime_type || 'image/jpeg', buf, thumb: v.thumb, medium: v.medium,
                      fx: im(p.focus_x, 50), fy: im(p.focus_y, 50) });
      }
      const attachments = [];
      for (const a2 of it.attachments || []) {
        if (!a2.data_base64) continue;
        const buf = Buffer.from(a2.data_base64, 'base64');
        attachments.push({
          name: path.basename(String(a2.filename || 'datei')).slice(0, 200) || 'datei',
          mime: String(a2.mime_type || '').slice(0, 120), buf
        });
      }
      // Kommentarbilder vorab kodieren -- in der Transaktion darf nichts
      // Langsames oder Asynchrones mehr passieren.
      for (const c of it.comments || []) {
        const fertig = [];
        for (const b2 of c.images || []) {
          if (!b2.data_base64) continue;
          try {
            const { gross, klein } = await kodiereKommentarBild(Buffer.from(b2.data_base64, 'base64'));
            fertig.push({ name: path.basename(String(b2.filename || 'bild.jpg')).slice(0, 200), gross, klein });
          } catch { /* unlesbares Bild wird stillschweigend uebergangen */ }
        }
        if (fertig.length) kommentarBilder.set(c, fertig);
      }
      prepared.push({ it, photos, attachments });
    }

    const stats = { items: 0, photos: 0, comments: 0, links: 0, testDays: 0, attachments: 0 };

    /* EIN Ort, der aus einem Namen eine Id macht -- die Gegenrichtung
       zur Karte im Export. Die Regel:
       ein genannter Name, den es gibt, wird zugeordnet; alles andere faellt
       an den Einspielenden. Aeltere Dateien nennen gar keinen Namen und
       landen deshalb vollstaendig beim Einspielenden.

       EIN UNBEKANNTER NAME LEGT KEINEN ZUGANG AN. Taete er es, waere eine
       Exportdatei ein Weg an der Verwaltung und am Passwort vorbei:
       ein Zugang ohne Hash, den niemand angelegt hat.

       Das Suchen laeuft ueber die Spalte username, und die traegt COLLATE
       NOCASE -- die Gross- und Kleinschreibung entscheidet also nicht, und
       zwar an derselben Spalte wie bei der Anmeldung. Ein NACHLAUFENDES
       LEERZEICHEN trifft die Spalte dagegen nicht, deshalb das trim().

       Der Zwischenspeicher haelt auch den Fehlgriff fest -- sonst fragte eine
       Datei mit tausend Zeilen desselben unbekannten Namens tausendmal. */
    const namensSpeicher = new Map();
    const unbekannteNamen = new Set();
    let zugeordnet = 0;
    const qNachName = db.prepare('SELECT id FROM users WHERE username = ?');
    const verfasser = (name) => {
      const sauber = String(name == null ? '' : name).trim();
      if (!sauber) return req.benutzer.id;
      let id = namensSpeicher.get(sauber);
      if (id === undefined) {
        const u = qNachName.get(sauber);
        id = u ? u.id : null;
        namensSpeicher.set(sauber, id);
      }
      if (id == null) { unbekannteNamen.add(sauber); return req.benutzer.id; }
      // Der eigene Name ist kein Fremdverweis: er zaehlt nicht als zugeordnet,
      // sonst meldete jede selbst erzeugte Datei eine Zuordnung, die keine ist.
      if (id !== req.benutzer.id) zugeordnet++;
      return id;
    };

    // Ein einziger Vorgang: bricht etwas ab, bleibt der Bestand unveraendert.
    db.transaction(() => {
      if (mode === 'replace') {
        db.prepare('DELETE FROM items').run();
        db.prepare('DELETE FROM product_categories').run();
        db.prepare('DELETE FROM tags').run();
      }
      const catByName = (name) => {
        if (!name) return null;
        const f = db.prepare('SELECT id FROM product_categories WHERE name = ? COLLATE NOCASE').get(name);
        if (f) return f.id;
        return db.prepare('INSERT INTO product_categories (name) VALUES (?)').run(name).lastInsertRowid;
      };
      const tagByName = (name) => {
        const f = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE').get(name);
        if (f) return f.id;
        return db.prepare('INSERT INTO tags (name) VALUES (?)').run(name).lastInsertRowid;
      };
      const critByName = (name) => {
        const f = db.prepare('SELECT id FROM rating_criteria WHERE name = ? COLLATE NOCASE').get(name);
        if (f) return f.id;
        const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM rating_criteria').get().m + 1;
        return db.prepare('INSERT INTO rating_criteria (name, sort_order) VALUES (?, ?)').run(name, pos).lastInsertRowid;
      };

      // Kriterien vorab in der Reihenfolge der Datei anlegen. Vorhandene
      // behalten ihren Platz, neue haengen sich in dieser Reihenfolge hinten an.
      // Fehlt das Feld (aeltere Exportdatei), entstehen sie wie bisher in der
      // Reihenfolge, in der die Eintraege sie erwaehnen.
      for (const name of Array.isArray(payload.criteria) ? payload.criteria : []) {
        const clean = String(name || '').trim();
        if (clean) critByName(clean);
      }

      for (const { it, photos, attachments } of prepared) {
        // Der genannte Verfasser, wenn es ihn gibt -- sonst der
        // Einspielende.
        const id = db.prepare(`INSERT INTO items
          (title, description, rejected, tested, product_category_id, created_at, updated_at, user_id)
          VALUES (?, ?, ?, ?, ?, COALESCE(?, datetime('now')), COALESCE(?, datetime('now')), ?)`)
          .run(it.title || 'Ohne Titel', it.description || '',
               it.rejected ? 1 : 0, it.tested ? 1 : 0,
               catByName(it.category), it.created_at || null, it.updated_at || null,
               verfasser(it.author)).lastInsertRowid;
        // Der Favorit bleibt beim Einspielenden, auch wenn der Eintrag einem
        // anderen zufaellt: favorite heisst "habe ICH als Favorit markiert".
        if (it.favorite) db.prepare('INSERT OR IGNORE INTO item_pins (user_id, item_id) VALUES (?, ?)')
          .run(req.benutzer.id, id);
        stats.items++;

        for (const name of it.tags || [])
          db.prepare('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)').run(id, tagByName(name));

        // Dieselbe Regel wie beim Anlegen, damit sie an einer Stelle steht.
        // Fuer aeltere Exportdateien aendert das nichts -- dort traegt jede
        // Zeile bereits ein Schema und bleibt unveraendert.
        // Die Sortiernummer zaehlt je Eintrag und muss lueckenlos bleiben,
        // darf also nicht der eintragsuebergreifende
        // Zaehler in stats sein und nicht der Index der Rohliste, aus der
        // Leerzeilen herausfallen.
        let lpos = 0;
        (it.links || []).forEach((url) => {
          const sauber = normalisiereLink(url);
          if (!sauber) return;
          db.prepare('INSERT INTO links (item_id, url, sort_order) VALUES (?, ?, ?)')
            .run(id, sauber, lpos++);
          stats.links++;
        });

        for (const t of it.testDays || []) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(t.day || '')) continue;
          // OR REPLACE bleibt: die Datei ist die Wahrheit, der spaetere Wert
          // gewinnt. Das tut mehr, als es aussieht: REPLACE LOESCHT die
          // getroffene Zeile, und ueber ON DELETE CASCADE gehen deren
          // test_day_tags lautlos mit. Getroffen wird nur, was
          // UNIQUE(item_id, day, user_id) verletzt -- also nur derselbe Tag
          // DESSELBEN Verfassers; zwei Bewerter am selben Tag bleiben zwei
          // Zeilen. Fallen zwei unbekannte Namen auf den Einspielenden,
          // fallen sie doch zusammen -- deshalb die Protokollzeile unten.
          const einf = db.prepare(`INSERT OR REPLACE INTO test_days (item_id, day, rating, user_id) VALUES (?, ?, ?, ?)`)
            .run(id, t.day, Math.max(1, Math.min(5, Number(t.rating) || 1)), verfasser(t.author));
          // Aeltere Exportdateien haben hier kein Feld -- dann bleibt der
          // Testtag einfach ohne Tags.
          for (const name of Array.isArray(t.tags) ? t.tags : []) {
            const clean = String(name || '').trim();
            if (clean) db.prepare('INSERT OR IGNORE INTO test_day_tags (test_day_id, tag_id) VALUES (?, ?)')
              .run(einf.lastInsertRowid, tagByName(clean));
          }
          stats.testDays++;
        }

        // Wie bei Eintrag, Kommentar und Testtag: der genannte Verfasser, sonst
        // der Einspielende. Dieselbe Ueberlegung zu OR REPLACE wie beim
        // Testtag -- nur dass eine Bewertungszeile keine Kinder hat und ein
        // Zusammenfallen daher nur den Wert kostet, nicht noch Tags dazu.
        for (const r of it.ratings || [])
          db.prepare(`INSERT OR REPLACE INTO ratings (item_id, criterion_id, value, user_id) VALUES (?, ?, ?, ?)`)
            .run(id, critByName(r.name), Math.max(0, Math.min(5, Number(r.value) || 0)), verfasser(r.author));

        for (const c of it.comments || []) {
          // Aeltere Exportdateien kennen kind und pinned nicht -- dann gilt der
          // Kommentar als gewoehnliche Notiz.
          const einf = db.prepare(`INSERT INTO comments (item_id, text, kind, pinned, created_at, updated_at, user_id)
                        VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')), ?, ?)`)
              .run(id, c.text || '', kindWert(c.kind), c.pinned ? 1 : 0,
                   c.created_at || null, c.updated_at || null, verfasser(c.author));
          stats.comments++;
          (kommentarBilder.get(c) || []).forEach((b2, i) =>
            db.prepare(`INSERT INTO comment_images (comment_id, filename, data, thumb, sort_order)
                        VALUES (?, ?, ?, ?, ?)`)
              .run(einf.lastInsertRowid, b2.name, b2.gross, b2.klein, i));
        }

        photos.forEach((p, i) =>
          { db.prepare(`INSERT INTO photos (item_id, mime_type, data, thumb, medium, focus_x, focus_y, sort_order)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
              .run(id, p.mime, p.buf, p.thumb, p.medium, p.fx, p.fy, i); stats.photos++; });

        // Fehlt das Feld (aeltere Exportdatei oder Export ohne Dateien),
        // bleibt der Eintrag einfach ohne Anhaenge.
        attachments.forEach((a2, i) =>
          { db.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order)
                        VALUES (?, ?, ?, ?, ?, ?)`)
              .run(id, a2.name, a2.mime, a2.buf.length, a2.buf, i); stats.attachments++; });
      }
    })();

    renumberCriteria();
    reclaim();

    /* Die laute Haelfte. Ein Name, den es nicht gibt, faellt an den
       Einspielenden -- das ist die entworfene Regel und trotzdem der stillste
       denkbare Vorgang: beim Einspielen einer Mehrbenutzersicherung in eine
       frische Anlage zieht der gesamte Bestand wortlos um, und zwei Zeilen zur
       selben Sache fallen dabei ueber OR REPLACE zusammen. Deshalb steht die
       Liste in der Antwort UND im Protokoll -- die Antwort fuer den Pruefstand
       und die Abfrage von Hand, das Protokoll fuer den Betrieb, wo die
       Nachschau ohnehin mit "docker compose logs" anfaengt.
       Der Ausweg steht in der Zeile selbst: die fehlenden Zugaenge anlegen und
       noch einmal einspielen. */
    const unbekannt = [...unbekannteNamen].sort();
    if (unbekannt.length)
      console.log(`[Kriterion] Import: unbekannte Verfasser dem Einspielenden zugeordnet ` +
                  `(${unbekannt.length}): ${unbekannt.join(', ')}`);
    res.json({ ok: true, mode, ...stats,
               verfasserZugeordnet: zugeordnet, verfasserUnbekannt: unbekannt });
  } catch (e) { next(e); }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Unbekannter Fehler' });
});

/* ================= Start ================= */
async function backfillVariants() {
  const pending = db.prepare('SELECT id FROM photos WHERE thumb IS NULL OR medium IS NULL').all();
  if (!pending.length) return;
  console.log(`[Kriterion] Erzeuge Vorschaubilder für ${pending.length} Foto(s) ...`);
  const get = db.prepare('SELECT data FROM photos WHERE id = ?');
  const upd = db.prepare('UPDATE photos SET thumb = ?, medium = ? WHERE id = ?');
  let done = 0;
  for (const { id } of pending) {
    try {
      const row = get.get(id);
      if (!row) continue;
      const v = await makeVariants(row.data);
      upd.run(v.thumb, v.medium, id);
      done++;
    } catch (e) { console.error(`[Kriterion] Foto ${id} übersprungen:`, e.message); }
    await new Promise(r => setTimeout(r, 30));
  }
  console.log(`[Kriterion] ${done} Vorschaubild(er) erzeugt.`);
}

async function maintainStorage() {
  if (db.pragma('auto_vacuum', { simple: true }) !== 2) {
    db.pragma('auto_vacuum = INCREMENTAL');
    db.exec('VACUUM');
    db.pragma('wal_checkpoint(TRUNCATE)');
    console.log('[Kriterion] Automatische Speicherfreigabe eingerichtet.');
  } else {
    const free = db.pragma('freelist_count', { simple: true });
    const page = db.pragma('page_size', { simple: true });
    if (free * page > 32 * 1024 * 1024) { reclaim(); }
  }
}

/* ---- Versionsabdruck ---- */
// Die Versionsnummer kommt aus der package.json und sagt NICHTS ueber die
// uebrigen Dateien: wurden package.json und server.js ersetzt, public/app.js
// aber nicht, zeigt die Fusszeile die neue Version, waehrend die Oberflaeche
// sich alt verhaelt. Der Abdruck ist die Aussage, die die Versionsnummer nicht
// machen kann -- er aendert sich, sobald IRGENDEINE der beteiligten Dateien
// anders ist. Ein halb eingespielter Dateisatz zeigt damit einen Abdruck, der
// zu keiner Version gehoert.
//
// DIE LISTE WIRD ABGELEITET, NICHT GEPFLEGT, und zwar aus dem, was der Server
// wirklich tut: alles unter public/ liefert express.static aus, alles in
// require.cache unterhalb dieses Verzeichnisses fuehrt er aus. Eine zweite,
// gepflegte Liste hiesse zwei Wahrheiten ueber dieselbe Sache und liefe
// frueher oder spaeter auseinander.
//
// Damit kann die Falle gar nicht erst entstehen: pruefung.js und Doku/ liegen
// im Repo, aber NICHT im Abbild (.dockerignore). Ein Abdruck, der sie
// mitzaehlte, waere im Container ein anderer als auf der Platte und damit
// wertlos. Der Server laedt sie nicht und liefert sie nicht aus -- sie koennen
// also nicht hineingeraten, ohne dass jemand sie ausdruecklich hereinholt.
//
// DIE GRENZE, DIE DARAUS FOLGT, IST ABSICHT: zugang.js liegt im Abbild, wird
// aber nur von Hand aufgerufen und nie vom Server geladen. Es steht deshalb
// nicht im Abdruck. Der Abdruck sagt, WELCHER SERVER LAEUFT, nicht welches
// Werkzeug danebenliegt.
function dateienUnter(verzeichnis) {
  const raus = [];
  for (const e of fs.readdirSync(verzeichnis, { withFileTypes: true })) {
    const voll = path.join(verzeichnis, e.name);
    if (e.isDirectory()) raus.push(...dateienUnter(voll));
    else if (e.isFile()) raus.push(voll);
  }
  return raus;
}

function bildeAbdruck() {
  const ausgefuehrt = Object.keys(require.cache).filter(f =>
    f.startsWith(__dirname + path.sep) && !f.split(path.sep).includes('node_modules'));
  const liste = [...new Set([...ausgefuehrt, ...dateienUnter(path.join(__dirname, 'public'))])]
    .map(f => path.relative(__dirname, f).split(path.sep).join('/'))
    .sort();
  const h = crypto.createHash('sha256');
  for (const rel of liste) {
    // Der NAME gehoert mit hinein, sonst bliebe der Abdruck gleich, wenn zwei
    // Dateien ihre Inhalte tauschen oder eine umbenannt wird. Das Nullzeichen
    // trennt, damit sich Name und Inhalt nicht ineinanderschieben koennen.
    h.update(rel); h.update('\0');
    h.update(fs.readFileSync(path.join(__dirname, rel))); h.update('\0');
  }
  return h.digest('hex').slice(0, 8);
}

// Beim Start, nach allen require-Aufrufen: erst dann ist require.cache
// vollstaendig. Alle Module dieses Projekts werden am Dateianfang geladen; ein
// require INNERHALB einer Funktion machte diesen Abdruck unvollstaendig, und
// der Pruefstand haelt genau das fest.
const ABDRUCK = bildeAbdruck();

app.listen(PORT, () => {
  // holeBenutzer() ist hier RICHTIG: beim Start gibt es keine Anfrage und
  // damit keinen angemeldeten Benutzer. Gemeint ist der Eigentuemer, und so
  // steht es auch in der Zeile.
  const u = auth.holeBenutzer();
  console.log(`[Kriterion] Läuft auf Port ${PORT} — ` +
    (u ? `Eigentümer: ${u.username}` : 'noch kein Zugang, Einrichtung im Browser'));
  setTimeout(() => backfillVariants().then(maintainStorage).catch(e => console.error(e)), 1500);
});
