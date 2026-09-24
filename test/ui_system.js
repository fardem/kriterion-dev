/* Kriterion — Pruefstand: die Oberflaeche: der Systembereich Die Karten des
   Systembereichs nach Rolle: Zugaenge, Anmeldeseiten, Sitzungen,
   Sicherheitsprotokoll, Mailversand, Papierkorb, Bildablage und die
   Sicherung. */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  DOM_PASSWORD, placeConfirm, confirmImDom, buildDom, sysSection,
  sysPass, until, openRequests
} = D;
const ACCOUNT_CARD = D.DE_TEXTS['card.myAccount'];

async function run() {
  const {
   fs, os, path, sharp, TEXT, __dirname, require, group, check,
   equal, setField, PORT, shortRun
  } = H;
  /* DIESES MODUL BAUT FENSTER. Fehlt jsdom, sagt es das und haelt an. */
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch { console.log('  … uebersprungen: jsdom fehlt (npm install)'); return; }

  /* ================= Die beiden Anlegen-Schalter ================= */
  group('Anlegen-Schalter in der Oberflaeche');

  /* Der Bildschirm bietet nicht an, was der Server abweist. */
  const createPool = [
    { id: 1, name: 'Vorhanden', usage_count: 3, test_usage_count: 0 },
    { id: 2, name: 'Auch da', usage_count: 1, test_usage_count: 0, assigned: true }
  ];
  const createDom = (isAdmin, free) => buildDom(JSDOM, { hash: '#/item/1', tags: createPool,
    settings: { filters: null, userCount: 3, isAdmin,
                     tagsFreeCreate: free, categoriesFreeCreate: free } });

  const outDom = createDom(false, false);
  const wOut = outDom.w;
  await until(wOut, (x) => x.document.getElementById('ratings') && openRequests(x) === 0,
    2000, 'die Detailansicht');

  check('Ohne Recht verschwindet die Zeile zum Anlegen eines Tags',
    !wOut.document.getElementById('newtag') && !wOut.document.getElementById('newtag-b'),
    'die Eingabezeile steht noch da');
  check('Und die Zeile fuer eine neue Kategorie ebenso',
    !wOut.document.getElementById('newcat') && !wOut.document.getElementById('newcat-b'),
    'die Kategoriezeile steht noch da');
  /* AUSWAHL AUS DEM VORHANDENEN BLEIBT. Das ist der ganze Sinn des Schalters:
     zuweisen darf immer jeder, nur das Anlegen faellt weg. */
  check('Die Auswahlliste der Kategorien bleibt stehen',
    !!wOut.document.getElementById('cat'), 'die Auswahl ist mitverschwunden');
  check('Und die Tagwolke bleibt vollstaendig bedienbar',
    wOut.document.querySelectorAll('#tagcloud .pill-tag').length === 2 &&
    [...wOut.document.querySelectorAll('#tagcloud .pill-tag')].every(p => !!p.onclick),
    `${wOut.document.querySelectorAll('#tagcloud .pill-tag').length} Marken`);
  check('Auch die Marken am Eintrag lassen sich weiterhin abnehmen',
    !!wOut.document.querySelector('#chips .chip button'), 'kein ✕ an der Marke');
  check('Die Vorschlagsliste bleibt -- die Testtagzeile braucht sie',
    !!wOut.document.getElementById('tagsug'), 'die datalist ist mitverschwunden');
  /* DER SONDERFALL AM TESTTAG: dort gibt es keine Wolke, die Eingabe ist der
     einzige Zuweisungsweg und bleibt deshalb stehen. */
  const aTrow = wOut.document.querySelector('#tdays .trow');
  check('Am Testtag bleibt der Knopf fuer Tags stehen',
    !!aTrow && !!aTrow.querySelector('.ttag-add'), 'kein + am Testtag');
  aTrow.querySelector('.ttag-add').dispatchEvent(new wOut.MouseEvent('click', { bubbles: true }));
  await until(wOut, () => aTrow.querySelector('.ttag-in'), 2000, 'das Eingabefeld am Testtag');
  check('Und er oeffnet weiterhin das Eingabefeld',
    !!aTrow.querySelector('.ttag-in'), 'das Feld bleibt zu');
  /* Ein Behandler an einem fehlenden Element risse die ganze Ansicht mit --
     deshalb haengen sie nur an dem, was wirklich dasteht. */
  check('Die Ansicht steht trotzdem vollstaendig da',
    !!wOut.document.getElementById('cmts') && !!wOut.document.getElementById('chips') &&
    !!wOut.document.getElementById('links') && !!wOut.document.getElementById('ratings'),
    'der Aufbau ist an den fehlenden Zeilen zerbrochen');
  wOut.close();

  const admDom = createDom(true, false);
  const wAdm = admDom.w;
  await until(wAdm, (x) => x.document.getElementById('ratings') && openRequests(x) === 0,
    2000, 'die Detailansicht');
  check('Der Admin behaelt beide Zeilen, auch bei ausgeschaltetem Schalter',
    !!wAdm.document.getElementById('newtag') && !!wAdm.document.getElementById('newcat'),
    'dem Admin fehlt eine der beiden Zeilen');
  wAdm.close();

  const anDom = createDom(false, true);
  const wAn = anDom.w;
  await until(wAn, (x) => x.document.getElementById('ratings') && openRequests(x) === 0,
    2000, 'die Detailansicht');
  check('Mit eingeschaltetem Schalter sieht auch der Benutzer beide Zeilen wieder',
    !!wAn.document.getElementById('newtag') && !!wAn.document.getElementById('newcat'),
    'die Zeilen bleiben weg');
  // Und der Weg funktioniert auch: ein wirklich zugestellter Druck schickt den
// Namen. Ein Knopf, den es gibt und der nichts tut, waere nicht besser.
  anDom.sent.length = 0;
  setField(wAn.document, 'newtag', 'Ganz neu');
  wAn.document.getElementById('newtag-b').dispatchEvent(new wAn.MouseEvent('click', { bubbles: true }));
  await until(wAn, (x) => anDom.sent.some(g => /\/api\/items\/1\/tags$/.test(g.url)) &&
    openRequests(x) === 0, 2000, 'die Antwort auf den neuen Tag');
  const anSent = anDom.sent.filter(g => /\/api\/items\/1\/tags$/.test(g.url)).pop();
  check('Der Knopf schickt den neuen Namen an den Eintrag',
    anSent && anSent.method === 'POST' && anSent.body?.name === 'Ganz neu',
    JSON.stringify(anSent));
  wAn.close();

  /* ---- Die Haken im Systembereich ---- Nur der Admin bekommt sie zu sehen:
     ein Haken, der zuverlaessig eine Absage erzeugt, saehe aus wie ein
     Fehler. */
  const sysDom = buildDom(JSDOM, { settings: { filters: null, isAdmin: true,
    tagsFreeCreate: false, categoriesFreeCreate: true } });
  const wSys = sysDom.w;
  await until(wSys, (x) => x.document.getElementById('count') && openRequests(x) === 0,
    2000, 'die Uebersicht');
  await sysSection(wSys, 'inventory');
  const checkTag = wSys.document.getElementById('tag-free');
  const checkCategory = wSys.document.getElementById('cat-free');
  check('Der Systembereich traegt beide Haken',
    !!checkTag && !!checkCategory,
    `${checkTag ? '' : 'tagfrei fehlt '}${checkCategory ? '' : 'katfrei fehlt'}`);
  check('Und jeder zeigt seine eigene Stellung',
    checkTag.checked === false && checkCategory.checked === true,
    JSON.stringify([checkTag.checked, checkCategory.checked]));
  check('Sie stehen bei den Karten, die sie betreffen',
    checkTag.closest('.sys-card')?.querySelector('h3')?.textContent === 'Tags' &&
    checkCategory.closest('.sys-card')?.querySelector('h3')?.textContent === 'Kategorien',
    `${checkTag.closest('.sys-card')?.querySelector('h3')?.textContent} / ` +
    `${checkCategory.closest('.sys-card')?.querySelector('h3')?.textContent}`);
  /* Ein wirklich zugestelltes Ereignis, kein Behandleraufruf: der Behandler
     laeuft nach einem await weiter, und genau dort saessen die Fehler, die im
     bloss gebauten DOM unsichtbar bleiben. */
  sysDom.sent.length = 0;
  checkTag.checked = true;
  checkTag.dispatchEvent(new wSys.Event('change', { bubbles: true }));
  await until(wSys, (x) => sysDom.sent.some(g => g.url === '/api/settings') &&
    openRequests(x) === 0, 2000, 'die Antwort auf den Haken');
  const checkSent = sysDom.sent.filter(
    g => g.url === '/api/settings' && g.body && g.body.tagsFreeCreate !== undefined).pop();
  check('Der Haken schickt genau seinen eigenen Schluessel, sonst nichts',
    checkSent && checkSent.method === 'PUT' &&
    equal(Object.keys(checkSent.body), ['tagsFreeCreate']) &&
    checkSent.body.tagsFreeCreate === true,
    JSON.stringify(checkSent));
  check('Und der andere Haken bleibt dabei unberuehrt',
    checkCategory.checked === true &&
    !sysDom.sent.some(g => g.body && g.body.categoriesFreeCreate !== undefined),
    JSON.stringify(sysDom.sent.map(g => g.body)));
  wSys.close();

  const sysUser = buildDom(JSDOM, { settings: { filters: null,
    isAdmin: false, isOwner: false } });
  const wSysU = sysUser.w;
  await until(wSysU, (x) => x.document.getElementById('count') && openRequests(x) === 0,
    2000, 'die Uebersicht');
  await sysSection(wSysU, 'inventory');
  check('Ein Benutzer bekommt die Haken gar nicht erst zu sehen',
    !wSysU.document.getElementById('tag-free') && !wSysU.document.getElementById('cat-free'),
    'ein Haken steht auch ohne Adminrolle da');
  // Die beiden KARTEN bleiben stehen, auch seit 0.8.5: wer nicht verwalten
// darf, darf nachsehen, was es gibt. Weg sind nur die Bedienzeichen.
  check('Die Karten selbst bleiben ihm',
    !!wSysU.document.getElementById('mtags') && !!wSysU.document.getElementById('mcats'),
    'die Karten sind verschwunden');
  wSysU.close();

  /* ================= Der Systembereich nach Rolle ================= */
  group('Der Systembereich nach Rolle');

  /* DREI LAGEN NEBENEINANDER, und keine ist entbehrlich: die Eigentuemerin
     (alle Karten), ein Admin OHNE Eigentuemerrecht (alles ausser Export und
     Import) und ein gewoehnlicher Benutzer (drei Karten). */
  const rTags = [
    { id: 31, name: 'Alu', usage_count: 3, test_usage_count: 1 },
    { id: 32, name: 'Stahl', usage_count: 1, test_usage_count: 0 }
  ];
  const buildSystem = async (roles, requestsStatus = null) => {
    const d = buildDom(JSDOM, { tags: rTags, requestsStatus,
      settings: { filters: null, userCount: 4, ...roles } });
    await until(d.w, (x) => x.document.getElementById('count') && openRequests(x) === 0,
      2000, 'die Uebersicht');
    await d.w.renderSystem();
    await until(d.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
      2000, 'der Systembereich');
    return d;
  };
  /* Die Karten werden an ihrer UEBERSCHRIFT abgezaehlt, nicht an einer id:
     die Ueberschrift ist das, was auf dem Bildschirm steht. */
  const rEig = await buildSystem({ isAdmin: true, isOwner: true });
  const rAdm = await buildSystem({ isAdmin: true, isOwner: false });
  const rUser = await buildSystem({ isAdmin: false, isOwner: false });
  const dEig = await sysPass(rEig), dAdm = await sysPass(rAdm),
        dUser = await sysPass(rUser);
  const kEig = dEig.cards, kAdm = dAdm.cards, kUser = dUser.cards;

  /* ---- Rueckfallprobe — 0.24.0 --------------------------------------- KEIN
     ⟦…⟧ AM BILDSCHIRM. */
  const rewind = [['Eigentuemerin', dEig], ['Admin', dAdm], ['Benutzer', dUser]]
    .filter(([, d]) => d.text.includes('\u27e6'))
    .map(([actor, d]) => `${actor}: ${(d.text.match(/\u27e6[^\u27e7]*\u27e7/g) || []).slice(0, 4).join(' ')}`);
  check('Rueckfallprobe: kein ⟦…⟧ im Systembereich, in keiner Rolle',
    rewind.length === 0, rewind.join(' · '));
  // Und der Gegenstand: es ist wirklich Text da, den sie ansehen konnte.
  check('Und die drei Durchgaenge tragen wirklich Text',
    dEig.text.length > 2000 && dAdm.text.length > 500 && dUser.text.length > 200,
    `${dEig.text.length} · ${dAdm.text.length} · ${dUser.text.length} Zeichen`);

  /* ACHTZEHN SEIT 0.9.0: "Mailversand" kommt dazu, und sie steht beim
     EIGENTUEMER -- nicht beim Admin, obwohl der die Einladungen verschickt. */
  /* ACHTZEHN SEIT 0.16.0: "Export" und "Import" sind EINE Karte geworden --
     sie meinen dieselbe Datei, und der Import steht darin eine Stufe tiefer. */
  /* ZWANZIG SEIT 0.20.0: "Alte Sicherungen" kommt dazu und steht UNMITTELBAR
     HINTER "Sicherung". */
  /* EINUNDZWANZIG SEIT 0.21.0: „Potenzial: Kriterien" kommt dazu und steht
     UNMITTELBAR HINTER „Bewertungskriterien" -- dieselbe Maschine, eine
     andere Liste. */
  /* ZWEIUNDZWANZIG SEIT 0.24.3: „Sprachen" kommt dazu und steht UNMITTELBAR
     HINTER „Titel" -- die zweite Karte des Abschnitts „Installation", der bis
     dahin genau eine trug. */
  // Dreiundzwanzig: „Grenzen beim Hochladen" steht hinter „Bildformate".
  const ALL_CARDS = [
    ACCOUNT_CARD, 'Meine Sitzungen', 'Darstellung',
    'Kategorien', 'Tags', 'Bewertung: Kriterien', 'Potenzial: Kriterien',
    'Vokabular', 'Links', 'Suchmaschinen', 'Papierkorb',
    'Benutzer', 'Anfragen', 'Sicherheitsprotokoll', 'Mailversand',
    'Kennzahlen', 'Bildformate', 'Grenzen beim Hochladen', 'Backup', 'Alte Backups', 'Export und Import',
    'Titel', 'Sprachen'];
  check('Die Eigentuemerin sieht alle dreiundzwanzig Karten',
    equal(kEig, ALL_CARDS), kEig.join(' · '));
  // Die ZAHL ausdruecklich, wie bei F_ROUTES: eine Karte, die still
// verschwindet, faellt sonst niemandem auf.
  check('Und es sind wirklich dreiundzwanzig', ALL_CARDS.length === 23 && kEig.length === 23,
    `${ALL_CARDS.length} erwartet, ${kEig.length} gezeichnet`);
  /* UND DIE ZWEITE KRITERIENKARTE STEHT HINTER DER ERSTEN -- dieselbe
     Nachbarschaftszusage wie bei „Alte Sicherungen" darunter, und aus
     demselben Grund: die Zeile darueber faerbt sich auch bei einer
     Verschiebung, diese hier sagt, WELCHE Nachbarschaft gemeint war. */
  check('Und "Potenzial: Kriterien" steht unmittelbar hinter "Bewertung: Kriterien"',
    kEig.indexOf('Potenzial: Kriterien') === kEig.indexOf('Bewertung: Kriterien') + 1,
    `Bewertung: Kriterien: ${kEig.indexOf('Bewertung: Kriterien')} · ` +
    `Potenzial: Kriterien: ${kEig.indexOf('Potenzial: Kriterien')}`);
  /* UND SIE STEHT HINTER "SICHERUNG" -- die Reihenfolge ist geprueft und
     nicht zufaellig. */
  check('Und "Alte Backups" steht unmittelbar hinter "Backup"',
    kEig.indexOf('Alte Backups') === kEig.indexOf('Backup') + 1,
    `Backup: ${kEig.indexOf('Backup')} · Alte Backups: ${kEig.indexOf('Alte Backups')}`);
  // Und keine steht zweimal -- eine Karte, die in zwei Abschnitten haengt,
// faellt an der Summe sonst gar nicht auf.
  check('Und keine Karte steht in zwei Abschnitten',
    new Set(kEig).size === kEig.length,
    kEig.filter((n, i) => kEig.indexOf(n) !== i).join(' · '));

  /* ---- DIE ABSCHNITTE SELBST ---- FUENF FUER DEN EIGENTUEMER, ZWEI FUER DEN
     GEWOEHNLICHEN BENUTZER. */
  const tabWords = (d) => [...d.w.document.querySelectorAll('.sys-tab')]
    .map(a => a.textContent.trim());
  check('Die Eigentuemerin bekommt fuenf Abschnitte',
    equal(tabWords(rEig), ['Persönlich', 'Bestand', 'Benutzer', 'Datenbank', 'Installation']),
    tabWords(rEig).join(' · '));
  check('Ein gewoehnlicher Benutzer bekommt nur die zwei, die etwas zu zeigen haben',
    equal(tabWords(rUser), ['Persönlich', 'Bestand']), tabWords(rUser).join(' · '));
  check('Und kein Abschnitt ist dabei leer',
    dUser.tab.length === 2 && kUser.length === 8,
    `${dUser.tab.length} Reiter, ${kUser.length} Karten`);
  // Jeder Reiter traegt eine eigene Adresse -- ohne sie liesse sich keine
// Einstellung verlinken, und die Zurueck-Taste braeche.
  check('Jeder Reiter traegt seine eigene Adresse',
    equal(dEig.tab, ['#/system/personal', '#/system/inventory', '#/system/users',
                         '#/system/database', '#/system/installation']),
    dEig.tab.join(' · '));
  /* UND ER IST EIN VERWEIS UND KEIN KNOPF. */
  check('Und er ist ein Verweis und kein Knopf',
    [...rEig.w.document.querySelectorAll('.sys-tab')].length === 5 &&
    [...rEig.w.document.querySelectorAll('.sys-tab')].every(a => a.tagName === 'A'),
    [...rEig.w.document.querySelectorAll('.sys-tab')].map(a => a.tagName).join(' · '));
  /* DIE ADRESSE ZEIGT AUF EINEN ABSCHNITT, DEN ES FUER IHN NICHT GIBT. */
  await sysSection(rUser.w, 'database');
  check('Eine Adresse auf einen unsichtbaren Abschnitt faellt auf den ersten zurueck',
    [...rUser.w.document.querySelectorAll('.sys-grid > .sys-card h3')]
      .map(h => h.textContent.trim())[0] === ACCOUNT_CARD,
    [...rUser.w.document.querySelectorAll('.sys-grid > .sys-card h3')]
      .map(h => h.textContent.trim()).join(' · '));
  check('Und die Adresse wird dabei nachgezogen',
    rUser.w.location.hash === '#/system/personal', rUser.w.location.hash);
  /* DIE GEGENLAGE, sonst belegte die Zeile darueber nichts: eine Adresse auf
     einen Abschnitt, den es SEHR WOHL gibt, bleibt stehen. */
  await sysSection(rUser.w, 'inventory');
  check('Eine Adresse auf einen sichtbaren Abschnitt bleibt dagegen stehen',
    rUser.w.location.hash === '#/system/inventory', rUser.w.location.hash);
  /* UND `#/system` OHNE ABSCHNITT LOEST SICH AUF -- es ist die Adresse, die
     der Knopf in der Kopfzeile setzt. */
  rUser.w.history.replaceState(null, '', '#/system');
  await rUser.w.renderSystem();
  await until(rUser.w, (x) => x.document.querySelector('.sys-tab.on')?.getAttribute('href') ===
    '#/system/personal' && openRequests(x) === 0, 2000, 'der erste Abschnitt');
  check('Und `#/system` ohne Abschnitt loest sich auf den ersten auf',
    rUser.w.location.hash === '#/system/personal', rUser.w.location.hash);

  /* Die drei, die JEDEM bleiben -- und der Grund steht in jeder von ihnen:
     "Zugang" ist der eigene Zugang, "Darstellung" ist Schriftgroesse und
     Blockanordnung, "Links" ist die Zahl der sichtbaren Zeilen und der
     angezeigten Anbieternamen. */
  /* SIEBEN SEIT 0.8.80: "Meine Sitzungen" ist persoenlich wie "Zugang" und
     steht deshalb JEDEM -- es ist kein Systembereich fuer Admins. */
  /* ACHT SEIT 0.21.0: „Potenzial: Kriterien" steht daneben, wie die drei
     anderen Listen -- sichtbar fuer jeden, bedienbar nur fuer den Admin. */
  check('Ein gewoehnlicher Benutzer sieht acht -- vier persoenliche, vier zum Nachsehen',
    equal(kUser, [ACCOUNT_CARD, 'Meine Sitzungen', 'Darstellung',
                   'Kategorien', 'Tags', 'Bewertung: Kriterien', 'Potenzial: Kriterien', 'Links']),
    kUser.join(' · '));

  /* Punkt fuer Punkt, weil eine Sammelpruefung nicht sagt, WELCHE Karte
     fehlt -- und weil jede fuer sich gegengeprueft werden koennen muss. */
  /* "Papierkorb" steht beim Admin -- SEHEN ist die Adminfrage, HANDELN die
     Eigentuemerfrage. */
  for (const card of ['Titel', 'Kennzahlen', 'Vokabular', 'Benutzer', 'Suchmaschinen', 'Papierkorb',
                       'Anfragen']) {
    check(`Die Karte "${card}" steht nur beim Admin`,
      kAdm.includes(card) && !kUser.includes(card),
      `Admin: ${kAdm.includes(card)} · Benutzer: ${kUser.includes(card)}`);
  }
  for (const card of ['Export und Import', 'Backup', 'Alte Backups',
                       'Sicherheitsprotokoll', 'Mailversand']) {
    check(`Die Karte "${card}" steht nur beim Eigentuemer`,
      kEig.includes(card) && !kAdm.includes(card) && !kUser.includes(card),
      `Eigentuemer: ${kEig.includes(card)} · Admin: ${kAdm.includes(card)}`);
  }
  /* DIE KARTE "ANFRAGEN" STEHT AUCH DANN, WENN DIE SELBSTANMELDUNG AUS IST --
     UND DAS IST EINE BERICHTIGUNG AUS DEM BETRIEB. */
  const rOut = await buildSystem({ isAdmin: true, isOwner: true },
    { an: false, deliveryReady: false, deliveryReason: 'Es ist kein Mailzugang eingerichtet.',
      cap: 20, hours: 24, requests: [] });
  const kOut = (await sysPass(rOut)).cards;
  check('Ist die Selbstanmeldung aus und nichts offen, steht die Karte "Anfragen" trotzdem',
    kOut.includes('Anfragen'), kOut.join(' · '));
  check('Und es sind auch dann dreiundzwanzig', kOut.length === 23 && equal(kOut, ALL_CARDS),
    `${kOut.length} gezeichnet`);
  // Die Karte steht im Abschnitt „Zugaenge" -- dorthin, bevor an ihr geprueft wird.
  await sysSection(rOut.w, 'users');
  /* DER SCHALTER MUSS IN GENAU DIESER LAGE ERREICHBAR SEIN -- sonst ist die
     Selbstanmeldung ueber die Oberflaeche gar nicht einzuschalten. */
  check('Und der Schalter steht darin -- sonst kaeme man nie an ihn heran',
    Boolean(rOut.w.document.getElementById('signup-toggle')), 'der Schalter fehlt');
  check('Er bietet das Einschalten an',
    /einschalten/.test(rOut.w.document.getElementById('signup-toggle')?.textContent || ''),
    rOut.w.document.getElementById('signup-toggle')?.textContent || '');
  /* Und die Karte bleibt in dieser Lage KURZ: keine Liste, wo nichts steht. */
  check('Die Liste bleibt dabei leer, statt eine Zeile zu erfinden',
    (rOut.w.document.getElementById('mrequests')?.textContent || '').trim() === '',
    rOut.w.document.getElementById('mrequests')?.textContent || '');
  /* UND SIE IST AUCH DA, WENN DER SCHALTER AUS IST, ABER NOCH ANFRAGEN
     LIEGEN. */
  const rOutIncludingRows = await buildSystem({ isAdmin: true, isOwner: true },
    { an: false, deliveryReady: true, deliveryReason: '', cap: 20, hours: 24,
      requests: [{ id: 11, username: 'neuling', email: 'neuling@beispiel.de',
                   created_at: '2026-08-20 09:00:00', confirmed_at: '2026-08-20 09:05:00' }] });
  await sysSection(rOutIncludingRows.w, 'users');
  check('Bei ausgeschaltetem Schalter mit offenen Anfragen steht die Liste darin',
    [...rOutIncludingRows.w.document.querySelectorAll('#mrequests .mrow')].length === 1,
    `${[...rOutIncludingRows.w.document.querySelectorAll('#mrequests .mrow')].length} Zeilen`);

  for (const card of [ACCOUNT_CARD, 'Meine Sitzungen', 'Darstellung', 'Links']) {
    check(`Die Karte "${card}" steht jedem, auch ohne Rolle`,
      kUser.includes(card) && kEig.includes(card), kUser.join(' · '));
  }

  /* DIE KONKRETESTE FALLE DIESER STUFE. */
  check('Ohne Adminrolle werden die Kennzahlen gar nicht erst abgerufen',
    !rUser.sent.some(x => x.url === '/api/stats'),
    rUser.sent.map(x => x.url).join(' · '));
  check('Mit Adminrolle sehr wohl',
    rAdm.sent.some(x => x.url === '/api/stats'),
    rAdm.sent.map(x => x.url).join(' · '));
  check('Und der Systembereich bleibt dabei ueberhaupt gefuellt',
    kUser.length > 0 && !/lädt …/.test(rUser.w.document.getElementById('app')?.textContent || ''),
    rUser.w.document.getElementById('app')?.textContent?.slice(0, 80));

  /* DER FINGERPRINT IN DER KARTE (0.8.10). */
  const statsCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Kennzahlen');
  await sysSection(rAdm.w, 'database');
  const admCard = statsCard(rAdm);
  check('Die Karte Kennzahlen ist für den Admin überhaupt da', !!admCard,
    kAdm.join(' · '));
  check('Sie trägt eine Zeile mit der Beschriftung Fingerprint',
    [...(admCard?.querySelectorAll('.kv') || [])]
      .some(z => z.querySelector('.k')?.textContent.trim() === 'Prüfsumme (Fingerprint)'),
    [...(admCard?.querySelectorAll('.kv .k') || [])].map(k => k.textContent.trim()).join(' · '));
  check('Und darin steht der Wert aus der Antwort',
    [...(admCard?.querySelectorAll('.kv') || [])]
      .some(z => z.querySelector('.k')?.textContent.trim() === 'Prüfsumme (Fingerprint)' &&
                 z.querySelector('.v')?.textContent.trim() === 'a1b2c3d4'),
    [...(admCard?.querySelectorAll('.kv .v') || [])].map(v => v.textContent.trim()).join(' · '));
  /* NIRGENDS heisst: in KEINEM Abschnitt. Ein Blick auf den gerade offenen
     belegte nur, dass er dort nicht steht. */
  check('Ohne Adminrolle steht der Fingerprint nirgends',
    !/a1b2c3d4/.test(dUser.text), dUser.text.slice(0, 120));

  /* Was verschwindet, sind die KARTEN, nicht die Daten. */
  const rVok = await buildSystem({ isAdmin: false, isOwner: false,
    vocabulary: { entryMany: 'Geräte' } });
  /* Die Karte „Vokabular" steht im Abschnitt „Bestand", und die Beschriftung,
     an der das Vokabular abzulesen ist, ebenso -- die Karte „Kategorien"
     nennt dort die Mehrzahl. */
  await sysSection(rVok.w, 'inventory');
  check('Das Vokabular wird trotzdem ausgeliefert und benutzt',
    /Geräte/.test(rVok.w.document.getElementById('app')?.textContent || ''),
    'die Beschriftung folgt dem Vokabular nicht');
  check('Aber die Karte zum Bearbeiten steht ihm nicht',
    !rVok.w.document.getElementById('v1') && !rVok.w.document.getElementById('vsave'));
  rVok.w.close();

  /* Die persoenlichen Karten sind nicht nur da, sie funktionieren auch. */
  await sysSection(rUser.w, 'personal');
  rUser.sent.length = 0;
  const rPill = [...rUser.w.document.querySelectorAll('#fsize .pill')]
    .find(b => b.textContent === '120 %');
  check('Die Schriftgroesse traegt ihre Stufen auch ohne Rolle', !!rPill,
    [...rUser.w.document.querySelectorAll('#fsize .pill')].map(b => b.textContent).join(' · '));
  if (rPill) {
    rPill.dispatchEvent(new rUser.w.MouseEvent('click', { bubbles: true }));
    await until(rUser.w, (x) => rUser.sent.some(g => g.method === 'PUT' && g.url === '/api/settings') &&
      openRequests(x) === 0, 2000, 'die gespeicherte Schriftgroesse');
  }
  const rSent = rUser.sent.filter(x => x.method === 'PUT' && x.url === '/api/settings').pop();
  check('Und der Druck speichert sie wirklich',
    rSent?.body?.font === 120, JSON.stringify(rSent));

  /* Die persoenliche Haelfte der Links bleibt, die Adminhaelfte geht. Beides
     an EINER Lage, sonst liesse sich der Schnitt der Karte nicht belegen. */
  await sysSection(rUser.w, 'inventory');
  await sysSection(rAdm.w, 'inventory');
  check('Die Zahl der Anbieternamen bleibt dem Benutzer',
    !!rUser.w.document.getElementById('snames') &&
    rUser.w.document.querySelectorAll('#snames .pill').length > 0);
  check('Und die sichtbaren Linkzeilen ebenso',
    rUser.w.document.querySelectorAll('#lrows .pill').length > 0);
  check('Vorrat, Startanbieter und eigene Anbieter dagegen nicht',
    !rUser.w.document.getElementById('engines') &&
    !rUser.w.document.getElementById('engines-own'));
  check('Beim Admin stehen sie sehr wohl da',
    rAdm.w.document.querySelectorAll('#engines .engine').length > 0 &&
    rAdm.w.document.querySelectorAll('#engines-own .engine-slot').length === 3,
    `${rAdm.w.document.querySelectorAll('#engines .engine').length} Anbieter`);

  /* Die veraltete Anleitung. Eine falsche Anleitung auf dem Bildschirm ist
     schlimmer als eine fehlende: sie wird befolgt. */
  await sysSection(rUser.w, 'personal');
  const rUserCard = [...rUser.w.document.querySelectorAll('.sys-card')]
    .find(k => k.querySelector('h3')?.textContent.trim() === ACCOUNT_CARD);
  check('Die Karte "Mein Account" ist ueberhaupt da', !!rUserCard);
  check('Sie nennt AUTH_RESET nicht mehr',
    !!rUserCard && !/AUTH_RESET/.test(rUserCard.textContent || ''),
    rUserCard?.textContent?.slice(0, 200));
  /* SEIT 0.17.1 HAENGT DER BEFEHL AN DER ROLLE. */
  check('Beim gewoehnlichen Benutzer steht der Wirtsbefehl nicht mehr da',
    !!rUserCard && !/usertool\.js password/.test(rUserCard.textContent || ''),
    rUserCard?.textContent?.slice(0, 300));
  /* DER SATZ IST MIT 0.31.1 EIN ANDERER, und sein Gegenstand ist derselbe. */
  check('Sondern der Satz, der ihm wirklich hilft',
    !!rUserCard && /Link zum Zurücksetzen des Passworts geschickt werden/.test(rUserCard.textContent || ''),
    rUserCard?.textContent?.slice(0, 300));
  {
    await sysSection(rEig.w, 'personal');
    const eigUser = [...rEig.w.document.querySelectorAll('.sys-card')]
      .find(k => k.querySelector('h3')?.textContent.trim() === ACCOUNT_CARD);
    check('Beim Eigentuemer steht er sehr wohl — im Kasten „Auf dem Server"',
      !!eigUser && /usertool\.js password/.test(eigUser.textContent || ''),
      eigUser?.textContent?.slice(0, 300));
  }
  // Und ausdruecklich in der ganzen Oberflaeche nicht mehr als Anleitung:
// der String steht in app.js nur noch dort, wo sie hingehoert.
  const rAppSource = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  check('AUTH_RESET steht in der ganzen Oberflaeche nirgends mehr',
    !rAppSource.includes('AUTH_RESET'), 'public/app.js nennt AUTH_RESET noch');


  /* --- Die Kachel "Zugaenge" ueber die volle Breite --- Zwei Haelften, und
     beide werden gebraucht: die Klasse am Knoten sagt nichts darueber, ob sie
     etwas bewirkt, und die Regel im Stylesheet nichts darueber, ob sie jemand
     traegt. */
  /* ALLE BREITEN KACHELN STEHEN IM ABSCHNITT „Zugaenge", und das ist kein
     Zufall. */
  await sysSection(rEig.w, 'users');
  const rTile = [...rEig.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(k => k.querySelector('h3')?.textContent.trim() === 'Benutzer');
  check('Die Kachel "Benutzer" ist da', !!rTile);
  check('Und sie ist als breite Kachel gekennzeichnet',
    !!rTile && rTile.classList.contains('wide'),
    rTile?.className);
  /* Und ausdruecklich nicht alle: eine Kennzeichnung, die jede Kachel traegt,
     ist keine. */
  const rWidth = [...rEig.w.document.querySelectorAll('.sys-grid > .sys-card.wide')]
    .map(k => k.querySelector('h3')?.textContent.trim());
  check('Als eine von genau vieren, und alle vier namentlich',
    equal(rWidth, ['Benutzer', 'Anfragen', 'Sicherheitsprotokoll', 'Mailversand']),
    JSON.stringify(rWidth));
  /* UND KEINE SCHMALE BLEIBT IM ABSCHNITT STEHEN. */
  const rNarrow = [...rEig.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .filter(k => !k.classList.contains('wide'))
    .map(k => k.querySelector('h3')?.textContent.trim());
  check('Und im Abschnitt „Zugaenge" steht keine schmale Kachel mehr',
    rNarrow.length === 0, JSON.stringify(rNarrow));

  const rCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')
    .replace(/\s+/g, ' ');
  const rRule = (w) => (rCss.match(new RegExp(w.replace(/\./g, '\\.') + ' \\{[^}]*\\}')) || [''])[0];
  check('Die Regel fuer die breite Kachel steht ueberhaupt im Stylesheet',
    rRule('.sys-card.wide').length > 0, '(keine Regel)');
  check('Und sie zieht die Kachel ueber alle Rasterspalten',
    /grid-column: 1 \/ -1/.test(rRule('.sys-card.wide')),
    rRule('.sys-card.wide') || '(keine Regel)');
  /* Die Luecke, die eine breite Kachel davor hinterlaesst. */
  check('Die Regel fuer das Kartenraster steht ueberhaupt im Stylesheet',
    rRule('.sys-grid').length > 0, '(keine Regel)');
  check('Und das Raster zieht nachfolgende Karten in die Luecke',
    /grid-auto-flow: dense/.test(rRule('.sys-grid')),
    rRule('.sys-grid') || '(keine Regel)');
  // Die Reihenfolge im Quelltext bleibt davon unberuehrt: die Kachel steht
// weiterhin dort, wo sie stand, und nicht am Ende.
  check('Und die Kachel steht dabei nicht am Ende des Rasters',
    [...rEig.w.document.querySelectorAll('.sys-grid > .sys-card')].pop() !== rTile,
    'die breite Kachel ist ans Ende gewandert');

  /* --- Trennlinien zwischen den Abschnitten der Linkkarten --- */
  await sysSection(rUser.w, 'inventory');
  check('Die Karte "Links" traegt einen abgesetzten Abschnitt',
    rUser.w.document.querySelectorAll('.sys-card .sys-part').length > 0,
    `${rUser.w.document.querySelectorAll('.sys-card .sys-part').length} Abschnitte`);
  check('Und die Karte "Suchmaschinen" ebenfalls',
    [...rAdm.w.document.querySelectorAll('.sys-card')]
      .filter(k => k.querySelector('h3')?.textContent.trim() === 'Suchmaschinen')
      .some(k => k.querySelector('.sys-part')),
    'kein abgesetzter Abschnitt in der Karte "Suchmaschinen"');
  check('Die Regel dafuer steht ueberhaupt im Stylesheet',
    rRule('.sys-card .sys-part').length > 0, '(keine Regel)');
  check('Und sie zieht eine Linie darueber, nicht bloss einen Abstand',
    /border-top: 1px solid var\(--line\)/.test(rRule('.sys-card .sys-part')) &&
    /padding-top:/.test(rRule('.sys-card .sys-part')),
    rRule('.sys-card .sys-part') || '(keine Regel)');
  // Keine neue Farbe: --line gibt es laengst und bedeutet dort bereits
// "Kante zwischen zwei Flaechen".
  check('Ohne eine neue Farbe dafuer zu erfinden',
    !/border-top: 1px solid (?!var\(--line\))/.test(rRule('.sys-card .sys-part')),
    rRule('.sys-card .sys-part'));

  rEig.w.close(); rAdm.w.close(); rUser.w.close();

  /* ---------------------------------------------------------------- */
  group('Die Einladungsseite in der Oberflaeche');

  /* EIN ZUSTAND DER ANMELDESEITE, KEINE ZWEITE AUSGELIEFERTE DATEI -- sonst
     gaebe es eine zweite Stelle fuer Kopfzeilen, Content-Security-Policy und
     die Sicherheitsregel aus Abschnitt 5a. */
  const eiBuild = async (key) => {
    const d = buildDom(JSDOM, { hash: `#/invite/${key}` });
    await until(d.w, (x) => x.document.querySelector('#ep, #eb-again, #lu, #count') &&
      openRequests(x) === 0, 2000, 'die Einladungsseite');
    return d;
  };

  const eiGood = await eiBuild('d'.repeat(64));
  check('Der Aufruf mit einem Link fragt den Server nach ihm',
    eiGood.sent.some(x => x.method === 'POST' && x.url === '/api/token/check'),
    eiGood.sent.map(x => `${x.method} ${x.url}`).join(' · '));
  /* DER SCHLUESSEL GEHT IM RUMPF, NICHT IN DER ADRESSE. Ohne diese Zeile
     bliebe die Pruefung auch dann gruen, wenn er im Pfad stuende. */
  check('Und zwar im Rumpf, nicht in der Adresse',
    eiGood.sent.find(x => x.url === '/api/token/check')?.body?.token === 'd'.repeat(64) &&
    !eiGood.sent.some(x => x.url.includes('d'.repeat(64))),
    eiGood.sent.map(x => x.url).join(' · '));
  check('Die Anmeldemaske wird dabei gar nicht erst gebaut',
    !eiGood.sent.some(x => x.url === '/api/session'),
    eiGood.sent.map(x => x.url).join(' · '));
  check('Die Seite kennzeichnet sich als Anmeldeseite',
    eiGood.w.document.body.classList.contains('login'));
  check('Sie steht in derselben Karte wie die Anmeldung',
    !!eiGood.w.document.querySelector('.login-screen .login-card'), 'keine Anmeldekarte');
  /* DER NAME KOMMT VOM SERVER, und zwar erst, wenn der Link traegt. */
  check('Sie begruesst mit dem Namen aus der Antwort',
    /Willkommen, carla/.test(eiGood.w.document.body.textContent), 
    eiGood.w.document.body.textContent.slice(0, 200));
  check('Und sie sagt, dass ein Passwort zu waehlen ist',
    /Passwort wählen/.test(eiGood.w.document.body.textContent),
    eiGood.w.document.body.textContent.slice(0, 200));
  check('Zwei Passwortfelder stehen da',
    !!eiGood.w.document.getElementById('ep') && !!eiGood.w.document.getElementById('ep2'));
  check('Sie nennt den Mindestwert aus der Antwort',
    /Mindestens 10 Zeichen/.test(eiGood.w.document.body.textContent),
    eiGood.w.document.body.textContent.slice(0, 400));
  check('Und sie sagt, dass alle anderen Geraete abgemeldet werden',
    /auf allen anderen Geräten abgemeldet/.test(eiGood.w.document.body.textContent),
    eiGood.w.document.body.textContent.slice(0, 400));
  /* Und der zweite Anlass: derselbe Weg, anderer Text -- ABGELEITET AUS DEM
     ZUSTAND (hat der Zugang schon ein Passwort), nicht aus dem Zweck. */
  const eiBack = await eiBuild('f'.repeat(64));
  check('Bei einem Zugang MIT Passwort steht ein anderer Text',
    /Neues Passwort für/.test(eiBack.w.document.body.textContent) &&
    !/Willkommen/.test(eiBack.w.document.body.textContent),
    eiBack.w.document.body.textContent.slice(0, 200));
  check('Und auch dort steht der Name',
    /dora/.test(eiBack.w.document.body.textContent),
    eiBack.w.document.body.textContent.slice(0, 200));

  /* DIE ABSAGE: zurueck auf die gewoehnliche Anmeldeseite, mit der Message
     darueber -- und die Adresse wird geleert, damit ein Neuladen nicht
     denselben toten Link noch einmal versucht. */
  const eiPath = await eiBuild('9'.repeat(64));
  check('Ein Link, der nicht mehr gilt, fuehrt auf die Anmeldeseite',
    !!eiPath.w.document.getElementById('lu') && !!eiPath.w.document.getElementById('lp'),
    'keine Anmeldemaske');
  check('Mit der Absage darueber',
    /gilt nicht mehr/.test(eiPath.w.document.querySelector('.login-error')?.textContent || ''),
    eiPath.w.document.querySelector('.login-error')?.textContent);
  check('Und die Absage nennt das Heilmittel',
    /beim Admin einen neuen/.test(eiPath.w.document.querySelector('.login-error')?.textContent || ''),
    eiPath.w.document.querySelector('.login-error')?.textContent);
  check('Die Adresse ist danach geleert',
    eiPath.w.location.hash === '#/', eiPath.w.location.hash);
  check('Und es steht kein Passwortfeld der Einladung mehr da',
    !eiPath.w.document.getElementById('ep'), 'das Formular steht noch');
  /* DIE FRIST AB DEM ERSTEN OEFFNEN, seit 0.9.0 -- und sie gehoert an die
     Stelle, an der sie LAEUFT. */
  check('Die Einladungsseite nennt die Frist ab dem ersten Oeffnen',
    /gilt noch 15 Minuten/.test(eiGood.w.document.body.textContent),
    eiGood.w.document.body.textContent.slice(0, 600));
  /* GEKUERZT MIT 0.9.1 -- EIN SATZ WENIGER, NICHT EINE AUSKUNFT WENIGER. */
  /* UMGEDREHT MIT 0.22.0: der Satz ueber das Neuladen ist weg (Bauprozess,
     Anlage A, Z. */
  check('Und sagt, was nach der Frist zu tun ist',
    /danach\s+brauchst du einen neuen vom Admin/i.test(eiGood.w.document.body.textContent),
    eiGood.w.document.body.textContent.slice(0, 600));
  check('Und dass das Setzen die anderen Geraete abmeldet — 0.22.0',
    /Nach dem Setzen wirst du auf allen anderen Geräten abgemeldet/.test(eiGood.w.document.body.textContent),
    eiGood.w.document.body.textContent.slice(0, 600));
  /* UND SIE IST WIRKLICH KUERZER: der dritte Satz ist weg. */
  check('Und der Satz, der dasselbe zweimal sagte, steht nicht mehr da',
    !/Seit dem ersten Öffnen läuft eine Frist/.test(eiGood.w.document.body.textContent),
    eiGood.w.document.body.textContent.slice(0, 600));

  /* ---- BEFUND G, behoben in 0.9.0 ---- EINE VORUEBERGEHENDE ABSAGE DARF DEN
     SCHLUESSEL NICHT WEGWERFEN. */
  const eiThrottle = await (async () => {
    const d = buildDom(JSDOM, { hash: `#/invite/${'d'.repeat(64)}`, tokenThrottle: 1 });
    await until(d.w, (x) => x.document.querySelector('#ep, #eb-again, #lu, #count') &&
      openRequests(x) === 0, 2000, 'die Einladungsseite');
    return d;
  })();
  check('Eine Absage der Bremse fuehrt NICHT auf die Anmeldemaske',
    !eiThrottle.w.document.getElementById('lu'), 'die Anmeldemaske steht da');
  check('Der Schluessel bleibt in der Adresse stehen',
    eiThrottle.w.location.hash === `#/invite/${'d'.repeat(64)}`, eiThrottle.w.location.hash);
  check('Die Seite sagt, dass der Link davon nicht betroffen ist',
    /gilt weiter/.test(eiThrottle.w.document.body.textContent),
    eiThrottle.w.document.body.textContent.slice(0, 400));
  check('Und sie nennt den Grund der Bremse',
    /Zu viele Fehlversuche/.test(eiThrottle.w.document.querySelector('.login-error')?.textContent || ''),
    eiThrottle.w.document.querySelector('.login-error')?.textContent);
  const eiButton = eiThrottle.w.document.getElementById('eb-again');
  check('Ein zweiter Anlauf steht als Knopf da', !!eiButton, 'kein Knopf');
  {
    /* ERST DAS VORHANDENSEIN, DANN DIE EIGENSCHAFT, und hier nicht aus
       Ordnungsliebe: eine Gegenprobe nimmt genau
       diesen Knopf weg, und ein .dispatchEvent auf null riss den ganzen Lauf
       ab, statt die Pruefungen darunter rot zu faerben. */
    // Ein wirklich zugestelltes Ereignis: ein Knopf ist erst geprueft, wenn er geklickt wurde.
    if (eiButton) eiButton.dispatchEvent(new eiThrottle.w.MouseEvent('click', { bubbles: true }));
    await until(eiThrottle.w, (x) => !eiButton ||
      (eiThrottle.sent.filter(g => g.url === '/api/token/check').length > 1 && openRequests(x) === 0),
      2000, 'die Antwort auf den zweiten Anlauf');
    check('Und der zweite Anlauf fuehrt wirklich zum Formular',
      !!eiThrottle.w.document.getElementById('ep') &&
      /Willkommen, carla/.test(eiThrottle.w.document.body.textContent),
      eiThrottle.w.document.body.textContent.slice(0, 200));
    check('Der Schluessel ist dabei derselbe geblieben',
      eiThrottle.sent.filter(x => x.url === '/api/token/check')
        .every(x => x.body?.token === 'd'.repeat(64)),
      JSON.stringify(eiThrottle.sent.filter(x => x.url === '/api/token/check').map(x => x.body?.token)));
  }
  /* UND DIE GEGENRICHTUNG, damit die Unterscheidung wirklich eine ist: die
     ENDGUELTIGE Absage (400) leert die Adresse weiterhin. */
  check('Die endgueltige Absage leert die Adresse dagegen weiterhin',
    eiPath.w.location.hash === '#/' && !eiPath.w.document.getElementById('eb-again'),
    `${eiPath.w.location.hash} · Knopf: ${!!eiPath.w.document.getElementById('eb-again')}`);

  /* Ein Fragment, das gar kein Schluessel ist, geht den gewoehnlichen Weg --
     ohne den Server nach ihm zu fragen. */
  const eiNonsense = await eiBuild('kurz');
  check('Ein Fragment ohne Schluessel wird gar nicht erst gefragt',
    !eiNonsense.sent.some(x => x.url === '/api/token/check'),
    eiNonsense.sent.map(x => x.url).join(' · '));

  /* DAS PASSWORT SETZEN, mit einem WIRKLICH zugestellten Ereignis. */
  {
    const d = await eiBuild('d'.repeat(64));
    setField(d.w.document, 'ep', 'kurz');
    setField(d.w.document, 'ep2', 'kurz');
    let ebBefore = d.w.document.getElementById('eb');
    ebBefore.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => x.document.getElementById('eb') !== ebBefore && openRequests(x) === 0,
      2000, 'die neu gezeichnete Einladungsseite');
    check('Ein zu kurzes Passwort geht gar nicht erst an den Server',
      !d.sent.some(x => x.url === '/api/token/redeem'),
      d.sent.map(x => x.url).join(' · '));
    check('Und die Seite sagt es',
      /mindestens 10 Zeichen/.test(d.w.document.querySelector('.login-error')?.textContent || ''),
      d.w.document.querySelector('.login-error')?.textContent);

    setField(d.w.document, 'ep', 'ein-gutes-passwort');
    setField(d.w.document, 'ep2', 'ein-anderes-passwort');
    ebBefore = d.w.document.getElementById('eb');
    ebBefore.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => x.document.getElementById('eb') !== ebBefore && openRequests(x) === 0,
      2000, 'die neu gezeichnete Einladungsseite');
    check('Zwei verschiedene Passwoerter ebenso wenig',
      !d.sent.some(x => x.url === '/api/token/redeem'),
      d.sent.map(x => x.url).join(' · '));
    check('Und auch das sagt die Seite',
      /stimmen nicht überein/.test(d.w.document.querySelector('.login-error')?.textContent || ''),
      d.w.document.querySelector('.login-error')?.textContent);

    setField(d.w.document, 'ep', 'ein-gutes-passwort');
    setField(d.w.document, 'ep2', 'ein-gutes-passwort');
    ebBefore = d.w.document.getElementById('eb');
    ebBefore.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => x.document.getElementById('eb') !== ebBefore && openRequests(x) === 0,
      2000, 'die Seite nach dem Setzen des Passworts');
    const set = d.sent.find(x => x.url === '/api/token/redeem');
    check('Zwei gleiche gehen an den Server',
      !!set && set.method === 'POST', JSON.stringify(set));
    check('Mit dem Schluessel und dem Passwort im Rumpf',
      set?.body?.token === 'd'.repeat(64) &&
      set?.body?.password === 'ein-gutes-passwort', JSON.stringify(set?.body));
    check('Danach ist die Adresse geleert -- der Link ist verbraucht',
      d.w.location.hash === '#/', d.w.location.hash);
    /* UND DIE SEITE GEHT WEITER, statt stehenzubleiben: angemeldet ist man
       bereits, der Server hat den Cookie mitgeschickt. */
    check('Und die Oberflaeche baut sich auf',
      !d.w.document.body.classList.contains('login'),
      'die Seite steht noch auf der Anmeldung');
  }


  /* ---------------------------------------------------------------- */
  group('Die Markenzeile der Anmeldeseiten');

  /* AUS DEM BETRIEB: die Marke stand UEBER dem Namen der Instanz, und das
     Paar las sich als Bild mit einer Ueberschrift darunter -- zwei Dinge
     statt einem. */
  const mzDom = buildDom(JSDOM, { loggedIn: false, signup: false });
  await until(mzDom.w, (x) => x.document.getElementById('lu') && openRequests(x) === 0,
    2000, 'die Anmeldeseite');
  const mzRow = mzDom.w.document.querySelector('.login-card .login-brand');
  check('Die Anmeldeseite traegt eine Markenzeile', Boolean(mzRow),
    'keine Zeile im Baum');
  const mzChildren = mzRow ? [...mzRow.children] : [];
  check('Darin stehen genau zwei Dinge', mzChildren.length === 2,
    mzChildren.map(e => e.tagName).join(' ') || '(leer)');
  /* SEIT 0.23.0 IST DAS ZEICHEN EIN SVG UND KEIN BILD MEHR -- es muss
     Variablen lesen koennen (siehe „Die Marke der Instanz"). */
  check('Erst das Zeichen',
    mzChildren[0]?.tagName?.toLowerCase() === 'svg' && mzChildren[0]?.classList.contains('logo'),
    `${mzChildren[0]?.tagName} ${mzChildren[0]?.getAttribute('class') || ''}`);
  check('Dann das Wort',
    mzChildren[1]?.tagName === 'H1' && /\S/.test(mzChildren[1]?.textContent || ''),
    `${mzChildren[1]?.tagName} ${JSON.stringify(mzChildren[1]?.textContent || '')}`);
  /* UND DIE MARKE STEHT NICHT MEHR EIN ZWEITES MAL DANEBEN. */
  check('Und ausserhalb der Zeile steht keine zweite Marke',
    mzDom.w.document.querySelectorAll('.login-card .logo').length === 1,
    `${mzDom.w.document.querySelectorAll('.login-card .logo').length} Marken in der Karte`);
  /* DAS ZEICHEN BLEIBT STUMM: es steht unmittelbar neben dem Namen der
     Instanz, ein Vorleseprogramm saegte ihn sonst zweimal. */
  // Bis 0.22.1 war das alt=""; an einem SVG ist aria-hidden die Entsprechung.
  check('Das Zeichen bleibt fuer das Vorleseprogramm stumm',
    mzChildren[0]?.getAttribute('aria-hidden') === 'true'
      && !mzChildren[0]?.getAttribute('title') && !mzChildren[0]?.querySelector('title'),
    `aria-hidden=${JSON.stringify(mzChildren[0]?.getAttribute('aria-hidden'))}`);
  mzDom.w.close();

  /* ---------------------------------------------------------------- */
  group('Die Anmeldeseite: das Anfrageformular');

  /* DAS FORMULAR STEHT NUR DA, WENN DER SERVER SAGT, DASS DIE SELBSTANMELDUNG
     AN IST. */
  const sOut = buildDom(JSDOM, { loggedIn: false, signup: false });
  await until(sOut.w, (x) => x.document.getElementById('lu') && openRequests(x) === 0,
    2000, 'die Anmeldeseite');
  check('Ist die Selbstanmeldung aus, steht auf der Anmeldeseite kein Formular',
    !sOut.w.document.getElementById('l-request'), 'der Knopf steht da');
  check('Und auch die Frage darueber nicht',
    !sOut.w.document.querySelector('.login-divider'), 'die Frage steht da');
  check('Und die Anmeldemaske selbst ist unveraendert da',
    Boolean(sOut.w.document.getElementById('lu') && sOut.w.document.getElementById('lp')),
    'die Anmeldemaske fehlt');

  const sAn = buildDom(JSDOM, { loggedIn: false, signup: true });
  await until(sAn.w, (x) => x.document.getElementById('lu') && openRequests(x) === 0,
    2000, 'die Anmeldeseite');
  const sReference = sAn.w.document.getElementById('l-request');
  check('Ist sie an, steht der Weg "Zugang anfragen" da', Boolean(sReference),
    'der Weg fehlt');
  /* ER IST EIN KNOPF UND KEIN VERWEIS IN EINER FUSSZEILE -- eine Berichtigung
     aus dem Betrieb: der Verweis wurde uebersehen. */
  check('Und zwar als KNOPF, nicht als Verweis in einer Fusszeile',
    sReference?.tagName === 'BUTTON', String(sReference?.tagName));
  check('Er traegt dieselbe Knopfklasse wie "Anmelden"',
    sReference?.classList.contains('btn'), sReference?.className);
  /* UND ER IST NICHT DER LAUTERE VON BEIDEN: zwei gleich betonte Knoepfe sagen
     nicht mehr, welcher der gewoehnliche Weg ist. */
  check('Aber nicht in der Betonung des Anmeldeknopfs',
    !sReference?.classList.contains('btn-accent') &&
    sAn.w.document.getElementById('lb')?.classList.contains('btn-accent'),
    `${sReference?.className} · ${sAn.w.document.getElementById('lb')?.className}`);
  /* DIE FRAGE STEHT UEBER DEM KNOPF, nicht daneben und nicht darin. */
  const sQuestion = sAn.w.document.querySelector('.login-divider');
  check('Darueber steht die Frage nach dem Account',
    D.shows(sQuestion?.textContent, 'login.noAccountYet'), sQuestion?.textContent || '(fehlt)');
  check('Und sie steht wirklich VOR dem Knopf',
    sQuestion?.nextElementSibling === sReference,
    String(sQuestion?.nextElementSibling?.id || sQuestion?.nextElementSibling?.tagName));
  check('Der Knopf steht unter dem Anmeldeknopf',
    Boolean(sAn.w.document.getElementById('lb')?.compareDocumentPosition(sReference) &
      sAn.w.Node.DOCUMENT_POSITION_FOLLOWING), 'er steht davor');
  check('Und die Anmeldemaske steht weiterhin daneben',
    Boolean(sAn.w.document.getElementById('lu')), 'die Anmeldemaske fehlt');
  /* DIE TRENNUNG STEHT IM STYLESHEET -- ohne sie liefe der Knopf optisch mit dem
     Anmeldeknopf zusammen. */
  const sCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')
    .replace(/\s+/g, ' ');
  const sRule = (sCss.match(/\.login-card \.login-divider \{[^}]*\}/) || [''])[0];
  check('Die Regel fuer die Trennung steht im Stylesheet', sRule.length > 0,
    'keine Regel gefunden');
  /* UND SIE TRENNT MIT ABSTAND STATT MIT EINEM STRICH. */
  check('Und sie tut das OHNE Strich',
    !/border/.test(sRule), sRule);
  check('Sondern mit einem Abstand, der groesser ist als jede Luecke davor',
    (Number((sRule.match(/margin: *(\d+)px/) || [0, 0])[1]) || 0) > 24, sRule);
  /* GEDAEMPFT, ABER ERKENNBAR EIN KNOPF, und die Grenze zwischen beidem ist
     der Punkt. */
  check('Der Knopf traegt die gedaempfte Klasse',
    sReference?.classList.contains('login-alt'), sReference?.className);
  const sQuiet = (sCss.match(/\.login-card \.login-alt \{[^}]*\}/) || [''])[0];
  check('Und die Regel dazu steht im Stylesheet', sQuiet.length > 0,
    'keine Regel gefunden');
  check('Sie faerbt ihn leicht ein statt ihn leer zu lassen',
    /background: *var\(--accent-dim\)/.test(sQuiet), sQuiet);
  check('Und zieht die Umrandung in dieselbe Farbe',
    /border-color: *var\(--accent-line\)/.test(sQuiet), sQuiet);
  /* DIE GEGENLAGE: die beiden Werte sind wirklich die leisen. */
  const sCoverage = ['--accent-dim', '--accent-line'].map(n => {
    /* DIE KLAMMER IST SEIT 0.23.0 VERSCHACHTELT -- `rgba(var(--accent-rgb),
       .13)`. */
    const t = (sCss.match(new RegExp(`${n}: *rgba\\((?:[^()]|\\([^()]*\\))*\\)`)) || [''])[0];
    const a = t.match(/,\s*(0?\.\d+|0|1)\)/);
    return { n, t, a: a ? Number(a[1]) : NaN };
  });
  check('Und beide Werte sind wirklich nur angedeutet',
    sCoverage.every(d => d.a > 0 && d.a < 0.5),
    sCoverage.map(d => `${d.n} = ${d.t || '(fehlt)'}`).join(' '));
  check('Er traegt NICHT den vollen Akzent des Anmeldeknopfs',
    !/background: *var\(--accent\)/.test(sQuiet) && !/color: *var\(--accent\)/.test(sQuiet),
    sQuiet);
  check('Und seine Schrift bleibt die leise',
    /color: *var\(--muted\)/.test(sQuiet), sQuiet);
  check('Aber NICHT ohne Umrandung -- sonst waere er wieder ein Verweis',
    !/border(-color)?: *(transparent|none|0)/.test(sQuiet), sQuiet);
  /* UND DIE GEGENLAGE ZUR REGEL SELBST: die Grundklasse traegt die Umrandung
     ueberhaupt. */
  check('Denn die Grundklasse .btn traegt eine',
    /\.btn \{[^}]*border: *1px solid/.test(sCss),
    (sCss.match(/\.btn \{[^}]*\}/) || [''])[0]);
  /* UEBER EIN WIRKLICH ZUGESTELLTES EREIGNIS -- ein
     aufgerufener Behandler belegt nicht, dass ein Klick ankommt. */
  sReference.dispatchEvent(new sAn.w.MouseEvent('click', { bubbles: true, cancelable: true }));
  await until(sAn.w, (x) => !x.document.getElementById('lu'), 2000, 'das Anfrageformular');
  const sName = sAn.w.document.getElementById('req-name');
  const sMail = sAn.w.document.getElementById('req-mail');
  check('Der Klick fuehrt zum Formular mit Name und Adresse',
    Boolean(sName && sMail), 'das Formular fehlt');
  /* KEIN PASSWORTFELD. */
  check('Und ohne jedes Passwortfeld',
    sAn.w.document.querySelectorAll('.login-card input[type="password"]').length === 0,
    `${sAn.w.document.querySelectorAll('.login-card input[type="password"]').length} Passwortfelder`);
  check('Die Laenge der Eingaben ist am Feld begrenzt',
    sName.getAttribute('maxlength') === '64' && sMail.getAttribute('maxlength') === '254',
    `${sName.getAttribute('maxlength')} / ${sMail.getAttribute('maxlength')}`);
  sName.value = 'neuling';
  sMail.value = 'neuling@beispiel.de';
  const sSend = sAn.w.document.getElementById('req-send');
  sSend.dispatchEvent(new sAn.w.MouseEvent('click', { bubbles: true, cancelable: true }));
  await until(sAn.w, (x) => x.document.getElementById('req-send') !== sSend && openRequests(x) === 0,
    2000, 'die Seite nach dem Abschicken');
  const sSent = sAn.sent.find(x => x.url === '/api/signup');
  check('Das Abschicken geht an POST /api/signup',
    Boolean(sSent) && sSent.method === 'POST',
    sAn.sent.map(x => `${x.method} ${x.url}`).join(' · '));
  check('Und zwar mit Name und Adresse im Rumpf',
    sSent?.body?.name === 'neuling' && sSent?.body?.address === 'neuling@beispiel.de',
    JSON.stringify(sSent?.body));
  check('Der Rumpf traegt sonst nichts -- keine Rolle, kein Passwort',
    equal(Object.keys(sSent?.body || {}).sort(), ['address', 'name']),
    JSON.stringify(Object.keys(sSent?.body || {})));
  /* DIE MELDUNG KOMMT VOM SERVER UND WIRD NICHT ERFUNDEN -- eine zweite
     Ausfertigung in der Oberflaeche liefe beim naechsten Wort auseinander. */
  const sDank = sAn.w.document.getElementById('req-thanks');
  check('Danach steht die Dankseite da', Boolean(sDank), 'die Dankseite fehlt');
  check('Und sie zeigt genau die Meldung des Servers',
    (sDank?.textContent || '').includes('Postfach') &&
    (sDank?.textContent || '').includes('Admin'),
    sDank?.textContent || '(leer)');
  check('Sie verraet nicht, ob der Name frei war',
    !/vergeben|bereits|frei/i.test(sDank?.textContent || ''), sDank?.textContent || '');

  /* ---------------------------------------------------------------- */

  group('Die Anmeldeseite: der zweite Schritt');

  /* WAS DER MENSCH SIEHT, IST DIE HAELFTE DIESER RUNDE. */
  /* Klickt per dispatchEvent und wartet auf `condition`; fehlt der Knopf, wird nicht gewartet. */
  const zdClickable = async (w, el, condition, what) => {
    if (!el) return;
    el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await until(w, condition, 2000, what);
  };
  // Dasselbe Abfangen fuer ein Eingabefeld.
  const zfSet = (w, id, value) => {
    const el = w.document.getElementById(id);
    if (el) el.value = value;
    return Boolean(el);
  };

  const zdLogin = async (factor) => {
    const d = buildDom(JSDOM, { loggedIn: false, loginFactor: factor });
    await until(d.w, (x) => x.document.getElementById('lu') && openRequests(x) === 0,
      2000, 'die Anmeldeseite');
    setField(d.w.document, 'lu', 'chefin');
    setField(d.w.document, 'lp', 'chefins-wort-100');
    const lb = d.w.document.getElementById('lb');
    await zdClickable(d.w, lb, (x) => !lb.isConnected && openRequests(x) === 0,
      'die Seite nach der Anmeldung');
    return d;
  };

  /* OHNE ZWEITEN FAKTOR AENDERT SICH NICHTS -- die Gegenlage steht zuerst. */
  const zdWithout = await zdLogin(false);
  check('Ohne zweiten Faktor fuehrt die Anmeldung wie bisher hinein',
    !zdWithout.w.document.getElementById('two-factor-code') &&
    !zdWithout.w.document.querySelector('.login-card'),
    zdWithout.w.document.querySelector('.login-card') ? 'die Anmeldekarte steht noch da' : 'kein Codefeld');

  const zdIncluding = await zdLogin(true);
  const zdField = zdIncluding.w.document.getElementById('two-factor-code');
  check('Mit zweitem Faktor steht danach die Frage nach dem Code',
    Boolean(zdField), 'das Codefeld fehlt');
  check('Und das Passwortfeld ist fort -- es ist ein zweiter SCHRITT, kein zweites Feld',
    !zdIncluding.w.document.getElementById('lp'), 'das Passwortfeld steht noch da');
  check('Die Marke der Instanz steht auch hier',
    Boolean(zdIncluding.w.document.querySelector('.login-brand')), 'keine Markenzeile');
  /* DER WEG UEBER DEN WIEDERHERSTELLUNGSCODE STEHT DANEBEN, nicht hinter
     einem Knopf: wer sein Telefon nicht hat, sucht ihn genau in diesem
     Augenblick -- und findet ihn nicht, wenn er erst aufzuklappen waere. */
  check('Und der Hinweis auf die Wiederherstellungscodes steht ohne Klick da',
    /Wiederherstellungscode/.test(zdIncluding.w.document.querySelector('.login-card')?.textContent || ''),
    zdIncluding.w.document.querySelector('.login-card')?.textContent?.slice(-160));
  check('Ein Feld fuer BEIDE Formen, kein Umschalter daneben',
    zdIncluding.w.document.querySelectorAll('.login-card input').length === 1,
    String(zdIncluding.w.document.querySelectorAll('.login-card input').length));
  /* --- 0.12.3: und die Beschriftung schliesst keine der beiden Formen aus
     --- "Sechsstelliger Code" war fuer den Wiederherstellungscode falsch --
     der hat zehn Zeichen -- und "aus deiner App" fuer ihn ebenso: er kommt
     von einem Zettel. */
  const zdLabel = zdIncluding.w.document.querySelector('label[for="two-factor-code"]')?.textContent || '';
  check('Die Beschriftung nennt das Verfahren und keine Zeichenzahl',
    /Zwei-Faktor-Code/.test(zdLabel) && !/[Ss]echsstellig/.test(zdLabel), zdLabel);
  check('Und die Seite spricht nirgends mehr von einer App',
    !/\bApp\b/i.test(zdIncluding.w.document.querySelector('.login-card')?.textContent || ''),
    (zdIncluding.w.document.querySelector('.login-card')?.textContent || '').replace(/\s+/g, ' ').slice(0, 200));
  /* DER AUSWEIS AUS SCHRITT 1 WIRD WIRKLICH MITGESCHICKT und nicht neu
     erfunden -- er ist die einzige Verbindung zwischen den beiden Schritten. */
  const zdOne = zdIncluding.sent.filter(g => g.url === '/api/login').pop();
  check('Schritt 1 ist wirklich gelaufen', Boolean(zdOne), JSON.stringify(zdOne));

  // Ein falscher Code: die Seite bleibt stehen, nennt die Absage und geht mit
// dem FRISCHEN Ausweis weiter -- ein Tippfehler kostet nicht das Passwort.
  zfSet(zdIncluding.w, 'two-factor-code', '000000');
  const zdSend1 = zdIncluding.w.document.getElementById('two-factor-send');
  await zdClickable(zdIncluding.w, zdSend1, (x) => !zdSend1.isConnected && openRequests(x) === 0,
    'die Seite nach dem falschen Code');
  const zdWrong = zdIncluding.sent.filter(g => g.url === '/api/login/second').pop();
  check('Ein falscher Code laesst den Menschen auf dieser Seite',
    Boolean(zdIncluding.w.document.getElementById('two-factor-code')), 'die Seite ist gewechselt');
  check('Und nennt die Absage',
    /Der Code stimmt nicht/.test(zdIncluding.w.document.querySelector('.login-error')?.textContent || ''),
    zdIncluding.w.document.querySelector('.login-error')?.textContent || '(keine Absage)');
  check('Die Absage nennt nicht, ob er falsch oder abgelaufen war',
    !/abgelaufen|verbraucht|zu spät|zu spaet/i.test(
      zdIncluding.w.document.querySelector('.login-error')?.textContent || ''),
    zdIncluding.w.document.querySelector('.login-error')?.textContent);
  check('Der erste Ausweis ist dabei mitgegangen',
    zdWrong?.body?.ticket === 'ausweis-1', JSON.stringify(zdWrong?.body));

  // Und jetzt der richtige.
  zfSet(zdIncluding.w, 'two-factor-code', '123456');
  const zdSend2 = zdIncluding.w.document.getElementById('two-factor-send');
  await zdClickable(zdIncluding.w, zdSend2, (x) => !zdSend2.isConnected && openRequests(x) === 0,
    'die Seite nach dem richtigen Code');
  const zdRight = zdIncluding.sent.filter(g => g.url === '/api/login/second').pop();
  check('Der zweite Anlauf nimmt den FRISCHEN Ausweis aus der Absage',
    zdRight?.body?.ticket === 'ausweis-2', JSON.stringify(zdRight?.body));
  check('Und mit richtigem Code fuehrt der Weg hinein',
    !zdIncluding.w.document.getElementById('two-factor-code') &&
    !zdIncluding.w.document.querySelector('.login-card'),
    zdIncluding.w.document.querySelector('.login-card') ? 'die Karte steht noch da' : 'drin');

  /* EIN WIEDERHERSTELLUNGSCODE TRAEGT AN DERSELBEN STELLE. Ohne diese Lage
     bliebe der Satz auf dem Bildschirm eine Behauptung. */
  const zdAgain = await zdLogin(true);
  zfSet(zdAgain.w, 'two-factor-code', 'AAAAA-BBBBB');
  const zdSend3 = zdAgain.w.document.getElementById('two-factor-send');
  await zdClickable(zdAgain.w, zdSend3, (x) => !zdSend3.isConnected && openRequests(x) === 0,
    'die Seite nach dem Wiederherstellungscode');
  check('Ein Wiederherstellungscode traegt in demselben Feld',
    !zdAgain.w.document.querySelector('.login-card'),
    zdAgain.w.document.querySelector('.login-card')?.textContent?.slice(0, 80));

  /* IST DER AUSWEIS FORT, GEHT ES ZURUECK AN DEN ANFANG -- und zwar an einem
     FELD und nicht an einem Statuscode: liegt der Absage ein frischer Ausweis
     bei, war der Code falsch; liegt keiner bei, ist hier nichts mehr zu
     holen. */
  const zdPath = await zdLogin(true);
  const zdSendOld = zdPath.w.document.getElementById('two-factor-send');
  zdPath.w.showSecondFactor('erfundener-ausweis');
  await until(zdPath.w, (x) => x.document.getElementById('two-factor-send') !== zdSendOld,
    2000, 'der zweite Schritt mit dem erfundenen Ausweis');
  zfSet(zdPath.w, 'two-factor-code', '123456');
  const zdSend4 = zdPath.w.document.getElementById('two-factor-send');
  await zdClickable(zdPath.w, zdSend4, (x) => !zdSend4.isConnected && openRequests(x) === 0,
    'die Seite nach dem abgelaufenen Ausweis');
  check('Ein abgelaufener Ausweis fuehrt zurueck auf die Anmeldeseite',
    Boolean(zdPath.w.document.getElementById('lp')) && !zdPath.w.document.getElementById('two-factor-code'),
    zdPath.w.document.querySelector('.login-card')?.textContent?.slice(0, 100));
  check('Und sagt dort, dass von vorn angefangen werden muss',
    /abgelaufen/.test(zdPath.w.document.querySelector('.login-error')?.textContent || ''),
    zdPath.w.document.querySelector('.login-error')?.textContent || '(keine Meldung)');

  /* UND DIE ANMELDESEITE SELBST BLEIBT UNANGETASTET: bei falschem Passwort
     sieht sie aus wie vor dieser Runde, und von einem zweiten Faktor steht
     dort kein Wort. */
  const zdWord = buildDom(JSDOM, { loggedIn: false, loginFactor: true });
  await until(zdWord.w, (x) => x.document.getElementById('lu') && openRequests(x) === 0,
    2000, 'die Anmeldeseite');
  setField(zdWord.w.document, 'lu', 'chefin');
  setField(zdWord.w.document, 'lp', 'falsches-wort-100');
  const zdLb = zdWord.w.document.getElementById('lb');
  await zdClickable(zdWord.w, zdLb, (x) => !zdLb.isConnected && openRequests(x) === 0,
    'die Seite nach dem falschen Passwort');
  check('Bei falschem Passwort bleibt es bei der gewohnten Absage',
    /Benutzername oder Passwort/.test(
      zdWord.w.document.querySelector('.login-error')?.textContent || '') &&
    !zdWord.w.document.getElementById('two-factor-code'),
    zdWord.w.document.querySelector('.login-error')?.textContent);
  check('Und kein Wort ueber einen zweiten Faktor steht auf der Seite',
    !/zweiter Faktor|Code aus deiner App/i.test(
      zdWord.w.document.querySelector('.login-card')?.textContent || ''),
    zdWord.w.document.querySelector('.login-card')?.textContent?.slice(0, 120));

  group('Die Karte „Zugang“: der zweite Faktor');

  /* KEINE NEUE KARTE -- es bleibt bei achtzehn. Der zweite Faktor steht dort,
     wo Name, Passwort und Adresse stehen: beim eigenen Zugang. */
  const zkOut = buildDom(JSDOM, { hash: '#/system' });
  await until(zkOut.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der Systembereich');
  await zkOut.w.renderSystem();
  await until(zkOut.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der neu gezeichnete Systembereich');
  const zkBlock = () => zkOut.w.document.getElementById('two-factor-block');
  check('Der Block steht in der Karte "Mein Account" und nicht in einer eigenen',
    Boolean(zkBlock()) && zkBlock().closest('.sys-card')?.querySelector('h3')?.textContent === ACCOUNT_CARD,
    zkBlock()?.closest('.sys-card')?.querySelector('h3')?.textContent || '(kein Block)');
  /* GEZAEHLT WIRD UEBER ALLE ABSCHNITTE, seit der Systembereich immer nur
     einen zeigt. */
  const zkAll = (await sysPass(zkOut)).cards;
  check('Und die Zahl der Karten bleibt bei dreiundzwanzig',
    zkAll.length === 23, `${zkAll.length}: ${zkAll.join(' · ')}`);
  await sysSection(zkOut.w, 'personal');
  /* DER ZUSTAND STEHT OHNE KLICK DA. "An seit ..." oder "aus" -- nicht hinter
     einem Knopf, den man erst druecken muss. */
  check('Der Zustand "aus" steht ohne Klick da',
    /Zweiter Faktor: aus/.test(zkBlock()?.textContent || ''), zkBlock()?.textContent?.slice(0, 90));
  check('Und daneben der Knopf zum Einschalten',
    Boolean(zkOut.w.document.getElementById('two-factor-on')), 'der Knopf fehlt');
  check('Zum Ausschalten steht dort keiner',
    !zkOut.w.document.getElementById('two-factor-off') && !zkOut.w.document.getElementById('two-factor-new'));
  // 0.22.0: der Absatz ist zwei Saetze lang und sagt, dass die App kein Internet braucht.
  check('Und der Text sagt, dass die App kein Internet braucht',
    /kein Internet/.test(zkBlock()?.textContent || ''), zkBlock()?.textContent?.slice(0, 300));

  // Einschalten, Schritt 1: hinter dem bisherigen Passwort.
  await zdClickable(zkOut.w, zkOut.w.document.getElementById('two-factor-on'),
    (x) => x.document.getElementById('confirm-pass'), 'das Passwortfenster');
  check('Einschalten fragt zuerst nach dem bisherigen Passwort',
    Boolean(zkOut.w.document.getElementById('confirm-pass')), 'kein Passwortfenster');
  check('Und dort steht KEIN Codefeld -- es gibt noch keinen Code zu fragen',
    !zkOut.w.document.getElementById('confirm-code'), 'ein Codefeld steht da');
  await confirmImDom(zkOut, 'chefins-wort-100');
  check('Danach steht der Schluessel in Vierergruppen da',
    zkOut.w.document.getElementById('two-factor-secret')?.textContent ===
      'GEZD GNBV GY3T QOJQ GEZD GNBV GY3T QOJQ',
    zkOut.w.document.getElementById('two-factor-secret')?.textContent);
  check('Und der Bildschirm sagt, dass er nur dieses eine Mal erscheint',
    /nur dieses eine Mal/.test(
      zkOut.w.document.querySelector('.two-factor-setup')?.textContent || ''),
    zkOut.w.document.querySelector('.two-factor-setup')?.textContent?.slice(0, 140));
  const zkRow = zkOut.w.document.getElementById('two-factor-row');
  check('Daneben fuehrt ein Verweis unmittelbar in die App',
    zkRow?.getAttribute('href')?.startsWith('otpauth://totp/'),
    zkRow?.getAttribute('href'));
  check('Und er traegt dasselbe Geheimnis wie der abtippbare Schluessel',
    zkRow?.getAttribute('href')?.includes('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'));
  check('Der abtippbare Schluessel steht dabei OBEN -- er ist die Zusage, der Verweis die Bequemlichkeit',
    zkOut.w.document.getElementById('two-factor-secret')?.compareDocumentPosition(zkRow) === 4,
    String(zkOut.w.document.getElementById('two-factor-secret')?.compareDocumentPosition(zkRow)));

  // Schritt 2: der Code aus der App.
  zfSet(zkOut.w, 'two-factor-check', '000000');
  await zdClickable(zkOut.w, zkOut.w.document.getElementById('two-factor-done'),
    (x) => x.document.getElementById('confirm-pass'), 'das Passwortfenster');
  await confirmImDom(zkOut, 'chefins-wort-100');
  check('Ein falscher Code schaltet nicht ein',
    Boolean(zkOut.w.document.getElementById('two-factor-check')), 'die Seite ist gewechselt');
  zfSet(zkOut.w, 'two-factor-check', '123456');
  await zdClickable(zkOut.w, zkOut.w.document.getElementById('two-factor-done'),
    (x) => x.document.getElementById('confirm-pass'), 'das Passwortfenster');
  await confirmImDom(zkOut, 'chefins-wort-100');
  check('Mit richtigem Code steht der Zustand auf "an"',
    /Zweiter Faktor: an/.test(zkBlock()?.textContent || ''), zkBlock()?.textContent?.slice(0, 120));
  check('Und die Zahl der Wiederherstellungscodes steht daneben',
    /noch 8 von 8/.test(zkBlock()?.textContent || ''), zkBlock()?.textContent?.slice(0, 200));

  /* DIE CODES WERDEN GENAU EINMAL GEZEIGT, und der Bildschirm sagt es an
     derselben Stelle -- mit demselben Ernst wie beim Einladungslink. */
  const zkBox = () => zkOut.w.document.getElementById('two-factor-codebox');
  check('Die acht Wiederherstellungscodes stehen da',
    zkBox()?.querySelectorAll('.two-factor-codes span').length === 8,
    String(zkBox()?.querySelectorAll('.two-factor-codes span').length));
  check('Und zwar im selben Warnkasten wie der Einladungslink',
    zkBox()?.classList.contains('warn-box'), zkBox()?.className);
  check('Der Kasten sagt, dass sie nicht wiederkommen',
    /nur dieses eine Mal/.test(zkBox()?.textContent || ''),
    zkBox()?.textContent?.slice(0, 140));
  check('Und wo sie hingehoeren -- getrennt vom Handy',
    D.shows(zkBox()?.textContent, 'card.recoveryCodesHint'),
    zkBox()?.textContent?.slice(0, 220));
  check('Er nennt den Notweg ueber den Wirt fuer den Fall, dass alles weg ist',
    /usertool\.js twofactor/.test(zkBox()?.textContent || ''),
    zkBox()?.textContent?.slice(-160));
  // Und beim naechsten Aufbau der Karte sind sie fort.
  await zkOut.w.renderSystem();
  await until(zkOut.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der neu gezeichnete Systembereich');
  check('Beim naechsten Aufbau der Karte sind sie fort',
    !zkOut.w.document.getElementById('two-factor-codebox'), 'die Codes stehen noch da');
  check('Der Zustand "an" steht dagegen weiterhin ohne Klick da',
    /Zweiter Faktor: an/.test(zkBlock()?.textContent || ''), zkBlock()?.textContent?.slice(0, 90));
  check('Und das Geheimnis steht nirgends mehr auf dem Bildschirm',
    !zkOut.w.document.body.textContent.includes('GEZDGNBVGY3TQOJQ'),
    'das Geheimnis steht noch da');

  /* NEUE CODES -- der Fall, den niemand plant. Hinter Passwort UND Code, und
     das Fenster zeigt jetzt BEIDE Felder. */
  await zdClickable(zkOut.w, zkOut.w.document.getElementById('two-factor-new'),
    (x) => x.document.getElementById('confirm-pass'), 'das Passwortfenster');
  check('Neue Codes fragen nach Passwort UND Code',
    Boolean(zkOut.w.document.getElementById('confirm-pass')) &&
    Boolean(zkOut.w.document.getElementById('confirm-code')), 'ein Feld fehlt');
  await confirmImDom(zkOut, 'chefins-wort-100', false, '123456');
  check('Danach stehen acht frische Codes da',
    zkBox()?.querySelectorAll('.two-factor-codes span').length === 8 &&
    /NEU0A-BCDEF/.test(zkBox()?.textContent || ''),
    zkBox()?.textContent?.slice(0, 120));
  check('Und die Zahl steht wieder bei acht von acht',
    /noch 8 von 8/.test(zkBlock()?.textContent || ''), zkBlock()?.textContent?.slice(0, 160));

  // Ausschalten: Passwort und Code, danach wieder "aus".
  await zdClickable(zkOut.w, zkOut.w.document.getElementById('two-factor-off'),
    (x) => x.document.getElementById('confirm-pass'), 'das Passwortfenster');
  check('Ausschalten fragt ebenfalls nach beidem',
    Boolean(zkOut.w.document.getElementById('confirm-pass')) &&
    Boolean(zkOut.w.document.getElementById('confirm-code')), 'ein Feld fehlt');
  await confirmImDom(zkOut, 'chefins-wort-100', false, '000000');
  check('Mit falschem Code bleibt er an',
    /Zweiter Faktor: an/.test(zkBlock()?.textContent || ''), zkBlock()?.textContent?.slice(0, 90));
  await zdClickable(zkOut.w, zkOut.w.document.getElementById('two-factor-off'),
    (x) => x.document.getElementById('confirm-pass'), 'das Passwortfenster');
  await confirmImDom(zkOut, 'chefins-wort-100', false, '123456');
  check('Mit richtigem Code steht der Zustand wieder auf "aus"',
    /Zweiter Faktor: aus/.test(zkBlock()?.textContent || ''), zkBlock()?.textContent?.slice(0, 90));
  check('Und der Knopf zum Einschalten steht wieder da',
    Boolean(zkOut.w.document.getElementById('two-factor-on')) &&
    !zkOut.w.document.getElementById('two-factor-off'));

  /* DIE WARNUNG, WENN ES KNAPP WIRD. */
  const zkTight = buildDom(JSDOM, { hash: '#/system',
    twoFactorState: { an: true, since: '2026-08-14 10:00:00', codesOpen: 1, codesTotal: 8 } });
  await until(zkTight.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der Systembereich');
  await zkTight.w.renderSystem();
  await until(zkTight.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der neu gezeichnete Systembereich');
  const zkTightText = zkTight.w.document.getElementById('two-factor-block')?.textContent || '';
  check('Bei einem uebrigen Code bittet die Karte um neue Codes',
    /noch 1 von 8/.test(zkTightText) && /rechtzeitig neue erzeugen/.test(zkTightText),
    zkTightText.slice(0, 200));
  // SEIT 0.22.0 DURCH fmtDate: „14.08.2026" statt des ISO-Datums (Anlage F, Z. 6884).
  check('Und nennt den Tag, an dem er eingeschaltet wurde',
    /14\.08\.2026/.test(zkTightText) && !/2026-08-14/.test(zkTightText), zkTightText.slice(0, 120));
  const zkFull = buildDom(JSDOM, { hash: '#/system',
    twoFactorState: { an: true, since: '2026-08-14 10:00:00', codesOpen: 8, codesTotal: 8 } });
  await until(zkFull.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der Systembereich');
  await zkFull.w.renderSystem();
  await until(zkFull.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der neu gezeichnete Systembereich');
  check('Bei acht uebrigen steht die Warnung NICHT da',
    !/knapp/.test(zkFull.w.document.getElementById('two-factor-block')?.textContent || ''),
    zkFull.w.document.getElementById('two-factor-block')?.textContent?.slice(0, 200));

  /* DAS BESTAETIGUNGSFENSTER FOLGT DEM SERVER UND NICHT EINER VERMUTUNG: das
     Codefeld steht nur bei Zugaengen mit zweitem Faktor. */
  const zkBest = buildDom(JSDOM, { hash: '#/system',
    twoFactorState: { an: true, since: '2026-08-14 10:00:00', codesOpen: 8, codesTotal: 8 } });
  await until(zkBest.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der Systembereich');
  await zkBest.w.renderSystem();
  await until(zkBest.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der neu gezeichnete Systembereich');
  zkBest.w.secondConfirm('export', null, 'Export', 'Alles herunterladen');
  await until(zkBest.w, (x) => x.document.getElementById('confirm-pass'), 2000, 'das Passwortfenster');
  check('Mit zweitem Faktor traegt das Bestaetigungsfenster ein Codefeld',
    Boolean(zkBest.w.document.getElementById('confirm-code')), 'kein Codefeld');
  check('Und sagt daneben, warum der Code dazugehoert',
    D.shows(zkBest.w.document.querySelector('.modal .desc')?.textContent, 'dialog.twoFactorOn'),
    zkBest.w.document.querySelector('.modal .desc')?.textContent);
  /* --- 0.12.3: die Beschriftung nennt das ALGORITHM, nicht das Geraet ---
     "Code aus deiner App" war zweimal falsch. */
  const zkLabel = [...zkBest.w.document.querySelectorAll('.modal .field label')]
    .map(l => l.textContent);
  check('Das Codefeld nennt das Verfahren',
    zkLabel.some(t => /Zwei-Faktor-Code/.test(t)), JSON.stringify(zkLabel));
  check('Und keine Beschriftung im Fenster spricht mehr von einer App',
    !zkLabel.some(t => /App/i.test(t)), JSON.stringify(zkLabel));
  /* IM DIALOG STAND DER ZWEITE WEG BISHER NIRGENDS. */
  check('Und der zweite Weg steht daneben, wie an der Anmeldung',
    /Wiederherstellungscode/.test(
      zkBest.w.document.querySelector('.modal .desc')?.textContent || ''),
    zkBest.w.document.querySelector('.modal .desc')?.textContent);
  await confirmImDom(zkBest, 'chefins-wort-100', false, '123456');
  const zkBestCall = zkBest.sent.filter(g => g.url === '/api/confirm').pop();
  check('Der Code geht wirklich mit',
    zkBestCall?.body?.code === '123456' && zkBestCall?.body?.password === 'chefins-wort-100',
    JSON.stringify(zkBestCall?.body));
  const zkWithout = buildDom(JSDOM, { hash: '#/system' });
  await until(zkWithout.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der Systembereich');
  await zkWithout.w.renderSystem();
  await until(zkWithout.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
    2000, 'der neu gezeichnete Systembereich');
  zkWithout.w.secondConfirm('export', null, 'Export', 'Alles herunterladen');
  await until(zkWithout.w, (x) => x.document.getElementById('confirm-pass'), 2000, 'das Passwortfenster');
  check('Ohne zweiten Faktor steht dort kein Codefeld',
    Boolean(zkWithout.w.document.getElementById('confirm-pass')) &&
    !zkWithout.w.document.getElementById('confirm-code'), 'ein Codefeld steht da');
  check('Und auch der Zusatzsatz nicht',
    !/zweiten Faktor/.test(
      zkWithout.w.document.querySelector('.modal .desc')?.textContent || ''),
    zkWithout.w.document.querySelector('.modal .desc')?.textContent);
  await confirmImDom(zkWithout, 'chefins-wort-100');
  const zkWithoutCall = zkWithout.sent.filter(g => g.url === '/api/confirm').pop();
  check('Und im Rumpf steht dann auch kein Feld code',
    zkWithoutCall && zkWithoutCall.body.code === undefined, JSON.stringify(zkWithoutCall?.body));

  /* DIE FARBEN DES ZUSTANDS -- erst das Vorhandensein, dann die Eigenschaft. */
  const zfCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')
    .replace(/\s+/g, ' ');
  const zfRule = (w) => (zfCss.match(new RegExp(w.replace(/\./g, '\\.') + ' \\{[^}]*\\}')) || [''])[0];
  check('Der eingeschaltete Zustand traegt eine eigene Regel',
    zfRule('.two-factor-on strong').length > 0, zfRule('.two-factor-on strong') || '(keine Regel)');
  check('Und sie faerbt gruen, nicht rot',
    /--green/.test(zfRule('.two-factor-on strong')), zfRule('.two-factor-on strong'));
  check('Der ausgeschaltete Zustand ist grau und ausdruecklich nicht rot',
    zfRule('.two-factor-off strong').length > 0 && /--muted/.test(zfRule('.two-factor-off strong')) &&
    !/--red/.test(zfRule('.two-factor-off strong')), zfRule('.two-factor-off strong') || '(keine Regel)');
  check('Der Schluessel steht in fester Schrift und darf umbrechen',
    /--mono/.test(zfRule('.two-factor-key')) &&
    /overflow-wrap: anywhere/.test(zfRule('.two-factor-key')),
    zfRule('.two-factor-key') || '(keine Regel)');
  check('Und die Codeliste ebenfalls in fester Schrift',
    /--mono/.test(zfRule('.two-factor-codes span')), zfRule('.two-factor-codes span') || '(keine Regel)');

  group('Die Bestaetigungsseite in der Oberflaeche');

  /* DER SCHLUESSEL STEHT IM FRAGMENT (#/confirm/…) und geht damit nie an den
     Server -- dieselbe Bauform wie beim Einladungslink. */
  const beGood = buildDom(JSDOM, { hash: `#/confirm/${'d'.repeat(64)}` });
  await until(beGood.w, (x) => x.document.getElementById('confirm-back') && openRequests(x) === 0,
    2000, 'die Bestaetigungsseite');
  const beCall = beGood.sent.find(x => x.url === '/api/signup/confirm');
  check('Der Aufruf mit einem Bestaetigungslink fragt den Server nach ihm',
    Boolean(beCall) && beCall.method === 'POST',
    beGood.sent.map(x => `${x.method} ${x.url}`).join(' · '));
  check('Und zwar mit dem Schluessel im Rumpf, nicht in der Adresse',
    beCall?.body?.key === 'd'.repeat(64) &&
    !beGood.sent.some(x => x.url.includes('d'.repeat(64))),
    beGood.sent.map(x => x.url).join(' · '));
  check('Die Anmeldemaske wird dabei gar nicht erst gebaut',
    !beGood.sent.some(x => x.url === '/api/session'),
    beGood.sent.map(x => x.url).join(' · '));
  check('Die gute Antwort fuehrt zur Bestaetigungsseite',
    Boolean(beGood.w.document.getElementById('confirm-ok')), 'die Seite fehlt');
  check('Und sie sagt, dass jetzt der Admin entscheidet',
    /Admin/.test(beGood.w.document.getElementById('confirm-ok')?.textContent || ''),
    beGood.w.document.getElementById('confirm-ok')?.textContent || '');
  /* SIE MELDET NIEMANDEN AN, und das ist die Oberflaechenhaelfte der Zusage:
     kein Weg von hier fuehrt weiter in die Anwendung, und der Schluessel
     verlaesst die Adresse. */
  check('Die Seite bleibt die Anmeldeseite -- niemand ist damit angemeldet',
    beGood.w.document.body.classList.contains('login'),
    'die Oberflaeche hat sich aufgebaut');
  check('Und der Schluessel ist aus der Adresse verschwunden',
    beGood.w.location.hash === '#/', beGood.w.location.hash);
  check('Es ist kein Passwortfeld entstanden',
    beGood.w.document.querySelectorAll('input[type="password"]').length === 0,
    `${beGood.w.document.querySelectorAll('input[type="password"]').length} Passwortfelder`);

  const beDead = buildDom(JSDOM, { hash: `#/confirm/${'9'.repeat(64)}` });
  await until(beDead.w, (x) => x.document.getElementById('confirm-back') && openRequests(x) === 0,
    2000, 'die Bestaetigungsseite');
  check('Ein erfundener Schluessel fuehrt zur Absage',
    /gilt nicht mehr/.test(beDead.w.document.querySelector('.login-error')?.textContent || ''),
    beDead.w.document.querySelector('.login-error')?.textContent || '(keine Absage)');
  check('Und die Absage nennt weder Namen noch Adresse',
    !/@/.test(beDead.w.document.querySelector('.login-error')?.textContent || ''),
    beDead.w.document.querySelector('.login-error')?.textContent || '');

  /* ---------------------------------------------------------------- */
  group('Die Karte „Anfragen“');

  /* ZU JEDEM FELD, DAS DIE OBERFLAECHE AUS DER ANTWORT LIEST, EINE PRUEFUNG
     AN DER ECHTEN ANTWORT -- die steht in der Gruppe "die
     Freischaltung" oben. */
  const sCardBuild = async (status) => {
    const d = buildDom(JSDOM, { requestsStatus: status,
      settings: { filters: null, isAdmin: true, isOwner: true } });
    await until(d.w, (x) => x.document.getElementById('count') && openRequests(x) === 0,
      2000, 'die Uebersicht');
    await sysSection(d.w, 'users');
    await until(d.w, (x) => x.document.getElementById('mrequests') && openRequests(x) === 0,
      2000, 'die Karte der Anfragen');
    return d;
  };
  const sCardStatus = () => ({ an: true, deliveryReady: true, deliveryReason: '', cap: 20,
    hours: 24, requests: [
      { id: 11, username: 'neuling', email: 'neuling@beispiel.de',
        created_at: '2026-08-20 09:00:00', confirmed_at: '2026-08-20 09:05:00' },
      { id: 12, username: 'zweiter', email: 'zweiter@beispiel.de',
        created_at: '2026-08-21 10:00:00', confirmed_at: '2026-08-21 10:30:00' }] });

  const kA = await sCardBuild(sCardStatus());
  const kRows = [...kA.w.document.querySelectorAll('#mrequests .mrow')];
  check('Die Karte listet die offenen Anfragen', kRows.length === 2,
    `${kRows.length} Zeilen`);
  check('Jede Zeile nennt den Namen',
    kRows.map(z => z.querySelector('.mname')?.textContent.trim()).join('|') === 'neuling|zweiter',
    kRows.map(z => z.querySelector('.mname')?.textContent.trim()).join(' · '));
  check('Und die Adresse',
    kRows[0].textContent.includes('neuling@beispiel.de'), kRows[0].textContent);
  check('Und beide Zeitpunkte -- Anfrage und Bestaetigung',
    /angefragt/.test(kRows[0].textContent) && /bestätigt/.test(kRows[0].textContent),
    kRows[0].textContent);
  check('Der Stand gegen den Deckel steht daneben',
    /2 von höchstens 20/.test(kA.w.document.getElementById('signup-used')?.textContent || ''),
    kA.w.document.getElementById('signup-used')?.textContent || '');
  check('Und der Zustand des Schalters',
    /an/.test(kA.w.document.getElementById('signup-state')?.textContent || ''),
    kA.w.document.getElementById('signup-state')?.textContent || '');

  /* DIE FREISCHALTUNG UEBER EIN ZUGESTELLTES EREIGNIS, und das Bestaetigen
     davor ist gestellt: confirm() gibt es in jsdom nicht von selbst. */
  placeConfirm(kA.w, true);
  kRows[0].querySelector('.signup-approve')
    .dispatchEvent(new kA.w.MouseEvent('click', { bubbles: true, cancelable: true }));
  await until(kA.w, (x) => kA.sent.some(g => g.url.startsWith('/api/requests/')) &&
    openRequests(x) === 0, 2000, 'die Antwort auf die Freischaltung');
  const kFree = kA.sent.find(x => x.url === '/api/requests/11/approve');
  check('Der Knopf "Freischalten" ruft die Route mit der Nummer der Zeile',
    Boolean(kFree) && kFree.method === 'POST',
    kA.sent.filter(x => /anfragen/.test(x.url)).map(x => `${x.method} ${x.url}`).join(' · '));
  check('Und schickt dabei keine Rolle mit',
    !JSON.stringify(kFree?.body || {}).includes('role'), JSON.stringify(kFree?.body));
  /* DIE KARTE ZEICHNET SICH AUS DER ANTWORT NEU. */
  check('Die freigeschaltete Zeile verschwindet aus der Liste',
    [...kA.w.document.querySelectorAll('#mrequests .mrow')].length === 1,
    `${[...kA.w.document.querySelectorAll('#mrequests .mrow')].length} Zeilen`);
  check('Und der Stand gegen den Deckel zieht mit',
    /1 von höchstens 20/.test(kA.w.document.getElementById('signup-used')?.textContent || ''),
    kA.w.document.getElementById('signup-used')?.textContent || '');
  /* DER EINLADUNGSLINK ERSCHEINT IN DER KARTE, in der der Knopf steht -- und
     nicht in "Zugaenge", wo ihn niemand sucht. */
  const kField = kA.w.document.querySelector('#signup-link #user-link-field');
  check('Der Einladungslink steht danach in der Karte "Anfragen"',
    kField?.value === `https://kriterion.beispiel.de/#/invite/${'e'.repeat(64)}`,
    kField?.value || '(kein Feld)');
  check('Mit dem Satz, dass der Link das Passwort setzen kann',
    /Wer den Link hat, kann das Passwort setzen/.test(kA.w.document.getElementById('signup-link')?.textContent || ''),
    kA.w.document.getElementById('signup-link')?.textContent?.slice(0, 120) || '');
  check('Und es steht nur EIN Linkkasten am Bildschirm',
    kA.w.document.querySelectorAll('#user-link-field').length === 1,
    `${kA.w.document.querySelectorAll('#user-link-field').length} Kaesten`);

  const kFrom = await sCardBuild(sCardStatus());
  placeConfirm(kFrom.w, true);
  [...kFrom.w.document.querySelectorAll('#mrequests .mrow')][1].querySelector('.signup-reject')
    .dispatchEvent(new kFrom.w.MouseEvent('click', { bubbles: true, cancelable: true }));
  await until(kFrom.w, (x) => kFrom.sent.some(g => g.url.startsWith('/api/requests/')) &&
    openRequests(x) === 0, 2000, 'die Antwort auf die Ablehnung');
  check('Der Knopf "Ablehnen" ruft DELETE mit der Nummer der Zeile',
    kFrom.sent.some(x => x.method === 'DELETE' && x.url === '/api/requests/12'),
    kFrom.sent.filter(x => /anfragen/.test(x.url)).map(x => `${x.method} ${x.url}`).join(' · '));
  check('Die abgelehnte Zeile verschwindet',
    [...kFrom.w.document.querySelectorAll('#mrequests .mrow')]
      .every(z => !/zweiter/.test(z.textContent)),
    [...kFrom.w.document.querySelectorAll('#mrequests .mrow')].map(z => z.textContent).join(' | '));
  check('Und es entsteht dabei kein Linkkasten -- es gibt keinen Zugang',
    !kFrom.w.document.querySelector('#signup-link #user-link-field'), 'ein Linkkasten steht da');

  /* DER SCHALTER. */
  const kSch = await sCardBuild(sCardStatus());
  kSch.w.document.getElementById('signup-toggle')
    .dispatchEvent(new kSch.w.MouseEvent('click', { bubbles: true, cancelable: true }));
  await until(kSch.w, (x) => kSch.sent.some(g => g.url === '/api/signup/toggle') &&
    openRequests(x) === 0, 2000, 'die Antwort auf den Schalter');
  const kSchCall = kSch.sent.find(x => x.url === '/api/signup/toggle');
  check('Der Schalter ruft PUT /api/signup/toggle',
    Boolean(kSchCall) && kSchCall.method === 'PUT',
    kSch.sent.map(x => `${x.method} ${x.url}`).join(' · '));
  check('Und schickt den gewuenschten Zustand mit',
    kSchCall?.body?.an === false, JSON.stringify(kSchCall?.body));
  check('Danach steht "aus" in der Karte',
    /aus/.test(kSch.w.document.getElementById('signup-state')?.textContent || ''),
    kSch.w.document.getElementById('signup-state')?.textContent || '');
  check('Und der Knopf bietet das Einschalten an',
    /einschalten/.test(kSch.w.document.getElementById('signup-toggle')?.textContent || ''),
    kSch.w.document.getElementById('signup-toggle')?.textContent || '');

  /* DIE ROTE ZEILE: DER VERSAND IST KAPUTT, DER SCHALTER BLEIBT AN. */
  const kRed = await sCardBuild({ ...sCardStatus(), deliveryReady: false,
    deliveryReason: 'Seit der letzten Änderung am Mailzugang ist keine Testmail durchgekommen.' });
  check('Ist der Versand kaputt, steht die rote Zeile da',
    Boolean(kRed.w.document.getElementById('signup-broken')), 'die Zeile fehlt');
  check('Sie nennt den Grund des Servers',
    /Testmail/.test(kRed.w.document.getElementById('signup-broken')?.textContent || ''),
    kRed.w.document.getElementById('signup-broken')?.textContent || '');
  check('Und sagt, dass der Schalter trotzdem an bleibt',
    /bleibt eingeschaltet/.test(kRed.w.document.getElementById('signup-broken')?.textContent || ''),
    kRed.w.document.getElementById('signup-broken')?.textContent || '');
  check('Der Schalter steht dabei weiterhin auf "an"',
    /an/.test(kRed.w.document.getElementById('signup-state')?.textContent || ''),
    kRed.w.document.getElementById('signup-state')?.textContent || '');
  /* UND DIE GEGENLAGE: bei heilem Versand steht die Zeile
     NICHT da. */
  check('Bei heilem Versand steht sie nicht da',
    !kA.w.document.getElementById('signup-broken'), 'die Zeile steht auch dann da');

  /* IST DER SCHALTER AUS UND DER VERSAND KAPUTT, laesst sich gar nicht erst
     einschalten -- und die Karte sagt, was fehlt, statt einen Knopf
     anzubieten, der nur absagt. */
  const kNotReady = await sCardBuild({ an: false, deliveryReady: false,
    deliveryReason: 'Es ist kein Mailzugang eingerichtet. Das macht der Eigentümer dieser Installation.',
    cap: 20, hours: 24, requests: [
      { id: 11, username: 'neuling', email: 'neuling@beispiel.de',
        created_at: '2026-08-20 09:00:00', confirmed_at: '2026-08-20 09:05:00' }] });
  check('Ohne Versand ist der Einschaltknopf gesperrt',
    kNotReady.w.document.getElementById('signup-toggle')?.disabled === true,
    String(kNotReady.w.document.getElementById('signup-toggle')?.disabled));
  check('Und die Karte sagt, was dafuer fehlt',
    /Mailzugang/.test(kNotReady.w.document.getElementById('signup-notready')?.textContent || ''),
    kNotReady.w.document.getElementById('signup-notready')?.textContent || '');
  /* ---------------------------------------------------------------- */
  group('Meine Sitzungen in der Oberflaeche');

  /* DIE KARTE IN BEIDEN ZUSTAENDEN -- mehrere Anmeldungen und eine einzige. */
  const msSystem = async (roles, opt = {}) => {
    const d = buildDom(JSDOM, { settings: { filters: null, userCount: 4, ...roles }, ...opt });
    await until(d.w, (x) => x.document.getElementById('count') && openRequests(x) === 0,
      2000, 'die Uebersicht');
    await d.w.renderSystem();
    await until(d.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
      2000, 'der Systembereich');
    return d;
  };
  const msCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Meine Sitzungen');
  const msSessionRows = (d) => [...(msCard(d)?.querySelectorAll('#msessions .mrow.session') || [])];

  const msuEig = await msSystem({ isAdmin: true, isOwner: true });
  const msuUser = await msSystem({ isAdmin: false, isOwner: false });

  // ERST DAS VORHANDENSEIN, dann jede Aussage darueber.
  check('Die Karte steht bei der Eigentuemerin', !!msCard(msuEig));
  /* UND BEI EINEM GEWOEHNLICHEN BENUTZER AUCH -- sie ist persoenlich wie
     "Zugang" und kein Systembereich fuer Admins. */
  check('Und bei einem gewoehnlichen Benutzer ebenso', !!msCard(msuUser));
  check('Die Liste wird beim Aufbau des Bereichs geholt, nicht nachgeladen',
    msuUser.sent.some(x => x.method === 'GET' && x.url === '/api/sessions'),
    msuUser.sent.map(x => x.url).join(' · '));

  const msuRows = msSessionRows(msuEig);
  check('Die Karte zeigt alle drei Anmeldungen', msuRows.length === 3,
    `${msuRows.length} Zeilen`);
  /* ZU JEDEM FELD, DAS DIE OBERFLAECHE AUS DER ANTWORT LIEST, GEHOERT EINE
     PRUEFUNG -- hier beide Zeitangaben, in deutscher
     Schreibweise. */
  const msuText = msuRows.map(r => r.textContent || '');
  check('Jede Zeile nennt, wann angemeldet wurde',
    /angemeldet 20\.08\.2026/.test(msuText[0]), msuText[0]);
  check('Und wann zuletzt zugegriffen wurde',
    /zuletzt aktiv 24\.08\.2026/.test(msuText[0]), msuText[0]);
  check('Die eigene ist markiert',
    msuRows.filter(r => r.classList.contains('session-mine')).length === 1,
    msuRows.map(r => r.className).join(' · '));
  check('Und sie sagt es auch mit Worten',
    /Diese Sitzung/.test(msuText[0]) && /\(hier\)/.test(msuText[0]), msuText[0]);
  check('Die anderen heissen anders',
    msuText.slice(1).every(t => /Andere Sitzung/.test(t)), JSON.stringify(msuText.slice(1)));
  /* AN DER EIGENEN STEHT KEIN KREUZ -- man wuerde sich sonst selbst
     hinauswerfen, und der Server weist den Weg ohnehin ab. */
  check('Es gibt ueberhaupt eine eigene Zeile',
    !!msuRows.find(r => r.classList.contains('session-mine')));
  check('An der eigenen steht kein Kreuz',
    !msuRows.find(r => r.classList.contains('session-mine'))?.querySelector('.session-x'),
    'die eigene traegt ein Kreuz');
  check('An den anderen steht eines',
    msuRows.filter(r => !r.classList.contains('session-mine'))
      .every(r => !!r.querySelector('.session-x')),
    'einer anderen fehlt das Kreuz');
  /* DIE ZAHL IST DIE AUSKUNFT DIESER KARTE -- ohne Geraetekennung ist sie
     das, was ueberhaupt etwas sagt. */
  check('Die Karte nennt die Zahl der anderen',
    /2 weitere/.test(msCard(msuEig)?.textContent || ''),
    msCard(msuEig)?.textContent?.slice(-260));
  check('Und den Knopf, der sie beendet',
    !!msCard(msuEig)?.querySelector('#sessions-all'), 'der Knopf fehlt');
  /* ---- BEFUND 2 DER RUNDE 0.26.0 -- DIE FUSSZEILE STEHT NEBEN DER LISTE
     ---- Sie war bis dahin das letzte Kind IN `#msessions` und wurde vom
     Deckel dieser Liste mitgerechnet. */
  const msuFoot = msCard(msuEig)?.querySelector('.session-foot');
  check('Die Fusszeile der Sitzungen steht da', !!msuFoot,
    msCard(msuEig)?.innerHTML?.slice(-200));
  check('Und sie ist kein Kind der rollenden Liste',
    !!msuFoot && !msCard(msuEig)?.querySelector('#msessions .session-foot'),
    msuFoot?.parentElement?.id || msuFoot?.parentElement?.className || '(kein Elternteil)');
  /* UND DER KNOPF MIT IHR. */
  check('Und der Knopf steht in ihr, nicht in der Liste',
    !!msuFoot?.querySelector('#sessions-all') &&
    !msCard(msuEig)?.querySelector('#msessions #sessions-all'),
    msCard(msuEig)?.querySelector('#sessions-all')?.parentElement?.className || '(kein Knopf)');
  check('Die Frist kommt vom Server und wird nicht nachgerechnet',
    /30 Tagen/.test(msCard(msuEig)?.textContent || ''),
    msCard(msuEig)?.textContent?.slice(-260));
  /* WAS DIE KARTE AUSDRUECKLICH NICHT VERSPRICHT: ein Geraet. */
  check('Die Karte sagt offen, dass sie das Geraet nicht kennt',
    /Gerät und\s+Ort werden nicht gespeichert/.test(msCard(msuEig)?.querySelector('.desc')?.textContent || ''),
    msCard(msuEig)?.querySelector('.desc')?.textContent);

  /* DER LEERE FALL -- nur die eigene, mit eigenem Aufbau. */
  const msuOne = await msSystem({ isAdmin: true, isOwner: true },
    { sessionsInventory: [{ id: 'a'.repeat(64), loggedInAt: '2026-08-20 08:00:00',
                           lastSeen: '2026-08-24 07:30:00', current: true }] });
  check('Bei nur einer Anmeldung steht die Karte trotzdem da', !!msCard(msuOne));
  check('Mit genau einer Zeile', msSessionRows(msuOne).length === 1, `${msSessionRows(msuOne).length}`);
  check('Und sie sagt, dass es die einzige ist',
    /einzige/.test(msCard(msuOne)?.textContent || ''),
    msCard(msuOne)?.textContent?.slice(-200));
  /* KEIN KNOPF, DER ZUVERLAESSIG NICHTS TUT -- er saehe aus wie ein Fehler. */
  check('Ohne andere Anmeldung steht auch kein Knopf da',
    !msCard(msuOne)?.querySelector('#sessions-all'), 'der Knopf steht doch da');

  /* EINE EINZELNE BEENDEN, mit einem WIRKLICH zugestellten Ereignis --
     .click() genuegt nicht. */
  {
    const d = await msSystem({ isAdmin: true, isOwner: true });
    const before = msSessionRows(d).length;
    const msX = msSessionRows(d).find(r => !r.classList.contains('session-mine'))?.querySelector('.session-x');
    msX?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !msX || (d.sent.some(g => g.method === 'DELETE') && openRequests(x) === 0),
      2000, 'die neu gezeichnete Liste der Sitzungen');
    check('Das Kreuz schickt das Beenden an den Server',
      d.sent.some(x => x.method === 'DELETE' && x.url === `/api/sessions/${'b'.repeat(64)}`),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und die Karte zeichnet sich mit einer Zeile weniger neu',
      msSessionRows(d).length === before - 1, `${before} -> ${msSessionRows(d).length}`);
    check('Die eigene steht dabei weiter da',
      msSessionRows(d).some(r => r.classList.contains('session-mine')),
      msSessionRows(d).map(r => r.className).join(' · '));
  }

  /* ALLE ANDEREN BEENDEN. confirm ist in jsdom nicht gebaut und liefert
     undefined -- ein falscher Wert, an dem der Behandler zurueckkaeme. */
  {
    const d = await msSystem({ isAdmin: true, isOwner: true });
    const msNo = placeConfirm(d.w, false);
    msCard(d)?.querySelector('#sessions-all')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !x.document.querySelector('.backdrop') && openRequests(x) === 0,
      2000, 'die geschlossene Rueckfrage');
    check('Wer abbricht, beendet nichts',
      !d.sent.some(x => x.method === 'DELETE' && x.url === '/api/sessions'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und alle drei Zeilen stehen noch da', msSessionRows(d).length === 3,
      `${msSessionRows(d).length}`);

    msNo.disconnect();
    placeConfirm(d.w, true);
    const msAll = msCard(d)?.querySelector('#sessions-all');
    msAll?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !msAll || (d.sent.some(g => g.method === 'DELETE') && openRequests(x) === 0),
      2000, 'die neu gezeichnete Liste der Sitzungen');
    check('Nach der Bestaetigung geht es an den Server',
      d.sent.some(x => x.method === 'DELETE' && x.url === '/api/sessions'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und es bleibt genau die eigene stehen',
      msSessionRows(d).length === 1 && msSessionRows(d)[0].classList.contains('session-mine'),
      msSessionRows(d).map(r => r.className).join(' · '));
    check('Die Karte sagt danach, dass es die einzige ist',
      /einzige/.test(msCard(d)?.textContent || ''), msCard(d)?.textContent?.slice(-200));
  }

  /* JEDE LESESTELLE IST ABGEFANGEN: fehlt die Antwort oder
     ein Feld darin, soll die Karte etwas sagen und nicht der Lauf abreissen. */
  {
    const d = await msSystem({ isAdmin: true, isOwner: true }, { sessionsInventory: [] });
    check('Auch ohne eine einzige Zeile steht die Karte',
      !!msCard(d) && msSessionRows(d).length === 0, `${msSessionRows(d).length} Zeilen`);
    check('Und der Lauf reisst dabei nicht ab', true);
  }

  /* ---------------------------------------------------------------- */
  group('Der Einladungslink in der Karte Benutzer');

  // „Benutzer" seit 0.22.0 (E2); der Abschnittsschluessel heisst seit 0.24.1 `users`.
  const ziCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Benutzer');
  const ziRows = (d) => [...(ziCard(d)?.querySelectorAll('#musers .mrow.user') || [])];
  const ziSystem = async (roles, opt = {}) => {
    const d = buildDom(JSDOM, { settings: { filters: null, userCount: 4, ...roles }, ...opt });
    await until(d.w, (x) => x.document.getElementById('count') && openRequests(x) === 0,
      2000, 'die Uebersicht');
    await sysSection(d.w, 'users');
    await until(d.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
      2000, 'der Abschnitt der Benutzer');
    return d;
  };

  const ziEig = await ziSystem({ isAdmin: true, isOwner: true });
  check('Die Karte "Benutzer" steht da', !!ziCard(ziEig));
  // Drei lebende Zugaenge; der Grabstein der Prueflage steht seit 0.13.0 im
// eigenen Fenster und nicht mehr in dieser Liste.
  check('Und sie zeigt ihre Zeilen', ziRows(ziEig).length === 3, `${ziRows(ziEig).length}`);

  /* "NOCH KEIN PASSWORT" IST ABGELEITET, KEIN VIERTER ZUSTAND -- und es steht
     NUR an der aktiven Zeile. */
  const ziRow = (name) => ziRows(ziEig).find(r => (r.querySelector('.mname')?.textContent || '').includes(name));
  check('Die Zeile des eingeladenen Zugangs ist da', !!ziRow('bert'));
  check('Sie traegt "noch kein Passwort"',
    /noch kein Passwort/.test(ziRow('bert')?.textContent || ''), ziRow('bert')?.textContent);
  /* SEIT 0.13.0 STEHT DER GRABSTEIN NICHT MEHR IN DIESER LISTE, sondern in
     einem eigenen Fenster -- er ist kein Zugang, den man verwalten kann, und
     er waechst mit jeder Loeschung. */
  check('Der Grabstein steht nicht mehr zwischen den lebenden Zugaengen',
    !ziRow('Gelöschter Benutzer 4'),
    ziRows(ziEig).map(r => r.querySelector('.mname')?.textContent).join(' · '));
  check('Und eine Zeile mit Passwort traegt "noch kein Passwort" ebenso wenig',
    !/noch kein Passwort/.test(ziRow('carla')?.textContent || ''),
    ziRow('carla')?.textContent);

  /* BEIDE WEGE STEHEN NEBENEINANDER, und die Karte bevorzugt den Link:
     er steht VOR dem Schluessel. */
  check('An einer bedienbaren Zeile steht das Kettenglied',
    !!ziRow('carla')?.querySelector('.user-link-btn'), 'der Knopf fehlt');
  check('Und der Schluessel daneben steht weiterhin',
    !!ziRow('carla')?.querySelector('.user-pass-btn'), 'der direkte Weg ist verschwunden');
  check('Der Link steht VOR dem Schluessel',
    [...(ziRow('carla')?.querySelector('.user-act')?.children || [])]
      .findIndex(e => e.classList.contains('user-link-btn')) <
    [...(ziRow('carla')?.querySelector('.user-act')?.children || [])]
      .findIndex(e => e.classList.contains('user-pass-btn')),
    'die Reihenfolge stimmt nicht');

  /* ================= Gelöschte Zugänge im eigenen Fenster — 0.13.0 ====
     REINE OBERFLÄCHE, Vorbild ist der Dialog "Wer hat bewertet". */
  {
    const zwButton = () => ziCard(ziEig)?.querySelector('#deleted-users');
    check('An der Karte steht ein Knopf zu den geloeschten Zugaengen', !!zwButton(),
      ziCard(ziEig)?.querySelector('#user-remove-row')?.innerHTML);
    check('Und er nennt ihre Zahl', /\(1\)/.test(zwButton()?.textContent || ''),
      zwButton()?.textContent);
    const zwDialog = () => ziEig.w.document.getElementById('tombstone-modal');
    const zwOpen = zwButton();
    zwOpen?.dispatchEvent(new ziEig.w.MouseEvent('click', { bubbles: true }));
    await until(ziEig.w, () => !zwOpen || zwDialog(), 2000, 'das Fenster der geloeschten Zugaenge');
    check('Der Klick oeffnet ein eigenes Fenster', !!zwDialog(), 'kein Fenster');
    const zwRows = () => [...(zwDialog()?.querySelectorAll('.mrow.user') || [])];
    check('Darin steht der Grabstein', zwRows().length === 1 &&
      /Gelöschter Benutzer 4/.test(zwRows()[0]?.textContent || ''), zwDialog()?.textContent);
    /* KEIN WERKZEUG AM GRABSTEIN -- es gibt nichts zu tun, und ein Knopf, der
       zuverlaessig eine Fehlermeldung erzeugt, sieht aus wie ein Fehler. */
    check('Ohne Werkzeug: kein Link, kein Schluessel, kein Entfernen',
      !zwRows()[0].querySelector('.user-link-btn') && !zwRows()[0].querySelector('.user-pass-btn') &&
      !zwRows()[0].querySelector('.user-x') && !zwRows()[0].querySelector('.user-act'),
      zwRows()[0].innerHTML);
    // "Noch kein Passwort" gilt auch hier nicht: der Grabstein traegt denselben
// leeren Hash, aber die Angabe waere eine Falschaussage.
    check('Und ohne "noch kein Passwort"',
      !/noch kein Passwort/.test(zwRows()[0].textContent || ''), zwRows()[0].textContent);
    /* DAS WINDOW SAGT, WARUM DER NAME NICHT DASTEHT. */
    check('Es sagt, dass der urspruengliche Name nicht aufbewahrt wird',
      D.shows(zwDialog()?.textContent, 'card.nameFreedHint'),
      zwDialog()?.textContent?.replace(/\s+/g, ' ').slice(0, 300));
    check('Und nennt sperren als den umkehrbaren Weg',
      /sperren/.test(zwDialog()?.textContent || ''),
      zwDialog()?.textContent?.replace(/\s+/g, ' ').slice(0, 300));
    const zwClose = zwDialog()?.querySelector('[data-no]');
    zwClose?.dispatchEvent(new ziEig.w.MouseEvent('click', { bubbles: true }));
    await until(ziEig.w, () => !zwClose || !zwClose.isConnected, 2000, 'das geschlossene Fenster');
    check('Und es laesst sich wieder schliessen', !zwDialog(), 'das Fenster bleibt stehen');
  }
  /* OHNE GRABSTEIN KEIN KNOPF. */
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true }, { users: {
      ich: 1, mayRoles: true, owner: 1,
      users: [{ id: 1, username: 'chefin', role: 'owner', status: 'active',
                   last_login: null, created_at: '2026-01-01 09:00:00', entries: 0 }] } });
    check('Der Aufbau steht: eine Instanz ohne Grabstein zeigt ihre Zeile',
      ziRows(d).length === 1, `${ziRows(d).length} Zeilen`);
    check('Und dann steht der Knopf gar nicht erst da',
      !ziCard(d)?.querySelector('#deleted-users'),
      ziCard(d)?.querySelector('#user-remove-row')?.innerHTML);
    d.w.close();
  }

  /* DEN LINK ERZEUGEN. Der Kasten erscheint, er nennt die Adresse VOLLSTAENDIG
     -- gebaut aus location, nicht vom Server --, und die Warnung steht daneben. */
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    placeConfirm(d.w, true);
    const row = ziRows(d).find(r => (r.querySelector('.mname')?.textContent || '').includes('carla'));
    const linkButton = row?.querySelector('.user-link-btn');
    linkButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !linkButton || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    /* SEIT 0.8.90 STEHT DIE ZWEITE BESTAETIGUNG DAVOR. */
    check('Vor dem Link steht die zweite Bestaetigung',
      !!d.w.document.getElementById('confirm-pass'), 'kein Dialog');
    check('Und der Server ist bis dahin NICHT gefragt worden',
      !d.sent.some(x => x.url === '/api/users/3/token'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    await confirmImDom(d);
    check('Das Kettenglied fragt den Server nach einem Link',
      d.sent.some(x => x.method === 'POST' && x.url === '/api/users/3/token'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und bei einem Zugang MIT Passwort ist der Zweck die Ruecksetzung',
      d.sent.find(x => x.url === '/api/users/3/token')?.body?.purpose === 'reset',
      JSON.stringify(d.sent.find(x => x.url === '/api/users/3/token')?.body));
    const field = d.w.document.getElementById('user-link-field');
    check('Der Kasten mit dem Link steht da', !!field, 'kein Feld');
    /* DIE VOLLSTAENDIGE ADRESSE BAUT DER BROWSER -- der Server gibt nur den
       Schluessel heraus. Nachgerechnet gegen den Ort des Fensters. */
    check('Er traegt die vollstaendige Adresse aus dem Ort des Fensters',
      field?.value === `${d.w.location.origin}${d.w.location.pathname}#/invite/${'d'.repeat(64)}`,
      field?.value);
    /* UMGEDREHT MIT 0.22.0 (Anlage F): der Kasten sagt in drei Saetzen, was
       der Link kann, wie lange und wie oft er gilt und an wen er geht -- ohne
       „Passwortersatz" und ohne den „fremden Verlauf". */
    const zlText = () => (d.w.document.getElementById('user-link')?.textContent || '').replace(/\s+/g, ' ');
    check('Die Warnung steht daneben, nicht nur im Dokument',
      /Wer den Link hat, kann das Passwort setzen/.test(zlText()), zlText().slice(0, 240));
    check('Sie nennt die Frist und die Einmaligkeit',
      /7 Tage gültig/.test(zlText()) && /einmal nutzbar/.test(zlText()), zlText().slice(0, 240));
    check('Und dass er nur an die richtige Person geht — 0.22.0',
      /Nur an die richtige Person weitergeben/.test(zlText()), zlText().slice(0, 240));
    check('Der Kasten sagt, dass der Link nur dieses eine Mal erscheint',
      /wird nur einmal angezeigt/.test(zlText()), zlText().slice(0, 240));
    // Und die Frist aus 0.9.0, gelesen aus der ANTWORT.
    check('Und er nennt die Frist ab dem ersten Oeffnen',
      /15 Minuten/.test(d.w.document.getElementById('user-link')?.textContent || ''),
      d.w.document.getElementById('user-link')?.textContent?.slice(0, 300));
  }

  /* ---------------------------------------------------------------- */
  group('Der Versandzustand neben dem Link');

  /* DREI ZUSTAENDE, DREI LAGEN -- und in JEDER steht der Link daneben. */
  const vzLink = async (opt) => {
    const d = await ziSystem({ isAdmin: true, isOwner: true }, opt);
    placeConfirm(d.w, true);
    // bert TRAEGT eine Adresse, carla nicht -- damit laesst sich der Zweig
// "keine Adresse hinterlegt" ueberhaupt stellen.
    const row = ziRows(d).find(r => (r.querySelector('.mname')?.textContent || '').includes(opt.actor || 'bert'));
    const linkButton = row?.querySelector('.user-link-btn');
    linkButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !linkButton || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    await confirmImDom(d);
    return d;
  };
  {
    const d = await vzLink({ publicAddress: 'https://kriterion.beispiel.de' });
    const box = d.w.document.getElementById('user-link');
    check('Bei erfolgreichem Versand sagt der Kasten es',
      D.shows(box?.textContent, 'card.testMailSent'), box?.textContent?.slice(0, 400));
    check('Und der Link steht trotzdem da',
      !!d.w.document.getElementById('user-link-field'), 'kein Linkfeld');
    /* DIE ADRESSE DES EMPFAENGERS STEHT NICHT IM KASTEN, und das ist kein
       Versehen: an einem BESTEHENDEN Zugang hat sie der Betroffene selbst
       eingetragen, und GET /api/users liefert sie aus demselben Grund nicht
       mit. */
    check('Die Adresse des Empfaengers steht dabei NICHT im Kasten',
      !/@/.test((box?.querySelector('.user-send')?.textContent || '')),
      box?.querySelector('.user-send')?.textContent);
  }
  {
    const d = await vzLink({ publicAddress: 'https://kriterion.beispiel.de', mailError: true });
    const box = d.w.document.getElementById('user-link');
    check('Bei einem Fehlschlag steht "Versand fehlgeschlagen" da',
      /Versand fehlgeschlagen/.test(box?.textContent || ''), box?.textContent?.slice(0, 400));
    check('Mit dem Grund daneben',
      /550/.test(box?.textContent || ''), box?.textContent?.slice(0, 400));
    check('Und der Link steht daneben -- nichts bricht ab',
      d.w.document.getElementById('user-link-field')?.value ===
        `https://kriterion.beispiel.de/#/invite/${'d'.repeat(64)}`,
      d.w.document.getElementById('user-link-field')?.value);
    check('Die Seite sagt, dass der Link von Hand weiterzugeben ist',
      /von Hand weiter/.test(box?.textContent || ''), box?.textContent?.slice(0, 400));
  }
  {
    // KEIN MAILZUGANG: der haeufigste Fall, und er muss aussehen wie 0.8.80.
    const d = await vzLink({ publicAddress: 'https://kriterion.beispiel.de', mailStatus: {} });
    const box = d.w.document.getElementById('user-link');
    check('Ohne Mailzugang sagt der Kasten, dass nichts verschickt wurde',
      D.shows(box?.textContent, 'card.noMailSent'), box?.textContent?.slice(0, 400));
    check('Mit dem Grund',
      /kein Mailzugang/.test(box?.textContent || ''), box?.textContent?.slice(0, 400));
    check('Und der Link steht auch dort',
      !!d.w.document.getElementById('user-link-field'), 'kein Linkfeld');
  }
  {
    // UND DER ZUGANG OHNE ADRESSE -- carla hat keine.
    const d = await vzLink({ publicAddress: 'https://kriterion.beispiel.de', actor: 'carla' });
    const box = d.w.document.getElementById('user-link');
    check('Ohne Adresse am Zugang sagt der Kasten auch das',
      /keine E-Mail-Adresse hinterlegt/.test(box?.textContent || ''),
      box?.textContent?.slice(0, 400));
    check('Und der Link steht auch dann da',
      !!d.w.document.getElementById('user-link-field'), 'kein Linkfeld');
  }

  /* ---------------------------------------------------------------- */
  group('Das Sicherheitsprotokoll in der Oberflaeche');

  /* DIE KARTE HOLT IHREN BESTAND BEIM AUFBAU DES BEREICHS und laedt sich
     nicht selbst nach: eine Zusage, die nach dem
     Schliessen ihres Fensters ankommt, risse den ganzen Lauf ab statt eine
     Pruefung rot zu faerben. */
  const spCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Sicherheitsprotokoll');
  const spRows = (d) => [...(spCard(d)?.querySelectorAll('.log-row') || [])];
  const spText = (d) => spCard(d)?.textContent || '';

  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    check('Die Karte "Sicherheitsprotokoll" steht da', !!spCard(d), 'keine Karte');
    check('Sie wird beim Aufbau des Bereichs geholt, nicht nachgeladen',
      d.sent.filter(x => x.url === '/api/security-log').length === 1,
      d.sent.filter(x => x.url === '/api/security-log').length + ' Abrufe');
    check('Und sie zeigt ihre vier Zeilen',
      spRows(d).length === 4, `${spRows(d).length} Zeilen`);

    /* JEDE DER VIER LAGEN EINZELN -- und erst das Vorhandensein der Zeile,
       dann ihre Eigenschaft. */
    const spRow = (event) => spRows(d).find(z => z.dataset.event === event);
    check('Die Zeile zum Rollenwechsel ist ueberhaupt da', !!spRow('user.role'));
    check('Sie nennt den Vorgang, den Handelnden, das Ziel und die neue Rolle',
      /Rolle vergeben/.test(spRow('user.role')?.textContent || '') &&
      /chefin/.test(spRow('user.role')?.textContent || '') &&
      /→ bert/.test(spRow('user.role')?.textContent || '') &&
      /Admin/.test(spRow('user.role')?.textContent || ''),
      spRow('user.role')?.textContent?.replace(/\s+/g, ' '));
    check('Die Zeile zum Export ist ueberhaupt da', !!spRow('export'));
    /* Erst das Vorhandensein des Feldes, dann seine Leere:
       ein fehlendes Feld liefert einen leeren Text, und jede Verneinung
       darauf waere wahr. */
    check('Die Zeile zum Export hat ueberhaupt ein Zielfeld',
      !!spRow('export')?.querySelector('.log-target'), 'kein Zielfeld');
    check('Und es bleibt leer -- der Export trifft die Instanz, nicht jemanden',
      (spRow('export')?.querySelector('.log-target')?.textContent || '').trim() === '',
      spRow('export')?.textContent?.replace(/\s+/g, ' '));

    /* wer IS NULL HEISST "UEBER usertool.js AUF DEM WIRT" -- mit genau einer
       Ausnahme, und die ist am Vorgang zu erkennen. */
    check('Die Zeile vom Wirt ist ueberhaupt da', !!spRow('user.password'));
    check('Sie sagt, dass sie per Kommandozeile am Server kam — 0.22.0',
      /per Kommandozeile am Server/.test(spRow('user.password')?.textContent || ''),
      spRow('user.password')?.textContent?.replace(/\s+/g, ' '));
    check('Die gescheiterte Anmeldung ist ueberhaupt da', !!spRow('login.fail'));
    check('Sie sagt NICHT, dass sie ueber den Wirt kam',
      !/usertool\.js/.test(spRow('login.fail')?.textContent || ''),
      spRow('login.fail')?.textContent?.replace(/\s+/g, ' '));
    check('Sondern nennt den Namen als unbekannt',
      /unbekannter Name/.test(spRow('login.fail')?.textContent || ''),
      spRow('login.fail')?.textContent?.replace(/\s+/g, ' '));

    check('Die Karte nennt die Frist',
      /180 Tage/.test(spText(d)), spText(d).replace(/\s+/g, ' ').slice(0, 200));
    check('Und sagt, dass es keinen anderen Weg hinaus gibt',
      D.shows(spText(d), 'card.logKeepsHint'),
      spText(d).replace(/\s+/g, ' ').slice(0, 260));
    check('Sie sagt ausdruecklich, dass sie kein Aenderungsverlauf ist',
      /Nicht\s+enthalten: Inhalte, Bewertungen/.test(spText(d)), spText(d).replace(/\s+/g, ' ').slice(0, 260));
    check('Und dass weder Adresse noch Browserkennung darin stehen',
      /IP-Adresse, Browser/.test(spText(d)),
      spText(d).replace(/\s+/g, ' ').slice(0, 400));
    check('Die Fusszeile nennt die gezeigten und die gesamten Vorgaenge',
      /Die 4 jüngsten von 7 Vorgängen/.test(
        d.w.document.getElementById('log-foot')?.textContent || ''),
      d.w.document.getElementById('log-foot')?.textContent);

    /* ---- 0.13.0: der Filter an der Karte ---- DIE KARTE HOLT DIE HUNDERT
       JUENGSTEN ZEILEN, alle Vorgangsarten gemischt -- man findet die
       gescheiterten Anmeldungen darin nicht, sie stehen nur dazwischen. */
    const spFilter = () => [...(d.w.document.querySelectorAll('#log-filter .pill') || [])];
    check('Ueber der Liste steht eine Filterleiste', spFilter().length > 0,
      `${spFilter().length} Pillen`);
    check('Und sie bietet "Alle" und fuenf Ansichten',
      spFilter().length === 6 && spFilter()[0].textContent.startsWith('Alle'),
      JSON.stringify(spFilter().map(b => b.textContent)));
    /* "GESCHEITERT" IST DIE ANSICHT, UM DIE ES GEHT -- sie steht
       ausdruecklich und nicht als eine unter vielen: der ganze Punkt war,
       dass man sie findet. */
    const spFailed = () => spFilter().find(b => b.dataset.group === 'failed');
    check('Darunter eine eigene fuer die gescheiterten Versuche', !!spFailed(),
      JSON.stringify(spFilter().map(b => b.dataset.group)));
    check('Und ihr Name sagt, dass beide Arten darin stehen',
      /Anmeldungen und .*Bestätigungen/.test(spFailed()?.title || ''),
      spFailed()?.title);
    /* JEDE PILLE NENNT IHRE ZAHL, und die zaehlt ueber die GANZE Tabelle --
       nicht ueber die vier geholten Zeilen. */
    check('Jede Pille nennt ihre Zahl',
      spFilter().every(b => /^\d+$/.test(b.querySelector('.n')?.textContent || '')),
      JSON.stringify(spFilter().map(b => b.querySelector('.n')?.textContent)));
    check('Und die Zahl kommt vom Server, nicht aus den geholten Zeilen',
      spFilter()[0].querySelector('.n').textContent === '7' &&
      spFailed().querySelector('.n').textContent === '2',
      JSON.stringify(spFilter().map(b => b.textContent)));
    // Eine Ansicht ohne Zeilen wird gedaempft -- wie jede Pille in dieser Lage.
    const spZf = spFilter().find(b => b.dataset.group === 'twofactor');
    check('Eine Ansicht ohne Zeilen ist gedaempft', spZf?.classList.contains('blank'),
      spZf?.className);
    check('Und "Alle" mit Zeilen ist es nicht',
      !spFilter()[0].classList.contains('blank'), spFilter()[0].className);
    check('"Alle" steht anfangs auf an', spFilter()[0].classList.contains('on'),
      spFilter()[0].className);

    /* DER KLICK FRAGT DEN SERVER und filtert nicht im Browser. */
    spFailed().dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => d.sent.filter(g => String(g.url).startsWith('/api/security-log')).length > 1 &&
      openRequests(x) === 0, 2000, 'die gefilterte Liste');
    check('Ein Klick auf eine Ansicht fragt den Server mit der Auswahl',
      d.sent.some(x => String(x.url) === '/api/security-log?group=failed'),
      JSON.stringify(d.sent.filter(x => String(x.url).startsWith('/api/security-log'))
        .map(x => x.url)));
    check('Und danach steht nur noch die gescheiterte Anmeldung da',
      spRows(d).length === 1 && spRows(d)[0].dataset.event === 'login.fail',
      JSON.stringify(spRows(d).map(z => z.dataset.event)));
    check('Die gewaehlte Pille ist markiert und "Alle" nicht mehr',
      spFailed().classList.contains('on') && !spFilter()[0].classList.contains('on'),
      JSON.stringify(spFilter().map(b => b.className)));
    check('Und die Fusszeile sagt, dass sie von dieser Art spricht',
      /dieser Art/.test(d.w.document.getElementById('log-foot')?.textContent || ''),
      d.w.document.getElementById('log-foot')?.textContent);
    // Und wieder zurueck: eine Ansicht, aus der es keinen Weg heraus gibt,
// waere eine Falle.
    spFilter()[0].dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => d.sent.filter(g => String(g.url).startsWith('/api/security-log')).length > 2 &&
      openRequests(x) === 0, 2000, 'die ungefilterte Liste');
    check('Zurueck auf "Alle" zeigt wieder alle vier Zeilen',
      spRows(d).length === 4, `${spRows(d).length} Zeilen`);

    /* ---- 0.13.0: die Namen sind anklickbar ---- */
    const spRole = spRows(d).find(z => z.dataset.event === 'user.role');
    const spWhoButton = spRole?.querySelector('.log-actor .log-jump');
    check('Der Handelnde ist ein Knopf und kein blosser Text', !!spWhoButton,
      spRole?.querySelector('.log-actor')?.innerHTML);
    check('Und er traegt die Nummer des Zugangs',
      spWhoButton?.dataset.mid === '1', spWhoButton?.dataset.mid);
    check('Das Ziel ebenso',
      spRole?.querySelector('.log-target .log-jump')?.dataset.mid === '2',
      spRole?.querySelector('.log-target')?.innerHTML);
    check('Der Pfeil steht dabei VOR dem Knopf und nicht in ihm',
      /^→\s/.test(spRole?.querySelector('.log-target')?.textContent || '') &&
      !/→/.test(spRole?.querySelector('.log-target .log-jump')?.textContent || ''),
      spRole?.querySelector('.log-target')?.textContent);
    /* "UNBEKANNTER NAME" WIRD NIE EIN KNOPF: er ist der getippte Name eines
       Versuchs, der an keinen Zugang traf -- es gaebe nichts, wohin er
       springen koennte. */
    const spFail = spRows(d).find(z => z.dataset.event === 'login.fail');
    check('"unbekannter Name" bleibt Text und wird kein Knopf',
      !!spFail && /unbekannter Name/.test(spFail.textContent) &&
      !spFail.querySelector('.log-jump'), spFail?.innerHTML);
    // Und "über usertool.js auf dem Wirt" ebenso wenig -- dort ist niemand.
    const spHost = spRows(d).find(z => z.dataset.event === 'user.password');
    check('Der Wirt wird ebenso wenig anklickbar',
      !spHost?.querySelector('.log-actor .log-jump'),
      spHost?.querySelector('.log-actor')?.innerHTML);
    // Das Ziel dieser Zeile dagegen schon: carla ist ein Zugang.
    check('Ihr Ziel dagegen schon',
      spHost?.querySelector('.log-target .log-jump')?.dataset.mid === '3',
      spHost?.querySelector('.log-target')?.innerHTML);
    /* DER SPRUNG FINDET DIE ZEILE IN DER KARTE "ZUGAENGE". Wer das Protokoll
       sieht, ist Eigentuemer und damit immer auch Admin -- die Karte ist da. */
    spWhoButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !spWhoButton || x.document.querySelector('#musers .mrow-flash'),
      2000, 'die hervorgehobene Zeile');
    check('Ein Klick hebt die Zeile in der Karte "Zugaenge" hervor',
      !!d.w.document.querySelector('#musers .mrow[data-mid="1"].mrow-flash'),
      d.w.document.getElementById('musers')?.innerHTML.slice(0, 200));
  }

  /* ---- 0.13.0: die fuenf Vorgaenge ohne Wort ---- Ein Vorgang ohne Wort
     faellt auf den Rueckfall `|| z.was` und steht als roher Schluessel am
     Bildschirm. */
  {
    const wVerz = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-woerter-'));
    const wListen = JSON.parse(shortRun(
      `const a = require('./auth'); console.log(JSON.stringify(` +
      `{ EVENTS: a.EVENTS, DETAILS: a.DETAILS, GROUPS: a.LOG_GROUPS }));`, wVerz));
    fs.rmSync(wVerz, { recursive: true, force: true });
    const wRows = wListen.EVENTS.map((event, i) => ({
      id: 100 + i, at: '2026-08-24 09:00:00', event,
      actor: event === 'login.fail' ? null : 1, actorName: event === 'login.fail' ? null : 'chefin',
      target: null, targetName: null, detail: null }));
    const d = await ziSystem({ isAdmin: true, isOwner: true },
      { logInventory: { rows: wRows, total: wRows.length, days: 180, limit: 100,
                            counts: { all: wRows.length } } });
    /* ERST DER GEGENSTAND: ohne Zeilen bliebe die Verneinung darunter wahr und
       belegte nichts. */
    check('Der Aufbau steht: jede Vorgangsart hat eine Zeile',
      spRows(d).length === wListen.EVENTS.length,
      `${spRows(d).length} von ${wListen.EVENTS.length}`);
    /* KEIN ROHER SCHLUESSEL AM BILDSCHIRM. Erkennbar sind sie am Punkt:
       "request.approve" steht so in keiner deutschen Beschriftung. */
    const wRaw = spRows(d).filter(z =>
      (z.querySelector('.log-event')?.textContent || '').includes('.'));
    check('Kein Vorgang steht als roher Schluessel am Bildschirm',
      wRaw.length === 0, wRaw.map(z => z.dataset.event).join(' '));
    /* UND JEDES MERKMAL HAT SEIN WORT -- ausser den beiden, deren Wort schon
       der Vorgang traegt ("Zugang gesperrt" / "Zugang freigegeben"). */
    const wWithoutEvent = ['active', 'locked'];
    const wZeilen2 = wListen.DETAILS.filter(m => !wWithoutEvent.includes(m))
      .map((detail, i) => ({ id: 200 + i, at: '2026-08-24 09:00:00', event: 'user.self',
        actor: 1, actorName: 'chefin', target: 1, targetName: 'chefin', detail }));
    const dm = await ziSystem({ isAdmin: true, isOwner: true },
      { logInventory: { rows: wZeilen2, total: wZeilen2.length, days: 180, limit: 100,
                            counts: { all: wZeilen2.length } } });
    check('Der Aufbau steht: jedes Merkmal hat eine Zeile',
      spRows(dm).length === wZeilen2.length, `${spRows(dm).length} von ${wZeilen2.length}`);
    const wSilent = spRows(dm).filter(z =>
      !(z.querySelector('.log-detail')?.textContent || '').trim());
    check('Und jedes Merkmal bekommt sein Wort — keines verschwindet spurlos',
      wSilent.length === 0,
      wSilent.map((z, i) => wZeilen2[spRows(dm).indexOf(z)]?.detail).join(' '));
    /* JEDER VORGANG STEHT IN GENAU EINER GRUPPE. */
    const wMapping = wListen.EVENTS.map(v =>
      [v, Object.entries(wListen.GROUPS).filter(([, kinds]) => kinds.includes(v)).length]);
    check('Jeder Vorgang steht in genau einer Gruppe des Filters',
      wMapping.every(([, n]) => n === 1),
      wMapping.filter(([, n]) => n !== 1).map(([v, n]) => `${v}: ${n}`).join(' · '));
    dm.w.close();
    d.w.close();
  }

  /* DER LEERE FALL. */
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true },
      { logInventory: { rows: [], total: 0, days: 180, limit: 100 } });
    check('Auch ohne Vorgang steht die Karte da', !!spCard(d));
    check('Und sie sagt es, statt leer zu bleiben',
      /Noch kein Vorgang festgehalten/.test(spText(d)), spText(d).replace(/\s+/g, ' ').slice(0, 160));
    check('Es steht dann auch keine Zeile da', spRows(d).length === 0, `${spRows(d).length}`);
  }

  /* UND DIE ANDEREN BEIDEN ROLLEN. */
  {
    const dAdmin = await ziSystem({ isAdmin: true, isOwner: false });
    check('Ohne Eigentuemerrolle wird das Protokoll gar nicht erst abgerufen',
      !dAdmin.sent.some(x => x.url === '/api/security-log'),
      dAdmin.sent.map(x => x.url).join(' · '));
    /* GEZAEHLT WIRD UEBER ALLE ABSCHNITTE: ein einzelner traegt seit 0.16.0
       drei bis sieben Karten, und „mehr als fuenf" saehe je nach offenem
       Abschnitt anders aus. */
    const dAdminCards = (await sysPass(dAdmin)).cards;
    check('Und der Systembereich bleibt dabei gefuellt',
      dAdminCards.length > 5, `${dAdminCards.length} Karten`);
    const dUser = await ziSystem({ isAdmin: false, isOwner: false });
    check('Ein gewoehnlicher Benutzer ruft es erst recht nicht ab',
      !dUser.sent.some(x => x.url === '/api/security-log'),
      dUser.sent.map(x => x.url).join(' · '));
  }

  /* ---------------------------------------------------------------- */
  group('Die zweite Bestaetigung in der Oberflaeche');

  /* NEUE BEDIENELEMENTE WERDEN PER dispatchEvent GEDRUECKT, samt Durchlauf
     des Event Loops -- .click() genuegt nicht. */
  const zdDialog = (d) => d.w.document.getElementById('confirm-pass');
  const zdAsked = (d, url) => d.sent.some(x => x.url === url);

  // 1. DER LINK. Der Dialog steht davor, und vorher geht nichts an den Server.
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    placeConfirm(d.w, true);
    const row = ziRows(d).find(r => (r.querySelector('.mname')?.textContent || '').includes('carla'));
    const linkButton = row?.querySelector('.user-link-btn');
    linkButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !linkButton || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    check('Der Dialog steht da', !!zdDialog(d), 'kein Dialog');
    check('Und er sagt, WARUM gefragt wird',
      D.shows(zdDialog(d)?.closest('.modal')?.textContent, 'dialog.appWideHint'),
      zdDialog(d)?.closest('.modal')?.textContent?.replace(/\s+/g, ' ').slice(0, 220));
    check('Das Feld verbirgt die Eingabe',
      zdDialog(d)?.type === 'password', zdDialog(d)?.type);
    check('Bis dahin ist weder die Freigabe noch der Link angefordert',
      !zdAsked(d, '/api/confirm') && !zdAsked(d, '/api/users/3/token'),
      d.sent.map(x => x.url).join(' · '));

    /* DER ABBRUCH. Ein Abbruch, der trotzdem handelt, ist der schlimmere
       Fehler -- also wird er ausdruecklich geprueft. */
    await confirmImDom(d, 'egal', true);
    check('Nach dem Abbruch geht gar nichts an den Server',
      !zdAsked(d, '/api/confirm') && !zdAsked(d, '/api/users/3/token'),
      d.sent.map(x => x.url).join(' · '));
    check('Und der Dialog ist weg', !zdDialog(d), 'der Dialog steht noch');
  }

  // 2. DAS FALSCHE PASSWORT. Die Freigabe wird gefragt und abgewiesen -- und
// die Handlung laeuft NICHT trotzdem.
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    placeConfirm(d.w, true);
    const row = ziRows(d).find(r => (r.querySelector('.mname')?.textContent || '').includes('carla'));
    const linkButton = row?.querySelector('.user-link-btn');
    linkButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !linkButton || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    await confirmImDom(d, 'ganz-falsch-hier');
    check('Mit falschem Passwort wird die Freigabe gefragt',
      zdAsked(d, '/api/confirm'), d.sent.map(x => x.url).join(' · '));
    check('Und die Handlung laeuft trotzdem NICHT',
      !zdAsked(d, '/api/users/3/token'), d.sent.map(x => x.url).join(' · '));
    check('Es steht auch kein Linkkasten da',
      !d.w.document.getElementById('user-link-field'), 'der Link steht da');
  }

  // 3. DAS RICHTIGE PASSWORT -- an der Rolle, am fremden Passwort und am
  // Entfernen.
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    placeConfirm(d.w, true);
    const row = ziRows(d).find(r => (r.querySelector('.mname')?.textContent || '').includes('carla'));
    const field = row?.querySelector('.user-role-sel');
    if (field) { field.value = 'admin'; field.dispatchEvent(new d.w.Event('change', { bubbles: true })); }
    await until(d.w, (x) => !field || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    check('Vor dem Rollenwechsel steht der Dialog', !!zdDialog(d), 'kein Dialog');
    await confirmImDom(d);
    const zdShare = d.sent.find(x => x.url === '/api/confirm');
    check('Die Freigabe nennt Zweck und Ziel',
      zdShare?.body?.purpose === 'role' && zdShare?.body?.target === 3,
      JSON.stringify(zdShare?.body));
    check('Und danach geht der Rollenwechsel an den Server',
      d.sent.some(x => x.method === 'PUT' && x.url === '/api/users/3'),
      d.sent.map(x => `${x.method} ${x.url}`).join(' · '));
    check('Die Freigabe kommt VOR der Handlung',
      d.sent.findIndex(x => x.url === '/api/confirm') <
      d.sent.findIndex(x => x.method === 'PUT' && x.url === '/api/users/3'),
      d.sent.map(x => `${x.method} ${x.url}`).join(' · '));
  }
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    placeConfirm(d.w, true);
    /* prompt() WIRD AUF „Abbrechen" GESTELLT, obwohl die Oberflaeche es seit
       0.22.0 nicht mehr ruft: jsdom liefert undefined, und ein Rueckbau auf
       prompt() liefe damit in `.trim()` auf undefined -- der Lauf risse ab,
       statt dass die Zeile zum Passwortfeld rot wuerde. */
    d.w.prompt = () => null;
    const row = ziRows(d).find(r => (r.querySelector('.mname')?.textContent || '').includes('carla'));
    const passButton = row?.querySelector('.user-pass-btn');
    passButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !passButton || x.document.getElementById('np-pass'),
      2000, 'das Fenster fuer das fremde Passwort');
    /* SEIT 0.22.0 KOMMT DAS FREMDE PASSWORT AUS EINEM EIGENEN WINDOW MIT
       PASSWORTFELD -- nicht mehr aus prompt(), wo es im Klartext stand
       (Bauabschnitt 4). */
    const npField = d.w.document.getElementById('np-pass');
    check('Vor dem fremden Passwort steht ein Fenster mit Passwortfeld — 0.22.0',
      npField?.type === 'password' && /Passwort für „carla“ setzen/.test(npField?.closest('.modal')?.textContent || ''),
      npField?.closest('.modal')?.textContent?.replace(/\s+/g, ' ').slice(0, 160) || '(kein Fenster)');
    check('Und es nennt die Vorgabe und die Folge',
      /Mindestens 10 Zeichen\. Alle Sitzungen dieses Benutzers werden beendet\./.test(npField?.closest('.modal')?.textContent || ''),
      npField?.closest('.modal')?.textContent?.replace(/\s+/g, ' ').slice(0, 200));
    if (npField) {
      npField.value = 'carlas-neues-langes-wort';
      npField.closest('.modal').querySelector('[data-yes]').dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
      await until(d.w, (x) => x.document.getElementById('confirm-pass'),
        2000, 'der Dialog der zweiten Bestaetigung');
    }
    check('Danach steht der Dialog der zweiten Bestaetigung', !!zdDialog(d), 'kein Dialog');
    await confirmImDom(d);
    check('Die Freigabe traegt den Zweck Passwort',
      d.sent.find(x => x.url === '/api/confirm')?.body?.purpose === 'password',
      JSON.stringify(d.sent.find(x => x.url === '/api/confirm')?.body));
    check('Und danach wird das Passwort gesetzt',
      d.sent.some(x => x.method === 'PUT' && x.url === '/api/users/3' && x.body?.password),
      d.sent.map(x => `${x.method} ${x.url}`).join(' · '));
  }
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    const row = ziRows(d).find(r => (r.querySelector('.mname')?.textContent || '').includes('carla'));
    const removeButton = row?.querySelector('.user-x');
    removeButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !removeButton ||
      (x.document.getElementById('delete-user') && openRequests(x) === 0),
      2000, 'das Fenster zum Loeschen');
    /* ---- 0.22.0: EIN WINDOW STATT DREI RUECKFRAGEN (Bauabschnitt 4) ----
       Bis 0.21.1 stellte der Weg drei confirm() hintereinander, und in den
       ersten beiden hiess „Abbrechen" nicht abbrechen. */
    const zdModal = d.w.document.getElementById('delete-user');
    check('Vor dem Loeschen steht EIN Fenster mit den Haekchen — 0.22.0',
      !!zdModal && !zdDialog(d), zdModal ? 'steht' : 'kein Fenster');
    const zdText = zdModal?.textContent.replace(/\s+/g, ' ') || '';
    check('Es nennt den umkehrbaren Weg: sperren statt loeschen',
      D.shows(zdText, 'dialog.lockInsteadHint'), zdText.slice(0, 300));
    const zdYes = zdModal?.querySelector('[data-yes]');
    zdYes?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !zdYes || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    check('Danach steht der Dialog der zweiten Bestaetigung', !!zdDialog(d), 'kein Dialog');
    /* DAS PASSWORTFENSTER SAGT, WAS GESCHIEHT UND DASS ES ENDGUELTIG IST --
       die Rueckgaengig-Formel des Woerterbuchs. */
    check('Und das Passwortfenster dahinter sagt, dass es endgueltig ist',
      /Das lässt sich nicht rückgängig machen/.test(zdDialog(d)?.closest('.modal')?.textContent || ''),
      zdDialog(d)?.closest('.modal')?.textContent?.replace(/\s+/g, ' ').slice(0, 300));
    check('Und der Zugang ist bis dahin nicht entfernt',
      !d.sent.some(x => x.method === 'DELETE' && x.url.startsWith('/api/users/3')),
      d.sent.map(x => `${x.method} ${x.url}`).join(' · '));
    await confirmImDom(d);
    check('Die Freigabe traegt den Zweck Entfernen',
      d.sent.find(x => x.url === '/api/confirm')?.body?.purpose === 'remove',
      JSON.stringify(d.sent.find(x => x.url === '/api/confirm')?.body));
    check('Und danach wird entfernt',
      d.sent.some(x => x.method === 'DELETE' && x.url.startsWith('/api/users/3')),
      d.sent.map(x => `${x.method} ${x.url}`).join(' · '));
  }

  /* 4. DER EXPORT. Er ist eine BROWSERNAVIGATION -- geprueft wird bis zum
     Dialog und beim Abbruch, denn ein bestaetigter Export verliesse jsdom. */
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    // Der Export steht seit 0.16.0 im Abschnitt „Datenbank" und in derselben
// Karte wie der Import.
    await sysSection(d.w, 'database');
    const exNo = d.w.document.getElementById('ex-no');
    exNo?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !exNo || x.document.querySelector('.backdrop'), 2000, 'der Hinweis auf den Lauf');
    /* ERST DER HINWEIS AUF DEN LAUF, DANN DIE ZWEITE BESTAETIGUNG. */
    const zdNotice = () => [...d.w.document.querySelectorAll('.backdrop .modal')]
      .find(m => /Bevor der Export läuft/.test(m.textContent || ''));
    check('Vor dem Export steht der Hinweis auf den Lauf', !!zdNotice(), 'kein Hinweis');
    const zdWays = zdNotice()?.textContent?.replace(/\s+/g, ' ') || '';
    check('Er sagt an, dass es dauert und keinen Fortschritt gibt',
      /dauern/.test(zdWays) && /keine Fortschrittsanzeige/.test(zdWays)
      && /Fenster muss offen bleiben/.test(zdWays), zdWays.slice(0, 260));
    check('Und er stellt alle drei Wege nebeneinander',
      /Export in einer Datei/.test(zdWays) && /In Teilen exportieren/.test(zdWays)
      && /Backup/.test(zdWays), zdWays.slice(0, 320));
    check('Bis dahin steht der Dialog der zweiten Bestaetigung nicht da',
      !zdDialog(d), 'er steht schon da');
    const zdGo = zdNotice()?.querySelector('[data-yes]');
    zdGo?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !zdGo || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    check('Danach steht der Dialog', !!zdDialog(d), 'kein Dialog');
    check('Und er nennt, was der Export mitnimmt',
      /Verfassernamen/.test(zdDialog(d)?.closest('.modal')?.textContent || ''),
      zdDialog(d)?.closest('.modal')?.textContent?.replace(/\s+/g, ' ').slice(0, 220));
    await confirmImDom(d, 'egal', true);
    check('Nach dem Abbruch wird keine Freigabe geholt',
      !zdAsked(d, '/api/confirm'), d.sent.map(x => x.url).join(' · '));
  }
  /* UND DER ABBRUCH AM HINWEIS SELBST: er holt weder Freigabe noch Dialog. */
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    await sysSection(d.w, 'database');
    const exNo = d.w.document.getElementById('ex-no');
    exNo?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !exNo || x.document.querySelector('.backdrop'), 2000, 'der Hinweis auf den Lauf');
    const zdBack = [...d.w.document.querySelectorAll('.backdrop')]
      .find(b => /Bevor der Export läuft/.test(b.textContent || ''));
    zdBack?.querySelector('[data-no]')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, () => !zdBack?.isConnected, 2000, 'der geschlossene Hinweis');
    check('Nach dem Abbruch am Hinweis steht kein Passwortfenster',
      !zdDialog(d) && !zdAsked(d, '/api/confirm'), d.sent.map(x => x.url).join(' · '));
  }
  /* Was hier NICHT steht und warum: der Import laeuft ueber eine echte Datei
     und einen FileReader; sein Weg ist serverseitig belegt (Gruppe "jeder
     schwere Weg einzeln"), und ein gestellter Dateiwaehler pruefte den
     Dateiwaehler, nicht die Schranke. */

  /* ---------------------------------------------------------------- */
  group('Die oeffentliche Adresse im Linkkasten');

  /* BEIDE ZUSTAENDE, und zu jedem die Nachschau, dass der ANDERE gerade nicht
     dasteht -- sonst bliebe eine Zeile, die BEIDE Formen nennt, in beiden
     Lagen gruen. */
  const oaLink = async (opt) => {
    const d = await ziSystem({ isAdmin: true, isOwner: true }, opt);
    placeConfirm(d.w, true);
    const row = ziRows(d).find(r => (r.querySelector('.mname')?.textContent || '').includes('carla'));
    const linkButton = row?.querySelector('.user-link-btn');
    linkButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !linkButton || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    await confirmImDom(d);
    return d;
  };
  {
    const d = await oaLink({});
    const row = d.w.document.getElementById('user-link-origin');
    check('Die Herkunftszeile steht ueberhaupt da', !!row, 'keine Zeile');
    check('Ohne Einstellung sagt sie: aus deinem Browser',
      /aus deinem Browser/.test(row?.textContent || ''), row?.textContent);
    check('Und nennt die Einstellung dabei NICHT',
      !/PUBLIC_ADDRESS/.test(row?.textContent || ''), row?.textContent);
    check('Sie nennt die Adresse, auf die der Link zeigt',
      (row?.textContent || '').includes(d.w.location.origin), row?.textContent);
    check('Und das Feld traegt die vom Browser gebaute Adresse',
      d.w.document.getElementById('user-link-field')?.value ===
        `${d.w.location.origin}${d.w.location.pathname}#/invite/${'d'.repeat(64)}`,
      d.w.document.getElementById('user-link-field')?.value);
  }
  {
    const d = await oaLink({ publicAddress: 'https://kriterion.beispiel.de' });
    const row = d.w.document.getElementById('user-link-origin');
    check('Mit Einstellung steht die Herkunftszeile ebenfalls da', !!row, 'keine Zeile');
    check('Und sie nennt die Einstellung beim Namen',
      /PUBLIC_ADDRESS/.test(row?.textContent || ''), row?.textContent);
    check('Vom Browser ist dann NICHT die Rede',
      !/aus deinem Browser/.test(row?.textContent || ''), row?.textContent);
    check('Sie nennt die Adresse aus der Einstellung',
      /kriterion\.beispiel\.de/.test(row?.textContent || ''), row?.textContent);
    check('Und das Feld traegt den Link des Servers, nicht den des Browsers',
      d.w.document.getElementById('user-link-field')?.value ===
        `https://kriterion.beispiel.de/#/invite/${'d'.repeat(64)}`,
      d.w.document.getElementById('user-link-field')?.value);
  }

  /* EINE WAHL, EIN KNOPF -- und das Passwortfeld erscheint nur zu der
     Betriebsart, in der es gilt. */
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    const kind = d.w.document.getElementById('user-kind');
    const button = d.w.document.getElementById('user-create');
    const pass = d.w.document.getElementById('user-pass');
    check('Das Auswahlfeld steht im Formular', !!kind, 'kein Auswahlfeld');
    check('Und es gibt nur EINEN Anlegeknopf',
      !!button && d.w.document.querySelectorAll('.user-new .btn').length === 1,
      `${d.w.document.querySelectorAll('.user-new .btn').length} Knoepfe`);
    check('Es traegt genau die zwei Betriebsarten',
      equal([...kind.options].map(o => o.value), ['link', 'passwort']),
      JSON.stringify([...(kind?.options || [])].map(o => o.value)));
    /* DIE VORGABE IST DER LINK -- der Weg, bei dem der Admin das Passwort nie
       erfaehrt. */
    check('Die Vorgabe ist der Link', kind.value === 'link', kind.value);
    check('Und das Passwortfeld steht dabei nicht da',
      pass.hidden === true, `hidden=${pass.hidden}`);
    check('Der Knopf sagt, was er tun wird',
      button.textContent.includes('Link'), button.textContent);
    /* Und die Regel dazu im Stylesheet -- ohne sie stuende das Feld im
       Flex-Kasten weiter da. */
    const ziCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8').replace(/\s+/g, ' ');
    check('Das Stylesheet nimmt ein verstecktes Feld wirklich aus der Zeile',
      /\[hidden\] \{ display: none !important; \}/.test(ziCss),
      'die grundsaetzliche Regel fuer [hidden] fehlt');
    check('Und zwar ohne eine eigene Regel fuer diesen Kasten daneben',
      !/\.user-new \[hidden\] \{/.test(ziCss), 'die alte oertliche Regel steht noch da');

    // Hinwechseln: das Feld erscheint, der Knopf heisst anders.
    kind.value = 'password';
    kind.dispatchEvent(new d.w.Event('change'));
    check('Nach der Wahl "ich vergebe eins" erscheint das Passwortfeld',
      pass.hidden === false, `hidden=${pass.hidden}`);
    check('Und der Knopf spricht nicht mehr vom Link',
      !button.textContent.includes('Link'), button.textContent);

    // Zurueckwechseln: das Feld verschwindet UND wird geleert.
    pass.value = 'heimlich-getipptes';
    kind.value = 'link';
    kind.dispatchEvent(new d.w.Event('change'));
    check('Zurueck beim Link verschwindet das Feld wieder',
      pass.hidden === true, `hidden=${pass.hidden}`);
    check('Und was darin stand, ist geleert',
      pass.value === '', JSON.stringify(pass.value));
  }

  /* Die Vorgabe legt mit Link an. */
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    const before = ziRows(d).length;
    setField(d.w.document, 'user-name', 'neuling');
    const createButton = d.w.document.getElementById('user-create');
    createButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !createButton || (d.sent.some(g => g.method === 'POST' && g.url === '/api/users') &&
      openRequests(x) === 0), 2000, 'die Antwort auf das Anlegen');
    const create = d.sent.find(x => x.method === 'POST' && x.url === '/api/users');
    check('Der Knopf legt den Zugang an',
      !!create && create.body?.username === 'neuling', JSON.stringify(create));
    check('Und zwar ausdruecklich mit Einladung',
      create?.body?.sendInvite === true, JSON.stringify(create?.body));
    check('Ohne ein Passwort mitzuschicken',
      create?.body?.password === undefined, JSON.stringify(create?.body));
    check('Der Link erscheint gleich mit',
      d.w.document.getElementById('user-link-field')?.value
        === `${d.w.location.origin}${d.w.location.pathname}#/invite/${'e'.repeat(64)}`,
      d.w.document.getElementById('user-link-field')?.value);
    check('Und die Liste zeichnet sich mit einer Zeile mehr neu',
      ziRows(d).length === before + 1, `${before} -> ${ziRows(d).length}`);
  }

  /* Die andere Betriebsart schickt das Passwort und KEINE Einladung -- sonst
     waere die Wahl eine Kulisse. */
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    const kind = d.w.document.getElementById('user-kind');
    kind.value = 'password';
    kind.dispatchEvent(new d.w.Event('change'));
    setField(d.w.document, 'user-name', 'mitpasswort');
    setField(d.w.document, 'user-pass', 'ein-passwort-1');
    const createButton = d.w.document.getElementById('user-create');
    createButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !createButton || (d.sent.some(g => g.method === 'POST' && g.url === '/api/users') &&
      openRequests(x) === 0), 2000, 'die Antwort auf das Anlegen');
    const create = d.sent.find(x => x.method === 'POST' && x.url === '/api/users');
    check('Der gewoehnliche Weg schickt das Passwort',
      create?.body?.password === 'ein-passwort-1', JSON.stringify(create?.body));
    check('Und ausdruecklich KEINE Einladung',
      create?.body?.sendInvite === undefined, JSON.stringify(create?.body));
    check('Und es erscheint kein Linkkasten',
      !d.w.document.getElementById('user-link-field'), 'der Kasten steht doch da');
  }

  /* Das Adressfeld beim Anlegen, seit 0.9.0. FREIWILLIG -- ohne Adresse
     entsteht der Zugang wie bisher, und nur die Mail bleibt aus. */
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    check('Beim Anlegen steht ein Adressfeld',
      !!d.w.document.getElementById('user-mail'), 'kein Adressfeld');
    setField(d.w.document, 'user-name', 'neuling');
    setField(d.w.document, 'user-mail', 'neuling@beispiel.de');
    const createButton = d.w.document.getElementById('user-create');
    createButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !createButton || (d.sent.some(g => g.method === 'POST' && g.url === '/api/users') &&
      openRequests(x) === 0), 2000, 'die Antwort auf das Anlegen');
    const create = d.sent.find(x => x.method === 'POST' && x.url === '/api/users');
    check('Die Adresse geht mit an den Server',
      create?.body?.email === 'neuling@beispiel.de', JSON.stringify(create?.body));
    check('Und das Feld ist danach geleert',
      d.w.document.getElementById('user-mail')?.value === '',
      JSON.stringify(d.w.document.getElementById('user-mail')?.value));
  }
  {
    // OHNE ADRESSE wird das Feld gar nicht erst mitgeschickt -- ein leeres
    // `email` waere am Server die Ansage "keine", und das ist beim ANLEGEN
    // dasselbe; mitzuschicken gibt es trotzdem nichts.
    const d = await ziSystem({ isAdmin: true, isOwner: true });
    setField(d.w.document, 'user-name', 'ohnemail');
    const createButton = d.w.document.getElementById('user-create');
    createButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !createButton || (d.sent.some(g => g.method === 'POST' && g.url === '/api/users') &&
      openRequests(x) === 0), 2000, 'die Antwort auf das Anlegen');
    const create = d.sent.find(x => x.method === 'POST' && x.url === '/api/users');
    check('Ohne Adresse geht kein leeres Feld hinaus',
      create?.body?.email === undefined, JSON.stringify(create?.body));
    check('Und der Zugang entsteht trotzdem',
      create?.body?.username === 'ohnemail', JSON.stringify(create?.body));
  }

  /* ---------------------------------------------------------------- */
  group('Die eigene Adresse in der Karte „Mein Account“');

  /* SIE GEHOERT DEM, DER SIE HAT -- deshalb steht sie hier und nicht in der
     Karte „Zugänge“. */
  {
    const d = await ziSystem({ isAdmin: false, isOwner: false });
    const field = d.w.document.getElementById('acc-mail');
    check('Das Adressfeld steht in der Karte „Mein Account“', !!field, 'kein Feld');
    check('Und es traegt die Adresse aus der Antwort',
      field?.value === 'chefin@beispiel.de', JSON.stringify(field?.value));
    /* UMGEDREHT MIT 0.22.0 (Anlage B): „freiwillig" heisst am Feld
       „(optional)", und der Satz ueber den Link steht in der Karte
       „Mailversand", wo die Auskunft hingehoert. */
    check('Die Karte sagt, dass die Adresse optional ist — 0.22.0',
      /E-Mail-Adresse \(optional\)/.test(d.w.document.body.textContent.replace(/\s+/g, ' ')), 'kein Hinweis');
    check('Und sie sagt in einem Satz, was sie enthaelt — 0.22.0',
      D.shows(d.w.document.body.textContent, 'card.accountHint'),
      d.w.document.body.textContent.slice(0, 100));
  }
  {
    const d = await ziSystem({ isAdmin: false, isOwner: false }, { ownAddress: '' });
    const field = d.w.document.getElementById('acc-mail');
    check('Ohne hinterlegte Adresse ist das Feld leer',
      field?.value === '', JSON.stringify(field?.value));
    check('Und der Platzhalter sagt es',
      /noch keine hinterlegt/.test(field?.placeholder || ''), field?.placeholder);
  }
  {
    /* GESPEICHERT WIRD SIE MIT DEM BISHERIGEN PASSWORT, ueber denselben Weg
       wie Name und Passwort. */
    const d = await ziSystem({ isAdmin: false, isOwner: false });
    setField(d.w.document, 'acc-old', DOM_PASSWORD);
    setField(d.w.document, 'acc-mail', 'neue@beispiel.de');
    const saveButton = d.w.document.getElementById('acc-save');
    saveButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !saveButton || (d.sent.some(g => g.method === 'PUT' && g.url === '/api/account') &&
      openRequests(x) === 0), 2000, 'die neu gezeichnete Karte „Mein Account“');
    const put = d.sent.find(x => x.method === 'PUT' && x.url === '/api/account');
    check('Der Knopf schickt die Adresse mit',
      put?.body?.email === 'neue@beispiel.de', JSON.stringify(put?.body));
    check('Und das bisherige Passwort daneben',
      put?.body?.oldPassword === DOM_PASSWORD, 'das bisherige Passwort fehlt');
    /* DER MOCK ZIEHT MIT, also steht die neue Adresse danach wirklich im Feld
 -- sonst waere „die Karte zeichnet sich neu“ von „sie
       blieb stehen“ nicht zu unterscheiden. */
    check('Und die Karte zeigt danach die neue Adresse',
      d.w.document.getElementById('acc-mail')?.value === 'neue@beispiel.de',
      JSON.stringify(d.w.document.getElementById('acc-mail')?.value));
  }
  {
    // LEEREN HEISST LOESCHEN, und das Feld muss es koennen: ein leeres Feld,
    // das als „unveraendert“ gelesen wird, liesse eine Adresse nie wieder
    // entfernen -- genau die stille Falle, die niemand bemerkt.
    const d = await ziSystem({ isAdmin: false, isOwner: false });
    setField(d.w.document, 'acc-old', DOM_PASSWORD);
    setField(d.w.document, 'acc-mail', '');
    const saveButton = d.w.document.getElementById('acc-save');
    saveButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !saveButton || (d.sent.some(g => g.method === 'PUT' && g.url === '/api/account') &&
      openRequests(x) === 0), 2000, 'die neu gezeichnete Karte „Mein Account“');
    const put = d.sent.find(x => x.method === 'PUT' && x.url === '/api/account');
    check('Ein geleertes Feld geht als leerer Wert hinaus, nicht als fehlendes',
      put?.body?.email === '' && 'email' in (put?.body || {}), JSON.stringify(put?.body));
    check('Und die Karte zeigt danach keine Adresse mehr',
      d.w.document.getElementById('acc-mail')?.value === '',
      JSON.stringify(d.w.document.getElementById('acc-mail')?.value));
  }

  /* ---------------------------------------------------------------- */
  group('Die Karte „Mailversand“');

  /* DIE ACHTZEHNTE KARTE, und sie gehoert dem EIGENTUEMER -- eintragen,
     einsehen und testen. */
  const mvCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Mailversand');
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true },
      { publicAddress: 'https://kriterion.beispiel.de' });
    const k = mvCard(d);
    check('Die Karte „Mailversand“ steht da', !!k, 'keine Karte');
    /* DER SATZ, DER UEBER ALLEM STEHT, GEHOERT AN DEN BILDSCHIRM und nicht
       bloss in ein Dokument. */
    check('Sie sagt, dass E-Mail optional ist — 0.22.0',
      /E-Mail ist optional\./.test(k?.textContent || ''),
      k?.textContent?.slice(0, 300));
    check('Sie sagt "eingerichtet"',
      /eingerichtet/.test(k?.textContent || ''), k?.textContent?.slice(0, 300));
    /* ---- FUENF ZEILEN UND KEIN FELD — 0.17.3 ---- DIE KARTE TRAEGT KEIN
       BEDIENELEMENT MEHR ausser den beiden Knoepfen. */
    const mvRows = [...(k?.querySelectorAll('.kv .k') || [])].map(e => e.textContent.trim());
    check('Sie ist eine Zustandskarte mit fuenf Zeilen',
      equal(mvRows, ['Zustand', 'Anbieter', 'Absender', 'Öffentliche Adresse',
                        'Zuletzt erfolgreich getestet']),
      JSON.stringify(mvRows));
    check('Und traegt kein einziges Eingabefeld mehr',
      [...(k?.querySelectorAll('input, select, textarea') || [])].length === 0,
      [...(k?.querySelectorAll('input, select, textarea') || [])].map(e => e.id).join(','));
    /* DIE ANBIETERZEILE FASST DREI ANGABEN ZU EINER. Bis 0.17.2 stand der
       Anbieter allein auf einem Drittel, daneben zwei Drittel Leere. */
    const mvValue = (name) => [...(k?.querySelectorAll('.kv') || [])]
      .find(z => z.querySelector('.k')?.textContent.trim() === name)
      ?.querySelector('.v')?.textContent.trim() || '';
    check('Die Anbieterzeile nennt Name, Server mit Port und Verschluesselung',
      mvValue('Anbieter') === 'GMX · mail.gmx.net:587 · STARTTLS', JSON.stringify(mvValue('Anbieter')));
    check('Und die Absenderzeile die Absenderadresse',
      mvValue('Absender') === 'instanz@gmx.de', JSON.stringify(mvValue('Absender')));
    /* DAS PASSWORT STEHT NIE DA -- weder als Wert noch als Laenge noch als
       Sternchen mit der richtigen Zahl. */
    check('Die Karte traegt keine Zeile „Passwort" mehr',
      !mvRows.includes('Passwort'), JSON.stringify(mvRows));
    check('Sie nennt die Frist des Versands',
      /20 Sekunden/.test(k?.textContent || ''), k?.textContent?.slice(0, 900));
    /* ZWEI KNOEPFE, und der erste sagt, was er tut. */
    const mvButtons = [...(k?.querySelectorAll('.btn') || [])].map(b => `${b.id}:${b.textContent.trim()}`);
    check('Darunter stehen genau zwei Knoepfe',
      equal(mvButtons, ['mail-setup:Mailzugang ändern', 'mail-test:Testmail an mich']),
      JSON.stringify(mvButtons));
    check('Die Karte nennt die zuletzt erfolgreiche Probe',
      /2026-08-20 08:30:00/.test(k?.textContent || ''), k?.textContent?.slice(0, 600));
    check('Und sie nennt die oeffentliche Adresse',
      /kriterion\.beispiel\.de/.test(k?.textContent || ''), k?.textContent?.slice(0, 600));
    d.w.close();
  }
  {
    // OHNE OEFFENTLICHE ADRESSE markiert die Karte rot und nennt den Grund.
    const d = await ziSystem({ isAdmin: true, isOwner: true }, { publicAddress: '' });
    const k = mvCard(d);
    check('Ohne oeffentliche Adresse markiert die Karte das',
      /nicht gesetzt — es wird nicht verschickt/.test(k?.textContent || ''),
      k?.textContent?.slice(0, 600));
    check('Und nennt den Grund',
      /braucht sie, um gültige Links zu erzeugen/.test(k?.textContent || ''),
      k?.textContent?.slice(0, 900));
    check('Die Stelle traegt die rote Auszeichnung',
      !!k?.querySelector('.mail-off'), 'keine Auszeichnung');
    d.w.close();
  }
  {
    // OHNE ZUGANG: der Zustand jeder Instanz vor dieser Runde.
    const d = await ziSystem({ isAdmin: true, isOwner: true }, { mailStatus: {} });
    const k = mvCard(d);
    check('Ohne Mailzugang sagt die Karte "nicht eingerichtet"',
      /nicht eingerichtet/.test(k?.textContent || ''), k?.textContent?.slice(0, 400));
    /* UND DIE ANBIETERZEILE STEHT NICHT LEER DA. Eine leere Zelle sieht aus
       wie eine Auskunft, die nicht geladen hat. */
    check('Und die Anbieterzeile sagt, dass keiner gewaehlt ist',
      /noch keiner gewählt/.test(k?.textContent || ''), k?.textContent?.slice(0, 500));
    check('Der Knopf heisst dann „einrichten" und nicht „ändern"',
      d.w.document.getElementById('mail-setup')?.textContent.trim() === 'Mailzugang einrichten',
      d.w.document.getElementById('mail-setup')?.textContent);
    check('Und "noch nie" bei der Probe',
      /noch nie/.test(k?.textContent || ''), k?.textContent?.slice(0, 600));
    d.w.close();
  }
  {
    /* ---- WAS 0.17.2 WEGGENOMMEN HAT, BLEIBT WEG ---- Die Begruendung zum
       fehlenden Adressfeld ist richtig und war ein Gedanke vom Bauen; eine
       Oberflaeche sagt, WAS IST (Projektstand 5.6). */
    const d = await ziSystem({ isAdmin: true, isOwner: true },
      { publicAddress: 'https://kriterion.beispiel.de' });
    const t = (mvCard(d)?.textContent || '').replace(/\s+/g, ' ');
    check('Die Begruendung zum fehlenden Adressfeld steht nicht in der Karte',
      !/offener Mailverteiler/.test(t), t.slice(0, 60));
    check('Was die Testmail tut, steht aber weiterhin da',
      D.shows(t, 'card.testMailGoesHint'), t.slice(-140));
    d.w.close();
  }
  {
    /* DIE TESTMAIL, und zwar in BEIDEN Ausgaengen -- Erfolg UND Fehlschlag.
       Ein Knopf, der nur im guten Fall geprueft ist, ist halb geprueft. */
    const d = await ziSystem({ isAdmin: true, isOwner: true },
      { publicAddress: 'https://kriterion.beispiel.de' });
    const testButton = d.w.document.getElementById('mail-test');
    testButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !testButton || (d.sent.some(g => g.url === '/api/mail/test') &&
      openRequests(x) === 0), 2000, 'die Antwort auf die Testmail');
    check('Der Testknopf fragt den Server',
      d.sent.some(x => x.method === 'POST' && x.url === '/api/mail/test'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    /* KEIN ADRESSFELD DANEBEN, und der Rumpf traegt auch keins: die Testmail
       geht an die eigene Adresse, und das ist baulich und nicht abgefragt. */
    const test = d.sent.find(x => x.url === '/api/mail/test');
    check('Und schickt ausdruecklich KEINE Adresse mit',
      JSON.stringify(test?.body || {}) === '{}', JSON.stringify(test?.body));
    check('Es gibt auch gar kein Adressfeld daneben',
      !mvCard(d)?.querySelector('input[type="email"]'), 'ein Adressfeld steht da');
    check('Der Erfolg steht danach in der Karte',
      /Testmail an .+ gesendet\. Kommt sie an, funktioniert der Versand\./.test(d.w.document.getElementById('mail-result')?.textContent || ''),
      d.w.document.getElementById('mail-result')?.textContent);
    check('Und die Karte sagt, an welche Adresse',
      /chefin@beispiel\.de/.test(d.w.document.getElementById('mail-result')?.textContent || ''),
      d.w.document.getElementById('mail-result')?.textContent);
    d.w.close();
  }
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true },
      { publicAddress: 'https://kriterion.beispiel.de', mailError: true });
    const testButton = d.w.document.getElementById('mail-test');
    testButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !testButton || (d.sent.some(g => g.url === '/api/mail/test') &&
      openRequests(x) === 0), 2000, 'die Antwort auf die Testmail');
    check('Ein Fehlschlag steht ebenfalls in der Karte',
      /fehlgeschlagen/.test(d.w.document.getElementById('mail-result')?.textContent || ''),
      d.w.document.getElementById('mail-result')?.textContent);
    check('Mit dem Grund daneben',
      /550/.test(d.w.document.getElementById('mail-result')?.textContent || ''),
      d.w.document.getElementById('mail-result')?.textContent);
    check('Und der Knopf ist danach wieder bedienbar',
      d.w.document.getElementById('mail-test')?.disabled === false,
      `gesperrt=${d.w.document.getElementById('mail-test')?.disabled}`);
    d.w.close();
  }
  {
    // OHNE EIGENE ADRESSE sagt die Absage, wo sie einzutragen ist.
    const d = await ziSystem({ isAdmin: true, isOwner: true },
      { publicAddress: 'https://kriterion.beispiel.de', ownAddress: '' });
    const testButton = d.w.document.getElementById('mail-test');
    testButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !testButton || (d.sent.some(g => g.url === '/api/mail/test') &&
      openRequests(x) === 0), 2000, 'die Antwort auf die Testmail');
    check('Ohne eigene Adresse sagt die Karte, wo sie einzutragen ist',
      /Zugang/.test(d.w.document.getElementById('mail-result')?.textContent || ''),
      d.w.document.getElementById('mail-result')?.textContent);
    d.w.close();
  }

  /* ---------------------------------------------------------------- */
  group('Der Dialog „Mailzugang einrichten“ — 0.17.3');

  /* DIE KARTE ZEIGT, DER DIALOG STELLT EIN. */
  const mdOpen = async (d) => {
    const setupButton = d.w.document.getElementById('mail-setup');
    setupButton?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !setupButton || x.document.getElementById('mail-dialog'),
      2000, 'der Dialog „Mailzugang“');
    return d.w.document.getElementById('mail-dialog');
  };
  {
    const d = await ziSystem({ isAdmin: true, isOwner: true },
      { publicAddress: 'https://kriterion.beispiel.de' });
    check('Vor dem Klick steht kein Dialog da', !d.w.document.getElementById('mail-dialog'));
    const dlg = await mdOpen(d);
    check('Der Knopf oeffnet den Dialog', !!dlg, d.w.document.body.innerHTML.slice(-200));
    check('Und seine Ueberschrift sagt, dass geaendert wird',
      dlg?.querySelector('h2')?.textContent.trim() === 'Mailzugang ändern',
      dlg?.querySelector('h2')?.textContent);
    /* EINE SPALTE, BESCHRIFTUNG UEBER DEM FELD. Jedes Feld steht in einem
       `.field` mit eigener Beschriftung -- keine Reihe, kein Raster. */
    check('Der Dialog traegt keine der alten Reihen mehr',
      !dlg?.querySelector('.mail-reihe'), 'eine Reihe steht noch da');
    /* DIE AUSWAHLLISTE KOMMT VOM SERVER, samt „Eigener Server“. */
    const selection = d.w.document.getElementById('mail-provider');
    check('Die Anbieterliste kommt vom Server',
      [...(selection?.options || [])].map(o => o.value).join(',') === ',gmx,web,gmail,strato,ionos,eigen',
      [...(selection?.options || [])].map(o => o.value).join(','));
    check('Und der gespeicherte Anbieter steht vorgewaehlt',
      selection?.value === 'gmx', selection?.value);
    /* ---- DER HINWEIS STEHT UNTER SEINER SACHE UND WECHSELT MIT DER AUSWAHL. */
    const mdHint = () => d.w.document.getElementById('mail-provider-hint');
    check('Der Hinweis zum Anbieter steht unter der Auswahl',
      mdHint()?.previousElementSibling?.querySelector('#mail-provider') != null,
      mdHint()?.previousElementSibling?.className);
    check('Und er nennt, was GMX verlangt',
      /fremde Programme/.test(mdHint()?.textContent || ''), mdHint()?.textContent);
    /* BEI EINER VORLAGE STEHEN SERVER, PORT UND VERSCHLUESSELUNG ALS GELESENE
       ZEILE DA -- kein Feld. */
    const mdFixed = () => d.w.document.getElementById('mail-fixed');
    const mdFixedField = () => d.w.document.getElementById('mail-fixed-field');
    const mdOwn = () => d.w.document.getElementById('mail-custom');
    check('Bei einer Vorlage steht die feste Zeile da',
      mdFixedField()?.hidden === false && mdFixed()?.textContent === 'mail.gmx.net · 587 · STARTTLS',
      `versteckt=${mdFixedField()?.hidden} · ${mdFixed()?.textContent}`);
    check('Und die drei Felder dazu stehen nicht da',
      mdOwn()?.hidden === true, `versteckt=${mdOwn()?.hidden}`);
    /* DER SATZ ZUM HAUSANSCHLUSS STEHT BEI „EIGENER SERVER" UND SONST NIRGENDS
       -- dort, wo er gilt. Bis 0.17.2 stand er quer durch die ganze Karte. */
    /* ER STEHT DORT, WO ER GILT, UND SONST NIRGENDS -- geprueft ueber ALLE
       Absaetze des Dialogs und nicht ueber einen: eine zweite Ausfertigung
       weiter unten faende die Abfrage auf einen einzelnen nicht. */
    check('Und der Satz zum Internetanschluss steht ausschliesslich bei „Eigener Server“',
      [...(dlg?.querySelectorAll('p') || [])]
        .filter(x => /Internetanschluss/.test(x.textContent)).length === 1 &&
      [...(dlg?.querySelectorAll('p') || [])]
        .filter(x => /Internetanschluss/.test(x.textContent)).every(x => x.closest('#mail-custom')),
      [...(dlg?.querySelectorAll('p') || [])]
        .filter(x => /Internetanschluss/.test(x.textContent)).map(x => x.parentElement?.id).join(','));

    /* ---- UND JETZT DIE GEGENRICHTUNG: „Eigener Server" ---- */
    selection.value = 'eigen';
    selection.dispatchEvent(new d.w.Event('change'));
    check('Bei „eigener Server“ stehen die drei Felder da',
      mdOwn()?.hidden === false &&
      !!d.w.document.getElementById('mail-server') &&
      !!d.w.document.getElementById('mail-port') &&
      !!d.w.document.getElementById('mail-secure'),
      `versteckt=${mdOwn()?.hidden}`);
    check('Und die gelesene Zeile verschwindet dafuer',
      mdFixedField()?.hidden === true, `versteckt=${mdFixedField()?.hidden}`);
    check('Der Satz zum Internetanschluss steht genau dort',
      /Internetanschluss/.test((mdOwn()?.textContent || '').replace(/\s+/g, ' ')),
      (mdOwn()?.textContent || '').replace(/\s+/g, ' ').slice(-160));
    check('Und „Eigener Server“ hat keinen Anbieterhinweis',
      mdHint()?.hidden === true, `versteckt=${mdHint()?.hidden} · ${mdHint()?.textContent}`);
    /* EIN ANDERER VORLAGENANBIETER WECHSELT BEIDES MIT -- Hinweis UND feste
       Zeile. */
    selection.value = 'gmail';
    selection.dispatchEvent(new d.w.Event('change'));
    check('Ein anderer Anbieter bringt seine eigene feste Zeile mit',
      mdFixed()?.textContent === 'smtp.gmail.com · 465 · SSL/TLS', mdFixed()?.textContent);
    check('Und seinen eigenen Hinweis',
      /App-Passwort/.test(mdHint()?.textContent || ''), mdHint()?.textContent);
    /* „KEIN VERSAND" IST DER DRITTE FALL und nicht die halbe Vorlagenlage:
       dort gibt es weder feste Zeile noch Felder, und die drei Felder
       darunter haben nichts zu tragen. */
    selection.value = '';
    selection.dispatchEvent(new d.w.Event('change'));
    check('Ohne Anbieter steht weder die feste Zeile noch die Felder da',
      mdFixedField()?.hidden === true && mdOwn()?.hidden === true,
      `fest=${mdFixedField()?.hidden} · eigen=${mdOwn()?.hidden}`);
    check('Und die drei Felder darunter sind gesperrt',
      ['user', 'pass', 'sender']
        .every(id => d.w.document.getElementById('mail-' + id)?.disabled === true),
      ['user', 'pass', 'sender']
        .map(id => `${id}=${d.w.document.getElementById('mail-' + id)?.disabled}`).join(' · '));

    /* ---- DAS PASSWORT UND SEIN PLATZHALTER ---- */
    selection.value = 'gmx';
    selection.dispatchEvent(new d.w.Event('change'));
    check('Das Passwortfeld steht leer da',
      d.w.document.getElementById('mail-pass')?.value === '',
      JSON.stringify(d.w.document.getElementById('mail-pass')?.value));
    check('Und sagt im Platzhalter, dass leer "unveraendert" heisst',
      /leer lassen ändert es nicht/.test(d.w.document.getElementById('mail-pass')?.placeholder || ''),
      d.w.document.getElementById('mail-pass')?.placeholder);
    /* DER HINWEIS ZUR ABSENDERADRESSE STEHT UNTER IHR und nicht neben ihr. */
    const mdAbs = d.w.document.getElementById('mail-sender-hint');
    check('Der Hinweis zur Absenderadresse steht unter dem Feld',
      mdAbs?.previousElementSibling?.querySelector('#mail-sender') != null,
      mdAbs?.previousElementSibling?.className);
    check('Und er nennt, dass die Adresse zum Konto gehoeren muss',
      /Absenderadresse muss zum Konto gehören/.test(mdAbs?.textContent || ''), mdAbs?.textContent);
    /* DIE REIHENFOLGE DER FELDER, in einer Zeile abgelesen: Anbieter, die
       drei der eigenen Lage, Benutzername, Passwort, Absenderadresse. */
    const mdFollow = [...(dlg?.querySelectorAll('.field .input') || [])].map(e => e.id);
    check('Die Felder stehen in der festgelegten Folge',
      equal(mdFollow, ['mail-provider', 'mail-server', 'mail-port', 'mail-secure',
                       'mail-user', 'mail-pass', 'mail-sender']),
      JSON.stringify(mdFollow));
    // ABBRECHEN SCHLIESST OHNE ZU SCHREIBEN.
    const mdBefore = d.sent.length;
    dlg.querySelector('[data-no]').dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !x.document.getElementById('mail-dialog'), 2000, 'der geschlossene Dialog');
    check('Abbrechen schliesst den Dialog', !d.w.document.getElementById('mail-dialog'));
    check('Und schreibt dabei nichts',
      !d.sent.slice(mdBefore).some(x => x.method !== 'GET'),
      d.sent.slice(mdBefore).map(x => `${x.method} ${x.url}`).join(' · ') || '(nichts)');
    d.w.close();
  }
  {
    /* SPEICHERN -- hinter der zweiten Bestaetigung, mit einem WIRKLICH
       zugestellten Ereignis. */
    const d = await ziSystem({ isAdmin: true, isOwner: true },
      { publicAddress: 'https://kriterion.beispiel.de', mailStatus: {} });
    const dlg = await mdOpen(d);
    check('Ohne Zugang heisst die Ueberschrift „einrichten"',
      dlg?.querySelector('h2')?.textContent.trim() === 'Mailzugang einrichten',
      dlg?.querySelector('h2')?.textContent);
    setField(d.w.document, 'mail-provider', 'gmail');
    d.w.document.getElementById('mail-provider').dispatchEvent(new d.w.Event('change'));
    setField(d.w.document, 'mail-user', 'instanz@gmail.com');
    setField(d.w.document, 'mail-pass', 'erfundenes-app-passwort');
    setField(d.w.document, 'mail-sender', 'instanz@gmail.com');
    const mdSave = d.w.document.getElementById('mail-save');
    mdSave?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    // Ohne Rueckfrage geht der Mailzugang sofort hinaus; dann wird auf die Antwort gewartet.
    await until(d.w, (x) => !mdSave || x.document.getElementById('confirm-pass') ||
      (d.sent.some(g => g.method === 'PUT' && g.url === '/api/mail') && openRequests(x) === 0),
      2000, 'der Dialog der zweiten Bestaetigung');
    check('Vor dem Speichern steht die zweite Bestaetigung',
      !!d.w.document.getElementById('confirm-pass'), 'kein Dialog');
    check('Und der Server ist bis dahin NICHT gefragt worden',
      !d.sent.some(x => x.method === 'PUT' && x.url === '/api/mail'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    /* BRICHT DIE BESTAETIGUNG AB, BLEIBT DER DIALOG STEHEN -- sonst waere das
       Eingetippte weg, und ein Anbieterpasswort tippt niemand gern zweimal. */
    await confirmImDom(d, 'chefinnen-langes-wort', true);
    check('Ein Abbruch der Bestaetigung laesst den Dialog stehen',
      !!d.w.document.getElementById('mail-dialog'), 'der Dialog ist weg');
    check('Und das Eingetippte steht noch darin',
      d.w.document.getElementById('mail-user')?.value === 'instanz@gmail.com',
      d.w.document.getElementById('mail-user')?.value);
    // Und noch einmal, diesmal mit Freigabe.
    const mdSave2 = d.w.document.getElementById('mail-save');
    mdSave2?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !mdSave2 || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    await confirmImDom(d);
    await until(d.w, (x) => d.sent.some(g => g.method === 'PUT' && g.url === '/api/mail') &&
      openRequests(x) === 0, 2000, 'der gespeicherte Mailzugang');
    const put = d.sent.find(x => x.method === 'PUT' && x.url === '/api/mail');
    check('Danach geht der Zugang an den Server',
      put?.body?.provider === 'gmail' && put?.body?.user === 'instanz@gmail.com',
      JSON.stringify({ ...put?.body, password: '(nicht abgedruckt)' }));
    check('Und zwar ueber dieselbe Route wie vorher -- keine neue',
      d.sent.filter(x => x.method === 'PUT' && /^\/api\/mail/.test(x.url)).length === 1,
      d.sent.filter(x => x.method !== 'GET').map(x => `${x.method} ${x.url}`).join(' · '));
    check('Nach dem Speichern schliesst der Dialog',
      !d.w.document.getElementById('mail-dialog'), 'der Dialog steht noch da');
    check('Und die Karte zeigt danach "eingerichtet"',
      /eingerichtet/.test(mvCard(d)?.textContent || '') &&
      !/nicht eingerichtet/.test(mvCard(d)?.textContent || ''),
      mvCard(d)?.textContent?.slice(0, 300));
    check('Und der Knopf heisst jetzt „ändern"',
      d.w.document.getElementById('mail-setup')?.textContent.trim() === 'Mailzugang ändern',
      d.w.document.getElementById('mail-setup')?.textContent);
    d.w.close();
  }

  /* ---------------------------------------------------------------- */
  group('Der Papierkorb in der Oberflaeche');

  /* DIE KARTE IN BEIDEN ZUSTAENDEN -- gefuellt und leer. */
  const pkSystem = async (roles, opt = {}) => {
    const d = buildDom(JSDOM, { settings: { filters: null, userCount: 4, ...roles }, ...opt });
    await until(d.w, (x) => x.document.getElementById('count') && openRequests(x) === 0,
      2000, 'die Uebersicht');
    await sysSection(d.w, 'inventory');
    await until(d.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
      2000, 'der Abschnitt „Bestand“');
    return d;
  };
  const pkCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Papierkorb');
  const pkTrashRows = (d) => [...(pkCard(d)?.querySelectorAll('#mtrash .mrow.trash') || [])];

  const pkuEig = await pkSystem({ isAdmin: true, isOwner: true });
  const pkuAdm = await pkSystem({ isAdmin: true, isOwner: false });
  const pkuUser = await pkSystem({ isAdmin: false, isOwner: false });

  // ERST DAS VORHANDENSEIN, dann jede Aussage darueber.
  check('Die Karte steht bei der Eigentuemerin', !!pkCard(pkuEig));
  check('Und beim Admin ohne Eigentuemerrolle', !!pkCard(pkuAdm));
  check('Bei einem gewoehnlichen Benutzer gibt es sie nicht', !pkCard(pkuUser));
  check('Ohne Adminrolle wird die Liste gar nicht erst abgerufen',
    !pkuUser.sent.some(x => x.url === '/api/trash'),
    pkuUser.sent.map(x => x.url).join(' · '));
  check('Mit Adminrolle sehr wohl',
    pkuAdm.sent.some(x => x.url === '/api/trash'),
    pkuAdm.sent.map(x => x.url).join(' · '));

  const pkuRows = pkTrashRows(pkuEig);
  check('Die Karte zeigt beide Zeilen', pkuRows.length === 2,
    `${pkuRows.length} Zeilen`);
  check('Mit ihren Titeln',
    equal(pkuRows.map(r => r.querySelector('.mname')?.textContent), ['Weggeworfenes', 'Von einem Grabstein']),
    JSON.stringify(pkuRows.map(r => r.querySelector('.mname')?.textContent)));
  const pkuMeta = pkuRows.map(r => r.querySelector('.trash-meta')?.textContent || '');
  check('Jede Zeile nennt, wer geloescht hat',
    /von chefin/.test(pkuMeta[0]), pkuMeta[0]);
  /* Der GRABSTEIN geht denselben Weg von der Nummer zum Namen wie ueberall
     sonst -- der Name steht in der Antwort ausdruecklich auf null. */
  check('Und ein Grabstein heisst wie ueberall "Geloeschter Benutzer 4"',
    /von Gelöschter Benutzer 4/.test(pkuMeta[1]), pkuMeta[1]);
  check('Jede Zeile nennt die verbleibenden Tage',
    /noch 12 Tage/.test(pkuMeta[0]) && /noch 27 Tage/.test(pkuMeta[1]),
    JSON.stringify(pkuMeta));
  check('Und ihre Groesse', /2,0 KB/.test(pkuMeta[0]), pkuMeta[0]);
  check('Das Datum steht in deutscher Schreibweise',
    /01\.08\.2026/.test(pkuMeta[0]), pkuMeta[0]);

  /* BEIDE KNOEPFE NUR BEIM EIGENTUEMER. */
  check('Bei der Eigentuemerin steht an jeder Zeile Zurueckholen und ein Kreuz',
    pkuRows.length === 2 && pkuRows.every(r => !!r.querySelector('.trash-back') && !!r.querySelector('.trash-remove')),
    JSON.stringify(pkuRows.map(r => r.innerHTML.slice(0, 120))));
  const pkuAdmRows = pkTrashRows(pkuAdm);
  check('Beim Admin gibt es die Zeilen ueberhaupt', pkuAdmRows.length === 2,
    `${pkuAdmRows.length} Zeilen`);
  check('Aber an ihnen steht kein einziger Knopf',
    pkuAdmRows.every(r => !r.querySelector('.trash-back') && !r.querySelector('.trash-remove')),
    JSON.stringify(pkuAdmRows.map(r => r.innerHTML.slice(0, 120))));
  check('Und die Karte sagt ihm, wer es darf',
    /kann nur der Eigentümer/.test(pkCard(pkuAdm)?.querySelector('.desc')?.textContent || ''),
    pkCard(pkuAdm)?.querySelector('.desc')?.textContent);
  check('Bei der Eigentuemerin steht dieser Satz NICHT',
    !/Eigentümer dieser Installation/.test(pkCard(pkuEig)?.querySelector('.desc')?.textContent || ''),
    pkCard(pkuEig)?.querySelector('.desc')?.textContent);

  // Die Frist steht in der Karte, und zwar die aus der Antwort.
  check('Die Karte nennt die Frist aus der Antwort',
    /30 Tage/.test(pkCard(pkuEig)?.querySelector('.desc')?.textContent || ''),
    pkCard(pkuEig)?.querySelector('.desc')?.textContent);

  /* DAS VOKABULAR. */
  const pkuVok = await pkSystem({ isAdmin: true, isOwner: true,
    vocabulary: { entryOne: 'Maschine', entryMany: 'Maschinen',
                 dayOne: 'Prüfung', dayMany: 'Prüfungen' } });
  check('Die Karte benutzt das Vokabular',
    /Gelöschte Maschinen/.test(pkCard(pkuVok)?.querySelector('.desc')?.textContent || ''),
    pkCard(pkuVok)?.querySelector('.desc')?.textContent);
  /* UMGEDREHT MIT 0.22.0 (Anlage F): der Satz zum Zeitpunkt ist aus der Karte
     heraus, und mit ihm das zweite Vokabelwort. */
  check('Und das Standardwort steht nicht daneben — 0.22.0',
    !/Eintr(ag|äge)/.test(pkCard(pkuVok)?.querySelector('.desc')?.textContent || ''),
    pkCard(pkuVok)?.querySelector('.desc')?.textContent);

  /* DER LEERE FALL, mit eigenem Aufbau. */
  const pkuEmpty = await pkSystem({ isAdmin: true, isOwner: true }, { trashInventory: [] });
  check('Ist der Papierkorb leer, steht die Karte trotzdem da', !!pkCard(pkuEmpty));
  check('Und sie sagt es',
    /Keine gelöschten Einträge/.test(pkCard(pkuEmpty)?.textContent || ''),
    pkCard(pkuEmpty)?.textContent?.slice(0, 200));
  check('Ohne eine einzige Zeile', pkTrashRows(pkuEmpty).length === 0);
  const pkuEmptyVok = await pkSystem({ isAdmin: true, isOwner: true,
    vocabulary: { entryOne: 'Maschine', entryMany: 'Maschinen' } }, { trashInventory: [] });
  check('Auch der leere Fall benutzt das Vokabular',
    /Keine gelöschten Maschinen/.test(pkCard(pkuEmptyVok)?.textContent || ''),
    pkCard(pkuEmptyVok)?.textContent?.slice(0, 200));

  /* ZURUECKHOLEN, mit einem WIRKLICH zugestellten Ereignis -- .click()
     genuegt nicht, und ein Fehler hinter einem await bliebe im nur gebauten
     DOM unsichtbar. */
  {
    const d = await pkSystem({ isAdmin: true, isOwner: true });
    const before = pkTrashRows(d).length;
    const pkBack = pkTrashRows(d)[0]?.querySelector('.trash-back');
    pkBack?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !pkBack || (d.sent.some(g => g.method === 'POST' && g.url.startsWith('/api/trash/')) &&
      openRequests(x) === 0), 2000, 'die neu gezeichnete Liste des Papierkorbs');
    check('Der Knopf schickt das Zurueckholen an den Server',
      d.sent.some(x => x.method === 'POST' && x.url === '/api/trash/501/restore'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und holt die Liste danach neu',
      d.sent.filter(x => x.url === '/api/trash').length >= 2,
      d.sent.map(x => x.url).join(' · '));
    check('Die Karte zeigt danach eine Zeile weniger',
      pkTrashRows(d).length === before - 1, `vorher ${before}, danach ${pkTrashRows(d).length}`);
    check('Und die zurueckgeholte Zeile ist es, die fehlt',
      !pkTrashRows(d).some(r => r.querySelector('.mname')?.textContent === 'Weggeworfenes'),
      JSON.stringify(pkTrashRows(d).map(r => r.querySelector('.mname')?.textContent)));
    check('Eine Meldung sagt es',
      /Weggeworfenes/.test(d.w.document.querySelector('.toast')?.textContent || ''),
      d.w.document.querySelector('.toast')?.textContent);
  }

  /* Und die laute Haelfte: unbekannte Verfasser aus der Antwort werden
     genannt. Die zweite Zeile der Prueflage traegt sie. */
  {
    const d = await pkSystem({ isAdmin: true, isOwner: true });
    const pkBack = pkTrashRows(d)[1]?.querySelector('.trash-back');
    pkBack?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !pkBack || (d.sent.some(g => g.method === 'POST' && g.url.startsWith('/api/trash/')) &&
      openRequests(x) === 0), 2000, 'die neu gezeichnete Liste des Papierkorbs');
    check('Unbekannte Verfasser stehen in der Meldung',
      /dora/.test(d.w.document.querySelector('.toast')?.textContent || ''),
      d.w.document.querySelector('.toast')?.textContent);
  }

  /* ENDGUELTIG ENTFERNEN -- mit Rueckfrage davor. Ein Weg ohne Rueckweg
     bekommt eine. */
  {
    const d = await pkSystem({ isAdmin: true, isOwner: true });
    const before = pkTrashRows(d).length;
    const pkRemove = pkTrashRows(d)[0]?.querySelector('.trash-remove');
    pkRemove?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !pkRemove || x.document.querySelector('.backdrop .modal'),
      2000, 'die Rueckfrage');
    const askKey = d.w.document.querySelector('.backdrop .modal');
    check('Das Kreuz fragt zuerst nach', !!askKey, d.w.document.body.innerHTML.slice(0, 120));
    check('Und die Frage nennt den Titel und sagt, dass es danach keinen Rueckweg gibt',
      /Weggeworfenes/.test(askKey?.textContent || '') && /nicht rückgängig machen/.test(askKey?.textContent || ''),
      askKey?.textContent);
    // Erst abbrechen: danach darf NICHTS geschickt worden sein.
    const pkNo = d.w.document.querySelector('.backdrop [data-no]');
    pkNo?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, () => !pkNo?.isConnected, 2000, 'die geschlossene Rueckfrage');
    check('Nach dem Abbrechen wird nichts geschickt',
      !d.sent.some(x => x.method === 'DELETE' && x.url.startsWith('/api/trash/')),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und die Zeile steht noch da', pkTrashRows(d).length === before);

    const pkRemove2 = pkTrashRows(d)[0]?.querySelector('.trash-remove');
    pkRemove2?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !pkRemove2 || x.document.querySelector('.backdrop .modal'),
      2000, 'die Rueckfrage');
    const pkYes = d.w.document.querySelector('.backdrop [data-yes]');
    pkYes?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !pkYes || (d.sent.some(g => g.method === 'DELETE') && openRequests(x) === 0),
      2000, 'die neu gezeichnete Liste des Papierkorbs');
    check('Nach dem Bestaetigen geht das Entfernen hinaus',
      d.sent.some(x => x.method === 'DELETE' && x.url === '/api/trash/501'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und die Karte zeigt eine Zeile weniger',
      pkTrashRows(d).length === before - 1, `vorher ${before}, danach ${pkTrashRows(d).length}`);
  }

  /* DIE KENNZAHLENKARTE weist den Papierkorb getrennt aus. */
  {
    // Die Kennzahlen stehen im Abschnitt „Datenbank", der Papierkorb in
// „Bestand" -- dieselbe Karte, ein anderer Platz.
    await sysSection(pkuEig.w, 'database');
    const card = [...pkuEig.w.document.querySelectorAll('.sys-grid > .sys-card')]
      .find(c => c.querySelector('h3')?.textContent.trim() === 'Kennzahlen');
    check('Die Karte Kennzahlen ist ueberhaupt da', !!card);
    const row = [...(card?.querySelectorAll('.kv') || [])]
      .find(z => z.querySelector('.k')?.textContent.trim() === 'Papierkorb');
    check('Sie traegt eine Zeile mit der Beschriftung Papierkorb', !!row,
      [...(card?.querySelectorAll('.kv .k') || [])].map(k => k.textContent.trim()).join(' · '));
    check('Und darin stehen Zahl und Groesse aus der Antwort',
      /^2 · 2,5 KB$/.test(row?.querySelector('.v')?.textContent?.trim() || ''),
      row?.querySelector('.v')?.textContent);

    /* ---- VERSION UND ALGORITHM — 0.16.0 ---- DIE VERSION STAND IN DER
       ANTWORT SCHON IMMER, gezeigt hat die Karte sie nie. */
    const kvRow = (k) => [...(card?.querySelectorAll('.kv') || [])]
      .find(z => z.querySelector('.k')?.textContent.trim() === k);
    check('Die Karte nennt die Version der Instanz',
      !!kvRow('Version'),
      [...(card?.querySelectorAll('.kv .k') || [])].map(k => k.textContent.trim()).join(' · '));
    check('Und zwar den Wert aus der Antwort',
      kvRow('Version')?.querySelector('.v')?.textContent.trim() ===
        require('./package.json').version,
      kvRow('Version')?.querySelector('.v')?.textContent);
    check('Und sie steht unmittelbar vor dem Fingerprint',
      [...(card?.querySelectorAll('.kv .k') || [])].map(k => k.textContent.trim())
        .join('|').includes('Version|Prüfsumme (Fingerprint)'),
      [...(card?.querySelectorAll('.kv .k') || [])].map(k => k.textContent.trim()).join(' · '));
    /* GESUCHT WIRD DER ABSCHNITT MIT DEM NAMEN und nicht der erste: seit
       0.19.0 traegt die Karte zwei -- „Bildablage" steht vor „Verfahren". */
    const kvSignatures = [...(card?.querySelectorAll('.sys-sub') || [])]
      .map(u => u.textContent.trim());
    check('Ein eigener, untergeordneter Abschnitt nennt die Verfahren',
      kvSignatures.includes('Technische Verfahren'), kvSignatures.join(' · '));
    /* DIE BESCHRIFTUNGEN SIND IN DER KARTE EINDEUTIG -- „Datenbank" steht
       dort schon einmal, fuer die Belegung auf der Platte. */
    check('Keine Beschriftung steht in der Karte zweimal',
      new Set([...(card?.querySelectorAll('.kv .k') || [])].map(k => k.textContent.trim())).size ===
        (card?.querySelectorAll('.kv .k') || []).length,
      [...(card?.querySelectorAll('.kv .k') || [])].map(k => k.textContent.trim()).join(' · '));
    for (const [word, value] of [['Verschlüsselung', 'sqlcipher'], ['Schlüssel', '256 Bit (Zufallsschlüssel)'],
                                ['Journal (SQLite)', 'WAL'], ['Passwörter', 'scrypt']]) {
      check(`Die Zeile „${word}" steht darin und nennt ${value}`,
        kvRow(word)?.querySelector('.v')?.textContent.trim() === value,
        kvRow(word)?.querySelector('.v')?.textContent);
    }
    /* UND KEINE PAKETVERSION IN DER GANZEN KARTE. Die Version der INSTANZ steht
       darin und ist erwuenscht; gesucht wird deshalb nach den Paketnamen. */
    check('Und die Karte nennt keine fremde Bibliothek beim Namen',
      !/better-sqlite3|nodemailer|express|multer|sharp/i.test(card?.textContent || ''),
      card?.textContent?.replace(/\s+/g, ' ').slice(0, 200));
    /* NEU MIT 0.17.0: die Karte SAGT das auch nicht mehr. */
    check('Und sie begruendet den Vorbehalt nicht mehr an der Oberflaeche',
      !/Lücke ausnutzen|welcher Bibliothek/.test(card?.textContent || ''),
      card?.textContent?.replace(/\s+/g, ' ').slice(-260));
    /* DIE ANGABE SELBST BLEIBT ABER STEHEN -- ohne diese Zeile bliebe die
       Verneinung darueber auch dann gruen, wenn der ganze Absatz verschwaende. */
    check('Der Satz zum Schluessel neben der Datenbank bleibt dagegen stehen — 0.22.0',
      /liegt (weiterhin im Datenbankverzeichnis|im selben Verzeichnis wie die Datenbank)/
        .test(card?.textContent || ''),
      card?.textContent?.replace(/\s+/g, ' ').slice(-260));
    /* DIE GEGENLAGE: liefert der Server die Verfahren nicht mit, steht der
       Abschnitt gar nicht da -- statt vier Zeilen mit Gedankenstrichen. */
    const withoutVerf = await pkSystem({ isAdmin: true, isOwner: true },
      { statsMethod: null });
    await sysSection(withoutVerf.w, 'database');
    const kWithout = [...withoutVerf.w.document.querySelectorAll('.sys-grid > .sys-card')]
      .find(c => c.querySelector('h3')?.textContent.trim() === 'Kennzahlen');
    check('Ohne Verfahrensangaben steht der Abschnitt gar nicht da',
      !!kWithout && ![...kWithout.querySelectorAll('.sys-sub')]
        .some(u => u.textContent.trim() === 'Verfahren'),
      [...(kWithout?.querySelectorAll('.sys-sub') || [])].map(u => u.textContent.trim()).join(' · '));
    withoutVerf.w.close();
  }

  /* ---------------------------------------------------------------- */
  group('Die Bildablage in der Oberflaeche');

  /* SIE HAT DIE KARTE „Kennzahlen" VERLASSEN UND IST DIE NEUNZEHNTE KARTE,
     seit 0.19.1. */
  {
    // SEIT 0.22.0 HEISST DIE KARTE „Bildformate" (E6).
    const baCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
      .find(c => c.querySelector('h3')?.textContent.trim() === 'Bildformate');
    const baRows = (k) => [...(k?.querySelectorAll('.kv .k') || [])]
      .map(z => z.textContent.trim());

    const baEig = await pkSystem({ isAdmin: true, isOwner: true });
    await sysSection(baEig.w, 'database');
    const kEig = baCard(baEig);
    check('Die Bildablage ist eine Karte fuer sich', !!kEig,
      [...baEig.w.document.querySelectorAll('.sys-grid > .sys-card h3')].map(h => h.textContent).join(' · '));
    check('Und sie steht im Abschnitt „Datenbank", neben „Kennzahlen"',
      [...baEig.w.document.querySelectorAll('.sys-grid > .sys-card h3')]
        .map(h => h.textContent.trim()).includes('Kennzahlen'),
      [...baEig.w.document.querySelectorAll('.sys-grid > .sys-card h3')].map(h => h.textContent).join(' · '));
    const kStats = [...baEig.w.document.querySelectorAll('.sys-grid > .sys-card')]
      .find(c => c.querySelector('h3')?.textContent.trim() === 'Kennzahlen');
    check('Und „Kennzahlen" traegt sie nicht mehr als Unterabschnitt',
      ![...(kStats?.querySelectorAll('.sys-sub') || [])]
        .some(u => u.textContent.trim() === 'Bildablage'),
      [...(kStats?.querySelectorAll('.sys-sub') || [])].map(u => u.textContent.trim()).join(' · '));
    check('Und der Knopf steht wirklich in DIESER Karte',
      !!kEig?.querySelector('#convert-run'),
      kEig ? '(kein Knopf in der Karte)' : '(keine Karte)');
    for (const [word, value] of [['PNG', '12 · 6,0 MB'], ['JPEG', '5 · 512,0 KB'], ['WebP', '2 · 64,0 KB']]) {
      const row = [...(kEig?.querySelectorAll('.kv') || [])]
        .find(z => z.querySelector('.k')?.textContent.trim().startsWith(word));
      check(`Die Zeile „${word}" steht darin und nennt Zahl und Groesse`,
        row?.querySelector('.v')?.textContent.trim() === value,
        `${word}: ${row?.querySelector('.v')?.textContent}`);
    }
    /* EIN FORMAT OHNE BILDER BEKOMMT KEINE ZEILE MIT EINER NULL. Eine Null ist
       eine Aussage, und sie lenkt von den beiden Zahlen ab, um die es geht. */
    check('Ein Format ohne Bilder steht gar nicht da',
      !baRows(kEig).some(z => z.startsWith('GIF')), baRows(kEig).join(' · '));
    /* UMGEDREHT MIT 0.22.0 (Anlage F): der Zusatz am PNG haengt an der Wahl
       -- „wird beim Upload zu WebP" steht nur, wenn ueberhaupt umkodiert wird
       --, und JPEG „bleibt unverändert". */
    const baPicked = kEig?.querySelector('.engine .sdefault.on')
      ?.closest('.engine')?.getAttribute('data-store');
    check('Und PNG traegt den Zusatz genau dann, wenn umkodiert wird — 0.22.0',
      baRows(kEig).some(z => /^PNG/.test(z) &&
        /wird beim Upload zu WebP/.test(z) === (baPicked !== 'png')),
      `Wahl ${baPicked}: ` + baRows(kEig).join(' · '));
    check('Und JPEG den, dass es unveraendert bleibt — 0.22.0',
      baRows(kEig).some(z => /^JPEG.*bleibt unverändert/.test(z)), baRows(kEig).join(' · '));

    /* ---- ZUSAGE 9: DIE KARTE ZEIGT DREI VERFAHREN UND NENNT DIE AUFLAGE
       ---- BIS 0.26.0 STAND HIER EIN HAEKCHEN. */
    const storeRows = [...(baEig.w.document.querySelectorAll('.sys-card .engine[data-store]') || [])];
    check('Die Eigentuemerin bekommt drei Verfahren zur Wahl',
      storeRows.length === 3, `${storeRows.length} Zeilen: ` +
      storeRows.map(z => z.getAttribute('data-store')).join(' · '));
    check('Und es sind genau die drei aus der Antwort',
      ['png', 'webp-lossless', 'webp-lossy'].every(k =>
        storeRows.some(z => z.getAttribute('data-store') === k)),
      storeRows.map(z => z.getAttribute('data-store')).join(' · '));
    /* JEDE ZEILE TRAEGT EINEN KNOPF „Standard", UND GENAU EINER STEHT AN. */
    check('Jede Zeile traegt einen Knopf „Standard"',
      storeRows.every(z => (z.querySelector('.sdefault')?.textContent || '').trim() === 'Standard'),
      storeRows.map(z => z.querySelector('.sdefault')?.textContent).join(' · '));
    const onButtons = storeRows.filter(z => z.querySelector('.sdefault.on'));
    check('Und genau einer davon steht an', onButtons.length === 1,
      `${onButtons.length} angeschaltet`);
    check('Und zwar der, den die Antwort nennt',
      onButtons[0]?.getAttribute('data-store') === 'webp-lossless',
      onButtons[0]?.getAttribute('data-store'));
    /* UND JEDE ZEILE SAGT, WOFUER IHR VERFAHREN GUT IST. Eine Wahl aus drei
       Namen ohne einen Satz dazu ist eine Wahl ins Blaue. */
    const storeText = (k) => storeRows.find(z => z.getAttribute('data-store') === k)
      ?.textContent.replace(/\s+/g, ' ') || '';
    check('„PNG" sagt, dass nicht konvertiert wird',
      /keine Konvertierung/.test(storeText('png')), storeText('png'));
    check('„WebP verlustfrei" nennt sich die Vorgabe',
      /WebP verlustfrei/.test(storeText('webp-lossless')) &&
      /Vorgabe/.test(storeText('webp-lossless')), storeText('webp-lossless'));
    check('„WebP verlustbehaftet" nennt die Zwischenablage und die Auflage',
      /WebP verlustbehaftet/.test(storeText('webp-lossy')) &&
      /Zwischenablage/.test(storeText('webp-lossy')) &&
      /Auflage/.test(storeText('webp-lossy')), storeText('webp-lossy'));
    const button = baEig.w.document.getElementById('convert-run');
    check('Und den Knopf, der den Bestand umstellt', !!button);
    check('Der Knopf ist bedienbar, solange kein Lauf laeuft', !!button && !button.disabled);

    /* WAS DER SCHALTER TUT, STEHT AM SCHALTER -- und zwar vollstaendig: was
       aus einem eingefuegten Bildschirmfoto wird, dass die Guete dabei
       bleibt, und was UNANGETASTET bleibt. */
    const baCardText = (kEig?.textContent || '').replace(/\s+/g, ' ');
    /* ZUSAGE 9: DIE KARTE NENNT DIE AUFLAGE. */
    /* DER WORTLAUT IST MIT 0.31.1 KUERZER -- Regel 1 des Betreibers,
       Stichwort vorn. */
    check('Die Karte nennt die Auflage: verlustbehaftet spart bei Fotos zwei Drittel',
      /Verlustbehaftet: bei Fotos rund zwei Drittel kleiner/.test(baCardText),
      baCardText.slice(0, 400));
    check('Und dass es beim Bildschirmfoto mit Text GRÖSSER wird',
      /bei Bildschirmfotos mit Text dagegen GRÖSSER/.test(baCardText),
      baCardText.slice(0, 400));
    /* DIE DRITTE HAELFTE HAT MIT 0.31.0 IHRE SACHE GEWECHSELT und ist deshalb
       umgestellt und nicht gefallen. */
    check('Und dass die Wahl fuer alles gilt, was hereinkommt',
      /Die Wahl gilt für alles, was hereinkommt/.test(baCardText), baCardText.slice(0, 400));
    /* UND DIE ABLEITUNGEN FOLGEN DER WAHL NICHT (F3). Ohne diesen Satz hielte
       jemand „PNG" fuer eine Aussage ueber die ganze Zeile. */
    check('Und dass die Vorschaubilder der Wahl nicht folgen',
      /Vorschaubilder: in jedem Fall WebP/.test(baCardText),
      baCardText.slice(0, 500));

    /* DER KNOPF FRAGT ERST DAS PASSWORT. */
    baEig.sent.length = 0;
    button?.onclick();
    // Ohne Rueckfrage geht der Lauf sofort hinaus; dann wird auf die Antwort gewartet.
    await until(baEig.w, (x) => !button || x.document.getElementById('confirm-pass') ||
      (baEig.sent.some(g => g.url === '/api/images/convert') && openRequests(x) === 0),
      2000, 'der Dialog der zweiten Bestaetigung');
    const dialog = baEig.w.document.querySelector('.backdrop .modal');
    const dialogText = (baEig.w.document.body.textContent || '');
    check('Der Knopf schreibt nicht sofort los',
      !baEig.sent.some(g => g.url === '/api/images/convert'),
      baEig.sent.map(g => `${g.method} ${g.url}`).join(' · '));
    check('Sondern fragt vorher nach dem Passwort',
      !!dialog && !!baEig.w.document.getElementById('confirm-pass'),
      dialogText.replace(/\s+/g, ' ').slice(0, 160));
    /* UND DER TEXT BESCHOENIGT NICHTS UND SAGT NICHTS ZWEIMAL. */
    /* UMGEDREHT MIT 0.22.0 (Anlage F): vier kurze Saetze -- Zahl und Groesse,
       was mit den Originalen geschieht und was danach uebrig ist, der einzige
       Rueckweg, die Dauer ohne Zahl. */
    check('Und sagt vorher, wie viele Bilder es trifft', /12 PNG-Fotos \(6,0 MB\)/.test(dialogText),
      dialogText.replace(/\s+/g, ' ').slice(0, 300));
    check('Und dass die Originale ersetzt werden — 0.22.0',
      /die Originale ersetzt \(danach etwa/.test(dialogText), dialogText.replace(/\s+/g, ' ').slice(0, 300));
    /* UND DASS DIE ZWEITE HAELFTE NICHT MEHR MITGEHT -- 0.33.0. */
    /* GEFRAGT WIRD AM SATZ DES DIALOGS UND NICHT AM GANZEN SEITENTEXT: die
       Karte darunter sagt weiterhin „Vorschaubilder: in jedem Fall WebP, von
       dieser Wahl unberuehrt", und das ist der Satz, der nach dieser Runde
       ohne Widerspruch dasteht. */
    check('Und dass die Vorschaubilder NICHT mehr mitgehen — 0.33.0',
      !/JPEG-Vorschaubilder werden dabei neu generiert/
        .test(dialogText.replace(/\s+/g, ' ')),
      dialogText.replace(/\s+/g, ' ').slice(0, 400));
    check('Und dass nur ein vorher angelegtes Backup zurueckfuehrt',
      /Rückgängig nur mit einem vorher angelegten Backup/.test(dialogText),
      dialogText.replace(/\s+/g, ' ').slice(0, 300));
    /* DASS ES DAUERN KANN -- ausdruecklich OHNE Zahl. */
    check('Und dass sich die Dauer nicht vorhersagen laesst',
      /Dauer: Minuten bis Stunden\./.test(dialogText),
      dialogText.replace(/\s+/g, ' ').slice(0, 460));
    check('Und bittet nicht mehr um ein Zeitfenster — 0.22.0',
      !/Zeitfenster/.test(dialogText),
      dialogText.replace(/\s+/g, ' ').slice(0, 460));
    /* KEINE ERFUNDENE MINUTENANGABE. Der Dialog nennt Bilder und Bytes -- aber
       keine Dauer in Minuten, Stunden oder Sekunden. */
    check('Aber keine erfundene Zeitangabe',
      !/\b\d+([.,]\d+)?\s*(Sekunden?|Minuten?|Stunden?)\b/
        .test((baEig.w.document.querySelector('.backdrop .modal')?.textContent || '')),
      (baEig.w.document.querySelector('.backdrop .modal')?.textContent || '')
        .replace(/\s+/g, ' ').slice(0, 460));
    baEig.w.document.querySelectorAll('.backdrop').forEach(e => e.remove());

    /* DER KNOPF „Standard" SCHREIBT WIRKLICH -- und ueber PUT /api/settings,
       nicht ueber eine eigene Route. */
    baEig.sent.length = 0;
    const pngButton = baEig.w.document
      .querySelector('.engine[data-store="png"] .sdefault');
    check('Die Zeile „PNG" traegt ihren Knopf noch', !!pngButton);
    if (pngButton) await pngButton.onclick();
    const toggleCall = baEig.sent.find(g => g.url === '/api/settings' && g.method === 'PUT');
    check('Der Knopf „Standard" geht ueber PUT /api/settings', !!toggleCall,
      baEig.sent.map(g => `${g.method} ${g.url}`).join(' · '));
    check('Und schickt genau die eine Wahl',
      toggleCall && toggleCall.body && toggleCall.body.imageStore === 'png' &&
      Object.keys(toggleCall.body).length === 1,
      JSON.stringify(toggleCall && toggleCall.body));
    check('Und es gibt keine eigene Route dafuer',
      !baEig.sent.some(g => /images\/(store|convert)$/.test(g.url) && g.method === 'PUT'),
      baEig.sent.map(g => g.url).join(' · '));
    /* ZUSAGE 8 AN DER OBERFLAECHE: DAS UMSCHALTEN STARTET KEINEN LAUF. */
    check('Und das Umschalten ruft den Lauf ueber den Bestand nicht',
      !baEig.sent.some(g => g.url === '/api/images/convert'),
      baEig.sent.map(g => `${g.method} ${g.url}`).join(' · '));
    await until(baEig.w, (x) => x.document.querySelector('.sys-grid') && openRequests(x) === 0,
      2000, 'der neu gezeichnete Systembereich');
    baEig.w.close();

    /* ---- DIE DREI GEGENLAGEN ---- */
    /* KEIN PNG MEHR DA -- UND DER KNOPF IST WIEDER TOT. */
    const baEmpty = await pkSystem({ isAdmin: true, isOwner: true },
      { statsImageFormats: { webp: { count: 9, bytes: 65536 } } });
    await sysSection(baEmpty.w, 'database');
    check('Ohne PNG ist der Knopf wieder tot — 0.33.0',
      baEmpty.w.document.getElementById('convert-run')?.disabled === true,
      String(baEmpty.w.document.getElementById('convert-run')?.disabled));
    check('Und die Karte sagt nichts mehr ueber Vorschaubilder, die anstuenden',
      !/Generiert veraltete JPEG-Vorschaubilder/
        .test((baCard(baEmpty)?.textContent || '').replace(/\s+/g, ' ')) &&
      /Vorschaubilder: in jedem Fall WebP/
        .test((baCard(baEmpty)?.textContent || '').replace(/\s+/g, ' ')),
      (baCard(baEmpty)?.textContent || '').replace(/\s+/g, ' ').slice(-260));
    baEmpty.w.close();

    // Ein Lauf ist unterwegs: die Zeile zaehlt mit, der Knopf ist tot.
    const baRun = await pkSystem({ isAdmin: true, isOwner: true },
      { statsSwitch: { running: true, total: 12, done: 5, converted: 4, stayed: 1, freed: 100 } });
    await sysSection(baRun.w, 'database');
    check('Waehrend eines Laufs zeigt die Karte den Fortschritt',
      /5 von 12/.test(baRun.w.document.getElementById('convert-running')?.textContent || ''),
      baRun.w.document.getElementById('convert-running')?.textContent);
    check('Und der Knopf ist so lange tot',
      baRun.w.document.getElementById('convert-run')?.disabled === true);
    baRun.w.close();

    // Ein Lauf ist durch: die Zeile sagt, was herauskam.
    const baDone = await pkSystem({ isAdmin: true, isOwner: true },
      { statsSwitch: { running: false, total: 12, done: 12, converted: 11,
                       stayed: 1, freed: 4194304 } });
    await sysSection(baDone.w, 'database');
    const doneRow = baDone.w.document.getElementById('convert-running')?.textContent || '';
    /* DER FERTIGSATZ NENNT SEIT 0.33.0 WIEDER EINE HAELFTE. */
    check('Nach einem Lauf sagt die Zeile, was herauskam',
      /11 von 12 Originalen konvertiert/.test(doneRow) &&
      !/Vorschaubilder neu generiert/.test(doneRow) &&
      /1 bereits aktuell/.test(doneRow) &&
      /4,0 MB gespart/.test(doneRow), doneRow);
    /* UND DIE ZEILE DES ZWEITEN LAUFS STEHT NICHT DA, wenn keiner lief. */
    check('Und die Zeile des Nachziehens steht daneben nicht',
      !baDone.w.document.getElementById('thumbs-running'),
      baDone.w.document.getElementById('thumbs-running')?.textContent);
    baDone.w.close();

    /* ---- DAS NACHZIEHEN DER GEOMETRIE — 0.19.4 ---- ES IST EIN ZWEITER LAUF
       UND NICHT DERSELBE: er faehrt bei jedem Start, die Umstellung auf
       Knopfdruck. */
    const geoRun = await pkSystem({ isAdmin: true, isOwner: true },
      { statsGeometry: { running: true, total: 1032, done: 40, checked: 40,
                          renewed: 31, skipped: 0, grown: 1000 } });
    await sysSection(geoRun.w, 'database');
    check('Waehrend des Nachziehens zeigt die Karte seinen Fortschritt',
      /40 von 1032/.test(geoRun.w.document.getElementById('thumbs-running')?.textContent || ''),
      geoRun.w.document.getElementById('thumbs-running')?.textContent);
    /* UND DER UMSTELLUNGSKNOPF BLEIBT BEDIENBAR. Genau das waere weg, wenn
       beide Laeufe in demselben Feld staenden. */
    check('Und der Umstellungsknopf bleibt dabei bedienbar',
      geoRun.w.document.getElementById('convert-run')?.disabled === false,
      String(geoRun.w.document.getElementById('convert-run')?.disabled));
    geoRun.w.close();

    // Und durch: die Zeile sagt, was herauskam.
    const geoDone = await pkSystem({ isAdmin: true, isOwner: true },
      { statsGeometry: { running: false, total: 1032, done: 1032, checked: 1032,
                          renewed: 825, skipped: 2, grown: 61341696 } });
    await sysSection(geoDone.w, 'database');
    const geoRow = geoDone.w.document.getElementById('thumbs-running')?.textContent || '';
    check('Nach dem Erneuern sagt die Zeile, was herauskam',
      /825 von 1032/.test(geoRow) && /2 übersprungen/.test(geoRow) &&
      /58,5 MB mehr/.test(geoRow), geoRow);
    geoDone.w.close();

    /* UND SIE KENNT BEIDE RICHTUNGEN -- 0.19.5. */
    const geoSmaller = await pkSystem({ isAdmin: true, isOwner: true },
      { statsGeometry: { running: false, total: 1032, done: 1032, checked: 1032,
                          renewed: 825, skipped: 0, grown: -20971520 } });
    await sysSection(geoSmaller.w, 'database');
    const geoSmallerRow = geoSmaller.w.document.getElementById('thumbs-running')?.textContent || '';
    check('Und wenn die Kacheln kleiner geworden sind, sagt sie „weniger"',
      /20,0 MB weniger/.test(geoSmallerRow) && !/mehr/.test(geoSmallerRow),
      geoSmallerRow);
    geoSmaller.w.close();

    /* UND SIE STEHT NICHT DA, WENN ES NICHTS ZU SAGEN GAB. */
    const geoEmpty = await pkSystem({ isAdmin: true, isOwner: true },
      { statsGeometry: { running: false, total: 1032, done: 1032, checked: 1032,
                          renewed: 0, skipped: 0, grown: 0 } });
    await sysSection(geoEmpty.w, 'database');
    check('Ein Lauf ohne Fund hinterlaesst keine Zeile',
      !geoEmpty.w.document.getElementById('thumbs-running'),
      geoEmpty.w.document.getElementById('thumbs-running')?.textContent);
    /* UND DIE KARTE SAGT, WELCHE MASSE DIE BEIDEN ABLEITUNGEN TRAGEN. */
    {
      const t = (baCard(geoEmpty)?.textContent || '').replace(/\s+/g, ' ');
      /* UMGEDREHT MIT 0.22.0 (Anlage F, Regel S5): die Masse der beiden
         Vorschaubilder sind Bauwissen und stehen im Projektstand, nicht mehr
         in der Karte. */
      check('Die Karte sagt, dass die Vorschaubilder nicht mitgezaehlt sind — 0.22.0',
        /Vorschaubilder \(WebP\) sind nicht mitgezählt/.test(t) &&
        !/512 × 512/.test(t) && !/1600 px/.test(t), t.slice(0, 320));
    }
    geoEmpty.w.close();

    /* ---- UND WER SIE NICHT BEDIENEN DARF ---- Der Admin ohne
       Eigentuemerrolle sieht die ZAHLEN -- sie stehen hinter nurAdmin --,
       aber weder Schalter noch Knopf. */
    const baAdm = await pkSystem({ isAdmin: true, isOwner: false });
    await sysSection(baAdm.w, 'database');
    check('Der Admin ohne Eigentuemerrolle sieht die Aufstellung',
      baRows(baCard(baAdm)).some(z => z.startsWith('PNG')),
      baRows(baCard(baAdm)).join(' · '));
    check('Aber keinen Schalter', !baAdm.w.document.getElementById('convert-images'));
    check('Und keinen Knopf', !baAdm.w.document.getElementById('convert-run'));
    baAdm.w.close();
  }

  /* ---------------------------------------------------------------- */
  group('Die Sicherung in der Oberflaeche');

  /* DREI ZUSTAENDE, DREI AUFBAUTEN: eingerichtet, gar nicht eingerichtet und
     ein Zielort mit Fehler. */
  /* „Sicherung" und „Export und Import" stehen seit 0.16.0 im Abschnitt
     „Datenbank", der Papierkorb daneben in „Bestand" -- dieselbe Prueflage,
     ein anderer Abschnitt. */
  const siSystem = async (roles, opt = {}) => {
    const d = await pkSystem(roles, opt);
    await sysSection(d.w, 'database');
    return d;
  };
  const siCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Backup');
  const siEig = await siSystem({ isAdmin: true, isOwner: true });
  const siAdm = await siSystem({ isAdmin: true, isOwner: false });

  check('Die Karte steht bei der Eigentuemerin', !!siCard(siEig));
  check('Beim Admin ohne Eigentuemerrolle gibt es sie nicht', !siCard(siAdm));
  check('Und ohne Eigentuemerrolle wird ihr Stand gar nicht erst abgerufen',
    !siAdm.sent.some(x => x.url === '/api/backup'),
    siAdm.sent.map(x => x.url).join(' · '));
  check('Mit Eigentuemerrolle sehr wohl',
    siEig.sent.some(x => x.url === '/api/backup'),
    siEig.sent.map(x => x.url).join(' · '));

  /* ROT ODER GRUEN: DIE LAGE DES SICHERUNGSORTS. Ein Ort im
     Arbeitsverzeichnis wird nicht abgewiesen -- er wird benannt. */
  const siState = (d) => d.w.document.getElementById('backup-place');
  check('Die Karte sagt, wie der Sicherungsort liegt', !!siState(siEig),
    siCard(siEig)?.innerHTML?.slice(0, 300));
  check('Ausserhalb des Arbeitsverzeichnisses ist der Kasten gruen',
    siState(siEig)?.classList.contains('ok-box') === true &&
    siState(siEig)?.classList.contains('warn-box') === false,
    siState(siEig)?.className);
  check('Und er sagt, was daran gut ist',
    /außerhalb des Projektordners/.test(siState(siEig)?.textContent || '') &&
    /bei Updates unberührt/.test(siState(siEig)?.textContent || ''),
    siState(siEig)?.textContent);

  {
    const siInn = await siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: { configured: true, root: '/app/sicherung', place: '',
        filePath: '/app/sicherung', inWorkDir: true, dbBytes: 1048576,
        durationSeconds: 1, reachable: true, number: 0, last: null } });
    const box = siState(siInn);
    check('Im Arbeitsverzeichnis ist der Kasten rot', !!box &&
      box.classList.contains('warn-box') === true &&
      box.classList.contains('ok-box') === false, box?.className);
    check('Und er sagt, dass es anders empfohlen ist — 0.22.0',
      /Empfohlen ist ein Ordner außerhalb/.test(box?.textContent || ''), box?.textContent);
    check('Er nennt den Grund und nicht nur das Urteil',
      /anderen Platte/.test(box?.textContent || '') &&
      /zerstört ein Fehler am Projektordner Original und\s+Backup zugleich/
        .test(box?.textContent || ''), box?.textContent);
    check('Und er sagt, WO es umgestellt wird',
      /docker-compose\.yml/.test(box?.textContent || ''), box?.textContent);
    /* DIE KARTE BLEIBT BENUTZBAR. Der Kasten ist eine Auskunft, keine
       Absage -- Zielort und Knopf stehen weiter da. */
    check('Der Knopf steht trotzdem da', !!siInn.w.document.getElementById('backup-run'));
    check('Und das Feld fuer den Zielort auch',
      !!siInn.w.document.getElementById('backup-dir'));
  }


  /* ZWEI SCHLUESSEL IM UMLAUF IN DER OBERFLAECHE -- seit 0.8.91. DREI LAGEN,
     DREI AUFBAUTEN, und jede bekommt ihre Gegenlage: ohne Wechsel steht gar
     kein Kasten da (eine Warnung, die immer dasteht, liest niemand mehr),
     nach einem Wechsel mit brauchbarer Kopie ein gruener, und wenn auch die
     juengste Kopie aelter ist als der Wechsel, ein roter mit dem schaerferen
     Satz. */
  {
    const siStatusIncluding = (extraEnv) => ({
      configured: true, root: '/sicherung', place: 'taeglich', filePath: '/sicherung/taeglich',
      inWorkDir: false, dbBytes: 52428800, durationSeconds: 1,
      reachable: true, number: 3,
      last: { file: 'kriterion-2026-08-20-03-00-00.sqlite', bytes: 52428800,
                at: '2026-08-20 03:00:00', daysAgo: 3, outdated: false },
      changedAt: null, outdated: 0, ...extraEnv
    });
    /* GESUCHT WIRD IM GEFALTETEN TEXT. */
    const fold = (t) => String(t || '').replace(/\s+/g, ' ').trim();
    const siText = (d) => fold(siCard(d)?.textContent);
    const siBoxes = (d, cls) =>
      [...(siCard(d)?.querySelectorAll('.' + cls) || [])].map(k => fold(k.textContent));

    // Ohne Wechsel: kein Kasten, kein Wort davon.
    const withoutPhotos = await siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: siStatusIncluding({}) });
    check('Ohne Wechsel steht nichts von zwei Schluesseln auf der Karte',
      !/Schlüsselwechsel|alten Schlüssel|gewechselt/.test(siText(withoutPhotos)),
      siText(withoutPhotos).slice(0, 300));

    // Ein Teil veraltet: roter Kasten mit der Zahl und dem Verbleib des alten
// Werts.
    const partly = await siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: siStatusIncluding({ changedAt: '2026-08-21 08:00:00', outdated: 2 }) });
    const partlyRed = siBoxes(partly, 'warn-box').join(' ');
    check('Nach einem Wechsel nennt ein roter Kasten die Zahl der alten Kopien',
      /2 Backups stammen von vor dem Schlüsselwechsel/.test(partlyRed), partlyRed.slice(0, 300));
    check('Und er nennt den Zeitpunkt des Wechsels',
      /21\.08\.2026/.test(partlyRed), partlyRed.slice(0, 300));
    /* SEIT 0.22.0 (Anlage F) SAGT DER KASTEN NUR NOCH, WOMIT SICH DIE ALTEN
       OEFFNEN und wohin der alte Schluessel gehoert: in einen
       Passwort-Manager. */
    check('Und wo der alte Wert zu finden ist',
      /nur mit dem alten Schlüssel/.test(partlyRed) && /Passwort-Manager/.test(partlyRed),
      partlyRed.slice(0, 400));
    /* DIE ZEILE „DATEIEN AM ORT" IST MIT 0.20.1 AUS DIESER KARTE HERAUS --
       und die Pruefung darauf wird UMGEDREHT statt geloescht. */
    check('Die Zeile "Dateien am Ort" steht nicht mehr in dieser Karte',
      !/Dateien am Ort/.test(siText(partly)), siText(partly).slice(0, 400));

    // Genau eine alte Kopie -- die Einzahl gehoert geprueft, sonst steht dort
// "1 Kopien stammen".
    const one = await siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: siStatusIncluding({ changedAt: '2026-08-21 08:00:00', outdated: 1 }) });
    check('Bei genau einer alten Kopie steht die Einzahl da',
      /1 Backup stammt von vor dem Schlüsselwechsel/.test(siBoxes(one, 'warn-box').join(' ')),
      siBoxes(one, 'warn-box').join(' ').slice(0, 300));

    // Alles veraltet -- die schaerfste Lage: es gibt ueberhaupt keine
    // brauchbare Kopie, und das ist eine ANDERE Aussage als "ein paar alte
    // liegen daneben".
    const everything = await siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: siStatusIncluding({
        changedAt: '2026-08-22 08:00:00', outdated: 3,
        last: { file: 'kriterion-2026-08-20-03-00-00.sqlite', bytes: 52428800,
                  at: '2026-08-20 03:00:00', daysAgo: 3, outdated: true } }) });
    const everythingRed = siBoxes(everything, 'warn-box').join(' ');
    check('Ist auch die juengste Kopie aelter, sagt die Karte GENAU DAS',
      /Kein Backup passt zum aktuellen Schlüssel/.test(everythingRed), everythingRed.slice(0, 300));
    check('Und sie sagt, was jetzt zu tun ist',
      /Bitte jetzt ein neues Backup anlegen\./.test(everythingRed), everythingRed.slice(0, 400));
    check('Und sie sagt, wohin der alte Schluessel gehoert — 0.22.0',
      /Passwort-Manager/.test(everythingRed), everythingRed.slice(0, 400));

    // Und die Gegenlage: alle Kopien juenger als der Wechsel -> gruen, mit
// dem Grund daneben statt eines blossen "alles gut".
    const green = await siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: siStatusIncluding({ changedAt: '2026-08-19 08:00:00', outdated: 0 }) });
    const greenBox = siBoxes(green, 'ok-box').join(' ');
    check('Sind alle Kopien juenger als der Wechsel, ist der Kasten gruen',
      /Alle Backups hier sind jünger/.test(greenBox), greenBox.slice(0, 400));
    check('Und im gruenen Fall steht keine Warnung ueber alte Kopien da',
      !/alten Schlüssel/.test(siText(green)), siText(green).slice(0, 300));
  }

  /* DIE ROLLENTEILUNG STEHT AN BEIDEN KARTEN, nicht nur in den Dokumenten. */
  // SEIT 0.16.0 HEISST SIE „Export und Import": es ist dieselbe Datei, die
// hinausgeht und wieder hereinkommt.
  const siExportCard = [...siEig.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Export und Import');
  check('Die Exportkarte ist ueberhaupt da', !!siExportCard);
  // SEIT 0.22.0 OHNE „Austauschweg" (Verbotsliste): die Karte sagt, wofuer der Export ist.
  check('Sie sagt, wofuer der Export ist — 0.22.0',
    /für Umzug, Archiv und Weitergabe/.test(siExportCard?.textContent || ''), siExportCard?.textContent?.slice(0, 200));
  check('Und verweist auf das Backup',
    /Backup/.test(siExportCard?.textContent || ''), siExportCard?.textContent?.slice(0, 300));
  check('Die Karte „Backup" sagt, was das Backup ist — 0.22.0',
    /vollständige, verschlüsselte\s+Sicherung der Datenbank/.test(siCard(siEig)?.textContent || ''),
    siCard(siEig)?.textContent?.slice(0, 200));
  check('Und sagt, dass sie nur in dieselbe Programmversion zurueckgeht — 0.22.0',
    /nur in dieselbe Programmversion zurückspielen/.test(siCard(siEig)?.textContent || ''),
    siCard(siEig)?.textContent?.slice(0, 400));

  /* DER HINWEIS AUF DEN SCHLUESSEL GEHOERT AN DEN KNOPF, nicht in die
     Dokumentation: die Kopie ist ohne .env wertlos, und genau dort tappt
     jemand in die Falle. */
  const siWarn = siCard(siEig)?.querySelector('.warn-box');
  check('Der Hinweis auf den Schluessel steht in der Karte', !!siWarn,
    siCard(siEig)?.innerHTML?.slice(0, 200));
  check('Und er nennt die .env',
    /\.env/.test(siWarn?.textContent || ''), siWarn?.textContent);

  check('Die Karte nennt den eingerichteten Ort',
    /\/backup/.test(siCard(siEig)?.textContent || ''),
    siCard(siEig)?.textContent?.slice(0, 400));
  check('Das Feld traegt das eingestellte Unterverzeichnis',
    siEig.w.document.getElementById('backup-dir')?.value === 'taeglich',
    siEig.w.document.getElementById('backup-dir')?.value);
  check('Das letzte Backup steht mit seinen Tagen da',
    /vor 3 Tagen/.test(siCard(siEig)?.textContent || ''),
    siCard(siEig)?.textContent?.slice(0, 600));
  check('Samt Dateiname und Groesse',
    /kriterion-2026-08-20-03-00-00\.sqlite/.test(siCard(siEig)?.textContent || '') &&
    /50,0 MB/.test(siCard(siEig)?.textContent || ''),
    siCard(siEig)?.textContent?.slice(0, 600));
  /* DIE DAUER STEHT VORHER DA. VACUUM INTO laeuft synchron, die Instanz steht
     so lange still -- eine Ansage ist besser als ein stiller Stillstand. */
  check('Die Karte sagt vorher, dass Kriterion kurz nicht erreichbar ist — 0.22.0',
    /ist Kriterion kurz nicht\s+erreichbar/.test(siCard(siEig)?.textContent || ''),
    siCard(siEig)?.textContent?.slice(0, 700));
  check('Und nennt die erwartete Dauer aus der Antwort',
    /etwa\s+1 Sekunden/.test(siCard(siEig)?.textContent || ''),
    siCard(siEig)?.textContent?.slice(0, 700));

  /* DER NICHT EINGERICHTETE FALL. */
  {
    const d = await siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: { configured: false, reason: 'Es ist kein Backup-Ordner eingerichtet. ' +
        'Die docker-compose.yml hängt ihn ein.', place: '', dbBytes: 1, durationSeconds: 1,
        reachable: false, last: null } });
    check('Ohne eingerichteten Ort steht die Karte trotzdem da', !!siCard(d));
    check('Und sagt, warum sie nicht kann',
      /kein Backup-Ordner eingerichtet/.test(siCard(d)?.textContent || ''),
      siCard(d)?.textContent?.slice(0, 300));
    check('Der Knopf steht dann gar nicht erst da',
      !d.w.document.getElementById('backup-run'), 'der Knopf steht da');
    check('Und das Feld fuer den Ort ebenso wenig',
      !d.w.document.getElementById('backup-dir'), 'das Feld steht da');
  }

  /* DER UNERREICHBARE ZIELORT. Die Karte sagt es, statt eine Zahl zu
     behaupten -- das ist der Preis der Entscheidung fuer das Dateisystem. */
  {
    const d = await siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: { configured: true, root: '/sicherung', place: 'weg',
        error: 'Den Unterordner „weg“ gibt es im Backup-Ordner nicht.',
        dbBytes: 1024, durationSeconds: 1, reachable: false, last: null } });
    check('Ein Zielort mit Fehler bekommt keine Zahl, sondern die Begruendung',
      /gibt es im Backup-Ordner nicht/.test(siCard(d)?.textContent || ''),
      siCard(d)?.textContent?.slice(0, 400));
    check('Und nirgends steht "vor 0 Tagen"',
      !/vor \d+ Tag/.test(siCard(d)?.textContent || ''),
      siCard(d)?.textContent?.slice(0, 400));
  }
  {
    const d = await siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: { configured: true, root: '/sicherung', place: '',
        filePath: '/sicherung', dbBytes: 1024, durationSeconds: 1, reachable: true,
        last: null, number: 0 } });
    check('Ein leerer Ort sagt, dass dort noch kein Backup liegt',
      /noch kein Backup/.test(siCard(d)?.textContent || ''),
      siCard(d)?.textContent?.slice(0, 400));
  }

  /* DER KNOPF, mit einem WIRKLICH zugestellten Ereignis. */
  {
    const d = await siSystem({ isAdmin: true, isOwner: true });
    const siRun = d.w.document.getElementById('backup-run');
    siRun?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !siRun || (d.sent.some(g => g.method === 'POST' && g.url === '/api/backup') &&
      openRequests(x) === 0), 2000, 'die neu gezeichnete Karte „Sicherung“');
    check('Der Knopf schickt die Sicherung an den Server',
      d.sent.some(x => x.method === 'POST' && x.url === '/api/backup'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Eine Meldung nennt die geschriebene Datei',
      /kriterion-2026-08-23-19-00-00\.sqlite/.test(d.w.document.querySelector('.toast')?.textContent || ''),
      d.w.document.querySelector('.toast')?.textContent);
    check('Und die Karte zeichnet sich mit dem neuen Stand neu',
      /vor 0 Tagen/.test(siCard(d)?.textContent || ''),
      siCard(d)?.textContent?.slice(0, 600));
    check('Die Zahl der Dateien am Ort waechst mit',
      /kriterion-2026-08-23-19-00-00/.test(siCard(d)?.textContent || ''),
      siCard(d)?.textContent?.slice(0, 600));
  }

  /* DER ZIELORT laesst sich umstellen -- und eine Absage des Servers wird
     gesagt, statt still zu bleiben. */
  {
    const d = await siSystem({ isAdmin: true, isOwner: true });
    if (d.w.document.getElementById('backup-dir')) setField(d.w.document, 'backup-dir', 'woechentlich');
    const siDirs = () => d.sent.filter(g => g.method === 'PUT' && g.url === '/api/backup/dir').length;
    const siSave = d.w.document.getElementById('backup-dir-save');
    siSave?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !siSave || (siDirs() === 1 && openRequests(x) === 0),
      2000, 'die Antwort auf den Zielort');
    check('Der Zielort geht mit dem eingetippten Wert hinaus',
      d.sent.some(x => x.method === 'PUT' && x.url === '/api/backup/dir' &&
        x.body?.place === 'woechentlich'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url} ${JSON.stringify(x.body)}`).join(' · '));
    check('Und die Karte traegt ihn danach',
      d.w.document.getElementById('backup-dir')?.value === 'woechentlich',
      d.w.document.getElementById('backup-dir')?.value);

    if (d.w.document.getElementById('backup-dir')) setField(d.w.document, 'backup-dir', '../raus');
    const siSave2 = d.w.document.getElementById('backup-dir-save');
    siSave2?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !siSave2 || (siDirs() === 2 && openRequests(x) === 0),
      2000, 'die Absage zum Zielort');
    check('Eine Absage des Servers wird gesagt',
      /Unterordner liegt im eingerichteten Backup-Ordner/.test(d.w.document.querySelector('.toast')?.textContent || ''),
      d.w.document.querySelector('.toast')?.textContent);
    check('Und der Ort bleibt der alte',
      d.w.document.getElementById('backup-dir')?.value === '../raus',
      d.w.document.getElementById('backup-dir')?.value);
  }


  /* ---------------------------------------------------------------- */
  group('Die Karte „Alte Backups" in der Oberflaeche');

  /* SIE STEHT IM ABSCHNITT „DATENBANK", HINTER „SICHERUNG" -- die Reihenfolge
     ist geprueft und nicht zufaellig. */
  const afCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Alte Backups');
  const afText = (d) => String(afCard(d)?.textContent || '').replace(/\s+/g, ' ').trim();
  const afRows = (d) => [...(d.w.document.querySelectorAll('#cleanup-list .mrow') || [])]
    .map(z => z.textContent.replace(/\s+/g, ' ').trim());
  const afButtons = (d) => d.w.document.querySelectorAll('#cleanup-list button').length;
  /* DAS STILBLATT ALS TEXT. */
  const afStyle = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  /* DIE KOPIEN DER PRUEFLAGE: fuenf am Ort, juengste zuerst. Mit Mindestzahl
     3 und Alter 30 treffen es die beiden aeltesten. */
  const AF_COPIES = [
    { file: 'kriterion-2026-09-03-10-00-00.sqlite', at: '2026-09-03 10:00:00', daysAgo: 0, bytes: 52428800 },
    { file: 'kriterion-2026-09-02-10-00-00.sqlite', at: '2026-09-02 10:00:00', daysAgo: 1, bytes: 52428800 },
    { file: 'kriterion-2026-07-30-10-00-00.sqlite', at: '2026-07-30 10:00:00', daysAgo: 35, bytes: 52428800 },
    { file: 'kriterion-2026-07-25-10-00-00.sqlite', at: '2026-07-25 10:00:00', daysAgo: 40, bytes: 52428800 },
    { file: 'kriterion-2026-07-05-10-00-00.sqlite', at: '2026-07-05 10:00:00', daysAgo: 60, bytes: 52428800 }
  ];
  /* DIE LISTE WIE DER SERVER SIE LIEFERT: Nummer von der juengsten an, und je
     Zeile die beiden Marken. */
  const afFiles = (keep = 3, days = 30, oldNames = []) => {
    const old = new Set(oldNames);
    const matched = new Set(AF_COPIES.slice(keep)
      .filter(z => z.daysAgo > days && !old.has(z.file)).map(z => z.file));
    return AF_COPIES.map((z, i) => ({ ...z, nr: i + 1,
      affected: matched.has(z.file), outdated: old.has(z.file) }));
  };
  const afStatus = (extraEnv = {}, cleanupExtra = {}) => ({
    configured: true, root: '/sicherung', place: 'taeglich', filePath: '/sicherung/taeglich',
    inWorkDir: false, dbBytes: 52428800, durationSeconds: 1, reachable: true, number: 5,
    last: { file: AF_COPIES[0].file, bytes: 52428800, at: AF_COPIES[0].at,
              daysAgo: 0, outdated: false },
    changedAt: null, outdated: 0,
    cleanup: {
      an: false, keep: 3, days: 30,
      limits: { keep: { fallback: 3, min: 1, max: 20 },
                 days: { fallback: 30, min: 7, max: 365 } },
      reachable: true, files: afFiles(), matched: AF_COPIES.slice(3),
      bytes: AF_COPIES.slice(3).reduce((n, k) => n + k.bytes, 0),
      reason: '', oldCount: 0, oldBytes: 0, oldFiles: [], ...cleanupExtra
    },
    ...extraEnv
  });
  const afSystem = (extraEnv = {}, cleanupExtra = {}) =>
    siSystem({ isAdmin: true, isOwner: true },
      { backupStatus: afStatus(extraEnv, cleanupExtra), backupCopies: AF_COPIES });

  const afEig = await afSystem();
  check('Die Karte steht da', !!afCard(afEig), afEig.w.document.body.innerHTML.slice(0, 200));

  /* --- DIE LISTE ALLER SICHERUNGEN. */
  check('Die Karte listet ALLE Backups',
    afRows(afEig).length === AF_COPIES.length,
    `${afRows(afEig).length} Zeilen, ${AF_COPIES.length} erwartet`);
  check('Und nennt ihre Zahl in der Ueberschrift',
    /Backups \(5\)/.test(afText(afEig)), afText(afEig).slice(0, 300));
  /* DIE NUMMER LAEUFT VON DER JUENGSTEN (1) ZUR AELTESTEN -- so, wie die
     Mindestzahl zaehlt. */
  check('Die Nummern laufen von der juengsten zur aeltesten',
    equal(afRows(afEig).map(z => (z.match(/^#(\d+)/) || [])[1]),
           ['1', '2', '3', '4', '5']),
    afRows(afEig).map(z => (z.match(/^#(\d+)/) || [])[1]).join(' '));
  /* DIE GROESSE STEHT SEIT 0.29.0 VOR DEM ALTER, und der Grund ist gemessen:
     mit dem Verweis „prüfen" daneben fehlen der Zeile am Telefon 24 Pixel,
     und etwas muss weichen. */
  check('Je Zeile Datum, Groesse und Alter',
    /^#1 · 03\.09\.2026, \d{2}:\d{2}.*50,0 MB · vor 0 Tagen/.test(afRows(afEig)[0]),
    afRows(afEig)[0]);
  /* KEIN DATEINAME IN DER ZEILE, und dabei geht nichts verloren: der Name IST
     die Zeitmarke, und die Zeile nennt Datum und Uhrzeit. */
  check('Und kein Dateiname',
    !/kriterion-/.test(afRows(afEig).join(' ')), afRows(afEig).join(' · ').slice(0, 200));
  /* GENAU EIN KNOPF JE ZEILE, UND ER LIEST -- 0.29.0, Befund 1. */
  check('Je Zeile genau ein Knopf, und er prueft nur',
    afButtons(afEig) === afRows(afEig).length &&
    afRows(afEig).every(z => /prüfen/.test(z)),
    `${afButtons(afEig)} Knoepfe auf ${afRows(afEig).length} Zeilen`);
  /* DIE MARKE SAGT, WELCHE ZEILE FAELLT -- an der Zeile und nicht in einer
     zweiten Liste darunter. */
  check('Die Zeilen, die die Regel trifft, sind markiert',
    equal(afRows(afEig).filter(z => /LÖSCHEN|löschen/i.test(z)).map(z => (z.match(/^#(\d+)/) || [])[1]),
           ['4', '5']),
    afRows(afEig).filter(z => /löschen/i.test(z)).join(' · '));
  check('Und die drei jüngsten sind es nicht',
    afRows(afEig).slice(0, 3).every(z => !/löschen/i.test(z)),
    afRows(afEig).slice(0, 3).join(' · '));
  /* DER DECKEL LIEGT BEI FUENF ZEILEN und nicht bei den zehn der uebrigen
     Systemlisten: die Liste steht MITTEN in ihrer Karte, unter ihr stehen die
     Zusammenfassung und beide Knoepfe. */
  check('Die Liste traegt ihren eigenen Deckel von fuenf Zeilen',
    !!afEig.w.document.getElementById('cleanup-list') &&
    /#cleanup-list \{ flex: none; max-height: 13\.98rem; \}/.test(afStyle),
    (afStyle.match(/#cleanup-list[^\n]*/) || ['(keine Regel)'])[0]);
  check('Und die Rechnung dahinter steht im Stilblatt',
    /5 x 41,92 \/ 15 = 13,973/.test(afStyle), 'die Rechnung fehlt');

  /* --- DER SCHALTER UND DIE BEIDEN FELDER, mit den kurzen Texten. --- */
  check('Der Schalter steht auf aus',
    afEig.w.document.getElementById('cleanup-toggle')?.checked === false,
    JSON.stringify(afEig.w.document.getElementById('cleanup-toggle')?.checked));
  check('Und sagt in einem halben Satz, was ohne Haken gilt',
    /Ohne Häkchen nur auf Knopfdruck\./.test(afText(afEig)), afText(afEig).slice(0, 400));
  /* ZWEI TATSACHEN IM KOPFTEXT, UND SONST NICHTS: dass es weg ist, und was
     ueberhaupt in Frage kommt. */
  check('Der Kopftext sagt, dass es endgueltig ist — 0.22.0',
    /— endgültig\./.test(afText(afEig)), afText(afEig).slice(0, 300));
  check('Und dass nur das Namensschema der Installation gelöscht wird',
    /nur Backups, die Kriterion selbst angelegt hat/.test(afText(afEig)),
    afText(afEig).slice(0, 300));
  /* UND DIE SAETZE, DIE MIT DEM FELDBEFUND GEFALLEN SIND, STEHEN NICHT MEHR
     DA. */
  check('Die Begruendung des Schalters steht nicht mehr auf der Karte',
    !/das ist Absicht/.test(afText(afEig)) && !/holt nichts zurück/.test(afText(afEig)),
    afText(afEig).slice(0, 400));
  check('Und von einer fremden Datei ist keine Rede mehr',
    !/fremde Datei/.test(afText(afEig)), afText(afEig).slice(0, 300));
  /* „BODEN" UND „SCHERE" SIND BILDER DES PROJEKTS UND KEIN BILDSCHIRMTEXT. */
  check('Weder „Boden" noch „Schere" stehen am Bildschirm',
    !/\bBoden\b/.test(afText(afEig)) && !/\bSchere\b/.test(afText(afEig)),
    afText(afEig).slice(0, 500));
  const afB = () => afEig.w.document.getElementById('cleanup-keep');
  const afT = () => afEig.w.document.getElementById('cleanup-days');
  check('Die beiden Felder tragen die Vorgaben 3 und 30',
    afB()?.value === '3' && afT()?.value === '30',
    JSON.stringify([afB()?.value, afT()?.value]));
  check('Und die Grenzen des Servers stehen an ihnen',
    afB()?.getAttribute('min') === '1' && afB()?.getAttribute('max') === '20' &&
    afT()?.getAttribute('min') === '7' && afT()?.getAttribute('max') === '365',
    JSON.stringify([afB()?.getAttribute('min'), afB()?.getAttribute('max'),
                    afT()?.getAttribute('min'), afT()?.getAttribute('max')]));
  /* DIE BESCHRIFTUNGEN SAGEN, WAS DAS FELD TUT, und nicht, wie das Bild dazu
     heisst. Und die VORGABE steht nicht daneben: sie steht im Feld. */
  check('Die Beschriftungen heissen „Mindestens behalten" und „Löschen ab Alter (Tage)"',
    /Mindestens behalten/.test(afText(afEig)) && /Löschen ab Alter \(Tage\)/.test(afText(afEig)),
    afText(afEig).slice(0, 500));
  check('Und keine nennt ihre Vorgabe ein zweites Mal',
    !/Vorgabe/.test(afText(afEig)), afText(afEig).slice(0, 600));
  /* DAS ALTERSFELD ERKLAERT SICH MIT DER LEBENDEN MINDESTZAHL. */
  check('Das Altersfeld nennt die lebende Mindestzahl',
    /nur, wenn mehr als 3 vorhanden sind/.test(afText(afEig)), afText(afEig).slice(0, 700));

  /* --- WAS DIE REGEL TRIFFT: eine Zeile unter der Liste. --- */
  check('Unter der Liste steht, wie viele fallen und was frei wird',
    /2 Backups werden gelöscht — 100,0 MB frei\./.test(afText(afEig)),
    afText(afEig).slice(0, 900));
  check('Der Knopf steht da und ist bedienbar',
    afEig.w.document.getElementById('cleanup-run')?.disabled === false,
    JSON.stringify(afEig.w.document.getElementById('cleanup-run')?.disabled));
  /* OHNE VERALTETE KOPIEN GIBT ES DEN ZWEITEN KNOPF NICHT. Ein Knopf, der
     zuverlaessig nichts tut, sieht aus wie ein Fehler. */
  check('Und der zweite Knopf steht nicht da, wenn es nichts Veraltetes gibt',
    !afEig.w.document.getElementById('cleanup-old'), 'der Knopf steht da');

  /* TRIFFT DIE REGEL NICHTS, STEHT DER GRUND DA -- eine leere Aussage ohne
     Erklaerung sieht aus wie ein Fehler. Und der Knopf ist dann tot. */
  {
    const d = await afSystem({}, { matched: [], bytes: 0, files: afFiles(20, 30),
      reason: 'Alle 5 Backups sind unter den jüngsten 20.' });
    check('Trifft die Regel nichts, sagt die Karte das mit dem Grund',
      /Es wird nichts gelöscht\. Alle 5 Backups sind unter den jüngsten 20\./.test(afText(d)),
      afText(d).slice(0, 600));
    check('Und der Knopf ist dann nicht bedienbar',
      d.w.document.getElementById('cleanup-run')?.disabled === true,
      JSON.stringify(d.w.document.getElementById('cleanup-run')?.disabled));
    /* UND DIE LISTE STEHT TROTZDEM DA, ohne eine einzige Marke. Sie ist die
       Auskunft ueber den Ort und nicht die Ankuendigung eines Laufs. */
    check('Die Liste steht auch dann da, ohne Marke',
      afRows(d).length === 5 && afRows(d).every(z => !/löschen/i.test(z)),
      afRows(d).join(' · '));
  }
  /* LIEGT NICHTS DA, SAGT DIE KARTE GENAU DAS -- statt einer leeren Liste. */
  {
    const d = await afSystem({ number: 0, last: null },
      { files: [], matched: [], bytes: 0, reason: 'Hier gibt es noch kein Backup.' });
    check('Ohne ein einziges Backup sagt die Karte das',
      /Im Backup-Ordner gibt es noch kein Backup\./.test(afText(d)), afText(d).slice(0, 400));
    check('Und es steht keine leere Liste da',
      !d.w.document.getElementById('cleanup-list'), 'die Liste steht da');
  }
  /* DIE KOPIEN VON VOR DEM SCHLUESSELWECHSEL: in derselben Liste markiert, mit
     eigener Zahl, eigener Summe und eigenem Knopf darunter. */
  {
    const oldNames = AF_COPIES.slice(3).map(z => z.file);
    const d = await afSystem({ changedAt: '2026-08-01 08:00:00', outdated: 2 },
      { oldCount: 2, oldBytes: 104857600, oldFiles: AF_COPIES.slice(3),
        matched: [], bytes: 0, files: afFiles(3, 30, oldNames),
        reason: 'Keines der 5 Backups stammt von nach dem Schlüsselwechsel.' });
    check('Die veralteten Kopien bekommen ihre eigene Marke in der Liste',
      equal(afRows(d).filter(z => /ALTER SCHLÜSSEL|alter Schlüssel/i.test(z))
               .map(z => (z.match(/^#(\d+)/) || [])[1]), ['4', '5']),
      afRows(d).join(' · '));
    check('Und keine Zeile traegt beide Marken',
      afRows(d).every(z => !(/löschen/i.test(z) && /alter Schlüssel/i.test(z))),
      afRows(d).join(' · '));
    check('Darunter stehen ihre Zahl und ihre Summe',
      /2 Backups öffnen sich nur mit dem alten Schlüssel \(100,0 MB\)/.test(afText(d)),
      afText(d).slice(0, 900));
    check('Und die Karte sagt, dass das Aufraeumen sie nicht anfasst — 0.22.0',
      /Das automatische Aufräumen löscht sie nicht\./.test(afText(d)), afText(d).slice(0, 900));
    check('Und sie bekommen einen eigenen Knopf',
      /2 Backups mit altem Schlüssel löschen/.test(
        d.w.document.getElementById('cleanup-old')?.textContent || ''),
      d.w.document.getElementById('cleanup-old')?.textContent);
    // Die Einzahl gehoert geprueft, sonst steht dort "1 Sicherungen oeffnen".
    const one = await afSystem({ changedAt: '2026-08-01 08:00:00', outdated: 1 },
      { oldCount: 1, oldBytes: 52428800, oldFiles: AF_COPIES.slice(4),
        files: afFiles(3, 30, [AF_COPIES[4].file]) });
    check('Bei genau einer steht die Einzahl da',
      /1 Backup öffnet sich nur mit dem alten Schlüssel/.test(afText(one)) &&
      /1 Backup mit altem Schlüssel löschen/.test(
        one.w.document.getElementById('cleanup-old')?.textContent || ''),
      afText(one).slice(0, 700));
  }
  /* OHNE EINGERICHTETEN ORT SAGT DIE KARTE GENAU DAS UND SONST NICHTS: ein
     Schalter, der nie greifen kann, verspricht etwas und haelt es nie. */
  {
    const d = await afSystem({ configured: false,
      reason: 'Es ist kein Backup-Ordner eingerichtet.' });
    check('Ohne eingerichteten Ort steht die Karte trotzdem da', !!afCard(d));
    check('Und sagt, warum sie nichts zu tun hat',
      /kein Backup-Ordner eingerichtet/.test(afText(d)), afText(d).slice(0, 300));
    check('Der Schalter steht dann gar nicht erst da',
      !d.w.document.getElementById('cleanup-toggle') && !d.w.document.getElementById('cleanup-run'),
      'der Schalter steht da');
  }

  /* --- DIE LISTE RECHNET BEI JEDER AENDERUNG NEU, UND SIE LOESCHT DABEI
     NICHTS. Wer die Zahl von 3 auf 2 stellt, sieht sofort, was das kostet. --- */
  {
    const d = await afSystem();
    /* JEDER GRIFF AUF EINEN KNOTEN IST ABGEFANGEN. */
    setField(d.w.document, 'cleanup-keep', '2');
    const afKeep = d.w.document.getElementById('cleanup-keep');
    afKeep?.dispatchEvent(new d.w.Event('input', { bubbles: true }));
    await until(d.w, (x) => !afKeep || (d.sent.some(g => String(g.url).startsWith('/api/backup?')) &&
      openRequests(x) === 0), 2000, 'die neu gerechnete Vorschau');
    const asked = d.sent.filter(x => String(x.url).startsWith('/api/backup?'));
    check('Eine Aenderung am Feld fragt den Stand neu am Server',
      asked.length === 1 && /keep=2/.test(asked[0].url) &&
      (asked[0].method || 'GET') === 'GET',
      d.sent.slice(-3).map(x => `${x.method || 'GET'} ${x.url}`).join(' · '));
    /* UND SIE RECHNET DIE REGEL NICHT SELBST NACH: gefragt wird der Server,
       und gezeichnet wird, was zurueckkommt. */
    check('Und danach sind drei Zeilen markiert statt zwei',
      afRows(d).filter(z => /löschen/i.test(z)).length === 3 &&
      afRows(d).length === 5,
      afRows(d).join(' · '));
    check('Und gespeichert wurde dabei nichts',
      !d.sent.some(x => x.method === 'PUT' && x.url === '/api/settings') &&
      !d.sent.some(x => x.url === '/api/backup/cleanup'),
      d.sent.slice(-4).map(x => `${x.method || 'GET'} ${x.url}`).join(' · '));
    /* ERST DAS VERLASSEN DES FELDES SPEICHERT. Ein eigener Speicherknopf waere
       ein dritter Knopf auf einer Karte, die mit zwei auskommt. */
    const afKeep2 = d.w.document.getElementById('cleanup-keep');
    afKeep2?.dispatchEvent(new d.w.Event('change', { bubbles: true }));
    await until(d.w, (x) => !afKeep2 || (d.sent.some(g => g.method === 'PUT' && g.url === '/api/settings') &&
      openRequests(x) === 0), 2000, 'der gespeicherte Wert');
    check('Erst das Verlassen des Feldes speichert den Wert',
      d.sent.some(x => x.method === 'PUT' && x.url === '/api/settings' &&
        x.body?.backupKeep === 2),
      d.sent.slice(-3).map(x => `${x.method} ${x.url} ${JSON.stringify(x.body)}`).join(' · '));
  }
  /* --- DER SCHALTER GEHT UEBER PUT /api/settings und bekommt keine eigene
     Route -- dieselbe Bauform wie der Schalter der Bildablage. --- */
  {
    const d = await afSystem();
    const afS = d.w.document.getElementById('cleanup-toggle');
    if (afS) afS.checked = true;
    afS?.dispatchEvent(new d.w.Event('change', { bubbles: true }));
    await until(d.w, (x) => !afS || (d.sent.some(g => g.method === 'PUT' && g.url === '/api/settings') &&
      openRequests(x) === 0), 2000, 'die gespeicherte Stellung des Schalters');
    check('Der Schalter geht ueber PUT /api/settings hinaus',
      d.sent.some(x => x.method === 'PUT' && x.url === '/api/settings' &&
        x.body?.backupCleanup === true),
      d.sent.slice(-3).map(x => `${x.method} ${x.url} ${JSON.stringify(x.body)}`).join(' · '));
  }
  /* --- DER KNOPF IST OHNE ZWEITE BESTAETIGUNG NICHT BEDIENBAR. Ein Abbruch
     im Dialog schickt gar nichts. --- */
  {
    const d = await afSystem();
    const afRun = d.w.document.getElementById('cleanup-run');
    afRun?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !afRun || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    check('Der Knopf fragt erst nach dem Passwort',
      !!d.w.document.getElementById('confirm-pass'), 'kein Bestaetigungsfenster');
    check('Und der Dialog nennt Zahl und Bytes und sagt, dass es endgueltig ist — 0.22.0',
      /2 Backups \(100,0 MB\) werden endgültig gelöscht\./.test(
        d.w.document.querySelector('.modal')?.textContent || ''),
      d.w.document.querySelector('.modal')?.textContent?.slice(0, 400));
    await confirmImDom(d, 'egal', true);
    check('Ein Abbruch schickt nichts an den Server',
      !d.sent.some(x => x.url === '/api/backup/cleanup'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
  }
  /* --- UND MIT BESTAETIGUNG GEHT ES HINAUS: die Art im Rumpf, kein
     Dateiname. --- */
  {
    const d = await afSystem();
    const afRun = d.w.document.getElementById('cleanup-run');
    afRun?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => !afRun || x.document.getElementById('confirm-pass'),
      2000, 'der Dialog der zweiten Bestaetigung');
    await confirmImDom(d);
    await until(d.w, (x) => !afRun || (d.sent.some(g => g.url === '/api/backup/cleanup') &&
      openRequests(x) === 0), 2000, 'die Antwort auf das Loeschen');
    const outcome = d.sent.filter(x => x.url === '/api/backup/cleanup');
    check('Mit Bestaetigung geht das Loeschen hinaus',
      outcome.length === 1 && outcome[0].method === 'POST' && outcome[0].body?.kind === 'rule',
      d.sent.slice(-3).map(x => `${x.method} ${x.url} ${JSON.stringify(x.body)}`).join(' · '));
    /* DER RUMPF TRAEGT DIE ART UND SONST NICHTS. */
    check('Und der Rumpf traegt genau ein Feld, und das ist die Art',
      equal(Object.keys(outcome[0]?.body || {}), ['kind']),
      JSON.stringify(outcome[0]?.body));
    check('Eine Meldung nennt, wie viele wirklich geloescht wurden',
      /2 Backups gelöscht/.test(d.w.document.querySelector('.toast')?.textContent || ''),
      d.w.document.querySelector('.toast')?.textContent);
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
