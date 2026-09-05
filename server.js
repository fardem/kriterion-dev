const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { Worker } = require('worker_threads');
const anh = require('./anhaenge');
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
/* DIE BILDABLEITUNGEN STEHEN SEIT 0.19.3 IN bilder.js und nicht mehr hier.
   Der Grund ist nicht Ordnung, sondern EINE Wahrheit ueber die Ablage: der
   Bestandslauf faehrt seit dieser Runde in einem eigenen Thread und braucht
   dieselbe Umwandlung wie der Anfrageweg (Stolperstein 47). Gerufen wird
   dasselbe wie vorher, nur aus einer Datei daneben. */
/* `istPNG` STEHT HIER NICHT MEHR: die einzige Stelle, die es im Server rief,
   war die Schleife des Bestandslaufs -- und die faehrt seit dieser Runde im
   Thread. Ein Import, den niemand ruft, ist eine Zeile, die beim naechsten
   Lesen erklaert werden muss. Der KOMMENTAR ueber qOffenePNG nennt es
   weiterhin, und das ist richtig: die Byte-Folge dort ist dieselbe. */
const { makeVariants, PNG_MAGIE_HEX, legeBildAb } = require('./bilder');
const { db, DATA_DIR, DB_FILE, keyFromEnv, keyHex, renumberCriteria, verfahren } = require('./db');
const auth = require('./auth');
const mail = require('./mail');

const PORT = process.env.PORT || 3000;

/* ---- Die oeffentliche Adresse ----
   OHNE SIE BAUT DER BROWSER DES ADMINS DEN EINLADUNGSLINK aus location. Das
   ist die Vorgabe und braucht keine Einstellung; es hat genau eine
   Bruchstelle -- die Adresse, unter der der Admin zugreift, ist nicht immer
   die, die der Empfaenger benutzen soll.

   SIE GEHOERT IN DIE .env UND NICHT IN settings, dieselbe Linie wie
   HINTER_PROXY: Netzwerkvertrauen, nicht Vorliebe. Ein Admin kommt nicht an
   einen anderen Admin -- duerfte er die oeffentliche Adresse setzen, zeigte
   jede verschickte Ruecksetzmail auf seinen Server. Der Systembereich ZEIGT
   sie deshalb, er setzt sie nicht.

   AUS DEM HOST-KOPF WIRD NICHTS ABGELEITET: ueber einen gefaelschten Kopf
   liesse sich ein Link sonst auf einen fremden Server umbiegen.

   Zur Form (was ? und # angeht, und warum ein unbrauchbarer Wert den Start
   nicht abbricht) siehe auth.js, wo der Wert gelesen wird. */
const OEFFENTLICHE = auth.OEFFENTLICHE_ADRESSE;

/* Was die Antwort ueber den Link sagt. IST DIE EINSTELLUNG LEER, GIBT DER
   SERVER KEINEN LINK HERAUS -- der Browser baut ihn selbst, und die
   Oberflaeche sagt daneben, woher die Adresse kam. Zwei Felder statt eines:
   aus einer Abwesenheit eine Aussage zu machen waere die zweite Wahrheit. */
const linkAngabe = (klartext) => OEFFENTLICHE.adresse
  ? { link: `${OEFFENTLICHE.adresse}/#/einladung/${klartext}`, linkQuelle: 'einstellung' }
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

/* ---- Der Beleg der letzten Testmail --------------------------------------
   SIE BELEGT "mit DIESEN Werten ist einmal wirklich eine Mail hinausgegangen"
   und haengt am HASH UEBER DEN ZUGANG: aendert sich etwas daran, passt die
   Marke nicht mehr. Eine Funktion und zwei Rufer, nicht zwei Rechnungen
   (Stolperstein 145). */
const MAILTEST_SCHLUESSEL = 'mailtestOk';
function mailtestStand(roh) {
  const test = getSetting(MAILTEST_SCHLUESSEL, null);
  return test && test.marke && test.marke === mail.marke(roh) ? test : null;
}

/* ---- Kann diese Instanz ueberhaupt verschicken --------------------------
   DREI VORAUSSETZUNGEN, UND ALLE DREI SIND NOETIG. Die Testmarke allein
   traegt nicht: DIE TESTMAIL ENTHAELT KEINEN LINK und geht auch ohne
   OEFFENTLICHE_ADRESSE durch -- die Marke waere gruen, und die
   Bestaetigungsmail ginge nie hinaus. Der Grund steht daneben. */
function versandBereit() {
  const roh = getSetting(mail.SCHLUESSEL, null);
  if (!mail.eingerichtet(roh))
    return { ok: false, grund: 'Es ist kein Mailzugang eingerichtet. Das macht der Eigentümer dieser Installation.' };
  if (!mailtestStand(roh))
    return { ok: false, grund: 'Seit der letzten Änderung am Mailzugang ist keine Testmail durchgekommen. ' +
      'Der Eigentümer dieser Installation drückt sie in der Karte „Mailversand“.' };
  if (!OEFFENTLICHE.adresse)
    return { ok: false, grund:
      'Ohne OEFFENTLICHE_ADRESSE in der .env wird nicht verschickt — der Server wüsste nicht, worauf der Link zeigen soll.' };
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

   DER SCHLUESSEL STEHT IM FRAGMENT (#/bestaetigung/…) und geht nie an den
   Server: ein Vorschaudienst, der Links im Postfach vorab abruft, holt nur
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
const CSP_ANWENDUNG =
  "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; " +
  "style-src 'self' 'unsafe-inline'; script-src 'self'; frame-src 'self'; " +
  "frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Content-Security-Policy', CSP_ANWENDUNG);
  if (auth.ueberProxy(req)) res.set('Strict-Transport-Security', 'max-age=31536000');
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

/* Was als Foto hereinkommt, muss ein Rasterbild sein -- dem INHALT nach.
   sharp liest auch SVG anstandslos: der Upload saehe normal aus, und die
   Datei laege danach als Skripttraeger in der Datenbank. svg fehlt in der
   Liste mit Absicht. */
const RASTER_FORMATE = ['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff'];
async function rasterBild(buf) {
  try {
    const m = await sharp(buf).metadata();
    return RASTER_FORMATE.includes(m.format);
  } catch { return false; }
}

const touch = db.prepare(`UPDATE items SET updated_at = datetime('now') WHERE id = ?`);
/* "bearbeitet" am Kommentar. EINE Stelle fuer beide Bildwege -- anhaengen
   und entfernen sind dieselbe Aussage ueber denselben Menschen.
   updated_at ist eine Aussage UEBER DEN VERFASSER: nur er loest es aus. Der
   Eingriff eines Admins setzt es nie, sonst saehe seine Loeschung aus wie
   eine Bearbeitung durch den Verfasser. */
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
/* ACHT SEIT 0.17.0, vorher neun: `zuletztGesehen` trug die Pille „Neu seit
   ..." und hat mit ihr keinen Rufer mehr. Vorhandene Zeilen in user_settings
   bleiben stehen und werden nicht gelesen -- eine Migration, die persoenliche
   Zeilen loescht, waere teurer als die Zeilen selbst. */
/* NEUN SEIT 0.22.0: `streifen` -- die Mindestgroesse der Kacheln im Bildstreifen,
   persoenlich je Zugang, ein Wert fuer alle Geraete, dieselbe Maschine wie
   `schrift` (E11). */
const PERSOENLICHE_SCHLUESSEL = ['filters', 'schrift', 'bloecke', 'linkZeilen', 'zeitleiste', 'suchNamen',
                                'glockeGesehen', 'ansichten', 'streifen'];

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
   hinter `nurEigentuemer`. Genau dafuer war diese Liste angelegt: "der zweite
   Schluessel dieser Art steht dann daneben und nicht als zweite
   Verzweigung." */
const EIGENTUEMER_SCHLUESSEL = ['bilderUmwandeln',
                                'sicherungAufraeumen', 'sicherungBehalten', 'sicherungTage'];

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

/* WELCHER SCHLUESSEL AUF DER FORMATZEILE DER KARTE STEHT -- die Zuordnung von
   mime_type auf den Schluessel steht HIER UND NUR HIER. Die Oberflaeche kennt
   nur noch die Schluessel und die Namen dazu (BILDFORMATE in public/app.js);
   zwei Tabellen ueber dieselbe Sache duerfen sich nicht widersprechen
   (Stolperstein 47).
   WAS SIE NICHT KENNT, FAELLT IN 'anderes' -- ein leeres oder unbekanntes
   mime_type ist eine Aussage und keine Zeile weniger.
   KLEINGESCHRIEBEN VERGLICHEN: `IMAGE/PNG` ist derselbe Typ, und die Spalte
   traegt, was der Hochladende gemeldet hat. */
const BILD_MIME_FORMAT = {
  'image/png': 'png', 'image/jpeg': 'jpeg', 'image/webp': 'webp', 'image/gif': 'gif'
};
const formatAusMime = (m) => BILD_MIME_FORMAT[String(m || '').trim().toLowerCase()] || 'anderes';

/* Der Schalter aus dem Reiter „Datenbank". VORGABE AN -- und „aus" heisst
   wirklich aus: ankommende PNG bleiben dann byte-genau PNG. Das ist die
   Stellung, die dem Verhalten von Immich, Nextcloud und Piwigo entspricht.
   DER SCHALTER IST NIE ENDGUELTIG: in beide Richtungen holt der Knopf
   „Alle PNG nach WebP umstellen" nach, was in der anderen Stellung entstanden
   ist. Genau deshalb ist er billig. */
const bilderUmwandeln = () => getSetting('bilderUmwandeln', true) !== false;

/* ---- Den vorhandenen Bestand nachziehen ----
   DIES WAR ALS WIRTSSKRIPT `bilder.js` GEPLANT, in der Bauform von zugang.js
   und schluessel.js. Es ist ein Knopf geworden, und das ist die bessere Wahl,
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
   /api/bilder/umstellen antwortete mit 409. Ein Stand je Aufgabe ist die
   einzige Form, in der beide gleichzeitig die Wahrheit sagen koennen.
   DER SCHLUESSEL IST DIE AUFGABE, mit der der Thread erzeugt wird -- dieselbe
   Zeichenfolge, die bestandslauf.js unten in seiner Verzweigung liest. Eine
   zweite Liste der Aufgabennamen liefe auseinander. */
const bestandsStaende = { umstellung: null, geometrie: null };

/* Der Stand fuer /api/stats -- oder null, solange in dieser Laufzeit nie einer
   lief. ER BLEIBT NACH DEM ENDE STEHEN, mit `laeuft: false`: die Karte fragt
   waehrend des Laufs nach, und die letzte Antwort soll sagen koennen, was
   herauskam. Ein Stand, der im Augenblick des Fertigwerdens auf null
   zurueckspringt, liesse die Karte im Ungewissen -- sie saehe nicht den
   Abschluss, sondern nur das Verschwinden. */
const bestandsStand = (aufgabe) =>
  bestandsStaende[aufgabe] && { ...bestandsStaende[aufgabe] };

/* WELCHE ZEILEN UEBERHAUPT IN FRAGE KOMMEN -- am INHALT erkannt, mit derselben
   Byte-Folge wie istPNG(). AUSDRUECKLICH OHNE VIDEOS: dort traegt `data` die
   Videodatei.
   HIER DARF `art != 'video'` STEHEN, anders als in /api/stats: diese Abfrage
   laeuft nur auf Knopfdruck, sie liest ohnehin die ersten Bytes jedes Blobs,
   und der Index brächte ihr nichts (gemessen 1424 ms -- das ist der Preis des
   Lesens und nicht der der Spaltenlage). */
const qOffenePNG = db.prepare(
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
   erzeugen (siehe vorlageAus() in bestandslauf.js). Sie MUSS es sogar -- der
   CSS-Zuschnitt faellt in dieser Runde weg, und eine Videokachel mit
   `zoom > 100` zeigte danach den Mittenschnitt statt des eingestellten
   Ausschnitts. Der Ausschnitteditor ist am Video offen, Schieber
   eingeschlossen; was er einstellt, muss auch zu sehen sein.
   DAMIT FAELLT AUCH DER GRUND WEG, DIE ART UEBERHAUPT ZU FRAGEN. Eine
   Bedingung, die nichts mehr ausschliesst, ist eine Zeile, die beim naechsten
   Lesen erklaert werden muss. Die anderen beiden Abfragen (qOffenePNG und das
   Nachruesten) behalten ihr `art != 'video'`: dort GIBT es keine Vorlage --
   umgestellt wird `data`, und das ist am Video die Videodatei.
   UND AUSDRUECKLICH OHNE `thumb IS NOT NULL`, obwohl es die Auswahl genauer
   machte: gemessen 12,9 ms kalt -- der Satz selbst muss dafuer angefasst
   werden, und der Haupt-Thread ist genau das, was 0.19.1 und 0.19.2
   freigeraeumt haben. Eine Zeile ohne `thumb` ueberspringt der Thread von
   selbst; sie ist Sache des Nachruestens, das unmittelbar davor gelaufen
   ist. */
const qKachelZeilen = db.prepare('SELECT id FROM photos');

/* ---- DIE VIER ABFRAGEN DER BESTANDSKARTE ----
   VORBEREITET UND NICHT JE ANFRAGE GEBAUT: sie laufen bei jedem Zeichnen des
   Systembereichs. Die Begruendung ihrer FORM steht an der Aufrufstelle in
   /api/stats, wo die Messung danebensteht.
   `art` KOMMT AUS DEM INDEX idx_photos_art -- deshalb `GROUP BY` ohne weitere
   Spalte und deshalb `IS ?` statt `!= 'video'`. */
const qBildArten = db.prepare('SELECT art AS a FROM photos GROUP BY 1');
const qJeArt = db.prepare(
  'SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos WHERE art IS ?');
const qJeFormat = db.prepare(`
  WITH x AS MATERIALIZED (
    SELECT mime_type AS m, length(data) AS o FROM photos WHERE art IS ?)
  SELECT m, COUNT(*) AS n, COALESCE(SUM(o),0) AS o FROM x GROUP BY 1`);
/* Die Videozeile traegt neben `data` auch eine Ableitung, und die geht mit in
   die Exportdatei -- dieselbe Rechnung wie in austauschTeile(). */
const qVideoExportBytes = db.prepare(`
  SELECT COALESCE(SUM(length(data) + COALESCE(length(medium), length(thumb), 0)),0) AS n
    FROM photos WHERE art IS ?`);

/* ================= DER BESTANDSLAUF IN EINEM EIGENEN THREAD — 0.19.3 =========

   DIE SCHLEIFEN SELBST STEHEN IN bestandslauf.js, und die Begruendung mit
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
const bestandsThreads = new Set();

/* DER PFAD STEHT AN EINER STELLE, und das ist keine Ordnungsliebe: der
   Fingerprint liest ihn ein zweites Mal. Ein Modul, das NUR im Thread lebt,
   steht in der `require.cache` des Haupt-Threads nicht -- der Server fuehrt
   es aus, und der abgeleitete Dateisatz saehe es trotzdem nicht. Ein
   Fingerprint, der eine ausgelieferte Datei nicht kennt, ist eine halbe
   Aussage. Beide lesen deshalb DIESE Zeile, und eine Pruefung haelt sie
   gegeneinander. */
const BESTANDSLAUF = path.join(__dirname, 'bestandslauf.js');

/* EIN FEHLER IM THREAD REISST DEN SERVER NICHT AB -- dieselbe Regel wie
   heute fuer eine einzelne Zeile. Was hier ankommt, ist alles, was die
   Schleife NICHT schon selbst abgefangen hat; der Lauf ist dann zu Ende, der
   Rest des Servers steht.
   `laeuft` FAELLT DABEI AUF false, und nicht der ganze Stand auf null: die
   Karte soll sehen, wie weit er gekommen ist. */
function starteBestandsThread(aufgabe, zeilen, fertig) {
  const w = new Worker(BESTANDSLAUF, { workerData: { aufgabe, zeilen } });
  bestandsThreads.add(w);
  /* DER STAND WIRD ERSETZT UND NICHT FORTGESCHRIEBEN. Der Thread meldet je
     Zeile den GANZEN Stand; eine Zunahme muesste hier aufaddiert werden, und
     dann haengt die Zahl an der Vollstaendigkeit der Meldungsfolge. */
  w.on('message', (m) => { if (m && m.art === 'stand') bestandsStaende[aufgabe] = m.stand; });
  w.on('error', (e) => {
    if (bestandsStaende[aufgabe]) bestandsStaende[aufgabe].laeuft = false;
    console.error(`[Kriterion] Bestandslauf (${aufgabe}) abgebrochen:`, e.message);
  });
  w.on('exit', () => { bestandsThreads.delete(w); if (fertig) fertig(); });
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
  res.set('Set-Cookie', auth.sessionCookie(req, auth.legeSitzungAn(angelegt.id)));
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
     ERST HIER, nach der Passwortpruefung: ein gesperrter Zugang soll
     erfahren, dass er gesperrt ist. Vor der Pruefung waere dieselbe Meldung
     ein Werkzeug zum Durchprobieren von Namen.
     Kein noteFailure -- das Passwort war richtig. */
  if (benutzer.status !== 'aktiv') {
    return res.status(403).json({
      error: benutzer.status === 'geloescht'
        ? 'Dein Konto gibt es nicht mehr.'
        : 'Dein Konto ist gesperrt. Ein Admin kann es entsperren.'
    });
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
  if (auth.zweifaktorAn(benutzer.id)) {
    return res.json({ zweifaktor: true, ...auth.erzeugeAnmeldeAusweis(benutzer.id) });
  }
  auth.noteSuccess(ip, user);
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(req, auth.legeSitzungAn(benutzer.id)));
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
app.post('/api/login/zwei', async (req, res) => {
  const ip = auth.clientIp(req);
  const { ausweis, code } = req.body || {};
  /* DIE BREMSE STEHT GANZ VORN -- dieselbe Reihenfolge wie an
     POST /api/login und POST /api/bestaetigung: ein gesperrter Aufrufer
     bekommt an JEDER Stelle dieselbe 429 und nirgends stattdessen eine
     Auskunft ueber seinen Ausweis.
     UND SIE IST DIE EINZIGE FORM, IN DER SICH DIE ZUSAGE BELEGEN LAESST:
     stuende sie hinter dem Ausweis, waere von aussen nicht mehr zu sehen, ob
     die Sperre hier ueberhaupt gilt -- die 429 kaeme dann immer schon aus
     Schritt 1. Genau daran ist die erste Fassung der Bremsprobe STUMM
     geblieben (Stolperstein 163).
     GEZAEHLT WIRD MIT DER IP-HAELFTE, denn der Name ist vor dem Ausweis nicht
     bekannt. Die HARTE Sperre haengt ohnehin allein an der Adresse. */
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
    return res.status(401).json({ error: 'Die Anmeldung ist abgelaufen. Bitte melde dich noch einmal an.' });
  }
  const zugang = auth.holeZugang(id);
  const name = zugang ? zugang.username : null;
  /* ZWEITE NACHSCHAU AUF DEN STATUS. Zwischen den beiden Schritten liegen bis
     zu zwei Minuten, und in denen kann ein Admin gesperrt haben. Dieselbe
     Meldung wie im ersten Schritt -- der Aufrufer hat sein Passwort ja bereits
     belegt und darf deshalb erfahren, woran es liegt. */
  if (!zugang || zugang.status !== 'aktiv') {
    return res.status(403).json({ error: 'Dein Konto ist gesperrt. Ein Admin kann es entsperren.' });
  }
  if (!auth.pruefeZweitenFaktor(id, code)) {
    auth.noteFailure(ip, name);
    /* DIESELBE ZEILE WIE BEI EINEM FALSCHEN PASSWORT, und kein eigener Vorgang
       daneben: eine gescheiterte zweite Stufe IST eine gescheiterte Anmeldung.
       Sie steht hier und nicht in auth.pruefeZweitenFaktor -- die Funktion
       hat drei Rufer, und an den beiden anderen ist das Scheitern keine
       Anmeldung. */
    auth.protokolliere('anmeldung.fehl', { wer: null, ziel: id });
    /* EIN FRISCHER AUSWEIS LIEGT DER ABSAGE BEI. Der alte ist verbraucht --
       "genau einmal" bleibt woertlich wahr. Ohne den neuen stuende ein Mensch
       nach EINEM Tippfehler wieder vor dem Passwortfeld.
       WAS DEN VERSUCH BEGRENZT, IST DIE BREMSE UND NICHT DIE FRIST: wer raet,
       tippt das Passwort eben noch einmal. */
    return res.status(401).json({
      error: auth.ZWEITER_FAKTOR_ABSAGE, ...auth.erzeugeAnmeldeAusweis(id)
    });
  }
  auth.noteSuccess(ip, name);
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(req, auth.legeSitzungAn(id)));
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
  const kekse = auth.parseCookies(req);
  for (const t of new Set([kekse[auth.COOKIE_SICHER], kekse[auth.COOKIE_NAME]].filter(Boolean)))
    auth.destroySession(t);
  res.set('Set-Cookie', auth.clearCookie());
  res.json({ ok: true });
});

// Bewusst nur ja/nein: der Endpunkt liegt VOR der Anmeldung und darf ueber den
// Benutzer nichts verraten. Deshalb das Boolean um die Zeile herum.
app.get('/api/session', (req, res) => {
  res.json({ authenticated: Boolean(auth.sitzungsBenutzer(auth.sitzungsToken(req))) });
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
  /* HIER BEGINNT DIE FRIST, und nur hier: dies ist die eine Stelle, an der
     belegt ist, dass ein BROWSER den Schluessel in der Hand hat -- er steht im
     Fragment und kommt nur von dort.
     WEITERE AUFRUFE RUEHREN NICHTS AN: beginneTokenFrist schreibt nur
     herunter, nie hinauf. Wer neu laedt, steht deshalb nicht vor einem toten
     Link.
     NICHT in auth.pruefeToken: die wird auch von loeseTokenEin gerufen, und
     das Einloesen darf die Frist nicht noch einmal anfassen. */
  const minuten = auth.beginneTokenFrist(t.hash);
  res.json({
    username: t.username, ohnePasswort: t.ohnePasswort,
    minPassword: auth.PASSWORT_MIN, minuten
  });
});

/* Das Einloesen. Der Mindestwert von zehn Zeichen gilt unveraendert; die
   Regel steht in auth.loeseTokenEin.
   ANGEMELDET WIRD GLEICH MIT, wie bei /api/setup: das Passwort wurde ja
   gerade hier gewaehlt. Die Sitzung entsteht NACH dem Einloesen, also
   nachdem alle bisherigen gefallen sind. */
app.post('/api/token/einloesen', async (req, res) => {
  const ip = auth.clientIp(req);
  if (!await tokenBremseFrei(req, res)) return;
  const { token, passwort } = req.body || {};
  let ergebnis;
  try { ergebnis = await auth.loeseTokenEin(token, passwort); }
  catch (e) { auth.noteFailure(ip, null); return res.status(400).json({ error: e.message }); }
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
  if (auth.zweifaktorAn(ergebnis.id)) {
    return res.json({
      ok: true, username: ergebnis.username, zweifaktor: true,
      ...auth.erzeugeAnmeldeAusweis(ergebnis.id)
    });
  }
  auth.pruneSessions();
  res.set('Set-Cookie', auth.sessionCookie(req, auth.legeSitzungAn(ergebnis.id)));
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
const ANFRAGE_ANTWORT = { ok: true, meldung:
  'Danke. Wenn zu diesen Angaben eine Anfrage möglich war, hast du jetzt eine E-Mail ' +
  'bekommen — bitte bestätige darin deine Adresse. Danach entscheidet ein Admin.' };

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
  /* ERST DIE ANTWORT, DANN DER VERSAND (Begruendung bei
     versendeBestaetigung): ein Weg, der auf den Mailserver wartet, waere an
     der Uhr von einem still verworfenen zu unterscheiden.
     DAS AUFFANGNETZ IST KEINE ZIERDE -- hier haengt kein Aufrufer mehr an der
     Zusage. */
  if (klartext) {
    versendeBestaetigung(String(name).trim(), String(adresse).trim(), klartext)
      .catch(e => console.error('[Kriterion] Bestaetigungsmail:', e && e.message));
  }
});

/* Die Bestaetigung. SIE LEGT KEINEN ZUGANG AN, SETZT KEIN PASSWORT UND
   MELDET NIEMANDEN AN -- sie setzt einen Zeitpunkt in einer Zeile.
   ZWEI ANTWORTEN HIER, kein Widerspruch zur einen oben: dort raet jemand
   Namen, hier braeuchte er 256 Bit. Die Absage ist DIE EINE fuer alle Faelle.
   DER NAME STEHT AUCH IN DER GUTEN ANTWORT NICHT. */
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
   Eigentuemerfrage, darfAendern (Verfasser ODER Admin), nurSelbst (Verfasser,
   der Admin ausdruecklich NICHT).

   Die Eigentuemerfrage steht ZUERST, weil die Adminfrage sie ruft -- damit
   ist "ein Eigentuemer ist immer auch Admin" baulich wahr. */
function istEigentuemer(req) { return req.benutzer.role === 'eigentuemer'; }
function istAdmin(req) { return req.benutzer.role === 'admin' || istEigentuemer(req); }

const VERWEIGERT_ADMIN = 'Das verwaltet nur der Admin.';
const VERWEIGERT_EIGEN = 'Das kann nur der Eigentümer dieser Installation.';
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
     bilder     POST   /api/bilder/umstellen
     sicherung  POST   /api/sicherung/aufraeumen

   AUSDRUECKLICH NICHT DAHINTER: Sperren und Freigeben (umkehrbar), das
   Anlegen eines Zugangs (es nimmt niemandem etwas) und POST /api/setup (dort
   gibt es kein bisheriges Passwort).

   ZWEI FORMEN DESSELBEN AUFRUFS: der Waechter fuer die Routenzeile -- er MUSS
   es sein, wo multer dahinter steht -- und die Frage im Rumpf, wo erst der
   Rumpf sagt, ob ueberhaupt bestaetigt werden muss. */
const VERWEIGERT_BESTAETIGUNG = 'Dafür ist dein Passwort nötig — bitte noch einmal bestätigen.';

// true = weitermachen. Bei false ist die Antwort bereits geschrieben.
// 403 und NICHT 401: der Zugang gilt weiter, nur diese eine Handlung nicht.
// Ein 401 wuerfe die Oberflaeche auf die Anmeldeseite.
function zweiteBestaetigung(req, res, zweck, ziel = null) {
  const token = auth.sitzungsToken(req);
  if (auth.verbraucheFreigabe(token, zweck, ziel)) return true;
  res.status(403).json({ error: VERWEIGERT_BESTAETIGUNG, bestaetigung: zweck });
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
const zweiteBestaetigungNoetig = (zweck) => (req, res, next) => {
  const ziel = req.params.id !== undefined ? req.params.id
             : (req.query && req.query.teil !== undefined ? req.query.teil : null);
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
   settings steht, gilt als eingeschaltet -- damit kein Migrationscode.
   DER ADMIN KOMMT IMMER DURCH: ein Schalter, den er erst umlegen muesste,
   waere eine Schranke gegen sich selbst.
   DIE KLEMME SITZT HINTER DEM NACHSCHLAGEN DES VORHANDENEN NAMENS -- nur so
   bleibt "Zuweisen darf immer jeder" baulich wahr. */
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
  if (!z) { res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` }); return false; }
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
/* `rejectedGrund` STEHT MIT DABEI, UND DAS IST DIE GROBE HAELFTE DER KLEMME:
   an die Begruendung kommt ueberhaupt nur, wer den Eintrag aendern darf. Die
   feine Haelfte steht im Rumpf der Route -- umschreiben darf sie nur, wer sie
   getroffen hat. Ohne die grobe koennte jeder Angemeldete an einem Eintrag,
   dessen Ablehnung noch keinen Verfasser traegt, eine Begruendung hinsetzen. */
const NUR_VERFASSER_FELDER = ['title', 'description', 'rejected', 'rejectedGrund',
                              'tested', 'productCategoryId'];

/* Wer an einen fremden ZUGANG darf. Ein Admin ist der Sheriff im
   Dorf -- er legt Benutzer an, sperrt sie und loescht sie. An seinesgleichen
   kommt er nicht: koennte ein Admin einen anderen sperren, waere die
   Verwaltung ein Wettrennen, und der Schnellste bliebe allein uebrig.
   Die Regel steht hier und nirgends sonst; die vier Routen rufen sie. */
function darfAnZugang(req, ziel) {
  return ziel.role === 'user' ? istAdmin(req) : istEigentuemer(req);
}
const VERWEIGERT_ZUGANG = 'An einen Admin oder den Eigentümer kommt nur der Eigentümer dieser Installation.';
const VERWEIGERT_ROLLE = 'Rollen vergibt nur der Eigentümer dieser Installation.';
const VERWEIGERT_SELBST_ZUGANG = 'Den eigenen Zugang ändert man unter „Zugang“, nicht hier.';

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
  auth.beendeAndereSitzungen(req.benutzer.id, auth.sitzungsToken(req));
  res.json(ergebnis);
});

/* ---- Meine Sitzungen ----
   PERSOENLICH: EIN ADMIN SIEHT KEINE FREMDEN SITZUNGEN -- fuer den Ernstfall
   gibt es das Sperren, und setzeStatus loescht sie mit.
   Beide schreibenden Routen tragen die Art 'selbstbezug'.
   DIE FESTE ROUTE STEHT VOR DER PLATZHALTERROUTE (Stolperstein 11). */
app.get('/api/sessions', (req, res) => {
  const eigener = auth.sitzungsToken(req);
  res.json({ sitzungen: auth.sitzungenVon(req.benutzer.id, eigener), tage: auth.SESSION_DAYS });
});

app.delete('/api/sessions', (req, res) => {
  const eigener = auth.sitzungsToken(req);
  res.json({ beendet: auth.beendeAndereSitzungen(req.benutzer.id, eigener) });
});

app.delete('/api/sessions/:kennung', (req, res) => {
  const eigener = auth.sitzungsToken(req);
  // Die eigene ueber diesen Weg zu beenden waere ein zweiter Abmeldeweg neben
  // POST /api/logout -- und einer, nach dem die Oberflaeche weiterliefe, als
  // waere nichts gewesen.
  if (auth.sitzungsKennung(eigener || '') === String(req.params.kennung)) {
    return res.status(400).json({ error: 'Diese Sitzung beendest du über „Abmelden“.' });
  }
  const n = auth.beendeSitzung(req.benutzer.id, req.params.kennung);
  if (!n) return res.status(404).json({ error: 'Diese Sitzung gibt es nicht mehr.' });
  res.json({ beendet: n });
});

/* ---- Der zweite Faktor ----
   VIER SCHREIBENDE ROUTEN, ALLE DER ART 'selbstbezug': die Benutzernummer
   kommt aus req.benutzer und steht in keinem Pfad. Das ist die ganze
   Rechtefrage dieses Bereichs -- JEDER SCHALTET IHN FUER SICH SELBST EIN UND
   AUS, und es gibt keine Adresse, unter der ein Fremder gemeint waere.

   EINSCHALTEN GEHT IN ZWEI SCHRITTEN, und der zweite ist der Beleg:
     POST /api/zweifaktor/start  erzeugt das Geheimnis und gibt es EINMAL heraus
     POST /api/zweifaktor/an     nimmt einen Code aus der App entgegen und
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
   Faktor ja gerade gebaut.
   EIN ADMIN KOMMT HIER NICHT HEREIN: die Nummer kommt aus req.benutzer. Der
   einzige Weg daneben ist zugang.js auf dem Wirt. */
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
   nicht ein zweites Geheimnis. Die Art 'selbstbezug': der Benutzer kommt aus
   req.benutzer und nie aus der Adresse -- wer bestaetigt, bestaetigt fuer sich.

   DIE ANMELDEBREMSE GREIFT, dieselbe wie ueberall. Ohne sie waere diese Route
   ein Weg, ein Passwort ungebremst durchzuprobieren -- und zwar HINTER der
   Anmeldung, wo niemand hinsieht.

   DIE ABSAGE IST KLAR UND DEUTLICH, anders als an den Tokenrouten: dort weiss
   der Server nicht, wer fragt, hier ist der Fragende angemeldet und
   namentlich bekannt -- eine verschleierte Absage schuetzte niemanden. */
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
  const { passwort, zweck, ziel, ziele, code } = req.body || {};
  if (!auth.BESTAETIGUNG_ZWECKE.includes(zweck))
    return res.status(400).json({ error: 'Diesen Zweck gibt es nicht.' });
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
  let zielListe;
  if (ziele !== undefined) {
    if (ziel !== undefined)
      return res.status(400).json({ error: 'Entweder ein Ziel oder mehrere, nicht beides.' });
    if (!Array.isArray(ziele) || !ziele.length)
      return res.status(400).json({ error: 'Es fehlen die Ziele.' });
    /* Die Zahl der Ziele ist gedeckelt wie die Zahl der Teile: eine Bestellung
       ueber zehntausend Freigaben legte sie im Arbeitsspeicher ab und nichts
       raeumte sie vor ihrem Ablauf wieder weg.
       AUSTAUSCH_TEIL_MAX STEHT WEIT UNTEN, beim Teilexport selbst -- dort
       gehoert die Zahl hin, und dieselbe Grenze zweimal zu schreiben liefe
       auseinander. Zur Laufzeit ist sie laengst gesetzt: diese Zeile laeuft in
       einem Routenrumpf, nicht bei der Modulauswertung. */
    if (ziele.length > AUSTAUSCH_TEIL_MAX)
      return res.status(400).json({ error: `Mehr als ${AUSTAUSCH_TEIL_MAX} Ziele gibt es nicht.` });
    zielListe = ziele.map(z => Number(z));
    if (!zielListe.every(n => Number.isInteger(n) && n > 0))
      return res.status(400).json({ error: 'Jedes Ziel ist eine Nummer.' });
    // Doppelte sind ein Fehler und keine stillschweigend halbierte Bestellung:
    // wer zweimal dieselbe Nummer schickt, hat sich verzaehlt, und eine
    // Antwort mit weniger Freigaben als bestellt saehe aus wie ein Erfolg.
    if (new Set(zielListe).size !== zielListe.length)
      return res.status(400).json({ error: 'Ein Ziel steht doppelt in der Liste.' });
  } else zielListe = [ziel ?? null];
  const zeile = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.benutzer.id);
  if (!zeile || !await auth.pruefePasswort(String(passwort || ''), zeile.password_hash)) {
    auth.noteFailure(ip, name);
    // Die zweite der beiden Zeilen, bei denen das SCHEITERN der Vorgang ist.
    // Wer hier scheitert, sitzt an einer angemeldeten Sitzung und kennt das
    // Passwort nicht -- genau der Fall, gegen den diese Runde gebaut ist.
    auth.protokolliere('bestaetigung.fehl', { wer: req.benutzer.id, ziel: req.benutzer.id });
    return res.status(403).json({ error: 'Das Passwort stimmt nicht.' });
  }
  /* FRAGT DIESE STELLE ZUSAETZLICH DEN CODE -- aber NUR bei Zugaengen, die
     einen zweiten Faktor eingeschaltet haben.
     WARUM GERADE HIER: die zweite Bestaetigung verteidigt gegen die
     UEBERNOMMENE OFFENE SITZUNG, und genau dort traegt ein zweiter Faktor am
     meisten -- das Passwort mag mitgelesen sein, das Telefon liegt woanders.
     DIESE FRAGE FUEGT KEINEN ZWECK HINZU: es ist eine zweite Frage an
     derselben Stelle, kein weiterer Weg. (BESTAETIGUNG_ZWECKE steht seit
     0.19.0 bei acht -- der achte ist die Umstellung der Bildablage und
     kommt aus einer eigenen Route, nicht von hier.)
     DIE REIHENFOLGE IST PASSWORT, DANN CODE: wer das Passwort nicht hat, soll
     nicht erfahren, ob am Zugang ein Faktor haengt. */
  if (auth.zweifaktorAn(req.benutzer.id) && !auth.pruefeZweitenFaktor(req.benutzer.id, code)) {
    auth.noteFailure(ip, name);
    auth.protokolliere('bestaetigung.fehl', { wer: req.benutzer.id, ziel: req.benutzer.id });
    return res.status(403).json({ error: auth.ZWEITER_FAKTOR_ABSAGE, zweifaktor: true });
  }
  auth.noteSuccess(ip, name);
  const eigener = auth.sitzungsToken(req);
  try {
    // Alle Freigaben in EINER Antwort. `ziele` steht auch dann darin, wenn nur
    // eine bestellt war -- eine Antwort, deren Form von der Zahl abhaengt,
    // braeuchte auf der Gegenseite zwei Lesearten.
    let letzte;
    for (const z of zielListe) letzte = auth.erzeugeFreigabe(eigener, zweck, z);
    res.json({ ok: true, ...letzte, ziele: zielListe });
  } catch (e) { return res.status(400).json({ error: e.message }); }
});

/* ---- Das Sicherheitsprotokoll ----
   NUR DER EIGENTUEMER: es nennt Vorgaenge ueber andere Zugaenge, und ein
   Admin saehe darin die Verwaltungsvorgaenge des Eigentuemers ueber ihn
   selbst. Lesend, deshalb kein Eintrag in F_ROUTEN.
   ES GIBT KEINEN WEG HINAUS AUSSER DER FRIST -- eine Loeschroute waere ein
   Protokoll, das der Betroffene selbst wegraeumen kann.
   ZWEITE AUFRUFSTELLE DES AUFRAEUMENS; die erste steht beim Start. */
app.get('/api/sicherheitsprotokoll', nurEigentuemer, (req, res) => {
  auth.raeumeProtokollAuf();
  /* DIE AUSWAHL GEHT AN DEN SERVER und nicht an den Browser: die Karte holt
     die hundert JUENGSTEN Zeilen, und darin findet man die gescheiterten
     Anmeldungen nicht -- sie stehen zwischen allem anderen. Mit der Auswahl
     sind es die hundert juengsten DIESER Art.
     EIN UNBEKANNTER SCHLUESSEL IST EIN 400 und nicht stillschweigend "alles":
     ein Tippfehler saehe sonst aus wie ein Erfolg.
     LESEND WIE VORHER -- F_ROUTEN bleibt bei 69. */
  const gruppe = req.query.gruppe;
  if (gruppe !== undefined && !Object.prototype.hasOwnProperty.call(auth.PROTOKOLL_GRUPPEN, gruppe))
    return res.status(400).json({ error: 'Diese Ansicht gibt es nicht.' });
  res.json(auth.leseProtokoll(auth.PROTOKOLL_GRENZE, gruppe));
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
  if (!ziel) { res.status(404).json({ error: 'Diesen Benutzer gibt es nicht.' }); return null; }
  if (ziel.status === 'geloescht') {
    res.status(400).json({ error: 'Dieser Benutzer ist gelöscht.' }); return null;
  }
  if (!selbstErlaubt && ziel.id === req.benutzer.id) {
    res.status(403).json({ error: VERWEIGERT_SELBST_ZUGANG }); return null;
  }
  if (!darfAnZugang(req, ziel)) { res.status(403).json({ error: VERWEIGERT_ZUGANG }); return null; }
  return ziel;
}

app.get('/api/users', nurAdmin, (req, res) => {
  // Zweite Aufrufstelle des Aufraeumens; die erste steht beim Start. Dieselbe
  // Bauform wie bei raeumePapierkorbAuf(): eine Instanz, die monatelang
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
  if (!ziel) return res.status(404).json({ error: 'Diesen Benutzer gibt es nicht.' });
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

/* Der Link fuer einen VORHANDENEN Zugang -- einladen oder zuruecksetzen.
   zielZugangFrei entscheidet, damit gilt die Rollenleiter auch hier.
   DER SERVER GIBT NUR DEN TOKEN HERAUS, NICHT DEN LINK: die Adresse baut der
   Browser des Admins aus location. Aus dem Host-Kopf wird nichts abgeleitet.
   DAS IST DIE EINE ANTWORT, IN DER DER KLARTEXT STEHT. */
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

// Rolle, Status und Passwort. Drei Rechteklassen in einem Rumpf, alle vor
// dem ersten Schreiben geprueft:
//   Rolle    -- nur der Eigentuemer, auch am eigenen Zugang (sich selbst
//               herabstufen ist erlaubt, solange ein anderer Eigentuemer
//               bleibt; das haelt auth.setzeRolle fest).
//   Status   -- Admin an Benutzern, Eigentuemer an allen, nie am eigenen.
//   Passwort -- dieselbe Regel wie Status; das EIGENE laeuft ueber
//               PUT /api/account.
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

/* ---- Der Mailversand ----------------------------------------------------
   DREI ENDPUNKTE, EINE RECHTEZEILE: DER MAILZUGANG GEHOERT DEM EIGENTUEMER,
   GANZ -- eintragen, einsehen, Testmail.
     GET  /api/mail       nurEigentuemer. Lesend, kein F_ROUTEN.
     PUT  /api/mail       nurEigentuemer und zweitbestaetigt.
     POST /api/mail/test  nurEigentuemer -- an die EIGENE Adresse.

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
function mailKarte() {
  const roh = getSetting(mail.SCHLUESSEL, null);
  // Der Vergleich steht in mailtestStand() weiter oben -- eine
  // Rechnung, zwei Rufer (Stolperstein 145).
  const test = mailtestStand(roh);
  return {
    ...mail.zustand(roh),
    /* SAMT HINWEIS UND DEN DREI FESTEN WERTEN JE ANBIETER -- seit 0.17.3.
       Der Dialog wechselt mit der Auswahl beides, und beides steht in mail.js;
       zwei Ausfertigungen liefen auseinander (Stolperstein 102). */
    anbieterListe: mail.fuerDieAuswahl(),
    eingerichtet: mail.eingerichtet(roh),
    // Der ZUSTAND der oeffentlichen Adresse, nicht die Adresse selbst -- die
    // steht in der Karte "Zugaenge", wo der Link entsteht.
    adresseGesetzt: Boolean(OEFFENTLICHE.adresse),
    adresse: OEFFENTLICHE.adresse,
    fristMinuten: auth.TOKEN_FRIST_MINUTEN,
    getestetAm: test ? test.am : null,
    sekunden: Math.round(mail.VERSAND_MS / 1000),
    /* Die Folge der Testmarke fuer die Selbstanmeldung, : der
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
  /* DIE MARKE WIRD HIER AUSDRUECKLICH NICHT GELOESCHT: sie haengt am HASH
     UEBER DEN ZUGANG, den mailKarte() nachrechnet -- passt er nicht mehr,
     gilt sie nicht mehr. Ein zweites Loeschen waere eine zweite Wahrheit
     ueber dieselbe Frage. */
  res.json(mailKarte());
});

/* Die Testmail geht AN DIE EIGENE ADRESSE DES ANFORDERNDEN und nirgendwo
   sonst -- ein Knopf mit freiem Adressfeld waere ein offener Mailverteiler
   hinter einer Anmeldung. ES GIBT DESHALB KEIN ADRESSFELD: der Rumpf wird gar
   nicht angesehen. Ohne Adresse am Zugang wird abgesagt, mit dem Weg dorthin. */
app.post('/api/mail/test', nurEigentuemer, async (req, res) => {
  const eigener = auth.holeZugang(req.benutzer.id);
  if (!eigener || !eigener.email) {
    return res.status(400).json({ error:
      'Für dein Konto ist keine E-Mail-Adresse hinterlegt. Trag sie unter Einstellungen › ' +
      'Mein Konto ein — die Testmail geht ausschließlich an die eigene Adresse.' });
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
  // die Antwort. Ein 500 hiesse, die Instanz haette einen Fehler -- den hat der
  // Mailserver. Die Oberflaeche liest `ok` und nicht den Statuscode.
  res.json({ ok: e.ok, grund: e.grund, an: eigener.email, ...mailKarte() });
});

/* ---- Die Selbstanmeldung hinter der Anmeldung ---------------------------
   VIER ENDPUNKTE, EINE RECHTEZEILE: ADMIN -- sehen, schalten, freischalten,
   ablehnen. GET /api/anfragen ist lesend und steht nicht in F_ROUTEN.

   WARUM ADMIN UND NICHT EIGENTUEMER: aus einer Anfrage wird NIE etwas
   anderes als ein Zugang mit der Rolle 'user', und den legt der Admin ohnehin
   an. KEINE ZWEITE BESTAETIGUNG, aus demselben Grund wie bei POST /api/users.

   DER SCHALTER LEGT SICH NIE VON SELBST UM: einschalten geht nur bei
   bereitem Versand, AUSSCHALTEN GEHT IMMER. Geht der Versand spaeter kaputt,
   bleibt er an und die Karte sagt es rot. */
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
  // raeumeTokensAuf() -- eine Instanz, die monatelang durchlaeuft, raeumte
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
      'Die Registrierung lässt sich ohne funktionierenden Mailversand nicht einschalten. ' + b.grund });
  }
  putSetting.run('registrierung', JSON.stringify(an));
  res.json(anfragenKarte());
});

/* Die Freischaltung. AUS DER ANFRAGE WIRD EIN ZUGANG MIT DER ROLLE 'user' --
   die Rolle steht fest im Aufruf und wird an KEINER Stelle aus der Anfrage
   gelesen. NUR BESTAETIGTE ANFRAGEN, denn eine Nummer laesst sich tippen.
   ERST DER ZUGANG, DANN DER TOKEN, DANN DIE ZEILE WEG -- scheitert das
   Anlegen, bleibt die Anfrage stehen. Und dann erst der Versand. */
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
   kein Token, keine Mail. Eine Absagemail waere eine Benachrichtigung, und
   ein Weg, jemandem auf Zuruf Post zu schicken.
   DIE PROTOKOLLZEILE TRAEGT DEN NAMEN NICHT: sie haelt fest, WER abgelehnt
   hat und WANN -- der Name des Abgewiesenen ist Freitext von aussen. */
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
  aufgabeErledigt: 'Erledigt',
  /* DAS WORT FUER DEN ZWEITEN STERNKASTEN -- 0.21.0. Es steht hier und nicht
     im Quelltext der Oberflaeche, weil es dasselbe Recht hat wie „Eintrag"
     oder „Testtag": wer lieber „Erwartung" oder „Einschaetzung" sagt, stellt
     es in der Vokabularkarte um.
     ES WIRD NIRGENDS ZU EINEM WORT VERBAUT. „Potenzialkriterien" ginge,
     „Erwartungkriterien" nicht -- das Fugen-s kennt der Quelltext nicht.
     Ueberall also getrennt: „Potenzial: Kriterien", „Potenzial (hoch →
     niedrig)".
     PUT /api/settings saeubert ueber Object.keys(VOKABULAR_VORGABE) -- das
     neue Wort laeuft dort ohne eine weitere Zeile mit. */
  potenzial: 'Potenzial',
  /* DAS WORT FUER DEN ERSTEN STERNKASTEN, ALS PAAR -- 0.22.0 (Entscheidung
     E14). Seit 0.21.0 war „Potenzial" umbenennbar und sein Gegenstueck nicht;
     die Schieflage fiel genau dem auf, der die Umbenennung benutzt. Zwei
     Woerter und nicht eines, weil beide Zahlformen am Bildschirm stehen
     („2 Bewertungen", „Bewertung von Anna") -- wie bei sacheEinzahl und
     sacheMehrzahl.
     ES WIRD NIRGENDS ZU EINEM WORT VERBAUT, wie potenzial: die Karte heisst
     „Bewertung: Kriterien" und nicht „Bewertungskriterien". Dasselbe Fugen-s
     kennt der Quelltext nicht.
     PUT /api/settings saeubert ueber Object.keys(VOKABULAR_VORGABE) -- die
     beiden laufen dort ohne eine weitere Zeile mit; die Exportroute nimmt das
     Vokabular nicht mit, das Austauschformat bleibt 13. */
  bewertungEinzahl: 'Bewertung', bewertungMehrzahl: 'Bewertungen'
};
const SCHRIFT_STUFEN = [80, 90, 100, 110, 120];
/* DIE STUFEN DES BILDSTREIFENS, IN BILDPUNKTEN -- 0.22.0 (E11). Die Obergrenze
   150 ist keine Geschmacksfrage: das gespeicherte Vorschaubild hat 512 px auf
   der kurzen Kante, und darueber verliesse die Anzeige ihre Reserve. Kein
   Bestandslauf. */
const STREIFEN_STUFEN = [60, 80, 100, 120, 150];

// Anordnung und Einklappzustand der Bloecke in der Detailansicht. Verschoben
// wird nur innerhalb des jeweiligen Bereichs, deshalb zwei getrennte Listen.
const BLOCK_VORGABE = {
  // VORHER STEHT VOR NACHHER: geschaetzt wird, bevor bewertet wird, und die
  // Anordnung sagt es. Wer eine gespeicherte Reihenfolge hat, bekommt den
  // neuen Block ueber ordneBereich() hinten angehaengt -- die vorhandene
  // Regel, und sie bleibt. Ziehen laesst er sich wie jeder andere.
  seite: ['kategorie', 'tags', 'potenzial', 'bewertung'],
  unten: ['beschreibung', 'testtage', 'links', 'dateien', 'kommentare']
};
const ALLE_BLOECKE = [...BLOCK_VORGABE.seite, ...BLOCK_VORGABE.unten];

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
const BLOECKE_OHNE_ZU = ['potenzial', 'bewertung'];
const ZU_BLOECKE = ALLE_BLOECKE.filter(k => !BLOECKE_OHNE_ZU.includes(k));

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
    zu: (Array.isArray(g.zu) ? g.zu : []).filter(k => ZU_BLOECKE.includes(k))
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
// Die Liste steht hier und nicht in app.js: der Server speichert Schluessel,
// also muss er die Liste kennen.
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
// Sucheinstellungen. Vorrat, eigene Anbieter und Startanbieter bleiben global
// und Sache des Admins: der Admin kuratiert, der Benutzer bestimmt die Dichte.
const suchNamen = (benutzerId) => {
  const n = Number(getUserSetting(benutzerId, 'suchNamen', 2));
  return SUCHNAMEN_STUFEN.includes(n) ? n : 2;
};

// Persoenlich.
const schriftgroesse = (benutzerId) => {
  const n = Number(getUserSetting(benutzerId, 'schrift', 100));
  return SCHRIFT_STUFEN.includes(n) ? n : 100;
};
// Persoenlich, wie die Schrift: die Kachelgroesse im Bildstreifen (0.22.0).
const bildstreifen = (benutzerId) => {
  const n = Number(getUserSetting(benutzerId, 'streifen', 80));
  return STREIFEN_STUFEN.includes(n) ? n : 80;
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
const glockeGesehen = (benutzerId) => getUserSetting(benutzerId, 'glockeGesehen', null);

/* --- Die gespeicherten Ansichten -----------------------------------------
   MEHRERE BENANNTE FILTERSTELLUNGEN NEBEN DER EINEN, DIE ES SCHON GIBT.
   `filters` bleibt die zuletzt benutzte Stellung; die Ansichten stehen
   daneben und werden nur auf Zuruf gelesen. PERSOENLICH, GANZ.

   IN settings UND NICHT IN EINER EIGENEN TABELLE. Der Preis steht dabei:
   JSON kennt keine Kaskade, eine geloeschte Kategorie bleibt als Nummer
   stehen -- uebergangen wird das beim ANWENDEN und nicht beim Lesen.

   DER SUCHBEGRIFF GEHOERT DAZU. GEPRUEFT WIRD DIE FORM, NICHT DER INHALT:
   Deckel, Name und Groesse ja, welche Nummern es gibt weiss die Oberflaeche. */
const ANSICHTEN_DECKEL = 8;
const ANSICHT_NAME_LAENGE = 40;
const ANSICHT_BEGRIFF_LAENGE = 200;
const ANSICHTEN_ZEICHEN = 8000;
const ansichten = (benutzerId) => {
  const w = getUserSetting(benutzerId, 'ansichten', []);
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
  ansichten: ansichten(req.benutzer.id),
  // Der Deckel kommt vom Server, damit die Zahl an einer Stelle steht: die
  // Oberflaeche laesst danach den Knopf zum Speichern weg, und der Server
  // verweigert es ohnehin.
  ansichtenDeckel: ANSICHTEN_DECKEL,
  vokabular: vokabular(),
  schrift: schriftgroesse(req.benutzer.id),
  streifen: bildstreifen(req.benutzer.id),
  bloecke: bloecke(req.benutzer.id),
  linkZeilen: linkZeilen(req.benutzer.id),
  zeitleiste: zeitleisteAn(req.benutzer.id),
  /* DER BEZUGSPUNKT DER GLOCKE. Bis einschliesslich 0.16.0 stand
     `zuletztGesehen` daneben, der Merker der Pille „Neu seit ..."; er faellt
     mit ihr weg. Eine Antwort, die ein Feld weniger traegt, ist kein Bruch:
     die Oberflaeche wird im selben Dateisatz ausgeliefert. */
  glockeGesehen: glockeGesehen(req.benutzer.id),
  suche: suchvorlage(),
  suchAnbieter: suchAnbieter(),
  suchNamen: suchNamen(req.benutzer.id),
  // Abgeleitet beim Lesen, nicht in der Datenbank nachgetragen. Die Oberflaeche
  // laesst danach die Zeile "+ neu anlegen" weg; die Auswahl aus dem
  // Vorhandenen bleibt in jedem Fall stehen.
  tagsFreiAnlegen: freiAnlegen('tagsFreiAnlegen'),
  kategorienFreiAnlegen: freiAnlegen('kategorienFreiAnlegen'),
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
  zweifaktor: auth.zweifaktorAn(req.benutzer.id),
  // Die Frist des Papierkorbs. Sie steht HIER und nicht nur in
  // GET /api/papierkorb: den Loeschdialog sieht jeder, die Karte nur der
  // Admin. Eine Zahl, die die Oberflaeche selbst mitbraechte, waere eine
  // zweite Wahrheit ueber dieselbe Frist.
  papierkorbTage: PAPIERKORB_TAGE
}));

app.put('/api/settings', (req, res) => {
  /* Die Antwort mischt zwei Haelften, die Rechte auch: persoenliche
     Schluessel schreibt jeder fuer sich, Vokabular und Suchanbieter gehoeren
     dem Admin. ABGELEITET AUS EINER LISTE -- was nicht persoenlich ist, ist
     Adminsache, auch jeder Schluessel, der spaeter dazukommt.
     GEPRUEFT VOR DEM ERSTEN SCHREIBEN. */
  const fremd = Object.keys(req.body || {}).filter(k => !PERSOENLICHE_SCHLUESSEL.includes(k));
  if (fremd.length && !istAdmin(req))
    return res.status(403).json({ error: VERWEIGERT_ADMIN });
  /* DIE ENGERE FRAGE STEHT DANEBEN UND NICHT ANSTELLE DER OBEREN: was dem
     Eigentuemer gehoert, ist auch Adminsache -- nur eben nicht jedem Admin.
     BEIDE VOR DEM ERSTEN SCHREIBEN, aus demselben Grund wie die Ansichten
     weiter unten: eine Absage, die schon etwas geschrieben hat, waere
     schlimmer als gar keine. */
  const nurDemEigentuemer = Object.keys(req.body || {}).filter(k => EIGENTUEMER_SCHLUESSEL.includes(k));
  if (nurDemEigentuemer.length && !istEigentuemer(req))
    return res.status(403).json({ error: VERWEIGERT_EIGEN });

  /* DIE BEIDEN WERTE DER AUFRAEUMREGEL WERDEN HIER GEPRUEFT UND ERST WEITER
     UNTEN GESCHRIEBEN -- aus demselben Grund wie die Ansichten darunter: eine
     Absage, die schon etwas geschrieben hat, waere schlimmer als gar keine.
     DIE GRENZEN STEHEN AM SERVER UND NICHT NUR IM EINGABEFELD (Entscheidung 1
     der Runde 0.20.0): `min`/`max` im HTML ist eine Bitte, keine Klemme.
     GEPRUEFT MIT DERSELBEN FUNKTION WIE DIE VORSCHAU UND DAS LOESCHEN -- eine
     zweite Spanne daneben liefe auseinander. */
  const regelWerte = {};
  for (const [k, spanne, was] of [['sicherungBehalten', AUFRAEUM_BEHALTEN, 'Immer behalten'],
                                  ['sicherungTage', AUFRAEUM_TAGE, 'Erst löschen ab']]) {
    if (req.body[k] === undefined) continue;
    const g = pruefeRegelwert(req.body[k], spanne, was);
    if (g.fehler) return res.status(400).json({ error: g.fehler });
    regelWerte[k] = g.wert;
  }

  /* DIE ANSICHTEN WERDEN HIER GEPRUEFT UND ERST WEITER UNTEN GESCHRIEBEN --
     VOR dem ersten putUserSetting: eine Absage, die `filters` schon
     geschrieben hat, waere schlimmer als gar keine.
     GEPRUEFT WIRD DIE GANZE LISTE AUF EINMAL -- es ist EIN Schluessel mit
     EINEM Wert. */
  let ansichtenText = null;
  if (req.body.ansichten !== undefined) {
    const ein = Array.isArray(req.body.ansichten) ? req.body.ansichten : [];
    if (ein.length > ANSICHTEN_DECKEL)
      return res.status(400).json({
        error: `Höchstens ${ANSICHTEN_DECKEL} gespeicherte Ansichten.`
      });
    const sauber = [];
    const namen = new Set();
    for (const a of ein) {
      const name = a && typeof a.name === 'string'
        ? a.name.trim().slice(0, ANSICHT_NAME_LAENGE) : '';
      // Halb ausgefuellt gibt es nicht -- und wortlos verschlucken erst recht
      // nicht, sonst sucht man die Ansicht spaeter in der Liste.
      if (!name)
        return res.status(400).json({ error: 'Eine gespeicherte Ansicht braucht einen Namen.' });
      /* ZWEI ANSICHTEN MIT DEMSELBEN NAMEN SIND EINE ZU VIEL: der Name ist
         das Einzige, woran ein Mensch sie auseinanderhaelt. Verglichen wird
         ohne Ruecksicht auf Gross- und Kleinschreibung -- "Bosch" und "bosch"
         nebeneinander waeren dieselbe Falle mit einem Buchstaben Abstand. */
      const schluessel = name.toLowerCase();
      if (namen.has(schluessel))
        return res.status(400).json({ error: `„${name}" gibt es schon.` });
      namen.add(schluessel);
      sauber.push({
        name,
        q: a && typeof a.q === 'string' ? a.q.slice(0, ANSICHT_BEGRIFF_LAENGE) : '',
        filters: a && a.filters && typeof a.filters === 'object' ? a.filters : null
      });
    }
    ansichtenText = JSON.stringify(sauber);
    if (ansichtenText.length > ANSICHTEN_ZEICHEN)
      return res.status(400).json({ error: 'Die gespeicherten Ansichten sind zu umfangreich.' });
  }

  if (req.body.filters !== undefined)
    putUserSetting(req.benutzer.id, 'filters', JSON.stringify(req.body.filters));
  if (ansichtenText !== null)
    putUserSetting(req.benutzer.id, 'ansichten', ansichtenText);
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
  if (req.body.streifen !== undefined) {
    const n = Number(req.body.streifen);
    if (!STREIFEN_STUFEN.includes(n))
      return res.status(400).json({ error: 'Diese Größe für den Bildstreifen gibt es nicht.' });
    putUserSetting(req.benutzer.id, 'streifen', JSON.stringify(n));
  }
  if (req.body.bloecke !== undefined) {
    const ein = req.body.bloecke || {};
    putUserSetting(req.benutzer.id, 'bloecke', JSON.stringify({
      seite: ordneBereich(ein.seite, BLOCK_VORGABE.seite),
      unten: ordneBereich(ein.unten, BLOCK_VORGABE.unten),
      zu: (Array.isArray(ein.zu) ? ein.zu : []).filter(k => ZU_BLOECKE.includes(k))
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
    for (let i = 0; i < EIGEN_PLAETZE; i++) {
      const e = ein[i] || {};
      const name = suchnameSauber(e.name);
      const vorlage = typeof e.vorlage === 'string' ? e.vorlage.trim() : '';
      if (!name && !vorlage) { sauber.push(null); continue; }   // Platz geraeumt
      // Halb ausgefuellt gibt es nicht -- und wortlos verschlucken erst recht
      // nicht, sonst sucht man den Anbieter spaeter in der Liste.
      if (!name)
        return res.status(400).json({ error: 'Eine eigene Suchmaschine braucht einen Namen.' });
      if (!suchvorlageOk(vorlage))
        return res.status(400).json({
          error: 'Die Such-URL muss mit http:// oder https:// beginnen und %s als Platzhalter enthalten.'
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
      return res.status(400).json({ error: 'Mindestens eine Suchmaschine muss in der Auswahl bleiben.' });
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
  /* DER SCHALTER DER BILDABLAGE. Er geht denselben Weg wie die beiden
     darueber -- eine eigene schreibende Route liesse F_ROUTEN wachsen, ohne
     dass es etwas Neues zu bewachen gaebe. Die Rechtefrage steht ganz oben in
     EINER Zeile (EIGENTUEMER_SCHLUESSEL) und nicht hier ein zweites Mal. */
  if (req.body.bilderUmwandeln !== undefined)
    putSetting.run('bilderUmwandeln', JSON.stringify(!!req.body.bilderUmwandeln));
  /* DIE AUFRAEUMREGEL DER SICHERUNGEN, 0.20.0 -- derselbe Weg, dieselbe
     Rechtezeile (EIGENTUEMER_SCHLUESSEL ganz oben), und die beiden Zahlen
     sind oben schon geprueft. DER SCHALTER STEHT AUF AUS, wenn nichts
     dasteht: abgeleitet beim Lesen in aufraeumStand(), ohne Migrationscode. */
  if (req.body.sicherungAufraeumen !== undefined)
    putSetting.run('sicherungAufraeumen', JSON.stringify(!!req.body.sicherungAufraeumen));
  for (const [k, v] of Object.entries(regelWerte)) putSetting.run(k, JSON.stringify(v));
  res.json({ filters: getUserSetting(req.benutzer.id, 'filters', null), vokabular: vokabular(),
             ansichten: ansichten(req.benutzer.id), ansichtenDeckel: ANSICHTEN_DECKEL,
             schrift: schriftgroesse(req.benutzer.id), streifen: bildstreifen(req.benutzer.id),
             bloecke: bloecke(req.benutzer.id),
             linkZeilen: linkZeilen(req.benutzer.id), zeitleiste: zeitleisteAn(req.benutzer.id),
             suche: suchvorlage(), suchAnbieter: suchAnbieter(),
             suchNamen: suchNamen(req.benutzer.id),
             tagsFreiAnlegen: freiAnlegen('tagsFreiAnlegen'),
             kategorienFreiAnlegen: freiAnlegen('kategorienFreiAnlegen'),
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
const GEWICHT_MIN = 0.2, GEWICHT_MAX = 2.0;

/* ZU WELCHEM KASTEN EIN KRITERIUM GEHOEREN KANN -- 0.21.0. 'vorher' ist das
   Potenzial (die Einschaetzung, bevor etwas ausprobiert wurde), 'nachher' die
   Bewertung (das Urteil danach).
   DIE LISTE STEHT GENAU EINMAL, HIER UND NICHT AUCH IN db.js. Ein CHECK an der
   Spalte truege dieselbe Menge ein zweites Mal, und die zweite meldete sich
   nicht als Absage mit Meldung, sondern als abgebrochene Schreibung --
   dieselbe Ueberlegung wie bei GEWICHT_MIN/GEWICHT_MAX eine Zeile darueber.
   DEUTSCH, UND NICHT 'before'/'after': die Werte stehen in SELECTs, die
   jemand liest, und der Sprachwaechter liest mit. */
const PHASEN = ['vorher', 'nachher'];
const PHASE_VORGABE = 'nachher';

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
app.post('/api/criteria', nurAdmin, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Bitte einen Namen eingeben.' });
  /* DIE PHASE IST FREIWILLIG UND HAT DIE VORGABE 'nachher' -- so legt die
     Karte „Bewertungskriterien" weiter an, ohne ein Feld mitzuschicken.
     ETWAS ANDERES ALS DIE ZWEI WERTE IST EINE ABSAGE MIT MELDUNG und nicht
     ein stilles Zurechtbiegen: wer 'spaeter' schickt, meint etwas, das es
     nicht gibt, und ein auf 'nachher' gebogenes Kriterium stuende danach im
     falschen Kasten, ohne dass es jemand saehe. */
  const phase = req.body.phase === undefined ? PHASE_VORGABE : String(req.body.phase);
  if (!PHASEN.includes(phase))
    return res.status(400).json({ error: `Ein Kriterium gehört entweder zu „${vokabular().potenzial}“ ` +
      `oder zu „${vokabular().bewertungEinzahl}“.` });
  // UNIQUE(name) IST GLOBAL: ein Name, ein Kasten. Die Frage kennt deshalb
  // keine Phase -- „Wunsch" gibt es einmal oder gar nicht.
  if (db.prepare('SELECT 1 FROM rating_criteria WHERE name = ? COLLATE NOCASE').get(name))
    return res.status(409).json({ error: 'Dieses Kriterium gibt es bereits.' });
  const pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM rating_criteria').get().m + 1;
  const i = db.prepare('INSERT INTO rating_criteria (name, sort_order, phase) VALUES (?, ?, ?)')
    .run(name, pos, phase);
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
  if (!name) return res.status(400).json({ error: 'Bitte einen Namen eingeben.' });
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
    return res.status(400).json({ error: `Ob ein Kriterium zu ${vokabular().potenzial} oder ` +
      `${vokabular().bewertungEinzahl} gehört, lässt sich später nicht ändern.` });
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
  if (!name) return res.status(400).json({ error: 'Bitte einen Namen eingeben.' });
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
  if (!name) return res.status(400).json({ error: 'Bitte einen Namen eingeben.' });
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
  if (!name) return res.status(400).json({ error: 'Bitte einen Namen eingeben.' });
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
   Name haengt am Schalter. Ein gemeinsamer Helfer truege die Klemme in
   seinem eigenen Rumpf, und dann liesse sie sich nirgends gegenpruefen.
   Der Import geht an beiden vorbei. */
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
  if (!name) return res.status(400).json({ error: 'Bitte einen Tag eingeben.' });
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
// (Anpinnen schlaegt die Art), dann Aufgaben, Berichte, Notizen. Innerhalb
// jeder Gruppe steht das Aelteste oben; der Block der Angepinnten bleibt einer.
// Sortiert wird nach id, nicht nach created_at: innerhalb eines Eintrags
// stimmen beide immer ueberein, und created_at kommt bei einem Import
// ungeprueft aus der Datei und hat nur Sekundenaufloesung.
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
   EIN Ort, der das tut; die Gegenrichtung steht im Import.
   Geliefert wird ein OBJEKT und nicht der blosse Name: ein Grabstein traegt
   geloescht-<nr>, und die Oberflaeche bildet daraus "Geloeschter Benutzer 7".
   Eine HERRENLOSE Zeile bekommt ausdruecklich null -- das Feld fehlt nie,
   sonst waere "kein Verfasser" von "Feld unbekannt" nicht zu unterscheiden.
   Die Karte wird EINMAL je Anfrage gebaut und durchgereicht. */
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

/* Jeder Kommentar sagt, ob er MIR gehoert -- daran haengen fuenf
   Bedienelemente. Ohne die Angabe muesste die Oberflaeche aus dem
   Verfasserobjekt zurueckrechnen, und bei einem Grabstein ginge das nicht.
   KEIN VORGABEWERT fuer benutzerId: better-sqlite3 bindet ein fehlendes
   Argument still als NULL, und `null === null` waere hier wahr -- eine
   vergessene Aufrufstelle erklaerte jede herrenlose Zeile zur eigenen. */
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
const PHOTO_SPALTEN = 'id, item_id, mime_type, focus_x, focus_y, zoom, sort_order, created_at, art, dauer';
/* ---- DIE FASSUNG DER KACHEL -- 0.19.5 -------------------------------------

   SIE STEHT NEBEN DER LISTE UND NICHT IN IHR, und das hat einen Grund: die
   Liste darueber ist ZUGLEICH die Spaltenliste des deckenden Index
   `idx_photos_kachel`, und `length(thumb)` laesst sich nicht indizieren. Wer
   sie in PHOTO_SPALTEN schriebe, brauchte einen Index mit einer Spalte, die
   es nicht gibt -- und eine Pruefung, die beide gegeneinander haelt, wuerde
   rot, ohne dass etwas falsch waere.

   WOZU SIE UEBERHAUPT DA IST -- UND SIE IST KEINE KUER, SONDERN VORAUSSETZUNG.
   Die Auslieferung setzt `Cache-Control: private, max-age=86400`
   (anhaenge.js, gerufen mit maxAge: 86400 an /api/photos/:id/raw). Solange
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
const PHOTO_FASSUNG = 'length(thumb) AS fassung';
const qPhotos = db.prepare(`SELECT ${PHOTO_SPALTEN}, ${PHOTO_FASSUNG} FROM photos WHERE item_id = ? ORDER BY sort_order, id`);
/* DIESELBEN SPALTEN FUER ALLE EINTRAEGE AUF EINMAL -- die Uebersicht ruft sie,
   detail() ruft die Zeile darueber. DIE SPALTENLISTE STEHT AN EINER STELLE:
   liefe sie auseinander, traege die Kachel ein anderes Foto als der Eintrag.
   UND SIE IST ZUGLEICH DIE LISTE DES INDEX `idx_photos_kachel` -- fehlt dort
   eine, faellt der Index still aus. Eine Pruefung haelt beide gegeneinander. */
const qAlleFotos = db.prepare(`SELECT ${PHOTO_SPALTEN}, ${PHOTO_FASSUNG} FROM photos ORDER BY item_id, sort_order, id`);
/* `t.*` IST SEIT 0.19.3 EINE SPALTENLISTE, und das ist eine Wegnahme mit
   Nachweis: ein Schlagwort traegt id, name und created_at, und `created_at`
   wird in public/app.js an einem Schlagwort NIRGENDS gelesen -- nachgesehen,
   nicht geglaubt. Was niemand ansieht, wird zweimal bezahlt: beim Holen und
   beim Senden. Gemessen ueber 400 Eintraege: 3,76 -> 2,41 ms.
   DIE LISTE STEHT AN EINER STELLE, wie PHOTO_SPALTEN darueber: die
   gebuendelte Fassung fuer die Uebersicht und die einzelne fuer detail()
   muessen dieselben Spalten in derselben Folge lesen, sonst traegt die Kachel
   ein anderes Schlagwort als der Eintrag (Stolperstein 47). Eine Pruefung
   haelt beide gegeneinander. */
const TAG_SPALTEN = 't.id, t.name';
const qTags = db.prepare(`SELECT ${TAG_SPALTEN} FROM tags t JOIN item_tags it ON it.tag_id = t.id WHERE it.item_id = ? ORDER BY t.name COLLATE NOCASE`);
/* DIESELBEN SPALTEN FUER ALLE EINTRAEGE AUF EINMAL -- 0.19.3, dieselbe
   Bauform wie qAlleFotos. SORTIERT WIRD ZUERST NACH item_id UND DANN WIE
   BISHER: wer nur gruppiert und die zweite Ordnung vergisst, bekommt die
   Schlagworte einer Kachel in einer anderen Folge als am Eintrag.
   `item_id` FAELLT BEIM EINSORTIEREN WIEDER WEG -- es ist der Schluessel der
   Karte und kein Feld des Schlagworts; bliebe es stehen, truege die Kachel
   ein Feld, das der Eintrag nicht hat. */
const qAlleTags = db.prepare(`SELECT it.item_id, ${TAG_SPALTEN} FROM tags t
  JOIN item_tags it ON it.tag_id = t.id ORDER BY it.item_id, t.name COLLATE NOCASE`);
const qLinks = db.prepare('SELECT id, url, sort_order, created_at, user_id FROM links WHERE item_id = ? ORDER BY sort_order, id');
/* DIE UEBERSICHT ZAEHLT NUR -- 0.19.3. Sie hat bis 0.19.2 je Eintrag die
   VOLLEN Linkzeilen geholt (id, url, sort_order, created_at, user_id) und
   davon `.length` genommen; gebraucht wird an der Kachel allein `linkCount`.
   Gemessen ueber 400 Eintraege: 2,36 -> 0,47 ms.
   qLinks BLEIBT UND WIRD WEITER GEBRAUCHT: detail() zeigt die Adressen mit
   ihren Verfassern, und dort ist die Zeilenzahl einstellig. */
const qLinkZahlen = db.prepare('SELECT item_id, COUNT(*) n FROM links GROUP BY item_id');
const qCat = db.prepare('SELECT id, name FROM product_categories WHERE id = ?');
/* Und dieselbe Frage fuer die ganze Liste. Es sind wenige Zeilen, und sie
   stehen ohnehin gleich wieder da: eine Abfrage je Eintrag holte dieselbe
   Kategorie hundertmal. */
const qAlleKategorien = db.prepare('SELECT id, name FROM product_categories');
/* --- Schnitt und Anzahl je Kriterium --------------------------------------
   EINE Abfrage, gruppiert -- ausdruecklich KEIN zweiter JOIN AUF `ratings`
   neben dem in detail(): zwei JOINs auf DIESELBE Tabelle vervielfachen sich,
   drei Bewerter ergaeben einen neunfachen Zaehler. Der JOIN auf
   `rating_criteria` trifft dagegen genau eine Zeile.
   DAS GEWICHT REIST AN DER SCHNITTZEILE MIT -- so kann der Nenner des
   Gesamtschnitts gar nicht aus einer anderen Menge entstehen als der Zaehler.
   Gezaehlt wird ueber Werte > 0: eine zurueckgesetzte Zeile ist keine Stimme. */
const qSchnittJeKriterium = db.prepare(`
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
   DERSELBEN Menge -- dieselbe bauliche Antwort, mit der gesamtSchnitt() seit
   jeher verhindert, dass der Nenner aus einer anderen Menge kommt als der
   Zaehler.
   EINE ABFRAGE UND NICHT ZWEI: zwei Abfragen mit zwei WHERE-Zusaetzen liefen
   ueber dieselbe Tabelle und koennten auseinanderlaufen; hier faellt jede
   Zeile in genau einen der beiden Kaesten, und zwar an einer Stelle. */
function karteJePhase(zeilen) {
  const kasten = { vorher: new Map(), nachher: new Map() };
  for (const z of zeilen) {
    // Ein unbekannter Wert in der Spalte kaeme nur aus einer Schreibung an
    // PHASEN vorbei. Er faellt in keinen der beiden Kaesten, statt still im
    // falschen zu landen.
    if (kasten[z.phase]) kasten[z.phase].set(z.criterion_id, z);
  }
  return kasten;
}

function schnitteJeKriterium(itemId) {
  return karteJePhase(qSchnittJeKriterium.all(itemId));
}

/* DIESELBE ABFRAGE FUER ALLE EINTRAEGE AUF EINMAL -- 0.19.3. Es ist Zeile fuer
   Zeile dieselbe: derselbe JOIN, dasselbe `value > 0`, dieselbe Gruppierung --
   nur steht `r.item_id` mit in SELECT und GROUP BY, und das WHERE auf den
   einen Eintrag faellt weg. Gemessen ueber 400 Eintraege: 4,18 -> 2,70 ms.
   ZWEI FASSUNGEN, EINE RECHNUNG: was herauskommt, geht durch DENSELBEN
   gesamtSchnitt() wie in detail(). Zwei Rechenwege fuer dieselbe Kopfzahl
   waeren zwei Wahrheiten (Stolperstein 47); zwei Abfragen mit demselben
   Ergebnis sind es nicht -- eine Pruefung haelt sie gegeneinander. */
const qSchnittJeKriteriumAlle = db.prepare(`
  SELECT r.item_id, r.criterion_id, AVG(r.value * 1.0) AS schnitt, COUNT(*) AS anzahl,
         c.gewicht, c.phase
    FROM ratings r JOIN rating_criteria c ON c.id = r.criterion_id
   WHERE r.value > 0
   GROUP BY r.item_id, r.criterion_id, c.gewicht, c.phase`);

// Je Eintrag DIESELBEN ZWEI KARTEN wie am einzelnen -- ueber denselben
// karteJePhase(). Ein zweiter Schnitt nach Phase, hier frisch geschrieben,
// waere die zweite Wahrheit, die schon die zwei Abfragen vermeiden.
function schnitteJeEintrag() {
  const roh = new Map();
  for (const z of qSchnittJeKriteriumAlle.all()) {
    if (!roh.has(z.item_id)) roh.set(z.item_id, []);
    roh.get(z.item_id).push(z);
  }
  const alle = new Map();
  for (const [itemId, zeilen] of roh) alle.set(itemId, karteJePhase(zeilen));
  return alle;
}

// Was ein Eintrag OHNE eine einzige Sternzeile mitbringt -- zwei leere Kaesten.
// Es steht hier, weil die Uebersicht es fuer jeden Eintrag ohne Bewertung
// braucht und `new Map()` dort die falsche Gestalt haette.
const LEERE_KAESTEN = () => ({ vorher: new Map(), nachher: new Map() });

/* Wer welchen Wert vergeben hat -- je Kriterium eine Liste. Wieder eine
   EIGENE Abfrage, Begruendung bei qSchnittJeKriterium. Nur Werte > 0.
   Die id steht mit dabei: ohne sie waere DELETE /api/ratings/:id vom
   Bildschirm aus nicht erreichbar. `mine` statt der Verfassernummer. */
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
// `rechenweg` IST FREIWILLIG: die Uebersicht rechnet denselben Schnitt fuer
// tausend Eintraege und braucht keine Aufstellung dazu.
function gesamtSchnitt(karte, rechenweg) {
  let zaehler = 0, nenner = 0;
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
  let gleichZaehler = 0;
  const zeilen = [];
  for (const z of karte.values()) {
    const produkt = z.schnitt * z.gewicht;
    zaehler += produkt; nenner += z.gewicht;
    gleichZaehler += z.schnitt;
    zeilen.push({ criterionId: z.criterion_id, schnitt: z.schnitt, gewicht: z.gewicht, produkt });
  }
  // UNGERUNDET, wie hier gerechnet wird. Gerundet wird genau einmal, unten am
  // Ergebnis -- die Oberflaeche rundet nur noch fuer die Anzeige und sagt das
  // auch. Ginge der Weg gerundet hinaus, ergaebe die Aufstellung am Bildschirm
  // eine andere Zahl als die Instanz rechnet.
  // DIE VERGLEICHSZAHL WIRD DAGEGEN HIER GERUNDET, und zwar genau einmal: sie
  // hat keine Zahl darueber, an der sie sonst haengen koennte. Der ungerundete
  // Quotient reist daneben mit, wie beim gewichteten Ergebnis auch.
  if (rechenweg) Object.assign(rechenweg,
    { zeilen, summe: zaehler, teiler: nenner, roh: nenner ? zaehler / nenner : null,
      gleichSumme: gleichZaehler, gleichTeiler: zeilen.length,
      gleichRoh: zeilen.length ? gleichZaehler / zeilen.length : null,
      gleichErgebnis: zeilen.length
        ? Math.round((gleichZaehler / zeilen.length) * 10) / 10 : null });
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
// die user_id.
// KEIN VORGABEWERT fuer benutzerId: better-sqlite3 bindet ein fehlendes
// Argument still als NULL, und "user_id = NULL" ist in SQL nie wahr -- eine
// vergessene Aufrufstelle lieferte wortlos lauter fremde Punkte.
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
const qAlleTestTageSchmal = db.prepare(
  'SELECT item_id, id, day, rating, user_id FROM test_days ORDER BY item_id, day DESC, id DESC');

function testTageJeEintrag(benutzerId) {
  if (benutzerId == null) throw new Error('testTageJeEintrag() ohne Benutzer aufgerufen');
  const je = new Map();
  for (const t of qAlleTestTageSchmal.all()) {
    if (!je.has(t.item_id)) je.set(t.item_id, []);
    // mine kommt vom Server, wie in qTestDays(): die Zeitleiste zeichnet die
    // eigenen Punkte gefuellt und fremde als Ring. Die Verfassernummer geht
    // nicht hinaus -- hier so wenig wie dort.
    je.get(t.item_id).push({ id: t.id, day: t.day, rating: t.rating,
                             mine: t.user_id === benutzerId });
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

const qMeinPin = db.prepare('SELECT 1 FROM item_pins WHERE user_id = ? AND item_id = ?');

// detail() braucht den Benutzer: "favorite" heisst "habe ICH als Favorit
// markiert" -- dieselbe Antwort sieht fuer zwei Leute verschieden aus.
// KEIN VORGABEWERT: better-sqlite3 bindet ein FEHLENDES Argument still als
// NULL (nur zu WENIGE werfen). Ein Aufruf ohne Benutzer lieferte ueberall
// wortlos favorite: false. Die Klemme ist die EINZIGE Schicht darunter.
function detail(id, benutzerId) {
  if (benutzerId == null) throw new Error('detail() ohne Benutzer aufgerufen');
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!it) return null;
  // EINMAL je Aufruf: Eintrag, Kommentare, Testtage und Stimmen greifen alle
  // darauf zu.
  const karte = verfasserKarte();
  it.rejected = !!it.rejected; it.tested = !!it.tested;
  it.verfasser = verfasserAus(karte, it.user_id);
  /* WEM DER EINTRAG GEHOERT, SAGT DER SERVER -- wie am Kommentar, an der
     Linkzeile und am Anhang. Die Oberflaeche kennt nur ihren NAMEN und nicht
     ihre Nummer; aus einem Grabstein liesse sich ohnehin nichts
     zurueckrechnen, er hat keinen Namen mehr. */
  it.mine = it.user_id === benutzerId;
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
  it.rejectedMine = it.rejected_von != null && it.rejected_von === benutzerId;
  /* WER ABGELEHNT HAT, GEHT ALS VERFASSEROBJEKT HINAUS UND NIE ALS NUMMER --
     dieselbe Abbildung wie am Eintrag, am Kommentar und am Testtag, und
     dieselbe EINE Stelle: aus einem Grabstein wird damit "Geloeschter
     Benutzer 7" und nicht sein freigegebener Name.
     rejected_at und rejected_grund bleiben, wie sie in der Zeile stehen; ein
     leeres Feld heisst "nicht bekannt" und wird hier nicht gefuellt. */
  it.rejectedVerfasser = verfasserAus(karte, it.rejected_von);
  delete it.rejected_von;
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
  /* Die Linkzeile sagt wie Kommentar, Testtag und Stimme, wem sie gehoert --
     an `mine` haengt das Loeschkreuz, und bei einem Grabstein liesse es sich
     aus dem Verfasserobjekt nicht zurueckrechnen.
     created_at bleibt in der Antwort: es traegt den Ueberfahrtext.
     WER DEN NAMEN ZEIGT, entscheidet die Oberflaeche. */
  it.links = qLinks.all(id).map(l => ({
    id: l.id, url: l.url, sort_order: l.sort_order, created_at: l.created_at,
    mine: l.user_id === benutzerId, verfasser: verfasserAus(karte, l.user_id)
  }));
  it.tags = qTags.all(id);
  it.testDays = qTestDays(id, benutzerId, karte);
  it.comments = qComments(id, benutzerId, karte);
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
    ORDER BY c.sort_order, c.id`).all(id, benutzerId);
  // Neben der eigenen Zeile stehen Schnitt und Zahl der Bewerter ueber alle
  // -- angehaengt aus der gruppierten Abfrage, nicht aus einem zweiten JOIN.
  // Ein Kriterium, das niemand bewertet hat, bekommt avg: null und count: 0.
  const schnitte = schnitteJeKriterium(id);
  // WER WELCHEN WERT VERGEBEN HAT, STEHT HIER AUSDRUECKLICH NICHT: diese
  // Antwort geht an jeden, und eine Angabe darueber, wie eine EINZELNE PERSON
  // bewertet hat, ist mehr, als eine Bewertung aussagen soll. Die Liste holt
  // der Admin ueber GET /api/items/:id/stimmen. avg und count bleiben.
  for (const r of it.ratings) {
    // Aus dem Kasten, zu dem das Kriterium gehoert. Ein Griff in den anderen
    // ginge ins Leere -- die beiden Karten teilen keine Kennung.
    const kasten = schnitte[r.phase];
    const z = kasten && kasten.get(r.criterion_id);
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
     ist die ganze Zweiteilung. Kein zweiter gesamtSchnitt(), kein Schalter in
     ihm, keine Fallunterscheidung: die Funktion sieht gar nicht, welchen
     Kasten sie gerade rechnet.
     UND DER RECHENWEG ENTSTEHT BEIDE MALE IN DER RECHNUNG UND NICHT DANEBEN
     (Stolperstein 217): die Erklaerung der Kopfzahl gibt es in beiden
     Kaesten, also braucht sie es auch beide Male. */
  const rechenweg = {};
  it.avgRating = gesamtSchnitt(schnitte.nachher, rechenweg);
  it.rechenweg = { ...rechenweg, ergebnis: it.avgRating };
  const potenzialRechenweg = {};
  it.potenzialRating = gesamtSchnitt(schnitte.vorher, potenzialRechenweg);
  it.potenzialRechenweg = { ...potenzialRechenweg, ergebnis: it.potenzialRating };
  Object.assign(it, testStats(id));
  return it;
}

const qMeinePins = db.prepare('SELECT item_id FROM item_pins WHERE user_id = ?');
const qAlleItems = db.prepare('SELECT * FROM items ORDER BY updated_at DESC');
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
const qAnhangZahlen = db.prepare('SELECT item_id, COUNT(*) n FROM attachments GROUP BY item_id');

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
   und der Suchbegriff ist nie leer (volltextBegriff schneidet ihn zu, und ein
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
const VOLLTEXT_QUELLEN = [
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
const qVolltext = db.prepare(`
  SELECT i.id,
         ${VOLLTEXT_QUELLEN.map(q => `${q.wert} AS f_${q.schluessel}`).join(',\n         ')}
    FROM items i
    LEFT JOIN product_categories c ON c.id = i.product_category_id
   WHERE ${VOLLTEXT_QUELLEN.map(q => `(${q.wert}) IS NOT NULL`).join('\n      OR ')}`);

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
const AUSSCHNITT_LAENGE = 56;
const AUSSCHNITT_VORLAUF = 4;

/* WEISSRAUM WIRD EINGEEBNET -- ABER NUR IM TEXT UND NIE IM BEGRIFF. Ein
   Kommentar traegt Absaetze; die Kachelzeile ist EINE Zeile.
   DER BEGRIFF DAGEGEN WIRD GENOMMEN, WIE ER GETIPPT UND GETRIMMT IST, weil
   genau so auch gesucht wurde: instr() vergleicht Zeichen fuer Zeichen. Wer
   ihn hier zusaetzlich einebnete, suchte im Ausschnitt nach etwas anderem als
   im Bestand -- und die Oberflaeche, die den Begriff im Ausschnitt wiederfinden
   muss, haette eine dritte Lesart. */
const einZeilig = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

function ausschnitt(text, begriff) {
  const t = einZeilig(text);
  const b = String(begriff ?? '');
  if (!b) return t.slice(0, AUSSCHNITT_LAENGE);
  const stelle = t.toLowerCase().indexOf(b.toLowerCase());
  /* GEFUNDEN WIRD SIE HIER NORMALERWEISE WIEDER -- gesucht hat SQLite auf dem
     Rohtext, geschnitten wird auf dem eingeebneten. Ein Begriff, der selbst
     einen doppelten Leerraum traegt, ist danach nicht mehr zu finden; dann
     steht der Anfang des Textes da statt gar nichts. Ein stiller Fehlgriff
     waere ein Ausschnitt OHNE die Fundstelle -- der Anfang ist wenigstens
     wahr. */
  const von = stelle < 0 ? 0 : Math.max(0, stelle - AUSSCHNITT_VORLAUF);
  const bis = von + AUSSCHNITT_LAENGE;
  return (von > 0 ? '…' : '') + t.slice(von, bis) + (bis < t.length ? '…' : '');
}

/* DER BEGRIFF WIRD GENAU SO ZUGESCHNITTEN WIE VORHER IM BROWSER: aussen
   getrimmt, klein geschrieben. Ein Begriff, von dem danach nichts uebrig ist,
   ist KEINE Suche und keine Suche ohne Treffer -- die Liste bleibt dann die
   ganze Liste. Zurueck kommt eine Abbildung Nummer -> Trefferkontext und
   keine Reihenfolge: sortiert wird die Liste selbst, an einer Stelle. */
const volltextBegriff = (roh) => (typeof roh === 'string' ? roh.trim().toLowerCase() : '');

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
const volltextTreffer = (begriff) => new Map(qVolltext.all({ q: begriff }).map(r => {
  const getroffen = VOLLTEXT_QUELLEN.filter(q => r['f_' + q.schluessel] != null);
  const erste = getroffen[0];
  return [r.id, erste ? {
    quelle: erste.schluessel,
    text: ausschnitt(r['f_' + erste.schluessel], begriff),
    weitere: getroffen.length - 1
  } : null];
}));

/* ---- ZWEI ZAHLEN, DIE MIT DER LISTE MITREISEN -- 0.16.0 ----------------
   BEIDE HAENGEN AN EINER ANTWORT, DIE ES OHNEHIN GIBT, und das ist der ganze
   Punkt. Der Zaehler „Offen 7" war in 0.8.60 genau daran gescheitert: er
   haette bei JEDEM Seitenaufbau einen eigenen Weg gefragt. Hier faellt kein
   zusaetzlicher Abruf an -- die Uebersicht holt diese Liste ohnehin.

   JE EINE GRUPPENABFRAGE FUER DIE GANZE LISTE, nicht eine je Eintrag: bei
   tausend Eintraegen waeren das zweitausend Abfragen fuer zwei Zahlen.
   Dieselbe Ueberlegung wie bei qMeinePins und verfasserKarte() darunter. */
const qOffenJeEintrag = db.prepare(
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
   Ueberlegung wie bei qOffenJeEintrag darueber.
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
const qNeueKommentare = db.prepare(
  `SELECT item_id, user_id, COUNT(*) AS n FROM comments
    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id, user_id`);
const qNeueBewertungen = db.prepare(
  `SELECT item_id, user_id, COUNT(*) AS n FROM ratings
    WHERE gesetzt_am IS NOT NULL AND gesetzt_am > ? AND value > 0 AND user_id IS NOT ?
    GROUP BY item_id, user_id`);

app.get('/api/items', (req, res) => {
  let rows = qAlleItems.all();
  const begriff = volltextBegriff(req.query.q);
  /* DIE FUNDSTELLEN KOMMEN AUS DERSELBEN ABFRAGE WIE DER FILTER -- kein
     zweiter Weg und keine Abfrage je Eintrag. Ohne Begriff bleibt die
     Abbildung leer, und weiter unten faellt das Feld damit aus der Antwort. */
  const fundstellen = begriff ? volltextTreffer(begriff) : new Map();
  if (begriff) rows = rows.filter(r => fundstellen.has(r.id));
  /* DIE ZEITLEISTE EINMAL FUER DIE GANZE LISTE GEFRAGT, nicht je Eintrag:
     eine persoenliche Einstellung aendert sich innerhalb einer Antwort nicht.
     Ist sie aus, faellt `testDays` aus der Antwort -- gemessen 6 Prozent.
     AUS DER LISTENANTWORT LIEST DAS FELD GENAU EINE STELLE, zeitleistePunkte();
     Kachel und Vergleich rechnen aus anderen Feldern. */
  const zeitleiste = zeitleisteAn(req.benutzer.id);
  // Eine Abfrage fuer die ganze Liste statt einer je Zeile. Die
  // Sortierung bleibt updated_at fuer alle -- die Uebersicht zeigt, wo etwas
  // geschieht, nicht wo ich zuletzt war. Nach vorn zieht der eigene Favorit
  // erst in der Oberflaeche, und nur fuer den, dem er gehoert.
  const meinePins = new Set(qMeinePins.all(req.benutzer.id).map(p => p.item_id));
  // Einmal fuer die ganze Liste, nicht je Eintrag -- sonst stuende dieselbe
  // Abfrage bei hundert Eintraegen hundertmal.
  const karte = verfasserKarte();
  const offenJe = new Map(qOffenJeEintrag.all().map(z => [z.item_id, z.n]));
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
  const bezug = glockeGesehen(req.benutzer.id);
  const neuKommJe = new Map(), neuBewJe = new Map(), neuVonJe = new Map();
  if (bezug) {
    /* WER EINEN KOMMENTAR GESCHRIEBEN HAT -- je Eintrag eine Menge von
       Zugangsnummern. Eine Nummer, die zweimal vorkommt, steht einmal darin:
       die Tafel sagt, WER, nicht wie oft. `null` bleibt drin -- eine
       herrenlose Zeile hat ihren Verfasser verloren, und das ist etwas anderes
       als „niemand".
       AUS DEN KOMMENTAREN UND AUSDRUECKLICH NICHT AUS DEN BEWERTUNGEN, und das
       ist keine Nachlaessigkeit: WER WELCHE BEWERTUNG ABGEGEBEN HAT, IST EINE
       ANGABE UEBER EINZELNE PERSONEN. Sie geht aus keiner Antwort hinaus, die
       jeder bekommt -- die Liste „Wer hat bewertet" holt der Admin ueber einen
       eigenen Weg (GET /api/items/:id/stimmen), und die Zeile am Eintrag zeigt
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
    for (const z of qNeueKommentare.all(bezug, req.benutzer.id)) {
      neuKommJe.set(z.item_id, (neuKommJe.get(z.item_id) || 0) + z.n);
      wer(z.item_id, z.user_id);
    }
    for (const z of qNeueBewertungen.all(bezug, req.benutzer.id))
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
  const fotosJe = new Map();
  for (const f of qAlleFotos.all()) {
    if (!fotosJe.has(f.item_id)) fotosJe.set(f.item_id, []);
    fotosJe.get(f.item_id).push(f);
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
       schnitteJeKriterium         400
       testStats                   400
       qTestDays -> qTestDaysRoh   400
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
  const tagsJe = new Map();
  for (const z of qAlleTags.all()) {
    if (!tagsJe.has(z.item_id)) tagsJe.set(z.item_id, []);
    tagsJe.get(z.item_id).push(z);
    delete z.item_id;
  }
  const linkZahlJe = new Map(qLinkZahlen.all().map(z => [z.item_id, z.n]));
  const anhangZahlJe = new Map(qAnhangZahlen.all().map(z => [z.item_id, z.n]));
  const schnitteJe = schnitteJeEintrag();
  const katJe = new Map(qAlleKategorien.all().map(k => [k.id, k]));
  // Die Testtage nur, wenn die Zeitleiste ueberhaupt an ist -- wie bisher.
  const testTageJe = zeitleiste ? testTageJeEintrag(req.benutzer.id) : null;
  for (const it of rows) {
    it.rejected = !!it.rejected; it.tested = !!it.tested;
    it.verfasser = verfasserAus(karte, it.user_id);
    delete it.user_id;
    it.favorite = meinePins.has(it.id);
    const ph = fotosJe.get(it.id) || [];
    // Das erste Element ist das Hauptbild, gleich welcher Art -- bei einem
    // Video steht dort sein Standbild. Die beiden Zaehler daneben sind
    // getrennt: photoCount zaehlt Fotos und hat damit dieselbe Bedeutung wie
    // vorher, videoCount ist der neue Nachbar. Zusammengezaehlt hiesse ein
    // Video kuenftig "Foto", und eine aeltere Oberflaeche laese es falsch.
    it.mainPhoto = ph[0] || null;
    it.photoCount = ph.filter(p2 => p2.art !== 'video').length;
    it.videoCount = ph.filter(p2 => p2.art === 'video').length;
    it.category = it.product_category_id ? (katJe.get(it.product_category_id) || null) : null;
    it.tags = tagsJe.get(it.id) || [];
    /* NUR DIE ZAHL, NICHT DIE ZEILEN. Bis 0.19.2 holte die Uebersicht je
       Eintrag die vollen Linkzeilen und nahm davon `.length` -- die Kachel
       zeigt nichts davon ausser dieser Zahl. */
    it.linkCount = linkZahlJe.get(it.id) || 0;
    it.attachmentCount = anhangZahlJe.get(it.id) || 0;
    // Dieselbe Rechnung wie in detail(), ueber denselben Helfer. Zwei
    // Rechenwege fuer die Kachel und die Zeile daneben waeren zwei Wahrheiten
    // ueber dieselbe Zahl. Was sich geaendert hat, ist woher die Karte kommt --
    // nicht, was mit ihr geschieht.
    const kaesten = schnitteJe.get(it.id) || LEERE_KAESTEN();
    it.avgRating = gesamtSchnitt(kaesten.nachher);
    /* DIE ZWEITE ZAHL STEHT NEBEN DER ERSTEN UND NICHT STATT IHRER -- auch an
       einem getesteten Eintrag. Welche die Kachel zeigt, entscheidet der
       Browser; welche es GIBT, entscheidet der Bestand. Eine Antwort, die je
       nach `tested` mal die eine und mal die andere traegt, machte aus dem
       Sortieren nach Potenzial eine Sortierung ueber eine luckenhafte Menge. */
    it.potenzialRating = gesamtSchnitt(kaesten.vorher);
    Object.assign(it, testStats(it.id));
    /* DIE ZEITLEISTE BRAUCHT DIE TESTTAGE SELBST, nicht nur ihre Anzahl -- und
       dazu, wem sie gehoeren. Ohne sie braucht die Liste sie nicht.
       SEIT 0.19.3 IN DER SCHMALEN FASSUNG: id, day, rating, mine. Die
       Schlagworte und der Verfasser jedes Testtags stehen weiter am EINTRAG
       (detail() ruft qTestDays), nur nicht mehr in der Liste -- gelesen hat
       sie dort niemand. Die Begruendung steht bei qAlleTestTageSchmal. */
    if (zeitleiste) it.testDays = testTageJe.get(it.id) || [];
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
       ihre eigene Liste ueber /api/offen -- die braucht die Texte, nicht nur
       die Zahl. Gerechnet wird beides aus DERSELBEN Bedingung (kind = 'task'),
       sonst naennten Knopf und Ansicht zwei verschiedene Zahlen. */
    it.offeneAufgaben = offenJe.get(it.id) || 0;
    /* DER TREFFERKONTEXT -- 0.18.0. WARUM EIN EINTRAG IN DER TREFFERLISTE
       STEHT, und zwar nur dann, wenn wirklich gesucht wurde: ohne Begriff
       faellt das Feld ganz aus der Antwort, wie testDays es bei
       ausgeschalteter Zeitleiste vormacht. Ein leeres Feld waere eine dritte
       Lage neben „getroffen" und „gar nicht gesucht".
       ES IST EINE ERWEITERUNG UND KEINE WEGNAHME: was vorher in der Antwort
       stand, steht Zeichen fuer Zeichen weiter da. */
    if (begriff) it.fundstelle = fundstellen.get(it.id);
    /* DREI ANGABEN, UND SIE STEHEN ODER FEHLEN GEMEINSAM. Die Verfasser gehen
       als dieselben Objekte hinaus wie ueberall sonst -- aus verfasserKarte(),
       nicht als nackte Zugangsnummern. */
    if (bezug) it.neuKommentare = neuKommJe.get(it.id) || 0;
    if (bezug) it.neuBewertungen = neuBewJe.get(it.id) || 0;
    if (bezug) it.neuVon = [...(neuVonJe.get(it.id) || [])].map(uid => verfasserAus(karte, uid));
  }
  res.json(rows);
});

app.get('/api/items/:id', (req, res) => {
  const it = detail(req.params.id, req.benutzer.id);
  if (!it) return res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` });
  res.json(it);
});

app.post('/api/items', (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Bitte einen Titel eingeben.' });
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
const GRUND_LAENGE = 200;
const grundText = (v) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, GRUND_LAENGE) : '';

app.put('/api/items/:id', (req, res) => {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!it) return res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` });
  const b = req.body || {};

  /* DIESE ROUTE TRAEGT ZWEI RECHTEKLASSEN IN EINEM RUMPF, und das ist
     verlangt: `favorite` ist persoenlich -- jeder setzt seinen eigenen an
     jedem Eintrag, auch an einem fremden (item_pins). Alles andere gehoert
     dem Verfasser und dem Admin. Deshalb sitzt die Klemme hier und nicht als
     Waechter vor der Route.
     UND SIE SITZT VOR DEM ERSTEN SCHREIBEN: eine Absage, die den Favoriten
     schon gesetzt hat, waere schlimmer als gar keine. */
  const nurVerfasserFelder = NUR_VERFASSER_FELDER.filter(f => b[f] !== undefined);
  if (nurVerfasserFelder.length && !darfAendern(req, it.user_id))
    return res.status(403).json({ error: VERWEIGERT_EINTRAG });

  /* ---- Die Klemme an der Begruendung ----
     ZURUECKNEHMEN DARF DAS MERKMAL, WER DEN EINTRAG AENDERN DARF; UMSCHREIBEN
     DARF DIE BEGRUENDUNG NUR, WER SIE GETROFFEN HAT. Das ist `nurSelbst` --
     "Loeschen ja, umschreiben nein" --, angewandt auf ein Feld, das nicht dem
     Verfasser des EINTRAGS gehoert, sondern dem der ENTSCHEIDUNG. Beide sind
     nicht dasselbe: `rejected` steht hinter darfAendern, ein Admin kann also
     einen fremden Eintrag ablehnen, und dann steht SEIN Name unter der
     Begruendung.
     ES IST EINE VERSCHAERFUNG GEGENUEBER 0.13.2, wo an diesen Feldern
     durchweg darfAendern galt.

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
     0.14.0 `nurSelbst` fuer JEDES Schreiben -- damit konnte ein Admin eine
     fremde Begruendung weder umschreiben noch entfernen, und das war strenger
     als ueberall sonst im Haus. Die Zuruecknahme steht hier ausdruecklich
     dabei, damit sie nicht als Versehen wiederkommt.
     WAS "ENTFERNEN" HEISST, ENTSCHEIDET `grundText()` UND NICHT DER ROHWERT:
     ein Rumpf mit lauter Leerzeichen ist ein Entfernen, und ein zweiter
     Massstab daneben liefe damit auseinander.
     DIE KLEMME DAFUER IST `darfAendern`, UND SIE IST SCHON DURCH: die Zeile
     oben laesst `rejectedGrund` nur passieren, wer den Eintrag aendern darf.
     Hier bleibt deshalb nur, den strengeren Fall zu ueberspringen -- keine
     zweite Klemme daneben. */
  const schaltetEin = b.rejected !== undefined && !!b.rejected && !it.rejected;
  const entferntGrund = b.rejectedGrund !== undefined && !grundText(b.rejectedGrund);
  if (b.rejectedGrund !== undefined && !schaltetEin && !entferntGrund &&
      it.rejected_von != null && !nurSelbst(req, it.rejected_von))
    return res.status(403).json({ error: VERWEIGERT_SELBST });

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
     anderen Person, und das ist genau das, was nurSelbst verhindern soll.
     DAS DATUM KOMMT VOM SERVER UND NIE AUS DEM RUMPF, wie updated_at daneben.
     BEIM AUSSCHALTEN WIRD NICHTS GELOESCHT: die drei bleiben stehen. Eine
     Angabe, die niemand wiederherstellen kann, wird nicht weggeworfen, nur
     weil ein Schalter umgelegt wird -- und der Dialog bietet die alte
     Begruendung beim erneuten Ablehnen als Vorschlag an.
     WIRD NUR DIE BEGRUENDUNG NACHGETRAGEN, bleibt rejected_at leer, wenn es
     leer war: ein nachgetragener Grund erfindet kein Datum. Nur der
     Verfasser wird gesetzt, und auch das nur, wenn keiner dasteht. */
  if (schaltetEin) {
    // datetime('now') wie an created_at und updated_at daneben: die Zeit
    // kommt aus der Datenbank und nie aus dem Rumpf -- und auch nicht aus
    // einer zweiten Quelle in JS, die um Sekunden danebenlaege.
    sets.push(`rejected_at = datetime('now')`);
    put('rejected_von', req.benutzer.id);
    put('rejected_grund', grundText(b.rejectedGrund));
  } else if (b.rejectedGrund !== undefined) {
    put('rejected_grund', grundText(b.rejectedGrund));
    /* WER ENTFERNT, WIRD NICHT VERFASSER. Der Zweig traegt einen Verfasser
       nach, wo keiner steht -- das ist der Fall einer Ablehnung aus einer
       Instanz vor 0.14.0, in der jemand einen Text hinschreibt. Ein leeres Feld
       hat keinen Verfasser, und wer es leert, hat nichts geschrieben. */
    if (it.rejected_von == null && !entferntGrund) put('rejected_von', req.benutzer.id);
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
      return res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` });
    let pos = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM photos WHERE item_id = ?')
      .get(req.params.id).m + 1;
    const ins = db.prepare('INSERT INTO photos (item_id, mime_type, data, thumb, medium, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    for (const f of req.files || []) {
      if (!await rasterBild(f.buffer))
        return res.status(400).json({ error: 'Nur Bilddateien sind erlaubt' });
      /* DIE ABLEITUNGEN KOMMEN AUS DER VORLAGE, NICHT AUS DER ABLAGEFASSUNG.
         Beide Wege ergaeben dasselbe Bild -- `nearLossless` weicht hoechstens
         um 2 von 255 ab --, aber ein zweites Dekodieren waere Arbeit ohne
         Ertrag, und die Ausrichtung (.rotate()) liest EXIF, das in der
         WebP-Fassung nicht mehr steht. */
      const v = await makeVariants(f.buffer, VORGABE_ZUSCHNITT);
      /* STRG+V UND DATEIAUSWAHL SIND HIER DERSELBE WEG, und das ist Absicht:
         in `req.files` steht eine Datei und sonst nichts -- der Server kann
         die beiden gar nicht unterscheiden, und ein Feld im Formular waere
         eine BEHAUPTUNG des Browsers darueber, wie das Archiv speichern soll.
         Er braucht die Unterscheidung auch nicht: die Zwischenablage liefert
         IMMER PNG, eine Kamera JPEG. Die Regel „PNG umwandeln, JPEG in Ruhe
         lassen" trifft damit genau das, was gemeint ist. */
      const ab = bilderUmwandeln() ? await legeBildAb(f.buffer, f.mimetype)
                                   : { data: f.buffer, mime: f.mimetype };
      ins.run(req.params.id, ab.mime, ab.data, v.thumb, v.medium, pos++);
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
        return res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` });
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
      /* AUCH DAS STANDBILD WIRD ZUGESCHNITTEN -- 0.19.5, mit den Vorgaben. Die
         Videokachel wird mit `object-fit: cover` gezeigt wie jede andere;
         eine ungeschnittene truege die Kachel, die der Bestandslauf beim
         naechsten Start ohnehin ersetzt. `medium` bleibt ungeschnitten und
         ist der Poster des Abspielers. */
      const v = await makeVariants(standbild.buffer, VORGABE_ZUSCHNITT);
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

/* Der ausgelieferte Typ kommt aus den ersten Bytes, nie aus photos.mime_type:
   die Spalte ist eine Angabe des Hochladenden. Damit ist auch geschuetzt, was
   schon in der Datenbank liegt -- dieselbe Regel wie in anhaenge.js.
   Bei einem Video ist der Blob je nach Groesse etwas anderes: mit size= das
   Standbild, ohne die Videodatei; der Erkenner sieht das den Bytes an.
   BEREICHE NUR AM VIDEO UND NUR AN DER GANZEN DATEI. */
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
const ANZEIGEWERTE = {
  focus_x: { min: 0, max: 100, vorgabe: 50, stellen: 1 },
  focus_y: { min: 0, max: 100, vorgabe: 50, stellen: 1 },
  // Ganze Prozent: ein Ausschnitt von 137,4 % ist keine Angabe, die jemand
  // machen wollte, und der Schieber kann sie gar nicht erzeugen.
  zoom:    { min: ZOOM_MIN, max: ZOOM_MAX, vorgabe: ZOOM_MIN, stellen: 0 }
};
// null heisst "das war keine Zahl". Was das wert ist, entscheidet der Rufer.
function anzeigeWert(name, roh) {
  const g = ANZEIGEWERTE[name];
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
const VORGABE_ZUSCHNITT = { fx: ANZEIGEWERTE.focus_x.vorgabe,
                            fy: ANZEIGEWERTE.focus_y.vorgabe,
                            zoom: ANZEIGEWERTE.zoom.vorgabe };

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
   erneuereEineKachel() in bestandslauf.js: das Erzeugen 157,3 ms im Median und
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
   ZWEIMAL ANTWORTEN GEHT NICHT: `einmal()` haelt es fest. Ein zweites
   res.json() waere ERR_HTTP_HEADERS_SENT und naehme den Server mit. */
const ERNEUERUNGSFRIST_MS = 15000;
function erneuereKachel(id, fertig) {
  let raus = false;
  const einmal = () => { if (!raus) { raus = true; clearTimeout(uhr); fertig(); } };
  const uhr = setTimeout(einmal, ERNEUERUNGSFRIST_MS);
  /* DIE UHR DARF DEN PROZESS NICHT AM LEBEN HALTEN: sie ist eine Schranke und
     kein Termin. Ohne unref() haengt ein Herunterfahren bis zu 15 Sekunden. */
  uhr.unref?.();
  try { starteBestandsThread('zuschnitt', [{ id: Number(id) }], einmal); }
  catch (e) { console.error('[Kriterion] Kachel nicht erneuert:', e.message); einmal(); }
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
  if (!p) return res.status(404).json({ error: 'Dieses Foto gibt es nicht mehr.' });
  // Die Eintragsnummer kommt erst aus der Kindzeile -- deshalb die
  // zweite Form desselben Aufrufs, nicht eine zweite Regel.
  if (!eintragFrei(req, res, p.item_id)) return;
  const x = anzeigeWert('focus_x', req.body.x), y = anzeigeWert('focus_y', req.body.y);
  if (x === null || y === null) return res.status(400).json({ error: 'Dieser Bildausschnitt ist ungültig.' });
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
    z = anzeigeWert('zoom', req.body.zoom);
    if (z === null) return res.status(400).json({ error: 'Dieser Bildausschnitt ist ungültig.' });
  }
  db.prepare('UPDATE photos SET focus_x = ?, focus_y = ?, zoom = ? WHERE id = ?')
    .run(x, y, z, req.params.id);
  touch.run(p.item_id);
  /* ERST ERZEUGEN, DANN ANTWORTEN. detail() steht IM Abschluss und nicht
     davor: es liest `length(thumb)` als Fassung mit, und die soll die NEUE
     sein -- sonst zeigte der Browser die alte Kachel unter der alten Adresse
     weiter, und der ganze Schritt waere umsonst. */
  erneuereKachel(req.params.id, () => res.json(detail(p.item_id, req.benutzer.id)));
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
      return res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` });
    const da = db.prepare('SELECT COUNT(*) n FROM attachments WHERE item_id = ?').get(req.params.id).n;
    const neu = (req.files || []).length;
    if (da + neu > ANHANG_ZAHL)
      return res.status(400).json({ error: `Höchstens ${ANHANG_ZAHL} Dateien je ${vokabular().sacheEinzahl}.` });
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
  if (!a) return res.status(404).json({ error: 'Diese Datei gibt es nicht mehr.' });
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
  if (!a) return res.status(404).json({ error: 'Diese Datei gibt es nicht mehr.' });
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
  if (!p) return res.status(404).json({ error: 'Dieses Foto gibt es nicht mehr.' });
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
  if (!url) return res.status(400).json({ error: 'Bitte eine Adresse oder einen Suchbegriff eingeben.' });
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` });
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
   (darfAendern), nicht nach dem Eintrag: wer einen Link in einen fremden
   Eintrag setzt, muss ihn auch wieder herausnehmen koennen. Ein geloeschter
   Link bekommt KEINEN Vermerk -- er ist eine ganze Aussage, die geht. */
app.delete('/api/links/:id', (req, res) => {
  const l = db.prepare('SELECT * FROM links WHERE id = ?').get(req.params.id);
  if (!l) return res.status(404).json({ error: 'Diesen Link gibt es nicht mehr.' });
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
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Die Note muss zwischen 1 und 5 liegen.' });
  const today = new Date().toISOString().slice(0, 10);
  if (day > today) return res.status(400).json({ error: 'Das Datum kann nicht in der Zukunft liegen.' });
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` });

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
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Die Note muss zwischen 1 und 5 liegen.' });
  const t = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: `${vokabular().zeitpunktEinzahl} nicht gefunden.` });
  if (!nurSelbst(req, t.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
  db.prepare('UPDATE test_days SET rating = ? WHERE id = ?').run(rating, req.params.id);
  touch.run(t.item_id);
  res.json(detail(t.item_id, req.benutzer.id));
});

app.delete('/api/test-days/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: `${vokabular().zeitpunktEinzahl} nicht gefunden.` });
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
  if (!name) return res.status(400).json({ error: 'Bitte einen Tag eingeben.' });
  const t = db.prepare('SELECT * FROM test_days WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: `${vokabular().zeitpunktEinzahl} nicht gefunden.` });
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
  if (!t) return res.status(404).json({ error: `${vokabular().zeitpunktEinzahl} nicht gefunden.` });
  if (!nurSelbst(req, t.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
  db.prepare('DELETE FROM test_day_tags WHERE test_day_id = ? AND tag_id = ?').run(t.id, req.params.tagId);
  touch.run(t.item_id);
  res.json(detail(t.item_id, req.benutzer.id));
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
const qKritPhase = db.prepare('SELECT phase FROM rating_criteria WHERE id = ?');
const qItemGetestet = db.prepare('SELECT tested FROM items WHERE id = ?');

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
    const krit = qKritPhase.get(req.body.criterionId);
    const eintrag = qItemGetestet.get(req.params.id);
    if (krit && krit.phase === 'nachher' && eintrag && !eintrag.tested)
      return res.status(400).json({
        error: 'Vor dem Test wird nicht bewertet — dieser Eintrag steht auf „ungetestet".' });
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
app.get('/api/items/:id/stimmen', nurAdmin, (req, res) => {
  const stimmen = stimmenJeKriterium(req.params.id, req.benutzer.id, verfasserKarte());
  res.json([...stimmen].map(([criterion_id, liste]) => ({ criterion_id, stimmen: liste })));
});

/* Eine EINZELNE fremde Bewertung entfernen. Die beiden Wege darueber
   brauchen keine Klemme, weil sie baulich nur die eigene Zeile treffen; HIER
   steht eine fremde Nummer in der Adresse.
   darfAendern und nicht nurSelbst: loeschen darf der Admin. Ein Weg, den
   fremden WERT zu aendern, entsteht ausdruecklich nicht -- die Note ist die
   Aussage der Zeile. Loeschen ja, umschreiben nein. */
app.delete('/api/ratings/:id', (req, res) => {
  const r = db.prepare('SELECT id, item_id, user_id FROM ratings WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: `${vokabular().bewertungEinzahl} nicht gefunden.` });
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
    if (!text) return res.status(400).json({ error: 'Bitte einen Text eingeben.' });
    if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(req.params.id))
      return res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` });

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
  if (!c) return res.status(404).json({ error: 'Diesen Kommentar gibt es nicht mehr.' });

  /* DIE ZWEITE ROUTE MIT ZWEI RECHTEKLASSEN IN EINEM RUMPF.
       TEXT          -- nur der Verfasser, AUCH DER ADMIN NICHT.
       ART/ANPINNUNG -- Verfasser oder Admin. Die Anpinnung wirkt auf die
                        Sortierung fuer ALLE, aendert aber keine Aussage und
                        ist jederzeit umkehrbar.
     Beide Fragen stehen VOR dem ersten UPDATE. */
  if (req.body.text !== undefined && !nurSelbst(req, c.user_id))
    return res.status(403).json({ error: VERWEIGERT_SELBST });
  if ((req.body.kind !== undefined || req.body.pinned !== undefined) && !darfAendern(req, c.user_id))
    return res.status(403).json({ error: VERWEIGERT_SELBST });

  if (req.body.text !== undefined) {
    const text = String(req.body.text).trim();
    if (!text) return res.status(400).json({ error: 'Bitte einen Text eingeben.' });
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
    if (!c) return res.status(404).json({ error: 'Diesen Kommentar gibt es nicht mehr.' });
    // HINZUFUEGEN nur der Verfasser -- ein Bild an einem fremden
    // Kommentar waere ein Zusatz zu einer fremden Aussage. Das Entfernen darf
    // der Admin (siehe die Loeschroute weiter unten); der Unterschied ist
    // Absicht und ausdruecklich entschieden.
    if (!nurSelbst(req, c.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
    const da = db.prepare('SELECT COUNT(*) n FROM comment_images WHERE comment_id = ?').get(c.id).n;
    if (da + (req.files || []).length > BILD_ZAHL)
      return res.status(400).json({ error: `Höchstens ${BILD_ZAHL} Bilder je Kommentar.` });
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
  if (!b) return res.status(404).json({ error: 'Dieses Bild gibt es nicht mehr.' });
  if (!darfAendern(req, b.user_id)) return res.status(403).json({ error: VERWEIGERT_SELBST });
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
   ohnehin in jedem Eintrag. Der Haken laeuft ueber PUT /api/comments/:id.
   DIESELBE BEDINGUNG WIE IN DER DETAILANSICHT (`kind = 'task'`): wer
   `kind != 'done'` schriebe, naehme Notizen und Berichte mit.
   SORTIERT WIE DIE UEBERSICHT; die Gruppierung macht die Oberflaeche.
   `mine` haengt an JEDER Zeile -- daran haengt der Haken. */
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
// Datenbank ist -- eine Aussage ueber die Instanz als Ganzes. Lesend, deshalb
// kein Eintrag in F_ROUTEN.
// Der Schluesselwert weiter unten im Rumpf bleibt eine ZWEITE, engere Klemme:
// den bekommt nur der Eigentuemer.
app.get('/api/stats', nurAdmin, (req, res) => {
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
  const arten = qBildArten.all().map(z => z.a);
  const p = { n: 0, o: 0 }, vi = { n: 0, o: 0 };
  const bildFormate = {};
  /* DIE EXPORTGROESSE DER BILDER FAELLT HIER MIT AB. Sie stand bis 0.19.1 in
     zwei eigenen Abfragen mit `WHERE art != 'video'` und kostete damit
     dasselbe zweite und dritte Mal -- gemessen 1363 und 1310 ms. Es ist
     dieselbe Summe, die eine Zeile hoeher schon gebildet wird; sie hier
     mitzunehmen ist kein zweiter Rechenweg, sondern die Abschaffung eines
     zweiten. */
  let exportFotoBytes = 0, exportVideoBytes = 0;
  for (const art of arten) {
    const z = qJeArt.get(art);
    if (art === 'video') {
      vi.n += z.n; vi.o += z.o;
      exportVideoBytes += qVideoExportBytes.get(art).n;
      continue;
    }
    p.n += z.n; p.o += z.o;
    exportFotoBytes += z.o;
    /* AUSDRUECKLICH OHNE VIDEOS: bei einer Videozeile traegt `data` die
       Videodatei -- ihr Format gehoert in keine Zeile, die „Fotos am Eintrag
       nach Format" ueberschrieben ist. Die Videos stehen wie bisher als eigene
       Zahl daneben. */
    for (const g of qJeFormat.all(art)) {
      const k = formatAusMime(g.m);
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
    umstellung: bestandsStand('umstellung'),
    /* DER ZWEITE LAUF SEIT 0.19.4, und er steht als EIGENES Feld daneben und
       nicht im selben: die Karte muss auseinanderhalten koennen, was gerade
       laeuft. */
    geometrie: bestandsStand('geometrie'),
    /* DIE ERWARTETE EXPORTGROESSE, je Schalter getrennt. Sie steht hier als
       AUFTEILUNG und nicht als eine Summe: die Karte darunter hat drei
       Schalter, und wer nur eine Gesamtzahl bekaeme, koennte an keinem
       einzelnen Knopf sagen, was er auslöst.
       DIE GRENZEN GEHEN MIT. Ohne sie muesste die Oberflaeche 300 MB und
       512 MB selbst kennen, und dann staende dieselbe Zahl an zwei Orten. */
    export: {
      umschlag: austauschUmschlagBytes(null),
      /* DIE BILDBYTES KOMMEN AUS DER SCHLEIFE OBEN und nicht aus zwei eigenen
         Abfragen. Bis 0.19.1 rief diese Zeile austauschTeile(null, …), und das
         stellte dieselbe teure Frage nach `art != 'video'` ein zweites und
         drittes Mal -- gemessen 1363 und 1310 ms zusaetzlich zu den 1343 der
         Aufteilung selbst. Es ist DIESELBE Summe; sie hier weiterzureichen ist
         die Abschaffung eines zweiten Rechenwegs und nicht die Einfuehrung
         eines (Stolperstein 47).
         DIE UEBRIGEN ZWEI TEILE bleiben bei austauschTeile(): `attachments`
         und `comment_images` tragen ihre Blobs als LETZTE Spalte und kosten
         gemessen 1,2 und 0,1 ms. */
      ...austauschTeile(null, { mitDateien: true }),
      fotos: Math.round(exportFotoBytes * 4 / 3),
      videos: Math.round(exportVideoBytes * 4 / 3),
      /* DREI ZAHLEN UND NICHT ZWEI, weil sie drei verschiedene Dinge sagen:
         `warnAb`  ab hier steht ein Hinweis -- geschaetzt, nimmt nichts weg.
         `grenze`  ab hier sagt die Route ab -- unsere Marge, mit Luft davor.
         `string`  so lang kann ein Text in Node ueberhaupt werden -- gemessen.
         GENANNT WIRD IN JEDER MELDUNG DIE LETZTE. Die beiden anderen sind
         unsere Entscheidungen; nur `string` ist eine Tatsache, und eine
         Meldung, die unsere Marge als Tatsache ausgibt, sagt die Unwahrheit. */
      warnAb: AUSTAUSCH_WARN, grenze: AUSTAUSCH_MAX, string: AUSTAUSCH_STRING
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
app.post('/api/bilder/umstellen', nurEigentuemer, zweiteBestaetigungNoetig('bilder'), (req, res) => {
  /* ZWEIMAL DRUECKEN STARTET NICHT ZWEIMAL. Zwei Schleifen ueber dieselben
     Zeilen taeten der zweiten nichts (nach der ersten ist kein PNG mehr da),
     aber sie liefen doppelt, und der gemeldete Fortschritt waere der der
     zuletzt gestarteten. Eine Absage ist ehrlicher als eine zweite Schleife. */
  if (bestandsStaende.umstellung && bestandsStaende.umstellung.laeuft)
    return res.status(409).json({ error: 'Die Umstellung läuft schon.' });
  const zeilen = qOffenePNG.all(PNG_MAGIE_HEX);
  bestandsStaende.umstellung = { laeuft: true, gesamt: zeilen.length, erledigt: 0,
                                 umgestellt: 0, geblieben: 0, gespart: 0 };
  console.log(`[Kriterion] Bildumstellung gestartet: ${zeilen.length} PNG.`);
  res.status(202).json(bestandsStand('umstellung'));
  /* DIE ANTWORT IST SCHON HINAUS, WENN DER THREAD ANFAENGT -- seit 0.19.3
     laeuft die Schleife nicht mehr hier, sondern in bestandslauf.js. Was der
     Aufrufer bekommt, ist unveraendert: 202 mit dem Anfangsstand, und der
     Fortschritt geht weiter als Feld in /api/stats.
     DAS NETZ GEGEN DAS, WAS DANEBEN SCHIEFGEHEN KANN, HAENGT JETZT AM THREAD
     (worker.on('error') in starteBestandsThread) statt an einem catch: eine
     unbehandelte Zusage naehme in Node den ganzen Server mit, ein Fehler im
     Thread nimmt nur den Lauf. */
  starteBestandsThread('umstellung', zeilen);
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
const AUSTAUSCH_FORMAT = 13;

// Die Grenze, an der eine Exportdatei zerbraeche, mit Luft davor. Sie steht
// hier und nicht als Zahl im Rumpf: der Wert kommt aus Node und nicht aus
// einer Schaetzung.
const AUSTAUSCH_STRING = require('buffer').constants.MAX_STRING_LENGTH;
const AUSTAUSCH_MAX = Math.floor(AUSTAUSCH_STRING * 0.9);

/* Der Wert, ab dem die Instanz WARNT -- deutlich unter der Grenze, an der sie
   ABSAGT. Die beiden Zahlen haben verschiedene Aufgaben und duerfen deshalb
   nicht dieselbe sein:
     AUSTAUSCH_MAX  ist gemessen -- daran zerbricht der String.
     AUSTAUSCH_WARN ist geschaetzt -- davor soll jemand die Sicherung nehmen.
   DIE LUFT DAZWISCHEN IST DER PREIS DER SCHAETZUNG. Sie deckt den Umschlag,
   die Base64-Rundung auf ein Vielfaches von vier und den Text, den keine
   Blob-Spalte traegt. Wer bei 300 MB gewarnt wird, hat noch rund 180 MB
   Spielraum, bevor es wirklich kippt -- und wer die Warnung wegklickt, bekommt
   seine Datei trotzdem. */
const AUSTAUSCH_WARN = 300 * 1024 * 1024;

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
   Stellen benutzt -- statt vier LEFT JOINs auf users.
   Der Name wird geliefert, NICHT die Id: eine nackte Id waere in einer Datei,
   die das Haus verlaesst, eine Angabe ueber eine Person ohne jeden Nutzen.
   Eine herrenlose Zeile steht ausdruecklich als null da. */
function verfasserNamen() {
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
    rejected_author: verfasserName(it.rejected_von),
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
    o.photos = db.prepare('SELECT mime_type, data, thumb, medium, focus_x, focus_y, zoom, art, dauer FROM photos WHERE item_id = ? ORDER BY sort_order, id')
      .all(it.id).map(p => {
        /* DER AUSSCHNITT GEHT MIT -- alle DREI Werte, seit Formatnummer 12.
           Ohne `zoom` in der Datei ginge er beim Einspielen verloren, und die
           Zweitinstanz zeigte einen anderen Ausschnitt als die erste. Eine
           aeltere Instanz uebergeht das zusaetzliche Feld wortlos. */
        const z = { mime_type: p.mime_type, focus_x: p.focus_x, focus_y: p.focus_y,
                    zoom: p.zoom, art: p.art };
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
  const kritZeilen = db.prepare('SELECT name, gewicht, phase FROM rating_criteria ORDER BY sort_order, id').all();
  /* Die Gewichte kommen als EIGENES Feld daneben, criteria bleibt eine Liste
     von Namen: auf Objekte umgestellt liefe eine aeltere Instanz durch String()
     und bekaeme ein Kriterium namens "[object Object]". Ein zusaetzliches
     Feld ignoriert sie dagegen wortlos.
     NUR ABWEICHUNGEN -- ein Kriterium mit Gewicht 1 taucht gar nicht auf. */
  const criteriaGewichte = {};
  for (const c of kritZeilen) if (c.gewicht !== 1) criteriaGewichte[c.name] = c.gewicht;
  /* UND DIE PHASE IM SELBEN MUSTER -- 0.21.0, ein drittes Feld neben den
     beiden. NUR ABWEICHUNGEN: ein Kriterium des Kastens „nachher" taucht gar
     nicht auf, so wie ein Gewicht von 1 nicht auftaucht.
     EINE DATEI OHNE VORHER-KRITERIEN SIEHT DAMIT AUS WIE BISHER, plus einer
     Formatnummer -- und eine aeltere Instanz uebergeht das zusaetzliche Feld
     wortlos, genau wie seinerzeit criteriaGewichte. */
  const criteriaPhase = {};
  for (const c of kritZeilen) if (c.phase !== 'nachher') criteriaPhase[c.name] = c.phase;
  return { exported_at: new Date().toISOString(), title, version: AUSTAUSCH_FORMAT,
           criteria: kritZeilen.map(c => c.name), criteriaGewichte, criteriaPhase, items };
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
function austauschTeile(itemId, schalter) {
  const nurEiner = itemId !== null;
  const werte = nurEiner ? [itemId] : [];
  const eins = (sql) => db.prepare(sql).get(...werte).n || 0;
  // Der Zusatz haengt an der Spalte, weil das Kommentarbild ueber den
  // Kommentar an den Eintrag kommt und nicht unmittelbar.
  const und = (spalte) => nurEiner ? ` AND ${spalte} = ?` : '';
  const wo = (spalte) => nurEiner ? ` WHERE ${spalte} = ?` : '';
  const base64 = (n) => Math.round(n * 4 / 3);
  const teile = { fotos: 0, videos: 0, anhaenge: 0, kommentarbilder: 0 };
  if (schalter.mitFotos)
    teile.fotos = base64(eins(
      `SELECT COALESCE(SUM(length(data)),0) n FROM photos WHERE art != 'video'${und('item_id')}`));
  /* Der Videoschalter haengt am Fotoschalter, wie in eintragAlsPaket(): ohne
     Fotos wird die Liste gar nicht erst gebaut, und der Haken an den Videos
     bliebe eine Angabe ohne Wirkung. */
  if (schalter.mitFotos && schalter.mitVideos)
    teile.videos = base64(eins(
      `SELECT COALESCE(SUM(length(data) + COALESCE(length(medium), length(thumb), 0)),0) n
         FROM photos WHERE art = 'video'${und('item_id')}`));
  if (schalter.mitDateien) {
    teile.anhaenge = base64(eins(
      `SELECT COALESCE(SUM(length(data)),0) n FROM attachments${wo('item_id')}`));
    // Kommentarbilder folgen dem Schalter der Dateien -- dort und hier.
    teile.kommentarbilder = base64(eins(
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
const UMSCHLAG_JE = { eintrag: 320, kommentar: 150, bewertung: 70, zeitpunkt: 90, foto: 110, datei: 130 };
function austauschUmschlagBytes(itemId) {
  const nurEiner = itemId !== null;
  const werte = nurEiner ? [itemId] : [];
  const eins = (sql) => db.prepare(sql).get(...werte).n || 0;
  const wo = (spalte) => nurEiner ? ` WHERE ${spalte} = ?` : '';
  /* Die Tags gehen NICHT ueber die Vorratstabelle, sondern ueber die
     Verknuepfung: derselbe Name steht an zwanzig Eintraegen und kostet in der
     Datei zwanzigmal Platz. Ueber `tags` gezaehlt faellt er einmal an, und
     die Schaetzung waere bei einem stark verschlagworteten Bestand zu klein. */
  const text =
      eins(`SELECT COALESCE(SUM(length(COALESCE(title,'')) + length(COALESCE(description,''))),0) n
              FROM items${wo('id')}`)
    + eins(`SELECT COALESCE(SUM(length(COALESCE(text,''))),0) n FROM comments${wo('item_id')}`)
    + eins(`SELECT COALESCE(SUM(length(t.name)),0) n FROM item_tags it
              JOIN tags t ON t.id = it.tag_id${wo('it.item_id')}`)
    + eins(`SELECT COALESCE(SUM(length(url)),0) n FROM links${wo('item_id')}`);
  const form =
      eins(`SELECT COUNT(*) n FROM items${wo('id')}`) * UMSCHLAG_JE.eintrag
    + eins(`SELECT COUNT(*) n FROM comments${wo('item_id')}`) * UMSCHLAG_JE.kommentar
    + eins(`SELECT COUNT(*) n FROM ratings${wo('item_id')}`) * UMSCHLAG_JE.bewertung
    + eins(`SELECT COUNT(*) n FROM test_days${wo('item_id')}`) * UMSCHLAG_JE.zeitpunkt
    + eins(`SELECT COUNT(*) n FROM photos${wo('item_id')}`) * UMSCHLAG_JE.foto
    + eins(`SELECT COUNT(*) n FROM attachments${wo('item_id')}`) * UMSCHLAG_JE.datei;
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
const AUSTAUSCH_TEIL_MAX = 999;

/* Die Groesse JE EINTRAG, in EINER Abfrage statt in zehn je Eintrag.
   Bei tausend Eintraegen waeren es sonst zehntausend vorbereitete Anweisungen,
   und der Plan braeuchte laenger als der Export.
   GEZAEHLT WIRD DASSELBE WIE IN austauschTeile() -- rohe Bytes; der
   Base64-Aufschlag und der Umschlag kommen danach in JS dazu, aus denselben
   Konstanten. So steht der Faktor an einem Ort, auch wenn die Abfrage eine
   andere ist. Eine Pruefung haelt beide Summen gegeneinander. */
const qTeilGroessen = db.prepare(`
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
// immer. Dieselbe Rechnung wie austauschBytes(), nur aus einer fertigen Zeile.
function teilBytes(z, schalter) {
  const base64 = (n) => Math.round(n * 4 / 3);
  let n = 0;
  if (schalter.mitFotos) n += z.foto;
  if (schalter.mitFotos && schalter.mitVideos) n += z.video;
  if (schalter.mitDateien) n += z.anhang + z.kbild;
  return base64(n) + z.text + z.ktext + z.tagtext + z.linktext
    + UMSCHLAG_JE.eintrag + z.nk * UMSCHLAG_JE.kommentar + z.nb * UMSCHLAG_JE.bewertung
    + z.nz * UMSCHLAG_JE.zeitpunkt + z.nf * UMSCHLAG_JE.foto + z.nd * UMSCHLAG_JE.datei;
}

/* Der Schnittplan. Er sagt, WIE VIELE Teile es gibt und WELCHE Eintraege in
   jeden gehoeren -- und er nennt die Eintraege, die in keinen Teil passen.

   EIN EINTRAG, DER FUER SICH ALLEIN ZU GROSS IST, KANN NICHT GESCHNITTEN
   WERDEN. Zwanzig Videos zu je 20 MB sind als Base64 533 MB in EINEM Eintrag,
   und ein Eintrag ist die kleinste Einheit, die der Import versteht. Er wird
   deshalb NICHT stillschweigend uebergangen, sondern namentlich genannt: wer
   ihn sieht, weiss, dass er die Videos abwaehlen oder diesen einen Eintrag von
   Hand behandeln muss. Ein stiller Verlust waere der schlimmere Ausgang.

   DER ZIELWERT IST AUSTAUSCH_WARN und nicht AUSTAUSCH_MAX: die Teilgroesse ist
   eine Schaetzung wie jede andere hier, und ein Teil, der die harte Grenze
   streift, waere genau der Fall, den diese Runde beseitigen soll.

   ER LAESST SICH KLEINER STELLEN, aber nicht groesser. Wer seine Teile auf
   einen Datentraeger oder durch eine Hochladegrenze bringen muss, braucht
   kleinere; groesser darf niemand, denn oberhalb von AUSTAUSCH_WARN baute die
   Instanz Teile, vor denen sie im selben Atemzug warnt.
   DIE UNTERGRENZE IST NICHT ZIERDE: bei einem Zielwert unter einem Megabyte
   entstuenden bei tausend Eintraegen tausend Dateien, und der Import waere
   tausend Handgriffe. */
const AUSTAUSCH_TEIL_MIN = 1024 * 1024;
function austauschPlan(schalter, zielWunsch) {
  const zielGroesse = Math.min(AUSTAUSCH_WARN,
    Math.max(AUSTAUSCH_TEIL_MIN, Number(zielWunsch) > 0 ? Number(zielWunsch) : AUSTAUSCH_WARN));
  const zeilen = qTeilGroessen.all();
  const grund = austauschUmschlagRahmen();
  const teile = [];
  const zuGross = [];
  let offen = null;
  for (const z of zeilen) {
    const b = teilBytes(z, schalter);
    if (grund + b > AUSTAUSCH_MAX) { zuGross.push({ id: z.id, titel: z.titel, bytes: grund + b }); continue; }
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
  return { teile, zuGross,
           gesamt: teile.reduce((n, t) => n + t.bytes, 0),
           zielGroesse, vorgabe: AUSTAUSCH_WARN, kleinstes: AUSTAUSCH_TEIL_MIN,
           grenze: AUSTAUSCH_MAX, string: AUSTAUSCH_STRING };
}

/* Was der Umschlag OHNE Eintraege kostet -- Titel, Zeitstempel, Formatnummer
   und die Kriterienliste. Er faellt in JEDEM Teil an, nicht einmal: jeder Teil
   ist eine vollstaendige Datei. Bei einer Handvoll Kriterien sind das ein paar
   hundert Bytes, und genau deshalb steht er hier und wird nicht geschaetzt. */
function austauschUmschlagRahmen() {
  const title = getSetting('title_app', 'Kriterion');
  const kritZeilen = db.prepare('SELECT name, gewicht, phase FROM rating_criteria ORDER BY sort_order, id').all();
  return JSON.stringify({ exported_at: new Date().toISOString(), title, version: AUSTAUSCH_FORMAT,
                          criteria: kritZeilen.map(c => c.name),
                          criteriaGewichte: Object.fromEntries(
                            kritZeilen.filter(c => c.gewicht !== 1).map(c => [c.name, c.gewicht])),
                          // Der Rahmen misst, was der Umschlag KOSTET -- also
                          // gehoert das dritte Feld hier genauso hinein wie in
                          // die Datei. Ohne es faellt die Messung je Teil um
                          // die Vorher-Kriterien zu niedrig aus.
                          criteriaPhase: Object.fromEntries(
                            kritZeilen.filter(c => c.phase !== 'nachher').map(c => [c.name, c.phase])),
                          items: [] }).length;
}

/* Wie viele Bytes eine Datei traegt, BEVOR sie gebaut wird -- als eine Zahl.
   Der Umschlag gehoert dazu: eine Absage, die nur die Blobs zaehlt, laesst
   genau die Datei durch, die am Umschlag zerbricht. */
function austauschBytes(itemId, schalter) {
  const t = austauschTeile(itemId, schalter);
  return t.fotos + t.videos + t.anhaenge + t.kommentarbilder + austauschUmschlagBytes(itemId);
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
app.get('/api/export/plan', nurEigentuemer, (req, res) => {
  res.json(austauschPlan({
    mitFotos: req.query.photos !== '0',
    mitDateien: req.query.files === '1',
    mitVideos: req.query.videos === '1'
  }, req.query.ziel));
});

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
  /* DIE ABSAGE STEHT VOR DEM BAU, nicht hinter dem Abbruch -- dieselbe Bauform
     wie am Einzelexport eine Seite weiter unten. Vorher lief dieser Weg bis in
     `JSON.stringify` hinein und kam mit `RangeError: Invalid string length`
     zurueck: eine 500 nach zwei Minuten, mit einem Spitzenverbrauch, den
     niemand gebraucht hat. Ein Knopf, der so abbricht, sieht aus wie ein
     kaputtes Programm; er ist aber eine erreichte Grenze, und der Unterschied
     liegt allein darin, ob die Instanz es vorher sagt.
     GEWARNT WIRD AN DER KARTE, ABGESAGT WIRD HIER. Die beiden Zahlen haben
     verschiedene Aufgaben: AUSTAUSCH_WARN nimmt niemandem etwas weg,
     AUSTAUSCH_MAX ist die Grenze, hinter der es keine Datei mehr gibt.
     KEIN STROM: hier wird nichts umgebaut, was funktioniert. Der Weg an der
     Grenze vorbei steht in der Meldung und heisst Sicherung. */
  /* DAS FENSTER. Ohne `von`/`bis` ist es der ganze Bestand -- der Weg von
     0.12.3 und davor, Zeile fuer Zeile derselbe. Mit ihnen ist es ein Teil,
     und dann traegt der Dateiname seine Nummer.
     GEPRUEFT WIRD BEIDES EINZELN, denn eine halbe Angabe ist ein Fehler und
     kein Vollexport: wer `von` schickt und `bis` vergisst, bekaeme sonst
     stillschweigend alles. */
  const zahl = (w) => { const n = Number(w); return Number.isInteger(n) && n > 0 ? n : null; };
  const von = zahl(req.query.von), bis = zahl(req.query.bis);
  const teil = zahl(req.query.teil), teile = zahl(req.query.teile);
  const alsTeil = von !== null || bis !== null || teil !== null || teile !== null;
  if (alsTeil && (von === null || bis === null || teil === null || teile === null))
    return res.status(400).json({ error: 'Ein Teilexport braucht von, bis, teil und teile.' });
  if (alsTeil && (von > bis || teil > teile || teile > AUSTAUSCH_TEIL_MAX))
    return res.status(400).json({ error: 'Die Angaben zum Teilexport passen nicht zusammen.' });

  const gross = austauschBytes(null, schalter);
  if (!alsTeil && gross > AUSTAUSCH_MAX)
    return res.status(413).json({ error:
      `Dieser Export wäre rund ${Math.round(gross / 1048576)} MB groß. Eine Exportdatei ist ` +
      `ein einziger Text, und der kann nicht größer als ${Math.round(AUSTAUSCH_STRING / 1048576)} MB ` +
      `werden. Nimm die Sicherung — sie schreibt den ganzen Bestand und braucht dafür keinen ` +
      `nennenswerten Arbeitsspeicher.` });
  const lage = paketLage(req.benutzer.id, schalter);
  const items = (alsTeil
    ? db.prepare('SELECT * FROM items WHERE id BETWEEN ? AND ? ORDER BY id').all(von, bis)
    : db.prepare('SELECT * FROM items ORDER BY id').all()).map(it => eintragAlsPaket(it, lage));
  /* Ein Teil steht als solcher im Protokoll -- sonst saehe ein Bestand, der in
     fuenf Teilen hinausgeht, aus wie fuenf volle Exporte.
     DAS MERKMAL IST DAS WORT UND NICHT DIE NUMMER: merkmal traegt nur Werte
     aus MERKMALE, und "teil 1/5" stand nicht darin -- 0.12.4 hat damit gar
     keine Zeile geschrieben. Die Nummer des Teils steht im Dateinamen. */
  auth.protokolliere('export', { wer: req.benutzer.id, merkmal: alsTeil ? 'teil' : null });
  res.set('Content-Disposition',
    `attachment; filename="${exportName(alsTeil ? `-teil-${teil}-von-${teile}` : '')}"`);
  /* DAS NETZ UNTER DER SCHAETZUNG. Die Absage oben rechnet, sie misst nicht --
     faellt sie zu niedrig aus, wirft `res.json` genau hier. Express baut den
     String VOR dem Kopf und vor dem Senden; die Antwort ist an dieser Stelle
     also noch unberuehrt und kann die Absage nachreichen.
     DER DATEIKOPF MUSS DABEI WIEDER WEG -- sonst laedt der Browser die
     Fehlermeldung als Exportdatei herunter. */
  try { res.json(exportUmschlag(items)); }
  catch (e) {
    if (!(e instanceof RangeError)) throw e;
    res.removeHeader('Content-Disposition');
    res.status(413).json({ error:
      `Dieser Export ist zu groß geworden. Eine Exportdatei ist ein einziger Text, und der ` +
      `kann nicht größer als ${Math.round(AUSTAUSCH_STRING / 1048576)} MB werden. Nimm die ` +
      `Sicherung — sie schreibt den ganzen Bestand und braucht dafür keinen nennenswerten ` +
      `Arbeitsspeicher.` });
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
app.get('/api/items/:id/export', nurEigentuemer, (req, res) => {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!it) return res.status(404).json({ error: `${vokabular().sacheEinzahl} nicht gefunden.` });
  const schalter = { mitFotos: true, mitDateien: true, mitVideos: true };
  const gross = austauschBytes(it.id, schalter);
  if (gross > AUSTAUSCH_MAX)
    return res.status(413).json({ error: `Dieser ${vokabular().sacheEinzahl} ist als Datei zu groß ` +
      `(rund ${Math.round(gross / 1048576)} MB). Eine Exportdatei ist ein einziger Text, und der kann ` +
      `nicht größer als ${Math.round(AUSTAUSCH_STRING / 1048576)} MB werden.` });
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
      /* DER ZUSCHNITT AUS DER DATEI GEHT IN DIE ABLEITUNG -- 0.19.5. Er wird
         eine Zeile tiefer ohnehin gelesen; ohne ihn HIER truege jede
         eingespielte Zeile eine ungeschnittene Kachel, und der Bestandslauf
         muesste sie beim naechsten Start ein zweites Mal anfassen -- an einem
         Bestand, den gerade jemand eingespielt hat, ist das der ganze
         Bestand. */
      const im = (name, roh) => anzeigeWert(name, roh) ?? ANZEIGEWERTE[name].vorgabe;
      const zuschnitt = { fx: im('focus_x', p.focus_x), fy: im('focus_y', p.focus_y),
                          zoom: im('zoom', p.zoom) };
      const v = vorlage ? await makeVariants(vorlage, zuschnitt) : { thumb: null, medium: null };
      // Dieselbe Schaerfe wie beim Hochladen: fehlt EINE der beiden
      // Varianten, wird die Zeile nicht angelegt. Das Nachruesten beim Start
      // holt sie an einer Videozeile nicht nach.
      if (istVideo && (!v.thumb || !v.medium)) { videosUnlesbar++; continue; }
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
      photos.push({ mime: p.mime_type || (istVideo ? 'video/mp4' : 'image/jpeg'),
                    buf, thumb: v.thumb, medium: v.medium,
                    fx: zuschnitt.fx, fy: zuschnitt.fy, zoom: zuschnitt.zoom,
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

  /* EIN Ort, der aus einem Namen eine Id macht -- die Gegenrichtung zur
     Karte im Export. Ein genannter Name, den es gibt, wird zugeordnet; alles
     andere faellt an den Einspielenden.
     EIN UNBEKANNTER NAME LEGT KEINEN ZUGANG AN -- sonst waere eine
     Exportdatei ein Weg an Verwaltung und Passwort vorbei.
     EIN GRABSTEIN WIRD GEFUNDEN, solange seine Zeile in users steht.
     Gesucht wird ueber username (COLLATE NOCASE); ein nachlaufendes
     Leerzeichen trifft die Spalte nicht, deshalb das trim(). */
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

  /* Die Gewichte aus der Datei, einmal aufbereitet -- ausdruecklich
     AUSSERHALB der Transaktion, weil die Antwort unten die verworfenen nennen
     muss. Der Schluessel steht klein, weil critByName() ueber COLLATE NOCASE
     sucht.
     EIN UNGUELTIGES GEWICHT BRICHT NICHT AB, sondern faellt auf 1,0 und wird
     genannt. */
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
      if (!sauber || !PHASEN.includes(roh)) continue;
      dateiPhasen.set(sauber.toLowerCase(), roh);
    }
  }
  const phaseAus = (name) =>
    dateiPhasen.get(String(name).trim().toLowerCase()) || PHASE_VORGABE;

  /* DER KONFLIKT UEBER DIE KAESTEN HINWEG, UND ER WIRD VOR DEM ERSTEN
     SCHREIBEN ABGEWIESEN -- 0.21.0.
     Traegt die Datei ein Kriterium, das es hier unter DEMSELBEN NAMEN im
     ANDEREN Kasten gibt, ist das eine Absage mit Meldung, die das Kriterium
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
  const qPhaseVon = db.prepare('SELECT name, phase FROM rating_criteria WHERE name = ? COLLATE NOCASE');
  const konflikte = [];
  for (const name of Array.isArray(payload.criteria) ? payload.criteria : []) {
    const clean = String(name || '').trim();
    if (!clean) continue;
    const da = qPhaseVon.get(clean);
    if (da && da.phase !== phaseAus(clean)) konflikte.push(da.name);
  }
  if (konflikte.length) {
    const e = new Error(
      `${konflikte.length === 1 ? 'Dieses Kriterium steht' : 'Diese Kriterien stehen'} in der Datei ` +
      `in einem anderen Kasten als hier: ${konflikte.join(', ')}. ` +
      `Ein Name gehört zu genau einem Kasten. Es wurde nichts eingespielt.`);
    e.absage = true;
    throw e;
  }

  // Ein einziger Vorgang: bricht etwas ab, bleibt der Bestand unveraendert.
  db.transaction(() => {
    if (modus === 'replace') {
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
        .run(name, pos, g === undefined ? 1.0 : g, phaseAus(name)).lastInsertRowid;
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
      const abgelehntVon = String(it.rejected_author == null ? '' : it.rejected_author).trim()
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
             it.rejected_grund == null ? null : grundText(String(it.rejected_grund)),
             abgelehntVon,
             it.tested ? 1 : 0,
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
      /* ZWEI FORMEN, EINE SCHLEIFE: bis Formatnummer 6 ist ein Link ein
         nackter String, ab 7 ein Objekt mit url und author. Eine alte Datei
         ist kein Fehler.
         WEM EIN LINK AUS EINER DATEI DER FORMATNUMMER 6 GEHOERT: dem
         Verfasser DES EINTRAGS. Die Datei sagt nichts anderes; "unbekannter
         Name" traefe es nicht, es steht ja keiner da. Deshalb wird hier
         verfasser() NICHT gefragt. */
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
                 a2.hatAutor ? verfasser(a2.autor) : itemVerfasser); stats.attachments++; });
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
  } catch (e) {
    /* EINE ABSAGE AUS spieleEin() IST KEIN FEHLER DER INSTANZ, sondern eine
       Auskunft ueber die Datei -- sie geht als 400 mit Meldung hinaus und
       nicht als 500 durch das Auffangnetz. Sie faellt VOR der ersten
       Schreibung; der Bestand ist unveraendert. */
    if (e && e.absage) return res.status(400).json({ error: e.message });
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

const PAPIERKORB_TAGE = 30;

const insPapierkorb = db.prepare(
  'INSERT INTO papierkorb (titel, inhalt, geloescht_von) VALUES (?, ?, ?)');
const insPapierkorbBytes = db.prepare(
  'INSERT INTO papierkorb_bytes (papierkorb_id, nr, daten) VALUES (?, ?, ?)');
const qPapierkorbBytes = db.prepare(
  'SELECT daten FROM papierkorb_bytes WHERE papierkorb_id = ? AND nr = ?');
const delPapierkorbAlt = db.prepare(
  "DELETE FROM papierkorb WHERE geloescht_am < datetime('now', ?)");

/* ZWEI AUFRUFSTELLEN, beide noetig -- beim Start und beim Oeffnen der Karte.
   Eine Instanz, die drei Monate durchlaeuft, raeumte sonst drei Monate lang
   nicht auf.
   HINZUNEHMENDE FOLGE: damit schreibt eine LESENDE Route. Das ist
   Hauswirtschaft und keine Benutzerhandlung -- die Liste schreibender Routen
   bleibt unberuehrt. Die Bytes fallen ueber ON DELETE CASCADE mit. */
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
/* Und die unbestaetigten Anfragen, . DREI Aufrufstellen statt
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
   trotzdem davor.
   WARUM DER ADMIN SIE SEHEN DARF: er darf jeden Eintrag loeschen und sieht in
   der Uebersicht ohnehin jeden Titel. Der Papierkorb zeigt ihm nichts, was er
   vor dem Loeschen nicht schon sah.
   GEHANDELT WIRD TROTZDEM NUR VOM EIGENTUEMER: Wiederherstellen legt Zeilen
   unter FREMDEM Namen an -- das ist naeher am Import als am Loeschen, und der
   steht hinter nurEigentuemer. */
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

/* Wiederherstellen. Es legt einen NEUEN Eintrag an und stellt nicht den
   alten zurueck -- die alte Nummer ist weg, und daran haengt nichts mehr.
   Genau das kann der Import schon, deshalb geht der Weg durch ihn.
   WAS AUS DEN VERFASSERN WIRD, steht damit fest und wird hier nicht neu
   erfunden -- auch ein GRABSTEIN wird gefunden, solange seine Zeile steht.
   WAS NICHT ZURUECKKOMMT und benannt gehoert: die Favoriten ANDERER (favorite
   heisst "habe ICH markiert") und der Eingriffsvermerk am Kommentar -- beides
   steht in keiner Exportdatei, und der Papierkorb ist eine. */
app.post('/api/papierkorb/:id/wiederherstellen', nurEigentuemer, async (req, res, next) => {
  try {
    const z = db.prepare('SELECT * FROM papierkorb WHERE id = ?').get(req.params.id);
    if (!z) return res.status(404).json({ error: 'Das gibt es im Papierkorb nicht mehr.' });
    let umschlag;
    try { umschlag = JSON.parse(z.inhalt); }
    catch { return res.status(500).json({ error: 'Das lässt sich aus dem Papierkorb nicht lesen.' }); }
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
  } catch (e) {
    /* DERSELBE WEG WIE AM IMPORT. Er kann hier nur greifen, wenn ein Kriterium
       nach dem Loeschen des Eintrags geloescht und im anderen Kasten neu
       angelegt wurde -- selten, aber genau dann soll die Zeile liegen bleiben
       und der Grund dastehen, statt eines 500. */
    if (e && e.absage) return res.status(400).json({ error: e.message });
    next(e);
  }
});

// Endgueltig entfernen. Dieselbe Rechtezeile wie das Wiederherstellen: wer
// einen Rueckweg nehmen darf, darf ihn auch schliessen. Die Bytes fallen ueber
// ON DELETE CASCADE mit.
app.delete('/api/papierkorb/:id', nurEigentuemer, (req, res) => {
  const n = db.prepare('DELETE FROM papierkorb WHERE id = ?').run(req.params.id).changes;
  if (!n) return res.status(404).json({ error: 'Das gibt es im Papierkorb nicht mehr.' });
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
// Gemessen an einer verschluesselten Instanz: rund 10 ms je MB. Verdoppelt,
// weil der Betrieb auf einem N100 laeuft und eine zu niedrige Ansage
// schlimmer ist als eine zu hohe.
const SICHERUNG_MS_JE_MB = 20;
const SICHERUNG_MUSTER = /^kriterion-.+\.sqlite$/;
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
const AUFRAEUM_BEHALTEN = { vorgabe: 3, min: 1, max: 20 };
const AUFRAEUM_TAGE = { vorgabe: 30, min: 7, max: 365 };
const TAG_MS = 86400000;
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
   LAGE -- sie ueberlebt kein Umbenennen und liegt auf derselben Platte wie
   das Original. Sie ist trotzdem erlaubt; der Betreiber soll nur nicht
   glauben, sie sei am richtigen Ort.

   DIE AUSSAGE TRAEGT NUR, WEIL DIE EINHAENGUNG DIE LAGE SPIEGELT: der Prozess
   sieht den Wirt nicht, er liest seinen eigenen Pfad. Was unter ./ eingehaengt
   wird, gehoert unter das Anwendungsverzeichnis -- so steht es in der
   docker-compose.yml. Aufgeloest wie jeder Pfad hier, wegen der Symlinks. */
const ANWENDUNG_DIR = (() => {
  try { return fs.realpathSync(__dirname); } catch { return path.resolve(__dirname); }
})();

/* Die Lage wird bei JEDER Anfrage gelesen und nicht beim Start festgehalten:
   wer das Verzeichnis nachtraeglich einhaengt, soll es nicht mit einem
   Neustart bezahlen. Beim Start wird sie einmal ins Protokoll geschrieben. */
function sicherungLage() {
  if (!SICHERUNG_DIR)
    return { ein: false, grund: 'Es ist kein Sicherungsordner eingerichtet. ' +
      'Die docker-compose.yml hängt ihn ein und benennt ihn als SICHERUNG_DIR — ' +
      'beides gehört zusammen.' };
  let wurzel;
  try { wurzel = fs.realpathSync(SICHERUNG_DIR); }
  catch { return { ein: false, grund: `Den Sicherungsordner ${SICHERUNG_DIR} gibt es nicht. ` +
    'Er wird nicht angelegt — häng ihn auf dem Server ein.' }; }
  try { if (!fs.statSync(wurzel).isDirectory())
    return { ein: false, grund: `${SICHERUNG_DIR} ist kein Verzeichnis.` }; }
  catch { return { ein: false, grund: `${SICHERUNG_DIR} ist nicht lesbar.` }; }
  let daten;
  try { daten = fs.realpathSync(DATA_DIR); } catch { daten = path.resolve(DATA_DIR); }
  // EINE SICHERUNG NEBEN DEM ORIGINAL IST KEINE. Beide Richtungen, denn beide
  // sind falsch: der Sicherungsort im Datenverzeichnis und umgekehrt.
  if (liegtIn(wurzel, daten) || liegtIn(daten, wurzel))
    return { ein: false, grund: 'Der Sicherungsordner darf nicht im Datenverzeichnis liegen — ' +
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
  if (s.length > 200) return { fehler: 'Der Unterordner ist zu lang (höchstens 200 Zeichen).' };
  if (!ORT_MUSTER.test(s))
    return { fehler: 'Der Unterordner liegt im eingerichteten Sicherungsordner. ' +
      'Erlaubt sind Buchstaben, Ziffern, Leerzeichen, Punkt, Strich, Unterstrich und ' +
      'Schrägstrich; ein führender Schrägstrich und „..“ sind es nicht.' };
  let echt;
  try { echt = fs.realpathSync(path.resolve(lage.wurzel, s)); }
  catch { return { fehler: `Den Unterordner „${s}“ gibt es im Sicherungsordner nicht. ` +
    'Er wird nicht angelegt — leg ihn auf dem Server an.' }; }
  try { if (!fs.statSync(echt).isDirectory())
    return { fehler: `„${s}“ ist kein Verzeichnis.` }; }
  catch { return { fehler: `„${s}“ ist nicht lesbar.` }; }
  // DIE PRUEFUNG HAENGT AM AUFGELOESTEN PFAD. Erst hier faellt ein Symlink
  // auf, der aus der Wurzel herausfuehrt -- am String saehe er harmlos aus.
  if (!liegtIn(echt, lage.wurzel))
    return { fehler: `„${s}“ führt aus dem eingerichteten Sicherungsordner heraus.` };
  let daten;
  try { daten = fs.realpathSync(DATA_DIR); } catch { daten = path.resolve(DATA_DIR); }
  if (liegtIn(echt, daten))
    return { fehler: 'Der Sicherungsordner darf nicht im Datenverzeichnis liegen — ' +
      'eine Sicherung neben dem Original ist keine.' };
  return { ort: s, pfad: echt };
}

/* "Letzte Sicherung vor N Tagen" kommt aus dem DATEISYSTEM, nicht aus einem
   Schluessel in settings. Ein Schluessel waere eine BEHAUPTUNG ueber die
   Datei, das Dateisystem ist die Sache -- dieselbe Frage wie beim Merker
   gegen den Index in 0.6.2, und dort ist sie zugunsten der Sache entschieden
   worden. Der Preis steht daneben: ein unerreichbarer Zielort liefert keine
   Auskunft, und dann sagt die Karte GENAU DAS statt einer Zahl. */
/* ZWEI SCHLUESSEL IM UMLAUF -- die unangenehmste Falle des ganzen Projekts.
   Wird der Schluessel der Datenbank gewechselt (schluessel.js auf dem Wirt),
   bleiben die vorhandenen Sicherungen mit dem ALTEN verschluesselt. Sie sind
   nicht kaputt -- sie brauchen nur einen anderen Schluessel, und wer das
   nicht weiss, haelt sie im Ernstfall fuer defekt.

   Die Marke kommt aus settings und ist HIER richtig, waehrend "letzte
   Sicherung" aus dem Dateisystem kommt: der Zeitpunkt des Wechsels ist ein
   VORGANG und hinterlaesst keine Datei.

   VERGLICHEN WIRD IN UTC -- ohne das Z lese der Rechner die Marke als
   Ortszeit, und die Grenze verschoebe sich um den Zeitzonenabstand. */
function wechselMarke() {
  const roh = getSetting('schluesselGewechseltAm', null);
  if (!roh) return null;
  const ms = Date.parse(String(roh).replace(' ', 'T') + 'Z');
  return Number.isFinite(ms) ? { am: roh, ms } : null;
}

/* DIE LISTE DER KOPIEN AM ORT -- EINMAL AUFGEBAUT UND VON DREIEN GENUTZT.
   Bis 0.19.6 stand sie mitten in letzteSicherung(), wurde dort ausgewertet und
   wieder weggeworfen. Seit 0.20.0 brauchen die Vorschau und das Loeschen genau
   dieselbe Liste; ein zweiter Aufbau daneben waere eine zweite Wahrheit
   darueber, was am Ort liegt (Stolperstein 47).

   DREI KLEMMEN, UND JEDE HAELT EINE ANDERE FRAGE:
     SICHERUNG_MUSTER  -- nur, was `kriterion-<...>.sqlite` heisst. Eine fremde
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
function sicherungsListe(pfad) {
  let namen;
  try { namen = fs.readdirSync(pfad); }
  catch { return null; }
  const dateien = [];
  for (const n of namen) {
    if (!SICHERUNG_MUSTER.test(n)) continue;
    try {
      const st = fs.lstatSync(path.join(pfad, n));
      if (st.isFile()) dateien.push({ name: n, zeit: st.mtimeMs, bytes: st.size });
    } catch { /* eine Datei, die zwischen readdir und stat verschwindet */ }
  }
  dateien.sort((a, b) => b.zeit - a.zeit);
  return dateien;
}

function letzteSicherung(pfad) {
  const marke = wechselMarke();
  const gewechseltAm = marke ? marke.am : null;
  const dateien = sicherungsListe(pfad);
  if (dateien === null)
    return { erreichbar: false, letzte: null, zahl: 0, gewechseltAm, veraltet: 0 };
  // Ohne Wechsel ist KEINE Kopie veraltet -- und nicht etwa jede. Der
  // Unterschied zwischen "es gab keinen Wechsel" und "alle sind veraltet" ist
  // genau der, den diese Zeile haelt.
  const veraltet = marke ? dateien.filter(d => d.zeit < marke.ms).length : 0;
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
    veraltet: Boolean(marke && j.zeit < marke.ms)
  } };
}

/* ================= Alte Sicherungen aufraeumen -- 0.20.0 =================

   DIE REGEL STEHT AN GENAU EINER STELLE, und sie ist eine REINE FUNKTION: sie
   bekommt eine Dateiliste und die beiden Werte und liefert die zu loeschenden
   Namen. Die Vorschau und das Loeschen rufen dieselbe -- zwei Fassungen waeren
   zwei Wahrheiten darueber, was gleich passiert (Stolperstein 47), und die
   Vorschau verloere genau das, wofuer es sie gibt.

   SIE BERUEHRT WEDER DAS DATEISYSTEM NOCH DIE UHR: `jetzt` und `wechselMs`
   kommen als Argument herein. Nur so ist sie an einer TAFEL zu pruefen statt
   an einem Ordner -- und eine Pruefung, die auf echte dreissig Tage wartet,
   gibt es nicht.

   DER BODEN ZAEHLT NUR DIE KOPIEN NACH DEM SCHLUESSELWECHSEL (Entscheidung 5).
   Drei Kopien, von denen zwei vor dem Wechsel entstanden sind, sind in
   Wahrheit eine; bei dieser Lage faellt dann gar nichts, und das ist die
   sichere Seite. Die Kopien von VOR dem Wechsel fasst die Regel ueberhaupt
   nicht an -- sie sind nicht entbehrlich, sondern etwas anderes, und fuer sie
   gibt es den zweiten, ausdruecklichen Weg.
   OHNE WECHSEL ZAEHLEN ALLE: `wechselMs` ist dann null, und die Filterzeile
   laesst jede Kopie durch. Der Unterschied zwischen "es gab keinen Wechsel"
   und "alle sind veraltet" ist derselbe wie in letzteSicherung() darueber. */
function regelTreffer(dateien, behalten, tage, jetzt, wechselMs) {
  const brauchbar = dateien
    .filter(d => wechselMs == null || d.zeit >= wechselMs)
    .sort((a, b) => b.zeit - a.zeit);
  const grenze = jetzt - tage * TAG_MS;
  //          der Boden                    die Schere
  return brauchbar.slice(behalten).filter(d => d.zeit < grenze);
}

/* Die beiden Werte, geprueft. EINE Stelle fuer beide Wege -- den Schreibweg
   ueber PUT /api/settings und den Leseweg der Regel: stuende die Spanne an
   zwei Orten, liefe sie auseinander.
   `null`, `"drei"` UND EIN BRUCH WERDEN ABGEWIESEN und nicht stillschweigend
   gerundet: eine Zahl, die der Server anders liest, als sie eingetippt wurde,
   ist schlimmer als eine Absage. */
function pruefeRegelwert(roh, spanne, was) {
  const n = Number(roh);
  if (!Number.isInteger(n) || n < spanne.min || n > spanne.max)
    return { fehler: `${was} muss eine ganze Zahl von ${spanne.min} bis ${spanne.max} sein.` };
  return { wert: n };
}

/* Der eingestellte Stand der Regel. ABGELEITET BEIM LESEN, ohne
   Migrationscode: was nicht in settings steht, gilt als Vorgabe -- und der
   Schalter gilt als AUS.
   GEPRUEFT AUCH BEIM LESEN: ein von Hand in die Tabelle geschriebener Wert
   ausserhalb der Grenzen faellt hier auf die Vorgabe zurueck und weitet die
   Regel nicht. Die Klemme steht an der Stelle, an der der Fehler wehtut. */
function aufraeumStand() {
  const b = pruefeRegelwert(getSetting('sicherungBehalten', AUFRAEUM_BEHALTEN.vorgabe),
                            AUFRAEUM_BEHALTEN, 'Immer behalten');
  const t = pruefeRegelwert(getSetting('sicherungTage', AUFRAEUM_TAGE.vorgabe),
                            AUFRAEUM_TAGE, 'Erst löschen ab');
  return {
    an: getSetting('sicherungAufraeumen', false) === true,
    behalten: b.fehler ? AUFRAEUM_BEHALTEN.vorgabe : b.wert,
    tage: t.fehler ? AUFRAEUM_TAGE.vorgabe : t.wert
  };
}

/* Eine Zeile der Vorschau: dieselbe Schreibweise wie jeder Zeitstempel der
   Instanz, damit die Oberflaeche genau einen Weg hat, daraus ein Datum zu
   machen. */
const aufraeumZeile = (d, jetzt) => ({
  datei: d.name, bytes: d.bytes,
  am: new Date(d.zeit).toISOString().slice(0, 19).replace('T', ' '),
  tageHer: Math.max(0, Math.floor((jetzt - d.zeit) / TAG_MS))
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
function aufraeumVorschau(pfad, behalten, tage) {
  const dateien = sicherungsListe(pfad);
  if (dateien === null) return { erreichbar: false, dateien: [], treffer: [], bytes: 0, grund: '' };
  const marke = wechselMarke();
  const jetzt = Date.now();
  const alt = marke ? dateien.filter(d => d.zeit < marke.ms) : [];
  const brauchbar = marke ? dateien.filter(d => d.zeit >= marke.ms) : dateien;
  const treffer = regelTreffer(dateien, behalten, tage, jetzt, marke ? marke.ms : null);
  let grund = '';
  if (!treffer.length) {
    if (!dateien.length) grund = 'Hier gibt es noch keine Sicherung.';
    else if (!brauchbar.length)
      grund = `Keine der ${dateien.length} ${dateien.length === 1 ? 'Sicherung' : 'Sicherungen'} ` +
              'stammt von nach dem Schlüsselwechsel.';
    else if (brauchbar.length <= behalten)
      grund = `Alle ${brauchbar.length} ${brauchbar.length === 1 ? 'Sicherung' : 'Sicherungen'} ` +
              `sind unter den jüngsten ${behalten}.`;
    else {
      // Die AELTESTE der Kopien, die der Boden nicht mehr deckt -- sie ist die,
      // die als naechste faellt, und ihr Alter ist die Auskunft, auf die es
      // ankommt.
      const naechste = brauchbar[brauchbar.length - 1];
      const her = Math.max(0, Math.floor((jetzt - naechste.zeit) / TAG_MS));
      grund = `Die älteste ist ${her} ${her === 1 ? 'Tag' : 'Tage'} alt.`;
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
     BEIDE KOENNEN NICHT ZUGLEICH GELTEN -- regelTreffer() laesst die veralteten
     gar nicht erst durch. Die Karte darf sich darauf verlassen, und der
     Pruefstand haelt es fest. */
  const treffNamen = new Set(treffer.map(d => d.name));
  const altMs = marke ? marke.ms : null;
  return {
    erreichbar: true,
    dateien: dateien.map((d, i) => ({
      ...aufraeumZeile(d, jetzt), nr: i + 1,
      faellt: treffNamen.has(d.name),
      veraltet: altMs != null && d.zeit < altMs
    })),
    treffer: treffer.map(d => aufraeumZeile(d, jetzt)),
    bytes: treffer.reduce((n, d) => n + d.bytes, 0),
    grund,
    altZahl: alt.length,
    altBytes: alt.reduce((n, d) => n + d.bytes, 0),
    altDateien: alt.map(d => aufraeumZeile(d, jetzt))
  };
}

/* DAS LOESCHEN. Es bekommt den GEPRUEFTEN Ordner und die Liste der Namen, die
   die Regel eben genannt hat -- und haelt jeden Namen unmittelbar davor noch
   einmal gegen SICHERUNG_MUSTER und gegen `basename`. Zwei Pruefungen
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
const protokolliereEntfernt = (wer, zahl) => {
  for (let i = 0; i < zahl; i++) auth.protokolliere('sicherung.weg', { wer });
};

function entferneSicherungen(ordner, namen) {
  let weg = 0, bytes = 0;
  const geblieben = [];
  for (const n of namen) {
    const kurz = path.basename(String(n));
    if (kurz !== String(n) || !SICHERUNG_MUSTER.test(kurz)) { geblieben.push(kurz); continue; }
    const voll = path.join(ordner, kurz);
    try {
      const st = fs.lstatSync(voll);
      if (!st.isFile()) { geblieben.push(kurz); continue; }
      fs.unlinkSync(voll);
      weg++; bytes += st.size;
    } catch (e) {
      geblieben.push(kurz);
      console.error(`[Kriterion] Sicherung ${kurz} nicht entfernt: ${e.message}`);
    }
  }
  return { weg, bytes, geblieben };
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
  // waehrend VACUUM INTO laeuft, steht die Instanz.
  const dauer = Math.max(1, Math.round(dbBytes / 1048576 * SICHERUNG_MS_JE_MB / 1000));
  /* Die Marke steht auch dann in der Antwort, wenn der Zielort nicht erreichbar
     ist: DASS gewechselt wurde, ist eine Aussage ueber die Instanz und haengt
     nicht am Sicherungsort. Nur die ZAHL der veralteten Kopien haengt daran,
     und die ist dann ehrlich null statt geraten. */
  const marke = wechselMarke();
  const gewechseltAm = marke ? marke.am : null;
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
  const stand = aufraeumStand();
  let behalten = stand.behalten, tage = stand.tage;
  if (req.query.behalten !== undefined) {
    const g = pruefeRegelwert(req.query.behalten, AUFRAEUM_BEHALTEN, 'Immer behalten');
    if (g.fehler) return res.status(400).json({ error: g.fehler });
    behalten = g.wert;
  }
  if (req.query.tage !== undefined) {
    const g = pruefeRegelwert(req.query.tage, AUFRAEUM_TAGE, 'Erst löschen ab');
    if (g.fehler) return res.status(400).json({ error: g.fehler });
    tage = g.wert;
  }
  /* DIE GRENZEN GEHEN MIT HINAUS. Die Karte schreibt sie an ihre beiden
     Felder, statt sie ein zweites Mal zu kennen -- eine Zahl, die an zwei
     Orten steht, laeuft auseinander (Stolperstein 137). */
  const regel = { ...stand, behalten, tage,
                  grenzen: { behalten: AUFRAEUM_BEHALTEN, tage: AUFRAEUM_TAGE } };
  if (!lage.ein) return res.json({ eingerichtet: false, grund: lage.grund, ort,
                                   dbBytes, dauerSekunden: dauer, erreichbar: false, letzte: null,
                                   gewechseltAm, veraltet: 0, aufraeumen: regel });
  const ziel = pruefeOrt(ort);
  if (ziel.fehler) return res.json({ eingerichtet: true, wurzel: lage.wurzel, ort,
                                     imArbeitsverzeichnis: lage.imArbeitsverzeichnis,
                                     fehler: ziel.fehler, dbBytes, dauerSekunden: dauer,
                                     erreichbar: false, letzte: null,
                                     gewechseltAm, veraltet: 0, aufraeumen: regel });
  // Die Lage der WURZEL, nicht die des gewaehlten Unterverzeichnisses: sie ist
  // eine Eigenschaft der Einrichtung und aendert sich mit dem Zielort nicht.
  res.json({ eingerichtet: true, wurzel: lage.wurzel, ort, pfad: ziel.pfad,
             imArbeitsverzeichnis: lage.imArbeitsverzeichnis,
             dbBytes, dauerSekunden: dauer, ...letzteSicherung(ziel.pfad),
             aufraeumen: { ...regel, ...aufraeumVorschau(ziel.pfad, behalten, tage) } });
});

/* Der Ort ist eine Einstellung der INSTANZ und gehoert damit in settings, nicht
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
    return res.status(409).json({ error: 'In dieser Sekunde wurde dort schon eine Sicherung angelegt — bitte noch einmal.' });
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
     eine rote Meldung -- genau der Fehler aus 0.19.6 (Stolperstein 298).
     Der Aufruf steht deshalb in seinem eigenen `try`, und was er meldet, ist
     eine Angabe NEBEN der Sicherung, kein Ersatz fuer sie.
     ES GESCHIEHT NUR BEI EINGESCHALTETEM SCHALTER, und der steht auf AUS. */
  let aufgeraeumt = null;
  try {
    const regel = aufraeumStand();
    if (regel.an) {
      const treffer = regelTreffer(sicherungsListe(ziel.pfad) || [], regel.behalten, regel.tage,
                                   Date.now(), (wechselMarke() || {}).ms ?? null);
      if (treffer.length) {
        const raus = entferneSicherungen(ziel.pfad, treffer.map(d => d.name));
        aufgeraeumt = { weg: raus.weg, nicht: raus.geblieben.length, bytes: raus.bytes };
        if (raus.weg) {
          console.log(`[Kriterion] Alte Sicherungen entfernt: ${raus.weg} ` +
            `(${raus.bytes} Bytes frei)` +
            `${raus.geblieben.length ? `, ${raus.geblieben.length} nicht` : ''}.`);
          protokolliereEntfernt(req.benutzer.id, raus.weg);
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
             ...letzteSicherung(ziel.pfad), aufgeraeumt });
});

/* ---- DIE LOESCHROUTE ----------------------------------------------------
   POST /api/sicherung/aufraeumen -- die einundsiebzigste schreibende Route.
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

   DER ORDNER KOMMT AUS getSetting('sicherungOrt') UND GEHT DURCH pruefeOrt()
   -- dieselbe Pruefung wie beim Schreiben, dieselbe Funktion, kein zweites Mal
   hingeschrieben: Positivliste zuerst, `realpathSync` danach. */
app.post('/api/sicherung/aufraeumen', nurEigentuemer,
         zweiteBestaetigungNoetig('sicherung'), (req, res) => {
  const lage = sicherungLage();
  if (!lage.ein) return res.status(400).json({ error: lage.grund });
  const ziel = pruefeOrt(getSetting('sicherungOrt', ''));
  if (ziel.fehler) return res.status(400).json({ error: ziel.fehler });
  const art = String(req.body?.art || '');
  if (art !== 'regel' && art !== 'veraltet')
    return res.status(400).json({ error: 'Diese Art des Aufräumens gibt es nicht.' });
  const dateien = sicherungsListe(ziel.pfad);
  if (dateien === null)
    return res.status(400).json({ error: 'Der Sicherungsordner ist nicht erreichbar.' });
  const marke = wechselMarke();
  /* DIE GRENZEN HALTEN, BEVOR IRGENDETWAS GELOESCHT WIRD. Die Werte kommen aus
     settings und nicht aus dem Rumpf; steht dort einer ausserhalb der Spanne,
     ist das eine Absage und keine stille Rundung. */
  let treffer;
  if (art === 'veraltet') {
    if (!marke) return res.status(400).json({
      error: 'Der Schlüssel wurde nie gewechselt — es gibt keine veralteten Sicherungen.' });
    treffer = dateien.filter(d => d.zeit < marke.ms);
  } else {
    const b = pruefeRegelwert(getSetting('sicherungBehalten', AUFRAEUM_BEHALTEN.vorgabe),
                              AUFRAEUM_BEHALTEN, 'Immer behalten');
    if (b.fehler) return res.status(400).json({ error: b.fehler });
    const t = pruefeRegelwert(getSetting('sicherungTage', AUFRAEUM_TAGE.vorgabe),
                              AUFRAEUM_TAGE, 'Erst löschen ab');
    if (t.fehler) return res.status(400).json({ error: t.fehler });
    treffer = regelTreffer(dateien, b.wert, t.wert, Date.now(), marke ? marke.ms : null);
  }
  const raus = entferneSicherungen(ziel.pfad, treffer.map(d => d.name));
  if (raus.weg) {
    console.log(`[Kriterion] Alte Sicherungen entfernt (${art}): ${raus.weg} ` +
      `(${raus.bytes} Bytes frei)${raus.geblieben.length ? `, ${raus.geblieben.length} nicht` : ''}.`);
    /* NUR DIE ZAHL INS SICHERHEITSPROTOKOLL. Kein Freitext, kein Dateiname,
       kein Pfad -- das Protokoll haelt Vorgaenge fest, keine Orte auf dem Wirt
       (dieselbe Regel wie beim `sicherung`-Eintrag daneben). DIE
       FREIGEGEBENEN BYTES GEHOEREN NICHT IN DIE TABELLE, sondern in die
       Antwort und in die Zeile darueber: MERKMALE ist eine geschlossene Liste
       und bleibt bei vierzehn. */
    protokolliereEntfernt(req.benutzer.id, raus.weg);
  }
  /* DIE ANTWORT NENNT, WAS WIRKLICH GELOESCHT WURDE, und traegt die Vorschau
     frisch daneben: die Karte zeichnet sich daraus neu, statt ihren alten
     Stand fortzuschreiben. */
  const nach = aufraeumStand();
  res.json({ ok: true, art, weg: raus.weg, nicht: raus.geblieben.length, bytes: raus.bytes,
             ...letzteSicherung(ziel.pfad),
             aufraeumen: { ...nach,
                           grenzen: { behalten: AUFRAEUM_BEHALTEN, tage: AUFRAEUM_TAGE },
                           ...aufraeumVorschau(ziel.pfad, nach.behalten, nach.tage) } });
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
   (err.status) und behaelt Rang und Meldung; Multer-Fehler ebenso.
   Alles Uebrige ist ein Fehler DES SERVERS und wird 500 mit festem Text: ein
   SQL-Fehler nennt Tabellen und Spalten, ein sharp-Absturz den Pfad. Die
   Einzelheiten stehen im Protokoll, und dort gehoeren sie hin. */
app.use((err, req, res, next) => {
  console.error(err);
  const rang = err.status || err.statusCode || (err instanceof multer.MulterError ? 400 : 500);
  if (rang >= 500) return res.status(500).json({ error: 'Auf dem Server ist ein Fehler aufgetreten.' });
  res.status(rang).json({ error: err.message || 'Unbekannter Fehler' });
});

/* ================= Start ================= */
/* AUSDRUECKLICH NUR BILDER. Eine Videozeile traegt in data die Videodatei --
   sharp liefe darauf in einen Fehler, beide Varianten kaemen leer zurueck und
   das vorhandene Standbild waere ueberschrieben. Die Zeile bliebe ausserdem
   bei jedem Start aufs Neue faellig. Und der Kernsatz gilt auch hier: der
   Server oeffnet nie ein Video. Das Standbild kommt vom Browser.

   DIE SCHLEIFE SELBST LAEUFT SEIT 0.19.3 IM THREAD (bestandslauf.js) --
   dieselbe Bauform und derselbe Grund wie bei der Umstellung: sie liest und
   schreibt Blobs, und better-sqlite3 ist synchron.
   DIE FRAGE, OB ES ETWAS ZU TUN GIBT, BLEIBT HIER. Ohne sie entstuende bei
   jedem Start ein Thread fuer eine leere Liste -- 19 ms fuer die Verbindung
   und 76 ms fuer sharp, fuer nichts. */
function ruesteVorschaubilderNach() {
  const offen = db.prepare(
    "SELECT id FROM photos WHERE (thumb IS NULL OR medium IS NULL) AND art != 'video'").all();
  if (!offen.length) return erneuereKacheln();
  /* maintainStorage() ERST DANACH, und deshalb steht es hier im Abschluss und
     nicht in einer Kette daneben: es fasst die ganze Datei an (beim ersten Mal
     ein VACUUM) und darf nicht neben der Schleife laufen.
     SEIT 0.19.4 STEHT DAS NACHZIEHEN DAZWISCHEN, und die drei laufen
     NACHEINANDER und nicht nebeneinander. Zwei Bestandsthreads gleichzeitig
     schrieben beide in `photos`, und der Stand fuer die Karte ist EINE
     Variable -- der zweite ueberschriebe den ersten, und die Karte zeigte
     abwechselnd zwei Laeufe (Stolperstein 47). */
  starteBestandsThread('vorschaubilder', offen, erneuereKacheln);
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
function erneuereKacheln() {
  const zeilen = qKachelZeilen.all();
  if (!zeilen.length) return maintainStorage();
  starteBestandsThread('geometrie', zeilen, maintainStorage);
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
// gepflegte Liste liefe auseinander -- und pruefung.js und Doku/ koennen so
// gar nicht erst hineingeraten (sie liegen nicht im Image).
//
// DIE GRENZE, DIE DARAUS FOLGT, IST ABSICHT: zugang.js liegt im Image, wird
// aber nur von Hand aufgerufen und steht deshalb nicht im Fingerprint. Er
// sagt, WELCHER SERVER LAEUFT.
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
  /* UND DIE DATEI, DIE NUR IM THREAD LEBT -- 0.19.3. bestandslauf.js wird
     nicht requiret, sondern an `new Worker` gereicht; es steht deshalb in
     keiner require.cache des Haupt-Threads und fiele aus der Ableitung
     heraus. DER SERVER FUEHRT ES TROTZDEM AUS, und genau das ist der Massstab
     dieser Liste. Es ist KEINE zweite, gepflegte Liste: gelesen wird
     dieselbe Konstante, mit der der Thread erzeugt wird, und eine Pruefung
     haelt beide gegeneinander. */
  const liste = [...new Set([...ausgefuehrt, BESTANDSLAUF,
                             ...dateienUnter(path.join(__dirname, 'public'))])]
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
    /* ERST DIE THREADS, DANN DIE DATEI -- 0.19.3. Laeuft ein Bestandslauf,
       schreibt er in dieselbe Datei; wer ihre WAL kuerzt, waehrend er
       schreibt, tut genau das, wogegen dieser Abschluss gebaut ist.
       terminate() OHNE await: der Abschluss darf nicht warten, und ein
       beendeter Thread schreibt keine Zeile mehr. Die halb umgestellte Zeile,
       die er gerade in der Hand hatte, bleibt PNG -- der Knopf holt sie beim
       naechsten Lauf nach, und genau dafuer ist er nie endgueltig. */
    for (const w of bestandsThreads) { try { w.terminate(); } catch {} }
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
  /* Die Betriebsart gehoert ins Protokoll: an ihr haengt, ob die Koepfe des
     Proxys ueberhaupt angesehen werden. Wer sie falsch stehen hat, sieht es
     hier und nicht erst an einer wirkungslosen Anmeldebremse.
     SIE NENNT SEIT 0.13.0 BEIDE WEGE: Cookiename, Secure und HSTS haengen
     nicht mehr an ihr, sondern an der einzelnen Anfrage. Eine Zeile, die eine
     Buendelung behauptet, die es nicht mehr gibt, waere schlechter als keine. */
  console.log(`[Kriterion] Hinter Proxy: ${auth.HINTER_PROXY ? 'an' : 'aus'} — ` +
    (auth.HINTER_PROXY
      ? 'X-Forwarded-For und X-Forwarded-Proto werden gelesen; über HTTPS gilt ' +
        `${auth.COOKIE_SICHER} mit Secure und HSTS, über das Heimnetz ${auth.COOKIE_NAME}`
      : `kein Kopf wird gelesen, jede Anfrage gilt als Klartext: ${auth.COOKIE_NAME} ohne Secure`));
  /* Die oeffentliche Adresse gehoert ins Protokoll: an ihr haengt, welchen
     Link ein Empfaenger bekommt. Wer sie falsch stehen hat, sieht es hier und
     nicht erst am toten Link beim Empfaenger. */
  if (OEFFENTLICHE.fehler) {
    console.warn(`[Kriterion] OEFFENTLICHE_ADRESSE ist unbrauchbar: ${OEFFENTLICHE.fehler} ` +
      'Die Instanz laeuft weiter; den Einladungslink baut wie bisher der Browser des Admins.');
  } else if (OEFFENTLICHE.adresse) {
    console.log(`[Kriterion] Oeffentliche Adresse: ${OEFFENTLICHE.adresse} — ` +
      'Einladungslinks werden damit gebaut.');
    if (auth.HINTER_PROXY && OEFFENTLICHE.adresse.startsWith('http://')) {
      // Widerspruch, aber kein Verlust: ein falscher Link ist ein toter Link.
      // Eine Absage waere hier haerter als der Schaden.
      console.warn('[Kriterion] Hinter einem Proxy und trotzdem http:// in ' +
        'OEFFENTLICHE_ADRESSE — verschickte Links fuehren dann am Proxy vorbei ' +
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
  /* DAS NACHRUESTEN, DAS NACHZIEHEN UND DIE SPEICHERPFLEGE, 1500 ms nach dem
     Horchen. Die Kette aus .then() ist weggefallen, weil die Schleifen nicht
     mehr hier laufen: jeder Schritt gibt den naechsten als Abschluss an den
     Thread weiter und ruft ihn selbst, wenn es fuer ihn nichts zu tun gibt.
     Am Ende der Kette steht maintainStorage(). Der Fehlerfall haengt am
     Thread (worker.on('error')) -- und er beendet die Kette: der Abschluss
     laeuft am 'exit', und den gibt es auch nach einem Fehler. */
  setTimeout(ruesteVorschaubilderNach, 1500);
});
