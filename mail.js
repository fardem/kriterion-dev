const crypto = require('crypto');
const nodemailer = require('nodemailer');

/* ================= Der Mailversand =================

   DIE ERSTE VERBINDUNG NACH DRAUSSEN. Bis 0.8.91 hat die Anlage nur auf
   Anfragen geantwortet; ab hier baut sie von sich aus eine Verbindung zu einem
   fremden Server auf. Das ist eine Aenderung der Betriebsart und nicht eine
   weitere Funktion -- jede Entscheidung in dieser Datei steht unter dieser
   Ueberschrift.

   UND DER SATZ, DER UEBER ALLEM STEHT: jeder Link, der verschickt wird, ist im
   Verwaltungsbereich zusaetzlich zum Kopieren sichtbar. Schlaegt der Versand
   fehl, bricht nichts ab. E-MAIL IST EINE BEQUEMLICHKEIT, KEINE VORAUSSETZUNG
   -- eine Anlage ohne Mailzugang laeuft vollstaendig. Deshalb wirft in dieser
   Datei NICHTS nach aussen: versende() liefert ein Ergebnis, nie eine
   Ausnahme, und der Aufrufer schreibt seine Antwort ohnehin.

   NUR AUSGEHEND. Kein Empfang, kein offener Port, kein Abholen.

   IMMER UEBER DEN SMTP-ZUGANG EINES ANBIETERS, nie unmittelbar vom
   Hausanschluss: dort fehlen rDNS und SPF/DKIM, und die Mail landet im besten
   Fall im Spam. Deshalb die Vorlagen unten und kein eigener Versandweg. */

/* ---- Die Anbietervorlagen ----
   NACH DEM MUSTER DER SUCHANBIETER (server.js): eine gepflegte Liste im
   Quelltext, kein Freitext. Der Server speichert einen Schluessel, also muss
   er die Liste kennen -- eine Liste, eine Pruefung, eine Stelle.

   'eigen' STEHT MIT IN DER LISTE UND IST DOCH KEINE VORLAGE: dort traegt der
   Eigentuemer Server, Port und Verschluesselung selbst ein. Es als Fehlen
   eines Eintrags zu bauen waere eine zweite Wahrheit daneben -- die Frage
   "welcher Anbieter" haette dann zwei Antwortarten.

   PORT UND VERSCHLUESSELUNG GEHOEREN ZUSAMMEN und werden deshalb nicht
   getrennt gepflegt: 465 ist von Anfang an verschluesselt (implizites TLS),
   587 beginnt im Klartext und schaltet mit STARTTLS um. Ein Port ohne die
   passende Angabe ergibt eine Verbindung, die entweder haengt oder im
   Klartext bleibt. */
const ANBIETER = [
  { schluessel: 'gmx',    name: 'GMX',           server: 'mail.gmx.net',       port: 587, sicher: false },
  { schluessel: 'web',    name: 'Web.de',        server: 'smtp.web.de',        port: 587, sicher: false },
  { schluessel: 'gmail',  name: 'Gmail',         server: 'smtp.gmail.com',     port: 465, sicher: true },
  { schluessel: 'strato', name: 'Strato',        server: 'smtp.strato.de',     port: 465, sicher: true },
  { schluessel: 'ionos',  name: 'IONOS',         server: 'smtp.ionos.de',      port: 587, sicher: false },
  { schluessel: 'eigen',  name: 'Eigener Server', server: '',                  port: 587, sicher: false }
];

/* DREI HINWEISE GEHOEREN AN DEN BILDSCHIRM, und sie stehen hier statt in
   app.js: sie haengen am Anbieter, und der Server kennt die Anbieterliste.
   Zwei Ausfertigungen derselben Hinweise liefen auseinander, sobald ein
   Anbieter dazukommt. Der dritte gilt fuer alle und steht deshalb ohne
   Schluessel darunter. */
const HINWEISE = {
  gmail: 'Gmail verlangt Zwei-Faktor und ein App-Passwort — das Kontopasswort wird abgewiesen.',
  gmx: 'GMX verlangt, den Versand über fremde Programme im Konto erst freizuschalten.',
  web: 'Web.de verlangt, den Versand über fremde Programme im Konto erst freizuschalten.'
};
const HINWEIS_IMMER =
  'Die Absenderadresse muss zum Konto gehören — über GMX lässt sich nicht als fremde Adresse senden.';

/* ---- Die Frist ----
   SMTP KANN MINUTENLANG NICHTS SAGEN, und nodemailers eigene Vorgaben sind
   fuer einen Menschen vor dem Bildschirm unbrauchbar: zwei Minuten fuer die
   Verbindung, dreissig Sekunden fuer den Gruss, ZEHN MINUTEN fuer den Socket.

   DIE ZAHL IST HERGELEITET, NICHT GERATEN. Ein vollstaendiges SMTP-Gespraech
   ueber TLS sind rund acht Umlaeufe (Verbindung, TLS, Gruss, EHLO, AUTH,
   MAIL FROM, RCPT TO, DATA/QUIT). Bei schlechten 300 ms Umlaufzeit ist das
   unter drei Sekunden. VERSAND_MS gibt dem den achtfachen Abstand und bleibt
   weit unter dem, was Browser und Proxy von sich aus abbrechen.

   DIE AEUSSERE SCHRANKE IST DIE TRAGENDE, und sie ist keine Zierde neben den
   drei Fristen darunter: die drei decken Verbindung, Gruss und einen
   SCHWEIGENDEN Socket. Ein Empfaenger, der auf TCP-Ebene brav antwortet und
   auf den Befehl nie, faellt durch alle drei hindurch. Deshalb liegt ueber
   dem ganzen Versand ein Wettlauf, und DER haelt die Zusage. */
const VERSAND_MS = 20 * 1000;
const VERBINDUNG_MS = 7 * 1000;
const GRUSS_MS = 7 * 1000;

/* ---- Was in settings liegt ----
   DER MAILZUGANG GEHOERT DEM EIGENTUEMER, NICHT DEM ADMIN, und das ist die
   tragende Entscheidung dieser Datei. Der SMTP-Server sieht JEDE Mail, die
   durch ihn geht, und jede dieser Mails traegt einen Link, der ein Passwort
   setzt. Duerfte ein ADMIN den Server eintragen, liefe die Ruecksetzmail des
   Eigentuemers ueber einen Server seiner Wahl -- genau der Weg an der
   Rollenleiter vorbei, den es nicht geben darf. Ueber dem Eigentuemer steht
   niemand: wer ohnehin den ganzen Bestand exportieren und den Schluesselwert
   sehen darf, gewinnt durch einen umgebogenen Mailserver nichts dazu.

   ER LIEGT IN settings UND NICHT IN DER .env, und das ist eine Abweichung vom
   Auftrag dieser Runde, ausdruecklich so entschieden. Die Begruendung ist
   dieselbe wie fuer jede andere Adminsache in Abschnitt 11 des Projektstands:
   die .env traegt, was VOR dem Oeffnen der Datenbank lesbar sein muss, und der
   Mailzugang muss das nicht. Zwei Dinge kommen hinzu -- das Mailpasswort liegt
   damit in der VERSCHLUESSELTEN Datenbank statt unverschluesselt auf dem Wirt,
   und die Exportdatei traegt settings nicht mit (der Export packt Eintraege).

   DER SCHLUESSEL IST EINER UND NICHT SECHS: eine Zeile in settings mit einem
   Objekt darin. Sechs Schluessel waeren sechs Stellen, an denen ein halb
   geschriebener Zugang entstehen kann -- und ein Zugang mit Server, aber ohne
   Passwort, ist kein Zustand, den es geben soll. */
const SCHLUESSEL = 'mailzugang';

const LEER = { anbieter: '', server: '', port: 0, sicher: false, benutzer: '', passwort: '', absender: '' };

// Wie eine Adresse aussehen darf. BEWUSST GROB: eine Adresse laesst sich am
// Muster ohnehin nicht auf Gueltigkeit pruefen -- den Beweis liefert erst die
// Mail, die ankommt. Was hier abgewiesen wird, ist das, was gar keine Adresse
// sein kann: kein @, Leerzeichen, zwei @, nichts davor oder dahinter.
const ADRESSE_MUSTER = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const istAdresse = (a) => ADRESSE_MUSTER.test(String(a || '').trim());

const anbieterZu = (schluessel) => ANBIETER.find(a => a.schluessel === schluessel) || null;

/* Loest den gespeicherten Zugang zu dem auf, was der Versand wirklich braucht.
   DIE VORLAGE GEWINNT UEBER DAS GESPEICHERTE, ausser bei 'eigen': wer GMX
   gewaehlt hat und bei dem der Anbieter morgen den Port wechselt, bekommt den
   neuen Port aus dem Quelltext. Stuenden die Werte auch bei einer Vorlage in
   der Datenbank, waeren sie eine eingefrorene Kopie und liefen auseinander. */
function loeseAuf(roh) {
  const z = { ...LEER, ...(roh && typeof roh === 'object' ? roh : {}) };
  const v = anbieterZu(z.anbieter);
  if (!v) return { ...LEER };
  if (v.schluessel === 'eigen') {
    return { ...z, server: String(z.server || '').trim(),
             port: Number(z.port) || 0, sicher: z.sicher === true };
  }
  return { ...z, server: v.server, port: v.port, sicher: v.sicher };
}

/* Der Zustand fuer den Bildschirm. DAS PASSWORT KOMMT HIER NIE HERAUS -- nur
   die Feststellung, DASS eines gesetzt ist. Nie die Laenge, nie der Anfang,
   nie Sternchen mit der richtigen Zahl: aus jedem davon liesse sich etwas
   ableiten, und keines davon hilft dem, der die Karte ansieht. */
function zustand(roh) {
  const z = loeseAuf(roh);
  const v = anbieterZu(z.anbieter);
  return {
    anbieter: z.anbieter, anbieterName: v ? v.name : '',
    server: z.server, port: z.port, sicher: z.sicher,
    benutzer: z.benutzer, absender: z.absender,
    passwortGesetzt: Boolean(z.passwort),
    hinweis: HINWEISE[z.anbieter] || '', hinweisImmer: HINWEIS_IMMER
  };
}

/* Ist der Zugang vollstaendig? ERST DER GEGENSTAND, DANN DIE EIGENSCHAFT
   (Stolperstein 81): ein leerer Zugang ist nicht "in Ordnung", er ist keiner.
   'eigen' braucht Server und Port zusaetzlich -- bei einer Vorlage stehen sie
   im Quelltext und koennen gar nicht fehlen. */
function eingerichtet(roh) {
  const z = loeseAuf(roh);
  if (!anbieterZu(z.anbieter)) return false;
  if (!z.server || !z.port) return false;
  return Boolean(z.benutzer && z.passwort && istAdresse(z.absender));
}

/* Prueft, was von aussen hereinkommt, und liefert den Wert zum Speichern.
   WIRFT MIT KLARTEXT -- der Aufrufer gibt die Meldung unveraendert weiter.
   DAS PASSWORT DARF LEER BLEIBEN UND HEISST DANN "unveraendert": sonst muesste
   der Eigentuemer es bei jeder Aenderung am Absender neu tippen, und ein
   Formular, das ein Geheimnis zum Aendern einer Nebensache verlangt, wird
   irgendwann mit einem falschen Wert gespeichert. Ein leerer Zugang wird
   ausdruecklich zugelassen: so wird der Versand wieder abgeschaltet. */
function pruefeEingabe(ein, bisher) {
  const e = ein && typeof ein === 'object' ? ein : {};
  const alt = loeseAuf(bisher);
  const anbieter = String(e.anbieter || '').trim();
  if (!anbieter) return { ...LEER };
  const v = anbieterZu(anbieter);
  if (!v) throw new Error('Diesen Anbieter gibt es nicht.');

  const benutzer = String(e.benutzer ?? '').trim();
  const absender = String(e.absender ?? '').trim();
  // Ein neues Passwort wird genommen, wie es ist -- NICHT beschnitten. Ein
  // Leerzeichen am Ende kann Teil des Passworts sein, und ein stillschweigend
  // abgeschnittenes Zeichen ergaebe eine Absage, die niemand erklaeren kann.
  const passwort = typeof e.passwort === 'string' && e.passwort !== ''
    ? e.passwort : String(alt.passwort || '');

  if (!benutzer) throw new Error('Der Benutzername beim Anbieter fehlt.');
  if (!passwort) throw new Error('Das Passwort beim Anbieter fehlt.');
  if (!istAdresse(absender)) throw new Error('Die Absenderadresse ist keine gültige E-Mail-Adresse.');

  const raus = { anbieter, benutzer, passwort, absender, server: '', port: 0, sicher: false };
  if (v.schluessel !== 'eigen') return raus;

  const server = String(e.server || '').trim();
  const port = Number(e.port);
  if (!server) throw new Error('Beim eigenen Server fehlt der Servername.');
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Der Port muss eine Zahl zwischen 1 und 65535 sein.');
  return { ...raus, server, port, sicher: e.sicher === true };
}

/* Eine Marke ueber den Zugang, mit der sich "seit dem Test hat sich nichts
   geaendert" belegen laesst. SIE TRAEGT DAS PASSWORT NICHT IM KLARTEXT und
   auch nicht seine Laenge: gehasht wird der ganze Zugang in einem Zug.
   Sie steht hier und nicht in server.js, weil sie die Felder dieser Datei
   kennt -- eine zweite Aufzaehlung daneben liefe beim naechsten Feld
   auseinander. */
function marke(roh) {
  const z = loeseAuf(roh);
  return crypto.createHash('sha256')
    .update(JSON.stringify([z.anbieter, z.server, z.port, z.sicher, z.benutzer, z.passwort, z.absender]))
    .digest('hex').slice(0, 16);
}

/* ---- Der Versand selbst ----
   LIEFERT EIN ERGEBNIS, WIRFT NIE. Das ist die bauliche Form des Satzes
   "E-Mail ist eine Bequemlichkeit": ein Aufrufer, der ein try/catch vergisst,
   koennte sonst den Tokenweg mitreissen -- und der Token ist die Sache, die
   auf jeden Fall entstehen muss.

   REINER TEXT, KEIN HTML, KEINE BILDER, KEINE ANHAENGE. Eine Mail, die ein
   Passwortsetzen ankuendigt, hat keinen Grund, etwas nachzuladen; ein
   Zaehlpixel waere ausgerechnet dort eine Rueckmeldung an einen Dritten.

   DER LINK STEHT IM ROHEN BRIEF UMBROCHEN, UND DAS IST RICHTIG SO -- wer es
   fuer einen Fehler haelt, macht es schlimmer. Der Rumpf geht als
   quoted-printable hinaus, und dessen Zeilen enden spaetestens bei 76 Zeichen;
   die Adresse ist mit dem Schluessel laenger und bekommt deshalb einen WEICHEN
   Umbruch (`=` am Zeilenende). Jedes Mailprogramm setzt ihn beim Anzeigen
   wieder zusammen -- nachgestellt, nicht geglaubt. Wer im Pruefstand am rohen
   Brief nach dem Schluessel sucht, findet ihn deshalb nicht: dort wird
   dekodiert, wie ein Empfaenger es auch tut (Stolperstein 90). */
function baueVersender(z) {
  return nodemailer.createTransport({
    host: z.server, port: z.port, secure: z.sicher === true,
    auth: { user: z.benutzer, pass: z.passwort },
    connectionTimeout: VERBINDUNG_MS, greetingTimeout: GRUSS_MS, socketTimeout: VERSAND_MS,
    // Die Anlage schickt eine Handvoll Mails im Monat. Eine offen gehaltene
    // Verbindung waere eine Verbindung nach draussen, die ohne Anlass steht.
    pool: false
  });
}

async function versende(roh, an, betreff, text) {
  const z = loeseAuf(roh);
  if (!eingerichtet(z)) return { ok: false, grund: 'Es ist kein Mailzugang eingerichtet.' };
  if (!istAdresse(an)) return { ok: false, grund: 'Der Empfänger hat keine gültige Adresse.' };
  let versender = null;
  try {
    versender = baueVersender(z);
    /* DER WETTLAUF IST DIE ZUSAGE. Er steht hier und nicht beim Aufrufer:
       eine Frist, die jede Route selbst setzen muesste, waere an der Route
       vergessen, die als naechste dazukommt. */
    let uhr;
    const frist = new Promise((_, fehler) => {
      uhr = setTimeout(() => fehler(new Error('Der Mailserver hat nicht rechtzeitig geantwortet.')),
        VERSAND_MS);
    });
    try {
      await Promise.race([
        versender.sendMail({ from: z.absender, to: an, subject: betreff, text }),
        frist
      ]);
    } finally { clearTimeout(uhr); }
    return { ok: true, grund: '' };
  } catch (e) {
    /* WAS AUS DER MELDUNG DES ANBIETERS UEBERNOMMEN WIRD, IST BESCHNITTEN --
       und der Grund ist nicht die Laenge: manche Server geben die
       Anmeldedaten in der Absage zurueck ("535 5.7.8 Username and Password
       not accepted for <benutzer>"). Der Anfang traegt den Fehlercode, und
       der ist das, was hilft. */
    return { ok: false, grund: kurzerGrund(e) };
  } finally {
    // Auch im Fehlerfall: eine haengende Verbindung nach draussen ist genau
    // das, was diese Anlage nicht offen halten soll (Stolperstein 134 in
    // seiner Form fuer Sockets).
    try { if (versender) versender.close(); } catch {}
  }
}

function kurzerGrund(e) {
  const roh = String((e && e.message) || 'Unbekannter Fehler').replace(/\s+/g, ' ').trim();
  return roh.length > 120 ? roh.slice(0, 117) + '…' : roh;
}

/* ---- Die beiden Mailtexte ----
   SIE STEHEN HIER UND NICHT IN server.js: der Text gehoert zur Sache, und
   zwei Ausfertigungen desselben Textes liefen auseinander.
   DER LINK STEHT IM FRAGMENT (#/einladung/…) UND GEHT DAMIT NIE AN DEN SERVER
   -- in der Mail genauso wie beim Kopieren. Das traegt hier zusaetzlich: ein
   Vorschaudienst, der Links im Postfach vorab abruft, holt nur die Seite und
   nie das Fragment. Die Frist ab dem ersten Oeffnen kann er deshalb nicht
   ausloesen. */
function textEinladung({ titel, username, link, tage, minuten }) {
  return [
    `Hallo ${username},`,
    '',
    `für dich wurde ein Zugang zu „${titel}“ angelegt.`,
    '',
    'Über diesen Link setzt du dein Passwort selbst:',
    link,
    '',
    `Der Link gilt ${tage} Tage und genau einmal.`,
    `Sobald du ihn zum ersten Mal öffnest, hast du ${minuten} Minuten Zeit, das Passwort zu setzen.`,
    'Innerhalb dieser Zeit darfst du die Seite so oft neu laden, wie du möchtest.',
    'Danach gilt der Link nicht mehr, und der Admin muss dir einen neuen schicken.',
    '',
    'Wer diesen Link hat, kommt herein — gib ihn an niemanden weiter.',
    '',
    'Diese Nachricht wurde automatisch verschickt. Antworten darauf liest niemand.'
  ].join('\n');
}

function textRuecksetzung({ titel, username, link, tage, minuten }) {
  return [
    `Hallo ${username},`,
    '',
    `für deinen Zugang zu „${titel}“ wurde ein Link zum Zurücksetzen des Passworts erzeugt.`,
    '',
    link,
    '',
    `Der Link gilt ${tage} Tage und genau einmal.`,
    `Sobald du ihn zum ersten Mal öffnest, hast du ${minuten} Minuten Zeit, das Passwort zu setzen.`,
    'Innerhalb dieser Zeit darfst du die Seite so oft neu laden, wie du möchtest.',
    'Danach gilt der Link nicht mehr, und der Admin muss dir einen neuen schicken.',
    '',
    'Hast du das nicht angefordert, sag dem Admin Bescheid — dein bisheriges',
    'Passwort gilt unverändert weiter, solange der Link nicht benutzt wird.',
    '',
    'Diese Nachricht wurde automatisch verschickt. Antworten darauf liest niemand.'
  ].join('\n');
}

function textTest({ titel, username }) {
  return [
    `Hallo ${username},`,
    '',
    `das ist die Testmail aus „${titel}“.`,
    '',
    'Kommt sie an, steht der Mailversand: Einladungen und Rücksetzlinks gehen',
    'ab jetzt von selbst hinaus. Der Link steht im Verwaltungsbereich weiterhin',
    'zusätzlich zum Kopieren bereit — daran ändert sich nichts.',
    '',
    'Diese Nachricht wurde automatisch verschickt. Antworten darauf liest niemand.'
  ].join('\n');
}

module.exports = {
  ANBIETER, HINWEISE, HINWEIS_IMMER, SCHLUESSEL,
  VERSAND_MS, VERBINDUNG_MS, GRUSS_MS,
  istAdresse, anbieterZu, loeseAuf, zustand, eingerichtet, pruefeEingabe, marke,
  versende, textEinladung, textRuecksetzung, textTest
};
