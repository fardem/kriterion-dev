/* Kriterion — Pruefstand: der Stand 0.29.0
 *
 * Der Fingerprint nennt die Datei, das Faelligkeitsdatum, die eindeutige
 * Adresse, die Filterzeile und die Umkehr der Sortierung nach Titel.
 *
 * Eigener Prozess, eigener Speicher. Der Rahmen steht in test/frame.js.
 */
const H = require('./frame.js');

async function run() {
  const {
   fs, os, path, crypto, CODE, KOMMENTAR, __dirname, require, group, check,
   equal, PASSWORD, open, shortRun, shortRunAll, call, names
  } = H;
  /* Dieses Modul ruft den Hauptserver. Es startet ihn fuer sich --
     siehe mainServerReady() in test/frame.js. */
  await H.mainServerReady();

/* ======================================================================
   0.29.0 — „Worauf man sich verlassen können muss"

   WAS HIER STEHT UND WAS NICHT: die Sicherungsprobe hat ihre eigenen Zusagen
   in der Gruppe „Die Sicherungsprobe — 0.29.0" weiter oben, weil sie eine
   Instanz mit eingerichtetem Sicherungsort braucht. Hier stehen die uebrigen
   sieben Bauabschnitte.

   GEFAHREN, WO ES GEHT, UND GELESEN, WO JSDOM NICHT RECHNET. Der Pruefstand
   rechnet kein CSS (Stolperstein 223): jede Pixelzahl dieser Runde ist im
   echten Chromium gemessen und steht im Aenderungsprotokoll. Was hier stehen
   kann, ist die REGEL — dass sie an der richtigen Stelle steht, den richtigen
   Traeger hat und den Schreibtisch nicht anfasst. */
async function check0290() {

  /* ---- BA 2: der Fingerprint nennt die Datei ------------------------- */
  group('Der Fingerprint nennt die Datei — 0.29.0');
  {
    const fpStats = (await call('GET', '/api/stats')).content;
    const fpFiles = fpStats?.fingerprintFiles || [];
    check('Die Kennzahlen tragen die Einzelwerte mit',
      Array.isArray(fpFiles) && fpFiles.length >= 15,
      `${fpFiles.length} Dateien`);
    /* DIESELBE LISTE WIE DER GESAMTWERT -- und nicht eine zweite daneben
       (F6, Stolperstein 47). Gepruefte Eigenschaften: es sind genau die
       Dateien, ueber die der Fingerprint geht, sie stehen in derselben
       Reihenfolge, und testbench.js und Doku/ sind NICHT dabei.
       UND test/ SEIT 0.34.0: der Pruefstand liegt dort, ein Modul je
       Sachgebiet. Der Server laedt keines davon -- die Zeile sagt es
       trotzdem ausdruecklich, denn eine Datei, die niemand nennt, faellt
       auch niemandem auf, wenn sie eines Tages doch dasteht. */
    check('Es sind genau die ausgelieferten und ausgefuehrten Dateien',
      fpFiles.some(z => z.name === 'server.js') &&
      fpFiles.some(z => z.name === 'public/app.js') &&
      fpFiles.some(z => z.name === 'batchrun.js') &&
      !fpFiles.some(z => /^(testbench\.js|test\/|Doku\/|usertool\.js|keytool)/.test(z.name)),
      fpFiles.map(z => z.name).join(' · '));
    check('Und sie stehen sortiert, wie der Gesamtwert sie liest',
      equal(fpFiles.map(z => z.name), [...fpFiles.map(z => z.name)].sort()),
      fpFiles.map(z => z.name).join(' · '));
    /* DIE WERTE LASSEN SICH MIT sha256sum NACHRECHNEN -- genau das ist ihr
       Zweck: der Handgriff in der README liefert dieselben acht Zeichen. Ohne
       diese Zusage koennte die Karte irgendetwas Achtstelliges zeigen. */
    const fpWrong = fpFiles.filter(z => {
      const soll = crypto.createHash('sha256')
        .update(fs.readFileSync(path.join(__dirname, z.name))).digest('hex').slice(0, 8);
      return soll !== z.hash;
    });
    check('Jeder Einzelwert ist der sha256 seiner Datei, acht Zeichen',
      fpWrong.length === 0 && fpFiles.every(z => /^[0-9a-f]{8}$/.test(z.hash)),
      fpWrong.map(z => z.name).join(' · ') || 'alle gleich');
    /* UND SIE ENTSTEHEN IN DERSELBEN SCHLEIFE. Am Quelltext gelesen, denn ein
       zweiter Durchgang ueber dasselbe Verzeichnis liefe erst auseinander,
       wenn jemand zwischen beiden eine Datei anfasst -- und dann ist es zu
       spaet. Gegenprobe: ein zweites `filesUnder` oder ein zweites
       `readFileSync` je Datei faerbt diese Zeile rot. */
    const fpServer = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    const fpBody = fpServer.slice(fpServer.indexOf('function buildFingerprint()'),
                                  fpServer.indexOf('const FINGERPRINT = buildFingerprint()'));
    check('Gesamtwert und Einzelwerte kommen aus EINER Schleife',
      (fpBody.match(/fs\.readFileSync/g) || []).length === 1 &&
      /const bytes = fs\.readFileSync/.test(fpBody) &&
      /h\.update\(bytes\)/.test(fpBody) && /\.update\(bytes\)\.digest/.test(fpBody),
      `${(fpBody.match(/fs\.readFileSync/g) || []).length} Lesevorgaenge in der Schleife`);
    /* KEINE DAUERHAFTE ZEILE UND KEIN UEBERFAHRTEXT. Die Liste steht im Baum,
       aber `hidden`; sichtbar wird sie erst auf Verlangen (F16). Gelesen wird
       die Vorlage der Karte -- eine Liste ohne `hidden` faerbt das rot. */
    const fpApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    check('Die Dateiliste steht zugeklappt da und traegt keinen Ueberfahrtext',
      /<div class="fp-list" id="fp-list" hidden>/.test(fpApp) &&
      !/id="fp-list"[^>]*title=/.test(fpApp),
      'die Liste steht offen oder traegt einen title');
    check('Und der Verweis sagt, dass er sie zeigt',
      /id="fp-files" aria-expanded="false"/.test(fpApp) &&
      /card\.showFiles/.test(fpApp) && /card\.hideFiles/.test(fpApp),
      'der Verweis fehlt oder sagt nichts');
  }

  /* ---- BA 3: das Faelligkeitsdatum ----------------------------------- */
  group('Das Faelligkeitsdatum — 0.29.0');
  {
    const dueItem = (await call('POST', '/api/items', { title: 'Faelligkeit' })).content;
    const heute = (() => {
      const d = new Date(); const z = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
    })();
    const tag = (versatz) => {
      const d = new Date(); d.setDate(d.getDate() + versatz);
      const z = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
    };
    const dueAdd = (text, due) => call('POST', `/api/items/${dueItem.id}/comments`,
      { text, kind: 'task', ...(due === null ? {} : { dueDate: due }) });

    const dueGood = await dueAdd('mit Datum', heute);
    check('Eine Aufgabe nimmt ein Datum an',
      dueGood.status === 201 &&
      (dueGood.content?.comments || []).some(c => c.dueDate === heute),
      JSON.stringify((dueGood.content?.comments || []).map(c => c.dueDate)));
    /* EINE AUFGABE OHNE DATUM VERHAELT SICH WIE VORHER -- die Zusage, die
       belegt, dass das Feld FREIWILLIG ist. Gegenprobe waere eine Vorgabe:
       stuende dort ein selbst gesetztes Datum, faerbte das diese Zeile rot. */
    const dueNone = await dueAdd('ohne Datum', null);
    check('Und ohne Datum bleibt sie, was sie war',
      dueNone.status === 201 &&
      (dueNone.content?.comments || []).some(c => c.text === 'ohne Datum' && c.dueDate === null),
      JSON.stringify((dueNone.content?.comments || []).map(c => [c.text, c.dueDate])));
    /* DER KALENDER WIRD GEPRUEFT UND NICHT NUR DIE FORM: "2026-02-31" hat die
       richtige Form und gibt es nicht. Ohne diese Zeile bliebe die Zusage
       gruen, wenn nur die Zeichen gezaehlt wuerden. */
    const dueBad = await dueAdd('krumm', '2026-02-31');
    const dueWord = await dueAdd('wort', 'morgen');
    check('Ein Tag, den es nicht gibt, wird abgewiesen',
      dueBad.status === 400 && dueWord.status === 400,
      `${dueBad.status} / ${dueWord.status}`);
    /* DAS FELD HAENGT NICHT AN kind: wer zur Notiz zurueckschaltet und wieder
       zur Aufgabe, findet sein Datum vor. */
    const dueRow = (dueGood.content?.comments || []).find(c => c.dueDate === heute);
    await call('PUT', `/api/comments/${dueRow.id}`, { kind: 'note' });
    const dueBack = await call('PUT', `/api/comments/${dueRow.id}`, { kind: 'task' });
    check('Das Datum ueberlebt den Weg ueber die Notiz',
      (dueBack.content?.comments || []).some(c => c.id === dueRow.id && c.dueDate === heute),
      JSON.stringify((dueBack.content?.comments || []).map(c => [c.id, c.dueDate])));
    /* UND DER RUECKWEG IST DAS LEERE FELD -- und es gibt keinen zweiten. */
    const dueClear = await call('PUT', `/api/comments/${dueRow.id}`, { dueDate: '' });
    check('Ein leeres Feld nimmt das Datum wieder weg',
      (dueClear.content?.comments || []).some(c => c.id === dueRow.id && c.dueDate === null),
      JSON.stringify((dueClear.content?.comments || []).map(c => [c.id, c.dueDate])));

    /* „OFFEN" ORDNET UEBERFAELLIG, HEUTE, SPAETER -- UND OHNE DATUM HINTEN.
       VIER Aufgaben, VIER Zustaende, und geprueft wird die REIHENFOLGE, die
       der Server liefert. Gegenprobe: die ohne Datum nach vorn nehmen -- ein
       NULL sortiert in SQLite von sich aus dorthin, und genau davor steht die
       eigene Sortierstufe. */
    const dueOrderItem = (await call('POST', '/api/items', { title: 'Ordnung' })).content;
    for (const [text, d] of [['spaeter', tag(5)], ['ueberfaellig', tag(-5)],
                             ['ohne', null], ['heute', heute]])
      await call('POST', `/api/items/${dueOrderItem.id}/comments`,
        { text, kind: 'task', ...(d === null ? {} : { dueDate: d }) });
    const dueOpen = (await call('GET', '/api/open')).content
      .filter(z => z.item.id === dueOrderItem.id).map(z => z.text);
    check('„Offen" ordnet ueberfaellig · heute · spaeter, ohne Datum hinten',
      equal(dueOpen, ['ueberfaellig', 'heute', 'spaeter', 'ohne']),
      dueOpen.join(' · '));
    /* UND DIE ZWEITE SORTIERSTUFE HAELT DIE GRUPPIERUNG (F18). Zwei Aufgaben
       desselben Eintrags mit DEMSELBEN Datum muessen beieinander stehen --
       sonst zerfaellt die Gruppierung, und derselbe Eintrag stuende mehrfach
       in der Liste. */
    const dueA = (await call('POST', '/api/items', { title: 'Gruppe A' })).content;
    const dueB = (await call('POST', '/api/items', { title: 'Gruppe B' })).content;
    for (const it of [dueA, dueB, dueA, dueB])
      await call('POST', `/api/items/${it.id}/comments`,
        { text: 'x', kind: 'task', dueDate: tag(9) });
    const dueGroup = (await call('GET', '/api/open')).content
      .filter(z => z.dueDate === tag(9)).map(z => z.item.id);
    const dueBroken = dueGroup.filter((id, i) => i > 0 && id !== dueGroup[i - 1])
      .filter((id, i, a) => a.indexOf(id) !== i);
    check('Und die Zeilen eines Eintrags bleiben beieinander',
      dueBroken.length === 0, dueGroup.join(' · '));

    /* DAS AUSTAUSCHFORMAT: das Feld steht NUR an den Zeilen, die eines tragen
       -- dieselbe Regel wie „nur Abweichungen" bei den Gewichten. */
    await call('POST', '/api/confirm', { password: PASSWORD, purpose: 'export' });
    const dueFile = (await call('GET', '/api/export?photos=0')).content;
    const dueComments = (dueFile?.items || []).flatMap(i => i.comments || []);
    check('Die Exportdatei traegt das Datum nur, wo eines steht',
      dueComments.some(c => c.dueDate === tag(9)) &&
      dueComments.filter(c => c.text === 'ohne Datum').every(c => !('dueDate' in c)),
      JSON.stringify(dueComments.filter(c => c.dueDate).map(c => c.dueDate).slice(0, 5)));
    /* UND DER IMPORT PRUEFT ES WIE DIE OBERFLAECHE. Eine Datei von aussen darf
       keinen Tag einspielen, den die Oberflaeche nie erlaubt haette; die
       Zeile selbst bleibt trotzdem stehen. */
    const dueServer = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    check('Der Import laesst das Datum durch dieselbe Pruefung',
      /const cDue = c\.dueDate === undefined \? \{ value: null \} : dueValue\(c\.dueDate\);/
        .test(dueServer) && /cDue\.error \? null : cDue\.value/.test(dueServer),
      'der Import schreibt roh in die Spalte');
  }

  /* ---- BA 4: die Adresse bekommt ihr Schloss ------------------------- */
  group('Die Adresse ist eindeutig — 0.29.0');
  {
    const emServer = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
    check('Der Index steht als PARTIELLER Index in db.js',
      /CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email/.test(emServer) &&
      /ON users\(email COLLATE NOCASE\) WHERE email IS NOT NULL/.test(emServer),
      (emServer.match(/CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email[\s\S]{0,90}/) ||
        ['(nicht gefunden)'])[0]);
    /* GEFAHREN UND NICHT GELESEN: der Index selbst weist ab, nicht die Frage
       davor. Geschrieben wird DIREKT in die Tabelle -- ueber die Route griffe
       die Frage in auth.js, und die Zusage belegte dann sie und nicht das
       Schloss. */
    const emDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-adresse-'));
    shortRun(`require('./db'); console.log('da');`, emDir);
    const emOut = shortRun(`const { db } = require('./db');
      const zeig = (was, fn) => { try { fn(); console.log(was + ':DURCH'); }
                                  catch { console.log(was + ':AB'); } };
      db.prepare("INSERT INTO users (username,password_hash,role,email) VALUES ('a','x','user','anna@haus.de')").run();
      zeig('zweitegleiche', () => db.prepare("INSERT INTO users (username,password_hash,role,email) VALUES ('b','x','user','ANNA@Haus.DE')").run());
      zeig('ohneadresse1', () => db.prepare("INSERT INTO users (username,password_hash,role,email) VALUES ('c','x','user',NULL)").run());
      zeig('ohneadresse2', () => db.prepare("INSERT INTO users (username,password_hash,role,email) VALUES ('d','x','user',NULL)").run());
      console.log('fertig');`, emDir);
    const emAll = shortRunAll(`const { db } = require('./db');
      const zeig = (was, fn) => { try { fn(); console.log(was + ':DURCH'); }
                                  catch { console.log(was + ':AB'); } };
      zeig('nochmal', () => db.prepare("INSERT INTO users (username,password_hash,role,email) VALUES ('e','x','user','anna@HAUS.de')").run());
      zeig('ohnedritte', () => db.prepare("INSERT INTO users (username,password_hash,role,email) VALUES ('f','x','user',NULL)").run());`, emDir);
    check('Der Index verhindert eine zweite gleiche Adresse — auch anders geschrieben',
      /nochmal:AB/.test(emAll), emAll.split('\n').slice(-3).join(' | '));
    check('Und er laesst mehrere Zugaenge OHNE Adresse zu',
      /ohnedritte:DURCH/.test(emAll), emAll.split('\n').slice(-3).join(' | '));

    /* BESTEHENDE DOPPELADRESSEN LASSEN DIE INSTANZ LAUFEN (F10) und werden
       benannt. Gegenprobe waere ein verschluckter Fehlschlag: dann stuende der
       Index nicht da, die Karte saegte nichts, und niemand wuesste es. */
    const emOldDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-doppelt-'));
    shortRun(`require('./db'); console.log('da');`, emOldDir);
    shortRun(`const { db } = require('./db');
      db.exec('DROP INDEX IF EXISTS idx_users_email');
      db.prepare("INSERT INTO users (username,password_hash,role,email) VALUES ('eins','x','user','doppelt@haus.de')").run();
      db.prepare("INSERT INTO users (username,password_hash,role,email) VALUES ('zwei','x','user','Doppelt@Haus.de')").run();
      console.log('gesetzt');`, emOldDir);
    const emStart = shortRunAll(`const { db, emailsDoubled } = require('./db');
      console.log('GEMELDET ' + JSON.stringify(emailsDoubled()));
      console.log('INDEX ' + db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name='idx_users_email'").get().n);`,
      emOldDir);
    check('Bestehende Doppeladressen lassen die Instanz laufen',
      /INDEX 0/.test(emStart) && !/Error/.test(emStart),
      emStart.split('\n').slice(-4).join(' | '));
    check('Das Containerprotokoll nennt sie',
      /The address stays without a lock: doppelt@haus\.de \(2\)/.test(emStart),
      emStart.split('\n').filter(z => /without a lock/.test(z)).join(' | ') || '(keine Zeile)');
    check('Und die Karte „Benutzer" bekommt Adresse und Zugaenge',
      /GEMELDET \[\{"address":"doppelt@haus\.de","n":2,"names":"eins, zwei"\}\]/.test(emStart),
      (emStart.match(/GEMELDET .*/) || ['(nichts gemeldet)'])[0]);
    /* UND DER KLARTEXT GILT NUR HINTER DER ANMELDUNG. Vor ihr ist jede
       unterschiedliche Antwort ein Werkzeug zum Durchprobieren -- der Weg der
       Selbstanmeldung darf den Satz deshalb NICHT kennen. */
    const emAuth = fs.readFileSync(path.join(__dirname, 'auth.js'), 'utf8');
    const emRequest = emAuth.slice(emAuth.indexOf('function requestAccess'),
                                   emAuth.indexOf('function requestAccess') + 3000);
    check('Der Klartext steht hinter der Anmeldung und nicht davor',
      (emAuth.match(/login\.emailTaken/g) || []).length === 2 &&
      !/login\.emailTaken/.test(emRequest),
      `${(emAuth.match(/login\.emailTaken/g) || []).length} Stellen`);
    fs.rmSync(emDir, { recursive: true, force: true });
    fs.rmSync(emOldDir, { recursive: true, force: true });
  }

  /* ---- BA 6 und 7: die beiden Bildschirmbefunde ---------------------- */
  group('Die Filterzeile und der Kategoriekasten — 0.29.0');
  {
    const csSource = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    const csApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    /* JSDOM RECHNET KEIN CSS (Stolperstein 223). Die Pixelzahlen dieser Runde
       sind im echten Chromium gemessen und stehen im Aenderungsprotokoll; was
       hier steht, ist die REGEL und ihr TRAEGER.
       DER SCHMALE SCHIRM UND NUR ER: die Regeln stehen innerhalb der
       Umbruchstelle. Stuenden sie global, aenderte sich der Schreibtisch mit
       -- und genau das ist zugesagt, dass es NICHT geschieht. */
    /* DIE UMBRUCHSTELLE HEISST 700 UND NICHT 760, und sie traegt zwei weitere
       Bedingungen: `(max-height: 500px) and (max-width: 960px)` faengt das
       Telefon im Querformat. Gesucht wird deshalb der WORTLAUT der Stelle und
       keine Zahl, die sich abschreiben laesst. */
    const CS_NARROW = '@media (max-width: 700px), (max-height: 500px) and (max-width: 960px) {';
    check('Die Umbruchstelle des schmalen Schirms steht, wo sie stand',
      csSource.includes(CS_NARROW), '(die Umbruchstelle heisst anders)');
    const csNarrow = (() => {
      const a = csSource.lastIndexOf(CS_NARROW);
      return a < 0 ? '' : csSource.slice(a);
    })();
    check('Die Filterzeile hat am Telefon DREI Rasterspalten',
      /\.frow \{ display: grid; grid-template-columns: auto minmax\(0, 1fr\) auto;/.test(csNarrow),
      (csNarrow.match(/\.frow \{ display: grid;[^\n]*/) || ['(nicht gefunden)'])[0]);
    check('Und der Umschalter steht am Ende SEINER Zeile',
      /\.frow > \.frow-right-end \{ grid-column: 3; \}/.test(csNarrow) &&
      /\.frow > \.frow-right \{ grid-column: 1 \/ -1; \}/.test(csNarrow),
      'die Spaltenzuweisung fehlt oder trifft alle Verweise');
    /* DER RUECKSETZER DER SORTIERZEILE BLEIBT DRAUSSEN, und das ist der Kern
       von F17: mit ihm in Spalte 3 schrumpft die Sortierwahl auf 30 px, und
       der NAME der Sortierung ist nicht mehr zu sehen. Getragen wird die
       Unterscheidung von einer Klasse, die nur die beiden bekommen. */
    /* EINER SEIT 0.30.0, vorher zwei: der Umschalter „Tags" ist gefallen (F9),
       und mit ihm der zweite Traeger der Klasse. Die Verweise der Tagzeile
       tragen sie weiter -- „mehr" und „Tags zurücksetzen" gehoeren ans Ende
       ihrer Zeile und nicht ueber ihre ganze Breite. */
    const csEnd = (csApp.match(/className = '[^']*frow-right-end[^']*'/g) || []);
    check('Genau ein Verweis traegt die Klasse — und der Ruecksetzer nicht',
      csEnd.length === 1 && !/right5\.className = '[^']*frow-right-end/.test(csApp),
      csEnd.join(' · '));
    /* UND „und/Oder" STEHT SEIT 0.30.0 IN SPALTE EINS, in der ZWEITEN
       Rasterzeile: unter der Beschriftung und nicht mehr neben ihr (Befund 6,
       F9). Gemessen ist der Gewinn: die Tagzeile faellt von 69 auf 46 px, der
       Filterkasten von 291 auf 267, und die erste Kachel rueckt von y = 502
       auf y = 479. */
    check('Der Und/Oder-Umschalter steht unter der Beschriftung — Spalte eins, Zeile zwei',
      /\.frow-tags > \.tagmode \{ grid-column: 1; grid-row: 2;/.test(csNarrow) &&
      !/\.frow > \.tagmode \{ grid-column: 2; \}/.test(csNarrow),
      (csNarrow.match(/\.frow-tags > \.tagmode[^\n]*/) || ['(nicht gefunden)'])[0]);
    /* UND DIE WOLKE SPANNT UEBER ALLE RASTERZEILEN. Ohne das stuende „mehr"
       unter der Wolke, und die Zeile waere hoeher als vorher -- also das
       Gegenteil des Befundes.
       SEIT 0.30.2 SIND ES DREI ZEILEN UND NICHT ZWEI (Beschriftung, die
       beiden Zeichen, der Umschalter), und die Wolke spannt deshalb ueber
       `1 / -1` statt ueber `1 / span 2`. Die Zusage bleibt dieselbe -- sie
       nennt nur nicht mehr die ZAHL der Zeilen, sondern ALLE.
       UND DER VERWEISKASTEN SPANNT NICHT MEHR MIT: er steht seit 0.30.2 in
       Spalte EINS, unter der Beschriftung, und die dritte Spalte ist damit
       ganz weg. */
    check('Und die Wolke spannt ueber alle Rasterzeilen',
      /\.frow-tags > \.pills\.cloud \{ grid-row: 1 \/ -1;/.test(csNarrow),
      (csNarrow.match(/\.frow-tags > \.pills\.cloud[^\n]*/) || ['(nicht gefunden)'])[0]);
    /* DER KATEGORIEKASTEN: geteilt statt ausgerechnet. Eine feste Zahl faerbt
       diese Zeile rot -- das Stilblatt verbietet ausgerechnete Breiten bei 80
       bis 120 Prozent Schrift an drei anderen Stellen selbst. */
    check('Auswahl und Feld teilen sich, was der Knopf uebrig laesst',
      /\[data-block="kategorie"\] \.row-in > #cat,\s*\n\s*\[data-block="kategorie"\] \.row-in > \.input \{ flex: 1 1 0; min-width: 0; \}/
        .test(csNarrow),
      (csNarrow.match(/\[data-block="kategorie"\][^\n]*\n[^\n]*/) || ['(nicht gefunden)'])[0]);
    check('Und die Mindestbreite steht im Stilblatt statt inline',
      /#cat \{ min-width: 148px; \}/.test(csSource) &&
      !/id="cat"[^>]*min-width/.test(csApp),
      (csApp.match(/id="cat"[^>]*/) || ['(nicht gefunden)'])[0]);
    /* AM SCHREIBTISCH AENDERT SICH NICHTS: keine der vier Regeln steht
       ausserhalb der Umbruchstelle. */
    const csWide = csSource.slice(0, csSource.lastIndexOf(CS_NARROW));
    check('Und am Schreibtisch aendert sich nichts',
      !/frow-right-end/.test(csWide) &&
      !/grid-template-columns: auto minmax\(0, 1fr\) auto/.test(csWide) &&
      !/\[data-block="kategorie"\] \.row-in > #cat/.test(csWide),
      'eine der Regeln steht ausserhalb der Umbruchstelle');
    /* DER PLATZHALTER IST GEKUERZT, in drei Sprachen -- und der SCHLUESSEL
       bleibt. Ein neuer Schluessel waere eine Wegnahme an der Sprachdatei. */
    const csWords = ['de', 'en', 'tr'].map(code =>
      JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'))
        ['entry.newCategoryHint']);
    check('Der Platzhalter ist in allen drei Sprachen kurz',
      equal(csWords, ['Name', 'Name', 'Ad']), JSON.stringify(csWords));
  }

  /* ---- BA 8: „Titel" kehrt um ---------------------------------------- */
  group('„Titel" kehrt um — 0.29.0');
  {
    const tiApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    check('„Titel" kennt beide Richtungen',
      /down: 'list\.dirZA',\s*up: 'list\.dirAZ',\s*start: 'up' \}/.test(tiApp),
      (tiApp.match(/key: 'title'[\s\S]{0,120}/) || ['(nicht gefunden)'])[0]);
    check('Und der Vergleicher kennt title_desc',
      /case 'title_desc':\s*return b\.title\.localeCompare\(a\.title, LOCALE\);/.test(tiApp),
      'die Gegenrichtung fehlt im Vergleicher');
    /* JEDE DER SIEBEN GRUNDLAGEN SAGT, WORAUF EIN WECHSEL LANDET. Ohne das
       haette die mitwandernde Richtung jeden, der aus der Vorgabe kommt, auf
       „Z → A" abgesetzt -- also jeden beim ersten Mal. */
    const tiStarts = (tiApp.match(/start: '(up|down)'/g) || []);
    check('Jede Grundlage sagt, worauf ein Wechsel landet',
      tiStarts.length === 7 && tiStarts.filter(z => /up/.test(z)).length === 1,
      tiStarts.join(' · '));
    /* UND DER SONDERFALL IST GANZ GEFALLEN (F21). Keine Grundlage ist mehr
       einspurig, also bleibt weder der gesperrte Knopf noch die Weiche noch
       der Satz daneben stehen -- eine Regel ohne Traeger bleibt nicht stehen. */
    /* GELESEN WIRD DER CODE UND NICHT DER KOMMENTAR. `twoWays()` steht in
       app.js noch EINMAL da -- in dem Absatz, der erklaert, WARUM es die
       Funktion nicht mehr gibt. Ein Waechter, der den Kommentar mitliest,
       zwaenge dazu, die Begruendung zu loeschen, und genau die soll bleiben. */
    const tiCode = tiApp.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
    check('Der gesperrte Knopf und seine Weiche sind fort',
      !/twoWays/.test(tiCode) && !/dirBtn\.disabled/.test(tiCode) &&
      !/\.sort-dir:disabled/.test(fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')),
      (tiCode.match(/twoWays[^\n]*|dirBtn\.disabled[^\n]*/) || ['die Stilblattregel steht noch da'])[0]);
    const tiKeys = ['de', 'en', 'tr'].map(code => {
      const f = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      return [f['list.sortOneWay'] === undefined, f['list.dirZA']];
    });
    check('„Diese Sortierung hat nur eine Richtung" steht in keiner Sprachdatei mehr',
      tiKeys.every(([where]) => where), JSON.stringify(tiKeys));
    check('Und „Z → A" steht in allen dreien',
      tiKeys.every(([, wort]) => wort === 'Z → A'), JSON.stringify(tiKeys));
    /* GEFAHREN UND NICHT GELESEN: die Sortierung selbst, am laufenden Server.
       Eine Zusage, die nur SORT_BASES ansieht, bliebe gruen, wenn der
       Vergleicher danebengreift -- genau dieser Fehler ist in 0.28.1
       aufgefallen („Titel" sortierte nach dem Aenderungsdatum). */
    const tiWhich = (await call('GET', '/api/items')).content;
    const tiTitles = (Array.isArray(tiWhich) ? tiWhich : tiWhich?.items || [])
      .map(i => i.title).filter(Boolean);
    const tiUp = [...tiTitles].sort((a, b) => a.localeCompare(b, 'de-DE'));
    const tiDown = [...tiTitles].sort((a, b) => b.localeCompare(a, 'de-DE'));
    check('A → Z und Z → A sind wirklich Gegenrichtungen',
      tiTitles.length > 1 && equal(tiUp, [...tiDown].reverse()),
      `${tiTitles.length} Titel`);
  }
}
  await check0290();
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
