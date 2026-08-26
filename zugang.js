#!/usr/bin/env node
/* Zugangsverwaltung auf dem Wirt -- derselbe Weg, den Nextcloud
 * (occ user:resetpassword), GitLab und Grafana gehen: ein Befehl auf dem
 * Wirt, ein Name, ein Vorgang.
 *
 *   node zugang.js liste
 *   node zugang.js passwort <name>
 *   node zugang.js entfernen <name> [--eintraege] [--beitraege]
 *   node zugang.js eigentuemer <name>
 *   node zugang.js zweifaktor <name>
 *
 * Die Vorgaenge selbst stehen in auth.js und werden von der Verwaltungskarte
 * genauso gerufen. Hier steht nur die Bedienung: einlesen, fragen, ausgeben.
 * ZUGRIFF AUF DEN WIRT IST DIE BERECHTIGUNG -- wer diesen Befehl ausfuehren
 * kann, koennte auch die .env lesen. Eine Rechtefrage waere hier eine Kulisse.
 * Das bleibt so -- ABER die VIER schreibenden Befehle stehen im
 * Sicherheitsprotokoll. Sonst haette der Notweg als einziger keine Spur, und
 * genau er ist der, den man hinterher nachlesen moechte.
 * (Bis 0.9.1 waren es drei; 'zweifaktor' ist mit 0.10.0 dazugekommen.)
 */
const readline = require('readline');
const { db } = require('./db');
const auth = require('./auth');

const ROT = (t) => `\x1b[31m${t}\x1b[0m`;
const FETT = (t) => `\x1b[1m${t}\x1b[0m`;

function hilfe() {
  console.log(`
${FETT('Kriterion — Zugangsverwaltung')}

  node zugang.js liste
      Alle Zugaenge mit Nummer, Rolle, Status und Zahl der Eintraege.

  node zugang.js passwort <name>
      Setzt das Passwort neu. Fragt es zweimal ab; alle Sitzungen dieses
      Zugangs fallen. Rolle, Nummer und Bestand bleiben unangetastet.
      Das ist der haeufige Fall: Passwort vergessen.

  node zugang.js entfernen <name> [--eintraege] [--beitraege]
      Macht aus dem Zugang einen Grabstein: die Zeile bleibt mit ihrer Nummer
      stehen, der Name wird freigegeben, die Beitraege bleiben sichtbar und
      tragen kuenftig "Geloeschter Benutzer <nr>". Fragt vorher nach.
        --eintraege   loescht zusaetzlich SEINE Eintraege. Nimmt ueber die
                      Kaskade auch FREMDE Kommentare und Bewertungen mit.
        --beitraege   loescht zusaetzlich seine Kommentare, Bewertungen und
                      Testtage in fremden Eintraegen.

  node zugang.js eigentuemer <name>
      Macht den Zugang zum Eigentuemer der Anlage. Der Notausgang, wenn sich
      der bisherige nicht mehr anmeldet.

  node zugang.js zweifaktor <name>
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
const amTerminal = Boolean(process.stdin.isTTY);
let vorrat = null, schlange = null, versteckt = false;

function naechsteZeile() {
  if (vorrat === null) {
    let alles = '';
    try { alles = require('fs').readFileSync(0, 'utf8'); } catch { alles = ''; }
    vorrat = alles.split('\n');
  }
  return vorrat.length ? vorrat.shift() : '';
}

function frage(text, geheim = false) {
  if (!amTerminal) {
    process.stdout.write(text);
    const a = naechsteZeile();
    process.stdout.write('\n');
    return Promise.resolve(a);
  }
  if (!schlange) {
    schlange = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const schreib = schlange._writeToOutput.bind(schlange);
    schlange._writeToOutput = (s) => { if (!versteckt || s.includes('\n')) schreib(s); };
  }
  return new Promise((fertig) => {
    versteckt = geheim;
    schlange.question(text, (a) => {
      if (versteckt) { versteckt = false; console.log(); }
      fertig(a);
    });
  });
}
const schlangeSchliessen = () => { if (schlange) schlange.close(); };

function findeZugang(name) {
  const u = db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE').get(String(name || ''));
  if (!u) {
    console.error(ROT(`Kein Zugang mit dem Namen "${name}".`));
    console.error('Vorhandene Namen zeigt: node zugang.js liste');
    process.exit(1);
  }
  return auth.holeZugang(u.id);
}

const ROLLENWORT = { user: 'Benutzer', admin: 'Admin', eigentuemer: 'Eigentümer' };

function befehlListe() {
  const zeilen = auth.listeZugaenge();
  if (!zeilen.length) { console.log('Es ist noch kein Zugang eingerichtet.'); return; }
  const breite = Math.max(4, ...zeilen.map(z => z.username.length));
  // Die Spalte "2FA" seit 0.10.0. Sie sagt AN oder AUS und nie mehr -- das
  // Geheimnis steht auch hier nicht, und die Zahl der Wiederherstellungscodes
  // gehoert an den einen Ort, an dem sie jemanden angeht: die Karte "Zugang"
  // des Betroffenen und den Befehl `zweifaktor` daneben.
  console.log(`\n  ${'Nr'.padStart(3)}  ${'Name'.padEnd(breite)}  ${'Rolle'.padEnd(11)}  ` +
              `${'Status'.padEnd(9)}  ${'2FA'.padEnd(4)}  ${'Einträge'.padStart(8)}  Letzte Anmeldung`);
  console.log('  ' + '─'.repeat(breite + 58));
  for (const z of zeilen) {
    console.log(`  ${String(z.id).padStart(3)}  ${z.username.padEnd(breite)}  ` +
      `${(ROLLENWORT[z.role] || z.role).padEnd(11)}  ${z.status.padEnd(9)}  ` +
      `${(auth.zweifaktorAn(z.id) ? 'an' : 'aus').padEnd(4)}  ` +
      `${String(z.eintraege).padStart(8)}  ${z.last_login || '—'}`);
  }
  console.log(`\n  ${zeilen.length === 1 ? '1 Zugang' : zeilen.length + ' Zugänge'}, ` +
    `davon ${auth.zahlEigentuemer()} mit Eigentümerrecht.\n`);
}

async function befehlPasswort(name) {
  const u = findeZugang(name);
  if (u.status === 'geloescht') {
    console.error(ROT(`"${u.username}" ist ein gelöschter Zugang und bekommt kein Passwort mehr.`));
    process.exit(1);
  }
  console.log(`Neues Passwort für "${u.username}" (Nummer ${u.id}, ${ROLLENWORT[u.role] || u.role}).`);
  // Zweimal, weil es nicht angezeigt wird: ein Tippfehler waere sonst erst beim
  // naechsten Anmeldeversuch zu bemerken -- und dann waere der Zugang zu.
  const a = await frage(`Passwort (mindestens ${auth.PASSWORT_MIN} Zeichen): `, true);
  const b = await frage('Zur Bestätigung noch einmal: ', true);
  if (a !== b) { console.error(ROT('Die beiden Eingaben stimmen nicht überein. Nichts geändert.')); process.exit(1); }
  try {
    // VOM_WIRT statt einer Nummer: hier ist niemand angemeldet. Die Zeile im
    // Sicherheitsprotokoll traegt deshalb keinen Handelnden -- und genau daran
    // ist der Notweg spaeter zu erkennen.
    await auth.setzeNeuesPasswort(u.id, a, auth.VOM_WIRT);
  } catch (e) { console.error(ROT(e.message)); process.exit(1); }
  console.log(`Passwort für "${u.username}" gesetzt. Alle bisherigen Sitzungen dieses Zugangs sind beendet.`);
}

async function befehlEntfernen(name, optionen) {
  const u = findeZugang(name);
  const z = auth.zaehleBestand(u.id);
  console.log(`\nZugang "${u.username}" (Nummer ${u.id}, ${ROLLENWORT[u.role] || u.role}) entfernen.`);
  console.log(`  Eigene Einträge: ${z.eintraege}`);
  console.log(`  Eigene Beiträge in fremden Einträgen: ${z.kommentare} Kommentare, ` +
              `${z.bewertungen} Bewertungen, ${z.testtage} Testtage`);
  if (optionen.eintraege) {
    console.log(ROT(`  --eintraege: seine ${z.eintraege} Einträge werden gelöscht — mitsamt ` +
      `${z.fremdKommentare} fremden Kommentaren, ${z.fremdBewertungen} fremden Bewertungen ` +
      `und ${z.fremdTesttage} fremden Testtagen daran.`));
  } else {
    console.log('  Ohne --eintraege bleiben sie stehen und tragen künftig ' +
      `"Gelöschter Benutzer ${u.id}".`);
  }
  if (optionen.beitraege) {
    console.log(ROT('  --beitraege: seine Kommentare, Bewertungen und Testtage in fremden ' +
      'Einträgen werden gelöscht.'));
  }
  console.log('  Der Name wird freigegeben und ist danach wieder vergebbar.');
  const antwort = (await frage('\nWirklich entfernen? [ja/nein] ')).trim().toLowerCase();
  if (antwort !== 'ja') { console.log('Abgebrochen, nichts geändert.'); return; }
  let ergebnis;
  try {
    ergebnis = auth.entferneZugang(u.id, optionen, auth.VOM_WIRT);
  } catch (e) { console.error(ROT(e.message)); process.exit(1); }
  console.log(`"${ergebnis.name}" ist entfernt. Die Zeile bleibt als ${ergebnis.grabstein} stehen.`);
}

/* DER NOTWEG AM ZWEITEN FAKTOR, seit 0.10.0 -- UND ER SCHALTET NUR AUS.
   Einschalten gaebe es hier nicht: das Geheimnis muesste auf das Telefon des
   Betroffenen, und wer es fuer ihn erzeugte, sperrte ihn aus. Ausschalten
   dagegen MUSS von hier aus gehen -- sonst waere "Telefon weg und
   Wiederherstellungscodes verbraucht" ein Zustand ohne Ausweg, und genau
   dagegen ist dieser Weg da.
   ES IST KEIN UMWEG UM DIE ANMELDUNG: das Passwort bleibt unberuehrt, und wer
   diesen Befehl ausfuehren kann, koennte ohnehin `passwort` setzen. */
async function befehlZweifaktor(name) {
  const u = findeZugang(name);
  const stand = auth.zweifaktorStand(u.id);
  if (!stand.an) {
    console.log(`"${u.username}" hat keinen zweiten Faktor eingeschaltet. Nichts zu tun.`);
    return;
  }
  console.log(`\nZweiten Faktor von "${u.username}" (Nummer ${u.id}, ` +
    `${ROLLENWORT[u.role] || u.role}) ausschalten.`);
  console.log(`  Eingeschaltet seit: ${stand.seit}`);
  console.log(`  Wiederherstellungscodes: ${stand.codesOffen} von ${stand.codesGesamt} noch offen`);
  console.log('  Danach genügt zum Anmelden wieder das Passwort allein.');
  console.log('  Einschalten kann ihn nur der Betroffene selbst, in der Karte „Zugang“.');
  const antwort = (await frage('\nWirklich ausschalten? [ja/nein] ')).trim().toLowerCase();
  if (antwort !== 'ja') { console.log('Abgebrochen, nichts geändert.'); return; }
  // VOM_WIRT statt einer Nummer: hier ist niemand angemeldet. Das leere `wer`
  // im Protokoll heisst "ueber den Wirt" -- daran ist der Notweg zu erkennen.
  auth.schalteZweifaktorAus(u.id, auth.VOM_WIRT);
  console.log(`Der zweite Faktor von "${u.username}" ist ausgeschaltet. ` +
    'Die Wiederherstellungscodes sind mit weggefallen.');
}

function befehlEigentuemer(name) {
  const u = findeZugang(name);
  try {
    auth.setzeRolle(u.id, 'eigentuemer', auth.VOM_WIRT);
  } catch (e) { console.error(ROT(e.message)); process.exit(1); }
  console.log(`"${u.username}" ist jetzt Eigentümer der Anlage. ` +
    `Aktive Eigentümer: ${auth.zahlEigentuemer()}.`);
}

async function haupt() {
  const [befehl, name, ...rest] = process.argv.slice(2);
  const optionen = { eintraege: rest.includes('--eintraege'), beitraege: rest.includes('--beitraege') };
  const brauchtNamen = () => {
    if (!name) { console.error(ROT('Es fehlt der Benutzername.')); hilfe(); process.exit(1); }
  };
  switch (befehl) {
    case 'liste': befehlListe(); break;
    case 'passwort': brauchtNamen(); await befehlPasswort(name); break;
    case 'entfernen': brauchtNamen(); await befehlEntfernen(name, optionen); break;
    case 'eigentuemer': brauchtNamen(); befehlEigentuemer(name); break;
    case 'zweifaktor': brauchtNamen(); await befehlZweifaktor(name); break;
    default:
      if (befehl) console.error(ROT(`Unbekannter Befehl: ${befehl}`));
      hilfe();
      process.exit(befehl ? 1 : 0);
  }
}

haupt()
  .then(() => { schlangeSchliessen(); })
  .catch((e) => { schlangeSchliessen(); console.error(ROT(e.message)); process.exit(1); });
