/* Kriterion — Pruefstand: der Bestandslauf im eigenen Thread
 *
 * Die Umstellung der Bildablage faehrt in einem eigenen Thread -- an einer
 * echten, verschluesselten Instanz und ohne Server dazwischen.
 *
 * Eigener Prozess, eigener Speicher. Der Rahmen steht in test/rahmen.js.
 */
const H = require('./rahmen.js');

async function laufen() {
  const {
   fs, os, path, crypto, execFileSync, Worker, Database, sharp, __dirname,
   require, group, check, equal, open
  } = H;

/* ================= Der Bestandslauf im eigenen Thread — 0.19.3 ==============
   WAS HIER GEPRUEFT WIRD UND WARUM NICHT AM SERVER. Dass die Umstellung
   ueberhaupt umstellt, steht in der Gruppe „Die Bildablage: PNG kommt herein,
   WebP geht in die Tabelle" und laeuft dort ueber den Knopf. HIER geht es um
   die Zusage, die 0.19.3 dazugelegt hat: dass die Schleife in einem EIGENEN
   THREAD faehrt, dort in die VERSCHLUESSELTE Datei schreibt, ihren Stand je
   Zeile meldet -- und dass daneben ein zweiter Schreiber auf derselben
   WAL-Datei durchkommt.

   DAS LAESST SICH UEBER HTTP NICHT SEHEN: die Antwort ist dieselbe wie vorher,
   und genau das ist der Sinn der Runde. Geprueft wird deshalb wie beim
   Schluesselwechsel -- an einer echten, verschluesselten Instanz in einem
   Wegwerfverzeichnis, und der Thread wird von hier aus erzeugt. */
async function checkBatchRun() {
  group('Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3');

  const BL = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-bestandslauf-'));
  const dir = path.join(BL, 'data');
  fs.mkdirSync(dir);
  const hex = crypto.randomBytes(32).toString('hex');
  const environment = { ...process.env, DATA_DIR: dir, ENCRYPTION_KEY: hex };
  delete environment.AUTH_RESET;

  /* DAS SCHEMA KOMMT AUS db.js UND NICHT AUS DER HAND -- ein von Hand gebautes
     waere eine zweite Wahrheit darueber, wie eine Instanz aussieht. */
  execFileSync(process.execPath, ['-e', "require('./db');"],
    { cwd: __dirname, encoding: 'utf8', env: environment });
  const open = () => {
    const d = new Database(path.join(dir, 'katalog.sqlite'));
    d.pragma("cipher='sqlcipher'");
    d.pragma(`key="x'${hex}'"`);
    d.pragma('journal_mode = WAL');
    return d;
  };

  /* DIE VORLAGE IST EIN ECHTES PNG und kein Byte-Haufen: der Thread laedt
     sharp und wandelt wirklich um. Ohne Bild bliebe offen, ob er nur die
     Spalte umschreibt. */
  const template = await sharp({ create: { width: 240, height: 160, channels: 3,
    background: { r: 30, g: 90, b: 200 } } }).png().toBuffer();
  const ROWS = 6;
  {
    const d = open();
    const item = d.prepare("INSERT INTO items (title) VALUES ('Bestandslauf')").run().lastInsertRowid;
    const into = d.prepare("INSERT INTO photos (item_id, data, mime_type, kind) VALUES (?,?,?,'photo')");
    for (let i = 0; i < ROWS; i++) into.run(item, template, 'image/png');
    d.close();
  }

  /* DER THREAD WIRD VON HIER AUS ERZEUGT, mit derselben Datei, die auch
     server.js an `new Worker` reicht. `env` traegt DATA_DIR und
     ENCRYPTION_KEY -- der Schluessel kommt damit AUS DER UMGEBUNG und nicht
     ueber workerData, genau wie im Betrieb. */
  const drive = (task, rows, outside) => new Promise((done) => {
    const w = new Worker(path.join(__dirname, 'batchrun.js'),
      { workerData: { task: task, rows: rows }, env: environment, stdout: true, stderr: true });
    const states = [];
    let error = null;
    w.on('message', (m) => states.push(m));
    w.on('error', (e) => { error = e; });
    /* DER ZWEITE SCHREIBER HAENGT SICH ZUERST AN 'exit', und das ist keine
       Geschmacksfrage: Node ruft die Horcher in der Reihenfolge ihrer
       Anmeldung. Stuende die Zeile darunter, waere die Zusage schon
       aufgeloest, bevor er sein Ergebnis abgelegt hat -- und die Pruefung
       laese eine leere Abbildung. */
    if (outside) outside.start(w);
    w.on('exit', (code) => done({ states, error, code }));
  });

  /* ---- Die Vorschaubilder, aus dem Thread ---- */
  /* `pending` UND NICHT `open` -- 0.24.3, Bauabschnitt 7: der Name
     `offen` ist zu `open` geworden und stiess mit dem Oeffner der
     Datenbank zwei Zeilen weiter zusammen. Es sind die Zeilen, an
     denen noch ein Vorschaubild offen ist. */
  const pending = (() => {
    const d = open();
    const r = d.prepare(
      "SELECT id FROM photos WHERE (thumb IS NULL OR medium IS NULL) AND kind != 'video'").all();
    d.close();
    return r;
  })();
  check('Der Aufbau steht: sechs Zeilen ohne Vorschaubild',
    pending.length === ROWS, `${pending.length}`);
  const vor = await drive('thumbnails', pending);
  check('Der Thread ruestet die Vorschaubilder nach und endet sauber',
    vor.code === 0 && vor.error === null, `Rueckgabe ${vor.code}: ${vor.error && vor.error.message}`);
  {
    const d = open();
    const missing = d.prepare(
      'SELECT COUNT(*) n FROM photos WHERE thumb IS NULL OR medium IS NULL').get().n;
    d.close();
    check('Und danach fehlt keines mehr', missing === 0, `${missing} ohne Vorschaubild`);
  }

  /* ---- Die Umstellung, aus dem Thread, mit einem zweiten Schreiber daneben ----
     DIE ZWEITE HAELFTE IST DER EIGENTLICHE GEGENSTAND: der Auftrag 0.19.1 hat
     diese Runde mit dem Satz zurueckgestellt, ein zweiter Schreiber auf einer
     WAL-Datei sei heikel. Nachgemessen ist er es nicht -- `busy_timeout` steht
     bei better-sqlite3 auf 5000 ms, und wer in WAL auf den Schreiblock wartet,
     wartet Millisekunden und wird nicht abgewiesen. Hier schreibt der
     Haupt-Thread waehrend des ganzen Laufs alle 20 ms eine Transaktion. */
  const pngs = (() => {
    const d = open();
    const r = d.prepare("SELECT id FROM photos WHERE kind != 'video' AND hex(substr(data,1,8)) = ?")
      .all('89504E470D0A1A0A');
    d.close();
    return r;
  })();
  check('Der Aufbau steht: sechs PNG liegen da', pngs.length === ROWS, `${pngs.length}`);

  const alongside = { result: null, start: null };
  alongside.start = (w) => {
    const d = open();
    const write = d.prepare("INSERT INTO settings (key, value) VALUES (?, ?) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    let written = 0, refused = 0, slowest = 0;
    const clock = setInterval(() => {
      const t0 = Date.now();
      try { write.run('bestandslauf-probe', JSON.stringify(written)); written++; }
      catch { refused++; }
      slowest = Math.max(slowest, Date.now() - t0);
    }, 20);
    w.on('exit', () => {
      clearInterval(clock);
      d.close();
      alongside.result = { written, refused, slowest };
    });
  };
  const um = await drive('conversion', pngs, alongside);
  check('Der Thread stellt um und endet sauber',
    um.code === 0 && um.error === null,
    `Rueckgabe ${um.code}: ${um.error && um.error.message}`);
  /* JE ZEILE EINE MELDUNG, DAZU DIE EINE AM ENDE. Die Karte im Systembereich
     fragt alle 1500 ms; eine Message erst am Schluss liesse sie waehrend des
     ganzen Laufs dieselbe Null zeigen. */
  check('Und meldet je Zeile einmal, dazu einmal am Ende',
    um.states.length === ROWS + 1, `${um.states.length} Meldungen`);
  /* SIE TRAEGT DEN STAND UND KEINE ZUNAHME: der Haupt-Thread ERSETZT damit,
     statt zu addieren. Eine Zunahme haengt an der Vollstaendigkeit der
     Meldungsfolge, ein voller Stand kann gar nicht auseinanderlaufen. */
  const last = um.states[um.states.length - 1] || {};
  check('Jede Meldung traegt den ganzen Stand und nicht eine Zunahme',
    um.states.every(m => m && m.kind === 'status' && m.status &&
      typeof m.status.done === 'number' && typeof m.status.total === 'number'),
    JSON.stringify(um.states[0]));
  /* AUCH HIER GEHT JEDER ZUGRIFF DURCH EINE KLAMMER: Rueckbau 491 nimmt der
     Schleife ihre Message, und eine Zeile, die dann auf `m.status.erledigt`
     greift, riesse den Lauf ab statt rot zu werden (Stolperstein 161). */
  const ueDone = um.states.map(m => (m && m.status && m.status.done));
  check('Und der Stand zaehlt hoch, bis alle Zeilen erledigt sind',
    equal(ueDone, [1, 2, 3, 4, 5, 6, 6]), JSON.stringify(ueDone));
  check('Am Ende steht laeuft: false und jede Zeile umgestellt',
    last.status && last.status.running === false &&
    last.status.converted === ROWS && last.status.freed > 0,
    JSON.stringify(last.status));
  {
    const d = open();
    const webp = d.prepare("SELECT COUNT(*) n FROM photos WHERE mime_type = 'image/webp'").get().n;
    const png = d.prepare("SELECT COUNT(*) n FROM photos WHERE hex(substr(data,1,8)) = ?")
      .get('89504E470D0A1A0A').n;
    d.close();
    /* DER THREAD HAT WIRKLICH IN DIE VERSCHLUESSELTE DATEI GESCHRIEBEN --
       better-sqlite3-multiple-ciphers oeffnet sie aus einem Worker-Thread
       heraus und beschreibt sie. Ohne diese Zeile belegte die Message nur,
       dass der Thread etwas GEZAEHLT hat. */
    check('Der Thread hat wirklich in die verschluesselte Datei geschrieben',
      webp === ROWS && png === 0, `${webp} WebP, ${png} PNG`);
  }
  /* KEINE EINZIGE ABWEISUNG, und die Zahl der Schreibungen steht daneben: ein
     zweiter Schreiber, der gar nicht erst zum Zuge kam, belegte nichts
     (Stolperstein 81). */
  const nb = alongside.result || {};
  check('Der zweite Schreiber kam waehrenddessen ueberhaupt zum Zuge',
    nb.written > 0, JSON.stringify(nb));
  check('Und keine einzige seiner Schreibungen wurde abgewiesen',
    nb.refused === 0, JSON.stringify(nb));

  /* ---- Die Kacheln erneuern, aus dem Thread — 0.19.4, erweitert 0.19.5 ----
     DER LAUF, DEN 0.19.4 EINGEBRACHT HAT. Er ist die erste der drei Aufgaben,
     die eine GUELTIGE Ableitung durch eine bessere ersetzt: das Nachruesten
     fuellt leere Spalten, die Umstellung verschiebt ein Format.
     SEIT 0.19.5 RECHNET ER DEN AUSSCHNITT HINEIN, statt nur die Geometrie
     nachzuziehen -- dieselbe Aufgabe, dieselbe Schleife, eine andere Frage
     nach der Faelligkeit.
     DIE AUSGANGSLAGE WIRD EIGENS GEBAUT: hier liegen Zeilen mit einem
     16:9-Original und einem `thumb` der Regel bis 0.19.3, so wie sie in einer
     Instanz von vor diesen beiden Runden stehen. Die sechs Zeilen von oben
     sind dagegen durch das Nachruesten gelaufen und tragen deshalb bereits
     eine zugeschnittene -- also quadratische -- Kachel. */
  {
    const big = await sharp({ create: { width: 1920, height: 1080, channels: 3,
      background: { r: 200, g: 40, b: 60 } } }).jpeg().toBuffer();
    const oldThumb = await sharp(big).resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true }).toBuffer();
    const oldMedium = await sharp(big).resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    const OLD = 4;
    let videoId = null;
    {
      const d = open();
      const item = d.prepare("INSERT INTO items (title) VALUES ('Alte Geometrie')").run().lastInsertRowid;
      const into = d.prepare("INSERT INTO photos (item_id, data, mime_type, thumb, medium, kind, duration) " +
        "VALUES (?,?,?,?,?,?,?)");
      /* `kind` STEHT HIER AUF 'image' UND OBEN IN DERSELBEN GRUPPE AUF 'foto'.
         Das ist kein Versehen, sondern der Fall, der die Abfrage im Server
         entschieden hat: das Schema kennt zwei Werte, der Import schreibt den
         Wert aus der Austauschdatei aber ungeprueft durch. Eine Auswahl auf
         `kind IS 'image'` liesse die sechs Zeilen von oben still liegen -- und
         genau das ist beim Bauen dieser Runde passiert. */
      for (let i = 0; i < OLD; i++) into.run(item, big, 'image/jpeg', oldThumb, oldMedium, 'image', null);
      /* EINE VIDEOZEILE MIT DEMSELBEN alten `thumb`. In `data` steht dort die
         Videodatei, und der Server oeffnet nie ein Video -- makeVariants()
         kommt daran leer zurueck. Sie faehrt hier ABSICHTLICH mit, obwohl die
         Abfrage im Server sie gar nicht erst auswaehlt: belegt wird, dass das
         vorhandene Standbild auch dann stehen bleibt, wenn sie es doch tut. */
      videoId = into.run(item, Buffer.from('ftypisom-kein-bild'), 'video/mp4',
        oldThumb, oldMedium, 'video', 7).lastInsertRowid;
      d.close();
    }
    const size = async (buf) => { const m = await sharp(buf).metadata(); return `${m.width}x${m.height}`; };
    check('Der Aufbau steht: vier Zeilen tragen die alte Geometrie',
      (await size(oldThumb)) === '400x225', await size(oldThumb));

    /* DIE AUSWAHL KOMMT AUS DERSELBEN ABFRAGE WIE IM SERVER -- wortgleich.
       Eine eigene Abfrage im Prueflauf waere eine zweite Wahrheit darueber,
       welche Zeilen der Lauf ueberhaupt sieht (Stolperstein 47).
       SIE HAT SEIT 0.19.5 KEINE BEDINGUNG MEHR: die Videozeile traegt in
       `medium` die Ableitung ihres Standbilds, und daraus laesst sich ihre
       Kachel sehr wohl erzeugen. Sie MUSS es auch -- der CSS-Zuschnitt ist weg,
       und der Ausschnitteditor ist am Video offen. */
    const SELECTION = 'SELECT id FROM photos';
    const serverGeo = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    check('Und der Server waehlt seine Zeilen mit genau dieser Abfrage',
      serverGeo.includes(`const qTileRows = db.prepare('${SELECTION}');`),
      (serverGeo.match(/const qTileRows = [^\n]*/) || ['(nicht gefunden)'])[0]);
    const imageRows = (() => { const d = open(); const r = d.prepare(SELECTION).all(); d.close(); return r; })();
    check('Die Videozeile steht jetzt IN der Auswahl',
      imageRows.some(z => z.id === videoId), `${imageRows.length} Zeilen`);
    /* UND DIE SECHS ZEILEN MIT DEM DRITTEN WORT STEHEN EBENFALLS DARIN. Ohne
       diese Zeile bliebe gruen, wer die Auswahl auf `kind IS 'image'` verengt --
       sie faende dann genau die vier, die dieser Block selbst anlegt. */
    check('Und die Zeilen mit einem dritten Wort in `kind` stehen darin',
      imageRows.length === ROWS + OLD + 1, `${imageRows.length} statt ${ROWS + OLD + 1}`);

    const geo = await drive('geometry', imageRows);
    check('Der Thread erneuert die Kacheln und endet sauber',
      geo.code === 0 && geo.error === null,
      `Rueckgabe ${geo.code}: ${geo.error && geo.error.message}`);
    /* JE ZEILE EINE MELDUNG, DAZU DIE EINE AM ENDE -- wie bei der Umstellung.
       Die Karte fragt alle 1500 ms; eine Message erst am Schluss liesse sie
       waehrend des ganzen Laufs dieselbe Null zeigen. */
    check('Und meldet je Zeile einmal, dazu einmal am Ende',
      geo.states.length === ROWS + OLD + 2, `${geo.states.length} Meldungen`);
    const gState = (geo.states[geo.states.length - 1] || {}).status || {};
    /* ZWEIMAL WIRD GEZAEHLT, UND DAS IST KEINE DOPPELUNG: `geprueft` sind die
       Zeilen, deren Kopf gelesen wurde, `nachgezogen` die, die wirklich eine
       neue Kachel bekommen haben. Ein Lauf, der 1032 prueft und 0 erneuert,
       ist der Normalfall nach dem ersten Durchgang.
       ERNEUERT WERDEN DIE VIER ALTEN ZEILEN UND DIE VIDEOZEILE -- die sechs
       kleinen sind durchs Nachruesten gelaufen und tragen laengst eine
       quadratische Kachel. */
    check('Und erneuert genau die vier alten Zeilen und die Videozeile',
      gState.running === false && gState.renewed === OLD + 1 &&
      gState.checked === ROWS + OLD + 1,
      JSON.stringify(gState));
    /* DIE SECHS ZEILEN VON OBEN SIND GEPRUEFT UND NICHT ANGEFASST WORDEN.
       Ohne diese Zeile bliebe gruen, wer sie mitzieht und dabei nichts
       aendert ausser der Rechenzeit. */
    check('Und laesst die sechs kleinen Bilder in Ruhe',
      gState.checked - gState.renewed - gState.skipped === ROWS,
      JSON.stringify(gState));
    /* UND KEINE EINZIGE ZEILE IST UEBERSPRUNGEN WORDEN. Bis 0.19.4 war es
       genau eine -- die Videozeile, deren `data` die Videodatei traegt. Seit
       0.19.5 ist ihre Vorlage `medium`, und damit kommt sie durch. */
    check('Und keine Zeile wurde uebersprungen',
      gState.skipped === 0, JSON.stringify(gState));
    {
      const d = open();
      const rows = d.prepare("SELECT id, thumb, medium FROM photos WHERE kind IS 'image' " +
        'AND length(thumb) > ? ORDER BY id').all(0);
      const video = d.prepare('SELECT thumb, medium FROM photos WHERE id = ?').get(videoId);
      d.close();
      const freshSizes = [];
      for (const z of rows) if (z.thumb) freshSizes.push(await size(z.thumb));
      const oldDa = freshSizes.filter(m => m === '400x225');
      check('Danach traegt keine Zeile mehr die alte Geometrie',
        oldDa.length === 0, JSON.stringify(freshSizes));
      check('Und die vier tragen jetzt eine zugeschnittene 512x512-Kachel',
        freshSizes.filter(m => m === '512x512').length === OLD, JSON.stringify(freshSizes));
      /* `medium` IST DABEI NICHT GESCHNITTEN WORDEN -- und das ist die Zusage,
         um die es hier geht. Es wird mit `object-fit: contain` gezeigt, und
         dafuer ist 1600 auf der langen Kante richtig; ein geschnittenes
         `medium` naehme dem Ausschnitteditor seine Vorlage.

         BIS 0.26.0 STAND HIER „byte-genau dasselbe geblieben". Das galt,
         solange die Ableitungen JPEG waren und der Lauf sie mit denselben
         Zahlen neu rechnete. SEIT 0.27.0 SIND SIE WEBP, und der Lauf rechnet
         `medium` damit ebenfalls neu -- aus dem ORIGINAL und mit derselben
         Kiste. Der Satz ist umgedreht, nicht geloescht (Stolperstein 201), und
         die Sache dahinter ist dieselbe geblieben: die Kiste ruehrt sich
         nicht, nur das Verfahren.
         GEPRUEFT WIRD DESHALB AN DER GEOMETRIE UND NICHT AN DEN BYTES: `medium`
         ist danach WebP, es ist NICHT quadratisch (also ungeschnitten), und
         seine lange Kante liegt bei 1600. Eine dieser drei zu verfehlen ist
         genau der Fehler, den die alte Zusage gefangen hat. */
      const mediumSizes = [];
      for (const z of rows) if (z.medium) mediumSizes.push(await size(z.medium));
      const mediumWebp = rows.filter(z => z.medium &&
        z.medium.slice(0, 4).toString('latin1') === 'RIFF' &&
        z.medium.slice(8, 12).toString('latin1') === 'WEBP').length;
      check('Und `medium` ist danach WebP', mediumWebp === rows.length,
        `${mediumWebp} von ${rows.length}`);
      const mediumUncropped = mediumSizes.filter(m => {
        const [w, h] = String(m).split('x').map(Number);
        return w !== h && Math.max(w, h) === 1600;
      }).length;
      check('Und ungeschnitten geblieben -- 1600 auf der langen Kante, nicht quadratisch',
        mediumUncropped === mediumSizes.length, JSON.stringify(mediumSizes));
      /* DIE VIDEOZEILE HAT IHRE KACHEL AUS `medium` BEKOMMEN -- und `medium`
         SELBST steht unveraendert da. Es IST die Vorlage; es aus sich selbst
         neu zu kodieren machte es nur schlechter. */
      check('Die Videokachel ist aus ihrem `medium` erzeugt',
        video && video.thumb && (await size(video.thumb)) === '512x512',
        video && video.thumb ? await size(video.thumb) : '(leer)');
      check('Und ihr `medium` steht byte-genau unveraendert da',
        video && video.medium && video.medium.equals(oldMedium),
        video && video.medium ? await size(video.medium) : '(leer)');
    }

    /* EIN `thumb`, DEN SHARP NICHT LESEN KANN, GILT ALS ALT UND WIRD ERSETZT.
       Er wird nicht aus dem `thumb` gerechnet, sondern aus dem Original --
       wer die Frage nicht beantworten kann, verliert also nichts und gewinnt
       eine Zeile zurueck, die sonst niemand repariert: das Nachruesten sucht
       `thumb IS NULL` und sieht einen kaputten `thumb` gar nicht an. */
    {
      let brokenId = null;
      {
        const d = open();
        const item = d.prepare("INSERT INTO items (title) VALUES ('Kaputter thumb')").run().lastInsertRowid;
        brokenId = d.prepare("INSERT INTO photos (item_id, data, mime_type, thumb, medium, kind) " +
          "VALUES (?,?,?,?,?,'image')")
          .run(item, big, 'image/jpeg', Buffer.from('kein Bild, nur Text'), oldMedium).lastInsertRowid;
        d.close();
      }
      const rep = await drive('geometry', [{ id: brokenId }]);
      const rStatus = (rep.states[rep.states.length - 1] || {}).status || {};
      const d = open();
      const fresh = d.prepare('SELECT thumb FROM photos WHERE id = ?').get(brokenId);
      d.close();
      check('Ein unlesbarer thumb wird aus dem Original ersetzt',
        rStatus.renewed === 1 && fresh && fresh.thumb &&
        (await size(fresh.thumb)) === '512x512',
        `${JSON.stringify(rStatus)} · ${fresh && fresh.thumb ? await size(fresh.thumb).catch(() => '(unlesbar)') : '(leer)'}`);
    }

    /* UND DER ZWEITE LAUF ERNEUERT NICHTS MEHR. Der Lauf faehrt bei JEDEM
       Start; waere seine Frage kein Festpunkt, erneuerte er denselben Bestand
       jedes Mal neu -- und die Datenbank waechst bei jedem Neustart.
       GEPRUEFT WIRD EINE ZEILE MEHR ALS BEIM ERSTEN MAL: die Zeile mit dem
       kaputten `thumb` ist inzwischen dazugekommen. */
    const repeatCall = await drive('geometry', (() => {
      const d = open(); const r = d.prepare(SELECTION).all(); d.close(); return r;
    })());
    const nStatus = (repeatCall.states[repeatCall.states.length - 1] || {}).status || {};
    check('Ein zweiter Lauf erneuert nichts mehr — die Frage ist ein Festpunkt',
      nStatus.renewed === 0 && nStatus.checked === ROWS + OLD + 2,
      JSON.stringify(nStatus));

    /* ---- Die vierte Aufgabe: EINE Zeile, auf ausdruecklichen Knopfdruck ----
       Sie faehrt denselben Weg wie die Schleife und schreibt dieselbe Spalte;
       was sie unterscheidet, ist der Rufer. Belegt wird, dass sie WIRKLICH
       erneuert und ihr Ergebnis meldet -- der Haupt-Thread haengt seine Antwort
       daran. */
    {
      const one = imageRows[imageRows.length - 1];
      const d0 = open();
      d0.prepare('UPDATE photos SET focus_x = 0, focus_y = 0, zoom = 400 WHERE id = ?').run(one.id);
      const before = d0.prepare('SELECT thumb FROM photos WHERE id = ?').get(one.id).thumb;
      d0.close();
      const singleExport = await drive('crop', [{ id: one.id }]);
      const d1 = open();
      const after = d1.prepare('SELECT thumb FROM photos WHERE id = ?').get(one.id).thumb;
      d1.close();
      const message = singleExport.states.find(m => m && m.kind === 'refreshed') || {};
      check('Die einzelne Zeile wird erneuert und das Ergebnis gemeldet',
        singleExport.code === 0 && message.ok === true && message.id === one.id,
        JSON.stringify(message));
      check('Und die Kachel ist danach eine andere',
        after && !after.equals(before), `${before.length} -> ${after && after.length} Bytes`);
      /* EINE ZEILE, DIE ES NICHT GIBT, MELDET `ok: false` UND WIRFT NICHT.
         Der Haupt-Thread antwortet dann mit der alten Fassung -- eine
         Ableitung, die schlechter ist als die alte, gibt es nicht. */
      const empty = await drive('crop', [{ id: 999999 }]);
      const lm = empty.states.find(m => m && m.kind === 'refreshed') || {};
      check('Eine Zeile, die es nicht gibt, meldet ok:false und wirft nicht',
        empty.code === 0 && empty.error === null && lm.ok === false,
        `${empty.code} · ${JSON.stringify(lm)}`);
    }
  }

  /* ---- Ein Fehler im Thread kommt als Fehler an ----
     Er reisst den Server NICHT ab: server.js faengt ihn in worker.on('error'),
     setzt umstellung.laeuft auf false und laesst den Rest stehen. Hier wird
     nur belegt, dass er ueberhaupt dort ankommt -- ein Thread, der still
     endet, liesse die Karte fuer immer auf „laeuft" stehen. */
  const nonsense = await drive('unfug', []);
  check('Eine unbekannte Aufgabe endet als Fehler und nicht still',
    nonsense.error !== null && /Unbekannte Aufgabe/.test(nonsense.error.message || ''),
    JSON.stringify(nonsense.error && nonsense.error.message));

  /* ---- Und der Quelltext dazu ----
     WAS SICH AM VERHALTEN NICHT ZEIGT, muss am Quelltext festgehalten werden:
     dass die Schleife WIRKLICH nur noch im Thread steht, dass der Schluessel
     NICHT mitreist und dass der Abschluss den Thread VOR der Datei beendet.
     Alle drei liessen sich still zuruecknehmen, ohne dass eine Antwort anders
     aussaehe. */
  {
    const blServer = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    const blRun = fs.readFileSync(path.join(__dirname, 'batchrun.js'), 'utf8');
    const blImages = fs.readFileSync(path.join(__dirname, 'images.js'), 'utf8');
    const blDb = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
    const oneLine = (t) => t.replace(/\s+/g, ' ');

    /* 1. DIE SCHLEIFE STEHT NUR NOCH IM THREAD. Ohne diese Zeile bliebe gruen,
       wer den Thread baut und die alte Schleife daneben stehen laesst -- zwei
       Wege, die dasselbe tun, und einer davon haelt den Server wieder an. */
    check('Die beiden Schleifen stehen nur noch in batchrun.js',
      /for \(const \{ id \} of rows\)/.test(blRun) &&
      !/for \(const \{ id \} of zeilen\)/.test(blServer) &&
      !/UPDATE photos SET thumb = \?, medium = \? WHERE id = \?/.test(blServer),
      (blServer.match(/UPDATE photos SET thumb[^\n]*/) || ['(nicht mehr im Server — richtig)'])[0]);
    /* 2. UND DER SERVER RUFT SIE UEBER EINEN THREAD. Alle VIER Aufgaben seit
       0.19.5, nicht drei: die Umstellung auf Knopfdruck, das Nachruesten beim
       Start, das Erneuern der Kacheln dahinter -- und die EINZELNE Zeile beim
       Speichern des Ausschnitts.
       DIE KETTE DER DREI STARTAUFGABEN WIRD MITGEPRUEFT und nicht nur die Zahl
       der Aufrufe: das Nachruesten gibt `erneuereKacheln` weiter, das Erneuern
       `maintainStorage`. Wer sie nebeneinander startet statt hintereinander,
       hat zwei Threads auf derselben Tabelle und EINEN Stand je Aufgabe -- die
       Karte zeigte abwechselnd zwei Laeufe.
       DIE VIERTE STEHT AUSSERHALB DER KETTE, und das ist richtig: sie haengt
       an einem Knopfdruck und nicht am Start, und ihr Abschluss ist die
       Antwort an den Browser. */
    /* DER RUF DER UMSTELLUNG TRAEGT SEIT 0.27.0 ZWEI ARGUMENTE MEHR: ein
       `null` fuer `done` und das gewaehlte Verfahren. Das `null` ist der
       Platzhalter, den die Reihenfolge kostet -- `store` steht hinter `done`,
       weil die drei anderen Aufgaben ein `done` haben und kein Verfahren.
       DAS VERFAHREN WIRD EINMAL GELESEN, BEIM START: `imageStore()` im Ruf und
       nicht im Thread. Waere es dort, staende die Frage „welches Verfahren
       gilt fuer DIESEN Lauf" an zwei Orten, und ein Umschalten waehrend des
       Laufs traefe die eine Haelfte der Zeilen anders als die andere. */
    check('Und der Server startet fuer alle vier Aufgaben einen Thread',
      oneLine(blServer).includes("startBatchThread('conversion', rows, null, imageStore())") &&
      oneLine(blServer).includes("startBatchThread('thumbnails', open, refreshTiles)") &&
      oneLine(blServer).includes("startBatchThread('geometry', rows, maintainStorage)") &&
      oneLine(blServer).includes("startBatchThread('crop', [{ id: Number(id) }], once)"),
      (blServer.match(/startBatchThread\([^)]*\)/g) || []).join(' · ') || '(nicht gefunden)');
    /* UND DIE KETTE HAELT AUCH, WENN EIN GLIED NICHTS ZU TUN HAT. Ohne diese
       beiden Zeilen bliebe das Erneuern aus, sobald kein Vorschaubild fehlt --
       also in jeder Instanz nach dem ersten Start. */
    check('Und jedes Glied ruft das naechste selbst, wenn es nichts zu tun gibt',
      /if \(!open\.length\) return refreshTiles\(\);/.test(blServer) &&
      /if \(!rows\.length\) return maintainStorage\(\);/.test(blServer),
      (blServer.match(/if \(!offen\.length\)[^\n]*/) || ['(nicht gefunden)'])[0]);
    /* 3. DER PFAD STEHT AN EINER STELLE, und der Fingerprint liest dieselbe.
       Zwei Zeilen mit demselben Dateinamen liefen bei der naechsten
       Umbenennung auseinander -- und der Fingerprint kennte dann eine
       ausgelieferte Datei nicht. */
    check('Der Pfad des Threads steht an einer Stelle',
      /const BATCHRUN = path\.join\(__dirname, 'batchrun\.js'\);/.test(blServer) &&
      /new Worker\(BATCHRUN,/.test(blServer) &&
      /\.\.\.ran, BATCHRUN,/.test(oneLine(blServer)),
      (blServer.match(/const BATCHRUN = [^\n]*/) || ['(nicht gefunden)'])[0]);
    /* 4. DER SCHLUESSEL REIST NICHT MIT. `workerData` wird beim Erzeugen
       strukturiert kopiert -- ein Schluessel darin staende in einem zweiten
       Speicher. Er kommt im Thread denselben Weg wie im Haupt-Thread, ueber
       keys.js und die Umgebung. */
    /* SEIT 0.27.0 REIST EIN DRITTES FELD MIT, UND ES IST KEIN GEHEIMNIS:
       `store` ist das gewaehlte Ablageverfahren -- 'png', 'webp-lossless' oder
       'webp-lossy'. Die Zusage ist deshalb GENAUER GEWORDEN und nicht
       schwaecher: die drei erlaubten Felder werden NAMENTLICH genannt, statt
       nur zu zaehlen. Eine Zusage, die nur zaehlt, saehe keinen Tausch. */
    check('Der Schluessel reist nicht ueber workerData',
      oneLine(blServer).includes('{ workerData: { task, rows, store } }') &&
      !/workerData[^\n]*(key|hex|schluessel|Schluessel)/i.test(blServer) &&
      !/workerData\.(key|hex|schluessel)/i.test(blRun),
      (blServer.match(/workerData: \{[^}]*\}/) || ['(nicht gefunden)'])[0]);
    /* UND ES SIND GENAU DIESE DREI FELDER. Ohne diese Zeile bliebe gruen, wer
       ein viertes danebenstellt -- der Name waere ein anderer, die Zahl
       dieselbe, und das Muster darueber passte weiter. */
    check('Und es sind genau drei Felder: Aufgabe, Zeilen, Verfahren',
      (oneLine(blServer).match(/workerData: \{([^}]*)\}/) || [,''])[1]
        .split(',').map(x => x.trim()).filter(Boolean).join('|') === 'task|rows|store',
      (blServer.match(/workerData: \{[^}]*\}/) || ['(nicht gefunden)'])[0]);
    check('Und der Thread laedt ihn ueber db.js wie der Haupt-Thread',
      /require\('\.\/db'\)/.test(blRun) && !/loadKey|ENCRYPTION_KEY/.test(blRun),
      (blRun.match(/const \{ db \} = [^\n]*/) || ['(nicht gefunden)'])[0]);
    /* 5. DER ABSCHLUSS BEENDET DEN THREAD VOR DER DATEI. Andersherum schriebe
       er in eine Datei, deren WAL gerade gekuerzt wird -- der eine Fall, den
       diese Runde neu einbringt. */
    const sigterm = (blServer.match(/for \(const signal of \['SIGTERM'[\s\S]{0,1600}?\n\}/) || [''])[0];
    check('SIGTERM beendet erst die Threads und dann die Datei',
      sigterm.indexOf('w.terminate()') > 0 &&
      sigterm.indexOf('w.terminate()') < sigterm.indexOf('db.close()'),
      sigterm.slice(0, 400) || '(kein Abschluss gefunden)');
    /* UND ES IST EINE MENGE UND KEINE EINZELNE VARIABLE. Im Regelfall laeuft
       hoechstens einer -- aber wer den Umstellungsknopf 1500 ms nach dem Start
       drueckt, hat zwei, und eine Variable truege dann nur den zweiten. */
    check('Und er nimmt jeden laufenden Thread mit, nicht nur den letzten',
      /const batchThreads = new Set\(\);/.test(blServer) &&
      /batchThreads\.add\(w\);/.test(blServer) &&
      /batchThreads\.delete\(w\);/.test(blServer) &&
      /for \(const w of batchThreads\)/.test(sigterm),
      (blServer.match(/const batchThreads = [^\n]*/) || ['(nicht gefunden)'])[0]);
    /* 6. EIN FEHLER IM THREAD REISST DEN SERVER NICHT AB, und er laesst die
       Karte auch nicht fuer immer auf „laeuft" stehen.
       DIE ERSTE FASSUNG DIESER ZEILE WAR ZU LOCKER, und die Gegenprobe hat es
       gezeigt: sie suchte irgendwo im Handler nach `umstellung.laeuft = false`
       -- und Rueckbau 495 setzt genau davor ein `if (false)`. Der Rueckbau
       blieb STUMM. Gesucht wird deshalb die GANZE Zeile samt ihrer Klemme:
       ohne die Klemme wuerde der Handler bei einem Fehler VOR dem
       ersten Lauf selbst werfen (Stolperstein 81 -- erst der Gegenstand, dann
       die Aussage darueber).
       SEIT 0.19.4 STEHT DER STAND JE AUFGABE, und die Zeile greift ihn ueber
       denselben Namen, mit dem der Thread erzeugt wurde. */
    check('Ein Fehler im Thread setzt den Lauf auf beendet und laesst den Rest stehen',
      /w\.on\('error', \(e\) => \{\s*\n\s*if \(batchStates\[task\]\) batchStates\[task\]\.running = false;\s*\n\s*console\.error\(/
        .test(blServer),
      (blServer.match(/w\.on\('error'[\s\S]{0,200}/) || ['(nicht gefunden)'])[0]);
    /* 7. UND ER WIRD JE LAUF ERZEUGT UND DANACH BEENDET -- kein Threadpool,
       kein Dauerlaeufer. Ein Dauerlaeufer hielte eine zweite Verbindung auf
       die Datenbank offen, solange der Server laeuft. */
    check('Der Thread wird je Lauf erzeugt und danach vergessen',
      /w\.on\('exit', \(\) => \{ batchThreads\.delete\(w\);/.test(blServer) &&
      /parentPort\.close\(\);/.test(blRun) && /db\.close\(\);/.test(blRun),
      (blServer.match(/w\.on\('exit'[^\n]*/) || ['(nicht gefunden)'])[0]);
    /* 8. DIE UMWANDLUNG GIBT ES GENAU EINMAL. Zwei Fassungen liefen
       auseinander, und zwar unbemerkt -- beide saehen richtig aus
       (Stolperstein 47). Deshalb steht sie in images.js, und BEIDE Wege rufen
       dieselbe. */
    check('storeImage und makeVariants stehen genau einmal, in images.js',
      /async function storeImage\(/.test(blImages) && /async function makeVariants\(/.test(blImages) &&
      !/function storeImage\(|function makeVariants\(/.test(blServer) &&
      !/function storeImage\(|function makeVariants\(/.test(blRun),
      (blServer.match(/function (storeImage|makeVariants)\(/) || ['(nur in images.js — richtig)'])[0]);
    check('Und beide Wege rufen dieselbe',
      /require\('\.\/images'\)/.test(blServer) && /require\('\.\/images'\)/.test(blRun),
      'einer der beiden Wege laedt images.js nicht');
    /* 9. UND DIE THREADZAHL VON sharp WIRD IM THREAD EIGENS GESETZT. sharp wird
       dort neu geladen und traegt sonst wieder seine Vorgabe -- unter musl
       oder mit jemalloc die Kernzahl (Stolperstein 278). */
    check('Der Thread setzt die Threadzahl von sharp selbst',
      /sharp\.concurrency\(Math\.max\(1, Math\.floor\(os\.cpus\(\)\.length \/ 2\)\)\);/.test(blRun),
      (blRun.match(/sharp\.concurrency\([^\n]*/) || ['(nicht gefunden)'])[0]);
    /* 10. maintainStorage BLEIBT IM HAUPT-THREAD. Es fasst die ganze Datei an
       -- beim ersten Mal ein VACUUM -- und gehoert nicht neben die Schleife. */
    check('maintainStorage bleibt im Haupt-Thread',
      /db\.exec\('VACUUM'\);/.test(blServer) && !/db\.exec\('VACUUM'\)/.test(blRun) &&
      /startBatchThread\('geometry', rows, maintainStorage\);/.test(blServer),
      (blRun.match(/db\.exec\('VACUUM'\)/) || ['(kein VACUUM im Thread — richtig)'])[0]);
    /* 11. UND db.js FUEHRT BEIM OEFFNEN NICHTS AUS, WAS ZWEIMAL SCHADET. Der
       Thread requiret es ein zweites Mal; ein VACUUM oder ein CREATE TABLE
       ohne `IF NOT EXISTS` waere genau die Zeile, die das nicht vertraegt. Der
       Nachweis steht als Liste im Quelltext daneben -- ohne ihn muesste die
       naechste Runde ihn noch einmal fuehren. */
    const blWithoutWhen = (blDb.match(/CREATE TABLE (?!IF NOT EXISTS)/g) || []).length;
    check('db.js legt keine Tabelle ohne IF NOT EXISTS an',
      blWithoutWhen === 0 && !/db\.exec\('VACUUM'\)/.test(blDb), `${blWithoutWhen} Stellen`);
    check('Und der Nachweis der Wiederholbarkeit steht dort geschrieben',
      /WAS BEIM OEFFNEN LAEUFT — UND DASS ES ZWEIMAL DARF/.test(blDb),
      'die Begruendung fehlt');
    /* 12. DIE ANSAGEN AN DEN BETREIBER BLEIBEN IM HAUPT-THREAD. Der
       Schluesselhinweis ist ein halber Bildschirm; ein zweites Mal je
       Umstellungslauf im Containerprotokoll hilft niemandem. */
    const blKeys = fs.readFileSync(path.join(__dirname, 'keys.js'), 'utf8');
    check('Der Schluesselhinweis wird im Neben-Thread nicht wiederholt',
      /const \{ isMainThread \} = require\('worker_threads'\);/.test(blKeys) &&
      /function warnKeyBesideData\(\) \{\s*if \(!isMainThread\) return;/.test(blKeys),
      (blKeys.match(/function warnKeyBesideData\(\) \{[^\n]*\n[^\n]*/) || ['(nicht gefunden)'])[0]);
  }

  fs.rmSync(BL, { recursive: true, force: true });
}
  await checkBatchRun();
}

module.exports = laufen;
if (require.main === module) H.alleine(laufen, __filename);
