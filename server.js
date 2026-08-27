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
const mail = require('./mail');

const PORT = process.env.PORT || 3000;

/* ---- Die oeffentliche Adresse ----
   SEIT 0.8.80 BAUT DER BROWSER DES ADMINS DEN EINLADUNGSLINK aus location.
   Das ist sicher, braucht keine Einstellung und bleibt die Vorgabe -- "laeuft
   im Heimnetz" soll ohne Konfiguration auskommen. Es hat genau eine
   Bruchstelle: die Adresse, unter der der Admin zugreift, ist nicht immer die,
   die der Empfaenger benutzen soll. Wer ueber http://192.168.1.50:3100
   arbeitet und einen Link nach draussen gibt, gibt einen Link ins Leere.

   SIE GEHOERT IN DIE .env UND NICHT IN settings, dieselbe Linie wie
   HINTER_PROXY: sie entscheidet ueber Netzwerkvertrauen, nicht ueber eine
   Vorliebe. Der Hebel liegt in der Rollenleiter -- ein Admin kommt nicht an
   einen anderen Admin oder den Eigentuemer. Duerfte er die oeffentliche
   Adresse setzen, zeigte ab Stufe I jede verschickte Ruecksetzmail auf seinen
   Server, auch die, die sich der Eigentuemer selbst anfordert. Der
   Systembereich ZEIGT sie deshalb, er setzt sie nicht.

   AUS DEM HOST-KOPF WIRD WEITERHIN NICHTS ABGELEITET. Ueber einen gefaelschten
   Kopf liesse sich ein Link sonst auf einen fremden Server umbiegen -- die
   Einstellung ist die eine Stelle, an der jemand mit Zugriff auf den Wirt es
   sagt, und sonst niemand.

   ALLES AB ? UND # WIRD ABGEWIESEN: das Fragment traegt bereits den
   Schluessel, und eine Abfrage haette an einer Adresse, aus der ein Link
   gebaut wird, nichts zu suchen. Ein PFAD ist erlaubt -- die Anlage kann unter
   einem Unterpfad haengen.
   EIN UNBRAUCHBARER WERT BRICHT DEN START NICHT AB, sondern meldet sich laut
   und faellt auf den Browserweg zurueck -- dieselbe Form wie bei AUTH_RESET
   und beim fehlenden Sicherungsort. Ein Start, der an einem Tippfehler in
   einer OPTIONALEN Einstellung abbricht, ist schlimmer als der Tippfehler. */
const OEFFENTLICHE = auth.OEFFENTLICHE_ADRESSE;

/* Was die Antwort ueber den Link sagt. IST DIE EINSTELLUNG LEER, GIBT DER
   SERVER KEINEN LINK HERAUS -- der Browser baut ihn weiter selbst, und die
   Oberflaeche sagt daneben, woher die Adresse kam. Zwei Felder statt eines:
   aus einem fehlenden Link laesst sich "aus dem Browser" zwar erraten, aber
   eine Oberflaeche, die aus einer Abwesenheit eine Aussage macht, ist genau
   die zweite Wahrheit, die hier nicht entstehen soll. */
const linkAngabe = (klartext) => OEFFENTLICHE.adresse
  ? { link: `${OEFFENTLICHE.adresse}/#/einladung/${klartext}`, linkQuelle: 'einstellung' }
  : { link: null, linkQuelle: 'browser' };

/* ---- Der Versand eines Tokenlinks, seit 0.9.0 ----
   DER TOKEN ENTSTEHT ZUERST, DIE ANTWORT TRAEGT DEN LINK IMMER, UND DER
   VERSAND IST EIN FELD DARIN. Das ist die bauliche Form des Satzes, der ueber
   der ganzen Stufe steht: E-Mail ist eine Bequemlichkeit, keine Voraussetzung.
   Schlaegt der Versand fehl, bricht nichts ab -- der Admin sieht
   "Versand fehlgeschlagen" und daneben den Link zum Kopieren.

   DREI WERTE, und mehr gibt es nicht:
     'ok'              die Mail ist beim Server des Anbieters angenommen
     'fehlgeschlagen'  es wurde versucht und ging schief
     'aus'             es wurde gar nicht erst versucht
   DER GRUND STEHT DANEBEN, weil 'aus' allein drei verschiedene Lagen deckt --
   kein Mailzugang, keine oeffentliche Adresse, keine Adresse am Zugang. Ohne
   ihn saehe der Admin, DASS nichts hinausging, und nicht, was er tun soll.

   DIE OEFFENTLICHE ADRESSE IST PFLICHT FUER DEN VERSAND UND NICHT FUER DEN
   START. Das ist eine engere Auslegung als der Wortlaut des Konzeptpapiers
   ("ab Stufe I ist sie Pflicht"), und sie ist die einzig moegliche: ein
   Startabbruch braeche jede vorhandene Installation beim Einspielen dieser
   Version. Ohne sie wird nicht verschickt, die Karte sagt warum, und der Link
   steht wie immer daneben -- beim Kopieren baut ihn der Browser des Admins
   weiter selbst, wie seit 0.8.80.
   UND AUS DEM HOST-KOPF WIRD AUCH HIER NICHTS ABGELEITET: eine verschickte
   Mail waere die Stelle, an der ein gefaelschter Kopf am meisten wert waere. */
async function versendeTokenLink(ziel, t) {
  const zugang = mail.loeseAuf(getSetting(mail.SCHLUESSEL, null));
  if (!mail.eingerichtet(zugang))
    return { versand: 'aus', versandGrund: 'Es ist kein Mailzugang eingerichtet.' };
  if (!OEFFENTLICHE.adresse)
    return { versand: 'aus', versandGrund:
      'Ohne OEFFENTLICHE_ADRESSE in der .env wird nicht verschickt — der Server wüsste nicht, worauf der Link zeigen soll.' };
  if (!ziel.email)
    return { versand: 'aus', versandGrund: 'Für diesen Zugang ist keine E-Mail-Adresse hinterlegt.' };
  const angaben = {
    titel: getSetting('title_public', 'Bewertungskatalog'),
    username: ziel.username, link: `${OEFFENTLICHE.adresse}/#/einladung/${t.klartext}`,
    tage: auth.TOKEN_TAGE, minuten: auth.TOKEN_FRIST_MINUTEN
  };
  const einladung = t.zweck === 'einladung';
  const e = await mail.versende(zugang, ziel.email,
    einladung ? `Dein Zugang zu „${angaben.titel}“` : `Neues Passwort für „${angaben.titel}“`,
    einladung ? mail.textEinladung(angaben) : mail.textRuecksetzung(angaben));
  return e.ok ? { versand: 'ok', versandGrund: '' }
              : { versand: 'fehlgeschlagen', versandGrund: e.grund };
}

/* ---- Der Beleg der letzten Testmail, seit 0.9.0 ------------------------
   SIE BELEGT "mit DIESEN Werten ist einmal wirklich eine Mail hinausgegangen".
   Der Beleg haengt am HASH UEBER DEN ZUGANG: aendert sich irgendetwas am
   Zugang, passt die Marke nicht mehr, und zwar unabhaengig davon, auf welchem
   Weg der Wert in settings gelandet ist.
   SIE STEHT SEIT 0.9.1 HIER OBEN UND NICHT MEHR IN mailKarte(), weil sie
   inzwischen ZWEI Leser hat -- die Karte und den Schalter der Selbstanmeldung.
   ZWEI MECHANISMEN FUER EINE ZUSAGE SIND EINER ZU VIEL (Stolperstein 145):
   deshalb eine Funktion und zwei Rufer, nicht zwei Rechnungen. */
const MAILTEST_SCHLUESSEL = 'mailtestOk';
function mailtestStand(roh) {
  const test = getSetting(MAILTEST_SCHLUESSEL, null);
  return test && test.marke && test.marke === mail.marke(roh) ? test : null;
}

/* ---- Kann diese Anlage ueberhaupt verschicken, seit 0.9.1 --------------
   DREI VORAUSSETZUNGEN, UND ALLE DREI SIND NOETIG. Der Auftrag zu dieser Runde
   nennt nur die Testmarke; das traegt nicht, und der Grund ist nachgesehen und
   nicht angenommen: DIE TESTMAIL ENTHAELT KEINEN LINK und geht deshalb auch
   ohne OEFFENTLICHE_ADRESSE anstandslos durch. Die Marke kann gruen sein,
   waehrend versendeTokenLink() mit versand: 'aus' abbricht -- und dann ginge
   die Bestaetigungsmail nie hinaus, und die Selbstanmeldung liefe genau in die
   Leere, die die Kopplung verhindern soll.
   DER GRUND STEHT DANEBEN, aus demselben Grund wie bei versandGrund: "nicht
   bereit" allein sagt dem Admin nicht, was er tun soll. */
function versandBereit() {
  const roh = getSetting(mail.SCHLUESSEL, null);
  if (!mail.eingerichtet(roh))
    return { ok: false, grund: 'Es ist kein Mailzugang eingerichtet. Das macht der Eigentümer der Anlage.' };
  if (!mailtestStand(roh))
    return { ok: false, grund: 'Seit der letzten Änderung am Mailzugang ist keine Testmail durchgekommen. ' +
      'Der Eigentümer der Anlage drückt sie in der Karte „Mailversand“.' };
  if (!OEFFENTLICHE.adresse)
    return { ok: false, grund:
      'Ohne OEFFENTLICHE_ADRESSE in der .env wird nicht verschickt — der Server wüsste nicht, worauf der Link zeigen soll.' };
  return { ok: true, grund: '' };
}

/* ---- Die Bestaetigungsmail der Selbstanmeldung, seit 0.9.1 -------------
   DER DRITTE MAILANLASS. Sie traegt einen Link OHNE Passwortkraft: wer ihn
   anklickt, sagt nur "ja, das bin ich".

   SIE WIRD GERUFEN, NACHDEM DIE ANTWORT SCHON GESCHRIEBEN IST, und das ist
   keine Bequemlichkeit, sondern die Bedingung fuer die immer gleiche Antwort.
   Ein Weg, der eine Mail verschickt, dauert Sekunden; einer, der still
   verwirft, dauert Millisekunden -- und aus dem Unterschied liesse sich
   ablesen, welcher der beiden gelaufen ist. Damit waere das Formular doch
   wieder ein Werkzeug zum Durchprobieren von Namen und Adressen, nur eben
   ueber die Uhr statt ueber den Rumpf. NACHGEMESSEN STATT BEHAUPTET: der
   Pruefstand haelt beide Wege am troepfelnden Empfaenger gegeneinander.
   DER ANFRAGENDE VERLIERT DABEI NICHTS: er erfaehrt ueber den Versand ohnehin
   nichts, und erfahren duerfte er es auch nicht.

   DER SCHLUESSEL STEHT IM FRAGMENT (#/bestaetigung/…) und geht damit nie an
   den Server -- dieselbe Bauform wie beim Einladungslink, und hier zusaetzlich
   wertvoll: ein Vorschaudienst, der Links im Postfach vorab abruft, holt nur
   die Seite und bestaetigt damit gerade NICHT. */
async function versendeBestaetigung(name, adresse, klartext) {
  const zugang = mail.loeseAuf(getSetting(mail.SCHLUESSEL, null));
  if (!mail.eingerichtet(zugang) || !OEFFENTLICHE.adresse) return { ok: false, grund: 'aus' };
  const titel = getSetting('title_public', 'Bewertungskatalog');
  return mail.versende(zugang, adresse, `Bestätige deine Adresse für „${titel}“`,
    mail.textBestaetigung({ titel, username: name,
      link: `${OEFFENTLICHE.adresse}/#/bestaetigung/${klartext}`,
      stunden: auth.ANFRAGE_STUNDEN }));
}

const app = express();
app.use(express.json({ limit: '2mb' }));
/* Gilt fuer die ganze Anwendung.
   nosniff: der Browser darf den Typ nie selbst erraten.
   Die Sicherheitsregel ist die zweite Verteidigung hinter der Ableitung des
   Typs am Fotoweg -- zwei Schichten fuer denselben Fehler. Sie ist hier
   billig, weil die Oberflaeche nichts von aussen nachlaedt und kein
   onclick= in einem String kennt.
   'unsafe-inline' bei style-src ist NOETIG und keine Nachlaessigkeit: die
   Oberflaeche setzt Randabstaende, Rasterspalten und den Fokuspunkt als
   style="..."-Attribut, und eine Sicherheitsregel ohne diese Freigabe
   verwirft ausnahmslos jedes davon. script-src bleibt streng -- dort liegt
   die Wirkung. frame-src 'self' traegt die PDF-Vorschau, die ein iframe auf
   den eigenen Ursprung einbindet.
   media-src TRAEGT DIE VIDEOS, und beide Angaben sind noetig. 'self' erlaubt
   das Abspielen aus der eigenen Anlage. blob: erlaubt das Standbild VOR dem
   Hochladen: die Oberflaeche haengt die gewaehlte Datei als blob:-Adresse an
   ein <video>, um einen Einzelbild daraus zu ziehen. Eine blob:-Adresse an
   einem <video> faellt unter media-src, nicht unter img-src -- ohne die
   Freigabe verwirft der Browser sie WORTLOS, und es liesse sich ueberhaupt
   kein Video hochladen (im echten Chromium nachgemessen: "Refused to load
   media from blob:", MEDIA_ELEMENT_ERROR 4).
   Strict-Transport-Security nur hinter dem Proxy: im Heimnetz auf Port 3100
   spricht niemand HTTPS, und ein gesetzter Kopf sperrte die Anlage aus. */
const CSP_ANWENDUNG =
  "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; " +
  "style-src 'self' 'unsafe-inline'; script-src 'self'; frame-src 'self'; " +
  "frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Content-Security-Policy', CSP_ANWENDUNG);
  if (auth.HINTER_PROXY) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  // Erste, grobe Schranke am gemeldeten Typ. Sie haelt nichts auf, was sich
  // umbenennen laesst -- die tragende Pruefung ist rasterBild() weiter unten,
  // und die sieht das Ergebnis statt die Angabe.
  fileFilter: (req, file, cb) =>
    /^image\//.test(file.mimetype)
      ? cb(null, true)
      : cb(Object.assign(new Error('Nur Bilddateien sind erlaubt'), { status: 400 }))
});

/* Was als Foto hereinkommt, muss ein Rasterbild sein -- und zwar dem INHALT
   nach. sharp liest auch SVG anstandslos und macht daraus brauchbare
   Vorschaubilder; der Upload saehe also normal aus, und die Datei laege
   danach als Skripttraeger in der Datenbank. Dieselbe Regel gilt bei den
   Bildern in Kommentaren seit jeher, dort ueber die Neukodierung.
   Die Liste ist die aus dem Ideenpapier; svg fehlt darin mit Absicht. */
const RASTER_FORMATE = ['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff'];
async function rasterBild(buf) {
  try {
    const m = await sharp(buf).metadata();
    return RASTER_FORMATE.includes(m.format);
  } catch { return false; }
}

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
const PERSOENLICHE_SCHLUESSEL = ['filters', 'schrift', 'bloecke', 'linkZeilen', 'zeitleiste', 'suchNamen',
                                'zuletztGesehen'];

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
  /* registrierung SEIT 0.9.1: die Anmeldeseite muss wissen, ob sie das
     Formular ueberhaupt zeigen soll. Der Wert sagt nichts ueber den Bestand
     und nichts ueber einen Menschen -- er sagt, ob diese Anlage Anfragen
     annimmt, und das erfaehrt ohnehin jeder, der eine stellt.
     DIE LISTE BLEIBT ABGESCHLOSSEN: was hier auftaucht, sieht jeder, der die
     Adresse kennt. Der Pruefstand nagelt die Namen fest, und ein fuenfter
     kommt nicht stillschweigend dazu. */
  res.json({
    title: getSetting('title_public', 'Bewertungskatalog'), version: VERSION,
    setupRequired: !auth.benutzerVorhanden(), minPassword: auth.PASSWORT_MIN,
    registrierung: getSetting('registrierung', false) === true
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
  /* DER ZWEITE FAKTOR, SEIT 0.10.0 -- UND HIER, NACH DER PASSWORTPRUEFUNG.
     DIE AUSKUNFT "DIESER ZUGANG HAT EINEN ZWEITEN FAKTOR" KOMMT ERST NACH
     RICHTIGEM PASSWORT, und das ist baulich wahr statt beabsichtigt: die Zeile
     steht unterhalb von pruefeAnmeldung, und wer dort scheitert, hat die 401
     von oben laengst bekommen -- Byte fuer Byte dieselbe wie vor dieser Runde.
     Stuende die Frage weiter oben, waere die Anmeldeseite ein Werkzeug zum
     Durchprobieren von NAMEN: "dieser hat einen Faktor" heisst "diesen Namen
     gibt es".
     KEIN COOKIE. Es entsteht KEINE Sitzung und damit auch keine halbe -- was
     entsteht, ist ein Ausweis im Arbeitsspeicher, und sessions bleibt die eine
     Wahrheit ueber "angemeldet". */
  /* DER ZAEHLER DER BREMSE WIRD HIER NICHT ZURUECKGESETZT, und das ist ein
     Befund aus dem Bau dieser Runde und kein Feinschliff. Bis 0.10.0 stand
     noteSuccess unmittelbar hinter der Passwortpruefung -- richtig, solange
     die Anmeldung mit dem Passwort fertig war. Mit einem zweiten Schritt
     dahinter WAERE ES DIE LUECKE GEWESEN: wer das Passwort kennt und Ziffern
     raet, holte sich vor jedem Versuch einen frischen Ausweis, und dieser Ruf
     loeschte den Zaehler, den der zweite Schritt gerade aufgebaut hat. Die
     Bremse haette nie zugeschlagen, und sechs Ziffern waeren eine Million
     ungebremste Versuche gewesen.
     ZURUECKGESETZT WIRD ERST, WENN JEMAND WIRKLICH DRIN IST -- unten in
     dieser Route fuer den einstufigen Weg, und in POST /api/login/zwei fuer
     den zweistufigen. Eine halb gelungene Anmeldung ist kein Erfolg. */
  if (auth.zweifaktorAn(benutzer.id)) {
    return res.json({ zweifaktor: true, ...auth.erzeugeAnmeldeAusweis(benutzer.id) });
  }
  auth.noteSuccess(ip, user);
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(auth.legeSitzungAn(benutzer.id)));
  res.json({ ok: true });
});

/* DER ZWEITE SCHRITT DER ANMELDUNG, seit 0.10.0.
   DIE ACHTE ROUTE DER ART 'offen' -- im Kopf steht keine Rechtefrage, also MUSS
   die Schranke im Rumpf stehen, und sie heisst Ausweis UND Code. Beide zusammen:
   der Ausweis allein belegt nur, dass jemand das Passwort kannte.

   DIE BENUTZERNUMMER KOMMT AUS DEM AUSWEIS UND NIE AUS DEM RUMPF. Stuende sie
   dort, waere das richtige Passwort eines Zugangs die Eintrittskarte fuer jeden
   anderen -- man tippte den eigenen Namen, bekaeme den Ausweis und schriebe
   eine fremde Nummer hinein.

   DIE ANMELDEBREMSE GREIFT HIER AUSDRUECKLICH, mit unangetasteten Kennwerten
   und BEIDEN Haelften. Sie faellt an dieser Route nicht von selbst an: es ist
   ein eigener Weg neben POST /api/login, und ohne diese Zeilen liefe er an
   checkThrottle vorbei. Sechs Ziffern sind eine Million -- ungebremst waere das
   kein Faktor, sondern eine Verzoegerung. Der NAME ist hier bekannt (er haengt
   am Ausweis), also greift auch die verzoegernde Haelfte, genau wie bei
   POST /api/login und anders als an den Tokenrouten.

   DIE ABSAGE IST DIE EINE aus auth.js und nennt nicht, ob der Code falsch oder
   abgelaufen war -- das Heilmittel ist in beiden Faellen dasselbe. */
app.post('/api/login/zwei', async (req, res) => {
  const ip = auth.clientIp(req);
  const { ausweis, code } = req.body || {};
  /* DIE BREMSE STEHT GANZ VORN -- dieselbe Reihenfolge wie an POST /api/login
     und POST /api/bestaetigung. Ein gesperrter Aufrufer bekommt an JEDER
     Stelle dieselbe 429 und nirgends stattdessen eine Auskunft ueber seinen
     Ausweis.
     UND SIE IST DIE EINZIGE FORM, IN DER SICH DIE ZUSAGE UEBERHAUPT BELEGEN
     LAESST. Stuende sie hinter dem Ausweis, antwortete diese Route einem
     gesperrten Aufrufer mit einer 401 ueber den Ausweis -- und ob die Sperre
     hier ueberhaupt gilt, waere von aussen nicht mehr zu sehen: die 429 kaeme
     dann immer schon aus Schritt 1. Genau daran ist die erste Fassung der
     Bremsprobe STUMM geblieben (Stolperstein 163).
     GEZAEHLT WIRD HIER MIT DER IP-HAELFTE, denn der Name ist vor dem Ausweis
     nicht bekannt -- ihn aus dem Rumpf zu nehmen waere genau die Nummer aus
     dem Rumpf, die es hier nicht geben darf. Die HARTE Sperre haengt ohnehin
     allein an der Adresse; die verzoegernde Namenshaelfte hat der Aufrufer in
     Schritt 1 bereits bezahlt. Gefuettert werden unten beide. */
  const t = auth.checkThrottle(ip, null);
  if (t.blocked) {
    return res.status(429).json({
      error: `Zu viele Fehlversuche. Bitte in ${t.retryInSec} Sekunden erneut versuchen.`
    });
  }
  if (t.delayMs) await new Promise(r => setTimeout(r, t.delayMs));
  const id = auth.verbraucheAnmeldeAusweis(ausweis);
  if (!id) {
    auth.noteFailure(ip, null);
    return res.status(401).json({ error: 'Die Anmeldung ist abgelaufen. Bitte noch einmal von vorn.' });
  }
  const zugang = auth.holeZugang(id);
  const name = zugang ? zugang.username : null;
  /* ZWEITE NACHSCHAU AUF DEN STATUS. Zwischen den beiden Schritten liegen bis
     zu zwei Minuten, und in denen kann ein Admin gesperrt haben. Dieselbe
     Meldung wie im ersten Schritt -- der Aufrufer hat sein Passwort ja bereits
     belegt und darf deshalb erfahren, woran es liegt. */
  if (!zugang || zugang.status !== 'aktiv') {
    return res.status(403).json({ error: 'Dieser Zugang ist gesperrt. Der Admin kann ihn wieder freigeben.' });
  }
  if (!auth.pruefeZweitenFaktor(id, code)) {
    auth.noteFailure(ip, name);
    /* DIESELBE ZEILE WIE BEI EINEM FALSCHEN PASSWORT, und kein eigener Vorgang
       daneben: eine gescheiterte zweite Stufe IST eine gescheiterte Anmeldung.
       Sie steht hier und nicht in auth.pruefeZweitenFaktor -- die Funktion
       hat drei Rufer, und an den beiden anderen ist das Scheitern keine
       Anmeldung. */
    auth.protokolliere('anmeldung.fehl', { wer: null, ziel: id });
    /* EIN FRISCHER AUSWEIS LIEGT DER ABSAGE BEI, und das ist eine Entscheidung
       ueber die Bedienung, die der Sicherheit nichts nimmt.
       DER ALTE IST VERBRAUCHT -- "genau einmal" bleibt woertlich wahr. Ohne
       den neuen stuende ein Mensch nach EINEM Tippfehler wieder vor dem
       Passwortfeld, und das trifft ausgerechnet den, der einen zehnstelligen
       Wiederherstellungscode vom Zettel abschreibt.
       WAS DEN VERSUCH BEGRENZT, IST DIE BREMSE UND NICHT DIE FRIST. Nachgerechnet:
       wer das Passwort kennt und Ziffern raet, kaeme ohne den neuen Ausweis
       genauso weit -- er tippt das Passwort eben noch einmal, und die Bremse
       zaehlt beides gleich. Zehn Versuche je Adresse und fuenf Minuten Sperre
       stehen gegen eine Million Moeglichkeiten; der Unterschied liegt allein
       beim Ehrlichen. */
    return res.status(401).json({
      error: auth.ZWEITER_FAKTOR_ABSAGE, ...auth.erzeugeAnmeldeAusweis(id)
    });
  }
  auth.noteSuccess(ip, name);
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(auth.legeSitzungAn(id)));
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

/* ---- Der Token vor der Anmeldung ----
   ZWEI SCHREIBENDE ROUTEN DER ART 'offen' KOMMEN HIER DAZU -- die vierte und
   fuenfte neben setup, login und logout. Im Kopf steht keine Rechtefrage, also
   MUSS die Schranke im Rumpf stehen, und sie heisst Token.

   BEIDE SIND POST, obwohl die erste nur LIEST. Das ist kein Versehen: der
   Token gehoert in den RUMPF und nicht in Pfad oder Abfrage, wo er im
   Zugriffsprotokoll, in der Verlaufsliste und womoeglich im Referrer stuende.
   Der Waechter ueber den Quelltext sieht jedes app.post( an, deshalb steht die
   lesende hier mit in F_ROUTEN -- mit dieser Begruendung daneben.

   DIE ANMELDEBREMSE GREIFT AN BEIDEN. Ohne sie waeren sie ein Werkzeug zum
   Durchprobieren. Beim Token gibt es keinen Benutzernamen: die IP-Haelfte
   greift unveraendert, die Namenshaelfte faellt von selbst weg -- noteFailure
   legt bei leerem Namen gar keinen Zaehler an. Die Kennwerte sind
   unangetastet. */
const TOKEN_ABSAGE = 'Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern.';

// true = weitermachen. Bei false ist die Antwort bereits geschrieben.
async function tokenBremseFrei(req, res) {
  const t = auth.checkThrottle(auth.clientIp(req), null);
  if (t.blocked) {
    res.status(429).json({
      error: `Zu viele Fehlversuche. Bitte in ${t.retryInSec} Sekunden erneut versuchen.`
    });
    return false;
  }
  if (t.delayMs) await new Promise(r => setTimeout(r, t.delayMs));
  return true;
}

/* Was auf der Seite steht, BEVOR das Passwort gesetzt wird. Der Server nennt
   den Benutzernamen erst, wenn der Token traegt -- vorher verriete ein
   geratener Token einen Namen. Das Formular selbst ist damit schon die
   Bestaetigung, dass der Link gilt. */
app.post('/api/token/pruefen', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenBremseFrei(req, res)) return;
  const t = auth.pruefeToken((req.body || {}).token);
  if (!t) { auth.noteFailure(ip, null); return res.status(400).json({ error: TOKEN_ABSAGE }); }
  /* HIER BEGINNT DIE FRIST AUS 0.9.0, und nur hier: dies ist die eine Stelle,
     an der belegt ist, dass ein BROWSER den Schluessel in der Hand hat -- er
     steht im Fragment und kommt nur von dort. Ab dem ersten Oeffnen hat der
     Link in einem fremden Postfach nichts mehr verloren.
     WEITERE AUFRUFE RUEHREN NICHTS AN: beginneTokenFrist schreibt nur
     herunter, nie hinauf. Wer neu laedt, weil er gerade keine Zeit hatte,
     steht deshalb nicht vor einem toten Link -- genau der Fall, an dem die
     Sache sonst kippt.
     NICHT in auth.pruefeToken: die Funktion wird auch von loeseTokenEin
     gerufen, und das Einloesen darf die Frist nicht noch einmal anfassen.
     Kein noteSuccess: geprueft ist noch nicht eingeloest. */
  const minuten = auth.beginneTokenFrist(t.hash);
  res.json({
    username: t.username, ohnePasswort: t.ohnePasswort,
    minPassword: auth.PASSWORT_MIN, minuten
  });
});

/* Das Einloesen. Der Mindestwert von zehn Zeichen gilt unveraendert -- der Weg
   dorthin ist neu, die Regel nicht; sie steht in auth.loeseTokenEin an
   derselben Stelle wie fuer jeden anderen Weg.
   ANGEMELDET WIRD GLEICH MIT, dieselbe Ueberlegung wie bei /api/setup: ein
   zweites Formular unmittelbar nach dem ersten waere nur eine Huerde ohne
   Gewinn -- das Passwort wurde ja gerade hier gewaehlt. Die Sitzung entsteht
   NACH dem Einloesen, also nachdem alle bisherigen gefallen sind. */
app.post('/api/token/einloesen', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenBremseFrei(req, res)) return;
  const { token, passwort } = req.body || {};
  let ergebnis;
  try { ergebnis = await auth.loeseTokenEin(token, passwort); }
  catch (e) { auth.noteFailure(ip, null); return res.status(400).json({ error: e.message }); }
  auth.noteSuccess(ip, null);
  /* DER ZWEITE FAKTOR WIRD AUCH HIER VERLANGT, SEIT 0.10.0 -- UND DAS IST EINE
     SICHERHEITSFRAGE, KEINE BEQUEMLICHKEITSFRAGE.

     OHNE DIESE ZEILEN WAERE DER RUECKSETZLINK DER WEG AM ZWEITEN FAKTOR VORBEI,
     und zwar fuer genau den, gegen den er nicht schuetzen soll: ein Admin
     erzeugt fuer einen fremden Zugang einen Link (POST /api/users/:id/token),
     oeffnet ihn selbst, setzt ein Passwort -- und waere angemeldet. Derselbe
     Weg steht ihm ueber PUT /api/users/:id mit `passwort` offen; DORT schliesst
     ihn die Anmeldung, HIER muss er hier geschlossen werden. Ein zweiter Faktor,
     der ueber die Rollenleiter abzustreifen ist, sichert nichts.
     Der Link laeuft ausserdem ueber eine MAIL, also ueber einen fremden Server.

     DER SONDERFALL LOEST SICH BAULICH: ein Zugang, der seinen ERSTEN Link
     einloest, hat noch kein Passwort -- und kann deshalb keinen bestaetigten
     Faktor haben, denn einschalten setzt eine Anmeldung voraus und die ein
     Passwort. zweifaktorAn() ist dort schlicht falsch, und er kommt herein wie
     bisher. Der Pruefstand stellt das nach, statt es zu behaupten.

     DAS PASSWORT IST DABEI SCHON GESETZT und die alten Sitzungen sind gefallen.
     Das ist richtig so: der Link hat getan, wofuer er da war. Was er NICHT
     mehr tut, ist anmelden. */
  if (auth.zweifaktorAn(ergebnis.id)) {
    return res.json({
      ok: true, username: ergebnis.username, zweifaktor: true,
      ...auth.erzeugeAnmeldeAusweis(ergebnis.id)
    });
  }
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(auth.legeSitzungAn(ergebnis.id)));
  res.json({ ok: true, username: ergebnis.username });
});

/* ---- Die Selbstanmeldung vor der Anmeldung, seit 0.9.1 ----
   ZWEI SCHREIBENDE ROUTEN DER ART 'offen' KOMMEN HIER DAZU -- die sechste und
   siebte neben setup, login, logout und den beiden Tokenrouten. Im Kopf steht
   keine Rechtefrage, und im Rumpf steht auch keine: es DARF sie jeder. Was
   diese beiden Routen begrenzt, ist etwas anderes -- der Schalter, der Deckel,
   die Bremse und die immer gleiche Antwort.

   BEIDE SIND POST, obwohl die zweite fast nur nachschlaegt. Derselbe Grund wie
   bei /api/token/pruefen: der Schluessel gehoert in den RUMPF und nicht in
   Pfad oder Abfrage, wo er im Zugriffsprotokoll, in der Verlaufsliste und
   womoeglich im Referrer stuende.

   DIE ANMELDEBREMSE GREIFT AN BEIDEN, mit unangetasteten Kennwerten und ohne
   Namenshaelfte -- genau wie an den Tokenrouten. An der Anfrageroute ist sie
   die Schranke gegen das massenhafte Stellen, an der Bestaetigungsroute die
   gegen das Durchprobieren von Schluesseln. Der Benutzername der Anfrage geht
   ausdruecklich NICHT in die Bremse: er ist geraten, und ein Zaehler darauf
   waere ein Werkzeug, einen erwuenschten Namen auszusperren. */

/* DIE EINE ANTWORT. Sie steht als Konstante da und wird an DREI Stellen
   gegeben, damit sie gar nicht auseinanderlaufen kann -- Byte fuer Byte
   dieselbe, ob der Name frei war, ob er vergeben war, ob die Adresse schon an
   einem Zugang haengt, ob der Deckel erreicht ist oder ob der Schalter aus ist.
   ANDERNFALLS WAERE DAS FORMULAR EIN WERKZEUG ZUM DURCHPROBIEREN von Namen und
   Adressen, und zwar ein bequemeres als die Anmeldung: es steht ohne Passwort
   davor.
   SIE IST WAHR IN JEDEM DIESER FAELLE, und das ist mehr als eine
   Geschmacksfrage. "Wir haben dir eine Mail geschickt" waere in fuenf von
   sechs Lagen gelogen; der Satz unten sagt, was zu tun ist, ohne zu behaupten,
   welche Lage vorliegt. */
const ANFRAGE_ANTWORT = { ok: true, meldung:
  'Danke. Konnte zu diesen Angaben eine Anfrage entstehen, liegt jetzt eine E-Mail in deinem ' +
  'Postfach — bestätige darin, dass die Adresse dir gehört. Danach entscheidet ein Admin, ' +
  'ob ein Zugang angelegt wird.' };

app.post('/api/registrierung', async (req, res) => {
  if (!await tokenBremseFrei(req, res)) return;
  /* DER SCHALTER FUEHRT ZU DERSELBEN ANTWORT WIE ALLES ANDERE und nicht zu
     einer Absage. Eine eigene Absage waere eine zweite Auskunftsstelle ueber
     den Schalter neben /api/config -- und vor allem waere sie die eine Lage,
     an der sich die Antwort doch unterscheidet. "Abgewiesen" heisst hier: es
     entsteht nichts. Keine Zeile, keine Mail. */
  const an = getSetting('registrierung', false) === true;
  const { name, adresse } = req.body || {};
  const klartext = an ? auth.legeAnfrageAn(name, adresse) : null;
  res.json(ANFRAGE_ANTWORT);
  /* ERST DIE ANTWORT, DANN DER VERSAND. Die Begruendung steht bei
     versendeBestaetigung(): ein Weg, der auf den Mailserver wartet, waere
     an der Uhr von einem still verworfenen zu unterscheiden.
     DAS AUFFANGNETZ IST KEINE ZIERDE: hier haengt kein Aufrufer mehr an der
     Zusage, und eine unbehandelte Absage risse den ganzen Prozess mit.
     mail.versende() wirft zwar nicht -- aber diese Stelle darf sich nicht
     darauf verlassen muessen. */
  if (klartext) {
    versendeBestaetigung(String(name).trim(), String(adresse).trim(), klartext)
      .catch(e => console.error('[Kriterion] Bestaetigungsmail:', e && e.message));
  }
});

/* Die Bestaetigung. SIE LEGT KEINEN ZUGANG AN, SETZT KEIN PASSWORT UND MELDET
   NIEMANDEN AN -- sie setzt einen Zeitpunkt in einer Zeile. Das ist die ganze
   Wirkung des Links, und es ist der Grund, warum er in einem fremden Postfach
   nichts anrichten kann.
   ZWEI ANTWORTEN HIER, UND DAS IST KEIN WIDERSPRUCH ZUR EINEN OBEN: dort
   raet jemand Namen, hier braeuchte er 256 Bit. Wer den Schluessel hat, weiss
   ohnehin, was er angefragt hat; wer ihn nicht hat, erfaehrt aus der Absage
   nichts als "nicht dieser". Die Absage ist DIE EINE fuer alle Faelle --
   erfunden, verfallen, laengst freigeschaltet --, wie beim Token: das
   Heilmittel ist jedesmal dasselbe, naemlich die Anfrage neu stellen.
   DER NAME STEHT AUCH IN DER GUTEN ANTWORT NICHT. Er stuende sonst hinter
   einem geratenen Schluessel. */
app.post('/api/registrierung/bestaetigen', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenBremseFrei(req, res)) return;
  if (!auth.bestaetigeAnfrage((req.body || {}).schluessel)) {
    auth.noteFailure(ip, null);
    return res.status(400).json({ error:
      'Dieser Bestätigungslink gilt nicht mehr. Stell die Anfrage bitte noch einmal.' });
  }
  auth.noteSuccess(ip, null);
  res.json({ ok: true });
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

/* ---- Die zweite Bestaetigung ----
   WAS DIE ANLAGE ALS GANZES TRIFFT, WIRD EIN ZWEITES MAL BESTAETIGT. Die
   Grenze ist nicht "gefaehrlich", sondern dieselbe, an der schon die
   Eigentuemerrolle liegt. Verteidigt wird gegen eine FREMDE OFFENE SITZUNG --
   nicht gegen einen Fremden, der kommt ohne Passwort gar nicht herein.

   SIEBEN WEGE UEBER SECHS ROUTEN, und PUT /api/users/:id traegt zwei davon:
     export     GET    /api/export
     import     POST   /api/import
     rolle      PUT    /api/users/:id   (nur wenn rolle im Rumpf steht)
     passwort   PUT    /api/users/:id   (nur wenn passwort im Rumpf steht)
     entfernen  DELETE /api/users/:id
     link       POST   /api/users/:id/token
     mail       PUT    /api/mail
   MIT 0.9.0 KOMMT 'mail' DAZU -- sechs Wege ueber fuenf Routen werden sieben
   ueber sechs. Wer den Mailzugang setzt, entscheidet, ueber wessen Server
   jeder kuenftige Ruecksetzlink dieser Anlage laeuft.
   (Die Zahl stand von 0.8.90 bis 0.8.91 falsch da -- Stolperstein 137. Sie ist
   in Revision 20 des Projektstands nachgezaehlt worden und stimmt hier ab
   0.9.0 wieder, diesmal aus dem richtigen Grund.)
   AUSDRUECKLICH NICHT DAHINTER: Sperren und Freigeben (umkehrbar, und ein
   gesperrter Zugang ist nicht die Anlage), das Anlegen eines Zugangs (es
   erzeugt einen neuen und nimmt niemandem etwas) und POST /api/setup (dort
   gibt es kein bisheriges Passwort).

   DIE REGEL STEHT GENAU EINMAL, hier. Zwei Formen desselben Aufrufs, weil die
   Wege verschieden ankommen: der Waechter fuer die Routenzeile -- er MUSS es
   sein, wo multer dahinter steht -- und die Frage im Rumpf, wo erst der Rumpf
   sagt, ob ueberhaupt bestaetigt werden muss. */
const VERWEIGERT_BESTAETIGUNG = 'Dafür ist dein Passwort nötig — bitte noch einmal bestätigen.';

// true = weitermachen. Bei false ist die Antwort bereits geschrieben.
// 403 und NICHT 401: der Zugang gilt weiter, nur diese eine Handlung nicht.
// Ein 401 wuerfe die Oberflaeche auf die Anmeldeseite.
function zweiteBestaetigung(req, res, zweck, ziel = null) {
  const token = auth.parseCookies(req)[auth.COOKIE_NAME];
  if (auth.verbraucheFreigabe(token, zweck, ziel)) return true;
  res.status(403).json({ error: VERWEIGERT_BESTAETIGUNG, bestaetigung: zweck });
  return false;
}

// Dieselbe Frage als Waechter in der Routenzeile. Das Ziel kommt aus der
// Adresse -- bei Export und Import gibt es keins.
const zweiteBestaetigungNoetig = (zweck) => (req, res, next) => {
  const ziel = req.params.id === undefined ? null : req.params.id;
  if (zweiteBestaetigung(req, res, zweck, ziel)) next();
};

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
   zu werden, es entsteht kein Migrationscode, und zu 1.0 ist nichts
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
  // Die eigene Adresse steht hier und nirgends sonst: sie gehoert dem, der sie
  // hat. GET /api/users liefert sie ausdruecklich NICHT mit -- ein Admin
  // braucht fuer seine Arbeit die Zugaenge, nicht die Postfaecher.
  /* DER ZUSTAND DES ZWEITEN FAKTORS REIST HIER MIT, SEIT 0.10.0 -- und deshalb
     kommt keine lesende Route dazu. Die Karte "Zugang" holt diese Antwort
     ohnehin, und damit steht "an seit ..." oder "aus" da, OHNE dass jemand
     erst einen Knopf druecken muss.
     DAS GEHEIMNIS IST NIE DARIN, auch nicht fuer den Eigentuemer. Dieselbe
     Linie wie beim Mailpasswort: die Karte sagt an oder aus, nie den Wert. */
  res.json({ username: req.benutzer.username, minPassword: auth.PASSWORT_MIN,
             email: auth.holeZugang(req.benutzer.id)?.email || '',
             zweifaktor: auth.zweifaktorStand(req.benutzer.id) });
});

app.put('/api/account', async (req, res) => {
  const { oldPassword, username, newPassword, email } = req.body || {};
  let ergebnis;
  try {
    // WESSEN Zugang. Ohne diese Angabe aenderte jeder den des Eigentuemers,
    // sobald er dessen Passwort raet.
    // Die Adresse geht denselben Weg wie Name und Passwort -- hinter dem
    // BISHERIGEN Passwort. Sie entscheidet, wohin der naechste Ruecksetzlink
    // geht; eine uebernommene Sitzung soll sie nicht nebenbei umbiegen koennen.
    ergebnis = await auth.aendereZugang(req.benutzer.id, oldPassword, username, newPassword, email);
  } catch (e) { return res.status(400).json({ error: e.message }); }
  // Alle anderen Sitzungen DIESES Benutzers fallen. Wer das Passwort wechselt,
  // will meist genau das; die eigene bleibt, sonst wuerde man sich selbst
  // hinauswerfen. Die Zeile selbst steht in auth.js -- der Knopf "alle anderen
  // beenden" ruft dieselbe, und zwei Ausfuehrungen derselben Regel liefen
  // auseinander.
  auth.beendeAndereSitzungen(req.benutzer.id, auth.parseCookies(req)[auth.COOKIE_NAME]);
  res.json(ergebnis);
});

/* ---- Meine Sitzungen ----
   PERSOENLICH, KEIN SYSTEMBEREICH FUER ADMINS: die Karte steht beim eigenen
   Zugang, neben "Passwort aendern". EIN ADMIN SIEHT KEINE FREMDEN SITZUNGEN --
   fuer den Ernstfall gibt es das Sperren, und setzeStatus loescht sie bereits
   mit. Ein zweiter Weg dorthin waere Stolperstein 47.
   Beide schreibenden Routen tragen die Art 'selbstbezug': sie sind baulich auf
   die eigenen Zeilen begrenzt, weil user_id aus req.benutzer kommt und nicht
   aus der Adresse -- dieselbe Form wie bei PUT /api/account.
   DIE FESTE ROUTE STEHT VOR DER PLATZHALTERROUTE (Stolperstein 11). */
app.get('/api/sessions', (req, res) => {
  const eigener = auth.parseCookies(req)[auth.COOKIE_NAME];
  res.json({ sitzungen: auth.sitzungenVon(req.benutzer.id, eigener), tage: auth.SESSION_DAYS });
});

app.delete('/api/sessions', (req, res) => {
  const eigener = auth.parseCookies(req)[auth.COOKIE_NAME];
  res.json({ beendet: auth.beendeAndereSitzungen(req.benutzer.id, eigener) });
});

app.delete('/api/sessions/:kennung', (req, res) => {
  const eigener = auth.parseCookies(req)[auth.COOKIE_NAME];
  // Die eigene ueber diesen Weg zu beenden waere ein zweiter Abmeldeweg neben
  // POST /api/logout -- und einer, nach dem die Oberflaeche weiterliefe, als
  // waere nichts gewesen.
  if (auth.sitzungsKennung(eigener || '') === String(req.params.kennung)) {
    return res.status(400).json({ error: 'Die eigene Anmeldung wird über „Abmelden“ beendet.' });
  }
  const n = auth.beendeSitzung(req.benutzer.id, req.params.kennung);
  if (!n) return res.status(404).json({ error: 'Diese Anmeldung gibt es nicht mehr.' });
  res.json({ beendet: n });
});

/* ---- Der zweite Faktor, seit 0.10.0 ----
   VIER SCHREIBENDE ROUTEN, ALLE DER ART 'selbstbezug': die Benutzernummer
   kommt aus req.benutzer und steht in keinem Pfad. Das ist nicht bloss
   ordentlich, es ist die ganze Rechtefrage dieses Bereichs -- JEDER SCHALTET
   IHN FUER SICH SELBST EIN UND AUS, und es gibt keine Adresse, unter der ein
   Fremder gemeint waere. Kein nurAdmin, kein nurEigentuemer, keine
   Rollenleiter: sie haetten hier nichts zu entscheiden.

   EINSCHALTEN GEHT IN ZWEI SCHRITTEN, und der zweite ist der Beleg:
     POST /api/zweifaktor/start  erzeugt das Geheimnis und gibt es EINMAL heraus
     POST /api/zweifaktor/an     nimmt einen Code aus der App entgegen und
                                 schaltet ein -- erst hier entstehen die
                                 Wiederherstellungscodes
   Ein Schritt allein waere ein Zugang, den niemand mehr oeffnet: das Geheimnis
   stuende in der Datenbank, ohne dass je belegt waere, dass es auch auf dem
   Telefon angekommen ist.

   ALLE VIER STEHEN HINTER DEM BISHERIGEN PASSWORT, auch das Einschalten. Beim
   Ausschalten ist das offensichtlich; beim EINSCHALTEN ist es der weniger
   offensichtliche und genauso wichtige Fall: eine uebernommene offene Sitzung
   koennte sonst einen zweiten Faktor auf ein FREMDES Telefon legen und den
   Eigentuemer damit aussperren. Dieselbe Schranke wie an PUT /api/account
   nebenan, und aus verwandtem Grund.

   DAS GEHEIMNIS KOMMT AUS KEINER ANTWORT HERAUS, SOBALD ES BESTAETIGT IST --
   auch nicht an den Eigentuemer. POST /api/zweifaktor/start ist die eine
   Antwort, in der es steht, wie beim Token der Klartext, und danach nie wieder. */

// Das bisherige Passwort, an allen vier Wegen dieselbe Frage. Sie steht EINMAL
// hier und nicht viermal daneben. true = weitermachen; bei false ist die
// Antwort bereits geschrieben.
// 403 und nicht 401: der Zugang gilt weiter, nur diese eine Handlung nicht --
// dieselbe Ueberlegung wie bei der zweiten Bestaetigung.
async function eigenesPasswortStimmt(req, res, passwort) {
  const zeile = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.benutzer.id);
  if (zeile && await auth.pruefePasswort(String(passwort || ''), zeile.password_hash)) return true;
  res.status(403).json({ error: 'Das Passwort stimmt nicht.' });
  return false;
}

/* Schritt eins. DER OEFFENTLICHE TITEL WIRD MITGEGEBEN, damit in der App
   steht, wozu der Code gehoert -- er steht ohnehin auf der Anmeldeseite und
   verraet nichts, was nicht jeder sieht, der die Adresse kennt. */
app.post('/api/zweifaktor/start', async (req, res) => {
  if (!await eigenesPasswortStimmt(req, res, (req.body || {}).passwort)) return;
  try {
    res.json(auth.beginneZweifaktor(req.benutzer.id,
      getSetting('title_public', 'Bewertungskatalog'), req.benutzer.username));
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

/* Schritt zwei. HIER ENTSTEHEN DIE WIEDERHERSTELLUNGSCODES, und sie stehen in
   dieser einen Antwort. Danach nirgends mehr -- auch nicht in der Datenbank,
   dort liegt nur ihr SHA-256. Wer sie verliert, holt sich neue; wer beides
   verliert, geht ueber zugang.js auf dem Wirt. */
app.post('/api/zweifaktor/an', async (req, res) => {
  const { passwort, code } = req.body || {};
  if (!await eigenesPasswortStimmt(req, res, passwort)) return;
  try {
    res.json(auth.schalteZweifaktorEin(req.benutzer.id, code, req.benutzer.id));
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

/* Frische Wiederherstellungscodes -- der Fall, den niemand plant: der letzte
   ist verbraucht. Hinter Passwort UND gueltigem Code, wie das Ausschalten:
   wer neue Codes bekaeme, ohne den laufenden Faktor zu belegen, haette einen
   Weg an ihm vorbei. Ein Wiederherstellungscode zaehlt dabei als Beleg -- genau
   dafuer ist er da, und der letzte holt so die naechsten acht. */
app.post('/api/zweifaktor/codes', async (req, res) => {
  const { passwort, code } = req.body || {};
  if (!await eigenesPasswortStimmt(req, res, passwort)) return;
  if (!auth.pruefeZweitenFaktor(req.benutzer.id, code))
    return res.status(403).json({ error: auth.ZWEITER_FAKTOR_ABSAGE });
  try {
    /* ERST DIE CODES, DANN DER STAND -- und die Reihenfolge ist keine
       Geschmacksfrage. In einem Objektliteral wird von links nach rechts
       ausgewertet: stuende zweifaktorStand() zuerst, meldete die Antwort die
       Zahl von VOR dem Erneuern, und die Karte zeigte "noch 4 von 8" neben
       acht frischen Codes. */
    const codes = auth.erneuereWiederCodes(req.benutzer.id);
    res.json({ ...auth.zweifaktorStand(req.benutzer.id), codes });
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

/* Ausschalten. PASSWORT UND GUELTIGER CODE -- das Passwort allein genuegte
   nicht: gegen eine uebernommene Sitzung mit mitgelesenem Passwort ist der
   Faktor ja gerade gebaut, und liesse er sich mit demselben Passwort abstreifen,
   sicherte er nichts.
   EIN ADMIN KOMMT HIER NICHT HEREIN, und es gibt auch keine Adresse, unter der
   er es versuchen koennte: die Nummer kommt aus req.benutzer. Der einzige Weg
   daneben ist zugang.js auf dem Wirt -- dieselbe Linie wie beim
   Schluesselwechsel. */
app.delete('/api/zweifaktor', async (req, res) => {
  const { passwort, code } = req.body || {};
  if (!auth.zweifaktorAn(req.benutzer.id))
    return res.status(400).json({ error: 'Der zweite Faktor ist nicht eingeschaltet.' });
  if (!await eigenesPasswortStimmt(req, res, passwort)) return;
  if (!auth.pruefeZweitenFaktor(req.benutzer.id, code))
    return res.status(403).json({ error: auth.ZWEITER_FAKTOR_ABSAGE });
  auth.schalteZweifaktorAus(req.benutzer.id, req.benutzer.id);
  res.json({ ...auth.zweifaktorStand(req.benutzer.id) });
});

/* ---- Die Freigabe holen ----
   EINE ROUTE FUER ALLE SIEBEN WEGE. Sie prueft DASSELBE Passwort noch einmal,
   nicht ein zweites Geheimnis -- ein zweiter Faktor ist eine eigene Stufe.
   Die Art 'selbstbezug': der Benutzer kommt aus req.benutzer und nie aus der
   Adresse. Wer bestaetigt, bestaetigt fuer sich.

   DIE ANMELDEBREMSE GREIFT, dieselbe wie ueberall und mit unangetasteten
   Kennwerten. Ohne sie waere diese Route ein Weg, ein Passwort ungebremst
   durchzuprobieren -- und zwar HINTER der Anmeldung, wo niemand hinsieht.
   Gezaehlt wird je Adresse UND je Name; der Name steht hier fest, es ist der
   des Angemeldeten.

   DIE ABSAGE IST KLAR UND DEUTLICH, und der Unterschied zu den Token aus
   0.8.80 gehoert benannt: dort wusste der Server nicht, wer fragt, und die
   eine verschleierte Absage schuetzte vor dem Durchprobieren. Hier ist der
   Fragende angemeldet und namentlich bekannt -- eine verschleierte Absage
   schuetzte niemanden und verwirrte nur. */
app.post('/api/bestaetigung', async (req, res) => {
  const ip = auth.clientIp(req);
  const name = req.benutzer.username;
  const t = auth.checkThrottle(ip, name);
  if (t.blocked) {
    return res.status(429).json({
      error: `Zu viele Fehlversuche. Bitte in ${t.retryInSec} Sekunden erneut versuchen.`
    });
  }
  if (t.delayMs) await new Promise(r => setTimeout(r, t.delayMs));
  const { passwort, zweck, ziel, code } = req.body || {};
  if (!auth.BESTAETIGUNG_ZWECKE.includes(zweck))
    return res.status(400).json({ error: 'Diesen Zweck gibt es nicht.' });
  const zeile = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.benutzer.id);
  if (!zeile || !await auth.pruefePasswort(String(passwort || ''), zeile.password_hash)) {
    auth.noteFailure(ip, name);
    // Die zweite der beiden Zeilen, bei denen das SCHEITERN der Vorgang ist.
    // Wer hier scheitert, sitzt an einer angemeldeten Sitzung und kennt das
    // Passwort nicht -- genau der Fall, gegen den diese Runde gebaut ist.
    auth.protokolliere('bestaetigung.fehl', { wer: req.benutzer.id, ziel: req.benutzer.id });
    return res.status(403).json({ error: 'Das Passwort stimmt nicht.' });
  }
  /* SEIT 0.10.0 FRAGT DIESE STELLE ZUSAETZLICH DEN CODE -- aber NUR bei
     Zugaengen, die einen zweiten Faktor eingeschaltet haben. Wer ihn nicht
     will, merkt von dieser Runde nichts.

     WARUM GERADE HIER: die zweite Bestaetigung verteidigt gegen die UEBERNOMMENE
     OFFENE SITZUNG (Abschnitt 5 des Projektstands) -- ein Bildschirm, der
     stehen blieb, ein gestohlener Cookie. Genau dort traegt ein zweiter Faktor
     am meisten: das Passwort mag mitgelesen sein, das Telefon liegt woanders.

     BESTAETIGUNG_ZWECKE BLEIBT BEI SIEBEN. Die Liste fuehrt ZWECKE, und es kommt
     keiner dazu -- es ist eine zweite Frage an derselben Stelle, kein achter Weg.

     DIE REIHENFOLGE IST PASSWORT, DANN CODE, und nicht umgekehrt: wer das
     Passwort nicht hat, soll nicht erfahren, ob am Zugang ein Faktor haengt.
     Und der Fehlschlag schreibt dieselbe Zeile wie oben -- 'bestaetigung.fehl'
     ist der Vorgang, ob es am Passwort lag oder am Code. */
  if (auth.zweifaktorAn(req.benutzer.id) && !auth.pruefeZweitenFaktor(req.benutzer.id, code)) {
    auth.noteFailure(ip, name);
    auth.protokolliere('bestaetigung.fehl', { wer: req.benutzer.id, ziel: req.benutzer.id });
    return res.status(403).json({ error: auth.ZWEITER_FAKTOR_ABSAGE, zweifaktor: true });
  }
  auth.noteSuccess(ip, name);
  const eigener = auth.parseCookies(req)[auth.COOKIE_NAME];
  try {
    res.json({ ok: true, ...auth.erzeugeFreigabe(eigener, zweck, ziel) });
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

/* ---- Das Sicherheitsprotokoll ----
   NUR DER EIGENTUEMER. Es nennt Namen und Vorgaenge ueber andere Zugaenge;
   ein Admin, der es liest, saehe die Verwaltungsvorgaenge des Eigentuemers
   ueber ihn selbst. Dieselbe Zeile wie Export, Import und der Schluesselwert
   -- ein Admin verwaltet den Bestand, er sieht nicht die Anlage.
   Lesend, deshalb kein Eintrag in F_ROUTEN.
   ES GIBT KEINEN WEG HINAUS AUSSER DER FRIST. Eine Loeschroute waere ein
   Protokoll, das der Betroffene selbst wegraeumen kann -- also keins.
   ZWEITE AUFRUFSTELLE DES AUFRAEUMENS; die erste steht beim Start. Dieselbe
   Bauform wie bei raeumePapierkorbAuf() und raeumeTokensAuf(): eine Anlage,
   die ein halbes Jahr durchlaeuft, raeumte sonst ein halbes Jahr lang nicht
   auf. Hauswirtschaft, keine Benutzerhandlung -- die Liste schreibender
   Routen bleibt unberuehrt. */
app.get('/api/sicherheitsprotokoll', nurEigentuemer, (req, res) => {
  auth.raeumeProtokollAuf();
  res.json(auth.leseProtokoll());
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
  // Zweite Aufrufstelle des Aufraeumens; die erste steht beim Start. Dieselbe
  // Bauform wie bei raeumePapierkorbAuf(): eine Anlage, die monatelang
  // durchlaeuft, raeumte sonst monatelang nicht auf. Hauswirtschaft, keine
  // Benutzerhandlung -- die Liste schreibender Routen bleibt unberuehrt.
  auth.raeumeTokensAuf();
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
  const { username, passwort, rolle, einladen, email } = req.body || {};
  const gewuenscht = rolle || 'user';
  if (gewuenscht !== 'user' && !istEigentuemer(req))
    return res.status(403).json({ error: VERWEIGERT_ROLLE });
  try {
    /* MIT EINLADUNG ENTSTEHT DER ZUGANG OHNE PASSWORT und bekommt den Link im
       selben Zug. Zwei Schritte waeren ein Zustand dazwischen, in dem ein
       Zugang dasteht, in den niemand hereinkommt und an den auch niemand mehr
       denkt. `einladen` muss ausdruecklich true sein -- ein vergessenes
       Passwortfeld scheitert weiter wie bisher. */
    const angelegt = await auth.legeZugangAn(username, passwort, gewuenscht, einladen === true,
                                             req.benutzer.id, email);
    if (einladen !== true) return res.json(angelegt);
    const t = auth.erzeugeToken(angelegt.id, 'einladung', req.benutzer.id);
    /* ERST DER TOKEN, DANN DER VERSAND, und die Reihenfolge ist die ganze
       Zusage: der Link steht in der Antwort, egal was der Mailserver sagt. */
    const v = await versendeTokenLink({ username: angelegt.username, email: angelegt.email }, t);
    res.json({ ...angelegt, token: t.klartext, zweck: t.zweck, tage: t.tage,
               minuten: auth.TOKEN_FRIST_MINUTEN, ...linkAngabe(t.klartext), ...v });
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

/* Der Link fuer einen VORHANDENEN Zugang -- einladen (wenn der erste Link
   abgelaufen ist) oder zuruecksetzen. Dieselbe Rechtezeile wie die drei
   Verwaltungsrouten daneben: zielZugangFrei entscheidet, und damit gilt die
   Rollenleiter auch hier -- ein Admin laedt keinen Eigentuemer ein und kommt
   nicht an seinesgleichen.
   DER SERVER GIBT NUR DEN TOKEN HERAUS, NICHT DEN LINK. Die vollstaendige
   Adresse baut der Browser des Admins aus location -- er steht ja bereits an
   der richtigen. Damit stellt sich die Frage nach einer oeffentlichen Adresse
   in dieser Stufe gar nicht, und aus dem Host-Kopf wird nichts abgeleitet;
   ueber einen gefaelschten Kopf liesse sich ein Link sonst auf einen fremden
   Server umbiegen.
   DAS IST DIE EINE ANTWORT, IN DER DER KLARTEXT STEHT. Danach steht er
   nirgends mehr -- auch nicht in der Datenbank. */
app.post('/api/users/:id/token', nurAdmin, async (req, res) => {
  const ziel = zielZugangFrei(req, res, req.params.id);
  if (!ziel) return;
  /* DIE RECHTEFRAGE STEHT VOR DER BESTAETIGUNGSFRAGE, und das ist keine
     Geschmacksfrage: wer ohnehin nicht darf, soll erfahren, DASS er nicht
     darf -- und nicht erst nach seinem Passwort gefragt werden. */
  if (!zweiteBestaetigung(req, res, 'link', ziel.id)) return;
  const zweck = (req.body || {}).zweck || 'einladung';
  try {
    const t = auth.erzeugeToken(ziel.id, zweck, req.benutzer.id);
    // Erst der Token, dann der Versand -- dieselbe Reihenfolge wie am Anlegen,
    // und aus demselben Grund.
    const v = await versendeTokenLink(ziel, t);
    res.json({ id: t.id, username: t.username, token: t.klartext,
               zweck: t.zweck, tage: t.tage, minuten: auth.TOKEN_FRIST_MINUTEN,
               ohnePasswort: t.ohnePasswort,
               ...linkAngabe(t.klartext), ...v });
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
  /* DIE ZWEITE BESTAETIGUNG STEHT HIER IM RUMPF UND NICHT IN DER ROUTENZEILE,
     weil erst der Rumpf sagt, WELCHE der drei Rechteklassen gemeint ist:
     Rolle und fremdes Passwort verlangen sie, Sperren und Freigeben nicht --
     das ist umkehrbar und uebergibt nichts. Beide vor dem ersten Schreiben:
     eine Absage, die die halbe Aenderung schon geschrieben hat, waere
     schlimmer als keine. */
  if (rolle !== undefined && !zweiteBestaetigung(req, res, 'rolle', ziel.id)) return;
  if (passwort !== undefined && !zweiteBestaetigung(req, res, 'passwort', ziel.id)) return;
  try {
    let ergebnis = { id: ziel.id, username: ziel.username };
    if (rolle !== undefined) ergebnis = { ...ergebnis, ...auth.setzeRolle(ziel.id, rolle, req.benutzer.id) };
    if (status !== undefined) ergebnis = { ...ergebnis, ...auth.setzeStatus(ziel.id, status, req.benutzer.id) };
    if (passwort !== undefined) { await auth.setzeNeuesPasswort(ziel.id, passwort, req.benutzer.id); ergebnis.passwortGesetzt = true; }
    res.json(ergebnis);
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

// Entfernen heisst Grabstein: die Zeile bleibt mit ihrer Nummer stehen, die
// Beitraege bleiben sichtbar. Die beiden Haekchen sind Ausnahmen davon und
// stehen in der Abfrage, damit sie in der Adresse sichtbar sind.
app.delete('/api/users/:id', nurAdmin, (req, res) => {
  const ziel = zielZugangFrei(req, res, req.params.id);
  if (!ziel) return;
  // Rechtefrage vor Bestaetigungsfrage, wie an der Tokenroute.
  if (!zweiteBestaetigung(req, res, 'entfernen', ziel.id)) return;
  try {
    res.json(auth.entferneZugang(ziel.id, {
      eintraege: req.query.eintraege === '1',
      beitraege: req.query.beitraege === '1'
    }, req.benutzer.id));
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

/* ---- Der Mailversand, seit 0.9.0 ---------------------------------------
   DREI ENDPUNKTE, EINE RECHTEZEILE: DER MAILZUGANG GEHOERT DEM EIGENTUEMER,
   GANZ. Eintragen, einsehen und die Testmail ausloesen -- alles drei bei ihm,
   und der Admin kommt an keines davon:
     GET  /api/mail       nurEigentuemer. Lesend, deshalb KEIN Eintrag in
                          F_ROUTEN, wie bei GET /api/stats.
     PUT  /api/mail       nurEigentuemer, und zusaetzlich zweitbestaetigt.
     POST /api/mail/test  nurEigentuemer -- an die EIGENE Adresse, sonst nirgends.

   WARUM NICHT BEIM ADMIN, obwohl ER die Einladungen verschickt: der
   SMTP-Server sieht jede Mail, die durch ihn geht, und jede traegt einen Link,
   der ein Passwort setzt. Duerfte ein Admin ihn eintragen, liefe die
   Ruecksetzmail des Eigentuemers ueber einen Server seiner Wahl -- der Weg an
   der Rollenleiter vorbei, den es nicht geben darf. Ueber dem Eigentuemer
   steht niemand; wer ohnehin exportieren und den Schluesselwert sehen darf,
   gewinnt hier nichts dazu. Die Begruendung im Langen steht in mail.js.

   WAS DER ADMIN STATTDESSEN BEKOMMT, und es ist genug: das Feld `versand`
   samt Grund neben dem Link, in genau dem Augenblick, in dem es ihn angeht.
   Er erfaehrt dort, DASS nichts hinausging und WARUM -- und der Link steht
   daneben. Eine Karte, die ihm dasselbe schon vorher sagt, waere bequemer und
   koennte ihm den Anbieter, den Server und den Benutzernamen des Eigentuemers
   nennen; das ist der Tausch, der hier nicht gemacht wird.

   DAS PASSWORT KOMMT AUS KEINER DIESER ANTWORTEN HERAUS, auch nicht aus der
   des Eigentuemers: die Karte zeigt "gesetzt" oder "nicht gesetzt", und das
   Formular schickt beim Speichern ein leeres Feld, wenn es unveraendert
   bleiben soll. Ein Endpunkt, der es zurueckgaebe, waere die eine Stelle, an
   der es ueber das Netz liefe, ohne dass es jemand gebraucht haette. */

/* Was die Karte sieht. DIE ANBIETERLISTE KOMMT MIT: der Server speichert einen
   Schluessel, also muss die Oberflaeche die Namen von ihm bekommen -- eine
   zweite Liste in app.js liefe beim naechsten Anbieter auseinander (dieselbe
   Bauform wie bei den Suchanbietern).
   DIE MARKE SAGT, OB DER LETZTE ERFOLGREICHE TEST NOCH ZUM HEUTIGEN ZUGANG
   PASST. Ohne den Vergleich stuende "zuletzt getestet: gestern" auch dann da,
   wenn seitdem der Anbieter gewechselt wurde -- eine Auskunft, die genau dann
   falsch ist, wenn sie gebraucht wird. */
function mailKarte() {
  const roh = getSetting(mail.SCHLUESSEL, null);
  // Der Vergleich steht seit 0.9.1 in mailtestStand() weiter oben -- eine
  // Rechnung, zwei Rufer (Stolperstein 145).
  const test = mailtestStand(roh);
  return {
    ...mail.zustand(roh),
    anbieterListe: mail.ANBIETER.map(a => ({ schluessel: a.schluessel, name: a.name })),
    eingerichtet: mail.eingerichtet(roh),
    // Der ZUSTAND der oeffentlichen Adresse, nicht die Adresse selbst -- die
    // steht in der Karte "Zugaenge", wo der Link entsteht.
    adresseGesetzt: Boolean(OEFFENTLICHE.adresse),
    adresse: OEFFENTLICHE.adresse,
    fristMinuten: auth.TOKEN_FRIST_MINUTEN,
    getestetAm: test ? test.am : null,
    sekunden: Math.round(mail.VERSAND_MS / 1000),
    /* Die Folge der Testmarke fuer die Selbstanmeldung, seit 0.9.1: der
       Eigentuemer soll an DIESER Karte sehen, was er dem Schalter des Admins
       antut, wenn er den Mailzugang aendert. Es ist dieselbe Rechnung wie in
       der Karte "Anfragen", nicht eine zweite daneben. */
    registrierung: getSetting('registrierung', false) === true
  };
}

app.get('/api/mail', nurEigentuemer, (req, res) => res.json(mailKarte()));

app.put('/api/mail', nurEigentuemer, zweiteBestaetigungNoetig('mail'), (req, res) => {
  let neu;
  try { neu = mail.pruefeEingabe(req.body, getSetting(mail.SCHLUESSEL, null)); }
  catch (e) { return res.status(400).json({ error: e.message }); }
  putSetting.run(mail.SCHLUESSEL, JSON.stringify(neu));
  /* DIE MARKE WIRD HIER AUSDRUECKLICH NICHT GELOESCHT, und das ist entschieden
     und nicht vergessen. Sie belegt "mit DIESEN Werten ist einmal wirklich
     eine Mail hinausgegangen", und dieser Beleg haengt am HASH UEBER DEN
     ZUGANG, den mailKarte() unten nachrechnet: passt er nicht mehr, gilt die
     Marke nicht mehr -- egal, wodurch sich der Zugang geaendert hat.
     EIN ZWEITES LOESCHEN AN DIESER STELLE WAERE EINE ZWEITE WAHRHEIT UEBER
     DIESELBE FRAGE. Es stand hier eine Runde lang und war folgenlos: eine
     Gegenprobe, die es entfernte, blieb vollstaendig stumm -- der Vergleich
     hatte die Arbeit ohnehin schon getan. Und der Vergleich kann mehr: er
     faengt auch einen Wert, der auf einem anderen Weg in settings gelandet
     ist. */
  res.json(mailKarte());
});

/* Die Testmail geht AN DIE EIGENE ADRESSE DES ANFORDERNDEN und nirgendwo
   sonst. Ein Knopf mit freiem Adressfeld waere ein offener Mailverteiler
   hinter einer Anmeldung: die Anlage verschickte fuer jeden mit einem
   Adminzugang fremde Post, und wer tausend Adressen durchprobieren will,
   braeuchte dafuer nur einen Zugang und Geduld.
   ES GIBT DESHALB KEIN ADRESSFELD -- weder im Rumpf, noch in der Abfrage,
   noch als Kopf. Der Rumpf wird gar nicht angesehen; das ist die einzige Form,
   in der "ein mitgegebenes Feld aendert nichts" baulich wahr ist statt
   durchgesetzt.
   HAT DER ZUGANG KEINE ADRESSE, WIRD ABGESAGT -- mit dem Weg dorthin, denn
   die Absage ohne den Satz "trag sie unter Zugang ein" waere eine Sackgasse. */
app.post('/api/mail/test', nurEigentuemer, async (req, res) => {
  const eigener = auth.holeZugang(req.benutzer.id);
  if (!eigener || !eigener.email) {
    return res.status(400).json({ error:
      'Für deinen Zugang ist keine E-Mail-Adresse hinterlegt. Trag sie im Systembereich ' +
      'unter „Zugang“ ein — die Testmail geht ausschließlich an die eigene Adresse.' });
  }
  const roh = getSetting(mail.SCHLUESSEL, null);
  if (!mail.eingerichtet(roh))
    return res.status(400).json({ error: 'Es ist kein vollständiger Mailzugang eingerichtet.' });
  const e = await mail.versende(roh, eigener.email,
    `Testmail aus „${getSetting('title_public', 'Bewertungskatalog')}“`,
    mail.textTest({ titel: getSetting('title_public', 'Bewertungskatalog'),
                    username: eigener.username }));
  if (e.ok) {
    putSetting.run(MAILTEST_SCHLUESSEL,
      JSON.stringify({ marke: mail.marke(roh), am: new Date().toISOString().slice(0, 19).replace('T', ' ') }));
  }
  // 200 AUCH BEIM FEHLSCHLAG: der Versuch ist gelaufen, und sein Ergebnis ist
  // die Antwort. Ein 500 hiesse, die Anlage haette einen Fehler -- den hat der
  // Mailserver. Die Oberflaeche liest `ok` und nicht den Statuscode.
  res.json({ ok: e.ok, grund: e.grund, an: eigener.email, ...mailKarte() });
});

/* ---- Die Selbstanmeldung hinter der Anmeldung, seit 0.9.1 --------------
   VIER ENDPUNKTE, EINE RECHTEZEILE: ADMIN. Sehen, schalten, freischalten,
   ablehnen -- alles vier bei ihm:
     GET    /api/anfragen           nurAdmin. Lesend, deshalb KEIN Eintrag in
                                    F_ROUTEN, wie bei GET /api/stats.
     PUT    /api/registrierung/schalter  nurAdmin.
     POST   /api/anfragen/:id/frei  nurAdmin.
     DELETE /api/anfragen/:id       nurAdmin.

   WARUM ADMIN UND NICHT EIGENTUEMER, obwohl der Mailzugang dahinter dem
   Eigentuemer gehoert: aus einer Anfrage wird NIE etwas anderes als ein
   Zugang mit der Rolle 'user', und den legt der Admin ohnehin an. Die
   Rollenleiter wird dabei nicht beruehrt -- es gibt keinen bestehenden Zugang,
   an den hier jemand herankaeme. Was der Admin ueber den Mailzugang erfaehrt,
   ist der Grund aus versandBereit(), und den erfaehrt er heute schon neben
   jedem Link.

   KEINE ZWEITE BESTAETIGUNG, und das ist entschieden und nicht vergessen:
   dieselbe Ueberlegung wie bei POST /api/users -- es entsteht ein NEUER Zugang
   und nimmt niemandem etwas. BESTAETIGUNG_ZWECKE bleibt bei sieben.

   DER SCHALTER LEGT SICH NIE VON SELBST UM. Einschalten geht nur, wenn der
   Versand wirklich bereit ist; AUSSCHALTEN GEHT IMMER. Und geht der Versand
   spaeter kaputt, bleibt er an und die Karte sagt es rot -- ein Schalter, der
   sich selbst umlegt, waere die zweite Wahrheit aus Abschnitt 1 des
   Konzeptpapiers: die Anlage stuende dann anders da, als der Mensch sie
   gestellt hat, und niemand koennte sagen, wann das passiert ist. */
function anfragenKarte() {
  const b = versandBereit();
  return {
    an: getSetting('registrierung', false) === true,
    versandBereit: b.ok, versandGrund: b.grund,
    anfragen: auth.listeAnfragen(),
    deckel: auth.ANFRAGE_DECKEL, belegt: auth.zaehleAnfragen(),
    stunden: auth.ANFRAGE_STUNDEN
  };
}

app.get('/api/anfragen', nurAdmin, (req, res) => {
  // Zweite Aufrufstelle des Aufraeumens; die erste steht beim Start, die
  // dritte an der Anfrageroute selbst. Dieselbe Bauform wie bei
  // raeumeTokensAuf() -- eine Anlage, die monatelang durchlaeuft, raeumte
  // sonst monatelang nicht auf. Hauswirtschaft, keine Benutzerhandlung.
  auth.raeumeAnfragenAuf();
  res.json(anfragenKarte());
});

app.put('/api/registrierung/schalter', nurAdmin, (req, res) => {
  const an = (req.body || {}).an === true;
  /* NUR DAS EINSCHALTEN IST GEBUNDEN. Ein Schalter, der sich nicht mehr
     ausschalten laesst, weil inzwischen der Mailzugang fehlt, waere eine
     Falle: gerade dann will man ihn aus. */
  if (an) {
    const b = versandBereit();
    if (!b.ok) return res.status(400).json({ error:
      'Die Selbstanmeldung lässt sich ohne funktionierenden Versand nicht einschalten. ' + b.grund });
  }
  putSetting.run('registrierung', JSON.stringify(an));
  res.json(anfragenKarte());
});

/* Die Freischaltung. AUS DER ANFRAGE WIRD EIN ZUGANG MIT DER ROLLE 'user' --
   die Rolle steht hier fest im Aufruf und wird an KEINER Stelle aus der
   Anfrage gelesen, weder aus dem Rumpf noch aus der Abfrage noch aus einem
   Kopf. Damit ist "aus einer Anfrage wird nie etwas anderes als ein Benutzer"
   baulich wahr statt durchgesetzt: ein Deckel, den es nicht gibt, kann nicht
   vergessen werden.
   NUR BESTAETIGTE ANFRAGEN. listeAnfragen() zeigt ohnehin nur sie, aber die
   Route verlaesst sich nicht auf die Karte -- eine Nummer laesst sich tippen.
   ERST DER ZUGANG, DANN DER TOKEN, DANN DIE ZEILE WEG. Die Reihenfolge ist die
   Zusage: scheitert das Anlegen -- der Name kann zwischen Anfrage und
   Freischaltung anderweitig vergeben worden sein --, bleibt die Anfrage
   stehen, und der Admin bekommt die Meldung. Ein Weg, der die Zeile zuerst
   loescht, verloere sie in genau diesem Fall.
   UND DANN ERST DER VERSAND, wie am Anlegen und aus demselben Grund: der Link
   steht in der Antwort, egal was der Mailserver sagt. */
app.post('/api/anfragen/:id/frei', nurAdmin, async (req, res) => {
  const a = auth.holeAnfrage(req.params.id);
  if (!a || !a.bestaetigt_am)
    return res.status(404).json({ error: 'Diese Anfrage gibt es nicht.' });
  let angelegt, t;
  try {
    angelegt = await auth.legeZugangAn(a.username, null, 'user', true, req.benutzer.id, a.email);
    t = auth.erzeugeToken(angelegt.id, 'einladung', req.benutzer.id);
  } catch (e) { return res.status(400).json({ error: e.message }); }
  auth.entferneAnfrage(a.id);
  /* DIE ZEILE NENNT DEN NEUEN ZUGANG UND NICHT DEN NAMEN DES ANFRAGENDEN.
     Sie sagt etwas, was zugang.neu und link.neu daneben nicht sagen: dass
     dieser Zugang aus einer SELBSTANMELDUNG kam und nicht aus der Hand des
     Admins. */
  auth.protokolliere('anfrage.frei', { wer: req.benutzer.id, ziel: angelegt.id });
  const v = await versendeTokenLink({ username: angelegt.username, email: angelegt.email }, t);
  res.json({ ...angelegt, token: t.klartext, zweck: t.zweck, tage: t.tage,
             minuten: auth.TOKEN_FRIST_MINUTEN, ...linkAngabe(t.klartext), ...v,
             ...anfragenKarte() });
});

/* Die Ablehnung. DIE ZEILE IST WEG, UND ES ENTSTEHT NICHTS -- kein Zugang,
   kein Token, keine Mail. Eine Absagemail waere eine Benachrichtigung, und die
   gibt es in dieser Anlage nicht; sie waere ausserdem ein Weg, jemandem auf
   Zuruf Post zu schicken.
   DIE PROTOKOLLZEILE TRAEGT DEN NAMEN NICHT. Sie ist die einzige Spur, dass
   ueberhaupt jemand gefragt hat -- die Zeile in anfragen wird ja geloescht --,
   und sie haelt fest, WER abgelehnt hat und WANN. Mehr gehoert nicht hinein:
   der Name des Abgewiesenen ist Freitext von aussen. */
app.delete('/api/anfragen/:id', nurAdmin, (req, res) => {
  const a = auth.holeAnfrage(req.params.id);
  if (!a || !a.bestaetigt_am)
    return res.status(404).json({ error: 'Diese Anfrage gibt es nicht.' });
  auth.entferneAnfrage(a.id);
  auth.protokolliere('anfrage.ab', { wer: req.benutzer.id });
  res.json({ ok: true, ...anfragenKarte() });
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

/* --- Der Merkzeitpunkt fuer "Neu seit ..." --------------------------------
   Persoenlich, wie der Favorit. Er FILTERT die Uebersicht und sortiert sie
   nicht um -- die Reihenfolge bleibt updated_at fuer alle.
   NULL heisst "noch nie gesetzt", und das ist ein eigener Zustand: die
   Oberflaeche bietet den Umschalter dann gar nicht erst an. Ein Filter, der
   beim ersten Klick alles zeigt, erklaert sich nicht. */
const zuletztGesehen = (benutzerId) => getUserSetting(benutzerId, 'zuletztGesehen', null);

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
  zuletztGesehen: zuletztGesehen(req.benutzer.id),
  suche: suchvorlage(),
  suchAnbieter: suchAnbieter(),
  suchNamen: suchNamen(req.benutzer.id),
  // Abgeleitet beim Lesen, nicht in der Datenbank nachgetragen. Die Oberflaeche
  // laesst danach die Zeile "+ neu anlegen" weg; die Auswahl aus dem
  // Vorhandenen bleibt in jedem Fall stehen.
  tagsFreiAnlegen: freiAnlegen('tagsFreiAnlegen'),
  kategorienFreiAnlegen: freiAnlegen('kategorienFreiAnlegen'),
  /* SEIT 0.10.0: fragt die zweite Bestaetigung bei DIESEM Zugang zusaetzlich
     den Code? Das Feld steht hier und nicht nur in GET /api/account, und aus
     demselben Grund wie `name` darueber -- beide lesen denselben Zugang, es ist
     also keine zweite Wahrheit. Gebraucht wird es ausserhalb des
     Systembereichs: das Bestaetigungsfenster steht auch vor Export und Import,
     und ohne diese Angabe muesste es den ersten Versuch absichtlich scheitern
     lassen, um zu erfahren, dass ein Code fehlt -- eine Protokollzeile
     'bestaetigung.fehl' bei jedem einzelnen Vorgang.
     NUR EIN JA/NEIN. Weder das Geheimnis noch der Zeitpunkt noch die Zahl der
     Wiederherstellungscodes -- die stehen in der Karte, wo sie hingehoeren. */
  zweifaktor: auth.zweifaktorAn(req.benutzer.id),
  // Die Frist des Papierkorbs. Sie steht HIER und nicht nur in
  // GET /api/papierkorb: den Loeschdialog sieht jeder, die Karte nur der
  // Admin. Eine Zahl, die die Oberflaeche selbst mitbraechte, waere eine
  // zweite Wahrheit ueber dieselbe Frist.
  papierkorbTage: PAPIERKORB_TAGE
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
  /* DER MERKZEITPUNKT KOMMT VON DER SERVERUHR, NIE VOM AUFRUFER. Was der
     Aufrufer schickt, ist ein Signal ("ich habe die Uebersicht verlassen") und
     keine Feststellung -- eine mitgeschickte Zeit waere eine Behauptung, mit
     der sich jeder Bestand nach Belieben als ungesehen erklaeren liesse.
     UND SIE WIRD UM EINE SEKUNDE NACHGESTELLT. datetime('now') loest nur
     Sekunden auf: entstuende ein Kommentar in DERSELBEN Sekunde, in der jemand
     die Uebersicht verlaesst, traege sein Eintrag genau diesen Zeitstempel und
     gaelte danach nie als neu. Die Sekunde zurueck macht das Fenster
     harmlos -- lieber einen Eintrag zweimal zeigen als einen verschlucken. */
  if (req.body.zuletztGesehen !== undefined)
    putUserSetting(req.benutzer.id, 'zuletztGesehen',
      JSON.stringify(db.prepare(`SELECT datetime('now', '-1 second') AS t`).get().t));
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

/* --- Das Gewicht eines Kriteriums ----------------------------------------
   DER GUELTIGE BEREICH STEHT GENAU HIER. Zwei Schreibwege fuehren darauf --
   die Verwaltung und der Import; stuende die Spanne an beiden, liefen sie
   irgendwann auseinander. Aus demselben Grund steht sie auch NICHT als CHECK
   in der DDL: das waere eine dritte Stelle fuer dieselbe Grenze, und sie
   meldete sich nicht als Absage mit Meldung, sondern als abgebrochene
   Schreibung.
   NUR POSITIVE WERTE, und die Untergrenze ist keine Geschmacksfrage: bei 0
   waere der Nenner eines Eintrags, an dem nur dieses Kriterium bewertet ist,
   null. Ein negatives Gewicht kehrte die Aussage um -- eine gute Note zoege
   den Schnitt nach unten -- und braeche zugleich die Zusicherung, dass der
   Gesamtschnitt zwischen 1 und 5 liegt.
   In der Schnittstelle steht eine ZAHL, kein Text: das Komma ist eine Sache
   der Anzeige und hat hier nichts verloren. */
const GEWICHT_MIN = 0.2, GEWICHT_MAX = 2.0;

/* ABGEWIESEN WIRD, WAS ETWAS ANDERES BEDEUTET -- GERUNDET WIRD, WAS DASSELBE
   BEDEUTET. Wer 5 eintippt, meint 5; den Wert still auf 2 zu ziehen hiesse,
   eine andere Aussage zu speichern als die eingegebene. 1,234 und 1,23 sind
   dagegen dieselbe Aussage.
   Das ist bewusst nicht dieselbe Haltung wie beim Bewertungswert, der mit
   Math.max(0, Math.min(5, ...)) zurechtgebogen wird: der kommt aus einem
   Sterne-Widget, das gar nichts anderes senden kann. Ein Gewicht wird von
   Hand getippt. */
function gueltigesGewicht(roh) {
  const g = Number(roh);
  if (!Number.isFinite(g) || g < GEWICHT_MIN || g > GEWICHT_MAX) return null;
  // Auf Hundertstel festlegen. Nicht als Schranke gedacht, sondern gegen den
  // Rest der Gleitkommarechnung: 1.2000000000000002 hat niemand eingegeben.
  return Math.round(g * 100) / 100;
}

// Deutsches Komma in Meldungen. Dieselbe Regel wie in der Oberflaeche
// (`toFixed(1).replace('.', ',')`), nur ohne feste Nachkommastelle:
// "zwischen 0.2 und 2" waere ein Punkt mitten in einem deutschen Satz.
const zahl = (n) => String(n).replace('.', ',');

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
// gewicht steht mit in der Liste: die Verwaltungskarte zeichnet daraus ihr
// Eingabefeld, und ohne die Angabe stuende dort bei jedem Neuaufbau wieder
// die Vorgabe statt des gespeicherten Werts.
const qCriteria = db.prepare(`
  SELECT c.id, c.name, c.sort_order, c.gewicht, c.created_at,
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

// KEIN Gewicht beim Anlegen. Ein neues Kriterium startet auf 1,0 -- der Wert
// steht in der DDL -- und wird danach in der Zeile eingestellt. Ein Feld
// weniger im Anlegeweg, und die Vorgabe steht nur an einer Stelle.
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
  // Das Gewicht ist FREIWILLIG: das Umbenennen schickt nur den Namen und darf
  // das Gewicht nicht mit anfassen. Ohne diese Unterscheidung setzte jedes ✎
  // die Gewichtung still auf die Vorgabe zurueck.
  let gewicht = null;
  if (req.body.gewicht !== undefined) {
    gewicht = gueltigesGewicht(req.body.gewicht);
    if (gewicht === null) return res.status(400).json({
      error: `Das Gewicht muss eine Zahl zwischen ${zahl(GEWICHT_MIN)} und ` +
             `${zahl(GEWICHT_MAX)} sein.` });
  }
  // Name und Gewicht in EINEM UPDATE: zwei Anweisungen hintereinander koennten
  // halb durchlaufen. COALESCE laesst das Gewicht stehen, wenn keines kam.
  db.prepare('UPDATE rating_criteria SET name = ?, gewicht = COALESCE(?, gewicht) WHERE id = ?')
    .run(name, gewicht, req.params.id);
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
const qAttachments = db.prepare(`SELECT id, filename, mime_type, size, sort_order, created_at, user_id
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

// art und dauer gehen mit hinaus: woran die Oberflaeche ein Video erkennt, ist
// allein die Spalte art -- nicht der ausgelieferte Typ und nichts sonst. Ohne
// die beiden Felder zeichnete sie ins Leere. Sie haengen damit an detail() UND
// an /api/items (mainPhoto).
const qPhotos = db.prepare('SELECT id, item_id, mime_type, focus_x, focus_y, sort_order, created_at, art, dauer FROM photos WHERE item_id = ? ORDER BY sort_order, id');
const qTags = db.prepare('SELECT t.* FROM tags t JOIN item_tags it ON it.tag_id = t.id WHERE it.item_id = ? ORDER BY t.name COLLATE NOCASE');
const qLinks = db.prepare('SELECT id, url, sort_order, created_at, user_id FROM links WHERE item_id = ? ORDER BY sort_order, id');
const qCat = db.prepare('SELECT id, name FROM product_categories WHERE id = ?');
/* --- Schnitt und Anzahl je Kriterium --------------------------------------
   EINE Abfrage, gruppiert -- ausdruecklich KEIN zweiter JOIN AUF `ratings`
   neben den, der in detail() die eigene Sternzeile holt. Zwei JOINs auf
   DIESELBE Tabelle vervielfachen sich: drei Bewerter an einem Kriterium
   ergaeben dreimal dieselbe Zeile, und der Schnitt daraus waere zwar zufaellig
   richtig, der Zaehler aber neunfach. Deshalb hier gruppiert und drueben per
   Map angehaengt.
   DER JOIN AUF `rating_criteria` DARUNTER IST ETWAS ANDERES und faellt nicht
   unter diese Warnung: er trifft ueber criterion_id genau eine Zeile, die
   Zeilenzahl bleibt. c.gewicht steht zusaetzlich im GROUP BY, damit die
   Abfrage nicht auf SQLites Nachsicht gegenueber freien Spalten angewiesen
   ist.
   DAS GEWICHT REIST AN DER SCHNITTZEILE MIT, statt beim Rechnen separat
   nachgeschlagen zu werden. Das ist der Grund fuer den JOIN: so kann der
   Nenner des Gesamtschnitts gar nicht aus einer anderen Menge entstehen als
   der Zaehler. Wer eine Zeile hat, hat ihr Gewicht; wer keine hat, hat auch
   keins im Nenner.
   Gezaehlt und gemittelt wird ueber Werte > 0, wie ueberall: ein
   zurueckgesetztes Kriterium hinterlaesst eine Zeile mit 0, und die ist keine
   Stimme. */
const qSchnittJeKriterium = db.prepare(`
  SELECT r.criterion_id, AVG(r.value * 1.0) AS schnitt, COUNT(*) AS anzahl,
         c.gewicht
    FROM ratings r JOIN rating_criteria c ON c.id = r.criterion_id
   WHERE r.item_id = ? AND r.value > 0
   GROUP BY r.criterion_id, c.gewicht`);

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
// Der zweite Schritt ist ein GEWICHTETER Mittelwert. Bei Gewicht 1 ueberall
// ist er rechnerisch derselbe wie ein ungewichteter -- Zaehler und Nenner
// bekommen denselben Faktor.
//
// DER NENNER SUMMIERT NUR DIE GEWICHTE DER BEWERTETEN KRITERIEN. Das ist die
// eine Stelle, an der ein naheliegender Griff alles kippt: ein Nenner ueber
// ALLE Kriterien -- etwa SELECT SUM(gewicht) FROM rating_criteria -- drueckte
// einen Eintrag unter 1. Ein Eintrag mit einem einzigen bewerteten Kriterium
// (Wert 3, Gewicht 0,2) und zwei unbewerteten a Gewicht 2 ergaebe dort 0,14
// statt 3,0.
// Die Antwort darauf ist baulich, nicht sorgfaeltig: Zaehler und Nenner
// entstehen in DERSELBEN Schleife aus DERSELBEN Menge, und das Gewicht kommt
// an der Schnittzeile mit (siehe qSchnittJeKriterium). Eine zweite Quelle gibt
// es hier gar nicht.
// Weil jeder Kriterienwert in [1,5] liegt und jedes Gewicht groesser als null
// ist, liegt auch das Ergebnis in [1,5]. Das ist eine Eigenschaft des
// gewichteten Mittels -- eine Konvexkombination --, keine Regel, die hier
// durchgesetzt wuerde. Es gibt keinen Deckel, der vergessen werden koennte.
// Gerundet wird GENAU EINMAL, hier am Ende. Je Kriterium vorzurunden und dann
// zu mitteln waere ein zweiter Rundungsort fuer dieselbe Zahl -- SQL und
// JavaScript muessten dafuer gleich runden. Der Preis ist bekannt und steht im
// Konzept: wer die angezeigten Zehntel von Hand mittelt, kann um bis zu 0,05
// danebenliegen; mit Gewichten ist die Kopfzahl durch blosses Mitteln der
// Zeilen ohnehin nicht mehr nachzurechnen -- deshalb steht das Gewicht an der
// Zeile.
// Bei EINEM Benutzer liefert das Zweistufenmittel dasselbe wie ein flaches --
// jedes Kriterium hat dann hoechstens eine Stimme.
function gesamtSchnitt(karte) {
  let zaehler = 0, nenner = 0;
  for (const z of karte.values()) { zaehler += z.schnitt * z.gewicht; nenner += z.gewicht; }
  // Kein Nenner heisst: kein bewertetes Kriterium, also keine Zahl. Bei
  // mindestens einer Zeile ist er mindestens GEWICHT_MIN und damit nie null.
  if (!nenner) return null;
  return Math.round((zaehler / nenner) * 10) / 10;
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
  /* Nur die Angaben, nie die Bytes. Die Art der Vorschau entscheidet der
     Server anhand der Endung -- die Oberflaeche soll das nicht selbst raten.
     Verfasser und `mine` wie an der Linkzeile: daran haengt das Loeschkreuz,
     und die Oberflaeche soll das nicht aus dem Verfasserobjekt zurueckrechnen
     muessen. Die nackte Nummer geht nicht hinaus. */
  it.attachments = qAttachments.all(id).map(a2 => ({
    id: a2.id, filename: a2.filename, mime_type: a2.mime_type, size: a2.size,
    sort_order: a2.sort_order, created_at: a2.created_at,
    preview: anh.vorschauArt(a2.filename),
    mine: a2.user_id === benutzerId, verfasser: verfasserAus(karte, a2.user_id)
  }));
  /* Die Linkzeile sagt wie Kommentar, Testtag und Stimme, wem sie gehoert.
     `mine` steht daneben, weil daran das Loeschkreuz haengt -- die Oberflaeche
     soll das nicht aus dem Verfasserobjekt zurueckrechnen muessen; bei einem
     Grabstein ginge das gar nicht, der hat keinen Namen mehr.
     created_at bleibt in der Antwort: es traegt den Ueberfahrtext der Zeile.
     WER DEN NAMEN ZEIGT, entscheidet die Oberflaeche -- ein Verfassername ist
     keine Auskunft, die zurueckgehalten werden muesste; er steht an den vier
     anderen Traegern ohnehin in jeder Antwort. */
  it.links = qLinks.all(id).map(l => ({
    id: l.id, url: l.url, sort_order: l.sort_order, created_at: l.created_at,
    mine: l.user_id === benutzerId, verfasser: verfasserAus(karte, l.user_id)
  }));
  it.tags = qTags.all(id);
  it.testDays = qTestDays(id, benutzerId, karte);
  it.comments = qComments(id, benutzerId, karte);
  // Die eigene Sterne-Zeile. Ohne die Bedingung auf user_id
  // vervielfacht der LEFT JOIN das Kriterium -- bei zwei Bewertern kaeme jedes
  // Kriterium zweimal, und das Widget zeigte zwei Reihen Sterne fuer dieselbe
  // Sache. Ein Bedienelement zeigt den Zustand, den es veraendert; der Schnitt
  // ueber alle steht daneben in avg und count -- angehaengt aus
  // einer gruppierten Abfrage, nicht aus einem zweiten JOIN.
  // gewicht steht an jeder Zeile: die Oberflaeche zeichnet daraus die Marke
  // ×1,5 hinter dem Namen, und der Vergleich rechnet in der Stellung "meine"
  // damit -- ohne das Feld liefe dort eine ungewichtete Zahl neben einer
  // gewichteten.
  it.ratings = db.prepare(`
    SELECT c.id AS criterion_id, c.name, c.gewicht, COALESCE(r.value, 0) AS value
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
const qAlleItems = db.prepare('SELECT * FROM items ORDER BY updated_at DESC');
/* VORBEREITET UND NICHT JE EINTRAG UEBERSETZT. Beide Abfragen standen in der
   Schleife darunter und wurden damit einmal je Eintrag uebersetzt. Gemessen an
   1000 Eintraegen: 24,2 ms so, 11,5 ms vorbereitet. Die uebrigen Abfragen der
   Schleife (qPhotos, qTags, qLinks) stehen aus demselben Grund laengst
   oben. */
const qAnhangZahl = db.prepare('SELECT COUNT(*) n FROM attachments WHERE item_id = ?');

/* ================= Die Volltextsuche =================
   SIE SUCHT DIESELBEN SIEBEN QUELLEN, DIE VORHER IM FELD `searchText` STANDEN:
   Titel, Beschreibung, Kategoriename, Tags am Eintrag, Tags an Testtagen,
   Linkadressen und samtliche Kommentartexte. Bis 0.10.0 baute der Server
   dieses Feld je Eintrag und schickte es mit; gesucht wurde damit im Browser.
   Das Feld war 73 Prozent der Antwort (gemessen: 2,50 MB von 1000 Eintraegen,
   0,68 MB ohne). Jetzt sucht der Server, und das Feld entfaellt.

   instr() UND NICHT LIKE, UND DAS IST DER KERN DER SACHE. `LIKE '%…%'` liest
   `%` und `_` im Suchbegriff als Wildcards: die Eingabe eines einzelnen
   Prozentzeichens faende JEDEN Eintrag statt des einen, der eines traegt.
   Mit ESCAPE liesse sich das einfangen, aber instr() kennt gar keine
   Wildcards -- der Suchbegriff ist dort Text, von Bauart und nicht durch eine
   Klemme, die jemand vergessen kann. Nachgestellt an 1001 Eintraegen: LIKE
   ungeschuetzt 1001 Treffer, instr() einer, wie vorher im Browser.

   KEIN FTS5, UND DAS IST NACHGERECHNET. Die eingebaute SQLite kann es
   (3.49.2, trigram legt an), es kaeme also keine Abhaengigkeit dazu. An 1000
   Eintraegen mit 1,75 MB Suchtext kostet der Trigramm-Index aber 5,17 MB --
   das Dreifache des Textes, den er indiziert -- und braeuchte eine
   Auffrischung an sieben Schreibstellen. Vor allem AENDERT ER DAS VERHALTEN:
   eine Trigramm-Abfrage mit einem oder zwei Zeichen scheitert nicht, sie
   liefert STILL NULL Treffer. Vorher fand ein einzelnes Zeichen. Ein Index,
   der eine Millisekunde spart und dem Benutzer die Suche ab einem Zeichen
   nimmt, ist kein Gewinn.

   DIE SIEBEN QUELLEN STEHEN ALS SIEBEN ODER-GLIEDER DA und nicht als
   zusammengesetzter Text. SQLite bricht die Kette beim ersten Treffer ab: ein
   haeufiges Wort im Titel kostet 1,9 ms, ein seltener Begriff, der alle sieben
   durchlaeuft, 13,2 ms. Ein vorher zusammengesetzter Text kostete immer den
   ganzen Durchlauf.

   DIE ROUTE BLEIBT DIESELBE, mit einem Parameter mehr. Sie ist lesend und
   steht deshalb NICHT in F_ROUTEN -- dieselbe Regel wie bei GET /api/offen.
   UND SIE TRIFFT DIESELBE MENGE WIE DIE LISTE OHNE PARAMETER: gelesen wird
   dieselbe Tabelle `items` ohne jede weitere Einschraenkung. Der Papierkorb
   liegt nicht darin (das Loeschen entfernt die Zeile in derselben
   Transaktion), Entwuerfe gibt es nicht, und ein abgelehnter Eintrag steht in
   der Liste und darum auch in der Suche. Die Suche ist damit kein neuer Zugang
   zu fremden Kommentaren -- sie sagt nur, WELCHE Eintraege einen Text tragen,
   und die Antwort enthaelt die Kommentartexte selbst so wenig wie vorher.

   DER SUCHBEGRIFF GEHT NICHT INS SICHERHEITSPROTOKOLL. Freitext gehoert dort
   nicht hinein, und eine lesende Route schreibt ohnehin nichts.

   KEINE EIGENE BREMSE. Die Route steht hinter der Anmeldung; die Anmeldebremse
   verteidigt gegen Fremde und nicht gegen Zugaenge, die es schon gibt. */
const qVolltext = db.prepare(`
  SELECT i.id FROM items i
  LEFT JOIN product_categories c ON c.id = i.product_category_id
  WHERE instr(kkl(i.title), :q) > 0
     OR instr(kkl(i.description), :q) > 0
     OR instr(kkl(c.name), :q) > 0
     OR EXISTS (SELECT 1 FROM item_tags it JOIN tags t ON t.id = it.tag_id
                WHERE it.item_id = i.id AND instr(kkl(t.name), :q) > 0)
     OR EXISTS (SELECT 1 FROM test_days d JOIN test_day_tags dt ON dt.test_day_id = d.id
                JOIN tags tt ON tt.id = dt.tag_id
                WHERE d.item_id = i.id AND instr(kkl(tt.name), :q) > 0)
     OR EXISTS (SELECT 1 FROM links l WHERE l.item_id = i.id AND instr(kkl(l.url), :q) > 0)
     OR EXISTS (SELECT 1 FROM comments k WHERE k.item_id = i.id AND instr(kkl(k.text), :q) > 0)`);

/* DER BEGRIFF WIRD GENAU SO ZUGESCHNITTEN WIE VORHER IM BROWSER: aussen
   getrimmt, klein geschrieben. Ein Begriff, von dem danach nichts uebrig ist,
   ist KEINE Suche und keine Suche ohne Treffer -- die Liste bleibt dann die
   ganze Liste. Zurueck kommt eine Menge von Nummern und keine Reihenfolge:
   sortiert wird die Liste selbst, an einer Stelle. */
const volltextBegriff = (roh) => (typeof roh === 'string' ? roh.trim().toLowerCase() : '');
const volltextTreffer = (begriff) => new Set(qVolltext.all({ q: begriff }).map(r => r.id));

app.get('/api/items', (req, res) => {
  let rows = qAlleItems.all();
  const begriff = volltextBegriff(req.query.q);
  if (begriff) {
    const treffer = volltextTreffer(begriff);
    rows = rows.filter(r => treffer.has(r.id));
  }
  /* DIE ZEITLEISTE EINMAL FUER DIE GANZE LISTE GEFRAGT, nicht je Eintrag: es
     ist eine persoenliche Einstellung und aendert sich innerhalb einer Antwort
     nicht. Ist sie aus, faellt `testDays` aus der Antwort -- das sind gemessen
     weitere 6 Prozent. AUS DER LISTENANTWORT LIEST DAS FELD GENAU EINE STELLE
     DER OBERFLAECHE, zeitleistePunkte(), und die laeuft nur bei
     eingeschalteter Zeitleiste. Die Kachel rechnet aus testCount, testAvg und
     testLast und nicht daraus; der Vergleich holt seine Testtage aus
     GET /api/items/:id. Beide bleiben also richtig. */
  const zeitleiste = zeitleisteAn(req.benutzer.id);
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
    // Das erste Element ist das Hauptbild, gleich welcher Art -- bei einem
    // Video steht dort sein Standbild. Die beiden Zaehler daneben sind
    // getrennt: photoCount zaehlt Fotos und hat damit dieselbe Bedeutung wie
    // vorher, videoCount ist der neue Nachbar. Zusammengezaehlt hiesse ein
    // Video kuenftig "Foto", und eine aeltere Oberflaeche laese es falsch.
    it.mainPhoto = ph[0] || null;
    it.photoCount = ph.filter(p2 => p2.art !== 'video').length;
    it.videoCount = ph.filter(p2 => p2.art === 'video').length;
    it.category = it.product_category_id ? qCat.get(it.product_category_id) : null;
    it.tags = qTags.all(it.id);
    const links = qLinks.all(it.id);
    it.linkCount = links.length;
    it.attachmentCount = qAnhangZahl.get(it.id).n;
    // Dieselbe Rechnung wie in detail(), ueber denselben Helfer. Zwei
    // Rechenwege fuer die Kachel und die Zeile daneben waeren zwei Wahrheiten
    // ueber dieselbe Zahl.
    it.avgRating = gesamtSchnitt(schnitteJeKriterium(it.id));
    Object.assign(it, testStats(it.id));
    // Die Zeitleiste braucht die Testtage selbst, nicht nur ihre Anzahl --
    // und dazu, wem sie gehoeren. Ohne sie braucht die Liste sie nicht.
    if (zeitleiste) it.testDays = qTestDays(it.id, req.benutzer.id, karte);
    /* DIE BESCHREIBUNG FAELLT AUS DER LISTE, WIE BISHER. Sie stand nie in
       dieser Antwort -- gebraucht wurde sie allein zum Bilden des Suchfelds,
       und das gibt es nicht mehr. Die Kachel zeigt keine Beschreibung; wer sie
       will, holt den Eintrag. */
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

   NUR NOCH DIE FOTOS STEHEN MIT EINER ZAHL DA. Sie haengen am Eintrag und
   gehoeren damit seinem Verfasser. Links (0.8.30) und Dateien (0.8.31) koennen
   fremd sein und gehoeren deshalb auf dieselbe Seite wie Kommentar, Bewertung
   und Testtag.

   value > 0 bei den Bewertungen: eine zurueckgesetzte Zeile steht mit 0 in der
   Tabelle und ist keine Stimme -- dieselbe Bedingung wie beim Schnitt, bei der
   Stimmenliste und beim Verwendungszaehler der Kriterien. Die Zahl im Dialog
   und die Namen darunter im Bewertungsblock muessen dasselbe meinen. */
app.get('/api/items/:id/bestand', nurEintragVerfasser, (req, res) => {
  const id = req.params.id, ich = req.benutzer.id;
  const eins = (sql, ...w) => db.prepare(sql).get(...w).n;
  res.json({
    // Zwei Zeilen, nicht eine Summe: ein Dialog, der "3 Fotos" sagt und dabei
    // ein Video mit wegwirft, verschweigt genau die Zeile, um derentwillen er
    // dasteht. `fotos` behaelt seine Bedeutung und bekommt einen Nachbarn.
    fotos: eins("SELECT COUNT(*) n FROM photos WHERE item_id = ? AND art != 'video'", id),
    videos: eins("SELECT COUNT(*) n FROM photos WHERE item_id = ? AND art = 'video'", id),
    eigenDateien: eins('SELECT COUNT(*) n FROM attachments WHERE item_id = ? AND user_id = ?', id, ich),
    fremdDateien: eins('SELECT COUNT(*) n FROM attachments WHERE item_id = ? AND user_id IS NOT ?', id, ich),
    eigenLinks: eins('SELECT COUNT(*) n FROM links WHERE item_id = ? AND user_id = ?', id, ich),
    fremdLinks: eins('SELECT COUNT(*) n FROM links WHERE item_id = ? AND user_id IS NOT ?', id, ich),
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
  // Das Loeschen geht durch den Papierkorb: der Eintrag wird serialisiert und
  // in DERSELBEN Transaktion entfernt. Danach laeuft die Kaskade wie zuvor,
  // und der Eintrag ist wirklich weg -- er liegt nur zusaetzlich noch als
  // Paket daneben. Der Dialog in der Oberflaeche sagt es vorher;
  // "unwiderruflich" waere falsch.
  inDenPapierkorb(req.params.id, req.benutzer.id);
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
      if (!await rasterBild(f.buffer))
        return res.status(400).json({ error: 'Nur Bilddateien sind erlaubt' });
      const v = await makeVariants(f.buffer);
      ins.run(req.params.id, f.mimetype, f.buffer, v.thumb, v.medium, pos++);
    }
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.benutzer.id));
  } catch (e) { next(e); }
});

/* ---- Videos ----
 * EIGENE ROUTE, nicht die Fotoroute erweitert. Deren fileFilter auf ^image\/
 * ist eine grobe erste Schranke, die nichts traegt -- aber sie zu lockern
 * naehme sie dem Fotoweg mit ab, und eine Route truege zwei Gestalten.
 * ZWEI TEILE IN EINEM VORGANG: die Videodatei und ein JPEG. Das Standbild
 * erzeugt der Browser des Hochladenden ueber <video> und <canvas>; der Server
 * oeffnet nie ein Video und braucht deshalb kein ffmpeg. Wer ein Video nicht
 * abspielen kann, kann kein Standbild daraus ziehen und laedt es nicht hoch --
 * und das ist richtig: ein Videoplatz, der nicht abspielt, ist ein kaputter.
 */
// 20 MB und nicht 50, und die Zahl ist gemessen: 50 MB kosten beim Lesen aus
// der verschluesselten Datenbank eine halbe Sekunde -- mit dem ganzen Blob im
// Arbeitsspeicher, denn eine BLOB-Zeile wird nicht stueckweise gelesen. Bei
// zwei Leuten gleichzeitig ist das spuerbar. 20 MB reichen fuer ein bis zwei
// Minuten Handyvideo. Wer mehr braucht, nimmt den Anhang.
const VIDEO_MAX = 20 * 1024 * 1024;
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: VIDEO_MAX },
  // Erste, grobe Schranke am gemeldeten Typ, wie am Fotoweg. Sie haelt nichts
  // auf, was sich umbenennen laesst -- die tragenden Pruefungen stehen im
  // Rumpf: typAusBytes() an der Videodatei, rasterBild() am Standbild.
  fileFilter: (req, file, cb) => {
    const gut = file.fieldname === 'video' ? /^video\//.test(file.mimetype)
                                           : /^image\//.test(file.mimetype);
    cb(gut ? null : Object.assign(new Error('Nur ein Video mit Standbild ist erlaubt'),
                                  { status: 400 }), gut);
  }
});

// Der Waechter steht VOR multer, wie am Fotoweg: die Datei eines Fremden soll
// gar nicht erst eingelesen werden.
app.post('/api/items/:id/videos', nurEintragVerfasser,
  videoUpload.fields([{ name: 'video', maxCount: 1 }, { name: 'standbild', maxCount: 1 }]),
  async (req, res, next) => {
    try {
      if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
        return res.status(404).json({ error: 'Nicht gefunden' });
      const video = req.files?.video?.[0], standbild = req.files?.standbild?.[0];
      if (!video || !standbild)
        return res.status(400).json({ error: 'Video und Standbild gehören zusammen' });
      /* DER INHALT ENTSCHEIDET, nicht die Endung im Namen und nicht der
         gemeldete Typ -- dieselbe Regel wie am Fotoweg, nur mit dem
         Erkenner, der auch beim Ausliefern entscheidet. Damit kann keine
         Videozeile entstehen, die sich hinterher nicht abspielen laesst.
         AUF DIE VIDEODATEI WIRD rasterBild() AUSDRUECKLICH NICHT ANGEWANDT:
         der Server oeffnet nie ein Video. Gelesen werden zwoelf Bytes. */
      if (!Object.values(anh.VIDEO_TYPEN).includes(anh.typAusBytes(video.buffer)))
        return res.status(400).json({ error: 'Nur MP4-, WebM- und MOV-Videos sind erlaubt' });
      // Das Standbild geht denselben Weg wie jedes Foto: was sharp nicht als
      // Bild lesen kann, kommt nicht herein.
      if (!await rasterBild(standbild.buffer))
        return res.status(400).json({ error: 'Das Standbild ist keine Bilddatei' });
      // Die Dauer ist eine Angabe des Hochladenden wie der gemeldete Typ:
      // gespeichert und angezeigt, nie tragend. Unsinniges wird zu NULL.
      const d = Math.round(Number(req.body.dauer));
      const dauer = Number.isFinite(d) && d > 0 && d <= 24 * 3600 ? d : null;
      const v = await makeVariants(standbild.buffer);
      /* Kaeme hier nichts heraus, bliebe die Zeile OHNE Standbild -- und zwar
         dauerhaft: das Nachruesten beim Start laesst Videozeilen aus, weil es
         sonst aus der Videodatei ableiten wuerde. Ein Foto in derselben Lage
         holt seine Vorschau beim naechsten Start nach; ein Video kann das
         nicht. Deshalb lieber gar nicht anlegen als kaputt. */
      if (!v.thumb || !v.medium)
        return res.status(400).json({ error: 'Aus dem Standbild ließ sich keine Vorschau erzeugen' });
      // sort_order zaehlt weiter wie bisher: ein Video haengt sich hinten an
      // die vorhandenen Zeilen, in derselben Nummerierung.
      const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM photos WHERE item_id = ?')
        .get(req.params.id).m + 1;
      db.prepare(`INSERT INTO photos (item_id, mime_type, data, thumb, medium, sort_order, art, dauer)
                  VALUES (?, ?, ?, ?, ?, ?, 'video', ?)`)
        .run(req.params.id, video.mimetype, video.buffer, v.thumb, v.medium, pos, dauer);
      touch.run(req.params.id);
      res.status(201).json(detail(req.params.id, req.benutzer.id));
    } catch (e) { next(e); }
  });

/* Der ausgelieferte Typ kommt aus den ersten Bytes, nie aus photos.mime_type.
   Die Spalte ist eine Angabe des Hochladenden: sie wird gespeichert und
   angezeigt, sie entscheidet aber nicht, was der Browser mit der Antwort
   macht. Damit ist auch geschuetzt, was schon in der Datenbank liegt -- eine
   Ableitung braucht keinen Migration. Dieselbe Regel wie bei den Anhaengen,
   siehe anhaenge.js. Bei einem Video ist der Blob je nach Groesse etwas
   anderes: mit size= das Standbild, ohne die Videodatei -- und der Erkenner
   sieht das den Bytes an, ohne dass hier etwas unterschieden wird.

   BEREICHE NUR AM VIDEO UND NUR AN DER GANZEN DATEI. An einem Foto aendert
   sich damit keine einzige Header -- das ist Absicht und wird geprueft:
   diese Runde darf an der Auslieferung vorhandener Fotos nichts aendern. */
app.get('/api/photos/:id/raw', (req, res) => {
  const p = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).end();
  let blob = p.data;
  let rangefaehig = p.art === 'video';
  if (req.query.size === 'thumb' && p.thumb) { blob = p.thumb; rangefaehig = false; }
  else if (req.query.size === 'medium' && p.medium) { blob = p.medium; rangefaehig = false; }
  anh.setzeBildHeader(res, blob, { name: `foto-${p.id}`, maxAge: 86400 });
  if (!rangefaehig) return res.send(blob);
  res.set('Accept-Ranges', 'bytes');
  const b = anh.rangeAus(req.headers.range, blob.length);
  if (!b) return res.send(blob);
  // Ungueltiges wird abgewiesen, nicht zurechtgebogen: ein Abspieler, der
  // etwas anderes bekommt als er verlangt hat, zeigt Bildsalat statt Fehler.
  if (b.ungueltig) {
    res.set('Content-Range', `bytes */${blob.length}`);
    return res.status(416).end();
  }
  res.set('Content-Range', `bytes ${b.von}-${b.bis}/${blob.length}`);
  res.status(206).send(blob.slice(b.von, b.bis + 1));
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

/* HOCHLADEN DARF JEDER -- dieselbe Regel wie an der Linkzeile und aus demselben
   Grund: eine Datei erscheint nur dort, wo man sie hinsetzt. Der Waechter vor
   multer ist damit gefallen; die Grenze von ANHANG_ZAHL Dateien je Eintrag
   gilt weiter fuer alle zusammen, nicht je Benutzer. */
app.post('/api/items/:id/attachments', anhangUpload.array('files', ANHANG_ZAHL), (req, res, next) => {
  try {
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: 'Nicht gefunden' });
    const da = db.prepare('SELECT COUNT(*) n FROM attachments WHERE item_id = ?').get(req.params.id).n;
    const neu = (req.files || []).length;
    if (da + neu > ANHANG_ZAHL)
      return res.status(400).json({ error: `Mehr als ${ANHANG_ZAHL} Dateien je Eintrag sind nicht vorgesehen.` });
    let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM attachments WHERE item_id = ?')
      .get(req.params.id).m + 1;
    const ins = db.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order, user_id)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const f of req.files || []) {
      // Nur der Name, nie ein Pfad: ein hochgeladenes "../../etwas" soll
      // nichts weiter sein als ein merkwuerdiger Dateiname.
      const name = path.basename(String(f.originalname || 'datei')).slice(0, 200) || 'datei';
      ins.run(req.params.id, name, String(f.mimetype || '').slice(0, 120), f.buffer.length, f.buffer,
              pos++, req.benutzer.id);
    }
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.benutzer.id));
  } catch (e) { next(e); }
});

// Herunterladen bzw. Einbetten. Einzige Stelle, die Anlagenbytes ausliefert.
app.get('/api/attachments/:id/raw', (req, res) => {
  const a = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).end();
  anh.setzeHeader(res, a.filename, { inline: req.query.inline === '1' });
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

/* LOESCHEN DARF DER HOCHLADENDE ODER DER ADMIN. Gefragt wird nach der ZEILE
   (darfAendern), nicht mehr nach dem Eintrag: wer eine Datei an einen fremden
   Eintrag haengt, muss sie auch wieder herausnehmen koennen. Herrenlose Zeilen
   faengt darfAendern ab -- sie gehoeren dem Admin. */
app.delete('/api/attachments/:id', (req, res) => {
  const a = db.prepare('SELECT item_id, user_id FROM attachments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Nicht gefunden' });
  if (!darfAendern(req, a.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
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

/* EINTRAGEN DARF JEDER -- wie den Kommentar, den Testtag und die Bewertung.
   Ein Link erscheint nur dort, wo man ihn hinsetzt, und gehoert damit dem, der
   ihn hinsetzt, nicht dem Verfasser des Eintrags. Was an ALLEN Eintraegen
   erscheint, gehoert weiter dem Admin.
   Die Zeile traegt ihren Verfasser von Anfang an; darauf steht spaeter die
   Frage, wer sie loeschen darf. */
app.post('/api/items/:id/links', (req, res) => {
  const url = normalisiereLink(req.body.url);
  if (!url) return res.status(400).json({ error: 'Adresse oder Suchbegriff fehlt' });
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Nicht gefunden' });
  const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM links WHERE item_id = ?')
    .get(req.params.id).m + 1;
  db.prepare('INSERT INTO links (item_id, url, sort_order, user_id) VALUES (?, ?, ?, ?)')
    .run(req.params.id, url, pos, req.benutzer.id);
  touch.run(req.params.id);
  res.status(201).json(detail(req.params.id, req.benutzer.id));
});

/* SORTIEREN BLEIBT BEIM EINTRAGSVERFASSER UND ADMIN -- ausdruecklich, nicht
   aus Versehen: die Reihenfolge aendert keine Aussage und ist umkehrbar,
   dieselbe Ueberlegung wie beim Anpinnen eines Kommentars. Eintragen und
   Loeschen richten sich dagegen nach der einzelnen Zeile. */
app.put('/api/items/:id/link-order', nurEintragVerfasser, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE links SET sort_order = ? WHERE id = ? AND item_id = ?');
  db.transaction(() => ids.forEach((lid, i) => s.run(i, lid, req.params.id)))();
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

/* LOESCHEN DARF DER EINTRAGER ODER DER ADMIN. Gefragt wird nach der ZEILE
   (darfAendern), nicht mehr nach dem Eintrag: wer einen Link in einen fremden
   Eintrag setzt, muss ihn auch wieder herausnehmen koennen, und der Verfasser
   des Eintrags ist dafuer der Falsche. Herrenlose Zeilen faengt darfAendern
   ab -- sie gehoeren dem Admin. Ein geloeschter Link bekommt ausdruecklich
   KEINEN Vermerk: er ist eine ganze Aussage, die geht, kein Loch in einer
   bleibenden. */
app.delete('/api/links/:id', (req, res) => {
  const l = db.prepare('SELECT * FROM links WHERE id = ?').get(req.params.id);
  if (!l) return res.status(404).json({ error: 'Nicht gefunden' });
  if (!darfAendern(req, l.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
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
  anh.setzeHeader(res, 'bild.jpg', { inline: true });
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

/* ---- Offene Aufgaben quer ueber alle Eintraege ---------------------------
   Eine LESENDE Route ohne Waechter: wer angemeldet ist, sieht die Kommentare
   ohnehin in jedem Eintrag. Sie steht deshalb in keiner Liste schreibender
   Routen -- und der Haken wird auch nicht hier gesetzt, sondern ueber
   PUT /api/comments/:id, das es laengst gibt.

   DIESELBE BEDINGUNG WIE IN DER DETAILANSICHT: dort steht `c.kind === 'task'`,
   hier `kind = 'task'`. Die Art ist EIN Wert -- 'task' ist die offene und
   'done' die erledigte Aufgabe. Wer hier `kind != 'done'` schriebe, naehme
   Notizen und Berichte mit; wer eine zweite Schreibweise erfindet, hat zwei
   Ausdruecke fuer dieselbe Frage, und die laufen auseinander.

   SORTIERT WIE DIE UEBERSICHT: updated_at des Eintrags absteigend, innerhalb
   des Eintrags nach id -- also aelteste Aufgabe oben, wie im Kommentarblock.
   Die Gruppierung macht die Oberflaeche; sie bricht auf den Wechsel der
   Eintragsnummer um und braucht keine zweite Reihenfolge dafuer.

   `mine` haengt an JEDER Zeile, wie am Kommentar im Eintrag: daran haengt der
   Haken. Die Oberflaeche rechnet nicht aus dem Verfasserobjekt zurueck, wem
   eine Zeile gehoert -- bei einem Grabstein ginge das gar nicht. */
const qOffeneAufgaben = db.prepare(`
  SELECT c.id, c.text, c.created_at, c.user_id, c.item_id, i.title, i.updated_at
    FROM comments c JOIN items i ON i.id = c.item_id
   WHERE c.kind = 'task'
   ORDER BY i.updated_at DESC, c.id`);
app.get('/api/offen', (req, res) => {
  const karte = verfasserKarte();
  res.json(qOffeneAufgaben.all().map(z => ({
    id: z.id, text: z.text, created_at: z.created_at,
    item: { id: z.item_id, title: z.title },
    mine: z.user_id === req.benutzer.id,
    verfasser: verfasserAus(karte, z.user_id)
  })));
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
  // Getrennt nach Art, aus demselben Grund wie im Loeschdialog: photoCount und
  // photoBytes behalten ihre Bedeutung und bekommen Nachbarn. Zusammengezaehlt
  // waere die alte Zahl kuenftig eine andere Aussage.
  const p = db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos WHERE art != 'video'").get();
  const vi = db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos WHERE art = 'video'").get();
  const an = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(size),0) AS o FROM attachments').get();
  /* Der Papierkorb steht GETRENNT da, aus demselben Grund wie die Videos:
     sonst wundert sich jemand ueber eine Datenbank, die nach dem
     Aufraeumen groesser ist als vorher. Die alten Zahlen behalten ihre
     Bedeutung und bekommen einen Nachbarn -- itemCount zaehlt weiterhin die
     Eintraege, und ein geloeschter ist keiner mehr. */
  const pk = db.prepare(`SELECT COUNT(*) AS n,
      COALESCE(SUM(length(inhalt)),0) + COALESCE((SELECT SUM(length(daten)) FROM papierkorb_bytes),0) AS o
    FROM papierkorb`).get();
  res.json({
    version: VERSION,
    // Der Fingerprint steht hier und nicht in /api/config: er ist dieselbe Art
    // Aussage wie die Zahlen darunter -- eine ueber die ANLAGE ALS GANZES.
    // Und die Liste in /api/config ist ausdruecklich abgeschlossen; was
    // dort steht, sieht jeder, der die Adresse kennt. Der Fingerprint nagelt
    // den laufenden Dateisatz fest und geht deshalb nicht vor die Anmeldung.
    fingerprint: FINGERPRINT,
    dbBytes, photoCount: p.n, photoBytes: p.o,
    videoCount: vi.n, videoBytes: vi.o,
    attachmentCount: an.n, attachmentBytes: an.o,
    papierkorbCount: pk.n, papierkorbBytes: pk.o,
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

/* ================= Das Austauschformat =================

   EINE ABBILDUNG JE EINTRAG, und sie steht hier statt mitten in der
   Exportroute. Gerufen wird sie an drei Stellen: der volle Export, der
   Einzelexport und der Papierkorb. Zwei Rechenwege fuer dieselbe Datei laufen
   auseinander -- und ausgerechnet die Runde, die das Wiederherstellen baut,
   haette damit den Fehler eingebaut, den sie verhindern soll.

   DIE BYTES GEHEN UEBER EINEN TRICHTER, nicht ueber ein festes Feld. Zwei
   Formen, ein Weg:
     Exportdatei -- Base64 im Feld <name>_base64. Die Datei ist EIN String.
     Papierkorb  -- eine NUMMER im Feld <name>_ref; die Bytes liegen daneben
                    in papierkorb_bytes, als Bytes.
   Der Grund ist gemessen und keine Vorsicht: ein Eintrag darf zwanzig Videos
   zu je 20 MB tragen. Als Base64 sind das 533 MB in EINEM
   String, und Node haelt keinen String ueber 512 MB
   (MAX_STRING_LENGTH = 536.870.888); JSON.stringify antwortet mit
   "RangeError: Invalid string length". Ein Papierkorb, der stumpf alles
   einpackt, risse an genau dem Eintrag, den zu verlieren am meisten wehtut.
   Zippen hilft dagegen NICHT -- der String entsteht vor dem Zippen. */

// Die Formatnummer ist eine AUSSAGE, keine Bedingung: weder der Import noch
// die Oberflaeche lesen sie. Entschieden wird ueber das Vorhandensein der
// Felder -- nur so bleiben aeltere Dateien lesbar, ohne dass irgendwo eine
// Fallunterscheidung nach Nummer steht. Sie steht an genau einer Stelle.
// 10 statt 9, seit die Fotozeilen ihre Art und die Videos ihre Dauer und ihr
// Standbild mitnehmen. Eine Datei mit EINEM Eintrag ist dieselbe Form wie eine
// mit hundert; der Einzelexport bewegt die Nummer deshalb nicht.
const AUSTAUSCH_FORMAT = 10;

// Die Grenze, an der eine Exportdatei zerbraeche, mit Luft davor. Sie steht
// hier und nicht als Zahl im Rumpf: der Wert kommt aus Node und nicht aus
// einer Schaetzung.
const AUSTAUSCH_MAX = Math.floor(require('buffer').constants.MAX_STRING_LENGTH * 0.9);

// Der Trichter der Exportdatei. Base64 blaeht um ein Drittel auf, und das ist
// der Preis dafuer, dass eine Textdatei Bytes tragen kann.
const TRICHTER_DATEI = { endung: '_base64', nimm: (buf) => buf.toString('base64') };

/* Der Trichter des Papierkorbs. Er sammelt die Bytes in einer Liste und legt
   nur ihre Nummer ins Paket; die Liste wandert danach zeilenweise nach
   papierkorb_bytes. So entsteht an keiner Stelle ein grosser String. */
function trichterAblage(sammler) {
  return { endung: '_ref', nimm: (buf) => { sammler.push(buf); return sammler.length - 1; } };
}

/* Die Gegenrichtung, einmal fuer beide Formen. Eine Datei traegt Base64, eine
   Papierkorbzeile eine Nummer; `quelle` loest die Nummer auf und ist bei einer
   Datei null. ERST DAS VORHANDENSEIN, dann der Wert -- ein fehlendes Feld ist
   der Normalfall (Export ohne Videos, aeltere Datei) und kein Fehler. */
function bytesAus(o, name, quelle) {
  const b64 = o[name + '_base64'];
  if (b64) return Buffer.from(b64, 'base64');
  const nr = o[name + '_ref'];
  if (quelle && nr != null) return quelle(nr);
  return null;
}

/* EINE Karte von der Id auf den Namen, einmal je Aufruf gebaut und an vier
   Stellen benutzt -- statt vier LEFT JOINs auf users. Ein Ort, der aus einer
   Id einen Namen macht; die Gegenrichtung im Import hat aus demselben Grund
   ebenfalls genau einen.
   Der Name wird geliefert, NICHT die Id: eine nackte Id liest niemand, und sie
   waere in einer Datei, die das Haus verlaesst, eine Angabe ueber eine Person
   ohne jeden Nutzen. Wo eine Zeile herrenlos ist (ON DELETE SET NULL), steht
   ausdruecklich null -- das Feld fehlt nie, damit sich "kein Verfasser" von
   "altes Dateiformat" unterscheiden laesst. */
function verfasserNamen() {
  const namen = new Map(db.prepare('SELECT id, username FROM users').all().map(u => [u.id, u.username]));
  return (id) => (id == null ? null : (namen.get(id) || null));
}

/* Die Lage, in der ein Paket entsteht: wessen Favoriten gelten, wie die Bytes
   hinausgehen und welche Schalter stehen. `pins` ist die Menge der Favoriten
   DESSEN, DER ZIEHT -- dieselbe Bedeutung wie im Feld favorite der
   Schnittstelle.
   BEWUSST: der Verfasser kommt zu Eintrag, Bewertung, Kommentar und Testtag,
   NICHT zum Favoriten. Er ist eine Aussage ueber einen Eintrag und nicht sein
   Inhalt; eine Liste fremder Favoriten in der Datei waere Ablage, kein
   Bestand. HINZUNEHMENDE FOLGE, und sie gehoert gesagt: beim Wiederherstellen
   aus dem Papierkorb kommen die Favoriten ANDERER nicht zurueck. */
function paketLage(benutzerId, schalter = {}) {
  return {
    verfasserName: verfasserNamen(),
    pins: new Set(qMeinePins.all(benutzerId).map(p => p.item_id)),
    trichter: schalter.trichter || TRICHTER_DATEI,
    mitFotos: schalter.mitFotos !== false,
    mitDateien: !!schalter.mitDateien,
    mitVideos: !!schalter.mitVideos
  };
}

// Die Abbildung je Eintrag. Sie kommt genau einmal vor; ein Waechter im
// Pruefstand haelt das fest.
function eintragAlsPaket(it, lage) {
  const { verfasserName, pins, trichter, mitFotos, mitDateien, mitVideos } = lage;
  const t = trichter.endung;
  const o = {
    title: it.title, description: it.description,
    rejected: !!it.rejected, tested: !!it.tested, favorite: pins.has(it.id),
    // Der Eintrag selbst nennt seinen Verfasser: ohne dieses Feld schoebe
    // eine ersetzende Wiederherstellung ALLE Eintraege dem Einspielenden zu.
    author: verfasserName(it.user_id),
    created_at: it.created_at, updated_at: it.updated_at,
    category: it.product_category_id ? qCat.get(it.product_category_id).name : null,
    tags: qTags.all(it.id).map(x => x.name),
    // Ein Link ist keine nackte String mehr, sondern eine Adresse mit
    // Verfasser -- wie an den vier anderen Traegern. Ohne dieses Feld kaemen
    // eingespielte Links herrenlos herein, und der Export verloere genau die
    // Angabe, die es zu tragen gilt. Dafuer steht die Formatnummer 7.
    links: qLinks.all(it.id).map(l => ({ url: l.url, author: verfasserName(l.user_id) })),
    // ORDER BY day, id: zwei Leute duerfen denselben Tag eintragen. Ohne
    // die zweite Bedingung haetten die beiden Zeilen keine feste
    // Reihenfolge in der Datei.
    testDays: db.prepare('SELECT id, day, rating, user_id FROM test_days WHERE item_id = ? ORDER BY day, id').all(it.id)
      .map(x => ({ day: x.day, rating: x.rating, author: verfasserName(x.user_id),
                   tags: qTestDayTags.all(x.id).map(y => y.name) })),
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
        images: mitDateien
          ? db.prepare('SELECT filename, data FROM comment_images WHERE comment_id = ? ORDER BY sort_order, id')
              .all(c.id).map(b2 => ({ filename: b2.filename, ['data' + t]: trichter.nimm(b2.data) }))
          : []
      })),
    photos: [], attachments: []
  };
  if (mitFotos) {
    o.photos = db.prepare('SELECT mime_type, data, thumb, medium, focus_x, focus_y, art, dauer FROM photos WHERE item_id = ? ORDER BY sort_order, id')
      .all(it.id).map(p => {
        const z = { mime_type: p.mime_type, focus_x: p.focus_x, focus_y: p.focus_y, art: p.art };
        if (p.art !== 'video') { z['data' + t] = trichter.nimm(p.data); return z; }
        z.dauer = p.dauer;
        /* OHNE DEN SCHALTER BLEIBT DIE ZEILE ALS MARKE STEHEN -- ohne Bytes.
           Sie legt beim Einspielen keinen Platz an (photos.data ist NOT
           NULL, und ein Videoplatz, der ein Standbild ausliefert, bliebe im
           Abspieler schwarz), aber der Import kann dadurch NENNEN, wie viele
           Videos die Datei nicht enthielt. Ohne die Marke wuesste er es
           nicht, und der Verlust waere still. */
        if (mitVideos) {
          z['data' + t] = trichter.nimm(p.data);
          /* Das Standbild geht EIGENS mit. Der Import erzeugt die Varianten
             sonst aus data -- bei einem Video also aus der Videodatei, und
             das Standbild waere verloren. */
          const sb = p.medium || p.thumb;
          if (sb) z['standbild' + t] = trichter.nimm(sb);
        }
        return z;
      });
  }
  if (mitDateien) {
    // author wie an den fuenf anderen Traegern; ohne das Feld kaemen
    // eingespielte Dateien herrenlos herein. Dafuer steht die Formatnummer 8.
    o.attachments = db.prepare('SELECT filename, mime_type, data, user_id FROM attachments WHERE item_id = ? ORDER BY sort_order, id')
      .all(it.id)
      .map(a2 => ({ filename: a2.filename, mime_type: a2.mime_type,
                    author: verfasserName(a2.user_id), ['data' + t]: trichter.nimm(a2.data) }));
  }
  return o;
}

/* Der Umschlag um die Eintraege. Er steht getrennt, weil eine Datei mit EINEM
   Eintrag denselben Umschlag braucht wie eine mit hundert -- und weil der
   Papierkorb ihn ebenfalls ablegt: eine Papierkorbzeile ist ein vollstaendiges
   Paket und nicht ein halbes. */
function exportUmschlag(items) {
  const title = getSetting('title_app', 'Kriterion');
  // Zusaetzliches Feld, damit die Kriterienreihenfolge den Export ueberlebt.
  // Bestehende Feldnamen bleiben unveraendert, aeltere Dateien ohne dieses
  // Feld lassen sich weiterhin einspielen.
  const kritZeilen = db.prepare('SELECT name, gewicht FROM rating_criteria ORDER BY sort_order, id').all();
  /* Die Gewichte kommen als EIGENES Feld daneben, criteria bleibt eine Liste
     von Namen. Auf Objekte umzustellen brauchte nur einen Buchstaben mehr,
     liefe aber in einer aelteren Anlage durch String() und ergaebe dort ein
     Kriterium namens "[object Object]". Ein zusaetzliches Feld ignoriert sie
     dagegen wortlos -- Rueckwaertskompatibilitaet ist zugesichert, und die
     Gegenrichtung ist hier fast geschenkt.
     NUR ABWEICHUNGEN. Ein Kriterium mit Gewicht 1 taucht gar nicht auf --
     dieselbe Regel wie bei der Anzeige, und ein ungewichteter Bestand ergibt
     damit eine Datei, die zeichengleich zu der vor dieser Version ist. */
  const criteriaGewichte = {};
  for (const c of kritZeilen) if (c.gewicht !== 1) criteriaGewichte[c.name] = c.gewicht;
  return { exported_at: new Date().toISOString(), title, version: AUSTAUSCH_FORMAT,
           criteria: kritZeilen.map(c => c.name), criteriaGewichte, items };
}

// Der Dateiname einer Exportdatei. Aus dem Titel der Anlage, damit zwei
// Anlagen nicht zwei gleichnamige Dateien im Ordner ablegen.
function exportName(zusatz) {
  const title = getSetting('title_app', 'Kriterion');
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kriterion';
  return `${slug}-export${zusatz}-${new Date().toISOString().slice(0, 10)}.json`;
}

/* Wie viele Bytes eine Datei traegt, BEVOR sie gebaut wird. Base64 kostet ein
   Drittel Aufschlag; wer darueber liegt, bekommt eine Absage statt eines
   Abrisses. Eine Ansage ist besser als ein RangeError im Protokoll. */
function austauschBytes(itemId, schalter) {
  const eins = (sql, ...w) => db.prepare(sql).get(...w).n || 0;
  let n = 0;
  if (schalter.mitFotos)
    n += eins("SELECT COALESCE(SUM(length(data)),0) n FROM photos WHERE item_id = ? AND art != 'video'", itemId);
  if (schalter.mitFotos && schalter.mitVideos)
    n += eins("SELECT COALESCE(SUM(length(data)+COALESCE(length(medium),0)),0) n FROM photos WHERE item_id = ? AND art = 'video'", itemId);
  if (schalter.mitDateien) {
    n += eins('SELECT COALESCE(SUM(length(data)),0) n FROM attachments WHERE item_id = ?', itemId);
    n += eins(`SELECT COALESCE(SUM(length(ci.data)),0) n FROM comment_images ci
               JOIN comments c ON c.id = ci.comment_id WHERE c.item_id = ?`, itemId);
  }
  return Math.round(n * 4 / 3);
}

/* ---- Export ---- */
// Nur der Eigentuemer. Die Exportdatei ist der gesamte Bestand in
// einer Datei, die das Haus verlaesst -- mit allen Fotos, allen Anhaengen und
// den Namen aller Verfasser. "Alles sehen darf jeder" gilt fuer
// den Bildschirm, nicht fuer die Mitnahme.
// HINZUNEHMENDE FOLGE, und sie gehoert in den Betrieb: ein Admin ohne
// Eigentuemerrecht kann keine Sicherung mehr ziehen.
/* DIE ZWEITE BESTAETIGUNG ALS WAECHTER, und hier gab es gar keine Wahl: der
   Knopf loest eine BROWSERNAVIGATION aus (window.location), damit die Datei an
   der Platte vorbeilaeuft statt vollstaendig im Speicher zu stehen. Ein Rumpf
   ist dort baulich unmoeglich, und in die Adresse gehoert ein Passwort nie --
   dort stuende es im Zugriffsprotokoll, in der Verlaufsliste und womoeglich im
   Referrer.
   LESEND, DESHALB KEIN EINTRAG IN F_ROUTEN -- die Liste ist die Stelle fuer
   schreibende Routen. Die Klemme bekommt deshalb eine eigene Quelltextpruefung
   daneben; ohne sie waere sie die einzige der sieben, die niemand zaehlt. */
app.get('/api/export', nurEigentuemer, zweiteBestaetigungNoetig('export'), (req, res) => {
  const schalter = {
    mitFotos: req.query.photos !== '0',
    // Eigener Schalter, Vorgabe aus: bei 50 MB je Datei waere die Exportdatei
    // sonst schnell unhandlich -- Base64 blaeht zusaetzlich um ein Drittel auf.
    mitDateien: req.query.files === '1',
    /* Dasselbe fuer die Videos, und aus demselben Grund nur schaerfer: ein
       20-MB-Video wird als Base64 zu 27 MB, und zwanzig davon sind 533 MB in
       EINEM String. Node haelt kein String ueber rund 512 MB; der
       Export risse. Vorgabe deshalb aus. */
    mitVideos: req.query.videos === '1'
  };
  const lage = paketLage(req.benutzer.id, schalter);
  const items = db.prepare('SELECT * FROM items ORDER BY id').all().map(it => eintragAlsPaket(it, lage));
  auth.protokolliere('export', { wer: req.benutzer.id });
  res.set('Content-Disposition', `attachment; filename="${exportName('')}"`);
  res.json(exportUmschlag(items));
});

/* ---- Ein einzelner Eintrag als Datei ----
 * Lesend, deshalb kein Eintrag in F_ROUTEN -- der Waechter steht trotzdem
 * davor, und zwar derselbe wie am vollen Export.
 * WARUM NICHT MILDER: eine Datei mit EINEM Eintrag nennt genauso die Namen
 * ihrer Verfasser und kann beim Einspielen genauso unter fremdem Namen
 * schreiben. Die Frage "was kann jemand mit dieser Datei tun" hat dieselbe
 * Antwort wie beim vollen Export, und die Antwort haengt nicht an der Zahl der
 * Eintraege.
 * ALLES GEHT MIT, ohne Schalter: bei einem Eintrag ist die Datei die Sache
 * selbst und keine Auswahl daraus. Wo sie zu gross wuerde, steht eine Absage.
 */
app.get('/api/items/:id/export', nurEigentuemer, (req, res) => {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!it) return res.status(404).json({ error: 'Nicht gefunden' });
  const schalter = { mitFotos: true, mitDateien: true, mitVideos: true };
  const gross = austauschBytes(it.id, schalter);
  if (gross > AUSTAUSCH_MAX)
    return res.status(413).json({ error: `Dieser ${vokabular().sacheEinzahl} ist als Datei zu groß ` +
      `(rund ${Math.round(gross / 1048576)} MB). Eine Exportdatei ist ein einziger Text, und der kann ` +
      `nicht größer als 512 MB werden.` });
  const paket = eintragAlsPaket(it, paketLage(req.benutzer.id, schalter));
  res.set('Content-Disposition', `attachment; filename="${exportName('-' + it.id)}"`);
  res.json(exportUmschlag([paket]));
});

/* ---- Import ---- */
const importUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 900 * 1024 * 1024 } });

/* DER DESERIALISIERER, und er steht hier statt im Routenrumpf -- aus demselben
   Grund wie die Abbildung eine Seite weiter oben: das Wiederherstellen aus dem
   Papierkorb braucht ihn genauso wie die Datei. Ein zweiter, frisch
   geschriebener liefe auseinander, nur spiegelverkehrt.

   `bytesQuelle` loest die Nummern des Papierkorbs auf und ist bei einer Datei
   null -- dort stehen die Bytes als Base64 in der JSON selbst.

   ASYNCHRON, und das hat einen Grund: die Bildvarianten entstehen ueber sharp
   und muessen VOR der Transaktion fertig sein. In der Transaktion darf nichts
   Langsames und nichts Asynchrones mehr passieren. */
async function spieleEin(payload, benutzerId, modus, bytesQuelle = null) {
  // Ableitungen vorab erzeugen: das geht nicht innerhalb einer Transaktion,
  // weil es asynchron ist.
  const prepared = [];
  // Kommentarbilder je Kommentarobjekt, damit sie in der Transaktion
  // bereitliegen. WeakMap geht nicht -- die Objekte werden dort mehrfach
  // nachgeschlagen.
  const kommentarBilder = new Map();
  /* Die laute Haelfte der Videos: nicht abbrechen, melden -- dieselbe Haltung
     wie bei unbekannten Verfassernamen und ungueltigen Gewichten. */
  let videosOhneDatei = 0, videosUnlesbar = 0;
  for (const it of payload.items) {
    const photos = [];
    for (const p of it.photos || []) {
      /* ENTSCHIEDEN WIRD UEBER DAS VORHANDENSEIN DER FELDER, nicht ueber die
         Formatnummer -- die ist im Projekt eine Aussage, keine Bedingung.
         Eine Datei ohne art an ihren Fotos ist eine aeltere, und alles darin
         ist ein Bild. */
      const istVideo = p.art === 'video';
      const buf = bytesAus(p, 'data', bytesQuelle);
      if (!buf) {
        // Ein Videoplatz ohne Videodatei: so steht er in einer Datei, die
        // ohne den Schalter geschrieben wurde. Er wird nicht angelegt,
        // sondern gezaehlt und genannt. HINZUNEHMENDE FOLGE, und sie gehoert
        // gesagt: stand das Video an erster Stelle, wird das naechste Foto
        // zum Hauptbild.
        if (istVideo) videosOhneDatei++;
        continue;
      }
      /* Bei einem Video kommen die Varianten aus dem STANDBILD, nie aus
         data: dort steht die Videodatei. Laesst sich das Standbild nicht
         durch sharp lesen oder fehlt es, wird die Zeile uebergangen und
         genannt -- dieselbe Regel wie beim Hochladen. */
      const vorlage = istVideo ? bytesAus(p, 'standbild', bytesQuelle) : buf;
      const v = vorlage ? await makeVariants(vorlage) : { thumb: null, medium: null };
      // Dieselbe Schaerfe wie beim Hochladen: fehlt EINE der beiden
      // Varianten, wird die Zeile nicht angelegt. Das Nachruesten beim Start
      // holt sie an einer Videozeile nicht nach.
      if (istVideo && (!v.thumb || !v.medium)) { videosUnlesbar++; continue; }
      // Fokuspunkt aus der Datei uebernehmen; aeltere Exportdateien haben
      // ihn nicht und landen auf der Mitte.
      const im = (v2, vorgabe) => {
        const n = Number(v2);
        return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : vorgabe;
      };
      // Die Dauer ist eine Angabe wie der gemeldete Typ, und sie wird
      // genauso beschnitten wie beim Hochladen.
      const d = Math.round(Number(p.dauer));
      photos.push({ mime: p.mime_type || (istVideo ? 'video/mp4' : 'image/jpeg'),
                    buf, thumb: v.thumb, medium: v.medium,
                    fx: im(p.focus_x, 50), fy: im(p.focus_y, 50),
                    art: istVideo ? 'video' : 'bild',
                    dauer: istVideo && Number.isFinite(d) && d > 0 && d <= 24 * 3600 ? d : null });
    }
    const attachments = [];
    for (const a2 of it.attachments || []) {
      const buf = bytesAus(a2, 'data', bytesQuelle);
      if (!buf) continue;
      attachments.push({
        name: path.basename(String(a2.filename || 'datei')).slice(0, 200) || 'datei',
        mime: String(a2.mime_type || '').slice(0, 120), buf,
        // Roh mitgenommen und erst in der Transaktion aufgeloest: verfasser()
        // liegt dort und zaehlt mit. `hatAutor` unterscheidet "kein Name
        // genannt" (author: null) von "Feld gibt es nicht" (Format bis 7).
        hatAutor: 'author' in a2, autor: a2.author
      });
    }
    // Kommentarbilder vorab kodieren -- in der Transaktion darf nichts
    // Langsames oder Asynchrones mehr passieren.
    for (const c of it.comments || []) {
      const fertig = [];
      for (const b2 of c.images || []) {
        const roh = bytesAus(b2, 'data', bytesQuelle);
        if (!roh) continue;
        try {
          const { gross, klein } = await kodiereKommentarBild(roh);
          fertig.push({ name: path.basename(String(b2.filename || 'bild.jpg')).slice(0, 200), gross, klein });
        } catch { /* unlesbares Bild wird stillschweigend uebergangen */ }
      }
      if (fertig.length) kommentarBilder.set(c, fertig);
    }
    prepared.push({ it, photos, attachments });
  }

  const stats = { items: 0, photos: 0, videos: 0, comments: 0, links: 0, testDays: 0, attachments: 0 };
  // Die Nummern der neu angelegten Eintraege. Der Papierkorb braucht sie, um
  // nach dem Wiederherstellen in den Eintrag springen zu koennen; die
  // Dateieinspielung laesst sie liegen.
  const neueIds = [];

  /* EIN Ort, der aus einem Namen eine Id macht -- die Gegenrichtung
     zur Karte im Export. Die Regel:
     ein genannter Name, den es gibt, wird zugeordnet; alles andere faellt
     an den Einspielenden. Aeltere Dateien nennen gar keinen Namen und
     landen deshalb vollstaendig beim Einspielenden.

     EIN UNBEKANNTER NAME LEGT KEINEN ZUGANG AN. Taete er es, waere eine
     Exportdatei ein Weg an der Verwaltung und am Passwort vorbei:
     ein Zugang ohne Hash, den niemand angelegt hat.

     EIN GRABSTEIN WIRD GEFUNDEN: ein entfernter Zugang bleibt als Zeile in
     users stehen und traegt den Namen "geloescht-<nr>". Ein Beitrag, dessen
     Verfasser inzwischen entfernt wurde, kommt deshalb WIEDER AM GRABSTEIN AN
     und heisst auf dem Bildschirm weiterhin "Gelöschter Benutzer <nr>". Erst
     wenn auch die Grabsteinzeile fort ist, faellt der Beitrag an den
     Einspielenden -- und wird dann genannt.

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
    if (!sauber) return benutzerId;
    let id = namensSpeicher.get(sauber);
    if (id === undefined) {
      const u = qNachName.get(sauber);
      id = u ? u.id : null;
      namensSpeicher.set(sauber, id);
    }
    if (id == null) { unbekannteNamen.add(sauber); return benutzerId; }
    // Der eigene Name ist kein Fremdverweis: er zaehlt nicht als zugeordnet,
    // sonst meldete jede selbst erzeugte Datei eine Zuordnung, die keine ist.
    if (id !== benutzerId) zugeordnet++;
    return id;
  };

  /* Die Gewichte aus der Datei, einmal aufbereitet -- und ausdruecklich
     AUSSERHALB der Transaktion, weil die Antwort unten die verworfenen
     nennen muss. Der Schluessel steht klein geschrieben, weil critByName()
     ueber COLLATE NOCASE sucht -- sonst faende "Verarbeitung" das Gewicht zu
     "verarbeitung" nicht.
     EIN UNGUELTIGES GEWICHT BRICHT NICHT AB, sondern faellt auf 1,0 und wird
     genannt. Eine ganze Einspielung an einem Zahlenwert scheitern zu lassen
     waere unverhaeltnismaessig -- dieselbe Haltung wie bei einem unbekannten
     Verfassernamen. */
  const dateiGewichte = new Map();
  const verworfeneGewichte = new Set();
  const rohGewichte = payload.criteriaGewichte;
  if (rohGewichte && typeof rohGewichte === 'object' && !Array.isArray(rohGewichte)) {
    for (const [name, roh] of Object.entries(rohGewichte)) {
      const sauber = String(name || '').trim();
      if (!sauber) continue;
      const g = gueltigesGewicht(roh);
      if (g === null) { verworfeneGewichte.add(sauber); continue; }
      dateiGewichte.set(sauber.toLowerCase(), g);
    }
  }

  // Ein einziger Vorgang: bricht etwas ab, bleibt der Bestand unveraendert.
  db.transaction(() => {
    if (modus === 'replace') {
      /* DIESE DREI ZEILEN FUELLEN DEN PAPIERKORB AUSDRUECKLICH NICHT.
         Ein ersetzender Import legte sonst die ganze bisherige Anlage als
         Pakete daneben und verdoppelte sie damit in derselben Datei. Wer
         ersetzt, hat die Datei in der Hand, aus der er ersetzt -- das ist der
         Rueckweg, und er ist ein anderer als der Papierkorb. */
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
      // EIN BEKANNTES KRITERIUM BEHAELT SEIN GEWICHT. Der Import legt
      // Bestand an, er aendert keine Einstellung des Ziels -- dieselbe Regel
      // wie beim ersetzenden Import, der `users` nicht anruehrt.
      if (f) return f.id;
      const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM rating_criteria').get().m + 1;
      // Ein NEU angelegtes bekommt das Gewicht aus der Datei, sonst 1,0.
      const g = dateiGewichte.get(String(name).trim().toLowerCase());
      return db.prepare('INSERT INTO rating_criteria (name, sort_order, gewicht) VALUES (?, ?, ?)')
        .run(name, pos, g === undefined ? 1.0 : g).lastInsertRowid;
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
      // EINMAL ermittelt und festgehalten: die Linkzeilen einer Datei ohne
      // Verfasserangabe brauchen dieselbe Nummer noch einmal, und ein
      // zweiter Aufruf von verfasser() zaehlte den Fremdverweis doppelt.
      const itemVerfasser = verfasser(it.author);
      const id = db.prepare(`INSERT INTO items
        (title, description, rejected, tested, product_category_id, created_at, updated_at, user_id)
        VALUES (?, ?, ?, ?, ?, COALESCE(?, datetime('now')), COALESCE(?, datetime('now')), ?)`)
        .run(it.title || 'Ohne Titel', it.description || '',
             it.rejected ? 1 : 0, it.tested ? 1 : 0,
             catByName(it.category), it.created_at || null, it.updated_at || null,
             itemVerfasser).lastInsertRowid;
      neueIds.push(id);
      // Der Favorit bleibt beim Einspielenden, auch wenn der Eintrag einem
      // anderen zufaellt: favorite heisst "habe ICH als Favorit markiert".
      if (it.favorite) db.prepare('INSERT OR IGNORE INTO item_pins (user_id, item_id) VALUES (?, ?)')
        .run(benutzerId, id);
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
      /* ZWEI FORMEN, EINE SCHLEIFE. Bis Formatnummer 6 war ein Link eine
         nackte String, ab 7 ein Objekt mit url und author. Eine alte
         Datei ist kein Fehler, sondern der Normalfall nach einem
         Downgrade.
         WEM EIN LINK AUS EINER DATEI DER FORMATNUMMER 6 GEHOERT: dem
         Verfasser DES EINTRAGS -- dieselbe Antwort wie beim Migration und aus
         demselben Grund. Die Datei sagt nichts anderes, als dass die Links
         zu diesem Eintrag gehoeren; "unbekannter Name" traefe es nicht, es
         steht ja keiner da. Deshalb wird hier verfasser() NICHT gefragt,
         sondern die schon ermittelte Nummer des Eintrags genommen. */
      let lpos = 0;
      (it.links || []).forEach((eintrag) => {
        const roh = (eintrag && typeof eintrag === 'object') ? eintrag.url : eintrag;
        const sauber = normalisiereLink(roh);
        if (!sauber) return;
        const wem = (eintrag && typeof eintrag === 'object' && 'author' in eintrag)
          ? verfasser(eintrag.author) : itemVerfasser;
        db.prepare('INSERT INTO links (item_id, url, sort_order, user_id) VALUES (?, ?, ?, ?)')
          .run(id, sauber, lpos++, wem);
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

      // Fortlaufend neu nummeriert: uebergangene Videos hinterlassen keine
      // Luecke in der Reihenfolge.
      photos.forEach((p, i) =>
        { db.prepare(`INSERT INTO photos (item_id, mime_type, data, thumb, medium, focus_x, focus_y, sort_order, art, dauer)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(id, p.mime, p.buf, p.thumb, p.medium, p.fx, p.fy, i, p.art, p.dauer);
          if (p.art === 'video') stats.videos++; else stats.photos++; });

      /* Fehlt das Feld (aeltere Exportdatei oder Export ohne Dateien),
         bleibt der Eintrag einfach ohne Anhaenge.
         WEM EINE DATEI AUS EINER DATEI DER FORMATNUMMER 7 ODER AELTER
         GEHOERT: dem Verfasser DES EINTRAGS -- dieselbe Antwort wie beim
         Migration und wie bei den Links. Steht dagegen ein Feld `author` da,
         entscheidet es, auch wenn es null ist. */
      attachments.forEach((a2, i) =>
        { db.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order, user_id)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .run(id, a2.name, a2.mime, a2.buf.length, a2.buf, i,
                 a2.hatAutor ? verfasser(a2.autor) : itemVerfasser); stats.attachments++; });
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
  /* Dieselbe Bauform eine Zeile tiefer: ein Gewicht, das die Spanne
     verlaesst, bricht nichts ab und verschwindet auch nicht wortlos. Es
     steht in der Antwort UND im Protokoll -- die Antwort fuer den Pruefstand
     und die Abfrage von Hand, das Protokoll fuer den Betrieb. */
  const gewichteVerworfen = [...verworfeneGewichte].sort();
  if (gewichteVerworfen.length)
    console.log(`[Kriterion] Import: ungueltiges Gewicht auf 1,0 zurueckgesetzt ` +
                `(${gewichteVerworfen.length}): ${gewichteVerworfen.join(', ')}`);
  /* Und dieselbe Bauform ein drittes Mal, an den Videos. Ein Export ohne den
     Videoschalter enthaelt ihre Daten nicht; das darf nicht still bleiben,
     denn stand ein Video an erster Stelle, wird jetzt das naechste Foto zum
     Hauptbild. Antwort UND Protokoll -- die Antwort fuer den Pruefstand und
     die Abfrage von Hand, das Protokoll fuer den Betrieb. */
  if (videosOhneDatei)
    console.log(`[Kriterion] Import: ${videosOhneDatei} Video(s) waren nicht in der Datei ` +
                `enthalten und wurden uebergangen.`);
  if (videosUnlesbar)
    console.log(`[Kriterion] Import: ${videosUnlesbar} Video(s) ohne lesbares Standbild ` +
                `uebergangen.`);
  return { ok: true, mode: modus, ...stats,
           verfasserZugeordnet: zugeordnet, verfasserUnbekannt: unbekannt,
           gewichteVerworfen, videosOhneDatei, videosUnlesbar, neueIds };
}

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
/* DIE ZWEITE BESTAETIGUNG STEHT VOR multer, aus demselben Grund wie der
   Waechter darueber: eine bis zu 900 MB grosse Datei soll gar nicht erst
   eingelesen werden, wenn die Handlung ohnehin abgewiesen wird. Ein Passwort
   im Multipart-Rumpf waere erst DANACH lesbar -- das ist der Grund, warum die
   Bestaetigung eine eigene Route hat und nicht im Rumpf der Handlung reist. */
app.post('/api/import', nurEigentuemer, zweiteBestaetigungNoetig('import'),
         importUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Keine Datei übermittelt' });
    const mode = req.body.mode === 'replace' ? 'replace' : 'merge';
    let payload;
    try { payload = JSON.parse(req.file.buffer.toString('utf8')); }
    catch { return res.status(400).json({ error: 'Die Datei ist kein gültiger Export.' }); }
    if (!payload || !Array.isArray(payload.items))
      return res.status(400).json({ error: 'Die Datei enthält nichts zum Einspielen.' });
    // neueIds bleibt hier liegen: eine Datei mit hundert Eintraegen liefert
    // hundert Nummern, mit denen die Oberflaeche nichts anfaengt.
    const { neueIds, ...antwort } = await spieleEin(payload, req.benutzer.id, mode);
    auth.protokolliere('import', { wer: req.benutzer.id, merkmal: mode });
    res.json(antwort);
  } catch (e) { next(e); }
});


/* ================= Der Papierkorb =================

   Beim Loeschen eines Eintrags wird er im vorhandenen Austauschformat
   serialisiert und als EINE Zeile abgelegt -- in DERSELBEN Transaktion wie das
   Loeschen. Danach laeuft die Kaskade wie bisher.

   KEINE BESTEHENDE ABFRAGE AENDERT SICH. items bekommt keine Spalte, kein
   WHERE bekommt einen Zusatz. Ein geloeschter Eintrag ist wirklich weg -- er
   liegt nur zusaetzlich noch als Paket daneben. Die Begruendung dieser Bauform
   steht in db.js an der Tabelle.

   ZWEI LOESCHWEGE FUELLEN IHN AUSDRUECKLICH NICHT, und das gehoert gesagt:
   "Zugang entfernen" mit dem Haekchen "Eintraege mitnehmen" (das steckt in
   auth.js, und auth.js darf von der Abbildung in server.js nichts wissen --
   die Abhaengigkeit laeuft andersherum) und der ERSETZENDE Import (er
   verdoppelte sonst die ganze bisherige Anlage in den Papierkorb). */

const PAPIERKORB_TAGE = 30;

const insPapierkorb = db.prepare(
  'INSERT INTO papierkorb (titel, inhalt, geloescht_von) VALUES (?, ?, ?)');
const insPapierkorbBytes = db.prepare(
  'INSERT INTO papierkorb_bytes (papierkorb_id, nr, daten) VALUES (?, ?, ?)');
const qPapierkorbBytes = db.prepare(
  'SELECT daten FROM papierkorb_bytes WHERE papierkorb_id = ? AND nr = ?');
const delPapierkorbAlt = db.prepare(
  "DELETE FROM papierkorb WHERE geloescht_am < datetime('now', ?)");

/* ZWEI AUFRUFSTELLEN, beide noetig -- dieselbe Bauform wie bei
   ordneBestandZu(): beim Start und beim Oeffnen der Karte. Eine Anlage, die
   drei Monate durchlaeuft, raeumte sonst drei Monate lang nicht auf, und die
   Karte zeigte Zeilen, die es laengst nicht mehr geben duerfte.
   HINZUNEHMENDE FOLGE, und sie gehoert benannt: damit schreibt eine LESENDE
   Route. Das ist Hauswirtschaft und keine Benutzerhandlung -- die Liste
   schreibender Routen bleibt davon unberuehrt. Wiederholbar und im Normalfall
   stumm.
   Die Bytes fallen ueber ON DELETE CASCADE mit. */
function raeumePapierkorbAuf() {
  const n = delPapierkorbAlt.run(`-${PAPIERKORB_TAGE} days`).changes;
  if (n) console.log(`[Kriterion] Papierkorb: ${n} Zeile(n) aelter als ` +
    `${PAPIERKORB_TAGE} Tage entfernt.`);
  return n;
}
// Erste Aufrufstelle: der Start. Die zweite steht an GET /api/papierkorb.
raeumePapierkorbAuf();
// Und dasselbe fuer die abgelaufenen Token, nach derselben Bauform: erste
// Aufrufstelle hier, zweite an GET /api/users. Die Funktion steht in auth.js,
// weil dort auch alles andere zu den Token steht.
auth.raeumeTokensAuf();
// Und dasselbe fuer das Sicherheitsprotokoll: erste Aufrufstelle hier, zweite
// an GET /api/sicherheitsprotokoll.
auth.raeumeProtokollAuf();
/* Und die unbestaetigten Anfragen, seit 0.9.1. DREI Aufrufstellen statt
   zweier: hier, an GET /api/anfragen und -- das ist die besondere -- in
   legeAnfrageAn() selbst, vor der Deckelpruefung. Die dritte ist keine
   Hauswirtschaft, sondern Teil der Entscheidung: sonst blockierten zwanzig
   laengst verfallene Zeilen die Selbstanmeldung noch einen weiteren Tag. */
auth.raeumeAnfragenAuf();

/* Der Weg hinein. EINE Transaktion, und das ist die Zusicherung der Runde:
   entweder liegt der Eintrag im Papierkorb UND ist geloescht, oder er steht
   unveraendert da. Ein halber Stand ist ausgeschlossen -- nachgestellt mit
   einem erzwungenen Fehlschlag.
   Gelesen wird IN der Transaktion: die Abbildung fragt zehn Tabellen ab, und
   zwischen dem Lesen und dem Loeschen darf sich nichts bewegen. */
function inDenPapierkorb(itemId, wer) {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  if (!it) return null;
  const sammler = [];
  const lage = paketLage(wer, {
    // Ohne Schalter: der Papierkorb ist kein Export, sondern der Rueckweg.
    // Ein Rueckweg, der die Videos wegliesse, waere keiner.
    mitFotos: true, mitDateien: true, mitVideos: true, trichter: trichterAblage(sammler)
  });
  return db.transaction(() => {
    const umschlag = exportUmschlag([eintragAlsPaket(it, lage)]);
    const p = insPapierkorb.run(it.title, JSON.stringify(umschlag), wer);
    sammler.forEach((buf, nr) => insPapierkorbBytes.run(p.lastInsertRowid, nr, buf));
    db.prepare('DELETE FROM items WHERE id = ?').run(it.id);
    return p.lastInsertRowid;
  })();
}

/* Die Liste. LESEND, deshalb kein Eintrag in F_ROUTEN -- der Waechter steht
   trotzdem davor, wie bei GET /api/stats und GET /api/items/:id/bestand.
   WARUM DER ADMIN SIE SEHEN DARF: er darf jeden Eintrag loeschen und sieht in
   der Uebersicht ohnehin jeden Titel -- "alles sehen darf jeder" gilt hier
   fuer den Bildschirm. Der Papierkorb zeigt ihm nichts, was er vor dem
   Loeschen nicht schon sah.
   GEHANDELT WIRD TROTZDEM NUR VOM EIGENTUEMER: Wiederherstellen legt Zeilen
   unter FREMDEM Namen an -- Kommentare, Bewertungen und Testtage anderer sind
   ueber die Kaskade mit hineingewandert. Das ist naeher am Import als am
   Loeschen, und der steht hinter nurEigentuemer. Dieselbe Bauform wie bei den
   Karten "Kategorien", "Tags" und "Bewertungskriterien": Liste fuer jeden
   Berechtigten, Bedienzeichen nur dort, wo gedrueckt werden darf. */
const qPapierkorb = db.prepare(`SELECT p.id, p.titel, p.geloescht_am, p.geloescht_von,
    (SELECT COUNT(*) FROM papierkorb_bytes b WHERE b.papierkorb_id = p.id) AS dateien,
    length(p.inhalt) + COALESCE(
      (SELECT SUM(length(b.daten)) FROM papierkorb_bytes b WHERE b.papierkorb_id = p.id), 0) AS bytes
  FROM papierkorb p ORDER BY p.geloescht_am DESC, p.id DESC`);

app.get('/api/papierkorb', nurAdmin, (req, res) => {
  raeumePapierkorbAuf();
  const karte = verfasserKarte();
  res.json({
    // Die Zahl steht in der Antwort und wird nicht aus der Liste gezaehlt: die
    // Karte nennt sie auch dann, wenn sie die Liste noch gar nicht gezeichnet
    // hat.
    tage: PAPIERKORB_TAGE,
    zeilen: qPapierkorb.all().map(z => ({
      id: z.id, titel: z.titel, geloescht_am: z.geloescht_am,
      // Wer geloescht hat, in derselben Form wie jeder Verfasser -- damit die
      // Oberflaeche denselben einen Weg von der Nummer zum Namen geht und ein
      // Grabstein "Gelöschter Benutzer 7" heisst.
      loeschender: verfasserAus(karte, z.geloescht_von),
      dateien: z.dateien, bytes: z.bytes,
      // Die Frist rechnet der Server: die Zahl PAPIERKORB_TAGE steht an einer
      // Stelle, und die Oberflaeche baut sie nicht nach.
      tageOffen: Math.max(0, PAPIERKORB_TAGE - Math.floor(
        (Date.now() - Date.parse(z.geloescht_am.replace(' ', 'T') + 'Z')) / 86400000))
    }))
  });
});

/* Wiederherstellen. Es legt einen NEUEN Eintrag an und stellt nicht den alten
   zurueck -- die alte Nummer ist weg, und daran haengt nichts mehr. Genau das
   kann der Import schon, und deshalb geht der Weg durch ihn.

   WAS AUS DEN VERFASSERN WIRD, steht damit fest und wird hier nicht neu
   erfunden: ein genannter Name, den es gibt, wird zugeordnet -- ein GRABSTEIN
   ebenfalls, denn seine Zeile in users steht noch. Erst wenn auch sie fort
   ist, faellt der Beitrag an den Wiederherstellenden und wird in der Antwort
   genannt. Eine herrenlose Zeile (author: null) faellt ebenso an ihn.

   WAS NICHT ZURUECKKOMMT und benannt gehoert: die Favoriten ANDERER (favorite
   heisst "habe ICH markiert") und der Eingriffsvermerk am Kommentar -- beides
   steht in keiner Exportdatei, und der Papierkorb ist eine. */
app.post('/api/papierkorb/:id/wiederherstellen', nurEigentuemer, async (req, res, next) => {
  try {
    const z = db.prepare('SELECT * FROM papierkorb WHERE id = ?').get(req.params.id);
    if (!z) return res.status(404).json({ error: 'Nicht gefunden' });
    let umschlag;
    try { umschlag = JSON.parse(z.inhalt); }
    catch { return res.status(500).json({ error: 'Das Paket lässt sich nicht lesen.' }); }
    // Die Bytes kommen aus der Nebentabelle, Zeile fuer Zeile -- nie alle
    // zugleich in einem String. Fehlt eine Nummer, wird die Zeile uebergangen
    // und genannt, wie bei einem Video ohne Datei.
    const quelle = (nr) => {
      const b = qPapierkorbBytes.get(z.id, nr);
      return b ? b.daten : null;
    };
    const ergebnis = await spieleEin(umschlag, req.benutzer.id, 'merge', quelle);
    // Erst nach dem Einspielen: scheitert es, bleibt die Zeile liegen.
    db.prepare('DELETE FROM papierkorb WHERE id = ?').run(z.id);
    reclaim();
    res.json({ ...ergebnis, itemId: ergebnis.neueIds[0] ?? null, titel: z.titel });
  } catch (e) { next(e); }
});

// Endgueltig entfernen. Dieselbe Rechtezeile wie das Wiederherstellen: wer
// einen Rueckweg nehmen darf, darf ihn auch schliessen. Die Bytes fallen ueber
// ON DELETE CASCADE mit.
app.delete('/api/papierkorb/:id', nurEigentuemer, (req, res) => {
  const n = db.prepare('DELETE FROM papierkorb WHERE id = ?').run(req.params.id).changes;
  if (!n) return res.status(404).json({ error: 'Nicht gefunden' });
  reclaim();
  res.status(204).end();
});


/* ================= Die Sicherung =================

   DIE ROLLENTEILUNG, und sie gehoert in die Oberflaeche und nicht nur in die
   Dokumente:
     VACUUM INTO   -- der SICHERUNGSWEG. Vollstaendig (samt Sitzungen und
                      Einstellungen), konstant im Speicherbedarf, verschluesselt
                      wie das Original -- und damit ohne den Schluessel wertlos.
                      Ueberlebt keinen Formatwechsel.
     JSON-Export   -- der AUSTAUSCHWEG. Ueberlebt einen Formatwechsel, braucht
                      keinen Schluessel, ist dafuer unvollstaendig und baut die
                      ganze Datei im Arbeitsspeicher.
   Wer die beiden Karten nebeneinander sieht, muss ohne Rueckfrage wissen,
   welche er will. Ein Satz je Karte, und er steht dort.

   ES GIBT KEINEN ZWEITEN WEG. db.backup() liefe schrittweise und blockierte
   nicht -- nachgestellt: an einer SQLCipher-Datenbank antwortet es mit
   "backup is not supported with incompatible source and target databases",
   weil die Zieldatenbank keinen Schluessel traegt. VACUUM INTO ist der Weg.

   ES LAEUFT SYNCHRON, und das ist die Kroete: better-sqlite3 blockiert den
   Prozess, und der Prozess ist der Server. Gemessen, nicht geschaetzt: rund
   10 ms je MB (51 MB in 0,5 s, 2 GB in 26,5 s) -- auf schwaecherer Hardware
   entsprechend mehr. Deshalb nennt die Karte die erwartete Dauer VORHER.

   DER ZIELORT IST EINGABE UND WIRD ZU EINEM DATEIPFAD -- die erste Stelle im
   Projekt, an der der Server an einen Ort schreibt, den jemand angeben darf.
   Er ist deshalb zweistufig gebaut:
     die WURZEL kommt aus der Umgebung (SICHERUNG_DIR) und ist ueber die
       Oberflaeche nicht zu erreichen. KEIN Vorgabewert: ein Pfad, den es nur
       im Container gibt, verschwaende beim naechsten Bau -- er muss eingehaengt
       sein, und wer ihn einhaengt, benennt ihn auch.
     der ORT ist ein Unterverzeichnis darunter, und mehr nicht.
   Geprueft wird gegen eine POSITIVLISTE und danach am AUFGELOESTEN Pfad, nicht
   am String: ein Symlink, der aus der Wurzel herausfuehrt, faellt erst dort
   auf. Ein Verzeichnis, das es nicht gibt, ist eine Absage mit Begruendung --
   kein stilles Anlegen. */

const SICHERUNG_DIR = (process.env.SICHERUNG_DIR || '').trim();
// Gemessen an einer verschluesselten Anlage: rund 10 ms je MB. Verdoppelt,
// weil der Betrieb auf einem N100 laeuft und eine zu niedrige Ansage
// schlimmer ist als eine zu hohe.
const SICHERUNG_MS_JE_MB = 20;
const SICHERUNG_MUSTER = /^kriterion-.+\.sqlite$/;
// Positivliste statt Liste des Verbotenen: JEDES Segment faengt mit einem
// Buchstaben oder einer Ziffer an. Damit sind '..', '.', ein fuehrender
// Schraegstrich, ein Laufwerksbuchstabe und ein Gegenschraegstrich gar nicht
// erst schreibbar -- nicht verboten, sondern nicht ausdrueckbar.
const ORT_MUSTER = /^[A-Za-z0-9][A-Za-z0-9 ._-]*(\/[A-Za-z0-9][A-Za-z0-9 ._-]*)*$/;

/* Liegt der eine Pfad im anderen? Gefragt wird an AUFGELOESTEN Pfaden --
   ein Vergleich zweier Strings beantwortet die Frage nicht, sobald ein
   Symlink im Spiel ist. */
const liegtIn = (innen, aussen) => innen === aussen || innen.startsWith(aussen + path.sep);

/* Das Anwendungsverzeichnis -- der Ort, an dem diese Datei liegt. Es
   beantwortet die eine Frage, die die Karte rot oder gruen macht: liegt der
   Sicherungsort NEBEN der Anwendung oder ausserhalb?

   EINE SICHERUNG IM ARBEITSVERZEICHNIS IST DIE BEQUEME, NICHT DIE SICHERE
   LAGE. Sie ueberlebt kein Umbenennen des Projektverzeichnisses, kein
   versehentliches Loeschen desselben, und sie liegt auf derselben Platte wie
   das Original. Sie ist trotzdem erlaubt: eine Sicherung am falschen Ort ist
   besser als keine, und wer sie so will, soll sie bekommen -- er soll nur
   nicht glauben, sie sei am richtigen Ort.

   DIE AUSSAGE TRAEGT NUR, WEIL DIE EINHAENGUNG DIE LAGE SPIEGELT. Der Prozess
   sieht den Wirt nicht; er liest seinen eigenen Pfad. Was unter ./ eingehaengt
   wird, gehoert deshalb unter das Anwendungsverzeichnis, was daneben liegen
   soll, daneben -- und genau das steht in der docker-compose.yml daneben
   geschrieben. Wer den Schnitt anders legt, nimmt dieser Anzeige ihre
   Grundlage.

   Aufgeloest wie jeder andere Pfad hier: ein Vergleich zweier Strings
   beantwortet die Frage nicht, sobald ein Symlink im Spiel ist. */
const ANWENDUNG_DIR = (() => {
  try { return fs.realpathSync(__dirname); } catch { return path.resolve(__dirname); }
})();

/* Die Lage wird bei JEDER Anfrage gelesen und nicht beim Start festgehalten:
   wer das Verzeichnis nachtraeglich einhaengt, soll es nicht mit einem
   Neustart bezahlen. Beim Start wird sie einmal ins Protokoll geschrieben. */
function sicherungLage() {
  if (!SICHERUNG_DIR)
    return { ein: false, grund: 'Es ist kein Sicherungsort eingerichtet. ' +
      'Die docker-compose.yml hängt ihn ein und benennt ihn als SICHERUNG_DIR — ' +
      'beides gehört zusammen.' };
  let wurzel;
  try { wurzel = fs.realpathSync(SICHERUNG_DIR); }
  catch { return { ein: false, grund: `Den Sicherungsort ${SICHERUNG_DIR} gibt es nicht. ` +
    'Er wird nicht angelegt — häng ihn auf dem Wirt ein.' }; }
  try { if (!fs.statSync(wurzel).isDirectory())
    return { ein: false, grund: `${SICHERUNG_DIR} ist kein Verzeichnis.` }; }
  catch { return { ein: false, grund: `${SICHERUNG_DIR} ist nicht lesbar.` }; }
  let daten;
  try { daten = fs.realpathSync(DATA_DIR); } catch { daten = path.resolve(DATA_DIR); }
  // EINE SICHERUNG NEBEN DEM ORIGINAL IST KEINE. Beide Richtungen, denn beide
  // sind falsch: der Sicherungsort im Datenverzeichnis und umgekehrt.
  if (liegtIn(wurzel, daten) || liegtIn(daten, wurzel))
    return { ein: false, grund: 'Der Sicherungsort darf nicht im Datenverzeichnis liegen — ' +
      'eine Sicherung neben dem Original ist keine.' };
  return { ein: true, wurzel, imArbeitsverzeichnis: liegtIn(wurzel, ANWENDUNG_DIR) };
}

/* Der eingestellte Ort, geprueft. Liefert entweder { ort, pfad } oder
   { fehler } -- und der Fehler ist eine sprechende Begruendung, kein
   "ungueltig". */
function pruefeOrt(roh) {
  const lage = sicherungLage();
  if (!lage.ein) return { fehler: lage.grund };
  const s = String(roh == null ? '' : roh).trim();
  if (!s) return { ort: '', pfad: lage.wurzel };
  if (s.length > 200) return { fehler: 'Der Ort ist zu lang (höchstens 200 Zeichen).' };
  if (!ORT_MUSTER.test(s))
    return { fehler: 'Der Ort ist ein Unterverzeichnis des eingerichteten Sicherungsorts. ' +
      'Erlaubt sind Buchstaben, Ziffern, Leerzeichen, Punkt, Strich, Unterstrich und ' +
      'Schrägstrich; ein führender Schrägstrich und „..“ sind es nicht.' };
  let echt;
  try { echt = fs.realpathSync(path.resolve(lage.wurzel, s)); }
  catch { return { fehler: `Das Verzeichnis „${s}“ gibt es unter dem Sicherungsort nicht. ` +
    'Es wird nicht angelegt — leg es auf dem Wirt an.' }; }
  try { if (!fs.statSync(echt).isDirectory())
    return { fehler: `„${s}“ ist kein Verzeichnis.` }; }
  catch { return { fehler: `„${s}“ ist nicht lesbar.` }; }
  // DIE PRUEFUNG HAENGT AM AUFGELOESTEN PFAD. Erst hier faellt ein Symlink
  // auf, der aus der Wurzel herausfuehrt -- am String saehe er harmlos aus.
  if (!liegtIn(echt, lage.wurzel))
    return { fehler: `„${s}“ führt aus dem eingerichteten Sicherungsort heraus.` };
  let daten;
  try { daten = fs.realpathSync(DATA_DIR); } catch { daten = path.resolve(DATA_DIR); }
  if (liegtIn(echt, daten))
    return { fehler: 'Der Sicherungsort darf nicht im Datenverzeichnis liegen — ' +
      'eine Sicherung neben dem Original ist keine.' };
  return { ort: s, pfad: echt };
}

/* "Letzte Sicherung vor N Tagen" kommt aus dem DATEISYSTEM, nicht aus einem
   Schluessel in settings. Ein Schluessel waere eine BEHAUPTUNG ueber die
   Datei, das Dateisystem ist die Sache -- dieselbe Frage wie beim Merker
   gegen den Index in 0.6.2, und dort ist sie zugunsten der Sache entschieden
   worden. Der Preis steht daneben: ein unerreichbarer Zielort liefert keine
   Auskunft, und dann sagt die Karte GENAU DAS statt einer Zahl. */
/* ZWEI SCHLUESSEL IM UMLAUF -- seit 0.8.91, und es ist die unangenehmste Falle
   des ganzen Projekts. Wird der Schluessel der Datenbank gewechselt
   (schluessel.js auf dem Wirt), bleiben die Sicherungen, die dann schon
   dastehen, mit dem ALTEN Schluessel verschluesselt. Sie sind nicht kaputt --
   sie brauchen nur einen anderen Schluessel als die laufende Anlage, und wer
   das nicht weiss, haelt sie im Ernstfall fuer defekt.

   Die Marke kommt aus settings und ist HIER ausdruecklich richtig, waehrend
   "letzte Sicherung" aus dem Dateisystem kommt: der Zeitpunkt des Wechsels ist
   ein VORGANG und hinterlaesst keine Datei, an der er abzulesen waere. Die
   Aenderungszeit einer Kopie ist dagegen die Sache selbst. Zwei verschiedene
   Fragen, zwei verschiedene Quellen.

   VERGLICHEN WIRD IN UTC. Die Marke traegt die Schreibweise der Anlage
   ("2026-08-23 19:56:01"), und das Z macht aus ihr einen eindeutigen
   Zeitpunkt -- ohne es lese der Rechner sie als Ortszeit und die Grenze
   verschoebe sich um den Zeitzonenabstand. */
function wechselMarke() {
  const roh = getSetting('schluesselGewechseltAm', null);
  if (!roh) return null;
  const ms = Date.parse(String(roh).replace(' ', 'T') + 'Z');
  return Number.isFinite(ms) ? { am: roh, ms } : null;
}

function letzteSicherung(pfad) {
  const marke = wechselMarke();
  const gewechseltAm = marke ? marke.am : null;
  let namen;
  try { namen = fs.readdirSync(pfad); }
  catch { return { erreichbar: false, letzte: null, zahl: 0, gewechseltAm, veraltet: 0 }; }
  const dateien = [];
  for (const n of namen) {
    if (!SICHERUNG_MUSTER.test(n)) continue;
    try {
      const st = fs.statSync(path.join(pfad, n));
      if (st.isFile()) dateien.push({ name: n, zeit: st.mtimeMs, bytes: st.size });
    } catch { /* eine Datei, die zwischen readdir und stat verschwindet */ }
  }
  // Ohne Wechsel ist KEINE Kopie veraltet -- und nicht etwa jede. Der
  // Unterschied zwischen "es gab keinen Wechsel" und "alle sind veraltet" ist
  // genau der, den diese Zeile haelt.
  const veraltet = marke ? dateien.filter(d => d.zeit < marke.ms).length : 0;
  if (!dateien.length)
    return { erreichbar: true, letzte: null, zahl: 0, gewechseltAm, veraltet: 0 };
  dateien.sort((a, b) => b.zeit - a.zeit);
  const j = dateien[0];
  return { erreichbar: true, zahl: dateien.length, gewechseltAm, veraltet, letzte: {
    datei: j.name, bytes: j.bytes,
    // Dieselbe Schreibweise wie jeder Zeitstempel der Anlage
    // ("2026-08-23 19:56:01", UTC): die Oberflaeche hat genau einen Weg, aus
    // einem Zeitstempel ein Datum zu machen, und der erwartet diese Form.
    am: new Date(j.zeit).toISOString().slice(0, 19).replace('T', ' '),
    tageHer: Math.max(0, Math.floor((Date.now() - j.zeit) / 86400000)),
    // Auch die JUENGSTE Kopie kann aelter sein als der Wechsel -- dann ist
    // ueberhaupt keine brauchbare da, und das ist die schaerfste Lage.
    veraltet: Boolean(marke && j.zeit < marke.ms)
  } };
}

// Lesend, deshalb kein Eintrag in F_ROUTEN -- der Waechter steht trotzdem
// davor, und zwar der des Exports: die Antwort nennt einen Pfad des Wirts.
app.get('/api/sicherung', nurEigentuemer, (req, res) => {
  const lage = sicherungLage();
  const ort = getSetting('sicherungOrt', '');
  let dbBytes = 0;
  // MIT wal_checkpoint, wie bei den Kennzahlen: ohne ihn steht der frisch
  // geschriebene Bestand noch in der WAL, die Datei sieht winzig aus, und die
  // Ansage der Dauer waere zu niedrig. Stolperstein 4 in der Gegenrichtung.
  try { db.pragma('wal_checkpoint(PASSIVE)'); dbBytes = fs.statSync(DB_FILE).size; } catch {}
  // Die erwartete Dauer wird aus der Groesse gerechnet und VORHER genannt:
  // waehrend VACUUM INTO laeuft, steht die Anlage.
  const dauer = Math.max(1, Math.round(dbBytes / 1048576 * SICHERUNG_MS_JE_MB / 1000));
  /* Die Marke steht auch dann in der Antwort, wenn der Zielort nicht erreichbar
     ist: DASS gewechselt wurde, ist eine Aussage ueber die Anlage und haengt
     nicht am Sicherungsort. Nur die ZAHL der veralteten Kopien haengt daran,
     und die ist dann ehrlich null statt geraten. */
  const marke = wechselMarke();
  const gewechseltAm = marke ? marke.am : null;
  if (!lage.ein) return res.json({ eingerichtet: false, grund: lage.grund, ort,
                                   dbBytes, dauerSekunden: dauer, erreichbar: false, letzte: null,
                                   gewechseltAm, veraltet: 0 });
  const ziel = pruefeOrt(ort);
  if (ziel.fehler) return res.json({ eingerichtet: true, wurzel: lage.wurzel, ort,
                                     imArbeitsverzeichnis: lage.imArbeitsverzeichnis,
                                     fehler: ziel.fehler, dbBytes, dauerSekunden: dauer,
                                     erreichbar: false, letzte: null,
                                     gewechseltAm, veraltet: 0 });
  // Die Lage der WURZEL, nicht die des gewaehlten Unterverzeichnisses: sie ist
  // eine Eigenschaft der Einrichtung und aendert sich mit dem Zielort nicht.
  res.json({ eingerichtet: true, wurzel: lage.wurzel, ort, pfad: ziel.pfad,
             imArbeitsverzeichnis: lage.imArbeitsverzeichnis,
             dbBytes, dauerSekunden: dauer, ...letzteSicherung(ziel.pfad) });
});

/* Der Ort ist eine Einstellung der ANLAGE und gehoert damit in settings, nicht
   in user_settings: zwei Leute mit verschiedenen Orten haetten zwei Wahrheiten
   ueber dieselbe Sache.
   EIGENE ROUTE statt PUT /api/settings: die leitet ihre Rechte aus
   PERSOENLICHE_SCHLUESSEL ab -- was nicht persoenlich ist, ist dort Adminsache.
   Der Sicherungsort gehoert aber in dieselbe Zeile wie Export und Import. */
app.put('/api/sicherung/ort', nurEigentuemer, (req, res) => {
  const geprueft = pruefeOrt(req.body?.ort);
  if (geprueft.fehler) return res.status(400).json({ error: geprueft.fehler });
  putSetting.run('sicherungOrt', JSON.stringify(geprueft.ort));
  res.json({ ok: true, ort: geprueft.ort, pfad: geprueft.pfad, ...letzteSicherung(geprueft.pfad) });
});

app.post('/api/sicherung', nurEigentuemer, (req, res) => {
  const lage = sicherungLage();
  if (!lage.ein) return res.status(400).json({ error: lage.grund });
  const ziel = pruefeOrt(getSetting('sicherungOrt', ''));
  if (ziel.fehler) return res.status(400).json({ error: ziel.fehler });
  /* NAME MIT DATUM UND UHRZEIT. Ueberschreiben waere die schlechteste Antwort:
     eine Sicherung, die die vorige frisst, ist keine. VACUUM INTO scheitert an
     einer vorhandenen Zieldatei ohnehin ("output file already exists") --
     nachgestellt statt geglaubt --, aber darauf verlaesst sich der Name nicht. */
  const marke = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const datei = path.join(ziel.pfad, `kriterion-${marke}.sqlite`);
  if (fs.existsSync(datei))
    return res.status(409).json({ error: 'In dieser Sekunde liegt dort schon eine Sicherung.' });
  /* GESCHRIEBEN WIRD UNTER EINEM ARBEITSNAMEN, umbenannt wird erst danach.
     Stolperstein 8 verlangt, eine halbfertige Zieldatei nach einem Fehlschlag
     zu entfernen -- das hier ist eine Stufe schaerfer: der Fall entsteht gar
     nicht. Eine halbfertige Kopie traegt NIE den endgueltigen Namen, faellt
     damit aus SICHERUNG_MUSTER heraus und kann selbst dann nicht als fertige
     Sicherung gelesen werden, wenn das Aufraeumen darunter scheitert.
     ENTFERNT WIRD AUSSCHLIESSLICH DER ARBEITSNAME. Eine vorhandene fremde
     Datei fasst dieser Weg unter keinen Umstaenden an -- ein Aufraeumen, das
     die Datei des Nachbarn wegwirft, waere schlimmer als die halbe Kopie. */
  const werdend = datei + '.wird';
  try { if (fs.existsSync(werdend)) fs.unlinkSync(werdend); } catch {}
  const t0 = Date.now();
  try {
    db.prepare('VACUUM INTO ?').run(werdend);
    fs.renameSync(werdend, datei);
  } catch (e) {
    try { if (fs.existsSync(werdend)) fs.unlinkSync(werdend); } catch {}
    console.error('[Kriterion] Sicherung gescheitert:', e.message);
    // Fester Text wie ueberall bei einem Fehler DES SERVERS: ein SQL-Fehler
    // nennt Pfade und Tabellen, und die gehoeren ins Protokoll, nicht in die
    // Antwort.
    return res.status(500).json({ error: 'Die Sicherung ist gescheitert. ' +
      'Die Einzelheiten stehen im Protokoll des Containers.' });
  }
  const ms = Date.now() - t0;
  let bytes = 0;
  try { bytes = fs.statSync(datei).size; } catch {}
  console.log(`[Kriterion] Sicherung geschrieben: ${path.basename(datei)} ` +
    `(${bytes} Bytes, ${ms} ms).`);
  // Eine vollstaendige Kopie, die das Haus verlaesst -- dieselbe Zeile wie der
  // Export. Der Pfad steht NICHT in der Zeile: das Protokoll haelt Vorgaenge
  // fest, keine Orte auf dem Wirt.
  auth.protokolliere('sicherung', { wer: req.benutzer.id });
  res.json({ ok: true, datei: path.basename(datei), pfad: ziel.pfad, bytes, ms,
             ...letzteSicherung(ziel.pfad) });
});

// Einmal beim Start ins Protokoll -- wer den Ort falsch stehen hat, sieht es
// hier und nicht erst am Knopf.
{
  const lage = sicherungLage();
  console.log('[Kriterion] Sicherungsort: ' + (lage.ein ? lage.wurzel : `aus — ${lage.grund}`));
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

/* Der letzte Fehler-Handler. Zwei Regeln:

   Ein Fehler, den der Server ABSICHTLICH wirft, traegt eine Markierung
   (err.status) und behaelt damit seinen Rang und seine Meldung. Multer-Fehler
   -- "Datei zu gross", "zu viele Dateien" -- sind ebenfalls echte 400 und
   behalten ihre Meldung.

   Alles Uebrige ist ein Fehler DES SERVERS und wird 500 mit festem Text: ein
   SQL-Fehler nennt Tabellen und Spalten, ein sharp-Absturz den Pfad. Was
   nicht angezeigt werden soll, wird auch nicht geliefert; die Einzelheiten
   stehen im Protokoll, und dort gehoeren sie hin.

   400 fuer alles war irrefuehrend: "du hast falsch gefragt" ist etwas anderes
   als "bei mir ist etwas kaputt", und der Unterschied faellt beim Suchen an. */
app.use((err, req, res, next) => {
  console.error(err);
  const rang = err.status || err.statusCode || (err instanceof multer.MulterError ? 400 : 500);
  if (rang >= 500) return res.status(500).json({ error: 'Im Server ist etwas schiefgegangen.' });
  res.status(rang).json({ error: err.message || 'Unbekannter Fehler' });
});

/* ================= Start ================= */
/* AUSDRUECKLICH NUR BILDER. Eine Videozeile traegt in data die Videodatei --
   sharp liefe darauf in einen Fehler, beide Varianten kaemen leer zurueck und
   das vorhandene Standbild waere ueberschrieben. Die Zeile bliebe ausserdem
   bei jedem Start aufs Neue faellig. Und der Kernsatz gilt auch hier: der
   Server oeffnet nie ein Video. Das Standbild kommt vom Browser. */
async function backfillVariants() {
  const pending = db.prepare(
    "SELECT id FROM photos WHERE (thumb IS NULL OR medium IS NULL) AND art != 'video'").all();
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

/* ---- Versions-Fingerprint ---- */
// Die Versionsnummer kommt aus der package.json und sagt NICHTS ueber die
// uebrigen Dateien: wurden package.json und server.js ersetzt, public/app.js
// aber nicht, zeigt die Fusszeile die neue Version, waehrend die Oberflaeche
// sich alt verhaelt. Der Fingerprint ist die Aussage, die die Versionsnummer nicht
// machen kann -- er aendert sich, sobald IRGENDEINE der beteiligten Dateien
// anders ist. Ein halb eingespielter Dateisatz zeigt damit einen Fingerprint, der
// zu keiner Version gehoert.
//
// DIE LISTE WIRD ABGELEITET, NICHT GEPFLEGT, und zwar aus dem, was der Server
// wirklich tut: alles unter public/ liefert express.static aus, alles in
// require.cache unterhalb dieses Verzeichnisses fuehrt er aus. Eine zweite,
// gepflegte Liste hiesse zwei Wahrheiten ueber dieselbe Sache und liefe
// frueher oder spaeter auseinander.
//
// Damit kann die Falle gar nicht erst entstehen: pruefung.js und Doku/ liegen
// im Repo, aber NICHT im Image (.dockerignore). Ein Fingerprint, der sie
// mitzaehlte, waere im Container ein anderer als auf der Platte und damit
// wertlos. Der Server laedt sie nicht und liefert sie nicht aus -- sie koennen
// also nicht hineingeraten, ohne dass jemand sie ausdruecklich hereinholt.
//
// DIE GRENZE, DIE DARAUS FOLGT, IST ABSICHT: zugang.js liegt im Image, wird
// aber nur von Hand aufgerufen und nie vom Server geladen. Es steht deshalb
// nicht im Fingerprint. Der Fingerprint sagt, WELCHER SERVER LAEUFT, nicht welches
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

function bildeFingerprint() {
  const ausgefuehrt = Object.keys(require.cache).filter(f =>
    f.startsWith(__dirname + path.sep) && !f.split(path.sep).includes('node_modules'));
  const liste = [...new Set([...ausgefuehrt, ...dateienUnter(path.join(__dirname, 'public'))])]
    .map(f => path.relative(__dirname, f).split(path.sep).join('/'))
    .sort();
  const h = crypto.createHash('sha256');
  for (const rel of liste) {
    // Der NAME gehoert mit hinein, sonst bliebe der Fingerprint gleich, wenn zwei
    // Dateien ihre Inhalte tauschen oder eine umbenannt wird. Das Nullzeichen
    // trennt, damit sich Name und Inhalt nicht ineinanderschieben koennen.
    h.update(rel); h.update('\0');
    h.update(fs.readFileSync(path.join(__dirname, rel))); h.update('\0');
  }
  return h.digest('hex').slice(0, 8);
}

// Beim Start, nach allen require-Aufrufen: erst dann ist require.cache
// vollstaendig. Alle Module dieses Projekts werden am Dateianfang geladen; ein
// require INNERHALB einer Funktion machte diesen Fingerprint unvollstaendig, und
// der Pruefstand haelt genau das fest.
const FINGERPRINT = bildeFingerprint();

/* Sauberes Herunterfahren. Ohne das beendet "docker compose down" den Prozess
   hart: die WAL-Datei bleibt liegen, und wer in genau diesem Augenblick das
   Datenverzeichnis sichert, sichert einen Zustand mit offener WAL. Fuer SQLite
   ist das ungefaehrlich, fuer eine Sicherung nicht.
   Der Abschluss darf nichts werfen -- wer beendet, ist nicht mehr zu retten. */
for (const zeichen of ['SIGTERM', 'SIGINT']) {
  process.on(zeichen, () => {
    try { db.pragma('wal_checkpoint(TRUNCATE)'); db.close(); } catch {}
    process.exit(0);
  });
}

app.listen(PORT, () => {
  // holeBenutzer() ist hier RICHTIG: beim Start gibt es keine Anfrage und
  // damit keinen angemeldeten Benutzer. Gemeint ist der Eigentuemer, und so
  // steht es auch in der Zeile.
  const u = auth.holeBenutzer();
  console.log(`[Kriterion] Läuft auf Port ${PORT} — ` +
    (u ? `Eigentümer: ${u.username}` : 'noch kein Zugang, Einrichtung im Browser'));
  // Die Betriebsart gehoert ins Protokoll: an ihr haengen der gelesene Kopf,
  // das Secure am Cookie, HSTS und der Name des Cookies. Wer sie falsch stehen
  // hat, sieht es hier und nicht erst an einer wirkungslosen Anmeldebremse.
  console.log(`[Kriterion] Hinter Proxy: ${auth.HINTER_PROXY ? 'an' : 'aus'} — ` +
    (auth.HINTER_PROXY
      ? 'X-Forwarded-For wird gelesen, Cookie mit Secure und __Host-'
      : 'X-Forwarded-For wird nicht gelesen'));
  /* Die oeffentliche Adresse gehoert ins Protokoll: an ihr haengt, welchen
     Link ein Empfaenger bekommt. Wer sie falsch stehen hat, sieht es hier und
     nicht erst am toten Link beim Empfaenger. */
  if (OEFFENTLICHE.fehler) {
    console.warn(`[Kriterion] OEFFENTLICHE_ADRESSE ist unbrauchbar: ${OEFFENTLICHE.fehler} ` +
      'Die Anlage laeuft weiter; den Einladungslink baut wie bisher der Browser des Admins.');
  } else if (OEFFENTLICHE.adresse) {
    console.log(`[Kriterion] Oeffentliche Adresse: ${OEFFENTLICHE.adresse} — ` +
      'Einladungslinks werden damit gebaut.');
    if (auth.HINTER_PROXY && OEFFENTLICHE.adresse.startsWith('http://')) {
      // Widerspruch, aber kein Verlust: ein falscher Link ist ein toter Link.
      // Eine Absage waere hier haerter als der Schaden.
      console.warn('[Kriterion] Hinter einem Proxy und trotzdem http:// in ' +
        'OEFFENTLICHE_ADRESSE — der Cookie traegt Secure, ueber http kommt niemand herein.');
    }
  } else {
    console.log('[Kriterion] Oeffentliche Adresse: nicht gesetzt — ' +
      'den Einladungslink baut der Browser des Admins.');
  }
  /* Der Mailversand gehoert ins Protokoll, und zwar in derselben Form wie die
     Adresse darueber: wer ihn eingerichtet glaubt und es nicht ist, sieht es
     hier -- und nicht erst, wenn jemand auf eine Einladung wartet.
     DAS PASSWORT STEHT HIER NICHT, auch nicht seine Laenge und nicht sein
     letztes Zeichen. Die Zeile nennt Anbieter, Server und Absender; das genuegt
     zum Nachsehen, ob der richtige Zugang geladen ist. Der Merksatz zu
     Kontrollausgaben gilt hier in seiner schaerfsten Auslegung, wie beim
     Schluesselwechsel: ein Geheimnis, das einmal im Containerprotokoll steht,
     steht dort, bis es jemand loescht. */
  {
    const roh = getSetting(mail.SCHLUESSEL, null);
    const z = mail.zustand(roh);
    if (mail.eingerichtet(roh)) {
      console.log(`[Kriterion] Mailversand: ${z.anbieterName} über ${z.server}:${z.port} ` +
        `(${z.sicher ? 'TLS' : 'STARTTLS'}), Absender ${z.absender}.` +
        (OEFFENTLICHE.adresse ? '' : ' Ohne OEFFENTLICHE_ADRESSE wird trotzdem nicht verschickt.'));
    } else {
      console.log('[Kriterion] Mailversand: nicht eingerichtet — Einladungs- und ' +
        'Ruecksetzlinks stehen wie bisher im Verwaltungsbereich zum Kopieren.');
    }
  }
  setTimeout(() => backfillVariants().then(maintainStorage).catch(e => console.error(e)), 1500);
});
