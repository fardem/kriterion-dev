/* Kriterion — der gemeinsame Rahmen des Pruefstands Hier steht, was alle
   Module in test/ teilen: die Zaehlung, group() und check(), der
   Schlussblock, die Zeitmessung, die Portbasen, der Start eines Servers, der
   SMTP-Empfaenger und die Rufer. */
const nodePath = require('path');
const { createRequire } = require('module');
const ROOT = nodePath.join(__dirname, '..');

module.exports = (function (__dirname, require) {
/* ============ DER PRUEFSCHALTER DIESES LAUFS -- 0.30.0, F1 und F2 =========
   ER STEHT VOR JEDEM require, und das ist der ganze Grund fuer diese Stelle:
   auth.js und mail.js lesen ihn beim LADEN. */
process.env.KRITERION_TESTBENCH = 'pruefstand:scrypt=1024:mail=40:brake=10';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync, execFileSync } = require('child_process');
/* SEIT 0.19.3: der Bestandslauf faehrt in einem eigenen Thread, und die
   Gruppe „Der Bestandslauf faehrt in einem eigenen Thread" erzeugt ihn von
   hier aus -- an einer echten, verschluesselten Instanz und ohne Server
   dazwischen. */
const { Worker } = require('worker_threads');
const Database = require('better-sqlite3-multiple-ciphers');
const attachments = require('./attachments');
/* SHARP STEHT HIER, SEIT 0.19.0, UND ZWAR AUS EINEM GENAUEN GRUND: die Runde
   legt jedes ankommende PNG als WebP ab, und die Zusage lautet nicht „eine
   Funktion wurde gerufen", sondern „das Bild ist unversehrt". */
const sharp = require('sharp');
/* DER ZERLEGER DER RUNDE 0.24.1 -- er trennt Code von Text, Vorlage und
   Kommentar. */
const { segment, CODE, TEXT, COMMENT, REGEX } = require('./tools/segments.js');

/* DIE FRISTEN, MIT DENEN DIE SERVER DIESES LAUFS WIRKLICH RECHNEN -- 0.30.0. */
const MAIL_TIMES = require('./mail');

/* ============= DAS GRUNDDOKUMENT FUER jsdom -- 0.30.0, BA 5 (F4) ==========
   174 AUFBAUTEN, UND JEDER HAT DIESELBE DATEI NEU GELESEN UND NEU UEBERSETZT. */
const vm = require('vm');
const BASE_SOURCE = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
const BASE_SCRIPT = new vm.Script(BASE_SOURCE, { filename: 'public/app.js' });
/* UND DIE WARTEZEIT, DIE DIE ROUTEN DIESES LAUFS WIRKLICH EINLEGEN -- 0.30.0,
   F3. */
const RUN_KEYS = require('./keys');
const BRAKE_STEP = RUN_KEYS.brakeWait(700);
/* UND DIE KOSTENSTUFE, MIT DER DIESE INSTANZEN WIRKLICH RECHNEN -- 0.30.0,
   F1. */
const SCRYPT_SHIPPED = Number((fs.readFileSync(path.join(__dirname, 'auth.js'), 'utf8')
  .match(/^const SCRYPT_SHIPPED = (\d+);$/m) || [])[1]);
const RUN_SCRYPT = RUN_KEYS.scryptCost(SCRYPT_SHIPPED);

/* DIE README ALS EIN LANGER STRING, EINMAL GELESEN. */
const readmeFlat = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8')
  .replace(/\s+/g, ' ');
/* UND DAS HANDBUCH DANEBEN -- seit 0.34.2 steht die Bedienung dort. */
const handbookFlat = fs.readFileSync(path.join(__dirname, 'manual-de.md'), 'utf8')
  .replace(/\s+/g, ' ');

/* ================= Kleiner Pruefrahmen ================= */
/* EIN NAMENSFILTER AUF DER AUSGABE, NICHT AUF DER ARBEIT. */
const FILTER = (process.argv[2] || '').trim();
let passedCount = 0, failed = 0, skipped = 0;
let stillPassed = 0, stillFailed = 0;
let groupsShown = 0, groupsStill = 0;
let silent = false;

/* ================= WO DIE ZEIT HINGEHT -- 0.30.0, BA 4 =================
   OHNE DIESE ZAHL IST JEDE BESCHLEUNIGUNG GERATEN. */
const TIMES = [];
const TIME_EACH = process.env.TESTBENCH_TIME === '1';
const RUN_START = Date.now();
let timeName = '', timeStart = 0, timeSilent = false;
/* SCHLIESST DIE LAUFENDE GRUPPE UND MERKT IHRE ZEIT. */
function closeTime() {
  if (!timeName) return;
  const ms = Date.now() - timeStart;
  if (!timeSilent) TIMES.push({ name: timeName, ms });
  if (TIME_EACH && !timeSilent) console.log(`  ⏱ ${(ms / 1000).toFixed(1)} s`);
  timeName = '';
}
/* DIE SCHLUSSTAFEL IST EINE REINE FUNKTION, und das ist kein Geschmack: „die
   ZEHN teuersten" laesst sich an einem Lauf mit zwei Gruppen nicht belegen. */
function timeTable(rows, wholeMs, top = 10) {
  const inGroups = rows.reduce((n, z) => n + z.ms, 0);
  const worst = [...rows].sort((a, b) => b.ms - a.ms).slice(0, top);
  const wide = Math.max(0, ...worst.map(z => z.name.length));
  const out = [`  DIE TEUERSTEN ${worst.length} VON ${rows.length} GRUPPEN:`];
  for (const z of worst)
    out.push(`    ${z.name.padEnd(wide)}  ${(z.ms / 1000).toFixed(1).padStart(6)} s  ` +
             `${(wholeMs ? z.ms * 100 / wholeMs : 0).toFixed(1).padStart(5)} %`);
  /* BEIDE ZAHLEN, UND SIE SIND VERSCHIEDEN: die Summe der Gruppen laesst
     alles weg, was zwischen ihnen liegt -- der Aufbau vor der ersten Gruppe,
     das Aufraeumen hinter der letzten. */
  out.push(`  ${(inGroups / 1000).toFixed(1)} s in Gruppen, ` +
           `${(wholeMs / 1000).toFixed(1)} s im ganzen Lauf.`);
  return out;
}

const group = (name) => {
  closeTime();
  timeName = name; timeStart = Date.now();
  silent = FILTER !== '' && !name.toLowerCase().includes(FILTER.toLowerCase());
  timeSilent = silent;
  if (silent) { groupsStill++; return; }
  groupsShown++;
  /* MINDESTENS ZWEI STRICHE, auch bei einem langen Namen. */
  console.log(`\n── ${name} ${'─'.repeat(Math.max(2, 58 - name.length))}`);
};
function check(name, condition, hint = '') {
  // Die Bedingung ist beim Aufruf laengst gerechnet -- der Filter nimmt die
  // Zeile weg, nicht die Arbeit.
  if (silent) { if (condition) stillPassed++; else stillFailed++; return; }
  if (condition) { passedCount++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${hint ? `\n      ${hint}` : ''}`); }
}
// EINE Stelle fuer den Schlussblock: der gefilterte und der volle Lauf enden
// gleich, und die Selbstprobe weiter unten pruefT genau diese Stelle.
function endBlock() {
  // Die letzte Gruppe hat kein nachfolgendes group() mehr.
  closeTime();
  console.log(`\n${'═'.repeat(62)}`);
  const sum = passedCount + failed;
  // "0 von 0 bestanden -- alles in Ordnung" waere die schlimmste Zeile des
// ganzen Prueflaufs: sie meldet Erfolg fuer nichts.
  if (!sum) console.log('  KEINE PRUEFUNG GEZEIGT — nichts belegt.');
  else console.log(`  ${passedCount} von ${sum} Pruefungen bestanden` +
              (skipped ? `, ${skipped} uebersprungen` : '') +
              (failed ? `  —  ${failed} GESCHEITERT` : '  —  alles in Ordnung'));
  if (FILTER) {
    console.log(`\n  GEFILTERTER LAUF nach "${FILTER}" — KEIN VOLLSTAENDIGER BELEG.`);
    if (!groupsShown)
      console.log(`  KEINE EINZIGE GRUPPE traegt den Namen — es wurde nichts geprueft.`);
    else
      console.log(`  ${groupsShown} von ${groupsShown + groupsStill} Gruppen gezeigt, ` +
                  `${groupsStill} uebergangen (${stillPassed + stillFailed} Pruefungen).`);
    /* UND WIE VIELE MODULE GAR NICHT ERST GESTARTET SIND -- 0.34.0. */
    if (skippedGroupCount)
      console.log(`  ${skippedGroupCount} Module sind gar nicht erst gestartet — ` +
                  `ihre Pruefungen sind in der Zahl oben NICHT enthalten.`);
    if (stillFailed)
      console.log(`  DARIN ${stillFailed} GESCHEITERT — hier nicht angezeigt. ` +
                  `Ohne Filter laufen lassen, um sie zu sehen.`);
  }
  /* DIE TAFEL STEHT IM SCHLUSSBLOCK UND NICHT DANEBEN. */
  if (TIMES.length) {
    console.log('');
    for (const z of timeTable(TIMES, Date.now() - RUN_START)) console.log(z);
  }
  console.log(`${'═'.repeat(62)}\n`);
}
const returnValue = () => (failed || (FILTER && !groupsShown)) ? 1 : 0;
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/* SETZT EIN FELD UND SAGT, OB ES DA WAR. */
const setField = (doc, id, value) => {
  const f = doc.getElementById(id);
  if (f) f.value = value;
  return !!f;
};
/* ================= Umgebung ================= */
const KEY = crypto.randomBytes(32).toString('hex');

/* PORT_OFFSET -- eine Zahl, die auf JEDE Portbasis dieses Laufs addiert wird. */
/* 3500 SEIT 0.12.4, VORHER 3000. Die Spanne aller Basen ist mit dem Rundlauf
   des Teilexports auf 3100 gewachsen (zwei Instanzen: die Quelle und das
   Ziel), und unterhalb der vorhandenen Basen war kein Fenster von 60 Nummern
   mehr frei -- die Luecken tragen entweder zu wenig Platz oder eine Nummer
   von der Sperrliste. */
const OFFSET_LEVEL = 3500;
const OFFSET_TRACES = 4;
const PORT_WIDTH = 60;
/* ================= DIE SPANNE ALLER PORTBASEN -- 0.30.0, F7
   ================= Die Gegenprobe sieht VOR dem ersten Rueckbau nach, ob in
   diesem Fenster jemand horcht -- der Portblick findet auch das, was kein
   Muster ueber die Befehlszeile je findet (counterproof.js, foreignPort()). */
const PORT_SPAN_FROM = 3900;
const PORT_SPAN_TO = 17679;
const MAIN_WIDTH = 90;
const MAIN_BASE = 3900;
/* DER ALTE NAME GILT WEITER (F9). */
const PORT_OFFSET = Number(process.env.PORT_OFFSET ?? process.env.PORT_VERSATZ ?? 0);
const PORT = MAIN_BASE + PORT_OFFSET + Math.floor(Math.random() * MAIN_WIDTH);
const BASE = `http://127.0.0.1:${PORT}`;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-pruefung-'));
const USER = 'pruefer', PASSWORD = 'pruef-passwort-' + crypto.randomBytes(4).toString('hex');

function open(file) {
  const d = new Database(file);
  d.pragma("cipher='sqlcipher'");
  d.pragma(`key="x'${KEY}'"`);
  return d;
}

/* ================= Server ================= */
let kind, output = '';
function startServer() {
  return new Promise((done, error) => {
    kind = spawn(process.execPath, ['server.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: String(PORT), DATA_DIR: DATA, ENCRYPTION_KEY: KEY }
    });
    kind.stdout.on('data', d => { output += d; });
    kind.stderr.on('data', d => { output += d; });
    /* AUCH DER HAUPTSERVER SAGT ES, WENN ER VON SELBST ENDET -- 0.30.0, BA 2. */
    kind.on('exit', (c, signal) => {
      if (c) error(new Error(`Server beendet (Code ${c})\n${output}`));
      if (c === null && signal === 'SIGTERM') return;   // das ist unser eigenes kill()
      console.error(`\n  ACHTUNG: der Hauptserver (Port ${PORT}) ist von selbst beendet -- ` +
        `Code ${c}, Signal ${signal}, Verzeichnis ${DATA}`);
      console.error('  ' + output.split('\n').filter(Boolean).slice(-8).join('\n  '));
    });
    (async () => {
      for (let i = 0; i < READY_TRIES; i++) {
        await new Promise(r => setTimeout(r, READY_STEP));
        // /api/config statt /api/health: health liegt hinter der Anmeldung.
        try { if ((await fetch(`${BASE}/api/config`)).ok) return done(); } catch {}
      }
      // DERSELBE SATZ WIE BEIM ZWEITSERVER -- 0.30.0, BA 2: wer sucht, sucht
// mit denselben drei Angaben.
      error(new Error(`Hauptserver nicht erreichbar: Portbasis ${MAIN_BASE}, Port ${PORT}, ` +
        `Verzeichnis ${DATA} -- ${READY_TRIES * READY_STEP / 1000} s gewartet\n${output}`));
    })();
  });
}

// Kurzer Lauf in einem eigenen Prozess: db.js oeffnet die Datenbank beim
// Laden und laesst sich deshalb nicht zweimal im selben Prozess auf zwei
// Verzeichnisse ansetzen.
function shortRun(code, dataDirectory) {
  const { execFileSync } = require('child_process');
  return execFileSync(process.execPath, ['-e', code], {
    cwd: __dirname, encoding: 'utf8',
    env: { ...process.env, DATA_DIR: dataDirectory, ENCRYPTION_KEY: KEY }
  }).trim().split('\n').pop();
}

/* DERSELBE LAUF, ABER MIT DER GANZEN AUSGABE -- seit 0.24.2. */
function shortRunAll(code, dataDirectory) {
  const { execFileSync } = require('child_process');
  return execFileSync(process.execPath, ['-e', code], {
    cwd: __dirname, encoding: 'utf8',
    env: { ...process.env, DATA_DIR: dataDirectory, ENCRYPTION_KEY: KEY }
  }).trim();
}

/* Setzt einem von Hand angelegten Zugang ein ECHTES Passwort. */
function setPasswordImInventory(dataDirectory, name, password) {
  return shortRun(
    `const a = require('./auth'); const { db } = require('./db');` +
    `a.hashPassword(${JSON.stringify(password)}).then(h => {` +
    `db.prepare('UPDATE users SET password_hash = ? WHERE username = ?')` +
    `.run(h, ${JSON.stringify(name)}); console.log('gesetzt'); });`,
    dataDirectory);
}

/* EIN KIND BEENDEN UND AUF SEIN ENDE WARTEN. */
function endKind(kind) {
  return new Promise(done => {
    if (kind.exitCode !== null || kind.signalCode !== null) return done();
    kind.on('exit', done);
    kind.kill();
  });
}

/* JEDE PRUEFLAGE MIT EIGENEM SERVER WIRD HIER VERMERKT -- Portbasis,
   gewaehlte Nummer und das Kind. */
const CASES = [];

/* ================= Der SMTP-Empfaenger, 0.9.0 ================= ER KOMMT AUS
   `net` UND NICHT AUS DEM NETZ. */
/* DIE PORTBASIS IST AUSGERECHNET, NICHT GESCHAETZT, und sie geht ueber DIESELBE Liste wie jede andere -- sonst saehe der
   Waechter aus 0.8.91 sie gar nicht, und genau daran sind in 0.8.90 zwei
   Gegenproben haengengeblieben. */
const SMTP_BASE = 6110;
const SMTP_WIDTH = 20;
/* DIE LAGE „SERVER OHNE de.json" -- 0.24.0, Bauabschnitt 1. */
/* DIE BASIS DER FINGERPRINTLAGE -- hierher in 0.34.0. */
const FINGERPRINT_BASE = 6100;
const LANGUAGE_BASE = 6140;
const LANGUAGE_WIDTH = 2;
let smtpPort = SMTP_BASE;
const SMTP_CASES = [];
function smtpEmpfaenger(kind = 'ok') {
  const net = require('net');
  const port = (smtpPort++) + PORT_OFFSET;
  const post = [];
  /* JEDE OFFENE VERBINDUNG WIRD VERMERKT, und das ist keine Zierde:
     server.close() hoert nur auf zu HORCHEN und wartet danach auf das Ende
     aller offenen Verbindungen. */
  const wires = new Set();
  const server = net.createServer(sock => {
    wires.add(sock);
    sock.on('close', () => wires.delete(sock));
    sock.on('error', () => {});
    if (kind === 'abbruch') return sock.destroy();
    if (kind === 'stumm') return;
    let inData = false, buffer = '', mail = '';
    sock.write('220 kriterion-probe ESMTP\r\n');
    if (kind === 'schweigt') return;
    if (kind === 'troepfelt') {
      /* DER TROPFEN FOLGT DER FRIST -- 0.30.0. */
      const beat = Math.max(20, Math.round(MAIL_TIMES.SEND_MS * 0.15));
      const drop = setInterval(() => { try { sock.write('2'); } catch {} }, beat);
      sock.on('close', () => clearInterval(drop));
      return;
    }
    sock.on('data', d => {
      buffer += d.toString();
      let i;
      while ((i = buffer.indexOf('\r\n')) >= 0) {
        const row = buffer.slice(0, i); buffer = buffer.slice(i + 2);
        if (inData) {
          if (row === '.') {
            inData = false; post.push(mail); mail = '';
            sock.write(kind === 'fehler' ? '550 abgelehnt\r\n' : '250 angenommen\r\n');
          } else {
            // Die Punktverdopplung des Protokolls wieder zurueck, wie sie
// jeder Empfaenger macht.
            mail += (row.startsWith('..') ? row.slice(1) : row) + '\n';
          }
          continue;
        }
        const b = row.toUpperCase();
        if (b.startsWith('EHLO') || b.startsWith('HELO')) sock.write('250-kriterion-probe\r\n250 AUTH PLAIN LOGIN\r\n');
        else if (b.startsWith('AUTH')) sock.write('235 angemeldet\r\n');
        else if (b.startsWith('DATA')) { inData = true; sock.write('354 los\r\n'); }
        else if (b.startsWith('QUIT')) { sock.write('221 tschuess\r\n'); sock.end(); }
        else sock.write('250 ok\r\n');
      }
    });
  });
  server.listen(port, '127.0.0.1');
  const state = { base: SMTP_BASE, port, server, kind };
  SMTP_CASES.push(state);
  // Kopf und Rumpf getrennt, und der Rumpf dekodiert -- so sieht ihn ein
// Empfaenger, und nur so laesst sich nach dem Link darin suchen.
  state.letters = () => post.map(raw => {
    const split = raw.indexOf('\n\n');
    const head = split < 0 ? raw : raw.slice(0, split);
    const core = split < 0 ? '' : raw.slice(split + 2);
    const clear = /quoted-printable/i.test(head)
      ? core.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
      : core;
    return { raw, head, core: Buffer.from(clear, 'binary').toString('utf8') };
  });
  state.stop = () => new Promise(r => {
    // Erst die Verbindungen, dann der Horchposten -- in dieser Reihenfolge,
// sonst wartet close() auf genau das, was gleich abgeraeumt wird.
    for (const d of wires) d.destroy();
    wires.clear();
    server.close(() => r());
  });
  return state;
}

// Ein weiterer Server mit eigenem Datenverzeichnis, eigener Umgebung und
// eigenem Cookie.
/* ================= DAS WARTEFENSTER -- 0.30.0, BA 2 ================= ZWOELF
   SEKUNDEN WAREN ZU WENIG. */
const READY_TRIES = 300;
const READY_STEP = 100;
/* DIE MELDUNG ALS EIGENE FUNKTION, und das ist kein Umweg: die Zusage dazu
   soll sie FAHREN und nicht den Quelltext lesen -- und einen Zweitserver
   wirklich ins Leere laufen zu lassen kostete dreissig Sekunden. */
const readyFailure = (portBase, port, dataDirectory, log = '') =>
  `Zweitserver nicht erreichbar: Portbasis ${portBase}, Port ${port}, ` +
  `Verzeichnis ${dataDirectory} -- ${READY_TRIES * READY_STEP / 1000} s gewartet\n${log}`;

function startFurtherServer(dataDirectory, extraEnv, portBase) {
  const port = portBase + PORT_OFFSET + Math.floor(Math.random() * PORT_WIDTH);
  const base = `http://127.0.0.1:${port}`;
  let log = '', cookieB = '';
  const environment = { ...process.env, PORT: String(port), DATA_DIR: dataDirectory, ENCRYPTION_KEY: KEY };
  delete environment.AUTH_RESET;
  Object.assign(environment, extraEnv);
  const kindB = spawn(process.execPath, ['server.js'], { cwd: __dirname, env: environment });
  const state = { base: portBase, port, kind: kindB, directory: dataDirectory };
  CASES.push(state);
  kindB.stdout.on('data', d => { log += d; });
  kindB.stderr.on('data', d => { log += d; });
  /* EIN SERVER, DER VON SELBST ENDET, IST EIN FUND -- 0.30.0, BA 2. */
  kindB.on('exit', (code, signal) => {
    if (state.stopped) return;
    console.error(`\n  ACHTUNG: der Server der Portbasis ${portBase} (Port ${port}) ist von ` +
      `selbst beendet -- Code ${code}, Signal ${signal}, Verzeichnis ${dataDirectory}`);
    console.error('  ' + log.split('\n').filter(Boolean).slice(-6).join('\n  '));
  });
  const callB = async (method, filePath, body) => {
    const opt = { method: method, headers: {} };
    if (cookieB) opt.headers.cookie = cookieB;
    if (body !== undefined) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(body); }
    const a = await fetch(base + filePath, opt);
    const setCookieHeader = a.headers.get('set-cookie');
    if (setCookieHeader) cookieB = setCookieHeader.split(';')[0];
    let content = null;
    try { content = await a.json(); } catch {}
    return { status: a.status, content };
  };
  const ready = (async () => {
    for (let i = 0; i < READY_TRIES; i++) {
      await new Promise(r => setTimeout(r, READY_STEP));
      try { if ((await fetch(`${base}/api/config`)).ok) return true; } catch {}
    }
    throw new Error(readyFailure(portBase, port, dataDirectory, log));
  })();
  return { ready, call: callB, log: () => log, base,
           cookieRemove: () => { cookieB = ''; },
           // Der laufende Sitzungscookie zum Mitgeben.
           cookieValue: () => cookieB,
           stop: () => { state.stopped = true; return endKind(kindB); } };
}

/* ================= DIESER PRUEFLAUF LIEST DEUTSCH -- 0.24.3 ==============
   Bis 0.24.2 sprach eine frische Installation Deutsch, weil die
   Vorgabesprache eine Konstante im Quelltext war. */
const RAW_FETCH = globalThis.fetch;
globalThis.fetch = (url, opt = {}) => {
  const headers = { ...(opt.headers || {}) };
  if (!Object.keys(headers).some(h => h.toLowerCase() === 'accept-language'))
    headers['accept-language'] = 'de';
  return RAW_FETCH(url, { ...opt, headers });
};

let cookie = '';
async function call(method, filePath, body) {
  const opt = { method: method, headers: {} };
  if (cookie) opt.headers.cookie = cookie;
  if (body !== undefined) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(body); }
  const a = await fetch(BASE + filePath, opt);
  const setCookieHeader = a.headers.get('set-cookie');
  if (setCookieHeader) cookie = setCookieHeader.split(';')[0];
  let content = null;
  try { content = await a.json(); } catch {}
  return { status: a.status, content };
}
const names = (list) => list.map(c => c.name);

/* ================= Die zweite Bestaetigung im Prueflauf =================
   SEIT 0.8.90 VERLANGEN SECHS WEGE UEBER FUENF ROUTEN EINE FREIGABE: Export,
   Import, Rolle vergeben, fremdes Passwort setzen, Zugang entfernen, Link
   erzeugen. */
function confirmNeeded(method, filePath, body) {
  const withoutQuery = String(filePath).split('?')[0];
  if (method === 'GET' && withoutQuery === '/api/export') return [['export', null]];
  if (method === 'POST' && withoutQuery === '/api/import') return [['import', null]];
  const user = withoutQuery.match(/^\/api\/users\/(\d+)$/);
  if (user) {
    const id = Number(user[1]);
    if (method === 'DELETE') return [['remove', id]];
    if (method === 'PUT') {
      const outcome = [];
      if (body && body.role !== undefined) outcome.push(['role', id]);
      if (body && body.password !== undefined) outcome.push(['password', id]);
      return outcome;
    }
  }
  const link = withoutQuery.match(/^\/api\/users\/(\d+)\/token$/);
  if (link && method === 'POST') return [['link', Number(link[1])]];
  // Der achte Zweck, seit 0.19.0: die Umstellung der Bildablage. Kein Ziel --
// sie trifft die Instanz als Ganzes, wie Export und Import.
  if (method === 'POST' && withoutQuery === '/api/images/convert') return [['images', null]];
  return [];
}

/* Macht aus einem rohen Rufer einen, der die Freigabe vorher holt. */
function includingShare(raw, password) {
  return async (method, filePath, body) => {
    for (const [purpose, target] of confirmNeeded(method, filePath, body)) {
      await raw('POST', '/api/confirm', { password, purpose, target });
    }
    return raw(method, filePath, body);
  };
}

// Der Rufer des Hauptservers mit Freigabe. Der rohe heisst weiterhin call() und
// wird ueberall dort gebraucht, wo die Schranke selbst der Gegenstand ist.
const callF = (...w) => includingShare(call, PASSWORD)(...w);
// Und dieselbe Freigabe fuer einen rohen fetch daneben: der Export laeuft an
// zwei Stellen ueber fetch statt ueber call(), weil dort die KOPFZEILEN der
// Antwort gebraucht werden.
const shareMain = (purpose, target = null) =>
  call('POST', '/api/confirm', { password: PASSWORD, purpose, target });

/* ============ WAS EIN ABGEBROCHENER LAUF STEHENLAESST -- 0.30.0, BA 3 ======
   AM 8. */
const LEFTOVER_ROOT = path.join(os.tmpdir(), 'kriterion-');

function parentOf(pid) {
  let row;
  try { row = fs.readFileSync(`/proc/${pid}/stat`, 'utf8'); } catch { return 0; }
  /* HINTER DER LETZTEN KLAMMER UND NICHT AM ZWEITEN FELD: der Name des
     Prozesses steht in Klammern und darf selbst Leerzeichen und Klammern
     tragen. */
  const rest = row.slice(row.lastIndexOf(')') + 1).trim().split(/\s+/);
  return Number(rest[1]) || 0;
}

/* LEBT DIESE NUMMER NOCH? Signal 0 stellt die Frage, ohne etwas zu schicken. */
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };

const ourOwn = (pid) => {
  for (let up = parentOf(pid), step = 0; up > 1 && step < 40; up = parentOf(up), step++)
    if (up === process.pid) return true;
  return false;
};

/* Liefert die Reste: Prozessnummer, Verzeichnis und Port, soweit er dasteht. */
function leftovers() {
  const outcome = [];
  let entries;
  try { entries = fs.readdirSync('/proc'); } catch { return outcome; }
  for (const e of entries) {
    if (!/^\d+$/.test(e) || Number(e) === process.pid) continue;
    let environment;
    try { environment = fs.readFileSync(`/proc/${e}/environ`, 'utf8').split('\0'); } catch { continue; }
    const where = (environment.find(z => z.startsWith('DATA_DIR=')) || '').slice(9);
    if (!where || !where.startsWith(LEFTOVER_ROOT)) continue;
    /* DER VATER MUSS FORT SEIN. `ppid === 1` heisst: er ist gestorben, und
       der Kern hat den Prozess an die Eins gehaengt. */
    const father = parentOf(Number(e));
    if (father > 1 && alive(father)) continue;
    if (ourOwn(Number(e))) continue;
    outcome.push({ pid: Number(e), where,
      port: (environment.find(z => z.startsWith('PORT=')) || '').slice(5) });
  }
  return outcome;
}

/* RAEUMT AUF UND SIEHT NACH -- dieselbe Bauform wie cleanUp() in der
   Gegenprobe: ein Aufraeumen, das nie greift, sieht aus wie eines, das
   greift. */
function sweepLeftovers() {
  const found = leftovers();
  for (const z of found) { try { process.kill(z.pid, 'SIGKILL'); } catch {} }
  /* EIN SIGKILL WIRKT NICHT IN DERSELBEN ZEILE. */
  const wait = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  const until = Date.now() + 5000;
  let left = leftovers().filter(z => found.some(f => f.pid === z.pid));
  while (left.length && Date.now() < until) {
    wait(100);
    left = leftovers().filter(z => found.some(f => f.pid === z.pid));
  }
  /* DAS VERZEICHNIS GEHT MIT. Ein Wegwerfverzeichnis ohne seinen Server ist
     nichts als belegter Platz -- in 0.29.0 lagen davon vierzig herum. */
  for (const z of found) { try { fs.rmSync(z.where, { recursive: true, force: true }); } catch {} }
  return { cleared: found, left: left.length };
}

/* ================= Ablauf ================= */

/* ================= DER HAUPTSERVER FUER EIN MODUL -- 0.34.0 ==============
   BIS 0.33.2 STAND ER EINMAL FUER DEN GANZEN LAUF. */
async function mainServerReady() {
  await startServer();
  await call('POST', '/api/setup', { user: USER, password: PASSWORD });
  await call('POST', '/api/login', { user: USER, password: PASSWORD });
}

/* ================= WORAUS DER PRUEFSTAND BESTEHT -- 0.34.0 =================
   BIS 0.33.2 WAR DAS EINE DATEI. */
function benchFiles() {
  const wo = path.join(__dirname, 'test');
  const module = fs.existsSync(wo)
    ? fs.readdirSync(wo).filter(n => n.endsWith('.js')).sort().map(n => 'test/' + n)
    : [];
  return ['testbench.js', ...module];
}

/* ================= WAS EIN MODUL MELDET ================= Jedes Modul laeuft
   als eigener Prozess. */
const REPORT_PATH = process.env.TESTBENCH_REPORT || '';

function counters() {
  /* DIE PRUEFLAGEN KOMMEN MIT IHREN BASEN ZURUECK und nicht als blosse Zahl:
     der Waechter „Die Portbasen und der Versatz" rechnet ueber die Basen, die
     der Lauf WIRKLICH benutzt hat. */
  return {
    passedCount, failed, skipped, stillPassed, stillFailed, groupsShown, groupsStill,
    times: TIMES,
    cases: CASES.map(l => ({ base: l.base, port: l.port, pid: l.kind.pid,
      open: l.kind.exitCode === null && l.kind.signalCode === null })),
    smtp: SMTP_CASES.map(l => ({ base: l.base, port: l.port, kind: l.kind,
      open: l.server.listening }))
  };
}

/* NIMMT DIE ZAHLEN EINES MODULS AUF. */
function addCounters(z) {
  passedCount += z.passedCount; failed += z.failed; skipped += z.skipped;
  stillPassed += z.stillPassed; stillFailed += z.stillFailed;
  groupsShown += z.groupsShown; groupsStill += z.groupsStill;
  for (const r of z.times || []) TIMES.push(r);
}

/* GRUPPEN, DIE GAR NICHT ERST GESTARTET WURDEN. Ein Teillauf startet nur die
   Module, die er zeigt; die uebrigen Gruppen hat niemand gefahren. */
let skippedGroupCount = 0;
function addSkippedGroups(count) { groupsStill += count; skippedGroupCount++; }
/* WIE VIELE MODULE DIESER LAUF AUSGELASSEN HAT. */
const skippedModules = () => skippedGroupCount;

/* DER LAUF EINES EINZELNEN MODULS. */
async function moduleRun(run, name) {
  let abort = '';
  try {
    await run();
  } catch (e) {
    const chain = [];
    for (let z = e, step = 0; z && step < 5; z = z.cause, step++)
      chain.push(`${z.code ? `[${z.code}] ` : ''}${z.message || z}`);
    abort = chain.join('  <-  ');
    console.error(`\nModul ${name} abgebrochen:`, abort);
    if (e && e.stack) console.error(e.stack.split('\n').slice(1, 4).join('\n'));
  }
  closeTime();
  const report = counters();
  report.abort = abort;
  report.moduleName = name;
  if (REPORT_PATH) { try { fs.writeFileSync(REPORT_PATH, JSON.stringify(report)); } catch {} }
  /* DER HAUPTSERVER GEHOERT DAZU. */
  if (kind) { try { kind.kill(); } catch {} }
  for (const l of CASES) { try { l.kind.kill(); } catch {} }
  for (const l of SMTP_CASES) { try { l.server.close(); } catch {} }
  fs.rmSync(DATA, { recursive: true, force: true });
  process.exit(abort ? 1 : (failed ? 1 : 0));
}

/* EIN MODUL, DAS FUER SICH GEFAHREN WIRD. */
function standalone(run, moduleFile) {
  const name = nodePath.basename(moduleFile, '.js');
  if (!REPORT_PATH) {
    const own = async () => { await run(); endBlock(); };
    return moduleRun(own, name);
  }
  return moduleRun(run, name);
}

return {
  /* die geladenen Sachen, damit ein Modul sie nicht noch einmal laedt */
  fs, os, path, crypto, spawn, spawnSync, execFileSync, Worker, Database,
  attachments, sharp, segment, CODE, TEXT, COMMENT, REGEX, vm,
  MAIL_TIMES, BASE_SOURCE, BASE_SCRIPT, RUN_KEYS, BRAKE_STEP,
  SCRYPT_SHIPPED, RUN_SCRYPT, readmeFlat, handbookFlat,
  __dirname, require,
  /* der Pruefrahmen */
  FILTER, group, check, endBlock, returnValue, closeTime, timeTable, TIMES,
  equal, setField,
  /* Umgebung, Ports, Server */
  KEY, OFFSET_LEVEL, OFFSET_TRACES, PORT_WIDTH, PORT_SPAN_FROM, PORT_SPAN_TO,
  MAIN_WIDTH, MAIN_BASE, PORT_OFFSET, PORT, BASE, DATA, USER, PASSWORD,
  open, startServer, shortRun, shortRunAll, setPasswordImInventory, endKind,
  CASES, SMTP_BASE, SMTP_WIDTH, FINGERPRINT_BASE, LANGUAGE_BASE, LANGUAGE_WIDTH,
  SMTP_CASES,
  smtpEmpfaenger, READY_TRIES, READY_STEP, readyFailure, startFurtherServer,
  call, names, confirmNeeded, includingShare, callF, shareMain,
  leftovers, sweepLeftovers, parentOf, ourOwn, benchFiles,
  /* was sich waehrend des Laufs aendert und deshalb nicht zerlegt werden darf */
  get cookie() { return cookie; },
  set cookie(v) { cookie = v; },
  get kind() { return kind; },
  get output() { return output; },
  get skipped() { return skipped; },
  set skipped(v) { skipped = v; },
  get passedCount() { return passedCount; },
  get failed() { return failed; },
  get groupsShown() { return groupsShown; },
  get groupsStill() { return groupsStill; },
  get stillPassed() { return stillPassed; },
  get stillFailed() { return stillFailed; },
  /* der Weg der Module */
  counters, addCounters, addSkippedGroups, skippedModules, moduleRun, standalone,
  mainServerReady
};
})(ROOT, createRequire(nodePath.join(ROOT, 'package.json')));
