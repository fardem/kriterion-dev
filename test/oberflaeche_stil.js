/* Kriterion — Pruefstand: die Oberflaeche: Filter, Glocke und Stilblatt
 *
 * Der Filter „abgelehnt", die Begruendung, die Glocke in der Kopfzeile,
 * der Papierkorb im Vollbild, der Zugangstext, das Stilblatt und die
 * Sortierung.
 *
 * Eigener Prozess, eigener Speicher. Der Rahmen steht in test/rahmen.js.
 */
const H = require('./rahmen.js');
const D = require('./dom.js');
const {
  buildDom, waitSearch, sysSection, css123, regel123, withoutMedia
} = D;

async function laufen() {
  const {
   fs, path, attachments, TEXT, KOMMENTAR, readmeFlat, __dirname, FILTER,
   group, check, equal, open
  } = H;
  /* DIESES MODUL BAUT FENSTER. Fehlt jsdom, sagt es das und haelt an. Die
     Zahl der uebersprungenen Pruefungen steht EINMAL im ersten Modul der
     Oberflaeche und nicht in jedem -- sonst zaehlte ein Lauf ohne jsdom sie
     achtmal. */
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch { console.log('  … uebersprungen: jsdom fehlt (npm install)'); return; }

  /* ================= Der Filter „abgelehnt" — 0.15.0 ===================
     DER BEFUND KAM AUS DEM BETRIEB: die Statuszeile trug „Alles anzeigen ·
     Getestet · Ungetestet · ★ Favoriten · Neu seit …" und keinen Filter fuer
     „abgelehnt" -- obwohl es das Merkmal seit jeher gibt. Keine Luecke von
     0.14.0 also, sondern eine alte, die erst auffiel, als die Ablehnung
     etwas zu sagen bekam.
     DREI ZUSTAENDE IN EINER EIGENEN GRUPPE und ausdruecklich kein vierter
     Wert der Reihe davor: Teststatus und Ablehnung sind ZWEI Merkmale, und
     „getestet UND abgelehnt" muss einstellbar bleiben -- man lehnt ab, ohne
     zu testen, und man lehnt nach dem Test ab.
     DIE PRUEFLAGE MUSS DAS TRAGEN KOENNEN (Stolperstein 189): waere jeder
     abgelehnte Eintrag auch getestet, lieferten beide Filter dieselbe Menge,
     und „kombinierbar" liesse sich gar nicht belegen. Deshalb kommen alle
     VIER Kombinationen vor. */
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
     setzen. Jede Stellung bekommt deshalb ihr eigenes DOM mit gespeicherten
     Filtern -- der echte Weg, so wie die Tagfilter und die Favoriten. */
  const fromBuild = async (filters) => {
    const d = buildDom(JSDOM, { overviewItems: fromInventory, settings: { filters } });
    await new Promise(r => setTimeout(r, 80));
    return d;
  };

  // ERST DER GEGENSTAND (Stolperstein 81): ohne die vier Zeilen belegt keine
  // Menge darunter etwas.
  const fromAll = await fromBuild(null);
  check('Die Prueflage traegt alle vier Kombinationen',
    fromTitle(fromAll).length === 4, JSON.stringify(fromTitle(fromAll)));

  /* ---- DIE GRUPPE STEHT IN DER ZEILE „STATUS" UND IST ABGESETZT. Eine
     eigene Zeile gaebe von der in 0.13.0 gewonnenen Hoehe wieder etwas her;
     die zweite Beschriftung setzt sie ab, ohne eine Zeile zu kosten. ---- */
  const fromRow = fromAll.w.document.querySelector('#filters .frow');
  const fromGroup = fromAll.w.document.getElementById('f-abgelehnt');
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
  /* DIE REIHE DAVOR BLEIBT BEI DREI WERTEN. Waere „abgelehnt" dort als
     vierter Knopf gelandet, liesse sich „getestet UND abgelehnt" gar nicht
     mehr einstellen -- und genau das ist der Punkt dieser Runde. */
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

  /* ---- DIE KOMBINATION, IN BEIDEN RICHTUNGEN. Das ist der eigentliche
     Beleg der Bauform: als vierter Wert von `tested` waere keine der beiden
     Mengen zu erreichen. ---- */
  const fromBoth = await fromBuild({ tested: 'tested', rejected: 'ja' });
  check('„Getestet UND abgelehnt" ist einstellbar und trifft genau einen',
    equal(fromTitle(fromBoth), ['Getestet und abgelehnt']), JSON.stringify(fromTitle(fromBoth)));
  const fromAgainst = await fromBuild({ tested: 'untested', rejected: 'nein' });
  check('„Ungetestet UND nicht abgelehnt" ebenso',
    equal(fromTitle(fromAgainst), ['Ungetestet und nicht abgelehnt']), JSON.stringify(fromTitle(fromAgainst)));
  /* UND DIE GEGENPROBE ZUR PRUEFLAGE SELBST: die beiden Filter liefern
     einzeln VERSCHIEDENE Mengen. Waeren sie gleich, belegte die Kombination
     darueber nichts (Stolperstein 189). */
  const fromOnlyTested = await fromBuild({ tested: 'tested' });
  check('Teststatus und Ablehnung treffen wirklich verschiedene Mengen',
    !equal(fromTitle(fromOnlyTested), fromTitle(fromJa)),
    JSON.stringify([fromTitle(fromOnlyTested), fromTitle(fromJa)]));

  /* ---- EIN KLICK, WIRKLICH ZUGESTELLT (Stolperstein 61). Ein gebauter DOM
     zeigt nicht, was ein Druck tut. ---- */
  const fromGruppe2 = fromAll.w.document.getElementById('f-abgelehnt');
  const fromPill = [...fromGruppe2.querySelectorAll('.pill')].find(b => b.textContent === 'Abgelehnt');
  fromPill.dispatchEvent(new fromAll.w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 60));
  check('Ein Druck auf „Abgelehnt" verkleinert die Liste sofort',
    equal(fromTitle(fromAll), ['Getestet und abgelehnt', 'Ungetestet und abgelehnt']),
    JSON.stringify(fromTitle(fromAll)));
  check('Und die Pille steht danach gesetzt da',
    fromAll.w.document.querySelector('#f-abgelehnt .pill.on')?.textContent === 'Abgelehnt',
    JSON.stringify(fromAll.w.document.querySelector('#f-abgelehnt .pill.on')?.textContent));
  /* DIE STELLUNG WIRD GESPEICHERT wie jeder andere Filter -- der Server sieht
     `filters` als undurchschautes Objekt, und der neue Schluessel muss
     einfach mitfahren. */
  const fromSaved = fromAll.sent
    .filter(g => g.method === 'PUT' && g.url === '/api/settings').pop();
  check('Und sie faehrt in der gespeicherten Filterstellung mit',
    fromSaved?.body?.filters?.rejected === 'ja',
    JSON.stringify(fromSaved?.body?.filters));

  /* ---- filterZahl() ZAEHLT IHN MIT. Sonst sagte der eingeklappte
     Filterbereich die Unwahrheit ueber die eine Frage, die er aufwirft:
     „warum sehe ich nicht alles?" ---- */
  const fromNumber = (d) => d.w.document.querySelector('#filter-toggle .fcount')?.textContent || '';
  check('Ohne Filter steht keine Zahl am Schalter', fromNumber(fromNone) === '', fromNumber(fromNone));
  check('Mit dem Ablehnungsfilter steht dort eine Eins',
    /· 1 aktiv/.test(fromNumber(fromJa)), fromNumber(fromJa));
  /* ZWEI MERKMALE ZAEHLEN ZWEIMAL -- sie verkleinern die Menge auch zweimal.
     Ohne diese Zeile bliebe die darueber auch dann gruen, wenn der neue
     Filter mit dem Teststatus zu EINEM zusammengezaehlt wuerde. */
  check('Und mit dem Teststatz zusammen eine Zwei',
    /· 2 aktiv/.test(fromNumber(fromBoth)), fromNumber(fromBoth));
  check('„Nicht abgelehnt" zaehlt genauso mit wie „Abgelehnt"',
    /· 1 aktiv/.test(fromNumber(fromNo)), fromNumber(fromNo));

  /* ---- EINE GESPEICHERTE ANSICHT IN DER FORM VON 0.14.0 -- ohne den neuen
     Schluessel. Sie bleibt lesbar und faellt auf „Alle" zurueck. Das ist die
     Zusage von filterNormal(), und sie wird geprueft und nicht geglaubt. ---- */
  const fromOld = await fromBuild({ categoryIds: [], tagIds: [], tagMode: 'and', tested: 'tested',
                               favorite: false, fresh: false, sort: 'updated_desc' });
  check('Eine Ansicht ohne den neuen Schluessel bleibt lesbar',
    equal(fromTitle(fromOld), ['Getestet und abgelehnt', 'Getestet und nicht abgelehnt']),
    JSON.stringify(fromTitle(fromOld)));
  check('Und sie faellt bei der Ablehnung auf „Alle" zurueck',
    fromOld.w.document.querySelector('#f-abgelehnt .pill.on')?.textContent === 'Alle',
    JSON.stringify(fromOld.w.document.querySelector('#f-abgelehnt .pill.on')?.textContent));
  check('Der Schalter zaehlt dort nur den Teststatus',
    /· 1 aktiv/.test(fromNumber(fromOld)), fromNumber(fromOld));
  /* UND EIN UNBEKANNTER WERT NIMMT NICHTS WEG. Eine Ansicht aus einer
     spaeteren Fassung -- oder eine von Hand verbogene Ablage -- darf die
     Liste nicht leeren. */
  const fromCrooked = await fromBuild({ rejected: 'vielleicht' });
  check('Ein unbekannter Wert nimmt nichts weg', fromTitle(fromCrooked).length === 4,
    JSON.stringify(fromTitle(fromCrooked)));

  [fromAll, fromJa, fromNo, fromNone, fromBoth, fromAgainst, fromOnlyTested, fromOld, fromCrooked]
    .forEach(d => d.w.close());

  /* ================= Die Begruendung kommt zur Ruhe — 0.15.0 ===========
     DER ZWEITE BEFUND AUS DEM BETRIEB, und er trifft, was 0.14.0 gebaut hat:
     die Aussage stand da UND das Eingabefeld daneben stand dauerhaft offen --
     dieselbe Sache zweimal. Die Zusage „offen im Dialog und nicht hinter
     einem Aufklappen" galt der EINGABE; im Ruhezustand ist sie eine
     Doppelung.
     ZU BAUEN WAR DER RUHEZUSTAND: das Feld verschwindet nach der Eingabe, es
     kommt auf Klick zurueck -- auf den Text oder auf ein ✎ --, und ein ✕
     daneben entfernt die Begruendung.
     ZWEI SCHALTER BLEIBEN HIER NICHT AUS, und das ist der Punkt der Lagen:
     `rejectedMine` und `ADMIN`. Eine Gruppe, die nur den Ablehnenden faehrt,
     belegt nichts ueber die anderen drei. */
  group('Die Begruendung kommt zur Ruhe — 0.15.0');

  /* VIER LAGEN, und sie unterscheiden sich genau in den beiden Schaltern:
       ruhAblehner  -- die Fragende hat abgelehnt (rejectedMine).
       ruhAdmin     -- ein anderer hat abgelehnt, die Fragende ist Admin.
       ruhFremd     -- ein anderer hat abgelehnt, die Fragende ist es nicht
                       und hat auch den Eintrag nicht angelegt.
       ruhEigner    -- die Fragende hat den EINTRAG angelegt, aber nicht
                       abgelehnt, und ist kein Admin. Ohne sie bliebe `mine`
                       durchweg aus und belegte nichts.
     `vIch` ist die Fragende selbst (Nummer 1) -- daraus rechnet der Mock
     `rejectedMine`, so wie der echte Server. */
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

    /* --- ESCAPE VERWIRFT und schreibt ausdruecklich NICHT. Das Schliessen
       nimmt dem Feld den Zeiger und loest onblur aus; ohne das Zuruecksetzen
       davor schriebe genau der Weg weg, der verwerfen sollte. --- */
    const ruhVorEsc = d.sent.length;
    ruhField(d).value = 'Doch nicht so';
    ruhField(d).dispatchEvent(new d.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    /* UND JETZT DAS, WAS EIN ECHTER BROWSER VON SELBST TUT: das Schliessen
       nimmt dem Feld den Zeiger, und das loest `blur` aus -- also den
       Speicherweg. JSDOM TUT DAS NICHT; ein verstecktes Element behaelt dort
       den Fokus.
       OHNE DIESE ZEILE PRUEFT DIE GRUPPE DIE HALBE KETTE: sie saehe, dass das
       Feld zugeht, aber nicht, dass der verworfene Text nicht doch noch
       weggeschrieben wird. Rueckbau 265 nimmt genau das Zuruecksetzen weg und
       blieb daran STUMM -- das ist der Grund fuer diese Zeile und fuer
       Stolperstein 212. */
    ruhField(d).dispatchEvent(new d.w.FocusEvent('blur'));
    await new Promise(r => setTimeout(r, 60));
    check('Escape schliesst das Feld, ohne etwas zu schicken',
      ruhRow(d)?.hidden === true && d.sent.length === ruhVorEsc,
      JSON.stringify(d.sent.slice(ruhVorEsc).map(g => g.body)));
    /* UND DER TEXT IM FELD IST WIRKLICH ZURUECKGESETZT, nicht bloss ungesendet.
       Ohne diese Zeile bliebe die Pruefung darueber auch dann gruen, wenn der
       Speicherweg nur zufaellig nichts zu tun fand. */
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
     daraus ein Entfernen. Das Merkmal selbst wird ausdruecklich nicht
     zurueckgenommen; das ist der Schalter und eine andere Handlung. --- */
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
       steht dann gar nicht da, und ein `ruhQuestion.querySelector(...)` REISST
       DEN GANZEN LAUF AB. Die beiden Zeilen darueber werden richtig rot --
       aber die Gegenprobe kann einen abgerissenen Lauf nicht auswerten, und
       im Betrieb faellt die ganze Pruefung aus statt einer Gruppe
       (Stolperstein 211). */
    ruhQuestion?.querySelector('[data-yes]')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    const ruhPathCore = d.sent.filter(g => g.method === 'PUT' && g.url === '/api/items/1').pop();
    check('Nach dem Ja geht ein leerer Grund hinaus, und sonst nichts',
      equal(Object.keys(ruhPathCore?.body || {}), ['rejectedReason']) &&
      ruhPathCore?.body?.rejectedReason === '', JSON.stringify(ruhPathCore?.body));
    /* SEIT 0.15.1 TRITT DIE AUSSAGE DABEI ZURUECK, weil das Feld von selbst
       aufgeht: abgelehnt und kein Grund heisst offen. Der Grund ist weg, und
       das ist hier die Aussage der Zeile -- geprueft wird sie am naechsten
       Ruhezustand, gleich darunter. */
    check('Der Grund verschwindet aus der Aussage',
      !ruhWhy(d), JSON.stringify(ruhSentence(d)?.textContent));
    /* DATUM UND VERFASSER BLEIBEN STEHEN -- "Abgelehnt am … von …" ist
       weiterhin wahr, nur der Grund fehlt. Nachgesehen wird es im
       Ruhezustand: das Feld wird ueber Escape wieder zugemacht. */
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
       ZUSTAND: abgelehnt und kein Grund heisst offen. Damit braucht es hier
       kein ✎ mehr, um wieder hineinzukommen; der Weg steht ohnehin offen.
       Bis 0.15.1 stand hier das ✎ allein da und das Feld blieb zu. */
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
    // Fenster, und ein Griff ins Leere risse den Lauf ab (Stolperstein 211).
    d.w.document.querySelector('.backdrop [data-no]')
      ?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Ein Nein schickt nichts und laesst den Grund stehen',
      !d.sent.some(g => g.method === 'PUT' && g.url === '/api/items/1') &&
      ruhWhy(d)?.textContent === 'Zu ruhig', JSON.stringify(ruhWhy(d)?.textContent));
    d.w.close();
  }

  /* --- DER FREMDE ADMIN: entfernen ja, umschreiben nein. Das ist die
     Hausregel, und sie steht hier auf dem Bildschirm genauso wie im Server.
     Der Text ist dort AUCH nicht anklickbar -- sonst oeffnete sich ein Feld,
     dessen Inhalt der Server ablehnte. --- */
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
     getroffen zu haben. Er darf entfernen (darfAendern) und nicht
     umschreiben -- und genau an ihm haengt `mine`. OHNE DIESE LAGE bliebe der
     Schalter durchweg aus und belegte nichts. --- */
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

  /* --- OHNE VERFASSER DER BEGRUENDUNG -- eine Ablehnung aus einer Instanz vor
     0.14.0. Der Server laesst dort JEDEN schreiben, der den Eintrag aendern
     darf; ohne diesen Zweig gaebe es auf dem Bildschirm keinen Weg hinein,
     und die Zusage des Servers liefe ins Leere. --- */
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
       der Inhalt der Entscheidung. Weg bliebe sie nur, wenn gar nichts
       bekannt waere UND kein Zeichen dastuende -- diese Lage steht in der
       Gruppe von 0.14.0. */
    check('Das Datum liest sie aber weiterhin',
      ruhMark(foreign)?.hidden === false &&
      ruhSentence(foreign)?.textContent === 'Abgelehnt am 14.03.2026, 09:12',
      JSON.stringify([ruhMark(foreign)?.hidden, ruhSentence(foreign)?.textContent]));
    d.w.close(); foreign.w.close();
  }

  /* --- BEIM EINSCHALTEN STEHT DAS FELD SOFORT OFFEN. Das war der Sinn der
     Zusage aus 0.14.0 und bleibt: ein Feld, das man erst suchen muss, bleibt
     leer. Danach schliesst es sich. --- */
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

  /* --- DIE HERVORHEBUNG IM STILBLATT. Keine neue Farbe: der Strich traegt
     dieselben 42 Prozent Rot wie der Rand des Schalters, der Grund selbst
     `--red`. Eine Regel, die es nicht gibt, laesst die Aussage aussehen wie
     eine Randnotiz -- und genau das war der Befund. --- */
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
    /* KEINE NEUE FARBE, und das ist zu belegen und nicht zu behaupten. Rot
       steht hier in ZWEI Schreibweisen: ausgeschrieben (der Strich) und ueber
       einen Vorgabewert (der Grund, das Loeschkreuz). Beide werden einzeln
       nachgesehen -- ein Lauf, der nur die eine kennt, bliebe gruen, wenn die
       andere eine erfundene Farbe truege. */
    const ruhPlaces = [regel123('.rej-note'), regel123('.rej-note .rej-why'),
                        regel123('.rej-note .mact.rm:hover')].join(' ');
    const ruhRed = ruhPlaces.match(/#[0-9a-f]{3,8}|rgba?\([^)]*\)/gi) || [];
    const ruhVar = [...new Set(ruhPlaces.match(/var\(--[a-z0-9-]+\)/gi) || [])];
    check('Die Gruppe benutzt Rot in beiden Schreibweisen',
      ruhRed.length >= 1 && ruhVar.length >= 1, JSON.stringify([ruhRed, ruhVar]));
    check('Kein ausgeschriebener Rotwert ist neu',
      ruhRed.every(w => (css123.match(new RegExp(w.replace(/[().*+?^${}|[\]\\]/g, '\\$&'), 'gi')) || []).length > 1),
      JSON.stringify(ruhRed));
    /* UND JEDER BENUTZTE VORGABEWERT IST IM STILBLATT GESETZT. Ein var() auf
       einen Namen, den es nicht gibt, faellt lautlos auf "keine Farbe"
       zurueck -- die Aussage stuende dann im Erbwert da und saehe aus wie
       Absicht. */
    check('Und jeder benutzte Vorgabewert steht im Stilblatt',
      ruhVar.every(v => css123.includes(`${v.slice(4, -1)}:`)), JSON.stringify(ruhVar));
  }

  /* ---- `hidden` MUSS WIRKEN, UND ZWAR UEBERALL — 0.15.1 ----
     DER BEFUND AUS DEM BETRIEB: an einem NICHT abgelehnten Eintrag standen
     Aussage und Eingabefeld trotzdem da. `hidden` war an beiden gesetzt, und
     der Browser zeichnete sie mit `display: flex`. Der Grund ist eine
     Rangfrage: `[hidden] { display: none }` steht im Stylesheet des BROWSERS,
     und jede Regel aus `style.css` schlaegt die.
     WARUM DAS KEIN PRUEFLAUF GESEHEN HAT: jsdom rechnet kein CSS, und alle
     Pruefungen fragen `element.hidden` -- die EIGENSCHAFT. Die war wahr
     (Stolperstein 212). Nachgemessen wurde in Chromium; die Zahlen stehen im
     Aenderungsprotokoll 0.15.1.
     WAS HIER GEHT, IST DIE REGEL SELBST -- und das ist kein Ersatz fuer die
     Messung, sondern die Sperre dagegen, dass sie wieder verschwindet. */
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
    /* UND SIE STEHT GENAU EINMAL. Zwei oertliche Flicken (`.user-new [hidden]`
       und `.lb-btn[hidden]`) hatten dasselbe Problem zweimal an seiner
       jeweiligen Stelle geloest -- und beim dritten Mal schlug es wieder zu.
       Eine zweite Regel daneben waere genau die zweite Wahrheit, die diese
       Runde aufloest. */
    /* GEZAEHLT WIRD OHNE DIE KOMMENTARE. Der Kommentar ueber der Regel nennt
       `[hidden]` mehrfach, und ein Zaehler, der ihn mitliest, meldet drei
       Regeln, wo eine steht -- er waere rot, ohne dass etwas falsch ist
       (Stolperstein 156: gezaehlt wird, was gemeint ist). */
    const cssWithoutComment = css123.replace(/\/\*[\s\S]*?\*\//g, ' ');
    const hidAll = cssWithoutComment.match(/[^{}]*\[hidden\][^{}]*\{/g) || [];
    check('Und sie steht genau einmal, ohne oertliche Flicken daneben',
      hidAll.length === 1, JSON.stringify(hidAll));
    /* DIE GEGENPROBE ZUM MASSSTAB: es gibt ueberhaupt Regeln, die `display`
       setzen und ein Element mit `hidden` treffen koennen -- sonst pruefte die
       Zeile darueber eine Sache ohne Gegenstand (Stolperstein 81). */
    const hidDanger = ['.row-in', '.rej-note', '.lb-btn']
      .filter(w => /display:\s*(flex|grid|block|inline-flex)/.test(regel123(w)));
    check('Und es gibt wirklich display-Regeln, die `hidden` schlagen wuerden',
      hidDanger.length === 3, JSON.stringify(hidDanger));
  }

  /* ================= Export und Import stehen in EINER Karte — 0.16.0 ====
     SIE MEINEN DIESELBE DATEI: die eine geht hinaus, dieselbe kommt herein.
     Getrennt standen sie als Karte 6 und 7 nebeneinander, und wer die eine
     suchte, las erst die andere.
     ABER NICHT GLEICHRANGIG -- und das ist der ganze Vorbehalt dieser
     Zusammenlegung: der Export LIEST, der Import ERSETZT BESTAND. Die
     zerstoerende Haelfte darf durch das Zusammenlegen nicht einen Klick naeher
     ruecken. Geprueft wird deshalb BEIDES: dass sie zusammenstehen UND dass
     die untere untergeordnet gezeichnet ist. */
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
    /* UND ES GIBT KEINE ZWEITE DANEBEN. Ohne diese Zeile bliebe die darueber
       auch dann gruen, wenn zusaetzlich noch die alte Importkarte stuende
       (Stolperstein 74: die Pruefung der Vorgaengerfassung wird umgedreht). */
    check('Und es gibt keine eigene Karte „Import" mehr',
      !cards.some(k => k.querySelector('h3')?.textContent.trim() === 'Import'),
      cards.map(k => k.querySelector('h3')?.textContent.trim()).join(' · '));
    check('Beide Haelften stehen wirklich darin',
      !!ex?.querySelector('#ex-yes') && !!ex?.querySelector('#ex-no') &&
      !!ex?.querySelector('#ex-plan') && !!ex?.querySelector('#imp'),
      `ex-yes ${!!ex?.querySelector('#ex-yes')} · imp ${!!ex?.querySelector('#imp')}`);
    /* DIE UNTERORDNUNG, an drei Merkmalen und nicht an einem Gefuehl:
       eine eigene, kleinere Ueberschrift, ein Trennstrich davor und das leise
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
    /* BEIDE HAELFTEN GESCHUETZT (Stolperstein 161): faellt die Karte weg, muss
       diese Zeile ROT werden koennen und darf den Lauf nicht mitreissen. */
    const setting = (w) =>
      [...(ex?.querySelectorAll('*') || [])].indexOf(ex?.querySelector(w) || null);
    check('Und er steht unter dem Export, nicht darueber',
      setting('#imp-drop') > setting('#ex-plan'),
      `${setting('#ex-plan')} gegen ${setting('#imp-drop')}`);
    // Und die Regel dazu steht wirklich im Stilblatt -- erst das Vorhandensein,
    // dann die Eigenschaft (Stolperstein 81).
    check('Die Regel fuer das leise Ablagefeld steht im Stilblatt',
      regel123('.drop-quiet').length > 0, '(keine Regel)');
    check('Und sie nimmt ihm den eigenen Untergrund',
      /background: none/.test(regel123('.drop-quiet')), regel123('.drop-quiet'));
    check('Die Regel fuer die untergeordnete Ueberschrift ebenso',
      regel123('.sys-card .sys-sub').length > 0, '(keine Regel)');
    /* KLEINER ALS DAS h3 DARUEBER -- sonst waere es keine Stufe, sondern eine
       zweite Karte im selben Rahmen. Verglichen werden die beiden Groessen aus
       dem Stilblatt und nicht zwei Zahlen von Hand. */
    const grOut = (w) => parseFloat((regel123(w).match(/font-size:\s*([\d.]+)rem/) || [])[1] || '0');
    check('Und sie ist kleiner als die Ueberschrift der Karte',
      grOut('.sys-card .sys-sub') > 0 && grOut('.sys-card h3') > 0 &&
      grOut('.sys-card .sys-sub') < grOut('.sys-card h3'),
      `${grOut('.sys-card .sys-sub')} gegen ${grOut('.sys-card h3')}`);
    d.w.close();
  }

  /* ================= Die Rechnung hinter der Kopfzahl — 0.16.0 ==========
     „⌀ 4,2 gewichtet" war richtig und erklaerte sich nicht. Der Kasten zeigt
     DIE RECHNUNG DIESES EINTRAGS -- kein erfundenes Beispiel.
     UND ER LIEST SIE, ER RECHNET SIE NICHT NACH. Genau daran haengt die
     schaerfste Pruefung dieser Gruppe: die Prueflage liefert einen Rechenweg,
     dessen `ergebnis` NICHT der Quotient seiner eigenen Zeilen ist. Rechnete
     die Oberflaeche nach, stuende der Quotient im Kasten -- und die Zeile
     wuerde rot (Stolperstein 102). */
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
       ein. Stuende es hier, waere der Kasten eine andere Rechnung als die
       Zahl darueber. */
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
       Rechenweg der Prueflage nennt als Ergebnis aber ausdruecklich 3. Steht
       hier 3, LIEST die Oberflaeche; stuende 3,7, RECHNETE sie nach, und der
       Kasten waere eine zweite Wahrheit ueber dieselbe Zahl. */
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

    /* ---- DER KASTEN ROLLT NICHT MEHR — 0.17.3 ----
       GEPRUEFT WIRD, WAS SICH HIER PRUEFEN LAESST: dass die eine doppelte
       Angabe weg ist und dass unter der Tabelle zwei Absaetze stehen und nicht
       drei. Die HOEHE ist es nicht -- jsdom rechnet kein Layout, und die
       gemessenen Pixel stehen im Aenderungsprotokoll (Stolperstein 223). */
    const rgChildren = [...(box?.children || [])];
    const rgAfterTable = rgChildren.slice(rgChildren.findIndex(k => k.classList.contains('calc')) + 1)
      .filter(k => k.tagName === 'P');
    check('Unter der Tabelle stehen zwei Absaetze und nicht drei',
      rgAfterTable.length === 2, `${rgAfterTable.length} Absaetze`);
    /* DIE AUSGESCHRIEBENE RECHNUNG IST DIE EINE ANGABE, DIE DOPPELT DASTAND:
       Summe, Teiler und Ergebnis tragen eigene Zeilen in der Tabelle. Gesucht
       wird nach dem Rechenzeichen mit den beiden Zahlen daneben, nicht nach
       dem Wort "gerundet" -- das bleibt ja stehen. */
    const rgText = (box?.textContent || '').replace(/\s+/g, ' ');
    check('Die Rechnung steht nicht ein zweites Mal unter der Tabelle',
      !/9,2 ÷ 2,5/.test(rgText), rgText.slice(-260));
    check('Die Begruendung zum Teiler steht nicht mehr da',
      !/nach unten/.test(rgText), rgText.slice(0, 400));
    check('Der Teiler selbst steht weiterhin da',
      /Kriterien ohne Sterne zählen nicht mit/.test(rgText),
      rgText.slice(0, 400));
    /* UND DIE BEIDEN ZAHLEN IM STILBLATT. Sie sind die andere Haelfte des
       Punktes: die Zeilen ruecken enger, und der Kasten wird breiter, damit
       der Fliesstext seltener umbricht. */
    check('Die Zeilen der Rechnung ruecken enger zusammen',
      /\.calc-row > span \{ padding: 3px 0;/.test(css123),
      (css123.match(/\.calc-row > span \{[^}]*\}/) || ['(keine Regel)'])[0]);
    check('Und der Kasten selbst wird breiter',
      /\.calc-modal \{ max-width: 620px; \}/.test(css123),
      (css123.match(/\.calc-modal \{[^}]*\}/) || ['(keine Regel)'])[0]);

    /* ---- DER VERWEIS ZEIGT IN DEN KASTEN — 0.17.0 ----
       BIS 0.17.0 STAND HIER „die Zahlen rechts in den Zeilen". Gemeint war die
       Durchschnittsspalte der Kriterienliste DAHINTER -- und die gibt es bei
       genau EINEM Zugang nicht. Derselbe blinde Fleck wie am Raster, eine
       Ansicht weiter.
       GEPRUEFT WIRD BEIDES: dass der Satz die Spalte beim Namen nennt UND dass
       es diese Spalte im Kasten wirklich gibt. Ein Satz, der auf eine Spalte
       zeigt, die es nicht gibt, ist genau der Fehler, um den es geht -- und
       eine Zusage, die nur den Satz liest, faende ihn nicht (Stolperstein 81). */
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

    /* ---- DIE VERGLEICHSZAHL OHNE GEWICHTE — 0.17.0 ----
       DIE FORMEL STAND ZEILE FUER ZEILE DA und liess trotzdem offen, WOFUER
       die Gewichte gut sind. Erst der Unterschied macht die Gewichtung
       sichtbar.
       ERST DIE PRUEFLAGE SELBST (Stolperstein 224): sind beide Zahlen gleich,
       kann diese Gruppe den Unterschied gar nicht zeigen -- dann wird DIESE
       Zeile rot und nicht die Zusagen darunter stumm. */
    check('Die Prueflage taugt: gewichtet und ungewichtet sind verschieden',
      doc.getElementById('calc-same')?.textContent.trim() !== '⌀ 3' &&
      (doc.getElementById('calc-same')?.textContent || '').trim().length > 0,
      `${doc.getElementById('calc-result')?.textContent} gegen ` +
      `${doc.getElementById('calc-same')?.textContent}`);
    check('Der Kasten nennt die Zahl ohne Gewichte',
      doc.getElementById('calc-same')?.textContent.trim() === '⌀ 4',
      doc.getElementById('calc-same')?.textContent);
    /* SIE WIRD GELESEN UND NICHT NACHGERECHNET (Stolperstein 217). (3,4 + 4,1)
       ÷ 2 ergibt 3,75 und gerundet 3,8 -- der Rechenweg der Prueflage nennt
       aber ausdruecklich 4. Steht hier 4, LIEST die Oberflaeche; stuende 3,8,
       rechnete sie nach, und der Kasten waere eine zweite Rechenstelle. */
    check('Und sie kommt aus der Antwort, statt im Browser gerechnet zu werden',
      !/3,8/.test(doc.querySelector('.calc')?.textContent || ''),
      doc.querySelector('.calc')?.textContent?.replace(/\s+/g, ' '));
    /* SO VIELE ZELLEN, WIE DAS RASTER SPALTEN HAT -- UND DIE ZAHL WIRD
       GELESEN, NICHT HINGESCHRIEBEN. Eine Zeile mit einer Zelle zu wenig
       schoebe alles darunter um eine Spalte weiter, genau der Fehler, den
       Punkt 1 derselben Runde behebt.
       EINE VIER, DIE IN DER PRUEFUNG STEHT UND NICHT IM STILBLATT, WAERE
       DIESELBE ZWEITE WAHRHEIT (Stolperstein 47/223): wer die Spaltenzahl des
       Kastens aenderte, bekaeme hier eine gruene Zusage ueber ein zerfallenes
       Raster -- und das ist woertlich der Befund, aus dem Punkt 1 entstand. */
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
    /* UND JEDE ANDERE ZEILE EBENSO. Ohne diese Zeile bliebe die darueber
       gruen, waehrend eine Nachbarzeile das Raster sprengt -- dieselbe
       Bauform wie an der Kriterienliste. */
    const rgAll = [...(box?.querySelectorAll('.calc > .calc-row') || [])]
      .map(z => z.children.length);
    check('Und jede Zeile des Kastens traegt dieselbe Zahl',
      rgAll.length > 0 && rgColumns > 0 && rgAll.every(n => n === rgColumns),
      `${JSON.stringify(rgAll)} gegen ${rgColumns} Spalten`);
    /* UND DIE REGEL IM STILBLATT, DIE SIE UNTERORDNET. Der Kommentar an ihr
       macht vier Zusagen -- gedaempft, ohne fetten Schnitt, ein Strich darueber,
       keine neue Farbe --, und ein Kommentar ist keine Pruefung
       (Stolperstein 199). Ohne diese Zeilen bliebe die Regel ungeprueft, und
       ein Rueckbau an ihr faerbte nichts rot. */
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
    /* DER GEGENSATZ MUSS ES AUCH GEBEN (Stolperstein 81): „untergeordnet"
       belegt nichts, wenn die Zeile darueber selbst nicht hervorgehoben ist. */
    const rgErgRule = regel123('.calc-result > span');
    check('Die Zeile darueber traegt dagegen den fetten Schnitt',
      /font-weight: 6\d\d/.test(rgErgRule), rgErgRule || '(keine Regel)');
    check('Und sie steht unter dem Ergebnis, nicht darueber',
      [...(box?.querySelectorAll('.calc > .calc-row') || [])].indexOf(rgRow) >
      [...(box?.querySelectorAll('.calc > .calc-row') || [])]
        .indexOf(box?.querySelector('.calc-result')),
      'die Vergleichszahl steht vor dem Ergebnis');
    /* UND EIN SATZ SAGT, WAS SIE BEDEUTET. Eine Zahl ohne Deutung waere die
       fuenfte Zahl im Kasten und nicht die Antwort auf „wofuer sind die
       Gewichte gut". */
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
     1, ist die Vergleichszahl dieselbe Zahl wie darueber, und zweimal dasselbe
     hinzuschreiben ist keine Auskunft. DIE GEGENLAGE ZUR GRUPPE DARUEBER
     (Stolperstein 81): ohne sie bliebe „die Zeile steht da" auch dann gruen,
     wenn sie immer stuende. */
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
     dieselbe Zahl hinzuschreiben. Die Gewichte wirken, das Ergebnis faellt
     nach dem Runden trotzdem gleich aus; das ist eine eigene Auskunft und
     kein Sonderfall zum Verschweigen. */
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
     leeres Fenster oeffnet, ist einer zu viel. Die Gegenlage zur Gruppe
     darueber (Stolperstein 81): ohne sie bliebe „der Knopf steht da" auch
     dann gruen, wenn er immer stuende. */
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

  /* UND DIE LAGE MIT EINEM EINZIGEN ZUGANG — 0.17.0. Die Frage dieser Runde,
     hier an den Kasten gestellt: was sieht ein Betreiber, der allein arbeitet?
     Hinter dem Kasten liegt dann eine Kriterienliste OHNE Durchschnittsspalte.
     Der Satz im Kasten darf sich darauf nicht stuetzen -- er nennt die Spalte
     „Note", und die gehoert dem Kasten selbst.
     OHNE DIESE LAGE waere die Zusage darueber nur eine Aussage ueber den
     Mehrbenutzerbetrieb, und genau daran ist Punkt 1 dieser Runde gescheitert
     (Stolperstein 227). */
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

  /* ================= Die Glocke in der Kopfzeile — 0.16.0 ===============
     DREI DINGE ZUSAMMEN: der Punkt an der Glocke, die Zahl am Knopf „Offen"
     und die Tafel dahinter. Und die Lage, in der es die Glocke GAR NICHT gibt
     -- ohne sie waere „die Glocke steht da" von „sie steht immer da" nicht zu
     unterscheiden (Stolperstein 81).
     SEIT 0.17.0 SAGT DIE TAFEL, WAS NEU IST -- „3 Kommentare · 4 Bewertungen"
     statt „7 neue Beitraege" -- UND VON WEM. „Beitrag" ist ein Sammelwort, das
     die Instanz sonst nirgends benutzt.
     DIE LAGE MIT EINEM EINZIGEN ZUGANG BELEGT SEIT 0.17.2 WIEDER DAS
     GEGENTEIL: die Glocke meldet nur FREMDE Beitraege, und bei einem einzigen
     Zugang bleibt sie deshalb still. Das ist die gewollte Folge und keine
     Luecke -- eine Glocke ist eine Nachricht von jemand anderem. Die Zusage
     ist umgedreht worden und nicht geloescht (Stolperstein 201). */
  group('Die Glocke in der Kopfzeile');

  /* DER EIGENE NAME BLEIBT IN DER TABELLE STEHEN -- er belegt seit 0.17.2
     seine ABWESENHEIT und nicht mehr sein Dasein. Ohne einen Namen, von dem
     bekannt ist, dass er der eigene ist, liesse sich „er steht nicht darin"
     gar nicht pruefen. */
  const glFrom = { bert: { id: 2, name: 'bert', deleted: false },
                  carla: { id: 3, name: 'carla', deleted: false },
                  dora: { id: 4, name: 'dora', deleted: false },
                  ich: { id: 1, name: 'chefin', deleted: false } };
  /* JE EINTRAG ZWEI ZAHLEN UND EINE LISTE. Die beiden Zeilen sind bewusst
     UNGLEICH gebaut: die erste traegt beide Arten, die zweite nur eine -- ohne
     das liesse sich „bei einer Art steht auch nur eine Angabe da" gar nicht
     belegen (Stolperstein 189). */
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
    /* OHNE BEZUGSPUNKT GIBT ES KEINE GLOCKE. Der Mock nimmt die drei Angaben
       dann aus der Antwort -- wie der echte Server, der sie gar nicht erst
       bildet. */
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
    /* DREI KOMMENTARE UND EINE BEWERTUNG AM ERSTEN, EIN KOMMENTAR AM ZWEITEN.
       Die Summe ueber beide ist damit 5, und die beiden Zeilen unterscheiden
       sich in der ART -- ohne das koennte die Gruppe „bei einer Art steht auch
       nur eine Angabe da" nicht zeigen. */
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
    /* EINE ZAHL IM TITEL, UND ZWAR DIE SUMME. Der Titel beantwortet „gibt es
       etwas", die Tafel beantwortet „was" -- eine Aufzaehlung im Titel machte
       aus einem Hinweis eine Liste.
       DIE SUMME BILDET DIE OBERFLAECHE, an genau einer Stelle: der Server
       liefert zwei Zahlen und keine Summe. 3 + 1 + 1 + 0 = 5. */
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
    /* UND SIE SAGT, WESSEN BEITRAEGE SIE MELDET. DIESE ZEILE HAT GEFEHLT, und
       die Gegenprobe hat es gezeigt: der Rueckbau, der die alte Zusage „von
       allen, die eigenen stehen mit da" wieder hineinschreibt, blieb STUMM --
       der Einleitungssatz der Tafel war an keiner Stelle geprueft.
       ERST DAS VORHANDENSEIN, DANN DIE VERNEINUNG (Stolperstein 81): ein
       ersatzloses Loeschen des Absatzes bliebe sonst gruen. */
    const glSentence = (panel?.textContent || '').replace(/\s+/g, ' ');
    /* SEIT 0.32.0 SAGT ER MEHR -- F4. Er nennt die drei Herkuenfte, nach denen
       die Tafel darunter trennt: an dich gerichtet, deine {entryMany}, alles
       andere. Bis 0.31.4 stand dort „Neue Kommentare und {ratingMany} anderer
       Benutzer, seit du diese Liste zuletzt geoeffnet hast" -- sachlich
       richtig und ohne Antwort auf die Frage, die sich der Leser stellt. */
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
    /* MITGENOMMEN MIT 0.17.0 (Stolperstein 201): hier stand „3 neue Beitraege".
       „Beitrag" ist ein Sammelwort, das die Instanz sonst nirgends benutzt, und
       es liess offen, ob Kommentare oder Bewertungen gemeint sind. Die Auskunft
       lag laengst vor und wurde weggeworfen.
       VERGLICHEN WIRD DER GANZE TEXT DER ZELLE und nicht ein Ausschnitt: „1
       Kommentar" ist in „1 Kommentare" enthalten, und eine Pruefung, die die
       Einzahl mit einem Ausschnitt sucht, kann an der Mehrzahl nicht scheitern. */
    const glNumber = (i) => rows[i]?.querySelector('.mcount')?.textContent?.trim();
    check('Sie nennt die Arten getrennt statt sie zusammenzuzaehlen',
      glNumber(0) === '3 Kommentare · 1 Bewertung', JSON.stringify(glNumber(0)));
    /* BEI NUR EINER ART STEHT AUCH NUR EINE ANGABE DA. „0 Bewertungen" waere
       eine Auskunft ueber nichts -- dieselbe Regel wie die fehlende Null am
       Knopf „Offen". */
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
    /* UND JEDE ZEILE SAGT, VON WEM. Ohne den Namen liesse sich seit 0.17.0
       nicht mehr unterscheiden, ob dort jemand anders war oder man selbst --
       die Glocke meldet beides. */
    const glWho = (i) => rows[i]?.querySelector('.bell-from')?.textContent?.trim();
    check('Jede Zeile sagt, von wem',
      glWho(0) === 'von bert und carla', JSON.stringify(glWho(0)));
    check('Bei einem Namen ohne „und"',
      glWho(1) === 'von dora', JSON.stringify(glWho(1)));
    /* ZWEIMAL UMGEDREHT UND NIE GELOESCHT (Stolperstein 201). Bis 0.16.0 hiess
       die Zeile „Eigene Beitraege stehen nie hier", 0.17.0 machte daraus „der
       eigene Name steht ausdruecklich mit da". SEIT 0.17.2 GILT WIEDER 0.16.0:
       der Server schickt die eigene Hand gar nicht erst mit, und in der Tafel
       steht der eigene Name deshalb nirgends.
       GEPRUEFT WIRD DIE GANZE TAFEL und nicht eine Zeile: der Name faellt in
       KEINER Zeile an, und eine Pruefung auf eine einzelne liesse die andere
       offen. */
    check('Und der eigene Name steht in keiner Zeile',
      !/chefin/.test(panel?.textContent || ''),
      panel?.textContent?.replace(/\s+/g, ' ').slice(0, 300));
    /* UND DIE TAFEL BEGRUENDET DAS NICHT. Sie sagt, WAS IST -- der Satz „Eigene
       Beitraege stehen nie hier" war eine Auskunft ueber den Bau und stand
       schon bis 0.16.0 zu Unrecht darin (Projektstand 5.6). */
    check('Die Tafel begruendet das Fehlen aber nicht',
      !/Eigene Beiträge stehen nie hier/.test(panel?.textContent || ''),
      panel?.textContent?.replace(/\s+/g, ' ').slice(0, 300));
    /* MITGENOMMEN MIT 0.17.0, NICHT GELOESCHT (Stolperstein 201): bis dahin
       stand hier „die Tafel sagt, was sie nicht verspricht". Der Block ist
       ersatzlos gestrichen und steht nur noch in der README -- eine
       Oberflaeche sagt, WAS IST, nicht, warum sie so gebaut ist. Die Zusage
       ist deshalb umgedreht worden statt zu verschwinden; sonst baute sie
       jemand in zwei Jahren wieder ein. */
    check('Die Tafel begruendet sich nicht mehr selbst',
      !/nicht verspricht|Lesestand je Meldung|nicht laufend/.test(panel?.textContent || ''),
      panel?.textContent?.replace(/\s+/g, ' ').slice(-260));
    /* UND DIE AUSKUNFT IST DAFUER IN DER README -- erst das Vorhandensein,
       dann die Verneinung (Stolperstein 81). Ein Text, der aus der Instanz
       faellt und nirgends sonst steht, ist verloren und nicht umgezogen. */
    check('Dafuer steht sie in der README',
      /keinen Lesestand je Meldung/.test(readmeFlat) &&
      /nicht laufend/.test(readmeFlat),
      'die README traegt den Vorbehalt nicht');
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
    /* SORTIERT WIRD NACH DER SUMME UND NICHT NACH EINEM DER BEIDEN TEILE. Die
       Lage stellt den Unterschied ausdruecklich her (Stolperstein 224): der
       erste Eintrag hat WENIGER Kommentare und trotzdem mehr Neues. Nach
       `neuKommentare` sortiert stuende er unten. */
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
      rows[0]?.querySelector('.mcount')?.textContent?.trim() === '1 Kommentar · 4 Bewertungen',
      JSON.stringify(rows[0]?.querySelector('.mcount')?.textContent));
    check('Und die Mehrzahl ebenso',
      rows[1]?.querySelector('.mcount')?.textContent?.trim() === '3 Kommentare',
      JSON.stringify(rows[1]?.querySelector('.mcount')?.textContent));
    /* JE ZEILE GENAU EINE ANGABE, und sie wird am GEGENSTAND gelesen und nicht
       an einem Attribut (Stolperstein 223): zwei .mcount nebeneinander saehen
       im Text aus wie eine. */
    check('Jede Zeile traegt genau eine solche Angabe',
      rows.every(z => z.querySelectorAll('.mcount').length === 1),
      JSON.stringify(rows.map(z => z.querySelectorAll('.mcount').length)));
    /* UND DER KNOPF „OFFEN" BLEIBT EINE ZAHL. Er zaehlt EINE Sache, nicht
       zwei -- ein Trennpunkt dort waere die Aufteilung an der falschen
       Stelle. */
    check('Der Knopf „Offen" traegt weiterhin genau eine Zahl',
      /^\d+$/.test(doc.getElementById('open-count')?.textContent || ''),
      doc.getElementById('open-count')?.textContent);
    d.w.close();
  }

  {
    /* DIE GEGENRICHTUNG: nur Bewertungen, und eine davon in der Einzahl. Ohne
       sie belegte die Gruppe die Aufteilung nur in einer Richtung -- ein
       Rueckbau, der die beiden Felder vertauscht, bliebe stumm. */
    /* OHNE NAMEN, WIE DER ECHTE SERVER (Stolperstein 90): er speist `neuVon`
       aus den KOMMENTAREN, und hier gibt es keine. Ein Mock, der hier Namen
       hineinlegte, deckte genau die Zusage zu, um die es geht. */
    const d = await glBuild([[0, 4, []], [0, 1, []]]);
    const doc = d.w.document;
    doc.getElementById('bell')?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const rows = [...doc.querySelectorAll('#bell-list .bell-row')];
    check('Die Prueflage traegt zwei Zeilen mit nur Bewertungen',
      rows.length === 2, `${rows.length} Zeilen`);
    check('Nur Bewertungen: nur diese Angabe steht da',
      rows[0]?.querySelector('.mcount')?.textContent?.trim() === '4 Bewertungen',
      JSON.stringify(rows[0]?.querySelector('.mcount')?.textContent));
    check('Und die Einzahl der Bewertung steht richtig da',
      rows[1]?.querySelector('.mcount')?.textContent?.trim() === '1 Bewertung',
      JSON.stringify(rows[1]?.querySelector('.mcount')?.textContent));
    check('Das Wort „Kommentar" steht dann in keiner Zeile',
      !rows.some(z => /Kommentar/.test(z.textContent || '')),
      rows.map(z => z.textContent.replace(/\s+/g, ' ')).join(' | '));
    /* UND KEIN NAME. Wer welche Bewertung abgegeben hat, ist eine Angabe ueber
       einzelne Personen -- der Server liefert die Namen nur zu Kommentaren,
       und die Zeile schreibt hin, was sie bekommt. Hier steht die Zusage an der
       OBERFLAECHE, damit sie auch dann rot wird, wenn jemand den Namen im
       Browser aus einer anderen Quelle zusammensuchte. */
    check('Und kein Name steht neben einer reinen Bewertungszeile',
      rows.every(z => (z.querySelector('.bell-from')?.textContent || '') === ''),
      JSON.stringify(rows.map(z => z.querySelector('.bell-from')?.textContent)));
    d.w.close();
  }

  {
    /* WAS EIN BETREIBER SIEHT, DER ALLEIN ARBEITET -- UMGEDREHT MIT 0.17.2 UND
       NICHT GELOESCHT (Stolperstein 201). Bis 0.16.0 meldete die Glocke nur
       FREMDE Beitraege und blieb bei einem einzigen Zugang zwangslaeufig
       still; 0.17.0 nahm die eigenen dazu, damit sie ihm ueberhaupt etwas
       meldet. SEIT 0.17.2 GILT WIEDER 0.16.0: eine Glocke ist eine Nachricht
       von jemand anderem, und ueber die eigene Hand braucht niemand eine.
       DIE STILLE IST DAMIT DIE ZUSAGE UND KEIN MANGEL. Der Server schickt bei
       einem einzigen Zugang keine Zahl mehr; die Lage bildet genau das ab.
       DER KNOPF BLEIBT TROTZDEM STEHEN. Ein Bezugspunkt ist da, also gibt es
       die Glocke -- sie traegt nur keinen Punkt. Ohne diese Zeile liesse sich
       „still" von „gar nicht gebaut" nicht unterscheiden (Stolperstein 81). */
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
    /* DIE ZEILE DER TAFEL BRICHT UM. Sie traegt seit 0.17.0 drei Stuecke, und
       das dritte gehoert in eine eigene Zeile -- sonst schrumpft der Titel zu
       Punkten, damit „3 Kommentare · 4 Bewertungen" und die Namen Platz haben.
       DIESELBE ANTWORT WIE AN DER ZEILE EINER ANMELDUNG in Punkt 4. */
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
     DIESELBE KLEMME WIE DARUNTER und dieselbe Rueckfrage. Ein Papierkorb im
     Vollbild, der ohne Frage loescht, waere der gefaehrlichste Knopf der
     Instanz -- deshalb steht der Abbruch hier vor dem Vollzug. */
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
       Papierkorb weg, ist `removed()` null. Ohne das Zeichen risse der Lauf hier
       ab, statt die Zusagen darunter rot zu faerben -- und eine abgerissene
       Gegenprobe belegt gar nichts (Stolperstein 161). Genau das hat Rueckbau
       297 vorgefuehrt. */
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
    /* DIE GEGENLAGE: ein Kommentarbild bekommt KEINEN Papierkorb im Vollbild.
       Es wird am Kommentar entfernt, und die Klemme dort ist eine andere --
       „dieselbe Klemme wie darunter" heisst auch, dass es ohne eine darunter
       keine gibt (Stolperstein 81). */
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
     SECHS HANDGRIFFE AUS EINEM RUNDLAUF VON HAND. Fuenf sind Wortlaut und
     Anordnung, einer ist ein echter Fehler. Sie stehen hier in derselben
     Reihenfolge wie im Auftrag, und jede Gruppe sagt oben, WAS sie belegen
     kann und was nicht. */

  /* ---- 1. Der Text im Kachel „Zugang" sagt, was gilt ---- */
  group('Der Zugangstext sagt, was gilt — 0.17.1');

  /* DREI SACHEN WAREN DARAN FALSCH: „freiwillig" auch bei eingeschalteter
     Selbstanmeldung, „Mindestens 10 Zeichen" am Adressfeld statt am Passwort,
     und ein Wirtsbefehl fuer Leute ohne Wirt.
     BEIDE LAGEN WERDEN GEFAHREN. Eine Gruppe, die nur den einen Zustand
     stellt, belegt nichts ueber den anderen -- und ein Satz, der IMMER
     dasteht, bestuende sie genauso (Stolperstein 81 und 189). */
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
    /* UND DIE ALTE BEHAUPTUNG IST WEG. „Ohne sie fehlt nichts" war die Lage,
       die der Satz behauptet hat -- bei eingeschalteter Selbstanmeldung stimmt
       sie nicht. */
    check('Die alte Behauptung „ohne sie fehlt nichts" steht nirgends mehr',
      !/Ohne sie fehlt nichts/.test(tOut) && !/Ohne sie fehlt nichts/.test(tAn),
      `${/Ohne sie fehlt nichts/.test(tOut)} / ${/Ohne sie fehlt nichts/.test(tAn)}`);

    /* DIE VORGABE STEHT AM FELD, FUER DAS SIE GILT. Erst dort, dann
       ausdruecklich NICHT am Adressfeld -- eine Verneinung allein belegte
       nicht, dass die Angabe ueberhaupt noch irgendwo steht. */
    const ztPw = dOut.w.document.getElementById('acc-new')
      ?.closest('.field')?.querySelector('label')?.textContent || '';
    check('Die Laengenvorgabe steht am Feld „Neues Passwort"',
      /mindestens 10 Zeichen/.test(ztPw), ztPw);
    check('Und nicht mehr am Adressfeld',
      !/Zeichen/.test(ztLabel(dOut)), ztLabel(dOut));
    check('Und auch nicht mehr im Absatz darunter',
      !/Mindestens 10 Zeichen/.test(tOut), tOut.slice(0, 260));

    /* DIE KLEMME SITZT AN DERSELBEN STELLE WIE DIE KARTE und nicht an einer
       zweiten Abfrage daneben (Stolperstein 47). Gezaehlt wird, was wirklich
       hinausgeht: waere fuer den neuen Satz ein eigener Abruf dazugekommen,
       stuenden hier zwei verschiedene Zahlen. */
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
    /* UND DER EINE MERKER ZIEHT WIRKLICH MIT. Wer die Selbstanmeldung in der
       Karte „Anfragen" umlegt, liest einen Abschnitt weiter sofort den Satz,
       der jetzt gilt -- und nicht den von vorhin. Ohne diese Lage bliebe der
       Merker eine Behauptung im Kommentar (Stolperstein 199). */
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

  /* WAS HIER AUSDRUECKLICH NICHT GEPRUEFT WIRD: DIE WIRKUNG. jsdom rechnet
     kein Layout -- jede Hoehe ist dort null, und ob eine Liste wirklich den
     Platz nimmt, den die Kachel hergibt, laesst sich nur am Bildschirm sehen.
     GEPRUEFT WIRD DIE REGEL IM STILBLATT und dass die Zeilen wirklich alle
     gezeichnet werden. Beides zusammen ist der Beleg, den es hier geben kann
     (Stolperstein 223). */
  {
    /* DAS RASTER STRECKT SEINE KINDER, und das ist die tragende Zusage:
       alle Kacheln einer Reihe sind gleich hoch.
       0.17.3 HAT HIER `align-items: start` GESETZT UND DAMIT GENAU DAS
       KAPUTTGEMACHT. Die Begruendung damals war eine Vermutung ueber den
       Leerraum, und sie war falsch -- in Chromium stand unter keiner Liste
       Luft. Die Zeile ist zurueckgenommen, und diese Pruefung haelt fest,
       dass sie nicht wiederkommt (Stolperstein 201). */
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
      /* DIE LISTE IST SO HOCH WIE IHR INHALT: `flex: 0 1 auto`. `auto` heisst,
         der Inhalt gibt das Mass; die `0` heisst, sie nimmt sich nichts von
         dem, was die Kachel neben ihr uebrig hat.
         0.17.2 BIS 0.17.4 STAND HIER `flex: 1 1 <Deckel>rem` mit
         `max-height: max-content`, und das war der Fehler (Stolperstein 256):
         wo `max-content` im Blockfluss nicht klemmt, fordert JEDE Liste ihre
         zehn Zeilen -- auch die leere. Gemeldet mit Bild von der laufenden
         Instanz: die Karte „Zugaenge" mit fuenf Zeilen stand 728 Pixel hoch,
         wo dieselbe Karte in Chromium 498 misst. */
      check(`${choice} ist so hoch wie sein Inhalt`,
        /flex: 0 1 auto/.test(rule), rule || '(keine Regel)');
      check(`${choice} haengt an keinem Schluesselwort mehr`,
        !/max-content/.test(rule), rule || '(keine Regel)');
      check(`${choice} deckelt in rem und nicht in Pixeln`,
        /max-height: [\d.]+rem/.test(rule), rule || '(keine Regel)');
      /* ZWEI ZAHLEN, UND SIE SIND KEINE ZWEITE WAHRHEIT UEBER DIESELBE SACHE:
         27,95rem sind ZEHN `.mrow` zu 41,92 px, 35rem sind FUENFZEHN
         `.log-row` zu 35 px. Eine Bedienzeile mit Knoepfen und eine
         Textzeile mit Trennlinie sind zwei verschiedene Dinge und duerfen zwei
         Masse haben. */
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
    /* ---- DIE LEERE LISTE IST EINE ZEILE HOCH — 0.17.4 ----
       Sie faellt nicht auf null zusammen, und sie sagt, dass nichts da ist.
       EINE REGEL FUER BEIDE LISTENARTEN und nicht sechs Zeichenwege. */
    const khEmpty = (withoutMedia.match(/\.manage-list > \.hint, \.log-list > \.hint \{[^}]*\}/) || [''])[0];
    check('Die Meldung einer leeren Liste steht auf der Hoehe einer Zeile',
      /display: flex/.test(khEmpty) && /align-items: center/.test(khEmpty),
      khEmpty || '(keine Regel)');
    /* `margin: 0` IST KEINE KOSMETIK, SONDERN DER GEMESSENE FEHLER. Das
       Protokoll meldet seine Leere als `<p class="hint">`, die anderen fuenf
       Listen als `<span>`; ein `<p>` traegt die Vorgabemarge des Browsers von
       1em. Gemessen in Chromium: 13,05 Pixel oben und unten, die leere Liste
       stand 68 Pixel hoch statt 35. jsdom rechnet keine Lage aus und faende das
       nie (Stolperstein 223) -- die Zeile im Stilblatt ist hier der Beleg. */
    check('Und sie traegt die Vorgabemarge ihres Absatzes nicht mit',
      /margin: 0/.test(khEmpty), khEmpty || '(keine Regel)');
    /* ZWEI ZEILENMASSE, WEIL ES ZWEI ZEILEN SIND -- dieselbe Unterscheidung wie
       beim Deckel darueber. Eine `.mrow` misst 41,92 px und rueckt 9 px ein,
       eine `.log-row` misst 35 und rueckt 2 ein. Ein gemeinsames Mass waere
       hier keine Regel, sondern ein Fehler an einer der beiden. */
    /* DIE EIGENE REGEL UND NICHT DIE SAMMELREGEL DARUEBER. Beide Waehler stehen
       zweimal im Stilblatt: einmal zusammen hinter einem Komma, einmal je fuer
       sich. Ohne Anker faende die Suche die Sammelregel zuerst und die Probe
       waere gruen, ohne das eigene Mass je gesehen zu haben.
       DER ANKER IST DAS `}` DAVOR UND NICHT DER ZEILENANFANG: `withoutMedia` ist
       EINE Zeile -- der Leser oben presst allen Weissraum auf ein Leerzeichen
       zusammen, und `^` mit `m` greift darin nie (Stolperstein 251). */
    const ownRule = (selector) =>
      (withoutMedia.match(new RegExp('\\} (' + selector + ' \\{[^}]*\\})')) || ['', ''])[1];
    const khEmptyOperate = ownRule('\\.manage-list > \\.hint');
    const khEmptyText = ownRule('\\.log-list > \\.hint');
    /* ZWEI ZEILEN UND NICHT EINE -- SEIT 0.18.1. Mit einer war die Leere nicht
       zu sehen: die Message stand als eine Textzeile zwischen zwei Absaetzen und
       las sich wie einer davon. Gemeldet am Bild der Karte „Anfragen".
       5.59rem SIND ZWEI `.mrow` zu 41,92 px, 4.666rem ZWEI `.log-row` zu 35
       -- dieselben zwei Masse wie beim Deckel darueber, nur verdoppelt. */
    check('Eine leere Bedienliste faellt nicht auf null zusammen',
      /min-height: 5\.59rem/.test(khEmptyOperate) && /padding: 0 9px/.test(khEmptyOperate),
      khEmptyOperate || '(keine Regel)');
    check('Und ein leeres Protokoll ebenso wenig, nach seinem eigenen Mass',
      /min-height: 4\.666rem/.test(khEmptyText) && /padding: 0 2px/.test(khEmptyText),
      khEmptyText || '(keine Regel)');
    /* ---- DIE SITZUNGSLISTE DECKELT NACH IHRER EIGENEN ZEILE — 0.18.1 ----
       KEINE DRITTE REGEL, SONDERN DIESELBE: zehn Zeilen, gemessen an der Zeile,
       die DIESE Liste wirklich hat. Eine `.mrow.sitz` ist ein Raster ueber drei
       Zeilen und misst 72,55 px, wo eine gewoehnliche `.mrow` 41,92 misst; mit
       dem gemeinsamen Deckel standen FUENF Sitzungen da, wo die Zusage zehn
       sagt.
       SEIT 0.26.0 SIND ES 48.37rem UND NICHT MEHR 55.23rem -- Befund 2. Die
       alte Zahl rechnete die Fusszeile mit (10 x 72,55 = 725,5 plus die 102,88
       der `.session-foot`), weil die Fusszeile INNERHALB der Liste stand. Auf
       einem schmalen Schirm ist eine Sitzungszeile hoeher als 72,55, und dann
       fiel die Fusszeile aus dem Deckel heraus. Sie steht seither als
       Geschwister daneben, und der Deckel deckelt nur noch Zeilen: 725,5 / 15
       = 48,367rem. DIE ZUSAGE GEHT MIT, statt geloescht zu werden
       (Stolperstein 201) -- sie zielt auf dieselbe Regel, nur auf ihre neue
       Zahl. */
    const khSitz = (withoutMedia.match(/#msessions \{[^}]*\}/) || [''])[0];
    check('Die Sitzungsliste deckelt nach ihrer eigenen Zeile',
      /max-height: 48\.37rem/.test(khSitz), khSitz || '(keine Regel)');
    /* UND SIE RECHNET DIE FUSSZEILE NICHT MEHR MIT. Die alte Zahl steht
       namentlich in der Verneinung: kaeme sie zurueck, waere der Befund
       zurueck. */
    check('Und rechnet die Fusszeile nicht mehr mit',
      !/max-height: 55\.23rem/.test(khSitz), khSitz || '(keine Regel)');
    /* ---- BEFUND 4 DER RUNDE 0.26.0 -- DIE TOTE REGEL IST WEG --------------
       Sie verband `.calc-sum` mit `:first-of-type` und gab den Spans einen
       `border-top`. `:first-of-type` zaehlt DIV-Geschwister, und das erste
       `div` im Raster ist `.calc-row.calc-head` -- die Regel hat NIE
       gegriffen. Der Strich, den man sieht, kam aus dem `border-bottom` der
       Zeile darueber; deshalb ist es niemandem aufgefallen.
       DER WORTLAUT STEHT NIRGENDS MEHR IM STILBLATT, auch nicht im Nachruf:
       der Kommentar an seiner Stelle umschreibt ihn ausdruecklich, damit
       diese Zeile ihn nicht in seiner eigenen Grabrede findet. */
    check('Die tote Regel am Erklaerkasten steht nirgends mehr im Stilblatt',
      !/\.calc-sum:first-of-type/.test(withoutMedia),
      (withoutMedia.match(/^.*calc-sum:first-of-type.*$/m) || ['(steht nicht mehr da)'])[0]);
    /* UND DER STRICH IST NICHT EINFACH VERSCHWUNDEN: er kommt jetzt aus der
       letzten Kriterienzeile, die ihn ohnehin zieht -- EIN Strich statt
       zweier. Ohne diese Zeile waere „die tote Regel ist weg" auch dann
       gruen, wenn jemand sie ersatzlos geloescht haette. */
    check('Und der Strich vor den Summen kommt aus der letzten Kriterienzeile',
      /\.calc-last > span \{ border-bottom-color: var\(--line\); \}/.test(withoutMedia),
      (withoutMedia.match(/^.*calc-last.*$/m) || ['(keine Regel)'])[0]);
    /* ---- BEFUND 5 -- DER HINWEIS AN DER ZEITLEISTE ------------------------
       Er steht mittig ueber seinem Punkt (`translateX(-50%)`) und trug
       `white-space: nowrap`: ein langer Eintragstitel machte ihn beliebig
       breit, und am rechten Ende der Achse ragte er hinaus.
       ZWEI MASSE UND NICHT EINES: `14rem` deckelt ihn in Zeilen, `46%` an der
       Achse -- der Ueberhang ist die halbe Kastenbreite, 46% heisst also
       hoechstens 23% Ueberhang, auch auf einem schmalen Schirm. */
    const khHint = (withoutMedia.match(/\.timeline-hint \{[^}]*\}/) || [''])[0];
    check('Der Hinweis an der Zeitleiste bricht um', !/nowrap/.test(khHint),
      khHint || '(keine Regel)');
    check('Und er ist an beiden Massen gedeckelt',
      /max-width: min\(14rem, 46%\)/.test(khHint) && /overflow-wrap: anywhere/.test(khHint),
      khHint || '(keine Regel)');
    /* UND SIE SAGT NICHTS ZWEIMAL: alles andere -- die Forderung, das
       Schrumpfen, das Rollen -- steht in der Grundregel und gilt weiter
       (Stolperstein 47). */
    check('Und wiederholt die Grundregel nicht',
      !/flex:/.test(khSitz) && !/overflow/.test(khSitz), khSitz || '(keine Regel)');
    /* ---- IN EINEM WINDOW GILT DER DECKEL NICHT — 0.17.4 ----
       Glockentafel und Grabsteine tragen dieselbe Klasse, stehen aber in einem
       `.modal`. Dort gibt es keine Reihe und keine Nachbarin, und das Fenster
       deckelt laengst bei 88dvh. Ein zweiter Deckel darin waere eine Grenze in
       einer Grenze. */
    const khDialog = (withoutMedia.match(/\.modal \.manage-list \{[^}]*\}/) || [''])[0];
    check('In einem Fenster traegt die Liste keinen Deckel',
      /max-height: none/.test(khDialog), khDialog || '(keine Regel)');
    /* UND SIE SAGT NICHTS ZWEIMAL. `flex: 0 1 auto` steht seit 0.17.5 in der
       Grundregel; hier stuende es ein zweites Mal und liefe beim naechsten
       Umbau auseinander (Stolperstein 47). */
    check('Und wiederholt die Grundregel nicht',
      !/flex:/.test(khDialog), khDialog || '(keine Regel)');
    /* DIE AUSNAHME STEHT ALS REGEL DA UND IST GENAU EINE. Die Teileliste des
       Exports bleibt kurz, weil sie MITTEN in ihrer Karte steht; der Grund
       steht als Satz daneben. Waeren es zwei, waere es keine Ausnahme mehr. */
    check('Die eine Ausnahme traegt ihre Deckelung ausdruecklich',
      /#ex-part-list \{ flex: none; max-height: 280px; \}/.test(withoutMedia),
      (withoutMedia.match(/#ex-part-list \{[^}]*\}/) || ['(keine Regel)'])[0]);
    check('Und der Grund dafuer steht im Stilblatt daneben',
      /Teileliste des Exports/.test(fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')),
      'kein Satz daneben');
    /* ---- DAS RASTER DES PROTOKOLLS GEHOERT DER LISTE — 0.17.5 ----
       BIS 0.17.4 WAR JEDE ZEILE IHR EIGENES RASTER. Die beiden letzten
       Spalten sind `auto`; steht dort nichts, fallen sie auf null, und die
       beiden `1fr` teilen sich den frei gewordenen Platz. Der Name in Spalte
       drei stand damit in jeder Zeile woanders -- gemessen in Chromium bei
       1410 Pixeln VIER verschiedene linke Kanten: 706, 708, 734 und 769.
       Nach dem Umbau ist es EINE: 693. */
    const khProtList = (withoutMedia.match(/\.log-list \{[^}]*\}/) || [''])[0];
    check('Die Spalten des Protokolls gehoeren der Liste',
      /display: grid/.test(khProtList) && /grid-template-columns:/.test(khProtList),
      khProtList || '(keine Regel)');
    const khProtRow = (withoutMedia.match(/\.log-row \{[^}]*\}/) || [''])[0];
    check('Und die Zeile setzt ihre Felder direkt hinein',
      /display: contents/.test(khProtRow), khProtRow || '(keine Regel)');
    /* EINE ZEILE OHNE EIGENEN KASTEN KANN KEINE LINIE TRAGEN -- die Trennlinie
       sitzt deshalb an den Feldern. Daraus folgen zwei Zeilen, die sonst wie
       Kosmetik aussaehen und keine sind: der Spaltenabstand steht als
       `padding-right` am Feld (ein `column-gap` risse die Linie in fuenf
       Stuecke), und die Felder richten sich an der UNTERKANTE aus. Mit
       `baseline` blieb ein Feld OHNE Text 15 Pixel hoch, wo seine Nachbarn 35
       massen -- gemessen in Chromium, und im Bild als Treppe zu sehen. */
    const khProtField = (withoutMedia.match(/\.log-row > \* \{[^}]*\}/) || [''])[0];
    check('Die Trennlinie sitzt an den Feldern',
      /border-bottom: 1px solid var\(--line\)/.test(khProtField), khProtField || '(keine Regel)');
    check('Und sie reisst nicht ab',
      /align-self: end/.test(khProtField) && !/column-gap/.test(khProtList) &&
      !/ gap:/.test(khProtList), `${khProtField} || ${khProtList}`);
    /* AUF DEM SCHMALEN SCHIRM TRAEGT DIE ZEILE IHR RASTER WIEDER SELBST. Fuenf
       Felder in zwei Spalten gehen nicht auf: bei `display: contents` liefe das
       sechste Feld der ersten Zeile in die Reihe der zweiten, und aus zwei
       Vorgaengen wuerde eine Zeile. */
    check('Auf dem schmalen Schirm traegt die Zeile ihr Raster wieder selbst',
      /\.log-list \{ display: block; \}/.test(css123) &&
      /\.log-row \{ display: grid; grid-template-columns: 1fr auto;/.test(css123),
      (css123.match(/\.log-list \{ display: block; \}[\s\S]{0,120}/) || ['(keine Regel)'])[0]);
    /* AUF DEM TELEFON BLEIBT DIE DECKELUNG, und sie ist keine feste Hoehe: sie
       misst das Fenster. Ohne sie machte ein Sicherheitsprotokoll mit
       zweihundert Zeilen die Karte unbrauchbar lang. */
    /* AUF DEM TELEFON IST DER DECKEL WIEDER EINE GRENZE. Dort steht jede
       Kachel ALLEIN in ihrer Zeile, und `flex: 0 1 auto` laesst die Liste ihren
       Inhalt fordern, statt zehn Zeilen zu verlangen, die sie nicht hat. An
       dieser Zeile aendert 0.17.4 nichts -- die Deckel von zehn und fuenfzehn
       Zeilen gelten fuer den breiten Schirm, hier haengt der Deckel am
       Fenster. */
    check('Auf dem Telefon bleibt die Deckelung am Fenster haengen',
      /\.manage-list, \.log-list, \.test-scroll, \.atext, #ex-part-list \{ flex: 0 1 auto; max-height: 62vh; max-height: 62dvh; \}/.test(css123),
      (css123.match(/\.manage-list, \.log-list[^}]*\}/) || ['(keine Regel)'])[0]);
    /* UND DIE AUSNAHME STEHT DORT MIT DRIN. Ihre eigene Regel ist ein
       ID-Waehler und schluege die Klassenregel des Telefons -- die feste
       Deckelung bliebe dann auch auf dem schmalen Schirm stehen, wo bis 0.17.0
       das Fenstermass galt. Eine Ausnahme darf eine Regel zuruecknehmen, aber
       nicht heimlich eine zweite mit. */
  }
  {
    /* UND DIE ZEILEN WERDEN WIRKLICH ALLE GEZEICHNET. Der Befund war, dass
       zehn Anmeldungen dastehen und drei zu sehen sind -- gezeichnet waren
       auch vorher alle zehn, aber ohne diese Zeile bliebe offen, ob die neue
       Regel etwas verschluckt. */
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

  /* WOZU DIESE GRUPPE HIER STEHT UND NICHT OBEN BEI DEN ANDEREN MAILPRUEFUNGEN:
     `css123` wird in dieser Funktion erst weiter unten gelesen, und ein Griff
     davor ist eine tote Zone -- der Lauf reisst dann ab, statt rot zu werden.
     Die Pruefungen am DOM stehen deshalb oben, die am Stilblatt hier.

     DIE GRUPPE „Der Mailversand ordnet sich — 0.17.1" STAND AN DIESER STELLE
     UND IST WEG; dieser Satz steht an ihrer Stelle, damit die Entscheidung
     nicht wiederkommt (Stolperstein 201).
     SIE PRUEFTE VIER REIHEN IN DER KARTE -- wer, wohin, womit, als wer -- und
     die sechs Stilblattregeln dazu. Genau diese Anordnung ist der Befund von
     0.17.3 gewesen: neun Bedienelemente in vier verschiedenen
     Spaltenaufteilungen, dazwischen vier Erklaersaetze, zwei NEBEN einem Feld.
     Das Auge fand keine Spalte, und keine der Reihen war fuer sich falsch.
     WAS AN IHRE STELLE TRITT, steht weiter oben: die Gruppen „Die Karte
     „Mailversand“" (fuenf Zeilen, zwei Knoepfe, kein Feld) und „Der Dialog
     „Mailzugang einrichten“ — 0.17.3" (eine Spalte, Beschriftung ueber dem
     Feld, Hinweis unter seiner Sache) -- und die Gruppe hier darueber, die
     ausdruecklich nachsieht, dass die sechs alten Regeln wirklich aus dem
     Stilblatt verschwunden sind: eine Regel ohne Waehler im Markup faellt
     sonst niemandem auf. */

  /* ---- 4. Der fuenfte Abschnitt und sein Name ---- */
  group('Der fuenfte Abschnitt heisst „Installation" — 0.17.1, 0.19.1 und 0.19.2');

  /* EIN WORT UND KEINE FUNKTION -- zweimal inzwischen. Der Abschnitt trug bis
     0.17.0 den Schluessel `anlage`, bis 0.19.1 `instanz` und heisst jetzt
     `installation`.

     DIE UEBERSETZUNG DER ALTEN ADRESSEN IST IN 0.19.2 ABGEBAUT WORDEN, und das
     ist eine Entscheidung des Betreibers: die Anlage hat EINEN Zugang, es gibt
     keine fremden Lesezeichen und keine verschickten Links auf einen Abschnitt
     des Systembereichs. Eine Tafel, die einen Fall abfaengt, den es nicht
     gibt, ist Aufwand ohne Gegenwert.
     GEPRUEFT WIRD DESHALB JETZT DAS GEGENTEIL: dass es die Tafel NICHT mehr
     gibt und dass eine unbekannte Adresse denselben Weg nimmt wie jede andere
     -- den Rueckfall auf den ersten sichtbaren Abschnitt (Stolperstein 74: die
     Pruefung der Vorgaengerfassung wird UMGEDREHT statt geloescht).
     DASS DIE NEUE ADRESSE TRAEGT, steht in der Gruppe ueber die Reiter weiter
     oben. */
  for (const oldAddress of ['anlage', 'instanz', 'scheune']) {
    const d = buildDom(JSDOM,
      { settings: { filters: null, userCount: 4, isAdmin: true, isOwner: true } });
    await new Promise(r => setTimeout(r, 60));
    d.w.history.replaceState(null, '', `#/system/${oldAddress}`);
    await d.w.renderSystem();
    await new Promise(r => setTimeout(r, 40));
    /* ALLE DREI NEHMEN DENSELBEN WEG -- die beiden alten Namen sind nichts
       Besonderes mehr. Ein erfundener Abschnitt steht ausdruecklich daneben:
       ohne ihn belegte die Zeile nicht, dass es der REGELWEG ist und nicht
       eine dritte Sonderbehandlung. */
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
    /* UND DER GRUND STEHT DA. Was aufgehoben wird, wird mit dem Grund
       hingeschrieben und nicht geloescht (Stolperstein 201) -- sonst baut es
       beim naechsten Mal jemand wieder ein. */
    check('Und der Grund fuer den Abbau steht im Quelltext daneben',
      /UEBERSETZUNG ALTER ABSCHNITTSADRESSEN IST IN 0\.19\.2 ABGEBAUT WORDEN/.test(source),
      'die Begruendung fehlt');
    /* DER RUECKFALL SELBST IST EINE ZEILE OHNE TAFEL. Ohne diese Zusage bliebe
       gruen, wer die Tafel durch ein `if` ersetzt -- und genau davor warnt der
       Kommentar dort. */
    check('Und die Adresse wird ohne Umweg gelesen',
      /const desired = fromAddress;/.test(source),
      (source.match(/const desired = [^\n]*/) || ['(nicht gefunden)'])[0]);
  }
  {
    /* DER WAECHTER UEBER DAS WORT SELBST. „Ueberall" laesst sich nur so
       belegen: es wird nachgezaehlt, und zwar in den Dateien, die wirklich
       ausgeliefert werden.
       DIE AUSNAHMEN STEHEN NAMENTLICH DA UND SIND FALSCHE FREUNDE: sie meinen
       ANHAENGE und nicht die Installation. Eine Zeile, die sie stillschweigend
       ueberginge, uebersaehe auch den naechsten echten Treffer.
       `attachments.js` FEHLT IN DER LISTE, und das ist Absicht: dort meint JEDE
       der drei Stellen einen Anhang. Die Datei steht deshalb als eigene Zeile
       darunter -- gepruefte Abwesenheit ist etwas anderes als eine Datei, an
       die niemand gedacht hat. */
    const shipped = ['public/app.js', 'public/style.css', 'public/index.html',
                          'server.js', 'auth.js', 'db.js', 'usertool.js', 'mail.js',
                          'keys.js', 'keytool.js', 'twofactor.js'];
    /* WAS STEHENBLEIBEN DARF, STEHT MIT SEINER ZAHL DA und nicht als blosse
       Erlaubnis: verglichen wird die ganze Liste. Eine Erlaubnis, die
       „irgendwie oft" hiesse, deckte den naechsten echten Treffer mit zu.
       `Anlagenbytes` MEINT EINEN ANHANG -- es steht an der Route, die die
       Bytes eines Anhangs ausliefert.
       DIE VIER IN app.js SIND DER NACHRUF AUF DIE ABGEBAUTE TAFEL: zweimal
       der alte Abschnittsname, zweimal die alte Adresse. Sie MUESSEN das Wort
       nennen -- ohne es liesse sich nicht sagen, was abgebaut wurde
       (Stolperstein 201). Bis 0.19.1 waren es sieben, weil die Tafel selbst
       noch dastand. */
    const ALLOWED = {
      'server.js': ['Anlagenbytes'],
      'public/app.js': ['Anlage', 'anlage', 'Anlage', 'anlage']
    };
    const found = {};
    for (const file of shipped)
      found[file] = fs.readFileSync(path.join(__dirname, ...file.split('/')), 'utf8')
        .match(/[A-Za-zÄÖÜäöüß]*[Aa]nlage[A-Za-zÄÖÜäöüß]*/g) || [];
    const left = shipped.filter(d => !equal(found[d], ALLOWED[d] || []));
    check('Das Wort „Anlage" steht nur noch, wo es ausdruecklich stehenbleibt',
      left.length === 0,
      left.map(d => `${d}: ${found[d].join(', ')}`).join(' · '));
    /* UND DIE ERLAUBNIS IST KEINE LEERE HUELSE: beide Ausnahmen stehen
       wirklich noch da. Eine Ausnahmeliste, die auf nichts zeigt, sagt beim
       naechsten Lesen etwas Falsches ueber den Bestand (Stolperstein 81). */
    check('Und beide Ausnahmen zeigen wirklich auf etwas',
      found['server.js'].length === 1 && found['public/app.js'].length === 4,
      `${found['server.js'].length} / ${found['public/app.js'].length}`);
    /* NEUN VON ELF DATEIEN TRAGEN DAS WORT GAR NICHT MEHR. Ohne diese Zeile
       bestuende die Gruppe auch dann, wenn jemand die Erlaubnis auf alle
       ausdehnte. */
    check('Und neun der elf ausgelieferten Dateien kennen es gar nicht mehr',
      shipped.filter(d => found[d].length === 0).length === 9,
      `${shipped.filter(d => found[d].length === 0).length}`);
    check('In attachments.js meint jede der drei Stellen einen Anhang',
      (fs.readFileSync(path.join(__dirname, 'attachments.js'), 'utf8').match(/[Aa]nlage/g) || []).length === 3,
      `${(fs.readFileSync(path.join(__dirname, 'attachments.js'), 'utf8').match(/[Aa]nlage/g) || []).length}`);
  }

  /* ---- 4a. Und das Wort selbst steht in keinem Bildschirmtext mehr ---- */
  group('„Instanz" steht in keinem Bildschirmtext mehr — 0.19.1 und 0.19.3');

  /* 0.19.1 HAT SIEBZEHN STELLEN UMBENANNT, 0.19.3 DIE LETZTEN ACHT. Damit ist
     das Wort aus dem Bildschirmtext heraus -- und „damit ist es heraus"
     laesst sich nur belegen, indem man nachzaehlt.

     GEZAEHLT WERDEN ZEILEN, NICHT VORKOMMEN, und ausdruecklich nur solche
     ausserhalb von Kommentaren: in public/app.js stehen dreiunddreissig
     weitere Vorkommen, in server.js sechsunddreissig, dazu eines in
     public/index.html -- alle in Kommentaren. Sie sind kein Bildschirmtext,
     und sie umzubenennen bewegte nur den Fingerprint.

     WAS ALS KOMMENTAR ZAEHLT, IST HIER WEITER GEFASST als beim Waechter ueber
     den Cookienamen (withoutComments oben): public/app.js baut seine
     Oberflaeche aus Vorlagen-Strings, und ein Kommentar DARIN faengt
     mitten in der Zeile an -- hinter einer geoeffneten Einsetzung. Der
     Waechter oben misst am Zeilenanfang und saehe acht solcher Zeilen fuer
     Bildschirmtext an; sie
     sind keiner. Hier oeffnet ein `/*` deshalb an JEDER Stelle den Block.
     `//` WIRD NUR AM ZEILENANFANG GELESEN und nicht mitten in der Zeile: dort
     steht in einer Oberflaeche viel eher ein `https://` als ein Kommentar,
     und ein Waechter, der die halbe Zeile wegwirft, uebersaehe den Treffer
     dahinter. */
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
    /* UND SEIT 0.24.0 IN DER SPRACHDATEI -- dort wohnt der Bildschirmtext.
       Ohne diese Zeile bliebe der Waechter gruen, waehrend das Wort einen
       Schritt zur Seite gemacht haette (Gegenprobe 505, ein Fund vom
       6. September 2026: sie blieb stumm, weil hier nur app.js stand). */
    const iDe = Object.entries(JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8')))
      .flatMap(([k, v]) => (typeof v === 'string' ? [v] : Object.values(v)).map(w => [k, w]))
      .filter(([, w]) => w.includes('Instanz'));
    check('Und in der Sprachdatei steht es in keinem einzigen Satz',
      iDe.length === 0, iDe.map(([k]) => k).join(' · '));
    /* ERST DER WAECHTER, DANN SEIN BEFUND (Stolperstein 81): ein Zaehler, der
       nichts findet, weil er nichts liest, ist gruen und belegt nichts. */
    check('Und der Waechter wuerde eine solche Zeile wirklich finden',
      withoutEveryComment("  const t = 'die Instanz sagt es';").includes('Instanz'),
      'der Waechter sieht die Zeile nicht');
    check('Aber einen Kommentar mitten in einem Vorlagen-String laesst er stehen',
      !withoutEveryComment("      ${/* die Instanz meint es anders */''}").includes('Instanz'),
      'der Waechter haelt den Kommentar fuer Bildschirmtext');
    /* UND DIE KOMMENTARE TRAGEN DAS WORT WEITER. Ohne diese Zeile bliebe die
       Gruppe auch dann gruen, wenn jemand die Datei leerte -- und sie haelt
       zugleich fest, dass die Kommentare AUSDRUECKLICH nicht mitgenommen
       wurden (Stolperstein 201). */
    const iAppRaw = (fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8')
      .match(/Instanz/g) || []).length;
    /* FUENFUNDDREISSIG SEIT 0.30.0, vorher 33: die Absaetze zu Befund 10 sagen,
       warum „gewichtet" aus der Sprachdatei kommen muss -- „in einer englisch
       oder tuerkisch eingestellten Instanz stand dort deutscher Text". Das
       Wort steht dort als BILD DES PROJEKTS in einem Kommentar und nicht auf
       dem Bildschirm; genau diesen Unterschied haelt die Zeile fest.
       SECHSUNDDREISSIG SEIT 0.30.2: der Absatz zu den beiden Zeichen an der
       Tagwolke sagt, dass die Instanz die Schrift von 80 bis 120 Prozent
       stellt -- auch das ein Bild des Projekts in einem Kommentar.
       SIEBENUNDDREISSIG SEIT 0.30.3: der Absatz zur Zahl der Wolkenreihen
       haelt fest, dass die Instanz sich genau EINE Bruecke zwischen Stilblatt
       und Skript haelt -- eine Aussage ueber das Projekt und keine ueber den
       Bildschirm.
       NEUNUNDDREISSIG SEIT 0.31.1: zwei Absaetze nennen die beiden Stellen,
       an denen deutscher Text fest im Quelltext stand -- „in einer englisch
       eingestellten Instanz stand hier 3 entries und 2 test days". Wieder ein
       Bild des Projekts in einem Kommentar und nicht auf dem Bildschirm. */
    check('In den Kommentaren derselben Datei stehen unveraendert 39 Vorkommen',
      iAppRaw === 39, `${iAppRaw} Vorkommen`);

    /* UND IN server.js BLEIBT SEIT 0.33.0 KEINE EINZIGE MEHR. Bis 0.32.1 stand
       dort genau eine: „Die Instanz laeuft weiter …", die Zeile fuer den
       BETREIBER, wenn PUBLIC_ADDRESS unbrauchbar ist. Sie war die eine
       benannte Ausnahme -- eine Zeile fuers Containerprotokoll und keine
       Bildschirmmeldung.
       DAS PROTOKOLL SPRICHT SEIT DIESER RUNDE ENGLISCH (Strang 4), und damit
       loest sich die Ausnahme von selbst auf: dieselbe Zeile heisst jetzt
       „The instance keeps running …". DIE PRUEFUNG WIRD DESHALB SCHAERFER UND
       NICHT WEGGENOMMEN -- aus „genau eine" wird „keine". */
    const iServer = screenRows('server.js');
    check('In server.js bleibt keine Zeile mehr — auch die des Betreibers nicht',
      iServer.length === 0,
      iServer.map(([n, z]) => `${n}: ${z.trim()}`).join(' · ') || 'keine');
  }

  /* ---- 5. Die Zeile einer Sitzung steht gerade ---- */
  group('Die Zeitangaben stehen untereinander — 0.17.1');

  /* DER BEFUND WAR DIE SCHIEFE ZEILE: „angemeldet" und „zuletzt gesehen"
     nebeneinander, unterschiedlich lang. GEPRUEFT WIRD DIE ANORDNUNG IM
     STILBLATT und dass die Zeile wirklich beide Angaben traegt -- die
     Ausrichtung selbst rechnet jsdom nicht. */
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
    /* UND DARUEBER STEHT DER NAME IN SEINER EIGENEN REIHE. Bis 0.17.1 stand er
       NEBEN den Zeiten und wurde dabei abgeschnitten; seit 0.17.2 bekommt er
       die erste Rasterzeile fuer sich, mit dem Kreuz daneben. */
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

  /* DER EINZIGE ECHTE FEHLER DIESER RUNDE. Bis 0.17.0 baute sich das Vollbild
     seinen eigenen Abspieler und liess den inneren stehen: zwei Elemente mit
     derselben Quelle, zwei Tonspuren, zwei Stellen im Film.
     JSDOM SPIELT NICHTS AB -- pause(), play() und load() sind dort leer, und
     `paused` steht immer auf true. Was sich belegen laesst, ist genau das, was
     traegt: dass es die ZWEITE QUELLE nicht mehr gibt, und dass die Stelle
     hin- und zurueckwandert. GEZAEHLT WIRD AN DEN ELEMENTEN UND IHREM ZUSTAND
     und nicht an einer Klasse (Stolperstein 223). */
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
       daneben. Ohne diese Lage bliebe offen, ob der Rueckweg an einem
       einzelnen Behandler haengt. */
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
       passen. Wer im Vollbild auf das Foto blaettert und dort schliesst, darf
       den inneren Abspieler nicht ohne Quelle zuruecklassen. */
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
       Betrachter darunter NICHT neu zeichnet. `openLightbox()` ist allgemein:
       `loeschen` kommt von aussen, und ob der Rufer danach neu zeichnet, weiss
       das Vollbild nicht. Ohne die Zeile bekaeme der innere Abspieler beim
       Schliessen die Quelle eines Videos zurueck, das es nicht mehr gibt --
       genau der Fall, den der Auftrag nennt.
       GERUFEN WIRD DIREKT und nicht ueber den Betrachter: nur so laesst sich
       ein Rufer stellen, der nichts neu zeichnet. */
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
    /* DIE GEGENLAGE: OHNE VIDEO VERHAELT SICH DAS VOLLBILD WIE BISHER. Der
       Betrachter zeigt ein Bild, es gibt gar keinen inneren Abspieler, und der
       im Vollbild bleibt verborgen und ohne Quelle. Ohne diese Lage bliebe
       offen, ob der Wechsel auch dort zugreift, wo es nichts zu wechseln
       gibt. */
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

  /* DER BEFUND: an einem Kriterium, das genau einer bewertet hat, stand
     „⌀ 4,0 (1)". Die Klammer beantwortet die Frage, wie schwer der Schnitt
     wiegt -- bei einer einzigen Stimme gibt es diese Frage nicht, und DASS
     jemand bewertet hat, sagt schon der Schnitt daneben. Dieselbe Regel wie
     die fehlende Null am Knopf „Offen" und in der Glockentafel: keine Angabe
     ueber nichts.
     DER KLARTEXT BLEIBT DAGEGEN VOLLSTAENDIG. Er ist die Auskunft fuer den,
     der sie braucht: ein Vorleseprogramm liest kein ⌀, und beim Ueberfahren
     ist „aus 1 Stimme" die Antwort auf eine wirklich gestellte Frage. Was
     wegfaellt, ist die Zahl auf dem Bildschirm und nicht die Auskunft. */
  {
    /* DREI LAGEN IN EINEM AUFBAU: zwei Stimmen, eine Stimme, keine. Waeren es
       zwei Aufbauten, liesse sich nicht sehen, dass die Entscheidung je ZEILE
       faellt und nicht je Eintrag (Stolperstein 189).
       DER SCHNITT EINER EINZIGEN STIMME IST IHR WERT -- ein gestelltes 3,4 aus
       einer Stimme waere eine Luege ueber die eigene Prueflage
       (Stolperstein 102). */
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
       nirgends stehen. Ohne sie bliebe die Zeile darueber auch dann gruen,
       wenn die Klammer bloss ihren Inhalt verloere (Stolperstein 81). */
    check('Und in keiner Zeile steht eine Klammer um eine Eins',
      !kColumns.some(z => /\(1\)/.test(z.textContent || '')),
      JSON.stringify(kColumns.map(z => z.textContent)));
    /* UMGEDREHT MIT 0.21.0 (Stolperstein 74), wie die beiden Schwestern in der
       Gruppe „Die Sternreihe steht auf einer Linie": bis 0.20.1 blieb die
       Zelle GANZ LEER, jetzt traegt sie einen Strich. Die Zusage dieser Gruppe
       ist eine andere und bleibt unveraendert -- hier geht es um die KLAMMER,
       und ein Strich ist keine. */
    check('Ohne Stimme steht dort ein Strich und keine Klammer',
      kColumns[2]?.textContent === '–', JSON.stringify(kColumns[2]?.textContent));
    /* UND DER KLARTEXT SAGT WEITERHIN BEIDES -- in der Einzahl, wo es eine
       ist: „aus 1 Stimmen" ist der Fehler, den eine feste Endung macht. */
    check('Der Klartext nennt die eine Stimme trotzdem',
      kColumns[1]?.title === 'Durchschnitt 4,0 aus 1 Bewertung', kColumns[1]?.title);
    check('Und bei zweien steht dort die Mehrzahl',
      kColumns[0]?.title === 'Durchschnitt 3,5 aus 2 Bewertungen', kColumns[0]?.title);
    /* UMGEDREHT MIT 0.21.0 (Stolperstein 74): der Strich bekommt seinen eigenen
       Klartext -- „noch niemand" --, und er nennt ausdruecklich KEINE Stimmen.
       Das ist die Aussage, um die es dieser Gruppe geht: wo keine Stimme ist,
       steht keine Zahl. */
    check('Ein Kriterium ohne Stimme bekommt einen Klartext ohne Stimmenzahl',
      kColumns[2]?.title === 'Noch nicht bewertet' && !/aus \d/.test(kColumns[2]?.title || ''),
      kColumns[2]?.title);
    d.w.close();
  }

  /* ---- 4. Der Ruecksetzer fuer die Filterleiste ---- */
  group('Der Ruecksetzer fuer die Filterleiste — 0.17.3');

  /* DER BEFUND WAR EINE FRAGE: „fehlt das Filter-zuruecksetzen, oder finde ich
     den gerade nicht?" -- Er war nicht zu finden, weil es ihn nicht gab. Ein
     „zurücksetzen" gab es genau EINMAL, in der Tagzeile, und auch dort nur,
     solange mindestens ein Tag gewaehlt war.
     GEPRUEFT WIRD BEIDES: dass er dasteht, wenn etwas gesetzt ist, UND dass er
     fehlt, wenn nichts gesetzt ist. Ein Knopf, der immer dasteht, waere
     dieselbe Auskunft ueber nichts wie eine Null am Zaehler (Stolperstein 81).
     UND WAS ER NICHT MITRAEUMT, denn genau daran haengt seine Wahrhaftigkeit:
     die Suche und die Sortierung zaehlt filterZahl() nicht mit, also darf er
     sie auch nicht wegnehmen. */
  const frTags = [{ id: 41, name: 'Alu', usage_count: 3, test_usage_count: 0 },
                  { id: 42, name: 'Stahl', usage_count: 2, test_usage_count: 0 }];
  const frButton = (w) => w.document.getElementById('filter-zurueck');
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
       beiden Tags EINZELN (jeder verkleinert sie). Eine Lage mit nur einem
       Filter belegte ueber diese Regeln nichts. */
    const d = buildDom(JSDOM, { tags: frTags,
      settings: { filters: { categoryIds: [21, 22], tagIds: [41, 42], tagMode: 'and',
                                  tested: 'tested', rejected: 'all', favorite: false,
                                  sort: 'title_asc' } } });
    await new Promise(r => setTimeout(r, 80));
    const button = frButton(d.w);
    check('Mit gesetzten Filtern steht der Ruecksetzer da', !!button, 'kein Knopf');
    check('Und er nennt die Zahl',
      button?.textContent === 'Filter zurücksetzen (4)', JSON.stringify(button?.textContent));
    /* DIE ZAHL KOMMT AUS filterZahl() UND AUS NICHTS ANDEREM. Belegt wird das
       nicht ueber den Kommentar, sondern gegen den ZWEITEN Ort, an dem
       dieselbe Zahl steht: den Schalter ueber den Filtern. Zwei Zaehlungen
       nebeneinander liefen frueher oder spaeter auseinander
       (Stolperstein 47). */
    const switches = d.w.document.querySelector('#filter-toggle .fcount')?.textContent || '';
    check('Und es ist dieselbe Zahl, die auch der Schalter nennt',
      switches === '· 4 aktiv', JSON.stringify(switches));
    /* ER STEHT IN DER SORTIERZEILE, neben „+ Ansicht speichern" -- dort, wo er
       gesucht wurde, und nicht in einer eigenen Zeile darunter. */
    const row = button?.closest('.frow');
    check('Er steht in der Sortierzeile',
      !!row?.querySelector('#f-sort') && !!row?.querySelector('#ansicht-neu'),
      row ? [...row.querySelectorAll('.eyebrow')].map(e => e.textContent).join('+') : 'in keiner Zeile');
    check('Und rechts in ihr',
      button?.parentElement?.classList.contains('frow-right-wide'),
      button?.parentElement?.className);
    /* DAS STILBLATT SCHIEBT IHN AN DEN RAND -- ohne ausgerechnete Breite. Die
       Pillen der Sortierzeile wachsen nicht von selbst, anders als die Wolke
       der Tagzeile. */
    check('Das Stilblatt schiebt ihn an den rechten Rand',
      /margin-left: auto/.test(regel123('.frow-right-wide')),
      regel123('.frow-right-wide') || '(keine Regel)');

    /* ---- UND JETZT DER KLICK ----
       EIN SUCHBEGRIFF STEHT DABEI WIRKLICH IM FELD und nicht bloss im Zustand:
       nur dann belegt die Zeile unten etwas (Stolperstein 224). */
    const beforeSort = d.w.document.getElementById('f-sort')?.value;
    const searchField = d.w.document.getElementById('q');
    searchField.value = 'schraube';
    searchField.dispatchEvent(new d.w.Event('input'));
    await waitSearch(d.w);
    /* GEZAEHLT WIRD, WAS NACH DEM KLICK HINAUSGEHT und nicht, was beim Aufbau
       schon lief -- sonst pruefte die Verneinung unten den Seitenaufbau mit. */
    const vorDemClickable = d.sent.length;
    // MIT `?.`: ob der Knopf dasteht, hat die Zeile oben schon gefragt
    // (Stolperstein 311) -- an einer Null soll der Lauf nicht abreissen.
    button?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 80));
    const after = d.sent.slice(vorDemClickable);
    /* GELESEN WIRD DIE STELLUNG DORT, WO SIE HINAUSGEHT -- im Rumpf des
       letzten PUT. `state` ist ein `const` im Modul und steht am Fenster gar
       nicht; eine Pruefung, die dorthin greift, pruefte `undefined`. */
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
       wird auch nicht mitgezaehlt. Ein Knopf, der „(4)" sagt und fuenf Dinge
       wegnimmt, sagt die Unwahrheit. */
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
       einer Null abreisst (Stolpersteine 161 und 311; die Gegenprobe 637 hat
       es gezeigt). */
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
     Ruecksetzer verschwand dabei selbst. Die Begruendung im Ganzen steht in
     app.js bei `statusEffective`.
     DIE GRUPPE BLEIBT UND WIRD UMGEDREHT (Stolperstein 74). Sie belegt jetzt
     das Gegenteil dessen, was sie 0.21.1 belegt hat -- und ZWEI ihrer Zusagen
     gelten unveraendert weiter: die Handwahl wirkt, und ein Wechsel der
     Sortierung laesst sie in Ruhe. Nur kommt das zweite jetzt daher, dass es
     gar nichts mehr gibt, was sie stoeren koennte. */
  group('Die Sortierung gibt den Status NICHT mehr vor — 0.32.1');

  /* DER BEFUND: eine Sortierung beantwortet eine Frage, aber die Liste zeigte
     nicht die Menge, in der diese Frage sich stellt. Wer nach Bewertung
     sortiert, fragt „was war gut?" -- und das haben nur getestete Eintraege
     beantwortet; wer nach Potenzial sortiert, fragt „was mache ich als
     Naechstes?" -- und das fragt sich nur an Ideen. Beide Male stand die
     andere Haelfte des Bestands mit in der Liste.
     DER BESTAND TRAEGT BEIDES, zwei getestete und zwei ungetestete
     (Stolperstein 81): an einem Bestand aus lauter Ideen belegte „nur Ideen
     stehen da" gar nichts. Und jede Haelfte traegt ZWEI Eintraege mit
     verschiedenen Zahlen -- so bleibt neben der Menge auch die Reihenfolge
     pruefbar. */
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
  // ALPHABETISCH, weil ksTitle() sortiert: verglichen wird die MENGE und nicht
  // die Reihenfolge -- die Reihenfolge ist Sache der Sortierpruefungen, und ein
  // Vergleich, der beides zugleich fragt, sagt bei Rot nicht, welches gemeint
  // ist.
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
  /* MITGEZOGEN MIT 0.28.1 (Stolperstein 201): eine Sortierung wird seit dieser
     Runde an ZWEI Bedienelementen eingestellt -- die Grundlage im Auswahlfeld,
     die Richtung am Umschalter daneben. Der Helfer nimmt weiter die
     GESPEICHERTE Schreibweise (`potential_asc`), weil die Zusagen darunter
     ueber sie reden, und teilt sie selbst auf. Haette stattdessen jede
     Aufrufstelle die Aufteilung gemacht, stuende dieselbe Zerlegung
     fuenfundzwanzigmal da.
     DIE RICHTUNG WIRD GEKLICKT UND NICHT GESETZT: sie haengt am Knopf, und ein
     gesetztes Feld allein liesse den Umschalter stehen, wo er war.
     ER WIRD NACH DEM ZUG NEU GESUCHT -- `redraw()` zeichnet die ganze Leiste
     neu, und der Knopf von vorhin haengt danach nicht mehr in der Seite.
     GEDAEMPFT HEISST: DIESE GRUNDLAGE HAT NUR EINE RICHTUNG. Ein Klick darauf
     taete nichts, und `title_asc` gibt es nicht -- deshalb wird er uebergangen
     und nicht erzwungen. */
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
  /* WAS DIE LEISTE GERADE ANZEIGT, an BEIDEN Stellen und als EIN Satz.
     ZUSAMMENGESETZT WIRD HIER NICHT ZU `potential_desc`: das waere die Formel
     aus `applySort()` ein zweites Mal (Stolperstein 47), und sie stuende dann
     im Gegenstand und in der Zusage zugleich. Gelesen wird, was am Bildschirm
     steht -- die Grundlage im Feld und die Richtung als Wort daneben. */
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
    /* KEINE PILLE GILT MEHR, OHNE ANGEKLICKT ZU SEIN. `pill-derived` war das
       Zeichen dafuer -- gestrichelter Rahmen, „gilt, aber nicht von deiner
       Hand". Es darf nirgends mehr auftauchen, auch nicht im Stilblatt. */
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

  /* ---- 2. DIE SACKGASSE, DIE DIESE RUNDE AUFMACHT --------------------------
     DER BEFUND DES BETREIBERS, und er ist der Grund fuer den Ausbau: wer
     gefiltert hatte und „Filter zuruecksetzen" drueckte, bekam bei Sortierung
     „Potenzial" oder „Bewertung" die ABLEITUNG zurueck. Die Statuspille stand
     angewaehlt da, die Liste war gefiltert -- und weil filterNumber() die
     Ableitung nicht mitzaehlte, VERSCHWAND DER RUECKSETZER. Es war gefiltert,
     es sah gefiltert aus, und es gab keinen Weg mehr heraus.
     DIE PRUEFLAGE FAEHRT GENAU DIESEN WEG: filtern, zuruecksetzen, nachsehen.
     Vor 0.32.1 waeren danach zwei Eintraege uebrig gewesen. */
  {
    const d = await ksBuild({ ...ksDefault, favorite: true, sort: 'potential_desc' });
    check('Die Prueflage ist wirklich gefiltert, bevor sie zuruecksetzt',
      ksTitle(d).length === 0 || ksTitle(d).length < ksAll.length,
      JSON.stringify(ksTitle(d)));
    const back = d.w.document.getElementById('filter-zurueck');
    check('Und der Ruecksetzer steht da, solange etwas gesetzt ist', !!back,
      back ? back.textContent : '(kein Knopf)');
    await ksClickable(d, back);
    check('Nach „Filter zuruecksetzen" stehen wieder alle vier da — keine Sackgasse',
      equal(ksTitle(d), ksAll), JSON.stringify(ksTitle(d)));
    check('Und der Ruecksetzer ist weg, weil wirklich nichts mehr gesetzt ist',
      !d.w.document.getElementById('filter-zurueck'),
      d.w.document.getElementById('filter-zurueck')?.textContent || 'weg');
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
      d.w.document.getElementById('filter-zurueck')?.textContent === 'Filter zurücksetzen (1)',
      JSON.stringify(d.w.document.getElementById('filter-zurueck')?.textContent));
    /* GESPEICHERT WIRD DIE GEWAEHLTE STELLUNG. Bis 0.32.0 schrieb
       saveFilters() ausdruecklich NICHT die abgeleitete -- die Unterscheidung
       ist mit der Ableitung weggefallen, und was dasteht, steht auch in der
       Einstellung. */
    check('Und die Einstellung traegt genau diese Wahl',
      ksSetting(d)?.tested === 'untested', JSON.stringify(ksSetting(d)?.tested));
    await ksClickable(d, d.w.document.getElementById('filter-zurueck'));
    check('Zuruecksetzen holt „Alle" zurueck', equal(ksTitle(d), ksAll), JSON.stringify(ksTitle(d)));
    d.w.close();
  }

  /* ---- 4. EIN WECHSEL DER SORTIERUNG LAESST DEN STATUS IN RUHE ----
     Das ist der Kern des Ausbaus: die beiden Bedienelemente sind wieder
     unabhaengig. Vor 0.21.1 war es so, zwischen 0.21.1 und 0.32.0 nicht, und
     seit 0.32.1 wieder. */
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

  /* ---- 5. EINE GESPEICHERTE ANSICHT GILT SO, WIE SIE DASTEHT ----
     Bis 0.32.0 setzte applyView() `STATUS_BY_HAND = true`, damit die
     gespeicherte Stellung die Ableitung SCHLAEGT. Ohne Ableitung gibt es
     nichts zu schlagen -- und das Ergebnis ist dasselbe: wer „Potenzial" und
     „alles anzeigen" zusammen gespeichert hat, bekommt beides zurueck. */
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

  /* ---- 6. UND DER AUSBAU IST WIRKLICH EIN AUSBAU ----
     GEPRUEFT AM QUELLTEXT UND NICHT NUR AM BILDSCHIRM: ein Merker, der
     stehenbleibt und nur nirgends mehr gefragt wird, ist toter Code, und der
     naechste Griff belebt ihn. Die Namen stehen in Kommentaren weiter da --
     umgedreht und nicht geloescht (Stolperstein 74) --, also wird der
     Quelltext OHNE Kommentare gelesen. */
  {
    const appOhne = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8')
      .replace(/(^|[^A-Za-z0-9_"'`])\/\*[\s\S]*?\*\//g, '$1 ')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
    const reste = ['SORT_STATUS', 'STATUS_BY_HAND', 'defaultClosed', 'statusOutSort', 'statusIdle']
      .filter(n => new RegExp(`\\b${n}\\b`).test(appOhne));
    check('Kein Rest der Ableitung steht mehr im Quelltext — 0.32.1',
      reste.length === 0, reste.join(' ') || 'keiner');
    check('Und `statusEffective` liest nur noch das Feld',
      /const statusEffective = \(f\) => f\.tested;/.test(appOhne),
      (appOhne.match(/const statusEffective =[^\n]*/) || ['(fehlt)'])[0]);
    /* UND DIE DREI SAETZE SIND AUS ALLEN DREI DATEIEN. Ein Satz ohne Rufer ist
       eine Leiche; die Verwendungsprobe faende ihn, aber sie sagt nicht, dass
       er zu DIESER Sache gehoerte. */
    const sortSaetze = ['list.followsSort', 'list.statusByHand', 'list.byHandHint',
                        'list.pillHint', 'list.sortDefaultHint'];
    const nochDa = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of sortSaetze) if (file[k] !== undefined) nochDa.push(`${code}/${k}`);
    }
    check('Und die fuenf Saetze der Ableitung stehen in keiner Sprachdatei mehr',
      nochDa.length === 0, nochDa.join(' ') || 'in allen dreien weg');
    /* UND IM STILBLATT AUCH NICHT. `.pill-derived` war ihr Aussehen; eine
       Klasse ohne Traeger ist derselbe tote Code eine Datei weiter. */
    const cssOhne = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ');
    check('Und das Stilblatt kennt `.pill-derived` nicht mehr',
      !/\.pill-derived/.test(cssOhne) && !/#f-status-from/.test(cssOhne),
      (cssOhne.match(/\.pill-derived[^\n]*/) || ['weg'])[0]);
  }

  /* ================= Die acht Reparaturen — 0.28.1 ====================== */
  group('Die Sortierung trennt Grundlage und Richtung — 0.28.1');

  /* DER BEFUND KAM VOM GERAET (Android, Samsung S21G, Chrome, 11.9.2026): die
     aufgeklappte Sortierliste fuellte den ganzen Schirm, und 0.28.0 hat daran
     nichts geaendert. Chrome auf Android zeichnet die Auswahl als EIGENEN
     Systemdialog mit Systemschrift -- die `font-size` des Feldes erreicht ihn
     nicht. GEGEN DEN DIALOG HILFT NUR, IHN KUERZER ZU MACHEN.
     DREI EINTRAEGE MIT DREI VERSCHIEDENEN ZAHLEN JE SORTIERUNG, und keine
     zwei Sortierungen ergeben dieselbe Folge: waeren zwei gleich, bliebe eine
     vertauschte Zuordnung gruen. */
  /* DREI EINTRAEGE, SECHS SORTIERUNGEN, SECHS VERSCHIEDENE FOLGEN -- und das
     sind zugleich ALLE sechs Anordnungen, die drei Dinge haben. Die Zahlen
     sind daraufhin gewaehlt und nicht der Reihe nach vergeben: beim ersten
     Lauf liefen „Zuletzt geaendert" und „Bewertung" auf dieselbe Folge
     hinaus, und damit haette eine vertauschte Zuordnung der beiden gruen
     bleiben koennen. */
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
     jede Regel, die sie ersetzt, woertlich. Eine Zusage ueber den rohen Text
     faende sie dort wieder.
     UND DER WAEHLER WIRD GANZ GELESEN UND NICHT NUR SEIN ENDE: ein Ausdruck,
     der „.star {" sucht, findet auch den Schluss von „.stars .star {" -- und
     zaehlt dann VIER Regeln, wo zwei stehen. Davor muss deshalb eine Klammer
     stehen, und sie wird VORAUSGESCHAUT und nicht mitgegessen: ein Anker, der
     die schliessende Klammer der vorigen Regel verbraucht, ueberspringt jede
     zweite (derselbe Fund wie beim Raster der Kriterienliste weiter oben). */
  const soCss = css123.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const soRegeln = (waehler) => soCss.match(
    new RegExp('(?<=[{}])\\s*' + waehler.replace(/\./g, '\\.') + ' \\{[^}]*\\}', 'g')
  )?.map(r => r.trim()) || [];

  /* DER POTENZIALMODUS IST AN: ohne ihn fehlte der siebte Eintrag, und „genau
     sieben" waere eine Zusage ueber sechs. */
  const soBuild = async () => {
    const d = buildDom(JSDOM, { overviewItems: soInventory,
      settings: { potentialMode: true,
        filters: { categoryIds: [], tagIds: [], tagMode: 'and', tested: 'all',
                   rejected: 'all', favorite: false, sort: 'updated_desc' } } });
    await new Promise(r => setTimeout(r, 90));
    /* DIE HANDWAHL WIRD GESETZT, BEVOR SORTIERT WIRD. Seit 0.21.1 gibt die
       Sortierung den Statusfilter vor: „Bewertung" zeigt nur Getestete,
       „Potenzial" nur Ungetestete. Fuer eine Zusage ueber die REIHENFOLGE
       muessen in jeder Lage dieselben drei Eintraege dastehen -- ein Klick auf
       „Alle" ist die ausdrueckliche Wahl, die das haelt. */
    const alle = [...d.w.document.querySelectorAll('#filters .pill')]
      .find(b => b.textContent.trim() === 'Alle');
    alle?.dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
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
    /* UND IN KEINER EINZIGEN OPTION -- weder im WERT noch im WORT. Die eine
       Frage allein genuegt nicht: ein Wert ohne Endung mit „(hoch → niedrig)"
       im Wort waere dieselbe lange Liste mit anderer Schreibweise. */
    const soWords = [...(soField(d)?.options || [])].map(o => o.textContent);
    check('Und in keiner Option — weder im Wert noch im Wort',
      !soValues(d).some(v => /_(desc|asc)$/.test(v))
      && !soWords.some(w => /→/.test(w)),
      `${soValues(d).join(' ')} · ${soWords.join(' | ')}`);
    /* UND ER SAGT DIE KONKRETE RICHTUNG und nicht „absteigend": „neu → alt"
       bei der Aenderung, „hoch → niedrig" bei der Bewertung. Ein Wort, das
       fuer alle sieben dasselbe waere, sagte an keiner Stelle, was geschieht. */
    check('Und er nennt die konkrete Richtung und nicht „absteigend"',
      soDir(d)?.textContent === 'neu → alt', JSON.stringify(soDir(d)?.textContent));
    d.w.close();
  }

  /* ---- Zusage 3: jede der sieben laesst sich in beide Richtungen fahren ----
     GEFAHREN UND NICHT GELESEN: eine Zusage, die nur den Aufbau ansieht,
     bliebe gruen, wenn der Umschalter dasteht und die Richtung nirgends
     ankommt. Hier wird jede Sortierung gewaehlt, die Liste gelesen, der
     Umschalter gedrueckt und die Liste noch einmal gelesen.
     VIERZEHN LAGEN AN EINEM FENSTER und nicht vierzehn Fenster: genau der
     WECHSEL ist der Gegenstand. */
  {
    const d = await soBuild();
    const soSechs = ['updated', 'rating', 'potential', 'tests', 'testavg', 'testlast'];
    const soAb = {}, soAuf = {};
    for (const key of soSechs) {
      if (soField(d)) { soField(d).value = key; soField(d).onchange(); }
      await new Promise(r => setTimeout(r, 50));
      soAb[key] = soOrder(d);
      soDir(d)?.click();
      await new Promise(r => setTimeout(r, 50));
      soAuf[key] = soOrder(d);
      /* ZURUECK IN DIE ABSTEIGENDE LAGE, damit die naechste Grundlage von
         derselben Stellung aus anfaengt -- die Richtung bleibt beim Wechsel
         der Grundlage stehen, und ohne diesen Zug maesse die naechste Runde
         etwas anderes als die vorige. */
      soDir(d)?.click();
      await new Promise(r => setTimeout(r, 50));
    }
    /* JEDE LAGE IST EINDEUTIG: drei verschiedene Zahlen, also drei
       verschiedene Plaetze. Eine Sortierung, die zwei Eintraege gleich
       einordnet, koennte ihre Gegenrichtung nicht belegen. */
    check('Jede der sechs zweiseitigen Sortierungen ordnet alle drei Eintraege',
      soSechs.every(k => soAb[k].length === 3 && new Set(soAb[k]).size === 3),
      JSON.stringify(soAb));
    /* UND DIE GEGENRICHTUNG IST DIE UMGEKEHRTE FOLGE -- nicht „eine andere":
       „irgendwie anders" bliebe gruen, wenn der Umschalter auf eine dritte
       Sortierung umlegt. */
    const soKehrt = soSechs.filter(k => equal([...soAb[k]].reverse(), soAuf[k]));
    check('Und der Umschalter dreht jede von ihnen wirklich um',
      soKehrt.length === 6,
      soSechs.map(k => `${k}: ${soAb[k].join('>')} / ${soAuf[k].join('>')}`).join(' · '));
    /* UND KEINE ZWEI VON IHNEN ORDNEN GLEICH. Ohne diese Zeile belegte die
       Zusage darueber nur, dass sich ETWAS dreht -- sechs Sortierungen, die
       alle dieselbe Folge ergaeben, waeren eine Sortierung mit sechs Namen. */
    check('Und keine zwei von ihnen ergeben dieselbe Folge',
      new Set(soSechs.map(k => soAb[k].join('>'))).size === 6,
      soSechs.map(k => `${k}: ${soAb[k].join('>')}`).join(' · '));
    /* DIE SIEBTE KANN SEIT 0.29.0 BEIDE RICHTUNGEN -- Befund 8, aus dem
       Betrieb gemeldet (11.9.2026): „Z bis A kann nicht angewahlt werden".
       BIS DAHIN HATTE SIE NUR EINE, und der Grund war die NUMMER und nicht die
       Sache: „Titel Z → A" ist eine FUNKTION, und 0.28.1 war ein PATCH. Diese
       Runde ist ohnehin MINOR, damit reisen die drei Zeilen zum Nulltarif mit.
       SIE LANDET TROTZDEM AUF A → Z, und das ist eigens entschieden: ein Name
       wird von A nach Z gelesen, und wer aus der Vorgabe „neu → alt" kommt,
       laege sonst beim ersten Mal auf „Z → A" -- dort, wo vor dieser Runde nie
       jemand landete. Getragen wird das von `start` an der Grundlage. */
    if (soField(d)) { soField(d).value = 'title'; soField(d).onchange(); }
    await new Promise(r => setTimeout(r, 50));
    const soTitel = soOrder(d);
    check('Die siebte ordnet nach Titel, aufsteigend',
      equal(soTitel, ['Alpha', 'Beta', 'Gamma']), JSON.stringify(soTitel));
    check('Und ihr Umschalter steht DA und ist nicht mehr gesperrt',
      !!soDir(d) && soDir(d).disabled === false && soDir(d).textContent === 'A → Z',
      `${soDir(d)?.textContent} · disabled=${soDir(d)?.disabled}`);
    /* UND EIN DRUCK DARAUF DREHT SIE WIRKLICH UM -- gefahren und nicht am
       Wortlaut abgelesen. Ohne die zweite Haelfte bliebe gruen, wer nur das
       WORT wechselt und die Liste stehen laesst; genau dieser Fehler ist in
       0.28.1 gefunden worden, als „Titel" nach dem Aenderungsdatum ordnete. */
    soDir(d)?.click();
    await new Promise(r => setTimeout(r, 50));
    check('Und ein Druck darauf dreht die Reihenfolge um',
      equal(soOrder(d), [...soTitel].reverse()) && soDir(d)?.textContent === 'Z → A',
      `${soOrder(d).join('>')} · ${soDir(d)?.textContent}`);
    /* UND DIE AUFSTEIGENDE SCHREIBWEISE BLEIBT DIESELBE. `title_asc` heisst
       weiter `title_asc` -- gespeicherte Ansichten aus 0.28.0 gelten
       unveraendert weiter, und die Gegenrichtung kommt als `title_desc` NEU
       dazu, statt die alte umzubenennen.
       GEPRUEFT AM GESENDETEN RUMPF: was die Oberflaeche INTERN haelt, ist
       ihre Sache; was hinausgeht, ist die Zusage. */
    const soPut = d.sent.filter(x => x.method === 'PUT' && x.url === '/api/settings');
    check('Und die Gegenrichtung geht als title_desc hinaus',
      soPut[soPut.length - 1]?.body?.filters?.sort === 'title_desc' &&
      soPut.some(x => x?.body?.filters?.sort === 'title_asc'),
      JSON.stringify(soPut.map(x => x?.body?.filters?.sort).slice(-3)));
    d.w.close();
  }

  /* ---- Zusage 15 und 16: der Filterkasten ----
     GEMESSEN AM GERAET (390 x 844, aufgeklappte Filter, fuenfzehn Eintraege,
     drei Kategorien): der Kasten misst 378 px, davon 90 px Beschriftungen und
     69 px Abstaende -- ZWEIUNDVIERZIG PROZENT sind Geruest und nicht
     Bedienung. Die erste Kachel beginnt bei y = 590 von 844.
     ZWEI HEBEL, UND KEINER DAVON SIND DIE PILLEN (Betreiber, 11.9.2026, F10).
     EINE HOEHE LAESST SICH IN jsdom NICHT MESSEN -- dort hat nichts eine
     Hoehe. Gepruefet wird deshalb, WAS die Hoehe macht: die beiden Hebel, jeder
     einzeln und namentlich. */
  {
    const soSchmal = soRegeln('.frow')[1] || '';
    /* ERSTER HEBEL: DIE BESCHRIFTUNG STEHT WIEDER DANEBEN. Bis 0.28.0 wurde
       die Zeile am schmalen Schirm zur SPALTE, und jede Beschriftung kostete
       eine eigene Zeile -- fuenfmal 18 px. */
    check('Erster Hebel: die Beschriftung steht am Telefon wieder NEBEN der Reihe',
      /display: grid/.test(soSchmal)
      && /grid-template-columns: auto minmax\(0, 1fr\)/.test(soSchmal),
      soSchmal || '(keine Regel)');
    check('Und Beschriftung und Reihe stehen in verschiedenen Spalten',
      /\.frow > \.eyebrow, \.frow > \.eyebrow-with \{ grid-column: 1;/.test(soCss)
      && /\.frow > \.pills, \.frow > \.select, \.frow > \.sort-pair \{ grid-column: 2;/.test(soCss),
      '(die Spaltenzuweisung fehlt)');
    /* UND WAS ZU KEINEM PAAR GEHOERT, SPANNT UEBER ALLE. Stuenden der Vermerk
       „folgt der Sortierung" und der Ruecksetzer der Sortierzeile in Spalte
       eins, waeren sie so schmal wie das laengste Beschriftungswort.
       SEIT 0.29.0 SIND ES NUR NOCH DIESE BEIDEN (Befund 6): die Verweise der
       Tagzeile stehen in der dritten Spalte. `1 / -1` spannt ueber DREI
       Spalten und nicht mehr ueber zwei -- die Schreibweise ist dieselbe, die
       Bedeutung folgt dem Raster.
       UND SEIT 0.30.0 STEHT „und/Oder" IN SPALTE EINS, in der ZWEITEN
       Rasterzeile -- also unter der Beschriftung und nicht mehr neben ihr
       (Befund 6, F9). Bis 0.29.0 stand er in Spalte zwei und nahm der Wolke
       die erste Zeile weg; genau das sieht der Betreiber am Bild.
       UND SEIT 0.32.1 IST ES NUR NOCH EINER: der Vermerk „folgt der
       Sortierung" (`#f-status-from`) ist mit der Filterableitung gefallen.
       Die Regel trifft jetzt allein den Ruecksetzer der Sortierzeile. */
    check('Und was zu keinem Paar gehoert, spannt ueber alle Spalten',
      /\.frow > \.frow-right \{ grid-column: 1 \/ -1; \}/.test(soCss) &&
      /\.frow > \.frow-right-end \{ grid-column: 3; \}/.test(soCss) &&
      /\.frow-tags > \.tagmode \{ grid-column: 1; grid-row: 2;/.test(soCss),
      '(die Spanne oder eine der beiden Spaltenzuweisungen fehlt)');
    /* ZWEITER HEBEL: DIE REIHEN ROLLEN QUER, STATT UMZUBRECHEN. Eine
       Kategoriereihe mit fuenf Pillen mass umgebrochen 77 px und misst in
       einer Zeile 35. OHNE ROLLBALKEN -- er naehme die Hoehe wieder weg, die
       die Zeile gerade gewonnen hat. */
    check('Zweiter Hebel: die Reihen rollen quer, statt umzubrechen',
      /\.frow > \.pills:not\(\.cloud\) \{ flex-wrap: nowrap; overflow-x: auto;/.test(soCss),
      '(die Reihen brechen weiter um)');
    check('Und ohne Rollbalken, der die gewonnene Hoehe wieder naehme',
      /scrollbar-width: none/.test(soCss)
      && /\.frow > \.pills:not\(\.cloud\)::-webkit-scrollbar \{ display: none; \}/.test(soCss),
      '(ein Rollbalken steht da)');
    /* DIE WOLKE IST AUSGENOMMEN. Sie hat ihr eigenes „mehr", und das misst die
       Zeilenhoehe an der ersten Marke -- eine Reihe, die nicht umbricht, hat
       keine zweite Zeile zu verbergen. */
    check('Und die Markenwolke ist ausdruecklich ausgenommen',
      /:not\(\.cloud\)/.test(soCss)
      && /\.frow > \.pills\.cloud \{ flex: 0 1 auto; \}/.test(soCss),
      '(die Wolke rollt mit)');
    /* ---- Zusage 16: die Pillen bleiben, wie sie sind ----
       SIE SIND NICHT DAS PROBLEM: gemessen machen sie 33 Prozent des Kastens
       aus, Beschriftungen und Abstaende 42. Sie stehen seit 0.28.0 bei 35 px,
       und kleiner wird am Finger schwierig. */
    check('Und die Pillen messen unveraendert weiter — sie waren nicht das Problem',
      /\.pill \{ padding: 7px 13px; \}/.test(soCss),
      soRegeln('.pill').join(' || ') || '(keine Regel)');
  }

  /* ---- Zusage 9: die Sterne werden filigraner ----
     BEFUND DES BETREIBERS (11.9.2026): „die sterne koennten auch etwas
     filigraner werden. auch die nehmen recht viel platz weg." Bei sieben
     Kriterien standen rund 350 Pixel Bewertung auf dem Schirm.
     BEIDE MASSE IN EINER ZUSAGE: kleiner als vorher UND groesser als am
     Zeiger. Nur die eine Haelfte zu fragen hiesse, den Stern entweder gar
     nicht zu verkleinern oder ihn auf das Zeigermass zu setzen -- und ein
     Stern ist ein ZIEL und kein Zeichen: man tippt darauf. */
  {
    const soRegeln = (waehler) => soCss.match(
      new RegExp('(?<=[{}])\\s*' + waehler.replace(/\./g, '\\.') + ' \\{[^}]*\\}', 'g')
    )?.map(r => r.trim()) || [];
    const soStern = soRegeln('.star');
    /* SEIT 0.30.1 SIND ES DREI (Befund 5, F10): Zeiger, Finger, Telefon.
       DIE ZUSAGE WIRD ERWEITERT UND NICHT ERSETZT -- Stolperstein 201. Die
       beiden alten Masse stehen unveraendert da; das dritte kommt hinzu, und
       es ist das kleinste von allen. Der Betreiber, 12. September 2026: „Ich
       finde die sterne koennen kleiner werden damit etwas mehr platz
       entsteht."
       WARUM EIN DRITTES UND NICHT EIN GEAENDERTES ZWEITES: das Fingermass gilt
       auch fuer ein Tablet, und dort ist die Breite da. Gemessen worden ist
       das Telefon. */
    check('Der Stern hat drei Masse: Zeiger, Finger, Telefon',
      soStern.length === 3, soStern.join(' || ') || '(keine Regel)');
    check('Am Zeiger steht er unveraendert auf 1.2rem',
      /font-size: 1\.2rem/.test(soStern[0] || ''), soStern[0] || '(keine Regel)');
    /* KLEINER ALS DIE 1.45rem VON VORHER UND GROESSER ALS DIE 1.2rem DES
       ZEIGERS -- gerechnet und nicht abgeschrieben: eine Zahl, die dasteht,
       kann man vertauschen; eine, die zwischen zwei anderen liegen muss,
       nicht. */
    const soRem = Number(((soStern[1] || '').match(/font-size: ([\d.]+)rem/) || [])[1]);
    check('Am Finger ist er kleiner als vorher und groesser als am Zeiger',
      soRem > 1.2 && soRem < 1.45, `${soRem}rem`);
    check('Und seine Polsterung ist mitgegangen — 3px statt 5px',
      /\.stars \.star \{ padding: 3px 4px; \}/.test(soCss),
      soRegeln('.stars .star').join(' || ') || '(keine Regel)');
    /* ---- DAS DRITTE MASS -- 0.30.1, Befund 5 (F10) ----
       GERECHNET UND NICHT ABGESCHRIEBEN, wie schon beim zweiten: es muss
       kleiner sein als beide anderen. Eine Zahl, die dasteht, kann man
       vertauschen; eine, die unter zwei anderen liegen muss, nicht.
       UND DER GEWINN STEHT DANEBEN: die Namensspalte im Einzelzugang waechst
       von 186 auf 210 px, und das laengste Wort eines Kriteriennamens misst
       200 -- gemessen am 12. September 2026 in echtem Chromium bei 390 x 844.
       Der Kasten wird dabei kein Pixel hoeher: 256 vorher, 256 nachher. */
    const soSchmal = Number(((soStern[2] || '').match(/font-size: ([\d.]+)rem/) || [])[1]);
    check('Und am Telefon ist er kleiner als an beiden anderen',
      soSchmal < 1.2 && soSchmal < soRem, `${soSchmal}rem gegen ${soRem}rem und 1.2rem`);
    check('Und auch dort geht die Polsterung mit — 3px ringsum',
      /\.stars \.star \{ padding: 3px 3px; \}/.test(soCss),
      soRegeln('.stars .star').join(' || ') || '(keine Regel)');
    check('Und der Abstand zwischen den Sternen ebenso — 2px statt 3px',
      /\.stars \{ gap: 2px; \}/.test(soCss),
      soRegeln('.stars').join(' || ') || '(keine Regel)');
  }

  /* ---- Zusage 12 und 13: die Titelzeile dehnt sich ----
     DER BEFUND: „der stern ist nicht an der rechten seite sondern irgendwie
     links vom rechten seite" (Betreiber, 11.9.2026). Gemessen war `.detail`
     366 px breit und `.title-head` darin 278 -- der Stern stand buendig rechts
     in einer Zeile, die 88 Pixel zu kurz war.
     DIE URSACHE IST EIN WERT, DER DIE BAUFORM WECHSELT: `align-items: start`
     heisst im RASTER „Spalten oben ausrichten" und ist dort richtig. Am
     Telefon wird `.detail` zu einer flexiblen SPALTE -- und dort heisst
     derselbe Wert „Kinder nicht auf volle Breite dehnen".
     DIE SORTE IST GEFAEHRLICH: der Wert steht richtig da, wo er geschrieben
     wurde, und wird falsch, wo die Anzeigeart wechselt. Am Schreibtisch ist
     nichts zu sehen. */
  {
    const soRegeln = (waehler) => soCss.match(
      new RegExp('(?<=[{}])\\s*' + waehler.replace(/\./g, '\\.') + ' \\{[^}]*\\}', 'g')
    )?.map(r => r.trim()) || [];
    const soDetail = soRegeln('.detail');
    check('Am Schreibtisch bleibt der Eintrag ein Raster mit `align-items: start`',
      /display: grid/.test(soDetail[0] || '') && /align-items: start/.test(soDetail[0] || ''),
      soDetail[0] || '(keine Regel)');
    const soFlex = soDetail.find(r => /flex-direction: column/.test(r)) || '';
    check('Am Telefon wird er eine Spalte — und dehnt seine Kinder ausdruecklich',
      /align-items: stretch/.test(soFlex) && !/align-items: start/.test(soFlex),
      soFlex || '(keine Telefonregel)');
    /* ---- Zusage 14: die tote Regel faellt ----
       `.back` ist mit 0.28.0 gefallen; die eine Zeile im Telefonabschnitt ist
       stehengeblieben und traf nichts mehr. Eine Regel ohne Traeger bleibt
       nicht stehen.
       GEFRAGT WIRD DER WAEHLER UND NICHT DER TEXT: der Absatz hier nennt die
       Klasse woertlich, und eine Zusage ueber das rohe Stilblatt faende sie
       dort wieder. */
    check('Und die tote Regel `.back` steht nirgends mehr im Stilblatt',
      !/(?:^|[ ,{}])\.back[ ,{:]/.test(soCss),
      (soCss.match(/[^{}]*\.back[^{}]*\{[^}]*\}/g) || []).join(' || ') || '(keine)');
  }

  /* ---- Zusage 10 und 11: die Abschnittsliste klappt ein ----
     GEMESSEN (390 px): die Reiterliste misst 241 px bei fuenf Abschnitten, und
     die erste Karte beginnt bei y = 480 von 844 -- 57 Prozent des Schirms sind
     Bedienung, bevor die erste Auskunft dasteht.
     DIESELBE BAUFORM WIE DER FILTERSCHALTER DER UEBERSICHT (F9) und kein
     zweites Muster: ein Knopf darueber, der den Namen des offenen Abschnitts
     traegt.
     DIE BREITE WIRD GESTELLT UND NICHT GERATEN: jsdom hat keine, und
     `matchMedia` antwortet dort auf jede Frage mit „nein". Beide Lagen werden
     deshalb ausdruecklich gebaut -- dieselbe Frage, die auch das Stilblatt
     stellt. */
  {
    const soSys = async (schmal) => {
      const d = buildDom(JSDOM, {});
      await new Promise(r => setTimeout(r, 60));
      d.w.matchMedia = () => ({ matches: schmal, addEventListener() {}, addListener() {} });
      await sysSection(d.w, 'inventory');
      return d;
    };
    const soEng = await soSys(true);
    const soKnopf = soEng.w.document.getElementById('sys-toggle');
    const soReiter = soEng.w.document.getElementById('sys-tabs');
    check('Ueber den Abschnitten steht ein Schalter', !!soKnopf && !!soReiter,
      soKnopf ? '(Reiter fehlen)' : '(kein Schalter)');
    /* UND ER SAGT, WAS DAHINTERSTECKT. Eine Liste, die ohne Auskunft
       eingeklappt dasteht, ist derselbe Fehler wie ein Filter ohne Zahl:
       niemand sieht, wo er gerade ist. */
    check('Und er traegt den Namen des offenen Abschnitts',
      soKnopf?.querySelector('.fcount')?.textContent === 'Bestand',
      JSON.stringify(soKnopf?.querySelector('.fcount')?.textContent));
    check('Am Telefon steht die Liste eingeklappt da',
      soReiter?.classList.contains('closed')
      && soKnopf?.getAttribute('aria-expanded') === 'false',
      `${soReiter?.className} · ${soKnopf?.getAttribute('aria-expanded')}`);
    soKnopf?.dispatchEvent(new soEng.w.MouseEvent('click', { bubbles: true }));
    check('Ein Druck holt sie hervor',
      !soReiter?.classList.contains('closed')
      && soKnopf?.getAttribute('aria-expanded') === 'true',
      `${soReiter?.className} · ${soKnopf?.getAttribute('aria-expanded')}`);
    soKnopf?.dispatchEvent(new soEng.w.MouseEvent('click', { bubbles: true }));
    check('Und der naechste legt sie wieder weg',
      soReiter?.classList.contains('closed'), soReiter?.className);
    soEng.w.close();
    /* ---- Zusage 11: am Schreibtisch unveraendert ----
       Ohne die Frage nach der Breite saesse ein breites Fenster vor
       eingeklappten Abschnitten und haette keinen sichtbaren Knopf, sie zu
       oeffnen -- der Schalter selbst steht dort im Stilblatt auf
       `display: none`. */
    const soBreit = await soSys(false);
    check('Am Schreibtisch steht die Liste unveraendert offen',
      !soBreit.w.document.getElementById('sys-tabs')?.classList.contains('closed'),
      soBreit.w.document.getElementById('sys-tabs')?.className);
    soBreit.w.close();
    /* UND DER SCHALTER STEHT NUR AM TELEFON DA. Er ist im Baum, aber das
       Stilblatt zeigt ihn erst am Finger -- dieselbe Bauform wie beim
       Filterschalter der Uebersicht. */
    check('Und der Schalter selbst steht nur am Telefon da',
      /\.sys-toggle \{ display: none;/.test(soCss)
      && /\.sys-toggle \{ display: inline-flex; \}/.test(soCss)
      && /\.sys-tabs\.closed \{ display: none; \}/.test(soCss),
      soRegeln('.sys-toggle').join(' || ') || '(keine Regel)');
  }

  /* ---- Zusage 17 STEHT HIER NICHT ----
     „`F_ROUTES` bleibt bei 72, die lesenden bei 31" ist die siebzehnte Zusage
     des Auftrags, und sie wird NICHT hier noch einmal aufgeschrieben: das
     Verzeichnis der schreibenden Wege sagt es bereits, Zeile fuer Zeile und
     mit derselben Zahl. Eine zweite Zeile daneben waere eine zweite Wahrheit
     ueber dieselbe Sache (Stolperstein 47) -- und sie liefe beim naechsten Weg
     von der ersten weg.
     WO SIE STEHT: in der Gruppe „Der Waechter ueber den Quelltext", zusammen mit
     den Wegen, die sie zaehlt -- die Zeile heisst dort „Und es sind jetzt genau
     72 schreibende Routen". */

  /* ================= Der Potenzialmodus — 0.26.0 ==========================
     EIN SCHALTER, UND ER WIRKT AN FUENF STELLEN. Das ist der ganze Punkt:
     ein abgeschalteter Modus, der an einer Stelle doch noch durchscheint,
     ist kein abgeschalteter Modus. Jede der fuenf bekommt deshalb ihre
     eigene Zusage, und jede in BEIDEN Lagen -- mit Schalter da, ohne
     Schalter weg. Eine Zusage, die nur die eine Lage prueft, waere auch dann
     gruen, wenn die Stelle IMMER leer bliebe (Stolperstein 81).
     DER BESTAND TRAEGT POTENZIALZAHLEN, und zwar in beiden Lagen. Genau das
     ist die Forderung des Betreibers: „auch wenn Potenzial Bewertungen schon
     vorhanden sind duerfen die nicht im Overview angezeigt werden". Der
     Server rechnet sie weiter aus (F1) -- die Oberflaeche muss dicht sein,
     nicht der Server. */
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

    /* ---- 1. DIE UEBERSICHT (F5) --------------------------------------
       An der Stelle der Kopfzahl steht NICHTS -- kein Platzhalter, kein
       Strich, die Zeile schliesst sich. Eine leere Stelle, an der einmal
       etwas stand, sieht aus wie ein Fehler.
       GEZAEHLT WIRD AN DEN UNGETESTETEN: ein getesteter Eintrag zeigt seine
       Bewertung ★ weiter, und die hat mit dem Potenzial nichts zu tun. */
    const pmDiamonds = (d) => d.w.document.querySelectorAll('.rating-inline.potential').length;
    const pmStars = (d) => d.w.document.querySelectorAll('.rating-inline:not(.potential)').length;
    check('Mit Schalter traegt die Uebersicht die Kopfzahl ◆',
      pmDiamonds(pmOn) === 2, `${pmDiamonds(pmOn)} Rauten`);
    check('Ohne Schalter steht dort nichts',
      pmDiamonds(pmOff) === 0, `${pmDiamonds(pmOff)} Rauten`);
    /* UND DIE STERNE DER GETESTETEN BLEIBEN IN BEIDEN LAGEN STEHEN. Ohne
       diese Zeile waere „ohne Schalter steht dort nichts" auch dann gruen,
       wenn die ganze Kachelzahl verschwunden waere. */
    check('Und die Bewertung der getesteten steht in beiden Lagen da',
      pmStars(pmOn) === 2 && pmStars(pmOff) === 2,
      `mit ${pmStars(pmOn)}, ohne ${pmStars(pmOff)}`);
    /* UND AUCH DER SATZ „noch nicht eingeschätzt" IST WEG. Er ist die andere
       Haelfte derselben Stelle: ohne Zahl stand dort bis 0.26.0 ein Hinweis,
       und ein Hinweis auf eine Schaetzung, die es nicht gibt, ist derselbe
       Durchschein wie die Zahl selbst. */
    const pmText = (d) => d.w.document.getElementById('app')?.textContent || '';
    /* GEPRUEFT AN EINEM EIGENEN BESTAND: der oben traegt an BEIDEN ungetesteten
       eine Zahl, und dann stuende der Hinweis auch mit Schalter nirgends --
       die Zusage waere gruen, ohne etwas zu belegen (Stolperstein 106). */
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

    /* ---- 2. DIE SORTIERUNG -------------------------------------------
       Eine Sortierung nach einer Zahl, die nirgends zu sehen ist, ordnet
       nach etwas Unsichtbarem. */
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
       `potential_desc` stellte den Statusfilter auf „nicht getestet". 0.26.0
       hat diese Kopplung fallen lassen, WENN der Schalter aus ist -- sie
       konnte sonst nur noch aus einer GESPEICHERTEN Ansicht heraus greifen
       und den Filter stellen, ohne dass jemand etwas ausgewaehlt haette.
       MIT 0.32.1 IST SIE IN BEIDEN LAGEN GEFALLEN, weil die Ableitung als
       Ganzes ausgebaut ist. Die beiden Zeilen bleiben stehen und drehen sich
       mit: sie belegen jetzt, dass die gespeicherte Sortierung den Status
       WEDER mit noch ohne Schalter anfasst. Ein Rueckfall faende hier eine
       rote Zeile -- und das ist der Grund, sie nicht zu streichen. */
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

    /* ---- 4. DER STERNKASTEN AM EINTRAG -------------------------------
       GAR NICHT ERST GEZEICHNET und nicht bloss eingeklappt. Der
       Unterschied ist der ganze Punkt: eingeklappt heisst sichtbar --
       Kopfzeile, Griff, Pfeil --, und ein Klick liesse Sterne vergeben.
       Genau diesen Fehler hat 0.22.1 am Bewertungskasten repariert.
       GEFRAGT WIRD DER BAUM UND NICHT DIE SICHTBARKEIT: ein `[hidden]`
       stuende noch darin, und was im Baum steht, findet frueher oder
       spaeter jemand. */
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
       DIE ZUSAGE, DIE DEN SCHALTER AM SERVER UMGEHT. Der Server rechnet
       `potentialRating` weiter aus und liefert es in jeder Antwort (F1) --
       der Bestand oben traegt Zahlen an beiden ungetesteten Eintraegen. Wenn
       die Oberflaeche trotzdem nichts davon zeigt, ist sie dicht.
       SIE IST DIE WICHTIGSTE DER SIEBEN. Ein Modus, der nur deshalb aus
       aussieht, weil zufaellig keine Zahlen da sind, ist nicht aus. */
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
     Stellen. Eine Regel, die im Papier steht und im Stilblatt gebrochen wird,
     ist keine Regel -- der Pruefstand muss sie kennen (Stolperstein 314). */
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
      /* Seit 0.23.0 traegt --scrim den ganzen Wert und nicht die Regel:
         im hellen Schema aendern sich BEIDE Teile, Farbe und Deckung. Geprueft
         wird deshalb die KETTE -- die Regel nimmt --scrim, --scrim ist
         eine Teildeckung des Schleiertripels, und das Tripel ist die Farbe.
         Nur das letzte Glied zu pruefen liesse die Regel selbst offen. */
      /\.backdrop \{[^}]*background: var\(--scrim\)/.test(css123)
        && /--scrim: *rgba\(var\(--scrim-rgb\), *\.78\)/.test(cssRaw)
        && /--scrim-rgb: *6,\s*7,\s*9/.test(cssRaw)
        && !/\.backdrop \{[^}]*filter/.test(css123),
      regel123('.backdrop') || '(keine Regel)');
  }

  /* ================= Das Farbschema — 0.23.0 =================
     Die Maschine, nicht die Farben: wo die Einstellung steht, wie sie ans
     Wurzelelement kommt, und WAS VOR DEM ERSTEN ANSTRICH ZU SEHEN IST. Der
     letzte Punkt ist der, der im Feld auffaellt und sonst nirgends. */
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
       Browser wortlos abgewiesen. Genau so stand er zuerst da. */
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
       anders: theme.js laeuft, bevor es app.js gibt. Also haelt sie eine
       Pruefung gegeneinander -- sonst laufen sie beim naechsten Umbenennen
       auseinander, und der Vorgriff liest ins Leere (Stolperstein 47). */
    const keyBoot = (tBoot || '').match(/getItem\('([^']+)'\)/);
    const keyApp = tApp.match(/THEME_KEY = '([^']+)'/);
    check('Der Name des gemerkten Schluessels stimmt in beiden Dateien ueberein',
      !!keyBoot && !!keyApp && keyBoot[1] === keyApp[1],
      `theme.js: ${keyBoot?.[1]} · app.js: ${keyApp?.[1]}`);
    check('Ohne Gedaechtnis steht dunkel da — die Vorgabe, auch vor der Anmeldung',
      /\? 'light' : 'dark'/.test(tBoot || '') && /catch[\s\S]{0,80}= 'dark'/.test(tBoot || ''),
      tBoot === null ? '(keine Datei)' : 'Rueckfall geprueft');

    /* DAS STILBLATT KENNT ZWEI WERTE UND NICHT DREI. „Wie das Geraet" loest
       app.js auf; stuende es hier, muesste jeder Wert dreimal geschrieben
       werden. */
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
    /* DIE DAEMPFUNG SCHIEBT ZUM GRUND HIN UND NICHT ZU SCHWARZ -- Regel F4.
       `brightness(.5)` macht ein Foto DUNKLER; auf weisser Karte waere der
       abgelehnte Eintrag damit der lauteste Fleck der Seite und stuende vor
       dem angenommenen daneben. Gemessen an einem mittleren Foto gegen die je
       eigene Karte: dunkel 1,71 : 1, hell mit brightness 10,33, hell mit
       opacity(.45) wieder 1,71. Derselbe Wert, andere Richtung. */
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
}

module.exports = laufen;
if (require.main === module) H.alleine(laufen, __filename);
