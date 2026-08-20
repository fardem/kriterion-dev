const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Der Schluessel wird gebraucht, um die Datenbankdatei ueberhaupt zu oeffnen.
// Er kann deshalb nicht in der Datenbank liegen, sondern nur aus der Umgebung
// oder aus einer Datei daneben kommen.
function loadKey(dataDir) {
  const fromEnv = process.env.ENCRYPTION_KEY;
  if (fromEnv && fromEnv.trim()) {
    const clean = fromEnv.trim();
    if (!/^[0-9a-fA-F]{64}$/.test(clean)) {
      throw new Error('ENCRYPTION_KEY muss genau 64 Hex-Zeichen lang sein (erzeugen mit: openssl rand -hex 32)');
    }
    console.log('[Kriterion] Schluessel aus ENCRYPTION_KEY geladen.');
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
  console.log('[Kriterion] Neuer Schluessel erzeugt.');
  warnKeyBesideData();
  return { hex, fromEnv: false };
}

function warnKeyBesideData() {
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
    '  Danach gilt: .env und data/ NICHT ins selbe Backup legen.\n' +
    '  Ohne den Schluessel sind alle Daten endgueltig verloren.\n' +
    '  ------------------------------------------------------------------\n'
  );
}

module.exports = { loadKey };
