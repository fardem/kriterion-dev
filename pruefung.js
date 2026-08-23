/* Kriterion — Pruefstand
 *
 * Prueft die Kriterienverwaltung (umbenennen, sortieren, Wirkung auf
 * Detailansicht, Vergleich und Export) und die mitwachsenden Textfelder.
 *
 *   node pruefung.js            alles
 *   node pruefung.js Rechte     nur Gruppen mit "Rechte" im Namen
 *
 * Der Name filtert die AUSGABE, nicht die ARBEIT: die Prueflagen bauen
 * aufeinander auf, es wird also nichts schneller. Ein gefilterter Lauf sagt am
 * Ende ausdruecklich, dass er gefiltert war -- er ist kein vollstaendiger Beleg.
 *
 * Laeuft gegen einen echten Server mit echter, verschluesselter Datenbank in
 * einem Wegwerfverzeichnis; der Bestand unter data/ wird nicht angefasst.
 * Die Oberflaechenpruefungen brauchen jsdom:  npm install
 * Fehlt es, werden sie uebersprungen und der Prueflauf sagt das deutlich.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const Database = require('better-sqlite3-multiple-ciphers');
const anh = require('./anhaenge');

/* ================= Kleiner Pruefrahmen ================= */
/* EIN NAMENSFILTER AUF DER AUSGABE, NICHT AUF DER ARBEIT.

     node pruefung.js            alles, wie bisher
     node pruefung.js Rechte     nur Gruppen mit "Rechte" im Namen

   Diese Datei ist EIN langer Ablauf: die Prueflagen bauen aufeinander auf,
   Server werden einmal gestartet, Bestaende nacheinander erzeugt. Ein
   Namensfilter kann deshalb nur die AUSGABE einschraenken, nicht die ARBEIT
   -- wer wartet, wartet weiter. Der Gewinn ist ein anderer und trotzdem echt:
   beim Deuten roter Punkte verschwindet das Rauschen.

   DIE REGEL DAZU, sonst wird daraus eine Falle: ein gefilterter Lauf sagt am
   Ende ausdruecklich, dass er gefiltert war, wie viele Gruppen er uebergangen
   hat und ob darin etwas rot war. Ohne das liese sich "alles in Ordnung" nach
   einem Teillauf als vollstaendiger Beleg lesen -- genau der stille
   Fehlschluss aus Stolperstein 81.

   DER RUECKGABEWERT folgt dem GEZEIGTEN: sonst waere ein gefilterter Lauf aus
   Gruenden rot, die gar nicht angesehen werden, und der Filter waere wertlos.
   Ein Filter, auf den KEINE Gruppe passt, ist dagegen rot -- sonst meldete
   ein Tippfehler im Namen wortlos Erfolg. */
const FILTER = (process.argv[2] || '').trim();
let bestanden = 0, gescheitert = 0, uebersprungen = 0;
let stillBestanden = 0, stillGescheitert = 0;
let gruppenGezeigt = 0, gruppenStill = 0;
let stumm = false;
const gruppe = (name) => {
  stumm = FILTER !== '' && !name.toLowerCase().includes(FILTER.toLowerCase());
  if (stumm) { gruppenStill++; return; }
  gruppenGezeigt++;
  console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 58 - name.length))}`);
};
function pruefe(name, bedingung, hinweis = '') {
  // Die Bedingung ist beim Aufruf laengst gerechnet -- der Filter nimmt die
  // Zeile weg, nicht die Arbeit. Gezaehlt wird sie trotzdem, damit der
  // Schlussblock sagen kann, ob im Uebergangenen etwas rot war.
  if (stumm) { if (bedingung) stillBestanden++; else stillGescheitert++; return; }
  if (bedingung) { bestanden++; console.log(`  ✓ ${name}`); }
  else { gescheitert++; console.log(`  ✗ ${name}${hinweis ? `\n      ${hinweis}` : ''}`); }
}
// EINE Stelle fuer den Schlussblock: der gefilterte und der volle Lauf enden
// gleich, und die Selbstprobe weiter unten pruefT genau diese Stelle.
function schlussBlock() {
  console.log(`\n${'═'.repeat(62)}`);
  const summe = bestanden + gescheitert;
  // "0 von 0 bestanden -- alles in Ordnung" waere die schlimmste Zeile des
  // ganzen Prueflaufs: sie meldet Erfolg fuer nichts.
  if (!summe) console.log('  KEINE PRUEFUNG GEZEIGT — nichts belegt.');
  else console.log(`  ${bestanden} von ${summe} Pruefungen bestanden` +
              (uebersprungen ? `, ${uebersprungen} uebersprungen` : '') +
              (gescheitert ? `  —  ${gescheitert} GESCHEITERT` : '  —  alles in Ordnung'));
  if (FILTER) {
    console.log(`\n  GEFILTERTER LAUF nach "${FILTER}" — KEIN VOLLSTAENDIGER BELEG.`);
    if (!gruppenGezeigt)
      console.log(`  KEINE EINZIGE GRUPPE traegt den Namen — es wurde nichts geprueft.`);
    else
      console.log(`  ${gruppenGezeigt} von ${gruppenGezeigt + gruppenStill} Gruppen gezeigt, ` +
                  `${gruppenStill} uebergangen (${stillBestanden + stillGescheitert} Pruefungen).`);
    if (stillGescheitert)
      console.log(`  DARIN ${stillGescheitert} GESCHEITERT — hier nicht angezeigt. ` +
                  `Ohne Filter laufen lassen, um sie zu sehen.`);
  }
  console.log(`${'═'.repeat(62)}\n`);
}
const rueckgabewert = () => (gescheitert || (FILTER && !gruppenGezeigt)) ? 1 : 0;
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* SELBSTPROBE DES RAHMENS. Mit gesetztem PRUEFRAHMEN_PROBE laeuft NICHT der
   Prueflauf, sondern nur der Rahmen darueber: zwei gestellte Gruppen mit
   gestellten Ergebnissen. Damit ist die Regel des gefilterten Laufs pruefbar,
   ohne den ganzen Durchlauf ein zweites Mal zu fahren -- und ohne dass der
   Rahmen sich selbst bestaetigt: die Gruppe "Der Gruppenfilter" faehrt diese
   Probe als eigenen Prozess und sieht sich Ausgabe und Rueckgabewert an. */
if (process.env.PRUEFRAHMEN_PROBE) {
  const lage = process.env.PRUEFRAHMEN_PROBE;
  gruppe('Rechte am Eintrag');
  pruefe('gezeigt und grün', true);
  pruefe('gezeigt und rot', lage !== 'rot-gezeigt');
  gruppe('Fotos und Vorschau');
  pruefe('übergangen und grün', true);
  pruefe('übergangen und rot', lage !== 'rot-uebergangen');
  schlussBlock();
  process.exit(rueckgabewert());
}

/* ================= Umgebung ================= */
const KEY = crypto.randomBytes(32).toString('hex');
const PORT = 3900 + Math.floor(Math.random() * 90);
const BASIS = `http://127.0.0.1:${PORT}`;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-pruefung-'));
const NUTZER = 'pruefer', PASSWORT = 'pruef-passwort-' + crypto.randomBytes(4).toString('hex');

function oeffne(datei) {
  const d = new Database(datei);
  d.pragma("cipher='sqlcipher'");
  d.pragma(`key="x'${KEY}'"`);
  return d;
}

/* ================= Server ================= */
let kind, ausgabe = '';
function starteServer() {
  return new Promise((fertig, fehler) => {
    kind = spawn(process.execPath, ['server.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: String(PORT), DATA_DIR: DATA, ENCRYPTION_KEY: KEY }
    });
    kind.stdout.on('data', d => { ausgabe += d; });
    kind.stderr.on('data', d => { ausgabe += d; });
    kind.on('exit', c => { if (c) fehler(new Error(`Server beendet (Code ${c})\n${ausgabe}`)); });
    (async () => {
      for (let i = 0; i < 100; i++) {
        await new Promise(r => setTimeout(r, 100));
        // /api/config statt /api/health: health liegt hinter der Anmeldung.
        try { if ((await fetch(`${BASIS}/api/config`)).ok) return fertig(); } catch {}
      }
      fehler(new Error(`Server nicht erreichbar\n${ausgabe}`));
    })();
  });
}

// Kurzer Lauf in einem eigenen Prozess: db.js oeffnet die Datenbank beim Laden
// und laesst sich deshalb nicht zweimal im selben Prozess auf zwei
// Verzeichnisse ansetzen.
function kurzlauf(code, datenVerzeichnis) {
  const { execFileSync } = require('child_process');
  return execFileSync(process.execPath, ['-e', code], {
    cwd: __dirname, encoding: 'utf8',
    env: { ...process.env, DATA_DIR: datenVerzeichnis, ENCRYPTION_KEY: KEY }
  }).trim().split('\n').pop();
}

// Ein weiterer Server mit eigenem Datenverzeichnis, eigener Umgebung und
// eigenem Cookie. Gebraucht fuer alle Prueflagen, die eine eigene Anlage
// brauchen: frische Einrichtung, Rechte mit mehreren Zugaengen, Sperren.
function starteWeiterenServer(datenVerzeichnis, zusatz, portBasis) {
  const port = portBasis + Math.floor(Math.random() * 60);
  const basis = `http://127.0.0.1:${port}`;
  let protokoll = '', cookieB = '';
  const umgebung = { ...process.env, PORT: String(port), DATA_DIR: datenVerzeichnis, ENCRYPTION_KEY: KEY };
  delete umgebung.AUTH_RESET;
  Object.assign(umgebung, zusatz);
  const kindB = spawn(process.execPath, ['server.js'], { cwd: __dirname, env: umgebung });
  kindB.stdout.on('data', d => { protokoll += d; });
  kindB.stderr.on('data', d => { protokoll += d; });
  const rufB = async (methode, pfad, koerper) => {
    const opt = { method: methode, headers: {} };
    if (cookieB) opt.headers.cookie = cookieB;
    if (koerper !== undefined) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(koerper); }
    const a = await fetch(basis + pfad, opt);
    const setz = a.headers.get('set-cookie');
    if (setz) cookieB = setz.split(';')[0];
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };
  const bereit = (async () => {
    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 100));
      try { if ((await fetch(`${basis}/api/config`)).ok) return true; } catch {}
    }
    throw new Error(`Zweitserver nicht erreichbar\n${protokoll}`);
  })();
  return { bereit, ruf: rufB, protokoll: () => protokoll, basis,
           cookieLoeschen: () => { cookieB = ''; },
           stopp: () => new Promise(r => { kindB.on('exit', r); kindB.kill(); }) };
}

let cookie = '';
async function ruf(methode, pfad, koerper) {
  const opt = { method: methode, headers: {} };
  if (cookie) opt.headers.cookie = cookie;
  if (koerper !== undefined) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(koerper); }
  const a = await fetch(BASIS + pfad, opt);
  const setz = a.headers.get('set-cookie');
  if (setz) cookie = setz.split(';')[0];
  let inhalt = null;
  try { inhalt = await a.json(); } catch {}
  return { status: a.status, inhalt };
}
const namen = (liste) => liste.map(c => c.name);

/* ================= Ablauf ================= */
(async function lauf() {
  await starteServer();

  /* ---------------------------------------------------------------- */
  gruppe('Frische Installation');

  // Der Hauptserver startet auf einer leeren Anlage -- genau wie im Betrieb.
  const frischDb = oeffne(path.join(DATA, 'katalog.sqlite'));
  /* Die Spalte gewicht steht mit in der Abfrage -- und wird abgefangen, falls
     es sie nicht gibt: sonst risse ein Rueckbau der DDL den ganzen Lauf in der
     ERSTEN Gruppe ab und nennte keinen einzigen Namen (Stolperstein 103). */
  let frischKrit;
  try {
    frischKrit = frischDb.prepare('SELECT name, sort_order, gewicht FROM rating_criteria ORDER BY sort_order, id').all();
  } catch {
    frischKrit = frischDb.prepare('SELECT name, sort_order FROM rating_criteria ORDER BY sort_order, id').all();
  }
  pruefe('Grundausstattung wird angelegt', frischKrit.length === 3, JSON.stringify(frischKrit));
  pruefe('Grundausstattung ist durchnummeriert', gleich(frischKrit.map(c => c.sort_order), [0, 1, 2]));
  /* Erst auf Vorhandensein, dann auf die Eigenschaft (Stolperstein 81): eine
     leere Liste liesse every() gruen und belegte nichts. */
  pruefe('Und jedes Kriterium startet auf Gewicht 1',
    frischKrit.length === 3 && frischKrit.every(c => c.gewicht === 1),
    JSON.stringify(frischKrit.map(c => `${c.name}:${c.gewicht}`)));
  frischDb.close();
  pruefe('Vor der Einrichtung meldet /api/config Einrichtungsbedarf',
    (await ruf('GET', '/api/config')).inhalt.setupRequired === true);

  /* ---------------------------------------------------------------- */
  gruppe('Anmeldung');

  pruefe('Ohne Anmeldung keine Kriterien', (await ruf('GET', '/api/criteria')).status === 401);

  const einr = await ruf('POST', '/api/setup', { user: NUTZER, password: PASSWORT });
  pruefe('Die Einrichtung legt den ersten Zugang an', einr.status === 200 && einr.inhalt.ok === true,
    JSON.stringify(einr.inhalt));
  const nutzerTabelle = oeffne(path.join(DATA, 'katalog.sqlite'));
  const angelegt = nutzerTabelle.prepare('SELECT username, password_hash, role FROM users ORDER BY id').all();
  pruefe('Genau ein Zugang in der Datenbank', angelegt.length === 1 && angelegt[0].username === NUTZER,
    JSON.stringify(angelegt.map(u => u.username)));
  pruefe('Und er ist Eigentuemer', angelegt[0]?.role === 'eigentuemer', angelegt[0]?.role);
  // Erst auf Vorhandensein, dann auf Eigenschaften: sonst reisst ein fehlender
  // Zugang den ganzen Lauf mit.
  const hash = angelegt[0]?.password_hash || '';
  pruefe('Passwort liegt als scrypt-Hash, nicht im Klartext',
    /^scrypt\$16384\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/.test(hash) && !hash.includes(PASSWORT),
    hash ? hash.slice(0, 40) : 'kein Zugang vorhanden');
  nutzerTabelle.close();

  // Die Einrichtung meldet gleich an; die Anmelderoute wird trotzdem belegt.
  cookie = '';
  const anmeldung = await ruf('POST', '/api/login', { user: NUTZER, password: PASSWORT });
  pruefe('Anmeldung gelingt', anmeldung.status === 200 && cookie.startsWith('kriterion_session='));
  pruefe('Eingerichtet meldet /api/config keinen Einrichtungsbedarf',
    (await ruf('GET', '/api/config')).inhalt.setupRequired === false);

  /* --- Startbestand ueber die Schnittstelle: drei benannte Kriterien und ein
         erster Eintrag mit Sternen; darauf bauen die folgenden Gruppen auf. */
  {
    const start = (await ruf('GET', '/api/criteria')).inhalt;
    for (const [i, name] of [[0, 'Optik'], [1, 'Haptik'], [2, 'Preis']]) {
      await ruf('PUT', `/api/criteria/${start[i].id}`, { name });
    }
    const erster = (await ruf('POST', '/api/items',
      { title: 'Alteintrag', description: 'Erstbestand des Prueflaufs' })).inhalt;
    await ruf('PUT', `/api/items/${erster.id}/ratings`, { criterionId: start[0].id, value: 4 });
    // Ein Kriterium mit ausdruecklich 0 Sternen: der Zaehler darf es nicht zaehlen.
    await ruf('PUT', `/api/items/${erster.id}/ratings`, { criterionId: start[1].id, value: 0 });
  }

  /* ---------------------------------------------------------------- */
  gruppe('Umbenennung auf Kriterion');

  // Zwei Stellen der Umbenennung stehen bewusst nicht hier, sondern dort, wo
  // sie hingehoeren: der Cookiename eine Zeile weiter oben in der Anmeldung, die
  // Versionszeile in der Oberflaechengruppe. Beide gab es schon und wurden nur
  // umgestellt. Hier steht, was neu dazukommt.

  pruefe('Das Serverprotokoll traegt das Praefix [Kriterion]', /\[Kriterion\]/.test(ausgabe));
  pruefe('Und nirgends mehr das alte Praefix', !/\[Katalog\]/.test(ausgabe),
    (ausgabe.match(/.*\[Katalog\].*/) || [''])[0]);

  const composeText = fs.readFileSync(path.join(__dirname, 'docker-compose.yml'), 'utf8');
  const paketJson = require('./package.json');
  const indexText = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  pruefe('Dienst und Container heissen kriterion',
    /^ {2}kriterion:$/m.test(composeText) && /container_name: kriterion$/m.test(composeText));
  pruefe('package.json nennt den Namen kriterion', paketJson.name === 'kriterion', paketJson.name);
  pruefe('Der Fenstertitel heisst Kriterion', /<title>Kriterion<\/title>/.test(indexText));

  // Der Rueckfallname der Exportdatei greift nur, wenn title_app weder
  // Buchstaben noch Ziffern enthaelt -- im Betrieb steht dort ein Titel und die
  // Datei heisst nach ihm. Ohne dieses Erzwingen pruefte die Pruefung einen
  // Weg, den es gar nicht gibt.
  const titelZuvor = (await ruf('GET', '/api/titles')).inhalt;
  await ruf('PUT', '/api/titles', { publicTitle: titelZuvor.publicTitle, appTitle: '...' });
  const expAntwort = await fetch(`${BASIS}/api/export?photos=0`, { headers: { cookie: cookie } });
  const dispoKopf = expAntwort.headers.get('content-disposition') || '';
  await expAntwort.arrayBuffer();
  pruefe('Rueckfallname der Exportdatei lautet kriterion',
    /^attachment; filename="kriterion-export-\d{4}-\d{2}-\d{2}\.json"$/.test(dispoKopf), dispoKopf);
  await ruf('PUT', '/api/titles', titelZuvor);
  const titelNachher = (await ruf('GET', '/api/titles')).inhalt;
  pruefe('Die Titel stehen danach wieder wie vorher',
    titelNachher.publicTitle === titelZuvor.publicTitle && titelNachher.appTitle === titelZuvor.appTitle,
    JSON.stringify(titelNachher));

  /* Waechter: in den ausgelieferten Dateien steht nichts vom alten Namen --
     ausser den Zeichenfolgen, die ausdruecklich bleiben. Der Dateiname der
     Datenbank ist kein Projektname und wandert bei keiner Umbenennung mit.
     pruefung.js steht absichtlich nicht auf der Liste, sonst faende diese
     Pruefung ihre eigenen Suchmuster. */
  const ERLAUBT = ['katalog.sqlite', 'Bewertungskatalog'];
  const GEPRUEFT = ['server.js', 'db.js', 'auth.js', 'keys.js', 'zugang.js', 'anhaenge.js',
    'package.json', 'docker-compose.yml', 'Dockerfile', '.env.example',
    'public/app.js', 'public/index.html', 'public/style.css'];
  const funde = [];
  for (const datei of GEPRUEFT) {
    fs.readFileSync(path.join(__dirname, datei), 'utf8').split('\n').forEach((zeile, i) => {
      let rest = zeile;
      for (const erlaubt of ERLAUBT) rest = rest.split(erlaubt).join('');
      if (/katalog|kartei/i.test(rest)) funde.push(`${datei}:${i + 1}`);
    });
  }
  pruefe('Kein alter Name mehr in den ausgelieferten Dateien', funde.length === 0, funde.join(', '));

  /* ---------------------------------------------------------------- */
  gruppe('Der Bau ist wiederholbar');

  /* Das Lockfile nagelt die Abhaengigkeiten fest. Es allein genuegt nicht:
     ohne `npm ci` laege es im Repo und wuerde beim Bauen uebergangen -- ein
     Merker, der nichts bewirkt. Deshalb pruefen die drei Stuecke zusammen:
     die Datei ist da, das Image bekommt sie zu sehen, und der Befehl liest
     sie auch. */
  const sperrPfad = path.join(__dirname, 'package-lock.json');
  const sperrDa = fs.existsSync(sperrPfad);
  // Erst das Vorhandensein, dann die Eigenschaft: ohne diese Zeile bliebe
  // jede Aussage ueber den Inhalt bei fehlender Datei unpruefbar
  // (Stolperstein 81).
  pruefe('Das Lockfile liegt im Repo', sperrDa, sperrPfad);
  const sperre = sperrDa ? JSON.parse(fs.readFileSync(sperrPfad, 'utf8')) : {};
  pruefe('Es hat das heutige Format', sperre.lockfileVersion >= 3, `${sperre.lockfileVersion}`);
  pruefe('Es gehört zu dieser package.json',
    sperre.name === paketJson.name && sperre.version === paketJson.version,
    `${sperre.name} ${sperre.version} gegen ${paketJson.name} ${paketJson.version}`);
  pruefe('Es nennt jede Abhängigkeit der package.json',
    Object.keys(paketJson.dependencies).every(n => sperre.packages && sperre.packages['node_modules/' + n]),
    Object.keys(paketJson.dependencies).filter(n => !(sperre.packages || {})['node_modules/' + n]).join(', '));

  /* Der Ausschluss entscheidet darueber, ob `npm ci` im Image ueberhaupt
     etwas findet: was .dockerignore nennt, geht nicht mit in den Bauzusammen-
     hang, und dann bricht der Bau ab. Geprueft wird gegen JEDE Zeile, nicht
     gegen den blossen Dateinamen -- ein `*.json` wuerde sonst durchrutschen. */
  const alsMuster = (zeile) => new RegExp('^' + zeile.trim()
    .replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*') + '$');
  const ausschluesse = fs.readFileSync(path.join(__dirname, '.dockerignore'), 'utf8')
    .split('\n').map(z => z.trim()).filter(z => z && !z.startsWith('#') && !z.startsWith('!'));
  const trifft = ausschluesse.filter(z => alsMuster(z).test('package-lock.json'));
  pruefe('.dockerignore hält das Lockfile nicht zurück', trifft.length === 0, trifft.join(', '));
  // Gegenprobe zur Gegenprobe: das Muster taugt ueberhaupt etwas. Ohne diese
  // Zeile bliebe die Pruefung darueber auch dann gruen, wenn alsMuster() nie
  // etwas traefe -- eine Pruefung, die nicht scheitern kann.
  pruefe('Und das Muster greift nachweislich',
    ausschluesse.some(z => alsMuster(z).test('pruefung.js')) &&
    ausschluesse.some(z => alsMuster(z).test('kriterion.log')),
    ausschluesse.join(' · '));

  const dockerText = fs.readFileSync(path.join(__dirname, 'Dockerfile'), 'utf8');
  pruefe('Der Dockerfile kopiert das Lockfile in die Bauphase',
    /^COPY package\.json package-lock\.json \.\/$/m.test(dockerText));
  pruefe('Und liest sie mit npm ci', /^RUN npm ci --omit=dev$/m.test(dockerText));
  /* Das ist der eigentliche Punkt: bliebe irgendwo ein Aufruf der alten Art
     stehen, waere das Lockfile ein Merker ohne Wirkung. Gelesen werden nur
     die BEFEHLSZEILEN -- der Kommentar daneben nennt den alten Namen und darf
     das auch. */
  const bauZeilen = dockerText.split('\n').filter(z => !z.trim().startsWith('#'));
  pruefe('Keine Bauzeile ruft npm install',
    !bauZeilen.some(z => /npm install/.test(z)),
    bauZeilen.filter(z => /npm install/.test(z)).join(' · '));

  /* Ohne HEALTHCHECK weiss Docker nur, dass der Prozess laeuft -- nicht, ob
     er antwortet. Ein Container in einer Neustartschleife saehe von aussen
     gesund aus.
     Gefragt wird /api/config und NICHT /api/health: health liegt hinter der
     Anmeldung, ein Healthcheck kaeme dort nie durch. Beide Haelften stehen
     hier zusammen, sonst pruefte die Zeile nur einen Text im Dockerfile. */
  const gesundZeile = dockerText.split('\n').find(z => z.startsWith('HEALTHCHECK'));
  pruefe('Der Dockerfile hat einen Healthcheck', !!gesundZeile, 'keine HEALTHCHECK-Zeile');
  pruefe('Er fragt /api/config, das schon vor der Anmeldung antwortet',
    dockerText.includes("/api/config'") || dockerText.includes('/api/config"'),
    gesundZeile || '(keine Zeile)');
  pruefe('Und /api/config antwortet wirklich ohne Anmeldung',
    (await fetch(`${BASIS}/api/config`)).status === 200);

  /* ---------------------------------------------------------------- */
  gruppe('Der Versions-Fingerprint');

  /* Der Fingerprint ist eine Ableitung beim Start: er geht ueber die Dateien, die
     der Server WIRKLICH laedt (require.cache) und WIRKLICH ausliefert
     (public/). Geprueft wird deshalb nicht die Liste -- die nachzubilden
     hiesse, dieselbe Rechnung ein zweites Mal aufzuschreiben und damit zwei
     Wahrheiten zu haben. Geprueft wird, WORAUF ER REAGIERT.

     Dafuer laeuft ein Server aus einer KOPIE des Quelltextes in einem
     Wegwerfverzeichnis. Nur so lassen sich Dateien anfassen, ohne den
     laufenden Prueflauf unter sich selbst zu veraendern. */
  const quellKopie = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-quelle-'));
  for (const e of fs.readdirSync(__dirname, { withFileTypes: true })) {
    if (['node_modules', 'data', '.git'].includes(e.name)) continue;
    const ziel = path.join(quellKopie, e.name);
    if (e.isDirectory()) fs.cpSync(path.join(__dirname, e.name), ziel, { recursive: true });
    else if (e.isFile()) fs.copyFileSync(path.join(__dirname, e.name), ziel);
  }
  // Ueber die Verknuepfung loest require die Pakete auf ihren ECHTEN Ort auf;
  // sie liegen damit ausserhalb der Kopie und koennen gar nicht mitzaehlen.
  fs.symlinkSync(path.join(__dirname, 'node_modules'), path.join(quellKopie, 'node_modules'));

  // Ein Server aus der Kopie, frisch eingerichtet, einmal nach den Kennzahlen
  // gefragt und wieder beendet. Jeder Aufruf bekommt ein eigenes
  // Datenverzeichnis -- der Fingerprint darf vom Bestand nicht abhaengen.
  /* Die Ports werden fortlaufend vergeben, nicht gewuerfelt: hier laufen ueber
     ein Dutzend Server nacheinander, und bei gewuerfelten Nummern trifft
     frueher oder spaeter einer auf einen, der noch nicht losgelassen hat.
     NICHT AB 6000: fetch() weigert sich, eine Reihe von Portnummern
     ueberhaupt anzuwaehlen -- 6000 ist X11 und steht auf der Sperrliste der
     Fetch-Spezifikation. Der Server laeuft dann und meldet es auch, nur
     kommt die Pruefung nicht an ihn heran ("bad port"). curl kommt durch,
     fetch nicht. */
  let fingerprintPort = 6100;
  async function fingerprintAus(verzeichnis) {
    const datenVerz = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-fingerprint-'));
    const port = fingerprintPort++;
    const basis = `http://127.0.0.1:${port}`;
    const umgebung = { ...process.env, PORT: String(port), DATA_DIR: datenVerz, ENCRYPTION_KEY: KEY };
    delete umgebung.AUTH_RESET;
    const kindQ = spawn(process.execPath, ['server.js'], { cwd: verzeichnis, env: umgebung });
    let prot = '';
    kindQ.stdout.on('data', d => { prot += d; });
    kindQ.stderr.on('data', d => { prot += d; });
    try {
      let bereit = false;
      for (let i = 0; i < 120 && !bereit; i++) {
        await new Promise(r => setTimeout(r, 100));
        try { bereit = (await fetch(`${basis}/api/config`)).ok; } catch {}
      }
      if (!bereit) throw new Error(`Server aus der Kopie (Port ${port}) nicht erreichbar\n${prot}`);
      const ein = await fetch(`${basis}/api/setup`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ user: NUTZER, password: PASSWORT }) });
      const cookieQ = (ein.headers.get('set-cookie') || '').split(';')[0];
      const st = await (await fetch(`${basis}/api/stats`, { headers: { cookie: cookieQ } })).json();
      return st.fingerprint;
    } finally {
      await new Promise(r => { kindQ.on('exit', r); kindQ.kill(); });
      fs.rmSync(datenVerz, { recursive: true, force: true });
    }
  }

  // Der Wert des laufenden Servers, gegen den verglichen wird.
  const fingerprintPlatte = (await ruf('GET', '/api/stats')).inhalt.fingerprint;
  const fingerprintKopie = await fingerprintAus(quellKopie);
  // Erst das Vorhandensein, dann jede Aussage darueber (Stolperstein 81): ohne
  // diese Zeile bliebe jeder Vergleich zweier fehlender Werte wahr.
  pruefe('Der Server aus der Kopie nennt einen Fingerprint',
    /^[0-9a-f]{8}$/.test(fingerprintKopie || ''), JSON.stringify(fingerprintKopie));
  /* Die Kopie liegt woanders, traegt ein eigenes Datenverzeichnis und einen
     eigenen Bestand -- und kommt trotzdem auf denselben Wert. Der Fingerprint
     haengt am INHALT der Dateien, nicht am Ort und nicht am Bestand. */
  pruefe('Und es ist derselbe wie auf der Platte', fingerprintKopie === fingerprintPlatte,
    `${fingerprintKopie} gegen ${fingerprintPlatte}`);

  // Kleine Hilfe: eine Datei in der Kopie anfassen und neu fragen.
  const nachAenderung = async (rel, inhalt) => {
    const voll = path.join(quellKopie, rel);
    fs.mkdirSync(path.dirname(voll), { recursive: true });
    fs.writeFileSync(voll, inhalt);
    return fingerprintAus(quellKopie);
  };

  /* DIE FALLE, UND SIE IST DER GRUND FUER DIE ABLEITUNG: pruefung.js und Doku/
     liegen im Repo, aber nicht im Image (.dockerignore). Zaehlten sie mit,
     waere der Fingerprint im Container ein anderer als auf der Platte -- und damit
     wertlos. */
  pruefe('Eine Änderung an pruefung.js lässt ihn unberührt',
    await nachAenderung('pruefung.js', '// nicht ausgeliefert\n') === fingerprintKopie);
  pruefe('Eine neue Datei unter Doku ebenfalls',
    await nachAenderung('Doku/Neu.md', '# nicht ausgeliefert\n') === fingerprintKopie);
  /* Die bewusste Grenze, ausdruecklich festgehalten, damit sie nicht
     stillschweigend kippt: zugang.js liegt im Image, wird aber nur von Hand
     aufgerufen und nie vom Server geladen. Der Fingerprint sagt, welcher SERVER
     laeuft. */
  pruefe('Und eine an zugang.js auch — es läuft nicht im Server',
    await nachAenderung('zugang.js', '// von Hand, nicht im Server\n') === fingerprintKopie);

  /* Und die Gegenrichtung. Ohne sie koennte der Fingerprint eine feste
     String sein und alle Pruefungen darueber blieben gruen. */
  const appVorher = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  const fingerprintApp = await nachAenderung('public/app.js', appVorher + '\n// eine Zeile mehr\n');
  pruefe('Eine Änderung an public/app.js ändert ihn',
    /^[0-9a-f]{8}$/.test(fingerprintApp || '') && fingerprintApp !== fingerprintKopie,
    `${fingerprintApp} gegen ${fingerprintKopie}`);
  fs.writeFileSync(path.join(quellKopie, 'public', 'app.js'), appVorher);

  const dbVorher = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
  const fingerprintDb = await nachAenderung('db.js', dbVorher + '\n// eine Zeile mehr\n');
  pruefe('Eine Änderung an db.js ändert ihn ebenfalls',
    fingerprintDb !== fingerprintKopie && fingerprintDb !== fingerprintApp,
    `${fingerprintDb} gegen ${fingerprintKopie} und ${fingerprintApp}`);
  fs.writeFileSync(path.join(quellKopie, 'db.js'), dbVorher);

  /* DER NAME GEHOERT MIT HINEIN, nicht nur der Inhalt. Zwei Dateien mit
     GLEICHEM Inhalt und verschiedenem Namen muessen zu verschiedenen Abdruecken
     fuehren -- sonst bliebe eine Umbenennung unsichtbar. Der Inhalt ist bei
     beiden Schritten Zeichen fuer Zeichen derselbe, es unterscheidet sie
     ausschliesslich der Name. */
  const fingerprintZ1 = await nachAenderung('public/z1.txt', 'derselbe Inhalt\n');
  fs.rmSync(path.join(quellKopie, 'public', 'z1.txt'));
  const fingerprintZ2 = await nachAenderung('public/z2.txt', 'derselbe Inhalt\n');
  pruefe('Zwei Dateien gleichen Inhalts unter verschiedenem Namen sind verschieden',
    fingerprintZ1 !== fingerprintZ2 && /^[0-9a-f]{8}$/.test(fingerprintZ1 || ''),
    `${fingerprintZ1} gegen ${fingerprintZ2}`);
  fs.rmSync(path.join(quellKopie, 'public', 'z2.txt'));

  /* Zum Schluss zurueck auf den Ausgangsstand. Bliebe der Fingerprint jetzt
     verschieden, haengt er an etwas anderem als dem Inhalt -- an der Zahl der
     Starts etwa, oder an einem Zeitstempel. */
  pruefe('Zurück am Ausgangsstand steht wieder der erste Wert',
    await fingerprintAus(quellKopie) === fingerprintKopie);

  fs.rmSync(quellKopie, { recursive: true, force: true });

  /* Der Fingerprint wird beim START gebildet, und vollstaendig ist er nur, solange
     jedes Modul am Dateianfang geladen wird: ein require INNERHALB einer
     Funktion liefe erst spaeter und stuende dann nicht darin -- der Fingerprint
     wuerde still unvollstaendig, ohne dass irgendetwas rot wird.

     Geprueft wird an dem, was WIRKLICH im Fingerprint steht, also am Modulgraphen
     ab server.js. Auch das eine Ableitung und keine zweite Liste. zugang.js
     und pruefung.js fallen heraus -- beide laden innerhalb von Funktionen und
     duerfen das auch, weil der Server sie nie laedt. */
  const modulGraph = (start) => {
    const gesehen = new Set();
    const holen = (rel) => {
      if (gesehen.has(rel)) return;
      gesehen.add(rel);
      for (const t of fs.readFileSync(path.join(__dirname, rel), 'utf8')
        .matchAll(/require\('\.\/([\w.-]+)'\)/g)) {
        const name = /\.(js|json)$/.test(t[1]) ? t[1] : t[1] + '.js';
        if (fs.existsSync(path.join(__dirname, name))) holen(name);
      }
    };
    holen(start);
    return [...gesehen].sort();
  };
  const imFingerprint = modulGraph('server.js').filter(n => n.endsWith('.js'));
  const spaetGeladen = [];
  for (const n of imFingerprint)
    fs.readFileSync(path.join(__dirname, n), 'utf8').split('\n').forEach((z, i) => {
      if (/^\s+.*\brequire\(/.test(z)) spaetGeladen.push(`${n}:${i + 1}`);
    });
  // Erst das Vorhandensein, dann die Eigenschaft: bliebe die Ableitung bei
  // server.js allein stehen, waere die Pruefung darunter gruen, ohne eine
  // einzige der anderen Dateien gelesen zu haben (Stolperstein 81).
  pruefe('Der Modulgraph nennt mehr als server.js allein',
    imFingerprint.length >= 5, imFingerprint.join(' · '));
  pruefe('Und weder zugang.js noch pruefung.js stehen darauf',
    !imFingerprint.includes('zugang.js') && !imFingerprint.includes('pruefung.js'),
    imFingerprint.join(' · '));
  pruefe('Kein Modul des Servers wird erst innerhalb einer Funktion geladen',
    spaetGeladen.length === 0, spaetGeladen.join(', '));

  /* ---------------------------------------------------------------- */
  gruppe('Der Gruppenfilter');

  /* Der Rahmen kann sich nicht selbst bestaetigen: waeren Zaehlung oder
     Rueckgabewert falsch, waere es genau die Zaehlung, die es meldet. Die
     Selbstprobe am Dateianfang laeuft deshalb als EIGENER PROZESS, und hier
     werden Ausgabe und Rueckgabewert von aussen angesehen. Sie fuehrt zwei
     gestellte Gruppen und kostet Millisekunden -- den ganzen Durchlauf ein
     zweites Mal zu fahren, kostete eine Minute und brachte nichts dazu. */
  const rahmenProbe = (lage, filter) => {
    const r = require('child_process').spawnSync(process.execPath,
      filter ? ['pruefung.js', filter] : ['pruefung.js'],
      { cwd: __dirname, encoding: 'utf8', env: { ...process.env, PRUEFRAHMEN_PROBE: lage } });
    return { text: r.stdout || '', code: r.status };
  };

  const ohneFilter = rahmenProbe('1', '');
  // Erst das Vorhandensein: kaeme aus dem Kindprozess gar nichts, waere jede
  // Verneinung darunter wahr und der ganze Abschnitt gruen (Stolperstein 81).
  pruefe('Die Selbstprobe des Rahmens läuft überhaupt',
    /Pruefungen bestanden/.test(ohneFilter.text), JSON.stringify(ohneFilter.text.slice(0, 120)));
  pruefe('Ohne Filter stehen beide Gruppen da',
    /Rechte am Eintrag/.test(ohneFilter.text) && /Fotos und Vorschau/.test(ohneFilter.text));
  pruefe('Und kein Wort von einem gefilterten Lauf',
    !/GEFILTERTER LAUF/.test(ohneFilter.text));
  pruefe('Vier Prüfungen, Rückgabewert null',
    /4 von 4 Pruefungen bestanden/.test(ohneFilter.text) && ohneFilter.code === 0,
    `Code ${ohneFilter.code}`);

  const gefiltert = rahmenProbe('1', 'Rechte');
  pruefe('Mit Filter bleibt die passende Gruppe stehen',
    /Rechte am Eintrag/.test(gefiltert.text));
  pruefe('Und die andere verschwindet',
    !/Fotos und Vorschau/.test(gefiltert.text));
  /* DIE REGEL, UM DIE ES GEHT: ohne diesen Satz liese sich "alles in Ordnung"
     nach einem Teillauf als vollstaendiger Beleg lesen. */
  pruefe('Der Lauf sagt selbst, dass er gefiltert war',
    /GEFILTERTER LAUF nach "Rechte" — KEIN VOLLSTAENDIGER BELEG/.test(gefiltert.text));
  pruefe('Und nennt die Zahl der übergangenen Gruppen',
    /1 von 2 Gruppen gezeigt, 1 uebergangen \(2 Pruefungen\)/.test(gefiltert.text),
    gefiltert.text.split('\n').filter(z => /Gruppen/.test(z)).join(' | '));

  /* Ein Fehlschlag in einer UEBERGANGENEN Gruppe: der Rueckgabewert folgt dem
     Gezeigten und bleibt null -- sonst waere der Filter wertlos -- aber der
     Schlussblock nennt ihn, damit niemand den Teillauf fuer vollstaendig
     haelt. */
  const stillRot = rahmenProbe('rot-uebergangen', 'Rechte');
  pruefe('Ein Fehlschlag im Übergangenen wird ausdrücklich gemeldet',
    /DARIN 1 GESCHEITERT — hier nicht angezeigt/.test(stillRot.text),
    stillRot.text.split('\n').filter(z => /GESCHEITERT/.test(z)).join(' | '));
  pruefe('Und färbt den Rückgabewert trotzdem nicht rot', stillRot.code === 0,
    `Code ${stillRot.code}`);
  pruefe('Er taucht auch in keiner Zeile mit einem Namen auf',
    !/✗/.test(stillRot.text), stillRot.text.split('\n').filter(z => /✗/.test(z)).join(' | '));

  /* Und die Gegenrichtung: ein Fehlschlag in einer GEZEIGTEN Gruppe macht den
     Lauf rot. Ohne dieses Paar bliebe offen, ob der Rueckgabewert ueberhaupt
     noch auf etwas reagiert. */
  const gezeigtRot = rahmenProbe('rot-gezeigt', 'Rechte');
  pruefe('Ein Fehlschlag im Gezeigten macht den Lauf rot',
    gezeigtRot.code === 1 && /1 GESCHEITERT/.test(gezeigtRot.text), `Code ${gezeigtRot.code}`);

  /* Ein Filter, auf den nichts passt, ist die eigentliche Falle: er zeigt
     nichts, und ohne Regel meldete er wortlos Erfolg. */
  const daneben = rahmenProbe('1', 'Gibtesnicht');
  pruefe('Ein Filter ohne Treffer meldet keinen Erfolg',
    /KEINE PRUEFUNG GEZEIGT/.test(daneben.text) &&
    /KEINE EINZIGE GRUPPE traegt den Namen/.test(daneben.text),
    daneben.text.split('\n').filter(z => z.trim()).join(' | '));
  pruefe('Und sein Rückgabewert ist rot', daneben.code === 1, `Code ${daneben.code}`);

  /* ---------------------------------------------------------------- */
  gruppe('Der Prueflauf bei jedem Push');

  /* ZWEI ZAHLEN, DIE ZUSAMMENGEHOEREN. Laeuft der Prueflauf gegen eine andere
     Node-Version als der Container, prueft er etwas, das so nirgends
     betrieben wird -- und der Befund davor ("lokal 22, im Image 20") kaeme
     unbemerkt zurueck. Beide Zahlen stehen an verschiedenen Stellen; hier
     werden sie gegeneinander gehalten. */
  const werkPfad = path.join(__dirname, '.github', 'workflows', 'pruefstand.yml');
  const werkDa = fs.existsSync(werkPfad);
  // Erst das Vorhandensein: fehlt die Datei, waere jede Aussage ueber ihren
  // Inhalt an einem leeren String wahr (Stolperstein 81).
  pruefe('Die Datei für den Prüflauf liegt im Repo', werkDa, werkPfad);
  const werkText = werkDa ? fs.readFileSync(werkPfad, 'utf8') : '';
  const werkNode = (werkText.match(/node-version:\s*'([^']+)'/) || [])[1];
  const imageNode = (dockerText.match(/^FROM node:(\d+)-/m) || [])[1];
  pruefe('Sie nennt eine Node-Version', !!werkNode, JSON.stringify(werkNode));
  pruefe('Der Dockerfile nennt ebenfalls eine', !!imageNode, JSON.stringify(imageNode));
  pruefe('Und es ist dieselbe', werkNode === imageNode,
    `Prüflauf ${werkNode}, Image ${imageNode}`);
  // Beide Stufen des Dockerfile -- die Bauphase uebersetzt, die Laufzeit
  // fuehrt aus. Stuenden dort verschiedene Zahlen, passte die native
  // Datenbankanbindung nicht zur Laufzeit (ABI).
  const imageZeilen = [...dockerText.matchAll(/^FROM node:([^\s]+)/mg)].map(t => t[1]);
  pruefe('Bauphase und Laufzeit stehen auf demselben Image',
    imageZeilen.length === 2 && imageZeilen[0] === imageZeilen[1],
    imageZeilen.join(' gegen '));

  /* Der Lauf muss das Lockfile lesen und die bekannten Luecken ansehen --
     sonst waere er ein Prueflauf ohne die beiden Punkte, um die es in dieser
     Runde geht. */
  pruefe('Der Lauf holt die Abhängigkeiten mit npm ci',
    /^\s+run: npm ci$/m.test(werkText));
  pruefe('Er fährt den Prüfstand', /^\s+run: npm test$/m.test(werkText));
  pruefe('Und sieht die bekannten Lücken ab "high" an',
    /^\s+run: npm audit --audit-level=high$/m.test(werkText));
  // Die Schwelle wird nicht heimlich gesenkt: weder ueber --audit-level noch
  // dadurch, dass der Schritt scheitern darf.
  pruefe('Die Schwelle ist nicht abgesenkt',
    !/audit-level=(low|moderate)/.test(werkText) &&
    !/continue-on-error/.test(werkText) && !/\|\|\s*true/.test(werkText),
    werkText.split('\n').filter(z => /audit|continue-on-error/.test(z)).join(' | '));
  pruefe('Er läuft bei push und bei pull_request',
    /^on:\s*\[push, pull_request\]$/m.test(werkText),
    (werkText.match(/^on:.*$/m) || [''])[0]);

  /* ---------------------------------------------------------------- */
  gruppe('Kriterien: lesen, umbenennen, anlegen');

  let krit = (await ruf('GET', '/api/criteria')).inhalt;
  pruefe('Reihenfolge wie in der Datenbank', gleich(namen(krit), ['Optik', 'Haptik', 'Preis']));
  pruefe('Zaehler nennt nur vergebene Sterne',
    krit[0].usage_count === 1 && krit[1].usage_count === 0,
    `Optik=${krit[0].usage_count}, Haptik=${krit[1].usage_count} (Haptik steht auf 0 Sternen und zaehlt nicht)`);

  const umbenannt = await ruf('PUT', `/api/criteria/${krit[0].id}`, { name: 'Optische Erscheinung' });
  pruefe('Umbenennen gelingt', umbenannt.status === 200 && umbenannt.inhalt.name === 'Optische Erscheinung');
  pruefe('Umbenennen laesst die Position stehen', umbenannt.inhalt.sort_order === 0);

  const gleicherName = await ruf('PUT', `/api/criteria/${krit[1].id}`, { name: 'optische erscheinung' });
  pruefe('Namensdoppelung wird abgewiesen (auch bei anderer Schreibweise)',
    gleicherName.status === 409, `Status ${gleicherName.status}`);
  const eigenerName = await ruf('PUT', `/api/criteria/${krit[1].id}`, { name: 'HAPTIK' });
  pruefe('Eigene Schreibweise aendern ist erlaubt', eigenerName.status === 200 && eigenerName.inhalt.name === 'HAPTIK');
  pruefe('Leerer Name wird abgewiesen', (await ruf('PUT', `/api/criteria/${krit[1].id}`, { name: '  ' })).status === 400);
  pruefe('Unbekanntes Kriterium meldet 404', (await ruf('PUT', '/api/criteria/9999', { name: 'X' })).status === 404);

  const neu = await ruf('POST', '/api/criteria', { name: 'Verarbeitung' });
  pruefe('Neues Kriterium haengt sich hinten an', neu.status === 201 && neu.inhalt.sort_order === 3);
  pruefe('Doppelanlage wird abgewiesen', (await ruf('POST', '/api/criteria', { name: 'verarbeitung' })).status === 409);

  /* ---------------------------------------------------------------- */
  gruppe('Kriterien: Reihenfolge');

  krit = (await ruf('GET', '/api/criteria')).inhalt;
  const rueckwaerts = krit.map(c => c.id).reverse();
  const sortiert = await ruf('PUT', '/api/criteria/order', { order: rueckwaerts });
  pruefe('Sortieren gelingt', sortiert.status === 200);
  pruefe('Route /order wird nicht als Id gelesen', sortiert.inhalt && Array.isArray(sortiert.inhalt));
  /* Die beiden Zeilen lesen aus der Antwort. Steht dort statt der Liste eine
     Absage, risse der Lauf hier ab, statt rot zu werden -- und eine
     Gegenprobe, die den Lauf abbricht, nennt keinen einzigen Namen.
     Deshalb erst nachsehen, ob ueberhaupt eine Liste da ist. */
  const sortListe = Array.isArray(sortiert.inhalt) ? sortiert.inhalt : null;
  pruefe('Neue Reihenfolge steht in der Antwort',
    !!sortListe && gleich(sortListe.map(c => c.id), rueckwaerts), JSON.stringify(sortiert.inhalt));
  pruefe('Nummerierung bleibt lueckenlos',
    !!sortListe && gleich(sortListe.map(c => c.sort_order), [0, 1, 2, 3]), JSON.stringify(sortiert.inhalt));
  pruefe('Reihenfolge ueberlebt den naechsten Abruf',
    gleich((await ruf('GET', '/api/criteria')).inhalt.map(c => c.id), rueckwaerts));

  const halbeListe = await ruf('PUT', '/api/criteria/order', { order: [rueckwaerts[3]] });
  pruefe('Unvollstaendige Liste hinterlaesst keine Luecken',
    Array.isArray(halbeListe.inhalt) &&
    gleich(halbeListe.inhalt.map(c => c.sort_order), [0, 1, 2, 3]), JSON.stringify(halbeListe.inhalt));

  /* ---------------------------------------------------------------- */
  gruppe('Wirkung auf den Eintrag');

  const reihenfolge = namen((await ruf('GET', '/api/criteria')).inhalt);
  const eintrag = (await ruf('GET', '/api/items/1')).inhalt;
  pruefe('Detailansicht folgt der eingestellten Reihenfolge',
    gleich(eintrag.ratings.map(r => r.name), reihenfolge), JSON.stringify(eintrag.ratings.map(r => r.name)));
  pruefe('Sterne haengen weiter am richtigen Kriterium',
    eintrag.ratings.find(r => r.name === 'Optische Erscheinung').value === 4);

  const zweiter = (await ruf('POST', '/api/items', { title: 'Zweiter Eintrag' })).inhalt;
  pruefe('Neuer Eintrag bekommt dieselbe Reihenfolge', gleich(zweiter.ratings.map(r => r.name), reihenfolge));

  // So baut die Vergleichsansicht ihre Zeilen: erste Nennung gewinnt, ueber
  // alle verglichenen Eintraege hinweg. Hier nachgerechnet statt nachgezaehlt.
  const vergleichszeilen = [];
  [eintrag, zweiter].forEach(i => i.ratings.forEach(r => {
    if (!vergleichszeilen.includes(r.name)) vergleichszeilen.push(r.name);
  }));
  pruefe('Vergleich reiht die Kriterien genauso',
    gleich(vergleichszeilen, reihenfolge), JSON.stringify(vergleichszeilen));

  /* ---------------------------------------------------------------- */
  gruppe('Loeschen');

  const vorherIds = (await ruf('GET', '/api/criteria')).inhalt.map(c => c.id);
  pruefe('Loeschen gelingt', (await ruf('DELETE', `/api/criteria/${vorherIds[1]}`)).status === 204);
  const nachher = (await ruf('GET', '/api/criteria')).inhalt;
  pruefe('Restliche Reihenfolge bleibt',
    gleich(nachher.map(c => c.id), vorherIds.filter(i => i !== vorherIds[1])));
  pruefe('Nummerierung nach dem Loeschen lueckenlos', gleich(nachher.map(c => c.sort_order), [0, 1, 2]));

  /* ---------------------------------------------------------------- */
  gruppe('Export und Import');

  const aus = await ruf('GET', '/api/export?photos=0');
  pruefe('Export nennt die Kriterienreihenfolge',
    gleich(aus.inhalt.criteria, namen(nachher)), JSON.stringify(aus.inhalt.criteria));
  pruefe('Bestehende Felder unveraendert',
    Array.isArray(aus.inhalt.items) && 'ratings' in aus.inhalt.items[0] && 'testDays' in aus.inhalt.items[0]);

  // Alte Exportdatei ohne das neue Feld: muss weiterhin laufen.
  const alteDatei = { exported_at: new Date().toISOString(), title: 'Alt', version: 4, items: [
    { title: 'Aus alter Datei', ratings: [{ name: 'Nur hier', value: 3 }] }
  ]};
  const imAlt = await sendeImport(alteDatei, 'merge');
  pruefe('Aeltere Exportdatei laesst sich einspielen', imAlt.status === 200 && imAlt.inhalt.items === 1);
  const nachAlt = (await ruf('GET', '/api/criteria')).inhalt;
  pruefe('Unbekanntes Kriterium haengt sich hinten an', namen(nachAlt)[nachAlt.length - 1] === 'Nur hier');
  pruefe('Nummerierung nach dem Import lueckenlos', gleich(nachAlt.map(c => c.sort_order), [0, 1, 2, 3]));

  // Neue Exportdatei mit Reihenfolge, ersetzend eingespielt.
  const neueDatei = { exported_at: new Date().toISOString(), title: 'Neu', version: 5,
    criteria: ['Zuerst', 'Dann', 'Zuletzt'],
    items: [{ title: 'Eingespielt', ratings: [{ name: 'Zuletzt', value: 5 }] }] };
  const imNeu = await sendeImport(neueDatei, 'replace');
  pruefe('Ersetzender Import gelingt', imNeu.status === 200);
  const nachNeu = namen((await ruf('GET', '/api/criteria')).inhalt);
  pruefe('Reihenfolge der Datei wird uebernommen',
    gleich(nachNeu.slice(-3), ['Zuerst', 'Dann', 'Zuletzt']), JSON.stringify(nachNeu));
  const eingespielt = (await ruf('GET', '/api/items')).inhalt;
  pruefe('Eintrag aus der Datei ist da', eingespielt.length === 1 && eingespielt[0].title === 'Eingespielt');

  /* --- Die Gewichte in der Datei -----------------------------------------
     Eine Datei OHNE das Feld muss weiterhin laufen, und alles steht danach auf
     1,0. Das ist der Fall jeder aelteren Exportdatei -- und die eben
     eingespielte war schon eine. */
  const gewNachAlt = (await ruf('GET', '/api/criteria')).inhalt;
  pruefe('Eine Datei ohne das Feld laesst alle Gewichte auf 1',
    gewNachAlt.length > 0 && gewNachAlt.every(c => c.gewicht === 1),
    JSON.stringify(gewNachAlt.map(c => `${c.name}:${c.gewicht}`)));

  /* EIN BEKANNTES KRITERIUM BEHAELT SEIN GEWICHT, ein NEUES bekommt das aus
     der Datei. Der Import legt Bestand an, er aendert keine Einstellung des
     Ziels -- dieselbe Regel wie beim ersetzenden Import, der `users` nicht
     anruehrt. Beide Faelle in EINER Datei, sonst liesse sich nicht sehen, ob
     die Unterscheidung ueberhaupt stattfindet. */
  const gewZiel = gewNachAlt.find(c => c.name === 'Zuerst');
  await ruf('PUT', `/api/criteria/${gewZiel.id}`, { name: 'Zuerst', gewicht: 1.5 });
  const gewDatei = { exported_at: new Date().toISOString(), title: 'Mit Gewichten', version: 9,
    criteria: ['Zuerst', 'Ganz neu'],
    criteriaGewichte: { 'Zuerst': 0.5, 'Ganz neu': 1.8 },
    items: [{ title: 'Mit Gewichten', ratings: [] }] };
  const gewIm = await sendeImport(gewDatei, 'merge');
  pruefe('Ein Import mit Gewichten gelingt', gewIm.status === 200, JSON.stringify(gewIm.inhalt));
  const gewNach = (await ruf('GET', '/api/criteria')).inhalt;
  const gewVon = (n) => gewNach.find(c => c.name === n)?.gewicht;
  pruefe('Ein bekanntes Kriterium behaelt sein vorhandenes Gewicht',
    gewVon('Zuerst') === 1.5, `${gewVon('Zuerst')}`);
  pruefe('Ein neu angelegtes bekommt das Gewicht aus der Datei',
    gewVon('Ganz neu') === 1.8, `${gewVon('Ganz neu')}`);

  /* EIN UNGUELTIGES GEWICHT BRICHT NICHT AB, sondern faellt auf 1,0 und wird
     genannt -- dieselbe Haltung wie bei einem unbekannten Verfassernamen.
     Drei Sorten Unfug nebeneinander: ueber der Grenze, negativ und gar keine
     Zahl. Und ein gueltiges daneben, sonst bliebe offen, ob ueberhaupt noch
     etwas ankommt. */
  const gewKrumm = { exported_at: new Date().toISOString(), title: 'Krumm', version: 9,
    criteria: ['Zu schwer', 'Negativ', 'Kein Wert', 'Sauber'],
    criteriaGewichte: { 'Zu schwer': 9, 'Negativ': -1, 'Kein Wert': 'viel', 'Sauber': 1.2 },
    items: [{ title: 'Krumme Datei', ratings: [] }] };
  const gewImKrumm = await sendeImport(gewKrumm, 'merge');
  pruefe('Ein ungueltiges Gewicht bricht die Einspielung nicht ab',
    gewImKrumm.status === 200 && gewImKrumm.inhalt?.items === 1, JSON.stringify(gewImKrumm.inhalt));
  const gewKrummNach = (await ruf('GET', '/api/criteria')).inhalt;
  const gewKrummVon = (n) => gewKrummNach.find(c => c.name === n)?.gewicht;
  pruefe('Es faellt auf 1,0 zurueck',
    gewKrummVon('Zu schwer') === 1 && gewKrummVon('Negativ') === 1 && gewKrummVon('Kein Wert') === 1,
    JSON.stringify(gewKrummNach.map(c => `${c.name}:${c.gewicht}`)));
  pruefe('Das gueltige daneben kommt trotzdem an', gewKrummVon('Sauber') === 1.2,
    `${gewKrummVon('Sauber')}`);
  pruefe('Und die Antwort nennt die verworfenen Gewichte',
    gleich(gewImKrumm.inhalt?.gewichteVerworfen, ['Kein Wert', 'Negativ', 'Zu schwer']),
    JSON.stringify(gewImKrumm.inhalt?.gewichteVerworfen));
  pruefe('Bei einer sauberen Datei bleibt die Liste leer',
    gleich(gewIm.inhalt?.gewichteVerworfen, []), JSON.stringify(gewIm.inhalt?.gewichteVerworfen));
  pruefe('Das Protokoll nennt sie ebenfalls',
    /ungueltiges Gewicht auf 1,0 zurueckgesetzt/.test(ausgabe),
    (ausgabe.match(/.*Gewicht auf 1,0.*/) || ['(nichts im Protokoll)'])[0]);

  /* Ein RUNDLAUF: Gewichte setzen, exportieren, in dieselbe Anlage ersetzend
     einspielen. Der ersetzende Import loescht items, Kategorien und Tags --
     rating_criteria ausdruecklich NICHT. Die Gewichte stehen danach also
     unveraendert da. */
  const gewRund = (await ruf('GET', '/api/criteria')).inhalt;
  await ruf('PUT', `/api/criteria/${gewRund[0].id}`, { name: gewRund[0].name, gewicht: 0.6 });
  const gewVorRund = (await ruf('GET', '/api/criteria')).inhalt
    .map(c => `${c.name}:${c.gewicht}`);
  const gewAus = (await ruf('GET', '/api/export?photos=0')).inhalt;
  await sendeImport(gewAus, 'replace');
  pruefe('Ein Rundlauf in dieselbe Anlage laesst die Gewichte stehen',
    gleich((await ruf('GET', '/api/criteria')).inhalt.map(c => `${c.name}:${c.gewicht}`), gewVorRund),
    JSON.stringify((await ruf('GET', '/api/criteria')).inhalt.map(c => `${c.name}:${c.gewicht}`)));
  // Und die Datei traegt sie ueberhaupt -- sonst belegte der Rundlauf oben nur,
  // dass der Import nichts anfasst.
  pruefe('Und die Exportdatei traegt sie',
    gewAus?.criteriaGewichte?.[gewRund[0].name] === 0.6, JSON.stringify(gewAus?.criteriaGewichte));

  /* ---------------------------------------------------------------- */
  gruppe('Schriftgroessen im Stylesheet');

  const css = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  const festeGroessen = (css.match(/font-size: *[0-9.]+px/g) || []);
  pruefe('Nur noch eine feste Schriftgroesse: das Grundmass',
    festeGroessen.length === 1 && /html *\{ *font-size: *15px/.test(css),
    JSON.stringify(festeGroessen));
  pruefe('Alle uebrigen Groessen sind relativ',
    (css.match(/font-size: *\.?[0-9.]+rem/g) || []).length >= 80);
  pruefe('Grundmass haengt nicht an sich selbst',
    !/html *\{[^}]*font-size: *[0-9.]+rem/.test(css));
  const appQuelle = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  pruefe('Keine Schriftgroesse mehr im Quelltext der Oberflaeche',
    !/font-size: *[0-9]/.test(appQuelle));
  pruefe('Textfuehrende Mindestbreiten sind relativ',
    /\.frow > \.eyebrow *\{ *min-width: *[0-9.]+em/.test(css) &&
    /\.lnum[^}]*min-width: *[0-9.]+em/.test(css));

  /* ---------------------------------------------------------------- */
  gruppe('Einstellungen: Vokabular und Schriftgroesse');

  const vorgabe = (await ruf('GET', '/api/settings')).inhalt;
  pruefe('Vorgabevokabular wird geliefert',
    vorgabe.vokabular.sacheEinzahl === 'Eintrag' && vorgabe.vokabular.zeitpunktMehrzahl === 'Testtage',
    JSON.stringify(vorgabe.vokabular));
  pruefe('Vorgabe der Schriftgroesse ist 100', vorgabe.schrift === 100);
  /* Die Liste bleibt bei elf Woertern. Nichts bekommt ein neues Vokabelwort,
     nur weil es auf dem Bildschirm steht -- "Kommentar" etwa ist eine feste
     Beschriftung und verschiebt sich nicht mit dem Gegenstand. */
  pruefe('Das Vokabular hat elf Woerter, nicht mehr',
    Object.keys(vorgabe.vokabular).length === 11,
    `${Object.keys(vorgabe.vokabular).length}: ${Object.keys(vorgabe.vokabular).join(', ')}`);

  const gesetzt = await ruf('PUT', '/api/settings', { vokabular: {
    sacheEinzahl: '  Maschine  ', sacheMehrzahl: 'Maschinen',
    merkmalJa: 'Geprüft', merkmalNein: 'Ungeprüft',
    zeitpunktEinzahl: 'Sitzung', zeitpunktMehrzahl: 'Sitzungen'
  }});
  pruefe('Vokabular wird gespeichert', gesetzt.inhalt.vokabular.sacheMehrzahl === 'Maschinen');
  pruefe('Leerzeichen werden abgeschnitten', gesetzt.inhalt.vokabular.sacheEinzahl === 'Maschine');
  pruefe('Vokabular ueberlebt den naechsten Abruf',
    (await ruf('GET', '/api/settings')).inhalt.vokabular.zeitpunktEinzahl === 'Sitzung');

  const halb = await ruf('PUT', '/api/settings', { vokabular: { sacheEinzahl: '   ' } });
  pruefe('Leeres Feld faellt auf die Vorgabe zurueck', halb.inhalt.vokabular.sacheEinzahl === 'Eintrag');
  pruefe('Nicht gesendete Felder fallen ebenfalls zurueck',
    halb.inhalt.vokabular.sacheMehrzahl === 'Einträge');
  const lang = await ruf('PUT', '/api/settings', { vokabular: { sacheEinzahl: 'x'.repeat(120) } });
  pruefe('Ueberlanges Wort wird gekuerzt', lang.inhalt.vokabular.sacheEinzahl.length === 40);

  // Geprueft wird am SERVER, nicht gegen die clientseitige Vorgabe: ein
  // Wort, das der Server nicht kennt, taucht in der Karte trotzdem auf,
  // laesst sich aber nicht speichern -- und nur diese Pruefung saehe es.
  pruefe('Der Server kennt alle elf Vokabeln',
    ['sacheEinzahl', 'sacheMehrzahl', 'merkmalJa', 'merkmalNein',
     'zeitpunktEinzahl', 'zeitpunktMehrzahl', 'berichtEinzahl', 'berichtMehrzahl',
     'aufgabeEinzahl', 'aufgabeMehrzahl', 'aufgabeErledigt'].every(k => k in vorgabe.vokabular) &&
    Object.keys(vorgabe.vokabular).length === 11,
    JSON.stringify(Object.keys(vorgabe.vokabular)));
  pruefe('Auch das Wort fuer erledigt liegt am Server',
    vorgabe.vokabular.aufgabeErledigt === 'Erledigt' &&
    (await ruf('PUT', '/api/settings', { vokabular: { aufgabeErledigt: ' Fertig ' } }))
      .inhalt.vokabular.aufgabeErledigt === 'Fertig');
  pruefe('Die Aufgabe hat ihre Vorgabe',
    vorgabe.vokabular.aufgabeEinzahl === 'Aufgabe' &&
    vorgabe.vokabular.aufgabeMehrzahl === 'Aufgaben',
    JSON.stringify([vorgabe.vokabular.aufgabeEinzahl, vorgabe.vokabular.aufgabeMehrzahl]));
  const aufV = await ruf('PUT', '/api/settings', {
    vokabular: { aufgabeEinzahl: '  Todo  ', aufgabeMehrzahl: 'Todos' } });
  pruefe('Ein eigenes Wort fuer die Aufgabe wird gespeichert',
    aufV.inhalt.vokabular.aufgabeEinzahl === 'Todo' &&
    aufV.inhalt.vokabular.aufgabeMehrzahl === 'Todos',
    JSON.stringify([aufV.inhalt.vokabular.aufgabeEinzahl, aufV.inhalt.vokabular.aufgabeMehrzahl]));
  pruefe('Und ueberlebt den naechsten Abruf',
    (await ruf('GET', '/api/settings')).inhalt.vokabular.aufgabeEinzahl === 'Todo');
  const aufLeer = await ruf('PUT', '/api/settings', { vokabular: { aufgabeEinzahl: '  ' } });
  pruefe('Leer faellt auch bei der Aufgabe auf die Vorgabe zurueck',
    aufLeer.inhalt.vokabular.aufgabeEinzahl === 'Aufgabe',
    aufLeer.inhalt.vokabular.aufgabeEinzahl);

  pruefe('Unbekannte Schriftstufe wird abgewiesen',
    (await ruf('PUT', '/api/settings', { schrift: 400 })).status === 400);
  pruefe('Text als Schriftstufe wird abgewiesen',
    (await ruf('PUT', '/api/settings', { schrift: 'gross' })).status === 400);
  const stufe = await ruf('PUT', '/api/settings', { schrift: 120 });
  pruefe('Gueltige Schriftstufe wird gespeichert', stufe.inhalt.schrift === 120);
  pruefe('Filterwahl bleibt daneben bestehen',
    (await ruf('PUT', '/api/settings', { filters: { sort: 'title_asc' } })).inhalt.schrift === 120);

  /* ---------------------------------------------------------------- */
  gruppe('Vokabular in den Servermeldungen');

  await ruf('PUT', '/api/settings', { vokabular: {
    sacheEinzahl: 'Maschine', sacheMehrzahl: 'Maschinen',
    merkmalJa: 'Geprüft', merkmalNein: 'Ungeprüft',
    zeitpunktEinzahl: 'Sitzung', zeitpunktMehrzahl: 'Sitzungen'
  }});
  const objekt = (await ruf('POST', '/api/items', { title: 'Sperrprobe' })).inhalt;
  await ruf('POST', `/api/items/${objekt.id}/test-days`, { day: '2026-08-01', rating: 4 });
  const gesperrt = await ruf('PUT', `/api/items/${objekt.id}`, { tested: false });
  pruefe('Sperrmeldung benutzt das eigene Vokabular',
    gesperrt.status === 409 && /1 Sitzung /.test(gesperrt.inhalt.error) &&
    /„Geprüft"/.test(gesperrt.inhalt.error), gesperrt.inhalt.error);
  pruefe('Sperrmeldung bleibt bei der Einzahl grammatisch richtig',
    / ist,/.test(gesperrt.inhalt.error), gesperrt.inhalt.error);
  await ruf('POST', `/api/items/${objekt.id}/test-days`, { day: '2026-08-02', rating: 4 });
  const gesperrt2 = await ruf('PUT', `/api/items/${objekt.id}`, { tested: false });
  pruefe('Mehrzahl ebenso', /2 Sitzungen /.test(gesperrt2.inhalt.error) && / sind,/.test(gesperrt2.inhalt.error),
    gesperrt2.inhalt.error);

  const zukunft = await ruf('POST', `/api/items/${objekt.id}/test-days`, { day: '2099-01-01', rating: 3 });
  pruefe('Datumsmeldung kommt ohne Vokabelwort aus',
    zukunft.status === 400 && !/Testtag|Sitzung/.test(zukunft.inhalt.error), zukunft.inhalt.error);

  const ausVok = await ruf('GET', '/api/export?photos=0');
  pruefe('Vokabular faerbt nicht auf den Export ab',
    !JSON.stringify(ausVok.inhalt).includes('Maschine') && 'testDays' in ausVok.inhalt.items[0]);
  await ruf('DELETE', `/api/items/${objekt.id}`);

  /* ---------------------------------------------------------------- */
  gruppe('Tags an Testtagen');

  const tt = (await ruf('POST', '/api/items', { title: 'Tagprobe' })).inhalt;
  await ruf('POST', `/api/items/${tt.id}/test-days`, { day: '2026-07-01', rating: 3 });
  let ttDetail = (await ruf('GET', `/api/items/${tt.id}`)).inhalt;
  const tag1 = ttDetail.testDays[0];
  pruefe('Testtag kommt zunächst ohne Tags', Array.isArray(tag1.tags) && tag1.tags.length === 0);

  const gesetztT = await ruf('POST', `/api/test-days/${tag1.id}/tags`, { name: 'Regen' });
  pruefe('Tag am Testtag wird gesetzt',
    gesetztT.status === 201 && gesetztT.inhalt.testDays[0].tags[0].name === 'Regen');

  const tagliste = (await ruf('GET', '/api/tags')).inhalt;
  const regen = tagliste.find(t => t.name === 'Regen');
  pruefe('Neuer Tag landet im gemeinsamen Vorrat', !!regen);
  pruefe('Verwendungen werden getrennt gezählt',
    regen.usage_count === 0 && regen.test_usage_count === 1,
    `Eintrag=${regen.usage_count}, Testtag=${regen.test_usage_count}`);

  await ruf('POST', `/api/items/${tt.id}/tags`, { name: 'Regen' });
  const regen2 = (await ruf('GET', '/api/tags')).inhalt.find(t => t.name === 'Regen');
  pruefe('Derselbe Tag am Eintrag zählt eigenständig',
    regen2.usage_count === 1 && regen2.test_usage_count === 1,
    `Eintrag=${regen2.usage_count}, Testtag=${regen2.test_usage_count}`);

  // Mit je einer Verwendung faellt eine Vervielfachung nicht auf. Deshalb
  // hier zwei Eintraege und drei Testtage: wer beide Zahlen ueber zwei JOINs
  // holt, bekommt 2x3 = 6 statt 2 und 3.
  const zweit = (await ruf('POST', '/api/items', { title: 'Zweite Tagprobe' })).inhalt;
  await ruf('POST', `/api/items/${zweit.id}/tags`, { name: 'Vielfach' });
  await ruf('POST', `/api/items/${tt.id}/tags`, { name: 'Vielfach' });
  for (const d of ['2026-05-01', '2026-05-02', '2026-05-03']) {
    const neuerTag = (await ruf('POST', `/api/items/${tt.id}/test-days`, { day: d, rating: 3 })).inhalt;
    const tagId = neuerTag.testDays.find(x => x.day === d).id;
    await ruf('POST', `/api/test-days/${tagId}/tags`, { name: 'Vielfach' });
  }
  const vielfach = (await ruf('GET', '/api/tags')).inhalt.find(t => t.name === 'Vielfach');
  pruefe('Beide Zahlen bleiben bei mehreren Verwendungen richtig',
    vielfach.usage_count === 2 && vielfach.test_usage_count === 3,
    `Eintrag=${vielfach.usage_count} (erwartet 2), Testtag=${vielfach.test_usage_count} (erwartet 3)`);
  await ruf('DELETE', `/api/items/${zweit.id}`);

  const suchbar = (await ruf('GET', '/api/items')).inhalt.find(i => i.id === tt.id);
  pruefe('Übersicht liefert die Testtage selbst, nicht nur die Anzahl',
    Array.isArray(suchbar.testDays) && suchbar.testDays[0].day === '2026-07-01');
  await ruf('POST', `/api/test-days/${tag1.id}/tags`, { name: 'Nurhier' });
  const suchbar2 = (await ruf('GET', '/api/items')).inhalt.find(i => i.id === tt.id);
  pruefe('Suche findet Tags, die nur am Testtag hängen',
    suchbar2.searchText.includes('nurhier'));
  const nurhier = (await ruf('GET', '/api/tags')).inhalt.find(t => t.name === 'Nurhier');
  pruefe('Solcher Tag hat null Einträge und fällt damit aus der Filterwolke',
    nurhier.usage_count === 0 && nurhier.test_usage_count === 1);

  const weg = await ruf('DELETE', `/api/test-days/${tag1.id}/tags/${nurhier.id}`);
  pruefe('Tag lässt sich vom Testtag lösen',
    weg.status === 200 && !weg.inhalt.testDays[0].tags.some(t => t.name === 'Nurhier'));

  const ausT = await ruf('GET', '/api/export?photos=0');
  const ausTag = ausT.inhalt.items.find(i => i.title === 'Tagprobe');
  // Am Datum festmachen, nicht am Listenplatz: die Reihenfolge im Export
  // haengt an den Daten, nicht an der Reihenfolge des Eintragens.
  const ausTagJuli = ausTag.testDays.find(d => d.day === '2026-07-01');
  pruefe('Export nimmt die Tags am Testtag mit',
    gleich(ausTagJuli.tags, ['Regen']), JSON.stringify(ausTagJuli));

  // Testtag loeschen: die Verknuepfung muss mitgehen, sonst zaehlt der Tag
  // weiter Verwendungen, die es nicht mehr gibt.
  await ruf('DELETE', `/api/test-days/${tag1.id}`);
  const nachLoeschen = (await ruf('GET', '/api/tags')).inhalt.find(t => t.name === 'Regen');
  pruefe('Gelöschter Testtag nimmt seine Tagverknüpfung mit',
    nachLoeschen.test_usage_count === 0 && nachLoeschen.usage_count === 1,
    `Eintrag=${nachLoeschen.usage_count}, Testtag=${nachLoeschen.test_usage_count}`);
  await ruf('DELETE', `/api/items/${tt.id}`);

  const importDatei = { version: 5, title: 'T', items: [{ title: 'Mit Tagtag',
    testDays: [{ day: '2026-06-01', rating: 5, tags: ['Sonne', 'Wind'] },
               { day: '2026-06-02', rating: 4 }] }] };
  const impT = await sendeImport(importDatei, 'merge');
  pruefe('Import spielt Tags am Testtag ein', impT.status === 200);
  const eingespieltT = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Mit Tagtag');
  const detT = (await ruf('GET', `/api/items/${eingespieltT.id}`)).inhalt;
  const mitTags = detT.testDays.find(d => d.day === '2026-06-01');
  const ohneTags = detT.testDays.find(d => d.day === '2026-06-02');
  pruefe('Eingespielte Tags hängen am richtigen Testtag',
    gleich(mitTags.tags.map(t => t.name), ['Sonne', 'Wind']), JSON.stringify(mitTags.tags));
  pruefe('Testtag ohne Tagfeld bleibt leer', ohneTags.tags.length === 0);
  await ruf('DELETE', `/api/items/${eingespieltT.id}`);

  /* ---------------------------------------------------------------- */
  gruppe('Versionsnummer, Linkzeilen, Zeitleiste');

  const cfg = await (await fetch(`${BASIS}/api/config`)).json();
  pruefe('Die Versionsnummer steht schon vor der Anmeldung',
    /^0\.\d+\.\d+$/.test(cfg.version || ''), JSON.stringify(cfg.version));
  pruefe('Sie beginnt mit einer Null — noch nicht festgelegt',
    String(cfg.version).startsWith('0.'));
  pruefe('Sie stimmt mit der package.json überein',
    cfg.version === require('./package.json').version);
  // Die Liste ist bewusst abgeschlossen: was hier auftaucht, sieht jeder, der
  // die Adresse kennt. setupRequired sagt nur, DASS noch eingerichtet werden
  // muss, minPassword nur, wie lang das Passwort sein soll -- beides nichts
  // ueber den Bestand. Der interne Titel darf hier unter keinen Umstaenden
  // stehen.
  pruefe('Vor der Anmeldung wird sonst nichts verraten',
    gleich(Object.keys(cfg).sort(), ['minPassword', 'setupRequired', 'title', 'version']),
    JSON.stringify(Object.keys(cfg)));
  pruefe('Der interne Titel bleibt draussen',
    !JSON.stringify(cfg).includes('Intern') && !('appTitle' in cfg));
  pruefe('Die Kennzahlen nennen sie ebenfalls',
    (await ruf('GET', '/api/stats')).inhalt.version === cfg.version);
  /* Seit 0.8.10 gibt es den Fingerprint. Er steht ausdruecklich NICHT vor der
     Anmeldung, sondern bei den Kennzahlen. Diese beiden Zeilen halten die
     Entscheidung fest, statt sie nur im Kommentar zu haben -- die Pruefung
     darueber ist damit umgedreht und nicht geloescht (Stolperstein 74). */
  pruefe('Der Fingerprint bleibt vor der Anmeldung draußen', !('fingerprint' in cfg),
    JSON.stringify(Object.keys(cfg)));
  const statsFingerprint = (await ruf('GET', '/api/stats')).inhalt.fingerprint;
  pruefe('Die Kennzahlen nennen ihn dafür', /^[0-9a-f]{8}$/.test(statsFingerprint || ''),
    JSON.stringify(statsFingerprint));

  const e0 = (await ruf('GET', '/api/settings')).inhalt;
  pruefe('Vorgabe: fünf sichtbare Linkzeilen', e0.linkZeilen === 5, `${e0.linkZeilen}`);
  pruefe('Vorgabe: Zeitleiste an', e0.zeitleiste === true);
  pruefe('Zeilenzahl lässt sich setzen',
    (await ruf('PUT', '/api/settings', { linkZeilen: 12 })).inhalt.linkZeilen === 12);
  pruefe('Unbekannte Zeilenzahl wird abgewiesen',
    (await ruf('PUT', '/api/settings', { linkZeilen: 7 })).status === 400);
  pruefe('Zeitleiste lässt sich abschalten',
    (await ruf('PUT', '/api/settings', { zeitleiste: false })).inhalt.zeitleiste === false);
  const e1 = (await ruf('GET', '/api/settings')).inhalt;
  pruefe('Beides bleibt gespeichert', e1.linkZeilen === 12 && e1.zeitleiste === false,
    JSON.stringify([e1.linkZeilen, e1.zeitleiste]));
  await ruf('PUT', '/api/settings', { linkZeilen: 5, zeitleiste: true });

  /* ---------------------------------------------------------------- */
  gruppe('Adresse oder Suchbegriff');

  const lk = (await ruf('POST', '/api/items', { title: 'Linkprobe' })).inhalt;
  const legeAn = async (text) =>
    (await ruf('POST', `/api/items/${lk.id}/links`, { url: text })).inhalt.links.slice(-1)[0].url;

  // Adressen: mit Schema unveraendert, ohne Schema mit https davor.
  pruefe('Adresse mit Schema bleibt, wie sie ist',
    await legeAn('https://beispiel.de/handbuch') === 'https://beispiel.de/handbuch');
  pruefe('http bleibt http', await legeAn('http://beispiel.de') === 'http://beispiel.de');
  pruefe('Adresse ohne Schema bekommt https davor',
    await legeAn('beispiel.de') === 'https://beispiel.de');
  pruefe('Auch mehrstufig und mit Pfad',
    await legeAn('www.beispiel.co.uk/a/b?x=1') === 'https://www.beispiel.co.uk/a/b?x=1');
  pruefe('IP-Nummer im Heimnetz gilt als Adresse',
    await legeAn('192.168.1.5:3100/katalog') === 'https://192.168.1.5:3100/katalog');
  pruefe('Rechnername mit Portnummer ebenso',
    await legeAn('nas:8080') === 'https://nas:8080');

  // Suchtexte: roh gespeichert, ohne jedes Schema.
  pruefe('Ein Wort bleibt roh stehen', await legeAn('Handbuch') === 'Handbuch');
  pruefe('Mehrere Wörter bleiben roh', await legeAn('Handbuch 3000') === 'Handbuch 3000');
  pruefe('Eine Nummer mit Punkt ist keine Adresse',
    await legeAn('Modell 3.5') === 'Modell 3.5');
  pruefe('Auch eine reine Zahlenfolge nicht', await legeAn('3.5') === '3.5');
  pruefe('Ein Doppelpunkt ohne Portnummer auch nicht',
    await legeAn('Frage: warum so laut') === 'Frage: warum so laut');
  // Genau daran erkennt die Oberflaeche den Unterschied -- ohne neue Spalte.
  const lkDetail = (await ruf('GET', `/api/items/${lk.id}`)).inhalt;
  pruefe('Jede Zeile trägt entweder ein Schema oder keins',
    lkDetail.links.every(l => /^https?:\/\//i.test(l.url) || !/^\w+:\/\//.test(l.url)),
    JSON.stringify(lkDetail.links.map(l => l.url)));
  pruefe('Leere Eingabe wird weiterhin abgewiesen',
    (await ruf('POST', `/api/items/${lk.id}/links`, { url: '   ' })).status === 400);
  pruefe('Suchtexte werden mit durchsucht',
    (await ruf('GET', '/api/items')).inhalt
      .find(i => i.id === lk.id).searchText.includes('handbuch 3000'));

  // Export und Import fuehren durch dieselbe Regel. Eine alte Exportdatei
  // traegt ueberall ein Schema und darf sich deshalb nicht veraendern.
  const lkAus = (await ruf('GET', '/api/export?photos=0')).inhalt
    .items.find(i => i.title === 'Linkprobe');
  /* UMGESTELLT MIT 0.8.30, nicht geloescht: ein Link ist im Export seit
     Formatnummer 7 ein Objekt aus Adresse und Verfasser. Was in der ADRESSE
     steht, ist davon unberuehrt -- und genau das prueft diese Zeile weiter.
     Erst das Vorhandensein, dann die Eigenschaft: bei leerer Liste waere jede
     Aussage ueber die Form wahr (Stolperstein 81). */
  const lkAusUrls = (lkAus.links || []).map(l => l.url);
  pruefe('Der Export nennt Suchtexte im Rohzustand',
    lkAusUrls.includes('Handbuch 3000') && lkAusUrls.includes('https://beispiel.de'),
    JSON.stringify(lkAus.links));
  pruefe('Und jede Linkzeile im Export traegt das Feld author',
    (lkAus.links || []).length > 0 && lkAus.links.every(l => l && typeof l === 'object' && 'author' in l),
    JSON.stringify(lkAus.links));
  await ruf('DELETE', `/api/items/${lk.id}`);

  const lkImp = await sendeImport({ version: 5, title: 'L', items: [{ title: 'Eingespielte Links',
    links: ['https://alt.example/pfad', 'beispiel.de', 'Ein Suchtext', '', '  '] }] }, 'merge');
  pruefe('Import mit gemischten Zeilen gelingt', lkImp.status === 200);
  const lkNeu = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Eingespielte Links');
  const lkNeuD = (await ruf('GET', `/api/items/${lkNeu.id}`)).inhalt;
  /* Der Fragezeichenpunkt ist keine Zierde: faellt eine Zeile beim Einspielen
     weg, ist links[0] undefined -- und ein Zugriff darauf REISST DEN LAUF AB,
     statt einen roten Punkt zu setzen. Eine Gegenprobe, die den Lauf
     abbricht, nennt keinen einzigen Namen (Stolperstein 76). */
  pruefe('Eingespielte Adresse bleibt unverändert',
    lkNeuD.links[0]?.url === 'https://alt.example/pfad', JSON.stringify(lkNeuD.links.map(l => l.url)));
  pruefe('Eingespielte Adresse ohne Schema bekommt eins',
    lkNeuD.links[1]?.url === 'https://beispiel.de', JSON.stringify(lkNeuD.links.map(l => l.url)));
  pruefe('Eingespielter Suchtext bleibt roh', lkNeuD.links[2]?.url === 'Ein Suchtext',
    JSON.stringify(lkNeuD.links.map(l => l.url)));
  pruefe('Leerzeilen fallen weg', lkNeuD.links.length === 3, `${lkNeuD.links.length}`);
  // Lueckenlos, und nicht der eintragsuebergreifende Zaehler.
  pruefe('Die Sortiernummern bleiben lückenlos bei null beginnend',
    gleich(lkNeuD.links.map(l => l.sort_order), [0, 1, 2]),
    JSON.stringify(lkNeuD.links.map(l => l.sort_order)));
  await ruf('DELETE', `/api/items/${lkNeu.id}`);

  /* ---------------------------------------------------------------- */
  gruppe('Suchanbieter');

  const s0 = (await ruf('GET', '/api/settings')).inhalt;
  const anb0 = s0.suchAnbieter || [];
  const schluessel = (liste) => (liste || []).map(a => a.schluessel);
  const imVorrat = (liste) => (liste || []).filter(a => a.aktiv).map(a => a.schluessel);
  const standardVon = (liste) => (liste || []).find(a => a.standard)?.schluessel;

  // Die Liste liegt im Server, nicht in app.js. Neun Plaetze:
  // sechs eingebaute, drei eigene.
  pruefe('Der Server liefert neun Anbieterplätze', anb0.length === 9, `${anb0.length}`);
  pruefe('Die sechs eingebauten stehen vorn und sind vorhanden',
    gleich(schluessel(anb0).slice(0, 6), ['google', 'bing', 'ddg', 'startpage', 'brave', 'ecosia']) &&
    anb0.slice(0, 6).every(a => a.vorhanden && !a.eigen),
    JSON.stringify(schluessel(anb0)));
  pruefe('Die drei eigenen Plätze sind zunächst leer',
    anb0.slice(6).every(a => a.eigen && !a.vorhanden && !a.name && !a.vorlage));
  pruefe('Vorgabe ist Google, aktiv und Standard',
    standardVon(anb0) === 'google' && gleich(imVorrat(anb0), ['google']),
    JSON.stringify(imVorrat(anb0)));
  pruefe('Die Vorlage des Standards trägt den Platzhalter', String(s0.suche).includes('%s'));
  pruefe('Vorgabe für die Zahl der Namen ist zwei', s0.suchNamen === 2, `${s0.suchNamen}`);

  // Vorrat: mehrere gleichzeitig, Standard zuerst.
  const sv1 = (await ruf('PUT', '/api/settings', { sucheAktiv: ['ddg', 'bing'] })).inhalt;
  pruefe('Mehrere Anbieter lassen sich in den Vorrat nehmen',
    gleich(imVorrat(sv1.suchAnbieter).sort(), ['bing', 'ddg']), JSON.stringify(imVorrat(sv1.suchAnbieter)));
  pruefe('Der erste der Liste ist der Standard', standardVon(sv1.suchAnbieter) === 'ddg',
    standardVon(sv1.suchAnbieter));
  pruefe('Die Vorlage des Standards wird mitgeführt',
    sv1.suche === 'https://duckduckgo.com/?q=%s', sv1.suche);
  // Wird der Standard aus dem Vorrat genommen, rueckt der erste aktive nach --
  // sonst liefe der Zeilenklick ins Leere.
  const sv2 = (await ruf('PUT', '/api/settings', { sucheAktiv: ['bing'] })).inhalt;
  pruefe('Fällt der Standard weg, rückt der erste aktive nach',
    standardVon(sv2.suchAnbieter) === 'bing' && gleich(imVorrat(sv2.suchAnbieter), ['bing']),
    `${standardVon(sv2.suchAnbieter)} / ${JSON.stringify(imVorrat(sv2.suchAnbieter))}`);
  // Ein leerer Vorrat macht jede Suchzeile unbenutzbar. Abgesagt wird das
  // ausdruecklich -- ein stiller Wechsel auf den eingebauten ersten hiesse,
  // ab jetzt wortlos woanders zu suchen.
  const sv3 = await ruf('PUT', '/api/settings', { sucheAktiv: [] });
  pruefe('Ein leerer Vorrat wird abgewiesen', sv3.status === 400, `${sv3.status}`);
  pruefe('Und der bisherige Vorrat steht danach unverändert',
    gleich(imVorrat((await ruf('GET', '/api/settings')).inhalt.suchAnbieter), ['bing']));
  pruefe('Unbekannte Schlüssel fallen heraus',
    !imVorrat((await ruf('PUT', '/api/settings', { sucheAktiv: ['bing', 'gibtsnicht'] })).inhalt.suchAnbieter)
      .includes('gibtsnicht'));

  // Eigene Anbieter: Name UND Vorlage, sonst gibt es den Platz nicht.
  const se1 = (await ruf('PUT', '/api/settings', { sucheEigene: [
    { name: 'Modellforum', vorlage: 'https://forum.beispiel.de/suche?q=%s' }] })).inhalt;
  const eigen1 = (se1.suchAnbieter || []).find(a => a.schluessel === 'eigen1');
  pruefe('Ein eigener Anbieter wird angelegt',
    eigen1?.vorhanden === true && eigen1?.name === 'Modellforum', JSON.stringify(eigen1));
  pruefe('Die beiden anderen Plätze bleiben leer',
    (se1.suchAnbieter || []).filter(a => a.eigen && a.vorhanden).length === 1);
  pruefe('Ein eigener Anbieter darf in den Vorrat',
    imVorrat((await ruf('PUT', '/api/settings', { sucheAktiv: ['bing', 'eigen1'] })).inhalt.suchAnbieter)
      .includes('eigen1'));
  const se2 = (await ruf('PUT', '/api/settings', { sucheAktiv: ['eigen1', 'bing'] })).inhalt;
  pruefe('Ein eigener Anbieter darf Standard sein',
    standardVon(se2.suchAnbieter) === 'eigen1', standardVon(se2.suchAnbieter));
  pruefe('Dann trägt auch die Antwort dessen Vorlage',
    se2.suche === 'https://forum.beispiel.de/suche?q=%s', se2.suche);
  // Vier Namen a 20 Zeichen sind auf dem Handy die Obergrenze.
  const seLang = (await ruf('PUT', '/api/settings', { sucheEigene: [
    { name: 'Ein sehr langer Anbietername', vorlage: 'https://forum.beispiel.de/suche?q=%s' }] })).inhalt;
  pruefe('Der Name wird auf 20 Zeichen begrenzt',
    (seLang.suchAnbieter || []).find(a => a.schluessel === 'eigen1')?.name === 'Ein sehr langer Anbi',
    (seLang.suchAnbieter || []).find(a => a.schluessel === 'eigen1')?.name);
  pruefe('Ein Platz ohne Namen wird abgewiesen',
    (await ruf('PUT', '/api/settings', { sucheEigene: [{ name: '', vorlage: 'https://a.de/?q=%s' }] }))
      .status === 400);
  pruefe('Ein Platz ohne Vorlage wird abgewiesen',
    (await ruf('PUT', '/api/settings', { sucheEigene: [{ name: 'Nur Name', vorlage: '' }] })).status === 400);

  // Die Vorlage ist Eingabe und landet in einem window.open. Ohne diese
  // Schranke waere javascript: moeglich -- dieselbe Denkweise wie in 5a.
  const svBoese = await ruf('PUT', '/api/settings', {
    sucheEigene: [{ name: 'Böse', vorlage: 'javascript:alert(1)/*%s*/' }] });
  pruefe('javascript: wird abgewiesen', svBoese.status === 400, JSON.stringify(svBoese.inhalt));
  pruefe('Die Begründung nennt beide Bedingungen',
    /https?:\/\//.test(svBoese.inhalt?.error || '') && (svBoese.inhalt?.error || '').includes('%s'),
    svBoese.inhalt?.error);
  pruefe('data: wird ebenfalls abgewiesen',
    (await ruf('PUT', '/api/settings', {
      sucheEigene: [{ name: 'Böse', vorlage: 'data:text/html,%s' }] })).status === 400);
  pruefe('Eine Vorlage ohne Platzhalter wird abgewiesen',
    (await ruf('PUT', '/api/settings', {
      sucheEigene: [{ name: 'Ohne', vorlage: 'https://beispiel.de/suche' }] })).status === 400);
  pruefe('Eine eigene Vorlage im Heimnetz darf http sein',
    (await ruf('PUT', '/api/settings', {
      sucheEigene: [{ name: 'Heimsuche', vorlage: 'http://192.168.1.9:8888/search?q=%s' }] }))
      .inhalt.suchAnbieter.find(a => a.schluessel === 'eigen1')?.vorlage === 'http://192.168.1.9:8888/search?q=%s');
  pruefe('Nach den Fehlversuchen steht der zuletzt gültige Anbieter noch',
    (await ruf('GET', '/api/settings')).inhalt.suchAnbieter
      .find(a => a.schluessel === 'eigen1')?.name === 'Heimsuche');

  // Ein geraeumter Platz verschwindet -- und nimmt den Standard mit, der dann
  // nachrueckt (dieselbe Regel wie beim Deaktivieren).
  const seWeg = (await ruf('PUT', '/api/settings', { sucheEigene: [{ name: '', vorlage: '' }] })).inhalt;
  pruefe('Ein geräumter Platz gilt als nicht vorhanden',
    seWeg.suchAnbieter.find(a => a.schluessel === 'eigen1')?.vorhanden === false);
  pruefe('War er Standard, rückt der erste aktive nach',
    standardVon(seWeg.suchAnbieter) === 'bing' && seWeg.suche === 'https://www.bing.com/search?q=%s',
    `${standardVon(seWeg.suchAnbieter)} / ${seWeg.suche}`);

  // Zahl der Namen: vier feste Stufen, wie schrift und linkZeilen.
  pruefe('Die Zahl der Namen lässt sich setzen',
    (await ruf('PUT', '/api/settings', { suchNamen: 4 })).inhalt.suchNamen === 4);
  pruefe('Eine Zahl ausserhalb der Stufen wird abgewiesen',
    (await ruf('PUT', '/api/settings', { suchNamen: 5 })).status === 400);
  pruefe('Danach steht die zuletzt gültige noch',
    (await ruf('GET', '/api/settings')).inhalt.suchNamen === 4);
  await ruf('PUT', '/api/settings', { suchNamen: 2, sucheAktiv: ['google'] });

  /* ---------------------------------------------------------------- */
  gruppe('Suchanbieter aus der Datenbank');

  // "Name UND Vorlage" steht zweimal: der Schreibweg weist halb Ausgefuelltes
  // mit 400 ab, der Leseweg laesst den Platz gar nicht erst gelten. Ueber die
  // Schnittstelle allein ist der Leseweg nicht erreichbar, weil dorthin nie
  // etwas Halbes gelangt -- deshalb kommt der halbe Platz hier von Hand in die
  // Datenbank.
  async function anlageMitEinstellungen(zeilen, portBasis) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-suchdb-'));
    kurzlauf(`require('./db'); console.log('da');`, dir);
    const d = oeffne(path.join(dir, 'katalog.sqlite'));
    for (const [k, v] of Object.entries(zeilen))
      d.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(k, JSON.stringify(v));
    d.close();
    const S = starteWeiterenServer(dir, {}, portBasis);
    await S.bereit;
    await S.ruf('POST', '/api/setup', { user: NUTZER, password: PASSWORT });
    return { S, dir, hole: async () => (await S.ruf('GET', '/api/settings')).inhalt };
  }

  const wHalb = await anlageMitEinstellungen({
    sucheEigene: [{ name: 'Nur Name', vorlage: '' }, { name: '', vorlage: 'https://a.de/?q=%s' }, null],
    sucheAktiv: ['eigen1', 'eigen2', 'bing']
  }, 4400);
  const wHalbA = (await wHalb.hole()).suchAnbieter || [];
  pruefe('Ein Platz ohne Vorlage gilt auch aus der Datenbank nicht',
    wHalbA.find(a => a.schluessel === 'eigen1')?.vorhanden === false,
    JSON.stringify(wHalbA.find(a => a.schluessel === 'eigen1')));
  pruefe('Ein Platz ohne Namen ebenso wenig',
    wHalbA.find(a => a.schluessel === 'eigen2')?.vorhanden === false,
    JSON.stringify(wHalbA.find(a => a.schluessel === 'eigen2')));
  pruefe('Und beide stehen dann auch nicht im Vorrat',
    gleich(wHalbA.filter(a => a.aktiv).map(a => a.schluessel), ['bing']),
    JSON.stringify(wHalbA.filter(a => a.aktiv).map(a => a.schluessel)));
  await wHalb.S.stopp();
  fs.rmSync(wHalb.dir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Benutzer und Sitzungen');

  // Belegt an der Datenbank und unmittelbar an der Middleware -- ueber die
  // Schnittstelle waere davon nichts zu sehen.
  const stA = oeffne(path.join(DATA, 'katalog.sqlite'));
  const uSpalten = stA.prepare('PRAGMA table_info(users)').all().map(c => c.name);
  const sSpalten = stA.prepare('PRAGMA table_info(sessions)').all().map(c => c.name);
  pruefe('users traegt role, email, status und last_login',
    ['role', 'email', 'status', 'last_login'].every(s => uSpalten.includes(s)), uSpalten.join(', '));
  pruefe('sessions traegt user_id', sSpalten.includes('user_id'), sSpalten.join(', '));

  const stAu = stA.prepare('SELECT id, role, status, email, last_login FROM users ORDER BY id').all();
  pruefe('Der eingerichtete Zugang ist Eigentuemer', stAu[0]?.role === 'eigentuemer', JSON.stringify(stAu[0]));
  pruefe('Und steht auf aktiv', stAu[0]?.status === 'aktiv', stAu[0]?.status);
  pruefe('Eine Adresse hat er nicht', stAu[0]?.email === null, JSON.stringify(stAu[0]?.email));
  pruefe('Die Anmeldung hat last_login gesetzt',
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(stAu[0]?.last_login || ''), stAu[0]?.last_login);

  const stAs = stA.prepare('SELECT token, user_id FROM sessions').all();
  pruefe('Die laufende Sitzung gehoert dem Benutzer',
    stAs.length > 0 && stAs.every(s => s.user_id === stAu[0]?.id), JSON.stringify(stAs.map(s => s.user_id)));
  pruefe('Keine Sitzung ohne Benutzer',
    stA.prepare('SELECT COUNT(*) n FROM sessions WHERE user_id IS NULL').get().n === 0);
  stA.close();

  /* req.benutzer wird unmittelbar an der Middleware geprueft, in einem
     eigenen Prozess mit eigenem Verzeichnis. Ohne das waere die Wurzel des
     ganzen Mehrbenutzerbaus ohne eigenen Beleg -- dieselbe Ueberlegung wie
     bei Erkennung und Knotenbau der Kommentarlinks. */
  const mwDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-mw-'));
  const mw = JSON.parse(kurzlauf(`
    const { db } = require('./db');
    const auth = require('./auth');
    const r = db.prepare("INSERT INTO users (username, password_hash, role) VALUES ('probe','x','admin')").run();
    const token = auth.legeSitzungAn(r.lastInsertRowid);
    function durchlauf(cookie) {
      const req = { headers: { cookie: cookie } };
      let stand = 0, weiter = false;
      const res = { status(c) { stand = c; return this; }, json() { return this; } };
      auth.requireAuth(req, res, () => { weiter = true; });
      return { weiter, stand, benutzer: req.benutzer || null };
    }
    // Eine Sitzung, die niemandem gehoert: ueber die Anwendung nicht
    // erreichbar, deshalb von Hand gesetzt.
    db.prepare("INSERT INTO sessions (token) VALUES ('herrenlos')").run();
    let ohneId = null;
    try { auth.legeSitzungAn(null); } catch (e) { ohneId = e.message; }
    console.log(JSON.stringify({
      gut: durchlauf('kriterion_session=' + token),
      herrenlos: durchlauf('kriterion_session=herrenlos'),
      ohneCookie: durchlauf(''),
      ohneId
    }));`, mwDir));
  pruefe('requireAuth laesst eine gueltige Sitzung durch', mw.gut.weiter === true, JSON.stringify(mw.gut));
  pruefe('req.benutzer traegt Id, Name, Rolle und Status',
    gleich(Object.keys(mw.gut.benutzer || {}).sort(), ['id', 'role', 'status', 'username']),
    JSON.stringify(mw.gut.benutzer));
  pruefe('req.benutzer nennt den richtigen Benutzer',
    mw.gut.benutzer?.username === 'probe' && mw.gut.benutzer?.role === 'admin',
    JSON.stringify(mw.gut.benutzer));
  pruefe('Eine Sitzung ohne Benutzer gilt nicht',
    mw.herrenlos.weiter === false && mw.herrenlos.stand === 401, JSON.stringify(mw.herrenlos));
  pruefe('Und setzt auch kein req.benutzer', mw.herrenlos.benutzer === null,
    JSON.stringify(mw.herrenlos.benutzer));
  pruefe('Ohne Cookie bleibt es bei 401', mw.ohneCookie.stand === 401, JSON.stringify(mw.ohneCookie));
  pruefe('Eine Sitzung ohne Benutzer laesst sich gar nicht erst anlegen',
    /Benutzer/.test(mw.ohneId || ''), String(mw.ohneId));
  fs.rmSync(mwDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Bestand am Benutzer');

  /* Belegt an der Datenbank: jede Zeile bekommt ihren Verfasser -- beim
     Anlegen und beim Einspielen. */
  const stB = oeffne(path.join(DATA, 'katalog.sqlite'));
  for (const t of ['items', 'comments', 'test_days']) {
    const sp = stB.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name);
    pruefe(`${t} traegt user_id`, sp.includes('user_id'), sp.join(', '));
  }
  /* ON DELETE SET NULL ist keine Kosmetik: mit CASCADE naehme ein entfernter
     Benutzer den halben Bestand mit, mit NO ACTION scheiterte jedes
     DELETE FROM users an einer Fremdschluesselverletzung. */
  for (const t of ['items', 'comments', 'test_days']) {
    const fk = stB.prepare(`PRAGMA foreign_key_list(${t})`).all().find(f => f.from === 'user_id');
    pruefe(`${t}.user_id gibt den Bestand beim Loeschen frei`,
      fk?.table === 'users' && fk?.on_delete === 'SET NULL', JSON.stringify(fk));
  }

  const stBu = stB.prepare('SELECT MIN(id) AS id FROM users').get().id;
  stB.close();

  /* Zuweisung beim Anlegen -- die drei Wege ueber die Schnittstelle. */
  const bItem = (await ruf('POST', '/api/items', { title: 'Bestand: angelegt' })).inhalt;
  await ruf('POST', `/api/items/${bItem.id}/test-days`, { day: '2024-05-05', rating: 3 });
  await sendeKommentar(bItem.id, { text: 'Kommentar zum Bestand' });
  const nachAnlegen = oeffne(path.join(DATA, 'katalog.sqlite'));
  const holeB = (tabelle, spalte, wert) =>
    nachAnlegen.prepare(`SELECT user_id FROM ${tabelle} WHERE ${spalte} = ?`).all(wert);
  pruefe('Ein neu angelegter Eintrag gehoert dem Anlegenden',
    holeB('items', 'id', bItem.id)[0]?.user_id === stBu,
    JSON.stringify(holeB('items', 'id', bItem.id)));
  pruefe('Ein neuer Testtag gehoert dem Eintragenden',
    holeB('test_days', 'item_id', bItem.id).every(r => r.user_id === stBu),
    JSON.stringify(holeB('test_days', 'item_id', bItem.id)));
  pruefe('Ein neuer Kommentar gehoert dem Schreibenden',
    holeB('comments', 'item_id', bItem.id).every(r => r.user_id === stBu),
    JSON.stringify(holeB('comments', 'item_id', bItem.id)));
  nachAnlegen.close();

  /* Ersetzen des eigenen Testtags am selben Datum: der Tag wird
     ueberschrieben statt verdoppelt, und die Zeile traegt danach weiterhin
     ihren Verfasser. */
  const ersetzt = await ruf('POST', `/api/items/${bItem.id}/test-days`, { day: '2024-05-05', rating: 5 });
  const nachErsetzen = oeffne(path.join(DATA, 'katalog.sqlite'));
  const tdErsetzt = nachErsetzen.prepare(
    'SELECT rating, user_id FROM test_days WHERE item_id = ? AND day = ?').all(bItem.id, '2024-05-05');
  pruefe('Ein ersetzter Testtag bleibt eine Zeile',
    tdErsetzt.length === 1 && ersetzt.inhalt.replaced === true, JSON.stringify(tdErsetzt));
  pruefe('Und traegt danach Note und Verfasser',
    tdErsetzt[0]?.rating === 5 && tdErsetzt[0]?.user_id === stBu, JSON.stringify(tdErsetzt));
  nachErsetzen.close();

  /* Zuweisung beim Einspielen ohne Verfasserangabe: alles faellt an den
     Einspielenden. */
  const bImp = await sendeImport({ version: 5, title: 'B', items: [{
    title: 'Bestand: eingespielt',
    testDays: [{ day: '2024-06-06', rating: 4 }],
    comments: [{ text: 'eingespielter Kommentar' }] }] }, 'merge');
  pruefe('Import gelingt', bImp.status === 200, JSON.stringify(bImp.inhalt));
  const bImpId = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Bestand: eingespielt')?.id;
  const nachImport = oeffne(path.join(DATA, 'katalog.sqlite'));
  const bImpU = (tabelle, spalte, wert) =>
    nachImport.prepare(`SELECT user_id FROM ${tabelle} WHERE ${spalte} = ?`).all(wert);
  const bImpTage = bImpU('test_days', 'item_id', bImpId);
  const bImpKom = bImpU('comments', 'item_id', bImpId);
  pruefe('Ein eingespielter Eintrag faellt an den Einspielenden',
    bImpU('items', 'id', bImpId)[0]?.user_id === stBu, JSON.stringify(bImpU('items', 'id', bImpId)));
  pruefe('Ein eingespielter Testtag faellt an den Einspielenden',
    bImpTage.length === 1 && bImpTage.every(r => r.user_id === stBu), JSON.stringify(bImpTage));
  pruefe('Ein eingespielter Kommentar faellt an den Einspielenden',
    bImpKom.length === 1 && bImpKom.every(r => r.user_id === stBu), JSON.stringify(bImpKom));
  nachImport.close();

  /* ---------------------------------------------------------------- */
  gruppe('Favoriten je Benutzer');

  const p1 = oeffne(path.join(DATA, 'katalog.sqlite'));
  const pSpalten = p1.prepare('PRAGMA table_info(item_pins)').all();
  pruefe('Die Tabelle item_pins gibt es',
    gleich(pSpalten.map(c => c.name), ['user_id', 'item_id', 'created_at']),
    JSON.stringify(pSpalten.map(c => c.name)));
  pruefe('Ihr Primaerschluessel ist Benutzer und Eintrag zusammen',
    gleich(pSpalten.filter(c => c.pk).sort((a, b) => a.pk - b.pk).map(c => c.name),
      ['user_id', 'item_id']),
    JSON.stringify(pSpalten.filter(c => c.pk).map(c => `${c.name}:${c.pk}`)));
  /* Beide Kaskaden, aus verschiedenen Gruenden: mit dem Eintrag geht sein
     Favorit, mit dem Benutzer geht seiner. SET NULL verbietet der
     Primaerschluessel; eine nullbare Spalte mit UNIQUE waere ein loechriges
     UNIQUE, weil NULL darin als verschieden gilt. */
  for (const [spalte, ziel] of [['user_id', 'users'], ['item_id', 'items']]) {
    const fk = p1.prepare('PRAGMA foreign_key_list(item_pins)').all().find(f => f.from === spalte);
    pruefe(`item_pins.${spalte} nimmt den Favoriten beim Loeschen mit`,
      fk?.table === ziel && fk?.on_delete === 'CASCADE', JSON.stringify(fk));
  }
  p1.close();

  /* --- Ueber die Schnittstelle, mit einem Benutzer --- */
  const pItem = (await ruf('POST', '/api/items', { title: 'Favoritenprobe' })).inhalt;
  pruefe('Ein frischer Eintrag ist kein Favorit', pItem.favorite === false,
    JSON.stringify(pItem.favorite));

  /* Vor dem Setzen des Favoriten ein FESTES, altes Aenderungsdatum setzen.
     Der Vergleich mit dem Wert vom Anlegen taugt nicht: datetime('now') hat
     nur Sekundenaufloesung, Anlegen und Favorisieren liegen in derselben
     Sekunde, und die Pruefung koennte dann gar nicht scheitern -- sie bliebe
     auch dann gruen, wenn der Favorit updated_at sehr wohl anfasste. */
  const pAlt2 = oeffne(path.join(DATA, 'katalog.sqlite'));
  pAlt2.prepare("UPDATE items SET updated_at = '2020-01-01 00:00:00' WHERE id = ?").run(pItem.id);
  pAlt2.close();

  const pAn = await ruf('PUT', `/api/items/${pItem.id}`, { favorite: true });
  const p2 = oeffne(path.join(DATA, 'katalog.sqlite'));
  pruefe('Der Favorit wird angenommen und gemeldet',
    pAn.status === 200 && pAn.inhalt.favorite === true,
    `Status ${pAn.status}, favorite ${JSON.stringify(pAn.inhalt?.favorite)}`);
  pruefe('Es entsteht genau eine Zeile in item_pins',
    p2.prepare('SELECT COUNT(*) n FROM item_pins WHERE item_id = ?').get(pItem.id).n === 1);
  /* Die alte Spalte darf nicht mitgeschrieben werden. Taete sie es, schoebe
     eine Ueberfuehrung beim naechsten Start still einen zweiten Favoriten
     nach -- und zwar dem EIGENTUEMER, nicht dem, der geklickt hat. */
  pruefe('Die alte Spalte wird dabei nicht mitgeschrieben',
    p2.prepare('SELECT favorite FROM items WHERE id = ?').get(pItem.id).favorite === 0);
  /* Liefe der Favorit als Spalte durch dasselbe UPDATE wie der Titel, setzte
     er updated_at -- der Eintrag spraenge in JEDER Uebersicht nach oben. Die
     Liste zeigt aber, wo etwas geschieht, nicht wo ICH zuletzt war. */
  pruefe('Der Favorit ruehrt das Aenderungsdatum nicht an',
    p2.prepare('SELECT updated_at FROM items WHERE id = ?').get(pItem.id).updated_at
      === '2020-01-01 00:00:00',
    'nachher: ' + p2.prepare('SELECT updated_at FROM items WHERE id = ?').get(pItem.id).updated_at);
  p2.close();

  const pListe = (await ruf('GET', '/api/items')).inhalt;
  pruefe('Die Uebersicht meldet den eigenen Favoriten',
    pListe.find(i => i.id === pItem.id)?.favorite === true,
    JSON.stringify(pListe.find(i => i.id === pItem.id)?.favorite));
  pruefe('Und laesst die uebrigen Eintraege in Ruhe',
    pListe.filter(i => i.favorite).length === 1,
    `${pListe.filter(i => i.favorite).length} von ${pListe.length} als Favorit`);

  const pExport = (await ruf('GET', '/api/export?photos=0')).inhalt;
  pruefe('Der Export nennt den eigenen Favoriten',
    pExport.items.find(i => i.title === 'Favoritenprobe')?.favorite === true,
    JSON.stringify(pExport.items.map(i => `${i.title}:${i.favorite}`)));

  const pAus = await ruf('PUT', `/api/items/${pItem.id}`, { favorite: false });
  const p3 = oeffne(path.join(DATA, 'katalog.sqlite'));
  pruefe('Das Entfernen des Favoriten wird gemeldet', pAus.inhalt.favorite === false);
  pruefe('Und raeumt die Zeile weg',
    p3.prepare('SELECT COUNT(*) n FROM item_pins WHERE item_id = ?').get(pItem.id).n === 0);
  p3.close();

  /* Eingespieltes gehoert dem Einspielenden -- dieselbe Regel wie bei
     Eintrag, Kommentar, Testtag und Bewertung. In die Spalte zu schreiben
     waere hier besonders tueckisch: eine Ueberfuehrung schoebe den Favoriten
     beim naechsten Start dem Eigentuemer zu statt dem Einspielenden. */
  await sendeImport({ items: [{ title: 'Eingespielt favorisiert', favorite: true },
                              { title: 'Eingespielt schlicht', favorite: false }] }, 'merge');
  const p4 = oeffne(path.join(DATA, 'katalog.sqlite'));
  const pImp = p4.prepare(`SELECT i.id, i.favorite,
      (SELECT COUNT(*) FROM item_pins p WHERE p.item_id = i.id AND p.user_id = 1) AS pin
    FROM items i WHERE i.title LIKE 'Eingespielt %' ORDER BY i.title`).all();
  pruefe('Der Import legt den Favoriten beim Einspielenden an',
    gleich(pImp.map(r => r.pin), [1, 0]), JSON.stringify(pImp));
  pruefe('Und schreibt sie nicht in die alte Spalte',
    pImp.every(r => r.favorite === 0), JSON.stringify(pImp));
  p4.close();

  /* Mit dem Eintrag gehen seine Favoriten. Ohne die Kaskade bliebe eine
     Zeile stehen, die auf nichts mehr zeigt -- unsichtbar, bis eine Nummer
     neu vergeben wird. */
  const pWeg = (await ruf('POST', '/api/items', { title: 'Wieder weg' })).inhalt;
  await ruf('PUT', `/api/items/${pWeg.id}`, { favorite: true });
  await ruf('DELETE', `/api/items/${pWeg.id}`);
  const p5 = oeffne(path.join(DATA, 'katalog.sqlite'));
  pruefe('Mit dem Eintrag geht sein Favorit',
    p5.prepare('SELECT COUNT(*) n FROM item_pins WHERE item_id = ?').get(pWeg.id).n === 0);
  p5.close();

  /* --- Zwei Rufer nebeneinander ---
     Zwei fertige Sitzungen, eine je Benutzer, schon beim Anlegen. Ohne sie ist
     von "der Favorit gehoert MIR" nichts zu belegen -- mit einem einzigen
     Benutzer ist jeder fremde Favorit auch der eigene. */
  function legeFavoritenBestandAn() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-favoriten-'));
    kurzlauf(`require('./db'); console.log('da');`, dir);
    const d = oeffne(path.join(dir, 'katalog.sqlite'));
    d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('erster', 'x');
    d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('zweiter', 'x');
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run('pin-erster', 1);
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run('pin-zweiter', 2);
    for (const t of ['Pin eins', 'Pin zwei', 'Pin drei'])
      d.prepare('INSERT INTO items (title, user_id) VALUES (?, 1)').run(t);
    // Die Grundausstattung raeumen und eigene Kriterien mit bekannten Nummern
    // holen -- feste Nummern truegen, weil AUTOINCREMENT weiterzaehlt.
    d.prepare('DELETE FROM rating_criteria').run();
    const kOptik = d.prepare('INSERT INTO rating_criteria (name, sort_order) VALUES (?, 0)').run('Optik').lastInsertRowid;
    const kHaptik = d.prepare('INSERT INTO rating_criteria (name, sort_order) VALUES (?, 1)').run('Haptik').lastInsertRowid;
    // Beide Benutzer bewerten dasselbe Kriterium desselben Eintrags mit
    // VERSCHIEDENEN Werten -- gleiche Werte machten die Pruefung blind.
    for (const [it, kr, w, u] of [[1, kOptik, 4, 1], [1, kOptik, 2, 2], [1, kHaptik, 5, 1]])
      d.prepare('INSERT INTO ratings (item_id, criterion_id, value, user_id) VALUES (?, ?, ?, ?)')
        .run(it, kr, w, u);
    // Zwei von drei sind Favorit des Ersten: der dritte belegt, dass nicht
    // einfach fuer jeden Eintrag eine Zeile entsteht.
    d.prepare('INSERT INTO item_pins (user_id, item_id) VALUES (1, 1)').run();
    d.prepare('INSERT INTO item_pins (user_id, item_id) VALUES (1, 3)').run();
    d.close();
    return dir;
  }

  const pDir = legeFavoritenBestandAn();
  const P1 = starteWeiterenServer(pDir, {}, 4950);
  await P1.bereit;
  const pRuf = async (cookieName, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${cookieName}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(P1.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };

  /* Und jetzt die Sache selbst: dieselbe Antwort sieht fuer zwei Leute
     verschieden aus. */
  const pSichtE = (await pRuf('pin-erster', 'GET', '/api/items/1')).inhalt;
  const pSichtZ = (await pRuf('pin-zweiter', 'GET', '/api/items/1')).inhalt;
  pruefe('Der Eigentuemer sieht seinen Favoriten', pSichtE?.favorite === true,
    JSON.stringify(pSichtE?.favorite));
  pruefe('Der zweite Benutzer sieht sie NICHT', pSichtZ?.favorite === false,
    JSON.stringify(pSichtZ?.favorite));
  const pListeZ = (await pRuf('pin-zweiter', 'GET', '/api/items')).inhalt;
  pruefe('Auch nicht in der Uebersicht',
    Array.isArray(pListeZ) && pListeZ.every(i => i.favorite === false),
    JSON.stringify(pListeZ?.map(i => `${i.id}:${i.favorite}`)));

  /* Die eigene Sterne-Zeile. Ohne die Bedingung auf user_id vervielfacht der
     LEFT JOIN das Kriterium: bei zwei Bewertern kaeme jedes Kriterium zweimal,
     und das Widget zeigte zwei Reihen Sterne fuer dieselbe Sache. */
  pruefe('Die Sterne zeigen genau eine Zeile je Kriterium',
    pSichtZ?.ratings?.length === 2, JSON.stringify(pSichtZ?.ratings));
  pruefe('Und es sind die eigenen Werte',
    gleich(pSichtE?.ratings?.map(r => `${r.name}:${r.value}`), ['Optik:4', 'Haptik:5']),
    JSON.stringify(pSichtE?.ratings?.map(r => `${r.name}:${r.value}`)));
  pruefe('Der zweite sieht seine eigenen, nicht die fremden',
    gleich(pSichtZ?.ratings?.map(r => `${r.name}:${r.value}`), ['Optik:2', 'Haptik:0']),
    JSON.stringify(pSichtZ?.ratings?.map(r => `${r.name}:${r.value}`)));
  /* Der Schnitt rechnet ueber ALLE -- und zweistufig.
     Bestand: Optik 4 (erster) und 2 (zweiter), Haptik 5 (erster).
       flach ueber alle Zeilen:  (4 + 2 + 5) / 3   = 3.7
       erst je Kriterium:        ((4+2)/2 + 5) / 2 = 4.0
     Der Unterschied ist der ganze Punkt: flach zaehlt Optik doppelt, weil zwei
     Leute es bewertet haben, und die Kopfzahl waere aus den beiden Zeilenwerten
     3,0 und 5,0 nicht mehr nachvollziehbar. Die beiden Zahlen sind hier
     ungleich -- ein Bestand mit gleichen Werten koennte den Unterschied nicht
     zeigen. */
  pruefe('Der Schnitt rechnet zweistufig ueber alle Bewerter',
    pSichtE?.avgRating === 4.0, JSON.stringify(pSichtE?.avgRating));
  pruefe('Und ist damit nicht mehr das flache Mittel',
    pSichtE?.avgRating !== 3.7, JSON.stringify(pSichtE?.avgRating));

  const pZwei = await pRuf('pin-zweiter', 'PUT', '/api/items/1', { favorite: true });
  const pDb2 = oeffne(path.join(pDir, 'katalog.sqlite'));
  const pBeide = pDb2.prepare('SELECT user_id FROM item_pins WHERE item_id = 1 ORDER BY user_id').all();
  pruefe('Der zweite Benutzer darf denselben Eintrag favorisieren',
    pZwei.status === 200 && pZwei.inhalt.favorite === true,
    `Status ${pZwei.status}`);
  pruefe('Beide Favoriten stehen nebeneinander',
    gleich(pBeide.map(p => p.user_id), [1, 2]), JSON.stringify(pBeide));
  pDb2.close();

  const pLos = await pRuf('pin-zweiter', 'PUT', '/api/items/1', { favorite: false });
  const pDb3 = oeffne(path.join(pDir, 'katalog.sqlite'));
  pruefe('Sein Entfernen gelingt', pLos.inhalt.favorite === false);
  pruefe('Und laesst den fremden Favoriten stehen',
    gleich(pDb3.prepare('SELECT user_id FROM item_pins WHERE item_id = 1').all().map(p => p.user_id), [1]),
    JSON.stringify(pDb3.prepare('SELECT user_id FROM item_pins WHERE item_id = 1').all()));
  pDb3.close();
  await P1.stopp();
  fs.rmSync(pDir, { recursive: true, force: true });

  /* --- Das Auffangnetz an der Einrichtung: herrenloser Bestand faellt dem
     ersten Zugang zu. Beim Start hat ordneBestandZu() niemanden, dem es etwas
     geben koennte, und muss es beim Anlegen des ersten Zugangs nachholen. */
  const eDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-auffangnetz-'));
  kurzlauf(`require('./db'); console.log('da');`, eDir);
  {
    const d = oeffne(path.join(eDir, 'katalog.sqlite'));
    d.prepare('INSERT INTO items (title) VALUES (?)').run('Herrenlos eins');
    d.prepare('INSERT INTO items (title) VALUES (?)').run('Herrenlos zwei');
    d.close();
  }
  const E1 = starteWeiterenServer(eDir, {}, 5070);
  await E1.bereit;
  const eDbVor = oeffne(path.join(eDir, 'katalog.sqlite'));
  pruefe('Ohne Benutzer wird nichts zugeordnet',
    eDbVor.prepare('SELECT COUNT(*) n FROM items WHERE user_id IS NULL').get().n === 2,
    'der Bestand muss herrenlos stehen bleiben, bis es jemanden gibt');
  eDbVor.close();
  await E1.ruf('POST', '/api/setup', { user: 'einrichter', password: 'einrichtungs-passwort' });
  const eDb = oeffne(path.join(eDir, 'katalog.sqlite'));
  pruefe('Die Einrichtung holt die Zuordnung nach',
    eDb.prepare('SELECT COUNT(*) n FROM items WHERE user_id = 1').get().n === 2,
    JSON.stringify(eDb.prepare('SELECT id, user_id FROM items').all()));
  pruefe('Keine Zeile bleibt ohne Benutzer',
    eDb.prepare('SELECT COUNT(*) n FROM items WHERE user_id IS NULL').get().n === 0);
  eDb.close();
  await E1.stopp();
  fs.rmSync(eDir, { recursive: true, force: true });

  /* --- Zwei Waechter ueber den Quelltext ---
     Sie sind ausdruecklich als solche gebaut: sie schlagen
     bei jeder Gegenprobe an, die detail() anfasst. Gemessen wird deshalb an
     den NAMEN der roten Pruefungen, nicht an ihrer Zahl.
     Der Grund fuer den ersten: better-sqlite3 bindet ein FEHLENDES Argument
     still als NULL -- nur zu WENIGE Argumente werfen.
     Eine vergessene Aufrufstelle lieferte also
     wortlos favorite: false und lauter Nullen bei den Sternen, statt
     aufzufallen. Ueber die Schnittstelle ist das nicht zu erwischen: man
     muesste eine Aufrufstelle vergessen, um es zu sehen. */
  const quelle = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  /* Kommentare erst herausnehmen -- sie sprechen ueber detail() und wuerden
     sonst als Aufrufstellen gezaehlt. Der leere Fall detail() aus der
     Fehlermeldung faellt durch das + im Muster heraus. */
  const ohneKommentar = quelle.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const rufe = [...ohneKommentar.matchAll(/detail\(([^)]+)\)/g)]
    .map(m => m[1]).filter(a => a !== 'id, benutzerId');
  pruefe('Keine Aufrufstelle von detail() ohne Benutzer',
    rufe.length === 25 && rufe.every(a => /,\s*req\.benutzer\.id\s*$/.test(a)),
    `${rufe.length} Aufrufe, ohne Benutzer: ` +
    JSON.stringify(rufe.filter(a => !/,\s*req\.benutzer\.id\s*$/.test(a))));
  pruefe('detail() klemmt einen fehlenden Benutzer ab, statt still false zu liefern',
    /function detail\(id, benutzerId\) \{\s*\n\s*if \(benutzerId == null\) throw/.test(quelle),
    'ohne die Klemme bindet better-sqlite3 das fehlende Argument als NULL');

  /* ---------------------------------------------------------------- */
  gruppe('Persoenliche Einstellungen');

  /* Die Tabelle selbst. ON DELETE CASCADE ist keine Formsache: eine
     persoenliche Einstellung ohne Benutzer bedeutet nichts, und SET NULL
     scheidet aus, weil user_id im Primaerschluessel steht. */
  const dHaupt = oeffne(path.join(DATA, 'katalog.sqlite'));
  const dSpalten = dHaupt.prepare('PRAGMA table_info(user_settings)').all();
  const dFk = dHaupt.prepare('PRAGMA foreign_key_list(user_settings)').all();
  pruefe('Die Tabelle user_settings entsteht',
    dSpalten.length === 3, JSON.stringify(dSpalten.map(s => s.name)));
  pruefe('Ihr Schluessel ist das Paar aus Benutzer und Name',
    dSpalten.filter(s => s.pk > 0).map(s => s.name).sort().join(',') === 'key,user_id',
    JSON.stringify(dSpalten.filter(s => s.pk > 0).map(s => s.name)));
  pruefe('user_id haengt mit ON DELETE CASCADE am Benutzer',
    dFk.length === 1 && dFk[0].table === 'users' && dFk[0].on_delete === 'CASCADE',
    JSON.stringify(dFk));
  pruefe('Die persoenliche Einstellung darf keinen leeren Benutzer haben',
    dSpalten.find(s => s.name === 'user_id')?.notnull === 1,
    'sonst waere das UNIQUE loechrig, weil NULL darin als verschieden gilt');
  dHaupt.close();

  /* Die Liste der persoenlichen Schluessel in server.js -- am Quelltext
     gegengehalten, damit ein still entfernter Schluessel auffaellt. */
  const srvQuelle = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  // Bewusst ohne zusammengesetzten regulaeren Ausdruck: der wird beim Einbetten
  // in ein String ein zweites Mal maskiert und ist dann falsch, ohne dass
  // man es ihm ansieht -- genau das ist beim Bauen dieser Gruppe passiert. Von
  // Klammer zu Klammer schneiden ist langweiliger und deshalb richtig.
  const listeAus = (text, name) => {
    const start = text.indexOf(`const ${name} = [`);
    if (start < 0) return null;
    const auf = text.indexOf('[', start);
    const zu = text.indexOf(']', auf);
    if (auf < 0 || zu < 0) return null;
    return text.slice(auf + 1, zu).split(',')
      .map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean).sort();
  };
  const dListeSrv = listeAus(srvQuelle, 'PERSOENLICHE_SCHLUESSEL');
  const dSoll = ['bloecke', 'filters', 'linkZeilen', 'schrift', 'suchNamen', 'zeitleiste',
                 'zuletztGesehen'];
  pruefe('server.js kennt genau die sieben persoenlichen Schluessel',
    gleich(dListeSrv, dSoll), JSON.stringify(dListeSrv));

  /* Der Waechter ueber den Quelltext. Dieselbe Ueberlegung wie bei detail()
     und aus demselben Grund die EINZIGE Schicht, die eine vergessene
     Aufrufstelle ueberhaupt sieht: better-sqlite3 bindet ein fehlendes Argument
     still als NULL, und WHERE user_id = NULL ist nie wahr. Ein vergessenes
     schriftgroesse() lieferte also wortlos 100 statt aufzufallen. */
  const srvOhneKommentar = srvQuelle
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const leereRufe = ['schriftgroesse', 'bloecke', 'linkZeilen', 'zeitleisteAn', 'suchNamen']
    .filter(f => new RegExp(`[^a-zA-Z]${f}\\(\\)`).test(srvOhneKommentar));
  pruefe('Keine Aufrufstelle der persoenlichen Ableiter ohne Benutzer',
    leereRufe.length === 0, `ohne Benutzer gerufen: ${JSON.stringify(leereRufe)}`);
  pruefe('getUserSetting klemmt einen fehlenden Benutzer ab',
    /const getUserSetting = \(benutzerId, k, fallback\) => \{\s*\n\s*if \(benutzerId == null\)\s*\n?\s*throw/.test(srvQuelle),
    'ohne die Klemme faellt alles still auf die Vorgaben zurueck');
  pruefe('putUserSetting klemmt ebenso ab',
    /const putUserSetting = \(benutzerId, k, wert\) => \{\s*\n\s*if \(benutzerId == null\)\s*\n?\s*throw/.test(srvQuelle),
    'sonst meldet erst die Datenbank den Fehler, ohne zu sagen wer ihn gemacht hat');

  /* Die Schranke gegen die zweite Wahrheit. Sie ist der Grund, warum
     PERSOENLICHE_SCHLUESSEL zur Laufzeit ueberhaupt gelesen wird -- eine Liste,
     die nur der Pruefstand ansieht, loescht der Naechste als unbenutzt weg.
     Geprueft am Quelltext, weil es ueber die Schnittstelle keinen Weg dorthin
     gibt: der PUT-Endpunkt ruft putSetting nur noch mit globalen Schluesseln.
     Der Leseweg ist von aussen nicht
     erreichbar, also muss die Pruefung an der inneren Schicht ansetzen. */
  pruefe('putSetting weist persoenliche Schluessel ab',
    /if \(PERSOENLICHE_SCHLUESSEL\.includes\(k\)\)\s*\n\s*throw/.test(srvQuelle),
    'ohne die Schranke wandert ein zurueckgeschriebener Schluessel beim naechsten ' +
    'Start still zum Eigentuemer statt zu dem, der ihn gesetzt hat');
  // Und der Nachweis, dass sie wirklich greift: der einzige Weg dorthin fuehrt
  // ueber den Quelltext, also wird sie hier in einem eigenen Prozess gerufen.
  // Ohne diese Zeile belegte die Pruefung darueber nur, dass der Text dasteht.
  const dSchranke = (() => {
    try {
      const { execFileSync } = require('child_process');
      const ausg = execFileSync(process.execPath, ['-e', `
        const s = require('fs').readFileSync('server.js', 'utf8');
        const liste = s.slice(s.indexOf('const PERSOENLICHE_SCHLUESSEL = [') + 32);
        const schluessel = liste.slice(0, liste.indexOf(']'))
          .split(',').map(x => x.trim().replace(/^'|'$/g, '')).filter(Boolean);
        console.log(schluessel.includes('schrift') && schluessel.includes('zeitleiste') ? 'ja' : 'nein');
      `], { cwd: __dirname, encoding: 'utf8' });
      return ausg.trim();
    } catch { return 'fehler'; }
  })();
  pruefe('Die Schranke kennt die persoenlichen Schluessel namentlich',
    dSchranke === 'ja', `Ergebnis: ${dSchranke}`);

  /* Jetzt die Wirkung, und zwar mit ZWEI Benutzern nebeneinander. Mit einem
     einzigen waere "persoenlich" von "global" nicht zu unterscheiden -- der
     Rueckbau bliebe stumm. Das Muster: zwei fertige Sitzungen in der
     Datenbank, die Anmeldung wird gar nicht gebraucht. */
  function legeZweiBenutzerAn() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-stufed-'));
    kurzlauf(`require('./db'); console.log('da');`, dir);
    const d = oeffne(path.join(dir, 'katalog.sqlite'));
    d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('erster', 'x');
    d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('zweiter', 'x');
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run('cookie-d-eins', 1);
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run('cookie-d-zwei', 2);
    d.close();
    return dir;
  }
  const dDir = legeZweiBenutzerAn();
  const D1 = starteWeiterenServer(dDir, {}, 5200);
  await D1.bereit;
  // Zwei echte Cookies nebeneinander, ohne den gemeinsamen Cookiespeicher von
  // starteWeiterenServer zu benutzen -- sonst ueberschriebe der zweite den
  // ersten und es gaebe wieder nur einen Rufer.
  const dRuf = async (cookieWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${cookieWert}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(D1.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };

  await dRuf('cookie-d-eins', 'PUT', '/api/settings',
    { schrift: 120, linkZeilen: 12, zeitleiste: false, suchNamen: 4 });
  await dRuf('cookie-d-zwei', 'PUT', '/api/settings',
    { schrift: 80, linkZeilen: 3, suchNamen: 1 });
  await dRuf('cookie-d-eins', 'PUT', '/api/settings', { filters: { tested: 'yes' } });
  await dRuf('cookie-d-zwei', 'PUT', '/api/settings', { filters: { tested: 'no' } });
  const dEins = (await dRuf('cookie-d-eins', 'GET', '/api/settings')).inhalt;
  const dZwei = (await dRuf('cookie-d-zwei', 'GET', '/api/settings')).inhalt;

  pruefe('Die Schriftgroesse gehoert dem Benutzer, nicht allen',
    dEins.schrift === 120 && dZwei.schrift === 80,
    `erster ${dEins.schrift}, zweiter ${dZwei.schrift}`);
  pruefe('Die Zahl der Linkzeilen ebenso',
    dEins.linkZeilen === 12 && dZwei.linkZeilen === 3,
    `erster ${dEins.linkZeilen}, zweiter ${dZwei.linkZeilen}`);
  pruefe('Die Zeitleiste ebenso -- und der Zweite behaelt die Vorgabe',
    dEins.zeitleiste === false && dZwei.zeitleiste === true,
    `erster ${dEins.zeitleiste}, zweiter ${dZwei.zeitleiste}`);
  pruefe('Die Zahl der Anbieternamen ebenso',
    dEins.suchNamen === 4 && dZwei.suchNamen === 1,
    `erster ${dEins.suchNamen}, zweiter ${dZwei.suchNamen}`);
  pruefe('Die Filterwahl ebenso',
    dEins.filters?.tested === 'yes' && dZwei.filters?.tested === 'no',
    JSON.stringify([dEins.filters, dZwei.filters]));

  /* Der Merkzeitpunkt, und er ist der einzige der sieben, der seinen Wert
     NICHT vom Aufrufer bekommt: geschickt wird ein Signal, gespeichert wird
     die Serveruhr. Ein mitgeschickter Zeitstempel waere eine Behauptung --
     damit liesse sich jeder Bestand nach Belieben als ungesehen erklaeren.
     ERST DIE ABWESENHEIT, DANN DAS VORHANDENSEIN: vor dem ersten Verlassen
     der Uebersicht steht der Schluessel gar nicht in der Tabelle, und die
     Antwort traegt null. Ohne diese Zeile bliebe offen, ob der Server ihn
     nicht schon beim Lesen anlegt -- dann waere "neu seit" beim ersten Besuch
     immer leer. */
  const dVorher = (await dRuf('cookie-d-eins', 'GET', '/api/settings')).inhalt;
  pruefe('Vor dem ersten Verlassen der Uebersicht gibt es keinen Merkzeitpunkt',
    dVorher.zuletztGesehen === null, JSON.stringify(dVorher.zuletztGesehen));
  const dGesehen = await dRuf('cookie-d-eins', 'PUT', '/api/settings',
    { zuletztGesehen: '1999-01-01 00:00:00' });
  const dNachher = (await dRuf('cookie-d-eins', 'GET', '/api/settings')).inhalt;
  pruefe('Nach dem Verlassen steht er da',
    dGesehen.status === 200 && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dNachher.zuletztGesehen || ''),
    JSON.stringify(dNachher.zuletztGesehen));
  pruefe('Und zwar von der Serveruhr, nicht aus dem Ruf',
    dNachher.zuletztGesehen !== '1999-01-01 00:00:00' &&
    dNachher.zuletztGesehen > '2020-01-01 00:00:00',
    JSON.stringify(dNachher.zuletztGesehen));
  /* DAS FENSTER IST NACHGESTELLT (Stolperstein 60): datetime('now') loest nur
     Sekunden auf. Entstuende ein Kommentar in derselben Sekunde, in der jemand
     die Uebersicht verlaesst, traege sein Eintrag genau diesen Zeitstempel und
     gaelte danach nie als neu. Geprueft wird an der Sekunde selbst: der
     gespeicherte Wert liegt VOR der Uhr des Servers, nicht auf ihr. */
  const dUhr = (() => {
    const d = oeffne(path.join(dDir, 'katalog.sqlite'));
    const t = d.prepare("SELECT datetime('now') AS t").get().t;
    d.close();
    return t;
  })();
  pruefe('Der Merkzeitpunkt liegt vor der Serveruhr, nicht auf ihr',
    dNachher.zuletztGesehen < dUhr, `gemerkt ${dNachher.zuletztGesehen}, Uhr ${dUhr}`);
  pruefe('Und hoechstens eine Sekunde davor',
    (new Date(dUhr.replace(' ', 'T') + 'Z') - new Date(dNachher.zuletztGesehen.replace(' ', 'T') + 'Z'))
      <= 2000,
    `gemerkt ${dNachher.zuletztGesehen}, Uhr ${dUhr}`);
  pruefe('Er gehoert dem, der ihn gesetzt hat',
    (await dRuf('cookie-d-zwei', 'GET', '/api/settings')).inhalt.zuletztGesehen === null,
    JSON.stringify((await dRuf('cookie-d-zwei', 'GET', '/api/settings')).inhalt.zuletztGesehen));

  /* DER SCHLUESSEL MUSS IN PERSOENLICHE_SCHLUESSEL STEHEN, und das ist keine
     Formsache. PUT /api/settings leitet aus dieser Liste ab, was jeder fuer
     sich schreiben darf; alles andere ist Adminsache. Stuende er nicht darin,
     bekaeme ein gewoehnlicher Benutzer ein 403 und koennte sich nie merken,
     wo er zuletzt war -- und der Wert landete beim naechsten Weg in die
     globale Tabelle und gaelte still fuer alle.
     DER ZWEITE ZUGANG IST DER GEGENSTAND: der erste ist Eigentuemer und damit
     Admin, an ihm faellt die Luecke gar nicht auf. Die Rolle wird ausdruecklich
     nachgesehen, sonst pruefte die Zeile darunter womoeglich einen zweiten
     Admin (Stolperstein 87). */
  pruefe('Der zweite Zugang traegt wirklich keine Adminrolle',
    (await dRuf('cookie-d-zwei', 'GET', '/api/settings')).inhalt.istAdmin === false,
    JSON.stringify((await dRuf('cookie-d-zwei', 'GET', '/api/settings')).inhalt.istAdmin));
  const dGesehenZwei = await dRuf('cookie-d-zwei', 'PUT', '/api/settings', { zuletztGesehen: 1 });
  pruefe('Auch ohne Adminrolle merkt sich jeder seinen eigenen Zeitpunkt',
    dGesehenZwei.status === 200, `Status ${dGesehenZwei.status} / ${JSON.stringify(dGesehenZwei.inhalt)}`);
  pruefe('Und er steht danach bei ihm',
    /^\d{4}-/.test((await dRuf('cookie-d-zwei', 'GET', '/api/settings')).inhalt.zuletztGesehen || ''),
    JSON.stringify((await dRuf('cookie-d-zwei', 'GET', '/api/settings')).inhalt.zuletztGesehen));

  // Und die Blockanordnung, die eine eigene Bauform hat (verschachteltes
  // Objekt statt Zahl) und deshalb eigens geprueft wird.
  await dRuf('cookie-d-eins', 'PUT', '/api/settings',
    { bloecke: { seite: ['bewertung', 'tags', 'kategorie'], unten: [], zu: ['links'] } });
  const dBlEins = (await dRuf('cookie-d-eins', 'GET', '/api/settings')).inhalt.bloecke;
  const dBlZwei = (await dRuf('cookie-d-zwei', 'GET', '/api/settings')).inhalt.bloecke;
  pruefe('Die Blockanordnung gehoert dem Benutzer',
    gleich(dBlEins.seite, ['bewertung', 'tags', 'kategorie']) &&
    gleich(dBlZwei.seite, ['kategorie', 'tags', 'bewertung']),
    JSON.stringify([dBlEins.seite, dBlZwei.seite]));
  pruefe('Und der Einklappzustand mit ihr',
    gleich(dBlEins.zu, ['links']) && gleich(dBlZwei.zu, []),
    JSON.stringify([dBlEins.zu, dBlZwei.zu]));

  /* Die andere Haelfte, und sie ist der eigentliche Gegenbeweis: was global
     bleibt, MUSS fuer beide gleich aussehen. Ohne diese Pruefungen belegte die
     Gruppe nur, dass irgendetwas je Benutzer verschieden ist -- nicht, dass die
     Trennung an der richtigen Stelle verlaeuft. Vorrat, Startanbieter und
     eigene Anbieter gehoeren dem Admin. */
  await dRuf('cookie-d-eins', 'PUT', '/api/settings', { sucheAktiv: ['ddg', 'bing'] });
  await dRuf('cookie-d-eins', 'PUT', '/api/settings',
    { vokabular: { sacheEinzahl: 'Maschine' } });
  const dGlobEins = (await dRuf('cookie-d-eins', 'GET', '/api/settings')).inhalt;
  const dGlobZwei = (await dRuf('cookie-d-zwei', 'GET', '/api/settings')).inhalt;
  // standardVon und imVorrat stehen weiter oben in dieser Datei --
  // eine zweite Ausfertigung daneben waere eine Doppelung, die sich nur
  // halb prueft.
  pruefe('Der Startanbieter bleibt global -- beide sehen denselben',
    standardVon(dGlobEins.suchAnbieter) === 'ddg' && standardVon(dGlobZwei.suchAnbieter) === 'ddg',
    `erster ${standardVon(dGlobEins.suchAnbieter)}, zweiter ${standardVon(dGlobZwei.suchAnbieter)}`);
  // ACHTUNG, nicht ['ddg','bing']: imVorrat liest die Liste in KANONISCHER
  // Reihenfolge (google, bing, ddg, ...), nicht in Vorratsreihenfolge. Wer hier
  // Standard zuerst erwartet, prueft die falsche Zusicherung -- wer Standard
  // ist, sagt allein das Kennzeichen `standard` eine Zeile darueber.
  pruefe('Der Vorrat bleibt global',
    gleich(imVorrat(dGlobEins.suchAnbieter), ['bing', 'ddg']) &&
    gleich(imVorrat(dGlobZwei.suchAnbieter), ['bing', 'ddg']),
    JSON.stringify([imVorrat(dGlobEins.suchAnbieter), imVorrat(dGlobZwei.suchAnbieter)]));
  pruefe('Das Vokabular bleibt global -- es ist die Sprache, keine Ansichtssache',
    dGlobEins.vokabular?.sacheEinzahl === 'Maschine' &&
    dGlobZwei.vokabular?.sacheEinzahl === 'Maschine',
    JSON.stringify([dGlobEins.vokabular?.sacheEinzahl, dGlobZwei.vokabular?.sacheEinzahl]));

  /* Und jetzt die Trennung dort, wo sie stattfindet: in den beiden Tabellen.
     Ein Schluessel, der in der falschen Haelfte landet, faellt in der Antwort
     nicht auf -- solange nur einer angemeldet ist, sieht beides gleich aus. */
  const dDb = oeffne(path.join(dDir, 'katalog.sqlite'));
  const globalDa = (k) => !!dDb.prepare('SELECT 1 FROM settings WHERE key = ?').get(k);
  const persoenlichDa = (k, u) =>
    !!dDb.prepare('SELECT 1 FROM user_settings WHERE user_id = ? AND key = ?').get(u, k);
  const dFalschGlobal = dSoll.filter(globalDa);
  const dFehlend = dSoll.filter(k => !persoenlichDa(k, 1));
  pruefe('Kein persoenlicher Schluessel landet in der globalen Tabelle',
    dFalschGlobal.length === 0, `global gefunden: ${JSON.stringify(dFalschGlobal)}`);
  pruefe('Alle sieben stehen beim Benutzer, der sie gesetzt hat',
    dFehlend.length === 0, `fehlt bei Benutzer 1: ${JSON.stringify(dFehlend)}`);
  pruefe('Der Suchvorrat bleibt in der globalen Tabelle',
    globalDa('sucheAktiv') && !persoenlichDa('sucheAktiv', 1),
    `sucheAktiv global ${globalDa('sucheAktiv')}`);
  pruefe('Vokabular und Titel ebenso',
    globalDa('vokabular') && globalDa('title_app'),
    `vokabular ${globalDa('vokabular')}, title_app ${globalDa('title_app')}`);
  pruefe('Keine der globalen Einstellungen rutscht in die persoenliche Haelfte',
    !['suche', 'sucheAktiv', 'sucheEigene', 'vokabular', 'title_app', 'title_public']
      .some(k => persoenlichDa(k, 1)),
    JSON.stringify(dDb.prepare('SELECT key FROM user_settings WHERE user_id = 1').all()));
  // Der Zweite hat vier Schluessel selbst gesetzt und seit 0.8.60 den
  // Merkzeitpunkt dazu -- fuenf. Was er NICHT gesetzt hat, steht auch nicht
  // bei ihm; genau darum geht es hier.
  pruefe('Die beiden Benutzer teilen sich keine Zeile',
    dDb.prepare('SELECT COUNT(*) n FROM user_settings WHERE user_id = 2').get().n === 5,
    JSON.stringify(dDb.prepare('SELECT key FROM user_settings WHERE user_id = 2').all()));
  dDb.close();

  /* Die Kaskade an user_settings.user_id. Die Anwendung entfernt keine
     Benutzerzeile -- geloescht heisst Grabstein. Die ON-DELETE-Angabe bleibt
     trotzdem Pflicht: sie ist das Auffangnetz fuer jedes DELETE von Hand
     und fuer alles, was spaeter noch eine Benutzerzeile entfernen koennte.
     NACHGESTELLT WIRD SIE DESHALB HIER VON HAND -- ohne diese Gruppe fiele
     der Beleg fuer die Kaskade stillschweigend weg. */
  await D1.stopp();
  const drDb = oeffne(path.join(dDir, 'katalog.sqlite'));
  drDb.pragma('foreign_keys = ON');
  pruefe('Vor dem Loeschen stehen persoenliche Einstellungen da',
    drDb.prepare('SELECT COUNT(*) n FROM user_settings').get().n > 0,
    JSON.stringify(drDb.prepare('SELECT user_id, key FROM user_settings').all()));
  const drEintraege = drDb.prepare('SELECT COUNT(*) n FROM items').get().n;
  let drFehler = null;
  // Ohne ON DELETE CASCADE scheitert diese Zeile mit
  // "FOREIGN KEY constraint failed" -- im Betrieb stuerbe daran der Start.
  try { drDb.prepare('DELETE FROM users').run(); } catch (e) { drFehler = e.message; }
  pruefe('Ein DELETE FROM users geht ohne Fremdschluesselfehler durch',
    drFehler === null, drFehler || '');
  pruefe('Und die Kaskade raeumt die persoenlichen Einstellungen mit weg',
    drDb.prepare('SELECT COUNT(*) n FROM user_settings').get().n === 0,
    JSON.stringify(drDb.prepare('SELECT user_id, key FROM user_settings').all()));
  // Die Gegenrichtung an derselben Stelle: der BESTAND haengt auf SET NULL und
  // darf nicht mitgehen. Waeren beide auf CASCADE, saehe die Zeile darueber
  // genauso gruen aus.
  pruefe('Der Bestand wird dabei herrenlos statt geloescht',
    drDb.prepare('SELECT COUNT(*) n FROM items').get().n === drEintraege &&
    drDb.prepare('SELECT COUNT(*) n FROM items WHERE user_id IS NULL').get().n === drEintraege,
    JSON.stringify(drDb.prepare('SELECT id, user_id FROM items').all()));
  drDb.close();
  fs.rmSync(dDir, { recursive: true, force: true });

  gruppe('Schnitt und Anzahl je Kriterium');

  function legeDreiBenutzerAn() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-stufee-'));
    kurzlauf(`require('./db'); console.log('da');`, dir);
    const d = oeffne(path.join(dir, 'katalog.sqlite'));
    for (const n of ['eins', 'zwei', 'drei'])
      d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(n, 'x');
    // Drei fertige Sitzungen, eine je Benutzer -- schneller und
    // unabhaengiger als der Weg ueber die Verwaltung.
    for (const [t, u] of [['cookie-e-eins', 1], ['cookie-e-zwei', 2], ['cookie-e-drei', 3]])
      d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(t, u);
    for (const t of ['Dreier', 'Zweiter Eintrag'])
      d.prepare('INSERT INTO items (title, user_id) VALUES (?, 1)').run(t);
    // Die drei Vorgabekriterien aus db.js weg -- sonst laegen sieben Zeilen im
    // Sternwidget und die Bewertungen unten trafen ueber ihre Ids die
    // falschen. Die eigenen Ids werden abgeholt statt geraten.
    d.prepare('DELETE FROM rating_criteria').run();
    const kId = {};
    ['Optik', 'Haptik', 'Preis', 'Service'].forEach((n, i) => {
      kId[n] = d.prepare('INSERT INTO rating_criteria (name, sort_order) VALUES (?, ?)')
        .run(n, i).lastInsertRowid;
    });
    /* Eintrag 1: Optik 5/3/1 (drei Stimmen)  -> Schnitt 3,0
                  Haptik 4/2  (zwei Stimmen)  -> Schnitt 3,0
                  Preis  5    (eine Stimme)   -> Schnitt 5,0
                  dazu eine NULLZEILE auf Preis: zurueckgesetzt, keine Stimme
                  Service: gar nichts          -> null, und faellt aus dem
                                                  Gesamtschnitt heraus
         zweistufig: (3,0 + 3,0 + 5,0) / 3 = 3,7
         flach:      (5+3+1+4+2+5) / 6      = 3,3   <- das waere die alte Zahl
       Eintrag 2: Optik 4 (eine Stimme) -- allein dafuer da, dass Optik an ZWEI
                  Eintraegen verwendet ist, aber vier Zeilen hat. */
    for (const [it, kr, w, u] of [
      [1, 'Optik', 5, 1], [1, 'Optik', 3, 2], [1, 'Optik', 1, 3],
      [1, 'Haptik', 4, 1], [1, 'Haptik', 2, 2],
      [1, 'Preis', 5, 3], [1, 'Preis', 0, 2],
      [2, 'Optik', 4, 1]
    ]) d.prepare('INSERT INTO ratings (item_id, criterion_id, value, user_id) VALUES (?, ?, ?, ?)')
        .run(it, kId[kr], w, u);
    // Zwei Leute am selben Datum sind zwei Testtage, der dritte
    // liegt spaeter. Fuer die Zeitleiste: einer eigen, zwei fremd.
    for (const [tag, note, u] of [['2024-03-01', 4, 1], ['2024-03-01', 2, 2], ['2024-04-01', 5, 3]])
      d.prepare('INSERT INTO test_days (item_id, day, rating, user_id) VALUES (1, ?, ?, ?)')
        .run(tag, note, u);
    d.prepare('UPDATE items SET tested = 1 WHERE id = 1').run();
    d.close();
    return dir;
  }

  const stufeEDir = legeDreiBenutzerAn();
  const SE1 = starteWeiterenServer(stufeEDir, {}, 5560);
  await SE1.bereit;
  // Drei echte Cookies nebeneinander, am gemeinsamen Cookiespeicher vorbei.
  const eRuf = async (cookieWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${cookieWert}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(SE1.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };
  const eZeile = (sicht, name) => sicht?.ratings?.find(r => r.name === name);

  const eEins = (await eRuf('cookie-e-eins', 'GET', '/api/items/1')).inhalt;
  const eZwei = (await eRuf('cookie-e-zwei', 'GET', '/api/items/1')).inhalt;
  const eDrei = (await eRuf('cookie-e-drei', 'GET', '/api/items/1')).inhalt;

  pruefe('Jedes Kriterium steht genau einmal in der Sternzeile',
    eEins?.ratings?.length === 4 &&
    gleich(eEins.ratings.map(r => r.name), ['Optik', 'Haptik', 'Preis', 'Service']),
    JSON.stringify(eEins?.ratings?.map(r => r.name)));
  pruefe('Der Schnitt je Kriterium rechnet ueber alle Bewerter',
    eZeile(eEins, 'Optik')?.avg === 3 && eZeile(eEins, 'Haptik')?.avg === 3 &&
    eZeile(eEins, 'Preis')?.avg === 5,
    JSON.stringify(eEins?.ratings?.map(r => `${r.name}:${r.avg}`)));
  /* Der Zaehler ist die eigentliche Falle: ein zweiter JOIN neben dem, der die
     eigene Zeile holt, vervielfacht die Kriterien. Drei, zwei und eins sind
     verschieden -- bei gleicher Abdeckung waere die Vervielfachung an den
     Zahlen nicht abzulesen. */
  pruefe('Die Zahl der Bewerter ist nicht vervielfacht',
    eZeile(eEins, 'Optik')?.count === 3 && eZeile(eEins, 'Haptik')?.count === 2 &&
    eZeile(eEins, 'Preis')?.count === 1,
    JSON.stringify(eEins?.ratings?.map(r => `${r.name}:${r.count}`)));
  pruefe('Ein Kriterium ohne Stimme bleibt leer statt null zu zaehlen',
    eZeile(eEins, 'Service')?.avg === null && eZeile(eEins, 'Service')?.count === 0,
    JSON.stringify(eZeile(eEins, 'Service')));
  // Eine zurueckgesetzte Bewertung hinterlaesst eine Zeile mit 0. Zaehlte sie
  // mit, waere Preis 2,5 aus zwei Stimmen statt 5,0 aus einer.
  pruefe('Eine zurueckgesetzte Bewertung ist keine Stimme',
    eZeile(eEins, 'Preis')?.count === 1 && eZeile(eEins, 'Preis')?.avg === 5,
    JSON.stringify(eZeile(eEins, 'Preis')));

  pruefe('Die Sterne bleiben die eigenen',
    gleich(eEins?.ratings?.map(r => r.value), [5, 4, 0, 0]) &&
    gleich(eDrei?.ratings?.map(r => r.value), [1, 0, 5, 0]),
    `eins: ${JSON.stringify(eEins?.ratings?.map(r => r.value))}, ` +
    `drei: ${JSON.stringify(eDrei?.ratings?.map(r => r.value))}`);
  // Der Schnitt ist keine persoenliche Angabe: drei Leute sehen dieselbe Zahl.
  pruefe('Schnitt und Zahl sehen fuer alle drei gleich aus',
    gleich(eEins?.ratings?.map(r => `${r.avg}/${r.count}`),
           eZwei?.ratings?.map(r => `${r.avg}/${r.count}`)) &&
    gleich(eEins?.ratings?.map(r => `${r.avg}/${r.count}`),
           eDrei?.ratings?.map(r => `${r.avg}/${r.count}`)),
    JSON.stringify([eEins?.ratings?.map(r => r.avg), eZwei?.ratings?.map(r => r.avg),
                    eDrei?.ratings?.map(r => r.avg)]));

  pruefe('Der Gesamtschnitt ist das Mittel der Zeilenwerte',
    eEins?.avgRating === 3.7, JSON.stringify(eEins?.avgRating));
  pruefe('Und ausdruecklich nicht das flache Mittel ueber alle Zeilen',
    eEins?.avgRating !== 3.3, JSON.stringify(eEins?.avgRating));
  // Dieselbe Zahl muss auch die Kachel tragen -- sie kommt aus einer anderen
  // Abfrage und muesste sonst getrennt gepflegt werden.
  const eListe = (await eRuf('cookie-e-eins', 'GET', '/api/items')).inhalt;
  pruefe('Die Uebersicht rechnet mit demselben Ergebnis',
    eListe?.find(i => i.id === 1)?.avgRating === 3.7,
    JSON.stringify(eListe?.map(i => `${i.id}:${i.avgRating}`)));

  /* Der Verwendungszaehler in der Verwaltungskarte. Optik hat VIER Zeilen an
     ZWEI Eintraegen -- die Oberflaeche beschriftet die Zahl mit dem Wort fuer
     Eintraege, also muessen es zwei sein. Mit COUNT(*) stuende dort vier. */
  const eKrit = (await eRuf('cookie-e-eins', 'GET', '/api/criteria')).inhalt;
  const eKritZahl = (n) => eKrit?.find(c => c.name === n)?.usage_count;
  pruefe('Der Verwendungszaehler zaehlt Eintraege, nicht Bewertungszeilen',
    eKritZahl('Optik') === 2 && eKritZahl('Haptik') === 1 && eKritZahl('Preis') === 1,
    JSON.stringify(eKrit?.map(c => `${c.name}:${c.usage_count}`)));
  pruefe('Und ein Kriterium ohne vergebene Sterne steht auf null',
    eKritZahl('Service') === 0, JSON.stringify(eKritZahl('Service')));

  /* --- Testtage: wem gehoert der Punkt --- */
  const eTage = (u) => (u?.testDays || []).map(t => `${t.day}/${t.rating}/${t.mine}`);
  // Reihenfolge: ORDER BY day DESC, id DESC -- bei gleichem Datum steht der
  // zuletzt eingetragene oben. Der Testtag von 'zwei' (id 2) kommt also vor
  // dem von 'eins' (id 1).
  pruefe('Jeder Testtag sagt, ob er mir gehoert',
    gleich(eTage(eEins), ['2024-04-01/5/false', '2024-03-01/2/false', '2024-03-01/4/true']),
    JSON.stringify(eTage(eEins)));
  pruefe('Und fuer den dritten sind es die anderen',
    gleich(eTage(eDrei), ['2024-04-01/5/true', '2024-03-01/2/false', '2024-03-01/4/false']),
    JSON.stringify(eTage(eDrei)));
  pruefe('Die Zugehoerigkeit steht auch in der Uebersicht',
    gleich((eListe?.find(i => i.id === 1)?.testDays || []).map(t => t.mine),
           [false, false, true]),
    JSON.stringify((eListe?.find(i => i.id === 1)?.testDays || []).map(t => t.mine)));
  // Die Verfasser-Id selbst hat in der Antwort nichts verloren --
  // eine nackte Id liest ohnehin niemand.
  pruefe('Die Verfasser-Id steht nicht in der Antwort',
    (eEins?.testDays || []).every(t => t.user_id === undefined),
    JSON.stringify(eEins?.testDays?.[0]));
  // Die Kennzahlen des Blockkopfes rechnen weiterhin ueber alle.
  pruefe('Die Testkennzahlen rechnen ueber alle Benutzer',
    eEins?.testCount === 3 && eEins?.testAvg === 3.7 && eEins?.testLast === 5,
    JSON.stringify({ c: eEins?.testCount, a: eEins?.testAvg, l: eEins?.testLast }));

  /* --- Benutzerzahl und Rolle in den Einstellungen --- */
  const eStellE = (await eRuf('cookie-e-eins', 'GET', '/api/settings')).inhalt;
  const eStellZ = (await eRuf('cookie-e-zwei', 'GET', '/api/settings')).inhalt;
  pruefe('Die Einstellungen nennen die Zahl der Zugaenge',
    eStellE?.benutzerZahl === 3 && eStellZ?.benutzerZahl === 3,
    JSON.stringify([eStellE?.benutzerZahl, eStellZ?.benutzerZahl]));
  pruefe('Und sagen jedem, ob er Admin ist',
    eStellE?.istAdmin === true && eStellZ?.istAdmin === false,
    JSON.stringify([eStellE?.istAdmin, eStellZ?.istAdmin]));

  /* --- Die Klemme an den Kriterien -----------------------------------------
     Vier Wege, vier eigene Verweigerungen. Eine Pruefung, die nur den
     Erfolgsfall durchspielt, belegt kein Verbot -- deshalb
     steht zu jeder Verweigerung der Erfolgsfall des Admins daneben, und
     darunter die Nachschau, dass wirklich nichts geschehen ist. */
  const eVorher = (await eRuf('cookie-e-eins', 'GET', '/api/criteria')).inhalt;
  const eNeinAnlegen = await eRuf('cookie-e-zwei', 'POST', '/api/criteria', { name: 'Heimlich' });
  const eNeinUmbenennen = await eRuf('cookie-e-zwei', 'PUT', `/api/criteria/${eVorher[0].id}`, { name: 'Umgetauft' });
  const eNeinLoeschen = await eRuf('cookie-e-zwei', 'DELETE', `/api/criteria/${eVorher[0].id}`);
  const eNeinSortieren = await eRuf('cookie-e-zwei', 'PUT', '/api/criteria/order',
    { order: [...eVorher].reverse().map(c => c.id) });
  pruefe('Ein Benutzer legt kein Kriterium an', eNeinAnlegen.status === 403,
    `Status ${eNeinAnlegen.status}`);
  pruefe('Ein Benutzer benennt kein Kriterium um', eNeinUmbenennen.status === 403,
    `Status ${eNeinUmbenennen.status}`);
  pruefe('Ein Benutzer loescht kein Kriterium', eNeinLoeschen.status === 403,
    `Status ${eNeinLoeschen.status}`);
  pruefe('Ein Benutzer sortiert die Kriterien nicht um', eNeinSortieren.status === 403,
    `Status ${eNeinSortieren.status}`);
  const eNachher = (await eRuf('cookie-e-eins', 'GET', '/api/criteria')).inhalt;
  pruefe('Und die vier Absagen haben nichts veraendert',
    gleich(eNachher.map(c => c.name), eVorher.map(c => c.name)),
    JSON.stringify(eNachher.map(c => c.name)));

  const eJaAnlegen = await eRuf('cookie-e-eins', 'POST', '/api/criteria', { name: 'Verpackung' });
  const eJaUmbenennen = await eRuf('cookie-e-eins', 'PUT', `/api/criteria/${eVorher[3].id}`, { name: 'Kundendienst' });
  pruefe('Der Admin legt an und benennt um',
    eJaAnlegen.status === 201 && eJaUmbenennen.status === 200,
    `Status ${eJaAnlegen.status} / ${eJaUmbenennen.status}`);
  const eJaLoeschen = await eRuf('cookie-e-eins', 'DELETE', `/api/criteria/${eJaAnlegen.inhalt.id}`);
  pruefe('Und loescht wieder', eJaLoeschen.status === 204, `Status ${eJaLoeschen.status}`);

  /* ---------------------------------------------------------------- */
  gruppe('Gewichtung: der Rechenweg');

  /* DIESELBE PRUEFLAGE WIE DARUEBER, und das ist Absicht: mehrere Bewerter und
     ungleich viele Stimmen je Kriterium. An einer Lage mit einer Stimme je
     Kriterium belegte die wichtigste Pruefung dieser Runde zu wenig.
       Optik   5/3/1  -> 3,0   (drei Stimmen)
       Haptik  4/2    -> 3,0   (zwei Stimmen)
       Preis   5      -> 5,0   (eine Stimme)
       Kundendienst   -> gar nichts, faellt heraus
     ungewichtet: (3,0 + 3,0 + 5,0) / 3 = 3,7 */
  const gKrit = (await eRuf('cookie-e-eins', 'GET', '/api/criteria')).inhalt;
  const gId = (n) => gKrit.find(c => c.name === n)?.id;
  const gSetz = (name, wert, cookie = 'cookie-e-eins') =>
    eRuf(cookie, 'PUT', `/api/criteria/${gId(name)}`, { name, gewicht: wert });
  const gSchnitt = async (itemId = 1) =>
    (await eRuf('cookie-e-eins', 'GET', `/api/items/${itemId}`)).inhalt?.avgRating;
  // Abgefangen wie ueberall, wo die Spalte gelesen wird: ohne das reisst ein
  // Rueckbau der DDL den Lauf ab, statt rot zu werden (Stolperstein 103).
  const gGewichte = () => {
    const d = oeffne(path.join(stufeEDir, 'katalog.sqlite'));
    let z = [];
    try { z = d.prepare('SELECT name, gewicht FROM rating_criteria ORDER BY sort_order, id').all(); }
    catch { /* die Spalte fehlt -- die Pruefungen darauf werden rot */ }
    d.close();
    return z;
  };

  pruefe('Die Prueflage traegt vier Kriterien mit ungleich vielen Stimmen',
    gKrit?.length === 4 && gleich(gKrit.map(c => c.name), ['Optik', 'Haptik', 'Preis', 'Kundendienst']),
    JSON.stringify(gKrit?.map(c => c.name)));
  pruefe('Die Kriterienliste nennt das Gewicht',
    gKrit?.every(c => c.gewicht === 1), JSON.stringify(gKrit?.map(c => `${c.name}:${c.gewicht}`)));
  /* Stolperstein 102: was die Oberflaeche aus der Antwort liest, gehoert an
     der ECHTEN Antwort geprueft. Der Mock bringt gewicht selbst mit
     und koennte ein fehlendes Feld gar nicht bemerken. */
  const gDetail = (await eRuf('cookie-e-eins', 'GET', '/api/items/1')).inhalt;
  pruefe('Und jede Kriterienzeile am Eintrag traegt es ebenfalls',
    gDetail?.ratings?.length === 4 && gDetail.ratings.every(r => r.gewicht === 1),
    JSON.stringify(gDetail?.ratings?.map(r => `${r.name}:${r.gewicht}`)));

  /* DIE WICHTIGSTE PRUEFUNG DER RUNDE. Sie belegt, dass ein Einspielen dieser
     Version keine einzige angezeigte Zahl veraendert: bei Gewicht 1 ueberall
     ist der gewichtete Mittelwert bitgleich zum ungewichteten. Nachgerechnet
     wird die Gegenzahl HIER, aus den Zeilenwerten der Antwort -- eine fest
     hingeschriebene 3,7 belegte nur, dass irgendjemand einmal 3,7 getippt hat. */
  const gUngewichtet = (sicht) => {
    const w = (sicht?.ratings || []).filter(r => r.avg != null).map(r => r.avg);
    if (!w.length) return null;
    return Math.round((w.reduce((s, v) => s + v, 0) / w.length) * 10) / 10;
  };
  pruefe('Alle Gewichte 1: der Gesamtschnitt ist der ungewichtete',
    gDetail?.avgRating === gUngewichtet(gDetail) && gDetail?.avgRating === 3.7,
    `${gDetail?.avgRating} gegen ${gUngewichtet(gDetail)}`);

  /* --- Die Wirkung selbst --- */
  const gOptik2 = await gSetz('Optik', 2);
  pruefe('Der Admin setzt ein Gewicht', gOptik2.status === 200 && gOptik2.inhalt?.gewicht === 2,
    `Status ${gOptik2.status}, ${JSON.stringify(gOptik2.inhalt)}`);
  /* (3,0*2 + 3,0*1 + 5,0*1) / 4 = 3,5 -- und ausdruecklich nicht mehr 3,7. */
  pruefe('Und der Gesamtschnitt folgt', (await gSchnitt()) === 3.5, `${await gSchnitt()}`);
  pruefe('Er ist ausdruecklich nicht mehr der ungewichtete', (await gSchnitt()) !== 3.7);
  /* Der Schnitt JE KRITERIUM bleibt ungewichtet: er ist eine Aussage ueber das
     Kriterium, nicht ueber den Eintrag -- ihn zu gewichten hiesse, ihn mit
     sich selbst zu gewichten. */
  const gNachOptik = (await eRuf('cookie-e-eins', 'GET', '/api/items/1')).inhalt;
  pruefe('Der Schnitt je Kriterium bleibt ungewichtet',
    gNachOptik?.ratings?.find(r => r.name === 'Optik')?.avg === 3 &&
    gNachOptik?.ratings?.find(r => r.name === 'Optik')?.count === 3,
    JSON.stringify(gNachOptik?.ratings?.map(r => `${r.name}:${r.avg}/${r.count}`)));

  /* DIE FALLE. Ein UNBEWERTETES Kriterium darf sein Gewicht nicht in den
     Nenner bringen. Kundendienst hat an diesem Eintrag keine einzige Stimme;
     ein Nenner ueber ALLE Kriterien -- etwa SUM(gewicht) ueber die Tabelle --
     ergaebe hier 14/6 = 2,3 statt 14/4 = 3,5. */
  await gSetz('Kundendienst', 2);
  pruefe('Ein unbewertetes Kriterium bringt sein Gewicht NICHT in den Nenner',
    (await gSchnitt()) === 3.5, `${await gSchnitt()}`);
  /* Und derselbe Fall in seiner schaerfsten Form, am zweiten Eintrag: dort ist
     NUR Optik bewertet (eine Stimme, Wert 4). Mit Optik auf 0,2 und den
     anderen dreien auf 2 muss die Zahl 4,0 sein -- ein falscher Nenner
     ergaebe 4*0,2 / (0,2+2+2+2) = 0,1 und damit einen Eintrag unter 1. */
  await gSetz('Optik', 0.2); await gSetz('Haptik', 2); await gSetz('Preis', 2);
  pruefe('Ist nur ein Kriterium bewertet, zaehlt allein dessen Gewicht',
    (await gSchnitt(2)) === 4, `${await gSchnitt(2)}`);
  pruefe('Und der Eintrag rutscht damit nicht unter 1',
    (await gSchnitt(2)) >= 1 && (await gSchnitt(2)) <= 5, `${await gSchnitt(2)}`);

  /* --- Die zugesicherten Grenzen, unter Last --- */
  const gExtrem = (await eRuf('cookie-e-eins', 'POST', '/api/items', { title: 'Grenzfall' })).inhalt;
  const gWerte = async (paare) => {
    for (const [name, wert] of paare)
      await eRuf('cookie-e-eins', 'PUT', `/api/items/${gExtrem.id}/ratings`,
        { criterionId: gId(name), value: wert });
    return (await eRuf('cookie-e-eins', 'GET', `/api/items/${gExtrem.id}`)).inhalt?.avgRating;
  };
  // Gewichte stehen gemischt: Optik 0,2 · Haptik 2 · Preis 2 · Kundendienst 2.
  pruefe('Alle Werte 5 bei gemischten Gewichten ergeben genau 5,0',
    (await gWerte([['Optik', 5], ['Haptik', 5], ['Preis', 5], ['Kundendienst', 5]])) === 5);
  pruefe('Alle Werte 1 ergeben genau 1,0',
    (await gWerte([['Optik', 1], ['Haptik', 1], ['Preis', 1], ['Kundendienst', 1]])) === 1);
  /* Der Extremfall: der kleinste Wert am kleinsten Gewicht gegen den groessten
     am groessten. (1*0,2 + 5*2) / 2,2 = 4,64 -> 4,6. */
  const gGegen = await gWerte([['Optik', 1], ['Haptik', 5], ['Preis', 0], ['Kundendienst', 0]]);
  pruefe('1 bei 0,2 gegen 5 bei 2 bleibt zwischen 1 und 5',
    gGegen === 4.6 && gGegen >= 1 && gGegen <= 5, `${gGegen}`);

  /* --- Die Wirkung erreicht die Uebersicht --- */
  /* Sortiert wird im Klienten ueber avgRating (app.js: rating_desc). Geprueft
     wird deshalb, dass /api/items die Zahlen so liefert, dass sich die
     Reihenfolge dreht -- mit derselben Formel wie dort. */
  const gRangfolge = async () => {
    const liste = (await eRuf('cookie-e-eins', 'GET', '/api/items')).inhalt || [];
    return [...liste].sort((a, b2) => (b2.avgRating ?? -1) - (a.avgRating ?? -1)).map(i => i.id);
  };
  await gSetz('Optik', 2); await gSetz('Haptik', 0.2);
  const gRangA = await gRangfolge();
  await gSetz('Optik', 0.2); await gSetz('Haptik', 2);
  const gRangB = await gRangfolge();
  pruefe('Ein Gewichtswechsel dreht die Rangfolge der Uebersicht',
    !gleich(gRangA, gRangB), `${JSON.stringify(gRangA)} gegen ${JSON.stringify(gRangB)}`);

  /* Ein Gewicht ist keine Aenderung AM EINTRAG. Ruehrte es updated_at an,
     sortierte sich die Uebersicht bei jedem Dreh am Gewicht um. */
  const gStand = () => {
    const d = oeffne(path.join(stufeEDir, 'katalog.sqlite'));
    const z = d.prepare('SELECT id, updated_at FROM items ORDER BY id').all();
    d.close();
    return z.map(i => `${i.id}:${i.updated_at}`);
  };
  const gVorZeit = gStand();
  await gSetz('Preis', 1.5);
  pruefe('Ein Gewichtswechsel ruehrt updated_at nicht an',
    gleich(gVorZeit, gStand()), JSON.stringify([gVorZeit, gStand()]));

  /* ---------------------------------------------------------------- */
  gruppe('Gewichtung: was angenommen wird und was nicht');

  const gAlt = gGewichte().find(c => c.name === 'Preis')?.gewicht;
  /* ABGEWIESEN WIRD, WAS ETWAS ANDERES BEDEUTET. Null und alles Negative sind
     ausdruecklich dabei: bei 0 ginge die Division nicht auf, ein negatives
     Gewicht kehrte die Aussage um. */
  const gAbweisungen = [
    ['0', 0], ['-1', -1], ['-1,5', -1.5], ['2,1', 2.1], ['3', 3], ['0,19', 0.19],
    ['"abc"', 'abc'], ['null', null], ['Infinity', 'Infinity'], ['leerer Text', '']
  ];
  for (const [wie, was] of gAbweisungen) {
    const a = await gSetz('Preis', was);
    pruefe(`Abgewiesen mit 400: ${wie}`, a.status === 400, `Status ${a.status}, ${JSON.stringify(a.inhalt)}`);
  }
  pruefe('Und nach allen Absagen steht der alte Wert unveraendert in der Datenbank',
    gGewichte().find(c => c.name === 'Preis')?.gewicht === gAlt,
    JSON.stringify(gGewichte()));
  /* Die Meldung steht in einem deutschen Satz und traegt deshalb ein Komma.
     "zwischen 0.2 und 2" waere ein Punkt mitten im Satz. */
  const gMeldung = (await gSetz('Preis', 9)).inhalt?.error || '';
  pruefe('Die Absage nennt die Spanne mit Komma, nicht mit Punkt',
    /0,2/.test(gMeldung) && !/0\.2/.test(gMeldung), JSON.stringify(gMeldung));

  /* GERUNDET WIRD, WAS DASSELBE BEDEUTET. 1,234 und 1,23 sind dieselbe
     Aussage; die Antwort traegt den gespeicherten Wert, damit das Feld die
     Rundung zeigen kann -- gerundet, aber nicht still. */
  const gRund = await gSetz('Preis', 1.234);
  pruefe('Feiner als ein Hundertstel wird gerundet statt abgewiesen',
    gRund.status === 200 && gRund.inhalt?.gewicht === 1.23,
    `Status ${gRund.status}, ${JSON.stringify(gRund.inhalt?.gewicht)}`);
  pruefe('Und die Rundung steht so in der Datenbank',
    gGewichte().find(c => c.name === 'Preis')?.gewicht === 1.23, JSON.stringify(gGewichte()));
  for (const [wie, was, soll] of [['0,2', 0.2, 0.2], ['2', 2, 2], ['1,25', 1.25, 1.25]]) {
    const a = await gSetz('Preis', was);
    pruefe(`Angenommen: ${wie}`, a.status === 200 && a.inhalt?.gewicht === soll,
      `Status ${a.status}, ${JSON.stringify(a.inhalt?.gewicht)}`);
  }

  /* Das Umbenennen schickt kein Gewicht -- und darf es deshalb auch nicht
     zuruecksetzen. Ohne COALESCE stuende hier nach jedem ✎ wieder 1. */
  await gSetz('Preis', 1.5);
  const gUmbenannt = await eRuf('cookie-e-eins', 'PUT', `/api/criteria/${gId('Preis')}`, { name: 'Preis' });
  pruefe('Umbenennen ohne Gewichtsangabe laesst das Gewicht stehen',
    gUmbenannt.inhalt?.gewicht === 1.5, JSON.stringify(gUmbenannt.inhalt));
  /* Ein neu angelegtes Kriterium startet auf der Vorgabe -- POST nimmt gar
     kein Gewicht entgegen, und die Vorgabe steht nur in der DDL. */
  const gNeu = await eRuf('cookie-e-eins', 'POST', '/api/criteria', { name: 'Frisch', gewicht: 2 });
  pruefe('Ein neues Kriterium startet auf 1, auch wenn ein Gewicht mitkommt',
    gNeu.status === 201 && gNeu.inhalt?.gewicht === 1, JSON.stringify(gNeu.inhalt));
  await eRuf('cookie-e-eins', 'DELETE', `/api/criteria/${gNeu.inhalt.id}`);

  /* --- Die Klemme: zwei vorbereitete Sitzungen, echte zweite Cookie ---------
     Zu jeder Verweigerung der Erfolgsfall daneben und die Nachschau, dass
     nichts geschrieben wurde (Stolperstein 3). */
  const gVorRecht = gGewichte().find(c => c.name === 'Preis')?.gewicht;
  const gNein = await gSetz('Preis', 0.5, 'cookie-e-zwei');
  pruefe('Ein gewoehnlicher Benutzer setzt kein Gewicht', gNein.status === 403,
    `Status ${gNein.status}`);
  pruefe('Und nach dem 403 steht der alte Wert unveraendert in der Datenbank',
    gGewichte().find(c => c.name === 'Preis')?.gewicht === gVorRecht,
    JSON.stringify(gGewichte()));
  const gJa = await gSetz('Preis', 0.5, 'cookie-e-eins');
  pruefe('Der Admin setzt es', gJa.status === 200 && gJa.inhalt?.gewicht === 0.5,
    `Status ${gJa.status}, ${JSON.stringify(gJa.inhalt)}`);

  /* --- Export und Import der Gewichte --- */
  await gSetz('Optik', 1); await gSetz('Haptik', 1.5);
  await gSetz('Preis', 1); await gSetz('Kundendienst', 1);
  const gAus = (await eRuf('cookie-e-eins', 'GET', '/api/export?photos=0')).inhalt;
  pruefe('Die Formatnummer steht auf 10', gAus?.version === 10, JSON.stringify(gAus?.version));
  pruefe('criteria bleibt eine Liste von Namen',
    Array.isArray(gAus?.criteria) && gAus.criteria.every(n => typeof n === 'string'),
    JSON.stringify(gAus?.criteria));
  pruefe('Der Export nennt die Gewichte in einem eigenen Feld',
    gAus?.criteriaGewichte?.Haptik === 1.5, JSON.stringify(gAus?.criteriaGewichte));
  /* NUR ABWEICHUNGEN. Stuenden die Einsen mit drin, waere die Datei eines
     ungewichteten Bestands nicht mehr zeichengleich zu der von vorher. */
  pruefe('Und nur die Abweichungen -- ein Kriterium mit Gewicht 1 fehlt darin',
    gleich(Object.keys(gAus?.criteriaGewichte || {}), ['Haptik']),
    JSON.stringify(gAus?.criteriaGewichte));
  await gSetz('Haptik', 1);
  const gAusGleich = (await eRuf('cookie-e-eins', 'GET', '/api/export?photos=0')).inhalt;
  pruefe('Ein ungewichteter Bestand ergibt ein leeres Feld',
    gAusGleich?.criteriaGewichte && Object.keys(gAusGleich.criteriaGewichte).length === 0,
    JSON.stringify(gAusGleich?.criteriaGewichte));

  await SE1.stopp();
  fs.rmSync(stufeEDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Verfasser in Export und Import');

  /* Ein Bestand mit drei Verfassern und einer herrenlosen Zeile, aus drei
     fertigen Sitzungen.
     Der Bestand ist bewusst schief gebaut:
       - ZWEI Testtage am SELBEN Datum von zwei Verfassern, BEIDE mit einem
         Tag. Das ist der eigentliche Pruefstein: fielen sie beim
         Einspielen auf eine Zeile zusammen, gingen die Tags der ersten
         ueber ON DELETE CASCADE lautlos mit.
       - ZWEI Bewertungen zum SELBEN Kriterium von zwei Verfassern.
       - EINE herrenlose Zeile (user_id NULL, moeglich ueber ON DELETE SET NULL).
     Die drei Vorgabekriterien aus db.js werden geraeumt und die eigenen Ids
     abgeholt statt geraten. */
  function legeVerfasserBestandAn() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-stufee2-'));
    kurzlauf(`require('./db'); console.log('da');`, dir);
    const d = oeffne(path.join(dir, 'katalog.sqlite'));
    for (const n of ['anna', 'bert', 'carla'])
      d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(n, 'x');
    for (const [t, u] of [['cookie-e2-anna', 1], ['cookie-e2-bert', 2], ['cookie-e2-carla', 3]])
      d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(t, u);
    d.prepare('INSERT INTO items (title, user_id) VALUES (?, 1)').run('Rundlauf');
    d.prepare('INSERT INTO items (title, user_id) VALUES (?, 2)').run('Von Bert');
    d.prepare('DELETE FROM rating_criteria').run();
    const kId = {};
    ['Optik', 'Haptik'].forEach((n, i) => {
      kId[n] = d.prepare('INSERT INTO rating_criteria (name, sort_order) VALUES (?, ?)')
        .run(n, i).lastInsertRowid;
    });
    for (const [kr, w, u] of [['Optik', 5, 1], ['Optik', 3, 2], ['Haptik', 4, 3]])
      d.prepare('INSERT INTO ratings (item_id, criterion_id, value, user_id) VALUES (1, ?, ?, ?)')
        .run(kId[kr], w, u);
    for (const [n] of [['Regen'], ['Sonne']]) d.prepare('INSERT INTO tags (name) VALUES (?)').run(n);
    const tg = (n) => d.prepare('SELECT id FROM tags WHERE name = ?').get(n).id;
    for (const [tag, note, u, marke] of [['2024-03-01', 4, 1, 'Regen'], ['2024-03-01', 2, 2, 'Sonne']]) {
      const td = d.prepare('INSERT INTO test_days (item_id, day, rating, user_id) VALUES (1, ?, ?, ?)')
        .run(tag, note, u).lastInsertRowid;
      d.prepare('INSERT INTO test_day_tags (test_day_id, tag_id) VALUES (?, ?)').run(td, tg(marke));
    }
    d.prepare('UPDATE items SET tested = 1 WHERE id = 1').run();
    for (const [text, u] of [['Kommentar von Anna', 1], ['Kommentar von Carla', 3],
                             ['Kommentar ohne Verfasser', 3]])
      d.prepare('INSERT INTO comments (item_id, text, user_id) VALUES (1, ?, ?)').run(text, u);
    // Der fuenfte Traeger: drei Zeilen an EINEM Eintrag, damit "der Link
    // gehoert seinem Eintrager" von "der Link gehoert dem Eintragsverfasser"
    // ueberhaupt zu unterscheiden ist. Die dritte wird nach dem Start
    // herrenlos gemacht, wie der Kommentar daneben.
    for (const [url, u, pos] of [['https://link-von-anna.test', 1, 0],
                                 ['https://link-von-carla.test', 3, 1],
                                 ['https://link-ohne-verfasser.test', 3, 2]])
      d.prepare('INSERT INTO links (item_id, url, sort_order, user_id) VALUES (1, ?, ?, ?)')
        .run(url, pos, u);
    // Und der sechste Traeger, mit denselben Lagen: zwei Verfasser, dazu eine
    // Zeile, die nach dem Start herrenlos gemacht wird.
    for (const [name, u, pos] of [['datei-von-anna.txt', 1, 0],
                                  ['datei-von-carla.txt', 3, 1],
                                  ['datei-ohne-verfasser.txt', 3, 2]])
      d.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order, user_id)
                 VALUES (1, ?, 'text/plain', 3, ?, ?, ?)`).run(name, Buffer.from('abc'), pos, u);
    // Anna markiert den zweiten Eintrag als Favorit -- fuer die Probe, dass
    // der Favorit NICHT mitwandert, sondern beim Exportierenden bleibt.
    d.prepare('INSERT INTO item_pins (user_id, item_id) VALUES (1, 2)').run();
    d.close();
    return dir;
  }

  const e2Dir = legeVerfasserBestandAn();
  const SE2 = starteWeiterenServer(e2Dir, {}, 5620);
  await SE2.bereit;

  const e2Ruf = async (cookieWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${cookieWert}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(SE2.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };
  // Eigene Ausfertigung von sendeImport: die vorhandene haengt fest am
  // Hauptserver und an dessen Cookie, hier braucht es drei nebeneinander.
  const e2Import = async (cookieWert, objekt, modus) => {
    const grenze = '----pruefunge2' + crypto.randomBytes(6).toString('hex');
    const teil = (name, wert, dateiname) =>
      `--${grenze}\r\nContent-Disposition: form-data; name="${name}"` +
      (dateiname ? `; filename="${dateiname}"\r\nContent-Type: application/json` : '') +
      `\r\n\r\n${wert}\r\n`;
    const koerper = teil('mode', modus) + teil('file', JSON.stringify(objekt), 'export.json') + `--${grenze}--\r\n`;
    const a = await fetch(SE2.basis + '/api/import', {
      method: 'POST',
      headers: { cookie: `kriterion_session=${cookieWert}`, 'content-type': `multipart/form-data; boundary=${grenze}` },
      body: koerper
    });
    return { status: a.status, inhalt: await a.json().catch(() => null) };
  };
  // Nachsehen, wem eine Zeile wirklich gehoert -- ueber den Namen, nicht ueber
  // die Id: nach einem ersetzenden Import sind die Ids der Eintraege neu.
  const e2Datenbank = () => oeffne(path.join(e2Dir, 'katalog.sqlite'));
  const e2Namen = (sql, ...werte) => {
    const d = e2Datenbank();
    const zeilen = d.prepare(sql).all(...werte);
    d.close();
    return zeilen;
  };

  /* Die herrenlose Zeile wird ERST JETZT gesetzt, nach dem Start -- und das ist
     kein Schoenheitsfehler, sondern der einzige Weg. Beim Anlegen des Bestands
     eingetragen ueberlebt sie den Start nicht: ordneBestandZu() laeuft bei
     JEDEM Start und weist alles Herrenlose dem Eigentuemer zu. Die Zeile stuende
     danach auf anna, und die Pruefung bestaetigte etwas anderes, als sie zu
     bestaetigen vorgibt: der Aufbau des Prueflaufs raeumte die
     Lage weg, die geprueft werden soll.
     Ein zweiter Schreiber neben dem laufenden Server ist im WAL-Modus erlaubt;
     die Wartezeit steht sicherheitshalber dabei. */
  {
    const d = e2Datenbank();
    d.pragma('busy_timeout = 4000');
    d.prepare('UPDATE comments SET user_id = NULL WHERE text = ?').run('Kommentar ohne Verfasser');
    d.prepare('UPDATE links SET user_id = NULL WHERE url = ?').run('https://link-ohne-verfasser.test');
    d.prepare('UPDATE attachments SET user_id = NULL WHERE filename = ?').run('datei-ohne-verfasser.txt');
    d.close();
  }

  /* --- Der Export nennt die Verfasser --- */
  const e2Aus = (await e2Ruf('cookie-e2-anna', 'GET', '/api/export?photos=0')).inhalt;
  const e2Eintrag = e2Aus?.items?.find(i => i.title === 'Rundlauf');
  const e2Zweiter = e2Aus?.items?.find(i => i.title === 'Von Bert');

  pruefe('Der Export nennt den Verfasser des Eintrags',
    e2Eintrag?.author === 'anna' && e2Zweiter?.author === 'bert',
    JSON.stringify(e2Aus?.items?.map(i => `${i.title}:${i.author}`)));
  pruefe('Der Export nennt den Verfasser jeder Bewertung',
    gleich((e2Eintrag?.ratings || []).map(r => `${r.name}/${r.value}/${r.author}`),
           ['Optik/5/anna', 'Optik/3/bert', 'Haptik/4/carla']),
    JSON.stringify(e2Eintrag?.ratings));
  pruefe('Der Export nennt den Verfasser jedes Testtags',
    gleich((e2Eintrag?.testDays || []).map(t => `${t.day}/${t.rating}/${t.author}`),
           ['2024-03-01/4/anna', '2024-03-01/2/bert']),
    JSON.stringify(e2Eintrag?.testDays));
  pruefe('Der Export nennt den Verfasser jedes Kommentars',
    gleich((e2Eintrag?.comments || []).map(c => c.author), ['anna', 'carla', null]),
    JSON.stringify(e2Eintrag?.comments?.map(c => `${c.text}:${c.author}`)));
  /* Der fuenfte Traeger. Die Reihenfolge ist die der Sortiernummer, und die
     herrenlose Zeile nennt ausdruecklich null -- sonst waere "kein Verfasser"
     von "altes Dateiformat" nicht zu unterscheiden. */
  pruefe('Der Export nennt den Verfasser jeder Linkzeile',
    gleich((e2Eintrag?.links || []).map(l => `${l.url}/${l.author}`),
           ['https://link-von-anna.test/anna', 'https://link-von-carla.test/carla',
            'https://link-ohne-verfasser.test/null']),
    JSON.stringify(e2Eintrag?.links));
  // Eine nackte Id liest niemand, und in einer Datei, die das Haus verlaesst,
  // hat sie nichts verloren.
  pruefe('Der Export nennt nirgends die Verfasser-Id',
    !/"user_id"/.test(JSON.stringify(e2Aus)),
    JSON.stringify(e2Aus).slice(0, 200));
  // Eine herrenlose Zeile sagt das ausdruecklich, statt das Feld wegzulassen --
  // sonst waere "kein Verfasser" von "altes Dateiformat" nicht zu unterscheiden.
  pruefe('Eine herrenlose Zeile nennt ausdruecklich null',
    e2Eintrag?.comments?.find(c => c.text === 'Kommentar ohne Verfasser')?.author === null &&
    'author' in (e2Eintrag?.comments?.find(c => c.text === 'Kommentar ohne Verfasser') || {}),
    JSON.stringify(e2Eintrag?.comments?.find(c => c.text === 'Kommentar ohne Verfasser')));
  pruefe('Die Formatnummer der Datei steht auf 10', e2Aus?.version === 10, JSON.stringify(e2Aus?.version));

  /* Der sechste Traeger steht nur in einem Export MIT Dateien -- deshalb ein
     zweiter Ruf. Dieselben drei Lagen wie an der Linkzeile, und die herrenlose
     nennt wieder ausdruecklich null. */
  const e2MitDateien = (await e2Ruf('cookie-e2-anna', 'GET', '/api/export?photos=0&files=1')).inhalt;
  const e2DateiEintrag = e2MitDateien?.items?.find(i => i.title === 'Rundlauf');
  pruefe('Ein Export mit Dateien traegt sie ueberhaupt',
    (e2DateiEintrag?.attachments || []).length === 3,
    JSON.stringify((e2DateiEintrag?.attachments || []).map(a2 => a2.filename)));
  pruefe('Der Export nennt den Verfasser jeder Datei',
    gleich((e2DateiEintrag?.attachments || []).map(a2 => `${a2.filename}/${a2.author}`),
           ['datei-von-anna.txt/anna', 'datei-von-carla.txt/carla',
            'datei-ohne-verfasser.txt/null']),
    JSON.stringify((e2DateiEintrag?.attachments || []).map(a2 => `${a2.filename}/${a2.author}`)));
  // Ohne den Schalter bleiben die Dateien weg -- unveraendert, und die
  // Verfasserangabe aendert daran nichts.
  pruefe('Ohne den Schalter bleiben die Dateien weiterhin weg',
    gleich(e2Eintrag?.attachments, []), JSON.stringify(e2Eintrag?.attachments));
  // Der Favorit ist KEIN Inhalt: er bleibt der des Exportierenden, auch
  // wenn der Eintrag jemand anderem gehoert.
  pruefe('Der Favorit bleibt der des Exportierenden',
    e2Zweiter?.favorite === true && e2Eintrag?.favorite === false,
    JSON.stringify(e2Aus?.items?.map(i => `${i.title}:${i.favorite}`)));

  /* --- Der Rundlauf: exportieren, ersetzend einspielen, nachsehen ----------
     EINGESPIELT WIRD ALS ANNA, und zwar gezwungenermassen: der
     Import liegt hinter dem Eigentuemer, und das ist hier der Zugang
     mit der kleinsten id.
     Die Pruefung verliert dadurch nichts. Ihr Kern ist "bliebe die Zuordnung
     aus, fiele alles an den Einspielenden" -- und anna hat nur einen Teil des
     Bestands geschrieben: berts Eintrag, berts und carlas Bewertungen, berts
     Testtag und carlas Kommentar fielen ihr weiterhin zu. Die Gegenprobe
     (Zuordnung entfernt) macht sie unveraendert rot. */
  const e2Rund = await e2Import('cookie-e2-anna', e2Aus, 'replace');
  pruefe('Der ersetzende Rundlauf gelingt', e2Rund.status === 200, JSON.stringify(e2Rund.inhalt));
  pruefe('Und meldet keinen unbekannten Verfasser',
    gleich(e2Rund.inhalt?.verfasserUnbekannt, []), JSON.stringify(e2Rund.inhalt?.verfasserUnbekannt));

  const e2NachRund = e2Namen(`SELECT i.title, u.username FROM items i
                              LEFT JOIN users u ON u.id = i.user_id ORDER BY i.title`);
  pruefe('Nach dem Rundlauf gehoert jeder Eintrag wieder seinem Verfasser',
    gleich(e2NachRund.map(z => `${z.title}:${z.username}`), ['Rundlauf:anna', 'Von Bert:bert']),
    JSON.stringify(e2NachRund));

  const e2RundBew = e2Namen(`SELECT c.name, r.value, u.username FROM ratings r
                             JOIN rating_criteria c ON c.id = r.criterion_id
                             LEFT JOIN users u ON u.id = r.user_id
                             ORDER BY c.sort_order, r.value DESC`);
  pruefe('Zwei Bewertungen zum selben Kriterium bleiben zwei Zeilen',
    gleich(e2RundBew.map(z => `${z.name}/${z.value}/${z.username}`),
           ['Optik/5/anna', 'Optik/3/bert', 'Haptik/4/carla']),
    JSON.stringify(e2RundBew));

  const e2RundTage = e2Namen(`SELECT t.day, t.rating, u.username FROM test_days t
                              LEFT JOIN users u ON u.id = t.user_id ORDER BY t.rating DESC`);
  pruefe('Zwei Testtage am selben Datum bleiben zwei Zeilen',
    gleich(e2RundTage.map(z => `${z.day}/${z.rating}/${z.username}`),
           ['2024-03-01/4/anna', '2024-03-01/2/bert']),
    JSON.stringify(e2RundTage));
  /* Der eigentliche Beweis: INSERT OR REPLACE
     LOESCHT die getroffene Zeile, und ueber ON DELETE CASCADE gehen deren Tags
     mit. Fielen die beiden Testtage auf eine Zeile zusammen, ueberlebte genau
     ein Tag -- und zwar lautlos. */
  const e2RundTagtags = e2Namen(`SELECT t.rating, g.name FROM test_day_tags dt
                                 JOIN test_days t ON t.id = dt.test_day_id
                                 JOIN tags g ON g.id = dt.tag_id ORDER BY t.rating DESC`);
  pruefe('Und behalten beide ihre Tags',
    gleich(e2RundTagtags.map(z => `${z.rating}:${z.name}`), ['4:Regen', '2:Sonne']),
    JSON.stringify(e2RundTagtags));

  const e2RundLinks = e2Namen(`SELECT l.url, u.username FROM links l
                               LEFT JOIN users u ON u.id = l.user_id ORDER BY l.sort_order, l.id`);
  /* Ohne das Feld author im Export kaemen alle drei Zeilen bei anna an -- die
     Pruefung waere dann an genau einem Namen zu erkennen: carla. */
  pruefe('Nach dem Rundlauf gehoert jede Linkzeile wieder ihrem Eintrager',
    gleich(e2RundLinks.map(z => `${z.url}:${z.username}`),
           ['https://link-von-anna.test:anna', 'https://link-von-carla.test:carla',
            'https://link-ohne-verfasser.test:anna']),
    JSON.stringify(e2RundLinks));

  const e2RundKom = e2Namen(`SELECT c.text, u.username FROM comments c
                             LEFT JOIN users u ON u.id = c.user_id ORDER BY c.id`);
  pruefe('Nach dem Rundlauf gehoert jeder Kommentar wieder seinem Verfasser',
    gleich(e2RundKom.map(z => `${z.text}:${z.username}`),
           ['Kommentar von Anna:anna', 'Kommentar von Carla:carla',
            'Kommentar ohne Verfasser:anna']),
    JSON.stringify(e2RundKom));
  // Die herrenlose Zeile ist der Grenzfall: author null heisst "kein Name
  // genannt" und faellt damit an den Einspielenden, wie eine alte Datei.
  // Der Einspielende ist hier anna. Die Zeile belegt damit nicht
  // "faellt NICHT an ihren alten Besitzer", wohl aber ihren eigenen Rueckfall:
  // liefert verfasser(null) irgendwann null statt des Einspielenden, steht hier
  // wieder null und die Pruefung wird rot.
  pruefe('Eine herrenlose Zeile faellt an den Einspielenden',
    e2RundKom.find(z => z.text === 'Kommentar ohne Verfasser')?.username === 'anna',
    JSON.stringify(e2RundKom.find(z => z.text === 'Kommentar ohne Verfasser')));
  // Der Favorit wandert nicht mit dem Eintrag: er gehoert dem Einspielenden.
  // Der Eintrag "Von Bert" faellt an bert, der Favorit daran an anna.
  const e2RundPins = e2Namen(`SELECT i.title, u.username FROM item_pins p
                              JOIN items i ON i.id = p.item_id
                              JOIN users u ON u.id = p.user_id`);
  pruefe('Der Import legt den Favoriten beim Einspielenden an',
    gleich(e2RundPins.map(z => `${z.title}:${z.username}`), ['Von Bert:anna']),
    JSON.stringify(e2RundPins));
  // Der ersetzende Import ruehrt users und
  // sessions nicht an -- taete er es, sperrte er im schlimmsten Fall alle aus.
  const e2Zugaenge = e2Namen('SELECT username FROM users ORDER BY id');
  const e2Sitzungen = e2Namen('SELECT token FROM sessions ORDER BY token');
  pruefe('Der ersetzende Import laesst die Zugaenge unberuehrt',
    gleich(e2Zugaenge.map(z => z.username), ['anna', 'bert', 'carla']), JSON.stringify(e2Zugaenge));
  pruefe('Und die Sitzungen ebenfalls',
    e2Sitzungen.length === 3, JSON.stringify(e2Sitzungen.map(z => z.token)));

  /* --- Namen, die es nicht gibt, und Namen in anderer Schreibweise --- */
  /* Eingespielt wird als anna (Eigentuemerin, die einzige, die es darf).
     DER GEPRUEFTE NAME DARF DESHALB NICHT 'ANNA' SEIN: faellt eine
     Zeile an den Einspielenden, steht dort ohnehin anna -- die Pruefung auf
     die Schreibweise koennte dann gar nicht scheitern, egal ob COLLATE
     NOCASE wirkt oder nicht. Der Grossbuchstabenname ist deshalb
     'BERT'. */
  const e2Fremd = await e2Import('cookie-e2-anna', { version: 6, title: 'F', items: [{
    title: 'Fremde Namen',
    author: 'BERT',
    comments: [{ text: 'von unbekannt', author: 'dora' },
               { text: 'mit Leerzeichen', author: 'bert ' },
               { text: 'ohne Angabe' },
               { text: 'von carla selbst', author: 'carla' }],
    ratings: [{ name: 'Optik', value: 2, author: 'Bert' }],
    testDays: [{ day: '2025-01-01', rating: 3, author: 'dora' }] }] }, 'merge');
  pruefe('Import mit fremden Namen gelingt', e2Fremd.status === 200, JSON.stringify(e2Fremd.inhalt));

  const e2FremdE = e2Namen(`SELECT i.title, u.username FROM items i
                            LEFT JOIN users u ON u.id = i.user_id WHERE i.title = ?`, 'Fremde Namen');
  // COLLATE NOCASE steht an der Spalte username -- dieselbe Spalte, ueber die
  // sich auch die Anmeldung den Kandidaten sucht.
  pruefe('Gross- und Kleinschreibung entscheidet nicht',
    e2FremdE[0]?.username === 'bert', JSON.stringify(e2FremdE));
  const e2FremdK = e2Namen(`SELECT c.text, u.username FROM comments c
                            JOIN items i ON i.id = c.item_id
                            LEFT JOIN users u ON u.id = c.user_id
                            WHERE i.title = ? ORDER BY c.id`, 'Fremde Namen');
  pruefe('Ein unbekannter Name faellt an den Einspielenden',
    e2FremdK.find(z => z.text === 'von unbekannt')?.username === 'anna',
    JSON.stringify(e2FremdK));
  // Nachgestellt vor dem Bauen: "anna " trifft die Spalte NICHT, obwohl sie
  // COLLATE NOCASE traegt. Ohne trim() faellt jeder Name mit Leerzeichen still
  // an den Einspielenden.
  pruefe('Ein nachlaufendes Leerzeichen entscheidet ebenfalls nicht',
    e2FremdK.find(z => z.text === 'mit Leerzeichen')?.username === 'bert',
    JSON.stringify(e2FremdK));
  pruefe('Ein Kommentar ohne Angabe faellt an den Einspielenden',
    e2FremdK.find(z => z.text === 'ohne Angabe')?.username === 'anna',
    JSON.stringify(e2FremdK));
  const e2FremdB = e2Namen(`SELECT r.value, u.username FROM ratings r
                            JOIN items i ON i.id = r.item_id
                            LEFT JOIN users u ON u.id = r.user_id WHERE i.title = ?`, 'Fremde Namen');
  const e2FremdT = e2Namen(`SELECT t.day, u.username FROM test_days t
                            JOIN items i ON i.id = t.item_id
                            LEFT JOIN users u ON u.id = t.user_id WHERE i.title = ?`, 'Fremde Namen');
  pruefe('Auch Bewertung und Testtag folgen der Regel',
    e2FremdB[0]?.username === 'bert' && e2FremdT[0]?.username === 'anna',
    JSON.stringify([e2FremdB, e2FremdT]));
  // Die laute Haelfte: ohne sie zoege beim Einspielen einer fremden Sicherung
  // der gesamte Bestand wortlos um.
  pruefe('Die Antwort nennt die unbekannten Namen',
    gleich(e2Fremd.inhalt?.verfasserUnbekannt, ['dora']),
    JSON.stringify(e2Fremd.inhalt?.verfasserUnbekannt));
  // Gezaehlt werden nur FREMDE Zuordnungen: 'BERT' am Eintrag, 'bert ' am
  // Kommentar, 'carla' am Kommentar, 'Bert' an der Bewertung -- vier. 'ohne
  // Angabe' nennt niemanden, 'dora' gibt es nicht, und anna ist der
  // Einspielende selbst.
  pruefe('Und zaehlt nur die wirklich fremden Zuordnungen',
    e2Fremd.inhalt?.verfasserZugeordnet === 4,
    JSON.stringify(e2Fremd.inhalt?.verfasserZugeordnet));
  /* Ein unbekannter Name darf keinen Zugang anlegen -- sonst waere eine
     Exportdatei ein Weg an der Verwaltung und am Passwort vorbei. */
  const e2NachFremd = e2Namen('SELECT username FROM users ORDER BY id');
  pruefe('Ein unbekannter Name legt keinen Zugang an',
    gleich(e2NachFremd.map(z => z.username), ['anna', 'bert', 'carla']),
    JSON.stringify(e2NachFremd));

  /* --- Aeltere Datei, die gar keinen Verfasser kennt --- */
  const e2Alt = await e2Import('cookie-e2-anna', { version: 5, title: 'A', items: [{
    title: 'Alte Datei',
    comments: [{ text: 'alt und ohne Verfasser' }],
    ratings: [{ name: 'Optik', value: 4 }],
    testDays: [{ day: '2023-02-02', rating: 2 }] }] }, 'merge');
  pruefe('Eine Datei ohne Verfasserfeld laesst sich weiterhin einspielen',
    e2Alt.status === 200 && e2Alt.inhalt?.items === 1, JSON.stringify(e2Alt.inhalt));
  const e2AltZeilen = e2Namen(`SELECT 'e' AS art, u.username FROM items i LEFT JOIN users u ON u.id = i.user_id WHERE i.title = ?
    UNION ALL SELECT 'k', u.username FROM comments c JOIN items i ON i.id = c.item_id LEFT JOIN users u ON u.id = c.user_id WHERE i.title = ?
    UNION ALL SELECT 'b', u.username FROM ratings r JOIN items i ON i.id = r.item_id LEFT JOIN users u ON u.id = r.user_id WHERE i.title = ?
    UNION ALL SELECT 't', u.username FROM test_days t JOIN items i ON i.id = t.item_id LEFT JOIN users u ON u.id = t.user_id WHERE i.title = ?`,
    'Alte Datei', 'Alte Datei', 'Alte Datei', 'Alte Datei');
  pruefe('Und faellt vollstaendig an den Einspielenden',
    e2AltZeilen.length === 4 && e2AltZeilen.every(z => z.username === 'anna'),
    JSON.stringify(e2AltZeilen));
  pruefe('Eine alte Datei meldet keinen unbekannten Verfasser',
    gleich(e2Alt.inhalt?.verfasserUnbekannt, []) && e2Alt.inhalt?.verfasserZugeordnet === 0,
    JSON.stringify([e2Alt.inhalt?.verfasserUnbekannt, e2Alt.inhalt?.verfasserZugeordnet]));

  /* --- Beide Linkformen in einer Datei ------------------------------------
     Bis Formatnummer 6 war ein Link eine nackte String, ab 7 ein Objekt
     mit url und author. Der Import muss beide lesen -- eine alte Exportdatei
     ist kein Fehler, sondern der Normalfall nach einem Downgrade.
     EINGESPIELT WIRD ALS ANNA, und der genannte Eintragsverfasser ist BERT.
     Genau darauf kommt es an: nur so ist "der Link faellt an den
     Eintragsverfasser" von "der Link faellt an den Einspielenden"
     unterscheidbar. Waere der Eintrag annas, waere die Pruefung gruen, ohne
     etwas zu belegen. */
  const e2LinkAlt = await e2Import('cookie-e2-anna', { version: 6, title: 'L6', items: [{
    title: 'Links ohne Verfasser', author: 'bert',
    links: ['https://sechs.example/eins', 'Suchtext aus sechs'] }] }, 'merge');
  pruefe('Eine Datei der Formatnummer 6 laesst sich einspielen',
    e2LinkAlt.status === 200 && e2LinkAlt.inhalt?.items === 1, JSON.stringify(e2LinkAlt.inhalt));
  const e2LinkAltZeilen = e2Namen(`SELECT l.url, u.username FROM links l
                                   JOIN items i ON i.id = l.item_id
                                   LEFT JOIN users u ON u.id = l.user_id
                                   WHERE i.title = ? ORDER BY l.sort_order`, 'Links ohne Verfasser');
  pruefe('Ihre Links fallen an den Verfasser des Eintrags, nicht an den Einspielenden',
    e2LinkAltZeilen.length === 2 && e2LinkAltZeilen.every(z => z.username === 'bert'),
    JSON.stringify(e2LinkAltZeilen));
  // Und keine dieser Zeilen ist dabei herrenlos geblieben -- sonst schoebe sie
  // das Auffangnetz beim naechsten Start dem Eigentuemer zu.
  pruefe('Und keine davon bleibt herrenlos',
    e2Namen(`SELECT COUNT(*) n FROM links WHERE user_id IS NULL`)[0].n === 0,
    JSON.stringify(e2Namen('SELECT id, url, user_id FROM links WHERE user_id IS NULL')));

  /* Die neue Form daneben, mit denselben drei Lagen wie am Kommentar: ein
     bekannter Name, ein unbekannter, gar keine Angabe. */
  const e2LinkNeu = await e2Import('cookie-e2-anna', { version: 7, title: 'L7', items: [{
    title: 'Links mit Verfasser', author: 'bert',
    links: [{ url: 'https://sieben.example/carla', author: 'carla' },
            { url: 'https://sieben.example/dora', author: 'dora' },
            { url: 'https://sieben.example/leer', author: null }] }] }, 'merge');
  pruefe('Eine Datei der Formatnummer 7 laesst sich einspielen',
    e2LinkNeu.status === 200 && e2LinkNeu.inhalt?.items === 1, JSON.stringify(e2LinkNeu.inhalt));
  const e2LinkNeuZeilen = e2Namen(`SELECT l.url, u.username FROM links l
                                   JOIN items i ON i.id = l.item_id
                                   LEFT JOIN users u ON u.id = l.user_id
                                   WHERE i.title = ? ORDER BY l.sort_order`, 'Links mit Verfasser');
  pruefe('Ein genannter Name an der Linkzeile entscheidet',
    e2LinkNeuZeilen.find(z => /carla$/.test(z.url))?.username === 'carla',
    JSON.stringify(e2LinkNeuZeilen));
  /* Ein unbekannter Name faellt an den Einspielenden -- der vorhandene Weg
     ueber verfasser() gilt unveraendert. Der Eintragsverfasser (bert) ist
     hier ausdruecklich NICHT die Antwort: die Datei nennt einen Namen, er ist
     nur keiner aus dieser Anlage. */
  pruefe('Ein unbekannter Name an der Linkzeile faellt an den Einspielenden',
    e2LinkNeuZeilen.find(z => /dora$/.test(z.url))?.username === 'anna',
    JSON.stringify(e2LinkNeuZeilen));
  // author null heisst "kein Name genannt" -- dieselbe Antwort wie am
  // Kommentar: der Einspielende.
  pruefe('Und author null ebenfalls',
    e2LinkNeuZeilen.find(z => /leer$/.test(z.url))?.username === 'anna',
    JSON.stringify(e2LinkNeuZeilen));
  // Die laute Haelfte, auch hier: der unbekannte Name steht im Protokoll.
  pruefe('Die Antwort nennt den unbekannten Namen der Linkzeile',
    gleich(e2LinkNeu.inhalt?.verfasserUnbekannt, ['dora']),
    JSON.stringify(e2LinkNeu.inhalt?.verfasserUnbekannt));
  // Gezaehlt wird eine einzige fremde Zuordnung: bert am Eintrag. carla an der
  // Linkzeile ist die zweite. dora gibt es nicht, null nennt niemanden, und
  // anna ist der Einspielende selbst.
  pruefe('Und zaehlt die fremde Zuordnung der Linkzeile mit',
    e2LinkNeu.inhalt?.verfasserZugeordnet === 2,
    JSON.stringify(e2LinkNeu.inhalt?.verfasserZugeordnet));

  /* --- Beide Dateiformen ---------------------------------------------------
     Bis Formatnummer 7 trug ein Anhang kein Feld `author`, ab 8 trägt er eins.
     Eingespielt wird als anna, der genannte Eintragsverfasser ist BERT -- nur
     so ist "faellt an den Eintragsverfasser" von "faellt an den Einspielenden"
     zu unterscheiden. */
  const e2Bytes = Buffer.from('inhalt').toString('base64');
  const e2DateiAlt = await e2Import('cookie-e2-anna', { version: 7, title: 'D7', items: [{
    title: 'Dateien ohne Verfasser', author: 'bert',
    attachments: [{ filename: 'alt.txt', mime_type: 'text/plain', data_base64: e2Bytes }] }] }, 'merge');
  pruefe('Eine Datei ohne Verfasserfeld laesst sich einspielen',
    e2DateiAlt.status === 200 && e2DateiAlt.inhalt?.attachments === 1,
    JSON.stringify(e2DateiAlt.inhalt));
  const e2DateiAltZeilen = e2Namen(`SELECT a.filename, u.username FROM attachments a
                                    JOIN items i ON i.id = a.item_id
                                    LEFT JOIN users u ON u.id = a.user_id
                                    WHERE i.title = ?`, 'Dateien ohne Verfasser');
  pruefe('Sie faellt an den Verfasser des Eintrags, nicht an den Einspielenden',
    e2DateiAltZeilen.length === 1 && e2DateiAltZeilen[0].username === 'bert',
    JSON.stringify(e2DateiAltZeilen));

  const e2DateiNeu = await e2Import('cookie-e2-anna', { version: 8, title: 'D8', items: [{
    title: 'Dateien mit Verfasser', author: 'bert',
    attachments: [
      { filename: 'von-carla.txt', mime_type: 'text/plain', author: 'carla', data_base64: e2Bytes },
      { filename: 'von-dora.txt', mime_type: 'text/plain', author: 'dora', data_base64: e2Bytes },
      { filename: 'ohne.txt', mime_type: 'text/plain', author: null, data_base64: e2Bytes }] }] }, 'merge');
  pruefe('Eine Datei mit Verfasserfeld laesst sich einspielen',
    e2DateiNeu.status === 200 && e2DateiNeu.inhalt?.attachments === 3,
    JSON.stringify(e2DateiNeu.inhalt));
  const e2DateiNeuZeilen = e2Namen(`SELECT a.filename, u.username FROM attachments a
                                    JOIN items i ON i.id = a.item_id
                                    LEFT JOIN users u ON u.id = a.user_id
                                    WHERE i.title = ? ORDER BY a.sort_order`, 'Dateien mit Verfasser');
  pruefe('Ein genannter Name an der Datei entscheidet',
    e2DateiNeuZeilen.find(z => z.filename === 'von-carla.txt')?.username === 'carla',
    JSON.stringify(e2DateiNeuZeilen));
  pruefe('Ein unbekannter Name faellt an den Einspielenden',
    e2DateiNeuZeilen.find(z => z.filename === 'von-dora.txt')?.username === 'anna',
    JSON.stringify(e2DateiNeuZeilen));
  /* author null heisst "kein Name genannt" -- der Einspielende. Das ist etwas
     ANDERES als ein fehlendes Feld, und genau daran haengt die
     Unterscheidung: dort war es der Eintragsverfasser. */
  pruefe('Und author null ebenfalls, anders als ein fehlendes Feld',
    e2DateiNeuZeilen.find(z => z.filename === 'ohne.txt')?.username === 'anna',
    JSON.stringify(e2DateiNeuZeilen));
  pruefe('Die Antwort nennt den unbekannten Namen der Datei',
    gleich(e2DateiNeu.inhalt?.verfasserUnbekannt, ['dora']),
    JSON.stringify(e2DateiNeu.inhalt?.verfasserUnbekannt));
  pruefe('Und keine dieser Dateien bleibt herrenlos',
    e2Namen('SELECT COUNT(*) n FROM attachments WHERE user_id IS NULL')[0].n === 0,
    JSON.stringify(e2Namen('SELECT id, filename, user_id FROM attachments WHERE user_id IS NULL')));


  /* --- Videos in der Exportdatei, Formatnummer 10 -------------------------
     OHNE DEN SCHALTER BLEIBT DIE ZEILE ALS MARKE STEHEN, ohne Bytes. Sie legt
     beim Einspielen keinen Platz an -- photos.data ist NOT NULL, und ein
     Videoplatz, der ein Standbild ausliefert, bliebe im Abspieler schwarz --,
     aber der Import kann dadurch NENNEN, wie viele Videos die Datei nicht
     enthielt. Ohne die Marke waere der Verlust still, und still ist er das
     Schlimmste: stand das Video an erster Stelle, wird danach das naechste
     Foto zum Hauptbild.
     Die Prueflage geht ueber einen echten Upload, nicht ueber ein INSERT --
     nur so stehen Standbild und Varianten wirklich in der Zeile. */
  /* Die Nummer wird geholt, nicht geraten: die ersetzenden Importe darueber
     haben die Eintraege neu nummeriert. Und der Titel wird gleich mitgenommen,
     denn die Zeilen unten suchen danach. */
  const e2VidItem = e2Namen('SELECT id, title FROM items ORDER BY id LIMIT 1')[0];
  pruefe('Es gibt einen Eintrag, an den das Video kann', !!e2VidItem,
    JSON.stringify(e2Namen('SELECT id, title FROM items')));
  const e2VidHoch = await (async () => {
    const grenze = '----pruefunge2v' + crypto.randomBytes(6).toString('hex');
    const teil = (name, dateiname, typ, inhalt) => [
      Buffer.from(`--${grenze}\r\nContent-Disposition: form-data; name="${name}"; ` +
                  `filename="${dateiname}"\r\nContent-Type: ${typ}\r\n\r\n`, 'utf8'),
      inhalt, Buffer.from('\r\n', 'utf8')];
    const teile = [
      ...teil('video', 'clip.mp4', 'video/mp4', MP4()),
      ...teil('standbild', 'standbild.png', 'image/png', Buffer.from(PNG_BASE64, 'base64')),
      Buffer.from(`--${grenze}\r\nContent-Disposition: form-data; name="dauer"\r\n\r\n17\r\n`, 'utf8'),
      Buffer.from(`--${grenze}--\r\n`, 'utf8')
    ];
    const a = await fetch(SE2.basis + `/api/items/${e2VidItem?.id}/videos`, {
      method: 'POST',
      headers: { cookie: 'kriterion_session=cookie-e2-anna',
                 'content-type': `multipart/form-data; boundary=${grenze}` },
      body: Buffer.concat(teile)
    });
    return { status: a.status, inhalt: await a.json().catch(() => null) };
  })();
  pruefe('Die Prueflage traegt wirklich ein Video', e2VidHoch.status === 201,
    `${e2VidHoch.status}: ${JSON.stringify(e2VidHoch.inhalt?.error)}`);

  const e2OhneVid = (await e2Ruf('cookie-e2-anna', 'GET', '/api/export?photos=1')).inhalt;
  const e2MitVid = (await e2Ruf('cookie-e2-anna', 'GET', '/api/export?photos=1&videos=1')).inhalt;
  const vidZeile = (datei) => (datei?.items?.find(i => i.title === e2VidItem?.title)?.photos || [])
    .find(p2 => p2.art === 'video');
  pruefe('Ohne den Schalter steht die Videozeile als Marke in der Datei',
    !!vidZeile(e2OhneVid) && vidZeile(e2OhneVid).dauer === 17 &&
    !('data_base64' in vidZeile(e2OhneVid)),
    JSON.stringify(vidZeile(e2OhneVid)));
  pruefe('Mit dem Schalter traegt sie die Videodatei UND ihr Standbild',
    !!vidZeile(e2MitVid)?.data_base64 && !!vidZeile(e2MitVid)?.standbild_base64,
    JSON.stringify(Object.keys(vidZeile(e2MitVid) || {})));
  pruefe('Und die Videobytes sind wirklich die hochgeladenen',
    Buffer.from(vidZeile(e2MitVid)?.data_base64 || '', 'base64').equals(MP4()),
    `${Buffer.from(vidZeile(e2MitVid)?.data_base64 || '', 'base64').length} Bytes`);
  const e2VidFotos = (e2MitVid?.items?.find(i => i.title === e2VidItem?.title)?.photos || []);
  pruefe('Die Videozeile steht dort neben mindestens einer Zeile ueberhaupt',
    e2VidFotos.length >= 1, JSON.stringify(e2VidFotos.map(p2 => p2.art)));
  pruefe('Und jede Zeile nennt ihre Art ausdruecklich',
    e2VidFotos.every(p2 => p2.art === 'bild' || p2.art === 'video'),
    JSON.stringify(e2VidFotos.map(p2 => p2.art)));

  /* Der Rundlauf mit Videos: ersetzend einspielen und nachsehen, dass Art,
     Dauer und das Standbild wirklich ankommen. Das Standbild ist der Punkt --
     ohne das eigene Feld erzeugte der Import die Varianten aus data, also aus
     der Videodatei, und sie waeren leer. */
  const e2VidRund = await e2Import('cookie-e2-anna', e2MitVid, 'replace');
  pruefe('Der Rundlauf mit Videos gelingt', e2VidRund.status === 200,
    JSON.stringify(e2VidRund.inhalt));
  pruefe('Und er zaehlt das Video eigens, nicht als Foto',
    e2VidRund.inhalt?.videos === 1 && e2VidRund.inhalt?.photos === 0,
    JSON.stringify({ videos: e2VidRund.inhalt?.videos, photos: e2VidRund.inhalt?.photos }));
  const e2VidNach = e2Namen("SELECT art, dauer, length(data) AS d, length(thumb) AS t, length(medium) AS m FROM photos WHERE art = 'video'");
  pruefe('Die eingespielte Zeile ist ueberhaupt da', e2VidNach.length === 1,
    JSON.stringify(e2VidNach));
  pruefe('Sie traegt Art, Dauer, Videodatei UND beide Standbildvarianten',
    e2VidNach[0]?.art === 'video' && e2VidNach[0]?.dauer === 17 &&
    e2VidNach[0]?.d === MP4().length && e2VidNach[0]?.t > 0 && e2VidNach[0]?.m > 0,
    JSON.stringify(e2VidNach));

  /* Und dieselbe Datei OHNE die Videobytes: kein Platz, aber eine Meldung.
     Nicht abbrechen, melden -- dieselbe Haltung wie bei unbekannten
     Verfassernamen und ungueltigen Gewichten. */
  const e2VidOhne = await e2Import('cookie-e2-anna', e2OhneVid, 'replace');
  pruefe('Eine Datei ohne Videobytes laesst sich trotzdem einspielen',
    e2VidOhne.status === 200, JSON.stringify(e2VidOhne.inhalt));
  pruefe('Und sie nennt in der Antwort, wie viele Videos gefehlt haben',
    e2VidOhne.inhalt?.videosOhneDatei === 1 && e2VidOhne.inhalt?.videos === 0,
    JSON.stringify({ ohne: e2VidOhne.inhalt?.videosOhneDatei, videos: e2VidOhne.inhalt?.videos }));
  pruefe('In der Datenbank steht danach keine Videozeile',
    e2Namen("SELECT COUNT(*) n FROM photos WHERE art = 'video'")[0].n === 0,
    JSON.stringify(e2Namen('SELECT art FROM photos')));

  /* Ein Video, dessen Standbild sich nicht durch sharp lesen laesst, wird
     uebergangen und genannt -- dieselbe Regel wie beim Hochladen. */
  const e2VidKaputt = await e2Import('cookie-e2-anna', { version: 10, title: 'K', items: [{
    title: 'Mit kaputtem Standbild',
    photos: [{ art: 'video', dauer: 3, mime_type: 'video/mp4',
               data_base64: MP4().toString('base64'),
               standbild_base64: Buffer.from('kein Bild, nur Text').toString('base64') }]
  }] }, 'merge');
  pruefe('Ein unlesbares Standbild bricht den Import nicht ab',
    e2VidKaputt.status === 200, JSON.stringify(e2VidKaputt.inhalt));
  pruefe('Es wird uebergangen und genannt',
    e2VidKaputt.inhalt?.videosUnlesbar === 1 && e2VidKaputt.inhalt?.videos === 0,
    JSON.stringify({ unlesbar: e2VidKaputt.inhalt?.videosUnlesbar, videos: e2VidKaputt.inhalt?.videos }));

  /* EINE AELTERE DATEI OHNE art AN IHREN FOTOS: alles darin ist ein Bild.
     Entschieden wird ueber das Vorhandensein der Felder, nicht ueber die
     Formatnummer -- die ist im Projekt eine Aussage, keine Bedingung.
     Die Datei nennt hier ausdruecklich version 9, also die von vorher. */
  const e2VidAlt = await e2Import('cookie-e2-anna', { version: 9, title: 'A9', items: [{
    title: 'Aus einer Datei ohne art',
    photos: [{ mime_type: 'image/png', data_base64: PNG_BASE64 }]
  }] }, 'merge');
  pruefe('Eine aeltere Datei ohne art laesst sich einspielen',
    e2VidAlt.status === 200 && e2VidAlt.inhalt?.photos === 1,
    JSON.stringify(e2VidAlt.inhalt));
  pruefe('Und alles darin ist ein Bild',
    e2Namen("SELECT p.art FROM photos p JOIN items i ON i.id = p.item_id " +
            "WHERE i.title = 'Aus einer Datei ohne art'").every(z => z.art === 'bild') &&
    e2Namen("SELECT p.art FROM photos p JOIN items i ON i.id = p.item_id " +
            "WHERE i.title = 'Aus einer Datei ohne art'").length === 1,
    JSON.stringify(e2Namen("SELECT p.art FROM photos p JOIN items i ON i.id = p.item_id " +
                           "WHERE i.title = 'Aus einer Datei ohne art'")));

  await SE2.stopp();
  fs.rmSync(e2Dir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Der Papierkorb: die Tabelle legt sich selbst an');

  /* DIE KERNFRAGE DER RUNDE, nachgestellt statt geglaubt: braucht eine NEUE
     TABELLE ueberhaupt einen Migrationsblock? Stolperstein 13 gilt der
     SPALTE -- CREATE TABLE IF NOT EXISTS ruehrt eine vorhandene Tabelle nicht
     an. Eine FEHLENDE Tabelle legt es dagegen bei jedem Start an.
     Dieselbe Probe wie beim Index auf sessions.user_id in 0.8.20: von Hand
     entfernen, Server einmal starten, nachsehen.
     DIE GEGENLAGE GEHOERT DAZU: eine von Hand entfernte SPALTE kommt NICHT
     von selbst zurueck. Ohne sie belegte die Probe nur, dass irgendetwas
     nachwaechst. */
  {
    const tDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-pktab-'));
    kurzlauf(`require('./db'); console.log('da');`, tDir);
    const tDatei = path.join(tDir, 'katalog.sqlite');
    const tTabellen = () => {
      const d = oeffne(tDatei);
      const n = d.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(z => z.name);
      d.close();
      return n;
    };
    const frisch = tTabellen();
    pruefe('Eine frische Anlage traegt papierkorb ohne Migration',
      frisch.includes('papierkorb'), JSON.stringify(frisch));
    pruefe('Und papierkorb_bytes daneben',
      frisch.includes('papierkorb_bytes'), JSON.stringify(frisch));

    // Eine Zeile hinein, damit die Kaskade etwas zu tun bekommt.
    {
      const d = oeffne(tDatei);
      const p = d.prepare("INSERT INTO papierkorb (titel, inhalt) VALUES ('X', '{}')").run().lastInsertRowid;
      d.prepare('INSERT INTO papierkorb_bytes (papierkorb_id, nr, daten) VALUES (?, 0, ?)')
        .run(p, Buffer.from('bytes'));
      // Beide Tabellen von Hand entfernen -- UND eine vorhandene Spalte dazu.
      d.exec('DROP TABLE papierkorb_bytes');
      d.exec('DROP TABLE papierkorb');
      d.close();
    }
    const ohne = tTabellen();
    pruefe('Von Hand entfernt sind sie wirklich weg',
      !ohne.includes('papierkorb') && !ohne.includes('papierkorb_bytes'), JSON.stringify(ohne));

    kurzlauf(`require('./db'); console.log('da');`, tDir);
    const wieder = tTabellen();
    pruefe('Ein einziger Start legt papierkorb wieder an',
      wieder.includes('papierkorb'), JSON.stringify(wieder));
    pruefe('Und papierkorb_bytes ebenso',
      wieder.includes('papierkorb_bytes'), JSON.stringify(wieder));
    {
      const d = oeffne(tDatei);
      const spalten = d.prepare('PRAGMA table_info(papierkorb)').all().map(c => c.name);
      pruefe('Sie traegt alle fuenf Spalten',
        gleich(spalten, ['id', 'geloescht_am', 'geloescht_von', 'titel', 'inhalt']),
        JSON.stringify(spalten));
      const idx = d.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='papierkorb'")
        .all().map(z => z.name);
      pruefe('Und den Index auf das Datum, ebenfalls ohne Migration',
        idx.includes('idx_papierkorb_am'), JSON.stringify(idx));
      /* UND DIE TRAGENDE REGEL DER RUNDE AN DER SCHMALSTEN STELLE: items
         bekommt KEINE Spalte. Ein Zustand `geloescht` dort beruehrte jede
         Abfrage im ganzen System. Gezaehlt wird gegen eine feste Liste, nicht
         gegen "enthaelt nicht geloescht" -- so faellt auch jede andere neue
         Spalte auf. */
      const itemSpalten = d.prepare('PRAGMA table_info(items)').all().map(c => c.name);
      pruefe('items traegt unveraendert genau seine zehn Spalten',
        gleich(itemSpalten, ['id', 'title', 'description', 'rejected', 'tested', 'favorite',
                             'product_category_id', 'created_at', 'updated_at', 'user_id']),
        JSON.stringify(itemSpalten));
      d.close();
    }

    /* DIE GEGENLAGE: eine SPALTE kommt nicht von selbst zurueck. Genommen wird
       eine, die kein Migrationsblock nachtraegt -- items.description --, sonst
       belegte die Zeile nur, dass eine Migration laeuft. Nachgestellt an einer
       Kopie der Tabelle, wie es SQLite verlangt. */
    {
      const d = oeffne(tDatei);
      d.pragma('foreign_keys = OFF');
      d.exec('ALTER TABLE items DROP COLUMN description');
      const ohneSpalte = d.prepare('PRAGMA table_info(items)').all().map(c => c.name);
      d.close();
      pruefe('Die Spalte ist von Hand entfernt',
        !ohneSpalte.includes('description'), JSON.stringify(ohneSpalte));
    }
    let spaltenNachStart = [];
    try {
      kurzlauf(`require('./db'); console.log('da');`, tDir);
      const d = oeffne(tDatei);
      spaltenNachStart = d.prepare('PRAGMA table_info(items)').all().map(c => c.name);
      d.close();
    } catch { spaltenNachStart = ['(Start gescheitert)']; }
    pruefe('Eine fehlende SPALTE traegt CREATE TABLE IF NOT EXISTS NICHT nach',
      !spaltenNachStart.includes('description'), JSON.stringify(spaltenNachStart));

    fs.rmSync(tDir, { recursive: true, force: true });
  }

  /* ---------------------------------------------------------------- */
  gruppe('Der Papierkorb: der Rundlauf');

  /* DIE TRAGENDE PRUEFUNG DER RUNDE. Ein Eintrag mit Fotos, Video, Dateien,
     Links, Tags, Kommentaren ALLER VIER ARTEN mit Bild, Bewertungen und
     Testtagen MEHRERER Verfasser wird geloescht, wiederhergestellt und Feld
     fuer Feld gegen den Ausgangsstand gehalten. Eine Prueflage mit einem
     nackten Titel belegte genau nichts.

     VIER ZUGAENGE, und jeder steht fuer eine Lage:
       anna  (1) Eigentuemerin -- sie darf wiederherstellen.
       bert  (2) Admin OHNE Eigentuemerrolle -- er darf sehen und sonst nichts.
       carla (3) gewoehnliche Benutzerin, Verfasserin des Eintrags.
       dora  (4) wird nach dem Anlegen zum Grabstein: ihr Kommentar muss beim
                 Wiederherstellen WIEDER AN IHR landen.
     Dazu eine herrenlose Zeile, die erst NACH dem Start entsteht --
     ordneBestandZu() schoebe sie sonst der Eigentuemerin zu (Stolperstein 104). */
  const pkPng = Buffer.from(PNG_BASE64, 'base64');
  const pkDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-papierkorb-'));
  let pkKritId, pkKritZweiId;
  {
    kurzlauf(`require('./db'); console.log('da');`, pkDir);
    const d = oeffne(path.join(pkDir, 'katalog.sqlite'));
    for (const n of ['anna', 'bert', 'carla', 'dora'])
      d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(n, 'x');
    for (const [t, u] of [['cookie-pk-anna', 1], ['cookie-pk-bert', 2],
                          ['cookie-pk-carla', 3], ['cookie-pk-dora', 4]])
      d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(t, u);
    d.prepare('DELETE FROM rating_criteria').run();
    pkKritId = d.prepare("INSERT INTO rating_criteria (name, sort_order, gewicht) VALUES ('Optik', 0, 1.5)")
      .run().lastInsertRowid;
    pkKritZweiId = d.prepare("INSERT INTO rating_criteria (name, sort_order) VALUES ('Haptik', 1)")
      .run().lastInsertRowid;
    const katId = d.prepare("INSERT INTO product_categories (name) VALUES ('Werkzeug')").run().lastInsertRowid;
    // Ein zweiter Eintrag daneben. Ohne ihn liesse sich nicht sehen, dass das
    // Loeschen NUR den einen trifft.
    d.prepare('INSERT INTO items (title, user_id) VALUES (?, 1)').run('Bleibt stehen');
    const itId = d.prepare(`INSERT INTO items (title, description, rejected, tested,
        product_category_id, created_at, updated_at, user_id)
      VALUES (?, ?, 1, 1, ?, '2026-01-02 03:04:05', '2026-02-03 04:05:06', 3)`)
      .run('Vollständig', 'Erste Zeile\nZweite Zeile', katId).lastInsertRowid;
    // Foto und Video in EINER Tabelle -- das Video ausdruecklich NICHT an
    // erster Stelle, sonst liesse sich das Hauptbild nicht unterscheiden.
    d.prepare(`INSERT INTO photos (item_id, mime_type, data, thumb, medium, focus_x, focus_y, sort_order, art)
               VALUES (?, 'image/png', ?, ?, ?, 30, 70, 0, 'bild')`)
      .run(itId, pkPng, pkPng, pkPng);
    d.prepare(`INSERT INTO photos (item_id, mime_type, data, thumb, medium, focus_x, focus_y, sort_order, art, dauer)
               VALUES (?, 'video/mp4', ?, ?, ?, 50, 50, 1, 'video', 42)`)
      .run(itId, MP4(), pkPng, pkPng);
    // Zwei Dateien: eine von der Verfasserin, eine von einem Fremden.
    d.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order, user_id)
               VALUES (?, 'zettel.txt', 'text/plain', 5, ?, 0, 3)`).run(itId, Buffer.from('hallo'));
    d.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order, user_id)
               VALUES (?, 'berts-datei.txt', 'text/plain', 4, ?, 1, 2)`).run(itId, Buffer.from('bert'));
    // Zwei Links, verschiedene Eintrager.
    d.prepare("INSERT INTO links (item_id, url, sort_order, user_id) VALUES (?, 'https://eins.test', 0, 3)").run(itId);
    d.prepare("INSERT INTO links (item_id, url, sort_order, user_id) VALUES (?, 'https://zwei.test', 1, 2)").run(itId);
    // Tags am Eintrag und am Testtag.
    const tagA = d.prepare("INSERT INTO tags (name) VALUES ('Alu')").run().lastInsertRowid;
    const tagB = d.prepare("INSERT INTO tags (name) VALUES ('Stahl')").run().lastInsertRowid;
    d.prepare('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)').run(itId, tagA);
    d.prepare('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)').run(itId, tagB);
    // Vier Kommentararten, vier Lagen: Notiz (carla), Bericht (bert, angepinnt),
    // offene Aufgabe (dora -- wird Grabstein), erledigte Aufgabe (herrenlos).
    const kNotiz = d.prepare(`INSERT INTO comments (item_id, text, kind, pinned, created_at, updated_at, user_id)
        VALUES (?, 'Eine Notiz', 'note', 0, '2026-03-01 10:00:00', NULL, 3)`).run(itId).lastInsertRowid;
    d.prepare(`INSERT INTO comments (item_id, text, kind, pinned, created_at, user_id)
        VALUES (?, 'Ein Bericht von bert', 'report', 1, '2026-03-02 10:00:00', 2)`).run(itId);
    d.prepare(`INSERT INTO comments (item_id, text, kind, pinned, created_at, user_id)
        VALUES (?, 'Doras Aufgabe', 'task', 0, '2026-03-03 10:00:00', 4)`).run(itId);
    d.prepare(`INSERT INTO comments (item_id, text, kind, pinned, created_at, user_id)
        VALUES (?, 'Erledigt und herrenlos', 'done', 0, '2026-03-04 10:00:00', 3)`).run(itId);
    // Ein ECHTES Bild am Kommentar: kodiereKommentarBild() jagt es beim
    // Einspielen durch sharp, ein Fantasie-Puffer fiele wortlos heraus.
    d.prepare("INSERT INTO comment_images (comment_id, filename, data, thumb, sort_order) VALUES (?, 'bild.png', ?, ?, 0)")
      .run(kNotiz, pkPng, pkPng);
    // Bewertungen mehrerer Bewerter, dazu eine zurueckgesetzte mit Wert 0.
    d.prepare('INSERT INTO ratings (item_id, criterion_id, value, user_id) VALUES (?, ?, 5, 3)').run(itId, pkKritId);
    d.prepare('INSERT INTO ratings (item_id, criterion_id, value, user_id) VALUES (?, ?, 3, 2)').run(itId, pkKritId);
    d.prepare('INSERT INTO ratings (item_id, criterion_id, value, user_id) VALUES (?, ?, 0, 3)').run(itId, pkKritZweiId);
    // Testtage zweier Verfasser am SELBEN Tag -- das sind zwei Zeilen, nicht eine.
    const tdA = d.prepare("INSERT INTO test_days (item_id, day, rating, user_id) VALUES (?, '2026-04-01', 4, 3)")
      .run(itId).lastInsertRowid;
    d.prepare("INSERT INTO test_days (item_id, day, rating, user_id) VALUES (?, '2026-04-01', 2, 2)").run(itId);
    d.prepare('INSERT INTO test_day_tags (test_day_id, tag_id) VALUES (?, ?)').run(tdA, tagA);
    // Der Favorit der Verfasserin -- und einer von bert daneben. Nur EINER
    // kommt zurueck, und das gehoert belegt statt behauptet.
    d.prepare('INSERT INTO item_pins (user_id, item_id) VALUES (3, ?)').run(itId);
    d.prepare('INSERT INTO item_pins (user_id, item_id) VALUES (2, ?)').run(itId);
    d.close();
  }
  const PK = starteWeiterenServer(pkDir, {}, 4200);
  await PK.bereit;

  const pkRuf = async (cookieWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${cookieWert}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(PK.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };
  const pkImport = async (cookieWert, objekt, modus) => {
    const grenze = '----pruefungpk' + crypto.randomBytes(6).toString('hex');
    const teil = (name, wert, dateiname) =>
      `--${grenze}\r\nContent-Disposition: form-data; name="${name}"` +
      (dateiname ? `; filename="${dateiname}"\r\nContent-Type: application/json` : '') +
      `\r\n\r\n${wert}\r\n`;
    const koerper = teil('mode', modus) + teil('file', JSON.stringify(objekt), 'export.json') + `--${grenze}--\r\n`;
    const a = await fetch(PK.basis + '/api/import', {
      method: 'POST',
      headers: { cookie: `kriterion_session=${cookieWert}`, 'content-type': `multipart/form-data; boundary=${grenze}` },
      body: koerper
    });
    return { status: a.status, inhalt: await a.json().catch(() => null) };
  };
  const pkDatenbank = () => oeffne(path.join(pkDir, 'katalog.sqlite'));
  const pkZeilen = (sql, ...werte) => {
    const d = pkDatenbank();
    const z = d.prepare(sql).all(...werte);
    d.close();
    return z;
  };
  const pkEine = (sql, ...werte) => pkZeilen(sql, ...werte)[0];
  const pkSchreibe = (sql, ...werte) => {
    const d = pkDatenbank();
    d.pragma('busy_timeout = 4000');
    d.prepare(sql).run(...werte);
    d.close();
  };

  /* Erst JETZT, nach dem Start: ordneBestandZu() laeuft bei jedem Start und
     wiese die herrenlose Zeile sonst der Eigentuemerin zu. Und dora wird zum
     Grabstein -- ihre Zeile in users bleibt stehen, der Name wird der
     Grabsteinname. */
  pkSchreibe("UPDATE comments SET user_id = NULL WHERE text = 'Erledigt und herrenlos'");
  pkSchreibe("UPDATE users SET username = 'geloescht-4', status = 'geloescht', role = 'user', " +
             "password_hash = '' WHERE id = 4");
  // bert bekommt die Adminrolle -- OHNE Eigentuemerrolle. Ohne diesen Zugang
  // liesse sich "Eigentuemer" von "Admin" gar nicht unterscheiden.
  pkSchreibe("UPDATE users SET role = 'admin' WHERE username = 'bert'");

  const pkItemId = pkEine("SELECT id FROM items WHERE title = 'Vollständig'").id;
  const pkRollen = await pkRuf('cookie-pk-bert', 'GET', '/api/settings');
  pruefe('bert ist Admin, aber nicht Eigentuemer',
    pkRollen.inhalt?.istAdmin === true && pkRollen.inhalt?.istEigentuemer === false,
    JSON.stringify([pkRollen.inhalt?.istAdmin, pkRollen.inhalt?.istEigentuemer]));
  pruefe('anna ist beides',
    (await pkRuf('cookie-pk-anna', 'GET', '/api/settings')).inhalt?.istEigentuemer === true);
  pruefe('carla ist keines von beiden',
    (await pkRuf('cookie-pk-carla', 'GET', '/api/settings')).inhalt?.istAdmin === false);
  pruefe('Die Frist steht in den Einstellungen und nicht nur in der Karte',
    pkRollen.inhalt?.papierkorbTage === 30, JSON.stringify(pkRollen.inhalt?.papierkorbTage));

  /* Der Ausgangsstand, an dem hinterher Feld fuer Feld gemessen wird. Gelesen
     wird die ECHTE Antwort des Servers -- eine selbst zusammengestellte
     Erwartung bewiese nichts ueber das, was wirklich herauskommt. */
  /* Auch hier jede Lesestelle abgefangen (Stolperstein 103): antwortet der
     Server nicht mit dem Eintrag, sollen die Pruefungen darunter ROT werden
     und nicht der Lauf abreissen -- ein abgerissener Lauf nennt keinen
     einzigen Namen. */
  const pkVorher = (await pkRuf('cookie-pk-carla', 'GET', `/api/items/${pkItemId}`)).inhalt || {};
  const pkVorherBytes = pkZeilen(
    "SELECT art, sort_order, mime_type, focus_x, focus_y, dauer, length(data) AS n, hex(data) AS h " +
    'FROM photos WHERE item_id = ? ORDER BY sort_order', pkItemId);
  const pkVorherDateien = pkZeilen(
    'SELECT filename, mime_type, size, sort_order, user_id, hex(data) AS h FROM attachments ' +
    'WHERE item_id = ? ORDER BY sort_order', pkItemId);
  pruefe('Die Prueflage traegt wirklich alles',
    pkVorher?.photos?.length === 2 && pkVorher?.comments?.length === 4 &&
    pkVorher?.links?.length === 2 && pkVorher?.testDays?.length === 2 &&
    pkVorher?.tags?.length === 2 && pkVorher?.attachments?.length === 2,
    JSON.stringify({ fotos: pkVorher?.photos?.length, kommentare: pkVorher?.comments?.length,
                     links: pkVorher?.links?.length, testtage: pkVorher?.testDays?.length,
                     tags: pkVorher?.tags?.length, dateien: pkVorher?.attachments?.length }));
  pruefe('Und Beitraege mehrerer Verfasser',
    new Set((pkVorher.comments || []).map(c => JSON.stringify(c.verfasser))).size === 4,
    JSON.stringify((pkVorher.comments || []).map(c => c.verfasser)));

  // Loeschen darf die Verfasserin selbst.
  const pkWeg = await pkRuf('cookie-pk-carla', 'DELETE', `/api/items/${pkItemId}`);
  pruefe('Die Verfasserin loescht ihren Eintrag', pkWeg.status === 204, `Status ${pkWeg.status}`);
  pruefe('Der Eintrag ist wirklich weg -- keine Zeile in items',
    pkZeilen('SELECT id FROM items WHERE id = ?', pkItemId).length === 0);
  pruefe('Und die Kaskade hat geraeumt',
    pkZeilen('SELECT id FROM photos WHERE item_id = ?', pkItemId).length === 0 &&
    pkZeilen('SELECT id FROM comments WHERE item_id = ?', pkItemId).length === 0 &&
    pkZeilen('SELECT id FROM links WHERE item_id = ?', pkItemId).length === 0);
  pruefe('Die Uebersicht kennt ihn nicht mehr',
    !((await pkRuf('cookie-pk-carla', 'GET', '/api/items')).inhalt || []).some(i => i.id === pkItemId));
  pruefe('Der Eintrag daneben steht unveraendert da',
    pkZeilen("SELECT id FROM items WHERE title = 'Bleibt stehen'").length === 1);
  pruefe('Genau EINE Zeile liegt im Papierkorb',
    pkZeilen('SELECT id FROM papierkorb').length === 1,
    JSON.stringify(pkZeilen('SELECT id, titel FROM papierkorb')));

  /* JEDE LESESTELLE ABGEFANGEN (Stolperstein 103): faellt die Zeile weg, sollen
     die Pruefungen darunter ROT werden und nicht der Lauf abreissen. Beim Bau
     ist genau das passiert -- eine Gegenprobe, die den Papierkorb gar nicht
     mehr fuellte, nahm den ganzen Lauf mit. */
  const pkZeile = pkEine('SELECT id, titel, geloescht_von, length(inhalt) AS n FROM papierkorb') || {};
  pruefe('Sie traegt den Titel als eigene Spalte',
    pkZeile?.titel === 'Vollständig', JSON.stringify(pkZeile?.titel));
  pruefe('Und den Loeschenden', pkZeile?.geloescht_von === 3, JSON.stringify(pkZeile?.geloescht_von));

  /* DER GRUND FUER DIE BAUFORM, an der Prueflage nachgemessen: die Bytes
     liegen NICHT in der JSON. Der Umschlag bleibt klein, obwohl der Eintrag
     eine Videodatei traegt -- sonst entstuende bei zwanzig Videos ein String
     ueber der Grenze von Node. */
  const pkBytesZeilen = pkZeilen('SELECT nr, length(daten) AS n FROM papierkorb_bytes ' +
    'WHERE papierkorb_id = ? ORDER BY nr', pkZeile.id ?? -1);
  pruefe('Die Bytes liegen daneben, eine Zeile je Blob',
    pkBytesZeilen.length === 6, JSON.stringify(pkBytesZeilen));
  pruefe('Ihre Nummern sind lueckenlos ab null',
    gleich(pkBytesZeilen.map(z => z.nr), [0, 1, 2, 3, 4, 5]), JSON.stringify(pkBytesZeilen.map(z => z.nr)));
  const pkBytesSumme = pkBytesZeilen.reduce((s, z) => s + z.n, 0);
  /* DER EIGENTLICHE BELEG: die Videodatei steht NICHT in der JSON. Waere sie
     dort, stuende ihr Base64 darin -- und bei zwanzig Videos entstuende ein
     String ueber der Grenze von Node. Gesucht wird der Anfang genau dieser
     Datei, nicht irgendein Muster. */
  pruefe('Die Videobytes stehen nicht in der JSON',
    !(pkEine('SELECT inhalt FROM papierkorb')?.inhalt || '').includes(MP4().toString('base64').slice(0, 60)),
    MP4().toString('base64').slice(0, 60));
  pruefe('Sie liegen als eigene Zeile daneben',
    pkBytesZeilen.some(z => z.n === MP4().length), JSON.stringify(pkBytesZeilen.map(z => z.n)));
  pruefe('In der JSON steht kein data_base64',
    !!pkZeile.n && !(pkEine('SELECT inhalt FROM papierkorb')?.inhalt || '').includes('data_base64'),
    (pkEine('SELECT inhalt FROM papierkorb')?.inhalt || '(keine Zeile)').slice(0, 200));
  pruefe('Sondern data_ref',
    (pkEine('SELECT inhalt FROM papierkorb')?.inhalt || '').includes('"data_ref"'));

  /* DIE KENNZAHLEN WEISEN IHN GETRENNT AUS -- sonst wundert sich jemand ueber
     eine Datenbank, die nach dem Aufraeumen groesser ist als vorher. */
  const pkStats = (await pkRuf('cookie-pk-anna', 'GET', '/api/stats')).inhalt;
  pruefe('Die Kennzahlen nennen den Papierkorb',
    pkStats?.papierkorbCount === 1, JSON.stringify(pkStats?.papierkorbCount));
  pruefe('Mit seiner Groesse',
    pkStats?.papierkorbBytes > pkBytesSumme, JSON.stringify(pkStats?.papierkorbBytes));
  pruefe('Und die alten Zahlen bedeuten unveraendert dasselbe',
    pkStats?.itemCount === 1 && pkStats?.photoCount === 0 && pkStats?.videoCount === 0 &&
    pkStats?.commentCount === 0 && pkStats?.linkCount === 0 && pkStats?.attachmentCount === 0,
    JSON.stringify({ items: pkStats?.itemCount, fotos: pkStats?.photoCount,
                     videos: pkStats?.videoCount, kommentare: pkStats?.commentCount }));

  // Die Liste, wie die Karte sie sieht.
  const pkListe = (await pkRuf('cookie-pk-anna', 'GET', '/api/papierkorb')).inhalt || {};
  // Erst das Vorhandensein, dann jede Aussage darueber -- und jede Lesestelle
  // abgefangen (Stolpersteine 81 und 103).
  const pkErste = (pkListe.zeilen || [])[0] || {};
  pruefe('Die Liste nennt die Frist', pkListe.tage === 30, JSON.stringify(pkListe.tage));
  pruefe('Und eine Zeile mit Titel, Datum und Loeschendem',
    pkListe.zeilen?.length === 1 && pkErste.titel === 'Vollständig' &&
    /^\d{4}-\d{2}-\d{2} /.test(pkErste.geloescht_am || '') &&
    pkErste.loeschender?.name === 'carla',
    JSON.stringify(pkErste));
  pruefe('Sie nennt die verbleibenden Tage',
    pkErste.tageOffen === 30, JSON.stringify(pkErste.tageOffen));
  pruefe('Und Zahl und Groesse der Bytes daneben',
    pkErste.dateien === 6 && pkErste.bytes > pkBytesSumme,
    JSON.stringify({ dateien: pkErste.dateien, bytes: pkErste.bytes }));

  // --- Wiederherstellen ---
  const pkZurueck = await pkRuf('cookie-pk-anna', 'POST', `/api/papierkorb/${pkZeile.id ?? -1}/wiederherstellen`);
  pruefe('Die Eigentuemerin holt den Eintrag zurueck',
    pkZurueck.status === 200, JSON.stringify(pkZurueck.inhalt));
  pruefe('Die Papierkorbzeile ist danach weg',
    pkZeilen('SELECT id FROM papierkorb').length === 0);
  pruefe('Und ihre Bytes mit ihr',
    pkZeilen('SELECT id FROM papierkorb_bytes').length === 0);
  const pkNeuId = pkZurueck.inhalt?.itemId;
  pruefe('Die Antwort nennt die NEUE Nummer',
    Number.isInteger(pkNeuId) && pkNeuId !== pkItemId, JSON.stringify(pkNeuId));

  const pkNachher = (await pkRuf('cookie-pk-carla', 'GET', `/api/items/${pkNeuId ?? -1}`)).inhalt || {};
  pruefe('Titel, Beschreibung und die beiden Merkmale stehen wieder da',
    pkNachher?.title === pkVorher.title && pkNachher?.description === pkVorher.description &&
    pkNachher?.rejected === pkVorher.rejected && pkNachher?.tested === pkVorher.tested,
    JSON.stringify({ t: pkNachher?.title, r: pkNachher?.rejected, g: pkNachher?.tested }));
  pruefe('Die Zeitstempel ebenso',
    pkNachher?.created_at === pkVorher.created_at && pkNachher?.updated_at === pkVorher.updated_at,
    JSON.stringify([pkNachher?.created_at, pkNachher?.updated_at]));
  pruefe('Die Kategorie ebenso',
    pkNachher?.category?.name === pkVorher.category?.name, JSON.stringify(pkNachher?.category));
  pruefe('Der Verfasser des Eintrags ebenso',
    gleich(pkNachher?.verfasser, pkVorher.verfasser), JSON.stringify(pkNachher?.verfasser));
  pruefe('Die Tags ebenso',
    gleich((pkNachher?.tags || []).map(t => t.name).sort(), (pkVorher.tags || []).map(t => t.name).sort()),
    JSON.stringify((pkNachher?.tags || []).map(t => t.name)));
  pruefe('Die Links samt Reihenfolge und Eintragern',
    gleich((pkNachher?.links || []).map(l => [l.url, l.verfasser?.name]),
           (pkVorher.links || []).map(l => [l.url, l.verfasser?.name])),
    JSON.stringify((pkNachher?.links || []).map(l => [l.url, l.verfasser?.name])));
  pruefe('Die Testtage samt Note, Verfasser und Tags',
    gleich((pkNachher?.testDays || []).map(t => [t.day, t.rating, t.verfasser?.name, (t.tags || []).map(x => x.name)]),
           (pkVorher.testDays || []).map(t => [t.day, t.rating, t.verfasser?.name, (t.tags || []).map(x => x.name)])),
    JSON.stringify((pkNachher?.testDays || []).map(t => [t.day, t.rating, t.verfasser?.name])));
  pruefe('Die Kommentare samt Art, Anpinnung und Text',
    gleich((pkNachher?.comments || []).map(c => [c.text, c.kind, c.pinned]),
           (pkVorher.comments || []).map(c => [c.text, c.kind, c.pinned])),
    JSON.stringify((pkNachher?.comments || []).map(c => [c.text, c.kind, c.pinned])));
  /* Die Verfasser, und zwar die genannten: der lebende, der Admin und der
     GRABSTEIN. Die herrenlose Zeile faellt bewusst an die Wiederherstellende
     und steht deshalb NICHT in diesem Vergleich -- sie bekommt ihre eigene
     Zeile darunter. */
  pruefe('Und ihre genannten Verfasser -- der lebende, der Admin und der GRABSTEIN',
    gleich((pkNachher?.comments || []).filter(c => c.text !== 'Erledigt und herrenlos').map(c => c.verfasser),
           (pkVorher.comments || []).filter(c => c.text !== 'Erledigt und herrenlos').map(c => c.verfasser)),
    JSON.stringify({ nachher: (pkNachher?.comments || []).map(c => c.verfasser),
                     vorher: (pkVorher.comments || []).map(c => c.verfasser) }));
  pruefe('Der Beitrag des Grabsteins landet WIEDER am Grabstein',
    (pkNachher?.comments || []).some(c => c.text === 'Doras Aufgabe' && c.verfasser?.geloescht === true &&
      c.verfasser?.id === 4),
    JSON.stringify((pkNachher?.comments || []).find(c => c.text === 'Doras Aufgabe')?.verfasser));
  pruefe('Die herrenlose Zeile faellt an die Wiederherstellende',
    (pkNachher?.comments || []).find(c => c.text === 'Erledigt und herrenlos')?.verfasser?.name === 'anna',
    JSON.stringify((pkNachher?.comments || []).find(c => c.text === 'Erledigt und herrenlos')?.verfasser));
  pruefe('Kein Name blieb unbekannt',
    gleich(pkZurueck.inhalt?.verfasserUnbekannt, []),
    JSON.stringify(pkZurueck.inhalt?.verfasserUnbekannt));
  pruefe('Das Bild am Kommentar kommt mit',
    ((pkNachher?.comments || []).find(c => c.text === 'Eine Notiz')?.images || []).length === 1,
    JSON.stringify((pkNachher?.comments || []).find(c => c.text === 'Eine Notiz')?.images));
  pruefe('Die Bewertungen samt Werten',
    gleich((pkNachher?.ratings || []).map(r => [r.name, r.wert, r.schnitt, r.anzahl]),
           (pkVorher.ratings || []).map(r => [r.name, r.wert, r.schnitt, r.anzahl])),
    JSON.stringify({ nachher: (pkNachher?.ratings || []).map(r => [r.name, r.schnitt, r.anzahl]),
                     vorher: (pkVorher.ratings || []).map(r => [r.name, r.schnitt, r.anzahl]) }));
  pruefe('Das Gewicht des Kriteriums ist unveraendert',
    pkEine("SELECT gewicht FROM rating_criteria WHERE name = 'Optik'")?.gewicht === 1.5,
    JSON.stringify(pkEine("SELECT gewicht FROM rating_criteria WHERE name = 'Optik'")));

  const pkNachherBytes = pkZeilen(
    "SELECT art, sort_order, mime_type, focus_x, focus_y, dauer, length(data) AS n, hex(data) AS h " +
    'FROM photos WHERE item_id = ? ORDER BY sort_order', pkNeuId ?? -1);
  pruefe('Fotos und Video stehen wieder da -- BYTEGLEICH, samt Art, Dauer und Fokuspunkt',
    gleich(pkNachherBytes, pkVorherBytes),
    JSON.stringify(pkNachherBytes.map(z => [z.art, z.sort_order, z.dauer, z.n])));
  const pkNachherDateien = pkZeilen(
    'SELECT filename, mime_type, size, sort_order, user_id, hex(data) AS h FROM attachments ' +
    'WHERE item_id = ? ORDER BY sort_order', pkNeuId ?? -1);
  pruefe('Die Dateien ebenso, samt Hochladendem',
    gleich(pkNachherDateien, pkVorherDateien),
    JSON.stringify(pkNachherDateien.map(z => [z.filename, z.size, z.user_id])));
  pruefe('Die Standbilder des Videos sind wieder erzeugt',
    (pkEine("SELECT thumb IS NOT NULL AS t, medium IS NOT NULL AS m FROM photos " +
            "WHERE item_id = ? AND art = 'video'", pkNeuId ?? -1)?.t === 1),
    JSON.stringify(pkEine("SELECT thumb IS NOT NULL AS t, medium IS NOT NULL AS m FROM photos " +
                          "WHERE item_id = ? AND art = 'video'", pkNeuId ?? -1)));

  /* WAS NICHT ZURUECKKOMMT, und es gehoert belegt statt verschwiegen: der
     Favorit heisst "habe ICH markiert" und steht so schon im Austauschformat.
     Zwei Leute hatten den Eintrag als Favoriten; zurueck kommt EINER, und zwar
     bei der Wiederherstellenden. */
  const pkPins = pkZeilen('SELECT user_id FROM item_pins WHERE item_id = ? ORDER BY user_id', pkNeuId ?? -1);
  pruefe('Der Favorit kommt bei der Wiederherstellenden an',
    gleich(pkPins.map(z => z.user_id), [1]), JSON.stringify(pkPins));

  /* ---------------------------------------------------------------- */
  gruppe('Der Papierkorb: dieselbe Transaktion');

  /* DIE ZUSICHERUNG DER RUNDE, mit erzwungenem Fehlschlag nachgestellt:
     entweder liegt der Eintrag im Papierkorb UND ist geloescht, oder er steht
     unveraendert da. Ein halber Stand ist ausgeschlossen.
     Der Fehlschlag wird durch einen Auslöser erzwungen, der beim Einfuegen in
     papierkorb zuschlaegt -- an der Datenbank und nicht am Quelltext, damit
     der Arbeitsbaum unberuehrt bleibt (Stolperstein 100). */
  {
    const tItem = pkEine("SELECT id FROM items WHERE title = 'Bleibt stehen'").id;
    const vorher = pkEine('SELECT title, user_id, updated_at FROM items WHERE id = ?', tItem);

    /* ERSTE LAGE: das EINFUEGEN scheitert. Danach darf nichts geschehen sein --
       weder eine Zeile im Papierkorb noch ein geloeschter Eintrag. */
    pkSchreibe(`CREATE TRIGGER pk_bremse BEFORE INSERT ON papierkorb
                BEGIN SELECT RAISE(ABORT, 'Probe: der Papierkorb nimmt nichts an'); END`);
    const gescheitert2 = await pkRuf('cookie-pk-anna', 'DELETE', `/api/items/${tItem}`);
    pruefe('Scheitert das Einfuegen, scheitert das Loeschen mit',
      gescheitert2.status >= 500, `Status ${gescheitert2.status}`);
    pruefe('Der Eintrag steht danach UNVERAENDERT da, nicht halb',
      gleich(pkEine('SELECT title, user_id, updated_at FROM items WHERE id = ?', tItem), vorher),
      JSON.stringify(pkEine('SELECT title, user_id, updated_at FROM items WHERE id = ?', tItem)));
    pruefe('Und im Papierkorb liegt nichts',
      pkZeilen('SELECT id FROM papierkorb').length === 0,
      JSON.stringify(pkZeilen('SELECT id, titel FROM papierkorb')));
    pkSchreibe('DROP TRIGGER pk_bremse');

    /* ZWEITE LAGE, UND SIE IST DIE, FUER DIE DIE TRANSAKTION DA IST: das
       Einfuegen geht durch, das LOESCHEN scheitert. Ohne db.transaction()
       bliebe die Papierkorbzeile stehen, waehrend der Eintrag noch da ist --
       ein Paket ohne Anlass, und der naechste Blick in die Karte zeigte einen
       Eintrag, den es doppelt gibt.
       Die erste Lage allein belegte das NICHT: dort scheitert die erste
       Anweisung, und die Reihenfolge allein raeumte schon auf (Stolperstein 50
       -- die Frage ist, ob die Stelle getroffen ist, an der die Regel wirkt). */
    pkSchreibe(`CREATE TRIGGER pk_bremse2 BEFORE DELETE ON items
                BEGIN SELECT RAISE(ABORT, 'Probe: der Eintrag laesst sich nicht loeschen'); END`);
    const gescheitert3 = await pkRuf('cookie-pk-anna', 'DELETE', `/api/items/${tItem}`);
    pruefe('Scheitert das Loeschen, scheitert der ganze Vorgang',
      gescheitert3.status >= 500, `Status ${gescheitert3.status}`);
    pruefe('Der Eintrag steht auch dann unveraendert da',
      gleich(pkEine('SELECT title, user_id, updated_at FROM items WHERE id = ?', tItem), vorher),
      JSON.stringify(pkEine('SELECT title, user_id, updated_at FROM items WHERE id = ?', tItem)));
    pruefe('UND es bleibt KEINE Papierkorbzeile zurueck',
      pkZeilen('SELECT id FROM papierkorb').length === 0,
      JSON.stringify(pkZeilen('SELECT id, titel FROM papierkorb')));
    pruefe('Auch keine Bytes',
      pkZeilen('SELECT id FROM papierkorb_bytes').length === 0,
      JSON.stringify(pkZeilen('SELECT id FROM papierkorb_bytes')));
    pkSchreibe('DROP TRIGGER pk_bremse2');
    // Und der Beleg, dass es ohne die Bremse durchgeht -- sonst bliebe die
    // Probe daruber auch dann gruen, wenn das Loeschen gar nicht mehr ginge.
    const geht = await pkRuf('cookie-pk-anna', 'DELETE', `/api/items/${tItem}`);
    pruefe('Ohne die Bremse geht derselbe Griff durch', geht.status === 204, `Status ${geht.status}`);
    pruefe('Und die Zeile liegt jetzt im Papierkorb',
      pkZeilen('SELECT id FROM papierkorb').length === 1);
    // Aufraeumen: die Zeile endgueltig entfernen, damit die Lagen darunter
    // von einem bekannten Stand ausgehen.
    const weg = pkEine('SELECT id FROM papierkorb').id;
    pruefe('Endgueltig entfernen nimmt die Zeile',
      (await pkRuf('cookie-pk-anna', 'DELETE', `/api/papierkorb/${weg}`)).status === 204);
    pruefe('Und ihre Bytes ueber die Kaskade mit',
      pkZeilen('SELECT id FROM papierkorb_bytes').length === 0);
  }

  /* ---------------------------------------------------------------- */
  gruppe('Der Papierkorb: die dreissig Tage');

  /* DER AUSGANGSWERT WIRD VON HAND GESETZT (Stolperstein 60): datetime('now')
     loest nur Sekunden auf, und dreissig Tage lassen sich nicht abwarten.
     Geprueft wird die Grenze an BEIDEN Seiten. */
  {
    /* datetime() nimmt seine Modifikatoren EINZELN -- "-30 days +1 seconds"
       in EINEM String ergibt NULL, und die Spalte ist NOT NULL. Nachgestellt
       beim ersten Lauf: der Prueflauf riss daran ab. */
    const setze = (titel, ...versatz) => {
      pkSchreibe("INSERT INTO papierkorb (titel, inhalt, geloescht_von, geloescht_am) " +
                 `VALUES (?, '{}', 1, datetime('now'${versatz.map(() => ', ?').join('')}))`,
                 titel, ...versatz);
      return pkEine('SELECT id FROM papierkorb WHERE titel = ?', titel).id;
    };
    const idAlt = setze('zu alt', '-31 days');
    const idNeu = setze('von gestern', '-1 days');
    const idKnappDrin = setze('knapp drin', '-30 days', '+1 seconds');
    const idKnappDraussen = setze('knapp draussen', '-30 days', '-1 seconds');
    pkSchreibe('INSERT INTO papierkorb_bytes (papierkorb_id, nr, daten) VALUES (?, 0, ?)',
      idAlt, Buffer.from('faellt mit'));
    pruefe('Vier Zeilen liegen bereit',
      pkZeilen('SELECT id FROM papierkorb').length === 4);

    // ZWEITE AUFRUFSTELLE: das Oeffnen der Karte.
    const nachKarte = (await pkRuf('cookie-pk-anna', 'GET', '/api/papierkorb')).inhalt;
    const uebrig = (nachKarte?.zeilen || []).map(z => z.titel).sort();
    pruefe('Beim Oeffnen der Karte faellt heraus, was aelter als dreissig Tage ist',
      gleich(uebrig, ['knapp drin', 'von gestern']), JSON.stringify(uebrig));
    pruefe('Die Zeile von gestern bleibt',
      pkZeilen('SELECT id FROM papierkorb WHERE id = ?', idNeu).length === 1);
    pruefe('Die Grenze traegt auf der einen Seite: eine Sekunde davor bleibt',
      pkZeilen('SELECT id FROM papierkorb WHERE id = ?', idKnappDrin).length === 1);
    pruefe('Und auf der anderen: eine Sekunde danach faellt heraus',
      pkZeilen('SELECT id FROM papierkorb WHERE id = ?', idKnappDraussen).length === 0);
    pruefe('Die Bytes der herausgefallenen Zeile fallen mit',
      pkZeilen('SELECT id FROM papierkorb_bytes WHERE papierkorb_id = ?', idAlt).length === 0);
    pruefe('Die verbleibenden Tage stehen an jeder Zeile',
      (nachKarte.zeilen || []).every(z => Number.isInteger(z.tageOffen) && z.tageOffen >= 0),
      JSON.stringify((nachKarte.zeilen || []).map(z => [z.titel, z.tageOffen])));
    pruefe('Und die Zeile von gestern hat noch 29',
      (nachKarte.zeilen || []).find(z => z.titel === 'von gestern')?.tageOffen === 29,
      JSON.stringify((nachKarte.zeilen || []).find(z => z.titel === 'von gestern')));

    // ERSTE AUFRUFSTELLE: der Start. Eigens belegt, sonst bliebe offen, ob
    // ueberhaupt zwei Stellen aufraeumen.
    pkSchreibe("UPDATE papierkorb SET geloescht_am = datetime('now', '-40 days') WHERE id = ?", idNeu);
    pruefe('Die Zeile ist von Hand alt gemacht worden',
      pkZeilen('SELECT id FROM papierkorb WHERE id = ?', idNeu).length === 1);
    // Ein eigener kurzer Lauf auf demselben Verzeichnis -- er laedt server.js
    // nicht, sondern nur db.js; deshalb wird der Start hier ueber einen
    // zweiten Server gefahren.
    const PK2 = starteWeiterenServer(pkDir, {}, 4260);
    await PK2.bereit;
    pruefe('Schon der Start raeumt sie weg',
      pkZeilen('SELECT id FROM papierkorb WHERE id = ?', idNeu).length === 0,
      JSON.stringify(pkZeilen('SELECT id, titel, geloescht_am FROM papierkorb')));
    pruefe('Und sagt es im Protokoll',
      /Papierkorb: \d+ Zeile\(n\) aelter als 30 Tage entfernt/.test(PK2.protokoll()),
      PK2.protokoll().slice(-400));
    await PK2.stopp();
    // Aufraeumen fuer die Lagen darunter.
    pkSchreibe('DELETE FROM papierkorb');
  }

  /* ---------------------------------------------------------------- */
  gruppe('Der Papierkorb: die Rechte');

  /* ZU JEDER VERWEIGERUNG DER ERFOLGSFALL DANEBEN und die Nachschau in der
     Datenbank, dass wirklich nichts geschrieben wurde. Und ein ADMIN OHNE
     EIGENTUEMERROLLE gehoert dazu -- ohne ihn liesse sich "Eigentuemer" von
     "Admin" gar nicht unterscheiden. */
  {
    const opferId = (await pkRuf('cookie-pk-carla', 'POST', '/api/items',
      { title: 'Zum Wegwerfen' })).inhalt?.id;
    await pkRuf('cookie-pk-carla', 'DELETE', `/api/items/${opferId}`);
    const zeile = pkEine('SELECT id FROM papierkorb') || {};
    pruefe('Eine Zeile liegt bereit', Number.isInteger(zeile.id), JSON.stringify(zeile));

    // --- Sehen ---
    const sehenCarla = await pkRuf('cookie-pk-carla', 'GET', '/api/papierkorb');
    pruefe('Ein gewoehnlicher Benutzer sieht den Papierkorb nicht',
      sehenCarla.status === 403, `Status ${sehenCarla.status}`);
    pruefe('Die Absage nennt den Grund',
      /nur der Admin/.test(sehenCarla.inhalt?.error || ''), sehenCarla.inhalt?.error);
    const sehenBert = await pkRuf('cookie-pk-bert', 'GET', '/api/papierkorb');
    pruefe('Ein Admin ohne Eigentuemerrolle sieht ihn',
      sehenBert.status === 200 && sehenBert.inhalt?.zeilen?.length === 1,
      JSON.stringify([sehenBert.status, sehenBert.inhalt?.zeilen?.length]));
    pruefe('Die Eigentuemerin auch',
      (await pkRuf('cookie-pk-anna', 'GET', '/api/papierkorb')).status === 200);

    // --- Wiederherstellen ---
    const zurueckCarla = await pkRuf('cookie-pk-carla', 'POST', `/api/papierkorb/${zeile.id ?? -1}/wiederherstellen`);
    pruefe('Ein gewoehnlicher Benutzer stellt nichts wieder her',
      zurueckCarla.status === 403, `Status ${zurueckCarla.status}`);
    pruefe('Und danach steht die Zeile unveraendert im Papierkorb',
      pkZeilen('SELECT id FROM papierkorb WHERE id = ?', zeile.id ?? -1).length === 1);
    pruefe('Und es ist KEIN Eintrag entstanden',
      pkZeilen("SELECT id FROM items WHERE title = 'Zum Wegwerfen'").length === 0);
    const zurueckBert = await pkRuf('cookie-pk-bert', 'POST', `/api/papierkorb/${zeile.id ?? -1}/wiederherstellen`);
    pruefe('Auch der Admin ohne Eigentuemerrolle nicht',
      zurueckBert.status === 403, `Status ${zurueckBert.status}`);
    pruefe('Die Absage nennt den Eigentuemer',
      /nur der Eigentümer/.test(zurueckBert.inhalt?.error || ''), zurueckBert.inhalt?.error);
    pruefe('Und wieder ist kein Eintrag entstanden',
      pkZeilen("SELECT id FROM items WHERE title = 'Zum Wegwerfen'").length === 0);

    // --- Endgueltig entfernen ---
    const wegCarla = await pkRuf('cookie-pk-carla', 'DELETE', `/api/papierkorb/${zeile.id ?? -1}`);
    pruefe('Ein gewoehnlicher Benutzer entfernt nichts endgueltig',
      wegCarla.status === 403, `Status ${wegCarla.status}`);
    const wegBert = await pkRuf('cookie-pk-bert', 'DELETE', `/api/papierkorb/${zeile.id ?? -1}`);
    pruefe('Der Admin ohne Eigentuemerrolle auch nicht', wegBert.status === 403, `Status ${wegBert.status}`);
    pruefe('Und die Zeile liegt nach beiden Absagen noch da',
      pkZeilen('SELECT id FROM papierkorb WHERE id = ?', zeile.id ?? -1).length === 1);

    // Der Erfolgsfall, beide Wege.
    const zurueckAnna = await pkRuf('cookie-pk-anna', 'POST', `/api/papierkorb/${zeile.id ?? -1}/wiederherstellen`);
    pruefe('Die Eigentuemerin kommt durch', zurueckAnna.status === 200, JSON.stringify(zurueckAnna.inhalt));
    pruefe('Und der Eintrag ist da',
      pkZeilen("SELECT id FROM items WHERE title = 'Zum Wegwerfen'").length === 1);

    const zweiterId = (await pkRuf('cookie-pk-carla', 'POST', '/api/items', { title: 'Zweites Opfer' })).inhalt?.id;
    await pkRuf('cookie-pk-carla', 'DELETE', `/api/items/${zweiterId}`);
    const zweiteZeile = pkEine('SELECT id FROM papierkorb') || {};
    pruefe('Die Eigentuemerin entfernt endgueltig',
      (await pkRuf('cookie-pk-anna', 'DELETE', `/api/papierkorb/${zweiteZeile.id ?? -1}`)).status === 204);
    pruefe('Und danach ist die Zeile weg',
      pkZeilen('SELECT id FROM papierkorb').length === 0);
    pruefe('Eine Zeile, die es nicht gibt, ist eine 404 und kein stiller Erfolg',
      (await pkRuf('cookie-pk-anna', 'DELETE', `/api/papierkorb/${zweiteZeile.id ?? -1}`)).status === 404);
    pruefe('Dasselbe beim Wiederherstellen',
      (await pkRuf('cookie-pk-anna', 'POST', `/api/papierkorb/${zweiteZeile.id ?? -1}/wiederherstellen`)).status === 404);
    // Aufraeumen
    pkSchreibe("DELETE FROM items WHERE title IN ('Zum Wegwerfen', 'Zweites Opfer')");
    pkSchreibe('DELETE FROM papierkorb');
  }

  /* ---------------------------------------------------------------- */
  gruppe('Ein einzelner Eintrag als Datei');

  /* Der kleinste Punkt der Runde -- und der, der dem Papierkorb sein Werkzeug
     liefert. Geprueft wird nicht nur das JSON, sondern die Datei, die durch
     den IMPORT wieder hereinkommt: dieselbe Form heisst, dass sie sich
     einspielen laesst. */
  {
    const voll = await pkRuf('cookie-pk-anna', 'GET', '/api/export?photos=1&files=1&videos=1');
    pruefe('Der volle Export geht durch', voll.status === 200, `Status ${voll.status}`);
    const zielId = pkEine("SELECT id FROM items WHERE title = 'Vollständig'").id;
    const einzeln = await pkRuf('cookie-pk-anna', `GET`, `/api/items/${zielId}/export`);
    pruefe('Der Einzelexport geht durch', einzeln.status === 200, JSON.stringify(einzeln.inhalt).slice(0, 200));
    pruefe('Er liefert genau EINEN Eintrag',
      einzeln.inhalt?.items?.length === 1, JSON.stringify(einzeln.inhalt?.items?.length));
    pruefe('Die Formatnummer bleibt bei 10',
      einzeln.inhalt?.version === 10, JSON.stringify(einzeln.inhalt?.version));
    pruefe('Der Umschlag traegt dieselben Felder wie beim vollen Export',
      gleich(Object.keys(einzeln.inhalt || {}).sort(), Object.keys(voll.inhalt || {}).sort()),
      JSON.stringify(Object.keys(einzeln.inhalt || {})));
    pruefe('Und die Kriterien samt Gewichten',
      gleich(einzeln.inhalt?.criteria, voll.inhalt?.criteria) &&
      gleich(einzeln.inhalt?.criteriaGewichte, voll.inhalt?.criteriaGewichte),
      JSON.stringify([einzeln.inhalt?.criteria, einzeln.inhalt?.criteriaGewichte]));
    const ausVoll = (voll.inhalt?.items || []).find(i => i.title === 'Vollständig');
    pruefe('Der Eintrag selbst ist Zeichen fuer Zeichen derselbe wie im vollen Export',
      JSON.stringify(einzeln.inhalt?.items?.[0]) === JSON.stringify(ausVoll) && !!ausVoll,
      JSON.stringify(Object.keys(einzeln.inhalt?.items?.[0] || {})));

    // Die Datei kommt durch den IMPORT wieder herein.
    const wieder = await pkImport('cookie-pk-anna', einzeln.inhalt, 'merge');
    pruefe('Die Datei laesst sich einspielen',
      wieder.status === 200 && wieder.inhalt?.items === 1, JSON.stringify(wieder.inhalt));
    pruefe('Mit Fotos, Video, Dateien und Kommentaren',
      wieder.inhalt?.photos === 1 && wieder.inhalt?.videos === 1 &&
      wieder.inhalt?.attachments === 2 && wieder.inhalt?.comments === 4,
      JSON.stringify(wieder.inhalt));
    const kopien = pkZeilen("SELECT id FROM items WHERE title = 'Vollständig' ORDER BY id");
    pruefe('Und es steht ein zweiter Eintrag desselben Namens da',
      kopien.length === 2, JSON.stringify(kopien));
    const kopieId = kopien[kopien.length - 1].id;
    pruefe('Seine Fotos sind bytegleich mit denen des Originals',
      gleich(pkZeilen("SELECT art, sort_order, hex(data) AS h FROM photos WHERE item_id = ? ORDER BY sort_order", kopieId),
             pkZeilen("SELECT art, sort_order, hex(data) AS h FROM photos WHERE item_id = ? ORDER BY sort_order", zielId)));
    pkSchreibe('DELETE FROM items WHERE id = ?', kopieId);

    // Der Waechter am Einzelexport.
    const einzelCarla = await pkRuf('cookie-pk-carla', 'GET', `/api/items/${zielId}/export`);
    pruefe('Ein gewoehnlicher Benutzer zieht keinen Einzelexport',
      einzelCarla.status === 403, `Status ${einzelCarla.status}`);
    const einzelBert = await pkRuf('cookie-pk-bert', 'GET', `/api/items/${zielId}/export`);
    pruefe('Ein Admin ohne Eigentuemerrolle auch nicht',
      einzelBert.status === 403, `Status ${einzelBert.status}`);
    pruefe('Die Absage nennt den Eigentuemer',
      /nur der Eigentümer/.test(einzelBert.inhalt?.error || ''), einzelBert.inhalt?.error);
    pruefe('Ein Eintrag, den es nicht gibt, ist eine 404',
      (await pkRuf('cookie-pk-anna', 'GET', '/api/items/999999/export')).status === 404);
  }

  await PK.stopp();
  fs.rmSync(pkDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Die Sicherung auf Knopfdruck');

  /* VACUUM INTO an einer ECHTEN, verschluesselten Anlage: die Kopie entsteht,
     sie ist OHNE Schluessel nicht lesbar, MIT Schluessel vollstaendig, und der
     Ausgangsstand ist danach unveraendert.
     ES GIBT KEINEN ZWEITEN WEG -- db.backup() liefe schrittweise und
     blockierte nicht, scheitert an einer SQLCipher-Datenbank aber mit
     "backup is not supported with incompatible source and target databases".
     Auch das wird hier nachgestellt statt geglaubt. */
  const siWurzel = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-sicherungsort-'));
  fs.mkdirSync(path.join(siWurzel, 'taeglich'));
  fs.mkdirSync(path.join(siWurzel, 'leer'));
  const siDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-sicherung-'));
  {
    kurzlauf(`require('./db'); console.log('da');`, siDir);
    const d = oeffne(path.join(siDir, 'katalog.sqlite'));
    for (const n of ['anna', 'bert', 'carla'])
      d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(n, 'x');
    for (const [t, u] of [['cookie-si-anna', 1], ['cookie-si-bert', 2], ['cookie-si-carla', 3]])
      d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(t, u);
    d.prepare("INSERT INTO items (title, user_id) VALUES ('Ein Merkmal', 1)").run();
    d.close();
  }
  /* EIN SYMLINK, DER AUS DER WURZEL HERAUSFUEHRT -- und zwar ausgerechnet ins
     DATENVERZEICHNIS. Am String sieht "zeigtAufDaten" harmlos aus; erst der
     aufgeloeste Pfad verraet ihn. Genau daran haengt die Pruefung. */
  fs.symlinkSync(siDir, path.join(siWurzel, 'zeigtAufDaten'));
  const SI = starteWeiterenServer(siDir, { SICHERUNG_DIR: siWurzel }, 4300);
  await SI.bereit;
  // bert bekommt die Adminrolle -- OHNE Eigentuemerrolle.
  {
    const d = oeffne(path.join(siDir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    d.prepare("UPDATE users SET role = 'admin' WHERE username = 'bert'").run();
    d.close();
  }
  const siRuf = async (cookieWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${cookieWert}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(SI.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };
  const siDateien = (unter) => fs.readdirSync(path.join(siWurzel, unter || '.'))
    .filter(n => /^kriterion-.*\.sqlite$/.test(n)).sort();
  const siAlleDateien = () => [...siDateien(''), ...siDateien('taeglich'), ...siDateien('leer')];

  const siStand = await siRuf('cookie-si-anna', 'GET', '/api/sicherung');
  pruefe('Die Karte ist eingerichtet',
    siStand.inhalt?.eingerichtet === true, JSON.stringify(siStand.inhalt));
  pruefe('Sie nennt die eingerichtete Wurzel',
    siStand.inhalt?.wurzel === fs.realpathSync(siWurzel), JSON.stringify(siStand.inhalt?.wurzel));
  pruefe('Und die erwartete Dauer aus der Groesse der Datenbank',
    Number.isInteger(siStand.inhalt?.dauerSekunden) && siStand.inhalt.dauerSekunden >= 1,
    JSON.stringify([siStand.inhalt?.dbBytes, siStand.inhalt?.dauerSekunden]));
  pruefe('Noch liegt dort keine Sicherung',
    siStand.inhalt?.erreichbar === true && siStand.inhalt?.letzte === null,
    JSON.stringify(siStand.inhalt?.letzte));

  /* --- DER ZIELORT IN BEIDE RICHTUNGEN ---
     Zu jeder Absage die Nachschau, dass DANACH KEINE DATEI DA LIEGT -- eine
     Absage, nach der trotzdem etwas geschrieben wurde, waere das Schlimmste. */
  const siAbsagen = [
    ['../raus', 'ein Pfad nach oben', /Unterverzeichnis/],
    ['/etc', 'ein absoluter Pfad', /Unterverzeichnis/],
    ['a/../b', 'ein Punktpunkt mitten im Pfad', /Unterverzeichnis/],
    ['..', 'ein nacktes Punktpunkt', /Unterverzeichnis/],
    ['taeglich\\weg', 'ein Gegenschraegstrich', /Unterverzeichnis/],
    ['gibtsnicht', 'ein Verzeichnis, das es nicht gibt', /gibt es unter dem Sicherungsort nicht/],
    ['zeigtAufDaten', 'ein Symlink aus der Wurzel heraus', /führt aus dem/]
  ];
  for (const [ort, was, muster] of siAbsagen) {
    const r = await siRuf('cookie-si-anna', 'PUT', '/api/sicherung/ort', { ort });
    pruefe(`Abgewiesen: ${was}`, r.status === 400, `Status ${r.status} · ${JSON.stringify(r.inhalt)}`);
    pruefe(`Und die Begruendung spricht: ${was}`,
      muster.test(r.inhalt?.error || ''), r.inhalt?.error);
    pruefe(`Und nach der Absage liegt keine Datei da: ${was}`,
      siAlleDateien().length === 0, siAlleDateien().join(' · '));
  }
  pruefe('Ein nicht angelegtes Verzeichnis wird auch NICHT angelegt',
    !fs.existsSync(path.join(siWurzel, 'gibtsnicht')), 'es wurde still angelegt');
  pruefe('Und der eingestellte Ort steht nach allen Absagen unveraendert leer',
    (await siRuf('cookie-si-anna', 'GET', '/api/sicherung')).inhalt?.ort === '',
    JSON.stringify((await siRuf('cookie-si-anna', 'GET', '/api/sicherung')).inhalt?.ort));

  const siGut = await siRuf('cookie-si-anna', 'PUT', '/api/sicherung/ort', { ort: 'taeglich' });
  pruefe('Ein erlaubter Ort geht durch',
    siGut.status === 200 && siGut.inhalt?.ort === 'taeglich', JSON.stringify(siGut.inhalt));
  pruefe('Und er steht danach in der Antwort der Karte',
    (await siRuf('cookie-si-anna', 'GET', '/api/sicherung')).inhalt?.ort === 'taeglich');
  pruefe('Der leere Ort ist die Wurzel selbst und ebenfalls erlaubt',
    (await siRuf('cookie-si-anna', 'PUT', '/api/sicherung/ort', { ort: '' })).status === 200);
  await siRuf('cookie-si-anna', 'PUT', '/api/sicherung/ort', { ort: 'taeglich' });

  /* --- DIE KOPIE SELBST --- */
  const siVorherBytes = fs.statSync(path.join(siDir, 'katalog.sqlite')).size;
  const siVorherEintraege = (() => {
    const d = oeffne(path.join(siDir, 'katalog.sqlite'));
    const n = d.prepare('SELECT COUNT(*) n FROM items').get().n;
    d.close();
    return n;
  })();
  const siLos = await siRuf('cookie-si-anna', 'POST', '/api/sicherung');
  pruefe('Die Sicherung geht durch', siLos.status === 200, JSON.stringify(siLos.inhalt));
  pruefe('Der Name traegt Datum und Uhrzeit',
    /^kriterion-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.sqlite$/.test(siLos.inhalt?.datei || ''),
    siLos.inhalt?.datei);
  pruefe('Die Datei liegt am eingestellten Ort',
    siDateien('taeglich').includes(siLos.inhalt?.datei), siDateien('taeglich').join(' · '));
  pruefe('Und nirgendwo sonst',
    siDateien('').length === 0 && siDateien('leer').length === 0,
    siAlleDateien().join(' · '));
  /* JEDE LESESTELLE ABGEFANGEN (Stolperstein 103): faellt der Name aus der
     Antwort, sollen die Pruefungen darunter ROT werden und nicht der Lauf
     abreissen. Beim Bau hat genau das drei Gegenproben um ihre Auskunft
     gebracht. */
  const siKopie = path.join(siWurzel, 'taeglich',
    siLos.inhalt?.datei || '(keine-datei-in-der-antwort)');
  /* OHNE SCHLUESSEL IST SIE NICHT LESBAR -- das ist die Zusicherung, um
     derentwillen VACUUM INTO gewaehlt wurde, und sie steht nicht nur im
     Projektstand. */
  let siOhne = '';
  try {
    if (!fs.existsSync(siKopie)) throw new Error('(die Kopie gibt es nicht)');
    const k = new Database(siKopie, { readonly: true });
    k.prepare('SELECT COUNT(*) n FROM items').get();
    k.close();
    siOhne = '(sie war lesbar)';
  } catch (e) { siOhne = e.message; }
  pruefe('Ohne Schluessel meldet die Kopie "file is not a database"',
    /file is not a database/.test(siOhne), siOhne);
  const siMit = (() => {
    try {
      if (!fs.existsSync(siKopie)) return { fehler: '(die Kopie gibt es nicht)' };
      const k = oeffne(siKopie);
      const zahl = k.prepare('SELECT COUNT(*) n FROM items').get().n;
      const tabellen = k.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(z => z.name);
      const zugaenge = k.prepare('SELECT COUNT(*) n FROM users').get().n;
      const sitzungen = k.prepare('SELECT COUNT(*) n FROM sessions').get().n;
      k.close();
      return { zahl, tabellen, zugaenge, sitzungen };
    } catch (e) { return { fehler: e.message }; }
  })();
  pruefe('Mit Schluessel laesst sie sich oeffnen', !siMit.fehler, siMit.fehler);
  pruefe('Und sie ist vollstaendig -- Bestand, Zugaenge UND Sitzungen',
    siMit.zahl === siVorherEintraege && siMit.zugaenge === 3 && siMit.sitzungen === 3,
    JSON.stringify([siMit.zahl, siMit.zugaenge, siMit.sitzungen]));
  pruefe('Auch die Tabellen des Papierkorbs stehen darin',
    (siMit.tabellen || []).includes('papierkorb') && (siMit.tabellen || []).includes('papierkorb_bytes'),
    JSON.stringify(siMit.tabellen));
  pruefe('Der Ausgangsstand ist danach unveraendert',
    (() => { const d = oeffne(path.join(siDir, 'katalog.sqlite'));
             const n = d.prepare('SELECT COUNT(*) n FROM items').get().n; d.close();
             return n === siVorherEintraege; })(),
    `vorher ${siVorherEintraege} Eintraege, Datei vorher ${siVorherBytes} Bytes`);

  /* DER ARBEITSNAME, und er ist die Antwort auf Stolperstein 8. Eine
     halbfertige Kopie traegt nie den endgueltigen Namen: geschrieben wird auf
     <name>.wird, umbenannt wird erst danach. Damit kann sie gar nicht als
     fertige Sicherung gelesen werden.
     GEPRUEFT WIRD BEIDES: dass nach einem geglueckten Lauf keine Arbeitsdatei
     zurueckbleibt, und dass eine liegengebliebene ueberhaupt nicht mitzaehlt.
     Die zweite Zeile ist die tragende -- sie gilt auch dann, wenn das
     Aufraeumen einmal scheitert. */
  pruefe('Nach einer geglueckten Sicherung liegt keine Arbeitsdatei mehr da',
    fs.readdirSync(path.join(siWurzel, 'taeglich')).filter(n => n.endsWith('.wird')).length === 0,
    fs.readdirSync(path.join(siWurzel, 'taeglich')).join(' · '));
  {
    const liegengeblieben = path.join(siWurzel, 'taeglich', 'kriterion-2020-01-01-00-00-00.sqlite.wird');
    fs.writeFileSync(liegengeblieben, 'halbe Kopie');
    const vorher = await siRuf('cookie-si-anna', 'GET', '/api/sicherung');
    pruefe('Eine liegengebliebene Arbeitsdatei zaehlt nicht als Sicherung',
      vorher.inhalt?.zahl === 1 && vorher.inhalt?.letzte?.datei === siLos.inhalt?.datei,
      JSON.stringify({ zahl: vorher.inhalt?.zahl, letzte: vorher.inhalt?.letzte?.datei }));
    pruefe('Und sie liegt trotzdem noch da -- angefasst wird sie nicht',
      fs.existsSync(liegengeblieben), 'die fremde Datei wurde entfernt');
    fs.unlinkSync(liegengeblieben);
  }

  /* EINE VORHANDENE ZIELDATEI WIRD NICHT UEBERSCHRIEBEN. Nachgestellt statt
     geglaubt: VACUUM INTO antwortet auf eine vorhandene Datei mit "output file
     already exists". Der Name mit Datum und Uhrzeit ist der Weg dorthin, nicht
     die Rettung -- deshalb wird BEIDES geprueft. */
  {
    const d = oeffne(path.join(siDir, 'katalog.sqlite'));
    const ziel = path.join(siWurzel, 'leer', 'schon-da.sqlite');
    // Erst eine ECHTE Kopie dorthin, dann noch einmal auf denselben Pfad.
    d.prepare('VACUUM INTO ?').run(ziel);
    const vorher = fs.statSync(ziel).size;
    let meldung = '(sie ging durch)';
    try { d.prepare('VACUUM INTO ?').run(ziel); } catch (e) { meldung = e.message; }
    d.close();
    pruefe('VACUUM INTO scheitert an einer vorhandenen Zieldatei',
      /already exists/.test(meldung), meldung);
    pruefe('Und die vorhandene Datei ist unangetastet',
      fs.statSync(ziel).size === vorher, `${fs.statSync(ziel).size} statt ${vorher}`);
    // Und dasselbe an einer Datei, die gar keine Datenbank ist: auch sie wird
    // nicht ueberschrieben, nur mit einer anderen Meldung.
    const fremd = path.join(siWurzel, 'leer', 'fremd.sqlite');
    fs.writeFileSync(fremd, 'nicht anfassen');
    const d2 = oeffne(path.join(siDir, 'katalog.sqlite'));
    let meldung2 = '(sie ging durch)';
    try { d2.prepare('VACUUM INTO ?').run(fremd); } catch (e) { meldung2 = e.message; }
    d2.close();
    pruefe('Auch eine fremde Datei wird nicht ueberschrieben',
      meldung2 !== '(sie ging durch)' &&
      fs.readFileSync(fremd, 'utf8') === 'nicht anfassen', `${meldung2} · ` +
      fs.readFileSync(fremd, 'utf8').slice(0, 40));
    fs.unlinkSync(ziel);
    fs.unlinkSync(fremd);
  }
  /* Und der zweite Griff am laufenden Server legt eine ZWEITE Datei an, statt
     die erste zu fressen. Eine Sicherung, die die vorige frisst, ist keine. */
  await new Promise(r => setTimeout(r, 1100));
  const siZweite = await siRuf('cookie-si-anna', 'POST', '/api/sicherung');
  pruefe('Ein zweiter Griff legt eine zweite Datei an',
    siZweite.status === 200 && siZweite.inhalt?.datei !== siLos.inhalt?.datei,
    JSON.stringify([siLos.inhalt?.datei, siZweite.inhalt?.datei]));
  pruefe('Und die erste liegt unveraendert daneben',
    siDateien('taeglich').length === 2 && fs.existsSync(siKopie),
    siDateien('taeglich').join(' · '));

  /* "LETZTE SICHERUNG VOR N TAGEN" KOMMT AUS DEM DATEISYSTEM, nicht aus einem
     Schluessel in der Datenbank -- die Sache statt der Behauptung, wie beim
     Merker gegen den Index in 0.6.2. Beide Richtungen:
       das Datum der Datei von Hand alt gemacht -> die Zahl folgt
       ein Schluessel in settings von Hand gesetzt -> die Zahl folgt NICHT */
  {
    const vorTagen = (n) => new Date(Date.now() - n * 86400000);
    const beide = siDateien('taeglich');
    pruefe('Zwei Dateien liegen bereit, an denen sich das Datum setzen laesst',
      beide.length === 2, beide.join(' · '));
    for (const n of beide)
      fs.utimesSync(path.join(siWurzel, 'taeglich', n), vorTagen(9), vorTagen(9));
    if (fs.existsSync(siKopie)) fs.utimesSync(siKopie, vorTagen(4), vorTagen(4));
    const r = await siRuf('cookie-si-anna', 'GET', '/api/sicherung');
    pruefe('Die Zahl folgt dem Datum der Datei',
      r.inhalt?.letzte?.tageHer === 4 && !!siLos.inhalt?.datei &&
      r.inhalt?.letzte?.datei === siLos.inhalt.datei,
      JSON.stringify(r.inhalt?.letzte));
    pruefe('Und die juengste Datei ist die genannte',
      r.inhalt?.zahl === 2, JSON.stringify(r.inhalt?.zahl));
    // Ein Schluessel in settings darf nichts bewirken -- es gibt ihn nicht,
    // und wer ihn einfuehrt, faellt hier auf.
    const d = oeffne(path.join(siDir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    d.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('letzteSicherung', ?)")
      .run(JSON.stringify('1999-01-01 00:00:00'));
    d.close();
    const r2 = await siRuf('cookie-si-anna', 'GET', '/api/sicherung');
    pruefe('Ein Schluessel in settings bewegt die Zahl NICHT',
      r2.inhalt?.letzte?.tageHer === 4, JSON.stringify(r2.inhalt?.letzte));
    const d2 = oeffne(path.join(siDir, 'katalog.sqlite'));
    d2.pragma('busy_timeout = 4000');
    d2.prepare("DELETE FROM settings WHERE key = 'letzteSicherung'").run();
    d2.close();
  }

  /* EIN UNERREICHBARER ZIELORT LIEFERT KEINE AUSKUNFT -- und die Karte sagt
     GENAU DAS statt einer Zahl. Das ist der Preis der Entscheidung fuer das
     Dateisystem, und er gehoert belegt. */
  {
    /* EIN EIGENES VERZEICHNIS, das verschwinden darf. Der eingestellte Ort
       „taeglich" bleibt dabei unangetastet -- eine Prueflage, die ihn
       wegzieht und hinterher zurueckschiebt, laesst sich nach einem Rueckbau
       womoeglich gar nicht mehr herstellen und risse dann den Lauf ab. */
    fs.mkdirSync(path.join(siWurzel, 'verschwindet'));
    await siRuf('cookie-si-anna', 'PUT', '/api/sicherung/ort', { ort: 'verschwindet' });
    fs.rmdirSync(path.join(siWurzel, 'verschwindet'));
    const r = await siRuf('cookie-si-anna', 'GET', '/api/sicherung');
    pruefe('Ein verschwundener Zielort ergibt keine Zahl, sondern eine Ansage',
      r.inhalt?.letzte === null && !!r.inhalt?.fehler, JSON.stringify(r.inhalt));
    pruefe('Und die Ansage spricht',
      /gibt es unter dem Sicherungsort nicht/.test(r.inhalt?.fehler || ''), r.inhalt?.fehler);
    const los = await siRuf('cookie-si-anna', 'POST', '/api/sicherung');
    pruefe('Und der Knopf laeuft dort nicht ins Leere, sondern sagt ab',
      los.status === 400, `Status ${los.status} · ${JSON.stringify(los.inhalt)}`);
    pruefe('Nach dieser Absage liegt keine neue Datei da',
      siDateien('').length === 0, siDateien('').join(' · '));
    fs.rmSync(path.join(siWurzel, 'verschwindet'), { recursive: true, force: true });
    await siRuf('cookie-si-anna', 'PUT', '/api/sicherung/ort', { ort: 'taeglich' });
  }

  /* --- DIE RECHTE. Zu jeder Verweigerung der Erfolgsfall daneben und die
     Nachschau, dass nichts geschrieben wurde. Und ein Admin OHNE
     Eigentuemerrolle gehoert dazu. --- */
  {
    const vorher = siDateien('taeglich').length;
    for (const [wer, name] of [['cookie-si-carla', 'Ein gewoehnlicher Benutzer'],
                               ['cookie-si-bert', 'Ein Admin ohne Eigentuemerrolle']]) {
      const lesen = await siRuf(wer, 'GET', '/api/sicherung');
      pruefe(`${name} sieht die Karte nicht`, lesen.status === 403, `Status ${lesen.status}`);
      const ort = await siRuf(wer, 'PUT', '/api/sicherung/ort', { ort: 'leer' });
      pruefe(`${name} stellt den Zielort nicht um`, ort.status === 403, `Status ${ort.status}`);
      const los = await siRuf(wer, 'POST', '/api/sicherung');
      pruefe(`${name} sichert nicht`, los.status === 403, `Status ${los.status}`);
      pruefe(`Und nach seinen Absagen liegt keine neue Datei da: ${name}`,
        siDateien('taeglich').length === vorher && siDateien('leer').length === 0,
        siAlleDateien().join(' · '));
    }
    pruefe('Der eingestellte Ort steht danach unveraendert auf taeglich',
      (await siRuf('cookie-si-anna', 'GET', '/api/sicherung')).inhalt?.ort === 'taeglich');
    /* Eine Sekunde Abstand: der Dateiname traegt Datum und UHRZEIT auf die
       Sekunde genau, und zwei Sicherungen in derselben Sekunde sind eine
       Kollision -- die 409 ist richtig, hier aber nicht die Frage. */
    await new Promise(r => setTimeout(r, 1100));
    const los = await siRuf('cookie-si-anna', 'POST', '/api/sicherung');
    pruefe('Die Eigentuemerin kommt durch', los.status === 200, JSON.stringify(los.inhalt));
  }
  /* DER PROTOKOLLBELEG ZULETZT: die Ausgabe des Kindprozesses wird gepuffert,
     und unmittelbar nach dem Start ist die Zeile womoeglich noch gar nicht
     angekommen. Hier liegt der ganze Verkehr der Gruppe dazwischen. */
  pruefe('Der Start nennt den Sicherungsort im Protokoll',
    /\[Kriterion\] Sicherungsort: /.test(SI.protokoll()), SI.protokoll().slice(0, 400));
  pruefe('Und jede geschriebene Sicherung steht ebenfalls darin',
    (SI.protokoll().match(/\[Kriterion\] Sicherung geschrieben: /g) || []).length >= 3,
    (SI.protokoll().match(/\[Kriterion\] Sicherung geschrieben: .*/g) || []).join(' · '));
  await SI.stopp();

  /* --- DER SICHERUNGSORT DARF NICHT IM DATENVERZEICHNIS LIEGEN. Eine eigene
     Anlage, deren Wurzel genau dort steht: die Karte bleibt aus und sagt,
     warum. --- */
  {
    const dDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-sicherung-daneben-'));
    kurzlauf(`require('./db'); console.log('da');`, dDir);
    fs.mkdirSync(path.join(dDir, 'sicherung'));
    const d = oeffne(path.join(dDir, 'katalog.sqlite'));
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('anna', 'x')").run();
    d.prepare("INSERT INTO sessions (token, user_id) VALUES ('cookie-sd-anna', 1)").run();
    d.close();
    const SD = starteWeiterenServer(dDir, { SICHERUNG_DIR: path.join(dDir, 'sicherung') }, 4360);
    await SD.bereit;
    const a = await fetch(SD.basis + '/api/sicherung',
      { headers: { cookie: 'kriterion_session=cookie-sd-anna' } });
    const inhalt = await a.json().catch(() => null);
    pruefe('Ein Sicherungsort IM Datenverzeichnis bleibt aus',
      inhalt?.eingerichtet === false, JSON.stringify(inhalt));
    pruefe('Und sagt, warum',
      /nicht im Datenverzeichnis/.test(inhalt?.grund || ''), inhalt?.grund);
    pruefe('Der Knopf sagt dort ebenfalls ab',
      (await (await fetch(SD.basis + '/api/sicherung', { method: 'POST',
        headers: { cookie: 'kriterion_session=cookie-sd-anna' } })).json()
      ).error?.includes('Datenverzeichnis'), 'keine sprechende Absage');
    pruefe('Der Start sagt es im Protokoll',
      /Sicherungsort: aus — .*Datenverzeichnis/.test(SD.protokoll()), SD.protokoll().slice(0, 500));
    await SD.stopp();
    fs.rmSync(dDir, { recursive: true, force: true });
  }

  /* --- OHNE SICHERUNG_DIR bleibt die Karte aus und sagt es. Das ist der
     Zustand jeder Anlage, die den Einhaengepunkt noch nicht hat. --- */
  {
    const oDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-sicherung-ohne-'));
    kurzlauf(`require('./db'); console.log('da');`, oDir);
    const d = oeffne(path.join(oDir, 'katalog.sqlite'));
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('anna', 'x')").run();
    d.prepare("INSERT INTO sessions (token, user_id) VALUES ('cookie-so-anna', 1)").run();
    d.close();
    const SO = starteWeiterenServer(oDir, { SICHERUNG_DIR: '' }, 4420);
    await SO.bereit;
    const inhalt = await (await fetch(SO.basis + '/api/sicherung',
      { headers: { cookie: 'kriterion_session=cookie-so-anna' } })).json().catch(() => null);
    pruefe('Ohne eingerichteten Ort bleibt die Karte aus',
      inhalt?.eingerichtet === false, JSON.stringify(inhalt));
    pruefe('Und nennt den Weg dorthin',
      /docker-compose\.yml/.test(inhalt?.grund || ''), inhalt?.grund);
    await SO.stopp();
    fs.rmSync(oDir, { recursive: true, force: true });
  }

  /* --- ES GIBT KEINEN ZWEITEN WEG, nachgestellt statt geglaubt: db.backup()
     liefe schrittweise und blockierte den Server nicht -- und scheitert an
     einer verschluesselten Anlage. Das ist die Begruendung dafuer, dass
     VACUUM INTO synchron laeuft und die Karte die Dauer vorher nennt. --- */
  {
    const d = oeffne(path.join(siDir, 'katalog.sqlite'));
    pruefe('better-sqlite3 bringt einen schrittweisen Weg ueberhaupt mit',
      typeof d.backup === 'function', typeof d.backup);
    let meldung = '(sie ging durch)';
    try { await d.backup(path.join(siWurzel, 'leer', 'schritt.sqlite')); }
    catch (e) { meldung = e.message; }
    d.close();
    pruefe('Er scheitert an einer verschluesselten Anlage',
      /not supported with incompatible source and target/.test(meldung), meldung);
    pruefe('Und hinterlaesst keine brauchbare Kopie',
      siDateien('leer').length === 0, siDateien('leer').join(' · '));
  }

  fs.rmSync(siWurzel, { recursive: true, force: true });
  fs.rmSync(siDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Rechte am Eintrag');

  /* Drei Zugaenge, drei fertige Sitzungen. Eine Rechteschicht laesst
     sich nur mit zwei echten Rufern nebeneinander belegen. "Darf nicht"
     ist die Stelle, an der eine gruene Pruefung am wenigsten wert ist: zu
     JEDER Verweigerung gehoert deshalb der Erfolgsfall daneben UND die
     Nachschau in der Datenbank, dass wirklich nichts geschrieben wurde. Ein
     403, nach dem die Zeile trotzdem steht, waere das Schlimmste.

     anna  = kleinste id, also Eigentuemerin -- und ueber die Startregel
             ("gibt es keinen Admin, wird es der Eigentuemer") auch Admin.
     bert  = gewoehnlicher Benutzer, Verfasser eines eigenen Eintrags.
     carla = gewoehnlicher Benutzer, an nichts beteiligt -- der Fremde.

     DER SCHLUESSEL LIEGT HIER ALS DATEI statt in der Umgebung: nur dann
     liefert /api/stats ueberhaupt einen Schluesselwert, und nur dann laesst
     sich pruefen, dass ihn allein die Eigentuemerin bekommt. */
  function legeRechteBestandAn() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-stufef-'));
    kurzlauf(`require('./db'); console.log('da');`, dir);
    fs.writeFileSync(path.join(dir, 'encryption.key'), KEY, { mode: 0o600 });
    const d = oeffne(path.join(dir, 'katalog.sqlite'));
    for (const n of ['anna', 'bert', 'carla'])
      d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(n, 'x');
    for (const [t, u] of [['cookie-f-anna', 1], ['cookie-f-bert', 2], ['cookie-f-carla', 3]])
      d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(t, u);
    d.prepare('INSERT INTO items (title, user_id) VALUES (?, 1)').run('Von Anna');
    d.prepare('INSERT INTO items (title, user_id) VALUES (?, 2)').run('Von Bert');
    d.prepare('INSERT INTO items (title, user_id) VALUES (?, 1)').run('Herrenlos');
    // An Berts Eintrag haengt alles, was ein Fremder anfassen koennte.
    d.prepare("INSERT INTO photos (item_id, mime_type, data, sort_order) VALUES (2, 'image/jpeg', ?, 0)")
      .run(Buffer.from('kein echtes Bild, wird nur geloescht'));
    /* Die Datei traegt ihren Verfasser ausdruecklich -- derselbe Grund wie an
       der Linkzeile darunter (Stolperstein 104): ohne user_id schoebe sie
       ordneBestandZu() beim Start der Eigentuemerin zu, und "der Admin loescht
       eine FREMDE Datei" loeschte dann eine eigene. */
    d.prepare("INSERT INTO attachments (item_id, filename, mime_type, size, data, user_id) VALUES (2, 'zettel.txt', 'text/plain', 5, ?, 2)")
      .run(Buffer.from('hallo'));
    /* Der Link traegt seinen Verfasser ausdruecklich: ohne user_id schoebe ihn
       ordneBestandZu() beim Start der Eigentuemerin zu, und "der Admin loescht
       einen FREMDEN Link" weiter unten loeschte dann einen eigenen -- gruen,
       aber ueber etwas anderes. */
    d.prepare("INSERT INTO links (item_id, url, sort_order, user_id) VALUES (2, 'https://beispiel.test', 0, 2)").run();
    // Ids abholen statt raten: db.js legt auf einer frischen Datenbank drei
    // Vorgabekriterien an, und danach faengt die Nummerierung nicht bei 1
    // an -- geratene Ids reissen den Lauf mit
    // "FOREIGN KEY constraint failed" ab.
    const markeId = d.prepare("INSERT INTO tags (name) VALUES ('Marke')").run().lastInsertRowid;
    d.prepare('INSERT INTO item_tags (item_id, tag_id) VALUES (2, ?)').run(markeId);
    // Kommentare: einer von bert (mit Bild), einer von anna.
    d.prepare("INSERT INTO comments (item_id, text, user_id) VALUES (2, 'Berts Kommentar', 2)").run();
    d.prepare("INSERT INTO comments (item_id, text, user_id) VALUES (2, 'Annas Kommentar', 1)").run();
    // ZWEI Bilder: eines loescht der Verfasser selbst, eines der Admin. Ohne
    // das erste Paar bliebe die Spalte c.user_id im SELECT der Loeschroute
    // ungeprueft -- fuer den Admin entscheidet sie gar nicht mit, weil die
    // Adminfrage schon vorher wahr ist.
    for (const n of ['berts-bild.jpg', 'berts-zweites-bild.jpg'])
      d.prepare("INSERT INTO comment_images (comment_id, filename, data) VALUES (1, ?, ?)")
        .run(n, Buffer.from('kein echtes Bild'));
    d.prepare("INSERT INTO test_days (item_id, day, rating, user_id) VALUES (2, '2024-05-05', 4, 2)").run();
    d.prepare('UPDATE items SET tested = 1 WHERE id = 2').run();
    d.prepare('DELETE FROM rating_criteria').run();
    const optikId = d.prepare("INSERT INTO rating_criteria (name, sort_order) VALUES ('Optik', 0)")
      .run().lastInsertRowid;
    d.prepare('INSERT INTO ratings (item_id, criterion_id, value, user_id) VALUES (2, ?, 5, 2)').run(optikId);
    d.close();
    return { dir, markeId, optikId };
  }

  const { dir: fDir, markeId: fMarkeId, optikId: fOptikId } = legeRechteBestandAn();
  const F = starteWeiterenServer(fDir, { ENCRYPTION_KEY: '' }, 5680);
  await F.bereit;

  const fRuf = async (cookieWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${cookieWert}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(F.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };
  /* Ein echter Multipart-Upload gegen DIESEN Server, mit DIESEM Cookie. Die
     vorhandene Hilfe sendeDateien() haengt fest am Hauptserver und an dessen
     Anmeldung; hier braucht es drei Rufer nebeneinander. Ohne echten Upload
     bewiese der Erfolgsfall nichts ueber die Route -- der Waechter stand vor
     multer, ein nachgereichter INSERT liefe an beidem vorbei. */
  const fUpload = async (cookieWert, itemId, name, inhalt) => {
    const grenze = '----pruefungf' + crypto.randomBytes(6).toString('hex');
    const teile = [
      Buffer.from(`--${grenze}\r\nContent-Disposition: form-data; name="files"; filename="${name}"\r\n` +
                  `Content-Type: text/plain\r\n\r\n`, 'utf8'),
      Buffer.from(inhalt, 'utf8'),
      Buffer.from(`\r\n--${grenze}--\r\n`, 'utf8')
    ];
    const a = await fetch(F.basis + `/api/items/${itemId}/attachments`, {
      method: 'POST',
      headers: { cookie: `kriterion_session=${cookieWert}`,
                 'content-type': `multipart/form-data; boundary=${grenze}` },
      body: Buffer.concat(teile)
    });
    return { status: a.status, inhalt: await a.json().catch(() => null) };
  };
  const fDatenbank = () => oeffne(path.join(fDir, 'katalog.sqlite'));
  const fZeilen = (sql, ...werte) => {
    const d = fDatenbank();
    const z = d.prepare(sql).all(...werte);
    d.close();
    return z;
  };
  const fEine = (sql, ...werte) => fZeilen(sql, ...werte)[0];
  /* Schreibender Zugriff neben dem laufenden Server -- im WAL-Modus erlaubt.
     Gebraucht wird er, um einen Zeitstempel von Hand zu leeren: datetime('now')
     loest nur Sekunden auf, und ob eine Anweisung ihn innerhalb derselben
     Sekunde neu gesetzt hat, waere sonst unbeweisbar (Stolperstein 60). */
  const fSchreibe = (sql, ...werte) => {
    const d = fDatenbank();
    d.pragma('busy_timeout = 4000');
    d.prepare(sql).run(...werte);
    d.close();
  };

  /* Die herrenlose Zeile ERST JETZT, nach dem Start: ordneBestandZu() laeuft
     bei jedem Start und wiese sie sonst der Eigentuemerin zu.
     Ein zweiter Schreiber neben dem laufenden Server ist im WAL-Modus erlaubt. */
  {
    const d = fDatenbank();
    d.pragma('busy_timeout = 4000');
    d.prepare('UPDATE items SET user_id = NULL WHERE title = ?').run('Herrenlos');
    d.close();
  }

  const fTitel = (id) => fEine('SELECT title FROM items WHERE id = ?', id)?.title;

  const fFremdTitel = await fRuf('cookie-f-carla', 'PUT', '/api/items/2', { title: 'Gekapert' });
  pruefe('Ein Fremder benennt einen Eintrag nicht um', fFremdTitel.status === 403,
    `Status ${fFremdTitel.status}`);
  pruefe('Und der Titel steht unveraendert da', fTitel(2) === 'Von Bert', fTitel(2));
  pruefe('Die Absage nennt den Grund',
    /angelegt hat/.test(fFremdTitel.inhalt?.error || ''), fFremdTitel.inhalt?.error);

  const fEigenTitel = await fRuf('cookie-f-bert', 'PUT', '/api/items/2', { description: 'von bert selbst' });
  pruefe('Der Verfasser aendert seinen eigenen Eintrag', fEigenTitel.status === 200,
    `Status ${fEigenTitel.status}`);
  const fAdminTitel = await fRuf('cookie-f-anna', 'PUT', '/api/items/2', { description: 'vom Admin berichtigt' });
  pruefe('Der Admin aendert auch einen fremden Eintrag', fAdminTitel.status === 200,
    `Status ${fAdminTitel.status}`);

  /* Die Ausnahme, und sie ist der Kern dieser Route: der Favorit ist
     persoenlich. Zur Gegenprobe gehoeren BEIDE Richtungen -- Klemme ganz weg
     macht die Verweigerung oben rot und laesst diese hier gruen, Klemme ueber
     die ganze Route genau umgekehrt. */
  const fFavor = await fRuf('cookie-f-carla', 'PUT', '/api/items/2', { favorite: true });
  pruefe('Ein Fremder setzt seinen eigenen Favoriten an einem fremden Eintrag',
    fFavor.status === 200, `Status ${fFavor.status}`);
  pruefe('Und der Favorit steht bei ihm, nicht beim Verfasser',
    gleich(fZeilen('SELECT user_id, item_id FROM item_pins').map(z => `${z.user_id}/${z.item_id}`), ['3/2']),
    JSON.stringify(fZeilen('SELECT user_id, item_id FROM item_pins')));

  /* Beides in einem Ruf: die Absage muss kommen, BEVOR der Favorit
     geschrieben ist. Sonst waere ein abgelehnter Ruf halb ausgefuehrt. */
  const fBeides = await fRuf('cookie-f-carla', 'PUT', '/api/items/2', { favorite: false, title: 'Gekapert' });
  pruefe('Favorit und Titel zusammen werden abgewiesen', fBeides.status === 403,
    `Status ${fBeides.status}`);
  pruefe('Und der Favorit ist dabei NICHT mit weggeraeumt worden',
    fZeilen('SELECT 1 FROM item_pins WHERE user_id = 3 AND item_id = 2').length === 1,
    JSON.stringify(fZeilen('SELECT user_id, item_id FROM item_pins')));

  const fLoeschFremd = await fRuf('cookie-f-carla', 'DELETE', '/api/items/2');
  pruefe('Ein Fremder loescht keinen Eintrag', fLoeschFremd.status === 403, `Status ${fLoeschFremd.status}`);
  pruefe('Und der Eintrag steht noch', fTitel(2) === 'Von Bert', fTitel(2));

  const fTagAn = await fRuf('cookie-f-carla', 'POST', '/api/items/2/tags', { name: 'Fremdtag' });
  const fTagWeg = await fRuf('cookie-f-carla', 'DELETE', `/api/items/2/tags/${fMarkeId}`);
  pruefe('Ein Fremder haengt keinen Tag an einen fremden Eintrag', fTagAn.status === 403,
    `Status ${fTagAn.status}`);
  pruefe('Und nimmt auch keinen weg', fTagWeg.status === 403, `Status ${fTagWeg.status}`);
  pruefe('Die Tags am Eintrag sind unveraendert',
    gleich(fZeilen('SELECT tag_id FROM item_tags WHERE item_id = 2').map(z => z.tag_id), [fMarkeId]),
    JSON.stringify(fZeilen('SELECT tag_id FROM item_tags WHERE item_id = 2')));

  /* ---- Die Linkzeile, seit 0.8.30 der fuenfte Traeger ---------------------
     UMGEDREHT MIT 0.8.30, NICHT GELOESCHT (Stolperstein 74): bis 0.8.20 stand
     hier "Ein Fremder haengt keinen Link an einen fremden Eintrag" mit 403.
     Genau das ist jetzt erlaubt -- und die Zeile daneben belegt, dass sie
     dabei SEINEN Namen bekommt und nicht den des Eintragsverfassers.
     Die Reihenfolge ist keine Bequemlichkeit: carla legt zuerst an, damit es
     ueberhaupt eine eigene Zeile zu loeschen gibt, und anna raeumt zuletzt
     berts Zeile weg -- danach ist die Liste leer. */
  const fLink = await fRuf('cookie-f-carla', 'POST', '/api/items/2/links', { url: 'https://fremd.test' });
  pruefe('Ein Fremder haengt einen Link an einen fremden Eintrag', fLink.status === 201,
    `Status ${fLink.status}`);
  const fLinkNeu = fEine("SELECT id, user_id FROM links WHERE url = 'https://fremd.test'");
  pruefe('Und die Zeile gehoert ihm, nicht dem Verfasser des Eintrags',
    fLinkNeu !== undefined && fLinkNeu.user_id === 3,
    JSON.stringify(fZeilen('SELECT id, url, user_id FROM links WHERE item_id = 2')));
  // Der Erfolgsfall hat die Liste wirklich verlaengert -- sonst waere ein 201
  // ohne Wirkung von einem mit nicht zu unterscheiden.
  pruefe('Die Linkliste ist um genau eine Zeile laenger',
    fZeilen('SELECT id FROM links WHERE item_id = 2').length === 2,
    JSON.stringify(fZeilen('SELECT id, url, user_id FROM links WHERE item_id = 2')));

  const fLinkWeg = await fRuf('cookie-f-carla', 'DELETE', '/api/links/1');
  pruefe('Ein Fremder loescht keinen fremden Link', fLinkWeg.status === 403, `Status ${fLinkWeg.status}`);
  pruefe('Und der fremde Link steht noch', fZeilen('SELECT id FROM links WHERE id = 1').length === 1);

  /* SORTIEREN BLEIBT BEIM EINTRAGSVERFASSER UND ADMIN. Ohne diese Zeile waere
     nicht zu unterscheiden, ob die Rechte an der Linkliste als Ganzes
     gefallen sind oder nur die an der einzelnen Zeile. */
  const fLinkOrdnungVorher = fZeilen('SELECT id, sort_order FROM links WHERE item_id = 2 ORDER BY id');
  const fLinkSort = await fRuf('cookie-f-carla', 'PUT', '/api/items/2/link-order',
    { order: [fLinkNeu?.id, 1] });
  pruefe('Ein Fremder sortiert die Linkliste nicht um', fLinkSort.status === 403,
    `Status ${fLinkSort.status}`);
  pruefe('Und die Reihenfolge steht unveraendert',
    gleich(fZeilen('SELECT id, sort_order FROM links WHERE item_id = 2 ORDER BY id'),
           fLinkOrdnungVorher),
    JSON.stringify(fZeilen('SELECT id, sort_order FROM links WHERE item_id = 2 ORDER BY id')));

  const fLinkEigen = await fRuf('cookie-f-carla', 'DELETE', `/api/links/${fLinkNeu?.id}`);
  pruefe('Aber seinen eigenen Link loescht er', fLinkEigen.status === 204, `Status ${fLinkEigen.status}`);
  pruefe('Und die Zeile ist wirklich weg',
    fZeilen('SELECT id FROM links WHERE id = ?', fLinkNeu?.id).length === 0);

  const fLinkAdmin = await fRuf('cookie-f-anna', 'DELETE', '/api/links/1');
  pruefe('Der Admin loescht einen fremden Link', fLinkAdmin.status === 204, `Status ${fLinkAdmin.status}`);
  pruefe('Und auch diese Zeile ist weg',
    fZeilen('SELECT id FROM links WHERE id = 1').length === 0);

  const fFokus = await fRuf('cookie-f-carla', 'PUT', '/api/photos/1/focus', { x: 10, y: 10 });
  const fFotoOrder = await fRuf('cookie-f-carla', 'PUT', '/api/items/2/photo-order', { order: [1] });
  const fFotoWeg = await fRuf('cookie-f-carla', 'DELETE', '/api/photos/1');
  pruefe('Ein Fremder verschiebt keinen Fokuspunkt', fFokus.status === 403, `Status ${fFokus.status}`);
  pruefe('Ein Fremder sortiert fremde Fotos nicht um', fFotoOrder.status === 403, `Status ${fFotoOrder.status}`);
  pruefe('Ein Fremder loescht kein fremdes Foto', fFotoWeg.status === 403, `Status ${fFotoWeg.status}`);
  pruefe('Das Foto steht noch, mit unveraendertem Fokuspunkt',
    gleich(fZeilen('SELECT focus_x, focus_y FROM photos WHERE id = 1'), [{ focus_x: 50, focus_y: 50 }]),
    JSON.stringify(fZeilen('SELECT focus_x, focus_y FROM photos')));

  /* ---- Das Video, seit 0.8.50 an der Stelle des Fotos --------------------
     NICHT wie die Datei umgedreht: ein Video haengt am Eintrag und gehoert
     damit seinem Verfasser, genau wie ein Foto. Wer den Eintrag aendern darf,
     darf Videos hinzufuegen; sonst niemand.
     MIT ECHTEM MULTIPART UPLOAD, nicht mit einem nachgereichten INSERT:
     der Waechter steht VOR multer, und ein INSERT liefe an beidem vorbei
     (die Lehre aus 0.8.31). Und zu jeder Verweigerung der Erfolgsfall
     daneben -- sonst bliebe die Absage auch dann gruen, wenn ueberhaupt
     nichts mehr hochladbar waere (Stolperstein 81). */
  const fVideoAn = async (cookieWert, itemId) => {
    const grenze = '----pruefungv' + crypto.randomBytes(6).toString('hex');
    const teil = (name, dateiname, typ, inhalt) => [
      Buffer.from(`--${grenze}\r\nContent-Disposition: form-data; name="${name}"; ` +
                  `filename="${dateiname}"\r\nContent-Type: ${typ}\r\n\r\n`, 'utf8'),
      inhalt, Buffer.from('\r\n', 'utf8')];
    const teile = [
      ...teil('video', 'clip.mp4', 'video/mp4', MP4()),
      ...teil('standbild', 'standbild.jpg', 'image/jpeg', Buffer.from(PNG_BASE64, 'base64')),
      Buffer.from(`--${grenze}\r\nContent-Disposition: form-data; name="dauer"\r\n\r\n5\r\n`, 'utf8'),
      Buffer.from(`--${grenze}--\r\n`, 'utf8')
    ];
    const a = await fetch(F.basis + `/api/items/${itemId}/videos`, {
      method: 'POST',
      headers: { cookie: `kriterion_session=${cookieWert}`,
                 'content-type': `multipart/form-data; boundary=${grenze}` },
      body: Buffer.concat(teile)
    });
    return { status: a.status, inhalt: await a.json().catch(() => null) };
  };
  const fVorher = fZeilen('SELECT id FROM photos WHERE item_id = 2').length;
  const fVideoFremd = await fVideoAn('cookie-f-carla', 2);
  pruefe('Ein Fremder laedt kein Video an einen fremden Eintrag', fVideoFremd.status === 403,
    `Status ${fVideoFremd.status}`);
  // Die Nachschau: nach dem 403 steht KEINE Zeile in photos.
  pruefe('Und nach der Absage steht keine neue Zeile in photos',
    fZeilen('SELECT id FROM photos WHERE item_id = 2').length === fVorher,
    JSON.stringify(fZeilen("SELECT id, art FROM photos WHERE item_id = 2")));
  const fVideoEigen = await fVideoAn('cookie-f-bert', 2);
  pruefe('Der Verfasser des Eintrags dagegen schon', fVideoEigen.status === 201,
    `Status ${fVideoEigen.status}: ${JSON.stringify(fVideoEigen.inhalt?.error)}`);
  const fVideoZeile = fEine("SELECT id, art, dauer FROM photos WHERE item_id = 2 AND art = 'video'");
  pruefe('Und die Zeile traegt art = video mit ihrer Dauer',
    fVideoZeile?.art === 'video' && fVideoZeile?.dauer === 5, JSON.stringify(fVideoZeile));
  const fVideoWeg = await fRuf('cookie-f-carla', 'DELETE', `/api/photos/${fVideoZeile?.id}`);
  pruefe('Ein Fremder loescht auch kein fremdes Video', fVideoWeg.status === 403,
    `Status ${fVideoWeg.status}`);
  pruefe('Und das Video liegt noch da',
    fZeilen('SELECT id FROM photos WHERE id = ?', fVideoZeile?.id).length === 1);

  /* ---- Die Datei, seit 0.8.31 der sechste Traeger ------------------------
     UMGEDREHT MIT 0.8.31, NICHT GELOESCHT (Stolperstein 74): bis 0.8.30 stand
     hier nur die Verweigerung. Hochladen ist jetzt offen -- und die Zeile
     daneben belegt, dass die Datei dabei SEINEN Namen bekommt.
     Der Erfolgsfall laeuft ueber einen echten Multipart-Upload; ein
     nachgereichter INSERT bewiese nichts ueber die Route. */
  const fDateiAn = await fUpload('cookie-f-carla', 2, 'von-carla.txt', 'inhalt von carla');
  pruefe('Ein Fremder haengt eine Datei an einen fremden Eintrag', fDateiAn.status === 201,
    `Status ${fDateiAn.status}`);
  const fDateiNeu = fEine("SELECT id, user_id FROM attachments WHERE filename = 'von-carla.txt'");
  pruefe('Und die Datei gehoert ihm, nicht dem Verfasser des Eintrags',
    fDateiNeu !== undefined && fDateiNeu.user_id === 3,
    JSON.stringify(fZeilen('SELECT id, filename, user_id FROM attachments')));
  pruefe('Die Dateiliste ist um genau eine Zeile laenger',
    fZeilen('SELECT id FROM attachments WHERE item_id = 2').length === 2,
    JSON.stringify(fZeilen('SELECT id, filename, user_id FROM attachments')));

  const fDateiWeg = await fRuf('cookie-f-carla', 'DELETE', '/api/attachments/1');
  pruefe('Ein Fremder loescht keine fremde Datei', fDateiWeg.status === 403, `Status ${fDateiWeg.status}`);
  pruefe('Und die fremde Datei liegt noch da',
    fZeilen('SELECT id FROM attachments WHERE id = 1').length === 1);

  const fDateiEigen = await fRuf('cookie-f-carla', 'DELETE', `/api/attachments/${fDateiNeu?.id}`);
  pruefe('Aber seine eigene Datei loescht er', fDateiEigen.status === 200,
    `Status ${fDateiEigen.status}`);
  pruefe('Und sie ist wirklich weg',
    fZeilen('SELECT id FROM attachments WHERE id = ?', fDateiNeu?.id).length === 0);

  const fDateiAdmin = await fRuf('cookie-f-anna', 'DELETE', '/api/attachments/1');
  pruefe('Der Admin loescht eine fremde Datei', fDateiAdmin.status === 200, `Status ${fDateiAdmin.status}`);
  pruefe('Und auch diese Zeile ist weg',
    fZeilen('SELECT id FROM attachments WHERE id = 1').length === 0);

  /* Eine herrenlose Zeile gehoert dem Admin. Ohne die Klemme auf null waere
     sie fuer jeden offen -- und genau solche Zeilen entstehen, wenn ein
     Zugang samt Beitraegen geloescht wird. */
  const fHerrenlosFremd = await fRuf('cookie-f-carla', 'PUT', '/api/items/3', { title: 'Genommen' });
  pruefe('Eine herrenlose Zeile gehoert nicht jedem', fHerrenlosFremd.status === 403,
    `Status ${fHerrenlosFremd.status}`);
  const fHerrenlosAdmin = await fRuf('cookie-f-anna', 'PUT', '/api/items/3', { title: 'Vom Admin' });
  pruefe('Aber dem Admin', fHerrenlosAdmin.status === 200 && fTitel(3) === 'Vom Admin',
    `Status ${fHerrenlosAdmin.status} / ${fTitel(3)}`);

  /* ---------------------------------------------------------------- */
  gruppe('Rechte an Kommentaren');

  const fText = (id) => fEine('SELECT text, pinned FROM comments WHERE id = ?', id);

  const fTextFremd = await fRuf('cookie-f-carla', 'PUT', '/api/comments/1', { text: 'umgeschrieben' });
  pruefe('Ein Fremder aendert keinen fremden Kommentartext', fTextFremd.status === 403,
    `Status ${fTextFremd.status}`);
  /* Die schaerfste Zeile der ganzen Schicht: AUCH DER ADMIN NICHT. Loeschen
     ja, umschreiben nein -- eine fremde Aussage unter fremdem Namen zu
     veraendern ist die Art Funktion, die man spaeter bereut. */
  const fTextAdmin = await fRuf('cookie-f-anna', 'PUT', '/api/comments/1', { text: 'vom Admin umgeschrieben' });
  pruefe('Und der Admin aendert ihn auch nicht', fTextAdmin.status === 403,
    `Status ${fTextAdmin.status}`);
  pruefe('Der Kommentartext steht unveraendert da', fText(1)?.text === 'Berts Kommentar', fText(1)?.text);
  const fTextEigen = await fRuf('cookie-f-bert', 'PUT', '/api/comments/1', { text: 'Berts Kommentar, berichtigt' });
  pruefe('Der Verfasser aendert seinen eigenen Text',
    fTextEigen.status === 200 && fText(1)?.text === 'Berts Kommentar, berichtigt', fText(1)?.text);

  /* Die Merkmale dagegen darf der Admin: die Anpinnung wirkt auf die
     Sortierung fuer ALLE (pinned DESC steht ganz vorn), aendert keine Aussage
     und ist umkehrbar. */
  const fPinAdmin = await fRuf('cookie-f-anna', 'PUT', '/api/comments/1', { pinned: 1 });
  pruefe('Der Admin pinnt einen fremden Kommentar an',
    fPinAdmin.status === 200 && fText(1)?.pinned === 1, `Status ${fPinAdmin.status} / ${fText(1)?.pinned}`);
  const fPinFremd = await fRuf('cookie-f-carla', 'PUT', '/api/comments/1', { pinned: 0 });
  pruefe('Ein Fremder pinnt nicht an und nicht ab', fPinFremd.status === 403, `Status ${fPinFremd.status}`);
  const fArtFremd = await fRuf('cookie-f-carla', 'PUT', '/api/comments/1', { kind: 'report' });
  pruefe('Und aendert auch die Art nicht', fArtFremd.status === 403, `Status ${fArtFremd.status}`);
  pruefe('Die Anpinnung steht noch, wie der Admin sie gesetzt hat', fText(1)?.pinned === 1);

  /* Text und Merkmal in einem Ruf: die Absage muss kommen, bevor irgendetwas
     geschrieben ist -- sonst haette der Admin die Anpinnung durchgebracht und
     nur der Text waere abgewiesen worden. */
  const fBeidesK = await fRuf('cookie-f-anna', 'PUT', '/api/comments/1',
    { text: 'doch umgeschrieben', pinned: 0 });
  pruefe('Text und Anpinnung zusammen weist der Admin sich selbst ab', fBeidesK.status === 403,
    `Status ${fBeidesK.status}`);
  pruefe('Und weder Text noch Anpinnung haben sich dabei geaendert',
    fText(1)?.text === 'Berts Kommentar, berichtigt' && fText(1)?.pinned === 1,
    JSON.stringify(fText(1)));

  /* AN DER LOESCHROUTE GILT GENAU EINES VON BEIDEN, NIE BEIDES UND NIE KEINES:
     updated_at beim Verfasser, der Vermerk beim Fremden. Deshalb stehen die
     beiden Spalten ab hier IMMER nebeneinander in der Pruefung -- eine, die
     nur eine von beiden ansieht, liesse den Fall "beides zugleich" durch.
     Der Ausgangswert wird von Hand geleert: bert hat eben seinen eigenen Text
     geaendert, updated_at steht also schon, und eine Pruefung darauf koennte
     gar nicht mehr scheitern (Stolperstein 60). */
  const fVermerk = () => fEine('SELECT images_removed FROM comments WHERE id = 1')?.images_removed;
  const fBearbeitet = () => fEine('SELECT updated_at FROM comments WHERE id = 1')?.updated_at;
  fSchreibe('UPDATE comments SET updated_at = NULL WHERE id = 1');
  pruefe('Die Ausgangslage traegt weder Vermerk noch bearbeitet',
    fVermerk() === 0 && fBearbeitet() === null, JSON.stringify([fVermerk(), fBearbeitet()]));

  const fBildAdmin = await fRuf('cookie-f-anna', 'POST', '/api/comments/1/images', {});
  pruefe('Der Admin haengt kein Bild an einen fremden Kommentar', fBildAdmin.status === 403,
    `Status ${fBildAdmin.status}`);
  /* ANHAENGEN IST BEARBEITEN -- und weil der Admin gar nicht anhaengen darf,
     ist auch sein abgewiesener Versuch keine. Weder das eine noch das andere. */
  pruefe('Und sein abgewiesener Versuch aendert an beidem nichts',
    fVermerk() === 0 && fBearbeitet() === null, JSON.stringify([fVermerk(), fBearbeitet()]));

  const fBildEigenWeg = await fRuf('cookie-f-bert', 'DELETE', '/api/comment-images/2');
  pruefe('Der Verfasser loescht sein eigenes Bild',
    fBildEigenWeg.status === 200 && fZeilen('SELECT id FROM comment_images').length === 1,
    `Status ${fBildEigenWeg.status}`);
  /* DER EINGRIFFSVERMERK, erste Haelfte. Bert hat eben SEIN EIGENES Bild
     entfernt -- wer bei sich aufraeumt, greift in keine fremde Aussage ein
     und hinterlaesst nichts. Diese Haelfte steht hier und nicht bloss beim
     Admin: eine Pruefung, die nur das Hochzaehlen belegt, liesse offen, ob
     ueberhaupt eine Bedingung davorsteht. */
  pruefe('Raeumt der Verfasser bei sich auf, entsteht kein Vermerk',
    fVermerk() === 0, `images_removed = ${fVermerk()}`);
  // Die andere Haelfte desselben Vorgangs: ENTFERNEN IST BEARBEITEN.
  pruefe('Aber es gilt als Bearbeitung durch ihn selbst',
    fBearbeitet() !== null && fBearbeitet() !== undefined, `updated_at = ${fBearbeitet()}`);
  pruefe('Die Antwort sagt dasselbe',
    !!fBildEigenWeg.inhalt?.comments?.find(k => k.id === 1)?.updated_at,
    JSON.stringify(fBildEigenWeg.inhalt?.comments?.find(k => k.id === 1)?.updated_at));

  fSchreibe('UPDATE comments SET updated_at = NULL WHERE id = 1');
  const fBildFremdWeg = await fRuf('cookie-f-carla', 'DELETE', '/api/comment-images/1');
  pruefe('Ein Fremder loescht kein Bild aus einem fremden Kommentar', fBildFremdWeg.status === 403,
    `Status ${fBildFremdWeg.status}`);
  pruefe('Und das Bild ist noch da', fZeilen('SELECT id FROM comment_images').length === 1);
  pruefe('Ein abgewiesener Eingriff vermerkt auch nichts',
    fVermerk() === 0, `images_removed = ${fVermerk()}`);
  pruefe('Und gilt erst recht nicht als Bearbeitung',
    fBearbeitet() === null, `updated_at = ${fBearbeitet()}`);

  const fBildAdminWeg = await fRuf('cookie-f-anna', 'DELETE', '/api/comment-images/1');
  pruefe('Der Admin loescht ein Bild aus einem fremden Kommentar',
    fBildAdminWeg.status === 200 && fZeilen('SELECT id FROM comment_images').length === 0,
    `Status ${fBildAdminWeg.status}`);
  pruefe('Und DAS hinterlaesst den Vermerk am Kommentar',
    fVermerk() === 1, `images_removed = ${fVermerk()}`);
  /* DIE SCHAERFSTE ZEILE DES PUNKTES: der Eingriff des Admins setzt NIE
     "bearbeitet". Saehe die fremde Loeschung aus wie eine Bearbeitung durch den
     Verfasser, haette der Admin genau das getan, was ihm verwehrt ist. */
  pruefe('Aber ausdruecklich KEIN bearbeitet -- das waere eine fremde Aussage',
    fBearbeitet() === null, `updated_at = ${fBearbeitet()}`);
  pruefe('Auch in der Antwort steht kein bearbeitet',
    fBildAdminWeg.inhalt?.comments?.find(k => k.id === 1)?.updated_at === null,
    JSON.stringify(fBildAdminWeg.inhalt?.comments?.find(k => k.id === 1)?.updated_at));
  /* In der Antwort heisst es bilderEntfernt, nicht images_removed -- und die
     nackte Spalte steht nirgends, wie schon bei user_id. */
  const fVermerkAntwort = fBildAdminWeg.inhalt.comments.find(k => k.id === 1);
  pruefe('Die Antwort nennt den Vermerk als bilderEntfernt',
    fVermerkAntwort?.bilderEntfernt === 1, JSON.stringify(fVermerkAntwort?.bilderEntfernt));
  pruefe('Die nackte Spalte steht in keiner Antwort',
    !('images_removed' in (fVermerkAntwort || {})),
    JSON.stringify(Object.keys(fVermerkAntwort || {})));
  pruefe('Zurueckgesetzt wird er nirgends',
    !/images_removed\s*=\s*0|images_removed\s*-/
      .test(fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8')),
    'ein Weg setzt den Vermerk zurueck');

  /* `mine` am Kommentar -- dasselbe Muster wie am Testtag und an der Stimme.
     ZWEI RUFER nebeneinander: an derselben Zeile muss die Antwort
     verschieden ausfallen, sonst belegt sie nur, dass das Feld existiert. */
  const fMineBert = (await fRuf('cookie-f-bert', 'GET', '/api/items/2')).inhalt.comments;
  const fMineAnna = (await fRuf('cookie-f-anna', 'GET', '/api/items/2')).inhalt.comments;
  const fMineVon = (liste, kid) => liste.find(k => k.id === kid)?.mine;
  pruefe('Jeder Kommentar sagt, ob er dem Fragenden gehoert',
    fMineBert.every(k => typeof k.mine === 'boolean'),
    JSON.stringify(fMineBert.map(k => k.mine)));
  pruefe('Dieselbe Zeile ist fuer den einen meine und fuer den anderen nicht',
    fMineVon(fMineBert, 1) === true && fMineVon(fMineAnna, 1) === false,
    JSON.stringify([fMineVon(fMineBert, 1), fMineVon(fMineAnna, 1)]));
  pruefe('Und umgekehrt an der Zeile des anderen',
    fMineVon(fMineBert, 2) === false && fMineVon(fMineAnna, 2) === true,
    JSON.stringify([fMineVon(fMineBert, 2), fMineVon(fMineAnna, 2)]));
  pruefe('Die Verfassernummer steht dabei weiterhin in keiner Antwort',
    !fMineBert.some(k => 'user_id' in k), JSON.stringify(Object.keys(fMineBert[0] || {})));

  const fKomWeg = await fRuf('cookie-f-carla', 'DELETE', '/api/comments/1');
  pruefe('Ein Fremder loescht keinen fremden Kommentar', fKomWeg.status === 403, `Status ${fKomWeg.status}`);
  pruefe('Und der Kommentar steht noch', fZeilen('SELECT id FROM comments WHERE id = 1').length === 1);
  const fKomAdmin = await fRuf('cookie-f-anna', 'DELETE', '/api/comments/1');
  pruefe('Der Admin loescht einen fremden Kommentar',
    fKomAdmin.status === 204 && fZeilen('SELECT id FROM comments WHERE id = 1').length === 0,
    `Status ${fKomAdmin.status}`);
  const fKomNeu = await fRuf('cookie-f-carla', 'POST', '/api/items/2/comments', { text: 'Carla sagt etwas' });
  pruefe('Aber schreiben darf jeder an jedem Eintrag', fKomNeu.status === 201, `Status ${fKomNeu.status}`);

  /* ---------------------------------------------------------------- */
  gruppe('Rechte an Testtagen und Bewertungen');

  const fTagNeu = await fRuf('cookie-f-carla', 'POST', '/api/items/2/test-days',
    { day: '2024-05-05', rating: 2 });
  pruefe('Jeder traegt seinen eigenen Testtag ein, auch am fremden Eintrag',
    fTagNeu.status === 201, `Status ${fTagNeu.status}`);
  pruefe('Und das bleiben zwei Zeilen am selben Datum',
    fZeilen('SELECT id FROM test_days WHERE item_id = 2').length === 2);

  const fNoteFremd = await fRuf('cookie-f-carla', 'PUT', '/api/test-days/1', { rating: 1 });
  pruefe('Ein Fremder aendert die Note eines fremden Testtags nicht', fNoteFremd.status === 403,
    `Status ${fNoteFremd.status}`);
  /* Auch der Admin nicht: die Note IST die Aussage dieser Zeile, genau wie
     eine Bewertung. Loeschen ja, umschreiben nein. */
  const fNoteAdmin = await fRuf('cookie-f-anna', 'PUT', '/api/test-days/1', { rating: 1 });
  pruefe('Und der Admin auch nicht', fNoteAdmin.status === 403, `Status ${fNoteAdmin.status}`);
  pruefe('Die Note steht unveraendert', fEine('SELECT rating FROM test_days WHERE id = 1')?.rating === 4,
    JSON.stringify(fEine('SELECT rating FROM test_days WHERE id = 1')));
  const fNoteEigen = await fRuf('cookie-f-bert', 'PUT', '/api/test-days/1', { rating: 3 });
  pruefe('Der Verfasser aendert seine eigene Note',
    fNoteEigen.status === 200 && fEine('SELECT rating FROM test_days WHERE id = 1')?.rating === 3,
    `Status ${fNoteEigen.status}`);

  const fTtagAn = await fRuf('cookie-f-anna', 'POST', '/api/test-days/1/tags', { name: 'Regen' });
  pruefe('Auch der Admin haengt keinen Tag an einen fremden Testtag', fTtagAn.status === 403,
    `Status ${fTtagAn.status}`);
  const fTtagEigen = await fRuf('cookie-f-bert', 'POST', '/api/test-days/1/tags', { name: 'Regen' });
  pruefe('Der Verfasser tut es', fTtagEigen.status === 201, `Status ${fTtagEigen.status}`);
  const fRegenId = fEine('SELECT id FROM tags WHERE name = ?', 'Regen')?.id;
  const fTtagWeg = await fRuf('cookie-f-carla', 'DELETE', `/api/test-days/1/tags/${fRegenId}`);
  pruefe('Und ein Fremder nimmt ihn nicht wieder weg', fTtagWeg.status === 403, `Status ${fTtagWeg.status}`);
  pruefe('Der Tag haengt noch am Testtag',
    fZeilen('SELECT tag_id FROM test_day_tags WHERE test_day_id = 1').length === 1);

  const fTtagLoeschFremd = await fRuf('cookie-f-carla', 'DELETE', '/api/test-days/1');
  pruefe('Ein Fremder loescht keinen fremden Testtag', fTtagLoeschFremd.status === 403,
    `Status ${fTtagLoeschFremd.status}`);
  pruefe('Und der Testtag steht noch', fZeilen('SELECT id FROM test_days WHERE id = 1').length === 1);
  /* Loeschen darf der Admin -- der Unterschied zum Aendern ist die ganze
     Regel, und er wird hier in zwei aufeinanderfolgenden Rufen belegt. */
  const fTtagLoeschAdmin = await fRuf('cookie-f-anna', 'DELETE', '/api/test-days/1');
  pruefe('Der Admin loescht einen fremden Testtag',
    fTtagLoeschAdmin.status === 200 && fZeilen('SELECT id FROM test_days WHERE id = 1').length === 0,
    `Status ${fTtagLoeschAdmin.status}`);

  const fBew = await fRuf('cookie-f-carla', 'PUT', '/api/items/2/ratings', { criterionId: fOptikId, value: 2 });
  pruefe('Jeder bewertet fuer sich, auch an einem fremden Eintrag', fBew.status === 200,
    `Status ${fBew.status}`);
  pruefe('Und das sind zwei Zeilen zum selben Kriterium',
    gleich(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = 2 ORDER BY user_id')
      .map(z => `${z.user_id}/${z.value}`), ['2/5', '3/2']),
    JSON.stringify(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = 2')));
  await fRuf('cookie-f-carla', 'DELETE', '/api/items/2/ratings');
  pruefe('Zuruecksetzen trifft nur die eigenen Zeilen -- ohne jeden Waechter',
    gleich(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = 2')
      .map(z => `${z.user_id}/${z.value}`), ['2/5']),
    JSON.stringify(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = 2')));

  /* ---------------------------------------------------------------- */
  gruppe('Rechte in der Verwaltung');

  const fTitelFremd = await fRuf('cookie-f-bert', 'PUT', '/api/titles',
    { publicTitle: 'Gekapert', appTitle: 'Gekapert' });
  pruefe('Ein Benutzer aendert die Titel nicht', fTitelFremd.status === 403, `Status ${fTitelFremd.status}`);
  pruefe('Die Absage nennt den Admin',
    /Admin/.test(fTitelFremd.inhalt?.error || ''), fTitelFremd.inhalt?.error);
  const fTitelAdmin = await fRuf('cookie-f-anna', 'PUT', '/api/titles',
    { publicTitle: 'Kriterion', appTitle: 'Prüfstand' });
  pruefe('Der Admin aendert sie', fTitelAdmin.status === 200, `Status ${fTitelAdmin.status}`);

  const fTagUm = await fRuf('cookie-f-bert', 'PUT', `/api/tags/${fMarkeId}`, { name: 'Umbenannt' });
  const fTagLoesch = await fRuf('cookie-f-bert', 'DELETE', `/api/tags/${fMarkeId}`);
  pruefe('Ein Benutzer benennt keinen Tag um', fTagUm.status === 403, `Status ${fTagUm.status}`);
  pruefe('Und loescht keinen', fTagLoesch.status === 403, `Status ${fTagLoesch.status}`);
  pruefe('Der Tag heisst noch, wie er hiess',
    fEine('SELECT name FROM tags WHERE id = ?', fMarkeId)?.name === 'Marke',
    JSON.stringify(fEine('SELECT name FROM tags WHERE id = ?', fMarkeId)));

  const fKatNeu = await fRuf('cookie-f-bert', 'POST', '/api/product-categories', { name: 'Werkzeug' });
  pruefe('Eine Kategorie anlegen darf weiterhin jeder', fKatNeu.status === 201, `Status ${fKatNeu.status}`);
  const fKatUm = await fRuf('cookie-f-bert', 'PUT', `/api/product-categories/${fKatNeu.inhalt?.id}`,
    { name: 'Umbenannt' });
  const fKatLoesch = await fRuf('cookie-f-bert', 'DELETE', `/api/product-categories/${fKatNeu.inhalt?.id}`);
  pruefe('Umbenennen und Loeschen aber nicht',
    fKatUm.status === 403 && fKatLoesch.status === 403,
    `Status ${fKatUm.status} / ${fKatLoesch.status}`);
  pruefe('Die Kategorie steht unveraendert da',
    fEine('SELECT name FROM product_categories WHERE id = ?', fKatNeu.inhalt?.id)?.name === 'Werkzeug');

  const fEigen = await fRuf('cookie-f-bert', 'PUT', '/api/settings', { schrift: 110 });
  pruefe('Seine persoenlichen Einstellungen schreibt jeder selbst',
    fEigen.status === 200 && fEigen.inhalt?.schrift === 110, JSON.stringify(fEigen.inhalt?.schrift));
  const fVokabel = await fRuf('cookie-f-bert', 'PUT', '/api/settings',
    { vokabular: { sacheEinzahl: 'Ding' } });
  pruefe('Das Vokabular aendert er nicht', fVokabel.status === 403, `Status ${fVokabel.status}`);
  const fAnbieter = await fRuf('cookie-f-bert', 'PUT', '/api/settings', { sucheAktiv: ['ddg'] });
  pruefe('Und den Suchanbietervorrat auch nicht', fAnbieter.status === 403, `Status ${fAnbieter.status}`);
  pruefe('Das Vokabular steht unveraendert',
    (await fRuf('cookie-f-anna', 'GET', '/api/settings')).inhalt?.vokabular?.sacheEinzahl === 'Eintrag');
  /* Gemischt: die persoenliche Haelfte darf NICHT geschrieben sein, wenn die
     globale abgewiesen wird. Deshalb steht die Frage vor dem ersten Schreiben. */
  const fGemischt = await fRuf('cookie-f-bert', 'PUT', '/api/settings',
    { schrift: 80, vokabular: { sacheEinzahl: 'Ding' } });
  pruefe('Persoenlich und global zusammen wird abgewiesen', fGemischt.status === 403,
    `Status ${fGemischt.status}`);
  pruefe('Und die persoenliche Haelfte ist dabei NICHT geschrieben worden',
    (await fRuf('cookie-f-bert', 'GET', '/api/settings')).inhalt?.schrift === 110,
    JSON.stringify((await fRuf('cookie-f-bert', 'GET', '/api/settings')).inhalt?.schrift));
  const fVokabelAdmin = await fRuf('cookie-f-anna', 'PUT', '/api/settings',
    { vokabular: { sacheEinzahl: 'Ding', sacheMehrzahl: 'Dinge' } });
  pruefe('Der Admin aendert das Vokabular',
    fVokabelAdmin.status === 200 && fVokabelAdmin.inhalt?.vokabular?.sacheEinzahl === 'Ding',
    JSON.stringify(fVokabelAdmin.inhalt?.vokabular?.sacheEinzahl));

  /* ---------------------------------------------------------------- */
  gruppe('Was dem Eigentuemer gehoert');

  /* Bis hierher war anna beides. Jetzt bekommt CARLA die Rolle admin -- damit
     steht zum ersten Mal ein Admin da, dem die Anlage NICHT gehoert. Ohne
     diesen Zugang liesse sich "Eigentuemer" von "Admin" gar nicht
     unterscheiden, und jede Pruefung darauf bliebe auch dann gruen, wenn dort
     nurAdmin stuende. */
  {
    const d = fDatenbank();
    d.pragma('busy_timeout = 4000');
    d.prepare("UPDATE users SET role = 'admin' WHERE username = 'carla'").run();
    d.close();
  }
  const fCarlaRolle = await fRuf('cookie-f-carla', 'GET', '/api/settings');
  pruefe('Carla ist jetzt Admin, aber nicht Eigentuemerin',
    fCarlaRolle.inhalt?.istAdmin === true && fCarlaRolle.inhalt?.istEigentuemer === false,
    JSON.stringify([fCarlaRolle.inhalt?.istAdmin, fCarlaRolle.inhalt?.istEigentuemer]));
  const fAnnaRolle = await fRuf('cookie-f-anna', 'GET', '/api/settings');
  pruefe('Anna ist beides',
    fAnnaRolle.inhalt?.istAdmin === true && fAnnaRolle.inhalt?.istEigentuemer === true,
    JSON.stringify([fAnnaRolle.inhalt?.istAdmin, fAnnaRolle.inhalt?.istEigentuemer]));
  pruefe('Und bert ist keines von beiden',
    (await fRuf('cookie-f-bert', 'GET', '/api/settings')).inhalt?.istEigentuemer === false);

  const fExportBert = await fRuf('cookie-f-bert', 'GET', '/api/export?photos=0');
  pruefe('Ein Benutzer exportiert nicht', fExportBert.status === 403, `Status ${fExportBert.status}`);
  const fExportCarla = await fRuf('cookie-f-carla', 'GET', '/api/export?photos=0');
  pruefe('Und ein Admin ohne Eigentuemerrecht auch nicht', fExportCarla.status === 403,
    `Status ${fExportCarla.status}`);
  pruefe('Die Absage nennt den Eigentuemer',
    /Eigentümer/.test(fExportCarla.inhalt?.error || ''), fExportCarla.inhalt?.error);
  const fExportAnna = await fRuf('cookie-f-anna', 'GET', '/api/export?photos=0');
  pruefe('Die Eigentuemerin exportiert',
    fExportAnna.status === 200 && Array.isArray(fExportAnna.inhalt?.items),
    `Status ${fExportAnna.status}`);

  /* Der Import: eine Exportdatei kann unter FREMDEM NAMEN
     schreiben. Beide Modi liegen dahinter, nicht nur "ersetzen". */
  const fImport = async (cookieWert, objekt, modus) => {
    const grenze = '----pruefungf' + crypto.randomBytes(6).toString('hex');
    const teil = (name, wert, dateiname) =>
      `--${grenze}\r\nContent-Disposition: form-data; name="${name}"` +
      (dateiname ? `; filename="${dateiname}"\r\nContent-Type: application/json` : '') +
      `\r\n\r\n${wert}\r\n`;
    const koerper = teil('mode', modus) + teil('file', JSON.stringify(objekt), 'export.json') + `--${grenze}--\r\n`;
    const a = await fetch(F.basis + '/api/import', {
      method: 'POST',
      headers: { cookie: `kriterion_session=${cookieWert}`, 'content-type': `multipart/form-data; boundary=${grenze}` },
      body: koerper
    });
    return { status: a.status, inhalt: await a.json().catch(() => null) };
  };
  const fFremdeDatei = { version: 6, title: 'F', items: [{
    title: 'Untergeschoben', author: 'bert',
    comments: [{ text: 'das hat bert nie geschrieben', author: 'bert' }] }] };
  const fEintragZahl = () => fZeilen('SELECT id FROM items').length;
  const fVorImport = fEintragZahl();

  const fImportBert = await fImport('cookie-f-bert', fFremdeDatei, 'merge');
  pruefe('Ein Benutzer spielt nichts ein', fImportBert.status === 403, `Status ${fImportBert.status}`);
  const fImportCarla = await fImport('cookie-f-carla', fFremdeDatei, 'merge');
  pruefe('Und ein Admin ohne Eigentuemerrecht auch nicht', fImportCarla.status === 403,
    `Status ${fImportCarla.status}`);
  const fErsetzenCarla = await fImport('cookie-f-carla', fFremdeDatei, 'replace');
  pruefe('Auch nicht ersetzend', fErsetzenCarla.status === 403, `Status ${fErsetzenCarla.status}`);
  pruefe('Und der Bestand ist dabei unberuehrt geblieben', fEintragZahl() === fVorImport,
    `${fEintragZahl()} statt ${fVorImport}`);
  pruefe('Es steht kein untergeschobener Beitrag unter fremdem Namen da',
    fZeilen('SELECT id FROM comments WHERE text = ?', 'das hat bert nie geschrieben').length === 0);
  const fImportAnna = await fImport('cookie-f-anna', fFremdeDatei, 'merge');
  pruefe('Die Eigentuemerin spielt ein',
    fImportAnna.status === 200 && fEintragZahl() === fVorImport + 1,
    `Status ${fImportAnna.status} / ${fEintragZahl()}`);

  const fStatsBert = await fRuf('cookie-f-bert', 'GET', '/api/stats');
  const fStatsCarla = await fRuf('cookie-f-carla', 'GET', '/api/stats');
  const fStatsAnna = await fRuf('cookie-f-anna', 'GET', '/api/stats');
  // Der Schluessel liegt in dieser Prueflage als Datei neben der Datenbank --
  // nur dann gibt es ueberhaupt etwas auszuliefern.
  pruefe('Der Schluesselwert steht ueberhaupt zur Verfuegung',
    fStatsAnna.inhalt?.keyFromEnv === false && typeof fStatsAnna.inhalt?.keyHex === 'string',
    JSON.stringify([fStatsAnna.inhalt?.keyFromEnv, typeof fStatsAnna.inhalt?.keyHex]));
  /* UMGEDREHT SEIT 0.8.5, nicht geloescht: bis 0.8.4 hiess diese Prueflage
     "Aber nur die Eigentuemerin bekommt ihn" und fragte bert und carla
     zugleich. Bert kommt seit 0.8.5 gar nicht mehr an die Kennzahlen -- der
     Schluesselwert ist damit nur noch an carla pruefbar, und genau dort
     gehoert er hin: sie ist Admin OHNE Eigentuemerrecht, also die einzige
     Lage, in der die zweite, engere Klemme ueberhaupt etwas entscheidet
     (Stolperstein 73). */
  pruefe('Aber den Schluesselwert bekommt nur die Eigentuemerin',
    fStatsCarla.status === 200 && fStatsCarla.inhalt?.keyHex === null,
    JSON.stringify([fStatsCarla.status, fStatsCarla.inhalt?.keyHex]));
  /* UMGEDREHT SEIT 0.8.5, nicht geloescht (Stolperstein 74): bis 0.8.4 hiess
     die Prueflage "Die Kennzahlen selbst sieht weiterhin jeder". Die Zahlen
     sagen, wie gross der Bestand und die Datenbank sind -- eine Aussage ueber
     die Anlage als Ganzes. */
  pruefe('Die Kennzahlen selbst sieht seit 0.8.5 nur noch der Admin',
    fStatsBert.status === 403, `Status ${fStatsBert.status}`);
  pruefe('Die Absage nennt dabei den Admin',
    /Admin/.test(fStatsBert.inhalt?.error || ''), fStatsBert.inhalt?.error);
  // Der Erfolgsfall daneben, und zwar an BEIDEN Rollen darueber: ohne ihn
  // waere "403 fuer jeden" von "403 fuer den Benutzer" nicht zu unterscheiden.
  pruefe('Ein Admin ohne Eigentuemerrecht sieht sie',
    fStatsCarla.status === 200 && typeof fStatsCarla.inhalt?.itemCount === 'number',
    `Status ${fStatsCarla.status}`);
  pruefe('Und die Eigentuemerin auch',
    fStatsAnna.status === 200 && typeof fStatsAnna.inhalt?.itemCount === 'number',
    `Status ${fStatsAnna.status}`);

  /* Der eigene Name in den Einstellungen -- fuer die Kopfzeile. Er steht auch
     in GET /api/account; beide lesen dieselbe angemeldete Zeile, das ist keine
     zweite Wahrheit. Hier, weil ladeEinstellungen() beim Start ohnehin laeuft.
     ZWEI RUFER, und darum geht es: eine Antwort, die stur den ERSTEN Zugang
     nennte, waere bei der Eigentuemerin richtig und bei jedem anderen falsch. */
  const fNameAnna = (await fRuf('cookie-f-anna', 'GET', '/api/settings')).inhalt;
  const fNameBert = (await fRuf('cookie-f-bert', 'GET', '/api/settings')).inhalt;
  pruefe('Die Einstellungen nennen den eigenen Namen',
    fNameAnna?.name === 'anna', JSON.stringify(fNameAnna?.name));
  pruefe('Und jedem seinen eigenen, nicht den der Eigentuemerin',
    fNameBert?.name === 'bert', JSON.stringify(fNameBert?.name));
  // Dieselbe Angabe steht unveraendert unter /api/account -- die Kopfzeile
  // spart sich damit nur den zweiten Abruf.
  pruefe('Dieselbe Angabe steht weiterhin unter /api/account',
    (await fRuf('cookie-f-bert', 'GET', '/api/account')).inhalt?.username === 'bert',
    JSON.stringify((await fRuf('cookie-f-bert', 'GET', '/api/account')).inhalt));

  /* ----------------------------------------------------------------
     Ab hier ist carla Admin OHNE Eigentuemerrecht -- die wichtigste Lage
     fuer alles, was folgt: an ihr faellt auf, wenn eine Regel den Admin
     meint und der Eigentuemer sie ohnehin passiert haette. */
  gruppe('Verfasser in der Antwort');

  /* Eine EIGENE Lage statt der gewachsenen: die Zahlen des Loeschdialogs
     sollen vorhersagbar sein und nicht davon abhaengen, was die Gruppen davor
     stehengelassen haben. Drei Verfasser, drei Sorten Beitrag, dazu zwei
     Faelle, die genau die zwei Klemmen treffen -- eine zurueckgesetzte
     Bewertung (value 0) und eine herrenlose Zeile (user_id IS NULL). */
  const fVId = (await fRuf('cookie-f-bert', 'POST', '/api/items', { title: 'Zum Loeschen' })).inhalt.id;
  await fRuf('cookie-f-bert', 'POST', `/api/items/${fVId}/comments`, { text: 'Kommentar von bert' });
  await fRuf('cookie-f-bert', 'POST', `/api/items/${fVId}/test-days`, { day: '2024-06-01', rating: 3 });
  await fRuf('cookie-f-bert', 'PUT', `/api/items/${fVId}/ratings`, { criterionId: fOptikId, value: 4 });
  await fRuf('cookie-f-anna', 'POST', `/api/items/${fVId}/comments`, { text: 'Kommentar von anna' });
  await fRuf('cookie-f-anna', 'POST', `/api/items/${fVId}/test-days`, { day: '2024-06-02', rating: 5 });
  await fRuf('cookie-f-anna', 'PUT', `/api/items/${fVId}/ratings`, { criterionId: fOptikId, value: 2 });
  // Zwei Linkzeilen, eine je Verfasser: seit 0.8.30 kann auch ein Link fremd
  // sein, und ohne beide Sorten liesse sich die Trennung im Dialog nicht
  // belegen.
  await fRuf('cookie-f-bert', 'POST', `/api/items/${fVId}/links`, { url: 'https://berts-link.test' });
  await fRuf('cookie-f-anna', 'POST', `/api/items/${fVId}/links`, { url: 'https://annas-link.test' });
  // Dasselbe am sechsten Traeger: je eine Datei von bert und von anna.
  await fUpload('cookie-f-bert', fVId, 'von-bert.txt', 'berts Datei');
  await fUpload('cookie-f-anna', fVId, 'von-anna.txt', 'annas Datei');
  // Carla setzt ihre wieder zurueck: die Zeile bleibt mit 0 stehen und ist
  // KEINE Stimme -- weder in der Liste noch in der Zahl des Dialogs.
  await fRuf('cookie-f-carla', 'PUT', `/api/items/${fVId}/ratings`, { criterionId: fOptikId, value: 5 });
  await fRuf('cookie-f-carla', 'PUT', `/api/items/${fVId}/ratings`, { criterionId: fOptikId, value: 0 });
  {
    const d = fDatenbank();
    d.pragma('busy_timeout = 4000');
    d.prepare('INSERT INTO comments (item_id, text, user_id) VALUES (?, ?, NULL)')
      .run(fVId, 'Herrenloser Kommentar');
    // Ein VIERTER Rufer, der weder Verfasser noch Admin ist: ohne ihn liesse
    // sich an den neuen Wegen gar keine Verweigerung herstellen -- bert ist
    // Verfasser, anna und carla sind Admin.
    const dirkId = d.prepare("INSERT INTO users (username, password_hash, role) VALUES ('dirk', 'x', 'user')")
      .run().lastInsertRowid;
    d.prepare("INSERT INTO sessions (token, user_id) VALUES ('cookie-f-dirk', ?)").run(dirkId);
    d.close();
  }

  const fVEintrag = (await fRuf('cookie-f-bert', 'GET', `/api/items/${fVId}`)).inhalt;
  pruefe('Der Eintrag nennt seinen Verfasser mit Namen',
    fVEintrag?.verfasser?.name === 'bert' && fVEintrag?.verfasser?.geloescht === false,
    JSON.stringify(fVEintrag?.verfasser));
  // Die nackte Nummer stand bis 0.8.1 in der Antwort und war nie zu gebrauchen.
  pruefe('Und nicht mehr die nackte Nummer', fVEintrag?.user_id === undefined,
    JSON.stringify(fVEintrag?.user_id));

  const fVKom = (n) => (fVEintrag?.comments || []).find(c => c.text === n);
  pruefe('Jeder Kommentar nennt seinen Verfasser',
    fVKom('Kommentar von bert')?.verfasser?.name === 'bert' &&
    fVKom('Kommentar von anna')?.verfasser?.name === 'anna',
    JSON.stringify((fVEintrag?.comments || []).map(c => c.verfasser)));
  /* Eine herrenlose Zeile bekommt ausdruecklich null -- und das Feld FEHLT
     nicht. Sonst waere "diese Zeile hat keinen Verfasser" von "diese Antwort
     kennt das Feld nicht" nicht zu unterscheiden. */
  pruefe('Eine herrenlose Zeile nennt ausdruecklich keinen Verfasser',
    fVKom('Herrenloser Kommentar') !== undefined &&
    'verfasser' in fVKom('Herrenloser Kommentar') &&
    fVKom('Herrenloser Kommentar').verfasser === null,
    JSON.stringify(fVKom('Herrenloser Kommentar')?.verfasser));
  pruefe('Kein Kommentar traegt noch eine nackte Verfassernummer',
    (fVEintrag?.comments || []).every(c => c.user_id === undefined));

  /* DIE LINKZEILE, seit 0.8.30 der fuenfte Traeger -- und diese Gruppe ist die
     EINZIGE Stelle, an der die Antwort des echten Servers dazu angesehen wird.
     Aufgefallen bei einer Gegenprobe: nimmt detail() den Verfasser von der
     Linkzeile weg, bleibt der ganze Lauf gruen, wenn hier nichts steht -- die
     Oberflaechenpruefungen laufen gegen einen Mock, der das Feld
     selbst mitbringt, und die Rechtepruefungen sehen in die Datenbank statt in
     die Antwort. Das ist Luecke 3 des Pruefstands in Reinform. */
  const fVLink = (teil) => (fVEintrag?.links || []).find(l => l.url.includes(teil));
  pruefe('Die Linkliste der Antwort ist ueberhaupt gefuellt',
    (fVEintrag?.links || []).length === 2, JSON.stringify(fVEintrag?.links));
  pruefe('Jede Linkzeile nennt ihren Verfasser',
    fVLink('berts-link')?.verfasser?.name === 'bert' &&
    fVLink('annas-link')?.verfasser?.name === 'anna',
    JSON.stringify((fVEintrag?.links || []).map(l => l.verfasser)));
  /* mine steht daneben und ersetzt den Namen nicht: daran haengt das
     Loeschkreuz. Gefragt hat bert -- seine Zeile ist seine, annas nicht. */
  pruefe('Und sagt, ob sie mir gehoert',
    fVLink('berts-link')?.mine === true && fVLink('annas-link')?.mine === false,
    JSON.stringify((fVEintrag?.links || []).map(l => [l.url, l.mine])));
  // Der Ueberfahrtext haengt am Zeitpunkt; ohne ihn in der Antwort bliebe er leer.
  pruefe('Und wann sie eingetragen wurde',
    (fVEintrag?.links || []).every(l => typeof l.created_at === 'string' && l.created_at.length > 0),
    JSON.stringify((fVEintrag?.links || []).map(l => l.created_at)));
  pruefe('Keine Linkzeile traegt noch eine nackte Verfassernummer',
    (fVEintrag?.links || []).every(l => l.user_id === undefined),
    JSON.stringify(fVEintrag?.links));

  const fVTag = (t) => (fVEintrag?.testDays || []).find(d => d.day === t);
  pruefe('Jeder Testtag nennt seinen Verfasser',
    fVTag('2024-06-01')?.verfasser?.name === 'bert' &&
    fVTag('2024-06-02')?.verfasser?.name === 'anna',
    JSON.stringify((fVEintrag?.testDays || []).map(d => [d.day, d.verfasser])));
  /* Der Name steht NEBEN mine, er ersetzt es nicht: die Zeitleiste
     unterscheidet weiter ueber die Fuellung und liest keinen Namen. */
  pruefe('Und mine steht unveraendert daneben',
    fVTag('2024-06-01')?.mine === true && fVTag('2024-06-02')?.mine === false,
    JSON.stringify((fVEintrag?.testDays || []).map(d => [d.day, d.mine])));

  const fVOptik = (fVEintrag?.ratings || []).find(r => r.criterion_id === fOptikId);
  /* UMGEHAENGT MIT 0.8.6, nicht geloescht: bis 0.8.5 stand die Stimmenliste an
     jeder Kriterienzeile DIESER Antwort -- und die geht an jeden. Die vier
     Pruefungen darauf stehen jetzt in der Gruppe "Wer hat bewertet" am
     eigenen Endpunkt.
     HIER bleibt die Gegenrichtung, und sie ist der eigentliche Gegenstand:
     was nicht angezeigt werden darf, wird auch nicht geliefert -- sonst haengt
     die Regel daran, dass die Oberflaeche mitspielt.
     Erst das Vorhandensein der Zeilen, dann die Eigenschaft: ohne den ersten
     Teil bliebe die Pruefung auch bei gar keinen Kriterien gruen. */
  pruefe('Der Eintrag selbst nennt seit 0.8.6 keine Stimmen mehr',
    (fVEintrag?.ratings || []).length > 0 &&
    (fVEintrag?.ratings || []).every(r => !('stimmen' in r)),
    JSON.stringify(fVEintrag?.ratings));
  pruefe('Schnitt und Bewerterzahl stehen unveraendert daneben',
    fVOptik?.avg === 3 && fVOptik?.count === 2,
    JSON.stringify([fVOptik?.avg, fVOptik?.count]));

  const fVListe = (await fRuf('cookie-f-bert', 'GET', '/api/items')).inhalt;
  pruefe('Auch die Uebersicht nennt den Verfasser je Eintrag',
    (fVListe || []).find(i => i.id === fVId)?.verfasser?.name === 'bert',
    JSON.stringify((fVListe || []).find(i => i.id === fVId)?.verfasser));
  pruefe('Und die Testtage in der Uebersicht ebenso',
    ((fVListe || []).find(i => i.id === fVId)?.testDays || [])
      .every(d => d.verfasser && d.user_id === undefined));

  /* ---------------------------------------------------------------- */
  gruppe('Der Loeschdialog am Eintrag');

  /* Dieselbe Lage, drei Sichten. Das ist der eigentliche Gegenstand: "fremd"
     meint, was dem LOESCHENDEN fremd ist, nicht was dem Verfasser fremd ist.
     Waeren die drei Antworten gleich, liesse sich das gar nicht belegen. */
  const fBestand = async (cookieWert) =>
    (await fRuf(cookieWert, 'GET', `/api/items/${fVId}/bestand`)).inhalt;
  const fBBert = await fBestand('cookie-f-bert');
  const fBAnna = await fBestand('cookie-f-anna');
  const fBCarla = await fBestand('cookie-f-carla');

  pruefe('Der Verfasser sieht einen eigenen und zwei fremde Kommentare',
    fBBert?.eigenKommentare === 1 && fBBert?.fremdKommentare === 2,
    JSON.stringify(fBBert));
  pruefe('Und je einen eigenen und einen fremden Testtag',
    fBBert?.eigenTesttage === 1 && fBBert?.fremdTesttage === 1, JSON.stringify(fBBert));
  pruefe('Und je eine eigene und eine fremde Bewertung',
    fBBert?.eigenBewertungen === 1 && fBBert?.fremdBewertungen === 1, JSON.stringify(fBBert));
  pruefe('Fuer einen anderen Verfasser sind dieselben Zeilen anders verteilt',
    fBAnna?.eigenKommentare === 1 && fBAnna?.fremdKommentare === 2 &&
    fBAnna?.eigenBewertungen === 1 && fBAnna?.fremdBewertungen === 1 &&
    fBAnna?.eigenTesttage === 1 && fBAnna?.fremdTesttage === 1,
    JSON.stringify(fBAnna));
  /* Carla loescht als Admin einen Eintrag, an dem sie selbst nichts hat --
     dann ist ALLES fremd. Genau diese Zahl soll der Dialog nennen. */
  pruefe('Ein Admin ohne eigenen Beitrag sieht alles als fremd',
    fBCarla?.eigenKommentare === 0 && fBCarla?.fremdKommentare === 3 &&
    fBCarla?.eigenTesttage === 0 && fBCarla?.fremdTesttage === 2,
    JSON.stringify(fBCarla));
  /* IS NOT statt !=: die herrenlose Zeile ist eine fremde. Bei != fiele sie
     aus dem Vergleich heraus und taeuchte in keiner der drei Sichten auf. */
  pruefe('Die herrenlose Zeile zaehlt bei jedem als fremd',
    fBBert?.fremdKommentare === 2 && fBAnna?.fremdKommentare === 2 &&
    fBCarla?.fremdKommentare === 3,
    JSON.stringify([fBBert?.fremdKommentare, fBAnna?.fremdKommentare, fBCarla?.fremdKommentare]));
  // Eine zurueckgesetzte Bewertung ist auch hier keine: carlas 0-Zeile darf
  // weder als ihre eigene noch als fremde auftauchen.
  pruefe('Eine zurueckgesetzte Bewertung erscheint in keiner Zahl',
    fBCarla?.eigenBewertungen === 0 && fBCarla?.fremdBewertungen === 2,
    JSON.stringify(fBCarla));
  pruefe('Die Fotos stehen mit einer Zahl im Dialog',
    fBBert?.fotos === 0, JSON.stringify(fBBert));
  /* UMGESTELLT MIT 0.8.31: die Dateien stehen nicht mehr mit EINER Zahl da.
     Seit sie einen Verfasser haben, koennen sie fremd sein. */
  pruefe('Und die Dateien getrennt nach eigen und fremd',
    fBBert?.eigenDateien === 1 && fBBert?.fremdDateien === 1, JSON.stringify(fBBert));
  pruefe('Fuer den Admin ohne eigenen Beitrag sind beide Dateien fremd',
    fBCarla?.eigenDateien === 0 && fBCarla?.fremdDateien === 2, JSON.stringify(fBCarla));
  /* UMGESTELLT MIT 0.8.30, nicht geloescht: bis 0.8.20 stand hier EINE Zahl
     fuer die Links. Seit die Zeile einen Verfasser hat, kann sie fremd sein und
     gehoert auf dieselbe Seite wie Kommentar, Bewertung und Testtag. */
  pruefe('Und die Links getrennt nach eigen und fremd',
    fBBert?.eigenLinks === 1 && fBBert?.fremdLinks === 1, JSON.stringify(fBBert));
  pruefe('Fuer den Admin ohne eigenen Beitrag sind beide Links fremd',
    fBCarla?.eigenLinks === 0 && fBCarla?.fremdLinks === 2, JSON.stringify(fBCarla));
  // Und die Gegenrichtung: fuer anna ist genau die andere Zeile die eigene.
  pruefe('Fuer den zweiten Verfasser sind dieselben zwei Zeilen andersherum verteilt',
    fBAnna?.eigenLinks === 1 && fBAnna?.fremdLinks === 1, JSON.stringify(fBAnna));

  const fBFremd = await fRuf('cookie-f-dirk', 'GET', `/api/items/${fVId}/bestand`);
  pruefe('Wer nicht loeschen darf, bekommt die Zahlen nicht', fBFremd.status === 403,
    `Status ${fBFremd.status}`);
  pruefe('Die Absage nennt den Grund',
    /angelegt hat/.test(fBFremd.inhalt?.error || ''), fBFremd.inhalt?.error);

  /* ---------------------------------------------------------------- */
  gruppe('Wer hat bewertet -- die Ansicht des Admins');

  /* Die Liste stand bis 0.8.5 an jeder Kriterienzeile der Eintragsantwort und
     ging damit an jeden. Sie steht jetzt hinter einem eigenen lesenden
     Endpunkt mit Waechter -- dasselbe Muster wie GET /api/stats, also OHNE
     Eintrag in F_ROUTEN.
     Vier Rufer nebeneinander, weil erst sie die Klemme sichtbar machen: der
     Fremde, der Verfasser des Eintrags, der Admin ohne Eigentuemerrecht und
     die Eigentuemerin. */
  const fStRuf = (cookieWert) => fRuf(cookieWert, 'GET', `/api/items/${fVId}/stimmen`);
  const fStBestand = () => fZeilen('SELECT id, value, user_id FROM ratings WHERE item_id = ? ORDER BY id', fVId);
  const fStVorher = fStBestand();

  const fStDirk = await fStRuf('cookie-f-dirk');
  const fStBert = await fStRuf('cookie-f-bert');
  const fStCarla = await fStRuf('cookie-f-carla');
  const fStAnna = await fStRuf('cookie-f-anna');

  pruefe('Wer welchen Wert vergeben hat, sieht nur der Admin',
    fStDirk.status === 403, `Status ${fStDirk.status}`);
  /* Der Verfasser des Eintrags ausdruecklich auch nicht. Er darf den Eintrag
     loeschen, samt allem, was daran haengt -- aber wie eine ANDERE PERSON
     bewertet hat, ist keine Angabe ueber seinen Eintrag. Ohne diesen Rufer
     bliebe die Pruefung auch dann gruen, wenn dort nurEintragVerfasser
     stuende (Stolperstein 73). */
  pruefe('Auch der Verfasser des Eintrags nicht',
    fStBert.status === 403, `Status ${fStBert.status}`);
  pruefe('Die Absage nennt den Admin',
    /Admin/.test(fStBert.inhalt?.error || ''), fStBert.inhalt?.error);
  // Der Erfolgsfall daneben, an BEIDEN Rollen: ohne ihn waere "403 fuer jeden"
  // von "403 fuer den Benutzer" nicht zu unterscheiden.
  pruefe('Ein Admin ohne Eigentuemerrecht bekommt die Liste',
    fStCarla.status === 200 && Array.isArray(fStCarla.inhalt), `Status ${fStCarla.status}`);
  pruefe('Und die Eigentuemerin auch',
    fStAnna.status === 200 && Array.isArray(fStAnna.inhalt), `Status ${fStAnna.status}`);
  // Lesend heisst lesend: nach vier Abrufen steht jede Bewertungszeile
  // unveraendert da.
  pruefe('Und geschrieben wird dabei nichts',
    gleich(fStBestand(), fStVorher), JSON.stringify(fStBestand()));

  /* UMGEHAENGT MIT 0.8.6, nicht geloescht (Stolperstein 74): dieselben vier
     Aussagen wie bis 0.8.5 an der Eintragsantwort -- nur eben hier. */
  const fStOptik = (fStCarla.inhalt || []).find(z => z.criterion_id === fOptikId);
  pruefe('Je Kriterium steht, wer welchen Wert vergeben hat',
    gleich((fStOptik?.stimmen || []).map(s => `${s.verfasser?.name}/${s.wert}`), ['bert/4', 'anna/2']),
    JSON.stringify(fStOptik?.stimmen));
  /* Die Bedingung value > 0 an genau dieser Stelle: carla hat bewertet und
     zurueckgesetzt, ihre Zeile steht mit 0 in der Tabelle. Sie ist keine
     Stimme -- dieselbe Regel wie beim Schnitt und beim Verwendungszaehler. */
  pruefe('Eine zurueckgesetzte Bewertung ist keine Stimme',
    !(fStOptik?.stimmen || []).some(s => s.verfasser?.name === 'carla') &&
    fZeilen('SELECT value FROM ratings WHERE item_id = ? AND user_id = 3', fVId)[0]?.value === 0,
    JSON.stringify(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = ?', fVId)));
  // Ohne die id gaebe es vom Bildschirm aus keinen Weg zu einer einzelnen
  // fremden Bewertung -- DELETE /api/ratings/:id waere unerreichbar.
  pruefe('Jede Stimme nennt ihre Nummer',
    (fStOptik?.stimmen || []).every(s => Number.isInteger(s.id)),
    JSON.stringify((fStOptik?.stimmen || []).map(s => s.id)));
  /* `mine` haengt am ABRUFENDEN, nicht an der Zeile. Deshalb zwei Sichten
     nebeneinander: anna hat selbst bewertet, carla hat ihre Bewertung
     zurueckgesetzt und ist damit an keiner Stimme beteiligt. Waere nur eine
     Sicht geprueft, bliebe offen, ob das Feld ueberhaupt vom Rufer abhaengt. */
  const fStOptikAnna = (fStAnna.inhalt || []).find(z => z.criterion_id === fOptikId);
  pruefe('Die eigene Stimme ist als solche gekennzeichnet',
    gleich((fStOptikAnna?.stimmen || []).map(s => s.mine), [false, true]),
    JSON.stringify((fStOptikAnna?.stimmen || []).map(s => s.mine)));
  pruefe('Und fuer einen Admin ohne eigene Bewertung ist es keine davon',
    (fStOptik?.stimmen || []).length === 2 &&
    (fStOptik?.stimmen || []).every(s => s.mine === false),
    JSON.stringify((fStOptik?.stimmen || []).map(s => s.mine)));
  // Der Grabsteinname verlaesst den Server nicht -- hier gibt es keinen, aber
  // die Form ist dieselbe wie ueberall: ein Objekt, nie die nackte Nummer.
  pruefe('Die Stimme nennt den Verfasser als Objekt, nicht als Nummer',
    (fStOptik?.stimmen || []).every(s => s.verfasser && s.user_id === undefined),
    JSON.stringify(fStOptik?.stimmen));

  /* ---------------------------------------------------------------- */
  gruppe('Eine fremde Bewertung entfernen');

  const fRAnna = fZeilen('SELECT id FROM ratings WHERE item_id = ? AND user_id = 1', fVId)[0]?.id;
  const fRBert = fZeilen('SELECT id FROM ratings WHERE item_id = ? AND user_id = 2', fVId)[0]?.id;
  const fRSteht = (id) => fZeilen('SELECT id FROM ratings WHERE id = ?', id).length === 1;

  const fRDirk = await fRuf('cookie-f-dirk', 'DELETE', `/api/ratings/${fRAnna}`);
  pruefe('Ein Fremder entfernt keine fremde Bewertung', fRDirk.status === 403,
    `Status ${fRDirk.status}`);
  pruefe('Und die Zeile steht noch', fRSteht(fRAnna));
  const fRBertFremd = await fRuf('cookie-f-bert', 'DELETE', `/api/ratings/${fRAnna}`);
  pruefe('Auch der Verfasser des Eintrags nicht -- die Bewertung ist nicht seine',
    fRBertFremd.status === 403, `Status ${fRBertFremd.status}`);
  pruefe('Auch danach steht sie noch', fRSteht(fRAnna));

  const fREigen = await fRuf('cookie-f-bert', 'DELETE', `/api/ratings/${fRBert}`);
  pruefe('Die eigene entfernt jeder', fREigen.status === 200 && !fRSteht(fRBert),
    `Status ${fREigen.status}`);
  /* Der Erfolgsfall daneben, und zwar mit dem Admin OHNE Eigentuemerrecht --
     sonst bliebe die Pruefung auch dann gruen, wenn dort nurEigentuemer
     stuende. */
  const fRAdmin = await fRuf('cookie-f-carla', 'DELETE', `/api/ratings/${fRAnna}`);
  pruefe('Der Admin entfernt eine fremde Bewertung',
    fRAdmin.status === 200 && !fRSteht(fRAnna), `Status ${fRAdmin.status}`);
  /* UMGEHAENGT MIT 0.8.6: bis 0.8.5 stand hier die Zahl der Stimmen in der
     Antwort. Die Antwort ist weiterhin der neu gezeichnete Eintrag -- nur ist
     die Bewerterzahl jetzt das, woran sich das ablesen laesst. Beide
     Bewertungen auf Optik sind entfernt, also steht dort keine mehr. */
  pruefe('Die Antwort ist der neu gezeichnete Eintrag',
    (fRAdmin.inhalt?.ratings || []).find(r => r.criterion_id === fOptikId)?.count === 0,
    JSON.stringify(fRAdmin.inhalt?.ratings?.find(r => r.criterion_id === fOptikId)));
  /* Und die Ansicht des Admins zeigt dort gar keine Zeile mehr: aufgenommen
     werden nur Kriterien MIT Stimmen. Ein Kriterium ohne Stimme bekaeme sonst
     eine leere Liste unter seinem Namen -- eine Zeile, die nichts sagt. */
  const fStLeer = await fStRuf('cookie-f-carla');
  pruefe('Ein Kriterium ohne Stimme steht gar nicht in der Ansicht',
    fStLeer.status === 200 &&
    !(fStLeer.inhalt || []).some(z => z.criterion_id === fOptikId),
    JSON.stringify(fStLeer.inhalt));
  const fRWeg = await fRuf('cookie-f-carla', 'DELETE', `/api/ratings/${fRAnna}`);
  pruefe('Eine Bewertung, die es nicht gibt, meldet 404', fRWeg.status === 404,
    `Status ${fRWeg.status}`);

  /* Loeschen ja, umschreiben nein -- und das ist hier eine Aussage ueber den
     Quelltext, nicht ueber einen Ruf: es darf gar keinen Weg geben, der eine
     fremde Note VERAENDERT. Ein PUT auf denselben Pfad waere genau der. */
  pruefe('Es gibt keinen Weg, eine fremde Bewertung zu aendern',
    !/app\.(put|post|patch)\('\/api\/ratings/
      .test(fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8')),
    'ein schreibender Weg auf /api/ratings, der die Note aendert');

  /* ---------------------------------------------------------------- */
  gruppe('Wer darf anlegen');

  /* Zwei getrennte globale Schalter, Vorgabe an. Abgeschaltet wird
     ausschliesslich das ANLEGEN eines neuen Namens -- ZUWEISEN DARF IMMER
     JEDER, und genau das ist der Kern: die Klemme sitzt an jedem der drei Wege
     HINTER dem Nachschlagen des vorhandenen Namens.

     BERT IST DER RUFER, FUER DEN DIE ADMINFRAGE FALSCH IST. Ohne ihn bliebe
     hier alles gruen, denn darfAnlegen beginnt mit einem meist wahren ODER
     (Stolperstein 73): fuer carla und anna ist der erste Teil ohnehin wahr.
     Bert gehoert ausserdem Eintrag 2 -- er kommt also an nurEintragVerfasser
     vorbei und scheitert, wenn ueberhaupt, an der neuen Klemme und an keiner
     anderen.
     Zu jeder Verweigerung steht der Erfolgsfall daneben UND die Nachschau,
     dass wirklich keine Zeile entstanden ist. */
  const fTagZahl = () => fZeilen('SELECT id FROM tags').length;
  const fKatZahl = () => fZeilen('SELECT id FROM product_categories').length;
  const fSchalter = (k) => fEine('SELECT value FROM settings WHERE key = ?', k);

  /* VORGABE AN, UND ZWAR ALS ABLEITUNG BEIM LESEN: in der Datenbank steht
     dafuer nichts. Ein Migrationsblock waere hier Code, der zu 1.0 wieder
     herausmuesste -- eine Ableitung muss gar nicht erst entfernt werden. */
  const fEinstBert = (await fRuf('cookie-f-bert', 'GET', '/api/settings')).inhalt;
  pruefe('Beide Schalter stehen in der Antwort und auf an',
    fEinstBert?.tagsFreiAnlegen === true && fEinstBert?.kategorienFreiAnlegen === true,
    JSON.stringify([fEinstBert?.tagsFreiAnlegen, fEinstBert?.kategorienFreiAnlegen]));
  pruefe('Und dafuer steht nichts in der Datenbank -- abgeleitet beim Lesen',
    fSchalter('tagsFreiAnlegen') === undefined && fSchalter('kategorienFreiAnlegen') === undefined,
    JSON.stringify([fSchalter('tagsFreiAnlegen'), fSchalter('kategorienFreiAnlegen')]));

  // Der Erfolgsfall ZUERST, mit eingeschaltetem Schalter: ohne ihn liesse sich
  // nicht sehen, ob der Weg ueberhaupt je offen ist.
  const fTagVorher = fTagZahl();
  const fNeuTagAn = await fRuf('cookie-f-bert', 'POST', '/api/items/2/tags', { name: 'Frisch' });
  pruefe('Mit Schalter an legt auch ein gewoehnlicher Benutzer einen Tag an',
    fNeuTagAn.status === 201 && fTagZahl() === fTagVorher + 1,
    `Status ${fNeuTagAn.status}, ${fTagVorher} -> ${fTagZahl()}`);
  const fKatVorher = fKatZahl();
  const fNeuKatAn = await fRuf('cookie-f-bert', 'POST', '/api/product-categories', { name: 'Frischkategorie' });
  pruefe('Und ebenso eine Kategorie',
    fNeuKatAn.status === 201 && fKatZahl() === fKatVorher + 1,
    `Status ${fNeuKatAn.status}, ${fKatVorher} -> ${fKatZahl()}`);

  /* Umgelegt wird ueber PUT /api/settings -- keine neue Route. Die
     Adminpruefung dort ist ABGELEITET ("was nicht persoenlich ist, ist
     Adminsache") und muss die beiden neuen Schluessel deshalb von selbst
     greifen. Ein Benutzer kommt nicht daran, und zwar bevor irgendetwas
     geschrieben ist. */
  const fSchalterBert = await fRuf('cookie-f-bert', 'PUT', '/api/settings', { tagsFreiAnlegen: false });
  pruefe('Ein Benutzer legt die Schalter nicht um', fSchalterBert.status === 403,
    `Status ${fSchalterBert.status}`);
  pruefe('Die Absage nennt den Admin',
    /Admin/.test(fSchalterBert.inhalt?.error || ''), fSchalterBert.inhalt?.error);
  pruefe('Und in der Datenbank steht danach immer noch nichts',
    fSchalter('tagsFreiAnlegen') === undefined, JSON.stringify(fSchalter('tagsFreiAnlegen')));

  /* Der Admin OHNE Eigentuemerrecht legt sie um -- sonst bliebe die Pruefung
     auch dann gruen, wenn dort nurEigentuemer stuende. */
  const fSchalterAus = await fRuf('cookie-f-carla', 'PUT', '/api/settings',
    { tagsFreiAnlegen: false, kategorienFreiAnlegen: false });
  pruefe('Der Admin legt beide Schalter um',
    fSchalterAus.status === 200 && fSchalterAus.inhalt?.tagsFreiAnlegen === false &&
    fSchalterAus.inhalt?.kategorienFreiAnlegen === false,
    JSON.stringify([fSchalterAus.status, fSchalterAus.inhalt?.tagsFreiAnlegen]));
  pruefe('Erst jetzt steht etwas in der Datenbank',
    fSchalter('tagsFreiAnlegen')?.value === 'false', JSON.stringify(fSchalter('tagsFreiAnlegen')));
  pruefe('Und der naechste Abruf liefert dieselbe Stellung',
    (await fRuf('cookie-f-bert', 'GET', '/api/settings')).inhalt?.tagsFreiAnlegen === false);

  /* ---- Weg 1: Tags am Eintrag ---- */
  const fTagAus = fTagZahl();
  const fTagNeuAus = await fRuf('cookie-f-bert', 'POST', '/api/items/2/tags', { name: 'Verboten' });
  pruefe('Mit Schalter aus legt der Benutzer keinen neuen Tag mehr an',
    fTagNeuAus.status === 403, `Status ${fTagNeuAus.status}`);
  pruefe('Und es ist keine Zeile entstanden',
    fTagZahl() === fTagAus && fZeilen('SELECT id FROM tags WHERE name = ?', 'Verboten').length === 0,
    `${fTagAus} -> ${fTagZahl()}`);
  pruefe('Die Absage sagt, woran es liegt',
    /Neue Tags/.test(fTagNeuAus.inhalt?.error || ''), fTagNeuAus.inhalt?.error);
  /* DIE ZEILE, UM DIE ES GEHT: der vorhandene Tag laesst sich weiterhin
     zuweisen. Stuende die Klemme VOR dem Nachschlagen, naehme sie das Zuweisen
     mit -- und "Zuweisen darf immer jeder" waere nur noch eine Behauptung. */
  const fTagVergeben = await fRuf('cookie-f-bert', 'POST', '/api/items/2/tags', { name: 'Frisch' });
  pruefe('Einen VORHANDENEN Tag vergibt er trotzdem',
    fTagVergeben.status === 201 &&
    (fTagVergeben.inhalt?.tags || []).some(t => t.name === 'Frisch'),
    `Status ${fTagVergeben.status}: ${JSON.stringify((fTagVergeben.inhalt?.tags || []).map(t => t.name))}`);
  pruefe('Und dabei entsteht keine zweite Zeile fuer denselben Namen',
    fTagZahl() === fTagAus, `${fTagAus} -> ${fTagZahl()}`);
  // Der Admin kommt weiterhin durch: ihm gehoert das Aufraeumen, und ein
  // Schalter, den er erst umlegen muesste, waere eine Schranke gegen sich selbst.
  const fTagAdmin = await fRuf('cookie-f-carla', 'POST', '/api/items/2/tags', { name: 'Vom Admin' });
  pruefe('Der Admin legt auch bei ausgeschaltetem Schalter an',
    fTagAdmin.status === 201 && fTagZahl() === fTagAus + 1,
    `Status ${fTagAdmin.status}, ${fTagAus} -> ${fTagZahl()}`);

  /* ---- Weg 2: Kategorien ---- */
  const fKatAus = fKatZahl();
  const fKatNeuAus = await fRuf('cookie-f-bert', 'POST', '/api/product-categories', { name: 'Verbotene' });
  pruefe('Mit Schalter aus legt der Benutzer keine neue Kategorie mehr an',
    fKatNeuAus.status === 403, `Status ${fKatNeuAus.status}`);
  pruefe('Auch hier ist keine Zeile entstanden',
    fKatZahl() === fKatAus &&
    fZeilen('SELECT id FROM product_categories WHERE name = ?', 'Verbotene').length === 0,
    `${fKatAus} -> ${fKatZahl()}`);
  pruefe('Und die Absage sagt es',
    /Neue Kategorien/.test(fKatNeuAus.inhalt?.error || ''), fKatNeuAus.inhalt?.error);
  const fKatVorhanden = await fRuf('cookie-f-bert', 'POST', '/api/product-categories',
    { name: 'frischkategorie' });
  pruefe('Eine VORHANDENE Kategorie bekommt er weiterhin -- auch in anderer Schreibweise',
    fKatVorhanden.status === 200 && fKatVorhanden.inhalt?.name === 'Frischkategorie',
    `Status ${fKatVorhanden.status}: ${JSON.stringify(fKatVorhanden.inhalt)}`);
  const fKatAdmin = await fRuf('cookie-f-carla', 'POST', '/api/product-categories', { name: 'Vom Admin' });
  pruefe('Der Admin legt auch hier weiterhin an',
    fKatAdmin.status === 201 && fKatZahl() === fKatAus + 1,
    `Status ${fKatAdmin.status}, ${fKatAus} -> ${fKatZahl()}`);

  /* ---- Weg 3: Tags am Testtag ----
     DER SONDERFALL: dort gibt es keine Wolke, die Eingabe ist der einzige
     Zuweisungsweg und bleibt auf dem Bildschirm stehen. Ein unbekannter Name
     faellt deshalb hier durch, mit sprechender Meldung -- und ein bekannter
     kommt weiterhin an. Bert braucht dafuer einen EIGENEN Testtag: an einen
     fremden haengt er ohnehin nichts (nurSelbst). */
  const fTtagNeu = await fRuf('cookie-f-bert', 'POST', '/api/items/2/test-days',
    { day: '2024-09-09', rating: 3 });
  const fTtagId = fEine('SELECT id FROM test_days WHERE day = ? AND user_id = 2', '2024-09-09')?.id;
  pruefe('Bert hat einen eigenen Testtag', fTtagNeu.status === 201 && !!fTtagId,
    `Status ${fTtagNeu.status}, id ${fTtagId}`);
  const fTtagVerboten = await fRuf('cookie-f-bert', 'POST', `/api/test-days/${fTtagId}/tags`,
    { name: 'Nebel' });
  pruefe('Am eigenen Testtag legt er keinen neuen Tag an',
    fTtagVerboten.status === 403, `Status ${fTtagVerboten.status}`);
  pruefe('Und auch dort entsteht keine Zeile',
    fZeilen('SELECT id FROM tags WHERE name = ?', 'Nebel').length === 0 &&
    fZeilen('SELECT tag_id FROM test_day_tags WHERE test_day_id = ?', fTtagId).length === 0);
  pruefe('Die Meldung ist dieselbe sprechende',
    /Neue Tags/.test(fTtagVerboten.inhalt?.error || ''), fTtagVerboten.inhalt?.error);
  const fTtagBekannt = await fRuf('cookie-f-bert', 'POST', `/api/test-days/${fTtagId}/tags`,
    { name: 'Frisch' });
  pruefe('Einen bekannten Namen weist er dem Testtag weiterhin zu',
    fTtagBekannt.status === 201 &&
    fZeilen('SELECT tag_id FROM test_day_tags WHERE test_day_id = ?', fTtagId).length === 1,
    `Status ${fTtagBekannt.status}`);

  /* Und wieder an: der Weg muss sich auch oeffnen lassen, sonst belegte die
     Pruefung nur, dass er zu ist. */
  await fRuf('cookie-f-anna', 'PUT', '/api/settings',
    { tagsFreiAnlegen: true, kategorienFreiAnlegen: true });
  const fWiederAn = fTagZahl();
  const fTagWiederAn = await fRuf('cookie-f-bert', 'POST', '/api/items/2/tags', { name: 'Wieder frei' });
  pruefe('Umgelegt steht der Weg wieder offen',
    fTagWiederAn.status === 201 && fTagZahl() === fWiederAn + 1,
    `Status ${fTagWiederAn.status}, ${fWiederAn} -> ${fTagZahl()}`);
  pruefe('Und der Schalter steht als wahr in der Datenbank, nicht als Loch',
    fSchalter('tagsFreiAnlegen')?.value === 'true', JSON.stringify(fSchalter('tagsFreiAnlegen')));

  /* ---------------------------------------------------------------- */
  gruppe('Offene Aufgaben: die Ansicht');

  /* Die Prueflage traegt NEBEN der offenen Aufgabe eine ERLEDIGTE, eine NOTIZ
     und einen BERICHT. Ohne die drei belegte die Pruefung nur, dass ueberhaupt
     etwas erscheint -- und nicht, dass genau das Richtige erscheint.
     ZWEI Eintraege, weil sich an einem einzigen die Gruppierung gar nicht
     zeigen liesse, und im ersten ZWEI offene Aufgaben: bei einer waere jede
     falsche Ordnung unsichtbar.
     DIE ZEITSTEMPEL WERDEN VON HAND GESETZT (Stolperstein 60): datetime('now')
     loest nur Sekunden auf, und zwei in derselben Sekunde angelegte Eintraege
     stuenden in unbestimmter Reihenfolge -- die Pruefung auf die Ordnung
     koennte dann gar nicht scheitern. */
  const oA = (await fRuf('cookie-f-anna', 'POST', '/api/items', { title: 'Aufgabenblatt A' })).inhalt;
  const oB = (await fRuf('cookie-f-bert', 'POST', '/api/items', { title: 'Aufgabenblatt B' })).inhalt;
  const oSchreib = async (cookie, itemId, text, kind) =>
    (await fRuf(cookie, 'POST', `/api/items/${itemId}/comments`, { text, kind })).inhalt;
  await oSchreib('cookie-f-anna', oA.id, 'A-eins offen', 'task');
  await oSchreib('cookie-f-bert', oA.id, 'A-zwei offen', 'task');
  await oSchreib('cookie-f-anna', oA.id, 'A-drei erledigt', 'done');
  await oSchreib('cookie-f-anna', oA.id, 'A-vier Notiz', 'note');
  await oSchreib('cookie-f-anna', oA.id, 'A-fuenf Bericht', 'report');
  await oSchreib('cookie-f-carla', oB.id, 'B-eins offen', 'task');
  // Eine HERRENLOSE Aufgabe: der Verfasser fehlt, und das Feld muss trotzdem
  // dastehen -- null heisst "diese Zeile hat keinen Verfasser", ein fehlendes
  // Feld hiesse "diese Antwort kennt das Feld nicht". Erst nach dem Start
  // geleert, sonst schoebe ordneBestandZu() sie der Eigentuemerin zu.
  await oSchreib('cookie-f-anna', oB.id, 'B-zwei herrenlos', 'task');
  fSchreibe("UPDATE comments SET user_id = NULL WHERE text = 'B-zwei herrenlos'");
  // B ist juenger als A -- die Ansicht muss B deshalb zuerst nennen.
  fSchreibe("UPDATE items SET updated_at = '2026-08-02 10:00:00' WHERE id = ?", oA.id);
  fSchreibe("UPDATE items SET updated_at = '2026-08-03 10:00:00' WHERE id = ?", oB.id);

  const oHole = async (cookie) => (await fRuf(cookie, 'GET', '/api/offen')).inhalt;
  const oListe = await oHole('cookie-f-anna');
  const oTexte = (l) => (l || []).map(z => z.text);

  /* Erst das Vorhandensein, dann die Verneinung (Stolperstein 81): dass die
     erledigte Aufgabe, die Notiz und der Bericht ueberhaupt in der Datenbank
     stehen, wird ausdruecklich geprueft -- sonst bliebe jede Aussage darueber,
     dass sie NICHT erscheinen, auf einem leeren Bestand gruen. */
  pruefe('Die Prueflage traegt neben den offenen Aufgaben auch die drei anderen Arten',
    fZeilen("SELECT id FROM comments WHERE kind = 'done' AND text = 'A-drei erledigt'").length === 1 &&
    fZeilen("SELECT id FROM comments WHERE kind = 'note' AND text = 'A-vier Notiz'").length === 1 &&
    fZeilen("SELECT id FROM comments WHERE kind = 'report' AND text = 'A-fuenf Bericht'").length === 1,
    JSON.stringify(fZeilen("SELECT text, kind FROM comments WHERE item_id IN (?, ?)", oA.id, oB.id)));
  pruefe('Die Ansicht zeigt genau die nicht erledigten Aufgaben',
    gleich(oTexte(oListe).slice().sort(),
      ['A-eins offen', 'A-zwei offen', 'B-eins offen', 'B-zwei herrenlos']),
    JSON.stringify(oTexte(oListe)));
  pruefe('Die erledigte Aufgabe steht nicht darin',
    !oTexte(oListe).includes('A-drei erledigt'), JSON.stringify(oTexte(oListe)));
  pruefe('Notiz und Bericht ebenso wenig',
    !oTexte(oListe).includes('A-vier Notiz') && !oTexte(oListe).includes('A-fuenf Bericht'),
    JSON.stringify(oTexte(oListe)));

  /* Die Reihenfolge ist die der Uebersicht: updated_at des Eintrags
     absteigend, innerhalb des Eintrags die aelteste Aufgabe oben. Damit stehen
     die Zeilen eines Eintrags beieinander -- die Gruppierung in der Oberflaeche
     braucht keine zweite Ordnung. */
  pruefe('Der juengere Eintrag steht oben, wie in der Uebersicht',
    gleich(oTexte(oListe), ['B-eins offen', 'B-zwei herrenlos', 'A-eins offen', 'A-zwei offen']),
    JSON.stringify(oTexte(oListe)));
  pruefe('Die Zeilen eines Eintrags stehen beieinander',
    gleich((oListe || []).map(z => z.item?.id), [oB.id, oB.id, oA.id, oA.id]),
    JSON.stringify((oListe || []).map(z => z.item?.id)));

  /* Jedes Feld, das die Oberflaeche aus der Antwort liest, an der ECHTEN
     Antwort geprueft -- nicht nur am Mock (Stolperstein 102). */
  const oEine = (l, text) => (l || []).find(z => z.text === text);
  pruefe('Jede Zeile nennt ihren Eintrag mit Nummer und Titel',
    oEine(oListe, 'A-eins offen')?.item?.id === oA.id &&
    oEine(oListe, 'A-eins offen')?.item?.title === 'Aufgabenblatt A',
    JSON.stringify(oEine(oListe, 'A-eins offen')?.item));
  pruefe('Jede Zeile nennt ihren Verfasser',
    oEine(oListe, 'A-eins offen')?.verfasser?.name === 'anna' &&
    oEine(oListe, 'A-zwei offen')?.verfasser?.name === 'bert' &&
    oEine(oListe, 'B-eins offen')?.verfasser?.name === 'carla',
    JSON.stringify((oListe || []).map(z => z.verfasser)));
  pruefe('Eine herrenlose Zeile traegt null, und das Feld fehlt nicht',
    'verfasser' in (oEine(oListe, 'B-zwei herrenlos') || {}) &&
    oEine(oListe, 'B-zwei herrenlos')?.verfasser === null,
    JSON.stringify(oEine(oListe, 'B-zwei herrenlos')));
  pruefe('Jede Zeile nennt ihr Datum',
    (oListe || []).every(z => /^\d{4}-\d{2}-\d{2} /.test(z.created_at || '')),
    JSON.stringify((oListe || []).map(z => z.created_at)));
  pruefe('Die Verfassernummer steht in keiner Zeile',
    !(oListe || []).some(z => 'user_id' in z), JSON.stringify(Object.keys(oListe?.[0] || {})));

  /* mine ist die Grundlage des Hakens -- ohne die Angabe muesste die
     Oberflaeche aus dem Verfasserobjekt zurueckrechnen, und bei einem
     Grabstein ginge das gar nicht. Dieselbe Antwort sieht fuer zwei Leute
     verschieden aus; mit nur einem Rufer waere das nicht zu sehen. */
  const oListeBert = await oHole('cookie-f-bert');
  pruefe('mine steht an jeder Zeile',
    (oListe || []).every(z => typeof z.mine === 'boolean'),
    JSON.stringify((oListe || []).map(z => z.mine)));
  pruefe('Dieselbe Zeile ist fuer den einen meine und fuer den anderen nicht',
    oEine(oListe, 'A-eins offen')?.mine === true &&
    oEine(oListeBert, 'A-eins offen')?.mine === false,
    JSON.stringify([oEine(oListe, 'A-eins offen')?.mine, oEine(oListeBert, 'A-eins offen')?.mine]));
  pruefe('Und umgekehrt an der Zeile des anderen',
    oEine(oListe, 'A-zwei offen')?.mine === false &&
    oEine(oListeBert, 'A-zwei offen')?.mine === true,
    JSON.stringify([oEine(oListe, 'A-zwei offen')?.mine, oEine(oListeBert, 'A-zwei offen')?.mine]));
  pruefe('Eine herrenlose Zeile gehoert niemandem',
    oEine(oListe, 'B-zwei herrenlos')?.mine === false,
    JSON.stringify(oEine(oListe, 'B-zwei herrenlos')?.mine));

  /* ---------------------------------------------------------------- */
  gruppe('Der Haken am Aufgabenkommentar');

  /* Der Haken geht ueber PUT /api/comments/:id -- dieselbe Route, dieselbe
     Klemme wie im Eintrag: die Art setzt der Verfasser oder der Admin, sonst
     niemand. Zu JEDER Verweigerung gehoert der Erfolgsfall daneben UND die
     Nachschau, dass wirklich nichts geschrieben wurde. */
  const oArt = (text) => fEine('SELECT kind FROM comments WHERE text = ?', text)?.kind;
  const oNr = (text) => fEine('SELECT id FROM comments WHERE text = ?', text)?.id;
  pruefe('Vor allem anderen: die Aufgaben stehen als offen in der Datenbank',
    oArt('A-eins offen') === 'task' && oArt('A-zwei offen') === 'task',
    JSON.stringify([oArt('A-eins offen'), oArt('A-zwei offen')]));

  /* DER FREMDE IST HIER BERT: carla traegt seit der Gruppe "Was dem
     Eigentuemer gehoert" die Adminrolle und kaeme durch. Wer sie als Fremde
     einsetzte, pruefte die Klemme an einem Zugang, der sie gar nicht
     spuert -- gruen, aber ueber etwas anderes. */
  const oHakenFremd = await fRuf('cookie-f-bert', 'PUT', `/api/comments/${oNr('A-eins offen')}`,
    { kind: 'done' });
  pruefe('Ein Fremder hakt eine fremde Aufgabe nicht ab',
    oHakenFremd.status === 403, `Status ${oHakenFremd.status}`);
  pruefe('Und sie steht unveraendert offen da', oArt('A-eins offen') === 'task', oArt('A-eins offen'));
  /* Auch die herrenlose nicht: eine Zeile ohne Verfasser gehoert dem Admin,
     nicht allen. Ohne diese Zeile bliebe die Klemme an der herrenlosen Zeile
     an dieser Route ungeprueft. */
  const oHakenHerrenlos = await fRuf('cookie-f-bert', 'PUT',
    `/api/comments/${oNr('B-zwei herrenlos')}`, { kind: 'done' });
  pruefe('Und eine herrenlose erst recht nicht', oHakenHerrenlos.status === 403,
    `Status ${oHakenHerrenlos.status}`);
  pruefe('Auch sie steht unveraendert offen da',
    oArt('B-zwei herrenlos') === 'task', oArt('B-zwei herrenlos'));

  const oHakenEigen = await fRuf('cookie-f-bert', 'PUT', `/api/comments/${oNr('A-zwei offen')}`,
    { kind: 'done' });
  pruefe('Der Verfasser hakt seine eigene Aufgabe ab',
    oHakenEigen.status === 200 && oArt('A-zwei offen') === 'done',
    `Status ${oHakenEigen.status} / ${oArt('A-zwei offen')}`);
  /* Der Admin am FREMDEN Haken -- das ist die Antwort auf die Rechtefrage
     dieser Runde, und sie steht hier, damit sie nicht nur behauptet ist.
     "Loeschen ja, umschreiben nein" bleibt unberuehrt: ein Haken aendert keine
     fremde Aussage, er setzt ein Merkmal, und Merkmale darf der Admin seit
     0.7.2.
     CARLA und nicht anna: ein Admin OHNE Eigentuemerrolle. Mit anna liesse
     sich nicht sehen, ob hier die Adminfrage entscheidet oder die
     Eigentuemerfrage. */
  const oHakenAdmin = await fRuf('cookie-f-carla', 'PUT', `/api/comments/${oNr('A-eins offen')}`,
    { kind: 'done' });
  pruefe('Ein Admin ohne Eigentuemerrolle hakt eine fremde Aufgabe ab',
    oHakenAdmin.status === 200 && oArt('A-eins offen') === 'done',
    `Status ${oHakenAdmin.status} / ${oArt('A-eins offen')}`);

  const oNachHaken = await oHole('cookie-f-anna');
  pruefe('Die abgehakte Aufgabe faellt beim naechsten Aufbau aus der Ansicht',
    !oTexte(oNachHaken).includes('A-eins offen') && !oTexte(oNachHaken).includes('A-zwei offen'),
    JSON.stringify(oTexte(oNachHaken)));
  pruefe('Der Rest steht unveraendert da',
    gleich(oTexte(oNachHaken), ['B-eins offen', 'B-zwei herrenlos']),
    JSON.stringify(oTexte(oNachHaken)));

  /* Und zurueck: der Haken muss sich wegnehmen lassen, sonst belegte die
     Pruefung nur, dass er in eine Richtung wirkt. Die Zeile wird wieder eine
     AUFGABE und keine Notiz -- die Weiterschaltung im Eintrag geht auf Notiz
     weiter, der Haken ist ein Zustand und keine Abfolge. */
  const oZurueck = await fRuf('cookie-f-anna', 'PUT', `/api/comments/${oNr('A-eins offen')}`,
    { kind: 'task' });
  pruefe('Der Haken laesst sich wieder wegnehmen',
    oZurueck.status === 200 && oArt('A-eins offen') === 'task', oArt('A-eins offen'));
  pruefe('Und die Zeile steht wieder in der Ansicht',
    oTexte(await oHole('cookie-f-anna')).includes('A-eins offen'));

  /* Die Ansicht liegt hinter der Anmeldung wie alles unter /api. Ohne diese
     Zeile bliebe offen, ob ein neuer lesender Endpunkt die Schicht umgeht. */
  const oOhneCookie = await fetch(F.basis + '/api/offen');
  pruefe('Ohne Anmeldung gibt es die Ansicht nicht', oOhneCookie.status === 401,
    `Status ${oOhneCookie.status}`);

  /* ---------------------------------------------------------------- */
  gruppe('Neu seit: die Sekunde am Rand');

  /* DIE PROBE, UM DIE ES IN DIESER RUNDE GEHT. datetime('now') loest nur
     Sekunden auf (Stolperstein 60). Wer die Uebersicht verlaesst, waehrend in
     DERSELBEN Sekunde jemand anderes kommentiert, traege sonst einen
     Merkzeitpunkt, der genau auf dem Zeitstempel dieses Eintrags liegt -- und
     der Eintrag gaelte nie als neu. Deshalb steht die Marke eine Sekunde
     davor.
     GETROFFEN WIRD DIE LAGE, NICHT BEHAUPTET: die beiden Rufe gehen
     unmittelbar nacheinander hinaus, und die Sekunde des Verlassens wird
     danach von der Uhr des Servers gelesen -- unabhaengig davon, wie die Marke
     gebildet wurde. Nur wenn der Eintrag wirklich diese Sekunde traegt, ist
     die Prueflage die gemeinte; bei einem Wechsel ueber die Sekundengrenze
     wird es noch einmal versucht. */
  const fUhr = () => {
    const d = fDatenbank();
    const t = d.prepare("SELECT datetime('now') AS t").get().t;
    d.close();
    return t;
  };
  let sekGetroffen = false, sekMarke = null, sekStand = null, sekVerlassen = null;
  for (let versuch = 0; versuch < 12 && !sekGetroffen; versuch++) {
    await fRuf('cookie-f-anna', 'PUT', '/api/settings', { zuletztGesehen: 1 });
    sekVerlassen = fUhr();
    await fRuf('cookie-f-bert', 'POST', `/api/items/${oA.id}/comments`,
      { text: `Sekundenprobe ${versuch}` });
    sekMarke = JSON.parse(fEine(
      "SELECT value FROM user_settings WHERE user_id = 1 AND key = 'zuletztGesehen'").value);
    sekStand = fEine('SELECT updated_at FROM items WHERE id = ?', oA.id).updated_at;
    sekGetroffen = sekStand === sekVerlassen;
  }
  pruefe('Die Prueflage trifft wirklich die Sekunde des Verlassens',
    sekGetroffen, `Verlassen ${sekVerlassen}, Eintrag ${sekStand}`);
  /* Und die eigentliche Zusicherung: der Kommentar aus genau dieser Sekunde
     kommt an. Steht die Marke ohne das Nachstellen auf der Sekunde des
     Verlassens, ist dieser Vergleich falsch -- und genau diese Zeile wird
     dann namentlich rot. */
  pruefe('Ein Kommentar aus der Sekunde des Verlassens gilt danach als neu',
    sekStand > sekMarke, `gemerkt ${sekMarke}, Eintrag ${sekStand}`);
  /* Die Gegenrichtung gehoert dazu: was VOR dem Merkzeitpunkt liegt, ist
     nicht neu. Ohne sie bliebe der Vergleich auch dann gruen, wenn er
     schlichtweg alles durchliesse. */
  fSchreibe("UPDATE items SET updated_at = '2020-01-01 00:00:00' WHERE id = ?", oB.id);
  pruefe('Was aelter ist als der Merkzeitpunkt, ist nicht neu',
    fEine('SELECT updated_at FROM items WHERE id = ?', oB.id).updated_at < sekMarke,
    `gemerkt ${sekMarke}`);

  await F.stopp();
  fs.rmSync(fDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Der Selbstbezug');

  /* Drei Stellen, an denen "der erste Benutzer" naheliegt, wo aber "der
     angemeldete" gemeint ist -- mit einem Zugang unsichtbar, ab dem zweiten
     schlagartig falsch.
     Diese Prueflage braucht ein ECHTES Passwort, sonst laesst sich der
     Zugangswechsel gar nicht ausloesen. Deshalb entsteht anna hier ueber die
     Einrichtungsseite und nicht von Hand; bert kommt danach dazu, samt einer
     zweiten Sitzung fuer anna. */
  const sbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-stufef-sb-'));
  const SB = starteWeiterenServer(sbDir, {}, 5740);
  await SB.bereit;
  await SB.ruf('POST', '/api/setup', { user: 'anna', password: 'annas-langes-wort' });

  {
    const d = oeffne(path.join(sbDir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    d.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('bert', 'x');
    const bertId = d.prepare('SELECT id FROM users WHERE username = ?').get('bert').id;
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run('cookie-sb-bert', bertId);
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, 1)').run('cookie-sb-anna-zwei');
    d.close();
  }
  const sbRuf = async (cookieWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${cookieWert}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(SB.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };
  const sbZeilen = (sql, ...werte) => {
    const d = oeffne(path.join(sbDir, 'katalog.sqlite'));
    const z = d.prepare(sql).all(...werte);
    d.close();
    return z;
  };

  /* Erste Stelle: GET /api/account. Stuende dort holeBenutzer(), also
     der erste Zugang, saehe bert den Namen der Eigentuemerin. */
  const sbKonto = await sbRuf('cookie-sb-bert', 'GET', '/api/account');
  pruefe('Der Systembereich nennt den angemeldeten Namen, nicht den ersten',
    sbKonto.inhalt?.username === 'bert', JSON.stringify(sbKonto.inhalt));

  /* Zweite Stelle, die schaerfste: naehme sich aendereZugang() den ersten
     Benutzer, benannte bert hier mit ANNAS Passwort ihren Zugang um, weil
     beides zusammenpasste. Geprueft wird gegen BERTS Zeile, und dessen
     Passwort ist es nicht. */
  const sbFremd = await sbRuf('cookie-sb-bert', 'PUT', '/api/account',
    { oldPassword: 'annas-langes-wort', username: 'uebernommen', newPassword: '' });
  pruefe('Ein Zweiter aendert mit fremdem Passwort nichts', sbFremd.status === 400,
    `Status ${sbFremd.status}`);
  pruefe('Und die Eigentuemerin heisst noch, wie sie hiess',
    gleich(sbZeilen('SELECT username FROM users ORDER BY id').map(z => z.username), ['anna', 'bert']),
    JSON.stringify(sbZeilen('SELECT username FROM users ORDER BY id')));

  /* Dritte Stelle: der Passwortwechsel raeumte alle Sitzungen ab, nicht nur
     die eigenen. Anna hat zwei, bert eine. */
  pruefe('Vor dem Wechsel stehen drei Sitzungen',
    sbZeilen('SELECT token FROM sessions').length === 3,
    JSON.stringify(sbZeilen('SELECT token, user_id FROM sessions')));
  const sbWechsel = await sbRuf('cookie-sb-anna-zwei', 'PUT', '/api/account',
    { oldPassword: 'annas-langes-wort', username: 'anna', newPassword: 'annas-neues-wort' });
  pruefe('Die Eigentuemerin wechselt ihr Passwort',
    sbWechsel.status === 200 && sbWechsel.inhalt?.passwortGewechselt === true,
    JSON.stringify(sbWechsel.inhalt));
  pruefe('Ihre andere Sitzung faellt',
    sbZeilen('SELECT token FROM sessions WHERE user_id = 1').length === 1,
    JSON.stringify(sbZeilen('SELECT token, user_id FROM sessions')));
  pruefe('Berts Sitzung bleibt bestehen',
    (await sbRuf('cookie-sb-bert', 'GET', '/api/account')).status === 200,
    JSON.stringify(sbZeilen('SELECT token, user_id FROM sessions')));

  /* username traegt UNIQUE COLLATE NOCASE. Ohne eine eigene Frage kaeme ab
     dem zweiten Zugang die rohe SQLite-Meldung als 400 heraus. */
  const sbKollision = await sbRuf('cookie-sb-anna-zwei', 'PUT', '/api/account',
    { oldPassword: 'annas-neues-wort', username: 'BERT', newPassword: '' });
  pruefe('Ein schon vergebener Name wird verstaendlich abgewiesen',
    sbKollision.status === 400 && /gibt es bereits/.test(sbKollision.inhalt?.error || ''),
    JSON.stringify(sbKollision.inhalt));
  pruefe('Und der eigene Name steht unveraendert',
    sbZeilen('SELECT username FROM users WHERE id = 1')[0]?.username === 'anna',
    JSON.stringify(sbZeilen('SELECT username FROM users WHERE id = 1')));

  await SB.stopp();
  fs.rmSync(sbDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Der Waechter ueber den Quelltext');

  /* Diese Gruppe prueft nicht, was der Server TUT, sondern was im Quelltext
     STEHT -- und sie ist die einzige, die eine FEHLENDE Entscheidung findet.
     Wer spaeter eine schreibende Route ergaenzt, ohne ueber ihr Recht zu
     entscheiden, wird hier namentlich rot; alle Prüfungen darüber bleiben
     gruen, weil es zu einer Route, die es noch nicht gibt, auch keine gibt.
     Geschnitten wird von Klammer zu Klammer mit indexOf, ausdruecklich OHNE
     zusammengesetztes Muster: eine aus einem String gebaute Regel wird
     zweistufig maskiert und sieht dabei in jeder Schreibweise plausibel aus
     -- und ist dabei in jeder Schreibweise plausibel.

     Vier Arten, und die Liste ist die Entscheidung:
       nurAdmin / nurEigentuemer / nurEintragVerfasser
                    -- benannter Waechter, steht in der Routenzeile
       'im Rumpf'   -- zwei Rechteklassen in einem Rumpf oder die
                       Eintragsnummer kommt erst aus der Kindzeile
       'nurAdmin, im Rumpf'
                    -- BEIDES: die Route steht hinter dem
                       Waechter UND unterscheidet drinnen noch einmal. Die drei
                       Verwaltungsrouten sind so gebaut: der Admin kommt herein,
                       an einen anderen Admin kommt aber nur der Eigentuemer.
                       Ohne diese Art bliebe eine der beiden Haelften ungeprueft
                       -- und zwar stillschweigend.
       'selbstbezug'-- der eigene Zugang, geprueft in auth.js
       'offen'      -- ausdruecklich fuer jeden, ODER baulich schon auf die
                       eigene Zeile begrenzt (Bewertungen). Hier gehoert
                       NICHTS hin, und auch das wird geprueft. */
  const fQuelle = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const RUMPF_WOERTER = ['darfAendern(', 'nurSelbst(', 'eintragFrei(', 'istAdmin(',
    'istEigentuemer(', 'zielZugangFrei(', 'darfAnlegen('];
  const F_ROUTEN = [
    ['POST',   '/api/setup',                     'offen'],
    ['POST',   '/api/login',                     'offen'],
    ['POST',   '/api/logout',                    'offen'],
    ['PUT',    '/api/account',                   'selbstbezug'],
    ['POST',   '/api/users',                     'nurAdmin, im Rumpf'],
    ['PUT',    '/api/users/:id',                 'nurAdmin, im Rumpf'],
    ['DELETE', '/api/users/:id',                 'nurAdmin, im Rumpf'],
    ['PUT',    '/api/titles',                    'nurAdmin'],
    ['PUT',    '/api/settings',                  'im Rumpf'],
    ['POST',   '/api/criteria',                  'nurAdmin'],
    ['PUT',    '/api/criteria/order',            'nurAdmin'],
    ['PUT',    '/api/criteria/:id',              'nurAdmin'],
    ['DELETE', '/api/criteria/:id',              'nurAdmin'],
    // Zuweisen darf jeder, einen NEUEN Namen anlegen haengt am Schalter --
    // deshalb im Rumpf und hinter dem Nachschlagen, nicht vor der Route.
    ['POST',   '/api/product-categories',        'im Rumpf'],
    ['PUT',    '/api/product-categories/:id',    'nurAdmin'],
    ['DELETE', '/api/product-categories/:id',    'nurAdmin'],
    ['PUT',    '/api/tags/:id',                  'nurAdmin'],
    ['DELETE', '/api/tags/:id',                  'nurAdmin'],
    ['POST',   '/api/items/:id/tags',            'nurEintragVerfasser, im Rumpf'],
    ['DELETE', '/api/items/:id/tags/:tagId',     'nurEintragVerfasser'],
    ['POST',   '/api/items',                     'offen'],
    ['PUT',    '/api/items/:id',                 'im Rumpf'],
    ['DELETE', '/api/items/:id',                 'nurEintragVerfasser'],
    ['POST',   '/api/items/:id/photos',          'nurEintragVerfasser'],
    // Eigene Route statt der erweiterten Fotoroute: deren fileFilter auf
    // ^image\/ zu lockern naehme die erste Schranke dem Fotoweg mit ab.
    // Dieselbe Klemme wie dort -- wer den Eintrag aendern darf, darf Videos
    // hinzufuegen, sonst niemand.
    ['POST',   '/api/items/:id/videos',          'nurEintragVerfasser'],
    ['PUT',    '/api/photos/:id/focus',          'im Rumpf'],
    // Hochladen darf jeder -- umgestellt mit 0.8.31, aus demselben Grund wie
    // beim Link: eine Datei erscheint nur dort, wo man sie hinsetzt.
    ['POST',   '/api/items/:id/attachments',     'offen'],
    ['DELETE', '/api/attachments/:id',           'im Rumpf'],
    ['PUT',    '/api/items/:id/photo-order',     'nurEintragVerfasser'],
    ['DELETE', '/api/photos/:id',                'im Rumpf'],
    // Eintragen darf jeder -- wie Kommentar, Testtag und Bewertung. Umgestellt
    // mit 0.8.30: ein Link erscheint nur dort, wo man ihn hinsetzt.
    ['POST',   '/api/items/:id/links',           'offen'],
    ['PUT',    '/api/items/:id/link-order',      'nurEintragVerfasser'],
    ['DELETE', '/api/links/:id',                 'im Rumpf'],
    ['POST',   '/api/items/:id/test-days',       'offen'],
    ['PUT',    '/api/test-days/:id',             'im Rumpf'],
    ['DELETE', '/api/test-days/:id',             'im Rumpf'],
    ['POST',   '/api/test-days/:id/tags',        'im Rumpf'],
    ['DELETE', '/api/test-days/:id/tags/:tagId', 'im Rumpf'],
    ['PUT',    '/api/items/:id/ratings',         'offen'],
    ['DELETE', '/api/items/:id/ratings',         'offen'],
    // Die einzige Bewertungsroute MIT Klemme -- hier steht eine fremde Nummer
    // in der Adresse, die beiden darueber treffen baulich nur die eigene Zeile.
    ['DELETE', '/api/ratings/:id',               'im Rumpf'],
    ['POST',   '/api/items/:id/comments',        'offen'],
    ['PUT',    '/api/comments/:id',              'im Rumpf'],
    ['POST',   '/api/comments/:id/images',       'im Rumpf'],
    ['DELETE', '/api/comment-images/:id',        'im Rumpf'],
    ['DELETE', '/api/comments/:id',              'im Rumpf'],
    ['POST',   '/api/import',                    'nurEigentuemer'],
    /* Der Papierkorb, 0.8.70. SEHEN darf ihn der Admin (lesend, deshalb steht
       GET /api/papierkorb hier nicht) -- HANDELN nur der Eigentuemer:
       Wiederherstellen legt Zeilen unter FREMDEM Namen an, genau wie der
       Import, und liegt damit in derselben Rechtezeile. Wer einen Rueckweg
       nehmen darf, darf ihn auch schliessen; deshalb dieselbe Klemme am
       endgueltigen Entfernen. */
    ['POST',   '/api/papierkorb/:id/wiederherstellen', 'nurEigentuemer'],
    ['DELETE', '/api/papierkorb/:id',            'nurEigentuemer'],
    /* Die Sicherung, 0.8.70. Beide beim Eigentuemer, dieselbe Zeile wie Export
       und Import -- alles, was die Anlage als Ganzes betrifft. Der Zielort geht
       ausdruecklich NICHT ueber PUT /api/settings: die Route leitet ihre Rechte
       aus PERSOENLICHE_SCHLUESSEL ab, und was dort nicht persoenlich ist, ist
       Adminsache. Der Sicherungsort ist es nicht. */
    ['PUT',    '/api/sicherung/ort',             'nurEigentuemer'],
    ['POST',   '/api/sicherung',                 'nurEigentuemer']
  ];

  function schreibendeRouten(text) {
    const zeilen = text.split('\n');
    const raus = [];
    for (let i = 0; i < zeilen.length; i++) {
      const z = zeilen[i];
      let methode = null, rest = '';
      for (const [anfang, m] of [["app.post('", 'POST'], ["app.put('", 'PUT'], ["app.delete('", 'DELETE']]) {
        if (z.startsWith(anfang)) { methode = m; rest = z.slice(anfang.length); }
      }
      if (!methode) continue;
      const pfad = rest.slice(0, rest.indexOf("'"));
      const kopf = rest.slice(rest.indexOf("'") + 1);
      let rumpf = '';
      for (let j = i + 1; j < zeilen.length && !zeilen[j].startsWith('app.'); j++) rumpf += zeilen[j] + '\n';
      raus.push({ schluessel: `${methode} ${pfad}`, kopf, rumpf });
    }
    return raus;
  }

  const fGefunden = schreibendeRouten(fQuelle);
  const fErwartet = new Map(F_ROUTEN.map(([m, p, art]) => [`${m} ${p}`, art]));
  const fUnbekannt = fGefunden.filter(r => !fErwartet.has(r.schluessel)).map(r => r.schluessel);
  const fVerschwunden = [...fErwartet.keys()].filter(k => !fGefunden.some(r => r.schluessel === k));
  pruefe('Der Pruefstand kennt jede schreibende Route',
    fUnbekannt.length === 0 && fVerschwunden.length === 0,
    `ohne Entscheidung: ${fUnbekannt.join(' · ') || '—'} · verschwunden: ${fVerschwunden.join(' · ') || '—'}`);
  /* Die ZAHL selbst, ausdruecklich: 0.8.50 brachte EINE neue schreibende Route
     mit, den Videoweg -- 46 wurden 47. Bleibt die Zahl stehen, hat sich am
     Rechtebild nichts verschoben; waechst sie unbemerkt, faellt genau das
     hier auf.
     0.8.60 bewegt sie NICHT: die Ansicht "Offen" ist lesend, und der Haken
     geht ueber PUT /api/comments/:id, die es laengst gibt. Wer aus dem
     lesenden Endpunkt eine schreibende Route macht, wird hier namentlich
     rot -- nachgestellt statt geglaubt.
     0.8.70 bewegt sie: 47 werden 51. Der Papierkorb bringt zwei schreibende
     Routen mit, die Sicherung zwei; die drei lesenden Endpunkte daneben
     (GET /api/papierkorb, GET /api/items/:id/export, GET /api/sicherung)
     stehen NICHT hier -- dieselbe Regel wie bei GET /api/stats. */
  pruefe('Und es sind jetzt genau 51 schreibende Routen',
    F_ROUTEN.length === 51 && fGefunden.length === 51,
    `${F_ROUTEN.length} erwartet, ${fGefunden.length} gefunden`);

  const WAECHTER_WOERTER = ['nurAdmin', 'nurEigentuemer', 'nurEintragVerfasser'];
  const fOhneWaechter = [], fOhneKlemme = [], fZuviel = [], fOhneSelbst = [], fZuvielWaechter = [];
  for (const r of fGefunden) {
    const art = fErwartet.get(r.schluessel);
    if (!art) continue;
    const hatKlemme = RUMPF_WOERTER.some(w => r.rumpf.includes(w));
    // Eine Route kann BEIDES verlangen. Ein else-if-Zweig
    // hoerte bei 'nurAdmin, im Rumpf' nach dem Waechter
    // auf und saehe die Klemme nie an -- eine Pruefung, die im
    // entscheidenden Fall gar nicht scheitern kann.
    const willWaechter = art.startsWith('nur') ? art.split(',')[0] : null;
    const willKlemme = art.includes('im Rumpf');
    if (willWaechter && !r.kopf.includes(willWaechter)) fOhneWaechter.push(r.schluessel);
    if (willKlemme && !hatKlemme) fOhneKlemme.push(r.schluessel);
    if (art === 'selbstbezug' && !r.rumpf.includes('aendereZugang(req.benutzer.id')) fOhneSelbst.push(r.schluessel);
    if (art === 'offen' && hatKlemme) fZuviel.push(r.schluessel);
    /* Und die andere Haelfte derselben Gegenrichtung: eine Route, die "offen"
       heisst, darf auch keinen benannten Waechter in der Routenzeile tragen.
       Aufgefallen bei einer Gegenprobe zu 0.8.30 -- der Rueckbau setzte
       nurEintragVerfasser vor POST /api/items/:id/links zurueck, und der
       Waechter ueber den Quelltext blieb vollstaendig gruen: er sah nur in den
       RUMPF. Acht Verhaltenspruefungen fanden es, aber die eine Pruefung, die
       eine falsche ENTSCHEIDUNG finden soll, sah nichts. */
    if (art === 'offen' && WAECHTER_WOERTER.some(w => r.kopf.includes(w)))
      fZuvielWaechter.push(r.schluessel);
  }
  pruefe('Jede Route mit benanntem Waechter traegt ihn in der Routenzeile',
    fOhneWaechter.length === 0, fOhneWaechter.join(' · '));
  pruefe('Jede Route mit zwei Rechteklassen hat die Klemme im Rumpf',
    fOhneKlemme.length === 0, fOhneKlemme.join(' · '));
  pruefe('Der Zugangswechsel nennt den angemeldeten Benutzer',
    fOhneSelbst.length === 0, fOhneSelbst.join(' · '));
  // Die Gegenrichtung: wo "offen" steht, darf auch nichts stehen. Sonst waere
  // eine stillschweigend eingebaute Klemme von einer entschiedenen nicht zu
  // unterscheiden.
  pruefe('Und wo offen steht, steht auch keine Klemme',
    fZuviel.length === 0, fZuviel.join(' · '));
  pruefe('Und erst recht kein Waechter in der Routenzeile',
    fZuvielWaechter.length === 0, fZuvielWaechter.join(' · '));

  /* WELCHE Klemme im Rumpf steht, sagt F_ROUTEN nicht -- die Liste kennt nur
     die Art 'im Rumpf'. eintragFrei( und darfAendern( stehen beide in
     RUMPF_WOERTER, und genau zwischen diesen beiden liegt die Wende von
     0.8.30: gefragt wird nicht mehr nach dem EINTRAG, sondern nach der ZEILE.
     Ohne diese Pruefung bliebe ein Rueckbau auf eintragFrei vollstaendig
     gruen -- der Prueflauf saehe eine Klemme und waere zufrieden.
     Dieselbe Bauform wie beim Kommentarbild darunter, und aus demselben
     Grund: erst das Vorhandensein des Rumpfes, dann die Eigenschaft
     (Stolperstein 81). */
  const fLinkWegRoute = fGefunden.find(r => r.schluessel === 'DELETE /api/links/:id');
  const fLinkWegRumpf = fLinkWegRoute ? fLinkWegRoute.rumpf : '';
  pruefe('Die Loeschroute fuer Links ist ueberhaupt da',
    fLinkWegRumpf.length > 0, 'die Route fehlt im Quelltext');
  pruefe('Sie fragt nach der ZEILE, nicht nach dem Eintrag',
    fLinkWegRumpf.includes('darfAendern(req, l.user_id)') &&
    !fLinkWegRumpf.includes('eintragFrei('),
    fLinkWegRumpf ? 'darfAendern(req, l.user_id) fehlt oder eintragFrei steht noch da' : '(kein Rumpf)');
  /* Und die Gegenrichtung am Eintragen: der Waechter ist dort gefallen, die
     Zeile bekommt stattdessen ihren Verfasser. Ein POST ohne user_id liefe
     stumm in eine herrenlose Zeile -- das Auffangnetz schoebe sie beim
     naechsten Start dem Eigentuemer zu, und niemand saehe es. */
  const fLinkNeuRoute = fGefunden.find(r => r.schluessel === 'POST /api/items/:id/links');
  const fLinkNeuRumpf = fLinkNeuRoute ? fLinkNeuRoute.rumpf : '';
  pruefe('Die Anlegeroute fuer Links ist ueberhaupt da',
    fLinkNeuRumpf.length > 0, 'die Route fehlt im Quelltext');
  pruefe('Sie schreibt den Verfasser in die neue Zeile',
    fLinkNeuRumpf.includes('INSERT INTO links (item_id, url, sort_order, user_id)') &&
    fLinkNeuRumpf.includes('req.benutzer.id'),
    fLinkNeuRumpf ? 'die Spalte user_id fehlt im INSERT' : '(kein Rumpf)');

  /* Dasselbe am sechsten Traeger. Die Bauform ist die von 0.8.30, und der
     Grund ist unveraendert: F_ROUTEN kennt nur die Art 'im Rumpf' und
     unterscheidet eintragFrei( nicht von darfAendern(. */
  const fAnhWegRoute = fGefunden.find(r => r.schluessel === 'DELETE /api/attachments/:id');
  const fAnhWegRumpf = fAnhWegRoute ? fAnhWegRoute.rumpf : '';
  pruefe('Die Loeschroute fuer Dateien ist ueberhaupt da',
    fAnhWegRumpf.length > 0, 'die Route fehlt im Quelltext');
  pruefe('Sie fragt nach der DATEI, nicht nach dem Eintrag',
    fAnhWegRumpf.includes('darfAendern(req, a.user_id)') &&
    !fAnhWegRumpf.includes('eintragFrei('),
    fAnhWegRumpf ? 'darfAendern(req, a.user_id) fehlt oder eintragFrei steht noch da' : '(kein Rumpf)');
  const fAnhNeuRoute = fGefunden.find(r => r.schluessel === 'POST /api/items/:id/attachments');
  const fAnhNeuRumpf = fAnhNeuRoute ? fAnhNeuRoute.rumpf : '';
  pruefe('Die Anlegeroute fuer Dateien ist ueberhaupt da',
    fAnhNeuRumpf.length > 0, 'die Route fehlt im Quelltext');
  pruefe('Sie schreibt den Verfasser in die neue Zeile',
    fAnhNeuRumpf.includes('data, sort_order, user_id') &&
    fAnhNeuRumpf.includes('req.benutzer.id'),
    fAnhNeuRumpf ? 'die Spalte user_id fehlt im INSERT' : '(kein Rumpf)');

  /* DIE BESCHRIFTUNG DES EINGRIFFSVERMERKS HAENGT AN DIESER KLEMME.
     "2 Bilder vom Admin entfernt" nennt eine ROLLE, und die steht in keiner
     Spalte: sie folgt daraus, dass DELETE /api/comment-images/:id hinter
     darfAendern steht -- Verfasser ODER Admin -- und der Vermerk nur
     hochgezaehlt wird, wenn ein ANDERER als der Verfasser entfernt. Wer beide
     Klemmen passiert, kann nur der Admin sein.
     Faellt eine der beiden Zeilen, wird der Satz auf dem Bildschirm falsch.
     Er steht in einer anderen Datei; ohne diese Pruefung faende das niemand,
     und keine Verhaltenspruefung koennte es zeigen -- denn ein Server ohne
     Klemme antwortet nicht falsch, er laesst nur den Falschen durch.
     Erst das VORHANDENSEIN des Rumpfes, dann die Eigenschaft: ein Rumpf, den
     es nicht gibt, ist ein leerer String, und jede Verneinung darauf
     waere wahr (Stolperstein 81). */
  const fBildWeg = fGefunden.find(r => r.schluessel === 'DELETE /api/comment-images/:id');
  const fBildWegRumpf = fBildWeg ? fBildWeg.rumpf : '';
  pruefe('Die Loeschroute fuer Kommentarbilder ist ueberhaupt da',
    fBildWegRumpf.length > 0, 'die Route fehlt im Quelltext');
  pruefe('Sie steht hinter darfAendern -- Verfasser oder Admin',
    fBildWegRumpf.includes('darfAendern(req, b.user_id)'),
    fBildWegRumpf ? 'die Klemme fehlt im Rumpf' : '(kein Rumpf)');
  pruefe('Und der Vermerk zaehlt nur bei einem anderen als dem Verfasser hoch',
    fBildWegRumpf.includes('b.user_id !== req.benutzer.id') &&
    fBildWegRumpf.includes('images_removed = images_removed + 1'),
    fBildWegRumpf ? 'Bedingung oder Hochzaehlen fehlt' : '(kein Rumpf)');
  /* Und genau eines von beiden: der andere Zweig setzt "bearbeitet". Ein
     zweites if statt des else liesse beides zugleich zu. */
  pruefe('Der andere Zweig setzt bearbeitet, und es ist ein else',
    /\belse\s*\n?\s*kommentarBearbeitet\.run\(b\.comment_id\)/.test(fBildWegRumpf),
    fBildWegRumpf ? 'kein else-Zweig mit kommentarBearbeitet' : '(kein Rumpf)');
  const fAppQuelle = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  pruefe('Erst deshalb darf der Bildschirm die Rolle nennen',
    fAppQuelle.includes('vom Admin entfernt') &&
    fBildWegRumpf.includes('darfAendern(req, b.user_id)') &&
    fBildWegRumpf.includes('b.user_id !== req.benutzer.id'),
    fAppQuelle.includes('vom Admin entfernt')
      ? 'die Beschriftung steht da, die Klemme nicht mehr'
      : 'die Beschriftung fehlt in public/app.js');
  // Kein Wer, kein Wann, keine Kette: es bleibt bei der Rolle.
  pruefe('Und nennt dabei keinen Namen und keinen Zeitpunkt',
    !/cmt-eingriff[^`]*verfasserName|cmt-eingriff[^`]*fmtDate/.test(fAppQuelle),
    'der Vermerk nennt Person oder Zeitpunkt');

  /* Den vorhandenen Waechter erweitern,
     die Regel nicht ein zweites Mal hinschreiben: steht die Adminfrage
     irgendwann zweimal da, laufen die beiden Stellen auseinander und keine
     Gegenprobe belegt mehr etwas. */
  const fAdminFragen = fQuelle.split("role === 'admin'").length - 1;
  pruefe('Die Adminfrage steht genau einmal im Quelltext',
    fAdminFragen === 1, `${fAdminFragen} Vorkommen`);
  const fKleinsteFragen = fQuelle.split("role === 'eigentuemer'").length - 1;
  pruefe('Und die Eigentuemerfrage ebenfalls',
    fKleinsteFragen === 1, `${fKleinsteFragen} Vorkommen`);
  // Der Eigentuemer ist keine kleinste Nummer, sondern eine
  // Rolle. Bliebe irgendwo ein MIN(id) stehen, gaebe es zwei Antworten auf
  // dieselbe Frage -- und die eine erwischte nach einer Loeschung einen
  // Grabstein. In db.js steht sie weiterhin, dort aber als eigentuemerId().
  const fMinIdImServer = fQuelle.split('MIN(id)').length - 1;
  pruefe('Und der Server fragt nirgends mehr nach der kleinsten Nummer',
    fMinIdImServer === 0, `${fMinIdImServer} Vorkommen`);
  // "Leitung" ist ein frueherer Name des Admins. Ein Wort, zwei Bedeutungen
  // -- der Waechter haelt fest, dass es in Server, Oberflaeche und Anmeldung
  // nirgends auftaucht.
  const fLeitung = ['server.js', 'auth.js', 'db.js', 'public/app.js', 'public/index.html']
    .filter(d => fs.readFileSync(path.join(__dirname, d), 'utf8').includes('Leitung'));
  pruefe('Das Wort Leitung kommt nirgends mehr vor', fLeitung.length === 0, fLeitung.join(' · '));

  /* DIE SPANNE DES GEWICHTS STEHT AN GENAU EINER STELLE. Zwei Schreibwege
     fuehren darauf -- die Verwaltung und der Import; stuende sie an beiden,
     liefen sie irgendwann auseinander. Dieselbe Bauform wie bei der
     Adminfrage darueber: den vorhandenen Waechter erweitern, die Regel nicht
     ein zweites Mal hinschreiben. */
  for (const [wort, wo] of [['GEWICHT_MIN = ', 'die Untergrenze'], ['GEWICHT_MAX = ', 'die Obergrenze']]) {
    const n = fQuelle.split(wort).length - 1;
    pruefe(`${wo[0].toUpperCase()}${wo.slice(1)} des Gewichts steht genau einmal im Quelltext`,
      n === 1, `${n} Vorkommen`);
  }
  const fGueltigDef = fQuelle.split('function gueltigesGewicht').length - 1;
  pruefe('Und es gibt genau eine Pruefung darauf', fGueltigDef === 1, `${fGueltigDef} Vorkommen`);
  /* DIE OBERFLAECHE KENNT DIE SPANNE NICHT. Stuende sie auch in app.js, waere
     sie die zweite Stelle -- und die, die es nicht meldet, wenn sie
     auseinanderlaufen. Das Feld schickt, was getippt wurde; der Server sagt,
     ob es geht. */
  pruefe('Die Oberflaeche traegt die Spanne nicht ein zweites Mal',
    !/GEWICHT_(MIN|MAX)/.test(fAppQuelle),
    (fAppQuelle.match(/.*GEWICHT_(MIN|MAX).*/) || [''])[0]);
  /* DER NENNER DARF NIE UEBER ALLE KRITERIEN GEHEN. Der naheliegende Griff --
     eine Summe ueber die ganze Tabelle -- drueckt einen Eintrag unter 1 und
     braeche damit die Zusicherung dieser Runde. Er soll gar nicht erst
     unbemerkt hereinkommen.
     ANGESEHEN WIRD NUR CODE, NICHT DER KOMMENTAR DANEBEN: an genau dieser
     Stelle in server.js steht der falsche Griff ausgeschrieben, damit ihn der
     Naechste nicht fuer einen guten haelt. Ein Waechter ueber den ganzen Text
     faerbte sich am Warnschild statt an der Sache -- derselbe Fehlgriff, an
     dem in dieser Runde schon eine Pruefung auf den DDL-Text gescheitert ist. */
  const fCodeZeilen = fQuelle.split('\n')
    .filter(z => { const t = z.trim(); return t && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*'); })
    .join('\n');
  pruefe('Nirgends wird ueber ALLE Gewichte summiert',
    !/SUM\(\s*\w*\.?gewicht\s*\)/i.test(fCodeZeilen),
    (fCodeZeilen.match(/.*SUM\(\s*\w*\.?gewicht\s*\).*/i) || [''])[0]);
  /* Und die Gegenprobe zum Waechter selbst: er darf nicht deshalb gruen sein,
     weil er gar nichts mehr ansieht. Der Code muss die Wortfolge, auf die er
     zielt, ueberhaupt tragen koennen -- hier belegt an der Abfrage, die das
     Gewicht mitbringt. */
  pruefe('Und der Waechter sieht wirklich Code an',
    /JOIN rating_criteria c ON c\.id = r\.criterion_id/.test(fCodeZeilen),
    'der Waechter liest keinen Code mehr');

  /* DER AUSGELIEFERTE TYP KOMMT NIE AUS DER DATENBANK.
     Dagegen hilft kein Merksatz, sondern ein Waechter: server.js setzt den
     Content-Type ueberhaupt nicht mehr selbst. Wer eine Auslieferung ergaenzt
     -- ein Video ab 0.8.50 --, wird hier namentlich rot und muss sich fuer
     einen der beiden Wege in anhaenge.js entscheiden: Typ nach Endung
     (setzeHeader) oder Typ nach den ersten Bytes (setzeBildHeader).
     Gezaehlt wird woertlich, ohne zusammengesetztes Muster. */
  const TYP_WOERTER = ["res.set('Content-Type'", 'res.set("Content-Type"',
                      "res.setHeader('Content-Type'", 'res.type('];
  const typZaehle = (text) => TYP_WOERTER
    .map(z => [z, text.split(z).length - 1]).filter(([, n]) => n > 0);
  const fTypSelbst = typZaehle(fQuelle);
  pruefe('server.js setzt den Content-Type an keiner Stelle selbst',
    fTypSelbst.length === 0, fTypSelbst.map(([z, n]) => `${z} (${n}x)`).join(' · '));
  /* DIE GEGENPROBE ZUM WAECHTER SELBST. Ohne sie bliebe er auch dann gruen,
     wenn er gar nichts mehr sieht -- und genau das ist der Fall, den 0.8.50
     erwartet hat: wer den Videoweg baut und dabei den Typ selbst setzt, soll
     namentlich rot werden. Vorgefuehrt an einem Text, der die Verletzung
     traegt, statt an einer zurueckgebauten Datei. */
  pruefe('Und er wuerde eine ergaenzte Auslieferung wirklich finden',
    typZaehle("app.get('/x', (req, res) => { res.set('Content-Type', 'video/mp4'); });").length === 1,
    'der Waechter sieht die Verletzung nicht');
  const fAnhQuelle = fs.readFileSync(path.join(__dirname, 'anhaenge.js'), 'utf8');
  // Erst das Vorhandensein, dann die Eigenschaft (Stolperstein 81): ohne die
  // Funktion belegte die Zeile darunter nichts.
  pruefe('Die Ableitung aus den Bytes gibt es', fAnhQuelle.includes('function typAusBytes('),
    'typAusBytes fehlt in anhaenge.js');
  const fRohRumpf = (() => {
    const a = fQuelle.indexOf("app.get('/api/photos/:id/raw'");
    if (a < 0) return '';
    const e = fQuelle.indexOf('\n});', a);
    return e < 0 ? '' : fQuelle.slice(a, e);
  })();
  pruefe('Die Fotoroute ist ueberhaupt da', fRohRumpf.length > 0, 'die Route fehlt im Quelltext');
  pruefe('Und sie ruft die Ableitung aus den Bytes auf',
    fRohRumpf.includes('anh.setzeBildHeader('),
    fRohRumpf ? 'setzeBildHeader fehlt im Rumpf' : '(kein Rumpf)');
  pruefe('Der gemeldete Typ kommt in ihrem Rumpf gar nicht mehr vor',
    !fRohRumpf.includes('mime'), fRohRumpf ? 'mime steht noch im Rumpf' : '(kein Rumpf)');

  /* DER FEHLER-HANDLER TRENNT ZWEI DINGE. Absicht behaelt ihren Rang, alles
     Uebrige wird 500 mit festem Text. Der Rumpf wird hier nur daraufhin
     angesehen, DASS beide Wege da sind -- was sie bewirken, prueft die Gruppe
     "Fehler nach Rang" am laufenden Server. */
  const fFehlerRumpf = (() => {
    const a = fQuelle.indexOf('app.use((err, req, res, next)');
    if (a < 0) return '';
    const e = fQuelle.indexOf('\n});', a);
    return e < 0 ? '' : fQuelle.slice(a, e);
  })();
  pruefe('Den Fehler-Handler gibt es', fFehlerRumpf.length > 0, 'kein Handler gefunden');
  pruefe('Er kennt die Markierung absichtlicher Fehler',
    fFehlerRumpf.includes('err.status'), fFehlerRumpf ? 'err.status fehlt' : '(kein Rumpf)');
  pruefe('Und er liefert die Meldung eines Serverfehlers nicht aus',
    /res\.status\(500\)\.json\(\{ error: '[^']+' \}\)/.test(fFehlerRumpf),
    fFehlerRumpf ? 'kein fester Text bei 500' : '(kein Rumpf)');

  /* SAUBERES HERUNTERFAHREN. Sechs Zeilen, und die Sicherung des
     Datenverzeichnisses wird verlaesslich -- geprueft wird hier, dass beide
     Zeichen behandelt werden und die WAL wirklich abgeschlossen wird. */
  pruefe('SIGTERM und SIGINT werden behandelt',
    fQuelle.includes("['SIGTERM', 'SIGINT']"), 'kein Handler fuer die Abbruchzeichen');
  pruefe('Und dabei wird die WAL abgeschlossen',
    fQuelle.includes("wal_checkpoint(TRUNCATE)") && fQuelle.includes('db.close()'),
    'kein wal_checkpoint oder kein db.close');


  /* --- 0.8.70: EINE ABBILDUNG JE EINTRAG, NICHT ZWEI ----------------------
     Bis 0.8.60 stand sie mitten in der Exportroute. Jetzt rufen sie drei
     Stellen -- der volle Export, der Einzelexport und der Papierkorb --, und
     genau deshalb steht dieser Waechter hier: zwei Rechenwege fuer dieselbe
     Datei laufen auseinander, und die Runde, die das Wiederherstellen baut,
     haette den Fehler eingebaut, den sie verhindern soll.
     Gezaehlt werden MARKEN, die es nur in der Abbildung gibt -- die
     Funktionszeile allein saehe eine kopierte Feldliste daneben nicht. */
  const ABBILD_MARKEN = ['function eintragAlsPaket(', 'favorite: pins.has(',
                         'author: verfasserName(it.user_id)'];
  const abbildZaehle = (text) => ABBILD_MARKEN.map(m => [m, text.split(m).length - 1]);
  const fAbbild = abbildZaehle(fCodeZeilen);
  pruefe('Die Abbildung je Eintrag kommt genau einmal im Quelltext vor',
    fAbbild.every(([, n]) => n === 1), fAbbild.map(([m, n]) => `${m} (${n}x)`).join(' · '));
  /* DIE GEGENPROBE ZUM WAECHTER SELBST: er darf nicht deshalb gruen sein, weil
     er gar nichts mehr ansieht (Stolperstein 106). Vorgefuehrt an einem Text,
     der die Verletzung traegt -- eine zweite, kopierte Feldliste. */
  pruefe('Und er wuerde eine zweite Abbildung wirklich finden',
    abbildZaehle(fCodeZeilen + '\nconst o = { favorite: pins.has(it.id) };')
      .some(([, n]) => n === 2),
    'der Waechter sieht die zweite Abbildung nicht');
  const fAbbildRufe = fCodeZeilen.split('eintragAlsPaket(').length - 1;
  pruefe('Sie wird an drei Stellen gerufen: Export, Einzelexport, Papierkorb',
    fAbbildRufe === 4, `${fAbbildRufe} Vorkommen samt Deklaration`);

  /* Dasselbe in der Gegenrichtung. Das Wiederherstellen geht durch den
     IMPORT -- ein zweiter, frisch geschriebener Deserialisierer waere derselbe
     Fehler, nur spiegelverkehrt. */
  const EINSPIEL_MARKEN = ['function spieleEin(', 'const itemVerfasser = verfasser(it.author)'];
  const fEinspiel = EINSPIEL_MARKEN.map(m => [m, fCodeZeilen.split(m).length - 1]);
  pruefe('Und der Deserialisierer ebenfalls genau einmal',
    fEinspiel.every(([, n]) => n === 1), fEinspiel.map(([m, n]) => `${m} (${n}x)`).join(' · '));
  const fEinspielRufe = fCodeZeilen.split('spieleEin(').length - 1;
  pruefe('Er wird an zwei Stellen gerufen: Import und Wiederherstellen',
    fEinspielRufe === 3, `${fEinspielRufe} Vorkommen samt Deklaration`);

  /* DIE FORMATNUMMER STEHT AN GENAU EINER STELLE. Zwei Umschlaege -- der volle
     Export und der Einzelexport -- gehen durch dieselbe Funktion; stuende die
     Zahl an beiden, liefen sie auseinander. */
  const fFormatDef = fCodeZeilen.split('AUSTAUSCH_FORMAT = ').length - 1;
  pruefe('Die Formatnummer steht genau einmal im Quelltext', fFormatDef === 1,
    `${fFormatDef} Vorkommen`);
  pruefe('Und nirgends noch einmal als nackte Zahl',
    !/version:\s*\d/.test(fCodeZeilen),
    (fCodeZeilen.match(/.*version:\s*\d.*/) || [''])[0]);

  /* --- 0.8.70: DER PAPIERKORB FASST KEINE BESTEHENDE ABFRAGE AN -----------
     Die tragende Regel der Runde. Kein Zustand `geloescht` an items, kein
     WHERE-Zusatz irgendwo -- ein gelöschter Eintrag ist wirklich weg und liegt
     nur zusaetzlich noch als Paket daneben. Wer das aufweicht, beruehrt jede
     Abfrage im ganzen System, und jede vergessene Stelle waere ein stiller
     Fehler.
     ANGESEHEN WIRD NUR CODE (Stolperstein 106): der Kommentar an der Tabelle
     in db.js nennt die Regel ausdruecklich und darf das auch. */
  const BESTANDSTABELLEN = ['items', 'photos', 'comments', 'ratings', 'test_days',
                            'links', 'attachments', 'comment_images', 'item_tags',
                            'test_day_tags', 'item_pins'];
  const bestandsAbfragen = (text) => text.split('\n')
    .filter(z => BESTANDSTABELLEN.some(t =>
      z.includes(`FROM ${t}`) || z.includes(`INTO ${t}`) || z.includes(`UPDATE ${t} `)));
  const verunreinigt = (zeilen) => zeilen.filter(z => /papierkorb|geloescht/i.test(z));
  const fBestandsZeilen = bestandsAbfragen(fCodeZeilen);
  // Erst das Vorhandensein, dann die Eigenschaft (Stolperstein 81): ohne
  // Zeilen bliebe jede Verneinung darauf wahr und belegte nichts.
  pruefe('Der Waechter findet die Abfragen auf den Bestand ueberhaupt',
    fBestandsZeilen.length > 30, `${fBestandsZeilen.length} Zeilen`);
  pruefe('Keine davon nennt den Papierkorb oder einen Zustand geloescht',
    verunreinigt(fBestandsZeilen).length === 0,
    verunreinigt(fBestandsZeilen).slice(0, 3).join(' · '));
  pruefe('Und er wuerde einen solchen Zusatz wirklich finden',
    verunreinigt(bestandsAbfragen(
      "  const x = db.prepare('SELECT * FROM items WHERE geloescht = 0').all();")).length === 1,
    'der Waechter sieht den Zusatz nicht');

  /* KEIN SECHSTER MIGRATIONSBLOCK. Die Probe aus der Gruppe "Der Papierkorb:
     die Tabelle legt sich selbst an" hat es hergegeben: CREATE TABLE IF NOT
     EXISTS legt eine fehlende TABELLE bei jedem Start an. Es bleibt bei fuenf
     markierten Bloecken, und es kommt kein Eintrag unter "Vorgemerkt fuer 1.0"
     dazu. Wer trotzdem einen anlegt, wird hier namentlich rot. */
  const fDbQuelle = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
  const fMigrationen = (fDbQuelle.match(/function migration0?\d+\(/g) || []);
  pruefe('Es gibt genau fuenf Migrationsfunktionen', fMigrationen.length === 5,
    fMigrationen.join(' · '));
  pruefe('Und keine davon heisst migration0870',
    !fDbQuelle.includes('migration0870'), 'migration0870 steht in db.js');
  pruefe('Der Papierkorb steht als vollstaendige DDL im Schema',
    fDbQuelle.includes('CREATE TABLE IF NOT EXISTS papierkorb (') &&
    fDbQuelle.includes('CREATE TABLE IF NOT EXISTS papierkorb_bytes ('),
    'die DDL fehlt');
  /* UND geloescht_von GEHOERT AUSDRUECKLICH NICHT INS AUFFANGNETZ. Es ist die
     Feststellung eines Vorgangs, nicht die Zugehoerigkeit von Bestand -- daran
     haengt kein Recht und kein Filter. Waere die Tabelle dort eingetragen,
     schoebe der naechste Start jeden Loeschenden still dem Eigentuemer zu und
     machte aus einer Feststellung eine Falschaussage. */
  const fNetzRumpf = (() => {
    const a = fDbQuelle.indexOf('function ordneBestandZu(');
    if (a < 0) return '';
    const e = fDbQuelle.indexOf('\n}', a);
    return e < 0 ? '' : fDbQuelle.slice(a, e);
  })();
  pruefe('Das Auffangnetz gibt es ueberhaupt', fNetzRumpf.length > 0, 'ordneBestandZu fehlt');
  pruefe('Es kennt weiterhin genau die sechs Traeger mit user_id',
    /\['items', 'comments', 'test_days', 'ratings', 'links', 'attachments'\]/.test(fNetzRumpf),
    (fNetzRumpf.match(/for \(const tabelle of .*/) || [''])[0]);
  pruefe('Und den Papierkorb ausdruecklich nicht',
    !fNetzRumpf.includes('papierkorb'), 'papierkorb steht im Auffangnetz');

  /* DIE FRIST STEHT IM SERVER, NICHT IN DER OBERFLAECHE. Die Karte und der
     Loeschdialog nennen sie beide -- gerechnet wird sie an einer Stelle, und
     die Oberflaeche bekommt sie ueber die Antwort. */
  const fFristDef = fCodeZeilen.split('PAPIERKORB_TAGE = ').length - 1;
  pruefe('Die Frist steht genau einmal im Server', fFristDef === 1, `${fFristDef} Vorkommen`);
  pruefe('Die Oberflaeche rechnet die verbleibenden Tage nicht selbst nach',
    !/tageOffen\s*=/.test(fAppQuelle),
    (fAppQuelle.match(/.*tageOffen\s*=.*/) || [''])[0]);

  /* 0.8.70: DIE SICHERUNG SCHREIBT UNTER EINEM ARBEITSNAMEN. Der Fehlerweg
     darf ausschliesslich diesen entfernen -- ein Aufraeumen, das die
     endgueltige Datei trifft, wuerfe im Zweifel die Sicherung des Nachbarn
     weg. Gelesen wird der Rumpf der Route, nicht die ganze Datei. */
  const fSicherungRumpf = (() => {
    const a = fCodeZeilen.indexOf("app.post('/api/sicherung'");
    if (a < 0) return '';
    const e = fCodeZeilen.indexOf('\n});', a);
    return e < 0 ? '' : fCodeZeilen.slice(a, e);
  })();
  pruefe('Die Route zur Sicherung ist ueberhaupt da', fSicherungRumpf.length > 0,
    'kein Rumpf gefunden');
  pruefe('Sie schreibt unter einem Arbeitsnamen und benennt erst danach um',
    /VACUUM INTO \?'\)\.run\(werdend\)/.test(fSicherungRumpf) &&
    fSicherungRumpf.includes('fs.renameSync(werdend, datei)'),
    fSicherungRumpf ? 'kein Arbeitsname im Rumpf' : '(kein Rumpf)');
  pruefe('Und entfernt im Fehlerfall NUR den Arbeitsnamen',
    fSicherungRumpf.includes('fs.unlinkSync(werdend)') &&
    !fSicherungRumpf.includes('fs.unlinkSync(datei)'),
    (fSicherungRumpf.match(/.*fs\.unlinkSync\(.*/g) || []).join(' · '));
  /* Und die Gegenprobe zum Waechter selbst: er darf nicht deshalb gruen sein,
     weil er gar nichts mehr ansieht (Stolperstein 106). */
  pruefe('Und der Waechter wuerde ein Aufraeumen an der Zieldatei finden',
    /fs\.unlinkSync\(datei\)/.test('    try { fs.unlinkSync(datei); } catch {}'),
    'der Waechter sieht die Verletzung nicht');

  /* SICHERUNG ODER BACKUP -- eines von beiden, und durchgehalten. Beide Woerter
     sind gebraeuchlich; zwei fuer dieselbe Sache sind genau das, was die
     Sprachregel aus Abschnitt 12 verhindern soll. Entschieden ist SICHERUNG:
     der Einspielweg, der Stufenplan und das Ideenpapier sagen es laengst so.
     Der Waechter sieht die ausgelieferten Dateien an -- Code UND Kommentare,
     denn das Wort steht in Meldungen und in Beschriftungen. */
  const SICHERUNG_DATEIEN = ['server.js', 'db.js', 'auth.js', 'anhaenge.js', 'keys.js',
                             'public/app.js', 'public/index.html', 'zugang.js'];
  /* GROSSGESCHRIEBEN GESUCHT, und das ist keine Nachlaessigkeit: gemeint ist
     das deutsche SUBSTANTIV. `db.backup()` ist ein Bezeichner und die Meldung
     "backup is not supported ..." ein Zitat aus SQLite -- beides ist Code und
     keine Sprache, dieselbe Trennlinie wie beim Sprachwaechter, der Backticks
     ueberspringt. */
  const backupZaehle = (text) => (text.match(/\bBackup\b/g) || []).length;
  const fBackup = SICHERUNG_DATEIEN
    .map(d => [d, backupZaehle(fs.readFileSync(path.join(__dirname, d), 'utf8'))])
    .filter(([, n]) => n > 0);
  pruefe('Das Wort Backup steht in keiner ausgelieferten Datei mehr',
    fBackup.length === 0, fBackup.map(([d, n]) => `${d} (${n}x)`).join(' · '));
  pruefe('Und der Waechter wuerde es wirklich finden',
    backupZaehle('// Das gehoert ins Backup.') === 1, 'der Waechter sieht das Wort nicht');
  pruefe('Den Bezeichner db.backup() laesst er dagegen in Ruhe',
    backupZaehle('  try { await d.backup(ziel); } catch {}') === 0,
    'der Waechter faerbt sich am Bezeichner');

  /* ---------------------------------------------------------------- */
  gruppe('Der Sprachwaechter');

  /* DEUTSCH BLEIBT DIE SPRACHE, aber Fachbegriffe werden nicht zwanghaft
     eingedeutscht. Der Massstab ist das Wort, das ein deutschsprachiger
     Entwickler im Gespraech benutzen wuerde -- Cookie statt `Keks`,
     Migration statt `Umstieg`.

     DIE LISTE IST KURZ ZU HALTEN. Ein Waechter, der jedes zweite Wort
     anmeckert, wird abgeschaltet; hier stehen deshalb nur die zwoelf
     Uebersetzungen, die 0.8.60 abgeraeumt hat, und keine Geschmacksfragen.

     ER ZIELT AUF UEBERSETZTE LEHNWOERTER, NICHT AUF DIE EIGENEN BILDER DES
     PROJEKTS. "Stolperstein", "Gegenprobe", "Pruefstand", "Waechter" und
     "Klemme" sind keine Uebersetzungen von irgendetwas Englischem -- sie
     bleiben und stehen ausdruecklich nicht in dieser Liste.

     ER IST DIE AUSNAHME VON DER REGEL AUS STOLPERSTEIN 106: jeder andere
     Waechter ueber den Quelltext filtert die Kommentarzeilen weg, dieser
     sieht sie ausdruecklich an -- die Sprache steht ja gerade dort. Umgekehrt
     laesst er CODE in Ruhe: einen Bezeichner faengt er nicht, denn er liest
     nur Kommentare -- und was in Backticks steht, ist zitierter Code und
     keine Sprache. Beides bekommt unten seine eigene Gegenprobe. */
  const SPRACHLISTE = [
    ['Keks', 'Cookie'], ['Umstieg', 'Migration'], ['Abbild', 'Image'],
    ['Sperrdatei', 'Lockfile'], ['Doppelgänger', 'Mock'], ['Doppelgaenger', 'Mock'],
    ['mehrteilig', 'Multipart'], ['Zweigname', 'Branchname'],
    ['Rückschritt', 'Downgrade'], ['Rueckschritt', 'Downgrade'],
    ['Ereignisschleife', 'Event Loop'], ['Zeichenkette', 'String'],
    ['Abdruck', 'Fingerprint']
  ];
  /* `Abbild` darf `Abbildung` NICHT treffen: eine Abbildung ist eine
     Zuordnung und hat mit einem Image nichts zu tun. Ein Waechter, der jedes
     zweite Wort anmeckert, wird abgeschaltet -- deshalb steht die Ausnahme
     hier und nicht in der Wortliste, wo sie wie ein weiteres Verbot aussaehe.
     Sie bekommt unten ihre eigene Gegenprobe. */
  const SPRACHMUSTER = new RegExp(
    '(' + SPRACHLISTE.map(([w]) => (w === 'Abbild' ? 'Abbild(?!ung)' : w)).join('|') + ')', 'i');

  /* Aus einer Quelltextdatei bleiben die KOMMENTARZEILEN uebrig, aus einer
     Doku-Datei die PROSA -- Code in Zaeunen und in Backticks faellt dort
     ebenso weg. Ein Waechter ueber die Sprache liest Sprache; ein zitierter
     Bezeichner aus einem aelteren Papier ist keine Prosa und wird nicht
     umbenannt, nur weil er zitiert wird. */
  /* Beide filtern ZEILENWEISE und lassen die Zeilenzahl unangetastet -- was
     nicht zaehlt, wird leer statt weggeworfen. Sonst naennte der Waechter
     Zeilennummern, die es in der Datei gar nicht gibt, und der Befund waere
     nicht auffindbar. */
  function nurKommentare(text) {
    let inBlock = false;
    return text.split('\n').map(z => {
      const t = z.trim();
      if (inBlock) { if (t.includes('*/')) inBlock = false; return z; }
      if (t.startsWith('/*')) { if (!t.includes('*/')) inBlock = true; return z; }
      if (t.startsWith('//')) return z;
      const p = z.indexOf('//');
      return (p >= 0 && !/['"`]/.test(z.slice(0, p))) ? z.slice(p) : '';
    }).map(z => z.replace(/`[^`]*`/g, '')).join('\n');
  }
  function nurProsa(text) {
    let inZaun = false;
    return text.split('\n').map(z => {
      if (z.trim().startsWith('```')) { inZaun = !inZaun; return ''; }
      return inZaun ? '' : z.replace(/`[^`]*`/g, '');
    }).join('\n');
  }

  function sprachTreffer(text, name) {
    const raus = [];
    text.split('\n').forEach((z, i) => {
      const t = z.match(SPRACHMUSTER);
      if (t) raus.push(`${name}:${i + 1} „${t[1]}"`);
    });
    return raus;
  }

  const SPRACH_QUELLEN = ['server.js', 'db.js', 'auth.js', 'anhaenge.js', 'keys.js',
                          'zugang.js', 'pruefung.js', 'public/app.js'];
  const sprachQuelltext = SPRACH_QUELLEN.flatMap(n => {
    const p = path.join(__dirname, n);
    return fs.existsSync(p)
      ? sprachTreffer(nurKommentare(fs.readFileSync(p, 'utf8')), n) : [];
  });
  const sprachDokuDateien = (fs.existsSync(path.join(__dirname, 'Doku'))
    ? fs.readdirSync(path.join(__dirname, 'Doku')).filter(n => n.endsWith('.md')) : [])
    // Der Auftrag der laufenden Runde bleibt aussen vor: er FUEHRT die Wortliste
    // und nennt jedes dieser Woerter als Beispiel. Ein Waechter, der ihn
    // anmeckert, meckert seine eigene Vorschrift an.
    .filter(n => !/^Auftrag_/.test(n))
    .map(n => path.join('Doku', n))
    .concat(['README.md']);
  const sprachDoku = sprachDokuDateien.flatMap(n => {
    const p = path.join(__dirname, n);
    return fs.existsSync(p) ? sprachTreffer(nurProsa(fs.readFileSync(p, 'utf8')), n) : [];
  });

  /* ERST DAS VORHANDENSEIN DES GEGENSTANDS (Stolperstein 81): ein Waechter,
     der auf null Dateien laeuft, ist grün und belegt nichts. */
  /* DIE ZAHL AUSDRUECKLICH, nicht nur "alle, die dastehen": eine gekuerzte
     Liste bliebe sonst gruen, und der Waechter saehe ohne jeden Hinweis nur
     noch die halbe Anwendung an. Genau das ist beim Bauen dieser Gruppe an
     einer Gegenprobe aufgefallen -- der Rueckbau auf eine einzige Datei blieb
     stumm. Dieselbe Ueberlegung wie bei der Zahl in F_ROUTEN. */
  pruefe('Der Sprachwaechter sieht alle acht Quelltextdateien an',
    SPRACH_QUELLEN.length === 8 &&
    SPRACH_QUELLEN.every(n => fs.existsSync(path.join(__dirname, n))),
    `${SPRACH_QUELLEN.length} Dateien, fehlend: ` +
    JSON.stringify(SPRACH_QUELLEN.filter(n => !fs.existsSync(path.join(__dirname, n)))));
  /* Und der Beleg, dass der Filter ueberhaupt etwas uebrig laesst: einer, der
     alles wegwirft, machte jede Verneinung darauf wahr (Stolperstein 81).
     Gezaehlt wird ueber alle acht zusammen -- `keys.js` traegt nur drei
     Kommentarzeilen, eine Schwelle je Datei waere dort eine Zufallszahl. */
  const sprachKommentarZeilen = SPRACH_QUELLEN.reduce((n, d) =>
    n + nurKommentare(fs.readFileSync(path.join(__dirname, d), 'utf8'))
      .split('\n').filter(z => z.trim()).length, 0);
  pruefe('Und aus ihnen bleiben mehr als tausend Kommentarzeilen uebrig',
    sprachKommentarZeilen > 1000, `${sprachKommentarZeilen} Zeilen`);
  pruefe('Und mindestens zehn Dokumente daneben',
    sprachDokuDateien.length >= 10, `${sprachDokuDateien.length} Dokumente`);
  pruefe('Die Kommentare des Quelltextes benutzen die heutigen Fachwoerter',
    sprachQuelltext.length === 0, sprachQuelltext.slice(0, 12).join(' · '));
  pruefe('Die Dokumente ebenso',
    sprachDoku.length === 0, sprachDoku.slice(0, 12).join(' · '));

  /* ACHT GEGENPROBEN AN GESTELLTEN TEXTEN, damit der Waechter nicht bei
     der guten Absicht bleibt. Sie laufen an Strings und nicht am
     Arbeitsbaum -- ein Waechter, der erst auf einem zurueckgebauten Stand
     etwas faende, waere selbst nie geprueft. */
  pruefe('Er liest ueberhaupt noch etwas: ein Kommentar mit „Keks" faellt auf',
    sprachTreffer(nurKommentare('// Der Keks traegt Secure.\nconst a = 1;'), 'x').length === 1,
    JSON.stringify(sprachTreffer(nurKommentare('// Der Keks traegt Secure.'), 'x')));
  pruefe('Und ein Fliesskommentar mit „Umstieg" ebenso',
    sprachTreffer(nurKommentare('/* Der Umstieg\n   laeuft einmal. */'), 'x').length === 1);
  /* DIE UMGEKEHRTE GEGENPROBE, und sie ist die eigentliche Ausnahme dieses
     Waechters: CODE meckert er NICHT an. Ein Bezeichner ist keine Sprache,
     und ein Waechter, der ihn faengt, faengt bei der naechsten Runde auch
     jeden String in einer Prueflage. */
  pruefe('Aber Code laesst er in Ruhe -- ein Bezeichner ist keine Sprache',
    sprachTreffer(nurKommentare("const keksWert = 'abc';\nlet Umstieg = 1;"), 'x').length === 0,
    JSON.stringify(sprachTreffer(nurKommentare("const keksWert = 'abc';"), 'x')));
  pruefe('Auch in einem Kommentar bleibt der zitierte Bezeichner unberuehrt',
    sprachTreffer(nurKommentare('// Der Wert steht in `keksWert` und heisst so.'), 'x').length === 0,
    JSON.stringify(sprachTreffer(nurKommentare('// Der Wert steht in `keksWert`.'), 'x')));
  /* Und die Ausnahme, die eine echte Falle waere: „Abbildung" ist eine
     Zuordnung, kein Image. Erst der Treffer, dann die Ausnahme -- ohne die
     erste Zeile bliebe die zweite auch dann gruen, wenn der Waechter das Wort
     gar nicht mehr kennte (Stolperstein 81). */
  pruefe('„Abbild" faengt er -- das ist das Image',
    sprachTreffer(nurKommentare('// Das Abbild wird gebaut.'), 'x').length === 1);
  pruefe('Aber „Abbildung" laesst er stehen -- das ist eine Zuordnung',
    sprachTreffer(nurKommentare('// Die Abbildung je Eintrag steht einmal.'), 'x').length === 0,
    JSON.stringify(sprachTreffer(nurKommentare('// Die Abbildung je Eintrag.'), 'x')));
  pruefe('Und in einem Dokument faengt er die Prosa, nicht den Code im Zaun',
    sprachTreffer(nurProsa('Der Keks ist da.\n```\nconst keks = 1;\n```\n'), 'x').length === 1,
    JSON.stringify(sprachTreffer(nurProsa('Der Keks ist da.\n```\nconst keks = 1;\n```\n'), 'x')));
  pruefe('Auch ein zitierter Bezeichner in Backticks bleibt unberuehrt',
    sprachTreffer(nurProsa('Er heisst `umstiegGewicht()` und nicht anders.'), 'x').length === 0,
    JSON.stringify(sprachTreffer(nurProsa('Er heisst `umstiegGewicht()`.'), 'x')));

  /* Die Liste bleibt kurz -- das ist keine Geschmacksfrage, sondern die
     Bedingung dafuer, dass der Waechter nicht abgeschaltet wird. */
  pruefe('Die Wortliste bleibt kurz',
    SPRACHLISTE.length <= 15, `${SPRACHLISTE.length} Woerter`);
  /* Und die eigenen Bilder des Projekts stehen ausdruecklich NICHT darin:
     sie sind keine Uebersetzungen und bleiben. */
  pruefe('Die eigenen Begriffe des Projekts stehen nicht auf der Liste',
    !['Stolperstein', 'Gegenprobe', 'Prüfstand', 'Wächter', 'Klemme']
      .some(w => SPRACHLISTE.some(([x]) => x === w)),
    JSON.stringify(SPRACHLISTE.map(([x]) => x)));

  /* ================================================================
     Verwaltung, Rollen, Sperren, Grabstein
     ================================================================
     Die Zugaenge entstehen hier NICHT von Hand in der
     Datenbank, sondern ueber die Verwaltung selbst -- die ist ja gerade der
     Pruefgegenstand. Nur die Einrichtung laeuft ueber die Einrichtungsseite,
     weil jeder Zugang ein echtes Passwort braucht: ohne das liesse sich weder
     die Anmeldung eines Gesperrten pruefen noch die Bremse je Name.

       anna  = Eigentuemerin (Einrichtung)
       bert  = gewoehnlicher Benutzer
       carla = Admin OHNE Eigentuemerrecht -- ohne sie waere "Admin" von
               "Eigentuemer" gar nicht zu unterscheiden, und jede Pruefung
               darauf bliebe auch dann gruen, wenn ueberall nurAdmin
               stuende.                                                    */
  gruppe('Die Rollenleiter');

  const gDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-stufeg-'));
  const G = starteWeiterenServer(gDir, {}, 5820);
  await G.bereit;

  const gRuf = async (cookieWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: {} };
    if (cookieWert) opt.headers.cookie = `kriterion_session=${cookieWert}`;
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(G.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };
  // Meldet an und gibt den Cookie zurueck. Die Anmeldung ist hier kein
  // Beiwerk -- ohne sie gaebe es keine Sitzung mit der richtigen Rolle.
  const gAnmelden = async (name, passwort, adresse) => {
    const kopf = { 'content-type': 'application/json' };
    if (adresse) kopf['x-forwarded-for'] = adresse;
    const a = await fetch(G.basis + '/api/login',
      { method: 'POST', headers: kopf, body: JSON.stringify({ user: name, password: passwort }) });
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    const setz = a.headers.get('set-cookie') || '';
    return { status: a.status, inhalt, cookie: setz ? setz.split(';')[0].split('=')[1] : null };
  };
  const gZeilen = (sql, ...werte) => {
    const d = oeffne(path.join(gDir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    const z = d.prepare(sql).all(...werte);
    d.close();
    return z;
  };
  const gSchreibe = (sql, ...werte) => {
    const d = oeffne(path.join(gDir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    d.prepare(sql).run(...werte);
    d.close();
  };
  const gRolle = (name) => gZeilen('SELECT role FROM users WHERE username = ?', name)[0]?.role;
  const gStatus = (name) => gZeilen('SELECT status FROM users WHERE username = ?', name)[0]?.status;

  await G.ruf('POST', '/api/setup', { user: 'anna', password: 'annas-langes-wort' });
  const gAnna = (await gAnmelden('anna', 'annas-langes-wort')).cookie;

  pruefe('Die Einrichtung macht den ersten Zugang zum Eigentuemer',
    gRolle('anna') === 'eigentuemer', gRolle('anna'));
  const gAnnaStell = (await gRuf(gAnna, 'GET', '/api/settings')).inhalt;
  /* Die Leiter selbst: anna traegt role='eigentuemer' und NICHT 'admin'.
     Waere istAdmin weiterhin nur "role === 'admin'", stuende hier false --
     und die Eigentuemerin kaeme an keine einzige Verwaltungskarte mehr. */
  pruefe('Der Eigentuemer ist ohne zweite Angabe auch Admin',
    gAnnaStell?.istAdmin === true && gAnnaStell?.istEigentuemer === true,
    JSON.stringify([gAnnaStell?.istAdmin, gAnnaStell?.istEigentuemer]));

  const gBertAn = await gRuf(gAnna, 'POST', '/api/users',
    { username: 'bert', passwort: 'berts-langes-wort' });
  pruefe('Der Eigentuemer legt einen Zugang an', gBertAn.status === 200, JSON.stringify(gBertAn.inhalt));
  pruefe('Ein neuer Zugang ist gewoehnlicher Benutzer', gRolle('bert') === 'user', gRolle('bert'));
  const gCarlaAn = await gRuf(gAnna, 'POST', '/api/users',
    { username: 'carla', passwort: 'carlas-langes-wort', rolle: 'admin' });
  pruefe('Und mit ausdruecklicher Rolle auch einen Admin',
    gCarlaAn.status === 200 && gRolle('carla') === 'admin', gRolle('carla'));

  const gBert = (await gAnmelden('bert', 'berts-langes-wort')).cookie;
  const gCarla = (await gAnmelden('carla', 'carlas-langes-wort')).cookie;
  const gBertStell = (await gRuf(gBert, 'GET', '/api/settings')).inhalt;
  const gCarlaStell = (await gRuf(gCarla, 'GET', '/api/settings')).inhalt;
  pruefe('Ein Benutzer ist weder Admin noch Eigentuemer',
    gBertStell?.istAdmin === false && gBertStell?.istEigentuemer === false,
    JSON.stringify([gBertStell?.istAdmin, gBertStell?.istEigentuemer]));
  pruefe('Ein Admin ist Admin, aber nicht Eigentuemer',
    gCarlaStell?.istAdmin === true && gCarlaStell?.istEigentuemer === false,
    JSON.stringify([gCarlaStell?.istAdmin, gCarlaStell?.istEigentuemer]));

  /* ---------------------------------------------------------------- */
  gruppe('Wer an einen Zugang darf');

  const gListeBert = await gRuf(gBert, 'GET', '/api/users');
  pruefe('Ein Benutzer sieht die Zugangsliste nicht', gListeBert.status === 403,
    `Status ${gListeBert.status}`);
  const gListeCarla = await gRuf(gCarla, 'GET', '/api/users');
  pruefe('Ein Admin sieht sie', gListeCarla.status === 200 &&
    gListeCarla.inhalt?.zugaenge?.length === 3, JSON.stringify(gListeCarla.inhalt?.zugaenge?.length));
  pruefe('Und erfaehrt dabei, dass er keine Rollen vergeben darf',
    gListeCarla.inhalt?.darfRollen === false, JSON.stringify(gListeCarla.inhalt?.darfRollen));
  pruefe('Der Eigentuemer erfaehrt das Gegenteil',
    (await gRuf(gAnna, 'GET', '/api/users')).inhalt?.darfRollen === true);

  const gAnlegenBert = await gRuf(gBert, 'POST', '/api/users',
    { username: 'heimlich', passwort: 'ein-langes-wort' });
  pruefe('Ein Benutzer legt keinen Zugang an', gAnlegenBert.status === 403,
    `Status ${gAnlegenBert.status}`);
  pruefe('Und die Zeile entsteht auch nicht',
    gZeilen('SELECT id FROM users WHERE username = ?', 'heimlich').length === 0);

  /* Der Admin darf anlegen -- aber keine Rolle vergeben. Ohne diese Klemme
     waere der Weg an "Rollen vergibt nur der Eigentuemer" vorbei offen, ohne
     dass irgendwo "Rolle" stuende: dieselbe Ueberlegung wie beim Import, den
     eine Exportdatei sonst unter fremdem Namen schreiben liesse. */
  const gAnlegenCarla = await gRuf(gCarla, 'POST', '/api/users',
    { username: 'dora', passwort: 'doras-langes-wort' });
  pruefe('Ein Admin legt einen Benutzer an', gAnlegenCarla.status === 200,
    JSON.stringify(gAnlegenCarla.inhalt));
  const gAdminAnlegen = await gRuf(gCarla, 'POST', '/api/users',
    { username: 'emil', passwort: 'emils-langes-wort', rolle: 'admin' });
  pruefe('Aber keinen zweiten Admin', gAdminAnlegen.status === 403,
    `Status ${gAdminAnlegen.status}`);
  pruefe('Und dieser Zugang entsteht gar nicht erst',
    gZeilen('SELECT id FROM users WHERE username = ?', 'emil').length === 0,
    JSON.stringify(gZeilen('SELECT username, role FROM users')));

  const gKurz = await gRuf(gAnna, 'POST', '/api/users', { username: 'kurz', passwort: 'zu-kurz' });
  pruefe('Ein zu kurzes Passwort wird abgewiesen',
    gKurz.status === 400 && /mindestens 10 Zeichen/.test(gKurz.inhalt?.error || ''),
    JSON.stringify(gKurz.inhalt));
  const gDoppelt = await gRuf(gAnna, 'POST', '/api/users',
    { username: 'BERT', passwort: 'noch-ein-langes-wort' });
  pruefe('Ein vergebener Name wird verstaendlich abgewiesen',
    gDoppelt.status === 400 && /gibt es bereits/.test(gDoppelt.inhalt?.error || ''),
    JSON.stringify(gDoppelt.inhalt));
  /* Das Grabsteinmuster ist gesperrt. Ohne diese Klemme koennte sich jemand
     "geloescht-2" nennen und wie die Zeile eines Entfernten aussehen -- die
     Oberflaeche schreibt genau diesen Text aus der Nummer. */
  const gTarnung = await gRuf(gAnna, 'POST', '/api/users',
    { username: 'geloescht-9', passwort: 'ein-langes-tarnwort' });
  pruefe('Ein Name im Grabsteinmuster wird abgewiesen',
    gTarnung.status === 400 && /gelöschte Zugänge/.test(gTarnung.inhalt?.error || ''),
    JSON.stringify(gTarnung.inhalt));
  const gTarnung2 = await gRuf(gBert, 'PUT', '/api/account',
    { oldPassword: 'berts-langes-wort', username: 'geloescht-9', newPassword: '' });
  pruefe('Auch beim blossen Umbenennen des eigenen Zugangs',
    gTarnung2.status === 400 && /gelöschte Zugänge/.test(gTarnung2.inhalt?.error || ''),
    JSON.stringify(gTarnung2.inhalt));

  /* Die Kernregel der Verwaltung: der Admin ist der Sheriff im Dorf, aber an
     seinesgleichen kommt er nicht. Zu JEDER Verweigerung gehoert der
     Erfolgsfall daneben UND die Nachschau in der Datenbank -- ein 403, nach
     dem die Zeile trotzdem umgeschrieben ist, waere das Schlimmste. */
  const gDoraId = gZeilen('SELECT id FROM users WHERE username = ?', 'dora')[0].id;
  const gAnnaId = gZeilen('SELECT id FROM users WHERE username = ?', 'anna')[0].id;
  const gCarlaId = gZeilen('SELECT id FROM users WHERE username = ?', 'carla')[0].id;
  const gBertId = gZeilen('SELECT id FROM users WHERE username = ?', 'bert')[0].id;

  const gSperrtBenutzer = await gRuf(gCarla, 'PUT', `/api/users/${gDoraId}`, { status: 'gesperrt' });
  pruefe('Ein Admin sperrt einen Benutzer', gSperrtBenutzer.status === 200 && gStatus('dora') === 'gesperrt',
    gStatus('dora'));
  await gRuf(gCarla, 'PUT', `/api/users/${gDoraId}`, { status: 'aktiv' });
  pruefe('Und gibt ihn wieder frei', gStatus('dora') === 'aktiv', gStatus('dora'));

  const gSperrtEigen = await gRuf(gCarla, 'PUT', `/api/users/${gAnnaId}`, { status: 'gesperrt' });
  pruefe('Ein Admin sperrt den Eigentuemer nicht', gSperrtEigen.status === 403,
    `Status ${gSperrtEigen.status}`);
  pruefe('Und der Eigentuemer steht unveraendert auf aktiv', gStatus('anna') === 'aktiv', gStatus('anna'));
  const gCarlaAdmin2 = await gRuf(gAnna, 'POST', '/api/users',
    { username: 'frida', passwort: 'fridas-langes-wort', rolle: 'admin' });
  const gFridaId = gCarlaAdmin2.inhalt?.id;
  const gSperrtAdmin = await gRuf(gCarla, 'PUT', `/api/users/${gFridaId}`, { status: 'gesperrt' });
  pruefe('Ein Admin sperrt auch keinen anderen Admin', gSperrtAdmin.status === 403,
    `Status ${gSperrtAdmin.status}`);
  pruefe('Der andere Admin steht unveraendert auf aktiv', gStatus('frida') === 'aktiv', gStatus('frida'));
  const gSperrtAdminEig = await gRuf(gAnna, 'PUT', `/api/users/${gFridaId}`, { status: 'gesperrt' });
  pruefe('Der Eigentuemer dagegen schon',
    gSperrtAdminEig.status === 200 && gStatus('frida') === 'gesperrt', gStatus('frida'));
  await gRuf(gAnna, 'PUT', `/api/users/${gFridaId}`, { status: 'aktiv' });

  const gRolleCarla = await gRuf(gCarla, 'PUT', `/api/users/${gBertId}`, { rolle: 'admin' });
  pruefe('Ein Admin vergibt keine Rolle', gRolleCarla.status === 403, `Status ${gRolleCarla.status}`);
  pruefe('Und die Rolle steht unveraendert da', gRolle('bert') === 'user', gRolle('bert'));
  const gRolleAnna = await gRuf(gAnna, 'PUT', `/api/users/${gBertId}`, { rolle: 'admin' });
  pruefe('Der Eigentuemer vergibt sie', gRolleAnna.status === 200 && gRolle('bert') === 'admin',
    gRolle('bert'));
  await gRuf(gAnna, 'PUT', `/api/users/${gBertId}`, { rolle: 'user' });

  /* Die Selbstsperre. ACHTUNG, die naheliegende Prueflage ist BLIND: laesst
     man carla (Admin) sich selbst sperren, kommt das 403 gar nicht von der
     Selbstklemme, sondern von darfAnZugang -- an einen Admin kommt nur der
     Eigentuemer, und carla ist keiner. Der Rueckbau der Selbstklemme bliebe
     stumm. Die Prueflage muss jemanden nehmen, fuer den
     darfAnZugang WAHR ist: den Eigentuemer an sich selbst. Und es braucht
     einen zweiten Eigentuemer, sonst faengt die Klemme "der letzte
     Eigentuemer bleibt" den Fall schon vorher ab.
     Beides steht deshalb weiter unten, nachdem carla Eigentuemerin ist. */
  const gSelbstSperre = await gRuf(gCarla, 'PUT', `/api/users/${gCarlaId}`, { status: 'gesperrt' });
  pruefe('Ein Admin sperrt auch sich selbst nicht', gSelbstSperre.status === 403,
    `Status ${gSelbstSperre.status}`);
  pruefe('Und bleibt aktiv', gStatus('carla') === 'aktiv', gStatus('carla'));

  /* Der letzte Eigentuemer darf nicht verschwinden -- weder durch Herabstufen
     noch durch Sperren noch durch Loeschen. Ohne diese Klemme koennte sich die
     Anlage verriegeln, und der einzige Ausweg waere zugang.js auf dem Wirt. */
  const gLetzterWeg = await gRuf(gAnna, 'PUT', `/api/users/${gAnnaId}`, { rolle: 'admin' });
  pruefe('Der letzte Eigentuemer stuft sich nicht selbst herab',
    gLetzterWeg.status === 400 && /letzte Eigentümer/.test(gLetzterWeg.inhalt?.error || ''),
    JSON.stringify(gLetzterWeg.inhalt));
  pruefe('Und bleibt Eigentuemer', gRolle('anna') === 'eigentuemer', gRolle('anna'));
  await gRuf(gAnna, 'PUT', `/api/users/${gCarlaId}`, { rolle: 'eigentuemer' });
  /* Jetzt gibt es zwei Eigentuemer -- und erst jetzt laesst sich die
     Selbstklemme belegen. anna kommt ueber darfAnZugang an ihre eigene Zeile
     (sie IST Eigentuemerin), und "der letzte Eigentuemer bleibt" greift nicht
     mehr. Ohne die Klemme spraeche hier nichts mehr dagegen, dass sie sich
     selbst aussperrt -- und danach kaeme sie nicht mehr herein. */
  const gSelbstEigen = await gRuf(gAnna, 'PUT', `/api/users/${gAnnaId}`, { status: 'gesperrt' });
  pruefe('Auch der Eigentuemer sperrt sich nicht selbst aus, wenn nichts mehr dagegen spricht',
    gSelbstEigen.status === 403, `Status ${gSelbstEigen.status}`);
  pruefe('Und steht danach unveraendert auf aktiv', gStatus('anna') === 'aktiv', gStatus('anna'));
  pruefe('Mit einem zweiten Eigentuemer geht die Herabstufung',
    (await gRuf(gAnna, 'PUT', `/api/users/${gAnnaId}`, { rolle: 'admin' })).status === 200 &&
    gRolle('anna') === 'admin', gRolle('anna'));
  // Und zurueck, damit die folgenden Gruppen auf der gewohnten Lage stehen.
  const gCarlaCookie2 = (await gAnmelden('carla', 'carlas-langes-wort')).cookie;
  await gRuf(gCarlaCookie2, 'PUT', `/api/users/${gAnnaId}`, { rolle: 'eigentuemer' });
  await gRuf(gCarlaCookie2, 'PUT', `/api/users/${gCarlaId}`, { rolle: 'admin' });
  pruefe('Danach steht die Ausgangslage wieder',
    gRolle('anna') === 'eigentuemer' && gRolle('carla') === 'admin',
    JSON.stringify(gZeilen('SELECT username, role FROM users')));

  /* ---------------------------------------------------------------- */
  gruppe('Gesperrt kommt nicht herein');

  /* ZWEI STELLEN, ZWEI EIGENE GEGENPROBEN: die Anmeldung
     weist einen gesperrten Zugang ab, und requireAuth laesst eine LAUFENDE
     Sitzung nicht weiterlaufen. Ohne die zweite bliebe ein gerade Gesperrter
     bis zum Ablauf seines Cookies drin, also bis zu dreissig Tage. */
  await gRuf(gAnna, 'PUT', `/api/users/${gDoraId}`, { status: 'gesperrt' });
  const gDoraAn = await gAnmelden('dora', 'doras-langes-wort');
  pruefe('Ein gesperrter Zugang kommt mit richtigem Passwort nicht herein',
    gDoraAn.status === 403, `Status ${gDoraAn.status}`);
  /* Er MUSS erfahren, dass er gesperrt ist --
     sonst liest sich das wie ein falsches Passwort und er probiert weiter,
     bis die Bremse zuschlaegt. */
  pruefe('Und erfaehrt den Grund', /gesperrt/.test(gDoraAn.inhalt?.error || ''),
    JSON.stringify(gDoraAn.inhalt));
  pruefe('Es entsteht dabei keine Sitzung',
    gZeilen('SELECT s.token FROM sessions s WHERE s.user_id = ?', gDoraId).length === 0,
    JSON.stringify(gZeilen('SELECT user_id FROM sessions')));
  /* Die Gegenrichtung, und sie ist der Grund fuer die Reihenfolge im Code:
     mit FALSCHEM Passwort darf dieselbe Meldung nicht kommen. Sonst waere sie
     ein Werkzeug zum Durchprobieren von Benutzernamen. */
  const gDoraFalsch = await gAnmelden('dora', 'ganz-falsches-wort');
  pruefe('Mit falschem Passwort verraet dieselbe Anmeldung die Sperre nicht',
    gDoraFalsch.status === 401 && !/gesperrt/.test(gDoraFalsch.inhalt?.error || ''),
    JSON.stringify(gDoraFalsch.inhalt));
  await gRuf(gAnna, 'PUT', `/api/users/${gDoraId}`, { status: 'aktiv' });

  /* Zweite Stelle. Die Sperre kommt hier UEBER DIE DATENBANK und nicht ueber
     die Route: setzeStatus raeumt die Sitzungen mit weg, und dann liefe diese
     Pruefung ins Leere -- sie waere gruen, auch wenn requireAuth den Status
     gar nicht ansaehe. */
  const gDora = (await gAnmelden('dora', 'doras-langes-wort')).cookie;
  pruefe('Die frische Sitzung des Freigegebenen laeuft',
    (await gRuf(gDora, 'GET', '/api/settings')).status === 200);
  gSchreibe("UPDATE users SET status = 'gesperrt' WHERE id = ?", gDoraId);
  const gLaufend = await gRuf(gDora, 'GET', '/api/settings');
  pruefe('Eine laufende Sitzung eines Gesperrten laeuft nicht weiter',
    gLaufend.status === 401, `Status ${gLaufend.status}`);
  pruefe('Und der Cookie ist dabei weggeraeumt worden',
    gZeilen('SELECT token FROM sessions WHERE token = ?', gDora).length === 0);
  gSchreibe("UPDATE users SET status = 'aktiv' WHERE id = ?", gDoraId);

  /* Und das Sperren ueber die Route raeumt sie ebenfalls weg -- das ist die
     erste der beiden Schichten und wirkt sofort. */
  const gDora2 = (await gAnmelden('dora', 'doras-langes-wort')).cookie;
  await gRuf(gAnna, 'PUT', `/api/users/${gDoraId}`, { status: 'gesperrt' });
  pruefe('Das Sperren beendet die laufende Sitzung sofort',
    gZeilen('SELECT token FROM sessions WHERE token = ?', gDora2).length === 0,
    JSON.stringify(gZeilen('SELECT user_id FROM sessions')));
  await gRuf(gAnna, 'PUT', `/api/users/${gDoraId}`, { status: 'aktiv' });

  /* Das Passwort zuruecksetzen: der Admin kennt das bisherige nicht. Alle
     Sitzungen des Betroffenen fallen -- wer ein fremdes Passwort neu setzt,
     will den bisherigen Inhaber draussen haben. */
  const gDora3 = (await gAnmelden('dora', 'doras-langes-wort')).cookie;
  const gNeuesWort = await gRuf(gCarla, 'PUT', `/api/users/${gDoraId}`, { passwort: 'doras-neues-wort' });
  pruefe('Ein Admin setzt das Passwort eines Benutzers zurueck', gNeuesWort.status === 200,
    JSON.stringify(gNeuesWort.inhalt));
  pruefe('Dabei fallen seine Sitzungen',
    gZeilen('SELECT token FROM sessions WHERE token = ?', gDora3).length === 0);
  pruefe('Und das neue Passwort gilt',
    (await gAnmelden('dora', 'doras-neues-wort')).status === 200);
  pruefe('Das alte nicht mehr',
    (await gAnmelden('dora', 'doras-langes-wort')).status === 401);

  /* ---------------------------------------------------------------- */
  gruppe('Loeschen entwertet, es loescht nicht');

  /* Der Kern des Grabsteins. Wuerde die Zeile entfernt, machte ON DELETE SET
     NULL den ganzen Bestand herrenlos und ordneBestandZu() schoebe ihn beim
     naechsten Start STILL dem Eigentuemer zu -- fremde Aussagen unter
     fremdem Namen, genau das, was verboten ist. Die Zeile bleibt stehen. */
  const gBertItem = (await gRuf(gBert, 'POST', '/api/items', { title: 'Berts Eintrag' })).inhalt;
  const gAnnaItem = (await gRuf(gAnna, 'POST', '/api/items', { title: 'Annas Eintrag' })).inhalt;
  await gRuf(gAnna, 'POST', `/api/items/${gBertItem.id}/comments`, { text: 'Annas Kommentar bei Bert' });
  await gRuf(gBert, 'POST', `/api/items/${gAnnaItem.id}/comments`, { text: 'Berts Kommentar bei Anna' });
  await gRuf(gBert, 'POST', `/api/items/${gAnnaItem.id}/test-days`, { day: '2026-05-05', rating: 4 });
  // Beide Richtungen am fuenften Traeger: ein fremder Link an SEINEM Eintrag
  // und sein Link in einem FREMDEN Eintrag.
  await gRuf(gAnna, 'POST', `/api/items/${gBertItem.id}/links`, { url: 'https://annas-link-bei-bert.test' });
  await gRuf(gBert, 'POST', `/api/items/${gAnnaItem.id}/links`, { url: 'https://berts-link-bei-anna.test' });
  // Und am sechsten Traeger, wieder in beide Richtungen. Von Hand gesetzt statt
  // hochgeladen: dieser Server hat keine eigene Upload-Hilfe, und geprueft wird
  // hier das Zaehlen und Loeschen, nicht die Route.
  gSchreibe("INSERT INTO attachments (item_id, filename, size, data, user_id) VALUES (?, 'von-anna.txt', 3, ?, ?)",
    gBertItem.id, Buffer.from('abc'), gAnnaId);
  gSchreibe("INSERT INTO attachments (item_id, filename, size, data, user_id) VALUES (?, 'von-bert.txt', 3, ?, ?)",
    gAnnaItem.id, Buffer.from('abc'), gBertId);

  const gBestand = await gRuf(gAnna, 'GET', `/api/users/${gBertId}/bestand`);
  pruefe('Der Loeschdialog bekommt die Zahlen, getrennt nach eigen und fremd',
    gBestand.inhalt?.eintraege === 1 && gBestand.inhalt?.fremdKommentare === 1 &&
    gBestand.inhalt?.kommentare === 1 && gBestand.inhalt?.testtage === 1,
    JSON.stringify(gBestand.inhalt));
  /* Der fuenfte Traeger, in beiden Richtungen. Ohne ihn saehe ein Zugang, der
     zwanzig Links in fremden Eintraegen hinterlassen hat, im Dialog leer aus. */
  pruefe('Und die Links in beiden Richtungen',
    gBestand.inhalt?.fremdLinks === 1 && gBestand.inhalt?.links === 1,
    JSON.stringify(gBestand.inhalt));
  pruefe('Und die Dateien ebenso',
    gBestand.inhalt?.fremdDateien === 1 && gBestand.inhalt?.dateien === 1,
    JSON.stringify(gBestand.inhalt));

  const gWeg = await gRuf(gAnna, 'DELETE', `/api/users/${gBertId}`);
  pruefe('Der Eigentuemer entfernt einen Zugang', gWeg.status === 200, JSON.stringify(gWeg.inhalt));
  const gGrab = gZeilen('SELECT id, username, role, status, password_hash FROM users WHERE id = ?', gBertId)[0];
  pruefe('Die Zeile bleibt mit ihrer Nummer stehen', !!gGrab, JSON.stringify(gGrab));
  pruefe('Sie traegt den Grabsteinnamen aus der Nummer',
    gGrab?.username === `geloescht-${gBertId}`, gGrab?.username);
  pruefe('Sie steht auf geloescht und hat kein Passwort mehr',
    gGrab?.status === 'geloescht' && gGrab?.password_hash === '',
    JSON.stringify([gGrab?.status, gGrab?.password_hash]));
  pruefe('Und keine Rechte mehr', gGrab?.role === 'user', gGrab?.role);
  /* Das eigentliche Versprechen: die Beitraege bleiben sichtbar UND behalten
     ihren Verfasser. Waere die Zeile entfernt worden, stuende hier ueberall
     NULL -- und beim naechsten Start anna. */
  pruefe('Seine Eintraege stehen noch und gehoeren weiterhin ihm',
    gZeilen('SELECT user_id FROM items WHERE id = ?', gBertItem.id)[0]?.user_id === gBertId,
    JSON.stringify(gZeilen('SELECT id, title, user_id FROM items')));
  pruefe('Seine Kommentare in fremden Eintraegen ebenso',
    gZeilen('SELECT COUNT(*) n FROM comments WHERE user_id = ?', gBertId)[0]?.n === 1,
    JSON.stringify(gZeilen('SELECT id, text, user_id FROM comments')));
  pruefe('Seine Links in fremden Eintraegen ebenfalls',
    gZeilen('SELECT COUNT(*) n FROM links WHERE user_id = ?', gBertId)[0]?.n === 1,
    JSON.stringify(gZeilen('SELECT id, url, user_id FROM links')));
  pruefe('Und seine Dateien desgleichen',
    gZeilen('SELECT COUNT(*) n FROM attachments WHERE user_id = ?', gBertId)[0]?.n === 1,
    JSON.stringify(gZeilen('SELECT id, filename, user_id FROM attachments')));
  pruefe('Nichts ist dabei herrenlos geworden',
    gZeilen('SELECT COUNT(*) n FROM items WHERE user_id IS NULL')[0]?.n === 0 &&
    gZeilen('SELECT COUNT(*) n FROM comments WHERE user_id IS NULL')[0]?.n === 0 &&
    gZeilen('SELECT COUNT(*) n FROM test_days WHERE user_id IS NULL')[0]?.n === 0 &&
    gZeilen('SELECT COUNT(*) n FROM links WHERE user_id IS NULL')[0]?.n === 0 &&
    gZeilen('SELECT COUNT(*) n FROM attachments WHERE user_id IS NULL')[0]?.n === 0);
  /* Und wie der stehengebliebene Beitrag jetzt auf den Bildschirm kommt: die
     Antwort nennt die NUMMER und sagt "geloescht", die Oberflaeche macht
     daraus "Geloeschter Benutzer <nr>". Der freigegebene Grabsteinname geht
     dabei ausdruecklich NICHT hinaus -- er kann laengst einem anderen
     Menschen gehoeren, und eine Antwort, die ihn mitschickt, laedt dazu ein,
     ihn irgendwann anzuzeigen. */
  const gNachGrab = (await gRuf(gAnna, 'GET', `/api/items/${gAnnaItem.id}`)).inhalt;
  const gKomVomGrab = (gNachGrab?.comments || []).find(c => c.text === 'Berts Kommentar bei Anna');
  pruefe('Der Beitrag eines Grabsteins nennt ihn als geloescht, mit seiner Nummer',
    gKomVomGrab?.verfasser?.geloescht === true && gKomVomGrab?.verfasser?.id === gBertId,
    JSON.stringify(gKomVomGrab?.verfasser));
  pruefe('Der freigegebene Name steht dabei nirgends in der Antwort',
    !JSON.stringify(gNachGrab).includes(`geloescht-${gBertId}`),
    JSON.stringify(gKomVomGrab?.verfasser));
  pruefe('Der Testtag desselben Grabsteins ebenso',
    (gNachGrab?.testDays || []).every(d => d.verfasser?.geloescht === true),
    JSON.stringify((gNachGrab?.testDays || []).map(d => d.verfasser)));

  pruefe('Anmelden kann sich der Grabstein nicht mehr',
    (await gAnmelden('bert', 'berts-langes-wort')).status === 401);
  // Der Name ist frei. Das ist der Preis dafuer, dass er nirgends aufbewahrt
  // wird -- und zugleich der Gewinn.
  const gNeuBert = await gRuf(gAnna, 'POST', '/api/users',
    { username: 'bert', passwort: 'zweiter-bert-lang' });
  pruefe('Der Name ist danach wieder frei', gNeuBert.status === 200, JSON.stringify(gNeuBert.inhalt));
  pruefe('Und der neue bert ist eine andere Nummer',
    gNeuBert.inhalt?.id !== gBertId, `${gNeuBert.inhalt?.id} gegen ${gBertId}`);
  // Ein Grabstein ist kein zweiter Bewerter -- die Durchschnittsspalte haengt
  // an dieser Zahl.
  const gZahl = (await gRuf(gAnna, 'GET', '/api/settings')).inhalt?.benutzerZahl;
  pruefe('Die Benutzerzahl zaehlt den Grabstein nicht mit',
    gZahl === gZeilen("SELECT COUNT(*) n FROM users WHERE status != 'geloescht'")[0].n, `${gZahl}`);
  const gNochmal = await gRuf(gAnna, 'DELETE', `/api/users/${gBertId}`);
  pruefe('Ein Grabstein laesst sich nicht noch einmal entfernen',
    gNochmal.status === 400, `Status ${gNochmal.status}`);

  /* Die beiden Haekchen. Sie tun sehr Verschiedenes, und deshalb sind es zwei:
     das erste nimmt ueber die Kaskade FREMDE Beitraege mit, das zweite nur
     eigene in fremden Eintraegen. */
  const gEmil = await gRuf(gAnna, 'POST', '/api/users',
    { username: 'emil', passwort: 'emils-langes-wort' });
  const gEmilId = gEmil.inhalt.id;
  const gEmilCookie = (await gAnmelden('emil', 'emils-langes-wort')).cookie;
  const gEmilItem = (await gRuf(gEmilCookie, 'POST', '/api/items', { title: 'Emils Eintrag' })).inhalt;
  await gRuf(gAnna, 'POST', `/api/items/${gEmilItem.id}/comments`, { text: 'Annas Kommentar bei Emil' });
  await gRuf(gEmilCookie, 'POST', `/api/items/${gAnnaItem.id}/comments`, { text: 'Emils Kommentar bei Anna' });
  await gRuf(gAnna, 'POST', `/api/items/${gEmilItem.id}/links`, { url: 'https://annas-link-bei-emil.test' });
  await gRuf(gEmilCookie, 'POST', `/api/items/${gAnnaItem.id}/links`, { url: 'https://emils-link-bei-anna.test' });
  gSchreibe("INSERT INTO attachments (item_id, filename, size, data, user_id) VALUES (?, 'annas-datei-bei-emil.txt', 3, ?, ?)",
    gEmilItem.id, Buffer.from('abc'), gAnnaId);
  gSchreibe("INSERT INTO attachments (item_id, filename, size, data, user_id) VALUES (?, 'emils-datei-bei-anna.txt', 3, ?, ?)",
    gAnnaItem.id, Buffer.from('abc'), gEmilId);
  const gEmilBestand = (await gRuf(gAnna, 'GET', `/api/users/${gEmilId}/bestand`)).inhalt;
  pruefe('Die Zahlen nennen den fremden Kommentar an seinem Eintrag',
    gEmilBestand?.eintraege === 1 && gEmilBestand?.fremdKommentare === 1 &&
    gEmilBestand?.kommentare === 1, JSON.stringify(gEmilBestand));
  pruefe('Und den fremden Link daran ebenso',
    gEmilBestand?.fremdLinks === 1 && gEmilBestand?.links === 1,
    JSON.stringify(gEmilBestand));
  const gAnnaKommentarVorher = gZeilen('SELECT COUNT(*) n FROM comments WHERE item_id = ?',
    gAnnaItem.id)[0].n;
  const gAnnaLinksVorher = gZeilen('SELECT COUNT(*) n FROM links WHERE item_id = ?',
    gAnnaItem.id)[0].n;
  const gAnnaDateienVorher = gZeilen('SELECT COUNT(*) n FROM attachments WHERE item_id = ?',
    gAnnaItem.id)[0].n;
  await gRuf(gAnna, 'DELETE', `/api/users/${gEmilId}?eintraege=1&beitraege=1`);
  pruefe('Mit dem ersten Haekchen sind seine Eintraege weg',
    gZeilen('SELECT id FROM items WHERE id = ?', gEmilItem.id).length === 0);
  pruefe('Und der fremde Kommentar daran ueber die Kaskade mit',
    gZeilen('SELECT COUNT(*) n FROM comments WHERE item_id = ?', gEmilItem.id)[0].n === 0);
  pruefe('Mit dem zweiten sein Kommentar im fremden Eintrag',
    gZeilen('SELECT COUNT(*) n FROM comments WHERE item_id = ?', gAnnaItem.id)[0].n
      === gAnnaKommentarVorher - 1,
    `${gZeilen('SELECT COUNT(*) n FROM comments WHERE item_id = ?', gAnnaItem.id)[0].n} von ${gAnnaKommentarVorher}`);
  /* Und sein Link ebenso. Eine Zahl im Dialog, die nichts bewirkt, waere
     schlimmer als keine: der Haken sagt "mitloeschen". */
  pruefe('Und sein Link im fremden Eintrag desgleichen',
    gZeilen('SELECT COUNT(*) n FROM links WHERE item_id = ?', gAnnaItem.id)[0].n
      === gAnnaLinksVorher - 1,
    `${gZeilen('SELECT COUNT(*) n FROM links WHERE item_id = ?', gAnnaItem.id)[0].n} von ${gAnnaLinksVorher}`);
  pruefe('Der fremde Link an seinem Eintrag ging ueber die Kaskade mit',
    gZeilen('SELECT COUNT(*) n FROM links WHERE item_id = ?', gEmilItem.id)[0].n === 0);
  pruefe('Und seine Datei im fremden Eintrag ebenso',
    gZeilen('SELECT COUNT(*) n FROM attachments WHERE item_id = ?', gAnnaItem.id)[0].n
      === gAnnaDateienVorher - 1,
    `${gZeilen('SELECT COUNT(*) n FROM attachments WHERE item_id = ?', gAnnaItem.id)[0].n} von ${gAnnaDateienVorher}`);
  pruefe('Die fremde Datei an seinem Eintrag ging ueber die Kaskade mit',
    gZeilen('SELECT COUNT(*) n FROM attachments WHERE item_id = ?', gEmilItem.id)[0].n === 0);
  pruefe('Der fremde Eintrag selbst bleibt stehen',
    gZeilen('SELECT id FROM items WHERE id = ?', gAnnaItem.id).length === 1);
  pruefe('Und auch hier bleibt die Zeile als Grabstein stehen',
    gZeilen('SELECT username, status FROM users WHERE id = ?', gEmilId)[0]?.status === 'geloescht',
    JSON.stringify(gZeilen('SELECT username, status FROM users WHERE id = ?', gEmilId)));

  /* ---------------------------------------------------------------- */
  gruppe('Herrenloser Bestand faellt nicht an einen Grabstein');

  /* ordneBestandZu() muss die ROLLE lesen, nicht die kleinste Nummer:
     die kleinste Nummer kann ein Grabstein sein -- ein Zugang, der sich nie
     wieder anmeldet. Der Bestand waere danach aus der Anwendung heraus nicht
     mehr erreichbar, und niemand saehe es.
     Die herrenlose Zeile entsteht hier VOR dem Lauf und wird von ihm geholt;
     das ist genau der Vorgang, um den es geht. */
  const hDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-erbe-'));
  kurzlauf(`require('./db'); console.log('da');`, hDir);
  {
    const d = oeffne(path.join(hDir, 'katalog.sqlite'));
    // Nummer 1 ist ein Grabstein, Nummer 2 der Eigentuemer.
    d.prepare("INSERT INTO users (username, password_hash, role, status) " +
              "VALUES ('geloescht-1', '', 'user', 'geloescht')").run();
    d.prepare("INSERT INTO users (username, password_hash, role) " +
              "VALUES ('nachfolger', 'x', 'eigentuemer')").run();
    d.prepare("INSERT INTO items (title) VALUES ('Herrenlos')").run();
    d.close();
  }
  kurzlauf(`require('./db'); console.log('da');`, hDir);
  {
    const d = oeffne(path.join(hDir, 'katalog.sqlite'));
    const hBesitzer = d.prepare('SELECT user_id FROM items WHERE title = ?').get('Herrenlos')?.user_id;
    const hNachfolger = d.prepare("SELECT id FROM users WHERE username = 'nachfolger'").get().id;
    const hGrab = d.prepare("SELECT id FROM users WHERE username = 'geloescht-1'").get().id;
    pruefe('Herrenloser Bestand faellt an den Eigentuemer',
      hBesitzer === hNachfolger, `user_id ${hBesitzer}, Eigentuemer ${hNachfolger}`);
    pruefe('Und ausdruecklich nicht an den Grabstein mit der kleinsten Nummer',
      hBesitzer !== hGrab, `user_id ${hBesitzer}, Grabstein ${hGrab}`);
    // Und die Startregel befoerdert den Grabstein auch nicht nachtraeglich.
    pruefe('Ein Grabstein wird nicht zum Eigentuemer befoerdert',
      d.prepare('SELECT role FROM users WHERE id = ?').get(hGrab)?.role === 'user',
      JSON.stringify(d.prepare('SELECT id, username, role FROM users').all()));
    d.close();
  }
  fs.rmSync(hDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Ohne Proxy ist der Kopf nur eine Behauptung');

  /* EIN KOPF VOM AUFRUFER IST NIE EINE FESTSTELLUNG. Ohne die Einstellung
     wird X-Forwarded-For gar nicht erst angesehen -- und genau das wird hier
     belegt: zwoelf Fehlversuche, bei jedem ein anderer Kopf. Frueher bekam
     der Aufrufer damit bei jedem Versuch einen frischen Zaehler und wurde nie
     gebremst. Jetzt zaehlt die tatsaechliche Verbindung, und die ist bei allen
     zwoelf dieselbe.
     DIESE GRUPPE STEHT ZULETZT AUF DIESEM SERVER: sie sperrt die Adresse
     absichtlich hart, und danach kaeme hier niemand mehr herein. */
  let gGesperrtAb = 0;
  for (let i = 1; i <= 12; i++) {
    const a = await gAnmelden('anna', 'ganz-sicher-falsch', `10.0.7.${i}`);
    if (a.status === 429 && !gGesperrtAb) gGesperrtAb = i;
  }
  pruefe('Ein wechselnder Kopf haelt die Bremse nicht mehr auf',
    gGesperrtAb > 0 && gGesperrtAb <= 11, `gesperrt ab Versuch ${gGesperrtAb || '(nie)'}`);
  pruefe('Und auch das richtige Passwort kommt waehrend der Sperre nicht durch',
    (await gAnmelden('anna', 'annas-langes-wort', '10.0.7.99')).status === 429);
  // Der Cookie der Anlage ohne Proxy: kein Secure, kein Praefix. Beides waere
  // hier falsch -- der Browser verwuerfe den Cookie ueber http.
  const gCookieKopf = await (async () => {
    const a = await fetch(G.basis + '/api/login', { method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user: 'anna', password: 'annas-langes-wort' }) });
    return a.headers.get('set-cookie') || '';
  })();
  pruefe('Ohne Proxy traegt der Cookie kein Secure',
    gCookieKopf === '' || !/;\s*Secure/i.test(gCookieKopf), gCookieKopf);
  pruefe('Und er heisst weiterhin kriterion_session',
    gCookieKopf === '' || gCookieKopf.startsWith('kriterion_session='), gCookieKopf.split(';')[0]);

  await G.stopp();

  /* ---------------------------------------------------------------- */
  gruppe('Hinter dem Proxy wird der Kopf gelesen');

  /* DIESELBE ANLAGE, EINE EINSTELLUNG ANDERS. Derselbe Bestand, derselbe
     Zugang -- nur HINTER_PROXY=1. Eine Pruefung, die nur die Vorgabe ansieht,
     belegt die Einstellung nicht; deshalb beide Lagen.
     Der Prozess ist neu, die Zaehler der vorigen Gruppe sind damit weg -- sie
     stehen im Arbeitsspeicher und nicht in der Datenbank. */
  const P = starteWeiterenServer(gDir, { HINTER_PROXY: '1' }, 5700);
  await P.bereit;
  const pAnmelden = async (name, passwort, adresse) => {
    const kopf = { 'content-type': 'application/json' };
    if (adresse) kopf['x-forwarded-for'] = adresse;
    const t0 = Date.now();
    const a = await fetch(P.basis + '/api/login',
      { method: 'POST', headers: kopf, body: JSON.stringify({ user: name, password: passwort }) });
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt, ms: Date.now() - t0,
             setzCookie: a.headers.get('set-cookie') || '' };
  };

  const pGut = await pAnmelden('anna', 'annas-langes-wort', '10.1.0.1');
  pruefe('Die Anmeldung gelingt auch hinter dem Proxy', pGut.status === 200,
    `${pGut.status}: ${JSON.stringify(pGut.inhalt)}`);
  pruefe('Der Cookie traegt hinter dem Proxy Secure', /;\s*Secure/i.test(pGut.setzCookie), pGut.setzCookie);
  // Das Praefix __Host- ist eine Zusage an den Browser: nur ueber HTTPS, ohne
  // Domain, mit Path=/. Es verlangt den Namen woertlich.
  pruefe('Und er heisst __Host-kriterion_session',
    pGut.setzCookie.startsWith('__Host-kriterion_session='), pGut.setzCookie.split(';')[0]);
  pruefe('Path=/ und HttpOnly stehen weiterhin dabei',
    /;\s*Path=\//.test(pGut.setzCookie) && /;\s*HttpOnly/i.test(pGut.setzCookie), pGut.setzCookie);
  pruefe('Ohne Domain -- sonst waere das Praefix ungueltig',
    !/;\s*Domain=/i.test(pGut.setzCookie), pGut.setzCookie);
  // Der Cookie mit dem neuen Namen wird auch wirklich gelesen: sonst waere die
  // Umbenennung eine Anlage, in die niemand mehr hineinkaeme.
  const pCookieWert = pGut.setzCookie.split(';')[0];
  const pSitzung = await fetch(P.basis + '/api/settings', { headers: { cookie: pCookieWert } });
  pruefe('Mit diesem Cookie laesst sich weiterarbeiten', pSitzung.status === 200, `${pSitzung.status}`);
  // Und der alte Name gilt nicht mehr -- die einmalige Abmeldung beim
  // Umlegen der Einstellung ist damit belegt und keine Vermutung.
  const pAlterName = await fetch(P.basis + '/api/settings',
    { headers: { cookie: 'kriterion_session=' + pCookieWert.split('=')[1] } });
  pruefe('Der alte Cookiename gilt nicht mehr', pAlterName.status === 401, `${pAlterName.status}`);
  pruefe('Hinter dem Proxy steht Strict-Transport-Security',
    /max-age=\d+/.test((await fetch(P.basis + '/api/config')).headers.get('strict-transport-security') || ''),
    (await fetch(P.basis + '/api/config')).headers.get('strict-transport-security'));

  /* ---------------------------------------------------------------- */
  gruppe('Die Anmeldebremse zaehlt auch den Namen');

  /* Die IP-Bremse sieht verteiltes Raten gegen EINEN Namen nicht: zehn
     Rechner mit je neun Versuchen bleiben unter jeder Schwelle. Deshalb
     zaehlt auch der Name mit.
     DER NAME WIRD NUR VERZOEGERT, NIE GESPERRT -- eine harte Namenssperre
     waere ein Werkzeug gegen fremde Zugaenge.
     Jeder Versuch kommt hier von einer EIGENEN Adresse: sonst zaehlte die
     IP-Bremse mit und es liesse sich nicht unterscheiden, welche der beiden
     gebremst hat. DASS verschiedene Adressen ueberhaupt ankommen, ist die
     Einstellung dieses Servers -- ohne sie waeren alle zwoelf Versuche
     dieselbe Adresse, und die Gruppe pruefte die IP-Bremse statt der
     Namensbremse. */
  const gVersuch = async (name, adresse) => {
    const a = await pAnmelden(name, 'ganz-sicher-falsch', adresse);
    return { ms: a.ms, status: a.status };
  };
  let gNamensSperre = 0;
  for (let i = 1; i <= 6; i++) {
    const a = await gVersuch('anna', `10.0.0.${i}`);
    if (a.status === 429 && !gNamensSperre) gNamensSperre = i;
  }
  // Frische Adresse, bekannter Name: die IP hat null Fehlversuche, gebremst
  // wird trotzdem. Ohne den Namenszaehler kaeme die Antwort sofort.
  const gFremdeAdresse = await gVersuch('anna', '10.0.9.1');
  pruefe('Ein oft geratener Name wird auch von einer frischen Adresse gebremst',
    gFremdeAdresse.ms >= 700, `${gFremdeAdresse.ms} ms`);
  // Dieselbe frische Adresse, anderer Name: keine Bremse. Sonst waere es doch
  // die IP gewesen, und die Pruefung darueber belegte nichts.
  const gAndererName = await gVersuch('zzz-gibt-es-nicht', '10.0.9.1');
  pruefe('Ein anderer Name von derselben Adresse dagegen nicht',
    gAndererName.ms < 700, `${gAndererName.ms} ms`);
  for (let i = 7; i <= 12; i++) {
    const a = await gVersuch('anna', `10.0.0.${i}`);
    if (a.status === 429 && !gNamensSperre) gNamensSperre = i;
  }
  pruefe('Und der Name wird auch nach zwoelf Fehlversuchen nie hart gesperrt',
    gNamensSperre === 0, `gesperrt ab Versuch ${gNamensSperre}`);
  // Die richtige Anmeldung kommt trotzdem durch -- nur eben verzoegert. Das
  // ist der ganze Unterschied zur harten Sperre der IP.
  const gTrotzdem = await pAnmelden('anna', 'annas-langes-wort', '10.0.9.2');
  pruefe('Das richtige Passwort kommt trotz Bremse durch', gTrotzdem.status === 200,
    `Status ${gTrotzdem.status}`);
  pruefe('Und der Zaehler des Namens ist danach zurueckgesetzt',
    (await gVersuch('anna', '10.0.9.3')).ms < 700);

  /* ---------------------------------------------------------------- */
  gruppe('Welcher Eintrag der Kette zaehlt');

  /* DER LETZTE, NICHT DER ERSTE. Ein Proxy haengt die Gegenstelle, die er
     wirklich sieht, hinten an; alles davor kann der Aufrufer selbst
     hineingeschrieben haben.
     Zehn Versuche mit festem LETZTEN und wechselndem ersten Eintrag muessen
     also sperren -- und danach kommt eine Kette mit demselben Wert VORNE und
     wechselndem Ende ungebremst durch. Waere es umgekehrt gebaut, waere genau
     eine der beiden Pruefungen rot. */
  // Jeder Versuch mit EIGENEM Namen: sonst zaehlte die Namensbremse mit, und
  // die Gruppe belegte nicht, welcher Eintrag der Kette gemeint ist.
  for (let i = 1; i <= 11; i++)
    await gVersuch(`kette-${i}`, `172.16.0.${i}, 203.0.113.7`);
  const kLetzter = await gVersuch('kette-x', '172.16.9.9, 203.0.113.7');
  pruefe('Der letzte Eintrag der Kette wird gezaehlt und gesperrt',
    kLetzter.status === 429, `Status ${kLetzter.status}`);
  const kErster = await gVersuch('kette-y', '203.0.113.7, 198.51.100.5');
  pruefe('Der erste Eintrag zaehlt ausdruecklich nicht',
    kErster.status === 401, `Status ${kErster.status}`);

  await P.stopp();
  fs.rmSync(gDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('AUTH_RESET und zugang.js');

  /* AUTH_RESET ist wirkungslos; an seiner Stelle steht ein Befehl
     auf dem Wirt, wie ihn Nextcloud, GitLab und Grafana halten. Die Vorgaenge
     stehen in auth.js und werden von der Verwaltungskarte genauso gerufen --
     zwei Wege zum selben Grabstein liefen auseinander. Geprueft wird hier
     die BEDIENUNG: Eingabe, Rueckfrage, Rueckgabewert. */
  const zDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-zugang-'));
  function zBefehl(args, eingabe = '') {
    const { execFileSync } = require('child_process');
    const umgebung = { ...process.env, DATA_DIR: zDir, ENCRYPTION_KEY: KEY };
    delete umgebung.AUTH_RESET;
    try {
      return { code: 0, aus: execFileSync(process.execPath, ['zugang.js', ...args],
        { cwd: __dirname, encoding: 'utf8', input: eingabe, env: umgebung }) };
    } catch (e) {
      return { code: e.status == null ? 1 : e.status, aus: (e.stdout || '') + (e.stderr || '') };
    }
  }
  const zZeilen = (sql, ...werte) => {
    const d = oeffne(path.join(zDir, 'katalog.sqlite'));
    const z = d.prepare(sql).all(...werte);
    d.close();
    return z;
  };

  const Z = starteWeiterenServer(zDir, {}, 5900);
  await Z.bereit;
  await Z.ruf('POST', '/api/setup', { user: 'anna', password: 'annas-langes-wort' });
  await Z.ruf('POST', '/api/users', { username: 'bert', passwort: 'berts-langes-wort' });
  await Z.ruf('POST', '/api/items', { title: 'Ein Eintrag' });
  await Z.stopp();

  const zListe = zBefehl(['liste']);
  pruefe('zugang.js liste nennt die Zugaenge samt Rolle',
    /anna/.test(zListe.aus) && /Eigentümer/.test(zListe.aus) && /bert/.test(zListe.aus),
    zListe.aus.split('\n').filter(Boolean).slice(-4).join(' | '));

  const zPass = zBefehl(['passwort', 'bert'], 'berts-neues-wort\nberts-neues-wort\n');
  pruefe('zugang.js passwort setzt das Passwort', /gesetzt/.test(zPass.aus) && zPass.code === 0,
    zPass.aus.split('\n').filter(Boolean).pop());
  const Z2 = starteWeiterenServer(zDir, {}, 5900);
  await Z2.bereit;
  const zAlt = await Z2.ruf('POST', '/api/login', { user: 'bert', password: 'berts-langes-wort' });
  const zNeu = await Z2.ruf('POST', '/api/login', { user: 'bert', password: 'berts-neues-wort' });
  pruefe('Danach gilt das neue Passwort und das alte nicht mehr',
    zNeu.status === 200 && zAlt.status === 401, `neu ${zNeu.status}, alt ${zAlt.status}`);
  await Z2.stopp();

  // Zwei verschiedene Eingaben: der Befehl darf dann NICHTS setzen. Ohne die
  // zweite Abfrage waere ein Tippfehler erst beim naechsten Anmeldeversuch zu
  // bemerken -- und dann waere der Zugang zu.
  const zTipp = zBefehl(['passwort', 'bert'], 'wort-eins-lang\nwort-zwei-lang\n');
  pruefe('Zwei verschiedene Eingaben aendern nichts',
    zTipp.code === 1 && /nicht überein/.test(zTipp.aus), zTipp.aus.split('\n').filter(Boolean).pop());

  const zNein = zBefehl(['entfernen', 'bert'], 'nein\n');
  pruefe('Die Sicherheitsabfrage nennt die Zahlen vor der Entscheidung',
    /Eigene Einträge: 0/.test(zNein.aus), zNein.aus.split('\n').filter(Boolean).slice(1, 3).join(' | '));
  pruefe('Ein "nein" aendert nichts',
    /Abgebrochen/.test(zNein.aus) &&
    zZeilen('SELECT status FROM users WHERE username = ?', 'bert')[0]?.status === 'aktiv',
    JSON.stringify(zZeilen('SELECT username, status FROM users')));

  const zJa = zBefehl(['entfernen', 'bert'], 'ja\n');
  const zBertId = zZeilen("SELECT id FROM users WHERE status = 'geloescht'")[0]?.id;
  pruefe('Ein "ja" macht den Grabstein',
    zJa.code === 0 && zBertId != null &&
    zZeilen('SELECT username FROM users WHERE id = ?', zBertId)[0]?.username === `geloescht-${zBertId}`,
    JSON.stringify(zZeilen('SELECT id, username, status FROM users')));
  pruefe('Der Eintrag der Anlage bleibt dabei unangetastet',
    zZeilen('SELECT COUNT(*) n FROM items')[0].n === 1);

  const zEig = zBefehl(['eigentuemer', 'anna']);
  pruefe('zugang.js eigentuemer laeuft auch, wenn es schon stimmt',
    zEig.code === 0 && zZeilen('SELECT role FROM users WHERE username = ?', 'anna')[0]?.role === 'eigentuemer');
  const zNichts = zBefehl(['passwort', 'gibtesnicht']);
  pruefe('Ein unbekannter Name endet mit Fehlercode und nennt den Weg zur Liste',
    zNichts.code === 1 && /zugang\.js liste/.test(zNichts.aus),
    zNichts.aus.split('\n').filter(Boolean).pop());
  const zHilfe = zBefehl([]);
  pruefe('Ohne Befehl kommt die Hilfe', /node zugang\.js passwort/.test(zHilfe.aus) && zHilfe.code === 0);

  fs.rmSync(zDir, { recursive: true, force: true });

  /* ================================================================
     MIGRATION 0.8.3 — ENTFAELLT MIT 1.0
     Eigener Abschnitt nach der Bauregel: was mit dem Migrationscode
     verschwindet, steht beieinander und traegt dieselbe Marke.
     ================================================================ */
  gruppe('MIGRATION 0.8.3 — ENTFAELLT MIT 1.0');

  /* Nachgestellt statt behauptet: der zugesicherte Bestand ist eine Datenbank
     aus 0.8.0 bis 0.8.2 -- dieselbe Anlage, nur ohne die neue Spalte. Und mit
     einer Zeile darin: eine leere Tabelle bewiese nichts ueber die Vorgabe. */
  const uDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-migration083-'));
  const uZweiterDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-frisch083-'));
  const uLauf = (verzeichnis) => require('child_process')
    .execFileSync(process.execPath, ['-e', "require('./db');"], {
      cwd: __dirname, encoding: 'utf8',
      env: { ...process.env, DATA_DIR: verzeichnis, ENCRYPTION_KEY: KEY }
    });
  const umsSpalten = (verzeichnis) => {
    const d = oeffne(path.join(verzeichnis, 'katalog.sqlite'));
    const s = d.prepare('PRAGMA table_info(comments)').all().map(c => c.name);
    d.close();
    return s;
  };

  uLauf(uDir);
  {
    const d = oeffne(path.join(uDir, 'katalog.sqlite'));
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('alt', 'x')").run();
    d.prepare("INSERT INTO items (title, user_id) VALUES ('Alter Eintrag', 1)").run();
    d.prepare("INSERT INTO comments (item_id, text, user_id) VALUES (1, 'Alter Kommentar', 1)").run();
    /* Tabellenneubau statt ALTER TABLE ... DROP COLUMN: SQLite prueft nach dem
       Entfernen den verbliebenen DDL-Text, und der endet hier mit einem
       Kommentar hinter dem letzten Komma -- "incomplete input". Ausserhalb
       jeder Transaktion, sonst waere das PRAGMA ein stiller No-op
       (Stolperstein 12); und das DROP TABLE ist bei eingeschalteten
       Fremdschluesseln ein DELETE mit Kaskade. */
    d.pragma('foreign_keys = OFF');
    d.exec(`
      CREATE TABLE comments_082 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'note',
        pinned INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
      );
      INSERT INTO comments_082 (id, item_id, text, kind, pinned, created_at, updated_at, user_id)
        SELECT id, item_id, text, kind, pinned, created_at, updated_at, user_id FROM comments;
      DROP TABLE comments;
      ALTER TABLE comments_082 RENAME TO comments;
    `);
    d.close();
  }
  pruefe('Die Prueflage traegt die Spalte wirklich nicht',
    !umsSpalten(uDir).includes('images_removed'), umsSpalten(uDir).join(', '));

  const uAusgabe = uLauf(uDir);
  pruefe('Die Migration ergaenzt die Spalte im Bestand',
    umsSpalten(uDir).includes('images_removed'), umsSpalten(uDir).join(', '));
  pruefe('Er sagt im Protokoll, was er getan hat',
    /images_removed/.test(uAusgabe), JSON.stringify(uAusgabe.trim()));
  const uWert = () => {
    const d = oeffne(path.join(uDir, 'katalog.sqlite'));
    const z = d.prepare('SELECT text, images_removed FROM comments').all();
    d.close();
    return z;
  };
  pruefe('Die Bestandszeile steht auf der Vorgabe null und behaelt ihren Text',
    uWert().length === 1 && uWert()[0].images_removed === 0 &&
    uWert()[0].text === 'Alter Kommentar', JSON.stringify(uWert()));

  // Wiederholbar und dann stumm: db.js laeuft bei JEDEM Start.
  const uZweitens = uLauf(uDir);
  pruefe('Ein zweiter Lauf ergaenzt nichts mehr und bleibt stumm',
    !/images_removed/.test(uZweitens), JSON.stringify(uZweitens.trim()));
  pruefe('Und die Zeile ist dabei unangetastet geblieben',
    uWert().length === 1 && uWert()[0].images_removed === 0, JSON.stringify(uWert()));

  /* Die frische Anlage bekommt die Spalte aus der DDL, nicht aus der Migration.
     Ohne diese Gegenlage bliebe offen, ob die DDL sie ueberhaupt traegt --
     und zu 1.0 faellt die Migration weg, die Spalte muss bleiben. */
  const uFrisch = uLauf(uZweiterDir);
  pruefe('Eine frische Anlage traegt die Spalte ohne Migration',
    umsSpalten(uZweiterDir).includes('images_removed') && !/images_removed/.test(uFrisch),
    `${umsSpalten(uZweiterDir).includes('images_removed')} / ${JSON.stringify(uFrisch.trim())}`);
  fs.rmSync(uDir, { recursive: true, force: true });
  fs.rmSync(uZweiterDir, { recursive: true, force: true });

  /* ================================================================
     MIGRATION 0.8.30 — ENTFAELLT MIT 1.0
     Eigener Abschnitt nach der Bauregel: was mit dem Migrationscode
     verschwindet, steht beieinander und traegt dieselbe Marke.
     ================================================================ */
  gruppe('MIGRATION 0.8.30 — ENTFAELLT MIT 1.0');

  /* Nachgestellt statt behauptet: der zugesicherte Bestand ist eine Datenbank
     aus 0.8.0 bis 0.8.20 -- dieselbe Anlage, nur ohne die neue Spalte an
     links. Und mit Linkzeilen darin: eine leere Tabelle bewiese nichts.

     DIE ANLAGE IST SO GEBAUT, DASS DIE FALSCHE ANTWORT AUFFAELLT. Der Eintrag
     gehoert BERT, Eigentuemerin ist CHEFIN (kleinste Nummer, ueber die
     Startregel). Fielen die Bestandszeilen an den Eigentuemer statt an den
     Eintragsverfasser, stuende dort chefin -- und genau das waere still
     falsch: bis 0.8.20 WAREN die Links eines Eintrags die Sache seines
     Verfassers.
     Die dritte Zeile haengt an einem Eintrag, der selbst herrenlos ist. Sie
     kann die Migration nicht fuellen; sie faellt danach dem Auffangnetz zu, und
     das ist die zweite, andere Regel. */
  const u30Dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-migration0830-'));
  const u30FrischDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-frisch0830-'));
  const u30Spalten = (verzeichnis) => {
    const d = oeffne(path.join(verzeichnis, 'katalog.sqlite'));
    const sp = d.prepare('PRAGMA table_info(links)').all().map(c => c.name);
    d.close();
    return sp;
  };
  const u30Zeilen = () => {
    const d = oeffne(path.join(u30Dir, 'katalog.sqlite'));
    const z = d.prepare(`SELECT l.url, u.username FROM links l
                         LEFT JOIN users u ON u.id = l.user_id ORDER BY l.id`).all();
    d.close();
    return z;
  };

  uLauf(u30Dir);
  {
    const d = oeffne(path.join(u30Dir, 'katalog.sqlite'));
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('chefin', 'x')").run();
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('bert', 'x')").run();
    d.prepare("INSERT INTO items (title, user_id) VALUES ('Berts Eintrag', 2)").run();
    d.prepare("INSERT INTO items (title, user_id) VALUES ('Ohne Verfasser', NULL)").run();
    /* Tabellenneubau statt ALTER TABLE ... DROP COLUMN, aus demselben Grund
       wie beim Migration 0.8.3 darueber: SQLite prueft nach dem Entfernen den
       verbliebenen DDL-Text. Ausserhalb jeder Transaktion, sonst waere das
       PRAGMA ein stiller No-op (Stolperstein 12); das DROP TABLE ist bei
       eingeschalteten Fremdschluesseln ein DELETE mit Kaskade. */
    d.pragma('foreign_keys = OFF');
    d.exec(`
      CREATE TABLE links_0820 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO links_0820 (item_id, url, sort_order) VALUES
        (1, 'https://berts-erster.test', 0),
        (1, 'https://berts-zweiter.test', 1),
        (2, 'https://an-herrenlosem.test', 0);
      DROP TABLE links;
      ALTER TABLE links_0820 RENAME TO links;
    `);
    d.close();
  }
  pruefe('Die Prueflage traegt die Spalte wirklich nicht',
    !u30Spalten(u30Dir).includes('user_id'), u30Spalten(u30Dir).join(', '));

  const u30Ausgabe = uLauf(u30Dir);
  pruefe('Die Migration ergaenzt die Spalte im Bestand',
    u30Spalten(u30Dir).includes('user_id'), u30Spalten(u30Dir).join(', '));
  pruefe('Er sagt im Protokoll, was er getan hat',
    /links um user_id ergaenzt/.test(u30Ausgabe), JSON.stringify(u30Ausgabe.trim()));

  /* DER KERN DIESES ABSCHNITTS. Beide Zeilen an berts Eintrag gehoeren bert --
     nicht chefin. Waere hier der Eigentuemer eingesetzt worden, machte der
     Migration aus berts Links stillschweigend fremde. */
  pruefe('Die Bestandszeilen fallen an den Verfasser ihres Eintrags',
    gleich(u30Zeilen().filter(z => /berts-/.test(z.url)).map(z => z.username), ['bert', 'bert']),
    JSON.stringify(u30Zeilen()));
  pruefe('Und ausdruecklich nicht an den Eigentuemer',
    u30Zeilen().filter(z => /berts-/.test(z.url)).every(z => z.username !== 'chefin'),
    JSON.stringify(u30Zeilen()));
  /* Die zweite Regel, am selben Lauf: was die Migration nicht fuellen kann --
     ein Link an einem herrenlosen Eintrag --, faengt ordneBestandZu() auf, und
     dort ist der Eigentuemer die eingefuehrte Antwort. Zwei Regeln fuer zwei
     Zeitpunkte, und beide sind hier zu sehen. */
  pruefe('Was die Migration nicht fuellen kann, faengt das Auffangnetz auf',
    u30Zeilen().find(z => /herrenlosem/.test(z.url))?.username === 'chefin',
    JSON.stringify(u30Zeilen()));
  pruefe('Danach steht keine Linkzeile mehr ohne Benutzer',
    u30Zeilen().every(z => z.username != null), JSON.stringify(u30Zeilen()));

  // Wiederholbar und dann stumm: db.js laeuft bei JEDEM Start.
  const u30Zweitens = uLauf(u30Dir);
  pruefe('Ein zweiter Lauf ergaenzt nichts mehr und bleibt stumm',
    !/links um user_id ergaenzt/.test(u30Zweitens), JSON.stringify(u30Zweitens.trim()));
  pruefe('Und die Zeilen sind dabei unangetastet geblieben',
    gleich(u30Zeilen().map(z => z.username), ['bert', 'bert', 'chefin']),
    JSON.stringify(u30Zeilen()));

  /* Die frische Anlage bekommt die Spalte aus der DDL, nicht aus der Migration.
     Ohne diese Gegenlage bliebe offen, ob die DDL sie ueberhaupt traegt --
     und zu 1.0 faellt die Migration weg, die Spalte muss bleiben. */
  const u30Frisch = uLauf(u30FrischDir);
  pruefe('Eine frische Anlage traegt die Spalte ohne Migration',
    u30Spalten(u30FrischDir).includes('user_id') && !/links um user_id ergaenzt/.test(u30Frisch),
    `${u30Spalten(u30FrischDir).includes('user_id')} / ${JSON.stringify(u30Frisch.trim())}`);
  /* Der Index ist mit dem Tabellenneubau verschwunden und legt sich beim Start
     selbst nach -- der Unterschied zwischen einem Index und einer Spalte,
     nachgestellt statt geglaubt (wie 0.8.20 an sessions). */
  {
    const d = oeffne(path.join(u30Dir, 'katalog.sqlite'));
    const idx = d.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'links'")
      .all().map(z => z.name);
    d.close();
    pruefe('Der Index auf links liegt danach wieder da',
      idx.includes('idx_links_item'), idx.join(', '));
  }
  fs.rmSync(u30Dir, { recursive: true, force: true });
  fs.rmSync(u30FrischDir, { recursive: true, force: true });

  /* ================================================================
     MIGRATION 0.8.31 — ENTFAELLT MIT 1.0
     Dieselbe Bauform wie der Abschnitt darueber, an attachments.
     ================================================================ */
  gruppe('MIGRATION 0.8.31 — ENTFAELLT MIT 1.0');

  /* Wieder so eingerichtet, dass die falsche Antwort auffaellt: der Eintrag
     gehoert bert, Eigentuemerin ist chefin. Und wieder eine dritte Zeile an
     einem herrenlosen Eintrag, die die Migration nicht fuellen kann. */
  const u31Dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-migration0831-'));
  const u31FrischDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-frisch0831-'));
  const u31Spalten = (verzeichnis) => {
    const d = oeffne(path.join(verzeichnis, 'katalog.sqlite'));
    const sp = d.prepare('PRAGMA table_info(attachments)').all().map(c => c.name);
    d.close();
    return sp;
  };
  const u31Zeilen = () => {
    const d = oeffne(path.join(u31Dir, 'katalog.sqlite'));
    const z = d.prepare(`SELECT a.filename, u.username FROM attachments a
                         LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id`).all();
    d.close();
    return z;
  };

  uLauf(u31Dir);
  {
    const d = oeffne(path.join(u31Dir, 'katalog.sqlite'));
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('chefin', 'x')").run();
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('bert', 'x')").run();
    d.prepare("INSERT INTO items (title, user_id) VALUES ('Berts Eintrag', 2)").run();
    d.prepare("INSERT INTO items (title, user_id) VALUES ('Ohne Verfasser', NULL)").run();
    // Tabellenneubau statt DROP COLUMN, aus denselben Gruenden wie oben.
    d.pragma('foreign_keys = OFF');
    d.exec(`
      CREATE TABLE attachments_0830 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        mime_type TEXT NOT NULL DEFAULT '',
        size INTEGER NOT NULL DEFAULT 0,
        data BLOB NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO attachments_0830 (item_id, filename, size, data, sort_order) VALUES
        (1, 'berts-erste.txt', 3, x'616263', 0),
        (1, 'berts-zweite.txt', 3, x'616263', 1),
        (2, 'an-herrenlosem.txt', 3, x'616263', 0);
      DROP TABLE attachments;
      ALTER TABLE attachments_0830 RENAME TO attachments;
    `);
    d.close();
  }
  pruefe('Die Prueflage traegt die Spalte wirklich nicht',
    !u31Spalten(u31Dir).includes('user_id'), u31Spalten(u31Dir).join(', '));

  const u31Ausgabe = uLauf(u31Dir);
  pruefe('Die Migration ergaenzt die Spalte im Bestand',
    u31Spalten(u31Dir).includes('user_id'), u31Spalten(u31Dir).join(', '));
  pruefe('Er sagt im Protokoll, was er getan hat',
    /attachments um user_id ergaenzt/.test(u31Ausgabe), JSON.stringify(u31Ausgabe.trim()));
  pruefe('Die Bestandsdateien fallen an den Verfasser ihres Eintrags',
    gleich(u31Zeilen().filter(z => /^berts-/.test(z.filename)).map(z => z.username), ['bert', 'bert']),
    JSON.stringify(u31Zeilen()));
  pruefe('Und ausdruecklich nicht an den Eigentuemer',
    u31Zeilen().filter(z => /^berts-/.test(z.filename)).every(z => z.username !== 'chefin'),
    JSON.stringify(u31Zeilen()));
  pruefe('Was die Migration nicht fuellen kann, faengt das Auffangnetz auf',
    u31Zeilen().find(z => /herrenlosem/.test(z.filename))?.username === 'chefin',
    JSON.stringify(u31Zeilen()));
  pruefe('Danach steht keine Datei mehr ohne Benutzer',
    u31Zeilen().every(z => z.username != null), JSON.stringify(u31Zeilen()));

  const u31Zweitens = uLauf(u31Dir);
  pruefe('Ein zweiter Lauf ergaenzt nichts mehr und bleibt stumm',
    !/attachments um user_id ergaenzt/.test(u31Zweitens), JSON.stringify(u31Zweitens.trim()));
  pruefe('Und die Zeilen sind dabei unangetastet geblieben',
    gleich(u31Zeilen().map(z => z.username), ['bert', 'bert', 'chefin']),
    JSON.stringify(u31Zeilen()));

  const u31Frisch = uLauf(u31FrischDir);
  pruefe('Eine frische Anlage traegt die Spalte ohne Migration',
    u31Spalten(u31FrischDir).includes('user_id') && !/attachments um user_id ergaenzt/.test(u31Frisch),
    `${u31Spalten(u31FrischDir).includes('user_id')} / ${JSON.stringify(u31Frisch.trim())}`);
  {
    const d = oeffne(path.join(u31Dir, 'katalog.sqlite'));
    const idx = d.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'attachments'")
      .all().map(z => z.name);
    d.close();
    pruefe('Der Index auf attachments liegt danach wieder da',
      idx.includes('idx_attachments_item'), idx.join(', '));
  }
  /* ALLE MIGRATIONEN IN EINEM LAUF -- die Lage, die im Betrieb wirklich vorkommt:
     wer von 0.8.20 auf 0.8.40 geht, faehrt sie hintereinander. Ohne diese
     Probe bliebe offen, ob sie sich gegenseitig stoeren.
     Erweitert statt verdoppelt: kommt eine Stufe dazu, kommt sie hier hinein. */
  {
    const uBeide = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-migration-beide-'));
    uLauf(uBeide);
    const d = oeffne(path.join(uBeide, 'katalog.sqlite'));
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('chefin', 'x')").run();
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('bert', 'x')").run();
    d.prepare("INSERT INTO items (title, user_id) VALUES ('Berts Eintrag', 2)").run();
    d.pragma('foreign_keys = OFF');
    d.exec(`
      CREATE TABLE links_0820 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        url TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')));
      INSERT INTO links_0820 (item_id, url, sort_order) VALUES (1, 'https://beides.test', 0);
      DROP TABLE links;
      ALTER TABLE links_0820 RENAME TO links;
      CREATE TABLE attachments_0820 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        filename TEXT NOT NULL, mime_type TEXT NOT NULL DEFAULT '',
        size INTEGER NOT NULL DEFAULT 0, data BLOB NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')));
      INSERT INTO attachments_0820 (item_id, filename, size, data, sort_order)
        VALUES (1, 'beides.txt', 3, x'616263', 0);
      DROP TABLE attachments;
      ALTER TABLE attachments_0820 RENAME TO attachments;
      CREATE TABLE rating_criteria_0820 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')));
      INSERT INTO rating_criteria_0820 (name, sort_order) VALUES ('Beides', 0);
      DROP TABLE rating_criteria;
      ALTER TABLE rating_criteria_0820 RENAME TO rating_criteria;
      CREATE TABLE photos_0820 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        mime_type TEXT NOT NULL, data BLOB NOT NULL, thumb BLOB, medium BLOB,
        focus_x REAL NOT NULL DEFAULT 50, focus_y REAL NOT NULL DEFAULT 50,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')));
      INSERT INTO photos_0820 (item_id, mime_type, data, sort_order)
        VALUES (1, 'image/png', x'89504e470d0a1a0a', 0);
      DROP TABLE photos;
      ALTER TABLE photos_0820 RENAME TO photos;
    `);
    d.close();
    const uBeideAus = uLauf(uBeide);
    pruefe('Ein Sprung von 0.8.20 faehrt ALLE Migrationen in einem Start',
      /links um user_id ergaenzt/.test(uBeideAus) &&
      /attachments um user_id ergaenzt/.test(uBeideAus) &&
      /rating_criteria um gewicht ergaenzt/.test(uBeideAus) &&
      /photos um art und dauer ergaenzt/.test(uBeideAus),
      JSON.stringify(uBeideAus.trim()));
    const d2 = oeffne(path.join(uBeide, 'katalog.sqlite'));
    const uBeideZeilen = [
      d2.prepare(`SELECT u.username FROM links l LEFT JOIN users u ON u.id = l.user_id`).get()?.username,
      d2.prepare(`SELECT u.username FROM attachments a LEFT JOIN users u ON u.id = a.user_id`).get()?.username
    ];
    let uBeideGewicht = [], uBeideFotos = [];
    try { uBeideGewicht = d2.prepare('SELECT name, gewicht FROM rating_criteria').all(); }
    catch { /* die Spalte fehlt -- die Pruefung darauf wird rot */ }
    try { uBeideFotos = d2.prepare('SELECT art, dauer FROM photos').all(); }
    catch { /* dieselbe Abfangung, aus demselben Grund */ }
    d2.close();
    pruefe('Und beide Zeilen landen beim Verfasser ihres Eintrags',
      gleich(uBeideZeilen, ['bert', 'bert']), JSON.stringify(uBeideZeilen));
    pruefe('Und das Kriterium traegt danach das Vorgabegewicht',
      uBeideGewicht.length === 1 && uBeideGewicht[0].gewicht === 1,
      JSON.stringify(uBeideGewicht));
    pruefe('Und das Foto traegt danach die Vorgabeart',
      uBeideFotos.length === 1 && uBeideFotos[0].art === 'bild' && uBeideFotos[0].dauer === null,
      JSON.stringify(uBeideFotos));
    fs.rmSync(uBeide, { recursive: true, force: true });
  }
  fs.rmSync(u31Dir, { recursive: true, force: true });
  fs.rmSync(u31FrischDir, { recursive: true, force: true });

  /* ================================================================
     MIGRATION 0.8.40 — ENTFAELLT MIT 1.0
     Eigener Abschnitt nach der Bauregel: was mit dem Migrationscode
     verschwindet, steht beieinander und traegt dieselbe Marke.
     ================================================================ */
  gruppe('MIGRATION 0.8.40 — ENTFAELLT MIT 1.0');

  /* Nachgestellt statt behauptet: der zugesicherte Bestand ist eine Datenbank
     aus 0.8.0 bis 0.8.31 -- dieselbe Anlage, nur ohne die Spalte gewicht an
     rating_criteria. Und mit Kriterien darin: eine leere Tabelle bewiese
     nichts ueber die Vorgabe (Stolperstein 81).

     KEINE FRAGE NACH EINEM VERFASSER, anders als in den beiden Abschnitten
     darueber: ein Gewicht kann nicht herrenlos werden. Die Prueflage traegt
     trotzdem Bewertungen an den Kriterien -- daran haengt die eigentliche
     Zusicherung dieser Runde: die Migration darf keine angezeigte Zahl
     veraendern. */
  const u40Dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-migration0840-'));
  const u40FrischDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-frisch0840-'));
  const u40Spalten = (verzeichnis) => {
    const d = oeffne(path.join(verzeichnis, 'katalog.sqlite'));
    const sp = d.prepare('PRAGMA table_info(rating_criteria)').all().map(c => c.name);
    d.close();
    return sp;
  };
  /* Faengt den Fall ab, dass die Spalte gar nicht da ist: ohne das reisst eine
     Gegenprobe, die die Migration zurueckbaut, den ganzen Lauf ab und nennt
     KEINEN einzigen Namen (Stolperstein 103). Eine leere Liste macht die
     Pruefungen darunter rot, und das ist die Auskunft, die gebraucht wird. */
  const u40Zeilen = () => {
    const d = oeffne(path.join(u40Dir, 'katalog.sqlite'));
    let z = [];
    try { z = d.prepare('SELECT name, gewicht FROM rating_criteria ORDER BY sort_order, id').all(); }
    catch { /* die Spalte fehlt -- die Pruefungen darunter werden rot */ }
    d.close();
    return z;
  };

  uLauf(u40Dir);
  {
    const d = oeffne(path.join(u40Dir, 'katalog.sqlite'));
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('chefin', 'x')").run();
    d.prepare("INSERT INTO items (title, user_id) VALUES ('Bestandseintrag', 1)").run();
    /* Tabellenneubau statt ALTER TABLE ... DROP COLUMN, aus demselben Grund
       wie in den Abschnitten darueber: SQLite prueft nach dem Entfernen den
       verbliebenen DDL-Text, und der endet hier mit einem Kommentar hinter dem
       letzten Komma. Ausserhalb jeder Transaktion, sonst waere das PRAGMA ein
       stiller No-op (Stolperstein 12); das DROP TABLE ist bei eingeschalteten
       Fremdschluesseln ein DELETE mit Kaskade -- deshalb entstehen die
       Bewertungen erst danach. */
    d.pragma('foreign_keys = OFF');
    d.exec(`
      CREATE TABLE rating_criteria_0831 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO rating_criteria_0831 (name, sort_order) VALUES
        ('Optik', 0), ('Haptik', 1), ('Preis', 2);
      DROP TABLE rating_criteria;
      ALTER TABLE rating_criteria_0831 RENAME TO rating_criteria;
      INSERT INTO ratings (item_id, criterion_id, value, user_id) VALUES
        (1, 1, 5, 1), (1, 2, 2, 1), (1, 3, 4, 1);
    `);
    d.close();
  }
  pruefe('Die Prueflage traegt die Spalte wirklich nicht',
    !u40Spalten(u40Dir).includes('gewicht'), u40Spalten(u40Dir).join(', '));
  /* Und sie traegt wirklich Kriterien -- ohne diese Zeile stuende der Beleg
     unten auf null Zeilen und bliebe gruen, ohne etwas zu belegen
     (Stolperstein 81). Eigene Abfrage, weil u40Zeilen() die Spalte gewicht
     liest, die es hier noch nicht gibt. */
  {
    const d = oeffne(path.join(u40Dir, 'katalog.sqlite'));
    const n = d.prepare('SELECT COUNT(*) AS n FROM rating_criteria').get().n;
    const b = d.prepare('SELECT COUNT(*) AS n FROM ratings WHERE value > 0').get().n;
    d.close();
    pruefe('Und sie traegt drei Kriterien mit Bewertungen daran', n === 3 && b === 3,
      `${n} Kriterien, ${b} Bewertungen`);
  }

  const u40Ausgabe = uLauf(u40Dir);
  pruefe('Die Migration ergaenzt die Spalte im Bestand',
    u40Spalten(u40Dir).includes('gewicht'), u40Spalten(u40Dir).join(', '));
  pruefe('Er sagt im Protokoll, was er getan hat',
    /rating_criteria um gewicht ergaenzt/.test(u40Ausgabe), JSON.stringify(u40Ausgabe.trim()));

  /* DER KERN DIESES ABSCHNITTS. Jeder andere Wert als 1,0 aenderte beim
     Einspielen still saemtliche Gesamtschnitte. Erst auf Vorhandensein, dann
     auf die Eigenschaft -- bei null Zeilen bliebe every() gruen und belegte
     nichts (Stolperstein 81). */
  pruefe('Die drei Bestandszeilen stehen auf 1,0',
    u40Zeilen().length === 3 && u40Zeilen().every(z => z.gewicht === 1),
    JSON.stringify(u40Zeilen()));
  /* Und die Vorgabe kommt aus dem DEFAULT der Spalte, nicht aus einem
     nachgeschobenen UPDATE: db.js schreibt nach dem ALTER TABLE nichts mehr
     an diese Tabelle. Nachgestellt am Quelltext, nicht geglaubt. */
  {
    const u40Quelle = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
    const u40Block = u40Quelle.slice(u40Quelle.indexOf('// MIGRATION 0.8.40'),
                                     u40Quelle.indexOf('// ENDE MIGRATION 0.8.40'));
    pruefe('Die Vorgabe kommt aus dem DEFAULT, nicht aus einem UPDATE',
      u40Block.includes('DEFAULT 1.0') && !/UPDATE\s+rating_criteria/i.test(u40Block),
      JSON.stringify(u40Block.slice(0, 80)));
    /* ordneBestandZu() wird ausdruecklich NICHT angefasst: dort geht es um
       user_id und um die Frage, wem eine herrenlose Zeile gehoert. Ein Gewicht
       kann nicht herrenlos werden. Der Waechter haelt fest, dass die Tabelle
       dort nicht auftaucht. */
    const u40Auffang = u40Quelle.slice(u40Quelle.indexOf('function ordneBestandZu'),
                                       u40Quelle.indexOf('ordneBestandZu();'));
    pruefe('Das Auffangnetz kennt rating_criteria nicht',
      !u40Auffang.includes('rating_criteria'), 'rating_criteria steht in ordneBestandZu()');
  }

  /* Der eigentliche Beleg der Runde, an derselben Anlage: der Gesamtschnitt
     nach der Migration ist derselbe, den die Rechnung ohne Gewichte ergaebe.
     (5 + 2 + 4) / 3 = 3,67 -> 3,7. Hier von Hand nachgerechnet statt aus dem
     Server geholt: eine fest hingeschriebene Zahl belegte weniger. */
  {
    const d = oeffne(path.join(u40Dir, 'katalog.sqlite'));
    // Wieder abgefangen, aus demselben Grund wie bei u40Zeilen().
    let zeilen = [];
    try {
      zeilen = d.prepare(`SELECT r.value * 1.0 AS w, c.gewicht FROM ratings r
                          JOIN rating_criteria c ON c.id = r.criterion_id
                          WHERE r.item_id = 1 AND r.value > 0`).all();
    } catch { /* die Spalte fehlt -- die Pruefung darunter wird rot */ }
    d.close();
    const ungewichtet = zeilen.length
      ? Math.round((zeilen.reduce((s2, z) => s2 + z.w, 0) / zeilen.length) * 10) / 10 : null;
    let za = 0, ne = 0;
    for (const z of zeilen) { za += z.w * z.gewicht; ne += z.gewicht; }
    const gewichtet = ne ? Math.round((za / ne) * 10) / 10 : null;
    pruefe('Nach der Migration rechnet die Gewichtung dasselbe wie vorher',
      zeilen.length === 3 && gewichtet === ungewichtet && gewichtet === 3.7,
      `${gewichtet} gegen ${ungewichtet}`);
  }

  // Wiederholbar und dann stumm: db.js laeuft bei JEDEM Start.
  const u40Zweitens = uLauf(u40Dir);
  pruefe('Ein zweiter Lauf ergaenzt nichts mehr und bleibt stumm',
    !/rating_criteria um gewicht ergaenzt/.test(u40Zweitens), JSON.stringify(u40Zweitens.trim()));
  pruefe('Und die Zeilen sind dabei unangetastet geblieben',
    gleich(u40Zeilen().map(z => `${z.name}:${z.gewicht}`), ['Optik:1', 'Haptik:1', 'Preis:1']),
    JSON.stringify(u40Zeilen()));
  /* Ein von Hand gesetztes Gewicht ueberlebt jeden weiteren Start -- sonst
     stellte der naechste Neustand alles wieder auf die Vorgabe. */
  {
    const d = oeffne(path.join(u40Dir, 'katalog.sqlite'));
    // Abgefangen wie jede andere Lesestelle: fehlt die Spalte, wird die
    // Pruefung darunter rot, statt den Lauf abzureissen (Stolperstein 103).
    try { d.prepare("UPDATE rating_criteria SET gewicht = 1.5 WHERE name = 'Optik'").run(); }
    catch { /* die Spalte fehlt */ }
    d.close();
  }
  uLauf(u40Dir);
  pruefe('Ein gesetztes Gewicht ueberlebt den naechsten Start',
    u40Zeilen().find(z => z.name === 'Optik')?.gewicht === 1.5, JSON.stringify(u40Zeilen()));

  /* Die frische Anlage bekommt die Spalte aus der DDL, nicht aus der Migration.
     Ohne diese Gegenlage bliebe offen, ob die DDL sie ueberhaupt traegt --
     und zu 1.0 faellt die Migration weg, die Spalte muss bleiben. */
  const u40Frisch = uLauf(u40FrischDir);
  pruefe('Eine frische Anlage traegt die Spalte ohne Migration',
    u40Spalten(u40FrischDir).includes('gewicht') &&
    !/rating_criteria um gewicht ergaenzt/.test(u40Frisch),
    `${u40Spalten(u40FrischDir).includes('gewicht')} / ${JSON.stringify(u40Frisch.trim())}`);
  /* Und sie ist genauso gebaut wie die migrierte: NOT NULL mit Vorgabe 1,0 und
     ohne CHECK. Waeren die beiden verschieden gebaut, waere das genau die
     Abweichung, die 0.6.0 als Fehler erkannt hat. */
  /* Nachgesehen wird das VERHALTEN, nicht der DDL-Text: das Wort CHECK steht
     im Kommentar an der Spalte, und ein Waechter ueber den Text faerbte sich
     daran. Ein Wert ausserhalb der Spanne muss direkt in der Datenbank
     durchgehen -- die Gueltigkeit steht im Server, an genau einer Stelle, und
     nicht ein zweites Mal im Schema. */
  const u40Bau = (verzeichnis) => {
    const d = oeffne(path.join(verzeichnis, 'katalog.sqlite'));
    const sp = d.prepare('PRAGMA table_info(rating_criteria)').all().find(c => c.name === 'gewicht');
    // Fehlt die Spalte ganz, kommt hier 'keine Spalte' heraus -- und die
    // Pruefungen darunter werden rot, statt den Lauf abzureissen.
    const versuch = (sql) => {
      try { d.prepare(sql).run(); return 'geht durch'; }
      catch (e) { return /no such column/i.test(e.message) ? 'keine Spalte' : 'abgewiesen'; }
    };
    const ausserhalb = versuch(
      'UPDATE rating_criteria SET gewicht = 9 WHERE id = (SELECT MIN(id) FROM rating_criteria)');
    if (ausserhalb === 'geht durch') versuch('UPDATE rating_criteria SET gewicht = 1 WHERE gewicht = 9');
    const leer = versuch(
      'UPDATE rating_criteria SET gewicht = NULL WHERE id = (SELECT MIN(id) FROM rating_criteria)');
    d.close();
    return { notnull: sp?.notnull, vorgabe: String(sp?.dflt_value), ausserhalb, leer };
  };
  const u40BauMigriert = u40Bau(u40Dir), u40BauFrisch = u40Bau(u40FrischDir);
  pruefe('Migrierte und frische Anlage bauen die Spalte gleich',
    gleich(u40BauMigriert, u40BauFrisch),
    `${JSON.stringify(u40BauMigriert)} gegen ${JSON.stringify(u40BauFrisch)}`);
  pruefe('Sie ist NOT NULL mit Vorgabe 1.0',
    u40BauFrisch.notnull === 1 && u40BauFrisch.vorgabe === '1.0' &&
    u40BauFrisch.leer === 'abgewiesen', JSON.stringify(u40BauFrisch));
  /* KEIN CHECK -- und zwar nicht, weil SQLite keinen nachruesten koennte
     (ADD COLUMN nimmt einen an, das ist nachgestellt), sondern weil die Spanne
     dann zweimal stuende: hier und in GEWICHT_MIN/GEWICHT_MAX. Zwei Stellen
     fuer dieselbe Grenze laufen auseinander. */
  pruefe('Und sie traegt keinen CHECK -- die Grenze steht allein im Server',
    u40BauFrisch.ausserhalb === 'geht durch', JSON.stringify(u40BauFrisch.ausserhalb));
  fs.rmSync(u40Dir, { recursive: true, force: true });
  fs.rmSync(u40FrischDir, { recursive: true, force: true });

  /* ================================================================
     MIGRATION 0.8.50 — ENTFAELLT MIT 1.0
     Eigener Abschnitt nach der Bauregel: was mit dem Migrationscode
     verschwindet, steht beieinander und traegt dieselbe Marke.
     ================================================================ */
  gruppe('MIGRATION 0.8.50 — ENTFAELLT MIT 1.0');

  /* Nachgestellt statt behauptet: der zugesicherte Bestand ist eine Datenbank
     aus 0.8.0 bis 0.8.40 -- dieselbe Anlage, nur ohne art und dauer an photos.
     UND MIT FOTOS DARIN: eine leere Tabelle bewiese nichts ueber die Vorgabe
     (Stolperstein 81).
     KEINE FRAGE NACH EINEM VERFASSER, wie schon bei 0.8.40: ein Foto gehoert
     seinem Eintrag, nicht einem Verfasser -- Fotos sind kein Traeger. Die
     Frage ist gestellt und verneint, und der Waechter weiter unten haelt es
     fest. */
  const u50Dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-migration0850-'));
  const u50FrischDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-frisch0850-'));
  const u50Spalten = (verzeichnis) => {
    const d = oeffne(path.join(verzeichnis, 'katalog.sqlite'));
    const sp = d.prepare('PRAGMA table_info(photos)').all().map(c => c.name);
    d.close();
    return sp;
  };
  /* Abgefangen wie jede Lesestelle auf eine neue Spalte: fehlt sie, werden die
     Pruefungen darunter rot, statt den Lauf abzureissen und KEINEN Namen zu
     nennen (Stolperstein 103; in 0.8.40 hat genau das zugeschlagen). */
  const u50Zeilen = (verzeichnis = u50Dir) => {
    const d = oeffne(path.join(verzeichnis, 'katalog.sqlite'));
    let z = [];
    try { z = d.prepare('SELECT id, art, dauer FROM photos ORDER BY sort_order, id').all(); }
    catch { /* eine der Spalten fehlt -- die Pruefungen darunter werden rot */ }
    d.close();
    return z;
  };
  /* Eine Anlage aus 0.8.40 nachbauen: Tabellenneubau statt
     ALTER TABLE ... DROP COLUMN, aus demselben Grund wie in den Abschnitten
     darueber -- SQLite prueft nach dem Entfernen den verbliebenen DDL-Text,
     und der traegt hier Kommentare. Ausserhalb jeder Transaktion, sonst waere
     das PRAGMA ein stiller No-op (Stolperstein 12).
     `welche` sagt, welche der beiden Spalten die Prueflage NICHT hat -- damit
     laesst sich belegen, dass jede EINZELN nachgeruestet wird. */
  const u50Rueckbau = (verzeichnis, welche) => {
    const d = oeffne(path.join(verzeichnis, 'katalog.sqlite'));
    const zusatz = [
      welche.includes('art') ? '' : "art TEXT NOT NULL DEFAULT 'bild',",
      welche.includes('dauer') ? '' : 'dauer INTEGER,'
    ].join(' ');
    d.pragma('foreign_keys = OFF');
    d.exec(`
      CREATE TABLE photos_0840 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        mime_type TEXT NOT NULL,
        data BLOB NOT NULL,
        thumb BLOB,
        medium BLOB,
        ${zusatz}
        focus_x REAL NOT NULL DEFAULT 50,
        focus_y REAL NOT NULL DEFAULT 50,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO photos_0840 (item_id, mime_type, data, sort_order)
        VALUES (1, 'image/png', x'89504e470d0a1a0a', 0),
               (1, 'image/jpeg', x'ffd8ffe000104a46', 1);
      DROP TABLE photos;
      ALTER TABLE photos_0840 RENAME TO photos;
      CREATE INDEX IF NOT EXISTS idx_photos_item ON photos(item_id, sort_order);
    `);
    d.close();
  };

  uLauf(u50Dir);
  {
    const d = oeffne(path.join(u50Dir, 'katalog.sqlite'));
    d.prepare("INSERT INTO users (username, password_hash) VALUES ('chefin', 'x')").run();
    d.prepare("INSERT INTO items (title, user_id) VALUES ('Bestandseintrag', 1)").run();
    d.close();
  }
  u50Rueckbau(u50Dir, ['art', 'dauer']);
  pruefe('Die Prueflage traegt beide Spalten wirklich nicht',
    !u50Spalten(u50Dir).includes('art') && !u50Spalten(u50Dir).includes('dauer'),
    u50Spalten(u50Dir).join(', '));
  /* Und sie traegt wirklich Fotos -- ohne diese Zeile stuende der Beleg unten
     auf null Zeilen und bliebe gruen, ohne etwas zu belegen (Stolperstein 81).
     Eigene Abfrage, weil u50Zeilen() Spalten liest, die es hier nicht gibt. */
  {
    const d = oeffne(path.join(u50Dir, 'katalog.sqlite'));
    const n = d.prepare('SELECT COUNT(*) AS n FROM photos').get().n;
    d.close();
    pruefe('Und sie traegt zwei Fotos', n === 2, `${n} Fotos`);
  }

  const u50Ausgabe = uLauf(u50Dir);
  pruefe('Die Migration ergaenzt beide Spalten im Bestand',
    u50Spalten(u50Dir).includes('art') && u50Spalten(u50Dir).includes('dauer'),
    u50Spalten(u50Dir).join(', '));
  pruefe('Er sagt im Protokoll, was er getan hat',
    /photos um art und dauer ergaenzt/.test(u50Ausgabe), JSON.stringify(u50Ausgabe.trim()));

  /* DER KERN DIESES ABSCHNITTS. Jeder andere Wert als 'bild' machte aus jedem
     vorhandenen Foto still ein Video -- und die Auslieferung boete danach
     Ranges an einer Datei an, die keine ist. dauer bleibt NULL: ein Foto hat
     keine Dauer. Erst auf Vorhandensein, dann auf die Eigenschaft. */
  pruefe('Die beiden Bestandszeilen stehen auf bild, ohne Dauer',
    u50Zeilen().length === 2 && u50Zeilen().every(z => z.art === 'bild' && z.dauer === null),
    JSON.stringify(u50Zeilen()));
  /* Und die Vorgabe kommt aus dem DEFAULT der Spalte, nicht aus einem
     nachgeschobenen UPDATE: db.js schreibt nach dem ALTER TABLE nichts mehr an
     diese Tabelle. Nachgestellt am Quelltext, nicht geglaubt. */
  {
    const u50Quelle = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
    const u50Block = u50Quelle.slice(u50Quelle.indexOf('// MIGRATION 0.8.50'),
                                     u50Quelle.indexOf('// ENDE MIGRATION 0.8.50'));
    pruefe('Die Vorgabe kommt aus dem DEFAULT, nicht aus einem UPDATE',
      u50Block.includes("DEFAULT 'bild'") && !/UPDATE\s+photos/i.test(u50Block),
      JSON.stringify(u50Block.slice(0, 80)));
    /* JEDE SPALTE WIRD EINZELN GEFRAGT. Ein Block, der beim Vorhandensein von
       art zurueckkehrt, liesse dauer fehlen, wenn ein Lauf dazwischen
       abgebrochen ist -- nachgemessen: zwei ALTER TABLE sind zwei Anweisungen,
       und scheitert die zweite, bleibt die erste stehen. */
    pruefe('Der Block fragt jede Spalte einzeln ab',
      (u50Block.match(/spalten\.includes\(/g) || []).length === 2,
      `${(u50Block.match(/spalten\.includes\(/g) || []).length} Abfragen`);
    /* ordneBestandZu() wird ausdruecklich NICHT angefasst: dort geht es um
       user_id und um die Frage, wem eine herrenlose Zeile gehoert. Ein Foto
       gehoert seinem Eintrag, nicht einem Verfasser. */
    const u50Auffang = u50Quelle.slice(u50Quelle.indexOf('function ordneBestandZu'),
                                       u50Quelle.indexOf('ordneBestandZu();'));
    pruefe('Das Auffangnetz kennt photos nicht',
      !u50Auffang.includes('photos'), 'photos steht in ordneBestandZu()');
  }

  // Wiederholbar und dann stumm: db.js laeuft bei JEDEM Start.
  const u50Zweitens = uLauf(u50Dir);
  pruefe('Ein zweiter Lauf ergaenzt nichts mehr und bleibt stumm',
    !/photos um /.test(u50Zweitens), JSON.stringify(u50Zweitens.trim()));
  pruefe('Und die Zeilen sind dabei unangetastet geblieben',
    u50Zeilen().length === 2 && u50Zeilen().every(z => z.art === 'bild'),
    JSON.stringify(u50Zeilen()));

  /* JEDE DER BEIDEN SPALTEN WIRD EINZELN NACHGERUESTET -- nachgestellt, nicht
     nur am Quelltext gelesen. Das ist der zerrissene Stand, den ein Block mit
     einer einzigen Abfrage fuer immer stehen liesse. */
  for (const [fehlt, daneben] of [[['art'], 'dauer'], [['dauer'], 'art']]) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `kriterion-u50-${fehlt[0]}-`));
    uLauf(dir);
    {
      const d = oeffne(path.join(dir, 'katalog.sqlite'));
      d.prepare("INSERT INTO users (username, password_hash) VALUES ('chefin', 'x')").run();
      d.prepare("INSERT INTO items (title, user_id) VALUES ('Halb', 1)").run();
      d.close();
    }
    u50Rueckbau(dir, fehlt);
    pruefe(`Die halbe Prueflage traegt ${daneben}, aber nicht ${fehlt[0]}`,
      u50Spalten(dir).includes(daneben) && !u50Spalten(dir).includes(fehlt[0]),
      u50Spalten(dir).join(', '));
    const ausgabe = uLauf(dir);
    pruefe(`Die Migration ruestet ${fehlt[0]} einzeln nach`,
      u50Spalten(dir).includes(fehlt[0]) &&
      new RegExp(`photos um ${fehlt[0]} ergaenzt`).test(ausgabe),
      `${u50Spalten(dir).join(', ')} / ${JSON.stringify(ausgabe.trim())}`);
    pruefe(`Und die Bestandszeilen stehen danach richtig da (${fehlt[0]} fehlte)`,
      u50Zeilen(dir).length === 2 &&
      u50Zeilen(dir).every(z => z.art === 'bild' && z.dauer === null),
      JSON.stringify(u50Zeilen(dir)));
    fs.rmSync(dir, { recursive: true, force: true });
  }

  /* Die frische Anlage bekommt die Spalten aus der DDL, nicht aus der Migration.
     Ohne diese Gegenlage bliebe offen, ob die DDL sie ueberhaupt traegt -- und
     zu 1.0 faellt die Migration weg, die Spalten muessen bleiben. */
  const u50Frisch = uLauf(u50FrischDir);
  pruefe('Eine frische Anlage traegt beide Spalten ohne Migration',
    u50Spalten(u50FrischDir).includes('art') && u50Spalten(u50FrischDir).includes('dauer') &&
    !/photos um /.test(u50Frisch),
    `${u50Spalten(u50FrischDir).join(', ')} / ${JSON.stringify(u50Frisch.trim())}`);
  /* Und migrierte und frische Anlage bauen die Spalten gleich. Nachgesehen
     wird das VERHALTEN, nicht der DDL-Text: das Wort CHECK steht im Kommentar
     an der Spalte, und ein Waechter ueber den Text faerbte sich daran
     (Stolperstein 106). Eine dritte Art muss direkt in der Datenbank
     durchgehen -- die Menge der erlaubten Werte steht im Server, an einer
     Stelle, und nicht ein zweites Mal im Schema. */
  const u50Bau = (verzeichnis) => {
    const d = oeffne(path.join(verzeichnis, 'katalog.sqlite'));
    const sp = d.prepare('PRAGMA table_info(photos)').all();
    const art = sp.find(c => c.name === 'art'), dauer = sp.find(c => c.name === 'dauer');
    const versuch = (sql) => {
      try { d.prepare(sql).run(); return 'geht durch'; }
      catch (e) { return /no such column/i.test(e.message) ? 'keine Spalte' : 'abgewiesen'; }
    };
    d.prepare("INSERT INTO items (id, title) VALUES (900, 'Bauprobe') ON CONFLICT(id) DO NOTHING").run();
    const dritteArt = versuch(
      "INSERT INTO photos (item_id, mime_type, data, art) VALUES (900, 'x', x'00', 'dritte')");
    const leer = versuch(
      "INSERT INTO photos (item_id, mime_type, data, art) VALUES (900, 'x', x'00', NULL)");
    d.prepare('DELETE FROM photos WHERE item_id = 900').run();
    d.prepare('DELETE FROM items WHERE id = 900').run();
    d.close();
    return { artNotnull: art?.notnull, artVorgabe: String(art?.dflt_value),
             dauerNotnull: dauer?.notnull, dritteArt, leer };
  };
  const u50BauMigriert = u50Bau(u50Dir), u50BauFrisch = u50Bau(u50FrischDir);
  pruefe('Migrierte und frische Anlage bauen die Spalten gleich',
    gleich(u50BauMigriert, u50BauFrisch),
    `${JSON.stringify(u50BauMigriert)} gegen ${JSON.stringify(u50BauFrisch)}`);
  pruefe('art ist NOT NULL mit Vorgabe bild, dauer darf leer bleiben',
    u50BauFrisch.artNotnull === 1 && u50BauFrisch.artVorgabe === "'bild'" &&
    u50BauFrisch.dauerNotnull === 0 && u50BauFrisch.leer === 'abgewiesen',
    JSON.stringify(u50BauFrisch));
  /* KEIN CHECK -- und zwar nicht, weil SQLite keinen nachruesten koennte
     (Stolperstein 107: ADD COLUMN nimmt einen an), sondern weil die Menge der
     erlaubten Werte dann zweimal stuende. Zwei Stellen fuer dieselbe Liste
     laufen auseinander. */
  pruefe('Und art traegt keinen CHECK -- die Menge steht allein im Server',
    u50BauFrisch.dritteArt === 'geht durch', JSON.stringify(u50BauFrisch.dritteArt));
  /* Ein Index ueber art bringt nichts: die Zeilen je Eintrag sind einstellig,
     und gefiltert wird nirgends nach Art. Der vorhandene Index bleibt, wie er
     ist -- und dass er den Tabellenneubau der Prueflage ueberlebt hat, steht
     hier gleich mit. */
  {
    const d = oeffne(path.join(u50FrischDir, 'katalog.sqlite'));
    const idx = d.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'photos'")
      .all().map(z => z.name);
    d.close();
    pruefe('Der Index auf photos ist unveraendert der eine von vorher',
      idx.includes('idx_photos_item') && !idx.some(n => /art/i.test(n)), idx.join(', '));
  }
  fs.rmSync(u50Dir, { recursive: true, force: true });
  fs.rmSync(u50FrischDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Anordnung der Blöcke');

  const bl = (await ruf('GET', '/api/settings')).inhalt.bloecke;
  pruefe('Vorgabeanordnung wird geliefert',
    gleich(bl.seite, ['kategorie', 'tags', 'bewertung']) &&
    gleich(bl.unten, ['beschreibung', 'testtage', 'links', 'dateien', 'kommentare']) &&
    gleich(bl.zu, []), JSON.stringify(bl));

  const gedreht = await ruf('PUT', '/api/settings', { bloecke: {
    seite: ['bewertung', 'kategorie', 'tags'],
    unten: ['links', 'beschreibung', 'testtage', 'dateien', 'kommentare'],
    zu: ['links']
  }});
  pruefe('Neue Anordnung wird gespeichert',
    gleich(gedreht.inhalt.bloecke.seite, ['bewertung', 'kategorie', 'tags']) &&
    gleich(gedreht.inhalt.bloecke.zu, ['links']));
  pruefe('Anordnung überlebt den nächsten Abruf',
    gleich((await ruf('GET', '/api/settings')).inhalt.bloecke.unten,
           ['links', 'beschreibung', 'testtage', 'dateien', 'kommentare']));

  const schmutz = await ruf('PUT', '/api/settings', { bloecke: {
    seite: ['bewertung', 'kommentare', 'bewertung', 'quatsch'],
    unten: ['kommentare'], zu: ['links', 'gibtsnicht']
  }});
  const sb = schmutz.inhalt.bloecke;
  pruefe('Fremde Namen fliegen raus', !sb.seite.includes('kommentare') && !sb.seite.includes('quatsch'));
  pruefe('Doppelte Namen fliegen raus', sb.seite.filter(k => k === 'bewertung').length === 1);
  pruefe('Fehlende Blöcke hängen sich hinten an',
    gleich(sb.seite, ['bewertung', 'kategorie', 'tags']) &&
    gleich(sb.unten, ['kommentare', 'beschreibung', 'testtage', 'links', 'dateien']), JSON.stringify(sb));
  pruefe('Unbekannter Einklappzustand wird verworfen', gleich(sb.zu, ['links']));
  await ruf('PUT', '/api/settings', { bloecke: {
    seite: ['kategorie', 'tags', 'bewertung'],
    unten: ['beschreibung', 'testtage', 'links', 'dateien', 'kommentare'], zu: [] } });

  /* ---------------------------------------------------------------- */
  gruppe('Fokuspunkt der Vorschau');

  const fp = (await ruf('POST', '/api/items', { title: 'Fokusprobe' })).inhalt;
  const bild = await legeFotoAn(fp.id);
  pruefe('Neues Foto sitzt in der Mitte', bild.focus_x === 50 && bild.focus_y === 50,
    `${bild.focus_x}/${bild.focus_y}`);

  const gesetztF = await ruf('PUT', `/api/photos/${bild.id}/focus`, { x: 25.44, y: 80 });
  const nachF = gesetztF.inhalt.photos[0];
  pruefe('Fokuspunkt wird gesetzt und gerundet',
    nachF.focus_x === 25.4 && nachF.focus_y === 80, `${nachF.focus_x}/${nachF.focus_y}`);
  const zuGross = await ruf('PUT', `/api/photos/${bild.id}/focus`, { x: 500, y: -20 });
  pruefe('Zu große und negative Werte werden eingefangen',
    zuGross.inhalt.photos[0].focus_x === 100 && zuGross.inhalt.photos[0].focus_y === 0,
    `${zuGross.inhalt.photos[0].focus_x}/${zuGross.inhalt.photos[0].focus_y}`);
  pruefe('Text als Fokuspunkt wird abgewiesen',
    (await ruf('PUT', `/api/photos/${bild.id}/focus`, { x: 'links', y: 10 })).status === 400);
  pruefe('Unbekanntes Foto meldet 404',
    (await ruf('PUT', '/api/photos/99999/focus', { x: 10, y: 10 })).status === 404);

  await ruf('PUT', `/api/photos/${bild.id}/focus`, { x: 20, y: 70 });
  const uebersichtF = (await ruf('GET', '/api/items')).inhalt.find(i => i.id === fp.id);
  pruefe('Übersicht liefert den Fokuspunkt des Hauptbilds mit',
    uebersichtF.mainPhoto.focus_x === 20 && uebersichtF.mainPhoto.focus_y === 70);

  const ausF = await ruf('GET', '/api/export?photos=1');
  const ausFoto = ausF.inhalt.items.find(i => i.title === 'Fokusprobe').photos[0];
  pruefe('Export nimmt den Fokuspunkt mit', ausFoto.focus_x === 20 && ausFoto.focus_y === 70);
  await ruf('DELETE', `/api/items/${fp.id}`);

  const impF = await sendeImport({ version: 5, title: 'F', items: [
    { title: 'Mit Fokus', photos: [{ mime_type: 'image/png', focus_x: 30, focus_y: 90,
        data_base64: PNG_BASE64 }] },
    { title: 'Ohne Fokus', photos: [{ mime_type: 'image/png', data_base64: PNG_BASE64 }] }
  ]}, 'merge');
  pruefe('Import mit Fotos gelingt', impF.status === 200, JSON.stringify(impF.inhalt));
  const mitF = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Mit Fokus');
  const ohneF = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Ohne Fokus');
  pruefe('Eingespielter Fokuspunkt kommt an',
    mitF.mainPhoto.focus_x === 30 && mitF.mainPhoto.focus_y === 90);
  pruefe('Ältere Exportdatei ohne Fokuspunkt landet in der Mitte',
    ohneF.mainPhoto.focus_x === 50 && ohneF.mainPhoto.focus_y === 50);
  await ruf('DELETE', `/api/items/${mitF.id}`);
  await ruf('DELETE', `/api/items/${ohneF.id}`);

  /* ---------------------------------------------------------------- */
  gruppe('Berichte und angepinnte Kommentare');

  const km = (await ruf('POST', '/api/items', { title: 'Kommentarprobe' })).inhalt;
  const schreib = async (text, felder = {}) => {
    const fd = { text, ...felder };
    return (await sendeKommentar(km.id, fd)).inhalt;
  };
  // Reihenfolge des Anlegens: N1, B1, N2, B2, B3 -- verschraenkt, damit sich
  // zeigt, dass die Gruppen die Chronologie zerreissen. Innerhalb einer Gruppe
  // folgt die Anzeige ihr dagegen genau: aelteste zuerst.
  // Drei Berichte, nicht zwei: bei zwei Elementen ist jede falsche Sortierung
  // nur eine Umkehrung, erst das dritte belegt eine echte Ordnung.
  await schreib('Notiz eins');
  await schreib('Bericht eins', { kind: 'report' });
  await schreib('Notiz zwei');
  await schreib('Bericht zwei', { kind: 'report' });
  let kmDetail = await schreib('Bericht drei', { kind: 'report' });

  const reihe = () => kmDetail.comments.map(c => c.text);
  pruefe('Berichte stehen über den Notizen, in beiden Gruppen älteste zuerst',
    gleich(reihe(), ['Bericht eins', 'Bericht zwei', 'Bericht drei', 'Notiz eins', 'Notiz zwei']),
    JSON.stringify(reihe()));
  pruefe('Die Art kommt mit',
    kmDetail.comments.find(c => c.text === 'Bericht eins')?.kind === 'report' &&
    kmDetail.comments.find(c => c.text === 'Notiz eins')?.kind === 'note');
  pruefe('Anpinnung ist zunächst überall aus', kmDetail.comments.every(c => c.pinned === false));

  const notizZwei = kmDetail.comments.find(c => c.text === 'Notiz zwei');
  kmDetail = (await ruf('PUT', `/api/comments/${notizZwei.id}`, { pinned: true })).inhalt;
  pruefe('Anpinnen schlägt die Art', reihe()[0] === 'Notiz zwei', JSON.stringify(reihe()));
  pruefe('Der Rest bleibt in seiner Ordnung',
    gleich(reihe().slice(1), ['Bericht eins', 'Bericht zwei', 'Bericht drei', 'Notiz eins']),
    JSON.stringify(reihe()));

  const berichtEins = kmDetail.comments.find(c => c.text === 'Bericht eins');
  kmDetail = (await ruf('PUT', `/api/comments/${berichtEins.id}`, { pinned: true })).inhalt;
  pruefe('Mehrere Angepinnte stehen älteste zuerst',
    gleich(reihe().slice(0, 2), ['Bericht eins', 'Notiz zwei']), JSON.stringify(reihe()));

  // Der Block der Angepinnten ist einer, egal welcher Art -- auch mit drei
  // Stueck entscheidet allein das Alter. Danach wieder loesen, damit die
  // folgenden Pruefungen auf zwei Angepinnten stehen.
  const notizEinsFruh = kmDetail.comments.find(c => c.text === 'Notiz eins');
  kmDetail = (await ruf('PUT', `/api/comments/${notizEinsFruh.id}`, { pinned: true })).inhalt;
  pruefe('Im gemischten Block der Angepinnten zählt nur das Alter',
    gleich(reihe().slice(0, 3), ['Notiz eins', 'Bericht eins', 'Notiz zwei']), JSON.stringify(reihe()));
  kmDetail = (await ruf('PUT', `/api/comments/${notizEinsFruh.id}`, { pinned: false })).inhalt;

  // Die beiden Merkmale sind unabhaengig und frei kombinierbar.
  pruefe('Angepinntes behält seine Art',
    kmDetail.comments.find(c => c.text === 'Bericht eins').kind === 'report' &&
    kmDetail.comments.find(c => c.text === 'Notiz zwei').kind === 'note');
  kmDetail = (await ruf('PUT', `/api/comments/${berichtEins.id}`, { pinned: false })).inhalt;
  pruefe('Losgelöstes fällt zurück in seine Gruppe',
    gleich(reihe(), ['Notiz zwei', 'Bericht eins', 'Bericht zwei', 'Bericht drei', 'Notiz eins']),
    JSON.stringify(reihe()));

  // Merkmale aendern ist keine Textbearbeitung. Beide Merkmale einmal
  // umschalten -- sonst deckt die Pruefung nur eines der beiden ab.
  const notizEins = kmDetail.comments.find(c => c.text === 'Notiz eins');
  kmDetail = (await ruf('PUT', `/api/comments/${notizEins.id}`, { kind: 'report' })).inhalt;
  kmDetail = (await ruf('PUT', `/api/comments/${notizEins.id}`, { kind: 'note' })).inhalt;
  pruefe('Umschalten der Art setzt kein „bearbeitet"',
    !kmDetail.comments.find(c => c.text === 'Notiz eins').updated_at,
    JSON.stringify(kmDetail.comments.find(c => c.text === 'Notiz eins')));
  pruefe('Umschalten der Anpinnung setzt kein „bearbeitet"',
    kmDetail.comments.every(c => !c.updated_at), JSON.stringify(kmDetail.comments.map(c => c.updated_at)));
  const nachText = (await ruf('PUT', `/api/comments/${berichtEins.id}`, { text: 'Bericht eins, neu' })).inhalt;
  pruefe('Textänderung setzt es sehr wohl',
    !!nachText.comments.find(c => c.text === 'Bericht eins, neu').updated_at);
  pruefe('Leerer Text wird weiterhin abgewiesen',
    (await ruf('PUT', `/api/comments/${berichtEins.id}`, { text: '   ' })).status === 400);
  pruefe('Unbekannte Art gilt als Notiz',
    (await ruf('PUT', `/api/comments/${berichtEins.id}`, { kind: 'quatsch' }))
      .inhalt.comments.find(c => /Bericht eins/.test(c.text)).kind === 'note');

  // Eigene Probe fuer die dritte Art, damit die Erwartungen oben unberuehrt
  // bleiben. Angelegt wird verschraenkt: N1, A1, B1, N2, A2, B2, A3 -- drei
  // Aufgaben, weil bei zweien jede falsche Sortierung nur eine Umkehrung
  // ist.
  const ag = (await ruf('POST', '/api/items', { title: 'Aufgabenprobe' })).inhalt;
  const schreibA = async (text, felder = {}) => (await sendeKommentar(ag.id, { text, ...felder })).inhalt;
  await schreibA('Notiz eins');
  await schreibA('Aufgabe eins', { kind: 'task' });
  await schreibA('Bericht eins', { kind: 'report' });
  await schreibA('Notiz zwei');
  await schreibA('Aufgabe zwei', { kind: 'task' });
  await schreibA('Bericht zwei', { kind: 'report' });
  let agD = await schreibA('Aufgabe drei', { kind: 'task' });
  const reiheA = () => agD.comments.map(c => c.text);

  pruefe('Die Art „Aufgabe" kommt in der Datenbank an',
    agD.comments.find(c => c.text === 'Aufgabe eins')?.kind === 'task',
    agD.comments.find(c => c.text === 'Aufgabe eins')?.kind);
  pruefe('Aufgaben stehen über den Berichten, Berichte über den Notizen',
    gleich(reiheA(), ['Aufgabe eins', 'Aufgabe zwei', 'Aufgabe drei',
                      'Bericht eins', 'Bericht zwei', 'Notiz eins', 'Notiz zwei']),
    JSON.stringify(reiheA()));

  // Anpinnen schlaegt auch die Aufgabe: der Block der Angepinnten ist einer.
  const notizZweiA = agD.comments.find(c => c.text === 'Notiz zwei');
  agD = (await ruf('PUT', `/api/comments/${notizZweiA.id}`, { pinned: true })).inhalt;
  pruefe('Eine angepinnte Notiz steht über allen Aufgaben',
    reiheA()[0] === 'Notiz zwei', JSON.stringify(reiheA()));
  agD = (await ruf('PUT', `/api/comments/${notizZweiA.id}`, { pinned: false })).inhalt;

  // Umschalten in beide Richtungen -- sonst deckt die Pruefung nur einen Weg ab.
  const aufgEins = agD.comments.find(c => c.text === 'Aufgabe eins');
  agD = (await ruf('PUT', `/api/comments/${aufgEins.id}`, { kind: 'note' })).inhalt;
  pruefe('Eine zur Notiz zurückgenommene Aufgabe reiht sich nach Alter ein',
    agD.comments.find(c => c.text === 'Aufgabe eins').kind === 'note' &&
    gleich(reiheA(), ['Aufgabe zwei', 'Aufgabe drei', 'Bericht eins', 'Bericht zwei',
                      'Notiz eins', 'Aufgabe eins', 'Notiz zwei']),
    JSON.stringify(reiheA()));
  agD = (await ruf('PUT', `/api/comments/${aufgEins.id}`, { kind: 'task' })).inhalt;
  pruefe('Und wieder zur Aufgabe machen', reiheA()[0] === 'Aufgabe eins', JSON.stringify(reiheA()));
  pruefe('Umschalten auf Aufgabe setzt kein „bearbeitet"',
    !agD.comments.find(c => c.text === 'Aufgabe eins').updated_at);

  // Erledigt: faellt ueber das ELSE zu den Notizen und reiht sich dort nach
  // Alter ein -- kein eigener Zweig in der Sortierregel, das ist Absicht.
  agD = (await ruf('PUT', `/api/comments/${aufgEins.id}`, { kind: 'done' })).inhalt;
  pruefe('Ein erledigtes Todo verlaesst die Spitze',
    reiheA()[0] === 'Aufgabe zwei', JSON.stringify(reiheA()));
  pruefe('Und reiht sich bei den Notizen nach Alter ein',
    gleich(reiheA(), ['Aufgabe zwei', 'Aufgabe drei', 'Bericht eins', 'Bericht zwei',
                      'Notiz eins', 'Aufgabe eins', 'Notiz zwei']),
    JSON.stringify(reiheA()));
  pruefe('Die Art bleibt dabei erhalten, es wird keine Notiz daraus',
    agD.comments.find(c => c.text === 'Aufgabe eins').kind === 'done',
    agD.comments.find(c => c.text === 'Aufgabe eins').kind);
  pruefe('Erledigen setzt kein „bearbeitet"',
    !agD.comments.find(c => c.text === 'Aufgabe eins').updated_at);
  agD = (await ruf('PUT', `/api/comments/${aufgEins.id}`, { kind: 'task' })).inhalt;

  const aufAus = (await ruf('GET', '/api/export?photos=0')).inhalt.items
    .find(i => i.title === 'Aufgabenprobe');
  pruefe('Der Export nennt die Aufgabe als solche',
    aufAus.comments.filter(c => c.kind === 'task').length === 3,
    JSON.stringify(aufAus.comments.map(c => c.kind)));
  await ruf('DELETE', `/api/items/${ag.id}`);
  const aufImp = await sendeImport({ version: 5, title: 'A', items: [{ title: 'Eingespielte Aufgaben',
    comments: [{ text: 'Eine Aufgabe', kind: 'task' },
               { text: 'Etwas Unbekanntes', kind: 'vielleicht' }] }] }, 'merge');
  pruefe('Eine eingespielte Aufgabe bleibt eine', aufImp.status === 200);
  const aufImpE = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Eingespielte Aufgaben');
  const aufImpD = (await ruf('GET', `/api/items/${aufImpE.id}`)).inhalt;
  pruefe('Und behält ihre Art über die Datei hinweg',
    aufImpD.comments.find(c => c.text === 'Eine Aufgabe').kind === 'task',
    aufImpD.comments.find(c => c.text === 'Eine Aufgabe').kind);
  pruefe('Eine unbekannte Art aus der Datei wird zur Notiz',
    aufImpD.comments.find(c => c.text === 'Etwas Unbekanntes').kind === 'note',
    aufImpD.comments.find(c => c.text === 'Etwas Unbekanntes').kind);
  await ruf('DELETE', `/api/items/${aufImpE.id}`);

  const ausK = await ruf('GET', '/api/export?photos=0');
  const ausKm = ausK.inhalt.items.find(i => i.title === 'Kommentarprobe');
  pruefe('Export nennt Art und Anpinnung',
    ausKm.comments.every(c => 'kind' in c && 'pinned' in c) &&
    ausKm.comments.some(c => c.pinned === true), JSON.stringify(ausKm.comments.map(c => [c.kind, c.pinned])));
  await ruf('DELETE', `/api/items/${km.id}`);

  const impK = await sendeImport({ version: 5, title: 'K', items: [{ title: 'Alte Kommentare',
    comments: [{ text: 'Ohne Angaben' }, { text: 'Mit Angaben', kind: 'report', pinned: true }] }] }, 'merge');
  pruefe('Import mit und ohne Angaben gelingt', impK.status === 200 && impK.inhalt.comments === 2);
  const altK = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Alte Kommentare');
  const altKd = (await ruf('GET', `/api/items/${altK.id}`)).inhalt;
  pruefe('Kommentar ohne Angaben gilt als gewöhnliche Notiz',
    altKd.comments.find(c => c.text === 'Ohne Angaben').kind === 'note' &&
    altKd.comments.find(c => c.text === 'Ohne Angaben').pinned === false);
  pruefe('Kommentar mit Angaben behält sie',
    altKd.comments[0].text === 'Mit Angaben' && altKd.comments[0].pinned === true);
  await ruf('DELETE', `/api/items/${altK.id}`);

  /* ---------------------------------------------------------------- */
  gruppe('Bilder in Kommentaren');

  const bk = (await ruf('POST', '/api/items', { title: 'Bildkommentar' })).inhalt;
  const mitBild = await sendeKommentar(bk.id, { text: 'Mit Bild' },
    [{ name: 'foto.png', typ: 'image/png', inhalt: Buffer.from(PNG_BASE64, 'base64') }]);
  pruefe('Kommentar mit Bild wird angelegt',
    mitBild.status === 201 && mitBild.inhalt.comments[0].images.length === 1,
    JSON.stringify(mitBild.inhalt.error || mitBild.inhalt.comments[0]));
  const bild1 = mitBild.inhalt.comments[0].images[0];
  pruefe('Das Bild liefert keine Bytes in der Übersicht mit',
    !('data' in bild1) && !('thumb' in bild1));

  /* ANHAENGEN IST BEARBEITEN, also ist Entfernen es auch. Die ENTSTEHUNG
     dagegen ist keines von beiden: ein frisch angelegter Kommentar traegt kein
     "bearbeitet", auch wenn Bilder mitgekommen sind -- sonst stuende es an
     jedem, der je eines hatte. */
  pruefe('Ein neu angelegter Kommentar mit Bild gilt nicht als bearbeitet',
    mitBild.inhalt.comments[0].updated_at === null,
    JSON.stringify(mitBild.inhalt.comments[0].updated_at));

  const bAntwort = async (id2, abfrage = '') => {
    const a2 = await fetch(`${BASIS}/api/comment-images/${id2}/raw${abfrage}`, { headers: { cookie: cookie } });
    return { status: a2.status, h: Object.fromEntries(a2.headers), bytes: Buffer.from(await a2.arrayBuffer()) };
  };
  const roh = await bAntwort(bild1.id);
  pruefe('Kommentarbild wird als JPEG ausgeliefert', roh.h['content-type'] === 'image/jpeg', roh.h['content-type']);
  pruefe('Es wird neu kodiert, nicht durchgereicht',
    roh.bytes.slice(0, 2).toString('hex') === 'ffd8', roh.bytes.slice(0, 4).toString('hex'));
  pruefe('Auch hier gilt die Sicherheitsregel',
    /default-src 'none'/.test(roh.h['content-security-policy'] || '') &&
    roh.h['x-content-type-options'] === 'nosniff');
  pruefe('Es wird eingebettet, nicht heruntergeladen', /^inline;/.test(roh.h['content-disposition']));
  const klein = await bAntwort(bild1.id, '?size=thumb');
  pruefe('Es gibt ein kleineres Vorschaubild', klein.bytes.length > 0 && klein.bytes.length <= roh.bytes.length,
    `${klein.bytes.length} / ${roh.bytes.length}`);

  // Der entscheidende Unterschied zu den Anhaengen: hier kommt nur Bild rein.
  const keinBild = await sendeKommentar(bk.id, { text: 'Getarnt' },
    [{ name: 'boese.png', typ: 'image/png', inhalt: '<html><script>1</scr' + 'ipt></html>' }]);
  pruefe('Als Bild getarnte Datei wird abgewiesen', keinBild.status === 400,
    `${keinBild.status}: ${JSON.stringify(keinBild.inhalt)}`);
  const nachAbweisung = (await ruf('GET', `/api/items/${bk.id}`)).inhalt;
  pruefe('Dabei entsteht kein halber Kommentar',
    nachAbweisung.comments.length === 1, `${nachAbweisung.comments.length}`);

  const ohneText = await sendeKommentar(bk.id, { text: '  ' },
    [{ name: 'foto.png', typ: 'image/png', inhalt: Buffer.from(PNG_BASE64, 'base64') }]);
  pruefe('Ein Kommentar nur aus Bild wird abgewiesen', ohneText.status === 400);

  const kid = mitBild.inhalt.comments[0].id;
  const nachgereicht = await sendeMultipart(`/api/comments/${kid}/images`, 'images',
    [{ name: 'zwei.png', typ: 'image/png', inhalt: Buffer.from(PNG_BASE64, 'base64') }]);
  pruefe('Bilder lassen sich nachreichen',
    nachgereicht.status === 201 && nachgereicht.inhalt.comments[0].images.length === 2);
  const kNach = nachgereicht.inhalt.comments.find(k2 => k2.id === kid);
  pruefe('Ein nachgereichtes Bild setzt „bearbeitet"',
    !!kNach?.updated_at, JSON.stringify(kNach?.updated_at));
  /* Und ausdruecklich NICHT den Eingriffsvermerk. An diesem Weg kann er gar
     nicht entstehen -- er steht dem Verfasser offen und sonst niemandem. */
  pruefe('Und dabei entsteht kein Eingriffsvermerk',
    kNach?.bilderEntfernt === 0, JSON.stringify(kNach?.bilderEntfernt));

  /* Kein Bild, keine Bearbeitung. Ein eigener Kommentar dafuer, weil der
     obere sein "bearbeitet" schon traegt und die Pruefung dort gar nicht mehr
     scheitern koennte. */
  const ohneBild = await sendeKommentar(bk.id, { text: 'Noch ohne Bild' });
  const ohneBildId = ohneBild.inhalt.comments.find(k2 => k2.text === 'Noch ohne Bild')?.id;
  const leerNach = await sendeMultipart(`/api/comments/${ohneBildId}/images`, 'images', []);
  const kLeer = leerNach.inhalt.comments?.find(k2 => k2.id === ohneBildId);
  pruefe('Ein Ruf ohne Datei setzt kein „bearbeitet"',
    !!kLeer && kLeer.updated_at === null && kLeer.images.length === 0,
    JSON.stringify([leerNach.status, kLeer?.updated_at, kLeer?.images.length]));

  const zuViele = await sendeMultipart(`/api/comments/${kid}/images`, 'images',
    Array.from({ length: 6 }, (_, i) => ({ name: `x${i}.png`, typ: 'image/png',
      inhalt: Buffer.from(PNG_BASE64, 'base64') })));
  pruefe('Mehr als sechs Bilder werden abgewiesen', zuViele.status === 400, `${zuViele.status}`);

  const bilderVorher = (await ruf('GET', `/api/items/${bk.id}`)).inhalt.comments[0].images;
  const nachWeg = (await ruf('DELETE', `/api/comment-images/${bilderVorher[0].id}`)).inhalt;
  pruefe('Einzelnes Bild lässt sich entfernen', nachWeg.comments[0].images.length === 1);
  pruefe('Sortiernummern bleiben lückenlos', nachWeg.comments[0].images[0].sort_order === 0);
  /* Der Verfasser raeumt bei sich auf -- ein Vermerk entsteht dabei
     ausdruecklich nicht. Die andere Haelfte derselben Regel ("das setzt
     bearbeitet") steht bei den Rechten an Kommentaren: dort laesst sich der
     Ausgangswert von Hand leeren, hier traegt der Kommentar sein "bearbeitet"
     vom Nachreichen schon, und die Pruefung koennte gar nicht scheitern
     (Stolperstein 60). */
  const kWeg = nachWeg.comments.find(k2 => k2.id === kid);
  pruefe('Räumt der Verfasser bei sich auf, entsteht auch hier kein Vermerk',
    kWeg?.bilderEntfernt === 0, JSON.stringify(kWeg?.bilderEntfernt));
  pruefe('Entferntes Bild ist nicht mehr abrufbar',
    (await bAntwort(bilderVorher[0].id)).status === 404);

  const ausB = await ruf('GET', '/api/export?photos=0');
  const ausBk = ausB.inhalt.items.find(i => i.title === 'Bildkommentar');
  pruefe('Ohne Dateischalter kommen keine Kommentarbilder mit',
    ausBk.comments[0].images.length === 0);
  const ausB2 = await ruf('GET', '/api/export?photos=0&files=1');
  const ausBk2 = ausB2.inhalt.items.find(i => i.title === 'Bildkommentar');
  pruefe('Mit Dateischalter kommen sie mit',
    ausBk2.comments[0].images.length === 1 && !!ausBk2.comments[0].images[0].data_base64);

  await ruf('DELETE', `/api/comments/${kid}`);
  pruefe('Mit dem Kommentar verschwinden seine Bilder',
    (await bAntwort(bilderVorher[1].id)).status === 404);

  const impB = await sendeImport({ version: 5, title: 'B', items: [{ title: 'Eingespielt mit Bild',
    comments: [{ text: 'Hat ein Bild', images: [{ filename: 'a.png', data_base64: PNG_BASE64 }] }] }] }, 'merge');
  pruefe('Import spielt Kommentarbilder ein', impB.status === 200);
  const impItem = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Eingespielt mit Bild');
  const impDet = (await ruf('GET', `/api/items/${impItem.id}`)).inhalt;
  pruefe('Eingespieltes Bild hängt am richtigen Kommentar',
    impDet.comments[0].images.length === 1, JSON.stringify(impDet.comments[0]));
  await ruf('DELETE', `/api/items/${impItem.id}`);
  await ruf('DELETE', `/api/items/${bk.id}`);

  /* ---------------------------------------------------------------- */
  gruppe('Anhänge: Auslieferung (Sicherheitsregel)');

  const at = (await ruf('POST', '/api/items', { title: 'Anhangprobe' })).inhalt;

  // Die schaerfste Probe: eine echte HTML-Seite mit Skript, hochgeladen mit
  // dem Typ text/html. Wird sie je als Webseite ausgeliefert, ist die Regel
  // gebrochen.
  const boese = '<html><body><script>document.write("AUSGEFUEHRT")</scr' + 'ipt></body></html>';
  const hoch = await sendeDateien(at.id, [
    { name: 'boese.html', typ: 'text/html', inhalt: boese },
    { name: 'auch.svg', typ: 'image/svg+xml', inhalt: '<svg xmlns="http://www.w3.org/2000/svg"><script>1</scr' + 'ipt></svg>' },
    { name: 'notiz.txt', typ: 'text/plain', inhalt: 'Zeile eins\nZeile zwei' },
    { name: 'bild.png', typ: 'image/png', inhalt: Buffer.from(PNG_BASE64, 'base64') },
    { name: 'egal.bin', typ: 'application/x-msdownload', inhalt: 'MZ irgendwas' }
  ]);
  pruefe('Dateien lassen sich anhängen', hoch.status === 201 && hoch.inhalt.attachments.length === 5,
    JSON.stringify(hoch.inhalt.error || (hoch.inhalt.attachments || []).length));

  const nachName = {};
  for (const a2 of hoch.inhalt.attachments) nachName[a2.filename] = a2;

  const kopf = async (id, abfrage = '') => {
    const a2 = await fetch(`${BASIS}/api/attachments/${id}/raw${abfrage}`, { headers: { cookie: cookie } });
    return { status: a2.status, h: Object.fromEntries(a2.headers), text: await a2.text() };
  };

  const html = await kopf(nachName['boese.html'].id);
  pruefe('HTML wird NICHT als text/html ausgeliefert',
    html.h['content-type'] === 'application/octet-stream', html.h['content-type']);
  pruefe('HTML wird als Download ausgeliefert',
    /^attachment;/.test(html.h['content-disposition']), html.h['content-disposition']);
  pruefe('HTML bleibt auch mit inline=1 ein Download',
    /^attachment;/.test((await kopf(nachName['boese.html'].id, '?inline=1')).h['content-disposition']));
  pruefe('nosniff ist gesetzt', html.h['x-content-type-options'] === 'nosniff');
  pruefe('Sicherheitsregel verbietet jede Ausführung',
    /default-src 'none'/.test(html.h['content-security-policy'] || '') &&
    /sandbox/.test(html.h['content-security-policy'] || ''), html.h['content-security-policy']);
  pruefe('Der Inhalt selbst kommt unverändert an', html.text === boese);

  const svg = await kopf(nachName['auch.svg'].id, '?inline=1');
  pruefe('SVG wird nie als image/svg+xml ausgeliefert',
    svg.h['content-type'] === 'application/octet-stream', svg.h['content-type']);
  pruefe('SVG bleibt ein Download', /^attachment;/.test(svg.h['content-disposition']));
  pruefe('SVG bekommt keine Vorschau', nachName['auch.svg'].preview === 'keine');

  const png = await kopf(nachName['bild.png'].id, '?inline=1');
  pruefe('Bild darf eingebettet werden',
    png.h['content-type'] === 'image/png' && /^inline;/.test(png.h['content-disposition']),
    `${png.h['content-type']} / ${png.h['content-disposition']}`);
  pruefe('Bild ohne inline=1 bleibt ein Download',
    /^attachment;/.test((await kopf(nachName['bild.png'].id)).h['content-disposition']));
  pruefe('Auch das Bild bekommt die Sicherheitsregel',
    /sandbox/.test(png.h['content-security-policy'] || ''));
  pruefe('Das Bild darf trotzdem kein Skript ausführen',
    !/allow-scripts/.test(png.h['content-security-policy'] || ''),
    png.h['content-security-policy']);

  // PDF ist die eine bewusste Ausnahme: ohne allow-scripts bleibt der
  // eingebaute Betrachter leer. allow-same-origin bleibt aber verboten.
  const pdfDatei = await sendeDateien(at.id, [
    { name: 'doku.pdf', typ: 'application/pdf', inhalt: '%PDF-1.4 kein echtes PDF' }]);
  const pdfA = pdfDatei.inhalt.attachments.find(x => x.filename === 'doku.pdf');
  const pdfK = await kopf(pdfA.id, '?inline=1');
  pruefe('PDF darf eingebettet werden',
    pdfK.h['content-type'] === 'application/pdf' && /^inline;/.test(pdfK.h['content-disposition']));
  pruefe('PDF bekommt allow-scripts, sonst bliebe der Betrachter leer',
    /sandbox allow-scripts/.test(pdfK.h['content-security-policy'] || ''),
    pdfK.h['content-security-policy']);
  pruefe('PDF bekommt NICHT allow-same-origin',
    !/allow-same-origin/.test(pdfK.h['content-security-policy'] || ''),
    pdfK.h['content-security-policy']);
  pruefe('PDF lädt weiterhin nichts nach',
    /default-src 'none'/.test(pdfK.h['content-security-policy'] || ''));
  pruefe('Die Lockerung gilt nur für PDF',
    anh.sicherheitsRegel('text/plain') === "default-src 'none'; sandbox" &&
    anh.sicherheitsRegel('image/png') === "default-src 'none'; sandbox" &&
    anh.sicherheitsRegel('application/octet-stream') === "default-src 'none'; sandbox");
  pruefe('PDF ohne inline=1 bleibt ein Download',
    /^attachment;/.test((await kopf(pdfA.id)).h['content-disposition']));

  const bin = await kopf(nachName['egal.bin'].id);
  pruefe('Unbekanntes wird octet-stream', bin.h['content-type'] === 'application/octet-stream');
  pruefe('Der gemeldete Typ des Hochladenden wird nie ausgeliefert',
    nachName['egal.bin'].mime_type === 'application/x-msdownload' &&
    bin.h['content-type'] === 'application/octet-stream');

  // Dateiname mit Zeilenumbruch. Ueber den Multipart-Koerper kommt so
  // etwas gar nicht erst an -- der Header endet am Zeilenumbruch. Der
  // wirkliche Weg fuehrt ueber den Import, wo ein solcher Name im JSON
  // problemlos steht. Genau der wird hier geprueft.
  const boeserName = 'a"b\r\nX-Eingeschleust: ja.txt';
  await sendeImport({ version: 5, title: 'B', items: [{ title: 'Boeser Name',
    attachments: [{ filename: boeserName, mime_type: 'text/plain',
                    data_base64: Buffer.from('harmlos').toString('base64') }] }] }, 'merge');
  const bnItem = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Boeser Name');
  const bnDet = (await ruf('GET', `/api/items/${bnItem.id}`)).inhalt;
  pruefe('Steuerzeichen im Namen erreichen die Datenbank',
    /\r\n/.test(bnDet.attachments[0].filename), JSON.stringify(bnDet.attachments[0].filename));
  const kopfBoese = await kopf(bnDet.attachments[0].id);
  pruefe('Trotzdem keine eingeschleuste Header',
    kopfBoese.h['x-eingeschleust'] === undefined, JSON.stringify(kopfBoese.h['x-eingeschleust']));
  pruefe('Header bleibt wohlgeformt',
    /^attachment; filename="[^"]*"; filename\*=UTF-8''/.test(kopfBoese.h['content-disposition']),
    kopfBoese.h['content-disposition']);
  // Express haengt an Text-Typen von sich aus ein charset an -- deshalb auf
  // den Anfang pruefen, nicht auf Gleichheit.
  pruefe('Und die Auslieferung bleibt ein Download',
    /^text\/plain\b/.test(kopfBoese.h['content-type']) &&
    /^attachment;/.test(kopfBoese.h['content-disposition']),
    `${kopfBoese.h['content-type']} / ${kopfBoese.h['content-disposition']}`);
  await ruf('DELETE', `/api/items/${bnItem.id}`);

  // Pfadangaben: sowohl beim Hochladen als auch beim Import.
  const pfadName = await sendeDateien(at.id, [
    { name: '../../etc/passwd', typ: 'text/plain', inhalt: 'x' }
  ]);
  pruefe('Pfadangaben beim Hochladen werden abgeschnitten',
    pfadName.inhalt.attachments.some(x => x.filename === 'passwd'),
    JSON.stringify(pfadName.inhalt.attachments.map(x => x.filename)));
  await sendeImport({ version: 5, title: 'P', items: [{ title: 'Pfadname',
    attachments: [{ filename: '../../../etc/shadow', mime_type: 'text/plain',
                    data_base64: Buffer.from('x').toString('base64') }] }] }, 'merge');
  const pfItem = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Pfadname');
  const pfDet = (await ruf('GET', `/api/items/${pfItem.id}`)).inhalt;
  pruefe('Pfadangaben beim Import werden abgeschnitten',
    pfDet.attachments[0].filename === 'shadow', pfDet.attachments[0].filename);
  await ruf('DELETE', `/api/items/${pfItem.id}`);

  /* ---------------------------------------------------------------- */
  gruppe('Fotos: Auslieferung (Sicherheitsregel)');

  /* Dieselbe Regel wie bei den Anhaengen, nur an einem Weg, der sie lange
     nicht hatte: der gemeldete Typ des Hochladenden wird gespeichert und
     angezeigt, aber NIE ausgeliefert.
     ZWEI SCHICHTEN, und beide werden hier einzeln belegt:
       Beim Hochladen faellt alles heraus, was kein Rasterbild IST -- geprueft
       am Ergebnis (sharp metadata), nicht an der Angabe.
       Beim Ausliefern entscheiden die ersten Bytes. Das schuetzt auch, was
       schon vor dieser Regel in der Datenbank lag, und dafuer steht die
       Bestandsprobe weiter unten: sie schreibt eine SVG an sharp vorbei
       hinein, so wie sie eine alte Anlage haette. */
  const fo = (await ruf('POST', '/api/items', { title: 'Fotoprobe' })).inhalt;
  const SVG_BOESE = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8">' +
    '<scr' + 'ipt>document.title="AUSGEFUEHRT"</scr' + 'ipt><rect width="8" height="8"/></svg>';

  const svgHoch = await sendeMultipart(`/api/items/${fo.id}/photos`, 'photos',
    [{ name: 'boese.svg', typ: 'image/svg+xml', inhalt: SVG_BOESE }]);
  pruefe('Eine SVG wird als Foto abgewiesen', svgHoch.status === 400,
    `${svgHoch.status}: ${JSON.stringify(svgHoch.inhalt)}`);
  // Erst das Vorhandensein, dann die Eigenschaft: ohne den Erfolgsfall daneben
  // bliebe die Abweisung auch dann gruen, wenn gar nichts mehr hochladbar
  // waere (Stolperstein 81).
  const pngHoch = await sendeMultipart(`/api/items/${fo.id}/photos`, 'photos',
    [{ name: 'gut.png', typ: 'image/png', inhalt: Buffer.from(PNG_BASE64, 'base64') }]);
  pruefe('Ein echtes PNG geht durch', pngHoch.status === 201 && pngHoch.inhalt.photos.length >= 1,
    `${pngHoch.status}: ${JSON.stringify(pngHoch.inhalt?.error)}`);
  // Die Nachschau: die abgewiesene Datei ist auch wirklich nicht angekommen.
  const foNach = (await ruf('GET', `/api/items/${fo.id}`)).inhalt;
  pruefe('Die abgewiesene SVG steht in keiner Zeile', foNach.photos.length === 1,
    `${foNach.photos.length} Foto(s)`);

  const fAntwort = async (id2, abfrage = '') => {
    const a2 = await fetch(`${BASIS}/api/photos/${id2}/raw${abfrage}`, { headers: { cookie: cookie } });
    return { status: a2.status, h: Object.fromEntries(a2.headers), bytes: Buffer.from(await a2.arrayBuffer()) };
  };
  const fPng = await fAntwort(foNach.photos[0].id);
  pruefe('Ein Rasterbild wird mit seinem eigenen Typ ausgeliefert',
    fPng.h['content-type'] === 'image/png', fPng.h['content-type']);
  pruefe('Und darf eingebettet werden', /^inline;/.test(fPng.h['content-disposition'] || ''),
    fPng.h['content-disposition']);
  pruefe('nosniff steht auch am Foto', fPng.h['x-content-type-options'] === 'nosniff');
  pruefe('Auch das Foto bekommt die Sicherheitsregel',
    /default-src 'none'/.test(fPng.h['content-security-policy'] || '') &&
    /sandbox/.test(fPng.h['content-security-policy'] || ''), fPng.h['content-security-policy']);
  pruefe('Das Foto darf kein Skript ausfuehren',
    !/allow-scripts/.test(fPng.h['content-security-policy'] || ''), fPng.h['content-security-policy']);
  const fThumb = await fAntwort(foNach.photos[0].id, '?size=thumb');
  pruefe('Das Vorschaubild kommt als JPEG', fThumb.h['content-type'] === 'image/jpeg',
    fThumb.h['content-type']);
  pruefe('Und es sind wirklich JPEG-Bytes', fThumb.bytes.slice(0, 2).toString('hex') === 'ffd8',
    fThumb.bytes.slice(0, 4).toString('hex'));

  /* BESTANDSDATEN. Eine SVG, die vor dieser Version hereinkam: an der
     Hochladepruefung vorbei direkt in die Tabelle, mit genau dem gemeldeten
     Typ, den der alte Weg ausgeliefert haette. Ohne diese Probe belegte die
     Abweisung oben nur, dass nichts NEUES hineinkommt. */
  {
    const d = oeffne(path.join(DATA, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    d.prepare('INSERT INTO photos (item_id, mime_type, data, sort_order) VALUES (?, ?, ?, ?)')
      .run(fo.id, 'image/svg+xml', Buffer.from(SVG_BOESE, 'utf8'), 99);
    d.close();
  }
  const foMitAlt = (await ruf('GET', `/api/items/${fo.id}`)).inhalt;
  const altSvg = foMitAlt.photos.find(x => x.mime_type === 'image/svg+xml');
  pruefe('Die Bestandszeile ist da und wird weiter angezeigt', !!altSvg,
    JSON.stringify(foMitAlt.photos.map(x => x.mime_type)));
  const fSvg = altSvg ? await fAntwort(altSvg.id) : null;
  pruefe('Eine SVG aus dem Bestand geht NIE als image/svg+xml heraus',
    !!fSvg && fSvg.h['content-type'] === 'application/octet-stream', fSvg?.h['content-type']);
  pruefe('Sie wird heruntergeladen statt angezeigt',
    !!fSvg && /^attachment;/.test(fSvg.h['content-disposition'] || ''), fSvg?.h['content-disposition']);
  /* Die Kontrolle am AUSGELIEFERTEN BYTESTROM. Eine Pruefung, die nur die
     Header ansieht, belegt nicht, was tatsaechlich herausgeht: der Inhalt
     ist unveraendert die SVG samt Skript -- gefaehrlich waere allein, dass der
     Browser sie als Webseite liest, und genau das verhindert der Header. */
  pruefe('Der Bytestrom ist unveraendert die SVG',
    !!fSvg && fSvg.bytes.toString('utf8') === SVG_BOESE,
    fSvg ? fSvg.bytes.slice(0, 40).toString('utf8') : '');
  pruefe('Und der gespeicherte Typ steht weiter in der Anzeige',
    altSvg?.mime_type === 'image/svg+xml', altSvg?.mime_type);
  await ruf('DELETE', `/api/items/${fo.id}`);


  /* ---------------------------------------------------------------- */
  gruppe('Videos am Fotoplatz');

  /* DIESELBE TABELLE, KEINE ZWEITE. Ein Video steht in derselben Reihe wie die
     Fotos -- daraus folgt, dass Reihenfolge, Kaskade, Fokuspunkt und
     Verschluesselung von selbst greifen. Was NICHT von selbst greift, steht
     weiter unten: Loeschdialog, Kennzahlen und die Auslieferung.
     DIE PRUEFLAGE TRAEGT BEIDES, und das Video ausdruecklich NICHT an erster
     Stelle: nur so lassen sich Hauptbild und Abspielzeichen unabhaengig
     voneinander belegen. */
  const vi = (await ruf('POST', '/api/items', { title: 'Videoprobe' })).inhalt;
  await sendeMultipart(`/api/items/${vi.id}/photos`, 'photos',
    [{ name: 'eins.png', typ: 'image/png', inhalt: Buffer.from(PNG_BASE64, 'base64') }]);
  const vHoch = await sendeVideo(vi.id, { dauer: 42 });
  pruefe('Ein echtes MP4 mit Standbild geht durch', vHoch.status === 201,
    `${vHoch.status}: ${JSON.stringify(vHoch.inhalt?.error)}`);
  // Erst das Vorhandensein, dann die Eigenschaft (Stolperstein 81): ohne die
  // Zeile belegte alles Weitere nichts.
  pruefe('Der Eintrag traegt jetzt zwei Zeilen, Foto und Video',
    vHoch.inhalt?.photos?.length === 2, JSON.stringify(vHoch.inhalt?.photos?.length));
  const vFoto = vHoch.inhalt?.photos?.[0], vVideo = vHoch.inhalt?.photos?.[1];

  /* ZU JEDEM FELD, DAS DIE OBERFLAECHE LIEST, EINE PRUEFUNG AN DER ECHTEN
     ANTWORT (Stolperstein 102): woran sie ein Video erkennt, ist allein art. */
  pruefe('Die Videozeile nennt ihre Art und ihre Dauer',
    vVideo?.art === 'video' && vVideo?.dauer === 42,
    JSON.stringify({ art: vVideo?.art, dauer: vVideo?.dauer }));
  pruefe('Die Fotozeile daneben nennt bild und keine Dauer',
    vFoto?.art === 'bild' && vFoto?.dauer === null,
    JSON.stringify({ art: vFoto?.art, dauer: vFoto?.dauer }));
  pruefe('Das Video haengt sich hinten an, in derselben Nummerierung',
    vFoto?.sort_order === 0 && vVideo?.sort_order === 1,
    JSON.stringify([vFoto?.sort_order, vVideo?.sort_order]));

  /* DER INHALT ENTSCHEIDET, nicht die Endung im Namen. Beide Richtungen, sonst
     belegte die eine nichts ueber die andere. */
  const vFalscheEndung = await sendeVideo(vi.id, { name: 'gar-kein-video.txt' });
  pruefe('Videobytes unter falscher Endung kommen trotzdem herein',
    vFalscheEndung.status === 201, `${vFalscheEndung.status}: ${JSON.stringify(vFalscheEndung.inhalt?.error)}`);
  const vBildBytes = await sendeVideo(vi.id, { video: Buffer.from(PNG_BASE64, 'base64') });
  pruefe('Bildbytes unter Videoendung dagegen nicht', vBildBytes.status === 400,
    `${vBildBytes.status}: ${JSON.stringify(vBildBytes.inhalt)}`);
  const vWebm = await sendeVideo(vi.id, { video: WEBM(), name: 'clip.webm', typ: 'video/webm', dauer: 7 });
  pruefe('Eine echte WebM geht ebenfalls durch', vWebm.status === 201,
    `${vWebm.status}: ${JSON.stringify(vWebm.inhalt?.error)}`);

  // Das Standbild geht denselben Weg wie jedes Foto: was sharp nicht als Bild
  // lesen kann, kommt nicht herein.
  const vOhneSb = await sendeVideo(vi.id, { ohneStandbild: true });
  pruefe('Ohne Standbild kein Video', vOhneSb.status === 400,
    `${vOhneSb.status}: ${JSON.stringify(vOhneSb.inhalt)}`);
  const vKaputtesSb = await sendeVideo(vi.id, { standbild: Buffer.from('kein Bild, nur Text') });
  pruefe('Ein unlesbares Standbild wird abgewiesen', vKaputtesSb.status === 400,
    `${vKaputtesSb.status}: ${JSON.stringify(vKaputtesSb.inhalt)}`);
  // Die grobe erste Schranke am gemeldeten Typ, wie am Fotoweg.
  const vFalschesFeld = await sendeVideo(vi.id, { typ: 'text/plain' });
  pruefe('Ein Feld, das sich nicht als Video meldet, faellt schon vor multer',
    vFalschesFeld.status === 400, `${vFalschesFeld.status}`);
  // Die Grenze steht an genau einer Stelle im Server; hier wird sie gereizt.
  const vZuGross = await sendeVideo(vi.id,
    { video: Buffer.concat([MP4(), Buffer.alloc(20 * 1024 * 1024)]) });
  pruefe('Ein Video ueber 20 MB wird abgewiesen', vZuGross.status === 400,
    `${vZuGross.status}: ${JSON.stringify(vZuGross.inhalt)}`);

  // Die Nachschau: die abgewiesenen Vorgaenge sind auch wirklich nicht
  // angekommen. Durch sollen genau vier Zeilen sein -- Foto, MP4, MP4 unter
  // falscher Endung, WebM.
  const vStand = (await ruf('GET', `/api/items/${vi.id}`)).inhalt;
  pruefe('Nur die vier gueltigen Zeilen stehen da',
    vStand.photos.length === 4 &&
    gleich(vStand.photos.map(p2 => p2.art), ['bild', 'video', 'video', 'video']),
    JSON.stringify(vStand.photos.map(p2 => p2.art)));

  /* REIHENFOLGE, KASKADE UND LOESCHEN GELTEN VON SELBST -- sie arbeiten auf
     Zeilen, nicht auf Arten. Belegt statt behauptet: umsortieren, loeschen,
     und die Nummerierung bleibt lueckenlos. */
  /* JEDE LESESTELLE ABGEFANGEN (Stolperstein 103): kam oben nichts herein,
     werden die Pruefungen hier rot, statt den Lauf abzureissen und KEINEN
     Namen zu nennen. Genau das hat eine Gegenprobe dieser Runde ausgeloest. */
  const vIds = vStand.photos.map(p2 => p2.id);
  const vNeu = [vIds[1], vIds[0], vIds[2], vIds[3]].filter(x => x !== undefined);
  const vSort = await ruf('PUT', `/api/items/${vi.id}/photo-order`, { order: vNeu });
  pruefe('Ein Video laesst sich vor ein Foto ziehen',
    vSort.inhalt?.photos?.[0]?.art === 'video' && vSort.inhalt?.photos?.[1]?.art === 'bild',
    JSON.stringify(vSort.inhalt?.photos?.map(p2 => p2.art)));
  if (vIds[2] !== undefined) await ruf('DELETE', `/api/photos/${vIds[2]}`);
  const vNachWeg = (await ruf('GET', `/api/items/${vi.id}`)).inhalt;
  pruefe('Nach dem Loeschen bleibt die Nummerierung lueckenlos',
    gleich(vNachWeg.photos.map(p2 => p2.sort_order), [0, 1, 2]),
    JSON.stringify(vNachWeg.photos.map(p2 => p2.sort_order)));
  // Der Fokuspunkt wirkt am Standbild und braucht keine eigene Regel.
  const vFokus = await ruf('PUT', `/api/photos/${vNachWeg.photos[0]?.id}/focus`, { x: 20, y: 80 });
  pruefe('Der Ausschnitt laesst sich auch am Video festlegen',
    vFokus.inhalt?.photos?.[0]?.focus_x === 20 && vFokus.inhalt?.photos?.[0]?.focus_y === 80,
    JSON.stringify([vFokus.inhalt?.photos?.[0]?.focus_x, vFokus.inhalt?.photos?.[0]?.focus_y]));

  /* DER LOESCHDIALOG WEIST VIDEOS GETRENNT AUS. Ein Dialog, der "3 Fotos"
     sagt und dabei ein Video mit wegwirft, verschweigt genau die Zeile, um
     derentwillen er dasteht. */
  const vBestand = (await ruf('GET', `/api/items/${vi.id}/bestand`)).inhalt;
  pruefe('Der Loeschdialog zaehlt Fotos und Videos getrennt',
    vBestand?.fotos === 1 && vBestand?.videos === 2,
    JSON.stringify({ fotos: vBestand?.fotos, videos: vBestand?.videos }));

  // Und dieselbe Trennung in der Uebersicht: mainPhoto ist die erste Zeile,
  // gleich welcher Art -- hier also das Standbild eines Videos.
  const vListe = (await ruf('GET', '/api/items')).inhalt.find(x => x.id === vi.id);
  pruefe('Die Uebersicht zaehlt ebenfalls getrennt',
    vListe?.photoCount === 1 && vListe?.videoCount === 2,
    JSON.stringify({ photoCount: vListe?.photoCount, videoCount: vListe?.videoCount }));
  pruefe('Und das erste Element ist das Hauptbild, auch wenn es ein Video ist',
    vListe?.mainPhoto?.art === 'video', JSON.stringify(vListe?.mainPhoto?.art));

  /* DIE KENNZAHLEN. photoCount und photoBytes behalten ihre Bedeutung -- sie
     zaehlen Fotos -- und bekommen Nachbarn. Zusammengezaehlt laese eine
     aeltere Oberflaeche sie falsch. */
  const vStats = (await ruf('GET', '/api/stats')).inhalt;
  pruefe('Die Kennzahlen nennen Videos mit eigener Zahl und eigener Groesse',
    vStats?.videoCount >= 2 && vStats?.videoBytes >= MP4().length + WEBM().length,
    JSON.stringify({ videoCount: vStats?.videoCount, videoBytes: vStats?.videoBytes }));
  {
    // Gegenprobe zur Bedeutung: die Fotozahl darf die Videos NICHT enthalten.
    const d = oeffne(path.join(DATA, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    const nBild = d.prepare("SELECT COUNT(*) n FROM photos WHERE art != 'video'").get().n;
    const nVideo = d.prepare("SELECT COUNT(*) n FROM photos WHERE art = 'video'").get().n;
    d.close();
    pruefe('photoCount zaehlt weiterhin nur Fotos',
      vStats?.photoCount === nBild && vStats?.videoCount === nVideo,
      `${vStats?.photoCount}/${nBild} Fotos, ${vStats?.videoCount}/${nVideo} Videos`);
  }

  /* ---------------------------------------------------------------- */
  gruppe('Videos: Auslieferung (Sicherheitsregel)');

  /* DIESELBE SCHAERFE WIE BEI DER SVG-PROBE. Angesehen wird nicht nur die
     Header, sondern der ausgelieferte BYTESTROM -- eine Pruefung, die nur
     den Kopf liest, belegt nicht, was herausgeht (Stolperstein 98).
     UND DER TYP KOMMT AUS DEN ERSTEN BYTES, nie aus photos.mime_type: die
     Spalte ist eine Angabe des Hochladenden. */
  const vAntwort = async (id2, abfrage = '', header = {}) => {
    const a2 = await fetch(`${BASIS}/api/photos/${id2}/raw${abfrage}`,
      { headers: { cookie: cookie, ...header } });
    return { status: a2.status, h: Object.fromEntries(a2.headers),
             bytes: Buffer.from(await a2.arrayBuffer()) };
  };
  const vAus = (await ruf('GET', `/api/items/${vi.id}`)).inhalt;
  const vMp4Id = vAus.photos.find(p2 => p2.art === 'video')?.id;
  const vBildId = vAus.photos.find(p2 => p2.art === 'bild')?.id;
  pruefe('Es gibt eine Videozeile und eine Fotozeile zum Vergleich',
    !!vMp4Id && !!vBildId, JSON.stringify(vAus.photos.map(p2 => `${p2.id}:${p2.art}`)));

  // Abgefangen wie jede Lesestelle: fehlt die Zeile, werden die Pruefungen
  // darunter rot, statt den Lauf abzureissen (Stolperstein 103).
  const vLeer = { status: 0, h: {}, bytes: Buffer.alloc(0) };
  const vRaw = vMp4Id ? await vAntwort(vMp4Id) : vLeer;
  pruefe('Ein MP4 wird als video/mp4 ausgeliefert', vRaw.h['content-type'] === 'video/mp4',
    vRaw.h['content-type']);
  pruefe('Und darf eingebettet werden -- sonst spielte es nicht, sondern liefe herunter',
    /^inline;/.test(vRaw.h['content-disposition'] || ''), vRaw.h['content-disposition']);
  pruefe('Der Name traegt die Endung des ERKANNTEN Typs',
    /filename="foto-\d+\.mp4"/.test(vRaw.h['content-disposition'] || ''), vRaw.h['content-disposition']);
  pruefe('nosniff steht auch am Video', vRaw.h['x-content-type-options'] === 'nosniff');
  pruefe('Auch das Video bekommt die Sicherheitsregel',
    /default-src 'none'/.test(vRaw.h['content-security-policy'] || '') &&
    /sandbox/.test(vRaw.h['content-security-policy'] || ''), vRaw.h['content-security-policy']);
  pruefe('Das Video darf kein Skript ausfuehren',
    !/allow-scripts/.test(vRaw.h['content-security-policy'] || ''), vRaw.h['content-security-policy']);
  pruefe('Der Bytestrom ist unveraendert die hochgeladene Datei',
    vRaw.bytes.equals(MP4()), `${vRaw.bytes.length} statt ${MP4().length} Bytes`);

  const vWebmId = vAus.photos.find(p2 => p2.art === 'video' && p2.id !== vMp4Id)?.id;
  const vWebmRaw = vWebmId ? await vAntwort(vWebmId) : null;
  pruefe('Eine WebM wird als video/webm ausgeliefert',
    vWebmRaw?.h['content-type'] === 'video/webm', vWebmRaw?.h['content-type']);
  pruefe('Und auch sie kommt bytegleich heraus',
    !!vWebmRaw && vWebmRaw.bytes.equals(WEBM()), `${vWebmRaw?.bytes.length} Bytes`);

  /* MIT GROESSE DAS STANDBILD, OHNE GROESSE DIE VIDEODATEI. Dieselbe Zeile,
     zwei verschiedene Blobs -- und der Erkenner sieht das den Bytes an, ohne
     dass die Route etwas unterscheiden muesste. */
  for (const groesse of ['thumb', 'medium']) {
    const s2 = vMp4Id ? await vAntwort(vMp4Id, `?size=${groesse}`) : vLeer;
    pruefe(`size=${groesse} an einer Videozeile liefert ein Bild`,
      s2.h['content-type'] === 'image/jpeg', s2.h['content-type']);
    pruefe(`Und es sind wirklich JPEG-Bytes (${groesse})`,
      s2.bytes.slice(0, 2).toString('hex') === 'ffd8', s2.bytes.slice(0, 4).toString('hex'));
  }

  /* BEREICHE. Ohne sie kann der Browser im Video nicht springen, und manche
     Abspieler beginnen gar nicht erst. */
  pruefe('Das Video bietet Ranges an', vRaw.h['accept-ranges'] === 'bytes',
    JSON.stringify(vRaw.h['accept-ranges']));
  const vTeil = vMp4Id ? await vAntwort(vMp4Id, '', { range: 'bytes=10-19' }) : vLeer;
  pruefe('Ein Range wird mit 206 beantwortet', vTeil.status === 206, `Status ${vTeil.status}`);
  pruefe('Und er nennt genau die Stelle',
    vTeil.h['content-range'] === `bytes 10-19/${MP4().length}`, vTeil.h['content-range']);
  pruefe('Und liefert genau diese zehn Bytes',
    vTeil.bytes.equals(MP4().slice(10, 20)), vTeil.bytes.toString('hex'));
  const vOffen = vMp4Id ? await vAntwort(vMp4Id, '', { range: 'bytes=1400-' }) : vLeer;
  pruefe('Ein offenes Ende meint das Dateiende',
    vOffen.status === 206 && vOffen.bytes.equals(MP4().slice(1400)),
    `${vOffen.status}, ${vOffen.bytes.length} Bytes`);
  const vSuffix = vMp4Id ? await vAntwort(vMp4Id, '', { range: 'bytes=-16' }) : vLeer;
  pruefe('Und die letzten Bytes lassen sich einzeln holen',
    vSuffix.status === 206 && vSuffix.bytes.equals(MP4().slice(-16)),
    `${vSuffix.status}, ${vSuffix.bytes.length} Bytes`);
  for (const [kopf, was] of [['bytes=20-10', 'Ende vor Anfang'],
                             ['bytes=99999-', 'Anfang hinter dem Dateiende']]) {
    const schlecht = vMp4Id ? await vAntwort(vMp4Id, '', { range: kopf }) : vLeer;
    pruefe(`Ungueltiger Range (${was}) wird mit 416 abgewiesen`, schlecht.status === 416,
      `Status ${schlecht.status}`);
    pruefe(`Und die Antwort nennt die wirkliche Groesse (${was})`,
      schlecht.h['content-range'] === `bytes */${MP4().length}`, schlecht.h['content-range']);
  }

  /* AN DER AUSLIEFERUNG VORHANDENER FOTOS AENDERT DIESE RUNDE NICHTS. Das ist
     keine Nebenbemerkung: der Einspielweg vergleicht der Header eines
     Fotos vor und nach dem Einspielen, und sie muessen gleich sein. */
  const vFotoRaw = vBildId ? await vAntwort(vBildId) : vLeer;
  pruefe('Ein Foto bietet weiterhin KEINE Ranges an',
    vFotoRaw.h['accept-ranges'] === undefined, JSON.stringify(vFotoRaw.h['accept-ranges']));
  const vFotoRange = vBildId ? await vAntwort(vBildId, '', { range: 'bytes=0-3' }) : vLeer;
  pruefe('Und ein Range am Foto wird uebergangen, nicht beantwortet',
    vFotoRange.status === 200 &&
    vFotoRange.bytes.equals(Buffer.from(PNG_BASE64, 'base64')),
    `Status ${vFotoRange.status}, ${vFotoRange.bytes.length} Bytes`);

  /* BESTANDSDATEN UND UNBEKANNTE MARKEN. Eine ISO-Datei mit einer Marke, die
     nicht auf der Liste steht, geht als Download heraus -- nicht abspielbar,
     aber auch nicht eingebettet. Direkt in die Tabelle geschrieben, so wie es
     die SVG-Probe am Fotoweg tut. */
  {
    const d = oeffne(path.join(DATA, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    d.prepare("INSERT INTO photos (item_id, mime_type, data, sort_order, art) VALUES (?, ?, ?, ?, 'video')")
      .run(vi.id, 'video/mp4',
           Buffer.concat([Buffer.from([0, 0, 0, 0x14]), Buffer.from('ftypxyz1', 'latin1'),
                          Buffer.alloc(8)]), 98);
    d.close();
  }
  const vFremd = (await ruf('GET', `/api/items/${vi.id}`)).inhalt.photos.find(p2 => p2.sort_order === 98);
  pruefe('Die Zeile mit der fremden Marke ist da', !!vFremd, 'die Prueflage fehlt');
  const vFremdRaw = vFremd ? await vAntwort(vFremd.id) : null;
  pruefe('Eine unbekannte ISO-Marke geht als application/octet-stream heraus',
    vFremdRaw?.h['content-type'] === 'application/octet-stream', vFremdRaw?.h['content-type']);
  pruefe('Und wird heruntergeladen statt eingebettet',
    /^attachment;/.test(vFremdRaw?.h['content-disposition'] || ''), vFremdRaw?.h['content-disposition']);
  await ruf('DELETE', `/api/items/${vi.id}`);

  /* --- Das Nachruesten der Vorschaubilder geht Videos nichts an -----------
     BEFUND DIESER RUNDE, und er stand im Papier nicht: backfillVariants()
     holt beim Start jede Zeile mit fehlender Kachel und erzeugt beide
     Varianten NEU aus data. An einer Videozeile stuende dort die Videodatei
     -- sharp liefe in einen Fehler, beide Varianten kaemen leer zurueck, und
     ein VORHANDENES Standbild waere danach ueberschrieben. Die Zeile bliebe
     ausserdem bei jedem Start aufs Neue faellig.
     Nachgestellt an der schlimmsten Lage: Kachel da, mittlere Variante leer.
     Und der Kernsatz gilt hier genauso: der Server oeffnet nie ein Video. */
  {
    const bfDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-backfill-'));
    kurzlauf(`require('./db'); console.log('da');`, bfDir);
    {
      const d = oeffne(path.join(bfDir, 'katalog.sqlite'));
      d.prepare("INSERT INTO users (username, password_hash) VALUES ('chefin', 'x')").run();
      d.prepare("INSERT INTO items (title, user_id) VALUES ('Mit Video', 1)").run();
      // Die Videozeile: Kachel vorhanden, mittlere Variante fehlt.
      d.prepare(`INSERT INTO photos (item_id, mime_type, data, thumb, medium, sort_order, art, dauer)
                 VALUES (1, 'video/mp4', ?, ?, NULL, 0, 'video', 9)`)
        .run(MP4(), Buffer.from(PNG_BASE64, 'base64'));
      // Und eine echte Fotozeile ohne beides daneben -- ohne sie bliebe offen,
      // ob das Nachruesten ueberhaupt noch etwas tut (Stolperstein 81).
      d.prepare(`INSERT INTO photos (item_id, mime_type, data, sort_order)
                 VALUES (1, 'image/png', ?, 1)`).run(Buffer.from(PNG_BASE64, 'base64'));
      d.close();
    }
    const BF = starteWeiterenServer(bfDir, {}, 5740);
    await BF.bereit;
    // Das Nachruesten startet 1,5 Sekunden nach dem Zuhoeren und macht je
    // Zeile 30 ms Pause. Gewartet wird auf die Meldung, nicht auf eine Uhr:
    // eine feste Wartezeit waere entweder zu kurz oder verschenkte Zeit.
    for (let i = 0; i < 60 && !/Vorschaubild\(er\) erzeugt/.test(BF.protokoll()); i++)
      await new Promise(r => setTimeout(r, 100));
    await BF.stopp();
    const bfZeilen = (() => {
      const d = oeffne(path.join(bfDir, 'katalog.sqlite'));
      const z = d.prepare('SELECT art, length(thumb) AS t, length(medium) AS m FROM photos ORDER BY sort_order').all();
      d.close();
      return z;
    })();
    pruefe('Die Prueflage traegt beide Zeilen', bfZeilen.length === 2, JSON.stringify(bfZeilen));
    pruefe('Das Standbild des Videos ueberlebt den Start',
      bfZeilen[0]?.art === 'video' && bfZeilen[0]?.t > 0,
      JSON.stringify(bfZeilen[0]));
    pruefe('Und das Nachruesten tut am Foto daneben weiterhin seine Arbeit',
      bfZeilen[1]?.t > 0 && bfZeilen[1]?.m > 0, JSON.stringify(bfZeilen[1]));
    pruefe('Das Protokoll spricht auch von nur einem Foto',
      /Erzeuge Vorschaubilder für 1 Foto\(s\)/.test(BF.protokoll()),
      JSON.stringify((BF.protokoll().match(/Erzeuge Vorschaubilder[^\n]*/) || ['(keine Zeile)'])[0]));
    fs.rmSync(bfDir, { recursive: true, force: true });
  }

  /* ---------------------------------------------------------------- */
  gruppe('Die Sicherheitsregel fuer die Anwendung selbst');

  /* Die Regel greift zweimal fuer denselben Fehler: waere der Typ am Fotoweg
     doch einmal falsch, verboete sie das Ausfuehren trotzdem. Deshalb steht
     sie hier neben der Ableitung und nicht statt ihrer. */
  const cspSeite = await fetch(`${BASIS}/`);
  const cspWert = cspSeite.headers.get('content-security-policy') || '';
  pruefe('Die Seite selbst traegt eine Sicherheitsregel', cspWert.length > 0, cspWert);
  pruefe('Nichts wird von fremden Adressen geladen', /default-src 'self'/.test(cspWert), cspWert);
  /* media-src TRAEGT DIE VIDEOS, und beide Angaben sind noetig.
     'self' erlaubt das Abspielen aus der eigenen Anlage; ohne die Zeile griffe
     dafuer zwar default-src 'self' mit, aber blob: eben nicht -- und blob: ist
     der Weg, auf dem die Oberflaeche das Standbild VOR dem Hochladen zieht.
     Eine blob:-Adresse an einem <video> faellt unter media-src, nicht unter
     img-src. Ohne die Freigabe verwirft der Browser sie WORTLOS, und es
     liesse sich ueberhaupt kein Video hochladen (im echten Chromium
     nachgemessen: "Refused to load media from blob:", MEDIA_ELEMENT_ERROR 4). */
  const mediaTeil = (cspWert.match(/media-src[^;]*/) || [''])[0];
  pruefe('Videos duerfen aus der eigenen Anlage abgespielt werden',
    /media-src[^;]*'self'/.test(cspWert), cspWert);
  pruefe('Und das Standbild darf vor dem Hochladen aus einer blob-Adresse kommen',
    /media-src[^;]*blob:/.test(cspWert), cspWert);
  // Die Gegenprobe zu dieser Pruefung: eine Regel OHNE blob: wird von genau
  // diesem Muster nicht angenommen -- sonst bliebe sie gruen, ohne zu greifen.
  pruefe('Eine Regel ohne blob: wuerde hier auffallen',
    !/media-src[^;]*blob:/.test("default-src 'self'; media-src 'self'; script-src 'self'"),
    'das Muster nimmt auch eine Regel ohne blob: an');
  pruefe('media-src steht wirklich in der Regel und nicht nur im Muster',
    mediaTeil.length > 0, cspWert);
  pruefe('Skript nur aus der eigenen Anlage', /script-src 'self'/.test(cspWert), cspWert);
  /* DIE TRAGENDE ZEILE: script-src ohne 'unsafe-inline'. Eine Regel, die
     eingebettetes Skript erlaubte, koennte man sich sparen. */
  pruefe('Und ausdruecklich KEIN eingebettetes Skript',
    !/script-src[^;]*unsafe-inline/.test(cspWert), cspWert);
  pruefe('Die Anlage laesst sich nicht in einen fremden Rahmen setzen',
    /frame-ancestors 'none'/.test(cspWert), cspWert);
  pruefe('base-uri und form-action sind zu',
    /base-uri 'none'/.test(cspWert) && /form-action 'none'/.test(cspWert), cspWert);
  /* frame-src 'self' GEHOERT HINEIN und ist keine Nachlaessigkeit: die
     PDF-Vorschau bindet ein iframe auf den eigenen Ursprung ein. Ohne die
     Freigabe bliebe sie leer -- und deshalb steht die Zeile aus der
     Oberflaeche hier daneben. */
  const cspApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  /* Und die Oberflaeche macht von der media-src-Freigabe wirklich Gebrauch --
     ohne diese Zeile stuende die Erweiterung ohne Grund da. Dieselbe Bauform
     wie bei der PDF-Vorschau eine Zeile tiefer. */
  pruefe('Die Standbildfunktion setzt wirklich eine blob-Adresse an ein <video>',
    cspApp.includes('URL.createObjectURL(datei)') && /async function standbild\(/.test(cspApp),
    'die Standbildfunktion fehlt in app.js');
  pruefe('Die PDF-Vorschau bindet wirklich ein iframe ein',
    cspApp.includes('<iframe src="/api/attachments/'), 'kein iframe gefunden');
  pruefe('Und die Regel erlaubt genau das', /frame-src 'self'/.test(cspWert), cspWert);
  /* style-src 'unsafe-inline' ist NOETIG: die Oberflaeche setzt Abstaende,
     Rasterspalten und den Fokuspunkt als style="..."-Attribut. Ohne die
     Freigabe verwirft der Browser JEDES davon -- im Chromium nachgemessen.
     Die Zahl steht hier, damit der Grund nicht behauptet, sondern gezaehlt
     ist; faellt sie je auf 0, gehoert die Freigabe wieder weg. */
  const stilAttribute = (cspApp.match(/style="/g) || []).length;
  pruefe('Die Oberflaeche setzt style-Attribute, die Freigabe hat also einen Grund',
    stilAttribute > 0, `${stilAttribute} Stellen`);
  pruefe('Und die Freigabe steht nur bei style-src',
    /style-src[^;]*unsafe-inline/.test(cspWert), cspWert);
  pruefe('Auch eine Antwort der Schnittstelle traegt die Regel',
    ((await fetch(`${BASIS}/api/config`)).headers.get('content-security-policy') || '') === cspWert);
  /* Die Anlage ohne Proxy spricht kein HTTPS -- ein HSTS-Kopf sperrte sie
     aus. Er haengt an derselben Einstellung wie alles Uebrige, siehe die
     beiden Gruppen zum Proxy weiter unten. */
  pruefe('Ohne Proxy steht kein Strict-Transport-Security',
    cspSeite.headers.get('strict-transport-security') === null,
    cspSeite.headers.get('strict-transport-security'));

  /* ---------------------------------------------------------------- */
  gruppe('Fehler nach Rang');

  /* 400 heisst "du hast falsch gefragt", 500 heisst "bei mir ist etwas
     kaputt". Vorher kam alles als 400 zurueck, samt der Meldung des Fehlers
     -- bei einem Fehler der Datenbank stuenden darin Tabellen- und
     Spaltennamen.
     Beide Haelften gehoeren zusammen geprueft: wuerde nur der Rang geprueft,
     bliebe die Zeile auch dann gruen, wenn gar nichts mehr durchkaeme. */
  const fhItem = (await ruf('POST', '/api/items', { title: 'Fehlerprobe' })).inhalt;

  // ABSICHT BEHAELT IHREN RANG: ein Fehler von multer -- hier ein Feldname,
  // den die Route nicht kennt -- ist eine echte 400 und behaelt seine Meldung.
  const fhMulter = await sendeMultipart(`/api/items/${fhItem.id}/photos`, 'gibtsnicht',
    [{ name: 'a.png', typ: 'image/png', inhalt: Buffer.from(PNG_BASE64, 'base64') }]);
  pruefe('Ein Fehler von multer bleibt eine 400', fhMulter.status === 400,
    `${fhMulter.status}: ${JSON.stringify(fhMulter.inhalt)}`);
  pruefe('Und behaelt seine Meldung', !!fhMulter.inhalt?.error, JSON.stringify(fhMulter.inhalt));

  // Und die markierten Fehler der Anwendung ebenso: eine Datei, die kein Bild
  // ist, wird weiterhin mit ihrer eigenen Meldung abgewiesen.
  const fhKeinBild = await sendeMultipart(`/api/items/${fhItem.id}/photos`, 'photos',
    [{ name: 'a.txt', typ: 'text/plain', inhalt: 'kein Bild' }]);
  pruefe('Eine abgewiesene Datei bleibt eine 400', fhKeinBild.status === 400,
    `${fhKeinBild.status}: ${JSON.stringify(fhKeinBild.inhalt)}`);
  pruefe('Mit der Meldung, die dem Benutzer weiterhilft',
    /Bilddatei/.test(fhKeinBild.inhalt?.error || ''), JSON.stringify(fhKeinBild.inhalt));

  /* EIN ECHTER SERVERFEHLER. Eine Einspieldatei, in der "photos" keine Liste
     ist: der Server stolpert beim Durchgehen. Vorher kam das als 400 samt der
     inneren Meldung zurueck -- jetzt als 500 mit festem Text. */
  const fhKaputt = await sendeImport(
    { version: 5, title: 'T', items: [{ title: 'Kaputt', photos: 5 }] }, 'merge');
  pruefe('Ein Fehler des Servers kommt als 500', fhKaputt.status === 500,
    `${fhKaputt.status}: ${JSON.stringify(fhKaputt.inhalt)}`);
  pruefe('Und verraet nichts ueber sein Inneres',
    !!fhKaputt.inhalt?.error && !/iterable|photos|SQL|SQLITE/i.test(fhKaputt.inhalt.error),
    JSON.stringify(fhKaputt.inhalt));
  // Die Nachschau: der halbe Eintrag ist auch nicht angekommen.
  pruefe('Und dabei entsteht kein halber Eintrag',
    !(await ruf('GET', '/api/items')).inhalt.some(i => i.title === 'Kaputt'));
  await ruf('DELETE', `/api/items/${fhItem.id}`);

  /* ---------------------------------------------------------------- */
  gruppe('Sauberes Herunterfahren und der Index auf sessions');

  const hDir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-abschluss-'));
  const H2 = starteWeiterenServer(hDir2, {}, 5640);
  await H2.bereit;
  await H2.ruf('POST', '/api/setup', { user: 'hilde', password: 'hildes-langes-wort' });
  await H2.ruf('POST', '/api/items', { title: 'Vor dem Herunterfahren' });

  const walPfad = path.join(hDir2, 'katalog.sqlite-wal');
  // Erst das Vorhandensein, dann die Eigenschaft: waere die WAL schon vorher
  // leer, belegte die Zeile danach nichts (Stolperstein 81).
  const walVorher = fs.existsSync(walPfad) ? fs.statSync(walPfad).size : 0;
  pruefe('Vor dem Herunterfahren steht etwas in der WAL', walVorher > 0, `${walVorher} Bytes`);

  await H2.stopp();                       // schickt SIGTERM
  await new Promise(r => setTimeout(r, 300));
  const walNachher = fs.existsSync(walPfad) ? fs.statSync(walPfad).size : 0;
  /* Nach SIGTERM ist die WAL abgeschlossen. Wer in genau diesem Augenblick
     das Datenverzeichnis sichert, sichert einen vollstaendigen Stand -- das
     ist der ganze Zweck der sechs Zeilen. */
  pruefe('Nach SIGTERM ist die WAL abgeschlossen', walNachher === 0, `${walNachher} Bytes`);
  // Und der Bestand ist wirklich in der Hauptdatei angekommen, nicht bloss
  // die WAL geloescht.
  {
    const d = oeffne(path.join(hDir2, 'katalog.sqlite'));
    pruefe('Der Bestand steht danach in der Datenbank',
      d.prepare('SELECT COUNT(*) n FROM items').get().n === 1);
    /* DER INDEX AUF sessions.user_id. Jede Frage nach den Sitzungen EINES
       Benutzers laese sonst die ganze Tabelle. */
    const idx = d.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'sessions'").all();
    pruefe('Der Index auf sessions.user_id ist da',
      idx.some(i => i.name === 'idx_sessions_user'), JSON.stringify(idx.map(i => i.name)));
    // Er wird auch wirklich benutzt -- ein Index, den der Abfrageplaner
    // uebergeht, waere nur eine Zeile im Schema.
    const plan = d.prepare('EXPLAIN QUERY PLAN SELECT token FROM sessions WHERE user_id = 1').all();
    pruefe('Und der Abfrageplaner nimmt ihn',
      plan.some(z => String(z.detail || '').includes('idx_sessions_user')),
      JSON.stringify(plan.map(z => z.detail)));
    // KEIN MIGRATIONSCODE NOETIG, und das wird hier belegt statt geglaubt: der
    // Index wird entfernt, der Server einmal gestartet -- und er ist wieder
    // da. Anders als eine neue Spalte ruestet CREATE INDEX IF NOT EXISTS sich
    // bei jedem Start selbst nach, in bestehender wie frischer Anlage.
    d.prepare('DROP INDEX idx_sessions_user').run();
    pruefe('Zur Gegenprobe entfernt', !d.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_sessions_user'").get());
    d.close();
  }
  kurzlauf(`require('./db'); console.log('da');`, hDir2);
  {
    const d = oeffne(path.join(hDir2, 'katalog.sqlite'));
    pruefe('Und beim naechsten Start von selbst wieder da', !!d.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_sessions_user'").get());
    d.close();
  }
  fs.rmSync(hDir2, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  gruppe('Anhänge: Vorschau');

  pruefe('Text bekommt eine Textvorschau', nachName['notiz.txt'].preview === 'text');
  pruefe('Bild bekommt eine Bildvorschau', nachName['bild.png'].preview === 'bild');
  const vorText = await ruf('GET', `/api/attachments/${nachName['notiz.txt'].id}/preview`);
  pruefe('Textvorschau kommt als JSON, nicht als Datei',
    vorText.status === 200 && vorText.inhalt.art === 'text' && /Zeile zwei/.test(vorText.inhalt.text));
  pruefe('Bilder haben keine Textvorschau',
    (await ruf('GET', `/api/attachments/${nachName['bild.png'].id}/preview`)).status === 400);

  const docx = baueDocx('Erster Absatz.\nZweiter Absatz.');
  const mitDocx = await sendeDateien(at.id, [{ name: 'bericht.docx', typ: 'application/octet-stream', inhalt: docx }]);
  const docxA = mitDocx.inhalt.attachments.find(x => x.filename === 'bericht.docx');
  pruefe('.docx bekommt eine Lesevorschau', docxA.preview === 'docx');
  const vorDocx = await ruf('GET', `/api/attachments/${docxA.id}/preview`);
  pruefe('.docx wird als Text gelesen',
    vorDocx.status === 200 && /Erster Absatz/.test(vorDocx.inhalt.text) && /Zweiter Absatz/.test(vorDocx.inhalt.text),
    JSON.stringify(vorDocx.inhalt).slice(0, 120));
  pruefe('.docx-Vorschau enthält keine XML-Marken', !/<w:/.test(vorDocx.inhalt.text));
  const kaputt = await sendeDateien(at.id, [{ name: 'kaputt.docx', typ: 'application/octet-stream', inhalt: 'kein zip' }]);
  const kaputtA = kaputt.inhalt.attachments.find(x => x.filename === 'kaputt.docx');
  pruefe('Unlesbare .docx meldet das, statt abzustürzen',
    (await ruf('GET', `/api/attachments/${kaputtA.id}/preview`)).status === 422);

  /* ---------------------------------------------------------------- */
  gruppe('Anhänge: Bestand');

  const standA = (await ruf('GET', '/api/items')).inhalt.find(i => i.id === at.id);
  pruefe('Übersicht zählt die Dateien', standA.attachmentCount === 9, `${standA.attachmentCount}`);
  const statA = (await ruf('GET', '/api/stats')).inhalt;
  pruefe('Kennzahlen nennen Zahl und Größe',
    statA.attachmentCount === 9 && statA.attachmentBytes > 0,
    `${statA.attachmentCount} / ${statA.attachmentBytes}`);

  const ausOhne = await ruf('GET', '/api/export?photos=0');
  pruefe('Export lässt Dateien ohne Schalter weg',
    ausOhne.inhalt.items.find(i => i.title === 'Anhangprobe').attachments.length === 0);
  const ausMit = await ruf('GET', '/api/export?photos=0&files=1');
  const ausAnh = ausMit.inhalt.items.find(i => i.title === 'Anhangprobe').attachments;
  pruefe('Export nimmt Dateien mit Schalter mit', ausAnh.length === 9, `${ausAnh.length}`);
  pruefe('Exportierte Datei enthält ihre Bytes',
    Buffer.from(ausAnh.find(x => x.filename === 'notiz.txt').data_base64, 'base64').toString() === 'Zeile eins\nZeile zwei');

  const gel = await ruf('DELETE', `/api/attachments/${nachName['notiz.txt'].id}`);
  pruefe('Datei lässt sich entfernen',
    gel.status === 200 && !gel.inhalt.attachments.some(x => x.filename === 'notiz.txt'));
  pruefe('Sortiernummern bleiben lückenlos',
    gleich(gel.inhalt.attachments.map(x => x.sort_order), gel.inhalt.attachments.map((_, i) => i)),
    JSON.stringify(gel.inhalt.attachments.map(x => x.sort_order)));
  pruefe('Gelöschte Datei ist nicht mehr abrufbar',
    (await kopf(nachName['notiz.txt'].id)).status === 404);

  const impA = await sendeImport({ version: 5, title: 'A', items: [{ title: 'Mit Datei',
    attachments: [{ filename: 'wieder.txt', mime_type: 'text/plain',
                    data_base64: Buffer.from('eingespielt').toString('base64') }] }] }, 'merge');
  pruefe('Import spielt Dateien ein', impA.status === 200 && impA.inhalt.attachments === 1,
    JSON.stringify(impA.inhalt));
  const wieder = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Mit Datei');
  const wiederDet = (await ruf('GET', `/api/items/${wieder.id}`)).inhalt;
  pruefe('Eingespielte Datei ist vollständig',
    wiederDet.attachments[0].filename === 'wieder.txt' && wiederDet.attachments[0].size === 11);
  await ruf('DELETE', `/api/items/${wieder.id}`);
  await ruf('DELETE', `/api/items/${at.id}`);
  pruefe('Mit dem Eintrag verschwinden auch seine Dateien',
    (await ruf('GET', '/api/stats')).inhalt.attachmentCount === 0);

  /* ---------------------------------------------------------------- */
  await pruefeOberflaeche();
  await pruefeErstanmeldung();

  /* ---------------------------------------------------------------- */
  /* Der Schlussdurchlauf. Die Gruppen weiter oben pruefen einzelne
     Wege; diese Zeile prueft das Ergebnis ueber ALLES, was der ganze Prueflauf
     angelegt, eingespielt und bearbeitet hat -- Kommentarbilder, Anhaenge,
     Tags an Testtagen, Importe in beiden Modi. Es ist derselbe Durchlauf, der
     sich auf dem Server von Hand machen laesst, und er ist der
     eigentliche Beweis, dass keine Zeile ohne Verfasser entsteht. */
  gruppe('Keine Zeile ohne Benutzer');

  /* Zuvor auffuellen -- und zwar ueber BEIDE Wege, ueber die eine Zeile
     entstehen kann. Die Loeschpruefungen weiter oben raeumen den Bestand am
     Ende weitgehend leer; ein Durchlauf ueber drei Zeilen waere gruen, ohne
     etwas zu belegen. Die Zahlen stehen deshalb unten in
     einer eigenen Pruefung: bleibt der Bestand einmal unter der Schwelle, ist
     der Durchlauf zu nachsichtig geworden und nicht etwa in Ordnung. */
  const fuellItem = (await ruf('POST', '/api/items', { title: 'Schlussdurchlauf' })).inhalt;
  await ruf('POST', `/api/items/${fuellItem.id}/test-days`, { day: '2024-07-07', rating: 2 });
  await sendeKommentar(fuellItem.id, { text: 'Kommentar zum Schlussdurchlauf' });
  // Der fuenfte Traeger seit 0.8.30, ueber beide Wege: von Hand eingetragen
  // (hier) und eingespielt (unten in der Importdatei, in beiden Formen).
  await ruf('POST', `/api/items/${fuellItem.id}/links`, { url: 'https://schluss.test/eins' });
  await ruf('POST', `/api/items/${fuellItem.id}/links`, { url: 'Schlusssuchtext' });
  // Der sechste Traeger seit 0.8.31, ebenfalls ueber beide Wege: echter Upload
  // hier, eingespielt unten in der Importdatei.
  await sendeDateien(fuellItem.id, [{ name: 'schluss.txt', typ: 'text/plain', inhalt: 'Schlussdurchlauf' }]);
  // Auch ratings gehoert mit in den Durchlauf -- ueber beide Wege, auf
  // denen eine Bewertungszeile entsteht: von Hand gesetzt und eingespielt.
  const schlussKriterien = (await ruf('GET', '/api/criteria')).inhalt;
  await ruf('PUT', `/api/items/${fuellItem.id}/ratings`,
    { criterionId: schlussKriterien[0].id, value: 4 });
  await sendeImport({ version: 5, title: 'S', items: [
    // Formatnummer 5: die Linkzeile ist eine nackte String ohne
    // Verfasser -- sie muss trotzdem eine user_id bekommen.
    { title: 'Schluss eins', testDays: [{ day: '2024-07-08', rating: 3 }],
      ratings: [{ name: schlussKriterien[0].name, value: 5 }],
      links: ['https://schluss.example/alt', 'Alter Suchtext'],
      comments: [{ text: 'S1a' }, { text: 'S1b' }] },
    // Und die neue Form daneben, mit und ohne genannten Namen.
    { title: 'Schluss zwei', testDays: [{ day: '2024-07-09', rating: 4 }],
      ratings: [{ name: schlussKriterien[0].name, value: 2 },
                { name: 'Frisch erfundenes Kriterium', value: 3 }],
      links: [{ url: 'https://schluss.example/neu', author: null },
              { url: 'https://schluss.example/wer', author: 'gibtesnicht' }],
      // Eine Datei ohne author-Feld (Format bis 7) und eine mit -- beide
      // muessen eine user_id bekommen.
      attachments: [
        { filename: 'schluss-alt.txt', mime_type: 'text/plain',
          data_base64: Buffer.from('alt').toString('base64') },
        { filename: 'schluss-neu.txt', mime_type: 'text/plain', author: null,
          data_base64: Buffer.from('neu').toString('base64') }],
      comments: [{ text: 'S2a' }] }
  ] }, 'merge');

  const schluss = oeffne(path.join(DATA, 'katalog.sqlite'));
  const schlussZahl = {};
  for (const t of ['items', 'comments', 'test_days', 'ratings', 'links', 'attachments']) {
    schlussZahl[t] = schluss.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
    const ohne = schluss.prepare(`SELECT COUNT(*) n FROM ${t} WHERE user_id IS NULL`).get().n;
    pruefe(`${t}: keine der ${schlussZahl[t]} Zeilen ist ohne Benutzer`, ohne === 0,
      `${ohne} von ${schlussZahl[t]} ohne user_id`);
  }
  pruefe('Der Durchlauf laeuft ueber einen belastbaren Bestand',
    schlussZahl.items >= 5 && schlussZahl.comments >= 4 && schlussZahl.test_days >= 4 &&
    schlussZahl.ratings >= 4 && schlussZahl.links >= 6 && schlussZahl.attachments >= 3,
    `${schlussZahl.items} Eintraege, ${schlussZahl.comments} Kommentare, ` +
    `${schlussZahl.test_days} Testtage, ${schlussZahl.ratings} Bewertungen, ` +
    `${schlussZahl.links} Links, ${schlussZahl.attachments} Dateien`);
  schluss.close();

  /* ---------------------------------------------------------------- */
  schlussBlock();

  kind.kill();
  fs.rmSync(DATA, { recursive: true, force: true });
  process.exit(rueckgabewert());
})().catch(e => {
  console.error('\nPrueflauf abgebrochen:', e.message);
  if (kind) kind.kill();
  fs.rmSync(DATA, { recursive: true, force: true });
  process.exit(1);
});

/* ================= Erstanmeldung ================= */
// Laeuft gegen eigene Server in eigenen Verzeichnissen, damit die Prueflagen
// (Abweisungen, AUTH_RESET, leere Benutzertabelle) den Hauptbestand nicht
// beruehren.
async function pruefeErstanmeldung() {
  gruppe('Erstanmeldung: frische Installation');
  const frischDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-setup-'));
  const B = starteWeiterenServer(frischDir, {}, 4000);
  await B.bereit;

  const cfgVor = await B.ruf('GET', '/api/config');
  pruefe('Ohne Zugang meldet /api/config Einrichtungsbedarf', cfgVor.inhalt.setupRequired === true);
  pruefe('Die Mindestlaenge kommt vom Server', cfgVor.inhalt.minPassword === 10);
  pruefe('Auch ohne Zugang bleiben die Daten zu',
    (await B.ruf('GET', '/api/criteria')).status === 401);
  pruefe('Die Einrichtungsseite verraet den Bestand nicht',
    !('itemCount' in cfgVor.inhalt) && !('appTitle' in cfgVor.inhalt),
    JSON.stringify(Object.keys(cfgVor.inhalt)));

  pruefe('Leerer Benutzername wird abgewiesen',
    (await B.ruf('POST', '/api/setup', { user: '  ', password: 'lang-genug-123' })).status === 400);
  const zuKurz = await B.ruf('POST', '/api/setup', { user: 'chef', password: 'kurz1234' });
  pruefe('Passwort unter zehn Zeichen wird abgewiesen', zuKurz.status === 400, `Status ${zuKurz.status}`);
  pruefe('Die Begruendung nennt die Mindestlaenge', /10 Zeichen/.test(zuKurz.inhalt.error || ''));
  pruefe('Ein abgewiesener Versuch legt nichts an',
    (await B.ruf('GET', '/api/config')).inhalt.setupRequired === true);

  const eingerichtet = await B.ruf('POST', '/api/setup', { user: 'chef', password: 'zehn-zeichen-und-mehr' });
  pruefe('Einrichtung gelingt', eingerichtet.status === 200, JSON.stringify(eingerichtet.inhalt));
  pruefe('Danach ist man angemeldet', (await B.ruf('GET', '/api/criteria')).status === 200);
  pruefe('/api/config meldet keinen Einrichtungsbedarf mehr',
    (await B.ruf('GET', '/api/config')).inhalt.setupRequired === false);

  const zweiteEinrichtung = await B.ruf('POST', '/api/setup', { user: 'fremd', password: 'zehn-zeichen-und-mehr' });
  pruefe('Ein zweiter Einrichtungsversuch wird abgewiesen', zweiteEinrichtung.status === 409,
    `Status ${zweiteEinrichtung.status}`);
  const frischDb = oeffne(path.join(frischDir, 'katalog.sqlite'));
  pruefe('Und legt auch keinen zweiten Zugang an',
    frischDb.prepare('SELECT COUNT(*) n FROM users').get().n === 1);
  pruefe('Das Passwort steht nirgends im Klartext',
    !frischDb.prepare('SELECT password_hash h FROM users').get().h.includes('zehn-zeichen-und-mehr'));
  // Der erste Benutzer entsteht ausschliesslich hier -- und wer die Anlage
  // einrichtet, dem gehoert sie.
  const frischU = frischDb.prepare('SELECT id, role, status, last_login FROM users ORDER BY id').get();
  pruefe('Der frisch eingerichtete Zugang ist Eigentuemer', frischU?.role === 'eigentuemer',
    JSON.stringify(frischU));
  pruefe('Und steht auf aktiv', frischU?.status === 'aktiv', frischU?.status);
  pruefe('Die Einrichtung setzt last_login',
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(frischU?.last_login || ''), frischU?.last_login);
  pruefe('Die Sitzung aus der Einrichtung gehoert ihm',
    frischDb.prepare('SELECT COUNT(*) n FROM sessions WHERE user_id = ?').get(frischU?.id ?? 0).n === 1,
    JSON.stringify(frischDb.prepare('SELECT token, user_id FROM sessions').all()));
  frischDb.close();

  /* --- Zugang aendern --- */
  gruppe('Erstanmeldung: Zugang aendern');
  pruefe('Der Name steht im Systembereich', (await B.ruf('GET', '/api/account')).inhalt.username === 'chef');
  pruefe('Falsches bisheriges Passwort wird abgewiesen',
    (await B.ruf('PUT', '/api/account', { oldPassword: 'daneben', username: 'chef', newPassword: 'neues-langes-wort' })).status === 400);
  pruefe('Zu kurzes neues Passwort wird abgewiesen',
    (await B.ruf('PUT', '/api/account', { oldPassword: 'zehn-zeichen-und-mehr', username: 'chef', newPassword: 'kurz' })).status === 400);
  const nurName = await B.ruf('PUT', '/api/account',
    { oldPassword: 'zehn-zeichen-und-mehr', username: 'chefin', newPassword: '' });
  pruefe('Leeres Passwortfeld aendert nur den Namen',
    nurName.status === 200 && nurName.inhalt.username === 'chefin' && nurName.inhalt.passwortGewechselt === false,
    JSON.stringify(nurName.inhalt));
  const gewechselt = await B.ruf('PUT', '/api/account',
    { oldPassword: 'zehn-zeichen-und-mehr', username: 'chefin', newPassword: 'ganz-neues-passwort' });
  pruefe('Passwortwechsel gelingt', gewechselt.status === 200 && gewechselt.inhalt.passwortGewechselt === true);
  pruefe('Die eigene Sitzung bleibt bestehen', (await B.ruf('GET', '/api/criteria')).status === 200);

  B.cookieLoeschen();
  pruefe('Das alte Passwort gilt nicht mehr',
    (await B.ruf('POST', '/api/login', { user: 'chefin', password: 'zehn-zeichen-und-mehr' })).status === 401);
  pruefe('Der alte Benutzername gilt nicht mehr',
    (await B.ruf('POST', '/api/login', { user: 'chef', password: 'ganz-neues-passwort' })).status === 401);
  pruefe('Mit den neuen Daten gelingt die Anmeldung',
    (await B.ruf('POST', '/api/login', { user: 'chefin', password: 'ganz-neues-passwort' })).status === 200);

  // Etwas anlegen, damit die Rueckstellung gleich zeigen kann, dass der Bestand
  // bleibt.
  await B.ruf('POST', '/api/items', { title: 'Ueberlebt die Ruecksetzung' });

  /* --- Anmeldesperre: unveraendert --- */
  // Bewusst ganz am Schluss und auf diesem Server: nach zehn Fehlversuchen ist
  // die Adresse fuenf Minuten gesperrt, alles Weitere liefe ins Leere.
  gruppe('Erstanmeldung: Anmeldesperre bleibt');
  B.cookieLoeschen();
  const zeiten = [];
  let gesperrtAb = 0, letzteMeldung = '';
  for (let i = 1; i <= 11; i++) {
    const t0 = Date.now();
    const a = await B.ruf('POST', '/api/login', { user: 'chefin', password: 'falsch-falsch-falsch' });
    zeiten.push(Date.now() - t0);
    if (a.status === 429 && !gesperrtAb) { gesperrtAb = i; letzteMeldung = a.inhalt.error || ''; }
  }
  pruefe('Die ersten Versuche kommen ohne Verzoegerung zurueck', zeiten[0] < 700, `${zeiten[0]} ms`);
  pruefe('Ab dem sechsten Versuch wird verzoegert geantwortet',
    zeiten[5] >= 700, `Versuch 6: ${zeiten[5]} ms (Versuch 1: ${zeiten[0]} ms)`);
  pruefe('Ab dem elften Versuch ist gesperrt', gesperrtAb === 11, `gesperrt ab Versuch ${gesperrtAb}`);
  pruefe('Die Sperre nennt die verbleibende Zeit', /Sekunden/.test(letzteMeldung), letzteMeldung);
  pruefe('Auch das richtige Passwort kommt waehrend der Sperre nicht durch',
    (await B.ruf('POST', '/api/login', { user: 'chefin', password: 'ganz-neues-passwort' })).status === 429);
  await B.stopp();

  /* --- AUTH_RESET wird abgelehnt ---
     Frueher setzte die Umgebungsvariable beim Start ein blankes
     DELETE FROM users ab. Im Mehrbenutzerbetrieb waere das eine Katastrophe:
     alle Zugaenge weg, aller Bestand ueber ON DELETE SET NULL herrenlos, und
     der naechste Start schoebe ihn dem zu, der sich als Erster neu
     einrichtet. An ihre Stelle tritt zugang.js auf dem Wirt. */
  gruppe('AUTH_RESET wird abgelehnt');
  const C = starteWeiterenServer(frischDir, { AUTH_RESET: '1' }, 4100);
  await C.bereit;
  pruefe('Der Start sagt laut, dass AUTH_RESET wirkungslos ist',
    /AUTH_RESET wird seit Version 0\.8\.0 nicht mehr ausgefuehrt/.test(C.protokoll()));
  // Still weglassen waere falsch: wer die Zeile in seiner .env stehen hat,
  // muss den neuen Weg erfahren, und zwar ohne nachzuschlagen.
  pruefe('Und nennt den Weg, der an seine Stelle tritt',
    /zugang\.js passwort/.test(C.protokoll()));
  pruefe('Der Start bricht deswegen nicht ab',
    (await C.ruf('GET', '/api/config')).status === 200);
  pruefe('Es ist KEINE Einrichtung noetig',
    (await C.ruf('GET', '/api/config')).inhalt.setupRequired === false);
  const nachReset = oeffne(path.join(frischDir, 'katalog.sqlite'));
  /* Die drei Zeilen des Gewinns: der Zugang steht
     noch, der Bestand gehoert weiter ihm, und nichts ist herrenlos
     geworden. */
  pruefe('Der Zugang steht unveraendert in der Datenbank',
    nachReset.prepare('SELECT COUNT(*) n FROM users').get().n === 1,
    JSON.stringify(nachReset.prepare('SELECT id, username, role, status FROM users').all()));
  pruefe('Der Bestand bleibt unangetastet',
    nachReset.prepare('SELECT COUNT(*) n FROM items').get().n === 1);
  pruefe('Und er wird NICHT herrenlos',
    nachReset.prepare('SELECT COUNT(*) n FROM items WHERE user_id IS NULL').get().n === 0,
    JSON.stringify(nachReset.prepare('SELECT id, user_id FROM items').all()));
  pruefe('Der Eigentuemer traegt die Rolle, nicht nur die kleinste Nummer',
    nachReset.prepare("SELECT COUNT(*) n FROM users WHERE role = 'eigentuemer'").get().n === 1,
    JSON.stringify(nachReset.prepare('SELECT id, role FROM users').all()));
  nachReset.close();
  await C.stopp();

  /* --- Die zweite Aufrufstelle des Auffangnetzes ---------------------------
     ordneBestandZu() steht an zwei Stellen; die zweite sitzt in
     legeErstenBenutzerAn. Im Normalbetrieb entsteht die leere Benutzertabelle
     nicht -- die Prueflage stellt sie deshalb selbst her. */
  gruppe('Erstanmeldung: Einrichtung bei leerer Benutzertabelle');
  {
    const d = oeffne(path.join(frischDir, 'katalog.sqlite'));
    d.prepare('DELETE FROM users').run();
    d.prepare('DELETE FROM sessions').run();
    // ON DELETE SET NULL hat gerade zugeschlagen -- genau die Lage, die die
    // dritte Aufrufstelle aufraeumen muss.
    pruefe('Der Bestand ist jetzt herrenlos',
      d.prepare('SELECT COUNT(*) n FROM items WHERE user_id IS NULL').get().n === 1,
      JSON.stringify(d.prepare('SELECT id, user_id FROM items').all()));
    d.close();
  }
  const D2 = starteWeiterenServer(frischDir, {}, 4100);
  await D2.bereit;
  pruefe('Ohne Zugang ist wieder Einrichtung noetig',
    (await D2.ruf('GET', '/api/config')).inhalt.setupRequired === true);
  const neuEingerichtet = await D2.ruf('POST', '/api/setup',
    { user: 'nachher', password: 'zehn-zeichen-und-mehr' });
  pruefe('Nach der Einrichtung laesst sich anmelden',
    neuEingerichtet.status === 200, JSON.stringify(neuEingerichtet.inhalt));
  const nachNeu = oeffne(path.join(frischDir, 'katalog.sqlite'));
  const neuId = nachNeu.prepare('SELECT MIN(id) AS id FROM users').get().id;
  const neuItems = nachNeu.prepare('SELECT id, user_id FROM items').all();
  pruefe('Der herrenlose Bestand faellt an den neu eingerichteten Zugang',
    neuItems.length === 1 && neuItems[0].user_id === neuId, JSON.stringify(neuItems));
  // Und der Neue ist Eigentuemer -- ohne das griffe ordneBestandZu() ins
  // Leere, weil eigentuemerId() niemanden faende.
  pruefe('Und der neu eingerichtete Zugang ist Eigentuemer',
    nachNeu.prepare('SELECT role FROM users WHERE id = ?').get(neuId)?.role === 'eigentuemer',
    JSON.stringify(nachNeu.prepare('SELECT id, username, role FROM users').all()));
  nachNeu.close();
  await D2.stopp();
  fs.rmSync(frischDir, { recursive: true, force: true });
}

// Ein echtes, winziges PNG (1x1). Muss echt sein: der Server jagt jedes Foto
// durch sharp, ein Fantasie-Puffer scheiterte dort.
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/* ECHTE VIDEODATEIEN, keine Nachbildung. Beide sind in einem Browser
   aufgenommen und tragen deshalb genau die Koepfe, die eine echte Datei
   traegt: die MP4 den ISO-Kasten ftyp mit der Marke isom an Byte 8, die WebM
   den EBML-Kopf 1A 45 DF A3. Genau daran erkennt typAusBytes() sie -- eine
   von Hand zusammengesetzte Header bewiese darueber nichts.
   Klein gehalten (1418 und 1053 Bytes), damit sie im Pruefstand nichts
   kosten. */
const MP4_BASE64 =
  'AAAAJGZ0eXBpc29tAAACAGlzb21pc282aXNvMnZwMDltcDQxAAACt21vb3YAAAB4bXZoZAEAAAAAAAAA5rBYpAAAAADm' +
  'sFikAAAD6AAAAAAAAANtAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIPdHJhawAAAGh0a2hkAQAAAwAAAADmsFikAAAAAOawWKQAAAABAAAA' +
  'AAAAAAAAAANtAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAABAAAAAMAAA' +
  'AAABn21kaWEAAAAsbWRoZAEAAAAAAAAA5rBYpAAAAADmsFikAAB1MAAAAAAAAANtVcQAAAAAAC1oZGxyAAAAAAAAAAB2' +
  'aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAT5taW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAlZGluZgAAAB1k' +
  'cmVmAAAAAAAAAAEAAAANdXJsIAAAAAEAAAAA/XN0YmwAAAAQc3RzYwAAAAAAAAAAAAAAEHN0dHMAAAAAAAAAAAAAABRz' +
  'dHN6AAAAAAAAAAAAAAAAAAAAEHN0Y28AAAAAAAAAAAAAALFzdHNkAAAAAAAAAAEAAAChdnAwOQAAAAAAAAABAAAAAQAA' +
  'AAAAAAAAAAAAAABAADAASAAAAEgAAAAAAAAAAQpWUEMgQ29kaW5nAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAABBw' +
  'YXNwAAAAAQAAAAEAAAAUYnRydAAAAAAAAAAAAAAAAAAAABR2cGNDAQAAAAAAgAYGBgAAAAAAE2NvbHJuY2x4AAYABgAG' +
  'AAAAAChtdmV4AAAAIHRyZXgAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAACobW9vZgAAABBtZmhkAAAAAAAAAAEAAACQ' +
  'dHJhZgAAABR0ZmhkAAIAIAAAAAEBAQAAAAAAFHRmZHQBAAAAAAAAAAAAAAAAAABgdHJ1bgEAAwUAAAAJAAAAsAIAAAAA' +
  'AA4ZAAAAWQAADiAAAAAkAAAHEAAAACQAAA4jAAAAJQAADiUAAAAkAAAHEgAAACUAAA4lAAAAJQAADiIAAAAmAAAD5wAA' +
  'AFkAAAG7bWRhdIJJg0JgA/AC9gg4JBwYYgAAIEAAa0P//yyYN65AU8lvfomBC/vyzD6RbIYgCKcT//7CFVX1P3mwEZ+9' +
  'CG3RAHfI6+Lx7UeFfAD////+MVf////9EUHR4dEAhgBAkvDBMQAADHAAAHMPW//KQAAD////+zxv///wAIZi0pgAhgBA' +
  'kvCxLAAADHAAAHMPW/+JIAAH////9wMf///6eUMxaUwAhgBAkvCxJ4AADHAAAHMPW/gAAAB/////WM3////+J0oZi0pg' +
  'AIYAQJLwoSMAAAxwAABzD1v/mkAAB///4AH////+vPkMxaUwAIYAQJLwkR6AAAxwAABzD1v/16AAA/////ytp/////UI' +
  'kMxaUwCGAECS8JEcAAAMcAAAcw9b//68+AAB/////x4w///+rshmLSmAhgBAkvCBGYAADHAAAHMPW//0JAAB/////rbT' +
  '/////KSEMxaUwACGAECSnCBFwAADcAAAdNIo2MYu2P/////Xo3////+uwFW1ncGX////16N////Xttj////8g/////bg' +
  'XR////kH///1wR9j///5B///9cC6P///8g///+uAAAAAAExtZnJhAAAANHRmcmEBAAAAAAAAAQAAAD8AAAABAAAAAAAA' +
  'AAAAAAAAAAAC2wAAAAEAAAABAAAAAQAAABBtZnJvAAAAAAAAAEw=';

const WEBM_BASE64 =
  'GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwEAAAAAAAPtEU2bdLlNu4tTq4QVSalmU6yBbk27' +
  'i1OrhBZUrmtTrIGTTbuLU6uEH0O2dVOsgcFNu4xTq4QcU7trU6yCA9vsrgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBEiYREUukGTYCGQ2hyb21lV0GGQ2hyb21lFlSua6mup9eBAXPF' +
  'hwGRNo5TXWyDgQFV7oEBhoVWX1ZQOOCKsIFAuoEwU8CBAR9DtnUBAAAAAAADDueBAKDrobyBAAAAEAMAnQEqQAAwAAJH' +
  'CIWFiJmEiAyCAnWqAgbmQP30Js8uAP7u/5/8Buvi2mX/20P/1of/rQ/6UAB1oaqmqO6BAaWjsAIAnQEqQAAwAAcHCIWF' +
  'iJmEiCWCAAaOT8zHm/FYAP7wdgCgzqGtgQB4ABECAAkQZAAYABpP9AwAEQwFU4D+8Az//16P/z0f/no/z/f4cqfTtsAA' +
  'daGZppfugQGlktEBABwROAAYABhYL/QACIwAAPuBAKDVobSBAPEAkQIACRBMABgMVBwEEEz5hoAa4Vp/IAD+7unf/7O7' +
  '9O79O7/Ax//ILlhdcS7WTljgdaGZppfugQGlktEBABwQ8AAYABhYL/QACIwAAPuBeKDPoa6BAS0AUQIACRA4ABgHMAgd' +
  'BvLNQBMf//4A/uSI//2Mx+0Z/klf/u82AMJf8IAAdaGZppfugQGlktEBABwQzAAYABhYL/QACIwAAPuB8aDRoa+BAaUA' +
  'EQIACRAoABgAGk/0DAARDAVTgP7wumv20RzCJzE3D/+krfpK36St/6QAAHWhmaaX7oEBpZLRAQAcEKAAGAAYWC/0AAiM' +
  'AAD7ggEtoNGhr4ECHgARAgAJEBwAGAAaT/QMABT6qqiA/vUnX/+hQ/oUP6FD/6FD//ffDLe7f+YodaGZppfugQGlktEB' +
  'ABwQfAAYABhYL/QACIwAAPuCAaWg16G1gQJaADECAAkQFAAYAB5X9AwAPQm48EQA/v42Jf/8GY/gzH8GY/+DMf/xZmlm' +
  'aWhnaMFiNEB1oZmml+6BAaWS0QEAHBBgABgAGFgv9AAIjAAA+4ICHqDTobKBAtMAcQIACRANEADAOcBA6DeWagC8L//s' +
  'AP735J//3ulekNUX/e6f/+zyYl0TD/s2AHWhmKaW7oEBpZGxAQAcEKQUYABhYL/QACIwAPuCAlqg0KGugQNLADECAAkQ' +
  'CSAAwADSf6BgAKfVVUQA/vhff4Ax5nh5mLf/7Un68wcr/7TIAHWhmaaX7oEBpZLRAQAcEFAAGAAYWC/0AAiMAAD7ggLT' +
  'HFO7a427i7OBALeG94EB8YHB';

const MP4 = () => Buffer.from(MP4_BASE64, 'base64');
const WEBM = () => Buffer.from(WEBM_BASE64, 'base64');

/* Ein Video samt Standbild hochladen -- zwei benannte Felder in EINEM Vorgang,
   so wie die Oberflaeche es schickt. Das Standbild ist ein echtes PNG; der
   Server macht daraus wie bei jedem Foto Kachel und mittlere Variante. */
function sendeVideo(itemId, { video = MP4(), name = 'clip.mp4', typ = 'video/mp4',
                              standbild = Buffer.from(PNG_BASE64, 'base64'),
                              standbildName = 'standbild.jpg', standbildTyp = 'image/jpeg',
                              dauer = 42, ohneStandbild = false } = {}) {
  const dateien = [{ feld: 'video', name, typ, inhalt: video }];
  if (!ohneStandbild)
    dateien.push({ feld: 'standbild', name: standbildName, typ: standbildTyp, inhalt: standbild });
  return sendeMultipart(`/api/items/${itemId}/videos`, 'video', dateien,
                         dauer === null ? {} : { dauer: String(dauer) });
}

async function legeFotoAn(itemId) {
  const antwort = await sendeMultipart(`/api/items/${itemId}/photos`, 'photos',
    [{ name: 'p.png', typ: 'image/png', inhalt: Buffer.from(PNG_BASE64, 'base64') }]);
  return antwort.inhalt.photos[0];
}

// Kommentar anlegen: Multipart, weil Bilder mitkommen koennen.
async function sendeKommentar(itemId, felder, bilder = []) {
  return sendeMultipart(`/api/items/${itemId}/comments`, 'images', bilder, felder);
}

const sendeDateien = (itemId, dateien) =>
  sendeMultipart(`/api/items/${itemId}/attachments`, 'files', dateien);

// Multipart-Formularkoerper von Hand: die Pruefung soll ohne zusaetzliche
// Bibliothek auskommen, und Buffer duerfen nicht ueber Strings laufen --
// sonst zerfaellt jedes Byte ueber 127.
async function sendeMultipart(pfad, feld, dateien, felder = {}) {
  const grenze = '----pruefung' + crypto.randomBytes(6).toString('hex');
  const teile = [];
  for (const [k, v] of Object.entries(felder)) {
    teile.push(Buffer.from(
      `--${grenze}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`, 'utf8'));
  }
  for (const d of dateien) {
    const inhalt = Buffer.isBuffer(d.inhalt) ? d.inhalt : Buffer.from(d.inhalt, 'utf8');
    // Je Datei ein eigener Feldname, wenn sie einen nennt: der Videoweg
    // schickt zwei verschiedene Felder in einem Vorgang.
    teile.push(Buffer.from(
      `--${grenze}\r\nContent-Disposition: form-data; name="${d.feld || feld}"; filename="${d.name}"\r\n` +
      `Content-Type: ${d.typ}\r\n\r\n`, 'utf8'));
    teile.push(inhalt);
    teile.push(Buffer.from('\r\n', 'utf8'));
  }
  teile.push(Buffer.from(`--${grenze}--\r\n`, 'utf8'));
  const a = await fetch(BASIS + pfad, {
    method: 'POST',
    headers: { cookie: cookie, 'content-type': `multipart/form-data; boundary=${grenze}` },
    body: Buffer.concat(teile)
  });
  return { status: a.status, inhalt: await a.json().catch(() => null) };
}

// Eine echte .docx bauen: ZIP mit word/document.xml, ungepackt gespeichert.
// So prueft die Vorschau am wirklichen Format, nicht an einer Nachbildung.
function baueDocx(text) {
  const absaetze = text.split('\n').map(z =>
    `<w:p><w:r><w:t>${z.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</w:t></w:r></w:p>`).join('');
  const xml = Buffer.from(`<?xml version="1.0"?><w:document xmlns:w="x"><w:body>${absaetze}</w:body></w:document>`, 'utf8');
  const name = Buffer.from('word/document.xml', 'utf8');
  const crc = crc32(xml);

  const lokal = Buffer.alloc(30);
  lokal.writeUInt32LE(0x04034b50, 0); lokal.writeUInt16LE(20, 4);
  lokal.writeUInt16LE(0, 8);                       // Methode 0 = ungepackt
  lokal.writeUInt32LE(crc, 14);
  lokal.writeUInt32LE(xml.length, 18); lokal.writeUInt32LE(xml.length, 22);
  lokal.writeUInt16LE(name.length, 26);
  const datei = Buffer.concat([lokal, name, xml]);

  const zentral = Buffer.alloc(46);
  zentral.writeUInt32LE(0x02014b50, 0); zentral.writeUInt16LE(20, 4); zentral.writeUInt16LE(20, 6);
  zentral.writeUInt16LE(0, 10);
  zentral.writeUInt32LE(crc, 16);
  zentral.writeUInt32LE(xml.length, 20); zentral.writeUInt32LE(xml.length, 24);
  zentral.writeUInt16LE(name.length, 28);
  zentral.writeUInt32LE(0, 42);                    // Versatz des oertlichen Kopfes
  const verzeichnis = Buffer.concat([zentral, name]);

  const ende = Buffer.alloc(22);
  ende.writeUInt32LE(0x06054b50, 0);
  ende.writeUInt16LE(1, 8); ende.writeUInt16LE(1, 10);
  ende.writeUInt32LE(verzeichnis.length, 12);
  ende.writeUInt32LE(datei.length, 16);
  return Buffer.concat([datei, verzeichnis, ende]);
}

function crc32(buf) {
  let c, tabelle = crc32.tabelle;
  if (!tabelle) {
    tabelle = crc32.tabelle = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      tabelle[n] = c >>> 0;
    }
  }
  let r = 0xffffffff;
  for (const b of buf) r = tabelle[(r ^ b) & 0xff] ^ (r >>> 8);
  return (r ^ 0xffffffff) >>> 0;
}

async function sendeImport(objekt, modus) {
  const grenze = '----pruefung' + crypto.randomBytes(6).toString('hex');
  const teil = (name, wert, dateiname) =>
    `--${grenze}\r\nContent-Disposition: form-data; name="${name}"` +
    (dateiname ? `; filename="${dateiname}"\r\nContent-Type: application/json` : '') +
    `\r\n\r\n${wert}\r\n`;
  const koerper = teil('mode', modus) + teil('file', JSON.stringify(objekt), 'export.json') + `--${grenze}--\r\n`;
  const a = await fetch(BASIS + '/api/import', {
    method: 'POST',
    headers: { cookie: cookie, 'content-type': `multipart/form-data; boundary=${grenze}` },
    body: koerper
  });
  return { status: a.status, inhalt: await a.json().catch(() => null) };
}

/* ================= Oberflaeche (echtes DOM) ================= */
// Baut eine Oberflaeche im echten DOM auf. einstellungen bestimmt, was
// /api/settings liefert -- damit laesst sich derselbe Aufbau einmal mit
// Vorgaben und einmal mit eigenem Vokabular pruefen.
// Anbieterlage fuer die Oberflaechenpruefungen, so wie der Server sie liefert:
// drei im Vorrat, Startpage als Standard. Der eigene Anbieter traegt bewusst
// spitze Klammern im Namen -- er ist Eingabe des Admins und wird als
// Beschriftung gerendert; daran haengt die Maskierungspruefung.
const DOM_ANBIETER = [
  { schluessel: 'google', name: 'Google', vorlage: 'https://www.google.com/search?q=%s',
    eigen: false, vorhanden: true, aktiv: false, standard: false },
  { schluessel: 'bing', name: 'Bing', vorlage: 'https://www.bing.com/search?q=%s',
    eigen: false, vorhanden: true, aktiv: true, standard: false },
  { schluessel: 'ddg', name: 'DuckDuckGo', vorlage: 'https://duckduckgo.com/?q=%s',
    eigen: false, vorhanden: true, aktiv: false, standard: false },
  { schluessel: 'startpage', name: 'Startpage', vorlage: 'https://www.startpage.com/sp/search?query=%s',
    eigen: false, vorhanden: true, aktiv: true, standard: true },
  { schluessel: 'brave', name: 'Brave Search', vorlage: 'https://search.brave.com/search?q=%s',
    eigen: false, vorhanden: true, aktiv: false, standard: false },
  { schluessel: 'ecosia', name: 'Ecosia', vorlage: 'https://www.ecosia.org/search?q=%s',
    eigen: false, vorhanden: true, aktiv: false, standard: false },
  { schluessel: 'eigen1', name: 'Forum <b>X</b>', vorlage: 'https://forum.beispiel.de/suche?q=%s',
    eigen: true, vorhanden: true, aktiv: true, standard: false },
  { schluessel: 'eigen2', name: '', vorlage: '', eigen: true, vorhanden: false, aktiv: false, standard: false },
  { schluessel: 'eigen3', name: '', vorlage: '', eigen: true, vorhanden: false, aktiv: false, standard: false }
];

/* kriterienGewichte und eigeneWerte sind die beiden Stellschrauben der
   Gewichtung. Vorgabe sind DREI VERSCHIEDENE Gewichte, eines davon 1 -- so
   lassen sich Anzeige und Nichtanzeige an derselben Prueflage belegen. Ein
   Mock mit lauter Einsen naehme genau die Pruefung weg, fuer die er
   gebaut ist (Stolperstein 90). */
function baueDom(JSDOM, { einstellungen = { filters: null }, hash = '', tags = [], uebersichtItems = null, einrichtung = false, angemeldet = true, zugaenge = null, testTage = null, zweiterEintrag = null, kriterienGewichte = [1.5, 1, 0.5], eigeneWerte = [3, 3, 3], offenBestand = null, papierkorbBestand = null, sicherungStand = null, kategorien = [{ id: 21, name: 'Werkzeug', usage_count: 2 }, { id: 22, name: 'Material', usage_count: 0 }] } = {}) {
  // Aus demselben Paket wie JSDOM, das der Aufrufer mitbringt -- require ist
  // hier ein Griff in den Zwischenspeicher, kein zweites Laden.
  const { VirtualConsole } = require('jsdom');
  // Die Anbieter kommen ueber /api/settings. Wer eigene Einstellungen
  // mitgibt, ueberschreibt gezielt -- alles Uebrige bleibt bei der Vorgabe.
  einstellungen = { suchAnbieter: DOM_ANBIETER, suchNamen: 3, ...einstellungen };
  /* Vier Zugaenge, und jeder steht fuer eine andere Lage --
     die Eigentuemerin (die Fragende selbst), ein zweiter Admin, ein
     gewoehnlicher Benutzer und ein Grabstein. Waeren sie gleichartig, liesse
     sich nicht pruefen, dass die Oberflaeche sie verschieden behandelt. */
  zugaenge = zugaenge || {
    ich: 1, darfRollen: true, eigentuemer: 1,
    zugaenge: [
      { id: 1, username: 'chefin', role: 'eigentuemer', status: 'aktiv', last_login: '2026-08-01 09:00:00', created_at: '2026-01-01 09:00:00', eintraege: 5 },
      { id: 2, username: 'bert', role: 'admin', status: 'aktiv', last_login: null, created_at: '2026-02-01 09:00:00', eintraege: 2 },
      { id: 3, username: 'carla', role: 'user', status: 'gesperrt', last_login: null, created_at: '2026-03-01 09:00:00', eintraege: 0 },
      { id: 4, username: 'geloescht-4', role: 'user', status: 'geloescht', last_login: null, created_at: '2026-04-01 09:00:00', eintraege: 1 }
    ]
  };
  /* Der Papierkorb der Prueflage. Zwei Zeilen, zwei Lagen: eine von einem
     lebenden Zugang, eine von einem Grabstein. Wer die Zahlen dieser Prueflage
     misst, misst sie an einem FRISCHEN Aufbau -- die beiden Schreibwege unten
     veraendern sie wirklich (Stolperstein 115). */
  const papierkorb = papierkorbBestand || [
    { id: 501, titel: 'Weggeworfenes', geloescht_am: '2026-08-01 09:00:00',
      loeschender: { id: 1, name: 'chefin', geloescht: false },
      dateien: 3, bytes: 2048, tageOffen: 12 },
    { id: 502, titel: 'Von einem Grabstein', geloescht_am: '2026-08-10 11:30:00',
      loeschender: { id: 4, name: null, geloescht: true },
      dateien: 0, bytes: 512, tageOffen: 27 }
  ];
  /* Die Sicherung der Prueflage. Vorgabe: eingerichtet, mit einer Sicherung
     von vor drei Tagen. Eine Prueflage kann sie ueberschreiben -- die Karte
     hat drei Zustaende (nicht eingerichtet, Zielort mit Fehler, in Ordnung),
     und jeder braucht seinen eigenen Aufbau. */
  const sicherung = sicherungStand || {
    eingerichtet: true, wurzel: '/sicherung', ort: 'taeglich', pfad: '/sicherung/taeglich',
    dbBytes: 52428800, dauerSekunden: 1, erreichbar: true, zahl: 2,
    letzte: { datei: 'kriterion-2026-08-20-03-00-00.sqlite', bytes: 52428800,
              am: '2026-08-20 03:00:00', tageHer: 3 }
  };
  const quelle = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  const kriterien = [
    { id: 7, name: 'Zuerst', sort_order: 0, usage_count: 2, gewicht: kriterienGewichte[0] },
    { id: 8, name: 'Dann', sort_order: 1, usage_count: 0, gewicht: kriterienGewichte[1] },
    { id: 9, name: 'Zuletzt', sort_order: 2, usage_count: 1, gewicht: kriterienGewichte[2] }
  ];
  /* Verfasser im Mock: der falsche Server muss antworten wie der
     echte, sonst verschwindet genau die Pruefung, fuer die er gebaut ist.
     BEWUSST VERSCHIEDENE Lagen -- ein lebender Name, ein Grabstein (Name
     null, nur die Nummer) und eine herrenlose Zeile. Waeren alle gleich,
     liesse sich nicht sehen, ob die Beschriftung ihre eigene Zeile trifft. */
  const vChefin = { id: 1, name: 'chefin', geloescht: false };
  const vBert = { id: 2, name: 'bert', geloescht: false };
  const vGrab = { id: 4, name: null, geloescht: true };
  // Ein Benutzername ist Eingabe, keine Konstante. Die Linkzeile ist seit
  // 0.8.30 die zweite Stelle in der Linkliste, an der Eingabe als Beschriftung
  // gerendert wird -- die erste sind die Anbieternamen.
  const vBoese = { id: 5, name: 'Verfasser <b id="boese-link">X</b>', geloescht: false };
  const beispiel = {
    id: 1, title: 'Beispiel', description: 'Eine Beschreibung.\nZweite Zeile.',
    rejected: false, tested: true, favorite: false, category: null,
    verfasser: vBert,
    /* ZWEI ZEILEN, UND SIE SIND VERSCHIEDENER ART -- ein Mock mit
       lauter Bildern naehme genau die Pruefungen weg, fuer die er hier
       gebraucht wird (Stolperstein 90). Das Video steht ausdruecklich NICHT an
       erster Stelle: nur so lassen sich Hauptbild und Abspielzeichen
       unabhaengig voneinander belegen. art und dauer stehen an BEIDEN Zeilen,
       so wie der echte Server sie liefert -- am Foto 'bild' und null. */
    photos: [{ id: 5, mime_type: 'image/png', focus_x: 50, focus_y: 50, sort_order: 0,
               art: 'bild', dauer: null },
             { id: 6, mime_type: 'video/mp4', focus_x: 50, focus_y: 50, sort_order: 1,
               art: 'video', dauer: 42 }],
    /* Sieben Adressen und eine Suchzeile -- an der letzten haengt die Pruefung
       der Kennzeichnung. Die Gesamtzahl bleibt acht, damit die Begrenzung der
       sichtbaren Zeilen weiter an derselben Schwelle geprueft wird.
       FUENF VERFASSERLAGEN, und sie sind der Gegenstand seit 0.8.30: vier
       Zeilen vom Verfasser des Eintrags selbst (bert -- dort steht kein Name),
       eine mit spitzen Klammern im Namen, eine von der Fragenden (chefin, also
       mine), eine herrenlose und die Suchzeile von einem Grabstein. Waeren
       alle gleich, liesse sich nicht sehen, ob die Beschriftung ihre eigene
       Zeile trifft.
       created_at steht an jeder Zeile: der echte Server liefert es, und der
       Ueberfahrtext haengt daran. */
    links: [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: 80 + i, url: `https://beispiel.de/${i}`, sort_order: i,
        created_at: '2026-08-01 10:00:00', mine: false, verfasser: vBert })),
      { id: 84, url: 'https://beispiel.de/4', sort_order: 4,
        created_at: '2026-08-01 10:30:00', mine: false, verfasser: vBoese },
      { id: 85, url: 'https://beispiel.de/5', sort_order: 5,
        created_at: '2026-08-02 11:30:00', mine: true, verfasser: vChefin },
      { id: 86, url: 'https://beispiel.de/6', sort_order: 6,
        created_at: '2026-08-03 12:00:00', mine: false, verfasser: null },
      { id: 87, url: 'Handbuch 3000', sort_order: 7,
        created_at: '2026-08-04 13:00:00', mine: false, verfasser: vGrab }
    ],
    comments: [
      /* mine und bilderEntfernt an JEDEM Kommentar: der echte Server liefert
         beides seit 0.8.3, und ein Mock, der die Antwort
         vereinfacht, loescht genau die Pruefung, fuer die er gebaut ist.
         `ich` ist Zugang 1 (chefin) -- die drei Zeilen von chefin sind
         meine, die von bert, vom Grabstein und die herrenlose sind es nicht.
         Der Bericht traegt zwei Bilder UND einen Vermerk: nur dort laesst
         sich sehen, ob die Angabe ihre eigene Zeile trifft. */
      { id: 61, text: 'Angepinnte Notiz', kind: 'note', pinned: true, verfasser: vChefin,
        mine: true, bilderEntfernt: 0,
        created_at: '2026-08-03 09:00:00', updated_at: null, images: [] },
      { id: 62, text: 'Ein Bericht', kind: 'report', pinned: false, verfasser: vBert,
        mine: false, bilderEntfernt: 1,
        created_at: '2026-08-02 09:00:00', updated_at: null,
        images: [{ id: 71, filename: 'a.jpg', sort_order: 0 },
                 { id: 72, filename: 'b.jpg', sort_order: 1 }] },
      // Der Grabstein: die Antwort nennt nur die Nummer, die Beschriftung
      // entsteht in app.js. Und die herrenlose Zeile daneben -- zwei
      // verschiedene Aussagen, die nicht dieselbe Beschriftung bekommen duerfen.
      { id: 63, text: 'Gewöhnliche Notiz', kind: 'note', pinned: false, verfasser: vGrab,
        mine: false, bilderEntfernt: 2,
        created_at: '2026-08-01 09:00:00', updated_at: '2026-08-01 10:00:00', images: [] },
      // Der vierte traegt alles, was am Kommentartext haengt: Markup, das
      // niemals Markup werden darf; eine Adresse mit & in der Abfragezeile
      // (zerlegt wird der Rohtext, nicht der maskierte); ein nachlaufendes
      // Komma und ein nachlaufender Punkt; www. ohne Schema; ein blankes
      // beispiel.de, das ausdruecklich kein Link wird; und ein javascript:,
      // das Schranke 1 gar nicht erst passieren darf.
      { id: 64, text: 'Siehe <b>hier</b>: https://beispiel.de/pfad?a=1&b=2, dazu www.beispiel.de. '
          + 'Nicht beispiel.de und nicht javascript:alert(1)',
        kind: 'note', pinned: false, verfasser: null, mine: false, bilderEntfernt: 0,
        created_at: '2026-07-31 09:00:00', updated_at: null, images: [] },
      { id: 65, text: 'Eine Aufgabe', kind: 'task', pinned: false, verfasser: vChefin,
        mine: true, bilderEntfernt: 0,
        created_at: '2026-07-30 09:00:00', updated_at: null, images: [] },
      { id: 66, text: 'Schon erledigt', kind: 'done', pinned: false, verfasser: vChefin,
        mine: true, bilderEntfernt: 0,
        created_at: '2026-07-29 09:00:00', updated_at: null, images: [] }
    ],
    attachments: [
      /* Vier Verfasserlagen wie an der Linkzeile: zwei vom Verfasser des
         Eintrags (dort steht kein Name), eine von der Fragenden (mine) und
         eine herrenlose. created_at traegt den Ueberfahrtext. */
      { id: 41, filename: 'notiz.txt', mime_type: 'text/plain', size: 120, sort_order: 0, preview: 'text',
        created_at: '2026-08-01 10:00:00', mine: false, verfasser: vBert },
      { id: 42, filename: 'foto.png', mime_type: 'image/png', size: 2048, sort_order: 1, preview: 'bild',
        created_at: '2026-08-01 11:00:00', mine: false, verfasser: vBert },
      { id: 43, filename: 'doku.pdf', mime_type: 'application/pdf', size: 900000, sort_order: 2, preview: 'pdf',
        created_at: '2026-08-02 12:00:00', mine: true, verfasser: vChefin },
      { id: 44, filename: 'archiv.zip', mime_type: 'application/zip', size: 5242880, sort_order: 3, preview: 'keine',
        created_at: '2026-08-03 13:00:00', mine: false, verfasser: null }
    ],
    tags: tags.filter(t => t.vergeben),
    // mine: der echte Server sagt zu jedem Testtag, ob er dem
    // Abrufenden gehoert. Der Mock muss das mitliefern -- sonst
    // zeichnete die Zeitleiste hier alles gefuellt und die Unterscheidung
    // waere unpruefbar.
    testDays: [{ id: 3, day: '2026-08-01', rating: 4, mine: true, verfasser: vChefin,
                 tags: [{ id: 91, name: 'Regen' }] }],
    // avg und count stehen an jeder Zeile. Bewusst VERSCHIEDENE
    // Werte je Kriterium: gleiche machten die Pruefung blind dafuer, ob die
    // Spalte ihre eigene Zeile trifft. Das dritte Kriterium hat niemand
    // bewertet -- dort bleibt die Spalte leer.
    // WER WELCHEN WERT VERGEBEN HAT, STEHT HIER SEIT 0.8.6 NICHT MEHR: der
    // echte Server liefert es an dieser Antwort nicht mehr aus, und ein
    // Mock, der es doch taete, machte die Pruefung darauf wertlos.
    // gewicht steht an JEDER Kriterienzeile -- der echte Server liefert es seit
    // 0.8.40, und ein Mock, der die Antwort vereinfacht, loescht
    // genau die Pruefung, fuer die er gebaut ist.
    ratings: kriterien.map((c, i) => ({
      criterion_id: c.id, name: c.name, value: eigeneWerte[i], gewicht: c.gewicht,
      avg: [3.4, 4.1, null][i], count: [5, 2, 0][i] })),
    avgRating: 3, testCount: 1, testAvg: 4, testLast: 4,
    // Reine Anzeige, seit 0.8.6 in der Verfasserzeile. Ohne dieses Feld
    // zeichnete die Zeile ins Leere und jede Pruefung darauf waere blind.
    created_at: '2026-07-20 14:30:00'
  };
  /* Die Antwort des neuen Endpunkts GET /api/items/:id/stimmen -- wer welchen
     Wert vergeben hat, je Kriterium. Die Zahl der Stimmen stimmt mit count in
     den Zeilen darueber ueberein; ein Mock, der sich hier
     widerspricht, macht jede Pruefung darauf wertlos.
     Die erste Zeile traegt alle vier Lagen nebeneinander: die eigene Stimme
     (kein Loeschkreuz), zwei fremde lebende, einen Grabstein und eine
     herrenlose. Das dritte Kriterium kommt GAR NICHT VOR -- der echte Server
     nimmt nur Kriterien mit Stimmen auf. */
  const stimmenAntwort = [
    { criterion_id: 7, stimmen: [
      { id: 501, wert: 3, mine: true, verfasser: vChefin },
      { id: 502, wert: 4, mine: false, verfasser: vBert },
      { id: 503, wert: 2, mine: false, verfasser: vGrab },
      { id: 504, wert: 4, mine: false, verfasser: null },
      { id: 505, wert: 4, mine: false, verfasser: { id: 3, name: 'carla', geloescht: false } }] },
    { criterion_id: 8, stimmen: [
      { id: 506, wert: 3, mine: true, verfasser: vChefin },
      { id: 507, wert: 5, mine: false, verfasser: vBert }] }
  ];
  const uebersicht = [{
    id: 1, title: 'Beispiel', rejected: false, tested: true, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: 3, testCount: 2, testAvg: 4, testLast: 4,
    updated_at: '2026-08-01 10:00:00', searchText: 'beispiel'
  }];
  /* Der Bestand fuer die Ansicht "Offen". EIGENE Zeilen neben beispiel.comments,
     und zwar aus ZWEI Eintraegen -- an einem einzigen liesse sich die
     Gruppierung gar nicht sehen.
     VIER ARTEN NEBENEINANDER (Stolperstein 90): zwei offene Aufgaben, eine
     erledigte, eine Notiz und ein Bericht. Eine Prueflage mit lauter offenen
     Aufgaben naehme genau die Pruefung weg, fuer die sie gebaut wird -- dass
     die Ansicht die drei anderen NICHT zeigt.
     DREI VERFASSERLAGEN: die Fragende selbst (mine), ein Fremder und ein
     Grabstein. Ohne sie liesse sich nicht sehen, ob der Haken seiner eigenen
     Zeile folgt.
     `kind` steht an jeder Zeile, obwohl der echte Endpunkt es nicht
     ausliefert: der Mock braucht es, um beim Schreiben WIRKLICH eine
     andere Antwort zu geben. Gaebe er stur dieselbe Liste zurueck, waere "die
     Ansicht hat den Haken gesetzt" von "nichts ist passiert" nicht zu
     unterscheiden. */
  const offen = offenBestand || [
    { id: 65, kind: 'task', text: 'Eine Aufgabe', created_at: '2026-07-30 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: true, verfasser: vChefin },
    { id: 66, kind: 'done', text: 'Schon erledigt', created_at: '2026-07-29 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: true, verfasser: vChefin },
    { id: 61, kind: 'note', text: 'Angepinnte Notiz', created_at: '2026-08-03 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: true, verfasser: vChefin },
    { id: 62, kind: 'report', text: 'Ein Bericht', created_at: '2026-08-02 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: false, verfasser: vBert },
    { id: 67, kind: 'task', text: 'Fremde Aufgabe', created_at: '2026-07-28 09:00:00',
      item: { id: 2, title: 'Zweites' }, mine: false, verfasser: vBert },
    { id: 68, kind: 'task', text: 'Herrenlose Aufgabe', created_at: '2026-07-27 09:00:00',
      item: { id: 2, title: 'Zweites' }, mine: false, verfasser: vGrab }
  ];
  const gesendet = [];

  /* jsdom kennt <video> als Element, aber nicht seine Methoden: pause() und
     load() melden sich als jsdomError. Das ist Laerm, kein Befund -- die
     Oberflaeche RUFT sie richtig, und genau das prueft die Gruppe "Videos am
     Bildschirm" an hidden und src. Gefiltert wird deshalb genau diese eine
     Meldung; alles andere geht unveraendert durch, damit kein echter Fehler
     hier verschwindet. */
  const stilleKonsole = new VirtualConsole();
  stilleKonsole.forwardTo(console, { jsdomErrors: 'none' });
  stilleKonsole.on('jsdomError', (e) => {
    if (!/Not implemented: HTMLMediaElement/.test(e?.message || ''))
      console.error(e?.type === 'unhandled-exception' ? e.cause?.stack : e?.message);
  });
  const dom = new JSDOM(
    `<!DOCTYPE html><html lang="de"><body><div id="app"></div>` +
    `<p class="version-zeile" id="version"></p></body></html>`,
    { runScripts: 'dangerously', url: `${BASIS}/${hash}`, virtualConsole: stilleKonsole });
  const w = dom.window;
  w.fetch = async (url, opt = {}) => {
    gesendet.push({ methode: opt.method || 'GET', url, koerper: opt.body ? JSON.parse(opt.body) : null });
    const gib = (o, status = 200) => ({ ok: status < 400, status, json: async () => o });
    if (url === '/api/config') return gib({ title: 'Oeffentlich', version: require('./package.json').version,
      setupRequired: einrichtung, minPassword: 10 });
    if (url === '/api/session') return gib({ authenticated: angemeldet });
    if (url === '/api/account') return gib({ username: 'chefin', minPassword: 10 });
    if (url === '/api/titles') return gib({ publicTitle: 'Oeffentlich', appTitle: 'Intern' });
    if (url === '/api/criteria') return gib(kriterien);
    if (url === '/api/criteria/order') return gib(kriterien);
    if (url === '/api/tags') return gib(tags);
    /* NICHT LEER. Eine leere Karte hat keine Zeilen, und eine Pruefung darauf,
       dass an ihren Zeilen etwas NICHT steht, bliebe auf null Zeilen gruen und
       belegte nichts (Stolperstein 81). Genau das ist beim Bau von 0.8.40 an
       der Gegenprobe zum Gewichtsfeld aufgefallen. */
    if (url === '/api/product-categories') return gib(kategorien);
    /* Der eigene Name steht seit 0.8.6 in dieser Antwort, und der
       Mock liefert ihn mit -- sonst bliebe die Kopfzeile leer und
       jede Pruefung darauf blind. Als Vorgabe DERSELBE Name wie unter
       /api/account; eine Prueflage kann ihn ueberschreiben. */
    if (url === '/api/settings') return gib({ name: 'chefin', papierkorbTage: 30, ...einstellungen });
    /* DER PAPIERKORB IM MOCK, und er muss BEIDE Zustaende koennen: gefuellt
       und leer. Eine Karte ohne Zeilen belegte nichts ueber die Zeilen, eine
       ohne den leeren Fall nichts ueber die Auskunft "hier liegt nichts"
       (Stolperstein 81).
       ZWEI ZEILEN, UND SIE SIND VERSCHIEDENER ART: eine von einem lebenden
       Zugang, eine von einem GRABSTEIN (loeschender.name null). Waeren beide
       gleich, liesse sich nicht sehen, ob die Beschriftung ihre eigene Zeile
       trifft.
       ER STEHT HINTER dem Admin, wie der echte Server -- antwortete er jedem
       mit 200, waere die Rolle unpruefbar. */
    if (url === '/api/papierkorb') {
      if (einstellungen.istAdmin === false)
        return gib({ error: 'Das verwaltet nur der Admin.' }, 403);
      return gib({ tage: 30, zeilen: papierkorb });
    }
    /* Die Sicherung. Sie steht hinter dem EIGENTUEMER, und der Mock macht das
       mit -- antwortete er jedem mit 200, waere die Rolle unpruefbar. */
    if (url === '/api/sicherung' && (opt.method || 'GET') === 'GET') {
      if (einstellungen.istEigentuemer === false)
        return gib({ error: 'Das kann nur der Eigentümer der Anlage.' }, 403);
      return gib(sicherung);
    }
    /* Und die beiden Schreibwege, die ihren Stand WIRKLICH aendern
       (Stolperstein 90): ein Mock, der stur denselben Stand zurueckgaebe,
       machte "die Karte zeichnet sich neu" von "die Karte blieb stehen"
       ununterscheidbar. */
    if (url === '/api/sicherung/ort' && opt.method === 'PUT') {
      const ort = String(JSON.parse(opt.body || '{}').ort || '');
      if (ort.includes('..') || ort.startsWith('/'))
        return gib({ error: 'Der Ort ist ein Unterverzeichnis des eingerichteten Sicherungsorts.' }, 400);
      sicherung.ort = ort;
      sicherung.pfad = ort ? `/sicherung/${ort}` : '/sicherung';
      sicherung.fehler = null;
      return gib({ ok: true, ort, pfad: sicherung.pfad, erreichbar: true,
                   zahl: sicherung.zahl, letzte: sicherung.letzte });
    }
    if (url === '/api/sicherung' && opt.method === 'POST') {
      const datei = 'kriterion-2026-08-23-19-00-00.sqlite';
      sicherung.zahl = (sicherung.zahl || 0) + 1;
      sicherung.letzte = { datei, bytes: 52428800, am: '2026-08-23 19:00:00', tageHer: 0 };
      sicherung.erreichbar = true;
      return gib({ ok: true, datei, pfad: sicherung.pfad, bytes: 52428800, ms: 512,
                   erreichbar: true, zahl: sicherung.zahl, letzte: sicherung.letzte });
    }
    /* Und die beiden Wege, die den Bestand WIRKLICH aendern (Stolperstein 90):
       ein Mock, der beim Zurueckholen zwar antwortet, aber dieselbe Liste
       weiterliefert, macht "die Karte zeichnet sich neu" von "die Karte blieb
       stehen" ununterscheidbar -- beide Faelle blieben gruen. */
    if (/^\/api\/papierkorb\/\d+\/wiederherstellen$/.test(url) && opt.method === 'POST') {
      const nr = Number(url.split('/')[3]);
      const weg = papierkorb.findIndex(z => z.id === nr);
      if (weg < 0) return gib({ error: 'Nicht gefunden' }, 404);
      const [zeile] = papierkorb.splice(weg, 1);
      return gib({ ok: true, itemId: 77, titel: zeile.titel, items: 1,
                   verfasserUnbekannt: zeile.id === 502 ? ['dora'] : [] });
    }
    if (/^\/api\/papierkorb\/\d+$/.test(url) && opt.method === 'DELETE') {
      const nr = Number(url.split('/').pop());
      const weg = papierkorb.findIndex(z => z.id === nr);
      if (weg < 0) return gib({ error: 'Nicht gefunden' }, 404);
      papierkorb.splice(weg, 1);
      return { ok: true, status: 204, json: async () => ({}) };
    }
    // Die Karte "Zugaenge" holt sich die Liste selbst. Ohne diese
    // Zeile bekaeme sie {} und zeichnete gar nichts -- und jede Pruefung auf
    // die Karte waere blind dafuer, ob sie ueberhaupt gefuellt wird.
    if (url === '/api/users') return gib(zugaenge);
    if (/^\/api\/users\/\d+\/bestand$/.test(url))
      return gib({ username: 'bert', eintraege: 2, fremdKommentare: 3, fremdBewertungen: 1,
                   fremdTesttage: 0, kommentare: 4, bewertungen: 2, testtage: 1 });
    if (url === '/api/items') return gib(uebersichtItems || uebersicht);
    /* Ein ZWEITER Eintrag, nur fuer den Vergleich: dort holt die Ansicht
       mehrere Detailantworten nebeneinander. Ohne ihn faende sie fuer die
       zweite Nummer das leere Objekt und zerbraeche an dessen fehlenden
       Feldern -- der Lauf stuerzte ab, statt eine Pruefung rot zu faerben.
       Er steht VOR dem Sammelfall fuer /api/items/1, damit startsWith ihn
       nicht abfaengt. */
    if (zweiterEintrag && url === `/api/items/${zweiterEintrag.id}`) return gib(zweiterEintrag);
    /* PUT auf den Eintrag: der echte Server antwortet mit detail() NACH der
       Aenderung, der Mock muss das nachmachen. Gaebe er stur den
       alten Stand zurueck, pruefte man jedes Bedienelement gegen einen
       Zustand, den es nach dem Klick nie gab -- und ein Knopf, der sich gar
       nicht neu zeichnet, waere von einem, der richtig zeichnet, nicht zu
       unterscheiden. Nur der Eintrag selbst, nicht seine Unterwege
       (/comments, /tags, /photos ...). */
    if (url === '/api/items/1' && opt.method === 'PUT') {
      Object.assign(beispiel, JSON.parse(opt.body || '{}'));
      return gib(beispiel);
    }
    /* VOR dem Sammelfall darunter: startsWith('/api/items/1') faenge diesen
       Pfad sonst ab und lieferte den ganzen Eintrag. Verschiedene Zahlen in
       jedem Feld, damit sich sehen laesst, ob der Dialog jede an ihrer
       richtigen Stelle nennt. */
    if (url === '/api/items/1/bestand')
      return gib({ fotos: 1,
                   eigenDateien: 5, fremdDateien: 7,
                   eigenLinks: 6, fremdLinks: 8,
                   eigenKommentare: 2, fremdKommentare: 4,
                   eigenBewertungen: 1, fremdBewertungen: 3,
                   eigenTesttage: 1, fremdTesttage: 2 });
    /* Wer welchen Wert vergeben hat -- seit 0.8.6 ein eigener Endpunkt hinter
       nurAdmin, und der Mock macht BEIDES mit. Antwortete er jedem
       mit 200, waere die Rolle unpruefbar; antwortete er mit dem leeren
       Objekt, zeichnete die Ansicht nichts und jede Pruefung darauf waere
       blind -- dieselbe Ueberlegung wie bei /api/users und /api/stats.
       VOR dem Sammelfall darunter: startsWith('/api/items/1') faenge den Pfad
       sonst ab und lieferte den ganzen Eintrag. */
    if (url === '/api/items/1/stimmen') {
      if (einstellungen.istAdmin === false)
        return gib({ error: 'Das verwaltet nur der Admin.' }, 403);
      return gib(stimmenAntwort);
    }
    // Der Weg fuer eine fremde Bewertung. Der echte Server antwortet mit dem
    // neu gezeichneten Eintrag -- UND die Stimme ist danach wirklich weg. Ohne
    // das zweite waere ein Neuzeichnen der Adminansicht von einem
    // stehengebliebenen Stand nicht zu unterscheiden.
    if (/^\/api\/ratings\/\d+$/.test(url) && opt.method === 'DELETE') {
      const weg = Number(url.split('/').pop());
      for (const z of stimmenAntwort) z.stimmen = z.stimmen.filter(st => st.id !== weg);
      return gib(beispiel);
    }
    /* PUT auf ein Kriterium. Der echte Server antwortet mit der GESPEICHERTEN
       Zeile -- also mit dem auf Hundertstel gerundeten Gewicht, und mit einer
       Absage, wenn der Wert die Spanne verlaesst. Ein Mock, der stur
       200 und den geschickten Wert zurueckgaebe, naehme genau die beiden
       Pruefungen weg, fuer die er hier gebraucht wird: dass das Feld die
       Rundung zeigt, und dass es sich nach einer Absage zurueckstellt. */
    if (/^\/api\/criteria\/\d+$/.test(url) && opt.method === 'PUT') {
      const k = kriterien.find(c => c.id === Number(url.split('/').pop()));
      const koerper = JSON.parse(opt.body || '{}');
      if (koerper.gewicht !== undefined) {
        const g = Number(koerper.gewicht);
        if (!Number.isFinite(g) || g < 0.2 || g > 2)
          return gib({ error: 'Das Gewicht muss eine Zahl zwischen 0,2 und 2 sein.' }, 400);
        k.gewicht = Math.round(g * 100) / 100;
      }
      if (koerper.name) k.name = koerper.name;
      return gib({ ...k });
    }
    /* Die Ansicht "Offen". Gefiltert wird HIER, wie im echten Server: nur die
       Art 'task' geht hinaus, und `kind` selbst steht nicht in der Antwort --
       der echte Endpunkt liefert es nicht, und ein Mock, der mehr
       mitschickt, machte jede Pruefung darauf wertlos. */
    if (url === '/api/offen')
      return gib(offen.filter(z => z.kind === 'task').map(z => ({
        id: z.id, text: z.text, created_at: z.created_at,
        item: z.item, mine: z.mine, verfasser: z.verfasser })));
    /* PUT auf einen Kommentar: der echte Server schreibt die Art und antwortet
       mit dem neu gebauten Eintrag. Der Mock muss BEIDES nachmachen --
       antwortete er nur, ohne seinen Bestand zu aendern, waere ein gesetzter
       Haken von einem verschluckten nicht zu unterscheiden (Stolperstein 90).
       Er steht VOR dem Sammelfall darunter, der jedem Kommentarweg den ganzen
       Eintrag zurueckgibt. */
    if (/^\/api\/comments\/\d+$/.test(url) && opt.method === 'PUT') {
      const nr = Number(url.split('/').pop());
      const koerper = JSON.parse(opt.body || '{}');
      if (koerper.kind !== undefined) {
        const zeile = offen.find(z => z.id === nr);
        if (zeile) zeile.kind = koerper.kind;
        const k = beispiel.comments.find(c => c.id === nr);
        if (k) k.kind = koerper.kind;
      }
      return gib(beispiel);
    }
    if (url.startsWith('/api/items/1')) return gib(beispiel);
    // Endpunkte, die den ganzen Eintrag zurueckgeben. Ohne das wird `item` im
    // Frontend leer, und alles Folgende bricht -- der Prueflauf stuerzte
    // daran ab, statt eine Pruefung rot zu faerben.
    if (/^\/api\/comments\/\d+/.test(url) || /^\/api\/comment-images\/\d+$/.test(url) ||
        /^\/api\/items\/1\/comments$/.test(url))
      return gib(beispiel);
    if (url.startsWith('/api/attachments/41/preview'))
      return gib({ art: 'text', text: 'Erste Zeile\nZweite Zeile', gekuerzt: false });
    /* Die Kennzahlen stehen seit 0.8.5 hinter nurAdmin, und der Mock
       macht das mit. Antwortete er jedem mit 200, verdeckte er genau die
       Falle, um die es in dieser Stufe geht: renderSystem() haengt sechs
       Abrufe in EIN Promise.all, und ein einziger Fehlschlag verliesse den
       Rumpf mit return -- der Systembereich bliebe fuer einen gewoehnlichen
       Benutzer vollstaendig leer, auch die Karten, die ihm zustehen. */
    if (url === '/api/stats') {
      if (einstellungen.istAdmin === false)
        return gib({ error: 'Das verwaltet nur der Admin.' }, 403);
      /* Der Fingerprint gehoert seit 0.8.10 dazu. Ein Mock, der ihn
         auslaesst, macht jede Pruefung an der Karte blind: sie zeichnete
         nichts, und "die Zeile fehlt" waere von "die Zeile ist falsch" nicht
         zu unterscheiden (Stolperstein 90). */
      /* videoCount/videoBytes und papierkorbCount/papierkorbBytes stehen hier,
         weil die Karten sie LESEN: die Exportkarte rechnet die erwartete
         Groesse aus videoBytes, die Kennzahlenkarte zeigt den Papierkorb als
         eigene Zeile. Ein Mock, der ein gelesenes Feld auslaesst, deckt die
         Serverseite zu (Stolperstein 90). */
      return gib({ dbBytes: 1, photoCount: 0, photoBytes: 0, itemCount: 1,
        videoCount: 0, videoBytes: 0,
        commentCount: 0, linkCount: 0, testDayCount: 0, attachmentCount: 4, attachmentBytes: 6144,
        papierkorbCount: 2, papierkorbBytes: 2560,
        version: require('./package.json').version, fingerprint: 'a1b2c3d4',
        keyFromEnv: false, keyHex: 'ab'.repeat(32) });
    }
    return gib({});
  };
  const skript = w.document.createElement('script');
  skript.textContent = quelle;
  // In den Kopf, nicht in den Rumpf: sonst steht der gesamte Quelltext in
  // document.body.textContent und jede Textpruefung findet dort Woerter,
  // die auf dem Bildschirm gar nicht stehen.
  w.document.head.appendChild(skript);
  return { w, gesendet, kriterien, beispiel, stimmenAntwort };
}

async function pruefeOberflaeche() {
  gruppe('Oberflaeche');
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch {
    uebersprungen += 38;
    console.log('  … uebersprungen: jsdom fehlt (npm install)');
    return;
  }

  const { w, gesendet, kriterien, beispiel } = baueDom(JSDOM);
  await new Promise(r => setTimeout(r, 60));

  /* --- Mitwachsendes Feld: die Rechnung, nicht nur das Vorhandensein --- */
  const feld = w.document.createElement('textarea');
  w.document.body.appendChild(feld);
  let inhaltshoehe = 180;
  Object.defineProperty(feld, 'scrollHeight', { get: () => inhaltshoehe });
  Object.defineProperty(feld, 'offsetHeight', { get: () => 42 });   // mit Rahmen
  Object.defineProperty(feld, 'clientHeight', { get: () => 40 });   // ohne Rahmen
  w.autoGrow(feld);
  pruefe('Hoehe folgt dem Inhalt und rechnet den Rahmen dazu', feld.style.height === '182px', `ist: ${feld.style.height}`);
  pruefe('Feld wird als mitwachsend gekennzeichnet', feld.classList.contains('ta-auto'));
  inhaltshoehe = 300;
  feld.dispatchEvent(new w.Event('input'));
  pruefe('Neue Zeile vergroessert das Feld', feld.style.height === '302px', `ist: ${feld.style.height}`);

  /* --- Kein Sprung nach oben beim Tippen ---
   * jsdom rechnet kein Layout: das Zusammenfallen bei height:auto verkuerzt
   * hier keine Seite, und der Browser zieht nichts nach. Beides wird deshalb
   * gestellt -- ein eigenes scrollingElement, und das Messen selbst reisst die
   * Position auf 0, genau wie es der Browser tut. Die Pruefung verlangt, dass
   * sie danach wieder auf dem alten Wert steht. */
  const bildlauf = { scrollTop: 0 };
  Object.defineProperty(w.document, 'scrollingElement', { configurable: true, get: () => bildlauf });
  const feld2 = w.document.createElement('textarea');
  w.document.body.appendChild(feld2);
  Object.defineProperty(feld2, 'scrollHeight', { get: () => 240 });
  Object.defineProperty(feld2, 'offsetHeight', { get: () => 42 });
  Object.defineProperty(feld2, 'clientHeight', { get: () => 40 });
  // Das Zurueckziehen haengt am Setzen von height:auto, nicht am Messen. Wird
  // es an der falschen Stelle gestellt, laesst sich nicht mehr unterscheiden,
  // ob die Position VOR dem Zusammenfallen gemerkt wurde.
  let gesetzteHoehe = '';
  Object.defineProperty(feld2.style, 'height', {
    configurable: true,
    get: () => gesetzteHoehe,
    set: (v) => { gesetzteHoehe = v; if (v === 'auto') bildlauf.scrollTop = 0; }
  });
  bildlauf.scrollTop = 900;
  w.autoGrow(feld2);
  pruefe('Bildlaufposition ueberlebt das erste Messen', bildlauf.scrollTop === 900, `ist: ${bildlauf.scrollTop}`);
  pruefe('Hoehe wird dabei trotzdem richtig gesetzt', feld2.style.height === '242px', `ist: ${feld2.style.height}`);
  bildlauf.scrollTop = 640;
  feld2.dispatchEvent(new w.Event('input'));
  pruefe('Bildlaufposition ueberlebt auch jeden Tastendruck', bildlauf.scrollTop === 640, `ist: ${bildlauf.scrollTop}`);

  /* --- Einrichtung geht der Anmeldung vor --- */
  const einDom = baueDom(JSDOM, { einrichtung: true, angemeldet: false });
  await new Promise(r => setTimeout(r, 80));
  const eText = einDom.w.document.body.textContent;
  pruefe('Bei Einrichtungsbedarf kommt die Einrichtungsseite, nicht die Anmeldung',
    !!einDom.w.document.getElementById('sb') && !einDom.w.document.getElementById('lb'));
  pruefe('Sie verlangt zwei Passwortfelder',
    !!einDom.w.document.getElementById('sp') && !!einDom.w.document.getElementById('sp2'));
  pruefe('Sie nennt die Mindestlaenge', /10 Zeichen/.test(eText));
  pruefe('Sie verraet den Bestand nicht',
    !eText.includes('Intern') && !eText.includes('Beispiel'), eText.slice(0, 120));
  // Ohne Uebereinstimmung darf nichts an den Server gehen -- sonst waere ein
  // Tippfehler im Passwort sofort endgueltig.
  einDom.w.document.getElementById('su').value = 'chefin';
  einDom.w.document.getElementById('sp').value = 'zehn-zeichen-und-mehr';
  einDom.w.document.getElementById('sp2').value = 'zehn-zeichen-und-mahr';
  einDom.gesendet.length = 0;
  einDom.w.document.getElementById('sb').click();
  await new Promise(r => setTimeout(r, 40));
  pruefe('Zwei ungleiche Passwoerter gehen nicht an den Server',
    !einDom.gesendet.some(g => g.url === '/api/setup'),
    JSON.stringify(einDom.gesendet.map(g => g.url)));
  pruefe('Und die Seite sagt, woran es lag',
    /stimmen nicht überein/.test(einDom.w.document.body.textContent));

  /* --- Anmeldeseite: Versionszeile ohne Scrollen erreichbar ---
   * .login-screen nimmt mit min-height: 100vh das ganze Fenster ein, die
   * Versionszeile steht ausserhalb von #app darunter. Ohne Gegenmassnahme ist
   * die Seite hoeher als das Fenster. jsdom rechnet kein Layout; pruefen
   * laesst sich das nur an beiden Enden: dass die Kennzeichnung gesetzt und
   * wieder genommen wird, und dass am Stylesheet eine Regel dafuer haengt. */
  w.showLogin();
  pruefe('Anmeldeseite kennzeichnet sich am body', w.document.body.classList.contains('anmeldung'));
  const cssAnm = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  pruefe('Stylesheet teilt dort die Fensterhoehe auf',
    /body\.anmeldung \{[^}]*min-height: *100vh/.test(cssAnm) &&
    /body\.anmeldung \.login-screen \{[^}]*min-height: *0/.test(cssAnm),
    'Regel fuer body.anmeldung fehlt oder hebt die 100vh der Anmeldeseite nicht auf');
  pruefe('Karte darf nicht schrumpfen, sondern die Seite wachsen',
    /body\.anmeldung \.login-screen \{[^}]*flex: *1 0 auto/.test(cssAnm));

  // Ueber start(), nicht ueber renderDetail: das ist der einzige Weg, den es
  // nach einer Anmeldung wirklich gibt.
  await w.start();
  pruefe('Nach der Anmeldung ist die Kennzeichnung wieder weg',
    !w.document.body.classList.contains('anmeldung'));

  /* --- Detailansicht --- */
  await w.renderDetail(1);
  const beschreibung = w.document.getElementById('desc');
  pruefe('Beschreibungsfeld waechst mit', beschreibung.classList.contains('ta-auto'));
  pruefe('Kommentarfeld waechst mit', w.document.getElementById('ctext').classList.contains('ta-auto'));
  pruefe('Beschreibung steht unveraendert im Feld', beschreibung.value === beispiel.description);
  // firstChild, nicht textContent: hinter dem Namen kann die Gewichtsmarke
  // stehen, und die gehoert nicht zum Namen.
  const zeilen = [...w.document.querySelectorAll('#ratings .rname')]
    .map(e => e.firstChild.textContent.trim());
  pruefe('Bewertungsblock folgt der Serverreihenfolge',
    gleich(zeilen, ['Zuerst', 'Dann', 'Zuletzt']), JSON.stringify(zeilen));
  // Die Bewertungszeile traegt keinen Loeschknopf -- weder
  // sichtbar noch versteckt. Die Regel im Stylesheet allein genuegt nicht als
  // Nachweis: der Knopf koennte im DOM stehen und trotzdem anklickbar sein.
  const bewZeilen = [...w.document.querySelectorAll('#ratings .rrow')];
  pruefe('Keine Bewertungszeile trägt einen Löschknopf',
    bewZeilen.length === 3 && bewZeilen.every(z => !z.querySelector('.xdel')),
    bewZeilen.map(z => z.querySelector('.racts')?.innerHTML || '').join(' | '));
  pruefe('Die Sterne stehen weiterhin dort',
    bewZeilen.every(z => !!z.querySelector('.racts')?.children.length));

  /* --- Systembereich --- */
  await w.renderSystem();
  const kasten = w.document.getElementById('mcrits');
  pruefe('Systembereich zeigt die Kriterienkarte', !!kasten);
  const reihen = [...kasten.querySelectorAll('.mrow')];
  pruefe('Alle Kriterien werden aufgelistet',
    gleich(reihen.map(r => r.querySelector('.mname').textContent), ['Zuerst', 'Dann', 'Zuletzt']));
  pruefe('Zeilen haben einen Griff', reihen.every(r => r.querySelector('.grip')));
  pruefe('Kategorien behalten ihre Zeilen ohne Griff',
    !w.document.querySelector('#mcats .grip') && !w.document.querySelector('#mtags .grip'));
  pruefe('Zaehler nennt die Eintraege', reihen[0].querySelector('.mcount').textContent.trim() === '2 Einträge');

  /* --- Ziehen: echte Zeigerereignisse auf den gerenderten Zeilen --- */
  w.document.elementFromPoint = () => reihen[2];      // jsdom kennt das sonst nicht
  const zeiger = (art, y) => {
    const e = new w.Event(art, { bubbles: true });
    Object.defineProperty(e, 'clientX', { value: 0 });
    Object.defineProperty(e, 'clientY', { value: y });
    return e;
  };
  reihen[0].dispatchEvent(zeiger('pointerdown', 0));
  w.document.dispatchEvent(zeiger('pointermove', 120));
  w.document.dispatchEvent(zeiger('pointerup', 120));
  await new Promise(r => setTimeout(r, 30));

  const befehl = gesendet.filter(s => s.url === '/api/criteria/order').pop();
  pruefe('Ziehen schickt die neue Reihenfolge', !!befehl && befehl.methode === 'PUT', JSON.stringify(befehl));
  pruefe('Gezogene Zeile landet an der neuen Stelle',
    befehl && gleich(befehl.koerper.order, [8, 9, 7]), JSON.stringify(befehl && befehl.koerper));

  // Anfassen und wieder loslassen, ohne die Schwelle zu ueberschreiten: darf
  // nichts schreiben. Die Liste wurde nach dem Ziehen neu aufgebaut, deshalb
  // frische Zeilen holen.
  const frisch = [...w.document.querySelectorAll('#mcrits .mrow')];
  frisch[0].dispatchEvent(zeiger('pointerdown', 0));
  w.document.dispatchEvent(zeiger('pointerup', 2));
  await new Promise(r => setTimeout(r, 30));
  pruefe('Blosses Anfassen ohne Bewegung sortiert nichts',
    gesendet.filter(s => s.url === '/api/criteria/order').length === 1,
    `${gesendet.filter(s => s.url === '/api/criteria/order').length} Aufrufe`);

  /* --- Die persoenlichen Schalter, mit wirklich zugestelltem Klick ---
   * Ein Bedienelement ist erst geprueft, wenn ein Ereignis wirklich
   * zugestellt wurde und der Event Loop durchlaufen ist. Die vier
   * Schalter hier schreiben in die persoenliche Tabelle, und genau dort
   * saesse ein Fehler.
   *
   * .click() oder den Behandler von Hand zu rufen genuegt nicht: ein Fehler
   * in einem Behandler, der nach einem `await` weiterlaeuft, entsteht erst
   * beim echten Ereignis. Deshalb dispatchEvent und danach ein Durchlauf.
   *
   * Die beiden Schalter zeichnen ihren Zustand aus der eigenen Variablen neu,
   * NICHT aus der Antwort des Servers -- deshalb faellt hier nicht auf, dass
   * der Mock auf PUT stur den alten Stand zurueckgibt. Das ist hier
   * folgenlos: der Zustand kommt gar nicht von dort. Wer diese Schalter
   * einmal auf die Serverantwort umstellt, muss den Mock mit
   * umstellen. */
  const schriftKnoepfe = [...w.document.querySelectorAll('#fsize .pill')];
  const zielSchrift = schriftKnoepfe.find(b => b.textContent === '120 %');
  zielSchrift?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 30));
  const putSchrift = gesendet.filter(s => s.url === '/api/settings' && s.methode === 'PUT')
    .filter(s => s.koerper && s.koerper.schrift !== undefined).pop();
  pruefe('Der Klick auf die Schriftgroesse wird wirklich zugestellt',
    !!putSchrift, JSON.stringify(gesendet.filter(s => s.url === '/api/settings')));
  pruefe('Und schickt die gewaehlte Stufe',
    putSchrift?.koerper.schrift === 120, JSON.stringify(putSchrift?.koerper));
  pruefe('Der Knopf zeichnet sich nach dem Klick neu',
    [...w.document.querySelectorAll('#fsize .pill')]
      .find(b => b.classList.contains('on'))?.textContent === '120 %',
    [...w.document.querySelectorAll('#fsize .pill')]
      .map(b => b.textContent + (b.classList.contains('on') ? '*' : '')).join(' '));
  pruefe('Und die Schriftgroesse steht sofort am Wurzelelement',
    parseFloat(w.document.documentElement.style.fontSize) === 18,
    w.document.documentElement.style.fontSize);

  const zeilenKnoepfe = [...w.document.querySelectorAll('#lzeilen .pill')];
  zeilenKnoepfe.find(b => b.textContent === '12 Zeilen')
    ?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 30));
  const putZeilen = gesendet.filter(s => s.url === '/api/settings' && s.methode === 'PUT')
    .filter(s => s.koerper && s.koerper.linkZeilen !== undefined).pop();
  pruefe('Der Klick auf die Linkzeilen ebenso',
    putZeilen?.koerper.linkZeilen === 12, JSON.stringify(putZeilen?.koerper));
  pruefe('Und auch dieser Knopf zeichnet sich neu',
    [...w.document.querySelectorAll('#lzeilen .pill')]
      .find(b => b.classList.contains('on'))?.textContent === '12 Zeilen',
    [...w.document.querySelectorAll('#lzeilen .pill')]
      .map(b => b.textContent + (b.classList.contains('on') ? '*' : '')).join(' '));

  w.close();

  /* ================= Zweiter Aufbau: eigenes Vokabular ================= */
  gruppe('Oberflaeche mit eigenem Vokabular');

  const eigen = {
    filters: null, schrift: 120,
    vokabular: {
      sacheEinzahl: 'Maschine', sacheMehrzahl: 'Maschinen',
      merkmalJa: 'Geprüft', merkmalNein: 'Ungeprüft',
      zeitpunktEinzahl: 'Sitzung', zeitpunktMehrzahl: 'Sitzungen'
    }
  };
  /* Ein ZWEITER Satz, diesmal vollstaendig -- er traegt auch die Woerter fuer
     Bericht und Aufgabe. Der obere bleibt bewusst unvollstaendig: an ihm
     haengt die Pruefung, dass die Karte im Systembereich fuer ein Wort, das
     das Vokabular nicht nennt, die Vorgabe zeigt. Beides in einem Satz ginge
     nicht, ohne eine der beiden Aussagen zu verlieren. */
  const eigenVoll = { filters: null, vokabular: { ...eigen.vokabular,
    berichtEinzahl: 'Notat', berichtMehrzahl: 'Notate',
    aufgabeEinzahl: 'ToDo', aufgabeMehrzahl: 'ToDo’s', aufgabeErledigt: 'Done' } };

  // Direkteinstieg auf einen Eintrag: hier lief loadAll() frueher nie, das
  // Vokabular waere also nicht geladen gewesen.
  const zwei = baueDom(JSDOM, { einstellungen: eigen, hash: '#/item/1' });
  const w2 = zwei.w;
  await new Promise(r => setTimeout(r, 80));

  pruefe('Schriftgroesse haengt am Wurzelelement',
    parseFloat(w2.document.documentElement.style.fontSize) === 18,
    `ist: ${w2.document.documentElement.style.fontSize}`);
  const textDetail = w2.document.body.textContent;
  pruefe('Direkteinstieg zeigt das eigene Vokabular',
    textDetail.includes('Maschine löschen') && textDetail.includes('Sitzungen'), '');
  pruefe('Merkmalschalter benutzt das Vokabular',
    w2.document.getElementById('sw-test-t').textContent === 'Geprüft');
  pruefe('Vorgabewoerter tauchen nicht mehr auf',
    !/Testtag|Getestet|Eintrag löschen/.test(textDetail));
  pruefe('Knopf fuer neue Zeitpunkte benutzt die Einzahl',
    w2.document.getElementById('tadd').textContent === '+ Sitzung eintragen');

  /* Die Zahlen am Kommentarblock holen ihre Woerter aus dem Vokabular --
     "Kommentar" dagegen bleibt eine FESTE Beschriftung und wird kein
     zwoelftes Vokabelwort: anders als Sache und Zeitpunkt verschiebt es sich
     nicht mit dem Gegenstand. Beide Haelften stehen nebeneinander, sonst
     bliebe die eine gruen, waehrend die andere sich verschoebe. */
  const vokDom = baueDom(JSDOM, { einstellungen: eigenVoll, hash: '#/item/1' });
  const wVok = vokDom.w;
  await new Promise(r => setTimeout(r, 80));
  const kzVok = wVok.document.getElementById('ccount');
  pruefe('Die Zahlen am Kommentarblock folgen dem Vokabular',
    kzVok?.textContent === '6 Kommentare, davon 1 Notat und 2 ToDo’s (1 Done)',
    kzVok ? kzVok.textContent : '(kein Hinweis)');
  pruefe('„Kommentar" bleibt dabei fest',
    /^6 Kommentare/.test(kzVok?.textContent || '') &&
    wVok.kommentarZahlen([{ kind: 'note' }]) === '1 Kommentar',
    wVok.kommentarZahlen([{ kind: 'note' }]));
  pruefe('Und die Einzahl kommt ebenfalls aus dem Vokabular',
    wVok.kommentarZahlen([{ kind: 'report' }, { kind: 'task' }])
      === '2 Kommentare, davon 1 Notat und 1 ToDo',
    wVok.kommentarZahlen([{ kind: 'report' }, { kind: 'task' }]));
  wVok.close();

  /* ---- Der Favoritenknopf, mit einem wirklich zugestellten Klick ----
     Die einzige Prueflage im ganzen Prüfstand, die ein Ereignis zustellt
     statt nur den gebauten DOM anzusehen -- und sie muss es sein: der Fehler
     war in jedem gebauten DOM unsichtbar, weil er erst
     entsteht, wenn ein Behandler nach einem await weiterlaeuft.
     Der Mock antwortet auf PUT mit dem geaenderten Eintrag, so wie
     der Server es tut. */
  gruppe('Favorit: der Knopf im Eintrag');
  const pinDom = baueDom(JSDOM, { hash: '#/item/1' });
  const wp = pinDom.w;
  await new Promise(r => setTimeout(r, 80));
  const pinKnopf = () => wp.document.getElementById('pin');

  pruefe('Der Knopf steht da und zeigt den leeren Stern',
    pinKnopf()?.textContent === '☆' && pinKnopf()?.className === 'pin-btn',
    `${JSON.stringify(pinKnopf()?.textContent)} / ${JSON.stringify(pinKnopf()?.className)}`);

  /* Nicht .click() und nicht die Behandlerfunktion von Hand rufen: beides
     ginge am Fehler vorbei. Es muss ein zugestelltes Ereignis sein, und
     danach muss der Event Loop durchlaufen -- erst dann setzt der
     Browser currentTarget auf null. */
  pinKnopf().dispatchEvent(new wp.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 60));

  const pinGesendet = pinDom.gesendet.filter(
    g => g.url === '/api/items/1' && g.koerper && g.koerper.favorite !== undefined);
  pruefe('Der Klick schickt genau den Favoriten, sonst nichts',
    pinGesendet.length === 1 && pinGesendet[0].methode === 'PUT'
      && gleich(Object.keys(pinGesendet[0].koerper), ['favorite'])
      && pinGesendet[0].koerper.favorite === true,
    JSON.stringify(pinGesendet));
  /* Der Kern der Sache: liefe der Klick auf e.currentTarget, das nach dem
     await null ist, waere der Eintrag zwar gespeichert, aber der Knopf
     bliebe stehen und stattdessen erschiene eine rote Meldung. */
  pruefe('Danach traegt der Knopf den vollen Stern',
    pinKnopf()?.textContent === '★', JSON.stringify(pinKnopf()?.textContent));
  pruefe('Und ist als Favorit gekennzeichnet',
    pinKnopf()?.className === 'pin-btn on', JSON.stringify(pinKnopf()?.className));
  pruefe('Der Klick meldet keinen Fehler',
    !/currentTarget|null/.test(wp.document.body.textContent),
    (wp.document.body.textContent.match(/.{0,60}currentTarget.{0,20}/) || [''])[0]);

  // Und wieder zurueck -- der Weg heraus ist derselbe Weg und traegt
  // dieselbe Falle.
  pinKnopf().dispatchEvent(new wp.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 60));
  pruefe('Erneuter Klick nimmt den Favoriten zurueck',
    pinKnopf()?.textContent === '☆' && pinKnopf()?.className === 'pin-btn',
    `${JSON.stringify(pinKnopf()?.textContent)} / ${JSON.stringify(pinKnopf()?.className)}`);
  pruefe('Und schickt dafuer favorite: false',
    pinDom.gesendet.filter(g => g.url === '/api/items/1' && g.koerper
      && g.koerper.favorite === false).length === 1,
    JSON.stringify(pinDom.gesendet.filter(g => g.koerper && g.koerper.favorite !== undefined)));

  /* Waechter ueber die ganze Datei. Der Fehler war kein Denkfehler, sondern
     ein Muster, das man beim Schreiben nicht sieht -- und es steckte
     jahrelang unbemerkt drin, weil niemand den Knopf benutzt hat. Die
     Zustellprüfung oben deckt genau einen Knopf ab; dieser Waechter deckt
     jeden kuenftigen. */
  const oberflaeche = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const nachAwait = [];
  for (const b of oberflaeche.split(/(?=(?:async\s*\([^)]*\)|async\s*\w+)\s*=>)/)) {
    const a = b.indexOf('await');
    if (a === -1) continue;
    const rest = b.slice(a);
    if (/\b(?:e|ev|evt|event|err)\.currentTarget\b/.test(rest))
      nachAwait.push(rest.match(/.{0,40}currentTarget.{0,10}/)[0].trim());
  }
  pruefe('Kein currentTarget hinter einem await in der Oberflaeche',
    nachAwait.length === 0,
    'currentTarget ist nach dem await null: ' + JSON.stringify(nachAwait));

  // Uebersicht im selben Fenster
  w2.location.hash = '#/';
  await new Promise(r => setTimeout(r, 80));
  const textListe = w2.document.body.textContent;
  pruefe('Anlegeknopf zeigt die Einzahl',
    w2.document.getElementById('new').textContent === '+ Maschine');
  pruefe('Zaehler zeigt die Mehrzahl', /1 Maschine\b/.test(w2.document.getElementById('count').textContent),
    w2.document.getElementById('count').textContent);
  pruefe('Filterknoepfe zeigen das Merkmal',
    textListe.includes('Geprüft') && textListe.includes('Ungeprüft'));
  pruefe('Filterbeschriftung bleibt generisch',
    textListe.includes('Status') && !textListe.includes('Teststatus'));
  pruefe('Sortierung nennt Zeitpunkte und Note',
    textListe.includes('Sitzungen (viele → wenige)') && textListe.includes('Letzte Note'));
  pruefe('Karte zaehlt Zeitpunkte in der Mehrzahl', textListe.includes('2 Sitzungen'));

  // Abmelden setzt die Schriftgroesse zurueck
  w2.showLogin();
  pruefe('Anmeldeseite faellt auf die Vorgabegroesse zurueck',
    w2.document.documentElement.style.fontSize === '',
    `ist: ${w2.document.documentElement.style.fontSize}`);
  w2.close();

  /* ================= Systembereich: Vokabular pflegen ================= */
  const drei = baueDom(JSDOM, { einstellungen: eigen });
  const w3 = drei.w;
  await new Promise(r => setTimeout(r, 60));
  await w3.renderSystem();

  const felder = ['v1','v2','v3','v4','v5','v6','v7','v8','v9','v10','v11']
    .map(id => w3.document.getElementById(id));
  pruefe('Elf Vokabelfelder stehen bereit', felder.every(Boolean),
    felder.map((f, n) => f ? '' : `v${n + 1} fehlt`).filter(Boolean).join(' '));
  pruefe('Felder sind vorbelegt', felder[0].value === 'Maschine' && felder[5].value === 'Sitzungen');
  pruefe('Die Berichtsfelder haben ihre Vorgabe',
    felder[6].value === 'Bericht' && felder[7].value === 'Berichte',
    `${felder[6].value} / ${felder[7].value}`);
  pruefe('Die Aufgabenfelder ebenso',
    felder[8].value === 'Aufgabe' && felder[9].value === 'Aufgaben',
    `${felder[8].value} / ${felder[9].value}`);
  pruefe('Das Wort für erledigt hat seine Vorgabe', felder[10].value === 'Erledigt', felder[10].value);
  pruefe('Keine weiteren Felder', !w3.document.getElementById('v12'));
  pruefe('Probe zeigt die aktuellen Woerter',
    w3.document.getElementById('vprobe').textContent.includes('+ Maschine'));
  felder[0].value = 'Objekt';
  felder[0].dispatchEvent(new w3.Event('input'));
  pruefe('Probe folgt der Eingabe sofort',
    w3.document.getElementById('vprobe').textContent.includes('+ Objekt'));

  const stufen = [...w3.document.querySelectorAll('#fsize .pill')];
  pruefe('Fuenf Schriftstufen zur Auswahl', stufen.length === 5, `${stufen.length}`);
  pruefe('Aktuelle Stufe ist hervorgehoben',
    stufen.find(b => b.classList.contains('on'))?.textContent === '120 %');
  stufen[0].dispatchEvent(new w3.Event('click'));
  await new Promise(r => setTimeout(r, 30));
  pruefe('Klick auf eine Stufe wirkt sofort',
    parseFloat(w3.document.documentElement.style.fontSize) === 12,
    `ist: ${w3.document.documentElement.style.fontSize}`);
  const gespeichert = drei.gesendet.filter(s => s.koerper && s.koerper.schrift !== undefined).pop();
  pruefe('Stufe wird serverseitig gespeichert',
    gespeichert && gespeichert.methode === 'PUT' && gespeichert.koerper.schrift === 80,
    JSON.stringify(gespeichert));

  /* --- Spitze Klammern im Vokabular duerfen kein HTML werden --- */
  w3.close();
  const vier = baueDom(JSDOM, { einstellungen: { filters: null, vokabular: {
    sacheEinzahl: '<b id="boese">X</b>', sacheMehrzahl: '<i id="boese2">Y</i>',
    merkmalJa: 'Ja', merkmalNein: 'Nein',
    zeitpunktEinzahl: 'Z', zeitpunktMehrzahl: '<u id="boese3">Zs</u>'
  }}});
  const w4 = vier.w;
  await new Promise(r => setTimeout(r, 80));
  pruefe('Uebersicht macht aus dem Vokabular kein HTML',
    !w4.document.getElementById('boese') && !w4.document.getElementById('boese2') &&
    !w4.document.getElementById('boese3') &&
    w4.document.getElementById('new').textContent.includes('<b id="boese">X</b>'),
    w4.document.getElementById('new').textContent);
  // Auch Karte, Detailansicht und Verwaltungsliste setzen Vokabelwoerter ein.
  w4.location.hash = '#/item/1';
  await new Promise(r => setTimeout(r, 80));
  pruefe('Detailansicht macht aus dem Vokabular kein HTML',
    !w4.document.getElementById('boese') && !w4.document.getElementById('boese3'));
  await w4.renderSystem();
  pruefe('Systembereich macht aus dem Vokabular kein HTML',
    !w4.document.getElementById('boese2') && !w4.document.getElementById('boese3'));
  w4.close();

  /* ================= Zeitleiste ================= */
  gruppe('Zeitleiste der Testtage');

  const { w: wz } = baueDom(JSDOM, {});
  await new Promise(r => setTimeout(r, 60));

  // Rechnung zuerst, unabhaengig vom Bildschirm.
  pruefe('Anteil: Anfang, Mitte, Ende',
    wz.zeitAnteil('2020-01-01', '2020-01-01', '2020-01-11') === 0 &&
    wz.zeitAnteil('2020-01-06', '2020-01-01', '2020-01-11') === 0.5 &&
    wz.zeitAnteil('2020-01-11', '2020-01-01', '2020-01-11') === 1);
  pruefe('Anteil bei nur einem Datum landet in der Mitte',
    wz.zeitAnteil('2020-01-01', '2020-01-01', '2020-01-01') === 0.5);
  pruefe('Jahresmarken decken die Spanne ab',
    gleich(wz.jahresMarken('2023-07-01', '2025-01-01').map(m => m.jahr), [2023, 2024, 2025]));
  pruefe('Erste Jahresmarke sitzt am Anfang, nicht davor',
    wz.jahresMarken('2023-07-01', '2025-01-01')[0].anteil === 0);

  // Eintraege wie aus der Uebersicht. Der Zustand der Anwendung steckt in
  // einem const und haengt deshalb nicht am window -- geprueft wird darum ueber
  // den echten Weg: Antwort des Servers, Suche, Neuzeichnen.
  const bauItems = (n, proEintrag = 1) => Array.from({ length: n }, (_, i) => ({
    id: i + 1, title: 'Stück ' + (i + 1), rejected: false, tested: true, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: 3, testCount: proEintrag, testAvg: 4, testLast: 4,
    updated_at: '2026-08-01 10:00:00', searchText: 'stück ' + (i + 1),
    testDays: Array.from({ length: proEintrag }, (_, k) => ({
      id: i * 10 + k, day: `202${3 + (i % 3)}-0${1 + k}-15`, rating: (i % 5) + 1 }))
  }));

  pruefe('Punkte werden aus allen sichtbaren Einträgen gesammelt',
    wz.zeitleistePunkte(bauItems(3, 2)).length === 6);
  pruefe('Punkte sind nach Datum sortiert', (() => {
    const p = wz.zeitleistePunkte(bauItems(4, 2)).map(x => x.tag);
    return gleich(p, [...p].sort());
  })());
  pruefe('Einträge ohne Testtage stören nicht',
    wz.zeitleistePunkte([{ id: 1, title: 'X' }]).length === 0);
  wz.close();

  const wenig = baueDom(JSDOM, { uebersichtItems: bauItems(4, 1) }).w;
  await new Promise(r => setTimeout(r, 80));
  pruefe('Unter fünf Testtagen bleibt das Band weg',
    wenig.document.getElementById('zeitleiste').innerHTML === '');
  wenig.close();

  const wviel = baueDom(JSDOM, { uebersichtItems: bauItems(6, 1) }).w;
  await new Promise(r => setTimeout(r, 80));
  const zlBox = () => wviel.document.getElementById('zeitleiste');
  pruefe('Ab fünf Testtagen erscheint das Band', !!zlBox().querySelector('.zl'));
  const punkte = [...zlBox().querySelectorAll('.zl-punkt')];
  pruefe('Je Testtag ein Punkt', punkte.length === 6, `${punkte.length}`);
  pruefe('Höhe folgt der Tagesnote', punkte.every(p => {
    const note = Number(p.getAttribute('aria-label').match(/Note (\d)/)[1]);
    return p.style.bottom === ((note - 1) / 4 * 100) + '%';
  }), punkte.map(p => p.style.bottom).join(' '));
  pruefe('Punkte sitzen waagerecht nach Datum',
    punkte[0].style.left === '0%' && punkte[punkte.length - 1].style.left === '100%',
    `${punkte[0].style.left} … ${punkte[punkte.length - 1].style.left}`);
  pruefe('Jahre werden beschriftet', zlBox().querySelectorAll('.zl-jahr').length >= 2);

  const erster = punkte[0];
  erster.onpointerenter({ pointerType: 'mouse' });
  pruefe('Überfahren zeigt Titel, Datum und Note', (() => {
    const h = zlBox().querySelector('.zl-hinweis');
    return h && /Stück/.test(h.textContent) && /Note \d/.test(h.textContent);
  })());
  erster.onpointerleave();
  pruefe('Hinweis verschwindet wieder', !zlBox().querySelector('.zl-hinweis'));
  erster.onpointerenter({ pointerType: 'touch' });
  pruefe('Auf dem Finger erscheint kein Hinweis', !zlBox().querySelector('.zl-hinweis'));

  // Folgt den Filtern: die Suche schneidet die sichtbaren Eintraege zusammen,
  // danach unterschreitet die Zeitleiste ihre Schwelle und verschwindet.
  const suchfeld = wviel.document.getElementById('q');
  suchfeld.value = 'Stück 1';
  suchfeld.oninput();
  pruefe('Zeitleiste folgt der Suche', zlBox().innerHTML === '',
    `${zlBox().querySelectorAll('.zl-punkt').length} Punkte`);
  suchfeld.value = '';
  suchfeld.oninput();
  pruefe('Ohne Suche kommt sie zurück', zlBox().querySelectorAll('.zl-punkt').length === 6);

  const zielId = punkte[0].dataset.item;
  zlBox().querySelector('.zl-punkt').onclick();
  pruefe('Klick öffnet den Eintrag', wviel.location.hash.startsWith('#/item/'), wviel.location.hash);
  wviel.close();

  /* ================= Tagwolken ================= */
  gruppe('Tagwolken');

  const vorrat = [
    { id: 1, name: 'Selten', usage_count: 1, test_usage_count: 0 },
    { id: 2, name: 'Oft', usage_count: 9, test_usage_count: 0 },
    { id: 3, name: 'Mittel', usage_count: 4, test_usage_count: 0, vergeben: true },
    { id: 4, name: 'Nurtesttag', usage_count: 0, test_usage_count: 3 }
  ];
  const wolkenDom = baueDom(JSDOM, { tags: vorrat, hash: '#/item/1' });
  const ww = wolkenDom.w;
  await new Promise(r => setTimeout(r, 80));

  pruefe('Wolke sortiert nach Häufigkeit',
    gleich(ww.sortiereWolke(vorrat, new Set()).map(t => t.name),
           ['Oft', 'Mittel', 'Selten', 'Nurtesttag']));
  pruefe('Hervorgehobenes steht immer vorn',
    gleich(ww.sortiereWolke(vorrat, new Set([1])).map(t => t.name),
           ['Selten', 'Oft', 'Mittel', 'Nurtesttag']));

  // Zeilenbegrenzung: die Geometrie stellt jsdom nicht, also gestellt.
  const wolkenkasten = ww.document.createElement('div');
  const wolkenkind = ww.document.createElement('span');
  wolkenkasten.appendChild(wolkenkind);
  ww.document.body.appendChild(wolkenkasten);
  Object.defineProperty(wolkenkind, 'offsetHeight', { get: () => 26 });
  Object.defineProperty(wolkenkasten, 'clientHeight', { get: () => parseInt(wolkenkasten.style.maxHeight) || 0 });
  let inhaltshoehe2 = 90;
  Object.defineProperty(wolkenkasten, 'scrollHeight', { get: () => inhaltshoehe2 });
  pruefe('Eine Zeile ist so hoch wie eine Marke', (ww.begrenzeWolke(wolkenkasten, 1), wolkenkasten.style.maxHeight === '26px'),
    wolkenkasten.style.maxHeight);
  pruefe('Drei Zeilen zählen die Lücken mit', (ww.begrenzeWolke(wolkenkasten, 3), wolkenkasten.style.maxHeight === '90px'),
    wolkenkasten.style.maxHeight);
  pruefe('Abgeschnittenes wird gemeldet', ww.begrenzeWolke(wolkenkasten, 1) === true);
  /* Und zwar abgeschnitten, nicht scrollbar. Die Wolke hatte nie einen
     eigenen Bildlauf -- die Prueflage steht seit 0.8.6 daneben, damit ein
     spaeterer Griff nach 'auto' hier ebenso auffaellt wie an der Linkliste:
     ein eigener Bildlauf faengt auf dem Finger die Wischbewegung ab.
     Erst das Vorhandensein der Begrenzung, dann ihre Art. */
  pruefe('Und die Wolke wird abgeschnitten, nicht scrollbar',
    (ww.begrenzeWolke(wolkenkasten, 1),
     wolkenkasten.style.maxHeight !== '' && wolkenkasten.style.overflow === 'hidden'),
    JSON.stringify([wolkenkasten.style.maxHeight, wolkenkasten.style.overflow]));
  inhaltshoehe2 = 20;
  pruefe('Passt alles hinein, meldet nichts', ww.begrenzeWolke(wolkenkasten, 3) === false);
  pruefe('Null Zeilen heben die Begrenzung auf',
    (ww.begrenzeWolke(wolkenkasten, 0), wolkenkasten.style.maxHeight === ''));
  pruefe('Und nehmen die Abschneidung mit',
    (ww.begrenzeWolke(wolkenkasten, 0), wolkenkasten.style.overflow === ''),
    JSON.stringify(wolkenkasten.style.overflow));

  const wolke = [...ww.document.querySelectorAll('#tagcloud .pill')];
  pruefe('Detailwolke zeigt alle Tags des Vorrats', wolke.length === 4, `${wolke.length}`);
  pruefe('Vergebener Tag ist erkennbar und steht vorn',
    wolke[0].classList.contains('on') && wolke[0].textContent.startsWith('Mittel'),
    wolke.map(b => b.textContent).join(' | '));
  pruefe('Das ✕ an der Marke bleibt zusätzlich bestehen',
    !!ww.document.querySelector('#chips .chip button'));
  // Klick auf einen nicht vergebenen Tag muss ihn vergeben, Klick auf einen
  // vergebenen ihn zuruecknehmen -- zwei verschiedene Aufrufe.
  const frei = wolke.find(b2 => !b2.classList.contains('on'));
  frei.onclick();
  await new Promise(r => setTimeout(r, 30));
  const vergibt = wolkenDom.gesendet.filter(x => x.methode === 'POST' && /\/tags$/.test(x.url)).pop();
  pruefe('Klick auf einen freien Tag vergibt ihn',
    vergibt && vergibt.koerper.name === frei.textContent.replace(/\d+$/, ''),
    JSON.stringify(vergibt));
  const belegt = [...ww.document.querySelectorAll('#tagcloud .pill')].find(b2 => b2.classList.contains('on'));
  belegt.onclick();
  await new Promise(r => setTimeout(r, 30));
  const nimmt = wolkenDom.gesendet.filter(x => x.methode === 'DELETE' && /\/tags\//.test(x.url)).pop();
  pruefe('Erneuter Klick nimmt ihn zurück', !!nimmt, JSON.stringify(nimmt));

  /* --- Die eingeklappte Wolke: zwei Wege, einzeln geprueft ---------------
     Ein eingeklappter Block macht seine Kinder unsichtbar; offsetHeight ist
     dort null. Stolperstein 14 in neuer Gestalt.
     ERSTER WEG: bei Hoehe null wird gar nichts gesetzt -- sonst entstuende
     eine winzige feste maxHeight, die nach dem Aufklappen stehenbliebe. */
  const zuKasten = ww.document.createElement('div');
  zuKasten.appendChild(ww.document.createElement('span'));   // offsetHeight bleibt 0
  ww.document.body.appendChild(zuKasten);
  zuKasten.style.maxHeight = '12px';                          // Rest eines frueheren Laufs
  const zuErgebnis = ww.begrenzeWolke(zuKasten, 3);
  pruefe('Eine nicht messbare Wolke bekommt keine Hoehe verpasst',
    zuKasten.style.maxHeight === '' && zuErgebnis === false,
    `maxHeight=${JSON.stringify(zuKasten.style.maxHeight)}, meldet ${zuErgebnis}`);
  ww.close();

  /* ZWEITER WEG: das Aufklappen zeichnet die Wolke neu. Der erste Weg allein
     laesst sie unbegrenzt stehen, der zweite allein raeumte die falsche Hoehe
     nie weg -- einzeln zurueckgebaut muss deshalb jeder von beiden seine
     eigene Pruefung rot machen (Stolperstein 52).
     Nachgestellt wird der gemeldete Weg: Block "Tags" eingeklappt betreten. */
  const zuDom = baueDom(JSDOM, { tags: vorrat, hash: '#/item/1',
    einstellungen: { filters: null, bloecke: { zu: ['tags'] } } });
  const zw = zuDom.w;
  await new Promise(r => setTimeout(r, 80));
  const tagBlock = zw.document.querySelector('.block[data-block="tags"]');
  pruefe('Der Tagblock kommt eingeklappt herein',
    tagBlock?.classList.contains('zu'), tagBlock?.className);
  pruefe('Und seine Wolke traegt dabei keine feste Hoehe',
    zw.document.getElementById('tagcloud')?.style.maxHeight === '',
    JSON.stringify(zw.document.getElementById('tagcloud')?.style.maxHeight));

  // Ein Bedienelement ist erst geprueft, wenn ein Ereignis wirklich zugestellt
  // wurde (Stolperstein 61) -- also dispatchEvent samt Durchlauf der
  // Event Loop, nicht der von Hand gerufene Behandler.
  const vorherPille = zw.document.querySelector('#tagcloud .pill');
  tagBlock.querySelector('.block-head')
    .dispatchEvent(new zw.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 30));
  pruefe('Der Klick auf die Kopfzeile klappt den Block auf',
    !tagBlock.classList.contains('zu'), tagBlock.className);
  const nachherPille = zw.document.querySelector('#tagcloud .pill');
  pruefe('Und dabei wird die Wolke neu gezeichnet',
    !!nachherPille && nachherPille !== vorherPille,
    nachherPille === vorherPille ? 'dieselbe Marke wie vorher' : 'keine Marke da');
  zw.close();

  /* ================= Verknuepfung der Tagfilter ================= */
  gruppe('Tagfilter: Und / Oder');

  const T = { gruen: { id: 1, name: 'Grün' }, schwer: { id: 2, name: 'Schwer' },
              leicht: { id: 3, name: 'Leicht' } };
  const mitTags = (id, titel, tags) => ({
    id, title: titel, rejected: false, tested: false, favorite: false, category: null,
    tags, mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null,
    testCount: null, testAvg: null, testLast: null, testDays: [],
    updated_at: '2026-08-01 10:00:00', searchText: titel.toLowerCase()
  });
  const bestand = [
    mitTags(1, 'Grün und schwer', [T.gruen, T.schwer]),
    mitTags(2, 'Nur grün', [T.gruen]),
    mitTags(3, 'Nur schwer', [T.schwer]),
    mitTags(4, 'Grün und leicht', [T.gruen, T.leicht])
  ];

  const tagVorrat = [
    { id: 1, name: 'Grün', usage_count: 3, test_usage_count: 0 },
    { id: 2, name: 'Schwer', usage_count: 2, test_usage_count: 0 },
    { id: 3, name: 'Leicht', usage_count: 1, test_usage_count: 0 }
  ];

  const filterDom = baueDom(JSDOM, {
    tags: tagVorrat, uebersichtItems: bestand,
    einstellungen: { filters: null }
  });
  const wf = filterDom.w;
  await new Promise(r => setTimeout(r, 80));

  // Die reine Rechnung zuerst, unabhaengig von der Oberflaeche.
  const eintrag = bestand[0];
  pruefe('UND verlangt alle gewählten Tags',
    wf.passtZuTags(eintrag, [1, 2], 'and') === true &&
    wf.passtZuTags(bestand[1], [1, 2], 'and') === false);
  pruefe('ODER genügt einer', wf.passtZuTags(bestand[1], [1, 2], 'or') === true);
  pruefe('Ohne gewählte Tags passt jeder', wf.passtZuTags(bestand[1], [], 'and') === true);
  pruefe('Unbekannter Modus verhält sich wie UND',
    wf.passtZuTags(bestand[1], [1, 2], 'quatsch') === false);

  const titel = () => [...wf.document.querySelectorAll('.card .card-title')].map(e => e.textContent);
  const marke = (name) => [...wf.document.querySelectorAll('#filters .pill-tag')].find(b => b.textContent === name);
  const modus = (wert) => wf.document.querySelector(`#filters .pill-mode[data-mode="${wert}"]`);

  pruefe('Zunächst sind alle vier zu sehen', titel().length === 4, JSON.stringify(titel()));
  pruefe('Vorgabe ist UND', modus('and')?.classList.contains('on'), 'and nicht hervorgehoben');
  pruefe('Der Umschalter ruht, solange nichts gewählt ist',
    !!wf.document.querySelector('#filters .tagmode.ruht'));

  marke('Grün').onclick();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Tag filtert wie gehabt',
    gleich(titel().sort(), ['Grün und leicht', 'Grün und schwer', 'Nur grün']), JSON.stringify(titel()));

  marke('Schwer').onclick();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Zwei Tags mit UND zeigen nur den Schnitt',
    gleich(titel(), ['Grün und schwer']), JSON.stringify(titel()));
  pruefe('Der Umschalter ruht jetzt nicht mehr',
    !wf.document.querySelector('#filters .tagmode.ruht'));

  modus('or').onclick();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Umschalten auf ODER erweitert das Ergebnis',
    gleich(titel().sort(), ['Grün und leicht', 'Grün und schwer', 'Nur grün', 'Nur schwer']),
    JSON.stringify(titel()));
  pruefe('ODER ist jetzt hervorgehoben',
    modus('or').classList.contains('on') && !modus('and').classList.contains('on'));
  const gespeicherterModus = filterDom.gesendet
    .filter(x => x.koerper && x.koerper.filters).pop();
  pruefe('Die Verknüpfung wird serverseitig gespeichert',
    gespeicherterModus?.koerper.filters.tagMode === 'or',
    JSON.stringify(gespeicherterModus?.koerper.filters));

  // Sackgassen: im UND-Modus muss vorher sichtbar sein, was leer laeuft.
  modus('and').onclick();
  await new Promise(r => setTimeout(r, 20));
  const leerMarken = [...wf.document.querySelectorAll('#filters .pill-tag.leer')].map(b => b.textContent);
  pruefe('Aussichtslose Tags werden gedämpft',
    gleich(leerMarken, ['Leicht']), JSON.stringify(leerMarken));
  pruefe('Gewählte Tags gelten nie als aussichtslos',
    !marke('Grün').classList.contains('leer') && !marke('Schwer').classList.contains('leer'));
  pruefe('Gedämpfte Tags bleiben anklickbar', typeof marke('Leicht').onclick === 'function');
  pruefe('Ein Hinweis erklärt die Dämpfung', /kein Treffer/i.test(marke('Leicht').title || ''));

  modus('or').onclick();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Im ODER-Modus wird nichts gedämpft',
    wf.document.querySelectorAll('#filters .pill-tag.leer').length === 0);

  // Der Fall, in dem der Schutz für gewählte Tags erst greift: eine Auswahl
  // ohne jeden Treffer. Dann ist die sichtbare Liste leer, und ohne die
  // Ausnahme würden auch die gewählten Tags als aussichtslos gelten -- also
  // gleichzeitig hervorgehoben und gedämpft, was wie ein Fehler aussieht.
  modus('and').onclick();
  await new Promise(r => setTimeout(r, 20));
  marke('Grün').onclick();          // abwählen
  await new Promise(r => setTimeout(r, 20));
  marke('Leicht').onclick();        // Schwer + Leicht: kein Eintrag hat beide
  await new Promise(r => setTimeout(r, 20));
  pruefe('Diese Auswahl ergibt wirklich keinen Treffer', titel().length === 0, JSON.stringify(titel()));
  pruefe('Auch bei leerem Ergebnis bleiben gewählte Tags ungedämpft',
    !marke('Schwer').classList.contains('leer') && !marke('Leicht').classList.contains('leer'),
    [...wf.document.querySelectorAll('#filters .pill-tag.leer')].map(b => b.textContent).join(' '));
  pruefe('Der übrige Tag wird dabei sehr wohl gedämpft',
    marke('Grün').classList.contains('leer'));
  wf.close();

  // Aeltere gespeicherte Filter kennen die Verknuepfung nicht.
  const altFilter = baueDom(JSDOM, { tags: tagVorrat, uebersichtItems: bestand,
    einstellungen: { filters: { tagIds: [1, 2], tested: 'all', sort: 'updated_desc' } } });
  await new Promise(r => setTimeout(r, 80));
  pruefe('Ältere Filter ohne Verknüpfung bekommen UND',
    gleich([...altFilter.w.document.querySelectorAll('.card .card-title')].map(e => e.textContent),
           ['Grün und schwer']),
    JSON.stringify([...altFilter.w.document.querySelectorAll('.card .card-title')].map(e => e.textContent)));
  altFilter.w.close();

  const orFilter = baueDom(JSDOM, { tags: tagVorrat, uebersichtItems: bestand,
    einstellungen: { filters: { tagIds: [1, 2], tagMode: 'or', tested: 'all', sort: 'updated_desc' } } });
  await new Promise(r => setTimeout(r, 80));
  pruefe('Gespeichertes ODER wird wiederhergestellt',
    [...orFilter.w.document.querySelectorAll('.card .card-title')].length === 4);
  orFilter.w.close();

  /* ---------------------------------------------------------------- */
  gruppe('Favoriten: Sortierung und Filter');

  /* Eine Vorsortierung der Favoriten vor dem `switch` schluege JEDE
     eingestellte Sortierung. Sichtbar wuerde das bei "Bewertung hoch nach
     niedrig": ein Favorit ohne Wertung stuende ganz oben, obwohl Eintraege
     ohne Wert dort ans Ende gehoeren.
     Der Anlass fuer diese Gruppe: der Rueckbau einer solchen Zeile bliebe an
     allen uebrigen Pruefungen unbemerkt -- keine der Favoriten-Pruefungen
     deckt ab, WO ein Favorit in der Liste steht. */
  const favEintrag = (id, titel, favorit, wertung) => ({
    id, title: titel, rejected: false, tested: id % 2 === 0, favorite: favorit,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: wertung, testCount: null, testAvg: null, testLast: null, testDays: [],
    updated_at: '2026-08-01 10:00:00', searchText: titel.toLowerCase()
  });
  // "Zeta ohne Wertung" ist Favorit und hat KEINE Wertung -- genau der Fall
  // aus dem Betrieb. Bei "Bewertung hoch nach niedrig" gehoert er ans Ende,
  // bei Titelsortierung an die letzte Stelle. Steht er beide Male vorn, ist
  // eine Vorsortierung am Werk.
  const favBestand = [
    favEintrag(1, 'Alpha mit Wertung', false, 5),
    favEintrag(2, 'Beta mit Wertung', true, 3),
    favEintrag(3, 'Zeta ohne Wertung', true, null),
    favEintrag(4, 'Gamma mit Wertung', false, 4)
  ];

  // `const state` haengt nicht am window und laesst sich von
  // aussen nicht setzen. Jede Kombination bekommt deshalb ihr eigenes DOM mit
  // gespeicherten Filtern -- der echte Weg, so wie die Tagfilter darueber.
  const favTitelVon = (d) =>
    [...d.w.document.querySelectorAll('.card .card-title')].map(e => e.textContent);
  const favBaue = async (filters) => {
    const d = baueDom(JSDOM, { uebersichtItems: favBestand, einstellungen: { filters } });
    await new Promise(r => setTimeout(r, 80));
    return d;
  };

  const favTitelSort = await favBaue({ tested: 'all', favorit: false, sort: 'title_asc' });
  pruefe('Bei Titelsortierung stehen Favoriten an ihrem alphabetischen Platz',
    gleich(favTitelVon(favTitelSort),
      ['Alpha mit Wertung', 'Beta mit Wertung', 'Gamma mit Wertung', 'Zeta ohne Wertung']),
    JSON.stringify(favTitelVon(favTitelSort)));
  favTitelSort.w.close();

  // Der eigentliche Fall aus dem Betrieb: ein Favorit ohne Wertung darf bei
  // absteigender Bewertung NICHT nach oben.
  const favWert = await favBaue({ tested: 'all', favorit: false, sort: 'rating_desc' });
  const favWertT = favTitelVon(favWert);
  pruefe('Ein Favorit ohne Wertung steht bei Bewertungssortierung am Ende',
    favWertT[favWertT.length - 1] === 'Zeta ohne Wertung', JSON.stringify(favWertT));
  pruefe('Und die Bewerteten stehen davor in ihrer Reihenfolge',
    gleich(favWertT.slice(0, 3),
      ['Alpha mit Wertung', 'Gamma mit Wertung', 'Beta mit Wertung']),
    JSON.stringify(favWertT));
  favWert.w.close();

  /* Der Filter. Er ist ein EIGENER Umschalter und kein vierter Wert von
     `tested` -- deshalb muss er sich mit dem Teststatus kombinieren lassen.
     Genau das ist unten die dritte Pruefung, und sie ist der Beleg fuer die
     Bauform: als vierter Knopf in der Statusreihe waere sie nicht zu
     erfuellen. */
  const favNur = await favBaue({ tested: 'all', favorit: true, sort: 'title_asc' });
  pruefe('Der Filter zeigt nur Favoriten',
    gleich(favTitelVon(favNur), ['Beta mit Wertung', 'Zeta ohne Wertung']),
    JSON.stringify(favTitelVon(favNur)));
  pruefe('Und laesst die Sortierung unangetastet',
    favTitelVon(favNur)[0] === 'Beta mit Wertung', JSON.stringify(favTitelVon(favNur)));
  favNur.w.close();

  const favUndTest = await favBaue({ tested: 'tested', favorit: true, sort: 'title_asc' });
  pruefe('Favorit und Teststatus sind kombinierbar, nicht ausschliessend',
    gleich(favTitelVon(favUndTest), ['Beta mit Wertung']),
    JSON.stringify(favTitelVon(favUndTest)));
  favUndTest.w.close();

  /* Der Knopf selbst, mit wirklich zugestelltem Ereignis. `.click()` oder
     der Behandler von Hand gerufen
     genuegen nicht. Geprueft wird am sichtbaren Ergebnis und
     nicht am Zustandsobjekt, das von aussen ohnehin nicht erreichbar ist. */
  const favKlick = await favBaue({ tested: 'all', favorit: false, sort: 'title_asc' });
  const wv = favKlick.w;
  const favKnopf = wv.document.getElementById('f-fav');
  pruefe('Der Filterknopf steht in der Statuszeile', !!favKnopf);
  pruefe('Er ist als Favoritenknopf beschriftet',
    favKnopf?.textContent === '★ Favoriten', favKnopf?.textContent);
  pruefe('Und er sitzt abgesetzt, damit er nicht als vierter Zustand gilt',
    favKnopf?.classList.contains('pill-sep'), favKnopf?.className);
  pruefe('Vor dem Klick ist er nicht gesetzt',
    !favKnopf?.classList.contains('on'), favKnopf?.className);
  favKnopf?.dispatchEvent(new wv.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 30));
  pruefe('Ein zugestellter Klick schaltet den Filter ein',
    gleich(favTitelVon(favKlick), ['Beta mit Wertung', 'Zeta ohne Wertung']),
    JSON.stringify(favTitelVon(favKlick)));
  pruefe('Der Knopf zeichnet sich dabei als gesetzt',
    wv.document.getElementById('f-fav')?.classList.contains('on'),
    wv.document.getElementById('f-fav')?.className);
  wv.document.getElementById('f-fav')?.dispatchEvent(new wv.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 30));
  pruefe('Erneuter Klick nimmt ihn zurueck',
    favTitelVon(favKlick).length === 4 &&
    !wv.document.getElementById('f-fav')?.classList.contains('on'),
    JSON.stringify(favTitelVon(favKlick)));
  wv.close();

  /* Ein aelterer gespeicherter Filter kennt das Feld `favorit` nicht. Er darf
     nicht dazu fuehren, dass der Filter als eingeschaltet gilt. Geprueft am
     Beobachtbaren: alle vier Eintraege sichtbar UND der Knopf ungesetzt --
     ein `undefined` wuerde sich am Knopf zeigen, nicht an der Liste. */
  const favAlt = await favBaue({ tagIds: [], tagMode: 'and', tested: 'all', sort: 'title_asc' });
  pruefe('Ein gespeicherter Filter ohne das neue Feld zeigt alles',
    favTitelVon(favAlt).length === 4, JSON.stringify(favTitelVon(favAlt)));
  pruefe('Und sein Knopf steht ungesetzt da, nicht in einem halben Zustand',
    favAlt.w.document.getElementById('f-fav')?.classList.contains('on') === false,
    favAlt.w.document.getElementById('f-fav')?.className);
  favAlt.w.close();

  /* Der Stern auf der Karte. Im DOM laesst sich ohne Layoutberechnung nicht
     pruefen, ob er sichtbar ist -- deshalb am Stylesheet, wie schon bei den
     Loeschkreuzen. */
  const cssFav = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  const regelFav = (cssFav.match(/\.card-pin \{[^}]*\}/) || [''])[0];
  pruefe('Der Favoritenstern traegt einen eigenen Hintergrund',
    /background: *rgba\(/.test(regelFav), regelFav);
  pruefe('Und er ist groesser als die Fotozahl daneben',
    parseFloat((regelFav.match(/font-size: *([\d.]+)rem/) || [0, 0])[1]) >= 1,
    regelFav);
  pruefe('Er bleibt dabei gold -- keine neue Farbe',
    /color: *var\(--gold\)/.test(regelFav), regelFav);
  // Das Bedienelement dagegen bleibt orange: "Gold ist Bewertung und Favorit,
  // Orange ist Art und Bedienung". Ein goldener Filterknopf braeche die Regel.
  pruefe('Der Filterknopf faerbt sich nicht gold',
    !/\.pill-sep\.on \{[^}]*var\(--gold\)/.test(cssFav),
    (cssFav.match(/\.pill-sep[^{]*\{[^}]*\}/g) || []).join(' '));

  /* Und der Wächter: Eintraege haben Favoriten, Kommentare eine Anpinnung --
     zwei verschiedene Dinge. Wer eines der beiden Woerter global ersetzt,
     macht hier rot. */
  const appQuelle = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  pruefe('Der Eintrag spricht von Favoriten, nicht vom Anheften',
    /title="Favorit"/.test(appQuelle) && !/title="Angeheftet"/.test(appQuelle),
    'die Uebersichtskarte traegt noch den alten Ueberfahrtext');
  pruefe('Der Knopf benennt die naechste Handlung',
    /Als Favorit markieren/.test(appQuelle) && /Favorit entfernen/.test(appQuelle));
  pruefe('Die Kommentare sprechen vom Anpinnen, nicht vom Favoriten',
    (appQuelle.match(/Anpinnen — steht dann ganz oben/g) || []).length === 2,
    'die Umbenennung hat die Kommentare mitgenommen -- das sind zwei verschiedene Dinge');

  /* ================= Offen: die Ansicht ================= */
  gruppe('Offen: die Ansicht in der Oberflaeche');

  const offBaue = async (opt = {}) => {
    const d = baueDom(JSDOM, { hash: '#/offen', ...opt });
    await new Promise(r => setTimeout(r, 90));
    return d;
  };
  const offZeilen = (d) => [...d.w.document.querySelectorAll('.off-zeile')];
  const offTexte = (d) => offZeilen(d).map(z => z.querySelector('.off-text')?.textContent);
  const offGruppen = (d) => [...d.w.document.querySelectorAll('.off-gruppe')];

  /* Drei Zugaenge: nur dann erscheinen Verfassername und Umschalter. Die
     Prueflage des Mocks traegt neben den drei offenen Aufgaben eine
     erledigte, eine Notiz und einen Bericht -- der Mock filtert wie
     der echte Server, und was er nicht liefert, darf hier auch nicht stehen. */
  const offAlle = await offBaue({ einstellungen: { filters: null, benutzerZahl: 3 } });

  pruefe('Die Ansicht ist erreichbar und traegt eine Ueberschrift',
    offAlle.w.document.querySelector('.page-title')?.textContent === 'Offene Aufgaben',
    offAlle.w.document.querySelector('.page-title')?.textContent);
  // Erst das Vorhandensein der Zeilen, dann die Aussage darueber, welche es
  // sind -- auf null Zeilen waere jede Verneinung wahr (Stolperstein 81).
  pruefe('Sie zeigt Zeilen', offZeilen(offAlle).length === 3, `${offZeilen(offAlle).length} Zeilen`);
  pruefe('Und zwar genau die nicht erledigten Aufgaben',
    gleich(offTexte(offAlle), ['Eine Aufgabe', 'Fremde Aufgabe', 'Herrenlose Aufgabe']),
    JSON.stringify(offTexte(offAlle)));
  pruefe('Die erledigte Aufgabe steht nicht darin',
    !offTexte(offAlle).includes('Schon erledigt'), JSON.stringify(offTexte(offAlle)));
  pruefe('Notiz und Bericht ebenso wenig',
    !offTexte(offAlle).includes('Angepinnte Notiz') && !offTexte(offAlle).includes('Ein Bericht'),
    JSON.stringify(offTexte(offAlle)));

  pruefe('Die Zeilen sind nach Eintrag gruppiert',
    offGruppen(offAlle).length === 2, `${offGruppen(offAlle).length} Gruppen`);
  pruefe('Jede Gruppe traegt den Titel ihres Eintrags',
    gleich(offGruppen(offAlle).map(g => g.querySelector('.off-titel')?.textContent),
      ['Beispiel', 'Zweites']),
    JSON.stringify(offGruppen(offAlle).map(g => g.querySelector('.off-titel')?.textContent)));
  pruefe('Und die zweite Gruppe traegt ihre beiden Zeilen',
    offGruppen(offAlle)[1]?.querySelectorAll('.off-zeile').length === 2,
    `${offGruppen(offAlle)[1]?.querySelectorAll('.off-zeile').length}`);
  pruefe('Ein Klick fuehrt in den Eintrag -- am Titel wie an der Zeile',
    offGruppen(offAlle)[1]?.querySelector('.off-titel')?.getAttribute('href') === '#/item/2' &&
    offGruppen(offAlle)[1]?.querySelector('.off-text')?.getAttribute('href') === '#/item/2',
    offGruppen(offAlle)[1]?.querySelector('.off-titel')?.getAttribute('href'));

  /* Verfasser und Datum an der Zeile. Drei Lagen nebeneinander: ein lebender
     Name, ein Fremder und ein Grabstein -- waeren alle gleich, liesse sich
     nicht sehen, ob die Beschriftung ihre eigene Zeile trifft. */
  const offWann = (d) => offZeilen(d).map(z => z.querySelector('.off-wann')?.textContent);
  pruefe('Jede Zeile nennt ihren Verfasser',
    offWann(offAlle)[0]?.startsWith('chefin · ') && offWann(offAlle)[1]?.startsWith('bert · '),
    JSON.stringify(offWann(offAlle)));
  pruefe('Ein Grabstein wird zur Nummer, nicht zum leeren Namen',
    offWann(offAlle)[2]?.startsWith('Gelöschter Benutzer 4 · '), JSON.stringify(offWann(offAlle)));
  pruefe('Und jede Zeile nennt ihr Datum',
    offWann(offAlle).every(t => /\d{2}\.\d{2}\.\d{4}/.test(t || '')), JSON.stringify(offWann(offAlle)));

  /* Der Umschalter -- erst das Vorhandensein bei drei Zugaengen, dann die
     Abwesenheit bei einem (Stolperstein 81). */
  const offSicht = (d, welche) =>
    d.w.document.querySelector(`#off-sicht [data-sicht="${welche}"]`);
  pruefe('Bei mehreren Zugaengen steht der Umschalter „meine / alle" da',
    !!offSicht(offAlle, 'meine') && !!offSicht(offAlle, 'alle'));
  pruefe('Vorgabestellung ist „alle"',
    offSicht(offAlle, 'alle')?.classList.contains('on') &&
    !offSicht(offAlle, 'meine')?.classList.contains('on'),
    `${offSicht(offAlle, 'meine')?.className} | ${offSicht(offAlle, 'alle')?.className}`);
  offSicht(offAlle, 'meine').dispatchEvent(new offAlle.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('„meine" zeigt nur die eigenen Aufgaben',
    gleich(offTexte(offAlle), ['Eine Aufgabe']), JSON.stringify(offTexte(offAlle)));
  pruefe('Und die Zeile darueber sagt, was gezeigt wird',
    /eigenen/.test(offAlle.w.document.getElementById('off-hint')?.textContent || ''),
    offAlle.w.document.getElementById('off-hint')?.textContent);
  offSicht(offAlle, 'alle').dispatchEvent(new offAlle.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Und zurueck geht es auch', offTexte(offAlle).length === 3, JSON.stringify(offTexte(offAlle)));
  offAlle.w.close();

  const offEiner = await offBaue({ einstellungen: { filters: null, benutzerZahl: 1 } });
  pruefe('Bei einem Zugang stehen die Zeilen trotzdem da',
    offZeilen(offEiner).length === 3, `${offZeilen(offEiner).length} Zeilen`);
  pruefe('Aber der Umschalter erscheint nicht',
    !offEiner.w.document.getElementById('off-sicht'));
  pruefe('Und kein Verfassername steht an der Zeile',
    offZeilen(offEiner).every(z => !/ · /.test(z.querySelector('.off-wann')?.textContent || '')),
    JSON.stringify(offEiner.w.document.querySelectorAll('.off-wann').length
      ? [...offEiner.w.document.querySelectorAll('.off-wann')].map(e => e.textContent) : '(keine)'));
  offEiner.w.close();

  /* ================= Der Haken in der Ansicht ================= */
  gruppe('Offen: der Haken in der Ansicht');

  /* EIN BEDIENZEICHEN FOLGT DEM RECHT, NICHT DER ANZEIGE. Erst die Lage, in
     der es dasteht, dann die Gegenlage, in der es fehlt -- und in beiden wird
     zuerst geprueft, dass es die ZEILE ueberhaupt gibt (Stolperstein 81). */
  const offAdmin = await offBaue({ einstellungen: { filters: null, benutzerZahl: 3 } });
  pruefe('Dem Admin steht an jeder Zeile ein Kaestchen',
    offZeilen(offAdmin).length === 3 &&
    offZeilen(offAdmin).every(z => !!z.querySelector('.off-haken')),
    `${offZeilen(offAdmin).filter(z => z.querySelector('.off-haken')).length} von ${offZeilen(offAdmin).length}`);

  const offBenutzer = await offBaue({
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: false } });
  pruefe('Ohne Adminrolle stehen die fremden Zeilen weiterhin da',
    offZeilen(offBenutzer).length === 3, `${offZeilen(offBenutzer).length} Zeilen`);
  pruefe('Aber nur an der eigenen steht ein Kaestchen',
    offZeilen(offBenutzer).filter(z => z.querySelector('.off-haken')).length === 1 &&
    !!offZeilen(offBenutzer)[0].querySelector('.off-haken'),
    JSON.stringify(offZeilen(offBenutzer).map(z => !!z.querySelector('.off-haken'))));
  offBenutzer.w.close();

  /* Ein wirklich zugestellter Druck, kein Behandleraufruf (Stolperstein 61).
     Geprueft wird BEIDES: was hinausgeht, und was danach auf dem Bildschirm
     steht. */
  offAdmin.gesendet.length = 0;
  offZeilen(offAdmin)[0].querySelector('.off-haken')
    .dispatchEvent(new offAdmin.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 50));
  const offGeschickt = offAdmin.gesendet.filter(g => g.methode === 'PUT');
  pruefe('Der Haken schreibt ueber die vorhandene Kommentarroute',
    offGeschickt.length === 1 && offGeschickt[0].url === '/api/comments/65',
    JSON.stringify(offGeschickt.map(g => g.url)));
  /* Er schickt die ART AUSDRUECKLICH und schaltet nicht weiter: aufgabeWeiter()
     machte aus einer erledigten Aufgabe eine Notiz, und die Zeile fiele beim
     zweiten Druck lautlos aus der Menge. */
  pruefe('Und zwar die Art „erledigt", nichts sonst',
    gleich(Object.keys(offGeschickt[0]?.koerper || {}), ['kind']) &&
    offGeschickt[0]?.koerper?.kind === 'done',
    JSON.stringify(offGeschickt[0]?.koerper));
  pruefe('Die Zeile bleibt stehen, sie verschwindet nicht unter dem Zeiger',
    offZeilen(offAdmin).length === 3 && offTexte(offAdmin)[0] === 'Eine Aufgabe',
    JSON.stringify(offTexte(offAdmin)));
  pruefe('Und sie zeichnet sich als erledigt',
    offZeilen(offAdmin)[0].classList.contains('erledigt'),
    offZeilen(offAdmin)[0].className);
  pruefe('Das Kaestchen zeigt jetzt den Haken',
    offZeilen(offAdmin)[0].querySelector('.off-haken')?.textContent === '☑',
    offZeilen(offAdmin)[0].querySelector('.off-haken')?.textContent);

  offAdmin.gesendet.length = 0;
  offZeilen(offAdmin)[0].querySelector('.off-haken')
    .dispatchEvent(new offAdmin.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 50));
  pruefe('Ein zweiter Druck nimmt ihn wieder weg -- und macht keine Notiz daraus',
    offAdmin.gesendet.filter(g => g.methode === 'PUT')[0]?.koerper?.kind === 'task',
    JSON.stringify(offAdmin.gesendet.filter(g => g.methode === 'PUT').map(g => g.koerper)));
  pruefe('Die Zeile steht danach wieder offen da',
    !offZeilen(offAdmin)[0].classList.contains('erledigt'),
    offZeilen(offAdmin)[0].className);

  /* Der Mock aendert seinen Bestand wirklich mit (Stolperstein 90):
     wird die Ansicht neu aufgebaut, ist die abgehakte Zeile fort. Ohne diese
     Zeile waere "die Ansicht hat den Haken gesetzt" von "nichts ist passiert"
     nicht zu unterscheiden. */
  offZeilen(offAdmin)[0].querySelector('.off-haken')
    .dispatchEvent(new offAdmin.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 50));
  offAdmin.w.location.hash = '#/';
  await new Promise(r => setTimeout(r, 60));
  offAdmin.w.location.hash = '#/offen';
  await new Promise(r => setTimeout(r, 90));
  pruefe('Beim naechsten Aufbau ist die abgehakte Zeile fort',
    gleich(offTexte(offAdmin), ['Fremde Aufgabe', 'Herrenlose Aufgabe']),
    JSON.stringify(offTexte(offAdmin)));
  offAdmin.w.close();

  /* Ein leerer Bildschirm ist eine schlechte Antwort. */
  const offLeer = await offBaue({ offenBestand: [], einstellungen: { filters: null, benutzerZahl: 3 } });
  pruefe('Ohne offene Aufgaben steht ein Satz da, kein leerer Bildschirm',
    /Nichts offen/.test(offLeer.w.document.getElementById('off-hint')?.textContent || ''),
    offLeer.w.document.getElementById('off-hint')?.textContent);
  pruefe('Und keine Gruppe daneben', offGruppen(offLeer).length === 0);
  offLeer.w.close();

  /* Nichts von MIR offen ist ein anderer Fall als gar nichts offen -- ein Satz
     fuer beides erklaerte den einen falsch. */
  const offNichtMeine = await offBaue({ einstellungen: { filters: null, benutzerZahl: 3 } });
  offSicht(offNichtMeine, 'meine')
    .dispatchEvent(new offNichtMeine.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  offZeilen(offNichtMeine)[0].querySelector('.off-haken')
    .dispatchEvent(new offNichtMeine.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 50));
  offNichtMeine.w.location.hash = '#/';
  await new Promise(r => setTimeout(r, 60));
  offNichtMeine.w.location.hash = '#/offen';
  await new Promise(r => setTimeout(r, 90));
  offSicht(offNichtMeine, 'meine')
    .dispatchEvent(new offNichtMeine.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('„Von mir ist nichts offen" sagt etwas anderes als „nichts offen"',
    /Von mir ist nichts offen/.test(
      offNichtMeine.w.document.getElementById('off-hint')?.textContent || ''),
    offNichtMeine.w.document.getElementById('off-hint')?.textContent);
  offNichtMeine.w.close();

  /* DIE UEBERSCHRIFT KOMMT AUS DEM VOKABULAR. Eine Ansicht, die „Offene
     Aufgaben" schreibt, waehrend der Betreiber sie „ToDo's" nennt, ist falsch
     beschriftet. Geprueft wird an einer Prueflage, die das Vokabular
     umstellt -- ohne sie bliebe jeder feste String unbemerkt. */
  const offVok = await offBaue({ einstellungen: { ...eigenVoll, benutzerZahl: 3 } });
  pruefe('Die Ueberschrift benutzt das Vokabular, nicht das feste Wort',
    offVok.w.document.querySelector('.page-title')?.textContent === 'Offene ToDo’s',
    offVok.w.document.querySelector('.page-title')?.textContent);
  pruefe('Der Ueberfahrtext am Kaestchen ebenso',
    /Done/.test(offZeilen(offVok)[0]?.querySelector('.off-haken')?.title || ''),
    offZeilen(offVok)[0]?.querySelector('.off-haken')?.title);
  pruefe('Und die Zeile darueber nennt beide Woerter des Vokabulars',
    /ToDo’s/.test(offVok.w.document.getElementById('off-hint')?.textContent || '') &&
    /Maschine/.test(offVok.w.document.getElementById('off-hint')?.textContent || ''),
    offVok.w.document.getElementById('off-hint')?.textContent);
  offVok.w.close();

  const offLeerVok = await offBaue({ offenBestand: [],
    einstellungen: { ...eigenVoll, benutzerZahl: 3 } });
  pruefe('Auch der leere Satz benutzt das Vokabular',
    /ToDo’s/.test(offLeerVok.w.document.getElementById('off-hint')?.textContent || ''),
    offLeerVok.w.document.getElementById('off-hint')?.textContent);
  offLeerVok.w.close();

  /* Der Weg in die Ansicht: ein Knopf in der Kopfzeile, neben dem Zahnrad. */
  const offKopf = baueDom(JSDOM, { einstellungen: { filters: null, benutzerZahl: 3 } });
  await new Promise(r => setTimeout(r, 90));
  const offKnopf = offKopf.w.document.getElementById('offen');
  pruefe('Die Kopfzeile traegt einen Knopf in die Ansicht', !!offKnopf);
  pruefe('Und er steht neben dem Zahnrad',
    offKnopf?.nextElementSibling?.id === 'sys', offKnopf?.nextElementSibling?.id);
  pruefe('Sein Ueberfahrtext kommt aus dem Vokabular',
    offKnopf?.title === 'Offene Aufgaben', offKnopf?.title);
  offKnopf?.dispatchEvent(new offKopf.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 90));
  pruefe('Ein zugestellter Klick fuehrt in die Ansicht',
    offKopf.w.location.hash === '#/offen' &&
    !!offKopf.w.document.querySelector('.off-gruppe'),
    offKopf.w.location.hash);
  offKopf.w.close();

  /* Die Kante und der Durchstrich am Stylesheet -- im gebauten DOM laesst sich
     ohne Layoutberechnung nicht sehen, ob etwas sichtbar ist. Erst das
     Vorhandensein der Regel, dann ihre Eigenschaft (Stolperstein 81, Luecke 1). */
  const cssOff = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  const regelOff = (wahl) => (cssOff.match(new RegExp(wahl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\{[^}]*\\}')) || [''])[0];
  pruefe('Die Gruppe traegt eine Regel im Stylesheet',
    !!regelOff('.off-gruppe'), regelOff('.off-gruppe') || '(keine Regel)');
  pruefe('Und sie ist blau wie die Aufgabe im Eintrag -- keine neue Farbe',
    /border-left: *3px solid var\(--blue\)/.test(regelOff('.off-gruppe')), regelOff('.off-gruppe'));
  pruefe('Die erledigte Zeile hat eine eigene Regel',
    !!regelOff('.off-zeile.erledigt .off-text'), regelOff('.off-zeile.erledigt .off-text') || '(keine Regel)');
  pruefe('Und sie streicht den Text durch',
    /line-through/.test(regelOff('.off-zeile.erledigt .off-text')),
    regelOff('.off-zeile.erledigt .off-text'));

  /* ================= Neu seit ================= */
  gruppe('Neu seit: der Filter in der Uebersicht');

  /* Vier Eintraege, zwei alt und zwei neu -- und die beiden Haelften tragen
     verschiedene Teststatus und Kategorien. Mit lauter gleichartigen Zeilen
     liesse sich nicht sehen, ob der Filter sich mit den uebrigen kombiniert
     oder sie ueberfaehrt.
     DER MERKZEITPUNKT LIEGT MITTAGS: bei Mitternacht faerbte die Zeitzone des
     Prueflaufs die Beschriftung um einen Tag um, und die Pruefung waere je
     nach Rechner rot. */
  const nsKat = { id: 21, name: 'Werkzeug' };
  const nsTag = { id: 1, name: 'Grün' };
  const nsMerk = '2026-08-10 12:00:00';
  const nsEintrag = (id, titel, stand, extra = {}) => ({
    id, title: titel, rejected: false, tested: false, favorite: false, category: null,
    tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null,
    testCount: null, testAvg: null, testLast: null, testDays: [],
    updated_at: stand, searchText: titel.toLowerCase(), ...extra
  });
  const nsBestand = [
    nsEintrag(1, 'Alpha alt', '2026-08-01 10:00:00', { tested: true, category: nsKat }),
    nsEintrag(2, 'Beta neu', '2026-08-20 10:00:00', { tags: [nsTag] }),
    nsEintrag(3, 'Gamma alt', '2026-08-02 10:00:00'),
    nsEintrag(4, 'Delta neu', '2026-08-21 10:00:00', { tested: true, category: nsKat })
  ];
  const nsTagVorrat = [{ id: 1, name: 'Grün', usage_count: 1, test_usage_count: 0 }];
  const nsTitel = (d) => [...d.w.document.querySelectorAll('.card .card-title')].map(e => e.textContent);
  const nsBaue = async (filters, mehr = {}) => {
    const d = baueDom(JSDOM, {
      uebersichtItems: nsBestand, tags: nsTagVorrat,
      einstellungen: { filters, zuletztGesehen: nsMerk, ...mehr }
    });
    await new Promise(r => setTimeout(r, 90));
    return d;
  };
  const nsVorgabe = { categoryId: null, tagIds: [], tagMode: 'and', tested: 'all',
                      favorit: false, neu: false, sort: 'title_asc' };

  /* ERSTER BESUCH: kein Merkzeitpunkt, also kein Umschalter. Erst das
     Vorhandensein der Filterzeile pruefen, dann die Abwesenheit des Knopfes --
     ohne die erste Zeile bliebe die zweite auch bei einer gar nicht
     gezeichneten Zeile gruen (Stolperstein 81). */
  const nsErster = await nsBaue(nsVorgabe, { zuletztGesehen: null });
  pruefe('Beim ersten Besuch steht die Filterzeile trotzdem da',
    !!nsErster.w.document.getElementById('f-fav'));
  pruefe('Aber „Neu seit ..." wird gar nicht erst angeboten',
    !nsErster.w.document.getElementById('f-neu'));
  pruefe('Und es sind alle Eintraege zu sehen', nsTitel(nsErster).length === 4,
    JSON.stringify(nsTitel(nsErster)));
  /* Ein gespeicherter Filter, der den Umschalter auf AN stehen hat, waehrend
     es keinen Bezugspunkt gibt: er darf nichts wegnehmen. Sonst verschwaende
     der halbe Bestand hinter einem Knopf, den es gar nicht gibt. */
  const nsErsterAn = await nsBaue({ ...nsVorgabe, neu: true }, { zuletztGesehen: null });
  pruefe('Ein gespeichertes „neu" ohne Bezugspunkt nimmt nichts weg',
    nsTitel(nsErsterAn).length === 4, JSON.stringify(nsTitel(nsErsterAn)));
  nsErster.w.close(); nsErsterAn.w.close();

  const nsAus = await nsBaue(nsVorgabe);
  const nsKnopf = nsAus.w.document.getElementById('f-neu');
  pruefe('Mit Merkzeitpunkt steht der Umschalter da', !!nsKnopf);
  pruefe('Er nennt den Tag, seit dem gezaehlt wird',
    nsKnopf?.textContent.startsWith('Neu seit 10.08.'), nsKnopf?.textContent);
  pruefe('Und daneben die Zahl',
    nsKnopf?.querySelector('.n')?.textContent === '2', nsKnopf?.querySelector('.n')?.textContent);
  pruefe('Er sitzt abgesetzt, wie der Favoritenknopf daneben',
    nsKnopf?.classList.contains('pill-sep'), nsKnopf?.className);
  pruefe('Vor dem Klick ist er nicht gesetzt',
    !nsKnopf?.classList.contains('on'), nsKnopf?.className);

  /* Ein wirklich zugestellter Klick (Stolperstein 61). */
  nsKnopf.dispatchEvent(new nsAus.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Ein zugestellter Klick zeigt nur, was seither dazugekommen ist',
    gleich(nsTitel(nsAus), ['Beta neu', 'Delta neu']), JSON.stringify(nsTitel(nsAus)));
  pruefe('Und die Zahl daneben stimmt mit der Menge ueberein',
    nsAus.w.document.getElementById('f-neu')?.querySelector('.n')?.textContent
      === String(nsTitel(nsAus).length),
    nsAus.w.document.getElementById('f-neu')?.querySelector('.n')?.textContent);
  pruefe('Der Knopf zeichnet sich dabei als gesetzt',
    nsAus.w.document.getElementById('f-neu')?.classList.contains('on'),
    nsAus.w.document.getElementById('f-neu')?.className);
  nsAus.w.document.getElementById('f-neu')
    .dispatchEvent(new nsAus.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Erneuter Klick nimmt ihn zurueck', nsTitel(nsAus).length === 4,
    JSON.stringify(nsTitel(nsAus)));
  nsAus.w.close();

  /* ER FILTERT, ER SORTIERT NICHT UM -- die tragende Regel dieser Runde.
     Derselbe Bestand einmal mit und einmal ohne Filter, und die verbliebenen
     Eintraege stehen in DERSELBEN Reihenfolge. Geprueft an ZWEI Sortierungen:
     bei nur einer liesse sich nicht ausschliessen, dass der Filter zufaellig
     dieselbe Ordnung erzeugt wie die eingestellte. */
  const nsOrdnung = [
    ['updated_desc', 'nach Änderung',
     ['Delta neu', 'Beta neu', 'Gamma alt', 'Alpha alt'], ['Delta neu', 'Beta neu']],
    ['title_asc', 'nach Titel',
     ['Alpha alt', 'Beta neu', 'Delta neu', 'Gamma alt'], ['Beta neu', 'Delta neu']]
  ];
  for (const [wahl, name, sollOhne, sollMit] of nsOrdnung) {
    const dOhne = await nsBaue({ ...nsVorgabe, sort: wahl });
    const dMit = await nsBaue({ ...nsVorgabe, sort: wahl, neu: true });
    const ohne = nsTitel(dOhne), mit = nsTitel(dMit);
    /* ZUERST DIE UNGEFILTERTE LISTE, und das ist die eigentliche Zusicherung:
       eine Vorsortierung des Neuen VOR dem `switch` -- die Bauform, an der
       schon der Favorit gescheitert ist -- veraendert die Reihenfolge der
       verbliebenen Zeilen gar nicht und bliebe an der Pruefung darunter
       unsichtbar. Sie faellt nur auf, wenn die Liste OHNE Filter an ihrer
       eingestellten Ordnung gemessen wird. */
    pruefe(`Ohne Filter steht die Liste in der eingestellten Ordnung (${name})`,
      gleich(ohne, sollOhne), JSON.stringify(ohne));
    pruefe(`Der Filter nimmt Zeilen weg und ordnet nicht um (${name})`,
      gleich(mit, sollMit) && gleich(mit, ohne.filter(t => mit.includes(t))),
      `ohne ${JSON.stringify(ohne)} / mit ${JSON.stringify(mit)}`);
    dOhne.w.close(); dMit.w.close();
  }

  /* Kombinierbar mit allem anderen -- wie der Favorit. Drei Paare, weil jeder
     der drei Filter anders gebaut ist: Teststatus ist ein Wert aus dreien,
     Kategorie eine Nummer, Tags eine Menge mit eigener Verknuepfung. */
  const nsTest = await nsBaue({ ...nsVorgabe, neu: true, tested: 'tested' });
  pruefe('Kombinierbar mit dem Teststatus',
    gleich(nsTitel(nsTest), ['Delta neu']), JSON.stringify(nsTitel(nsTest)));
  nsTest.w.close();
  const nsKatDom = await nsBaue({ ...nsVorgabe, neu: true, categoryId: 21 });
  pruefe('Kombinierbar mit der Kategorie',
    gleich(nsTitel(nsKatDom), ['Delta neu']), JSON.stringify(nsTitel(nsKatDom)));
  nsKatDom.w.close();
  const nsTagDom = await nsBaue({ ...nsVorgabe, neu: true, tagIds: [1] });
  pruefe('Kombinierbar mit dem Tagfilter',
    gleich(nsTitel(nsTagDom), ['Beta neu']), JSON.stringify(nsTitel(nsTagDom)));
  nsTagDom.w.close();
  /* Und die Gegenlage zum Paar: ohne den zweiten Filter stuenden beide neuen
     Eintraege da. Ohne sie belegte das Paar nur, dass ueberhaupt etwas
     wegfaellt -- nicht, dass BEIDE Bedingungen greifen. */
  const nsNurNeu = await nsBaue({ ...nsVorgabe, neu: true });
  pruefe('Ohne den zweiten Filter blieben es zwei',
    gleich(nsTitel(nsNurNeu), ['Beta neu', 'Delta neu']), JSON.stringify(nsTitel(nsNurNeu)));
  nsNurNeu.w.close();

  /* Bei EINEM Zugang erscheint er trotzdem -- anders als „meine / alle" ist er
     keine Aussage ueber andere. Auch allein vergisst man, wo man war. */
  const nsEiner = await nsBaue(nsVorgabe, { benutzerZahl: 1 });
  pruefe('Auch bei einem einzigen Zugang steht der Umschalter da',
    !!nsEiner.w.document.getElementById('f-neu'));
  nsEiner.w.close();

  /* ================= Der Merkzeitpunkt ================= */
  gruppe('Neu seit: der Merkzeitpunkt');

  /* BEIM VERLASSEN, NICHT BEIM BETRETEN. Erst die Abwesenheit nach dem
     Aufbau -- und die ist hier belastbar, weil daneben belegt wird, dass
     ueberhaupt etwas an /api/settings geht. */
  const nsWeg = await nsBaue(nsVorgabe);
  const nsPuts = () => nsWeg.gesendet.filter(g => g.methode === 'PUT' && g.url === '/api/settings');
  pruefe('Das Betreten der Uebersicht merkt sich nichts',
    nsPuts().length === 0, JSON.stringify(nsPuts().map(g => g.koerper)));
  nsWeg.w.location.hash = '#/item/1';
  await new Promise(r => setTimeout(r, 90));
  pruefe('Das Verlassen der Uebersicht schickt den Merkzeitpunkt',
    nsPuts().length === 1 && nsPuts()[0].koerper?.zuletztGesehen !== undefined,
    JSON.stringify(nsPuts().map(g => g.koerper)));
  /* Was hinausgeht, ist ein SIGNAL und keine Uhrzeit: die Uhr des Aufrufers
     ist eine Behauptung, der Server setzt seine eigene ein. */
  pruefe('Und zwar als Signal, nicht als Zeitangabe des Aufrufers',
    !/\d{4}-\d{2}-\d{2}/.test(String(nsPuts()[0]?.koerper?.zuletztGesehen ?? '')),
    JSON.stringify(nsPuts()[0]?.koerper));
  pruefe('Der Filterstand wandert dabei nicht mit',
    gleich(Object.keys(nsPuts()[0]?.koerper || {}), ['zuletztGesehen']),
    JSON.stringify(nsPuts()[0]?.koerper));

  /* DER BEZUGSPUNKT BLEIBT WAEHREND EINES SEITENLEBENS STEHEN. Ohne das waere
     die Menge nach dem ersten geoeffneten Eintrag leer: man saehe zwei Neue
     und verloere sie beim ersten Klick. */
  nsWeg.w.location.hash = '#/';
  await new Promise(r => setTimeout(r, 90));
  pruefe('Zurueck in der Uebersicht steht derselbe Bezugspunkt',
    nsWeg.w.document.getElementById('f-neu')?.textContent.startsWith('Neu seit 10.08.'),
    nsWeg.w.document.getElementById('f-neu')?.textContent);
  pruefe('Und dieselbe Menge wie vorher',
    nsWeg.w.document.getElementById('f-neu')?.querySelector('.n')?.textContent === '2',
    nsWeg.w.document.getElementById('f-neu')?.querySelector('.n')?.textContent);
  nsWeg.w.close();

  /* Der Weg in die Ansicht "Offen" ist ebenfalls ein Verlassen der Uebersicht,
     der Weg in den Systembereich auch -- der Merkzeitpunkt haengt an der
     Uebersicht und nicht an einem einzelnen Ziel. */
  for (const ziel of ['#/offen', '#/system', '#/compare']) {
    const d = await nsBaue(nsVorgabe);
    d.w.location.hash = ziel;
    await new Promise(r => setTimeout(r, 90));
    pruefe(`Auch der Weg nach ${ziel} merkt den Zeitpunkt`,
      d.gesendet.filter(g => g.methode === 'PUT' && g.url === '/api/settings'
        && g.koerper?.zuletztGesehen !== undefined).length === 1,
      JSON.stringify(d.gesendet.filter(g => g.methode === 'PUT').map(g => g.koerper)));
    d.w.close();
  }

  /* Und die Gegenprobe zum Ganzen: ein Wechsel, der die Uebersicht NICHT
     verlaesst, merkt sich nichts. Ohne sie bliebe offen, ob der Merkzeitpunkt
     bei jedem Neuzeichnen hinausginge -- dann stuende er auf dem Augenblick,
     in dem man hinsieht, und "neu seit" waere immer leer. */
  const nsBleibt = await nsBaue(nsVorgabe);
  nsBleibt.w.document.getElementById('f-neu')
    .dispatchEvent(new nsBleibt.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 60));
  pruefe('Ein Filterklick in der Uebersicht merkt sich keinen Zeitpunkt',
    nsBleibt.gesendet.filter(g => g.methode === 'PUT' && g.url === '/api/settings'
      && g.koerper?.zuletztGesehen !== undefined).length === 0,
    JSON.stringify(nsBleibt.gesendet.filter(g => g.methode === 'PUT').map(g => g.koerper)));
  pruefe('Er schreibt aber sehr wohl die Filterwahl',
    nsBleibt.gesendet.some(g => g.methode === 'PUT' && g.url === '/api/settings'
      && g.koerper?.filters !== undefined),
    JSON.stringify(nsBleibt.gesendet.filter(g => g.methode === 'PUT').map(g => Object.keys(g.koerper || {}))));
  nsBleibt.w.close();

  /* ================= Blöcke ================= */
  gruppe('Blöcke anordnen und einklappen');

  const eigeneOrdnung = { filters: null, bloecke: {
    seite: ['bewertung', 'kategorie', 'tags'],
    unten: ['kommentare', 'beschreibung', 'testtage', 'links', 'dateien'],
    zu: ['links']
  }};
  const bd = baueDom(JSDOM, { einstellungen: eigeneOrdnung, hash: '#/item/1' });
  const wb = bd.w;
  await new Promise(r => setTimeout(r, 80));

  pruefe('Ordnen: Unbekanntes raus, Fehlendes hinten dran',
    gleich(wb.ordneBereich(['bewertung', 'quatsch', 'bewertung'], ['kategorie', 'tags', 'bewertung']),
           ['bewertung', 'kategorie', 'tags']));

  const namen2 = (sel) => [...wb.document.querySelectorAll(sel + ' > .block')].map(b => b.dataset.block);
  pruefe('Gespeicherte Reihenfolge wird angewandt (Seite)',
    gleich(namen2('#blocks-seite'), ['bewertung', 'kategorie', 'tags']), JSON.stringify(namen2('#blocks-seite')));
  pruefe('Gespeicherte Reihenfolge wird angewandt (unten)',
    gleich(namen2('#blocks-unten'), ['kommentare', 'beschreibung', 'testtage', 'links', 'dateien']),
    JSON.stringify(namen2('#blocks-unten')));
  pruefe('Jeder Block hat einen Griff',
    [...wb.document.querySelectorAll('.block[data-block]')].every(b => b.querySelector('.bgrip')));

  const links = wb.document.querySelector('[data-block="links"]');
  pruefe('Gespeicherter Einklappzustand wird angewandt', links.classList.contains('zu'));
  pruefe('Eingeklappte Kopfzeile nennt den Inhalt',
    links.querySelector('.bsumme').textContent === '(8)',
    links.querySelector('.bsumme').textContent);
  const kommentare = wb.document.querySelector('[data-block="kommentare"]');
  pruefe('Offener Block zeigt keine Zusammenfassung',
    kommentare.querySelector('.bsumme').textContent === '');

  // Aufklappen per Klick auf die Kopfzeile
  links.querySelector('.block-head').onclick({ target: links.querySelector('.label') });
  await new Promise(r => setTimeout(r, 20));
  pruefe('Klick auf die Kopfzeile klappt auf', !links.classList.contains('zu'));
  const gespeichertB = bd.gesendet.filter(x => x.koerper && x.koerper.bloecke).pop();
  pruefe('Einklappzustand wird serverseitig gespeichert',
    gespeichertB && gleich(gespeichertB.koerper.bloecke.zu, []), JSON.stringify(gespeichertB && gespeichertB.koerper.bloecke));

  // Knoepfe in der Kopfzeile duerfen nicht einklappen
  const bewertung = wb.document.querySelector('[data-block="bewertung"]');
  const vorher = bewertung.classList.contains('zu');
  bewertung.querySelector('.block-head').onclick({ target: wb.document.getElementById('reset-r') });
  pruefe('Knopf in der Kopfzeile klappt nicht mit ein',
    bewertung.classList.contains('zu') === vorher);
  bewertung.querySelector('.block-head').onclick({ target: bewertung.querySelector('.bgrip') });
  pruefe('Der Griff klappt nicht mit ein', bewertung.classList.contains('zu') === vorher);

  /* DERSELBE VOLLE SATZ AUCH EINGEKLAPPT -- eingeklappt ist gerade der Moment,
     in dem man nicht hineinsieht. Der Hinweis steht in der Kopfzeile und bleibt
     deshalb von selbst stehen; die Kurzfassung daneben bleibt leer, sonst
     stuende derselbe Satz zweimal in einer Zeile. Und eine leere Kurzfassung
     erzeugt KEINE leere Klammer: "()" waere eine Klammer um nichts. */
  kommentare.querySelector('.block-head').onclick({ target: kommentare.querySelector('.label') });
  await new Promise(r => setTimeout(r, 20));
  pruefe('Der Kommentarblock laesst sich einklappen', kommentare.classList.contains('zu'));
  pruefe('Eingeklappt steht dort keine leere Klammer',
    kommentare.querySelector('.bsumme').textContent === '',
    `"${kommentare.querySelector('.bsumme').textContent}"`);
  pruefe('Und derselbe volle Satz steht weiterhin in der Kopfzeile',
    kommentare.querySelector('#ccount')?.textContent
      === '6 Kommentare, davon 1 Bericht und 2 Aufgaben (1 Erledigt)',
    kommentare.querySelector('#ccount')?.textContent);
  // Wieder aufklappen, damit die Gruppen darunter denselben Aufbau vorfinden.
  kommentare.querySelector('.block-head').onclick({ target: kommentare.querySelector('.label') });
  await new Promise(r => setTimeout(r, 20));
  pruefe('Und wieder auf', !kommentare.classList.contains('zu'));

  /* UMGEDREHT STATT GELOESCHT (Stolperstein 74). Bis hierher zaehlte die
     Kurzfassung die Kommentare; jetzt traegt der Block seinen vollen Satz an
     eigener Stelle, und die Kurzfassung bleibt ausdruecklich leer. BEIDE
     HAELFTEN IN EINER PRUEFUNG: die eine allein bliebe gruen, waehrend die
     andere alles wegnimmt. */
  pruefe('Der Kommentarblock zaehlt in seinem Hinweis, nicht in der Kurzfassung',
    wb.blockZusammenfassung('kommentare', { comments: [{ kind: 'note' }, { kind: 'report' }] }) === '' &&
    wb.kommentarZahlen([{ kind: 'note' }, { kind: 'report' }]) === '2 Kommentare, davon 1 Bericht',
    `Kurzfassung "${wb.blockZusammenfassung('kommentare', { comments: [{ kind: 'note' }] })}", ` +
    `Hinweis "${wb.kommentarZahlen([{ kind: 'note' }, { kind: 'report' }])}"`);

  // Zusammenfassung nennt echte Zahlen
  pruefe('Zusammenfassung kürzt die Beschreibung',
    wb.blockZusammenfassung('beschreibung', { description: 'x'.repeat(80) }).endsWith(' …'));
  pruefe('Leere Beschreibung sagt das auch',
    wb.blockZusammenfassung('beschreibung', { description: '   ' }) === 'leer');
  pruefe('Fehlende Kategorie sagt das auch',
    wb.blockZusammenfassung('kategorie', { category: null }) === 'keine');

  /* --- Ziehen am Griff --- */
  const seiteBloecke = [...wb.document.querySelectorAll('#blocks-seite > .block')];
  wb.document.elementFromPoint = () => seiteBloecke[2];
  const zeiger2 = (art, y, ziel) => {
    const e = new wb.Event(art, { bubbles: true });
    Object.defineProperty(e, 'clientX', { value: 0 });
    Object.defineProperty(e, 'clientY', { value: y });
    if (ziel) Object.defineProperty(e, 'target', { value: ziel });
    return e;
  };
  // Am Rumpf des Blocks darf nichts passieren -- nur der Griff zieht.
  seiteBloecke[0].dispatchEvent(zeiger2('pointerdown', 0, seiteBloecke[0]));
  wb.document.dispatchEvent(zeiger2('pointermove', 200));
  wb.document.dispatchEvent(zeiger2('pointerup', 200));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ziehen am Rumpf verschiebt nichts',
    gleich(namen2('#blocks-seite'), ['bewertung', 'kategorie', 'tags']), JSON.stringify(namen2('#blocks-seite')));

  seiteBloecke[0].querySelector('.bgrip').dispatchEvent(zeiger2('pointerdown', 0));
  wb.document.dispatchEvent(zeiger2('pointermove', 200));
  wb.document.dispatchEvent(zeiger2('pointerup', 200));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ziehen am Griff verschiebt den Block',
    gleich(namen2('#blocks-seite'), ['kategorie', 'tags', 'bewertung']), JSON.stringify(namen2('#blocks-seite')));
  const nachZug = bd.gesendet.filter(x => x.koerper && x.koerper.bloecke).pop();
  pruefe('Neue Reihenfolge wird serverseitig gespeichert',
    nachZug && gleich(nachZug.koerper.bloecke.seite, ['kategorie', 'tags', 'bewertung']),
    JSON.stringify(nachZug && nachZug.koerper.bloecke.seite));
  pruefe('Bereiche bleiben getrennt',
    !nachZug.koerper.bloecke.seite.includes('kommentare') &&
    !nachZug.koerper.bloecke.unten.includes('bewertung'));

  /* ================= Dateien in der Oberflaeche ================= */
  gruppe('Dateien in der Oberflaeche');

  const dateiZeilen = [...wb.document.querySelectorAll('#atts .arow')];
  // Zeile anklicken, ohne ueber fehlende Teile zu stolpern: sonst reisst ein
  // Rueckbau in der Gegenprobe den ganzen Lauf mit.
  const klick = (z, teil = '.aname') => {
    if (!z || typeof z.onclick !== 'function') return false;
    z.onclick({ target: z.querySelector(teil) || z });
    return true;
  };
  const text = (z, sel) => z?.querySelector(sel)?.textContent ?? '(fehlt)';
  pruefe('Alle Dateien werden aufgelistet', dateiZeilen.length === 4, `${dateiZeilen.length}`);
  pruefe('Name und Größe stehen in der Zeile',
    dateiZeilen[0].textContent.includes('notiz.txt') && dateiZeilen[3].textContent.includes('5,0 MB'),
    dateiZeilen[3].textContent);
  pruefe('Jede Datei lässt sich herunterladen',
    dateiZeilen.every(z => z.querySelector('a[download]')));
  pruefe('Jede Zeile reagiert auf einen Klick', dateiZeilen.every(z => typeof z.onclick === 'function'));
  pruefe('Jede Datei lässt sich entfernen',
    dateiZeilen.every(z => z.querySelector('.xdel')));
  // Vorhanden ist nicht sichtbar: .xdel steht auf opacity 0 und wird erst beim
  // Überfahren eingeblendet. Fehlt die eigene Zeilenart in dieser Regel, ist
  // der Knopf unsichtbar und die Funktion wirkt, als gäbe es sie nicht.
  // Im DOM ohne Layoutberechnung lässt sich das nur am Stylesheet prüfen.
  const cssText = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  const einblendRegel = (cssText.match(/^[^{}]*\.xdel[^{}]*\{[^}]*opacity: *1[^}]*\}/m) || [''])[0];
  ['.lrow', '.trow', '.arow'].forEach(art =>
    pruefe(`Löschkreuz wird in ${art} eingeblendet`,
      einblendRegel.includes(`${art}:hover`), einblendRegel || '(keine Regel gefunden)'));
  // Umgekehrt fuer die Bewertungszeile: dort gibt es keines.
  // Ein Kriterium zu loeschen wirkt auf alle Eintraege und gehoert deshalb in
  // den Systembereich, nicht neben das Sterne-Widget eines einzelnen Eintrags.
  pruefe('In der Bewertungszeile gibt es kein Löschkreuz mehr',
    !einblendRegel.includes('.rrow:hover'), einblendRegel);
  pruefe('Ohne Überfahren sind die Kreuze immer sichtbar',
    /@media \(hover: none\)[^}]*\.xdel[^}]*opacity: *1/.test(cssText.replace(/\s+/g, ' ')));
  pruefe('Der Ladeverweis zeigt nicht auf inline',
    dateiZeilen.every(z => !/inline=1/.test(z.querySelector('a[download]')?.getAttribute('href') || '')));
  pruefe('Ansehbares kündigt das Aufklappen an',
    dateiZeilen.slice(0, 3).every(z => text(z, '.ago') === '▸'),
    dateiZeilen.map(z => text(z, '.ago')).join(' '));
  pruefe('Nicht Ansehbares kündigt das Herunterladen an', text(dateiZeilen[3], '.ago') === '↓');

  // Der Klick auf die Zeile: bei nicht Ansehbarem loest er den Ladeverweis
  // aus, statt eine Vorschau zu oeffnen.
  let geladen = 0;
  const ladepfeil = dateiZeilen[3]?.querySelector('.adl');
  if (ladepfeil) ladepfeil.click = () => { geladen++; };
  else geladen = -1;   // fehlt der Pfeil, faellt die Pruefung auf, statt zu werfen
  klick(dateiZeilen[3]);
  pruefe('Klick auf das Archiv lädt herunter', geladen === 1, `${geladen}`);
  pruefe('Und öffnet keine Vorschau', !wb.document.querySelector('#atts .apreview'));

  // Klick auf das ✕ oder den Ladepfeil darf die Zeilenwirkung nicht ausloesen.
  klick(dateiZeilen[3], '.adl');
  pruefe('Klick auf den Ladepfeil löst die Zeile nicht doppelt aus', geladen === 1, `${geladen}`);
  klick(dateiZeilen[3], '.xdel');
  pruefe('Klick auf das Löschkreuz löst die Zeile nicht aus', geladen === 1, `${geladen}`);

  // Bildvorschau: muss in einem img landen, nicht in einem iframe.
  klick(dateiZeilen[1]);
  await new Promise(r => setTimeout(r, 20));
  const bildV = wb.document.querySelector('#atts .apreview img');
  pruefe('Bildvorschau benutzt ein img-Element', !!bildV);
  pruefe('Bildvorschau fordert inline an', /inline=1/.test(bildV?.getAttribute('src') || ''));
  pruefe('Bildvorschau öffnet kein iframe', !wb.document.querySelector('#atts .apreview iframe'));
  const klickZeile = (n) => klick([...wb.document.querySelectorAll('#atts .arow')][n]);
  pruefe('Offene Zeile ist als solche erkennbar',
    !![...wb.document.querySelectorAll('#atts .arow')][1]?.classList.contains('offen'));
  klickZeile(1);
  await new Promise(r => setTimeout(r, 20));
  pruefe('Erneuter Klick klappt die Vorschau wieder zu', !wb.document.querySelector('#atts .apreview'));

  // PDF-Vorschau: iframe, aber gesandboxt.
  klickZeile(2);
  await new Promise(r => setTimeout(r, 20));
  const pdfV = wb.document.querySelector('#atts .apreview iframe');
  pruefe('PDF-Vorschau benutzt ein iframe', !!pdfV);
  pruefe('PDF-iframe ist gesandboxt', !!pdfV && pdfV.hasAttribute('sandbox'),
    JSON.stringify(pdfV?.getAttribute('sandbox')));
  // allow-scripts MUSS gesetzt sein: die eingebauten PDF-Betrachter bestehen
  // selbst aus HTML und JavaScript und bleiben sonst leer.
  pruefe('Sandbox erlaubt Skript, sonst bleibt der Betrachter leer',
    /allow-scripts/.test(pdfV?.getAttribute('sandbox') || ''),
    JSON.stringify(pdfV?.getAttribute('sandbox')));
  pruefe('Sandbox erlaubt NICHT allow-same-origin',
    !/allow-same-origin/.test(pdfV?.getAttribute('sandbox') || ''),
    JSON.stringify(pdfV?.getAttribute('sandbox')));
  // Ausweichweg: zeigt ein Browser das PDF trotzdem nicht, muss ein Klick
  // genügen statt eine Sackgasse zu sein.
  const ausweich = wb.document.querySelector('#atts .apreview a[target="_blank"]');
  pruefe('Es gibt den Weg in einen neuen Tab', !!ausweich);
  // Fehlt der Ausweichweg, darf der Prüflauf nicht abstürzen -- sonst
  // verschwinden alle folgenden Ergebnisse in einer Fehlermeldung.
  pruefe('Der neue Tab bekommt kein Fenster-Handle',
    !!ausweich && /noopener/.test(ausweich.getAttribute('rel') || ''),
    ausweich ? ausweich.getAttribute('rel') : '(kein Verweis)');
  pruefe('Ein Hinweis erklärt das leere Fenster',
    /leer/i.test(wb.document.querySelector('#atts .apdf-hint')?.textContent || ''));
  klickZeile(2);

  // Textvorschau: kommt als JSON und wird als Text gesetzt, nicht als HTML.
  klickZeile(0);
  await new Promise(r => setTimeout(r, 40));
  const textV = wb.document.querySelector('#atts .atext');
  pruefe('Textvorschau steht im Dokument', !!textV && /Zweite Zeile/.test(textV.textContent));
  pruefe('Textvorschau lädt keine Datei nach',
    !wb.document.querySelector('#atts .apreview img, #atts .apreview iframe'));

  // Der entscheidende Fall: Text, der wie HTML aussieht, darf kein HTML werden.
  const gefaehrlich = baueDom(JSDOM, { hash: '#/item/1' });
  gefaehrlich.w.fetch = (function (alt) {
    return async function (url, opt) {
      if (String(url).startsWith('/api/attachments/41/preview'))
        return { ok: true, status: 200, json: async () => ({
          art: 'text', text: '<img src=x onerror=1><b id="boese-datei">X</b>', gekuerzt: true }) };
      return alt(url, opt);
    };
  })(gefaehrlich.w.fetch);
  await new Promise(r => setTimeout(r, 80));
  await gefaehrlich.w.renderDetail(1);
  await new Promise(r => setTimeout(r, 20));
  const gz = [...gefaehrlich.w.document.querySelectorAll('#atts .arow')][0];
  gz.onclick({ target: gz.querySelector('.aname') });   // eigenes Fenster, eigener Helfer entfaellt
  await new Promise(r => setTimeout(r, 40));
  pruefe('Text, der wie HTML aussieht, wird nicht zu HTML',
    !gefaehrlich.w.document.getElementById('boese-datei') &&
    /<b id="boese-datei">/.test(gefaehrlich.w.document.querySelector('#atts .atext').textContent));
  pruefe('Gekürzte Vorschau sagt das',
    /gekürzt/i.test(gefaehrlich.w.document.querySelector('#atts .apreview').textContent));
  gefaehrlich.w.close();

  /* ================= Filterwahl ueber Ansichten hinweg ================= */
  gruppe('Filterwahl bleibt beim Wechsel der Ansicht');

  const fItems = [
    { id: 1, title: 'Mit Tag', rejected: false, tested: false, favorite: false, category: null,
      tags: [{ id: 1, name: 'Grün' }], mainPhoto: null, photoCount: 0, linkCount: 0,
      avgRating: null, testCount: null, testAvg: null, testLast: null, testDays: [],
      updated_at: '2026-08-01 10:00:00', searchText: 'mit tag' },
    { id: 2, title: 'Ohne Tag', rejected: false, tested: false, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
      avgRating: null, testCount: null, testAvg: null, testLast: null, testDays: [],
      updated_at: '2026-08-01 10:00:00', searchText: 'ohne tag' }
  ];
  const fTags = [{ id: 1, name: 'Grün', usage_count: 1, test_usage_count: 0 }];
  // Gespeicherter Stand beim Laden der Seite: kein Filter.
  const wFilt = baueDom(JSDOM, { tags: fTags, uebersichtItems: fItems,
    einstellungen: { filters: { tagIds: [], tested: 'all', sort: 'updated_desc' } } }).w;
  await new Promise(r => setTimeout(r, 80));

  const sichtbar = () => [...wFilt.document.querySelectorAll('.card .card-title')].map(e => e.textContent);
  pruefe('Zu Beginn sind alle zu sehen', sichtbar().length === 2, JSON.stringify(sichtbar()));

  [...wFilt.document.querySelectorAll('#filters .pill-tag')].find(b2 => b2.textContent === 'Grün').onclick();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Tagfilter greift', gleich(sichtbar(), ['Mit Tag']), JSON.stringify(sichtbar()));

  // Der entscheidende Fall: in einen Eintrag und wieder zurück. loadAll() setzt
  // state.filters aus der beim Start geholten Momentaufnahme -- wird die nicht
  // mitgeführt, landet man wieder beim Stand vom Seitenaufruf.
  wFilt.location.hash = '#/item/1';
  await new Promise(r => setTimeout(r, 80));
  wFilt.location.hash = '#/';
  await new Promise(r => setTimeout(r, 80));
  pruefe('Nach der Rückkehr steht der Filter noch',
    gleich(sichtbar(), ['Mit Tag']), JSON.stringify(sichtbar()));
  pruefe('Und die Marke ist weiterhin hervorgehoben',
    !![...wFilt.document.querySelectorAll('#filters .pill-tag')]
      .find(b2 => b2.textContent === 'Grün')?.classList.contains('on'));

  // Auch das Zurücksetzen muss die Momentaufnahme mitführen.
  [...wFilt.document.querySelectorAll('#filters .pill-tag')].find(b2 => b2.textContent === 'Grün').onclick();
  await new Promise(r => setTimeout(r, 20));
  wFilt.location.hash = '#/item/1';
  await new Promise(r => setTimeout(r, 80));
  wFilt.location.hash = '#/';
  await new Promise(r => setTimeout(r, 80));
  pruefe('Ein aufgehobener Filter kommt nicht zurück',
    sichtbar().length === 2, JSON.stringify(sichtbar()));
  wFilt.close();

  /* ================= Mehrbenutzer in der Oberflaeche ================= */
  /* Ein Bedienelement ist erst geprueft, wenn ein Ereignis wirklich
     zugestellt wurde. Hier: das Anlegefeld im Systembereich und der
     Ruecksetzer -- und der Beleg, dass es am Eintrag KEIN Anlegefeld gibt. */
  gruppe('Mehrbenutzer-Anzeigen in der Oberflaeche');

  const eMehr = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: true } });
  await new Promise(r => setTimeout(r, 80));
  const eDoc = eMehr.w.document;
  const eSpalten = [...eDoc.querySelectorAll('#ratings .rrow .ravg')];
  pruefe('Bei mehreren Zugaengen steht die Durchschnittsspalte da',
    eSpalten.length === 3, `${eSpalten.length}`);
  // Jede Zeile ihre eigene Zahl: gleiche Werte koennten nicht zeigen, ob die
  // Spalte ueberhaupt der richtigen Zeile zugeordnet ist.
  pruefe('Sie nennt Schnitt und Zahl der Bewerter je Zeile',
    eSpalten[0]?.textContent === '3,4 · 5' && eSpalten[1]?.textContent === '4,1 · 2',
    JSON.stringify(eSpalten.map(z => z.textContent)));
  pruefe('Der Schnitt steht mit Komma, nicht mit Punkt',
    !eSpalten.some(z => z.textContent.includes('.')),
    JSON.stringify(eSpalten.map(z => z.textContent)));
  pruefe('Ein Kriterium ohne Stimme bleibt leer statt eine Null zu zeigen',
    eSpalten[2]?.textContent === '', JSON.stringify(eSpalten[2]?.textContent));
  // Die Sterne bleiben die EIGENEN -- 3 von 5, nicht 3,4.
  pruefe('Die Sterne zeigen weiterhin die eigene Bewertung',
    [...eDoc.querySelectorAll('#ratings .rrow')][0]
      ?.querySelectorAll('.star.on').length === 3,
    `${[...eDoc.querySelectorAll('#ratings .rrow')][0]?.querySelectorAll('.star.on').length}`);
  pruefe('Der Blockkopf traegt den Gesamtschnitt',
    /⌀\s*3,0/.test(eDoc.getElementById('rhead')?.textContent || ''),
    JSON.stringify(eDoc.getElementById('rhead')?.textContent));
  pruefe('Der Ruecksetzer sagt, dass er nur meine Werte trifft',
    /Meine Bewertung/.test(eDoc.getElementById('reset-r')?.textContent || ''),
    JSON.stringify(eDoc.getElementById('reset-r')?.textContent));
  // Angelegt wird nicht mehr am Eintrag. Das ist der eigentliche Umzug.
  pruefe('Am Eintrag gibt es kein Anlegefeld fuer Kriterien mehr',
    !eDoc.getElementById('newcrit'), 'newcrit steht noch in der Detailansicht');

  const eEinzeln = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 1, istAdmin: true } });
  await new Promise(r => setTimeout(r, 80));
  pruefe('Bei einem einzigen Zugang bleibt die Spalte weg',
    eEinzeln.w.document.querySelectorAll('#ratings .rrow .ravg').length === 0,
    `${eEinzeln.w.document.querySelectorAll('#ratings .rrow .ravg').length}`);
  pruefe('Die Sternzeilen stehen trotzdem vollstaendig da',
    eEinzeln.w.document.querySelectorAll('#ratings .rrow').length === 3);

  /* --- Verfassernamen an den vier Traegern -------------------------------
     Bei genau einem aktiven Zugang bleibt alles davon aus. Abgeleitet aus der
     Zahl der Zugaenge, ohne Schalter -- ein Zustand, keine zweite Wahrheit.
     Deshalb steht die Gegenlage (eEinzeln) hier gleich daneben: eine Pruefung,
     die nur die Anzeige belegt, liesse offen, ob die Schwelle ueberhaupt
     wirkt. */
  pruefe('Bei einem Zugang steht keine Verfasserzeile am Eintrag',
    eEinzeln.w.document.getElementById('ivf')?.hidden === true,
    JSON.stringify(eEinzeln.w.document.getElementById('ivf')?.textContent));
  // Und damit auch kein Datum. Es steht dort schon in der Sortierung; die
  // Zeile bliebe sonst als reine Datumszeile stehen.
  pruefe('Und damit auch kein Anlegedatum',
    !/2026/.test(eEinzeln.w.document.getElementById('ivf')?.textContent || ''),
    JSON.stringify(eEinzeln.w.document.getElementById('ivf')?.textContent));
  pruefe('Und kein Name an den Kommentaren',
    eEinzeln.w.document.querySelectorAll('#cmts .cmt-von').length === 0);
  pruefe('Und keiner an den Testtagen',
    eEinzeln.w.document.querySelectorAll('#tdays .tvon').length === 0);
  /* UMGEDREHT MIT 0.8.6, nicht geloescht: bis 0.8.5 hiess die Prueflage "Und
     keine Stimmenliste unter den Sternen" und war die einzige Lage, in der
     unter den Sternen nichts stand. Unter den Sternen steht jetzt fuer
     JEDEN nichts mehr; was hier bleibt, ist die zweite Haelfte der Bedingung
     am Aufrufknopf: bei einem einzigen Zugang waere die Ansicht der eigene
     Wert ein zweites Mal. Diese Lage ist Admin -- ohne sie waere die Halbierung
     der Bedingung von "nur der Admin" nicht zu unterscheiden. */
  pruefe('Bei einem Zugang gibt es den Aufruf gar nicht',
    eEinzeln.w.document.getElementById('rwho') === null &&
    eEinzeln.w.document.getElementById('reset-r') !== null,
    'rwho steht im Blockkopf');
  eEinzeln.w.close();

  const eIvf = eDoc.getElementById('ivf');
  pruefe('Ab zwei Zugaengen sagt der Eintrag, wer ihn angelegt hat',
    eIvf?.hidden === false && /Angelegt von bert/.test(eIvf?.textContent || ''),
    JSON.stringify([eIvf?.hidden, eIvf?.textContent]));
  /* Und seit 0.8.6 auch, wann. Geprueft wird auf den Tag aus created_at
     (2026-07-20), nicht bloss auf irgendeine Zahl: eine Pruefung auf "da steht
     ein Datum" bliebe auch bei einem falschen gruen. */
  pruefe('Und seit 0.8.6 auch, wann',
    /Angelegt von bert am 20\.07\.2026/.test(eIvf?.textContent || ''),
    JSON.stringify(eIvf?.textContent));

  const eVon = [...eDoc.querySelectorAll('#cmts .cmt .cmt-von')].map(z => z.textContent);
  pruefe('Jeder Kommentar traegt den Namen seines Verfassers',
    eVon.length === 6 && eVon.includes('chefin') && eVon.includes('bert'),
    JSON.stringify(eVon));
  /* Der Grabstein bekommt die Nummer, nicht den freigegebenen Namen -- das
     ist der ganze Zweck der stehengebliebenen Zeile. Und die herrenlose Zeile
     bekommt etwas ANDERES: "kein Verfasser mehr feststellbar" ist nicht
     dasselbe wie "der Zugang wurde entfernt". */
  pruefe('Ein Grabstein erscheint als „Geloeschter Benutzer <nr>"',
    eVon.includes('Gelöschter Benutzer 4'), JSON.stringify(eVon));
  pruefe('Eine herrenlose Zeile nennt keinen Namen, sondern sagt das',
    eVon.includes('Ohne Verfasser'), JSON.stringify(eVon));
  pruefe('Der freigegebene Grabsteinname steht nirgends auf dem Bildschirm',
    !/geloescht-4/.test(eDoc.body.textContent || ''), 'geloescht-4 steht im Text');

  const eTvon = [...eDoc.querySelectorAll('#tdays .tvon')].map(z => z.textContent);
  pruefe('Jeder Testtag nennt seinen Verfasser',
    eTvon.length === 1 && eTvon[0] === 'chefin', JSON.stringify(eTvon));

  /* --- Wer angemeldet ist, in der Kopfzeile -----------------------------
     AUCH BEI EINEM EINZIGEN ZUGANG: eine Aussage ueber MICH, nicht ueber
     andere -- derselbe Grund, aus dem die Karte "Zugang" fuer jeden
     stehenbleibt. Deshalb steht die Lage mit einem Zugang hier VORNE: an ihr
     faellt auf, wenn jemand die Angabe hinter mehrereBenutzer() klemmt. */
  const eKopf1 = baueDom(JSDOM, {
    einstellungen: { filters: null, benutzerZahl: 1, istAdmin: true, name: 'chefin' } });
  await new Promise(r => setTimeout(r, 80));
  pruefe('Die Kopfzeile nennt auch bei einem einzigen Zugang, wer angemeldet ist',
    /Angemeldet als chefin/.test(eKopf1.w.document.getElementById('wer')?.textContent || ''),
    JSON.stringify(eKopf1.w.document.getElementById('wer')?.textContent));
  eKopf1.w.close();

  const eKopf = baueDom(JSDOM, {
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: true, name: 'bert' } });
  await new Promise(r => setTimeout(r, 80));
  const eWer = eKopf.w.document.getElementById('wer');
  pruefe('Und ab zwei Zugaengen ebenso, mit dem Namen des Angemeldeten',
    /Angemeldet als bert/.test(eWer?.textContent || ''), JSON.stringify(eWer?.textContent));
  // Neben dem Knopf zum Abmelden, nicht irgendwo in der Zeile.
  pruefe('Sie steht unmittelbar vor dem Knopf zum Abmelden',
    eWer?.nextElementSibling?.id === 'out', eWer?.nextElementSibling?.id);
  eKopf.w.close();

  /* Ein Benutzername ist Eingabe, keine Konstante -- spitze Klammern duerfen
     kein HTML werden. Dieselbe Regel wie beim Vokabular. */
  const eBoese = baueDom(JSDOM, { einstellungen: { filters: null, benutzerZahl: 3,
    istAdmin: true, name: '<b id="boese9">X</b>' } });
  await new Promise(r => setTimeout(r, 80));
  pruefe('Aus einem Benutzernamen wird in der Kopfzeile kein HTML',
    !eBoese.w.document.getElementById('boese9') &&
    (eBoese.w.document.getElementById('wer')?.textContent || '').includes('<b id="boese9">X</b>'),
    eBoese.w.document.getElementById('wer')?.textContent);
  eBoese.w.close();

  /* Nach dem Umbenennen des eigenen Zugangs zieht die Kopfzeile nach.
     ladeEinstellungen() laeuft nur beim Start -- ohne das Nachziehen stuende
     dort bis zum naechsten Laden der Seite der alte Name. */
  const eUm = baueDom(JSDOM, {
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: true, name: 'chefin' } });
  await new Promise(r => setTimeout(r, 80));
  await eUm.w.renderSystem();
  await new Promise(r => setTimeout(r, 30));
  eUm.w.document.getElementById('acc-old').value = 'altes-passwort';
  eUm.w.document.getElementById('acc-user').value = 'chefin2';
  eUm.w.document.getElementById('acc-save')
    .dispatchEvent(new eUm.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 60));
  pruefe('Das Umbenennen geht wirklich an den Server',
    eUm.gesendet.some(x => x.methode === 'PUT' && x.url === '/api/account' &&
                            x.koerper?.username === 'chefin2'),
    JSON.stringify(eUm.gesendet.slice(-2)));
  await eUm.w.renderList();
  await new Promise(r => setTimeout(r, 60));
  pruefe('Und die Kopfzeile nennt danach den neuen Namen',
    /Angemeldet als chefin2/.test(eUm.w.document.getElementById('wer')?.textContent || ''),
    JSON.stringify(eUm.w.document.getElementById('wer')?.textContent));
  eUm.w.close();

  /* --- Wer hat bewertet: die Ansicht des Admins -------------------------
     UMGEHAENGT MIT 0.8.6, nicht geloescht (Stolperstein 74). Bis 0.8.5 standen
     dieselben Aussagen an der Stimmenliste unter der Sternzeile; sie sind mit
     ihr in die Adminansicht gewandert. Was hier NEU dazukommt, ist die
     Gegenrichtung: unter den Sternen steht nichts mehr. */
  pruefe('Unter den Sternen steht seit 0.8.6 keine Stimmenliste mehr',
    [...eDoc.querySelectorAll('#ratings .rrow')].length === 3 &&
    eDoc.querySelectorAll('#ratings .rstimmen').length === 0,
    `${eDoc.querySelectorAll('#ratings .rstimmen').length} Listen`);
  pruefe('Der Blockkopf bietet dem Admin die Ansicht an',
    !!eDoc.getElementById('rwho'), 'kein Knopf im Blockkopf');
  // Wirklich zugestellt, nicht von Hand gerufen -- und danach durch die
  // Event Loop.
  eDoc.getElementById('rwho')?.dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Der Knopf holt die Stimmen beim Server',
    eMehr.gesendet.some(x => x.methode === 'GET' && x.url === '/api/items/1/stimmen'),
    JSON.stringify(eMehr.gesendet.slice(-3)));
  const eAnsicht = eDoc.querySelector('.backdrop #stimmliste');
  pruefe('Und oeffnet einen Dialog mit der Liste', !!eAnsicht);
  const eStimmZeilen = [...(eAnsicht?.querySelectorAll('.stimmzeile') || [])];
  pruefe('Je Kriterium steht dort, wer welchen Wert vergeben hat',
    eStimmZeilen.length === 2, `${eStimmZeilen.length} Zeilen`);
  // Das dritte Kriterium hat keine Stimme -- dort steht auch keine leere Liste.
  pruefe('Ein Kriterium ohne Stimme bekommt gar keine Liste',
    eStimmZeilen.length === 2 &&
    [...eDoc.querySelectorAll('#ratings .rrow')].length === 3);
  // Der Name kommt aus dem Eintrag, nicht aus der Antwort des Endpunkts --
  // zwei Quellen fuer denselben Namen waeren zwei Wahrheiten.
  pruefe('Jede Zeile traegt den Namen ihres Kriteriums',
    gleich(eStimmZeilen.map(z => z.querySelector('.rname')?.textContent), ['Zuerst', 'Dann']),
    JSON.stringify(eStimmZeilen.map(z => z.querySelector('.rname')?.textContent)));
  const eStimmen = [...eStimmZeilen[0]?.querySelectorAll('.rstimme') || []]
    .map(z => z.textContent.replace('✕', '').trim());
  pruefe('Jede Stimme nennt Name und Wert',
    gleich(eStimmen, ['chefin 3', 'bert 4', 'Gelöschter Benutzer 4 2',
                      'Ohne Verfasser 4', 'carla 4']),
    JSON.stringify(eStimmen));
  pruefe('Die eigene Stimme ist gekennzeichnet',
    eStimmZeilen[0]?.querySelectorAll('.rstimme.meine').length === 1,
    `${eStimmZeilen[0]?.querySelectorAll('.rstimme.meine').length}`);
  /* Das ✕ steht am FREMDEN Wert. Am eigenen nicht: dafuer gibt es die Sterne
     und den Ruecksetzer, und zwei Wege fuer dieselbe Absicht waeren einer zu
     viel. Eine Rollenfrage steht hier NICHT mehr daneben -- den Dialog
     bekommt ohnehin nur der Admin zu sehen, und eine zweite Klemme darin
     liesse sich nicht gegenpruefen. */
  pruefe('An jeder fremden Stimme steht ein ✕',
    eStimmZeilen[0]?.querySelectorAll('.rstimme .xdel').length === 4,
    `${eStimmZeilen[0]?.querySelectorAll('.rstimme .xdel').length}`);
  pruefe('Aber keins an der eigenen',
    !eStimmZeilen[0]?.querySelector('.rstimme.meine .xdel'));
  pruefe('Und der freigegebene Grabsteinname steht auch hier nicht',
    !/geloescht-4/.test(eAnsicht?.textContent || ''), eAnsicht?.textContent);

  /* --- Und jetzt wirklich draufdruecken ---------------------------------
     Ein gebauter DOM zeigt nicht, was beim Klicken passiert. Das Ereignis
     wird zugestellt, das Modal bestaetigt, danach durch der Event Loop
     -- und erst dann wird nachgesehen, was der Server bekommen hat.
     Die Rueckfrage liegt hier UEBER dem Dialog: zwei .backdrop
     uebereinander, und der zweite ist der juengere. */
  const eKreuz = eStimmZeilen[0]?.querySelectorAll('.rstimme .xdel')[0];
  if (eKreuz) {
    eKreuz.dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
    const eFrage = [...eDoc.querySelectorAll('.backdrop')].pop();
    pruefe('Das ✕ fragt vorher nach',
      !!eFrage && eFrage !== eAnsicht?.closest('.backdrop'),
      `${eDoc.querySelectorAll('.backdrop').length} Dialoge`);
    pruefe('Die Frage nennt den Verfasser und sagt, dass nur Loeschen geht',
      /bert/.test(eFrage?.textContent || '') && /nicht ändern/.test(eFrage?.textContent || ''),
      eFrage?.querySelector('p')?.textContent);
    eFrage?.querySelector('[data-yes]')?.dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
  }
  const eEntfernt = eMehr.gesendet.filter(x => x.methode === 'DELETE' && /^\/api\/ratings\//.test(x.url)).pop();
  pruefe('Der Klick entfernt wirklich genau diese Bewertung',
    eEntfernt?.url === '/api/ratings/502', JSON.stringify(eEntfernt));
  /* Und die Ansicht zeichnet sich danach neu. Ohne diese Pruefung waere ein
     stehengebliebener Stand von einem neu gezeichneten nicht zu
     unterscheiden -- der Mock nimmt die Stimme deshalb wirklich aus
     seiner Antwort. */
  pruefe('Danach holt sie die Liste neu und zeigt die Stimme nicht mehr',
    eMehr.gesendet.filter(x => x.url === '/api/items/1/stimmen').length === 2 &&
    ![...eDoc.querySelectorAll('.backdrop .rstimme')]
      .some(z => /bert 4/.test(z.textContent)),
    JSON.stringify([...eDoc.querySelectorAll('.backdrop .rstimme')].map(z => z.textContent)));
  /* Zwei Dialoge uebereinander, und eine Taste nimmt nur den obersten weg.
     Ohne diese Frage schluesse dieselbe Taste die Ansicht gleich mit -- der
     Admin haette abgebrochen und staende wieder am Eintrag. */
  const eKreuz2 = [...eDoc.querySelectorAll('.backdrop .rstimme .xdel')][0];
  const eVorAbbruch = eMehr.gesendet.length;
  if (eKreuz2) {
    eKreuz2.dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
    eDoc.dispatchEvent(new eMehr.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
  }
  pruefe('Ein Abbruch nimmt nur die Rueckfrage weg, nicht die Ansicht',
    eDoc.querySelectorAll('.backdrop').length === 1 &&
    !!eDoc.querySelector('.backdrop #stimmliste'),
    `${eDoc.querySelectorAll('.backdrop').length} Dialoge`);
  pruefe('Und geloescht wird dabei nichts',
    eMehr.gesendet.length === eVorAbbruch,
    JSON.stringify(eMehr.gesendet.slice(eVorAbbruch)));
  // Zumachen, sonst steht der Dialog beim Loeschdialog darunter noch im Weg.
  eDoc.querySelector('.backdrop [data-no]')?.dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Und danach ist die Ansicht wirklich zu',
    eDoc.querySelectorAll('.backdrop').length === 0,
    `${eDoc.querySelectorAll('.backdrop').length} Dialoge`);

  /* Ohne Adminrolle gibt es den Aufruf ueberhaupt nicht -- der erste Teil der
     Bedingung. Die zweite Haelfte (ein einziger Zugang) steht weiter oben an
     eEinzeln; ohne beide Lagen bliebe eine der beiden ungeprueft. */
  const eKeinAdmin = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: false } });
  await new Promise(r => setTimeout(r, 80));
  pruefe('Ohne Adminrolle gibt es den Aufruf gar nicht',
    eKeinAdmin.w.document.getElementById('rwho') === null &&
    eKeinAdmin.w.document.getElementById('reset-r') !== null,
    'rwho steht im Blockkopf');
  // Und die Stimmen werden auch nicht abgerufen. Der Server verweigert es
  // ohnehin -- aber ein Abruf, der zuverlaessig ein 403 erzeugt, waere genau
  // die Falle aus 0.8.5: sechs Abrufe in einem Promise.all.
  pruefe('Und die Stimmen werden gar nicht erst abgerufen',
    !eKeinAdmin.gesendet.some(x => /\/stimmen$/.test(x.url)),
    JSON.stringify(eKeinAdmin.gesendet.map(x => x.url)));
  pruefe('Und kein einziger fremder Wert steht auf dem Bildschirm',
    eKeinAdmin.w.document.querySelectorAll('.rstimme').length === 0,
    `${eKeinAdmin.w.document.querySelectorAll('.rstimme').length}`);
  eKeinAdmin.w.close();

  /* --- Der Loeschdialog am Eintrag ---------------------------------------
     Die Zahlen kommen vom Server, nicht aus dem geladenen Eintrag: nur dort
     lassen sich eigene von fremden Beitraegen trennen. */
  eDoc.getElementById('del').dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Der Loeschknopf holt die Zahlen beim Server',
    eMehr.gesendet.some(x => x.url === '/api/items/1/bestand'),
    JSON.stringify(eMehr.gesendet.slice(-3)));
  const eDialog = eDoc.querySelector('.backdrop .modal p')?.textContent || '';
  /* UMGESTELLT MIT 0.8.30, nicht geloescht: bis 0.8.20 stand hier "8 Links"
     im ersten Satz. Ein Link kann seit dieser Fassung fremd sein und gehoert
     damit zu den Beitraegen, nicht zum Eintrag. */
  pruefe('Der Dialog nennt, was am Eintrag selbst haengt',
    /Dabei gehen 1 Foto mit/.test(eDialog), eDialog);
  /* SEIT 0.8.70 IST DER SCHLUSSSATZ EIN ANDERER, und das ist die einzige
     Aenderung dieser Runde an etwas, das taeglich benutzt wird: mit dem
     Papierkorb ist das Loeschen nicht mehr unwiderruflich, und ein Dialog,
     der es weiter behauptete, sagte etwas Falsches. Die Zahlen bleiben --
     sie sind die eigentliche Auskunft. */
  pruefe('Sein Schlusssatz nennt den Papierkorb samt Frist',
    /liegt danach 30 Tage im Papierkorb/.test(eDialog), eDialog);
  pruefe('Und wer zurueckholen darf',
    /Eigentümer der Anlage/.test(eDialog), eDialog);
  pruefe('Das Wort "unwiderruflich" steht nicht mehr darin',
    !/unwiderruflich/i.test(eDialog), eDialog);
  /* Seit 0.8.30 die Links, seit 0.8.31 auch die Dateien: was fremd sein kann,
     steht bei den Beitraegen und nicht beim Eintrag. */
  pruefe('Und weder Links noch Dateien stehen darunter',
    !/Dabei gehen[^.]*Link/.test(eDialog) && !/Dabei gehen[^.]*Datei/.test(eDialog), eDialog);
  pruefe('Und die eigenen Beitraege getrennt',
    /Dazu 6 Links, 5 Dateien, 2 Kommentare, 1 Bewertung, 1 Testtag von mir/.test(eDialog), eDialog);
  /* Der eigentliche Gegenstand: was ANDEREN gehoert, steht in einem eigenen
     Satz -- die Kaskade nimmt es mit, und das darf nicht wortlos geschehen. */
  pruefe('Und die fremden in einem eigenen Satz',
    /Und von anderen: 8 Links, 7 Dateien, 4 Kommentare, 3 Bewertungen, 2 Testtage/.test(eDialog), eDialog);
  eDoc.querySelector('.backdrop [data-no]')?.dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  eMehr.w.close();

  /* --- Das Anlegefeld im Systembereich, mit zugestelltem Ereignis ---
     Beide Lagen bekommen DIESELBEN zwei Tags: nur so laesst sich das Muster
     der Karte an beiden Rollen nebeneinander pruefen. Eine leere Liste zeigt
     "Noch nichts angelegt" -- und eine Pruefung auf fehlende Bedienzeichen
     bliebe daran gruen, ohne je etwas zu belegen (Stolperstein 81). */
  const eSysTags = [
    { id: 21, name: 'Alu', usage_count: 3, test_usage_count: 1 },
    { id: 22, name: 'Stahl', usage_count: 1, test_usage_count: 0 }
  ];
  const eSys = baueDom(JSDOM, { tags: eSysTags,
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: true } });
  await new Promise(r => setTimeout(r, 60));
  await eSys.w.renderSystem();
  await new Promise(r => setTimeout(r, 20));
  const eFeld = eSys.w.document.getElementById('newcrit');
  pruefe('Der Systembereich hat ein Anlegefeld fuer Kriterien', !!eFeld);
  pruefe('Die Kriterienzeilen tragen Griff, Umbenennen und Loeschen',
    [...eSys.w.document.querySelectorAll('#mcrits .mrow')]
      .every(z => z.querySelector('.grip') && z.querySelector('.ed') && z.querySelector('.rm')));
  // Das Gegenstueck zur umgedrehten Pruefung weiter unten: MIT Adminrolle
  // stehen die Zeichen an Tags und Kategorien sehr wohl da. Ohne diese Zeile
  // waere "keine Zeichen" von "gar keine Zeilen" nicht zu unterscheiden.
  pruefe('Und die Tagzeilen tragen mit Adminrolle ✎ und ✕',
    [...eSys.w.document.querySelectorAll('#mtags .mrow')].length === 2 &&
    [...eSys.w.document.querySelectorAll('#mtags .mrow')]
      .every(z => z.querySelector('.ed') && z.querySelector('.rm')),
    `${eSys.w.document.querySelectorAll('#mtags .mrow .mact').length} Knoepfe`);
  if (eFeld) {
    eFeld.value = 'Verpackung';
    // Wirklich zugestellt, nicht von Hand gerufen -- und danach durch die
    // Event Loop.
    eSys.w.document.getElementById('newcrit-b')
      .dispatchEvent(new eSys.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
  }
  const eAngelegt = eSys.gesendet.filter(x => x.methode === 'POST' && x.url === '/api/criteria').pop();
  pruefe('Der Klick legt das Kriterium wirklich an',
    eAngelegt?.koerper?.name === 'Verpackung', JSON.stringify(eAngelegt));
  pruefe('Und das Feld ist danach wieder leer', eFeld?.value === '', JSON.stringify(eFeld?.value));
  eSys.w.close();

  /* --- Und dasselbe fuer einen ohne Adminrolle ---
     istEigentuemer MUSS hier mit auf false: die Rollen sind eine LEITER, ein
     Eigentuemer ohne Adminrecht kann es gar nicht geben. Bliebe das Feld auf
     seiner Vorgabe true, baute die Prueflage eine Lage nach, die der Server
     nie ausliefert -- und pruefte den Systembereich gegen sie. */
  const eSysUser = baueDom(JSDOM, { tags: eSysTags,
    einstellungen: { filters: null, benutzerZahl: 3,
      istAdmin: false, istEigentuemer: false } });
  await new Promise(r => setTimeout(r, 60));
  await eSysUser.w.renderSystem();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ohne Adminrolle gibt es kein Anlegefeld',
    !eSysUser.w.document.getElementById('newcrit'));
  // Der Server verweigert es ohnehin. Ein Knopf, der nur eine Fehlermeldung
  // erzeugt, sieht aber aus wie ein Fehler -- deshalb steht er gar nicht da.
  pruefe('Und die Zeilen tragen weder Griff noch ✎ noch ✕',
    [...eSysUser.w.document.querySelectorAll('#mcrits .mrow')].length === 3 &&
    ![...eSysUser.w.document.querySelectorAll('#mcrits .mrow')]
      .some(z => z.querySelector('.grip') || z.querySelector('.ed') || z.querySelector('.rm')),
    `${eSysUser.w.document.querySelectorAll('#mcrits .mrow .mact').length} Knoepfe`);
  pruefe('Die Kriterien selbst bleiben sichtbar',
    /Zuerst/.test(eSysUser.w.document.getElementById('mcrits')?.textContent || ''));
  /* UMGEDREHT SEIT 0.8.5, nicht geloescht (Stolperstein 74): bis 0.8.4 hiess
     die Prueflage "Tags und Kategorien bleiben unangetastet bedienbar" -- die
     Klemme galt nur den Kriterien. Seit 0.8.5 tragen alle drei Karten
     dasselbe Muster: Zeilen sichtbar, Bedienzeichen weg. Umbenennen und
     Loeschen stehen an allen dreien hinter nurAdmin. */
  pruefe('Tags und Kategorien tragen seit 0.8.5 dasselbe Muster',
    [...eSysUser.w.document.querySelectorAll('#mtags .mrow')].length > 0 &&
    ![...eSysUser.w.document.querySelectorAll('#mtags .mrow')]
      .some(z => z.querySelector('.ed') || z.querySelector('.rm')),
    `${eSysUser.w.document.querySelectorAll('#mtags .mrow .mact').length} Knoepfe`);
  // Und die Namen stehen trotzdem da: wer nicht verwalten darf, darf nachsehen.
  pruefe('Die Tagnamen selbst bleiben sichtbar',
    [...eSysUser.w.document.querySelectorAll('#mtags .mrow .mname')]
      .some(z => (z.textContent || '').trim().length > 0),
    eSysUser.w.document.getElementById('mtags')?.textContent);
  eSysUser.w.close();

  /* --- Die Karte "Zugaenge" -----------------------------------------------
     Was die Karte anbietet, muss genau das sein, was der Server auch
     durchliesse -- ein Knopf, der zuverlaessig eine Fehlermeldung erzeugt,
     sieht aus wie ein Fehler. Dieselbe Ueberlegung wie bei den Kriterien,
     nur mit drei Lagen statt zweien. */
  const gvEig = baueDom(JSDOM, { einstellungen: { filters: null, benutzerZahl: 4,
    istAdmin: true, istEigentuemer: true } });
  await new Promise(r => setTimeout(r, 60));
  await gvEig.w.renderSystem();
  await new Promise(r => setTimeout(r, 40));
  const gvZeilen = [...gvEig.w.document.querySelectorAll('#mzugaenge .mrow')];
  pruefe('Der Systembereich hat eine Karte fuer die Zugaenge', gvZeilen.length === 4,
    `${gvZeilen.length} Zeilen`);
  pruefe('Der eigene Zugang ist als solcher gekennzeichnet',
    /\(du\)/.test(gvZeilen[0]?.textContent || ''), gvZeilen[0]?.textContent);
  /* Der Grabstein zeigt die NUMMER, nicht den gespeicherten Namen. Das ist der
     ganze Zweck der stehengebliebenen Zeile: die Beitraege bleiben sichtbar,
     der Name ist weg. */
  pruefe('Ein geloeschter Zugang erscheint als "Geloeschter Benutzer <nr>"',
    /Gelöschter Benutzer 4/.test(gvZeilen[3]?.textContent || ''), gvZeilen[3]?.textContent);
  pruefe('Und traegt seinen freigegebenen Namen nicht mehr',
    !/geloescht-4/.test(gvZeilen[3]?.textContent || ''), gvZeilen[3]?.textContent);
  pruefe('Ein gesperrter Zugang ist zurueckgenommen, nicht rot markiert',
    gvZeilen[2]?.classList.contains('zug-sperr') && !gvZeilen[2]?.classList.contains('rm'),
    gvZeilen[2]?.className);
  pruefe('Am eigenen Zugang steht kein Werkzeug',
    !gvZeilen[0]?.querySelector('.zug-akt'), gvZeilen[0]?.innerHTML.slice(0, 90));
  pruefe('Am Grabstein ebenfalls nicht', !gvZeilen[3]?.querySelector('.zug-akt'));
  pruefe('Der Eigentuemer kommt an den zweiten Admin heran',
    !!gvZeilen[1]?.querySelector('.zug-akt') && !!gvZeilen[1]?.querySelector('.zug-r'),
    gvZeilen[1]?.innerHTML.slice(0, 90));
  pruefe('Und kann dort alle drei Rollen vergeben',
    [...(gvZeilen[1]?.querySelectorAll('.zug-r option') || [])].map(o => o.value).join(',')
      === 'user,admin,eigentuemer');
  pruefe('Die Anlegezeile hat Name, Passwort und Rollenwahl',
    !!gvEig.w.document.getElementById('zug-name') &&
    !!gvEig.w.document.getElementById('zug-pass') &&
    !!gvEig.w.document.getElementById('zug-rolle'));
  // Wirklich zugestellt, nicht von Hand gerufen.
  gvEig.w.document.getElementById('zug-name').value = 'neuer';
  gvEig.w.document.getElementById('zug-pass').value = 'ein-langes-wort';
  gvEig.w.document.getElementById('zug-anlegen')
    .dispatchEvent(new gvEig.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  const gvAngelegt = gvEig.gesendet.filter(x => x.methode === 'POST' && x.url === '/api/users').pop();
  pruefe('Der Klick legt den Zugang wirklich an',
    gvAngelegt?.koerper?.username === 'neuer' && gvAngelegt?.koerper?.rolle === 'user',
    JSON.stringify(gvAngelegt));
  pruefe('Und die Felder sind danach wieder leer',
    gvEig.w.document.getElementById('zug-name').value === '' &&
    gvEig.w.document.getElementById('zug-pass').value === '');
  gvEig.w.close();

  /* Ein Admin OHNE Eigentuemerrecht. Ohne diese Lage waere nicht zu
     unterscheiden, ob die Karte die Rollenwahl ueberhaupt an etwas festmacht
     -- was im Pruefbestand immer wahr ist, ist ungeprueft. */
  const gvAdm = baueDom(JSDOM, {
    einstellungen: { filters: null, benutzerZahl: 4, istAdmin: true, istEigentuemer: false },
    zugaenge: { ich: 2, darfRollen: false, eigentuemer: 1, zugaenge: [
      { id: 1, username: 'chefin', role: 'eigentuemer', status: 'aktiv', last_login: null, created_at: '', eintraege: 5 },
      { id: 2, username: 'bert', role: 'admin', status: 'aktiv', last_login: null, created_at: '', eintraege: 2 },
      { id: 3, username: 'carla', role: 'user', status: 'aktiv', last_login: null, created_at: '', eintraege: 0 }
    ] } });
  await new Promise(r => setTimeout(r, 60));
  await gvAdm.w.renderSystem();
  await new Promise(r => setTimeout(r, 40));
  const gvAZeilen = [...gvAdm.w.document.querySelectorAll('#mzugaenge .mrow')];
  pruefe('Ein Admin sieht die Karte ebenfalls', gvAZeilen.length === 3, `${gvAZeilen.length}`);
  pruefe('Aber nirgends eine Rollenwahl',
    !gvAdm.w.document.querySelector('#mzugaenge .zug-r') &&
    !gvAdm.w.document.getElementById('zug-rolle'));
  pruefe('An den Eigentuemer kommt er nicht', !gvAZeilen[0]?.querySelector('.zug-akt'));
  pruefe('An einen Benutzer dagegen schon', !!gvAZeilen[2]?.querySelector('.zug-akt'));
  gvAdm.w.close();

  /* Und ein gewoehnlicher Benutzer sieht die Karte gar nicht. */
  const gvUser = baueDom(JSDOM, { einstellungen: { filters: null, benutzerZahl: 4,
    istAdmin: false, istEigentuemer: false } });
  await new Promise(r => setTimeout(r, 60));
  await gvUser.w.renderSystem();
  await new Promise(r => setTimeout(r, 40));
  pruefe('Ohne Adminrolle gibt es die Karte "Zugaenge" nicht',
    !gvUser.w.document.getElementById('mzugaenge') &&
    !gvUser.w.document.getElementById('zug-anlegen'));
  pruefe('Und der Systembereich fragt die Liste gar nicht erst ab',
    !gvUser.gesendet.some(x => x.url === '/api/users'),
    JSON.stringify(gvUser.gesendet.map(x => x.url).filter(u => u.includes('users'))));
  gvUser.w.close();

  /* --- Zeitleiste: eigene Punkte gefuellt, fremde als Ring --- */
  // Sechs Testtage, davon zwei fremde. Unter fuenf Punkten bleibt das Band
  // ohnehin weg (ZEITLEISTE_AB).
  const eZlItems = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: 'S' + i, rejected: false, tested: true, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: 3, testCount: 1, testAvg: 4, testLast: 4,
    updated_at: '2026-08-01 10:00:00', searchText: 's',
    testDays: [{ id: i, day: `202${3 + (i % 3)}-01-15`, rating: 3, mine: i > 1 }]
  }));
  const eZl = baueDom(JSDOM, { uebersichtItems: eZlItems,
    einstellungen: { filters: null, zeitleiste: true, benutzerZahl: 3 } }).w;
  await new Promise(r => setTimeout(r, 80));
  const eAlle = [...eZl.document.querySelectorAll('#zeitleiste .zl-punkt')];
  pruefe('Alle Testtage stehen in der Zeitleiste, auch die fremden',
    eAlle.length === 6, `${eAlle.length}`);
  pruefe('Fremde Punkte sind gekennzeichnet, eigene nicht',
    eAlle.filter(p => p.classList.contains('fremd')).length === 2,
    `${eAlle.filter(p => p.classList.contains('fremd')).length} von ${eAlle.length}`);
  eZl.close();
  eMehr.w.close();

  /* Die Verlaufskurve im Eintrag folgt derselben Regel. Drei Punkte sind das
     Mindeste, ab dem sie ueberhaupt gezeichnet wird. */
  const eSpark = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3 } });
  eSpark.beispiel.testDays = [
    { id: 1, day: '2026-08-03', rating: 5, mine: false, tags: [] },
    { id: 2, day: '2026-08-02', rating: 3, mine: true, tags: [] },
    { id: 3, day: '2026-08-01', rating: 4, mine: true, tags: [] }
  ];
  await new Promise(r => setTimeout(r, 80));
  await eSpark.w.renderDetail(1);
  await new Promise(r => setTimeout(r, 30));
  const eKreise = [...eSpark.w.document.querySelectorAll('#testblock .spark circle')];
  pruefe('Die Verlaufskurve zeichnet jeden Testtag',
    eKreise.length === 3, `${eKreise.length}`);
  pruefe('Und unterscheidet eigene von fremden Punkten',
    eKreise.filter(k => k.getAttribute('stroke') === 'var(--gold)').length === 1 &&
    eKreise.filter(k => k.getAttribute('fill') === 'var(--gold)').length === 2,
    JSON.stringify(eKreise.map(k => `${k.getAttribute('fill')}/${k.getAttribute('stroke')}`)));
  eSpark.w.close();

  /* ================= Zeitleiste abschaltbar ================= */
  gruppe('Zeitleiste abschaltbar');

  const zlItems = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, title: 'S' + i, rejected: false, tested: true, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: 3, testCount: 1, testAvg: 4, testLast: 4,
    updated_at: '2026-08-01 10:00:00', searchText: 's',
    testDays: [{ id: i, day: `202${3 + (i % 3)}-01-15`, rating: 3 }]
  }));
  const zlAn = baueDom(JSDOM, { uebersichtItems: zlItems,
    einstellungen: { filters: null, zeitleiste: true } }).w;
  await new Promise(r => setTimeout(r, 80));
  pruefe('Eingeschaltet erscheint die Zeitleiste',
    !!zlAn.document.querySelector('#zeitleiste .zl'));
  zlAn.close();

  const zlAus = baueDom(JSDOM, { uebersichtItems: zlItems,
    einstellungen: { filters: null, zeitleiste: false } }).w;
  await new Promise(r => setTimeout(r, 80));
  pruefe('Abgeschaltet bleibt sie weg',
    zlAus.document.getElementById('zeitleiste').innerHTML === '');
  pruefe('Das Kartenraster steht trotzdem',
    zlAus.document.querySelectorAll('.card').length === 6);
  zlAus.close();

  const sysZl = baueDom(JSDOM, { einstellungen: { filters: null, zeitleiste: false, linkZeilen: 12 } });
  await new Promise(r => setTimeout(r, 60));
  await sysZl.w.renderSystem();
  const haken = sysZl.w.document.getElementById('zlan');
  pruefe('Der Systembereich hat einen Schalter dafür', !!haken);
  pruefe('Er zeigt den gespeicherten Zustand', haken.checked === false);
  haken.checked = true;
  haken.onchange();
  await new Promise(r => setTimeout(r, 30));
  const zlGesendet = sysZl.gesendet.filter(x => x.koerper && x.koerper.zeitleiste !== undefined).pop();
  pruefe('Umschalten wird serverseitig gespeichert',
    zlGesendet?.koerper.zeitleiste === true, JSON.stringify(zlGesendet?.koerper));

  const lzStufen = [...sysZl.w.document.querySelectorAll('#lzeilen .pill')];
  pruefe('Und es gibt Stufen für die sichtbaren Linkzeilen', lzStufen.length === 4, `${lzStufen.length}`);
  pruefe('Die gespeicherte Stufe ist hervorgehoben',
    lzStufen.find(b3 => b3.classList.contains('on'))?.textContent === '12 Zeilen',
    lzStufen.map(b3 => b3.textContent).join(' '));
  lzStufen[0].onclick();
  await new Promise(r => setTimeout(r, 30));
  const lzGesendet = sysZl.gesendet.filter(x => x.koerper && x.koerper.linkZeilen !== undefined).pop();
  pruefe('Eine andere Stufe wird gespeichert', lzGesendet?.koerper.linkZeilen === 3,
    JSON.stringify(lzGesendet?.koerper));

  // Anbieterwahl in derselben Karte wie die Zeilenknoepfe -- beide
  // betreffen die Linkliste. Dort steht
  // eine Liste aus neun Plaetzen mit Haekchen und Startknopf.
  const anbZeilen = [...sysZl.w.document.querySelectorAll('#sanbieter .sanb')];
  pruefe('Die Verwaltungskarte zeigt alle neun Plätze', anbZeilen.length === 9, `${anbZeilen.length}`);
  pruefe('Jede Zeile trägt Häkchen und Startknopf',
    anbZeilen.every(z => z.querySelector('input[type=checkbox]') && z.querySelector('.sstart')));
  pruefe('Die drei im Vorrat sind angehakt',
    anbZeilen.filter(z => z.querySelector('input[type=checkbox]')?.checked)
      .map(z => z.dataset.k).join() === 'bing,startpage,eigen1',
    anbZeilen.filter(z => z.querySelector('input[type=checkbox]')?.checked).map(z => z.dataset.k).join());
  pruefe('Der Startanbieter ist gekennzeichnet',
    anbZeilen.find(z => z.querySelector('.sstart')?.classList.contains('on'))?.dataset.k === 'startpage',
    anbZeilen.find(z => z.querySelector('.sstart')?.classList.contains('on'))?.dataset.k);
  // Ein leerer Platz laesst sich weder anhaken noch zum Start machen -- er
  // traegt niemanden, den man waehlen koennte.
  const leerZeile = anbZeilen.find(z => z.dataset.k === 'eigen2');
  pruefe('Ein leerer eigener Platz ist gesperrt',
    leerZeile?.querySelector('input[type=checkbox]')?.disabled === true &&
    leerZeile?.querySelector('.sstart')?.disabled === true);
  pruefe('Und zeigt einen Strich statt eines Namens',
    leerZeile?.querySelector('.sanb-name')?.textContent === '—');
  // Der Name ist Eingabe des Admins und wird als Beschriftung gerendert.
  // Geprueft wird die gerenderte Form, nicht textContent allein: spitze
  // Klammern fallen textContent gar nicht auf.
  const eigenZeile = anbZeilen.find(z => z.dataset.k === 'eigen1');
  pruefe('Ein Anbietername mit spitzen Klammern wird in der Karte maskiert',
    eigenZeile?.querySelector('.sanb-name')?.textContent === 'Forum <b>X</b>' &&
    !eigenZeile?.querySelector('.sanb-name b'),
    eigenZeile?.querySelector('.sanb-name')?.innerHTML);

  // Haekchen setzen nimmt in den Vorrat auf, ohne den Standard anzufassen.
  anbZeilen.find(z => z.dataset.k === 'ddg')?.querySelector('input[type=checkbox]')?.click();
  await new Promise(r => setTimeout(r, 30));
  const vorratGesendet = sysZl.gesendet.filter(x => x.koerper && x.koerper.sucheAktiv !== undefined).pop();
  pruefe('Ein Häkchen nimmt einen Anbieter in den Vorrat auf',
    (vorratGesendet?.koerper.sucheAktiv || []).includes('ddg'),
    JSON.stringify(vorratGesendet?.koerper));
  pruefe('Der Standard bleibt dabei vorn',
    vorratGesendet?.koerper.sucheAktiv?.[0] === 'startpage',
    JSON.stringify(vorratGesendet?.koerper.sucheAktiv));

  // Der Startknopf setzt den Standard und nimmt zugleich in den Vorrat auf:
  // ein Standard ausserhalb des Vorrats ist ein unmoeglicher Zustand.
  [...sysZl.w.document.querySelectorAll('#sanbieter .sanb')]
    .find(z => z.dataset.k === 'brave')?.querySelector('.sstart')?.click();
  await new Promise(r => setTimeout(r, 30));
  const stdGesendet = sysZl.gesendet.filter(x => x.koerper && x.koerper.sucheAktiv !== undefined).pop();
  pruefe('Der Startknopf schickt den Anbieter an erster Stelle',
    stdGesendet?.koerper.sucheAktiv?.[0] === 'brave', JSON.stringify(stdGesendet?.koerper.sucheAktiv));
  pruefe('Und nimmt ihn zugleich in den Vorrat auf',
    (stdGesendet?.koerper.sucheAktiv || []).filter(k => k === 'brave').length === 1,
    JSON.stringify(stdGesendet?.koerper.sucheAktiv));

  // Eigene Anbieter: drei Plaetze mit je Name und Vorlage.
  const slots = [...sysZl.w.document.querySelectorAll('#seigene .sanb-slot')];
  pruefe('Es gibt drei Plätze für eigene Anbieter', slots.length === 3, `${slots.length}`);
  pruefe('Der belegte Platz zeigt Name und Vorlage',
    sysZl.w.document.getElementById('se-name-1')?.value === 'Forum <b>X</b>' &&
    sysZl.w.document.getElementById('se-vorlage-1')?.value === 'https://forum.beispiel.de/suche?q=%s',
    sysZl.w.document.getElementById('se-name-1')?.value);
  pruefe('Der Name ist auf 20 Zeichen begrenzt',
    sysZl.w.document.getElementById('se-name-1')?.maxLength === 20,
    `${sysZl.w.document.getElementById('se-name-1')?.maxLength}`);
  sysZl.w.document.getElementById('se-name-2').value = 'Zweites Forum';
  sysZl.w.document.getElementById('se-vorlage-2').value = 'https://zwei.beispiel.de/?q=%s';
  sysZl.w.document.getElementById('se-b-2').onclick();
  await new Promise(r => setTimeout(r, 30));
  const eigGesendet = sysZl.gesendet.filter(x => x.koerper && x.koerper.sucheEigene !== undefined).pop();
  pruefe('Ein eigener Anbieter wird mit Name und Vorlage gespeichert',
    eigGesendet?.koerper.sucheEigene?.[1]?.name === 'Zweites Forum' &&
    eigGesendet?.koerper.sucheEigene?.[1]?.vorlage === 'https://zwei.beispiel.de/?q=%s',
    JSON.stringify(eigGesendet?.koerper.sucheEigene));
  pruefe('Und immer alle drei Plätze auf einmal',
    (eigGesendet?.koerper.sucheEigene || []).length === 3,
    JSON.stringify(eigGesendet?.koerper.sucheEigene));

  // Zahl der Namen: vier feste Stufen, wie schrift und linkZeilen.
  const namenStufen = [...sysZl.w.document.querySelectorAll('#snamen .pill')];
  pruefe('Es gibt vier Stufen für die Zahl der Namen', namenStufen.length === 4, `${namenStufen.length}`);
  pruefe('Die eingestellte Stufe ist hervorgehoben',
    namenStufen.find(b3 => b3.classList.contains('on'))?.textContent === '3 Namen',
    namenStufen.map(b3 => b3.textContent).join(' '));
  pruefe('Die Einzahl steht in der Einzahl', namenStufen[0]?.textContent === '1 Name',
    namenStufen[0]?.textContent);
  namenStufen[0]?.onclick?.();
  await new Promise(r => setTimeout(r, 30));
  const namenGesendet = sysZl.gesendet.filter(x => x.koerper && x.koerper.suchNamen !== undefined).pop();
  pruefe('Eine andere Stufe wird gespeichert', namenGesendet?.koerper.suchNamen === 1,
    JSON.stringify(namenGesendet?.koerper));
  sysZl.w.close();

  /* --- Zahl der Namen: der Deckel und der Fall "weniger da als bestellt" --- */
  // Stufe 1 ist die knappste Anzeige: ein Name, naemlich der Standard.
  const einName = baueDom(JSDOM, { hash: '#/item/1', einstellungen: { filters: null, suchNamen: 1 } });
  await new Promise(r => setTimeout(r, 60));
  const einNamenBox = [...einName.w.document.querySelectorAll('#links .lrow')][7];
  pruefe('Stufe 1 zeigt allein den Startanbieter',
    [...(einNamenBox?.querySelectorAll('.sname') || [])].map(s => s.textContent).join() === 'Startpage',
    [...(einNamenBox?.querySelectorAll('.sname') || [])].map(s => s.textContent).join());
  einName.w.close();

  // Sind weniger im Vorrat als eingestellt, stehen weniger da -- keine leeren
  // Plaetze und kein Auffuellen mit Anbietern, die niemand gewaehlt hat.
  const wenigerAktiv = baueDom(JSDOM, { hash: '#/item/1', einstellungen: { filters: null, suchNamen: 4,
    suchAnbieter: DOM_ANBIETER.map(a => ({ ...a, aktiv: a.schluessel === 'startpage', standard: a.schluessel === 'startpage' })) } });
  await new Promise(r => setTimeout(r, 60));
  const wenigZeile = [...wenigerAktiv.w.document.querySelectorAll('#links .lrow')][7];
  pruefe('Sind weniger im Vorrat als bestellt, stehen weniger da',
    (wenigZeile?.querySelectorAll('.sname') || []).length === 1,
    `${(wenigZeile?.querySelectorAll('.sname') || []).length}`);
  wenigerAktiv.w.close();

  // Zweite Schranke: die Vorlage kommt aus der Datenbank und ist Eingabe.
  // Faellt sie durch, faellt DIESER Anbieter weg -- still einen anderen
  // einzusetzen hiesse, woanders zu suchen, als die Zeile anschreibt.
  const sysBoese = baueDom(JSDOM, { hash: '#/item/1', einstellungen: { filters: null,
    suchAnbieter: DOM_ANBIETER.map(a => a.schluessel === 'startpage'
      ? { ...a, vorlage: 'javascript:alert(1)/*%s*/' } : a) } });
  await new Promise(r => setTimeout(r, 60));
  const bZeile = [...sysBoese.w.document.querySelectorAll('#links .lrow')][7];
  let bZiel = null;
  sysBoese.w.open = (u) => { bZiel = u; };
  const bTippe = (el, art) => {
    const e = new sysBoese.w.Event(art, { bubbles: true, cancelable: true });
    Object.defineProperty(e, 'clientX', { value: 0 });
    Object.defineProperty(e, 'clientY', { value: 0 });
    Object.defineProperty(e, 'pointerType', { value: 'mouse' });
    (art === 'pointerdown' ? el : sysBoese.w.document).dispatchEvent(e);
  };
  bTippe(bZeile, 'pointerdown'); bTippe(bZeile, 'pointerup');
  await new Promise(r => setTimeout(r, 20));
  pruefe('Eine unerlaubte Vorlage aus der Datenbank wird nicht geöffnet',
    !/^javascript:/i.test(String(bZiel)), String(bZiel));
  pruefe('Der durchgefallene Anbieter steht gar nicht erst unter der Zeile',
    ![...bZeile.querySelectorAll('.sname')].some(s => s.textContent === 'Startpage'),
    [...bZeile.querySelectorAll('.sname')].map(s => s.textContent).join(' · '));
  pruefe('Stattdessen rückt der nächste gültige nach',
    bZiel === 'https://www.bing.com/search?q=Handbuch%203000', String(bZiel));
  sysBoese.w.close();

  // Faellt jede Vorlage durch, wird nicht ersatzweise irgendwo gesucht.
  const keinAnbieter = baueDom(JSDOM, { hash: '#/item/1', einstellungen: { filters: null,
    suchAnbieter: DOM_ANBIETER.map(a => ({ ...a, vorlage: 'javascript:alert(1)/*%s*/' })) } });
  await new Promise(r => setTimeout(r, 60));
  const kZeile = [...keinAnbieter.w.document.querySelectorAll('#links .lrow')][7];
  let kZiel = null;
  keinAnbieter.w.open = (u) => { kZiel = u; };
  for (const art of ['pointerdown', 'pointerup']) {
    const e = new keinAnbieter.w.Event(art, { bubbles: true, cancelable: true });
    Object.defineProperty(e, 'clientX', { value: 0 });
    Object.defineProperty(e, 'clientY', { value: 0 });
    Object.defineProperty(e, 'pointerType', { value: 'mouse' });
    (art === 'pointerdown' ? kZeile : keinAnbieter.w.document).dispatchEvent(e);
  }
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ohne einen einzigen gültigen Anbieter wird nichts geöffnet',
    kZiel === null, String(kZiel));
  keinAnbieter.w.close();

  /* ================= Linkliste und Aktionszeichen ================= */
  gruppe('Linkliste und Aktionszeichen');

  const linkZeilen = [...wb.document.querySelectorAll('#links .lrow')];
  const mehrKnopf = wb.document.getElementById('links-more');
  pruefe('Alle Links stehen im Dokument', linkZeilen.length === 8, `${linkZeilen.length}`);
  pruefe('Bei mehr als fünf gibt es einen Aufklappknopf', !!mehrKnopf && !mehrKnopf.hidden);
  pruefe('Der Knopf nennt die Gesamtzahl', /alle 8/.test(mehrKnopf.textContent), mehrKnopf.textContent);
  /* UMGEDREHT MIT 0.8.6, nicht geloescht: bis 0.8.5 hiess die Prueflage
     "Zugeklappt bleibt die Liste scrollbar". Ein eigener Bildlauf faengt auf
     dem Finger die Wischbewegung ab -- wer die Seite herunterzieht und dabei
     ueber die Liste kommt, scrollt ploetzlich nur noch die Liste. Der Weg zum
     Rest ist der Knopf darunter, und den gibt es laengst.
     Erst das Vorhandensein der Begrenzung, dann ihre Art: ohne den ersten Teil
     bliebe die Pruefung auch dann gruen, wenn gar nichts begrenzt waere --
     eine leere Angabe ist ja auch nicht 'auto' (Stolperstein 81). */
  pruefe('Zugeklappt wird die Liste abgeschnitten, nicht scrollbar',
    wb.document.getElementById('links').style.maxHeight !== '' &&
    wb.document.getElementById('links').style.overflowY === 'hidden',
    JSON.stringify([wb.document.getElementById('links').style.maxHeight,
                    wb.document.getElementById('links').style.overflowY]));
  mehrKnopf?.onclick?.();
  await new Promise(r => setTimeout(r, 20));
  const mehr2 = wb.document.getElementById('links-more');
  pruefe('Aufgeklappt fällt die Höhenbegrenzung weg',
    wb.document.getElementById('links').style.maxHeight === '',
    wb.document.getElementById('links').style.maxHeight);
  // Und mit ihr die Abschneidung: aufgeklappt steht die Liste im Fluss der
  // Seite, ohne jede eigene Angabe zum Ueberlauf.
  pruefe('Und die Abschneidung ebenso',
    wb.document.getElementById('links').style.overflowY === '',
    JSON.stringify(wb.document.getElementById('links').style.overflowY));
  pruefe('Und der Knopf klappt wieder zu', /weniger/.test(mehr2?.textContent || ''), mehr2?.textContent);
  mehr2?.onclick?.();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Zuklappen begrenzt wieder',
    wb.document.getElementById('links').style.maxHeight !== '');

  // Suchzeile: keine Adresse, deshalb Lupe statt Pfeil und der Anbieter unter
  // dem Rohtext. Die Zeile muss ohne Ueberfahren erkennbar sein.
  const alleZeilen = [...wb.document.querySelectorAll('#links .lrow')];
  const suchZeile = alleZeilen[7];
  const linkZeile0 = alleZeilen[0];
  pruefe('Die Suchzeile ist als solche gekennzeichnet',
    !!suchZeile?.classList.contains('suche'), suchZeile?.className);
  pruefe('Adresszeilen sind es nicht', !linkZeile0?.classList.contains('suche'));
  pruefe('Oben steht der Rohtext, unverändert',
    suchZeile?.querySelector('.dom')?.textContent === 'Handbuch 3000',
    suchZeile?.querySelector('.dom')?.textContent);
  // Darunter stehen mehrere Anbieter, Standard zuerst. BEWUSST OHNE
  // Vorspann "Suche · ": der erste Trenner bedeutete sonst etwas
  // anderes als der zweite.
  const anbNamen = [...(suchZeile?.querySelectorAll('.snamen .sname') || [])];
  pruefe('Darunter stehen die Anbieter des Vorrats', anbNamen.length === 3, `${anbNamen.length}`);
  pruefe('Der Startanbieter steht vorn',
    anbNamen[0]?.textContent === 'Startpage', anbNamen[0]?.textContent);
  pruefe('Dahinter die übrigen in der Reihenfolge der Liste',
    anbNamen.map(s => s.textContent).join(' · ') === 'Startpage · Bing · Forum <b>X</b>',
    anbNamen.map(s => s.textContent).join(' · '));
  pruefe('Kein Vorspann mehr vor den Namen',
    !/Suche/.test(suchZeile?.querySelector('.snamen')?.textContent || ''),
    suchZeile?.querySelector('.snamen')?.textContent);
  pruefe('Die Namen sind durch Mittelpunkte getrennt',
    (suchZeile?.querySelector('.snamen')?.textContent || '').split(' · ').length === 3,
    suchZeile?.querySelector('.snamen')?.textContent);
  // Der Anbietername ist Eingabe des Admins und die erste Stelle in der
  // Linkliste, an der Eingabe als Beschriftung gerendert wird. Gebaut wird
  // deshalb mit echten Knoten -- geprueft wird am gerenderten HTML, weil
  // textContent eine fehlende Maskierung gar nicht bemerken wuerde.
  pruefe('Ein Anbietername mit spitzen Klammern bleibt Text',
    !suchZeile?.querySelector('.snamen b') &&
    /&lt;b&gt;/.test(suchZeile?.querySelector('.snamen')?.innerHTML || ''),
    suchZeile?.querySelector('.snamen')?.innerHTML);
  pruefe('Jeder Name sagt im Überfahrtext, wohin er führt',
    anbNamen.every(s => /^Suche nach /.test(s.title || '')) &&
    /Forum <b>X<\/b>$/.test(anbNamen[2]?.title || ''),
    anbNamen.map(s => s.title).join(' | '));
  pruefe('Rechts steht die Lupe, kein Pfeil',
    !!suchZeile?.querySelector('.go svg') && !/↗/.test(suchZeile?.querySelector('.go')?.textContent || ''));
  pruefe('Bei Adressen bleibt es der Pfeil',
    /↗/.test(linkZeile0?.querySelector('.go')?.textContent || '') &&
    !linkZeile0?.querySelector('.go svg'));
  pruefe('Der Überfahrtext nennt Suche und Startanbieter',
    /Suche nach/.test(suchZeile?.title || '') && /Startpage/.test(suchZeile?.title || ''),
    suchZeile?.title);
  pruefe('Auch das Löschkreuz sagt, worum es geht',
    /Sucheintrag/.test(suchZeile?.querySelector('.xdel')?.getAttribute('title') || ''),
    suchZeile?.querySelector('.xdel')?.getAttribute('title'));
  // Vorhanden ist nicht sichtbar. Die Einblendregel zaehlt
  // die Zeilenarten einzeln auf -- .lrow steht darin, die Suchzeile ist eine.
  pruefe('Die Suchzeile ist eine .lrow und damit von der Einblendregel erfasst',
    !!suchZeile?.classList.contains('lrow'));

  // Der Klick auf eine Linkzeile laeuft ueber makeSortable, nicht ueber
  // onclick -- deshalb echte Zeigerereignisse. Ohne Bewegung dazwischen gilt
  // das Loslassen als Klick.
  const tippe = (el) => {
    if (!el) return;
    for (const art of ['pointerdown', 'pointerup']) {
      const e = new wb.Event(art, { bubbles: true, cancelable: true });
      Object.defineProperty(e, 'clientX', { value: 0 });
      Object.defineProperty(e, 'clientY', { value: 0 });
      Object.defineProperty(e, 'pointerType', { value: 'mouse' });
      (art === 'pointerdown' ? el : wb.document).dispatchEvent(e);
    }
  };
  let zielSuche = null;
  const openVorher = wb.open;
  wb.open = (u) => { zielSuche = u; };
  tippe(suchZeile);
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Klick auf die Zeile öffnet die Suche beim Startanbieter',
    zielSuche === 'https://www.startpage.com/sp/search?query=Handbuch%203000', String(zielSuche));
  pruefe('Der Suchtext ist dabei kodiert', !/ /.test(String(zielSuche)));
  zielSuche = null;
  tippe(linkZeile0);
  await new Promise(r => setTimeout(r, 20));
  pruefe('Bei einer Adresse wird sie selbst geöffnet',
    zielSuche === 'https://beispiel.de/0', String(zielSuche));

  // Ein Klick auf einen Alternativnamen sucht bei genau diesem Anbieter --
  // das ist der ganze Zweck der Namensliste.
  zielSuche = null;
  anbNamen[2]?.onclick?.({ stopPropagation: () => {} });
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Klick auf einen Alternativnamen sucht dort',
    zielSuche === 'https://forum.beispiel.de/suche?q=Handbuch%203000', String(zielSuche));
  zielSuche = null;
  anbNamen[0]?.onclick?.({ stopPropagation: () => {} });
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Klick auf den Startanbieter tut dasselbe wie die Zeile',
    zielSuche === 'https://www.startpage.com/sp/search?query=Handbuch%203000', String(zielSuche));

  // Die Namen liegen IN der Zeile, die selbst Klickziel und Ziehgriff ist.
  // Ohne Ausnahme im Sortierer loeste ein Namensklick zwei Dinge zugleich
  // aus: ziehen und suchen.
  zielSuche = null;
  const namenTippe = (el) => {
    for (const art of ['pointerdown', 'pointerup']) {
      const e = new wb.Event(art, { bubbles: true, cancelable: true });
      Object.defineProperty(e, 'clientX', { value: 0 });
      Object.defineProperty(e, 'clientY', { value: 0 });
      Object.defineProperty(e, 'pointerType', { value: 'mouse' });
      (art === 'pointerdown' ? el : wb.document).dispatchEvent(e);
    }
  };
  namenTippe(anbNamen[2]);
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Zeigerdruck auf einen Namen löst den Zeilenklick nicht mit aus',
    zielSuche === null, String(zielSuche));
  wb.open = openVorher;

  // Aktionen: ueberall Zeichen, nicht mal Text mal Zeichen.
  const kopfAktionen = [...wb.document.querySelectorAll('#cmts .cmt-head .acts button')];
  pruefe('Kommentaraktionen sind Zeichen, kein Text',
    kopfAktionen.every(b3 => b3.textContent.length <= 2),
    kopfAktionen.map(b3 => b3.textContent).join(' '));
  pruefe('Sie tragen dieselbe Klasse wie die übrigen Zeilenaktionen',
    kopfAktionen.every(b3 => b3.classList.contains('mact')));
  pruefe('Was sie tun, steht im Überfahrtext',
    kopfAktionen.every(b3 => (b3.getAttribute('title') || '').length > 3),
    kopfAktionen.map(b3 => b3.getAttribute('title')).join(' | '));

  /* ================= Der Name an der Linkzeile ================= */
  gruppe('Der Name an der Linkzeile');

  /* DIE REGEL HAT ZWEI HAELFTEN, und beide brauchen ihre eigene Gegenlage
     (Stolperstein 72): gezeigt wird der Name nur bei MEHREREN Zugaengen UND
     nur an einer Zeile, die NICHT vom Verfasser des Eintrags stammt.
     Ein Rueckbau, der nur eine der beiden Bedingungen entfernt, faerbt sonst
     dieselben Punkte wie einer, der beide entfernt.
     Der Eintrag gehoert bert; chefin, der boese Name, der Grabstein und die
     herrenlose Zeile sind ihm fremd. */
  const lvZeilen = (fenster) => [...fenster.document.querySelectorAll('#links .lrow')];
  const lvName = (z) => z?.querySelector('.lvon')?.textContent || '';

  const lvMehr = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3 } });
  await new Promise(r => setTimeout(r, 80));
  const lvM = lvZeilen(lvMehr.w);
  // Erst das Vorhandensein, dann die Eigenschaft: ohne Zeilen waere jede
  // Aussage ueber sie wahr (Stolperstein 81).
  pruefe('Die Linkliste steht auch bei mehreren Zugaengen vollstaendig da',
    lvM.length === 8, `${lvM.length}`);
  pruefe('An einer Zeile des Eintragsverfassers steht kein Name',
    lvM.slice(0, 4).every(z => !z.querySelector('.lvon')),
    lvM.slice(0, 4).map(z => lvName(z)).join(' | ') || '(kein Name -- richtig)');
  pruefe('An einer fremden Zeile steht er',
    lvName(lvM[5]) === '(chefin)', lvName(lvM[5]) || '(kein Name)');
  /* Eine herrenlose Zeile ist eine Auskunft, kein Nichts -- sie sagt es
     ausdruecklich. */
  pruefe('Eine herrenlose Zeile nennt ausdruecklich keinen Verfasser',
    lvName(lvM[6]) === '(Ohne Verfasser)', lvName(lvM[6]) || '(kein Name)');
  // Der Grabstein hat keinen Namen mehr; aus der Nummer wird die Beschriftung.
  pruefe('Ein Grabstein erscheint mit seiner Nummer',
    lvName(lvM[7]) === '(Gelöschter Benutzer 4)', lvName(lvM[7]) || '(kein Name)');

  /* EIN Zeichen fuer beide Zeilenarten, und es ist die Klammer. Ein Trennzeichen
     davor waere an beiden falsch: in der Suchzeile bedeutet " · " bereits "noch
     ein Anbieter, anklickbar", und ein Strich sieht aus wie ein abgerissener
     Satz. Geprueft wird an BEIDEN Zeilenarten -- eine Regel, die nur an einer
     gilt, ist keine. */
  pruefe('Der Name steht in Klammern, an der Adresszeile',
    /^\(.+\)$/.test(lvName(lvM[5])), lvName(lvM[5]));
  pruefe('Und an der Suchzeile genauso',
    /^\(.+\)$/.test(lvName(lvM[7])), lvName(lvM[7]));
  // Und kein Trennzeichen davor -- weder Mittelpunkt noch Strich.
  pruefe('Ohne Trennzeichen davor',
    lvM.every(z => !/^[·—-]/.test(lvName(z))),
    lvM.map(z => lvName(z)).filter(Boolean).join(' | '));
  /* Der Name steht NEBEN dem Pfad, nicht darunter -- sonst waechst die Zeile
     auf dem Handy auf drei Hoehen. */
  pruefe('Name und Pfad stehen in derselben zweiten Zeile',
    !!lvM[5].querySelector('.lunten > .path') && !!lvM[5].querySelector('.lunten > .lvon'),
    lvM[5].querySelector('.lurl')?.innerHTML);
  pruefe('Und bei der Suchzeile Anbieternamen und Name ebenso',
    !!lvM[7].querySelector('.lunten > .snamen') && !!lvM[7].querySelector('.lunten > .lvon'),
    lvM[7].querySelector('.lurl')?.innerHTML);

  /* Das Datum steht im Ueberfahrtext, nicht in der Zeile -- die Zeile ist auf
     dem Handy am Anschlag. Der Name bleibt sichtbar, nur das Datum nicht. */
  pruefe('Der Ueberfahrtext nennt Eintrager und Datum',
    /Eingetragen von chefin am \d\d\.\d\d\.\d{4}/.test(lvM[5].title), lvM[5].title);
  /* Und der bisherige Ueberfahrtext bleibt davor stehen -- er sagt, was ein
     Klick tut, und das ist die wichtigere Auskunft. Bewusst OHNE das
     Trennzeichen geprueft: sonst faerbt ein Rueckbau, der nur das Datum
     entfernt, diese Zeile mit, und zwei Gegenproben, die dieselben Namen rot
     machen, pruefen dieselbe Sache (Stolperstein 72). */
  pruefe('Und was die Zeile sonst tut, steht weiterhin davor',
    lvM[5].title.startsWith('https://beispiel.de/5'), lvM[5].title);
  pruefe('An einer eigenen Zeile steht davon nichts',
    !/Eingetragen von/.test(lvM[0].title), lvM[0].title);

  /* Ein Benutzername ist Eingabe, keine Konstante. Geprueft am gerenderten
     HTML, nicht an textContent -- eine fehlende Maskierung faellt textContent
     gar nicht auf. */
  pruefe('Aus einem Verfassernamen mit spitzen Klammern wird kein HTML',
    !lvMehr.w.document.getElementById('boese-link') &&
    lvName(lvM[4]).includes('<b id="boese-link">X</b>'),
    lvM[4]?.querySelector('.lvon')?.innerHTML);
  /* Und die Klammern kommen aus der Vorlage, nicht aus dem Namen: bei einem
     Namen mit spitzen Klammern muessen sie trotzdem aussen stehen. */
  pruefe('Die Klammern stehen auch dort aussen',
    /^\(.*\)$/.test(lvName(lvM[4])), lvName(lvM[4]));

  /* DAS LOESCHKREUZ FOLGT DEM RECHT, NICHT DER ANZEIGE. Hier ist die Fragende
     Admin: sie darf jede Zeile loeschen, auch die, an der ihr Name gar nicht
     steht. */
  pruefe('Der Admin sieht an jeder Zeile ein Loeschkreuz',
    lvM.every(z => !!z.querySelector('.xdel')),
    `${lvM.filter(z => !!z.querySelector('.xdel')).length} von ${lvM.length}`);
  lvMehr.w.close();

  /* Die erste Gegenlage: EIN Zugang. "Von mir" ist keine Auskunft, und die
     Schwelle steht in mehrereBenutzer() und nirgends sonst. Dieselben acht
     Zeilen, dieselben Verfasser -- nur die Zahl ist eine andere. */
  const lvEins = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 1 } });
  await new Promise(r => setTimeout(r, 80));
  const lvE = lvZeilen(lvEins.w);
  pruefe('Auch bei einem einzigen Zugang stehen alle Zeilen da',
    lvE.length === 8, `${lvE.length}`);
  pruefe('Aber an keiner steht ein Name',
    lvE.every(z => !z.querySelector('.lvon')),
    lvE.map(z => lvName(z)).filter(Boolean).join(' | ') || '(kein Name -- richtig)');
  pruefe('Und im Ueberfahrtext steht auch kein Eintrager',
    lvE.every(z => !/Eingetragen von/.test(z.title)),
    lvE.map(z => z.title).filter(t => /Eingetragen/.test(t)).join(' | ') || '(nichts -- richtig)');
  // Ein Kreuz ohne Namen: die beiden Regeln sind wirklich getrennt.
  pruefe('Das Loeschkreuz steht davon unberuehrt weiterhin da',
    lvE.every(z => !!z.querySelector('.xdel')),
    `${lvE.filter(z => !!z.querySelector('.xdel')).length} von ${lvE.length}`);
  lvEins.w.close();

  /* Die zweite Gegenlage: mehrere Zugaenge, aber ohne Adminrolle. Jetzt
     trennen sich Anzeige und Recht sichtbar -- an der Grabsteinzeile steht ein
     Name und kein Kreuz. */
  const lvUser = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: false } });
  await new Promise(r => setTimeout(r, 80));
  const lvU = lvZeilen(lvUser.w);
  pruefe('Ohne Adminrolle steht das Kreuz nur an der eigenen Zeile',
    lvU.filter(z => !!z.querySelector('.xdel')).length === 1 && !!lvU[5].querySelector('.xdel'),
    lvU.map((z, i) => (z.querySelector('.xdel') ? i : null)).filter(i => i !== null).join(', '));
  pruefe('Ein Name ohne Kreuz ist moeglich -- Anzeige und Recht sind getrennt',
    !!lvU[7].querySelector('.lvon') && !lvU[7].querySelector('.xdel'),
    `${lvName(lvU[7])} / ${!!lvU[7].querySelector('.xdel')}`);
  // Und die Zeile bleibt im Uebrigen vollstaendig -- ein fehlendes Kreuz darf
  // nicht den Aufbau der Liste mitreissen.
  pruefe('Die Zeilen ohne Kreuz sind sonst unversehrt',
    lvU.length === 8 && lvU.every(z => !!z.querySelector('.lurl') && !!z.querySelector('.go')),
    `${lvU.length}`);
  lvUser.w.close();

  /* Und die Regel steht wirklich im Stylesheet: ohne die Aufteilung der
     zweiten Zeile frisst ein langer Pfad den Namen weg. Erst das Vorhandensein
     der Regel, dann ihre Eigenschaft (Stolperstein 81). */
  const cssL = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  const regelL = (wahl) => (cssL.match(new RegExp(wahl.replace(/[.>]/g, m => '\\' + m) + ' \\{[^}]*\\}')) || [''])[0];
  pruefe('Die zweite Zeile der Linkzeile ist im Stylesheet ueberhaupt geregelt',
    regelL('.lunten').length > 0, '(keine Regel .lunten)');
  pruefe('Sie stellt Pfad und Namen nebeneinander',
    /display: flex/.test(regelL('.lunten')), regelL('.lunten') || '(keine Regel)');
  /* `0 1 auto` und nicht `1 1 auto`: der Pfad nimmt sich nur, was er braucht.
     Waechst er auf die volle Breite, schiebt er den Namen ans rechte Ende der
     Zeile, wo er zu nichts mehr gehoert -- genau das war der Befund aus dem
     Betrieb. Schrumpfen darf er weiterhin. */
  pruefe('Der Pfad nimmt sich nur, was er braucht, und darf schrumpfen',
    /flex: 0 1 auto/.test(regelL('.lunten .path, .lunten .snamen')),
    regelL('.lunten .path, .lunten .snamen') || '(keine Regel)');
  pruefe('Der Name nicht',
    /flex: 0 0 auto/.test(regelL('.lunten .lvon')),
    regelL('.lunten .lvon') || '(keine Regel)');

  /* ================= Der Name an der Dateizeile ================= */
  gruppe('Der Name an der Dateizeile');

  /* DIESELBE REGEL WIE AN DER LINKZEILE, und sie bekommt hier ihre eigenen
     Gegenlagen -- eine Regel, die an einer Stelle geprueft ist und an der
     zweiten nur behauptet, ist an der zweiten ungeprueft.
     Der Eintrag gehoert bert; chefin und die herrenlose Zeile sind ihm fremd. */
  const avZeilen = (fenster) => [...fenster.document.querySelectorAll('#atts .arow')];
  const avName = (z) => z?.querySelector('.avon')?.textContent || '';

  const avMehr = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3 } });
  await new Promise(r => setTimeout(r, 80));
  const avM = avZeilen(avMehr.w);
  pruefe('Die Dateiliste steht bei mehreren Zugaengen vollstaendig da',
    avM.length === 4, `${avM.length}`);
  pruefe('An einer Datei des Eintragsverfassers steht kein Name',
    avM.slice(0, 2).every(z => !z.querySelector('.avon')),
    avM.slice(0, 2).map(z => avName(z)).join(' | ') || '(kein Name -- richtig)');
  pruefe('An einer fremden Datei steht er, in Klammern',
    avName(avM[2]) === '(chefin)', avName(avM[2]) || '(kein Name)');
  pruefe('Eine herrenlose Datei nennt ausdruecklich keinen Verfasser',
    avName(avM[3]) === '(Ohne Verfasser)', avName(avM[3]) || '(kein Name)');
  /* Der Name steht bei den Angaben ZUR Datei, also hinter der Groesse -- nicht
     hinter dem Dateinamen. Der Name der Datei ist die Hauptsache der Zeile und
     darf nicht schrumpfen, um Platz fuer eine Nebenangabe zu machen. */
  pruefe('Er steht hinter der Groesse, nicht hinter dem Dateinamen',
    !!avM[2].querySelector('.asize + .avon'),
    avM[2].innerHTML.slice(0, 200));
  pruefe('Der Ueberfahrtext nennt den Hochladenden und das Datum',
    /Hochgeladen von chefin am \d\d\.\d\d\.\d{4}/.test(avM[2].title), avM[2].title);
  pruefe('Und was ein Klick tut, steht weiterhin davor',
    /^Klicken zum/.test(avM[2].title), avM[2].title);
  pruefe('An einer eigenen Datei steht davon nichts',
    !/Hochgeladen von/.test(avM[0].title), avM[0].title);
  pruefe('Der Admin sieht an jeder Datei ein Loeschkreuz',
    avM.every(z => !!z.querySelector('.xdel')),
    `${avM.filter(z => !!z.querySelector('.xdel')).length} von ${avM.length}`);
  avMehr.w.close();

  // Erste Gegenlage: ein Zugang -- kein Name, aber das Kreuz bleibt.
  const avEins = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 1 } });
  await new Promise(r => setTimeout(r, 80));
  const avE = avZeilen(avEins.w);
  pruefe('Auch bei einem einzigen Zugang stehen alle Dateien da',
    avE.length === 4, `${avE.length}`);
  pruefe('Aber an keiner steht ein Name',
    avE.every(z => !z.querySelector('.avon')),
    avE.map(z => avName(z)).filter(Boolean).join(' | ') || '(kein Name -- richtig)');
  pruefe('Und im Ueberfahrtext steht auch kein Hochladender',
    avE.every(z => !/Hochgeladen von/.test(z.title)),
    avE.map(z => z.title).filter(t => /Hochgeladen/.test(t)).join(' | ') || '(nichts -- richtig)');
  avEins.w.close();

  // Zweite Gegenlage: mehrere Zugaenge ohne Adminrolle -- Anzeige und Recht
  // trennen sich sichtbar.
  const avUser = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: false } });
  await new Promise(r => setTimeout(r, 80));
  const avU = avZeilen(avUser.w);
  pruefe('Ohne Adminrolle steht das Kreuz nur an der eigenen Datei',
    avU.filter(z => !!z.querySelector('.xdel')).length === 1 && !!avU[2].querySelector('.xdel'),
    avU.map((z, i) => (z.querySelector('.xdel') ? i : null)).filter(i => i !== null).join(', '));
  pruefe('Ein Name ohne Kreuz ist auch hier moeglich',
    !!avU[3].querySelector('.avon') && !avU[3].querySelector('.xdel'),
    `${avName(avU[3])} / ${!!avU[3].querySelector('.xdel')}`);
  // Ein fehlendes Kreuz darf den Rest der Zeile nicht mitreissen.
  pruefe('Die Zeilen ohne Kreuz sind sonst unversehrt',
    avU.length === 4 && avU.every(z => !!z.querySelector('.aname') && !!z.querySelector('.adl')),
    `${avU.length}`);
  avUser.w.close();

  // Und die Regel im Stylesheet: der Name wird nie abgeschnitten.
  pruefe('Der Name an der Dateizeile ist im Stylesheet ueberhaupt geregelt',
    regelL('.arow .avon').length > 0, '(keine Regel .arow .avon)');
  pruefe('Und er darf nicht schrumpfen',
    /flex-shrink: 0/.test(regelL('.arow .avon')), regelL('.arow .avon') || '(keine Regel)');

  /* ================= Ziehen auf dem Finger ================= */
  gruppe('Ziehen: Maus sofort, Finger erst nach Halten');

  const cssTxt = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  const sperren = (cssTxt.match(/[^\n]*touch-action: *none[^\n]*/g) || [])
    .filter(z => !z.trim().startsWith('/*') && !z.trim().startsWith('*'));
  pruefe('Keine Zeile sperrt das Scrollen über einer sortierbaren Liste',
    sperren.every(z => /focus-mode/.test(z)),
    JSON.stringify(sperren));

  const zeigerAuf = (el, art, x, y, typ = 'mouse') => {
    const e = new wb.Event(art, { bubbles: true, cancelable: true });
    Object.defineProperty(e, 'clientX', { value: x });
    Object.defineProperty(e, 'clientY', { value: y });
    Object.defineProperty(e, 'pointerType', { value: typ });
    (el || wb.document).dispatchEvent(e);
    return e;
  };
  const seite = () => [...wb.document.querySelectorAll('#blocks-seite > .block')].map(b => b.dataset.block);
  const ausgang = seite();

  // Mit der Maus: sofort, ohne zu warten.
  const ersterBlock = wb.document.querySelector('#blocks-seite > .block');
  wb.document.elementFromPoint = () => [...wb.document.querySelectorAll('#blocks-seite > .block')][2];
  zeigerAuf(ersterBlock.querySelector('.bgrip'), 'pointerdown', 0, 0, 'mouse');
  zeigerAuf(null, 'pointermove', 0, 200, 'mouse');
  zeigerAuf(null, 'pointerup', 0, 200, 'mouse');
  await new Promise(r => setTimeout(r, 20));
  pruefe('Mit der Maus wird sofort gezogen', !gleich(seite(), ausgang), JSON.stringify(seite()));

  // Auf dem Finger: sofortiges Wischen ist Scrollen, kein Sortieren.
  const jetzt = seite();
  const b2 = wb.document.querySelector('#blocks-seite > .block');
  zeigerAuf(b2.querySelector('.bgrip'), 'pointerdown', 0, 0, 'touch');
  zeigerAuf(null, 'pointermove', 0, 200, 'touch');
  zeigerAuf(null, 'pointerup', 0, 200, 'touch');
  await new Promise(r => setTimeout(r, 20));
  pruefe('Sofortiges Wischen sortiert nichts — das ist Scrollen',
    gleich(seite(), jetzt), JSON.stringify(seite()));
  pruefe('Und hinterlässt keinen Ziehzustand',
    !wb.document.querySelector('.dragging, .griffbereit'));

  // Der eigentliche Schaden ohne Abbruch: ein langsamer Wisch greift nach
  // Ablauf der Haltezeit doch zu, und beim Loslassen zaehlt er als Klick --
  // auf einer Linkzeile oeffnet das den Link.
  const langsam = wb.document.querySelector('#blocks-seite > .block');
  zeigerAuf(langsam.querySelector('.bgrip'), 'pointerdown', 0, 0, 'touch');
  zeigerAuf(null, 'pointermove', 0, 120, 'touch');     // gewischt = gescrollt
  await new Promise(r => setTimeout(r, 480));           // und die Zeit laeuft ab
  pruefe('Ein langsamer Wisch greift auch nach der Haltezeit nicht zu',
    !wb.document.querySelector('.griffbereit'));
  zeigerAuf(null, 'pointerup', 0, 120, 'touch');
  await new Promise(r => setTimeout(r, 20));
  pruefe('Und sortiert nichts um', gleich(seite(), jetzt), JSON.stringify(seite()));

  // Dasselbe an einer Linkzeile: der Wisch darf den Link nicht oeffnen.
  let geoeffnet = 0;
  wb.open = () => { geoeffnet++; };
  const linkZeile = wb.document.querySelector('#links .lrow');
  zeigerAuf(linkZeile, 'pointerdown', 0, 0, 'touch');
  zeigerAuf(null, 'pointermove', 0, 140, 'touch');
  await new Promise(r => setTimeout(r, 480));
  zeigerAuf(null, 'pointerup', 0, 140, 'touch');
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Wisch über einer Linkzeile öffnet den Link nicht', geoeffnet === 0, `${geoeffnet}`);
  // Ein echter Tipp dagegen schon.
  zeigerAuf(linkZeile, 'pointerdown', 0, 0, 'touch');
  zeigerAuf(null, 'pointerup', 0, 0, 'touch');
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Tipp öffnet ihn sehr wohl', geoeffnet === 1, `${geoeffnet}`);

  // Auf dem Finger: erst halten, dann ziehen.
  const b3 = wb.document.querySelector('#blocks-seite > .block');
  zeigerAuf(b3.querySelector('.bgrip'), 'pointerdown', 0, 0, 'touch');
  zeigerAuf(null, 'pointermove', 0, 3, 'touch');   // winzige Bewegung ist erlaubt
  pruefe('Vor Ablauf der Haltezeit ist noch nichts gegriffen',
    !wb.document.querySelector('.griffbereit'));
  await new Promise(r => setTimeout(r, 480));
  pruefe('Nach der Haltezeit meldet die Zeile, dass sie am Finger hängt',
    !!wb.document.querySelector('.griffbereit'));
  zeigerAuf(null, 'pointermove', 0, 200, 'touch');
  zeigerAuf(null, 'pointerup', 0, 200, 'touch');
  await new Promise(r => setTimeout(r, 20));
  pruefe('Nach dem Halten wird gezogen', !gleich(seite(), jetzt), JSON.stringify(seite()));
  pruefe('Danach bleibt kein Ziehzustand übrig',
    !wb.document.querySelector('.dragging, .griffbereit'));

  // Ein abgebrochener Zeiger (der Browser übernimmt das Scrollen) räumt auf.
  const b4 = wb.document.querySelector('#blocks-seite > .block');
  zeigerAuf(b4.querySelector('.bgrip'), 'pointerdown', 0, 0, 'touch');
  await new Promise(r => setTimeout(r, 480));
  zeigerAuf(null, 'pointercancel', 0, 0, 'touch');
  pruefe('Ein abgebrochener Zeiger räumt auf',
    !wb.document.querySelector('.griffbereit'));

  /* ================= Kommentare in der Oberflaeche ================= */
  gruppe('Kommentare in der Oberflaeche');

  const kmts = [...wb.document.querySelectorAll('#cmts .cmt')];
  pruefe('Alle Kommentare werden gezeigt', kmts.length === 6, `${kmts.length}`);
  pruefe('Die Serverreihenfolge wird übernommen',
    gleich(kmts.map(k => k.querySelector('.cmt-body')?.textContent).slice(0, 3),
           ['Angepinnte Notiz', 'Ein Bericht', 'Gewöhnliche Notiz']));

  // Maskierung des Kommentartextes, mit eigener Pruefung: die
  // Reihenfolgepruefung liest mit textContent aus, und stuende in
  // keinem der Pruefkommentare eine spitze Klammer, bliebe ein Rueckbau des
  // esc() vollstaendig gruen.
  const rohtext = beispiel.comments[3].text;
  const kBody = kmts[3]?.querySelector('.cmt-body');
  pruefe('Der Kommentartext steht Zeichen für Zeichen so da, wie er gespeichert ist',
    kBody?.textContent === rohtext, kBody?.textContent);
  pruefe('Aus <b> im Kommentartext wird kein Element',
    !!kBody && !kBody.querySelector('b'), kBody?.innerHTML);
  pruefe('Und überhaupt kein fremdes Markup',
    !!kBody && !kBody.querySelector('b, i, img, script, iframe, style'), kBody?.innerHTML);
  pruefe('Bericht ist optisch als solcher erkennbar',
    !kmts[0].classList.contains('bericht') && kmts[1].classList.contains('bericht') &&
    !kmts[2].classList.contains('bericht'));
  pruefe('Angepinntes ist optisch erkennbar',
    kmts[0].classList.contains('pinned') && !kmts[1].classList.contains('pinned'));
  pruefe('Beides ist unterscheidbar, nicht dasselbe',
    kmts[0].className !== kmts[1].className);

  // Die drei Prüfungen darüber sehen nur die Klassennamen. Ob die im
  // Stylesheet überhaupt etwas bewirken, bemerken sie nicht: ein
  // ersatzloses Löschen beider Regeln bliebe dort vollständig grün,
  // obwohl alle vier Zustände danach gleich aussähen -- vorhanden, benannt
  // und unsichtbar.
  const cssM = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  const regelM = (wahl) => (cssM.match(new RegExp(wahl.replace(/\./g, '\\.') + ' \\{[^}]*\\}')) || [''])[0];
  pruefe('Die Art wird an der linken Kante markiert, in Orange',
    /border-left: 3px solid var\(--accent\)/.test(regelM('.cmt.bericht')),
    regelM('.cmt.bericht') || '(keine Regel)');
  pruefe('Die Anpinnung bewirkt im Stylesheet überhaupt etwas',
    /[a-z-]+:/.test(regelM('.cmt.pinned')), regelM('.cmt.pinned') || '(keine Regel)');

  // Im Einzelnen: die beiden Kanäle dürfen sich nicht überschneiden,
  // sonst sind nicht mehr alle vier Zustände unterscheidbar.
  pruefe('Es gibt ein gedämpftes Gold als eigene Farbe',
    /--gold-line: rgba\(255,\s*197,\s*49,\s*\.\d+\)/.test(cssM),
    (cssM.match(/--gold-line:[^;]*/) || ['(nicht gesetzt)'])[0]);
  pruefe('Die Anpinnung färbt oben, rechts und unten',
    ['border-top-color', 'border-right-color', 'border-bottom-color']
      .every(k => new RegExp(k + ': var\\(--gold-line\\)').test(regelM('.cmt.pinned'))),
    regelM('.cmt.pinned') || '(keine Regel)');
  pruefe('Die linke Kante bleibt der Art vorbehalten',
    !/border-left|border-color:/.test(regelM('.cmt.pinned')),
    regelM('.cmt.pinned') || '(keine Regel)');
  pruefe('Und der Bericht behält seine Kante auch angepinnt',
    /border-left: 3px solid var\(--accent\)/.test(regelM('.cmt.bericht')) &&
    !/border-left/.test(regelM('.cmt.pinned')));
  pruefe('Ein Merkmal, ein Zeichen — kein zweiter Untergrund für die Anpinnung',
    !/background/.test(regelM('.cmt.pinned')),
    regelM('.cmt.pinned') || '(keine Regel)');
  pruefe('Der Rahmen ist schon da, es ändert sich nur die Farbe',
    /border: 1px solid var\(--line\)/.test(regelM('.cmt')) &&
    !/border-(top|right|bottom)-width|border-width/.test(regelM('.cmt.pinned')),
    regelM('.cmt'));
  pruefe('Rot bleibt aus der Kennzeichnung heraus',
    !/--red|#f0555c/.test(regelM('.cmt.pinned') + regelM('.cmt.bericht')));

  /* --- Dritte Art: Aufgabe --- */
  pruefe('Eine Aufgabe bekommt ihre eigene Klasse',
    kmts[4].classList.contains('aufgabe') && !kmts[4].classList.contains('bericht'),
    kmts[4].className);
  pruefe('Und keine andere Art trägt sie',
    kmts.filter(k => k.classList.contains('aufgabe')).length === 1);
  pruefe('Die Aufgabe wird an derselben Kante markiert, in Blau',
    /border-left: 3px solid var\(--blue\)/.test(regelM('.cmt.aufgabe')),
    regelM('.cmt.aufgabe') || '(keine Regel)');
  pruefe('Blau ist als eigene Farbe hinterlegt',
    /--blue: #[0-9a-f]{6}/i.test(cssM), (cssM.match(/--blue:[^;]*/) || ['(nicht gesetzt)'])[0]);
  pruefe('Kein zweiter Kanal: die Aufgabe färbt keine Fläche',
    !/background/.test(regelM('.cmt.aufgabe')), regelM('.cmt.aufgabe'));
  pruefe('Ein erledigtes Todo bekommt seine eigene Klasse',
    kmts[5].classList.contains('erledigt') && !kmts[5].classList.contains('aufgabe'),
    kmts[5].className);
  pruefe('Erledigt wird an derselben Kante markiert, in Grün',
    /border-left: 3px solid var\(--green\)/.test(regelM('.cmt.erledigt')),
    regelM('.cmt.erledigt') || '(keine Regel)');
  pruefe('Grün ist als Farbe hinterlegt',
    /--green: #[0-9a-f]{6}/i.test(cssM), (cssM.match(/--green:[^;]*/) || ['(nicht gesetzt)'])[0]);
  // Keine Farbe zweimal erklaeren. Eine zweite Deklaration im selben :root
  // ist still: die spaetere gewinnt, und je nach Reihenfolge faerbt man damit
  // unbemerkt die halbe Oberflaeche um -- --green gibt es laengst fuer die
  // Getestet-Marke und den besten Wert im Vergleich.
  const wurzel = (cssM.match(/:root \{[^}]*\}/) || [''])[0];
  const namen = (wurzel.match(/--[a-z0-9-]+(?=:)/g) || []);
  const doppelt = namen.filter((n, i) => namen.indexOf(n) !== i);
  pruefe('Keine Farbe wird zweimal erklärt',
    doppelt.length === 0 && namen.length > 20,
    doppelt.length ? `doppelt: ${[...new Set(doppelt)].join(', ')}` : `${namen.length} Variablen`);
  pruefe('Auch erledigt färbt keine Fläche',
    !/background/.test(regelM('.cmt.erledigt')), regelM('.cmt.erledigt'));
  pruefe('Die vier Arten haben vier verschiedene Kanten',
    new Set(['.cmt.bericht', '.cmt.aufgabe', '.cmt.erledigt']
      .map(w => (regelM(w).match(/var\(--[a-z]+\)/) || [''])[0])).size === 3,
    ['.cmt.bericht', '.cmt.aufgabe', '.cmt.erledigt'].map(regelM).join(' '));

  const knoepfe = (n) => ({
    art: kmts[n].querySelector('.mark.art'), aufg: kmts[n].querySelector('.mark.aufg')
  });
  pruefe('Jeder Kommentar hat beide Artknöpfe',
    kmts.every((_, n) => knoepfe(n).art && knoepfe(n).aufg));
  pruefe('Die Knöpfe tragen die Wörter aus dem Vokabular',
    knoepfe(0).art.textContent === 'Bericht' && knoepfe(0).aufg.textContent === 'Aufgabe',
    `${knoepfe(0).art.textContent} / ${knoepfe(0).aufg.textContent}`);
  pruefe('Beim Bericht leuchtet nur der Berichtsknopf',
    knoepfe(1).art.classList.contains('on') && !knoepfe(1).aufg.classList.contains('on'));
  pruefe('Bei der Aufgabe nur der Aufgabenknopf',
    knoepfe(4).aufg.classList.contains('on') && !knoepfe(4).art.classList.contains('on'));
  pruefe('Beim erledigten Todo trägt der Knopf das Wort für erledigt',
    knoepfe(5).aufg.textContent === 'Erledigt' &&
    knoepfe(5).aufg.classList.contains('fertig'),
    `${knoepfe(5).aufg.textContent} | ${knoepfe(5).aufg.className}`);
  /* Der Knopf traegt die Farbe der Kante, die er setzt. Bis 0.8.2 fiel der
     eingeschaltete, noch offene Aufgabenknopf auf .mark.on zurueck und wurde
     orange -- neben einer blauen Kante. Beide Zustaende stehen hier
     nebeneinander: eine Pruefung nur auf Blau liesse offen, ob dabei das
     Gruen des erledigten Todos mit umgefaerbt wurde. */
  pruefe('Der eingeschaltete Aufgabenknopf trägt Blau wie seine Kante',
    /color: var\(--blue\)/.test(regelM('.mark.aufg.on')) &&
    /border-color: var\(--blue\)/.test(regelM('.mark.aufg.on')),
    regelM('.mark.aufg.on') || '(keine Regel)');
  // Die Regel muss DA SEIN und darf nicht orange sein. Ohne den ersten Teil
  // waere die Pruefung bei fehlender Regel gruen -- sie kann dann gar nicht
  // scheitern, und die Gegenprobe belegte nichts.
  pruefe('Und ausdrücklich nicht mehr Orange',
    !!regelM('.mark.aufg.on') && !/var\(--accent\)/.test(regelM('.mark.aufg.on')),
    regelM('.mark.aufg.on') || '(keine Regel)');
  pruefe('Das erledigte Todo behält daneben sein Grün',
    /color: var\(--green\)/.test(regelM('.mark.aufg.on.fertig')),
    regelM('.mark.aufg.on.fertig') || '(keine Regel)');
  // Orange bleibt die Farbe der uebrigen Marken -- die Klarstellung nimmt
  // "Orange ist Art und Bedienung" nicht zurueck, sie beschneidet sie.
  pruefe('Die übrigen Marken bleiben orange',
    /color: var\(--accent\)/.test(regelM('.mark.on')),
    regelM('.mark.on') || '(keine Regel)');
  pruefe('Und der Berichtsknopf bleibt dabei aus',
    !knoepfe(5).art.classList.contains('on'));
  pruefe('Bei der Notiz keiner von beiden',
    !knoepfe(2).art.classList.contains('on') && !knoepfe(2).aufg.classList.contains('on'));

  // Die Art ist ein Wert, keine zwei Merkmale: der Aufgabenknopf an einem
  // Bericht macht daraus eine Aufgabe -- nicht beides zugleich.
  const letzteArt = () => bd.gesendet.filter(x => x.koerper && x.koerper.kind !== undefined).pop();
  bd.gesendet.length = 0;
  knoepfe(1).aufg.onclick();
  await new Promise(r => setTimeout(r, 30));
  pruefe('Der Aufgabenknopf am Bericht schaltet auf Aufgabe, nicht auf beides',
    letzteArt()?.koerper.kind === 'task' && letzteArt().koerper.text === undefined,
    JSON.stringify(letzteArt()?.koerper));
  bd.gesendet.length = 0;
  knoepfe(4).aufg.onclick();
  await new Promise(r => setTimeout(r, 30));
  pruefe('Ein zweiter Druck setzt die Aufgabe auf erledigt',
    letzteArt()?.koerper.kind === 'done', JSON.stringify(letzteArt()?.koerper));
  bd.gesendet.length = 0;

  // Die ganze Abfolge, nicht nur ein Schritt: Notiz -> Aufgabe -> erledigt ->
  // Notiz. Bei drei Zustaenden zeigt ein einzelner Schritt noch keine Ordnung.
  // Fehlt die Funktion, muss das ein roter Punkt werden und darf den Lauf nicht
  // abbrechen -- ein Absturz sagt nicht, welche Pruefung betroffen ist.
  const weiter = (k) => { try { return wb.aufgabeWeiter(k); } catch { return '(fehlt)'; } };
  pruefe('Die Weiterschaltung läuft im Kreis',
    gleich(['note', 'task', 'done'].map(weiter), ['task', 'done', 'note']),
    JSON.stringify(['note', 'task', 'done'].map(weiter)));
  pruefe('Aus einem Bericht wird beim Druck eine Aufgabe, nicht erledigt',
    weiter('report') === 'task', weiter('report'));
  pruefe('Unbekanntes landet auf der Aufgabe, nicht im Leeren',
    weiter('quatsch') === 'task' && weiter(undefined) === 'task');

  pruefe('Markierungen stehen links in der Kopfzeile',
    kmts.every(k => k.querySelector('.cmt-head .marks')));
  /* UMGEDREHT STATT GELOESCHT (Stolperstein 74). Bis 0.8.2 standen ✎ und ✕
     an jedem Kommentar, gleich wem er gehoerte. Seit 0.8.3 bearbeitet nur der
     Verfasser -- auch der Admin nicht. Dieser Aufbau ist ein Admin (ADMIN
     bleibt bei der Vorgabe true) und Zugang 1: er darf ueberall loeschen,
     aber nur seine eigenen drei Kommentare bearbeiten. Beide Haelften stehen
     in EINER Pruefung, weil sonst die eine gruen bliebe, waehrend die andere
     alles wegnimmt. */
  pruefe('Bearbeiten steht nur am eigenen Kommentar, Löschen an jedem',
    kmts.filter(k => k.querySelector('.cmt-head .acts .ed')).length === 3 &&
    kmts.every(k => k.querySelector('.cmt-head .acts .rm')),
    `${kmts.filter(k => k.querySelector('.cmt-head .acts .ed')).length} mal ✎, ` +
    `${kmts.filter(k => k.querySelector('.cmt-head .acts .rm')).length} mal ✕`);
  pruefe('Die Umschalter zeigen den Zustand',
    kmts[0].querySelector('.pin').classList.contains('on') &&
    !kmts[0].querySelector('.art').classList.contains('on') &&
    kmts[1].querySelector('.art').classList.contains('on'));
  pruefe('Der Artschalter trägt das Vokabelwort',
    kmts[1].querySelector('.art').textContent === 'Bericht',
    kmts[1].querySelector('.art').textContent);

  kmts[2].querySelector('.art').onclick();
  await new Promise(r => setTimeout(r, 30));
  const alsBericht = bd.gesendet.filter(x => x.koerper && x.koerper.kind !== undefined).pop();
  pruefe('Klick auf die Art schickt nur die Art',
    alsBericht?.koerper.kind === 'report' && alsBericht.koerper.text === undefined,
    JSON.stringify(alsBericht?.koerper));
  kmts[1].querySelector('.pin').onclick();
  await new Promise(r => setTimeout(r, 30));
  const angepinnt = bd.gesendet.filter(x => x.koerper && x.koerper.pinned !== undefined).pop();
  pruefe('Klick auf die Anpinnung schickt nur die Anpinnung',
    angepinnt?.koerper.pinned === true && angepinnt.koerper.text === undefined,
    JSON.stringify(angepinnt?.koerper));

  const bilderK = [...wb.document.querySelectorAll('#cmts .cmt-img')];
  pruefe('Kommentarbilder erscheinen als Kacheln', bilderK.length === 2, `${bilderK.length}`);
  pruefe('Die Kacheln holen die kleine Variante',
    bilderK.every(k => /comment-images\/\d+\/raw\?size=thumb/.test(k.querySelector('img')?.getAttribute('src') || '')),
    bilderK.map(k => k.querySelector('img')?.getAttribute('src')).join(' '));
  pruefe('Jede Kachel lässt sich entfernen', bilderK.every(k => k.querySelector('.del')));

  // Vollbild: Kommentarbilder haben kein Original, also keinen Zoom.
  bilderK[0].querySelector('img').onclick();
  await new Promise(r => setTimeout(r, 20));
  const lb = wb.document.querySelector('.lightbox');
  pruefe('Klick öffnet das Vollbild', !!lb);
  pruefe('Das Vollbild zeigt das Kommentarbild',
    /comment-images\/71\/raw/.test(lb?.querySelector('.lb-stage img')?.getAttribute('src') || ''),
    lb?.querySelector('.lb-stage img')?.getAttribute('src'));
  pruefe('Ohne Original kein Zoomknopf', lb?.querySelector('.zoom')?.hidden === true);
  lb?.querySelector('.close')?.onclick();

  /* --- Der Eingriffsvermerk am Kommentar --------------------------------
     Eine EIGENE Angabe in der Kopfzeile, nie im Textfeld -- ein Admin, der in
     eine fremde Aussage hineinschriebe, taete genau das, was ihm verwehrt
     ist. Zwei Kommentare tragen ihn mit VERSCHIEDENEN Zahlen: gleiche liessen
     nicht sehen, ob die Angabe ihre eigene Zeile trifft, und die Mehrzahl
     bliebe ungeprueft. */
  const vermerke = [...wb.document.querySelectorAll('#cmts .cmt-head .cmt-eingriff')]
    .map(z => z.textContent);
  /* DER VERMERK NENNT DIE ROLLE. "vom Admin" steht in keiner Spalte: es folgt
     aus den beiden Klemmen an der Loeschroute (siehe den Waechter ueber den
     Quelltext). Kein Name, kein Zeitpunkt, keine Kette -- eine Rolle ist keine
     Person. Zwei Kommentare mit VERSCHIEDENEN Zahlen, damit Ein- und Mehrzahl
     nebeneinander stehen. */
  pruefe('Der Eingriffsvermerk steht als eigene Angabe in der Kopfzeile',
    gleich(vermerke, ['1 Bild vom Admin entfernt', '2 Bilder vom Admin entfernt']),
    JSON.stringify(vermerke));
  pruefe('Und er nennt die Rolle, nicht die Person',
    vermerke.every(z => /vom Admin/.test(z)) &&
    !vermerke.some(z => /chefin|bert|carla|Benutzer/.test(z)), JSON.stringify(vermerke));
  pruefe('Und ausdrücklich nicht im Textfeld',
    ![...wb.document.querySelectorAll('#cmts .cmt-body')].some(b => /entfernt/.test(b.textContent)),
    'ein Kommentartext nennt den Vermerk');
  pruefe('Wo nichts entfernt wurde, steht auch nichts',
    !kmts[0].querySelector('.cmt-eingriff') && !kmts[4].querySelector('.cmt-eingriff') &&
    !kmts[5].querySelector('.cmt-eingriff'));
  pruefe('Es gibt keinen Knopf, der ihn zurücksetzt',
    ![...wb.document.querySelectorAll('#cmts .cmt-eingriff')].some(z => z.querySelector('button')));

  /* --- Die Zahlen in der Kopfzeile des Kommentarblocks ------------------
     Links und Dateien tragen ihren Hinweis, Kommentare bisher nicht. Der Satz
     nennt TEILMENGEN, keine Summanden: "davon", und die Klammer nistet die
     zweite Ebene ein -- das Erledigte steckt IN den Aufgaben. Addiert ergaeben
     die Zahlen mehr Kommentare, als es gibt; genau das soll der Wortlaut
     verhindern.
     Der Prueflage nach: sechs Kommentare, darunter ein Bericht, eine Aufgabe
     und ein erledigtes Todo. Die Notiz bleibt ungenannt, die Anpinnung steht
     nicht in der Zeile. */
  /* AN EINEM FRISCHEN AUFBAU. Die Pruefungen darueber haben in DIESEM Fenster
     zwei Arten umgeschaltet, und der Mock schreibt das seit 0.8.60
     wirklich mit -- eine Antwort, die sich durch einen Schreibvorgang aendern
     soll, muss sich wirklich aendern (Stolperstein 90). Die Zahlen der
     Prueflage liessen sich an diesem Fenster danach nicht mehr ablesen. */
  const kzDom = baueDom(JSDOM, { einstellungen: eigeneOrdnung, hash: '#/item/1' });
  await new Promise(r => setTimeout(r, 90));
  const kZaehl = kzDom.w.document.getElementById('ccount');
  pruefe('Der Kommentarblock traegt seine Zahlen in der Kopfzeile',
    !!kZaehl && kZaehl.textContent === '6 Kommentare, davon 1 Bericht und 2 Aufgaben (1 Erledigt)',
    kZaehl ? kZaehl.textContent : '(kein Hinweis)');
  pruefe('Und zwar dort, wo Links und Dateien ihren auch tragen',
    !!kZaehl && !!kZaehl.closest('.block-head') &&
    kZaehl.closest('.block')?.dataset.block === 'kommentare',
    kZaehl ? kZaehl.parentElement?.className : '(kein Hinweis)');
  kzDom.w.close();

  // Gebildet an EINEM Ort. Die Randfaelle unmittelbar an der Funktion, nicht
  // ueber sechs aufgebaute Kommentarlagen.
  const kz = (...arten) => wb.kommentarZahlen(arten.map(k => ({ kind: k })));
  pruefe('Bei null Kommentaren bleibt der Hinweis ganz leer, wie bei den Links',
    kz() === '' && wb.kommentarZahlen(null) === '' && wb.kommentarZahlen(undefined) === '',
    JSON.stringify([kz(), wb.kommentarZahlen(null)]));
  pruefe('Ein einzelner Kommentar steht in der Einzahl',
    kz('note') === '1 Kommentar', kz('note'));
  pruefe('Nur Notizen: das „davon" faellt ganz weg',
    kz('note', 'note', 'note') === '3 Kommentare', kz('note', 'note', 'note'));
  pruefe('Eine Gruppe mit null verschwindet ganz',
    kz('note', 'report') === '2 Kommentare, davon 1 Bericht', kz('note', 'report'));
  pruefe('Ohne Erledigte faellt die Klammer weg',
    kz('note', 'task', 'task') === '3 Kommentare, davon 2 Aufgaben', kz('note', 'task', 'task'));
  pruefe('Das Erledigte steckt IN den Aufgaben, nicht daneben',
    kz('task', 'task', 'done') === '3 Kommentare, davon 3 Aufgaben (1 Erledigt)',
    kz('task', 'task', 'done'));
  pruefe('Ein erledigtes Todo allein ist immer noch eine Aufgabe',
    kz('done') === '1 Kommentar, davon 1 Aufgabe (1 Erledigt)', kz('done'));
  pruefe('Zwei Gruppen werden mit „und" verbunden, nicht mit einem Mittelpunkt',
    kz('report', 'report', 'task', 'done', 'note')
      === '5 Kommentare, davon 2 Berichte und 2 Aufgaben (1 Erledigt)',
    kz('report', 'report', 'task', 'done', 'note'));
  pruefe('Bei einem einzigen greift ueberall die Einzahl',
    kz('report', 'task') === '2 Kommentare, davon 1 Bericht und 1 Aufgabe',
    kz('report', 'task'));
  pruefe('Die NOTIZ bleibt ungenannt — sie ist der Zustand ohne Markierung',
    !/Notiz/i.test(kz('note', 'note', 'report')), kz('note', 'note', 'report'));
  pruefe('Und die ANPINNUNG steht nicht in der Zeile: zweite, unabhaengige Achse',
    wb.kommentarZahlen([{ kind: 'note', pinned: true }, { kind: 'note', pinned: false }])
      === '2 Kommentare',
    wb.kommentarZahlen([{ kind: 'note', pinned: true }, { kind: 'note', pinned: false }]));
  /* Die Summe der Teilmengen darf die Gesamtzahl nicht ueberschreiten -- das
     ist der Sinn von "davon". Waeren es Summanden, ergaebe die Prueflage
     1 + 2 + 1 = 4 von 3. */
  pruefe('Die Teilmengen bleiben Teilmengen',
    (() => { const t = kz('report', 'task', 'done').match(/\d+/g).map(Number);
             return t[0] === 3 && t[1] === 1 && t[2] === 2 && t[3] === 1; })(),
    kz('report', 'task', 'done'));

  /* --- Fuenf Faelle, drei Antworten ------------------------------------
     Der Bildschirm bietet nicht mehr an, was der Server abweist. Die drei
     Antworten sind die Spalten der Rechtetabelle -- Verfasser, anderer,
     Admin --, und die fuenf Faelle sind ✎, "+ Bild", ✕ am Kommentar, ✕ am
     Bild und die drei Marken.
     Der Aufbau oben ist ein ADMIN. Daneben gehoert ein Rufer, fuer den die
     Adminfrage FALSCH ist: sonst bliebe verdeckt, an welcher Bedingung die
     Knoepfe haengen, weil der erste Teil des ODER ohnehin wahr ist
     (Stolperstein 73). */
  const bnA = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: false } });
  await new Promise(r => setTimeout(r, 80));
  const nKmts = [...bnA.w.document.querySelectorAll('#cmts .cmt')];
  const nZahl = (wahl) => nKmts.filter(k => k.querySelector(wahl)).length;
  pruefe('Der Gegenaufbau zeigt dieselben sechs Kommentare',
    nKmts.length === 6, `${nKmts.length}`);
  pruefe('Ohne Adminrolle steht ✎ nur am eigenen Kommentar',
    nZahl('.acts .ed') === 3, `${nZahl('.acts .ed')} mal ✎`);
  pruefe('Und ✕ am Kommentar ebenso — anders als beim Admin',
    nZahl('.acts .rm') === 3 && kmts.filter(k => k.querySelector('.acts .rm')).length === 6,
    `${nZahl('.acts .rm')} ohne Admin, ${kmts.filter(k => k.querySelector('.acts .rm')).length} mit`);
  pruefe('Und die drei Marken ebenso',
    nZahl('.marks') === 3 && nZahl('.mark.pin') === 3 && nZahl('.mark.art') === 3 &&
    nZahl('.mark.aufg') === 3, `${nZahl('.marks')} Markenleisten`);
  // Der Bericht von bert traegt zwei Bilder und gehoert einem anderen.
  pruefe('Am fremden Kommentar bleibt kein einziges Bedienelement',
    !nKmts[1].querySelector('.ed') && !nKmts[1].querySelector('.rm') &&
    !nKmts[1].querySelector('.marks') && !nKmts[1].querySelector('.cmt-img .del'),
    nKmts[1].querySelector('.cmt-head')?.innerHTML);
  pruefe('Ansehen darf trotzdem jeder: die Bilder stehen weiter da',
    nKmts[1].querySelectorAll('.cmt-img img').length === 2,
    `${nKmts[1].querySelectorAll('.cmt-img img').length} Kacheln`);
  pruefe('Und der Admin darf dort sehr wohl löschen',
    !!kmts[1].querySelector('.cmt-img .del'), 'dem Admin fehlt das ✕ am fremden Bild');

  /* "+ Bild" ist Bearbeiten und steht ausschliesslich im Bearbeitenmodus.
     Ein Ereignis wird wirklich zugestellt, nicht der Behandler gerufen
     (Stolperstein 61). */
  nKmts[4].querySelector('.ed').dispatchEvent(new bnA.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 30));
  pruefe('Am eigenen Kommentar führt ✎ zum Feld und zu „+ Bild"',
    !!nKmts[4].querySelector('.cmt-edit .addimg') && !!nKmts[4].querySelector('.cmt-edit textarea'),
    nKmts[4].querySelector('.cmt-edit') ? 'kein + Bild' : 'kein Bearbeitenfeld');
  pruefe('Zum fremden Kommentar führt kein Weg dorthin',
    !nKmts[1].querySelector('.ed') && !nKmts[1].querySelector('.addimg'));
  bnA.w.close();

  /* ================= Links im Kommentartext ================= */
  gruppe('Links im Kommentartext');

  const kLinks = [...(kBody?.querySelectorAll('a') || [])];
  pruefe('Aus den beiden Adressen im Text werden Links', kLinks.length === 2, `${kLinks.length}`);
  pruefe('Und sonst entsteht kein einziges Element',
    kBody?.children.length === 2, `${kBody?.children.length}`);
  pruefe('Die Adresse steht vollständig da, nicht auf die Domain gekürzt',
    gleich(kLinks.map(a => a.textContent),
           ['https://beispiel.de/pfad?a=1&b=2', 'www.beispiel.de']),
    JSON.stringify(kLinks.map(a => a.textContent)));
  pruefe('Das & der Abfragezeichenfolge übersteht die Zerlegung',
    kLinks[0]?.getAttribute('href') === 'https://beispiel.de/pfad?a=1&b=2',
    kLinks[0]?.getAttribute('href'));
  pruefe('www. ohne Schema bekommt https:// ins Ziel, nicht in den Text',
    kLinks[1]?.getAttribute('href') === 'https://www.beispiel.de' &&
    kLinks[1]?.textContent === 'www.beispiel.de',
    `${kLinks[1]?.getAttribute('href')} / ${kLinks[1]?.textContent}`);
  pruefe('Nachlaufendes Komma und nachlaufender Punkt bleiben draußen',
    kLinks.every(a => !/[.,]$/.test(a.getAttribute('href') || '')),
    kLinks.map(a => a.getAttribute('href')).join(' '));
  pruefe('Jeder Link öffnet in einem neuen Tab',
    kLinks.length > 0 && kLinks.every(a => a.getAttribute('target') === '_blank'));
  pruefe('Und gibt das aufrufende Fenster nicht preis',
    kLinks.length > 0 && kLinks.every(a => a.getAttribute('rel') === 'noopener noreferrer'),
    kLinks.map(a => a.getAttribute('rel')).join(' '));
  pruefe('Ein blankes beispiel.de wird kein Link',
    kLinks.every(a => !/^https?:\/\/beispiel\.de$/.test(a.getAttribute('href') || '')),
    kLinks.map(a => a.getAttribute('href')).join(' '));
  pruefe('Und javascript: erst recht nicht',
    kLinks.every(a => !/javascript:/i.test(a.getAttribute('href') || '')),
    kLinks.map(a => a.getAttribute('href')).join(' '));

  // Schranke 1 einzeln: die Erkennung wird unmittelbar gefragt. Ueber den
  // DOM allein waere sie nicht zu pruefen -- dort faengt Schranke 2 alles
  // ab, was hier durchrutschte.
  const ziele = (roh) => wb.zerlegeKommentartext(roh).filter(s => s.ziel);
  const einZiel = (roh) => ziele(roh)[0]?.ziel ?? null;
  const einText = (roh) => ziele(roh)[0]?.text ?? null;

  pruefe('Erkennung: javascript: ist keine Adresse',
    ziele('Vorsicht javascript:alert(1) hier').length === 0,
    JSON.stringify(ziele('Vorsicht javascript:alert(1) hier')));
  pruefe('Erkennung: data: ebenso wenig',
    ziele('data:text/html;base64,AAAA').length === 0);
  pruefe('Erkennung: mailto: bleibt Text',
    ziele('post@beispiel.de und mailto:post@beispiel.de').length === 0);
  pruefe('Erkennung: „z.B." und „usw." erzeugen keine Fehltreffer',
    ziele('Das gilt z.B. für Schrauben usw. und sonst nichts').length === 0,
    JSON.stringify(ziele('Das gilt z.B. für Schrauben usw. und sonst nichts')));
  pruefe('Erkennung: ein nacktes https:// ohne Rest bleibt Text',
    ziele('kaputt: https:// und weiter').length === 0);
  pruefe('Erkennung: Großschreibung zählt auch',
    einZiel('Siehe HTTPS://BEISPIEL.DE/X') === 'HTTPS://BEISPIEL.DE/X',
    einZiel('Siehe HTTPS://BEISPIEL.DE/X'));
  pruefe('Ende: Punkt am Satzende gehört nicht zur Adresse',
    einZiel('Siehe https://beispiel.de/pfad.') === 'https://beispiel.de/pfad',
    einZiel('Siehe https://beispiel.de/pfad.'));
  pruefe('Ende: Anführungszeichen ebenso wenig',
    einZiel('„https://beispiel.de/x"') === 'https://beispiel.de/x',
    einZiel('„https://beispiel.de/x"'));
  pruefe('Ende: eine unpaarige runde Klammer wird abgeschnitten',
    einZiel('(siehe https://beispiel.de/x)') === 'https://beispiel.de/x',
    einZiel('(siehe https://beispiel.de/x)'));
  pruefe('Ende: eine paarige runde Klammer bleibt in der Adresse',
    einZiel('(siehe https://de.wikipedia.org/wiki/Merkur_(Planet))')
      === 'https://de.wikipedia.org/wiki/Merkur_(Planet)',
    einZiel('(siehe https://de.wikipedia.org/wiki/Merkur_(Planet))'));
  pruefe('Ende: eckige Klammern werden genauso behandelt',
    einZiel('[https://beispiel.de/x]') === 'https://beispiel.de/x',
    einZiel('[https://beispiel.de/x]'));
  pruefe('Ende: eine geschweifte Klammer bleibt dagegen drin',
    einZiel('https://beispiel.de/x}') === 'https://beispiel.de/x}',
    einZiel('https://beispiel.de/x}'));
  pruefe('www. ohne Schema wird erkannt und bekommt eins',
    einZiel('siehe www.beispiel.de/x') === 'https://www.beispiel.de/x' &&
    einText('siehe www.beispiel.de/x') === 'www.beispiel.de/x',
    `${einZiel('siehe www.beispiel.de/x')} / ${einText('siehe www.beispiel.de/x')}`);
  pruefe('Die Zerlegung verliert und erfindet kein Zeichen',
    ['Vor https://a.de/x, mitte www.b.de. Ende',
     'nur Text ohne alles',
     '(https://a.de/y_(z)) und [https://a.de/w]'].every(roh =>
       wb.zerlegeKommentartext(roh).map(s => s.text).join('') === roh),
    JSON.stringify(wb.zerlegeKommentartext('Vor https://a.de/x, mitte www.b.de. Ende')));
  pruefe('Zwei Adressen in einer Zeile werden beide erkannt',
    ziele('https://a.de und www.b.de').length === 2);

  // Schranke 2 einzeln: dem Knotenbauer wird unmittelbar ein Ziel vorgelegt,
  // das durch die Erkennung nie kaeme.
  const bau = (stuecke) => wb.baueKommentarknoten(stuecke);
  const boese = bau([{ text: 'hier klicken', ziel: 'javascript:alert(1)' }]);
  pruefe('Ein unerlaubtes Ziel wird gar nicht erst zum Link',
    !boese.querySelector('a'), boese.querySelector('a')?.getAttribute('href'));
  pruefe('Stattdessen steht der Text schlicht da',
    boese.textContent === 'hier klicken', boese.textContent);
  const boese2 = bau([{ text: 'x', ziel: 'data:text/html,<script>alert(1)</script>' }]);
  pruefe('Dasselbe gilt für data:', !boese2.querySelector('a'));
  const gut = bau([{ text: 'x', ziel: 'https://beispiel.de/x' }]);
  pruefe('Ein erlaubtes Ziel dagegen schon',
    gut.querySelector('a')?.getAttribute('href') === 'https://beispiel.de/x');
  pruefe('Auch der Knotenbauer erzeugt aus Markup niemals Markup',
    bau([{ text: '<img src=x onerror=alert(1)>' }]).querySelector('img') === null);

  // Aussehen laesst sich hier nur am Stylesheet pruefen (Abschnitt 7).
  const cssK = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  pruefe('Ein Link im Kommentartext ist ohne Überfahren erkennbar',
    /\.cmt-body a \{[^}]*color: var\(--accent\)[^}]*\}/.test(cssK) &&
    /\.cmt-body a \{[^}]*text-decoration: underline[^}]*\}/.test(cssK),
    (cssK.match(/\.cmt-body a \{[^}]*\}/) || ['(keine Regel)'])[0]);
  pruefe('Eine lange Adresse bricht um, statt über den Rand zu laufen',
    /\.cmt-body \{[^}]*word-break: break-word[^}]*\}/.test(cssK),
    (cssK.match(/\.cmt-body \{[^}]*\}/) || ['(keine Regel)'])[0]);

  /* --- Vollbild: Pfeile und Zoom --- */
  const mehrBilder = [{ id: 91, quelle: 'kommentar' }, { id: 92, quelle: 'kommentar' }];
  wb.openLightbox(mehrBilder, 0, 'Probe');
  await new Promise(r => setTimeout(r, 20));
  const lb2 = wb.document.querySelector('.lightbox');
  const pfeile = [...lb2.querySelectorAll('.lb-nav')];
  pruefe('Es gibt Pfeile für vor und zurück', pfeile.length === 2);
  // Der Kern: im gezoomten Zustand wird .lb-stage zum Scrollbereich. Liegen die
  // Pfeile darin, wandern sie beim Verschieben mit dem Bild aus dem Bild.
  pruefe('Die Pfeile hängen nicht in der Bühne',
    pfeile.every(p => !p.closest('.lb-stage')),
    pfeile.map(p => p.parentElement?.className).join(' | '));
  pruefe('Sie hängen direkt an der Lightbox, die nie scrollt',
    pfeile.every(p => p.parentElement === lb2));
  lb2.querySelector('.close').onclick();
  await new Promise(r => setTimeout(r, 20));

  // Zoom: Maus ein Klick, Finger zwei Tipper.
  const mitOriginal = [{ id: 5 }, { id: 6 }];
  wb.openLightbox(mitOriginal, 0, 'Zoomprobe');
  await new Promise(r => setTimeout(r, 20));
  const lb3 = wb.document.querySelector('.lightbox');
  const buehne = lb3.querySelector('.lb-stage');
  const bild = lb3.querySelector('.lb-stage img');
  const tipp = (typ) => {
    const e = new wb.Event('pointerup', { bubbles: true });
    Object.defineProperty(e, 'pointerType', { value: typ });
    bild.dispatchEvent(e);
  };
  tipp('mouse');
  pruefe('Mit der Maus zoomt ein Klick', buehne.classList.contains('zoomed'));
  tipp('mouse');
  pruefe('Und ein weiterer holt zurück', !buehne.classList.contains('zoomed'));

  tipp('touch');
  pruefe('Ein einzelner Tipp zoomt nicht', !buehne.classList.contains('zoomed'));
  await new Promise(r => setTimeout(r, 20));
  tipp('touch');
  pruefe('Der zweite Tipp kurz danach zoomt', buehne.classList.contains('zoomed'));
  tipp('touch');
  await new Promise(r => setTimeout(r, 20));
  tipp('touch');
  pruefe('Doppeltipp holt auch wieder zurück', !buehne.classList.contains('zoomed'));

  // Zwei Tipper mit zu viel Abstand sind zwei einzelne, kein Doppeltipp.
  tipp('touch');
  await new Promise(r => setTimeout(r, 360));
  tipp('touch');
  pruefe('Zwei langsame Tipper zoomen nicht', !buehne.classList.contains('zoomed'));

  // Nach dem Zoom stand der Bildlauf auf 0/0 -- sichtbar war die linke obere
  // Ecke des Originals statt der Mitte. jsdom rechnet kein Layout, deshalb
  // bekommt die Rechnung ihre Zahlen unmittelbar vorgelegt.
  const buehneGross = { scrollWidth: 3000, clientWidth: 1000,
                        scrollHeight: 2400, clientHeight: 800, scrollLeft: 0, scrollTop: 0 };
  wb.zentriereBuehne(buehneGross);
  pruefe('Ein Bild, das größer ist als die Bühne, startet in der Mitte',
    buehneGross.scrollLeft === 1000 && buehneGross.scrollTop === 800,
    `${buehneGross.scrollLeft}/${buehneGross.scrollTop}`);
  const buehneKlein = { scrollWidth: 400, clientWidth: 1000,
                        scrollHeight: 300, clientHeight: 800, scrollLeft: 0, scrollTop: 0 };
  wb.zentriereBuehne(buehneKlein);
  pruefe('Ein kleineres Bild bekommt keinen negativen Bildlauf',
    buehneKlein.scrollLeft === 0 && buehneKlein.scrollTop === 0,
    `${buehneKlein.scrollLeft}/${buehneKlein.scrollTop}`);
  pruefe('Ohne Bühne passiert nichts, statt zu stürzen',
    (() => { try { wb.zentriereBuehne(null); return true; } catch { return false; } })());

  // Die Rechnung muss auch angeschlossen sein -- eine Funktion, die niemand
  // ruft, ist so gut wie nicht vorhanden.
  const lb4 = (wb.openLightbox(mitOriginal, 0, 'Mitte'), wb.document.querySelector('.lightbox'));
  await new Promise(r => setTimeout(r, 20));
  const buehne4 = lb4.querySelector('.lb-stage'), bild4 = lb4.querySelector('.lb-stage img');
  ['scrollWidth', 'clientWidth', 'scrollHeight', 'clientHeight'].forEach((k, n) =>
    Object.defineProperty(buehne4, k, { value: [3000, 1000, 2400, 800][n], configurable: true }));
  const mausTipp = (ziel) => {
    const e = new wb.Event('pointerup', { bubbles: true });
    Object.defineProperty(e, 'pointerType', { value: 'mouse' });
    ziel.dispatchEvent(e);
  };
  mausTipp(bild4);
  bild4.dispatchEvent(new wb.Event('load'));
  pruefe('Nach dem Zoom rückt die Bühne wirklich in die Mitte',
    buehne4.scrollLeft === 1000 && buehne4.scrollTop === 800,
    `${buehne4.scrollLeft}/${buehne4.scrollTop}`);
  // Und im ungezoomten Zustand darf nichts verschoben werden.
  mausTipp(bild4);
  buehne4.scrollLeft = 0; buehne4.scrollTop = 0;
  bild4.dispatchEvent(new wb.Event('load'));
  pruefe('Ohne Zoom bleibt der Bildlauf unangetastet',
    buehne4.scrollLeft === 0 && buehne4.scrollTop === 0,
    `${buehne4.scrollLeft}/${buehne4.scrollTop}`);
  lb4.querySelector('.close').onclick();
  await new Promise(r => setTimeout(r, 20));

  /* ---------------------------------------------------------------- */
  gruppe('Videos am Bildschirm');

  /* WORAN DIE OBERFLAECHE EIN VIDEO ERKENNT: an art aus der Antwort, an nichts
     sonst. Kein Raten am ausgelieferten Typ, keine zweite Wahrheit.
     Der Mock traegt deshalb beides nebeneinander -- ein Bild an
     erster, ein Video an zweiter Stelle. Mit lauter Bildern fielen genau die
     Pruefungen weg, fuer die er hier steht (Stolperstein 90). */
  const vDom = baueDom(JSDOM, { hash: '#/item/1' });
  const wVid = vDom.w;
  await new Promise(r => setTimeout(r, 60));

  const vKacheln = [...wVid.document.querySelectorAll('#thumbs .thumb')];
  // Erst das Vorhandensein, dann die Eigenschaft -- und ausdruecklich BEIDE
  // Kacheln: eine Pruefung darauf, dass an einer Zeile etwas NICHT steht,
  // gehoert hinter eine darauf, dass es die Zeile ueberhaupt gibt
  // (Stolperstein 81).
  pruefe('Die Vorschauleiste zeigt beide Zeilen', vKacheln.length === 2,
    `${vKacheln.length} Kacheln`);
  pruefe('Am Video steht ein Abspielzeichen',
    !!vKacheln[1]?.querySelector('.spielmarke'), vKacheln[1]?.innerHTML?.slice(0, 120));
  pruefe('Und am Foto daneben steht keins',
    !!vKacheln[0] && !vKacheln[0].querySelector('.spielmarke'),
    vKacheln[0]?.innerHTML?.slice(0, 120));
  pruefe('Die Laenge steht als 0:42 an der Videokachel',
    vKacheln[1]?.querySelector('.dauer')?.textContent === '0:42',
    JSON.stringify(vKacheln[1]?.querySelector('.dauer')?.textContent));
  pruefe('Und am Foto steht keine Laenge',
    !!vKacheln[0] && !vKacheln[0].querySelector('.dauer'),
    vKacheln[0]?.innerHTML?.slice(0, 120));
  pruefe('Das Loeschkreuz am Video spricht vom Video, nicht vom Foto',
    vKacheln[1]?.querySelector('.del')?.getAttribute('title') === 'Video löschen' &&
    vKacheln[0]?.querySelector('.del')?.getAttribute('title') === 'Foto löschen',
    JSON.stringify([vKacheln[0]?.querySelector('.del')?.getAttribute('title'),
                    vKacheln[1]?.querySelector('.del')?.getAttribute('title')]));

  /* DER BETRACHTER. Beim Foto ein <img>, beim Video ein <video controls> --
     und ausdruecklich OHNE automatisches Abspielen. */
  const vBetrachter = wVid.document.getElementById('viewer');
  // Wieder abgefangen: ohne Betrachter waeren die Zeilen darunter ein Absturz
  // statt einer Auskunft (Stolperstein 103).
  pruefe('Der Betrachter steht ueberhaupt da', !!vBetrachter, 'kein #viewer');
  pruefe('Beim Foto steht ein Bild im Betrachter',
    !!vBetrachter?.querySelector('img') && !vBetrachter.querySelector('video'),
    vBetrachter?.innerHTML?.slice(0, 90));
  pruefe('Und dort steht kein eigener Vollbildknopf -- der Klick aufs Bild tut es',
    !vBetrachter.querySelector('.vfull'), vBetrachter?.innerHTML?.slice(0, 160));
  vBetrachter?.querySelector('.vnav.next')?.dispatchEvent(new wVid.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  const vAbspieler = vBetrachter.querySelector('video');
  pruefe('Beim Video steht ein Abspieler',
    !!vAbspieler && !vBetrachter.querySelector('img'), vBetrachter?.innerHTML?.slice(0, 120));
  pruefe('Er traegt eine Steuerung', vAbspieler?.hasAttribute('controls'));
  pruefe('Und spielt ausdruecklich nicht von selbst los',
    !vAbspieler?.hasAttribute('autoplay') && !vAbspieler?.hasAttribute('loop'),
    vAbspieler?.outerHTML?.slice(0, 120));
  pruefe('Die Videodatei kommt ohne Groessenangabe, das Standbild mit',
    vAbspieler?.getAttribute('src') === '/api/photos/6/raw' &&
    vAbspieler?.getAttribute('poster') === '/api/photos/6/raw?size=medium',
    `${vAbspieler?.getAttribute('src')} / ${vAbspieler?.getAttribute('poster')}`);
  /* EIN WEG INS VOLLBILD MUSS ES AM VIDEOPLATZ GEBEN. Beim Foto oeffnet der
     Klick aufs Bild; am Video gehoert der Klick der Abspielsteuerung, und ohne
     einen eigenen Knopf kaeme man von einem reinen Videobestand aus gar nicht
     hinein. Am Fotoplatz steht er ausdruecklich NICHT -- erst das
     Vorhandensein, dann die Abwesenheit (Stolperstein 81). */
  pruefe('Am Videoplatz gibt es einen Knopf ins Vollbild',
    !!vBetrachter.querySelector('.vfull'), vBetrachter?.innerHTML?.slice(0, 160));
  vBetrachter?.querySelector('.vfull')?.dispatchEvent(new wVid.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 30));
  {
    const lb = wVid.document.querySelector('.lightbox');
    pruefe('Und er oeffnet das Vollbild am richtigen Element',
      !!lb && lb.querySelector('.lb-video')?.hidden === false &&
      lb.querySelector('.lb-video')?.getAttribute('src') === '/api/photos/6/raw',
      lb ? lb.querySelector('.lb-video')?.getAttribute('src') : 'kein Vollbild');
    lb?.querySelector('.close').dispatchEvent(new wVid.Event('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
  }

  /* DER AUSSCHNITTMODUS BLEIBT AM VIDEOPLATZ BEDIENBAR -- eingestellt wird die
     Kachel, und die gibt es dort genauso. Solange er an ist, steht das
     Standbild da: der Rahmen rechnet mit den natuerlichen Massen eines Bildes,
     und ein Abspieler hat keine. */
  vBetrachter?.querySelector('.vfocus')?.dispatchEvent(new wVid.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Im Ausschnittmodus zeigt der Videoplatz sein Standbild',
    !!vBetrachter.querySelector('img') && !vBetrachter.querySelector('video'),
    vBetrachter?.innerHTML?.slice(0, 120));
  pruefe('Und der Rahmen zum Einstellen ist wirklich da',
    !!vBetrachter.querySelector('.focus-frame') && vBetrachter.classList.contains('focus-mode'),
    vBetrachter?.className);
  vBetrachter?.querySelector('.vfocus')?.dispatchEvent(new wVid.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Nach dem Verlassen steht der Abspieler wieder da',
    !!vBetrachter.querySelector('video'), vBetrachter?.innerHTML?.slice(0, 120));

  /* DAS VOLLBILD. Blaettern bleibt; beim Blaettern UND beim Verlassen wird
     angehalten -- sonst spielt der Ton weiter, waehrend man das naechste Bild
     ansieht. Das Papier sagt nur "beim Verlassen"; das Blaettern gehoert
     dazu. */
  const vGemischt = [{ id: 5, art: 'bild', dauer: null }, { id: 6, art: 'video', dauer: 42 }];
  wVid.openLightbox(vGemischt, 1, 'Vollbildprobe');
  await new Promise(r => setTimeout(r, 20));
  const vLb = wVid.document.querySelector('.lightbox');
  const vLbVideo = vLb?.querySelector('.lb-video'), vLbBild = vLb?.querySelector('.lb-stage img');
  pruefe('Das Vollbild hat ueberhaupt einen Abspieler', !!vLbVideo, 'kein .lb-video');
  pruefe('Am Video zeigt es ihn statt des Bildes',
    vLbVideo?.hidden === false && vLbBild?.hidden === true,
    JSON.stringify({ video: vLbVideo?.hidden, bild: vLbBild?.hidden }));
  pruefe('Und er traegt die Videodatei',
    vLbVideo?.getAttribute('src') === '/api/photos/6/raw', vLbVideo?.getAttribute('src'));
  /* KEIN ZOOM BEIM VIDEO: der zweite Klick gehoert der Abspielsteuerung. Ein
     Knopf, der nichts tut, wirkt kaputt -- deshalb ist er weg, nicht bloss
     wirkungslos. */
  pruefe('Der Zoomknopf ist am Video verborgen', vLb?.querySelector('.zoom')?.hidden === true,
    JSON.stringify(vLb?.querySelector('.zoom')?.hidden));
  /* UND DAS ATTRIBUT MUSS AUCH WIRKEN. .lb-btn traegt display: flex, und das
     schlaegt das display:none, das der Browser einem hidden-Attribut mitgibt.
     Ohne die eigene Regel stuende der Knopf sichtbar da und taete nichts --
     eine Klassenpruefung allein belegt nicht, dass die Klasse etwas bewirkt
     (Lücke 1 im Prüfstand). Im echten Chromium aufgefallen, nicht hier. */
  {
    const cssV = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')
      .replace(/\s+/g, ' ');
    pruefe('Und das hidden-Attribut wird am Knopf auch wirksam',
      /\.lb-btn\[hidden\] \{[^}]*display: none[^}]*\}/.test(cssV),
      (cssV.match(/\.lb-btn\[hidden\][^}]*\}/) || ['(keine Regel)'])[0]);
  }
  // Ein angehaltener Abspieler ohne Quelle: mehr laesst sich in jsdom nicht
  // messen, und mehr braucht es auch nicht -- genau daran haengt, ob der Ton
  // weiterlaeuft.
  vLb?.querySelector('.prev')?.dispatchEvent(new wVid.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Beim Blaettern wird angehalten und die Quelle abgeraeumt',
    vLbVideo?.hidden === true && !vLbVideo?.getAttribute('src'),
    JSON.stringify({ hidden: vLbVideo?.hidden, src: vLbVideo?.getAttribute('src') }));
  pruefe('Und am Foto steht der Zoomknopf wieder da',
    vLb?.querySelector('.zoom')?.hidden === false,
    JSON.stringify(vLb?.querySelector('.zoom')?.hidden));
  // Zurueck aufs Video, dann schliessen: auch dabei muss angehalten werden.
  vLb?.querySelector('.next')?.dispatchEvent(new wVid.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Zurueck am Video laeuft der Abspieler wieder',
    vLbVideo?.getAttribute('src') === '/api/photos/6/raw', vLbVideo?.getAttribute('src'));
  vLb?.querySelector('.close')?.dispatchEvent(new wVid.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Beim Verlassen wird ebenfalls angehalten',
    !vLbVideo?.getAttribute('src'), vLbVideo?.getAttribute('src'));
  pruefe('Und das Vollbild ist zu', !wVid.document.querySelector('.lightbox'));

  /* Die Marken in der Vorschauleiste des Vollbilds -- dieselbe Ableitung aus
     art, an einer zweiten Stelle. */
  wVid.openLightbox(vGemischt, 0, 'Leistenprobe');
  await new Promise(r => setTimeout(r, 20));
  const vStreifen = [...wVid.document.querySelectorAll('.lb-strip .lb-thumb')];
  pruefe('Die Leiste im Vollbild zeigt beide Zeilen', vStreifen.length === 2,
    `${vStreifen.length}`);
  pruefe('Und die Marke steht dort am Video, nicht am Foto',
    !!vStreifen[1]?.querySelector('.spielmarke') && !vStreifen[0]?.querySelector('.spielmarke'),
    vStreifen.map(t => t.innerHTML.slice(0, 40)).join(' | '));
  wVid.document.querySelector('.lightbox .close')?.dispatchEvent(new wVid.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));

  /* Und die Laengenangabe an ihren Raendern. Eigene Funktionsdeklaration in
     app.js, damit der Pruefstand ihr die Zahlen unmittelbar vorlegen kann --
     dieselbe Bauform wie bei zentriereBuehne(). */
  pruefe('Die Laengenangabe rechnet Minuten und Sekunden richtig',
    wVid.dauerText(42) === '0:42' && wVid.dauerText(130) === '2:10' && wVid.dauerText(60) === '1:00',
    JSON.stringify([wVid.dauerText(42), wVid.dauerText(130), wVid.dauerText(60)]));
  pruefe('Ohne bekannte Dauer steht nichts da',
    wVid.dauerText(null) === '' && wVid.dauerText(0) === '' && wVid.dauerText('x') === '',
    JSON.stringify([wVid.dauerText(null), wVid.dauerText(0), wVid.dauerText('x')]));

  /* DIE KARTE. Dort steht das Standbild wie ein Foto, mit einem
     Abspielzeichen darauf -- und der Zaehler nennt beide Zahlen, statt ein
     Video als Foto auszugeben. */
  const vKartenBestand = (mainArt, f, v) => [{
    id: 1, title: 'Kartenprobe', rejected: false, tested: false, favorite: false,
    category: null, tags: [], mainPhoto: { id: 5, art: mainArt, focus_x: 50, focus_y: 50 },
    photoCount: f, videoCount: v, linkCount: 0, avgRating: 3, testCount: 0,
    updated_at: '2026-08-01 10:00:00', searchText: 'kartenprobe'
  }];
  const vKarte = async (mainArt, f, v) => {
    const d = baueDom(JSDOM, { uebersichtItems: vKartenBestand(mainArt, f, v) });
    await new Promise(r => setTimeout(r, 60));
    const karte = d.w.document.querySelector('.card');
    return { karte, zaehler: karte?.querySelector('.photo-count')?.textContent,
             marke: !!karte?.querySelector('.card-spielmarke') };
  };
  const vkGemischt = await vKarte('video', 3, 1);
  pruefe('Die Karte steht ueberhaupt da', !!vkGemischt.karte, 'keine Karte');
  pruefe('Bei gemischtem Bestand nennt der Zaehler beide Zahlen',
    vkGemischt.zaehler === '3 Fotos · 1 Video', JSON.stringify(vkGemischt.zaehler));
  pruefe('Und auf dem Standbild eines Videos steht ein Abspielzeichen',
    vkGemischt.marke === true);
  const vkNurFotos = await vKarte('bild', 3, 0);
  pruefe('Bei reinem Fotobestand bleibt es beim einen Wort',
    vkNurFotos.zaehler === '3 Fotos', JSON.stringify(vkNurFotos.zaehler));
  pruefe('Und dort steht kein Abspielzeichen', vkNurFotos.marke === false);
  const vkNurVideos = await vKarte('video', 0, 2);
  pruefe('Bei reinem Videobestand ebenso',
    vkNurVideos.zaehler === '2 Videos', JSON.stringify(vkNurVideos.zaehler));
  const vkEines = await vKarte('video', 0, 1);
  pruefe('Bei einem einzigen Element steht gar kein Zaehler',
    vkEines.zaehler === undefined, JSON.stringify(vkEines.zaehler));
  pruefe('Das Abspielzeichen steht trotzdem da',
    vkEines.marke === true);

  const cssZ = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  const regelZ = (w) => (cssZ.match(new RegExp(w.replace(/\./g, '\\.') + ' \\{[^}]*\\}')) || [''])[0];
  pruefe('Ein kleineres Original hängt nicht in der linken oberen Ecke',
    /margin: auto/.test(regelZ('.lb-stage.zoomed img')),
    regelZ('.lb-stage.zoomed img') || '(keine Regel)');
  pruefe('Die Bühne bleibt trotzdem in jede Richtung erreichbar',
    /align-items: flex-start/.test(regelZ('.lb-stage.zoomed')) &&
    /justify-content: flex-start/.test(regelZ('.lb-stage.zoomed')),
    regelZ('.lb-stage.zoomed') || '(keine Regel)');
  lb3.querySelector('.close').onclick();
  await new Promise(r => setTimeout(r, 20));

  /* --- Versionsnummer auf jeder Ansicht --- */
  const vz = () => wb.document.getElementById('version')?.textContent || '';
  pruefe('Die Versionsnummer steht in der Detailansicht', /^Kriterion 0\./.test(vz()), vz());
  pruefe('Sie liegt außerhalb von #app und übersteht das Neuzeichnen',
    !wb.document.getElementById('app').contains(wb.document.getElementById('version')));
  wb.location.hash = '#/';
  await new Promise(r => setTimeout(r, 80));
  pruefe('Auch in der Übersicht', /^Kriterion 0\./.test(vz()), vz());
  await wb.renderSystem();
  pruefe('Auch im Systembereich', /^Kriterion 0\./.test(vz()), vz());
  wb.showLogin();
  pruefe('Auch auf der Anmeldeseite', /^Kriterion 0\./.test(vz()), vz());
  wb.location.hash = '#/item/1';
  await new Promise(r => setTimeout(r, 80));

  pruefe('Adressen: Foto und Kommentarbild werden unterschieden',
    wb.bildQuelle({ id: 9 }, 'medium') === '/api/photos/9/raw?size=medium' &&
    wb.bildQuelle({ id: 9, quelle: 'kommentar' }, 'medium') === '/api/comment-images/9/raw' &&
    wb.bildQuelle({ id: 9, quelle: 'kommentar' }, 'thumb') === '/api/comment-images/9/raw?size=thumb');

  /* --- Neuer Kommentar --- */
  pruefe('Das Formular hat alle drei Markierungen',
    !!wb.document.getElementById('cpin') && !!wb.document.getElementById('cart') &&
    !!wb.document.getElementById('caufg'));
  pruefe('Der Artschalter im Formular trägt das Vokabelwort',
    wb.document.getElementById('cart').textContent === 'Bericht');
  pruefe('Der Aufgabenschalter ebenso',
    wb.document.getElementById('caufg').textContent === 'Aufgabe',
    wb.document.getElementById('caufg').textContent);

  // Die Art ist ein Wert: die beiden Schalter im Formular duerfen nie
  // gleichzeitig leuchten, sonst waere unklar, was abgeschickt wird.
  const fArt = wb.document.getElementById('cart'), fAufg = wb.document.getElementById('caufg');
  fArt.onclick();
  pruefe('Bericht an, Aufgabe aus',
    fArt.classList.contains('on') && !fAufg.classList.contains('on'));
  fAufg.onclick();
  pruefe('Aufgabe an schaltet Bericht aus',
    fAufg.classList.contains('on') && !fArt.classList.contains('on'),
    `${fArt.className} | ${fAufg.className}`);
  fAufg.onclick();
  pruefe('Ein zweiter Druck zeigt „erledigt"',
    fAufg.classList.contains('on') && fAufg.classList.contains('fertig') &&
    fAufg.textContent === 'Erledigt',
    `${fAufg.className} | ${fAufg.textContent}`);
  fAufg.onclick();
  pruefe('Und der dritte lässt beide aus',
    !fArt.classList.contains('on') && !fAufg.classList.contains('on') &&
    !fAufg.classList.contains('fertig') && fAufg.textContent === 'Aufgabe',
    `${fAufg.className} | ${fAufg.textContent}`);

  pruefe('Es gibt einen Knopf für Bilder', !!wb.document.getElementById('cimg'));
  pruefe('Das Textfeld weist auf Strg+V hin',
    /Strg\+V/i.test(wb.document.getElementById('ctext').getAttribute('placeholder') || ''));

  // Strg+V: Bilder werden aufgenommen, eingefuegter Text bleibt unberuehrt.
  const einfuegen = (dateien) => {
    const e = new wb.Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(e, 'clipboardData', { value: { files: dateien } });
    wb.document.getElementById('ctext').dispatchEvent(e);
    return e;
  };
  const machDatei = (typ) => ({ type: typ, name: 'x', size: 10 });
  wb.URL.createObjectURL = () => 'blob:test';
  wb.URL.revokeObjectURL = () => {};
  const mitBildE = einfuegen([machDatei('image/png')]);
  await new Promise(r => setTimeout(r, 20));
  pruefe('Eingefügtes Bild wird aufgenommen',
    wb.document.querySelectorAll('#cneu-imgs .cmt-img').length === 1);
  pruefe('Dabei wird das Einfügen abgefangen', mitBildE.defaultPrevented);
  const nurTextE = einfuegen([]);
  pruefe('Eingefügter Text bleibt unangetastet', !nurTextE.defaultPrevented);
  pruefe('Und erzeugt keine Kachel',
    wb.document.querySelectorAll('#cneu-imgs .cmt-img').length === 1);
  // Zwei Filter greifen hier ineinander: einer beim Auslesen der
  // Zwischenablage, einer beim Aufnehmen. Der Unterschied wird erst am
  // abgefangenen Einfügen sichtbar -- sonst verdeckt einer den anderen und
  // die Gegenprobe bliebe stumm.
  const pdfE = einfuegen([machDatei('application/pdf')]);
  pruefe('Eingefügtes Nicht-Bild wird übergangen',
    wb.document.querySelectorAll('#cneu-imgs .cmt-img').length === 1);
  pruefe('Und fängt das Einfügen nicht ab', !pdfE.defaultPrevented);

  wb.document.querySelector('#cneu-imgs .cmt-img .del').onclick();
  pruefe('Aufgenommenes Bild lässt sich vor dem Absenden wieder entfernen',
    wb.document.querySelectorAll('#cneu-imgs .cmt-img').length === 0);

  pruefe('Bilder werden erst mit dem Absenden geschickt',
    !bd.gesendet.some(x => /\/comments$/.test(x.url) && x.methode === 'POST'));

  /* ================= Fokuspunkt in der Oberflaeche ================= */
  gruppe('Fokuspunkt in der Oberflaeche');

  pruefe('Fehlende Werte landen in der Mitte', wb.fokus({}) === '50% 50%');
  pruefe('Vorhandene Werte werden zu object-position',
    wb.fokus({ focus_x: 20, focus_y: 80 }) === '20% 80%');
  pruefe('Unsinnige Werte fallen auf die Mitte zurück',
    wb.fokus({ focus_x: 'links', focus_y: null }) === '50% 50%');

  const fokusDom = baueDom(JSDOM, {
    uebersichtItems: [{ id: 1, title: 'Mit Fokus', rejected: false, tested: false, favorite: false,
      category: null, tags: [], photoCount: 1, linkCount: 0, avgRating: null, testCount: null,
      testAvg: null, testLast: null, updated_at: '2026-08-01 10:00:00', searchText: 'x', testDays: [],
      mainPhoto: { id: 5, focus_x: 10, focus_y: 90 } }]
  });
  await new Promise(r => setTimeout(r, 80));
  const kartenBild = fokusDom.w.document.querySelector('.card-img img');
  pruefe('Karte setzt den Fokuspunkt', kartenBild.style.objectPosition === '10% 90%',
    kartenBild.style.objectPosition);
  fokusDom.w.close();

  const vf = wb.document.querySelector('.vfocus');
  pruefe('Betrachter hat einen Schalter für den Ausschnitt', !!vf);
  pruefe('Ausschnitt-Modus ist zunächst aus',
    !vf.classList.contains('on') && !wb.document.querySelector('.viewer').classList.contains('focus-mode'));
  vf.onclick();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Schalter aktiviert den Modus',
    wb.document.querySelector('.viewer').classList.contains('focus-mode'));
  pruefe('Ein Rahmen zeigt den künftigen Ausschnitt', !!wb.document.querySelector('.focus-frame'));

  /* --- Verlassen des Modus. Der Betrachter wird beim Neuzeichnen nicht
   * ersetzt, sondern nur sein Inhalt -- was an ihm selbst haengt, ueberlebt.
   * Rahmen und graue Schaltflaeche verschwinden dabei von allein und belegen
   * deshalb gar nichts; die letzte Pruefung ist die eigentliche. */
  const betrachter = wb.document.querySelector('.viewer');
  wb.document.querySelector('.vfocus').onclick();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Zweiter Klick verlaesst den Modus', !betrachter.classList.contains('focus-mode'));
  pruefe('Der Rahmen ist weg', !wb.document.querySelector('.focus-frame'));
  pruefe('Und die Zeigerbehandler sind abgeraeumt',
    !betrachter.onpointerdown && !betrachter.onpointermove && !betrachter.onpointerup,
    'sonst speichert der naechste Klick aufs Bild einen Ausschnitt, statt das Vollbild zu oeffnen');
  // Gegenprobe am lebenden Objekt: ein Zeigerdruck darf jetzt nichts mehr
  // ausloesen, und der Klick muss wieder im Vollbild landen.
  bd.gesendet.length = 0;
  betrachter.dispatchEvent(new wb.Event('pointerdown', { bubbles: true }));
  betrachter.dispatchEvent(new wb.Event('pointerup', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Klick speichert keinen Ausschnitt mehr',
    !bd.gesendet.some(g => /\/focus$/.test(g.url)), JSON.stringify(bd.gesendet.map(g => g.url)));
  wb.document.querySelector('.viewer img').onclick();
  await new Promise(r => setTimeout(r, 20));
  pruefe('Und oeffnet wieder das Vollbild', !!wb.document.querySelector('.lightbox'));
  wb.document.querySelectorAll('.lightbox, .backdrop').forEach(e => e.remove());

  /* ================= Tags am Testtag ================= */
  gruppe('Tags am Testtag in der Zeile');

  const trow = wb.document.querySelector('#tdays .trow');
  pruefe('Testtagszeile zeigt ihre Tags', !!trow.querySelector('.ttags .chip-xs'),
    trow ? trow.textContent : 'keine Zeile');
  pruefe('Tags stehen zwischen Datum und Sternen', (() => {
    const kinder = [...trow.children].map(k => k.className.split(' ')[0]);
    return kinder.indexOf('ttags') > kinder.indexOf('tdate') &&
           kinder.indexOf('ttags') < kinder.findIndex(c => c === 'stars' || c === 'star-row');
  })(), [...trow.children].map(k => k.className).join(' | '));
  pruefe('Ein Knopf legt neue Tags an', !!trow.querySelector('.ttag-add'));
  trow.querySelector('.ttag-add').onclick();
  pruefe('Der Knopf öffnet ein Eingabefeld', !!trow.querySelector('.ttag-in'));
  trow.querySelector('.ttag-add').onclick();
  pruefe('Zweiter Klick öffnet kein zweites Feld',
    trow.querySelectorAll('.ttag-in').length === 1);
  wb.close();

  /* ================= Die beiden Anlegen-Schalter ================= */
  gruppe('Anlegen-Schalter in der Oberflaeche');

  /* Der Bildschirm bietet nicht an, was der Server abweist. DREI AUFBAUTEN
     nebeneinander: einer ohne Adminrolle und mit ausgeschalteten Schaltern,
     einer mit Adminrolle bei derselben Stellung, einer ohne Adminrolle bei
     eingeschalteten Schaltern. darfTagAnlegen() beginnt mit einem meist
     wahren ODER -- ohne den ersten Aufbau bliebe verdeckt, an welcher
     Bedingung die Zeilen ueberhaupt haengen (Stolperstein 73), ohne den
     dritten bliebe offen, ob sie je erscheinen. */
  const anlegeVorrat = [
    { id: 1, name: 'Vorhanden', usage_count: 3, test_usage_count: 0 },
    { id: 2, name: 'Auch da', usage_count: 1, test_usage_count: 0, vergeben: true }
  ];
  const anlegeDom = (istAdmin, frei) => baueDom(JSDOM, { hash: '#/item/1', tags: anlegeVorrat,
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin,
                     tagsFreiAnlegen: frei, kategorienFreiAnlegen: frei } });

  const ausDom = anlegeDom(false, false);
  const wAus = ausDom.w;
  await new Promise(r => setTimeout(r, 80));

  pruefe('Ohne Recht verschwindet die Zeile zum Anlegen eines Tags',
    !wAus.document.getElementById('newtag') && !wAus.document.getElementById('newtag-b'),
    'die Eingabezeile steht noch da');
  pruefe('Und die Zeile fuer eine neue Kategorie ebenso',
    !wAus.document.getElementById('newcat') && !wAus.document.getElementById('newcat-b'),
    'die Kategoriezeile steht noch da');
  /* AUSWAHL AUS DEM VORHANDENEN BLEIBT. Das ist der ganze Sinn des Schalters:
     zuweisen darf immer jeder, nur das Anlegen faellt weg. */
  pruefe('Die Auswahlliste der Kategorien bleibt stehen',
    !!wAus.document.getElementById('cat'), 'die Auswahl ist mitverschwunden');
  pruefe('Und die Tagwolke bleibt vollstaendig bedienbar',
    wAus.document.querySelectorAll('#tagcloud .pill-tag').length === 2 &&
    [...wAus.document.querySelectorAll('#tagcloud .pill-tag')].every(p => !!p.onclick),
    `${wAus.document.querySelectorAll('#tagcloud .pill-tag').length} Marken`);
  pruefe('Auch die Marken am Eintrag lassen sich weiterhin abnehmen',
    !!wAus.document.querySelector('#chips .chip button'), 'kein ✕ an der Marke');
  pruefe('Die Vorschlagsliste bleibt -- die Testtagzeile braucht sie',
    !!wAus.document.getElementById('tagsug'), 'die datalist ist mitverschwunden');
  /* DER SONDERFALL AM TESTTAG: dort gibt es keine Wolke, die Eingabe ist der
     einzige Zuweisungsweg und bleibt deshalb stehen. Ein unbekannter Name
     faellt erst am Server durch. */
  const aTrow = wAus.document.querySelector('#tdays .trow');
  pruefe('Am Testtag bleibt der Knopf fuer Tags stehen',
    !!aTrow && !!aTrow.querySelector('.ttag-add'), 'kein + am Testtag');
  aTrow.querySelector('.ttag-add').dispatchEvent(new wAus.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Und er oeffnet weiterhin das Eingabefeld',
    !!aTrow.querySelector('.ttag-in'), 'das Feld bleibt zu');
  /* Ein Behandler an einem fehlenden Element risse die ganze Ansicht mit --
     deshalb haengen sie nur an dem, was wirklich dasteht. */
  pruefe('Die Ansicht steht trotzdem vollstaendig da',
    !!wAus.document.getElementById('cmts') && !!wAus.document.getElementById('chips') &&
    !!wAus.document.getElementById('links') && !!wAus.document.getElementById('ratings'),
    'der Aufbau ist an den fehlenden Zeilen zerbrochen');
  wAus.close();

  const admDom = anlegeDom(true, false);
  const wAdm = admDom.w;
  await new Promise(r => setTimeout(r, 80));
  pruefe('Der Admin behaelt beide Zeilen, auch bei ausgeschaltetem Schalter',
    !!wAdm.document.getElementById('newtag') && !!wAdm.document.getElementById('newcat'),
    'dem Admin fehlt eine der beiden Zeilen');
  wAdm.close();

  const anDom = anlegeDom(false, true);
  const wAn = anDom.w;
  await new Promise(r => setTimeout(r, 80));
  pruefe('Mit eingeschaltetem Schalter sieht auch der Benutzer beide Zeilen wieder',
    !!wAn.document.getElementById('newtag') && !!wAn.document.getElementById('newcat'),
    'die Zeilen bleiben weg');
  // Und der Weg funktioniert auch: ein wirklich zugestellter Druck schickt den
  // Namen. Ein Knopf, den es gibt und der nichts tut, waere nicht besser.
  anDom.gesendet.length = 0;
  wAn.document.getElementById('newtag').value = 'Ganz neu';
  wAn.document.getElementById('newtag-b').dispatchEvent(new wAn.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  const anGesendet = anDom.gesendet.filter(g => /\/api\/items\/1\/tags$/.test(g.url)).pop();
  pruefe('Der Knopf schickt den neuen Namen an den Eintrag',
    anGesendet && anGesendet.methode === 'POST' && anGesendet.koerper?.name === 'Ganz neu',
    JSON.stringify(anGesendet));
  wAn.close();

  /* ---- Die Haken im Systembereich ----
     Nur der Admin bekommt sie zu sehen: ein Haken, der zuverlaessig eine
     Absage erzeugt, saehe aus wie ein Fehler. */
  const sysDom = baueDom(JSDOM, { einstellungen: { filters: null, istAdmin: true,
    tagsFreiAnlegen: false, kategorienFreiAnlegen: true } });
  const wSys = sysDom.w;
  await new Promise(r => setTimeout(r, 60));
  await wSys.renderSystem();
  const hakenTag = wSys.document.getElementById('tagfrei');
  const hakenKat = wSys.document.getElementById('katfrei');
  pruefe('Der Systembereich traegt beide Haken',
    !!hakenTag && !!hakenKat,
    `${hakenTag ? '' : 'tagfrei fehlt '}${hakenKat ? '' : 'katfrei fehlt'}`);
  pruefe('Und jeder zeigt seine eigene Stellung',
    hakenTag.checked === false && hakenKat.checked === true,
    JSON.stringify([hakenTag.checked, hakenKat.checked]));
  pruefe('Sie stehen bei den Karten, die sie betreffen',
    hakenTag.closest('.sys-card')?.querySelector('h3')?.textContent === 'Tags' &&
    hakenKat.closest('.sys-card')?.querySelector('h3')?.textContent === 'Kategorien',
    `${hakenTag.closest('.sys-card')?.querySelector('h3')?.textContent} / ` +
    `${hakenKat.closest('.sys-card')?.querySelector('h3')?.textContent}`);
  /* Ein wirklich zugestelltes Ereignis, kein Behandleraufruf: der Behandler
     laeuft nach einem await weiter, und genau dort saessen die Fehler, die im
     bloss gebauten DOM unsichtbar bleiben (Stolperstein 61). */
  sysDom.gesendet.length = 0;
  hakenTag.checked = true;
  hakenTag.dispatchEvent(new wSys.Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  const hakenGesendet = sysDom.gesendet.filter(
    g => g.url === '/api/settings' && g.koerper && g.koerper.tagsFreiAnlegen !== undefined).pop();
  pruefe('Der Haken schickt genau seinen eigenen Schluessel, sonst nichts',
    hakenGesendet && hakenGesendet.methode === 'PUT' &&
    gleich(Object.keys(hakenGesendet.koerper), ['tagsFreiAnlegen']) &&
    hakenGesendet.koerper.tagsFreiAnlegen === true,
    JSON.stringify(hakenGesendet));
  pruefe('Und der andere Haken bleibt dabei unberuehrt',
    hakenKat.checked === true &&
    !sysDom.gesendet.some(g => g.koerper && g.koerper.kategorienFreiAnlegen !== undefined),
    JSON.stringify(sysDom.gesendet.map(g => g.koerper)));
  wSys.close();

  const sysUser = baueDom(JSDOM, { einstellungen: { filters: null,
    istAdmin: false, istEigentuemer: false } });
  const wSysU = sysUser.w;
  await new Promise(r => setTimeout(r, 60));
  await wSysU.renderSystem();
  pruefe('Ein Benutzer bekommt die Haken gar nicht erst zu sehen',
    !wSysU.document.getElementById('tagfrei') && !wSysU.document.getElementById('katfrei'),
    'ein Haken steht auch ohne Adminrolle da');
  // Die beiden KARTEN bleiben stehen, auch seit 0.8.5: wer nicht verwalten
  // darf, darf nachsehen, was es gibt. Weg sind nur die Bedienzeichen.
  pruefe('Die Karten selbst bleiben ihm',
    !!wSysU.document.getElementById('mtags') && !!wSysU.document.getElementById('mcats'),
    'die Karten sind verschwunden');
  wSysU.close();

  /* ================= Der Systembereich nach Rolle ================= */
  gruppe('Der Systembereich nach Rolle');

  /* DREI LAGEN NEBENEINANDER, und keine ist entbehrlich: die Eigentuemerin
     (alle Karten), ein Admin OHNE Eigentuemerrecht (alles ausser Export und
     Import) und ein gewoehnlicher Benutzer (drei Karten). Ohne die mittlere
     waere "Eigentuemer" von "Admin" gar nicht zu unterscheiden, und jede
     Pruefung darauf bliebe auch dann gruen, wenn ueberall nur die Adminfrage
     stuende (Stolperstein 73).
     Und zu jedem "ist weg" gehoert das "mit Rolle ist es DA" daneben: eine
     Pruefung, die bei fehlendem Gegenstand gruen bleibt, kann gar nicht
     scheitern (Stolperstein 81). Hier heisst das: eine verschwundene Karte
     ist von einer Karte, die es nie gab, nur am Gegenaufbau zu unterscheiden. */
  const rTags = [
    { id: 31, name: 'Alu', usage_count: 3, test_usage_count: 1 },
    { id: 32, name: 'Stahl', usage_count: 1, test_usage_count: 0 }
  ];
  const baueSystem = async (rollen) => {
    const d = baueDom(JSDOM, { tags: rTags,
      einstellungen: { filters: null, benutzerZahl: 4, ...rollen } });
    await new Promise(r => setTimeout(r, 60));
    await d.w.renderSystem();
    await new Promise(r => setTimeout(r, 40));
    return d;
  };
  // Die Karten werden an ihrer UEBERSCHRIFT abgezaehlt, nicht an einer id:
  // die Ueberschrift ist das, was auf dem Bildschirm steht.
  const kartenVon = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card h3')]
    .map(h => h.textContent.trim());

  const rEig = await baueSystem({ istAdmin: true, istEigentuemer: true });
  const rAdm = await baueSystem({ istAdmin: true, istEigentuemer: false });
  const rUser = await baueSystem({ istAdmin: false, istEigentuemer: false });
  const kEig = kartenVon(rEig), kAdm = kartenVon(rAdm), kUser = kartenVon(rUser);

  const ALLE_KARTEN = ['Titel', 'Zugang', 'Kennzahlen', 'Export', 'Import', 'Sicherung',
    'Papierkorb', 'Kategorien', 'Tags', 'Bewertungskriterien', 'Zugänge', 'Darstellung',
    'Links', 'Suchanbieter', 'Vokabular'];
  pruefe('Die Eigentuemerin sieht alle fuenfzehn Karten',
    gleich(kEig, ALLE_KARTEN), kEig.join(' · '));

  /* Die drei, die JEDEM bleiben -- und der Grund steht in jeder von ihnen:
     "Zugang" ist der eigene Zugang, "Darstellung" ist Schriftgroesse und
     Blockanordnung, "Links" ist die Zahl der sichtbaren Zeilen und der
     angezeigten Anbieternamen. Alles Selbstbezug, alles persoenlich. */
  pruefe('Ein gewoehnlicher Benutzer sieht sechs -- drei persoenliche, drei zum Nachsehen',
    gleich(kUser, ['Zugang', 'Kategorien', 'Tags', 'Bewertungskriterien',
                   'Darstellung', 'Links']),
    kUser.join(' · '));

  /* Punkt fuer Punkt, weil eine Sammelpruefung nicht sagt, WELCHE Karte
     fehlt -- und weil jede fuer sich gegengeprueft werden koennen muss. */
  /* "Papierkorb" steht beim Admin -- SEHEN ist die Adminfrage, HANDELN die
     Eigentuemerfrage. Dieselbe Bauform wie bei "Kategorien", "Tags" und
     "Bewertungskriterien": die Karte bleibt, die Bedienzeichen verschwinden.
     Dass die Knoepfe dem Admin fehlen, steht in der eigenen Gruppe darunter. */
  for (const karte of ['Titel', 'Kennzahlen', 'Vokabular', 'Zugänge', 'Suchanbieter', 'Papierkorb']) {
    pruefe(`Die Karte "${karte}" steht nur beim Admin`,
      kAdm.includes(karte) && !kUser.includes(karte),
      `Admin: ${kAdm.includes(karte)} · Benutzer: ${kUser.includes(karte)}`);
  }
  for (const karte of ['Export', 'Import', 'Sicherung']) {
    pruefe(`Die Karte "${karte}" steht nur beim Eigentuemer`,
      kEig.includes(karte) && !kAdm.includes(karte) && !kUser.includes(karte),
      `Eigentuemer: ${kEig.includes(karte)} · Admin: ${kAdm.includes(karte)}`);
  }
  for (const karte of ['Zugang', 'Darstellung', 'Links']) {
    pruefe(`Die Karte "${karte}" steht jedem, auch ohne Rolle`,
      kUser.includes(karte) && kEig.includes(karte), kUser.join(' · '));
  }

  /* DIE KONKRETESTE FALLE DIESER STUFE. renderSystem() haengt sechs Abrufe in
     EIN Promise.all, und der Rumpf verlaesst sich mit return, sobald einer
     scheitert. Stuenden die Kennzahlen hinter dem Admin und wuerden trotzdem
     abgerufen, bliebe der Systembereich fuer einen Benutzer VOLLSTAENDIG
     leer -- auch die drei Karten, die ihm zustehen. Punkt 2 ist ohne Punkt 1
     nicht zu haben. */
  pruefe('Ohne Adminrolle werden die Kennzahlen gar nicht erst abgerufen',
    !rUser.gesendet.some(x => x.url === '/api/stats'),
    rUser.gesendet.map(x => x.url).join(' · '));
  pruefe('Mit Adminrolle sehr wohl',
    rAdm.gesendet.some(x => x.url === '/api/stats'),
    rAdm.gesendet.map(x => x.url).join(' · '));
  pruefe('Und der Systembereich bleibt dabei ueberhaupt gefuellt',
    kUser.length > 0 && !/lädt …/.test(rUser.w.document.getElementById('app')?.textContent || ''),
    rUser.w.document.getElementById('app')?.textContent?.slice(0, 80));

  /* DER FINGERPRINT IN DER KARTE (0.8.10). Geprueft wird an der KARTE, in der er
     stehen soll, nicht am ganzen Bildschirm: ein Wert, der irgendwo im
     Systembereich auftaucht, belegt nicht, dass er bei den Kennzahlen steht.
     Und zum "ist da" gehoert das "ohne Adminrolle ist es weg" daneben -- ohne
     den Gegenaufbau bliebe die Pruefung auch dann gruen, wenn die Zeile
     ueberall stuende (Stolperstein 81). */
  const kennzahlenKarte = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Kennzahlen');
  const admKarte = kennzahlenKarte(rAdm);
  pruefe('Die Karte Kennzahlen ist für den Admin überhaupt da', !!admKarte,
    kAdm.join(' · '));
  pruefe('Sie trägt eine Zeile mit der Beschriftung Fingerprint',
    [...(admKarte?.querySelectorAll('.kv') || [])]
      .some(z => z.querySelector('.k')?.textContent.trim() === 'Fingerprint'),
    [...(admKarte?.querySelectorAll('.kv .k') || [])].map(k => k.textContent.trim()).join(' · '));
  pruefe('Und darin steht der Wert aus der Antwort',
    [...(admKarte?.querySelectorAll('.kv') || [])]
      .some(z => z.querySelector('.k')?.textContent.trim() === 'Fingerprint' &&
                 z.querySelector('.v')?.textContent.trim() === 'a1b2c3d4'),
    [...(admKarte?.querySelectorAll('.kv .v') || [])].map(v => v.textContent.trim()).join(' · '));
  pruefe('Ohne Adminrolle steht der Fingerprint nirgends',
    !/a1b2c3d4/.test(rUser.w.document.getElementById('app')?.textContent || ''),
    rUser.w.document.getElementById('app')?.textContent?.slice(0, 120));

  /* Was verschwindet, sind die KARTEN, nicht die Daten. Das Vokabular ist
     jede Beschriftung der Oberflaeche -- ohne es haette der Benutzer einen
     Bildschirm ohne Woerter. Geprueft wird an einer Beschriftung, die aus dem
     Vokabular kommt und nicht aus dem Quelltext. */
  const rVok = await baueSystem({ istAdmin: false, istEigentuemer: false,
    vokabular: { sacheMehrzahl: 'Geräte' } });
  pruefe('Das Vokabular wird trotzdem ausgeliefert und benutzt',
    /Geräte/.test(rVok.w.document.getElementById('app')?.textContent || ''),
    'die Beschriftung folgt dem Vokabular nicht');
  pruefe('Aber die Karte zum Bearbeiten steht ihm nicht',
    !rVok.w.document.getElementById('v1') && !rVok.w.document.getElementById('vsave'));
  rVok.w.close();

  /* Die persoenlichen Karten sind nicht nur da, sie funktionieren auch. Ein
     wirklich zugestelltes Ereignis, samt Durchlauf des Event Loops --
     eine Karte, die dasteht und nichts tut, waere nicht besser als keine
     (Stolperstein 61). */
  rUser.gesendet.length = 0;
  const rPille = [...rUser.w.document.querySelectorAll('#fsize .pill')]
    .find(b => b.textContent === '120 %');
  pruefe('Die Schriftgroesse traegt ihre Stufen auch ohne Rolle', !!rPille,
    [...rUser.w.document.querySelectorAll('#fsize .pill')].map(b => b.textContent).join(' · '));
  if (rPille) {
    rPille.dispatchEvent(new rUser.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
  }
  const rGesendet = rUser.gesendet.filter(x => x.methode === 'PUT' && x.url === '/api/settings').pop();
  pruefe('Und der Druck speichert sie wirklich',
    rGesendet?.koerper?.schrift === 120, JSON.stringify(rGesendet));

  /* Die persoenliche Haelfte der Links bleibt, die Adminhaelfte geht. Beides
     an EINER Lage, sonst liesse sich der Schnitt der Karte nicht belegen. */
  pruefe('Die Zahl der Anbieternamen bleibt dem Benutzer',
    !!rUser.w.document.getElementById('snamen') &&
    rUser.w.document.querySelectorAll('#snamen .pill').length > 0);
  pruefe('Und die sichtbaren Linkzeilen ebenso',
    rUser.w.document.querySelectorAll('#lzeilen .pill').length > 0);
  pruefe('Vorrat, Startanbieter und eigene Anbieter dagegen nicht',
    !rUser.w.document.getElementById('sanbieter') &&
    !rUser.w.document.getElementById('seigene'));
  pruefe('Beim Admin stehen sie sehr wohl da',
    rAdm.w.document.querySelectorAll('#sanbieter .sanb').length > 0 &&
    rAdm.w.document.querySelectorAll('#seigene .sanb-slot').length === 3,
    `${rAdm.w.document.querySelectorAll('#sanbieter .sanb').length} Anbieter`);

  /* Die veraltete Anleitung. Eine falsche Anleitung auf dem Bildschirm ist
     schlimmer als eine fehlende: sie wird befolgt. Erst das Vorhandensein der
     Karte, dann ihr Inhalt -- sonst bliebe die Verneinung auch dann wahr,
     wenn die Karte gar nicht mehr da waere (Stolperstein 81). */
  const rZugangKarte = [...rUser.w.document.querySelectorAll('.sys-card')]
    .find(k => k.querySelector('h3')?.textContent.trim() === 'Zugang');
  pruefe('Die Karte "Zugang" ist ueberhaupt da', !!rZugangKarte);
  pruefe('Sie nennt AUTH_RESET nicht mehr',
    !!rZugangKarte && !/AUTH_RESET/.test(rZugangKarte.textContent || ''),
    rZugangKarte?.textContent?.slice(0, 200));
  pruefe('Sondern den Befehl, der wirklich hilft',
    !!rZugangKarte && /zugang\.js passwort/.test(rZugangKarte.textContent || ''),
    rZugangKarte?.textContent?.slice(0, 300));
  // Und ausdruecklich in der ganzen Oberflaeche nicht mehr als Anleitung:
  // der String steht in app.js nur noch dort, wo sie hingehoert.
  const rAppQuelle = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  pruefe('AUTH_RESET steht in der ganzen Oberflaeche nirgends mehr',
    !rAppQuelle.includes('AUTH_RESET'), 'public/app.js nennt AUTH_RESET noch');


  /* --- Die Kachel "Zugaenge" ueber die volle Breite ---
     Zwei Haelften, und beide werden gebraucht: die Klasse am Knoten sagt
     nichts darueber, ob sie etwas bewirkt, und die Regel im Stylesheet nichts
     darueber, ob sie jemand traegt. Erst das Vorhandensein der Regel, dann
     ihre Eigenschaft -- eine fehlende Regel liefert ein leerer String,
     und jede Verneinung darauf waere wahr (Stolperstein 81). */
  const rKachel = [...rEig.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(k => k.querySelector('h3')?.textContent.trim() === 'Zugänge');
  pruefe('Die Kachel "Zugaenge" ist da', !!rKachel);
  pruefe('Und sie ist als breite Kachel gekennzeichnet',
    !!rKachel && rKachel.classList.contains('breit'),
    rKachel?.className);
  // Und ausdruecklich als einzige: eine Kennzeichnung, die alle tragen, ist
  // keine.
  pruefe('Als einzige der dreizehn',
    [...rEig.w.document.querySelectorAll('.sys-grid > .sys-card.breit')].length === 1,
    `${rEig.w.document.querySelectorAll('.sys-grid > .sys-card.breit').length} breite Kacheln`);

  const rCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')
    .replace(/\s+/g, ' ');
  const rRegel = (w) => (rCss.match(new RegExp(w.replace(/\./g, '\\.') + ' \\{[^}]*\\}')) || [''])[0];
  pruefe('Die Regel fuer die breite Kachel steht ueberhaupt im Stylesheet',
    rRegel('.sys-card.breit').length > 0, '(keine Regel)');
  pruefe('Und sie zieht die Kachel ueber alle Rasterspalten',
    /grid-column: 1 \/ -1/.test(rRegel('.sys-card.breit')),
    rRegel('.sys-card.breit') || '(keine Regel)');
  /* Die Luecke, die eine breite Kachel davor hinterlaesst. GEPRUEFT WIRD AM
     STYLESHEET, NICHT AM GEFUEHL: jsdom rechnet kein Layout, ein Raster gibt
     es hier gar nicht. Wieder erst das Vorhandensein der Regel, dann ihre
     Eigenschaft -- eine fehlende Regel liefert ein leerer String, und
     jede Verneinung darauf waere wahr (Stolperstein 81). */
  pruefe('Die Regel fuer das Kartenraster steht ueberhaupt im Stylesheet',
    rRegel('.sys-grid').length > 0, '(keine Regel)');
  pruefe('Und das Raster zieht nachfolgende Karten in die Luecke',
    /grid-auto-flow: dense/.test(rRegel('.sys-grid')),
    rRegel('.sys-grid') || '(keine Regel)');
  // Die Reihenfolge im Quelltext bleibt davon unberuehrt: die Kachel steht
  // weiterhin dort, wo sie stand, und nicht am Ende.
  pruefe('Und die Kachel steht dabei nicht am Ende des Rasters',
    [...rEig.w.document.querySelectorAll('.sys-grid > .sys-card')].pop() !== rKachel,
    'die breite Kachel ist ans Ende gewandert');

  /* --- Trennlinien zwischen den Abschnitten der Linkkarten --- */
  pruefe('Die Karte "Links" traegt einen abgesetzten Abschnitt',
    rUser.w.document.querySelectorAll('.sys-card .sys-teil').length > 0,
    `${rUser.w.document.querySelectorAll('.sys-card .sys-teil').length} Abschnitte`);
  pruefe('Und die Karte "Suchanbieter" ebenfalls',
    [...rAdm.w.document.querySelectorAll('.sys-card')]
      .filter(k => k.querySelector('h3')?.textContent.trim() === 'Suchanbieter')
      .some(k => k.querySelector('.sys-teil')),
    'kein abgesetzter Abschnitt in der Karte "Suchanbieter"');
  pruefe('Die Regel dafuer steht ueberhaupt im Stylesheet',
    rRegel('.sys-card .sys-teil').length > 0, '(keine Regel)');
  pruefe('Und sie zieht eine Linie darueber, nicht bloss einen Abstand',
    /border-top: 1px solid var\(--line\)/.test(rRegel('.sys-card .sys-teil')) &&
    /padding-top:/.test(rRegel('.sys-card .sys-teil')),
    rRegel('.sys-card .sys-teil') || '(keine Regel)');
  // Keine neue Farbe: --line gibt es laengst und bedeutet dort bereits
  // "Kante zwischen zwei Flaechen".
  pruefe('Ohne eine neue Farbe dafuer zu erfinden',
    !/border-top: 1px solid (?!var\(--line\))/.test(rRegel('.sys-card .sys-teil')),
    rRegel('.sys-card .sys-teil'));

  rEig.w.close(); rAdm.w.close(); rUser.w.close();

  /* ---------------------------------------------------------------- */
  gruppe('Der Papierkorb in der Oberflaeche');

  /* DIE KARTE IN BEIDEN ZUSTAENDEN -- gefuellt und leer (Stolperstein 90).
     Eine Karte ohne Zeilen belegte nichts ueber die Zeilen, eine ohne den
     leeren Fall nichts ueber die Auskunft "hier liegt nichts".
     WER DIE ZAHLEN EINER PRUEFLAGE MISST, MISST SIE AN EINEM FRISCHEN AUFBAU
     (Stolperstein 115): die beiden Schreibwege unten veraendern den Bestand
     des Mocks wirklich, und was danach im selben Fenster laeuft, saehe etwas
     anderes. Deshalb baut jede Lage ihren eigenen Systembereich. */
  const pkSystem = async (rollen, opt = {}) => {
    const d = baueDom(JSDOM, { einstellungen: { filters: null, benutzerZahl: 4, ...rollen }, ...opt });
    await new Promise(r => setTimeout(r, 60));
    await d.w.renderSystem();
    await new Promise(r => setTimeout(r, 60));
    return d;
  };
  const pkKarte = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Papierkorb');
  const pkReihen = (d) => [...(pkKarte(d)?.querySelectorAll('#mpapierkorb .mrow.pk') || [])];

  const pkuEig = await pkSystem({ istAdmin: true, istEigentuemer: true });
  const pkuAdm = await pkSystem({ istAdmin: true, istEigentuemer: false });
  const pkuUser = await pkSystem({ istAdmin: false, istEigentuemer: false });

  // ERST DAS VORHANDENSEIN, dann jede Aussage darueber (Stolperstein 81).
  pruefe('Die Karte steht bei der Eigentuemerin', !!pkKarte(pkuEig));
  pruefe('Und beim Admin ohne Eigentuemerrolle', !!pkKarte(pkuAdm));
  pruefe('Bei einem gewoehnlichen Benutzer gibt es sie nicht', !pkKarte(pkuUser));
  pruefe('Ohne Adminrolle wird die Liste gar nicht erst abgerufen',
    !pkuUser.gesendet.some(x => x.url === '/api/papierkorb'),
    pkuUser.gesendet.map(x => x.url).join(' · '));
  pruefe('Mit Adminrolle sehr wohl',
    pkuAdm.gesendet.some(x => x.url === '/api/papierkorb'),
    pkuAdm.gesendet.map(x => x.url).join(' · '));

  const pkuReihen = pkReihen(pkuEig);
  pruefe('Die Karte zeigt beide Zeilen', pkuReihen.length === 2,
    `${pkuReihen.length} Zeilen`);
  pruefe('Mit ihren Titeln',
    gleich(pkuReihen.map(r => r.querySelector('.mname')?.textContent), ['Weggeworfenes', 'Von einem Grabstein']),
    JSON.stringify(pkuReihen.map(r => r.querySelector('.mname')?.textContent)));
  const pkuMeta = pkuReihen.map(r => r.querySelector('.pk-meta')?.textContent || '');
  pruefe('Jede Zeile nennt, wer geloescht hat',
    /von chefin/.test(pkuMeta[0]), pkuMeta[0]);
  /* Der GRABSTEIN geht denselben Weg von der Nummer zum Namen wie ueberall
     sonst -- der Name steht in der Antwort ausdruecklich auf null. */
  pruefe('Und ein Grabstein heisst wie ueberall "Geloeschter Benutzer 4"',
    /von Gelöschter Benutzer 4/.test(pkuMeta[1]), pkuMeta[1]);
  pruefe('Jede Zeile nennt die verbleibenden Tage',
    /noch 12 Tage/.test(pkuMeta[0]) && /noch 27 Tage/.test(pkuMeta[1]),
    JSON.stringify(pkuMeta));
  pruefe('Und ihre Groesse', /2,0 KB/.test(pkuMeta[0]), pkuMeta[0]);
  pruefe('Das Datum steht in deutscher Schreibweise',
    /01\.08\.2026/.test(pkuMeta[0]), pkuMeta[0]);

  /* BEIDE KNOEPFE NUR BEIM EIGENTUEMER. Erst das Vorhandensein der Zeile,
     dann die Abwesenheit des Knopfes an ihr -- ohne die erste Haelfte bliebe
     die zweite auf null Zeilen wahr und belegte nichts (Stolperstein 81). */
  pruefe('Bei der Eigentuemerin steht an jeder Zeile Zurueckholen und ein Kreuz',
    pkuReihen.length === 2 && pkuReihen.every(r => !!r.querySelector('.pk-back') && !!r.querySelector('.pk-weg')),
    JSON.stringify(pkuReihen.map(r => r.innerHTML.slice(0, 120))));
  const pkuAdmReihen = pkReihen(pkuAdm);
  pruefe('Beim Admin gibt es die Zeilen ueberhaupt', pkuAdmReihen.length === 2,
    `${pkuAdmReihen.length} Zeilen`);
  pruefe('Aber an ihnen steht kein einziger Knopf',
    pkuAdmReihen.every(r => !r.querySelector('.pk-back') && !r.querySelector('.pk-weg')),
    JSON.stringify(pkuAdmReihen.map(r => r.innerHTML.slice(0, 120))));
  pruefe('Und die Karte sagt ihm, wer es darf',
    /Eigentümer der Anlage/.test(pkKarte(pkuAdm)?.querySelector('.desc')?.textContent || ''),
    pkKarte(pkuAdm)?.querySelector('.desc')?.textContent);
  pruefe('Bei der Eigentuemerin steht dieser Satz NICHT',
    !/Eigentümer der Anlage/.test(pkKarte(pkuEig)?.querySelector('.desc')?.textContent || ''),
    pkKarte(pkuEig)?.querySelector('.desc')?.textContent);

  // Die Frist steht in der Karte, und zwar die aus der Antwort.
  pruefe('Die Karte nennt die Frist aus der Antwort',
    /30 Tage/.test(pkKarte(pkuEig)?.querySelector('.desc')?.textContent || ''),
    pkKarte(pkuEig)?.querySelector('.desc')?.textContent);

  /* DAS VOKABULAR. Wer seine Eintraege "Maschinen" nennt, liest hier
     "Gelöschte Maschinen" -- eine Karte, die den Bestand mit einem anderen
     Wort benennt als der Rest der Oberflaeche, ist falsch beschriftet. */
  const pkuVok = await pkSystem({ istAdmin: true, istEigentuemer: true,
    vokabular: { sacheEinzahl: 'Maschine', sacheMehrzahl: 'Maschinen',
                 zeitpunktEinzahl: 'Prüfung', zeitpunktMehrzahl: 'Prüfungen' } });
  pruefe('Die Karte benutzt das Vokabular',
    /Gelöschte Maschinen/.test(pkKarte(pkuVok)?.querySelector('.desc')?.textContent || ''),
    pkKarte(pkuVok)?.querySelector('.desc')?.textContent);
  pruefe('Und auch fuer den Zeitpunkt',
    /Prüfungen/.test(pkKarte(pkuVok)?.querySelector('.desc')?.textContent || ''),
    pkKarte(pkuVok)?.querySelector('.desc')?.textContent);

  /* DER LEERE FALL, mit eigenem Aufbau. */
  const pkuLeer = await pkSystem({ istAdmin: true, istEigentuemer: true }, { papierkorbBestand: [] });
  pruefe('Ist der Papierkorb leer, steht die Karte trotzdem da', !!pkKarte(pkuLeer));
  pruefe('Und sie sagt es',
    /Keine gelöschten Einträge/.test(pkKarte(pkuLeer)?.textContent || ''),
    pkKarte(pkuLeer)?.textContent?.slice(0, 200));
  pruefe('Ohne eine einzige Zeile', pkReihen(pkuLeer).length === 0);
  const pkuLeerVok = await pkSystem({ istAdmin: true, istEigentuemer: true,
    vokabular: { sacheEinzahl: 'Maschine', sacheMehrzahl: 'Maschinen' } }, { papierkorbBestand: [] });
  pruefe('Auch der leere Fall benutzt das Vokabular',
    /Keine gelöschten Maschinen/.test(pkKarte(pkuLeerVok)?.textContent || ''),
    pkKarte(pkuLeerVok)?.textContent?.slice(0, 200));

  /* ZURUECKHOLEN, mit einem WIRKLICH zugestellten Ereignis -- .click() genuegt
     nicht, und ein Fehler hinter einem await bliebe im nur gebauten DOM
     unsichtbar (Stolperstein 61). Der Mock aendert seinen Bestand dabei
     wirklich; ohne das waere "die Karte zeichnet sich neu" von "die Karte
     blieb stehen" nicht zu unterscheiden (Stolperstein 90). */
  {
    const d = await pkSystem({ istAdmin: true, istEigentuemer: true });
    const vorher = pkReihen(d).length;
    pkReihen(d)[0]?.querySelector('.pk-back')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    pruefe('Der Knopf schickt das Zurueckholen an den Server',
      d.gesendet.some(x => x.methode === 'POST' && x.url === '/api/papierkorb/501/wiederherstellen'),
      d.gesendet.slice(-3).map(x => `${x.methode} ${x.url}`).join(' · '));
    pruefe('Und holt die Liste danach neu',
      d.gesendet.filter(x => x.url === '/api/papierkorb').length >= 2,
      d.gesendet.map(x => x.url).join(' · '));
    pruefe('Die Karte zeigt danach eine Zeile weniger',
      pkReihen(d).length === vorher - 1, `vorher ${vorher}, danach ${pkReihen(d).length}`);
    pruefe('Und die zurueckgeholte Zeile ist es, die fehlt',
      !pkReihen(d).some(r => r.querySelector('.mname')?.textContent === 'Weggeworfenes'),
      JSON.stringify(pkReihen(d).map(r => r.querySelector('.mname')?.textContent)));
    pruefe('Eine Meldung sagt es',
      /Weggeworfenes/.test(d.w.document.querySelector('.toast')?.textContent || ''),
      d.w.document.querySelector('.toast')?.textContent);
  }

  /* Und die laute Haelfte: unbekannte Verfasser aus der Antwort werden
     genannt. Die zweite Zeile der Prueflage traegt sie. */
  {
    const d = await pkSystem({ istAdmin: true, istEigentuemer: true });
    pkReihen(d)[1]?.querySelector('.pk-back')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    pruefe('Unbekannte Verfasser stehen in der Meldung',
      /dora/.test(d.w.document.querySelector('.toast')?.textContent || ''),
      d.w.document.querySelector('.toast')?.textContent);
  }

  /* ENDGUELTIG ENTFERNEN -- mit Rueckfrage davor. Ein Weg ohne Rueckweg
     bekommt eine. */
  {
    const d = await pkSystem({ istAdmin: true, istEigentuemer: true });
    const vorher = pkReihen(d).length;
    pkReihen(d)[0]?.querySelector('.pk-weg')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const frage = d.w.document.querySelector('.backdrop .modal');
    pruefe('Das Kreuz fragt zuerst nach', !!frage, d.w.document.body.innerHTML.slice(0, 120));
    pruefe('Und die Frage nennt den Titel und sagt, dass es danach keinen Rueckweg gibt',
      /Weggeworfenes/.test(frage?.textContent || '') && /keinen Rückweg/.test(frage?.textContent || ''),
      frage?.textContent);
    // Erst abbrechen: danach darf NICHTS geschickt worden sein.
    d.w.document.querySelector('.backdrop [data-no]')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    pruefe('Nach dem Abbrechen wird nichts geschickt',
      !d.gesendet.some(x => x.methode === 'DELETE' && x.url.startsWith('/api/papierkorb/')),
      d.gesendet.slice(-3).map(x => `${x.methode} ${x.url}`).join(' · '));
    pruefe('Und die Zeile steht noch da', pkReihen(d).length === vorher);

    pkReihen(d)[0]?.querySelector('.pk-weg')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    d.w.document.querySelector('.backdrop [data-yes]')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    pruefe('Nach dem Bestaetigen geht das Entfernen hinaus',
      d.gesendet.some(x => x.methode === 'DELETE' && x.url === '/api/papierkorb/501'),
      d.gesendet.slice(-3).map(x => `${x.methode} ${x.url}`).join(' · '));
    pruefe('Und die Karte zeigt eine Zeile weniger',
      pkReihen(d).length === vorher - 1, `vorher ${vorher}, danach ${pkReihen(d).length}`);
  }

  /* DIE KENNZAHLENKARTE weist den Papierkorb getrennt aus. Geprueft an der
     KARTE, in der er stehen soll -- ein Wert irgendwo im Systembereich belegte
     nicht, dass er bei den Kennzahlen steht. */
  {
    const karte = [...pkuEig.w.document.querySelectorAll('.sys-grid > .sys-card')]
      .find(c => c.querySelector('h3')?.textContent.trim() === 'Kennzahlen');
    pruefe('Die Karte Kennzahlen ist ueberhaupt da', !!karte);
    const zeile = [...(karte?.querySelectorAll('.kv') || [])]
      .find(z => z.querySelector('.k')?.textContent.trim() === 'Papierkorb');
    pruefe('Sie traegt eine Zeile mit der Beschriftung Papierkorb', !!zeile,
      [...(karte?.querySelectorAll('.kv .k') || [])].map(k => k.textContent.trim()).join(' · '));
    pruefe('Und darin stehen Zahl und Groesse aus der Antwort',
      /^2 · 2,5 KB$/.test(zeile?.querySelector('.v')?.textContent?.trim() || ''),
      zeile?.querySelector('.v')?.textContent);
  }

  /* ---------------------------------------------------------------- */
  gruppe('Die Sicherung in der Oberflaeche');

  /* DREI ZUSTAENDE, DREI AUFBAUTEN: eingerichtet, gar nicht eingerichtet und
     ein Zielort mit Fehler. Eine Karte, die nur im guten Fall geprueft ist,
     belegt nichts ueber die beiden Faelle, in denen sie etwas SAGEN muss.
     WER DIE ZAHLEN EINER PRUEFLAGE MISST, MISST SIE AN EINEM FRISCHEN AUFBAU
     (Stolperstein 115): die Schreibwege unten aendern den Stand des Mocks
     wirklich. */
  const siKarte = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Sicherung');
  const siEig = await pkSystem({ istAdmin: true, istEigentuemer: true });
  const siAdm = await pkSystem({ istAdmin: true, istEigentuemer: false });

  pruefe('Die Karte steht bei der Eigentuemerin', !!siKarte(siEig));
  pruefe('Beim Admin ohne Eigentuemerrolle gibt es sie nicht', !siKarte(siAdm));
  pruefe('Und ohne Eigentuemerrolle wird ihr Stand gar nicht erst abgerufen',
    !siAdm.gesendet.some(x => x.url === '/api/sicherung'),
    siAdm.gesendet.map(x => x.url).join(' · '));
  pruefe('Mit Eigentuemerrolle sehr wohl',
    siEig.gesendet.some(x => x.url === '/api/sicherung'),
    siEig.gesendet.map(x => x.url).join(' · '));

  /* DIE ROLLENTEILUNG STEHT AN BEIDEN KARTEN, nicht nur in den Dokumenten.
     Wer sie nebeneinander sieht, muss ohne Rueckfrage wissen, welche er
     will -- ein Satz je Karte, und beide werden hier geprueft. */
  const siExportKarte = [...siEig.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Export');
  pruefe('Die Exportkarte ist ueberhaupt da', !!siExportKarte);
  pruefe('Sie nennt sich den Austauschweg',
    /Austauschweg/.test(siExportKarte?.textContent || ''), siExportKarte?.textContent?.slice(0, 200));
  pruefe('Und verweist auf die Sicherung',
    /Sicherung/.test(siExportKarte?.textContent || ''), siExportKarte?.textContent?.slice(0, 300));
  pruefe('Die Sicherungskarte nennt sich der Sicherungsweg',
    /Sicherungsweg/.test(siKarte(siEig)?.textContent || ''),
    siKarte(siEig)?.textContent?.slice(0, 200));
  pruefe('Und sagt, dass sie keinen Formatwechsel ueberlebt',
    /Formatwechsel/.test(siKarte(siEig)?.textContent || ''),
    siKarte(siEig)?.textContent?.slice(0, 400));

  /* DER HINWEIS AUF DEN SCHLUESSEL GEHOERT AN DEN KNOPF, nicht in die
     Dokumentation: die Kopie ist ohne .env wertlos, und genau dort tappt
     jemand in die Falle. */
  const siWarn = siKarte(siEig)?.querySelector('.warn-box');
  pruefe('Der Hinweis auf den Schluessel steht in der Karte', !!siWarn,
    siKarte(siEig)?.innerHTML?.slice(0, 200));
  pruefe('Und er nennt die .env',
    /\.env/.test(siWarn?.textContent || ''), siWarn?.textContent);

  pruefe('Die Karte nennt den eingerichteten Ort',
    /\/sicherung/.test(siKarte(siEig)?.textContent || ''),
    siKarte(siEig)?.textContent?.slice(0, 400));
  pruefe('Das Feld traegt das eingestellte Unterverzeichnis',
    siEig.w.document.getElementById('sich-ort')?.value === 'taeglich',
    siEig.w.document.getElementById('sich-ort')?.value);
  pruefe('Die letzte Sicherung steht mit ihren Tagen da',
    /vor 3 Tagen/.test(siKarte(siEig)?.textContent || ''),
    siKarte(siEig)?.textContent?.slice(0, 600));
  pruefe('Samt Dateiname und Groesse',
    /kriterion-2026-08-20-03-00-00\.sqlite/.test(siKarte(siEig)?.textContent || '') &&
    /50,0 MB/.test(siKarte(siEig)?.textContent || ''),
    siKarte(siEig)?.textContent?.slice(0, 600));
  /* DIE DAUER STEHT VORHER DA. VACUUM INTO laeuft synchron, die Anlage steht
     so lange still -- eine Ansage ist besser als ein stiller Stillstand. */
  pruefe('Die Karte sagt vorher, dass die Anlage stillsteht',
    /steht die\s+Anlage still/.test(siKarte(siEig)?.textContent || ''),
    siKarte(siEig)?.textContent?.slice(0, 700));
  pruefe('Und nennt die erwartete Dauer aus der Antwort',
    /etwa\s+1 Sekunden/.test(siKarte(siEig)?.textContent || ''),
    siKarte(siEig)?.textContent?.slice(0, 700));

  /* DER NICHT EINGERICHTETE FALL. */
  {
    const d = await pkSystem({ istAdmin: true, istEigentuemer: true },
      { sicherungStand: { eingerichtet: false, grund: 'Es ist kein Sicherungsort eingerichtet. ' +
        'Die docker-compose.yml hängt ihn ein.', ort: '', dbBytes: 1, dauerSekunden: 1,
        erreichbar: false, letzte: null } });
    pruefe('Ohne eingerichteten Ort steht die Karte trotzdem da', !!siKarte(d));
    pruefe('Und sagt, warum sie nicht kann',
      /kein Sicherungsort eingerichtet/.test(siKarte(d)?.textContent || ''),
      siKarte(d)?.textContent?.slice(0, 300));
    pruefe('Der Knopf steht dann gar nicht erst da',
      !d.w.document.getElementById('sich-los'), 'der Knopf steht da');
    pruefe('Und das Feld fuer den Ort ebenso wenig',
      !d.w.document.getElementById('sich-ort'), 'das Feld steht da');
  }

  /* DER UNERREICHBARE ZIELORT. Die Karte sagt es, statt eine Zahl zu
     behaupten -- das ist der Preis der Entscheidung fuer das Dateisystem. */
  {
    const d = await pkSystem({ istAdmin: true, istEigentuemer: true },
      { sicherungStand: { eingerichtet: true, wurzel: '/sicherung', ort: 'weg',
        fehler: 'Das Verzeichnis „weg“ gibt es unter dem Sicherungsort nicht.',
        dbBytes: 1024, dauerSekunden: 1, erreichbar: false, letzte: null } });
    pruefe('Ein Zielort mit Fehler bekommt keine Zahl, sondern die Begruendung',
      /gibt es unter dem Sicherungsort nicht/.test(siKarte(d)?.textContent || ''),
      siKarte(d)?.textContent?.slice(0, 400));
    pruefe('Und nirgends steht "vor 0 Tagen"',
      !/vor \d+ Tag/.test(siKarte(d)?.textContent || ''),
      siKarte(d)?.textContent?.slice(0, 400));
  }
  {
    const d = await pkSystem({ istAdmin: true, istEigentuemer: true },
      { sicherungStand: { eingerichtet: true, wurzel: '/sicherung', ort: '',
        pfad: '/sicherung', dbBytes: 1024, dauerSekunden: 1, erreichbar: true,
        letzte: null, zahl: 0 } });
    pruefe('Ein leerer Ort sagt, dass dort noch keine Sicherung liegt',
      /noch keine Sicherung/.test(siKarte(d)?.textContent || ''),
      siKarte(d)?.textContent?.slice(0, 400));
  }

  /* DER KNOPF, mit einem WIRKLICH zugestellten Ereignis. */
  {
    const d = await pkSystem({ istAdmin: true, istEigentuemer: true });
    d.w.document.getElementById('sich-los')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    pruefe('Der Knopf schickt die Sicherung an den Server',
      d.gesendet.some(x => x.methode === 'POST' && x.url === '/api/sicherung'),
      d.gesendet.slice(-3).map(x => `${x.methode} ${x.url}`).join(' · '));
    pruefe('Eine Meldung nennt die geschriebene Datei',
      /kriterion-2026-08-23-19-00-00\.sqlite/.test(d.w.document.querySelector('.toast')?.textContent || ''),
      d.w.document.querySelector('.toast')?.textContent);
    pruefe('Und die Karte zeichnet sich mit dem neuen Stand neu',
      /vor 0 Tagen/.test(siKarte(d)?.textContent || ''),
      siKarte(d)?.textContent?.slice(0, 600));
    pruefe('Die Zahl der Dateien am Ort waechst mit',
      /kriterion-2026-08-23-19-00-00/.test(siKarte(d)?.textContent || ''),
      siKarte(d)?.textContent?.slice(0, 600));
  }

  /* DER ZIELORT laesst sich umstellen -- und eine Absage des Servers wird
     gesagt, statt still zu bleiben. */
  {
    const d = await pkSystem({ istAdmin: true, istEigentuemer: true });
    if (d.w.document.getElementById('sich-ort')) d.w.document.getElementById('sich-ort').value = 'woechentlich';
    d.w.document.getElementById('sich-ort-save')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    pruefe('Der Zielort geht mit dem eingetippten Wert hinaus',
      d.gesendet.some(x => x.methode === 'PUT' && x.url === '/api/sicherung/ort' &&
        x.koerper?.ort === 'woechentlich'),
      d.gesendet.slice(-3).map(x => `${x.methode} ${x.url} ${JSON.stringify(x.koerper)}`).join(' · '));
    pruefe('Und die Karte traegt ihn danach',
      d.w.document.getElementById('sich-ort')?.value === 'woechentlich',
      d.w.document.getElementById('sich-ort')?.value);

    if (d.w.document.getElementById('sich-ort')) d.w.document.getElementById('sich-ort').value = '../raus';
    d.w.document.getElementById('sich-ort-save')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    pruefe('Eine Absage des Servers wird gesagt',
      /Unterverzeichnis/.test(d.w.document.querySelector('.toast')?.textContent || ''),
      d.w.document.querySelector('.toast')?.textContent);
    pruefe('Und der Ort bleibt der alte',
      d.w.document.getElementById('sich-ort')?.value === '../raus',
      d.w.document.getElementById('sich-ort')?.value);
  }

  /* ================= Vergleich: meine / alle ================= */
  /* ================= Das Gewicht in der Oberflaeche ================= */
  gruppe('Das Gewicht am Eintrag');

  /* Vorgabelage des Mocks: Gewichte 1,5 · 1 · 0,5, eigene Werte
     3 · 3 · 3. Damit lassen sich Anzeige UND Nichtanzeige an derselben Lage
     belegen -- die mittlere Zeile steht auf 1 und darf nichts tragen. */
  const gwEintrag = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: true } });
  await new Promise(r => setTimeout(r, 80));
  const gwDoc = gwEintrag.w.document;
  const gwMarken = () => [...gwDoc.querySelectorAll('#ratings .rrow .rname')]
    .map(z => z.querySelector('.rgew')?.textContent || '');

  pruefe('Die Gewichtsmarke steht hinter dem Kriteriennamen',
    gleich(gwMarken(), ['×1,5', '', '×0,5']), JSON.stringify(gwMarken()));
  /* ABLEITUNG, KEIN SCHALTER: bei Gewicht 1 steht dort nichts. "×1" an jeder
     Zeile waere Rauschen ohne Aussage -- dieselbe Bauform wie die
     Durchschnittsspalte, die bei einem einzigen Zugang entfaellt. */
  pruefe('Und ×1 steht nirgends',
    !gwDoc.getElementById('ratings').textContent.includes('×1 ') &&
    !gwMarken().includes('×1'), JSON.stringify(gwMarken()));
  /* Der Name selbst bleibt unberuehrt -- die Marke ist ein eigener Knoten und
     wird nicht in den Namen hineingeschrieben. Ein Kriterienname ist Eingabe. */
  pruefe('Der Kriterienname bleibt davon unberuehrt',
    gleich([...gwDoc.querySelectorAll('#ratings .rname')].map(z => z.firstChild.textContent.trim()),
           ['Zuerst', 'Dann', 'Zuletzt']));
  pruefe('Der Blockkopf sagt, dass gewichtet gerechnet wurde',
    / gewichtet$/.test(gwDoc.getElementById('rhead')?.textContent || ''),
    JSON.stringify(gwDoc.getElementById('rhead')?.textContent));
  pruefe('Und die Zahl daneben steht unveraendert dort',
    /⌀\s*3,0/.test(gwDoc.getElementById('rhead')?.textContent || ''),
    JSON.stringify(gwDoc.getElementById('rhead')?.textContent));
  gwEintrag.w.close();

  /* GEGENLAGE 1: alle Gewichte auf 1. Ohne sie bliebe offen, ob die Anzeige
     ueberhaupt an einer Bedingung haengt -- eine Pruefung, die nur das
     Vorhandensein belegt, koennte einen fest eingebauten Text nicht von einer
     Ableitung unterscheiden. */
  const gwGleich = baueDom(JSDOM, { hash: '#/item/1', kriterienGewichte: [1, 1, 1],
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: true } });
  await new Promise(r => setTimeout(r, 80));
  pruefe('Stehen alle Gewichte auf 1, steht keine Marke da',
    gwGleich.w.document.querySelectorAll('#ratings .rgew').length === 0,
    `${gwGleich.w.document.querySelectorAll('#ratings .rgew').length} Marken`);
  pruefe('Und der Blockkopf traegt genau das, was er vorher trug',
    gwGleich.w.document.getElementById('rhead')?.textContent === '⌀ 3,0',
    JSON.stringify(gwGleich.w.document.getElementById('rhead')?.textContent));
  gwGleich.w.close();

  /* GEGENLAGE 2 -- die feinere: ein Kriterium mit Gewicht 1,5, das an diesem
     Eintrag NIEMAND bewertet hat. Es geht in die Rechnung gar nicht ein, also
     darf das Wort "gewichtet" nicht dastehen. Die Marke an der Zeile bleibt
     dagegen: sie ist eine Aussage ueber das Kriterium, nicht ueber die Zahl.
     Das dritte Kriterium hat count 0 und avg null; mit eigenem Wert 0 ist es
     von niemandem bewertet. */
  const gwUnbewertet = baueDom(JSDOM, { hash: '#/item/1',
    kriterienGewichte: [1, 1, 1.5], eigeneWerte: [3, 3, 0],
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: true } });
  await new Promise(r => setTimeout(r, 80));
  const gwUDoc = gwUnbewertet.w.document;
  pruefe('Ein Gewicht an einem unbewerteten Kriterium steht trotzdem an der Zeile',
    [...gwUDoc.querySelectorAll('#ratings .rrow .rname')]
      .map(z => z.querySelector('.rgew')?.textContent || '')[2] === '×1,5',
    JSON.stringify([...gwUDoc.querySelectorAll('#ratings .rrow .rname')]
      .map(z => z.querySelector('.rgew')?.textContent || '')));
  pruefe('Aber der Blockkopf nennt sich nicht gewichtet — es floss nichts ein',
    !/gewichtet/.test(gwUDoc.getElementById('rhead')?.textContent || ''),
    JSON.stringify(gwUDoc.getElementById('rhead')?.textContent));
  gwUnbewertet.w.close();

  /* ---------------------------------------------------------------- */
  gruppe('Das Gewicht im Systembereich');

  const gwSys = baueDom(JSDOM, { hash: '',
    tags: [{ id: 31, name: 'Grün', usage_count: 3, test_usage_count: 1 },
           { id: 32, name: 'Blau', usage_count: 0, test_usage_count: 0 }],
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: true } });
  await new Promise(r => setTimeout(r, 80));
  await gwSys.w.renderSystem();
  const gwSDoc = gwSys.w.document;
  const gwFelder = () => [...gwSDoc.querySelectorAll('#mcrits .mgew-feld')];
  const gwGesendet = gwSys.gesendet;

  pruefe('Jede Kriterienzeile traegt ein Gewichtsfeld', gwFelder().length === 3,
    `${gwFelder().length} Felder`);
  /* DIE KARTE ZEICHNET manage(), UND DIESELBE FUNKTION ZEICHNET AUCH
     KATEGORIEN UND TAGS. Ein Gewicht gibt es dort nicht -- eine Kategorie
     rechnet nirgends mit. Ohne diese Zeilen bliebe offen, ob die
     Unterscheidung ueberhaupt stattfindet.
     ERST AUF ZEILEN, DANN AUF DIE EIGENSCHAFT (Stolperstein 81): eine leere
     Karte hat keine Zeilen, und "keine der 0 Zeilen traegt ein Feld" ist wahr
     und belegt nichts. Genau daran ist die Gegenprobe zu diesem Punkt beim
     Bauen zuerst stumm geblieben. */
  pruefe('Die Kategorienkarte traegt ueberhaupt Zeilen',
    gwSDoc.querySelectorAll('#mcats .mrow').length >= 2,
    `${gwSDoc.querySelectorAll('#mcats .mrow').length} Zeilen`);
  pruefe('Und keine davon traegt ein Gewicht',
    gwSDoc.querySelectorAll('#mcats .mgew').length === 0,
    gwSDoc.getElementById('mcats')?.innerHTML.slice(0, 200));
  pruefe('Die Tagkarte traegt ebenfalls Zeilen',
    gwSDoc.querySelectorAll('#mtags .mrow').length >= 1,
    `${gwSDoc.querySelectorAll('#mtags .mrow').length} Zeilen`);
  pruefe('Und auch dort steht keines',
    gwSDoc.querySelectorAll('#mtags .mgew').length === 0,
    gwSDoc.getElementById('mtags')?.innerHTML.slice(0, 200));
  /* KEINE ERFUNDENE GENAUIGKEIT: 1 steht als "1", nicht als "1,0" -- das sieht
     nach einer Einstellung aus, wo in Wahrheit die Vorgabe steht. Und 1,5
     nicht als "1,50". */
  pruefe('Die Felder zeigen den Wert mit Komma und ohne nachlaufende Nullen',
    gleich(gwFelder().map(f => f.value), ['1,5', '1', '0,5']),
    JSON.stringify(gwFelder().map(f => f.value)));
  pruefe('Das Feld ist ein Textfeld mit Dezimaltastatur, kein Zahlenfeld',
    gwFelder().every(f => f.getAttribute('type') === 'text' &&
                          f.getAttribute('inputmode') === 'decimal'),
    JSON.stringify(gwFelder().map(f => `${f.getAttribute('type')}/${f.getAttribute('inputmode')}`)));
  pruefe('Und es haengt an der Vorschlagsliste',
    gwFelder().every(f => f.getAttribute('list') === 'gewichtsug') &&
    !!gwSDoc.getElementById('gewichtsug'));
  const gwVorschlaege = [...(gwSDoc.getElementById('gewichtsug')?.querySelectorAll('option') || [])]
    .map(o => o.value);
  pruefe('Die Vorschlaege reichen unter und ueber 1',
    gleich(gwVorschlaege, ['0,5', '0,8', '1', '1,2', '1,5']), JSON.stringify(gwVorschlaege));
  pruefe('Die Karte erklaert, was das Gewicht bewirkt',
    /zwischen\s+1\s+und\s+5/.test(gwSDoc.getElementById('mcrits')?.parentElement?.textContent || ''));
  /* Und die Regeln dazu im Stylesheet -- eine Klassenpruefung allein belegt
     nicht, dass die Klasse etwas bewirkt (Luecke 1 des Pruefstands). Erst auf
     Vorhandensein, dann auf die Eigenschaft (Stolperstein 81). */
  {
    const gwCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    const gwRegel = (gwCss.match(/\.mrow \.mgew-feld \{[^}]*\}/) || [''])[0];
    pruefe('Das Stylesheet kennt das Gewichtsfeld', gwRegel.length > 0);
    /* Die Breite steht in em, nicht in px: die Schriftgroesse der Oberflaeche
       ist in fuenf Stufen einstellbar, und ein festes Mass hielte bei 120 %
       "1,25" nicht mehr. */
    pruefe('Und seine Breite waechst mit der Schriftgroesse mit',
      /width: *[0-9.]+em/.test(gwRegel) && !/width: *[0-9.]+px/.test(gwRegel), gwRegel);
    const gwMarkeRegel = (gwCss.match(/\.rrow \.rname \.rgew[^{]*\{[^}]*\}/) || [''])[0];
    pruefe('Und die Gewichtsmarke ist gedaempft, nicht golden',
      /var\(--faint\)/.test(gwMarkeRegel) && !/--gold/.test(gwMarkeRegel), gwMarkeRegel);
  }

  /* --- Schreiben: ein WIRKLICH ZUGESTELLTES change-Ereignis ---------------
     .click() oder ein Aufruf von onchange genuegt nicht (Stolperstein 17):
     ein Fehler in einem Behandler, der nach einem await weiterlaeuft, entsteht
     erst beim echten Ereignis. */
  const gwPuts = () => gwGesendet.filter(z => z.methode === 'PUT' && /^\/api\/criteria\/\d+$/.test(z.url));
  const gwSchreib = async (feld, text) => {
    const vorher = gwPuts().length;
    feld.value = text;
    feld.dispatchEvent(new gwSys.w.Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    return { neu: gwPuts().length - vorher, letzter: gwPuts().pop() };
  };

  const gwKomma = await gwSchreib(gwFelder()[1], '1,2');
  pruefe('Ein change-Ereignis am Feld loest den Schreibweg aus', gwKomma.neu === 1,
    `${gwKomma.neu} Aufrufe`);
  pruefe('Deutsches Komma kommt als Zahl 1.2 am Server an',
    gwKomma.letzter?.koerper?.gewicht === 1.2, JSON.stringify(gwKomma.letzter?.koerper));
  /* Ein eingefuegter Wert aus einer Tabelle kann "1.2" heissen und soll nicht
     scheitern. Gelesen wird beides, geschrieben wird immer mit Komma. */
  const gwPunkt = await gwSchreib(gwFelder()[1], '1.8');
  pruefe('Ein Punkt statt des Kommas wird ebenso gelesen',
    gwPunkt.letzter?.koerper?.gewicht === 1.8, JSON.stringify(gwPunkt.letzter?.koerper));
  pruefe('Und das Feld zeigt danach wieder ein Komma',
    gwFelder()[1].value === '1,8', JSON.stringify(gwFelder()[1].value));

  /* GERUNDET, ABER NICHT STILL: 1,234 und 1,23 sind dieselbe Aussage -- das
     Feld zeigt danach, was gespeichert wurde. */
  const gwRund = await gwSchreib(gwFelder()[1], '1,234');
  pruefe('Feiner als ein Hundertstel geht so hinaus, wie es getippt wurde',
    gwRund.letzter?.koerper?.gewicht === 1.234, JSON.stringify(gwRund.letzter?.koerper));
  pruefe('Und das Feld zeigt danach den gespeicherten Wert 1,23',
    gwFelder()[1].value === '1,23', JSON.stringify(gwFelder()[1].value));

  /* EIN LEERES FELD IST KEINE NULL. Number('') ergibt 0, und ohne die Klemme
     davor liefe ein geloeschtes Feld in eine Absage "muss zwischen 0,2 und 2
     sein", die niemand verlangt hat. */
  const gwLeer = await gwSchreib(gwFelder()[1], '   ');
  pruefe('Ein leeres Feld schickt gar nichts', gwLeer.neu === 0, `${gwLeer.neu} Aufrufe`);
  pruefe('Und der alte Wert kehrt ins Feld zurueck',
    gwFelder()[1].value === '1,23', JSON.stringify(gwFelder()[1].value));
  const gwText = await gwSchreib(gwFelder()[1], 'abc');
  pruefe('Unlesbarer Text ebenso wenig', gwText.neu === 0 && gwFelder()[1].value === '1,23',
    `${gwText.neu} Aufrufe, Feld ${JSON.stringify(gwFelder()[1].value)}`);

  /* Eine Absage vom Server setzt das Feld zurueck: kein Wert im Feld, der
     nicht gespeichert ist. */
  const gwAbsage = await gwSchreib(gwFelder()[1], '2,5');
  pruefe('Ein Wert ueber der Grenze geht hinaus und wird abgewiesen',
    gwAbsage.neu === 1 && gwAbsage.letzter?.koerper?.gewicht === 2.5,
    JSON.stringify(gwAbsage.letzter?.koerper));
  pruefe('Und das Feld steht danach wieder auf dem gespeicherten Wert',
    gwFelder()[1].value === '1,23', JSON.stringify(gwFelder()[1].value));

  /* NACH EINEM GEWICHTSWECHSEL WIRD DIE LISTE NICHT NEU GEZEICHNET. Geprueft
     ueber die Knotengleichheit: ein refresh() baute die Zeilen neu auf, und
     der alte Knoten haenge dann nicht mehr im Dokument. */
  const gwKnoten = gwFelder()[1];
  await gwSchreib(gwKnoten, '1,4');
  pruefe('Die Liste wird nach einem Gewichtswechsel nicht neu gezeichnet',
    gwKnoten === gwFelder()[1] && gwKnoten.isConnected, 'die Zeile wurde ersetzt');
  pruefe('Die Zeile traegt trotzdem den neuen Wert',
    gwFelder()[1].value === '1,4', JSON.stringify(gwFelder()[1].value));
  /* Und das ist der Grund dafuer: ein offenes Umbenennen an derselben Zeile
     ueberlebt den Gewichtswechsel daneben. Ein refresh() risse es weg. */
  const gwReihe = gwSDoc.querySelectorAll('#mcrits .mrow')[1];
  gwReihe.querySelector('.ed').dispatchEvent(new gwSys.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  pruefe('Ein Umbenennen laesst sich oeffnen', !!gwReihe.querySelector('input.medit'));
  const gwUmbenennFeld = gwReihe.querySelector('input.medit');
  gwUmbenennFeld.value = 'Halb getippt';
  await gwSchreib(gwReihe.querySelector('.mgew-feld'), '1,1');
  pruefe('Ein offenes Umbenennen ueberlebt den Gewichtswechsel daneben',
    gwReihe.querySelector('input.medit') === gwUmbenennFeld &&
    gwUmbenennFeld.value === 'Halb getippt' && gwUmbenennFeld.isConnected,
    gwReihe.innerHTML.slice(0, 160));
  /* Das Umbenennen schickt kein Gewicht mit -- sonst setzte jedes ✎ die
     Gewichtung auf den Stand des Feldes zurueck, auch wenn niemand es
     angefasst hat. */
  const gwVorUmbenennen = gwPuts().length;
  gwUmbenennFeld.value = 'Neuer Name';
  gwUmbenennFeld.dispatchEvent(new gwSys.w.Event('blur', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  const gwUmbenennRuf = gwPuts()[gwPuts().length - 1];
  pruefe('Das Umbenennen schickt nur den Namen, kein Gewicht',
    gwPuts().length > gwVorUmbenennen && gwUmbenennRuf?.koerper?.gewicht === undefined,
    JSON.stringify(gwUmbenennRuf?.koerper));

  /* Fallstrick 1 aus dem Konzept: die Kriterienzeile ist ziehbar, und die
     Ausnahmeliste von makeSortable lautet '.mact, input'. Ein <input> ist
     damit ausgenommen -- nachgestellt statt geglaubt, mit echten
     Zeigerereignissen. */
  await gwSys.w.renderSystem();
  await new Promise(r => setTimeout(r, 20));
  const gwZeilen = [...gwSDoc.querySelectorAll('#mcrits .mrow')];
  gwSDoc.elementFromPoint = () => gwZeilen[2];
  const gwZeiger = (art, y) => {
    const e = new gwSys.w.Event(art, { bubbles: true });
    Object.defineProperty(e, 'clientX', { value: 0 });
    Object.defineProperty(e, 'clientY', { value: y });
    return e;
  };
  const gwVorSortieren = gwGesendet.filter(z => z.url === '/api/criteria/order').length;
  gwZeilen[0].querySelector('.mgew-feld').dispatchEvent(gwZeiger('pointerdown', 0));
  gwSDoc.dispatchEvent(gwZeiger('pointermove', 120));
  gwSDoc.dispatchEvent(gwZeiger('pointerup', 120));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Am Gewichtsfeld beginnt kein Ziehen',
    gwGesendet.filter(z => z.url === '/api/criteria/order').length === gwVorSortieren,
    'die Zeile wurde umsortiert');
  /* Die Gegenprobe daneben, sonst belegte die Zeile darueber auch dann etwas,
     wenn das Ziehen ueberhaupt nicht mehr ginge (Stolperstein 81). */
  gwZeilen[0].dispatchEvent(gwZeiger('pointerdown', 0));
  gwSDoc.dispatchEvent(gwZeiger('pointermove', 120));
  gwSDoc.dispatchEvent(gwZeiger('pointerup', 120));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Am Rest der Zeile beginnt es sehr wohl',
    gwGesendet.filter(z => z.url === '/api/criteria/order').length > gwVorSortieren,
    'das Ziehen geht gar nicht mehr');
  gwSys.w.close();

  /* Wer nicht verwalten darf, sieht das Gewicht als Text statt als Feld -- es
     erklaert die Kopfzahl an jedem Eintrag, und die sieht er ja auch. */
  /* istEigentuemer MUSS hier mit auf false: die Rollen sind eine LEITER, ein
     Eigentuemer ohne Adminrecht kann es gar nicht geben. Bliebe das Feld auf
     seiner Vorgabe, baute die Prueflage eine Lage nach, die der Server nie
     ausliefert. */
  const gwNurLesen = baueDom(JSDOM, { hash: '',
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: false, istEigentuemer: false } });
  await new Promise(r => setTimeout(r, 80));
  await gwNurLesen.w.renderSystem();
  await new Promise(r => setTimeout(r, 20));
  const gwNDoc = gwNurLesen.w.document;
  pruefe('Ohne Adminrecht steht kein Eingabefeld da',
    gwNDoc.querySelectorAll('#mcrits .mgew-feld').length === 0);
  pruefe('Das Gewicht selbst steht trotzdem an der Zeile',
    gleich([...gwNDoc.querySelectorAll('#mcrits .mgew-fest')].map(z => z.textContent),
           ['×1,5', '×1', '×0,5']),
    JSON.stringify([...gwNDoc.querySelectorAll('#mcrits .mgew-fest')].map(z => z.textContent)));
  gwNurLesen.w.close();

  /* ---------------------------------------------------------------- */
  gruppe('Der Umschalter der Vergleichsansicht');

  /* Der Vergleich wird ueber den ECHTEN WEG erreicht: zwei Karten auswaehlen,
     dann die Leiste druecken. state.compare haengt nicht am window
     (Stolperstein 23), und eine Abkuerzung dorthin pruefte einen Weg, den es
     nicht gibt.

     Die Prueflage ist so gebaut, dass sich JEDE der drei Zahlen unterscheidet
     -- Kriterienwert, Kopfzahl und Testtagzeile. Waeren sie in beiden
     Stellungen gleich, bliebe jede Pruefung gruen, gleich was der Umschalter
     tut. Der zweite Eintrag traegt eigene Werte ueber dem Schnitt und einen
     Schnitt ueber mehr Stimmen; der erste traegt dieselbe Zahl in beiden
     Stellungen und ist damit die Gegenprobe im Bestand selbst: ein Umschalter,
     der einfach alles anders faerbt, faellt hier auf.
       Eintrag 1: eigene 3 / 3 / 3,  Schnitt 3,4 / 4,1 / -,  Kopf 3,0 | 3,0
       Eintrag 2: eigene 5 / 4 / -,   Schnitt 2,0 / 3,0 / -,  Kopf 4,5 | 2,5
       Testtage:  eigene 1 | 0,       ueber alle 1 | 3
     Am dritten Kriterium des ersten Eintrags steht ein eigener Wert OHNE
     Schnitt ueber alle -- dieselbe Zeile traegt also je nach Stellung "3 / 5"
     oder "–". Schaerfer laesst sich nicht belegen, dass zwei verschiedene
     Felder gelesen werden. */
  const vChefin2 = { id: 1, name: 'chefin', geloescht: false };
  const vBert2 = { id: 2, name: 'bert', geloescht: false };
  const zweit = {
    id: 2, title: 'Zweites', description: '', rejected: false, tested: false,
    favorite: false, category: null, verfasser: vBert2,
    photos: [], links: [], comments: [], attachments: [], tags: [],
    testDays: [
      { id: 11, day: '2026-08-05', rating: 5, mine: false, verfasser: vBert2, tags: [] },
      { id: 12, day: '2026-08-06', rating: 4, mine: false, verfasser: vBert2, tags: [] },
      { id: 13, day: '2026-08-07', rating: 3, mine: false, verfasser: vBert2, tags: [] }
    ],
    /* Die Gewichte stehen wie im Mock: 1,5 · 1 · 0,5. Damit ist die
       Kopfzahl der Stellung "meine" gewichtet 4,6 und ungewichtet 4,5 -- die
       Prueflage unterscheidet die beiden Formeln also wirklich. */
    ratings: [
      { criterion_id: 7, name: 'Zuerst', value: 5, gewicht: 1.5, avg: 2, count: 3 },
      { criterion_id: 8, name: 'Dann', value: 4, gewicht: 1, avg: 3, count: 2 },
      { criterion_id: 9, name: 'Zuletzt', value: 0, gewicht: 0.5, avg: null, count: 0 }
    ],
    avgRating: 2.5, testCount: 3, testAvg: 4, testLast: 3
  };
  const zweiKarten = [
    { id: 1, title: 'Beispiel', rejected: false, tested: true, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 3, testCount: 1,
      testAvg: 4, testLast: 4, updated_at: '2026-08-02 10:00:00', searchText: 'beispiel' },
    { id: 2, title: 'Zweites', rejected: false, tested: false, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 2.5, testCount: 3,
      testAvg: 4, testLast: 3, updated_at: '2026-08-01 10:00:00', searchText: 'zweites' }
  ];
  const oeffneVergleich = async (benutzerZahl) => {
    const dom = baueDom(JSDOM, { hash: '', uebersichtItems: zweiKarten, zweiterEintrag: zweit,
      einstellungen: { filters: null, benutzerZahl } });
    const w = dom.w;
    await new Promise(r => setTimeout(r, 80));
    // Der echte Weg: beide Haken setzen, dann die Leiste druecken.
    [...w.document.querySelectorAll('.pick-box')].forEach(k =>
      k.dispatchEvent(new w.MouseEvent('click', { bubbles: true })));
    await new Promise(r => setTimeout(r, 40));
    const leiste = w.document.querySelector('.cmp-bar .btn');
    if (leiste) leiste.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 120));
    return { dom, w };
  };

  const { dom: vglDom, w: wVgl } = await oeffneVergleich(3);
  pruefe('Zwei Karten ausgewaehlt fuehren in den Vergleich',
    !!wVgl.document.getElementById('cg') &&
    wVgl.document.querySelectorAll('.cmp-col').length === 2,
    `${wVgl.document.querySelectorAll('.cmp-col').length} Spalten`);

  const cmpSpalte = (n) => wVgl.document.querySelectorAll('.cmp-col')[n];
  const cmpZeilen = (n) => [...cmpSpalte(n).querySelectorAll('.cmp-crit')]
    .map(z => z.lastElementChild.textContent.trim());
  const cmpKopf = (n) => cmpSpalte(n).querySelector('.cmp-schnitt').textContent.trim();
  const cmpBeste = (n) => [...cmpSpalte(n).querySelectorAll('.cmp-crit')]
    .map(z => !!z.querySelector('.cmp-best'));
  const cmpSicht = (wert) => wVgl.document.querySelector(`#cmp-sicht [data-sicht="${wert}"]`);

  pruefe('Der Umschalter steht da und traegt beide Stellungen',
    !!cmpSicht('meine') && !!cmpSicht('alle'), 'ein Knopf fehlt');
  /* VORGABESTELLUNG "alle" -- der Vergleich fragt, wie die Dinge zueinander
     stehen, und das beantwortet der Schnitt ueber alle. */
  pruefe('Vorgabestellung ist „alle"',
    cmpSicht('alle').classList.contains('on') &&
    !cmpSicht('meine').classList.contains('on'),
    `${cmpSicht('meine').className} | ${cmpSicht('alle').className}`);
  pruefe('In Stellung „alle" zeigen die Zeilen den Schnitt ueber alle',
    gleich(cmpZeilen(0), ['3,4 / 5', '4,1 / 5', '–', '1']) &&
    gleich(cmpZeilen(1), ['2 / 5', '3 / 5', '–', '3']),
    JSON.stringify([cmpZeilen(0), cmpZeilen(1)]));
  pruefe('Und die Kopfzeile denselben Schnitt',
    gleich([cmpKopf(0), cmpKopf(1)], ['★ 3,0 Durchschnitt', '★ 2,5 Durchschnitt']),
    JSON.stringify([cmpKopf(0), cmpKopf(1)]));
  pruefe('Der beste Wert je Kriterium ist hervorgehoben',
    gleich(cmpBeste(0), [true, true, false, false]) &&
    gleich(cmpBeste(1), [false, false, false, true]),
    JSON.stringify([cmpBeste(0), cmpBeste(1)]));

  /* Ein wirklich zugestellter Druck, kein Behandleraufruf (Stolperstein 61). */
  cmpSicht('meine').dispatchEvent(new wVgl.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Ein Druck schaltet auf „meine" um',
    cmpSicht('meine').classList.contains('on') &&
    !cmpSicht('alle').classList.contains('on'),
    `${cmpSicht('meine').className} | ${cmpSicht('alle').className}`);
  /* Das dritte Kriterium ist der schaerfste Beleg: am ersten Eintrag steht
     dort ein EIGENER Wert von 3, waehrend der Schnitt ueber alle leer ist.
     Dieselbe Zeile zeigt in der einen Stellung "–" und in der anderen "3 / 5"
     -- eine Ansicht, die einfach beide Male dasselbe Feld laese, koennte das
     nicht. */
  pruefe('Jetzt stehen in den Zeilen die eigenen Werte',
    gleich(cmpZeilen(0), ['3 / 5', '3 / 5', '3 / 5', '1']) &&
    gleich(cmpZeilen(1), ['5 / 5', '4 / 5', '–', '–']),
    JSON.stringify([cmpZeilen(0), cmpZeilen(1)]));
  /* DIE KOPFZEILE SCHALTET MIT -- sonst waere es derselbe Widerspruch mit
     einem Knopf davor: eigene Werte in den Zeilen, der Schnitt darueber.
     4,6 ist der GEWICHTETE Mittelwert aus 5 (x1,5) und 4 (x1), im Klienten
     gebildet und genau einmal gerundet: 11,5 / 2,5. */
  /* ZWEI Pruefungen, nicht eine: die erste faellt, wenn die Kopfzeile
     ueberhaupt nicht mitschaltet, die zweite auch dann, wenn sie mitschaltet
     und dabei falsch rechnet. Stuende hier nur die zweite, machten beide
     Rueckbauten dieselbe Punktliste rot -- und dann pruefen sie dieselbe Sache
     (Stolperstein 72). */
  pruefe('Und die Kopfzeile schaltet mit',
    cmpKopf(1) !== '★ 2,5 Durchschnitt', cmpKopf(1));
  pruefe('Sie zeigt das Mittel der eigenen Werte, ohne die Nullen',
    gleich([cmpKopf(0), cmpKopf(1)], ['★ 3,0 Durchschnitt', '★ 4,6 Durchschnitt']),
    JSON.stringify([cmpKopf(0), cmpKopf(1)]));
  /* DIE ZWEITE RECHENSTELLE IST EBENSO GEWICHTET WIE DIE ERSTE. Bliebe sie
     ungewichtet, stuende hier 4,5 -- und der Umschalter zeigte zwei Zahlen
     nach zwei verschiedenen Formeln. Niemand koennte dann sagen, ob ein
     Unterschied von der anderen Bewertermenge kommt oder von der fehlenden
     Gewichtung.
     Die eigene Rechnung steht danebengeschrieben: eine fest hingetippte 4,6
     belegte nur, dass jemand einmal 4,6 getippt hat. */
  const cmpUngewichtet = (5 + 4) / 2;
  const cmpGewichtet = Math.round(((5 * 1.5 + 4 * 1) / (1.5 + 1)) * 10) / 10;
  pruefe('Die eigene Zahl ist gewichtet, nicht das flache Mittel',
    cmpKopf(1) === `★ ${cmpGewichtet.toFixed(1).replace('.', ',')} Durchschnitt` &&
    cmpGewichtet !== cmpUngewichtet,
    `${cmpKopf(1)} — gewichtet ${cmpGewichtet}, ungewichtet ${cmpUngewichtet}`);
  /* Der Nenner zaehlt nur die Kriterien, die ICH bewertet habe. "Zuletzt"
     traegt Gewicht 0,5 und keinen eigenen Wert; kaeme es in den Nenner,
     stuende hier 11,5 / 3 = 3,8 -- die eigene Zahl laege unter der ueber alle,
     ohne dass es an den Werten laege. */
  pruefe('Ein Kriterium ohne eigenen Wert bringt sein Gewicht nicht in den Nenner',
    cmpKopf(1) !== '★ 3,8 Durchschnitt', cmpKopf(1));
  /* Die Marke am Kriterium: ×1,5 und ×0,5 stehen an ihren Zeilen, an der Zeile
     mit Gewicht 1 steht nichts. Ableitung, kein Schalter. */
  const cmpMarken = [...cmpSpalte(0).querySelectorAll('.cmp-crit .cn')]
    .map(z => z.querySelector('.cgew')?.textContent || '');
  pruefe('Das Gewicht steht an der Zeilenbeschriftung, und nur bei Abweichung',
    gleich(cmpMarken, ['×1,5', '', '×0,5', '']), JSON.stringify(cmpMarken));
  /* Einmal je Zeile, nicht je Spalte: das Gewicht gehoert dem Kriterium, und
     die Spalten sind die Eintraege. */
  pruefe('Und in der zweiten Spalte steht dieselbe Marke noch einmal',
    gleich([...cmpSpalte(1).querySelectorAll('.cmp-crit .cn')]
      .map(z => z.querySelector('.cgew')?.textContent || ''), ['×1,5', '', '×0,5', '']));
  // Die Testtagzeile ebenso, gezaehlt ueber mine.
  pruefe('Die Testtagzeile schaltet mit, gezaehlt ueber mine',
    cmpZeilen(0)[3] === '1' && cmpZeilen(1)[3] === '–',
    JSON.stringify([cmpZeilen(0)[3], cmpZeilen(1)[3]]));
  pruefe('Und die Hervorhebung wandert mit',
    gleich(cmpBeste(0), [false, false, true, true]) &&
    gleich(cmpBeste(1), [true, true, false, false]),
    JSON.stringify([cmpBeste(0), cmpBeste(1)]));
  pruefe('Die Zeile darueber sagt, was gezeigt wird',
    /eigenen Werte/.test(wVgl.document.getElementById('cmp-hint').textContent),
    wVgl.document.getElementById('cmp-hint').textContent);

  /* ANSICHTSZUSTAND, KEINE EINSTELLUNG: der Umschalter schreibt nichts an den
     Server. Ginge er dorthin, waere er eine zweite Wahrheit ueber dieselben
     Daten und stuende beim naechsten Aufruf noch immer so.
     AUSGENOMMEN IST DER MERKZEITPUNKT: die Prueflage kommt aus der Uebersicht,
     und wer sie verlaesst, schickt seit 0.8.60 genau ein PUT auf /api/settings
     mit `zuletztGesehen`. Die Ausnahme ist eng gefasst und wird DANEBEN
     belegt -- ohne die zweite Zeile koennte sie stillschweigend alles
     durchlassen und die erste bliebe gruen, was immer geschickt wuerde
     (Stolperstein 81). */
  const vglPuts = vglDom.gesendet.filter(g => g.methode === 'PUT' && g.url === '/api/settings');
  pruefe('Der Umschalter schreibt nichts an den Server',
    !vglPuts.some(g => !(g.koerper && g.koerper.zuletztGesehen !== undefined)),
    JSON.stringify(vglPuts.map(g => g.koerper)));
  pruefe('Und was dorthin ging, war ausschliesslich der Merkzeitpunkt',
    vglPuts.length === 1 && gleich(Object.keys(vglPuts[0].koerper || {}), ['zuletztGesehen']),
    JSON.stringify(vglPuts.map(g => g.koerper)));

  cmpSicht('alle').dispatchEvent(new wVgl.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Und zurueck geht es auch',
    cmpSicht('alle').classList.contains('on') && cmpZeilen(1)[0] === '2 / 5',
    JSON.stringify(cmpZeilen(1)));
  wVgl.close();

  /* Bei genau einem Zugang erscheint er nicht -- beide Stellungen waeren
     dieselbe Zahl, und ein Knopf ohne Wirkung sieht aus wie ein Fehler. */
  const { w: wEiner } = await oeffneVergleich(1);
  pruefe('Bei genau einem Zugang steht der Vergleich trotzdem',
    wEiner.document.querySelectorAll('.cmp-col').length === 2,
    `${wEiner.document.querySelectorAll('.cmp-col').length} Spalten`);
  pruefe('Aber der Umschalter erscheint gar nicht erst',
    !wEiner.document.getElementById('cmp-sicht'), 'der Umschalter steht da');
  pruefe('Und die Zeile darueber sagt nichts von einer Sicht',
    !/eigenen Werte|ueber alle|über alle/.test(
      wEiner.document.getElementById('cmp-hint').textContent),
    wEiner.document.getElementById('cmp-hint').textContent);
  wEiner.close();
}
