/* Kriterion — Anhaenge: Auslieferung und Vorschau
 *
 * ACHTUNG, SICHERHEITSREGEL: Eine Anlage darf niemals so ausgeliefert werden,
 * dass der Browser sie als Webseite ausfuehrt. Alles in dieser Datei dient
 * diesem einen Zweck. Wer hier etwas aendert, liest bitte zuerst die
 * Begruendungen -- jede einzelne Massnahme steht dort, wo sie greift.
 *
 * Die Verteidigung liegt in Schichten, damit kein einzelner Fehler genuegt:
 *
 *   1. Der gemeldete Typ des Hochladenden wird gespeichert, aber NIE zum
 *      Ausliefern benutzt. Ausgeliefert wird ein Typ aus der Liste unten.
 *   2. Alles Unbekannte geht als application/octet-stream raus.
 *   3. Content-Disposition ist attachment, ausser fuer eine kurze Positivliste.
 *   4. X-Content-Type-Options: nosniff -- sonst darf der Browser raten.
 *   5. Content-Security-Policy: default-src 'none' plus sandbox. Fuer PDF
 *      lautet sie 'sandbox allow-scripts' -- siehe die Begruendung bei
 *      sicherheitsRegel() weiter unten.
 *   6. Der Dateiname wird fuer die Kopfzeile entschaerft (Zeilenumbrueche und
 *      Anfuehrungszeichen raus), sonst liessen sich Kopfzeilen einschleusen.
 *   7. Text, Markdown, CSV und Log werden gar nicht als Datei ausgeliefert,
 *      sondern gelesen und als JSON geschickt. Der Browser interpretiert sie
 *      damit ueberhaupt nie.
 *   8. SVG steht bewusst NICHT auf der Vorschauliste: eine SVG-Datei kann
 *      Skript enthalten, und ein direkt geoeffneter Tab ist eine Webseite.
 *   9. Wo kein Dateiname mitgefuehrt wird, entscheiden die ERSTEN BYTES --
 *      typAusBytes(). Ein gespeicherter Typ ist eine Angabe des Hochladenden
 *      und taugt zum Ausliefern so wenig wie eine Endung, die er selbst
 *      gewaehlt hat. Gilt fuer die Fotos, siehe setzeBildKopfzeilen().
 */
const zlib = require('zlib');

/* ================= Typen ================= */

// Bilder, die gefahrlos eingebettet werden koennen. Bewusst ohne SVG.
const BILD_TYPEN = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', avif: 'image/avif', bmp: 'image/bmp'
};

/* Kurzvideos am Fotoplatz. EINE Liste fuer beide Richtungen: die Endung eines
 * Anhangs (TYP_NACH_ENDUNG weiter unten) und der Name einer ausgelieferten
 * Zeile aus photos, wo gar kein Dateiname gespeichert ist
 * (setzeBildKopfzeilen). Zwei Listen fuer dieselbe Frage liefen auseinander.
 * .mov ist der Grenzfall, den die Praxis erzwingt -- jedes iPhone liefert ihn.
 * Verboten wird er nicht; ob er taugt, entscheidet die Standbildpruefung im
 * Browser des Hochladenden: wer ein Video nicht abspielen kann, kann kein
 * Standbild daraus ziehen und laedt es deshalb gar nicht erst hoch.
 * Alles Uebrige -- .avi, .mkv, .wmv, .flv -- gehoert an den Anhang. Dort wird
 * es heruntergeladen, und das ist die ehrliche Antwort. */
const VIDEO_TYPEN = {
  mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime'
};

// Dieselbe Liste rueckwaerts, fuer den Namen einer ausgelieferten Datei.
// Tragen zwei Endungen denselben Typ, gewinnt die erste (mp4 vor m4v).
const ENDUNG_NACH_TYP = {};
for (const [e, t] of Object.entries(VIDEO_TYPEN)) if (!ENDUNG_NACH_TYP[t]) ENDUNG_NACH_TYP[t] = e;

// Dateien, deren Inhalt als Text gelesen und als JSON geschickt wird.
const TEXT_ENDUNGEN = ['txt', 'md', 'markdown', 'csv', 'tsv', 'log', 'ini', 'conf'];

// Endung -> ausgelieferter Typ. Alles, was hier fehlt, wird
// application/octet-stream. Die Liste enthaelt absichtlich kein html, xhtml,
// svg, xml oder aehnliches.
const TYP_NACH_ENDUNG = {
  ...BILD_TYPEN,
  ...VIDEO_TYPEN,
  pdf: 'application/pdf',
  txt: 'text/plain', md: 'text/plain', markdown: 'text/plain',
  csv: 'text/plain', tsv: 'text/plain', log: 'text/plain',
  ini: 'text/plain', conf: 'text/plain',
  zip: 'application/zip', '7z': 'application/x-7z-compressed',
  gz: 'application/gzip', tar: 'application/x-tar',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  mp3: 'audio/mpeg', wav: 'audio/wav', json: 'application/json'
};

/* NUR diese Typen duerfen inline ausgeliefert werden. Alles andere bekommt
 * Content-Disposition: attachment, egal was es ist.
 * DIE VIDEOTYPEN STEHEN HIER, WEIL EIN VIDEO SONST HERUNTERGELADEN STATT
 * ABGESPIELT WUERDE. Vertretbar ist das aus demselben Grund wie beim Bild: ein
 * Video ist keine Webseite. Die tragenden Schichten bleiben unveraendert --
 * eigener Content-Type statt dem des Hochladenden, nosniff, und die
 * Sicherheitsregel default-src 'none'; sandbox auf der Antwort.
 * HINZUNEHMENDE FOLGE: auch ein ANHANG mit Videoendung darf damit inline
 * heraus, wenn er ausdruecklich so angefordert wird. Die Oberflaeche fordert
 * inline nur fuer Bild und PDF an; von Hand geholt spielt er dann ab, statt
 * herunterzuladen. */
const INLINE_ERLAUBT = new Set([...Object.values(BILD_TYPEN),
                                ...Object.values(VIDEO_TYPEN), 'application/pdf']);

const endung = (name) => {
  const m = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
};

/* ================= Auslieferung ================= */

// Der ausgelieferte Typ kommt aus der eigenen Liste, niemals vom Hochladenden.
// Ein umbenanntes Schadprogramm bekommt hier hoechstens den harmlosen Typ
// seiner neuen Endung -- und wird durch alles Weitere ohnehin nur geladen.
function ausgabeTyp(dateiname) {
  return TYP_NACH_ENDUNG[endung(dateiname)] || 'application/octet-stream';
}

// Art der Vorschau. Entscheidet allein die Endung, nicht der gemeldete Typ.
function vorschauArt(dateiname) {
  const e = endung(dateiname);
  if (BILD_TYPEN[e]) return 'bild';
  if (e === 'pdf') return 'pdf';
  if (TEXT_ENDUNGEN.includes(e)) return 'text';
  if (e === 'docx') return 'docx';
  return 'keine';
}

// Dateiname fuer die Kopfzeile. Zeilenumbrueche wuerden erlauben, weitere
// Kopfzeilen einzuschleusen; Anfuehrungszeichen wuerden den Wert beenden.
// Zusaetzlich die Form nach RFC 5987, damit Umlaute ankommen.
function dispositionKopf(dateiname, inline) {
  const roh = String(dateiname || 'datei').replace(/[\r\n]/g, ' ');
  const schlicht = roh.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  const kodiert = encodeURIComponent(roh).replace(/['()*]/g, c =>
    '%' + c.charCodeAt(0).toString(16).toUpperCase());
  return `${inline ? 'inline' : 'attachment'}; filename="${schlicht}"; filename*=UTF-8''${kodiert}`;
}

// Die Sicherheitsregel der Antwort.
//
// Fuer alles ausser PDF gilt die schaerfste Form: nichts darf geladen werden,
// nichts ausgefuehrt.
//
// PDF ist die eine Ausnahme, und zwar aus einem handfesten Grund: Die
// eingebauten PDF-Betrachter von Chrome und Edge bestehen selbst aus HTML und
// JavaScript. Ein vollstaendiges sandbox schaltet sie ab -- das Ergebnis ist
// kein abgesichertes PDF, sondern ein leeres Fenster.
//
// Vertretbar ist das, weil die Regel davor schuetzt, dass eine Anlage als
// Webseite IM URSPRUNG DER ANWENDUNG laeuft und dort ans Sitzungscookie oder
// an die Schnittstellen kaeme. Ein PDF ist keine Webseite: sein eigenes
// Skript laeuft in der abgeschotteten Maschine des Betrachters. Und
// allow-same-origin wird bewusst NICHT gesetzt -- das Dokument bleibt damit in
// einem eigenen, fremden Ursprung und sieht von der Anwendung nichts.
//
// Die tragenden Schichten bleiben fuer PDF unveraendert: eigener Content-Type
// statt dem des Hochladenden, nosniff, und inline nur nach Positivliste.
function sicherheitsRegel(typ) {
  return typ === 'application/pdf'
    ? "default-src 'none'; sandbox allow-scripts"
    : "default-src 'none'; sandbox";
}

// Setzt alle Kopfzeilen fuer eine Anlage. Einzige Stelle, an der das geschieht.
function setzeKopfzeilen(res, dateiname, { inline = false } = {}) {
  const typ = ausgabeTyp(dateiname);
  // Inline nur, wenn der Typ auf der kurzen Positivliste steht UND es
  // ausdruecklich verlangt wurde. Im Zweifel herunterladen.
  const wirklichInline = inline && INLINE_ERLAUBT.has(typ);
  res.set('Content-Type', typ);
  res.set('Content-Disposition', dispositionKopf(dateiname, wirklichInline));
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Content-Security-Policy', sicherheitsRegel(typ));
  res.set('Cache-Control', 'private, max-age=3600');
  return wirklichInline;
}

/* ---- Typ aus den ersten Bytes ----
 * Fuer Bilder, die ohne Dateinamen in der Datenbank liegen: den Typ sagt der
 * Inhalt, nie eine gespeicherte Angabe. Erkannt wird nur, was auch
 * eingebettet werden darf -- alles Uebrige bleibt bewusst unerkannt und geht
 * damit als application/octet-stream zum Herunterladen heraus. Eine SVG faellt
 * hier heraus, denn sie ist Text und beginnt mit nichts Festem; genau das ist
 * die gewuenschte Antwort.
 */
/* Die Marken im ftyp-Kasten, die eine MP4 ausmachen. Positivliste, nicht
   "alles, was nicht Bild ist": eine unbekannte ISO-Marke soll herunterladen,
   nicht abspielen. M4V traegt ein nachlaufendes Leerzeichen. */
const ISO_MARKEN_MP4 = new Set(['isom', 'iso2', 'iso4', 'iso5', 'iso6',
  'mp41', 'mp42', 'mmp4', 'avc1', 'dash', 'cmfc', 'M4V ', 'M4VH', 'M4VP']);

function typAusBytes(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  const b = buf;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b.slice(1, 8).toString('latin1') === 'PNG\r\n\x1a\n') return 'image/png';
  const kopf = b.slice(0, 6).toString('latin1');
  if (kopf === 'GIF87a' || kopf === 'GIF89a') return 'image/gif';
  if (b.slice(0, 4).toString('latin1') === 'RIFF' && b.slice(8, 12).toString('latin1') === 'WEBP')
    return 'image/webp';
  // ISO-BMFF: Laenge, dann 'ftyp', dann die Marke. avif einzeln, avis ist die
  // Bildfolge -- beide gehen durch dieselbe Anzeige. Dieselbe Stelle traegt
  // die Videomarken: MP4, M4V und QuickTime sind ebenfalls ISO-BMFF.
  // Nicht aufgefuehrte Marken -- darunter die Bildformate heic, heix und mif1
  // -- bleiben bewusst unerkannt und gehen als Download heraus.
  if (b.slice(4, 8).toString('latin1') === 'ftyp') {
    const marke = b.slice(8, 12).toString('latin1');
    if (marke === 'avif' || marke === 'avis') return 'image/avif';
    if (ISO_MARKEN_MP4.has(marke)) return 'video/mp4';
    // Zwei nachlaufende Leerzeichen, so steht es in jeder QuickTime-Datei.
    if (marke === 'qt  ') return 'video/quicktime';
  }
  // WebM ist Matroska und beginnt mit dem EBML-Kopf.
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'video/webm';
  const tiff = b.slice(0, 4);
  if ((tiff[0] === 0x49 && tiff[1] === 0x49 && tiff[2] === 0x2a && tiff[3] === 0x00) ||
      (tiff[0] === 0x4d && tiff[1] === 0x4d && tiff[2] === 0x00 && tiff[3] === 0x2a))
    return 'image/tiff';
  if (b[0] === 0x42 && b[1] === 0x4d) return 'image/bmp';
  return null;
}

// Kopfzeilen fuer ein Bild aus der Datenbank. Zweite Form von
// setzeKopfzeilen(): dort entscheidet der Dateiname, hier der Inhalt --
// gespeichert ist kein Name, und der gemeldete Typ zaehlt ohnehin nicht.
// Unerkanntes geht als Download heraus statt als Anzeige; ein Bild, das der
// Browser nicht kennt, kann er auch nicht zeigen.
function setzeBildKopfzeilen(res, buf, { name = 'bild', maxAge = 3600 } = {}) {
  const typ = typAusBytes(buf) || 'application/octet-stream';
  const inline = INLINE_ERLAUBT.has(typ);
  // Der Name traegt die Endung des ERKANNTEN Typs, nicht die einer Angabe.
  // Die Videohaelfte kommt aus derselben Liste wie die Endungen der Anhaenge --
  // sonst hiesse ein ausgeliefertes Video foto-7.bin.
  const endungen = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
                     'image/webp': 'webp', 'image/avif': 'avif', 'image/tiff': 'tiff',
                     'image/bmp': 'bmp', ...ENDUNG_NACH_TYP };
  const dateiname = endungen[typ] ? `${name}.${endungen[typ]}` : `${name}.bin`;
  res.set('Content-Type', typ);
  res.set('Content-Disposition', dispositionKopf(dateiname, inline));
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Content-Security-Policy', sicherheitsRegel(typ));
  res.set('Cache-Control', `private, max-age=${maxAge}`);
  return typ;
}

/* ---- Bereiche ----
 * Ein Video wird in Bereichen ausgeliefert, ein Bild nicht. Der Grund ist
 * nicht die Groesse, sondern die Bedienung: ohne Bereiche kann der Browser im
 * Video nicht springen, und manche Abspieler beginnen gar nicht erst. Der
 * Blob liegt beim Lesen ohnehin ganz im Arbeitsspeicher; herausgeschnitten
 * wird daraus nur ein Stueck.
 *
 * DER BEREICH KOMMT VOM AUFRUFER UND WIRD GEPRUEFT. Ungueltiges wird mit 416
 * beantwortet, nicht stillschweigend zurechtgebogen -- ein Abspieler, der
 * etwas anderes bekommt als er verlangt hat, zeigt Bildsalat statt eines
 * Fehlers. Zurechtgerueckt wird nur das eine, was die Norm ausdruecklich so
 * will: ein Ende hinter dem Dateiende meint das Dateiende.
 *
 * Rueckgabe: null (kein Bereich verlangt -- alles am Stueck),
 * { ungueltig: true } (416) oder { von, bis } einschliesslich beider Enden.
 */
function bereichAus(kopf, groesse) {
  if (typeof kopf !== 'string') return null;
  const m = kopf.trim().match(/^bytes=(\d*)-(\d*)$/);
  // Mehrere Bereiche in einer Anfrage sind erlaubt, werden hier aber nicht
  // beantwortet: die Norm laesst zu, stattdessen alles am Stueck zu schicken.
  if (!m) return null;
  const [, a, e] = m;
  if (a === '' && e === '') return null;
  // Eine leere Datei hat keinen Bereich, den man verlangen koennte.
  if (groesse <= 0) return { ungueltig: true };
  let von, bis;
  if (a === '') {
    // bytes=-500 -- die letzten 500 Bytes. Null Bytes gibt es nicht.
    const wieviel = Number(e);
    if (wieviel <= 0) return { ungueltig: true };
    von = Math.max(0, groesse - wieviel);
    bis = groesse - 1;
  } else {
    von = Number(a);
    bis = e === '' ? groesse - 1 : Number(e);
    if (von >= groesse) return { ungueltig: true };
    if (bis < von) return { ungueltig: true };
    // Nur das: ein Ende hinter dem Dateiende meint das Dateiende.
    if (bis >= groesse) bis = groesse - 1;
  }
  return { von, bis };
}

/* ================= Textvorschau ================= */

const VORSCHAU_ZEICHEN = 200 * 1024;   // mehr liest niemand im Browser

// Text lesen, ohne ihn je als Datei auszuliefern. Steuerzeichen raus: eine
// Binaerdatei mit der Endung .txt soll die Anzeige nicht zerlegen.
function textVorschau(buf) {
  const roh = buf.slice(0, VORSCHAU_ZEICHEN).toString('utf8');
  const text = roh.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  return { text, gekuerzt: buf.length > VORSCHAU_ZEICHEN };
}

/* ================= .docx-Vorschau ================= */
/* Eine .docx ist ein ZIP mit word/document.xml. Das laesst sich mit dem
 * eingebauten zlib auspacken -- eine eigene Abhaengigkeit dafuer aufzunehmen
 * waere fuer eine vereinfachte Lesevorschau zu viel. Gelesen wird nur, was
 * gebraucht wird: der zentrale Verzeichniseintrag der einen Datei.
 */
function findeImZip(buf, gesuchterName) {
  // Das Ende des zentralen Verzeichnisses steht hinten, hinter einem
  // Kommentar von bis zu 65535 Zeichen -- deshalb rueckwaerts suchen.
  const ENDE = 0x06054b50;
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 22 - 65535; i--) {
    if (buf.readUInt32LE(i) === ENDE) { eocd = i; break; }
  }
  if (eocd < 0) return null;
  const anzahl = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  for (let n = 0; n < anzahl; n++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) return null;
    const methode = buf.readUInt16LE(p + 10);
    const gepackt = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const kommLen = buf.readUInt16LE(p + 32);
    const versatz = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nameLen).toString('utf8');
    if (name === gesuchterName) {
      // Der oertliche Kopf hat eigene Laengen fuer Name und Zusatzfeld --
      // die aus dem Verzeichnis passen hier nicht.
      if (buf.readUInt32LE(versatz) !== 0x04034b50) return null;
      const oNameLen = buf.readUInt16LE(versatz + 26);
      const oExtraLen = buf.readUInt16LE(versatz + 28);
      const start = versatz + 30 + oNameLen + oExtraLen;
      const roh = buf.slice(start, start + gepackt);
      if (methode === 0) return roh;                     // ungepackt
      if (methode === 8) return zlib.inflateRawSync(roh); // deflate
      return null;                                        // anderes Verfahren
    }
    p += 46 + nameLen + extraLen + kommLen;
  }
  return null;
}

// Vereinfachte Lesevorschau: Absaetze und Zeilenumbrueche bleiben, alles
// andere faellt weg. Keine Formatierung, keine Bilder, keine Tabellenraster.
function docxVorschau(buf) {
  let xml;
  try { xml = findeImZip(buf, 'word/document.xml'); }
  catch { return null; }
  if (!xml) return null;
  const roh = xml.toString('utf8');
  const text = roh
    .replace(/<w:tab[^>]*\/?>/g, '\t')
    .replace(/<w:br[^>]*\/?>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')                       // alle uebrigen Marken weg
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')                        // amp zuletzt, sonst doppelt
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text: text.slice(0, VORSCHAU_ZEICHEN), gekuerzt: text.length > VORSCHAU_ZEICHEN };
}

module.exports = {
  ausgabeTyp, vorschauArt, dispositionKopf, setzeKopfzeilen, sicherheitsRegel,
  typAusBytes, setzeBildKopfzeilen, bereichAus,
  textVorschau, docxVorschau, findeImZip, endung,
  INLINE_ERLAUBT, TYP_NACH_ENDUNG, VIDEO_TYPEN, VORSCHAU_ZEICHEN
};
