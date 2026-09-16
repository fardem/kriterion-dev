/* Kriterion — der gemeinsame Rahmen des Pruefstands
 *
 * Hier steht, was alle Module in test/ teilen: die Zaehlung, group() und
 * check(), der Schlussblock, die Zeitmessung, die Portbasen, der Start eines
 * Servers, der SMTP-Empfaenger und die Rufer.
 *
 * ER STEHT AN GENAU EINER STELLE. Zwei Fassungen von check() waeren zwei
 * Wahrheiten (Stolperstein 47) -- deshalb laedt jedes Modul diese Datei und
 * legt nichts davon noch einmal an.
 *
 * DER RUMPF LIEGT IN EINER KLAMMER, und das hat einen Grund: die Datei liegt
 * in test/, der Quelltext darin spricht aber vom Wurzelverzeichnis. `__dirname`
 * und `require` werden deshalb als Parameter hereingereicht und zeigen auf die
 * Wurzel. Damit ist jede Zeile, die aus testbench.js hierher gezogen ist,
 * Zeichen fuer Zeichen dieselbe geblieben -- und jeder Suchtext der 998
 * Rueckbauten greift weiter.
 */
const nodePath = require('path');
const { createRequire } = require('module');
const ROOT = nodePath.join(__dirname, '..');

module.exports = (function (__dirname, require) {
/* ============ DER PRUEFSCHALTER DIESES LAUFS -- 0.30.0, F1 und F2 =========
   ER STEHT VOR JEDEM require, und das ist der ganze Grund fuer diese Stelle:
   auth.js und mail.js lesen ihn beim LADEN. Wer ihn eine Zeile spaeter setzte,
   liese die erste geladene Datei mit den ausgelieferten Zahlen rechnen und die
   zweite mit den kurzen -- eine Instanz mit zwei Wahrheiten ueber sich selbst.

   ZWEI EINSTELLUNGEN, UND BEIDE SIND GEMESSEN. `scrypt=1024` nimmt dem Lauf
   die Kostenstufe des Passwortspeichers (rund 35 s von 464); `mail=40` teilt
   die drei Mailfristen durch vierzig, aus 20/7/7 Sekunden werden 500/175/175
   Millisekunden (rund 55 s). DAS VERHAELTNIS DER DREI BLEIBT DABEI GENAU
   ERHALTEN -- es ist die Sache, die der Lauf belegt, und ein Teiler kann es
   nicht umdrehen.

   UND DIE DRITTE IST DIE ANMELDEBREMSE (F3). `brake=10` teilt NUR die
   Wartezeit -- aus 700 Millisekunden werden 70 --, und zwar ausdruecklich
   nicht die Kurve und nicht die Schwellen: weich ab fuenf, hart ab zehn, fuenf
   Minuten Sperre. Sechs Gruppen fuhren diese Kurve real durch die Routen und
   kosteten damit rund 80 der 464 Sekunden.
   ZEHN UND NICHT VIERZIG, und das ist gemessen und nicht gegriffen: bei
   vierzig blieben 18 Millisekunden uebrig, und das ist im Rauschen einer
   HTTP-Antwort nicht mehr sicher von null zu unterscheiden. Die Pruefungen,
   die „ohne Verzoegerung" gegen „verzoegert" halten, brauchen einen Abstand,
   den man messen kann. Siebzig Millisekunden sind einer.

   WAS SICH DAMIT NICHT AENDERT: keine Schwelle, keine Route, keine Antwort.
   Die Prueflagen, die die AUSGELIEFERTEN Zahlen belegen, starten ihre Server
   ausdruecklich OHNE den Schalter (`KRITERION_TESTBENCH: ''`) -- Zusagen 8 und
   10 lesen die Auslieferung und nicht diesen Lauf. */
process.env.KRITERION_TESTBENCH = 'pruefstand:scrypt=1024:mail=40:brake=10';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync, execFileSync } = require('child_process');
/* SEIT 0.19.3: der Bestandslauf faehrt in einem eigenen Thread, und die Gruppe
   „Der Bestandslauf faehrt in einem eigenen Thread" erzeugt ihn von hier aus --
   an einer echten, verschluesselten Instanz und ohne Server dazwischen. Ueber
   HTTP waere davon nichts zu sehen: die Antwort ist dieselbe wie vorher, und
   genau das ist der Sinn der Runde. */
const { Worker } = require('worker_threads');
const Database = require('better-sqlite3-multiple-ciphers');
const attachments = require('./attachments');
/* SHARP STEHT HIER, SEIT 0.19.0, UND ZWAR AUS EINEM GENAUEN GRUND: die Runde
   legt jedes ankommende PNG als WebP ab, und die Zusage lautet nicht „eine
   Funktion wurde gerufen", sondern „das Bild ist unversehrt". Das laesst sich
   nur belegen, indem der Prueflauf die abgelegte Datei DEKODIERT und Pixel
   gegen Pixel haelt. Ohne sharp bliebe an dieser Stelle eine Behauptung.
   ES IST KEINE NEUE ABHAENGIGKEIT: sharp traegt der Server ohnehin. */
const sharp = require('sharp');
/* DER ZERLEGER DER RUNDE 0.24.1 -- er trennt Code von Text, Vorlage und
   Kommentar. Die sechs Waechter weiter unten brauchen ihn: ein Name in einem
   Kommentar ist keine Benennung, und ein Weg in einer Erzaehlung ist keine
   Adresse. Er ist WERKZEUG und wird nicht ausgeliefert -- deshalb steht er
   hier und nicht in einer Serverdatei. */
const { segment, CODE, TEXT, COMMENT, REGEX } = require('./tools/segments.js');

/* DIE FRISTEN, MIT DENEN DIE SERVER DIESES LAUFS WIRKLICH RECHNEN -- 0.30.0.
   GELESEN AUS mail.js SELBST und nicht danebengeschrieben: die Prueflagen des
   Mailversands messen gegen sie, und eine zweite Zahl hier liefe mit der
   ersten auseinander, sobald jemand den Teiler aendert (Stolperstein 47).
   mail.js oeffnet keine Datenbank und haengt an nichts ausser keys.js -- es
   laesst sich hier ohne Nebenwirkung laden. */
const MAIL_TIMES = require('./mail');

/* ============= DAS GRUNDDOKUMENT FUER jsdom -- 0.30.0, BA 5 (F4) ==========
   174 AUFBAUTEN, UND JEDER HAT DIESELBE DATEI NEU GELESEN UND NEU UEBERSETZT.
   `public/app.js` ist 13 299 Zeilen lang; sie von der Platte zu holen und in
   Maschinencode zu uebersetzen kostet je Fenster ein Vielfaches dessen, was
   die Pruefung darin danach tut. Die Gruppe „Der Sprachhelfer und die Ladung"
   ist der Beleg: 20,5 Sekunden, und sie wartet auf keine einzige Frist.

   ZWEI SACHEN STEHEN JETZT EINMAL DA STATT 174-MAL. Der QUELLTEXT wird einmal
   gelesen, und die UEBERSETZUNG liegt einmal als `vm.Script` -- dieselbe
   Bauform, die jsdom selbst fuer ein <script> im Dokument benutzt, nur nicht
   je Fenster neu. Ausgefuehrt wird sie weiterhin JE FENSTER und in dessen
   eigenem Zusammenhang: jede Prueflage bekommt ihre eigenen Werte, ihre
   eigenen Zaehler und ihr eigenes Dokument. NICHTS WIRD GETEILT ausser der
   Uebersetzung.

   UND DER FEHLERWEG BLEIBT DERSELBE. Ein <script> im Dokument meldet einen
   Fehler an die virtuelle Konsole und laesst den Aufbau weiterlaufen; ein
   nackter runInContext wuerfe ihn nach aussen und RISSE DEN LAUF AB, statt
   eine Zusage rot zu faerben (Stolperstein 161). Deshalb die Klammer -- jeder
   Griff in einen Nachbau wird geklammert. */
const vm = require('vm');
const BASE_SOURCE = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
const BASE_SCRIPT = new vm.Script(BASE_SOURCE, { filename: 'public/app.js' });
/* UND DIE WARTEZEIT, DIE DIE ROUTEN DIESES LAUFS WIRKLICH EINLEGEN -- 0.30.0,
   F3. Dieselbe Funktion, die der Server ruft, und keine zweite Zahl daneben:
   die Prueflagen halten „ohne Verzoegerung" gegen „verzoegert" und muessen
   dafuer wissen, wo die Grenze zwischen beidem liegt. */
const RUN_KEYS = require('./keys');
const BRAKE_STEP = RUN_KEYS.brakeWait(700);
/* UND DIE KOSTENSTUFE, MIT DER DIESE INSTANZEN WIRKLICH RECHNEN -- 0.30.0, F1.
   DIE AUSGELIEFERTE ZAHL KOMMT AUS auth.js SELBST und steht hier nicht noch
   einmal: sie ist dort festgenagelt, die Zusage haelt sie namentlich, und eine
   zweite Zahl hier liefe mit ihr auseinander (Stolperstein 47). Gelesen wird
   der Quelltext und nicht das Modul -- auth.js haengt an db.js, und das
   oeffnete beim Laden eine Datenbank. */
const SCRYPT_SHIPPED = Number((fs.readFileSync(path.join(__dirname, 'auth.js'), 'utf8')
  .match(/^const SCRYPT_SHIPPED = (\d+);$/m) || [])[1]);
const RUN_SCRYPT = RUN_KEYS.scryptCost(SCRYPT_SHIPPED);

/* DIE README ALS EIN LANGER STRING, EINMAL GELESEN. Gebraucht wird sie
   ueberall dort, wo ein Text die Oberflaeche VERLAESST: was aus der Instanz
   faellt und nirgends sonst steht, ist verloren und nicht umgezogen. Die
   Zwischenraeume sind eingeebnet, damit ein Satz ueber zwei Zeilen genauso
   gefunden wird wie einer in einer. */
const readmeFlat = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8')
  .replace(/\s+/g, ' ');

/* ================= Kleiner Pruefrahmen ================= */
/* EIN NAMENSFILTER AUF DER AUSGABE, NICHT AUF DER ARBEIT.

     node testbench.js            alles, wie bisher
     node testbench.js Rechte     nur Gruppen mit "Rechte" im Namen

   Diese Datei ist EIN langer Ablauf: die Prueflagen bauen aufeinander auf,
   Server werden einmal gestartet, Bestaende nacheinander erzeugt. Ein
   Namensfilter kann deshalb nur die AUSGABE einschraenken, nicht die ARBEIT
   -- wer wartet, wartet weiter. Der Gewinn ist ein anderer und trotzdem echt:
   beim Deuten roter Punkte verschwindet das Rauschen.

   DIE REGEL DAZU, sonst wird daraus eine Falle: ein gefilterter Lauf sagt am
   Ende ausdruecklich, dass er gefiltert war, wie viele Gruppen er uebergangen
   hat und ob darin etwas rot war. Ohne das liese sich "alles in Ordnung" nach
   einem Teillauf als vollstaendiger Beleg lesen -- genau der stille
   Fehlschluss aus Stolperstein 81.

   DER RUECKGABEWERT folgt dem GEZEIGTEN: sonst waere ein gefilterter Lauf aus
   Gruenden rot, die gar nicht angesehen werden, und der Filter waere wertlos.
   Ein Filter, auf den KEINE Gruppe passt, ist dagegen rot -- sonst meldete
   ein Tippfehler im Namen wortlos Erfolg. */
const FILTER = (process.argv[2] || '').trim();
let passedCount = 0, failed = 0, skipped = 0;
let stillPassed = 0, stillFailed = 0;
let groupsShown = 0, groupsStill = 0;
let silent = false;

/* ================= WO DIE ZEIT HINGEHT -- 0.30.0, BA 4 =================
   OHNE DIESE ZAHL IST JEDE BESCHLEUNIGUNG GERATEN. Am 12. September 2026 ist
   ein vollstaendiger Lauf mit einem Zeitstempel je Gruppe gefahren worden --
   VON AUSSEN, ohne eine einzige Zeile im Baum: 446,8 Sekunden, 329 Gruppen,
   und zwoelf davon trugen 210 Sekunden. Was hier gebaut wird, ist deshalb
   nicht die MOEGLICHKEIT, sondern die WIEDERHOLBARKEIT -- eine Zahl, die jeder
   Lauf selbst nennt, statt einer, die jemand von aussen nachhaelt.

   DIE TAFEL STEHT IMMER, DIE ZEILE JE GRUPPE NUR AUF SCHALTER (F5). Eine Zeile
   je Gruppe macht die Ausgabe um 329 Zeilen laenger; wer die Zeit einer
   einzelnen Gruppe nicht sucht, soll sie nicht lesen muessen.

   DER SCHALTER IST EINE UMGEBUNGSVARIABLE UND KEIN ZWEITES ARGUMENT: argv[2]
   traegt den Namensfilter, und ein zweites Argument daneben liese sich mit ihm
   verwechseln -- `node testbench.js Rechte 1` saehe aus wie ein zweiter Name.

   GEMESSEN WIRD AUCH, WAS DER FILTER UEBERGEHT. Der Filter nimmt die AUSGABE
   weg und nicht die ARBEIT: eine uebergangene Gruppe kostet dieselbe Zeit wie
   eine gezeigte. Die Tafel zeigt trotzdem nur die GEZEIGTEN -- sonst stuende
   in einem gefilterten Lauf der Name einer Gruppe, die er gerade verschweigt,
   und die Regel des gefilterten Laufs waere an ihrer eigenen Schlusstafel
   gebrochen. */
const TIMES = [];
const TIME_EACH = process.env.TESTBENCH_TIME === '1';
const RUN_START = Date.now();
let timeName = '', timeStart = 0, timeSilent = false;
/* SCHLIESST DIE LAUFENDE GRUPPE UND MERKT IHRE ZEIT. Gerufen wird sie von
   group() UND von endBlock(): hinter der letzten Gruppe kommt kein group()
   mehr, und ohne den zweiten Aufruf fehlte ausgerechnet sie in der Tafel. */
function closeTime() {
  if (!timeName) return;
  const ms = Date.now() - timeStart;
  if (!timeSilent) TIMES.push({ name: timeName, ms });
  if (TIME_EACH && !timeSilent) console.log(`  ⏱ ${(ms / 1000).toFixed(1)} s`);
  timeName = '';
}
/* DIE SCHLUSSTAFEL IST EINE REINE FUNKTION, und das ist kein Geschmack: „die
   ZEHN teuersten" laesst sich an einem Lauf mit zwei Gruppen nicht belegen.
   So faehrt die Zusage sie an gestellten Zahlen -- in null Millisekunden und
   fuer jede Zahl von Gruppen.
   KEINE ZEILE DIESER TAFEL DARF WIE EINE GRUPPE ODER WIE EIN ROTER PUNKT
   AUSSEHEN: counterproof.js liest die Ausgabe und erkennt Gruppen an „── " am
   Zeilenanfang und rote Punkte an genau zwei Leerzeichen vor einem Kreuz.
   Die Zeilen hier fangen mit vier Leerzeichen an und tragen kein Kreuz. */
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
     das Aufraeumen hinter der letzten. Gemessen wird die Runde an der
     ZWEITEN (F6), also steht sie auch da. */
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
  /* MINDESTENS ZWEI STRICHE, auch bei einem langen Namen. Eine Ueberschrift
     von 58 Zeichen erzeugte sonst gar keinen -- und wer die Ausgabe liest
     (counterproof.js tut das), erkennt die Zeile dann nicht als Gruppe und
     schreibt die roten Punkte der VORIGEN zu. Genau das ist in der ersten
     Gegenprobentabelle dieser Runde passiert. */
  console.log(`\n── ${name} ${'─'.repeat(Math.max(2, 58 - name.length))}`);
};
function check(name, condition, hint = '') {
  // Die Bedingung ist beim Aufruf laengst gerechnet -- der Filter nimmt die
  // Zeile weg, nicht die Arbeit. Gezaehlt wird sie trotzdem, damit der
  // Schlussblock sagen kann, ob im Uebergangenen etwas rot war.
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
    /* UND WIE VIELE MODULE GAR NICHT ERST GESTARTET SIND -- 0.34.0. Die Zahl
       in der Klammer darueber zaehlt nur, was WIRKLICH gelaufen ist; die
       Pruefungen eines nicht gestarteten Moduls hat niemand gezaehlt. Ohne
       diese Zeile liese sich „338 uebergangen (15 Pruefungen)" so lesen, als
       stuenden in den uebergangenen Gruppen fuenfzehn Pruefungen. */
    if (skippedGroupCount)
      console.log(`  ${skippedGroupCount} Module sind gar nicht erst gestartet — ` +
                  `ihre Pruefungen sind in der Zahl oben NICHT enthalten.`);
    if (stillFailed)
      console.log(`  DARIN ${stillFailed} GESCHEITERT — hier nicht angezeigt. ` +
                  `Ohne Filter laufen lassen, um sie zu sehen.`);
  }
  /* DIE TAFEL STEHT IM SCHLUSSBLOCK UND NICHT DANEBEN. Eine zweite Stelle
     liefe mit der ersten auseinander -- und der gefilterte Lauf endet seit
     jeher an genau dieser einen (Stolperstein 47). */
  if (TIMES.length) {
    console.log('');
    for (const z of timeTable(TIMES, Date.now() - RUN_START)) console.log(z);
  }
  console.log(`${'═'.repeat(62)}\n`);
}
const returnValue = () => (failed || (FILTER && !groupsShown)) ? 1 : 0;
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/* SETZT EIN FELD UND SAGT, OB ES DA WAR. `field?.value = value` gibt es nicht --
   optional chaining kann kein Zuweisungsziel sein, und genau deshalb standen
   diese Zeilen ungeschuetzt da.
   OHNE DIESEN HELFER REISST EIN RUECKBAU, DER EIN FELD WEGNIMMT, DEN GANZEN
   LAUF AB, statt die Pruefung darunter rot zu machen -- und eine abgerissene
   Gegenprobe belegt gar nichts (Stolperstein 161). Fehlt das Feld, bleibt der
   Wert ungesetzt, der Knopf schickt ihn nicht mit, und die Zusage darunter
   wird rot. Genau so soll es sein.
   GEFUNDEN VON DEN GEGENPROBEN 273 UND 275, nicht vom Prueflauf. */
const setField = (doc, id, value) => {
  const f = doc.getElementById(id);
  if (f) f.value = value;
  return !!f;
};
/* ================= Umgebung ================= */
const KEY = crypto.randomBytes(32).toString('hex');

/* PORT_OFFSET -- eine Zahl, die auf JEDE Portbasis dieses Laufs addiert wird.
   Damit faehrt counterproof.js mehrere Rueckbauten NEBENEINANDER: jede Nebenspur
   bekommt ihren eigenen Versatz, und die Spuren kommen sich nicht ins Gehege.
   Ohne die Variable bleibt alles, wie es war -- der gewoehnliche Lauf setzt sie
   nicht, und dann ist der Versatz null.

   DIE ZAHL IST AUSGERECHNET, NICHT GESCHAETZT (Stolpersteine 64 und 127). Die
   Gruppe "Die Portbasen und der Versatz" am Ende des Laufs rechnet sie nach:
     * Der Versatz muss GROESSER sein als die Spanne aller Basen samt ihrer
       Breite -- sonst laege eine Spur auf der naechsten.
     * KEINE entstehende Nummer darf auf der Sperrliste von fetch() liegen. Der
       Server liefe dort und meldete es auch; nur die Bereitschaftspruefung
       kaeme nie an ihn heran, und der Lauf risse ab, statt eine Pruefung rot zu
       faerben.
   OFFSET_LEVEL ist der Wert, den counterproof.js je Nebenspur vervielfacht. Er
   steht HIER und nicht dort: der Waechter, der ihn nachrechnet, liegt hier, und
   zwei Zahlen an zwei Orten laufen auseinander. */
/* 3500 SEIT 0.12.4, VORHER 3000. Die Spanne aller Basen ist mit dem Rundlauf
   des Teilexports auf 3100 gewachsen (zwei Instanzen: die Quelle und das Ziel),
   und unterhalb der vorhandenen Basen war kein Fenster von 60 Nummern mehr
   frei -- die Luecken tragen entweder zu wenig Platz oder eine Nummer von der
   Sperrliste. WAECHST DIE SPANNE, WAECHST DER VERSATZ MIT; bei Gleichheit
   fiele die naechste Spur genau auf die vorige. Der Waechter darunter rechnet
   beides gegeneinander nach, und die hoechste entstehende Nummer bleibt mit
   17679 weit unter 32768.
   ZWEI BASEN MEHR SEIT 0.14.0 (7060 und 7120): die Prueflage zur Ablehnung
   braucht eine Quelle und ein Ziel, weil der Rundlauf durch das
   Austauschformat zwei Instanzen braucht. Die Spanne waechst damit auf 3280 und
   bleibt unter dem Versatz. */
const OFFSET_LEVEL = 3500;
const OFFSET_TRACES = 4;
const PORT_WIDTH = 60;
/* ================= DIE SPANNE ALLER PORTBASEN -- 0.30.0, F7 =================
   Die Gegenprobe sieht VOR dem ersten Rueckbau nach, ob in diesem Fenster
   jemand horcht -- der Portblick findet auch das, was kein Muster ueber die
   Befehlszeile je findet (counterproof.js, foreignPort()). Dafuer braucht sie
   die Spanne, und eine zweite Liste dort liefe mit dieser auseinander
   (Stolperstein 47); gelesen wird sie deshalb von dort aus HIER, genau wie
   OFFSET_LEVEL.
   DIE ZWEI ZAHLEN WERDEN NACHGERECHNET UND NICHT BEHAUPTET: die Gruppe „Die
   Portbasen und der Versatz" haelt sie gegen die Basen, die der Lauf WIRKLICH
   benutzt hat, samt Fensterbreite und samt dem Versatz aller Nebenspuren. Ein
   Fenster, das zu eng wird, faellt dort auf und nicht erst im Betrieb.
   DIE OBERE ZAHL IST GERECHNET: hoechste Basis 7120 plus Fensterbreite 60 plus
   der Versatz der letzten Nebenspur (3 mal 3500) -- macht 17680, und die
   hoechste ERREICHBARE Nummer ist die davor. */
const PORT_SPAN_FROM = 3900;
const PORT_SPAN_TO = 17679;
const MAIN_WIDTH = 90;
const MAIN_BASE = 3900;
/* DER ALTE NAME GILT WEITER (F9). Der Pruefstand liest ihn ohne Umschweife
   selbst: `auth.js` haengt an `db.js`, und das oeffnete beim Laden eine
   Datenbank -- hier, vor jedem Aufbau, waere das die falsche. */
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
    /* AUCH DER HAUPTSERVER SAGT ES, WENN ER VON SELBST ENDET -- 0.30.0, BA 2.
       `error()` greift nur, solange das Versprechen des Starts offen ist;
       danach war sein Ende bis 0.30.0 STUMM, und die naechste Anfrage meldete
       „fetch failed" ohne Ort und ohne Grund. Genau so ist in dieser Runde ein
       Befund zwei Stunden lang unsichtbar geblieben (Befund 11). */
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

// Kurzer Lauf in einem eigenen Prozess: db.js oeffnet die Datenbank beim Laden
// und laesst sich deshalb nicht zweimal im selben Prozess auf zwei
// Verzeichnisse ansetzen.
function shortRun(code, dataDirectory) {
  const { execFileSync } = require('child_process');
  return execFileSync(process.execPath, ['-e', code], {
    cwd: __dirname, encoding: 'utf8',
    env: { ...process.env, DATA_DIR: dataDirectory, ENCRYPTION_KEY: KEY }
  }).trim().split('\n').pop();
}

/* DERSELBE LAUF, ABER MIT DER GANZEN AUSGABE -- seit 0.24.2. shortRun()
   liefert die LETZTE Zeile; das ist richtig, wo eine Antwort geholt wird, und
   falsch, wo die MELDUNGEN die Sache sind. Ein Migrationsblock meldet sich
   VOR der Antwort, und die letzte Zeile saehe davon nichts -- eine Probe auf
   „der zweite Start ist stumm" waere damit immer gruen. */
function shortRunAll(code, dataDirectory) {
  const { execFileSync } = require('child_process');
  return execFileSync(process.execPath, ['-e', code], {
    cwd: __dirname, encoding: 'utf8',
    env: { ...process.env, DATA_DIR: dataDirectory, ENCRYPTION_KEY: KEY }
  }).trim();
}

/* Setzt einem von Hand angelegten Zugang ein ECHTES Passwort. Gebraucht wird
   das seit 0.8.90 in jeder Prueflage, deren Zugaenge eine zweite Bestaetigung
   holen muessen: ein Zugang mit password_hash = 'x' kommt daran nicht vorbei,
   und das ist richtig so.
   GEHASHT WIRD MIT auth.hashPassword UND NICHT MIT EINER ZWEITEN AUSFERTIGUNG
   DES FORMATS -- eine zweite Wahrheit ueber den Hash waere genau die Sorte
   Fehler, die der Prueflauf finden soll.
   NICHT ueber setzeNeuesPasswort(): das raeumt die Sitzungen dieses Zugangs
   mit weg, und die Prueflagen setzen ihre Sitzungen von Hand. */
function setPasswordImInventory(dataDirectory, name, password) {
  return shortRun(
    `const a = require('./auth'); const { db } = require('./db');` +
    `a.hashPassword(${JSON.stringify(password)}).then(h => {` +
    `db.prepare('UPDATE users SET password_hash = ? WHERE username = ?')` +
    `.run(h, ${JSON.stringify(name)}); console.log('gesetzt'); });`,
    dataDirectory);
}

/* EIN KIND BEENDEN UND AUF SEIN ENDE WARTEN. DIE ABFRAGE VORHER IST DER GANZE
   PUNKT: ist der Prozess schon beendet, feuert 'exit' NIE wieder -- ein Warten
   darauf haengt fuer immer, ohne CPU zu verbrauchen und ohne eine Message.
   Genau daran sind zwei Gegenproben haengengeblieben: ihre Fingerprintlage
   bekam den Port nicht, der Server endete sofort von selbst, und das
   anschliessende Aufraeumen wartete auf ein Ereignis aus der Vergangenheit. */
function endKind(kind) {
  return new Promise(done => {
    if (kind.exitCode !== null || kind.signalCode !== null) return done();
    kind.on('exit', done);
    kind.kill();
  });
}

/* JEDE PRUEFLAGE MIT EIGENEM SERVER WIRD HIER VERMERKT -- Portbasis, gewaehlte
   Nummer und das Kind. Daran haengen die beiden Waechter am Ende des Laufs:
   der eine rechnet die Basen gegen die Sperrliste nach, der andere sieht nach,
   ob wirklich jedes Kind beendet ist.
   ES IST EINE LISTE UND KEIN ZAEHLER: der Waechter soll sagen, WELCHE Lage
   liegengeblieben ist, nicht nur DASS eine. In 0.8.90 sind zwei neue Lagen mit
   laufendem Server zurueckgeblieben, und aufgefallen ist es erst an einer
   abgerissenen Gegenprobe -- ihre Ports haetten den naechsten Lauf vergiftet
   (Stolperstein 122). */
const CASES = [];

/* ================= Der SMTP-Empfaenger, 0.9.0 =================
   ER KOMMT AUS `net` UND NICHT AUS DEM NETZ. Eine zweite
   Entwicklungsabhaengigkeit nur zum Zuhoeren waere der teuerste Weg zur
   billigsten Sache; SMTP ist ein Zeilenprotokoll, und was hier gebraucht wird,
   sind fuenf Befehle.

   EIN MOCK ANTWORTET WIE DER ECHTE SERVER (Stolperstein 90), und beim Versand
   heisst das vor allem: ER MUSS SCHEITERN KOENNEN. Einer, der nur "250 ok"
   sagt, macht die Haelfte dieser Runde unpruefbar -- der ganze Zweig
   "Versand fehlgeschlagen, der Link steht trotzdem da" waere nie gelaufen.
   Vier Betriebsarten:
     'ok'       nimmt an und hebt den Brief auf
     'fehler'   antwortet auf DATA mit 550
     'stumm'    gruesst gar nicht erst -- der Fall fuer die Verbindungsfrist
     'schweigt' gruesst und antwortet danach auf NICHTS mehr -- hier greift
                nodemailers socketTimeout, denn der Socket liegt still
     'troepfelt' gruesst und schickt danach alle drei Sekunden EIN Byte, ohne
                je zu antworten. DAS IST DER FALL, DER DEN BELEG TRAEGT: jede
                Zustellung setzt socketTimeout zurueck, also laeuft es NIE ab
                -- nachgestellt, nach 45 Sekunden haengt der Versand noch
                immer. Nur die AEUSSERE Schranke haelt ihn.
     'abbruch'  legt sofort auf

   DER ROHE BRIEF WIRD DEKODIERT AUFGEHOBEN. Der Rumpf geht als
   quoted-printable hinaus, und ein Link mit 64 Hexzeichen ist laenger als die
   76 Zeichen einer Zeile: er bekommt einen WEICHEN Umbruch. Wer im rohen Text
   nach dem Schluessel sucht, findet ihn nicht -- und wuerde daraus schliessen,
   der Link fehle in der Mail. Ein Empfaenger dekodiert; dieser auch. */
/* DIE PORTBASIS IST AUSGERECHNET, NICHT GESCHAETZT (Stolpersteine 64 und 127),
   und sie geht ueber DIESELBE Liste wie jede andere -- sonst saehe der
   Waechter aus 0.8.91 sie gar nicht, und genau daran sind in 0.8.90 zwei
   Gegenproben haengengeblieben.
   6110 UND NICHT 5960: eine Basis deckt ihr Fenster, und 5960 traefe die 6000
   (X11, Sperrliste der Fetch-Spezifikation). 6100 bis 6109 gehoert der
   Fingerprintlage. 6110 bis 6129 liegt frei, und mit dem Versatz ebenso --
   9110, 12110 und 15110 treffen keine Sperrnummer, und die hoechste Nummer
   bleibt unter 32768.
   GEZAEHLT STATT GEWUERFELT, wie bei der Fingerprintlage: der Empfaenger
   braucht nur so viele Nummern, wie er Server oeffnet. */
const SMTP_BASE = 6110;
const SMTP_WIDTH = 20;
/* DIE LAGE „SERVER OHNE de.json" -- 0.24.0, Bauabschnitt 1. Sie startet GENAU
   EINEN Server, und der soll gerade NICHT hochkommen; sie braucht deshalb nur
   eine Nummer und bekommt ein Fenster von zwei -- wie die Fingerprintlage,
   die ebenfalls hochzaehlt statt zu wuerfeln. Vermerkt wird sie trotzdem:
   eine Basis, die nicht ueber die Liste laeuft, sieht kein Waechter
   (Stolperstein 139). */
/* DIE BASIS DER FINGERPRINTLAGE -- hierher in 0.34.0. Sie stand bis 0.33.2
   mitten im Ablauf; seit dem Umzug braucht der Treiber sie fuer den Waechter
   „Die Portbasen und der Versatz", und der Rundlauf braucht sie weiter fuer
   seine Server. Zwei Zahlen an zwei Orten liefen auseinander
   (Stolperstein 47).
   SIE ZAEHLT HOCH STATT ZU WUERFELN und deckt deshalb nur zehn Nummern. */
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
     aller offenen Verbindungen. Die Betriebsarten 'stumm' und 'schweigt'
     halten ihre Verbindung absichtlich offen -- ein close() darauf haengt fuer
     immer, ohne CPU und ohne Message, und der Lauf steht still statt eine
     Pruefung rot zu faerben. Dasselbe Fehlerbild wie bei Stolperstein 139,
     nur an einem Socket statt an einem Kindprozess. */
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
      /* DER TROPFEN FOLGT DER FRIST -- 0.30.0. Sein Sinn ist, socketTimeout
         mit JEDEM Byte zurueckzusetzen: er muss deshalb deutlich kuerzer
         takten als die Frist, die er aushebelt. Ausgeliefert sind das 3 von 20
         Sekunden; kurz gestellt bleibt dasselbe Verhaeltnis, und der Beleg
         bleibt derselbe. Eine feste Zahl daneben liefe mit dem Teiler
         auseinander und liese diese Lage still an socketTimeout scheitern --
         also an der Frist, die sie gerade widerlegen soll. */
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
// eigenem Cookie. Gebraucht fuer alle Prueflagen, die eine eigene Instanz
// brauchen: frische Einrichtung, Rechte mit mehreren Zugaengen, Sperren.
/* ================= DAS WARTEFENSTER -- 0.30.0, BA 2 =================
   ZWOELF SEKUNDEN WAREN ZU WENIG. Unter schwerer Nebenlast -- beobachtet in
   0.8.10 und 0.8.30, beide Male neben einem gleichzeitigen Image-Bau -- ist
   der Zweitserver spaeter dagewesen als das Fenster, und der Lauf RISS AB,
   statt eine Pruefung namentlich rot zu faerben.
   DREISSIG UND NICHT SECHZIG: ein Fenster, das zu weit steht, verwandelt einen
   echten Fehlstart in eine halbe Minute Warten je Prueflage -- bei 78 Servern
   waere das eine Stunde, in der niemand etwas sieht. Dreissig Sekunden sind
   das Zweieinhalbfache der alten Zahl und immer noch eine Zeit, die ein Mensch
   abwartet.
   DIE TEURERE HAELFTE WAR ABER DIE MELDUNG. „Zweitserver nicht erreichbar"
   schickte auf eine Suche durch 78 Server; welcher gemeint war, stand
   nirgends. Seit 0.30.0 nennt sie die Portbasis, den gezogenen Port und das
   Verzeichnis -- die drei Angaben, mit denen sich die Prueflage in einer Zeile
   wiederfinden laesst. */
const READY_TRIES = 300;
const READY_STEP = 100;
/* DIE MELDUNG ALS EIGENE FUNKTION, und das ist kein Umweg: die Zusage dazu
   soll sie FAHREN und nicht den Quelltext lesen -- und einen Zweitserver
   wirklich ins Leere laufen zu lassen kostete dreissig Sekunden. So steht die
   Meldung an EINER Stelle, und die Zusage baut dieselbe. */
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
  /* EIN SERVER, DER VON SELBST ENDET, IST EIN FUND -- 0.30.0, BA 2. Bis dahin
     fiel er erst an der naechsten Anfrage auf, und zwar als „fetch failed"
     ohne Ort und ohne Grund. Wer ihn beendet hat, weiss es; wer ihn verliert,
     sucht. Deshalb sagt er es hier selbst, mit Portbasis, Port, Verzeichnis
     und den letzten Zeilen seiner Ausgabe.
     `state.stopped` SETZT stop() -- ein geordnetes Ende ist kein Fund. */
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
           // Der laufende Sitzungscookie zum Mitgeben. Gebraucht seit 0.9.0
           // von den Prueflagen, die einen KOPF faelschen muessen: dafuer
           // reicht call() nicht, und ein zweiter Anmeldeweg daneben waere
           // eine zweite Wahrheit ueber dieselbe Sitzung.
           cookieValue: () => cookieB,
           stop: () => { state.stopped = true; return endKind(kindB); } };
}

/* ================= DIESER PRUEFLAUF LIEST DEUTSCH -- 0.24.3 ==============
   Bis 0.24.2 sprach eine frische Installation Deutsch, weil die
   Vorgabesprache eine Konstante im Quelltext war. Seit F2 startet eine
   FRISCHE Installation auf Englisch, und nur ein BESTAND behaelt Deutsch --
   die Prueflagen legen aber alle frische an.

   DAMIT WAEREN 46 ZUSICHERUNGEN MIT DEUTSCHEM WORTLAUT ROT GEWORDEN, und
   keine davon haette etwas Falsches gemeldet: der Server antwortet richtig,
   nur eben auf Englisch.

   DER EHRLICHE WEG IST DER, DEN EIN DEUTSCHER BROWSER AUCH GEHT: er sagt im
   Kopf, welche Sprache er liest. `Accept-Language` ist die zweite der drei
   Quellen von localeOf(req) -- damit pruefen die 46 Zeilen weiterhin ihren
   Gegenstand, UND sie fahren nebenbei den neuen Weg ab.

   AN EINER STELLE UND NICHT IN ACHT HELFERN: der Lauf hat mehrere Rufer, und
   acht Stellen liefen auseinander. Wer den Kopf ausdruecklich setzt, behaelt
   ihn -- so pruefen die englischen Zeilen dieser Runde ihre eigene Sprache.
   DER MOCK IN buildDom() IST NICHT BETROFFEN: er ersetzt `w.fetch` im
   JSDOM-Fenster und geht hier gar nicht vorbei. */
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
   erzeugen. (Bis 0.8.91 stand hier "sieben ueber sechs" -- nachgezaehlt am
   Quelltext sind es sechs ueber fuenf; PUT /api/users/:id traegt zwei davon.)

   Die Pruefungen, die etwas ANDERES pruefen -- das Vokabular in der
   Exportdatei, die Rollenleiter, den Grabstein --, sollen weiterhin ihren
   Gegenstand pruefen und nicht an der neuen Schranke haengenbleiben. Dafuer
   steht dieser Umschlag: er sieht am Weg, ob eine Freigabe noetig ist, holt sie
   mit dem bekannten Passwort und ruft dann erst.

   ER IST SICHTBAR UND BENANNT UND STEHT NICHT IN call(). Das ist der Punkt: die
   Schranke selbst wird in eigenen Gruppen geprueft, und dort wird ausdruecklich
   mit dem ROHEN Rufer gearbeitet. Wer diesen Umschlag entfernt, sieht die
   Schranke sofort -- ein Umschlag, der sie unsichtbar macht, waere Stolperstein
   52 in Reinform.

   WELCHER ZWECK ZU WELCHEM WEG GEHOERT, steht hier genau einmal. Passt keiner,
   ruft er unveraendert durch. */
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

/* Macht aus einem rohen Rufer einen, der die Freigabe vorher holt. Das
   Passwort gehoert dazu -- ohne es gibt es keine Freigabe, und genau das ist
   die Aussage der Runde. */
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
   AM 8. SEPTEMBER 2026 GESEHEN: sieben verwaiste Server, zweieinhalb Stunden
   alt, jeder mit seinem Wegwerfverzeichnis. Der Waechter „Keine Prueflage
   laesst ihren Server zurueck" greift nur beim ORDENTLICHEN Ende -- wer den
   Lauf mit Strg-C anhaelt oder das Fenster schliesst, laesst alles stehen, was
   gerade laeuft.
   DIE GEGENPROBE HAT IHREN AUFRAEUMER SCHON (foreignServer), DER PRUEFSTAND
   HATTE KEINEN. Er startet in ein belegtes Portfenster hinein und merkt es
   nicht: ein zweiter Server auf demselben Port faellt nicht von selbst auf,
   die Bereitschaftspruefung bekommt ja eine Antwort (Stolperstein 139).

   ERKANNT WIRD AM WEGWERFVERZEICHNIS UND NICHT AM NAMEN. `node server.js`
   heisst der Server des Betreibers auch -- und den darf dieser Aufraeumer
   unter keinen Umstaenden anfassen. Ein Prozess zaehlt deshalb nur dann als
   Rest, wenn sein DATA_DIR unter dem Wegwerfpfad DIESES Pruefstands liegt:
   `<tmp>/kriterion-...`. Ein Bestand liegt dort nie.

   UND ER ZAEHLT NUR, WAS WIRKLICH VERWAIST IST -- also einen Prozess, dessen
   VATER FORT IST. Das ist die Frage, um die es geht: ein Rest ist kein Server
   mit einem bestimmten Namen, sondern einer, auf den niemand mehr wartet.

   ZWEI FAELLE HAENGEN DARAN, UND DER ZWEITE HAT DIESE ZEILE ERZWUNGEN.
   Der erste ist der eigene Lauf: waehrend er laeuft, leben bis zu 79 eigene
   Server mit genau solchen Verzeichnissen, und ein Aufraeumer, der sie
   mitnaehme, braechte den Lauf um, den er schuetzen soll.
   DER ZWEITE IST DIE GEGENPROBE, und sie faehrt VIER LAEUFE NEBENEINANDER.
   Ein Aufraeumer, der nur „nicht von mir" fragt, raeumt dort die Server der
   drei anderen Spuren weg -- gefahren am 12. September 2026, und alle
   sechsundzwanzig Rueckbauten meldeten ABGERISSEN nach einer Sekunde. DAS IST
   GENAU DER SCHADEN, GEGEN DEN foreignServer() GEBAUT IST, nur aus der anderen
   Richtung: dort nimmt ein fremder Lauf die Ports, hier naehme ein fremder
   Lauf die Prozesse.
   „DER VATER IST FORT" IST DIE ANTWORT AUF BEIDE: die eigenen Kinder haben uns
   als Vater, die Kinder der Nachbarspur haben ihren eigenen Lauf -- und nur
   ein Rest haengt an der Eins, weil sein Lauf nicht mehr da ist.

   GELESEN WIRD UEBER `/proc`, wie ueberall in diesem Haus: keine neue
   Abhaengigkeit, kein `ps`, kein `pkill` auf einen Namen -- genau der hat in
   0.17.0 den Schaden ausgedehnt. */
const LEFTOVER_ROOT = path.join(os.tmpdir(), 'kriterion-');

function parentOf(pid) {
  let row;
  try { row = fs.readFileSync(`/proc/${pid}/stat`, 'utf8'); } catch { return 0; }
  /* HINTER DER LETZTEN KLAMMER UND NICHT AM ZWEITEN FELD: der Name des
     Prozesses steht in Klammern und darf selbst Leerzeichen und Klammern
     tragen. Wer stumpf an Leerzeichen trennt, liest bei einem solchen Namen
     die falsche Zahl. */
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
    /* DER VATER MUSS FORT SEIN. `ppid === 1` heisst: er ist gestorben, und der
       Kern hat den Prozess an die Eins gehaengt. Lebt der Vater noch, gehoert
       der Server einem laufenden Prueflauf -- unserem eigenen oder dem der
       Nachbarspur -- und ist kein Rest. */
    const father = parentOf(Number(e));
    if (father > 1 && alive(father)) continue;
    if (ourOwn(Number(e))) continue;
    outcome.push({ pid: Number(e), where,
      port: (environment.find(z => z.startsWith('PORT=')) || '').slice(5) });
  }
  return outcome;
}

/* RAEUMT AUF UND SIEHT NACH -- dieselbe Bauform wie cleanUp() in der
   Gegenprobe: ein Aufraeumen, das nie greift, sieht aus wie eines, das greift.
   Geliefert wird, WAS es angefasst hat, und ob etwas stehengeblieben ist. */
function sweepLeftovers() {
  const found = leftovers();
  for (const z of found) { try { process.kill(z.pid, 'SIGKILL'); } catch {} }
  /* EIN SIGKILL WIRKT NICHT IN DERSELBEN ZEILE. Gewartet wird synchron: der
     Aufraeumer laeuft VOR dem ersten Server, und ein await mittendrin liesse
     den Lauf an ihm vorbeistarten. */
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
   BIS 0.33.2 STAND ER EINMAL FUER DEN GANZEN LAUF. Seit dem Umzug ruft ihn
   jedes Modul, das ihn braucht, fuer sich: starten, einrichten, anmelden.

   ES IST KEINE ZWEITE WAHRHEIT UEBER DIE EINRICHTUNG. Der Weg geht ueber
   dieselben zwei Routen, die der Rundlauf in „Frische Installation" und
   „Anmeldung" namentlich prueft. Hier wird nichts behauptet und nichts
   gezaehlt -- hier wird aufgebaut, damit die Gruppen danach ihren Gegenstand
   haben. Wer die Einrichtung selbst pruefen will, findet sie dort.

   DER RUNDLAUF RUFT DAS NICHT: er richtet mit seinen eigenen Zeilen ein, und
   die tragen die Zusagen. Zwei Aufbauten hintereinander bekaemen beim zweiten
   „schon eingerichtet" zu hoeren. */
async function mainServerReady() {
  await startServer();
  await call('POST', '/api/setup', { user: USER, password: PASSWORD });
  await call('POST', '/api/login', { user: USER, password: PASSWORD });
}

/* ================= WORAUS DER PRUEFSTAND BESTEHT -- 0.34.0 =================
   BIS 0.33.2 WAR DAS EINE DATEI. Seit dem Umzug sind es der Treiber und die
   Module in test/. Jeder Waechter, der „den Pruefstand" liest -- die Zahl der
   Startstellen, der Sprachwaechter, die Laenge der Funktionen --, liest sie
   alle. Die Liste steht deshalb hier und nicht dreimal daneben: drei Listen
   liefen auseinander, und der eine Waechter saehe ein Modul, das dem anderen
   entgeht (Stolperstein 47).
   GELESEN WIRD DAS VERZEICHNIS UND NICHT EINE AUFZAEHLUNG: ein neues Modul
   ist damit von selbst dabei. Eine Aufzaehlung muesste jemand nachziehen, und
   genau das wird vergessen. */
function benchFiles() {
  const wo = path.join(__dirname, 'test');
  const module = fs.existsSync(wo)
    ? fs.readdirSync(wo).filter(n => n.endsWith('.js')).sort().map(n => 'test/' + n)
    : [];
  return ['testbench.js', ...module];
}

/* ================= WAS EIN MODUL MELDET =================
   Jedes Modul laeuft als eigener Prozess. Seine Zahlen muessen deshalb zum
   Treiber zurueck: die Zaehlung, die Zeittafel und die Liste der Server, die
   es gestartet hat. Geschrieben wird in eine Datei, deren Weg in
   TESTBENCH_REPORT steht -- nicht auf die Ausgabe: counterproof.js liest die
   Ausgabe und erkennt Gruppen an "── " und rote Punkte an zwei Leerzeichen vor
   einem Kreuz. Eine Meldezeile dazwischen waere eine dritte Sorte Zeile. */
const REPORT_PATH = process.env.TESTBENCH_REPORT || '';

function counters() {
  /* DIE PRUEFLAGEN KOMMEN MIT IHREN BASEN ZURUECK und nicht als blosse Zahl:
     der Waechter „Die Portbasen und der Versatz" rechnet ueber die Basen, die
     der Lauf WIRKLICH benutzt hat. Eine Zahl allein liesse ihn nach dem Umzug
     nur noch den Rest sehen, der im Treiber geblieben ist -- und eine Basis,
     die nur ein Modul vergibt, waere von keinem Waechter mehr gesehen
     (Stolperstein 139).
     OB EIN SERVER OFFEN IST, WIRD HIER GEMESSEN und nicht spaeter: moduleRun()
     raeumt gleich danach auf, und danach ist jeder beendet. */
  return {
    passedCount, failed, skipped, stillPassed, stillFailed, groupsShown, groupsStill,
    times: TIMES,
    cases: CASES.map(l => ({ base: l.base, port: l.port, pid: l.kind.pid,
      open: l.kind.exitCode === null && l.kind.signalCode === null })),
    smtp: SMTP_CASES.map(l => ({ base: l.base, port: l.port, kind: l.kind,
      open: l.server.listening }))
  };
}

/* NIMMT DIE ZAHLEN EINES MODULS AUF. Gerufen wird das vom Treiber, und zwar
   in genau diese Zaehler -- der Schlussblock liest dieselben Namen wie in
   einem einzigen Prozess, und es gibt keine zweite Rechnung daneben. */
function addCounters(z) {
  passedCount += z.passedCount; failed += z.failed; skipped += z.skipped;
  stillPassed += z.stillPassed; stillFailed += z.stillFailed;
  groupsShown += z.groupsShown; groupsStill += z.groupsStill;
  for (const r of z.times || []) TIMES.push(r);
}

/* GRUPPEN, DIE GAR NICHT ERST GESTARTET WURDEN. Ein Teillauf startet nur die
   Module, die er zeigt; die uebrigen Gruppen hat niemand gefahren. Sie zaehlen
   trotzdem als uebergangen, sonst behauptete der Schlussblock eines Teillaufs,
   es gaebe nur die Gruppen der gestarteten Module. */
let skippedGroupCount = 0;
function addSkippedGroups(count) { groupsStill += count; skippedGroupCount++; }
/* WIE VIELE MODULE DIESER LAUF AUSGELASSEN HAT. Der Treiber fragt danach:
   zwei seiner Gruppen rechnen ueber ALLE Module und koennen in einem Teillauf
   nichts belegen. */
const skippedModules = () => skippedGroupCount;

/* DER LAUF EINES EINZELNEN MODULS. Er endet immer an derselben Stelle: die
   Meldung wird geschrieben, das Wegwerfverzeichnis entfernt, der Rueckgabewert
   folgt dem Gezeigten. Bricht das Modul ab, geht die Ursache mit -- dieselbe
   Kette wie im Treiber, denn ein `cause` kann selbst eines tragen. */
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
  /* DER HAUPTSERVER GEHOERT DAZU. Er haengt nicht in CASES -- er wird nicht
     ueber startFurtherServer gestartet --, und ein Modul, das ihn stehen
     liesse, hielte seinen Prozess am Leben und seinen Port besetzt. */
  if (kind) { try { kind.kill(); } catch {} }
  for (const l of CASES) { try { l.kind.kill(); } catch {} }
  for (const l of SMTP_CASES) { try { l.server.close(); } catch {} }
  fs.rmSync(DATA, { recursive: true, force: true });
  process.exit(abort ? 1 : (failed ? 1 : 0));
}

/* EIN MODUL, DAS FUER SICH GEFAHREN WIRD. `node test/source.js` soll
   dasselbe tun wie der Treiber mit diesem einen Modul -- sonst waere das
   Verzeichnis eine Ablage und kein Weg. Ohne Treiber steht auch der
   Schlussblock, sonst endete der Lauf ohne Zahl. */
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
  SCRYPT_SHIPPED, RUN_SCRYPT, readmeFlat,
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
