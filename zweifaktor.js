const crypto = require('crypto');

/* ================= Der zweite Faktor — die reine Rechnung =================

   TOTP NACH RFC 6238. Ein Code entsteht auf dem Telefon aus einem Geheimnis
   und der Uhr, OHNE NETZ -- die Instanz verschickt fuer den zweiten Faktor
   nichts, weder Code noch Nachricht.

   DIESE DATEI KENNT KEINE DATENBANK. Sie rechnet: Base32 hin und zurueck,
   HMAC ueber einen Zaehler, der Vergleich ueber ein Fenster. Alles, was eine
   Zeile hat, steht in auth.js -- dieselbe Teilung wie mail.js daneben.
   KEINE NEUE ABHAENGIGKEIT: TOTP ist HMAC-SHA1 ueber einen Zaehler.

   DIE VIER KENNWERTE STEHEN FEST, UND DAS IST DIE WICHTIGSTE FESSEL DIESER
   DATEI. SHA-256 statt SHA-1, acht Ziffern statt sechs, sechzig Sekunden
   statt dreissig -- jedes davon ist fuer sich das bessere Verfahren, und
   jedes wird von Google Authenticator STILLSCHWEIGEND FALSCH oder gar nicht
   gelesen. Wer davon abweicht, sperrt genau die App aus, fuer die gebaut
   wird. Dieselben vier Werte sind die Vorgabe in jedem anderen Pruefgeraet --
   die Bindung gilt dem Standard, nicht einem Anbieter. */
const VERFAHREN = 'sha1';
const ZIFFERN = 6;
const SCHRITT_SEKUNDEN = 30;
/* WIE WEIT DIE UHREN AUSEINANDERLAUFEN DUERFEN. Ein Fenster nach vorn und
   eines zurueck, also je dreissig Sekunden. Zwei waeren bequemer und kosteten
   die Haelfte der Zusage: ein mitgelesener Code waere zweieinhalb Minuten
   wert statt anderthalb. */
const FENSTER = 1;

/* Die Laenge des Geheimnisses in Bytes. RFC 4226 verlangt mindestens 16 und
   empfiehlt 20 -- die Ausgabelaenge von SHA-1. 20 Bytes sind ausserdem die
   Laenge, die glatt in 32 Base32-Zeichen aufgeht: kein Fuellzeichen, keine
   Frage, ob das Gleichheitszeichen mitgetippt werden muss. */
const GEHEIM_BYTES = 20;

/* ---- Base32, RFC 4648 ----
   WARUM BASE32 UND NICHT HEXADEZIMAL WIE BEIM TOKEN: weil das Geheimnis hier
   ABGETIPPT wird. Base32 ist das Alphabet, das Google Authenticator liest,
   und es kennt kein kleines l, keine 0 und keine 1 -- die drei Zeichen, an
   denen sich ein Mensch vertut.
   GEPRUEFT WIRD GEGEN DEN TESTVEKTOR AUS RFC 4648, nicht gegen die eigene
   Rueckrechnung: ein Kodierer, der zu seinem eigenen Dekodierer passt, kann
   trotzdem ein Alphabet verschoben haben. */
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Kodiere(puffer) {
  let bits = 0, wert = 0, aus = '';
  for (const b of puffer) {
    wert = (wert << 8) | b;
    bits += 8;
    while (bits >= 5) { aus += B32[(wert >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits) aus += B32[(wert << (5 - bits)) & 31];
  // Fuellzeichen bis auf ein Vielfaches von acht -- so verlangt es RFC 4648.
  // Bei 20 Bytes faellt keines an; die Zeile steht fuer den allgemeinen Fall.
  while (aus.length % 8) aus += '=';
  return aus;
}

/* Liefert den Puffer oder null. NULL UND KEINE AUSNAHME: der Aufrufer ist eine
   Route, und ein abgetippter Wert mit einem falschen Zeichen ist keine Stoerung
   der Instanz, sondern eine gewoehnliche Eingabe.
   LEERZEICHEN UND BINDESTRICHE FALLEN WEG: der Schluessel steht am Bildschirm
   in Vierergruppen, und wer ihn abschreibt, schreibt die Luecken mit. */
function base32Dekodiere(text) {
  const t = String(text || '').toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  if (!t) return null;
  let bits = 0, wert = 0;
  const aus = [];
  for (const z of t) {
    const i = B32.indexOf(z);
    if (i < 0) return null;
    wert = (wert << 5) | i;
    bits += 5;
    if (bits >= 8) { aus.push((wert >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(aus);
}

// Ein frisches Geheimnis, fertig zum Abtippen. Es verlaesst die Instanz genau
// einmal -- beim Einschalten. Danach nie wieder, auch nicht an den Eigentuemer.
const neuesGeheimnis = () => base32Kodiere(crypto.randomBytes(GEHEIM_BYTES));

/* Der Schluessel am Bildschirm, in Vierergruppen. Zweiunddreissig Zeichen am
   Stueck sind der Weg, an dem Menschen aufgeben; acht Gruppen zu vier sind
   derselbe String und lassen sich nach jeder Gruppe abgleichen.
   DIE GRUPPEN SIND EINE ANZEIGE UND KEIN FORMAT: base32Dekodiere wirft die
   Trennzeichen wieder weg, und die Instanz speichert den Wert ohne sie. */
const inVierergruppen = (s) => String(s || '').replace(/(.{4})(?=.)/g, '$1 ');

/* ---- Der Zeitschritt ----
   DIE ZAHL DER DREISSIG-SEKUNDEN-SCHRITTE SEIT DEM 1.1.1970. Sie ist der
   Zaehler, ueber den der HMAC laeuft, und zugleich das, was gegen
   Wiederverwendung aufbewahrt wird: ein verbrauchter Schritt kommt nie wieder.
   DIE UHR WIRD UEBERGEBEN UND NICHT HIER GEHOLT -- sonst liesse sich das
   Zeitfenster nur mit echtem Warten pruefen, und eine Pruefung, die eine
   Minute schlaeft, wird irgendwann herausgenommen. */
const schrittZu = (msSeitEpoche) => Math.floor(msSeitEpoche / 1000 / SCHRITT_SEKUNDEN);
const jetztSchritt = () => schrittZu(Date.now());

/* Der Code zu EINEM Zaehler. Das dynamische Abgreifen steht so in RFC 4226,
   Abschnitt 5.3: die letzten vier Bit des Hashs nennen den Anfang, dort
   werden vier Bytes gelesen, das oberste Bit faellt weg.
   Der Zaehler ist acht Bytes gross und wird in ZWEI Haelften geschrieben --
   writeUInt32BE kann keine 64 Bit. Ueber 2^32 laeuft er erst ab dem Jahr
   6053, kein Testvektor erreicht ihn; der Pruefstand haelt die obere Haelfte
   deshalb gegen eine ZWEITE Bauform (writeBigUInt64BE). */
function code(geheimBase32, zaehler) {
  const geheim = base32Dekodiere(geheimBase32);
  if (!geheim || !geheim.length) return null;
  const z = Buffer.alloc(8);
  z.writeUInt32BE(Math.floor(zaehler / 2 ** 32), 0);
  z.writeUInt32BE(zaehler >>> 0, 4);
  const h = crypto.createHmac(VERFAHREN, geheim).update(z).digest();
  const o = h[h.length - 1] & 0x0f;
  const bin = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(bin % 10 ** ZIFFERN).padStart(ZIFFERN, '0');
}

// Sieht ein getippter Wert ueberhaupt nach einem Code aus. Sechs Ziffern, sonst
// nichts -- der Wiederherstellungscode ist an seiner Form zu unterscheiden, und
// deshalb genuegt EIN Eingabefeld fuer beide.
const istCodeform = (eingabe) => new RegExp(`^\\d{${ZIFFERN}}$`).test(String(eingabe || '').trim());

/* Prueft einen Code gegen das Fenster und liefert den ZAEHLER, der getragen
   hat -- oder null.

   DER ZAEHLER UND NICHT ja/nein: der Aufrufer schreibt ihn weg und nimmt beim
   naechsten Mal nur noch etwas GROESSERES an. Ein blosses ja/nein zwaenge ihn,
   den Schritt selbst nachzurechnen -- eine zweite Rechnung neben dieser.

   NACH steht VOR: geprueft wird von hinten nach vorn, damit bei zwei
   passenden Fenstern der spaetere gewinnt.

   ZEITUNABHAENGIG VERGLICHEN, anders als beim Token: dort ist der Hash ein
   Primaerschluessel und wird NACHGESCHLAGEN, hier wird wirklich verglichen,
   und sechs Ziffern sind kurz genug, dass eine Laufzeit etwas sagen
   koennte. */
function pruefeCode(geheimBase32, eingabe, jetzt = Date.now()) {
  const getippt = String(eingabe || '').trim();
  if (!istCodeform(getippt)) return null;
  const mitte = schrittZu(jetzt);
  for (let d = FENSTER; d >= -FENSTER; d--) {
    const zaehler = mitte + d;
    if (zaehler < 0) continue;
    const soll = code(geheimBase32, zaehler);
    if (soll === null) return null;
    const a = Buffer.from(soll), b = Buffer.from(getippt);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return zaehler;
  }
  return null;
}

/* ---- Die Zeile fuer die App ----
   otpauth:// IST DER STANDARD, an den sich jedes Pruefgeraet haelt. Auf einem
   Telefon oeffnet der Link die App unmittelbar; am Rechner ist er der String,
   den ein QR-Code ohnehin nur zeichnen wuerde.

   DIE DREI KENNWERTE STEHEN AUSGESCHRIEBEN DARIN, obwohl sie die Vorgabe
   sind: ein Pruefgeraet, das sie ANDERS vorbelegt, laege sonst still daneben.

   DER INSTANZNAME KOMMT AUS DEM OEFFENTLICHEN TITEL und ist Eingabe aus dem
   Systembereich -- deshalb encodeURIComponent, nicht bloss ein Ersetzen von
   Doppelpunkten. Die Zeile misst rund hundert Zeichen bei kurzen Namen und
   zweihundert bei sehr langen. */
function otpauthZeile(instanz, benutzername, geheimBase32) {
  const kennung = encodeURIComponent(`${instanz}:${benutzername}`);
  return `otpauth://totp/${kennung}?secret=${geheimBase32}` +
    `&issuer=${encodeURIComponent(instanz)}` +
    `&algorithm=${VERFAHREN.toUpperCase()}&digits=${ZIFFERN}&period=${SCHRITT_SEKUNDEN}`;
}

/* ---- Die Wiederherstellungscodes ----
   OHNE SIE IST EIN VERLORENES TELEFON EIN VERLORENER ZUGANG.

   ACHT STUECK, ZEHN ZEICHEN -- rund fuenfzig Bit, weit jenseits dessen, was
   eine Bremse von zehn Versuchen je Adresse durchlaesst. Acht sind mehr, als
   ein Mensch je braucht, und wenig genug fuer einen Zettel.

   EIN EIGENES ALPHABET UND NICHT BASE32: hier wird nichts dekodiert, nur
   verglichen. Also faellt heraus, was sich beim Abschreiben verwechseln
   laesst -- 0/O, 1/I/l.
   DIE GRUPPEN SIND EINE ANZEIGE UND KEIN FORMAT: gespeichert und verglichen
   wird ohne sie. */
const WIEDER_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const WIEDER_ZAHL = 8;
const WIEDER_LAENGE = 10;

/* GLEICHVERTEILT GEZOGEN, nicht ueber einen Rest. `zufall % 31` gaebe den
   ersten Zeichen des Alphabets mehr Gewicht als den letzten -- bei 256 durch 31
   sind das rund vier Prozent Schieflage. randomInt zieht ohne diesen Rand. */
const einWiederCode = () => Array.from({ length: WIEDER_LAENGE },
  () => WIEDER_ALPHABET[crypto.randomInt(WIEDER_ALPHABET.length)]).join('');

const neueWiederCodes = () => Array.from({ length: WIEDER_ZAHL }, einWiederCode);

// Am Bildschirm in zwei Fuenferbloecken: XXXXX-XXXXX. Derselbe Gedanke wie bei
// den Vierergruppen des Schluessels.
const wiederAnzeige = (c) => `${String(c).slice(0, 5)}-${String(c).slice(5)}`;

/* Auf die Form gebracht, bevor verglichen wird. Bindestriche und Leerzeichen
   fallen weg, klein wird gross: wer einen Code vom Zettel abschreibt, schreibt
   ihn so, wie er dasteht.
   LIEFERT DEN LEEREN STRING, wenn nichts uebrig bleibt -- der Aufrufer prueft
   auf die Laenge und schlaegt nicht mit einem leeren Hash nach. */
const wiederNormal = (eingabe) =>
  String(eingabe || '').toUpperCase().replace(/[\s-]/g, '');

// Sieht ein getippter Wert nach einem Wiederherstellungscode aus. Zehn Zeichen
// aus dem Alphabet, sonst nichts -- die Gegenprobe zu istCodeform, damit EIN
// Eingabefeld beide Formen auseinanderhaelt.
const istWiederform = (eingabe) => {
  const w = wiederNormal(eingabe);
  return w.length === WIEDER_LAENGE && [...w].every(z => WIEDER_ALPHABET.includes(z));
};

module.exports = {
  VERFAHREN, ZIFFERN, SCHRITT_SEKUNDEN, FENSTER, GEHEIM_BYTES,
  WIEDER_ZAHL, WIEDER_LAENGE, WIEDER_ALPHABET,
  base32Kodiere, base32Dekodiere, neuesGeheimnis, inVierergruppen,
  schrittZu, jetztSchritt, code, istCodeform, pruefeCode, otpauthZeile,
  neueWiederCodes, wiederAnzeige, wiederNormal, istWiederform
};
