/* Kriterion — Pruefstand: die Spaltenfolge data steht in den vier
   BLOB-Tabellen am Ende, und tools/reorder.js bringt eine bestehende
   Datenbank auf diese Folge, ohne ein Byte zu verlieren. */
const H = require('./frame.js');

async function run() {
  const {
   fs, os, path, crypto, spawnSync, execFileSync, Database, __dirname,
   require, group, check, equal
  } = H;

/* ================= Die Spaltenfolge ================= SQLite liest eine
   Zeile von vorn. Was hinter einem grossen BLOB steht, ist nur ueber die
   Overflow-Kette erreichbar. */
function checkColumnOrder() {
  group('Die Spaltenfolge: data steht am Ende');

  const RE = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-spaltenfolge-'));

  /* ---- 1 und 2: das Schema selbst ---- */
  /* GELESEN WIRD DER SCHEMA-STRING AUS db.js und nicht eine Abschrift. Was
     nicht mit einem Spaltennamen anfaengt, ist eine Bedingung der Tabelle:
     UNIQUE(trash_id, part) steht hinter data und ist keine Spalte. */
  const reSource = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
  const RE_CONSTRAINT = /^(UNIQUE|PRIMARY|FOREIGN|CHECK|CONSTRAINT)\b/i;
  const reColumns = (table) => {
    const head = `CREATE TABLE IF NOT EXISTS ${table} (`;
    const at = reSource.indexOf(head);
    if (at < 0) return [];
    const end = reSource.indexOf('\n);', at);
    if (end < 0) return [];
    return reSource.slice(at + head.length, end).split('\n')
      .map(z => z.trim())
      .filter(z => z && !z.startsWith('--') && !RE_CONSTRAINT.test(z))
      .map(z => z.split(/[\s(]/)[0]);
  };

  const RE_TABLES = ['photos', 'comment_images', 'attachments'];
  const reRead = [...RE_TABLES, 'trash_bytes'].map(t => [t, reColumns(t)]);
  /* ERST DER GEGENSTAND: eine leere Liste haette data nicht am Ende und
     machte die Verneinung darunter trotzdem wahr. */
  check('Die vier BLOB-Tabellen stehen im Schema und tragen ihre Spalten',
    reRead.length === 4 && reRead.every(([, c]) => c.length >= 4),
    reRead.map(([t, c]) => `${t}: ${c.length}`).join(', '));
  const reNotLast = reRead.filter(([, c]) => c[c.length - 1] !== 'data');
  check('In photos, comment_images und attachments ist data die letzte Spalte',
    reRead.slice(0, 3).every(([, c]) => c[c.length - 1] === 'data'),
    reNotLast.map(([t, c]) => `${t} endet auf ${c[c.length - 1]}`).join(' · '));
  check('Und in trash_bytes ebenso',
    reColumns('trash_bytes').pop() === 'data',
    reColumns('trash_bytes').join(', '));

  /* ---- Die Prueflagen ---------------------------------------------------- */
  const reEnvironment = (directory) => {
    const u = { ...process.env, DATA_DIR: directory };
    delete u.AUTH_RESET;
    delete u.ENCRYPTION_KEY;
    return u;
  };

  const reCall = (args, directory) => {
    const r = spawnSync(process.execPath, [path.join('tools', 'reorder.js'), ...args],
      { cwd: __dirname, encoding: 'utf8', env: reEnvironment(directory), input: '' });
    return { code: r.status, stdout: (r.stdout || '') + (r.stderr || '') };
  };

  const reOpen = (directory) => {
    const hex = fs.readFileSync(path.join(directory, 'encryption.key'), 'utf8').trim();
    const d = new Database(path.join(directory, 'katalog.sqlite'));
    d.pragma("cipher='sqlcipher'");
    d.pragma(`key="x'${hex}'"`);
    return d;
  };

  /* Eine frische Instanz: der Start legt das Schema an. */
  const reFresh = (name) => {
    const dir = path.join(RE, name);
    fs.mkdirSync(dir);
    execFileSync(process.execPath, ['-e', "require('./db');"],
      { cwd: __dirname, encoding: 'utf8', env: reEnvironment(dir) });
    return dir;
  };

  /* JEDER ZERBRECHLICHE SCHRITT WIRD ZU EINEM ROTEN PUNKT, NICHT ZU EINEM
     ABRISS. */
  const reAttempt = (event, replacement = null) => {
    try { return event(); } catch { return replacement; }
  };

  const reOrderOf = (d, table) =>
    d.prepare(`PRAGMA table_info("${table}")`).all().map(c => c.name);

  /* ---- 3: die angelegte Datenbank haelt es auch ------------------------- */
  const reFreshDir = reFresh('frisch');
  {
    const d = reOpen(reFreshDir);
    const last = [...RE_TABLES, 'trash_bytes'].map(t => [t, reOrderOf(d, t).pop()]);
    check('Und eine frisch angelegte Datenbank traegt dieselbe Folge',
      last.every(([, n]) => n === 'data'),
      last.map(([t, n]) => `${t} endet auf ${n}`).join(' · '));
    d.close();
  }

  /* ---- Die ALTE Folge von Hand, mit Zeilen verschiedener Groesse --------- */
  /* Die Abschrift ist hier der Gegenstand: sie stellt her, was eine Instanz
     vor dieser Runde dastehen hatte. */
  const RE_OLD = {
    photos: `CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  mime_type TEXT NOT NULL,
  data BLOB NOT NULL,
  thumb BLOB,
  medium BLOB,
  kind TEXT NOT NULL DEFAULT 'image',
  duration INTEGER,
  focus_x REAL NOT NULL DEFAULT 50,
  focus_y REAL NOT NULL DEFAULT 50,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  zoom REAL NOT NULL DEFAULT 100
)`,
    comment_images: `CREATE TABLE comment_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  filename TEXT NOT NULL DEFAULT 'bild.jpg',
  data BLOB NOT NULL,
  thumb BLOB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
    attachments: `CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  size INTEGER NOT NULL DEFAULT 0,
  data BLOB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
)`
  };

  /* Die Verteilung des Bestands: die meisten Originale klein, wenige gross.
     Ueber 1 MB liegt der Wert in der Overflow-Kette. */
  const reSize = (i) => (i % 10 === 0 ? 1200 * 1024 : (i % 3 === 0 ? 300 * 1024 : 30 * 1024));

  const reBuildOld = (directory, rows) => {
    const d = reOpen(directory);
    d.pragma('foreign_keys = OFF');
    for (const [t, sql] of Object.entries(RE_OLD)) { d.exec(`DROP TABLE "${t}"`); d.exec(sql); }
    for (const sql of [
      'CREATE INDEX idx_photos_item ON photos(item_id, sort_order)',
      'CREATE INDEX idx_photos_kind ON photos(kind)',
      'CREATE INDEX idx_photos_tile ON photos(item_id, sort_order, id, mime_type,'
        + ' focus_x, focus_y, zoom, created_at, kind, duration, length(thumb))',
      'CREATE INDEX idx_comment_images_comment ON comment_images(comment_id)',
      'CREATE INDEX idx_attachments_item ON attachments(item_id)',
      'CREATE INDEX idx_attachments_list ON attachments(item_id, sort_order, id, filename,'
        + ' mime_type, size, created_at, user_id)']) d.exec(sql);
    const item = d.prepare('INSERT INTO items (title, description) VALUES (?, ?)');
    const comment = d.prepare('INSERT INTO comments (item_id, text) VALUES (?, ?)');
    const photo = d.prepare('INSERT INTO photos (item_id, mime_type, data, thumb, medium, kind)'
      + ' VALUES (?, ?, ?, ?, ?, ?)');
    const image = d.prepare('INSERT INTO comment_images (comment_id, filename, data, thumb)'
      + ' VALUES (?, ?, ?, ?)');
    const file = d.prepare('INSERT INTO attachments (item_id, filename, mime_type, size, data)'
      + ' VALUES (?, ?, ?, ?, ?)');
    d.transaction(() => {
      for (let i = 0; i < rows; i++) {
        const id = item.run(`Eintrag ${i}`, `Beschreibung ${i}`).lastInsertRowid;
        const to = comment.run(id, `Kommentar ${i}`).lastInsertRowid;
        photo.run(id, 'image/webp', crypto.randomBytes(reSize(i)),
          crypto.randomBytes(21 * 1024), crypto.randomBytes(110 * 1024), 'image');
        image.run(to, `bild-${i}.jpg`, crypto.randomBytes(60 * 1024), crypto.randomBytes(9 * 1024));
        file.run(id, `datei-${i}.pdf`, 'application/pdf', 30 * 1024, crypto.randomBytes(30 * 1024));
      }
    })();
    d.pragma('wal_checkpoint(TRUNCATE)');
    d.close();
  };

  /* DIE BYTES SELBST und nicht nur ihre Laenge: der Schluessel wird sortiert,
     damit die Pruefsumme von der Spaltenfolge unabhaengig ist. */
  const rePrint = (d, table) => {
    const h = crypto.createHash('sha256');
    for (const row of d.prepare(`SELECT * FROM "${table}" ORDER BY id`).all())
      for (const k of Object.keys(row).sort())
        h.update(k + '=').update(Buffer.isBuffer(row[k]) ? row[k] : String(row[k])).update('|');
    return h.digest('hex');
  };

  const RE_BLOBS = { photos: ['data', 'thumb', 'medium'],
                     comment_images: ['data', 'thumb'], attachments: ['data'] };
  const reFacts = (d, table) => d.prepare(
    `SELECT id, ${RE_BLOBS[table].map(b => `length("${b}") AS "n_${b}"`).join(', ')}`
    + ` FROM "${table}" ORDER BY id`).all();

  const reIndexes = (d) => d.prepare(
    `SELECT name, sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL
      AND tbl_name IN ('photos', 'comment_images', 'attachments') ORDER BY name`).all();

  /* ---- 4 bis 6: der Rundlauf des Werkzeugs ------------------------------- */
  const reDir = reFresh('bestand');
  reBuildOld(reDir, 40);
  const reBefore = {}, reFactsBefore = {};
  let reIndexBefore = [], reOrderBefore = [];
  {
    const d = reOpen(reDir);
    for (const t of RE_TABLES) { reBefore[t] = rePrint(d, t); reFactsBefore[t] = reFacts(d, t); }
    reIndexBefore = reIndexes(d);
    reOrderBefore = RE_TABLES.map(t => reOrderOf(d, t).pop());
    d.close();
  }
  check('Die Prueflage steht in der ALTEN Folge da',
    reOrderBefore.every(n => n !== 'data') && reIndexBefore.length === 6,
    `letzte Spalten ${reOrderBefore.join(', ')}, ${reIndexBefore.length} Indexe`);

  const reShow = reCall(['zeigen'], reDir);
  check('zeigen meldet die Tabellen, den Platz und die Dauer',
    reShow.code === 0 && /photos\s+nein/.test(reShow.stdout)
    && /Gebraucht\s+[\d.]+ MB/.test(reShow.stdout)
    && /Erwartete Dauer\s+rund \d+ Sekunden/.test(reShow.stdout),
    reShow.stdout.slice(-400));
  check('Und es hat dabei nichts geaendert',
    reAttempt(() => { const d = reOpen(reDir); const n = reOrderOf(d, 'photos').pop();
                      d.close(); return n; }) !== 'data',
    'zeigen hat die Folge angefasst');

  const reRun = reCall(['umschichten', '--ja'], reDir);
  check('umschichten laeuft durch und meldet integrity_check: ok',
    reRun.code === 0 && /integrity_check: ok/.test(reRun.stdout),
    `Rueckgabe ${reRun.code}: ${reRun.stdout.slice(-400)}`);

  {
    const d = reOpen(reDir);
    const after = RE_TABLES.map(t => reOrderOf(d, t).pop());
    check('Danach ist data in allen drei Tabellen die letzte Spalte',
      after.every(n => n === 'data'), after.join(', '));
    const factsOff = RE_TABLES.filter(t => !equal(reFacts(d, t), reFactsBefore[t]));
    check('Jede id steht noch da, und jede BLOB-Spalte hat ihre Laenge behalten',
      factsOff.length === 0, factsOff.join(' '));
    const printOff = RE_TABLES.filter(t => rePrint(d, t) !== reBefore[t]);
    check('Und Feld fuer Feld dieselben Bytes wie vorher',
      printOff.length === 0, printOff.join(' '));
    const indexAfter = reIndexes(d);
    check('Die Indexe stehen wieder da, wortgleich',
      equal(indexAfter, reIndexBefore),
      `vorher ${reIndexBefore.length}, nachher ${indexAfter.length}: `
      + indexAfter.map(i => i.name).join(', '));
    check('Und foreign_key_check meldet nichts',
      reAttempt(() => d.pragma('foreign_key_check'), null)?.length === 0,
      JSON.stringify(reAttempt(() => d.pragma('foreign_key_check'))));
    d.close();
  }

  const reAgain = reCall(['umschichten', '--ja'], reDir);
  check('Ein zweiter Lauf erkennt den fertigen Stand und ruehrt nichts an',
    reAgain.code === 0 && /Nichts geändert/.test(reAgain.stdout),
    `Rueckgabe ${reAgain.code}: ${reAgain.stdout.slice(-300)}`);

  /* ---- 7: eine verwaiste Zeile bricht den Lauf ab ------------------------ */
  /* PRAGMA foreign_key_check laeuft VOR dem COMMIT: ein Treffer rollt die
     Tabelle zurueck, statt den Schaden festzuschreiben. */
  {
    const dir = reFresh('verwaist');
    reBuildOld(dir, 6);
    {
      const d = reOpen(dir);
      d.pragma('foreign_keys = OFF');
      d.prepare('UPDATE photos SET item_id = 99999 WHERE id = 1').run();
      d.pragma('wal_checkpoint(TRUNCATE)');
      d.close();
    }
    const r = reCall(['umschichten', '--ja'], dir);
    check('Eine Zeile ohne Eintrag bricht das Umschichten ab',
      r.code === 1 && /foreign_key_check/.test(r.stdout),
      `Rueckgabe ${r.code}: ${r.stdout.slice(-300)}`);
    check('Und die Tabelle steht danach unveraendert in der alten Folge',
      reAttempt(() => { const d = reOpen(dir); const n = reOrderOf(d, 'photos').pop();
                        d.close(); return n; }) === 'zoom',
      'die Folge hat sich geaendert');
  }

  /* ---- 8: bei laufender Instanz bricht es ab ----------------------------- */
  /* EINE ZWEITE OFFENE VERBINDUNG HAELT BEGIN EXCLUSIVE -- dasselbe, was ein
     schreibender Server taete. */
  {
    const dir = reFresh('gehalten');
    reBuildOld(dir, 6);
    const holder = reOpen(dir);
    holder.exec('BEGIN EXCLUSIVE');
    holder.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('probe', '1')").run();
    const r = reCall(['umschichten', '--ja'], dir);
    reAttempt(() => holder.exec('ROLLBACK'));
    reAttempt(() => holder.close());
    check('Bei gehaltener Datei bricht das Werkzeug ab',
      r.code === 1 && /in fremder Hand/.test(r.stdout),
      `Rueckgabe ${r.code}: ${r.stdout.slice(-300)}`);
    check('Und es hat dabei nichts angefasst',
      reAttempt(() => { const d = reOpen(dir); const n = reOrderOf(d, 'photos').pop();
                        d.close(); return n; }) === 'zoom',
      'die Folge hat sich geaendert');
  }

  /* ---- 9: zu wenig Platz ------------------------------------------------- */
  /* Ein volles Dateisystem herzustellen verlangt das Einhaengen eines tmpfs,
     und das darf nicht jeder. */
  {
    const narrow = path.join(RE, 'eng');
    fs.mkdirSync(narrow);
    const mounted = spawnSync('mount', ['-t', 'tmpfs', '-o', 'size=48M', 'tmpfs', narrow],
      { encoding: 'utf8' }).status === 0;
    if (!mounted) {
      H.skipped += 2;
      console.log('  ... uebersprungen: kein tmpfs einhaengbar (die Absage bei zu wenig '
        + 'Platz braucht ein volles Dateisystem)');
    } else {
      const dir = path.join(narrow, 'instanz');
      fs.mkdirSync(dir);
      execFileSync(process.execPath, ['-e', "require('./db');"],
        { cwd: __dirname, encoding: 'utf8', env: reEnvironment(dir) });
      reBuildOld(dir, 8);
      /* Zuschuetten, bis weniger frei ist als das Dreifache der Datei -- aber
         genug fuer die WAL beim Oeffnen. */
      const bytes = fs.statSync(path.join(dir, 'katalog.sqlite')).size;
      const s = fs.statfsSync(dir);
      const fill = Math.max(0, s.bsize * s.bavail - Math.floor(bytes * 1.2));
      reAttempt(() => fs.writeFileSync(path.join(narrow, 'fuell'), Buffer.alloc(fill)));
      const r = reCall(['umschichten', '--ja'], dir);
      check('Bei zu wenig Platz kommt die Absage mit der Zahl',
        r.code === 1 && /Zu wenig Platz/.test(r.stdout) && /gebraucht werden/.test(r.stdout),
        `Rueckgabe ${r.code}: ${r.stdout.slice(-300)}`);
      check('Und die Folge steht danach unveraendert da',
        reAttempt(() => { const d = reOpen(dir); const n = reOrderOf(d, 'photos').pop();
                          d.close(); return n; }) === 'zoom',
        'die Folge hat sich geaendert');
      reAttempt(() => fs.unlinkSync(path.join(narrow, 'fuell')));
      fs.rmSync(dir, { recursive: true, force: true });
      spawnSync('umount', [narrow]);
    }
  }

  fs.rmSync(RE, { recursive: true, force: true });
}
  checkColumnOrder();
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
