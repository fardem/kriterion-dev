const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { logLine, logWarn, logFail } = require('./log');
// Die Ansagen dieser Datei gelten dem Betreiber. Im Neben-Thread bleiben
// sie aus, sonst staenden sie bei jedem Bestandslauf ein zweites Mal im
// Containerprotokoll.
const { isMainThread } = require('worker_threads');

// Genau 64 Hex-Zeichen. An einer Stelle, weil die Frage an dreien gestellt
// wird: beim Laden, beim Erzeugen und beim Nachziehen der Ablage.
const HEX_PATTERN = /^[0-9a-fA-F]{64}$/;

/* Der Pruefschalter. Er senkt fuer den Prueflauf drei Kosten, die im Betrieb
   richtig und beim Pruefen sinnlos sind: die Kostenstufe von scrypt, die drei
   Mailfristen und die Wartezeit der Anmeldebremse.
   Er steht hier, weil diese Datei die eine ist, die aus der Umgebung liest,
   bevor etwas laeuft; auth.js und mail.js lesen sie beide.
   Ein Schalter und nicht drei Variablen: nur die vollstaendige Form
   `pruefstand:name=wert` wird gelesen, `SCRYPT_N=1024` bewirkt nichts. Jede
   Einstellung hat einen Boden, unter den sie nicht faellt.
   Ohne Schalter gelten die ausgelieferten Zahlen. */
const TESTBENCH_NAME = 'KRITERION_TESTBENCH';
const TESTBENCH_MARK = 'pruefstand';
// Der Boden je Einstellung. `scrypt` muss ausserdem eine Zweierpotenz sein.
const TESTBENCH_FLOOR = { scrypt: 1024, mail: 100, brake: 10 };

function testbenchSwitch() {
  const raw = String(process.env[TESTBENCH_NAME] || '').trim();
  if (!raw.startsWith(TESTBENCH_MARK + ':')) return null;
  const outcome = {};
  for (const piece of raw.slice(TESTBENCH_MARK.length + 1).split(':')) {
    const cut = piece.indexOf('=');
    if (cut < 1) continue;
    const name = piece.slice(0, cut).trim();
    const value = piece.slice(cut + 1).trim();
    if (/^\d+$/.test(value)) outcome[name] = Number(value);
  }
  return Object.keys(outcome).length ? outcome : null;
}

/* Die Kostenstufe von scrypt. Ohne Schalter die ausgelieferte Zahl, mit
   Schalter keine unter dem Boden und keine, die keine Zweierpotenz ist. */
function scryptCost(shipped) {
  const set = testbenchSwitch();
  const wish = set && set.scrypt;
  if (!wish) return shipped;
  const floored = Math.max(TESTBENCH_FLOOR.scrypt, wish);
  // Auf die naechste Zweierpotenz NACH UNTEN, aber nie unter den Boden.
  const power = 2 ** Math.floor(Math.log2(floored));
  return Math.max(TESTBENCH_FLOOR.scrypt, power);
}

/* Die Wartezeit der Anmeldebremse. Gesenkt wird nur das Warten, nicht die
   Kurve und nicht die Schwellen: delay() liefert weiter den ausgelieferten
   Wert, weich ab fuenf und hart ab zehn bleiben, die harte Sperre dauert
   ihre fuenf Minuten. */
function brakeWait(shipped) {
  if (!shipped) return 0;
  const set = testbenchSwitch();
  const part = set && set.brake;
  if (!part || part < 1) return shipped;
  return Math.max(TESTBENCH_FLOOR.brake, Math.round(shipped / part));
}

function mailDeadline(shipped) {
  const set = testbenchSwitch();
  const part = set && set.mail;
  if (!part || part < 1) return shipped;
  return Math.max(TESTBENCH_FLOOR.mail, Math.round(shipped / part));
}

// Der Schluessel oeffnet die Datenbankdatei und kann deshalb nicht darin
// liegen: er kommt aus der Umgebung oder aus einer Datei daneben. Fehlt
// beides, wird einer erzeugt.
function loadKey(dataDir) {
  const fromEnv = process.env.ENCRYPTION_KEY;
  if (fromEnv && fromEnv.trim()) {
    const clean = fromEnv.trim();
    if (!HEX_PATTERN.test(clean)) {
      throw new Error('ENCRYPTION_KEY muss genau 64 Hex-Zeichen lang sein (erzeugen mit: openssl rand -hex 32)');
    }
    if (isMainThread) logLine('Key loaded from ENCRYPTION_KEY.');
    return { hex: clean.toLowerCase(), fromEnv: true };
  }

  const keyPath = path.join(dataDir, 'encryption.key');
  if (fs.existsSync(keyPath)) {
    const hex = fs.readFileSync(keyPath, 'utf8').trim();
    /* Genau 64 Hex-Zeichen nimmt SQLCipher als Schluessel, alles andere als
       Passwort. Eine abgeschnittene Datei meldete deshalb nicht sich selbst,
       sondern `SQLITE_NOTADB file is not a database` -- und wo keine
       Datenbank liegt, legte sie eine neue unter einem Schluessel an, der
       sich nicht wiederherstellen laesst. */
    if (!HEX_PATTERN.test(hex))
      throw new Error(`${keyPath} enthaelt keine 64 Hex-Zeichen, sondern ` +
        `${hex.length} Zeichen. Die Datei ist leer, abgeschnitten oder ` +
        'beschaedigt. Wird sie jetzt ersetzt, ist die vorhandene Datenbank ' +
        'nicht mehr zu oeffnen -- erst die Sicherung der Datei suchen.');
    warnKeyBesideData();
    return { hex: hex.toLowerCase(), fromEnv: false };
  }

  const hex = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(keyPath, hex, { mode: 0o600 });
  if (isMainThread) logLine('New key created.');
  warnKeyBesideData();
  return { hex, fromEnv: false };
}

function warnKeyBesideData() {
  if (!isMainThread) return;
  console.warn(
    '\n' +
    '  ------------------------------------------------------------------\n' +
    '  CAUTION: the key sits NEXT TO the database, as\n' +
    '  data/encryption.key. Whoever copies the data directory copies the\n' +
    '  key along with it and can read everything -- the encryption then\n' +
    '  protects nothing.\n' +
    '\n' +
    '  For real protection, create your own key:\n' +
    '      openssl rand -hex 32\n' +
    '  and put it into .env as ENCRYPTION_KEY.\n' +
    '  After that: never keep .env and data/ in the same backup.\n' +
    '  Without the key, all data is lost for good.\n' +
    '  ------------------------------------------------------------------\n'
  );
}

/* Den Schluessel wechseln. Gerufen wird das nur von keytool.js auf dem
   Wirt; der Server liest seinen Schluessel beim Start und danach nie wieder.
   Zwei Ablagen, weil loadKey() oben zwei Herkuenfte kennt: die Datei neben
   der Datenbank und die .env auf dem Wirt. */

function createKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Die Ablage neben der Datenbank. Erst daneben schreiben, dann umbenennen:
// eine halbgeschriebene Schluesseldatei oeffnet nichts mehr.
function writeKeyFile(dataDir, hex) {
  if (!HEX_PATTERN.test(hex)) throw new Error('Der neue Schluessel ist kein 64-stelliger Hexwert.');
  const target = path.join(dataDir, 'encryption.key');
  const becoming = target + '.wird';
  fs.writeFileSync(becoming, hex, { mode: 0o600 });
  fs.renameSync(becoming, target);
  return target;
}

/* Die aktiven ENCRYPTION_KEY-Zeilen einer .env, mit Nummer und Wert. Eine
   auskommentierte Zeile zaehlt nicht: in der .env.example stehen sechs. */
function findEnvLine(lines) {
  const hit = [];
  lines.forEach((z, i) => {
    const m = z.match(/^\s*ENCRYPTION_KEY\s*=\s*(.*?)\s*$/);
    if (m) hit.push({ nr: i, value: m[1] });
  });
  return hit;
}

/* Bringt die Notiz `who` auf eine Zeile und kuerzt sie auf 80 Zeichen. Sie
   landet in einer Datei, die beim Start Zeile fuer Zeile gelesen wird; ein
   Zeilenumbruch darin schoebe eine erfundene Einstellung dazwischen. */
function cleanNote(text) {
  const s = String(text == null ? '' : text).replace(/[\r\n]+/g, ' ').trim();
  return (s ? s.slice(0, 80) : 'unbekannt');
}

function writeEnvLine(file, oldHex, newHex, who, stamp) {
  if (!HEX_PATTERN.test(newHex)) throw new Error('Der neue Schluessel ist kein 64-stelliger Hexwert.');
  const raw = fs.readFileSync(file, 'utf8');
  // Die Zeilenenden bleiben, wie sie sind: eine .env, die nach dem Wechsel
  // ploetzlich CRLF traegt, waere eine Aenderung, die niemand bestellt hat.
  const lines = raw.split('\n');
  const hit = findEnvLine(lines);
  if (!hit.length)
    throw new Error(`In ${file} steht keine aktive Zeile ENCRYPTION_KEY=. ` +
      'Der Schluessel kommt dann aus einer anderen Quelle (etwa environment: ' +
      'in der docker-compose.yml), und die kennt dieser Befehl nicht.');
  if (hit.length > 1)
    throw new Error(`In ${file} stehen ${hit.length} aktive Zeilen ENCRYPTION_KEY=. ` +
      'Welche gemeint ist, entscheidet dieser Befehl nicht.');
  const old = hit[0].value.trim();
  // Die .env muss zu dieser Instanz gehoeren: steht dort ein anderer Wert
  // als der, mit dem die Datenbank offen ist, ist es die falsche Datei.
  if (old.toLowerCase() !== String(oldHex).toLowerCase())
    throw new Error(`Die Zeile ENCRYPTION_KEY in ${file} traegt einen anderen Wert als den, ` +
      'mit dem diese Datenbank offen ist. Das ist nicht die .env dieser Instanz.');
  // Der alte Wert bleibt als Kommentar stehen: er oeffnet jede Sicherung von
  // vor dem Wechsel. Angefasst wird nur diese eine Zeile.
  lines.splice(hit[0].nr, 1,
    `# Abgeloest am ${stamp} durch ${cleanNote(who)} (keytool.js).`,
    '# ER OEFFNET ALLE SICHERUNGEN VON VOR DIESEM ZEITPUNKT -- nicht loeschen,',
    '# bevor er im Passwortspeicher steht.',
    `#ENCRYPTION_KEY=${old}`,
    `ENCRYPTION_KEY=${newHex}`);
  /* Danebenschreiben, dann umbenennen. Der Aufrufer muss die .env deshalb
     ueber ihr Verzeichnis erreichbar machen und nicht als einzeln
     eingehaengte Datei -- keytool.sh haengt das Projektverzeichnis ein. */
  const becoming = file + '.wird';
  fs.writeFileSync(becoming, lines.join('\n'), { mode: 0o600 });
  fs.renameSync(becoming, file);
  return old;
}

module.exports = { loadKey, HEX_PATTERN, createKey,
                   writeKeyFile, findEnvLine, writeEnvLine,
                   testbenchSwitch, scryptCost, mailDeadline, brakeWait,
                   TESTBENCH_NAME };
