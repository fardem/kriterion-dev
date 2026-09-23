/* Kriterion — Pruefstand: die Oberflaeche: Export und Anzeige Der Export in
   Teilen, die nachziehende Anzeige, die Filterleiste, die Kategoriezeile, die
   Marke, die Sternreihe und das Raster. */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  buildDom, openTagRow, sysSection, css123, regel123, withoutMedia, until, openRequests
} = D;

async function run() {
  const {
   fs, os, path, attachments, sharp, CODE, COMMENT, __dirname, require,
   FILTER, group, check, equal, open, startFurtherServer
  } = H;
  /* DIESES MODUL BAUT FENSTER. Fehlt jsdom, sagt es das und haelt an. */
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch { console.log('  … uebersprungen: jsdom fehlt (npm install)'); return; }
  const listReady = (x) => x.document.querySelector('#filters .frow') && openRequests(x) === 0;
  const detailReady = (x) => x.document.getElementById('ratings') && openRequests(x) === 0;

  /* ---------------------------------------------------------------- */
  group('Der Export in Teilen');

  /* WOZU DIESE GRUPPE MEHR PRUEFT ALS DIE ANDEREN: der Betreiber hat den Weg
     an EINE Bedingung gebunden -- "wenn es sich genauso ein und ausspielen
     laesst". */
  const tlDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-teile-'));
  const tlTargetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-teile-ziel-'));
  /* 6880 UND 6940, UND SIE SIND NACHGESEHEN: 6700, 6760 und 6820 gehoeren der
     Selbstanmeldung. */
  const tlA = startFurtherServer(tlDir, {}, 6880);
  const tlB = startFurtherServer(tlTargetDir, {}, 6940);
  await tlA.ready; await tlB.ready;
  const TL_WORD = 'teile-wort-4711';
  for (const S of [tlA, tlB]) {
    await S.call('POST', '/api/setup', { user: 'chefin', password: TL_WORD });
    await S.call('POST', '/api/login', { user: 'chefin', password: TL_WORD });
  }
  const tlFree = (S, purpose, target = null) =>
    S.call('POST', '/api/confirm', { password: TL_WORD, purpose, target });

  /* DER BESTAND MUSS BYTES TRAGEN, sonst gibt es nichts zu schneiden. */
  const tlKinds = ['note', 'report', 'task', 'done'];
  const tlAttachment = Buffer.alloc(420 * 1024, 'x');
  // Tags entstehen AM EINTRAG und nicht ueber eine eigene Route -- so, wie es
// die Oberflaeche auch tut.
  const tlTagNames = ['alu', 'stahl', 'holz'];
  const tlCriterion = (await tlA.call('GET', '/api/criteria')).content;
  for (let i = 1; i <= 6; i++) {
    const it = (await tlA.call('POST', '/api/items',
      { title: `Teilstueck ${i} - "Zitat" & <Klammer>`, description: `Text ${i} mit aeoeuess` })).content;
    await tlA.call('PUT', `/api/items/${it.id}`,
      { tested: i % 2 === 0, rejected: i === 5, favorite: i % 3 === 0 });
    for (const n of tlTagNames.slice(0, 1 + (i % 3))) await tlA.call('POST', `/api/items/${it.id}/tags`, { name: n });
    for (const c of tlCriterion) await tlA.call('PUT', `/api/items/${it.id}/ratings/${c.id}`, { value: 1 + ((i + c.id) % 5) });
    await tlA.call('POST', `/api/items/${it.id}/test-days`, { day: `2026-0${1 + (i % 7)}-0${1 + (i % 8)}`, rating: 1 + (i % 5) });
    await tlA.call('POST', `/api/items/${it.id}/links`, { url: `https://beispiel.de/t/${i}` });
    for (let c = 0; c < 4; c++) {
      const fk = new FormData();
      fk.append('text', `Kommentar ${c} an Stueck ${i} - mit <b>Markup</b>`);
      fk.append('kind', tlKinds[c]);
      fk.append('pinned', c % 2 === 0 ? '1' : '0');
      await fetch(`${tlA.base}/api/items/${it.id}/comments`,
        { method: 'POST', headers: H.withCsrf(tlA.cookieValue()), body: fk });
    }
    const fa = new FormData();
    fa.append('files', new Blob([tlAttachment], { type: 'text/plain' }), `gross-${i}.txt`);
    await fetch(`${tlA.base}/api/items/${it.id}/attachments`,
      { method: 'POST', headers: H.withCsrf(tlA.cookieValue()), body: fa });
  }

  /* --- Der Plan --- */
  const tlToggle = 'photos=1&files=1&videos=1';
  const tlPlanCall = (extraEnv = '') => tlA.call('GET', `/api/export/plan?${tlToggle}${extraEnv}`);
  const tlPlan = (await tlPlanCall('&target=1048576')).content;
  check('Der Plan schneidet den Bestand in mehrere Teile',
    (tlPlan?.parts || []).length > 1, JSON.stringify((tlPlan?.parts || []).map(t => t.count)));
  /* GESCHNITTEN WIRD AN EINTRAGSGRENZEN, nie mitten hinein: ein halber
     Eintrag waere kein gueltiger Export, und der Import muesste zwei Teile
     kennen, um ihn zu verstehen. */
  check('Jeder Teil traegt ganze Eintraege und keiner ist leer',
    tlPlan.parts.every(t => t.count >= 1 && t.from <= t.to));
  check('Die Fenster stossen aneinander und ueberlappen sich nicht',
    tlPlan.parts.every((t, i) => i === 0 || t.from > tlPlan.parts[i - 1].to),
    JSON.stringify(tlPlan.parts.map(t => `${t.from}-${t.to}`)));
  check('Und zusammen decken sie jeden Eintrag genau einmal',
    tlPlan.parts.reduce((n, t) => n + t.count, 0) === 6,
    String(tlPlan.parts.reduce((n, t) => n + t.count, 0)));
  check('Die Teile sind durchnummeriert, bei eins beginnend',
    tlPlan.parts.every((t, i) => t.nr === i + 1), JSON.stringify(tlPlan.parts.map(t => t.nr)));
  /* DER ZIELWERT LAESST SICH KLEINER STELLEN, ABER NICHT GROESSER: oberhalb
     des Warnwerts baute die Instanz Teile, vor denen sie im selben Atemzug
     warnt. */
  check('Ein zu grosser Zielwert wird auf den Warnwert gedeckelt',
    (await tlPlanCall('&target=999999999')).content.targetSize === tlPlan.fallback,
    JSON.stringify((await tlPlanCall('&target=999999999')).content.targetSize));
  check('Und ein zu kleiner auf das kleinste zulaessige Mass',
    (await tlPlanCall('&target=1')).content.targetSize === tlPlan.smallest,
    JSON.stringify((await tlPlanCall('&target=1')).content.targetSize));
  check('Ohne Angabe gilt der Warnwert',
    (await tlPlanCall()).content.targetSize === tlPlan.fallback);
  // Ein groesserer Zielwert ergibt weniger Teile -- sonst schnitte der Plan
// nach etwas anderem als der Groesse.
  check('Ein groesserer Zielwert ergibt weniger Teile',
    (await tlPlanCall()).content.parts.length < tlPlan.parts.length,
    `${(await tlPlanCall()).content.parts.length} gegen ${tlPlan.parts.length}`);
  /* DER PLAN VERLAESST DAS HAUS NICHT und braucht deshalb keine zweite
     Bestaetigung -- die steht an den Teilen selbst. */
  check('Der Plan kommt ohne zweite Bestaetigung',
    (await tlPlanCall()).status === 200);

  /* --- Das Fenster am Export --- */
  const tlN = tlPlan.parts.length;
  const tlAddress = (t) =>
    `/api/export?${tlToggle}&from=${t.from}&to=${t.to}&part=${t.nr}&parts=${tlN}`;
  /* EINE HALBE ANGABE IST EIN FEHLER UND KEIN VOLLEXPORT: wer `von` schickt
     und `bis` vergisst, bekaeme sonst stillschweigend alles -- und merkte es
     erst an der Dateigroesse. */
  await tlFree(tlA, 'export', 1);
  check('Eine halbe Angabe wird abgewiesen und nicht als Vollexport gelesen',
    (await tlA.call('GET', `/api/export?${tlToggle}&from=1&part=1&parts=2`)).status === 400);
  await tlFree(tlA, 'export', 1);
  check('Und ein Fenster, dessen Ende vor dem Anfang liegt, ebenso',
    (await tlA.call('GET', `/api/export?${tlToggle}&from=9&to=2&part=1&parts=2`)).status === 400);

  /* --- Die Freigabe je Teil --- */
  /* EINE ABFRAGE, MEHRERE FREIGABEN -- aber jede fuer sich. */
  await tlFree(tlA, 'export', 1);
  check('Eine Freigabe fuer Teil 1 laesst Teil 2 nicht durch',
    (await tlA.call('GET', tlAddress({ ...tlPlan.parts[1], nr: 2 }))).status === 403);
  await tlFree(tlA, 'export', 1);
  const tlOne = await tlA.call('GET', tlAddress(tlPlan.parts[0]));
  check('Mit der eigenen Freigabe geht der Teil durch', tlOne.status === 200,
    `${tlOne.status}`);
  check('Und sie ist danach verbraucht',
    (await tlA.call('GET', tlAddress(tlPlan.parts[0]))).status === 403);
  check('Ohne Freigabe geht auch der volle Export nicht',
    (await tlA.call('GET', `/api/export?${tlToggle}`)).status === 403);

  /* --- Jeder Teil ist eine vollstaendige Exportdatei --- */
  const tlFiles = [];
  for (const t of tlPlan.parts) {
    await tlFree(tlA, 'export', t.nr);
    const a = await fetch(`${tlA.base}${tlAddress(t)}`, { headers: { cookie: tlA.cookieValue() } });
    tlFiles.push({ head: a.headers.get('content-disposition') || '', text: await a.text() });
  }
  check('Der Dateiname nennt Teil und Gesamtzahl',
    tlFiles.every((d, i) => d.head.includes(`-part-${i + 1}-of-${tlN}-`)),
    tlFiles.map(d => d.head).join(' | '));
  const tlPackages = tlFiles.map(d => { try { return JSON.parse(d.text); } catch { return null; } });
  check('Jeder Teil ist fuer sich gueltiges JSON', tlPackages.every(p => p && Array.isArray(p.items)));
  /* DERSELBE UMSCHLAG UND DIESELBE FORMATNUMMER -- daran haengt, dass der
     vorhandene Import sie ohne eine Zeile Aenderung annimmt. */
  /* JEDE LESESTELLE ABGEFANGEN: ist ein Teil nicht lesbar, sollen die
     Pruefungen darunter ROT werden und nicht der Lauf abreissen. */
  check('Jeder Teil traegt denselben Umschlag wie ein voller Export',
    tlPackages.every(p => p?.version === tlPackages[0]?.version && p?.title === tlPackages[0]?.title
      && Array.isArray(p?.criteria) && p.criteria.length === tlPackages[0]?.criteria?.length),
    JSON.stringify(tlPackages.map(p => [p?.version, p?.criteria?.length])));
  // Jeder Teil traegt dieselbe Nummer wie ein voller Export -- ein Teil ist ein
// vollstaendiges Paket mit weniger Eintraegen darin, kein halbes.
  check('Und jeder Teil traegt die Formatnummer des vollen Exports',
    tlPackages.every(p => p?.version === 19), JSON.stringify(tlPackages.map(p => p?.version)));
  check('Zusammen tragen die Teile jeden Eintrag genau einmal',
    tlPackages.reduce((n, p) => n + (p?.items?.length || 0), 0) === 6 &&
    new Set(tlPackages.flatMap(p => (p?.items || []).map(i => i.title))).size === 6,
    JSON.stringify(tlPackages.map(p => p?.items?.length)));
  // Und die Schaetzung war keine Erfindung: die wirkliche Datei liegt in der
// Naehe der angesagten Groesse und ueber ihr nicht.
  check('Die angesagte Groesse trifft die wirkliche',
    tlFiles.every((d, i) => d.text.length <= tlPlan.parts[i].bytes * 1.1
                           && d.text.length >= tlPlan.parts[i].bytes * 0.7),
    tlFiles.map((d, i) => `${d.text.length}/${tlPlan.parts[i].bytes}`).join(' '));
  check('Und kein Teil reisst die Grenze, an der es kippt',
    tlFiles.every(d => d.text.length < tlPlan.string), JSON.stringify(tlPlan.string));

  /* --- DER RUNDLAUF, und er ist die Bedingung ---------------------------- */
  /* DIE AUFNAHME NIMMT ALLES, WAS DER EXPORT TRAEGT, UND NICHTS, WAS ER NICHT
     TRAGEN KANN: keine Nummern (sie werden neu vergeben) und keinen Zeitpunkt
     des Einspielens. */
  async function tlCapture(S) {
    const list = (await S.call('GET', '/api/items')).content;
    const outcome = [];
    for (const short of list) {
      const it = (await S.call('GET', `/api/items/${short.id}`)).content;
      outcome.push([it.title, it.description, !!it.rejected, !!it.tested, !!it.favorite,
        (it.tags || []).map(t => t.name).sort().join(','),
        (it.links || []).map(l => l.url).sort().join(','),
        (it.photos || []).length, (it.attachments || []).map(a => a.filename).sort().join(','),
        (it.testDays || []).map(d => `${d.day}:${d.rating}`).sort().join(','),
        (it.ratings || []).map(r => `${r.name}=${r.value}`).sort().join(','),
        (it.comments || []).map(c => `${c.kind}|${c.pinned ? 'P' : '-'}|${c.text}`).sort().join('~')
      ].join('#|#'));
    }
    return outcome.sort();
  }
  const tlBefore = await tlCapture(tlA);
  check('Die Quelle traegt ueberhaupt einen Bestand', tlBefore.length === 6, String(tlBefore.length));
  // Und er ist reich genug, um etwas zu belegen: ein Rundlauf ueber nackte
// Titel bliebe auch dann gruen, wenn Kommentare und Anhaenge verlorengingen.
  check('Und er traegt Kommentare, Anhaenge, Links und Bewertungen',
    tlBefore.every(z => z.includes('Kommentar 0') && z.includes('gross-')
                     && z.includes('https://') && z.includes('=')));

  for (let i = 0; i < tlFiles.length; i++) {
    await tlFree(tlB, 'import', null);
    const fd = new FormData();
    fd.append('file', new Blob([tlFiles[i].text], { type: 'application/json' }), `teil-${i + 1}.json`);
    fd.append('mode', i === 0 ? 'replace' : 'merge');
    const a = await fetch(`${tlB.base}/api/import`,
      { method: 'POST', headers: H.withCsrf(tlB.cookieValue()), body: fd });
    check(`Teil ${i + 1} spielt sich ein`, a.status === 200, `${a.status}`);
  }
  const tlAfter = await tlCapture(tlB);
  check('Nach dem Einspielen aller Teile steht derselbe Bestand da',
    tlAfter.length === tlBefore.length, `${tlAfter.length} gegen ${tlBefore.length}`);
  /* FELD FUER FELD und nicht nur die Zahl: eine gleiche Anzahl bei anderem
     Inhalt waere genau der Fehler, den niemand bemerkt. */
  check('Und zwar Feld fuer Feld derselbe',
    tlAfter.join('') === tlBefore.join(''),
    (tlAfter.find((z, i) => z !== tlBefore[i]) || '(keine Abweichung)').slice(0, 240));

  /* --- Ein Eintrag, der in keinen Teil passt --- */
  /* ER WIRD BEIM NAMEN GENANNT UND NICHT STILLSCHWEIGEND UEBERGANGEN. */
  {
    const d = open(path.join(tlDir, 'katalog.sqlite'));
    d.pragma('busy_timeout = 4000');
    const it = d.prepare("INSERT INTO items (title, description, user_id) VALUES ('Der Riese', '', 1)").run();
    // zeroblob() legt die Laenge an, ohne die Bytes zu schreiben -- length()
// sieht sie trotzdem, und genau darueber rechnet der Plan.
    d.prepare(`INSERT INTO attachments (item_id, filename, mime_type, size, data, sort_order, user_id)
               VALUES (?, 'riese.bin', 'application/octet-stream', ?, zeroblob(?), 0, 1)`)
      .run(it.lastInsertRowid, 400 * 1024 * 1024, 400 * 1024 * 1024);
    d.close();
    const p2 = (await tlPlanCall('&target=1048576')).content;
    check('Ein Eintrag, der fuer sich zu gross ist, steht namentlich da',
      (p2.tooBig || []).length === 1 && p2.tooBig[0].title === 'Der Riese',
      JSON.stringify(p2.tooBig));
    check('Und er steckt in keinem Teil',
      p2.parts.every(t => t.to < it.lastInsertRowid || t.from > it.lastInsertRowid),
      JSON.stringify(p2.parts.map(t => `${t.from}-${t.to}`)) + ` Riese ${it.lastInsertRowid}`);
    // Ohne die Dateien ist er klein genug -- der Hinweis an der Karte sagt
// genau das, und ohne diese Zeile waere er eine Behauptung.
    const p3 = (await tlA.call('GET', '/api/export/plan?photos=1&target=1048576')).content;
    check('Ohne die Dateien passt er wieder in einen Teil',
      (p3.tooBig || []).length === 0, JSON.stringify(p3.tooBig));
  }

  tlA.stop(); tlB.stop();
  fs.rmSync(tlDir, { recursive: true, force: true });
  fs.rmSync(tlTargetDir, { recursive: true, force: true });

  /* ---------------------------------------------------------------- */
  /* ================= Der Teilexport MIT zweitem Faktor — 0.13.0 =========
     DIE GRUPPE DARUEBER FAEHRT GEGEN EINEN SERVER OHNE ZWEITEN FAKTOR, und
     genau daran ist 0.12.4 im Betrieb gescheitert: dort ist das wiederholte
     Passwort harmlos, weil es gegen einen Hash laeuft und sich beliebig oft
     vergleichen laesst. */
  {
    const ZF2 = require('./twofactor');
    group('Der Teilexport mit zweitem Faktor');

    const tzDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-teile-zf-'));
    // 7000: die naechste freie Basis ueber 6940 (Teilexport, Ziel), und sie
// deckt keine Nummer von der Sperrliste. Der Waechter unten zaehlt sie mit.
    const tzS = startFurtherServer(tzDir, {}, 7000);
    await tzS.ready;
    const TZ_WORD = 'teile-faktor-wort-88';
    await tzS.call('POST', '/api/setup', { user: 'chefin', password: TZ_WORD });
    await tzS.call('POST', '/api/login', { user: 'chefin', password: TZ_WORD });

    /* EIN CODE, DER TRAEGT -- und die beiden Bedingungen dafuer stehen hier
       an EINER Stelle, statt an jeder Aufrufstelle noch einmal. */
    let tzUsed = -1;
    const tzCode = async () => {
      await until(null, () => 30000 - (Date.now() % 30000) >= 9000 && ZF2.nowStep() + 1 > tzUsed,
        35000, 'ein unverbrauchter Zeitschritt mit 9 s Rest', 50);
      tzUsed = ZF2.nowStep() + 1;
      return ZF2.code(tzSecret, tzUsed);
    };
    // Fuer die Absagen, die VOR der Codepruefung fallen.
    const TZ_NO_CODE = '000000';

    const tzQuiet = async () => {
      await until(null, () => 30000 - (Date.now() % 30000) >= 9000,
        10000, 'ein Zeitschritt mit 9 s Rest', 50);
    };

    await tzQuiet();
    const tzStart = await tzS.call('POST', '/api/two-factor/start', { password: TZ_WORD });
    // Abgefangen: gibt /start kein Geheimnis her, laeuft
    // alles Weitere trotzdem durch -- mit einem Wert, der zuverlaessig nicht
    // traegt, statt dass der Lauf hier abreisst.
    const tzSecret = (tzStart.content && tzStart.content.secret) || 'A'.repeat(32);
    const tzCounter = ZF2.nowStep();
    const tzAn = await tzS.call('POST', '/api/two-factor/on',
      { password: TZ_WORD, code: ZF2.code(tzSecret, tzCounter) });
    // DER BESTAETIGENDE CODE ZAEHLT ALS VERBRAUCHT -- das ist die Zusage "ein
// Code gilt genau einmal" an ihrer ersten Anwendung.
    tzUsed = tzCounter;
    /* ERST DER GEGENSTAND, DANN DIE EIGENSCHAFT: ohne
       eingeschalteten Faktor liefe die ganze Gruppe gegen denselben Server
       wie die Gruppe darueber und belegte nichts ueber die Einmaligkeit. */
    check('Der Zugang traegt wirklich einen eingeschalteten zweiten Faktor',
      tzAn.status === 200 && tzAn.content?.an === true, JSON.stringify(tzAn.content));
    const tzEinst = await tzS.call('GET', '/api/settings');
    check('Und der Server sagt der Oberflaeche, dass ein Code dazugehoert',
      tzEinst.content?.twoFactor === true, JSON.stringify(tzEinst.content?.twoFactor));

    /* DER BESTAND MUSS BYTES TRAGEN, sonst gibt es nichts zu schneiden --
       dieselbe Bauform wie in der Gruppe darueber: Anhaenge gehen als Bytes
       hinein und als Bytes wieder heraus. */
    const tzAttachment = Buffer.alloc(420 * 1024, 'y');
    for (let i = 1; i <= 4; i++) {
      const it = (await tzS.call('POST', '/api/items', { title: `Faktorstueck ${i}` })).content;
      const fa = new FormData();
      fa.append('files', new Blob([tzAttachment], { type: 'text/plain' }), `gross-${i}.txt`);
      await fetch(`${tzS.base}/api/items/${it.id}/attachments`,
        { method: 'POST', headers: H.withCsrf(tzS.cookieValue()), body: fa });
    }
    const tzToggle = 'photos=1&files=1&videos=1';
    const tzPlan = (await tzS.call('GET', `/api/export/plan?${tzToggle}&target=1048576`)).content;
    const tzParts = tzPlan?.parts || [];
    /* MEHR ALS EIN TEIL IST DIE BEDINGUNG DIESER GRUPPE. */
    check('Der Plan schneidet in mehr als einen Teil — sonst belegt diese Gruppe nichts',
      tzParts.length > 1, JSON.stringify(tzParts.map(t => t.count)));
    // Der Plan selbst braucht keine Bestaetigung und ist deshalb vom Fehler
    // nicht betroffen -- das gehoert festgehalten, weil im Betrieb genau
    // dieser Schritt noch ging und der naechste nicht mehr.
    check('Und er kommt ohne Bestaetigung, auch mit eingeschaltetem Faktor',
      (await tzS.call('GET', `/api/export/plan?${tzToggle}&target=1048576`)).status === 200);

    /* --- Der Fehler aus dem Betrieb, nachgestellt --- EINE EINGABE, N
       ANFRAGEN: die erste traegt, die zweite nicht. */
    const tzCodeA = await tzCode();
    const tzEinzeln1 = await tzS.call('POST', '/api/confirm',
      { password: TZ_WORD, purpose: 'export', target: tzParts[0]?.nr ?? 1, code: tzCodeA });
    const tzEinzeln2 = await tzS.call('POST', '/api/confirm',
      { password: TZ_WORD, purpose: 'export', target: tzParts[1]?.nr ?? 2, code: tzCodeA });
    check('Derselbe Code ein zweites Mal traegt nicht — ein Code gilt genau einmal',
      tzEinzeln1.status === 200 && tzEinzeln2.status === 403,
      `${tzEinzeln1.status} / ${tzEinzeln2.status}`);
    check('Und die Absage ist die des zweiten Faktors, nicht die des Passworts',
      tzEinzeln2.content?.twoFactor === true, JSON.stringify(tzEinzeln2.content));

    /* --- Und so geht es seit 0.13.0: EINE Anfrage fuer alle Teile --- */
    // Der Fehlschlag darueber hat eine Zeile geschrieben. Gezaehlt wird
// deshalb ab HIER, sonst faende die Probe weiter unten ihre eigene Spur.
    const tzProtVor = (await tzS.call('GET', '/api/security-log')).content;
    const tzFailVor = (tzProtVor?.rows || []).filter(z => z.event === 'confirm.fail').length;
    check('Das Protokoll traegt die Fehlalarme des alten Wegs — die Probe hat einen Bezugspunkt',
      tzFailVor >= 1, String(tzFailVor));

    /* DERSELBE CODE FUER BEIDE ANFRAGEN, und das ist Absicht: die erste ist
       unbrauchbar bestellt und wird abgewiesen, die zweite traegt. */
    const tzCodeB = await tzCode();
    check('Eine unbrauchbare Bestellung wird abgewiesen, bevor der Code geprueft wird',
      (await tzS.call('POST', '/api/confirm',
        { password: TZ_WORD, purpose: 'export', targets: [1, 1], code: tzCodeB })).status === 400);
    const tzAll = await tzS.call('POST', '/api/confirm',
      { password: TZ_WORD, purpose: 'export', targets: tzParts.map(t => t.nr), code: tzCodeB });
    check('Eine Anfrage mit allen Teilnummern und EINEM Code wird angenommen',
      tzAll.status === 200 && tzAll.content?.ok === true,
      `${tzAll.status} · ${JSON.stringify(tzAll.content)}`);
    check('Und die Antwort nennt jede bestellte Nummer',
      Array.isArray(tzAll.content?.targets) &&
      tzAll.content.targets.join(',') === tzParts.map(t => t.nr).join(','),
      JSON.stringify(tzAll.content?.targets));

    /* JEDER TEIL LAEDT, UND JEDER VERBRAUCHT GENAU EINE FREIGABE. */
    const tzLoaded = [];
    for (const t of tzParts) {
      const a = await fetch(`${tzS.base}/api/export?${tzToggle}` +
        `&from=${t.from}&to=${t.to}&part=${t.nr}&parts=${tzParts.length}`,
        { headers: { cookie: tzS.cookieValue() } });
      tzLoaded.push(a.status);
    }
    check(`Danach laden alle ${tzParts.length} Teile — mit EINER Eingabe`,
      tzLoaded.length > 1 && tzLoaded.every(s => s === 200), tzLoaded.join(' '));
    check('Und jede Freigabe ist danach verbraucht — ein zweiter Griff geht nicht',
      (await tzS.call('GET', `/api/export?${tzToggle}` +
        `&from=${tzParts[0].from}&to=${tzParts[0].to}&part=${tzParts[0].nr}&parts=${tzParts.length}`))
        .status === 403);

    /* --- KEINE ZEILE 'confirm.fail' --- Der Teil des Schadens, den sonst
       niemand sieht: drei Teile hinterliessen drei Zeilen ueber den
       Eigentuemer selbst, an genau der Karte, die diese Runde durchsuchbar
       macht. */
    const tzProtAfter = (await tzS.call('GET', '/api/security-log')).content;
    const tzFailAfter = (tzProtAfter?.rows || []).filter(z => z.event === 'confirm.fail').length;
    check('Der ganze Weg hinterlaesst keine einzige neue Zeile "bestaetigung.fehl"',
      tzFailAfter === tzFailVor, `${tzFailVor} vorher, ${tzFailAfter} nachher`);
    /* UND DAS PROTOKOLL SCHREIBT UEBERHAUPT MIT -- eine leere Tabelle machte
       die Zeile darueber wahr, ohne etwas zu belegen. */
    check('Und der Export selbst steht sehr wohl darin, Teil fuer Teil',
      (tzProtAfter?.rows || []).filter(z => z.event === 'export' && z.detail === 'part')
        .length === tzParts.length,
      JSON.stringify((tzProtAfter?.rows || []).filter(z => z.event === 'export').map(z => z.detail)));

    /* --- Die Grenzen der Mehrzahl --- ALLE MIT EINEM CODE, DER NICHT TRAEGT:
       diese Absagen fallen VOR der Codepruefung. */
    const tzLimit = (core) => tzS.call('POST', '/api/confirm',
      { password: TZ_WORD, purpose: 'export', code: TZ_NO_CODE, ...core });
    check('Doppelte Nummern sind ein Fehler und keine halbierte Bestellung',
      (await tzLimit({ targets: [1, 2, 2] })).status === 400);
    check('Zehntausend Freigaben auf einmal gehen nicht durch',
      (await tzLimit({ targets: Array.from({ length: 10000 }, (_, i) => i + 1) })).status === 400);
    check('Eine leere Liste ebenso wenig',
      (await tzLimit({ targets: [] })).status === 400 &&
      (await tzLimit({ targets: 'alle' })).status === 400);
    check('Und eine Nummer, die keine ist, auch nicht',
      (await tzLimit({ targets: [1, 'zwei'] })).status === 400 &&
      (await tzLimit({ targets: [1, 0] })).status === 400);
    check('Ein Ziel UND mehrere zugleich ist ein Fehler, kein stiller Vorzug',
      (await tzLimit({ target: 1, targets: [1, 2] })).status === 400);
    // Der Deckel liegt bei 999 und nicht irgendwo: eine Bestellung genau auf
    // der Grenze muss durchgehen, sonst belegte die Zeile darueber nur, dass
    // IRGENDWO abgewiesen wird.
    check('999 Ziele liegen noch darunter — die Absage kommt nicht vom Passwort',
      (await tzLimit({ targets: Array.from({ length: 999 }, (_, i) => i + 1) })).status === 403);

    /* --- Die Oberflaeche schickt EINE Anfrage --- */
    /* GEPRUEFT AM QUELLTEXT, weil jsdom keinen Server hat: die Schleife ueber
       die Ziele ist genau das, was im Betrieb gescheitert ist. */
    const tzApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    const tzMultiple = (tzApp.match(
      /async function confirmTwiceMany[\s\S]*?\n\}/) || [''])[0];
    check('zweiteBestaetigungMehrfach steht im Quelltext',
      tzMultiple.length > 60, String(tzMultiple.length));
    check('Und sie schickt die Ziele in EINER Anfrage statt eine je Ziel',
      /targets\s*\}\)/.test(tzMultiple) && !/for\s*\(\s*const\s+target\s+of\s+targets/.test(tzMultiple),
      tzMultiple.slice(-220));

    /* --- Der Knopf sagt, was er tut --- */
    /* "Alle n Teile freigeben" war das Wort aus dem Maschinenraum. */
    check('Der Knopf nennt nicht mehr das Freigeben',
      !/Alle \$\{n\} Teile freigeben/.test(tzApp) && !/Freigegeben —/.test(tzApp));
    /* GESUCHT WIRD IN BEIDEM -- 0.24.0: im Quelltext und in der Sprachdatei. */
    const tzValues = Object.values(JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8')))
      .flatMap(v => (typeof v === 'string' ? [v] : Object.values(v)));
    const tzEverything = tzApp + '\u0000' + tzValues.join('\u0000');
    check('Er sagt, dass EINMAL bestätigt wird',
      /Einmal bestätigen, dann/.test(tzEverything), 'Knopftext');
    check('Und dass danach jeder Teil selbst geladen wird',
      /danach lädst du jeden\s+Teil einzeln/.test(tzEverything), 'Satz über dem Knopf');
    check('Der Satz darüber sagt, was vorher abgefragt wird — 0.22.0',
      /Vor dem Export wird einmal dein\s+Passwort/.test(tzEverything), 'Grundsatz');

    tzS.stop();
    fs.rmSync(tzDir, { recursive: true, force: true });
  }

  /* ---------------------------------------------------------------- */
  group('Die Anzeige zieht nach — 0.12.3');


  /* --- 2a: nur zeichnen, was zu sehen ist --- WAS HIER AUSDRUECKLICH NICHT
     GEPRUEFT WIRD: die WIRKUNG. */
  check('Die Kachel ueberspringt, was ausserhalb des Bildes liegt',
    /content-visibility: auto/.test(regel123('.card')), regel123('.card').slice(0, 200) || '(keine Regel)');
  /* OHNE contain-intrinsic-size SPRINGT DER ROLLBALKEN: eine uebersprungene
     Kachel misst sonst null, und die Liste schrumpft beim Rollen zusammen. */
  check('Und sie sagt dabei, wie hoch sie ungefaehr ist',
    /contain-intrinsic-size: auto \d+px/.test(regel123('.card')),
    (css123.match(/contain-intrinsic-size:[^;}]*/) || ['(nicht gesetzt)'])[0]);
  /* `auto` VOR DER ZAHL IST DER GANZE TRICK: danach nimmt der Browser die
     zuletzt WIRKLICH gezeichnete Hoehe, und die geschaetzte gilt nur bis zum
     ersten Zeichnen. */
  const allIntrinsic = css123.match(/contain-intrinsic-size:[^;}]*/g) || [];
  check('Jede Angabe traegt das Wort auto — sonst gaelte die Schaetzung fuer immer',
    allIntrinsic.length >= 2 && allIntrinsic.every(z => /auto/.test(z)),
    JSON.stringify(allIntrinsic));
  /* DIE KACHELHOEHE IST AUF TELEFON UND DESKTOP VERSCHIEDEN, weil das Bild
     quadratisch ist und die Spaltenbreite in .grid steht. */
  check('Und jede Rasterstufe bekommt ihre eigene Zahl',
    new Set(allIntrinsic).size === allIntrinsic.length && allIntrinsic.length >= 3,
    JSON.stringify(allIntrinsic));
  // Und die Gegenprobe zum Waechter: er darf nicht gruen sein, weil er nichts
// mehr ansieht.
  check('Der Waechter sieht wirklich die Kachelregel an',
    /background: var\(--surface\)/.test(regel123('.card')), regel123('.card').slice(0, 120));
  /* KEIN NACHLADEN BEIM ROLLEN, KEIN BLAETTERN. Beides steht im Fahrplan als
     "spaeter" bzw. */
  const app123 = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  check('Und es kommt kein Nachladen beim Rollen dazu',
    !/IntersectionObserver/.test(app123),
    (app123.match(/.*IntersectionObserver.*/) || [''])[0].trim().slice(0, 120));

  /* --- 2b: ein Kasten, eine Farbe --- */
  const pinColor = (kind, color) =>
    ['border-top-color', 'border-right-color', 'border-bottom-color']
      .every(k => new RegExp(k + ': var\\(--' + color + '\\)').test(regel123('.cmt.pinned.' + kind)));
  check('Ein angepinnter Bericht traegt rundum seine eigene Farbe',
    pinColor('report', 'accent'), regel123('.cmt.pinned.report') || '(keine Regel)');
  check('Eine angepinnte Aufgabe ebenso',
    pinColor('task', 'blue'), regel123('.cmt.pinned.task') || '(keine Regel)');
  check('Und ein angepinntes Erledigt ebenso',
    pinColor('done', 'green'), regel123('.cmt.pinned.done') || '(keine Regel)');
  /* GOLD BLEIBT GENAU EIN FALL: die angepinnte Notiz hat keine eigene Farbe,
     und nur bei ihr wird der ganze Rahmen golden. */
  check('Gold bleibt der angepinnten Notiz vorbehalten',
    /var\(--gold-line\)/.test(regel123('.cmt.pinned')) &&
    !['bericht', 'aufgabe', 'erledigt'].some(a => /gold-line/.test(regel123('.cmt.pinned.' + a))),
    ['bericht', 'aufgabe', 'erledigt'].map(a => regel123('.cmt.pinned.' + a)).join(' | ').slice(0, 200));
  /* KEIN KASTEN TRAEGT ZWEI FARBEN -- das ist der ganze Punkt der Runde. */
  check('Kein Kasten traegt noch zwei Farben zugleich',
    ['bericht', 'aufgabe', 'erledigt'].every(a => {
      const r = regel123('.cmt.pinned.' + a);
      return (r.match(/var\(--[a-z-]+\)/g) || []).every((f, _, all) => f === all[0]);
    }), '(Farben je Kasten)');
  /* ES AENDERT SICH KEINE EINZIGE BREITE. */
  /* DAS MUSTER TRENNT FARBE VON BREITE, und seit 0.13.2 muss es das auch:
     `border-left` allein traf `border-left-color` mit -- also genau die
     Zeile, mit der jede Art sich ihre Kante zurueckholt. */
  check('Und keine Breite und kein Innenabstand aendern sich dabei',
    !['', '.report', '.task', '.done'].some(a =>
      /border-left:|border-left-width|border-width|border-(top|right|bottom)-width|padding/
        .test(regel123('.cmt.pinned' + a))),
    ['', '.report', '.task', '.done'].map(a => regel123('.cmt.pinned' + a)).join(' | ').slice(0, 240));
  check('Die linke Kante bleibt ungeruehrt bei der Art',
    /border-left: 3px solid var\(--accent\)/.test(regel123('.cmt.report')),
    regel123('.cmt.report'));
  /* DIE ZURUECKGENOMMENE ENTSCHEIDUNG STEHT MIT DEM GRUND DANEBEN und wurde
     nicht geloescht -- sonst baut sie jemand in zwei Jahren wieder ein. */
  const cssRaw = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  check('Die alte Begruendung steht als zurueckgenommen da, nicht verschwunden',
    /zwei Merkmale, zwei Kanaele/i.test(cssRaw) && /0\.12\.3/.test(cssRaw),
    'die Begruendung fehlt');

  /* --- 2f: „mehr" frisst keine Zeile mehr --- SEIT 0.13.0 ANDERSHERUM
     GEBAUT, und das ist der Kern von Punkt 5a: der Kasten trug `margin-left:
     auto`, und eine selbsttaetige Aussenkante frisst den gesamten freien
     Platz der Zeile -- die Wolke KANN daneben nicht stehen, sie rutscht immer
     darunter. */
  check('Es gibt einen Kasten fuer die Verweise der Filterzeile',
    /display: flex/.test(regel123('.frow-right')), regel123('.frow-right') || '(keine Regel)');
  check('Und er traegt KEINE selbsttaetige Aussenkante mehr',
    !/margin-left: auto/.test(regel123('.frow-right')), regel123('.frow-right'));
  /* KEINE AUSGERECHNETE BREITE, nirgends -- die Instanz stellt die Schrift
     von 80 bis 120 Prozent, und genau daran hing 0.12.1 schon einmal (`right:
     92px`, Befund A). */
  check('Und er rechnet keine Breite aus',
    !/width|right:/.test(regel123('.frow-right')), regel123('.frow-right'));
  check('Die Wolke der Filterzeile nimmt den uebrigen Platz, ohne eine Breite zu nennen',
    /flex: 1 1 0/.test(regel123('.frow > .pills.cloud')) &&
    /min-width: 0/.test(regel123('.frow > .pills.cloud')) &&
    !/[0-9]+px/.test(regel123('.frow > .pills.cloud')),
    regel123('.frow > .pills.cloud') || '(keine Regel)');
  const fzDom = buildDom(JSDOM, { tags: [
    { id: 41, name: 'Alu', usage_count: 3 }, { id: 42, name: 'Stahl', usage_count: 2 },
    { id: 43, name: 'Holz', usage_count: 1 }] });
  const fzW = fzDom.w;
  await until(fzW, listReady, 2000, 'die Uebersicht');
  // Aufgeklappt wie ein Benutzer es tut -- zugeklappt gibt es die Zeile seit
// 0.24.0 gar nicht (Bauabschnitt 0.2).
  await openTagRow(fzW);
  const fRow = [...fzW.document.querySelectorAll('.frow')]
    .find(z => z.querySelector('.eyebrow')?.textContent === 'Tags');
  check('Die Tagzeile steht da', !!fRow, '(keine Tagzeile)');
  /* DER WEG ZUM VERWEIS GEHT UEBER DIE AUSWAHL, nicht ueber einen gesetzten
     Zustand. */
  check('Ohne Auswahl steht der Kasten gar nicht erst da',
    !fRow?.querySelector('.frow-right'), fRow?.innerHTML.slice(0, 160));
  fRow?.querySelector('.pill-tag')?.click();
  await until(fzW, (x) => x.document.querySelector('#filters .pill-tag.on') && openRequests(x) === 0,
    2000, 'der gewaehlte Tag');
  const fZeile2 = [...fzW.document.querySelectorAll('.frow')]
    .find(z => z.querySelector('.eyebrow')?.textContent === 'Tags');
  const fRight = fZeile2?.querySelector('.frow-right');
  /* SEIT 0.30.2 TRAEGT ER EIN ZEICHEN UND KEIN WORT -- das Wort steht im
     Titel. */
  check('Der Verweis sitzt in seinem Kasten — und sein Wort im Titel',
    !!fRight && [...fRight.querySelectorAll('.link-btn')]
      .some(b => /zurücksetzen/.test(b.getAttribute('title') || '')),
    fZeile2?.innerHTML.slice(0, 200));
  /* SEIT 0.13.0 STEHT ER HINTER DER WOLKE -- die natuerliche Reihenfolge:
     "mehr" gehoert hinter das, was es aufklappt. */
  const fChildren = [...(fZeile2?.children || [])].map(k => k.className);
  /* GESUCHT WIRD DIE KLASSE UND NICHT DER GANZE WERT -- 0.29.0. */
  const fRightAt = fChildren.findIndex(k => /\bfrow-right\b/.test(k));
  check('Und er steht im Aufbau HINTER der Wolke, in derselben Zeile',
    fRightAt >= 0 && fRightAt > fChildren.findIndex(k => /cloud/.test(k)),
    JSON.stringify(fChildren));
  // Wolke und Verweise sind Geschwister in EINER Zeile -- das ist die
// Ersparnis, und sie laesst sich am Aufbau ablesen.
  check('Wolke und Verweise sind Geschwister derselben .frow',
    fZeile2?.querySelector('.pills.cloud')?.parentElement ===
    fZeile2?.querySelector('.frow-right')?.parentElement,
    JSON.stringify(fChildren));
  // Und wieder weg: ein leerer Kasten bliebe als Flex-Element stehen und
// schoebe die Wolke um eine Luecke nach rechts.
  fRight?.querySelector('.link-btn')?.click();
  await until(fzW, (x) => !x.document.querySelector('#filters .pill-tag.on') && openRequests(x) === 0,
    2000, 'die geleerte Tagauswahl');
  const fZeile3 = [...fzW.document.querySelectorAll('.frow')]
    .find(z => z.querySelector('.eyebrow')?.textContent === 'Tags');
  check('Faellt die Auswahl weg, verschwindet auch der Kasten wieder',
    !fZeile3?.querySelector('.frow-right'), fZeile3?.innerHTML.slice(0, 160));
  fzW.close();

  /* ================= Die Filterleiste wird kuerzer — 0.13.0 ============ DER
     PRUEFSTAND KANN DIESE ZEILEN NICHT SEHEN: jsdom rechnet kein Layout, jede
     Hoehe ist dort null. */
  group('Die Filterleiste wird kuerzer — 0.13.0');

  const flDom = buildDom(JSDOM, { tags: [
    { id: 41, name: 'Alu', usage_count: 3 }, { id: 42, name: 'Stahl', usage_count: 2 }] });
  const flW = flDom.w;
  await until(flW, listReady, 2000, 'die Uebersicht');
  /* AUFGEKLAPPT GEZAEHLT. */
  await openTagRow(flW);
  const flRows = () => [...flW.document.querySelectorAll('#filters .frow')];
  const flLabels = () => flRows().map(z =>
    [...z.querySelectorAll('.eyebrow')].map(e => e.textContent).join('+'));
  /* VIER STEUERGRUPPEN IN VIER ZEILEN, vorher fuenf in fuenf. */
  check('Die Leiste hat noch vier Zeilen statt fuenf',
    flRows().length === 4, JSON.stringify(flLabels()));
  check('Und Sortieren und Ansichten teilen sich die letzte',
    flLabels()[3] === 'Sortieren+Ansichten', JSON.stringify(flLabels()));
  /* DIE ZWEITE BESCHRIFTUNG IST DAS GEGENSTUECK ZUR ERSTEN und keine
     Ueberschrift: sie traegt die Beschriftungsspalte NICHT. */
  const flSecond = flRows()[3]?.querySelectorAll('.eyebrow')[1];
  check('Die zweite Beschriftung traegt die Beschriftungsspalte nicht',
    flSecond?.classList.contains('eyebrow-with'), flSecond?.className);
  check('Und das Stilblatt nimmt ihr die Mindestbreite wieder ab',
    /min-width: 0/.test(regel123('.frow > .eyebrow-with')),
    regel123('.frow > .eyebrow-with') || '(keine Regel)');
  // Und die Sortierung steht weiterhin in derselben Zeile -- ohne sie waere
// die Zusammenlegung nur eine verschobene Beschriftung.
  check('Das Auswahlfeld der Sortierung steht in derselben Zeile',
    !!flRows()[3]?.querySelector('#f-sort'), flRows()[3]?.innerHTML.slice(0, 120));
  check('Und die Ansichten ebenso',
    !!flRows()[3]?.querySelector('#view-save'), flRows()[3]?.innerHTML.slice(0, 200));
  /* KEINE AUSGERECHNETE BREITE, an keiner der drei angefassten Stellen. */
  const flRules = ['.frow-right', '.frow > .pills.cloud', '.frow > .eyebrow-with'];
  const flIncludingPx = flRules.filter(r => /:\s*[0-9.]+px/.test(regel123(r).replace(/gap: [0-9]+px|margin-left: [0-9]+px/g, '')));
  check('Keine der drei angefassten Regeln rechnet eine Breite aus',
    flIncludingPx.length === 0, flIncludingPx.map(r => regel123(r)).join(' | '));
  flW.close();

  /* --- MITGENOMMEN MIT 0.17.0: die Daempfung galt jeder Pille --- HIER STAND
     „Neu seit ... */
  const flFreshItem = (id, date) => ({
    id, title: 'Stueck ' + id, rejected: false, tested: false, favorite: false, category: null,
    tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null,
    testCount: null, testAvg: null, testLast: null, testDays: [], updated_at: date });
  /* DIE LAGE STELLT DEN LEERLAUF WIRKLICH HER: EIN Tag ist
     bereits gewaehlt, und der zweite traegt keinen der sichtbaren Eintraege
     -- erst dann fuehrt ein zusaetzlicher Klick garantiert auf eine leere
     Liste. */
  const flTagPool = [{ id: 1, name: 'Grün', usage_count: 1, test_usage_count: 0 },
                       { id: 2, name: 'Blau', usage_count: 1, test_usage_count: 0 }];
  const flOldDom = buildDom(JSDOM, {
    overviewItems: [{ ...flFreshItem(1, '2026-01-01 10:00:00'),
                        tags: [{ id: 1, name: 'Grün' }] }],
    tags: flTagPool,
    settings: { filters: { categoryIds: [], tagIds: [1], tagMode: 'and', tested: 'all',
                                rejected: 'all', favorite: false, sort: 'title_asc' } } });
  const flOldW = flOldDom.w;
  await until(flOldW, listReady, 2000, 'die Uebersicht');
  const flPill = (w, name) => [...w.document.querySelectorAll('#filters .pill-tag')]
    .find(b => b.textContent.trim() === name);
  const flEmptyPill = flPill(flOldW, 'Blau');
  /* ERST DER GEGENSTAND: ohne die Pille im Vorrat waere jede
     Pruefung auf ihre Klasse gruen fuer nichts. */
  check('Die Pille steht da', !!flEmptyPill, '(keine Pille)');
  check('Und die Vorauswahl steht wirklich',
    flPill(flOldW, 'Grün')?.classList.contains('on'), flPill(flOldW, 'Grün')?.className);
  check('Bei null Treffern ist sie gedaempft',
    flEmptyPill?.classList.contains('blank'), flEmptyPill?.className);
  check('Und sie sagt, warum',
    flEmptyPill?.title === 'Mit der aktuellen Auswahl keine Treffer',
    flEmptyPill?.title);
  check('Anklickbar bleibt sie', flEmptyPill?.disabled !== true, String(flEmptyPill?.disabled));
  /* DIE REGEL GILT SEIT 0.13.0 FUER JEDE PILLE und nicht mehr nur fuer Tags
     -- sonst waere es dieselbe Sache mit zwei Verhalten, nur andersherum. */
  check('Das Stilblatt daempft jede Pille in dieser Lage, nicht nur Tags',
    /opacity: \.34/.test(regel123('.pill.blank')) && !regel123('.pill-tag.blank'),
    `${regel123('.pill.blank')} | ${regel123('.pill-tag.blank')}`);
  flOldW.close();

  // Und die Gegenprobe: mit Treffern ist sie NICHT gedaempft. Ohne diese Zeile
// bliebe die Pruefung darueber auch dann gruen, wenn die Klasse immer stuende.
  const flFreshDom = buildDom(JSDOM, {
    overviewItems: [{ ...flFreshItem(1, '2026-08-01 10:00:00'),
                        tags: [{ id: 1, name: 'Grün' }, { id: 2, name: 'Blau' }] }],
    tags: flTagPool,
    settings: { filters: { categoryIds: [], tagIds: [1], tagMode: 'and', tested: 'all',
                                rejected: 'all', favorite: false, sort: 'title_asc' } } });
  const flFreshW = flFreshDom.w;
  await until(flFreshW, listReady, 2000, 'die Uebersicht');
  const flFullPill = flPill(flFreshW, 'Blau');
  check('Mit Treffern steht sie in voller Helligkeit da',
    !!flFullPill && !flFullPill.classList.contains('blank'), flFullPill?.className);
  flFreshW.close();

  /* ================= Die Kategoriezeile lernt die Mehrzahl — 0.13.0 ====
     ZWEI WUENSCHE, EINE AENDERUNG: mehrere Kategorien zugleich, und "ohne
     Kategorie" als Eintrag derselben Liste. */
  group('Die Kategoriezeile lernt die Mehrzahl — 0.13.0');

  const kmCategory = [{ id: 21, name: 'Werkzeug', usage_count: 2 },
                 { id: 22, name: 'Material', usage_count: 1 }];
  const kmItem = (id, category) => ({
    id, title: 'Stueck ' + id, rejected: false, tested: false, favorite: false,
    category: category ? kmCategory.find(k => k.id === category) : null,
    tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null,
    testCount: null, testAvg: null, testLast: null, testDays: [],
    updated_at: '2026-08-01 10:00:00' });
  /* FUENF EINTRAEGE: zwei Werkzeug, eines Material, ZWEI OHNE. */
  const kmInventory = [kmItem(1, 21), kmItem(2, 21), kmItem(3, 22), kmItem(4, null), kmItem(5, null)];
  const kmDom = buildDom(JSDOM, { overviewItems: kmInventory, categories: kmCategory,
                                 settings: { filters: null } });
  const kmW = kmDom.w;
  await until(kmW, listReady, 2000, 'die Uebersicht');
  const kmRow = () => [...kmW.document.querySelectorAll('#filters .frow')]
    .find(z => z.querySelector('.eyebrow')?.textContent === 'Kategorie');
  const kmPills = () => [...(kmRow()?.querySelectorAll('.pill') || [])];
  const kmNames = () => kmPills().map(b => b.textContent.trim());
  const kmAn = () => kmPills().filter(b => b.classList.contains('on')).map(b => b.textContent.trim());

  check('Die Kategoriezeile steht da', !!kmRow(), '(keine Zeile)');
  /* "OHNE" IST EINE PILLE MIT EIGENER ZAHL, am Ende der Zeile. Der Anlass:
     zwei Eintraege waren ueber keine einzelne Kategorie erreichbar. */
  check('Am Ende steht "Ohne" mit eigener Zahl',
    /^Ohne2$/.test(kmNames()[kmNames().length - 1] || ''), JSON.stringify(kmNames()));
  // Die Zahl rechnet der Browser aus state.alle -- der Server wird dafuer
// nicht gefragt. Ohne diese Zeile bliebe das eine Behauptung.
  check('Und der Server wird dafuer nicht gefragt',
    !kmDom.sent.some(g => /ohne|kategorielos/i.test(String(g.url))),
    JSON.stringify(kmDom.sent.map(g => g.url).slice(0, 12)));
  /* KEIN UND/ODER AN DIESER ZEILE. */
  check('Die Zeile traegt kein Und/Oder', !kmRow()?.querySelector('.tagmode'),
    kmRow()?.innerHTML.slice(0, 200));

  const kmClickable = (text) => {
    const b = kmPills().find(x => x.textContent.trim().startsWith(text));
    b?.dispatchEvent(new kmW.MouseEvent('click', { bubbles: true }));
    return b;
  };
  const kmCards = () => kmW.document.querySelectorAll('.card-title').length;
  check('Ohne Auswahl steht "Alle" auf an und die Liste zeigt alles',
    kmAn().join() === 'Alle' && kmCards() === 5, `${JSON.stringify(kmAn())} · ${kmCards()}`);

  kmClickable('Werkzeug');
  await until(kmW, (x) => kmAn().some(n => n.startsWith('Werkzeug')) && openRequests(x) === 0,
    2000, 'die Pille Werkzeug an');
  check('Eine Kategorie wirkt wie bisher', kmCards() === 2, `${kmCards()} Karten`);
  kmClickable('Material');
  await until(kmW, (x) => kmAn().some(n => n.startsWith('Material')) && openRequests(x) === 0,
    2000, 'die Pille Material an');
  /* MEHRERE ZUGLEICH, UND ES IST DIE VEREINIGUNG. Ein Schnitt waere garantiert
     leer -- ein Eintrag traegt genau eine Kategorie. */
  check('Zwei Kategorien zugleich zeigen beide Gruppen', kmCards() === 3, `${kmCards()} Karten`);
  check('Und beide Pillen stehen auf an',
    kmAn().length === 2 && kmAn().every(n => /Werkzeug|Material/.test(n)), JSON.stringify(kmAn()));
  kmClickable('Ohne');
  await until(kmW, (x) => kmAn().some(n => n.startsWith('Ohne')) && openRequests(x) === 0,
    2000, 'die Pille Ohne an');
  check('"Ohne" laesst sich dazunehmen wie jeder andere Wert', kmCards() === 5,
    `${kmCards()} Karten`);
  /* DREI GEWAEHLTE KATEGORIEN ZAEHLEN ALS EIN FILTER -- anders als die Tags,
     und der Unterschied ist die Verknuepfung: jeder Tag verkleinert die
     Menge, jede Kategorie vergroessert sie. */
  check('Die Filterzahl zaehlt drei gewaehlte Werte als EINEN Filter',
    /· 1 aktiv/.test(kmW.document.querySelector('#filter-toggle .fcount')?.textContent || ''),
    kmW.document.querySelector('#filter-toggle .fcount')?.textContent);
  kmClickable('Werkzeug');
  await until(kmW, (x) => !kmAn().some(n => n.startsWith('Werkzeug')) && openRequests(x) === 0,
    2000, 'die Pille Werkzeug aus');
  check('Ein zweiter Klick nimmt einen Wert wieder heraus', kmCards() === 3,
    `${kmCards()} Karten`);
  const kmAll = kmPills().find(b => b.textContent.trim() === 'Alle');
  kmAll?.dispatchEvent(new kmW.MouseEvent('click', { bubbles: true }));
  await until(kmW, (x) => kmAn().includes('Alle') && openRequests(x) === 0, 2000, 'die Pille Alle an');
  check('"Alle" raeumt die ganze Auswahl weg',
    kmAn().join() === 'Alle' && kmCards() === 5, `${JSON.stringify(kmAn())} · ${kmCards()}`);

  /* --- DIE ALTE FORM EINER GESPEICHERTEN ANSICHT --- Vor 0.13.0 stand dort
     EIN Kategoriewert. */
  const kmOld = kmW.filterNormal({ categoryId: 21, tagIds: [], tagMode: 'and',
    tested: 'all', favorite: false, fresh: false, sort: 'updated_desc' });
  check('Eine Ansicht in der ALTEN Form wird uebersetzt',
    Array.isArray(kmOld.categoryIds) && kmOld.categoryIds.join() === '21',
    JSON.stringify(kmOld.categoryIds));
  // Und sie zeigt danach DIESELBE Liste wie vorher -- daran haengt der ganze
// Punkt, nicht an der Form des Felds.
  check('Und sie zeigt danach dieselbe Liste wie vorher',
    kmW.visibleItems(kmOld).length === 2, String(kmW.visibleItems(kmOld).length));
  // Das alte Feld faellt heraus: sonst gaelte eine alte Ansicht nie als die
// geltende, weil die Stellungen Zeichen fuer Zeichen verglichen werden.
  check('Das alte Feld bleibt nicht in der zurechtgerueckten Stellung stehen',
    !('categoryId' in kmOld), JSON.stringify(Object.keys(kmOld)));
  /* "OHNE" MUSS STEHENBLEIBEN: es ist kein Kategoriewert und trotzdem
     gueltig. Eine Klemme, die nur Kategorienummern durchlaesst, wuerfe ihn weg. */
  const kmWithout = kmW.filterNormal({ categoryIds: ['ohne'], tagIds: [], tagMode: 'and',
    tested: 'all', favorite: false, fresh: false, sort: 'updated_desc' });
  check('"Ohne" ueberlebt das Zurechtruecken',
    kmWithout.categoryIds.join() === 'ohne', JSON.stringify(kmWithout.categoryIds));
  check('Und filtert auf die Eintraege ohne Kategorie',
    kmW.visibleItems(kmWithout).length === 2, String(kmW.visibleItems(kmWithout).length));
  /* EINE GELOESCHTE KATEGORIE NIMMT DIE UEBRIGEN NICHT MIT. */
  const kmRest = kmW.filterNormal({ categoryIds: [21, 999, 'ohne'], tagIds: [], tagMode: 'and',
    tested: 'all', favorite: false, fresh: false, sort: 'updated_desc' });
  check('Eine geloeschte Nummer faellt weg, der Rest bleibt stehen',
    kmRest.categoryIds.join() === '21,ohne', JSON.stringify(kmRest.categoryIds));
  check('Eine Ansicht, in der NUR die geloeschte stand, faellt auf Alle zurueck',
    kmW.filterNormal({ categoryIds: [999] }).categoryIds.length === 0,
    JSON.stringify(kmW.filterNormal({ categoryIds: [999] }).categoryIds));
  // Doppelte Werte werden zusammengezogen: zweimal dieselbe Kategorie ist
// dieselbe Menge, aber die Filterzahl saehe anders aus.
  check('Doppelte Werte werden zusammengezogen',
    kmW.filterNormal({ categoryIds: [21, 21] }).categoryIds.join() === '21',
    JSON.stringify(kmW.filterNormal({ categoryIds: [21, 21] }).categoryIds));
  // Und was gar keine Liste ist, wird eine leere -- die Vorgabe traegt sie,
// aber ein gespeicherter Unsinn darf nicht durchschlagen.
  check('Was keine Liste ist, wird eine leere',
    kmW.filterNormal({ categoryIds: 'werkzeug' }).categoryIds.length === 0,
    JSON.stringify(kmW.filterNormal({ categoryIds: 'werkzeug' }).categoryIds));
  kmW.close();

  /* --- 2g und 2h: die Versionszeile --- */
  const vzDom = buildDom(JSDOM, {});
  const vzW = vzDom.w;
  await until(vzW, listReady, 2000, 'die Uebersicht');
  const vzRow = vzW.document.getElementById('version');
  // Seit 0.23.0 ein SVG und kein Bild -- es muss die Schemavariablen lesen.
  const vzMark = vzRow?.querySelector('svg.logo');
  check('Die Versionszeile traegt das Zeichen davor', !!vzMark, vzRow?.innerHTML.slice(0, 160));
  check('Und zwar aus demselben Helfer wie ueberall sonst',
    vzMark?.querySelectorAll('path').length === 4,
    `${vzMark?.querySelectorAll('path').length} Striche`);
  /* aria-hidden UND KEIN TITEL: das Zeichen steht unmittelbar neben dem Namen
     der Instanz, und ein Vorleseprogramm saegte ihn sonst zweimal. */
  check('Es sagt nichts vor — der Name steht daneben',
    vzMark?.getAttribute('aria-hidden') === 'true' && !vzMark?.getAttribute('title')
      && !vzMark?.querySelector('title'),
    JSON.stringify([vzMark?.getAttribute('aria-hidden'), vzMark?.getAttribute('title')]));
  check('Der Name der Instanz steht weiterhin in der Zeile',
    /^Kriterion \d/.test((vzRow?.textContent || '').trim()), vzRow?.textContent);
  /* DIE GROESSE STEHT IM STYLESHEET UND IN em: die Zeile laeuft auf .67rem,
     und die Instanz stellt die Schrift von 80 bis 120 Prozent. */
  check('Die Groesse steht im Stylesheet und waechst mit der Schrift',
    /\.version-row \.logo \{ height: [\d.]+em; \}/.test(css123),
    (css123.match(/\.version-row \.logo \{[^}]*\}/) || ['(keine Regel)'])[0]);
  vzW.close();

  /* 2h ist ein TELEFONBEFUND und kein Desktopbefund: auf der Anmeldeseite
     drueckt der Flex-Aufbau von body.login die Zeile ohnehin ans untere Ende,
     die 26 Pixel und der Streifen fuer den Home-Indikator kommen obendrauf. */
  const ruleAnm = (css123.match(/body\.login \.version-row \{[^}]*\}/) || [''])[0];
  check('Der Abstand darunter faellt nur auf der Anmeldeseite kleiner aus',
    /margin-bottom: calc\(\d+px \+ env\(safe-area-inset-bottom\)\)/.test(ruleAnm),
    ruleAnm || '(keine Regel)');
  check('Und die Zeile im Allgemeinen behaelt ihre 26 Pixel',
    /margin-bottom: calc\(26px \+ env\(safe-area-inset-bottom\)\)/.test(regel123('.version-row')),
    regel123('.version-row').slice(0, 200));
  /* DER STREIFEN BLEIBT: er ist kein Abstand, sondern die Flaeche, in der das
     Telefon seinen eigenen Balken zeichnet. */
  check('Der Streifen fuer den Home-Indikator bleibt dabei erhalten',
    /env\(safe-area-inset-bottom\)/.test(ruleAnm), ruleAnm);
  check('Und der neue Abstand ist wirklich kleiner als der alte',
    Number((ruleAnm.match(/calc\((\d+)px/) || [0, 99])[1]) < 26, ruleAnm);

  /* ================= Die Beschriftungen stehen oben — 0.13.1 =========== DER
     BEFUND KAM AUS DEM BETRIEB UND WAR EIN BILD: bei aufgeklappter Tagwolke
     sanken "TAGS", der Und/Oder-Umschalter und "weniger" in die Mitte des
     Blocks und standen neben nichts. */
  group('Die Beschriftungen stehen oben — 0.13.1');

  /* Ein gesetzter Tag ist noetig, damit "zuruecksetzen" dasteht: OHNE ihn
     gibt es den Kasten .frow-right in dieser Prueflage gar nicht, denn "mehr"
     haengt an begrenzeWolke() -- und die steigt in jsdom mangels Hoehe
     ausdruecklich aus. */
  const obDom = buildDom(JSDOM, {
    tags: [{ id: 41, name: 'Alu', usage_count: 3 }, { id: 42, name: 'Stahl', usage_count: 2 }],
    settings: { filters: { tagIds: [41] } } });
  const obW = obDom.w;
  await until(obW, listReady, 2000, 'die Uebersicht');
  const obTagRow = [...obW.document.querySelectorAll('#filters .frow')]
    .find(z => z.querySelector('.eyebrow')?.textContent === 'Tags');
  const obKind = (choice) => obTagRow && [...obTagRow.children].some(k => k.matches(choice));
  check('Die Tagzeile steht da', !!obTagRow, '(keine Tagzeile)');
  check('Beschriftung, Umschalter, Wolke und Verweise sind Geschwister EINER Zeile',
    obKind('.eyebrow') && obKind('.tagmode') && obKind('.pills.cloud') && obKind('.frow-right'),
    [...(obTagRow?.children || [])].map(k => k.className).join(' | '));
  obW.close();

  /* Die Regel selbst. */
  const obFrow = css123.match(/\.frow \{[^}]*\}/g) || [];
  check('Es gibt genau zwei Fassungen der Filterzeile: allgemein und schmal',
    obFrow.length === 2, obFrow.join(' || ') || '(keine Regel)');
  check('Eine Filterzeile richtet sich an der Grundlinie aus',
    /align-items: baseline/.test(obFrow[0] || ''), obFrow[0] || '(keine Regel)');
  check('Und ausdruecklich nicht mehr an der Mitte',
    !/align-items: center/.test(obFrow[0] || ''), obFrow[0] || '(keine Regel)');
  // Ohne den Umbruch stuende die Zeile bei grosser Schrift ueber den Rand
// hinaus, statt sich zu teilen.
  check('Die Zeile bricht weiterhin um',
    /flex-wrap: wrap/.test(obFrow[0] || ''), obFrow[0] || '(keine Regel)');
  /* UMGEDREHT MIT 0.28.1 UND NICHT GELOESCHT. */
  check('Der schmale Schirm behaelt seine eigene Anordnung — seit 0.28.1 ein Raster',
    /display: grid/.test(obFrow[1] || '')
    && /grid-template-columns: auto minmax\(0, 1fr\)/.test(obFrow[1] || '')
    && !/flex-direction: column/.test(obFrow[1] || ''), obFrow[1] || '(keine Regel)');
  /* KEIN NACHGEBESSERTER INNENABSTAND. */
  const obAfter = ['.frow > .eyebrow', '.frow-right', '.frow > .eyebrow-with']
    .filter(r => /align-self|padding-top|margin-top/.test(regel123(r)));
  check('Keine der Zeilen bessert die Ausrichtung mit einer Zahl nach',
    obAfter.length === 0, obAfter.map(r => regel123(r)).join(' | ') || '(keine)');

  /* ================= Der angepinnte Rahmen schliesst — 0.13.2 ========== DER
     BEFUND WAR EIN BILD AUS DEM BETRIEB: eine angepinnte Notiz stand in drei
     goldenen Kanten und einer grauen da. */
  group('Der angepinnte Rahmen schliesst — 0.13.2');

  /* ERST DER GEGENSTAND: ohne die vier Klassen an EINEM
     Kasten hat keine Regel darunter einen Fall, auf den sie zutraefe. */
  const arSource = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  check('Die Oberflaeche haengt Art und Anpinnung an denselben Kasten',
    /className = 'cmt'[\s\S]{0,200}report[\s\S]{0,120}task[\s\S]{0,120}done[\s\S]{0,120}pinned/
      .test(arSource),
    (arSource.match(/className = 'cmt'[\s\S]{0,200}/) || ['(nicht gefunden)'])[0].slice(0, 160));

  const arReason = regel123('.cmt');
  // Die Grundregel gibt allen vier Kanten dieselbe Breite -- ohne sie waere
// "genauso duenn wie die anderen Seiten" gar keine Zusage.
  check('Die Grundregel gibt allen vier Kanten dieselbe Breite',
    /border: 1px solid var\(--line\)/.test(arReason), arReason || '(keine Regel)');
  // Und die drei Arten tragen die dicke linke Linie, an der man sie erkennt.
  const arKinds = ['.cmt.report', '.cmt.task', '.cmt.done'];
  const arWithoutEdge = arKinds.filter(r => !/border-left: 3px solid/.test(regel123(r)));
  check('Die drei Arten tragen die dicke linke Linie',
    arWithoutEdge.length === 0, arWithoutEdge.join(' '));

  /* DIE EIGENTLICHE AENDERUNG: alle vier Kanten, nicht drei. */
  const arPin = regel123('.cmt.pinned');
  const arSides = ['top', 'right', 'bottom', 'left'];
  const arCovered = (rule) => /border-color:/.test(rule)
    || arSides.every(s => new RegExp(`border-${s}-color:`).test(rule));
  check('Die angepinnte Notiz bekommt alle vier Kanten',
    arCovered(arPin), arPin || '(keine Regel)');
  check('Und zwar in Gold', /--gold-line/.test(arPin), arPin || '(keine Regel)');

  /* JEDE ART HOLT SICH IHRE LINKE KANTE AUSDRUECKLICH ZURUECK, und das ist
     keine Doppelung ohne Grund: `.cmt.bericht` und `.cmt.pinned` tragen BEIDE
     zwei Klassen. */
  const arPinKinds = [['.cmt.pinned.report', '--accent'],
                      ['.cmt.pinned.task', '--blue'],
                      ['.cmt.pinned.done', '--green']];
  const arWithoutLinks = arPinKinds.filter(([r, color]) =>
    !new RegExp(`border-left-color: var\\(${color}\\)`).test(regel123(r)));
  check('Jede angepinnte Art holt sich ihre linke Kante in ihrer Farbe zurueck',
    arWithoutLinks.length === 0, arWithoutLinks.map(([r]) => regel123(r) || r).join(' | '));
  // Und alle vier Kanten tragen dieselbe Farbe -- kein Kasten mit zwei Farben.
  const arTwoColor = arPinKinds.filter(([r]) => !arCovered(regel123(r)));
  check('Und kein angepinnter Kasten bleibt halb gefaerbt',
    arTwoColor.length === 0, arTwoColor.map(([r]) => regel123(r) || r).join(' | '));

  /* DIE REIHENFOLGE IST DER GRUND FUER DIE WIEDERHOLUNG, also wird sie
     gepruefft. */
  check('Die Anpinnung steht im Stilblatt HINTER den drei Arten',
    css123.indexOf('.cmt.pinned {') > css123.indexOf('.cmt.report {'),
    `pinned bei ${css123.indexOf('.cmt.pinned {')}, bericht bei ${css123.indexOf('.cmt.report {')}`);

  /* ================= Die Aussage an der Marke — 0.14.0 ================= Aus
     dem Haekchen "abgelehnt" wird ein Satz: WANN, WARUM und VON WEM. */
  group('Die Aussage an der Marke — 0.14.0');

  /* Die Zahl der Zugaenge ist ein PARAMETER und keine Konstante: die Gruppe
     braucht beide Lagen -- mit mehreren Zugaengen steht der Name in der
     Aussage, mit einem einzigen nicht. */
  const amState = async (rejection, userCount = 3) => {
    const d = buildDom(JSDOM, { hash: '#/item/1', rejection,
      settings: { filters: null, userCount } });
    await until(d.w, detailReady, 2000, 'die Detailansicht');
    return d;
  };
  const amText = (d) => d.w.document.getElementById('rej-badge');
  const amField = (d) => d.w.document.getElementById('rej-reason');
  const amRow = (d) => d.w.document.getElementById('rej-reason-row');
  /* SEIT 0.15.0 TRAEGT DIE ZEILE AUCH DIE ZEICHEN ✎ und ✕ -- der Satz selbst
     steht in einer eigenen Spanne. */
  const amSentence = (d) => d.w.document.querySelector('#rej-badge .rej-text');
  const amPen = (d) => d.w.document.querySelector('#rej-badge .mact.ed');
  const amPath = (d) => d.w.document.querySelector('#rej-badge .mact.rm');

  // --- Nicht abgelehnt: weder Satz noch Feld ---
  {
    const d = await amState(null);
    check('Ohne Ablehnung gibt es die Marke ueberhaupt',
      !!amText(d) && !!amField(d), 'die Elemente fehlen im Aufbau');
    check('Und beide bleiben verborgen',
      amText(d)?.hidden === true && amRow(d)?.hidden === true,
      JSON.stringify([amText(d)?.hidden, amRow(d)?.hidden]));
    d.w.close();
  }

  // --- Vollstaendig: Datum, Verfasser und Grund ---
  {
    const d = await amState({ at: '2026-03-14 09:12:00', reason: 'Lieferzeit über 6 Monate',
      author: { id: 2, name: 'Anna', deleted: false } });
    check('Die Marke wird zur Aussage: wann, von wem und warum',
      amSentence(d)?.textContent === 'Abgelehnt am 14.03.2026, 09:12 von Anna — Lieferzeit über 6 Monate',
      JSON.stringify(amSentence(d)?.textContent));
    check('Und sie steht sichtbar da', amText(d)?.hidden === false, JSON.stringify(amText(d)?.hidden));
    /* DAS FELD IST IM RUHEZUSTAND ZU, seit 0.15.0. */
    check('Das Feld fuer den Grund steht im Ruhezustand nicht offen',
      amRow(d)?.hidden === true && !amRow(d)?.closest('details') &&
      !amRow(d)?.closest('.closed'), JSON.stringify(amRow(d)?.hidden));
    check('Der Schalter selbst sagt weiterhin nur "Abgelehnt"',
      d.w.document.getElementById('sw-rej-t')?.textContent === 'Abgelehnt',
      JSON.stringify(d.w.document.getElementById('sw-rej-t')?.textContent));
    d.w.close();
  }

  // --- Der Grabstein: die Nummer, nie der freigegebene Name ---
  {
    const d = await amState({ at: '2026-03-14 09:12:00', reason: 'Zu teuer',
      author: { id: 4, name: null, deleted: true } });
    check('Am Grabstein steht kein Name, sondern die Nummer',
      /von Gelöschter Benutzer 4 —/.test(amSentence(d)?.textContent || ''),
      JSON.stringify(amSentence(d)?.textContent));
    d.w.close();
  }

  // --- Der Bestand aus 0.13.2: abgelehnt, aber ohne Datum und ohne Namen ---
  {
    const d = await amState({ at: null, reason: 'Nachgetragen ohne Datum', author: null });
    check('Fehlt beides, steht der Grund allein da',
      amSentence(d)?.textContent === 'Nachgetragen ohne Datum' && amText(d)?.hidden === false,
      JSON.stringify(amSentence(d)?.textContent));
    check('Und "von Ohne Verfasser" steht ausdruecklich nicht dabei',
      !/Ohne Verfasser/.test(amSentence(d)?.textContent || ''), JSON.stringify(amSentence(d)?.textContent));
    d.w.close();
  }

  // --- Gar nichts bekannt: die Zeile bleibt weg ---
  {
    const d = await amState({ at: null, reason: null, author: null });
    /* SIE BLEIBT NUR WEG, WENN AUCH KEIN ZEICHEN DASTEHT. */
    const dWithout = buildDom(JSDOM, { hash: '#/item/1',
      rejection: { at: null, reason: null, author: null },
      settings: { filters: null, userCount: 3, isAdmin: false } });
    await until(dWithout.w, detailReady, 2000, 'die Detailansicht');
    check('Ist gar nichts bekannt und darf niemand schreiben, bleibt die Zeile weg',
      amText(dWithout)?.hidden === true,
      JSON.stringify([amText(dWithout)?.hidden, amText(dWithout)?.textContent]));
    check('Und das Feld steht dort ebenso wenig offen',
      amRow(dWithout)?.hidden === true, JSON.stringify(amRow(dWithout)?.hidden));
    d.w.close(); dWithout.w.close();
  }

  /* --- BEI GENAU EINEM ZUGANG FAELLT DER NAME WEG --- DIE FRAGE AN JEDE NEUE
     GRUPPE: welcher Schalter bleibt hier durchweg aus, und traegt er etwas
     zur Sache bei? */
  {
    const d = await amState({ at: '2026-03-14 09:12:00', reason: 'Zu teuer',
      author: { id: 2, name: 'Anna', deleted: false } }, 1);
    check('Bei einem einzigen Zugang steht der Name nicht dabei',
      amSentence(d)?.textContent === 'Abgelehnt am 14.03.2026, 09:12 — Zu teuer',
      JSON.stringify(amSentence(d)?.textContent));
    check('Datum und Grund bleiben trotzdem stehen',
      amText(d)?.hidden === false && /09:12/.test(amSentence(d)?.textContent || '') &&
      /Zu teuer/.test(amSentence(d)?.textContent || ''), JSON.stringify(amSentence(d)?.textContent));
    check('Und das Feld ist auch dort im Ruhezustand zu',
      amRow(d)?.hidden === true, JSON.stringify(amRow(d)?.hidden));
    /* DIE GEGENLAGE, sonst belegt die Zeile darueber nichts: dieselbe Ablage
       mit mehreren Zugaengen NENNT den Namen. */
    const m = await amState({ at: '2026-03-14 09:12:00', reason: 'Zu teuer',
      author: { id: 2, name: 'Anna', deleted: false } }, 3);
    check('Und mit mehreren Zugaengen steht er sehr wohl dabei',
      amSentence(m)?.textContent === 'Abgelehnt am 14.03.2026, 09:12 von Anna — Zu teuer',
      JSON.stringify(amSentence(m)?.textContent));
    d.w.close(); m.w.close();
  }

  // --- Freier Text bleibt Text: der Grund wird gesetzt, nicht gebaut ---
  {
    const d = await amState({ at: null, reason: 'Kaputt <b id="boese-grund">X</b>', author: null });
    check('Der Grund wird als Text gesetzt und nicht als Aufbau gelesen',
      !d.w.document.getElementById('boese-grund') &&
      /<b id=/.test(amSentence(d)?.textContent || ''), amText(d)?.innerHTML);
    d.w.close();
  }

  /* --- UND JETZT WIRKLICH DRAUFDRUECKEN. Ein gebauter DOM zeigt nicht, was
     beim Klicken hinausgeht. --- */
  {
    const d = await amState({ at: '2026-03-14 09:12:00', reason: 'Alte Begründung',
      author: { id: 2, name: 'Anna', deleted: false } });
    const w = d.w;
    const button = w.document.getElementById('sw-rej');
    // Ausschalten: NUR das Merkmal geht hinaus, die Angaben bleiben.
    button.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await until(w, (x) => d.sent.filter(g => g.method === 'PUT' && g.url === '/api/items/1')
      .length === 1 && openRequests(x) === 0, 2000, 'die Antwort auf das Ausschalten');
    const outCore = d.sent.filter(x => x.method === 'PUT' && x.url === '/api/items/1').pop();
    check('Ein Ausschalten schickt nur das Merkmal',
      equal(Object.keys(outCore?.body || {}), ['rejected']) &&
      outCore?.body?.rejected === false, JSON.stringify(outCore?.body));
    check('Und Marke wie Feld verschwinden danach',
      amText(d)?.hidden === true && amRow(d)?.hidden === true,
      JSON.stringify([amText(d)?.hidden, amRow(d)?.hidden]));
    /* WIEDER EINSCHALTEN: die alte Begruendung geht MIT hinaus. */
    button.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await until(w, (x) => d.sent.filter(g => g.method === 'PUT' && g.url === '/api/items/1')
      .length === 2 && openRequests(x) === 0, 2000, 'die Antwort auf das Einschalten');
    const inCore = d.sent.filter(x => x.method === 'PUT' && x.url === '/api/items/1').pop();
    check('Ein Einschalten nimmt die alte Begruendung als Vorschlag mit',
      inCore?.body?.rejected === true && inCore?.body?.rejectedReason === 'Alte Begründung',
      JSON.stringify(inCore?.body));
    /* SEIT 0.15.1 STEHT SIE DANACH IN DER AUSSAGE UND NICHT IM FELD. Das Feld
       ist nur offen, solange KEIN Grund dasteht -- und hier steht einer. */
    check('Und sie steht danach in der Aussage, nicht im Feld',
      /— Alte Begründung$/.test(amSentence(d)?.textContent || '') && amRow(d)?.hidden === true,
      JSON.stringify([amSentence(d)?.textContent, amRow(d)?.hidden]));

    // Der Grund selbst: getippt, Feld verlassen, und erst dann geht er hinaus.
// Aufgemacht wird es dafuer ueber das ✎ -- offen ist es hier nicht mehr.
    amPen(d).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await until(w, () => amRow(d)?.hidden === false, 2000, 'das offene Feld fuer den Grund');
    const before = d.sent.length;
    amField(d).value = 'Preis zu hoch';
    amField(d).dispatchEvent(new w.FocusEvent('blur'));
    await until(w, (x) => d.sent.length > before && openRequests(x) === 0, 2000, 'die Antwort auf den Grund');
    const reasonCore = d.sent.filter(x => x.method === 'PUT' && x.url === '/api/items/1').pop();
    check('Der getippte Grund geht beim Verlassen des Feldes hinaus',
      d.sent.length > before && equal(Object.keys(reasonCore?.body || {}), ['rejectedReason']) &&
      reasonCore?.body?.rejectedReason === 'Preis zu hoch', JSON.stringify(reasonCore?.body));
    check('Und die Marke sagt danach den neuen Satz',
      /— Preis zu hoch$/.test(amSentence(d)?.textContent || ''), JSON.stringify(amSentence(d)?.textContent));
    /* UNVERAENDERT WIRD NICHT GESCHICKT: sonst schoebe jedes Anklicken den
       Eintrag ueber updated_at in jeder Uebersicht nach oben. */
    amPen(d).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const vorIdle = d.sent.length;
    amField(d).dispatchEvent(new w.FocusEvent('blur'));
    await until(w, (x) => amRow(d)?.hidden === true && openRequests(x) === 0, 2000, 'das geschlossene Feld');
    check('Ein unveraendertes Feld schickt gar nichts',
      d.sent.length === vorIdle, JSON.stringify(d.sent.slice(vorIdle)));
    w.close();
  }

  /* --- IN DER KACHELANSICHT BLEIBT DIE MARKE, WIE SIE IST. */
  {
    const d = buildDom(JSDOM, { hash: '#/', settings: { filters: null, userCount: 3 },
      overviewItems: [{ id: 1, title: 'Beispiel', rejected: true, tested: false, favorite: false,
        category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 3,
        testCount: 0, testAvg: null, testLast: null, updated_at: '2026-08-01 10:00:00' }] });
    await until(d.w, listReady, 2000, 'die Uebersicht');
    const card = d.w.document.querySelector('.card');
    check('Die Kachel traegt weiterhin die Marke "abgelehnt"',
      card?.querySelector('.badge-rejected')?.textContent === 'abgelehnt',
      JSON.stringify(card?.querySelector('.badge-rejected')?.textContent));
    check('Und sonst nichts zur Ablehnung',
      !/Abgelehnt am|Lieferzeit|rej-badge/.test(card?.innerHTML || ''),
      (card?.innerHTML || '').slice(0, 200));
    d.w.close();
  }

  /* ================= Die Sternreihe steht auf einer Linie — 0.14.0 ===== DER
     BEFUND WAR EIN BILD AUS DEM BETRIEB: in der Kriterienliste eines Eintrags
     begannen die Sternreihen nicht an derselben Stelle. */
  group('Die Sternreihe steht auf einer Linie — 0.14.0');

  /* ERST DER GEGENSTAND: ohne die beiden schwierigen Zeilen
     traegt keine Regel darunter einen Fall, auf den sie zutraefe. */
  const slDom = buildDom(JSDOM, { hash: '#/item/1',
    settings: { filters: null, userCount: 3, isAdmin: true } });
  await until(slDom.w, detailReady, 2000, 'die Detailansicht');
  const slDoc = slDom.w.document;
  const slBox = slDoc.getElementById('ratings');
  const slRows = [...(slBox?.querySelectorAll('.rrow') || [])];
  const slNumbers = slRows.map(z => z.querySelector('.ravg')?.textContent ?? '(keine Zelle)');
  check('Die Prueflage traegt drei Kriterienzeilen',
    slRows.length === 3, `${slRows.length}`);
  /* UMGEDREHT MIT 0.21.0: bis 0.20.1 stand hier `=== ''` --
     die Zelle war da und leer. */
  check('Eine davon hat keine Bewertung und traegt trotzdem ihre Zelle',
    slNumbers[2] === '–', JSON.stringify(slNumbers));
  check('Und eine traegt eine dreistellige Stimmenzahl',
    /\(\d{3}\)$/.test(slNumbers[1] || ''), JSON.stringify(slNumbers));
  check('Die beiden Zahlen sind wirklich verschieden lang',
    (slNumbers[0] || '').length !== (slNumbers[1] || '').length, JSON.stringify(slNumbers));

  /* DER AUFBAU. */
  check('Der Kasten der Kriterienliste traegt das Raster',
    slBox?.classList.contains('rlist'), JSON.stringify(slBox?.className));
  const slChildren = slRows.map(z => [...z.children].map(k => k.className));
  /* VIER SEIT 0.22.0 (E15): der Ruecksetzer bekommt seine eigene vierte Zelle
     `.rreset-cell` rechts neben der Zahl. Umgedreht, nicht geloescht. */
  check('Jede Zeile haengt Name, Sterne, Zahl und Ruecksetzer als vier direkte Kinder — 0.22.0',
    slChildren.every(k => k.length === 4 && k[0] === 'rname' && k[1] === 'racts' && k[2] === 'ravg' && k[3] === 'rreset-cell'),
    JSON.stringify(slChildren));
  check('Die Zahl steckt ausdruecklich NICHT mehr in den Sternen',
    slRows.every(z => !z.querySelector('.racts .ravg')),
    JSON.stringify(slRows.map(z => !!z.querySelector('.racts .ravg'))));
  /* UMGEDREHT MIT 0.21.0, und der Satz davor bleibt stehen
: bis 0.20.1 hiess die Zeile „Die leere Zelle bleibt
     leer und bekommt keinen Ersatztext", mit der Begruendung, neben fuenf
     leeren Sternen waere „noch keine Bewertung" dieselbe Aussage zweimal. */
  check('Die leere Zelle traegt einen Strich und den Klartext dazu',
    slNumbers[2] === '–' && slRows[2]?.querySelector('.ravg')?.title === 'Noch nicht bewertet',
    JSON.stringify([slNumbers[2], slRows[2]?.querySelector('.ravg')?.title]));
  /* UND KEINEN SATZ. Die Verneinung von damals gilt weiter und wird deshalb
     weiter geprueft -- nur an dem, was sie wirklich meinte. */
  check('Und ausdruecklich keinen Satz',
    (slNumbers[2] || '').length === 1, JSON.stringify(slNumbers[2]));
  slDom.w.close();

  /* DIE REGELN IM STILBLATT. */
  const slList = regel123('.rlist'), slRow = regel123('.rrow'), slAvg = regel123('.rrow .ravg');
  /* MITGENOMMEN MIT 0.17.0: diese Zeile hiess „ist ein
     Raster ueber drei Spalten" und war ab dieser Runde nur noch die halbe
     Wahrheit -- bei genau EINEM Zugang sind es zwei. */
  check('Die allgemeine Regel der Kriterienliste ist ein Raster ueber drei Spalten',
    /display: grid/.test(slList) && /grid-template-columns: 1fr auto auto/.test(slList),
    slList || '(keine Regel)');
  check('Die Zeile ist kein eigener Kasten mehr, sondern gibt ihre Zellen frei',
    /display: contents/.test(slRow), slRow || '(keine Regel)');
  /* UMGEDREHT MIT 0.21.0. */
  check('Die Zahlenspalte traegt wieder eine Mindestbreite -- und zwar eine gemessene',
    /min-width: calc\(4\.34rem \+ 9px\)/.test(slAvg), slAvg || '(keine Regel)');
  /* IN rem UND NICHT IN PIXELN, und das ist der Kern: die Instanz stellt ihre
     Schrift von 80 bis 120 Prozent. */
  check('Und sie steht in rem, damit sie der Schriftstufe folgt',
    /min-width:[^;]*rem/.test(slAvg) && !/min-width: *\d+px/.test(slAvg),
    slAvg || '(keine Regel)');
  /* DIE GEGENPROBE ZUR REGEL: dass ueberhaupt noch eine Regel dasteht. */
  check('Es gibt die Regel ueberhaupt noch, und sie faerbt die Zahl gedaempft',
    /var\(--muted\)/.test(slAvg) && /var\(--mono\)/.test(slAvg), slAvg || '(keine Regel)');

  /* DIE TRENNLINIE IST DER PREIS DES RASTERS und deshalb geprueft: eine Zeile
     mit display: contents ist kein Kasten mehr und kann keine tragen. */
  check('Die Trennlinie wird an den Zellen gezogen, nicht an der Zeile',
    /border-bottom: 1px solid var\(--line-2\)/.test(regel123('.rrow > \\*')) &&
    !/border-bottom: 1px solid/.test(slRow),
    `${regel123('.rrow > \\*') || '(keine Zellregel)'} || ${slRow}`);
  check('Und die letzte Zeile bekommt keine',
    /border-bottom: none/.test(regel123('.rrow:last-of-type > \\*')),
    regel123('.rrow:last-of-type > \\*') || '(keine Regel)');
  /* UND KEIN SPALTENABSTAND AM RASTER: er risse die Trennlinie in Stuecke. */
  check('Das Raster traegt keinen Spaltenabstand -- die Linie bliebe sonst zerrissen',
    !/gap/.test(slList), slList || '(keine Regel)');

  /* DER BLICK DANEBEN. */
  const slForeign = ['.cmp-crit', '.vote-row .rname', '.rvotes', '.rvote']
    .filter(r => /min-width|max-width|width:/.test(regel123(r)));
  check('Weder Vergleich noch Stimmliste tragen dasselbe Muster',
    slForeign.length === 0, slForeign.map(r => regel123(r)).join(' | ') || '(keine)');
  check('Und die Stimmliste hat gar keine Durchschnittsspalte',
    !/\.vote-row[^{]*\.ravg/.test(css123) &&
    !/zeile\.className = 'vote-row'[\s\S]{0,600}ravg/.test(arSource),
    'ravg taucht in der Stimmliste auf');

  /* ================= Das Raster zaehlt seine Zellen — 0.17.0 =========== DER
     BEFUND KAM AUS DEM BETRIEB UND KEINE PRUEFUNG KONNTE IHN SEHEN. */
  /* ================= Die Sternzeile — 0.21.0 ================= Drei Dinge an
     derselben Zeile, und sie gelten in beiden Kaesten: das × hinter den fuenf
     Sternen, der Strich in der leeren Durchschnittszelle und der kurze Kopf. */
  group('Die Sternzeile — 0.21.0');

  {
    const szDom = buildDom(JSDOM, { hash: '#/item/1',
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(szDom.w, detailReady, 2000, 'die Detailansicht');
    const szDoc = szDom.w.document;
    const szRows = [...szDoc.querySelectorAll('#ratings .rrow')];
    /* ERST DER GEGENSTAND: die Prueflage braucht eine Zeile
       MIT eigenem Stern und eine OHNE -- sonst kann sie den Unterschied
       zwischen sichtbar und unsichtbar gar nicht tragen. */
    const szNull = buildDom(JSDOM, { hash: '#/item/1', ownValues: [3, 3, 0],
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(szNull.w, detailReady, 2000, 'die Detailansicht');
    const szNullRows = [...szNull.w.document.querySelectorAll('#ratings .rrow')];

    /* UMGEDREHT MIT 0.22.0 (E15): das × in der Sternreihe ist der runde
       Ruecksetzer `.rzurueck` in der eigenen vierten Zelle `.rzz` geworden. */
    check('Der Ruecksetzer steht in jeder Sternzeile mit Ruecksetzer im Dokument — 0.22.0',
      szRows.length === 3 && szRows.every(z => !!z.querySelector('.rreset-cell .rreset')),
      JSON.stringify(szRows.map(z => !!z.querySelector('.rreset-cell .rreset'))));
    /* BEI EINEM EIGENEN STERN SICHTBAR, BEI KEINEM UNSICHTBAR -- und zwar
       ueber eine Klasse, die `visibility` setzt, NICHT ueber `hidden`. */
    check('Bei eigenem Stern ist es sichtbar',
      szRows.slice(0, 2).every(z => !z.querySelector('.rreset')?.classList.contains('blank')),
      JSON.stringify(szRows.map(z => z.querySelector('.rreset')?.className)));
    check('Ohne eigenen Stern ist es unsichtbar, behaelt aber seinen Platz',
      szNullRows[2]?.querySelector('.rreset')?.classList.contains('blank') === true &&
      szNullRows[2]?.querySelector('.rreset')?.hidden === false,
      JSON.stringify([szNullRows[2]?.querySelector('.rreset')?.className,
                      szNullRows[2]?.querySelector('.rreset')?.hidden]));
    /* UND DIE REGEL DAZU IM STILBLATT: `visibility: hidden` und ausdruecklich
       nicht `display: none`. */
    const szRule = regel123('.rreset.blank');
    check('Und die Regel nimmt ihm die Sichtbarkeit, nicht seinen Platz',
      /visibility: hidden/.test(szRule) && !/display: none/.test(szRule),
      szRule || '(keine Regel)');
    /* EIN RUNDER KNOPF VON 26 BILDPUNKTEN (E15). Der Platz gehoert ihm auch
       dann, wenn es nichts zu tun gibt. */
    check('Es ist ein runder Knopf von 26 Bildpunkten — 0.22.0',
      /width: 26px; height: 26px; border-radius: 50%/.test(regel123('.rreset')), regel123('.rreset') || '(keine Regel)');
    /* UND AUF DEM FINGER GROESSER, wie die uebrigen Kreuze. */
    check('Auf Beruehrungsgeraeten ist die Trefflaeche mindestens 32 Bildpunkte',
      /\.rreset \{ width: 32px; height: 32px/.test(css123),
      (css123.match(/\.rreset \{[^}]*\}/g) || []).join(' | '));

    /* EIN TIPP SCHICKT `PUT` MIT 0 -- UND NICHTS ANDERES. */
    szDom.sent.length = 0;
    szRows[0].querySelector('.rreset')
      .dispatchEvent(new szDom.w.MouseEvent('click', { bubbles: true }));
    await until(szDom.w, (x) => szDom.sent.some(g => /\/ratings/.test(g.url)) && openRequests(x) === 0,
      2000, 'die Anfrage des Ruecksetzers');
    const szCalls = szDom.sent.filter(g => /\/ratings/.test(g.url));
    check('Ein Tipp auf das × schickt PUT mit value 0 — und nichts anderes',
      szCalls.length === 1 && szCalls[0].method === 'PUT' && szCalls[0].body?.value === 0 &&
      szCalls[0].body?.criterionId === 7,
      JSON.stringify(szCalls));
    check('Und es geht kein DELETE hinaus',
      !szDom.sent.some(g => g.method === 'DELETE'),
      JSON.stringify(szDom.sent.filter(g => g.method === 'DELETE')));

    /* DER DOPPELKLICK TUT NICHTS MEHR. Er war der versteckte zweite Weg, mit
       einem Hinweis, den kein Telefon je zeigt -- beides ist weg. */
    szDom.sent.length = 0;
    szRows[1].querySelector('.stars')
      .dispatchEvent(new szDom.w.MouseEvent('dblclick', { bubbles: true }));
    // Wartet, ob nach dem Doppelklick eine Anfrage ausbleibt.
    await new Promise(r => setTimeout(r, 20));
    check('Ein Doppelklick auf die Sterne tut nichts mehr',
      szDom.sent.length === 0, JSON.stringify(szDom.sent));
    check('Und die Sternreihe traegt keinen Ueberfahrtext mehr',
      !szRows[1].querySelector('.stars').title,
      JSON.stringify(szRows[1].querySelector('.stars').title));

    /* `stars()` OHNE RUECKSETZER HAT KEIN ×. */
    const szTest = [...szDoc.querySelectorAll('#tstars .stars, .ttag .stars, .tdrow .stars')];
    check('Eine Sternreihe ohne Ruecksetzer traegt kein ×',
      szTest.length > 0 && szTest.every(t => !t.querySelector('.rreset') && !t.parentElement?.querySelector('.rreset')),
      `${szTest.length} Reihen ohne Ruecksetzer, davon mit Ruecksetzer: ` +
      szTest.filter(t => t.querySelector('.rreset') || t.parentElement?.querySelector('.rreset')).length);

    /* DER KOPF IST KURZ. „Meine Bewertung zuruecksetzen" ist weg -- samt der
       Route dahinter --, und „Wer hat bewertet" hiess ab 0.21.0 „Stimmen". */
    check('Die Kopfzeile traegt keinen Knopf zum Zuruecksetzen mehr',
      !szDoc.getElementById('reset-r') && !szDoc.querySelector('[id$="reset-r"]'),
      JSON.stringify(szDoc.getElementById('reset-r')?.textContent));
    /* „Wer?" SEIT 0.30.0, vorher „Wer hat bewertet" -- Befund 7 (F11). */
    check('Und der Knopf des Admins heisst in beiden Koepfen „Wer?" — 0.30.0',
      szDoc.getElementById('rwho')?.textContent.trim() === 'Wer?' &&
      szDoc.getElementById('pwho')?.textContent.trim() === 'Wer?',
      JSON.stringify([szDoc.getElementById('rwho')?.textContent,
                      szDoc.getElementById('pwho')?.textContent]));

    /* UND DIE ZEILE WIRD AUF DEM TELEFON ZWEIZEILIG. */
    const szTel = (css123.match(/@media \(max-width: 700px\), \(max-height: 500px\) and \(max-width: 960px\) \{[\s\S]*/) || [''])[0];
    check('Auf dem Telefon geht der Name ueber die ganze Breite',
      /\.rlist:not\(\.no-average\) \.rrow \.rname \{[^}]*grid-column: 1 \/ -1/.test(szTel),
      (szTel.match(/\.rlist:not\(\.no-average\) \.rrow \.rname \{[^}]*\}/) || ['(keine Regel)'])[0]);
    check('Und die Trennlinie liegt nicht unter ihm, sondern unter der zweiten Zeile',
      /\.rlist:not\(\.no-average\) \.rrow \.rname \{[^}]*border-bottom: none/.test(szTel),
      (szTel.match(/\.rlist:not\(\.no-average\) \.rrow \.rname \{[^}]*\}/) || ['(keine Regel)'])[0]);
    /* BEI EINEM EINZIGEN ZUGANG AENDERT SICH NICHTS -- dort gibt es die
       Durchschnittsspalte gar nicht, also auch keine Mindestbreite, und dem
       Namen bleibt Platz. */
    check('Bei einem einzigen Zugang bleibt die Zeile einzeilig',
      /\.rlist:not\(\.no-average\) \{ grid-template-columns: auto 1fr/.test(szTel),
      (szTel.match(/\.rlist[^{]*\{ grid-template-columns[^}]*\}/g) || []).join(' | '));

    szDom.w.close(); szNull.w.close();
  }

  /* ================= Zwei Kaesten in der Oberflaeche — 0.21.0 =============
     Der zweite Sternkasten, der Einklappzustand nach dem Zustand des
     Eintrags, die Kachel, die Sortierung, der Vergleich und die zweite Karte
     im Systembereich. */
  group('Zwei Kaesten in der Oberflaeche — 0.21.0');

  {
    /* ERST DER GEGENSTAND: eine Prueflage mit einem
       Kriterium im Kasten „before" und zweien im Kasten „after". */
    const zkPhases = ['after', 'after', 'before'];
    /* UND DIE DRITTE ZEILE BEKOMMT EINEN SCHNITT. */
    const zkTested = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      voteColumns: [{ avg: 3.4, count: 5 }, { avg: 4.1, count: 128 }, { avg: 4.2, count: 2 }],
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(zkTested.w, detailReady, 2000, 'die Detailansicht');
    const zkDoc = zkTested.w.document;

    /* DER NEUE BLOCK STEHT VOR DEM BEWERTUNGSBLOCK -- geschaetzt wird, bevor
       bewertet wird, und die Anordnung sagt es. */
    const zkNames = [...zkDoc.querySelectorAll('#blocks-side .block[data-block]')]
      .map(b => b.dataset.block);
    check('Der Potenzialblock steht vor dem Bewertungsblock',
      zkNames.indexOf('potenzial') >= 0 &&
      zkNames.indexOf('potenzial') < zkNames.indexOf('bewertung'),
      JSON.stringify(zkNames));

    /* JEDER KASTEN ZEIGT NUR SEINE ZEILEN. */
    const zkAfter = [...zkDoc.querySelectorAll('#ratings .rname')].map(e => e.firstChild.textContent.trim());
    const zkVor = [...zkDoc.querySelectorAll('#potential-ratings .rname')].map(e => e.firstChild.textContent.trim());
    check('Der Bewertungskasten zeigt nur seine beiden Zeilen',
      equal(zkAfter, ['Zuerst', 'Dann']), JSON.stringify(zkAfter));
    check('Der Potenzialkasten zeigt nur seine eine',
      equal(zkVor, ['Zuletzt']), JSON.stringify(zkVor));

    /* ZWEI KOPFZAHLEN, ZWEI ERKLAERKNOEPFE. */
    check('Jeder Kasten traegt seine eigene Kopfzahl',
      /⌀ 3,0/.test(zkDoc.getElementById('rhead')?.textContent || '') &&
      /⌀ 4,2/.test(zkDoc.getElementById('phead')?.textContent || ''),
      JSON.stringify([zkDoc.getElementById('rhead')?.textContent,
                      zkDoc.getElementById('phead')?.textContent]));
    /* UND DER ERKLAERKNOPF ZEIGT DEN RECHENWEG SEINES KASTENS. */
    zkDoc.getElementById('pweight-open')?.dispatchEvent(new zkTested.w.MouseEvent('click', { bubbles: true }));
    await until(zkTested.w, (x) => x.document.getElementById('calc-modal'), 2000, 'der Erklaerkasten des Potenzials');
    const zkCalc = zkDoc.getElementById('calc-modal');
    const zkCalcRows = [...(zkCalc?.querySelectorAll('.calc-row[data-krit]') || [])]
      .map(z => z.querySelector('.calc-name').textContent.trim());
    check('Der Erklaerknopf des Potenzials zeigt nur dessen Zeile',
      equal(zkCalcRows, ['Zuletzt']), JSON.stringify(zkCalcRows));
    zkCalc?.closest('.backdrop')?.remove();

    /* DER EINKLAPPZUSTAND FOLGT DEM ZUSTAND DES EINTRAGS. Der Mockeintrag
       steht auf `tested: true`: Bewertung offen, Potenzial zu. */
    const zkZu = (name) => zkDoc.querySelector(`.block[data-block="${name}"]`)?.classList.contains('closed');
    check('An einem getesteten Eintrag steht die Bewertung offen und das Potenzial zu',
      zkZu('bewertung') === false && zkZu('potenzial') === true,
      JSON.stringify([zkZu('bewertung'), zkZu('potenzial')]));
    /* DIE KURZFASSUNG IST WEG, UND DIE ZAHL STEHT TROTZDEM DA -- 0.22.1 (E4). */
    /* ERST DAS OBJEKT, DANN SEIN INHALT: `?.textContent ||
       ''` waere auch dann leer, wenn es die Kurzfassung gar nicht mehr gaebe
       — und die Zusage bliebe gruen, obwohl der ganze Knoten fehlt. */
    const zkSum = zkDoc.querySelector('.block[data-block="potenzial"] .bsum');
    check('Die Kurzfassung ist als Knoten weiterhin da', !!zkSum,
      JSON.stringify(zkDoc.querySelector('.block[data-block="potenzial"] .block-head')?.innerHTML?.slice(0, 120)));
    check('Der zugeklappte Kopf traegt keine Kurzfassung mehr',
      !!zkSum && zkSum.textContent === '', JSON.stringify(zkSum && zkSum.textContent));
    check('Und die Zahl steht dort trotzdem -- einmal, als Kopfzahl',
      /⌀ 4,2/.test(zkDoc.getElementById('phead')?.textContent || ''),
      JSON.stringify(zkDoc.getElementById('phead')?.textContent));

    /* --- DIE KOPFZAHL SAGT, WESSEN ZAHL SIE IST — 0.22.1 (E5) --- DIE FRAGE
       KAM AUS DEM BETRIEB: „ist das meine Bewertung oder von allen?" Es ist
       der Schnitt ueber alle, die bewertet haben -- die eigenen Sterne stehen
       links in der Zeile. */
    check('Die Kopfzahl sagt im Titel, dass sie ueber alle geht',
      /über alle Benutzer/.test(zkDoc.getElementById('weight-open')?.title || '') &&
      /nicht nur der eigene/.test(zkDoc.getElementById('weight-open')?.title || ''),
      JSON.stringify(zkDoc.getElementById('weight-open')?.title));
    /* UND IN BEIDEN KAESTEN DASSELBE. Ein Titel, der nur an einem der beiden
       haengt, beantwortet die Frage genau dort nicht, wo sie zuerst auffiel. */
    check('Und im Potenzialkasten steht derselbe Titel',
      zkDoc.getElementById('pweight-open')?.title === zkDoc.getElementById('weight-open')?.title,
      JSON.stringify([zkDoc.getElementById('weight-open')?.title,
                      zkDoc.getElementById('pweight-open')?.title]));
    /* UND DER ERKLAERKASTEN SAGT ES AUCH -- am Ort der Erklaerung. */
    zkDoc.getElementById('weight-open')?.dispatchEvent(new zkTested.w.MouseEvent('click', { bubbles: true }));
    await until(zkTested.w, (x) => x.document.getElementById('calc-modal'), 2000, 'der Erklaerkasten der Bewertung');
    const zkErkl = zkDoc.getElementById('calc-modal');
    check('Der Erklaerkasten nennt die Menge, ueber die gerechnet wird',
      /über alle\s+Benutzer/.test(zkErkl?.textContent || ''),
      JSON.stringify((zkErkl?.textContent || '').slice(0, 160)));
    zkErkl?.closest('.backdrop')?.remove();

    /* EIN KLICK AUF DEN KOPF IST EIN BLICK UND KEIN BEFEHL: er klappt auf und
       schickt NICHTS an den Server. */
    zkTested.sent.length = 0;
    zkDoc.querySelector('.block[data-block="potenzial"] .block-head')
      .dispatchEvent(new zkTested.w.MouseEvent('click', { bubbles: true }));
    await until(zkTested.w, (x) => zkZu('potenzial') === false && openRequests(x) === 0,
      2000, 'der aufgeklappte Potenzialblock');
    check('Ein Klick auf den Kopf klappt auf',
      zkZu('potenzial') === false, JSON.stringify(zkZu('potenzial')));
    check('Und loest kein PUT /api/settings aus',
      !zkTested.sent.some(g => g.url === '/api/settings'),
      JSON.stringify(zkTested.sent));
    /* DIE GEGENPROBE: ein gewoehnlicher Block speichert weiter. */
    zkTested.sent.length = 0;
    const zkTagsZu = zkZu('tags');
    zkDoc.querySelector('.block[data-block="tags"] .block-head')
      .dispatchEvent(new zkTested.w.MouseEvent('click', { bubbles: true }));
    await until(zkTested.w, (x) => zkZu('tags') !== zkTagsZu && openRequests(x) === 0,
      2000, 'der umgeschaltete Tagblock');
    check('Ein gewoehnlicher Block speichert dagegen weiter',
      zkTested.sent.some(g => g.url === '/api/settings' && g.body?.blocks),
      JSON.stringify(zkTested.sent.map(g => g.url)));
    zkTested.w.close();

    /* AN EINEM UNGETESTETEN EINTRAG IST ES UMGEKEHRT. */
    const zkIdea = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      ownValues: [0, 0, 4], voteColumns: [{ avg: null, count: 0 }, { avg: null, count: 0 }, { avg: 4.2, count: 2 }],
      untested: true,
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(zkIdea.w, detailReady, 2000, 'die Detailansicht');
    const zkIdeaZu = (name) => zkIdea.w.document
      .querySelector(`.block[data-block="${name}"]`)?.classList.contains('closed');
    check('An einer Idee ohne Bewertungssterne steht das Potenzial offen',
      zkIdeaZu('potenzial') === false, JSON.stringify(zkIdeaZu('potenzial')));
    /* UND DEN BEWERTUNGSKASTEN GIBT ES DORT GAR NICHT -- 0.22.1, und das ist
       die Umkehrung der Zusage, die hier bis 0.22.0 stand: „und die Bewertung
       zu". */
    const zkIdeaBlock = () => zkIdea.w.document.querySelector('.block[data-block="bewertung"]');
    check('Und den Bewertungskasten gibt es dort gar nicht',
      zkIdeaBlock()?.hidden === true,
      JSON.stringify([!!zkIdeaBlock(), zkIdeaBlock()?.hidden]));
    /* DER SCHALTER LEERT DEN BLICK. Nach dem Umlegen steht der richtige
       Kasten offen, ohne dass jemand klickt. */
    zkIdea.w.document.querySelector('.block[data-block="potenzial"] .block-head')
      .dispatchEvent(new zkIdea.w.MouseEvent('click', { bubbles: true }));
    await until(zkIdea.w, (x) => zkIdeaZu('potenzial') === true && openRequests(x) === 0,
      2000, 'der zugeklappte Potenzialblock');
    check('Ein Blick klappt das Potenzial an der Idee zu',
      zkIdeaZu('potenzial') === true, JSON.stringify(zkIdeaZu('potenzial')));
    zkIdea.w.document.getElementById('sw-test')
      .dispatchEvent(new zkIdea.w.MouseEvent('click', { bubbles: true }));
    await until(zkIdea.w, (x) => zkIdea.sent.some(g => g.method === 'PUT' && g.url === '/api/items/1') &&
      openRequests(x) === 0, 2000, 'die Antwort auf den Schalter Getestet');
    check('Der Schalter „Getestet" stellt die Regel wieder her',
      zkIdeaZu('bewertung') === false && zkIdeaZu('potenzial') === true,
      JSON.stringify([zkIdeaZu('bewertung'), zkIdeaZu('potenzial')]));
    /* UND ER HOLT DEN KASTEN ZURUECK. */
    check('Und er holt den Bewertungskasten zurueck',
      zkIdeaBlock()?.hidden === false, JSON.stringify(zkIdeaBlock()?.hidden));
    zkIdea.w.close();

    /* VORHANDENE DATEN SCHLAGEN DIE REGEL. */
    const zkOld = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      ownValues: [4, 0, 4], untested: true,
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(zkOld.w, detailReady, 2000, 'die Detailansicht');
    check('Eine Idee MIT Bewertungssternen zeigt sie trotzdem',
      zkOld.w.document.querySelector('.block[data-block="bewertung"]')
        ?.classList.contains('closed') === false,
      JSON.stringify(zkOld.w.document.querySelector('.block[data-block="bewertung"]')?.className));
    /* UND SIE ZEIGT IHN WIRKLICH -- 0.22.1 (Entscheidung E6). */
    check('Und zwar sichtbar, nicht nur aufgeklappt',
      zkOld.w.document.querySelector('.block[data-block="bewertung"]')?.hidden === false,
      JSON.stringify(zkOld.w.document.querySelector('.block[data-block="bewertung"]')?.hidden));

    /* --- OHNE ZAHL BLEIBT DER SATZ — 0.22.1 (E4) --- Die Kurzfassung faellt
       nur, solange eine KOPFZAHL dasteht. */
    const zkEmpty = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      potentialValue: null, ownValues: [4, 4, 0],
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(zkEmpty.w, detailReady, 2000, 'die Detailansicht');
    const zkEmptyDoc = zkEmpty.w.document;
    check('Die Prueflage steht: der Potenzialkasten ist zu und hat keine Zahl',
      zkEmptyDoc.querySelector('.block[data-block="potenzial"]')?.classList.contains('closed') === true &&
      (zkEmptyDoc.getElementById('phead')?.textContent || '') === '',
      JSON.stringify([zkEmptyDoc.querySelector('.block[data-block="potenzial"]')?.className,
                      zkEmptyDoc.getElementById('phead')?.textContent]));
    check('Dann sagt die Kurzfassung, dass noch nichts dasteht',
      /noch nicht eingeschätzt/.test(
        zkEmptyDoc.querySelector('.block[data-block="potenzial"] .bsum')?.textContent || ''),
      JSON.stringify(zkEmptyDoc.querySelector('.block[data-block="potenzial"] .bsum')?.textContent));
    zkEmpty.w.close();

    /* --- DER BLICK ENDET MIT DEM EINTRAG --- NACHGETRAGEN AUS DER
       GEGENPROBE: Rueckbau 593 nimmt `BLICK.clear()` am Eingang der
       Detailansicht heraus, und der Lauf blieb GRUEN. */
    const zkSecond = {
      id: 2, title: 'Zweite Idee', description: '', rejected: false, tested: false,
      favorite: false, category: null, author: null,
      photos: [], links: [], comments: [], attachments: [], tags: [], testDays: [],
      /* KEIN EINZIGER STERN IN BEIDEN KAESTEN -- weder eigener noch fremder. */
      ratings: [
        { criterion_id: 7, name: 'Zuerst', value: 0, weight: 1.5, phase: 'after', avg: null, count: 0 },
        { criterion_id: 8, name: 'Dann', value: 0, weight: 1, phase: 'after', avg: null, count: 0 },
        { criterion_id: 9, name: 'Zuletzt', value: 0, weight: 0.5, phase: 'before', avg: null, count: 0 }
      ],
      avgRating: null, potentialRating: null, testCount: 0, testAvg: null, testLast: null,
      created_at: '2026-08-01 09:00:00', updated_at: '2026-08-01 09:00:00'
    };
    const zkChange = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      ownValues: [0, 0, 0],
      voteColumns: [{ avg: null, count: 0 }, { avg: null, count: 0 }, { avg: null, count: 0 }],
      untested: true, secondEntry: zkSecond,
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(zkChange.w, detailReady, 2000, 'die Detailansicht');
    const zkWZu = (name) => zkChange.w.document
      .querySelector(`.block[data-block="${name}"]`)?.classList.contains('closed');
    check('An Eintrag 1 steht das Potenzial nach der Regel offen',
      zkWZu('potenzial') === false, JSON.stringify(zkWZu('potenzial')));
    zkChange.w.document.querySelector('.block[data-block="potenzial"] .block-head')
      ?.dispatchEvent(new zkChange.w.MouseEvent('click', { bubbles: true }));
    await until(zkChange.w, (x) => zkWZu('potenzial') === true && openRequests(x) === 0,
      2000, 'der zugeklappte Potenzialblock');
    check('Ein Blick klappt es dort gegen die Regel zu',
      zkWZu('potenzial') === true, JSON.stringify(zkWZu('potenzial')));
    zkChange.w.location.hash = '#/item/2';
    await until(zkChange.w, (x) => x.document.getElementById('title')?.value === 'Zweite Idee' &&
      openRequests(x) === 0, 2000, 'die Detailansicht des zweiten Eintrags');
    /* ERST DAS OBJEKT, DANN SEIN ZUSTAND: steht der Kasten
       nach dem Wechsel gar nicht da, sagt `undefined === true` dasselbe wie
       „offen" -- und die Zeile darunter waere gruen, ohne etwas zu belegen. */
    check('Der zweite Eintrag ist geladen und hat beide Kaesten',
      Boolean(zkChange.w.document.querySelector('.block[data-block="potenzial"]')) &&
      Boolean(zkChange.w.document.querySelector('.block[data-block="bewertung"]')),
      zkChange.w.document.getElementById('title')?.value || '(kein Titel)');
    check('Und am zweiten Eintrag gilt wieder die Regel -- der Blick ist weg',
      zkWZu('potenzial') === false && zkWZu('bewertung') === true,
      JSON.stringify([zkWZu('potenzial'), zkWZu('bewertung')]));
    zkChange.w.close();

    /* --- DIE BEIDEN KRITERIENKARTEN IM SYSTEMBEREICH --- NACHGETRAGEN AUS
       DER GEGENPROBE: die Rueckbauten 597 und 598 kamen beide STUMM zurueck. */
    const zkSys = buildDom(JSDOM, { hash: '', criteriaPhases: zkPhases,
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(zkSys.w, listReady, 2000, 'die Uebersicht');
    await sysSection(zkSys.w, 'inventory');
    const zkCardsNames = (id) => [...(zkSys.w.document.getElementById(id)
      ?.querySelectorAll('.mrow .mname') || [])].map(n => n.textContent);
    /* ERST DIE KAESTEN: stuende die zweite Karte gar nicht
       da, waeren beide Listen leer, und „nur seine Zeilen" waere gruen. */
    check('Beide Kriterienkarten stehen im Bestand',
      Boolean(zkSys.w.document.getElementById('mcrits')) &&
      Boolean(zkSys.w.document.getElementById('mpcrits')),
      `mcrits ${Boolean(zkSys.w.document.getElementById('mcrits'))}, ` +
      `mpcrits ${Boolean(zkSys.w.document.getElementById('mpcrits'))}`);
    check('Die Bewertungskarte zeigt nur ihre beiden Kriterien',
      equal(zkCardsNames('mcrits'), ['Zuerst', 'Dann']), JSON.stringify(zkCardsNames('mcrits')));
    check('Und die Potenzialkarte nur ihr eines',
      equal(zkCardsNames('mpcrits'), ['Zuletzt']), JSON.stringify(zkCardsNames('mpcrits')));
    /* UND WAS IN DER ZWEITEN KARTE ANGELEGT WIRD, TRAEGT SEINEN KASTEN MIT. */
    const zkPField = zkSys.w.document.getElementById('newpcrit');
    if (zkPField) {
      zkPField.value = 'Wunsch';
      zkSys.w.document.getElementById('newpcrit-b')
        ?.dispatchEvent(new zkSys.w.MouseEvent('click', { bubbles: true }));
      await until(zkSys.w, (x) => zkSys.sent.some(g => g.method === 'POST' && g.url === '/api/criteria') &&
        openRequests(x) === 0, 2000, 'das angelegte Potenzialkriterium');
    }
    const zkCreated = zkSys.sent
      .filter(x => x.method === 'POST' && x.url === '/api/criteria').pop();
    check('Die Potenzialkarte legt mit der Phase vorher an',
      zkCreated?.body?.name === 'Wunsch' && zkCreated?.body?.phase === 'before',
      JSON.stringify(zkCreated));
    /* DIE GEGENPROBE AN DER ERSTEN KARTE: sie schickt 'after' und nicht gar
       nichts. */
    const zkNField = zkSys.w.document.getElementById('newcrit');
    if (zkNField) {
      const zkPosts = zkSys.sent.filter(x => x.method === 'POST' && x.url === '/api/criteria').length;
      zkNField.value = 'Preis';
      zkSys.w.document.getElementById('newcrit-b')
        ?.dispatchEvent(new zkSys.w.MouseEvent('click', { bubbles: true }));
      await until(zkSys.w, (x) => zkSys.sent.filter(g => g.method === 'POST' && g.url === '/api/criteria')
        .length > zkPosts && openRequests(x) === 0, 2000, 'das angelegte Bewertungskriterium');
    }
    const zkAngelegt2 = zkSys.sent
      .filter(x => x.method === 'POST' && x.url === '/api/criteria').pop();
    check('Und die Bewertungskarte mit der Phase nachher',
      zkAngelegt2?.body?.name === 'Preis' && zkAngelegt2?.body?.phase === 'after',
      JSON.stringify(zkAngelegt2));
    zkSys.w.close();

    /* --- DAS WORT AM BLOCKKOPF KOMMT AUS DEM VOKABULAR --- NACHGETRAGEN AUS
       DER GEGENPROBE: Rueckbau 600 schreibt „Potenzial" fest in den Quelltext
       und kam STUMM zurueck. */
    const zkWord = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      settings: { filters: null, userCount: 3, isAdmin: true,
                       vocabulary: { potential: 'Erwartung' } } });
    await until(zkWord.w, detailReady, 2000, 'die Detailansicht');
    const zkHead = zkWord.w.document
      .querySelector('.block[data-block="potenzial"] .block-head .label');
    check('Der Kopf des Potenzialblocks steht ueberhaupt da',
      Boolean(zkHead), JSON.stringify(zkHead?.textContent));
    check('Und er traegt das eingestellte Wort statt des festen',
      zkHead?.textContent === 'Erwartung', JSON.stringify(zkHead?.textContent));
    /* UND DER BEWERTUNGSBLOCK BLEIBT, WIE ER HEISST. Ohne diese Zeile bliebe
       gruen, wer BEIDEN Koepfen dasselbe Wort gaebe. */
    check('Der Bewertungsblock heisst weiterhin Bewertung',
      zkWord.w.document
        .querySelector('.block[data-block="bewertung"] .block-head .label')?.textContent === 'Bewertung',
      JSON.stringify(zkWord.w.document
        .querySelector('.block[data-block="bewertung"] .block-head .label')?.textContent));
    zkWord.w.close();
    zkOld.w.close();

    /* --- Die Kachel --- */
    const zkCards = [
      { id: 1, title: 'Geprueft', rejected: false, tested: true, favorite: false, category: null,
        tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 3.8, potentialRating: 4.2,
        testCount: 1, testAvg: 4, testLast: 4, updated_at: '2026-08-02 10:00:00' },
      { id: 2, title: 'Idee', rejected: false, tested: false, favorite: false, category: null,
        tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null, potentialRating: 4.2,
        testCount: 0, testAvg: null, testLast: null, updated_at: '2026-08-01 10:00:00' },
      { id: 3, title: 'Blanko', rejected: false, tested: false, favorite: false, category: null,
        tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null, potentialRating: null,
        testCount: 0, testAvg: null, testLast: null, updated_at: '2026-07-31 10:00:00' }
    ];
    const zkUeb = buildDom(JSDOM, { hash: '', overviewItems: zkCards,
      settings: { filters: null, userCount: 3 } });
    await until(zkUeb.w, listReady, 2000, 'die Uebersicht');
    const zkTile = (n) => [...zkUeb.w.document.querySelectorAll('.card')][n];
    const zkNumber = (n) => zkTile(n)?.querySelector('.rating-inline')?.textContent.trim()
      ?? zkTile(n)?.querySelector('.card-meta-l .hint')?.textContent.trim();
    check('Die Kachel eines getesteten Eintrags zeigt ★ und die Bewertung',
      zkNumber(0) === '★3,8', JSON.stringify(zkNumber(0)));
    check('Die Kachel einer Idee zeigt ◆ und das Potenzial',
      zkNumber(1) === '◆4,2', JSON.stringify(zkNumber(1)));
    /* NIE BEIDES. */
    check('Und nie beides auf derselben Kachel',
      [...zkUeb.w.document.querySelectorAll('.card')]
        .every(k => k.querySelectorAll('.rating-inline').length <= 1),
      JSON.stringify([...zkUeb.w.document.querySelectorAll('.card')]
        .map(k => k.querySelectorAll('.rating-inline').length)));
    // „keine Sterne" hiess der Hinweis bis 0.21.1; das Woerterbuch sagt „noch nicht eingeschätzt".
    check('Fehlt die jeweilige Zahl, steht der Hinweis dieses Kastens da',
      zkNumber(2) === 'noch nicht eingeschätzt', JSON.stringify(zkNumber(2)));
    /* UND DAS ZEICHEN IST NICHT GOLDEN. Gold bleibt der Bewertung -- sonst
       hielte jemand 4,2 Potenzial fuer 4,2 Qualitaet. */
    check('Das Zeichen des Potenzials traegt nicht die Farbe der Bewertung',
      /var\(--muted\)/.test(regel123('.rating-inline.potential .dot')),
      regel123('.rating-inline.potential .dot') || '(keine Regel)');

    /* --- Die Sortierung --- */
    const zkSort = zkUeb.w.document.getElementById('f-sort');
    const zkValues = [...zkSort.options].map(o => o.value);
    /* MITGEZOGEN MIT 0.28.1: die Richtung ist kein Eintrag
       der Liste mehr, sondern ein Umschalter daneben -- aus `potential_desc`
       und `potential_asc` ist EIN Eintrag `potential` geworden. */
    check('Das Auswahlfeld traegt den neuen Eintrag',
      zkValues.includes('potential'),
      JSON.stringify(zkValues));
    check('Und er steht direkt hinter dem Bewertungseintrag',
      zkValues.indexOf('potential') === zkValues.indexOf('rating') + 1,
      JSON.stringify(zkValues));
    check('Und er traegt das Wort aus dem Vokabular -- ohne Richtung',
      [...zkSort.options].find(o => o.value === 'potential')?.textContent === 'Potenzial',
      JSON.stringify([...zkSort.options].find(o => o.value === 'potential')?.textContent));
    const zkTitle = () => [...zkUeb.w.document.querySelectorAll('.card-title')].map(t => t.textContent);
    /* ZWEIMAL UMGEDREHT UND NIE GELOESCHT. */
    /* MITGEZOGEN MIT 0.28.1: die Richtung wird nicht mehr
       im Auswahlfeld GEWAEHLT, sondern am Umschalter daneben GEKLICKT. */
    const zkField = () => zkUeb.w.document.getElementById('f-sort');
    const zkDir = () => zkUeb.w.document.getElementById('f-sort-dir');
    if (zkField()) { zkField().value = 'potential'; zkField().onchange(); }
    await until(zkUeb.w, (x) => /^potential_/.test(x.eval('state.filters.sort')) && openRequests(x) === 0,
      2000, 'die Sortierung nach Potenzial');
    check('Nach Potenzial sortiert steht der ganze Bestand da — 0.32.1',
      equal(zkTitle(), ['Geprueft', 'Idee', 'Blanko']), JSON.stringify(zkTitle()));
    check('Nach Potenzial absteigend stehen Eintraege ohne Zahl hinten',
      zkTitle()[zkTitle().length - 1] === 'Blanko', JSON.stringify(zkTitle()));
    /* DER UMSCHALTER SAGT DIE KONKRETE RICHTUNG und nicht „absteigend“. */
    check('Und der Umschalter daneben nennt die geltende Richtung — 0.28.1',
      zkDir()?.textContent === 'hoch → niedrig', JSON.stringify(zkDir()?.textContent));
    const zkSortVor = zkUeb.w.eval('state.filters.sort');
    zkDir()?.click();
    await until(zkUeb.w, (x) => x.eval('state.filters.sort') !== zkSortVor && openRequests(x) === 0,
      2000, 'die umgedrehte Sortierung');
    check('Und aufsteigend ebenfalls',
      zkTitle()[zkTitle().length - 1] === 'Blanko', JSON.stringify(zkTitle()));
    check('Und der Umschalter nennt danach die andere Richtung — 0.28.1',
      zkDir()?.textContent === 'niedrig → hoch', JSON.stringify(zkDir()?.textContent));
    zkUeb.w.close();
  }

  group('Das Raster der Kriterienliste zaehlt seine Zellen — 0.17.0');

  /* WIE VIELE SPALTEN EIN KASTEN MIT DIESEN KLASSEN HAT -- GELESEN, nicht
     hingeschrieben. */
  const gridColumns = (classes) => {
    /* KOMMENTARE ZUERST WEG: sie tragen selbst geschweifte Klammern und
       Punkte, und ein Ausdruck ueber das rohe Stilblatt griffe dort hinein. */
    const withoutPhotos = css123.replace(/\/\*[\s\S]*?\*\//g, ' ');
    let found = 0, best = -1, i = 0;
    for (;;) {
      const on = withoutPhotos.indexOf('{', i);
      if (on < 0) break;
      const zu = withoutPhotos.indexOf('}', on);
      if (zu < 0) break;
      const choice = withoutPhotos.slice(i, on).trim();
      const core = withoutPhotos.slice(on + 1, zu);
      i = zu + 1;
      // Nur reine Klassenwaehler; alles andere geht diese Frage nichts an.
      if (!/^(?:\.[a-z0-9-]+)+$/i.test(choice)) continue;
      const needed = choice.split('.').filter(Boolean);
      if (needed[0] !== 'rlist' || !needed.every(k => classes.includes(k))) continue;
      const m = core.match(/grid-template-columns:\s*([^;]+)/);
      // Mehr Klassen heisst spezifischer; bei gleicher Zahl gewinnt die
// spaetere Regel -- deshalb >= und nicht >.
      if (m && needed.length >= best) {
        best = needed.length;
        found = m[1].trim().split(/\s+/).length;
      }
    }
    return found;
  };
  /* DIE PROBE AUF DEN LESER SELBST. */
  check('Der Leser findet fuer beide Klassenstellungen eine Regel',
    gridColumns(['rlist']) > 0 && gridColumns(['rlist', 'no-average']) > 0,
    `${gridColumns(['rlist'])} / ${gridColumns(['rlist', 'no-average'])}`);
  check('Und er unterscheidet die beiden wirklich',
    gridColumns(['rlist']) !== gridColumns(['rlist', 'no-average']),
    `${gridColumns(['rlist'])} / ${gridColumns(['rlist', 'no-average'])}`);
  /* UND ER WAEHLT NACH SPEZIFITAET UND NICHT NACH PLATZ. */
  const rzWithoutRule = regel123('.rlist.no-average');
  check('Die Regel fuer den einen Zugang steht ueberhaupt im Stilblatt',
    rzWithoutRule.length > 0, '(keine Regel)');
  const rzWithoutColumns = (rzWithoutRule.match(/grid-template-columns: ([^;}]+)/) || ['', ''])[1]
    .trim().split(/\s+/).filter(Boolean).length;
  check('Und der Leser liefert die Zahl AUS DIESER Regel, nicht aus der allgemeinen',
    rzWithoutColumns > 0 && gridColumns(['rlist', 'no-average']) === rzWithoutColumns,
    `${gridColumns(['rlist', 'no-average'])} gegen ${rzWithoutColumns} in ${rzWithoutRule || '(keine Regel)'}`);

  for (const [howMany, word] of [[3, 'mehreren Zugaengen'], [1, 'einem einzigen Zugang']]) {
    const rz = buildDom(JSDOM, { hash: '#/item/1',
      settings: { filters: null, userCount: howMany, isAdmin: true } });
    await until(rz.w, detailReady, 2000, 'die Detailansicht');
    const rzBox = rz.w.document.getElementById('ratings');
    const rzRows = [...(rzBox?.querySelectorAll('.rrow') || [])];
    /* ERST DER GEGENSTAND: ohne Zeilen traegt keine Zusage darunter einen
       Fall, auf den sie zutraefe. */
    check(`Bei ${word} stehen drei Kriterienzeilen da`,
      rzRows.length === 3, `${rzRows.length}`);
    const rzClasses = [...(rzBox?.classList || [])];
    check(`Und der Kasten bei ${word} traegt das Raster`,
      rzClasses.includes('rlist'), JSON.stringify(rzClasses));
    const rzColumns = gridColumns(rzClasses);
    /* DIE ZELLEN SIND ECHTE KINDKNOTEN und keine Behauptung: gezaehlt wird,
       was der Aufbau wirklich angehaengt hat. */
    const rzCells = rzRows.map(z => z.children.length);
    check(`Bei ${word} traegt jede Zeile gleich viele Zellen`,
      rzCells.length > 0 && rzCells.every(n => n === rzCells[0]),
      JSON.stringify(rzCells));
    /* DER KERN DIESER GRUPPE. Bei einem Zugang waren es zwei Zellen in drei
       Spalten -- und genau daran zerfiel die Liste. */
    check(`Und bei ${word} passen Zellen und Spalten zusammen`,
      rzColumns > 0 && rzCells.every(n => n === rzColumns),
      `${JSON.stringify(rzCells)} Zellen gegen ${rzColumns} Spalten`);
    /* UND DIE ZAHL SELBST, ausdruecklich: sonst bliebe die Zeile darueber
       auch dann gruen, wenn beide Lagen auf zwei Zellen und zwei Spalten
       faellen -- die Durchschnittsspalte waere dann wortlos verschwunden. */
    /* VIER UND DREI SEIT 0.22.0 (E15): die Zelle des Ruecksetzers kommt in
       beiden Lagen dazu. Umgedreht, nicht geloescht. */
    check(`Bei ${word} sind es ${howMany > 1 ? 'vier' : 'drei'} Zellen — 0.22.0`,
      rzCells[0] === (howMany > 1 ? 4 : 3), `${rzCells[0]}`);
    /* UND DIE KLASSE STEHT NUR DA, WO SIE HINGEHOERT. */
    check(`Die Klasse „no-average" steht bei ${word} ${howMany > 1 ? 'nicht' : ''} da`.replace('  ', ' '),
      rzClasses.includes('no-average') === (howMany === 1), JSON.stringify(rzClasses));
    rz.w.close();
  }

  /* UMGEDREHT MIT 0.21.0, und der alte Satz bleibt stehen,
     damit der Widerruf einen Gegenstand hat. */
  const rzRules = (css123.match(/\.rlist[^{]*\{[^}]*grid-template-columns[^}]*\}/g) || []);
  check('Die Spaltenzahl steht an genau drei Stellen im Stilblatt',
    rzRules.length === 3, JSON.stringify(rzRules));
  /* UND DIE DRITTE STEHT IM TELEFONABSCHNITT. */
  const rzPhone = (css123.match(/@media \(max-width: 700px\), \(max-height: 500px\) and \(max-width: 960px\) \{.*$/) || [''])[0];
  const rzThird = rzRules.find(r => /:not\(\.no-average\)/.test(r));
  check('Und die dritte gilt nur auf dem Telefon',
    !!rzThird && rzPhone.includes(rzThird), JSON.stringify(rzThird));
  /* UND DIE BEIDEN ALLGEMEINEN STEHEN AUSSERHALB -- der alte Satz gilt fuer
     sie unveraendert weiter. */
  check('Die beiden allgemeinen stehen weiterhin ausserhalb jeder Medienabfrage',
    rzRules.filter(r => !rzPhone.includes(r)).length === 2,
    JSON.stringify(rzRules.filter(r => rzPhone.includes(r))));
  /* UND AUCH DIE REGEL FUER DEN EINEN ZUGANG TRAEGT KEINEN SPALTENABSTAND: er
     risse die Trennlinie in Stuecke, genauso wie an der allgemeinen. */
  check('Auch die Regel fuer den einen Zugang traegt keinen Spaltenabstand',
    !/gap/.test(rzWithoutRule), rzWithoutRule || '(keine Regel)');
  /* DIE SCHWELLE STEHT AN EINER STELLE. */
  check('Raster und Zelle haengen an derselben einen Bedingung',
    /const withAverage = multipleUsers\(\);/.test(arSource) &&
    /box\.className = 'rlist' \+ \(withAverage \?/.test(arSource) &&
    /if \(withAverage\) \{/.test(arSource),
    (arSource.match(/const withAverage[^\n]*/) || ['(nicht gefunden)'])[0]);

  /* ================= Zwei Masse vom echten Geraet — 0.17.0 =============
     BEIDE BEFUNDE SIND AUF EINEM TELEFON ENTSTANDEN und in jsdom nicht zu
     messen: dort ist jede Breite und jede Hoehe null. */
  group('Zwei Masse vom echten Geraet — 0.17.0');

  /* DIE PROBE AUF DEN LESER: er muss wirklich etwas wegnehmen und wirklich
     etwas stehenlassen. Ohne sie belegten die Zeilen darunter nichts. */
  check('Der Leser trennt Medienabfragen wirklich ab',
    withoutMedia.length > 0 && withoutMedia.length < css123.length &&
    !/@media/.test(withoutMedia), `${withoutMedia.length} von ${css123.length}`);

  /* ---- Erstens: die Versionszeile unter der Falz (Samsung S21 5G) ---- `vh`
     IST AUF DEM TELEFON DIE GROSSE ANZEIGEFLAECHE -- die ohne Browserleisten,
     also die, die man nicht sieht. */
  for (const choice of ['body.login', '.login-screen']) {
    const rule = (withoutMedia.match(new RegExp(choice.replace(/\./g, '\\.') + ' \\{[^}]*\\}')) || [''])[0];
    check(`Die Regel fuer ${choice} steht ueberhaupt im Stilblatt`,
      rule.length > 0, '(keine Regel)');
    check(`${choice} misst die Hoehe in dvh`,
      /min-height: *100dvh/.test(rule), rule || '(keine Regel)');
    check(`Und ${choice} behaelt 100vh als Rueckfall DAVOR`,
      rule.indexOf('min-height: 100vh') >= 0 &&
      rule.indexOf('min-height: 100vh') < rule.indexOf('min-height: 100dvh'),
      rule || '(keine Regel)');
  }
  /* UND DIE ALTE VERMUTUNG IST NICHT DIE URSACHE: einen festen oberen Abstand
     gibt es an der Anmeldekarte gar nicht, sie ist mittig gesetzt. */
  check('Die Anmeldekarte bleibt mittig gesetzt statt oben angeheftet',
    /align-items: center/.test((withoutMedia.match(/\.login-screen \{[^}]*\}/) || [''])[0]),
    (withoutMedia.match(/\.login-screen \{[^}]*\}/) || ['(keine Regel)'])[0]);

  /* ---- Zweitens: der Rahmen der eigenen Anmeldung reicht nicht bis zum Rand
     `.manage-list` traegt `overflow-y: auto`, und damit steht `overflow-x`
     nach der CSS-Regel ebenfalls auf `auto`. */
  {
    const az = buildDom(JSDOM, { settings: { filters: null, userCount: 4, isAdmin: true } });
    await until(az.w, listReady, 2000, 'die Uebersicht');
    await az.w.renderSystem();
    await until(az.w, (x) => x.document.getElementById('msessions') && openRequests(x) === 0,
      2000, 'der Systembereich');
    const azOwn = az.w.document.querySelector('#msessions .mrow.session.session-mine');
    check('Die eigene Anmeldung steht als markierte Zeile da',
      !!azOwn, az.w.document.getElementById('msessions')?.innerHTML?.slice(0, 160));
    check('Und sie traegt zwei Zeitangaben in derselben Zeile',
      azOwn?.querySelectorAll('.session-time').length === 2,
      `${azOwn?.querySelectorAll('.session-time').length}`);
    az.w.close();
  }
  const azTime = (withoutMedia.match(/\.mrow\.session \.session-time \{[^}]*\}/g) || []).join(' ');
  check('Der Kasten laesst weiterhin senkrecht rollen',
    /overflow-y: auto/.test((withoutMedia.match(/\.manage-list \{[^}]*\}/) || [''])[0]),
    (withoutMedia.match(/\.manage-list \{[^}]*\}/) || ['(keine Regel)'])[0]);
  /* DER KERN: die Zusage gilt AUF JEDEM SCHIRM und nicht erst unterhalb eines
     Umbruchpunkts. */
  const azSitz = (withoutMedia.match(/\.mrow\.session \{[^}]*\}/) || [''])[0];
  check('Die Zeile einer Anmeldung steht ausserhalb jeder Medienabfrage in einem Raster',
    /display: grid/.test(azSitz), azSitz || '(keine Regel)');
  check('Und ihre Namensspalte gibt nach, statt die Zeile breiter zu machen',
    /grid-template-columns: minmax\(0, 1fr\)/.test(azSitz), azSitz || '(keine Regel)');
  check('Und der Zeilenabstand steht daneben',
    /row-gap:/.test(azSitz), azSitz || '(keine Regel)');
  /* UND DIE ANORDNUNG GILT SEIT 0.17.2 AUF JEDEM SCHIRM. */
  check('Die Anordnung der Stuecke gilt auf jedem Schirm',
    /\.mrow\.session \.user-act \{ grid-column: 2; grid-row: 1; \}/.test(withoutMedia),
    (withoutMedia.match(/\.mrow\.session \.user-act \{[^}]*\}/) || ['(keine Regel)'])[0]);
  check('Und die Medienabfrage traegt keine zweite daneben',
    (css123.match(/\.mrow\.session \.user-act \{/g) || []).length === 1,
    `${(css123.match(/\.mrow\.session \.user-act \{/g) || []).length} Regeln`);
  /* UND DER ANDERE WEG IST AUSDRUECKLICH NICHT GEGANGEN: `min-width:
     max-content` liesse den seitlichen Bildlauf stehen, und der ist auf dem
     Telefon schwer zu treffen. */
  check('Der seitliche Bildlauf wird nicht bloss laenger gemacht',
    !/max-content/.test(azSitz) && !/max-content/.test(azTime),
    `${azSitz} | ${azTime}`);

  /* ================= Das Feld steht nur, wo etwas fehlt — 0.15.1 =======
     BEFUND AUS DEM BETRIEB, 29. AUGUST 2026: an einem NICHT abgelehnten
     Eintrag standen die Aussage zur Ablehnung UND ihr Eingabefeld da. */
  group('Das Feld steht nur, wo etwas fehlt — 0.15.1');

  const fsBuild = async (rejected, reason) => {
    const d = buildDom(JSDOM, { hash: '#/item/1',
      rejection: rejected ? { at: '2026-03-14 09:12:00', reason,
        author: { id: 1, name: 'chefin', deleted: false } } : null,
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(d.w, detailReady, 2000, 'die Detailansicht');
    return d;
  };
  const fsField = (d) => d.w.document.getElementById('rej-reason-row');
  const fsMark = (d) => d.w.document.getElementById('rej-badge');
  const fsValue = (d) => d.w.document.getElementById('rej-reason');

  // --- Nicht abgelehnt: gar nichts, gleich ob ein Grund in der Zeile steht ---
  {
    const d = await fsBuild(false, null);
    check('Nicht abgelehnt und ohne Grund: weder Aussage noch Feld',
      fsMark(d)?.hidden === true && fsField(d)?.hidden === true,
      JSON.stringify([fsMark(d)?.hidden, fsField(d)?.hidden]));
    d.w.close();
  }
  /* DIE LAGE, DIE DEN BEFUND TRUG: das Merkmal ist zurueckgenommen, der Grund
     steht aber noch in der Zeile -- genau so laesst 0.14.0 ihn stehen. */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1',
      rejection: { at: '2026-03-14 09:12:00', reason: 'Ein Grund von frueher',
                   author: { id: 1, name: 'chefin', deleted: false } },
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await until(d.w, detailReady, 2000, 'die Detailansicht');
    // Das Merkmal zuruecknehmen -- Datum, Grund und Verfasser bleiben stehen.
    d.w.document.getElementById('sw-rej')
      .dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => d.sent.filter(g => g.method === 'PUT' && g.url === '/api/items/1')
      .length === 1 && openRequests(x) === 0, 2000, 'die Antwort auf das Zuruecknehmen');
    check('Zurueckgenommen, aber Grund noch in der Zeile: trotzdem beides weg',
      fsMark(d)?.hidden === true && fsField(d)?.hidden === true,
      JSON.stringify([fsMark(d)?.hidden, fsField(d)?.hidden]));
    check('Und der Schalter sagt es auch',
      d.w.document.getElementById('sw-rej-t')?.textContent === 'Nicht abgelehnt',
      JSON.stringify(d.w.document.getElementById('sw-rej-t')?.textContent));
    d.w.close();
  }

  // --- Abgelehnt OHNE Grund: das Feld steht offen, die Aussage tritt zurueck ---
  {
    const d = await fsBuild(true, null);
    check('Abgelehnt ohne Grund: das Feld steht offen',
      fsField(d)?.hidden === false, JSON.stringify(fsField(d)?.hidden));
    check('Und die Aussage tritt so lange zurueck -- nie beides zugleich',
      fsMark(d)?.hidden === true, JSON.stringify(fsMark(d)?.hidden));
    check('Das Feld ist dabei leer und nicht mit Altem gefuellt',
      fsValue(d)?.value === '', JSON.stringify(fsValue(d)?.value));
    d.w.close();
  }

  // --- Abgelehnt MIT Grund: die Aussage steht, das Feld ist zu ---
  {
    const d = await fsBuild(true, 'Lieferzeit über 6 Monate');
    check('Abgelehnt mit Grund: die Aussage steht, das Feld ist zu',
      fsMark(d)?.hidden === false && fsField(d)?.hidden === true,
      JSON.stringify([fsMark(d)?.hidden, fsField(d)?.hidden]));
    /* UND ES BLEIBT ZU, AUCH NACH EINEM NEUEN ZEICHNEN. */
    d.w.document.getElementById('sw-rej')
      .dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => d.sent.filter(g => g.method === 'PUT' && g.url === '/api/items/1')
      .length === 1 && openRequests(x) === 0, 2000, 'die Antwort auf das Zuruecknehmen');
    d.w.document.getElementById('sw-rej')
      .dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await until(d.w, (x) => d.sent.filter(g => g.method === 'PUT' && g.url === '/api/items/1')
      .length === 2 && openRequests(x) === 0, 2000, 'die Antwort auf das erneute Ablehnen');
    check('Ein erneutes Ablehnen macht es nicht auf -- der Grund steht ja da',
      fsField(d)?.hidden === true && fsMark(d)?.hidden === false,
      JSON.stringify([fsField(d)?.hidden, fsMark(d)?.hidden]));
    d.w.close();
  }

  /* --- UND DIE VIERTE LAGE IST DIE RECHTEFRAGE: wer nicht schreiben darf,
     bekommt das Feld auch dann nicht, wenn ein Grund fehlt. */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1',
      rejection: { at: '2026-03-14 09:12:00', reason: null,
                   author: { id: 2, name: 'Anna', deleted: false } },
      settings: { filters: null, userCount: 3, isAdmin: false } });
    await until(d.w, detailReady, 2000, 'die Detailansicht');
    check('Wer nicht schreiben darf, bekommt auch ohne Grund kein Feld',
      fsField(d)?.hidden === true, JSON.stringify(fsField(d)?.hidden));
    check('Die Aussage liest er dafuer',
      fsMark(d)?.hidden === false, JSON.stringify(fsMark(d)?.hidden));
    d.w.close();
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
