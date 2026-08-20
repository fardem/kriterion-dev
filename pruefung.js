/* Kriterion — Pruefstand
 *
 * Prueft die Kriterienverwaltung (umbenennen, sortieren, Wirkung auf
 * Detailansicht, Vergleich und Export) und die mitwachsenden Textfelder.
 *
 *   node pruefung.js
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
let bestanden = 0, gescheitert = 0, uebersprungen = 0;
const gruppe = (name) => console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 58 - name.length))}`);
function pruefe(name, bedingung, hinweis = '') {
  if (bedingung) { bestanden++; console.log(`  ✓ ${name}`); }
  else { gescheitert++; console.log(`  ✗ ${name}${hinweis ? `\n      ${hinweis}` : ''}`); }
}
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

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
// eigenem Keks. Gebraucht fuer alle Prueflagen, die eine eigene Anlage
// brauchen: frische Einrichtung, Rechte mit mehreren Zugaengen, Sperren.
function starteWeiterenServer(datenVerzeichnis, zusatz, portBasis) {
  const port = portBasis + Math.floor(Math.random() * 60);
  const basis = `http://127.0.0.1:${port}`;
  let protokoll = '', keksB = '';
  const umgebung = { ...process.env, PORT: String(port), DATA_DIR: datenVerzeichnis, ENCRYPTION_KEY: KEY };
  delete umgebung.AUTH_RESET;
  Object.assign(umgebung, zusatz);
  const kindB = spawn(process.execPath, ['server.js'], { cwd: __dirname, env: umgebung });
  kindB.stdout.on('data', d => { protokoll += d; });
  kindB.stderr.on('data', d => { protokoll += d; });
  const rufB = async (methode, pfad, koerper) => {
    const opt = { method: methode, headers: {} };
    if (keksB) opt.headers.cookie = keksB;
    if (koerper !== undefined) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(koerper); }
    const a = await fetch(basis + pfad, opt);
    const setz = a.headers.get('set-cookie');
    if (setz) keksB = setz.split(';')[0];
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
           keksLoeschen: () => { keksB = ''; },
           stopp: () => new Promise(r => { kindB.on('exit', r); kindB.kill(); }) };
}

let keks = '';
async function ruf(methode, pfad, koerper) {
  const opt = { method: methode, headers: {} };
  if (keks) opt.headers.cookie = keks;
  if (koerper !== undefined) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(koerper); }
  const a = await fetch(BASIS + pfad, opt);
  const setz = a.headers.get('set-cookie');
  if (setz) keks = setz.split(';')[0];
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
  const frischKrit = frischDb.prepare('SELECT name, sort_order FROM rating_criteria ORDER BY sort_order, id').all();
  pruefe('Grundausstattung wird angelegt', frischKrit.length === 3, JSON.stringify(frischKrit));
  pruefe('Grundausstattung ist durchnummeriert', gleich(frischKrit.map(c => c.sort_order), [0, 1, 2]));
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
  keks = '';
  const anmeldung = await ruf('POST', '/api/login', { user: NUTZER, password: PASSWORT });
  pruefe('Anmeldung gelingt', anmeldung.status === 200 && keks.startsWith('kriterion_session='));
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
  // sie hingehoeren: der Keksname eine Zeile weiter oben in der Anmeldung, die
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
  const expAntwort = await fetch(`${BASIS}/api/export?photos=0`, { headers: { cookie: keks } });
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
  pruefe('Der Export nennt Suchtexte im Rohzustand',
    lkAus.links.includes('Handbuch 3000') && lkAus.links.includes('https://beispiel.de'),
    JSON.stringify(lkAus.links));
  await ruf('DELETE', `/api/items/${lk.id}`);

  const lkImp = await sendeImport({ version: 5, title: 'L', items: [{ title: 'Eingespielte Links',
    links: ['https://alt.example/pfad', 'beispiel.de', 'Ein Suchtext', '', '  '] }] }, 'merge');
  pruefe('Import mit gemischten Zeilen gelingt', lkImp.status === 200);
  const lkNeu = (await ruf('GET', '/api/items')).inhalt.find(i => i.title === 'Eingespielte Links');
  const lkNeuD = (await ruf('GET', `/api/items/${lkNeu.id}`)).inhalt;
  pruefe('Eingespielte Adresse bleibt unverändert',
    lkNeuD.links[0].url === 'https://alt.example/pfad', JSON.stringify(lkNeuD.links.map(l => l.url)));
  pruefe('Eingespielte Adresse ohne Schema bekommt eins',
    lkNeuD.links[1].url === 'https://beispiel.de');
  pruefe('Eingespielter Suchtext bleibt roh', lkNeuD.links[2].url === 'Ein Suchtext');
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
    function durchlauf(keks) {
      const req = { headers: { cookie: keks } };
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
      ohneKeks: durchlauf(''),
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
  pruefe('Ohne Keks bleibt es bei 401', mw.ohneKeks.stand === 401, JSON.stringify(mw.ohneKeks));
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
  const pRuf = async (keksName, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${keksName}` } };
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
    rufe.length === 24 && rufe.every(a => /,\s*req\.benutzer\.id\s*$/.test(a)),
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
  // in eine Zeichenkette ein zweites Mal maskiert und ist dann falsch, ohne dass
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
  const dSoll = ['bloecke', 'filters', 'linkZeilen', 'schrift', 'suchNamen', 'zeitleiste'];
  pruefe('server.js kennt genau die sechs persoenlichen Schluessel',
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
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run('keks-d-eins', 1);
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run('keks-d-zwei', 2);
    d.close();
    return dir;
  }
  const dDir = legeZweiBenutzerAn();
  const D1 = starteWeiterenServer(dDir, {}, 5200);
  await D1.bereit;
  // Zwei echte Kekse nebeneinander, ohne den gemeinsamen Keksspeicher von
  // starteWeiterenServer zu benutzen -- sonst ueberschriebe der zweite den
  // ersten und es gaebe wieder nur einen Rufer.
  const dRuf = async (keksWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${keksWert}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(D1.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };

  await dRuf('keks-d-eins', 'PUT', '/api/settings',
    { schrift: 120, linkZeilen: 12, zeitleiste: false, suchNamen: 4 });
  await dRuf('keks-d-zwei', 'PUT', '/api/settings',
    { schrift: 80, linkZeilen: 3, suchNamen: 1 });
  await dRuf('keks-d-eins', 'PUT', '/api/settings', { filters: { tested: 'yes' } });
  await dRuf('keks-d-zwei', 'PUT', '/api/settings', { filters: { tested: 'no' } });
  const dEins = (await dRuf('keks-d-eins', 'GET', '/api/settings')).inhalt;
  const dZwei = (await dRuf('keks-d-zwei', 'GET', '/api/settings')).inhalt;

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

  // Und die Blockanordnung, die eine eigene Bauform hat (verschachteltes
  // Objekt statt Zahl) und deshalb eigens geprueft wird.
  await dRuf('keks-d-eins', 'PUT', '/api/settings',
    { bloecke: { seite: ['bewertung', 'tags', 'kategorie'], unten: [], zu: ['links'] } });
  const dBlEins = (await dRuf('keks-d-eins', 'GET', '/api/settings')).inhalt.bloecke;
  const dBlZwei = (await dRuf('keks-d-zwei', 'GET', '/api/settings')).inhalt.bloecke;
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
  await dRuf('keks-d-eins', 'PUT', '/api/settings', { sucheAktiv: ['ddg', 'bing'] });
  await dRuf('keks-d-eins', 'PUT', '/api/settings',
    { vokabular: { sacheEinzahl: 'Maschine' } });
  const dGlobEins = (await dRuf('keks-d-eins', 'GET', '/api/settings')).inhalt;
  const dGlobZwei = (await dRuf('keks-d-zwei', 'GET', '/api/settings')).inhalt;
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
  pruefe('Alle sechs stehen beim Benutzer, der sie gesetzt hat',
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
  pruefe('Die beiden Benutzer teilen sich keine Zeile',
    dDb.prepare('SELECT COUNT(*) n FROM user_settings WHERE user_id = 2').get().n === 4,
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
    for (const [t, u] of [['keks-e-eins', 1], ['keks-e-zwei', 2], ['keks-e-drei', 3]])
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
  // Drei echte Kekse nebeneinander, am gemeinsamen Keksspeicher vorbei.
  const eRuf = async (keksWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${keksWert}` } };
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

  const eEins = (await eRuf('keks-e-eins', 'GET', '/api/items/1')).inhalt;
  const eZwei = (await eRuf('keks-e-zwei', 'GET', '/api/items/1')).inhalt;
  const eDrei = (await eRuf('keks-e-drei', 'GET', '/api/items/1')).inhalt;

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
  const eListe = (await eRuf('keks-e-eins', 'GET', '/api/items')).inhalt;
  pruefe('Die Uebersicht rechnet mit demselben Ergebnis',
    eListe?.find(i => i.id === 1)?.avgRating === 3.7,
    JSON.stringify(eListe?.map(i => `${i.id}:${i.avgRating}`)));

  /* Der Verwendungszaehler in der Verwaltungskarte. Optik hat VIER Zeilen an
     ZWEI Eintraegen -- die Oberflaeche beschriftet die Zahl mit dem Wort fuer
     Eintraege, also muessen es zwei sein. Mit COUNT(*) stuende dort vier. */
  const eKrit = (await eRuf('keks-e-eins', 'GET', '/api/criteria')).inhalt;
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
  const eStellE = (await eRuf('keks-e-eins', 'GET', '/api/settings')).inhalt;
  const eStellZ = (await eRuf('keks-e-zwei', 'GET', '/api/settings')).inhalt;
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
  const eVorher = (await eRuf('keks-e-eins', 'GET', '/api/criteria')).inhalt;
  const eNeinAnlegen = await eRuf('keks-e-zwei', 'POST', '/api/criteria', { name: 'Heimlich' });
  const eNeinUmbenennen = await eRuf('keks-e-zwei', 'PUT', `/api/criteria/${eVorher[0].id}`, { name: 'Umgetauft' });
  const eNeinLoeschen = await eRuf('keks-e-zwei', 'DELETE', `/api/criteria/${eVorher[0].id}`);
  const eNeinSortieren = await eRuf('keks-e-zwei', 'PUT', '/api/criteria/order',
    { order: [...eVorher].reverse().map(c => c.id) });
  pruefe('Ein Benutzer legt kein Kriterium an', eNeinAnlegen.status === 403,
    `Status ${eNeinAnlegen.status}`);
  pruefe('Ein Benutzer benennt kein Kriterium um', eNeinUmbenennen.status === 403,
    `Status ${eNeinUmbenennen.status}`);
  pruefe('Ein Benutzer loescht kein Kriterium', eNeinLoeschen.status === 403,
    `Status ${eNeinLoeschen.status}`);
  pruefe('Ein Benutzer sortiert die Kriterien nicht um', eNeinSortieren.status === 403,
    `Status ${eNeinSortieren.status}`);
  const eNachher = (await eRuf('keks-e-eins', 'GET', '/api/criteria')).inhalt;
  pruefe('Und die vier Absagen haben nichts veraendert',
    gleich(eNachher.map(c => c.name), eVorher.map(c => c.name)),
    JSON.stringify(eNachher.map(c => c.name)));

  const eJaAnlegen = await eRuf('keks-e-eins', 'POST', '/api/criteria', { name: 'Verpackung' });
  const eJaUmbenennen = await eRuf('keks-e-eins', 'PUT', `/api/criteria/${eVorher[3].id}`, { name: 'Kundendienst' });
  pruefe('Der Admin legt an und benennt um',
    eJaAnlegen.status === 201 && eJaUmbenennen.status === 200,
    `Status ${eJaAnlegen.status} / ${eJaUmbenennen.status}`);
  const eJaLoeschen = await eRuf('keks-e-eins', 'DELETE', `/api/criteria/${eJaAnlegen.inhalt.id}`);
  pruefe('Und loescht wieder', eJaLoeschen.status === 204, `Status ${eJaLoeschen.status}`);

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
    for (const [t, u] of [['keks-e2-anna', 1], ['keks-e2-bert', 2], ['keks-e2-carla', 3]])
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
    // Anna markiert den zweiten Eintrag als Favorit -- fuer die Probe, dass
    // der Favorit NICHT mitwandert, sondern beim Exportierenden bleibt.
    d.prepare('INSERT INTO item_pins (user_id, item_id) VALUES (1, 2)').run();
    d.close();
    return dir;
  }

  const e2Dir = legeVerfasserBestandAn();
  const SE2 = starteWeiterenServer(e2Dir, {}, 5620);
  await SE2.bereit;

  const e2Ruf = async (keksWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${keksWert}` } };
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
  // Hauptserver und an dessen Keks, hier braucht es drei nebeneinander.
  const e2Import = async (keksWert, objekt, modus) => {
    const grenze = '----pruefunge2' + crypto.randomBytes(6).toString('hex');
    const teil = (name, wert, dateiname) =>
      `--${grenze}\r\nContent-Disposition: form-data; name="${name}"` +
      (dateiname ? `; filename="${dateiname}"\r\nContent-Type: application/json` : '') +
      `\r\n\r\n${wert}\r\n`;
    const koerper = teil('mode', modus) + teil('file', JSON.stringify(objekt), 'export.json') + `--${grenze}--\r\n`;
    const a = await fetch(SE2.basis + '/api/import', {
      method: 'POST',
      headers: { cookie: `kriterion_session=${keksWert}`, 'content-type': `multipart/form-data; boundary=${grenze}` },
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
    d.close();
  }

  /* --- Der Export nennt die Verfasser --- */
  const e2Aus = (await e2Ruf('keks-e2-anna', 'GET', '/api/export?photos=0')).inhalt;
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
  pruefe('Die Formatnummer der Datei steht auf 6', e2Aus?.version === 6, JSON.stringify(e2Aus?.version));
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
  const e2Rund = await e2Import('keks-e2-anna', e2Aus, 'replace');
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
  const e2Fremd = await e2Import('keks-e2-anna', { version: 6, title: 'F', items: [{
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
  const e2Alt = await e2Import('keks-e2-anna', { version: 5, title: 'A', items: [{
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

  await SE2.stopp();
  fs.rmSync(e2Dir, { recursive: true, force: true });

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
    for (const [t, u] of [['keks-f-anna', 1], ['keks-f-bert', 2], ['keks-f-carla', 3]])
      d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(t, u);
    d.prepare('INSERT INTO items (title, user_id) VALUES (?, 1)').run('Von Anna');
    d.prepare('INSERT INTO items (title, user_id) VALUES (?, 2)').run('Von Bert');
    d.prepare('INSERT INTO items (title, user_id) VALUES (?, 1)').run('Herrenlos');
    // An Berts Eintrag haengt alles, was ein Fremder anfassen koennte.
    d.prepare("INSERT INTO photos (item_id, mime_type, data, sort_order) VALUES (2, 'image/jpeg', ?, 0)")
      .run(Buffer.from('kein echtes Bild, wird nur geloescht'));
    d.prepare("INSERT INTO attachments (item_id, filename, mime_type, size, data) VALUES (2, 'zettel.txt', 'text/plain', 5, ?)")
      .run(Buffer.from('hallo'));
    d.prepare("INSERT INTO links (item_id, url, sort_order) VALUES (2, 'https://beispiel.test', 0)").run();
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

  const fRuf = async (keksWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${keksWert}` } };
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(F.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
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

  const fFremdTitel = await fRuf('keks-f-carla', 'PUT', '/api/items/2', { title: 'Gekapert' });
  pruefe('Ein Fremder benennt einen Eintrag nicht um', fFremdTitel.status === 403,
    `Status ${fFremdTitel.status}`);
  pruefe('Und der Titel steht unveraendert da', fTitel(2) === 'Von Bert', fTitel(2));
  pruefe('Die Absage nennt den Grund',
    /angelegt hat/.test(fFremdTitel.inhalt?.error || ''), fFremdTitel.inhalt?.error);

  const fEigenTitel = await fRuf('keks-f-bert', 'PUT', '/api/items/2', { description: 'von bert selbst' });
  pruefe('Der Verfasser aendert seinen eigenen Eintrag', fEigenTitel.status === 200,
    `Status ${fEigenTitel.status}`);
  const fAdminTitel = await fRuf('keks-f-anna', 'PUT', '/api/items/2', { description: 'vom Admin berichtigt' });
  pruefe('Der Admin aendert auch einen fremden Eintrag', fAdminTitel.status === 200,
    `Status ${fAdminTitel.status}`);

  /* Die Ausnahme, und sie ist der Kern dieser Route: der Favorit ist
     persoenlich. Zur Gegenprobe gehoeren BEIDE Richtungen -- Klemme ganz weg
     macht die Verweigerung oben rot und laesst diese hier gruen, Klemme ueber
     die ganze Route genau umgekehrt. */
  const fFavor = await fRuf('keks-f-carla', 'PUT', '/api/items/2', { favorite: true });
  pruefe('Ein Fremder setzt seinen eigenen Favoriten an einem fremden Eintrag',
    fFavor.status === 200, `Status ${fFavor.status}`);
  pruefe('Und der Favorit steht bei ihm, nicht beim Verfasser',
    gleich(fZeilen('SELECT user_id, item_id FROM item_pins').map(z => `${z.user_id}/${z.item_id}`), ['3/2']),
    JSON.stringify(fZeilen('SELECT user_id, item_id FROM item_pins')));

  /* Beides in einem Ruf: die Absage muss kommen, BEVOR der Favorit
     geschrieben ist. Sonst waere ein abgelehnter Ruf halb ausgefuehrt. */
  const fBeides = await fRuf('keks-f-carla', 'PUT', '/api/items/2', { favorite: false, title: 'Gekapert' });
  pruefe('Favorit und Titel zusammen werden abgewiesen', fBeides.status === 403,
    `Status ${fBeides.status}`);
  pruefe('Und der Favorit ist dabei NICHT mit weggeraeumt worden',
    fZeilen('SELECT 1 FROM item_pins WHERE user_id = 3 AND item_id = 2').length === 1,
    JSON.stringify(fZeilen('SELECT user_id, item_id FROM item_pins')));

  const fLoeschFremd = await fRuf('keks-f-carla', 'DELETE', '/api/items/2');
  pruefe('Ein Fremder loescht keinen Eintrag', fLoeschFremd.status === 403, `Status ${fLoeschFremd.status}`);
  pruefe('Und der Eintrag steht noch', fTitel(2) === 'Von Bert', fTitel(2));

  const fTagAn = await fRuf('keks-f-carla', 'POST', '/api/items/2/tags', { name: 'Fremdtag' });
  const fTagWeg = await fRuf('keks-f-carla', 'DELETE', `/api/items/2/tags/${fMarkeId}`);
  pruefe('Ein Fremder haengt keinen Tag an einen fremden Eintrag', fTagAn.status === 403,
    `Status ${fTagAn.status}`);
  pruefe('Und nimmt auch keinen weg', fTagWeg.status === 403, `Status ${fTagWeg.status}`);
  pruefe('Die Tags am Eintrag sind unveraendert',
    gleich(fZeilen('SELECT tag_id FROM item_tags WHERE item_id = 2').map(z => z.tag_id), [fMarkeId]),
    JSON.stringify(fZeilen('SELECT tag_id FROM item_tags WHERE item_id = 2')));

  const fLink = await fRuf('keks-f-carla', 'POST', '/api/items/2/links', { url: 'https://fremd.test' });
  pruefe('Ein Fremder haengt keinen Link an einen fremden Eintrag', fLink.status === 403,
    `Status ${fLink.status}`);
  pruefe('Und die Linkliste ist unveraendert',
    fZeilen('SELECT id FROM links WHERE item_id = 2').length === 1);
  const fLinkWeg = await fRuf('keks-f-carla', 'DELETE', '/api/links/1');
  pruefe('Ein Fremder loescht keinen Link', fLinkWeg.status === 403, `Status ${fLinkWeg.status}`);
  pruefe('Und der Link steht noch', fZeilen('SELECT id FROM links WHERE id = 1').length === 1);
  const fLinkAdmin = await fRuf('keks-f-anna', 'DELETE', '/api/links/1');
  pruefe('Der Admin loescht einen fremden Link', fLinkAdmin.status === 204, `Status ${fLinkAdmin.status}`);

  const fFokus = await fRuf('keks-f-carla', 'PUT', '/api/photos/1/focus', { x: 10, y: 10 });
  const fFotoOrder = await fRuf('keks-f-carla', 'PUT', '/api/items/2/photo-order', { order: [1] });
  const fFotoWeg = await fRuf('keks-f-carla', 'DELETE', '/api/photos/1');
  pruefe('Ein Fremder verschiebt keinen Fokuspunkt', fFokus.status === 403, `Status ${fFokus.status}`);
  pruefe('Ein Fremder sortiert fremde Fotos nicht um', fFotoOrder.status === 403, `Status ${fFotoOrder.status}`);
  pruefe('Ein Fremder loescht kein fremdes Foto', fFotoWeg.status === 403, `Status ${fFotoWeg.status}`);
  pruefe('Das Foto steht noch, mit unveraendertem Fokuspunkt',
    gleich(fZeilen('SELECT focus_x, focus_y FROM photos WHERE id = 1'), [{ focus_x: 50, focus_y: 50 }]),
    JSON.stringify(fZeilen('SELECT focus_x, focus_y FROM photos')));

  const fDateiWeg = await fRuf('keks-f-carla', 'DELETE', '/api/attachments/1');
  pruefe('Ein Fremder loescht keine fremde Datei', fDateiWeg.status === 403, `Status ${fDateiWeg.status}`);
  pruefe('Und die Datei liegt noch da', fZeilen('SELECT id FROM attachments').length === 1);
  const fDateiAdmin = await fRuf('keks-f-anna', 'DELETE', '/api/attachments/1');
  pruefe('Der Admin loescht eine fremde Datei', fDateiAdmin.status === 200, `Status ${fDateiAdmin.status}`);

  /* Eine herrenlose Zeile gehoert dem Admin. Ohne die Klemme auf null waere
     sie fuer jeden offen -- und genau solche Zeilen entstehen, wenn ein
     Zugang samt Beitraegen geloescht wird. */
  const fHerrenlosFremd = await fRuf('keks-f-carla', 'PUT', '/api/items/3', { title: 'Genommen' });
  pruefe('Eine herrenlose Zeile gehoert nicht jedem', fHerrenlosFremd.status === 403,
    `Status ${fHerrenlosFremd.status}`);
  const fHerrenlosAdmin = await fRuf('keks-f-anna', 'PUT', '/api/items/3', { title: 'Vom Admin' });
  pruefe('Aber dem Admin', fHerrenlosAdmin.status === 200 && fTitel(3) === 'Vom Admin',
    `Status ${fHerrenlosAdmin.status} / ${fTitel(3)}`);

  /* ---------------------------------------------------------------- */
  gruppe('Rechte an Kommentaren');

  const fText = (id) => fEine('SELECT text, pinned FROM comments WHERE id = ?', id);

  const fTextFremd = await fRuf('keks-f-carla', 'PUT', '/api/comments/1', { text: 'umgeschrieben' });
  pruefe('Ein Fremder aendert keinen fremden Kommentartext', fTextFremd.status === 403,
    `Status ${fTextFremd.status}`);
  /* Die schaerfste Zeile der ganzen Schicht: AUCH DER ADMIN NICHT. Loeschen
     ja, umschreiben nein -- eine fremde Aussage unter fremdem Namen zu
     veraendern ist die Art Funktion, die man spaeter bereut. */
  const fTextAdmin = await fRuf('keks-f-anna', 'PUT', '/api/comments/1', { text: 'vom Admin umgeschrieben' });
  pruefe('Und der Admin aendert ihn auch nicht', fTextAdmin.status === 403,
    `Status ${fTextAdmin.status}`);
  pruefe('Der Kommentartext steht unveraendert da', fText(1)?.text === 'Berts Kommentar', fText(1)?.text);
  const fTextEigen = await fRuf('keks-f-bert', 'PUT', '/api/comments/1', { text: 'Berts Kommentar, berichtigt' });
  pruefe('Der Verfasser aendert seinen eigenen Text',
    fTextEigen.status === 200 && fText(1)?.text === 'Berts Kommentar, berichtigt', fText(1)?.text);

  /* Die Merkmale dagegen darf der Admin: die Anpinnung wirkt auf die
     Sortierung fuer ALLE (pinned DESC steht ganz vorn), aendert keine Aussage
     und ist umkehrbar. */
  const fPinAdmin = await fRuf('keks-f-anna', 'PUT', '/api/comments/1', { pinned: 1 });
  pruefe('Der Admin pinnt einen fremden Kommentar an',
    fPinAdmin.status === 200 && fText(1)?.pinned === 1, `Status ${fPinAdmin.status} / ${fText(1)?.pinned}`);
  const fPinFremd = await fRuf('keks-f-carla', 'PUT', '/api/comments/1', { pinned: 0 });
  pruefe('Ein Fremder pinnt nicht an und nicht ab', fPinFremd.status === 403, `Status ${fPinFremd.status}`);
  const fArtFremd = await fRuf('keks-f-carla', 'PUT', '/api/comments/1', { kind: 'report' });
  pruefe('Und aendert auch die Art nicht', fArtFremd.status === 403, `Status ${fArtFremd.status}`);
  pruefe('Die Anpinnung steht noch, wie der Admin sie gesetzt hat', fText(1)?.pinned === 1);

  /* Text und Merkmal in einem Ruf: die Absage muss kommen, bevor irgendetwas
     geschrieben ist -- sonst haette der Admin die Anpinnung durchgebracht und
     nur der Text waere abgewiesen worden. */
  const fBeidesK = await fRuf('keks-f-anna', 'PUT', '/api/comments/1',
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

  const fBildAdmin = await fRuf('keks-f-anna', 'POST', '/api/comments/1/images', {});
  pruefe('Der Admin haengt kein Bild an einen fremden Kommentar', fBildAdmin.status === 403,
    `Status ${fBildAdmin.status}`);
  /* ANHAENGEN IST BEARBEITEN -- und weil der Admin gar nicht anhaengen darf,
     ist auch sein abgewiesener Versuch keine. Weder das eine noch das andere. */
  pruefe('Und sein abgewiesener Versuch aendert an beidem nichts',
    fVermerk() === 0 && fBearbeitet() === null, JSON.stringify([fVermerk(), fBearbeitet()]));

  const fBildEigenWeg = await fRuf('keks-f-bert', 'DELETE', '/api/comment-images/2');
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
  const fBildFremdWeg = await fRuf('keks-f-carla', 'DELETE', '/api/comment-images/1');
  pruefe('Ein Fremder loescht kein Bild aus einem fremden Kommentar', fBildFremdWeg.status === 403,
    `Status ${fBildFremdWeg.status}`);
  pruefe('Und das Bild ist noch da', fZeilen('SELECT id FROM comment_images').length === 1);
  pruefe('Ein abgewiesener Eingriff vermerkt auch nichts',
    fVermerk() === 0, `images_removed = ${fVermerk()}`);
  pruefe('Und gilt erst recht nicht als Bearbeitung',
    fBearbeitet() === null, `updated_at = ${fBearbeitet()}`);

  const fBildAdminWeg = await fRuf('keks-f-anna', 'DELETE', '/api/comment-images/1');
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
  const fMineBert = (await fRuf('keks-f-bert', 'GET', '/api/items/2')).inhalt.comments;
  const fMineAnna = (await fRuf('keks-f-anna', 'GET', '/api/items/2')).inhalt.comments;
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

  const fKomWeg = await fRuf('keks-f-carla', 'DELETE', '/api/comments/1');
  pruefe('Ein Fremder loescht keinen fremden Kommentar', fKomWeg.status === 403, `Status ${fKomWeg.status}`);
  pruefe('Und der Kommentar steht noch', fZeilen('SELECT id FROM comments WHERE id = 1').length === 1);
  const fKomAdmin = await fRuf('keks-f-anna', 'DELETE', '/api/comments/1');
  pruefe('Der Admin loescht einen fremden Kommentar',
    fKomAdmin.status === 204 && fZeilen('SELECT id FROM comments WHERE id = 1').length === 0,
    `Status ${fKomAdmin.status}`);
  const fKomNeu = await fRuf('keks-f-carla', 'POST', '/api/items/2/comments', { text: 'Carla sagt etwas' });
  pruefe('Aber schreiben darf jeder an jedem Eintrag', fKomNeu.status === 201, `Status ${fKomNeu.status}`);

  /* ---------------------------------------------------------------- */
  gruppe('Rechte an Testtagen und Bewertungen');

  const fTagNeu = await fRuf('keks-f-carla', 'POST', '/api/items/2/test-days',
    { day: '2024-05-05', rating: 2 });
  pruefe('Jeder traegt seinen eigenen Testtag ein, auch am fremden Eintrag',
    fTagNeu.status === 201, `Status ${fTagNeu.status}`);
  pruefe('Und das bleiben zwei Zeilen am selben Datum',
    fZeilen('SELECT id FROM test_days WHERE item_id = 2').length === 2);

  const fNoteFremd = await fRuf('keks-f-carla', 'PUT', '/api/test-days/1', { rating: 1 });
  pruefe('Ein Fremder aendert die Note eines fremden Testtags nicht', fNoteFremd.status === 403,
    `Status ${fNoteFremd.status}`);
  /* Auch der Admin nicht: die Note IST die Aussage dieser Zeile, genau wie
     eine Bewertung. Loeschen ja, umschreiben nein. */
  const fNoteAdmin = await fRuf('keks-f-anna', 'PUT', '/api/test-days/1', { rating: 1 });
  pruefe('Und der Admin auch nicht', fNoteAdmin.status === 403, `Status ${fNoteAdmin.status}`);
  pruefe('Die Note steht unveraendert', fEine('SELECT rating FROM test_days WHERE id = 1')?.rating === 4,
    JSON.stringify(fEine('SELECT rating FROM test_days WHERE id = 1')));
  const fNoteEigen = await fRuf('keks-f-bert', 'PUT', '/api/test-days/1', { rating: 3 });
  pruefe('Der Verfasser aendert seine eigene Note',
    fNoteEigen.status === 200 && fEine('SELECT rating FROM test_days WHERE id = 1')?.rating === 3,
    `Status ${fNoteEigen.status}`);

  const fTtagAn = await fRuf('keks-f-anna', 'POST', '/api/test-days/1/tags', { name: 'Regen' });
  pruefe('Auch der Admin haengt keinen Tag an einen fremden Testtag', fTtagAn.status === 403,
    `Status ${fTtagAn.status}`);
  const fTtagEigen = await fRuf('keks-f-bert', 'POST', '/api/test-days/1/tags', { name: 'Regen' });
  pruefe('Der Verfasser tut es', fTtagEigen.status === 201, `Status ${fTtagEigen.status}`);
  const fRegenId = fEine('SELECT id FROM tags WHERE name = ?', 'Regen')?.id;
  const fTtagWeg = await fRuf('keks-f-carla', 'DELETE', `/api/test-days/1/tags/${fRegenId}`);
  pruefe('Und ein Fremder nimmt ihn nicht wieder weg', fTtagWeg.status === 403, `Status ${fTtagWeg.status}`);
  pruefe('Der Tag haengt noch am Testtag',
    fZeilen('SELECT tag_id FROM test_day_tags WHERE test_day_id = 1').length === 1);

  const fTtagLoeschFremd = await fRuf('keks-f-carla', 'DELETE', '/api/test-days/1');
  pruefe('Ein Fremder loescht keinen fremden Testtag', fTtagLoeschFremd.status === 403,
    `Status ${fTtagLoeschFremd.status}`);
  pruefe('Und der Testtag steht noch', fZeilen('SELECT id FROM test_days WHERE id = 1').length === 1);
  /* Loeschen darf der Admin -- der Unterschied zum Aendern ist die ganze
     Regel, und er wird hier in zwei aufeinanderfolgenden Rufen belegt. */
  const fTtagLoeschAdmin = await fRuf('keks-f-anna', 'DELETE', '/api/test-days/1');
  pruefe('Der Admin loescht einen fremden Testtag',
    fTtagLoeschAdmin.status === 200 && fZeilen('SELECT id FROM test_days WHERE id = 1').length === 0,
    `Status ${fTtagLoeschAdmin.status}`);

  const fBew = await fRuf('keks-f-carla', 'PUT', '/api/items/2/ratings', { criterionId: fOptikId, value: 2 });
  pruefe('Jeder bewertet fuer sich, auch an einem fremden Eintrag', fBew.status === 200,
    `Status ${fBew.status}`);
  pruefe('Und das sind zwei Zeilen zum selben Kriterium',
    gleich(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = 2 ORDER BY user_id')
      .map(z => `${z.user_id}/${z.value}`), ['2/5', '3/2']),
    JSON.stringify(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = 2')));
  await fRuf('keks-f-carla', 'DELETE', '/api/items/2/ratings');
  pruefe('Zuruecksetzen trifft nur die eigenen Zeilen -- ohne jeden Waechter',
    gleich(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = 2')
      .map(z => `${z.user_id}/${z.value}`), ['2/5']),
    JSON.stringify(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = 2')));

  /* ---------------------------------------------------------------- */
  gruppe('Rechte in der Verwaltung');

  const fTitelFremd = await fRuf('keks-f-bert', 'PUT', '/api/titles',
    { publicTitle: 'Gekapert', appTitle: 'Gekapert' });
  pruefe('Ein Benutzer aendert die Titel nicht', fTitelFremd.status === 403, `Status ${fTitelFremd.status}`);
  pruefe('Die Absage nennt den Admin',
    /Admin/.test(fTitelFremd.inhalt?.error || ''), fTitelFremd.inhalt?.error);
  const fTitelAdmin = await fRuf('keks-f-anna', 'PUT', '/api/titles',
    { publicTitle: 'Kriterion', appTitle: 'Prüfstand' });
  pruefe('Der Admin aendert sie', fTitelAdmin.status === 200, `Status ${fTitelAdmin.status}`);

  const fTagUm = await fRuf('keks-f-bert', 'PUT', `/api/tags/${fMarkeId}`, { name: 'Umbenannt' });
  const fTagLoesch = await fRuf('keks-f-bert', 'DELETE', `/api/tags/${fMarkeId}`);
  pruefe('Ein Benutzer benennt keinen Tag um', fTagUm.status === 403, `Status ${fTagUm.status}`);
  pruefe('Und loescht keinen', fTagLoesch.status === 403, `Status ${fTagLoesch.status}`);
  pruefe('Der Tag heisst noch, wie er hiess',
    fEine('SELECT name FROM tags WHERE id = ?', fMarkeId)?.name === 'Marke',
    JSON.stringify(fEine('SELECT name FROM tags WHERE id = ?', fMarkeId)));

  const fKatNeu = await fRuf('keks-f-bert', 'POST', '/api/product-categories', { name: 'Werkzeug' });
  pruefe('Eine Kategorie anlegen darf weiterhin jeder', fKatNeu.status === 201, `Status ${fKatNeu.status}`);
  const fKatUm = await fRuf('keks-f-bert', 'PUT', `/api/product-categories/${fKatNeu.inhalt?.id}`,
    { name: 'Umbenannt' });
  const fKatLoesch = await fRuf('keks-f-bert', 'DELETE', `/api/product-categories/${fKatNeu.inhalt?.id}`);
  pruefe('Umbenennen und Loeschen aber nicht',
    fKatUm.status === 403 && fKatLoesch.status === 403,
    `Status ${fKatUm.status} / ${fKatLoesch.status}`);
  pruefe('Die Kategorie steht unveraendert da',
    fEine('SELECT name FROM product_categories WHERE id = ?', fKatNeu.inhalt?.id)?.name === 'Werkzeug');

  const fEigen = await fRuf('keks-f-bert', 'PUT', '/api/settings', { schrift: 110 });
  pruefe('Seine persoenlichen Einstellungen schreibt jeder selbst',
    fEigen.status === 200 && fEigen.inhalt?.schrift === 110, JSON.stringify(fEigen.inhalt?.schrift));
  const fVokabel = await fRuf('keks-f-bert', 'PUT', '/api/settings',
    { vokabular: { sacheEinzahl: 'Ding' } });
  pruefe('Das Vokabular aendert er nicht', fVokabel.status === 403, `Status ${fVokabel.status}`);
  const fAnbieter = await fRuf('keks-f-bert', 'PUT', '/api/settings', { sucheAktiv: ['ddg'] });
  pruefe('Und den Suchanbietervorrat auch nicht', fAnbieter.status === 403, `Status ${fAnbieter.status}`);
  pruefe('Das Vokabular steht unveraendert',
    (await fRuf('keks-f-anna', 'GET', '/api/settings')).inhalt?.vokabular?.sacheEinzahl === 'Eintrag');
  /* Gemischt: die persoenliche Haelfte darf NICHT geschrieben sein, wenn die
     globale abgewiesen wird. Deshalb steht die Frage vor dem ersten Schreiben. */
  const fGemischt = await fRuf('keks-f-bert', 'PUT', '/api/settings',
    { schrift: 80, vokabular: { sacheEinzahl: 'Ding' } });
  pruefe('Persoenlich und global zusammen wird abgewiesen', fGemischt.status === 403,
    `Status ${fGemischt.status}`);
  pruefe('Und die persoenliche Haelfte ist dabei NICHT geschrieben worden',
    (await fRuf('keks-f-bert', 'GET', '/api/settings')).inhalt?.schrift === 110,
    JSON.stringify((await fRuf('keks-f-bert', 'GET', '/api/settings')).inhalt?.schrift));
  const fVokabelAdmin = await fRuf('keks-f-anna', 'PUT', '/api/settings',
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
  const fCarlaRolle = await fRuf('keks-f-carla', 'GET', '/api/settings');
  pruefe('Carla ist jetzt Admin, aber nicht Eigentuemerin',
    fCarlaRolle.inhalt?.istAdmin === true && fCarlaRolle.inhalt?.istEigentuemer === false,
    JSON.stringify([fCarlaRolle.inhalt?.istAdmin, fCarlaRolle.inhalt?.istEigentuemer]));
  const fAnnaRolle = await fRuf('keks-f-anna', 'GET', '/api/settings');
  pruefe('Anna ist beides',
    fAnnaRolle.inhalt?.istAdmin === true && fAnnaRolle.inhalt?.istEigentuemer === true,
    JSON.stringify([fAnnaRolle.inhalt?.istAdmin, fAnnaRolle.inhalt?.istEigentuemer]));
  pruefe('Und bert ist keines von beiden',
    (await fRuf('keks-f-bert', 'GET', '/api/settings')).inhalt?.istEigentuemer === false);

  const fExportBert = await fRuf('keks-f-bert', 'GET', '/api/export?photos=0');
  pruefe('Ein Benutzer exportiert nicht', fExportBert.status === 403, `Status ${fExportBert.status}`);
  const fExportCarla = await fRuf('keks-f-carla', 'GET', '/api/export?photos=0');
  pruefe('Und ein Admin ohne Eigentuemerrecht auch nicht', fExportCarla.status === 403,
    `Status ${fExportCarla.status}`);
  pruefe('Die Absage nennt den Eigentuemer',
    /Eigentümer/.test(fExportCarla.inhalt?.error || ''), fExportCarla.inhalt?.error);
  const fExportAnna = await fRuf('keks-f-anna', 'GET', '/api/export?photos=0');
  pruefe('Die Eigentuemerin exportiert',
    fExportAnna.status === 200 && Array.isArray(fExportAnna.inhalt?.items),
    `Status ${fExportAnna.status}`);

  /* Der Import: eine Exportdatei kann unter FREMDEM NAMEN
     schreiben. Beide Modi liegen dahinter, nicht nur "ersetzen". */
  const fImport = async (keksWert, objekt, modus) => {
    const grenze = '----pruefungf' + crypto.randomBytes(6).toString('hex');
    const teil = (name, wert, dateiname) =>
      `--${grenze}\r\nContent-Disposition: form-data; name="${name}"` +
      (dateiname ? `; filename="${dateiname}"\r\nContent-Type: application/json` : '') +
      `\r\n\r\n${wert}\r\n`;
    const koerper = teil('mode', modus) + teil('file', JSON.stringify(objekt), 'export.json') + `--${grenze}--\r\n`;
    const a = await fetch(F.basis + '/api/import', {
      method: 'POST',
      headers: { cookie: `kriterion_session=${keksWert}`, 'content-type': `multipart/form-data; boundary=${grenze}` },
      body: koerper
    });
    return { status: a.status, inhalt: await a.json().catch(() => null) };
  };
  const fFremdeDatei = { version: 6, title: 'F', items: [{
    title: 'Untergeschoben', author: 'bert',
    comments: [{ text: 'das hat bert nie geschrieben', author: 'bert' }] }] };
  const fEintragZahl = () => fZeilen('SELECT id FROM items').length;
  const fVorImport = fEintragZahl();

  const fImportBert = await fImport('keks-f-bert', fFremdeDatei, 'merge');
  pruefe('Ein Benutzer spielt nichts ein', fImportBert.status === 403, `Status ${fImportBert.status}`);
  const fImportCarla = await fImport('keks-f-carla', fFremdeDatei, 'merge');
  pruefe('Und ein Admin ohne Eigentuemerrecht auch nicht', fImportCarla.status === 403,
    `Status ${fImportCarla.status}`);
  const fErsetzenCarla = await fImport('keks-f-carla', fFremdeDatei, 'replace');
  pruefe('Auch nicht ersetzend', fErsetzenCarla.status === 403, `Status ${fErsetzenCarla.status}`);
  pruefe('Und der Bestand ist dabei unberuehrt geblieben', fEintragZahl() === fVorImport,
    `${fEintragZahl()} statt ${fVorImport}`);
  pruefe('Es steht kein untergeschobener Beitrag unter fremdem Namen da',
    fZeilen('SELECT id FROM comments WHERE text = ?', 'das hat bert nie geschrieben').length === 0);
  const fImportAnna = await fImport('keks-f-anna', fFremdeDatei, 'merge');
  pruefe('Die Eigentuemerin spielt ein',
    fImportAnna.status === 200 && fEintragZahl() === fVorImport + 1,
    `Status ${fImportAnna.status} / ${fEintragZahl()}`);

  const fStatsBert = await fRuf('keks-f-bert', 'GET', '/api/stats');
  const fStatsCarla = await fRuf('keks-f-carla', 'GET', '/api/stats');
  const fStatsAnna = await fRuf('keks-f-anna', 'GET', '/api/stats');
  // Der Schluessel liegt in dieser Prueflage als Datei neben der Datenbank --
  // nur dann gibt es ueberhaupt etwas auszuliefern.
  pruefe('Der Schluesselwert steht ueberhaupt zur Verfuegung',
    fStatsAnna.inhalt?.keyFromEnv === false && typeof fStatsAnna.inhalt?.keyHex === 'string',
    JSON.stringify([fStatsAnna.inhalt?.keyFromEnv, typeof fStatsAnna.inhalt?.keyHex]));
  pruefe('Aber nur die Eigentuemerin bekommt ihn',
    fStatsBert.inhalt?.keyHex === null && fStatsCarla.inhalt?.keyHex === null,
    JSON.stringify([fStatsBert.inhalt?.keyHex, fStatsCarla.inhalt?.keyHex]));
  pruefe('Die Kennzahlen selbst sieht weiterhin jeder',
    fStatsBert.status === 200 && typeof fStatsBert.inhalt?.itemCount === 'number',
    `Status ${fStatsBert.status}`);

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
  const fVId = (await fRuf('keks-f-bert', 'POST', '/api/items', { title: 'Zum Loeschen' })).inhalt.id;
  await fRuf('keks-f-bert', 'POST', `/api/items/${fVId}/comments`, { text: 'Kommentar von bert' });
  await fRuf('keks-f-bert', 'POST', `/api/items/${fVId}/test-days`, { day: '2024-06-01', rating: 3 });
  await fRuf('keks-f-bert', 'PUT', `/api/items/${fVId}/ratings`, { criterionId: fOptikId, value: 4 });
  await fRuf('keks-f-anna', 'POST', `/api/items/${fVId}/comments`, { text: 'Kommentar von anna' });
  await fRuf('keks-f-anna', 'POST', `/api/items/${fVId}/test-days`, { day: '2024-06-02', rating: 5 });
  await fRuf('keks-f-anna', 'PUT', `/api/items/${fVId}/ratings`, { criterionId: fOptikId, value: 2 });
  // Carla setzt ihre wieder zurueck: die Zeile bleibt mit 0 stehen und ist
  // KEINE Stimme -- weder in der Liste noch in der Zahl des Dialogs.
  await fRuf('keks-f-carla', 'PUT', `/api/items/${fVId}/ratings`, { criterionId: fOptikId, value: 5 });
  await fRuf('keks-f-carla', 'PUT', `/api/items/${fVId}/ratings`, { criterionId: fOptikId, value: 0 });
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
    d.prepare("INSERT INTO sessions (token, user_id) VALUES ('keks-f-dirk', ?)").run(dirkId);
    d.close();
  }

  const fVEintrag = (await fRuf('keks-f-bert', 'GET', `/api/items/${fVId}`)).inhalt;
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
  pruefe('Je Kriterium steht, wer welchen Wert vergeben hat',
    gleich((fVOptik?.stimmen || []).map(s => `${s.verfasser?.name}/${s.wert}`), ['bert/4', 'anna/2']),
    JSON.stringify(fVOptik?.stimmen));
  /* Die Bedingung value > 0 an genau dieser Stelle: carla hat bewertet und
     zurueckgesetzt, ihre Zeile steht mit 0 in der Tabelle. Sie ist keine
     Stimme -- dieselbe Regel wie beim Schnitt und beim Verwendungszaehler. */
  pruefe('Eine zurueckgesetzte Bewertung ist keine Stimme',
    !(fVOptik?.stimmen || []).some(s => s.verfasser?.name === 'carla') &&
    fZeilen('SELECT value FROM ratings WHERE item_id = ? AND user_id = 3', fVId)[0]?.value === 0,
    JSON.stringify(fZeilen('SELECT user_id, value FROM ratings WHERE item_id = ?', fVId)));
  pruefe('Die eigene Stimme ist als solche gekennzeichnet',
    gleich((fVOptik?.stimmen || []).map(s => s.mine), [true, false]),
    JSON.stringify((fVOptik?.stimmen || []).map(s => s.mine)));
  // Ohne die id gaebe es vom Bildschirm aus keinen Weg zu einer einzelnen
  // fremden Bewertung -- der Endpunkt darunter waere unerreichbar.
  pruefe('Jede Stimme nennt ihre Nummer',
    (fVOptik?.stimmen || []).every(s => Number.isInteger(s.id)),
    JSON.stringify((fVOptik?.stimmen || []).map(s => s.id)));
  pruefe('Schnitt und Bewerterzahl stehen unveraendert daneben',
    fVOptik?.avg === 3 && fVOptik?.count === 2,
    JSON.stringify([fVOptik?.avg, fVOptik?.count]));

  const fVListe = (await fRuf('keks-f-bert', 'GET', '/api/items')).inhalt;
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
  const fBestand = async (keksWert) =>
    (await fRuf(keksWert, 'GET', `/api/items/${fVId}/bestand`)).inhalt;
  const fBBert = await fBestand('keks-f-bert');
  const fBAnna = await fBestand('keks-f-anna');
  const fBCarla = await fBestand('keks-f-carla');

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
  pruefe('Fotos, Links und Dateien stehen ebenfalls im Dialog',
    fBBert?.fotos === 0 && fBBert?.links === 0 && fBBert?.dateien === 0,
    JSON.stringify(fBBert));

  const fBFremd = await fRuf('keks-f-dirk', 'GET', `/api/items/${fVId}/bestand`);
  pruefe('Wer nicht loeschen darf, bekommt die Zahlen nicht', fBFremd.status === 403,
    `Status ${fBFremd.status}`);
  pruefe('Die Absage nennt den Grund',
    /angelegt hat/.test(fBFremd.inhalt?.error || ''), fBFremd.inhalt?.error);

  /* ---------------------------------------------------------------- */
  gruppe('Eine fremde Bewertung entfernen');

  const fRAnna = fZeilen('SELECT id FROM ratings WHERE item_id = ? AND user_id = 1', fVId)[0]?.id;
  const fRBert = fZeilen('SELECT id FROM ratings WHERE item_id = ? AND user_id = 2', fVId)[0]?.id;
  const fRSteht = (id) => fZeilen('SELECT id FROM ratings WHERE id = ?', id).length === 1;

  const fRDirk = await fRuf('keks-f-dirk', 'DELETE', `/api/ratings/${fRAnna}`);
  pruefe('Ein Fremder entfernt keine fremde Bewertung', fRDirk.status === 403,
    `Status ${fRDirk.status}`);
  pruefe('Und die Zeile steht noch', fRSteht(fRAnna));
  const fRBertFremd = await fRuf('keks-f-bert', 'DELETE', `/api/ratings/${fRAnna}`);
  pruefe('Auch der Verfasser des Eintrags nicht -- die Bewertung ist nicht seine',
    fRBertFremd.status === 403, `Status ${fRBertFremd.status}`);
  pruefe('Auch danach steht sie noch', fRSteht(fRAnna));

  const fREigen = await fRuf('keks-f-bert', 'DELETE', `/api/ratings/${fRBert}`);
  pruefe('Die eigene entfernt jeder', fREigen.status === 200 && !fRSteht(fRBert),
    `Status ${fREigen.status}`);
  /* Der Erfolgsfall daneben, und zwar mit dem Admin OHNE Eigentuemerrecht --
     sonst bliebe die Pruefung auch dann gruen, wenn dort nurEigentuemer
     stuende. */
  const fRAdmin = await fRuf('keks-f-carla', 'DELETE', `/api/ratings/${fRAnna}`);
  pruefe('Der Admin entfernt eine fremde Bewertung',
    fRAdmin.status === 200 && !fRSteht(fRAnna), `Status ${fRAdmin.status}`);
  pruefe('Die Antwort ist der neu gezeichnete Eintrag',
    (fRAdmin.inhalt?.ratings || []).find(r => r.criterion_id === fOptikId)?.stimmen?.length === 0,
    JSON.stringify(fRAdmin.inhalt?.ratings?.find(r => r.criterion_id === fOptikId)));
  const fRWeg = await fRuf('keks-f-carla', 'DELETE', `/api/ratings/${fRAnna}`);
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
     dafuer nichts. Ein Umstiegsblock waere hier Code, der zu 1.0 wieder
     herausmuesste -- eine Ableitung muss gar nicht erst entfernt werden. */
  const fEinstBert = (await fRuf('keks-f-bert', 'GET', '/api/settings')).inhalt;
  pruefe('Beide Schalter stehen in der Antwort und auf an',
    fEinstBert?.tagsFreiAnlegen === true && fEinstBert?.kategorienFreiAnlegen === true,
    JSON.stringify([fEinstBert?.tagsFreiAnlegen, fEinstBert?.kategorienFreiAnlegen]));
  pruefe('Und dafuer steht nichts in der Datenbank -- abgeleitet beim Lesen',
    fSchalter('tagsFreiAnlegen') === undefined && fSchalter('kategorienFreiAnlegen') === undefined,
    JSON.stringify([fSchalter('tagsFreiAnlegen'), fSchalter('kategorienFreiAnlegen')]));

  // Der Erfolgsfall ZUERST, mit eingeschaltetem Schalter: ohne ihn liesse sich
  // nicht sehen, ob der Weg ueberhaupt je offen ist.
  const fTagVorher = fTagZahl();
  const fNeuTagAn = await fRuf('keks-f-bert', 'POST', '/api/items/2/tags', { name: 'Frisch' });
  pruefe('Mit Schalter an legt auch ein gewoehnlicher Benutzer einen Tag an',
    fNeuTagAn.status === 201 && fTagZahl() === fTagVorher + 1,
    `Status ${fNeuTagAn.status}, ${fTagVorher} -> ${fTagZahl()}`);
  const fKatVorher = fKatZahl();
  const fNeuKatAn = await fRuf('keks-f-bert', 'POST', '/api/product-categories', { name: 'Frischkategorie' });
  pruefe('Und ebenso eine Kategorie',
    fNeuKatAn.status === 201 && fKatZahl() === fKatVorher + 1,
    `Status ${fNeuKatAn.status}, ${fKatVorher} -> ${fKatZahl()}`);

  /* Umgelegt wird ueber PUT /api/settings -- keine neue Route. Die
     Adminpruefung dort ist ABGELEITET ("was nicht persoenlich ist, ist
     Adminsache") und muss die beiden neuen Schluessel deshalb von selbst
     greifen. Ein Benutzer kommt nicht daran, und zwar bevor irgendetwas
     geschrieben ist. */
  const fSchalterBert = await fRuf('keks-f-bert', 'PUT', '/api/settings', { tagsFreiAnlegen: false });
  pruefe('Ein Benutzer legt die Schalter nicht um', fSchalterBert.status === 403,
    `Status ${fSchalterBert.status}`);
  pruefe('Die Absage nennt den Admin',
    /Admin/.test(fSchalterBert.inhalt?.error || ''), fSchalterBert.inhalt?.error);
  pruefe('Und in der Datenbank steht danach immer noch nichts',
    fSchalter('tagsFreiAnlegen') === undefined, JSON.stringify(fSchalter('tagsFreiAnlegen')));

  /* Der Admin OHNE Eigentuemerrecht legt sie um -- sonst bliebe die Pruefung
     auch dann gruen, wenn dort nurEigentuemer stuende. */
  const fSchalterAus = await fRuf('keks-f-carla', 'PUT', '/api/settings',
    { tagsFreiAnlegen: false, kategorienFreiAnlegen: false });
  pruefe('Der Admin legt beide Schalter um',
    fSchalterAus.status === 200 && fSchalterAus.inhalt?.tagsFreiAnlegen === false &&
    fSchalterAus.inhalt?.kategorienFreiAnlegen === false,
    JSON.stringify([fSchalterAus.status, fSchalterAus.inhalt?.tagsFreiAnlegen]));
  pruefe('Erst jetzt steht etwas in der Datenbank',
    fSchalter('tagsFreiAnlegen')?.value === 'false', JSON.stringify(fSchalter('tagsFreiAnlegen')));
  pruefe('Und der naechste Abruf liefert dieselbe Stellung',
    (await fRuf('keks-f-bert', 'GET', '/api/settings')).inhalt?.tagsFreiAnlegen === false);

  /* ---- Weg 1: Tags am Eintrag ---- */
  const fTagAus = fTagZahl();
  const fTagNeuAus = await fRuf('keks-f-bert', 'POST', '/api/items/2/tags', { name: 'Verboten' });
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
  const fTagVergeben = await fRuf('keks-f-bert', 'POST', '/api/items/2/tags', { name: 'Frisch' });
  pruefe('Einen VORHANDENEN Tag vergibt er trotzdem',
    fTagVergeben.status === 201 &&
    (fTagVergeben.inhalt?.tags || []).some(t => t.name === 'Frisch'),
    `Status ${fTagVergeben.status}: ${JSON.stringify((fTagVergeben.inhalt?.tags || []).map(t => t.name))}`);
  pruefe('Und dabei entsteht keine zweite Zeile fuer denselben Namen',
    fTagZahl() === fTagAus, `${fTagAus} -> ${fTagZahl()}`);
  // Der Admin kommt weiterhin durch: ihm gehoert das Aufraeumen, und ein
  // Schalter, den er erst umlegen muesste, waere eine Schranke gegen sich selbst.
  const fTagAdmin = await fRuf('keks-f-carla', 'POST', '/api/items/2/tags', { name: 'Vom Admin' });
  pruefe('Der Admin legt auch bei ausgeschaltetem Schalter an',
    fTagAdmin.status === 201 && fTagZahl() === fTagAus + 1,
    `Status ${fTagAdmin.status}, ${fTagAus} -> ${fTagZahl()}`);

  /* ---- Weg 2: Kategorien ---- */
  const fKatAus = fKatZahl();
  const fKatNeuAus = await fRuf('keks-f-bert', 'POST', '/api/product-categories', { name: 'Verbotene' });
  pruefe('Mit Schalter aus legt der Benutzer keine neue Kategorie mehr an',
    fKatNeuAus.status === 403, `Status ${fKatNeuAus.status}`);
  pruefe('Auch hier ist keine Zeile entstanden',
    fKatZahl() === fKatAus &&
    fZeilen('SELECT id FROM product_categories WHERE name = ?', 'Verbotene').length === 0,
    `${fKatAus} -> ${fKatZahl()}`);
  pruefe('Und die Absage sagt es',
    /Neue Kategorien/.test(fKatNeuAus.inhalt?.error || ''), fKatNeuAus.inhalt?.error);
  const fKatVorhanden = await fRuf('keks-f-bert', 'POST', '/api/product-categories',
    { name: 'frischkategorie' });
  pruefe('Eine VORHANDENE Kategorie bekommt er weiterhin -- auch in anderer Schreibweise',
    fKatVorhanden.status === 200 && fKatVorhanden.inhalt?.name === 'Frischkategorie',
    `Status ${fKatVorhanden.status}: ${JSON.stringify(fKatVorhanden.inhalt)}`);
  const fKatAdmin = await fRuf('keks-f-carla', 'POST', '/api/product-categories', { name: 'Vom Admin' });
  pruefe('Der Admin legt auch hier weiterhin an',
    fKatAdmin.status === 201 && fKatZahl() === fKatAus + 1,
    `Status ${fKatAdmin.status}, ${fKatAus} -> ${fKatZahl()}`);

  /* ---- Weg 3: Tags am Testtag ----
     DER SONDERFALL: dort gibt es keine Wolke, die Eingabe ist der einzige
     Zuweisungsweg und bleibt auf dem Bildschirm stehen. Ein unbekannter Name
     faellt deshalb hier durch, mit sprechender Meldung -- und ein bekannter
     kommt weiterhin an. Bert braucht dafuer einen EIGENEN Testtag: an einen
     fremden haengt er ohnehin nichts (nurSelbst). */
  const fTtagNeu = await fRuf('keks-f-bert', 'POST', '/api/items/2/test-days',
    { day: '2024-09-09', rating: 3 });
  const fTtagId = fEine('SELECT id FROM test_days WHERE day = ? AND user_id = 2', '2024-09-09')?.id;
  pruefe('Bert hat einen eigenen Testtag', fTtagNeu.status === 201 && !!fTtagId,
    `Status ${fTtagNeu.status}, id ${fTtagId}`);
  const fTtagVerboten = await fRuf('keks-f-bert', 'POST', `/api/test-days/${fTtagId}/tags`,
    { name: 'Nebel' });
  pruefe('Am eigenen Testtag legt er keinen neuen Tag an',
    fTtagVerboten.status === 403, `Status ${fTtagVerboten.status}`);
  pruefe('Und auch dort entsteht keine Zeile',
    fZeilen('SELECT id FROM tags WHERE name = ?', 'Nebel').length === 0 &&
    fZeilen('SELECT tag_id FROM test_day_tags WHERE test_day_id = ?', fTtagId).length === 0);
  pruefe('Die Meldung ist dieselbe sprechende',
    /Neue Tags/.test(fTtagVerboten.inhalt?.error || ''), fTtagVerboten.inhalt?.error);
  const fTtagBekannt = await fRuf('keks-f-bert', 'POST', `/api/test-days/${fTtagId}/tags`,
    { name: 'Frisch' });
  pruefe('Einen bekannten Namen weist er dem Testtag weiterhin zu',
    fTtagBekannt.status === 201 &&
    fZeilen('SELECT tag_id FROM test_day_tags WHERE test_day_id = ?', fTtagId).length === 1,
    `Status ${fTtagBekannt.status}`);

  /* Und wieder an: der Weg muss sich auch oeffnen lassen, sonst belegte die
     Pruefung nur, dass er zu ist. */
  await fRuf('keks-f-anna', 'PUT', '/api/settings',
    { tagsFreiAnlegen: true, kategorienFreiAnlegen: true });
  const fWiederAn = fTagZahl();
  const fTagWiederAn = await fRuf('keks-f-bert', 'POST', '/api/items/2/tags', { name: 'Wieder frei' });
  pruefe('Umgelegt steht der Weg wieder offen',
    fTagWiederAn.status === 201 && fTagZahl() === fWiederAn + 1,
    `Status ${fTagWiederAn.status}, ${fWiederAn} -> ${fTagZahl()}`);
  pruefe('Und der Schalter steht als wahr in der Datenbank, nicht als Loch',
    fSchalter('tagsFreiAnlegen')?.value === 'true', JSON.stringify(fSchalter('tagsFreiAnlegen')));

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
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run('keks-sb-bert', bertId);
    d.prepare('INSERT INTO sessions (token, user_id) VALUES (?, 1)').run('keks-sb-anna-zwei');
    d.close();
  }
  const sbRuf = async (keksWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: { cookie: `kriterion_session=${keksWert}` } };
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
  const sbKonto = await sbRuf('keks-sb-bert', 'GET', '/api/account');
  pruefe('Der Systembereich nennt den angemeldeten Namen, nicht den ersten',
    sbKonto.inhalt?.username === 'bert', JSON.stringify(sbKonto.inhalt));

  /* Zweite Stelle, die schaerfste: naehme sich aendereZugang() den ersten
     Benutzer, benannte bert hier mit ANNAS Passwort ihren Zugang um, weil
     beides zusammenpasste. Geprueft wird gegen BERTS Zeile, und dessen
     Passwort ist es nicht. */
  const sbFremd = await sbRuf('keks-sb-bert', 'PUT', '/api/account',
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
  const sbWechsel = await sbRuf('keks-sb-anna-zwei', 'PUT', '/api/account',
    { oldPassword: 'annas-langes-wort', username: 'anna', newPassword: 'annas-neues-wort' });
  pruefe('Die Eigentuemerin wechselt ihr Passwort',
    sbWechsel.status === 200 && sbWechsel.inhalt?.passwortGewechselt === true,
    JSON.stringify(sbWechsel.inhalt));
  pruefe('Ihre andere Sitzung faellt',
    sbZeilen('SELECT token FROM sessions WHERE user_id = 1').length === 1,
    JSON.stringify(sbZeilen('SELECT token, user_id FROM sessions')));
  pruefe('Berts Sitzung bleibt bestehen',
    (await sbRuf('keks-sb-bert', 'GET', '/api/account')).status === 200,
    JSON.stringify(sbZeilen('SELECT token, user_id FROM sessions')));

  /* username traegt UNIQUE COLLATE NOCASE. Ohne eine eigene Frage kaeme ab
     dem zweiten Zugang die rohe SQLite-Meldung als 400 heraus. */
  const sbKollision = await sbRuf('keks-sb-anna-zwei', 'PUT', '/api/account',
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
     zusammengesetztes Muster: eine aus einer Zeichenkette gebaute Regel wird
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
    ['PUT',    '/api/photos/:id/focus',          'im Rumpf'],
    ['POST',   '/api/items/:id/attachments',     'nurEintragVerfasser'],
    ['DELETE', '/api/attachments/:id',           'im Rumpf'],
    ['PUT',    '/api/items/:id/photo-order',     'nurEintragVerfasser'],
    ['DELETE', '/api/photos/:id',                'im Rumpf'],
    ['POST',   '/api/items/:id/links',           'nurEintragVerfasser'],
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
    ['POST',   '/api/import',                    'nurEigentuemer']
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

  const fOhneWaechter = [], fOhneKlemme = [], fZuviel = [], fOhneSelbst = [];
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
     es nicht gibt, ist eine leere Zeichenkette, und jede Verneinung darauf
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

  const gRuf = async (keksWert, methode, pfad, koerper) => {
    const opt = { method: methode, headers: {} };
    if (keksWert) opt.headers.cookie = `kriterion_session=${keksWert}`;
    if (koerper !== undefined) {
      opt.headers['content-type'] = 'application/json';
      opt.body = JSON.stringify(koerper);
    }
    const a = await fetch(G.basis + pfad, opt);
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    return { status: a.status, inhalt };
  };
  // Meldet an und gibt den Keks zurueck. Die Anmeldung ist hier kein
  // Beiwerk -- ohne sie gaebe es keine Sitzung mit der richtigen Rolle.
  const gAnmelden = async (name, passwort, adresse) => {
    const kopf = { 'content-type': 'application/json' };
    if (adresse) kopf['x-forwarded-for'] = adresse;
    const a = await fetch(G.basis + '/api/login',
      { method: 'POST', headers: kopf, body: JSON.stringify({ user: name, password: passwort }) });
    let inhalt = null;
    try { inhalt = await a.json(); } catch {}
    const setz = a.headers.get('set-cookie') || '';
    return { status: a.status, inhalt, keks: setz ? setz.split(';')[0].split('=')[1] : null };
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
  const gAnna = (await gAnmelden('anna', 'annas-langes-wort')).keks;

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

  const gBert = (await gAnmelden('bert', 'berts-langes-wort')).keks;
  const gCarla = (await gAnmelden('carla', 'carlas-langes-wort')).keks;
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
  const gCarlaKeks2 = (await gAnmelden('carla', 'carlas-langes-wort')).keks;
  await gRuf(gCarlaKeks2, 'PUT', `/api/users/${gAnnaId}`, { rolle: 'eigentuemer' });
  await gRuf(gCarlaKeks2, 'PUT', `/api/users/${gCarlaId}`, { rolle: 'admin' });
  pruefe('Danach steht die Ausgangslage wieder',
    gRolle('anna') === 'eigentuemer' && gRolle('carla') === 'admin',
    JSON.stringify(gZeilen('SELECT username, role FROM users')));

  /* ---------------------------------------------------------------- */
  gruppe('Gesperrt kommt nicht herein');

  /* ZWEI STELLEN, ZWEI EIGENE GEGENPROBEN: die Anmeldung
     weist einen gesperrten Zugang ab, und requireAuth laesst eine LAUFENDE
     Sitzung nicht weiterlaufen. Ohne die zweite bliebe ein gerade Gesperrter
     bis zum Ablauf seines Kekses drin, also bis zu dreissig Tage. */
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
  const gDora = (await gAnmelden('dora', 'doras-langes-wort')).keks;
  pruefe('Die frische Sitzung des Freigegebenen laeuft',
    (await gRuf(gDora, 'GET', '/api/settings')).status === 200);
  gSchreibe("UPDATE users SET status = 'gesperrt' WHERE id = ?", gDoraId);
  const gLaufend = await gRuf(gDora, 'GET', '/api/settings');
  pruefe('Eine laufende Sitzung eines Gesperrten laeuft nicht weiter',
    gLaufend.status === 401, `Status ${gLaufend.status}`);
  pruefe('Und der Keks ist dabei weggeraeumt worden',
    gZeilen('SELECT token FROM sessions WHERE token = ?', gDora).length === 0);
  gSchreibe("UPDATE users SET status = 'aktiv' WHERE id = ?", gDoraId);

  /* Und das Sperren ueber die Route raeumt sie ebenfalls weg -- das ist die
     erste der beiden Schichten und wirkt sofort. */
  const gDora2 = (await gAnmelden('dora', 'doras-langes-wort')).keks;
  await gRuf(gAnna, 'PUT', `/api/users/${gDoraId}`, { status: 'gesperrt' });
  pruefe('Das Sperren beendet die laufende Sitzung sofort',
    gZeilen('SELECT token FROM sessions WHERE token = ?', gDora2).length === 0,
    JSON.stringify(gZeilen('SELECT user_id FROM sessions')));
  await gRuf(gAnna, 'PUT', `/api/users/${gDoraId}`, { status: 'aktiv' });

  /* Das Passwort zuruecksetzen: der Admin kennt das bisherige nicht. Alle
     Sitzungen des Betroffenen fallen -- wer ein fremdes Passwort neu setzt,
     will den bisherigen Inhaber draussen haben. */
  const gDora3 = (await gAnmelden('dora', 'doras-langes-wort')).keks;
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

  const gBestand = await gRuf(gAnna, 'GET', `/api/users/${gBertId}/bestand`);
  pruefe('Der Loeschdialog bekommt die Zahlen, getrennt nach eigen und fremd',
    gBestand.inhalt?.eintraege === 1 && gBestand.inhalt?.fremdKommentare === 1 &&
    gBestand.inhalt?.kommentare === 1 && gBestand.inhalt?.testtage === 1,
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
  pruefe('Nichts ist dabei herrenlos geworden',
    gZeilen('SELECT COUNT(*) n FROM items WHERE user_id IS NULL')[0]?.n === 0 &&
    gZeilen('SELECT COUNT(*) n FROM comments WHERE user_id IS NULL')[0]?.n === 0 &&
    gZeilen('SELECT COUNT(*) n FROM test_days WHERE user_id IS NULL')[0]?.n === 0);
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
  const gEmilKeks = (await gAnmelden('emil', 'emils-langes-wort')).keks;
  const gEmilItem = (await gRuf(gEmilKeks, 'POST', '/api/items', { title: 'Emils Eintrag' })).inhalt;
  await gRuf(gAnna, 'POST', `/api/items/${gEmilItem.id}/comments`, { text: 'Annas Kommentar bei Emil' });
  await gRuf(gEmilKeks, 'POST', `/api/items/${gAnnaItem.id}/comments`, { text: 'Emils Kommentar bei Anna' });
  const gEmilBestand = (await gRuf(gAnna, 'GET', `/api/users/${gEmilId}/bestand`)).inhalt;
  pruefe('Die Zahlen nennen den fremden Kommentar an seinem Eintrag',
    gEmilBestand?.eintraege === 1 && gEmilBestand?.fremdKommentare === 1 &&
    gEmilBestand?.kommentare === 1, JSON.stringify(gEmilBestand));
  const gAnnaKommentarVorher = gZeilen('SELECT COUNT(*) n FROM comments WHERE item_id = ?',
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
  gruppe('Die Anmeldebremse zaehlt auch den Namen');

  /* Die IP-Bremse sieht verteiltes Raten gegen EINEN Namen nicht: zehn
     Rechner mit je neun Versuchen bleiben unter jeder Schwelle. Deshalb
     zaehlt auch der Name mit.
     DER NAME WIRD NUR VERZOEGERT, NIE GESPERRT -- eine harte Namenssperre
     waere ein Werkzeug gegen fremde Zugaenge.
     Jeder Versuch kommt hier von einer EIGENEN Adresse: sonst zaehlte die
     IP-Bremse mit und es liesse sich nicht unterscheiden, welche der beiden
     gebremst hat. */
  const gVersuch = async (name, adresse) => {
    const t0 = Date.now();
    const a = await gAnmelden(name, 'ganz-sicher-falsch', adresse);
    return { ms: Date.now() - t0, status: a.status };
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
  const gTrotzdem = await gAnmelden('anna', 'annas-langes-wort', '10.0.9.2');
  pruefe('Das richtige Passwort kommt trotz Bremse durch', gTrotzdem.status === 200,
    `Status ${gTrotzdem.status}`);
  pruefe('Und der Zaehler des Namens ist danach zurueckgesetzt',
    (await gVersuch('anna', '10.0.9.3')).ms < 700);

  await G.stopp();
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
     UMSTIEG 0.8.3 — ENTFAELLT MIT 1.0
     Eigener Abschnitt nach der Bauregel: was mit dem Umstiegscode
     verschwindet, steht beieinander und traegt dieselbe Marke.
     ================================================================ */
  gruppe('UMSTIEG 0.8.3 — ENTFAELLT MIT 1.0');

  /* Nachgestellt statt behauptet: der zugesicherte Bestand ist eine Datenbank
     aus 0.8.0 bis 0.8.2 -- dieselbe Anlage, nur ohne die neue Spalte. Und mit
     einer Zeile darin: eine leere Tabelle bewiese nichts ueber die Vorgabe. */
  const uDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-umstieg083-'));
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
  pruefe('Der Umstieg ergaenzt die Spalte im Bestand',
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

  /* Die frische Anlage bekommt die Spalte aus der DDL, nicht aus dem Umstieg.
     Ohne diese Gegenlage bliebe offen, ob die DDL sie ueberhaupt traegt --
     und zu 1.0 faellt der Umstieg weg, die Spalte muss bleiben. */
  const uFrisch = uLauf(uZweiterDir);
  pruefe('Eine frische Anlage traegt die Spalte ohne Umstieg',
    umsSpalten(uZweiterDir).includes('images_removed') && !/images_removed/.test(uFrisch),
    `${umsSpalten(uZweiterDir).includes('images_removed')} / ${JSON.stringify(uFrisch.trim())}`);
  fs.rmSync(uDir, { recursive: true, force: true });
  fs.rmSync(uZweiterDir, { recursive: true, force: true });

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
    const a2 = await fetch(`${BASIS}/api/comment-images/${id2}/raw${abfrage}`, { headers: { cookie: keks } });
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
  const nachgereicht = await sendeMehrteilig(`/api/comments/${kid}/images`, 'images',
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
  const leerNach = await sendeMehrteilig(`/api/comments/${ohneBildId}/images`, 'images', []);
  const kLeer = leerNach.inhalt.comments?.find(k2 => k2.id === ohneBildId);
  pruefe('Ein Ruf ohne Datei setzt kein „bearbeitet"',
    !!kLeer && kLeer.updated_at === null && kLeer.images.length === 0,
    JSON.stringify([leerNach.status, kLeer?.updated_at, kLeer?.images.length]));

  const zuViele = await sendeMehrteilig(`/api/comments/${kid}/images`, 'images',
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
    const a2 = await fetch(`${BASIS}/api/attachments/${id}/raw${abfrage}`, { headers: { cookie: keks } });
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

  // Dateiname mit Zeilenumbruch. Ueber den mehrteiligen Koerper kommt so
  // etwas gar nicht erst an -- die Kopfzeile endet am Zeilenumbruch. Der
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
  pruefe('Trotzdem keine eingeschleuste Kopfzeile',
    kopfBoese.h['x-eingeschleust'] === undefined, JSON.stringify(kopfBoese.h['x-eingeschleust']));
  pruefe('Kopfzeile bleibt wohlgeformt',
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
  // Auch ratings gehoert mit in den Durchlauf -- ueber beide Wege, auf
  // denen eine Bewertungszeile entsteht: von Hand gesetzt und eingespielt.
  const schlussKriterien = (await ruf('GET', '/api/criteria')).inhalt;
  await ruf('PUT', `/api/items/${fuellItem.id}/ratings`,
    { criterionId: schlussKriterien[0].id, value: 4 });
  await sendeImport({ version: 5, title: 'S', items: [
    { title: 'Schluss eins', testDays: [{ day: '2024-07-08', rating: 3 }],
      ratings: [{ name: schlussKriterien[0].name, value: 5 }],
      comments: [{ text: 'S1a' }, { text: 'S1b' }] },
    { title: 'Schluss zwei', testDays: [{ day: '2024-07-09', rating: 4 }],
      ratings: [{ name: schlussKriterien[0].name, value: 2 },
                { name: 'Frisch erfundenes Kriterium', value: 3 }],
      comments: [{ text: 'S2a' }] }
  ] }, 'merge');

  const schluss = oeffne(path.join(DATA, 'katalog.sqlite'));
  const schlussZahl = {};
  for (const t of ['items', 'comments', 'test_days', 'ratings']) {
    schlussZahl[t] = schluss.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
    const ohne = schluss.prepare(`SELECT COUNT(*) n FROM ${t} WHERE user_id IS NULL`).get().n;
    pruefe(`${t}: keine der ${schlussZahl[t]} Zeilen ist ohne Benutzer`, ohne === 0,
      `${ohne} von ${schlussZahl[t]} ohne user_id`);
  }
  pruefe('Der Durchlauf laeuft ueber einen belastbaren Bestand',
    schlussZahl.items >= 5 && schlussZahl.comments >= 4 && schlussZahl.test_days >= 4 &&
    schlussZahl.ratings >= 4,
    `${schlussZahl.items} Eintraege, ${schlussZahl.comments} Kommentare, ` +
    `${schlussZahl.test_days} Testtage, ${schlussZahl.ratings} Bewertungen`);
  schluss.close();

  /* ---------------------------------------------------------------- */
  console.log(`\n${'═'.repeat(62)}`);
  const summe = bestanden + gescheitert;
  console.log(`  ${bestanden} von ${summe} Pruefungen bestanden` +
              (uebersprungen ? `, ${uebersprungen} uebersprungen` : '') +
              (gescheitert ? `  —  ${gescheitert} GESCHEITERT` : '  —  alles in Ordnung'));
  console.log(`${'═'.repeat(62)}\n`);

  kind.kill();
  fs.rmSync(DATA, { recursive: true, force: true });
  process.exit(gescheitert ? 1 : 0);
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

  B.keksLoeschen();
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
  B.keksLoeschen();
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

async function legeFotoAn(itemId) {
  const antwort = await sendeMehrteilig(`/api/items/${itemId}/photos`, 'photos',
    [{ name: 'p.png', typ: 'image/png', inhalt: Buffer.from(PNG_BASE64, 'base64') }]);
  return antwort.inhalt.photos[0];
}

// Kommentar anlegen: mehrteilig, weil Bilder mitkommen koennen.
async function sendeKommentar(itemId, felder, bilder = []) {
  return sendeMehrteilig(`/api/items/${itemId}/comments`, 'images', bilder, felder);
}

const sendeDateien = (itemId, dateien) =>
  sendeMehrteilig(`/api/items/${itemId}/attachments`, 'files', dateien);

// Mehrteiliger Formularkoerper von Hand: die Pruefung soll ohne zusaetzliche
// Bibliothek auskommen, und Buffer duerfen nicht ueber Strings laufen --
// sonst zerfaellt jedes Byte ueber 127.
async function sendeMehrteilig(pfad, feld, dateien, felder = {}) {
  const grenze = '----pruefung' + crypto.randomBytes(6).toString('hex');
  const teile = [];
  for (const [k, v] of Object.entries(felder)) {
    teile.push(Buffer.from(
      `--${grenze}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`, 'utf8'));
  }
  for (const d of dateien) {
    const inhalt = Buffer.isBuffer(d.inhalt) ? d.inhalt : Buffer.from(d.inhalt, 'utf8');
    teile.push(Buffer.from(
      `--${grenze}\r\nContent-Disposition: form-data; name="${feld}"; filename="${d.name}"\r\n` +
      `Content-Type: ${d.typ}\r\n\r\n`, 'utf8'));
    teile.push(inhalt);
    teile.push(Buffer.from('\r\n', 'utf8'));
  }
  teile.push(Buffer.from(`--${grenze}--\r\n`, 'utf8'));
  const a = await fetch(BASIS + pfad, {
    method: 'POST',
    headers: { cookie: keks, 'content-type': `multipart/form-data; boundary=${grenze}` },
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
    headers: { cookie: keks, 'content-type': `multipart/form-data; boundary=${grenze}` },
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

function baueDom(JSDOM, { einstellungen = { filters: null }, hash = '', tags = [], uebersichtItems = null, einrichtung = false, angemeldet = true, zugaenge = null, testTage = null } = {}) {
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
  const quelle = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  const kriterien = [
    { id: 7, name: 'Zuerst', sort_order: 0, usage_count: 2 },
    { id: 8, name: 'Dann', sort_order: 1, usage_count: 0 },
    { id: 9, name: 'Zuletzt', sort_order: 2, usage_count: 1 }
  ];
  /* Verfasser im Doppelgaenger: der falsche Server muss antworten wie der
     echte, sonst verschwindet genau die Pruefung, fuer die er gebaut ist.
     BEWUSST VERSCHIEDENE Lagen -- ein lebender Name, ein Grabstein (Name
     null, nur die Nummer) und eine herrenlose Zeile. Waeren alle gleich,
     liesse sich nicht sehen, ob die Beschriftung ihre eigene Zeile trifft. */
  const vChefin = { id: 1, name: 'chefin', geloescht: false };
  const vBert = { id: 2, name: 'bert', geloescht: false };
  const vGrab = { id: 4, name: null, geloescht: true };
  const beispiel = {
    id: 1, title: 'Beispiel', description: 'Eine Beschreibung.\nZweite Zeile.',
    rejected: false, tested: true, favorite: false, category: null,
    verfasser: vBert,
    photos: [{ id: 5, mime_type: 'image/png', focus_x: 50, focus_y: 50, sort_order: 0 }],
    // Sieben Adressen und eine Suchzeile -- an der letzten haengt die Pruefung
    // der Kennzeichnung. Die Gesamtzahl bleibt acht, damit die Begrenzung der
    // sichtbaren Zeilen weiter an derselben Schwelle geprueft wird.
    links: [
      ...Array.from({ length: 7 }, (_, i) => ({ id: 80 + i, url: `https://beispiel.de/${i}`, sort_order: i })),
      { id: 87, url: 'Handbuch 3000', sort_order: 7 }
    ],
    comments: [
      /* mine und bilderEntfernt an JEDEM Kommentar: der echte Server liefert
         beides seit 0.8.3, und ein Doppelgaenger, der die Antwort
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
      { id: 41, filename: 'notiz.txt', mime_type: 'text/plain', size: 120, sort_order: 0, preview: 'text' },
      { id: 42, filename: 'foto.png', mime_type: 'image/png', size: 2048, sort_order: 1, preview: 'bild' },
      { id: 43, filename: 'doku.pdf', mime_type: 'application/pdf', size: 900000, sort_order: 2, preview: 'pdf' },
      { id: 44, filename: 'archiv.zip', mime_type: 'application/zip', size: 5242880, sort_order: 3, preview: 'keine' }
    ],
    tags: tags.filter(t => t.vergeben),
    // mine: der echte Server sagt zu jedem Testtag, ob er dem
    // Abrufenden gehoert. Der Doppelgaenger muss das mitliefern -- sonst
    // zeichnete die Zeitleiste hier alles gefuellt und die Unterscheidung
    // waere unpruefbar.
    testDays: [{ id: 3, day: '2026-08-01', rating: 4, mine: true, verfasser: vChefin,
                 tags: [{ id: 91, name: 'Regen' }] }],
    // avg und count stehen an jeder Zeile. Bewusst VERSCHIEDENE
    // Werte je Kriterium: gleiche machten die Pruefung blind dafuer, ob die
    // Spalte ihre eigene Zeile trifft. Das dritte Kriterium hat niemand
    // bewertet -- dort bleibt die Spalte leer.
    /* stimmen: wer welchen Wert vergeben hat. Die Zahl der Stimmen stimmt mit
       count ueberein -- ein Doppelgaenger, der sich hier widerspricht, macht
       jede Pruefung darauf wertlos. Die erste Zeile traegt alle vier Lagen
       nebeneinander: die eigene Stimme (kein Loeschkreuz), zwei fremde
       lebende, einen Grabstein und eine herrenlose. Die dritte hat gar keine. */
    ratings: kriterien.map((c, i) => ({
      criterion_id: c.id, name: c.name, value: 3,
      avg: [3.4, 4.1, null][i], count: [5, 2, 0][i],
      stimmen: [
        [{ id: 501, wert: 3, mine: true, verfasser: vChefin },
         { id: 502, wert: 4, mine: false, verfasser: vBert },
         { id: 503, wert: 2, mine: false, verfasser: vGrab },
         { id: 504, wert: 4, mine: false, verfasser: null },
         { id: 505, wert: 4, mine: false, verfasser: { id: 3, name: 'carla', geloescht: false } }],
        [{ id: 506, wert: 3, mine: true, verfasser: vChefin },
         { id: 507, wert: 5, mine: false, verfasser: vBert }],
        []
      ][i] })),
    avgRating: 3, testCount: 1, testAvg: 4, testLast: 4
  };
  const uebersicht = [{
    id: 1, title: 'Beispiel', rejected: false, tested: true, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: 3, testCount: 2, testAvg: 4, testLast: 4,
    updated_at: '2026-08-01 10:00:00', searchText: 'beispiel'
  }];
  const gesendet = [];

  const dom = new JSDOM(
    `<!DOCTYPE html><html lang="de"><body><div id="app"></div>` +
    `<p class="version-zeile" id="version"></p></body></html>`,
    { runScripts: 'dangerously', url: `${BASIS}/${hash}` });
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
    if (url === '/api/product-categories') return gib([]);
    if (url === '/api/settings') return gib(einstellungen);
    // Die Karte "Zugaenge" holt sich die Liste selbst. Ohne diese
    // Zeile bekaeme sie {} und zeichnete gar nichts -- und jede Pruefung auf
    // die Karte waere blind dafuer, ob sie ueberhaupt gefuellt wird.
    if (url === '/api/users') return gib(zugaenge);
    if (/^\/api\/users\/\d+\/bestand$/.test(url))
      return gib({ username: 'bert', eintraege: 2, fremdKommentare: 3, fremdBewertungen: 1,
                   fremdTesttage: 0, kommentare: 4, bewertungen: 2, testtage: 1 });
    if (url === '/api/items') return gib(uebersichtItems || uebersicht);
    /* PUT auf den Eintrag: der echte Server antwortet mit detail() NACH der
       Aenderung, der Doppelgaenger muss das nachmachen. Gaebe er stur den
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
      return gib({ fotos: 1, dateien: 4, links: 8,
                   eigenKommentare: 2, fremdKommentare: 4,
                   eigenBewertungen: 1, fremdBewertungen: 3,
                   eigenTesttage: 1, fremdTesttage: 2 });
    // Der Weg fuer eine fremde Bewertung. Der echte Server antwortet mit dem
    // neu gezeichneten Eintrag.
    if (/^\/api\/ratings\/\d+$/.test(url) && opt.method === 'DELETE') return gib(beispiel);
    if (url.startsWith('/api/items/1')) return gib(beispiel);
    // Endpunkte, die den ganzen Eintrag zurueckgeben. Ohne das wird `item` im
    // Frontend leer, und alles Folgende bricht -- der Prueflauf stuerzte
    // daran ab, statt eine Pruefung rot zu faerben.
    if (/^\/api\/comments\/\d+/.test(url) || /^\/api\/comment-images\/\d+$/.test(url) ||
        /^\/api\/items\/1\/comments$/.test(url))
      return gib(beispiel);
    if (url.startsWith('/api/attachments/41/preview'))
      return gib({ art: 'text', text: 'Erste Zeile\nZweite Zeile', gekuerzt: false });
    if (url === '/api/stats') return gib({ dbBytes: 1, photoCount: 0, photoBytes: 0, itemCount: 1,
      commentCount: 0, linkCount: 0, testDayCount: 0, attachmentCount: 4, attachmentBytes: 6144,
      version: require('./package.json').version, keyFromEnv: false, keyHex: 'ab'.repeat(32) });
    return gib({});
  };
  const skript = w.document.createElement('script');
  skript.textContent = quelle;
  // In den Kopf, nicht in den Rumpf: sonst steht der gesamte Quelltext in
  // document.body.textContent und jede Textpruefung findet dort Woerter,
  // die auf dem Bildschirm gar nicht stehen.
  w.document.head.appendChild(skript);
  return { w, gesendet, kriterien, beispiel };
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
  const zeilen = [...w.document.querySelectorAll('#ratings .rname')].map(e => e.textContent);
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
   * zugestellt wurde und die Ereignisschleife durchlaufen ist. Die vier
   * Schalter hier schreiben in die persoenliche Tabelle, und genau dort
   * saesse ein Fehler.
   *
   * .click() oder den Behandler von Hand zu rufen genuegt nicht: ein Fehler
   * in einem Behandler, der nach einem `await` weiterlaeuft, entsteht erst
   * beim echten Ereignis. Deshalb dispatchEvent und danach ein Durchlauf.
   *
   * Die beiden Schalter zeichnen ihren Zustand aus der eigenen Variablen neu,
   * NICHT aus der Antwort des Servers -- deshalb faellt hier nicht auf, dass
   * der Doppelgaenger auf PUT stur den alten Stand zurueckgibt. Das ist hier
   * folgenlos: der Zustand kommt gar nicht von dort. Wer diese Schalter
   * einmal auf die Serverantwort umstellt, muss den Doppelgaenger mit
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
     Der Doppelgaenger antwortet auf PUT mit dem geaenderten Eintrag, so wie
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
     danach muss die Ereignisschleife durchlaufen -- erst dann setzt der
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
  inhaltshoehe2 = 20;
  pruefe('Passt alles hinein, meldet nichts', ww.begrenzeWolke(wolkenkasten, 3) === false);
  pruefe('Null Zeilen heben die Begrenzung auf',
    (ww.begrenzeWolke(wolkenkasten, 0), wolkenkasten.style.maxHeight === ''));

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
  // Ereignisschleife, nicht der von Hand gerufene Behandler.
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
  pruefe('Und kein Name an den Kommentaren',
    eEinzeln.w.document.querySelectorAll('#cmts .cmt-von').length === 0);
  pruefe('Und keiner an den Testtagen',
    eEinzeln.w.document.querySelectorAll('#tdays .tvon').length === 0);
  pruefe('Und keine Stimmenliste unter den Sternen',
    eEinzeln.w.document.querySelectorAll('#ratings .rstimmen').length === 0);
  eEinzeln.w.close();

  const eIvf = eDoc.getElementById('ivf');
  pruefe('Ab zwei Zugaengen sagt der Eintrag, wer ihn angelegt hat',
    eIvf?.hidden === false && /Angelegt von bert/.test(eIvf?.textContent || ''),
    JSON.stringify([eIvf?.hidden, eIvf?.textContent]));

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

  /* --- Die Stimmenliste unter der Sternzeile ---------------------------- */
  const eStimmZeilen = [...eDoc.querySelectorAll('#ratings .rstimmen')];
  pruefe('Unter den Sternen steht, wer welchen Wert vergeben hat',
    eStimmZeilen.length === 2, `${eStimmZeilen.length} Listen`);
  // Das dritte Kriterium hat keine Stimme -- dort steht auch keine leere Liste.
  pruefe('Ein Kriterium ohne Stimme bekommt gar keine Liste',
    eStimmZeilen.length === 2 &&
    [...eDoc.querySelectorAll('#ratings .rrow')].length === 3);
  const eStimmen = [...eStimmZeilen[0]?.querySelectorAll('.rstimme') || []]
    .map(z => z.textContent.replace('✕', '').trim());
  pruefe('Jede Stimme nennt Name und Wert',
    gleich(eStimmen, ['chefin 3', 'bert 4', 'Gelöschter Benutzer 4 2',
                      'Ohne Verfasser 4', 'carla 4']),
    JSON.stringify(eStimmen));
  pruefe('Die eigene Stimme ist gekennzeichnet',
    eStimmZeilen[0]?.querySelectorAll('.rstimme.meine').length === 1,
    `${eStimmZeilen[0]?.querySelectorAll('.rstimme.meine').length}`);
  /* Das ✕ steht am FREMDEN Wert und nur beim Admin. Am eigenen nicht: dafuer
     gibt es die Sterne und den Ruecksetzer, und zwei Wege fuer dieselbe
     Absicht waeren einer zu viel. */
  pruefe('Der Admin bekommt ein ✕ an jeder fremden Stimme',
    eStimmZeilen[0]?.querySelectorAll('.rstimme .xdel').length === 4,
    `${eStimmZeilen[0]?.querySelectorAll('.rstimme .xdel').length}`);
  pruefe('Aber keins an der eigenen',
    !eStimmZeilen[0]?.querySelector('.rstimme.meine .xdel'));

  const eKeinAdmin = baueDom(JSDOM, { hash: '#/item/1',
    einstellungen: { filters: null, benutzerZahl: 3, istAdmin: false } });
  await new Promise(r => setTimeout(r, 80));
  pruefe('Ohne Adminrolle stehen die Namen trotzdem da',
    eKeinAdmin.w.document.querySelectorAll('#ratings .rstimme').length === 7,
    `${eKeinAdmin.w.document.querySelectorAll('#ratings .rstimme').length}`);
  // Der Server verweigert es ohnehin; ein Knopf, der zuverlaessig eine
  // Fehlermeldung erzeugt, sieht aus wie ein Fehler.
  pruefe('Aber kein einziges Loeschkreuz',
    eKeinAdmin.w.document.querySelectorAll('#ratings .rstimme .xdel').length === 0,
    `${eKeinAdmin.w.document.querySelectorAll('#ratings .rstimme .xdel').length}`);
  eKeinAdmin.w.close();

  /* --- Und jetzt wirklich draufdruecken ---------------------------------
     Ein gebauter DOM zeigt nicht, was beim Klicken passiert. Das Ereignis
     wird zugestellt, das Modal bestaetigt, danach durch die Ereignisschleife
     -- und erst dann wird nachgesehen, was der Server bekommen hat. */
  const eKreuz = eStimmZeilen[0]?.querySelectorAll('.rstimme .xdel')[0];
  if (eKreuz) {
    eKreuz.dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
    const eFrage = eDoc.querySelector('.backdrop');
    pruefe('Das ✕ fragt vorher nach', !!eFrage);
    pruefe('Die Frage nennt den Verfasser und sagt, dass nur Loeschen geht',
      /bert/.test(eFrage?.textContent || '') && /nicht ändern/.test(eFrage?.textContent || ''),
      eFrage?.querySelector('p')?.textContent);
    eFrage?.querySelector('[data-yes]')?.dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
  }
  const eEntfernt = eMehr.gesendet.filter(x => x.methode === 'DELETE' && /^\/api\/ratings\//.test(x.url)).pop();
  pruefe('Der Klick entfernt wirklich genau diese Bewertung',
    eEntfernt?.url === '/api/ratings/502', JSON.stringify(eEntfernt));

  /* --- Der Loeschdialog am Eintrag ---------------------------------------
     Die Zahlen kommen vom Server, nicht aus dem geladenen Eintrag: nur dort
     lassen sich eigene von fremden Beitraegen trennen. */
  eDoc.getElementById('del').dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  pruefe('Der Loeschknopf holt die Zahlen beim Server',
    eMehr.gesendet.some(x => x.url === '/api/items/1/bestand'),
    JSON.stringify(eMehr.gesendet.slice(-3)));
  const eDialog = eDoc.querySelector('.backdrop .modal p')?.textContent || '';
  pruefe('Der Dialog nennt, was am Eintrag selbst haengt',
    /1 Foto/.test(eDialog) && /8 Links/.test(eDialog) && /4 Dateien/.test(eDialog), eDialog);
  pruefe('Und die eigenen Beitraege getrennt',
    /Dazu 2 Kommentare, 1 Bewertung, 1 Testtag von mir/.test(eDialog), eDialog);
  /* Der eigentliche Gegenstand: was ANDEREN gehoert, steht in einem eigenen
     Satz -- die Kaskade nimmt es mit, und das darf nicht wortlos geschehen. */
  pruefe('Und die fremden in einem eigenen Satz',
    /Und von anderen: 4 Kommentare, 3 Bewertungen, 2 Testtage/.test(eDialog), eDialog);
  eDoc.querySelector('.backdrop [data-no]')?.dispatchEvent(new eMehr.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  eMehr.w.close();

  /* --- Das Anlegefeld im Systembereich, mit zugestelltem Ereignis --- */
  const eSys = baueDom(JSDOM, { einstellungen: { filters: null, benutzerZahl: 3, istAdmin: true } });
  await new Promise(r => setTimeout(r, 60));
  await eSys.w.renderSystem();
  await new Promise(r => setTimeout(r, 20));
  const eFeld = eSys.w.document.getElementById('newcrit');
  pruefe('Der Systembereich hat ein Anlegefeld fuer Kriterien', !!eFeld);
  pruefe('Die Kriterienzeilen tragen Griff, Umbenennen und Loeschen',
    [...eSys.w.document.querySelectorAll('#mcrits .mrow')]
      .every(z => z.querySelector('.grip') && z.querySelector('.ed') && z.querySelector('.rm')));
  if (eFeld) {
    eFeld.value = 'Verpackung';
    // Wirklich zugestellt, nicht von Hand gerufen -- und danach durch die
    // Ereignisschleife.
    eSys.w.document.getElementById('newcrit-b')
      .dispatchEvent(new eSys.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
  }
  const eAngelegt = eSys.gesendet.filter(x => x.methode === 'POST' && x.url === '/api/criteria').pop();
  pruefe('Der Klick legt das Kriterium wirklich an',
    eAngelegt?.koerper?.name === 'Verpackung', JSON.stringify(eAngelegt));
  pruefe('Und das Feld ist danach wieder leer', eFeld?.value === '', JSON.stringify(eFeld?.value));
  eSys.w.close();

  /* --- Und dasselbe fuer einen ohne Adminrolle --- */
  const eSysUser = baueDom(JSDOM, { einstellungen: { filters: null, benutzerZahl: 3, istAdmin: false } });
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
  // Tags und Kategorien gehen das nicht an -- die Klemme gilt nur den Kriterien.
  pruefe('Tags und Kategorien bleiben unangetastet bedienbar',
    [...eSysUser.w.document.querySelectorAll('#mtags .mrow')].every(z => z.querySelector('.rm')),
    `${eSysUser.w.document.querySelectorAll('#mtags .mrow .rm').length}`);
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
  pruefe('Zugeklappt bleibt die Liste scrollbar',
    wb.document.getElementById('links').style.overflowY === 'auto');
  mehrKnopf?.onclick?.();
  await new Promise(r => setTimeout(r, 20));
  const mehr2 = wb.document.getElementById('links-more');
  pruefe('Aufgeklappt fällt die Höhenbegrenzung weg',
    wb.document.getElementById('links').style.maxHeight === '',
    wb.document.getElementById('links').style.maxHeight);
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
  const kZaehl = wb.document.getElementById('ccount');
  pruefe('Der Kommentarblock traegt seine Zahlen in der Kopfzeile',
    !!kZaehl && kZaehl.textContent === '6 Kommentare, davon 1 Bericht und 2 Aufgaben (1 Erledigt)',
    kZaehl ? kZaehl.textContent : '(kein Hinweis)');
  pruefe('Und zwar dort, wo Links und Dateien ihren auch tragen',
    !!kZaehl && !!kZaehl.closest('.block-head') &&
    kZaehl.closest('.block')?.dataset.block === 'kommentare',
    kZaehl ? kZaehl.parentElement?.className : '(kein Hinweis)');

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

  const sysUser = baueDom(JSDOM, { einstellungen: { filters: null, istAdmin: false } });
  const wSysU = sysUser.w;
  await new Promise(r => setTimeout(r, 60));
  await wSysU.renderSystem();
  pruefe('Ein Benutzer bekommt die Haken gar nicht erst zu sehen',
    !wSysU.document.getElementById('tagfrei') && !wSysU.document.getElementById('katfrei'),
    'ein Haken steht auch ohne Adminrolle da');
  pruefe('Die Karten selbst bleiben ihm -- das raeumt erst die naechste Stufe',
    !!wSysU.document.getElementById('mtags') && !!wSysU.document.getElementById('mcats'),
    'die Karten sind schon jetzt verschwunden');
  wSysU.close();
}
