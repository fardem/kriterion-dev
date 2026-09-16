/* Die Bestandslaeufe, in einem eigenen Thread. */
const os = require('os');
const { parentPort, workerData } = require('worker_threads');
const sharp = require('sharp');
/* Dieselbe Zahl wie in server.js. sharp wird in diesem Thread eigens geladen
   und traegt dort wieder seine Vorgabe. */
sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));
const { db } = require('./db');
const { makeVariants, isPng, storeImage, isUncropped } = require('./images');

/* Eine Meldung je Zeile, und sie traegt den ganzen Stand und keine Zunahme.
   Der Haupt-Thread ersetzt damit, statt zu addieren. */
const report = (status) => parentPort.postMessage({ kind: 'status', status });

/* Der Bestandslauf: das Original. Eine Frage je Zeile -- liegt das Original
   als PNG da, und will das gewaehlte Verfahren etwas damit? */
async function convertInventory(rows, store) {
  const status = { running: true, total: rows.length, done: 0,
                  converted: 0, stayed: 0, freed: 0 };
  const get = db.prepare(
    'SELECT mime_type, data FROM photos WHERE id = ?');
  const write = db.prepare(
    'UPDATE photos SET mime_type = ?, data = ? WHERE id = ?');
  for (const { id } of rows) {
    try {
      const z = get.get(id);
      // Die Zeile kann waehrend des Laufs geloescht oder schon umgestellt
// worden sein. Beides ist kein Fehler -- nur nichts zu tun.
      if (z) {
        const sizeBefore = z.data ? z.data.length : 0;
        const start = isPng(z.data) ? await storeImage(z.data, 'image/png', store)
                                    : null;
        if (start && start.converted) {
          write.run(start.mime, start.data, id);
          status.converted++;
          status.freed += sizeBefore - start.data.length;
        } else status.stayed++;
      }
    } catch (e) {
      // Eine Zeile reisst den Lauf nicht ab. Sie bleibt, wie sie ist, wird
// gezaehlt und genannt.
      status.stayed++;
      console.error(`[Kriterion] Photo ${id} not converted:`, e.message);
    }
    status.done++;
    report(status);
    await new Promise(r => setTimeout(r, 30));
  }
  status.running = false;
  reclaim();
  report(status);
  console.log(`[Kriterion] Inventory run finished: ${status.converted} of ` +
    `${status.total} originals converted, ${status.stayed} rows had nothing ` +
    `to do, ${status.freed} bytes saved.`);
}

/* Woraus eine Zeile ihre Kachel bekommt. */
const isVideoRow = (z) => z && z.kind === 'video';
const sourceFrom = (z) => (isVideoRow(z) ? z.medium : z.data);
const cropFrom = (z) => ({ fx: Number(z.focus_x), fy: Number(z.focus_y),
                               zoom: Number(z.zoom) });

/* Die fehlenden Vorschaubilder nachruesten. Nur Bilder: in der Videozeile
   steht in `data` die Videodatei. */
async function backfillThumbnails(rows) {
  console.log(`[Kriterion] Creating thumbnails for ${rows.length} photo(s) ...`);
  // Der Zuschnitt geht mit: die drei Zahlen stehen in eigenen Spalten und
// sind auch dann da, wenn die Ableitung fehlt.
  const get = db.prepare(
    'SELECT data, kind, medium, focus_x, focus_y, zoom FROM photos WHERE id = ?');
  const upd = db.prepare('UPDATE photos SET thumb = ?, medium = ? WHERE id = ?');
  let done = 0;
  for (const { id } of rows) {
    try {
      const row = get.get(id);
      if (!row) continue;
      const v = await makeVariants(row.data, cropFrom(row));
      upd.run(v.thumb, v.medium, id);
      done++;
    } catch (e) { console.error(`[Kriterion] Photo ${id} skipped:`, e.message); }
    await new Promise(r => setTimeout(r, 30));
  }
  console.log(`[Kriterion] ${done} thumbnail(s) created.`);
}

/* Die Kacheln erneuern. Faellig ist eine Zeile, deren `thumb` nicht
   quadratisch ist -- ein zugeschnittener ist es. */
async function refreshTiles(rows) {
  const status = { running: true, total: rows.length, done: 0,
                  checked: 0, renewed: 0, skipped: 0, grown: 0 };
  const get = db.prepare(
    'SELECT data, thumb, medium, kind, focus_x, focus_y, zoom FROM photos WHERE id = ?');
  for (const { id } of rows) {
    try {
      const z = get.get(id);
      // Ohne `thumb` ist die Zeile Sache des Nachruestens und nicht dieses
// Laufs.
      if (z && z.thumb) {
        status.checked++;
        if (await isUncropped(z.thumb)) {
          const grown = await refreshRow(id, z);
          if (grown === null) status.skipped++;
          else { status.renewed++; status.grown += grown; }
        }
      }
    } catch (e) {
      status.skipped++;
      console.error(`[Kriterion] Photo ${id} not brought up to date:`, e.message);
    }
    status.done++;
    report(status);
    // Dieselben 30 ms wie in den anderen Schleifen: sie halten die Maschine
// frei, auf der noch etwas anderes laufen darf.
    await new Promise(r => setTimeout(r, 30));
  }
  status.running = false;
  reclaim();
  report(status);
  console.log(`[Kriterion] Tiles renewed: ${status.renewed} of ` +
    `${status.checked} rows checked, ${status.skipped} skipped, ` +
    `${status.grown} bytes more.`);
}

/* Eine Zeile erneuern -- die Schleife oben und die Aufgabe `crop` rufen
   dieselbe Funktion. */
const writeBoth = db.prepare('UPDATE photos SET thumb = ?, medium = ? WHERE id = ?');
const writeTile = db.prepare('UPDATE photos SET thumb = ? WHERE id = ?');
async function refreshRow(id, z) {
  const source = sourceFrom(z);
  if (!source) return null;
  const v = await makeVariants(source, cropFrom(z));
  if (!v.thumb) return null;
  if (isVideoRow(z)) writeTile.run(v.thumb, id);
  else writeBoth.run(v.thumb, v.medium || null, id);
  return v.thumb.length - (z.thumb ? z.thumb.length : 0);
}

/* Die vierte Aufgabe: eine Zeile, auf Knopfdruck beim Speichern eines
   Ausschnitts. */
async function refreshOneTile(rows) {
  const id = rows && rows[0] && rows[0].id;
  const z = id ? db.prepare(
    'SELECT data, thumb, medium, kind, focus_x, focus_y, zoom FROM photos WHERE id = ?')
    .get(id) : null;
  let ok = false;
  if (z) {
    try { ok = await refreshRow(id, z) !== null; }
    catch (e) { console.error(`[Kriterion] Tile ${id} not renewed:`, e.message); }
  }
  parentPort.postMessage({ kind: 'refreshed', id, ok });
}

/* Gibt die freigewordenen Seiten ans Dateisystem zurueck. */
function reclaim() {
  try { db.pragma('incremental_vacuum'); db.pragma('wal_checkpoint(TRUNCATE)'); } catch {}
}

/* Der Thread faehrt genau eine Aufgabe und endet dann. */
(async () => {
  if (workerData.task === 'conversion') await convertInventory(workerData.rows, workerData.store);
  else if (workerData.task === 'thumbnails') await backfillThumbnails(workerData.rows);
  else if (workerData.task === 'geometry') await refreshTiles(workerData.rows);
  else if (workerData.task === 'crop') await refreshOneTile(workerData.rows);
  else throw new Error(`Unbekannte Aufgabe: ${workerData.task}`);
  db.close();
  parentPort.close();
})();
