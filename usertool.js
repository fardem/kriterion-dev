#!/usr/bin/env node
/* Zugangsverwaltung auf dem Wirt -- derselbe Weg, den Nextcloud
 * (occ user:resetpassword), GitLab und Grafana gehen: ein Befehl auf dem
 * Wirt, ein Name, ein Vorgang.
 *
 *   node usertool.js liste
 *   node usertool.js passwort <name>
 *   node usertool.js entfernen <name> [--eintraege] [--beitraege]
 *   node usertool.js eigentuemer <name>
 *   node usertool.js zweifaktor <name>
 *
 * Die Vorgaenge selbst stehen in auth.js und werden von der Verwaltungskarte
 * genauso gerufen. Hier steht nur die Bedienung: einlesen, fragen, ausgeben.
 * ZUGRIFF AUF DEN WIRT IST DIE BERECHTIGUNG -- wer diesen Befehl ausfuehren
 * kann, koennte auch die .env lesen. Eine Rechtefrage waere hier eine Kulisse.
 * Das bleibt so -- ABER die VIER schreibenden Befehle stehen im
 * Sicherheitsprotokoll. Sonst haette der Notweg als einziger keine Spur, und
 * genau er ist der, den man hinterher nachlesen moechte.
 */
const readline = require('readline');
const { db } = require('./db');
const auth = require('./auth');

const RED = (t) => `\x1b[31m${t}\x1b[0m`;
const BOLD = (t) => `\x1b[1m${t}\x1b[0m`;

function help() {
  console.log(`
${BOLD('Kriterion — Zugangsverwaltung')}

  node usertool.js liste
      Alle Zugaenge mit Nummer, Rolle, Status und Zahl der Eintraege.

  node usertool.js passwort <name>
      Setzt das Passwort neu. Fragt es zweimal ab; alle Sitzungen dieses
      Zugangs fallen. Rolle, Nummer und Bestand bleiben unangetastet.
      Das ist der haeufige Fall: Passwort vergessen.

  node usertool.js entfernen <name> [--eintraege] [--beitraege]
      Macht aus dem Zugang einen Grabstein: die Zeile bleibt mit ihrer Nummer
      stehen, der Name wird freigegeben, die Beitraege bleiben sichtbar und
      tragen kuenftig "Geloeschter Benutzer <nr>". Fragt vorher nach.
        --eintraege   loescht zusaetzlich SEINE Eintraege. Nimmt ueber die
                      Kaskade auch FREMDE Kommentare und Bewertungen mit.
        --beitraege   loescht zusaetzlich seine Kommentare, Bewertungen und
                      Testtage in fremden Eintraegen.

  node usertool.js eigentuemer <name>
      Macht den Zugang zum Eigentuemer der Instanz. Der Notausgang, wenn sich
      der bisherige nicht mehr anmeldet.

  node usertool.js zweifaktor <name>
      Schaltet den zweiten Faktor AUS. Der Notausgang, wenn das Telefon weg
      ist und auch die Wiederherstellungscodes aufgebraucht sind. Fragt vorher
      nach; Passwort, Rolle und Bestand bleiben unangetastet.
      EINSCHALTEN GEHT VON HIER AUS NICHT, und das ist Absicht: dazu muss das
      Geheimnis auf das Telefon des Betroffenen, und wer es fuer ihn erzeugte,
      sperrte ihn aus.
`);
}

/* Liest eine Zeile. Am Terminal wird ein Passwort nicht angezeigt.
 *
 * ZWEI WEGE, UND DAS IST KEINE UMSTAENDLICHKEIT: readline liest bei geroehrter
 * Eingabe VORAUS. Die zweite Zeile ist bereits durchgelaufen, waehrend die
 * erste Antwort noch verarbeitet wird -- die zweite Frage bekaeme dann nie
 * eine Antwort und der Befehl endete wortlos. Genau das ist beim Bauen
 * passiert: "Passwort setzen" lief durch, ohne etwas zu setzen.
 * Am Terminal gibt es das Problem nicht, weil dort erst getippt wird, wenn
 * gefragt ist. Ohne Terminal wird deshalb alles auf einmal gelesen und
 * zeilenweise ausgegeben. */
const onTerminal = Boolean(process.stdin.isTTY);
let pool = null, queue = null, masked = false;

function nextLine() {
  if (pool === null) {
    let all = '';
    try { all = require('fs').readFileSync(0, 'utf8'); } catch { all = ''; }
    pool = all.split('\n');
  }
  return pool.length ? pool.shift() : '';
}

function ask(text, hidden = false) {
  if (!onTerminal) {
    process.stdout.write(text);
    const a = nextLine();
    process.stdout.write('\n');
    return Promise.resolve(a);
  }
  if (!queue) {
    queue = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = queue._writeToOutput.bind(queue);
    queue._writeToOutput = (s) => { if (!masked || s.includes('\n')) write(s); };
  }
  return new Promise((done) => {
    masked = hidden;
    queue.question(text, (a) => {
      if (masked) { masked = false; console.log(); }
      done(a);
    });
  });
}
const closeQueue = () => { if (queue) queue.close(); };

function findUser(name) {
  const u = db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE').get(String(name || ''));
  if (!u) {
    console.error(RED(`Kein Zugang mit dem Namen "${name}".`));
    console.error('Vorhandene Namen zeigt: node usertool.js liste');
    process.exit(1);
  }
  return auth.getUser2(u.id);
}

const ROLE_KEY = { user: 'Benutzer', admin: 'Admin', owner: 'Eigentümer' };
/* DIE ZUSTAENDE HEISSEN SEIT 0.24.1 ENGLISCH -- auf dem Bildschirm des Wirts
   stehen sie weiter so, wie sie dort immer standen. Dieselbe Tafel wie
   ROLE_KEY darueber und derselbe Grund: der gespeicherte Wert ist Code, das
   Wort daneben ist Text fuer den, der hinsieht. */
const STATUS_WORD = { active: 'aktiv', locked: 'gesperrt', deleted: 'geloescht' };

function commandList() {
  const lines = auth.listUsers();
  if (!lines.length) { console.log('Es ist noch kein Zugang eingerichtet.'); return; }
  const width = Math.max(4, ...lines.map(z => z.username.length));
  // Die Spalte "2FA" . Sie sagt AN oder AUS und nie mehr -- das
  // Geheimnis steht auch hier nicht, und die Zahl der Wiederherstellungscodes
  // gehoert an den einen Ort, an dem sie jemanden angeht: die Karte "Zugang"
  // des Betroffenen und den Befehl `zweifaktor` daneben.
  console.log(`\n  ${'Nr'.padStart(3)}  ${'Name'.padEnd(width)}  ${'Rolle'.padEnd(11)}  ` +
              `${'Status'.padEnd(9)}  ${'2FA'.padEnd(4)}  ${'Einträge'.padStart(8)}  Letzte Anmeldung`);
  console.log('  ' + '─'.repeat(width + 58));
  for (const z of lines) {
    console.log(`  ${String(z.id).padStart(3)}  ${z.username.padEnd(width)}  ` +
      `${(ROLE_KEY[z.role] || z.role).padEnd(11)}  ${(STATUS_WORD[z.status] || z.status).padEnd(9)}  ` +
      `${(auth.twoFactorOn(z.id) ? 'an' : 'aus').padEnd(4)}  ` +
      `${String(z.entries).padStart(8)}  ${z.last_login || '—'}`);
  }
  console.log(`\n  ${lines.length === 1 ? '1 Zugang' : lines.length + ' Zugänge'}, ` +
    `davon ${auth.ownerCount()} mit Eigentümerrecht.\n`);
}

async function commandPassword(name) {
  const u = findUser(name);
  if (u.status === 'deleted') {
    console.error(RED(`"${u.username}" ist ein gelöschter Zugang und bekommt kein Passwort mehr.`));
    process.exit(1);
  }
  console.log(`Neues Passwort für "${u.username}" (Nummer ${u.id}, ${ROLE_KEY[u.role] || u.role}).`);
  // Zweimal, weil es nicht angezeigt wird: ein Tippfehler waere sonst erst beim
  // naechsten Anmeldeversuch zu bemerken -- und dann waere der Zugang zu.
  const a = await ask(`Passwort (mindestens ${auth.PASSWORD_MIN} Zeichen): `, true);
  const b = await ask('Zur Bestätigung noch einmal: ', true);
  if (a !== b) { console.error(RED('Die beiden Eingaben stimmen nicht überein. Nichts geändert.')); process.exit(1); }
  try {
    // VOM_WIRT statt einer Nummer: hier ist niemand angemeldet. Die Zeile im
    // Sicherheitsprotokoll traegt deshalb keinen Handelnden -- und genau daran
    // ist der Notweg spaeter zu erkennen.
    await auth.setNewPassword(u.id, a, auth.FROM_HOST);
  } catch (e) { console.error(RED(e.message)); process.exit(1); }
  console.log(`Passwort für "${u.username}" gesetzt. Alle bisherigen Sitzungen dieses Zugangs sind beendet.`);
}

async function commandRemove(name, options) {
  const u = findUser(name);
  const z = auth.countInventory(u.id);
  console.log(`\nZugang "${u.username}" (Nummer ${u.id}, ${ROLE_KEY[u.role] || u.role}) entfernen.`);
  console.log(`  Eigene Einträge: ${z.entries}`);
  console.log(`  Eigene Beiträge in fremden Einträgen: ${z.comments} Kommentare, ` +
              `${z.ratings} Bewertungen, ${z.testDays} Testtage`);
  if (options.entries) {
    console.log(RED(`  --eintraege: seine ${z.entries} Einträge werden gelöscht — mitsamt ` +
      `${z.foreignComments} fremden Kommentaren, ${z.foreignRatings} fremden Bewertungen ` +
      `und ${z.foreignTestDays} fremden Testtagen daran.`));
  } else {
    console.log('  Ohne --eintraege bleiben sie stehen und tragen künftig ' +
      `"Gelöschter Benutzer ${u.id}".`);
  }
  if (options.beitraege) {
    console.log(RED('  --beitraege: seine Kommentare, Bewertungen und Testtage in fremden ' +
      'Einträgen werden gelöscht.'));
  }
  console.log('  Der Name wird freigegeben und ist danach wieder vergebbar.');
  const answer = (await ask('\nWirklich entfernen? [ja/nein] ')).trim().toLowerCase();
  if (answer !== 'ja') { console.log('Abgebrochen, nichts geändert.'); return; }
  let result;
  try {
    result = auth.removeUser(u.id, options, auth.FROM_HOST);
  } catch (e) { console.error(RED(e.message)); process.exit(1); }
  console.log(`"${result.name}" ist entfernt. Die Zeile bleibt als ${result.tombstone} stehen.`);
}

/* DER NOTWEG AM ZWEITEN FAKTOR -- UND ER SCHALTET NUR AUS.
   Einschalten gaebe es hier nicht: das Geheimnis muesste auf das Telefon des
   Betroffenen, und wer es fuer ihn erzeugte, sperrte ihn aus. Ausschalten
   dagegen MUSS von hier aus gehen -- sonst waere "Telefon weg und
   Wiederherstellungscodes verbraucht" ein Zustand ohne Ausweg, und genau
   dagegen ist dieser Weg da.
   ES IST KEIN UMWEG UM DIE ANMELDUNG: das Passwort bleibt unberuehrt, und wer
   diesen Befehl ausfuehren kann, koennte ohnehin `passwort` setzen. */
async function commandTwoFactor(name) {
  const u = findUser(name);
  const status = auth.twoFactorState(u.id);
  if (!status.an) {
    console.log(`"${u.username}" hat keinen zweiten Faktor eingeschaltet. Nichts zu tun.`);
    return;
  }
  console.log(`\nZweiten Faktor von "${u.username}" (Nummer ${u.id}, ` +
    `${ROLE_KEY[u.role] || u.role}) ausschalten.`);
  console.log(`  Eingeschaltet seit: ${status.seit}`);
  console.log(`  Wiederherstellungscodes: ${status.codesOpen} von ${status.codesTotal} noch offen`);
  console.log('  Danach genügt zum Anmelden wieder das Passwort allein.');
  console.log('  Einschalten kann ihn nur der Betroffene selbst, in der Karte „Zugang“.');
  const answer = (await ask('\nWirklich ausschalten? [ja/nein] ')).trim().toLowerCase();
  if (answer !== 'ja') { console.log('Abgebrochen, nichts geändert.'); return; }
  // VOM_WIRT statt einer Nummer: hier ist niemand angemeldet. Das leere `wer`
  // im Protokoll heisst "ueber den Wirt" -- daran ist der Notweg zu erkennen.
  auth.turnTwoFactorOff(u.id, auth.FROM_HOST);
  console.log(`Der zweite Faktor von "${u.username}" ist ausgeschaltet. ` +
    'Die Wiederherstellungscodes sind mit weggefallen.');
}

function commandOwner(name) {
  const u = findUser(name);
  try {
    auth.setRole(u.id, 'owner', auth.FROM_HOST);
  } catch (e) { console.error(RED(e.message)); process.exit(1); }
  console.log(`"${u.username}" ist jetzt Eigentümer der Instanz. ` +
    `Aktive Eigentümer: ${auth.ownerCount()}.`);
}

async function main() {
  const [command, name, ...rest] = process.argv.slice(2);
  const options = { entries: rest.includes('--eintraege'), beitraege: rest.includes('--beitraege') };
  const needsName = () => {
    if (!name) { console.error(RED('Es fehlt der Benutzername.')); help(); process.exit(1); }
  };
  switch (command) {
    case 'liste': commandList(); break;
    case 'passwort': needsName(); await commandPassword(name); break;
    case 'entfernen': needsName(); await commandRemove(name, options); break;
    case 'eigentuemer': needsName(); commandOwner(name); break;
    case 'zweifaktor': needsName(); await commandTwoFactor(name); break;
    default:
      if (command) console.error(RED(`Unbekannter Befehl: ${command}`));
      help();
      process.exit(command ? 1 : 0);
  }
}

main()
  .then(() => { closeQueue(); })
  .catch((e) => { closeQueue(); console.error(RED(e.message)); process.exit(1); });
