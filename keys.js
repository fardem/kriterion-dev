const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
/* IM NEBEN-THREAD BLEIBT ES STILL -- 0.19.3. Der Bestandslauf oeffnet seit
   dieser Runde eine EIGENE Verbindung und laedt dabei denselben Schluessel
   denselben Weg (er reist ausdruecklich NICHT ueber workerData). Die Ansagen
   darueber gelten aber dem Betreiber und nicht dem Lauf: der Schluesselhinweis
   ist ein halber Bildschirm, und er staende bei jedem Umstellungslauf ein
   zweites Mal im Containerprotokoll. Wer ihn einmal gelesen hat, liest ihn
   beim zweiten Mal nicht besser.
   ES IST DER EINE SCHALTER, DEN DIESE RUNDE BRAUCHT: alles Uebrige, was beim
   Oeffnen laeuft, ist doppelt ausfuehrbar (siehe db.js). */
const { isMainThread } = require('worker_threads');

// Genau 64 Hex-Zeichen -- an EINER Stelle, weil die Frage an dreien gestellt
// wird: beim Laden, beim Erzeugen und beim Nachziehen der Ablage.
const HEX_PATTERN = /^[0-9a-fA-F]{64}$/;

/* ================= DER PRUEFSCHALTER -- 0.30.0, F1 und F2 =================
   WARUM ES IHN GIBT. Der Prueflauf zahlt zwei Kosten, die im Betrieb richtig
   und beim Pruefen sinnlos sind: die Kostenstufe von scrypt (sie rechnet
   absichtlich lange) und die drei Mailfristen (sie warten absichtlich lange).
   Gemessen am 12. September 2026 sind das zusammen rund 75 der 464 Sekunden
   eines Laufs -- und die Gegenprobe zahlt sie JE RUECKBAU noch einmal.

   WARUM ER HIER STEHT. Diese Datei ist die eine, die liest, WAS DIE INSTANZ
   AUS IHRER UMGEBUNG NIMMT, bevor irgendetwas laeuft -- bis 0.30.0 war das nur
   der Schluessel. Sie haengt an keiner anderen Datei des Hauses, und deshalb
   koennen auth.js und mail.js sie beide lesen, ohne einander zu brauchen. Eine
   NEUE Datei waere die neunzehnte im Fingerprint gewesen und damit selbst
   wieder etwas, das geprueft werden muss (F17, dieselbe Ueberlegung).

   WARUM ES EIN SCHALTER IST UND KEINE DREI VARIABLEN. Eine gewoehnliche
   Umgebungsvariable, die eine Sicherheitsgrenze senkt, senkt sie auch auf dem
   Wirt -- und zwar aus Versehen, weil sie so heisst, wie man sie erraet. Der
   Schalter traegt deshalb EINEN Namen, EINE Marke am Anfang und seine
   Einstellungen dahinter: `SCRYPT_N=1024` bewirkt nichts, `KRITERION_TESTBENCH
   =1` bewirkt nichts, und nur die vollstaendige Form wird ueberhaupt gelesen.

   UND ER KANN NICHT BELIEBIG WEIT. Jede Einstellung hat einen festen Boden;
   was darunter steht, wird auf ihn gehoben statt abgewiesen. Eine Instanz, die
   den Schalter aus Versehen traegt, ist damit langsamer zu pruefen, aber nicht
   ungeschuetzt.

   DIE AUSLIEFERUNG TRAEGT DIE ECHTEN WERTE FESTGENAGELT: ohne Schalter ist
   N = 16384 und sind die Fristen 20 / 7 / 7 Sekunden, und der Pruefstand haelt
   beide Zahlen namentlich (Zusagen 8 und 10). */
const TESTBENCH_NAME = 'KRITERION_TESTBENCH';
const TESTBENCH_MARK = 'pruefstand';
/* DER BODEN JE EINSTELLUNG. `scrypt` muss ausserdem eine Zweierpotenz sein --
   das verlangt scrypt selbst, und eine Zahl, die es nicht ist, wuerde beim
   ersten Hashen werfen statt beim Lesen aufzufallen. */
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

/* DIE KOSTENSTUFE VON scrypt. Ohne Schalter genau die ausgelieferte Zahl --
   und mit Schalter keine, die kleiner als der Boden oder keine Zweierpotenz
   ist. */
function scryptCost(shipped) {
  const set = testbenchSwitch();
  const wish = set && set.scrypt;
  if (!wish) return shipped;
  const floored = Math.max(TESTBENCH_FLOOR.scrypt, wish);
  // Auf die naechste Zweierpotenz NACH UNTEN, aber nie unter den Boden.
  const power = 2 ** Math.floor(Math.log2(floored));
  return Math.max(TESTBENCH_FLOOR.scrypt, power);
}

/* DIE MAILFRISTEN. Der Schalter traegt EINEN TEILER und keine drei Zahlen:
   die drei Fristen stehen in einem Verhaeltnis zueinander -- die aeussere
   Schranke ist fast dreimal so weit wie Gruss und Verbindung --, und wer sie
   einzeln stellte, koennte das Verhaeltnis umdrehen. Dann pruefte der Lauf
   eine Verdrahtung, die es im Betrieb nicht gibt. */
/* DIE WARTEZEIT DER ANMELDEBREMSE -- 0.30.0, F3. Gesenkt wird NUR das WARTEN,
   und ausdruecklich nicht die Kurve und nicht die Schwellen: `delay()` liefert
   weiter den ausgelieferten Wert fuer jeden Zaehlerstand (Zusage 6), weich ab
   fuenf und hart ab zehn bleiben, wo sie sind, und die harte Sperre dauert
   ihre fuenf Minuten.
   WAS DAS FUER EINE INSTANZ BEDEUTET, DIE DEN SCHALTER AUS VERSEHEN TRAEGT:
   sie bremst das Raten schwaecher, sperrt es aber genauso hart. Der Schutz vor
   dem Durchprobieren ist die SPERRE und nicht die Verzoegerung -- die
   Verzoegerung ist die Hoeflichkeit gegenueber dem, der sich vertippt hat.
   WARUM NICHT IN delay() SELBST: dann waere die Kurve nicht mehr die Kurve,
   und die Zusage, die sie fuer jeden Zaehlerstand belegt, laese den Schalter
   statt der Formel. */
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

// Der Schluessel wird gebraucht, um die Datenbankdatei ueberhaupt zu oeffnen.
// Er kann deshalb nicht in der Datenbank liegen, sondern nur aus der Umgebung
// oder aus einer Datei daneben kommen.
function loadKey(dataDir) {
  const fromEnv = process.env.ENCRYPTION_KEY;
  if (fromEnv && fromEnv.trim()) {
    const clean = fromEnv.trim();
    if (!HEX_PATTERN.test(clean)) {
      throw new Error('ENCRYPTION_KEY muss genau 64 Hex-Zeichen lang sein (erzeugen mit: openssl rand -hex 32)');
    }
    if (isMainThread) console.log('[Kriterion] Schluessel aus ENCRYPTION_KEY geladen.');
    return { hex: clean.toLowerCase(), fromEnv: true };
  }

  const keyPath = path.join(dataDir, 'encryption.key');
  if (fs.existsSync(keyPath)) {
    const hex = fs.readFileSync(keyPath, 'utf8').trim();
    warnKeyBesideData();
    return { hex: hex.toLowerCase(), fromEnv: false };
  }

  const hex = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(keyPath, hex, { mode: 0o600 });
  if (isMainThread) console.log('[Kriterion] Neuer Schluessel erzeugt.');
  warnKeyBesideData();
  return { hex, fromEnv: false };
}

function warnKeyBesideData() {
  if (!isMainThread) return;
  console.warn(
    '\n' +
    '  ------------------------------------------------------------------\n' +
    '  ACHTUNG: Der Schluessel liegt als data/encryption.key NEBEN der\n' +
    '  Datenbank. Wer das Verzeichnis data kopiert, kopiert ihn mit und\n' +
    '  kann alles lesen -- die Verschluesselung schuetzt dann nicht.\n' +
    '\n' +
    '  Fuer echten Schutz einen eigenen Schluessel erzeugen:\n' +
    '      openssl rand -hex 32\n' +
    '  und als ENCRYPTION_KEY in die .env eintragen.\n' +
    '  Danach gilt: .env und data/ NICHT in dieselbe Sicherung legen.\n' +
    '  Ohne den Schluessel sind alle Daten endgueltig verloren.\n' +
    '  ------------------------------------------------------------------\n'
  );
}

/* --- Den Schluessel wechseln ---------------------------------------------
   WER DAS HIER RUFT: ausschliesslich keytool.js auf dem Wirt. Der Server
   ruft NICHTS davon -- er liest seinen Schluessel beim Start und danach nie
   wieder. Es steht trotzdem hier und nicht dort: "woher der Schluessel kommt"
   und "wohin der neue geschrieben wird" sind dieselbe Frage, und zwei Stellen
   dafuer liefen auseinander. Und es ist hier ohne Datenbank pruefbar.

   ZWEI ABLAGEN, WEIL ES ZWEI HERKUENFTE GIBT -- genau die Unterscheidung, die
   loadKey() oben trifft:
     aus der Datei    data/encryption.key wird neu geschrieben, fertig.
     aus der Umgebung die .env liegt auf dem WIRT und ist per .dockerignore
                      nicht einmal im Image. Sie muss dem Vorgang eigens
                      eingehaengt werden; ohne sie kann er nicht zu Ende
                      gefuehrt werden und wird deshalb gar nicht erst
                      angefangen. */

function createKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Die Ablage neben der Datenbank. Erst daneben, dann umbenannt: eine
// halbgeschriebene Schluesseldatei ist genauso toedlich wie ein halber Wechsel
// (Stolperstein 8).
function writeKeyFile(dataDir, hex) {
  if (!HEX_PATTERN.test(hex)) throw new Error('Der neue Schluessel ist kein 64-stelliger Hexwert.');
  const target = path.join(dataDir, 'encryption.key');
  const becoming = target + '.wird';
  fs.writeFileSync(becoming, hex, { mode: 0o600 });
  fs.renameSync(becoming, target);
  return target;
}

/* Die aktive ENCRYPTION_KEY-Zeile einer .env -- und ausdruecklich nur eine
   AKTIVE. Eine auskommentierte Zeile ist keine Einstellung, sondern ein
   Hinweis; in der .env.example stehen sechs davon. Liefert Nummer und Wert
   oder null. */
function findEnvLine(lines) {
  const hit = [];
  lines.forEach((z, i) => {
    const m = z.match(/^\s*ENCRYPTION_KEY\s*=\s*(.*?)\s*$/);
    if (m) hit.push({ nr: i, value: m[1] });
  });
  return hit;
}

/* Schreibt den neuen Wert in die .env und kommentiert den alten aus.
   DER ALTE WERT IST KEIN ABFALL: er oeffnet jede Sicherung, die vor dem
   Wechsel entstanden ist. Wer ihn wegwirft, wirft die Sicherungen weg --
   deshalb bleibt er als Kommentar stehen, mit dem Satz daneben, wofuer er noch
   gut ist.
   NUR DIESE EINE ZEILE WIRD ANGEFASST. Alles andere -- Kommentare,
   Leerzeilen, andere Werte, die Reihenfolge -- bleibt Zeichen fuer Zeichen
   stehen.
   `who` ist eine NOTIZ und keine Feststellung: wer den Befehl auf dem Wirt
   ausfuehren kann, kann sie auch setzen. Sie steht deshalb in der .env und
   ausdruecklich NICHT im Sicherheitsprotokoll -- dort traegt der Vorgang das
   leere `who` von usertool.js, und das heisst "ueber den Wirt". */
/* Die Notiz, WER gewechselt hat, landet in einer Datei, die beim naechsten
   Start Zeile fuer Zeile gelesen wird. Ein Zeilenumbruch darin schoebe eine
   erfundene Einstellung dazwischen -- deshalb bleibt vom Text nur, was in eine
   Zeile gehoert, und er wird gekuerzt. Es ist ohnehin eine Notiz und keine
   Feststellung. */
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
  /* DIE .ENV MUSS ZU DIESER INSTANZ GEHOEREN. Steht dort ein anderer Wert als
     der, mit dem die Datenbank gerade offen ist, ist es die falsche Datei --
     und sie zu ueberschreiben naehme jemandem den Schluessel zu einer anderen
     Instanz weg. */
  if (old.toLowerCase() !== String(oldHex).toLowerCase())
    throw new Error(`Die Zeile ENCRYPTION_KEY in ${file} traegt einen anderen Wert als den, ` +
      'mit dem diese Datenbank offen ist. Das ist nicht die .env dieser Instanz.');
  lines.splice(hit[0].nr, 1,
    `# Abgeloest am ${stamp} durch ${cleanNote(who)} (keytool.js).`,
    '# ER OEFFNET ALLE SICHERUNGEN VON VOR DIESEM ZEITPUNKT -- nicht loeschen,',
    '# bevor er im Passwortspeicher steht.',
    `#ENCRYPTION_KEY=${old}`,
    `ENCRYPTION_KEY=${newHex}`);
  /* Danebenschreiben, dann umbenennen -- eine halbgeschriebene .env startet
     nichts mehr (Stolperstein 8).
     DARAUS FOLGT EINE BEDINGUNG AN DEN AUFRUFER: die .env muss ueber ihr
     VERZEICHNIS erreichbar sein, nicht als einzeln eingehaengte Datei. Eine
     Datei-Einhaengung haengt am Inode; ein Umbenennen daneben tauscht den
     Verzeichniseintrag und liesse die Einhaengung auf der alten Datei stehen.
     keytool.sh haengt deshalb das Projektverzeichnis ein und nicht die
     Datei. */
  const becoming = file + '.wird';
  fs.writeFileSync(becoming, lines.join('\n'), { mode: 0o600 });
  fs.renameSync(becoming, file);
  return old;
}

module.exports = { loadKey, HEX_PATTERN, createKey, cleanNote,
                   writeKeyFile, findEnvLine, writeEnvLine,
                   /* DER PRUEFSCHALTER GEHT MIT HINAUS -- 0.30.0: auth.js und
                      mail.js lesen ihn, und der Pruefstand sieht ihm zu. */
                   testbenchSwitch, scryptCost, mailDeadline, brakeWait,
                   TESTBENCH_NAME, TESTBENCH_MARK, TESTBENCH_FLOOR };
