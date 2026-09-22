/* Kriterion — Pruefstand: die Oberflaeche: Filter, Glocke und Stilblatt Der
   Filter „abgelehnt", die Begruendung, die Glocke in der Kopfzeile, der
   Papierkorb im Vollbild, der Zugangstext, das Stilblatt und die Sortierung. */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  buildDom, waitSearch, sysSection, css123, regel123, withoutMedia
} = D;

async function run() {
  const {
   fs, path, attachments, TEXT, COMMENT, handbookFlat, __dirname, FILTER,
   group, check, equal, open
  } = H;
  /* DIESES MODUL BAUT FENSTER. Fehlt jsdom, sagt es das und haelt an. */
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch { console.log('  … uebersprungen: jsdom fehlt (npm install)'); return; }

  /* ================= Der Filter „abgelehnt" — 0.15.0 =================== DER
     BEFUND KAM AUS DEM BETRIEB: die Statuszeile trug „Alles anzeigen ·
     Getestet · Ungetestet · ★ Favoriten · Neu seit …" und keinen Filter fuer
     „abgelehnt" -- obwohl es das Merkmal seit jeher gibt. */
  group('Der Filter „abgelehnt" — 0.15.0');

  const fromEntry = (id, title, tested, rejected) => ({
    id, title: title, rejected: rejected, tested: tested, favorite: false,
    category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
    avgRating: null, testCount: 0, testAvg: null, testLast: null, testDays: [],
    updated_at: '2026-08-01 10:00:00'
  });
  // Vier Eintraege, vier Kombinationen -- und die Titel sagen, welche.
  const fromInventory = [
    fromEntry(1, 'Getestet und abgelehnt', true, true),
    fromEntry(2, 'Getestet und nicht abgelehnt', true, false),
    fromEntry(3, 'Ungetestet und abgelehnt', false, true),
    fromEntry(4, 'Ungetestet und nicht abgelehnt', false, false)
  ];
  const fromTitle = (d) =>
    [...d.w.document.querySelectorAll('.card .card-title')].map(e => e.textContent).sort();
  /* `const state` haengt nicht am window und laesst sich von aussen nicht
     setzen. */
  const fromBuild = async (filters) => {
    const d = buildDom(JSDOM, { overviewItems: fromInventory, settings: { filters } });
    await new Promise(r => setTimeout(r, 80));
    return d;
  };

  // ERST DER GEGENSTAND: ohne die vier Zeilen belegt keine
// Menge darunter etwas.
  const fromAll = await fromBuild(null);
  check('Die Prueflage traegt alle vier Kombinationen',
    fromTitle(fromAll).length === 4, JSON.stringify(fromTitle(fromAll)));

  /* ---- DIE GRUPPE STEHT IN DER ZEILE „STATUS" UND IST ABGESETZT. */
  const fromRow = fromAll.w.document.querySelector('#filters .frow');
  const fromGroup = fromAll.w.document.getElementById('f-rejected');
  check('Die Ablehnung steht in derselben Zeile wie der Teststatus',
    !!fromGroup && fromGroup.closest('.frow') === fromRow,
    fromGroup ? 'andere Zeile' : 'die Gruppe fehlt ganz');
  check('Und ist mit einer zweiten Beschriftung abgesetzt',
    [...(fromRow?.querySelectorAll('.eyebrow-with') || [])].some(e => e.textContent === 'Ablehnung'),
    JSON.stringify([...(fromRow?.querySelectorAll('.eyebrow') || [])].map(e => e.textContent)));
  check('Sie traegt drei Pillen und keinen vierten Wert der Reihe davor',
    equal([...(fromGroup?.querySelectorAll('.pill') || [])].map(b => b.textContent),
      ['Alle', 'Abgelehnt', 'Nicht abgelehnt']),
    JSON.stringify([...(fromGroup?.querySelectorAll('.pill') || [])].map(b => b.textContent)));
  /* DIE REIHE DAVOR BLEIBT BEI DREI WERTEN. */
  const fromStatusPills = [...(fromRow?.querySelectorAll('.pills') || [])][0];
  check('Der Teststatus selbst hat weiterhin drei Zustaende',
    [...(fromStatusPills?.querySelectorAll('.pill') || [])]
      .filter(b => !b.classList.contains('pill-sep')).length === 3,
    JSON.stringify([...(fromStatusPills?.querySelectorAll('.pill') || [])].map(b => b.textContent)));

  check('Ohne Filter stehen alle vier da',
    equal(fromTitle(fromAll), ['Getestet und abgelehnt', 'Getestet und nicht abgelehnt',
      'Ungetestet und abgelehnt', 'Ungetestet und nicht abgelehnt']),
    JSON.stringify(fromTitle(fromAll)));

  // --- Jeder der drei Zustaende einzeln ---
  const fromJa = await fromBuild({ rejected: 'ja' });
  check('„Abgelehnt" zeigt genau die abgelehnten',
    equal(fromTitle(fromJa), ['Getestet und abgelehnt', 'Ungetestet und abgelehnt']),
    JSON.stringify(fromTitle(fromJa)));
  const fromNo = await fromBuild({ rejected: 'nein' });
  check('„Nicht abgelehnt" zeigt genau die uebrigen',
    equal(fromTitle(fromNo), ['Getestet und nicht abgelehnt', 'Ungetestet und nicht abgelehnt']),
    JSON.stringify(fromTitle(fromNo)));
  const fromNone = await fromBuild({ rejected: 'all' });
  check('Und „Alle" nimmt nichts weg', fromTitle(fromNone).length === 4,
    JSON.stringify(fromTitle(fromNone)));

  /* ---- DIE KOMBINATION, IN BEIDEN RICHTUNGEN. */
  const fromBoth = await fromBuild({ tested: 'tested', rejected: 'ja' });
  check('„Getestet UND abgelehnt" ist einstellbar und trifft genau einen',
    equal(fromTitle(fromBoth), ['Getestet und abgelehnt']), JSON.stringify(fromTitle(fromBoth)));
  const fromAgainst = await fromBuild({ tested: 'untested', rejected: 'nein' });
  check('„Ungetestet UND nicht abgelehnt" ebenso',
    equal(fromTitle(fromAgainst), ['Ungetestet und nicht abgelehnt']), JSON.stringify(fromTitle(fromAgainst)));
  /* UND DIE GEGENPROBE ZUR PRUEFLAGE SELBST: die beiden Filter liefern
     einzeln VERSCHIEDENE Mengen. */
  const fromOnlyTested = await fromBuild({ tested: 'tested' });
  check('Teststatus und Ablehnung treffen wirklich verschiedene Mengen',
    !equal(fromTitle(fromOnlyTested), fromTitle(fromJa)),
    JSON.stringify([fromTitle(fromOnlyTested), fromTitle(fromJa)]));

  /* ---- EIN KLICK, WIRKLICH ZUGESTELLT. Ein gebauter DOM
     zeigt nicht, was ein Druck tut. ---- */
  const fromGruppe2 = fromAll.w.document.getElementById('f-rejected');
  const fromPill = [...fromGruppe2.querySelectorAll('.pill')].find(b => b.textContent === 'Abgelehnt');
  fromPill.dispatchEvent(new fromAll.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 60));
  check('Ein Druck auf „Abgelehnt" verkleinert die Liste sofort',
    equal(fromTitle(fromAll), ['Getestet und abgelehnt', 'Ungetestet und abgelehnt']),
    JSON.stringify(fromTitle(fromAll)));
  check('Und die Pille steht danach gesetzt da',
    fromAll.w.document.querySelector('#f-rejected .pill.on')?.textContent === 'Abgelehnt',
    JSON.stringify(fromAll.w.document.querySelector('#f-rejected .pill.on')?.textContent));
  /* DIE STELLUNG WIRD GESPEICHERT wie jeder andere Filter -- der Server sieht
     `filters` als undurchschautes Objekt, und der neue Schluessel muss
     einfach mitfahren. */
  const fromSaved = fromAll.sent
    .filter(g => g.method === 'PUT' && g.url === '/api/settings').pop();
  check('Und sie faehrt in der gespeicherten Filterstellung mit',
    fromSaved?.body?.filters?.rejected === 'ja',
    JSON.stringify(fromSaved?.body?.filters));

  /* ---- filterZahl() ZAEHLT IHN MIT. */
  const fromNumber = (d) => d.w.document.querySelector('#filter-toggle .fcount')?.textContent || '';
  check('Ohne Filter steht keine Zahl am Schalter', fromNumber(fromNone) === '', fromNumber(fromNone));
  check('Mit dem Ablehnungsfilter steht dort eine Eins',
    /· 1 aktiv/.test(fromNumber(fromJa)), fromNumber(fromJa));
  /* ZWEI MERKMALE ZAEHLEN ZWEIMAL -- sie verkleinern die Menge auch zweimal. */
  check('Und mit dem Teststatz zusammen eine Zwei',
    /· 2 aktiv/.test(fromNumber(fromBoth)), fromNumber(fromBoth));
  check('„Nicht abgelehnt" zaehlt genauso mit wie „Abgelehnt"',
    /· 1 aktiv/.test(fromNumber(fromNo)), fromNumber(fromNo));

  /* ---- EINE GESPEICHERTE ANSICHT IN DER FORM VON 0.14.0 -- ohne den neuen
     Schluessel. */
  const fromOld = await fromBuild({ categoryIds: [], tagIds: [], tagMode: 'and', tested: 'tested',
                               favorite: false, fresh: false, sort: 'updated_desc' });
  check('Eine Ansicht ohne den neuen Schluessel bleibt lesbar',
    equal(fromTitle(fromOld), ['Getestet und abgelehnt', 'Getestet und nicht abgelehnt']),
    JSON.stringify(fromTitle(fromOld)));
  check('Und sie faellt bei der Ablehnung auf „Alle" zurueck',
    fromOld.w.document.querySelector('#f-rejected .pill.on')?.textContent === 'Alle',
    JSON.stringify(fromOld.w.document.querySelector('#f-rejected .pill.on')?.textContent));
  check('Der Schalter zaehlt dort nur den Teststatus',
    /· 1 aktiv/.test(fromNumber(fromOld)), fromNumber(fromOld));
  /* UND EIN UNBEKANNTER WERT NIMMT NICHTS WEG. */
  const fromCrooked = await fromBuild({ rejected: 'vielleicht' });
  check('Ein unbekannter Wert nimmt nichts weg', fromTitle(fromCrooked).length === 4,
    JSON.stringify(fromTitle(fromCrooked)));

  [fromAll, fromJa, fromNo, fromNone, fromBoth, fromAgainst, fromOnlyTested, fromOld, fromCrooked]
    .forEach(d => d.w.close());

  /* ================= Die Begruendung kommt zur Ruhe — 0.15.0 =========== DER
     ZWEITE BEFUND AUS DEM BETRIEB, und er trifft, was 0.14.0 gebaut hat: die
     Aussage stand da UND das Eingabefeld daneben stand dauerhaft offen --
     dieselbe Sache zweimal. */
  group('Die Begruendung kommt zur Ruhe — 0.15.0');

  /* VIER LAGEN, und sie unterscheiden sich genau in den beiden Schaltern:
     ruhAblehner -- die Fragende hat abgelehnt (rejectedMine). */
  const ruhIch = { id: 1, name: 'chefin', deleted: false };
  const ruhOther = { id: 2, name: 'Anna', deleted: false };
  const ruhBuild = async (author, reason, { admin = true, owner = false } = {}) => {
    const d = buildDom(JSDOM, { hash: '#/item/1', entryMine: owner,
      rejection: { at: '2026-03-14 09:12:00', reason, author },
      settings: { filters: null, userCount: 3, isAdmin: admin } });
    await new Promise(r => setTimeout(r, 80));
    return d;
  };
  const ruhMark = (d) => d.w.document.getElementById('rej-badge');
  const ruhSentence = (d) => d.w.document.querySelector('#rej-badge .rej-text');
  const ruhWhy = (d) => d.w.document.querySelector('#rej-badge .rej-why');
  const ruhPen = (d) => d.w.document.querySelector('#rej-badge .mact.ed');
  const ruhPath = (d) => d.w.document.querySelector('#rej-badge .mact.rm');
  const ruhRow = (d) => d.w.document.getElementById('rej-reason-row');
  const ruhField = (d) => d.w.document.getElementById('rej-reason');

  // --- Der Ablehnende: Aussage im Ruhezustand, Stift und Papierkorb ---
  {
    const d = await ruhBuild(ruhIch, 'Zu ruhig');
    check('Im Ruhezustand steht die Aussage da und das Feld ist zu',
      ruhMark(d)?.hidden === false && ruhRow(d)?.hidden === true,
      JSON.stringify([ruhMark(d)?.hidden, ruhRow(d)?.hidden]));
    check('Der Ablehnende bekommt Stift und Papierkorb',
      !!ruhPen(d) && !!ruhPath(d),
      JSON.stringify([!!ruhPen(d), !!ruhPath(d)]));
    /* DER GRUND IST HERVORGEHOBEN und steht in einer eigenen Spanne -- Datum
       und Name bleiben grau, sie sind eine Verfasserangabe und keine Aussage
       ueber die Sache. */
    check('Der Grund steht in einer eigenen, hervorgehobenen Spanne',
      ruhWhy(d)?.textContent === 'Zu ruhig', JSON.stringify(ruhWhy(d)?.textContent));
    check('Und Datum wie Name stehen weiterhin im Satz',
      /^Abgelehnt am 14\.03\.2026, 09:12 von chefin — /.test(ruhSentence(d)?.textContent || ''),
      JSON.stringify(ruhSentence(d)?.textContent));

    // --- Ein Klick auf den TEXT oeffnet das Feld ---
    ruhWhy(d).dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Ein Klick auf den Text oeffnet das Feld',
      ruhRow(d)?.hidden === false && ruhField(d)?.value === 'Zu ruhig',
      JSON.stringify([ruhRow(d)?.hidden, ruhField(d)?.value]));
    check('Und die Aussage tritt so lange zurueck -- sonst stuende sie zweimal da',
      ruhMark(d)?.hidden === true, JSON.stringify(ruhMark(d)?.hidden));
    check('Der Zeiger steht im Feld',
      d.w.document.activeElement === ruhField(d),
      d.w.document.activeElement?.id || '(nichts)');

    /* --- ESCAPE VERWIRFT und schreibt ausdruecklich NICHT. */
    const ruhVorEsc = d.sent.length;
    ruhField(d).value = 'Doch nicht so';
    ruhField(d).dispatchEvent(new d.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    /* UND JETZT DAS, WAS EIN ECHTER BROWSER VON SELBST TUT: das Schliessen
       nimmt dem Feld den Zeiger, und das loest `blur` aus -- also den
       Speicherweg. */
    ruhField(d).dispatchEvent(new d.w.FocusEvent('blur'));
    await new Promise(r => setTimeout(r, 60));
    check('Escape schliesst das Feld, ohne etwas zu schicken',
      ruhRow(d)?.hidden === true && d.sent.length === ruhVorEsc,
      JSON.stringify(d.sent.slice(ruhVorEsc).map(g => g.body)));
    /* UND DER TEXT IM FELD IST WIRKLICH ZURUECKGESETZT, nicht bloss
       ungesendet. */
    check('Und der verworfene Text steht nicht mehr im Feld',
      ruhField(d).value === 'Zu ruhig', JSON.stringify(ruhField(d).value));
    check('Und die alte Aussage steht wieder da',
      ruhWhy(d)?.textContent === 'Zu ruhig', JSON.stringify(ruhWhy(d)?.textContent));

    // --- Ueber das ✎ ebenso, und Enter speichert und schliesst ---
    ruhPen(d).dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Das Stiftsymbol oeffnet dasselbe Feld',
      ruhRow(d)?.hidden === false, JSON.stringify(ruhRow(d)?.hidden));
    ruhField(d).value = 'Zu laut';
    ruhField(d).dispatchEvent(new d.w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    const ruhSent = d.sent.filter(g => g.method === 'PUT' && g.url === '/api/items/1').pop();
    check('Enter schickt den neuen Grund und schliesst das Feld',
      equal(Object.keys(ruhSent?.body || {}), ['rejectedReason']) &&
      ruhSent?.body?.rejectedReason === 'Zu laut' && ruhRow(d)?.hidden === true,
      JSON.stringify([ruhSent?.body, ruhRow(d)?.hidden]));
    check('Und die Aussage sagt danach den neuen Satz',
      ruhWhy(d)?.textContent === 'Zu laut' && ruhMark(d)?.hidden === false,
      JSON.stringify(ruhWhy(d)?.textContent));
    d.w.close();
  }

  /* --- DER PAPIERKORB. Er schickt einen LEEREN Grund -- der Server macht
     daraus ein Entfernen. */
  {
    const d = await ruhBuild(ruhIch, 'Zu ruhig');
    ruhPath(d).dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    /* GEFRAGT WIRD VORHER: die Angabe ist danach nirgends wiederherzustellen.
       Solange das Fenster offen steht, ist nichts hinausgegangen. */
    const ruhQuestion = d.w.document.querySelector('.backdrop .modal');
    check('Der Papierkorb fragt erst nach',
      !!ruhQuestion && /Begründung löschen\?/.test(ruhQuestion.textContent || ''),
      ruhQuestion ? ruhQuestion.textContent.slice(0, 60) : '(kein Fenster)');
    check('Und schickt vorher nichts',
      !d.sent.some(g => g.method === 'PUT' && g.url === '/api/items/1'),
      JSON.stringify(d.sent.filter(g => g.method === 'PUT').map(g => g.body)));
    /* DER GRIFF INS WINDOW WIRD ABGESICHERT, und das ist keine Vorsicht,
       sondern ein Befund: Rueckbau 264 nimmt die Rueckfrage weg, das Fenster
       steht dann gar nicht da, und ein `ruhQuestion.querySelector(...)`
       REISST DEN GANZEN LAUF AB. */
    ruhQuestion?.querySelector('[data-yes]')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    const ruhPathCore = d.sent.filter(g => g.method === 'PUT' && g.url === '/api/items/1').pop();
    check('Nach dem Ja geht ein leerer Grund hinaus, und sonst nichts',
      equal(Object.keys(ruhPathCore?.body || {}), ['rejectedReason']) &&
      ruhPathCore?.body?.rejectedReason === '', JSON.stringify(ruhPathCore?.body));
    /* SEIT 0.15.1 TRITT DIE AUSSAGE DABEI ZURUECK, weil das Feld von selbst
       aufgeht: abgelehnt und kein Grund heisst offen. */
    check('Der Grund verschwindet aus der Aussage',
      !ruhWhy(d), JSON.stringify(ruhSentence(d)?.textContent));
    /* DATUM UND VERFASSER BLEIBEN STEHEN -- "Abgelehnt am … von …" ist
       weiterhin wahr, nur der Grund fehlt. */
    ruhField(d).dispatchEvent(new d.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    ruhField(d).dispatchEvent(new d.w.FocusEvent('blur'));
    await new Promise(r => setTimeout(r, 60));
    check('Datum und Verfasser stehen weiter da',
      ruhSentence(d)?.textContent === 'Abgelehnt am 14.03.2026, 09:12 von chefin',
      JSON.stringify(ruhSentence(d)?.textContent));
    check('Und das Merkmal bleibt gesetzt',
      d.w.document.getElementById('sw-rej-t')?.textContent === 'Abgelehnt',
      JSON.stringify(d.w.document.getElementById('sw-rej-t')?.textContent));
    /* UND DAS FELD KOMMT VON SELBST ZURUECK -- seit 0.15.1 haengt es am
       ZUSTAND: abgelehnt und kein Grund heisst offen. */
    check('Das Feld kommt nach dem Entfernen von selbst zurueck',
      ruhRow(d)?.hidden === false && ruhField(d)?.value === '',
      JSON.stringify([ruhRow(d)?.hidden, ruhField(d)?.value]));
    d.w.close();
  }

  /* --- DIE ABSAGE BEIM ENTFERNEN. Ohne das Nein bliebe die Frage darueber
     eine Frage, die nichts entscheidet. --- */
  {
    const d = await ruhBuild(ruhIch, 'Zu ruhig');
    ruhPath(d).dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    // Dieselbe Absicherung wie beim Ja daneben: ohne Rueckfrage gibt es kein
// Fenster, und ein Griff ins Leere risse den Lauf ab.
    d.w.document.querySelector('.backdrop [data-no]')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Ein Nein schickt nichts und laesst den Grund stehen',
      !d.sent.some(g => g.method === 'PUT' && g.url === '/api/items/1') &&
      ruhWhy(d)?.textContent === 'Zu ruhig', JSON.stringify(ruhWhy(d)?.textContent));
    d.w.close();
  }

  /* --- DER FREMDE ADMIN: entfernen ja, umschreiben nein. Das ist die
     Hausregel, und sie steht hier auf dem Bildschirm genauso wie im Server. */
  {
    const d = await ruhBuild(ruhOther, 'Zu ruhig');
    check('Ein fremder Admin bekommt den Papierkorb, aber keinen Stift',
      !ruhPen(d) && !!ruhPath(d), JSON.stringify([!!ruhPen(d), !!ruhPath(d)]));
    check('Und der Text ist bei ihm nicht anklickbar',
      !ruhWhy(d)?.classList.contains('clickable'), ruhWhy(d)?.className);
    ruhWhy(d).dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Ein Klick auf den Text oeffnet dort gar nichts',
      ruhRow(d)?.hidden === true, JSON.stringify(ruhRow(d)?.hidden));
    check('Die Aussage selbst steht ihm trotzdem vollstaendig da',
      ruhSentence(d)?.textContent === 'Abgelehnt am 14.03.2026, 09:12 von Anna — Zu ruhig',
      JSON.stringify(ruhSentence(d)?.textContent));
    d.w.close();
  }

  /* --- DER VERFASSER DES EINTRAGS, ohne Adminrolle und ohne die Ablehnung
     getroffen zu haben. */
  {
    const d = await ruhBuild(ruhOther, 'Zu ruhig', { admin: false, owner: true });
    check('Der Verfasser des Eintrags bekommt ebenfalls nur den Papierkorb',
      !ruhPen(d) && !!ruhPath(d), JSON.stringify([!!ruhPen(d), !!ruhPath(d)]));
    d.w.close();
  }

  /* --- DIE FREMDE: weder Admin noch Verfasser, weder des Eintrags noch der
     Begruendung. Sie sieht die Aussage und kein einziges Zeichen. --- */
  {
    const d = await ruhBuild(ruhOther, 'Zu ruhig', { admin: false });
    check('Eine Fremde bekommt weder Stift noch Papierkorb',
      !ruhPen(d) && !ruhPath(d), JSON.stringify([!!ruhPen(d), !!ruhPath(d)]));
    check('Und das Feld bleibt ihr verschlossen',
      ruhRow(d)?.hidden === true, JSON.stringify(ruhRow(d)?.hidden));
    check('Die Aussage liest sie trotzdem',
      ruhMark(d)?.hidden === false && /Zu ruhig/.test(ruhSentence(d)?.textContent || ''),
      JSON.stringify(ruhSentence(d)?.textContent));
    d.w.close();
  }

  /* --- OHNE VERFASSER DER BEGRUENDUNG -- eine Ablehnung aus einer Instanz
     vor 0.14.0. */
  {
    const d = await ruhBuild(null, null);
    /* SEIT 0.15.1 STEHT DORT DAS FELD SELBST OFFEN und nicht bloss ein ✎:
       abgelehnt und kein Grund ist genau der Zustand, in dem etwas fehlt. */
    check('An einer herrenlosen Ablehnung steht das Feld offen fuer den, der aendern darf',
      ruhRow(d)?.hidden === false, JSON.stringify(ruhRow(d)?.hidden));
    check('Und die Aussage tritt so lange zurueck',
      ruhMark(d)?.hidden === true, JSON.stringify(ruhMark(d)?.hidden));
    const foreign = await ruhBuild(null, null, { admin: false });
    check('Wer den Eintrag nicht aendern darf, bekommt weder Feld noch Zeichen',
      ruhRow(foreign)?.hidden === true && !ruhPen(foreign) && !ruhPath(foreign),
      JSON.stringify([ruhRow(foreign)?.hidden, !!ruhPen(foreign), !!ruhPath(foreign)]));
    /* DIE ZEILE BLEIBT IHR TROTZDEM STEHEN: das Datum ist bekannt, und es ist
       der Inhalt der Entscheidung. */
    check('Das Datum liest sie aber weiterhin',
      ruhMark(foreign)?.hidden === false &&
      ruhSentence(foreign)?.textContent === 'Abgelehnt am 14.03.2026, 09:12',
      JSON.stringify([ruhMark(foreign)?.hidden, ruhSentence(foreign)?.textContent]));
    d.w.close(); foreign.w.close();
  }

  /* --- BEIM EINSCHALTEN STEHT DAS FELD SOFORT OFFEN. */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1',
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
    check('Ohne Ablehnung steht das Feld zu Beginn nicht offen',
      ruhRow(d)?.hidden === true, JSON.stringify(ruhRow(d)?.hidden));
    d.w.document.getElementById('sw-rej')
      .dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    check('Beim Einschalten steht es sofort offen',
      ruhRow(d)?.hidden === false, JSON.stringify(ruhRow(d)?.hidden));
    check('Und der Zeiger steht darin',
      d.w.document.activeElement === ruhField(d), d.w.document.activeElement?.id || '(nichts)');
    // Und beim Ausschalten schliesst es sich wieder.
    d.w.document.getElementById('sw-rej')
      .dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    check('Beim Ausschalten schliesst es sich wieder',
      ruhRow(d)?.hidden === true && ruhMark(d)?.hidden === true,
      JSON.stringify([ruhRow(d)?.hidden, ruhMark(d)?.hidden]));
    d.w.close();
  }

  /* --- DIE HERVORHEBUNG IM STILBLATT. */
  {
    // Dasselbe Werkzeug wie in der Gruppe zur Filterleiste -- ein zweiter
// Leser fuer dieselbe Datei liefe mit ihm auseinander.
    check('Die Aussage traegt einen roten Strich in der Farbe des Schalters',
      // Seit 0.23.0 als Tripel geschrieben; die 42 Prozent sind dieselben.
      /border-left: 2px solid rgba\(var\(--red-rgb\), \.42\)/.test(regel123('.rej-note')),
      regel123('.rej-note') || '(keine Regel)');
    check('Und der Grund selbst steht in --red',
      /color: var\(--red\)/.test(regel123('.rej-note .rej-why')),
      regel123('.rej-note .rej-why') || '(keine Regel)');
    /* KEINE NEUE FARBE, und das ist zu belegen und nicht zu behaupten. */
    const ruhPlaces = [regel123('.rej-note'), regel123('.rej-note .rej-why'),
                        regel123('.rej-note .mact.rm:hover')].join(' ');
    const ruhRed = ruhPlaces.match(/#[0-9a-f]{3,8}|rgba?\([^)]*\)/gi) || [];
    const ruhVar = [...new Set(ruhPlaces.match(/var\(--[a-z0-9-]+\)/gi) || [])];
    check('Die Gruppe benutzt Rot in beiden Schreibweisen',
      ruhRed.length >= 1 && ruhVar.length >= 1, JSON.stringify([ruhRed, ruhVar]));
    check('Kein ausgeschriebener Rotwert ist neu',
      ruhRed.every(w => (css123.match(new RegExp(w.replace(/[().*+?^${}|[\]\\]/g, '\\$&'), 'gi')) || []).length > 1),
      JSON.stringify(ruhRed));
    /* UND JEDER BENUTZTE VORGABEWERT IST IM STILBLATT GESETZT. */
    check('Und jeder benutzte Vorgabewert steht im Stilblatt',
      ruhVar.every(v => css123.includes(`${v.slice(4, -1)}:`)), JSON.stringify(ruhVar));
  }

  /* ---- `hidden` MUSS WIRKEN, UND ZWAR UEBERALL — 0.15.1 ---- DER BEFUND AUS
     DEM BETRIEB: an einem NICHT abgelehnten Eintrag standen Aussage und
     Eingabefeld trotzdem da. */
  {
    const hidRule = /\[hidden\]\s*\{[^}]*display:\s*none\s*!important/.test(css123);
    check('Das Stilblatt stellt `hidden` grundsaetzlich wieder her',
      hidRule, (css123.match(/\[hidden\][^}]*\}/) || ['(keine Regel)'])[0]);
    /* MIT `!important`, UND DAS IST DER PUNKT: ohne muesste die Regel jede
       kuenftige display-Regel ueberbieten -- ein Wettlauf, den sie irgendwann
       verliert. */
    check('Und zwar mit !important, nicht auf gut Glueck',
      /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/.test(css123),
      (css123.match(/\[hidden\][^}]*\}/) || ['(keine Regel)'])[0]);
    /* UND SIE STEHT GENAU EINMAL. */
    /* GEZAEHLT WIRD OHNE DIE KOMMENTARE. */
    const cssWithoutComment = css123.replace(/\/\*[\s\S]*?\*\//g, ' ');
    const hidAll = cssWithoutComment.match(/[^{}]*\[hidden\][^{}]*\{/g) || [];
    check('Und sie steht genau einmal, ohne oertliche Flicken daneben',
      hidAll.length === 1, JSON.stringify(hidAll));
    /* DIE GEGENPROBE ZUM MASSSTAB: es gibt ueberhaupt Regeln, die `display`
       setzen und ein Element mit `hidden` treffen koennen -- sonst pruefte
       die Zeile darueber eine Sache ohne Gegenstand. */
    const hidDanger = ['.row-in', '.rej-note', '.lb-btn']
      .filter(w => /display:\s*(flex|grid|block|inline-flex)/.test(regel123(w)));
    check('Und es gibt wirklich display-Regeln, die `hidden` schlagen wuerden',
      hidDanger.length === 3, JSON.stringify(hidDanger));
  }

  /* ================= Export und Import stehen in EINER Karte — 0.16.0 ====
     SIE MEINEN DIESELBE DATEI: die eine geht hinaus, dieselbe kommt herein. */
  group('Export und Import stehen in einer Karte');

  {
    const d = buildDom(JSDOM, {
      settings: { filters: null, isAdmin: true, isOwner: true } });
    await new Promise(r => setTimeout(r, 60));
    await sysSection(d.w, 'database');
    const cards = [...d.w.document.querySelectorAll('.sys-grid > .sys-card')];
    const ex = cards.find(k => k.querySelector('h3')?.textContent.trim() === 'Export und Import');
    check('Die Karte heisst „Export und Import"', !!ex,
      cards.map(k => k.querySelector('h3')?.textContent.trim()).join(' · '));
    /* UND ES GIBT KEINE ZWEITE DANEBEN. */
    check('Und es gibt keine eigene Karte „Import" mehr',
      !cards.some(k => k.querySelector('h3')?.textContent.trim() === 'Import'),
      cards.map(k => k.querySelector('h3')?.textContent.trim()).join(' · '));
    check('Beide Haelften stehen wirklich darin',
      !!ex?.querySelector('#ex-yes') && !!ex?.querySelector('#ex-no') &&
      !!ex?.querySelector('#ex-plan') && !!ex?.querySelector('#imp'),
      `ex-yes ${!!ex?.querySelector('#ex-yes')} · imp ${!!ex?.querySelector('#imp')}`);
    /* DIE UNTERORDNUNG, an drei Merkmalen und nicht an einem Gefuehl: eine
       eigene, kleinere Ueberschrift, ein Trennstrich davor und das leise
       Ablagefeld. */
    const under = ex?.querySelector('.sys-sub');
    check('Der Import traegt eine eigene, untergeordnete Ueberschrift',
      under?.textContent.trim() === 'Import', under?.textContent);
    check('Und sie ist ein h4 und kein zweites h3',
      under?.tagName === 'H4', under?.tagName);
    check('Ein Trennstrich steht davor', !!ex?.querySelector('.sys-part'));
    check('Und das Ablagefeld ist leise gezeichnet',
      !!ex?.querySelector('#imp-drop.drop-quiet'),
      ex?.querySelector('#imp-drop')?.className);
    /* DIE REIHENFOLGE IST DER HALBE PUNKT: der Import steht UNTER dem Export
       und nicht darueber. Verglichen wird die Stellung im Markup. */
    /* BEIDE HAELFTEN GESCHUETZT: faellt die Karte weg, muss
       diese Zeile ROT werden koennen und darf den Lauf nicht mitreissen. */
    const setting = (w) =>
      [...(ex?.querySelectorAll('*') || [])].indexOf(ex?.querySelector(w) || null);
    check('Und er steht unter dem Export, nicht darueber',
      setting('#imp-drop') > setting('#ex-plan'),
      `${setting('#ex-plan')} gegen ${setting('#imp-drop')}`);
    // Und die Regel dazu steht wirklich im Stilblatt -- erst das Vorhandensein,
// dann die Eigenschaft.
    check('Die Regel fuer das leise Ablagefeld steht im Stilblatt',
      regel123('.drop-quiet').length > 0, '(keine Regel)');
    check('Und sie nimmt ihm den eigenen Untergrund',
      /background: none/.test(regel123('.drop-quiet')), regel123('.drop-quiet'));
    check('Die Regel fuer die untergeordnete Ueberschrift ebenso',
      regel123('.sys-card .sys-sub').length > 0, '(keine Regel)');
    /* KLEINER ALS DAS h3 DARUEBER -- sonst waere es keine Stufe, sondern eine
       zweite Karte im selben Rahmen. */
    const grOut = (w) => parseFloat((regel123(w).match(/font-size:\s*([\d.]+)rem/) || [])[1] || '0');
    check('Und sie ist kleiner als die Ueberschrift der Karte',
      grOut('.sys-card .sys-sub') > 0 && grOut('.sys-card h3') > 0 &&
      grOut('.sys-card .sys-sub') < grOut('.sys-card h3'),
      `${grOut('.sys-card .sys-sub')} gegen ${grOut('.sys-card h3')}`);
    d.w.close();
  }

  /* ================= Die Rechnung hinter der Kopfzahl — 0.16.0 ========== „⌀
     4,2 gewichtet" war richtig und erklaerte sich nicht. */
  group('Die Rechnung hinter der Kopfzahl');

  {
    const d = buildDom(JSDOM, { hash: '#/item/1' });
    await new Promise(r => setTimeout(r, 90));
    const doc = d.w.document;
    const head = () => doc.getElementById('rhead');
    check('Die Kopfzahl steht ueberhaupt da', !!head(), 'kein #rhead');
    const button = () => doc.querySelector('#rhead .weight-open');
    check('Und sie ist ein Knopf, kein blosser Text', !!button(),
      head()?.innerHTML?.slice(0, 120));
    check('Der Knopf traegt die Zahl und das Wort',
      /^⌀ 3,0 gewichtet$/.test(button()?.textContent || ''), button()?.textContent);

    // Kein Kasten, bevor jemand klickt.
    check('Vor dem Klick steht kein Kasten da', !doc.getElementById('calc-modal'));
    button()?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const box = doc.getElementById('calc-modal');
    check('Der Klick oeffnet den Kasten', !!box, doc.body.innerHTML.slice(0, 160));
    check('Und die Ueberschrift nennt die Zahl dieses Eintrags',
      /⌀ 3/.test(box?.querySelector('h2')?.textContent || ''),
      box?.querySelector('h2')?.textContent);

    /* JE BEWERTETEM KRITERIUM EINE ZEILE -- und ausdruecklich nur je
       bewertetem: „Zuletzt" hat kein avg und geht in die Rechnung gar nicht
       ein. */
    const rows = [...(box?.querySelectorAll('.calc .calc-row[data-krit]') || [])];
    check('Der Kasten zeigt je bewertetem Kriterium eine Zeile',
      rows.length === 2, `${rows.length} Zeilen`);
    check('Und nennt sie beim Namen',
      equal(rows.map(z => z.querySelector('.calc-name')?.textContent), ['Zuerst', 'Dann']),
      JSON.stringify(rows.map(z => z.querySelector('.calc-name')?.textContent)));
    check('Das unbewertete Kriterium steht ausdruecklich nicht darin',
      !/Zuletzt/.test(box?.querySelector('.calc')?.textContent || ''),
      box?.querySelector('.calc')?.textContent);
    /* NOTE, GEWICHT UND PRODUKT stehen in der Zeile -- ohne das Produkt waere
       es eine Aufzaehlung und keine Rechnung. */
    const columns = [...(rows[0]?.querySelectorAll('span') || [])].map(x => x.textContent.trim());
    check('Jede Zeile traegt Note, Gewicht und Produkt',
      equal(columns, ['Zuerst', '3,4', '× 1,5', '5,1']), JSON.stringify(columns));
    check('Summe und Teiler stehen darunter',
      doc.getElementById('calc-sum')?.textContent === '9,2' &&
      doc.getElementById('calc-divisor')?.textContent === '2,5',
      `${doc.getElementById('calc-sum')?.textContent} / ${doc.getElementById('calc-divisor')?.textContent}`);
    /* DIE ENTSCHEIDENDE ZEILE. 9,2 ÷ 2,5 ergibt 3,68 und gerundet 3,7 -- der
       Rechenweg der Prueflage nennt als Ergebnis aber ausdruecklich 3. */
    check('Das Ergebnis kommt aus der Antwort und wird nicht nachgerechnet',
      doc.getElementById('calc-result')?.textContent.trim() === '⌀ 3',
      doc.getElementById('calc-result')?.textContent);
    check('Und der Kasten sagt, dass genau einmal gerundet wird',
      /Gerundet wird nur das\s+Endergebnis/.test(box?.textContent || ''),
      box?.textContent?.replace(/\s+/g, ' ').slice(0, 200));
    // Der Weg zu den Gewichten nennt seit 0.22.0 die Karte beim Namen (Anlage D).
    check('Und wo die Gewichte eingestellt werden',
      /Bewertung: Kriterien/.test(box?.textContent || ''),
      box?.textContent?.replace(/\s+/g, ' ').slice(-200));

    /* ---- DER KASTEN ROLLT NICHT MEHR — 0.17.3 ---- GEPRUEFT WIRD, WAS SICH
       HIER PRUEFEN LAESST: dass die eine doppelte Angabe weg ist und dass
       unter der Tabelle zwei Absaetze stehen und nicht drei. */
    const rgChildren = [...(box?.children || [])];
    const rgAfterTable = rgChildren.slice(rgChildren.findIndex(k => k.classList.contains('calc')) + 1)
      .filter(k => k.tagName === 'P');
    check('Unter der Tabelle stehen zwei Absaetze und nicht drei',
      rgAfterTable.length === 2, `${rgAfterTable.length} Absaetze`);
    /* DIE AUSGESCHRIEBENE RECHNUNG IST DIE EINE ANGABE, DIE DOPPELT DASTAND:
       Summe, Teiler und Ergebnis tragen eigene Zeilen in der Tabelle. */
    const rgText = (box?.textContent || '').replace(/\s+/g, ' ');
    check('Die Rechnung steht nicht ein zweites Mal unter der Tabelle',
      !/9,2 ÷ 2,5/.test(rgText), rgText.slice(-260));
    check('Die Begruendung zum Teiler steht nicht mehr da',
      !/nach unten/.test(rgText), rgText.slice(0, 400));
    check('Der Teiler selbst steht weiterhin da',
      /Kriterien ohne Sterne zählen nicht mit/.test(rgText),
      rgText.slice(0, 400));
    /* UND DIE BEIDEN ZAHLEN IM STILBLATT. */
    check('Die Zeilen der Rechnung ruecken enger zusammen',
      /\.calc-row > span \{ padding: 3px 0;/.test(css123),
      (css123.match(/\.calc-row > span \{[^}]*\}/) || ['(keine Regel)'])[0]);
    check('Und der Kasten selbst wird breiter',
      /\.calc-modal \{ max-width: 620px; \}/.test(css123),
      (css123.match(/\.calc-modal \{[^}]*\}/) || ['(keine Regel)'])[0]);

    /* ---- DER VERWEIS ZEIGT IN DEN KASTEN — 0.17.0 ---- BIS 0.17.0 STAND
       HIER „die Zahlen rechts in den Zeilen". */
    const rvHead = [...(box?.querySelectorAll('.calc .calc-head span') || [])]
      .map(s => s.textContent.trim());
    check('Der Kasten traegt selbst eine Spalte „Note"',
      rvHead.includes('Note'), JSON.stringify(rvHead));
    check('Und der Satz darueber verweist genau auf sie',
      /\(Spalte Note\)/.test((box?.textContent || '').replace(/\s+/g, ' ')),
      (box?.textContent || '').replace(/\s+/g, ' ').slice(0, 220));
    check('Und nicht mehr auf die Liste dahinter',
      !/rechts in den Zeilen/.test(box?.textContent || ''),
      (box?.textContent || '').replace(/\s+/g, ' ').slice(0, 220));

    /* ---- DIE VERGLEICHSZAHL OHNE GEWICHTE — 0.17.0 ---- DIE FORMEL STAND
       ZEILE FUER ZEILE DA und liess trotzdem offen, WOFUER die Gewichte gut
       sind. */
    check('Die Prueflage taugt: gewichtet und ungewichtet sind verschieden',
      doc.getElementById('calc-same')?.textContent.trim() !== '⌀ 3' &&
      (doc.getElementById('calc-same')?.textContent || '').trim().length > 0,
      `${doc.getElementById('calc-result')?.textContent} gegen ` +
      `${doc.getElementById('calc-same')?.textContent}`);
    check('Der Kasten nennt die Zahl ohne Gewichte',
      doc.getElementById('calc-same')?.textContent.trim() === '⌀ 4',
      doc.getElementById('calc-same')?.textContent);
    /* SIE WIRD GELESEN UND NICHT NACHGERECHNET. */
    check('Und sie kommt aus der Antwort, statt im Browser gerechnet zu werden',
      !/3,8/.test(doc.querySelector('.calc')?.textContent || ''),
      doc.querySelector('.calc')?.textContent?.replace(/\s+/g, ' '));
    /* SO VIELE ZELLEN, WIE DAS RASTER SPALTEN HAT -- UND DIE ZAHL WIRD
       GELESEN, NICHT HINGESCHRIEBEN. */
    const rgRule = regel123('.calc');
    check('Die Regel fuer das Raster des Kastens steht im Stilblatt',
      rgRule.length > 0, '(keine Regel)');
    const rgColumns = (rgRule.match(/grid-template-columns: ([^;}]+)/) || ['', ''])[1]
      .trim().split(/\s+/).filter(Boolean).length;
    check('Und sie nennt eine Spaltenzahl', rgColumns > 0, rgRule || '(keine Regel)');
    const rgRow = box?.querySelector('.calc-same');
    check('Die Zeile traegt so viele Zellen, wie das Raster Spalten hat',
      rgColumns > 0 && rgRow?.children.length === rgColumns,
      `${rgRow?.children.length} Zellen gegen ${rgColumns} Spalten`);
    /* UND JEDE ANDERE ZEILE EBENSO. */
    const rgAll = [...(box?.querySelectorAll('.calc > .calc-row') || [])]
      .map(z => z.children.length);
    check('Und jede Zeile des Kastens traegt dieselbe Zahl',
      rgAll.length > 0 && rgColumns > 0 && rgAll.every(n => n === rgColumns),
      `${JSON.stringify(rgAll)} gegen ${rgColumns} Spalten`);
    /* UND DIE REGEL IM STILBLATT, DIE SIE UNTERORDNET. */
    const rgSpanRule = regel123('.calc-same > span');
    check('Die Regel fuer die Zellen der Vergleichszeile steht im Stilblatt',
      rgSpanRule.length > 0, '(keine Regel)');
    check('Sie daempft die Zahl',
      /color: var\(--muted\)/.test(rgSpanRule), rgSpanRule || '(keine Regel)');
    check('Und traegt ausdruecklich keinen fetten Schnitt',
      !/font-weight/.test(rgSpanRule), rgSpanRule || '(keine Regel)');
    check('Ein Strich darueber trennt sie vom Ergebnis',
      /border-top: 1px solid var\(--line-2\)/.test(rgSpanRule),
      rgSpanRule || '(keine Regel)');
    check('Und sie fuehrt keine neue Farbe ein',
      !/#[0-9a-f]{3,8}/i.test(rgSpanRule) && !/rgb|hsl/i.test(rgSpanRule),
      rgSpanRule || '(keine Regel)');
    /* DER GEGENSATZ MUSS ES AUCH GEBEN: „untergeordnet"
       belegt nichts, wenn die Zeile darueber selbst nicht hervorgehoben ist. */
    const rgErgRule = regel123('.calc-result > span');
    check('Die Zeile darueber traegt dagegen den fetten Schnitt',
      /font-weight: 6\d\d/.test(rgErgRule), rgErgRule || '(keine Regel)');
    check('Und sie steht unter dem Ergebnis, nicht darueber',
      [...(box?.querySelectorAll('.calc > .calc-row') || [])].indexOf(rgRow) >
      [...(box?.querySelectorAll('.calc > .calc-row') || [])]
        .indexOf(box?.querySelector('.calc-result')),
      'die Vergleichszahl steht vor dem Ergebnis');
    /* UND EIN SATZ SAGT, WAS SIE BEDEUTET. */
    check('Ein Satz nennt den Unterschied beim Namen',
      /Unterschied, den die Gewichtung macht/.test(box?.textContent || ''),
      doc.getElementById('calc-same-note')?.textContent?.replace(/\s+/g, ' '));

    // Escape schliesst ihn, wie jeden Dialog dieser Instanz.
    doc.dispatchEvent(new d.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 20));
    check('Escape schliesst den Kasten wieder', !doc.getElementById('calc-modal'));
    d.w.close();
  }

  /* OHNE GEWICHTUNG GIBT ES NICHTS ZU VERGLEICHEN -- stehen alle Gewichte auf
     1, ist die Vergleichszahl dieselbe Zahl wie darueber, und zweimal
     dasselbe hinzuschreiben ist keine Auskunft. */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1', criteriaWeights: [1, 1, 1] });
    await new Promise(r => setTimeout(r, 90));
    const doc = d.w.document;
    doc.querySelector('#rhead .weight-open')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const box = doc.getElementById('calc-modal');
    check('Auch ohne Gewichtung geht der Kasten auf', !!box, doc.body.innerHTML.slice(0, 160));
    check('Aber er nennt keine Vergleichszahl',
      !!box && !doc.getElementById('calc-same'),
      doc.getElementById('calc-same')?.textContent);
    check('Und auch keinen Satz dazu',
      !!box && !doc.getElementById('calc-same-note'),
      doc.getElementById('calc-same-note')?.textContent);
    /* DIE RECHNUNG SELBST STEHT TROTZDEM DA -- was fehlt, ist der Vergleich,
       nicht der Kasten. */
    check('Die Rechnung selbst steht trotzdem darin',
      (box?.querySelectorAll('.calc .calc-row[data-krit]') || []).length === 2,
      `${box?.querySelectorAll('.calc .calc-row[data-krit]').length}`);
    d.w.close();
  }

  /* UND WENN BEIDE ZAHLEN GLEICH SIND, SAGT DER KASTEN DAS -- statt zweimal
     dieselbe Zahl hinzuschreiben. */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1', calculationEqual: 3 });
    await new Promise(r => setTimeout(r, 90));
    const doc = d.w.document;
    doc.querySelector('#rhead .weight-open')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const box = doc.getElementById('calc-modal');
    check('Die Prueflage taugt: hier sind beide Zahlen wirklich gleich',
      doc.getElementById('calc-same')?.textContent.trim() ===
      doc.getElementById('calc-result')?.textContent.trim(),
      `${doc.getElementById('calc-result')?.textContent} gegen ` +
      `${doc.getElementById('calc-same')?.textContent}`);
    check('Dann sagt der Kasten, dass die Gewichtung nichts aendert',
      /ändert die Gewichtung nichts/.test(box?.textContent || ''),
      doc.getElementById('calc-same-note')?.textContent?.replace(/\s+/g, ' '));
    check('Und er behauptet keinen Unterschied',
      !/Unterschied, den die Gewichtung macht/.test(box?.textContent || ''),
      doc.getElementById('calc-same-note')?.textContent?.replace(/\s+/g, ' '));
    d.w.close();
  }

  /* OHNE BEWERTUNG KEINE KOPFZAHL UND DAMIT KEIN KNOPF -- ein Knopf, der ein
     leeres Fenster oeffnet, ist einer zu viel. */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1', withoutRating: true });
    await new Promise(r => setTimeout(r, 90));
    check('Ohne Bewertung steht dort ueberhaupt nichts',
      (d.w.document.getElementById('rhead')?.textContent || '') === '',
      JSON.stringify(d.w.document.getElementById('rhead')?.innerHTML));
    check('Und damit auch kein Knopf',
      !d.w.document.querySelector('#rhead .weight-open'),
      d.w.document.getElementById('rhead')?.innerHTML);
    /* Die Kriterienzeilen stehen trotzdem da -- was fehlt, ist die ZAHL, nicht
       der Block. */
    check('Die Kriterienzeilen bleiben davon unberuehrt',
      [...d.w.document.querySelectorAll('#ratings .rrow')].length === 3,
      `${d.w.document.querySelectorAll('#ratings .rrow').length} Zeilen`);
    d.w.close();
  }

  /* UND DIE LAGE MIT EINEM EINZIGEN ZUGANG — 0.17.0. */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1',
      settings: { filters: null, userCount: 1, isAdmin: true } });
    await new Promise(r => setTimeout(r, 90));
    const doc = d.w.document;
    /* ERST DIE LAGE SELBST: die Spalte hinter dem Kasten fehlt hier wirklich.
       Faende sich hier doch eine, belegte die Zusage darunter nichts. */
    check('Die Prueflage taugt: bei einem Zugang gibt es die Spalte dahinter nicht',
      doc.querySelectorAll('#ratings .rrow .ravg').length === 0,
      `${doc.querySelectorAll('#ratings .rrow .ravg').length} Durchschnittszellen`);
    doc.querySelector('#rhead .weight-open')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const box = doc.getElementById('calc-modal');
    check('Auch bei einem einzigen Zugang geht der Kasten auf', !!box,
      doc.body.innerHTML.slice(0, 160));
    check('Und er verweist auch dort nicht auf die Liste dahinter',
      !!box && !/rechts in den Zeilen/.test(box.textContent || ''),
      (box?.textContent || '').replace(/\s+/g, ' ').slice(0, 220));
    check('Sondern auf seine eigene Spalte, die auch hier dasteht',
      [...(box?.querySelectorAll('.calc .calc-head span') || [])]
        .map(s => s.textContent.trim()).includes('Note') &&
      /\(Spalte Note\)/.test((box?.textContent || '').replace(/\s+/g, ' ')),
      (box?.textContent || '').replace(/\s+/g, ' ').slice(0, 220));
    d.w.close();
  }

  /* ---- DIE TABELLE ROLLTE WAAGERECHT ---- Bei 360 Pixeln brauchte sie mit
     einem Kriteriennamen aus vierzig Zeichen 378 statt 328 Pixel; die erste
     Spalte mass dabei 190 statt 88,7. */
  {
    /* Der Block wird ueber die Klammern gezaehlt und nicht ueber ein Muster:
       er traegt geschachtelte Regeln. */
    const caNarrow = (() => {
      const raw = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
      const from = raw.indexOf('@media (max-width: 700px), (max-height: 500px) and (max-width: 960px) {');
      if (from < 0) return '';
      let depth = 0;
      for (let i = raw.indexOf('{', from); i < raw.length; i++) {
        if (raw[i] === '{') depth++;
        else if (raw[i] === '}' && --depth === 0) return raw.slice(from, i + 1);
      }
      return '';
    })();
    /* ERST DAS VORHANDENSEIN DES BLOCKS: ueber einem leeren Text waere jede
       Verneinung darunter wahr. */
    check('Die schmale Ansicht steht ueberhaupt im Stilblatt',
      caNarrow.length > 5000, `${caNarrow.length} Zeichen`);
    const caCalc = (caNarrow.match(/\.calc-row > span:first-child \{[^}]*\}/) || [''])[0];
    check('Und die erste Spalte der Rechentabelle darf dort umbrechen',
      /min-width: 0/.test(caCalc) && /overflow-wrap: anywhere/.test(caCalc),
      caCalc || '(keine Regel)');
    /* DIESELBE REPARATUR TRAEGT DIE BEWERTUNGSZEILE, und sie steht daneben:
       laufen die beiden auseinander, faellt es hier auf. */
    const caList = (caNarrow.match(/\.rrow \.rname \{[^}]*\}/) || [''])[0];
    check('Und die Bewertungszeile traegt dieselbe Regel',
      /min-width: 0/.test(caList) && /overflow-wrap: anywhere/.test(caList),
      caList || '(keine Regel)');
    /* ---- UND SIE WIRD ZWEIZEILIG ---- Umbrechen allein reichte nicht: die
       drei Zahlenspalten nehmen sich ihre Breite zuerst, und mit einem
       laengeren Vokabelwort blieben dem Namen zwei Pixel. */
    const caGrid = (caNarrow.match(/\.calc \{[^}]*\}/) || [''])[0];
    check('Das Raster der Rechentabelle hat am Telefon drei Spalten',
      /grid-template-columns: auto auto 1fr;/.test(caGrid), caGrid || '(keine Regel)');
    const caName = (caNarrow.match(/\.calc-row > span:first-child \{ grid-column:[^}]*\}/) || [''])[0];
    check('Und der Name steht ueber ihnen in einer eigenen Zeile',
      /grid-column: 1 \/ -1/.test(caName) && /border-bottom: none/.test(caName),
      caName || '(keine Regel)');
    /* DIE VIERTE ZELLE JE ZEILE BLEIBT -- die Oberflaeche baut weiter vier,
       nur das Raster legt sie anders. */
    check('Die Oberflaeche baut weiterhin vier Zellen je Zeile',
      (regel123('.calc').match(/grid-template-columns: ([^;}]+)/) || ['', ''])[1]
        .trim().split(/\s+/).filter(Boolean).length === 4,
      regel123('.calc') || '(keine Regel)');
  }

  /* ================= Die Glocke in der Kopfzeile — 0.16.0 ===============
     DREI DINGE ZUSAMMEN: der Punkt an der Glocke, die Zahl am Knopf „Offen"
     und die Tafel dahinter. */
  group('Die Glocke in der Kopfzeile');

  /* DER EIGENE NAME BLEIBT IN DER TABELLE STEHEN -- er belegt seit 0.17.2
     seine ABWESENHEIT und nicht mehr sein Dasein. */
  const glFrom = { bert: { id: 2, name: 'bert', deleted: false },
                  carla: { id: 3, name: 'carla', deleted: false },
                  dora: { id: 4, name: 'dora', deleted: false },
                  ich: { id: 1, name: 'chefin', deleted: false } };
  /* JE EINTRAG ZWEI ZAHLEN UND EINE LISTE. */
  const glInventory = (fresh) => [
    { id: 1, title: 'Erster', rejected: false, tested: true, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 3,
      testCount: 1, testAvg: 4, testLast: 4, updated_at: '2026-08-01 10:00:00',
      openTasks: 2, newComments: fresh[0][0], newRatings: fresh[0][1],
      newFrom: fresh[0][2] || [] },
    { id: 2, title: 'Zweiter', rejected: false, tested: true, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 4,
      testCount: 1, testAvg: 4, testLast: 4, updated_at: '2026-08-02 10:00:00',
      openTasks: 5, newComments: fresh[1][0], newRatings: fresh[1][1],
      newFrom: fresh[1][2] || [] }
  ];
  const glBuild = async (fresh, more = {}) => {
    const d = buildDom(JSDOM, { overviewItems: glInventory(fresh),
      settings: { filters: null, userCount: 3,
        bellSeen: '2026-08-01 00:00:00', ...more } });
    await new Promise(r => setTimeout(r, 90));
    return d;
  };

  {
    /* OHNE BEZUGSPUNKT GIBT ES KEINE GLOCKE. */
    const withoutPhotos = await glBuild([[3, 0, [glFrom.bert]], [1, 0, [glFrom.carla]]],
      { bellSeen: undefined });
    check('Ohne gespeicherten Bezugspunkt gibt es keine Glocke',
      !withoutPhotos.w.document.getElementById('bell'), 'die Glocke steht trotzdem da');
    /* UND SIE ENTSTEHT BEIM VERLASSEN DER UEBERSICHT -- sonst gaebe es keinen
       Weg, sie je zu bekommen. */
    withoutPhotos.w.location.hash = '#/item/1';
    await new Promise(r => setTimeout(r, 90));
    const withoutPut = withoutPhotos.sent.filter(g => g.method === 'PUT' && g.url === '/api/settings').pop();
    check('Der Bezugspunkt wird beim Verlassen der Uebersicht gesetzt',
      withoutPut?.body?.bellSeen !== undefined, JSON.stringify(withoutPut?.body));
    // Als SIGNAL, nicht als Uhrzeit des Aufrufers: die Uhr des Aufrufers ist
// eine Behauptung, der Server setzt seine eigene ein.
    check('Und zwar als Signal, nicht als Zeitangabe des Aufrufers',
      !/\d{4}-\d{2}-\d{2}/.test(String(withoutPut?.body?.bellSeen ?? '')),
      JSON.stringify(withoutPut?.body));
    withoutPhotos.w.close();
  }

  {
    /* DREI KOMMENTARE UND EINE BEWERTUNG AM ERSTEN, EIN KOMMENTAR AM ZWEITEN. */
    const d = await glBuild([[3, 1, [glFrom.bert, glFrom.carla]], [1, 0, [glFrom.dora]]]);
    const doc = d.w.document;
    check('Mit Bezugspunkt steht die Glocke da', !!doc.getElementById('bell'));
    check('Und sie steht im selben Behaelter wie die anderen Zeichenknoepfe',
      doc.getElementById('bell')?.closest('#mast-rest') === doc.getElementById('mast-rest'),
      'die Glocke steht ausserhalb von .mast-rest');
    /* EIN PUNKT UND KEINE ZAHL. Ein Ereignis bekommt einen Punkt, ein Zustand
       eine Zahl -- die beiden Zeichen werden nirgends vertauscht. */
    const point = doc.getElementById('bell-dot');
    check('Sie traegt einen Punkt, wenn etwas Neues da ist',
      !!point && point.hidden === false, `hidden: ${point?.hidden}`);
    check('Und der Punkt traegt ausdruecklich keine Zahl',
      (point?.textContent || '') === '', JSON.stringify(point?.textContent));
    /* EINE ZAHL IM TITEL, UND ZWAR DIE SUMME. */
    check('Der Titel des Knopfes nennt die Summe',
      /^5 Neuigkeiten von anderen/.test(doc.getElementById('bell')?.title || ''),
      doc.getElementById('bell')?.title);
    check('Und er zaehlt Kommentare und Bewertungen zusammen, nicht doppelt',
      !/10 |8 /.test(doc.getElementById('bell')?.title || ''),
      doc.getElementById('bell')?.title);
    /* DER ZAEHLER „OFFEN". Er summiert, was an den Eintraegen steht -- 2 und 5.
       DIE ZAHL STEHT AM KNOPF, nicht an der Glocke. */
    check('Der Knopf „Offen" traegt die Zahl',
      doc.getElementById('open-count')?.textContent === '7',
      doc.getElementById('open-count')?.textContent);
    check('Und sie steht sichtbar da',
      doc.getElementById('open-count')?.hidden === false,
      String(doc.getElementById('open-count')?.hidden));

    /* DIE TAFEL. Sie ist die zweite Haelfte der Glocke: eine Message, die man
       nicht anspringen kann, ist eine Mitteilung ohne Weg. */
    doc.getElementById('bell')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const panel = doc.getElementById('bell-modal');
    check('Der Klick oeffnet die Tafel', !!panel, doc.body.innerHTML.slice(0, 140));
    /* UND SIE SAGT, WESSEN BEITRAEGE SIE MELDET. */
    const glSentence = (panel?.textContent || '').replace(/\s+/g, ' ');
    /* SEIT 0.32.0 SAGT ER MEHR -- F4. */
    check('Sie sagt, dass sie die Beitraege der ANDEREN meldet — und nach welcher Herkunft',
      /Was andere seit deinem letzten Besuch eingetragen haben/.test(glSentence)
      && /an dich gerichtet/.test(glSentence) && /alles andere/.test(glSentence),
      glSentence.slice(0, 200));
    check('Und sie verspricht nicht mehr die eigenen mit',
      !/von allen/.test(glSentence) && !/eigenen stehen mit da/.test(glSentence),
      glSentence.slice(0, 200));
    const rows = [...(panel?.querySelectorAll('#bell-list .bell-row') || [])];
    check('Sie listet nur die Eintraege mit Neuem',
      rows.length === 2, `${rows.length} Zeilen`);
    check('Jede Zeile fuehrt zu ihrem Eintrag',
      equal(rows.map(z => z.getAttribute('href')), ['#/item/1', '#/item/2']),
      JSON.stringify(rows.map(z => z.getAttribute('href'))));
    /* MITGENOMMEN MIT 0.17.0: hier stand „3 neue
       Beitraege". */
    const glNumber = (i) => rows[i]?.querySelector('.mcount')?.textContent?.trim();
    const glTitle = (i) => rows[i]?.querySelector('.mcount')?.getAttribute('title');
    check('Sie nennt die Arten getrennt statt sie zusammenzuzaehlen',
      glNumber(0) === '3 Kommentare · ★1', JSON.stringify(glNumber(0)));
    /* DAS WORT BLEIBT BEIM ERSTEN STUECK, die Bewertungen tragen das Zeichen;
       der lange Wortlaut steht im Ueberfahrtext. Bei 360 Pixeln mass die
       Zeile in den drei Sprachen 227,6 / 189,7 / 208,6 und jetzt 158,1 /
       145,4 / 126,5 Pixel. */
    check('Und der Ueberfahrtext traegt den langen Wortlaut',
      glTitle(0) === '3 Kommentare · 1 Bewertung', JSON.stringify(glTitle(0)));
    /* BEI NUR EINER ART STEHT AUCH NUR EINE ANGABE DA. */
    check('Bei nur einer Art steht auch nur eine Angabe da',
      glNumber(1) === '1 Kommentar', JSON.stringify(glNumber(1)));
    check('Und keine Null steht in der Tafel',
      !rows.some(z => /\b0 /.test(z.querySelector('.mcount')?.textContent || '')),
      rows.map(z => z.querySelector('.mcount')?.textContent).join(' | '));
    /* DAS SAMMELWORT STEHT IN KEINER ZEILE MEHR. Der Einleitungsabsatz nennt
       weiterhin, was die Tafel ueberhaupt meldet; gemeint ist die ZEILE. */
    check('Das Sammelwort „Beitrag" steht in keiner Zeile mehr',
      !rows.some(z => /Beitr/.test(z.textContent || '')),
      rows.map(z => z.textContent.replace(/\s+/g, ' ')).join(' | '));
    /* UND JEDE ZEILE SAGT, VON WEM. */
    const glWho = (i) => rows[i]?.querySelector('.bell-from')?.textContent?.trim();
    check('Jede Zeile sagt, von wem',
      glWho(0) === 'von bert und carla', JSON.stringify(glWho(0)));
    check('Bei einem Namen ohne „und"',
      glWho(1) === 'von dora', JSON.stringify(glWho(1)));
    /* ZWEIMAL UMGEDREHT UND NIE GELOESCHT. */
    check('Und der eigene Name steht in keiner Zeile',
      !/chefin/.test(panel?.textContent || ''),
      panel?.textContent?.replace(/\s+/g, ' ').slice(0, 300));
    /* UND DIE TAFEL BEGRUENDET DAS NICHT. */
    check('Die Tafel begruendet das Fehlen aber nicht',
      !/Eigene Beiträge stehen nie hier/.test(panel?.textContent || ''),
      panel?.textContent?.replace(/\s+/g, ' ').slice(0, 300));
    /* MITGENOMMEN MIT 0.17.0, NICHT GELOESCHT: bis dahin
       stand hier „die Tafel sagt, was sie nicht verspricht". */
    check('Die Tafel begruendet sich nicht mehr selbst',
      !/nicht verspricht|Lesestand je Meldung|nicht laufend/.test(panel?.textContent || ''),
      panel?.textContent?.replace(/\s+/g, ' ').slice(-260));
    /* UND DIE AUSKUNFT IST DAFUER IM HANDBUCH -- erst das Vorhandensein,
       dann die Verneinung. Bis 0.34.1 stand sie in der README. */
    check('Dafuer steht sie im Handbuch',
      /keinen Lesestand je Meldung/.test(handbookFlat) &&
      /nicht laufend/.test(handbookFlat),
      'das Handbuch traegt den Vorbehalt nicht');
    /* DAS OEFFNEN SETZT ALLES AUF GESEHEN -- die bewusste Grenze der schlanken
       Fassung, und sie steht in der Tafel. */
    const glPut = d.sent.filter(g => g.method === 'PUT' && g.url === '/api/settings')
      .filter(g => g.body && g.body.bellSeen !== undefined).pop();
    check('Das Oeffnen zieht den Bezugspunkt nach',
      !!glPut, JSON.stringify(d.sent.filter(g => g.method === 'PUT').map(g => g.body)));
    check('Und der Punkt ist danach fort',
      doc.getElementById('bell-dot')?.hidden === true,
      String(doc.getElementById('bell-dot')?.hidden));
    /* DER ZAEHLER „OFFEN" BLEIBT DAVON UNBERUEHRT: er beschreibt einen
       Zustand, und der aendert sich nicht dadurch, dass jemand hinsieht. */
    check('Der Zaehler „Offen" bleibt dabei stehen',
      doc.getElementById('open-count')?.textContent === '7',
      doc.getElementById('open-count')?.textContent);
    d.w.close();
  }

  {
    /* NICHTS NEUES: die Glocke steht, der Punkt nicht. Ohne diese Lage bliebe
       „der Punkt steht da" auch dann gruen, wenn er immer stuende. */
    const still = await glBuild([[0, 0, []], [0, 0, []]]);
    check('Ohne Neues steht die Glocke, aber kein Punkt',
      !!still.w.document.getElementById('bell') &&
      still.w.document.getElementById('bell-dot')?.hidden === true,
      String(still.w.document.getElementById('bell-dot')?.hidden));
    check('Und ihr Titel sagt es',
      /Keine Neuigkeiten/.test(still.w.document.getElementById('bell')?.title || ''),
      still.w.document.getElementById('bell')?.title);
    // Und die Tafel bleibt trotzdem erreichbar und sagt, dass nichts da ist.
    still.w.document.getElementById('bell')
      .dispatchEvent(new still.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Die Tafel sagt es dann auch',
      /Keine Neuigkeiten\./.test(
        still.w.document.getElementById('bell-list')?.textContent || ''),
      still.w.document.getElementById('bell-list')?.textContent);
    still.w.close();
  }

  {
    /* OHNE OFFENE AUFGABEN KEINE ZAHL. „Offen 0" waere eine Auskunft ueber
       nichts und stuende dauerhaft da. */
    const empty = await glBuild([[0, 0, []], [0, 0, []]]);
    for (const it of [...empty.w.document.querySelectorAll('.card')]) it.remove();
    const withoutTasks = buildDom(JSDOM, {
      overviewItems: glInventory([[0, 0, []], [0, 0, []]]).map(i => ({ ...i, openTasks: 0 })),
      settings: { filters: null, userCount: 3, bellSeen: '2026-08-01 00:00:00' } });
    await new Promise(r => setTimeout(r, 90));
    check('Ohne offene Aufgaben traegt der Knopf keine Zahl',
      withoutTasks.w.document.getElementById('open-count')?.hidden === true &&
      (withoutTasks.w.document.getElementById('open-count')?.textContent || '') === '',
      JSON.stringify(withoutTasks.w.document.getElementById('open-count')?.textContent));
    empty.w.close(); withoutTasks.w.close();
  }

  {
    /* SORTIERT WIRD NACH DER SUMME UND NICHT NACH EINEM DER BEIDEN TEILE. */
    const d = await glBuild([[1, 4, [glFrom.bert]], [3, 0, [glFrom.carla]]]);
    const doc = d.w.document;
    doc.getElementById('bell')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const rows = [...doc.querySelectorAll('#bell-list .bell-row')];
    check('Die Prueflage taugt: die Teile ordnen anders als die Summe',
      rows.length === 2, `${rows.length} Zeilen`);
    check('Die Tafel ordnet nach der Summe, nicht nach einem der Teile',
      rows[0]?.querySelector('.mname')?.textContent === 'Erster',
      rows.map(z => z.querySelector('.mname')?.textContent).join(' | '));
    /* UND DIE EINZAHL STEHT RICHTIG DA. „1 Kommentare" ist der Fehler, den
       eine feste Endung macht -- geprueft an BEIDEN Woertern. */
    check('Die Einzahl steht bei beiden Woertern richtig',
      rows[0]?.querySelector('.mcount')?.getAttribute('title') === '1 Kommentar · 4 Bewertungen',
      JSON.stringify(rows[0]?.querySelector('.mcount')?.getAttribute('title')));
    /* UND IN DER ZEILE STEHT DAS ZEICHEN. */
    check('Und in der Zeile steht das Zeichen statt des Wortes',
      rows[0]?.querySelector('.mcount')?.textContent?.trim() === '1 Kommentar · ★4',
      JSON.stringify(rows[0]?.querySelector('.mcount')?.textContent));
    check('Und die Mehrzahl ebenso',
      rows[1]?.querySelector('.mcount')?.textContent?.trim() === '3 Kommentare',
      JSON.stringify(rows[1]?.querySelector('.mcount')?.textContent));
    /* JE ZEILE GENAU EINE ANGABE, und sie wird am GEGENSTAND gelesen und
       nicht an einem Attribut: zwei .mcount nebeneinander
       saehen im Text aus wie eine. */
    check('Jede Zeile traegt genau eine solche Angabe',
      rows.every(z => z.querySelectorAll('.mcount').length === 1),
      JSON.stringify(rows.map(z => z.querySelectorAll('.mcount').length)));
    /* UND DER KNOPF „OFFEN" BLEIBT EINE ZAHL. */
    check('Der Knopf „Offen" traegt weiterhin genau eine Zahl',
      /^\d+$/.test(doc.getElementById('open-count')?.textContent || ''),
      doc.getElementById('open-count')?.textContent);
    d.w.close();
  }

  {
    /* DIE GEGENRICHTUNG: nur Bewertungen, und eine davon in der Einzahl. */
    /* OHNE NAMEN, WIE DER ECHTE SERVER: er speist `neuVon`
       aus den KOMMENTAREN, und hier gibt es keine. */
    const d = await glBuild([[0, 4, []], [0, 1, []]]);
    const doc = d.w.document;
    doc.getElementById('bell')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const rows = [...doc.querySelectorAll('#bell-list .bell-row')];
    check('Die Prueflage traegt zwei Zeilen mit nur Bewertungen',
      rows.length === 2, `${rows.length} Zeilen`);
    check('Nur Bewertungen: nur diese Angabe steht da',
      rows[0]?.querySelector('.mcount')?.textContent?.trim() === '★4',
      JSON.stringify(rows[0]?.querySelector('.mcount')?.textContent));
    check('Und die Einzahl der Bewertung steht im Ueberfahrtext richtig da',
      rows[1]?.querySelector('.mcount')?.getAttribute('title') === '1 Bewertung',
      JSON.stringify(rows[1]?.querySelector('.mcount')?.getAttribute('title')));
    check('Das Wort „Kommentar" steht dann in keiner Zeile',
      !rows.some(z => /Kommentar/.test(z.textContent || '')),
      rows.map(z => z.textContent.replace(/\s+/g, ' ')).join(' | '));
    /* UND KEIN NAME. */
    check('Und kein Name steht neben einer reinen Bewertungszeile',
      rows.every(z => (z.querySelector('.bell-from')?.textContent || '') === ''),
      JSON.stringify(rows.map(z => z.querySelector('.bell-from')?.textContent)));
    d.w.close();
  }

  {
    /* WAS EIN BETREIBER SIEHT, DER ALLEIN ARBEITET -- UMGEDREHT MIT 0.17.2
       UND NICHT GELOESCHT. */
    const d = await glBuild([[0, 0, []], [0, 0, []]], { userCount: 1 });
    const doc = d.w.document;
    check('Auch bei einem einzigen Zugang steht die Glocke da',
      !!doc.getElementById('bell'), 'keine Glocke bei einem Zugang');
    check('Sie traegt dort aber keinen Punkt',
      doc.getElementById('bell-dot')?.hidden === true,
      String(doc.getElementById('bell-dot')?.hidden));
    /* UND IHR TITEL SAGT ES AUCH, statt eine Zahl zu nennen, die es nicht
       gibt. */
    check('Und ihr Titel nennt keine Zahl',
      doc.getElementById('bell')?.title === 'Keine Neuigkeiten',
      JSON.stringify(doc.getElementById('bell')?.title));
    doc.getElementById('bell')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const rows = [...doc.querySelectorAll('#bell-list .bell-row')];
    check('Und die Tafel bleibt leer, statt ihm die eigene Hand zu melden',
      rows.length === 0, `${rows.length} Zeilen`);
    /* DER EIGENE NAME KOMMT AUCH HIER NIRGENDS VOR -- weder in einer Zeile
       noch als Ersatztext. */
    check('Und der eigene Name steht nirgends darin',
      !/chefin/.test(doc.getElementById('bell-modal')?.textContent || ''),
      (doc.getElementById('bell-modal')?.textContent || '')
        .replace(/\s+/g, ' ').slice(0, 200));
    d.w.close();
  }

  {
    /* DIE ZEILE DER TAFEL BRICHT UM. */
    const glRow = regel123('.mrow.bell-row');
    check('Die Regel fuer die Zeile der Tafel steht im Stilblatt',
      glRow.length > 0, '(keine Regel)');
    check('Und sie laesst die Zeile umbrechen',
      /flex-wrap: wrap/.test(glRow), glRow || '(keine Regel)');
    const glFromRule = regel123('.bell-row .bell-from');
    check('Die Angabe „von wem" bekommt die volle Breite',
      /flex-basis: 100%/.test(glFromRule), glFromRule || '(keine Regel)');
    /* KEINE NEUE FARBE: --faint traegt in dieser Instanz jede Nebenangabe. Ein
       neuer Farbwert waere ein zweiter Kanal fuer dieselbe Aussage. */
    check('Und sie fuehrt keine neue Farbe ein',
      /var\(--faint\)/.test(glFromRule) && !/#[0-9a-f]{3,8}/i.test(glFromRule),
      glFromRule || '(keine Regel)');
  }

  /* ================= Der Papierkorb im Vollbild — 0.16.0 ================
     DIESELBE KLEMME WIE DARUNTER und dieselbe Rueckfrage. */
  group('Der Papierkorb im Vollbild');

  {
    const d = buildDom(JSDOM, { hash: '#/item/1' });
    await new Promise(r => setTimeout(r, 90));
    const doc = d.w.document;
    doc.querySelector('#viewer img')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Das Vollbild geht auf', !!doc.querySelector('.lightbox'));
    const removed = () => doc.querySelector('.lightbox .lb-btn.remove');
    check('Und es traegt einen Papierkorb', !!removed(), 'kein Papierkorb im Vollbild');
    /* ER STEHT NICHT NEBEN DEM SCHLIESSEN: zwei Kreuze nebeneinander, von
       denen eines die Ansicht zumacht und das andere das Bild vernichtet,
       waeren die gefaehrlichste Nachbarschaft der Instanz. */
    const tools = [...doc.querySelectorAll('.lightbox .lb-tools .lb-btn')]
      .map(b => b.className.replace('lb-btn ', ''));
    check('Und er steht vor dem Schliessen, nicht daneben',
      equal(tools, ['zoom', 'remove', 'close']), JSON.stringify(tools));

    const imagesBefore = [...doc.querySelectorAll('.lightbox .lb-thumb')].length;
    /* MIT FRAGEZEICHEN, und das ist keine Zierde: nimmt ein Rueckbau den
       Papierkorb weg, ist `removed()` null. */
    removed()?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const askKey = doc.querySelector('.backdrop .modal');
    check('Der Papierkorb fragt zuerst nach', !!askKey, doc.body.innerHTML.slice(0, 140));
    check('Und die Frage nennt, was verschwindet',
      /wird endgültig gelöscht/.test(askKey?.textContent || ''), askKey?.textContent);
    // Abbrechen: es darf nichts hinausgehen und nichts verschwinden.
    doc.querySelector('.backdrop [data-no]')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Nach dem Abbrechen wird nichts geschickt',
      !d.sent.some(x => x.method === 'DELETE' && x.url.startsWith('/api/photos/')),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und das Vollbild steht unveraendert', !!doc.querySelector('.lightbox') &&
      [...doc.querySelectorAll('.lightbox .lb-thumb')].length === imagesBefore,
      `${[...doc.querySelectorAll('.lightbox .lb-thumb')].length} statt ${imagesBefore}`);

    removed()?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    doc.querySelector('.backdrop [data-yes]')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 80));
    check('Nach dem Bestaetigen geht das Loeschen ueber DIESELBE Route hinaus',
      d.sent.some(x => x.method === 'DELETE' && /^\/api\/photos\/\d+$/.test(x.url)),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und der Vorschaustreifen im Vollbild zieht nach',
      !doc.querySelector('.lightbox') ||
      [...doc.querySelectorAll('.lightbox .lb-thumb')].length === imagesBefore - 1,
      `${[...doc.querySelectorAll('.lightbox .lb-thumb')].length} statt ${imagesBefore - 1}`);
    d.w.close();
  }

  {
    /* DIE GEGENLAGE: ein Kommentarbild bekommt KEINEN Papierkorb im Vollbild. */
    const d = buildDom(JSDOM, { hash: '#/item/1' });
    await new Promise(r => setTimeout(r, 90));
    const image = d.w.document.querySelector('.kbild img, .komm-bild img, .cimgs img');
    if (image) {
      image.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 40));
    }
    check('Ein Kommentarbild im Vollbild traegt keinen Papierkorb',
      !image || !d.w.document.querySelector('.lightbox .lb-btn.remove'),
      image ? 'der Papierkorb steht auch dort' : '(kein Kommentarbild in der Prueflage)');
    d.w.close();
  }

  /* ================= Was der Benutzer sieht — 0.17.1 ====================
     SECHS HANDGRIFFE AUS EINEM RUNDLAUF VON HAND. */

  /* ---- 1. Der Text im Kachel „Zugang" sagt, was gilt ---- */
  group('Der Zugangstext sagt, was gilt — 0.17.1');

  /* DREI SACHEN WAREN DARAN FALSCH: „freiwillig" auch bei eingeschalteter
     Selbstanmeldung, „Mindestens 10 Zeichen" am Adressfeld statt am Passwort,
     und ein Wirtsbefehl fuer Leute ohne Wirt. */
  const zt = async (signup) => {
    const d = buildDom(JSDOM, { signup,
      settings: { filters: null, userCount: 4, isAdmin: false, isOwner: false } });
    await new Promise(r => setTimeout(r, 60));
    await sysSection(d.w, 'personal');
    return d;
  };
  // SEIT 0.22.0 HEISST DIE KARTE „Mein Konto" (E2).
  const ztCard = (d) => [...d.w.document.querySelectorAll('.sys-grid > .sys-card')]
    .find(c => c.querySelector('h3')?.textContent.trim() === 'Mein Konto');
  {
    const dOut = await zt(false), dAn = await zt(true);
    check('Die Karte „Mein Konto" steht in beiden Lagen da',
      !!ztCard(dOut) && !!ztCard(dAn),
      `${!!ztCard(dOut)} / ${!!ztCard(dAn)}`);
    const tOut = ztCard(dOut)?.textContent || '', tAn = ztCard(dAn)?.textContent || '';
    /* DIE MARKE HAENGT AM ADRESSFELD und nicht irgendwo in der Karte: gelesen
       wird die Beschriftung DES FELDES, sonst faende die Zeile auch ein
       „freiwillig", das an einer ganz anderen Stelle steht. */
    const ztLabel = (d) => d.w.document.getElementById('acc-mail')
      ?.closest('.field')?.querySelector('label')?.textContent || '';
    /* UMGEDREHT MIT 0.22.0 (Anlage B): die Marken heissen „(optional)" und
       „(erforderlich)", und der Absatz sagt in drei Saetzen, wozu die Adresse
       dient, was ohne sie geschieht und was ein Passwortwechsel auslöst. */
    check('Ohne Registrierung steht am Adressfeld „(optional)" — 0.22.0',
      /\(optional\)/.test(ztLabel(dOut)), ztLabel(dOut));
    check('Mit Registrierung steht dort „(erforderlich)" — 0.22.0',
      /\(erforderlich\)/.test(ztLabel(dAn)) && !/optional/.test(ztLabel(dAn)),
      ztLabel(dAn));
    check('Ohne Registrierung sagt der Absatz, wofuer die Adresse gebraucht wird',
      /Link zum Zurücksetzen des Passworts geschickt werden/.test(tOut) &&
      /ohne Adresse gibt der Admin ihn persönlich weiter/.test(tOut),
      tOut.slice(0, 260));
    check('Mit Registrierung sagt er, dass sie erforderlich IST — 0.22.0',
      /Die Adresse ist erforderlich/.test(tAn) && /solange die Registrierung erlaubt ist/.test(tAn),
      tAn.slice(0, 260));
    /* UND DIE ALTE BEHAUPTUNG IST WEG. */
    check('Die alte Behauptung „ohne sie fehlt nichts" steht nirgends mehr',
      !/Ohne sie fehlt nichts/.test(tOut) && !/Ohne sie fehlt nichts/.test(tAn),
      `${/Ohne sie fehlt nichts/.test(tOut)} / ${/Ohne sie fehlt nichts/.test(tAn)}`);

    /* DIE VORGABE STEHT AM FELD, FUER DAS SIE GILT. */
    const ztPw = dOut.w.document.getElementById('acc-new')
      ?.closest('.field')?.querySelector('label')?.textContent || '';
    check('Die Laengenvorgabe steht am Feld „Neues Passwort"',
      /mindestens 10 Zeichen/.test(ztPw), ztPw);
    check('Und nicht mehr am Adressfeld',
      !/Zeichen/.test(ztLabel(dOut)), ztLabel(dOut));
    check('Und auch nicht mehr im Absatz darunter',
      !/Mindestens 10 Zeichen/.test(tOut), tOut.slice(0, 260));

    /* DIE KLEMME SITZT AN DERSELBEN STELLE WIE DIE KARTE und nicht an einer
       zweiten Abfrage daneben. */
    const ztFetches = (d) => d.sent.filter(x => x.method === 'GET').map(x => x.url).sort();
    check('Beide Lagen holen genau dieselben Auskuenfte',
      equal(ztFetches(dOut), ztFetches(dAn)),
      `${ztFetches(dOut).length} gegen ${ztFetches(dAn).length}`);
    check('Und keine davon fragt eigens nach der Selbstanmeldung',
      !ztFetches(dOut).some(u => /signup/.test(u)),
      ztFetches(dOut).join(' · '));
    dOut.w.close(); dAn.w.close();
  }
  {
    /* UND DER EINE MERKER ZIEHT WIRKLICH MIT. */
    const d = buildDom(JSDOM, { signup: false,
      requestsStatus: { an: false, deliveryReady: true, deliveryReason: '', cap: 20,
                       hours: 24, requests: [] },
      settings: { filters: null, userCount: 4, isAdmin: true, isOwner: true } });
    await new Promise(r => setTimeout(r, 60));
    await sysSection(d.w, 'personal');
    const mark = () => d.w.document.getElementById('acc-mail')
      ?.closest('.field')?.querySelector('label')?.textContent || '';
    check('Vor dem Umlegen steht am Adressfeld „(optional)" — 0.22.0',
      /\(optional\)/.test(mark()), mark());
    await sysSection(d.w, 'users');
    d.w.document.getElementById('signup-toggle')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 80));
    check('Der Schalter ist wirklich hinausgegangen',
      d.sent.some(x => x.method === 'PUT' && x.url === '/api/signup/toggle'),
      d.sent.slice(-2).map(x => `${x.method} ${x.url}`).join(' · '));
    await sysSection(d.w, 'personal');
    check('Danach steht dort „(erforderlich)" -- ohne Neuladen — 0.22.0',
      /\(erforderlich\)/.test(mark()), mark());
    d.w.close();
  }

  /* ---- 2. Was die Liste fordert, ist nicht, was sie nutzt ---- */
  group('So hoch wie der Inhalt — 0.17.5');

  /* WAS HIER AUSDRUECKLICH NICHT GEPRUEFT WIRD: DIE WIRKUNG. */
  {
    /* DAS RASTER STRECKT SEINE KINDER, und das ist die tragende Zusage: alle
       Kacheln einer Reihe sind gleich hoch. */
    const khGrid = regel123('.sys-grid');
    check('Das Kachelraster streckt seine Kinder wieder',
      !/align-items:/.test(khGrid), khGrid || '(keine Regel)');
    const khCard = regel123('.sys-card');
    check('Die Kachel ist eine Spalte',
      /display: flex/.test(khCard) && /flex-direction: column/.test(khCard),
      khCard || '(keine Regel)');
    /* SONST WAERE JEDER KNOPF EIN BALKEN. In einer Spalte werden die Kinder
       auf die volle Breite gezogen; die Regel daneben nimmt das zurueck. */
    check('Und ein Knopf darin bleibt so breit wie sein Wort',
      /\.sys-card > \.btn \{ align-self: flex-start; \}/.test(css123),
      (css123.match(/\.sys-card > \.btn \{[^}]*\}/) || ['(keine Regel)'])[0]);
    for (const choice of ['.manage-list', '.log-list']) {
      const rule = (withoutMedia.match(new RegExp(choice.replace(/\./g, '\\.') + ' \\{[^}]*\\}')) || [''])[0];
      check(`Die Regel fuer ${choice} steht ueberhaupt im Stilblatt`,
        rule.length > 0, '(keine Regel)');
      /* DIE LISTE IST SO HOCH WIE IHR INHALT: `flex: 0 1 auto`. */
      check(`${choice} ist so hoch wie sein Inhalt`,
        /flex: 0 1 auto/.test(rule), rule || '(keine Regel)');
      check(`${choice} haengt an keinem Schluesselwort mehr`,
        !/max-content/.test(rule), rule || '(keine Regel)');
      check(`${choice} deckelt in rem und nicht in Pixeln`,
        /max-height: [\d.]+rem/.test(rule), rule || '(keine Regel)');
      /* ZWEI ZAHLEN, UND SIE SIND KEINE ZWEITE WAHRHEIT UEBER DIESELBE SACHE:
         27,95rem sind ZEHN `.mrow` zu 41,92 px, 35rem sind FUENFZEHN
         `.log-row` zu 35 px. */
      check(`${choice} deckelt bei seinem eigenen Mass`,
        new RegExp('max-height: ' + ({ '.manage-list': '27\\.95', '.log-list': '35' })[choice] + 'rem').test(rule),
        rule || '(keine Regel)');
      /* DIE ZEILE, AN DER ES SONST SCHEITERT: ohne sie waechst ein Flexkind
         ueber seinen Anteil hinaus, statt zu rollen. */
      check(`${choice} darf dafuer unter seinen Inhalt schrumpfen`,
        /min-height: 0/.test(rule), rule || '(keine Regel)');
      check(`${choice} rollt weiterhin in sich`,
        /overflow-y: auto/.test(rule), rule || '(keine Regel)');
    }
    /* ---- DIE LEERE LISTE IST EINE ZEILE HOCH — 0.17.4 ---- Sie faellt nicht
       auf null zusammen, und sie sagt, dass nichts da ist. */
    const khEmpty = (withoutMedia.match(/\.manage-list > \.hint, \.log-list > \.hint \{[^}]*\}/) || [''])[0];
    check('Die Meldung einer leeren Liste steht auf der Hoehe einer Zeile',
      /display: flex/.test(khEmpty) && /align-items: center/.test(khEmpty),
      khEmpty || '(keine Regel)');
    /* `margin: 0` IST KEINE KOSMETIK, SONDERN DER GEMESSENE FEHLER. */
    check('Und sie traegt die Vorgabemarge ihres Absatzes nicht mit',
      /margin: 0/.test(khEmpty), khEmpty || '(keine Regel)');
    /* ZWEI ZEILENMASSE, WEIL ES ZWEI ZEILEN SIND -- dieselbe Unterscheidung
       wie beim Deckel darueber. */
    /* DIE EIGENE REGEL UND NICHT DIE SAMMELREGEL DARUEBER. */
    const ownRule = (selector) =>
      (withoutMedia.match(new RegExp('\\} (' + selector + ' \\{[^}]*\\})')) || ['', ''])[1];
    const khEmptyOperate = ownRule('\\.manage-list > \\.hint');
    const khEmptyText = ownRule('\\.log-list > \\.hint');
    /* ZWEI ZEILEN UND NICHT EINE -- SEIT 0.18.1. */
    check('Eine leere Bedienliste faellt nicht auf null zusammen',
      /min-height: 5\.59rem/.test(khEmptyOperate) && /padding: 0 9px/.test(khEmptyOperate),
      khEmptyOperate || '(keine Regel)');
    check('Und ein leeres Protokoll ebenso wenig, nach seinem eigenen Mass',
      /min-height: 4\.666rem/.test(khEmptyText) && /padding: 0 2px/.test(khEmptyText),
      khEmptyText || '(keine Regel)');
    /* ---- DIE SITZUNGSLISTE DECKELT NACH IHRER EIGENEN ZEILE — 0.18.1 ----
       KEINE DRITTE REGEL, SONDERN DIESELBE: zehn Zeilen, gemessen an der
       Zeile, die DIESE Liste wirklich hat. */
    const khSitz = (withoutMedia.match(/#msessions \{[^}]*\}/) || [''])[0];
    check('Die Sitzungsliste deckelt nach ihrer eigenen Zeile',
      /max-height: 48\.37rem/.test(khSitz), khSitz || '(keine Regel)');
    /* UND SIE RECHNET DIE FUSSZEILE NICHT MEHR MIT. */
    check('Und rechnet die Fusszeile nicht mehr mit',
      !/max-height: 55\.23rem/.test(khSitz), khSitz || '(keine Regel)');
    /* ---- BEFUND 4 DER RUNDE 0.26.0 -- DIE TOTE REGEL IST WEG --------------
       Sie verband `.calc-sum` mit `:first-of-type` und gab den Spans einen
       `border-top`. */
    check('Die tote Regel am Erklaerkasten steht nirgends mehr im Stilblatt',
      !/\.calc-sum:first-of-type/.test(withoutMedia),
      (withoutMedia.match(/^.*calc-sum:first-of-type.*$/m) || ['(steht nicht mehr da)'])[0]);
    /* UND DER STRICH IST NICHT EINFACH VERSCHWUNDEN: er kommt jetzt aus der
       letzten Kriterienzeile, die ihn ohnehin zieht -- EIN Strich statt
       zweier. */
    check('Und der Strich vor den Summen kommt aus der letzten Kriterienzeile',
      /\.calc-last > span \{ border-bottom-color: var\(--line\); \}/.test(withoutMedia),
      (withoutMedia.match(/^.*calc-last.*$/m) || ['(keine Regel)'])[0]);
    /* ---- BEFUND 5 -- DER HINWEIS AN DER ZEITLEISTE ------------------------
       Er steht mittig ueber seinem Punkt (`translateX(-50%)`) und trug
       `white-space: nowrap`: ein langer Eintragstitel machte ihn beliebig
       breit, und am rechten Ende der Achse ragte er hinaus. */
    const khHint = (withoutMedia.match(/\.timeline-hint \{[^}]*\}/) || [''])[0];
    check('Der Hinweis an der Zeitleiste bricht um', !/nowrap/.test(khHint),
      khHint || '(keine Regel)');
    check('Und er ist an beiden Massen gedeckelt',
      /max-width: min\(14rem, 46%\)/.test(khHint) && /overflow-wrap: anywhere/.test(khHint),
      khHint || '(keine Regel)');
    /* UND SIE SAGT NICHTS ZWEIMAL: alles andere -- die Forderung, das
       Schrumpfen, das Rollen -- steht in der Grundregel und gilt weiter. */
    check('Und wiederholt die Grundregel nicht',
      !/flex:/.test(khSitz) && !/overflow/.test(khSitz), khSitz || '(keine Regel)');
    /* ---- IN EINEM WINDOW GILT DER DECKEL NICHT — 0.17.4 ---- Glockentafel
       und Grabsteine tragen dieselbe Klasse, stehen aber in einem `.modal`. */
    const khDialog = (withoutMedia.match(/\.modal \.manage-list \{[^}]*\}/) || [''])[0];
    check('In einem Fenster traegt die Liste keinen Deckel',
      /max-height: none/.test(khDialog), khDialog || '(keine Regel)');
    /* UND SIE SAGT NICHTS ZWEIMAL. */
    check('Und wiederholt die Grundregel nicht',
      !/flex:/.test(khDialog), khDialog || '(keine Regel)');
    /* DIE AUSNAHME STEHT ALS REGEL DA UND IST GENAU EINE. */
    check('Die eine Ausnahme traegt ihre Deckelung ausdruecklich',
      /#ex-part-list \{ flex: none; max-height: 280px; \}/.test(withoutMedia),
      (withoutMedia.match(/#ex-part-list \{[^}]*\}/) || ['(keine Regel)'])[0]);
    check('Und der Grund dafuer steht im Stilblatt daneben',
      /Teileliste des Exports/.test(fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')),
      'kein Satz daneben');
    /* ---- DAS RASTER DES PROTOKOLLS GEHOERT DER LISTE — 0.17.5 ---- BIS
       0.17.4 WAR JEDE ZEILE IHR EIGENES RASTER. */
    const khProtList = (withoutMedia.match(/\.log-list \{[^}]*\}/) || [''])[0];
    check('Die Spalten des Protokolls gehoeren der Liste',
      /display: grid/.test(khProtList) && /grid-template-columns:/.test(khProtList),
      khProtList || '(keine Regel)');
    const khProtRow = (withoutMedia.match(/\.log-row \{[^}]*\}/) || [''])[0];
    check('Und die Zeile setzt ihre Felder direkt hinein',
      /display: contents/.test(khProtRow), khProtRow || '(keine Regel)');
    /* EINE ZEILE OHNE EIGENEN KASTEN KANN KEINE LINIE TRAGEN -- die
       Trennlinie sitzt deshalb an den Feldern. */
    const khProtField = (withoutMedia.match(/\.log-row > \* \{[^}]*\}/) || [''])[0];
    check('Die Trennlinie sitzt an den Feldern',
      /border-bottom: 1px solid var\(--line\)/.test(khProtField), khProtField || '(keine Regel)');
    check('Und sie reisst nicht ab',
      /align-self: end/.test(khProtField) && !/column-gap/.test(khProtList) &&
      !/ gap:/.test(khProtList), `${khProtField} || ${khProtList}`);
    /* AUF DEM SCHMALEN SCHIRM TRAEGT DIE ZEILE IHR RASTER WIEDER SELBST. */
    check('Auf dem schmalen Schirm traegt die Zeile ihr Raster wieder selbst',
      /\.log-list \{ display: block; \}/.test(css123) &&
      /\.log-row \{ display: grid; grid-template-columns: 1fr auto;/.test(css123),
      (css123.match(/\.log-list \{ display: block; \}[\s\S]{0,120}/) || ['(keine Regel)'])[0]);
    /* AUF DEM TELEFON BLEIBT DIE DECKELUNG, und sie ist keine feste Hoehe:
       sie misst das Fenster. */
    /* AUF DEM TELEFON IST DER DECKEL WIEDER EINE GRENZE. */
    check('Auf dem Telefon bleibt die Deckelung am Fenster haengen',
      /\.manage-list, \.log-list, \.test-scroll, \.atext, #ex-part-list \{ flex: 0 1 auto; max-height: 62vh; max-height: 62dvh; \}/.test(css123),
      (css123.match(/\.manage-list, \.log-list[^}]*\}/) || ['(keine Regel)'])[0]);
    /* UND DIE AUSNAHME STEHT DORT MIT DRIN. */
  }
  {
    /* UND DIE ZEILEN WERDEN WIRKLICH ALLE GEZEICHNET. */
    const khSessions = Array.from({ length: 10 }, (_, n) => ({
      id: String.fromCharCode(97 + n).repeat(64),
      loggedInAt: '2026-08-20 08:00:00', lastSeen: '2026-08-24 07:30:00',
      current: n === 0 }));
    const d = buildDom(JSDOM, { sessionsInventory: khSessions,
      settings: { filters: null, userCount: 4, isAdmin: true, isOwner: true } });
    await new Promise(r => setTimeout(r, 60));
    await sysSection(d.w, 'personal');
    const rowList = [...d.w.document.querySelectorAll('#msessions .mrow.session')];
    check('Zehn Anmeldungen ergeben zehn gezeichnete Zeilen',
      rowList.length === 10, `${rowList.length}`);
    check('Und genau eine davon ist die eigene',
      rowList.filter(r => r.classList.contains('session-mine')).length === 1,
      `${rowList.filter(r => r.classList.contains('session-mine')).length}`);
    d.w.close();
  }

  /* ---- 3. Der Mailversand: die Karte zeigt, der Dialog stellt ein ---- */
  group('Der Mailversand im Stilblatt — 0.17.3');

  {
    /* DAS STILBLATT ZUM DIALOG. Drei Zeilen, und jede beantwortet eine Frage,
       die jsdom nicht beantworten kann. */
    check('Der Dialog traegt seine eigene Breite',
      /\.mail-dialog \{ max-width: 520px; \}/.test(css123),
      (css123.match(/\.mail-dialog \{[^}]*\}/) || ['(keine Regel)'])[0]);
    check('Und die Felder darin tragen keinen zweiten Abstand',
      /\.mail-dialog \.field \{ margin-bottom: 0; \}/.test(css123),
      (css123.match(/\.mail-dialog \.field \{[^}]*\}/) || ['(keine Regel)'])[0]);
    check('Der Hinweis rueckt an die Sache heran, die er erklaert',
      /margin: -7px 0 0/.test(regel123('.mail-hint')),
      regel123('.mail-hint') || '(keine Regel)');
    check('Und die gelesene Zeile steht in der Monoschrift',
      /font-family: var\(--mono\)/.test(regel123('.mail-fixed')),
      regel123('.mail-fixed') || '(keine Regel)');
    /* DIE SECHS REGELN DER VIER REIHEN SIND WEG, und das gehoert ausdruecklich
       geprueft: eine Regel ohne Waehler im Markup faellt niemandem auf. */
    const mdOld = ['.mail-reihe', '.mail-wer', '.mail-wohin', '.mail-womit', '.mail-satz']
      .filter(w => regel123(w));
    check('Und keine der Regeln fuer die vier Reihen steht noch im Stilblatt',
      mdOld.length === 0, mdOld.join(' · '));
    check('Auch nicht die gemeinsame von ALS WER und TUN',
      !/\.mail-alswer/.test(css123), (css123.match(/\.mail-alswer[^}]*\}/) || [''])[0]);
  }

  /* WOZU DIESE GRUPPE HIER STEHT UND NICHT OBEN BEI DEN ANDEREN
     MAILPRUEFUNGEN: `css123` wird in dieser Funktion erst weiter unten
     gelesen, und ein Griff davor ist eine tote Zone -- der Lauf reisst dann
     ab, statt rot zu werden. */

  /* ---- 4. Der fuenfte Abschnitt und sein Name ---- */
  group('Der fuenfte Abschnitt heisst „Installation" — 0.17.1, 0.19.1 und 0.19.2');

  /* EIN WORT UND KEINE FUNKTION -- zweimal inzwischen. */
  for (const oldAddress of ['anlage', 'instanz', 'scheune']) {
    const d = buildDom(JSDOM,
      { settings: { filters: null, userCount: 4, isAdmin: true, isOwner: true } });
    await new Promise(r => setTimeout(r, 60));
    d.w.history.replaceState(null, '', `#/system/${oldAddress}`);
    await d.w.renderSystem();
    await new Promise(r => setTimeout(r, 40));
    /* ALLE DREI NEHMEN DENSELBEN WEG -- die beiden alten Namen sind nichts
       Besonderes mehr. */
    check(`„${oldAddress}" faellt auf den ersten sichtbaren Abschnitt zurueck`,
      d.w.location.hash === '#/system/personal', d.w.location.hash);
    d.w.close();
  }
  {
    const source = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    /* DIE TAFEL IST WEG, UND ZWAR GANZ -- kein Rest, der beim naechsten Lesen
       wie ein vergessener Zweig aussieht. */
    check('Die Tafel der alten Abschnittsadressen gibt es nicht mehr',
      !/const SYS_ALTE_ABSCHNITTE/.test(source),
      (source.match(/const SYS_ALTE_ABSCHNITTE[^\n]*/) || ['(keine Tafel — richtig)'])[0]);
    /* UND DER GRUND STEHT DA. */
    check('Und der Grund fuer den Abbau steht im Quelltext daneben',
      /UEBERSETZUNG ALTER ABSCHNITTSADRESSEN IST IN 0\.19\.2 ABGEBAUT WORDEN/.test(source),
      'die Begruendung fehlt');
    /* DER RUECKFALL SELBST IST EINE ZEILE OHNE TAFEL. */
    check('Und die Adresse wird ohne Umweg gelesen',
      /const desired = fromAddress;/.test(source),
      (source.match(/const desired = [^\n]*/) || ['(nicht gefunden)'])[0]);
  }
  {
    /* DER WAECHTER UEBER DAS WORT SELBST. */
    const shipped = ['public/app.js', 'public/style.css', 'public/index.html',
                          'server.js', 'auth.js', 'db.js', 'usertool.js', 'mail.js',
                          'keys.js', 'keytool.js', 'twofactor.js'];
    /* WAS STEHENBLEIBEN DARF, STEHT MIT SEINER ZAHL DA und nicht als blosse
       Erlaubnis: verglichen wird die ganze Liste. */
    /* SEIT 0.34.1 NUR NOCH EINE: die vier Vorkommen in public/app.js standen
       in Kommentaren, die diese Runde gekuerzt hat. Uebrig ist die Stelle in
       server.js, an der das Wort Teil eines Bezeichners ist. */
    const ALLOWED = {
      'server.js': ['Anlagenbytes']
    };
    const found = {};
    for (const file of shipped)
      found[file] = fs.readFileSync(path.join(__dirname, ...file.split('/')), 'utf8')
        .match(/[A-Za-zÄÖÜäöüß]*[Aa]nlage[A-Za-zÄÖÜäöüß]*/g) || [];
    const left = shipped.filter(d => !equal(found[d], ALLOWED[d] || []));
    check('Das Wort „Anlage" steht nur noch, wo es ausdruecklich stehenbleibt',
      left.length === 0,
      left.map(d => `${d}: ${found[d].join(', ')}`).join(' · '));
    /* UND DIE ERLAUBNIS IST KEINE LEERE HUELSE: die Ausnahme steht wirklich
       noch da, und public/app.js traegt keine mehr. */
    check('Und die eine Ausnahme zeigt wirklich auf etwas',
      found['server.js'].length === 1 && found['public/app.js'].length === 0,
      `${found['server.js'].length} / ${found['public/app.js'].length}`);
    /* ZEHN VON ELF DATEIEN TRAGEN DAS WORT GAR NICHT MEHR. */
    check('Und zehn der elf ausgelieferten Dateien kennen es gar nicht mehr',
      shipped.filter(d => found[d].length === 0).length === 10,
      `${shipped.filter(d => found[d].length === 0).length}`);
    check('In attachments.js meint jede der drei Stellen einen Anhang',
      (fs.readFileSync(path.join(__dirname, 'attachments.js'), 'utf8').match(/[Aa]nlage/g) || []).length === 3,
      `${(fs.readFileSync(path.join(__dirname, 'attachments.js'), 'utf8').match(/[Aa]nlage/g) || []).length}`);
  }

  /* ---- 4a. Und das Wort selbst steht in keinem Bildschirmtext mehr ---- */
  group('„Instanz" steht in keinem Bildschirmtext mehr — 0.19.1 und 0.19.3');

  /* 0.19.1 HAT SIEBZEHN STELLEN UMBENANNT, 0.19.3 DIE LETZTEN ACHT. */
  {
    const withoutEveryComment = (text) => {
      let inBlock = false;
      return text.split('\n').map(z => {
        if (z.trim().startsWith('//')) return '';
        let outcome = '', rest = z;
        while (rest.length) {
          if (inBlock) {
            const e = rest.indexOf('*/');
            if (e < 0) { rest = ''; break; }
            inBlock = false; rest = rest.slice(e + 2);
          } else {
            const a = rest.indexOf('/*');
            if (a < 0) { outcome += rest; break; }
            outcome += rest.slice(0, a); inBlock = true; rest = rest.slice(a + 2);
          }
        }
        return outcome;
      }).join('\n');
    };
    const screenRows = (file) => withoutEveryComment(
      fs.readFileSync(path.join(__dirname, ...file.split('/')), 'utf8'))
      .split('\n').map((z, i) => [i + 1, z]).filter(([, z]) => z.includes('Instanz'));

    const iApp = screenRows('public/app.js');
    check('In public/app.js steht das Wort in keiner Nicht-Kommentarzeile mehr',
      iApp.length === 0, iApp.map(([n, z]) => `${n}: ${z.trim()}`).join(' · '));
    /* UND SEIT 0.24.0 IN DER SPRACHDATEI -- dort wohnt der Bildschirmtext. */
    const iDe = Object.entries(JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8')))
      .flatMap(([k, v]) => (typeof v === 'string' ? [v] : Object.values(v)).map(w => [k, w]))
      .filter(([, w]) => w.includes('Instanz'));
    check('Und in der Sprachdatei steht es in keinem einzigen Satz',
      iDe.length === 0, iDe.map(([k]) => k).join(' · '));
    /* ERST DER WAECHTER, DANN SEIN BEFUND: ein Zaehler, der
       nichts findet, weil er nichts liest, ist gruen und belegt nichts. */
    check('Und der Waechter wuerde eine solche Zeile wirklich finden',
      withoutEveryComment("  const t = 'die Instanz sagt es';").includes('Instanz'),
      'der Waechter sieht die Zeile nicht');
    check('Aber einen Kommentar mitten in einem Vorlagen-String laesst er stehen',
      !withoutEveryComment("      ${/* die Instanz meint es anders */''}").includes('Instanz'),
      'der Waechter haelt den Kommentar fuer Bildschirmtext');
    /* UND DIE KOMMENTARE TRAGEN DAS WORT WEITER. */
    const iAppRaw = (fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8')
      .match(/Instanz/g) || []).length;
    /* SIEBEN SEIT 0.37.0, vorher 8 und davor 39: die uebrigen standen in
       Kommentaren, die eine Runde gekuerzt hat. Die Zahl steht im Namen der
       Pruefung -- sie ist die eine Zahl dieser Gruppe, die eine Kuerzung
       bewegt. */
    check('In den Kommentaren derselben Datei stehen unveraendert 7 Vorkommen',
      iAppRaw === 7, `${iAppRaw} Vorkommen`);

    /* UND IN server.js BLEIBT SEIT 0.33.0 KEINE EINZIGE MEHR. */
    const iServer = screenRows('server.js');
    check('In server.js bleibt keine Zeile mehr — auch die des Betreibers nicht',
      iServer.length === 0,
      iServer.map(([n, z]) => `${n}: ${z.trim()}`).join(' · ') || 'keine');
  }

  /* ---- 5. Die Zeile einer Sitzung steht gerade ---- */
  group('Die Zeitangaben stehen untereinander — 0.17.1');

  /* DER BEFUND WAR DIE SCHIEFE ZEILE: „angemeldet" und „zuletzt gesehen"
     nebeneinander, unterschiedlich lang. */
  {
    const time = (withoutMedia.match(/\.mrow\.session \.session-time \{[^}]*\}/g) || []);
    check('Es gibt ueberhaupt Regeln fuer die Zeitangaben', time.length > 0, '(keine Regel)');
    const zAll = time.join(' ');
    check('Beide Zeitangaben stehen ueber die ganze Breite, also untereinander',
      /grid-column: 1 \/ -1/.test(zAll), zAll || '(keine Regel)');
    check('Und sie stehen rechtsbuendig',
      /justify-self: end/.test(zAll) && /text-align: right/.test(zAll), zAll || '(keine Regel)');
    check('Ein Zeitstempel bricht dabei nicht um',
      /white-space: nowrap/.test(zAll), zAll || '(keine Regel)');
    /* UND DARUEBER STEHT DER NAME IN SEINER EIGENEN REIHE. */
    const name = (withoutMedia.match(/\.mrow\.session \.mname \{[^}]*\}/) || [''])[0];
    check('Darueber steht der Name in seiner eigenen Reihe',
      /grid-column: 1;/.test(name) && /grid-row: 1;/.test(name), name || '(keine Regel)');
    /* UND DAS RASTER HAT DAFUER NUR NOCH ZWEI SPALTEN -- Name und Kreuz. Eine
       dritte gaebe es, wenn die Zeiten wieder daneben stuenden. */
    check('Und das Raster traegt nur noch zwei Spalten',
      /grid-template-columns: minmax\(0, 1fr\) auto;/.test(
        (withoutMedia.match(/\.mrow\.session \{[^}]*\}/) || [''])[0]),
      (withoutMedia.match(/\.mrow\.session \{[^}]*\}/) || ['(keine Regel)'])[0]);
    /* DER ORANGENE RAHMEN DER EIGENEN ANMELDUNG BLEIBT -- Punkt 4b von
       0.17.0 darf nicht zurueckfallen. */
    check('Und der Rahmen der eigenen Anmeldung steht unveraendert da',
      /\.mrow\.session-mine \{ border-color: var\(--accent\); \}/.test(withoutMedia),
      (withoutMedia.match(/\.mrow\.session-mine \{[^}]*\}/) || ['(keine Regel)'])[0]);
  }

  /* ---- 6. Genau ein Abspieler laeuft ---- */
  group('Genau ein Abspieler laeuft — 0.17.1');

  /* DER EINZIGE ECHTE FEHLER DIESER RUNDE. */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1' });
    await new Promise(r => setTimeout(r, 90));
    const doc = d.w.document;
    const clickable = (el) => el?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    const includingSource = () => [...doc.querySelectorAll('video')].filter(v => v.getAttribute('src'));
    const viewer = doc.getElementById('viewer');
    clickable(viewer?.querySelector('.vnav.next'));
    await new Promise(r => setTimeout(r, 30));
    const inside = viewer?.querySelector('video');
    check('Am Videoplatz steht ein Abspieler mit seiner Quelle',
      inside?.getAttribute('src') === '/api/photos/6/raw', inside?.getAttribute('src'));
    check('Und vor dem Vollbild ist er der einzige', includingSource().length === 1,
      `${includingSource().length}`);
    inside.currentTime = 12.5;

    clickable(viewer?.querySelector('.vfull'));
    await new Promise(r => setTimeout(r, 40));
    check('Im Vollbild gibt es zwei Abspielelemente',
      doc.querySelectorAll('video').length === 2, `${doc.querySelectorAll('video').length}`);
    check('Aber nur EINES traegt noch eine Quelle', includingSource().length === 1,
      includingSource().map(v => v.getAttribute('src')).join(' · '));
    /* UND ES IST DER OBERE -- gepruefte Elemente, keine Klasse: der eine ist
       nicht der innere, und er haengt im Vollbild. */
    check('Und es ist der im Vollbild, nicht der darunter',
      includingSource()[0] !== inside && doc.querySelector('.lightbox')?.contains(includingSource()[0]) === true,
      includingSource()[0] === inside ? 'der innere spielt weiter' : 'er haengt nicht im Vollbild');
    check('Der innere hat seine Quelle abgegeben',
      !inside.getAttribute('src'), inside.getAttribute('src'));
    check('Und das Vollbild hat seine Stelle uebernommen',
      includingSource()[0]?.currentTime === 12.5, `${includingSource()[0]?.currentTime}`);

    // Weitergelaufen im Vollbild, dann zu: die Stelle geht denselben Weg zurueck.
    includingSource()[0].currentTime = 20;
    clickable(doc.querySelector('.lightbox .close'));
    await new Promise(r => setTimeout(r, 40));
    check('Nach dem Schliessen traegt wieder genau einer eine Quelle',
      includingSource().length === 1 && includingSource()[0] === inside,
      `${includingSource().length} Quellen`);
    check('Und er steht an der Stelle, die das Vollbild zuletzt hatte',
      inside.currentTime === 20, `${inside.currentTime}`);

    /* ESCAPE GEHT DENSELBEN WEG WIE DAS KREUZ und nicht einen zweiten
       daneben. */
    clickable(viewer?.querySelector('.vfull'));
    await new Promise(r => setTimeout(r, 40));
    check('Beim zweiten Oeffnen gibt der innere wieder ab',
      !inside.getAttribute('src') && includingSource().length === 1, inside.getAttribute('src'));
    doc.dispatchEvent(new d.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Escape schliesst das Vollbild',
      !doc.querySelector('.lightbox'), 'das Vollbild steht noch');
    check('Und gibt die Quelle auf demselben Weg zurueck',
      includingSource().length === 1 && includingSource()[0] === inside, `${includingSource().length} Quellen`);

    /* BEIM BLAETTERN: das Anhalten gibt es schon, der Wechsel muss dazu
       passen. */
    clickable(viewer?.querySelector('.vfull'));
    await new Promise(r => setTimeout(r, 40));
    clickable(doc.querySelector('.lightbox .prev'));
    await new Promise(r => setTimeout(r, 30));
    check('Am Foto im Vollbild traegt gar kein Abspieler eine Quelle',
      includingSource().length === 0, includingSource().map(v => v.getAttribute('src')).join(' · '));
    clickable(doc.querySelector('.lightbox .close'));
    await new Promise(r => setTimeout(r, 40));
    check('Auch vom Foto aus bekommt der innere seine Quelle zurueck',
      includingSource().length === 1 && includingSource()[0] === inside, `${includingSource().length} Quellen`);
    d.w.close();
  }
  {
    /* BEIM LOESCHEN AUS DEM VOLLBILD gibt es das Video danach nicht mehr, und
       der innere Abspieler darf nicht auf eine Adresse zeigen, die weg ist. */
    const d = buildDom(JSDOM, { hash: '#/item/1' });
    await new Promise(r => setTimeout(r, 90));
    const doc = d.w.document;
    const clickable = (el) => el?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    const viewer = doc.getElementById('viewer');
    clickable(viewer?.querySelector('.vnav.next'));
    await new Promise(r => setTimeout(r, 30));
    clickable(viewer?.querySelector('.vfull'));
    await new Promise(r => setTimeout(r, 40));
    clickable(doc.querySelector('.lightbox .lb-btn.remove'));
    await new Promise(r => setTimeout(r, 40));
    clickable(doc.querySelector('.backdrop [data-yes]'));
    await new Promise(r => setTimeout(r, 120));
    check('Nach dem Loeschen ging es wirklich ueber die Route hinaus',
      d.sent.some(x => x.method === 'DELETE' && x.url === '/api/photos/6'),
      d.sent.slice(-3).map(x => `${x.method} ${x.url}`).join(' · '));
    check('Und kein Abspieler zeigt mehr auf die geloeschte Adresse',
      ![...doc.querySelectorAll('video')].some(v => v.getAttribute('src') === '/api/photos/6/raw'),
      [...doc.querySelectorAll('video')].map(v => v.getAttribute('src')).join(' · '));
    d.w.close();
  }
  {
    /* DIE SCHUTZZEILE BEIM LOESCHEN, gestellt an einem Rufer, der den
       Betrachter darunter NICHT neu zeichnet. */
    const d = buildDom(JSDOM, { hash: '#/item/1' });
    await new Promise(r => setTimeout(r, 90));
    const doc = d.w.document;
    const inside = doc.createElement('video');
    inside.setAttribute('src', '/api/photos/6/raw');
    doc.body.appendChild(inside);
    d.w.openLightbox([{ id: 6, kind: 'video', duration: 42 }], 0, 'Probe',
      async () => true, () => inside);
    await new Promise(r => setTimeout(r, 40));
    check('Auch hier gibt der innere Abspieler zuerst ab',
      !inside.getAttribute('src') && !!doc.querySelector('.lightbox'),
      inside.getAttribute('src'));
    doc.querySelector('.lightbox .lb-btn.remove')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    check('Nach dem letzten Bild geht das Vollbild zu',
      !doc.querySelector('.lightbox'), 'das Vollbild steht noch');
    check('Und die geloeschte Quelle wandert NICHT zurueck',
      !inside.getAttribute('src'), inside.getAttribute('src'));
    d.w.close();
  }
  {
    /* DIE GEGENLAGE: OHNE VIDEO VERHAELT SICH DAS VOLLBILD WIE BISHER. */
    const d = buildDom(JSDOM, { hash: '#/item/1' });
    await new Promise(r => setTimeout(r, 90));
    const doc = d.w.document;
    const viewer = doc.getElementById('viewer');
    check('Am Fotoplatz gibt es gar keinen inneren Abspieler',
      !!viewer?.querySelector('img') && !viewer.querySelector('video'),
      viewer?.innerHTML?.slice(0, 90));
    viewer?.querySelector('img')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const lbVideo = doc.querySelector('.lightbox .lb-video');
    check('Das Vollbild geht trotzdem auf', !!doc.querySelector('.lightbox'));
    check('Sein Abspieler bleibt verborgen und ohne Quelle',
      lbVideo?.hidden === true && !lbVideo?.getAttribute('src'),
      JSON.stringify({ hidden: lbVideo?.hidden, src: lbVideo?.getAttribute('src') }));
    check('Und das Bild darunter behaelt seine Quelle',
      !!viewer?.querySelector('img')?.getAttribute('src'),
      viewer?.querySelector('img')?.getAttribute('src'));
    d.w.close();
  }

  /* ---- 0.17.2, Punkt 4: die Klammer erst ab zwei Stimmen ---- */
  group('Die Klammer steht erst ab zwei Stimmen — 0.17.2');

  /* DER BEFUND: an einem Kriterium, das genau einer bewertet hat, stand „⌀
     4,0 (1)". */
  {
    /* DREI LAGEN IN EINEM AUFBAU: zwei Stimmen, eine Stimme, keine. */
    const d = buildDom(JSDOM, { hash: '#/item/1',
      settings: { filters: null, userCount: 3, isAdmin: true },
      voteColumns: [{ avg: 3.5, count: 2 }, { avg: 4, count: 1 }, { avg: null, count: 0 }] });
    await new Promise(r => setTimeout(r, 90));
    const kColumns = [...d.w.document.querySelectorAll('#ratings .rrow .ravg')];
    check('Die Prueflage traegt zwei, eine und keine Stimme',
      kColumns.length === 3, `${kColumns.length}`);
    check('Ab zwei Stimmen steht die Zahl in Klammern dahinter',
      kColumns[0]?.textContent === '⌀ 3,5 (2)', JSON.stringify(kColumns[0]?.textContent));
    check('Bei einer einzigen Stimme steht dort keine Klammer',
      kColumns[1]?.textContent === '⌀ 4,0', JSON.stringify(kColumns[1]?.textContent));
    /* AUSDRUECKLICH AUCH DIE VERNEINUNG UEBER ALLE ZEILEN: eine „(1)" darf
       nirgends stehen. */
    check('Und in keiner Zeile steht eine Klammer um eine Eins',
      !kColumns.some(z => /\(1\)/.test(z.textContent || '')),
      JSON.stringify(kColumns.map(z => z.textContent)));
    /* UMGEDREHT MIT 0.21.0, wie die beiden Schwestern in
       der Gruppe „Die Sternreihe steht auf einer Linie": bis 0.20.1 blieb die
       Zelle GANZ LEER, jetzt traegt sie einen Strich. */
    check('Ohne Stimme steht dort ein Strich und keine Klammer',
      kColumns[2]?.textContent === '–', JSON.stringify(kColumns[2]?.textContent));
    /* UND DER KLARTEXT SAGT WEITERHIN BEIDES -- in der Einzahl, wo es eine
       ist: „aus 1 Stimmen" ist der Fehler, den eine feste Endung macht. */
    check('Der Klartext nennt die eine Stimme trotzdem',
      kColumns[1]?.title === 'Durchschnitt 4,0 aus 1 Bewertung', kColumns[1]?.title);
    check('Und bei zweien steht dort die Mehrzahl',
      kColumns[0]?.title === 'Durchschnitt 3,5 aus 2 Bewertungen', kColumns[0]?.title);
    /* UMGEDREHT MIT 0.21.0: der Strich bekommt seinen
       eigenen Klartext -- „noch niemand" --, und er nennt ausdruecklich KEINE
       Stimmen. */
    check('Ein Kriterium ohne Stimme bekommt einen Klartext ohne Stimmenzahl',
      kColumns[2]?.title === 'Noch nicht bewertet' && !/aus \d/.test(kColumns[2]?.title || ''),
      kColumns[2]?.title);
    d.w.close();
  }

  /* ---- 4. Der Ruecksetzer fuer die Filterleiste ---- */
  group('Der Ruecksetzer fuer die Filterleiste — 0.17.3');

  /* DER BEFUND WAR EINE FRAGE: „fehlt das Filter-zuruecksetzen, oder finde
     ich den gerade nicht?" -- Er war nicht zu finden, weil es ihn nicht gab. */
  const frTags = [{ id: 41, name: 'Alu', usage_count: 3, test_usage_count: 0 },
                  { id: 42, name: 'Stahl', usage_count: 2, test_usage_count: 0 }];
  const frButton = (w) => w.document.getElementById('filter-reset');
  {
    /* OHNE EINEN EINZIGEN FILTER steht er nicht da -- und die Leiste steht
       trotzdem, sonst belegte die Verneinung nichts. */
    const d = buildDom(JSDOM, { tags: frTags, settings: { filters: null } });
    await new Promise(r => setTimeout(r, 80));
    check('Die Filterleiste steht da',
      !!d.w.document.querySelector('#filters .frow'), 'keine Leiste');
    check('Ohne gesetzten Filter steht kein Ruecksetzer da',
      !frButton(d.w), frButton(d.w)?.textContent);
    d.w.close();
  }
  {
    /* VIER FILTER IN EINER LAGE, und jeder zaehlt anders: der Teststatus
       einzeln, die Kategorien als EINER (sie vergroessern die Menge), die
       beiden Tags EINZELN (jeder verkleinert sie). */
    const d = buildDom(JSDOM, { tags: frTags,
      settings: { filters: { categoryIds: [21, 22], tagIds: [41, 42], tagMode: 'and',
                                  tested: 'tested', rejected: 'all', favorite: false,
                                  sort: 'title_asc' } } });
    await new Promise(r => setTimeout(r, 80));
    const button = frButton(d.w);
    check('Mit gesetzten Filtern steht der Ruecksetzer da', !!button, 'kein Knopf');
    check('Und er nennt die Zahl',
      button?.textContent === 'Filter zurücksetzen (4)', JSON.stringify(button?.textContent));
    /* DIE ZAHL KOMMT AUS filterZahl() UND AUS NICHTS ANDEREM. */
    const switches = d.w.document.querySelector('#filter-toggle .fcount')?.textContent || '';
    check('Und es ist dieselbe Zahl, die auch der Schalter nennt',
      switches === '· 4 aktiv', JSON.stringify(switches));
    /* ER STEHT IN DER SORTIERZEILE, neben „+ Ansicht speichern" -- dort, wo er
       gesucht wurde, und nicht in einer eigenen Zeile darunter. */
    const row = button?.closest('.frow');
    check('Er steht in der Sortierzeile',
      !!row?.querySelector('#f-sort') && !!row?.querySelector('#view-save'),
      row ? [...row.querySelectorAll('.eyebrow')].map(e => e.textContent).join('+') : 'in keiner Zeile');
    check('Und rechts in ihr',
      button?.parentElement?.classList.contains('frow-right-wide'),
      button?.parentElement?.className);
    /* DAS STILBLATT SCHIEBT IHN AN DEN RAND -- ohne ausgerechnete Breite. */
    check('Das Stilblatt schiebt ihn an den rechten Rand',
      /margin-left: auto/.test(regel123('.frow-right-wide')),
      regel123('.frow-right-wide') || '(keine Regel)');

    /* ---- UND JETZT DER KLICK ---- EIN SUCHBEGRIFF STEHT DABEI WIRKLICH IM
       FELD und nicht bloss im Zustand: nur dann belegt die Zeile unten etwas. */
    const beforeSort = d.w.document.getElementById('f-sort')?.value;
    const searchField = d.w.document.getElementById('q');
    searchField.value = 'schraube';
    searchField.dispatchEvent(new d.w.Event('input'));
    await waitSearch(d.w);
    /* GEZAEHLT WIRD, WAS NACH DEM KLICK HINAUSGEHT und nicht, was beim Aufbau
       schon lief -- sonst pruefte die Verneinung unten den Seitenaufbau mit. */
    const vorDemClickable = d.sent.length;
    // MIT `?.`: ob der Knopf dasteht, hat die Zeile oben schon gefragt
// -- an einer Null soll der Lauf nicht abreissen.
    button?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 80));
    const after = d.sent.slice(vorDemClickable);
    /* GELESEN WIRD DIE STELLUNG DORT, WO SIE HINAUSGEHT -- im Rumpf des
       letzten PUT. */
    const put = after.filter(x => x.method === 'PUT' && x.url === '/api/settings');
    const now = put[put.length - 1]?.body?.filters || {};
    check('Danach ist der Teststatus zurueckgesetzt', now.tested === 'all', String(now.tested));
    check('Und die Kategorien sind leer',
      Array.isArray(now.categoryIds) && now.categoryIds.length === 0,
      JSON.stringify(now.categoryIds));
    check('Und die Tags ebenso',
      Array.isArray(now.tagIds) && now.tagIds.length === 0, JSON.stringify(now.tagIds));
    check('Auch die uebrigen Merkmale stehen wieder auf der Vorgabe',
      now.rejected === 'all' && now.favorite === false && now.tagMode === 'and',
      JSON.stringify(now));
    // UND DIE LEISTE ZEIGT ES AUCH: die Pille „Alles anzeigen" steht wieder an.
    const everythingPill = [...d.w.document.querySelectorAll('#filters .pill')]
      .find(b => b.textContent.trim() === 'Alle');
    check('Und die Leiste zeigt es',
      everythingPill?.classList.contains('on'), everythingPill?.className);
    /* DIE SORTIERUNG BLEIBT STEHEN, obwohl sie in FILTER_VORGABE steht: sie
       wird auch nicht mitgezaehlt. */
    check('Die Sortierung bleibt, wo sie war',
      now.sort === 'title_asc' && d.w.document.getElementById('f-sort')?.value === beforeSort,
      `${now.sort} · Feld ${d.w.document.getElementById('f-sort')?.value}`);
    // UND DIE SUCHE EBENSO -- sie hat ihr eigenes Kreuz im Suchfeld.
    check('Der Suchbegriff bleibt ebenfalls stehen',
      d.w.document.getElementById('q')?.value === 'schraube',
      JSON.stringify(d.w.document.getElementById('q')?.value));
    /* DER FILTERSTAND FAEHRT WIE IMMER UEBER PUT /api/settings hinaus -- keine
       neue Route, dieselbe, die jeder Klick auf eine Pille schon benutzt. */
    check('Der neue Stand geht ueber die vorhandene Route hinaus',
      put.length > 0, `${put.length} Schreibvorgaenge`);
    check('Und keine andere Route wird dafuer geschrieben',
      !after.some(x => x.method !== 'GET' && x.url !== '/api/settings'),
      after.filter(x => x.method !== 'GET').map(x => `${x.method} ${x.url}`).join(' · ') || '(keine)');
    // EIN KNOPF, DER NICHTS MEHR ZU TUN HAT, STEHT NICHT MEHR DA.
    check('Und danach ist der Ruecksetzer selbst wieder weg',
      !frButton(d.w), frButton(d.w)?.textContent);
    d.w.close();
  }
  {
    /* EINE GESPEICHERTE ANSICHT WIRD NICHT ANGETASTET. Zuruecksetzen heisst
       „zeig mir alles", nicht „vergiss, was ich mir gemerkt habe". */
    const d = buildDom(JSDOM, { tags: frTags,
      settings: { views: [{ name: 'Meine Sicht', q: 'eins', filters: { tested: 'tested' } }],
                       filters: { categoryIds: [], tagIds: [41], tagMode: 'and',
                                  tested: 'all', rejected: 'all', favorite: false,
                                  sort: 'updated_desc' } } });
    await new Promise(r => setTimeout(r, 80));
    const pills = () => [...d.w.document.querySelectorAll('#filters .pill')]
      .map(b => b.textContent.replace('✕', '').trim());
    check('Die gespeicherte Ansicht steht in der Leiste',
      pills().includes('Meine Sicht'), JSON.stringify(pills()));
    check('Bei einem einzigen Tag nennt der Knopf die Eins',
      frButton(d.w)?.textContent === 'Filter zurücksetzen (1)',
      JSON.stringify(frButton(d.w)?.textContent));
    const anBefore = d.sent.length;
    /* MIT `?.`: zaehlt ein Rueckbau den einen Tag nicht mehr mit, steht kein
       Knopf da -- dann bleibt die Zeile darueber rot, statt dass der Lauf an
       einer Null abreisst. */
    frButton(d.w)?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 80));
    check('Nach dem Zuruecksetzen steht sie immer noch da',
      pills().includes('Meine Sicht'), JSON.stringify(pills()));
    check('Und sie ist dabei nicht neu geschrieben worden',
      !d.sent.slice(anBefore).some(x => x.body && 'views' in x.body),
      d.sent.slice(anBefore).map(x => `${x.method} ${Object.keys(x.body || {}).join('+')}`).join(' · ') || '(nichts)');
    d.w.close();
  }

  /* ========= Die Sortierung gibt den Status NICHT mehr vor — 0.32.1 ======
     0.21.1 HAT SIE GEBAUT, 0.32.1 BAUT SIE AUS -- auf Entscheidung des
     Betreibers, und der Grund ist eine Sackgasse: „Filter zuruecksetzen"
     holte die Ableitung zurueck, die Liste blieb gefiltert, und der
     Ruecksetzer verschwand dabei selbst. */
  group('Die Sortierung gibt den Status NICHT mehr vor — 0.32.1');

  /* DER BEFUND: eine Sortierung beantwortet eine Frage, aber die Liste zeigte
     nicht die Menge, in der diese Frage sich stellt. */
  const ksInventory = [
    { id: 1, title: 'Geprüft gut', rejected: false, tested: true, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 5, potentialRating: 2,
      testCount: null, testAvg: null, testLast: null, testDays: [], updated_at: '2026-08-01 10:00:00' },
    { id: 2, title: 'Geprüft mau', rejected: false, tested: true, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 2, potentialRating: 1,
      testCount: null, testAvg: null, testLast: null, testDays: [], updated_at: '2026-08-02 10:00:00' },
    { id: 3, title: 'Idee stark', rejected: false, tested: false, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null, potentialRating: 5,
      testCount: null, testAvg: null, testLast: null, testDays: [], updated_at: '2026-08-03 10:00:00' },
    { id: 4, title: 'Idee schwach', rejected: false, tested: false, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null, potentialRating: 1,
      testCount: null, testAvg: null, testLast: null, testDays: [], updated_at: '2026-08-04 10:00:00' }
  ];
  // ALPHABETISCH, weil ksTitle() sortiert: verglichen wird die MENGE und
  // nicht die Reihenfolge -- die Reihenfolge ist Sache der Sortierpruefungen,
  // und ein Vergleich, der beides zugleich fragt, sagt bei Rot nicht, welches
  // gemeint ist.
  const ksAll = ['Geprüft gut', 'Geprüft mau', 'Idee schwach', 'Idee stark'];
  const ksTitle = (d) => [...d.w.document.querySelectorAll('.card .card-title')]
    .map(e => e.textContent).sort();
  // `const state` haengt nicht am Fenster: jede Lage bekommt ihr eigenes DOM
// mit gespeicherter Stellung -- der echte Weg, wie bei den Favoriten.
  const ksBuild = async (filters, further = {}) => {
    const d = buildDom(JSDOM, { overviewItems: ksInventory,
      settings: { filters, ...further } });
    await new Promise(r => setTimeout(r, 90));
    return d;
  };
  const ksPill = (d, text) => [...d.w.document.querySelectorAll('#filters .pill')]
    .find(b => b.textContent.trim() === text);
  /* NEUE BEDIENELEMENTE WERDEN PER dispatchEvent GEDRUECKT -- .click() genuegt
     nicht, und der Ereignisdurchlauf gehoert dazu. */
  const ksClickable = async (d, el) => {
    el?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
  };
  // Die Sortierung wird ueber ihr eigenes Bedienelement gestellt und nicht
// ueber eine zweite gebaute Lage: nur so ist der WECHSEL geprueft.
  /* MITGEZOGEN MIT 0.28.1: eine Sortierung wird seit
     dieser Runde an ZWEI Bedienelementen eingestellt -- die Grundlage im
     Auswahlfeld, die Richtung am Umschalter daneben. */
  const ksSort = async (d, value) => {
    const sel = d.w.document.getElementById('f-sort');
    if (!sel) return false;
    sel.value = String(value).replace(/_(desc|asc)$/, '');
    sel.onchange();
    await new Promise(r => setTimeout(r, 50));
    if (String(value).endsWith('_asc')) {
      const dir = d.w.document.getElementById('f-sort-dir');
      if (dir && !dir.disabled) { dir.click(); await new Promise(r => setTimeout(r, 50)); }
    }
    return true;
  };
  /* WAS DIE LEISTE GERADE ANZEIGT, an BEIDEN Stellen und als EIN Satz. */
  const ksShown = (d) => `${d.w.document.getElementById('f-sort')?.value}`
    + ` · ${d.w.document.getElementById('f-sort-dir')?.textContent}`;
  const ksSetting = (d, start = 0) => {
    const put = d.sent.slice(start).filter(x => x.method === 'PUT' && x.url === '/api/settings');
    return put[put.length - 1]?.body?.filters || null;
  };
  const ksDefault = { categoryIds: [], tagIds: [], tagMode: 'and', tested: 'all',
                      rejected: 'all', favorite: false, sort: 'updated_desc' };

  /* ---- 1. DIE SORTIERUNG FILTERT NICHT MEHR ---- */
  {
    const d = await ksBuild({ ...ksDefault, sort: 'potential_desc' });
    check('Nach Potenzial absteigend stehen alle vier Eintraege da — 0.32.1',
      equal(ksTitle(d), ksAll), JSON.stringify(ksTitle(d)));
    check('Und genau die Pille „Alle" ist markiert, keine andere',
      ksPill(d, 'Alle')?.classList.contains('on') === true
      && ![...d.w.document.querySelectorAll('#filters .pill.on')]
           .some(b => b.textContent.trim() === 'Ungetestet'),
      [...d.w.document.querySelectorAll('#filters .pill.on')].map(b => b.textContent).join(' '));
    /* KEINE PILLE GILT MEHR, OHNE ANGEKLICKT ZU SEIN. */
    check('Keine Pille traegt mehr das Zeichen der Ableitung',
      d.w.document.querySelectorAll('.pill-derived').length === 0,
      `${d.w.document.querySelectorAll('.pill-derived').length} Stueck`);
    check('Und die Leiste sagt nirgends, dass sie einer Sortierung folgt',
      !/folgt der Sortierung|von Hand gewählt/.test(d.w.document.body.textContent),
      d.w.document.querySelector('#filter-toggle .fcount')?.textContent || '(leer)');
    d.w.close();
  }
  {
    const d = await ksBuild({ ...ksDefault, sort: 'rating_desc' });
    check('Nach Bewertung absteigend ebenfalls alle vier',
      equal(ksTitle(d), ksAll), JSON.stringify(ksTitle(d)));
    d.w.close();
  }

  /* ---- 2. */
  {
    const d = await ksBuild({ ...ksDefault, favorite: true, sort: 'potential_desc' });
    check('Die Prueflage ist wirklich gefiltert, bevor sie zuruecksetzt',
      ksTitle(d).length === 0 || ksTitle(d).length < ksAll.length,
      JSON.stringify(ksTitle(d)));
    const back = d.w.document.getElementById('filter-reset');
    check('Und der Ruecksetzer steht da, solange etwas gesetzt ist', !!back,
      back ? back.textContent : '(kein Knopf)');
    await ksClickable(d, back);
    check('Nach „Filter zuruecksetzen" stehen wieder alle vier da — keine Sackgasse',
      equal(ksTitle(d), ksAll), JSON.stringify(ksTitle(d)));
    check('Und der Ruecksetzer ist weg, weil wirklich nichts mehr gesetzt ist',
      !d.w.document.getElementById('filter-reset'),
      d.w.document.getElementById('filter-reset')?.textContent || 'weg');
    check('Und der Schalter zaehlt keinen einzigen Filter mehr',
      (d.w.document.querySelector('#filter-toggle .fcount')?.textContent || '') === '',
      JSON.stringify(d.w.document.querySelector('#filter-toggle .fcount')?.textContent));
    d.w.close();
  }

  /* ---- 3. EINE HANDWAHL WIRKT, ZAEHLT UND LAESST SICH ZURUECKNEHMEN ---- */
  {
    const d = await ksBuild({ ...ksDefault, sort: 'potential_desc' });
    await ksClickable(d, ksPill(d, 'Ungetestet'));
    check('Ein Klick auf „Ungetestet" filtert wirklich',
      equal(ksTitle(d), ['Idee schwach', 'Idee stark']), JSON.stringify(ksTitle(d)));
    check('Und er zaehlt als EIN gesetzter Filter',
      d.w.document.getElementById('filter-reset')?.textContent === 'Filter zurücksetzen (1)',
      JSON.stringify(d.w.document.getElementById('filter-reset')?.textContent));
    /* GESPEICHERT WIRD DIE GEWAEHLTE STELLUNG. */
    check('Und die Einstellung traegt genau diese Wahl',
      ksSetting(d)?.tested === 'untested', JSON.stringify(ksSetting(d)?.tested));
    await ksClickable(d, d.w.document.getElementById('filter-reset'));
    check('Zuruecksetzen holt „Alle" zurueck', equal(ksTitle(d), ksAll), JSON.stringify(ksTitle(d)));
    d.w.close();
  }

  /* ---- 4. EIN WECHSEL DER SORTIERUNG LAESST DEN STATUS IN RUHE ---- Das ist
     der Kern des Ausbaus: die beiden Bedienelemente sind wieder unabhaengig. */
  {
    const d = await ksBuild({ ...ksDefault, tested: 'tested', sort: 'updated_desc' });
    check('Vor dem Wechsel steht die gewaehlte Stellung',
      equal(ksTitle(d), ['Geprüft gut', 'Geprüft mau']), JSON.stringify(ksTitle(d)));
    await ksSort(d, 'potential_desc');
    check('Nach dem Wechsel auf Potenzial steht sie unveraendert da',
      equal(ksTitle(d), ['Geprüft gut', 'Geprüft mau']), JSON.stringify(ksTitle(d)));
    check('Und die Pille „Getestet" ist weiterhin die markierte',
      ksPill(d, 'Getestet')?.classList.contains('on') === true,
      [...d.w.document.querySelectorAll('#filters .pill.on')].map(b => b.textContent).join(' '));
    d.w.close();
  }

  /* ---- 5. */
  {
    const d = await ksBuild({ ...ksDefault, sort: 'potential_desc' },
      { views: [{ id: 7, name: 'Alles nach Potenzial', q: '',
                  filters: { ...ksDefault, sort: 'potential_desc', tested: 'all' } }] });
    const view = [...d.w.document.querySelectorAll('#filters .pill')]
      .find(b => b.textContent.trim() === 'Alles nach Potenzial');
    check('Die gespeicherte Ansicht steht in der Leiste', !!view,
      view ? view.textContent : '(keine)');
    await ksClickable(d, view);
    check('Und nach dem Anwenden stehen alle vier da',
      equal(ksTitle(d), ksAll), JSON.stringify(ksTitle(d)));
    d.w.close();
  }

  /* ---- 6. */
  {
    const appWithout = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8')
      .replace(/(^|[^A-Za-z0-9_"'`])\/\*[\s\S]*?\*\//g, '$1 ')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
    const reste = ['SORT_STATUS', 'STATUS_BY_HAND', 'defaultClosed', 'statusOutSort', 'statusIdle']
      .filter(n => new RegExp(`\\b${n}\\b`).test(appWithout));
    check('Kein Rest der Ableitung steht mehr im Quelltext — 0.32.1',
      reste.length === 0, reste.join(' ') || 'keiner');
    check('Und `statusEffective` liest nur noch das Feld',
      /const statusEffective = \(f\) => f\.tested;/.test(appWithout),
      (appWithout.match(/const statusEffective =[^\n]*/) || ['(fehlt)'])[0]);
    /* UND DIE DREI SAETZE SIND AUS ALLEN DREI DATEIEN. */
    const sortSentences = ['list.followsSort', 'list.statusByHand', 'list.byHandHint',
                        'list.pillHint', 'list.sortDefaultHint'];
    const nochDa = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of sortSentences) if (file[k] !== undefined) nochDa.push(`${code}/${k}`);
    }
    check('Und die fuenf Saetze der Ableitung stehen in keiner Sprachdatei mehr',
      nochDa.length === 0, nochDa.join(' ') || 'in allen dreien weg');
    /* UND IM STILBLATT AUCH NICHT. `.pill-derived` war ihr Aussehen; eine
       Klasse ohne Traeger ist derselbe tote Code eine Datei weiter. */
    const cssWithout = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ');
    check('Und das Stilblatt kennt `.pill-derived` nicht mehr',
      !/\.pill-derived/.test(cssWithout) && !/#f-status-from/.test(cssWithout),
      (cssWithout.match(/\.pill-derived[^\n]*/) || ['weg'])[0]);
  }

  /* ================= Die acht Reparaturen — 0.28.1 ====================== */
  group('Die Sortierung trennt Grundlage und Richtung — 0.28.1');

  /* DER BEFUND KAM VOM GERAET (Android, Samsung S21G, Chrome, 11.9.2026): die
     aufgeklappte Sortierliste fuellte den ganzen Schirm, und 0.28.0 hat daran
     nichts geaendert. */
  /* DREI EINTRAEGE, SECHS SORTIERUNGEN, SECHS VERSCHIEDENE FOLGEN -- und das
     sind zugleich ALLE sechs Anordnungen, die drei Dinge haben. */
  const soInventory = [
    //                                        Bew  Pot  Tage  Schnitt  Letzte
    { id: 1, title: 'Alpha', rejected: false, tested: true, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 3, potentialRating: 3,
      testCount: 2, testAvg: 4, testLast: 4, testDays: [], updated_at: '2026-01-01 10:00:00' },
    { id: 2, title: 'Beta', rejected: false, tested: true, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 1, potentialRating: 2,
      testCount: 6, testAvg: 2, testLast: 6, testDays: [], updated_at: '2026-02-02 10:00:00' },
    { id: 3, title: 'Gamma', rejected: false, tested: true, favorite: false, category: null,
      tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 2, potentialRating: 1,
      testCount: 4, testAvg: 6, testLast: 2, testDays: [], updated_at: '2026-03-03 10:00:00' }
  ];
  /* DIE FOLGE UND NICHT DIE MENGE: hier wird NICHT sortiert gelesen. Genau die
     Reihenfolge ist der Gegenstand dieser Gruppe. */
  const soOrder = (d) => [...d.w.document.querySelectorAll('.card .card-title')]
    .map(e => e.textContent);
  const soField = (d) => d.w.document.getElementById('f-sort');
  const soDir = (d) => d.w.document.getElementById('f-sort-dir');
  const soValues = (d) => [...(soField(d)?.options || [])].map(o => o.value);

  /* DAS STILBLATT OHNE SEINE ERKLAERUNGEN -- die Absaetze dieser Runde nennen
     jede Regel, die sie ersetzt, woertlich. */
  const soCss = css123.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const soRules = (soSelector) => soCss.match(
    new RegExp('(?<=[{}])\\s*' + soSelector.replace(/\./g, '\\.') + ' \\{[^}]*\\}', 'g')
  )?.map(r => r.trim()) || [];

  /* DER POTENZIALMODUS IST AN: ohne ihn fehlte der siebte Eintrag, und „genau
     sieben" waere eine Zusage ueber sechs. */
  const soBuild = async () => {
    const d = buildDom(JSDOM, { overviewItems: soInventory,
      settings: { potentialMode: true,
        filters: { categoryIds: [], tagIds: [], tagMode: 'and', tested: 'all',
                   rejected: 'all', favorite: false, sort: 'updated_desc' } } });
    await new Promise(r => setTimeout(r, 90));
    /* DIE HANDWAHL WIRD GESETZT, BEVOR SORTIERT WIRD. */
    const allPills = [...d.w.document.querySelectorAll('#filters .pill')]
      .find(b => b.textContent.trim() === 'Alle');
    allPills?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    return d;
  };

  /* ---- Zusage 1: genau sieben Eintraege, namentlich ---- */
  {
    const d = await soBuild();
    check('Der Aufbau steht: alle drei Eintraege sind da',
      soOrder(d).length === 3, JSON.stringify(soOrder(d)));
    /* NAMENTLICH UND NICHT GEZAEHLT: „sieben Eintraege" bliebe gruen, wenn
       jemand die Bewertung gegen eine achte Sortierung tauscht. */
    check('Das Sortierfeld traegt genau sieben Eintraege — namentlich',
      equal(soValues(d), ['updated', 'title', 'rating', 'potential',
                          'tests', 'testavg', 'testlast']),
      soValues(d).join(' '));
    /* ---- Zusage 2: die Richtung steht in einem eigenen Bedienelement ---- */
    check('Die Richtung steht in einem eigenen Bedienelement daneben',
      !!soDir(d) && soDir(d).tagName === 'BUTTON'
      && !!soField(d) && soDir(d).closest('.sort-pair') === soField(d).closest('.sort-pair'),
      soDir(d) ? soDir(d).outerHTML.slice(0, 120) : '(kein Umschalter)');
    /* UND IN KEINER EINZIGEN OPTION -- weder im WERT noch im WORT. */
    const soWords = [...(soField(d)?.options || [])].map(o => o.textContent);
    check('Und in keiner Option — weder im Wert noch im Wort',
      !soValues(d).some(v => /_(desc|asc)$/.test(v))
      && !soWords.some(w => /→/.test(w)),
      `${soValues(d).join(' ')} · ${soWords.join(' | ')}`);
    /* UND ER SAGT DIE KONKRETE RICHTUNG und nicht „absteigend": „neu → alt"
       bei der Aenderung, „hoch → niedrig" bei der Bewertung. */
    check('Und er nennt die konkrete Richtung und nicht „absteigend"',
      soDir(d)?.textContent === 'neu → alt', JSON.stringify(soDir(d)?.textContent));
    d.w.close();
  }

  /* ---- Zusage 3: jede der sieben laesst sich in beide Richtungen fahren
     ---- GEFAHREN UND NICHT GELESEN: eine Zusage, die nur den Aufbau ansieht,
     bliebe gruen, wenn der Umschalter dasteht und die Richtung nirgends
     ankommt. */
  {
    const d = await soBuild();
    const soSechs = ['updated', 'rating', 'potential', 'tests', 'testavg', 'testlast'];
    const soFrom = {}, soOn = {};
    for (const key of soSechs) {
      if (soField(d)) { soField(d).value = key; soField(d).onchange(); }
      await new Promise(r => setTimeout(r, 50));
      soFrom[key] = soOrder(d);
      soDir(d)?.click();
      await new Promise(r => setTimeout(r, 50));
      soOn[key] = soOrder(d);
      /* ZURUECK IN DIE ABSTEIGENDE LAGE, damit die naechste Grundlage von
         derselben Stellung aus anfaengt -- die Richtung bleibt beim Wechsel
         der Grundlage stehen, und ohne diesen Zug maesse die naechste Runde
         etwas anderes als die vorige. */
      soDir(d)?.click();
      await new Promise(r => setTimeout(r, 50));
    }
    /* JEDE LAGE IST EINDEUTIG: drei verschiedene Zahlen, also drei
       verschiedene Plaetze. */
    check('Jede der sechs zweiseitigen Sortierungen ordnet alle drei Eintraege',
      soSechs.every(k => soFrom[k].length === 3 && new Set(soFrom[k]).size === 3),
      JSON.stringify(soFrom));
    /* UND DIE GEGENRICHTUNG IST DIE UMGEKEHRTE FOLGE -- nicht „eine andere":
       „irgendwie anders" bliebe gruen, wenn der Umschalter auf eine dritte
       Sortierung umlegt. */
    const soKehrt = soSechs.filter(k => equal([...soFrom[k]].reverse(), soOn[k]));
    check('Und der Umschalter dreht jede von ihnen wirklich um',
      soKehrt.length === 6,
      soSechs.map(k => `${k}: ${soFrom[k].join('>')} / ${soOn[k].join('>')}`).join(' · '));
    /* UND KEINE ZWEI VON IHNEN ORDNEN GLEICH. */
    check('Und keine zwei von ihnen ergeben dieselbe Folge',
      new Set(soSechs.map(k => soFrom[k].join('>'))).size === 6,
      soSechs.map(k => `${k}: ${soFrom[k].join('>')}`).join(' · '));
    /* DIE SIEBTE KANN SEIT 0.29.0 BEIDE RICHTUNGEN -- Befund 8, aus dem
       Betrieb gemeldet (11.9.2026): „Z bis A kann nicht angewahlt werden". */
    if (soField(d)) { soField(d).value = 'title'; soField(d).onchange(); }
    await new Promise(r => setTimeout(r, 50));
    const soTitle = soOrder(d);
    check('Die siebte ordnet nach Titel, aufsteigend',
      equal(soTitle, ['Alpha', 'Beta', 'Gamma']), JSON.stringify(soTitle));
    check('Und ihr Umschalter steht DA und ist nicht mehr gesperrt',
      !!soDir(d) && soDir(d).disabled === false && soDir(d).textContent === 'A → Z',
      `${soDir(d)?.textContent} · disabled=${soDir(d)?.disabled}`);
    /* UND EIN DRUCK DARAUF DREHT SIE WIRKLICH UM -- gefahren und nicht am
       Wortlaut abgelesen. */
    soDir(d)?.click();
    await new Promise(r => setTimeout(r, 50));
    check('Und ein Druck darauf dreht die Reihenfolge um',
      equal(soOrder(d), [...soTitle].reverse()) && soDir(d)?.textContent === 'Z → A',
      `${soOrder(d).join('>')} · ${soDir(d)?.textContent}`);
    /* UND DIE AUFSTEIGENDE SCHREIBWEISE BLEIBT DIESELBE. */
    const soPut = d.sent.filter(x => x.method === 'PUT' && x.url === '/api/settings');
    check('Und die Gegenrichtung geht als title_desc hinaus',
      soPut[soPut.length - 1]?.body?.filters?.sort === 'title_desc' &&
      soPut.some(x => x?.body?.filters?.sort === 'title_asc'),
      JSON.stringify(soPut.map(x => x?.body?.filters?.sort).slice(-3)));
    d.w.close();
  }

  /* ---- Zusage 15 und 16: der Filterkasten ---- GEMESSEN AM GERAET (390 x
     844, aufgeklappte Filter, fuenfzehn Eintraege, drei Kategorien): der
     Kasten misst 378 px, davon 90 px Beschriftungen und 69 px Abstaende --
     ZWEIUNDVIERZIG PROZENT sind Geruest und nicht Bedienung. */
  {
    const soNarrow = soRules('.frow')[1] || '';
    /* ERSTER HEBEL: DIE BESCHRIFTUNG STEHT WIEDER DANEBEN. */
    check('Erster Hebel: die Beschriftung steht am Telefon wieder NEBEN der Reihe',
      /display: grid/.test(soNarrow)
      && /grid-template-columns: auto minmax\(0, 1fr\)/.test(soNarrow),
      soNarrow || '(keine Regel)');
    check('Und Beschriftung und Reihe stehen in verschiedenen Spalten',
      /\.frow > \.eyebrow, \.frow > \.eyebrow-with \{ grid-column: 1;/.test(soCss)
      && /\.frow > \.pills, \.frow > \.select, \.frow > \.sort-pair \{ grid-column: 2;/.test(soCss),
      '(die Spaltenzuweisung fehlt)');
    /* UND WAS ZU KEINEM PAAR GEHOERT, SPANNT UEBER ALLE. */
    check('Und was zu keinem Paar gehoert, spannt ueber alle Spalten',
      /\.frow > \.frow-right \{ grid-column: 1 \/ -1; \}/.test(soCss) &&
      /\.frow > \.frow-right-end \{ grid-column: 3; \}/.test(soCss) &&
      /\.frow-tags > \.tagmode \{ grid-column: 1; grid-row: 2;/.test(soCss),
      '(die Spanne oder eine der beiden Spaltenzuweisungen fehlt)');
    /* ZWEITER HEBEL: DIE REIHEN ROLLEN QUER, STATT UMZUBRECHEN. */
    check('Zweiter Hebel: die Reihen rollen quer, statt umzubrechen',
      /\.frow > \.pills:not\(\.cloud\) \{ flex-wrap: nowrap; overflow-x: auto;/.test(soCss),
      '(die Reihen brechen weiter um)');
    check('Und ohne Rollbalken, der die gewonnene Hoehe wieder naehme',
      /scrollbar-width: none/.test(soCss)
      && /\.frow > \.pills:not\(\.cloud\)::-webkit-scrollbar \{ display: none; \}/.test(soCss),
      '(ein Rollbalken steht da)');
    /* DIE WOLKE IST AUSGENOMMEN. */
    check('Und die Markenwolke ist ausdruecklich ausgenommen',
      /:not\(\.cloud\)/.test(soCss)
      && /\.frow > \.pills\.cloud \{ flex: 0 1 auto; \}/.test(soCss),
      '(die Wolke rollt mit)');
    /* ---- Zusage 16: die Pillen bleiben, wie sie sind ---- SIE SIND NICHT
       DAS PROBLEM: gemessen machen sie 33 Prozent des Kastens aus,
       Beschriftungen und Abstaende 42. Sie stehen seit 0.28.0 bei 35 px, und
       kleiner wird am Finger schwierig. */
    check('Und die Pillen messen unveraendert weiter — sie waren nicht das Problem',
      /\.pill \{ padding: 7px 13px; \}/.test(soCss),
      soRules('.pill').join(' || ') || '(keine Regel)');
  }

  /* ---- Zusage 9: die Sterne werden filigraner ---- BEFUND DES BETREIBERS
     (11.9.2026): „die sterne koennten auch etwas filigraner werden. */
  {
    const soRules = (soSelector) => soCss.match(
      new RegExp('(?<=[{}])\\s*' + soSelector.replace(/\./g, '\\.') + ' \\{[^}]*\\}', 'g')
    )?.map(r => r.trim()) || [];
    const soStar = soRules('.star');
    /* SEIT 0.30.1 SIND ES DREI (Befund 5, F10): Zeiger, Finger, Telefon. */
    check('Der Stern hat drei Masse: Zeiger, Finger, Telefon',
      soStar.length === 3, soStar.join(' || ') || '(keine Regel)');
    check('Am Zeiger steht er unveraendert auf 1.2rem',
      /font-size: 1\.2rem/.test(soStar[0] || ''), soStar[0] || '(keine Regel)');
    /* KLEINER ALS DIE 1.45rem VON VORHER UND GROESSER ALS DIE 1.2rem DES
       ZEIGERS -- gerechnet und nicht abgeschrieben: eine Zahl, die dasteht,
       kann man vertauschen; eine, die zwischen zwei anderen liegen muss,
       nicht. */
    const soRem = Number(((soStar[1] || '').match(/font-size: ([\d.]+)rem/) || [])[1]);
    check('Am Finger ist er kleiner als vorher und groesser als am Zeiger',
      soRem > 1.2 && soRem < 1.45, `${soRem}rem`);
    check('Und seine Polsterung ist mitgegangen — 3px statt 5px',
      /\.stars \.star \{ padding: 3px 4px; \}/.test(soCss),
      soRules('.stars .star').join(' || ') || '(keine Regel)');
    /* ---- DAS DRITTE MASS -- 0.30.1, Befund 5 (F10) ---- GERECHNET UND NICHT
       ABGESCHRIEBEN, wie schon beim zweiten: es muss kleiner sein als beide
       anderen. */
    const soNarrow = Number(((soStar[2] || '').match(/font-size: ([\d.]+)rem/) || [])[1]);
    check('Und am Telefon ist er kleiner als an beiden anderen',
      soNarrow < 1.2 && soNarrow < soRem, `${soNarrow}rem gegen ${soRem}rem und 1.2rem`);
    check('Und auch dort geht die Polsterung mit — 3px ringsum',
      /\.stars \.star \{ padding: 3px 3px; \}/.test(soCss),
      soRules('.stars .star').join(' || ') || '(keine Regel)');
    check('Und der Abstand zwischen den Sternen ebenso — 2px statt 3px',
      /\.stars \{ gap: 2px; \}/.test(soCss),
      soRules('.stars').join(' || ') || '(keine Regel)');
  }

  /* ---- Zusage 12 und 13: die Titelzeile dehnt sich ---- DER BEFUND: „der
     stern ist nicht an der rechten seite sondern irgendwie links vom rechten
     seite" (Betreiber, 11.9.2026). */
  {
    const soRules = (soSelector) => soCss.match(
      new RegExp('(?<=[{}])\\s*' + soSelector.replace(/\./g, '\\.') + ' \\{[^}]*\\}', 'g')
    )?.map(r => r.trim()) || [];
    const soDetail = soRules('.detail');
    check('Am Schreibtisch bleibt der Eintrag ein Raster mit `align-items: start`',
      /display: grid/.test(soDetail[0] || '') && /align-items: start/.test(soDetail[0] || ''),
      soDetail[0] || '(keine Regel)');
    const soFlex = soDetail.find(r => /flex-direction: column/.test(r)) || '';
    check('Am Telefon wird er eine Spalte — und dehnt seine Kinder ausdruecklich',
      /align-items: stretch/.test(soFlex) && !/align-items: start/.test(soFlex),
      soFlex || '(keine Telefonregel)');
    /* ---- Zusage 14: die tote Regel faellt ---- `.back` ist mit 0.28.0
       gefallen; die eine Zeile im Telefonabschnitt ist stehengeblieben und
       traf nichts mehr. */
    check('Und die tote Regel `.back` steht nirgends mehr im Stilblatt',
      !/(?:^|[ ,{}])\.back[ ,{:]/.test(soCss),
      (soCss.match(/[^{}]*\.back[^{}]*\{[^}]*\}/g) || []).join(' || ') || '(keine)');
  }

  /* ---- Zusage 10 und 11: die Abschnittsliste klappt ein ---- GEMESSEN (390
     px): die Reiterliste misst 241 px bei fuenf Abschnitten, und die erste
     Karte beginnt bei y = 480 von 844 -- 57 Prozent des Schirms sind
     Bedienung, bevor die erste Auskunft dasteht. */
  {
    const soSys = async (narrow) => {
      const d = buildDom(JSDOM, {});
      await new Promise(r => setTimeout(r, 60));
      d.w.matchMedia = () => ({ matches: narrow, addEventListener() {}, addListener() {} });
      await sysSection(d.w, 'inventory');
      return d;
    };
    const soEng = await soSys(true);
    const soButton = soEng.w.document.getElementById('sys-toggle');
    const soTabs = soEng.w.document.getElementById('sys-tabs');
    check('Ueber den Abschnitten steht ein Schalter', !!soButton && !!soTabs,
      soButton ? '(Reiter fehlen)' : '(kein Schalter)');
    /* UND ER SAGT, WAS DAHINTERSTECKT. */
    check('Und er traegt den Namen des offenen Abschnitts',
      soButton?.querySelector('.fcount')?.textContent === 'Bestand',
      JSON.stringify(soButton?.querySelector('.fcount')?.textContent));
    check('Am Telefon steht die Liste eingeklappt da',
      soTabs?.classList.contains('closed')
      && soButton?.getAttribute('aria-expanded') === 'false',
      `${soTabs?.className} · ${soButton?.getAttribute('aria-expanded')}`);
    soButton?.dispatchEvent(new soEng.w.MouseEvent('click', { bubbles: true }));
    check('Ein Druck holt sie hervor',
      !soTabs?.classList.contains('closed')
      && soButton?.getAttribute('aria-expanded') === 'true',
      `${soTabs?.className} · ${soButton?.getAttribute('aria-expanded')}`);
    soButton?.dispatchEvent(new soEng.w.MouseEvent('click', { bubbles: true }));
    check('Und der naechste legt sie wieder weg',
      soTabs?.classList.contains('closed'), soTabs?.className);
    soEng.w.close();
    /* ---- Zusage 11: am Schreibtisch unveraendert ---- Ohne die Frage nach
       der Breite saesse ein breites Fenster vor eingeklappten Abschnitten und
       haette keinen sichtbaren Knopf, sie zu oeffnen -- der Schalter selbst
       steht dort im Stilblatt auf `display: none`. */
    const soWide = await soSys(false);
    check('Am Schreibtisch steht die Liste unveraendert offen',
      !soWide.w.document.getElementById('sys-tabs')?.classList.contains('closed'),
      soWide.w.document.getElementById('sys-tabs')?.className);
    soWide.w.close();
    /* UND DER SCHALTER STEHT NUR AM TELEFON DA. */
    check('Und der Schalter selbst steht nur am Telefon da',
      /\.sys-toggle \{ display: none;/.test(soCss)
      && /\.sys-toggle \{ display: inline-flex; \}/.test(soCss)
      && /\.sys-tabs\.closed \{ display: none; \}/.test(soCss),
      soRules('.sys-toggle').join(' || ') || '(keine Regel)');
  }

  /* ---- Zusage 17 STEHT HIER NICHT ---- „`F_ROUTES` bleibt bei 72, die
     lesenden bei 31" ist die siebzehnte Zusage der Runde, und sie wird
     NICHT hier noch einmal aufgeschrieben: das Verzeichnis der schreibenden
     Wege sagt es bereits, Zeile fuer Zeile und mit derselben Zahl. */

  /* ================= Der Potenzialmodus — 0.26.0 ==========================
     EIN SCHALTER, UND ER WIRKT AN FUENF STELLEN. */
  group('Der Potenzialmodus — 0.26.0');
  {
    const pmInventory = ksInventory;
    const pmBuild = async (further = {}, hash = '') => {
      const d = buildDom(JSDOM, { overviewItems: pmInventory, hash,
        settings: { filters: null, ...further } });
      await new Promise(r => setTimeout(r, 200));
      return d;
    };
    const pmOn = await pmBuild({ potentialMode: true });
    const pmOff = await pmBuild({ potentialMode: false });

    /* ---- 1. */
    const pmDiamonds = (d) => d.w.document.querySelectorAll('.rating-inline.potential').length;
    const pmStars = (d) => d.w.document.querySelectorAll('.rating-inline:not(.potential)').length;
    check('Mit Schalter traegt die Uebersicht die Kopfzahl ◆',
      pmDiamonds(pmOn) === 2, `${pmDiamonds(pmOn)} Rauten`);
    check('Ohne Schalter steht dort nichts',
      pmDiamonds(pmOff) === 0, `${pmDiamonds(pmOff)} Rauten`);
    /* UND DIE STERNE DER GETESTETEN BLEIBEN IN BEIDEN LAGEN STEHEN. */
    check('Und die Bewertung der getesteten steht in beiden Lagen da',
      pmStars(pmOn) === 2 && pmStars(pmOff) === 2,
      `mit ${pmStars(pmOn)}, ohne ${pmStars(pmOff)}`);
    /* UND AUCH DER SATZ „noch nicht eingeschätzt" IST WEG. */
    const pmText = (d) => d.w.document.getElementById('app')?.textContent || '';
    /* GEPRUEFT AN EINEM EIGENEN BESTAND: der oben traegt an BEIDEN
       ungetesteten eine Zahl, und dann stuende der Hinweis auch mit Schalter
       nirgends -- die Zusage waere gruen, ohne etwas zu belegen. */
    const pmNoValue = [{ id: 9, title: 'Idee ohne Zahl', rejected: false, tested: false,
      favorite: false, category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0,
      avgRating: null, potentialRating: null, testCount: null, testAvg: null, testLast: null,
      testDays: [], updated_at: '2026-08-05 10:00:00' }];
    const pmHintBuild = async (mode) => {
      const d = buildDom(JSDOM, { overviewItems: pmNoValue,
        settings: { filters: null, potentialMode: mode } });
      await new Promise(r => setTimeout(r, 200));
      return d;
    };
    const pmHintOn = await pmHintBuild(true);
    const pmHintOff = await pmHintBuild(false);
    check('Und der Hinweis „noch nicht eingeschätzt" ebenso',
      /noch nicht eingeschätzt/.test(pmText(pmHintOn)) &&
      !/noch nicht eingeschätzt/.test(pmText(pmHintOff)),
      pmText(pmHintOff).slice(0, 160));
    pmHintOn.w.close(); pmHintOff.w.close();

    /* ---- 2. */
    const pmSortValues = (d) => [...(d.w.document.getElementById('f-sort')?.options || [])]
      .map(o => o.value);
    /* MITGEZOGEN MIT 0.28.1: ein Eintrag statt zweier, die Richtung steht
       daneben. */
    check('Mit Schalter steht die Gruppe im Sortierfeld',
      pmSortValues(pmOn).includes('potential'),
      pmSortValues(pmOn).join(' '));
    check('Ohne Schalter steht sie nicht da',
      !pmSortValues(pmOff).includes('potential'),
      pmSortValues(pmOff).join(' '));
    /* UND DIE UEBRIGEN SORTIERUNGEN BLEIBEN. Ohne diese Zeile waere „sie
       steht nicht da" auch bei einem leeren Auswahlfeld gruen. */
    check('Und die uebrigen Sortierungen bleiben in beiden Lagen',
      pmSortValues(pmOff).includes('rating') &&
      pmSortValues(pmOff).includes('title'),
      pmSortValues(pmOff).join(' '));

    /* ---- 3. DIE KOPPLUNG (F4) ----------------------------------------
       `potential_desc` stellte den Statusfilter auf „nicht getestet". */
    const pmSaved = async (mode) => await pmBuild(
      { potentialMode: mode, filters: { sort: 'potential_desc' } });
    const pmOnSaved = await pmSaved(true);
    const pmOffSaved = await pmSaved(false);
    const pmTitles = (d) => [...d.w.document.querySelectorAll('.card .card-title')]
      .map(e => e.textContent).sort();
    check('Mit Schalter stellt die gespeicherte Sortierung den Status NICHT — 0.32.1',
      equal(pmTitles(pmOnSaved), ksAll), pmTitles(pmOnSaved).join(' · '));
    check('Ohne Schalter ebenso wenig — die Kopplung ist ganz gefallen',
      equal(pmTitles(pmOffSaved), ksAll), pmTitles(pmOffSaved).join(' · '));

    /* ---- 4. DER STERNKASTEN AM EINTRAG ------------------------------- GAR
       NICHT ERST GEZEICHNET und nicht bloss eingeklappt. */
    const pmEntryOn = await pmBuild({ potentialMode: true }, '#/item/1');
    const pmEntryOff = await pmBuild({ potentialMode: false }, '#/item/1');
    const pmBox = (d) => d.w.document.querySelector('[data-block="potenzial"]');
    check('Mit Schalter steht der Sternkasten am Eintrag',
      !!pmBox(pmEntryOn), '(kein Kasten)');
    check('Ohne Schalter steht er GAR NICHT im Baum',
      !pmBox(pmEntryOff), pmBox(pmEntryOff)?.outerHTML?.slice(0, 120) || '');
    /* UND DER BEWERTUNGSKASTEN BLEIBT IN BEIDEN LAGEN. Zwei Sternkaesten,
       ein Schalter -- er nimmt genau einen von beiden. */
    check('Und der Bewertungskasten steht in beiden Lagen da',
      !!pmEntryOn.w.document.querySelector('[data-block="bewertung"]') &&
      !!pmEntryOff.w.document.querySelector('[data-block="bewertung"]'), '');

    /* ---- 5. DIE OBERFLAECHE IST DICHT, AUCH WENN DER SERVER LIEFERT ----
       DIE ZUSAGE, DIE DEN SCHALTER AM SERVER UMGEHT. */
    check('Der Bestand traegt Potenzialzahlen — sonst belegte das Ganze nichts',
      pmInventory.filter(z => !z.tested && z.potentialRating).length === 2,
      JSON.stringify(pmInventory.map(z => z.potentialRating)));
    check('Und trotzdem steht in der ganzen Uebersicht keine Raute',
      !/◆/.test(pmText(pmOff)), (pmText(pmOff).match(/.{0,30}◆.{0,30}/) || [''])[0]);
    check('Und im Eintrag steht das Wort des Potenzialkastens nicht',
      !pmBox(pmEntryOff) &&
      !/data-block="potenzial"/.test(pmEntryOff.w.document.body.innerHTML), '');

    pmOn.w.close(); pmOff.w.close(); pmOnSaved.w.close(); pmOffSaved.w.close();
    pmEntryOn.w.close(); pmEntryOff.w.close();
  }
  /* ================= Kein Milchglas im Stilblatt — 0.22.0 =================
     Eine Regelpruefung wie die zu [hidden] aus 0.15.1: die Regel steht seit
     0.19.x im Projektstand (10a), und das Stilblatt brach sie an neun
     Stellen. */
  /* ================= Das Menue der Auszeichnung ================= Es haengt
     ueber der Kante des Feldes und muss auf einem schmalen Bildschirm
     umbrechen statt aus dem Bild zu laufen. */
  group('Das schwebende Menue bleibt im Bild');
  {
    const mnRaw = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    const mnRule = regel123('.markup-menu') || '';
    check('Die Regel des Menues steht im Stilblatt', mnRule.length > 40, mnRule.slice(0, 120));
    /* AUF 360 PIXELN BREITE BRICHT ES IN ZWEI ZEILEN, STATT AUS DEM BILD ZU
       LAUFEN -- beides steht an derselben Regel. */
    check('Es bricht um und bleibt schmaler als der Bildschirm',
      /flex-wrap: wrap/.test(mnRule) && /max-width: calc\(100vw - 16px\)/.test(mnRule),
      mnRule.slice(0, 200));
    check('Und es traegt seine Stufe aus der Stapelordnung, keine eigene Zahl',
      /z-index: var\(--z-markup-menu\)/.test(mnRule), mnRule.slice(0, 200));
    /* UND SEINE STUFE LIEGT UNTER DER KOPFZEILE: es soll unter ihr
       durchlaufen und nicht ueber ihr stehen. */
    const mnLevel = (name) => Number((mnRaw.match(new RegExp('--' + name + ': (\\d+);')) || [])[1]);
    check('Und sie liegt unter der Kopfzeile',
      mnLevel('z-markup-menu') < mnLevel('z-masthead')
      && mnLevel('z-markup-menu') > mnLevel('z-timeline-hint'),
      `${mnLevel('z-markup-menu')} gegen ${mnLevel('z-masthead')}`);
    /* UND DIE NEUEN REGELN TRAGEN KEINE FARBE ALS ZAHL -- sie nehmen die
       Tokens, die das Blatt schon fuehrt. */
    const mnOwn = ['.markup-menu', '.markup-quote', '.markup-code', '.markup-ref',
      '.desc-view', '.markup-list', '.markup-out', '.markup-ask'];
    const mnRules = mnOwn.map(n => regel123(n) || '');
    check('Der Waechter sieht die acht neuen Regeln',
      mnRules.filter(r => r.length > 20).length === 8,
      mnOwn.filter((n, i) => mnRules[i].length <= 20).join(' ') || 'alle acht');
    const mnNumbers = mnRules.filter(r => /#[0-9a-fA-F]{3,8}\b|rgba?\([0-9]/.test(r));
    check('Und keine traegt eine Farbe als Zahl',
      mnNumbers.length === 0, mnNumbers.join(' | ').slice(0, 200) || 'alle ueber Tokens');
    check('Und keine legt einen eigenen Block fuer das helle Schema an',
      (mnRaw.match(/\[data-theme="light"\]/g) || []).length === 2,
      `${(mnRaw.match(/\[data-theme="light"\]/g) || []).length} Bloecke`);
  }

  group('Kein Milchglas im Stilblatt — 0.22.0');
  {
    const cssRaw = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    const cssWithoutComments = cssRaw.replace(/\/\*[\s\S]*?\*\//g, '');
    check('backdrop-filter steht in keiner Regel des Stilblatts',
      !/backdrop-filter/.test(cssWithoutComments),
      (cssWithoutComments.match(/[^\n]*backdrop-filter[^\n]*/g) || []).slice(0, 3).join(' | '));
    // Erst der Gegenstand: das Wort steht IM Stilblatt -- als Begruendung im
// Kommentar an der Kopfzeile. Sonst belegte die Verneinung oben nichts.
    check('Und die Kopfzeile nennt im Kommentar, warum es fehlt',
      /backdrop-filter/.test(cssRaw) && /\.masthead \{[^}]*background: var\(--bg\)/.test(css123),
      regel123('.masthead').slice(0, 200));
    check('Die Kopfzeile ist deckend und bekommt beim Rollen einen Schatten statt Milchglas',
      /\.masthead\.scrolled \{ box-shadow: var\(--sh-sm\); \}/.test(css123),
      regel123('.masthead.scrolled') || '(keine Regel)');
    check('Der Hintergrund eines Dialogs ist eine deckende Farbe ohne Weichzeichner',
      /* Seit 0.23.0 traegt --scrim den ganzen Wert und nicht die Regel: im
         hellen Schema aendern sich BEIDE Teile, Farbe und Deckung. */
      /\.backdrop \{[^}]*background: var\(--scrim\)/.test(css123)
        && /--scrim: *rgba\(var\(--scrim-rgb\), *\.78\)/.test(cssRaw)
        && /--scrim-rgb: *6,\s*7,\s*9/.test(cssRaw)
        && !/\.backdrop \{[^}]*filter/.test(css123),
      regel123('.backdrop') || '(keine Regel)');
  }

  /* ================= Das Farbschema — 0.23.0 ================= Die Maschine,
     nicht die Farben: wo die Einstellung steht, wie sie ans Wurzelelement
     kommt, und WAS VOR DEM ERSTEN ANSTRICH ZU SEHEN IST. */
  group('Das Farbschema — 0.23.0');
  {
    const tHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
    const tApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    const tCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    const tBoot = fs.existsSync(path.join(__dirname, 'public', 'theme.js'))
      ? fs.readFileSync(path.join(__dirname, 'public', 'theme.js'), 'utf8') : null;

    check('Der Vorgriff liegt als eigene Datei public/theme.js', tBoot !== null,
      tBoot === null ? '(fehlt)' : `${tBoot.length} Zeichen`);
    /* ALS DATEI UND NICHT INLINE, und das ist keine Geschmacksfrage: die CSP
       des Servers sagt `script-src 'self'`, und ein Inline-Script wird vom
       Browser wortlos abgewiesen. */
    check('Und nicht als Inline-Script — script-src bleibt streng',
      !/<script>[\s\S]*?<\/script>/.test(tHtml) && /script-src 'self'/.test(
        fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8')),
      (tHtml.match(/<script[^>]*>/g) || []).join(' '));
    /* ER MUSS VOR DEM STILBLATT STEHEN. Danach hat er seinen Zweck verfehlt:
       der Browser hat dann schon einmal falsch gemalt. */
    check('Er steht vor dem Stilblatt',
      tHtml.indexOf('theme.js') > -1
        && tHtml.indexOf('theme.js') < tHtml.indexOf('href="style.css"'),
      `theme.js bei ${tHtml.indexOf('theme.js')}, style.css bei ${tHtml.indexOf('href="style.css"')}`);
    /* UND ER MUSS SYNCHRON LADEN. `defer` oder `async` liessen ihn NACH dem
       Stilblatt laufen -- die Datei waere da, und das Blitzen auch. */
    check('Und er laedt synchron, ohne defer und ohne async',
      /<script src="theme\.js"><\/script>/.test(tHtml),
      (tHtml.match(/<script[^>]*theme\.js[^>]*>/) || ['(nicht gefunden)'])[0]);
    /* DER NAME DES SCHLUESSELS STEHT AN ZWEI STELLEN, und es geht nicht
       anders: theme.js laeuft, bevor es app.js gibt. */
    const keyBoot = (tBoot || '').match(/getItem\('([^']+)'\)/);
    const keyApp = tApp.match(/THEME_KEY = '([^']+)'/);
    check('Der Name des gemerkten Schluessels stimmt in beiden Dateien ueberein',
      !!keyBoot && !!keyApp && keyBoot[1] === keyApp[1],
      `theme.js: ${keyBoot?.[1]} · app.js: ${keyApp?.[1]}`);
    check('Ohne Gedaechtnis steht dunkel da — die Vorgabe, auch vor der Anmeldung',
      /\? 'light' : 'dark'/.test(tBoot || '') && /catch[\s\S]{0,80}= 'dark'/.test(tBoot || ''),
      tBoot === null ? '(keine Datei)' : 'Rueckfall geprueft');

    /* DAS STILBLATT KENNT ZWEI WERTE UND NICHT DREI. */
    check('Das Stilblatt kennt genau einen zweiten Block',
      (tCss.match(/:root\[data-theme="light"\]/g) || []).length === 1
        && !/data-theme="device"/.test(tCss),
      `hell: ${(tCss.match(/:root\[data-theme="light"\]/g) || []).length} · geraet: ${/data-theme="device"/.test(tCss)}`);
    check('Und der Betrachter bekommt seine eigenen Werte',
      /\[data-theme="light"\] \.lightbox \{/.test(tCss),
      /\[data-theme="light"\] \.lightbox/.test(tCss) ? 'Insel da' : '(keine Insel)');
    /* color-scheme GEHOERT DEM BLOCK und nicht mehr einem einzelnen Element:
       davon haengen Auswahlfelder, Rollbalken und Datumswaehler ab. */
    check('color-scheme steht in beiden Schemabloecken und nirgends sonst',
      (tCss.match(/color-scheme: */g) || []).length === 3
        && /:root \{[\s\S]*?color-scheme: dark/.test(tCss)
        && /:root\[data-theme="light"\] \{[\s\S]*?color-scheme: light/.test(tCss),
      `${(tCss.match(/color-scheme: [a-z]+/g) || []).join(' · ')}`);
    check('Und der Kopf der Seite nennt beide',
      /<meta name="color-scheme" content="light dark">/.test(tHtml));

    /* DIE LEISTENFARBE WIRD GELESEN UND NICHT ABGESCHRIEBEN -- sonst waere
       sie die zweite Wahrheit, vor der der Kopf der Seite seit jeher warnt. */
    check('Die Farbe der Browserleiste kommt aus --bg und nicht aus einer Abschrift',
      /getPropertyValue\('--bg'\)/.test(tApp) && /theme-color/.test(tApp),
      /getPropertyValue\('--bg'\)/.test(tApp) ? 'gelesen' : '(abgeschrieben)');
    /* „WIE DAS GERAET" FOLGT OHNE NEULADEN -- und nur in dieser Stellung. */
    check('Der Horcher auf das Geraet greift nur in der Stellung geraet',
      /THEME === 'device'\) applyTheme\(\)/.test(tApp)
        && /addEventListener\('change'/.test(tApp),
      /addEventListener\('change'/.test(tApp) ? 'Horcher da' : '(kein Horcher)');
    check('Die Karte „Darstellung" traegt die Pillenreihe',
      /<div class="pills" id="theme"><\/div>/.test(tApp) && /function drawTheme\(\)/.test(tApp)
        && /drawTheme\(\);\n  drawFont\(\);/.test(tApp),
      /function drawTheme/.test(tApp) ? 'Reihe und Zeichner da' : '(fehlt)');
    /* DIE STUFEN STEHEN IN BEIDEN DATEIEN UND MUESSEN UEBEREINSTIMMEN --
       dieselbe Zusicherung wie bei SCHRIFT_STUFEN und STREIFEN_STUFEN. */
    /* DIE DAEMPFUNG SCHIEBT ZUM GRUND HIN UND NICHT ZU SCHWARZ -- Regel F4. */
    check('Die Daempfung eines abgelehnten Eintrags geht ueber eine Variable',
      /filter: var\(--dimmed\)/.test(tCss) && !/filter: grayscale/.test(tCss),
      (tCss.match(/\.card\.rejected[^}]*\}/) || ['(keine Regel)'])[0]);
    check('Und sie nimmt im Hellen opacity statt brightness',
      /:root \{[\s\S]*?--dimmed: grayscale\(\.85\) brightness\(\.5\);/.test(tCss)
        && /:root\[data-theme="light"\] \{[\s\S]*?--dimmed: grayscale\(\.85\) opacity\(\.45\);/.test(tCss),
      (tCss.match(/--dimmed:[^;]*/g) || ['(nicht gesetzt)']).join(' · '));
    const levelsApp = (tApp.match(/THEME_LEVELS = \[([^\]]*)\]/) || [])[1];
    const levelsSrv = (fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8')
      .match(/THEME_LEVELS = \[([^\]]*)\]/) || [])[1];
    check('Die drei Stufen stehen in app.js und server.js gleich',
      !!levelsApp && levelsApp === levelsSrv, `app: ${levelsApp} · server: ${levelsSrv}`);
  }

  /* ================= Der Stift und der Abstand vor dem Loeschen ==========
     ZWEI BEFUNDE DES BETRIEBS: der Stift war der leiseste Wert des Hauses,
     und das Loeschkreuz stand dem Nachbarn zu nah. */
  group('Der Stift steht da, und das Loeschen steht abseits');
  {
    const psRaw = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    /* DER STIFT TRAEGT EINE REGEL, UND ZWAR EINE FUER ALLE VIER STELLEN:
       Kommentar, Beschreibung, Ablehnungsgrund und Kartenname. */
    check('Der Stift traegt die Akzentfarbe statt des leisesten Werts',
      /\.mact\.ed \{ color: var\(--accent-text\); \}/.test(psRaw),
      'keine Regel auf .mact.ed');
    check('Und beim Ueberfahren einen anderen Wert — sonst gaebe er keine Rueckmeldung',
      /\.mact\.ed:hover \{ color: var\(--accent-text-hi\); \}/.test(psRaw));
    /* DIE VIER STELLEN TRAGEN WIRKLICH DIESELBE KLASSE. */
    const psApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    check('Und vier Stellen im Code tragen sie',
      (psApp.match(/mact ed/g) || []).length === 4,
      `${(psApp.match(/mact ed/g) || []).length} Stellen`);

    /* DER ABSTAND VOR DEM LOESCHEN -- am Zeiger eine Zeichenbreite, am
       Finger mehr, weil die Flaechen dort dichter stehen. */
    check('Vor dem Loeschkreuz steht ein Abstand',
      /\.cmt-head button\.rm \{ margin-left: \.6em; \}/.test(psRaw));
    check('Und am Finger ein groesserer',
      /\.cmt-head button\.rm \{ margin-left: 11px; \}/.test(psRaw));
    /* DIE NUMMER STEHT RECHTS UND AUSSERHALB DER AKTIONEN -- sonst ver-
       schwaende sie beim Bearbeiten mit der ganzen Gruppe. */
    check('Die Nummer steht ausserhalb der Aktionsgruppe',
      /<button class="link-btn cmt-no"/.test(psApp)
      && !/<span class="acts"><button class="[^"]*cmt-no/.test(psApp));
    check('Und die Aktionsgruppe schrumpft nicht mehr',
      /\.cmt-head \.acts \{ display: flex; gap: 8px; flex-shrink: 0; \}/.test(psRaw));
    /* UND SIE STEHT GANZ RECHTS: im Quelltext hinter der Gruppe, in der
       schmalen Ansicht als drittes Stueck. */
    const psActs = psApp.indexOf('<span class="acts"><button class="mact cite"');
    const psNo = psApp.indexOf('<button class="link-btn cmt-no"');
    check('Und zwar hinter der Aktionsgruppe',
      psActs >= 0 && psNo > psActs, `${psActs} vor ${psNo}`);
    check('Auch in der schmalen Ansicht',
      /\.cmt-head \.acts \{ order: 2; \}/.test(psRaw)
      && /\.cmt-head \.cmt-no \{ order: 3; \}/.test(psRaw));
  }

  /* Das Feld, ueber das ohne sicheren Kontext kopiert wird. */
  group('Das Feld der Zwischenablage steht ausserhalb des Bildes');
  {
    const cpRaw = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    check('Die Regel steht da und haelt das Feld aus dem Bild',
      /\.copy-spare \{ position: fixed; top: -1000px; left: 0; opacity: 0; \}/.test(cpRaw));
    check('Und sie traegt keine feste Schriftgroesse',
      !/\.copy-spare[^}]*font-size/.test(cpRaw));
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
