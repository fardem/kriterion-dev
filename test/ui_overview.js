/* Kriterion — Pruefstand: die Oberflaeche: die Uebersicht Das mitwachsende
   Feld, die Einrichtungsseite, die Kacheln und ihr Leser, die Sprachpillen,
   die Zeitleiste, die Tagwolken und die offenen Aufgaben. */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  placeConfirm, buildDom, openTagRow, waitSearch, sysSection, pillName,
  pillMark, until, openRequests
} = D;

async function run() {
  const {
   fs, path, segment, COMMENT, REGEX, __dirname, require, FILTER, group,
   check, equal, setField, open, names, benchFiles
  } = H;

  group('Oberflaeche');
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch {
    H.skipped += 38;
    console.log('  … uebersprungen: jsdom fehlt (npm install)');
    return;
  }

  // Die Ansicht ist gezeichnet, und jede Antwort ist verarbeitet.
  const overviewReady = (x) => !!x.document.getElementById('count') && openRequests(x) === 0;
  const detailReady = (x) => !!x.document.getElementById('ratings') && openRequests(x) === 0;
  const openReady = (x) => !!x.document.getElementById('open-list') && openRequests(x) === 0;
  // An der Stelle von `before` steht ein neu gezeichnetes Element.
  const redrawn = (id, before) => (x) => {
    const el = x.document.getElementById(id);
    return !!el && el !== before && openRequests(x) === 0;
  };

  const { w, sent, criteria, example } = buildDom(JSDOM);
  await until(w, overviewReady, 2000, 'die Uebersicht');

  /* --- Mitwachsendes Feld: die Rechnung, nicht nur das Vorhandensein --- */
  const field = w.document.createElement('textarea');
  w.document.body.appendChild(field);
  let contentHeight = 180;
  Object.defineProperty(field, 'scrollHeight', { get: () => contentHeight });
  Object.defineProperty(field, 'offsetHeight', { get: () => 42 });   // mit Rahmen
  Object.defineProperty(field, 'clientHeight', { get: () => 40 });   // ohne Rahmen
  w.autoGrow(field);
  check('Hoehe folgt dem Inhalt und rechnet den Rahmen dazu', field.style.height === '182px', `ist: ${field.style.height}`);
  check('Feld wird als mitwachsend gekennzeichnet', field.classList.contains('ta-auto'));
  contentHeight = 300;
  field.dispatchEvent(new w.Event('input'));
  check('Neue Zeile vergroessert das Feld', field.style.height === '302px', `ist: ${field.style.height}`);

  /* --- Kein Sprung nach oben beim Tippen --- jsdom rechnet kein Layout: das
     Zusammenfallen bei height:auto verkuerzt hier keine Seite, und der
     Browser zieht nichts nach. */
  const scroll = { scrollTop: 0 };
  Object.defineProperty(w.document, 'scrollingElement', { configurable: true, get: () => scroll });
  const feld2 = w.document.createElement('textarea');
  w.document.body.appendChild(feld2);
  Object.defineProperty(feld2, 'scrollHeight', { get: () => 240 });
  Object.defineProperty(feld2, 'offsetHeight', { get: () => 42 });
  Object.defineProperty(feld2, 'clientHeight', { get: () => 40 });
  // Das Zurueckziehen haengt am Setzen von height:auto, nicht am Messen.
  let setHeight = '';
  Object.defineProperty(feld2.style, 'height', {
    configurable: true,
    get: () => setHeight,
    set: (v) => { setHeight = v; if (v === 'auto') scroll.scrollTop = 0; }
  });
  scroll.scrollTop = 900;
  w.autoGrow(feld2);
  check('Bildlaufposition ueberlebt das erste Messen', scroll.scrollTop === 900, `ist: ${scroll.scrollTop}`);
  check('Hoehe wird dabei trotzdem richtig gesetzt', feld2.style.height === '242px', `ist: ${feld2.style.height}`);
  scroll.scrollTop = 640;
  feld2.dispatchEvent(new w.Event('input'));
  check('Bildlaufposition ueberlebt auch jeden Tastendruck', scroll.scrollTop === 640, `ist: ${scroll.scrollTop}`);

  /* --- Einrichtung geht der Anmeldung vor --- */
  const inDom = buildDom(JSDOM, { setup: true, loggedIn: false });
  await until(inDom.w, (x) => !!x.document.getElementById('sb') && openRequests(x) === 0,
    2000, 'die Einrichtungsseite');
  const eText = inDom.w.document.body.textContent;
  check('Bei Einrichtungsbedarf kommt die Einrichtungsseite, nicht die Anmeldung',
    !!inDom.w.document.getElementById('sb') && !inDom.w.document.getElementById('lb'));
  check('Sie verlangt zwei Passwortfelder',
    !!inDom.w.document.getElementById('sp') && !!inDom.w.document.getElementById('sp2'));
  check('Sie nennt die Mindestlaenge', /10 Zeichen/.test(eText));
  check('Sie verraet den Bestand nicht',
    !eText.includes('Intern') && !eText.includes('Beispiel'), eText.slice(0, 120));
  // Ohne Uebereinstimmung darf nichts an den Server gehen -- sonst waere ein
// Tippfehler im Passwort sofort endgueltig.
  setField(inDom.w.document, 'su', 'chefin');
  setField(inDom.w.document, 'sp', 'zehn-zeichen-und-mehr');
  setField(inDom.w.document, 'sp2', 'zehn-zeichen-und-mahr');
  inDom.sent.length = 0;
  inDom.w.document.getElementById('sb').click();
  await until(inDom.w, (x) => !!x.document.querySelector('.login-error'), 2000,
    'die Meldung der Einrichtungsseite');
  check('Zwei ungleiche Passwoerter gehen nicht an den Server',
    !inDom.sent.some(g => g.url === '/api/setup'),
    JSON.stringify(inDom.sent.map(g => g.url)));
  check('Und die Seite sagt, woran es lag',
    /stimmen nicht überein/.test(inDom.w.document.body.textContent));

  /* --- Anmeldeseite: Versionszeile ohne Scrollen erreichbar ---
     .login-screen nimmt mit min-height: 100vh das ganze Fenster ein, die
     Versionszeile steht ausserhalb von #app darunter. */
  w.showLogin();
  check('Anmeldeseite kennzeichnet sich am body', w.document.body.classList.contains('login'));
  const cssAnm = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  check('Stylesheet teilt dort die Fensterhoehe auf',
    /body\.login \{[^}]*min-height: *100vh/.test(cssAnm) &&
    /body\.login \.login-screen \{[^}]*min-height: *0/.test(cssAnm),
    'Regel fuer body.login fehlt oder hebt die 100vh der Anmeldeseite nicht auf');
  check('Karte darf nicht schrumpfen, sondern die Seite wachsen',
    /body\.login \.login-screen \{[^}]*flex: *1 0 auto/.test(cssAnm));

  // Ueber start(), nicht ueber renderDetail: das ist der einzige Weg, den es
// nach einer Anmeldung wirklich gibt.
  await w.start();
  check('Nach der Anmeldung ist die Kennzeichnung wieder weg',
    !w.document.body.classList.contains('login'));

  /* --- Detailansicht --- */
  await w.renderDetail(1);
  const description = w.document.getElementById('desc');
  check('Beschreibungsfeld waechst mit', description.classList.contains('ta-auto'));
  check('Kommentarfeld waechst mit', w.document.getElementById('ctext').classList.contains('ta-auto'));
  check('Beschreibung steht unveraendert im Feld', description.value === example.description);
  // firstChild, nicht textContent: hinter dem Namen kann die Gewichtsmarke
// stehen, und die gehoert nicht zum Namen.
  const rows = [...w.document.querySelectorAll('#ratings .rname')]
    .map(e => e.firstChild.textContent.trim());
  check('Bewertungsblock folgt der Serverreihenfolge',
    equal(rows, ['Zuerst', 'Dann', 'Zuletzt']), JSON.stringify(rows));
  // Die Bewertungszeile traegt keinen Loeschknopf -- weder sichtbar noch
  // versteckt.
  const bewRows = [...w.document.querySelectorAll('#ratings .rrow')];
  check('Keine Bewertungszeile trägt einen Löschknopf',
    bewRows.length === 3 && bewRows.every(z => !z.querySelector('.xdel')),
    bewRows.map(z => z.querySelector('.racts')?.innerHTML || '').join(' | '));
  check('Die Sterne stehen weiterhin dort',
    bewRows.every(z => !!z.querySelector('.racts')?.children.length));

  /* --- Systembereich, Abschnitt „Bestand" --- */
  await sysSection(w, 'inventory');
  const box = w.document.getElementById('mcrits');
  check('Systembereich zeigt die Kriterienkarte', !!box);
  const rowList = [...box.querySelectorAll('.mrow')];
  check('Alle Kriterien werden aufgelistet',
    equal(rowList.map(r => r.querySelector('.mname').textContent), ['Zuerst', 'Dann', 'Zuletzt']));
  check('Zeilen haben einen Griff', rowList.every(r => r.querySelector('.grip')));
  check('Kategorien behalten ihre Zeilen ohne Griff',
    !w.document.querySelector('#mcats .grip') && !w.document.querySelector('#mtags .grip'));
  /* ---- IN DER ZEILE DIE ZAHL, IM TITEL DAS WORT -- 0.30.1, Befund 6 ----
     BIS 0.30.0 STAND „2 Einträge" IN DER ZEILE. */
  const mZelle = rowList[0].querySelector('.mcount');
  check('Zaehler zeigt nur noch die Zahl', mZelle.textContent.trim() === '2');
  check('Und das Wort steht im Titel derselben Zelle',
    mZelle.getAttribute('title') === '2 Einträge', mZelle.getAttribute('title'));

  /* --- Ziehen: echte Zeigerereignisse auf den gerenderten Zeilen --- */
  w.document.elementFromPoint = () => rowList[2];      // jsdom kennt das sonst nicht
  const cursor = (kind, y) => {
    const e = new w.Event(kind, { bubbles: true });
    Object.defineProperty(e, 'clientX', { value: 0 });
    Object.defineProperty(e, 'clientY', { value: y });
    return e;
  };
  rowList[0].dispatchEvent(cursor('pointerdown', 0));
  w.document.dispatchEvent(cursor('pointermove', 120));
  w.document.dispatchEvent(cursor('pointerup', 120));
  await until(w, (x) => sent.some(g => g.method === 'PUT' &&
    g.url === '/api/criteria/order') && openRequests(x) === 0, 2000, 'die gespeicherte Reihenfolge');

  const command = sent.filter(s => s.url === '/api/criteria/order').pop();
  check('Ziehen schickt die neue Reihenfolge', !!command && command.method === 'PUT', JSON.stringify(command));
  check('Gezogene Zeile landet an der neuen Stelle',
    command && equal(command.body.order, [8, 9, 7]), JSON.stringify(command && command.body));

  // Anfassen und wieder loslassen, ohne die Schwelle zu ueberschreiten: darf
  // nichts schreiben.
  const fresh = [...w.document.querySelectorAll('#mcrits .mrow')];
  fresh[0].dispatchEvent(cursor('pointerdown', 0));
  w.document.dispatchEvent(cursor('pointerup', 2));
  // Wartet, ob nach dem blossen Anfassen eine Anfrage ausbleibt.
  await new Promise(r => setTimeout(r, 20));
  check('Blosses Anfassen ohne Bewegung sortiert nichts',
    sent.filter(s => s.url === '/api/criteria/order').length === 1,
    `${sent.filter(s => s.url === '/api/criteria/order').length} Aufrufe`);

  /* --- Die persoenlichen Schalter, mit wirklich zugestelltem Klick --- Ein
     Bedienelement ist erst geprueft, wenn ein Ereignis wirklich zugestellt
     wurde und der Event Loop durchlaufen ist. */
  /* „Darstellung" steht seit 0.16.0 im Abschnitt „Persoenlich", die
     Linkzeilen darunter in „Bestand". */
  await sysSection(w, 'personal');
  const fontButtons = [...w.document.querySelectorAll('#fsize .pill')];
  const targetFont = fontButtons.find(b => b.textContent === '120 %');
  targetFont?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await until(w, (x) => sent.some(s => s.method === 'PUT' && s.url === '/api/settings' &&
    s.body && s.body.font !== undefined) && openRequests(x) === 0, 2000, 'die gespeicherte Schriftgroesse');
  const putFont = sent.filter(s => s.url === '/api/settings' && s.method === 'PUT')
    .filter(s => s.body && s.body.font !== undefined).pop();
  check('Der Klick auf die Schriftgroesse wird wirklich zugestellt',
    !!putFont, JSON.stringify(sent.filter(s => s.url === '/api/settings')));
  check('Und schickt die gewaehlte Stufe',
    putFont?.body.font === 120, JSON.stringify(putFont?.body));
  check('Der Knopf zeichnet sich nach dem Klick neu',
    [...w.document.querySelectorAll('#fsize .pill')]
      .find(b => b.classList.contains('on'))?.textContent === '120 %',
    [...w.document.querySelectorAll('#fsize .pill')]
      .map(b => b.textContent + (b.classList.contains('on') ? '*' : '')).join(' '));
  check('Und die Schriftgroesse steht sofort am Wurzelelement',
    parseFloat(w.document.documentElement.style.fontSize) === 18,
    w.document.documentElement.style.fontSize);

  await sysSection(w, 'inventory');
  const rowsButtons = [...w.document.querySelectorAll('#lrows .pill')];
  rowsButtons.find(b => b.textContent === '12 Zeilen')
    ?.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await until(w, (x) => sent.some(s => s.method === 'PUT' && s.url === '/api/settings' &&
    s.body && s.body.linkRows !== undefined) && openRequests(x) === 0, 2000, 'die gespeicherten Linkzeilen');
  const putRows = sent.filter(s => s.url === '/api/settings' && s.method === 'PUT')
    .filter(s => s.body && s.body.linkRows !== undefined).pop();
  check('Der Klick auf die Linkzeilen ebenso',
    putRows?.body.linkRows === 12, JSON.stringify(putRows?.body));
  check('Und auch dieser Knopf zeichnet sich neu',
    [...w.document.querySelectorAll('#lrows .pill')]
      .find(b => b.classList.contains('on'))?.textContent === '12 Zeilen',
    [...w.document.querySelectorAll('#lrows .pill')]
      .map(b => b.textContent + (b.classList.contains('on') ? '*' : '')).join(' '));

  w.close();

  /* ================= Zweiter Aufbau: eigenes Vokabular ================= */
  group('Oberflaeche mit eigenem Vokabular');

  const own = {
    filters: null, font: 120,
    vocabulary: {
      entryOne: 'Maschine', entryMany: 'Maschinen',
      testedYes: 'Geprüft', testedNo: 'Ungeprüft',
      dayOne: 'Sitzung', dayMany: 'Sitzungen'
    }
  };
  /* Ein ZWEITER Satz, diesmal vollstaendig -- er traegt auch die Woerter fuer
     Bericht und Aufgabe. */
  const ownFull = { filters: null, vocabulary: { ...own.vocabulary,
    reportOne: 'Notat', reportMany: 'Notate',
    taskOne: 'ToDo', taskMany: 'ToDo’s', taskDone: 'Done' } };

  // Direkteinstieg auf einen Eintrag: hier lief loadAll() frueher nie, das
// Vokabular waere also nicht geladen gewesen.
  const two = buildDom(JSDOM, { settings: own, hash: '#/item/1' });
  const w2 = two.w;
  await until(w2, detailReady, 2000, 'die Detailansicht');

  check('Schriftgroesse haengt am Wurzelelement',
    parseFloat(w2.document.documentElement.style.fontSize) === 18,
    `ist: ${w2.document.documentElement.style.fontSize}`);
  const textDetail = w2.document.body.textContent;
  check('Direkteinstieg zeigt das eigene Vokabular',
    textDetail.includes('Maschine löschen') && textDetail.includes('Sitzungen'), '');
  check('Merkmalschalter benutzt das Vokabular',
    w2.document.getElementById('sw-test-t').textContent === 'Geprüft');
  check('Vorgabewoerter tauchen nicht mehr auf',
    !/Testtag|Getestet|Eintrag löschen/.test(textDetail));
  check('Knopf fuer neue Zeitpunkte benutzt die Einzahl',
    w2.document.getElementById('tadd').textContent === '+ Sitzung eintragen');

  /* Die Zahlen am Kommentarblock holen ihre Woerter aus dem Vokabular --
     "Kommentar" dagegen bleibt eine FESTE Beschriftung und wird kein
     zwoelftes Vokabelwort: anders als Sache und Zeitpunkt verschiebt es sich
     nicht mit dem Gegenstand. */
  const vokDom = buildDom(JSDOM, { settings: ownFull, hash: '#/item/1' });
  const wVok = vokDom.w;
  await until(wVok, detailReady, 2000, 'die Detailansicht');
  const kzVok = wVok.document.getElementById('ccount');
  /* SEIT 0.32.1 STEHT DAS VOKABULAR IM `title` UND NICHT MEHR AM BILDSCHIRM
     -- die Kopfzeile zeigt Zahl und Zeichen. */
  check('Die Zahlen am Kommentarblock folgen dem Vokabular',
    kzVok?.title === '6 Kommentare · 1 Notat · 2 ToDo’s (1 offen)',
    kzVok ? kzVok.title : '(kein Hinweis)');
  check('Und die Kurzform daneben traegt kein einziges Wort',
    /^[\d\s·]+$/.test(kzVok?.textContent || 'x'), kzVok ? kzVok.textContent : '(kein Hinweis)');
  check('„Kommentar" bleibt dabei fest',
    /^6 Kommentare/.test(kzVok?.title || '') &&
    wVok.commentNumbers([{ kind: 'note' }]).text === '1 Kommentar',
    wVok.commentNumbers([{ kind: 'note' }]).text);
  check('Und die Einzahl kommt ebenfalls aus dem Vokabular',
    wVok.commentNumbers([{ kind: 'report' }, { kind: 'task' }]).text
      === '2 Kommentare · 1 Notat · 1 ToDo',
    wVok.commentNumbers([{ kind: 'report' }, { kind: 'task' }]).text);
  wVok.close();

  /* ---- Der Favoritenknopf, mit einem wirklich zugestellten Klick ---- Die
     einzige Prueflage im ganzen Prüfstand, die ein Ereignis zustellt statt
     nur den gebauten DOM anzusehen -- und sie muss es sein: der Fehler war in
     jedem gebauten DOM unsichtbar, weil er erst entsteht, wenn ein Behandler
     nach einem await weiterlaeuft. */
  group('Favorit: der Knopf im Eintrag');
  const pinDom = buildDom(JSDOM, { hash: '#/item/1' });
  const wp = pinDom.w;
  await until(wp, detailReady, 2000, 'die Detailansicht');
  const pinButton = () => wp.document.getElementById('pin');

  check('Der Knopf steht da und zeigt den leeren Stern',
    pinButton()?.textContent === '☆' && pinButton()?.className === 'pin-btn',
    `${JSON.stringify(pinButton()?.textContent)} / ${JSON.stringify(pinButton()?.className)}`);

  /* Nicht .click() und nicht die Behandlerfunktion von Hand rufen: beides
     ginge am Fehler vorbei. */
  pinButton().dispatchEvent(new wp.MouseEvent('click', { bubbles: true }));
  await until(wp, (x) => pinDom.sent.some(g => g.url === '/api/items/1' && g.body &&
    g.body.favorite !== undefined) && openRequests(x) === 0, 2000, 'der gespeicherte Favorit');

  const pinSent = pinDom.sent.filter(
    g => g.url === '/api/items/1' && g.body && g.body.favorite !== undefined);
  check('Der Klick schickt genau den Favoriten, sonst nichts',
    pinSent.length === 1 && pinSent[0].method === 'PUT'
      && equal(Object.keys(pinSent[0].body), ['favorite'])
      && pinSent[0].body.favorite === true,
    JSON.stringify(pinSent));
  /* Der Kern der Sache: liefe der Klick auf e.currentTarget, das nach dem
     await null ist, waere der Eintrag zwar gespeichert, aber der Knopf bliebe
     stehen und stattdessen erschiene eine rote Message. */
  check('Danach traegt der Knopf den vollen Stern',
    pinButton()?.textContent === '★', JSON.stringify(pinButton()?.textContent));
  check('Und ist als Favorit gekennzeichnet',
    pinButton()?.className === 'pin-btn on', JSON.stringify(pinButton()?.className));
  check('Der Klick meldet keinen Fehler',
    !/currentTarget|null/.test(wp.document.body.textContent),
    (wp.document.body.textContent.match(/.{0,60}currentTarget.{0,20}/) || [''])[0]);

  // Und wieder zurueck -- der Weg heraus ist derselbe Weg und traegt
// dieselbe Falle.
  pinButton().dispatchEvent(new wp.MouseEvent('click', { bubbles: true }));
  await until(wp, (x) => pinDom.sent.filter(g => g.url === '/api/items/1' && g.body &&
    g.body.favorite !== undefined).length === 2 && openRequests(x) === 0, 2000,
    'der zurueckgenommene Favorit');
  check('Erneuter Klick nimmt den Favoriten zurueck',
    pinButton()?.textContent === '☆' && pinButton()?.className === 'pin-btn',
    `${JSON.stringify(pinButton()?.textContent)} / ${JSON.stringify(pinButton()?.className)}`);
  check('Und schickt dafuer favorite: false',
    pinDom.sent.filter(g => g.url === '/api/items/1' && g.body
      && g.body.favorite === false).length === 1,
    JSON.stringify(pinDom.sent.filter(g => g.body && g.body.favorite !== undefined)));

  /* Waechter ueber die ganze Datei. */
  const ui = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const afterAwait = [];
  for (const b of ui.split(/(?=(?:async\s*\([^)]*\)|async\s*\w+)\s*=>)/)) {
    const a = b.indexOf('await');
    if (a === -1) continue;
    const rest = b.slice(a);
    if (/\b(?:e|ev|evt|event|err)\.currentTarget\b/.test(rest))
      afterAwait.push(rest.match(/.{0,40}currentTarget.{0,10}/)[0].trim());
  }
  check('Kein currentTarget hinter einem await in der Oberflaeche',
    afterAwait.length === 0,
    'currentTarget ist nach dem await null: ' + JSON.stringify(afterAwait));

  // Uebersicht im selben Fenster
  w2.location.hash = '#/';
  await until(w2, overviewReady, 2000, 'die Uebersicht');
  const textList = w2.document.body.textContent;
  check('Anlegeknopf zeigt die Einzahl',
    w2.document.getElementById('new').textContent === '+ Maschine');
  check('Zaehler zeigt die Mehrzahl', /1 Maschine\b/.test(w2.document.getElementById('count').textContent),
    w2.document.getElementById('count').textContent);
  check('Filterknoepfe zeigen das Merkmal',
    textList.includes('Geprüft') && textList.includes('Ungeprüft'));
  check('Filterbeschriftung bleibt generisch',
    textList.includes('Status') && !textList.includes('Teststatus'));
  /* MITGEZOGEN MIT 0.28.1: die Richtung haengt nicht mehr
     am Eintrag, sondern am Umschalter daneben -- aus „Sitzungen (viele →
     wenige)" ist „Sitzungen" geworden. */
  const sortWords = [...w2.document.querySelectorAll('#f-sort option')]
    .map(o => `${o.value}=${o.textContent}`);
  /* UND SEIT 0.32.0 IST „Note" DORT EIN VOKABELWORT -- Strang 2. */
  check('Sortierung nennt Zeitpunkte und die Note artikellos — 0.32.0',
    sortWords.includes('tests=Sitzungen') && sortWords.includes('testlast=Zuletzt: Note')
    && sortWords.includes('testavg=Durchschnitt: Note'),
    JSON.stringify(sortWords));
  check('Karte zaehlt Zeitpunkte in der Mehrzahl', textList.includes('2 Sitzungen'));

  // Abmelden setzt die Schriftgroesse zurueck
  w2.showLogin();
  check('Anmeldeseite faellt auf die Vorgabegroesse zurueck',
    w2.document.documentElement.style.fontSize === '',
    `ist: ${w2.document.documentElement.style.fontSize}`);
  w2.close();

  /* ================= Systembereich: Vokabular pflegen ================= */
  const three = buildDom(JSDOM, { settings: own });
  const w3 = three.w;
  await until(w3, overviewReady, 2000, 'die Uebersicht');
  await sysSection(w3, 'inventory');

  const fields = ['v1','v2','v3','v4','v5','v6','v7','v8','v9','v10','v11','v12','v13','v14','v15']
    .map(id => w3.document.getElementById(id));
  /* VIERZEHN SEIT 0.22.0 (E14), FUENFZEHN SEIT 0.32.0; umgedreht, nicht
     geloescht. */
  check('Fuenfzehn Vokabelfelder stehen bereit — 0.32.0', fields.every(Boolean),
    fields.map((f, n) => f ? '' : `v${n + 1} fehlt`).filter(Boolean).join(' '));
  /* UND ALLES DARUNTER FRAGT MIT `?.` -- 0.32.0, aus der Gegenprobe 1014
     gelernt. */
  check('Felder sind vorbelegt', fields[0]?.value === 'Maschine' && fields[5]?.value === 'Sitzungen');
  /* WAS NICHT EINGETRAGEN IST, STEHT ALS LEERES FELD DA -- 0.24.4, und das
     ist eine ANDERE Zusicherung als bis 0.24.3. */
  const empties = [6, 7, 8, 9, 10, 11, 12, 13, 14];
  check('Und was nicht eingetragen ist, steht leer da — 0.24.4',
    empties.every(n => fields[n]?.value === ''),
    empties.map(n => `v${n + 1}=${JSON.stringify(fields[n]?.value)}`).join(' '));
  /* UND DIE VORGABE STEHT TROTZDEM DA, nur eben als Hinweis und nicht als
     Wert. */
  const hintOf = (n) => (w3.document.querySelector(`label[for=v${n + 1}] .hint`) || {}).textContent || '';
  check('Und der Hinweis darunter nennt die Vorgabe der Kachel',
    /Bericht/.test(hintOf(6)) && /Berichte/.test(hintOf(7)) &&
    /Aufgabe/.test(hintOf(8)) && /Erledigt/.test(hintOf(10)) &&
    /Potenzial/.test(hintOf(11)) &&
    /Bewertung/.test(hintOf(12)) && /Bewertungen/.test(hintOf(13)),
    [6, 7, 8, 10, 11, 12, 13].map(n => hintOf(n).trim()).join(' | '));
  /* DAS ZWOELFTE FELD SEIT 0.21.0 -- das Wort fuer den ersten Sternkasten.
     Es steht in der Karte; die Grenze rueckt damit eine Kennung weiter. */
  check('Das Wort für den Potenzialkasten steht da', !!fields[11], 'v12 fehlt');
  check('Das Paar für die Bewertung steht da — 0.22.0',
    !!fields[12] && !!fields[13], 'v13/v14 fehlt');
  /* UND DAS FUENFZEHNTE SEIT 0.32.0 -- das Wort fuer die Zahl am Zeitpunkt.
     EIN WORT UND KEIN PAAR, wie `potential`: kein Wert schreibt „Noten". */
  check('Das Wort für die Zahl am Zeitpunkt steht da — 0.32.0',
    !!fields[14] && /Vorgabe: Note/.test(
      (w3.document.querySelector('label[for=v15]') || {}).textContent || ''),
    'v15 fehlt');
  /* JEDES FELD NENNT SEINE VORGABE -- 0.22.0: „Sache, Einzahl" allein sagte
     nicht, was dort steht, wenn man das Feld leert. */
  check('Und jede Beschriftung nennt die Vorgabe',
    [...w3.document.querySelectorAll('label[for^="v"]')].filter(l => /^v\d+$/.test(l.htmlFor)).length === 15 &&
    [...w3.document.querySelectorAll('label[for^="v"]')].filter(l => /^v\d+$/.test(l.htmlFor))
      .every(l => /Vorgabe: /.test(l.textContent)),
    [...w3.document.querySelectorAll('label[for^="v"]')].map(l => l.textContent.trim()).join(' | '));
  check('Keine weiteren Felder', !w3.document.getElementById('v16'));
  check('Probe zeigt die aktuellen Woerter',
    w3.document.getElementById('vpreview').textContent.includes('+ Maschine'));
  fields[0].value = 'Objekt';
  fields[0].dispatchEvent(new w3.Event('input'));
  check('Probe folgt der Eingabe sofort',
    w3.document.getElementById('vpreview').textContent.includes('+ Objekt'));

  /* ============ Die Kacheln und der Leser — 0.24.4 =====================
     VIER PRUEFLAGEN UNTER EINER UEBERSCHRIFT, und sie bekommen eine eigene:
     die drei Bloecke unten stehen sonst unter „Favorit: der Knopf im
     Eintrag", und ein Gegenprobenbericht schriebe ihre roten Punkte dieser
     Gruppe zu. */
  group('Die Kacheln und der Leser — 0.24.4');

  /* ============ Die vier Umschalter — 0.24.4 (B1, B3, B4) ==============
     DREI PROBEN AN EINER LAGE, und die Lage ist die des Befunds: der Leser
     steht auf DEUTSCH, fuer ENGLISCH ist etwas eingetragen, fuer Deutsch
     nichts. */
  {
    const usLanguages = [
      { code: 'de', name: 'Deutsch', isDefault: true, active: true },
      { code: 'en', name: 'English', isDefault: false, active: true },
      { code: 'tr', name: 'Türkçe', isDefault: false, active: true }
    ];
    const usDefaults = Object.fromEntries(['de', 'en', 'tr'].map(code => [code,
      Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8')))
        .filter(([k]) => k.startsWith('vocabulary.'))
        .map(([k, v]) => [k.slice('vocabulary.'.length), v]))]));
    /* FUER ENGLISCH IST ETWAS EINGETRAGEN, FUER DEUTSCH NICHTS -- und der
       Rueckfall traegt das englische Wort in den deutschen Satz. */
    const usOwn = { de: {}, en: { entryOne: 'Widget' }, tr: {} };
    const usEffective = Object.fromEntries(['de', 'en', 'tr'].map(code =>
      [code, { ...usDefaults[code], entryOne: 'Widget' }]));
    const four = buildDom(JSDOM, { settings: {
      filters: null, language: 'de', languages: usLanguages,
      vocabulary: usEffective.de, vocabularies: usEffective,
      vocabulariesOwn: usOwn, vocabularyDefaults: usDefaults } });
    const w4 = four.w;
    await until(w4, overviewReady, 2000, 'die Uebersicht');
    await sysSection(w4, 'inventory');
    /* GEZAEHLT WERDEN PILLEN UND NICHT KINDER -- 0.24.6. */
    const usPills = (boxId) => [...((w4.document.getElementById(boxId) || {})
      .querySelectorAll ? w4.document.getElementById(boxId).querySelectorAll('.pill') : [])]
      .map(b => pillName(b) + (b.className.includes('on') ? '*' : ''));
    /* --- DIE UMSCHALTERPROBE, AN ALLEN VIER KACHELN ------------------
       Vokabular, Kategorien und die beiden Kriterienlisten. */
    const US_BOXES = ['vlang', 'ncatlang', 'mcrits-lang', 'mpcrits-lang'];
    check('Umschalterprobe: alle vier Kacheln tragen ihre Sprachzeile',
      US_BOXES.every(id => usPills(id).length === 3),
      US_BOXES.map(id => `${id}=${usPills(id).length}`).join(' '));
    check('Und jede steht auf der Sprache des Lesers',
      US_BOXES.every(id => usPills(id)[0] === 'Deutsch*'),
      US_BOXES.map(id => usPills(id).join('|')).join(' · '));
    /* --- DIE VORGABEPROBE (B4) UND DER FELDINHALT (B1) --------------- */
    const usField = (n) => (w4.document.getElementById(`v${n}`) || {}).value;
    const usHint = (n) => ((w4.document.querySelector(`label[for=v${n}] .hint`) || {}).textContent || '').trim();
    check('Und die deutsche Kachel zeigt in den Feldern NICHT das englische Wort',
      usField(1) === '', JSON.stringify(usField(1)));
    check('Vorgabeprobe: der Hinweis nennt die deutsche Vorgabe',
      /Eintrag/.test(usHint(1)) && !/Entry/.test(usHint(1)), usHint(1));
    /* --- DAS UMSCHALTEN SELBST --------------------------------------- Ein
       Klick auf „English": die Pille wandert, das Feld zeigt das EINGETRAGENE
       Wort, und der Hinweis nennt die ENGLISCHE Vorgabe. */
    const usEnglish = [...w4.document.getElementById('vlang').children]
      .find(b => pillName(b) === 'English');
    usEnglish.dispatchEvent(new w4.Event('click', { bubbles: true }));
    await until(w4, redrawn('vlang', usEnglish.parentElement), 2000, 'die umgeschaltete Kachel');
    check('Ein Klick schaltet die Kachel um — und die Pille zeigt es',
      usPills('vlang')[1] === 'English*', usPills('vlang').join('|'));
    check('Und das Feld zeigt danach das fuer Englisch eingetragene Wort',
      usField(1) === 'Widget', JSON.stringify(usField(1)));
    check('Vorgabeprobe: und der Hinweis folgt der Kachel, nicht dem Leser',
      /Entries/.test(usHint(2)) && !/Einträge/.test(usHint(2)), usHint(2));
    /* UND DIE UEBRIGE OBERFLAECHE BLEIBT DEUTSCH. */
    check('Und die Oberflaeche daneben bleibt in der Sprache ihres Lesers',
      w4.document.body.textContent.includes('Vokabular'),
      'die Seite hat die Sprache gewechselt');
    /* --- DER RUMPF DES PUT (B2) -------------------------------------- */
    setField(w4.document, 'v1', 'Widget2');
    w4.document.getElementById('vsave').dispatchEvent(new w4.Event('click', { bubbles: true }));
    await until(w4, (x) => four.sent.some(g => g.method === 'PUT' && g.url === '/api/settings' &&
      g.body && g.body.vocabulary) && openRequests(x) === 0, 2000, 'das gespeicherte Vokabular');
    const usPut = four.sent.filter(g => g.method === 'PUT' && g.url === '/api/settings')
      .map(g => g.body).filter(b => b && b.vocabulary).pop();
    check('Und der Rumpf des PUT nennt die Sprache der Kachel',
      !!usPut && Object.keys(usPut.vocabulary).length === 1 &&
      usPut.vocabulary.en && usPut.vocabulary.en.entryOne === 'Widget2',
      JSON.stringify(usPut && usPut.vocabulary));
    /* UND DIE UEBRIGEN DREIZEHN FELDER GEHEN LEER HINAUS -- sie sind leer,
       weil fuer sie nichts eingetragen ist, und der Server macht daraus kein
       „eingetragen". */
    check('Und die uebrigen dreizehn Felder gehen leer hinaus',
      !!usPut && Object.values(usPut.vocabulary.en).filter(v => String(v).trim()).length === 1,
      JSON.stringify(usPut && usPut.vocabulary.en));
    w4.close();
  }

  /* ============ Die Sprachprobe des Lesers — 0.24.4 (B9) =============== WER
     SEINE EIGENE SPRACHE WECHSELT, WECHSELT AUCH DIE VIERZEHN WOERTER. */
  {
    const spDom = buildDom(JSDOM, { settings: { filters: null, language: 'de',
      languages: [{ code: 'de', name: 'Deutsch', isDefault: true, active: true },
                  { code: 'en', name: 'English', isDefault: false, active: true }] } });
    const wSp = spDom.w;
    await until(wSp, overviewReady, 2000, 'die Uebersicht');
    await sysSection(wSp, 'personal');
    const spHint = () => ([...wSp.document.querySelectorAll('.desc')]
      .map(z => z.textContent.replace(/\s+/g, ' ').trim())
      .find(z => /Blöcke|blocks/i.test(z)) || '(nicht gefunden)');
    check('Der Aufbau steht: der Satz nennt das Vokabelwort auf Deutsch',
      /Blöcke/.test(spHint()) && /Einträge/.test(spHint()), spHint());
    const spPill = [...(wSp.document.getElementById('lang') || { children: [] }).children]
      .find(b => b.textContent === 'English');
    check('Und die Pillenreihe des Lesers steht da', !!spPill,
      'keine Sprachzeile in der Karte „Darstellung"');
    if (spPill) {
      spPill.dispatchEvent(new wSp.Event('click', { bubbles: true }));
      await until(wSp, redrawn('lang', spPill.parentElement), 2000, 'die Karte in der neuen Sprache');
      check('Sprachprobe: der Wechsel nimmt die Oberflaeche mit',
        /blocks/i.test(spHint()), spHint());
      /* UND DIE VIERZEHN WOERTER GEHEN MIT. Das ist der Befund: bis 0.24.3
         war die Zeile darueber gruen und diese hier rot. */
      check('Und die fuenfzehn Vokabelwoerter gehen mit — 0.24.4 (B9)',
        /Entries/.test(spHint()) && !/Einträge/.test(spHint()), spHint());
    }
    wSp.close();
  }

  /* ============ Die Stellungsprobe — 0.24.4 (B3) ======================= DIE
     BILDLAUFSTELLUNG UEBERLEBT DAS UMSCHALTEN. */
  {
    const stDom = buildDom(JSDOM, { settings: { filters: null, language: 'de',
      languages: [{ code: 'de', name: 'Deutsch', isDefault: true, active: true },
                  { code: 'en', name: 'English', isDefault: false, active: true }] } });
    const wSt = stDom.w;
    await until(wSt, overviewReady, 2000, 'die Uebersicht');
    await sysSection(wSt, 'inventory');
    const stSide = wSt.document.scrollingElement || wSt.document.documentElement;
    stSide.scrollTop = 640;
    check('Der Aufbau steht: die Seite ist heruntergerollt',
      stSide.scrollTop === 640, `${stSide.scrollTop}`);
    const stPill = [...wSt.document.getElementById('vlang').children]
      .find(b => pillName(b) === 'English');
    stPill.dispatchEvent(new wSt.Event('click', { bubbles: true }));
    stSide.scrollTop = 0;                 // der Zusammenfall, den jsdom nicht hat
    await until(wSt, redrawn('vlang', stPill.parentElement), 2000, 'die umgeschaltete Kachel');
    check('Stellungsprobe: die Bildlaufstellung ueberlebt das Umschalten',
      stSide.scrollTop === 640, `${stSide.scrollTop} statt 640`);
    /* UND SIE UEBERLEBT NUR DORT. */
    stSide.scrollTop = 500;
    const stPlain = wSt.renderSystem();
    stSide.scrollTop = 0;
    await stPlain;
    // Wartet, ob nach dem Neuzeichnen das Zurueckholen der Bildlaufstellung ausbleibt.
    await new Promise(r => setTimeout(r, 20));
    check('Und ein gewoehnliches Neuzeichnen holt sie nicht zurueck',
      stSide.scrollTop === 0, `${stSide.scrollTop} statt 0`);
    wSt.close();
  }

  /* ====== Die Tafel der Sprachpillen — 0.24.5 ==========================
     SIEBENUNDZWANZIG ZELLEN UND NEUN DANEBEN, und sie sind KEINE Stichprobe. */
  group('Die Sprachpillen der Namenskarten — 0.24.5');
  {
    const npLanguages = [
      { code: 'de', name: 'Deutsch', isDefault: true, active: true },
      { code: 'en', name: 'English', isDefault: false, active: true },
      { code: 'tr', name: 'Türkçe', isDefault: false, active: true }
    ];
    const npCategoryNames = { en: { 21: 'Tool', 22: 'Substance' }, tr: { 21: 'Alet' } };
    const npCriterionNames = { en: { 7: 'First', 8: 'Then', 9: 'Last' },
                               tr: { 7: 'Birinci', 9: 'Sonuncu' } };
    /* WAS IN DEN DREI LISTEN STEHEN MUSS, je Pille -- der SOLLWERT neben
       jeder Zelle. */
    const npWant = {
      de: { mcats: ['Werkzeug', 'Material'], mcrits: ['Zuerst', 'Dann'], mpcrits: ['Zuletzt'] },
      en: { mcats: ['Tool', 'Substance'], mcrits: ['First', 'Then'], mpcrits: ['Last'] },
      tr: { mcats: ['Alet', 'Material'], mcrits: ['Birinci', 'Dann'], mpcrits: ['Sonuncu'] }
    };
    /* DIE VIERZEHN WOERTER DER VERGLEICHSGRUPPE. */
    const npVocabularyOwn = { de: { entryOne: 'Maschine' }, en: { entryOne: 'Machine' },
                              tr: { entryOne: 'Makine' } };
    const NP_CARDS = [['mcats', 'Kategorien'], ['mcrits', 'Bewertungen: Kriterien'],
                      ['mpcrits', 'Potenzial: Kriterien']];
    /* GEZAEHLT WIRD MITGELAUFEN, und die Zahl wird hinterher festgenagelt. */
    let npCells = 0, npComparisons = 0;
    const npRows = (w, boxId) => [...w.document.querySelectorAll(`#${boxId} .mname`)]
      .map(z => z.textContent.trim());
    const npPill = (w, boxId, name) => [...(w.document.getElementById(boxId) || { children: [] }).children]
      .find(b => pillName(b) === name);
    /* DRUECKT EINE PILLE UND SAGT, OB SIE DA WAR -- geklammert wie setField()
       und aus demselben Grund: ein Rueckbau, der die
       Pillenreihe wegnimmt, muss die Zusagen darunter ROT machen und nicht
       den ganzen Lauf abreissen. */
    const npPress = async (w, boxId, name) => {
      const knob = npPill(w, boxId, name);
      if (!knob) return false;
      knob.dispatchEvent(new w.Event('click', { bubbles: true }));
      await until(w, redrawn(boxId, knob.parentElement), 2000, `die Pillenreihe ${boxId}`);
      return true;
    };

    for (const reader of ['de', 'en', 'tr']) {
      const npDom = buildDom(JSDOM, {
        settings: { filters: null, language: reader, languages: npLanguages,
                    vocabulariesOwn: npVocabularyOwn },
        categoryNames: npCategoryNames, criterionNames: npCriterionNames,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wNp = npDom.w;
      await until(wNp, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wNp, 'inventory');
      const readerName = npLanguages.find(a => a.code === reader).name;
      /* DER AUFBAU ZUERST: ohne die drei Pillenreihen und die drei Listen
         belegten die neun Zellen darunter nichts -- eine Liste, die es nicht
         gibt, ist in jeder Sprache leer und damit in jeder gleich falsch. */
      check(`Aufbau (Leser ${readerName}): alle drei Karten tragen ihre Sprachzeile`,
        ['ncatlang', 'mcrits-lang', 'mpcrits-lang'].every(id => wNp.document.getElementById(id)),
        ['ncatlang', 'mcrits-lang', 'mpcrits-lang']
          .map(id => `${id}=${!!wNp.document.getElementById(id)}`).join(' '));
      check(`Aufbau (Leser ${readerName}): und alle drei Listen haben Zeilen`,
        NP_CARDS.every(([box]) => npRows(wNp, box).length === npWant[reader][box].length),
        NP_CARDS.map(([box]) => `${box}=${npRows(wNp, box).length}`).join(' '));
      for (const pill of ['de', 'en', 'tr']) {
        /* `pillLabel` UND NICHT `pillName` -- 0.25.0: so heisst seit dieser
           Runde der Leser, der den Namen aus einer Pille holt, und ein
           gleichnamiger Wert hier verdeckte ihn in diesem ganzen Block. */
        const pillLabel = npLanguages.find(a => a.code === pill).name;
        if (!await npPress(wNp, 'ncatlang', pillLabel)) {
          check(`Die Pille ${pillLabel} steht da (Leser ${readerName})`, false,
            'keine Pillenreihe an der Karte „Kategorien"');
          continue;
        }
        /* EIN KLICK, DREI ZELLEN: die Pillenreihe ist EIN Umschalter fuer den
           ganzen Abschnitt, und wer ihn an einer Karte umlegt, sieht ihn an
           den anderen mitgehen (0.24.3). */
        for (const [box, cardName] of NP_CARDS) {
          npCells++;
          check(`Zelle: Leser ${readerName}, Pille ${pillLabel}, Karte „${cardName}"`,
            equal(npRows(wNp, box), npWant[pill][box]),
            `steht: ${JSON.stringify(npRows(wNp, box))} — soll: ${JSON.stringify(npWant[pill][box])}`);
        }
        /* UND DIE VERGLEICHSZELLE DANEBEN, an derselben Pille und im
           demselben Augenblick: die Kachel „Vokabular" steht im selben
           Abschnitt, hat dieselbe Bauform und ist heute richtig. */
        await npPress(wNp, 'vlang', pillLabel);
        npComparisons++;
        check(`Vergleichszelle: Leser ${readerName}, Pille ${pillLabel}, Kachel „Vokabular"`,
          (wNp.document.getElementById('v1') || {}).value === npVocabularyOwn[pill].entryOne,
          `steht: ${JSON.stringify((wNp.document.getElementById('v1') || {}).value)} — ` +
          `soll: ${JSON.stringify(npVocabularyOwn[pill].entryOne)}`);
      }
      /* ---- DER KOPF DER KARTE STIMMT IMMER, und das gehoert in die Tafel
         ---- Der Betreiber hat es ausdruecklich gemeldet: „Kategorien",
         „Categories", „Kategoriler" folgen dem LESER, wie sie sollen --
         falsch ist allein die Liste darunter. */
      const npHeads = { de: 'Kategorien', en: 'Categories', tr: 'Kategoriler' };
      check(`Und der Kopf der Karte bleibt beim Leser (${readerName})`,
        [...wNp.document.querySelectorAll('.sys-card h3')]
          .some(z => z.textContent.trim() === npHeads[reader]),
        [...wNp.document.querySelectorAll('.sys-card h3')].map(z => z.textContent.trim()).join(' | '));
      wNp.close();
    }
    /* UND DIE TAFEL WAR WIRKLICH VOLLSTAENDIG. Drei Lesersprachen x drei
       Pillen x drei Karten sind 27, und die Vergleichsgruppe hat neun. */
    check('Die Tafel hat wirklich 27 Zellen — drei Sprachen, drei Pillen, drei Karten',
      npCells === 27, `${npCells} Zellen`);
    check('Und die Vergleichsgruppe der Kachel „Vokabular" wirklich neun',
      npComparisons === 9, `${npComparisons} Zellen`);

    /* ---- DIE FOLGE IN EINER SITZUNG — 0.24.5 (D2) ---------------------
       PILLE DRUECKEN, EIGENE SPRACHE WECHSELN, DIESELBE PILLE NOCH EINMAL. */
    {
      const seqDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'en', languages: npLanguages,
                    vocabulariesOwn: npVocabularyOwn },
        categoryNames: npCategoryNames, criterionNames: npCriterionNames,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wSeq = seqDom.w;
      await until(wSeq, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wSeq, 'inventory');
      await npPress(wSeq, 'ncatlang', 'Türkçe');
      check('Folgeprobe, Schritt 1: der englische Leser drueckt Türkçe und liest Tuerkisch',
        equal(npRows(wSeq, 'mcats'), npWant.tr.mcats),
        JSON.stringify(npRows(wSeq, 'mcats')));
      /* SCHRITT 2: DIE EIGENE SPRACHE WECHSELN. */
      await sysSection(wSeq, 'personal');
      const seqOwn = [...(wSeq.document.getElementById('lang') || { children: [] }).children]
        .find(b => b.textContent === 'Deutsch');
      check('Folgeprobe, Schritt 2: die Sprachzeile des Lesers steht da', !!seqOwn,
        'keine Sprachzeile in der Karte „Darstellung"');
      if (seqOwn) {
        seqOwn.dispatchEvent(new wSeq.Event('click', { bubbles: true }));
        await until(wSeq, redrawn('lang', seqOwn.parentElement), 2000, 'die Karte in der neuen Sprache');
      }
      /* UND SCHRITT 3: DIESELBE PILLE NOCH EINMAL. Sie muss dasselbe zeigen
         wie beim ersten Mal -- die Namen der Sprache, die auf ihr steht. */
      await sysSection(wSeq, 'inventory');
      await npPress(wSeq, 'ncatlang', 'Türkçe');
      check('Folgeprobe, Schritt 3: dieselbe Pille zeigt dieselbe Liste wie beim ersten Mal',
        equal(npRows(wSeq, 'mcats'), npWant.tr.mcats),
        `steht: ${JSON.stringify(npRows(wSeq, 'mcats'))} — soll: ${JSON.stringify(npWant.tr.mcats)}`);
      wSeq.close();
    }

    /* ---- DER RUECKFALL SAGT, DASS ER EINER IST — 0.24.5 (F4) ---------- WO
       FUER DIE GEZEIGTE SPRACHE NICHTS EINGETRAGEN IST, steht der Name der
       Vorgabesprache da UND ein gedaempfter Vermerk daneben. */
    {
      const fbDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: npLanguages },
        categoryNames: npCategoryNames, criterionNames: npCriterionNames,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wFb = fbDom.w;
      await until(wFb, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wFb, 'inventory');
      await npPress(wFb, 'ncatlang', 'Türkçe');
      const fbRowOf = (boxId, name) => [...wFb.document.querySelectorAll(`#${boxId} .mrow`)]
        .find(z => (z.querySelector('.mname') || {}).textContent.trim() === name);
      const fbMark = (boxId, name) => {
        const row = fbRowOf(boxId, name);
        return row ? (row.querySelector('.mfallback') || {}).textContent || '' : '(Zeile fehlt)';
      };
      check('Rueckfallprobe: die Zeile ohne tuerkischen Namen traegt den Vermerk',
        /Deutsch/.test(fbMark('mcats', 'Material')), fbMark('mcats', 'Material'));
      check('Und dasselbe an der Kriterienkarte',
        /Deutsch/.test(fbMark('mcrits', 'Dann')), fbMark('mcrits', 'Dann'));
      /* UND DIE UEBERSETZTE ZEILE TRAEGT IHN NICHT. */
      check('Und die uebersetzte Zeile daneben traegt ihn nicht',
        fbMark('mcats', 'Alet') === '' && fbMark('mcrits', 'Birinci') === '',
        `Alet=${JSON.stringify(fbMark('mcats', 'Alet'))} ` +
        `Birinci=${JSON.stringify(fbMark('mcrits', 'Birinci'))}`);
      /* UND DAS UMBENENNFELD ZEIGT DEN RUECKFALL NICHT ALS WERT (B2 der Runde
         0.24.4, hier am Namen): wer das ✎ an einer Zeile ohne tuerkischen
         Namen oeffnet, findet ein LEERES Feld mit dem Rueckfall als
         Platzhalter. */
      const fbOpenPen = (boxId, name) => {
        /* GEKLAMMERT, UND ZWAR AUSDRUECKLICH: solange die Reparatur nicht
           steht, zeigt die Karte auf der Pille „Türkçe" die deutschen Namen
           -- die gesuchte Zeile ist dann gar nicht da. */
        const row = fbRowOf(boxId, name);
        const pen = row && row.querySelector('.ed');
        if (pen) pen.dispatchEvent(new wFb.Event('click', { bubbles: true }));
        return wFb.document.querySelector(`#${boxId} .medit`);
      };
      const fbField = fbOpenPen('mcats', 'Material');
      check('Und das Umbenennfeld steht leer, mit dem Rueckfall als Platzhalter',
        !!fbField && fbField.value === '' && fbField.placeholder === 'Material',
        fbField ? `Wert=${JSON.stringify(fbField.value)} Platzhalter=${JSON.stringify(fbField.placeholder)}`
                : 'kein Eingabefeld');
      /* UND AN DER UEBERSETZTEN ZEILE STEHT DAS EINGETRAGENE DARIN -- sonst
         waere die Zeile darueber auch mit einem Feld gruen, das IMMER leer
         ist, und das Umbenennen waere ein Neutippen. */
      await npPress(wFb, 'ncatlang', 'English');
      const fbField2 = fbOpenPen('mcats', 'Substance');
      check('Und an einer uebersetzten Zeile steht das Eingetragene im Feld',
        !!fbField2 && fbField2.value === 'Substance', fbField2 && fbField2.value);
      wFb.close();
    }

    /* ---- DAS UMBENENNEN AUF EINER FREMDEN PILLE — 0.24.5 -------------- WER
       AUF DER PILLE „Türkçe" UMBENENNT, LIEST DANACH WEITER TUERKISCH. */
    {
      const rnDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: npLanguages },
        categoryNames: npCategoryNames, criterionNames: npCriterionNames,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wRn = rnDom.w;
      await until(wRn, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wRn, 'inventory');
      await npPress(wRn, 'ncatlang', 'Türkçe');
      const rnRow = [...wRn.document.querySelectorAll('#mcats .mrow')]
        .find(z => (z.querySelector('.mname') || {}).textContent.trim() === 'Alet');
      const rnPen = rnRow && rnRow.querySelector('.ed');
      check('Aufbau: die tuerkische Zeile steht da und traegt ihr ✎', !!rnPen,
        rnRow ? 'kein ✎ an der Zeile' : `Zeilen: ${JSON.stringify(npRows(wRn, 'mcats'))}`);
      if (rnPen) {
        rnPen.dispatchEvent(new wRn.Event('click', { bubbles: true }));
        const rnField = wRn.document.querySelector('#mcats .medit');
        if (rnField) {
          rnField.value = 'Takım';
          rnField.dispatchEvent(new wRn.Event('blur', { bubbles: true }));
          await until(wRn, (x) => rnDom.sent.some(g => g.method === 'PUT' &&
            g.url === '/api/product-categories/21') && openRequests(x) === 0, 2000, 'das Umbenennen');
        }
        /* DER RUMPF NENNT DIE SPRACHE DER PILLE -- 0.24.3, Bauabschnitt 6a. */
        const rnPut = rnDom.sent.filter(g => g.method === 'PUT' &&
          g.url === '/api/product-categories/21').pop();
        check('Umbenennprobe: der Rumpf nennt die Sprache der Pille',
          !!rnPut && rnPut.body && rnPut.body.name === 'Takım' && rnPut.body.language === 'tr',
          JSON.stringify(rnPut && rnPut.body));
        /* UND DIE LISTE BLEIBT DANACH TUERKISCH. */
        check('Und die Liste bleibt danach in der Sprache der Pille',
          equal(npRows(wRn, 'mcats'), ['Takım', 'Material']),
          `steht: ${JSON.stringify(npRows(wRn, 'mcats'))} — soll: ["Takım","Material"]`);
        /* UND DER VERMERK STEHT WEITER AN DER ZEILE OHNE EINTRAG. */
        const rnMark = [...wRn.document.querySelectorAll('#mcats .mrow')]
          .find(z => (z.querySelector('.mname') || {}).textContent.trim() === 'Material');
        check('Und der Vermerk steht weiter an der Zeile ohne tuerkischen Namen',
          !!rnMark && !!rnMark.querySelector('.mfallback'),
          rnMark ? 'kein Vermerk' : 'keine Zeile „Material"');
        /* UND DIE PILLE STEHT NOCH AUF Türkçe. */
        check('Und die Pille steht danach immer noch auf Türkçe',
          [...(wRn.document.getElementById('ncatlang') || { children: [] }).children]
            .filter(b => b.className.includes('on')).map(b => pillName(b)).join('') === 'Türkçe',
          [...(wRn.document.getElementById('ncatlang') || { children: [] }).children]
            .map(b => pillName(b) + (b.className.includes('on') ? '*' : '')).join('|'));
      }
      wRn.close();
    }

    /* ---- WER NICHT VERWALTEN DARF, SIEHT DIE PILLENREIHE GAR NICHT ---- DIE
       ENTSCHEIDUNG DES BETREIBERS ZU F3, 8. */
    {
      const roDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'tr', languages: npLanguages,
                    isAdmin: false, isOwner: false },
        categoryNames: npCategoryNames, criterionNames: npCriterionNames,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wRo = roDom.w;
      await until(wRo, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wRo, 'inventory');
      check('Rollenprobe: der gewoehnliche Benutzer sieht keine Sprachzeile',
        ['ncatlang', 'mcrits-lang', 'mpcrits-lang', 'vlang']
          .every(id => !wRo.document.getElementById(id)),
        ['ncatlang', 'mcrits-lang', 'mpcrits-lang', 'vlang']
          .filter(id => wRo.document.getElementById(id)).join(' '));
      /* UND ER SIEHT DIE LISTE TROTZDEM, in SEINER Sprache. Ohne diese Zeile
         waere die darueber auch dann gruen, wenn die ganze Karte fehlte. */
      check('Und er sieht die Liste trotzdem — in seiner eigenen Sprache',
        equal(npRows(wRo, 'mcats'), npWant.tr.mcats), JSON.stringify(npRows(wRo, 'mcats')));
      wRo.close();
    }
  }

  /* DIE SCHRIFTGROESSE STEHT IN „Darstellung" UND DAMIT IN EINEM ANDEREN
     ABSCHNITT ALS DAS VOKABULAR: die Karte ist dieselbe
     geblieben, ihr Platz nicht. */
  await sysSection(w3, 'personal');
  const levels = [...w3.document.querySelectorAll('#fsize .pill')];
  check('Fuenf Schriftstufen zur Auswahl', levels.length === 5, `${levels.length}`);
  check('Aktuelle Stufe ist hervorgehoben',
    levels.find(b => b.classList.contains('on'))?.textContent === '120 %');
  levels[0].dispatchEvent(new w3.Event('click'));
  await until(w3, (x) => three.sent.some(s => s.method === 'PUT' && s.body &&
    s.body.font !== undefined) && openRequests(x) === 0, 2000, 'die gespeicherte Schriftstufe');
  check('Klick auf eine Stufe wirkt sofort',
    parseFloat(w3.document.documentElement.style.fontSize) === 12,
    `ist: ${w3.document.documentElement.style.fontSize}`);
  const saved = three.sent.filter(s => s.body && s.body.font !== undefined).pop();
  check('Stufe wird serverseitig gespeichert',
    saved && saved.method === 'PUT' && saved.body.font === 80,
    JSON.stringify(saved));

  /* --- Spitze Klammern im Vokabular duerfen kein HTML werden --- */
  w3.close();
  const four = buildDom(JSDOM, { settings: { filters: null, vocabulary: {
    entryOne: '<b id="boese">X</b>', entryMany: '<i id="boese2">Y</i>',
    testedYes: 'Ja', testedNo: 'Nein',
    dayOne: 'Z', dayMany: '<u id="boese3">Zs</u>'
  }}});
  const w4 = four.w;
  await until(w4, overviewReady, 2000, 'die Uebersicht');
  check('Uebersicht macht aus dem Vokabular kein HTML',
    !w4.document.getElementById('boese') && !w4.document.getElementById('boese2') &&
    !w4.document.getElementById('boese3') &&
    w4.document.getElementById('new').textContent.includes('<b id="boese">X</b>'),
    w4.document.getElementById('new').textContent);
  // Auch Karte, Detailansicht und Verwaltungsliste setzen Vokabelwoerter ein.
  w4.location.hash = '#/item/1';
  await until(w4, detailReady, 2000, 'die Detailansicht');
  check('Detailansicht macht aus dem Vokabular kein HTML',
    !w4.document.getElementById('boese') && !w4.document.getElementById('boese3'));
  await sysSection(w4, 'inventory');
  check('Systembereich macht aus dem Vokabular kein HTML',
    !w4.document.getElementById('boese2') && !w4.document.getElementById('boese3'));
  w4.close();

  /* --- Rueckfallprobe: Liste, Eintrag und Anmeldung — 0.24.0 -----------
     DASSELBE ZEICHEN, DIE ANDEREN DREI ANSICHTEN. */
  {
    const rf = buildDom(JSDOM, {});
    await until(rf.w, overviewReady, 2000, 'die Uebersicht');
    const rfText = () => rf.w.document.body.textContent || '';
    const rfFinding = [];
    const rfLook = (wo) => {
      const matched = (rfText().match(/\u27e6[^\u27e7]*\u27e7/g) || []);
      if (matched.length) rfFinding.push(`${wo}: ${[...new Set(matched)].slice(0, 4).join(' ')}`);
    };
    rfLook('Liste');
    const rfList = rfText().length;
    rf.w.location.hash = '#/item/1';
    await until(rf.w, detailReady, 2000, 'die Detailansicht');
    rfLook('Eintrag');
    const rfEntry = rfText().length;
    rf.w.showLogin();
    await until(rf.w, (x) => !!x.document.getElementById('lb') && openRequests(x) === 0, 2000,
      'die Anmeldeseite');
    rfLook('Anmeldung');
    check('Rueckfallprobe: kein ⟦…⟧ in Liste, Eintrag und Anmeldung',
      rfFinding.length === 0, rfFinding.join(' · '));
    check('Und die drei Ansichten tragen wirklich Text',
      rfList > 200 && rfEntry > 200 && rfText().length > 50,
      `${rfList} · ${rfEntry} · ${rfText().length} Zeichen`);
    /* UND DAS ZEICHEN WUERDE WIRKLICH AUFFALLEN: der Helfer setzt es, wenn
       ein Schluessel weder in der Sprache noch im Rueckfall steht. */
    check('Und ein fehlender Schluessel wuerde als ⟦…⟧ dastehen',
      rf.w.t('gibtesnicht.hier') === '\u27e6gibtesnicht.hier\u27e7',
      rf.w.t('gibtesnicht.hier'));
    rf.w.close();
  }

  /* ================= Zeitleiste ================= */
  /* ================= Die Karte sagt, wo Arbeit liegt — 0.25.0 ===========
     DIE VORGABE DES BETREIBERS, 9. */
  group('Die Karte sagt, wo Arbeit liegt — 0.25.0');
  {
    const axName = { de: 'Deutsch', en: 'English', tr: 'Türkçe' };
    const axLanguages = (base, without = []) => ['de', 'en', 'tr'].map(code =>
      ({ code, name: axName[code], isDefault: code === base,
         active: code === base || !without.includes(code) }));
    /* DIE ZEILE 21 IST DEUTSCH ANGELEGT UND HAT KEINE UEBERSETZUNG, die Zeile
       22 traegt alle drei Sprachen. */
    const AX_CATS = [{ id: 21, name: 'Grundname', usage_count: 2, language: 'de' },
                     { id: 22, name: 'Ueberall_de', usage_count: 0, language: 'de' }];
    const AX_NAMES = { en: { 22: 'Ueberall_en' }, tr: { 22: 'Ueberall_tr' } };
    /* GEKLAMMERT WIE npPress(): ein Rueckbau, der die Zeile oder den Knopf
       wegnimmt, muss die Zusagen darunter ROT machen und nicht den ganzen
       Lauf abreissen. */
    const axCell = (w, boxId, id) => {
      const row = [...w.document.querySelectorAll(`#${boxId} .mrow`)]
        .find(z => Number(z.dataset.mid) === id);
      if (!row) return { name: '(Zeile fehlt)', mark: '(Zeile fehlt)', faded: false, erase: false };
      const name = row.querySelector('.mname');
      return { name: ((name || {}).textContent || '').trim(),
               mark: ((row.querySelector('.mfallback') || {}).textContent || '').trim(),
               /* GEDAEMPFT HEISST: DAS FELD SAGT ES SELBST. */
               faded: !!name && name.classList.contains('back'),
               erase: !!row.querySelector('.mact.nx') };
    };
    const axPills = (w, boxId) => {
      const box = w.document.getElementById(boxId);
      return box ? [...box.querySelectorAll('.pill')] : [];
    };
    const axPress = async (w, boxId, name) => {
      const knob = axPills(w, boxId).find(b => pillName(b) === name);
      if (!knob) return false;
      knob.dispatchEvent(new w.Event('click', { bubbles: true }));
      await until(w, redrawn(boxId, knob.parentElement), 2000, `die Pillenreihe ${boxId}`);
      return true;
    };
    /* WAS AN EINER PILLE STEHT -- der Punkt oder die Zahl. `pillMark()` liest
       genau das eine Element, das dafuer da ist. */
    const axMarks = (w, boxId) => axPills(w, boxId)
      .map(b => `${pillName(b)}:${pillMark(b)}`).join(' ');
    /* OB DIE KACHEL EINEN RAHMEN TRAEGT. Gesucht wird von der Pillenreihe aus
       nach oben -- genau so setzt die Karte ihn auch. */
    const axFramed = (w, boxId) => {
      const box = w.document.getElementById(boxId);
      const card = box && box.closest ? box.closest('.sys-card') : null;
      return !!card && card.classList.contains('gaps');
    };
    /* DER KNOPF „Standard" IN DER KARTE „Sprachen" -- derselbe Weg, den der
       Betreiber gegangen ist. */
    const axSetDefault = async (w, code) => {
      const row = [...w.document.querySelectorAll('#langs .engine')]
        .find(z => z.dataset.k === code);
      const knob = row && row.querySelector('.sdefault');
      if (!knob) return false;
      knob.dispatchEvent(new w.Event('click', { bubbles: true }));
      await until(w, (x) => {
        const now = [...x.document.querySelectorAll('#langs .engine')].find(z => z.dataset.k === code);
        return !!now && now !== row && openRequests(x) === 0;
      }, 2000, 'die neu gezeichnete Sprachliste');
      return true;
    };
    /* WAS EIN VERMERK SAGEN DARF: genau die eine erwartete Sprache und keine
       der beiden anderen. */
    const AX_ALL_NAMES = ['Deutsch', 'English', 'Türkçe'];
    /* UND SEIT 0.25.1 NENNT DER SATZ ZWEI SPRACHEN. */
    const axMarkOk = (mark, wanted, missing) => {
      if (wanted === null) return mark === '';
      if (wanted === '') return mark !== '' && AX_ALL_NAMES.every(n => !mark.includes(n));
      const named = [wanted, ...(missing ? [missing] : [])];
      return named.every(n => mark.includes(n)) &&
        AX_ALL_NAMES.filter(n => !named.includes(n)).every(n => !mark.includes(n));
    };

    /* ---- DIE NEUN ZELLEN, MIT DEM SOLLWERT DIESER RUNDE --------------- DIE
       ZEILE 21 IST DEUTSCH, und das bleibt sie, gleichgueltig welche Sprache
       Vorgabe ist. */
    let axCells = 0;
    for (const std of ['de', 'en', 'tr']) {
      const axDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: axLanguages('de') },
        categories: AX_CATS.map(z => ({ ...z })), categoryNames: AX_NAMES,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wAx = axDom.w;
      await until(wAx, overviewReady, 2000, 'die Uebersicht');
      /* ZUERST DER WECHSEL, DANN DIE KARTE. */
      await sysSection(wAx, 'installation');
      const axSwitched = await axSetDefault(wAx, std);
      check(`Aufbau (Vorgabe → ${axName[std]}): der Knopf „Standard" steht da und ist gedrueckt`,
        axSwitched, 'kein Knopf „Standard" in der Karte „Sprachen"');
      /* UND DIE KARTE HAT DEN WECHSEL WIRKLICH GESCHICKT. */
      const axPut = axDom.sent.filter(g => g.method === 'PUT' && g.url === '/api/settings' &&
        g.body && g.body.languageDefault !== undefined).pop();
      check(`Und der Rumpf nennt die neue Vorgabesprache (${axName[std]})`,
        !!axPut && axPut.body.languageDefault === std, JSON.stringify(axPut && axPut.body));
      await sysSection(wAx, 'inventory');
      for (const pill of ['de', 'en', 'tr']) {
        if (!await axPress(wAx, 'ncatlang', axName[pill])) {
          check(`Die Pille ${axName[pill]} steht da (Vorgabe ${axName[std]})`, false,
            'keine Pillenreihe an der Karte „Kategorien"');
          continue;
        }
        axCells++;
        /* DER SOLLWERT: der Name der Grundzeile steht da -- und der Vermerk
           nennt DEUTSCH, weil die Zeile deutsch angelegt ist. */
        const cell = axCell(wAx, 'mcats', 21);
        const wantMark = pill === 'de' ? null : 'Deutsch';
        check(`Zelle: Vorgabe ${axName[std]}, Pille ${axName[pill]} — Name und genannte Sprache`,
          cell.name === 'Grundname' && axMarkOk(cell.mark, wantMark, axName[pill]),
          `steht: ${JSON.stringify(cell)} — soll: Name "Grundname", ` +
          `Vermerk ${wantMark === null ? '(keiner)' : JSON.stringify(wantMark)}`);
        /* UND DER NAME IST GEDAEMPFT, WO ER GELIEHEN IST -- die dritte
           Vorgabe des Betreibers. */
        check(`Und die Daempfung folgt dem Rueckfall (Vorgabe ${axName[std]}, Pille ${axName[pill]})`,
          cell.faded === (pill !== 'de'),
          `gedaempft: ${cell.faded} — soll: ${pill !== 'de'}`);
        /* UND DIE VERGLEICHSZEILE DANEBEN. */
        const both = axCell(wAx, 'mcats', 22);
        check(`Vergleichszelle: Vorgabe ${axName[std]}, Pille ${axName[pill]} — die gepflegte Zeile`,
          both.name === `Ueberall_${pill}` && both.mark === '',
          `steht: ${JSON.stringify(both)} — soll: ${JSON.stringify(`Ueberall_${pill}`)} ohne Vermerk`);
      }
      wAx.close();
    }
    /* UND ES WAREN WIRKLICH NEUN. */
    check('Die zweite Achse hat wirklich neun Zellen — drei Vorgabesprachen × drei Pillen',
      axCells === 9, `${axCells} Zellen`);

    /* ---- PUNKT UND ZAHL AN DER PILLE, UND DER RAHMEN AN DER KACHEL -----
       DIE LAGE: Zeile 21 ist nur deutsch da, Zeile 22 in allen dreien. */
    {
      const pzDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: axLanguages('de') },
        categories: AX_CATS.map(z => ({ ...z })), categoryNames: AX_NAMES,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wPz = pzDom.w;
      await until(wPz, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wPz, 'inventory');
      check('Pillenprobe: die vollstaendige Sprache traegt den Punkt, jede andere ihre Zahl',
        axMarks(wPz, 'ncatlang') === 'Deutsch:● English:1 Türkçe:1',
        axMarks(wPz, 'ncatlang'));
      /* UND DIE ZAHL IST DIE DER FEHLENDEN ZELLEN und nicht die der Zeilen. */
      check('Und die Zahl zaehlt die fehlenden Zellen dieser Kachel, nicht die Zeilen',
        axMarks(wPz, 'mcrits-lang') === 'Deutsch:● English:2 Türkçe:2',
        axMarks(wPz, 'mcrits-lang'));
      /* DER RAHMEN GILT DER GEZEIGTEN SPRACHE (F3). Auf Deutsch ist nichts
         offen -- kein Rahmen; auf Englisch fehlt eine Zelle -- Rahmen. */
      check('Rahmenprobe: auf der vollstaendigen Sprache steht kein Rahmen',
        !axFramed(wPz, 'ncatlang'), 'die Kachel traegt den Rahmen trotzdem');
      await axPress(wPz, 'ncatlang', 'English');
      check('Und auf einer lueckigen Sprache steht er',
        axFramed(wPz, 'ncatlang'), 'die Kachel traegt keinen Rahmen');
      /* UND DIE KRITERIENKACHEL GEHT MIT -- es ist EIN Umschalter fuer den
         ganzen Abschnitt, und beide Kriterienkarten zeigen dieselbe Sprache. */
      check('Und die beiden Kriterienkacheln gehen mit',
        axFramed(wPz, 'mcrits-lang') && axFramed(wPz, 'mpcrits-lang'),
        `mcrits=${axFramed(wPz, 'mcrits-lang')} mpcrits=${axFramed(wPz, 'mpcrits-lang')}`);
      wPz.close();
    }

    /* ---- DAS ✕ AM FELD — 0.25.0 (F5) ---------------------------------- ES
       STEHT NUR, WO ETWAS EINGETRAGEN IST. */
    {
      const xDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: axLanguages('de') },
        categories: AX_CATS.map(z => ({ ...z })), categoryNames: AX_NAMES,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wX = xDom.w;
      await until(wX, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wX, 'inventory');
      await axPress(wX, 'ncatlang', 'English');
      check('Zeichenprobe: das ✕ steht an der Zeile mit englischem Eintrag',
        axCell(wX, 'mcats', 22).erase, 'kein ✕ an der Zeile 22');
      check('Und nicht an der Zeile, die auf den Rueckfall faellt',
        !axCell(wX, 'mcats', 21).erase, 'ein ✕ an einer Zeile ohne Eintrag');
      /* UND AUF DER SPRACHE DER ZEILE SELBST STEHT ES AUCH NICHT: dort ist der
         Name der ORIGINALTEXT, und `name` ist `NOT NULL`. */
      await axPress(wX, 'ncatlang', 'Deutsch');
      check('Und nicht am Originaltext — er ist der Name der Zeile',
        !axCell(wX, 'mcats', 21).erase && !axCell(wX, 'mcats', 22).erase,
        `21=${axCell(wX, 'mcats', 21).erase} 22=${axCell(wX, 'mcats', 22).erase}`);
      await axPress(wX, 'ncatlang', 'English');
      const xBefore = axMarks(wX, 'ncatlang');
      const xRow = [...wX.document.querySelectorAll('#mcats .mrow')]
        .find(z => Number(z.dataset.mid) === 22);
      const xKnob = xRow && xRow.querySelector('.mact.nx');
      /* MIT RUECKFRAGE, wie jeder Griff, der etwas wegnimmt (F5). */
      const xTranscript = [];
      const xWatch = placeConfirm(wX, true, xTranscript);
      if (xKnob) {
        xKnob.dispatchEvent(new wX.Event('click', { bubbles: true }));
        await until(wX, (x) => xDom.sent.some(g => g.method === 'PUT' &&
          g.url === '/api/product-categories/22') && openRequests(x) === 0, 2000, 'der geraeumte Name');
      }
      xWatch.disconnect();
      /* UND DIE RUECKFRAGE NENNT DIE SPRACHE, die geraeumt wird. Ein Dialog,
         der nicht sagt, WAS er wegnimmt, ist keine Rueckfrage. */
      check('Und die Rueckfrage nennt die Sprache, die geraeumt wird',
        xTranscript.some(z => z.includes('English')), JSON.stringify(xTranscript));
      const xPut = xDom.sent.filter(g => g.method === 'PUT' &&
        g.url === '/api/product-categories/22').pop();
      check('Raeumprobe: der Rumpf sagt „raeumen" und nennt die Sprache der Pille',
        !!xPut && xPut.body && xPut.body.clearName === true && xPut.body.language === 'en' &&
        xPut.body.name === undefined,
        JSON.stringify(xPut && xPut.body));
      check('Und der Eintrag ist danach wirklich weg',
        ((xDom.categoryNames || {}).en || {})[22] === undefined,
        JSON.stringify((xDom.categoryNames || {}).en));
      check('Und die Zahl an der Pille steigt um eins',
        xBefore === 'Deutsch:● English:1 Türkçe:1' &&
        axMarks(wX, 'ncatlang') === 'Deutsch:● English:2 Türkçe:1',
        `vorher: ${xBefore} — nachher: ${axMarks(wX, 'ncatlang')}`);
      /* UND DIE ZEILE STEHT DANACH ALS RUECKFALL DA -- nicht leer und nicht
         geloescht: geraeumt wurde ein NAME und nicht die Zeile. */
      const xCell = axCell(wX, 'mcats', 22);
      check('Und die Zeile faellt auf die Kette zurueck, statt zu verschwinden',
        xCell.name === 'Ueberall_de' && axMarkOk(xCell.mark, 'Deutsch', 'English') && xCell.faded,
        JSON.stringify(xCell));
      wX.close();
    }

    /* ---- DIE UNBEKANNTE ERSTELLUNGSSPRACHE — 0.25.0 (F2) -------------- DER
       BESTAND NACH DER MIGRATION: die Spalte ist da und leer. */
    {
      const ukDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: axLanguages('de') },
        categories: AX_CATS.map(z => ({ ...z, language: null })), categoryNames: null,
        criteriaLanguages: [null, null, null],
        criteriaPhases: ['after', 'after', 'before']
      });
      const wUk = ukDom.w;
      await until(wUk, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wUk, 'inventory');
      const ukBox = () => wUk.document.getElementById('nunknown');
      check('Nachfrageprobe: der Kasten steht da und nennt die Zahl ueber beide Tafeln',
        !!ukBox() && !ukBox().hidden && /5/.test(ukBox().textContent),
        ukBox() ? `hidden=${ukBox().hidden} · ${ukBox().textContent.trim()}` : 'kein Kasten');
      check('Und es ist genau EIN Knopf',
        !!ukBox() && ukBox().querySelectorAll('button').length === 1,
        ukBox() ? `${ukBox().querySelectorAll('button').length} Knoepfe` : 'kein Kasten');
      /* UND JEDE ZEILE STEHT ALS ORIGINALTEXT DA -- der vierte Schritt der
         Kette, und er nennt KEINE Sprache. */
      const ukCell = axCell(wUk, 'mcats', 21);
      check('Und die Zeile traegt den Originaltext ohne genannte Sprache',
        ukCell.name === 'Grundname' && axMarkOk(ukCell.mark, ''), JSON.stringify(ukCell));
      /* UND DER KNOPF ORDNET WIRKLICH ZU. Ohne die zweite Haelfte waere er ein
         Knopf, der etwas schickt und nichts bewirkt. */
      const ukKnob = ukBox() && ukBox().querySelector('button');
      if (ukKnob) {
        ukKnob.dispatchEvent(new wUk.Event('click', { bubbles: true }));
        await until(wUk, (x) => ukDom.sent.some(g => g.method === 'PUT' &&
          g.url === '/api/names/language') && openRequests(x) === 0, 2000, 'die zugeordnete Sprache');
      }
      const ukPut = ukDom.sent.filter(g => g.method === 'PUT' &&
        g.url === '/api/names/language').pop();
      check('Zuordnungsprobe: der Rumpf nennt die Sprache der Pille',
        !!ukPut && ukPut.body && ukPut.body.language === 'de', JSON.stringify(ukPut && ukPut.body));
      check('Und danach ist der Kasten weg',
        !!ukBox() && ukBox().hidden, ukBox() ? ukBox().textContent.trim() : 'kein Kasten');
      const ukAfter = axCell(wUk, 'mcats', 21);
      check('Und die Zeile steht danach als deutscher Eintrag da',
        ukAfter.name === 'Grundname' && ukAfter.mark === '' && !ukAfter.faded,
        JSON.stringify(ukAfter));
      check('Und die deutsche Pille ist danach vollstaendig',
        axMarks(wUk, 'ncatlang').startsWith('Deutsch:●'), axMarks(wUk, 'ncatlang'));
      wUk.close();
    }

    /* ---- DIE KACHEL „VOKABULAR" MIT DENSELBEN ZUSAGEN — 0.25.0 --------
       „Das gilt natürlich auch für Vokabular."* -- der Betreiber, 9. */
    {
      const vgOwn = { de: { entryOne: 'Maschine' }, en: {}, tr: {} };
      const vgDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: axLanguages('de'),
                    vocabulariesOwn: vgOwn },
        criteriaPhases: ['after', 'after', 'before']
      });
      const wVg = vgDom.w;
      await until(wVg, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wVg, 'inventory');
      /* FUENFZEHN WOERTER SEIT 0.32.0, EINES EINGETRAGEN: Deutsch fehlen
         vierzehn, den beiden anderen alle fuenfzehn. */
      check('Vokabelprobe: Punkt und Zahl stehen auch an der Kachel „Vokabular"',
        axMarks(wVg, 'vlang') === 'Deutsch:14 English:15 Türkçe:15',
        axMarks(wVg, 'vlang'));
      check('Und die Kachel traegt den Rahmen, solange der gezeigten Sprache etwas fehlt',
        axFramed(wVg, 'vlang'), 'kein Rahmen an der Kachel „Vokabular"');
      /* UND DAS LEERE FELD IST GEDAEMPFT MARKIERT, das gefuellte nicht. */
      const vgField = (n) => {
        const box = wVg.document.getElementById(`v${n}`);
        const field = box && box.closest ? box.closest('.field') : null;
        return !!field && field.classList.contains('gap');
      };
      check('Und die fehlenden Zellen sind gedaempft markiert, die gefuellte nicht',
        vgField(1) === false && vgField(2) === true && vgField(14) === true,
        `v1=${vgField(1)} v2=${vgField(2)} v14=${vgField(14)}`);
      wVg.close();
    }
    /* UND EINE VOLLSTAENDIGE SPRACHE TRAEGT KEINEN RAHMEN. */
    {
      const vfWords = Object.fromEntries(['entryOne', 'entryMany', 'testedYes', 'testedNo',
        'dayOne', 'dayMany', 'reportOne', 'reportMany', 'taskOne', 'taskMany', 'taskDone',
        'potential', 'ratingOne', 'ratingMany', 'grade'].map(k => [k, 'X']));
      const vfDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: axLanguages('de'),
                    vocabulariesOwn: { de: vfWords, en: vfWords, tr: vfWords } },
        criteriaPhases: ['after', 'after', 'before']
      });
      const wVf = vfDom.w;
      await until(wVf, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wVf, 'inventory');
      check('Und eine vollstaendige Kachel „Vokabular" traegt Punkte und keinen Rahmen',
        axMarks(wVf, 'vlang') === 'Deutsch:● English:● Türkçe:●' && !axFramed(wVf, 'vlang'),
        `${axMarks(wVf, 'vlang')} · Rahmen=${axFramed(wVf, 'vlang')}`);
      wVf.close();
    }

    /* ---- DIE ANSAGE NACH DEM UMSCHALTEN — 0.25.0 (F4) -----------------
       „wir nehmen nicht die Glocke, sondern Rahmen"* -- der Betreiber, 9. */
    {
      const anDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: axLanguages('de'),
                    vocabulariesOwn: { de: { entryOne: 'Maschine' }, en: {}, tr: {} } },
        categories: AX_CATS.map(z => ({ ...z })), categoryNames: AX_NAMES,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wAn = anDom.w;
      await until(wAn, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wAn, 'installation');
      const anHint = () => {
        const box = wAn.document.getElementById('langs');
        const hint = box && box.querySelector('.langnote');
        return hint ? (hint.textContent || '').trim() : '';
      };
      check('Ansageprobe: mit der deutschen Vorgabe steht schon eine Ansage da',
        anHint().includes('Deutsch') && /14/.test(anHint()), JSON.stringify(anHint()));
      await axSetDefault(wAn, 'tr');
      /* NACH DEM WECHSEL: Tuerkisch fehlen vier Namen (die Zeile 21 in beiden
         Kriterienkarten und die Kategorie 21 -- alles, was nur deutsch da
         ist) und alle fuenfzehn Vokabelwoerter. */
      check('Und nach dem Wechsel nennt sie die neue Vorgabesprache und beide Zahlen',
        anHint().includes('Türkçe') && /4/.test(anHint()) && /15/.test(anHint()),
        JSON.stringify(anHint()));
      /* DER SPRACHNAME TRAEGT EINE KLASSE MIT REGEL -- 0.35.0, BA 1. Bis
         dahin stand dort `ename`, und dafuer gibt es in public/style.css
         keine Regel; die beiden anderen Listen mit derselben Zeilenform
         setzen `engine-name`. */
      {
        const anRow = [...wAn.document.querySelectorAll('#langs .engine')]
          .find(z => z.dataset.k === 'de');
        const anName = anRow && anRow.querySelector('.engine-name');
        check('Der Sprachname traegt engine-name und nicht ename',
          !!anName && (anName.textContent || '').trim() === 'Deutsch'
          && !anRow.querySelector('.ename'),
          anRow ? anRow.innerHTML.slice(0, 120) : 'keine Sprachzeile');
        check('Und zu dieser Klasse gibt es eine Regel im Stilblatt',
          /\.engine-name\s*\{/.test(fs.readFileSync(
            path.join(__dirname, 'public', 'style.css'), 'utf8')),
          'keine Regel .engine-name');
      }
      wAn.close();
    }
    /* UND SIE STEHT NICHT DA, WENN NICHTS FEHLT. Ein Satz, der immer dasteht,
       sagt nichts mehr -- dieselbe Ueberlegung wie beim Rahmen. */
    {
      const avWords = Object.fromEntries(['entryOne', 'entryMany', 'testedYes', 'testedNo',
        'dayOne', 'dayMany', 'reportOne', 'reportMany', 'taskOne', 'taskMany', 'taskDone',
        'potential', 'ratingOne', 'ratingMany', 'grade'].map(k => [k, 'X']));
      const avDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de',
                    languages: [{ code: 'de', name: 'Deutsch', isDefault: true, active: true }],
                    vocabulariesOwn: { de: avWords, en: avWords, tr: avWords } },
        criteriaPhases: ['after', 'after', 'before']
      });
      const wAv = avDom.w;
      await until(wAv, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wAv, 'installation');
      const avBox = wAv.document.getElementById('langs');
      check('Und sie steht nicht da, wenn der Vorgabesprache nichts fehlt',
        !!avBox && !avBox.querySelector('.langnote'),
        avBox ? (avBox.textContent || '').trim().slice(0, 80) : 'keine Karte „Sprachen"');
      wAv.close();
    }
    /* ---- KEIN ZWEITER ABRUF — 0.24.6 (F4) ----------------------------- DIE
       TAFELN KOMMEN AUS DER ANTWORT DES WECHSELS und nicht aus einem zweiten
       `GET /api/settings` daneben. */
    {
      const nzDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: axLanguages('de') },
        categories: AX_CATS.map(z => ({ ...z })), categoryNames: AX_NAMES,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wNz = nzDom.w;
      await until(wNz, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wNz, 'installation');
      const nzBefore = nzDom.sent.filter(g => (g.method || 'GET') === 'GET' &&
        g.url === '/api/settings').length;
      await axSetDefault(wNz, 'tr');
      const nzAfter = nzDom.sent.filter(g => (g.method || 'GET') === 'GET' &&
        g.url === '/api/settings').length;
      check('Kein zweiter Abruf: der Wechsel holt die Tafeln nicht nach',
        nzAfter === nzBefore, `${nzBefore} → ${nzAfter} Abrufe von GET /api/settings`);
      wNz.close();
    }

    /* ---- DAS GEWICHT BENENNT NICHTS UM — 0.24.6 ---------------------- EIN
       BEFUND, DEN DER AUFTRAG NICHT KANNTE, gefunden beim Gegenlesen des
       eigenen Diffs. */
    {
      const gwLanguages = axLanguages('de');
      const gwNames = { en: { 7: 'First', 9: 'Last' }, tr: { 7: 'Birinci' } };
      const gwDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: gwLanguages },
        criterionNames: gwNames, criteriaPhases: ['after', 'after', 'before']
      });
      const wGw = gwDom.w;
      await until(wGw, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wGw, 'inventory');
      await axPress(wGw, 'mcrits-lang', 'English');
      const gwRow = [...wGw.document.querySelectorAll('#mcrits .mrow')]
        .find(z => Number(z.dataset.mid) === 7);
      const gwField = gwRow && gwRow.querySelector('.mweight-field');
      check('Aufbau: die Zeile steht auf der englischen Pille und traegt ihr Gewichtsfeld',
        !!gwField && (gwRow.querySelector('.mname') || {}).textContent.trim() === 'First',
        gwRow ? `Name=${(gwRow.querySelector('.mname') || {}).textContent}` : 'keine Zeile 7');
      if (gwField) {
        gwField.value = '1,5';
        gwField.dispatchEvent(new wGw.Event('change', { bubbles: true }));
        await until(wGw, (x) => gwDom.sent.some(g => g.method === 'PUT' &&
          g.url === '/api/criteria/7') && openRequests(x) === 0, 2000, 'das gespeicherte Gewicht');
        const gwPut = gwDom.sent.filter(g => g.method === 'PUT' &&
          g.url === '/api/criteria/7').pop();
        check('Gewichtsprobe: der Rumpf nennt die Sprache, aus der der Name stammt',
          !!gwPut && gwPut.body && gwPut.body.language === 'en',
          JSON.stringify(gwPut && gwPut.body));
        /* UND DER BESTAND IST UNVERAENDERT. Bis 0.24.5 stand hier danach
           „First" in der Grundzeile. */
        check('Und die Grundzeile heisst danach immer noch, wie sie hiess',
          (gwDom.criteria.find(c => c.id === 7) || {}).name === 'Zuerst',
          JSON.stringify((gwDom.criteria.find(c => c.id === 7) || {}).name));
        check('Und das Gewicht ist wirklich angekommen',
          (gwDom.criteria.find(c => c.id === 7) || {}).weight === 1.5,
          JSON.stringify((gwDom.criteria.find(c => c.id === 7) || {}).weight));
      }
      /* UND AN EINER ZEILE MIT RUECKFALL: der Name stammt aus einer DRITTEN
         Tafel, und der Rumpf muss DIESE nennen -- mit der Pille als Angabe
         machte das Speichern aus dem Rueckfall einen Eintrag (B2 der Runde
         0.24.4, an einem Feld, das gar keinen Namen aendern will). */
      await axPress(wGw, 'mcrits-lang', 'Türkçe');
      const gwBack = [...wGw.document.querySelectorAll('#mcrits .mrow')]
        .find(z => Number(z.dataset.mid) === 8);
      const gwBackField = gwBack && gwBack.querySelector('.mweight-field');
      check('Aufbau: die Zeile ohne tuerkischen Namen steht als Rueckfall da',
        !!gwBackField && !!gwBack.querySelector('.mfallback'),
        gwBack ? 'kein Vermerk oder kein Feld' : 'keine Zeile 8');
      if (gwBackField) {
        gwBackField.value = '0,8';
        gwBackField.dispatchEvent(new wGw.Event('change', { bubbles: true }));
        await until(wGw, (x) => gwDom.sent.some(g => g.method === 'PUT' &&
          g.url === '/api/criteria/8') && openRequests(x) === 0, 2000, 'das gespeicherte Gewicht');
        const gwPut2 = gwDom.sent.filter(g => g.method === 'PUT' &&
          g.url === '/api/criteria/8').pop();
        check('Rueckfallprobe: der Rumpf nennt die Sprache des Rueckfalls und nicht die der Pille',
          !!gwPut2 && gwPut2.body && gwPut2.body.language === 'de',
          JSON.stringify(gwPut2 && gwPut2.body));
        check('Und es ist kein tuerkischer Eintrag daraus geworden',
          ((gwDom.criterionNames || {}).tr || {})[8] === undefined,
          JSON.stringify((gwDom.criterionNames || {}).tr));
      }
      wGw.close();
    }

    /* ================= Jede Kachel zaehlt ihre eigene Arbeit — 0.25.1 =====
       DER BEFUND DES BETREIBERS, 10. September 2026, am eingespielten 0.25.0:
       „die zahl in der sprachen pille ist das eine zahl pro kachel oder fuer
       alle? */
    group('Jede Kachel zaehlt ihre eigene Arbeit — 0.25.1');
    {
      const kzDom = buildDom(JSDOM, {
        settings: { filters: null, language: 'de', languages: axLanguages('de') },
        categories: AX_CATS.map(z => ({ ...z })), categoryNames: AX_NAMES,
        criteriaPhases: ['after', 'after', 'before'],
        criterionNames: { en: { 7: 'First', 8: 'Then' }, tr: { 9: 'Sonuncu' } }
      });
      const wKz = kzDom.w;
      await until(wKz, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wKz, 'inventory');
      /* DER AUFBAU ZUERST. Ohne ihn belegten die Zahlen darunter nichts: eine
         Kachel, die gar keine Liste hat, zaehlt auch keine Luecken. */
      const kzRows = (boxId) => [...wKz.document.querySelectorAll(`#${boxId} .mrow`)].length;
      check('Aufbau: die beiden Kriterienkacheln stehen mit zwei und einer Zeile da',
        kzRows('mcrits') === 2 && kzRows('mpcrits') === 1,
        `mcrits=${kzRows('mcrits')} mpcrits=${kzRows('mpcrits')}`);
      check('Die Pille ueber „Bewertung" nennt nur die Luecken dieser Kachel',
        axMarks(wKz, 'mcrits-lang') === 'Deutsch:● English:● Türkçe:2',
        axMarks(wKz, 'mcrits-lang'));
      check('Und die Pille ueber „Potenzial" nennt ihre eigenen — eine andere Zahl',
        axMarks(wKz, 'mpcrits-lang') === 'Deutsch:● English:1 Türkçe:●',
        axMarks(wKz, 'mpcrits-lang'));
      /* UND DIE BEIDEN REIHEN SAGEN NICHT DASSELBE. */
      check('Und die beiden Pillenreihen sagen NICHT dasselbe',
        axMarks(wKz, 'mcrits-lang') !== axMarks(wKz, 'mpcrits-lang'),
        `beide: ${axMarks(wKz, 'mcrits-lang')}`);
      /* UND DIE KACHEL „KATEGORIEN" ZAEHLT WEITER IHRE EIGENE TAFEL. */
      check('Und die Kachel „Kategorien" zaehlt weiter ihre eigene Tafel',
        axMarks(wKz, 'ncatlang') === 'Deutsch:● English:1 Türkçe:1',
        axMarks(wKz, 'ncatlang'));

      /* ---- UND DER RAHMEN FOLGT DERSELBEN ZAHL -------------------------
         Auf Tuerkisch ist die Bewertungskachel lueckig und die
         Potenzialkachel vollstaendig -- genau EINE von beiden traegt den
         Rahmen. */
      await axPress(wKz, 'mcrits-lang', 'Türkçe');
      check('Rahmenprobe: auf Türkçe traegt „Bewertung" den Rahmen',
        axFramed(wKz, 'mcrits-lang'), 'kein Rahmen an der lueckigen Kachel');
      check('Und „Potenzial" traegt ihn nicht — dort ist nichts offen',
        !axFramed(wKz, 'mpcrits-lang'), 'Rahmen an der vollstaendigen Kachel');
      /* UND ANDERSHERUM. Ohne diese zweite Haelfte bliebe eine Karte gruen,
         die den Rahmen einfach immer an dieselbe Kachel haengt. */
      await axPress(wKz, 'mcrits-lang', 'English');
      check('Und auf English ist es umgekehrt: „Potenzial" traegt ihn',
        axFramed(wKz, 'mpcrits-lang') && !axFramed(wKz, 'mcrits-lang'),
        `mcrits=${axFramed(wKz, 'mcrits-lang')} mpcrits=${axFramed(wKz, 'mpcrits-lang')}`);

      /* ---- UND DAS NEUZEICHNEN HAELT DIE TRENNUNG — 0.25.1 -------------
         DIE PILLENREIHEN ENTSTEHEN AN ZWEI STELLEN: beim Aufbau der Karte
         (`setUpCriteriaOut`) und beim Neuzeichnen nach einem Griff
         (`drawAdmin`, ueber `adminNew`). */
      await axPress(wKz, 'mpcrits-lang', 'Türkçe');
      const kzVorP = axMarks(wKz, 'mpcrits-lang');
      const kzVorB = axMarks(wKz, 'mcrits-lang');
      const kzNine = [...wKz.document.querySelectorAll('#mpcrits .mrow')]
        .find(z => Number(z.dataset.mid) === 9);
      const kzX = kzNine && kzNine.querySelector('.mact.nx');
      /* MIT RUECKFRAGE, wie jeder Griff, der etwas wegnimmt (F5). Ohne den
         Beobachter bliebe der Dialog stehen und der Rumpf ginge nie hinaus. */
      const kzWatch = placeConfirm(wKz, true, []);
      if (kzX) {
        kzX.dispatchEvent(new wKz.Event('click', { bubbles: true }));
        await until(wKz, (x) => kzDom.sent.some(g => g.method === 'PUT' &&
          g.url === '/api/criteria/9') && openRequests(x) === 0, 2000, 'der geraeumte Name');
      }
      kzWatch.disconnect();
      check('Raeumprobe: der tuerkische Eintrag des Potenzialkastens ist weg',
        !!kzX && ((kzDom.criterionNames || {}).tr || {})[9] === undefined,
        kzX ? JSON.stringify((kzDom.criterionNames || {}).tr) : 'kein ✕ an der Zeile 9');
      check('Und nach dem Neuzeichnen steht an „Potenzial" eine 1 statt des Punktes',
        kzVorP === 'Deutsch:● English:1 Türkçe:●' &&
        axMarks(wKz, 'mpcrits-lang') === 'Deutsch:● English:1 Türkçe:1',
        `vorher: ${kzVorP} — nachher: ${axMarks(wKz, 'mpcrits-lang')}`);
      check('Und „Bewertung" steht unveraendert auf 2 — auch das Neuzeichnen trennt',
        kzVorB === axMarks(wKz, 'mcrits-lang') &&
        axMarks(wKz, 'mcrits-lang') === 'Deutsch:● English:● Türkçe:2',
        `vorher: ${kzVorB} — nachher: ${axMarks(wKz, 'mcrits-lang')}`);

      /* ---- DER VERMERK HAT DIE VOLLE BREITE — 0.25.1 -------------------
         DER ZWEITE BEFUND DESSELBEN TAGES: „warum ist der untere text mit dem
         hinweis im ersten kachel volltaendig zu sehen und in den beiden
         andren nicht?" WEIL ER IN DER NAMENSSPALTE SASS. */
      await axPress(wKz, 'ncatlang', 'Türkçe');
      const kzBack = [...wKz.document.querySelectorAll('#mcats .mrow')]
        .find(z => Number(z.dataset.mid) === 21);
      const kzMark = kzBack && kzBack.querySelector('.mfallback');
      check('Der Vermerk haengt an der ZEILE und nicht mehr im Namenskasten',
        !!kzMark && kzMark.parentElement === kzBack,
        kzMark ? `haengt an .${kzMark.parentElement.className}` : 'kein Vermerk an Zeile 21');
      /* UND ER IST IHR LETZTES KIND. */
      check('Und er ist ihr LETZTES Kind',
        !!kzBack && kzBack.lastElementChild === kzMark,
        kzBack ? `letztes Kind: .${(kzBack.lastElementChild || {}).className}` : 'keine Zeile 21');
      check('Und den Namenskasten gibt es nicht mehr',
        !wKz.document.querySelector('.mnamebox'),
        'es steht noch ein .mnamebox in der Karte');
      check('Und die Zeile mit Vermerk traegt den Umbruch',
        !!kzBack && kzBack.classList.contains('withback'),
        kzBack ? kzBack.className : 'keine Zeile 21');
      /* UND EINE ZEILE OHNE VERMERK TRAEGT IHN NICHT: ein Merkmal, das an
         jeder Zeile steht, sagt nichts mehr. */
      const kzFull = [...wKz.document.querySelectorAll('#mcats .mrow')]
        .find(z => Number(z.dataset.mid) === 22);
      check('Und eine Zeile ohne Vermerk traegt ihn nicht',
        !!kzFull && !kzFull.classList.contains('withback'),
        kzFull ? kzFull.className : 'keine Zeile 22');

      /* ---- UND DER SATZ NENNT BEIDE SPRACHEN — 0.25.1 ------------------
         DER DRITTE BEFUND: „ist irgendwie ein nicht klarer satz. */
      const kzText = kzMark ? (kzMark.textContent || '') : '';
      check('Der Vermerk nennt die fehlende UND die gezeigte Sprache',
        kzText.includes('Türkçe') && kzText.includes('Deutsch'), JSON.stringify(kzText));
      check('Und er nennt die dritte Sprache nicht',
        kzText !== '' && !kzText.includes('English'), JSON.stringify(kzText));
      wKz.close();
    }


    /* ================= Ein Leser, der anders liest — 0.25.2 ==============
       DER BEFUND DES BETREIBERS, 10. September 2026, an einer TUERKISCHEN
       Oberflaeche: „wenn kriterion selber auf türkisch steht, dann wird
       unwahrheit angezeigt. */
    group('Ein Leser, der anders liest — 0.25.2');
    {
      /* 31 nur deutsch, 32 deutsch mit englischer Uebersetzung, 33 in allen
         dreien. */
      const alCats = [{ id: 31, name: 'Nur_de', usage_count: 0, language: 'de' },
                      { id: 32, name: 'Mit_en', usage_count: 1, language: 'de' },
                      { id: 33, name: 'Alle_de', usage_count: 0, language: 'de' }];
      const alNames = { en: { 32: 'With_en', 33: 'All_en' }, tr: { 33: 'All_tr' } };
      const alDom = buildDom(JSDOM, {
        /* DER LESER LIEST TUERKISCH, die Vorgabe der Installation ist deutsch.
           Genau die Lage des Betreibers. */
        settings: { filters: null, language: 'tr', languages: axLanguages('de') },
        categories: alCats.map(z => ({ ...z })), categoryNames: alNames,
        criteriaPhases: ['after', 'after', 'before']
      });
      const wAl = alDom.w;
      await until(wAl, overviewReady, 2000, 'die Uebersicht');
      await sysSection(wAl, 'inventory');
      /* WELCHE PILLE IN EINER REIHE ANSTEHT -- gebraucht wird es zweimal: als
         Beleg, dass der Leser wirklich Tuerkisch liest, und unten fuer den
         Gleichlauf der vier Reihen. */
      const alRow = (boxId) => axPills(wAl, boxId)
        .filter(b => b.classList.contains('on')).map(b => pillName(b)).join(',');
      const alAll = () => ['ncatlang', 'mcrits-lang', 'mpcrits-lang', 'vlang']
        .map(id => `${id}=${alRow(id)}`).join(' ');
      /* DER AUFBAU ZUERST, und er ist hier mehr als eine Hoeflichkeit: ohne
         einen Leser, der ANDERS liest als die Zeilen angelegt sind, stempelt
         der Server gar nicht — und die ganze Gruppe belegte nichts. */
      check('Aufbau: die Karte öffnet in der Sprache des Lesers — Türkçe',
        alRow('ncatlang') === 'Türkçe', `es steht an: ${alAll()}`);
      /* UND DER SERVER HAT WIRKLICH GESTEMPELT. */
      check('Und der Server stempelt die zurückgefallenen Zeilen — sonst misst die Gruppe nichts',
        axMarkOk(axCell(wAl, 'mcats', 31).mark, 'Deutsch', 'Türkçe') &&
        axMarkOk(axCell(wAl, 'mcats', 32).mark, 'Deutsch', 'Türkçe') &&
        axCell(wAl, 'mcats', 33).mark === '',
        `31=${JSON.stringify(axCell(wAl, 'mcats', 31).mark)} ` +
        `32=${JSON.stringify(axCell(wAl, 'mcats', 32).mark)} ` +
        `33=${JSON.stringify(axCell(wAl, 'mcats', 33).mark)}`);

      /* ---- AUF DER PILLE „DEUTSCH" IST NICHTS ZU VERMERKEN --------------
         Alle drei Zeilen sind deutsch angelegt; die Tafel „de" sagt bei jeder
         „eingetragen". */
      await axPress(wAl, 'ncatlang', 'Deutsch');
      check('Auf der Pille „Deutsch" steht an keiner Zeile ein Vermerk',
        ['31', '32', '33'].every(id => axCell(wAl, 'mcats', Number(id)).mark === ''),
        [31, 32, 33].map(id => `${id}=${JSON.stringify(axCell(wAl, 'mcats', id).mark)}`).join(' '));
      /* UND DIE PILLE SAGT DASSELBE. Der Widerspruch war der Befund: der Punkt
         oben, die Behauptung unten. Beide Haelften gehoeren in eine Zusage. */
      check('Und die Pille sagt dasselbe — Punkt oben, kein Vermerk unten',
        axMarks(wAl, 'ncatlang').startsWith('Deutsch:●') && !axFramed(wAl, 'ncatlang'),
        `${axMarks(wAl, 'ncatlang')} · Rahmen=${axFramed(wAl, 'ncatlang')}`);
      /* UND DIE NAMEN SIND NICHT GEDAEMPFT. Die Daempfung haengt an derselben
         Abfrage; ohne diese Zeile bliebe sie stehen. */
      check('Und kein Name steht gedämpft da',
        [31, 32, 33].every(id => !axCell(wAl, 'mcats', id).faded),
        [31, 32, 33].map(id => `${id}=${axCell(wAl, 'mcats', id).faded}`).join(' '));

      /* ---- UND DAS ✕ IST WIEDER DA, WO ES HINGEHOERT ------------------- Es
         haengt an derselben Abfrage (`nameFallback === undefined`), und wo
         der Stempel mitreiste, fehlte es. */
      await axPress(wAl, 'ncatlang', 'English');
      check('Zeichenprobe: auf „English" steht das ✕ an der übersetzten Zeile',
        axCell(wAl, 'mcats', 32).erase && axCell(wAl, 'mcats', 33).erase,
        `32=${axCell(wAl, 'mcats', 32).erase} 33=${axCell(wAl, 'mcats', 33).erase}`);
      check('Und an der Zeile ohne englischen Eintrag steht es nicht',
        !axCell(wAl, 'mcats', 31).erase, 'ein ✕ an einer Zeile ohne Eintrag');
      /* UND DER VERMERK IST NICHT VERSCHWUNDEN, sondern richtig: 31 hat kein
         Englisch und faellt auf Deutsch zurueck. */
      check('Und der Vermerk steht weiter da, wo wirklich nichts eingetragen ist',
        axMarkOk(axCell(wAl, 'mcats', 31).mark, 'Deutsch', 'English'),
        JSON.stringify(axCell(wAl, 'mcats', 31).mark));

      /* ---- DIE VIER UMSCHALTER LAUFEN SYNCHRON — 0.25.2 ----------------
         DER BETREIBER: „bei den 3 kacheln laufen die sprachumschalter der
         pilen syncron mit aber der von vokabular nicht. */
      /* GESCHALTET WIRD AUF EINE SPRACHE, DIE NICHT DIE DES LESERS IST. */
      await axPress(wAl, 'ncatlang', 'Deutsch');
      check('Gleichlaufprobe: ein Klick an der Kategorienkachel zieht alle vier Reihen mit',
        ['ncatlang', 'mcrits-lang', 'mpcrits-lang', 'vlang']
          .every(id => alRow(id) === 'Deutsch'), alAll());
      /* UND ANDERSHERUM — das war die Richtung, die nicht ging. */
      await axPress(wAl, 'vlang', 'English');
      check('Und andersherum: ein Klick an der Vokabelkachel zieht die drei Namenskarten mit',
        ['ncatlang', 'mcrits-lang', 'mpcrits-lang', 'vlang']
          .every(id => alRow(id) === 'English'), alAll());
      wAl.close();

      /* UND ES GIBT WIRKLICH NUR EINE ANGABE. */
      const alSource = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
      check('Und es gibt nur EINE Angabe dafür — VOCABULARY_SHOWN ist weg',
        !/VOCABULARY_SHOWN\s*=/.test(alSource) && !/vocabularyLanguage\s*\(/.test(alSource),
        'im Quelltext steht noch eine zweite Angabe');
    }
    /* ================= „Backup" heisst auf Tuerkisch yedekleme — 0.25.1 ===
       DER BETREIBER AM 10. September 2026: „türkcede backup icin yedek
       kelmiesi kullanmisin. */
    group('„Backup" heisst auf Tuerkisch yedekleme — 0.25.1');
    {
      const ydFlat = [];
      const ydWalk = (o, p) => {
        for (const [k, v] of Object.entries(o)) {
          if (typeof v === 'string') ydFlat.push([`${p}${k}`, v]);
          else ydWalk(v, `${p}${k}.`);
        }
      };
      ydWalk(JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', 'tr.json'), 'utf8')), '');
      /* DASS ES UEBERHAUPT SAETZE MIT DEM WORT GIBT -- ohne diese Zeile waere
         der Waechter darunter auch dann gruen, wenn die Datei gar nicht
         gelesen wurde. */
      const ydGood = ydFlat.filter(([, v]) => /yedekleme/i.test(v));
      check('Aufbau: die tuerkische Datei spricht wirklich von Sicherungen',
        ydGood.length >= 40, `${ydGood.length} Saetze mit „yedekleme"`);
      const YEDEK_STEM = /(?<![\p{L}])yede[kğ](?!leme)[\p{L}]*/iu;
      const ydBad = ydFlat.filter(([, v]) => YEDEK_STEM.test(v));
      check('Kein alleinstehendes „yedek" mehr — es heisst ueberall yedekleme',
        ydBad.length === 0,
        ydBad.map(([k, v]) => `${k}: ${v}`).join(' · ') || 'keins');
      /* UND DER WAECHTER FINDET WIRKLICH BEIDE AUSLAUTE. */
      check('Und der Waechter sieht die Konsonantenerweichung — `yedeğe` faellt auf',
        YEDEK_STEM.test('asla aynı yedeğe koyma') && YEDEK_STEM.test('Son yedek') &&
        YEDEK_STEM.test('yedeği al') && YEDEK_STEM.test('yedekler') &&
        !YEDEK_STEM.test('Son yedekleme') && !YEDEK_STEM.test('yedeklemeden sonra') &&
        !YEDEK_STEM.test('yedeklemeler'),
        'der Stamm liest zu viel oder zu wenig');
      /* UND DIE ALLGEMEINE ZEILE DAZU -- 0.32.0, Leitplanke L4: KEIN Waechter
         ueber tuerkischen Text arbeitet mit `\b`. */
      const TR_GUARD_WORDS = ['yedek', 'yedeğ', 'görev', 'öğe', 'değerlendirme',
        'şey', 'günlük', 'yorum'];
      /* GELESEN WERDEN DIE MUSTER SELBST und nicht die Datei als Text: die
         Zerlegung aus tools/segments.js liefert jedes `/…/`-Literal einzeln,
         und damit faellt aus, was in einem KOMMENTAR oder in einer
         Zeichenfolge steht. */
      const trGuardBad = [];
      for (const file of [...benchFiles(), 'counterproof.js'])
        for (const part of segment(fs.readFileSync(path.join(__dirname, file), 'utf8'), file)) {
          if (part.kind !== REGEX || !part.value.includes('\\b')) continue;
          const low = part.value.toLowerCase();
          if (TR_GUARD_WORDS.some(w => low.includes(w))) trGuardBad.push(`${file}: ${part.value}`);
        }
      /* EINE AUSNAHME, UND SIE IST DER BEWEIS SELBST. */
      const TR_GUARD_NAMED = ['/\\bŞey\\b/'];
      const trGuardLeft = trGuardBad.filter(x => !TR_GUARD_NAMED.some(a => x.endsWith(a)));
      check('Kein Waechter ueber tuerkischen Text arbeitet mit einer Wortgrenze — 0.32.0 (L4)',
        trGuardLeft.length === 0, trGuardLeft.slice(0, 4).join(' · ') || 'keiner');
      /* UND DER LESER FINDET WIRKLICH ETWAS. */
      check('Und der Leser findet das eine benannte Gegenbeispiel',
        trGuardBad.length === TR_GUARD_NAMED.length &&
        TR_GUARD_NAMED.every(a => trGuardBad.some(x => x.endsWith(a))),
        trGuardBad.join(' · ') || 'keins');
    }

    /* ================= Zwei Felder in einer Zeile stehen auf einer Linie ===
       0.25.3. */
    group('Zwei Felder in einer Zeile stehen auf einer Linie — 0.25.3');
    {
      const vzRaw = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
      /* DER RUMPF EINER REGEL, am Zeilenanfang verankert: `.field` steht auch
         INNERHALB von `.vocabulary-grid .field`, und ohne Anker faende die
         Suche nach der allgemeinen Regel die besondere. */
      const vzRule = (vzChoice) => {
        const m = vzRaw.match(new RegExp(
          '^' + vzChoice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'm'));
        return m ? m[1].replace(/\s+/g, ' ').trim() : null;
      };
      const vzField = vzRule('.vocabulary-grid .field');
      const vzInput = vzRule('.vocabulary-grid .field .input');
      const vzAllgemein = vzRule('.field');
      /* DER AUFBAU ZUERST: ohne die drei Regeln prueft alles darunter nichts,
         und ein Tippfehler im Suchtext saehe aus wie ein Befund. */
      check('Aufbau: das Stilblatt kennt beide Regeln des Vokabelrasters',
        vzField !== null && vzInput !== null && vzAllgemein !== null,
        `Feld=${vzField} · Eingabe=${vzInput} · allgemein=${vzAllgemein}`);
      /* DER KASTEN IST EINE SPALTE. Ohne ihn gibt es keine Unterkante, an die
         sich etwas druecken liesse. */
      check('Das Feld einer Vokabelzeile ist eine Spalte',
        !!vzField && /display:\s*flex/.test(vzField) && /flex-direction:\s*column/.test(vzField),
        String(vzField));
      /* UND DAS EINGABEFELD HAENGT AN DER UNTERKANTE. */
      check('Und das Eingabefeld hängt an der Unterkante',
        !!vzInput && /margin-top:\s*auto/.test(vzInput), String(vzInput));
      /* UND KEINE FESTE HOEHE AN DER BESCHRIFTUNG. */
      const vzLabel = vzRule('.vocabulary-grid .field label') || '';
      check('Und die Beschriftung bekommt keine feste Höhe',
        !/(min-)?height:/.test(vzLabel), vzLabel || '(keine eigene Regel)');
      /* UND DIE REGEL GILT NUR DORT. */
      check('Und die allgemeine Feldregel bleibt unangetastet',
        !!vzAllgemein && !/display:\s*flex/.test(vzAllgemein), String(vzAllgemein));
    }

    /* ================= Ein Satz, den jede Sprache selbst schneidet — 0.25.4
       = DER STAERKSTE FUND DER SPRACHDURCHSICHT, und er kam nicht aus den
       Berichten, sondern aus der Gegenpruefung: `login.yourLinkAffected` +
       <strong>`login.not`</strong> + `login.stillValid` ergab im Deutschen
       „Dein Link ist davon NICHT betroffen -- er gilt weiter." und im
       Englischen dasselbe. */
    group('Ein Satz, den jede Sprache selbst schneidet — 0.25.4');
    {
      const vsFiles = {};
      for (const code of ['de', 'en', 'tr'])
        vsFiles[code] = JSON.parse(fs.readFileSync(
          path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      const vsSentences = ['login.linkUnaffected', 'login.linkUnaffectedRetry'];
      // Jeder Satz steht vollstaendig in seiner Sprache, ohne eingesetztes Stueck.
      const vsWrong = [];
      for (const [code, langFile] of Object.entries(vsFiles))
        for (const k of vsSentences) {
          const value = langFile[k];
          if (typeof value !== 'string' || /\{\w+\}/.test(value) || value.trim().length < 5)
            vsWrong.push(`${code}/${k}: ${JSON.stringify(value)}`);
        }
      check('Jede Sprache trägt beide Sätze vollständig, ohne eingesetztes Stück',
        vsWrong.length === 0, vsWrong.join(' · ') || 'alle sechs');
      const vsSource = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
      const vsPieces = Object.entries(vsFiles).flatMap(([code, d]) =>
        ['login.linkUnaffectedWord', 'login.yourLinkAffected', 'login.not']
          .filter(k => d[k] !== undefined).map(k => `${code}/${k}`));
      check('Und keines der früheren Bruchstücke steht noch in Datei oder Quelltext',
        vsPieces.length === 0 && !/login\.(linkUnaffectedWord|yourLinkAffected|not)'/.test(vsSource),
        vsPieces.join(' · ') || 'keines');

      /* ---- DAS ANFUEHRUNGSZEICHEN, DAS NIE GESCHLOSSEN WURDE ------------
         `entry.tagQuote` geht unveraendert in ein `title`; am Bildschirm
         stand „Tag „Werkzeug" -- in ALLEN DREI Dateien. */
      const vsOpen = Object.entries(vsFiles).filter(([, d]) => {
        const v = String(d['entry.tagQuote'] || '');
        return (v.match(/[„“”]/g) || []).length !== 2;
      }).map(([c, d]) => `${c}: ${JSON.stringify(d['entry.tagQuote'])}`);
      check('Das Anführungszeichen am Tagzeichen wird in jeder Sprache geschlossen',
        vsOpen.length === 0, vsOpen.join(' · ') || 'alle drei geschlossen');

      /* ---- DIE ZWEI MEHRZAHLFORMEN, DIE NIE EINE WAREN ------------------
         Die Form waehlt `PLURAL.select(values.n)` und NUR ueber `n`. */
      const vsCount = ['card.logKeepsHint', 'login.linkValidHint'];
      const vsWithoutN = [];
      for (const [code, langFile] of Object.entries(vsFiles))
        for (const k of vsCount) {
          const value = langFile[k];
          if (!value || typeof value !== 'object' || value.one === undefined || value.other === undefined)
            { vsWithoutN.push(`${code}/${k}: keine zwei Formen`); continue; }
          if (!/\{n\}/.test(value.one) || !/\{n\}/.test(value.other))
            vsWithoutN.push(`${code}/${k}: kein {n}`);
        }
      check('Die zwei Zählsätze tragen zwei Formen — und den Zählwert, der sie wählt',
        vsWithoutN.length === 0, vsWithoutN.join(' · ') || 'beide in allen drei');
      /* UND IM DEUTSCHEN SIND ES WIRKLICH ZWEI VERSCHIEDENE. */
      check('Und im Deutschen unterscheiden sich die beiden Formen wirklich',
        vsCount.every(k => vsFiles.de[k].one !== vsFiles.de[k].other),
        vsCount.map(k => `${k}: ${JSON.stringify(vsFiles.de[k])}`).join(' · '));
      /* UND IM TUERKISCHEN SIND SIE GLEICH, und das ist keine
         Nachlaessigkeit, sondern die Entscheidung des Betreibers vom 8. */
      check('Und im Türkischen sind sie gleich — nach einer Zahl bleibt der Singular',
        vsCount.every(k => vsFiles.tr[k].one === vsFiles.tr[k].other),
        vsCount.map(k => `${k}: ${JSON.stringify(vsFiles.tr[k])}`).join(' · '));
      /* UND DIE ANDERE HAELFTE DERSELBEN REPARATUR: DER ZAEHLWERT WIRD
         GEREICHT. */
      const vsPassed = (vsSource.match(
        /(?:card\.logKeepsHint|login\.linkValidHint)',\s*\{\s*n:/g) || []).length;
      check('Und beide Stellen reichen den Zählwert unter dem Namen n',
        vsPassed === 2, `${vsPassed} von 2`);
    }
  }

  group('Zeitleiste der Testtage');

  const { w: wz } = buildDom(JSDOM, {});
  await until(wz, overviewReady, 2000, 'die Uebersicht');

  // Rechnung zuerst, unabhaengig vom Bildschirm.
  check('Anteil: Anfang, Mitte, Ende',
    wz.timeShare('2020-01-01', '2020-01-01', '2020-01-11') === 0 &&
    wz.timeShare('2020-01-06', '2020-01-01', '2020-01-11') === 0.5 &&
    wz.timeShare('2020-01-11', '2020-01-01', '2020-01-11') === 1);
  check('Anteil bei nur einem Datum landet in der Mitte',
    wz.timeShare('2020-01-01', '2020-01-01', '2020-01-01') === 0.5);
  check('Jahresmarken decken die Spanne ab',
    equal(wz.yearMarks('2023-07-01', '2025-01-01').map(m => m.year), [2023, 2024, 2025]));
  check('Erste Jahresmarke sitzt am Anfang, nicht davor',
    wz.yearMarks('2023-07-01', '2025-01-01')[0].share === 0);

  // Eintraege wie aus der Uebersicht.
  const buildItems = (n, proEntry = 1) => Array.from({ length: n }, (_, i) => ({
    id: i + 1, title: 'Stück ' + (i + 1), rejected: false, tested: true, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: 3, testCount: proEntry, testAvg: 4, testLast: 4,
    updated_at: '2026-08-01 10:00:00',
    testDays: Array.from({ length: proEntry }, (_, k) => ({
      id: i * 10 + k, day: `202${3 + (i % 3)}-0${1 + k}-15`, rating: (i % 5) + 1 }))
  }));

  check('Punkte werden aus allen sichtbaren Einträgen gesammelt',
    wz.timelinePoints(buildItems(3, 2)).length === 6);
  check('Punkte sind nach Datum sortiert', (() => {
    const p = wz.timelinePoints(buildItems(4, 2)).map(x => x.date);
    return equal(p, [...p].sort());
  })());
  check('Einträge ohne Testtage stören nicht',
    wz.timelinePoints([{ id: 1, title: 'X' }]).length === 0);
  wz.close();

  const few = buildDom(JSDOM, { overviewItems: buildItems(4, 1) }).w;
  await until(few, overviewReady, 2000, 'die Uebersicht');
  check('Unter fünf Testtagen bleibt das Band weg',
    few.document.getElementById('timeline').innerHTML === '');
  few.close();

  const wviel = buildDom(JSDOM, { overviewItems: buildItems(6, 1) }).w;
  await until(wviel, overviewReady, 2000, 'die Uebersicht');
  const zlBox = () => wviel.document.getElementById('timeline');
  check('Ab fünf Testtagen erscheint das Band', !!zlBox().querySelector('.timeline'));
  const points = [...zlBox().querySelectorAll('.timeline-dot')];
  check('Je Testtag ein Punkt', points.length === 6, `${points.length}`);
  check('Höhe folgt der Tagesnote', points.every(p => {
    const score = Number(p.getAttribute('aria-label').match(/Note (\d)/)[1]);
    return p.style.bottom === ((score - 1) / 4 * 100) + '%';
  }), points.map(p => p.style.bottom).join(' '));
  check('Punkte sitzen waagerecht nach Datum',
    points[0].style.left === '0%' && points[points.length - 1].style.left === '100%',
    `${points[0].style.left} … ${points[points.length - 1].style.left}`);
  check('Jahre werden beschriftet', zlBox().querySelectorAll('.timeline-year').length >= 2);

  const firstItem = points[0];
  firstItem.onpointerenter({ pointerType: 'mouse' });
  check('Überfahren zeigt Titel, Datum und Note', (() => {
    const h = zlBox().querySelector('.timeline-hint');
    return h && /Stück/.test(h.textContent) && /Note \d/.test(h.textContent);
  })());
  firstItem.onpointerleave();
  check('Hinweis verschwindet wieder', !zlBox().querySelector('.timeline-hint'));
  firstItem.onpointerenter({ pointerType: 'touch' });
  check('Auf dem Finger erscheint kein Hinweis', !zlBox().querySelector('.timeline-hint'));

  /* Folgt den Filtern: die Suche schneidet die sichtbaren Eintraege zusammen,
     danach unterschreitet die Zeitleiste ihre Schwelle und verschwindet. */
  const searchField = wviel.document.getElementById('q');
  searchField.value = 'Stück 1';
  searchField.oninput();
  await waitSearch(wviel);
  check('Zeitleiste folgt der Suche', zlBox().innerHTML === '',
    `${zlBox().querySelectorAll('.timeline-dot').length} Punkte`);
  searchField.value = '';
  searchField.oninput();
  await waitSearch(wviel);
  check('Ohne Suche kommt sie zurück', zlBox().querySelectorAll('.timeline-dot').length === 6,
    `${zlBox().querySelectorAll('.timeline-dot').length} Punkte`);

  const targetId = points[0].dataset.item;
  zlBox().querySelector('.timeline-dot').onclick();
  check('Klick öffnet den Eintrag', wviel.location.hash.startsWith('#/item/'), wviel.location.hash);
  wviel.close();

  /* ================= Tagwolken ================= */
  group('Tagwolken');

  const pool = [
    { id: 1, name: 'Selten', usage_count: 1, test_usage_count: 0 },
    { id: 2, name: 'Oft', usage_count: 9, test_usage_count: 0 },
    { id: 3, name: 'Mittel', usage_count: 4, test_usage_count: 0, assigned: true },
    { id: 4, name: 'Nurtesttag', usage_count: 0, test_usage_count: 3 }
  ];
  const cloudsDom = buildDom(JSDOM, { tags: pool, hash: '#/item/1' });
  const ww = cloudsDom.w;
  await until(ww, detailReady, 2000, 'die Detailansicht');

  check('Wolke sortiert nach Häufigkeit',
    equal(ww.sortCloud(pool, new Set()).map(t => t.name),
           ['Oft', 'Mittel', 'Selten', 'Nurtesttag']));
  check('Hervorgehobenes steht immer vorn',
    equal(ww.sortCloud(pool, new Set([1])).map(t => t.name),
           ['Selten', 'Oft', 'Mittel', 'Nurtesttag']));

  // Zeilenbegrenzung: die Geometrie stellt jsdom nicht, also gestellt.
  const cloudBox = ww.document.createElement('div');
  const cloudChild = ww.document.createElement('span');
  cloudBox.appendChild(cloudChild);
  ww.document.body.appendChild(cloudBox);
  Object.defineProperty(cloudChild, 'offsetHeight', { get: () => 26 });
  Object.defineProperty(cloudBox, 'clientHeight', { get: () => parseInt(cloudBox.style.maxHeight) || 0 });
  let inhaltshoehe2 = 90;
  Object.defineProperty(cloudBox, 'scrollHeight', { get: () => inhaltshoehe2 });
  check('Eine Zeile ist so hoch wie eine Marke', (ww.limitCloud(cloudBox, 1), cloudBox.style.maxHeight === '26px'),
    cloudBox.style.maxHeight);
  check('Drei Zeilen zählen die Lücken mit', (ww.limitCloud(cloudBox, 3), cloudBox.style.maxHeight === '90px'),
    cloudBox.style.maxHeight);
  check('Abgeschnittenes wird gemeldet', ww.limitCloud(cloudBox, 1) === true);
  /* Und zwar abgeschnitten, nicht scrollbar. */
  check('Und die Wolke wird abgeschnitten, nicht scrollbar',
    (ww.limitCloud(cloudBox, 1),
     cloudBox.style.maxHeight !== '' && cloudBox.style.overflow === 'hidden'),
    JSON.stringify([cloudBox.style.maxHeight, cloudBox.style.overflow]));
  inhaltshoehe2 = 20;
  check('Passt alles hinein, meldet nichts', ww.limitCloud(cloudBox, 3) === false);
  check('Null Zeilen heben die Begrenzung auf',
    (ww.limitCloud(cloudBox, 0), cloudBox.style.maxHeight === ''));
  check('Und nehmen die Abschneidung mit',
    (ww.limitCloud(cloudBox, 0), cloudBox.style.overflow === ''),
    JSON.stringify(cloudBox.style.overflow));

  const cloud = [...ww.document.querySelectorAll('#tagcloud .pill')];
  check('Detailwolke zeigt alle Tags des Vorrats', cloud.length === 4, `${cloud.length}`);
  check('Vergebener Tag ist erkennbar und steht vorn',
    cloud[0].classList.contains('on') && cloud[0].textContent.startsWith('Mittel'),
    cloud.map(b => b.textContent).join(' | '));
  check('Das ✕ an der Marke bleibt zusätzlich bestehen',
    !!ww.document.querySelector('#chips .chip button'));
  // Klick auf einen nicht vergebenen Tag muss ihn vergeben, Klick auf einen
// vergebenen ihn zuruecknehmen -- zwei verschiedene Aufrufe.
  const free = cloud.find(b2 => !b2.classList.contains('on'));
  free.onclick();
  await until(ww, (x) => cloudsDom.sent.some(g => g.method === 'POST' && /\/tags$/.test(g.url)) &&
    openRequests(x) === 0, 2000, 'der vergebene Tag');
  const assigns = cloudsDom.sent.filter(x => x.method === 'POST' && /\/tags$/.test(x.url)).pop();
  check('Klick auf einen freien Tag vergibt ihn',
    assigns && assigns.body.name === free.textContent.replace(/\d+$/, ''),
    JSON.stringify(assigns));
  const used = [...ww.document.querySelectorAll('#tagcloud .pill')].find(b2 => b2.classList.contains('on'));
  used.onclick();
  await until(ww, (x) => cloudsDom.sent.some(g => g.method === 'DELETE' && /\/tags\//.test(g.url)) &&
    openRequests(x) === 0, 2000, 'der zurueckgenommene Tag');
  const takes = cloudsDom.sent.filter(x => x.method === 'DELETE' && /\/tags\//.test(x.url)).pop();
  check('Erneuter Klick nimmt ihn zurück', !!takes, JSON.stringify(takes));

  /* --- Die eingeklappte Wolke: zwei Wege, einzeln geprueft ---------------
     Ein eingeklappter Block macht seine Kinder unsichtbar; offsetHeight ist
     dort null. */
  const zuBox = ww.document.createElement('div');
  zuBox.appendChild(ww.document.createElement('span'));   // offsetHeight bleibt 0
  ww.document.body.appendChild(zuBox);
  zuBox.style.maxHeight = '12px';                          // Rest eines frueheren Laufs
  const zuResult = ww.limitCloud(zuBox, 3);
  check('Eine nicht messbare Wolke bekommt keine Hoehe verpasst',
    zuBox.style.maxHeight === '' && zuResult === false,
    `maxHeight=${JSON.stringify(zuBox.style.maxHeight)}, meldet ${zuResult}`);
  ww.close();

  /* ZWEITER WEG: das Aufklappen zeichnet die Wolke neu. */
  const zuDom = buildDom(JSDOM, { tags: pool, hash: '#/item/1',
    settings: { filters: null, blocks: { closed: ['tags'] } } });
  const zw = zuDom.w;
  await until(zw, detailReady, 2000, 'die Detailansicht');
  const tagBlock = zw.document.querySelector('.block[data-block="tags"]');
  check('Der Tagblock kommt eingeklappt herein',
    tagBlock?.classList.contains('closed'), tagBlock?.className);
  check('Und seine Wolke traegt dabei keine feste Hoehe',
    zw.document.getElementById('tagcloud')?.style.maxHeight === '',
    JSON.stringify(zw.document.getElementById('tagcloud')?.style.maxHeight));

  // Ein Bedienelement ist erst geprueft, wenn ein Ereignis wirklich
  // zugestellt wurde -- also dispatchEvent samt Durchlauf
  // der Event Loop, nicht der von Hand gerufene Behandler.
  const beforePill = zw.document.querySelector('#tagcloud .pill');
  tagBlock.querySelector('.block-head')
    .dispatchEvent(new zw.MouseEvent('click', { bubbles: true }));
  await until(zw, (x) => !tagBlock.classList.contains('closed') && openRequests(x) === 0, 2000,
    'der aufgeklappte Tagblock');
  check('Der Klick auf die Kopfzeile klappt den Block auf',
    !tagBlock.classList.contains('closed'), tagBlock.className);
  const afterPill = zw.document.querySelector('#tagcloud .pill');
  check('Und dabei wird die Wolke neu gezeichnet',
    !!afterPill && afterPill !== beforePill,
    afterPill === beforePill ? 'dieselbe Marke wie vorher' : 'keine Marke da');
  zw.close();

  /* ================= Verknuepfung der Tagfilter ================= */
  group('Tagfilter: Und / Oder');

  const T = { green: { id: 1, name: 'Grün' }, heavy: { id: 2, name: 'Schwer' },
              light: { id: 3, name: 'Leicht' } };
  const includingTags = (id, title, tags) => ({
    id, title: title, rejected: false, tested: false, favorite: false, category: null,
    tags, mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null,
    testCount: null, testAvg: null, testLast: null, testDays: [],
    updated_at: '2026-08-01 10:00:00'
  });
  const inventory = [
    includingTags(1, 'Grün und schwer', [T.green, T.heavy]),
    includingTags(2, 'Nur grün', [T.green]),
    includingTags(3, 'Nur schwer', [T.heavy]),
    includingTags(4, 'Grün und leicht', [T.green, T.light])
  ];

  const tagPool = [
    { id: 1, name: 'Grün', usage_count: 3, test_usage_count: 0 },
    { id: 2, name: 'Schwer', usage_count: 2, test_usage_count: 0 },
    { id: 3, name: 'Leicht', usage_count: 1, test_usage_count: 0 }
  ];

  const filterDom = buildDom(JSDOM, {
    tags: tagPool, overviewItems: inventory,
    settings: { filters: null }
  });
  const wf = filterDom.w;
  await until(wf, overviewReady, 2000, 'die Uebersicht');

  // Die reine Rechnung zuerst, unabhaengig von der Oberflaeche.
  const entry = inventory[0];
  check('UND verlangt alle gewählten Tags',
    wf.matchesTags(entry, [1, 2], 'and') === true &&
    wf.matchesTags(inventory[1], [1, 2], 'and') === false);
  check('ODER genügt einer', wf.matchesTags(inventory[1], [1, 2], 'or') === true);
  check('Ohne gewählte Tags passt jeder', wf.matchesTags(inventory[1], [], 'and') === true);
  check('Unbekannter Modus verhält sich wie UND',
    wf.matchesTags(inventory[1], [1, 2], 'quatsch') === false);

  const title = () => [...wf.document.querySelectorAll('.card .card-title')].map(e => e.textContent);
  /* GEKLAMMERT WIE JEDER GRIFF IN EINEN NACHBAU -- 0.30.0.
     Ein Rueckbau, der die Tagzeile wegnimmt, findet hier keine Marke mehr;
     ein nackter `.onclick()` darauf RISSE DEN LAUF AB, statt die Zusagen
     darunter rot zu machen -- und eine abgerissene Gegenprobe belegt gar
     nichts. */
  const mark = (name) => [...wf.document.querySelectorAll('#filters .pill-tag')]
    .find(b => b.textContent === name) || null;
  const markClick = (name) => { const b = mark(name); if (b) b.onclick(); return !!b; };
  const mode = (value) => wf.document.querySelector(`#filters .pill-mode[data-mode="${value}"]`);
  /* DERSELBE GRIFF FUER DEN UMSCHALTER: er steht in derselben Zeile und faellt
     mit ihr. Klickt oder tut nichts -- und dass er dasteht, ist eine Zusage. */
  const modeClick = (value) => { const b = mode(value); if (b) b.onclick(); return !!b; };

  /* DIE TAGZEILE STEHT SEIT 0.24.0 ZUGEKLAPPT, solange kein Tagfilter greift
     (Bauabschnitt 0.2). */
  check('Die Tagzeile laesst sich aufklappen', !!(await openTagRow(wf)),
    '(keine Tagzeile nach dem Klick)');

  check('Zunächst sind alle vier zu sehen', title().length === 4, JSON.stringify(title()));
  check('Vorgabe ist UND', mode('and')?.classList.contains('on'), 'and nicht hervorgehoben');
  check('Der Umschalter ruht, solange nichts gewählt ist',
    !!wf.document.querySelector('#filters .tagmode.idle'));

  check('Die Marken stehen in der Tagzeile und lassen sich anklicken',
    markClick('Grün'), '(keine Tagzeile oder keine Marke darin)');
  await until(wf, (x) => mark('Grün')?.classList.contains('on') && openRequests(x) === 0, 2000,
    'der gewaehlte Tag Grün');
  check('Ein Tag filtert wie gehabt',
    equal(title().sort(), ['Grün und leicht', 'Grün und schwer', 'Nur grün']), JSON.stringify(title()));

  /* UND SIE STEHEN AUCH NOCH DA, WENN EIN FILTER GREIFT. */
  check('Und sie stehen auch bei greifendem Filter noch da',
    !!mark('Schwer'), '(die Tagzeile ist bei greifendem Filter verschwunden)');
  markClick('Schwer');
  await until(wf, (x) => mark('Schwer')?.classList.contains('on') && openRequests(x) === 0, 2000,
    'der gewaehlte Tag Schwer');
  check('Zwei Tags mit UND zeigen nur den Schnitt',
    equal(title(), ['Grün und schwer']), JSON.stringify(title()));
  check('Der Umschalter ruht jetzt nicht mehr',
    !wf.document.querySelector('#filters .tagmode.idle'));

  check('Der Umschalter steht in der Tagzeile und laesst sich anklicken',
    modeClick('or'), '(kein Umschalter -- die Tagzeile fehlt)');
  await until(wf, (x) => mode('or')?.classList.contains('on') && openRequests(x) === 0, 2000,
    'die Verknuepfung ODER');
  check('Umschalten auf ODER erweitert das Ergebnis',
    equal(title().sort(), ['Grün und leicht', 'Grün und schwer', 'Nur grün', 'Nur schwer']),
    JSON.stringify(title()));
  check('ODER ist jetzt hervorgehoben',
    !!mode('or') && !!mode('and') &&
    mode('or').classList.contains('on') && !mode('and').classList.contains('on'));
  const storedMode = filterDom.sent
    .filter(x => x.body && x.body.filters).pop();
  check('Die Verknüpfung wird serverseitig gespeichert',
    storedMode?.body.filters.tagMode === 'or',
    JSON.stringify(storedMode?.body.filters));

  // Sackgassen: im UND-Modus muss vorher sichtbar sein, was leer laeuft.
  modeClick('and');
  await until(wf, (x) => mode('and')?.classList.contains('on') && openRequests(x) === 0, 2000,
    'die Verknuepfung UND');
  const emptyMarks = [...wf.document.querySelectorAll('#filters .pill-tag.blank')].map(b => b.textContent);
  check('Aussichtslose Tags werden gedämpft',
    equal(emptyMarks, ['Leicht']), JSON.stringify(emptyMarks));
  check('Gewählte Tags gelten nie als aussichtslos',
    !!mark('Grün') && !!mark('Schwer') &&
    !mark('Grün').classList.contains('blank') && !mark('Schwer').classList.contains('blank'));
  check('Gedämpfte Tags bleiben anklickbar', typeof mark('Leicht')?.onclick === 'function');
  check('Ein Hinweis erklärt die Dämpfung', /keine Treffer/i.test(mark('Leicht')?.title || ''));

  modeClick('or');
  await until(wf, (x) => mode('or')?.classList.contains('on') && openRequests(x) === 0, 2000,
    'die Verknuepfung ODER');
  check('Im ODER-Modus wird nichts gedämpft',
    wf.document.querySelectorAll('#filters .pill-tag.blank').length === 0);

  // Der Fall, in dem der Schutz für gewählte Tags erst greift: eine Auswahl
  // ohne jeden Treffer.
  modeClick('and');
  await until(wf, (x) => mode('and')?.classList.contains('on') && openRequests(x) === 0, 2000,
    'die Verknuepfung UND');
  markClick('Grün');          // abwählen
  await until(wf, (x) => !!mark('Grün') && !mark('Grün').classList.contains('on') &&
    openRequests(x) === 0, 2000, 'der abgewaehlte Tag Grün');
  markClick('Leicht');        // Schwer + Leicht: kein Eintrag hat beide
  await until(wf, (x) => mark('Leicht')?.classList.contains('on') && openRequests(x) === 0, 2000,
    'der gewaehlte Tag Leicht');
  check('Diese Auswahl ergibt wirklich keinen Treffer', title().length === 0, JSON.stringify(title()));
  check('Auch bei leerem Ergebnis bleiben gewählte Tags ungedämpft',
    !!mark('Schwer') && !!mark('Leicht') &&
    !mark('Schwer').classList.contains('blank') && !mark('Leicht').classList.contains('blank'),
    [...wf.document.querySelectorAll('#filters .pill-tag.blank')].map(b => b.textContent).join(' '));
  check('Der übrige Tag wird dabei sehr wohl gedämpft',
    !!mark('Grün') && mark('Grün').classList.contains('blank'));
  wf.close();

  // Aeltere gespeicherte Filter kennen die Verknuepfung nicht.
  const oldFilter = buildDom(JSDOM, { tags: tagPool, overviewItems: inventory,
    settings: { filters: { tagIds: [1, 2], tested: 'all', sort: 'updated_desc' } } });
  await until(oldFilter.w, overviewReady, 2000, 'die Uebersicht');
  check('Ältere Filter ohne Verknüpfung bekommen UND',
    equal([...oldFilter.w.document.querySelectorAll('.card .card-title')].map(e => e.textContent),
           ['Grün und schwer']),
    JSON.stringify([...oldFilter.w.document.querySelectorAll('.card .card-title')].map(e => e.textContent)));
  oldFilter.w.close();

  const orFilter = buildDom(JSDOM, { tags: tagPool, overviewItems: inventory,
    settings: { filters: { tagIds: [1, 2], tagMode: 'or', tested: 'all', sort: 'updated_desc' } } });
  await until(orFilter.w, overviewReady, 2000, 'die Uebersicht');
  check('Gespeichertes ODER wird wiederhergestellt',
    [...orFilter.w.document.querySelectorAll('.card .card-title')].length === 4);
  orFilter.w.close();

  /* ---------------------------------------------------------------- */
  group('Favoriten: Sortierung und Filter');

  /* Eine Vorsortierung der Favoriten vor dem `switch` schluege JEDE
     eingestellte Sortierung. */
  const favEntry = (id, title, favorite, ratingValue) => ({
    id, title: title, rejected: false, tested: id % 2 === 0, favorite: favorite,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: ratingValue, testCount: null, testAvg: null, testLast: null, testDays: [],
    updated_at: '2026-08-01 10:00:00'
  });
  // "Zeta ohne Wertung" ist Favorit und hat KEINE Wertung -- genau der Fall
  // aus dem Betrieb.
  const favInventory = [
    favEntry(1, 'Alpha mit Wertung', false, 5),
    favEntry(2, 'Beta mit Wertung', true, 3),
    favEntry(3, 'Zeta ohne Wertung', true, null),
    favEntry(4, 'Gamma mit Wertung', false, 4)
  ];

  // `const state` haengt nicht am window und laesst sich von aussen nicht
  // setzen.
  const favTitleFrom = (d) =>
    [...d.w.document.querySelectorAll('.card .card-title')].map(e => e.textContent);
  const favBuild = async (filters) => {
    const d = buildDom(JSDOM, { overviewItems: favInventory, settings: { filters } });
    await until(d.w, overviewReady, 2000, 'die Uebersicht');
    return d;
  };

  const favTitleSort = await favBuild({ tested: 'all', favorite: false, sort: 'title_asc' });
  check('Bei Titelsortierung stehen Favoriten an ihrem alphabetischen Platz',
    equal(favTitleFrom(favTitleSort),
      ['Alpha mit Wertung', 'Beta mit Wertung', 'Gamma mit Wertung', 'Zeta ohne Wertung']),
    JSON.stringify(favTitleFrom(favTitleSort)));
  favTitleSort.w.close();

  /* Der eigentliche Fall aus dem Betrieb: ein Favorit ohne Wertung darf bei
     absteigender Bewertung NICHT nach oben. */
  const favValue = await favBuild({ tested: 'all', favorite: false, sort: 'rating_desc' });
  const favVorClickable = favTitleFrom(favValue);
  check('Bei Bewertungssortierung steht der ganze Bestand da — 0.32.1',
    equal(favVorClickable,
      ['Alpha mit Wertung', 'Gamma mit Wertung', 'Beta mit Wertung', 'Zeta ohne Wertung']),
    JSON.stringify(favVorClickable));
  // Die erste Pille „Alle" im Dokument ist die der Statusreihe; die der
// Ablehnung steht dahinter im Aufklapper.
  const favEverything = [...favValue.w.document.querySelectorAll('#filters .pill')]
    .find(b => b.textContent.trim() === 'Alle');
  favEverything?.dispatchEvent(new favValue.w.MouseEvent('click', { bubbles: true }));
  await until(favValue.w, (x) => {
    const all = [...x.document.querySelectorAll('#filters .pill')].find(b => b.textContent.trim() === 'Alle');
    return !!all && all !== favEverything && openRequests(x) === 0;
  }, 2000, 'die neu gezeichnete Filterzeile');
  const favValueT = favTitleFrom(favValue);
  check('Ein Favorit ohne Wertung steht bei Bewertungssortierung am Ende',
    favValueT[favValueT.length - 1] === 'Zeta ohne Wertung', JSON.stringify(favValueT));
  check('Und die Bewerteten stehen davor in ihrer Reihenfolge',
    equal(favValueT.slice(0, 3),
      ['Alpha mit Wertung', 'Gamma mit Wertung', 'Beta mit Wertung']),
    JSON.stringify(favValueT));
  favValue.w.close();

  /* Der Filter. Er ist ein EIGENER Umschalter und kein vierter Wert von
     `tested` -- deshalb muss er sich mit dem Teststatus kombinieren lassen. */
  const favOnly = await favBuild({ tested: 'all', favorite: true, sort: 'title_asc' });
  check('Der Filter zeigt nur Favoriten',
    equal(favTitleFrom(favOnly), ['Beta mit Wertung', 'Zeta ohne Wertung']),
    JSON.stringify(favTitleFrom(favOnly)));
  check('Und laesst die Sortierung unangetastet',
    favTitleFrom(favOnly)[0] === 'Beta mit Wertung', JSON.stringify(favTitleFrom(favOnly)));
  favOnly.w.close();

  const favAndTest = await favBuild({ tested: 'tested', favorite: true, sort: 'title_asc' });
  check('Favorit und Teststatus sind kombinierbar, nicht ausschliessend',
    equal(favTitleFrom(favAndTest), ['Beta mit Wertung']),
    JSON.stringify(favTitleFrom(favAndTest)));
  favAndTest.w.close();

  /* Der Knopf selbst, mit wirklich zugestelltem Ereignis. `.click()` oder der
     Behandler von Hand gerufen genuegen nicht. */
  const favClickable = await favBuild({ tested: 'all', favorite: false, sort: 'title_asc' });
  const wv = favClickable.w;
  const favButton = wv.document.getElementById('f-fav');
  check('Der Filterknopf steht in der Statuszeile', !!favButton);
  check('Er ist als Favoritenknopf beschriftet',
    favButton?.textContent === '★ Favoriten', favButton?.textContent);
  check('Und er sitzt abgesetzt, damit er nicht als vierter Zustand gilt',
    favButton?.classList.contains('pill-sep'), favButton?.className);
  check('Vor dem Klick ist er nicht gesetzt',
    !favButton?.classList.contains('on'), favButton?.className);
  favButton?.dispatchEvent(new wv.MouseEvent('click', { bubbles: true }));
  await until(wv, (x) => x.document.getElementById('f-fav')?.classList.contains('on') &&
    openRequests(x) === 0, 2000, 'der gesetzte Favoritenfilter');
  check('Ein zugestellter Klick schaltet den Filter ein',
    equal(favTitleFrom(favClickable), ['Beta mit Wertung', 'Zeta ohne Wertung']),
    JSON.stringify(favTitleFrom(favClickable)));
  check('Der Knopf zeichnet sich dabei als gesetzt',
    wv.document.getElementById('f-fav')?.classList.contains('on'),
    wv.document.getElementById('f-fav')?.className);
  wv.document.getElementById('f-fav')?.dispatchEvent(new wv.MouseEvent('click', { bubbles: true }));
  await until(wv, (x) => x.document.getElementById('f-fav')?.classList.contains('on') === false &&
    openRequests(x) === 0, 2000, 'der zurueckgenommene Favoritenfilter');
  check('Erneuter Klick nimmt ihn zurueck',
    favTitleFrom(favClickable).length === 4 &&
    !wv.document.getElementById('f-fav')?.classList.contains('on'),
    JSON.stringify(favTitleFrom(favClickable)));
  wv.close();

  /* Ein aelterer gespeicherter Filter kennt das Feld `favorite` nicht. Er
     darf nicht dazu fuehren, dass der Filter als eingeschaltet gilt. */
  const favOld = await favBuild({ tagIds: [], tagMode: 'and', tested: 'all', sort: 'title_asc' });
  check('Ein gespeicherter Filter ohne das neue Feld zeigt alles',
    favTitleFrom(favOld).length === 4, JSON.stringify(favTitleFrom(favOld)));
  check('Und sein Knopf steht ungesetzt da, nicht in einem halben Zustand',
    favOld.w.document.getElementById('f-fav')?.classList.contains('on') === false,
    favOld.w.document.getElementById('f-fav')?.className);
  favOld.w.close();

  /* Der Stern auf der Karte. */
  const cssFav = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  const ruleFav = (cssFav.match(/\.card-pin \{[^}]*\}/) || [''])[0];
  check('Der Favoritenstern traegt einen eigenen Hintergrund',
    /background: *rgba\(/.test(ruleFav), ruleFav);
  check('Und er ist groesser als die Fotozahl daneben',
    parseFloat((ruleFav.match(/font-size: *([\d.]+)rem/) || [0, 0])[1]) >= 1,
    ruleFav);
  check('Er bleibt dabei gold -- keine neue Farbe',
    /color: *var\(--gold\)/.test(ruleFav), ruleFav);
  // Das Bedienelement dagegen bleibt orange: "Gold ist Bewertung und Favorit,
// Orange ist Art und Bedienung". Ein goldener Filterknopf braeche die Regel.
  check('Der Filterknopf faerbt sich nicht gold',
    !/\.pill-sep\.on \{[^}]*var\(--gold\)/.test(cssFav),
    (cssFav.match(/\.pill-sep[^{]*\{[^}]*\}/g) || []).join(' '));

  /* Und der Wächter: Eintraege haben Favoriten, Kommentare eine Anpinnung --
     zwei verschiedene Dinge. */
  const appSource = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  /* DIE DREI TEXTE STEHEN SEIT 0.24.0 IN DER SPRACHDATEI. */
  const appTexts = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'));
  const appValues = Object.values(appTexts)
    .flatMap(v => typeof v === 'string' ? [v] : Object.values(v));
  check('Der Eintrag spricht von Favoriten, nicht vom Anheften',
    appValues.includes('Favorit') && !appValues.includes('Angeheftet'),
    'die Uebersichtskarte traegt noch den alten Ueberfahrtext');
  /* GESUCHT WIRD IN BEIDEM -- in der Sprachdatei und im Quelltext. */
  const appAllTexts = appValues.join('\u0000') + '\u0000' + appSource;
  check('Der Knopf benennt die naechste Handlung',
    appAllTexts.includes('Als Favorit markieren') && appAllTexts.includes('Favorit entfernen'),
    appValues.filter(w => /Favorit/.test(w)).join(' · '));
  // DREI SEIT 0.22.0: das Formular, drawNeuMarken() (die Marke nennt seither
// auch den Rueckweg „Nicht mehr anpinnen") und die Kommentarliste.
  /* DREI STELLEN WURDEN EIN SCHLUESSEL -- 0.24.0. */
  check('Die Kommentare sprechen vom Anpinnen, nicht vom Favoriten',
    appTexts['entry.pinHint'] === 'Anpinnen — steht dann ganz oben' &&
    appTexts['entry.unpin'] === 'Nicht mehr anpinnen' &&
    (appSource.match(/tH?\('entry\.pinHint'\)/g) || []).length === 3 &&
    (appSource.match(/tH?\('entry\.unpin'\)/g) || []).length === 2,
    'die Umbenennung hat die Kommentare mitgenommen -- das sind zwei verschiedene Dinge');

  /* ================= Offen: die Ansicht ================= */
  group('Offen: die Ansicht in der Oberflaeche');

  const offBuild = async (opt = {}) => {
    const d = buildDom(JSDOM, { hash: '#/open', ...opt });
    await until(d.w, openReady, 2000, 'die Ansicht Offen');
    return d;
  };
  const offRows = (d) => [...d.w.document.querySelectorAll('.open-row')];
  const offTexts = (d) => offRows(d).map(z => z.querySelector('.open-text')?.textContent);
  const offGroups = (d) => [...d.w.document.querySelectorAll('.open-group')];

  /* Drei Zugaenge: nur dann erscheinen Verfassername und Umschalter. */
  const offAll = await offBuild({ settings: { filters: null, userCount: 3 } });

  check('Die Ansicht ist erreichbar und traegt eine Ueberschrift',
    offAll.w.document.querySelector('.page-title')?.textContent === 'Offene Aufgaben',
    offAll.w.document.querySelector('.page-title')?.textContent);
  // Erst das Vorhandensein der Zeilen, dann die Aussage darueber, welche es
// sind -- auf null Zeilen waere jede Verneinung wahr.
  check('Sie zeigt Zeilen', offRows(offAll).length === 3, `${offRows(offAll).length} Zeilen`);
  check('Und zwar genau die nicht erledigten Aufgaben',
    equal(offTexts(offAll), ['Eine Aufgabe', 'Fremde Aufgabe', 'Herrenlose Aufgabe']),
    JSON.stringify(offTexts(offAll)));
  check('Die erledigte Aufgabe steht nicht darin',
    !offTexts(offAll).includes('Schon erledigt'), JSON.stringify(offTexts(offAll)));
  check('Notiz und Bericht ebenso wenig',
    !offTexts(offAll).includes('Angepinnte Notiz') && !offTexts(offAll).includes('Ein Bericht'),
    JSON.stringify(offTexts(offAll)));

  check('Die Zeilen sind nach Eintrag gruppiert',
    offGroups(offAll).length === 2, `${offGroups(offAll).length} Gruppen`);
  check('Jede Gruppe traegt den Titel ihres Eintrags',
    equal(offGroups(offAll).map(g => g.querySelector('.open-title')?.textContent),
      ['Beispiel', 'Zweites']),
    JSON.stringify(offGroups(offAll).map(g => g.querySelector('.open-title')?.textContent)));
  check('Und die zweite Gruppe traegt ihre beiden Zeilen',
    offGroups(offAll)[1]?.querySelectorAll('.open-row').length === 2,
    `${offGroups(offAll)[1]?.querySelectorAll('.open-row').length}`);
  check('Ein Klick fuehrt in den Eintrag -- am Titel wie an der Zeile',
    offGroups(offAll)[1]?.querySelector('.open-title')?.getAttribute('href') === '#/item/2' &&
    offGroups(offAll)[1]?.querySelector('.open-text')?.getAttribute('href') === '#/item/2',
    offGroups(offAll)[1]?.querySelector('.open-title')?.getAttribute('href'));

  /* Verfasser und Datum an der Zeile. */
  const offWhen = (d) => offRows(d).map(z => z.querySelector('.open-when')?.textContent);
  check('Jede Zeile nennt ihren Verfasser',
    offWhen(offAll)[0]?.startsWith('chefin · ') && offWhen(offAll)[1]?.startsWith('bert · '),
    JSON.stringify(offWhen(offAll)));
  check('Ein Grabstein wird zur Nummer, nicht zum leeren Namen',
    offWhen(offAll)[2]?.startsWith('Gelöschter Benutzer 4 · '), JSON.stringify(offWhen(offAll)));
  check('Und jede Zeile nennt ihr Datum',
    offWhen(offAll).every(t => /\d{2}\.\d{2}\.\d{4}/.test(t || '')), JSON.stringify(offWhen(offAll)));

  /* Der Umschalter -- erst das Vorhandensein bei drei Zugaengen, dann die
     Abwesenheit bei einem. */
  const offView = (d, which) =>
    d.w.document.querySelector(`#open-view [data-view="${which}"]`);
  check('Bei mehreren Zugaengen steht der Umschalter „meine / alle" da',
    !!offView(offAll, 'meine') && !!offView(offAll, 'alle'));
  check('Vorgabestellung ist „alle"',
    offView(offAll, 'alle')?.classList.contains('on') &&
    !offView(offAll, 'meine')?.classList.contains('on'),
    `${offView(offAll, 'meine')?.className} | ${offView(offAll, 'alle')?.className}`);
  offView(offAll, 'meine').dispatchEvent(new offAll.w.MouseEvent('click', { bubbles: true }));
  await until(offAll.w, () => offView(offAll, 'meine')?.classList.contains('on'), 2000,
    'die Stellung „meine"');
  check('„meine" zeigt nur die eigenen Aufgaben',
    equal(offTexts(offAll), ['Eine Aufgabe']), JSON.stringify(offTexts(offAll)));
  check('Und die Zeile darueber sagt, was gezeigt wird',
    /eigenen/.test(offAll.w.document.getElementById('open-hint')?.textContent || ''),
    offAll.w.document.getElementById('open-hint')?.textContent);
  offView(offAll, 'alle').dispatchEvent(new offAll.w.MouseEvent('click', { bubbles: true }));
  await until(offAll.w, () => offView(offAll, 'alle')?.classList.contains('on'), 2000,
    'die Stellung „alle"');
  check('Und zurueck geht es auch', offTexts(offAll).length === 3, JSON.stringify(offTexts(offAll)));
  offAll.w.close();

  const offOne = await offBuild({ settings: { filters: null, userCount: 1 } });
  check('Bei einem Zugang stehen die Zeilen trotzdem da',
    offRows(offOne).length === 3, `${offRows(offOne).length} Zeilen`);
  check('Aber der Umschalter erscheint nicht',
    !offOne.w.document.getElementById('open-view'));
  check('Und kein Verfassername steht an der Zeile',
    offRows(offOne).every(z => !/ · /.test(z.querySelector('.open-when')?.textContent || '')),
    JSON.stringify(offOne.w.document.querySelectorAll('.open-when').length
      ? [...offOne.w.document.querySelectorAll('.open-when')].map(e => e.textContent) : '(keine)'));
  offOne.w.close();

  /* ================= Der Haken in der Ansicht ================= */
  group('Offen: der Haken in der Ansicht');

  /* EIN BEDIENZEICHEN FOLGT DEM RECHT, NICHT DER ANZEIGE. */
  const offAdmin = await offBuild({ settings: { filters: null, userCount: 3 } });
  check('Dem Admin steht an jeder Zeile ein Kaestchen',
    offRows(offAdmin).length === 3 &&
    offRows(offAdmin).every(z => !!z.querySelector('.open-check')),
    `${offRows(offAdmin).filter(z => z.querySelector('.open-check')).length} von ${offRows(offAdmin).length}`);

  const offUser = await offBuild({
    settings: { filters: null, userCount: 3, isAdmin: false } });
  check('Ohne Adminrolle stehen die fremden Zeilen weiterhin da',
    offRows(offUser).length === 3, `${offRows(offUser).length} Zeilen`);
  check('Aber nur an der eigenen steht ein Kaestchen',
    offRows(offUser).filter(z => z.querySelector('.open-check')).length === 1 &&
    !!offRows(offUser)[0].querySelector('.open-check'),
    JSON.stringify(offRows(offUser).map(z => !!z.querySelector('.open-check'))));
  offUser.w.close();

  /* Ein wirklich zugestellter Druck, kein Behandleraufruf. */
  offAdmin.sent.length = 0;
  offRows(offAdmin)[0].querySelector('.open-check')
    .dispatchEvent(new offAdmin.w.MouseEvent('click', { bubbles: true }));
  await until(offAdmin.w, (x) => offAdmin.sent.some(g => g.method === 'PUT') && openRequests(x) === 0,
    2000, 'der gesetzte Haken');
  const offSent = offAdmin.sent.filter(g => g.method === 'PUT');
  check('Der Haken schreibt ueber die vorhandene Kommentarroute',
    offSent.length === 1 && offSent[0].url === '/api/comments/65',
    JSON.stringify(offSent.map(g => g.url)));
  /* Er schickt die ART AUSDRUECKLICH und schaltet nicht weiter:
     aufgabeWeiter() machte aus einer erledigten Aufgabe eine Notiz, und die
     Zeile fiele beim zweiten Druck lautlos aus der Menge. */
  check('Und zwar die Art „erledigt", nichts sonst',
    equal(Object.keys(offSent[0]?.body || {}), ['kind']) &&
    offSent[0]?.body?.kind === 'done',
    JSON.stringify(offSent[0]?.body));
  check('Die Zeile bleibt stehen, sie verschwindet nicht unter dem Zeiger',
    offRows(offAdmin).length === 3 && offTexts(offAdmin)[0] === 'Eine Aufgabe',
    JSON.stringify(offTexts(offAdmin)));
  check('Und sie zeichnet sich als erledigt',
    offRows(offAdmin)[0].classList.contains('done'),
    offRows(offAdmin)[0].className);
  // SEIT 0.22.0 EIN SVG-ZEICHEN STATT ☐/☑ (Stilblatt N1): der Haken ist am
// Zustand `on` und am Zeichen im Kaestchen zu erkennen, nicht am Glyph.
  check('Das Kaestchen zeigt jetzt den Haken',
    offRows(offAdmin)[0].querySelector('.open-check')?.classList.contains('on') === true &&
    !!offRows(offAdmin)[0].querySelector('.open-check svg.icon'),
    offRows(offAdmin)[0].querySelector('.open-check')?.outerHTML.slice(0, 120));

  offAdmin.sent.length = 0;
  offRows(offAdmin)[0].querySelector('.open-check')
    .dispatchEvent(new offAdmin.w.MouseEvent('click', { bubbles: true }));
  await until(offAdmin.w, (x) => offAdmin.sent.some(g => g.method === 'PUT') && openRequests(x) === 0,
    2000, 'der zurueckgenommene Haken');
  check('Ein zweiter Druck nimmt ihn wieder weg -- und macht keine Notiz daraus',
    offAdmin.sent.filter(g => g.method === 'PUT')[0]?.body?.kind === 'task',
    JSON.stringify(offAdmin.sent.filter(g => g.method === 'PUT').map(g => g.body)));
  check('Die Zeile steht danach wieder offen da',
    !offRows(offAdmin)[0].classList.contains('done'),
    offRows(offAdmin)[0].className);

  /* Der Mock aendert seinen Bestand wirklich mit: wird die
     Ansicht neu aufgebaut, ist die abgehakte Zeile fort. */
  offRows(offAdmin)[0].querySelector('.open-check')
    .dispatchEvent(new offAdmin.w.MouseEvent('click', { bubbles: true }));
  await until(offAdmin.w, (x) => offRows(offAdmin)[0]?.classList.contains('done') &&
    openRequests(x) === 0, 2000, 'der erneut gesetzte Haken');
  offAdmin.w.location.hash = '#/';
  await until(offAdmin.w, overviewReady, 2000, 'die Uebersicht');
  offAdmin.w.location.hash = '#/open';
  await until(offAdmin.w, openReady, 2000, 'die Ansicht Offen');
  check('Beim naechsten Aufbau ist die abgehakte Zeile fort',
    equal(offTexts(offAdmin), ['Fremde Aufgabe', 'Herrenlose Aufgabe']),
    JSON.stringify(offTexts(offAdmin)));
  offAdmin.w.close();

  /* Ein leerer Bildschirm ist eine schlechte Antwort. */
  const offEmpty = await offBuild({ openInventory: [], settings: { filters: null, userCount: 3 } });
  check('Ohne offene Aufgaben steht ein Satz da, kein leerer Bildschirm',
    /Nichts offen/.test(offEmpty.w.document.getElementById('open-hint')?.textContent || ''),
    offEmpty.w.document.getElementById('open-hint')?.textContent);
  check('Und keine Gruppe daneben', offGroups(offEmpty).length === 0);
  offEmpty.w.close();

  /* Nichts von MIR offen ist ein anderer Fall als gar nichts offen -- ein Satz
     fuer beides erklaerte den einen falsch. */
  const offNotMy = await offBuild({ settings: { filters: null, userCount: 3 } });
  offView(offNotMy, 'meine')
    .dispatchEvent(new offNotMy.w.MouseEvent('click', { bubbles: true }));
  await until(offNotMy.w, () => offView(offNotMy, 'meine')?.classList.contains('on'), 2000,
    'die Stellung „meine"');
  offRows(offNotMy)[0].querySelector('.open-check')
    .dispatchEvent(new offNotMy.w.MouseEvent('click', { bubbles: true }));
  await until(offNotMy.w, (x) => offNotMy.sent.some(g => g.method === 'PUT' &&
    g.url === '/api/comments/65') && openRequests(x) === 0, 2000, 'der gesetzte Haken');
  offNotMy.w.location.hash = '#/';
  await until(offNotMy.w, overviewReady, 2000, 'die Uebersicht');
  offNotMy.w.location.hash = '#/open';
  await until(offNotMy.w, openReady, 2000, 'die Ansicht Offen');
  offView(offNotMy, 'meine')
    .dispatchEvent(new offNotMy.w.MouseEvent('click', { bubbles: true }));
  await until(offNotMy.w, () => offView(offNotMy, 'meine')?.classList.contains('on'), 2000,
    'die Stellung „meine"');
  check('„Von mir ist nichts offen" sagt etwas anderes als „nichts offen"',
    /Von mir ist nichts offen/.test(
      offNotMy.w.document.getElementById('open-hint')?.textContent || ''),
    offNotMy.w.document.getElementById('open-hint')?.textContent);
  offNotMy.w.close();

  /* DIE UEBERSCHRIFT KOMMT AUS DEM VOKABULAR. */
  const offVok = await offBuild({ settings: { ...ownFull, userCount: 3 } });
  check('Die Ueberschrift benutzt das Vokabular, nicht das feste Wort',
    offVok.w.document.querySelector('.page-title')?.textContent === 'Offene ToDo’s',
    offVok.w.document.querySelector('.page-title')?.textContent);
  check('Der Ueberfahrtext am Kaestchen ebenso',
    /Done/.test(offRows(offVok)[0]?.querySelector('.open-check')?.title || ''),
    offRows(offVok)[0]?.querySelector('.open-check')?.title);
  check('Und die Zeile darueber nennt beide Woerter des Vokabulars',
    /ToDo’s/.test(offVok.w.document.getElementById('open-hint')?.textContent || '') &&
    /Maschine/.test(offVok.w.document.getElementById('open-hint')?.textContent || ''),
    offVok.w.document.getElementById('open-hint')?.textContent);
  offVok.w.close();

  const offEmptyVok = await offBuild({ openInventory: [],
    settings: { ...ownFull, userCount: 3 } });
  /* UMGEDREHT MIT 0.22.0: der leere Satz heisst „Nichts
     offen." -- zwei Woerter, und er braucht kein Vokabelwort mehr (Anlage C,
     Z. */
  check('Der leere Satz ist kurz und kommt ohne Vokabelwort aus — 0.22.0',
    (offEmptyVok.w.document.getElementById('open-hint')?.textContent || '').trim() === 'Nichts offen.',
    offEmptyVok.w.document.getElementById('open-hint')?.textContent);
  offEmptyVok.w.close();

  /* Der Weg in die Ansicht: ein Knopf in der Kopfzeile, neben dem Zahnrad. */
  const offHead = buildDom(JSDOM, { settings: { filters: null, userCount: 3 } });
  await until(offHead.w, overviewReady, 2000, 'die Uebersicht');
  const offButton = offHead.w.document.getElementById('open');
  check('Die Kopfzeile traegt einen Knopf in die Ansicht', !!offButton);
  check('Und er steht neben dem Zahnrad',
    offButton?.nextElementSibling?.id === 'sys', offButton?.nextElementSibling?.id);
  /* SEIT 0.16.0 NENNT DER TITEL DIE ZAHL, sobald es eine gibt -- der Knopf
     traegt sie ohnehin. */
  check('Sein Ueberfahrtext kommt aus dem Vokabular',
    /^\d+ Aufgabe offen$/.test(offButton?.title || ''), offButton?.title);
  check('Und der Knopf traegt die Zahl selbst',
    offHead.w.document.getElementById('open-count')?.textContent === '1',
    offHead.w.document.getElementById('open-count')?.textContent);
  offButton?.dispatchEvent(new offHead.w.MouseEvent('click', { bubbles: true }));
  await until(offHead.w, openReady, 2000, 'die Ansicht Offen');
  check('Ein zugestellter Klick fuehrt in die Ansicht',
    offHead.w.location.hash === '#/open' &&
    !!offHead.w.document.querySelector('.open-group'),
    offHead.w.location.hash);
  offHead.w.close();

  /* Die Kante und der Durchstrich am Stylesheet -- im gebauten DOM laesst
     sich ohne Layoutberechnung nicht sehen, ob etwas sichtbar ist. */
  const cssOff = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
  const ruleOff = (choice) => (cssOff.match(new RegExp(choice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\{[^}]*\\}')) || [''])[0];
  check('Die Gruppe traegt eine Regel im Stylesheet',
    !!ruleOff('.open-group'), ruleOff('.open-group') || '(keine Regel)');
  check('Und sie ist blau wie die Aufgabe im Eintrag -- keine neue Farbe',
    /border-left: *3px solid var\(--blue\)/.test(ruleOff('.open-group')), ruleOff('.open-group'));
  check('Die erledigte Zeile hat eine eigene Regel',
    !!ruleOff('.open-row.done .open-text'), ruleOff('.open-row.done .open-text') || '(keine Regel)');
  check('Und sie streicht den Text durch',
    /line-through/.test(ruleOff('.open-row.done .open-text')),
    ruleOff('.open-row.done .open-text'));

  /* ================= Die gestrichene Pille — 0.17.0 ====================
     MITGENOMMEN UND NICHT GELOESCHT. */
  group('Die gestrichene Pille „Neu seit …" — 0.17.0');

  /* Vier Eintraege, zwei alt und zwei neu -- der Bestand der alten Gruppe,
     unveraendert. */
  const nsCategory = { id: 21, name: 'Werkzeug' };
  const nsTag = { id: 1, name: 'Grün' };
  const nsEntry = (id, title, status, extra = {}) => ({
    id, title: title, rejected: false, tested: false, favorite: false, category: null,
    tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null,
    testCount: null, testAvg: null, testLast: null, testDays: [],
    updated_at: status, ...extra
  });
  const nsInventory = [
    nsEntry(1, 'Alpha alt', '2026-08-01 10:00:00', { tested: true, category: nsCategory }),
    nsEntry(2, 'Beta neu', '2026-08-20 10:00:00', { tags: [nsTag] }),
    nsEntry(3, 'Gamma alt', '2026-08-02 10:00:00'),
    nsEntry(4, 'Delta neu', '2026-08-21 10:00:00', { tested: true, category: nsCategory })
  ];
  const nsTagPool = [{ id: 1, name: 'Grün', usage_count: 1, test_usage_count: 0 }];
  const nsTitle = (d) => [...d.w.document.querySelectorAll('.card .card-title')].map(e => e.textContent);
  const nsBuild = async (filters, more = {}) => {
    const d = buildDom(JSDOM, {
      overviewItems: nsInventory, tags: nsTagPool,
      settings: { filters, ...more }
    });
    await until(d.w, overviewReady, 2000, 'die Uebersicht');
    return d;
  };
  const nsDefault = { categoryIds: [], tagIds: [], tagMode: 'and', tested: 'all',
                      favorite: false, sort: 'title_asc' };

  /* ERST DER GEGENSTAND: die Filterzeile steht ueberhaupt da. */
  const nsWithout = await nsBuild(nsDefault);
  check('Die Filterzeile steht da, mit dem Favoritenknopf',
    !!nsWithout.w.document.getElementById('f-fav'));
  check('Aber die Pille „Neu seit ..." gibt es nicht mehr',
    !nsWithout.w.document.getElementById('f-neu'),
    nsWithout.w.document.getElementById('filters')?.textContent?.replace(/\s+/g, ' '));
  /* UND AUCH IHRE BESCHRIFTUNG NICHT. Ein Rueckbau, der nur die Kennung
     umbenennt, bliebe an der Zeile darueber unsichtbar. */
  check('Und ihre Beschriftung steht nirgends mehr in der Filterzeile',
    !/Neu seit/.test(nsWithout.w.document.getElementById('filters')?.textContent || ''),
    nsWithout.w.document.getElementById('filters')?.textContent?.replace(/\s+/g, ' '));
  check('Es sind alle vier Eintraege zu sehen', nsTitle(nsWithout).length === 4,
    JSON.stringify(nsTitle(nsWithout)));
  /* UND DIE ZEILE IST WIRKLICH EINE PILLE KUERZER. */
  const nsStatus = [...nsWithout.w.document.querySelectorAll('#filters .frow')][0];
  const nsPills = [...(nsStatus?.querySelectorAll('.pill') || [])]
    .map(b => b.textContent.replace(/\s+/g, ' ').trim());
  check('Die Statuszeile traegt sieben Pillen statt acht',
    nsPills.length === 7, JSON.stringify(nsPills));
  check('Und alle sieben namentlich',
    equal(nsPills, ['Alle', 'Getestet', 'Ungetestet', '★ Favoriten',
                      'Alle', 'Abgelehnt', 'Nicht abgelehnt']),
    JSON.stringify(nsPills));
  nsWithout.w.close();

  /* EINE GESPEICHERTE ANSICHT AUS 0.11.0 KANN DEN SCHLUESSEL NOCH TRAGEN. */
  const nsOld = await nsBuild({ ...nsDefault, fresh: true });
  check('Eine gespeicherte Stellung mit „neu" bleibt lesbar',
    nsTitle(nsOld).length === 4, JSON.stringify(nsTitle(nsOld)));
  check('Und der Schluessel faellt aus der zurechtgerueckten Stellung heraus',
    !('neu' in nsOld.w.filterNormal({ ...nsDefault, fresh: true })),
    JSON.stringify(nsOld.w.filterNormal({ ...nsDefault, fresh: true })));
  /* ER ZAEHLT AUCH NICHT MEHR MIT. */
  check('Und der Schalter zaehlt ihn nicht als greifenden Filter',
    !/aktiv/.test(nsOld.w.document.querySelector('#filter-toggle .fcount')?.textContent || ''),
    nsOld.w.document.querySelector('#filter-toggle .fcount')?.textContent);
  nsOld.w.close();

  /* UND DIE UEBRIGEN FILTER STEHEN UNVERAENDERT. */
  const nsRest = await nsBuild({ ...nsDefault, tested: 'tested' });
  check('Der Teststatus filtert weiter',
    equal(nsTitle(nsRest), ['Alpha alt', 'Delta neu']), JSON.stringify(nsTitle(nsRest)));
  nsRest.w.close();
  const nsFav = await nsBuild({ ...nsDefault, favorite: true });
  check('Der Favoritenknopf steht weiter da und filtert',
    !!nsFav.w.document.getElementById('f-fav') && nsTitle(nsFav).length === 0,
    JSON.stringify(nsTitle(nsFav)));
  nsFav.w.close();
  const nsCategoryDom = await nsBuild({ ...nsDefault, categoryIds: [21] });
  check('Und die Kategorie ebenso',
    equal(nsTitle(nsCategoryDom), ['Alpha alt', 'Delta neu']), JSON.stringify(nsTitle(nsCategoryDom)));
  nsCategoryDom.w.close();

  /* WAS EIN BETREIBER SIEHT, DER ALLEIN ARBEITET. */
  const nsOne = await nsBuild(nsDefault, { userCount: 1,
    bellSeen: '2026-08-01 00:00:00' });
  check('Bei einem einzigen Zugang steht die Pille ebenfalls nicht mehr da',
    !nsOne.w.document.getElementById('f-neu'));
  check('Dafuer steht dort die Glocke',
    !!nsOne.w.document.getElementById('bell'), 'keine Glocke bei einem Zugang');
  nsOne.w.close();

  /* ================= Der Bezugspunkt der Glocke ================= */
  /* MITGENOMMEN MIT 0.17.0: diese Gruppe hiess „Neu seit:
     der Merkzeitpunkt" und pruefte `zuletztGesehen`. */
  group('Der Bezugspunkt der Glocke in der Oberflaeche');

  const nsPath = await nsBuild(nsDefault);
  const nsPuts = () => nsPath.sent.filter(g => g.method === 'PUT' && g.url === '/api/settings');
  check('Das Betreten der Uebersicht merkt sich nichts',
    nsPuts().length === 0, JSON.stringify(nsPuts().map(g => g.body)));
  nsPath.w.location.hash = '#/item/1';
  await until(nsPath.w, detailReady, 2000, 'die Detailansicht');
  check('Das Verlassen der Uebersicht setzt den Bezugspunkt',
    nsPuts().length === 1 && nsPuts()[0].body?.bellSeen !== undefined,
    JSON.stringify(nsPuts().map(g => g.body)));
  /* Was hinausgeht, ist ein SIGNAL und keine Uhrzeit: die Uhr des Aufrufers
     ist eine Behauptung, der Server setzt seine eigene ein. */
  check('Und zwar als Signal, nicht als Zeitangabe des Aufrufers',
    !/\d{4}-\d{2}-\d{2}/.test(String(nsPuts()[0]?.body?.bellSeen ?? '')),
    JSON.stringify(nsPuts()[0]?.body));
  /* DER FILTERSTAND WANDERT NICHT MIT, und der Merker der gestrichenen Pille
     erst recht nicht: der Ruf traegt seit 0.17.0 GENAU EIN Feld. */
  check('Der Ruf traegt genau ein Feld und sonst nichts',
    equal(Object.keys(nsPuts()[0]?.body || {}), ['bellSeen']),
    JSON.stringify(nsPuts()[0]?.body));
  /* UND DIE GEGENLAGE: hat der Zugang seinen Bezugspunkt schon, faehrt beim
     Verlassen GAR NICHTS mehr hinaus. */
  const nsAlready = await nsBuild(nsDefault, { bellSeen: '2026-08-01 00:00:00' });
  nsAlready.w.location.hash = '#/item/1';
  await until(nsAlready.w, detailReady, 2000, 'die Detailansicht');
  check('Mit vorhandenem Bezugspunkt faehrt beim Verlassen nichts mehr hinaus',
    nsAlready.sent.filter(g => g.method === 'PUT' && g.url === '/api/settings'
      && g.body?.bellSeen !== undefined).length === 0,
    JSON.stringify(nsAlready.sent.filter(g => g.method === 'PUT').map(g => g.body)));
  nsAlready.w.close();
  nsPath.w.close();

  /* Der Weg in die Ansicht "Offen" ist ebenfalls ein Verlassen der
     Uebersicht, der Weg in den Systembereich auch -- der Bezugspunkt haengt
     an der Uebersicht und nicht an einem einzelnen Ziel. */
  for (const target of ['#/open', '#/system', '#/compare']) {
    const d = await nsBuild(nsDefault);
    const nsShown = d.w.document.getElementById('app').firstElementChild;
    d.w.location.hash = target;
    // Jedes Ziel zeichnet #app neu; `#/compare` ohne Auswahl fuehrt in die Uebersicht zurueck.
    await until(d.w, (x) => x.document.getElementById('app').firstElementChild !== nsShown &&
      openRequests(x) === 0, 2000, `die Ansicht hinter ${target}`);
    check(`Auch der Weg nach ${target} setzt den Bezugspunkt`,
      d.sent.filter(g => g.method === 'PUT' && g.url === '/api/settings'
        && g.body?.bellSeen !== undefined).length === 1,
      JSON.stringify(d.sent.filter(g => g.method === 'PUT').map(g => g.body)));
    d.w.close();
  }

  /* Und die Gegenprobe zum Ganzen: ein Wechsel, der die Uebersicht NICHT
     verlaesst, merkt sich nichts. */
  const nsStays = await nsBuild(nsDefault);
  nsStays.w.document.getElementById('f-fav')
    ?.dispatchEvent(new nsStays.w.MouseEvent('click', { bubbles: true }));
  await until(nsStays.w, (x) => x.document.getElementById('f-fav')?.classList.contains('on') &&
    openRequests(x) === 0, 2000, 'der gesetzte Favoritenfilter');
  check('Ein Filterklick in der Uebersicht setzt keinen Bezugspunkt',
    nsStays.sent.filter(g => g.method === 'PUT' && g.url === '/api/settings'
      && g.body?.bellSeen !== undefined).length === 0,
    JSON.stringify(nsStays.sent.filter(g => g.method === 'PUT').map(g => g.body)));
  check('Er schreibt aber sehr wohl die Filterwahl',
    nsStays.sent.some(g => g.method === 'PUT' && g.url === '/api/settings'
      && g.body?.filters !== undefined),
    JSON.stringify(nsStays.sent.filter(g => g.method === 'PUT').map(g => Object.keys(g.body || {}))));
  nsStays.w.close();
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
