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
   WER DAS HIER RUFT: ausschliesslich schluessel.js auf dem Wirt. Der Server
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
    if (m) hit.push({ nr: i, wert: m[1] });
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
   leere `who` von zugang.js, und das heisst "ueber den Wirt". */
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
  const old = hit[0].wert.trim();
  /* DIE .ENV MUSS ZU DIESER INSTANZ GEHOEREN. Steht dort ein anderer Wert als
     der, mit dem die Datenbank gerade offen ist, ist es die falsche Datei --
     und sie zu ueberschreiben naehme jemandem den Schluessel zu einer anderen
     Instanz weg. */
  if (old.toLowerCase() !== String(oldHex).toLowerCase())
    throw new Error(`Die Zeile ENCRYPTION_KEY in ${file} traegt einen anderen Wert als den, ` +
      'mit dem diese Datenbank offen ist. Das ist nicht die .env dieser Instanz.');
  lines.splice(hit[0].nr, 1,
    `# Abgeloest am ${stamp} durch ${cleanNote(who)} (schluessel.js).`,
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
     schluessel.sh haengt deshalb das Projektverzeichnis ein und nicht die
     Datei. */
  const becoming = file + '.wird';
  fs.writeFileSync(becoming, lines.join('\n'), { mode: 0o600 });
  fs.renameSync(becoming, file);
  return old;
}

module.exports = { loadKey, HEX_PATTERN, createKey, cleanNote,
                   writeKeyFile, findEnvLine, writeEnvLine };
