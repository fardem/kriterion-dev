/* Kriterion — Pruefstand: der Rahmen der Oberflaechenpruefungen
 *
 * buildDom() baut ein vollstaendiges jsdom-Fenster mit einem gestellten
 * Server dahinter. Dazu die Helfer, die an einem solchen Fenster arbeiten:
 * der Dialog der zweiten Bestaetigung, die Tagzeile, das Warten auf die
 * Suche, die Karten des Systembereichs, der Leser der Bildschirmtexte und
 * drei Leser des Stilblatts.
 *
 * ER STEHT NEBEN test/rahmen.js UND NICHT DARIN -- 0.34.0, F3. Nur die
 * Module, die Fenster bauen, brauchen ihn. Geteilt wird er trotzdem:
 * buildDom() rufen die acht Module der Oberflaeche, der Rundlauf und die
 * Staende 0.30 und 0.31 -- zwei Fassungen waeren zwei Wahrheiten
 * (Stolperstein 47).
 *
 * DER RUMPF LIEGT IN EINER KLAMMER, aus demselben Grund wie in
 * test/rahmen.js: die Datei liegt in test/, ihr Quelltext spricht aber vom
 * Wurzelverzeichnis.
 */
const H = require('./rahmen.js');

module.exports = (function (__dirname, require) {
const {
  fs, os, path, attachments, TEXT, BASE_SOURCE, BASE_SCRIPT, group,
  check, equal, BASE, open, shortRun, names
} = H;

/* ================= Oberflaeche (echtes DOM) ================= */
// Baut eine Oberflaeche im echten DOM auf. einstellungen bestimmt, was
// /api/settings liefert -- damit laesst sich derselbe Aufbau einmal mit
// Vorgaben und einmal mit eigenem Vokabular pruefen.
// Anbieterlage fuer die Oberflaechenpruefungen, so wie der Server sie liefert:
// drei im Vorrat, Startpage als Standard. Der eigene Anbieter traegt bewusst
// spitze Klammern im Namen -- er ist Eingabe des Admins und wird als
// Beschriftung gerendert; daran haengt die Maskierungspruefung.
/* Das Passwort der Prueflage fuer die zweite Bestaetigung. Es steht hier
   einmal, damit die Prueflagen es nennen koennen -- und damit der FALSCHE Fall
   ueberhaupt einer ist: ein Mock, der jedes Passwort durchliesse, machte jede
   Pruefung auf die Absage gruen, ohne etwas zu belegen. */
const DOM_PASSWORD = 'chefinnen-langes-wort';

/* Das Sicherheitsprotokoll der Prueflage. VIER ZEILEN, VIER LAGEN, und jede
   wird gebraucht: ein Vorgang mit Handelndem und Ziel, einer am eigenen
   Zugang, einer VOM WIRT (wer ist leer) und eine gescheiterte Anmeldung an
   einem unbekannten Namen (wer UND ziel sind leer). Waeren sie gleichartig,
   liesse sich nicht pruefen, dass die Karte sie verschieden liest. */
/* `zahlen` SEIT 0.13.0: die Zahlen an den Filterpillen. Sie zaehlen ueber die
   GANZE Tabelle und nicht ueber die vier geholten Zeilen -- deshalb sind sie
   groesser als das, was hier steht, genau wie am echten Server. */
const DOM_LOG = {
  days: 180, limit: 100, total: 7,
  counts: { all: 7, failed: 2, logins: 1, users: 3, twofactor: 0, inventory: 1 },
  rows: [
    { id: 7, at: '2026-08-24 09:15:00', event: 'user.role', actor: 1, actorName: 'chefin',
      target: 2, targetName: 'bert', detail: 'admin' },
    { id: 6, at: '2026-08-24 08:00:00', event: 'export', actor: 1, actorName: 'chefin',
      target: null, targetName: null, detail: null },
    { id: 5, at: '2026-08-23 22:40:00', event: 'user.password', actor: null, actorName: null,
      target: 3, targetName: 'carla', detail: null },
    { id: 4, at: '2026-08-23 21:05:00', event: 'login.fail', actor: null, actorName: null,
      target: null, targetName: null, detail: null }
  ]
};

/* DIE GRUPPEN DES PROTOKOLLFILTERS FUER DEN MOCK -- GELESEN und nicht
   abgeschrieben. Eine zweite Liste daneben liefe auseinander, und der Mock
   belegte dann etwas anderes als der Server tut (Stolperstein 102). */
const DOM_PROT_GROUPS = (() => {
  const q = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-protgruppen-'));
  const g = JSON.parse(shortRun(
    `console.log(JSON.stringify(require('./auth').LOG_GROUPS));`, q));
  fs.rmSync(q, { recursive: true, force: true });
  return g;
})();

/* Fuellt den Dialog der zweiten Bestaetigung und drueckt den Knopf.
   NEUE BEDIENELEMENTE WERDEN PER dispatchEvent GEDRUECKT, samt Durchlauf des
   Event Loops -- .click() genuegt nicht. Liefert false, wenn gar kein Dialog
   dasteht: eine Prueflage, die ihn erwartet und nicht bekommt, soll das sehen
   statt an einer Null zu zerbrechen (Stolperstein 103). */
/* DIE RUECKFRAGE AUS confirmBox() BEANTWORTEN -- 0.22.0. Bis 0.21.1 stellten die
   Prueflagen `w.confirm = () => true`; seit die Oberflaeche kein confirm() mehr
   ruft (Bauabschnitt 4), waere die Attrappe ein Stellrad ohne Wirkung. Ein
   Beobachter am Dokument sieht jedes neue Fenster und drueckt den Ja- oder
   den Nein-Knopf -- aber NUR an Fenstern ohne Eingabefeld: das Passwortfenster
   und das Loeschfenster mit seinen Haekchen bedient die Prueflage selbst.
   `transcript` sammelt den Wortlaut der beantworteten Fenster, wie es die
   alte Attrappe mit dem Text von confirm() tat. */
function placeConfirm(w, ja = true, transcript = null) {
  const observer = new w.MutationObserver(() => {
    for (const bd of w.document.querySelectorAll('.backdrop')) {
      const modal = bd.querySelector('.modal');
      if (!modal || modal.querySelector('input, textarea, select') || bd.dataset.staged) continue;
      const button = modal.querySelector(ja ? '[data-yes]' : '[data-no]');
      if (!button) continue;
      bd.dataset.staged = '1';
      if (transcript) transcript.push(modal.textContent.replace(/\s+/g, ' ').trim());
      button.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    }
  });
  observer.observe(w.document.body, { childList: true, subtree: true });
  return observer;
}

async function confirmImDom(d, password = 'chefinnen-langes-wort', cancel = false, code) {
  const field = d.w.document.getElementById('confirm-pass');
  if (!field) return false;
  const button = field.closest('.modal')?.querySelector(cancel ? '[data-no]' : '[data-yes]');
  if (!button) return false;
  field.value = password;
  /* SEIT 0.10.0 KANN DASSELBE WINDOW EIN ZWEITES FELD TRAGEN -- aber nur bei
     Zugaengen mit zweitem Faktor. Gefuellt wird es nur, wenn es dasteht: eine
     Prueflage ohne Faktor soll hier nichts erfinden, sondern sehen, dass es
     fehlt. */
  const codeField = d.w.document.getElementById('confirm-code');
  if (codeField && code !== undefined) codeField.value = code;
  button.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 60));
  return true;
}

const DOM_PROVIDER = [
  { key: 'google', name: 'Google', template: 'https://www.google.com/search?q=%s',
    own: false, present: true, active: false, isDefault: false },
  { key: 'bing', name: 'Bing', template: 'https://www.bing.com/search?q=%s',
    own: false, present: true, active: true, isDefault: false },
  { key: 'ddg', name: 'DuckDuckGo', template: 'https://duckduckgo.com/?q=%s',
    own: false, present: true, active: false, isDefault: false },
  { key: 'startpage', name: 'Startpage', template: 'https://www.startpage.com/sp/search?query=%s',
    own: false, present: true, active: true, isDefault: true },
  { key: 'brave', name: 'Brave Search', template: 'https://search.brave.com/search?q=%s',
    own: false, present: true, active: false, isDefault: false },
  { key: 'ecosia', name: 'Ecosia', template: 'https://www.ecosia.org/search?q=%s',
    own: false, present: true, active: false, isDefault: false },
  { key: 'eigen1', name: 'Forum <b>X</b>', template: 'https://forum.beispiel.de/suche?q=%s',
    own: true, present: true, active: true, isDefault: false },
  { key: 'eigen2', name: '', template: '', own: true, present: false, active: false, isDefault: false },
  { key: 'eigen3', name: '', template: '', own: true, present: false, active: false, isDefault: false }
];

/* criteriaWeights und ownValues sind die beiden Stellschrauben der
   Gewichtung. Vorgabe sind DREI VERSCHIEDENE Gewichte, eines davon 1 -- so
   lassen sich Anzeige und Nichtanzeige an derselben Prueflage belegen. Ein
   Mock mit lauter Einsen naehme genau die Pruefung weg, fuer die er
   gebaut ist (Stolperstein 90). */
/* DIESELBE ZUORDNUNG WIE `HINTS` IN mail.js, und sie steht hier, weil der
   Nachbau den Server nicht fragen kann. Die TEXTE stehen nicht hier. */
const MAIL_HINT_KEYS = { gmail: 'mail.hintGmail', gmx: 'mail.hintGmx', web: 'mail.hintWebDe' };
const DE_TEXTS = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'));

function buildDom(JSDOM, { withoutLanguage = false, settings = { filters: null }, hash = '', tags = [], overviewItems = null, setup = false, loggedIn = true, users = null, testDays = null, secondEntry = null, criteriaWeights = [1.5, 1, 0.5], ownValues = [3, 3, 3], withoutRating = false,
  /* ZU WELCHEM KASTEN JEDES DER DREI KRITERIEN GEHOERT, seit 0.21.0. Vorgabe
     sind DREI Nachher-Kriterien -- genau die Lage, in der der Bestand nach der
     Migration steht, und genau die, in der jede Pruefung von vor dieser Runde
     ihren Gegenstand behaelt. Wer die zwei Kaesten braucht, stellt hier um;
     ein fester Wert naehme dem Mock die Lage, fuer die er gebraucht wird. */
  criteriaPhases = ['after', 'after', 'after'],
  /* UND WELCHE ZAHL DER POTENZIALKASTEN DANN TRAEGT. Stellbar, weil „ohne
     Zahl kein Knopf" auch fuer den zweiten Kasten zu belegen ist. */
  potentialValue = undefined,
  /* OB DER BEISPIELEINTRAG UNGETESTET IST, seit 0.21.0. Vorgabe ist
     „getestet" -- so stand er hier immer, und jede Pruefung von vor dieser
     Runde behaelt damit ihren Gegenstand. Der Einklappzustand der beiden
     Sternkaesten haengt seit 0.21.0 an genau diesem Schalter, und ohne ihn
     waere die Regel gar nicht zu belegen. */
  /* DIE KOMMENTARE DES BEISPIELEINTRAGS, stellbar seit 0.30.0 -- wie
     `openInventory` fuer die Ansicht „Offen". Die vier Zustaende des
     Faelligkeitsdatums lassen sich an der festen Liste nicht stellen: sie
     braucht vier Aufgaben mit vier verschiedenen Daten, und eine davon
     erledigt. */
  commentInventory = null,
  /* DIE TESTTAGE DES BEISPIELEINTRAGS, stellbar seit 0.30.1 -- wie
     `commentInventory` fuer die Kommentare. Die drei Faelle der Testtagzeile
     (ohne Tags, mit zweien, mit sieben) sind sonst nicht zu fahren: der
     Vorgabeeintrag traegt genau einen Testtag mit genau einem Tag. */
  dayInventory = null,
  untested = false, openInventory = null, trashInventory = null, backupStatus = null, backupCopies = null, sessionsInventory = null, logInventory = null,
  publicAddress = '', mailStatus = null, mailError = false, ownAddress = 'chefin@beispiel.de',
  tokenThrottle = 0, signup = false, requestsStatus = null, twoFactorState = null, statsExport = null,
  statsMethod = undefined,
  /* DIE BILDABLAGE IN DEN KENNZAHLEN, seit 0.19.0 -- stellbar, weil die Karte
     drei Lagen zeigen muss: es liegt PNG da (der Knopf ist bedienbar), es
     liegt keines mehr da (er ist es nicht), und ein Lauf ist unterwegs. */
  statsImageFormats = undefined,
  statsSwitch = null,
  /* DER ZWEITE BESTANDSLAUF, seit 0.19.4 -- eigenes Feld und nicht dasselbe:
     die Karte muss auseinanderhalten koennen, welcher der beiden laeuft. */
  statsGeometry = null,
  convertImages = true,
  twoFactorCodes = null, loginFactor = false, searchError = false, searchThrottles = null,
  categories = [{ id: 21, name: 'Werkzeug', usage_count: 2, language: 'de' },
                { id: 22, name: 'Material', usage_count: 0, language: 'de' }],
  /* DIE ERSTELLUNGSSPRACHE DER DREI KRITERIEN -- 0.25.0. Getrennt von
     `categories`, weil die drei Kriterienzeilen erst weiter unten aus mehreren
     Listen zusammengesetzt werden. */
  criteriaLanguages = ['de', 'de', 'de'],
  /* DIE NAMEN JE SPRACHE, seit 0.24.5 -- `{ en: { 21: 'Tool' }, tr: { … } }`.
     NUR DIE UEBERSETZUNGEN, NICHT DIE GRUNDZEILE: am echten Server steht der
     Name der Vorgabesprache in `product_categories.name` beziehungsweise
     `rating_criteria.name`, und `category_names`/`criterion_names` tragen
     ausschliesslich die ANDEREN Sprachen (`writeName()` loescht die Zeile
     sogar, sobald sie dem Grundnamen gleicht). Ein Mock mit einer Zeile fuer
     die Vorgabesprache stellte eine Ablage nach, die es nicht gibt.
     VORGABE IST „keine Uebersetzung": jede Prueflage von vor dieser Runde
     behaelt damit ihren Gegenstand. */
  categoryNames = null, criterionNames = null,
  /* Die Ablehnung am Beispieleintrag, seit 0.14.0. Vorgabe ist "nicht
     abgelehnt" -- so, wie der Eintrag bis dahin dastand; wer die Marke
     braucht, reicht die drei Felder herein. Ausdruecklich EINZELN und nicht
     als Schalter: die Lagen, um die es geht, unterscheiden sich gerade darin,
     WELCHES der drei fehlt. */
  rejection = null,
  /* WEM DER EINTRAG GEHOERT, seit 0.15.0. Vorgabe ist "einem anderen" (bert)
     -- so stand er hier immer. Wer die Lage braucht, in der die Fragende
     selbst ihn angelegt hat, schaltet um; daran haengt der Papierkorb an der
     Begruendung, denn ENTFERNEN darf, wer den Eintrag aendern darf. Ein
     Schalter, der nie umgelegt wird, belegt nichts ueber den zweiten
     Zustand. */
  /* WELCHE VERGLEICHSZAHL DER RECHENWEG TRAEGT, seit 0.17.0. Vorgabe ist eine
     ANDERE als das gewichtete Ergebnis -- nur dann kann die Prueflage den
     Unterschied ueberhaupt zeigen (Stolperstein 224). Wer den Fall „beide
     gleich" braucht, stellt hier 3 ein. */
  calculationEqual = undefined,
  /* WIE VIELE STIMMEN JE KRITERIENZEILE STECKEN, seit 0.17.2. Vorgabe sind
     fuenf, 128 und keine -- die Lage, in der die Klammer hinter dem Schnitt
     STEHT. Wer die Lage braucht, in der sie ausdruecklich FEHLT, reicht
     Schnitt UND Zahl je Zeile selbst herein: bei einer einzigen Stimme ist der
     Schnitt ihr Wert, und ein gestellter Schnitt von 3,4 aus einer Stimme
     waere eine Luege ueber die eigene Prueflage (Stolperstein 102). */
  voteColumns = null,
  entryMine = false } = {}) {
  // Aus demselben Paket wie JSDOM, das der Aufrufer mitbringt -- require ist
  // hier ein Griff in den Zwischenspeicher, kein zweites Laden.
  const { VirtualConsole } = require('jsdom');
  // Die Anbieter kommen ueber /api/settings. Wer eigene Einstellungen
  // mitgibt, ueberschreibt gezielt -- alles Uebrige bleibt bei der Vorgabe.
  settings = { searchProviders: DOM_PROVIDER, searchNames: 3, ...settings };
  /* DIE DREI VOKABELTAFELN, WIE SIE DER ECHTE SERVER SCHICKT -- 0.24.4.
     Seit dieser Runde traegt /api/settings neben `vocabulary` (dem Satz des
     LESERS) drei Tafeln je Sprache: was EINGETRAGEN ist, was ein Leser dieser
     Sprache SAEHE, und die VORGABE aus der Sprachdatei. Die Karte „Vokabular"
     liest alle drei -- ein Mock ohne sie zeigte vierzehn leere Felder und
     belegte damit etwas, das der Server nicht tut (Stolperstein 90).
     ABGELEITET AUS DEM, WAS DIE PRUEFLAGE MITGIBT, und nicht als vierte
     Liste daneben: was eine Prueflage unter `vocabulary` hereinreicht, ist
     genau das, was der Eigentuemer eingetragen hat. Die Vorgaben kommen aus
     den ECHTEN Sprachdateien, wie ueberall in diesem Mock.
     WER DIE TAFELN SELBST MITGIBT, BEHAELT SIE -- die Prueflagen der Runde
     0.24.4 stellen damit Lagen her, die sich aus `vocabulary` allein nicht
     ableiten lassen (etwa: fuer Englisch ist etwas eingetragen, fuer Deutsch
     nichts). */
  {
    const languageDirectory = path.join(__dirname, 'public', 'languages');
    const codes = fs.readdirSync(languageDirectory)
      .filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
    const defaultsOf = (code) => Object.fromEntries(
      Object.entries(JSON.parse(fs.readFileSync(path.join(languageDirectory, `${code}.json`), 'utf8')))
        .filter(([k]) => k.startsWith('vocabulary.'))
        .map(([k, v]) => [k.slice('vocabulary.'.length), v]));
    const entered = Object.fromEntries(Object.entries(settings.vocabulary || {})
      .filter(([, v]) => typeof v === 'string' && v.trim()).map(([k, v]) => [k, v.trim()]));
    const readerLanguage = settings.language || 'de';
    if (!settings.vocabularyDefaults)
      settings.vocabularyDefaults = Object.fromEntries(codes.map(c => [c, defaultsOf(c)]));
    if (!settings.vocabulariesOwn)
      settings.vocabulariesOwn = Object.fromEntries(
        codes.map(c => [c, c === readerLanguage ? { ...entered } : {}]));
    /* UND DER RUECKFALL WIE AM SERVER: was fuer EINE Sprache eingetragen ist,
       steht in jeder anderen, fuer die nichts dasteht -- „lieber ein Wort in
       der falschen Sprache als gar keines" (0.24.3, F3). */
    if (!settings.vocabularies)
      settings.vocabularies = Object.fromEntries(
        codes.map(c => [c, { ...settings.vocabularyDefaults[c], ...entered }]));
  }
  /* DIE ZWEI NAMENSTAFELN WERDEN KOPIERT -- 0.24.5. Der Mock SCHREIBT in sie
     (writeNameMock), und eine Prueflage, die dieselbe Tafel an zwei Fenster
     gibt, saehe im zweiten die Umbenennung des ersten. Ein Bestand, der
     zwischen zwei Prueflagen wandert, ist kein Bestand.
     WER SIE VON AUSSEN ANSEHEN WILL, bekommt die Kopie im Rueckgabewert. */
  categoryNames = categoryNames ? JSON.parse(JSON.stringify(categoryNames)) : null;
  criterionNames = criterionNames ? JSON.parse(JSON.stringify(criterionNames)) : null;
  /* Vier Zugaenge, und jeder steht fuer eine andere Lage --
     die Eigentuemerin (die Fragende selbst), ein zweiter Admin, ein
     gewoehnlicher Benutzer und ein Grabstein. Waeren sie gleichartig, liesse
     sich nicht pruefen, dass die Oberflaeche sie verschieden behandelt. */
  users = users || {
    ich: 1, mayRoles: true, owner: 1,
    users: [
      { id: 1, username: 'chefin', role: 'owner', status: 'active', last_login: '2026-08-01 09:00:00', created_at: '2026-01-01 09:00:00', entries: 5 },
      /* bert TRAEGT ohnePasswort UND der Grabstein AUCH, und das ist die
         eigentliche Lage: beide tragen in Wahrheit den leeren Hash. Nur an
         der aktiven Zeile darf "noch kein Passwort" stehen -- am Grabstein
         waere es eine Falschaussage. Ohne beide Zeilen liesse sich das nicht
         unterscheiden. */
      { id: 2, username: 'bert', role: 'admin', status: 'active', last_login: null, created_at: '2026-02-01 09:00:00', entries: 2, withoutPassword: true },
      { id: 3, username: 'carla', role: 'user', status: 'locked', last_login: null, created_at: '2026-03-01 09:00:00', entries: 0, withoutPassword: false },
      { id: 4, username: 'deleted-4', role: 'user', status: 'deleted', last_login: null, created_at: '2026-04-01 09:00:00', entries: 1, withoutPassword: true }
    ]
  };
  /* Der Papierkorb der Prueflage. Zwei Zeilen, zwei Lagen: eine von einem
     lebenden Zugang, eine von einem Grabstein. Wer die Zahlen dieser Prueflage
     misst, misst sie an einem FRISCHEN Aufbau -- die beiden Schreibwege unten
     veraendern sie wirklich (Stolperstein 115). */
  /* Die eigenen Anmeldungen der Prueflage. DREI Zeilen, und eine davon ist
     die eigene -- ohne sie liesse sich "die eigene ist markiert" gar nicht
     pruefen, und ohne die anderen nicht, dass sie nicht mitfaellt.
     Der leere Fall (nur die eigene) ist ueber sessionsInventory zu stellen;
     eine Karte, die nur den einen Zustand kennt, belegt den anderen nicht. */
  const log = logInventory || DOM_LOG;
  /* Der Mailzugang der Prueflage. VORGABE IST EINGERICHTET, denn der
     interessantere Zustand ist der mit Feldern und Werten; die leere Lage
     stellt eine Prueflage ueber mailStatus: {}. Ohne beide bliebe die halbe
     Karte ungeprueft (Stolperstein 81).
     DIE ANBIETERLISTE KOMMT VOM SERVER, wie beim echten: die Oberflaeche
     baut das Auswahlfeld daraus. Eine Liste, die der Mock selbst erfindet,
     deckte genau die Serverseite zu, um die es geht (Stolperstein 102). */
  /* Die Warteschlange der Prueflage, 0.9.1. VORGABE IST "AN, MIT ZWEI ZEILEN":
     der interessantere Zustand ist der mit Inhalt. Die leere Lage und die mit
     kaputtem Versand stellt eine Prueflage ueber requestsStatus -- ohne beide
     bliebe die halbe Karte ungeprueft (Stolperstein 81). */
  requestsStatus = requestsStatus || {
    an: true, deliveryReady: true, deliveryReason: '', cap: 20, hours: 24,
    requests: [
      { id: 11, username: 'neuling', email: 'neuling@beispiel.de',
        created_at: '2026-08-20 09:00:00', confirmed_at: '2026-08-20 09:05:00' },
      { id: 12, username: 'zweiter', email: 'zweiter@beispiel.de',
        created_at: '2026-08-21 10:00:00', confirmed_at: '2026-08-21 10:30:00' }
    ]
  };
  // belegt wird GERECHNET und nicht gestellt -- am echten Server zaehlt es die
  // Zeilen, und ein Mock mit eigener Zahl deckte genau das zu.
  const requestsMock = () => ({ ...requestsStatus, used: requestsStatus.requests.length });
  /* ---- Der zweite Faktor im Mock, 0.10.0 ----
     FESTE, ERFUNDENE WERTE. Der Prueflauf arbeitet nie mit einem echten
     Geheimnis, und ein Code, der aus der Uhr entstuende, machte die Prueflage
     von ihr abhaengig: hier geht es um die KARTE, nicht um die Rechnung. Die
     steht in "Der zweite Faktor: die Rechnung gegen den Standard".
     DER STAND IST VERAENDERLICH, weil der Mock mitziehen muss (Stolperstein
     90): einschalten macht "an", ausschalten macht "aus". */
  const ZF_MOCK_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  const ZF_MOCK_GROUPS = 'GEZD GNBV GY3T QOJQ GEZD GNBV GY3T QOJQ';
  const ZF_MOCK_ROW = 'otpauth://totp/Kriterion%3Achefin?secret=' + ZF_MOCK_SECRET +
    '&issuer=Kriterion&algorithm=SHA1&digits=6&period=30';
  const ZF_MOCK_CODE = '123456';
  let zfStatusMock = twoFactorState || { an: false, since: null, codesOpen: 0, codesTotal: 0 };
  let zfTicketMock = 'ausweis-1', zfTicketCounter = 1;
  let zfCodesMock = twoFactorCodes ||
    ['AAAAA-BBBBB', 'CCCCC-DDDDD', 'EEEEE-FFFFF', 'GGGGG-HHHHH',
     'JJJJJ-KKKKK', 'MMMMM-NNNNN', 'PPPPP-QQQQQ', 'RRRRR-SSSSS'];
  const MAIL_DENIED = 'Das kann nur der Eigentümer dieser Installation.';
  /* DIE ANBIETERLISTE, WIE SIE ÜBER /api/mail HEREINKOMMT -- seit 0.17.3 samt
     Hinweis und den drei festen Werten je Anbieter. Der Dialog wechselt beides
     mit der Auswahl, und beides kommt vom Server; ein Mock ohne diese Felder
     pruefte einen Dialog, den es so nicht gibt.
     DIESELBEN WERTE WIE IN mail.js -- dass sie es wirklich sind, prueft die
     Gruppe „Der Mailversand: das echte SMTP-Gespraech" am laufenden Server. */
  const MAIL_PROVIDER_MOCK = [
    { key: 'gmx', name: 'GMX', server: 'mail.gmx.net', port: 587, secure: false,
      hint: 'GMX verlangt, den Versand über fremde Programme im Konto erst freizuschalten.' },
    { key: 'web', name: 'Web.de', server: 'smtp.web.de', port: 587, secure: false,
      hint: 'Web.de verlangt, den Versand über fremde Programme im Konto erst freizuschalten.' },
    { key: 'gmail', name: 'Gmail', server: 'smtp.gmail.com', port: 465, secure: true,
      hint: 'Gmail verlangt Zwei-Faktor und ein App-Passwort — das Kontopasswort wird abgewiesen.' },
    { key: 'strato', name: 'Strato', server: 'smtp.strato.de', port: 465, secure: true, hint: '' },
    { key: 'ionos', name: 'IONOS', server: 'smtp.ionos.de', port: 587, secure: false, hint: '' },
    { key: 'eigen', name: 'Eigener Server', server: '', port: 587, secure: false, hint: '' }
  ];
  mailStatus = mailStatus || { provider: 'gmx', server: 'mail.gmx.net', port: 587, secure: false,
    user: 'instanz@gmx.de', sender: 'instanz@gmx.de', passwordSet: true,
    testedAt: '2026-08-20 08:30:00' };
  const mailCardMock = () => ({
    provider: mailStatus.provider || '',
    providerName: (MAIL_PROVIDER_MOCK.find(a => a.key === mailStatus.provider) || {}).name || '',
    server: mailStatus.server || '', port: mailStatus.port || 0, secure: mailStatus.secure === true,
    user: mailStatus.user || '', sender: mailStatus.sender || '',
    passwordSet: Boolean(mailStatus.passwordSet),
    /* DIE DREI HINWEISE KOMMEN AUS DER SPRACHDATEI UND NICHT AUS DIESER
       ZEILE -- 0.31.1. Bis hierher standen sie hier ABGESCHRIEBEN, und
       0.31.1 hat zwei davon geaendert: der Dauerhinweis nannte GMX, obwohl er
       auch dort steht, wo es kein GMX gibt. Die Abschrift waere stehen
       geblieben und haette eine Oberflaeche nachgestellt, die es nicht mehr
       gibt -- Stolperstein 47, und ausgerechnet im Pruefstand.
       DER NACHBAU BLEIBT EIN NACHBAU: er waehlt denselben Schluessel wie
       HINTS in mail.js, liest aber den Wert. Was der Server TUT, pruefen die
       Gruppen am laufenden Server; was hier steht, ist der Text dazu. */
    hint: MAIL_HINT_KEYS[mailStatus.provider]
      ? DE_TEXTS[MAIL_HINT_KEYS[mailStatus.provider]] : '',
    hintAlways: DE_TEXTS['mail.hintAlways'],
    providerList: MAIL_PROVIDER_MOCK,
    configured: Boolean(mailStatus.provider && mailStatus.user &&
                          mailStatus.passwordSet && mailStatus.sender),
    addressSet: Boolean(publicAddress), address: publicAddress,
    deadlineMinutes: 15, testedAt: mailStatus.testedAt || null, seconds: 20
  });
  /* Was der Server ueber den Versand sagt -- NACHGERECHNET, nicht gesetzt.
     Drei Zustaende, und die Reihenfolge ist dieselbe wie in server.js: kein
     Zugang, keine oeffentliche Adresse, keine Adresse am Empfaenger. Der
     Fehlschlag kommt ueber mailError. */
  const deliveryState = (empfaenger) => {
    const k = mailCardMock();
    if (!k.configured) return { delivery: 'aus', deliveryReason: 'Es ist kein Mailzugang eingerichtet.' };
    if (!k.addressSet) return { delivery: 'aus', deliveryReason:
      'Ohne PUBLIC_ADDRESS in der .env wird nicht verschickt — der Server wüsste nicht, ' +
      'worauf der Link zeigen soll.' };
    if (!empfaenger) return { delivery: 'aus', deliveryReason:
      'Für diesen Zugang ist keine E-Mail-Adresse hinterlegt.' };
    return mailError
      ? { delivery: 'fehlgeschlagen', deliveryReason: 'Message failed: 550 abgelehnt' }
      : { delivery: 'ok', deliveryReason: '' };
  };
  /* Welcher Zugang eine Adresse hinterlegt hat. Die Karte "Zugaenge" sieht sie
     NIE -- GET /api/users liefert sie nicht mit, und das ist die Entscheidung
     dieser Runde. Der Mock braucht sie trotzdem, weil der echte Server an der
     Tokenroute in die Zeile sieht. bert hat eine, carla nicht: ohne beide
     liesse sich der Zweig "keine Adresse hinterlegt" nicht stellen. */
  const userAddresses = { 1: 'chefin@beispiel.de', 2: 'bert@beispiel.de', 3: '', 4: '' };
  const sessions = sessionsInventory || [
    { id: 'a'.repeat(64), loggedInAt: '2026-08-20 08:00:00',
      lastSeen: '2026-08-24 07:30:00', current: true },
    { id: 'b'.repeat(64), loggedInAt: '2026-08-18 19:15:00',
      lastSeen: '2026-08-23 21:00:00', current: false },
    { id: 'c'.repeat(64), loggedInAt: '2026-08-01 11:00:00',
      lastSeen: '2026-08-22 09:45:00', current: false }
  ];

  const trash = trashInventory || [
    { id: 501, title: 'Weggeworfenes', deleted_at: '2026-08-01 09:00:00',
      deletedBy: { id: 1, name: 'chefin', deleted: false },
      files: 3, bytes: 2048, daysOpen: 12 },
    { id: 502, title: 'Von einem Grabstein', deleted_at: '2026-08-10 11:30:00',
      deletedBy: { id: 4, name: null, deleted: true },
      files: 0, bytes: 512, daysOpen: 27 }
  ];
  /* Die Sicherung der Prueflage. Vorgabe: eingerichtet, mit einer Sicherung
     von vor drei Tagen. Eine Prueflage kann sie ueberschreiben -- die Karte
     hat drei Zustaende (nicht eingerichtet, Zielort mit Fehler, in Ordnung),
     und jeder braucht seinen eigenen Aufbau. */
  const backup = backupStatus || {
    configured: true, root: '/sicherung', place: 'taeglich', filePath: '/sicherung/taeglich',
    // Die Vorgabe ist die EMPFOHLENE Lage -- ausserhalb. Die Gegenlage steht
    // als eigener Aufbau in der Gruppe darunter.
    inWorkDir: false,
    dbBytes: 52428800, durationSeconds: 1, reachable: true, number: 2,
    last: { file: 'kriterion-2026-08-20-03-00-00.sqlite', bytes: 52428800,
              at: '2026-08-20 03:00:00', daysAgo: 3, outdated: false },
    // Seit 0.8.91: die Vorgabe ist "nie gewechselt". Die drei Lagen des
    // Wechsels bekommen ihre eigenen Aufbauten in der Gruppe darunter.
    changedAt: null, outdated: 0,
    /* DIE AUFRAEUMREGEL, seit 0.20.0. VORGABE: Schalter AUS, 3 und 30, und die
       Regel trifft nichts -- genau die Lage einer frischen Installation. Die
       Lagen mit Treffern und mit veralteten Kopien bekommen ihre eigenen
       Aufbauten in der Gruppe darunter (Stolperstein 81: zu jedem "nichts da"
       gehoert das "und so sieht es mit etwas aus" daneben).
       DIE GRENZEN KOMMEN VOM SERVER, auch im Mock: die Karte schreibt sie an
       ihre Felder, statt sie ein zweites Mal zu kennen. */
    cleanup: {
      an: false, keep: 3, days: 30,
      limits: { keep: { fallback: 3, min: 1, max: 20 },
                 days: { fallback: 30, min: 7, max: 365 } },
      reachable: true, matched: [], bytes: 0,
      reason: 'Alle 2 Kopien sind unter den jüngsten 3.',
      /* DIE VOLLSTAENDIGE LISTE -- in der Vorgabelage die beiden Kopien, die
         `zahl: 2` daneben behauptet. Eine leere Liste neben einer Zahl waeren
         zwei Wahrheiten ueber denselben Ort. */
      files: [
        { nr: 1, file: 'kriterion-2026-08-20-03-00-00.sqlite', at: '2026-08-20 03:00:00',
          daysAgo: 3, bytes: 52428800, affected: false, outdated: false },
        { nr: 2, file: 'kriterion-2026-08-13-03-00-00.sqlite', at: '2026-08-13 03:00:00',
          daysAgo: 10, bytes: 52428800, affected: false, outdated: false }
      ],
      oldCount: 0, oldBytes: 0, oldFiles: []
    }
  };
  /* DIE KOPIEN AM ORT -- die Liste, aus der der Mock seine Vorschau WIRKLICH
     rechnet. Ein Mock, der auf jede Abfrage denselben Stand zurueckgaebe,
     machte "die Vorschau rechnet neu" von "die Vorschau blieb stehen"
     ununterscheidbar (Stolperstein 90). Die Regel selbst wird am ECHTEN
     Server geprueft; hier geht es um die Oberflaeche -- dass sie fragt, dass
     sie zeichnet, was zurueckkommt, und dass sie dabei nichts loescht.
     JUENGSTE ZUERST, wie beim echten Server: der Boden zaehlt von vorn. */
  const cleanupCopies = (backupCopies || []).slice();
  // DER QUELLTEXT STEHT OBEN UND WIRD EINMAL GELESEN -- 0.30.0, F4.
  const source = BASE_SOURCE;
  /* Die dreistellige Stimmenzahl der zweiten Kriterienzeile. Sie steht als
     Zahl an EINER Stelle: `count` in der Zeile und die Laenge der Stimmliste
     muessen uebereinstimmen, und zwei getippte Zahlen liefen auseinander. */
  const MATCH_MANY = 128;
  /* SCHNITT UND STIMMENZAHL STEHEN ALS PAAR und nicht als zwei Listen: sie
     gehoeren zusammen, und zwei getippte Listen liefen frueher oder spaeter
     auseinander. */
  const columns = voteColumns || [{ avg: 3.4, count: 5 },
    { avg: 4.1, count: MATCH_MANY }, { avg: null, count: 0 }];
  /* JEDE ZEILE TRAEGT IHRE ERSTELLUNGSSPRACHE -- 0.25.0, wie am echten Server
     (`rating_criteria.language`). Vorgabe ist `de`: die drei Namen sind
     deutsch, und die Vorgabesprache dieses Mocks ist es auch -- damit behaelt
     jede Prueflage von vor dieser Runde ihren Gegenstand.
     WER DIE LAGE „SPRACHE UNBEKANNT" BRAUCHT, gibt `criteriaLanguages` mit;
     `null` ist dort der Bestand nach der Migration, vor dem Zuordnen. */
  const criteria = [
    { id: 7, name: 'Zuerst', sort_order: 0, usage_count: 2, weight: criteriaWeights[0],
      phase: criteriaPhases[0], language: criteriaLanguages[0] },
    { id: 8, name: 'Dann', sort_order: 1, usage_count: 0, weight: criteriaWeights[1],
      phase: criteriaPhases[1], language: criteriaLanguages[1] },
    { id: 9, name: 'Zuletzt', sort_order: 2, usage_count: 1, weight: criteriaWeights[2],
      phase: criteriaPhases[2], language: criteriaLanguages[2] }
  ];
  /* Verfasser im Mock: der falsche Server muss antworten wie der
     echte, sonst verschwindet genau die Pruefung, fuer die er gebaut ist.
     BEWUSST VERSCHIEDENE Lagen -- ein lebender Name, ein Grabstein (Name
     null, nur die Nummer) und eine herrenlose Zeile. Waeren alle gleich,
     liesse sich nicht sehen, ob die Beschriftung ihre eigene Zeile trifft. */
  const vChefin = { id: 1, name: 'chefin', deleted: false };
  const vBert = { id: 2, name: 'bert', deleted: false };
  const vTomb = { id: 4, name: null, deleted: true };
  // Ein Benutzername ist Eingabe, keine Konstante. Die Linkzeile ist seit
  // 0.8.30 die zweite Stelle in der Linkliste, an der Eingabe als Beschriftung
  // gerendert wird -- die erste sind die Anbieternamen.
  const vBad = { id: 5, name: 'Verfasser <b id="boese-link">X</b>', deleted: false };
  /* DIE KOPFZAHL DES POTENZIALKASTENS -- 0.21.0. Sie ist stellbar und wird
     NICHT aus den Zeilen gerechnet: der echte Server liefert sie, und der
     Browser soll sie LESEN. Rechnete der Mock sie nach, koennte er nicht
     zeigen, dass der Browser es nicht tut (Stolperstein 102).
     Ohne ein Kriterium im Kasten „before" gibt es sie nicht -- null, wie am
     echten Eintrag. 4,2 ist die Zahl aus dem Konzeptpapier und ausdruecklich
     eine ANDERE als avgRating. */
  const potentialAverage = criteriaPhases.includes('before')
    ? (potentialValue === undefined ? 4.2 : potentialValue) : null;
  const example = {
    id: 1, title: 'Beispiel', description: 'Eine Beschreibung.\nZweite Zeile.',
    rejected: !!rejection, tested: !untested, favorite: false, category: null,
    /* Der echte Server liefert die drei Felder IMMER aus -- leer, wenn nichts
       dasteht. Ein Mock, der sie ganz weglaesst, machte "fehlt" von "leer"
       ununterscheidbar und naehme genau die Pruefung weg, fuer die er gebaut
       ist (Stolperstein 102). */
    rejected_at: rejection?.at ?? null,
    rejected_reason: rejection?.reason ?? null,
    rejectedAuthor: rejection?.author ?? null,
    /* ZWEI ANGABEN NACH HAUSMUSTER, seit 0.15.0, und sie werden GERECHNET wie
       im echten Server: `mine` aus dem Verfasser des EINTRAGS, `rejectedMine`
       aus dem der BEGRUENDUNG -- beide gegen die Nummer der Fragenden. Ein
       Mock, der sie fest auf true legte, naehme genau die Pruefungen weg, fuer
       die er gebraucht wird (Stolperstein 102).
       DIE OBERFLAECHE KANN SIE NICHT ZURUECKRECHNEN: sie kennt ihren NAMEN
       (`NAME`) und nirgends ihre Nummer -- deshalb ist die Rechnung hier
       ehrlich und kein zweiter Weg zum selben Ergebnis. */
    mine: entryMine,
    rejectedMine: !!(rejection?.author && rejection.author.id === users.ich),
    author: entryMine ? vChefin : vBert,
    /* ZWEI ZEILEN, UND SIE SIND VERSCHIEDENER ART -- ein Mock mit
       lauter Bildern naehme genau die Pruefungen weg, fuer die er hier
       gebraucht wird (Stolperstein 90). Das Video steht ausdruecklich NICHT an
       erster Stelle: nur so lassen sich Hauptbild und Abspielzeichen
       unabhaengig voneinander belegen. kind und duration stehen an BEIDEN Zeilen,
       so wie der echte Server sie liefert -- am Foto 'image' und null. */
    photos: [{ id: 5, mime_type: 'image/png', focus_x: 50, focus_y: 50, sort_order: 0,
               kind: 'image', duration: null },
             { id: 6, mime_type: 'video/mp4', focus_x: 50, focus_y: 50, sort_order: 1,
               kind: 'video', duration: 42 }],
    /* Sieben Adressen und eine Suchzeile -- an der letzten haengt die Pruefung
       der Kennzeichnung. Die Gesamtzahl bleibt acht, damit die Begrenzung der
       sichtbaren Zeilen weiter an derselben Schwelle geprueft wird.
       FUENF VERFASSERLAGEN, und sie sind der Gegenstand seit 0.8.30: vier
       Zeilen vom Verfasser des Eintrags selbst (bert -- dort steht kein Name),
       eine mit spitzen Klammern im Namen, eine von der Fragenden (chefin, also
       mine), eine herrenlose und die Suchzeile von einem Grabstein. Waeren
       alle gleich, liesse sich nicht sehen, ob die Beschriftung ihre eigene
       Zeile trifft.
       created_at steht an jeder Zeile: der echte Server liefert es, und der
       Ueberfahrtext haengt daran. */
    links: [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: 80 + i, url: `https://beispiel.de/${i}`, sort_order: i,
        created_at: '2026-08-01 10:00:00', mine: false, author: vBert })),
      { id: 84, url: 'https://beispiel.de/4', sort_order: 4,
        created_at: '2026-08-01 10:30:00', mine: false, author: vBad },
      { id: 85, url: 'https://beispiel.de/5', sort_order: 5,
        created_at: '2026-08-02 11:30:00', mine: true, author: vChefin },
      { id: 86, url: 'https://beispiel.de/6', sort_order: 6,
        created_at: '2026-08-03 12:00:00', mine: false, author: null },
      { id: 87, url: 'Handbuch 3000', sort_order: 7,
        created_at: '2026-08-04 13:00:00', mine: false, author: vTomb }
    ],
    comments: commentInventory || [
      /* mine und bilderEntfernt an JEDEM Kommentar: der echte Server liefert
         beides seit 0.8.3, und ein Mock, der die Antwort
         vereinfacht, loescht genau die Pruefung, fuer die er gebaut ist.
         `ich` ist Zugang 1 (chefin) -- die drei Zeilen von chefin sind
         meine, die von bert, vom Grabstein und die herrenlose sind es nicht.
         Der Bericht traegt zwei Bilder UND einen Vermerk: nur dort laesst
         sich sehen, ob die Angabe ihre eigene Zeile trifft. */
      { id: 61, text: 'Angepinnte Notiz', kind: 'note', pinned: true, author: vChefin,
        mine: true, imagesRemoved: 0,
        created_at: '2026-08-03 09:00:00', updated_at: null, images: [] },
      { id: 62, text: 'Ein Bericht', kind: 'report', pinned: false, author: vBert,
        mine: false, imagesRemoved: 1,
        created_at: '2026-08-02 09:00:00', updated_at: null,
        images: [{ id: 71, filename: 'a.jpg', sort_order: 0 },
                 { id: 72, filename: 'b.jpg', sort_order: 1 }] },
      // Der Grabstein: die Antwort nennt nur die Nummer, die Beschriftung
      // entsteht in app.js. Und die herrenlose Zeile daneben -- zwei
      // verschiedene Aussagen, die nicht dieselbe Beschriftung bekommen duerfen.
      { id: 63, text: 'Gewöhnliche Notiz', kind: 'note', pinned: false, author: vTomb,
        mine: false, imagesRemoved: 2,
        created_at: '2026-08-01 09:00:00', updated_at: '2026-08-01 10:00:00', images: [] },
      // Der vierte traegt alles, was am Kommentartext haengt: Markup, das
      // niemals Markup werden darf; eine Adresse mit & in der Abfragezeile
      // (zerlegt wird der Rohtext, nicht der maskierte); ein nachlaufendes
      // Komma und ein nachlaufender Punkt; www. ohne Schema; ein blankes
      // beispiel.de, das ausdruecklich kein Link wird; und ein javascript:,
      // das Schranke 1 gar nicht erst passieren darf.
      { id: 64, text: 'Siehe <b>hier</b>: https://beispiel.de/pfad?a=1&b=2, dazu www.beispiel.de. '
          + 'Nicht beispiel.de und nicht javascript:alert(1)',
        kind: 'note', pinned: false, author: null, mine: false, imagesRemoved: 0,
        created_at: '2026-07-31 09:00:00', updated_at: null, images: [] },
      { id: 65, text: 'Eine Aufgabe', kind: 'task', pinned: false, author: vChefin,
        mine: true, imagesRemoved: 0,
        created_at: '2026-07-30 09:00:00', updated_at: null, images: [] },
      { id: 66, text: 'Schon erledigt', kind: 'done', pinned: false, author: vChefin,
        mine: true, imagesRemoved: 0,
        created_at: '2026-07-29 09:00:00', updated_at: null, images: [] }
    ],
    attachments: [
      /* Vier Verfasserlagen wie an der Linkzeile: zwei vom Verfasser des
         Eintrags (dort steht kein Name), eine von der Fragenden (mine) und
         eine herrenlose. created_at traegt den Ueberfahrtext. */
      { id: 41, filename: 'notiz.txt', mime_type: 'text/plain', size: 120, sort_order: 0, preview: 'text',
        created_at: '2026-08-01 10:00:00', mine: false, author: vBert },
      { id: 42, filename: 'foto.png', mime_type: 'image/png', size: 2048, sort_order: 1, preview: 'image',
        created_at: '2026-08-01 11:00:00', mine: false, author: vBert },
      { id: 43, filename: 'doku.pdf', mime_type: 'application/pdf', size: 900000, sort_order: 2, preview: 'pdf',
        created_at: '2026-08-02 12:00:00', mine: true, author: vChefin },
      { id: 44, filename: 'archiv.zip', mime_type: 'application/zip', size: 5242880, sort_order: 3, preview: 'keine',
        created_at: '2026-08-03 13:00:00', mine: false, author: null }
    ],
    tags: tags.filter(t => t.assigned),
    // mine: der echte Server sagt zu jedem Testtag, ob er dem
    // Abrufenden gehoert. Der Mock muss das mitliefern -- sonst
    // zeichnete die Zeitleiste hier alles gefuellt und die Unterscheidung
    // waere unpruefbar.
    testDays: dayInventory || [{ id: 3, day: '2026-08-01', rating: 4, mine: true, author: vChefin,
                 tags: [{ id: 91, name: 'Regen' }] }],
    // avg und count stehen an jeder Zeile. Bewusst VERSCHIEDENE
    // Werte je Kriterium: gleiche machten die Pruefung blind dafuer, ob die
    // Spalte ihre eigene Zeile trifft. Das dritte Kriterium hat niemand
    // bewertet -- dort bleibt die Spalte leer.
    // WER WELCHEN WERT VERGEBEN HAT, STEHT HIER SEIT 0.8.6 NICHT MEHR: der
    // echte Server liefert es an dieser Antwort nicht mehr aus, und ein
    // Mock, der es doch taete, machte die Pruefung darauf wertlos.
    // weight steht an JEDER Kriterienzeile -- der echte Server liefert es seit
    // 0.8.40, und ein Mock, der die Antwort vereinfacht, loescht
    // genau die Pruefung, fuer die er gebaut ist.
    /* DREI ZEILEN, UND SIE SIND VERSCHIEDEN LANG -- das ist seit 0.14.0 keine
       Zierde mehr, sondern der Gegenstand: die Sternreihen sollen an
       derselben Stelle beginnen, und eine Prueflage, in der alle Zahlen gleich
       lang sind, kann diesen Fehler gar nicht tragen (Stolperstein 189).
       Deshalb steht hier eine DREISTELLIGE Stimmenzahl neben einer
       einstelligen -- und die dritte Zeile hat gar keine. */
    ratings: criteria.map((c, i) => ({
      criterion_id: c.id, name: c.name, value: ownValues[i], weight: c.weight,
      // DIE PHASE REIST AN DER ZEILE MIT, wie beim echten Server -- der
      // Browser teilt `ratings` danach in seine beiden Kaesten.
      phase: c.phase,
      avg: columns[i].avg, count: columns[i].count })),
    avgRating: withoutRating ? null : 3, testCount: 1, testAvg: 4, testLast: 4,
    /* ---- DER RECHENWEG -- 0.16.0 ------------------------------------------
       WIE DER ECHTE SERVER: er entsteht dort IN gesamtSchnitt(), also in
       derselben Schleife wie avgRating -- nur die bewerteten Kriterien, das
       dritte hat kein avg und faellt heraus. Hier wird er aus denselben
       Zahlen gebildet, damit der Mock nicht behauptet, was er nicht rechnet.
       DAS ERGEBNIS IST AUSDRUECKLICH EIN ANDERES ALS DER ROHE QUOTIENT, und
       das ist kein Versehen: die Oberflaeche soll die Zahl LESEN und nicht
       nachrechnen. Rechnete sie nach, stuende im Kasten der Quotient und
       nicht `ergebnis` -- und genau daran faellt es auf (Stolperstein 102). */
    calc: (() => {
      const rows = criteria
        .map((c, i) => ({ criterionId: c.id, average: columns[i].avg, weight: c.weight,
                          phase: c.phase }))
        // NUR DER KASTEN „after" -- wie im echten Server, wo die Menge nach
        // Phase geschnitten ist, BEVOR gesamtSchnitt() sie sieht. Ein Mock,
        // der beide Kaesten in einen Weg legte, behauptete genau das, was
        // diese Runde baulich ausschliesst (Stolperstein 102).
        .filter(z => z.phase === 'after')
        .filter(z => z.average != null)
        .map(z => ({ ...z, product: z.average * z.weight }));
      const sum = rows.reduce((n, z) => n + z.product, 0);
      const divisor = rows.reduce((n, z) => n + z.weight, 0);
      /* OHNE JEDE BEWERTUNG GIBT ES KEINE ZAHL UND KEINEN RECHENWEG -- der
         echte Server liefert dann avgRating null und einen Weg ohne Zeilen.
         Die Lage ist stellbar, weil ohne sie „ohne Zahl kein Knopf" gar nicht
         zu belegen waere (Stolperstein 81). */
      /* ---- DIE VERGLEICHSZAHL OHNE GEWICHTE -- 0.17.0 ----
         WIE DER ECHTE SERVER: sie entsteht dort IN derselben Schleife, aus
         DERSELBEN Menge, und ihr Teiler ist die ZAHL der bewerteten Kriterien.
         AUCH SIE IST AUSDRUECKLICH NICHT DER QUOTIENT IHRER EIGENEN ZAHLEN,
         und zwar aus demselben Grund wie `ergebnis` darueber: die Oberflaeche
         soll sie LESEN und nicht nachrechnen. (3,4 + 4,1) ÷ 2 waere 3,75 und
         gerundet 3,8 -- hier steht 4. Rechnete der Kasten nach, stuende 3,8
         darin, und genau daran faellt es auf (Stolperstein 102).
         UND SIE IST EINE ANDERE ZAHL ALS `ergebnis`: eine Prueflage, in der
         beide gleich sind, koennte den Unterschied gar nicht zeigen
         (Stolperstein 189 und 224). Der gleiche Fall wird ueber
         `calculationEqual` gestellt. */
      const equalSum = rows.reduce((n, z) => n + z.average, 0);
      const equal = calculationEqual === undefined ? 4 : calculationEqual;
      if (withoutRating) return { rows: [], sum: 0, divisor: 0, raw: null, result: null,
        equalSum: 0, equalDivisor: 0, equalRaw: null, equalResult: null };
      return { rows, sum, divisor, raw: divisor ? sum / divisor : null, result: 3,
        equalSum, equalDivisor: rows.length,
        equalRaw: rows.length ? equalSum / rows.length : null,
        equalResult: equal };
    })(),
    /* ---- DIE ZWEITE KOPFZAHL UND IHR RECHENWEG -- 0.21.0 -------------------
       WIE DER ECHTE SERVER, und das heisst hier vor allem: aus der ANDEREN
       Menge, durch DIESELBE Rechnung. Solange kein Kriterium im Kasten
       „before" steht -- die Vorgabe des Mocks --, gibt es keine Zahl und
       keinen Weg, genau wie an einem Eintrag ohne Vorher-Kriterien.
       DIE ZAHL IST EINE ANDERE ALS avgRating (3): eine Prueflage, in der beide
       gleich sind, koennte eine Vermischung gar nicht zeigen
       (Stolperstein 189). */
    potentialRating: potentialAverage,
    potentialCalc: (() => {
      const rows = criteria
        .map((c, i) => ({ criterionId: c.id, average: columns[i].avg, weight: c.weight,
                          phase: c.phase }))
        .filter(z => z.phase === 'before')
        .filter(z => z.average != null)
        .map(z => ({ ...z, product: z.average * z.weight }));
      const sum = rows.reduce((n, z) => n + z.product, 0);
      const divisor = rows.reduce((n, z) => n + z.weight, 0);
      const equalSum = rows.reduce((n, z) => n + z.average, 0);
      return { rows, sum, divisor, raw: divisor ? sum / divisor : null,
        result: potentialAverage,
        equalSum, equalDivisor: rows.length,
        equalRaw: rows.length ? equalSum / rows.length : null,
        equalResult: rows.length ? potentialAverage : null };
    })(),
    // Reine Anzeige, seit 0.8.6 in der Verfasserzeile. Ohne dieses Feld
    // zeichnete die Zeile ins Leere und jede Pruefung darauf waere blind.
    created_at: '2026-07-20 14:30:00'
  };
  /* Die Antwort des neuen Endpunkts GET /api/items/:id/votes -- wer welchen
     Wert vergeben hat, je Kriterium. Die Zahl der Stimmen stimmt mit count in
     den Zeilen darueber ueberein; ein Mock, der sich hier
     widerspricht, macht jede Pruefung darauf wertlos.
     Die erste Zeile traegt alle vier Lagen nebeneinander: die eigene Stimme
     (kein Loeschkreuz), zwei fremde lebende, einen Grabstein und eine
     herrenlose. Das dritte Kriterium kommt GAR NICHT VOR -- der echte Server
     nimmt nur Kriterien mit Stimmen auf. */
  const matchResponse = [
    { criterion_id: 7, votes: [
      { id: 501, value: 3, mine: true, author: vChefin },
      { id: 502, value: 4, mine: false, author: vBert },
      { id: 503, value: 2, mine: false, author: vTomb },
      { id: 504, value: 4, mine: false, author: null },
      { id: 505, value: 4, mine: false, author: { id: 3, name: 'carla', deleted: false } }] },
    /* DIE ZWEITE ZEILE TRAEGT ABSICHTLICH EINE DREISTELLIGE STIMMENZAHL.
       Die Zusage seit 0.14.0 lautet, dass alle Sternreihen der Kriterienliste
       an derselben Stelle beginnen -- und sie gilt fuer die leere Zelle
       ebenso wie fuer eine ueberlange Zahl. Eine Prueflage, in der alle Zahlen
       gleich lang sind, kann diesen Fehler gar nicht tragen (Stolperstein
       189).
       DIE LISTE WIRD WIRKLICH SO LANG, statt nur `count` hochzusetzen: ein
       Mock, der sich hier widerspricht, macht jede Pruefung darauf wertlos
       (Stolperstein 90). Die zwei benannten Stimmen stehen vorn, der Rest
       zaehlt auf. */
    { criterion_id: 8, votes: [
      { id: 506, value: 3, mine: true, author: vChefin },
      { id: 507, value: 5, mine: false, author: vBert },
      ...Array.from({ length: MATCH_MANY - 2 }, (unused, i) => ({
        id: 600 + i, value: 4, mine: false,
        author: { id: 100 + i, name: `stimme${i}`, deleted: false } }))] }
  ];
  const overview = [{
    id: 1, title: 'Beispiel', rejected: false, tested: true, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: 3, testCount: 2, testAvg: 4, testLast: 4,
    updated_at: '2026-08-01 10:00:00'
  }];
  /* Der Bestand fuer die Ansicht "Offen". EIGENE Zeilen neben beispiel.comments,
     und zwar aus ZWEI Eintraegen -- an einem einzigen liesse sich die
     Gruppierung gar nicht sehen.
     VIER ARTEN NEBENEINANDER (Stolperstein 90): zwei offene Aufgaben, eine
     erledigte, eine Notiz und ein Bericht. Eine Prueflage mit lauter offenen
     Aufgaben naehme genau die Pruefung weg, fuer die sie gebaut wird -- dass
     die Ansicht die drei anderen NICHT zeigt.
     DREI VERFASSERLAGEN: die Fragende selbst (mine), ein Fremder und ein
     Grabstein. Ohne sie liesse sich nicht sehen, ob der Haken seiner eigenen
     Zeile folgt.
     `kind` steht an jeder Zeile, obwohl der echte Endpunkt es nicht
     ausliefert: der Mock braucht es, um beim Schreiben WIRKLICH eine
     andere Antwort zu geben. Gaebe er stur dieselbe Liste zurueck, waere "die
     Ansicht hat den Haken gesetzt" von "nichts ist passiert" nicht zu
     unterscheiden. */
  const open = openInventory || [
    { id: 65, kind: 'task', text: 'Eine Aufgabe', created_at: '2026-07-30 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: true, author: vChefin },
    { id: 66, kind: 'done', text: 'Schon erledigt', created_at: '2026-07-29 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: true, author: vChefin },
    { id: 61, kind: 'note', text: 'Angepinnte Notiz', created_at: '2026-08-03 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: true, author: vChefin },
    { id: 62, kind: 'report', text: 'Ein Bericht', created_at: '2026-08-02 09:00:00',
      item: { id: 1, title: 'Beispiel' }, mine: false, author: vBert },
    { id: 67, kind: 'task', text: 'Fremde Aufgabe', created_at: '2026-07-28 09:00:00',
      item: { id: 2, title: 'Zweites' }, mine: false, author: vBert },
    { id: 68, kind: 'task', text: 'Herrenlose Aufgabe', created_at: '2026-07-27 09:00:00',
      item: { id: 2, title: 'Zweites' }, mine: false, author: vTomb }
  ];
  const sent = [];
  // Zaehler fuer searchThrottles -- welche Suchanfrage gerade hinausgeht.
  let searchThrottle = 0;

  /* jsdom kennt <video> als Element, aber nicht seine Methoden: pause() und
     load() melden sich als jsdomError. Das ist Laerm, kein Befund -- die
     Oberflaeche RUFT sie richtig, und genau das prueft die Gruppe "Videos am
     Bildschirm" an hidden und src. Gefiltert wird deshalb genau diese eine
     Message; alles andere geht unveraendert durch, damit kein echter Fehler
     hier verschwindet. */
  const silenceConsole = new VirtualConsole();
  silenceConsole.forwardTo(console, { jsdomErrors: 'none' });
  silenceConsole.on('jsdomError', (e) => {
    if (!/Not implemented: HTMLMediaElement/.test(e?.message || ''))
      console.error(e?.type === 'unhandled-exception' ? e.cause?.stack : e?.message);
  });
  const dom = new JSDOM(
    `<!DOCTYPE html><html lang="de"><body><div id="app"></div>` +
    `<p class="version-row" id="version"></p></body></html>`,
    { runScripts: 'dangerously', url: `${BASE}/${hash}`, virtualConsole: silenceConsole });
  const w = dom.window;
  w.fetch = async (url, opt = {}) => {
    /* DER KOPF WIRD MITGESCHRIEBEN -- 0.24.5. `api()` setzt `Accept-Language`
       an JEDER Anfrage (0.24.3), und seit 0.24.3 durfte eine Anfrage darueber
       ausdruecklich eine ANDERE Sprache verlangen als die des Lesers. Genau
       daran hing der Befund dieser Runde: die Karte fragte, der Server hoerte
       nicht. Ohne den Kopf im Protokoll liesse sich weder belegen, dass er
       nicht mehr als Frage nach einer fremden Namenstafel benutzt wird, noch,
       dass er weiterhin an jeder Anfrage steht. */
    const askedLanguage = Object.entries((opt && opt.headers) || {})
      .find(([h]) => h.toLowerCase() === 'accept-language');
    sent.push({ method: opt.method || 'GET', url, body: opt.body ? JSON.parse(opt.body) : null,
                language: askedLanguage ? askedLanguage[1] : null });
    const give = (o, status = 200) => ({ ok: status < 400, status, json: async () => o });
    /* DIE SPRACHDATEI KOMMT AUS DER ECHTEN DATEI -- 0.24.0, Bauabschnitt 1.
       Kein Mock: die 312 Zusicherungen mit deutschem Text bleiben damit
       gueltig, wie sie sind, und laufen weiter auf Deutsch. Ein nachgebauter
       Satz waere eine zweite Wahrheit -- und die Pruefung liefe gruen, waehrend
       die ausgelieferte Datei etwas anderes sagt (Stolperstein 47). */
    /* DASSELBE MUSTER WIE readLanguages() IM SERVER -- BCP 47 und nicht „zwei
       Kleinbuchstaben". Ein engeres Muster hier liesse eine Datei `pt-BR.json`
       im Mock ins Leere laufen, waehrend der Server sie laedt. */
    const languageFile = /^\/languages\/([a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|[0-9]{3}))?)\.json$/
      .exec(String(url));
    if (languageFile) {
      // `withoutLanguage`: die Lage, in der die Datei fehlt (Entscheidung A1).
      if (withoutLanguage) return give({}, 404);
      const file = path.join(__dirname, 'public', 'languages', `${languageFile[1]}.json`);
      if (!fs.existsSync(file)) return give({}, 404);
      return give(JSON.parse(fs.readFileSync(file, 'utf8')));
    }
    /* DIE ZWEI SPRACHFELDER SEIT 0.24.3. DIE VORGABE IST `de` UND NICHT `en`:
       dieser Mock stellt eine Installation dar, deren Eigentuemer Deutsch
       vorgibt -- also genau die Lage des BESTANDS nach der Migration (F2). Die
       312 Zusicherungen mit deutschem Text bleiben damit gueltig, wie sie sind.
       DER VORRAT KOMMT AUS DEM ECHTEN VERZEICHNIS und ist keine Liste hier:
       wer eine Sprachdatei dazulegt, soll sie im Mock vorfinden, ohne diese
       Zeile zu suchen -- dieselbe Ueberlegung wie bei der Datei selbst
       darueber. */
    if (url === '/api/config') return give({ title: 'Oeffentlich', version: require('./package.json').version,
      setupRequired: setup, minPassword: 10, signup,
      language: 'de',
      languages: fs.readdirSync(path.join(__dirname, 'public', 'languages'))
        .filter(f => f.endsWith('.json')).sort()
        .map(f => ({ code: f.slice(0, -5), name: f.slice(0, -5) })) });
    if (url === '/api/session') return give({ authenticated: loggedIn });
    /* Der Weg VOR der Anmeldung. Zwei gueltige Schluessel, damit sich beide
       Anlaesse unterscheiden lassen -- einer zu einem Zugang OHNE Passwort
       (die Einladung) und einer zu einem MIT (die Ruecksetzung). Alles andere
       bekommt die eine Absage, wortgleich wie am echten Server. */
    const TOKEN_DENIAL_MOCK = 'Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern.';
    const tokenState = { ['d'.repeat(64)]: { username: 'carla', withoutPassword: true },
                        ['f'.repeat(64)]: { username: 'dora', withoutPassword: false } };
    if (url === '/api/token/check' && opt.method === 'POST') {
      /* DIE ANMELDEBREMSE ALS EIGENE LAGE, seit 0.9.0. Sie ist der Grund fuer
         Befund G: eine 429 ist eine VORUEBERGEHENDE Absage, und bis 0.8.91
         warf die Oberflaeche daraufhin den Schluessel aus der Adresse. Ein
         Mock, der nur 200 und 400 kennt, koennte den Unterschied gar nicht
         zeigen -- die Prueflage waere blind fuer genau den Fehler
         (Stolperstein 90).
         ER ZIEHT MIT: beim ZWEITEN Versuch traegt derselbe Schluessel. Ohne
         das waere "noch einmal versuchen fuehrt wirklich weiter" nicht von
         "der Knopf tut nichts" zu unterscheiden. */
      if (tokenThrottle > 0) {
        tokenThrottle--;
        return give({ error: 'Zu viele Fehlversuche. Bitte in 300 Sekunden erneut versuchen.' }, 429);
      }
      const t = tokenState[JSON.parse(opt.body || '{}').token];
      // minuten: die Frist ab dem ersten Oeffnen, seit 0.9.0. Die Seite liest
      // sie aus der Antwort (Stolperstein 102).
      return t ? give({ ...t, minPassword: 10, minutes: 15 }) : give({ error: TOKEN_DENIAL_MOCK }, 400);
    }
    if (url === '/api/token/redeem' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      const t = tokenState[k.token];
      if (!t) return give({ error: TOKEN_DENIAL_MOCK }, 400);
      if (String(k.password || '').length < 10)
        return give({ error: 'Das Passwort muss mindestens 10 Zeichen lang sein.' }, 400);
      return give({ ok: true, username: t.username });
    }
    /* Die eigene Adresse steht seit 0.9.0 in dieser Antwort, und der Mock
       liefert sie mit -- sonst bliebe das Feld in der Karte "Zugang" leer und
       jede Pruefung darauf blind (Stolperstein 102). Eine Prueflage kann sie
       ueber ownAddress leeren; ohne beide Zustaende liesse sich weder
       "die vorhandene steht im Feld" noch "die fehlende zeigt den Platzhalter"
       belegen. */
    /* DER ZWEITE FAKTOR REIST SEIT 0.10.0 IN DIESER ANTWORT MIT, und der Mock
       liefert ihn -- sonst bliebe der Block in der Karte "Zugang" leer und
       jede Pruefung darauf blind (Stolperstein 102). Die Prueflage stellt
       ueber twoFactorState den anderen Zustand; ohne beide liesse sich weder
       "an seit ..." noch "aus" belegen.
       DER MOCK BRINGT NICHT SELBST MIT, WAS DIE PRUEFUNG BELEGEN SOLL: was
       hier steht, kommt aus der Prueflage und nicht aus der Oberflaeche --
       und die Zusagen an der ECHTEN Serverantwort stehen in den Gruppen
       "Der zweite Faktor: ..." weiter oben. */
    if (url === '/api/account' && (opt.method || 'GET') === 'GET')
      return give({ username: 'chefin', minPassword: 10, email: ownAddress,
                   twoFactor: zfStatusMock });
    /* PUT auf den eigenen Zugang. DER MOCK ZIEHT WIRKLICH MIT (Stolperstein
       90): was die Karte schickt, ist danach der Stand -- sonst waere "die
       geaenderte Adresse steht danach im Feld" von "die Karte hat sich nicht
       bewegt" nicht zu unterscheiden. */
    if (url === '/api/account' && opt.method === 'PUT') {
      const k = JSON.parse(opt.body || '{}');
      if (k.email !== undefined) ownAddress = String(k.email || '');
      return give({ username: k.username || 'chefin',
                   passwordChanged: Boolean(k.newPassword), email: ownAddress });
    }
    /* DIE ANMELDUNG IN ZWEI SCHRITTEN, 0.10.0. DER MOCK ANTWORTET WIE DER
       ECHTE SERVER (Stolperstein 90): bei richtigem Passwort und
       eingeschaltetem Faktor KEIN ok und kein Cookie, sondern ein Ausweis --
       und bei falschem Code eine Absage MIT frischem Ausweis, genau wie der
       Server sie schickt. Einer, der immer ok saegte, machte den ganzen
       zweiten Schritt unpruefbar. */
    if (url === '/api/login' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== 'chefins-wort-100')
        return give({ error: 'Benutzername oder Passwort stimmt nicht.' }, 401);
      if (!loginFactor) return give({ ok: true });
      return give({ twoFactor: true, ticket: zfTicketMock, seconds: 120 });
    }
    if (url === '/api/login/second' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.ticket !== zfTicketMock)
        return give({ error: 'Die Anmeldung ist abgelaufen. Bitte noch einmal von vorn.' }, 401);
      const input = String(k.code || '');
      if (input !== ZF_MOCK_CODE && !zfCodesMock.includes(input)) {
        // DER ALTE AUSWEIS IST VERBRAUCHT, ein frischer liegt der Absage bei --
        // sonst kostete ein Tippfehler das ganze Passwort noch einmal.
        zfTicketMock = 'ausweis-' + (++zfTicketCounter);
        return give({ error: 'Der Code stimmt nicht.', ticket: zfTicketMock, seconds: 120 }, 401);
      }
      zfTicketMock = 'ausweis-' + (++zfTicketCounter);
      return give({ ok: true });
    }
    /* ---- Der zweite Faktor, 0.10.0 ----
       DER MOCK ZIEHT WIRKLICH MIT (Stolperstein 90): einschalten macht "an",
       ausschalten macht "aus", und die Zahl der Wiederherstellungscodes
       aendert sich. Ein Mock, der auf jedes Einschalten "ok" sagt und
       denselben Stand zurueckgibt, machte "die Karte zeichnet sich neu" von
       "die Karte blieb stehen" ununterscheidbar.
       UND ER KANN SCHEITERN: ein falscher Code wird abgewiesen, sonst waere
       der ganze Absagenzweig nie gelaufen. */
    if (url === '/api/two-factor/start' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== 'chefins-wort-100') return give({ error: 'Das Passwort stimmt nicht.' }, 403);
      if (zfStatusMock.an) return give({ error: 'Der zweite Faktor ist bereits eingeschaltet.' }, 400);
      return give({ secret: ZF_MOCK_SECRET, groups: ZF_MOCK_GROUPS,
                   row: ZF_MOCK_ROW, digits: 6, seconds: 30 });
    }
    if (url === '/api/two-factor/on' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== 'chefins-wort-100') return give({ error: 'Das Passwort stimmt nicht.' }, 403);
      if (String(k.code) !== ZF_MOCK_CODE) return give({ error: 'Der Code stimmt nicht.' }, 400);
      zfStatusMock = { an: true, since: '2026-08-26 10:00:00', codesOpen: 8, codesTotal: 8 };
      return give({ ...zfStatusMock, codes: zfCodesMock });
    }
    if (url === '/api/two-factor/codes' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== 'chefins-wort-100') return give({ error: 'Das Passwort stimmt nicht.' }, 403);
      if (String(k.code) !== ZF_MOCK_CODE) return give({ error: 'Der Code stimmt nicht.' }, 403);
      zfCodesMock = zfCodesMock.map((c, i) => `NEU${String(i)}A-BCDEF`);
      zfStatusMock = { ...zfStatusMock, codesOpen: 8, codesTotal: 8 };
      return give({ ...zfStatusMock, codes: zfCodesMock });
    }
    if (url === '/api/two-factor' && opt.method === 'DELETE') {
      const k = JSON.parse(opt.body || '{}');
      if (!zfStatusMock.an) return give({ error: 'Der zweite Faktor ist nicht eingeschaltet.' }, 400);
      if (k.password !== 'chefins-wort-100') return give({ error: 'Das Passwort stimmt nicht.' }, 403);
      if (String(k.code) !== ZF_MOCK_CODE) return give({ error: 'Der Code stimmt nicht.' }, 403);
      zfStatusMock = { an: false, since: null, codesOpen: 0, codesTotal: 0 };
      return give({ ...zfStatusMock });
    }
    /* ---- Der Mailversand, 0.9.0 ----
       DER MOCK ANTWORTET WIE DER ECHTE SERVER, und das heisst hier vor allem:
       er kann FEHLSCHLAGEN. Einer, der auf die Testmail immer ok sagt, machte
       die Haelfte der Karte unpruefbar -- der Fehlschlagszweig waere nie
       gelaufen (Stolperstein 90). Ueber mailError stellt eine Prueflage den
       anderen Zustand.
       UND ER ZIEHT MIT: nach einem erfolgreichen Test steht testedAt da,
       nach dem Speichern faellt es weg -- genau wie beim echten Server, wo die
       Marke an den Werten haengt. */
    if (url === '/api/mail' && (opt.method || 'GET') === 'GET') {
      if (settings.isOwner === false) return give({ error: MAIL_DENIED }, 403);
      return give(mailCardMock());
    }
    /* ---- Die Selbstanmeldung, 0.9.1 ----
       ER ANTWORTET WIE DER ECHTE SERVER (Stolperstein 90), und das heisst
       hier vor allem: ER ZIEHT MIT. Freischalten und Ablehnen nehmen die Zeile
       wirklich aus der Liste und geben die NEUE zurueck -- ein Mock, der
       dieselbe Liste weiterliefert, machte "die Karte zeichnet sich neu" von
       "die Karte blieb stehen" ununterscheidbar.
       UND ER BRINGT NICHTS SELBST MIT, was die Pruefung belegen soll
       (Stolperstein 102): der Schalterzustand und die Zeilen kommen aus dem,
       was die Prueflage stellt, und die Karte liest sie aus der Antwort. */
    /* Die beiden Routen VOR der Anmeldung. DIE ANTWORT AUF EINE ANFRAGE SIEHT
       IMMER GLEICH AUS -- der Mock gibt deshalb IMMER dieselbe, gleichgueltig
       was hereinkommt, genau wie der echte Server. Einer, der bei bekanntem
       Namen etwas anderes saegte, machte die Oberflaechenpruefung blind fuer
       genau den Fehler, um den es geht (Stolperstein 90).
       DIE MELDUNG KOMMT VOM SERVER: die Oberflaeche zeigt, was sie bekommt,
       und erfindet nichts daneben (Stolperstein 102). */
    if (url === '/api/signup' && opt.method === 'POST') {
      return give({ ok: true, message:
        'Danke. Konnte zu diesen Angaben eine Anfrage entstehen, liegt jetzt eine E-Mail in ' +
        'deinem Postfach — bestätige darin, dass die Adresse dir gehört. Danach entscheidet ' +
        'ein Admin, ob ein Zugang angelegt wird.' });
    }
    if (url === '/api/signup/confirm' && opt.method === 'POST') {
      // Ein gueltiger Schluessel und die EINE Absage fuer alles andere --
      // wortgleich wie am echten Server.
      const k = JSON.parse(opt.body || '{}').key;
      if (k === 'd'.repeat(64)) return give({ ok: true });
      return give({ error:
        'Dieser Bestätigungslink gilt nicht mehr. Stell die Anfrage bitte noch einmal.' }, 400);
    }
    if (url === '/api/requests' && (opt.method || 'GET') === 'GET') {
      if (settings.isAdmin === false) return give({ error: 'Das darf nur ein Admin.' }, 403);
      return give(requestsMock());
    }
    if (url === '/api/signup/toggle' && opt.method === 'PUT') {
      if (settings.isAdmin === false) return give({ error: 'Das darf nur ein Admin.' }, 403);
      const an = JSON.parse(opt.body || '{}').an === true;
      if (an && !requestsStatus.deliveryReady)
        return give({ error: 'Die Selbstanmeldung lässt sich ohne funktionierenden Versand nicht ' +
          'einschalten. ' + requestsStatus.deliveryReason }, 400);
      requestsStatus.an = an;
      return give(requestsMock());
    }
    if (/^\/api\/requests\/\d+\/approve$/.test(url) && opt.method === 'POST') {
      const nr = Number(url.split('/')[3]);
      const row = requestsStatus.requests.find(a => a.id === nr);
      if (!row) return give({ error: 'Diese Anfrage gibt es nicht.' }, 404);
      requestsStatus.requests = requestsStatus.requests.filter(a => a.id !== nr);
      // Die Rolle steht fest auf 'user' -- wie am echten Server, wo sie im
      // Aufruf verdrahtet ist und aus keiner Anfrage gelesen wird.
      return give({ id: 90 + nr, username: row.username, email: row.email, role: 'user',
        withoutPassword: true, token: 'e'.repeat(64), purpose: 'invite', days: 7, minutes: 15,
        link: `https://kriterion.beispiel.de/#/invite/${'e'.repeat(64)}`,
        linkSource: 'einstellung', delivery: 'ok', deliveryReason: '', ...requestsMock() });
    }
    if (/^\/api\/requests\/\d+$/.test(url) && opt.method === 'DELETE') {
      const nr = Number(url.split('/')[3]);
      if (!requestsStatus.requests.some(a => a.id === nr))
        return give({ error: 'Diese Anfrage gibt es nicht.' }, 404);
      requestsStatus.requests = requestsStatus.requests.filter(a => a.id !== nr);
      return give({ ok: true, ...requestsMock() });
    }
    if (url === '/api/mail' && opt.method === 'PUT') {
      if (settings.isOwner === false) return give({ error: MAIL_DENIED }, 403);
      const k = JSON.parse(opt.body || '{}');
      mailStatus.provider = String(k.provider || '');
      if (mailStatus.provider === 'eigen') {
        mailStatus.server = String(k.server || ''); mailStatus.port = Number(k.port) || 0;
        mailStatus.secure = k.secure === true;
      }
      mailStatus.user = String(k.user || '');
      mailStatus.sender = String(k.sender || '');
      if (k.password) mailStatus.passwordSet = true;
      if (!mailStatus.provider) mailStatus.passwordSet = false;
      /* DIE MARKE FAELLT, WEIL DER ZUGANG SICH GEAENDERT HAT -- so wie beim
         echten Server, der sie ueber den Hash ueber den Zugang verwirft und
         nicht ueber ein ausdrueckliches Loeschen. Ein Mock, der sie stehen liesse,
         zeigte einen Zustand, den es nicht gibt (Stolperstein 90). */
      mailStatus.testedAt = null;
      return give(mailCardMock());
    }
    if (url === '/api/mail/test' && opt.method === 'POST') {
      if (settings.isOwner === false) return give({ error: MAIL_DENIED }, 403);
      if (!ownAddress)
        return give({ error: 'Für deinen Zugang ist keine E-Mail-Adresse hinterlegt. ' +
          'Trag sie im Systembereich unter „Zugang“ ein — die Testmail geht ' +
          'ausschließlich an die eigene Adresse.' }, 400);
      if (mailError)
        return give({ ok: false, reason: 'Message failed: 550 abgelehnt',
                     sentTo: ownAddress, ...mailCardMock() });
      mailStatus.testedAt = '2026-08-25 12:00:00';
      return give({ ok: true, reason: '', sentTo: ownAddress, ...mailCardMock() });
    }
    if (url === '/api/titles') return give({ publicTitle: 'Oeffentlich', appTitle: 'Intern' });
    /* ---- DIE NAMEN JE SPRACHE, WIE localeOf(req) SIE ENTSCHEIDET -- 0.24.5 ----
       DER MOCK ANTWORTET WIE DER ECHTE SERVER, und das heisst hier vor allem:
       ER HOERT DEN KOPF NICHT. `localeOf(req)` fragt ZUERST den persoenlichen
       Schluessel des angemeldeten Zugangs und erst danach `Accept-Language`
       (0.24.3, Konzept 5.3) -- wer eine Sprache eingestellt hat, bekommt auf
       JEDE Anfrage die Namen SEINER Sprache, gleichgueltig was im Kopf steht.
       GENAU DAS IST DER BEFUND DIESER RUNDE (D1), und ohne diese Zeilen waere
       er im Mock nicht nachstellbar: einer, der den Kopf beantwortet, zeigte
       eine Klempnerei, die es nicht gibt, und die achtzehn gemeldeten Zellen
       waeren von selbst gruen (Stolperstein 90).
       DER RUECKFALL IST DIE ABWESENHEIT EINER ZEILE, wie in `named()`: wo die
       Tafel nichts hat, bleibt der Name der Grundzeile stehen. */
    const personalLanguage = () => settings.language || 'de';
    /* WELCHE SPRACHE DIE GRUNDZEILE TRAEGT. Sie steht in `languages` und wird
       nicht ein zweites Mal gesetzt: eine zweite Wahrheit darueber liefe von
       der ersten weg. Ohne Angabe ist es `de` -- die Vorgabe dieses Mocks. */
    const baseLanguageMock = () =>
      ((settings.languages || []).find(a => a.isDefault) || {}).code || 'de';
    /* DIE KETTE IM MOCK -- 0.25.0, und sie ist Schritt fuer Schritt dieselbe
       wie `chainFor()` in server.js (Stolperstein 90): die Sprache des Lesers,
       sonst die Vorgabe, sonst die Erstellungssprache der Zeile, sonst der
       Originaltext ohne Sprachangabe.
       DIE AUTORITAET IST DER SERVER UND NICHT DIESE ZEILE. Was die Kette
       WIRKLICH ergibt, prueft die Tafel „Die Kette am Server — 0.25.0" am
       laufenden Server; dieser Nachbau ist da, damit die KARTE etwas zu lesen
       bekommt, das so auch ankaeme. Ein Mock mit einer einfacheren Regel
       machte jede Kartenzusage darueber wertlos.
       DIE ERSTELLUNGSSPRACHE TRAEGT DEN GRUNDNAMEN, nicht die Tafel daneben --
       genau wie `product_categories.name` am Server. */
    const chainMock = (row, per, locale) => {
      const std = baseLanguageMock();
      const at = (code) => (code != null && code === row.language)
        ? row.name : ((per || {})[code] || {})[row.id];
      const own = at(locale);
      if (own !== undefined) return { name: own, from: locale };
      for (const code of [std, row.language]) {
        const back = at(code);
        if (back !== undefined) return { name: back, from: code };
      }
      return { name: row.name, from: null };
    };
    /* WAS EINE LISTE DES SERVERS TRAEGT -- der Name der Kette UND der Vermerk.
       Seit 0.25.0 geht `nameFallback` an JEDEN Leser hinaus und nicht nur in
       die Adminkarte: die Kette gilt ueberall. */
    const withNames = (rows, table) => rows.map(z => {
      const hit = chainMock(z, table, personalLanguage());
      if (hit.from === personalLanguage()) return { ...z, name: hit.name };
      return { ...z, name: hit.name,
               nameFallback: hit.from === null ? true : hit.from };
    });
    /* SCHREIBEN AUF EINEN NAMEN -- 0.24.5, mit 0.25.0 an die Kette angepasst.
       Der Mock macht `writeName()` nach: OHNE Sprachangabe -- oder mit der
       ERSTELLUNGSSPRACHE DER ZEILE -- wird die GRUNDZEILE umbenannt, mit jeder
       anderen eine UEBERSETZUNG geschrieben.
       BIS 0.24.6 ENTSCHIED DIE VORGABESPRACHE DARUEBER, und genau das war
       Befund A1: ein Wechsel der Vorgabe benannte still um, welche Zeile ein
       Umbenennen trifft.
       EINE UEBERSETZUNG, DIE DEM GRUNDNAMEN GLEICHT, WIRD NICHT MEHR
       GELOESCHT -- seit die Grundzeile eine eigene Sprache hat, ist sie eine.
       ER ZIEHT WIRKLICH MIT (Stolperstein 90): einer, der den Rumpf annimmt und
       seinen Bestand stehen laesst, machte „die Karte zeigt danach den neuen
       Namen" von „die Karte ist in die Sprache des Lesers zurueckgefallen"
       ununterscheidbar -- und genau das war der zweite Weg, auf dem die falsche
       Sprache in die Liste kam (drawAdmin las bis 0.24.4 an namesFrom vorbei).
       UND DAS ✕ RAEUMT WIRKLICH -- 0.25.0 (F5): `clearName` nimmt die Zeile
       aus der Namenstabelle. Der Originaltext bleibt; ihn zu raeumen sagt der
       Server ab, und dieser Nachbau tut es auch.
       DIE ANTWORT TRAEGT DEN NAMEN DER GELESENEN SPRACHE, wie am echten
       Server. */
    const writeNameMock = (rows, table, id, body) => {
      const row = rows.find(z => z.id === id);
      if (!row) return null;
      const language = !body || body.language === undefined
        ? (row.language === undefined ? null : row.language) : String(body.language);
      if (body && body.clearName === true) {
        if (language === row.language) return null;   // der Originaltext bleibt
        if (table && table[language]) delete table[language][id];
        return row;
      }
      const name = String((body && body.name) || '').trim();
      if (!name) return row;
      if (language === row.language) { row.name = name; return row; }
      if (!table) return row;
      if (!table[language]) table[language] = {};
      table[language][id] = name;
      return row;
    };
    if (url === '/api/criteria') return give(withNames(criteria, criterionNames));
    if (url === '/api/criteria/order') return give(withNames(criteria, criterionNames));
    if (url === '/api/tags') return give(tags);
    /* NICHT LEER. Eine leere Karte hat keine Zeilen, und eine Pruefung darauf,
       dass an ihren Zeilen etwas NICHT steht, bliebe auf null Zeilen gruen und
       belegte nichts (Stolperstein 81). Genau das ist beim Bau von 0.8.40 an
       der Gegenprobe zum Gewichtsfeld aufgefallen. */
    if (url === '/api/product-categories') return give(withNames(categories, categoryNames));
    /* Der eigene Name steht seit 0.8.6 in dieser Antwort, und der
       Mock liefert ihn mit -- sonst bliebe die Kopfzeile leer und
       jede Pruefung darauf blind. Als Vorgabe DERSELBE Name wie unter
       /api/account; eine Prueflage kann ihn ueberschreiben. */
    /* zweifaktor SEIT 0.10.0: daran haengt, ob das Bestaetigungsfenster ein
       zweites Feld zeigt. Es kommt aus DEMSELBEN Stand wie die Karte -- eine
       zweite Wahrheit im Mock waere genau der Fehler, den er finden soll. */
    /* DIE NAMENSTAFELN JE SPRACHE -- 0.24.5, mit 0.25.0 umgebaut, und NUR FUER
       DEN ADMIN, wie am echten Server (`namesAll()` in server.js).
       SIE TRAGEN, WAS EIN LESER DIESER SPRACHE SAEHE, und dazu die Sprache,
       aus der es stammt: `{ name, from }`. `from === <Spalte>` heisst „hier ist
       wirklich etwas eingetragen"; alles andere ist ein Rueckfall, und genau
       den zaehlt die Karte an ihren Pillen.
       BIS 0.24.6 STAND HIER NUR EIN NAME, und die Karte bildete die Kette
       selbst. Diese Runde macht daraus eine (Stolperstein 47).
       WELCHE SPRACHE DIE VORGABE IST, SAGT DIE PRUEFLAGE und nicht diese
       Zeile: `languages` traegt `isDefault`, und eine zweite Wahrheit darueber
       liefe von der ersten weg. Ohne Angabe ist es `de` -- die Vorgabe dieses
       Mocks seit 0.24.3.
       SIE STEHEN VOR `...settings`, damit eine Prueflage sie ueberschreiben
       kann. */
    const namesTableMock = (rows, per) => {
      const codes = fs.readdirSync(path.join(__dirname, 'public', 'languages'))
        .filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
      const out = Object.fromEntries(codes.map(c => [c, {}]));
      for (const code of codes)
        for (const z of rows) {
          const hit = chainMock(z, per, code);
          out[code][z.id] = { name: hit.name, from: hit.from };
        }
      return out;
    };
    if (url === '/api/settings' && (opt.method || 'GET') === 'GET')
      return give({ name: 'chefin', trashDays: 30, convertImages,
        twoFactor: zfStatusMock.an === true,
        ...(settings.isAdmin === false ? {} : {
          categoryNames: namesTableMock(categories, categoryNames),
          criterionNames: namesTableMock(criteria, criterionNames) }),
        ...settings });
    /* SCHREIBEND, seit 0.19.0 -- und der Mock AENDERT SEINE ANTWORT WIRKLICH
       (Stolperstein 90): sonst waere „der Haken ist gesetzt" von „der Haken
       springt zurueck" nicht zu unterscheiden. */
    if (url === '/api/settings' && opt.method === 'PUT') {
      const sentBody = opt.body ? JSON.parse(opt.body) : {};
      if (sentBody.convertImages !== undefined) convertImages = !!sentBody.convertImages;
      /* EIN SPRACHWECHSEL ANTWORTET MIT DEM SATZ DER NEUEN SPRACHE -- 0.24.4,
         und der echte Server tut genau das (nachgemessen: `localeOf(req)`
         liest den persoenlichen Schluessel, der in derselben Anfrage
         geschrieben wurde). **Ohne diese Zeile waere Befund B9 im Mock gar
         nicht nachstellbar**: die Oberflaeche wechselte die Sprache, und die
         vierzehn Vokabelwoerter blieben in der alten -- ein Mock, der
         `{ convertImages }` zurueckgibt, sieht davon nichts (Stolperstein 90).
         DIE VORGABEN KOMMEN AUS DER ECHTEN DATEI, wie ueberall hier. */
      if (typeof sentBody.language === 'string' && sentBody.language) {
        const file = path.join(__dirname, 'public', 'languages', `${sentBody.language}.json`);
        if (fs.existsSync(file)) {
          /* DER PERSOENLICHE SCHLUESSEL ZIEHT WIRKLICH MIT -- 0.24.5, und der
             echte Server tut nichts anderes: `PUT /api/settings` schreibt ihn,
             und JEDE weitere Anfrage liest ihn in `localeOf(req)`. Ein Mock,
             der ihn nur zurueckmeldet und nicht setzt, antwortete danach
             weiter in der ALTEN Sprache -- und Befund D2 (der Zwischenspeicher
             ueberlebt den Sprachwechsel) waere in EINER Sitzung gar nicht
             nachstellbar (Stolperstein 90). */
          settings.language = sentBody.language;
          const words = Object.fromEntries(
            Object.entries(JSON.parse(fs.readFileSync(file, 'utf8')))
              .filter(([k]) => k.startsWith('vocabulary.'))
              .map(([k, v]) => [k.slice('vocabulary.'.length), v]));
          return give({ language: sentBody.language, vocabulary: words,
                        vocabularies: { ...settings.vocabularies, [sentBody.language]: words },
                        vocabulariesOwn: settings.vocabulariesOwn,
                        vocabularyDefaults: settings.vocabularyDefaults });
        }
      }
      /* UND EIN WECHSEL DER VORGABESPRACHE ANTWORTET MIT DEN BEIDEN
         NAMENSTAFELN -- 0.24.6 (F4). Der echte Server tut genau das: er
         schreibt Vorgabe und Vorrat in EINEM Griff (`writeLanguages()`) und
         legt die frischen Tafeln in dieselbe Antwort.
         DER MOCK AENDERT SEINEN STAND WIRKLICH (Stolperstein 90): `languages`
         traegt danach die neue Vorgabe, und `namesTableMock()` baut die Tafeln
         AUS DIESEM Stand. Einer, der die alten Tafeln zurueckgibt, machte
         „die Karte zieht nach" von „die Karte blieb stehen" ununterscheidbar
         -- und genau das ist Befund E3.
         DIE VORGABE IST IMMER IM VORRAT, wie am Server (`writeLanguages()`):
         ein Vorrat ohne die Vorgabe ist ein Zustand, den es nicht geben darf.
         NUR FUER DEN ADMIN, wie beim Lesen -- dieselbe Klemme, nicht eine
         zweite daneben. */
      if (sentBody.languageDefault !== undefined || sentBody.languageOn !== undefined) {
        const std = sentBody.languageDefault !== undefined
          ? String(sentBody.languageDefault) : baseLanguageMock();
        const pool = Array.isArray(sentBody.languageOn)
          ? sentBody.languageOn
          : (settings.languages || []).filter(a => a.active).map(a => a.code);
        settings.languages = (settings.languages || []).map(a => ({ ...a,
          isDefault: a.code === std, active: pool.includes(a.code) || a.code === std }));
        return give({ languages: settings.languages,
          ...(settings.isAdmin === false ? {} : {
            categoryNames: namesTableMock(categories, categoryNames),
            criterionNames: namesTableMock(criteria, criterionNames) }) });
      }
      /* NUR DER GEAENDERTE WERT ZURUECK, nicht die ganze Antwort: bis 0.18.1
         fiel dieser Weg auf `give({})` durch, und mehrere Karten lesen aus dem
         Ergebnis. Wer hier die volle Antwort einsetzt, aendert still das
         Verhalten von Prueflagen, die mit dieser Runde nichts zu tun haben. */
      return give({ convertImages });
    }
    if (url === '/api/settings') return give({ name: 'chefin', trashDays: 30,
      convertImages, twoFactor: zfStatusMock.an === true, ...settings });
    /* DER PAPIERKORB IM MOCK, und er muss BEIDE Zustaende koennen: gefuellt
       und leer. Eine Karte ohne Zeilen belegte nichts ueber die Zeilen, eine
       ohne den leeren Fall nichts ueber die Auskunft "hier liegt nichts"
       (Stolperstein 81).
       ZWEI ZEILEN, UND SIE SIND VERSCHIEDENER ART: eine von einem lebenden
       Zugang, eine von einem GRABSTEIN (loeschender.name null). Waeren beide
       gleich, liesse sich nicht sehen, ob die Beschriftung ihre eigene Zeile
       trifft.
       ER STEHT HINTER dem Admin, wie der echte Server -- antwortete er jedem
       mit 200, waere die Rolle unpruefbar. */
    if (url === '/api/trash') {
      if (settings.isAdmin === false)
        return give({ error: 'Das verwaltet nur der Admin.' }, 403);
      return give({ days: 30, rows: trash });
    }
    /* Die Sicherung. Sie steht hinter dem EIGENTUEMER, und der Mock macht das
       mit -- antwortete er jedem mit 200, waere die Rolle unpruefbar. */
    if (String(url).split('?')[0] === '/api/backup' && (opt.method || 'GET') === 'GET') {
      if (settings.isOwner === false)
        return give({ error: 'Das kann nur der Eigentümer dieser Installation.' }, 403);
      /* DIE VORSCHAU RECHNET WIRKLICH -- und zwar aus den Werten der ABFRAGE,
         wie der echte Server. Sonst blieben "die Karte fragt neu" und "die
         Karte behauptet" ununterscheidbar (Stolperstein 90).
         DIE GRENZEN HALTEN AUCH IM MOCK: eine Zahl ausserhalb ist eine Absage
         mit 400, denn genau daran haengt die Zusage, dass die Karte den
         Fehlschlag anzeigt und ihre Vorschau stehen laesst. */
      const q = String(url).split('?')[1] || '';
      const numberOut = (n) => {
        const m = q.match(new RegExp(`(?:^|&)${n}=([^&]*)`));
        return m ? Number(decodeURIComponent(m[1])) : null;
      };
      const gr = backup.cleanup && backup.cleanup.limits;
      if (!gr || !q) return give(backup);
      const b = numberOut('keep'), t = numberOut('days');
      for (const [value, span, event] of [[b, gr.keep, 'Immer behalten'],
                                         [t, gr.days, 'Erst löschen ab']]) {
        if (value === null) continue;
        if (!Number.isInteger(value) || value < span.min || value > span.max)
          return give({ error: `${event} muss eine ganze Zahl von ${span.min} bis ` +
                              `${span.max} sein.` }, 400);
      }
      const keep = b === null ? backup.cleanup.keep : b;
      const days = t === null ? backup.cleanup.days : t;
      //          die Mindestzahl                  das Alter
      const matched = cleanupCopies.slice(keep).filter(z => z.daysAgo > days);
      /* DIE VOLLSTAENDIGE LISTE MIT NUMMER UND MARKEN, wie der echte Server sie
         liefert -- juengste zuerst. Ohne sie zeichnete die Karte hier eine
         leere Liste, und jede Zusage darauf waere trivial wahr
         (Stolperstein 81). */
      const names = new Set(matched.map(z => z.file));
      const oldNames = new Set((backup.cleanup.oldFiles || []).map(z => z.file));
      return give({ ...backup, cleanup: { ...backup.cleanup, keep, days,
        files: cleanupCopies.map((z, i) => ({ ...z, nr: i + 1,
          affected: names.has(z.file), outdated: oldNames.has(z.file) })),
        matched, bytes: matched.reduce((n, z) => n + z.bytes, 0),
        reason: matched.length ? '' : (cleanupCopies.length <= keep
          ? `Alle ${cleanupCopies.length} Kopien sind unter den jüngsten ${keep}.`
          : `Die älteste ist ${cleanupCopies[cleanupCopies.length - 1].daysAgo} Tage alt.`) } });
    }
    /* Und der Loeschweg. Er aendert den Stand WIRKLICH: die getroffenen
       Kopien fallen aus der Liste, und die Antwort traegt die frische
       Vorschau -- sonst blieben "die Karte zeichnet sich neu" und "die Karte
       blieb stehen" ununterscheidbar (Stolperstein 90).
       ER NIMMT KEINE DATEINAMEN ENTGEGEN, genau wie der echte: was im Rumpf
       steht, ist die Art und sonst nichts. */
    if (url === '/api/backup/cleanup' && opt.method === 'POST') {
      if (settings.isOwner === false)
        return give({ error: 'Das kann nur der Eigentümer dieser Installation.' }, 403);
      const k = JSON.parse(opt.body || '{}');
      if (k.kind !== 'rule' && k.kind !== 'outdated')
        return give({ error: 'Diese Art des Aufräumens gibt es nicht.' }, 400);
      const a = backup.cleanup || {};
      const outdatedFiles = k.kind === 'outdated'
        ? (a.oldFiles || [])
        : cleanupCopies.slice(a.keep).filter(z => z.daysAgo > a.days);
      const names = new Set(outdatedFiles.map(z => z.file));
      for (let i = cleanupCopies.length - 1; i >= 0; i--)
        if (names.has(cleanupCopies[i].file)) cleanupCopies.splice(i, 1);
      const bytes = outdatedFiles.reduce((n, z) => n + z.bytes, 0);
      backup.number = Math.max(0, (backup.number || 0) - outdatedFiles.length);
      if (k.kind === 'outdated') { backup.outdated = 0; a.oldCount = 0; a.oldBytes = 0;
                                  a.oldFiles = []; }
      backup.cleanup = { ...a, matched: [], bytes: 0,
                               reason: 'Alle Kopien sind unter den jüngsten ' + a.keep + '.' };
      return give({ ok: true, kind: k.kind, removed: outdatedFiles.length, notDeleted: 0, bytes,
                   reachable: true, number: backup.number, last: backup.last,
                   changedAt: backup.changedAt ?? null,
                   outdated: backup.outdated ?? 0,
                   cleanup: backup.cleanup });
    }
    /* Und die beiden Schreibwege, die ihren Stand WIRKLICH aendern
       (Stolperstein 90): ein Mock, der stur denselben Stand zurueckgaebe,
       machte "die Karte zeichnet sich neu" von "die Karte blieb stehen"
       ununterscheidbar. */
    if (url === '/api/backup/dir' && opt.method === 'PUT') {
      const place = String(JSON.parse(opt.body || '{}').place || '');
      if (place.includes('..') || place.startsWith('/'))
        return give({ error: 'Der Ort ist ein Unterverzeichnis des eingerichteten Sicherungsorts.' }, 400);
      backup.place = place;
      backup.filePath = place ? `/sicherung/${place}` : '/sicherung';
      backup.error = null;
      // gewechseltAm und veraltet gehen MIT -- der echte Server breitet
      // letzteSicherung() auch hier aus, und ein Mock, der sie weglaesst,
      // liesse die Karte nach dem Speichern harmloser aussehen als die Lage.
      return give({ ok: true, place, filePath: backup.filePath, reachable: true,
                   number: backup.number, last: backup.last,
                   changedAt: backup.changedAt ?? null,
                   outdated: backup.outdated ?? 0 });
    }
    if (url === '/api/backup' && opt.method === 'POST') {
      const file = 'kriterion-2026-08-23-19-00-00.sqlite';
      backup.number = (backup.number || 0) + 1;
      backup.last = { file, bytes: 52428800, at: '2026-08-23 19:00:00', daysAgo: 0 };
      backup.reachable = true;
      /* `cleaned` STEHT AUSDRUECKLICH DA UND IST null: der Schalter der
         Prueflage ist aus, also hat der Anschluss nichts getan. Ein fehlendes
         Feld waere von "nichts getan" nicht zu unterscheiden, und die Karte
         entscheidet daran, ob sie den ganzen Bereich neu zeichnet. */
      return give({ ok: true, file, filePath: backup.filePath, bytes: 52428800, ms: 512,
                   reachable: true, number: backup.number, last: backup.last,
                   changedAt: backup.changedAt ?? null,
                   outdated: backup.outdated ?? 0, cleaned: null });
    }
    /* Und die beiden Wege, die den Bestand WIRKLICH aendern (Stolperstein 90):
       ein Mock, der beim Zurueckholen zwar antwortet, aber dieselbe Liste
       weiterliefert, macht "die Karte zeichnet sich neu" von "die Karte blieb
       stehen" ununterscheidbar -- beide Faelle blieben gruen. */
    if (/^\/api\/trash\/\d+\/restore$/.test(url) && opt.method === 'POST') {
      const nr = Number(url.split('/')[3]);
      const removed = trash.findIndex(z => z.id === nr);
      if (removed < 0) return give({ error: 'Nicht gefunden' }, 404);
      const [row] = trash.splice(removed, 1);
      return give({ ok: true, itemId: 77, title: row.title, items: 1,
                   authorUnknown: row.id === 502 ? ['dora'] : [] });
    }
    if (/^\/api\/trash\/\d+$/.test(url) && opt.method === 'DELETE') {
      const nr = Number(url.split('/').pop());
      const removed = trash.findIndex(z => z.id === nr);
      if (removed < 0) return give({ error: 'Nicht gefunden' }, 404);
      trash.splice(removed, 1);
      return { ok: true, status: 204, json: async () => ({}) };
    }
    /* Die eigenen Anmeldungen. WIE BEIM PAPIERKORB AENDERT DER MOCK SEINE
       ANTWORT WIRKLICH (Stolperstein 90): einer, der nach dem Beenden
       dieselbe Liste weiterliefert, macht "die Karte zeichnet sich neu" von
       "die Karte blieb stehen" ununterscheidbar -- beides bliebe gruen.
       WER DIE ZAHLEN DIESER PRUEFLAGE MISST, MISST SIE AN EINEM FRISCHEN
       AUFBAU (Stolperstein 115). */
    if (url === '/api/sessions' && (opt.method || 'GET') === 'GET')
      return give({ sessions: sessions.slice(), days: 30 });
    if (url === '/api/sessions' && opt.method === 'DELETE') {
      const n = sessions.filter(z => !z.current).length;
      for (let i = sessions.length - 1; i >= 0; i--) if (!sessions[i].current) sessions.splice(i, 1);
      return give({ ended: n });
    }
    if (/^\/api\/sessions\/[0-9a-f]+$/.test(url) && opt.method === 'DELETE') {
      const k = url.split('/').pop();
      const removed = sessions.findIndex(z => z.id === k);
      if (removed < 0) return give({ error: 'Diese Anmeldung gibt es nicht mehr.' }, 404);
      sessions.splice(removed, 1);
      return give({ ended: 1 });
    }
    if (url === '/api/users' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      const newerUser = { id: 9, username: k.username, role: k.role || 'user',
                            status: 'active', withoutPassword: k.sendInvite === true };
      // Auch hier zieht der Mock wirklich mit: die Liste danach ist eine andere.
      users.users.push({ ...newerUser, last_login: null,
                               created_at: '2026-08-24 09:00:00', entries: 0 });
      /* DER VERSANDZUSTAND KOMMT VOM SERVER, seit 0.9.0 -- und der Mock
         rechnet ihn NACH statt ihn zu setzen: mit Mailzugang und Adresse geht
         etwas hinaus, ohne eines von beiden nicht. Ein Mock, der stur 'ok'
         lieferte, deckte genau die Serverseite zu, um die es geht
         (Stolperstein 102), und der Zweig "aus" waere nie gelaufen. */
      return give(k.sendInvite === true
        ? { ...newerUser, token: 'e'.repeat(64), purpose: 'invite', days: 7, minutes: 15,
            ...deliveryState(k.email) }
        : newerUser);
    }
    // Die Karte "Zugaenge" holt sich die Liste selbst. Ohne diese
    // Zeile bekaeme sie {} und zeichnete gar nichts -- und jede Pruefung auf
    // die Karte waere blind dafuer, ob sie ueberhaupt gefuellt wird.
    // DER SCHREIBWEG STEHT DARUEBER: dieser Zweig fragt nicht nach der
    // Methode und finge ein POST sonst mit ab.
    if (url === '/api/users') return give(users);
    /* Der Link fuer einen vorhandenen Zugang. Der Mock liefert einen
       erkennbaren Wert statt eines zufaelligen: eine Pruefung soll die
       Adresse im Feld nachrechnen koennen. */
    if (/^\/api\/users\/\d+\/token$/.test(url) && opt.method === 'POST') {
      const nr = Number(url.split('/')[3]);
      const z = (users.users || []).find(q => q.id === nr) || {};
      /* WOHER DIE ADRESSE KAM, gehoert in die Antwort -- der echte Server sagt
         es seit 0.8.90. Die Vorgabe ist der Browserweg; eine Prueflage kann
         ueber publicAddress den anderen Zustand stellen, und ohne beide
         liesse sich die Zeile im Linkkasten gar nicht pruefen. */
      return give({ id: nr, username: z.username, token: 'd'.repeat(64),
                   purpose: (JSON.parse(opt.body || '{}').purpose) || 'invite',
                   days: 7, minutes: 15, withoutPassword: Boolean(z.withoutPassword),
                   link: publicAddress ? `${publicAddress}/#/invite/${'d'.repeat(64)}` : null,
                   linkSource: publicAddress ? 'einstellung' : 'browser',
                   // Am BESTEHENDEN Zugang haengt die Adresse an der Zeile und
                   // nicht am Formular; userAddresses sagt, welche eine hat.
                   ...deliveryState(userAddresses[nr]) });
    }
    /* Die zweite Bestaetigung. DER MOCK ZIEHT WIRKLICH MIT (Stolperstein 90):
       ein falsches Passwort wird abgewiesen, und die Oberflaeche muss danach
       stehenbleiben statt zu handeln. */
    if (url === '/api/confirm' && opt.method === 'POST') {
      const k = JSON.parse(opt.body || '{}');
      if (k.password !== DOM_PASSWORD)
        return Promise.resolve({ ok: false, status: 403,
          json: () => Promise.resolve({ error: 'Das Passwort stimmt nicht.' }) });
      return give({ ok: true, purpose: k.purpose, seconds: 120 });
    }
    /* SEIT 0.13.0 KENNT DIE ROUTE EINE AUSWAHL. Der Mock antwortet wie der
       echte Server (Stolperstein 90): er filtert wirklich und liefert `gruppe`
       und `gesamt` dieser Ansicht zurueck. Ein Mock, der stur dieselbe Liste
       gibt, machte jede Pruefung auf den Filter gruen, ohne etwas zu belegen. */
    if (String(url).split('?')[0] === '/api/security-log') {
      const group = (String(url).match(/[?&]gruppe=([^&]*)/) || [])[1];
      if (!group) return give(log);
      const kinds = DOM_PROT_GROUPS[decodeURIComponent(group)];
      if (!kinds) return give({ error: 'Diese Ansicht gibt es nicht.' }, 400);
      const rows = (log.rows || []).filter(z => kinds.includes(z.event));
      return give({ ...log, rows, group: decodeURIComponent(group),
                   total: (log.counts || {})[decodeURIComponent(group)] ?? rows.length });
    }

    if (/^\/api\/users\/\d+\/inventory$/.test(url))
      return give({ username: 'bert', entries: 2, foreignComments: 3, foreignRatings: 1,
                   foreignTestDays: 0, comments: 4, ratings: 2, testDays: 1 });
    /* GET /api/items?q=... -- der Suchweg, seit 0.11.0. ER STEHT VOR DEM FALL
       OHNE PARAMETER, sonst faenge der Vergleich auf Gleichheit ihn nie und
       die Oberflaeche bekaeme auf jede Suche den ganzen Bestand.
       DER MOCK FILTERT UEBER DEN TITEL UND NICHT UEBER SIEBEN QUELLEN. Die
       sieben pruefen die Servergruppen an einer echten Datenbank; hier geht es
       um die Oberflaeche -- dass sie fragt, dass sie zeichnet, was zurueckkommt,
       und dass sie beim Scheitern stehenbleibt. Ein Mock, der die Suche selbst
       nachbaute, belegte genau das, was er selbst tut (Stolperstein 102).
       DER FEHLERFALL IST STELLBAR. Bis 0.10.0 KONNTE die Suche nicht
       scheitern -- sie lief im Arbeitsspeicher. Ohne diese Lage liesse sich
       der Rueckfall nicht pruefen, sondern nur hoffen. */
    /* ---- DIE BEIDEN ZAHLEN, DIE MIT DER LISTE MITREISEN -- 0.16.0 ----
       WIE DER ECHTE SERVER, und darauf kommt es an (Stolperstein 90):
       `offeneAufgaben` wird aus DERSELBEN Menge gerechnet, aus der /api/open
       seine Liste nimmt -- kind = 'task'. Zwei Quellen fuer dieselbe Zahl
       liefen auseinander, und der Zaehler in der Kopfzeile naennte etwas
       anderes als die Ansicht dahinter.
       DIE ANGABEN DER GLOCKE STEHEN NUR MIT BEZUGSPUNKT da. Ohne ihn fallen
       sie GEMEINSAM weg -- so unterscheidet die Oberflaeche „nichts Neues" von
       „es gibt keinen Bezugspunkt". Ein Mock, der sie immer mitgaebe, naehme
       genau die Pruefung weg, fuer die er gebraucht wird (Stolperstein 102).
       SEIT 0.17.0 SIND ES DREI STATT EINER: `neuKommentare`, `neuBewertungen`
       und `neuVon`. Eine Summe gibt es nicht -- die bildet die Oberflaeche.
       DIE PRUEFLAGE DARF BEIDES UEBERSCHREIBEN: was in overviewItems steht,
       gewinnt -- deshalb steht `...i` HINTER der gerechneten Zahl. */
    const includingHeadCounts = (list, wasSearch) => list.map(i => {
      const row = {
        openTasks: open.filter(z => z.kind === 'task' && z.item?.id === i.id).length,
        ...i
      };
      if (!settings.bellSeen)
        for (const k of ['newComments', 'newRatings', 'newFrom']) delete row[k];
      /* DER TREFFERKONTEXT STEHT NUR IN DER ANTWORT AUF EINE SUCHE -- 0.18.0,
         und der Mock macht das mit. Was die Prueflage am Eintrag hinterlegt,
         geht bei einer Suche mit hinaus und faellt ohne Begriff weg. Ein Mock,
         der das Feld immer mitgaebe, naehme genau die Pruefung weg, fuer die
         er gebraucht wird (Stolperstein 102): "die Zeile steht nur waehrend
         einer Suche da" waere von "sie steht immer da" nicht zu
         unterscheiden. */
      if (!wasSearch) delete row.foundAt;
      return row;
    });
    if (url.startsWith('/api/items?q=')) {
      if (searchError) return give({ error: 'Die Suche ist gerade nicht erreichbar.' }, 500);
      const qRaw = decodeURIComponent(url.slice('/api/items?q='.length));
      const qMock = qRaw.trim().toLowerCase();
      const source = overviewItems || overview;
      // DIESELBE FORM WIE OHNE SUCHE: der echte Server geht durch dieselbe
      // Schleife. Ein Mock, der die beiden Wege verschieden beantwortete,
      // verschwaende die Kopfzahlen bei jeder Suche.
      const response = give(includingHeadCounts(
        qMock ? source.filter(i => String(i.title || '').toLowerCase().includes(qMock)) : source, !!qMock));
      /* EINE STELLBARE VERZOEGERUNG JE ANFRAGE, seit 0.11.0. Ohne sie antwortet
         der Mock augenblicklich, und dann koennen sich zwei Anfragen gar nicht
         ueberholen -- der Rueckbau auf die laufende Nummer in
         sucheAusfuehren() blieb deshalb STUMM (Rueckbau 139). `searchThrottles` ist
         eine Liste von Millisekunden, eine je Suchanfrage in der Reihenfolge,
         in der sie hinausgehen: [400, 0] laesst die ERSTE spaeter ankommen als
         die zweite. Ohne die Angabe bleibt alles, wie es war. */
      if (Array.isArray(searchThrottles)) {
        const ms = searchThrottles[searchThrottle++] || 0;
        if (ms > 0) return new Promise(r => setTimeout(() => r(response), ms));
      }
      return response;
    }
    if (url === '/api/items') return give(includingHeadCounts(overviewItems || overview));
    /* Ein ZWEITER Eintrag, nur fuer den Vergleich: dort holt die Ansicht
       mehrere Detailantworten nebeneinander. Ohne ihn faende sie fuer die
       zweite Nummer das leere Objekt und zerbraeche an dessen fehlenden
       Feldern -- der Lauf stuerzte ab, statt eine Pruefung rot zu faerben.
       Er steht VOR dem Sammelfall fuer /api/items/1, damit startsWith ihn
       nicht abfaengt. */
    if (secondEntry && url === `/api/items/${secondEntry.id}`) return give(secondEntry);
    /* PUT auf den Eintrag: der echte Server antwortet mit detail() NACH der
       Aenderung, der Mock muss das nachmachen. Gaebe er stur den
       alten Stand zurueck, pruefte man jedes Bedienelement gegen einen
       Zustand, den es nach dem Klick nie gab -- und ein Knopf, der sich gar
       nicht neu zeichnet, waere von einem, der richtig zeichnet, nicht zu
       unterscheiden. Nur der Eintrag selbst, nicht seine Unterwege
       (/comments, /tags, /photos ...). */
    if (url === '/api/items/1' && opt.method === 'PUT') {
      const core = JSON.parse(opt.body || '{}');
      /* DIE DREI ANGABEN ZUR ABLEHNUNG SCHREIBT DER SERVER ZUSAMMEN, und der
         Mock muss das nachmachen: die Oberflaeche schickt `rejectedReason` und
         bekommt `rejected_reason` samt Datum und Verfasserobjekt zurueck. Ein
         Mock, der den Rumpf stur durchreicht, legte ein Feld in die Antwort,
         das der echte Server nie liefert -- und die Marke bliebe leer, ohne
         dass eine Pruefung rot wuerde (Stolperstein 90).
         DAS DATUM IST FEST UND NICHT `jetzt`: eine Pruefung, die den
         angezeigten Text vergleicht, braucht einen Wert, der sich nicht
         zwischen zwei Zeilen des Prueflaufs bewegt. */
      const togglesIn = core.rejected === true && !example.rejected;
      const reasonRaw = String(core.rejectedReason ?? '').replace(/\s+/g, ' ').trim();
      if (core.rejected !== undefined) example.rejected = !!core.rejected;
      if (togglesIn) {
        example.rejected_at = '2026-08-29 09:12:00';
        example.rejectedAuthor = vChefin;
        example.rejectedMine = vChefin.id === users.ich;
        example.rejected_reason = reasonRaw;
      } else if (core.rejectedReason !== undefined) {
        example.rejected_reason = reasonRaw;
        /* WER ENTFERNT, WIRD NICHT VERFASSER -- wie im echten Server seit
           0.15.0. Ein leeres Feld hat keinen Verfasser, und ein Mock, der ihn
           trotzdem einträgt, verdeckte genau den Unterschied zwischen
           Entfernen und Nachtragen. */
        if (!example.rejectedAuthor && reasonRaw) {
          example.rejectedAuthor = vChefin;
          example.rejectedMine = vChefin.id === users.ich;
        }
      }
      delete core.rejected; delete core.rejectedReason;
      Object.assign(example, core);
      return give(example);
    }
    /* VOR dem Sammelfall darunter: startsWith('/api/items/1') faenge diesen
       Pfad sonst ab und lieferte den ganzen Eintrag. Verschiedene Zahlen in
       jedem Feld, damit sich sehen laesst, ob der Dialog jede an ihrer
       richtigen Stelle nennt. */
    if (url === '/api/items/1/inventory')
      return give({ photos: 1,
                   ownFiles: 5, foreignFiles: 7,
                   ownLinks: 6, foreignLinks: 8,
                   ownComments: 2, foreignComments: 4,
                   ownRatings: 1, foreignRatings: 3,
                   ownTestDays: 1, foreignTestDays: 2 });
    /* Wer welchen Wert vergeben hat -- seit 0.8.6 ein eigener Endpunkt hinter
       nurAdmin, und der Mock macht BEIDES mit. Antwortete er jedem
       mit 200, waere die Rolle unpruefbar; antwortete er mit dem leeren
       Objekt, zeichnete die Ansicht nichts und jede Pruefung darauf waere
       blind -- dieselbe Ueberlegung wie bei /api/users und /api/stats.
       VOR dem Sammelfall darunter: startsWith('/api/items/1') faenge den Pfad
       sonst ab und lieferte den ganzen Eintrag. */
    if (url === '/api/items/1/votes') {
      if (settings.isAdmin === false)
        return give({ error: 'Das verwaltet nur der Admin.' }, 403);
      return give(matchResponse);
    }
    // Der Weg fuer eine fremde Bewertung. Der echte Server antwortet mit dem
    // neu gezeichneten Eintrag -- UND die Stimme ist danach wirklich weg. Ohne
    // das zweite waere ein Neuzeichnen der Adminansicht von einem
    // stehengebliebenen Stand nicht zu unterscheiden.
    if (/^\/api\/ratings\/\d+$/.test(url) && opt.method === 'DELETE') {
      const removed = Number(url.split('/').pop());
      for (const z of matchResponse) z.votes = z.votes.filter(st => st.id !== removed);
      return give(example);
    }
    /* PUT auf ein Kriterium. Der echte Server antwortet mit der GESPEICHERTEN
       Zeile -- also mit dem auf Hundertstel gerundeten Gewicht, und mit einer
       Absage, wenn der Wert die Spanne verlaesst. Ein Mock, der stur
       200 und den geschickten Wert zurueckgaebe, naehme genau die beiden
       Pruefungen weg, fuer die er hier gebraucht wird: dass das Feld die
       Rundung zeigt, und dass es sich nach einer Absage zurueckstellt. */
    if (/^\/api\/criteria\/\d+$/.test(url) && opt.method === 'PUT') {
      const k = criteria.find(c => c.id === Number(url.split('/').pop()));
      const body = JSON.parse(opt.body || '{}');
      if (body.weight !== undefined) {
        const g = Number(body.weight);
        if (!Number.isFinite(g) || g < 0.2 || g > 2)
          return give({ error: 'Das Gewicht muss eine Zahl zwischen 0,2 und 2 sein.' }, 400);
        k.weight = Math.round(g * 100) / 100;
      }
      /* DER NAME GEHT SEIT 0.24.5 DURCH writeNameMock -- bis 0.24.4 stand hier
         `k.name = body.name`, und damit landete eine UEBERSETZUNG in der
         Grundzeile: der Mock kannte die Sprachangabe des Rumpfes nicht, obwohl
         die Karte sie seit 0.24.3 mitschickt. */
      /* UND DAS ✕ -- 0.25.0 (F5). `clearName` schickt KEINEN Namen mit; der
         Zweig darunter (`if (body.name)`) faelle darauf durch, und die Karte
         zeichnete nach einem Klick eine Liste, in der nichts geraeumt ist.
         DIE ABSAGE AM ORIGINALTEXT KOMMT MIT: `writeNameMock` gibt `null`
         zurueck, wenn die Zeile SELBST gemeint war -- der echte Server sagt
         dort 400. */
      if (body.clearName === true) {
        const cleared = writeNameMock(criteria, criterionNames, k.id, body);
        if (!cleared) return give(
          { error: 'Der Originaltext lässt sich nicht entfernen.' }, 400);
        return give(withNames([{ ...cleared }], criterionNames)[0]);
      }
      if (body.name) writeNameMock(criteria, criterionNames, k.id, body);
      return give(withNames([{ ...k }], criterionNames)[0]);
    }
    /* UND DASSELBE AN DER KATEGORIE -- 0.24.5. Bis 0.24.4 gab es dafuer gar
       keinen Weg im Mock: der Ruf fiel auf `give({})` durch, und die Karte
       zeichnete danach neu, ohne dass sich etwas geaendert haette. Damit war
       „Umbenennen auf einer fremden Pille" nicht pruefbar. */
    if (/^\/api\/product-categories\/\d+$/.test(url) && opt.method === 'PUT') {
      const body = JSON.parse(opt.body || '{}');
      const row = writeNameMock(categories, categoryNames, Number(url.split('/').pop()), body);
      if (!row) return give(body.clearName === true
        ? { error: 'Der Originaltext lässt sich nicht entfernen.' }
        : { error: 'Diese Kategorie gibt es nicht mehr.' }, body.clearName === true ? 400 : 404);
      return give(withNames([{ ...row }], categoryNames)[0]);
    }
    /* DER EINE GRIFF FUER DIE UNBEKANNTE ERSTELLUNGSSPRACHE -- 0.25.0 (F2).
       Der echte Server schreibt in BEIDE Tabellen, aber nur dort, wo
       `language IS NULL`, und legt die frischen Tafeln in dieselbe Antwort.
       DER MOCK AENDERT SEINEN BESTAND WIRKLICH (Stolperstein 90): ohne das
       waere „der Kasten ist danach weg" von „der Kasten war nie da" nicht zu
       unterscheiden. */
    if (url === '/api/names/language' && opt.method === 'PUT') {
      const body = JSON.parse(opt.body || '{}');
      if (typeof body.language !== 'string' || !body.language)
        return give({ error: 'Diese Sprache steht nicht zur Wahl.' }, 400);
      let n = 0, m = 0;
      for (const z of categories) if (z.language == null) { z.language = body.language; n++; }
      for (const z of criteria) if (z.language == null) { z.language = body.language; m++; }
      return give({ categories: n, criteria: m,
                    categoryNames: namesTableMock(categories, categoryNames),
                    criterionNames: namesTableMock(criteria, criterionNames) });
    }
    /* Die Ansicht "Offen". Gefiltert wird HIER, wie im echten Server: nur die
       Art 'task' geht hinaus, und `kind` selbst steht nicht in der Antwort --
       der echte Endpunkt liefert es nicht, und ein Mock, der mehr
       mitschickt, machte jede Pruefung darauf wertlos. */
    if (url === '/api/open')
      return give(open.filter(z => z.kind === 'task').map(z => ({
        id: z.id, text: z.text, created_at: z.created_at,
        item: z.item, mine: z.mine, author: z.author })));
    /* PUT auf einen Kommentar: der echte Server schreibt die Art und antwortet
       mit dem neu gebauten Eintrag. Der Mock muss BEIDES nachmachen --
       antwortete er nur, ohne seinen Bestand zu aendern, waere ein gesetzter
       Haken von einem verschluckten nicht zu unterscheiden (Stolperstein 90).
       Er steht VOR dem Sammelfall darunter, der jedem Kommentarweg den ganzen
       Eintrag zurueckgibt. */
    if (/^\/api\/comments\/\d+$/.test(url) && opt.method === 'PUT') {
      const nr = Number(url.split('/').pop());
      const body = JSON.parse(opt.body || '{}');
      if (body.kind !== undefined) {
        const row = open.find(z => z.id === nr);
        if (row) row.kind = body.kind;
        const k = example.comments.find(c => c.id === nr);
        if (k) k.kind = body.kind;
      }
      return give(example);
    }
    /* LOESCHEN ZIEHT WIRKLICH MIT (Stolperstein 90). Der echte Server nimmt
       die Zeile weg, und das naechste GET auf den Eintrag liefert sie nicht
       mehr. Gab der Mock sie bis 0.17.0 weiter zurueck, zeichnete der
       Betrachter danach ein Bild, das es gar nicht mehr gibt -- und die Zusage
       „kein Abspieler zeigt auf eine geloeschte Adresse" liess sich nicht
       stellen. Das FOCUS-Ziel bleibt unberuehrt: es traegt einen Anhang und
       faellt nicht unter dieses Muster. */
    if (/^\/api\/photos\/\d+$/.test(url) && opt.method === 'DELETE') {
      const pathId = Number(url.slice(url.lastIndexOf('/') + 1));
      example.photos = example.photos.filter(p => p.id !== pathId);
      return give({ ok: true });
    }
    /* DER AUSSCHNITT, seit 0.19.0. ER MUSS HIER STEHEN, und zwar aus dem
       Grund, der eine Zeile tiefer schon steht: ohne eigenen Zweig fiele der
       Ruf auf `give({})` durch, `item` waere danach leer, und JEDE spaetere
       Pruefung an diesem Fenster bräche -- an einer Stelle, die mit dem
       Ausschnitt nichts zu tun hat.
       UND DER MOCK AENDERT SEINE ANTWORT WIRKLICH (Stolperstein 90): sonst
       waere „der Wert kommt an" von „der Wert wird verworfen" nicht zu
       unterscheiden, und beides bliebe gruen. Beschnitten wird wie im
       Server, denn genau das soll die Oberflaeche nicht selbst tun. */
    if (/^\/api\/photos\/\d+\/focus$/.test(url) && opt.method === 'PUT') {
      const nr = Number(url.split('/')[3]);
      const k = (v, min, max) => Math.min(max, Math.max(min, Number(v)));
      const f = example.photos.find(p => p.id === nr);
      if (f) {
        const sentBody = opt.body ? JSON.parse(opt.body) : {};
        f.focus_x = k(sentBody.x, 0, 100); f.focus_y = k(sentBody.y, 0, 100);
        if (sentBody.zoom !== undefined) f.zoom = k(sentBody.zoom, 100, 400);
      }
      return give(example);
    }
    if (url.startsWith('/api/items/1')) return give(example);
    // Endpunkte, die den ganzen Eintrag zurueckgeben. Ohne das wird `item` im
    // Frontend leer, und alles Folgende bricht -- der Prueflauf stuerzte
    // daran ab, statt eine Pruefung rot zu faerben.
    if (/^\/api\/comments\/\d+/.test(url) || /^\/api\/comment-images\/\d+$/.test(url) ||
        /^\/api\/items\/1\/comments$/.test(url))
      return give(example);
    if (url.startsWith('/api/attachments/41/preview'))
      return give({ kind: 'text', text: 'Erste Zeile\nZweite Zeile', shortened: false });
    /* Die Kennzahlen stehen seit 0.8.5 hinter nurAdmin, und der Mock
       macht das mit. Antwortete er jedem mit 200, verdeckte er genau die
       Falle, um die es in dieser Stufe geht: renderSystem() haengt sechs
       Abrufe in EIN Promise.all, und ein einziger Fehlschlag verliesse den
       Rumpf mit return -- der Systembereich bliebe fuer einen gewoehnlichen
       Benutzer vollstaendig leer, auch die Karten, die ihm zustehen. */
    if (url === '/api/stats') {
      if (settings.isAdmin === false)
        return give({ error: 'Das verwaltet nur der Admin.' }, 403);
      /* Der Fingerprint gehoert seit 0.8.10 dazu. Ein Mock, der ihn
         auslaesst, macht jede Pruefung an der Karte blind: sie zeichnete
         nichts, und "die Zeile fehlt" waere von "die Zeile ist falsch" nicht
         zu unterscheiden (Stolperstein 90). */
      /* videoCount/videoBytes und papierkorbCount/papierkorbBytes stehen hier,
         weil die Karten sie LESEN: die Exportkarte rechnet die erwartete
         Groesse aus videoBytes, die Kennzahlenkarte zeigt den Papierkorb als
         eigene Zeile. Ein Mock, der ein gelesenes Feld auslaesst, deckt die
         Serverseite zu (Stolperstein 90). */
      /* `export` und die Kommentarbilder stehen hier seit 0.12.3, aus demselben
         Grund wie die beiden Absaetze darueber: die Karten LESEN sie. Die
         Exportkarte rechnet ihre Zahlen daraus und haengt die Warnung an
         `warnAb`, die Kennzahlenkarte zeigt beide Zeilen. Ein Mock ohne diese
         Felder liesse jede Pruefung daran blind laufen (Stolperstein 90) --
         und er darf sie ausdruecklich nicht selbst ausrechnen, sonst belegte
         die Prueflage ihre eigene Rechnung statt der des Servers
         (Stolperstein 102). */
      return give({ dbBytes: 1, photoCount: 0, photoBytes: 0, itemCount: 1,
        videoCount: 0, videoBytes: 0,
        commentCount: 0, linkCount: 0, testDayCount: 0, attachmentCount: 4, attachmentBytes: 6144,
        trashCount: 2, trashBytes: 2560,
        commentImageCount: 3, commentImageBytes: 1536,
        export: statsExport || { envelope: 4096, photos: 65536, videos: 32768,
          attachments: 8192, commentImages: 2048,
          warnFrom: 300 * 1024 * 1024, limit: 483183799 },
        version: require('./package.json').version, fingerprint: 'a1b2c3d4',
        /* DIE AUFTEILUNG NACH FORMAT und der Stand eines Laufs. Der Mock
           liefert sie wie der Server: erkannt an den ersten Bytes, nur
           Bilder, keine Videos. */
        imageFormats: statsImageFormats === undefined
          ? { png: { count: 12, bytes: 6291456 }, jpeg: { count: 5, bytes: 524288 },
              webp: { count: 2, bytes: 65536 } }
          : statsImageFormats,
        conversion: statsSwitch,
        geometry: statsGeometry,
        /* DIE ALGORITHM, seit 0.16.0 -- dieselben Werte, die db.js aus der
           geoeffneten Datei abliest. STELLBAR AUF null: eine Antwort ohne sie
           ist die Lage, in der der Abschnitt in der Karte gar nicht dastehen
           darf. Ohne diesen Fall waere „er steht da" nicht von „er steht
           immer da" zu unterscheiden (Stolperstein 81). */
        method: statsMethod === undefined
          ? { cipher: 'sqlcipher', keyBits: 256, journal: 'WAL', passwords: 'scrypt' }
          : statsMethod,
        keyFromEnv: false, keyHex: 'ab'.repeat(32) });
    }
    return give({});
  };
  /* DIE UEBERSETZUNG KOMMT AUS DEM GRUNDDOKUMENT -- 0.30.0, F4. Gelaufen wird
     sie im Zusammenhang DIESES Fensters; geteilt ist allein die Uebersetzung.
     UND SIE STEHT DAMIT AUCH NICHT MEHR IM DOKUMENT: bis 0.30.0 haengte der
     ganze Quelltext als <script> im Kopf -- ausdruecklich im Kopf und nicht im
     Rumpf, damit er nicht in `document.body.textContent` steht und jede
     Textpruefung Woerter findet, die auf dem Bildschirm gar nicht stehen. Wer
     gar nicht erst im Dokument steht, steht auch in keinem Text.
     GEKLAMMERT WIE JEDER GRIFF IN EINEN NACHBAU: ein Rueckbau, der app.js
     zerbricht, soll eine Zusage rot machen und nicht den Lauf abreissen. Die
     Message geht denselben Weg wie vorher -- in dieselbe virtuelle Konsole. */
  try { BASE_SCRIPT.runInContext(dom.getInternalVMContext()); }
  catch (e) { silenceConsole.emit('jsdomError', e instanceof Error ? e : new Error(String(e))); }
  return { w, sent, criteria, example, matchResponse, categoryNames, criterionNames };
}
/* DIE TAGZEILE AUFKLAPPEN -- 0.24.0 (Bauabschnitt 0.2). Sie steht seither
   zugeklappt, solange kein Tagfilter greift; wer prueft, was IN ihr steht,
   klappt sie zuerst auf.
   MIT DEM KLICK UND NICHT MIT EINEM GESETZTEN ZUSTAND: ein von Hand
   gesetzter Merker naehme genau den Weg heraus, um den es geht -- und liesse
   die Pruefung auch dann gruen, wenn der Knopf gar nichts mehr tut. */
async function openTagRow(w) {
  const button = w.document.getElementById('f-weitere');
  if (button && button.getAttribute('aria-expanded') === 'false') button.onclick();
  await new Promise(r => setTimeout(r, 20));
  return w.document.getElementById('f-tagzeile');
}


/* WARTEN, BIS DIE SUCHE DURCH IST. Sie laeuft seit 0.11.0 ueber einen Debounce
   von 220 ms und danach ueber eine Anfrage; ein Vergleich unmittelbar nach
   oninput() saehe den Stand von vorher und waere gruen, ohne etwas zu belegen.

   GEWARTET WIRD AUF DIE SICHTBARE WIRKUNG UND NICHT AUF EINEN INNEREN WERT.
   `state` in app.js ist ein const auf oberster Ebene und liegt damit NICHT am
   window -- eine Frage nach w.state.suchLaeuft waere immer undefined und die
   Schleife liefe nie, ohne dass es auffiele. Gefragt wird deshalb die
   Zaehlzeile: solange gesucht wird, steht dort "sucht …". Das ist ausserdem
   genau der Zustand, den ein Mensch sieht.

   ZUERST DER DEBOUNCE. Vor 220 ms ist gar nichts unterwegs, und "sucht …"
   stuende auch dann nicht da, wenn die Suche gleich losliefe -- eine Schleife
   ohne diese Frist waere sofort fertig und belegte nichts. */
const SEARCH_WAIT_DEBOUNCE = 300;
async function waitSearch(w, limitMs = 3000) {
  await new Promise(r => setTimeout(r, SEARCH_WAIT_DEBOUNCE));
  const to = Date.now() + limitMs;
  while (Date.now() < to) {
    const z = w.document.getElementById('count');
    if (!z || !/sucht/.test(z.textContent)) break;
    await new Promise(r => setTimeout(r, 20));
  }
  // Eine Runde durch den Event Loop, damit das Neuzeichnen durch ist.
  await new Promise(r => setTimeout(r, 20));
}

/* ---- Einen bestimmten Abschnitt des Systembereichs zeichnen -- 0.16.0 ----
   SEIT 0.16.0 ZEIGT DER SYSTEMBEREICH IMMER GENAU EINEN ABSCHNITT. Eine
   Prueflage, die eine bestimmte Karte sucht, muss deshalb sagen, in welchem
   Abschnitt diese Karte steht -- sonst sucht sie im ersten und findet nichts.
   UEBER replaceState UND NICHT UEBER location.hash: ein gesetzter Hash loeste
   hashchange aus, route() zeichnete ein zweites Mal, und die Prueflage haette
   zwei Zeichnungen fuer einen Aufruf. replaceState loest nichts aus -- genau
   das ist hier gewollt.
   DIE ADRESSE IST DAMIT DERSELBE WEG WIE IM BROWSER: renderSystem() liest sie
   selbst. Ein zweiter Weg (etwa ein Argument) waere eine zweite Wahrheit
   ueber denselben Zustand. */
async function sysSection(w, key) {
  w.history.replaceState(null, '', `#/system/${key}`);
  await w.renderSystem();
  await new Promise(r => setTimeout(r, 20));
}

/* ---- DER NAME UND DAS MERKMAL EINER SPRACHPILLE -- 0.25.0 ---------------
   SEIT DIESER RUNDE TRAEGT EINE SPRACHPILLE ZWEI ANGABEN: den Namen der
   Sprache und dahinter ein Merkmal -- einen Punkt `●` fuer „fuer jede Zeile
   ist etwas eingetragen" oder die ZAHL der fehlenden Zellen.
   `textContent` GIBT SEITHER BEIDES ZUSAMMEN. „Deutsch14" ist kein Sprachname,
   und jede Prueflage, die eine Pille an ihrem Namen sucht, faende sie nicht
   mehr. Der NAME ist der erste Textknoten, das MERKMAL steht in einem eigenen
   Element -- deshalb zwei Leser und nicht ein Abschneiden.
   GEKLAMMERT WIE JEDER GRIFF IN EINEN NACHBAU: ein Rueckbau, der die Pille
   wegnimmt, soll die Zusage rot machen und nicht den Lauf abreissen
   (Stolperstein 161). */
const pillName = (b) => ((b && b.firstChild && b.firstChild.textContent) || '').trim();
const pillMark = (b) => {
  const mark = b && b.querySelector ? b.querySelector('.n, .dot') : null;
  return mark ? (mark.textContent || '').trim() : '';
};

/* EIN DURCHGANG DURCH ALLE ABSCHNITTE -- Karten, Reiter und der ganze Text.
   GEGANGEN WIRD DER WEG DES BENUTZERS: die Reiter, die wirklich dastehen,
   werden der Reihe nach geoeffnet. Damit belegt dieselbe Schleife dreierlei --
   welche Karten es gibt, dass jeder Reiter wirklich irgendwohin fuehrt, und
   was auf keinem einzigen Abschnitt steht.
   DIE LISTE AUS SYS_KARTEN ABZULESEN WAERE KEIN BELEG: eine Probe, die ihren
   Maßstab vom Pruefling bezieht, kann nicht scheitern (Befund B aus 0.12.0).
   Gezaehlt wird, was im Markup steht.
   DER TEXT GEHOERT DAZU, weil „steht nirgends" sonst nur „steht nicht im
   ersten Abschnitt" hiesse -- und das ist eine andere Aussage. */
/* ================= Der Bildschirmtext-Waechter: der Leser =================
   0.22.0. Der Sprachwaechter liest Kommentare und Papiere; dieser zweite
   Durchgang liest GENAU DAS, WAS DER ERSTE WEGWIRFT -- die Texte in
   Anfuehrungszeichen und Backticks von public/app.js und die error:-Texte der
   Serverdateien. Bezeichner sind kein Text und werden nicht gelesen.
   EIN KLEINER ZERLEGER STATT EINES REGULAEREN AUSDRUCKS: app.js schachtelt
   Vorlagen in Vorlagen (`${a ? `…` : ''}`), und darin stehen wieder
   Anfuehrungszeichen -- ein Ausdruck, der „alles zwischen zwei Backticks"
   nimmt, laese Code als Text und Text als Code. Der Zerleger kennt
   Kommentare, die drei Arten von Strings, die Klammern in ${…} und
   regulaere Ausdrucksliterale, und er nennt zu jedem Text seine Zeile.
   Er steht ausserhalb der Gruppe, weil zwei Gruppen ihn brauchen: der
   Waechter selbst und die Zaehlung der Server-Befehle im Kasten. */
function screenTextsFrom(src) {
  const out = [];
  let i = 0;
  const n = src.length;
  const row = (pos) => src.slice(0, pos).split('\n').length;
  // Ein Schraegstrich beginnt ein Ausdrucksliteral, wenn davor kein Wert steht.
  const regexAllowed = (pos) => {
    let j = pos - 1;
    while (j >= 0 && /\s/.test(src[j])) j--;
    if (j < 0) return true;
    return /[(,=:\[!&|?{};+\-*%<>~^]/.test(src[j]) ||
      /\b(return|typeof|case|in|of|do|else)$/.test(src.slice(Math.max(0, j - 6), j + 1));
  };
  // Liest Code; mit `stop` bis zur schliessenden Klammer eines ${…}.
  function code(stop) {
    let depth = 0;
    while (i < n) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
      if (c === "'" || c === '"') {
        const start = i; i++; let s = '';
        while (i < n && src[i] !== c) {
          if (src[i] === '\\') { s += src[i + 1]; i += 2; continue; }
          if (src[i] === '\n') break;
          s += src[i]; i++;
        }
        i++; out.push({ text: s, row: row(start) }); continue;
      }
      if (c === '`') { i++; template(); continue; }
      if (c === '/' && regexAllowed(i)) {
        i++; let cls = false;
        while (i < n && (cls || src[i] !== '/') && src[i] !== '\n') {
          if (src[i] === '\\') { i += 2; continue; }
          if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false;
          i++;
        }
        i++; while (i < n && /[a-z]/.test(src[i])) i++; continue;
      }
      if (stop) { if (c === '{') depth++; else if (c === '}') { if (depth === 0) { i++; return; } depth--; } }
      i++;
    }
  }
  // Liest eine Vorlage: Text bis zum Backtick, ${…} geht zurueck in den Code.
  function template() {
    let s = ''; const start = i;
    while (i < n) {
      const c = src[i];
      if (c === '\\') { s += src[i + 1]; i += 2; continue; }
      if (c === '`') { i++; break; }
      if (c === '$' && src[i + 1] === '{') {
        if (s.trim()) out.push({ text: s, row: row(start) });
        s = ''; i += 2; code(true); continue;
      }
      s += c; i++;
    }
    if (s.trim()) out.push({ text: s, row: row(start) });
  }
  code(false);
  return out;
}
/* Die Serverdateien: nur die Texte hinter `error:`, samt Fortsetzungszeilen
   mit `+`. Alles andere in server.js ist keine Bildschirmsprache. */
function serverTextsFrom(src) {
  const out = [];
  const re = /error:\s*/g; let m;
  while ((m = re.exec(src))) {
    const j = m.index + m[0].length;
    let endRecord = j, q = null, depth = 0;
    while (endRecord < src.length) {
      const c = src[endRecord];
      if (q) { if (c === '\\') { endRecord += 2; continue; } if (c === q) q = null; endRecord++; continue; }
      if (c === "'" || c === '"' || c === '`') { q = c; endRecord++; continue; }
      if (c === '{' || c === '(') depth++;
      if (c === '}' || c === ')') { if (depth === 0) break; depth--; }
      if (c === ';') break;
      endRecord++;
    }
    const row = src.slice(0, m.index).split('\n').length;
    for (const t of screenTextsFrom(src.slice(j, endRecord) + ' ')) out.push({ text: t.text, row });
  }
  return out;
}
/* DIE VERBOTSLISTE DER RUNDE 0.22.0 (Konzept, 4.3) -- Woerter, die den
   Bildschirm verlassen haben. Sie gilt fuer Texte, die ein Mensch am
   Bildschirm liest; in Kommentaren und Papieren bleiben die Bilder des
   Projekts erlaubt (dort liest der Sprachwaechter mit seiner eigenen Liste).
   ZWEI AUSNAHMEN STEHEN IM MUSTER, nicht daneben: „liegen" ist fuer
   Zahlenbereiche und Daten gewoehnliches Deutsch („zwischen 1 und 5 liegen",
   „in der Zukunft liegen") und nur fuer „gespeichert sein" verboten; „Kopie
   der Datenbank" ist die Erklaerung der Sicherung aus dem Woerterbuch selbst.
   „Zugang" bleibt allein in „Zugang anfragen" und „Noch keinen Zugang?" --
   dort meint es den Zutritt, nicht die Person (E2, E3).
   DIE ERSTE AUSNAHME HIESS BIS 0.31.2 „Zugang beantragen". Der Betreiber hat
   das Label am 13. September 2026 auf „anfragen" bestellt: das ganze Wortfeld
   sagt in allen drei Sprachen „Anfrage" -- `login.sendRequest`,
   `card.openRequests`, „Send request", „Başvuruyu gönder" --, und dieses eine
   Label war der Ausreisser. DIE AUSNAHME WANDERT MIT DEM SATZ, sonst faengt
   die Liste genau den Satz, fuer den sie die Ausnahme traegt. */
const SCREEN_BAN = [
  [/\bträgt\b|\btrifft\b|\btragen\b/, 'trägt/trifft (für gilt)'],
  [/\bfallen\b|\bfällt\b/, 'fallen/fällt (für enden)'],
  [/\bBlick\b/, 'Blick (für Besuch)'], [/\bTafel\b/, 'Tafel'], [/Grabstein/, 'Grabstein'], [/\bWirt\b/, 'Wirt'],
  [/Sicherungsweg|Austauschweg/, 'Sicherungsweg/Austauschweg'],
  [/Haus verlässt|Hausanschluss|aus dem Haus/, 'das Haus'],
  [/TLS von Anfang an/, 'TLS von Anfang an'], [/Ableitung/, 'Ableitung'], [/nachziehen|nachgezogen/, 'nachziehen'],
  [/[Hh]ereinkommen/, 'Hereinkommen'],
  [/\bliegen\b(?<!zwischen [^.]*liegen)(?<!Zukunft liegen)/, 'liegen (für gespeichert sein)'],
  [/\bProbe\b/, 'Probe (für Vorschau)'], [/\bNäher\b/, 'Näher (für Zoom)'],
  [/\bElemente?\b/, 'Element (für Foto/Video)'], [/Betriebsart/, 'Betriebsart'], [/Rohtext/, 'Rohtext'],
  [/\bRechnung\b/, 'Rechnung (für Berechnung)'], [/Zustand zurücksetzen/, 'Zustand zurücksetzen'],
  [/\bKasten\b/, 'Kasten'], [/Passwortspeicher/, 'Passwortspeicher'], [/\bUmgebung\b/, 'Umgebung'],
  [/\bgezogen\b/, 'gezogen (für erstellt)'], [/\bStück\b/, 'Stück (für Dateien)'],
  [/\bBoden\b|\bSchere\b|\bDeckel\b|\bPille\b|\bKiste\b|\bKlemme\b|\bWächter\b|Stolperstein|Rückbau|Bestandslauf|Migrationsblock|Austauschformat/, 'ein Bild des Projekts'],
  [/Fingerprint(?!\))/, 'Fingerprint ohne Erklärung'],
  [/Systembereich|Selbstanmeldung|Suchanbieter|Startanbieter|Bildablage|\bStimmen?\b|Gesamtschnitt|Sicherungsort|Zielort|Verwaltungsbereich|Rücksetzlink|Wunsch-Benutzername|Zugänge\b|Bewertungskriterien|Freigeben|Freigegeben|unwiderruflich|stillgelegt|Alles anzeigen|Kopien?\b(?!\s+der\s+Datenbank)/, 'ein Wort, das das Wörterbuch ersetzt hat'],
  [/\bZugangs?\b(?! anfragen)(?!\?)/, 'Zugang (für Benutzer/Konto)'],
  [/\b0\.\d+\.\d+\b/, 'eine Versionsnummer'],
];
// Adressen und Selektoren sind kein Bildschirmtext: '/api/items', '#/system', '.thumb'.
const isAddress = (t) => /^[\/#.][^ ]*$/.test(t.trim());
function screenViolations(texts) {
  const out = [];
  for (const t of texts) {
    if (isAddress(t.text)) continue;
    for (const [re, name] of SCREEN_BAN)
      if (re.test(t.text)) out.push(`Z. ${t.row} [${name}]: ${t.text.trim().replace(/\s+/g, ' ').slice(0, 90)}`);
  }
  return out;
}

async function sysPass(d) {
  const cards = [], pieces = [];
  const tab = [...d.w.document.querySelectorAll('.sys-tab')]
    .map(a => a.getAttribute('href'));
  for (const address of tab) {
    d.w.history.replaceState(null, '', address);
    await d.w.renderSystem();
    await new Promise(r => setTimeout(r, 30));
    cards.push(...[...d.w.document.querySelectorAll('.sys-grid > .sys-card h3')]
      .map(h => h.textContent.trim()));
    pieces.push(d.w.document.getElementById('app')?.textContent || '');
  }
  return { cards, tab, text: pieces.join('\n') };
}


/* ================= DREI LESER DES STILBLATTS -- hierher in 0.34.0 =========
   Sie standen bis 0.33.2 mitten in checkUi() und werden seit dem Umzug von
   drei Modulen gebraucht: Export, Stilblatt und Sprache. Zwei Fassungen
   waeren zwei Wahrheiten (Stolperstein 47), also stehen sie hier.
   ES SIND LESER UND KEINE ZUSAGEN: keine Zeile darin ist ein check(). Die
   Zusagen dazu sind in ihren Gruppen geblieben. */
  const css123 = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  const regel123 = (choice) => (css123.match(new RegExp(choice.replace(/\./g, '\\.') + ' \\{[^}]*\\}')) || [''])[0];
  /* WAS AUSSERHALB JEDER MEDIENABFRAGE STEHT. Eine Regel, die nur unterhalb
     eines Umbruchpunkts gilt, gilt auf dem Desktop nicht -- und genau darum
     geht es beim zweiten Befund. Die Bloecke werden ueber ihre Klammern
     gezaehlt und nicht ueber einen Ausdruck: eine Medienabfrage enthaelt
     selbst Klammerpaare. */
  const withoutMedia = (() => {
    const raw = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    let outcome = '', i = 0;
    while (i < raw.length) {
      const a = raw.indexOf('@media', i);
      if (a < 0) { outcome += raw.slice(i); break; }
      outcome += raw.slice(i, a);
      let j = raw.indexOf('{', a), depth = 0;
      if (j < 0) break;
      for (; j < raw.length; j++) {
        if (raw[j] === '{') depth++;
        else if (raw[j] === '}' && --depth === 0) { j++; break; }
      }
      i = j;
    }
    return outcome.replace(/\s+/g, ' ');
  })();


return {
  DOM_PASSWORD, DOM_LOG, DOM_PROT_GROUPS, placeConfirm, confirmImDom,
  DOM_PROVIDER, MAIL_HINT_KEYS, DE_TEXTS, buildDom, openTagRow,
  SEARCH_WAIT_DEBOUNCE, waitSearch, sysSection, pillName, pillMark,
  screenTextsFrom, serverTextsFrom, SCREEN_BAN, isAddress,
  screenViolations, sysPass, css123, regel123, withoutMedia
};
})(H.__dirname, H.require);
