const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Genau 64 Hex-Zeichen -- an EINER Stelle, weil die Frage an dreien gestellt
// wird: beim Laden, beim Erzeugen und beim Nachziehen der Ablage.
const HEX_MUSTER = /^[0-9a-fA-F]{64}$/;

// Der Schluessel wird gebraucht, um die Datenbankdatei ueberhaupt zu oeffnen.
// Er kann deshalb nicht in der Datenbank liegen, sondern nur aus der Umgebung
// oder aus einer Datei daneben kommen.
function loadKey(dataDir) {
  const fromEnv = process.env.ENCRYPTION_KEY;
  if (fromEnv && fromEnv.trim()) {
    const clean = fromEnv.trim();
    if (!HEX_MUSTER.test(clean)) {
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

function erzeugeSchluessel() {
  return crypto.randomBytes(32).toString('hex');
}

// Die Ablage neben der Datenbank. Erst daneben, dann umbenannt: eine
// halbgeschriebene Schluesseldatei ist genauso toedlich wie ein halber Wechsel
// (Stolperstein 8).
function schreibeSchluesselDatei(dataDir, hex) {
  if (!HEX_MUSTER.test(hex)) throw new Error('Der neue Schluessel ist kein 64-stelliger Hexwert.');
  const ziel = path.join(dataDir, 'encryption.key');
  const werdend = ziel + '.wird';
  fs.writeFileSync(werdend, hex, { mode: 0o600 });
  fs.renameSync(werdend, ziel);
  return ziel;
}

/* Die aktive ENCRYPTION_KEY-Zeile einer .env -- und ausdruecklich nur eine
   AKTIVE. Eine auskommentierte Zeile ist keine Einstellung, sondern ein
   Hinweis; in der .env.example stehen sechs davon. Liefert Nummer und Wert
   oder null. */
function findeEnvZeile(zeilen) {
  const treffer = [];
  zeilen.forEach((z, i) => {
    const m = z.match(/^\s*ENCRYPTION_KEY\s*=\s*(.*?)\s*$/);
    if (m) treffer.push({ nr: i, wert: m[1] });
  });
  return treffer;
}

/* Schreibt den neuen Wert in die .env und kommentiert den alten aus.
   DER ALTE WERT IST KEIN ABFALL: er oeffnet jede Sicherung, die vor dem
   Wechsel entstanden ist. Wer ihn wegwirft, wirft die Sicherungen weg --
   deshalb bleibt er als Kommentar stehen, mit dem Satz daneben, wofuer er noch
   gut ist.
   NUR DIESE EINE ZEILE WIRD ANGEFASST. Alles andere -- Kommentare,
   Leerzeilen, andere Werte, die Reihenfolge -- bleibt Zeichen fuer Zeichen
   stehen.
   `wer` ist eine NOTIZ und keine Feststellung: wer den Befehl auf dem Wirt
   ausfuehren kann, kann sie auch setzen. Sie steht deshalb in der .env und
   ausdruecklich NICHT im Sicherheitsprotokoll -- dort traegt der Vorgang das
   leere `wer` von zugang.js, und das heisst "ueber den Wirt". */
function schreibeEnvZeile(pfad, altHex, neuHex, wer, zeitpunkt) {
  if (!HEX_MUSTER.test(neuHex)) throw new Error('Der neue Schluessel ist kein 64-stelliger Hexwert.');
  const roh = fs.readFileSync(pfad, 'utf8');
  // Die Zeilenenden bleiben, wie sie sind: eine .env, die nach dem Wechsel
  // ploetzlich CRLF traegt, waere eine Aenderung, die niemand bestellt hat.
  const zeilen = roh.split('\n');
  const treffer = findeEnvZeile(zeilen);
  if (!treffer.length)
    throw new Error(`In ${pfad} steht keine aktive Zeile ENCRYPTION_KEY=. ` +
      'Der Schluessel kommt dann aus einer anderen Quelle (etwa environment: ' +
      'in der docker-compose.yml), und die kennt dieser Befehl nicht.');
  if (treffer.length > 1)
    throw new Error(`In ${pfad} stehen ${treffer.length} aktive Zeilen ENCRYPTION_KEY=. ` +
      'Welche gemeint ist, entscheidet dieser Befehl nicht.');
  const alt = treffer[0].wert.trim();
  /* DIE .ENV MUSS ZU DIESER ANLAGE GEHOEREN. Steht dort ein anderer Wert als
     der, mit dem die Datenbank gerade offen ist, ist es die falsche Datei --
     und sie zu ueberschreiben naehme jemandem den Schluessel zu einer anderen
     Anlage weg. */
  if (alt.toLowerCase() !== String(altHex).toLowerCase())
    throw new Error(`Die Zeile ENCRYPTION_KEY in ${pfad} traegt einen anderen Wert als den, ` +
      'mit dem diese Datenbank offen ist. Das ist nicht die .env dieser Anlage.');
  zeilen.splice(treffer[0].nr, 1,
    `# Abgeloest am ${zeitpunkt} durch ${wer} (schluessel.js).`,
    '# ER OEFFNET ALLE SICHERUNGEN VON VOR DIESEM ZEITPUNKT -- nicht loeschen,',
    '# bevor er im Passwortspeicher steht.',
    `#ENCRYPTION_KEY=${alt}`,
    `ENCRYPTION_KEY=${neuHex}`);
  // Danebenschreiben, dann umbenennen -- eine halbgeschriebene .env startet
  // nichts mehr (Stolperstein 8).
  const werdend = pfad + '.wird';
  fs.writeFileSync(werdend, zeilen.join('\n'), { mode: 0o600 });
  fs.renameSync(werdend, pfad);
  return alt;
}

module.exports = { loadKey, HEX_MUSTER, erzeugeSchluessel,
                   schreibeSchluesselDatei, findeEnvZeile, schreibeEnvZeile };
