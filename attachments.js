/* Anhaenge: Auslieferung und Vorschau. Keine Anlage wird so ausgeliefert,
 * dass der Browser sie als Webseite ausfuehrt. */
const zlib = require('zlib');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const exifReader = require('exif-reader');
const mediaInfoFactory = require('mediainfo.js').default;

/* ---- Typen ---- */

// Ohne SVG, weil es Script enthalten kann.
const IMAGE_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', avif: 'image/avif', bmp: 'image/bmp'
};

// Videos der Bildleiste und unter „Dateien"; .avi, .mkv, .wmv und .flv bleiben ohne Vorschau.
const VIDEO_TYPES = {
  mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime'
};

// Bei gleichem Typ gewinnt die erste Endung (mp4 vor m4v).
const EXTENSION_BY_TYPE = {};
for (const [e, t] of Object.entries(VIDEO_TYPES)) if (!EXTENSION_BY_TYPE[t]) EXTENSION_BY_TYPE[t] = e;

const TEXT_EXTENSIONS = ['txt', 'md', 'markdown', 'csv', 'tsv', 'log', 'ini', 'conf'];

// Absichtlich ohne html, xhtml, svg und xml.
const TYPE_BY_EXTENSION = {
  ...IMAGE_TYPES,
  ...VIDEO_TYPES,
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

const INLINE_ALLOWED = new Set([...Object.values(IMAGE_TYPES),
                                ...Object.values(VIDEO_TYPES), 'application/pdf']);

const extension = (name) => {
  const m = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
};

/* ---- Auslieferung ---- */

// Nie den Typ vom Hochladenden uebernehmen.
function outType(filename) {
  return TYPE_BY_EXTENSION[extension(filename)] || 'application/octet-stream';
}

// Nur die Endung zaehlt, nicht der gemeldete Typ.
function previewKind(filename) {
  const e = extension(filename);
  if (IMAGE_TYPES[e]) return 'image';
  if (VIDEO_TYPES[e]) return 'video';
  if (e === 'pdf') return 'pdf';
  if (TEXT_EXTENSIONS.includes(e)) return 'text';
  if (e === 'docx') return 'docx';
  return 'keine';
}

// filename*= nach RFC 5987 fuer Nicht-ASCII, filename= als ASCII-Ersatz.
function dispositionHeader(filename, inline) {
  const raw = String(filename || 'datei').replace(/[\r\n]/g, ' ');
  const plain = raw.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(raw).replace(/['()*]/g, c =>
    '%' + c.charCodeAt(0).toString(16).toUpperCase());
  return `${inline ? 'inline' : 'attachment'}; filename="${plain}"; filename*=UTF-8''${encoded}`;
}

// PDF braucht allow-scripts, weil die Betrachter in Chrome und Edge aus
// HTML und JavaScript bestehen. Nie allow-same-origin setzen.
function securityRule(type) {
  return type === 'application/pdf'
    ? "default-src 'none'; sandbox allow-scripts"
    : "default-src 'none'; sandbox";
}

// Dieselben Header setzt setImageHeader; beide zusammen aendern.
function setHeader(res, filename, { inline = false } = {}) {
  const type = outType(filename);
  const reallyInline = inline && INLINE_ALLOWED.has(type);
  res.set('Content-Type', type);
  res.set('Content-Disposition', dispositionHeader(filename, reallyInline));
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Content-Security-Policy', securityRule(type));
  res.set('Cache-Control', 'private, max-age=3600');
  return reallyInline;
}

// Positivliste: eine unbekannte ISO-Marke wird heruntergeladen, nicht abgespielt.
const ISO_BRANDS_MP4 = new Set(['isom', 'iso2', 'iso4', 'iso5', 'iso6',
  'mp41', 'mp42', 'mmp4', 'avc1', 'dash', 'cmfc', 'M4V ', 'M4VH', 'M4VP']);
const FTYP_MAX = 256;

function typeFromBytes(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  const b = buf;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b.slice(1, 8).toString('latin1') === 'PNG\r\n\x1a\n') return 'image/png';
  const header = b.slice(0, 6).toString('latin1');
  if (header === 'GIF87a' || header === 'GIF89a') return 'image/gif';
  if (b.slice(0, 4).toString('latin1') === 'RIFF' && b.slice(8, 12).toString('latin1') === 'WEBP')
    return 'image/webp';
  // MP4-Familie: Laenge, 'ftyp', Hauptmarke, Version, kompatible Marken; die Sony A6700 nennt `mp42` nur dort.
  if (b.slice(4, 8).toString('latin1') === 'ftyp') {
    const brand = b.slice(8, 12).toString('latin1');
    if (brand === 'avif' || brand === 'avis') return 'image/avif';
    if (ISO_BRANDS_MP4.has(brand)) return 'video/mp4';
    // Die QuickTime-Marke endet auf zwei Leerzeichen.
    if (brand === 'qt  ') return 'video/quicktime';
    const end = Math.min(b.readUInt32BE(0), b.length, FTYP_MAX);
    for (let at = 16; at + 4 <= end; at += 4)
      if (ISO_BRANDS_MP4.has(b.slice(at, at + 4).toString('latin1'))) return 'video/mp4';
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

// Bilder aus der Datenbank haben keinen Dateinamen; hier entscheidet der Inhalt.
function setImageHeader(res, buf, { name = 'image', maxAge = 3600 } = {}) {
  const type = typeFromBytes(buf) || 'application/octet-stream';
  const inline = INLINE_ALLOWED.has(type);
  const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
                     'image/webp': 'webp', 'image/avif': 'avif', 'image/tiff': 'tiff',
                     'image/bmp': 'bmp', ...EXTENSION_BY_TYPE };
  const filename = extensions[type] ? `${name}.${extensions[type]}` : `${name}.bin`;
  res.set('Content-Type', type);
  res.set('Content-Disposition', dispositionHeader(filename, inline));
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Content-Security-Policy', securityRule(type));
  res.set('Cache-Control', `private, max-age=${maxAge}`);
  return type;
}

/* Ohne Ranges kann der Browser im Video nicht springen.
 * Rueckgabe: null (ganze Datei), { invalid: true } (416) oder { from, to }. */
function rangeOut(header, size) {
  if (typeof header !== 'string') return null;
  const m = header.trim().match(/^bytes=(\d*)-(\d*)$/);
  // Mehrere Ranges: ganze Datei schicken, das erlaubt die Norm.
  if (!m) return null;
  const [, a, e] = m;
  if (a === '' && e === '') return null;
  if (size <= 0) return { invalid: true };
  let from, to;
  if (a === '') {
    // bytes=-500: die letzten 500 Bytes.
    const howMany = Number(e);
    if (howMany <= 0) return { invalid: true };
    from = Math.max(0, size - howMany);
    to = size - 1;
  } else {
    from = Number(a);
    to = e === '' ? size - 1 : Number(e);
    if (from >= size) return { invalid: true };
    if (to < from) return { invalid: true };
    // Ein Ende hinter dem Dateiende meint das Dateiende.
    if (to >= size) to = size - 1;
  }
  return { from, to };
}

/* ---- Textvorschau ---- */

const PREVIEW_CHARS = 200 * 1024;   // textPreview: Bytes, docxPreview: Zeichen

function textPreview(buf) {
  const raw = buf.slice(0, PREVIEW_CHARS).toString('utf8');
  const text = raw.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  return { text, shortened: buf.length > PREVIEW_CHARS };
}

/* ---- Vorschaubild einer Textdatei ---- */
const TEXT_TILE = { bytes: 4096, lines: 14, chars: 32, size: 512, font: 24, step: 32 };
// In XML 1.0 verboten oder ohne Zeichen in der Schrift.
const XML_UNFIT = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\ufffe\uffff]/g;
const xmlText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Die Schrift installiert das Dockerfile; ohne sie zeichnet sharp Kaesten.
function textTileSvg(buf) {
  const { lines, chars, size, font, step } = TEXT_TILE;
  const rows = buf.subarray(0, TEXT_TILE.bytes).toString('utf8').split(/\r\n|\r|\n/).slice(0, lines)
    .map(l => [...l.replace(/\t/g, '    ').replace(XML_UNFIT, '')].slice(0, chars).join(''));
  const spans = rows.map((l, i) =>
    `<tspan x="${font}" y="${font + 16 + i * step}">${xmlText(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">`
    + `<rect width="${size}" height="${size}" fill="#ffffff"/>`
    + `<text xml:space="preserve" font-family="DejaVu Sans Mono, monospace" font-size="${font}" fill="#1f2328">`
    + `${spans}</text></svg>`;
}

/* ---- .docx-Vorschau ---- */
function findInZip(buf, wantedName) {
  // Am Dateiende: End of Central Directory (22 Bytes), danach bis zu
  // 65535 Bytes Kommentar.
  const END = 0x06054b50;
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 22 - 65535; i--) {
    if (buf.readUInt32LE(i) === END) { eocd = i; break; }
  }
  if (eocd < 0) return null;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  for (let n = 0; n < count; n++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) return null;
    const method = buf.readUInt16LE(p + 10);
    const packed = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const offset = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nameLen).toString('utf8');
    if (name === wantedName) {
      // Der Local File Header hat eigene Laengen fuer Name und Zusatzfeld.
      if (buf.readUInt32LE(offset) !== 0x04034b50) return null;
      const oNameLen = buf.readUInt16LE(offset + 26);
      const oExtraLen = buf.readUInt16LE(offset + 28);
      const start = offset + 30 + oNameLen + oExtraLen;
      const raw = buf.slice(start, start + packed);
      if (method === 0) return raw;                     // ungepackt
      if (method === 8) return zlib.inflateRawSync(raw); // deflate
      return null;
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

// Nur Text: keine Formatierung, keine Bilder, keine Tabellen.
function docxPreview(buf) {
  let xml;
  try { xml = findInZip(buf, 'word/document.xml'); }
  catch { return null; }
  if (!xml) return null;
  const raw = xml.toString('utf8');
  const text = raw
    .replace(/<w:tab[^>]*\/?>/g, '\t')
    .replace(/<w:br[^>]*\/?>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')                        // amp zuletzt, sonst doppelt
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text: text.slice(0, PREVIEW_CHARS), shortened: text.length > PREVIEW_CHARS };
}

/* ---- Dateien auf der Platte ---- */
/* AES-256-GCM je Stueck: Nonce aus 8 Nullbytes und der Stuecknummer (Big Endian),
   AAD der Name auf der Platte. Stueck i liegt bei i × (chunk + TAG). */
const CHUNK = 1048576;
const TAG = 16;
const encLen = (n, chunk = CHUNK) => n + TAG * Math.ceil(n / chunk);

function damaged(why) {
  const e = new Error(`disk file damaged: ${why}`);
  e.damaged = true;
  return e;
}

function nonce(index) {
  const iv = Buffer.alloc(12);
  iv.writeUInt32BE(index, 8);
  return iv;
}

function sealChunk(key, name, index, plain) {
  const c = crypto.createCipheriv('aes-256-gcm', key, nonce(index));
  c.setAAD(Buffer.from(name, 'ascii'));
  return Buffer.concat([c.update(plain), c.final(), c.getAuthTag()]);
}

// Klartext erst nach final(): update() liefert ihn vor der Pruefung der Marke.
function openChunk(key, name, index, sealed) {
  if (sealed.length < TAG) throw damaged('short');
  const d = crypto.createDecipheriv('aes-256-gcm', key, nonce(index));
  d.setAAD(Buffer.from(name, 'ascii'));
  d.setAuthTag(sealed.subarray(sealed.length - TAG));
  const plain = d.update(sealed.subarray(0, sealed.length - TAG));
  try { d.final(); } catch { throw damaged('tag'); }
  return plain;
}

// `f`: { name, size, chunk, key }. Stuecke ohne Klartext hat nur die leere Datei.
const chunkCount = (f) => Math.ceil(f.size / f.chunk);
const chunkPlain = (f, index) => Math.min(f.chunk, f.size - index * f.chunk);
const chunkAt = (f, index) => index * (f.chunk + TAG);

function readChunkSync(fd, f, index) {
  const want = chunkPlain(f, index) + TAG;
  const buf = Buffer.allocUnsafe(want);
  let got = 0;
  while (got < want) {
    const n = fs.readSync(fd, buf, got, want - got, chunkAt(f, index) + got);
    if (!n) break;
    got += n;
  }
  if (got !== want) throw damaged('length');
  return openChunk(f.key, f.name, index, buf);
}

async function readChunk(handle, f, index) {
  const want = chunkPlain(f, index) + TAG;
  const buf = Buffer.allocUnsafe(want);
  let got = 0;
  while (got < want) {
    const { bytesRead } = await handle.read(buf, got, want - got, chunkAt(f, index) + got);
    if (!bytesRead) break;
    got += bytesRead;
  }
  if (got !== want) throw damaged('length');
  return openChunk(f.key, f.name, index, buf);
}

// Fuer Dateien bis zur Grenze „Anhang"; ein grosses Video wird nur stueckweise gelesen.
function openWholeSync(file, f) {
  let fd;
  try { fd = fs.openSync(file, 'r'); }
  catch (e) { throw e.code === 'ENOENT' ? damaged('missing') : e; }
  try {
    const parts = [];
    for (let i = 0; i < chunkCount(f); i++) parts.push(readChunkSync(fd, f, i));
    return Buffer.concat(parts, f.size);
  } finally { fs.closeSync(fd); }
}

/* Schreibt `plain` ab Stueck `first` an seine Stelle; `wx`, wenn die Datei neu ist.
   Jedes Stueck wird unter seinem Schluessel genau einmal verschluesselt. */
async function sealInto(file, f, first, plain, { fresh = false } = {}) {
  const handle = await fs.promises.open(file, fresh ? 'wx' : 'r+', 0o600);
  try {
    for (let at = 0, index = first; at < plain.length; at += f.chunk, index++) {
      const sealed = sealChunk(f.key, f.name, index, plain.subarray(at, Math.min(plain.length, at + f.chunk)));
      await handle.write(sealed, 0, sealed.length, chunkAt(f, index));
    }
    await handle.datasync();
  } finally { await handle.close(); }
}

/* ---- Erweiterte Infos zu Bildern und Videos ---- */
const mediaKind = (filename) => (['image', 'video'].includes(previewKind(filename)) ? previewKind(filename) : null);
const mediaNumber = (v) => (v === undefined || v === null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));
const mediaText = (v) => (v === undefined || v === null || v === '' ? null : String(v).slice(0, 80));
const HDR_TRANSFERS = ['PQ', 'HLG'];

// Nur was der Dialog zeigt; Bitraten in bit/s, Dauer in Sekunden.
function mediaSummary(tracks) {
  const of = (type) => tracks.filter(tr => tr['@type'] === type);
  const g = of('General')[0] || {};
  const profile = (tr) => [tr.Format_Profile, tr.Format_Level && `L${tr.Format_Level}`, tr.Format_Tier]
    .filter(Boolean).join('@');
  return {
    general: { format: mediaText(g.Format), size: mediaNumber(g.FileSize), duration: mediaNumber(g.Duration),
      bitRate: mediaNumber(g.OverallBitRate), recorded: mediaText(g.Recorded_Date || g.Encoded_Date) },
    video: of('Video').map(tr => ({ format: mediaText(tr.Format), profile: mediaText(profile(tr)),
      width: mediaNumber(tr.Width), height: mediaNumber(tr.Height), frameRate: mediaNumber(tr.FrameRate),
      bitRate: mediaNumber(tr.BitRate), bitDepth: mediaNumber(tr.BitDepth), chroma: mediaText(tr.ChromaSubsampling),
      hdr: mediaText(tr.HDR_Format || (HDR_TRANSFERS.includes(tr.transfer_characteristics) ? tr.transfer_characteristics : null)) })),
    audio: of('Audio').map(tr => ({ format: mediaText(tr.Format), channels: mediaNumber(tr.Channels),
      samplingRate: mediaNumber(tr.SamplingRate), bitRate: mediaNumber(tr.BitRate), language: mediaText(tr.Language) })),
    image: of('Image').map(tr => ({ format: mediaText(tr.Format), width: mediaNumber(tr.Width),
      height: mediaNumber(tr.Height), bitDepth: mediaNumber(tr.BitDepth), colorSpace: mediaText(tr.ColorSpace),
      chroma: mediaText(tr.ChromaSubsampling) }))
  };
}

/* ---- EXIF ---- */
const exifText = (v) => {
  const text = typeof v === 'string' ? v.replace(/\0+$/, '').trim() : '';
  return text ? text.slice(0, 80) : null;
};
const exifNumber = (v) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
// exif-reader liest die Zeit der Kamera ohne Zeitzone als UTC; so bleibt sie, wie die Kamera sie zeigt.
const exifTime = (d) => (d instanceof Date && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 19).replace('T', ' ') : null);

// GPS nur als ja oder nein; die Koordinaten werden nicht gespeichert.
function exifSummary(raw) {
  let e;
  try { e = exifReader(raw); } catch { return null; }
  const image = e.Image || {}, photo = e.Photo || {}, gps = e.GPSInfo || {};
  const make = exifText(image.Make), model = exifText(image.Model);
  // „Canon“ und „Canon EOS 20D“ ergeben „Canon EOS 20D“.
  const camera = make && model && !model.toLowerCase().startsWith(make.split(/\s+/)[0].toLowerCase())
    ? `${make} ${model}` : model || make;
  const out = { taken: exifTime(photo.DateTimeOriginal) || exifTime(image.DateTime), camera,
    lens: exifText(photo.LensModel), exposure: exifNumber(photo.ExposureTime), aperture: exifNumber(photo.FNumber),
    iso: exifNumber(photo.ISOSpeedRatings), focal: exifNumber(photo.FocalLength),
    focal35: exifNumber(photo.FocalLengthIn35mmFilm), gps: Array.isArray(gps.GPSLatitude) && Array.isArray(gps.GPSLongitude) };
  return Object.values(out).some(v => v !== null && v !== false) ? out : null;
}

// sharp braucht im ersten Stueck den ganzen Bildkopf bis zum SOF eines JPEG; sonst fehlen beide Angaben.
async function imageHead(head) {
  let meta;
  try { meta = await sharp(head).metadata(); } catch { return { orientation: null, exif: null }; }
  return { orientation: Number.isInteger(meta.orientation) ? meta.orientation : null,
    exif: meta.exif ? exifSummary(meta.exif) : null };
}

/* `read(length, offset)` liefert die Bytes ab `offset`. Eine Instanz je Datei, danach freigegeben.
   `orientation` steht immer da; an ihr erkennt die Warteschlange Zeilen aus der Zeit vor EXIF. */
async function mediaFacts(size, read) {
  const mi = await mediaInfoFactory({ format: 'object' });
  let facts;
  try { facts = mediaSummary((await mi.analyzeData(size, read))?.media?.track || []); }
  finally { mi.close(); }
  if (facts.video.length) return { ...facts, orientation: null, exif: null };
  return { ...facts, ...await imageHead(await read(Math.min(size, CHUNK), 0)) };
}

module.exports = {
  extension, previewKind, setHeader, securityRule,
  typeFromBytes, setImageHeader, rangeOut,
  textPreview, textTileSvg, TEXT_TILE_BYTES: TEXT_TILE.bytes, docxPreview, VIDEO_TYPES, INLINE_ALLOWED, outType,
  CHUNK, TAG, encLen, sealChunk, openChunk, chunkCount, chunkPlain, chunkAt,
  readChunk, readChunkSync, openWholeSync, sealInto, mediaKind, mediaFacts
};
