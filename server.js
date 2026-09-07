const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { Worker } = require('worker_threads');
const anh = require('./attachments');
// Eine Quelle fuer die Versionsnummer: die package.json. Die fuehrende Null
// sagt, dass sich noch alles aendern darf; die Veroeffentlichung bekaeme 1.0.0.
const VERSION = require('./package.json').version;
const sharp = require('sharp');
/* WIE VIELE THREADS libvips SICH NEHMEN DARF -- ausdruecklich gesetzt und
   nicht der Vorgabe ueberlassen.

   UND DIE EHRLICHKEIT GEHOERT DAZU: auf der Installation, die den Befund
   gemeldet hat, AENDERT DIESE ZEILE NICHTS -- dort steht die Vorgabe schon auf
   1. Sie steht hier, weil sharp seine Vorgabe VOM IMAGE ABHAENGIG macht:
   unter glibc ohne jemalloc ist sie 1, unter musl oder mit jemalloc kann sie
   die Kernzahl sein. Wer Kriterion auf einer fremden Maschine betreibt,
   bekommt sonst einen Wartungslauf, der sich die ganze Maschine nimmt.
   Eine Zeile, der man eine Wirkung zuschreibt, die sie im gemessenen Fall
   nicht hat, waere eine Unwahrheit -- deshalb steht die Einschraenkung hier
   und ebenso in den Papieren.

   UND os.cpus() IST IM CONTAINER NICHT DIE WAHRHEIT UEBER DAS KONTINGENT
   (Stolperstein 278): es meldet die Kerne des WIRTS, nicht das, was dem
   Container zugeteilt ist. Wer den Container auf eine CPU begrenzt, bekommt
   trotzdem die halbe Kernzahl des Wirts. Ob daraus mehr wird -- das Lesen der
   cgroup-Grenze --, ist eine Frage fuer 0.19.2 und nicht fuer diese Runde. */
sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));
/* DIE BILDABLEITUNGEN STEHEN SEIT 0.19.3 IN images.js und nicht mehr hier.
   Der Grund ist nicht Ordnung, sondern EINE Wahrheit ueber die Ablage: der
   Bestandslauf faehrt seit dieser Runde in einem eigenen Thread und braucht
   dieselbe Umwandlung wie der Anfrageweg (Stolperstein 47). Gerufen wird
   dasselbe wie vorher, nur aus einer Datei daneben. */
/* `isPng` STEHT HIER NICHT MEHR: die einzige Stelle, die es im Server rief,
   war die Schleife des Bestandslaufs -- und die faehrt seit dieser Runde im
   Thread. Ein Import, den niemand ruft, ist eine Zeile, die beim naechsten
   Lesen erklaert werden muss. Der KOMMENTAR ueber qOpenPng nennt es
   weiterhin, und das ist richtig: die Byte-Folge dort ist dieselbe. */
const { makeVariants, PNG_MAGIC_HEX, storeImage } = require('./images');
const { db, DATA_DIR, DB_FILE, keyFromEnv, keyHex, renumberCriteria, verfahren } = require('./db');
const auth = require('./auth');
const mail = require('./mail');

/* ================= Die Sprachdateien ================= */
/* TEXT IST DATEN UND NICHT PROGRAMM -- 0.24.0, Bauabschnitt 1. Der Server
   liest beim Start ALLE Dateien unter public/languages/ in den Speicher; der
   Browser holt sich die eine, die er braucht, ueber express.static. Eine
   Wahrheit, zwei Leser (Konzept 3.3).

   FEHLT de.json, STARTET DER SERVER NICHT. Eine Installation ohne Sprache ist
   keine: jede Message stuende als ⟦…⟧ da, und das faellt beim ersten Fehler
   auf und nicht beim Start. Lieber gleich.

   IM SPEICHER UND NICHT JE ANFRAGE VON DER PLATTE: die Datei aendert sich zur
   Laufzeit nicht, und wer sie tauscht, tauscht damit den Fingerprint -- also
   den Server. */
const LANGUAGE_DIR = path.join(__dirname, 'public', 'languages');
function readLanguages() {
  const out2 = {};
  for (const name of fs.readdirSync(LANGUAGE_DIR).sort()) {
    if (!name.endsWith('.json')) continue;
    out2[name.slice(0, -'.json'.length)] =
      JSON.parse(fs.readFileSync(path.join(LANGUAGE_DIR, name), 'utf8'));
  }
  if (!out2.de) throw new Error(
    'public/languages/de.json fehlt -- ohne sie hat die Oberflaeche keine Texte.');
  return out2;
}
const LANGUAGES = readLanguages();
const LANGUAGE_DEFAULT = 'de';
// Eine Mehrzahlregel je Sprache, einmal gebaut. Sie kommt aus der Locale IM
// KOPF DER DATEI und nicht aus dem Dateinamen: welche Locale eine Sprache
// hat, entscheidet die Datei (Konzept 6).
const LANGUAGE_PLURAL = Object.fromEntries(Object.entries(LANGUAGES)
  .map(([code, texts]) => [code, new Intl.PluralRules(texts._locale)]));
// Und dieselbe Locale fuer Zahlen und Daten -- aus derselben einen Quelle.
const localeTag = (locale) =>
  (LANGUAGES[locale] || LANGUAGES[LANGUAGE_DEFAULT])._locale;

/* WELCHE SPRACHE EINE ANTWORT TRAEGT. In dieser Runde immer Deutsch -- die
   Funktion steht trotzdem schon da, damit Stufe 2 nur ihre drei Quellen
   einhaengt (Benutzerschluessel, Accept-Language aus api(), Vorgabe der
   Installation) und keine 125 Aufrufstellen anfassen muss. */
function localeOf(req) {
  return LANGUAGE_DEFAULT;
}

/* DER HELFER -- dieselbe Regel wie im Browser, mit der Sprache davor.
   MASKIERT WIRD HIER NICHTS: eine Servermeldung geht als JSON heraus, und die
   Oberflaeche entscheidet, wie sie sie zeigt. */
function t(locale, schluessel, values = {}) {
  const texts = LANGUAGES[locale] || LANGUAGES[LANGUAGE_DEFAULT];
  const roh = texts[schluessel] !== undefined
    ? texts[schluessel] : LANGUAGES[LANGUAGE_DEFAULT][schluessel];
  if (roh === undefined) return `\u27e6${schluessel}\u27e7`;
  const rule = LANGUAGE_PLURAL[locale] || LANGUAGE_PLURAL[LANGUAGE_DEFAULT];
  const record = typeof roh === 'object'
    ? (rule.select(values.n) === 'one' ? roh.eins : roh.andere) : roh;
  /* DAS VOKABULAR WIRD ERST GEHOLT, WENN EIN PLATZHALTER ES BRAUCHT -- es
     kommt aus der Datenbank, und die meisten Meldungen tragen kein
     Vokabelwort. Einmal je Message, nicht einmal je Platzhalter. */
  let vocab = null;
  return String(record).replace(/\{(\w+)\}/g, (whole, name) => {
    if (values[name] !== undefined) return String(values[name]);
    if (vocab === null) vocab = vokabular();
    return vocab[name] !== undefined ? String(vocab[name]) : whole;
  });
}

/* EINE MELDUNG IST EIN SCHLUESSEL UND KEIN SATZ -- 0.24.0, Bauabschnitt 1.
   Wer sie wirft, weiss noch nicht, in welcher Sprache sie gelesen wird; das
   weiss erst der Fehler-Handler, der die Anfrage in der Hand hat.
   SIE WOHNT IN auth.js UND NICHT HIER, obwohl sie hier uebersetzt wird: die
   meisten Werfer stehen dort, und server.js requiret auth.js -- der Weg
   zurueck waere ein Ring. Eine eigene Datei dafuer verbietet der Auftrag, und
   sie waere fuer sechs Zeilen auch zu viel. */
const Message = auth.Message;

/* mail.js BEKOMMT DEN UEBERSETZER GEREICHT -- 0.24.0, Bauabschnitt 2. Es ist
   ein Blatt im Abhaengigkeitsbaum und darf server.js nicht requiren; die vier
   Briefe und seine Absagen brauchen t() trotzdem. Ein Griff beim Start, und
   beide Seiten lesen dieselbe Datei. */
mail.setTranslator(t);
/* UND auth.js EBENSO -- fuer die zwei Antworten, die requireAuth() selbst gibt.
   Es bekommt die ANFRAGE gereicht und nicht die Sprache: welche Sprache eine
   Antwort traegt, entscheidet diese Datei. */
auth.setTranslator((req, schluessel, values) => t(localeOf(req), schluessel, values));

/* WAS EIN GEFANGENER FEHLER SAGT -- 0.24.0, Bauabschnitt 2. Fuenfzehn Stellen
   fingen bis dahin einen Fehler und gaben `e.message` heraus; darin stand ein
   deutscher Satz aus auth.js oder mail.js.
   GEFRAGT WIRD NACH `schluessel` UND NICHT NACH DER KLASSE: auth.js wirft die
   Klasse `Message`, mail.js baut sich dieselbe Form mit zwei Zeilen selbst --
   es ist ein Blatt im Abhaengigkeitsbaum und darf auth.js nicht requiren, sonst
   entstuende ein Ring. Was zaehlt, ist die FORM und nicht die Herkunft.
   ALLES OHNE SCHLUESSEL IST EIN PROGRAMMIERFEHLER OHNE BILDSCHIRM und geht als
   der eine unbestimmte Satz heraus -- der Rumpf steht auf der Konsole, wo der
   Betreiber ihn liest. */
const errorText = (req, e) => (e && e.key)
  ? t(localeOf(req), e.key, e.values || {})
  : t(localeOf(req), 'server.errorUnknown');

const PORT = process.env.PORT || 3000;

/* ---- Die oeffentliche Adresse ----
   OHNE SIE BAUT DER BROWSER DES ADMINS DEN EINLADUNGSLINK aus location. Das
   ist die Vorgabe und braucht keine Einstellung; es hat genau eine
   Bruchstelle -- die Adresse, unter der der Admin zugreift, ist nicht immer
   die, die der Empfaenger benutzen soll.

   SIE GEHOERT IN DIE .env UND NICHT IN settings, dieselbe Linie wie
   BEHIND_PROXY: Netzwerkvertrauen, nicht Vorliebe. Ein Admin kommt nicht an
   einen anderen Admin -- duerfte er die oeffentliche Adresse setzen, zeigte
   jede verschickte Ruecksetzmail auf seinen Server. Der Systembereich ZEIGT
   sie deshalb, er setzt sie nicht.

   AUS DEM HOST-KOPF WIRD NICHTS ABGELEITET: ueber einen gefaelschten Kopf
   liesse sich ein Link sonst auf einen fremden Server umbiegen.

   Zur Form (was ? und # angeht, und warum ein unbrauchbarer Wert den Start
   nicht abbricht) siehe auth.js, wo der Wert gelesen wird. */
const PUBLIC = auth.PUBLIC_ADDRESS;

/* Was die Antwort ueber den Link sagt. IST DIE EINSTELLUNG LEER, GIBT DER
   SERVER KEINEN LINK HERAUS -- der Browser baut ihn selbst, und die
   Oberflaeche sagt daneben, woher die Adresse kam. Zwei Felder statt eines:
   aus einer Abwesenheit eine Aussage zu machen waere die zweite Wahrheit. */
const linkInfo = (plain) => PUBLIC.adresse
  ? { link: `${PUBLIC.adresse}/#/invite/${plain}`, linkQuelle: 'einstellung' }
  : { link: null, linkQuelle: 'browser' };

/* ---- Der Versand eines Tokenlinks ----
   DER TOKEN ENTSTEHT ZUERST, DIE ANTWORT TRAEGT DEN LINK IMMER, UND DER
   VERSAND IST EIN FELD DARIN -- die bauliche Form des Satzes "E-Mail ist eine
   Bequemlichkeit, keine Voraussetzung". Schlaegt der Versand fehl, bricht
   nichts ab: der Admin sieht "Versand fehlgeschlagen" und daneben den Link.

   DREI WERTE, und mehr gibt es nicht:
     'ok'              die Mail ist beim Server des Anbieters angenommen
     'fehlgeschlagen'  es wurde versucht und ging schief
     'aus'             es wurde gar nicht erst versucht
   DER GRUND STEHT DANEBEN, weil 'aus' drei Lagen deckt -- kein Mailzugang,
   keine oeffentliche Adresse, keine Adresse am Zugang. Ohne ihn saehe der
   Admin, DASS nichts hinausging, und nicht, was er tun soll.

   DIE OEFFENTLICHE ADRESSE IST PFLICHT FUER DEN VERSAND UND NICHT FUER DEN
   START: ein Startabbruch braeche jede vorhandene Installation. Ohne sie wird
   nicht verschickt, die Karte sagt warum, und der Browser des Admins baut den
   Link beim Kopieren weiter selbst. */
async function sendTokenLink(ziel, token) {
  const zugang = mail.resolve(getSetting(mail.SETTING_KEY, null));
  if (!mail.configured(zugang))
    return { versand: 'aus', versandGrund: 'Es ist kein Mailzugang eingerichtet.' };
  if (!PUBLIC.adresse)
    return { versand: 'aus', versandGrund:
      'Ohne PUBLIC_ADDRESS in der .env wird nicht verschickt — der Server wüsste nicht, worauf der Link zeigen soll.' };
  if (!ziel.email)
    return { versand: 'aus', versandGrund: 'Für diesen Zugang ist keine E-Mail-Adresse hinterlegt.' };
  const values2 = {
    titel: getSetting('title_public', 'Bewertungskatalog'),
    username: ziel.username, link: `${PUBLIC.adresse}/#/invite/${token.plain}`,
    tage: auth.TOKEN_DAYS, minuten: auth.TOKEN_DEADLINE_MINUTES
  };
  const invite = token.zweck === 'einladung';
  /* DIE SPRACHE DES EMPFAENGERS -- in dieser Runde immer die der Installation.
     localeOf() steht schon da (Bauabschnitt 1); Stufe 2 haengt hier die
     Sprache des Zugangs ein, und diese Zeile bleibt, wie sie ist. */
  const locale = LANGUAGE_DEFAULT;
  const letter = invite ? mail.mailInvite(locale, values2)
                          : mail.mailReset(locale, values2);
  const e = await mail.send(locale, zugang, ziel.email, letter.subject, letter.text);
  return e.ok ? { versand: 'ok', versandGrund: '' }
              : { versand: 'fehlgeschlagen', versandGrund: e.grund };
}

/* ---- Der Beleg der letzten Testmail --------------------------------------
   SIE BELEGT "mit DIESEN Werten ist einmal wirklich eine Mail hinausgegangen"
   und haengt am HASH UEBER DEN ZUGANG: aendert sich etwas daran, passt die
   Marke nicht mehr. Eine Funktion und zwei Rufer, nicht zwei Rechnungen
   (Stolperstein 145). */
const MAILTEST_KEY = 'mailtestOk';
function mailtestState(roh) {
  const test = getSetting(MAILTEST_KEY, null);
  return test && test.mark && test.mark === mail.mark(roh) ? test : null;
}

/* ---- Kann diese Instanz ueberhaupt verschicken --------------------------
   DREI VORAUSSETZUNGEN, UND ALLE DREI SIND NOETIG. Die Testmarke allein
   traegt nicht: DIE TESTMAIL ENTHAELT KEINEN LINK und geht auch ohne
   PUBLIC_ADDRESS durch -- die Marke waere gruen, und die
   Bestaetigungsmail ginge nie hinaus. Der Grund steht daneben. */
function versandBereit() {
  const roh = getSetting(mail.SETTING_KEY, null);
  if (!mail.configured(roh))
    return { ok: false, grund: 'Es ist kein Mailzugang eingerichtet. Das macht der Eigentümer dieser Installation.' };
  if (!mailtestState(roh))
    return { ok: false, grund: 'Seit der letzten Änderung am Mailzugang ist keine Testmail durchgekommen. ' +
      'Der Eigentümer dieser Installation drückt sie in der Karte „Mailversand“.' };
  if (!PUBLIC.adresse)
    return { ok: false, grund:
      'Ohne PUBLIC_ADDRESS in der .env wird nicht verschickt — der Server wüsste nicht, worauf der Link zeigen soll.' };
  return { ok: true, grund: '' };
}

/* ---- Die Bestaetigungsmail der Selbstanmeldung -------------------------
   DER DRITTE MAILANLASS. Sie traegt einen Link OHNE Passwortkraft: wer ihn
   anklickt, sagt nur "ja, das bin ich".

   SIE WIRD GERUFEN, NACHDEM DIE ANTWORT SCHON GESCHRIEBEN IST -- Bedingung
   fuer die immer gleiche Antwort. Ein Weg, der eine Mail verschickt, dauert
   Sekunden; einer, der still verwirft, Millisekunden, und aus dem Unterschied
   liesse sich ablesen, welcher gelaufen ist. Der Pruefstand haelt beide Wege
   am troepfelnden Empfaenger gegeneinander.

   DER SCHLUESSEL STEHT IM FRAGMENT (#/confirm/…) und geht nie an den
   Server: ein Vorschaudienst, der Links im Postfach vorab abruft, holt nur
   die Seite und bestaetigt damit gerade NICHT. */
async function sendConfirm(name, adresse, plain) {
  const zugang = mail.resolve(getSetting(mail.SETTING_KEY, null));
  if (!mail.configured(zugang) || !PUBLIC.adresse) return { ok: false, grund: 'aus' };
  const titel = getSetting('title_public', 'Bewertungskatalog');
  const locale = LANGUAGE_DEFAULT;
  const letter = mail.mailConfirm(locale, { titel, username: name,
    link: `${PUBLIC.adresse}/#/confirm/${plain}`,
    stunden: auth.REQUEST_HOURS });
  return mail.send(locale, zugang, adresse, letter.subject, letter.text);
}

const app = express();
app.use(express.json({ limit: '2mb' }));
/* Gilt fuer die ganze Anwendung.
   nosniff: der Browser darf den Typ nie selbst erraten.
   Die Sicherheitsregel ist die zweite Verteidigung hinter der Ableitung des
   Typs am Fotoweg -- zwei Schichten fuer denselben Fehler.

   'unsafe-inline' bei style-src ist NOETIG und keine Nachlaessigkeit: die
   Oberflaeche setzt Randabstaende, Rasterspalten und den Fokuspunkt als
   style="..."-Attribut, und ohne die Freigabe verwirft der Browser jedes
   davon. script-src bleibt streng -- dort liegt die Wirkung.
   frame-src 'self' traegt die PDF-Vorschau.

   media-src TRAEGT DIE VIDEOS, und beide Angaben sind noetig: 'self' fuer das
   Abspielen, blob: fuer das Standbild VOR dem Hochladen (die Oberflaeche
   haengt die gewaehlte Datei als blob: an ein <video>). Eine blob:-Adresse an
   einem <video> faellt unter media-src, nicht unter img-src -- ohne die
   Freigabe verwirft der Browser sie WORTLOS.

   Strict-Transport-Security NUR AUF DEM HTTPS-WEG, und das ist seit 0.13.0
   eine Frage an die ANFRAGE und nicht mehr an die Einstellung: der Kopf sagt
   dem Browser "diesen Rechnernamen kuenftig nur noch ueber HTTPS". Ginge er
   auch auf dem Heimnetzweg mit, sperrte er genau den Weg aus, den diese Runde
   offenhaelt -- der Browser bestuende danach auf HTTPS und faende an Port 3100
   keines. DIE STELLE IST DIESE EINE, und sie liegt vor express.static: der
   Kopf gehoert an jede Antwort, auch an die der Oberflaeche. */
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
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  // Erste, grobe Schranke am gemeldeten Typ. Sie haelt nichts auf, was sich
  // umbenennen laesst -- die tragende Pruefung ist gridImage() weiter unten,
  // und die sieht das Ergebnis statt die Angabe.
  fileFilter: (req, file, cb) =>
    /^image\//.test(file.mimetype)
      ? cb(null, true)
      : cb(new Message('server.imagesOnly'))
});

/* Was als Foto hereinkommt, muss ein Rasterbild sein -- dem INHALT nach.
   sharp liest auch SVG anstandslos: der Upload saehe normal aus, und die
   Datei laege danach als Skripttraeger in der Datenbank. svg fehlt in der
   Liste mit Absicht. */
const GRID_FORMATS = ['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff'];
async function gridImage(buf) {
  try {
    const m = await sharp(buf).metadata();
    return GRID_FORMATS.includes(m.format);
  } catch { return false; }
}

const touch = db.prepare(`UPDATE items SET updated_at = datetime('now') WHERE id = ?`);
/* "bearbeitet" am Kommentar. EINE Stelle fuer beide Bildwege -- anhaengen
   und entfernen sind dieselbe Aussage ueber denselben Menschen.
   updated_at ist eine Aussage UEBER DEN VERFASSER: nur er loest es aus. Der
   Eingriff eines Admins setzt es nie, sonst saehe seine Loeschung aus wie
   eine Bearbeitung durch den Verfasser. */
const commentEdited = db.prepare(`UPDATE comments SET updated_at = datetime('now') WHERE id = ?`);
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
  if (PERSONAL_KEYS.includes(k))
    throw new Error(`'${k}' ist persoenlich und gehoert nicht in die globale Tabelle`);
  putSettingS.run(k, v);
} };

/* ---- Persoenliche Einstellungen ---- */
// Die persoenliche Haelfte von settings. Die Liste wird zur Laufzeit von der
// Schranke oben gelesen -- eine Liste, die nur der Pruefstand ansieht, loescht
// der Naechste als unbenutzt weg.
/* ACHT SEIT 0.17.0, vorher neun: `zuletztGesehen` trug die Pille „Neu seit
   ..." und hat mit ihr keinen Rufer mehr. Vorhandene Zeilen in user_settings
   bleiben stehen und werden nicht gelesen -- eine Migration, die persoenliche
   Zeilen loescht, waere teurer als die Zeilen selbst. */
/* NEUN SEIT 0.22.0: `streifen` -- die Mindestgroesse der Kacheln im Bildstreifen,
   persoenlich je Zugang, ein Wert fuer alle Geraete, dieselbe Maschine wie
   `schrift` (E11). */
/* ZEHN SEIT 0.23.0: `thema` -- hell, dunkel oder wie das Geraet. Dieselbe
   Maschine wie die beiden davor, und aus demselben Grund persoenlich: es ist
   eine Aussage ueber die Augen dessen, der hinsieht, und nicht ueber den
   Bestand. Keine neue Route -- die Karte „Darstellung" schickt sie mit. */
const PERSONAL_KEYS = ['filters', 'schrift', 'bloecke', 'linkZeilen', 'zeitleiste', 'suchNamen',
                                'glockeGesehen', 'ansichten', 'streifen', 'thema'];

/* DER DRITTE RANG IN DERSELBEN ROUTE, seit 0.19.0. Bis dahin kannte
   PUT /api/settings zwei Haelften: was in dieser Liste steht, ist persoenlich,
   alles Uebrige ist Adminsache -- abgeleitet, nicht aufgezaehlt. Ein Schluessel,
   der den PLATZBEDARF DER GANZEN INSTANZ bestimmt, gehoert aber in dieselbe
   Rechtezeile wie Export, Sicherung und Schluessel: zum Eigentuemer.
   ALS LISTE UND NICHT ALS `if`, aus demselben Grund wie oben: der zweite
   Schluessel dieser Art steht dann daneben und nicht als zweite Verzweigung.
   DIE ABLEITUNG BLEIBT: was weder hier noch oben steht, ist weiterhin
   Adminsache.
   VIER SEIT 0.20.0, vorher einer. Die drei neuen sind die Aufraeumregel der
   Sicherungen: der Schalter und die beiden Werte. Sie gehen denselben Weg wie
   `bilderUmwandeln` -- eine eigene schreibende Route liesse F_ROUTEN wachsen,
   ohne dass es etwas Neues zu bewachen gaebe, und die Karte steht ohnehin
   hinter `ownerOnly`. Genau dafuer war diese Liste angelegt: "der zweite
   Schluessel dieser Art steht dann daneben und nicht als zweite
   Verzweigung." */
const OWNER_KEYS = ['bilderUmwandeln',
                                'sicherungAufraeumen', 'sicherungBehalten', 'sicherungTage'];

// DIE KLEMME IST DIE EINZIGE SCHICHT: better-sqlite3 bindet ein fehlendes
// Argument STILL als NULL, und `WHERE user_id = NULL` ist in SQL nie wahr.
// Ohne die Klemme lieferte eine vergessene Aufrufstelle wortlos die Vorgaben
// statt zu scheitern.
const getUserSetting = (userId, k, fallback) => {
  if (userId == null)
    throw new Error(`getUserSetting('${k}') ohne Benutzer aufgerufen`);
  const r = db.prepare('SELECT value FROM user_settings WHERE user_id = ? AND key = ?')
    .get(userId, k);
  if (!r) return fallback;
  try { return JSON.parse(r.value); } catch { return r.value; }
};
const putUserSettingS = db.prepare(
  'INSERT INTO user_settings (user_id, key, value) VALUES (?, ?, ?) ' +
  'ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value'
);
// Dieselbe Klemme auch auf dem Schreibweg: ein stilles INSERT mit user_id NULL
// scheiterte zwar am NOT NULL, aber erst in der Datenbank und mit einer
// Message, die nicht sagt, wer den Benutzer vergessen hat.
const putUserSetting = (userId, k, wert) => {
  if (userId == null)
    throw new Error(`putUserSetting('${k}') ohne Benutzer aufgerufen`);
  putUserSettingS.run(userId, k, wert);
};

/* WELCHER SCHLUESSEL AUF DER FORMATZEILE DER KARTE STEHT -- die Zuordnung von
   mime_type auf den Schluessel steht HIER UND NUR HIER. Die Oberflaeche kennt
   nur noch die Schluessel und die Namen dazu (BILDFORMATE in public/app.js);
   zwei Tabellen ueber dieselbe Sache duerfen sich nicht widersprechen
   (Stolperstein 47).
   WAS SIE NICHT KENNT, FAELLT IN 'anderes' -- ein leeres oder unbekanntes
   mime_type ist eine Aussage und keine Zeile weniger.
   KLEINGESCHRIEBEN VERGLICHEN: `IMAGE/PNG` ist derselbe Typ, und die Spalte
   traegt, was der Hochladende gemeldet hat. */
const IMAGE_MIME_FORMAT = {
  'image/png': 'png', 'image/jpeg': 'jpeg', 'image/webp': 'webp', 'image/gif': 'gif'
};
const formatFromMime = (m) => IMAGE_MIME_FORMAT[String(m || '').trim().toLowerCase()] || 'anderes';

/* Der Schalter aus dem Reiter „Datenbank". VORGABE AN -- und „aus" heisst
   wirklich aus: ankommende PNG bleiben dann byte-genau PNG. Das ist die
   Stellung, die dem Verhalten von Immich, Nextcloud und Piwigo entspricht.
   DER SCHALTER IST NIE ENDGUELTIG: in beide Richtungen holt der Knopf
   „Alle PNG nach WebP umstellen" nach, was in der anderen Stellung entstanden
   ist. Genau deshalb ist er billig. */
const bilderUmwandeln = () => getSetting('bilderUmwandeln', true) !== false;

/* ---- Den vorhandenen Bestand nachziehen ----
   DIES WAR ALS WIRTSSKRIPT `images.js` GEPLANT, in der Bauform von usertool.js
   und keytool.js. Es ist ein Knopf geworden, und das ist die bessere Wahl,
   nicht die bequemere:
     * Es ist KEINE einmalige Umstellung, sondern eine Funktion, die bleibt.
       Der Schalter kann ein Jahr aus stehen; eine alte Sicherung bringt PNG
       zurueck (der Import wandelt ausdruecklich nicht um); der Bestand waechst
       wieder. Ein Werkzeug, das man ueber `docker compose exec` aufrufen muss,
       wird in keinem dieser Faelle benutzt.
     * DER SERVER IST DER BESSERE SCHREIBER. Ein Wirtsskript muesste die
       Instanz anhalten -- ein fremder Schreiber auf einer WAL-Datei --; der
       Server schreibt in seiner eigenen Verbindung, Zeile fuer Zeile, im
       laufenden Betrieb.
     * Und es gaebe sonst ZWEI WERKZEUGE FUER EINE SACHE.

   ES GIBT KEINEN RUECKWEG „WebP wieder nach PNG", und das ist entschieden: er
   ginge technisch -- VP8L dekodiert zu genau den Pixeln, die drinstehen --,
   aber er stellte nicht das PNG wieder her, das dagewesen ist, sondern ein
   neues mit denselben Pixeln. Ein Knopf, der „zurueck" verspricht und etwas
   anderes liefert, ist schlechter als keiner. Die Rueckfahrkarte ist die
   Sicherung des Datenverzeichnisses, und der Dialog sagt das. */
/* EINE ABBILDUNG UND NICHT ZWEI VARIABLEN -- 0.19.4. Bis 0.19.3 gab es genau
   einen Lauf, der einen Stand meldete, und der stand in `umstellung`. Seit
   dieser Runde gibt es zwei: die Umstellung auf Knopfdruck und das Nachziehen
   der Geometrie beim Start. WUERDEN BEIDE IN DIESELBE VARIABLE SCHREIBEN,
   saehe die Karte bei jedem Start „Umstellung laeuft — 5 von 1032" und der
   Umstellungsknopf waere tot, obwohl gar keine Umstellung laeuft; POST
   /api/images/convert antwortete mit 409. Ein Stand je Aufgabe ist die
   einzige Form, in der beide gleichzeitig die Wahrheit sagen koennen.
   DER SCHLUESSEL IST DIE AUFGABE, mit der der Thread erzeugt wird -- dieselbe
   Zeichenfolge, die batchrun.js unten in seiner Verzweigung liest. Eine
   zweite Liste der Aufgabennamen liefe auseinander. */
const batchStates = { umstellung: null, geometrie: null };

/* Der Stand fuer /api/stats -- oder null, solange in dieser Laufzeit nie einer
   lief. ER BLEIBT NACH DEM ENDE STEHEN, mit `laeuft: false`: die Karte fragt
   waehrend des Laufs nach, und die letzte Antwort soll sagen koennen, was
   herauskam. Ein Stand, der im Augenblick des Fertigwerdens auf null
   zurueckspringt, liesse die Karte im Ungewissen -- sie saehe nicht den
   Abschluss, sondern nur das Verschwinden. */
const batchState = (aufgabe) =>
  batchStates[aufgabe] && { ...batchStates[aufgabe] };

/* WELCHE ZEILEN UEBERHAUPT IN FRAGE KOMMEN -- am INHALT erkannt, mit derselben
   Byte-Folge wie isPng(). AUSDRUECKLICH OHNE VIDEOS: dort traegt `data` die
   Videodatei.
   HIER DARF `art != 'video'` STEHEN, anders als in /api/stats: diese Abfrage
   laeuft nur auf Knopfdruck, sie liest ohnehin die ersten Bytes jedes Blobs,
   und der Index brächte ihr nichts (gemessen 1424 ms -- das ist der Preis des
   Lesens und nicht der der Spaltenlage). */
const qOpenPng = db.prepare(
  "SELECT id FROM photos WHERE art != 'video' AND hex(substr(data,1,8)) = ?");

/* WELCHE ZEILEN DAS ERNEUERN DER KACHELN ANSIEHT -- 0.19.4, erweitert 0.19.5.
   ALLE ZEILEN, UND NICHT DIE FAELLIGEN. Ob eine Zeile faellig ist, sagt erst
   der Kopf ihres `thumb`, und der steht nicht in der Reichweite von SQL.
   Diese Abfrage waehlt deshalb GROSSZUEGIG aus und ueberlaesst dem Thread die
   eigentliche Frage; was das kostet, steht dort.

   OHNE JEDE BEDINGUNG SEIT 0.19.5, und das ist die Aenderung. Bis 0.19.4
   stand hier `art != 'video'`, weil eine Videozeile in `data` die Videodatei
   traegt und es fuer sie keine Vorlage gab. DIE HAT SIE DOCH: ihr `medium`
   ist die Ableitung ihres Standbilds, und daraus laesst sich die Kachel
   erzeugen (siehe vorlageAus() in batchrun.js). Sie MUSS es sogar -- der
   CSS-Zuschnitt faellt in dieser Runde weg, und eine Videokachel mit
   `zoom > 100` zeigte danach den Mittenschnitt statt des eingestellten
   Ausschnitts. Der Ausschnitteditor ist am Video offen, Schieber
   eingeschlossen; was er einstellt, muss auch zu sehen sein.
   DAMIT FAELLT AUCH DER GRUND WEG, DIE ART UEBERHAUPT ZU FRAGEN. Eine
   Bedingung, die nichts mehr ausschliesst, ist eine Zeile, die beim naechsten
   Lesen erklaert werden muss. Die anderen beiden Abfragen (qOpenPng und das
   Nachruesten) behalten ihr `art != 'video'`: dort GIBT es keine Vorlage --
   umgestellt wird `data`, und das ist am Video die Videodatei.
   UND AUSDRUECKLICH OHNE `thumb IS NOT NULL`, obwohl es die Auswahl genauer
   machte: gemessen 12,9 ms kalt -- der Satz selbst muss dafuer angefasst
   werden, und der Haupt-Thread ist genau das, was 0.19.1 und 0.19.2
   freigeraeumt haben. Eine Zeile ohne `thumb` ueberspringt der Thread von
   selbst; sie ist Sache des Nachruestens, das unmittelbar davor gelaufen
   ist. */
const qTileRows = db.prepare('SELECT id FROM photos');

/* ---- DIE VIER ABFRAGEN DER BESTANDSKARTE ----
   VORBEREITET UND NICHT JE ANFRAGE GEBAUT: sie laufen bei jedem Zeichnen des
   Systembereichs. Die Begruendung ihrer FORM steht an der Aufrufstelle in
   /api/stats, wo die Messung danebensteht.
   `art` KOMMT AUS DEM INDEX idx_photos_art -- deshalb `GROUP BY` ohne weitere
   Spalte und deshalb `IS ?` statt `!= 'video'`. */
const qImageKinds = db.prepare('SELECT art AS a FROM photos GROUP BY 1');
const qPerKind = db.prepare(
  'SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos WHERE art IS ?');
const qPerFormat = db.prepare(`
  WITH x AS MATERIALIZED (
    SELECT mime_type AS m, length(data) AS o FROM photos WHERE art IS ?)
  SELECT m, COUNT(*) AS n, COALESCE(SUM(o),0) AS o FROM x GROUP BY 1`);
/* Die Videozeile traegt neben `data` auch eine Ableitung, und die geht mit in
   die Exportdatei -- dieselbe Rechnung wie in exchangeParts(). */
const qVideoExportBytes = db.prepare(`
  SELECT COALESCE(SUM(length(data) + COALESCE(length(medium), length(thumb), 0)),0) AS n
    FROM photos WHERE art IS ?`);

/* ================= DER BESTANDSLAUF IN EINEM EIGENEN THREAD — 0.19.3 =========

   DIE SCHLEIFEN SELBST STEHEN IN batchrun.js, und die Begruendung mit
   ihren Messungen steht dort im Kopf. Hier steht nur, was der Haupt-Thread
   damit zu tun hat: den Thread erzeugen, seine Meldungen entgegennehmen und
   ihn beim Herunterfahren mitnehmen.

   EIN THREAD JE LAUF, danach beendet. Kein Threadpool, kein Dauerlaeufer: das
   Nachruesten laeuft einmal beim Start, die Umstellung auf Knopfdruck. Die
   19 ms Verbindungsaufbau und die 76 ms fuer sharp fallen dabei einmal an;
   ein Dauerlaeufer hielte dafuer eine zweite Verbindung auf die Datenbank
   offen, solange der Server laeuft.

   DIE LAUFENDEN THREADS STEHEN IN EINER MENGE, und zwar aus genau einem
   Grund: SIGTERM muss sie beenden koennen, BEVOR db.close() die WAL-Datei
   kuerzt. Ein Thread, der in eine Datei schreibt, deren WAL gerade
   verschwindet, ist der eine Fall, den diese Runde neu einbringt.
   EINE MENGE UND KEINE EINZELNE VARIABLE, obwohl im Regelfall hoechstens
   einer laeuft: das Nachruesten faengt 1500 ms nach dem Start an, und wer in
   genau diesem Augenblick den Umstellungsknopf drueckt, hat zwei. Eine
   Variable truege dann nur den zweiten, und der erste schriebe weiter in eine
   Datei, deren WAL gerade gekuerzt wird. Der Stand der Umstellung faengt das
   nicht ab -- er bewacht zwei UMSTELLUNGEN und nicht zwei Laeufe. */
const batchThreads = new Set();

/* DER PFAD STEHT AN EINER STELLE, und das ist keine Ordnungsliebe: der
   Fingerprint liest ihn ein zweites Mal. Ein Modul, das NUR im Thread lebt,
   steht in der `require.cache` des Haupt-Threads nicht -- der Server fuehrt
   es aus, und der abgeleitete Dateisatz saehe es trotzdem nicht. Ein
   Fingerprint, der eine ausgelieferte Datei nicht kennt, ist eine halbe
   Aussage. Beide lesen deshalb DIESE Zeile, und eine Pruefung haelt sie
   gegeneinander. */
const BATCHRUN = path.join(__dirname, 'batchrun.js');

/* EIN FEHLER IM THREAD REISST DEN SERVER NICHT AB -- dieselbe Regel wie
   heute fuer eine einzelne Zeile. Was hier ankommt, ist alles, was die
   Schleife NICHT schon selbst abgefangen hat; der Lauf ist dann zu Ende, der
   Rest des Servers steht.
   `laeuft` FAELLT DABEI AUF false, und nicht der ganze Stand auf null: die
   Karte soll sehen, wie weit er gekommen ist. */
function startBatchThread(task, rows, done) {
  const w = new Worker(BATCHRUN, { workerData: { task, rows } });
  batchThreads.add(w);
  /* DER STAND WIRD ERSETZT UND NICHT FORTGESCHRIEBEN. Der Thread meldet je
     Zeile den GANZEN Stand; eine Zunahme muesste hier aufaddiert werden, und
     dann haengt die Zahl an der Vollstaendigkeit der Meldungsfolge. */
  w.on('message', (m) => { if (m && m.kind === 'status') batchStates[task] = m.status; });
  w.on('error', (e) => {
    if (batchStates[task]) batchStates[task].laeuft = false;
    console.error(`[Kriterion] Bestandslauf (${task}) abgebrochen:`, e.message);
  });
  w.on('exit', () => { batchThreads.delete(w); if (done) done(); });
  return w;
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
  /* registrierung: die Anmeldeseite muss wissen, ob sie das Formular zeigen
     soll. Der Wert sagt nichts ueber Bestand oder Menschen.
     DIE LISTE BLEIBT ABGESCHLOSSEN -- was hier auftaucht, sieht jeder, der
     die Adresse kennt; der Pruefstand nagelt die Namen fest. */
  res.json({
    title: getSetting('title_public', 'Bewertungskatalog'), version: VERSION,
    setupRequired: !auth.userExists(), minPassword: auth.PASSWORD_MIN,
    registrierung: getSetting('registrierung', false) === true
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
  const { user, password } = req.body || {};
  // Gezaehlt wird je IP UND je Name. Die IP sperrt hart, der Name verzoegert
  // nur -- sonst waere die Bremse ein Werkzeug, um einen bekannten Zugang
  // auszusperren. Die Begruendung steht in auth.js.
  const throttle = auth.checkThrottle(ip, user);
  if (throttle.blocked) {
    return res.status(429).json({
      error: t(localeOf(req), 'server.throttled', { sekunden: throttle.retryInSec })});
  }
  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));

  const benutzer = await auth.checkLogin(user, password);
  if (!benutzer) {
    auth.noteFailure(ip, user);
    return res.status(401).json({ error: t(localeOf(req), 'server.loginWrong')});
  }
  /* Erste von zwei Stellen: ein gesperrter Zugang kommt nicht herein.
     ERST HIER, nach der Passwortpruefung: ein gesperrter Zugang soll
     erfahren, dass er gesperrt ist. Vor der Pruefung waere dieselbe Message
     ein Werkzeug zum Durchprobieren von Namen.
     Kein noteFailure -- das Passwort war richtig. */
  if (benutzer.status !== 'aktiv') {
    return res.status(403).json({
      error: t(localeOf(req), benutzer.status === 'geloescht' ? 'server.accountGone' : 'server.accountLocked')});
  }
  /* DER ZWEITE FAKTOR -- UND HIER, NACH DER PASSWORTPRUEFUNG.
     DIE AUSKUNFT "DIESER ZUGANG HAT EINEN ZWEITEN FAKTOR" KOMMT ERST NACH
     RICHTIGEM PASSWORT, und das ist baulich wahr statt beabsichtigt: die
     Zeile steht unterhalb von pruefeAnmeldung. Stuende die Frage weiter oben,
     waere die Anmeldeseite ein Werkzeug zum Durchprobieren von NAMEN --
     "dieser hat einen Faktor" heisst "diesen Namen gibt es".
     KEIN COOKIE: es entsteht keine Sitzung und damit auch keine halbe. Was
     entsteht, ist ein Ausweis im Arbeitsspeicher. */
  /* DER ZAEHLER DER BREMSE WIRD HIER NICHT ZURUECKGESETZT. Stuende
     noteSuccess unmittelbar hinter der Passwortpruefung, holte sich, wer das
     Passwort kennt, vor jedem Rateversuch einen frischen Ausweis -- und
     dieser Ruf loeschte den Zaehler, den der zweite Schritt gerade aufbaut.
     ZURUECKGESETZT WIRD ERST, WENN JEMAND WIRKLICH DRIN IST. */
  if (auth.twoFactorOn(benutzer.id)) {
    return res.json({ zweifaktor: true, ...auth.createLoginTicket(benutzer.id) });
  }
  auth.noteSuccess(ip, user);
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(req, auth.createSession(benutzer.id)));
  res.json({ ok: true });
});

/* DER ZWEITE SCHRITT DER ANMELDUNG.
   DIE ACHTE ROUTE DER ART 'offen' -- im Kopf steht keine Rechtefrage, also
   MUSS die Schranke im Rumpf stehen, und sie heisst Ausweis UND Code: der
   Ausweis allein belegt nur, dass jemand das Passwort kannte.

   DIE BENUTZERNUMMER KOMMT AUS DEM AUSWEIS UND NIE AUS DEM RUMPF. Stuende sie
   dort, waere das richtige Passwort eines Zugangs die Eintrittskarte fuer
   jeden anderen.

   DIE ANMELDEBREMSE GREIFT HIER AUSDRUECKLICH, mit BEIDEN Haelften: es ist
   ein eigener Weg neben POST /api/login, und ohne diese Zeilen liefe er an
   checkThrottle vorbei. Sechs Ziffern sind eine Million -- ungebremst waere
   das kein Faktor, sondern eine Verzoegerung.

   DIE ABSAGE IST DIE EINE aus auth.js und nennt nicht, ob der Code falsch
   oder abgelaufen war. */
app.post('/api/login/second', async (req, res) => {
  const ip = auth.clientIp(req);
  const { ausweis, code } = req.body || {};
  /* DIE BREMSE STEHT GANZ VORN -- dieselbe Reihenfolge wie an
     POST /api/login und POST /api/confirm: ein gesperrter Aufrufer
     bekommt an JEDER Stelle dieselbe 429 und nirgends stattdessen eine
     Auskunft ueber seinen Ausweis.
     UND SIE IST DIE EINZIGE FORM, IN DER SICH DIE ZUSAGE BELEGEN LAESST:
     stuende sie hinter dem Ausweis, waere von aussen nicht mehr zu sehen, ob
     die Sperre hier ueberhaupt gilt -- die 429 kaeme dann immer schon aus
     Schritt 1. Genau daran ist die erste Fassung der Bremsprobe STUMM
     geblieben (Stolperstein 163).
     GEZAEHLT WIRD MIT DER IP-HAELFTE, denn der Name ist vor dem Ausweis nicht
     bekannt. Die HARTE Sperre haengt ohnehin allein an der Adresse. */
  const throttle = auth.checkThrottle(ip, null);
  if (throttle.blocked) {
    return res.status(429).json({
      error: t(localeOf(req), 'server.throttled', { sekunden: throttle.retryInSec })});
  }
  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));
  const id = auth.useLoginTicket(ausweis);
  if (!id) {
    auth.noteFailure(ip, null);
    return res.status(401).json({ error: t(localeOf(req), 'server.sessionExpired')});
  }
  const zugang = auth.getUser2(id);
  const name = zugang ? zugang.username : null;
  /* ZWEITE NACHSCHAU AUF DEN STATUS. Zwischen den beiden Schritten liegen bis
     zu zwei Minuten, und in denen kann ein Admin gesperrt haben. Dieselbe
     Message wie im ersten Schritt -- der Aufrufer hat sein Passwort ja bereits
     belegt und darf deshalb erfahren, woran es liegt. */
  if (!zugang || zugang.status !== 'aktiv') {
    return res.status(403).json({ error: t(localeOf(req), 'server.accountLocked')});
  }
  if (!auth.checkTwoFactor(id, code)) {
    auth.noteFailure(ip, name);
    /* DIESELBE ZEILE WIE BEI EINEM FALSCHEN PASSWORT, und kein eigener Vorgang
       daneben: eine gescheiterte zweite Stufe IST eine gescheiterte Anmeldung.
       Sie steht hier und nicht in auth.checkTwoFactor -- die Funktion
       hat drei Rufer, und an den beiden anderen ist das Scheitern keine
       Anmeldung. */
    auth.log('anmeldung.fehl', { wer: null, ziel: id });
    /* EIN FRISCHER AUSWEIS LIEGT DER ABSAGE BEI. Der alte ist verbraucht --
       "genau einmal" bleibt woertlich wahr. Ohne den neuen stuende ein Mensch
       nach EINEM Tippfehler wieder vor dem Passwortfeld.
       WAS DEN VERSUCH BEGRENZT, IST DIE BREMSE UND NICHT DIE FRIST: wer raet,
       tippt das Passwort eben noch einmal. */
    return res.status(401).json({
      error: t(localeOf(req), auth.TWO_FACTOR_DENIAL), ...auth.createLoginTicket(id)});
  }
  auth.noteSuccess(ip, name);
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(req, auth.createSession(id)));
  res.json({ ok: true });
});

/* ABGEMELDET WIRD DER BROWSER UND NICHT DIE VERBINDUNGSART. Seit 0.13.0
   koennen zwei Sitzungen desselben Menschen im selben Browser nebeneinander
   stehen -- eine ueber HTTPS, eine ueber das Heimnetz --, und jede traegt einen
   eigenen Cookienamen. Wer abmeldet, meint beide: eine stehengebliebene waere
   ein Zugang, den niemand mehr erwartet.
   BEENDET WIRD, WAS WIRKLICH DASTEHT: der Klartextcookie geht auch an die
   HTTPS-Seite (er traegt kein Secure), umgekehrt nicht -- die Liste ist
   deshalb das, was diese eine Anfrage mitbringt, und nicht eine Vermutung. */
app.post('/api/logout', (req, res) => {
  const cookies = auth.parseCookies(req);
  for (const cookie of new Set([cookies[auth.COOKIE_SICHER], cookies[auth.COOKIE_NAME]].filter(Boolean)))
    auth.destroySession(cookie);
  res.set('Set-Cookie', auth.clearCookie());
  res.json({ ok: true });
});

// Bewusst nur ja/nein: der Endpunkt liegt VOR der Anmeldung und darf ueber den
// Benutzer nichts verraten. Deshalb das Boolean um die Zeile herum.
app.get('/api/session', (req, res) => {
  res.json({ authenticated: Boolean(auth.sessionUser(auth.sessionToken(req))) });
});

/* ---- Der Token vor der Anmeldung ----
   ZWEI SCHREIBENDE ROUTEN DER ART 'offen' -- im Kopf steht keine Rechtefrage,
   also MUSS die Schranke im Rumpf stehen, und sie heisst Token.

   BEIDE SIND POST, obwohl die erste nur LIEST: der Token gehoert in den RUMPF
   und nicht in Pfad oder Abfrage, wo er im Zugriffsprotokoll, in der
   Verlaufsliste und womoeglich im Referrer stuende. Der Waechter ueber den
   Quelltext sieht jedes app.post( an, deshalb steht die lesende mit in
   F_ROUTEN.

   DIE ANMELDEBREMSE GREIFT AN BEIDEN. Beim Token gibt es keinen
   Benutzernamen: die IP-Haelfte greift, die Namenshaelfte faellt von selbst
   weg -- noteFailure legt bei leerem Namen gar keinen Zaehler an. */
const TOKEN_DENIAL = 'server.linkExpired';

// true = weitermachen. Bei false ist die Antwort bereits geschrieben.
async function tokenThrottleFree(req, res) {
  const throttle = auth.checkThrottle(auth.clientIp(req), null);
  if (throttle.blocked) {
    res.status(429).json({
      error: t(localeOf(req), 'server.throttled', { sekunden: throttle.retryInSec })});
    return false;
  }
  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));
  return true;
}

/* Was auf der Seite steht, BEVOR das Passwort gesetzt wird. Der Server nennt
   den Benutzernamen erst, wenn der Token traegt -- vorher verriete ein
   geratener Token einen Namen. Das Formular selbst ist damit schon die
   Bestaetigung, dass der Link gilt. */
app.post('/api/token/check', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenThrottleFree(req, res)) return;
  const token = auth.checkToken((req.body || {}).token);
  if (!token) { auth.noteFailure(ip, null); return res.status(400).json({ error: t(localeOf(req), TOKEN_DENIAL)}); }
  /* HIER BEGINNT DIE FRIST, und nur hier: dies ist die eine Stelle, an der
     belegt ist, dass ein BROWSER den Schluessel in der Hand hat -- er steht im
     Fragment und kommt nur von dort.
     WEITERE AUFRUFE RUEHREN NICHTS AN: beginneTokenFrist schreibt nur
     herunter, nie hinauf. Wer neu laedt, steht deshalb nicht vor einem toten
     Link.
     NICHT in auth.checkToken: die wird auch von loeseTokenEin gerufen, und
     das Einloesen darf die Frist nicht noch einmal anfassen. */
  const minuten = auth.startTokenDeadline(token.hash);
  res.json({
    username: token.username, ohnePasswort: token.ohnePasswort,
    minPassword: auth.PASSWORD_MIN, minuten
  });
});

/* Das Einloesen. Der Mindestwert von zehn Zeichen gilt unveraendert; die
   Regel steht in auth.redeemToken.
   ANGEMELDET WIRD GLEICH MIT, wie bei /api/setup: das Passwort wurde ja
   gerade hier gewaehlt. Die Sitzung entsteht NACH dem Einloesen, also
   nachdem alle bisherigen gefallen sind. */
app.post('/api/token/redeem', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenThrottleFree(req, res)) return;
  const { token, passwort } = req.body || {};
  let ergebnis;
  try { ergebnis = await auth.redeemToken(token, passwort); }
  catch (e) { auth.noteFailure(ip, null); return res.status(400).json({ error: errorText(req, e) }); }
  auth.noteSuccess(ip, null);
  /* DER ZWEITE FAKTOR WIRD AUCH HIER VERLANGT -- UND DAS IST EINE
     SICHERHEITSFRAGE, KEINE BEQUEMLICHKEITSFRAGE.

     OHNE DIESE ZEILEN WAERE DER RUECKSETZLINK DER WEG AM ZWEITEN FAKTOR
     VORBEI: ein Admin erzeugt fuer einen fremden Zugang einen Link, oeffnet
     ihn selbst, setzt ein Passwort -- und waere angemeldet. Ein zweiter
     Faktor, der ueber die Rollenleiter abzustreifen ist, sichert nichts. Der
     Link laeuft ausserdem ueber einen fremden Server.

     DER SONDERFALL LOEST SICH BAULICH: wer seinen ERSTEN Link einloest, hat
     noch kein Passwort -- und kann deshalb keinen bestaetigten Faktor haben,
     denn einschalten setzt eine Anmeldung voraus. zweifaktorAn() ist dort
     schlicht falsch.

     DAS PASSWORT IST DABEI SCHON GESETZT und die alten Sitzungen sind
     gefallen: der Link hat getan, wofuer er da war. Was er NICHT mehr tut,
     ist anmelden. */
  if (auth.twoFactorOn(ergebnis.id)) {
    return res.json({
      ok: true, username: ergebnis.username, zweifaktor: true,
      ...auth.createLoginTicket(ergebnis.id)
    });
  }
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(req, auth.createSession(ergebnis.id)));
  res.json({ ok: true, username: ergebnis.username });
});

/* ---- Die Selbstanmeldung vor der Anmeldung ----
   ZWEI SCHREIBENDE ROUTEN DER ART 'offen'. Im Kopf steht keine Rechtefrage,
   und im Rumpf steht auch keine: es DARF sie jeder. Was diese beiden Routen
   begrenzt, ist etwas anderes -- der Schalter, der Deckel, die Bremse und die
   immer gleiche Antwort.

   BEIDE SIND POST, obwohl die zweite fast nur nachschlaegt: der Schluessel
   gehoert in den RUMPF und nicht in Pfad oder Abfrage.

   DIE ANMELDEBREMSE GREIFT AN BEIDEN, ohne Namenshaelfte. An der Anfrageroute
   ist sie die Schranke gegen das massenhafte Stellen, an der
   Bestaetigungsroute die gegen das Durchprobieren von Schluesseln. Der
   Benutzername der Anfrage geht ausdruecklich NICHT in die Bremse: er ist
   geraten, und ein Zaehler darauf waere ein Werkzeug, einen erwuenschten
   Namen auszusperren. */

/* DIE EINE ANTWORT. Sie steht als Konstante da und wird an DREI Stellen
   gegeben, damit sie gar nicht auseinanderlaufen kann -- Byte fuer Byte
   dieselbe, ob der Name frei war, ob er vergeben war, ob die Adresse schon an
   einem Zugang haengt, ob der Deckel erreicht ist oder ob der Schalter aus
   ist. ANDERNFALLS WAERE DAS FORMULAR EIN WERKZEUG ZUM DURCHPROBIEREN, und
   zwar ein bequemeres als die Anmeldung: es steht ohne Passwort davor.
   SIE IST WAHR IN JEDEM DIESER FAELLE -- "wir haben dir eine Mail geschickt"
   waere in fuenf von sechs Lagen gelogen. */
const REQUEST_ANSWER = { ok: true, meldung:
  'Danke. Wenn zu diesen Angaben eine Anfrage möglich war, hast du jetzt eine E-Mail ' +
  'bekommen — bitte bestätige darin deine Adresse. Danach entscheidet ein Admin.' };

app.post('/api/signup', async (req, res) => {
  if (!await tokenThrottleFree(req, res)) return;
  /* DER SCHALTER FUEHRT ZU DERSELBEN ANTWORT WIE ALLES ANDERE und nicht zu
     einer Absage. Eine eigene Absage waere eine zweite Auskunftsstelle ueber
     den Schalter neben /api/config -- und vor allem waere sie die eine Lage,
     an der sich die Antwort doch unterscheidet. "Abgewiesen" heisst hier: es
     entsteht nichts. Keine Zeile, keine Mail. */
  const an = getSetting('registrierung', false) === true;
  const { name, adresse } = req.body || {};
  const plain = an ? auth.createRequest(name, adresse) : null;
  res.json(REQUEST_ANSWER);
  /* ERST DIE ANTWORT, DANN DER VERSAND (Begruendung bei
     sendConfirm): ein Weg, der auf den Mailserver wartet, waere an
     der Uhr von einem still verworfenen zu unterscheiden.
     DAS AUFFANGNETZ IST KEINE ZIERDE -- hier haengt kein Aufrufer mehr an der
     Zusage. */
  if (plain) {
    sendConfirm(String(name).trim(), String(adresse).trim(), plain)
      .catch(e => console.error('[Kriterion] Bestaetigungsmail:', e && e.message));
  }
});

/* Die Bestaetigung. SIE LEGT KEINEN ZUGANG AN, SETZT KEIN PASSWORT UND
   MELDET NIEMANDEN AN -- sie setzt einen Zeitpunkt in einer Zeile.
   ZWEI ANTWORTEN HIER, kein Widerspruch zur einen oben: dort raet jemand
   Namen, hier braeuchte er 256 Bit. Die Absage ist DIE EINE fuer alle Faelle.
   DER NAME STEHT AUCH IN DER GUTEN ANTWORT NICHT. */
app.post('/api/signup/confirm', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenThrottleFree(req, res)) return;
  if (!auth.confirmRequest((req.body || {}).schluessel)) {
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
   EIN Ort fuer die Regel, mehrere Eingaenge. Sie steht GENAU EINMAL, naemlich
   in der Adminfrage unten; ein Waechter im Pruefstand zaehlt die Vorkommen.

   Drei Rollen als Leiter -- user < admin < eigentuemer:
     Benutzer    -- schreibt eigene Beitraege, sonst nichts.
     Admin       -- verwaltet Kriterien, Tags, Kategorien, Titel, Vokabular,
                    Suchanbieter; loescht fremde Beitraege; legt BENUTZER an,
                    sperrt und loescht sie -- an einen Admin oder Eigentuemer
                    kommt er nicht.
     Eigentuemer -- alles vom Admin, dazu Rollen vergeben, an Admins ran, und
                    was die Instanz als GANZES betrifft: Export, Import,
                    Schluesselwert.

   Vier Fragen, und keine steht ein zweites Mal: Adminfrage,
   Eigentuemerfrage, mayChange (Verfasser ODER Admin), selfOnly (Verfasser,
   der Admin ausdruecklich NICHT).

   Die Eigentuemerfrage steht ZUERST, weil die Adminfrage sie ruft -- damit
   ist "ein Eigentuemer ist immer auch Admin" baulich wahr. */
function istEigentuemer(req) { return req.benutzer.role === 'eigentuemer'; }
function istAdmin(req) { return req.benutzer.role === 'admin' || istEigentuemer(req); }

const DENIED_ADMIN = 'server.deniedAdmin';
const DENIED_OWNER = 'server.deniedOwner';
const DENIED_ENTRY = 'server.deniedEntry';
const DENIED_SELF = 'server.deniedSelf';
const DENIED_TAG_NEW = 'server.deniedTagNew';
const DENIED_CATEGORY_NEW = 'server.deniedCategoryNew';

function adminOnly(req, res, next) {
  if (!istAdmin(req)) return res.status(403).json({ error: t(localeOf(req), DENIED_ADMIN)});
  next();
}

function ownerOnly(req, res, next) {
  if (!istEigentuemer(req)) return res.status(403).json({ error: t(localeOf(req), DENIED_OWNER)});
  next();
}

/* ---- Die zweite Bestaetigung ----
   WAS DIE INSTANZ ALS GANZES TRIFFT, WIRD EIN ZWEITES MAL BESTAETIGT.
   Verteidigt wird gegen eine FREMDE OFFENE SITZUNG.

   NEUN WEGE UEBER ACHT ROUTEN, und PUT /api/users/:id traegt zwei davon:
     export     GET    /api/export
     import     POST   /api/import
     rolle      PUT    /api/users/:id   (nur wenn rolle im Rumpf steht)
     passwort   PUT    /api/users/:id   (nur wenn passwort im Rumpf steht)
     entfernen  DELETE /api/users/:id
     link       POST   /api/users/:id/token
     mail       PUT    /api/mail
     bilder     POST   /api/images/convert
     sicherung  POST   /api/backup/cleanup

   AUSDRUECKLICH NICHT DAHINTER: Sperren und Freigeben (umkehrbar), das
   Anlegen eines Zugangs (es nimmt niemandem etwas) und POST /api/setup (dort
   gibt es kein bisheriges Passwort).

   ZWEI FORMEN DESSELBEN AUFRUFS: der Waechter fuer die Routenzeile -- er MUSS
   es sein, wo multer dahinter steht -- und die Frage im Rumpf, wo erst der
   Rumpf sagt, ob ueberhaupt bestaetigt werden muss. */
const DENIED_CONFIRM = 'server.deniedConfirm';

// true = weitermachen. Bei false ist die Antwort bereits geschrieben.
// 403 und NICHT 401: der Zugang gilt weiter, nur diese eine Handlung nicht.
// Ein 401 wuerfe die Oberflaeche auf die Anmeldeseite.
function secondConfirm(req, res, zweck, ziel = null) {
  const token = auth.sessionToken(req);
  if (auth.useRelease(token, zweck, ziel)) return true;
  res.status(403).json({ error: t(localeOf(req), DENIED_CONFIRM), bestaetigung: zweck});
  return false;
}

/* Dieselbe Frage als Waechter in der Routenzeile. Das Ziel kommt aus der
   Adresse -- beim vollen Export und beim Import gibt es keins.
   SEIT 0.12.4 ZAEHLT DIE ABFRAGE MIT, und zwar nur `teil`: ein Bestand, der in
   fuenf Teilen hinausgeht, braucht fuenf Freigaben, sonst muesste der Mensch
   sein Passwort fuenfmal tippen. Eine Freigabe wird verbraucht (auth.js), und
   fuenf mit demselben Ziel waeren EINE -- der Schluessel ist Token, Zweck und
   Ziel.
   DIE SCHRANKE WIRD DAMIT NICHT MILDER: jeder Teil braucht seine eigene, eine
   Freigabe fuer Teil 1 laesst Teil 2 nicht durch, und jede einzelne wird am
   Server gegen das Passwort geprueft. Was zusammengefasst wird, ist die
   EINGABE und nicht die Pruefung. */
const secondConfirmNeeded = (zweck) => (req, res, next) => {
  const ziel = req.params.id !== undefined ? req.params.id
             : (req.query && req.query.teil !== undefined ? req.query.teil : null);
  if (secondConfirm(req, res, zweck, ziel)) next();
};

// Verfasser oder Admin. EINE HERRENLOSE ZEILE (user_id IS NULL) GEHOERT DEM
// ADMIN: ohne die Klemme auf null waere sie fuer jeden offen -- und genau die
// entsteht, wenn ein Fremdschluessel mit ON DELETE SET NULL zuschlaegt.
// assignInventory() raeumt sie beim naechsten Start dem Eigentuemer zu; bis
// dahin darf sie nicht jedem gehoeren.
function mayChange(req, authorId) {
  return istAdmin(req) || (authorId != null && authorId === req.benutzer.id);
}

// Nur der Verfasser -- und ausdruecklich auch der Admin nicht. Fuer alles, was
// eine fremde AUSSAGE umschriebe statt sie zu entfernen: Kommentartext, Note
// eines Testtags, Tags an einem fremden Testtag, Bilder an einem fremden
// Kommentar. Loeschen ja, umschreiben nein -- eine fremde Aussage unter
// fremdem Namen zu veraendern ist die Art Funktion, die man spaeter bereut.
function selfOnly(req, authorId) {
  return authorId != null && authorId === req.benutzer.id;
}

/* Wer einen NEUEN Namen anlegen darf -- Tag oder Kategorie. Zwei globale
   Schalter, Vorgabe an, ABGELEITET BEIM LESEN: ein Schluessel, der nicht in
   settings steht, gilt als eingeschaltet -- damit kein Migrationscode.
   DER ADMIN KOMMT IMMER DURCH: ein Schalter, den er erst umlegen muesste,
   waere eine Schranke gegen sich selbst.
   DIE KLEMME SITZT HINTER DEM NACHSCHLAGEN DES VORHANDENEN NAMENS -- nur so
   bleibt "Zuweisen darf immer jeder" baulich wahr. */
const freeCreate = (schluessel) => getSetting(schluessel, true) !== false;
function mayCreate(req, schluessel) {
  return istAdmin(req) || freeCreate(schluessel);
}

/* Alles, was an einem Eintrag haengt -- Fotos, Dateien, Links, Tags, Kategorie,
   die Merkmale --, richtet sich nach dem Verfasser DES EINTRAGS. Zwei Formen
   desselben Aufrufs, weil die Wege verschieden ankommen: die einen kennen die
   Eintragsnummer als :id, die anderen holen sie erst aus der Kindzeile. Beide
   fragen dieselbe Funktion; die Regel steht trotzdem nur einmal da. */
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

// Die Felder von PUT /api/items/:id, die dem Verfasser gehoeren. `favorite`
// steht bewusst NICHT dabei: der Favorit ist persoenlich, jeder setzt seinen
// eigenen an jedem Eintrag. Deshalb sitzt die Klemme dort IM Rumpf und nicht
// vor der Route.
/* `rejectedGrund` STEHT MIT DABEI, UND DAS IST DIE GROBE HAELFTE DER KLEMME:
   an die Begruendung kommt ueberhaupt nur, wer den Eintrag aendern darf. Die
   feine Haelfte steht im Rumpf der Route -- umschreiben darf sie nur, wer sie
   getroffen hat. Ohne die grobe koennte jeder Angemeldete an einem Eintrag,
   dessen Ablehnung noch keinen Verfasser traegt, eine Begruendung hinsetzen. */
const AUTHOR_ONLY_FIELDS = ['title', 'description', 'rejected', 'rejectedGrund',
                              'tested', 'productCategoryId'];

/* Wer an einen fremden ZUGANG darf. Ein Admin ist der Sheriff im
   Dorf -- er legt Benutzer an, sperrt sie und loescht sie. An seinesgleichen
   kommt er nicht: koennte ein Admin einen anderen sperren, waere die
   Verwaltung ein Wettrennen, und der Schnellste bliebe allein uebrig.
   Die Regel steht hier und nirgends sonst; die vier Routen rufen sie. */
function mayTouchUser(req, ziel) {
  return ziel.role === 'user' ? istAdmin(req) : istEigentuemer(req);
}
const DENIED_USER = 'server.deniedUser';
const DENIED_ROLE = 'server.deniedRole';
const DENIED_OWN_USER = 'server.deniedOwnUser';

/* ---- Zugang ---- */
// Der angemeldete Benutzer, nicht der erste: ab dem zweiten Zugang saehe
// sonst jeder den Namen des Eigentuemers.
app.get('/api/account', (req, res) => {
  // Die eigene Adresse steht hier und nirgends sonst: sie gehoert dem, der sie
  // hat. GET /api/users liefert sie ausdruecklich NICHT mit -- ein Admin
  // braucht fuer seine Arbeit die Zugaenge, nicht die Postfaecher.
  /* DER ZUSTAND DES ZWEITEN FAKTORS REIST HIER MIT -- deshalb kommt keine
     lesende Route dazu: die Karte "Zugang" holt diese Antwort ohnehin.
     DAS GEHEIMNIS IST NIE DARIN, auch nicht fuer den Eigentuemer. */
  res.json({ username: req.benutzer.username, minPassword: auth.PASSWORD_MIN,
             email: auth.getUser2(req.benutzer.id)?.email || '',
             zweifaktor: auth.twoFactorState(req.benutzer.id) });
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
    ergebnis = await auth.changeUser(req.benutzer.id, oldPassword, username, newPassword, email);
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
  // Alle anderen Sitzungen DIESES Benutzers fallen. Wer das Passwort wechselt,
  // will meist genau das; die eigene bleibt, sonst wuerde man sich selbst
  // hinauswerfen. Die Zeile selbst steht in auth.js -- der Knopf "alle anderen
  // beenden" ruft dieselbe, und zwei Ausfuehrungen derselben Regel liefen
  // auseinander.
  auth.endOtherSessions(req.benutzer.id, auth.sessionToken(req));
  res.json(ergebnis);
});

/* ---- Meine Sitzungen ----
   PERSOENLICH: EIN ADMIN SIEHT KEINE FREMDEN SITZUNGEN -- fuer den Ernstfall
   gibt es das Sperren, und setzeStatus loescht sie mit.
   Beide schreibenden Routen tragen die Art 'selbstbezug'.
   DIE FESTE ROUTE STEHT VOR DER PLATZHALTERROUTE (Stolperstein 11). */
app.get('/api/sessions', (req, res) => {
  const ownOne = auth.sessionToken(req);
  res.json({ sitzungen: auth.sessionsOf(req.benutzer.id, ownOne), tage: auth.SESSION_DAYS });
});

app.delete('/api/sessions', (req, res) => {
  const ownOne = auth.sessionToken(req);
  res.json({ beendet: auth.endOtherSessions(req.benutzer.id, ownOne) });
});

app.delete('/api/sessions/:kennung', (req, res) => {
  const ownOne = auth.sessionToken(req);
  // Die eigene ueber diesen Weg zu beenden waere ein zweiter Abmeldeweg neben
  // POST /api/logout -- und einer, nach dem die Oberflaeche weiterliefe, als
  // waere nichts gewesen.
  if (auth.sessionIdOf(ownOne || '') === String(req.params.kennung)) {
    return res.status(400).json({ error: t(localeOf(req), 'server.sessionOwn')});
  }
  const n = auth.endSession(req.benutzer.id, req.params.kennung);
  if (!n) return res.status(404).json({ error: t(localeOf(req), 'server.sessionUnknown')});
  res.json({ beendet: n });
});

/* ---- Der zweite Faktor ----
   VIER SCHREIBENDE ROUTEN, ALLE DER ART 'selbstbezug': die Benutzernummer
   kommt aus req.benutzer und steht in keinem Pfad. Das ist die ganze
   Rechtefrage dieses Bereichs -- JEDER SCHALTET IHN FUER SICH SELBST EIN UND
   AUS, und es gibt keine Adresse, unter der ein Fremder gemeint waere.

   EINSCHALTEN GEHT IN ZWEI SCHRITTEN, und der zweite ist der Beleg:
     POST /api/two-factor/start  erzeugt das Geheimnis und gibt es EINMAL heraus
     POST /api/two-factor/on     nimmt einen Code aus der App entgegen und
                                 schaltet ein -- erst hier entstehen die
                                 Wiederherstellungscodes
   Ein Schritt allein waere ein Zugang, den niemand mehr oeffnet.

   ALLE VIER STEHEN HINTER DEM BISHERIGEN PASSWORT, auch das Einschalten: eine
   uebernommene offene Sitzung koennte sonst einen zweiten Faktor auf ein
   FREMDES Telefon legen und den Eigentuemer aussperren.

   DAS GEHEIMNIS KOMMT AUS KEINER ANTWORT HERAUS, SOBALD ES BESTAETIGT IST --
   auch nicht an den Eigentuemer. */

// Das bisherige Passwort, an allen vier Wegen dieselbe Frage. Sie steht EINMAL
// hier und nicht viermal daneben. true = weitermachen; bei false ist die
// Antwort bereits geschrieben.
// 403 und nicht 401: der Zugang gilt weiter, nur diese eine Handlung nicht --
// dieselbe Ueberlegung wie bei der zweiten Bestaetigung.
async function ownPasswordMatches(req, res, passwort) {
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.benutzer.id);
  if (row && await auth.checkPassword(String(passwort || ''), row.password_hash)) return true;
  res.status(403).json({ error: t(localeOf(req), 'server.passwordWrong')});
  return false;
}

/* Schritt eins. DER OEFFENTLICHE TITEL WIRD MITGEGEBEN, damit in der App
   steht, wozu der Code gehoert -- er steht ohnehin auf der Anmeldeseite und
   verraet nichts, was nicht jeder sieht, der die Adresse kennt. */
app.post('/api/two-factor/start', async (req, res) => {
  if (!await ownPasswordMatches(req, res, (req.body || {}).passwort)) return;
  try {
    res.json(auth.startTwoFactor(req.benutzer.id,
      getSetting('title_public', 'Bewertungskatalog'), req.benutzer.username));
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* Schritt zwei. HIER ENTSTEHEN DIE WIEDERHERSTELLUNGSCODES, und sie stehen in
   dieser einen Antwort. Danach nirgends mehr -- auch nicht in der Datenbank,
   dort liegt nur ihr SHA-256. Wer sie verliert, holt sich neue; wer beides
   verliert, geht ueber usertool.js auf dem Wirt. */
app.post('/api/two-factor/on', async (req, res) => {
  const { passwort, code } = req.body || {};
  if (!await ownPasswordMatches(req, res, passwort)) return;
  try {
    res.json(auth.turnTwoFactorOn(req.benutzer.id, code, req.benutzer.id));
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* Frische Wiederherstellungscodes -- der Fall, den niemand plant: der letzte
   ist verbraucht. Hinter Passwort UND gueltigem Code, wie das Ausschalten:
   wer neue Codes bekaeme, ohne den laufenden Faktor zu belegen, haette einen
   Weg an ihm vorbei. Ein Wiederherstellungscode zaehlt dabei als Beleg -- genau
   dafuer ist er da, und der letzte holt so die naechsten acht. */
app.post('/api/two-factor/codes', async (req, res) => {
  const { passwort, code } = req.body || {};
  if (!await ownPasswordMatches(req, res, passwort)) return;
  if (!auth.checkTwoFactor(req.benutzer.id, code))
    return res.status(403).json({ error: t(localeOf(req), auth.TWO_FACTOR_DENIAL)});
  try {
    /* ERST DIE CODES, DANN DER STAND -- und die Reihenfolge ist keine
       Geschmacksfrage. In einem Objektliteral wird von links nach rechts
       ausgewertet: stuende twoFactorState() zuerst, meldete die Antwort die
       Zahl von VOR dem Erneuern, und die Karte zeigte "noch 4 von 8" neben
       acht frischen Codes. */
    const codes = auth.refreshRecoveryCodes(req.benutzer.id);
    res.json({ ...auth.twoFactorState(req.benutzer.id), codes });
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* Ausschalten. PASSWORT UND GUELTIGER CODE -- das Passwort allein genuegte
   nicht: gegen eine uebernommene Sitzung mit mitgelesenem Passwort ist der
   Faktor ja gerade gebaut.
   EIN ADMIN KOMMT HIER NICHT HEREIN: die Nummer kommt aus req.benutzer. Der
   einzige Weg daneben ist usertool.js auf dem Wirt. */
app.delete('/api/two-factor', async (req, res) => {
  const { passwort, code } = req.body || {};
  if (!auth.twoFactorOn(req.benutzer.id))
    return res.status(400).json({ error: t(localeOf(req), 'server.twoFactorOff')});
  if (!await ownPasswordMatches(req, res, passwort)) return;
  if (!auth.checkTwoFactor(req.benutzer.id, code))
    return res.status(403).json({ error: t(localeOf(req), auth.TWO_FACTOR_DENIAL)});
  auth.turnTwoFactorOff(req.benutzer.id, req.benutzer.id);
  res.json({ ...auth.twoFactorState(req.benutzer.id) });
});

/* ---- Die Freigabe holen ----
   EINE ROUTE FUER ALLE SIEBEN WEGE. Sie prueft DASSELBE Passwort noch einmal,
   nicht ein zweites Geheimnis. Die Art 'selbstbezug': der Benutzer kommt aus
   req.benutzer und nie aus der Adresse -- wer bestaetigt, bestaetigt fuer sich.

   DIE ANMELDEBREMSE GREIFT, dieselbe wie ueberall. Ohne sie waere diese Route
   ein Weg, ein Passwort ungebremst durchzuprobieren -- und zwar HINTER der
   Anmeldung, wo niemand hinsieht.

   DIE ABSAGE IST KLAR UND DEUTLICH, anders als an den Tokenrouten: dort weiss
   der Server nicht, wer fragt, hier ist der Fragende angemeldet und
   namentlich bekannt -- eine verschleierte Absage schuetzte niemanden. */
app.post('/api/confirm', async (req, res) => {
  const ip = auth.clientIp(req);
  const name = req.benutzer.username;
  const throttle = auth.checkThrottle(ip, name);
  if (throttle.blocked) {
    return res.status(429).json({
      error: t(localeOf(req), 'server.throttled', { sekunden: throttle.retryInSec })});
  }
  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));
  const { passwort, zweck, ziel, ziele, code } = req.body || {};
  if (!auth.CONFIRM_PURPOSES.includes(zweck))
    return res.status(400).json({ error: t(localeOf(req), 'server.purposeUnknown')});
  /* MEHRERE ZIELE IN EINER ANFRAGE, und der Grund ist der Code des zweiten
     Faktors: er gilt GENAU EINMAL. Das Passwort laeuft gegen einen Hash und
     laesst sich beliebig oft vergleichen, der Code nicht -- wer ihn n-mal
     schickt, bekommt einmal 200 und n-1 mal 403.
     GEPRUEFT WIRD DESHALB EINMAL UND FREIGEGEBEN n-MAL. Was dabei bleibt: das
     LADEN eines Teils verbraucht weiterhin genau eine Freigabe, und eine
     Freigabe fuer Teil 1 laesst Teil 2 nicht durch -- der Schluessel ist
     Sitzung, Zweck und Ziel, und daran aendert sich nichts.
     GEPRUEFT VOR DEM PASSWORT: eine unbrauchbare Bestellung soll keinen Code
     verbrennen und keine Zeile in der Anmeldebremse kosten. */
  let targetList;
  if (ziele !== undefined) {
    if (ziel !== undefined)
      return res.status(400).json({ error: t(localeOf(req), 'server.targetEitherOr')});
    if (!Array.isArray(ziele) || !ziele.length)
      return res.status(400).json({ error: t(localeOf(req), 'server.targetsMissing')});
    /* Die Zahl der Ziele ist gedeckelt wie die Zahl der Teile: eine Bestellung
       ueber zehntausend Freigaben legte sie im Arbeitsspeicher ab und nichts
       raeumte sie vor ihrem Ablauf wieder weg.
       EXCHANGE_PART_MAX STEHT WEIT UNTEN, beim Teilexport selbst -- dort
       gehoert die Zahl hin, und dieselbe Grenze zweimal zu schreiben liefe
       auseinander. Zur Laufzeit ist sie laengst gesetzt: diese Zeile laeuft in
       einem Routenrumpf, nicht bei der Modulauswertung. */
    if (ziele.length > EXCHANGE_PART_MAX)
      return res.status(400).json({ error: t(localeOf(req), 'server.targetsTooMany', { deckel: EXCHANGE_PART_MAX })});
    targetList = ziele.map(z => Number(z));
    if (!targetList.every(n => Number.isInteger(n) && n > 0))
      return res.status(400).json({ error: t(localeOf(req), 'server.targetNotNumber')});
    // Doppelte sind ein Fehler und keine stillschweigend halbierte Bestellung:
    // wer zweimal dieselbe Nummer schickt, hat sich verzaehlt, und eine
    // Antwort mit weniger Freigaben als bestellt saehe aus wie ein Erfolg.
    if (new Set(targetList).size !== targetList.length)
      return res.status(400).json({ error: t(localeOf(req), 'server.targetTwice')});
  } else targetList = [ziel ?? null];
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.benutzer.id);
  if (!row || !await auth.checkPassword(String(passwort || ''), row.password_hash)) {
    auth.noteFailure(ip, name);
    // Die zweite der beiden Zeilen, bei denen das SCHEITERN der Vorgang ist.
    // Wer hier scheitert, sitzt an einer angemeldeten Sitzung und kennt das
    // Passwort nicht -- genau der Fall, gegen den diese Runde gebaut ist.
    auth.log('bestaetigung.fehl', { wer: req.benutzer.id, ziel: req.benutzer.id });
    return res.status(403).json({ error: t(localeOf(req), 'server.passwordWrong')});
  }
  /* FRAGT DIESE STELLE ZUSAETZLICH DEN CODE -- aber NUR bei Zugaengen, die
     einen zweiten Faktor eingeschaltet haben.
     WARUM GERADE HIER: die zweite Bestaetigung verteidigt gegen die
     UEBERNOMMENE OFFENE SITZUNG, und genau dort traegt ein zweiter Faktor am
     meisten -- das Passwort mag mitgelesen sein, das Telefon liegt woanders.
     DIESE FRAGE FUEGT KEINEN ZWECK HINZU: es ist eine zweite Frage an
     derselben Stelle, kein weiterer Weg. (CONFIRM_PURPOSES steht seit
     0.19.0 bei acht -- der achte ist die Umstellung der Bildablage und
     kommt aus einer eigenen Route, nicht von hier.)
     DIE REIHENFOLGE IST PASSWORT, DANN CODE: wer das Passwort nicht hat, soll
     nicht erfahren, ob am Zugang ein Faktor haengt. */
  if (auth.twoFactorOn(req.benutzer.id) && !auth.checkTwoFactor(req.benutzer.id, code)) {
    auth.noteFailure(ip, name);
    auth.log('bestaetigung.fehl', { wer: req.benutzer.id, ziel: req.benutzer.id });
    return res.status(403).json({ error: t(localeOf(req), auth.TWO_FACTOR_DENIAL), zweifaktor: true});
  }
  auth.noteSuccess(ip, name);
  const ownOne = auth.sessionToken(req);
  try {
    // Alle Freigaben in EINER Antwort. `targets` steht auch dann darin, wenn nur
    // eine bestellt war -- eine Antwort, deren Form von der Zahl abhaengt,
    // braeuchte auf der Gegenseite zwei Lesearten.
    let letzte;
    for (const z of targetList) letzte = auth.createRelease(ownOne, zweck, z);
    res.json({ ok: true, ...letzte, ziele: targetList });
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* ---- Das Sicherheitsprotokoll ----
   NUR DER EIGENTUEMER: es nennt Vorgaenge ueber andere Zugaenge, und ein
   Admin saehe darin die Verwaltungsvorgaenge des Eigentuemers ueber ihn
   selbst. Lesend, deshalb kein Eintrag in F_ROUTEN.
   ES GIBT KEINEN WEG HINAUS AUSSER DER FRIST -- eine Loeschroute waere ein
   Protokoll, das der Betroffene selbst wegraeumen kann.
   ZWEITE AUFRUFSTELLE DES AUFRAEUMENS; die erste steht beim Start. */
app.get('/api/security-log', ownerOnly, (req, res) => {
  auth.cleanupLog();
  /* DIE AUSWAHL GEHT AN DEN SERVER und nicht an den Browser: die Karte holt
     die hundert JUENGSTEN Zeilen, und darin findet man die gescheiterten
     Anmeldungen nicht -- sie stehen zwischen allem anderen. Mit der Auswahl
     sind es die hundert juengsten DIESER Art.
     EIN UNBEKANNTER SCHLUESSEL IST EIN 400 und nicht stillschweigend "alles":
     ein Tippfehler saehe sonst aus wie ein Erfolg.
     LESEND WIE VORHER -- F_ROUTEN bleibt bei 69. */
  const gruppe = req.query.gruppe;
  if (gruppe !== undefined && !Object.prototype.hasOwnProperty.call(auth.LOG_GROUPS, gruppe))
    return res.status(400).json({ error: t(localeOf(req), 'server.viewUnknown')});
  res.json(auth.readLog(auth.LOG_LIMIT, gruppe));
});

/* ---- Zugaenge verwalten ----
   Die Vorgaenge selbst stehen in auth.js, weil usertool.js auf dem Wirt
   dieselben ruft -- zwei Wege zum selben Grabstein liefen auseinander.
   Hier steht nur, WER sie ausloesen darf. */

// Liest die Zielzeile und beantwortet in einem, ob der Anfragende an sie darf.
// true = weitermachen; bei false ist die Antwort bereits geschrieben.
// GEPRUEFT WIRD VOR JEDEM SCHREIBEN, in allen drei Routen -- eine Absage, die
// die halbe Aenderung schon geschrieben hat, waere schlimmer als keine.
function targetUserFree(req, res, id, selfAllowed = false) {
  const ziel = auth.getUser2(id);
  if (!ziel) { res.status(404).json({ error: t(localeOf(req), 'server.userUnknown')}); return null; }
  if (ziel.status === 'geloescht') {
    res.status(400).json({ error: t(localeOf(req), 'server.userDeleted')}); return null;
  }
  if (!selfAllowed && ziel.id === req.benutzer.id) {
    res.status(403).json({ error: t(localeOf(req), DENIED_OWN_USER)}); return null;
  }
  if (!mayTouchUser(req, ziel)) { res.status(403).json({ error: t(localeOf(req), DENIED_USER)}); return null; }
  return ziel;
}

app.get('/api/users', adminOnly, (req, res) => {
  // Zweite Aufrufstelle des Aufraeumens; die erste steht beim Start. Dieselbe
  // Bauform wie bei cleanupTrash(): eine Instanz, die monatelang
  // durchlaeuft, raeumte sonst monatelang nicht auf. Hauswirtschaft, keine
  // Benutzerhandlung -- die Liste schreibender Routen bleibt unberuehrt.
  auth.cleanupTokens();
  res.json({
    zugaenge: auth.listUsers(),
    ich: req.benutzer.id,
    darfRollen: istEigentuemer(req),
    eigentuemer: auth.ownerCount()
  });
});

// Die Zahlen fuer den Loeschdialog. Lesend, deshalb kein Eintrag in F_ROUTEN.
app.get('/api/users/:id/inventory', adminOnly, (req, res) => {
  const ziel = auth.getUser2(req.params.id);
  if (!ziel) return res.status(404).json({ error: t(localeOf(req), 'server.userUnknown')});
  res.json({ username: ziel.username, ...auth.countInventory(ziel.id) });
});

// Anlegen. Der Admin darf das -- aber nur BENUTZER: eine Rolle zu vergeben ist
// Sache des Eigentuemers, und ueber das Anlegen waere sie sonst fuer jeden
// Admin offen, ohne dass irgendwo "Rolle" steht. Dieselbe Ueberlegung wie beim
// Import, den eine Exportdatei sonst unter fremdem Namen schreiben liesse.
app.post('/api/users', adminOnly, async (req, res) => {
  const { username, passwort, rolle, einladen, email } = req.body || {};
  const wanted = rolle || 'user';
  if (wanted !== 'user' && !istEigentuemer(req))
    return res.status(403).json({ error: t(localeOf(req), DENIED_ROLE)});
  try {
    /* MIT EINLADUNG ENTSTEHT DER ZUGANG OHNE PASSWORT und bekommt den Link im
       selben Zug. Zwei Schritte waeren ein Zustand dazwischen, in dem ein
       Zugang dasteht, in den niemand hereinkommt und an den auch niemand mehr
       denkt. `einladen` muss ausdruecklich true sein -- ein vergessenes
       Passwortfeld scheitert weiter wie bisher. */
    const created = await auth.createUser(username, passwort, wanted, einladen === true,
                                             req.benutzer.id, email);
    if (einladen !== true) return res.json(created);
    const token = auth.createToken(created.id, 'einladung', req.benutzer.id);
    /* ERST DER TOKEN, DANN DER VERSAND, und die Reihenfolge ist die ganze
       Zusage: der Link steht in der Antwort, egal was der Mailserver sagt. */
    const v = await sendTokenLink({ username: created.username, email: created.email }, token);
    res.json({ ...created, token: token.plain, zweck: token.zweck, tage: token.tage,
               minuten: auth.TOKEN_DEADLINE_MINUTES, ...linkInfo(token.plain), ...v });
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* Der Link fuer einen VORHANDENEN Zugang -- einladen oder zuruecksetzen.
   targetUserFree entscheidet, damit gilt die Rollenleiter auch hier.
   DER SERVER GIBT NUR DEN TOKEN HERAUS, NICHT DEN LINK: die Adresse baut der
   Browser des Admins aus location. Aus dem Host-Kopf wird nichts abgeleitet.
   DAS IST DIE EINE ANTWORT, IN DER DER KLARTEXT STEHT. */
app.post('/api/users/:id/token', adminOnly, async (req, res) => {
  const ziel = targetUserFree(req, res, req.params.id);
  if (!ziel) return;
  /* DIE RECHTEFRAGE STEHT VOR DER BESTAETIGUNGSFRAGE, und das ist keine
     Geschmacksfrage: wer ohnehin nicht darf, soll erfahren, DASS er nicht
     darf -- und nicht erst nach seinem Passwort gefragt werden. */
  if (!secondConfirm(req, res, 'link', ziel.id)) return;
  const zweck = (req.body || {}).zweck || 'einladung';
  try {
    const token = auth.createToken(ziel.id, zweck, req.benutzer.id);
    // Erst der Token, dann der Versand -- dieselbe Reihenfolge wie am Anlegen,
    // und aus demselben Grund.
    const v = await sendTokenLink(ziel, token);
    res.json({ id: token.id, username: token.username, token: token.plain,
               zweck: token.zweck, tage: token.tage, minuten: auth.TOKEN_DEADLINE_MINUTES,
               ohnePasswort: token.ohnePasswort,
               ...linkInfo(token.plain), ...v });
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

// Rolle, Status und Passwort. Drei Rechteklassen in einem Rumpf, alle vor
// dem ersten Schreiben geprueft:
//   Rolle    -- nur der Eigentuemer, auch am eigenen Zugang (sich selbst
//               herabstufen ist erlaubt, solange ein anderer Eigentuemer
//               bleibt; das haelt auth.setRole fest).
//   Status   -- Admin an Benutzern, Eigentuemer an allen, nie am eigenen.
//   Passwort -- dieselbe Regel wie Status; das EIGENE laeuft ueber
//               PUT /api/account.
app.put('/api/users/:id', adminOnly, async (req, res) => {
  const { rolle, status, passwort } = req.body || {};
  const roleOnly = rolle !== undefined && status === undefined && passwort === undefined;
  const ziel = targetUserFree(req, res, req.params.id, roleOnly);
  if (!ziel) return;
  if (rolle !== undefined && !istEigentuemer(req))
    return res.status(403).json({ error: t(localeOf(req), DENIED_ROLE)});
  /* DIE ZWEITE BESTAETIGUNG STEHT HIER IM RUMPF UND NICHT IN DER ROUTENZEILE,
     weil erst der Rumpf sagt, WELCHE der drei Rechteklassen gemeint ist:
     Rolle und fremdes Passwort verlangen sie, Sperren und Freigeben nicht --
     das ist umkehrbar und uebergibt nichts. Beide vor dem ersten Schreiben:
     eine Absage, die die halbe Aenderung schon geschrieben hat, waere
     schlimmer als keine. */
  if (rolle !== undefined && !secondConfirm(req, res, 'rolle', ziel.id)) return;
  if (passwort !== undefined && !secondConfirm(req, res, 'passwort', ziel.id)) return;
  try {
    let ergebnis = { id: ziel.id, username: ziel.username };
    if (rolle !== undefined) ergebnis = { ...ergebnis, ...auth.setRole(ziel.id, rolle, req.benutzer.id) };
    if (status !== undefined) ergebnis = { ...ergebnis, ...auth.setStatus(ziel.id, status, req.benutzer.id) };
    if (passwort !== undefined) { await auth.setNewPassword(ziel.id, passwort, req.benutzer.id); ergebnis.passwortGesetzt = true; }
    res.json(ergebnis);
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

// Entfernen heisst Grabstein: die Zeile bleibt mit ihrer Nummer stehen, die
// Beitraege bleiben sichtbar. Die beiden Haekchen sind Ausnahmen davon und
// stehen in der Abfrage, damit sie in der Adresse sichtbar sind.
app.delete('/api/users/:id', adminOnly, (req, res) => {
  const ziel = targetUserFree(req, res, req.params.id);
  if (!ziel) return;
  // Rechtefrage vor Bestaetigungsfrage, wie an der Tokenroute.
  if (!secondConfirm(req, res, 'entfernen', ziel.id)) return;
  try {
    res.json(auth.removeUser(ziel.id, {
      eintraege: req.query.eintraege === '1',
      beitraege: req.query.beitraege === '1'
    }, req.benutzer.id));
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
});

/* ---- Der Mailversand ----------------------------------------------------
   DREI ENDPUNKTE, EINE RECHTEZEILE: DER MAILZUGANG GEHOERT DEM EIGENTUEMER,
   GANZ -- eintragen, einsehen, Testmail.
     GET  /api/mail       ownerOnly. Lesend, kein F_ROUTEN.
     PUT  /api/mail       ownerOnly und zweitbestaetigt.
     POST /api/mail/test  ownerOnly -- an die EIGENE Adresse.

   WARUM NICHT BEIM ADMIN, obwohl ER die Einladungen verschickt: der
   SMTP-Server sieht jede Mail, und jede traegt einen Link, der ein Passwort
   setzt. Der Admin bekommt stattdessen das Feld `versand` samt Grund neben
   dem Link -- in genau dem Augenblick, in dem es ihn angeht.

   DAS PASSWORT KOMMT AUS KEINER DIESER ANTWORTEN HERAUS. */

/* Was die Karte sieht. DIE ANBIETERLISTE KOMMT MIT: der Server speichert
   einen Schluessel, also muss die Oberflaeche die Namen von ihm bekommen.
   DIE MARKE SAGT, OB DER LETZTE ERFOLGREICHE TEST NOCH ZUM HEUTIGEN ZUGANG
   PASST -- ohne den Vergleich stuende "zuletzt getestet: gestern" auch nach
   einem Anbieterwechsel da. */
/* `req` SEIT 0.24.0: die drei Hinweise aus mail.js sind Schluessel geworden
   (Bauabschnitt 2), und uebersetzt werden sie HIER -- an der Stelle, an der
   die Anfrage in der Hand liegt und damit feststeht, welche Sprache die
   Antwort traegt. mail.js kennt die Sprache nicht; es kennt den Anbieter. */
function mailCard(req) {
  const roh = getSetting(mail.SETTING_KEY, null);
  // Der Vergleich steht in mailtestState() weiter oben -- eine
  // Rechnung, zwei Rufer (Stolperstein 145).
  const test = mailtestState(roh);
  const state = mail.state(roh);
  return {
    ...state,
    // Auch die beiden Hinweise am gewaehlten Anbieter sind Schluessel.
    hinweis: state.hinweis ? t(localeOf(req), state.hinweis) : '',
    hinweisImmer: t(localeOf(req), state.hinweisImmer),
    /* SAMT HINWEIS UND DEN DREI FESTEN WERTEN JE ANBIETER -- seit 0.17.3.
       Der Dialog wechselt mit der Auswahl beides, und beides steht in mail.js;
       zwei Ausfertigungen liefen auseinander (Stolperstein 102). */
    anbieterListe: mail.forChoice().map(a =>
      ({ ...a, hinweis: a.hinweis ? t(localeOf(req), a.hinweis) : '' })),
    eingerichtet: mail.configured(roh),
    // Der ZUSTAND der oeffentlichen Adresse, nicht die Adresse selbst -- die
    // steht in der Karte "Zugaenge", wo der Link entsteht.
    adresseGesetzt: Boolean(PUBLIC.adresse),
    adresse: PUBLIC.adresse,
    fristMinuten: auth.TOKEN_DEADLINE_MINUTES,
    getestetAm: test ? test.am : null,
    sekunden: Math.round(mail.SEND_MS / 1000),
    /* Die Folge der Testmarke fuer die Selbstanmeldung, : der
       Eigentuemer soll an DIESER Karte sehen, was er dem Schalter des Admins
       antut, wenn er den Mailzugang aendert. Es ist dieselbe Rechnung wie in
       der Karte "Anfragen", nicht eine zweite daneben. */
    registrierung: getSetting('registrierung', false) === true
  };
}

app.get('/api/mail', ownerOnly, (req, res) => res.json(mailCard(req)));

app.put('/api/mail', ownerOnly, secondConfirmNeeded('mail'), (req, res) => {
  let neu;
  try { neu = mail.checkInput(req.body, getSetting(mail.SETTING_KEY, null)); }
  catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
  putSetting.run(mail.SETTING_KEY, JSON.stringify(neu));
  /* DIE MARKE WIRD HIER AUSDRUECKLICH NICHT GELOESCHT: sie haengt am HASH
     UEBER DEN ZUGANG, den mailCard(req) nachrechnet -- passt er nicht mehr,
     gilt sie nicht mehr. Ein zweites Loeschen waere eine zweite Wahrheit
     ueber dieselbe Frage. */
  res.json(mailCard(req));
});

/* Die Testmail geht AN DIE EIGENE ADRESSE DES ANFORDERNDEN und nirgendwo
   sonst -- ein Knopf mit freiem Adressfeld waere ein offener Mailverteiler
   hinter einer Anmeldung. ES GIBT DESHALB KEIN ADRESSFELD: der Rumpf wird gar
   nicht angesehen. Ohne Adresse am Zugang wird abgesagt, mit dem Weg dorthin. */
app.post('/api/mail/test', ownerOnly, async (req, res) => {
  const ownOne = auth.getUser2(req.benutzer.id);
  if (!ownOne || !ownOne.email) {
    return res.status(400).json({ error:
      t(localeOf(req), 'server.ownEmailMissing')});
  }
  const roh = getSetting(mail.SETTING_KEY, null);
  if (!mail.configured(roh))
    return res.status(400).json({ error: t(localeOf(req), 'server.mailAccountMissing')});
  const locale = localeOf(req);
  const letter = mail.mailTest(locale, { titel: getSetting('title_public', 'Bewertungskatalog'),
                                          username: ownOne.username });
  const e = await mail.send(locale, roh, ownOne.email, letter.subject, letter.text);
  if (e.ok) {
    putSetting.run(MAILTEST_KEY,
      JSON.stringify({ mark: mail.mark(roh), am: new Date().toISOString().slice(0, 19).replace('T', ' ') }));
  }
  // 200 AUCH BEIM FEHLSCHLAG: der Versuch ist gelaufen, und sein Ergebnis ist
  // die Antwort. Ein 500 hiesse, die Instanz haette einen Fehler -- den hat der
  // Mailserver. Die Oberflaeche liest `ok` und nicht den Statuscode.
  res.json({ ok: e.ok, grund: e.grund, an: ownOne.email, ...mailCard(req) });
});

/* ---- Die Selbstanmeldung hinter der Anmeldung ---------------------------
   VIER ENDPUNKTE, EINE RECHTEZEILE: ADMIN -- sehen, schalten, freischalten,
   ablehnen. GET /api/requests ist lesend und steht nicht in F_ROUTEN.

   WARUM ADMIN UND NICHT EIGENTUEMER: aus einer Anfrage wird NIE etwas
   anderes als ein Zugang mit der Rolle 'user', und den legt der Admin ohnehin
   an. KEINE ZWEITE BESTAETIGUNG, aus demselben Grund wie bei POST /api/users.

   DER SCHALTER LEGT SICH NIE VON SELBST UM: einschalten geht nur bei
   bereitem Versand, AUSSCHALTEN GEHT IMMER. Geht der Versand spaeter kaputt,
   bleibt er an und die Karte sagt es rot. */
function requestCard() {
  const b = versandBereit();
  return {
    an: getSetting('registrierung', false) === true,
    versandBereit: b.ok, versandGrund: b.grund,
    anfragen: auth.listRequests(),
    deckel: auth.REQUEST_CAP, belegt: auth.countRequests(),
    stunden: auth.REQUEST_HOURS
  };
}

app.get('/api/requests', adminOnly, (req, res) => {
  // Zweite Aufrufstelle des Aufraeumens; die erste steht beim Start, die
  // dritte an der Anfrageroute selbst. Dieselbe Bauform wie bei
  // raeumeTokensAuf() -- eine Instanz, die monatelang durchlaeuft, raeumte
  // sonst monatelang nicht auf. Hauswirtschaft, keine Benutzerhandlung.
  auth.cleanupRequests();
  res.json(requestCard());
});

app.put('/api/signup/toggle', adminOnly, (req, res) => {
  const an = (req.body || {}).an === true;
  /* NUR DAS EINSCHALTEN IST GEBUNDEN. Ein Schalter, der sich nicht mehr
     ausschalten laesst, weil inzwischen der Mailzugang fehlt, waere eine
     Falle: gerade dann will man ihn aus. */
  if (an) {
    const b = versandBereit();
    if (!b.ok) return res.status(400).json({ error:
      t(localeOf(req), 'server.signupNeedsMail', { grund: b.grund })});
  }
  putSetting.run('registrierung', JSON.stringify(an));
  res.json(requestCard());
});

/* Die Freischaltung. AUS DER ANFRAGE WIRD EIN ZUGANG MIT DER ROLLE 'user' --
   die Rolle steht fest im Aufruf und wird an KEINER Stelle aus der Anfrage
   gelesen. NUR BESTAETIGTE ANFRAGEN, denn eine Nummer laesst sich tippen.
   ERST DER ZUGANG, DANN DER TOKEN, DANN DIE ZEILE WEG -- scheitert das
   Anlegen, bleibt die Anfrage stehen. Und dann erst der Versand. */
app.post('/api/requests/:id/approve', adminOnly, async (req, res) => {
  const a = auth.getRequest(req.params.id);
  if (!a || !a.bestaetigt_am)
    return res.status(404).json({ error: t(localeOf(req), 'server.requestUnknown')});
  let created, token;
  try {
    created = await auth.createUser(a.username, null, 'user', true, req.benutzer.id, a.email);
    token = auth.createToken(created.id, 'einladung', req.benutzer.id);
  } catch (e) { return res.status(400).json({ error: errorText(req, e) }); }
  auth.removeRequest(a.id);
  /* DIE ZEILE NENNT DEN NEUEN ZUGANG UND NICHT DEN NAMEN DES ANFRAGENDEN.
     Sie sagt etwas, was zugang.neu und link.neu daneben nicht sagen: dass
     dieser Zugang aus einer SELBSTANMELDUNG kam und nicht aus der Hand des
     Admins. */
  auth.log('anfrage.frei', { wer: req.benutzer.id, ziel: created.id });
  const v = await sendTokenLink({ username: created.username, email: created.email }, token);
  res.json({ ...created, token: token.plain, zweck: token.zweck, tage: token.tage,
             minuten: auth.TOKEN_DEADLINE_MINUTES, ...linkInfo(token.plain), ...v,
             ...requestCard() });
});

/* Die Ablehnung. DIE ZEILE IST WEG, UND ES ENTSTEHT NICHTS -- kein Zugang,
   kein Token, keine Mail. Eine Absagemail waere eine Benachrichtigung, und
   ein Weg, jemandem auf Zuruf Post zu schicken.
   DIE PROTOKOLLZEILE TRAEGT DEN NAMEN NICHT: sie haelt fest, WER abgelehnt
   hat und WANN -- der Name des Abgewiesenen ist Freitext von aussen. */
app.delete('/api/requests/:id', adminOnly, (req, res) => {
  const a = auth.getRequest(req.params.id);
  if (!a || !a.bestaetigt_am)
    return res.status(404).json({ error: t(localeOf(req), 'server.requestUnknown')});
  auth.removeRequest(a.id);
  auth.log('anfrage.ab', { wer: req.benutzer.id });
  res.json({ ok: true, ...requestCard() });
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
// Das Vokabular benennt die Oberflaeche um. Unter der Haube aendert sich
// nichts: Feldnamen in Datenbank und Export bleiben, damit aeltere
// Exportdateien einspielbar bleiben.
/* DIE VORGABEN DER VIERZEHN WOERTER STEHEN SEIT 0.24.0 IN DER SPRACHDATEI
   (Bauabschnitt 2, Konzept E9). Bis dahin standen sie ZWEIMAL im Quelltext --
   hier und als VOK_VORGABE in app.js; Stolperstein 47 nennt genau das:
   „doppelt gehaltene Vorgaben pruefen sich nur halb".
   ABGELEITET AUS DEM VORSATZ `vokabular.` und nicht als zweite Liste daneben:
   wer ein Wort hinzufuegt, fuegt es in der Datei hinzu, und beide Seiten
   sehen es.
   AUS DER SPRACHE DER INSTALLATION UND NICHT DER DES BENUTZERS -- Frage F3 des
   Auftrags, vom Betreiber am 5. September 2026 entschieden: es gibt EINEN Satz
   von vierzehn Woertern je Installation, wie den Titel. In dieser Runde ist
   das Deutsch; in Stufe 2 bleibt es die Sprache der Installation, auch wenn
   ein Benutzer die Oberflaeche umschaltet. */
const VOCABULARY_PREFIX = 'vocabulary.';
const vocabularyDefault = () => Object.fromEntries(
  Object.entries(LANGUAGES[LANGUAGE_DEFAULT])
    .filter(([k]) => k.startsWith(VOCABULARY_PREFIX))
    .map(([k, v]) => [k.slice(VOCABULARY_PREFIX.length), v]));

const FONT_LEVELS = [80, 90, 100, 110, 120];
/* DIE STUFEN DES BILDSTREIFENS, IN BILDPUNKTEN -- 0.22.0 (E11). Die Obergrenze
   150 ist keine Geschmacksfrage: das gespeicherte Vorschaubild hat 512 px auf
   der kurzen Kante, und darueber verliesse die Anzeige ihre Reserve. Kein
   Bestandslauf. */
const STRIP_LEVELS = [60, 80, 100, 120, 150];
/* DIE DREI STUFEN DES FARBSCHEMAS -- 0.23.0. DIE VORGABE IST `dunkel` UND
   NICHT `geraet`: wer nichts einstellt, sieht, was er heute sieht. „Wie das
   Geraet" ist eine ausdrueckliche Wahl und kein Rueckfall.
   DER SERVER KENNT ALLE DREI, DAS STILBLATT NUR ZWEI. `geraet` loest die
   Oberflaeche ueber matchMedia auf und schreibt `hell` oder `dunkel` an das
   Wurzelelement; stuende die dritte Stufe auch im Stilblatt, muesste jeder
   der vierzig Werte DREIMAL geschrieben werden -- in :root, im zweiten Block
   und noch einmal in einer Medienabfrage. */
const THEME_LEVELS = ['hell', 'dunkel', 'geraet'];
const THEME_DEFAULT = 'dunkel';

// Anordnung und Einklappzustand der Bloecke in der Detailansicht. Verschoben
// wird nur innerhalb des jeweiligen Bereichs, deshalb zwei getrennte Listen.
const BLOCK_VORGABE = {
  // VORHER STEHT VOR NACHHER: geschaetzt wird, bevor bewertet wird, und die
  // Anordnung sagt es. Wer eine gespeicherte Reihenfolge hat, bekommt den
  // neuen Block ueber sortArea() hinten angehaengt -- die vorhandene
  // Regel, und sie bleibt. Ziehen laesst er sich wie jeder andere.
  seite: ['kategorie', 'tags', 'potenzial', 'bewertung'],
  unten: ['beschreibung', 'testtage', 'links', 'dateien', 'kommentare']
};
const ALL_BLOCKS = [...BLOCK_VORGABE.seite, ...BLOCK_VORGABE.unten];

/* WELCHE BLOECKE IHREN EINKLAPPZUSTAND NICHT MEHR SPEICHERN -- 0.21.0.
   Fuer die beiden Sternkaesten entscheidet ab jetzt der ZUSTAND DES EINTRAGS,
   welcher offen steht: ungetestet -> Potenzial offen, getestet -> Bewertung
   offen. Ein Klick auf die Kopfzeile ist ein Blick und kein Befehl; er gilt,
   bis man den Eintrag verlaesst.
   DER GRUND IST DIE REICHWEITE: eine gespeicherte Einstellung gilt fuer ALLE
   Eintraege zugleich, ein Zustand fuer EINEN. „Ich klappe an Eintrag 12 den
   Potenzialkasten auf" hiesse sonst „an allen Eintraegen offen", und beim
   naechsten Eintrag stuende der falsche Kasten offen, ohne dass jemand
   wuesste, warum.
   EIN GESPEICHERTES `bewertung` AUS EINER AELTEREN FASSUNG FAELLT DAMIT STILL
   HERAUS -- gewollt: es ist eine Verhaltensaenderung, sie steht im
   Aenderungsprotokoll, und wer den Bewertungsblock heute dauerhaft zugeklappt
   hat, sieht ihn an getesteten Eintraegen wieder offen. */
const BLOCKS_WITHOUT_TO = ['potenzial', 'bewertung'];
const CLOSED_BLOCKS = ALL_BLOCKS.filter(k => !BLOCKS_WITHOUT_TO.includes(k));

// Unbekanntes fliegt raus, Fehlendes haengt sich in der Vorgabereihenfolge
// hinten an -- ein spaeter hinzugekommener Block taucht so von selbst auf.
function sortArea(stored, vorgabe) {
  const sauber = (Array.isArray(stored) ? stored : [])
    .filter((k, i, a) => vorgabe.includes(k) && a.indexOf(k) === i);
  return [...sauber, ...vorgabe.filter(k => !sauber.includes(k))];
}

// Persoenlich. Anordnung und Einklappzustand gelten global ueber alle
// Eintraege hinweg -- aber je Benutzer, nicht fuer alle gemeinsam.
function bloecke(userId) {
  const g = getUserSetting(userId, 'bloecke', null) || {};
  return {
    seite: sortArea(g.seite, BLOCK_VORGABE.seite),
    unten: sortArea(g.unten, BLOCK_VORGABE.unten),
    zu: (Array.isArray(g.zu) ? g.zu : []).filter(k => CLOSED_BLOCKS.includes(k))
  };
}

function vokabular() {
  const stored = getSetting('vokabular', null) || {};
  const out = {};
  for (const [k, vorgabe] of Object.entries(vocabularyDefault())) {
    const v = typeof stored[k] === 'string' ? stored[k].trim() : '';
    out[k] = v || vorgabe;   // leeres Feld faellt auf die Vorgabe zurueck
  }
  return out;
}
// Sichtbare Zeilen der Linkliste, bevor aufgeklappt werden muss.
const LINK_ROW_LEVELS = [3, 5, 8, 12];
// Persoenlich.
const linkZeilen = (userId) => {
  const n = Number(getUserSetting(userId, 'linkZeilen', 5));
  return LINK_ROW_LEVELS.includes(n) ? n : 5;
};
const timelineOn = (userId) => getUserSetting(userId, 'zeitleiste', true) !== false;

/* ---- Suchanbieter ---- */
// Fuer Linkzeilen, die keine Adresse sind. Gespeichert wird eine Vorlage mit
// %s als Platzhalter; der Rohtext bleibt roh in der Datenbank, deshalb folgen
// vorhandene Suchzeilen einem spaeteren Anbieterwechsel von selbst.
// Die Liste steht hier und nicht in app.js: der Server speichert Schluessel,
// also muss er die Liste kennen.
const SEARCH_PROVIDERS = [
  { schluessel: 'google',    name: 'Google',       vorlage: 'https://www.google.com/search?q=%s' },
  { schluessel: 'bing',      name: 'Bing',         vorlage: 'https://www.bing.com/search?q=%s' },
  { schluessel: 'ddg',       name: 'DuckDuckGo',   vorlage: 'https://duckduckgo.com/?q=%s' },
  { schluessel: 'startpage', name: 'Startpage',    vorlage: 'https://www.startpage.com/sp/search?query=%s' },
  { schluessel: 'brave',     name: 'Brave Search', vorlage: 'https://search.brave.com/search?q=%s' },
  { schluessel: 'ecosia',    name: 'Ecosia',       vorlage: 'https://www.ecosia.org/search?q=%s' }
];
const SEARCH_DEFAULT = SEARCH_PROVIDERS[0].vorlage;
// Drei Plaetze fuer eigene Anbieter. Der Schluessel haengt am Platz, nicht am
// Namen: sonst verloere ein Umbenennen den Standard und den Vorrat.
const OWN_SLOTS = 3;
const ownKey = (i) => `eigen${i + 1}`;
// Vier Namen a 20 Zeichen sind auf dem Handy die Obergrenze.
const SEARCH_NAME_LENGTH = 20;
const SEARCH_NAME_LEVELS = [1, 2, 3, 4];

// Nur http und https, und der Platzhalter muss vorkommen. Die Vorlage ist
// Eingabe aus dem Systembereich und landet in einem window.open -- ohne diese
// Schranke waere javascript:%s moeglich. Geprueft wird zweimal, hier beim
// Speichern und noch einmal in der Oberflaeche vor dem Oeffnen.
const searchTemplateOk = (v) =>
  typeof v === 'string' && v.length <= 300 &&
  /^https?:\/\/[^\s]+$/i.test(v) && v.includes('%s');

// Ein Anbietername ist freier Text und wird als Beschriftung gerendert -- die
// erste Stelle in der Linkliste, an der das gilt. Maskiert wird in der
// Oberflaeche; hier faellt nur weg, was die Zeile zerreissen wuerde.
const searchNameClean = (v) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, SEARCH_NAME_LENGTH) : '';

// Eigene Anbieter. Ein Platz zaehlt nur, wenn Name UND Vorlage dastehen --
// halb ausgefuellt gibt es ihn nicht, weder im Vorrat noch in der Auswahl.
function searchOwn() {
  const g = getSetting('sucheEigene', null);
  const out = [];
  for (let i = 0; i < OWN_SLOTS; i++) {
    const e = Array.isArray(g) ? g[i] : null;
    const name = searchNameClean(e && e.name);
    const vorlage = e && typeof e.vorlage === 'string' ? e.vorlage.trim() : '';
    // Halb ausgefuellt gibt es nicht. Dieselbe Regel steht noch einmal im
    // Schreibweg (dort mit 400); von aussen ist dieser Leseweg deshalb nur
    // ueber einen von Hand in die Datenbank gesetzten halben Platz erreichbar.
    out.push(name && searchTemplateOk(vorlage) ? { name, vorlage } : null);
  }
  return out;
}

// Alle neun Plaetze in kanonischer Reihenfolge: sechs eingebaute, dann die
// eigenen. `vorhanden` sagt, ob der Platz ueberhaupt jemanden traegt.
function allProviders() {
  const own = searchOwn();
  return [
    ...SEARCH_PROVIDERS.map(a => ({ ...a, eigen: false, vorhanden: true })),
    ...own.map((e, i) => ({
      schluessel: ownKey(i), name: e ? e.name : '',
      vorlage: e ? e.vorlage : '', eigen: true, vorhanden: !!e
    }))
  ];
}

// Der Vorrat: Liste der Schluessel, Standard zuerst. sucheAktiv[0] ist die
// einzige Wahrheit darueber, wer Standard ist.
function searchPool() {
  const alle = allProviders();
  const da = (k) => alle.some(a => a.schluessel === k && a.vorhanden);
  const stored = getSetting('sucheAktiv', null);
  // Hier faellt ein weggefallener Anbieter aus dem Vorrat -- war er der
  // Standard, rueckt damit keys[0] nach. ACHTUNG: dieselbe Wirkung hat die
  // Klemme in writePool; eine Gegenprobe muss beide zugleich zurueckbauen,
  // sonst bleibt sie gruen.
  let keys = Array.isArray(stored)
    ? stored.filter((k, i, a) => da(k) && a.indexOf(k) === i)
    : [];
  // Ein leerer Vorrat macht jede Suchzeile unbenutzbar: mindestens einer
  // bleibt drin, und das ist im Zweifel der eingebaute erste.
  if (!keys.length) keys = [SEARCH_PROVIDERS[0].schluessel];
  return keys;
}

// Was die Oberflaeche braucht: alle neun Plaetze mit Vorrat- und
// Standardkennzeichnung, in kanonischer Reihenfolge. Wer angezeigt wird und
// in welcher Reihenfolge, entscheidet allein `aktiv` und `standard`.
function suchAnbieter() {
  const pool = searchPool();
  return allProviders().map(a => ({
    schluessel: a.schluessel, name: a.name, vorlage: a.vorlage,
    eigen: a.eigen, vorhanden: a.vorhanden,
    aktiv: pool.includes(a.schluessel),
    standard: pool[0] === a.schluessel
  }));
}

// Vorlage des Standardanbieters, nur fuer die Antwort an die Oberflaeche.
function searchTemplate() {
  const pool = searchPool();
  const treffer = allProviders().find(a => a.schluessel === pool[0]);
  return treffer && searchTemplateOk(treffer.vorlage) ? treffer.vorlage : SEARCH_DEFAULT;
}

// Schreibt den Vorrat, normalisiert: Standard zuerst, die uebrigen in
// kanonischer Reihenfolge. Damit gibt es nur eine Aussage ueber die
// Reihenfolge und nicht zwei, die sich widersprechen koennen.
function writePool(standard, active) {
  const alle = allProviders();
  const da = (k) => alle.some(a => a.schluessel === k && a.vorhanden);
  let set = active.filter(da);
  // Zweite Schicht des Nachrueckens, siehe den Hinweis in searchPool.
  if (!da(standard)) standard = set[0] || SEARCH_PROVIDERS[0].schluessel;
  if (!set.includes(standard)) set.push(standard);
  const rest = alle.map(a => a.schluessel)
    .filter(k => k !== standard && set.includes(k));
  putSetting.run('sucheAktiv', JSON.stringify([standard, ...rest]));
}

// Zahl der Namen unter einer Suchzeile -- persoenlich, als einzige der vier
// Sucheinstellungen. Vorrat, eigene Anbieter und Startanbieter bleiben global
// und Sache des Admins: der Admin kuratiert, der Benutzer bestimmt die Dichte.
const suchNamen = (userId) => {
  const n = Number(getUserSetting(userId, 'suchNamen', 2));
  return SEARCH_NAME_LEVELS.includes(n) ? n : 2;
};

// Persoenlich.
const fontSize = (userId) => {
  const n = Number(getUserSetting(userId, 'schrift', 100));
  return FONT_LEVELS.includes(n) ? n : 100;
};
// Persoenlich, wie die Schrift: das Farbschema (0.23.0). Dieselbe Maschine --
// ein Wert je Zugang, ein Wert fuer alle Geraete.
const theme = (userId) => {
  const s = String(getUserSetting(userId, 'thema', THEME_DEFAULT));
  return THEME_LEVELS.includes(s) ? s : THEME_DEFAULT;
};
// Persoenlich, wie die Schrift: die Kachelgroesse im Bildstreifen (0.22.0).
const strip = (userId) => {
  const n = Number(getUserSetting(userId, 'streifen', 80));
  return STRIP_LEVELS.includes(n) ? n : 80;
};

/* --- Der Bezugspunkt der Glocke ------------------------------------------
   Persoenlich, wie der Favorit. NULL heisst "noch nie gesetzt", und das ist ein
   eigener Zustand: dann gibt es keine Glocke. Alles fuer neu zu erklaeren waere
   eine Behauptung, und der erste Blick in die Uebersicht laeutete fuer den
   ganzen Bestand.
   BIS 0.17.0 STAND EIN ZWEITER MERKER DANEBEN: `zuletztGesehen` fuer die Pille
   „Neu seit ...". Die Pille ist gestrichen -- zwei Anzeigen fuer dieselbe
   Frage sind eine zu viel --, und der Merker mit ihr. Der Vermerk steht hier,
   damit ihn niemand als Luecke wieder einbaut. */
const glockeGesehen = (userId) => getUserSetting(userId, 'glockeGesehen', null);

/* --- Die gespeicherten Ansichten -----------------------------------------
   MEHRERE BENANNTE FILTERSTELLUNGEN NEBEN DER EINEN, DIE ES SCHON GIBT.
   `filters` bleibt die zuletzt benutzte Stellung; die Ansichten stehen
   daneben und werden nur auf Zuruf gelesen. PERSOENLICH, GANZ.

   IN settings UND NICHT IN EINER EIGENEN TABELLE. Der Preis steht dabei:
   JSON kennt keine Kaskade, eine geloeschte Kategorie bleibt als Nummer
   stehen -- uebergangen wird das beim ANWENDEN und nicht beim Lesen.

   DER SUCHBEGRIFF GEHOERT DAZU. GEPRUEFT WIRD DIE FORM, NICHT DER INHALT:
   Deckel, Name und Groesse ja, welche Nummern es gibt weiss die Oberflaeche. */
const VIEWS_CAP = 8;
const VIEW_NAME_LENGTH = 40;
const VIEW_TERM_LENGTH = 200;
const VIEWS_CHARS = 8000;
const ansichten = (userId) => {
  const w = getUserSetting(userId, 'ansichten', []);
  return Array.isArray(w) ? w : [];
};

// Die Antwort mischt beide Haelften; die Oberflaeche merkt davon nichts.
// Persoenlich sind filters, ansichten, schrift, bloecke, linkZeilen,
// zeitleiste und suchNamen; global bleiben vokabular und die drei
// Sucheinstellungen.
// Dazu drei ABGELEITETE Angaben, keine Einstellungen -- sie lassen sich nicht
// schreiben:
//   benutzerZahl: bei genau einem Zugang entfaellt die Durchschnittsspalte.
//     Geliefert wird die ZAHL, die Schwelle entscheidet die Oberflaeche.
//     Gezaehlt werden nur ZUGAENGE, DIE ES NOCH GIBT -- ein Grabstein ist kein
//     zweiter Bewerter.
//   Adminfrage: kommt aus req.benutzer, ausdruecklich NICHT aus holeBenutzer()
//     -- das lieferte den ERSTEN Benutzer, nicht den angemeldeten.
//   Eigentuemerfrage: erspart der Oberflaeche eine zweite Wahrheit darueber,
//     wem die Instanz gehoert.
const qUserCount = db.prepare("SELECT COUNT(*) AS n FROM users WHERE status != 'geloescht'");

app.get('/api/settings', (req, res) => res.json({
  benutzerZahl: qUserCount.get().n,
  // Der eigene Name fuer die Kopfzeile. Er steht auch in GET /api/account --
  // das ist keine zweite Wahrheit, beide lesen dieselbe angemeldete Zeile.
  // Hier, weil ladeEinstellungen() beim Start ohnehin laeuft und die Kopfzeile
  // ihn damit ohne zweiten Abruf hat.
  name: req.benutzer.username,
  istAdmin: istAdmin(req),
  istEigentuemer: istEigentuemer(req),
  filters: getUserSetting(req.benutzer.id, 'filters', null),
  ansichten: ansichten(req.benutzer.id),
  // Der Deckel kommt vom Server, damit die Zahl an einer Stelle steht: die
  // Oberflaeche laesst danach den Knopf zum Speichern weg, und der Server
  // verweigert es ohnehin.
  ansichtenDeckel: VIEWS_CAP,
  vokabular: vokabular(),
  schrift: fontSize(req.benutzer.id),
  streifen: strip(req.benutzer.id),
  thema: theme(req.benutzer.id),
  bloecke: bloecke(req.benutzer.id),
  linkZeilen: linkZeilen(req.benutzer.id),
  zeitleiste: timelineOn(req.benutzer.id),
  /* DER BEZUGSPUNKT DER GLOCKE. Bis einschliesslich 0.16.0 stand
     `zuletztGesehen` daneben, der Merker der Pille „Neu seit ..."; er faellt
     mit ihr weg. Eine Antwort, die ein Feld weniger traegt, ist kein Bruch:
     die Oberflaeche wird im selben Dateisatz ausgeliefert. */
  glockeGesehen: glockeGesehen(req.benutzer.id),
  suche: searchTemplate(),
  suchAnbieter: suchAnbieter(),
  suchNamen: suchNamen(req.benutzer.id),
  // Abgeleitet beim Lesen, nicht in der Datenbank nachgetragen. Die Oberflaeche
  // laesst danach die Zeile "+ neu anlegen" weg; die Auswahl aus dem
  // Vorhandenen bleibt in jedem Fall stehen.
  tagsFreiAnlegen: freeCreate('tagsFreiAnlegen'),
  kategorienFreiAnlegen: freeCreate('kategorienFreiAnlegen'),
  /* DER SCHALTER DER BILDABLAGE, seit 0.19.0. Er steht in DIESER Antwort und
     nicht nur in /api/stats: die Karte im Reiter „Datenbank" zeigt ihn, aber
     die Stellung ist eine EINSTELLUNG und keine Kennzahl. Gelesen wird er
     ohnehin serverseitig -- die Antwort hier sagt der Karte nur, wo der Haken
     steht. Ausgeliefert an jeden, geschrieben nur vom Eigentuemer: die
     Stellung ist nichts Schuetzenswertes, sie steht auch an der Formatzeile
     der Kennzahlen ablesbar da. */
  bilderUmwandeln: bilderUmwandeln(),
  /* Fragt die zweite Bestaetigung bei DIESEM Zugang zusaetzlich den Code?
     Gebraucht wird es ausserhalb des Systembereichs -- das
     Bestaetigungsfenster steht auch vor Export und Import, und ohne die
     Angabe muesste es den ersten Versuch absichtlich scheitern lassen.
     NUR EIN JA/NEIN. */
  zweifaktor: auth.twoFactorOn(req.benutzer.id),
  // Die Frist des Papierkorbs. Sie steht HIER und nicht nur in
  // GET /api/trash: den Loeschdialog sieht jeder, die Karte nur der
  // Admin. Eine Zahl, die die Oberflaeche selbst mitbraechte, waere eine
  // zweite Wahrheit ueber dieselbe Frist.
  papierkorbTage: TRASH_DAYS
}));

app.put('/api/settings', (req, res) => {
  /* Die Antwort mischt zwei Haelften, die Rechte auch: persoenliche
     Schluessel schreibt jeder fuer sich, Vokabular und Suchanbieter gehoeren
     dem Admin. ABGELEITET AUS EINER LISTE -- was nicht persoenlich ist, ist
     Adminsache, auch jeder Schluessel, der spaeter dazukommt.
     GEPRUEFT VOR DEM ERSTEN SCHREIBEN. */
  const foreign = Object.keys(req.body || {}).filter(k => !PERSONAL_KEYS.includes(k));
  if (foreign.length && !istAdmin(req))
    return res.status(403).json({ error: t(localeOf(req), DENIED_ADMIN)});
  /* DIE ENGERE FRAGE STEHT DANEBEN UND NICHT ANSTELLE DER OBEREN: was dem
     Eigentuemer gehoert, ist auch Adminsache -- nur eben nicht jedem Admin.
     BEIDE VOR DEM ERSTEN SCHREIBEN, aus demselben Grund wie die Ansichten
     weiter unten: eine Absage, die schon etwas geschrieben hat, waere
     schlimmer als gar keine. */
  const ownerOnly2 = Object.keys(req.body || {}).filter(k => OWNER_KEYS.includes(k));
  if (ownerOnly2.length && !istEigentuemer(req))
    return res.status(403).json({ error: t(localeOf(req), DENIED_OWNER)});

  /* DIE BEIDEN WERTE DER AUFRAEUMREGEL WERDEN HIER GEPRUEFT UND ERST WEITER
     UNTEN GESCHRIEBEN -- aus demselben Grund wie die Ansichten darunter: eine
     Absage, die schon etwas geschrieben hat, waere schlimmer als gar keine.
     DIE GRENZEN STEHEN AM SERVER UND NICHT NUR IM EINGABEFELD (Entscheidung 1
     der Runde 0.20.0): `min`/`max` im HTML ist eine Bitte, keine Klemme.
     GEPRUEFT MIT DERSELBEN FUNKTION WIE DIE VORSCHAU UND DAS LOESCHEN -- eine
     zweite Spanne daneben liefe auseinander. */
  const ruleValues = {};
  for (const [k, range, was] of [['sicherungBehalten', CLEANUP_KEEP, 'server.ruleKeep'],
                                  ['sicherungTage', CLEANUP_DAYS, 'server.ruleDays']]) {
    if (req.body[k] === undefined) continue;
    const g = checkRuleValue(req.body[k], range, was);
    if (g.fehler) return res.status(400).json({ error: t(localeOf(req), g.fehler, g.values) });
    ruleValues[k] = g.wert;
  }

  /* DIE ANSICHTEN WERDEN HIER GEPRUEFT UND ERST WEITER UNTEN GESCHRIEBEN --
     VOR dem ersten putUserSetting: eine Absage, die `filters` schon
     geschrieben hat, waere schlimmer als gar keine.
     GEPRUEFT WIRD DIE GANZE LISTE AUF EINMAL -- es ist EIN Schluessel mit
     EINEM Wert. */
  let viewsText = null;
  if (req.body.ansichten !== undefined) {
    const ein = Array.isArray(req.body.ansichten) ? req.body.ansichten : [];
    if (ein.length > VIEWS_CAP)
      return res.status(400).json({
        error: t(localeOf(req), 'server.viewCap', { deckel: VIEWS_CAP })});
    const sauber = [];
    const namen = new Set();
    for (const a of ein) {
      const name = a && typeof a.name === 'string'
        ? a.name.trim().slice(0, VIEW_NAME_LENGTH) : '';
      // Halb ausgefuellt gibt es nicht -- und wortlos verschlucken erst recht
      // nicht, sonst sucht man die Ansicht spaeter in der Liste.
      if (!name)
        return res.status(400).json({ error: t(localeOf(req), 'server.viewNameMissing')});
      /* ZWEI ANSICHTEN MIT DEMSELBEN NAMEN SIND EINE ZU VIEL: der Name ist
         das Einzige, woran ein Mensch sie auseinanderhaelt. Verglichen wird
         ohne Ruecksicht auf Gross- und Kleinschreibung -- "Bosch" und "bosch"
         nebeneinander waeren dieselbe Falle mit einem Buchstaben Abstand. */
      const schluessel = name.toLowerCase();
      if (namen.has(schluessel))
        return res.status(400).json({ error: t(localeOf(req), 'server.viewExists', { name })});
      namen.add(schluessel);
      sauber.push({
        name,
        q: a && typeof a.q === 'string' ? a.q.slice(0, VIEW_TERM_LENGTH) : '',
        filters: a && a.filters && typeof a.filters === 'object' ? a.filters : null
      });
    }
    viewsText = JSON.stringify(sauber);
    if (viewsText.length > VIEWS_CHARS)
      return res.status(400).json({ error: t(localeOf(req), 'server.viewsTooBig')});
  }

  if (req.body.filters !== undefined)
    putUserSetting(req.benutzer.id, 'filters', JSON.stringify(req.body.filters));
  if (viewsText !== null)
    putUserSetting(req.benutzer.id, 'ansichten', viewsText);
  if (req.body.vokabular !== undefined) {
    const ein = req.body.vokabular || {};
    const sauber = {};
    const vorgabe = vocabularyDefault();
    for (const k of Object.keys(vorgabe)) {
      const v = typeof ein[k] === 'string' ? ein[k].trim().slice(0, 40) : '';
      sauber[k] = v || vorgabe[k];
    }
    putSetting.run('vokabular', JSON.stringify(sauber));
  }
  if (req.body.schrift !== undefined) {
    const n = Number(req.body.schrift);
    if (!FONT_LEVELS.includes(n))
      return res.status(400).json({ error: t(localeOf(req), 'server.fontUnknown')});
    putUserSetting(req.benutzer.id, 'schrift', JSON.stringify(n));
  }
  if (req.body.streifen !== undefined) {
    const n = Number(req.body.streifen);
    if (!STRIP_LEVELS.includes(n))
      return res.status(400).json({ error: t(localeOf(req), 'server.stripUnknown')});
    putUserSetting(req.benutzer.id, 'streifen', JSON.stringify(n));
  }
  /* DIE KLEMME STEHT AM SERVER UND NICHT NUR IN DER PILLENREIHE -- dieselbe
     Bauform wie bei der Schrift daruber. Eine Auswahl in der Oberflaeche ist
     eine Bitte; was in user_settings landet, entscheidet diese Zeile. */
  if (req.body.thema !== undefined) {
    const s = String(req.body.thema);
    if (!THEME_LEVELS.includes(s))
      return res.status(400).json({ error: t(localeOf(req), 'server.themeUnknown')});
    putUserSetting(req.benutzer.id, 'thema', JSON.stringify(s));
  }
  if (req.body.bloecke !== undefined) {
    const ein = req.body.bloecke || {};
    putUserSetting(req.benutzer.id, 'bloecke', JSON.stringify({
      seite: sortArea(ein.seite, BLOCK_VORGABE.seite),
      unten: sortArea(ein.unten, BLOCK_VORGABE.unten),
      zu: (Array.isArray(ein.zu) ? ein.zu : []).filter(k => CLOSED_BLOCKS.includes(k))
    }));
  }
  if (req.body.linkZeilen !== undefined) {
    const n = Number(req.body.linkZeilen);
    if (!LINK_ROW_LEVELS.includes(n))
      return res.status(400).json({ error: t(localeOf(req), 'server.linkRowsUnknown')});
    putUserSetting(req.benutzer.id, 'linkZeilen', JSON.stringify(n));
  }
  if (req.body.zeitleiste !== undefined)
    putUserSetting(req.benutzer.id, 'zeitleiste', JSON.stringify(!!req.body.zeitleiste));
  /* DER MERKZEITPUNKT KOMMT VON DER SERVERUHR, NIE VOM AUFRUFER. Was der
     Aufrufer schickt, ist ein Signal ("ich habe die Tafel geoeffnet") und keine
     Feststellung -- eine mitgeschickte Zeit waere eine Behauptung.
     UND SIE WIRD UM EINE SEKUNDE NACHGESTELLT: datetime('now') loest nur
     Sekunden auf, und ein Kommentar aus DERSELBEN Sekunde gaelte sonst nie
     als neu. Lieber einen Eintrag zweimal zeigen als einen verschlucken.
     BIS EINSCHLIESSLICH 0.16.0 STAND DERSELBE WEG FUER `zuletztGesehen`
     DARUEBER, den Merker der Pille „Neu seit ...". Sie ist gestrichen, und ein
     Feld, das niemand mehr setzt, wird auch nicht mehr entgegengenommen.
     UEBER PUT /api/settings UND NICHT UEBER EINEN EIGENEN WEG: es ist eine
     persoenliche Einstellung wie jede andere hier, und eine eigene schreibende
     Route liesse F_ROUTEN wachsen, ohne dass es etwas Neues zu bewachen gaebe.
     GESETZT WIRD BEIM ERSTEN VERLASSEN DER UEBERSICHT UND DANACH BEIM OEFFNEN
     DER TAFEL -- das entscheidet die Oberflaeche. Der Server nimmt das Signal
     entgegen und setzt seine Uhr. */
  if (req.body.glockeGesehen !== undefined)
    putUserSetting(req.benutzer.id, 'glockeGesehen',
      JSON.stringify(db.prepare(`SELECT datetime('now', '-1 second') AS t`).get().t));
  // Eigene Anbieter zuerst: ein frisch angelegter muss im selben Zug in den
  // Vorrat aufgenommen werden koennen.
  if (req.body.sucheEigene !== undefined) {
    const ein = Array.isArray(req.body.sucheEigene) ? req.body.sucheEigene : [];
    const sauber = [];
    for (let i = 0; i < OWN_SLOTS; i++) {
      const e = ein[i] || {};
      const name = searchNameClean(e.name);
      const vorlage = typeof e.vorlage === 'string' ? e.vorlage.trim() : '';
      if (!name && !vorlage) { sauber.push(null); continue; }   // Platz geraeumt
      // Halb ausgefuellt gibt es nicht -- und wortlos verschlucken erst recht
      // nicht, sonst sucht man den Anbieter spaeter in der Liste.
      if (!name)
        return res.status(400).json({ error: t(localeOf(req), 'server.searchEngineName')});
      if (!searchTemplateOk(vorlage))
        return res.status(400).json({
          error: t(localeOf(req), 'server.searchUrlForm')});
      sauber.push({ name, vorlage });
    }
    putSetting.run('sucheEigene', JSON.stringify(sauber));
    // Faellt ein Anbieter weg, der im Vorrat oder sogar Standard war, raeumt
    // das Zurueckschreiben das auf: der erste aktive rueckt nach.
    const pool = searchPool();
    writePool(pool[0], pool);
  }
  // Der Vorrat kommt als Liste von Schluesseln, Standard zuerst. Unbekannte
  // Schluessel und einen Standard ausserhalb des Vorrats richtet
  // writePool gerade.
  if (req.body.sucheAktiv !== undefined) {
    const alle = allProviders();
    const ein = (Array.isArray(req.body.sucheAktiv) ? req.body.sucheAktiv : [])
      .filter(k => typeof k === 'string' && alle.some(a => a.schluessel === k && a.vorhanden));
    // Den letzten aus dem Vorrat zu nehmen macht jede Suchzeile unbenutzbar.
    // Ersatzweise auf den eingebauten ersten zu wechseln waere schlimmer als
    // eine Absage: es hiesse, ab jetzt wortlos woanders zu suchen.
    if (!ein.length)
      return res.status(400).json({ error: t(localeOf(req), 'server.searchEngineLast')});
    writePool(ein[0], ein);
  }
  if (req.body.suchNamen !== undefined) {
    const n = Number(req.body.suchNamen);
    if (!SEARCH_NAME_LEVELS.includes(n))
      return res.status(400).json({ error: t(localeOf(req), 'server.searchNamesUnknown')});
    putUserSetting(req.benutzer.id, 'suchNamen', JSON.stringify(n));
  }
  // Die beiden Anlegen-Schalter sind global und damit Adminsache -- ueber die
  // Ableitung ganz oben, ohne zweite Liste und ohne eigene Route.
  for (const k of ['tagsFreiAnlegen', 'kategorienFreiAnlegen'])
    if (req.body[k] !== undefined) putSetting.run(k, JSON.stringify(!!req.body[k]));
  /* DER SCHALTER DER BILDABLAGE. Er geht denselben Weg wie die beiden
     darueber -- eine eigene schreibende Route liesse F_ROUTEN wachsen, ohne
     dass es etwas Neues zu bewachen gaebe. Die Rechtefrage steht ganz oben in
     EINER Zeile (OWNER_KEYS) und nicht hier ein zweites Mal. */
  if (req.body.bilderUmwandeln !== undefined)
    putSetting.run('bilderUmwandeln', JSON.stringify(!!req.body.bilderUmwandeln));
  /* DIE AUFRAEUMREGEL DER SICHERUNGEN, 0.20.0 -- derselbe Weg, dieselbe
     Rechtezeile (OWNER_KEYS ganz oben), und die beiden Zahlen
     sind oben schon geprueft. DER SCHALTER STEHT AUF AUS, wenn nichts
     dasteht: abgeleitet beim Lesen in cleanupStatus(), ohne Migrationscode. */
  if (req.body.sicherungAufraeumen !== undefined)
    putSetting.run('sicherungAufraeumen', JSON.stringify(!!req.body.sicherungAufraeumen));
  for (const [k, v] of Object.entries(ruleValues)) putSetting.run(k, JSON.stringify(v));
  res.json({ filters: getUserSetting(req.benutzer.id, 'filters', null), vokabular: vokabular(),
             ansichten: ansichten(req.benutzer.id), ansichtenDeckel: VIEWS_CAP,
             schrift: fontSize(req.benutzer.id), streifen: strip(req.benutzer.id),
             thema: theme(req.benutzer.id),
             bloecke: bloecke(req.benutzer.id),
             linkZeilen: linkZeilen(req.benutzer.id), zeitleiste: timelineOn(req.benutzer.id),
             suche: searchTemplate(), suchAnbieter: suchAnbieter(),
             suchNamen: suchNamen(req.benutzer.id),
             tagsFreiAnlegen: freeCreate('tagsFreiAnlegen'),
             kategorienFreiAnlegen: freeCreate('kategorienFreiAnlegen'),
             bilderUmwandeln: bilderUmwandeln() });
});

/* ---- Bewertungskriterien (Skala fest 1-5) ---- */

/* --- Das Gewicht eines Kriteriums ----------------------------------------
   DER GUELTIGE BEREICH STEHT GENAU HIER. Zwei Schreibwege fuehren darauf --
   Verwaltung und Import; stuende die Spanne an beiden, liefen sie auseinander.
   Aus demselben Grund steht sie NICHT als CHECK in der DDL: das waere eine
   dritte Stelle, und sie meldete sich nicht als Absage, sondern als
   abgebrochene Schreibung.
   NUR POSITIVE WERTE: bei 0 waere der Nenner eines Eintrags, an dem nur
   dieses Kriterium bewertet ist, null. Ein negatives Gewicht kehrte die
   Aussage um und braeche die Zusicherung, dass der Gesamtschnitt zwischen 1
   und 5 liegt.
   In der Schnittstelle steht eine ZAHL, kein Text. */
const WEIGHT_MIN = 0.2, GEWICHT_MAX = 2.0;

/* ZU WELCHEM KASTEN EIN KRITERIUM GEHOEREN KANN -- 0.21.0. 'vorher' ist das
   Potenzial (die Einschaetzung, bevor etwas ausprobiert wurde), 'nachher' die
   Bewertung (das Urteil danach).
   DIE LISTE STEHT GENAU EINMAL, HIER UND NICHT AUCH IN db.js. Ein CHECK an der
   Spalte truege dieselbe Menge ein zweites Mal, und die zweite meldete sich
   nicht als Absage mit Message, sondern als abgebrochene Schreibung --
   dieselbe Ueberlegung wie bei WEIGHT_MIN/GEWICHT_MAX eine Zeile darueber.
   DEUTSCH, UND NICHT 'before'/'after': die Werte stehen in SELECTs, die
   jemand liest, und der Sprachwaechter liest mit. */
const PHASES = ['vorher', 'nachher'];
const PHASE_DEFAULT = 'nachher';

/* ABGEWIESEN WIRD, WAS ETWAS ANDERES BEDEUTET -- GERUNDET WIRD, WAS DASSELBE
   BEDEUTET. Wer 5 eintippt, meint 5; den Wert still auf 2 zu ziehen hiesse,
   eine andere Aussage zu speichern als die eingegebene. 1,234 und 1,23 sind
   dagegen dieselbe Aussage.
   Das ist bewusst nicht dieselbe Haltung wie beim Bewertungswert, der mit
   Math.max(0, Math.min(5, ...)) zurechtgebogen wird: der kommt aus einem
   Sterne-Widget, das gar nichts anderes senden kann. Ein Gewicht wird von
   Hand getippt. */
function validWeight(roh) {
  const g = Number(roh);
  if (!Number.isFinite(g) || g < WEIGHT_MIN || g > GEWICHT_MAX) return null;
  // Auf Hundertstel festlegen. Nicht als Schranke gedacht, sondern gegen den
  // Rest der Gleitkommarechnung: 1.2000000000000002 hat niemand eingegeben.
  return Math.round(g * 100) / 100;
}

/* EINE ZAHL IN EINER MELDUNG -- seit 0.24.0 aus der Sprache und nicht mehr
   aus einem festen Zeichen (Bauabschnitt 4). "zwischen 0.2 und 2" waere ein
   Punkt mitten in einem deutschen Satz; welches Zeichen richtig ist, weiss
   aber die Sprache und nicht dieser Code.
   OHNE GRUPPIERUNG, wie in der Oberflaeche: aus "1234" darf nicht "1.234"
   werden. Hoechstens zwei Nachkommastellen, mindestens keine -- die Gewichte
   dieser Meldungen haben genau diese Form. */
const zahl = (n, locale = LANGUAGE_DEFAULT) => new Intl.NumberFormat(
  localeTag(locale), { maximumFractionDigits: 2, useGrouping: false })
  .format(Number(n) || 0);

// Die Reihenfolge ist frei bestimmbar und gilt ueberall gleich.
//
// COUNT(DISTINCT r.item_id), nicht COUNT(*): die Oberflaeche beschriftet diese
// Zahl mit dem Vokabelwort fuer Eintraege, und ab dem zweiten Bewerter sind
// Zeile und Eintrag nicht mehr dasselbe. Sie steht neben dem Loeschknopf, also
// genau dort, wo sie die Entscheidung tragen soll.
// value > 0 bleibt: ein zurueckgesetztes Kriterium ist keine Verwendung.
// gewicht steht mit in der Liste -- ohne die Angabe stuende im Eingabefeld bei
// jedem Neuaufbau wieder die Vorgabe.
// phase steht mit in der Liste -- die Oberflaeche teilt sie danach in ihre
// beiden Karten. Die Reihenfolge bleibt sort_order, id ueber BEIDE Kaesten:
// wer je Phase filtert, bekommt sie damit in sich richtig sortiert, ohne dass
// hier eine zweite Ordnung stuende.
const qCriteria = db.prepare(`
  SELECT c.id, c.name, c.sort_order, c.gewicht, c.phase, c.created_at,
         (SELECT COUNT(DISTINCT r.item_id) FROM ratings r
           WHERE r.criterion_id = c.id AND r.value > 0) AS usage_count
  FROM rating_criteria c ORDER BY c.sort_order, c.id`);

/* --- Die Kriterien gehoeren dem Admin -------------------------------------
   Was an allen Eintraegen aller Benutzer erscheint, gehoert dem Admin: ein
   neues Kriterium erscheint sofort an jedem Eintrag, ein geloeschtes nimmt
   ueberall die vergebenen Sterne mit. Alle vier Wege liegen deshalb hinter
   derselben Klemme -- anlegen, umbenennen, sortieren, loeschen.
   EIN benannter Waechter fuer vier Routen, nicht vier Abfragen; er deckt von
   oben aus auch Titel, Tags und Kategorien mit ab. */

app.get('/api/criteria', (req, res) => res.json(qCriteria.all()));

// KEIN Gewicht beim Anlegen. Ein neues Kriterium startet auf 1,0 -- der Wert
// steht in der DDL -- und wird danach in der Zeile eingestellt. Ein Feld
// weniger im Anlegeweg, und die Vorgabe steht nur an einer Stelle.
app.post('/api/criteria', adminOnly, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  /* DIE PHASE IST FREIWILLIG UND HAT DIE VORGABE 'nachher' -- so legt die
     Karte „Bewertungskriterien" weiter an, ohne ein Feld mitzuschicken.
     ETWAS ANDERES ALS DIE ZWEI WERTE IST EINE ABSAGE MIT MELDUNG und nicht
     ein stilles Zurechtbiegen: wer 'spaeter' schickt, meint etwas, das es
     nicht gibt, und ein auf 'nachher' gebogenes Kriterium stuende danach im
     falschen Kasten, ohne dass es jemand saehe. */
  const phase = req.body.phase === undefined ? PHASE_DEFAULT : String(req.body.phase);
  if (!PHASES.includes(phase))
    return res.status(400).json({ error: t(localeOf(req), 'server.criterionEitherOr')});
  // UNIQUE(name) IST GLOBAL: ein Name, ein Kasten. Die Frage kennt deshalb
  // keine Phase -- „Wunsch" gibt es einmal oder gar nicht.
  if (db.prepare('SELECT 1 FROM rating_criteria WHERE name = ? COLLATE NOCASE').get(name))
    return res.status(409).json({ error: t(localeOf(req), 'server.criterionExists')});
  const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM rating_criteria').get().m + 1;
  const i = db.prepare('INSERT INTO rating_criteria (name, sort_order, phase) VALUES (?, ?, ?)')
    .run(name, pos, phase);
  res.status(201).json(db.prepare('SELECT * FROM rating_criteria WHERE id = ?').get(i.lastInsertRowid));
});

// Muss vor '/api/criteria/:id' stehen, sonst faengt der Platzhalter das Wort
// "order" als Id ab.
app.put('/api/criteria/order', adminOnly, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE rating_criteria SET sort_order = ? WHERE id = ?');
  db.transaction(() => ids.forEach((cid, i) => s.run(i, cid)))();
  renumberCriteria();   // schliesst Luecken, falls nicht alle Ids mitkamen
  res.json(qCriteria.all());
});

app.put('/api/criteria/:id', adminOnly, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  /* DER KASTEN LAESST SICH NACH DEM ANLEGEN NICHT MEHR WECHSELN, und der
     Versuch wird ABGEWIESEN und nicht still uebergangen: ein uebergangenes
     Feld sieht fuer den Aufrufer aus wie ein gesetztes.
     WARUM ES IHN NICHT GIBT: ein Wechsel truege die vergebenen Sterne von
     einem Durchschnitt in den anderen -- beide Kopfzahlen aenderten sich, und
     zwar ohne dass irgendwo eine Bewertung angefasst worden waere. Loeschen
     und neu anlegen tut dasselbe SICHTBAR: die Sterne gehen dabei mit.
     DIE PRUEFUNG STEHT VOR JEDER SCHREIBUNG -- die Absage darf nicht auf ein
     schon umbenanntes Kriterium folgen. */
  if (req.body.phase !== undefined)
    return res.status(400).json({ error: t(localeOf(req), 'server.criterionKindFixed')});
  if (!db.prepare('SELECT 1 FROM rating_criteria WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: t(localeOf(req), 'server.criterionGone')});
  const clash = db.prepare('SELECT id FROM rating_criteria WHERE name = ? COLLATE NOCASE AND id != ?')
    .get(name, req.params.id);
  if (clash) return res.status(409).json({ error: t(localeOf(req), 'server.nameExists')});
  // Das Gewicht ist FREIWILLIG: das Umbenennen schickt nur den Namen und darf
  // das Gewicht nicht mit anfassen. Ohne diese Unterscheidung setzte jedes ✎
  // die Gewichtung still auf die Vorgabe zurueck.
  let gewicht = null;
  if (req.body.gewicht !== undefined) {
    gewicht = validWeight(req.body.gewicht);
    if (gewicht === null) return res.status(400).json({
      error: t(localeOf(req), 'server.weightRange',
        { min: zahl(WEIGHT_MIN, localeOf(req)), max: zahl(GEWICHT_MAX, localeOf(req)) })});
  }
  // Name und Gewicht in EINEM UPDATE: zwei Anweisungen hintereinander koennten
  // halb durchlaufen. COALESCE laesst das Gewicht stehen, wenn keines kam.
  db.prepare('UPDATE rating_criteria SET name = ?, gewicht = COALESCE(?, gewicht) WHERE id = ?')
    .run(name, gewicht, req.params.id);
  res.json(db.prepare('SELECT * FROM rating_criteria WHERE id = ?').get(req.params.id));
});

app.delete('/api/criteria/:id', adminOnly, (req, res) => {
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
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  const found = db.prepare('SELECT * FROM product_categories WHERE name = ? COLLATE NOCASE').get(name);
  if (found) return res.json(found);
  // HINTER dem Nachschlagen: eine VORHANDENE Kategorie zuzuweisen bleibt fuer
  // jeden offen, nur ein NEUER Name haengt am Schalter. Stuende die Klemme
  // davor, naehme sie das Zuweisen mit.
  if (!mayCreate(req, 'kategorienFreiAnlegen'))
    return res.status(403).json({ error: t(localeOf(req), DENIED_CATEGORY_NEW)});
  const i = db.prepare('INSERT INTO product_categories (name) VALUES (?)').run(name);
  res.status(201).json(db.prepare('SELECT * FROM product_categories WHERE id = ?').get(i.lastInsertRowid));
});

// Umbenennen und loeschen wirkt auf JEDEN Eintrag, der die Kategorie
// traegt -- also Adminsache, wie bei den Kriterien. Das ANLEGEN haengt am
// Schalter kategorienFreiAnlegen, Vorgabe an; zuweisen darf immer jeder.
app.put('/api/product-categories/:id', adminOnly, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.nameMissing')});
  if (!db.prepare('SELECT 1 FROM product_categories WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: t(localeOf(req), 'server.categoryGone')});
  const clash = db.prepare('SELECT id FROM product_categories WHERE name = ? COLLATE NOCASE AND id != ?')
    .get(name, req.params.id);
  if (clash) return res.status(409).json({ error: t(localeOf(req), 'server.nameExists')});
  db.prepare('UPDATE product_categories SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json(db.prepare('SELECT * FROM product_categories WHERE id = ?').get(req.params.id));
});

app.delete('/api/product-categories/:id', adminOnly, (req, res) => {
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
   Name haengt am Schalter. Ein gemeinsamer Helfer truege die Klemme in
   seinem eigenen Rumpf, und dann liesse sie sich nirgends gegenpruefen.
   Der Import geht an beiden vorbei. */
function findTag(name) {
  return db.prepare('SELECT * FROM tags WHERE name = ? COLLATE NOCASE').get(name.trim());
}

function createTag(name) {
  const i = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name.trim());
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(i.lastInsertRowid);
}

// Tags AM EINTRAG gehoeren dem Verfasser und dem Admin.
// Ein Tag am Eintrag beschreibt den Eintrag, und die Kategorie
// faehrt ohnehin im selben PUT wie der Titel -- offen fuer alle hiesse, ein
// Fremder duerfte umkategorisieren, aber den Titel nicht geraderuecken. Wer
// etwas beizutragen hat, schreibt einen Kommentar.
app.post('/api/items/:id/tags', entryAuthorOnly, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.tagMissing')});
  // Erst nachschlagen, dann die Klemme: einen vorhandenen Tag vergibt auch
  // hier jeder, der an den Eintrag darf. Die Wolke im Block bleibt deshalb
  // bedienbar, wenn der Schalter aus ist -- nur die Eingabezeile verschwindet.
  let tag = findTag(name);
  if (!tag) {
    if (!mayCreate(req, 'tagsFreiAnlegen')) return res.status(403).json({ error: t(localeOf(req), DENIED_TAG_NEW)});
    tag = createTag(name);
  }
  db.prepare('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)').run(req.params.id, tag.id);
  touch.run(req.params.id);
  res.status(201).json(detail(req.params.id, req.benutzer.id));
});

app.delete('/api/items/:id/tags/:tagId', entryAuthorOnly, (req, res) => {
  db.prepare('DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?').run(req.params.id, req.params.tagId);
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

/* ================= Eintraege ================= */
const qAttachments = db.prepare(`SELECT id, filename, mime_type, size, sort_order, created_at, user_id
  FROM attachments WHERE item_id = ? ORDER BY sort_order, id`);
// Reihenfolge durchgaengig chronologisch, in Gruppen: Angepinntes zuerst
// (Anpinnen schlaegt die Art), dann Aufgaben, Berichte, Notizen. Innerhalb
// jeder Gruppe steht das Aelteste oben; der Block der Angepinnten bleibt einer.
// Sortiert wird nach id, nicht nach created_at: innerhalb eines Eintrags
// stimmen beide immer ueberein, und created_at kommt bei einem Import
// ungeprueft aus der Datei und hat nur Sekundenaufloesung.
const qCommentsRaw = db.prepare(`
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
   EIN Ort, der das tut; die Gegenrichtung steht im Import.
   Geliefert wird ein OBJEKT und nicht der blosse Name: ein Grabstein traegt
   geloescht-<nr>, und die Oberflaeche bildet daraus "Geloeschter Benutzer 7".
   Eine HERRENLOSE Zeile bekommt ausdruecklich null -- das Feld fehlt nie,
   sonst waere "kein Verfasser" von "Feld unbekannt" nicht zu unterscheiden.
   Die Karte wird EINMAL je Anfrage gebaut und durchgereicht. */
const qAuthorRows = db.prepare('SELECT id, username, status FROM users');
function authorCard() {
  const m = new Map();
  for (const u of qAuthorRows.all()) {
    const weg = u.status === 'geloescht';
    // Der Grabsteinname geht NICHT hinaus. Er ist freigegeben und kann laengst
    // einem anderen Menschen gehoeren; eine Antwort, die ihn mitschickt, laedt
    // dazu ein, ihn irgendwann anzuzeigen. Was die Oberflaeche braucht, ist
    // die Nummer -- daraus wird "Geloeschter Benutzer 7".
    m.set(u.id, { id: u.id, name: weg ? null : u.username, geloescht: weg });
  }
  return m;
}
const authorFrom = (card, id) => (id == null ? null : (card.get(id) || null));

/* Jeder Kommentar sagt, ob er MIR gehoert -- daran haengen fuenf
   Bedienelemente. Ohne die Angabe muesste die Oberflaeche aus dem
   Verfasserobjekt zurueckrechnen, und bei einem Grabstein ginge das nicht.
   KEIN VORGABEWERT fuer userId: better-sqlite3 bindet ein fehlendes
   Argument still als NULL, und `null === null` waere hier wahr -- eine
   vergessene Aufrufstelle erklaerte jede herrenlose Zeile zur eigenen. */
function qComments(itemId, userId, card) {
  if (userId == null) throw new Error('qComments() ohne Benutzer aufgerufen');
  const list = qCommentsRaw.all(itemId);
  for (const c of list) {
    c.pinned = !!c.pinned;
    c.images = qCommentImages.all(c.id);
    c.mine = c.user_id === userId;
    c.verfasser = authorFrom(card, c.user_id);
    // Der Eingriffsvermerk. Eine EIGENE Angabe neben dem Text, nie in ihm --
    // ein Admin, der in ein fremdes Textfeld schriebe, taete genau das, was
    // ihm verwehrt ist.
    c.bilderEntfernt = c.images_removed;
    delete c.images_removed;
    delete c.user_id;
  }
  return list;
}

// art und dauer gehen mit hinaus: woran die Oberflaeche ein Video erkennt, ist
// allein die Spalte art -- nicht der ausgelieferte Typ und nichts sonst. Ohne
// die beiden Felder zeichnete sie ins Leere. Sie haengen damit an detail() UND
// an /api/items (mainPhoto).
const PHOTO_COLUMNS = 'id, item_id, mime_type, focus_x, focus_y, zoom, sort_order, created_at, art, dauer';
/* ---- DIE FASSUNG DER KACHEL -- 0.19.5 -------------------------------------

   SIE STEHT NEBEN DER LISTE UND NICHT IN IHR, und das hat einen Grund: die
   Liste darueber ist ZUGLEICH die Spaltenliste des deckenden Index
   `idx_photos_kachel`, und `length(thumb)` laesst sich nicht indizieren. Wer
   sie in PHOTO_COLUMNS schriebe, brauchte einen Index mit einer Spalte, die
   es nicht gibt -- und eine Pruefung, die beide gegeneinander haelt, wuerde
   rot, ohne dass etwas falsch waere.

   WOZU SIE UEBERHAUPT DA IST -- UND SIE IST KEINE KUER, SONDERN VORAUSSETZUNG.
   Die Auslieferung setzt `Cache-Control: private, max-age=86400`
   (attachments.js, gerufen mit maxAge: 86400 an /api/photos/:id/raw). Solange
   der Eintrag frisch ist, FRAGT DER BROWSER GAR NICHT ERST NACH; der schwache
   ETag von Express wird erst geprueft, wenn er abgelaufen ist. Bis 0.19.4 fiel
   das nicht auf, weil der Ausschnitt im Browser gerechnet wurde und die
   Kachel sich sofort aenderte. EINGERECHNET AENDERT SICH DER INHALT UNTER
   DERSELBEN ADRESSE -- der Betreiber saehe seinen neuen Ausschnitt bis zu
   24 Stunden lang nicht. Die Oberflaeche haengt den Wert deshalb als `?v=` an
   die Bildadresse; er ist keine Angabe ueber das BILD, sondern ueber seine
   FASSUNG.

   WARUM `length()` UND NICHT `substr()` -- GEMESSEN, an einer echten
   verschluesselten Datei mit 1032 Fotozeilen und 754 MB:

     heute (deckender Index)          kalt    2,2 ms   warm    1,9 ms
     + length(thumb)                  kalt   17,1 ms   warm    2,9 ms
     + hex(substr(thumb,1,1))         kalt 1859,0 ms   warm 1796,2 ms
     + length(thumb), OHNE den Index  kalt 2457,8 ms   warm 2449,0 ms

   `length()` auf einem Blob hat in SQLite seine Abkuerzung -- die Laenge steht
   im Satzkopf, und der liegt am Anfang des Satzes. `substr()` hatte sie nie
   (0.19.1, hier an einer zweiten Stelle bestaetigt): es liest den Inhalt, und
   damit die Overflow-Ketten, und damit ihre Entschluesselung.
   DER INDEX VERLIERT SEINE DECKUNG UND BLEIBT TROTZDEM DER GEWINN. Im
   Abfrageplan steht danach „SCAN photos USING INDEX" statt „USING COVERING
   INDEX": SQLite holt neun Spalten weiter aus dem Index und geht fuer die
   Laenge einmal an den Satzkopf. Ohne den Index kostete dieselbe Abfrage das
   140fache, weil `art` und `dauer` HINTER den Blobs stehen (0.19.2).

   ZWEI VERSCHIEDENE KACHELN KOENNEN ZUFAELLIG GLEICH LANG SEIN. Das ist
   hingenommen und ausdruecklich benannt: der Wert ist ein Cache-Schluessel und
   sonst nichts. Dass DIESELBE Zeile nach einem Neuschnitt exakt dieselbe
   Laenge traegt, ist unwahrscheinlich genug -- und wenn doch, zeigt der
   Browser eine Kachel, die er ohnehin schon hatte. */
const PHOTO_VERSION = 'length(thumb) AS fassung';
const qPhotos = db.prepare(`SELECT ${PHOTO_COLUMNS}, ${PHOTO_VERSION} FROM photos WHERE item_id = ? ORDER BY sort_order, id`);
/* DIESELBEN SPALTEN FUER ALLE EINTRAEGE AUF EINMAL -- die Uebersicht ruft sie,
   detail() ruft die Zeile darueber. DIE SPALTENLISTE STEHT AN EINER STELLE:
   liefe sie auseinander, traege die Kachel ein anderes Foto als der Eintrag.
   UND SIE IST ZUGLEICH DIE LISTE DES INDEX `idx_photos_kachel` -- fehlt dort
   eine, faellt der Index still aus. Eine Pruefung haelt beide gegeneinander. */
const qAllPhotos = db.prepare(`SELECT ${PHOTO_COLUMNS}, ${PHOTO_VERSION} FROM photos ORDER BY item_id, sort_order, id`);
/* `t.*` IST SEIT 0.19.3 EINE SPALTENLISTE, und das ist eine Wegnahme mit
   Nachweis: ein Schlagwort traegt id, name und created_at, und `created_at`
   wird in public/app.js an einem Schlagwort NIRGENDS gelesen -- nachgesehen,
   nicht geglaubt. Was niemand ansieht, wird zweimal bezahlt: beim Holen und
   beim Senden. Gemessen ueber 400 Eintraege: 3,76 -> 2,41 ms.
   DIE LISTE STEHT AN EINER STELLE, wie PHOTO_COLUMNS darueber: die
   gebuendelte Fassung fuer die Uebersicht und die einzelne fuer detail()
   muessen dieselben Spalten in derselben Folge lesen, sonst traegt die Kachel
   ein anderes Schlagwort als der Eintrag (Stolperstein 47). Eine Pruefung
   haelt beide gegeneinander. */
const TAG_COLUMNS = 't.id, t.name';
const qTags = db.prepare(`SELECT ${TAG_COLUMNS} FROM tags t JOIN item_tags it ON it.tag_id = t.id WHERE it.item_id = ? ORDER BY t.name COLLATE NOCASE`);
/* DIESELBEN SPALTEN FUER ALLE EINTRAEGE AUF EINMAL -- 0.19.3, dieselbe
   Bauform wie qAllPhotos. SORTIERT WIRD ZUERST NACH item_id UND DANN WIE
   BISHER: wer nur gruppiert und die zweite Ordnung vergisst, bekommt die
   Schlagworte einer Kachel in einer anderen Folge als am Eintrag.
   `item_id` FAELLT BEIM EINSORTIEREN WIEDER WEG -- es ist der Schluessel der
   Karte und kein Feld des Schlagworts; bliebe es stehen, truege die Kachel
   ein Feld, das der Eintrag nicht hat. */
const qAllTags = db.prepare(`SELECT it.item_id, ${TAG_COLUMNS} FROM tags t
  JOIN item_tags it ON it.tag_id = t.id ORDER BY it.item_id, t.name COLLATE NOCASE`);
const qLinks = db.prepare('SELECT id, url, sort_order, created_at, user_id FROM links WHERE item_id = ? ORDER BY sort_order, id');
/* DIE UEBERSICHT ZAEHLT NUR -- 0.19.3. Sie hat bis 0.19.2 je Eintrag die
   VOLLEN Linkzeilen geholt (id, url, sort_order, created_at, user_id) und
   davon `.length` genommen; gebraucht wird an der Kachel allein `linkCount`.
   Gemessen ueber 400 Eintraege: 2,36 -> 0,47 ms.
   qLinks BLEIBT UND WIRD WEITER GEBRAUCHT: detail() zeigt die Adressen mit
   ihren Verfassern, und dort ist die Zeilenzahl einstellig. */
const qLinkCounts = db.prepare('SELECT item_id, COUNT(*) n FROM links GROUP BY item_id');
const qCat = db.prepare('SELECT id, name FROM product_categories WHERE id = ?');
/* Und dieselbe Frage fuer die ganze Liste. Es sind wenige Zeilen, und sie
   stehen ohnehin gleich wieder da: eine Abfrage je Eintrag holte dieselbe
   Kategorie hundertmal. */
const qAllCategories = db.prepare('SELECT id, name FROM product_categories');
/* --- Schnitt und Anzahl je Kriterium --------------------------------------
   EINE Abfrage, gruppiert -- ausdruecklich KEIN zweiter JOIN AUF `ratings`
   neben dem in detail(): zwei JOINs auf DIESELBE Tabelle vervielfachen sich,
   drei Bewerter ergaeben einen neunfachen Zaehler. Der JOIN auf
   `rating_criteria` trifft dagegen genau eine Zeile.
   DAS GEWICHT REIST AN DER SCHNITTZEILE MIT -- so kann der Nenner des
   Gesamtschnitts gar nicht aus einer anderen Menge entstehen als der Zaehler.
   Gezaehlt wird ueber Werte > 0: eine zurueckgesetzte Zeile ist keine Stimme. */
const qAveragePerCriterion = db.prepare(`
  SELECT r.criterion_id, AVG(r.value * 1.0) AS schnitt, COUNT(*) AS anzahl,
         c.gewicht, c.phase
    FROM ratings r JOIN rating_criteria c ON c.id = r.criterion_id
   WHERE r.item_id = ? AND r.value > 0
   GROUP BY r.criterion_id, c.gewicht, c.phase`);

/* ZWEI KARTEN JE EINTRAG, EINE JE PHASE -- 0.21.0. Und das ist die ganze
   Trennung zwischen Potenzial und Bewertung: die Menge wird nach Phase
   geschnitten, BEVOR die Rechnung sie sieht.
   ES GIBT KEINEN SCHALTER, DER EINEN VORHER-STERN IN DIE BEWERTUNG LIESSE,
   weil es keine Stelle gibt, an der beide Mengen zugleich in einer Rechnung
   stehen. Zaehler und Nenner eines Kastens entstehen in DERSELBEN Schleife aus
   DERSELBEN Menge -- dieselbe bauliche Antwort, mit der totalAverage() seit
   jeher verhindert, dass der Nenner aus einer anderen Menge kommt als der
   Zaehler.
   EINE ABFRAGE UND NICHT ZWEI: zwei Abfragen mit zwei WHERE-Zusaetzen liefen
   ueber dieselbe Tabelle und koennten auseinanderlaufen; hier faellt jede
   Zeile in genau einen der beiden Kaesten, und zwar an einer Stelle. */
function cardPerPhase(zeilen) {
  const box = { vorher: new Map(), nachher: new Map() };
  for (const z of zeilen) {
    // Ein unbekannter Wert in der Spalte kaeme nur aus einer Schreibung an
    // PHASEN vorbei. Er faellt in keinen der beiden Kaesten, statt still im
    // falschen zu landen.
    if (box[z.phase]) box[z.phase].set(z.criterion_id, z);
  }
  return box;
}

function averagesPerCriterion(itemId) {
  return cardPerPhase(qAveragePerCriterion.all(itemId));
}

/* DIESELBE ABFRAGE FUER ALLE EINTRAEGE AUF EINMAL -- 0.19.3. Es ist Zeile fuer
   Zeile dieselbe: derselbe JOIN, dasselbe `value > 0`, dieselbe Gruppierung --
   nur steht `r.item_id` mit in SELECT und GROUP BY, und das WHERE auf den
   einen Eintrag faellt weg. Gemessen ueber 400 Eintraege: 4,18 -> 2,70 ms.
   ZWEI FASSUNGEN, EINE RECHNUNG: was herauskommt, geht durch DENSELBEN
   totalAverage() wie in detail(). Zwei Rechenwege fuer dieselbe Kopfzahl
   waeren zwei Wahrheiten (Stolperstein 47); zwei Abfragen mit demselben
   Ergebnis sind es nicht -- eine Pruefung haelt sie gegeneinander. */
const qAveragePerCriterionAll = db.prepare(`
  SELECT r.item_id, r.criterion_id, AVG(r.value * 1.0) AS schnitt, COUNT(*) AS anzahl,
         c.gewicht, c.phase
    FROM ratings r JOIN rating_criteria c ON c.id = r.criterion_id
   WHERE r.value > 0
   GROUP BY r.item_id, r.criterion_id, c.gewicht, c.phase`);

// Je Eintrag DIESELBEN ZWEI KARTEN wie am einzelnen -- ueber denselben
// cardPerPhase(). Ein zweiter Schnitt nach Phase, hier frisch geschrieben,
// waere die zweite Wahrheit, die schon die zwei Abfragen vermeiden.
function averagesPerEntry() {
  const roh = new Map();
  for (const z of qAveragePerCriterionAll.all()) {
    if (!roh.has(z.item_id)) roh.set(z.item_id, []);
    roh.get(z.item_id).push(z);
  }
  const alle = new Map();
  for (const [itemId, zeilen] of roh) alle.set(itemId, cardPerPhase(zeilen));
  return alle;
}

// Was ein Eintrag OHNE eine einzige Sternzeile mitbringt -- zwei leere Kaesten.
// Es steht hier, weil die Uebersicht es fuer jeden Eintrag ohne Bewertung
// braucht und `new Map()` dort die falsche Gestalt haette.
const EMPTY_BOXES = () => ({ vorher: new Map(), nachher: new Map() });

/* Wer welchen Wert vergeben hat -- je Kriterium eine Liste. Wieder eine
   EIGENE Abfrage, Begruendung bei qAveragePerCriterion. Nur Werte > 0.
   Die id steht mit dabei: ohne sie waere DELETE /api/ratings/:id vom
   Bildschirm aus nicht erreichbar. `mine` statt der Verfassernummer. */
const qVotesRaw = db.prepare(`
  SELECT id, criterion_id, user_id, value FROM ratings
   WHERE item_id = ? AND value > 0 ORDER BY criterion_id, id`);

function votesPerCriterion(itemId, userId, card) {
  if (userId == null) throw new Error('stimmenJeKriterium() ohne Benutzer aufgerufen');
  const m = new Map();
  for (const z of qVotesRaw.all(itemId)) {
    if (!m.has(z.criterion_id)) m.set(z.criterion_id, []);
    m.get(z.criterion_id).push({
      id: z.id, wert: z.value, mine: z.user_id === userId,
      verfasser: authorFrom(card, z.user_id)
    });
  }
  return m;
}

// Gesamtschnitt: erst je Kriterium ueber alle Benutzer, dann ueber die
// Kriterien -- NICHT flach ueber alle Bewertungszeilen. Sonst zaehlte ein
// Kriterium, das drei Leute bewertet haben, dreifach gegen eines mit einem
// Bewerter, und die Kopfzahl waere aus den angezeigten Zeilenwerten nicht
// mehr nachvollziehbar. Der zweite Schritt ist ein GEWICHTETER Mittelwert.
//
// DER NENNER SUMMIERT NUR DIE GEWICHTE DER BEWERTETEN KRITERIEN. Das ist die
// eine Stelle, an der ein naheliegender Griff alles kippt: ein Nenner ueber
// ALLE Kriterien drueckte einen Eintrag unter 1 -- ein Eintrag mit einem
// bewerteten Kriterium (Wert 3, Gewicht 0,2) und zwei unbewerteten a 2 ergaebe
// 0,14 statt 3,0. Die Antwort darauf ist baulich: Zaehler und Nenner entstehen
// in DERSELBEN Schleife aus DERSELBEN Menge.
//
// Weil jeder Wert in [1,5] liegt und jedes Gewicht groesser null ist, liegt
// auch das Ergebnis in [1,5] -- eine Eigenschaft des gewichteten Mittels, kein
// Deckel, der vergessen werden koennte.
// GERUNDET WIRD GENAU EINMAL, hier am Ende: je Kriterium vorzurunden waere ein
// zweiter Rundungsort fuer dieselbe Zahl.
//
// DER RECHENWEG ENTSTEHT IN DER RECHNUNG UND NICHT DANEBEN. Die Oberflaeche
// erklaert seit 0.16.0, wie die Kopfzahl zustande kommt -- und sie RECHNET
// DAZU NICHT NACH: ein zweiter Rechenweg fuer die Anzeige waere genau die
// zweite Wahrheit, die diese Instanz nirgends duldet. Die beiden Wege liefen
// frueher oder spaeter auseinander, und zwar unbemerkt: beide sehen plausibel aus.
// Deshalb fuellt diese Funktion den Weg mit, den sie ohnehin geht.
// `calc` IST FREIWILLIG: die Uebersicht rechnet denselben Schnitt fuer
// tausend Eintraege und braucht keine Aufstellung dazu.
function totalAverage(card, calc) {
  let counter = 0, nenner = 0;
  /* DIE VERGLEICHSZAHL -- 0.17.0. Was kaeme heraus, wenn alle Kriterien gleich
     zaehlten? Ohne sie steht die Formel Zeile fuer Zeile da und laesst trotzdem
     offen, WOFUER die Gewichte gut sind: erst der Unterschied macht die
     Gewichtung sichtbar.
     SIE ENTSTEHT HIER UND NICHT IM BROWSER (Stolperstein 217): in DERSELBEN
     Schleife wie die Zahl darueber, aus DERSELBEN Menge. Eine zweite
     Rechenstelle fuer die Anzeige waere genau die zweite Wahrheit, die diese
     Instanz nirgends duldet -- und die beiden liefen unbemerkt auseinander.
     DER TEILER IST DIE ZAHL DER BEWERTETEN KRITERIEN, nicht die aller: sonst
     verglichen sich zwei Rechnungen ueber verschiedene Mengen, und der
     Unterschied saehe nach Gewichtung aus, wo er keiner ist. */
  let sameCounter = 0;
  const zeilen = [];
  for (const z of card.values()) {
    const produkt = z.schnitt * z.gewicht;
    counter += produkt; nenner += z.gewicht;
    sameCounter += z.schnitt;
    zeilen.push({ criterionId: z.criterion_id, schnitt: z.schnitt, gewicht: z.gewicht, produkt });
  }
  // UNGERUNDET, wie hier gerechnet wird. Gerundet wird genau einmal, unten am
  // Ergebnis -- die Oberflaeche rundet nur noch fuer die Anzeige und sagt das
  // auch. Ginge der Weg gerundet hinaus, ergaebe die Aufstellung am Bildschirm
  // eine andere Zahl als die Instanz rechnet.
  // DIE VERGLEICHSZAHL WIRD DAGEGEN HIER GERUNDET, und zwar genau einmal: sie
  // hat keine Zahl darueber, an der sie sonst haengen koennte. Der ungerundete
  // Quotient reist daneben mit, wie beim gewichteten Ergebnis auch.
  if (calc) Object.assign(calc,
    { zeilen, summe: counter, teiler: nenner, roh: nenner ? counter / nenner : null,
      gleichSumme: sameCounter, gleichTeiler: zeilen.length,
      gleichRoh: zeilen.length ? sameCounter / zeilen.length : null,
      gleichErgebnis: zeilen.length
        ? Math.round((sameCounter / zeilen.length) * 10) / 10 : null });
  // Kein Nenner heisst: kein bewertetes Kriterium, also keine Zahl. Bei
  // mindestens einer Zeile ist er mindestens WEIGHT_MIN und damit nie null.
  if (!nenner) return null;
  return Math.round((counter / nenner) * 10) / 10;
}

const qTestDaysRaw = db.prepare('SELECT id, day, rating, user_id FROM test_days WHERE item_id = ? ORDER BY day DESC, id DESC');
const qTestDayTags = db.prepare(`SELECT t.id, t.name FROM tags t
  JOIN test_day_tags dt ON dt.tag_id = t.id WHERE dt.test_day_id = ?
  ORDER BY t.name COLLATE NOCASE`);
// Jeder Testtag sagt, ob er MIR gehoert -- die Zeitleiste zeichnet die
// eigenen Punkte gefuellt und fremde als Ring. Geliefert wird "mine", nicht
// die user_id.
// KEIN VORGABEWERT fuer userId: better-sqlite3 bindet ein fehlendes
// Argument still als NULL, und "user_id = NULL" ist in SQL nie wahr -- eine
// vergessene Aufrufstelle lieferte wortlos lauter fremde Punkte.
function qTestDays(itemId, userId, card) {
  if (userId == null) throw new Error('qTestDays() ohne Benutzer aufgerufen');
  const tage = qTestDaysRaw.all(itemId);
  for (const tag of tage) {
    tag.tags = qTestDayTags.all(tag.id);
    tag.mine = tag.user_id === userId;
    // Der Name steht neben `mine`, er ersetzt es nicht: die Zeitleiste
    // unterscheidet eigene von fremden Punkten ueber die Fuellung und braucht
    // dafuer keinen Namen, die Zeile im Eintrag braucht ihn.
    tag.verfasser = authorFrom(card, tag.user_id);
    delete tag.user_id;
  }
  return tage;
}

/* ---- DIE SCHMALE FASSUNG FUER DIE LISTE — 0.19.3 -------------------------
   ZWEI FORMEN FUER ZWEI FRAGEN, und der Unterschied steht an beiden:
   qTestDays() darueber beantwortet „was steht an DIESEM Eintrag" -- dort zeigt
   die Zeile ihre Schlagworte und ihren Verfasser. Diese hier beantwortet „was
   braucht die ZEITLEISTE der Uebersicht", und die liest genau drei Felder.

   WAS HERAUSFAELLT UND WARUM ES NIEMAND VERMISST: `tags` und `verfasser`.
   zeitleistePunkte() (public/app.js) ist die EINZIGE Stelle, die testDays aus
   der LISTENANTWORT liest, und sie nimmt `day`, `rating` und `mine`. Die vier
   uebrigen Leser arbeiten auf dem Objekt aus detail() -- erkennbar daran, was
   danebensteht: item.links und item.description, it.ratings, item.tested,
   sparkline(item.testDays). Nachgezaehlt am heutigen Stand und nicht dem
   Kommentar geglaubt, der das seit 0.17.0 behauptet.
   `id` BLEIBT TROTZDEM DRIN. Es kostet vier Bytes je Zeile -- sie stehen im
   Zeilenkopf und werden weder gesucht noch entschluesselt -- und ist die
   einzige Handhabe, falls die Zeitleiste je auf einen Punkt zeigen soll.

   WAS DAS SPART, gemessen ueber 400 Eintraege mit je drei Testtagen: 11,61 ->
   3,30 ms, und die 1200 Einzelabfragen nach den Schlagworten der Testtage
   fallen ganz weg. Von der Antwort gehen 96 kB ab. `qTestDays` war damit der
   groesste Einzelposten der ganzen Route -- mehr als die fuenf gebuendelten
   Nachbarn zusammen.

   SORTIERT WIRD ZUERST NACH item_id UND DANN WIE BISHER (day DESC, id DESC).
   Ohne die zweite Ordnung bekaeme die Zeitleiste ihre Punkte verdreht. */
const qAllTestDaysNarrow = db.prepare(
  'SELECT item_id, id, day, rating, user_id FROM test_days ORDER BY item_id, day DESC, id DESC');

function testDaysPerEntry(userId) {
  if (userId == null) throw new Error('testTageJeEintrag() ohne Benutzer aufgerufen');
  const je = new Map();
  for (const tag of qAllTestDaysNarrow.all()) {
    if (!je.has(tag.item_id)) je.set(tag.item_id, []);
    // mine kommt vom Server, wie in qTestDays(): die Zeitleiste zeichnet die
    // eigenen Punkte gefuellt und fremde als Ring. Die Verfassernummer geht
    // nicht hinaus -- hier so wenig wie dort.
    je.get(tag.item_id).push({ id: tag.id, day: tag.day, rating: tag.rating,
                             mine: tag.user_id === userId });
  }
  return je;
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

const qMyPin = db.prepare('SELECT 1 FROM item_pins WHERE user_id = ? AND item_id = ?');

// detail() braucht den Benutzer: "favorite" heisst "habe ICH als Favorit
// markiert" -- dieselbe Antwort sieht fuer zwei Leute verschieden aus.
// KEIN VORGABEWERT: better-sqlite3 bindet ein FEHLENDES Argument still als
// NULL (nur zu WENIGE werfen). Ein Aufruf ohne Benutzer lieferte ueberall
// wortlos favorite: false. Die Klemme ist die EINZIGE Schicht darunter.
function detail(id, userId) {
  if (userId == null) throw new Error('detail() ohne Benutzer aufgerufen');
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!it) return null;
  // EINMAL je Aufruf: Eintrag, Kommentare, Testtage und Stimmen greifen alle
  // darauf zu.
  const card = authorCard();
  it.rejected = !!it.rejected; it.tested = !!it.tested;
  it.verfasser = authorFrom(card, it.user_id);
  /* WEM DER EINTRAG GEHOERT, SAGT DER SERVER -- wie am Kommentar, an der
     Linkzeile und am Anhang. Die Oberflaeche kennt nur ihren NAMEN und nicht
     ihre Nummer; aus einem Grabstein liesse sich ohnehin nichts
     zurueckrechnen, er hat keinen Namen mehr. */
  it.mine = it.user_id === userId;
  delete it.user_id;
  /* WEM DIE BEGRUENDUNG GEHOERT, und es ist eine EIGENE Angabe neben `mine`:
     wer abgelehnt hat, muss nicht der sein, dem der Eintrag gehoert. An
     `rejectedMine` haengt der Stift, an `mine` zusammen mit dem Adminrecht der
     Papierkorb -- dieselbe Rechnung wie am Kommentar (`meins`, `verwalten`).
     KEINE RECHTEAUSKUNFT ("darfst du schreiben?"): die Klemme steht im Server,
     und eine zweite Antwort daneben liefe mit ihr auseinander, sobald jemand
     nur eine Seite aendert. Geliefert werden die zwei Tatsachen, gerechnet
     wird oben.
     OHNE ABLEHNENDEN IST ES `false` und nicht `null`: eine Begruendung, die
     niemandem gehoert, gehoert auch mir nicht. */
  it.rejectedMine = it.rejected_von != null && it.rejected_von === userId;
  /* WER ABGELEHNT HAT, GEHT ALS VERFASSEROBJEKT HINAUS UND NIE ALS NUMMER --
     dieselbe Abbildung wie am Eintrag, am Kommentar und am Testtag, und
     dieselbe EINE Stelle: aus einem Grabstein wird damit "Geloeschter
     Benutzer 7" und nicht sein freigegebener Name.
     rejected_at und rejected_grund bleiben, wie sie in der Zeile stehen; ein
     leeres Feld heisst "nicht bekannt" und wird hier nicht gefuellt. */
  it.rejectedVerfasser = authorFrom(card, it.rejected_von);
  delete it.rejected_von;
  it.favorite = !!qMyPin.get(userId, id);
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
    preview: anh.previewKind(a2.filename),
    mine: a2.user_id === userId, verfasser: authorFrom(card, a2.user_id)
  }));
  /* Die Linkzeile sagt wie Kommentar, Testtag und Stimme, wem sie gehoert --
     an `mine` haengt das Loeschkreuz, und bei einem Grabstein liesse es sich
     aus dem Verfasserobjekt nicht zurueckrechnen.
     created_at bleibt in der Antwort: es traegt den Ueberfahrtext.
     WER DEN NAMEN ZEIGT, entscheidet die Oberflaeche. */
  it.links = qLinks.all(id).map(l => ({
    id: l.id, url: l.url, sort_order: l.sort_order, created_at: l.created_at,
    mine: l.user_id === userId, verfasser: authorFrom(card, l.user_id)
  }));
  it.tags = qTags.all(id);
  it.testDays = qTestDays(id, userId, card);
  it.comments = qComments(id, userId, card);
  // Die eigene Sterne-Zeile. Ohne die Bedingung auf user_id vervielfacht der
  // LEFT JOIN das Kriterium -- bei zwei Bewertern zeigte das Widget zwei
  // Reihen Sterne fuer dieselbe Sache. Ein Bedienelement zeigt den Zustand,
  // den es veraendert; der Schnitt ueber alle steht daneben in avg und count.
  // gewicht steht an jeder Zeile: die Oberflaeche zeichnet daraus die Marke
  // ×1,5, und der Vergleich rechnet in der Stellung "meine" damit.
  // DIE PHASE REIST AN DER ZEILE MIT -- 0.21.0. Der Browser teilt die Liste
  // danach in seine beiden Kaesten; RECHNEN tut er damit nichts (die beiden
  // Kopfzahlen stehen unten). Eine zweite Abfrage je Kasten waere zweimal
  // derselbe LEFT JOIN ueber dieselbe Tabelle.
  it.ratings = db.prepare(`
    SELECT c.id AS criterion_id, c.name, c.gewicht, c.phase, COALESCE(r.value, 0) AS value
    FROM rating_criteria c LEFT JOIN ratings r
      ON r.criterion_id = c.id AND r.item_id = ? AND r.user_id = ?
    ORDER BY c.sort_order, c.id`).all(id, userId);
  // Neben der eigenen Zeile stehen Schnitt und Zahl der Bewerter ueber alle
  // -- angehaengt aus der gruppierten Abfrage, nicht aus einem zweiten JOIN.
  // Ein Kriterium, das niemand bewertet hat, bekommt avg: null und count: 0.
  const averages = averagesPerCriterion(id);
  // WER WELCHEN WERT VERGEBEN HAT, STEHT HIER AUSDRUECKLICH NICHT: diese
  // Antwort geht an jeden, und eine Angabe darueber, wie eine EINZELNE PERSON
  // bewertet hat, ist mehr, als eine Bewertung aussagen soll. Die Liste holt
  // der Admin ueber GET /api/items/:id/votes. avg und count bleiben.
  for (const r of it.ratings) {
    // Aus dem Kasten, zu dem das Kriterium gehoert. Ein Griff in den anderen
    // ginge ins Leere -- die beiden Karten teilen keine Kennung.
    const box = averages[r.phase];
    const z = box && box.get(r.criterion_id);
    r.avg = z ? Math.round(z.schnitt * 10) / 10 : null;
    r.count = z ? z.anzahl : 0;
  }
  /* DIE AUFSTELLUNG GEHT NUR AM EINZELNEN EINTRAG MIT -- dort steht die
     Kopfzahl, und dort wird gefragt, wie sie zustande kommt. In der Uebersicht
     waere sie tausendmal dieselbe Arbeit fuer eine Zahl, die niemand
     aufklappt.
     SIE TRAEGT NICHTS NEUES: Gewicht und Kriterienschnitt stehen ohnehin in
     `ratings`. Neu ist allein, dass Summe, Teiler und das ungerundete Ergebnis
     aus DERSELBEN Schleife kommen wie die Zahl darueber. */
  /* ZWEIMAL DIESELBE RECHNUNG UEBER ZWEI GETRENNTE MENGEN -- 0.21.0, und das
     ist die ganze Zweiteilung. Kein zweiter totalAverage(), kein Schalter in
     ihm, keine Fallunterscheidung: die Funktion sieht gar nicht, welchen
     Kasten sie gerade rechnet.
     UND DER RECHENWEG ENTSTEHT BEIDE MALE IN DER RECHNUNG UND NICHT DANEBEN
     (Stolperstein 217): die Erklaerung der Kopfzahl gibt es in beiden
     Kaesten, also braucht sie es auch beide Male. */
  const calc = {};
  it.avgRating = totalAverage(averages.nachher, calc);
  it.rechenweg = { ...calc, ergebnis: it.avgRating };
  const potentialCalc = {};
  it.potenzialRating = totalAverage(averages.vorher, potentialCalc);
  it.potenzialRechenweg = { ...potentialCalc, ergebnis: it.potenzialRating };
  Object.assign(it, testStats(id));
  return it;
}

const qMyPins = db.prepare('SELECT item_id FROM item_pins WHERE user_id = ?');
const qAllItems = db.prepare('SELECT * FROM items ORDER BY updated_at DESC');
/* VORBEREITET UND NICHT JE EINTRAG UEBERSETZT. Beide Abfragen standen in der
   Schleife darunter und wurden damit einmal je Eintrag uebersetzt. Gemessen an
   1000 Eintraegen: 24,2 ms so, 11,5 ms vorbereitet. Die uebrigen Abfragen der
   Schleife (qPhotos, qTags, qLinks) stehen aus demselben Grund laengst oben.

   UND SEIT 0.19.3 WIRD SIE AUCH NICHT MEHR JE EINTRAG GEFRAGT. Vorbereiten und
   Buendeln sind zwei verschiedene Ersparnisse; die zweite kommt hier dazu.
   Gemessen ueber 400 Eintraege: 1,33 -> 0,23 ms.
   DIE EINZELFASSUNG IST DABEI GANZ WEGGEFALLEN und nicht daneben stehen
   geblieben -- anders als qTags, qLinks und qPhotos, die detail() weiter
   braucht. Die Zahl der Anhaenge fragte NUR die Uebersicht; detail() holt die
   Dateien selbst (qAttachments) und zaehlt sie im Browser. Eine Abfrage, die
   niemand mehr ruft, ist kein Vorrat, sondern eine Zeile, die beim naechsten
   Lesen erklaert werden muss. */
const qAttachmentCounts = db.prepare('SELECT item_id, COUNT(*) n FROM attachments GROUP BY item_id');

/* ================= Die Volltextsuche =================
   SIE SUCHT SIEBEN QUELLEN: Titel, Beschreibung, Kategoriename, Tags am
   Eintrag, Tags an Testtagen, Linkadressen und saemtliche Kommentartexte.

   instr() UND NICHT LIKE, UND DAS IST DER KERN DER SACHE. `LIKE '%…%'` liest
   `%` und `_` im Suchbegriff als Wildcards: die Eingabe eines einzelnen
   Prozentzeichens faende JEDEN Eintrag statt des einen, der eines traegt. Mit
   ESCAPE liesse sich das einfangen, aber instr() kennt gar keine Wildcards --
   der Suchbegriff ist dort Text von Bauart und nicht durch eine Klemme, die
   jemand vergessen kann. Nachgestellt an 1001 Eintraegen: LIKE ungeschuetzt
   1001 Treffer, instr() einer.

   KEIN FTS5, UND DAS IST NACHGERECHNET. Die eingebaute SQLite kann es, es
   kaeme also keine Abhaengigkeit dazu. An 1000 Eintraegen mit 1,75 MB
   Suchtext kostet der Trigramm-Index aber 5,17 MB -- das Dreifache des
   Textes -- und braeuchte eine Auffrischung an sieben Schreibstellen. Vor
   allem AENDERT ER DAS VERHALTEN: eine Trigramm-Abfrage mit einem oder zwei
   Zeichen scheitert nicht, sie liefert STILL NULL Treffer.

   DIE SIEBEN QUELLEN STEHEN ALS SIEBEN ODER-GLIEDER DA und nicht als
   zusammengesetzter Text. SQLite bricht die Kette beim ersten Treffer ab: ein
   haeufiges Wort im Titel kostet 1,9 ms, ein seltener Begriff, der alle
   sieben durchlaeuft, 13,2 ms.

   DIE ROUTE IST LESEND und steht deshalb NICHT in F_ROUTEN. SIE TRIFFT
   DIESELBE MENGE WIE DIE LISTE OHNE PARAMETER: gelesen wird dieselbe Tabelle
   `items` ohne weitere Einschraenkung. Die Suche ist damit kein neuer Zugang
   zu fremden Kommentaren -- sie sagt nur, WELCHE Eintraege einen Text tragen.

   DER SUCHBEGRIFF GEHT NICHT INS SICHERHEITSPROTOKOLL, und eine eigene Bremse
   gibt es nicht: die Route steht hinter der Anmeldung. */
/* ---- DIE SIEBEN QUELLEN STEHEN GENAU EINMAL -- 0.18.0 ------------------
   BIS 0.17.5 STAND DIE BEDINGUNG NUR IM `WHERE`, und die Antwort warf weg,
   WELCHE der sieben getroffen hatte. Seit 0.18.0 sagt die Kachel es -- dazu
   muss dieselbe Bedingung zweimal ausgewertet werden: einmal als Filter
   (`WHERE`) und einmal als Auskunft (die Spaltenliste).

   DESHALB STEHT SIE HIER ALS LISTE UND NICHT ZWEIMAL IM SQL. Wer sie
   abschriebe, haette sie ab dem naechsten Zusatz an zwei Stellen zu pflegen,
   und die beiden liefen auseinander -- ein Eintrag stuende dann in der
   Trefferliste, ohne dass eine Quelle dazu genannt waere.

   JEDER AUSDRUCK LIEFERT DEN GETROFFENEN TEXT ODER NULL. Damit ist
   `IS NOT NULL` genau dieselbe Frage wie vorher `instr(...) > 0`
   beziehungsweise `EXISTS (...)`: getroffen wird nur ueber nicht leeren Text,
   und der Suchbegriff ist nie leer (fulltextTerm schneidet ihn zu, und ein
   leerer ist gar keine Suche). Eine fehlende Beschreibung faellt ueber kkl()
   auf den leeren String und trifft damit nicht.

   DIE REIHENFOLGE IN DIESER LISTE IST DIE ANZEIGEREIHENFOLGE, und sie ist
   nicht die des Fahrplans: sie beginnt bei dem, was die Kachel NICHT ZEIGT.
   Steht der Begriff im Titel, sieht man ihn ohnehin -- die Zeile truege dort
   nichts bei. Steht er in einem Kommentar, ist sie die einzige Auskunft, die
   es gibt. Genannt wird die ERSTE getroffene Quelle dieser Folge.

   ES SIND SIEBEN UND NICHT SECHS: die Tags kommen zweimal vor, einmal am
   Eintrag und einmal am Testtag. Der Fahrplan zaehlt sechs; nachgezaehlt sind
   es sieben, und diese Liste ist die Stelle, an der sich das zaehlen laesst.

   JE QUELLE EIN BESTIMMTER SATZ UND NICHT IRGENDEINER. Wo mehrere Zeilen
   treffen koennen (Tags, Links, Kommentare), steht ein ORDER BY: ohne es
   entschiede die Abfrageplanung, welcher Kommentar auf der Kachel steht, und
   dieselbe Suche zeigte morgen einen anderen. Gewaehlt ist jeweils die
   Reihenfolge, in der die Oberflaeche die Zeilen ohnehin zeigt -- Links nach
   ihrer Sortierung, Kommentare nach ihrem Alter, Tags nach ihrem Namen. */
const FULLTEXT_SOURCES = [
  { schluessel: 'beschreibung',
    wert: 'CASE WHEN instr(kkl(i.description), :q) > 0 THEN i.description END' },
  { schluessel: 'kommentar',
    wert: `(SELECT k.text FROM comments k
             WHERE k.item_id = i.id AND instr(kkl(k.text), :q) > 0
             ORDER BY k.id LIMIT 1)` },
  { schluessel: 'link',
    wert: `(SELECT l.url FROM links l
             WHERE l.item_id = i.id AND instr(kkl(l.url), :q) > 0
             ORDER BY l.sort_order, l.id LIMIT 1)` },
  { schluessel: 'testtag',
    wert: `(SELECT tt.name FROM test_days d
              JOIN test_day_tags dt ON dt.test_day_id = d.id
              JOIN tags tt ON tt.id = dt.tag_id
             WHERE d.item_id = i.id AND instr(kkl(tt.name), :q) > 0
             ORDER BY tt.name, tt.id LIMIT 1)` },
  { schluessel: 'tag',
    wert: `(SELECT t.name FROM item_tags it JOIN tags t ON t.id = it.tag_id
             WHERE it.item_id = i.id AND instr(kkl(t.name), :q) > 0
             ORDER BY t.name, t.id LIMIT 1)` },
  { schluessel: 'kategorie',
    wert: 'CASE WHEN instr(kkl(c.name), :q) > 0 THEN c.name END' },
  { schluessel: 'titel',
    wert: 'CASE WHEN instr(kkl(i.title), :q) > 0 THEN i.title END' }
];

/* DER FILTER BLEIBT DIE ODER-KETTE, und das ist keine Formsache: SQLite
   bricht sie beim ersten Treffer ab. Stuenden die sieben Ausdruecke
   stattdessen in einer inneren Abfrage und die Bedingung darueber, waeren sie
   fuer JEDE Zeile des Bestands vollstaendig zu rechnen -- auch fuer die, die
   schon am Titel haengen bleibt.
   DIE SPALTENLISTE RECHNET NUR FUER DIE ZEILEN, DIE DURCHKOMMEN. Was der
   Trefferkontext kostet, haengt damit an der Zahl der TREFFER und nicht an
   der Groesse des Bestands.
   UND ER IST NICHT UMSONST -- nachgemessen an 1000 Eintraegen mit 4001
   Kommentaren und 2,77 MB Suchtext, je 200 Laeufe, Median: ein haeufiges Wort
   mit 100 Treffern kostet 17,07 ms ohne und 19,96 ms mit Kontext, ein seltenes
   mit einem Treffer 17,01 gegen 17,84 ms, ein Begriff ohne Treffer 17,35 gegen
   17,82 ms. Die Behauptung, die Auskunft falle bei der Filterung ohnehin an,
   gilt nur fuer die Zeilen, die NICHT treffen (Stolperstein 260). */
const qFulltext = db.prepare(`
  SELECT i.id,
         ${FULLTEXT_SOURCES.map(q => `${q.wert} AS f_${q.schluessel}`).join(',\n         ')}
    FROM items i
    LEFT JOIN product_categories c ON c.id = i.product_category_id
   WHERE ${FULLTEXT_SOURCES.map(q => `(${q.wert}) IS NOT NULL`).join('\n      OR ')}`);

/* WIE LANG EIN AUSSCHNITT IST -- GEMESSEN UND NICHT GESCHAETZT.
   Die schmalste Kachel ist 240 px breit (`.grid`, minmax(240px, 1fr)), davon
   gehen 28 px Innenabstand ab: 212 px fuer die Zeile. Gemessen in Chromium
   bei --window-size=1280,900 und Schriftgrad 100 traegt diese Zeile 42
   Zeichen, bevor sie ueberlaeuft; bei Schriftgrad 80 sind es 53.
   HIER STEHT DIE GROESSERE ZAHL, und das ist Absicht: abgeschnitten wird im
   Stylesheet (text-overflow), und was hinten fehlt, fehlt hinten. Zu kurz
   geschnitten kann der Browser dagegen nichts mehr nachholen.
   DER VORLAUF IST DER EIGENTLICHE PUNKT, und er ist KURZ. Vor der Fundstelle
   stehen hoechstens vier Zeichen. Vier und nicht zwoelf, weil die schmalste
   Kachel es entscheidet: bei 390 px Schirmbreite ist sie 173 px breit, davon
   bleiben nach der Quelle ("Beschreibung:" misst 88,7 px) 55,3 px fuer den
   Ausschnitt -- gemessen neun Zeichen. Mit zwoelf Zeichen Vorlauf waere die
   Fundstelle dort abgeschnitten gewesen: eine Zeile mit Umgebung und ohne das
   Wort, um das es geht.
   UND NICHT NULL: gerade weil "ella" auch "eurobella" findet, muss zu sehen
   sein, dass die Fundstelle MITTEN IN EINEM WORT steht. Ein Ausschnitt, der
   genau bei ihr beginnt, verschwiege das -- und das ist der Befund, wegen dem
   es diese Zeile ueberhaupt gibt. */
const SNIPPET_LENGTH = 56;
const SNIPPET_LEAD = 4;

/* WEISSRAUM WIRD EINGEEBNET -- ABER NUR IM TEXT UND NIE IM BEGRIFF. Ein
   Kommentar traegt Absaetze; die Kachelzeile ist EINE Zeile.
   DER BEGRIFF DAGEGEN WIRD GENOMMEN, WIE ER GETIPPT UND GETRIMMT IST, weil
   genau so auch gesucht wurde: instr() vergleicht Zeichen fuer Zeichen. Wer
   ihn hier zusaetzlich einebnete, suchte im Ausschnitt nach etwas anderem als
   im Bestand -- und die Oberflaeche, die den Begriff im Ausschnitt wiederfinden
   muss, haette eine dritte Lesart. */
const oneLine = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/* DIE SPRACHE STEHT DABEI -- 0.24.0, Bauabschnitt 4. Kleinschreibung ist
   keine feste Rechnung: das tuerkische I wird zu ı und nicht zu i. Verglichen
   wird hier Sprache, also fragt der Vergleich die Sprache. */
function snippet(text, term, locale = LANGUAGE_DEFAULT) {
  const row = oneLine(text);
  const b = String(term ?? '');
  if (!b) return row.slice(0, SNIPPET_LENGTH);
  const ort = localeTag(locale);
  const place = row.toLocaleLowerCase(ort).indexOf(b.toLocaleLowerCase(ort));
  /* GEFUNDEN WIRD SIE HIER NORMALERWEISE WIEDER -- gesucht hat SQLite auf dem
     Rohtext, geschnitten wird auf dem eingeebneten. Ein Begriff, der selbst
     einen doppelten Leerraum traegt, ist danach nicht mehr zu finden; dann
     steht der Anfang des Textes da statt gar nichts. Ein stiller Fehlgriff
     waere ein Ausschnitt OHNE die Fundstelle -- der Anfang ist wenigstens
     wahr. */
  const von = place < 0 ? 0 : Math.max(0, place - SNIPPET_LEAD);
  const bis = von + SNIPPET_LENGTH;
  return (von > 0 ? '…' : '') + row.slice(von, bis) + (bis < row.length ? '…' : '');
}

/* DER BEGRIFF WIRD GENAU SO ZUGESCHNITTEN WIE VORHER IM BROWSER: aussen
   getrimmt, klein geschrieben. Ein Begriff, von dem danach nichts uebrig ist,
   ist KEINE Suche und keine Suche ohne Treffer -- die Liste bleibt dann die
   ganze Liste. Zurueck kommt eine Abbildung Nummer -> Trefferkontext und
   keine Reihenfolge: sortiert wird die Liste selbst, an einer Stelle. */
const fulltextTerm = (roh, locale = LANGUAGE_DEFAULT) =>
  (typeof roh === 'string' ? roh.trim().toLocaleLowerCase(localeTag(locale)) : '');

/* WAS JE EINTRAG HERAUSKOMMT: die erste getroffene Quelle der festen Folge,
   ihr Ausschnitt und die Zahl der WEITEREN getroffenen Quellen.
   EINE ZEILE JE KACHEL UND NICHT EINE JE QUELLE -- die Kachel ist dicht, und
   sieben moegliche Zeilen machten aus der Uebersicht eine Liste von
   Fundstellen. Die Zahl daneben sagt, dass es mehr zu sehen gibt.
   `weitere` ZAEHLT QUELLEN UND KEINE VORKOMMEN: „und 2 weitere Stellen" heisst
   „in zwei weiteren der sieben Quellen", nicht „noch zweimal im selben Text".
   DIE BENENNUNG DER QUELLE BLEIBT DER OBERFLAECHE UEBERLASSEN: hier steht ein
   Schluessel, kein Wort. „Tag am Testtag" heisst je nach eingestelltem
   Vokabular anders, und das weiss die Oberflaeche. */
const fulltextHits = (term, locale = LANGUAGE_DEFAULT) => new Map(qFulltext.all({ q: term }).map(r => {
  const hit = FULLTEXT_SOURCES.filter(q => r['f_' + q.schluessel] != null);
  const first = hit[0];
  return [r.id, first ? {
    quelle: first.schluessel,
    text: snippet(r['f_' + first.schluessel], term, locale),
    weitere: hit.length - 1
  } : null];
}));

/* ---- ZWEI ZAHLEN, DIE MIT DER LISTE MITREISEN -- 0.16.0 ----------------
   BEIDE HAENGEN AN EINER ANTWORT, DIE ES OHNEHIN GIBT, und das ist der ganze
   Punkt. Der Zaehler „Offen 7" war in 0.8.60 genau daran gescheitert: er
   haette bei JEDEM Seitenaufbau einen eigenen Weg gefragt. Hier faellt kein
   zusaetzlicher Abruf an -- die Uebersicht holt diese Liste ohnehin.

   JE EINE GRUPPENABFRAGE FUER DIE GANZE LISTE, nicht eine je Eintrag: bei
   tausend Eintraegen waeren das zweitausend Abfragen fuer zwei Zahlen.
   Dieselbe Ueberlegung wie bei qMyPins und authorCard() darunter. */
const qOpenPerEntry = db.prepare(
  `SELECT item_id, COUNT(*) AS n FROM comments WHERE kind = 'task' GROUP BY item_id`);
/* WAS SEIT DEM BEZUGSPUNKT DAZUGEKOMMEN IST -- Kommentare und Bewertungen
   getrennt gefragt, weil sie in verschiedenen Tabellen stehen.
   VON ALLEN UND NICHT NUR VON ANDEREN. Bis 0.16.0 fielen die eigenen Beitraege
   heraus; damit meldete die Glocke einem Betreiber, der ALLEIN arbeitet, nie
   etwas -- sie war fuer ihn eine Anzeige ohne Inhalt. Die Auskunft „was hat
   sich getan, seit ich zuletzt hier war" trug bis dahin die Pille „Neu
   seit ..."; mit ihr faellt die Sonderbehandlung fuer den einen Zugang weg.
   EINE REGEL STATT ZWEI: eine Ausnahme fuer den Fall „ein Zugang" waere selbst
   wieder eine zweite Wahrheit. Die Tafel sagt bei jeder Zeile dazu, VON WEM --
   damit bleibt unterscheidbar, was ein anderer getan hat und was man selbst.
   DIE ZURUECKGENOMMENE ENTSCHEIDUNG STEHT HIER, damit sie niemand wieder
   einbaut: „Eigene Beitraege stehen nie hier" galt in 0.16.0 und gilt seit
   0.17.0 nicht mehr.
   GRUPPIERT WIRD NACH EINTRAG UND VERFASSER. Das ist DIESELBE eine Abfrage,
   nur eine Spalte breiter -- kein zusaetzlicher Weg je Eintrag, und dieselbe
   Ueberlegung wie bei qOpenPerEntry darueber.
   NUR WERTE UEBER NULL: eine zurueckgesetzte Bewertung hinterlaesst eine Zeile
   mit 0, und die ist keine Stimme -- dieselbe Regel wie ueberall sonst.
   gesetzt_am IS NOT NULL: was vor 0.16.0 entstanden ist und was eingespielt
   wurde, traegt keinen Zeitpunkt. Die Glocke uebergeht es, statt es fuer neu
   zu erklaeren. Der Vergleich `> ?` faellt bei NULL ohnehin nicht wahr aus;
   die Bedingung steht trotzdem da, weil sie die Absicht sagt. */
/* DIE EIGENE HAND ZAEHLT NICHT -- `user_id IS NOT ?` in beiden Abfragen.
   `IS NOT` UND NICHT `!=`: eine herrenlose Zeile traegt user_id NULL, und
   `NULL != 1` ist in SQL nicht wahr, sondern NULL. Mit `!=` fielen genau die
   Zeilen still heraus, deren Verfasser entfernt wurde.
   EINE GLOCKE IST EINE NACHRICHT VON JEMAND ANDEREM. Wer selbst einen
   Kommentar schreibt oder einen Stern setzt, weiss das; ihm dafuer einen Punkt
   zu zeigen, ist keine Auskunft, sondern ein Echo.
   DAS IST DIE ZWEITE WENDE AN DIESER ENTSCHEIDUNG, und beide Vermerke bleiben
   stehen (Stolperstein 201): 0.16.0 schloss die eigenen aus, 0.17.0 nahm das
   zurueck -- mit der Begruendung, einer Betreiberin, die ALLEIN arbeitet, melde
   eine Glocke, die nur Fremdes zeigt, nie etwas --, und 0.17.2 stellt 0.16.0
   wieder her.
   DIE FOLGE IST GEWOLLT UND GEHOERT AUSGESPROCHEN: bei genau einem Zugang
   bleibt die Glocke still, und die Pille „Neu seit …" gibt es seit 0.17.0 nicht
   mehr. Wer allein arbeitet, hat nichts, wovon ihm jemand berichten muesste --
   das ist die Antwort auf dieselbe Frage, und diesmal die richtige.
   DER BEZUGSPUNKT WIRD TROTZDEM WEITER GESETZT (siehe glockeGesehen): sonst
   staute sich beim ersten fremden Beitrag alles seit Wochen auf. */
const qNewComments = db.prepare(
  `SELECT item_id, user_id, COUNT(*) AS n FROM comments
    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id, user_id`);
const qNewRatings = db.prepare(
  `SELECT item_id, user_id, COUNT(*) AS n FROM ratings
    WHERE gesetzt_am IS NOT NULL AND gesetzt_am > ? AND value > 0 AND user_id IS NOT ?
    GROUP BY item_id, user_id`);

app.get('/api/items', (req, res) => {
  let rows = qAllItems.all();
  const term = fulltextTerm(req.query.q, localeOf(req));
  /* DIE FUNDSTELLEN KOMMEN AUS DERSELBEN ABFRAGE WIE DER FILTER -- kein
     zweiter Weg und keine Abfrage je Eintrag. Ohne Begriff bleibt die
     Abbildung leer, und weiter unten faellt das Feld damit aus der Antwort. */
  const hits = term ? fulltextHits(term, localeOf(req)) : new Map();
  if (term) rows = rows.filter(r => hits.has(r.id));
  /* DIE ZEITLEISTE EINMAL FUER DIE GANZE LISTE GEFRAGT, nicht je Eintrag:
     eine persoenliche Einstellung aendert sich innerhalb einer Antwort nicht.
     Ist sie aus, faellt `testDays` aus der Antwort -- gemessen 6 Prozent.
     AUS DER LISTENANTWORT LIEST DAS FELD GENAU EINE STELLE, zeitleistePunkte();
     Kachel und Vergleich rechnen aus anderen Feldern. */
  const zeitleiste = timelineOn(req.benutzer.id);
  // Eine Abfrage fuer die ganze Liste statt einer je Zeile. Die
  // Sortierung bleibt updated_at fuer alle -- die Uebersicht zeigt, wo etwas
  // geschieht, nicht wo ich zuletzt war. Nach vorn zieht der eigene Favorit
  // erst in der Oberflaeche, und nur fuer den, dem er gehoert.
  const myPins = new Set(qMyPins.all(req.benutzer.id).map(p => p.item_id));
  // Einmal fuer die ganze Liste, nicht je Eintrag -- sonst stuende dieselbe
  // Abfrage bei hundert Eintraegen hundertmal.
  const card = authorCard();
  const openPer = new Map(qOpenPerEntry.all().map(z => [z.item_id, z.n]));
  /* OHNE GESPEICHERTEN BEZUGSPUNKT GIBT ES KEINE GLOCKE -- dieselbe Lage und
     dieselbe Antwort wie bei „Neu seit meinem letzten Besuch". Vor dem ersten
     Oeffnen der Tafel weiss die Instanz nicht, was jemand schon gesehen hat;
     alles fuer neu zu erklaeren waere eine Behauptung, und der erste Blick in
     die Uebersicht laeutete fuer den ganzen Bestand.
     DIE DREI ANGABEN FEHLEN DANN GANZ und stehen nicht auf 0 beziehungsweise
     leer: die Oberflaeche unterscheidet „nichts Neues" von „es gibt keinen
     Bezugspunkt", und ein stilles 0 machte aus der zweiten Lage die erste. Sie
     fehlen GEMEINSAM -- eine Antwort mit nur einer davon waere eine dritte
     Lage, die niemand kennt.
     DREI ANGABEN UND KEINE ABFRAGE MEHR ALS VORHER -- 0.17.0. Die Trennung
     nach Kommentaren und Bewertungen liegt schon in den beiden Abfragen; bis
     0.16.0 wurden sie erst hier zu EINER Zahl zusammengezaehlt, und damit ging
     die Auskunft verloren, WAS dazugekommen ist. Wer dazugekommen ist, steht
     in derselben Zeile.
     KEINE SUMME AN DER ANTWORT: sie folgt aus den beiden Zahlen, und eine
     Summe neben ihren Teilen waere eine zweite Wahrheit ueber dieselbe Sache
     (Stolperstein 47). Gebildet wird sie in der Oberflaeche, an einer Stelle. */
  const reference = glockeGesehen(req.benutzer.id);
  const newCommentsPer = new Map(), neuBewJe = new Map(), neuVonJe = new Map();
  if (reference) {
    /* WER EINEN KOMMENTAR GESCHRIEBEN HAT -- je Eintrag eine Menge von
       Zugangsnummern. Eine Nummer, die zweimal vorkommt, steht einmal darin:
       die Tafel sagt, WER, nicht wie oft. `null` bleibt drin -- eine
       herrenlose Zeile hat ihren Verfasser verloren, und das ist etwas anderes
       als „niemand".
       AUS DEN KOMMENTAREN UND AUSDRUECKLICH NICHT AUS DEN BEWERTUNGEN, und das
       ist keine Nachlaessigkeit: WER WELCHE BEWERTUNG ABGEGEBEN HAT, IST EINE
       ANGABE UEBER EINZELNE PERSONEN. Sie geht aus keiner Antwort hinaus, die
       jeder bekommt -- die Liste „Wer hat bewertet" holt der Admin ueber einen
       eigenen Weg (GET /api/items/:id/votes), und die Zeile am Eintrag zeigt
       Schnitt und Zahl der Bewerter, nie einen Namen.
       EIN KOMMENTAR TRAEGT SEINEN VERFASSER OHNEHIN SICHTBAR am Eintrag; ein
       Name in der Tafel gibt daran nichts preis, was nicht schon dastuende.
       Eine Bewertung tut das nicht.
       DIE TAFEL ZEIGT DAMIT GENAU DAS, WAS DER EINTRAG SELBST ZEIGT -- eine
       Regel und nicht zwei. Eine Zeile mit ausschliesslich neuen Bewertungen
       traegt deshalb keinen Namen; „2 Bewertungen" ist dort die ganze
       Auskunft. */
    /* DIE EINDEUTIGKEIT KOMMT AUS DEM GROUP BY, NICHT AUS DER MENGE. Die
       Abfrage gruppiert nach Eintrag UND Verfasser und liefert je Paar genau
       eine Zeile; die Menge hier ist das zweite Netz und nicht das erste.
       DAS IST NACHGEMESSEN UND NICHT GEGLAUBT: ein Rueckbau, der die Menge
       gegen eine Liste tauschte, blieb STUMM -- er konnte nichts bewirken,
       weil es nichts zu entdoppeln gibt. Die Zusage haengt am GROUP BY, und
       dort greift seit 0.17.0 auch der Rueckbau (Stolperstein 235). */
    const wer = (id, uid) => {
      if (!neuVonJe.has(id)) neuVonJe.set(id, new Set());
      neuVonJe.get(id).add(uid);
    };
    /* BEIDE ABFRAGEN BEKOMMEN DENSELBEN ZWEITEN WERT. Zoege man ihn nur an
       einer nach, meldete die Tafel Bewertungen von jemandem, dessen Kommentare
       sie verschweigt -- eine Zeile mit einem Namen und einer Zahl, die nicht
       zueinander gehoeren.
       `IS NOT` UND NICHT `!=`: eine herrenlose Zeile traegt `user_id = NULL`,
       und `NULL != 1` ist in SQL weder wahr noch falsch, sondern NULL -- die
       Zeile fiele stillschweigend heraus. `IS NOT` vergleicht auch NULL. */
    for (const z of qNewComments.all(reference, req.benutzer.id)) {
      newCommentsPer.set(z.item_id, (newCommentsPer.get(z.item_id) || 0) + z.n);
      wer(z.item_id, z.user_id);
    }
    for (const z of qNewRatings.all(reference, req.benutzer.id))
      neuBewJe.set(z.item_id, (neuBewJe.get(z.item_id) || 0) + z.n);
  }
  /* DIE FOTOS ALLER EINTRAEGE IN EINER ABFRAGE, seit 0.19.2 -- vorher eine je
     Eintrag. DIESELBE BAUFORM WIE bei den neuen Kommentaren und Bewertungen
     eine Schleife hoeher: einmal fragen, in eine Karte legen, in der Schleife
     nachschlagen.

     ZWEI GRUENDE, UND BEIDE GEMESSEN (400 Eintraege, 400 Fotos, 312 MB):
       N Abfragen aus dem Satz                9,3 ms
       N Abfragen aus dem deckenden Index     3,0 ms
       EINE Abfrage aus dem deckenden Index   1,6 ms
     Der groessere Anteil kommt vom Index (`idx_photos_kachel` in db.js): SIEBEN
     der zehn Spalten stehen in `photos` hinter den Blobs, und wer sie aus dem
     Satz liest, liest dessen Overflow-Ketten mit (Stolperstein 279). Der
     kleinere kommt daraus, dass eine Abfrage eine ist und nicht
     vierhundert. `qPhotos` war damit der groesste Einzelposten dieser Route --
     rund ein Drittel von 26 ms; die Nachbarn kosten 0,9 bis 2,1 ms.

     GEHOLT WERDEN ALLE FOTOS, nicht nur die der gezeigten Eintraege. Bei einer
     gefilterten Uebersicht faellt damit etwas ab, das niemand braucht -- aus
     dem Index gelesen kostet das nichts, und ein `IN (…)` mit vierhundert
     Nummern waere teurer als die Ersparnis.

     `qPhotos` BLEIBT UND WIRD WEITER GEBRAUCHT: detail() holt damit die Fotos
     EINES Eintrags. Dort ist die Zeilenzahl einstellig, und eine zweite
     Bauform daneben waere eine zweite Wahrheit ueber dasselbe. Beide lesen
     dieselben Spalten in derselben Folge -- eine Pruefung haelt das fest. */
  const photosPer = new Map();
  for (const f of qAllPhotos.all()) {
    if (!photosPer.has(f.item_id)) photosPer.set(f.item_id, []);
    photosPer.get(f.item_id).push(f);
  }
  /* UND DIE UEBRIGEN FUENF DERSELBE WEG — 0.19.3. Was 0.19.2 fuer die Fotos
     gebaut hat, gilt hier fuer die Nachbarn: einmal fragen, in eine Karte
     legen, in der Schleife nachschlagen. AUS 3200 ABFRAGEN JE ABRUF WERDEN 405
     -- die fuenf gebuendelten schrumpfen auf je eine, `testStats` bleibt bei
     400. (Der Auftrag zu dieser Runde schrieb „neun"; er hatte testStats
     mitgezaehlt, das nach der Messung in E ausdruecklich NICHT gebuendelt
     wird. Nachgezaehlt am gebauten Stand sind es 405.)

     GEZAEHLT AN 400 EINTRAEGEN mit je drei Schlagworten, drei Bewertungen,
     drei Testtagen und einem Link -- so war der Bestand gebaut, an dem
     gemessen wurde:
       qTags                       400
       qLinks                      400
       qAnhangZahl                 400
       averagesPerCriterion         400
       testStats                   400
       qTestDays -> qTestDaysRaw   400
       qTestDays -> qTestDayTags  1200   (je TESTTAG eine)
       zusammen                   3200

     `testStats` IST NICHT DABEI, UND DAS IST GEMESSEN UND KEIN VERSEHEN:
     gebuendelt kostet es 2,58 ms statt 1,94 -- die eine Abfrage mit
     Fensterfunktion kostet mehr, als die 400 Einzelabfragen sparen. EINE
     BUENDELUNG IST KEIN SELBSTZWECK; sie lohnt, wo sie etwas spart, und sonst
     nicht.

     GEHOLT WIRD JEWEILS ALLES und nicht `IN (…)` mit vierhundert Nummern --
     dieselbe Begruendung wie bei den Fotos: die gefilterte Uebersicht wirft
     dann etwas weg, und das ist billiger als die Liste zu binden.

     DIE EINZELFASSUNGEN BLEIBEN ALLE STEHEN, wo detail() sie braucht: dort
     geht es um EINEN Eintrag, und eine zweite Bauform daneben waere keine
     Ersparnis, sondern eine zweite Wahrheit. */
  const tagsPer = new Map();
  for (const z of qAllTags.all()) {
    if (!tagsPer.has(z.item_id)) tagsPer.set(z.item_id, []);
    tagsPer.get(z.item_id).push(z);
    delete z.item_id;
  }
  const linkCountPer = new Map(qLinkCounts.all().map(z => [z.item_id, z.n]));
  const attachmentCountPer = new Map(qAttachmentCounts.all().map(z => [z.item_id, z.n]));
  const averagesPer = averagesPerEntry();
  const catPer = new Map(qAllCategories.all().map(k => [k.id, k]));
  // Die Testtage nur, wenn die Zeitleiste ueberhaupt an ist -- wie bisher.
  const testDaysPer = zeitleiste ? testDaysPerEntry(req.benutzer.id) : null;
  for (const it of rows) {
    it.rejected = !!it.rejected; it.tested = !!it.tested;
    it.verfasser = authorFrom(card, it.user_id);
    delete it.user_id;
    it.favorite = myPins.has(it.id);
    const ph = photosPer.get(it.id) || [];
    // Das erste Element ist das Hauptbild, gleich welcher Art -- bei einem
    // Video steht dort sein Standbild. Die beiden Zaehler daneben sind
    // getrennt: photoCount zaehlt Fotos und hat damit dieselbe Bedeutung wie
    // vorher, videoCount ist der neue Nachbar. Zusammengezaehlt hiesse ein
    // Video kuenftig "Foto", und eine aeltere Oberflaeche laese es falsch.
    it.mainPhoto = ph[0] || null;
    it.photoCount = ph.filter(p2 => p2.art !== 'video').length;
    it.videoCount = ph.filter(p2 => p2.art === 'video').length;
    it.category = it.product_category_id ? (catPer.get(it.product_category_id) || null) : null;
    it.tags = tagsPer.get(it.id) || [];
    /* NUR DIE ZAHL, NICHT DIE ZEILEN. Bis 0.19.2 holte die Uebersicht je
       Eintrag die vollen Linkzeilen und nahm davon `.length` -- die Kachel
       zeigt nichts davon ausser dieser Zahl. */
    it.linkCount = linkCountPer.get(it.id) || 0;
    it.attachmentCount = attachmentCountPer.get(it.id) || 0;
    // Dieselbe Rechnung wie in detail(), ueber denselben Helfer. Zwei
    // Rechenwege fuer die Kachel und die Zeile daneben waeren zwei Wahrheiten
    // ueber dieselbe Zahl. Was sich geaendert hat, ist woher die Karte kommt --
    // nicht, was mit ihr geschieht.
    const boxes = averagesPer.get(it.id) || EMPTY_BOXES();
    it.avgRating = totalAverage(boxes.nachher);
    /* DIE ZWEITE ZAHL STEHT NEBEN DER ERSTEN UND NICHT STATT IHRER -- auch an
       einem getesteten Eintrag. Welche die Kachel zeigt, entscheidet der
       Browser; welche es GIBT, entscheidet der Bestand. Eine Antwort, die je
       nach `tested` mal die eine und mal die andere traegt, machte aus dem
       Sortieren nach Potenzial eine Sortierung ueber eine luckenhafte Menge. */
    it.potenzialRating = totalAverage(boxes.vorher);
    Object.assign(it, testStats(it.id));
    /* DIE ZEITLEISTE BRAUCHT DIE TESTTAGE SELBST, nicht nur ihre Anzahl -- und
       dazu, wem sie gehoeren. Ohne sie braucht die Liste sie nicht.
       SEIT 0.19.3 IN DER SCHMALEN FASSUNG: id, day, rating, mine. Die
       Schlagworte und der Verfasser jedes Testtags stehen weiter am EINTRAG
       (detail() ruft qTestDays), nur nicht mehr in der Liste -- gelesen hat
       sie dort niemand. Die Begruendung steht bei qAllTestDaysNarrow. */
    if (zeitleiste) it.testDays = testDaysPer.get(it.id) || [];
    /* DIE BESCHREIBUNG FAELLT AUS DER LISTE, WIE BISHER. Sie stand nie in
       dieser Antwort -- gebraucht wurde sie allein zum Bilden des Suchfelds,
       und das gibt es nicht mehr. Die Kachel zeigt keine Beschreibung; wer sie
       will, holt den Eintrag. */
    delete it.description;
    /* UND DIE DREI ANGABEN ZUR ABLEHNUNG EBENSO. Die Kachel zeigt die Marke
       "abgelehnt" und sonst nichts dazu -- ein Grund gehoert an den Eintrag
       und nicht in eine Kachelreihe; wer ihn dort hineinschreibt, baut eine
       zweite Anzeige derselben Sache.
       rejected_von MUSS hier weg, nicht nur darf: es ist eine nackte
       Zugangsnummer, und die geht aus keiner Antwort hinaus. */
    delete it.rejected_at; delete it.rejected_grund; delete it.rejected_von;
    /* DIE ZAHL DER OFFENEN AUFGABEN AN DIESEM EINTRAG. Der Knopf in der
       Kopfzeile summiert sie; die Ansicht „Offene Aufgaben" holt weiterhin
       ihre eigene Liste ueber /api/open -- die braucht die Texte, nicht nur
       die Zahl. Gerechnet wird beides aus DERSELBEN Bedingung (kind = 'task'),
       sonst naennten Knopf und Ansicht zwei verschiedene Zahlen. */
    it.offeneAufgaben = openPer.get(it.id) || 0;
    /* DER TREFFERKONTEXT -- 0.18.0. WARUM EIN EINTRAG IN DER TREFFERLISTE
       STEHT, und zwar nur dann, wenn wirklich gesucht wurde: ohne Begriff
       faellt das Feld ganz aus der Antwort, wie testDays es bei
       ausgeschalteter Zeitleiste vormacht. Ein leeres Feld waere eine dritte
       Lage neben „getroffen" und „gar nicht gesucht".
       ES IST EINE ERWEITERUNG UND KEINE WEGNAHME: was vorher in der Antwort
       stand, steht Zeichen fuer Zeichen weiter da. */
    if (term) it.fundstelle = hits.get(it.id);
    /* DREI ANGABEN, UND SIE STEHEN ODER FEHLEN GEMEINSAM. Die Verfasser gehen
       als dieselben Objekte hinaus wie ueberall sonst -- aus authorCard(),
       nicht als nackte Zugangsnummern. */
    if (reference) it.neuKommentare = newCommentsPer.get(it.id) || 0;
    if (reference) it.neuBewertungen = neuBewJe.get(it.id) || 0;
    if (reference) it.neuVon = [...(neuVonJe.get(it.id) || [])].map(uid => authorFrom(card, uid));
  }
  res.json(rows);
});

app.get('/api/items/:id', (req, res) => {
  const it = detail(req.params.id, req.benutzer.id);
  if (!it) return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
  res.json(it);
});

app.post('/api/items', (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: t(localeOf(req), 'server.titleMissing')});
  // Der Anlegende ist der Verfasser. req.benutzer steht an
  // jedem geschuetzten Endpunkt (auth.js, requireAuth). BEWUSST OHNE ?.: fiele
  // es je weg, soll das mit einem Fehler auffallen und nicht als stille Zeile
  // ohne Benutzer, die der naechste Start heimlich nachtraegt.
  const i = db.prepare('INSERT INTO items (title, description, user_id) VALUES (?, ?, ?)')
    .run(title, req.body.description || '', req.benutzer.id);
  res.status(201).json(detail(i.lastInsertRowid, req.benutzer.id));
});

/* DIE BEGRUENDUNG EINER ABLEHNUNG -- EINE ZEILE TEXT.
   Zugeschnitten wie jeder andere freie Text, der als Beschriftung erscheint:
   Weissraum eingeebnet, aussen getrimmt, hinten gekappt. Das Einebnen ist der
   Punkt und keine Zierde -- die Angabe steht als EINE Zeile an der Marke, und
   ein eingefuegter Absatz zerrisse sie dort.
   MASKIERT WIRD IN DER OBERFLAECHE, wie am Anbieternamen: hier faellt nur weg,
   was die Zeile sprengt.
   200 ZEICHEN wie am Suchbegriff einer gespeicherten Ansicht -- das ist in
   dieser Instanz das Mass fuer "eine Zeile". Wer mehr zu sagen hat, sagt es in
   einem Kommentar; dafuer gibt es ihn. */
const REASON_LENGTH = 200;
const reasonText = (v) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, REASON_LENGTH) : '';

app.put('/api/items/:id', (req, res) => {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!it) return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
  const b = req.body || {};

  /* DIESE ROUTE TRAEGT ZWEI RECHTEKLASSEN IN EINEM RUMPF, und das ist
     verlangt: `favorite` ist persoenlich -- jeder setzt seinen eigenen an
     jedem Eintrag, auch an einem fremden (item_pins). Alles andere gehoert
     dem Verfasser und dem Admin. Deshalb sitzt die Klemme hier und nicht als
     Waechter vor der Route.
     UND SIE SITZT VOR DEM ERSTEN SCHREIBEN: eine Absage, die den Favoriten
     schon gesetzt hat, waere schlimmer als gar keine. */
  const authorOnlyFields = AUTHOR_ONLY_FIELDS.filter(f => b[f] !== undefined);
  if (authorOnlyFields.length && !mayChange(req, it.user_id))
    return res.status(403).json({ error: t(localeOf(req), DENIED_ENTRY)});

  /* ---- Die Klemme an der Begruendung ----
     ZURUECKNEHMEN DARF DAS MERKMAL, WER DEN EINTRAG AENDERN DARF; UMSCHREIBEN
     DARF DIE BEGRUENDUNG NUR, WER SIE GETROFFEN HAT. Das ist `selfOnly` --
     "Loeschen ja, umschreiben nein" --, angewandt auf ein Feld, das nicht dem
     Verfasser des EINTRAGS gehoert, sondern dem der ENTSCHEIDUNG. Beide sind
     nicht dasselbe: `rejected` steht hinter mayChange, ein Admin kann also
     einen fremden Eintrag ablehnen, und dann steht SEIN Name unter der
     Begruendung.
     ES IST EINE VERSCHAERFUNG GEGENUEBER 0.13.2, wo an diesen Feldern
     durchweg mayChange galt.

     DREI FAELLE KOMMEN DURCH; die ersten beiden sind keine fremde Aussage:
       1. WER GERADE ABLEHNT, schreibt seine eigene Begruendung. Er wird in
          diesem Zug rejected_von und ist damit ihr Verfasser.
       2. STEHT GAR KEIN VERFASSER DA, gibt es auch keine fremde Aussage. Das
          ist der Fall einer Ablehnung aus einer Instanz vor 0.14.0: der
          Migrationsblock laesst die Spalten leer, und ohne diesen Zweig
          bekaeme so eine Ablehnung nie eine Begruendung. Wer sie hinschreibt,
          wird ihr Verfasser.
     DER WEG UEBER AUS UND WIEDER EIN BLEIBT OFFEN, und das ist dieselbe Regel
     und kein Loch: eine fremde Entscheidung ZURUECKNEHMEN darf, wer den
     Eintrag aendern darf. Wer sie danach neu trifft, trifft eine eigene --
     mit eigenem Datum, eigenem Namen und eigenem Text.

     UND DER DRITTE FALL IST DAS ENTFERNEN, und er kommt ausdruecklich durch.
     "Loeschen ja, umschreiben nein" heisst am Kommentar: den TEXT aendert nur
     der Verfasser, WEGNEHMEN darf auch der Admin. An dieser Stelle galt bis
     0.14.0 `selfOnly` fuer JEDES Schreiben -- damit konnte ein Admin eine
     fremde Begruendung weder umschreiben noch entfernen, und das war strenger
     als ueberall sonst im Haus. Die Zuruecknahme steht hier ausdruecklich
     dabei, damit sie nicht als Versehen wiederkommt.
     WAS "ENTFERNEN" HEISST, ENTSCHEIDET `reasonText()` UND NICHT DER ROHWERT:
     ein Rumpf mit lauter Leerzeichen ist ein Entfernen, und ein zweiter
     Massstab daneben liefe damit auseinander.
     DIE KLEMME DAFUER IST `mayChange`, UND SIE IST SCHON DURCH: die Zeile
     oben laesst `rejectedGrund` nur passieren, wer den Eintrag aendern darf.
     Hier bleibt deshalb nur, den strengeren Fall zu ueberspringen -- keine
     zweite Klemme daneben. */
  const turnsOn = b.rejected !== undefined && !!b.rejected && !it.rejected;
  const removedReason = b.rejectedGrund !== undefined && !reasonText(b.rejectedGrund);
  if (b.rejectedGrund !== undefined && !turnsOn && !removedReason &&
      it.rejected_von != null && !selfOnly(req, it.rejected_von))
    return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});

  // "Getestet" laesst sich nicht zuruecknehmen, solange Testtage eingetragen sind.
  if (b.tested === false) {
    const n = db.prepare('SELECT COUNT(*) n FROM test_days WHERE item_id = ?').get(req.params.id).n;
    if (n > 0) {
      const v = vokabular();
      // Vokabelwoerter stehen ohne Artikel und ohne Fall da: nach einer Zahl
      // im Nominativ und in Anfuehrungszeichen. Beides bleibt bei jedem Wort
      // richtig, gleich welches Geschlecht.
      return res.status(409).json({
        error: t(localeOf(req), 'server.testedStays', { n })});
    }
  }

  // Der Favorit ist KEINE Spalte von items und laeuft deshalb nicht durch die
  // Klemme darunter. Zwei Folgen, beide gewollt:
  //   1. Er trifft nur den eigenen Platz.
  //   2. ER RUEHRT updated_at NICHT AN: als Spalte schoebe er den Eintrag in
  //      JEDER Uebersicht nach oben -- wer hier ein touch.run() hinsetzt,
  //      macht die eigene Ablage zur Nachricht an alle.
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
  /* DIE DREI ANGABEN SIND EINE AUSSAGE UND WERDEN ZUSAMMEN GESCHRIEBEN.
     Beim Einschalten setzt der Server alle drei: Datum auf jetzt, Verfasser
     auf den Handelnden, Grund auf das, was im Rumpf steht -- steht dort
     keiner, wird er leer. Sonst truege die neue Entscheidung den Satz einer
     anderen Person, und das ist genau das, was selfOnly verhindern soll.
     DAS DATUM KOMMT VOM SERVER UND NIE AUS DEM RUMPF, wie updated_at daneben.
     BEIM AUSSCHALTEN WIRD NICHTS GELOESCHT: die drei bleiben stehen. Eine
     Angabe, die niemand wiederherstellen kann, wird nicht weggeworfen, nur
     weil ein Schalter umgelegt wird -- und der Dialog bietet die alte
     Begruendung beim erneuten Ablehnen als Vorschlag an.
     WIRD NUR DIE BEGRUENDUNG NACHGETRAGEN, bleibt rejected_at leer, wenn es
     leer war: ein nachgetragener Grund erfindet kein Datum. Nur der
     Verfasser wird gesetzt, und auch das nur, wenn keiner dasteht. */
  if (turnsOn) {
    // datetime('now') wie an created_at und updated_at daneben: die Zeit
    // kommt aus der Datenbank und nie aus dem Rumpf -- und auch nicht aus
    // einer zweiten Quelle in JS, die um Sekunden danebenlaege.
    sets.push(`rejected_at = datetime('now')`);
    put('rejected_von', req.benutzer.id);
    put('rejected_grund', reasonText(b.rejectedGrund));
  } else if (b.rejectedGrund !== undefined) {
    put('rejected_grund', reasonText(b.rejectedGrund));
    /* WER ENTFERNT, WIRD NICHT VERFASSER. Der Zweig traegt einen Verfasser
       nach, wo keiner steht -- das ist der Fall einer Ablehnung aus einer
       Instanz vor 0.14.0, in der jemand einen Text hinschreibt. Ein leeres Feld
       hat keinen Verfasser, und wer es leert, hat nichts geschrieben. */
    if (it.rejected_von == null && !removedReason) put('rejected_von', req.benutzer.id);
  }
  if (b.tested !== undefined) put('tested', b.tested ? 1 : 0);
  if (b.productCategoryId !== undefined) put('product_category_id', b.productCategoryId);
  if (sets.length) {
    sets.push(`updated_at = datetime('now')`);
    db.prepare(`UPDATE items SET ${sets.join(', ')} WHERE id = ?`).run(...vals, req.params.id);
  }
  res.json(detail(req.params.id, req.benutzer.id));
});

/* Die Zahlen fuer den Loeschdialog am Eintrag. Lesend, deshalb kein Eintrag
   in F_ROUTEN; der Waechter steht trotzdem davor.
   GETRENNT NACH EIGEN UND FREMD AUS SICHT DES LOESCHENDEN: die Frage lautet
   "was nehme ich ANDEREN weg". IS NOT statt !=, weil user_id leer sein darf.
   NUR DIE FOTOS STEHEN MIT EINER EIGENEN ZAHL DA -- sie haengen am Eintrag;
   Links und Dateien koennen fremd sein.
   value > 0: eine zurueckgesetzte Zeile ist keine Stimme. */
app.get('/api/items/:id/inventory', entryAuthorOnly, (req, res) => {
  const id = req.params.id, ich = req.benutzer.id;
  const one = (sql, ...w) => db.prepare(sql).get(...w).n;
  res.json({
    // Zwei Zeilen, nicht eine Summe: ein Dialog, der "3 Fotos" sagt und dabei
    // ein Video mit wegwirft, verschweigt genau die Zeile, um derentwillen er
    // dasteht. `fotos` behaelt seine Bedeutung und bekommt einen Nachbarn.
    fotos: one("SELECT COUNT(*) n FROM photos WHERE item_id = ? AND art != 'video'", id),
    videos: one("SELECT COUNT(*) n FROM photos WHERE item_id = ? AND art = 'video'", id),
    eigenDateien: one('SELECT COUNT(*) n FROM attachments WHERE item_id = ? AND user_id = ?', id, ich),
    fremdDateien: one('SELECT COUNT(*) n FROM attachments WHERE item_id = ? AND user_id IS NOT ?', id, ich),
    eigenLinks: one('SELECT COUNT(*) n FROM links WHERE item_id = ? AND user_id = ?', id, ich),
    fremdLinks: one('SELECT COUNT(*) n FROM links WHERE item_id = ? AND user_id IS NOT ?', id, ich),
    eigenKommentare: one('SELECT COUNT(*) n FROM comments WHERE item_id = ? AND user_id = ?', id, ich),
    fremdKommentare: one('SELECT COUNT(*) n FROM comments WHERE item_id = ? AND user_id IS NOT ?', id, ich),
    eigenBewertungen: one('SELECT COUNT(*) n FROM ratings WHERE item_id = ? AND value > 0 AND user_id = ?', id, ich),
    fremdBewertungen: one('SELECT COUNT(*) n FROM ratings WHERE item_id = ? AND value > 0 AND user_id IS NOT ?', id, ich),
    eigenTesttage: one('SELECT COUNT(*) n FROM test_days WHERE item_id = ? AND user_id = ?', id, ich),
    fremdTesttage: one('SELECT COUNT(*) n FROM test_days WHERE item_id = ? AND user_id IS NOT ?', id, ich)
  });
});

// Loeschen darf der Verfasser und der Admin. Die Kaskade raeumt dabei
// fremde Kommentare, Bewertungen und Favoriten mit weg -- richtig, ein
// Kommentar ohne Eintrag ergibt nichts, aber es darf nicht wortlos geschehen:
// der Dialog in der Oberflaeche nennt die Zahlen vorher, getrennt nach eigen
// und fremd, aus GET /api/items/:id/inventory.
app.delete('/api/items/:id', entryAuthorOnly, (req, res) => {
  // Das Loeschen geht durch den Papierkorb: der Eintrag wird serialisiert und
  // in DERSELBEN Transaktion entfernt. Danach laeuft die Kaskade wie zuvor,
  // und der Eintrag ist wirklich weg -- er liegt nur zusaetzlich noch als
  // Paket daneben. Der Dialog in der Oberflaeche sagt es vorher;
  // "unwiderruflich" waere falsch.
  intoTrash(req.params.id, req.benutzer.id);
  reclaim();
  res.status(204).end();
});

/* ---- Fotos ---- */
// Der Waechter steht VOR multer: die Datei eines Fremden soll gar nicht erst
// eingelesen werden.
app.post('/api/items/:id/photos', entryAuthorOnly, upload.array('photos', 40), async (req, res, next) => {
  try {
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
    let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM photos WHERE item_id = ?')
      .get(req.params.id).m + 1;
    const into = db.prepare('INSERT INTO photos (item_id, mime_type, data, thumb, medium, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    for (const f of req.files || []) {
      if (!await gridImage(f.buffer))
        return res.status(400).json({ error: t(localeOf(req), 'server.imagesOnly')});
      /* DIE ABLEITUNGEN KOMMEN AUS DER VORLAGE, NICHT AUS DER ABLAGEFASSUNG.
         Beide Wege ergaeben dasselbe Bild -- `nearLossless` weicht hoechstens
         um 2 von 255 ab --, aber ein zweites Dekodieren waere Arbeit ohne
         Ertrag, und die Ausrichtung (.rotate()) liest EXIF, das in der
         WebP-Fassung nicht mehr steht. */
      const v = await makeVariants(f.buffer, DEFAULT_CROP);
      /* STRG+V UND DATEIAUSWAHL SIND HIER DERSELBE WEG, und das ist Absicht:
         in `req.files` steht eine Datei und sonst nichts -- der Server kann
         die beiden gar nicht unterscheiden, und ein Feld im Formular waere
         eine BEHAUPTUNG des Browsers darueber, wie das Archiv speichern soll.
         Er braucht die Unterscheidung auch nicht: die Zwischenablage liefert
         IMMER PNG, eine Kamera JPEG. Die Regel „PNG umwandeln, JPEG in Ruhe
         lassen" trifft damit genau das, was gemeint ist. */
      const ab = bilderUmwandeln() ? await storeImage(f.buffer, f.mimetype)
                                   : { data: f.buffer, mime: f.mimetype };
      into.run(req.params.id, ab.mime, ab.data, v.thumb, v.medium, pos++);
    }
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.benutzer.id));
  } catch (e) { next(e); }
});

/* ---- Videos ----
 * EIGENE ROUTE, nicht die Fotoroute erweitert: deren fileFilter auf ^image\/
 * zu lockern naehme sie dem Fotoweg mit ab.
 * ZWEI TEILE IN EINEM VORGANG: die Videodatei und ein JPEG. Das Standbild
 * erzeugt der Browser des Hochladenden ueber <video> und <canvas>; der Server
 * oeffnet nie ein Video und braucht deshalb kein ffmpeg.
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
  // Rumpf: typeFromBytes() an der Videodatei, gridImage() am Standbild.
  fileFilter: (req, file, cb) => {
    const good = file.fieldname === 'video' ? /^video\//.test(file.mimetype)
                                           : /^image\//.test(file.mimetype);
    cb(good ? null : new Message('server.videoNeedsStill'), good);
  }
});

// Der Waechter steht VOR multer, wie am Fotoweg: die Datei eines Fremden soll
// gar nicht erst eingelesen werden.
app.post('/api/items/:id/videos', entryAuthorOnly,
  videoUpload.fields([{ name: 'video', maxCount: 1 }, { name: 'standbild', maxCount: 1 }]),
  async (req, res, next) => {
    try {
      if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
        return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
      const video = req.files?.video?.[0], standbild = req.files?.standbild?.[0];
      if (!video || !standbild)
        return res.status(400).json({ error: t(localeOf(req), 'server.videoStill')});
      /* DER INHALT ENTSCHEIDET, nicht die Endung im Namen und nicht der
         gemeldete Typ -- dieselbe Regel wie am Fotoweg, nur mit dem
         Erkenner, der auch beim Ausliefern entscheidet. Damit kann keine
         Videozeile entstehen, die sich hinterher nicht abspielen laesst.
         AUF DIE VIDEODATEI WIRD gridImage() AUSDRUECKLICH NICHT ANGEWANDT:
         der Server oeffnet nie ein Video. Gelesen werden zwoelf Bytes. */
      if (!Object.values(anh.VIDEO_TYPES).includes(anh.typeFromBytes(video.buffer)))
        return res.status(400).json({ error: t(localeOf(req), 'server.videosOnly')});
      // Das Standbild geht denselben Weg wie jedes Foto: was sharp nicht als
      // Bild lesen kann, kommt nicht herein.
      if (!await gridImage(standbild.buffer))
        return res.status(400).json({ error: t(localeOf(req), 'server.stillNotImage')});
      // Die Dauer ist eine Angabe des Hochladenden wie der gemeldete Typ:
      // gespeichert und angezeigt, nie tragend. Unsinniges wird zu NULL.
      const d = Math.round(Number(req.body.dauer));
      const dauer = Number.isFinite(d) && d > 0 && d <= 24 * 3600 ? d : null;
      /* AUCH DAS STANDBILD WIRD ZUGESCHNITTEN -- 0.19.5, mit den Vorgaben. Die
         Videokachel wird mit `object-fit: cover` gezeigt wie jede andere;
         eine ungeschnittene truege die Kachel, die der Bestandslauf beim
         naechsten Start ohnehin ersetzt. `medium` bleibt ungeschnitten und
         ist der Poster des Abspielers. */
      const v = await makeVariants(standbild.buffer, DEFAULT_CROP);
      /* Kaeme hier nichts heraus, bliebe die Zeile OHNE Standbild -- und zwar
         dauerhaft: das Nachruesten beim Start laesst Videozeilen aus, weil es
         sonst aus der Videodatei ableiten wuerde. Ein Foto in derselben Lage
         holt seine Vorschau beim naechsten Start nach; ein Video kann das
         nicht. Deshalb lieber gar nicht anlegen als kaputt. */
      if (!v.thumb || !v.medium)
        return res.status(400).json({ error: t(localeOf(req), 'server.stillNoPreview')});
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

/* Der ausgelieferte Typ kommt aus den ersten Bytes, nie aus photos.mime_type:
   die Spalte ist eine Angabe des Hochladenden. Damit ist auch geschuetzt, was
   schon in der Datenbank liegt -- dieselbe Regel wie in attachments.js.
   Bei einem Video ist der Blob je nach Groesse etwas anderes: mit size= das
   Standbild, ohne die Videodatei; der Erkenner sieht das den Bytes an.
   BEREICHE NUR AM VIDEO UND NUR AN DER GANZEN DATEI. */
app.get('/api/photos/:id/raw', (req, res) => {
  const p = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).end();
  let blob = p.data;
  let rangeable = p.art === 'video';
  if (req.query.size === 'thumb' && p.thumb) { blob = p.thumb; rangeable = false; }
  else if (req.query.size === 'medium' && p.medium) { blob = p.medium; rangeable = false; }
  anh.setImageHeader(res, blob, { name: `foto-${p.id}`, maxAge: 86400 });
  if (!rangeable) return res.send(blob);
  res.set('Accept-Ranges', 'bytes');
  const b = anh.rangeOut(req.headers.range, blob.length);
  if (!b) return res.send(blob);
  // Ungueltiges wird abgewiesen, nicht zurechtgebogen: ein Abspieler, der
  // etwas anderes bekommt als er verlangt hat, zeigt Bildsalat statt Fehler.
  if (b.ungueltig) {
    res.set('Content-Range', `bytes */${blob.length}`);
    return res.status(416).end();
  }
  res.set('Content-Range', `bytes ${b.from}-${b.bis}/${blob.length}`);
  res.status(206).send(blob.slice(b.from, b.bis + 1));
});

/* --- Der Ausschnitt der Vorschau: drei Werte, EINE Spanne ----------------
   Zwei Wege setzen diese Werte -- die Route gleich darunter und der Import --,
   und sie unterscheiden sich in genau einem Punkt: WAS BEI UNSINN GESCHIEHT.
   Die Route sagt ab, denn dort sitzt jemand davor und soll es erfahren; der
   Import nimmt die Vorgabe, denn die Datei ist, wie sie ist, und ein Abbruch
   des ganzen Einspielens waere die schlechtere Antwort.
   WELCHE SPANNE GILT, IST BEI BEIDEN DIESELBE, und ohne diese Tafel stuende
   sie zweimal da -- genau die zweite Wahrheit, die frueher oder spaeter
   auseinanderlaeuft.

   BESCHNITTEN UND NICHT ABGEWIESEN, wo die Zahl ueberhaupt eine ist: die drei
   Werte kommen aus einem Zeigergeraet und einem Schieber, die gar nichts
   anderes senden koennen. Dieselbe Haltung wie beim Bewertungswert und
   ausdruecklich nicht die beim Gewicht, das von Hand getippt wird.

   ZOOM: 100 IST DER WEITESTE AUSSCHNITT und damit der Zustand bis 0.18.1.
   Nach unten ist bei 100 Schluss -- darunter deckte das Bild den
   quadratischen Behaelter nicht mehr, und der Rand zeigte Leere statt Bild.
   Nach oben bei 400: vier Stufen sind an einer 1600px-Ableitung das, was noch
   etwas zeigt; wer weiter zoege, saehe die Ableitung und nicht das Motiv. */
const ZOOM_MIN = 100, ZOOM_MAX = 400;
const DISPLAY_VALUES = {
  focus_x: { min: 0, max: 100, vorgabe: 50, stellen: 1 },
  focus_y: { min: 0, max: 100, vorgabe: 50, stellen: 1 },
  // Ganze Prozent: ein Ausschnitt von 137,4 % ist keine Angabe, die jemand
  // machen wollte, und der Schieber kann sie gar nicht erzeugen.
  zoom:    { min: ZOOM_MIN, max: ZOOM_MAX, vorgabe: ZOOM_MIN, stellen: 0 }
};
// null heisst "das war keine Zahl". Was das wert ist, entscheidet der Rufer.
function displayValue(name, roh) {
  const g = DISPLAY_VALUES[name];
  const n = Number(roh);
  if (!Number.isFinite(n)) return null;
  const f = 10 ** g.stellen;
  return Math.min(g.max, Math.max(g.min, Math.round(n * f) / f));
}

/* DIE VORGABE ALS ZUSCHNITT -- 0.19.5. Ein frisch hochgeladenes Foto hat noch
   keine Zeile in der Tabelle und damit keine drei Werte; erzeugt wird es
   trotzdem, und zwar mit genau den Vorgaben, die die Spalten gleich danach
   tragen. Die Zahlen stehen deshalb NICHT ein zweites Mal hier, sondern
   kommen aus ANZEIGEWERTE -- sonst liefe die Vorgabe des Uploads gegen die
   Vorgabe der Spalte. */
const DEFAULT_CROP = { fx: DISPLAY_VALUES.focus_x.vorgabe,
                            fy: DISPLAY_VALUES.focus_y.vorgabe,
                            zoom: DISPLAY_VALUES.zoom.vorgabe };

/* ---- DIE KACHEL WIRD NACH DEM SPEICHERN NEU ERZEUGT -- 0.19.5 ------------

   BIS 0.19.4 SCHRIEB DIESE ROUTE DREI ZAHLEN UND WAR FERTIG. Der Ausschnitt
   entstand im Browser, die Kachel aenderte sich sofort. Seit dieser Runde
   steckt er IM BILD -- ohne diesen Schritt zeigte die Uebersicht den alten
   Schnitt, bis irgendwann etwas anderes die Zeile anfasst.

   DIE ANTWORT WARTET DARAUF, und das ist die Entscheidung. Anders als beim
   Bestandslauf ist hier kein 202 angebracht: es ist EINE Zeile, der Benutzer
   wartet davor, und eine Kachel, die „gleich" richtig wird, ist schlechter
   als eine, die es beim Zurueckkommen ist.
   ERZEUGT WIRD IM THREAD, und das ist eine Messung -- sie steht bei
   erneuereEineKachel() in batchrun.js: das Erzeugen 157,3 ms im Median und
   247,0 ms im 95. Perzentil, das Zurueckschreiben der Kachel noch einmal bis
   zu 473,7 ms (SQLite schreibt den ganzen Satz neu, und der traegt das
   Original). AN DIESER ROUTE GEMESSEN: 494 bis 873 ms von der Anfrage bis zur
   Antwort. Die Grenze des Auftrags liegt bei rund 150 ms -- im Haupt-Thread
   staende die Event Loop dafuer fuenfmal so lange wie die 133 ms, die 0.19.3
   freigeraeumt hat.

   SCHLAEGT DAS ERZEUGEN FEHL, IST DER AUSSCHNITT TROTZDEM GESPEICHERT und die
   Zeile behaelt ihre alte Kachel. Dieselbe Regel wie ueberall: eine
   Ableitung, die schlechter ist als die alte, gibt es nicht. Deshalb steht
   das UPDATE der drei Zahlen VOR dem Thread und nicht danach.

   UND DIE ANTWORT KOMMT AUF JEDEN FALL. Ein Thread, der haengt, haenge sonst
   die Anfrage mit -- und ein Browser, der auf eine Antwort wartet, die nie
   kommt, ist schlechter als eine Kachel, die eine Fassung zu alt ist. Die
   Frist ist mit 15 Sekunden das Siebzehnfache dessen, was die Route im
   schlechtesten gemessenen Fall braucht (873 ms); wer sie erreicht, hat kein
   Zeitproblem, sondern ein anderes. Dieselbe Haltung wie bei der aeusseren
   Schranke ueber dem Mailversand.
   ZWEIMAL ANTWORTEN GEHT NICHT: `once()` haelt es fest. Ein zweites
   res.json() waere ERR_HTTP_HEADERS_SENT und naehme den Server mit. */
const REFRESH_MS = 15000;
function refreshTile(id, done) {
  let out2 = false;
  const once = () => { if (!out2) { out2 = true; clearTimeout(clock); done(); } };
  const clock = setTimeout(once, REFRESH_MS);
  /* DIE UHR DARF DEN PROZESS NICHT AM LEBEN HALTEN: sie ist eine Schranke und
     kein Termin. Ohne unref() haengt ein Herunterfahren bis zu 15 Sekunden. */
  clock.unref?.();
  try { startBatchThread('zuschnitt', [{ id: Number(id) }], once); }
  catch (e) { console.error('[Kriterion] Kachel nicht erneuert:', e.message); once(); }
}

/* Ausschnitt eines Fotos. Drei Zahlen -- und seit 0.19.5 eine neue Kachel
   daraus. DAS BILD SELBST WIRD NIE VERAENDERT: `data` bleibt unberuehrt, und
   genau deshalb bleibt der Ausschnitt jederzeit aenderbar. Was neu gerechnet
   wird, ist allein die Ableitung `thumb`.
   EINE ROUTE UND KEINE ZWEITE FUER DEN ZOOM. Er wird an derselben Stelle
   eingestellt wie der Fokuspunkt, er gehoert derselben Zeile, und eine zweite
   schreibende Route liesse F_ROUTEN wachsen, ohne dass es etwas Neues zu
   bewachen gaebe.
   DER NAME DER ROUTE BLEIBT `focus`. Ein Umbenennen braechte nichts und
   verlangte, jede Aufrufstelle mitzuziehen; die Adresse ist ein Name, keine
   Beschreibung. */
app.put('/api/photos/:id/focus', (req, res) => {
  const p = db.prepare('SELECT item_id, zoom FROM photos WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: t(localeOf(req), 'server.photoGone')});
  // Die Eintragsnummer kommt erst aus der Kindzeile -- deshalb die
  // zweite Form desselben Aufrufs, nicht eine zweite Regel.
  if (!entryFree(req, res, p.item_id)) return;
  const x = displayValue('focus_x', req.body.x), y = displayValue('focus_y', req.body.y);
  if (x === null || y === null) return res.status(400).json({ error: t(localeOf(req), 'server.cropInvalid')});
  /* DER ZOOM DARF FEHLEN und behaelt dann seinen Wert. Nicht aus Nachsicht
     gegenueber einer aelteren Oberflaeche -- die wird im selben Dateisatz
     ausgeliefert --, sondern weil zwei Bedienungen auf dieselbe Route fuehren:
     das Ziehen setzt den Punkt, der Schieber die Weite. Wer zieht, schickt
     kein `zoom` mit, und ein stilles Zuruecksetzen auf 100 naehme ihm bei
     jedem Zug den eingestellten Ausschnitt weg.
     EIN MITGESCHICKTER UNSINN IST DAGEGEN EINE ABSAGE und nicht der alte
     Wert: wer ein Feld setzt, soll erfahren, dass es nicht angekommen ist. */
  let z = p.zoom;
  if (req.body.zoom !== undefined) {
    z = displayValue('zoom', req.body.zoom);
    if (z === null) return res.status(400).json({ error: t(localeOf(req), 'server.cropInvalid')});
  }
  db.prepare('UPDATE photos SET focus_x = ?, focus_y = ?, zoom = ? WHERE id = ?')
    .run(x, y, z, req.params.id);
  touch.run(p.item_id);
  /* ERST ERZEUGEN, DANN ANTWORTEN. detail() steht IM Abschluss und nicht
     davor: es liest `length(thumb)` als Fassung mit, und die soll die NEUE
     sein -- sonst zeigte der Browser die alte Kachel unter der alten Adresse
     weiter, und der ganze Schritt waere umsonst. */
  refreshTile(req.params.id, () => res.json(detail(p.item_id, req.benutzer.id)));
});

/* ---- Anhaenge ----
 * Die Sicherheit haengt vollstaendig an der Auslieferung, siehe attachments.js.
 * Deshalb wird beim Hochladen bewusst NICHT nach Typen gefiltert: eine
 * Positivliste dort waere leicht zu umgehen und wiegte in falscher Sicherheit.
 */
const ATTACHMENT_MAX = 50 * 1024 * 1024;
const ATTACHMENT_COUNT = 20;
const attachmentUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: ATTACHMENT_MAX } });

/* HOCHLADEN DARF JEDER -- dieselbe Regel wie an der Linkzeile und aus demselben
   Grund: eine Datei erscheint nur dort, wo man sie hinsetzt. Der Waechter vor
   multer ist damit gefallen; die Grenze von ATTACHMENT_COUNT Dateien je Eintrag
   gilt weiter fuer alle zusammen, nicht je Benutzer. */
app.post('/api/items/:id/attachments', attachmentUpload.array('files', ATTACHMENT_COUNT), (req, res, next) => {
  try {
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
    const da = db.prepare('SELECT COUNT(*) n FROM attachments WHERE item_id = ?').get(req.params.id).n;
    const neu = (req.files || []).length;
    if (da + neu > ATTACHMENT_COUNT)
      return res.status(400).json({ error: t(localeOf(req), 'server.fileCap', { deckel: ATTACHMENT_COUNT })});
    let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM attachments WHERE item_id = ?')
      .get(req.params.id).m + 1;
    const into = db.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order, user_id)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const f of req.files || []) {
      // Nur der Name, nie ein Pfad: ein hochgeladenes "../../etwas" soll
      // nichts weiter sein als ein merkwuerdiger Dateiname.
      const name = path.basename(String(f.originalname || 'datei')).slice(0, 200) || 'datei';
      into.run(req.params.id, name, String(f.mimetype || '').slice(0, 120), f.buffer.length, f.buffer,
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
  anh.setHeader(res, a.filename, { inline: req.query.inline === '1' });
  res.send(a.data);
});

// Vorschau von Text und .docx: der Inhalt wird gelesen und als JSON
// geschickt, nie als Datei ausgeliefert. Der Browser interpretiert ihn damit
// ueberhaupt nicht.
app.get('/api/attachments/:id/preview', (req, res) => {
  const a = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: t(localeOf(req), 'server.fileGone')});
  const art = anh.previewKind(a.filename);
  if (art === 'text') return res.json({ art, ...anh.textPreview(a.data) });
  if (art === 'docx') {
    const v = anh.docxPreview(a.data);
    if (!v) return res.status(422).json({ error: t(localeOf(req), 'server.fileNotText')});
    return res.json({ art, ...v });
  }
  res.status(400).json({ error: t(localeOf(req), 'server.noTextPreview')});
});

/* LOESCHEN DARF DER HOCHLADENDE ODER DER ADMIN. Gefragt wird nach der ZEILE
   (mayChange), nicht mehr nach dem Eintrag: wer eine Datei an einen fremden
   Eintrag haengt, muss sie auch wieder herausnehmen koennen. Herrenlose Zeilen
   faengt mayChange ab -- sie gehoeren dem Admin. */
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
  res.json(detail(a.item_id, req.benutzer.id));
});

app.put('/api/items/:id/photo-order', entryAuthorOnly, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE photos SET sort_order = ? WHERE id = ? AND item_id = ?');
  db.transaction(() => ids.forEach((pid, i) => s.run(i, pid, req.params.id)))();
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

app.delete('/api/photos/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
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
// Ein Wort ist keine Adresse. Bekaeme jede Eingabe ohne Schema stumm
// "https://" davor, wuerde aus "Handbuch 3000" eine Zeile, die beim Klick ins
// Leere laeuft. Deshalb wird unterschieden:
//   1. mit http:// oder https:// davor  -> Adresse, unveraendert
//   2. sieht aus wie eine Adresse       -> Adresse, mit https:// davor
//   3. alles andere                     -> Suchtext, roh gespeichert
// Woran die Oberflaeche das spaeter erkennt: am fehlenden Schema. Deshalb
// braucht es keine eigene Spalte -- eine gespeicherte Adresse traegt immer
// eins.
const ADDRESS_PATTERN = [
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
function normalizeLink(roh) {
  const adresse = String(roh || '').trim();
  if (!adresse) return '';
  if (/^https?:\/\//i.test(adresse)) return adresse;
  return ADDRESS_PATTERN.some(m => m.test(adresse)) ? 'https://' + adresse : adresse;
}

/* EINTRAGEN DARF JEDER -- wie den Kommentar, den Testtag und die Bewertung.
   Ein Link erscheint nur dort, wo man ihn hinsetzt, und gehoert damit dem, der
   ihn hinsetzt, nicht dem Verfasser des Eintrags. Was an ALLEN Eintraegen
   erscheint, gehoert weiter dem Admin.
   Die Zeile traegt ihren Verfasser von Anfang an; darauf steht spaeter die
   Frage, wer sie loeschen darf. */
app.post('/api/items/:id/links', (req, res) => {
  const url = normalizeLink(req.body.url);
  if (!url) return res.status(400).json({ error: t(localeOf(req), 'server.linkMissing')});
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
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
app.put('/api/items/:id/link-order', entryAuthorOnly, (req, res) => {
  const ids = Array.isArray(req.body.order) ? req.body.order : [];
  const s = db.prepare('UPDATE links SET sort_order = ? WHERE id = ? AND item_id = ?');
  db.transaction(() => ids.forEach((lid, i) => s.run(i, lid, req.params.id)))();
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

/* LOESCHEN DARF DER EINTRAGER ODER DER ADMIN. Gefragt wird nach der ZEILE
   (mayChange), nicht nach dem Eintrag: wer einen Link in einen fremden
   Eintrag setzt, muss ihn auch wieder herausnehmen koennen. Ein geloeschter
   Link bekommt KEINEN Vermerk -- er ist eine ganze Aussage, die geht. */
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
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: t(localeOf(req), 'server.gradeRange')});
  const testDay = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!testDay) return res.status(404).json({ error: t(localeOf(req), 'server.dayUnknown')});
  if (!selfOnly(req, testDay.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('UPDATE test_days SET rating = ? WHERE id = ?').run(rating, req.params.id);
  touch.run(testDay.item_id);
  res.json(detail(testDay.item_id, req.benutzer.id));
});

app.delete('/api/test-days/:id', (req, res) => {
  const testDay = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!testDay) return res.status(404).json({ error: t(localeOf(req), 'server.dayUnknown')});
  // Loeschen darf der Admin, aendern nicht -- der Unterschied ist die ganze
  // Regel aus Teil IV.
  if (!mayChange(req, testDay.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM test_days WHERE id = ?').run(req.params.id);
  touch.run(testDay.item_id);
  res.json(detail(testDay.item_id, req.benutzer.id));
});

// Tags am Testtag. Derselbe Vorrat wie am Eintrag -- ein hier neu getippter
// Name legt den Tag auch fuer die Eintraege an.
app.post('/api/test-days/:id/tags', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: t(localeOf(req), 'server.tagMissing')});
  const testDay = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!testDay) return res.status(404).json({ error: t(localeOf(req), 'server.dayUnknown')});
  // Ein Tag am Testtag gehoert dem Testtag und teilt dessen
  // Eigentuemer (deshalb hat er keine eigene user_id). "Regen" an
  // einem fremden Testtag zu ergaenzen hiesse, eine fremde Beobachtung
  // umzuschreiben.
  if (!selfOnly(req, testDay.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  /* AM TESTTAG GIBT ES KEINE WOLKE -- die Eingabe ist der einzige
     Zuweisungsweg und bleibt deshalb auf dem Bildschirm stehen. Ein
     unbekannter Name faellt hier mit sprechender Message durch, statt dass die
     Zeile verschwaende: sonst naehme der Schalter das Zuweisen mit, und
     "Zuweisen darf immer jeder" gilt. */
  let tag = findTag(name);
  if (!tag) {
    if (!mayCreate(req, 'tagsFreiAnlegen')) return res.status(403).json({ error: t(localeOf(req), DENIED_TAG_NEW)});
    tag = createTag(name);
  }
  db.prepare('INSERT OR IGNORE INTO test_day_tags (test_day_id, tag_id) VALUES (?, ?)').run(testDay.id, tag.id);
  touch.run(testDay.item_id);
  res.status(201).json(detail(testDay.item_id, req.benutzer.id));
});

app.delete('/api/test-days/:id/tags/:tagId', (req, res) => {
  const testDay = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!testDay) return res.status(404).json({ error: t(localeOf(req), 'server.dayUnknown')});
  if (!selfOnly(req, testDay.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM test_day_tags WHERE test_day_id = ? AND tag_id = ?').run(testDay.id, req.params.tagId);
  touch.run(testDay.item_id);
  res.json(detail(testDay.item_id, req.benutzer.id));
});

/* ---- Bewertungen ---- */
// Hier steht bewusst KEIN Waechter: beide Wege treffen baulich nur die eigene
// Zeile -- das ON CONFLICT trifft (item_id, criterion_id, user_id), das DELETE
// traegt "AND user_id = ?". Eine Klemme daneben waere eine zweite Wahrheit und
// liesse sich obendrein nicht gegenpruefen.
// Fremde Bewertungen einzeln zu loeschen laeuft ueber
// DELETE /api/ratings/:id.
/* VOR DEM TEST WIRD NICHT BEWERTET -- 0.22.1. Zwei kleine Abfragen fuer eine
   Klemme, die es bis 0.22.0 nur auf dem Bildschirm gab: dort war der
   Bewertungskasten am ungetesteten Eintrag zugeklappt, die Route nahm den Wert
   aber von jedem an. WAS DER BILDSCHIRM NICHT ANBIETET, MUSS DER SERVER
   ABWEISEN -- sonst ist es keine Regel, sondern eine Gewohnheit. */
const qCritPhase = db.prepare('SELECT phase FROM rating_criteria WHERE id = ?');
const qItemTested = db.prepare('SELECT tested FROM items WHERE id = ?');

app.put('/api/items/:id/ratings', (req, res) => {
  const v = Math.max(0, Math.min(5, Number(req.body.value) || 0));
  /* GEPRUEFT WIRD NUR EIN WERT GROESSER NULL. Eine Null nimmt weg, und
     WEGNEHMEN MUSS IMMER GEHEN: an einem ungetesteten Eintrag mit vorhandenen
     Sternen steht der Kasten ausdruecklich da (Entscheidung E6), und sein
     einziger Zweck ist, die Sterne loswerden zu koennen. Eine Klemme, die auch
     die Null abwiese, sperrte genau den Weg, fuer den der Kasten noch da ist.
     UND NUR DIE PHASE „nachher". Das Potenzial ist die Frage VOR dem Test --
     an einem ungetesteten Eintrag ist es die einzige, die sich stellt. */
  if (v > 0) {
    const crit = qCritPhase.get(req.body.criterionId);
    const entry = qItemTested.get(req.params.id);
    if (crit && crit.phase === 'nachher' && entry && !entry.tested)
      return res.status(400).json({
        error: t(localeOf(req), 'server.ratingBeforeTest')});
  }
  // Die eigene Bewertung. Konfliktziel und UNIQUE in db.js gehoeren
  // zusammen -- siehe die Bemerkung beim Testtag eine Bildschirmseite hoeher.
  /* DER ZEITPUNKT GEHT BEI BEIDEN WEGEN MIT -- beim Anlegen UND beim
     Ueberschreiben. Eine geaenderte Bewertung ist fuer den anderen dasselbe
     Ereignis wie eine neue: er sieht eine Zahl, die vorher nicht dastand.
     GESETZT WIRD AUSDRUECKLICH UND NICHT UEBER EINEN VORGABEWERT der Spalte:
     eine Zeile ohne Zeitpunkt heisst „die Instanz weiss nicht, wann" -- das
     gilt fuer alles vor 0.16.0 und fuer alles Eingespielte, und ein
     Vorgabewert machte daraus stillschweigend „gerade eben". */
  db.prepare(`INSERT INTO ratings (item_id, criterion_id, value, user_id, gesetzt_am)
              VALUES (?, ?, ?, ?, datetime('now'))
              ON CONFLICT(item_id, criterion_id, user_id)
              DO UPDATE SET value = excluded.value, gesetzt_am = excluded.gesetzt_am`)
    .run(req.params.id, req.body.criterionId, v, req.benutzer.id);
  touch.run(req.params.id);
  res.json(detail(req.params.id, req.benutzer.id));
});

/* HIER STAND BIS 0.20.1 `DELETE /api/items/:id/ratings` -- das
   Sammel-Zuruecksetzen hinter dem Knopf „Meine Bewertung zuruecksetzen".
   ER IST WEG, UND DIE ROUTE MIT IHM. Das Zuruecksetzen sitzt seit 0.21.0 an
   der ZEILE: ein sichtbares × hinter den eigenen fuenf Sternen, und es geht
   ueber `PUT` mit `value: 0`. Den Weg gibt es seit jeher -- `Math.max(0, ...)`
   eine Zeile hoeher, und eine Zeile mit 0 ist keine Stimme.
   EINE ROUTE OHNE WEG VOM BILDSCHIRM IST TOT, und tote Wege gibt es hier
   nicht: sie muesste bei jeder Runde mitgeprueft und mitgedacht werden fuer
   etwas, das niemand mehr ruft.
   DAMIT ENTFAELLT AUCH DIE FRAGE, wie ein Sammel-Zuruecksetzen den jeweils
   anderen Kasten verschont -- es gibt keins mehr.
   DAS IST EINE WEGNAHME AN EINER OEFFENTLICHEN ANTWORT. Vor 1.0.0 ist das
   erlaubt; sie steht in Abschnitt 5 des Projektstands, und F_ROUTEN ist um
   eins kleiner. Wer sie von aussen ruft, bekommt 404. */

/* Wer welchen Wert vergeben hat -- die Ansicht des Admins.
   NUR DER ADMIN: wer wie bewertet hat, ist eine Angabe ueber einzelne
   Personen. Lesend, also kein Eintrag in F_ROUTEN.
   Sie ist zugleich die VORAUSSETZUNG DES LOESCHWEGS -- ohne die id gaebe es
   vom Bildschirm aus keinen Weg zu einer einzelnen fremden Bewertung.
   Nur Kriterien MIT Stimmen; den Namen hat die Oberflaeche aus dem Eintrag. */
app.get('/api/items/:id/votes', adminOnly, (req, res) => {
  const stimmen = votesPerCriterion(req.params.id, req.benutzer.id, authorCard());
  res.json([...stimmen].map(([criterion_id, list]) => ({ criterion_id, stimmen: list })));
});

/* Eine EINZELNE fremde Bewertung entfernen. Die beiden Wege darueber
   brauchen keine Klemme, weil sie baulich nur die eigene Zeile treffen; HIER
   steht eine fremde Nummer in der Adresse.
   mayChange und nicht selfOnly: loeschen darf der Admin. Ein Weg, den
   fremden WERT zu aendern, entsteht ausdruecklich nicht -- die Note ist die
   Aussage der Zeile. Loeschen ja, umschreiben nein. */
app.delete('/api/ratings/:id', (req, res) => {
  const r = db.prepare('SELECT id, item_id, user_id FROM ratings WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: t(localeOf(req), 'server.ratingUnknown')});
  if (!mayChange(req, r.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM ratings WHERE id = ?').run(r.id);
  touch.run(r.item_id);
  res.json(detail(r.item_id, req.benutzer.id));
});

/* ---- Kommentare ---- */
// Alles ausser 'report' ist eine Notiz -- so gelten auch aeltere Exportdateien
// ohne diese Angabe als gewoehnliche Notiz.
// Klemmt Unbekanntes auf 'note'. Alles, was hier nicht steht, kommt nicht in
// die Datenbank -- auch nicht aus einer Exportdatei.
const KIND_VALUES = ['note', 'report', 'task', 'done'];
const kindValue = (v) => (KIND_VALUES.includes(v) ? v : 'note');

// Bilder in Kommentaren. Anders als bei den Anhaengen ist hier NUR Bild
// erlaubt: jede Datei geht durch sharp und wird neu kodiert gespeichert. Was
// sharp nicht als Bild lesen kann, wird abgewiesen -- eine als .png getarnte
// HTML-Datei kommt damit gar nicht erst in die Datenbank.
const IMAGE_MAX = 20 * 1024 * 1024;
const IMAGE_COUNT = 6;
const commentImageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: IMAGE_MAX } });

async function encodeCommentImage(buf) {
  const big = await sharp(buf, { failOn: 'none' }).rotate()
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  const small = await sharp(buf, { failOn: 'none' }).rotate()
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  return { big, small };
}

function saveCommentImages(commentId, dateien) {
  let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM comment_images WHERE comment_id = ?')
    .get(commentId).m + 1;
  const into = db.prepare(`INSERT INTO comment_images (comment_id, filename, data, thumb, sort_order)
                          VALUES (?, ?, ?, ?, ?)`);
  for (const d of dateien) into.run(commentId, d.name, d.big, d.small, pos++);
}

// Aus hochgeladenen Dateien kodierte Bilder machen. Gibt null zurueck, wenn
// eine Datei kein lesbares Bild ist -- dann wird gar nichts gespeichert.
async function encodeAll(dateien) {
  const out = [];
  for (const f of dateien || []) {
    try {
      const { big, small } = await encodeCommentImage(f.buffer);
      out.push({ name: path.basename(String(f.originalname || 'bild.jpg')).slice(0, 200), big, small });
    } catch { return { fehler: 'server.imageUnreadable', values: { name: f.originalname } }; }
  }
  return { bilder: out };
}

// Bilder kommen zusammen mit dem Text, nicht danach: sonst entstuende bei
// einem Abbruch ein leerer Kommentar mit Bildern.
app.post('/api/items/:id/comments', commentImageUpload.array('images', IMAGE_COUNT), async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: t(localeOf(req), 'server.textMissing')});
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});

    const k = await encodeAll(req.files);
    if (k.fehler) return res.status(400).json({ error: t(localeOf(req), k.fehler, k.values) });

    const pinned = req.body.pinned === '1' || req.body.pinned === true;
    // Der Schreibende ist der Verfasser.
    const neu = db.prepare('INSERT INTO comments (item_id, text, kind, pinned, user_id) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, text, kindValue(req.body.kind), pinned ? 1 : 0, req.benutzer.id);
    if (k.bilder.length) saveCommentImages(neu.lastInsertRowid, k.bilder);
    touch.run(req.params.id);
    res.status(201).json(detail(req.params.id, req.benutzer.id));
  } catch (e) { next(e); }
});

// Text und Merkmale lassen sich einzeln aendern: die Umschalter in der
// Kopfzeile schicken nur ihr eigenes Feld, ohne den Text anzufassen.
app.put('/api/comments/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: t(localeOf(req), 'server.commentGone')});

  /* DIE ZWEITE ROUTE MIT ZWEI RECHTEKLASSEN IN EINEM RUMPF.
       TEXT          -- nur der Verfasser, AUCH DER ADMIN NICHT.
       ART/ANPINNUNG -- Verfasser oder Admin. Die Anpinnung wirkt auf die
                        Sortierung fuer ALLE, aendert aber keine Aussage und
                        ist jederzeit umkehrbar.
     Beide Fragen stehen VOR dem ersten UPDATE. */
  if (req.body.text !== undefined && !selfOnly(req, c.user_id))
    return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  if ((req.body.kind !== undefined || req.body.pinned !== undefined) && !mayChange(req, c.user_id))
    return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});

  if (req.body.text !== undefined) {
    const text = String(req.body.text).trim();
    if (!text) return res.status(400).json({ error: t(localeOf(req), 'server.textMissing')});
    db.prepare(`UPDATE comments SET text = ?, updated_at = datetime('now') WHERE id = ?`).run(text, c.id);
  }
  // Eine Aenderung der Merkmale ist keine Bearbeitung des Textes und setzt
  // deshalb kein "bearbeitet" -- sonst stuende das an jedem angepinnten
  // Kommentar, ohne dass jemand am Text war.
  if (req.body.kind !== undefined)
    db.prepare('UPDATE comments SET kind = ? WHERE id = ?').run(kindValue(req.body.kind), c.id);
  if (req.body.pinned !== undefined)
    db.prepare('UPDATE comments SET pinned = ? WHERE id = ?').run(req.body.pinned ? 1 : 0, c.id);

  touch.run(c.item_id);
  res.json(detail(c.item_id, req.benutzer.id));
});

// Bilder an einem bestehenden Kommentar nachreichen.
app.post('/api/comments/:id/images', commentImageUpload.array('images', IMAGE_COUNT), async (req, res, next) => {
  try {
    const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
    if (!c) return res.status(404).json({ error: t(localeOf(req), 'server.commentGone')});
    // HINZUFUEGEN nur der Verfasser -- ein Bild an einem fremden
    // Kommentar waere ein Zusatz zu einer fremden Aussage. Das Entfernen darf
    // der Admin (siehe die Loeschroute weiter unten); der Unterschied ist
    // Absicht und ausdruecklich entschieden.
    if (!selfOnly(req, c.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
    const da = db.prepare('SELECT COUNT(*) n FROM comment_images WHERE comment_id = ?').get(c.id).n;
    if (da + (req.files || []).length > IMAGE_COUNT)
      return res.status(400).json({ error: t(localeOf(req), 'server.imageCap', { deckel: IMAGE_COUNT })});
    const k = await encodeAll(req.files);
    if (k.fehler) return res.status(400).json({ error: t(localeOf(req), k.fehler, k.values) });
    /* Anhaengen IST Bearbeiten -- und hierher kommt nach der Klemme oben nur
       der Verfasser. Ein Vermerk kann an diesem Weg deshalb gar nicht
       entstehen: der Admin haengt nichts an.
       KEIN BILD, KEINE BEARBEITUNG: ein Ruf ohne Datei hat nichts angehaengt,
       und "bearbeitet" waere dann eine Aussage ueber nichts. */
    if (k.bilder.length) {
      saveCommentImages(c.id, k.bilder);
      commentEdited.run(c.id);
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
  if (!b) return res.status(404).json({ error: t(localeOf(req), 'server.imageGone')});
  if (!mayChange(req, b.user_id)) return res.status(403).json({ error: t(localeOf(req), DENIED_SELF)});
  db.prepare('DELETE FROM comment_images WHERE id = ?').run(b.id);
  /* HIER GILT GENAU EINES VON BEIDEN, NIE BEIDES UND NIE KEINES -- deshalb
     ein if/else und nicht zwei Bedingungen nebeneinander.

     DER EINGRIFFSVERMERK wird NUR hochgezaehlt, wenn ein anderer als der
     Verfasser entfernt. Eine HERRENLOSE Zeile hat keinen Verfasser, also ist
     jeder Entfernende ein anderer. Nicht zuruecksetzbar. Ein blankes UPDATE
     auf die eine Zeile -- kein OR REPLACE, an einem Kommentar haengen Bilder.

     "BEARBEITET" im anderen Zweig: Entfernen ist Bearbeiten, und es steht nur
     dem Verfasser zu -- sonst saehe die fremde Loeschung aus wie seine eigene
     Bearbeitung. */
  if (b.user_id !== req.benutzer.id)
    db.prepare('UPDATE comments SET images_removed = images_removed + 1 WHERE id = ?').run(b.comment_id);
  else
    commentEdited.run(b.comment_id);
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
  anh.setHeader(res, 'bild.jpg', { inline: true });
  res.send(req.query.size === 'thumb' && b.thumb ? b.thumb : b.data);
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
   ohnehin in jedem Eintrag. Der Haken laeuft ueber PUT /api/comments/:id.
   DIESELBE BEDINGUNG WIE IN DER DETAILANSICHT (`kind = 'task'`): wer
   `kind != 'done'` schriebe, naehme Notizen und Berichte mit.
   SORTIERT WIE DIE UEBERSICHT; die Gruppierung macht die Oberflaeche.
   `mine` haengt an JEDER Zeile -- daran haengt der Haken. */
const qOpenTasks = db.prepare(`
  SELECT c.id, c.text, c.created_at, c.user_id, c.item_id, i.title, i.updated_at
    FROM comments c JOIN items i ON i.id = c.item_id
   WHERE c.kind = 'task'
   ORDER BY i.updated_at DESC, c.id`);
app.get('/api/open', (req, res) => {
  const card = authorCard();
  res.json(qOpenTasks.all().map(z => ({
    id: z.id, text: z.text, created_at: z.created_at,
    item: { id: z.item_id, title: z.title },
    mine: z.user_id === req.benutzer.id,
    verfasser: authorFrom(card, z.user_id)
  })));
});

/* ---- Kennzahlen ---- */
// NUR DER ADMIN. Die Zahlen sagen, wie gross der Bestand und wie belegt die
// Datenbank ist -- eine Aussage ueber die Instanz als Ganzes. Lesend, deshalb
// kein Eintrag in F_ROUTEN.
// Der Schluesselwert weiter unten im Rumpf bleibt eine ZWEITE, engere Klemme:
// den bekommt nur der Eigentuemer.
app.get('/api/stats', adminOnly, (req, res) => {
  let dbBytes = 0;
  try { db.pragma('wal_checkpoint(PASSIVE)'); dbBytes = fs.statSync(DB_FILE).size; } catch {}
  /* DIE AUFTEILUNG DES BILDBESTANDS -- und sie ist in 0.19.1 ZWEIMAL umgebaut
     worden, weil der erste Umbau nur die halbe Ursache traf.

     WAS 0.19.0 GEBAUT HATTE: eine Abfrage mit `GROUP BY` ueber `length(data)`
     und `hex(substr(data,1,8))`. Sie kostete bei jedem Zeichnen des
     Systembereichs Sekunden.

     WAS DER ERSTE ANLAUF VON 0.19.1 DARAUS MACHTE: zwei materialisierte
     Zwischenabfragen. Das behebt die eine Haelfte -- `length()` verliert seine
     Abkuerzung im Sortierer einer Gruppierung (Stolperstein 275) --, und die
     Karte wurde messbar schneller. SIE BLIEB TROTZDEM LANGSAM, und der Grund
     stand nicht im Auftrag:

     `art` STEHT IN DER SPALTENREIHENFOLGE HINTER DREI BLOBS (data, thumb,
     medium). Wer sie aus dem SATZ liest, muss ihn bis dorthin durchlaufen --
     und das heisst, die Overflow-Ketten der Blobs zu lesen und zu
     entschluesseln. Das ist von der Gruppierung ganz unabhaengig, und
     `MATERIALIZED` hilft dagegen nichts (Stolperstein 279).

     UND DIE BERICHTIGUNG AUS 0.19.1 GILT UNVERAENDERT WEITER, sie war nur
     nicht die ganze Geschichte: 0.19.0 hat behauptet, hex(substr(data,1,8))
     hole die ersten Bytes und lasse das Blob dabei ungelesen. DAS IST FALSCH
     -- substr() AUF EINEM BLOB LIEST DAS BLOB, gemessen 657 ms bei 205 MB,
     das 0,87-fache dessen, was garantiertes Volllesen kostet. Der Wortlaut
     der gestrichenen Saetze steht im Aenderungsprotokoll zu 0.19.1.

     GEMESSEN AN EINER SQLCIPHER-DATEI MIT 400 ZEILEN A 512 kB (312 MB):

       COUNT(*)                                          0,0 ms
       mime_type gruppiert (Spalte 2, VOR den Blobs)      8,7 ms
       art gruppiert       (Spalte 6, HINTER ihnen)    1338,8 ms
       SUM(length(data))   (Spalte 3), ohne WHERE         7,2 ms
       SUM(length(data))   mit WHERE art != 'video'    1334,1 ms
       length(data)+art,   materialisiert              1343,3 ms
       length(data)+mime,  materialisiert                 7,8 ms
       art gruppiert, MIT Index auf photos(art)           0,1 ms

     DARAUS FOLGT DIESE FORM, und jeder ihrer drei Handgriffe hat einen Grund:

       1. `art` KOMMT AUS DEM INDEX und nicht aus dem Satz -- der Index steht
          in db.js und ist keine Datenbankstufe.
       2. GEFRAGT WIRD MIT `IS ?` UND NICHT MIT `!= 'video'`. Eine Ungleichheit
          schlaegt den Index aus; deshalb werden erst die vorhandenen Arten
          geholt und dann je Art gefragt. Es sind zwei ('photo' und 'video'),
          und was hier steht, gilt fuer jede weitere von selbst.
       3. DIE FORMATZEILE BLEIBT MATERIALISIERT -- dort ist die Gruppierung
          ueber eine Blob-Laenge der Kostenpunkt, und `MATERIALIZED` behebt ihn.

     ZUSAMMEN GEMESSEN: 0,5 ms warm, 7,9 ms kalt -- gegen 4698 ms in der Form
     davor, an derselben Datei.

     UND DESHALB WIRD NICHTS ZWISCHENGESPEICHERT. Eine mitgefuehrte
     Zaehlertabelle waere eine zweite Wahrheit ueber denselben Bestand
     (Stolperstein 47): sie muesste bei jedem Hochladen, Loeschen, Einspielen,
     Papierkorb-Griff und Umstellungslauf nachgezogen werden, und der erste
     vergessene Weg liesse die Karte still falsche Zahlen zeigen. Bei 0,5 ms
     gibt es dafuer keinen Gegenwert.

     DIE ALTEN FELDER BEHALTEN NAMEN UND BEDEUTUNG. photoCount, photoBytes,
     videoCount und videoBytes werden hier nur ANDERS GERECHNET, nicht anders
     gemeint. */
  const kinds = qImageKinds.all().map(z => z.a);
  const p = { n: 0, o: 0 }, vi = { n: 0, o: 0 };
  const bildFormate = {};
  /* DIE EXPORTGROESSE DER BILDER FAELLT HIER MIT AB. Sie stand bis 0.19.1 in
     zwei eigenen Abfragen mit `WHERE art != 'video'` und kostete damit
     dasselbe zweite und dritte Mal -- gemessen 1363 und 1310 ms. Es ist
     dieselbe Summe, die eine Zeile hoeher schon gebildet wird; sie hier
     mitzunehmen ist kein zweiter Rechenweg, sondern die Abschaffung eines
     zweiten. */
  let exportPhotoBytes = 0, exportVideoBytes = 0;
  for (const art of kinds) {
    const z = qPerKind.get(art);
    if (art === 'video') {
      vi.n += z.n; vi.o += z.o;
      exportVideoBytes += qVideoExportBytes.get(art).n;
      continue;
    }
    p.n += z.n; p.o += z.o;
    exportPhotoBytes += z.o;
    /* AUSDRUECKLICH OHNE VIDEOS: bei einer Videozeile traegt `data` die
       Videodatei -- ihr Format gehoert in keine Zeile, die „Fotos am Eintrag
       nach Format" ueberschrieben ist. Die Videos stehen wie bisher als eigene
       Zahl daneben. */
    for (const g of qPerFormat.all(art)) {
      const k = formatFromMime(g.m);
      const f = bildFormate[k] || (bildFormate[k] = { anzahl: 0, bytes: 0 });
      f.anzahl += g.n; f.bytes += g.o;
    }
  }
  const an = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(size),0) AS o FROM attachments').get();
  /* Der Papierkorb steht GETRENNT da, aus demselben Grund wie die Videos:
     sonst wundert sich jemand ueber eine Datenbank, die nach dem
     Aufraeumen groesser ist als vorher. Die alten Zahlen behalten ihre
     Bedeutung und bekommen einen Nachbarn -- itemCount zaehlt weiterhin die
     Eintraege, und ein geloeschter ist keiner mehr. */
  const pk = db.prepare(`SELECT COUNT(*) AS n,
      COALESCE(SUM(length(inhalt)),0) + COALESCE((SELECT SUM(length(daten)) FROM papierkorb_bytes),0) AS o
    FROM papierkorb`).get();
  /* Kommentarbilder standen bisher in keiner Zeile. Sie liegen als Blob in
     derselben Datei wie Fotos und Anhaenge, gehen mit dem Dateischalter in den
     Export -- und fehlten damit ausgerechnet in der Aufstellung, die erklaeren
     soll, wovon die Datenbank so gross ist. */
  const ci = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) + COALESCE(SUM(length(thumb)),0) AS o FROM comment_images').get();
  res.json({
    version: VERSION,
    // Der Fingerprint steht hier und nicht in /api/config: er ist dieselbe Art
    // Aussage wie die Zahlen darunter -- eine ueber die INSTANZ ALS GANZES.
    // Und die Liste in /api/config ist ausdruecklich abgeschlossen; was
    // dort steht, sieht jeder, der die Adresse kennt. Der Fingerprint nagelt
    // den laufenden Dateisatz fest und geht deshalb nicht vor die Anmeldung.
    fingerprint: FINGERPRINT,
    /* WAS UNTER DER HAUBE LAEUFT -- abgelesen in db.js, hier nur
       durchgereicht. Die Karte nennt Verfahren und keine Paketversionen: das
       eine sagt, WIE gerechnet wird, das andere, WELCHE Luecke passt.
       `passwoerter` steht hier und nicht in db.js, weil es dort nichts zu
       lesen gaebe -- die Kennwerte des Verfahrens stehen in auth.js und in
       jedem gespeicherten Wert. Der Name ist derselbe, den baueWert() vorn
       hineinschreibt. */
    verfahren: { ...verfahren(), passwoerter: 'scrypt' },
    dbBytes, photoCount: p.n, photoBytes: p.o,
    videoCount: vi.n, videoBytes: vi.o,
    attachmentCount: an.n, attachmentBytes: an.o,
    papierkorbCount: pk.n, papierkorbBytes: pk.o,
    commentImageCount: ci.n, commentImageBytes: ci.o,
    /* DIE FOTOS AM EINTRAG NACH FORMAT -- die Auskunft, um derentwillen die
       Abfrage oben zusammengelegt wurde. Sie sagt, wovon die Datenbank so
       gross ist, und sie sagt, ob der Knopf daneben noch etwas zu tun hat.
       NUR DAS ORIGINAL. thumb und medium sind immer JPEG und stehen in keiner
       eigenen Zeile; sie werden von dieser Runde nicht angefasst. */
    bildFormate,
    /* WIE WEIT DIE UMSTELLUNG IST -- ODER null. KEINE ZWEITE ROUTE dafuer:
       die Karte fragt ohnehin die Kennzahlen ab, und ein eigener Endpunkt fuer
       drei Zahlen liefe als zweite Wahrheit ueber denselben Lauf mit. */
    umstellung: batchState('umstellung'),
    /* DER ZWEITE LAUF SEIT 0.19.4, und er steht als EIGENES Feld daneben und
       nicht im selben: die Karte muss auseinanderhalten koennen, was gerade
       laeuft. */
    geometrie: batchState('geometrie'),
    /* DIE ERWARTETE EXPORTGROESSE, je Schalter getrennt. Sie steht hier als
       AUFTEILUNG und nicht als eine Summe: die Karte darunter hat drei
       Schalter, und wer nur eine Gesamtzahl bekaeme, koennte an keinem
       einzelnen Knopf sagen, was er auslöst.
       DIE GRENZEN GEHEN MIT. Ohne sie muesste die Oberflaeche 300 MB und
       512 MB selbst kennen, und dann staende dieselbe Zahl an zwei Orten. */
    export: {
      umschlag: exchangeEnvelopeBytes(null),
      /* DIE BILDBYTES KOMMEN AUS DER SCHLEIFE OBEN und nicht aus zwei eigenen
         Abfragen. Bis 0.19.1 rief diese Zeile exchangeParts(null, …), und das
         stellte dieselbe teure Frage nach `art != 'video'` ein zweites und
         drittes Mal -- gemessen 1363 und 1310 ms zusaetzlich zu den 1343 der
         Aufteilung selbst. Es ist DIESELBE Summe; sie hier weiterzureichen ist
         die Abschaffung eines zweiten Rechenwegs und nicht die Einfuehrung
         eines (Stolperstein 47).
         DIE UEBRIGEN ZWEI TEILE bleiben bei exchangeParts(): `attachments`
         und `comment_images` tragen ihre Blobs als LETZTE Spalte und kosten
         gemessen 1,2 und 0,1 ms. */
      ...exchangeParts(null, { mitDateien: true }),
      fotos: Math.round(exportPhotoBytes * 4 / 3),
      videos: Math.round(exportVideoBytes * 4 / 3),
      /* DREI ZAHLEN UND NICHT ZWEI, weil sie drei verschiedene Dinge sagen:
         `warnAb`  ab hier steht ein Hinweis -- geschaetzt, nimmt nichts weg.
         `grenze`  ab hier sagt die Route ab -- unsere Marge, mit Luft davor.
         `string`  so lang kann ein Text in Node ueberhaupt werden -- gemessen.
         GENANNT WIRD IN JEDER MELDUNG DIE LETZTE. Die beiden anderen sind
         unsere Entscheidungen; nur `string` ist eine Tatsache, und eine
         Message, die unsere Marge als Tatsache ausgibt, sagt die Unwahrheit. */
      warnAb: EXCHANGE_WARN, grenze: EXCHANGE_MAX, string: EXCHANGE_STRING
    },
    itemCount: db.prepare('SELECT COUNT(*) n FROM items').get().n,
    commentCount: db.prepare('SELECT COUNT(*) n FROM comments').get().n,
    linkCount: db.prepare('SELECT COUNT(*) n FROM links').get().n,
    testDayCount: db.prepare('SELECT COUNT(*) n FROM test_days').get().n,
    keyFromEnv,
    // Nur wenn der Schluessel ohnehin schon neben der Datenbank liegt. Kommt er
    // aus der Umgebung, gibt es nichts abzuschreiben -- und dann hat er in
    // einer Antwort auch nichts verloren.
    // Und nur an den Eigentuemer. Er steht in derselben Rechtezeile
    // wie Export und Import -- alles, was die Instanz als Ganzes
    // betrifft. Ein Admin verwaltet den Bestand, er oeffnet nicht die Datei.
    keyHex: (keyFromEnv || !istEigentuemer(req)) ? null : keyHex
  });
});

/* Den vorhandenen Bestand nachziehen -- der Knopf aus dem Reiter „Datenbank".
   Das Werkzeug dazu steht oben bei der Bildablage; hier steht nur der Weg
   hinein.

   NUR DER EIGENTUEMER, und ZUSAETZLICH die zweite Bestaetigung: der Lauf
   schreibt jeden PNG-Blob der Instanz um, und die alten Bytes sind danach weg.
   Das ist genau die Art Vorgang, fuer die es die zweite Bestaetigung gibt --
   verteidigt wird gegen eine fremde offene Sitzung. „Unwiderruflich" ist hier
   richtig und nicht wie beim Loeschen falsch: es gibt keinen Papierkorb fuer
   Bytes.

   UND SIE KEHRT SOFORT ZURUECK (202). Acht Minuten Rechenzeit an einer offenen
   HTTP-Verbindung sind das, was beim Import ausdruecklich vermieden wird --
   hier gilt derselbe Satz. Der Fortschritt geht als Feld in /api/stats. */
app.post('/api/images/convert', ownerOnly, secondConfirmNeeded('bilder'), (req, res) => {
  /* ZWEIMAL DRUECKEN STARTET NICHT ZWEIMAL. Zwei Schleifen ueber dieselben
     Zeilen taeten der zweiten nichts (nach der ersten ist kein PNG mehr da),
     aber sie liefen doppelt, und der gemeldete Fortschritt waere der der
     zuletzt gestarteten. Eine Absage ist ehrlicher als eine zweite Schleife. */
  if (batchStates.umstellung && batchStates.umstellung.laeuft)
    return res.status(409).json({ error: t(localeOf(req), 'server.convertRunning')});
  const zeilen = qOpenPng.all(PNG_MAGIC_HEX);
  batchStates.umstellung = { laeuft: true, gesamt: zeilen.length, erledigt: 0,
                                 umgestellt: 0, geblieben: 0, gespart: 0 };
  console.log(`[Kriterion] Bildumstellung gestartet: ${zeilen.length} PNG.`);
  res.status(202).json(batchState('umstellung'));
  /* DIE ANTWORT IST SCHON HINAUS, WENN DER THREAD ANFAENGT -- seit 0.19.3
     laeuft die Schleife nicht mehr hier, sondern in batchrun.js. Was der
     Aufrufer bekommt, ist unveraendert: 202 mit dem Anfangsstand, und der
     Fortschritt geht weiter als Feld in /api/stats.
     DAS NETZ GEGEN DAS, WAS DANEBEN SCHIEFGEHEN KANN, HAENGT JETZT AM THREAD
     (worker.on('error') in startBatchThread) statt an einem catch: eine
     unbehandelte Zusage naehme in Node den ganzen Server mit, ein Fehler im
     Thread nimmt nur den Lauf. */
  startBatchThread('umstellung', zeilen);
});

/* ================= Das Austauschformat =================

   EINE ABBILDUNG JE EINTRAG, und sie steht hier statt mitten in der
   Exportroute: gerufen wird sie an drei Stellen -- voller Export,
   Einzelexport, Papierkorb. Zwei Rechenwege fuer dieselbe Datei liefen
   auseinander.

   DIE BYTES GEHEN UEBER EINEN TRICHTER, nicht ueber ein festes Feld:
     Exportdatei -- Base64 im Feld <name>_base64. Die Datei ist EIN String.
     Papierkorb  -- eine NUMMER im Feld <name>_ref; die Bytes liegen daneben
                    in papierkorb_bytes, als Bytes.
   Der Grund ist gemessen: ein Eintrag darf zwanzig Videos zu je 20 MB tragen.
   Als Base64 sind das 533 MB in EINEM String, und Node haelt keinen String
   ueber 512 MB (MAX_STRING_LENGTH = 536.870.888) -- JSON.stringify antwortet
   mit "RangeError: Invalid string length". Ein Papierkorb, der stumpf alles
   einpackt, risse an genau dem Eintrag, den zu verlieren am meisten wehtut.
   Zippen hilft dagegen NICHT: der String entsteht vor dem Zippen. */

// Die Formatnummer ist eine AUSSAGE, keine Bedingung: weder der Import noch
// die Oberflaeche lesen sie. Entschieden wird ueber das Vorhandensein der
// Felder -- nur so bleiben aeltere Dateien lesbar, ohne dass irgendwo eine
// Fallunterscheidung nach Nummer steht. Sie steht an genau einer Stelle.
const EXCHANGE_FORMAT = 13;

// Die Grenze, an der eine Exportdatei zerbraeche, mit Luft davor. Sie steht
// hier und nicht als Zahl im Rumpf: der Wert kommt aus Node und nicht aus
// einer Schaetzung.
const EXCHANGE_STRING = require('buffer').constants.MAX_STRING_LENGTH;
const EXCHANGE_MAX = Math.floor(EXCHANGE_STRING * 0.9);

/* Der Wert, ab dem die Instanz WARNT -- deutlich unter der Grenze, an der sie
   ABSAGT. Die beiden Zahlen haben verschiedene Aufgaben und duerfen deshalb
   nicht dieselbe sein:
     EXCHANGE_MAX  ist gemessen -- daran zerbricht der String.
     EXCHANGE_WARN ist geschaetzt -- davor soll jemand die Sicherung nehmen.
   DIE LUFT DAZWISCHEN IST DER PREIS DER SCHAETZUNG. Sie deckt den Umschlag,
   die Base64-Rundung auf ein Vielfaches von vier und den Text, den keine
   Blob-Spalte traegt. Wer bei 300 MB gewarnt wird, hat noch rund 180 MB
   Spielraum, bevor es wirklich kippt -- und wer die Warnung wegklickt, bekommt
   seine Datei trotzdem. */
const EXCHANGE_WARN = 300 * 1024 * 1024;

// Der Trichter der Exportdatei. Base64 blaeht um ein Drittel auf, und das ist
// der Preis dafuer, dass eine Textdatei Bytes tragen kann.
const FUNNEL_FILE = { extension: '_base64', nimm: (buf) => buf.toString('base64') };

/* Der Trichter des Papierkorbs. Er sammelt die Bytes in einer Liste und legt
   nur ihre Nummer ins Paket; die Liste wandert danach zeilenweise nach
   papierkorb_bytes. So entsteht an keiner Stelle ein grosser String. */
function funnelStore(collector) {
  return { extension: '_ref', nimm: (buf) => { collector.push(buf); return collector.length - 1; } };
}

/* Die Gegenrichtung, einmal fuer beide Formen. Eine Datei traegt Base64, eine
   Papierkorbzeile eine Nummer; `quelle` loest die Nummer auf und ist bei einer
   Datei null. ERST DAS VORHANDENSEIN, dann der Wert -- ein fehlendes Feld ist
   der Normalfall (Export ohne Videos, aeltere Datei) und kein Fehler. */
function bytesOf(o, name, quelle) {
  const b64 = o[name + '_base64'];
  if (b64) return Buffer.from(b64, 'base64');
  const nr = o[name + '_ref'];
  if (quelle && nr != null) return quelle(nr);
  return null;
}

/* EINE Karte von der Id auf den Namen, einmal je Aufruf gebaut und an vier
   Stellen benutzt -- statt vier LEFT JOINs auf users.
   Der Name wird geliefert, NICHT die Id: eine nackte Id waere in einer Datei,
   die das Haus verlaesst, eine Angabe ueber eine Person ohne jeden Nutzen.
   Eine herrenlose Zeile steht ausdruecklich als null da. */
function authorNames() {
  const namen = new Map(db.prepare('SELECT id, username FROM users').all().map(u => [u.id, u.username]));
  return (id) => (id == null ? null : (namen.get(id) || null));
}

/* Die Lage, in der ein Paket entsteht: wessen Favoriten gelten, wie die
   Bytes hinausgehen und welche Schalter stehen. `pins` ist die Menge der
   Favoriten DESSEN, DER ZIEHT.
   BEWUSST: der Verfasser kommt zu Eintrag, Bewertung, Kommentar und Testtag,
   NICHT zum Favoriten -- er ist eine Aussage ueber einen Eintrag und nicht
   sein Inhalt. Folge: beim Wiederherstellen aus dem Papierkorb kommen die
   Favoriten ANDERER nicht zurueck. */
function bundleState(userId, schalter = {}) {
  return {
    authorName: authorNames(),
    pins: new Set(qMyPins.all(userId).map(p => p.item_id)),
    funnel: schalter.funnel || FUNNEL_FILE,
    mitFotos: schalter.mitFotos !== false,
    mitDateien: !!schalter.mitDateien,
    mitVideos: !!schalter.mitVideos
  };
}

// Die Abbildung je Eintrag. Sie kommt genau einmal vor; ein Waechter im
// Pruefstand haelt das fest.
function entryAsBundle(it, situation) {
  const { authorName, pins, funnel, mitFotos, mitDateien, mitVideos } = situation;
  const extension = funnel.extension;
  const o = {
    title: it.title, description: it.description,
    rejected: !!it.rejected, tested: !!it.tested, favorite: pins.has(it.id),
    // Der Eintrag selbst nennt seinen Verfasser: ohne dieses Feld schoebe
    // eine ersetzende Wiederherstellung ALLE Eintraege dem Einspielenden zu.
    author: authorName(it.user_id),
    /* WANN, WARUM UND VON WEM abgelehnt wurde. Dafuer steht die Formatnummer
       11. Ohne diese drei Felder verloere eine Datei genau die Angabe, um
       derentwillen 0.14.0 gebaut wurde -- und ein Rundlauf machte aus einer
       begruendeten Ablehnung wieder ein nacktes Haekchen.
       rejected_author WANDERT ALS NAME HINAUS, wie jeder Verfasser in dieser
       Datei und ueber DIESELBE Karte: eine Zugangsnummer bedeutet in einer
       fremden Instanz etwas anderes.
       DIE DREI GEHEN AUCH MIT, WENN rejected FALSCH IST. Beim Zuruecknehmen
       loescht der Server sie nicht, und eine Datei, die sie dann wegliesse,
       naehme dem Ziel die Angabe, die die Quelle noch hat. */
    rejected_at: it.rejected_at, rejected_grund: it.rejected_grund,
    rejected_author: authorName(it.rejected_von),
    created_at: it.created_at, updated_at: it.updated_at,
    category: it.product_category_id ? qCat.get(it.product_category_id).name : null,
    tags: qTags.all(it.id).map(x => x.name),
    // Ein Link ist keine nackte String mehr, sondern eine Adresse mit
    // Verfasser -- wie an den vier anderen Traegern. Ohne dieses Feld kaemen
    // eingespielte Links herrenlos herein, und der Export verloere genau die
    // Angabe, die es zu tragen gilt. Dafuer steht die Formatnummer 7.
    links: qLinks.all(it.id).map(l => ({ url: l.url, author: authorName(l.user_id) })),
    // ORDER BY day, id: zwei Leute duerfen denselben Tag eintragen. Ohne
    // die zweite Bedingung haetten die beiden Zeilen keine feste
    // Reihenfolge in der Datei.
    testDays: db.prepare('SELECT id, day, rating, user_id FROM test_days WHERE item_id = ? ORDER BY day, id').all(it.id)
      .map(x => ({ day: x.day, rating: x.rating, author: authorName(x.user_id),
                   tags: qTestDayTags.all(x.id).map(y => y.name) })),
    // Dasselbe hier: je Kriterium steht eine Zeile JE BEWERTER in der Tabelle.
    // Ohne den Verfasser fielen sie beim Einspielen alle auf dieselbe Zeile
    // und ueberschrieben einander -- nur die letzte ueberlebte.
    ratings: db.prepare(`SELECT c.name, r.value, r.user_id FROM ratings r
                         JOIN rating_criteria c ON c.id = r.criterion_id WHERE r.item_id = ?
                         ORDER BY c.sort_order, c.id, r.user_id`).all(it.id)
      .map(r => ({ name: r.name, value: r.value, author: authorName(r.user_id) })),
    comments: db.prepare('SELECT id, text, kind, pinned, created_at, updated_at, user_id FROM comments WHERE item_id = ? ORDER BY id')
      .all(it.id).map(c => ({
        text: c.text, kind: c.kind, pinned: !!c.pinned, author: authorName(c.user_id),
        created_at: c.created_at, updated_at: c.updated_at,
        // Kommentarbilder folgen dem Schalter der Dateien; ein dritter waere
        // zu viel. Die Merkmale gehen immer mit, sie kosten nichts.
        images: mitDateien
          ? db.prepare('SELECT filename, data FROM comment_images WHERE comment_id = ? ORDER BY sort_order, id')
              .all(c.id).map(b2 => ({ filename: b2.filename, ['data' + extension]: funnel.nimm(b2.data) }))
          : []
      })),
    photos: [], attachments: []
  };
  if (mitFotos) {
    o.photos = db.prepare('SELECT mime_type, data, thumb, medium, focus_x, focus_y, zoom, art, dauer FROM photos WHERE item_id = ? ORDER BY sort_order, id')
      .all(it.id).map(p => {
        /* DER AUSSCHNITT GEHT MIT -- alle DREI Werte, seit Formatnummer 12.
           Ohne `zoom` in der Datei ginge er beim Einspielen verloren, und die
           Zweitinstanz zeigte einen anderen Ausschnitt als die erste. Eine
           aeltere Instanz uebergeht das zusaetzliche Feld wortlos. */
        const z = { mime_type: p.mime_type, focus_x: p.focus_x, focus_y: p.focus_y,
                    zoom: p.zoom, art: p.art };
        if (p.art !== 'video') { z['data' + extension] = funnel.nimm(p.data); return z; }
        z.dauer = p.dauer;
        /* OHNE DEN SCHALTER BLEIBT DIE ZEILE ALS MARKE STEHEN -- ohne Bytes.
           Sie legt beim Einspielen keinen Platz an (photos.data ist NOT
           NULL, und ein Videoplatz, der ein Standbild ausliefert, bliebe im
           Abspieler schwarz), aber der Import kann dadurch NENNEN, wie viele
           Videos die Datei nicht enthielt. Ohne die Marke wuesste er es
           nicht, und der Verlust waere still. */
        if (mitVideos) {
          z['data' + extension] = funnel.nimm(p.data);
          /* Das Standbild geht EIGENS mit. Der Import erzeugt die Varianten
             sonst aus data -- bei einem Video also aus der Videodatei, und
             das Standbild waere verloren. */
          const sb = p.medium || p.thumb;
          if (sb) z['standbild' + extension] = funnel.nimm(sb);
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
                    author: authorName(a2.user_id), ['data' + extension]: funnel.nimm(a2.data) }));
  }
  return o;
}

/* Der Umschlag um die Eintraege. Er steht getrennt, weil eine Datei mit EINEM
   Eintrag denselben Umschlag braucht wie eine mit hundert -- und weil der
   Papierkorb ihn ebenfalls ablegt: eine Papierkorbzeile ist ein vollstaendiges
   Paket und nicht ein halbes. */
function exportEnvelope(items) {
  const title = getSetting('title_app', 'Kriterion');
  // Zusaetzliches Feld, damit die Kriterienreihenfolge den Export ueberlebt.
  // Bestehende Feldnamen bleiben unveraendert, aeltere Dateien ohne dieses
  // Feld lassen sich weiterhin einspielen.
  const critRows = db.prepare('SELECT name, gewicht, phase FROM rating_criteria ORDER BY sort_order, id').all();
  /* Die Gewichte kommen als EIGENES Feld daneben, criteria bleibt eine Liste
     von Namen: auf Objekte umgestellt liefe eine aeltere Instanz durch String()
     und bekaeme ein Kriterium namens "[object Object]". Ein zusaetzliches
     Feld ignoriert sie dagegen wortlos.
     NUR ABWEICHUNGEN -- ein Kriterium mit Gewicht 1 taucht gar nicht auf. */
  const criteriaGewichte = {};
  for (const c of critRows) if (c.gewicht !== 1) criteriaGewichte[c.name] = c.gewicht;
  /* UND DIE PHASE IM SELBEN MUSTER -- 0.21.0, ein drittes Feld neben den
     beiden. NUR ABWEICHUNGEN: ein Kriterium des Kastens „nachher" taucht gar
     nicht auf, so wie ein Gewicht von 1 nicht auftaucht.
     EINE DATEI OHNE VORHER-KRITERIEN SIEHT DAMIT AUS WIE BISHER, plus einer
     Formatnummer -- und eine aeltere Instanz uebergeht das zusaetzliche Feld
     wortlos, genau wie seinerzeit criteriaGewichte. */
  const criteriaPhase = {};
  for (const c of critRows) if (c.phase !== 'nachher') criteriaPhase[c.name] = c.phase;
  return { exported_at: new Date().toISOString(), title, version: EXCHANGE_FORMAT,
           criteria: critRows.map(c => c.name), criteriaGewichte, criteriaPhase, items };
}

// Der Dateiname einer Exportdatei. Aus dem Titel der Instanz, damit zwei
// Instanzen nicht zwei gleichnamige Dateien im Ordner ablegen.
function exportName(zusatz) {
  const title = getSetting('title_app', 'Kriterion');
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kriterion';
  return `${slug}-export${zusatz}-${new Date().toISOString().slice(0, 10)}.json`;
}

/* WAS DER EXPORT AN BYTES WIRKLICH SCHREIBT -- je Art getrennt und vor dem
   ersten Handgriff. Base64 kostet ein Drittel Aufschlag; wer darueber liegt,
   bekommt eine Ansage statt eines Abrisses.

   MIT `itemId === null` GEHT DIESELBE RECHNUNG UEBER DEN GANZEN BESTAND. Das
   ist kein Beiwerk, sondern der Grund fuer die Bauform: die Kennzahlen, die
   Warnung am Knopf und die Absage am Einzelexport muessen dieselbe Zahl
   nennen. Zwei Rechenwege fuer dieselbe Auskunft liefen auseinander, und dann
   warnte die Karte bei einer Groesse, die die Route nicht kennt.

   GEZAEHLT WIRD, WAS IN DIE DATEI GEHT -- NICHT, WAS IN DER DATENBANK LIEGT:
   `photos.thumb` geht nie mit, `comment_images.thumb` ebenso wenig, und beim
   Video steht neben den Daten das Standbild (`medium`, ersatzweise `thumb`).
   Eine Summe ueber alle Blob-Spalten faellt deshalb zu hoch aus, und eine
   Warnung, die zu frueh kommt, wird weggeklickt. */
function exchangeParts(itemId, schalter) {
  const onlyOne = itemId !== null;
  const values = onlyOne ? [itemId] : [];
  const one = (sql) => db.prepare(sql).get(...values).n || 0;
  // Der Zusatz haengt an der Spalte, weil das Kommentarbild ueber den
  // Kommentar an den Eintrag kommt und nicht unmittelbar.
  const and = (column) => onlyOne ? ` AND ${column} = ?` : '';
  const wo = (column) => onlyOne ? ` WHERE ${column} = ?` : '';
  const base64 = (n) => Math.round(n * 4 / 3);
  const teile = { fotos: 0, videos: 0, anhaenge: 0, kommentarbilder: 0 };
  if (schalter.mitFotos)
    teile.fotos = base64(one(
      `SELECT COALESCE(SUM(length(data)),0) n FROM photos WHERE art != 'video'${and('item_id')}`));
  /* Der Videoschalter haengt am Fotoschalter, wie in entryAsBundle(): ohne
     Fotos wird die Liste gar nicht erst gebaut, und der Haken an den Videos
     bliebe eine Angabe ohne Wirkung. */
  if (schalter.mitFotos && schalter.mitVideos)
    teile.videos = base64(one(
      `SELECT COALESCE(SUM(length(data) + COALESCE(length(medium), length(thumb), 0)),0) n
         FROM photos WHERE art = 'video'${and('item_id')}`));
  if (schalter.mitDateien) {
    teile.anhaenge = base64(one(
      `SELECT COALESCE(SUM(length(data)),0) n FROM attachments${wo('item_id')}`));
    // Kommentarbilder folgen dem Schalter der Dateien -- dort und hier.
    teile.kommentarbilder = base64(one(
      `SELECT COALESCE(SUM(length(ci.data)),0) n FROM comment_images ci
         JOIN comments c ON c.id = ci.comment_id${wo('c.item_id')}`));
  }
  return teile;
}

/* DER UMSCHLAG -- alles, was die Datei traegt und keine Blob-Spalte ist.
   Er steht getrennt, weil er als einziger Teil auch dann anfaellt, wenn jeder
   Schalter aus ist: ein Export "ohne Fotos" ist nicht null Bytes gross.

   ZWEI ANTEILE, und sie werden verschieden gewonnen:
     der TEXT wird gemessen -- Titel, Beschreibung, Kommentare, Tags, Adressen;
     die FORM wird geschaetzt -- Feldnamen, Klammern, Anfuehrungszeichen.
   Die Form je Datensatz ist knapp gerechnet, aber sie ist abzaehlbar: ein
   Eintrag traegt rund zwanzig Feldnamen, ein Kommentar sieben, eine Bewertung
   drei. DIE ZAHLEN SIND OBERGRENZEN JE DATENSATZ und keine Messung; sie
   stehen hier beieinander, damit niemand sie im Rumpf sucht. */
const ENVELOPE_PER = { entry: 320, kommentar: 150, bewertung: 70, zeitpunkt: 90, foto: 110, datei: 130 };
function exchangeEnvelopeBytes(itemId) {
  const onlyOne = itemId !== null;
  const values = onlyOne ? [itemId] : [];
  const one = (sql) => db.prepare(sql).get(...values).n || 0;
  const wo = (column) => onlyOne ? ` WHERE ${column} = ?` : '';
  /* Die Tags gehen NICHT ueber die Vorratstabelle, sondern ueber die
     Verknuepfung: derselbe Name steht an zwanzig Eintraegen und kostet in der
     Datei zwanzigmal Platz. Ueber `tags` gezaehlt faellt er einmal an, und
     die Schaetzung waere bei einem stark verschlagworteten Bestand zu klein. */
  const text =
      one(`SELECT COALESCE(SUM(length(COALESCE(title,'')) + length(COALESCE(description,''))),0) n
              FROM items${wo('id')}`)
    + one(`SELECT COALESCE(SUM(length(COALESCE(text,''))),0) n FROM comments${wo('item_id')}`)
    + one(`SELECT COALESCE(SUM(length(t.name)),0) n FROM item_tags it
              JOIN tags t ON t.id = it.tag_id${wo('it.item_id')}`)
    + one(`SELECT COALESCE(SUM(length(url)),0) n FROM links${wo('item_id')}`);
  const form =
      one(`SELECT COUNT(*) n FROM items${wo('id')}`) * ENVELOPE_PER.entry
    + one(`SELECT COUNT(*) n FROM comments${wo('item_id')}`) * ENVELOPE_PER.kommentar
    + one(`SELECT COUNT(*) n FROM ratings${wo('item_id')}`) * ENVELOPE_PER.bewertung
    + one(`SELECT COUNT(*) n FROM test_days${wo('item_id')}`) * ENVELOPE_PER.zeitpunkt
    + one(`SELECT COUNT(*) n FROM photos${wo('item_id')}`) * ENVELOPE_PER.foto
    + one(`SELECT COUNT(*) n FROM attachments${wo('item_id')}`) * ENVELOPE_PER.datei;
  return text + form;
}

/* ---- Der Export in Teilen ----------------------------------------------
   WOZU. Bei genuegend Fotos gibt es die eine Datei nicht: 760 MB gegen Nodes
   512 MB, gemessen an der laufenden Instanz am 28. August 2026. Der Export sagt
   das seit 0.12.3 sauber an -- und liefert seither nichts mehr.

   WARUM TEILE UND NICHT EIN STROM. Ein Strom loeste den Weg HINAUS und liesse
   den Weg ZURUECK zu: der Import liest die Datei ueber readAsText() im Browser
   und buffer.toString('utf8') am Server, beides ein einziger String. Eine
   gestreamte Datei koennte diese Instanz nicht wieder einspielen.
   JEDER TEIL IST DAGEGEN EINE VOLLSTAENDIGE EXPORTDATEI -- derselbe Umschlag,
   dieselbe Formatnummer, nur weniger Eintraege darin. Der vorhandene Import
   nimmt sie mit "Zusammenfuehren" wieder auf, ohne eine Zeile Aenderung.
   ES GIBT DAMIT KEIN NEUES FORMAT und keinen zweiten Leser.

   GESCHNITTEN WIRD AN EINTRAGSGRENZEN, nie mitten in einem Eintrag: ein halber
   Eintrag waere kein gueltiger Export, und der Import muesste zwei Teile
   kennen, um ihn zu verstehen. Genau das soll nicht entstehen.

   DIE GRENZEN SIND EINTRAGSNUMMERN UND KEINE POSITIONEN. Wer zwischen dem Plan
   und dem Herunterladen einen Eintrag anlegt, verschoebe sonst jedes Fenster
   dahinter -- ein Eintrag fiele heraus, ein anderer kaeme zweimal. Ueber
   `von`/`bis` bleibt jedes Fenster das, was der Plan genannt hat. */
const EXCHANGE_PART_MAX = 999;

/* Die Groesse JE EINTRAG, in EINER Abfrage statt in zehn je Eintrag.
   Bei tausend Eintraegen waeren es sonst zehntausend vorbereitete Anweisungen,
   und der Plan braeuchte laenger als der Export.
   GEZAEHLT WIRD DASSELBE WIE IN exchangeParts() -- rohe Bytes; der
   Base64-Aufschlag und der Umschlag kommen danach in JS dazu, aus denselben
   Konstanten. So steht der Faktor an einem Ort, auch wenn die Abfrage eine
   andere ist. Eine Pruefung haelt beide Summen gegeneinander. */
const qPartSizes = db.prepare(`
  SELECT i.id,
    COALESCE((SELECT SUM(length(p.data)) FROM photos p
               WHERE p.item_id = i.id AND p.art != 'video'), 0) AS foto,
    COALESCE((SELECT SUM(length(p.data) + COALESCE(length(p.medium), length(p.thumb), 0))
                FROM photos p WHERE p.item_id = i.id AND p.art = 'video'), 0) AS video,
    COALESCE((SELECT SUM(length(a.data)) FROM attachments a WHERE a.item_id = i.id), 0) AS anhang,
    COALESCE((SELECT SUM(length(ci.data)) FROM comment_images ci
                JOIN comments c ON c.id = ci.comment_id WHERE c.item_id = i.id), 0) AS kbild,
    length(COALESCE(i.title,'')) + length(COALESCE(i.description,'')) AS text,
    COALESCE((SELECT SUM(length(c.text)) FROM comments c WHERE c.item_id = i.id), 0) AS ktext,
    COALESCE((SELECT SUM(length(t.name)) FROM item_tags it JOIN tags t ON t.id = it.tag_id
               WHERE it.item_id = i.id), 0) AS tagtext,
    COALESCE((SELECT SUM(length(l.url)) FROM links l WHERE l.item_id = i.id), 0) AS linktext,
    (SELECT COUNT(*) FROM comments c WHERE c.item_id = i.id) AS nk,
    (SELECT COUNT(*) FROM ratings r WHERE r.item_id = i.id) AS nb,
    (SELECT COUNT(*) FROM test_days d WHERE d.item_id = i.id) AS nz,
    (SELECT COUNT(*) FROM photos p WHERE p.item_id = i.id) AS nf,
    (SELECT COUNT(*) FROM attachments a WHERE a.item_id = i.id) AS nd,
    i.title AS titel
  FROM items i ORDER BY i.id`);

// Was EIN Eintrag in der Datei kostet -- Blobs nach Schalter, Text und Form
// immer. Dieselbe Rechnung wie exchangeBytes(), nur aus einer fertigen Zeile.
function partBytes(z, schalter) {
  const base64 = (n) => Math.round(n * 4 / 3);
  let n = 0;
  if (schalter.mitFotos) n += z.foto;
  if (schalter.mitFotos && schalter.mitVideos) n += z.video;
  if (schalter.mitDateien) n += z.anhang + z.kbild;
  return base64(n) + z.text + z.ktext + z.tagtext + z.linktext
    + ENVELOPE_PER.entry + z.nk * ENVELOPE_PER.kommentar + z.nb * ENVELOPE_PER.bewertung
    + z.nz * ENVELOPE_PER.zeitpunkt + z.nf * ENVELOPE_PER.foto + z.nd * ENVELOPE_PER.datei;
}

/* Der Schnittplan. Er sagt, WIE VIELE Teile es gibt und WELCHE Eintraege in
   jeden gehoeren -- und er nennt die Eintraege, die in keinen Teil passen.

   EIN EINTRAG, DER FUER SICH ALLEIN ZU GROSS IST, KANN NICHT GESCHNITTEN
   WERDEN. Zwanzig Videos zu je 20 MB sind als Base64 533 MB in EINEM Eintrag,
   und ein Eintrag ist die kleinste Einheit, die der Import versteht. Er wird
   deshalb NICHT stillschweigend uebergangen, sondern namentlich genannt: wer
   ihn sieht, weiss, dass er die Videos abwaehlen oder diesen einen Eintrag von
   Hand behandeln muss. Ein stiller Verlust waere der schlimmere Ausgang.

   DER ZIELWERT IST EXCHANGE_WARN und nicht EXCHANGE_MAX: die Teilgroesse ist
   eine Schaetzung wie jede andere hier, und ein Teil, der die harte Grenze
   streift, waere genau der Fall, den diese Runde beseitigen soll.

   ER LAESST SICH KLEINER STELLEN, aber nicht groesser. Wer seine Teile auf
   einen Datentraeger oder durch eine Hochladegrenze bringen muss, braucht
   kleinere; groesser darf niemand, denn oberhalb von EXCHANGE_WARN baute die
   Instanz Teile, vor denen sie im selben Atemzug warnt.
   DIE UNTERGRENZE IST NICHT ZIERDE: bei einem Zielwert unter einem Megabyte
   entstuenden bei tausend Eintraegen tausend Dateien, und der Import waere
   tausend Handgriffe. */
const EXCHANGE_PART_MIN = 1024 * 1024;
function exchangePlan(schalter, targetWanted) {
  const zielGroesse = Math.min(EXCHANGE_WARN,
    Math.max(EXCHANGE_PART_MIN, Number(targetWanted) > 0 ? Number(targetWanted) : EXCHANGE_WARN));
  const zeilen = qPartSizes.all();
  const grund = exchangeEnvelopeFrame();
  const teile = [];
  const tooBig = [];
  let offen = null;
  for (const z of zeilen) {
    const b = partBytes(z, schalter);
    if (grund + b > EXCHANGE_MAX) { tooBig.push({ id: z.id, titel: z.titel, bytes: grund + b }); continue; }
    // Ein neuer Teil, sobald dieser Eintrag den laufenden ueber den Zielwert
    // hoebe. Der erste Eintrag eroeffnet immer -- sonst entstuende ein leerer.
    if (!offen || offen.bytes + b > zielGroesse) {
      offen = { nr: teile.length + 1, von: z.id, bis: z.id, anzahl: 0, bytes: grund };
      teile.push(offen);
    }
    offen.bis = z.id;
    offen.anzahl++;
    offen.bytes += b;
  }
  return { teile, zuGross: tooBig,
           gesamt: teile.reduce((n, teil) => n + teil.bytes, 0),
           zielGroesse, vorgabe: EXCHANGE_WARN, kleinstes: EXCHANGE_PART_MIN,
           grenze: EXCHANGE_MAX, string: EXCHANGE_STRING };
}

/* Was der Umschlag OHNE Eintraege kostet -- Titel, Zeitstempel, Formatnummer
   und die Kriterienliste. Er faellt in JEDEM Teil an, nicht einmal: jeder Teil
   ist eine vollstaendige Datei. Bei einer Handvoll Kriterien sind das ein paar
   hundert Bytes, und genau deshalb steht er hier und wird nicht geschaetzt. */
function exchangeEnvelopeFrame() {
  const title = getSetting('title_app', 'Kriterion');
  const critRows = db.prepare('SELECT name, gewicht, phase FROM rating_criteria ORDER BY sort_order, id').all();
  return JSON.stringify({ exported_at: new Date().toISOString(), title, version: EXCHANGE_FORMAT,
                          criteria: critRows.map(c => c.name),
                          criteriaGewichte: Object.fromEntries(
                            critRows.filter(c => c.gewicht !== 1).map(c => [c.name, c.gewicht])),
                          // Der Rahmen misst, was der Umschlag KOSTET -- also
                          // gehoert das dritte Feld hier genauso hinein wie in
                          // die Datei. Ohne es faellt die Messung je Teil um
                          // die Vorher-Kriterien zu niedrig aus.
                          criteriaPhase: Object.fromEntries(
                            critRows.filter(c => c.phase !== 'nachher').map(c => [c.name, c.phase])),
                          items: [] }).length;
}

/* Wie viele Bytes eine Datei traegt, BEVOR sie gebaut wird -- als eine Zahl.
   Der Umschlag gehoert dazu: eine Absage, die nur die Blobs zaehlt, laesst
   genau die Datei durch, die am Umschlag zerbricht. */
function exchangeBytes(itemId, schalter) {
  const teile = exchangeParts(itemId, schalter);
  return teile.fotos + teile.videos + teile.anhaenge + teile.kommentarbilder + exchangeEnvelopeBytes(itemId);
}

/* ---- Export ---- */
// Nur der Eigentuemer. Die Exportdatei ist der gesamte Bestand in
// einer Datei, die das Haus verlaesst -- mit allen Fotos, allen Anhaengen und
// den Namen aller Verfasser. "Alles sehen darf jeder" gilt fuer
// den Bildschirm, nicht fuer die Mitnahme.
// HINZUNEHMENDE FOLGE, und sie gehoert in den Betrieb: ein Admin ohne
// Eigentuemerrecht kann keine Sicherung mehr ziehen.
/* DIE ZWEITE BESTAETIGUNG ALS WAECHTER, und hier gab es keine Wahl: der
   Knopf loest eine BROWSERNAVIGATION aus, damit die Datei an der Platte
   vorbeilaeuft. Ein Rumpf ist dort baulich unmoeglich, und in die Adresse
   gehoert ein Passwort nie.
   LESEND, DESHALB KEIN EINTRAG IN F_ROUTEN -- die Klemme bekommt dafuer eine
   eigene Quelltextpruefung daneben. */
/* Der Schnittplan. LESEND UND OHNE ZWEITE BESTAETIGUNG -- es verlaesst nichts
   das Haus: die Antwort nennt Nummern, Groessen und die Titel der Eintraege,
   die zu gross sind, und die sieht der Eigentuemer ohnehin an jeder Kachel.
   DIE BESTAETIGUNG STEHT AN DEN TEILEN SELBST, und das ist die richtige
   Stelle: dort gehen die Bytes hinaus.
   Lesend, deshalb kein Eintrag in F_ROUTEN. */
app.get('/api/export/plan', ownerOnly, (req, res) => {
  res.json(exchangePlan({
    mitFotos: req.query.photos !== '0',
    mitDateien: req.query.files === '1',
    mitVideos: req.query.videos === '1'
  }, req.query.ziel));
});

app.get('/api/export', ownerOnly, secondConfirmNeeded('export'), (req, res) => {
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
  /* DIE ABSAGE STEHT VOR DEM BAU, nicht hinter dem Abbruch -- dieselbe Bauform
     wie am Einzelexport eine Seite weiter unten. Vorher lief dieser Weg bis in
     `JSON.stringify` hinein und kam mit `RangeError: Invalid string length`
     zurueck: eine 500 nach zwei Minuten, mit einem Spitzenverbrauch, den
     niemand gebraucht hat. Ein Knopf, der so abbricht, sieht aus wie ein
     kaputtes Programm; er ist aber eine erreichte Grenze, und der Unterschied
     liegt allein darin, ob die Instanz es vorher sagt.
     GEWARNT WIRD AN DER KARTE, ABGESAGT WIRD HIER. Die beiden Zahlen haben
     verschiedene Aufgaben: EXCHANGE_WARN nimmt niemandem etwas weg,
     EXCHANGE_MAX ist die Grenze, hinter der es keine Datei mehr gibt.
     KEIN STROM: hier wird nichts umgebaut, was funktioniert. Der Weg an der
     Grenze vorbei steht in der Message und heisst Sicherung. */
  /* DAS FENSTER. Ohne `von`/`bis` ist es der ganze Bestand -- der Weg von
     0.12.3 und davor, Zeile fuer Zeile derselbe. Mit ihnen ist es ein Teil,
     und dann traegt der Dateiname seine Nummer.
     GEPRUEFT WIRD BEIDES EINZELN, denn eine halbe Angabe ist ein Fehler und
     kein Vollexport: wer `von` schickt und `bis` vergisst, bekaeme sonst
     stillschweigend alles. */
  const zahl = (w) => { const n = Number(w); return Number.isInteger(n) && n > 0 ? n : null; };
  const von = zahl(req.query.von), bis = zahl(req.query.bis);
  const teil = zahl(req.query.teil), teile = zahl(req.query.teile);
  const asPart = von !== null || bis !== null || teil !== null || teile !== null;
  if (asPart && (von === null || bis === null || teil === null || teile === null))
    return res.status(400).json({ error: t(localeOf(req), 'server.partExportIncomplete')});
  if (asPart && (von > bis || teil > teile || teile > EXCHANGE_PART_MAX))
    return res.status(400).json({ error: t(localeOf(req), 'server.partExportMismatch')});

  const big = exchangeBytes(null, schalter);
  if (!asPart && big > EXCHANGE_MAX)
    return res.status(413).json({ error:
      t(localeOf(req), 'server.exportTooBig', { mb: Math.round(big / 1048576), grenze: Math.round(EXCHANGE_STRING / 1048576) })});
  const situation = bundleState(req.benutzer.id, schalter);
  const items = (asPart
    ? db.prepare('SELECT * FROM items WHERE id BETWEEN ? AND ? ORDER BY id').all(von, bis)
    : db.prepare('SELECT * FROM items ORDER BY id').all()).map(it => entryAsBundle(it, situation));
  /* Ein Teil steht als solcher im Protokoll -- sonst saehe ein Bestand, der in
     fuenf Teilen hinausgeht, aus wie fuenf volle Exporte.
     DAS MERKMAL IST DAS WORT UND NICHT DIE NUMMER: merkmal traegt nur Werte
     aus MERKMALE, und "teil 1/5" stand nicht darin -- 0.12.4 hat damit gar
     keine Zeile geschrieben. Die Nummer des Teils steht im Dateinamen. */
  auth.log('export', { wer: req.benutzer.id, merkmal: asPart ? 'teil' : null });
  res.set('Content-Disposition',
    `attachment; filename="${exportName(asPart ? `-teil-${teil}-von-${teile}` : '')}"`);
  /* DAS NETZ UNTER DER SCHAETZUNG. Die Absage oben rechnet, sie misst nicht --
     faellt sie zu niedrig aus, wirft `res.json` genau hier. Express baut den
     String VOR dem Kopf und vor dem Senden; die Antwort ist an dieser Stelle
     also noch unberuehrt und kann die Absage nachreichen.
     DER DATEIKOPF MUSS DABEI WIEDER WEG -- sonst laedt der Browser die
     Fehlermeldung als Exportdatei herunter. */
  try { res.json(exportEnvelope(items)); }
  catch (e) {
    if (!(e instanceof RangeError)) throw e;
    res.removeHeader('Content-Disposition');
    res.status(413).json({ error:
      t(localeOf(req), 'server.exportGrew', { grenze: Math.round(EXCHANGE_STRING / 1048576) })});
  }
});

/* ---- Ein einzelner Eintrag als Datei ----
 * Lesend, deshalb kein Eintrag in F_ROUTEN -- der Waechter davor ist derselbe
 * wie am vollen Export.
 * WARUM NICHT MILDER: eine Datei mit EINEM Eintrag nennt genauso die Namen
 * ihrer Verfasser und kann beim Einspielen genauso unter fremdem Namen
 * schreiben.
 * ALLES GEHT MIT, ohne Schalter. Wo sie zu gross wuerde, steht eine Absage.
 */
app.get('/api/items/:id/export', ownerOnly, (req, res) => {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!it) return res.status(404).json({ error: t(localeOf(req), 'server.entryUnknown')});
  const schalter = { mitFotos: true, mitDateien: true, mitVideos: true };
  const big = exchangeBytes(it.id, schalter);
  if (big > EXCHANGE_MAX)
    return res.status(413).json({ error: t(localeOf(req), 'server.entryTooBig', { mb: Math.round(big / 1048576), grenze: Math.round(EXCHANGE_STRING / 1048576) })});
  const bundle = entryAsBundle(it, bundleState(req.benutzer.id, schalter));
  res.set('Content-Disposition', `attachment; filename="${exportName('-' + it.id)}"`);
  res.json(exportEnvelope([bundle]));
});

/* ---- Import ---- */
const importUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 900 * 1024 * 1024 } });

/* DER DESERIALISIERER, und er steht hier statt im Routenrumpf -- aus demselben
   Grund wie die Abbildung eine Seite weiter oben: das Wiederherstellen aus dem
   Papierkorb braucht ihn genauso wie die Datei. Ein zweiter, frisch
   geschriebener liefe auseinander, nur spiegelverkehrt.

   `bytesSource` loest die Nummern des Papierkorbs auf und ist bei einer Datei
   null -- dort stehen die Bytes als Base64 in der JSON selbst.

   ASYNCHRON, und das hat einen Grund: die Bildvarianten entstehen ueber sharp
   und muessen VOR der Transaktion fertig sein. In der Transaktion darf nichts
   Langsames und nichts Asynchrones mehr passieren. */
async function importInto(payload, userId, mode2, bytesSource = null) {
  // Ableitungen vorab erzeugen: das geht nicht innerhalb einer Transaktion,
  // weil es asynchron ist.
  const prepared = [];
  // Kommentarbilder je Kommentarobjekt, damit sie in der Transaktion
  // bereitliegen. WeakMap geht nicht -- die Objekte werden dort mehrfach
  // nachgeschlagen.
  const commentImages = new Map();
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
      const isVideo = p.art === 'video';
      const buf = bytesOf(p, 'data', bytesSource);
      if (!buf) {
        // Ein Videoplatz ohne Videodatei: so steht er in einer Datei, die
        // ohne den Schalter geschrieben wurde. Er wird nicht angelegt,
        // sondern gezaehlt und genannt. HINZUNEHMENDE FOLGE, und sie gehoert
        // gesagt: stand das Video an erster Stelle, wird das naechste Foto
        // zum Hauptbild.
        if (isVideo) videosOhneDatei++;
        continue;
      }
      /* Bei einem Video kommen die Varianten aus dem STANDBILD, nie aus
         data: dort steht die Videodatei. Laesst sich das Standbild nicht
         durch sharp lesen oder fehlt es, wird die Zeile uebergangen und
         genannt -- dieselbe Regel wie beim Hochladen. */
      const vorlage = isVideo ? bytesOf(p, 'standbild', bytesSource) : buf;
      /* DER ZUSCHNITT AUS DER DATEI GEHT IN DIE ABLEITUNG -- 0.19.5. Er wird
         eine Zeile tiefer ohnehin gelesen; ohne ihn HIER truege jede
         eingespielte Zeile eine ungeschnittene Kachel, und der Bestandslauf
         muesste sie beim naechsten Start ein zweites Mal anfassen -- an einem
         Bestand, den gerade jemand eingespielt hat, ist das der ganze
         Bestand. */
      const im = (name, roh) => displayValue(name, roh) ?? DISPLAY_VALUES[name].vorgabe;
      const crop = { fx: im('focus_x', p.focus_x), fy: im('focus_y', p.focus_y),
                          zoom: im('zoom', p.zoom) };
      const v = vorlage ? await makeVariants(vorlage, crop) : { thumb: null, medium: null };
      // Dieselbe Schaerfe wie beim Hochladen: fehlt EINE der beiden
      // Varianten, wird die Zeile nicht angelegt. Das Nachruesten beim Start
      // holt sie an einer Videozeile nicht nach.
      if (isVideo && (!v.thumb || !v.medium)) { videosUnlesbar++; continue; }
      /* DEN AUSSCHNITT AUS DER DATEI UEBERNEHMEN -- alle drei Werte, ueber
         DIESELBE Tafel, die auch die Route benutzt. Fehlt ein Feld (Datei der
         Formatnummer 11 oder aelter, oder ein Export ohne Fokuspunkt), gilt
         die Vorgabe: Mitte und weitester Ausschnitt. Das ist genau die Regel,
         mit der der Fokuspunkt seinerzeit eingefuehrt wurde, und sie ist der
         Grund, warum hier keine Fallunterscheidung nach Formatnummer steht --
         entschieden wird ueber das Vorhandensein der Felder. */
      // Die Dauer ist eine Angabe wie der gemeldete Typ, und sie wird
      // genauso beschnitten wie beim Hochladen.
      const d = Math.round(Number(p.dauer));
      photos.push({ mime: p.mime_type || (isVideo ? 'video/mp4' : 'image/jpeg'),
                    buf, thumb: v.thumb, medium: v.medium,
                    fx: crop.fx, fy: crop.fy, zoom: crop.zoom,
                    art: isVideo ? 'video' : 'bild',
                    dauer: isVideo && Number.isFinite(d) && d > 0 && d <= 24 * 3600 ? d : null });
    }
    const attachments = [];
    for (const a2 of it.attachments || []) {
      const buf = bytesOf(a2, 'data', bytesSource);
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
      const done = [];
      for (const b2 of c.images || []) {
        const roh = bytesOf(b2, 'data', bytesSource);
        if (!roh) continue;
        try {
          const { big, small } = await encodeCommentImage(roh);
          done.push({ name: path.basename(String(b2.filename || 'bild.jpg')).slice(0, 200), big, small });
        } catch { /* unlesbares Bild wird stillschweigend uebergangen */ }
      }
      if (done.length) commentImages.set(c, done);
    }
    prepared.push({ it, photos, attachments });
  }

  const stats = { items: 0, photos: 0, videos: 0, comments: 0, links: 0, testDays: 0, attachments: 0 };
  // Die Nummern der neu angelegten Eintraege. Der Papierkorb braucht sie, um
  // nach dem Wiederherstellen in den Eintrag springen zu koennen; die
  // Dateieinspielung laesst sie liegen.
  const newIds = [];

  /* EIN Ort, der aus einem Namen eine Id macht -- die Gegenrichtung zur
     Karte im Export. Ein genannter Name, den es gibt, wird zugeordnet; alles
     andere faellt an den Einspielenden.
     EIN UNBEKANNTER NAME LEGT KEINEN ZUGANG AN -- sonst waere eine
     Exportdatei ein Weg an Verwaltung und Passwort vorbei.
     EIN GRABSTEIN WIRD GEFUNDEN, solange seine Zeile in users steht.
     Gesucht wird ueber username (COLLATE NOCASE); ein nachlaufendes
     Leerzeichen trifft die Spalte nicht, deshalb das trim(). */
  const nameStore = new Map();
  const unknownNames = new Set();
  let assigned = 0;
  const qByName = db.prepare('SELECT id FROM users WHERE username = ?');
  const verfasser = (name) => {
    const sauber = String(name == null ? '' : name).trim();
    if (!sauber) return userId;
    let id = nameStore.get(sauber);
    if (id === undefined) {
      const u = qByName.get(sauber);
      id = u ? u.id : null;
      nameStore.set(sauber, id);
    }
    if (id == null) { unknownNames.add(sauber); return userId; }
    // Der eigene Name ist kein Fremdverweis: er zaehlt nicht als zugeordnet,
    // sonst meldete jede selbst erzeugte Datei eine Zuordnung, die keine ist.
    if (id !== userId) assigned++;
    return id;
  };

  /* Die Gewichte aus der Datei, einmal aufbereitet -- ausdruecklich
     AUSSERHALB der Transaktion, weil die Antwort unten die verworfenen nennen
     muss. Der Schluessel steht klein, weil critByName() ueber COLLATE NOCASE
     sucht.
     EIN UNGUELTIGES GEWICHT BRICHT NICHT AB, sondern faellt auf 1,0 und wird
     genannt. */
  const dateiGewichte = new Map();
  const gewichteVerworfen = new Set();
  const rohGewichte = payload.criteriaGewichte;
  if (rohGewichte && typeof rohGewichte === 'object' && !Array.isArray(rohGewichte)) {
    for (const [name, roh] of Object.entries(rohGewichte)) {
      const sauber = String(name || '').trim();
      if (!sauber) continue;
      const g = validWeight(roh);
      if (g === null) { gewichteVerworfen.add(sauber); continue; }
      dateiGewichte.set(sauber.toLowerCase(), g);
    }
  }

  /* DIE KAESTEN AUS DER DATEI, im selben Muster wie die Gewichte darueber --
     0.21.0. Ein Kriterium OHNE Eintrag in criteriaPhase ist 'nachher'; damit
     ist jede Datei aus einem aelteren Format ohne Sonderweg lesbar, und
     nirgends steht eine Fallunterscheidung nach Formatnummer.
     EIN UNSINNIGER WERT FAELLT AUF 'nachher' und bricht nichts ab -- dieselbe
     Haltung wie beim ungueltigen Gewicht. Er sagt nichts, was diese
     Installation nicht schon annimmt. */
  const dateiPhasen = new Map();
  const rohPhasen = payload.criteriaPhase;
  if (rohPhasen && typeof rohPhasen === 'object' && !Array.isArray(rohPhasen)) {
    for (const [name, roh] of Object.entries(rohPhasen)) {
      const sauber = String(name || '').trim();
      if (!sauber || !PHASES.includes(roh)) continue;
      dateiPhasen.set(sauber.toLowerCase(), roh);
    }
  }
  const phaseFrom = (name) =>
    dateiPhasen.get(String(name).trim().toLowerCase()) || PHASE_DEFAULT;

  /* DER KONFLIKT UEBER DIE KAESTEN HINWEG, UND ER WIRD VOR DEM ERSTEN
     SCHREIBEN ABGEWIESEN -- 0.21.0.
     Traegt die Datei ein Kriterium, das es hier unter DEMSELBEN NAMEN im
     ANDEREN Kasten gibt, ist das eine Absage mit Message, die das Kriterium
     nennt. NICHT still in den vorhandenen Kasten einspielen: die Sterne
     landeten dann im falschen Durchschnitt, und die Datei sagte etwas anderes
     als die Installation.
     VOR DER TRANSAKTION UND NICHT IN IHR: ein Rollback raeumte die Zeilen zwar
     weg, aber die Absage soll GAR KEINE Schreibung ausloesen -- auch keine,
     die gleich wieder zurueckgenommen wird. Beim ersetzenden Import waeren die
     drei DELETEs eine Zeile weiter unten sonst schon gelaufen.
     GEPRUEFT WIRD GEGEN DEN BESTAND, DER NACH DEM MODUS UEBRIG BLEIBT: beim
     ERSETZENDEN Import faellt rating_criteria nicht (die drei DELETEs treffen
     items, product_categories und tags), also gilt derselbe Vergleich fuer
     beide Modi.
     GESUCHT WIRD UEBER COLLATE NOCASE -- so, wie critByName() gleich sucht.
     Eine Absage nach anderer Regel als die Zuordnung waere keine. */
  const qPhaseOf = db.prepare('SELECT name, phase FROM rating_criteria WHERE name = ? COLLATE NOCASE');
  const conflicts = [];
  for (const name of Array.isArray(payload.criteria) ? payload.criteria : []) {
    const clean = String(name || '').trim();
    if (!clean) continue;
    const da = qPhaseOf.get(clean);
    if (da && da.phase !== phaseFrom(clean)) conflicts.push(da.name);
  }
  if (conflicts.length) {
    /* EIN GANZER SATZ JE ZAHLFORM UND KEIN ZUSAMMENGEKLEBTER -- 0.24.0. Bis
       dahin waehlte der Code zwischen „steht" und „stehen"; das ist Satzbau im
       Quelltext, und er faellt (Konzept, Abschnitt 0, Satz 2). */
    const e = new Message('server.criteriaConflict',
                          { n: conflicts.length, namen: conflicts.join(', ') });
    e.absage = true;
    throw e;
  }

  // Ein einziger Vorgang: bricht etwas ab, bleibt der Bestand unveraendert.
  db.transaction(() => {
    if (mode2 === 'replace') {
      /* DIESE DREI ZEILEN FUELLEN DEN PAPIERKORB AUSDRUECKLICH NICHT.
         Ein ersetzender Import legte sonst die ganze bisherige Instanz als
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
      /* UND SEINEN KASTEN AUS DER DATEI, sonst 'nachher'. Ein VORHANDENES
         behaelt den seinen -- so wie es sein Gewicht behaelt; anders als beim
         Gewicht kann es hier aber gar nicht abweichen, denn die Absage
         darueber hat den Fall schon abgefangen. */
      return db.prepare('INSERT INTO rating_criteria (name, sort_order, gewicht, phase) VALUES (?, ?, ?, ?)')
        .run(name, pos, g === undefined ? 1.0 : g, phaseFrom(name)).lastInsertRowid;
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
      const itemAuthor = verfasser(it.author);
      /* WER ABGELEHNT HAT -- ueber dieselbe Abbildung wie jeder andere
         Verfasser, aber mit einem Unterschied, und der ist der Punkt:
         EIN FEHLENDER NAME BLEIBT LEER UND FAELLT NICHT AN DEN EINSPIELENDEN.
         verfasser() tut das mit gutem Grund -- eine Zeile ohne Verfasser waere
         herrenlos --, doch hier gibt es die Zeile auch ohne: ein Eintrag, den
         niemand abgelehnt hat, hat keinen Ablehnenden. Wer hier zurueckfiele,
         machte aus JEDEM eingespielten Eintrag eine Ablehnung durch den
         Einspielenden.
         EIN GENANNTER, ABER UNBEKANNTER NAME faellt dagegen sehr wohl an ihn
         und wird in der Antwort genannt -- das ist dieselbe Regel wie ueberall
         sonst in dieser Datei. */
      const rejectedBy = String(it.rejected_author == null ? '' : it.rejected_author).trim()
        ? verfasser(it.rejected_author) : null;
      /* EINE DATEI DER FORMATNUMMER 10 UND AELTER TRAEGT DIE DREI FELDER NICHT.
         Dann bleiben sie leer -- genau wie bei einem Bestand, den der
         Migrationsblock nachgeruestet hat. Entschieden wird ueber das
         VORHANDENSEIN der Felder und nicht ueber die Nummer; die Nummer ist in
         diesem Format eine Aussage und keine Bedingung. */
      const id = db.prepare(`INSERT INTO items
        (title, description, rejected, rejected_at, rejected_grund, rejected_von,
         tested, product_category_id, created_at, updated_at, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')), COALESCE(?, datetime('now')), ?)`)
        .run(it.title || 'Ohne Titel', it.description || '',
             it.rejected ? 1 : 0,
             it.rejected_at == null ? null : String(it.rejected_at),
             it.rejected_grund == null ? null : reasonText(String(it.rejected_grund)),
             rejectedBy,
             it.tested ? 1 : 0,
             catByName(it.category), it.created_at || null, it.updated_at || null,
             itemAuthor).lastInsertRowid;
      newIds.push(id);
      // Der Favorit bleibt beim Einspielenden, auch wenn der Eintrag einem
      // anderen zufaellt: favorite heisst "habe ICH als Favorit markiert".
      if (it.favorite) db.prepare('INSERT OR IGNORE INTO item_pins (user_id, item_id) VALUES (?, ?)')
        .run(userId, id);
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
      /* ZWEI FORMEN, EINE SCHLEIFE: bis Formatnummer 6 ist ein Link ein
         nackter String, ab 7 ein Objekt mit url und author. Eine alte Datei
         ist kein Fehler.
         WEM EIN LINK AUS EINER DATEI DER FORMATNUMMER 6 GEHOERT: dem
         Verfasser DES EINTRAGS. Die Datei sagt nichts anderes; "unbekannter
         Name" traefe es nicht, es steht ja keiner da. Deshalb wird hier
         verfasser() NICHT gefragt. */
      let lpos = 0;
      (it.links || []).forEach((entry) => {
        const roh = (entry && typeof entry === 'object') ? entry.url : entry;
        const sauber = normalizeLink(roh);
        if (!sauber) return;
        const toWhom = (entry && typeof entry === 'object' && 'author' in entry)
          ? verfasser(entry.author) : itemAuthor;
        db.prepare('INSERT INTO links (item_id, url, sort_order, user_id) VALUES (?, ?, ?, ?)')
          .run(id, sauber, lpos++, toWhom);
        stats.links++;
      });

      for (const tag of it.testDays || []) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(tag.day || '')) continue;
        // OR REPLACE bleibt: die Datei ist die Wahrheit, der spaetere Wert
        // gewinnt. Das tut mehr, als es aussieht: REPLACE LOESCHT die
        // getroffene Zeile, und ueber ON DELETE CASCADE gehen deren
        // test_day_tags lautlos mit. Getroffen wird nur, was
        // UNIQUE(item_id, day, user_id) verletzt -- also nur derselbe Tag
        // DESSELBEN Verfassers; zwei Bewerter am selben Tag bleiben zwei
        // Zeilen. Fallen zwei unbekannte Namen auf den Einspielenden,
        // fallen sie doch zusammen -- deshalb die Protokollzeile unten.
        const simple = db.prepare(`INSERT OR REPLACE INTO test_days (item_id, day, rating, user_id) VALUES (?, ?, ?, ?)`)
          .run(id, tag.day, Math.max(1, Math.min(5, Number(tag.rating) || 1)), verfasser(tag.author));
        // Aeltere Exportdateien haben hier kein Feld -- dann bleibt der
        // Testtag einfach ohne Tags.
        for (const name of Array.isArray(tag.tags) ? tag.tags : []) {
          const clean = String(name || '').trim();
          if (clean) db.prepare('INSERT OR IGNORE INTO test_day_tags (test_day_id, tag_id) VALUES (?, ?)')
            .run(simple.lastInsertRowid, tagByName(clean));
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
        const simple = db.prepare(`INSERT INTO comments (item_id, text, kind, pinned, created_at, updated_at, user_id)
                      VALUES (?, ?, ?, ?, COALESCE(?, datetime('now')), ?, ?)`)
            .run(id, c.text || '', kindValue(c.kind), c.pinned ? 1 : 0,
                 c.created_at || null, c.updated_at || null, verfasser(c.author));
        stats.comments++;
        (commentImages.get(c) || []).forEach((b2, i) =>
          db.prepare(`INSERT INTO comment_images (comment_id, filename, data, thumb, sort_order)
                      VALUES (?, ?, ?, ?, ?)`)
            .run(simple.lastInsertRowid, b2.name, b2.big, b2.small, i));
      }

      // Fortlaufend neu nummeriert: uebergangene Videos hinterlassen keine
      // Luecke in der Reihenfolge.
      photos.forEach((p, i) =>
        { db.prepare(`INSERT INTO photos (item_id, mime_type, data, thumb, medium, focus_x, focus_y, zoom, sort_order, art, dauer)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(id, p.mime, p.buf, p.thumb, p.medium, p.fx, p.fy, p.zoom, i, p.art, p.dauer);
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
                 a2.hatAutor ? verfasser(a2.autor) : itemAuthor); stats.attachments++; });
    }
  })();

  renumberCriteria();
  reclaim();

  /* Die laute Haelfte. Ein Name, den es nicht gibt, faellt an den
     Einspielenden -- die entworfene Regel und trotzdem der stillste denkbare
     Vorgang: beim Einspielen einer Mehrbenutzersicherung in eine frische
     Instanz zieht der gesamte Bestand wortlos um. Deshalb steht die Liste in
     der Antwort UND im Protokoll. Der Ausweg steht in der Zeile selbst: die
     fehlenden Zugaenge anlegen und noch einmal einspielen. */
  const unknown = [...unknownNames].sort();
  if (unknown.length)
    console.log(`[Kriterion] Import: unbekannte Verfasser dem Einspielenden zugeordnet ` +
                `(${unknown.length}): ${unknown.join(', ')}`);
  /* Dieselbe Bauform eine Zeile tiefer: ein Gewicht, das die Spanne
     verlaesst, bricht nichts ab und verschwindet auch nicht wortlos. Es
     steht in der Antwort UND im Protokoll -- die Antwort fuer den Pruefstand
     und die Abfrage von Hand, das Protokoll fuer den Betrieb. */
  const weightsDropped = [...gewichteVerworfen].sort();
  if (weightsDropped.length)
    console.log(`[Kriterion] Import: ungueltiges Gewicht auf 1,0 zurueckgesetzt ` +
                `(${weightsDropped.length}): ${weightsDropped.join(', ')}`);
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
  return { ok: true, mode: mode2, ...stats,
           verfasserZugeordnet: assigned, verfasserUnbekannt: unknown,
           gewichteVerworfen: weightsDropped, videosOhneDatei, videosUnlesbar, newIds };
}

/* Nur der Eigentuemer. EINE EXPORTDATEI KANN UNTER FREMDEM NAMEN SCHREIBEN:
   sie nennt zu jedem Beitrag einen Verfasser, und der Import ordnet ihn einem
   vorhandenen Zugang zu. Das Umschreiben fremder Beitraege ist dem Admin
   ausdruecklich verboten -- ueber einen offenen Import waere genau das fuer
   jeden moeglich.
   Der Waechter steht VOR multer: eine bis zu 900 MB grosse Datei eines
   Fremden soll gar nicht erst eingelesen werden.
   BEIDE MODI, nicht nur "ersetzen". */
/* DIE ZWEITE BESTAETIGUNG STEHT VOR multer, aus demselben Grund wie der
   Waechter darueber: eine bis zu 900 MB grosse Datei soll gar nicht erst
   eingelesen werden, wenn die Handlung ohnehin abgewiesen wird. Ein Passwort
   im Multipart-Rumpf waere erst DANACH lesbar -- das ist der Grund, warum die
   Bestaetigung eine eigene Route hat und nicht im Rumpf der Handlung reist. */
app.post('/api/import', ownerOnly, secondConfirmNeeded('import'),
         importUpload.single('file'), async (req, res, next) => {
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
    const { newIds, ...antwort } = await importInto(payload, req.benutzer.id, mode);
    auth.log('import', { wer: req.benutzer.id, merkmal: mode });
    res.json(antwort);
  } catch (e) {
    /* EINE ABSAGE AUS importInto() IST KEIN FEHLER DER INSTANZ, sondern eine
       Auskunft ueber die Datei -- sie geht als 400 mit Message hinaus und
       nicht als 500 durch das Auffangnetz. Sie faellt VOR der ersten
       Schreibung; der Bestand ist unveraendert. */
    if (e && e.absage) return res.status(400).json({ error: errorText(req, e) });
    next(e);
  }
});


/* ================= Der Papierkorb =================

   Beim Loeschen eines Eintrags wird er im vorhandenen Austauschformat
   serialisiert und als EINE Zeile abgelegt -- in DERSELBEN Transaktion wie
   das Loeschen. Danach laeuft die Kaskade wie bisher.

   KEINE BESTEHENDE ABFRAGE AENDERT SICH: items bekommt keine Spalte, kein
   WHERE einen Zusatz. Ein geloeschter Eintrag ist wirklich weg -- er liegt
   nur zusaetzlich als Paket daneben.

   ZWEI LOESCHWEGE FUELLEN IHN AUSDRUECKLICH NICHT: "Zugang entfernen" mit dem
   Haekchen "Eintraege mitnehmen" (das steckt in auth.js, und auth.js darf von
   der Abbildung in server.js nichts wissen) und der ERSETZENDE Import (er
   verdoppelte sonst die ganze bisherige Instanz in den Papierkorb). */

const TRASH_DAYS = 30;

const insTrash = db.prepare(
  'INSERT INTO papierkorb (titel, inhalt, geloescht_von) VALUES (?, ?, ?)');
const insTrashBytes = db.prepare(
  'INSERT INTO papierkorb_bytes (papierkorb_id, nr, daten) VALUES (?, ?, ?)');
const qTrashBytes = db.prepare(
  'SELECT daten FROM papierkorb_bytes WHERE papierkorb_id = ? AND nr = ?');
const delTrashOld = db.prepare(
  "DELETE FROM papierkorb WHERE geloescht_am < datetime('now', ?)");

/* ZWEI AUFRUFSTELLEN, beide noetig -- beim Start und beim Oeffnen der Karte.
   Eine Instanz, die drei Monate durchlaeuft, raeumte sonst drei Monate lang
   nicht auf.
   HINZUNEHMENDE FOLGE: damit schreibt eine LESENDE Route. Das ist
   Hauswirtschaft und keine Benutzerhandlung -- die Liste schreibender Routen
   bleibt unberuehrt. Die Bytes fallen ueber ON DELETE CASCADE mit. */
function cleanupTrash() {
  const n = delTrashOld.run(`-${TRASH_DAYS} days`).changes;
  if (n) console.log(`[Kriterion] Papierkorb: ${n} Zeile(n) aelter als ` +
    `${TRASH_DAYS} Tage entfernt.`);
  return n;
}
// Erste Aufrufstelle: der Start. Die zweite steht an GET /api/trash.
cleanupTrash();
// Und dasselbe fuer die abgelaufenen Token, nach derselben Bauform: erste
// Aufrufstelle hier, zweite an GET /api/users. Die Funktion steht in auth.js,
// weil dort auch alles andere zu den Token steht.
auth.cleanupTokens();
// Und dasselbe fuer das Sicherheitsprotokoll: erste Aufrufstelle hier, zweite
// an GET /api/security-log.
auth.cleanupLog();
/* Und die unbestaetigten Anfragen, . DREI Aufrufstellen statt
   zweier: hier, an GET /api/requests und -- das ist die besondere -- in
   legeAnfrageAn() selbst, vor der Deckelpruefung. Die dritte ist keine
   Hauswirtschaft, sondern Teil der Entscheidung: sonst blockierten zwanzig
   laengst verfallene Zeilen die Selbstanmeldung noch einen weiteren Tag. */
auth.cleanupRequests();

/* Der Weg hinein. EINE Transaktion, und das ist die Zusicherung der Runde:
   entweder liegt der Eintrag im Papierkorb UND ist geloescht, oder er steht
   unveraendert da. Ein halber Stand ist ausgeschlossen -- nachgestellt mit
   einem erzwungenen Fehlschlag.
   Gelesen wird IN der Transaktion: die Abbildung fragt zehn Tabellen ab, und
   zwischen dem Lesen und dem Loeschen darf sich nichts bewegen. */
function intoTrash(itemId, wer) {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  if (!it) return null;
  const collector = [];
  const situation = bundleState(wer, {
    // Ohne Schalter: der Papierkorb ist kein Export, sondern der Rueckweg.
    // Ein Rueckweg, der die Videos wegliesse, waere keiner.
    mitFotos: true, mitDateien: true, mitVideos: true, funnel: funnelStore(collector)
  });
  return db.transaction(() => {
    const umschlag = exportEnvelope([entryAsBundle(it, situation)]);
    const p = insTrash.run(it.title, JSON.stringify(umschlag), wer);
    collector.forEach((buf, nr) => insTrashBytes.run(p.lastInsertRowid, nr, buf));
    db.prepare('DELETE FROM items WHERE id = ?').run(it.id);
    return p.lastInsertRowid;
  })();
}

/* Die Liste. LESEND, deshalb kein Eintrag in F_ROUTEN -- der Waechter steht
   trotzdem davor.
   WARUM DER ADMIN SIE SEHEN DARF: er darf jeden Eintrag loeschen und sieht in
   der Uebersicht ohnehin jeden Titel. Der Papierkorb zeigt ihm nichts, was er
   vor dem Loeschen nicht schon sah.
   GEHANDELT WIRD TROTZDEM NUR VOM EIGENTUEMER: Wiederherstellen legt Zeilen
   unter FREMDEM Namen an -- das ist naeher am Import als am Loeschen, und der
   steht hinter ownerOnly. */
const qTrash = db.prepare(`SELECT p.id, p.titel, p.geloescht_am, p.geloescht_von,
    (SELECT COUNT(*) FROM papierkorb_bytes b WHERE b.papierkorb_id = p.id) AS dateien,
    length(p.inhalt) + COALESCE(
      (SELECT SUM(length(b.daten)) FROM papierkorb_bytes b WHERE b.papierkorb_id = p.id), 0) AS bytes
  FROM papierkorb p ORDER BY p.geloescht_am DESC, p.id DESC`);

app.get('/api/trash', adminOnly, (req, res) => {
  cleanupTrash();
  const card = authorCard();
  res.json({
    // Die Zahl steht in der Antwort und wird nicht aus der Liste gezaehlt: die
    // Karte nennt sie auch dann, wenn sie die Liste noch gar nicht gezeichnet
    // hat.
    tage: TRASH_DAYS,
    zeilen: qTrash.all().map(z => ({
      id: z.id, titel: z.titel, geloescht_am: z.geloescht_am,
      // Wer geloescht hat, in derselben Form wie jeder Verfasser -- damit die
      // Oberflaeche denselben einen Weg von der Nummer zum Namen geht und ein
      // Grabstein "Gelöschter Benutzer 7" heisst.
      loeschender: authorFrom(card, z.geloescht_von),
      dateien: z.dateien, bytes: z.bytes,
      // Die Frist rechnet der Server: die Zahl TRASH_DAYS steht an einer
      // Stelle, und die Oberflaeche baut sie nicht nach.
      tageOffen: Math.max(0, TRASH_DAYS - Math.floor(
        (Date.now() - Date.parse(z.geloescht_am.replace(' ', 'T') + 'Z')) / 86400000))
    }))
  });
});

/* Wiederherstellen. Es legt einen NEUEN Eintrag an und stellt nicht den
   alten zurueck -- die alte Nummer ist weg, und daran haengt nichts mehr.
   Genau das kann der Import schon, deshalb geht der Weg durch ihn.
   WAS AUS DEN VERFASSERN WIRD, steht damit fest und wird hier nicht neu
   erfunden -- auch ein GRABSTEIN wird gefunden, solange seine Zeile steht.
   WAS NICHT ZURUECKKOMMT und benannt gehoert: die Favoriten ANDERER (favorite
   heisst "habe ICH markiert") und der Eingriffsvermerk am Kommentar -- beides
   steht in keiner Exportdatei, und der Papierkorb ist eine. */
app.post('/api/trash/:id/restore', ownerOnly, async (req, res, next) => {
  try {
    const z = db.prepare('SELECT * FROM papierkorb WHERE id = ?').get(req.params.id);
    if (!z) return res.status(404).json({ error: t(localeOf(req), 'server.trashGone')});
    let umschlag;
    try { umschlag = JSON.parse(z.inhalt); }
    catch { return res.status(500).json({ error: t(localeOf(req), 'server.trashUnreadable')}); }
    // Die Bytes kommen aus der Nebentabelle, Zeile fuer Zeile -- nie alle
    // zugleich in einem String. Fehlt eine Nummer, wird die Zeile uebergangen
    // und genannt, wie bei einem Video ohne Datei.
    const quelle = (nr) => {
      const b = qTrashBytes.get(z.id, nr);
      return b ? b.daten : null;
    };
    const ergebnis = await importInto(umschlag, req.benutzer.id, 'merge', quelle);
    // Erst nach dem Einspielen: scheitert es, bleibt die Zeile liegen.
    db.prepare('DELETE FROM papierkorb WHERE id = ?').run(z.id);
    reclaim();
    res.json({ ...ergebnis, itemId: ergebnis.newIds[0] ?? null, titel: z.titel });
  } catch (e) {
    /* DERSELBE WEG WIE AM IMPORT. Er kann hier nur greifen, wenn ein Kriterium
       nach dem Loeschen des Eintrags geloescht und im anderen Kasten neu
       angelegt wurde -- selten, aber genau dann soll die Zeile liegen bleiben
       und der Grund dastehen, statt eines 500. */
    if (e && e.absage) return res.status(400).json({ error: errorText(req, e) });
    next(e);
  }
});

// Endgueltig entfernen. Dieselbe Rechtezeile wie das Wiederherstellen: wer
// einen Rueckweg nehmen darf, darf ihn auch schliessen. Die Bytes fallen ueber
// ON DELETE CASCADE mit.
app.delete('/api/trash/:id', ownerOnly, (req, res) => {
  const n = db.prepare('DELETE FROM papierkorb WHERE id = ?').run(req.params.id).changes;
  if (!n) return res.status(404).json({ error: t(localeOf(req), 'server.trashGone')});
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
     die WURZEL kommt aus der Umgebung (BACKUP_DIR) und ist ueber die
       Oberflaeche nicht zu erreichen. KEIN Vorgabewert: ein Pfad, den es nur
       im Container gibt, verschwaende beim naechsten Bau -- er muss eingehaengt
       sein, und wer ihn einhaengt, benennt ihn auch.
     der ORT ist ein Unterverzeichnis darunter, und mehr nicht.
   Geprueft wird gegen eine POSITIVLISTE und danach am AUFGELOESTEN Pfad, nicht
   am String: ein Symlink, der aus der Wurzel herausfuehrt, faellt erst dort
   auf. Ein Verzeichnis, das es nicht gibt, ist eine Absage mit Begruendung --
   kein stilles Anlegen. */

const BACKUP_DIR = String(auth.fromEnv('BACKUP_DIR', 'SICHERUNG_DIR') || '').trim();
// Gemessen an einer verschluesselten Instanz: rund 10 ms je MB. Verdoppelt,
// weil der Betrieb auf einem N100 laeuft und eine zu niedrige Ansage
// schlimmer ist als eine zu hohe.
const BACKUP_MS_PER_MB = 20;
const BACKUP_PATTERN = /^kriterion-.+\.sqlite$/;
/* --- Die Aufraeumregel: ZWEI BEDINGUNGEN, und beide muessen zutreffen ---
   Geloescht wird eine Kopie nur, wenn sie BEIDES ist: nicht unter den N
   juengsten UND aelter als X Tage.

   WARUM BEIDE UND NICHT EINE -- jede einzelne ist ausgerechnet in der Lage
   falsch, in der sie gebraucht wird (Stolperstein 299):
     nur "aelter als X Tage" -- eine Installation, an der ein halbes Jahr nicht
       gesichert wurde, verliert ALLE Kopien auf einen Schlag, genau dann, wenn
       sie die einzigen sind.
     nur "die letzten N"     -- wer an einem Nachmittag viermal auf den Knopf
       drueckt, wirft die Kopie vom Vormonat weg, obwohl nichts alt ist.
   DIE ZAHL IST DER BODEN, DAS ALTER IST DIE SCHERE.

   DIE GRENZEN STEHEN HIER UND NICHT NUR IM EINGABEFELD: `min`/`max` im HTML
   ist eine Bitte, keine Klemme. Ein Feld, in das jemand 0 schreiben kann, ist
   eine Falle -- ein Boden von 0 hiesse "alles darf fallen".
   VORGABE DES SCHALTERS IST AUS, und das ist die Abweichung von
   `bilderUmwandeln`: eine umgewandelte PNG-Datei holt der Knopf in der
   Gegenrichtung zurueck, eine geloeschte Sicherung holt nichts zurueck. Was
   nicht umkehrbar ist, wird nicht stillschweigend eingeschaltet. */
const CLEANUP_KEEP = { vorgabe: 3, min: 1, max: 20 };
const CLEANUP_DAYS = { vorgabe: 30, min: 7, max: 365 };
const DAY_MS = 86400000;
// Positivliste statt Liste des Verbotenen: JEDES Segment faengt mit einem
// Buchstaben oder einer Ziffer an. Damit sind '..', '.', ein fuehrender
// Schraegstrich, ein Laufwerksbuchstabe und ein Gegenschraegstrich gar nicht
// erst schreibbar -- nicht verboten, sondern nicht ausdrueckbar.
const PLACE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._-]*(\/[A-Za-z0-9][A-Za-z0-9 ._-]*)*$/;

/* Liegt der eine Pfad im anderen? Gefragt wird an AUFGELOESTEN Pfaden --
   ein Vergleich zweier Strings beantwortet die Frage nicht, sobald ein
   Symlink im Spiel ist. */
const liesIn = (inside, outside) => inside === outside || inside.startsWith(outside + path.sep);

/* Das Anwendungsverzeichnis -- der Ort, an dem diese Datei liegt. Es
   beantwortet die eine Frage, die die Karte rot oder gruen macht: liegt der
   Sicherungsort NEBEN der Anwendung oder ausserhalb?

   EINE SICHERUNG IM ARBEITSVERZEICHNIS IST DIE BEQUEME, NICHT DIE SICHERE
   LAGE -- sie ueberlebt kein Umbenennen und liegt auf derselben Platte wie
   das Original. Sie ist trotzdem erlaubt; der Betreiber soll nur nicht
   glauben, sie sei am richtigen Ort.

   DIE AUSSAGE TRAEGT NUR, WEIL DIE EINHAENGUNG DIE LAGE SPIEGELT: der Prozess
   sieht den Wirt nicht, er liest seinen eigenen Pfad. Was unter ./ eingehaengt
   wird, gehoert unter das Anwendungsverzeichnis -- so steht es in der
   docker-compose.yml. Aufgeloest wie jeder Pfad hier, wegen der Symlinks. */
const APP_DIR = (() => {
  try { return fs.realpathSync(__dirname); } catch { return path.resolve(__dirname); }
})();

/* Die Lage wird bei JEDER Anfrage gelesen und nicht beim Start festgehalten:
   wer das Verzeichnis nachtraeglich einhaengt, soll es nicht mit einem
   Neustart bezahlen. Beim Start wird sie einmal ins Protokoll geschrieben. */
function backupState() {
  /* DER GRUND IST SEIT 0.24.0 EIN SCHLUESSEL UND KEIN SATZ (Bauabschnitt 2).
     Er reist mit seinen Werten -- wer ihn zeigt, uebersetzt ihn dort, wo die
     Anfrage in der Hand liegt. */
  if (!BACKUP_DIR)
    return { ein: false, grund: 'server.backupDirNotSet', values: {} };
  let wurzel;
  try { wurzel = fs.realpathSync(BACKUP_DIR); }
  catch { return { ein: false, grund: 'server.backupDirGone', values: { ordner: BACKUP_DIR } }; }
  try { if (!fs.statSync(wurzel).isDirectory())
    return { ein: false, grund: 'server.backupDirNotDir', values: { ordner: BACKUP_DIR } }; }
  catch { return { ein: false, grund: 'server.backupDirUnreadable', values: { ordner: BACKUP_DIR } }; }
  let data;
  try { data = fs.realpathSync(DATA_DIR); } catch { data = path.resolve(DATA_DIR); }
  // EINE SICHERUNG NEBEN DEM ORIGINAL IST KEINE. Beide Richtungen, denn beide
  // sind falsch: der Sicherungsort im Datenverzeichnis und umgekehrt.
  if (liesIn(wurzel, data) || liesIn(data, wurzel))
    return { ein: false, grund: 'server.backupInDataDir', values: {} };
  return { ein: true, wurzel, imArbeitsverzeichnis: liesIn(wurzel, APP_DIR) };
}

/* Der eingestellte Ort, geprueft. Liefert entweder { ort, pfad } oder
   { fehler } -- und der Fehler ist eine sprechende Begruendung, kein
   "ungueltig". */
function checkPlace(roh) {
  const situation = backupState();
  if (!situation.ein) return { fehler: situation.grund, values: situation.values };
  const s = String(roh == null ? '' : roh).trim();
  if (!s) return { ort: '', pfad: situation.wurzel };
  if (s.length > 200) return { fehler: 'server.subDirTooLong', values: { deckel: 200 } };
  if (!PLACE_PATTERN.test(s))
    return { fehler: 'server.subDirForm', values: {} };
  let real;
  try { real = fs.realpathSync(path.resolve(situation.wurzel, s)); }
  catch { return { fehler: 'server.subDirGone', values: { ordner: s } }; }
  try { if (!fs.statSync(real).isDirectory())
    return { fehler: 'server.subDirNotDir', values: { ordner: s } }; }
  catch { return { fehler: 'server.subDirUnreadable', values: { ordner: s } }; }
  // DIE PRUEFUNG HAENGT AM AUFGELOESTEN PFAD. Erst hier faellt ein Symlink
  // auf, der aus der Wurzel herausfuehrt -- am String saehe er harmlos aus.
  if (!liesIn(real, situation.wurzel))
    return { fehler: 'server.subDirOutside', values: { ordner: s } };
  let data;
  try { data = fs.realpathSync(DATA_DIR); } catch { data = path.resolve(DATA_DIR); }
  if (liesIn(real, data))
    return { fehler: 'server.backupInDataDir', values: {} };
  return { ort: s, pfad: real };
}

/* "Letzte Sicherung vor N Tagen" kommt aus dem DATEISYSTEM, nicht aus einem
   Schluessel in settings. Ein Schluessel waere eine BEHAUPTUNG ueber die
   Datei, das Dateisystem ist die Sache -- dieselbe Frage wie beim Merker
   gegen den Index in 0.6.2, und dort ist sie zugunsten der Sache entschieden
   worden. Der Preis steht daneben: ein unerreichbarer Zielort liefert keine
   Auskunft, und dann sagt die Karte GENAU DAS statt einer Zahl. */
/* ZWEI SCHLUESSEL IM UMLAUF -- die unangenehmste Falle des ganzen Projekts.
   Wird der Schluessel der Datenbank gewechselt (keytool.js auf dem Wirt),
   bleiben die vorhandenen Sicherungen mit dem ALTEN verschluesselt. Sie sind
   nicht kaputt -- sie brauchen nur einen anderen Schluessel, und wer das
   nicht weiss, haelt sie im Ernstfall fuer defekt.

   Die Marke kommt aus settings und ist HIER richtig, waehrend "letzte
   Sicherung" aus dem Dateisystem kommt: der Zeitpunkt des Wechsels ist ein
   VORGANG und hinterlaesst keine Datei.

   VERGLICHEN WIRD IN UTC -- ohne das Z lese der Rechner die Marke als
   Ortszeit, und die Grenze verschoebe sich um den Zeitzonenabstand. */
function changeMark() {
  const roh = getSetting('schluesselGewechseltAm', null);
  if (!roh) return null;
  const ms = Date.parse(String(roh).replace(' ', 'T') + 'Z');
  return Number.isFinite(ms) ? { am: roh, ms } : null;
}

/* DIE LISTE DER KOPIEN AM ORT -- EINMAL AUFGEBAUT UND VON DREIEN GENUTZT.
   Bis 0.19.6 stand sie mitten in lastBackup(), wurde dort ausgewertet und
   wieder weggeworfen. Seit 0.20.0 brauchen die Vorschau und das Loeschen genau
   dieselbe Liste; ein zweiter Aufbau daneben waere eine zweite Wahrheit
   darueber, was am Ort liegt (Stolperstein 47).

   DREI KLEMMEN, UND JEDE HAELT EINE ANDERE FRAGE:
     BACKUP_PATTERN  -- nur, was `kriterion-<...>.sqlite` heisst. Eine fremde
                          Datei im Ordner ist keine Sicherung. Angefangene
                          Kopien (`*.wird`) fallen ohnehin heraus.
     kein readdir in die Tiefe -- ein Unterverzeichnis wird nicht betreten.
     lstatSync + isFile()      -- EIN SYMLINK IST KEINE SICHERUNG. Mit statSync
                          folgte die Frage dem Verweis und meldete die Datei am
                          anderen Ende als regulaer; lstatSync sieht den Verweis
                          selbst, und der ist keine regulaere Datei.
   SORTIERT WIRD JUENGSTE ZUERST -- der Boden der Regel zaehlt von vorn.
   DAS ALTER KOMMT AUS `mtimeMs` UND NICHT AUS DEM DATEINAMEN: der Name traegt
   zwar eine Zeitmarke, aber er ist von aussen gestaltbar; die Angabe des
   Dateisystems ist es nicht. */
function backupList(pfad) {
  let namen;
  try { namen = fs.readdirSync(pfad); }
  catch { return null; }
  const dateien = [];
  for (const n of namen) {
    if (!BACKUP_PATTERN.test(n)) continue;
    try {
      const st = fs.lstatSync(path.join(pfad, n));
      if (st.isFile()) dateien.push({ name: n, zeit: st.mtimeMs, bytes: st.size });
    } catch { /* eine Datei, die zwischen readdir und stat verschwindet */ }
  }
  dateien.sort((a, b) => b.zeit - a.zeit);
  return dateien;
}

function lastBackup(pfad) {
  const mark = changeMark();
  const gewechseltAm = mark ? mark.am : null;
  const dateien = backupList(pfad);
  if (dateien === null)
    return { erreichbar: false, letzte: null, zahl: 0, gewechseltAm, veraltet: 0 };
  // Ohne Wechsel ist KEINE Kopie veraltet -- und nicht etwa jede. Der
  // Unterschied zwischen "es gab keinen Wechsel" und "alle sind veraltet" ist
  // genau der, den diese Zeile haelt.
  const veraltet = mark ? dateien.filter(d => d.zeit < mark.ms).length : 0;
  if (!dateien.length)
    return { erreichbar: true, letzte: null, zahl: 0, gewechseltAm, veraltet: 0 };
  const j = dateien[0];
  return { erreichbar: true, zahl: dateien.length, gewechseltAm, veraltet, letzte: {
    datei: j.name, bytes: j.bytes,
    // Dieselbe Schreibweise wie jeder Zeitstempel der Instanz
    // ("2026-08-23 19:56:01", UTC): die Oberflaeche hat genau einen Weg, aus
    // einem Zeitstempel ein Datum zu machen, und der erwartet diese Form.
    am: new Date(j.zeit).toISOString().slice(0, 19).replace('T', ' '),
    tageHer: Math.max(0, Math.floor((Date.now() - j.zeit) / 86400000)),
    // Auch die JUENGSTE Kopie kann aelter sein als der Wechsel -- dann ist
    // ueberhaupt keine brauchbare da, und das ist die schaerfste Lage.
    veraltet: Boolean(mark && j.zeit < mark.ms)
  } };
}

/* ================= Alte Sicherungen aufraeumen -- 0.20.0 =================

   DIE REGEL STEHT AN GENAU EINER STELLE, und sie ist eine REINE FUNKTION: sie
   bekommt eine Dateiliste und die beiden Werte und liefert die zu loeschenden
   Namen. Die Vorschau und das Loeschen rufen dieselbe -- zwei Fassungen waeren
   zwei Wahrheiten darueber, was gleich passiert (Stolperstein 47), und die
   Vorschau verloere genau das, wofuer es sie gibt.

   SIE BERUEHRT WEDER DAS DATEISYSTEM NOCH DIE UHR: `now` und `changeMs`
   kommen als Argument herein. Nur so ist sie an einer TAFEL zu pruefen statt
   an einem Ordner -- und eine Pruefung, die auf echte dreissig Tage wartet,
   gibt es nicht.

   DER BODEN ZAEHLT NUR DIE KOPIEN NACH DEM SCHLUESSELWECHSEL (Entscheidung 5).
   Drei Kopien, von denen zwei vor dem Wechsel entstanden sind, sind in
   Wahrheit eine; bei dieser Lage faellt dann gar nichts, und das ist die
   sichere Seite. Die Kopien von VOR dem Wechsel fasst die Regel ueberhaupt
   nicht an -- sie sind nicht entbehrlich, sondern etwas anderes, und fuer sie
   gibt es den zweiten, ausdruecklichen Weg.
   OHNE WECHSEL ZAEHLEN ALLE: `changeMs` ist dann null, und die Filterzeile
   laesst jede Kopie durch. Der Unterschied zwischen "es gab keinen Wechsel"
   und "alle sind veraltet" ist derselbe wie in lastBackup() darueber. */
function ruleHit(dateien, behalten, tage, now, changeMs) {
  const usable = dateien
    .filter(d => changeMs == null || d.zeit >= changeMs)
    .sort((a, b) => b.zeit - a.zeit);
  const grenze = now - tage * DAY_MS;
  //          der Boden                    die Schere
  return usable.slice(behalten).filter(d => d.zeit < grenze);
}

/* Die beiden Werte, geprueft. EINE Stelle fuer beide Wege -- den Schreibweg
   ueber PUT /api/settings und den Leseweg der Regel: stuende die Spanne an
   zwei Orten, liefe sie auseinander.
   `null`, `"drei"` UND EIN BRUCH WERDEN ABGEWIESEN und nicht stillschweigend
   gerundet: eine Zahl, die der Server anders liest, als sie eingetippt wurde,
   ist schlimmer als eine Absage. */
/* `schluessel` UND NICHT MEHR DER NAME DER REGEL -- 0.24.0, Bauabschnitt 2.
   Bis dahin reichte der Rufer das deutsche Wort „Immer behalten" herein, und
   der Satz wurde hier zusammengesetzt. Ein Satz aus Stuecken laesst sich nicht
   uebersetzen (Konzept, Abschnitt 0, Satz 2): auf Englisch stuende das Wort
   woanders. Jetzt bringt der Rufer den SCHLUESSEL des ganzen Satzes mit, und
   die Spanne reist als Werte. */
function checkRuleValue(roh, range, schluessel) {
  const n = Number(roh);
  if (!Number.isInteger(n) || n < range.min || n > range.max)
    return { fehler: schluessel, values: { min: range.min, max: range.max } };
  return { wert: n };
}

/* Der eingestellte Stand der Regel. ABGELEITET BEIM LESEN, ohne
   Migrationscode: was nicht in settings steht, gilt als Vorgabe -- und der
   Schalter gilt als AUS.
   GEPRUEFT AUCH BEIM LESEN: ein von Hand in die Tabelle geschriebener Wert
   ausserhalb der Grenzen faellt hier auf die Vorgabe zurueck und weitet die
   Regel nicht. Die Klemme steht an der Stelle, an der der Fehler wehtut. */
function cleanupStatus() {
  const b = checkRuleValue(getSetting('sicherungBehalten', CLEANUP_KEEP.vorgabe),
                            CLEANUP_KEEP, 'server.ruleKeep');
  const rule = checkRuleValue(getSetting('sicherungTage', CLEANUP_DAYS.vorgabe),
                            CLEANUP_DAYS, 'server.ruleDays');
  return {
    an: getSetting('sicherungAufraeumen', false) === true,
    behalten: b.fehler ? CLEANUP_KEEP.vorgabe : b.wert,
    tage: rule.fehler ? CLEANUP_DAYS.vorgabe : rule.wert
  };
}

/* Eine Zeile der Vorschau: dieselbe Schreibweise wie jeder Zeitstempel der
   Instanz, damit die Oberflaeche genau einen Weg hat, daraus ein Datum zu
   machen. */
const cleanupRow = (d, now) => ({
  datei: d.name, bytes: d.bytes,
  am: new Date(d.zeit).toISOString().slice(0, 19).replace('T', ' '),
  tageHer: Math.max(0, Math.floor((now - d.zeit) / DAY_MS))
});

/* DIE VORSCHAU -- sie steht immer da, auch wenn der Schalter aus ist: sie ist
   die Auskunft darueber, was die Regel bei den eingestellten Werten bedeutet.
   OHNE VORSCHAU IST ES EINE WETTE, und sie ist der Ersatz fuer den
   Papierkorb, den es hier ausdruecklich nicht gibt (Entscheidung 2).

   TRIFFT DIE REGEL NICHTS, STEHT DER GRUND DANEBEN -- eine leere Liste ohne
   Erklaerung sieht aus wie ein Fehler. Der Grund ist ein halber Satz und
   nennt die Zahl, um die es geht.
   DIE KOPIEN VON VOR DEM WECHSEL STEHEN GETRENNT, mit eigener Zahl und
   Summe: sie sind nicht entbehrlich, sondern etwas anderes. */
function cleanupPreview(pfad, behalten, tage) {
  const dateien = backupList(pfad);
  if (dateien === null) return { erreichbar: false, dateien: [], treffer: [], bytes: 0, grund: '' };
  const mark = changeMark();
  const now = Date.now();
  const alt = mark ? dateien.filter(d => d.zeit < mark.ms) : [];
  const usable = mark ? dateien.filter(d => d.zeit >= mark.ms) : dateien;
  const treffer = ruleHit(dateien, behalten, tage, now, mark ? mark.ms : null);
  let grund = '';
  if (!treffer.length) {
    if (!dateien.length) grund = 'Hier gibt es noch keine Sicherung.';
    else if (!usable.length)
      grund = `Keine der ${dateien.length} ${dateien.length === 1 ? 'Sicherung' : 'Sicherungen'} ` +
              'stammt von nach dem Schlüsselwechsel.';
    else if (usable.length <= behalten)
      grund = `Alle ${usable.length} ${usable.length === 1 ? 'Sicherung' : 'Sicherungen'} ` +
              `sind unter den jüngsten ${behalten}.`;
    else {
      // Die AELTESTE der Kopien, die der Boden nicht mehr deckt -- sie ist die,
      // die als naechste faellt, und ihr Alter ist die Auskunft, auf die es
      // ankommt.
      const next2 = usable[usable.length - 1];
      const from2 = Math.max(0, Math.floor((now - next2.zeit) / DAY_MS));
      grund = `Die älteste ist ${from2} ${from2 === 1 ? 'Tag' : 'Tage'} alt.`;
    }
  }
  /* DIE VOLLSTAENDIGE LISTE, JUENGSTE ZUERST UND NUMMERIERT. Sie ist die
     Auskunft, die es bis 0.20.0 nirgends gab: die Karte "Sicherung" nannte die
     juengste Kopie und die ZAHL der Dateien am Ort, mehr nicht.
     DIE NUMMER LAEUFT VON DER JUENGSTEN (1) ZUR AELTESTEN -- so, wie der Boden
     der Regel zaehlt. Damit liest sich "mindestens 3 behalten" unmittelbar an
     der Liste ab: was faellt, steht ab Nummer 4.
     JE ZEILE ZWEI MARKEN, und sie sagen Verschiedenes:
       faellt   -- die Regel wuerde sie bei den EINGESTELLTEN Werten entfernen.
       veraltet -- sie stammt von vor dem Schluesselwechsel. Die Regel fasst sie
                   nicht an; wegraeumen lassen sie sich nur ausdruecklich.
     BEIDE KOENNEN NICHT ZUGLEICH GELTEN -- ruleHit() laesst die veralteten
     gar nicht erst durch. Die Karte darf sich darauf verlassen, und der
     Pruefstand haelt es fest. */
  const hitNames = new Set(treffer.map(d => d.name));
  const oldMs = mark ? mark.ms : null;
  return {
    erreichbar: true,
    dateien: dateien.map((d, i) => ({
      ...cleanupRow(d, now), nr: i + 1,
      faellt: hitNames.has(d.name),
      veraltet: oldMs != null && d.zeit < oldMs
    })),
    treffer: treffer.map(d => cleanupRow(d, now)),
    bytes: treffer.reduce((n, d) => n + d.bytes, 0),
    grund,
    altZahl: alt.length,
    altBytes: alt.reduce((n, d) => n + d.bytes, 0),
    altDateien: alt.map(d => cleanupRow(d, now))
  };
}

/* DAS LOESCHEN. Es bekommt den GEPRUEFTEN Ordner und die Liste der Namen, die
   die Regel eben genannt hat -- und haelt jeden Namen unmittelbar davor noch
   einmal gegen BACKUP_PATTERN und gegen `basename`. Zwei Pruefungen
   desselben Namens sind hier keine Verdopplung, sondern die Klemme an der
   Stelle, an der der Fehler wehtut: wer diese Funktion je von einer anderen
   Aufrufstelle her ruft, kommt an ihr nicht vorbei.

   WAS `unlink` NICHT SCHAFFT, HAELT DEN REST NICHT AUF. Eine Datei, die
   zwischen Auflisten und Loeschen verschwindet oder sich sperrt, wird gezaehlt
   und gemeldet -- die Antwort sagt "4 entfernt, 1 nicht", und der Grund steht
   im Protokoll des Containers, nicht in der Antwort (fester Text wie ueberall
   bei einem Fehler des Servers). */
/* EINE ZEILE JE ENTFERNTER KOPIE, und das ist eine Entscheidung.
   Die Zahl der entfernten Kopien GEHOERT ins Sicherheitsprotokoll -- eine
   Spalte dafuer gibt es aber nicht: `wer` und `ziel` sind Benutzernummern mit
   Fremdschluessel, `merkmal` ist eine geschlossene Liste ohne Ziffern
   (MERKMALE bleibt bei vierzehn), und Freitext gibt es in dieser Tabelle
   ausdruecklich nicht. Eine neue Spalte waere ein Schemaschritt, und diese
   Runde ist ausdruecklich keiner.
   DAMIT IST DIE ZAHL DIE ZEILENZAHL: vier entfernte Kopien sind vier Zeilen.
   Das ist keine Notloesung, sondern dieselbe Aussage in der Form, die die
   Tabelle traegt -- und die einzige, die sich hinterher wirklich zaehlen
   laesst.
   DIE FREIGEGEBENEN BYTES STEHEN NICHT DARIN, sondern in der Antwort und in
   der Zeile im Containerprotokoll. */
const logRemoved = (wer, zahl) => {
  for (let i = 0; i < zahl; i++) auth.log('sicherung.weg', { wer });
};

function removeBackups(ordner, namen) {
  let weg = 0, bytes = 0;
  const geblieben = [];
  for (const n of namen) {
    const short = path.basename(String(n));
    if (short !== String(n) || !BACKUP_PATTERN.test(short)) { geblieben.push(short); continue; }
    const full = path.join(ordner, short);
    try {
      const st = fs.lstatSync(full);
      if (!st.isFile()) { geblieben.push(short); continue; }
      fs.unlinkSync(full);
      weg++; bytes += st.size;
    } catch (e) {
      geblieben.push(short);
      console.error(`[Kriterion] Sicherung ${short} nicht entfernt: ${e.message}`);
    }
  }
  return { weg, bytes, geblieben };
}

// Lesend, deshalb kein Eintrag in F_ROUTEN -- der Waechter steht trotzdem
// davor, und zwar der des Exports: die Antwort nennt einen Pfad des Wirts.
app.get('/api/backup', ownerOnly, (req, res) => {
  const situation = backupState();
  const ort = getSetting('sicherungOrt', '');
  let dbBytes = 0;
  // MIT wal_checkpoint, wie bei den Kennzahlen: ohne ihn steht der frisch
  // geschriebene Bestand noch in der WAL, die Datei sieht winzig aus, und die
  // Ansage der Dauer waere zu niedrig. Stolperstein 4 in der Gegenrichtung.
  try { db.pragma('wal_checkpoint(PASSIVE)'); dbBytes = fs.statSync(DB_FILE).size; } catch {}
  // Die erwartete Dauer wird aus der Groesse gerechnet und VORHER genannt:
  // waehrend VACUUM INTO laeuft, steht die Instanz.
  const dauer = Math.max(1, Math.round(dbBytes / 1048576 * BACKUP_MS_PER_MB / 1000));
  /* Die Marke steht auch dann in der Antwort, wenn der Zielort nicht erreichbar
     ist: DASS gewechselt wurde, ist eine Aussage ueber die Instanz und haengt
     nicht am Sicherungsort. Nur die ZAHL der veralteten Kopien haengt daran,
     und die ist dann ehrlich null statt geraten. */
  const mark = changeMark();
  const gewechseltAm = mark ? mark.am : null;
  /* DIE VORSCHAU RECHNET MIT DEN WERTEN AUS DER ABFRAGE, WENN WELCHE
     DASTEHEN, und sonst mit den eingestellten. So rechnet jede Aenderung an
     einem der beiden Felder die Vorschau neu, OHNE dass etwas gespeichert oder
     geloescht wird -- wer die Zahl von 3 auf 1 stellt, sieht sofort, was das
     kostet.
     GEPRUEFT WIRD AUCH HIER, und zwar mit derselben Funktion wie auf dem
     Schreibweg: eine Vorschau, die 0 anstandslos rechnet, sagte etwas ueber
     eine Regel, die es nicht gibt.
     LESEND BLEIBT LESEND -- diese Route schreibt nichts, auch die Werte aus
     der Abfrage nicht. */
  const status2 = cleanupStatus();
  let behalten = status2.behalten, tage = status2.tage;
  if (req.query.behalten !== undefined) {
    const g = checkRuleValue(req.query.behalten, CLEANUP_KEEP, 'server.ruleKeep');
    if (g.fehler) return res.status(400).json({ error: t(localeOf(req), g.fehler, g.values) });
    behalten = g.wert;
  }
  if (req.query.tage !== undefined) {
    const g = checkRuleValue(req.query.tage, CLEANUP_DAYS, 'server.ruleDays');
    if (g.fehler) return res.status(400).json({ error: t(localeOf(req), g.fehler, g.values) });
    tage = g.wert;
  }
  /* DIE GRENZEN GEHEN MIT HINAUS. Die Karte schreibt sie an ihre beiden
     Felder, statt sie ein zweites Mal zu kennen -- eine Zahl, die an zwei
     Orten steht, laeuft auseinander (Stolperstein 137). */
  const rule = { ...status2, behalten, tage,
                  grenzen: { behalten: CLEANUP_KEEP, tage: CLEANUP_DAYS } };
  /* UEBERSETZT WIRD HIER -- 0.24.0. backupState() und checkPlace() liefern
     seit dieser Runde einen Schluessel samt Werten; welche Sprache die Antwort
     traegt, weiss erst die Route. */
  if (!situation.ein) return res.json({ eingerichtet: false,
                                   grund: t(localeOf(req), situation.grund, situation.values), ort,
                                   dbBytes, dauerSekunden: dauer, erreichbar: false, letzte: null,
                                   gewechseltAm, veraltet: 0, aufraeumen: rule });
  const ziel = checkPlace(ort);
  if (ziel.fehler) return res.json({ eingerichtet: true, wurzel: situation.wurzel, ort,
                                     imArbeitsverzeichnis: situation.imArbeitsverzeichnis,
                                     fehler: t(localeOf(req), ziel.fehler, ziel.values),
                                     dbBytes, dauerSekunden: dauer,
                                     erreichbar: false, letzte: null,
                                     gewechseltAm, veraltet: 0, aufraeumen: rule });
  // Die Lage der WURZEL, nicht die des gewaehlten Unterverzeichnisses: sie ist
  // eine Eigenschaft der Einrichtung und aendert sich mit dem Zielort nicht.
  res.json({ eingerichtet: true, wurzel: situation.wurzel, ort, pfad: ziel.pfad,
             imArbeitsverzeichnis: situation.imArbeitsverzeichnis,
             dbBytes, dauerSekunden: dauer, ...lastBackup(ziel.pfad),
             aufraeumen: { ...rule, ...cleanupPreview(ziel.pfad, behalten, tage) } });
});

/* Der Ort ist eine Einstellung der INSTANZ und gehoert damit in settings, nicht
   in user_settings: zwei Leute mit verschiedenen Orten haetten zwei Wahrheiten
   ueber dieselbe Sache.
   EIGENE ROUTE statt PUT /api/settings: die leitet ihre Rechte aus
   PERSONAL_KEYS ab -- was nicht persoenlich ist, ist dort Adminsache.
   Der Sicherungsort gehoert aber in dieselbe Zeile wie Export und Import. */
app.put('/api/backup/dir', ownerOnly, (req, res) => {
  const geprueft = checkPlace(req.body?.ort);
  if (geprueft.fehler) return res.status(400).json({ error: t(localeOf(req), geprueft.fehler, geprueft.values) });
  putSetting.run('sicherungOrt', JSON.stringify(geprueft.ort));
  res.json({ ok: true, ort: geprueft.ort, pfad: geprueft.pfad, ...lastBackup(geprueft.pfad) });
});

app.post('/api/backup', ownerOnly, (req, res) => {
  const situation = backupState();
  if (!situation.ein) return res.status(400).json({ error: t(localeOf(req), situation.grund, situation.values) });
  const ziel = checkPlace(getSetting('sicherungOrt', ''));
  if (ziel.fehler) return res.status(400).json({ error: t(localeOf(req), ziel.fehler, ziel.values) });
  /* NAME MIT DATUM UND UHRZEIT. Ueberschreiben waere die schlechteste Antwort:
     eine Sicherung, die die vorige frisst, ist keine. VACUUM INTO scheitert an
     einer vorhandenen Zieldatei ohnehin ("output file already exists") --
     nachgestellt statt geglaubt --, aber darauf verlaesst sich der Name nicht. */
  const mark = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const datei = path.join(ziel.pfad, `kriterion-${mark}.sqlite`);
  if (fs.existsSync(datei))
    return res.status(409).json({ error: t(localeOf(req), 'server.backupConcurrent')});
  /* GESCHRIEBEN WIRD UNTER EINEM ARBEITSNAMEN, umbenannt wird erst danach.
     Stolperstein 8 verlangt, eine halbfertige Zieldatei nach einem Fehlschlag
     zu entfernen -- das hier ist eine Stufe schaerfer: der Fall entsteht gar
     nicht. Eine halbfertige Kopie traegt NIE den endgueltigen Namen, faellt
     damit aus BACKUP_PATTERN heraus und kann selbst dann nicht als fertige
     Sicherung gelesen werden, wenn das Aufraeumen darunter scheitert.
     ENTFERNT WIRD AUSSCHLIESSLICH DER ARBEITSNAME. Eine vorhandene fremde
     Datei fasst dieser Weg unter keinen Umstaenden an -- ein Aufraeumen, das
     die Datei des Nachbarn wegwirft, waere schlimmer als die halbe Kopie. */
  const becoming = datei + '.wird';
  try { if (fs.existsSync(becoming)) fs.unlinkSync(becoming); } catch {}
  const t0 = Date.now();
  try {
    db.prepare('VACUUM INTO ?').run(becoming);
    fs.renameSync(becoming, datei);
  } catch (e) {
    try { if (fs.existsSync(becoming)) fs.unlinkSync(becoming); } catch {}
    console.error('[Kriterion] Sicherung gescheitert:', e.message);
    // Fester Text wie ueberall bei einem Fehler DES SERVERS: ein SQL-Fehler
    // nennt Pfade und Tabellen, und die gehoeren ins Protokoll, nicht in die
    // Antwort.
    return res.status(500).json({ error: t(localeOf(req), 'server.backupFailed')});
  }
  const ms = Date.now() - t0;
  let bytes = 0;
  try { bytes = fs.statSync(datei).size; } catch {}
  console.log(`[Kriterion] Sicherung geschrieben: ${path.basename(datei)} ` +
    `(${bytes} Bytes, ${ms} ms).`);
  // Eine vollstaendige Kopie, die das Haus verlaesst -- dieselbe Zeile wie der
  // Export. Der Pfad steht NICHT in der Zeile: das Protokoll haelt Vorgaenge
  // fest, keine Orte auf dem Wirt.
  auth.log('sicherung', { wer: req.benutzer.id });
  /* ---- DAS AUFRAEUMEN, UND ZWAR HIER UND NIRGENDS SONST ----
     DER AUFRUF STEHT AM ENDE DIESER ROUTE, NACH dem `rename` und nach
     `statSync` -- an dem einen Augenblick, in dem feststeht, dass eine
     frische, vollstaendige Kopie da ist.
     SCHLAEGT DIE SICHERUNG FEHL, WIRD NICHT AUFGERAEUMT (Entscheidung 3), und
     das ist die wichtigste Zeile der Runde: sonst raeumt die Installation
     genau in dem Augenblick auf, in dem sie keine neue Kopie zustande bringt.
     Der Weg dorthin verlaesst die Route vorher ueber `return res.status(500)`
     -- es genuegt also, den Aufruf ans Ende zu setzen. DAS IST KEINE
     NACHLAESSIGKEIT, SONDERN DIE BAUFORM, und sie gehoert deshalb hier
     benannt: wer den Aufruf je vor das `try` zieht, hebt die Entscheidung auf.

     UND DAS AUFRAEUMEN DARF DIE SICHERUNG NICHT MITREISSEN. Wer eine gelungene
     Kopie mit einem Fehler beantwortet, macht aus einem geglueckten Vorgang
     eine rote Message -- genau der Fehler aus 0.19.6 (Stolperstein 298).
     Der Aufruf steht deshalb in seinem eigenen `try`, und was er meldet, ist
     eine Angabe NEBEN der Sicherung, kein Ersatz fuer sie.
     ES GESCHIEHT NUR BEI EINGESCHALTETEM SCHALTER, und der steht auf AUS. */
  let aufgeraeumt = null;
  try {
    const rule = cleanupStatus();
    if (rule.an) {
      const treffer = ruleHit(backupList(ziel.pfad) || [], rule.behalten, rule.tage,
                                   Date.now(), (changeMark() || {}).ms ?? null);
      if (treffer.length) {
        const out2 = removeBackups(ziel.pfad, treffer.map(d => d.name));
        aufgeraeumt = { weg: out2.weg, nicht: out2.geblieben.length, bytes: out2.bytes };
        if (out2.weg) {
          console.log(`[Kriterion] Alte Sicherungen entfernt: ${out2.weg} ` +
            `(${out2.bytes} Bytes frei)` +
            `${out2.geblieben.length ? `, ${out2.geblieben.length} nicht` : ''}.`);
          logRemoved(req.benutzer.id, out2.weg);
        }
      }
    }
  } catch (e) {
    // Die Sicherung ist gelungen; dieser Fehler ist eine Angabe daneben und
    // darf die Antwort nicht in eine Absage verwandeln.
    console.error('[Kriterion] Das Aufräumen nach der Sicherung ist gescheitert:', e.message);
    aufgeraeumt = { weg: 0, nicht: 0, bytes: 0, gescheitert: true };
  }
  res.json({ ok: true, datei: path.basename(datei), pfad: ziel.pfad, bytes, ms,
             ...lastBackup(ziel.pfad), aufgeraeumt });
});

/* ---- DIE LOESCHROUTE ----------------------------------------------------
   POST /api/backup/cleanup -- die einundsiebzigste schreibende Route.
   Beim Eigentuemer und zweitbestaetigt, dieselbe Zeile wie Export, Import,
   Sicherung und die Bildumstellung: sie entfernt Bytes unwiderruflich.

   DIE ROUTE NIMMT KEINE DATEINAMEN ENTGEGEN. NIE.
   Sie bekommt die ART und sonst nichts; WELCHE Dateien fallen, rechnet der
   Server im selben Augenblick selbst aus. Eine Loeschroute, der man sagen
   kann, WAS sie loeschen soll, ist die gefaehrlichste Route der Anwendung --
   und sie waere es auch dann, wenn heute jeder Name geprueft wuerde: die
   Pruefung stuende einen Handgriff davon entfernt, vergessen zu werden
   (Stolperstein 300).
   DER PREIS IST BENANNT UND ANGENOMMEN: zwischen Vorschau und Knopfdruck kann
   sich der Ordner geaendert haben, und dann faellt etwas anderes als
   angezeigt. DIE ANTWORT NENNT DESHALB, WAS WIRKLICH GELOESCHT WURDE, und die
   Karte zeichnet sich daraus neu.

   ZWEI WEGE, EINE ROUTE, unterschieden durch ein Feld im Rumpf:
     art: 'regel'    -- die Regel einmal anwenden.
     art: 'veraltet' -- ALLE Kopien von vor dem Schluesselwechsel und NICHTS
                        SONST. Ausdruecklich und getrennt: eine automatische
                        Regel entfernt Ueberfluessiges, nicht Fremdes.
   Zwei Routen fuer dasselbe Loeschen waeren zwei Stellen, an denen die
   Pfadpruefung stehen muss.

   DER ORDNER KOMMT AUS getSetting('sicherungOrt') UND GEHT DURCH checkPlace()
   -- dieselbe Pruefung wie beim Schreiben, dieselbe Funktion, kein zweites Mal
   hingeschrieben: Positivliste zuerst, `realpathSync` danach. */
app.post('/api/backup/cleanup', ownerOnly,
         secondConfirmNeeded('sicherung'), (req, res) => {
  const situation = backupState();
  if (!situation.ein) return res.status(400).json({ error: t(localeOf(req), situation.grund, situation.values) });
  const ziel = checkPlace(getSetting('sicherungOrt', ''));
  if (ziel.fehler) return res.status(400).json({ error: t(localeOf(req), ziel.fehler, ziel.values) });
  const art = String(req.body?.art || '');
  if (art !== 'regel' && art !== 'veraltet')
    return res.status(400).json({ error: t(localeOf(req), 'server.cleanupUnknown')});
  const dateien = backupList(ziel.pfad);
  if (dateien === null)
    return res.status(400).json({ error: t(localeOf(req), 'server.backupDirUnreachable')});
  const mark = changeMark();
  /* DIE GRENZEN HALTEN, BEVOR IRGENDETWAS GELOESCHT WIRD. Die Werte kommen aus
     settings und nicht aus dem Rumpf; steht dort einer ausserhalb der Spanne,
     ist das eine Absage und keine stille Rundung. */
  let treffer;
  if (art === 'veraltet') {
    if (!mark) return res.status(400).json({
      error: t(localeOf(req), 'server.keyNeverChanged')});
    treffer = dateien.filter(d => d.zeit < mark.ms);
  } else {
    const b = checkRuleValue(getSetting('sicherungBehalten', CLEANUP_KEEP.vorgabe),
                              CLEANUP_KEEP, 'server.ruleKeep');
    if (b.fehler) return res.status(400).json({ error: t(localeOf(req), b.fehler, b.values) });
    const rule = checkRuleValue(getSetting('sicherungTage', CLEANUP_DAYS.vorgabe),
                              CLEANUP_DAYS, 'server.ruleDays');
    if (rule.fehler) return res.status(400).json({ error: t(localeOf(req), rule.fehler, rule.values) });
    treffer = ruleHit(dateien, b.wert, rule.wert, Date.now(), mark ? mark.ms : null);
  }
  const out2 = removeBackups(ziel.pfad, treffer.map(d => d.name));
  if (out2.weg) {
    console.log(`[Kriterion] Alte Sicherungen entfernt (${art}): ${out2.weg} ` +
      `(${out2.bytes} Bytes frei)${out2.geblieben.length ? `, ${out2.geblieben.length} nicht` : ''}.`);
    /* NUR DIE ZAHL INS SICHERHEITSPROTOKOLL. Kein Freitext, kein Dateiname,
       kein Pfad -- das Protokoll haelt Vorgaenge fest, keine Orte auf dem Wirt
       (dieselbe Regel wie beim `sicherung`-Eintrag daneben). DIE
       FREIGEGEBENEN BYTES GEHOEREN NICHT IN DIE TABELLE, sondern in die
       Antwort und in die Zeile darueber: MERKMALE ist eine geschlossene Liste
       und bleibt bei vierzehn. */
    logRemoved(req.benutzer.id, out2.weg);
  }
  /* DIE ANTWORT NENNT, WAS WIRKLICH GELOESCHT WURDE, und traegt die Vorschau
     frisch daneben: die Karte zeichnet sich daraus neu, statt ihren alten
     Stand fortzuschreiben. */
  const after = cleanupStatus();
  res.json({ ok: true, art, weg: out2.weg, nicht: out2.geblieben.length, bytes: out2.bytes,
             ...lastBackup(ziel.pfad),
             aufraeumen: { ...after,
                           grenzen: { behalten: CLEANUP_KEEP, tage: CLEANUP_DAYS },
                           ...cleanupPreview(ziel.pfad, after.behalten, after.tage) } });
});

// Einmal beim Start ins Protokoll -- wer den Ort falsch stehen hat, sieht es
// hier und nicht erst am Knopf.
{
  const situation = backupState();
  console.log('[Kriterion] Sicherungsort: ' + (situation.ein ? situation.wurzel : `aus — ${situation.grund}`));
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

/* Der letzte Fehler-Handler. Zwei Regeln:
   Ein Fehler, den der Server ABSICHTLICH wirft, traegt eine Markierung
   (err.status) und behaelt Rang und Message; Multer-Fehler ebenso.
   Alles Uebrige ist ein Fehler DES SERVERS und wird 500 mit festem Text: ein
   SQL-Fehler nennt Tabellen und Spalten, ein sharp-Absturz den Pfad. Die
   Einzelheiten stehen im Protokoll, und dort gehoeren sie hin. */
app.use((err, req, res, next) => {
  console.error(err);
  const locale = localeOf(req);
  /* EINE MELDUNG WIRD HIER UEBERSETZT UND SONST NIRGENDS -- 0.24.0,
     Bauabschnitt 1. Sie kommt als Schluessel aus auth.js oder aus einer Route,
     und erst hier ist die Anfrage in der Hand, die sagt, welche Sprache sie
     traegt. Ihr Status steht an ihr; die Reihenfolge davor gilt weiter fuer
     alles andere. */
  /* GEFRAGT WIRD NACH `schluessel` UND NICHT NACH DER KLASSE: auth.js wirft
     die Klasse `Message`, mail.js baut sich dieselbe Form selbst -- es ist ein
     Blatt im Abhaengigkeitsbaum und darf auth.js nicht requiren. Was zaehlt,
     ist die Form. */
  if (err && err.key)
    return res.status(err.status || 400).json({ error: t(locale, err.key, err.values || {}) });
  const rank = err.status || err.statusCode || (err instanceof multer.MulterError ? 400 : 500);
  if (rank >= 500) return res.status(500).json({ error: t(locale, 'server.error') });
  res.status(rank).json({ error: err.message || t(locale, 'server.errorUnknown') });
});

/* ================= Start ================= */
/* AUSDRUECKLICH NUR BILDER. Eine Videozeile traegt in data die Videodatei --
   sharp liefe darauf in einen Fehler, beide Varianten kaemen leer zurueck und
   das vorhandene Standbild waere ueberschrieben. Die Zeile bliebe ausserdem
   bei jedem Start aufs Neue faellig. Und der Kernsatz gilt auch hier: der
   Server oeffnet nie ein Video. Das Standbild kommt vom Browser.

   DIE SCHLEIFE SELBST LAEUFT SEIT 0.19.3 IM THREAD (batchrun.js) --
   dieselbe Bauform und derselbe Grund wie bei der Umstellung: sie liest und
   schreibt Blobs, und better-sqlite3 ist synchron.
   DIE FRAGE, OB ES ETWAS ZU TUN GIBT, BLEIBT HIER. Ohne sie entstuende bei
   jedem Start ein Thread fuer eine leere Liste -- 19 ms fuer die Verbindung
   und 76 ms fuer sharp, fuer nichts. */
function ruesteVorschaubilderNach() {
  const offen = db.prepare(
    "SELECT id FROM photos WHERE (thumb IS NULL OR medium IS NULL) AND art != 'video'").all();
  if (!offen.length) return refreshTiles();
  /* maintainStorage() ERST DANACH, und deshalb steht es hier im Abschluss und
     nicht in einer Kette daneben: es fasst die ganze Datei an (beim ersten Mal
     ein VACUUM) und darf nicht neben der Schleife laufen.
     SEIT 0.19.4 STEHT DAS NACHZIEHEN DAZWISCHEN, und die drei laufen
     NACHEINANDER und nicht nebeneinander. Zwei Bestandsthreads gleichzeitig
     schrieben beide in `photos`, und der Stand fuer die Karte ist EINE
     Variable -- der zweite ueberschriebe den ersten, und die Karte zeigte
     abwechselnd zwei Laeufe (Stolperstein 47). */
  startBatchThread('vorschaubilder', offen, refreshTiles);
}

/* DIE KACHELN ERNEUERN -- 0.19.4 als Geometrie, seit 0.19.5 als Zuschnitt.
   NACH DEM NACHRUESTEN UND NICHT DAVOR: eine Zeile, der `thumb` fehlt, hat
   keine Kachel, an der sich etwas ablesen liesse. Erst fuellen, dann erneuern --
   und was das Nachruesten erzeugt, ist ohnehin schon zugeschnitten, weil beide
   dieselbe makeVariants() mit demselben Zuschnitt rufen.

   ES LAEUFT BEI JEDEM START UND NICHT AUF KNOPFDRUCK, und das ist die
   Entscheidung aus Abschnitt 1c des Auftrags. Sie faellt an einer Messung:
   die Nummern zu holen kostet den Haupt-Thread 0,5 ms; die Koepfe zu lesen
   kostet 275 bis 314 ms, und die fallen im THREAD an, wo sie niemanden
   aufhalten. Ein Knopf waere die Antwort gewesen, wenn die teure Haelfte im
   Haupt-Thread haette liegen muessen -- sie muss nicht.
   WAS ES KOSTET, WENN NICHTS ZU TUN IST: ein Thread je Start, 19 ms
   Verbindung und 76 ms sharp, und danach 275 ms Lesen im Leerlauf. Das ist
   der Preis dafuer, dass kein Merker in der Datenbank steht -- und der
   Merker waere eine Schemaaenderung. */
function refreshTiles() {
  const zeilen = qTileRows.all();
  if (!zeilen.length) return maintainStorage();
  startBatchThread('geometrie', zeilen, maintainStorage);
}

/* NICHT MEHR `async` SEIT 0.19.3, und das ist keine Kosmetik: nichts darin ist
   asynchron, und seit dieser Runde wird es als ABSCHLUSS eines Threads
   gerufen. Eine Zusage, die dort geworfen wuerde, faende keinen Empfaenger
   mehr -- und eine unbehandelte Zusage nimmt in Node den ganzen Server mit. */
function maintainStorage() {
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
// uebrigen Dateien. Der Fingerprint ist die Aussage, die sie nicht machen kann:
// er aendert sich, sobald IRGENDEINE der beteiligten Dateien anders ist -- ein
// halb eingespielter Dateisatz zeigt damit einen Wert, der zu keiner Version
// gehoert.
//
// DIE LISTE WIRD ABGELEITET, NICHT GEPFLEGT, und zwar aus dem, was der Server
// wirklich tut: alles unter public/ liefert express.static aus, alles in
// require.cache unterhalb dieses Verzeichnisses fuehrt er aus. Eine zweite,
// gepflegte Liste liefe auseinander -- und testbench.js und Doku/ koennen so
// gar nicht erst hineingeraten (sie liegen nicht im Image).
//
// DIE GRENZE, DIE DARAUS FOLGT, IST ABSICHT: usertool.js liegt im Image, wird
// aber nur von Hand aufgerufen und steht deshalb nicht im Fingerprint. Er
// sagt, WELCHER SERVER LAEUFT.
function filesUnder(directory) {
  const out2 = [];
  for (const e of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, e.name);
    if (e.isDirectory()) out2.push(...filesUnder(full));
    else if (e.isFile()) out2.push(full);
  }
  return out2;
}

function buildFingerprint() {
  const ran = Object.keys(require.cache).filter(f =>
    f.startsWith(__dirname + path.sep) && !f.split(path.sep).includes('node_modules'));
  /* UND DIE DATEI, DIE NUR IM THREAD LEBT -- 0.19.3. batchrun.js wird
     nicht requiret, sondern an `new Worker` gereicht; es steht deshalb in
     keiner require.cache des Haupt-Threads und fiele aus der Ableitung
     heraus. DER SERVER FUEHRT ES TROTZDEM AUS, und genau das ist der Massstab
     dieser Liste. Es ist KEINE zweite, gepflegte Liste: gelesen wird
     dieselbe Konstante, mit der der Thread erzeugt wird, und eine Pruefung
     haelt beide gegeneinander. */
  const list = [...new Set([...ran, BATCHRUN,
                             ...filesUnder(path.join(__dirname, 'public'))])]
    .map(f => path.relative(__dirname, f).split(path.sep).join('/'))
    .sort();
  const h = crypto.createHash('sha256');
  for (const rel of list) {
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
const FINGERPRINT = buildFingerprint();

/* Sauberes Herunterfahren. Ohne das beendet "docker compose down" den Prozess
   hart: die WAL-Datei bleibt liegen, und wer in genau diesem Augenblick das
   Datenverzeichnis sichert, sichert einen Zustand mit offener WAL. Fuer SQLite
   ist das ungefaehrlich, fuer eine Sicherung nicht.
   Der Abschluss darf nichts werfen -- wer beendet, ist nicht mehr zu retten. */
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    /* ERST DIE THREADS, DANN DIE DATEI -- 0.19.3. Laeuft ein Bestandslauf,
       schreibt er in dieselbe Datei; wer ihre WAL kuerzt, waehrend er
       schreibt, tut genau das, wogegen dieser Abschluss gebaut ist.
       terminate() OHNE await: der Abschluss darf nicht warten, und ein
       beendeter Thread schreibt keine Zeile mehr. Die halb umgestellte Zeile,
       die er gerade in der Hand hatte, bleibt PNG -- der Knopf holt sie beim
       naechsten Lauf nach, und genau dafuer ist er nie endgueltig. */
    for (const w of batchThreads) { try { w.terminate(); } catch {} }
    try { db.pragma('wal_checkpoint(TRUNCATE)'); db.close(); } catch {}
    process.exit(0);
  });
}

app.listen(PORT, () => {
  // holeBenutzer() ist hier RICHTIG: beim Start gibt es keine Anfrage und
  // damit keinen angemeldeten Benutzer. Gemeint ist der Eigentuemer, und so
  // steht es auch in der Zeile.
  const u = auth.getUser();
  console.log(`[Kriterion] Läuft auf Port ${PORT} — ` +
    (u ? `Eigentümer: ${u.username}` : 'noch kein Zugang, Einrichtung im Browser'));
  /* Die Betriebsart gehoert ins Protokoll: an ihr haengt, ob die Koepfe des
     Proxys ueberhaupt angesehen werden. Wer sie falsch stehen hat, sieht es
     hier und nicht erst an einer wirkungslosen Anmeldebremse.
     SIE NENNT SEIT 0.13.0 BEIDE WEGE: Cookiename, Secure und HSTS haengen
     nicht mehr an ihr, sondern an der einzelnen Anfrage. Eine Zeile, die eine
     Buendelung behauptet, die es nicht mehr gibt, waere schlechter als keine. */
  console.log(`[Kriterion] Hinter Proxy: ${auth.BEHIND_PROXY ? 'an' : 'aus'} — ` +
    (auth.BEHIND_PROXY
      ? 'X-Forwarded-For und X-Forwarded-Proto werden gelesen; über HTTPS gilt ' +
        `${auth.COOKIE_SICHER} mit Secure und HSTS, über das Heimnetz ${auth.COOKIE_NAME}`
      : `kein Kopf wird gelesen, jede Anfrage gilt als Klartext: ${auth.COOKIE_NAME} ohne Secure`));
  /* Die oeffentliche Adresse gehoert ins Protokoll: an ihr haengt, welchen
     Link ein Empfaenger bekommt. Wer sie falsch stehen hat, sieht es hier und
     nicht erst am toten Link beim Empfaenger. */
  if (PUBLIC.fehler) {
    console.warn(`[Kriterion] PUBLIC_ADDRESS ist unbrauchbar: ${PUBLIC.fehler} ` +
      'Die Instanz laeuft weiter; den Einladungslink baut wie bisher der Browser des Admins.');
  } else if (PUBLIC.adresse) {
    console.log(`[Kriterion] Oeffentliche Adresse: ${PUBLIC.adresse} — ` +
      'Einladungslinks werden damit gebaut.');
    if (auth.BEHIND_PROXY && PUBLIC.adresse.startsWith('http://')) {
      // Widerspruch, aber kein Verlust: ein falscher Link ist ein toter Link.
      // Eine Absage waere hier haerter als der Schaden.
      console.warn('[Kriterion] Hinter einem Proxy und trotzdem http:// in ' +
        'PUBLIC_ADDRESS — verschickte Links fuehren dann am Proxy vorbei ' +
        'und ohne HTTPS ins Haus.');
    }
  } else {
    console.log('[Kriterion] Oeffentliche Adresse: nicht gesetzt — ' +
      'den Einladungslink baut der Browser des Admins.');
  }
  /* Der Mailversand gehoert ins Protokoll, in derselben Form wie die Adresse
     darueber: wer ihn eingerichtet glaubt und es nicht ist, sieht es hier.
     DAS PASSWORT STEHT HIER NICHT, auch nicht seine Laenge. Die Zeile nennt
     Anbieter, Server und Absender -- ein Geheimnis, das einmal im
     Containerprotokoll steht, steht dort, bis es jemand loescht. */
  {
    const roh = getSetting(mail.SETTING_KEY, null);
    const z = mail.state(roh);
    if (mail.configured(roh)) {
      console.log(`[Kriterion] Mailversand: ${z.anbieterName} über ${z.server}:${z.port} ` +
        `(${z.sicher ? 'TLS' : 'STARTTLS'}), Absender ${z.absender}.` +
        (PUBLIC.adresse ? '' : ' Ohne PUBLIC_ADDRESS wird trotzdem nicht verschickt.'));
    } else {
      console.log('[Kriterion] Mailversand: nicht eingerichtet — Einladungs- und ' +
        'Ruecksetzlinks stehen wie bisher im Verwaltungsbereich zum Kopieren.');
    }
  }
  /* DAS NACHRUESTEN, DAS NACHZIEHEN UND DIE SPEICHERPFLEGE, 1500 ms nach dem
     Horchen. Die Kette aus .then() ist weggefallen, weil die Schleifen nicht
     mehr hier laufen: jeder Schritt gibt den naechsten als Abschluss an den
     Thread weiter und ruft ihn selbst, wenn es fuer ihn nichts zu tun gibt.
     Am Ende der Kette steht maintainStorage(). Der Fehlerfall haengt am
     Thread (worker.on('error')) -- und er beendet die Kette: der Abschluss
     laeuft am 'exit', und den gibt es auch nach einem Fehler. */
  setTimeout(ruesteVorschaubilderNach, 1500);
});
