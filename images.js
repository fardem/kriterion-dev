/* Die Bildableitungen. Der Anfrageweg (server.js) und der Bestandslauf
   (batchrun.js) rufen dieselben Funktionen. */
const sharp = require('sharp');

/* Die beiden Ableitungen je Foto. */
const VARIANTS = {
  thumb:  { short: 512,  long: 1280, q: 82, crops: true  },
  medium: { short: 1600, long: 1600, q: 78, crops: false }
};

// Auch encodeCommentImage() in server.js holt die Guete hier ab.
const variantWebp = (q) => ({ quality: q, effort: 4 });

/* Der Ausschnitt der Kachel aus focus_x, focus_y und zoom -- massstabsfrei
   und ohne Rundung. */
function cropSpecBox(width, height, fx, fy, zoom) {
  const side = Math.min(width, height);   // was die Kachel bei zoom 100 zeigt
  const tight = side * 100 / zoom;          // was sie beim eingestellten Zoom zeigt
  return { links: fx / 100 * (width - tight), top: fy / 100 * (height - tight), edge: tight };
}

/* Die Masse nach dem EXIF-Vermerk. metadata() meldet die gespeicherten,
   .rotate() dreht danach; die Ausrichtungen 5 bis 8 vertauschen die Kanten. */
function rotatedSize(m) {
  const rotated = m && m.orientation >= 5;
  return { width: rotated ? m.height : m.width, height: rotated ? m.width : m.height };
}
const isLandscape = (m) => {
  const { width, height } = rotatedSize(m);
  return !(height > width);
};

/* Die Kiste fuer extract(): gerundet auf ganze Bildpunkte, quadratisch und
   in die gedrehten Bildkanten geklemmt. Null, wenn die Masse fehlen. */
function cropRectOf(size, cropSpec) {
  if (!size || !cropSpec) return null;
  const { width, height } = rotatedSize(size);
  if (!width || !height) return null;
  const k = cropSpecBox(width, height, cropSpec.fx, cropSpec.fy, cropSpec.zoom);
  if (!Number.isFinite(k.edge) || !Number.isFinite(k.links) || !Number.isFinite(k.top)) return null;
  const edge = Math.max(1, Math.min(width, height, Math.round(k.edge)));
  return { left:  Math.max(0, Math.min(width - edge, Math.round(k.links))),
           top:   Math.max(0, Math.min(height  - edge, Math.round(k.top))),
           width: edge, height: edge };
}

/* Baut thumb und medium aus einem Bild. Eine Ableitung, die nicht gelingt,
   wird null; die andere entsteht trotzdem. */
async function makeVariants(buf, cropSpec) {
  const out = {};
  let size = null;
  try { size = await sharp(buf, { failOn: 'none' }).metadata(); } catch {}
  const landscape = size ? isLandscape(size) : true;
  const cropRect = cropRectOf(size, cropSpec);
  for (const [name, v] of Object.entries(VARIANTS)) {
    try {
      // Ueber den Zuschnitt entscheidet `crops` und nicht der Name der
// Ableitung. Geschnitten wird quadratisch, also zweimal die kurze Kante.
      const raw = sharp(buf, { failOn: 'none' }).rotate();
      const cropped = v.crops && cropRect;
      out[name] = await (cropped ? raw.extract(cropRect) : raw)
        .resize(cropped ? v.short : (landscape ? v.long : v.short),
                cropped ? v.short : (landscape ? v.short : v.long),
                { fit: 'inside', withoutEnlargement: true })
        .webp(variantWebp(v.q)).toBuffer();
    } catch { out[name] = null; }
  }
  return out;
}

/* Ob ein thumb ohne Zuschnitt entstanden ist. Ein zugeschnittenes ist
   quadratisch; ohne lesbare Masse gilt es als ungeschnitten. */
function hasNoCropSpec(size) {
  if (!size || !size.width || !size.height) return true;
  return size.width !== size.height;
}

async function isUncropped(thumb) {
  try { return hasNoCropSpec(await sharp(thumb, { failOn: 'none' }).metadata()); }
  catch { return true; }
}

/* Die drei Verfahren, in denen ein ankommendes PNG abgelegt wird. `null`
   heisst: keine Umkodierung. */
const IMAGE_STORES = {
  'png':           null,
  'webp-lossless': { nearLossless: true, quality: 60, effort: 4 },
  'webp-lossy':    { quality: 90, effort: 4 }
};

const IMAGE_STORE_DEFAULT = 'webp-lossless';

const isImageStore = (v) => typeof v === 'string' &&
  Object.prototype.hasOwnProperty.call(IMAGE_STORES, v);

// Die ersten acht Bytes jeder PNG-Datei.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_MAGIC_HEX = PNG_MAGIC.toString('hex').toUpperCase();
const isPng = (buf) =>
  Buffer.isBuffer(buf) && buf.length >= 8 && buf.subarray(0, 8).equals(PNG_MAGIC);

/* Legt ein Bild ab. Ein PNG wird nach dem gewaehlten Verfahren umkodiert --
   aber nur, wenn das Ergebnis kleiner ist. */
async function storeImage(buf, reportedType, store) {
  const recipe = IMAGE_STORES[isImageStore(store) ? store : IMAGE_STORE_DEFAULT];
  // Das Verfahren „PNG" hat kein Rezept -- es ist die Abwesenheit einer
// Umkodierung und nicht eine Umkodierung mit anderen Zahlen.
  if (!recipe || !isPng(buf)) return { data: buf, mime: reportedType, converted: false };
  try {
    const webp = await sharp(buf).webp(recipe).toBuffer();
    if (webp.length < buf.length)
      return { data: webp, mime: 'image/webp', converted: true };
  } catch (e) {
    // Laut ins Protokoll, still in der Antwort: das Bild ist gespeichert, nur
// eben als PNG.
    console.error('[Kriterion] PNG blieb PNG:', e.message);
  }
  return { data: buf, mime: reportedType, converted: false };
}

module.exports = { makeVariants, VARIANTS, PNG_MAGIC_HEX, isPng, storeImage,
                   IMAGE_STORES, IMAGE_STORE_DEFAULT, isImageStore,
                   isUncropped, hasNoCropSpec, cropSpecBox };
