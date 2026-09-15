/* Kriterion — Pruefstand: die Oberflaeche: Export und Anzeige
 *
 * Der Export in Teilen, die nachziehende Anzeige, die Filterleiste, die
 * Kategoriezeile, die Marke, die Sternreihe und das Raster.
 *
 * Eigener Prozess, eigener Speicher. Der Rahmen steht in test/frame.js.
 */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  buildDom, openTagRow, sysSection, css123, regel123, withoutMedia
} = D;

async function run() {
  const {
   fs, os, path, attachments, sharp, CODE, KOMMENTAR, __dirname, require,
   FILTER, group, check, equal, open, startFurtherServer
  } = H;
  /* DIESES MODUL BAUT FENSTER. Fehlt jsdom, sagt es das und haelt an. Die
     Zahl der uebersprungenen Pruefungen steht EINMAL im ersten Modul der
     Oberflaeche und nicht in jedem -- sonst zaehlte ein Lauf ohne jsdom sie
     achtmal. */
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch { console.log('  … uebersprungen: jsdom fehlt (npm install)'); return; }

  /* ---------------------------------------------------------------- */
  group('Der Export in Teilen');

  /* WOZU DIESE GRUPPE MEHR PRUEFT ALS DIE ANDEREN: der Betreiber hat den Weg
     an EINE Bedingung gebunden -- "wenn es sich genauso ein und ausspielen
     laesst". Eine Zusicherung auf die Schnittstelle allein waere hier zu
     wenig; geprueft wird der RUNDLAUF, mit einer zweiten, frischen Instanz und
     einem Vergleich Feld fuer Feld. */
  const tlDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-teile-'));
  const tlTargetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-teile-ziel-'));
  /* 6880 UND 6940, UND SIE SIND NACHGESEHEN: 6700, 6760 und 6820 gehoeren der
     Selbstanmeldung. Zwei Prueflagen auf derselben Basis wuerfeln aus demselben
     Fenster und treffen einander irgendwann -- selten genug, dass es wie ein
     Zufall aussaehe, und oft genug, dass es passiert. */
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

  /* DER BESTAND MUSS BYTES TRAGEN, sonst gibt es nichts zu schneiden. Die
     Anhaenge liefern sie: sie gehen als Bytes hinein und als Bytes wieder
     heraus, ohne durch die Bildverarbeitung zu laufen -- damit misst diese
     Lage den SCHNITT und nicht sharp.
     REICH GENUG, UM ETWAS ZU BELEGEN: Kommentare aller vier Arten, davon
     angepinnte, dazu Links, Tags, Bewertungen und Testtage. Ein Rundlauf ueber
     nackte Titel belegte nichts. */
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
        { method: 'POST', headers: { cookie: tlA.cookieValue() }, body: fk });
    }
    const fa = new FormData();
    fa.append('files', new Blob([tlAttachment], { type: 'text/plain' }), `gross-${i}.txt`);
    await fetch(`${tlA.base}/api/items/${it.id}/attachments`,
      { method: 'POST', headers: { cookie: tlA.cookieValue() }, body: fa });
  }

  /* --- Der Plan --- */
  const tlToggle = 'photos=1&files=1&videos=1';
  const tlPlanCall = (extraEnv = '') => tlA.call('GET', `/api/export/plan?${tlToggle}${extraEnv}`);
  const tlPlan = (await tlPlanCall('&target=1048576')).content;
  check('Der Plan schneidet den Bestand in mehrere Teile',
    (tlPlan?.parts || []).length > 1, JSON.stringify((tlPlan?.parts || []).map(t => t.count)));
  /* GESCHNITTEN WIRD AN EINTRAGSGRENZEN, nie mitten hinein: ein halber Eintrag
     waere kein gueltiger Export, und der Import muesste zwei Teile kennen, um
     ihn zu verstehen. */
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
     warnt. Beide Richtungen einzeln, sonst belegte die eine die andere nicht. */
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
     Bestaetigung -- die steht an den Teilen selbst. Er bleibt aber am
     Eigentuemer: er nennt Titel und Groessen. */
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
  /* EINE ABFRAGE, MEHRERE FREIGABEN -- aber jede fuer sich. Eine Freigabe fuer
     Teil 1 darf Teil 2 NICHT durchlassen; sonst waere aus n Schranken eine
     geworden. */
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
    tlFiles.every((d, i) => d.head.includes(`-teil-${i + 1}-von-${tlN}-`)),
    tlFiles.map(d => d.head).join(' | '));
  const tlPackages = tlFiles.map(d => { try { return JSON.parse(d.text); } catch { return null; } });
  check('Jeder Teil ist fuer sich gueltiges JSON', tlPackages.every(p => p && Array.isArray(p.items)));
  /* DERSELBE UMSCHLAG UND DIESELBE FORMATNUMMER -- daran haengt, dass der
     vorhandene Import sie ohne eine Zeile Aenderung annimmt. */
  check('Jeder Teil traegt denselben Umschlag wie ein voller Export',
    tlPackages.every(p => p.version === tlPackages[0].version && p.title === tlPackages[0].title
      && Array.isArray(p.criteria) && p.criteria.length === tlPackages[0].criteria.length),
    JSON.stringify(tlPackages.map(p => [p.version, p.criteria?.length])));
  // Jeder Teil traegt dieselbe Nummer wie ein voller Export -- ein Teil ist ein
  // vollstaendiges Paket mit weniger Eintraegen darin, kein halbes.
  check('Und jeder Teil traegt die Formatnummer des vollen Exports',
    tlPackages.every(p => p.version === 17), JSON.stringify(tlPackages.map(p => p.version)));
  check('Zusammen tragen die Teile jeden Eintrag genau einmal',
    tlPackages.reduce((n, p) => n + p.items.length, 0) === 6 &&
    new Set(tlPackages.flatMap(p => p.items.map(i => i.title))).size === 6,
    JSON.stringify(tlPackages.map(p => p.items.length)));
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
     des Einspielens. Verglichen wird der Bestand als AUSSAGE, nicht als Datei. */
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
      { method: 'POST', headers: { cookie: tlB.cookieValue() }, body: fd });
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
  /* ER WIRD BEIM NAMEN GENANNT UND NICHT STILLSCHWEIGEND UEBERGANGEN. Ein
     stiller Verlust waere der schlimmere Ausgang: wer ihn sieht, weiss, dass
     er die Videos abwaehlen oder diesen einen Eintrag von Hand behandeln muss.
     GEBAUT WIRD ER UEBER DIE DATENBANK und nicht ueber die Routen: 400 MB
     durch multer zu schicken dauerte laenger als der ganze Lauf. */
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
     vergleichen laesst. DIE EINMALIGKEIT GIBT ES NUR MIT EINGESCHALTETEM
     FAKTOR -- 38 Pruefungen auf den Teilexport, und keine einzige stellte
     beides zusammen. Eine Pruefgruppe, die einen Schalter nie einschaltet,
     belegt nichts ueber den Zustand mit Schalter.

     SIE HOLT MEHR ALS EINE FREIGABE. Eine Lage mit einem einzigen Teil bliebe
     gruen und belegte nichts: der Fehler beginnt beim ZWEITEN Aufruf.

     UND SIE SIEHT INS SICHERHEITSPROTOKOLL. Die Fehlalarme sind der Teil des
     Schadens, den sonst niemand sieht -- drei Teile hinterliessen drei Zeilen
     'confirm.fail' ueber den Eigentuemer selbst. */
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

    /* EIN CODE, DER TRAEGT -- und die beiden Bedingungen dafuer stehen hier an
       EINER Stelle, statt an jeder Aufrufstelle noch einmal.
       ERSTENS DAS WINDOW: faellt die Grenze der dreissig Sekunden zwischen
       Rechnung und Ankunft, wuerde eine Pruefung zufaellig rot, und roter
       Zufall kostet Vertrauen in alle anderen (Stolperstein 151).
       ZWEITENS DIE EINMALIGKEIT, und sie ist der Gegenstand dieser Gruppe: der
       Zaehler muss echt groesser sein als der zuletzt verbrauchte. Zwei Codes
       aus DEMSELBEN Fenster sind derselbe Code -- wer das uebersieht, baut
       eine Pruefung, die den Fehler nachstellt, den sie widerlegen soll.
       DESHALB WIRD GEWARTET UND NICHT GERECHNET: nur die Uhr bringt den
       Zaehler weiter. Jeder Aufruf kostet damit bis zu dreissig Sekunden, und
       die Gruppe braucht deshalb genau zwei tragende Codes. */
    let tzUsed = -1;
    const tzCode = async () => {
      for (;;) {
        if (30000 - (Date.now() % 30000) >= 9000 && ZF2.nowStep() + 1 > tzUsed) break;
        await new Promise(r => setTimeout(r, 200));
      }
      tzUsed = ZF2.nowStep() + 1;
      return ZF2.code(tzSecret, tzUsed);
    };
    // Fuer die Absagen, die VOR der Codepruefung fallen. Er ist absichtlich
    // keiner, der traegt: faellt die Absage weg, wird aus dem erwarteten 400
    // ein 403 und die Zeile bleibt rot -- sie kann also gar nicht aus
    // Versehen gruen werden.
    const TZ_NO_CODE = '000000';

    const tzQuiet = async () => {
      while (30000 - (Date.now() % 30000) < 9000) await new Promise(r => setTimeout(r, 200));
    };

    await tzQuiet();
    const tzStart = await tzS.call('POST', '/api/two-factor/start', { password: TZ_WORD });
    // Auffangnetz (Stolperstein 138): gibt /start kein Geheimnis her, laeuft
    // alles Weitere trotzdem durch -- mit einem Wert, der zuverlaessig nicht
    // traegt, statt dass der Lauf hier abreisst.
    const tzSecret = (tzStart.content && tzStart.content.secret) || 'A'.repeat(32);
    const tzCounter = ZF2.nowStep();
    const tzAn = await tzS.call('POST', '/api/two-factor/on',
      { password: TZ_WORD, code: ZF2.code(tzSecret, tzCounter) });
    // DER BESTAETIGENDE CODE ZAEHLT ALS VERBRAUCHT -- das ist die Zusage "ein
    // Code gilt genau einmal" an ihrer ersten Anwendung.
    tzUsed = tzCounter;
    /* ERST DER GEGENSTAND, DANN DIE EIGENSCHAFT (Stolperstein 81): ohne
       eingeschalteten Faktor liefe die ganze Gruppe gegen denselben Server wie
       die Gruppe darueber und belegte nichts ueber die Einmaligkeit. */
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
        { method: 'POST', headers: { cookie: tzS.cookieValue() }, body: fa });
    }
    const tzToggle = 'photos=1&files=1&videos=1';
    const tzPlan = (await tzS.call('GET', `/api/export/plan?${tzToggle}&target=1048576`)).content;
    const tzParts = tzPlan?.parts || [];
    /* MEHR ALS EIN TEIL IST DIE BEDINGUNG DIESER GRUPPE. Bei einem einzigen
       bliebe jede Zeile darunter gruen, ohne etwas zu belegen: der Fehler
       beginnt beim zweiten Aufruf (Stolperstein 189, dieselbe Lehre). */
    check('Der Plan schneidet in mehr als einen Teil — sonst belegt diese Gruppe nichts',
      tzParts.length > 1, JSON.stringify(tzParts.map(t => t.count)));
    // Der Plan selbst braucht keine Bestaetigung und ist deshalb vom Fehler
    // nicht betroffen -- das gehoert festgehalten, weil im Betrieb genau
    // dieser Schritt noch ging und der naechste nicht mehr.
    check('Und er kommt ohne Bestaetigung, auch mit eingeschaltetem Faktor',
      (await tzS.call('GET', `/api/export/plan?${tzToggle}&target=1048576`)).status === 200);

    /* --- Der Fehler aus dem Betrieb, nachgestellt ---
       EINE EINGABE, N ANFRAGEN: die erste traegt, die zweite nicht. Das ist
       die Eigenschaft, an der 0.12.4 gescheitert ist, und sie wird hier
       ausdruecklich vorgefuehrt -- ohne sie waere die Zeile darunter eine
       Behauptung ueber etwas, das es gar nicht gibt. */
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
       unbrauchbar bestellt und wird abgewiesen, die zweite traegt. Damit steht
       in einem Zug, dass eine abgewiesene Bestellung den Code NICHT verbraucht
       -- die Absagen stehen vor der Passwortpruefung, und genau deshalb.
       FIELE DIE ABSAGE WEG, verbrauchte die erste Anfrage den Code und die
       zweite bekaeme 403: die Zeile darunter wuerde rot. */
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

    /* JEDER TEIL LAEDT, UND JEDER VERBRAUCHT GENAU EINE FREIGABE. Das ist die
       Eigenschaft, die NICHT mit weggeraeumt werden darf: zusammengefasst wird
       die Abfrage, nicht die Schranke. */
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

    /* --- KEINE ZEILE 'confirm.fail' ---
       Der Teil des Schadens, den sonst niemand sieht: drei Teile hinterliessen
       drei Zeilen ueber den Eigentuemer selbst, an genau der Karte, die diese
       Runde durchsuchbar macht. */
    const tzProtAfter = (await tzS.call('GET', '/api/security-log')).content;
    const tzFailAfter = (tzProtAfter?.rows || []).filter(z => z.event === 'confirm.fail').length;
    check('Der ganze Weg hinterlaesst keine einzige neue Zeile "bestaetigung.fehl"',
      tzFailAfter === tzFailVor, `${tzFailVor} vorher, ${tzFailAfter} nachher`);
    /* UND DAS PROTOKOLL SCHREIBT UEBERHAUPT MIT -- eine leere Tabelle machte
       die Zeile darueber wahr, ohne etwas zu belegen (Stolperstein 81).
       DIESE ZEILE IST SELBST EIN BEFUND AUS 0.12.4: dort stand "teil 1/5" im
       Merkmal, das ist kein Wert aus MERKMALE, und protokolliere() verwarf
       damit die GANZE Zeile. Ein Teilexport hinterliess im Protokoll nichts. */
    check('Und der Export selbst steht sehr wohl darin, Teil fuer Teil',
      (tzProtAfter?.rows || []).filter(z => z.event === 'export' && z.detail === 'part')
        .length === tzParts.length,
      JSON.stringify((tzProtAfter?.rows || []).filter(z => z.event === 'export').map(z => z.detail)));

    /* --- Die Grenzen der Mehrzahl ---
       ALLE MIT EINEM CODE, DER NICHT TRAEGT: diese Absagen fallen VOR der
       Codepruefung. Faellt eine von ihnen weg, wird aus dem erwarteten 400 ein
       403, und die Zeile bleibt rot -- sie kann nicht aus Versehen gruen
       werden (Befund B aus 0.12.0: kein Massstab vom Prueflling). */
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
       die Ziele ist genau das, was im Betrieb gescheitert ist. Steht sie
       wieder da, ist der Fehler zurueck. */
    const tzApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    const tzMultiple = (tzApp.match(
      /async function confirmTwiceMany[\s\S]*?\n\}/) || [''])[0];
    check('zweiteBestaetigungMehrfach steht im Quelltext',
      tzMultiple.length > 60, String(tzMultiple.length));
    check('Und sie schickt die Ziele in EINER Anfrage statt eine je Ziel',
      /targets\s*\}\)/.test(tzMultiple) && !/for\s*\(\s*const\s+target\s+of\s+targets/.test(tzMultiple),
      tzMultiple.slice(-220));

    /* --- Der Knopf sagt, was er tut --- */
    /* "Alle n Teile freigeben" war das Wort aus dem Maschinenraum. Gepruefft
       wird die AUSSAGE und nicht die Laenge: dass einmal bestaetigt und danach
       jeder Teil einzeln geladen wird. */
    check('Der Knopf nennt nicht mehr das Freigeben',
      !/Alle \$\{n\} Teile freigeben/.test(tzApp) && !/Freigegeben —/.test(tzApp));
    /* GESUCHT WIRD IN BEIDEM -- 0.24.0: im Quelltext und in der Sprachdatei.
       Die drei Saetze sind dieselben geblieben, sie wohnen nur woanders; die
       FRAGE aendert sich dadurch nicht (Stolperstein 201). */
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


  /* --- 2a: nur zeichnen, was zu sehen ist ---
     WAS HIER AUSDRUECKLICH NICHT GEPRUEFT WIRD: die WIRKUNG. jsdom misst jede
     Hoehe als null und kennt weder Layout noch Zeichnen; content-visibility
     ist dort nachweislich nicht nachweisbar. Dass die Regel dasteht, ist
     keine Pruefung ihrer Wirkung -- und dieser Satz steht hier, damit niemand
     die gruenen Punkte darunter fuer eine Messung haelt. Gemessen wurde in
     Chromium, und die Zahlen stehen im Aenderungsprotokoll 0.12.3. */
  check('Die Kachel ueberspringt, was ausserhalb des Bildes liegt',
    /content-visibility: auto/.test(regel123('.card')), regel123('.card').slice(0, 200) || '(keine Regel)');
  /* OHNE contain-intrinsic-size SPRINGT DER ROLLBALKEN: eine uebersprungene
     Kachel misst sonst null, und die Liste schrumpft beim Rollen zusammen. */
  check('Und sie sagt dabei, wie hoch sie ungefaehr ist',
    /contain-intrinsic-size: auto \d+px/.test(regel123('.card')),
    (css123.match(/contain-intrinsic-size:[^;}]*/) || ['(nicht gesetzt)'])[0]);
  /* `auto` VOR DER ZAHL IST DER GANZE TRICK: danach nimmt der Browser die
     zuletzt WIRKLICH gezeichnete Hoehe, und die geschaetzte gilt nur bis zum
     ersten Zeichnen. Ohne das Wort bliebe die Schaetzung fuer immer stehen. */
  const allIntrinsic = css123.match(/contain-intrinsic-size:[^;}]*/g) || [];
  check('Jede Angabe traegt das Wort auto — sonst gaelte die Schaetzung fuer immer',
    allIntrinsic.length >= 2 && allIntrinsic.every(z => /auto/.test(z)),
    JSON.stringify(allIntrinsic));
  /* DIE KACHELHOEHE IST AUF TELEFON UND DESKTOP VERSCHIEDEN, weil das Bild
     quadratisch ist und die Spaltenbreite in .grid steht. Eine einzige Zahl
     fuer beide waere auf einem der beiden Schirme falsch. */
  check('Und jede Rasterstufe bekommt ihre eigene Zahl',
    new Set(allIntrinsic).size === allIntrinsic.length && allIntrinsic.length >= 3,
    JSON.stringify(allIntrinsic));
  // Und die Gegenprobe zum Waechter: er darf nicht gruen sein, weil er nichts
  // mehr ansieht.
  check('Der Waechter sieht wirklich die Kachelregel an',
    /background: var\(--surface\)/.test(regel123('.card')), regel123('.card').slice(0, 120));
  /* KEIN NACHLADEN BEIM ROLLEN, KEIN BLAETTERN. Beides steht im Fahrplan als
     "spaeter" bzw. "gar nicht"; ein Beobachter am Listenende fuehrte einen
     Zustand ein, den jede Sortierung und jeder Filter zuruecksetzen muesste. */
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
  /* ES AENDERT SICH KEINE EINZIGE BREITE. Wuerde die linke Kante beim
     Anpinnen duenn, muesste padding-left von 10 auf 12 zurueck -- sonst
     begaennen die Zeilen auf zwei Linien (Befund C aus 0.12.0, andersherum). */
  /* DAS MUSTER TRENNT FARBE VON BREITE, und seit 0.13.2 muss es das auch:
     `border-left` allein traf `border-left-color` mit -- also genau die
     Zeile, mit der jede Art sich ihre Kante zurueckholt. Gemeint war nie die
     Farbe, sondern die BREITE: die Kurzform `border-left:` kann eine tragen,
     `border-left-color:` niemals. */
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

  /* --- 2f: „mehr" frisst keine Zeile mehr ---
     SEIT 0.13.0 ANDERSHERUM GEBAUT, und das ist der Kern von Punkt 5a: der
     Kasten trug `margin-left: auto`, und eine selbsttaetige Aussenkante frisst
     den gesamten freien Platz der Zeile -- die Wolke KANN daneben nicht
     stehen, sie rutscht immer darunter. Jetzt nimmt die Wolke den Platz
     (`flex: 1 1 0`), und die Verweise stehen als gewoehnliche Geschwister
     dahinter. */
  check('Es gibt einen Kasten fuer die Verweise der Filterzeile',
    /display: flex/.test(regel123('.frow-right')), regel123('.frow-right') || '(keine Regel)');
  check('Und er traegt KEINE selbsttaetige Aussenkante mehr',
    !/margin-left: auto/.test(regel123('.frow-right')), regel123('.frow-right'));
  /* KEINE AUSGERECHNETE BREITE, nirgends -- die Instanz stellt die Schrift von
     80 bis 120 Prozent, und genau daran hing 0.12.1 schon einmal
     (`right: 92px`, Befund A). */
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
  await new Promise(r => setTimeout(r, 80));
  // Aufgeklappt wie ein Benutzer es tut -- zugeklappt gibt es die Zeile seit
  // 0.24.0 gar nicht (Bauabschnitt 0.2).
  await openTagRow(fzW);
  const fRow = [...fzW.document.querySelectorAll('.frow')]
    .find(z => z.querySelector('.eyebrow')?.textContent === 'Tags');
  check('Die Tagzeile steht da', !!fRow, '(keine Tagzeile)');
  /* DER WEG ZUM VERWEIS GEHT UEBER DIE AUSWAHL, nicht ueber einen gesetzten
     Zustand. "mehr" erscheint nur, wenn die Wolke wirklich beschnitten ist --
     und in jsdom misst jede Hoehe null, begrenzeWolke() steigt dort
     ausdruecklich aus. "zuruecksetzen" dagegen haengt an der Auswahl, und die
     laesst sich mit einem echten Klick auf eine Marke herstellen. Ein von
     Hand gesetzter Zustand naehme genau den Weg heraus, um den es geht. */
  check('Ohne Auswahl steht der Kasten gar nicht erst da',
    !fRow?.querySelector('.frow-right'), fRow?.innerHTML.slice(0, 160));
  fRow?.querySelector('.pill-tag')?.click();
  await new Promise(r => setTimeout(r, 40));
  const fZeile2 = [...fzW.document.querySelectorAll('.frow')]
    .find(z => z.querySelector('.eyebrow')?.textContent === 'Tags');
  const fRight = fZeile2?.querySelector('.frow-right');
  /* SEIT 0.30.2 TRAEGT ER EIN ZEICHEN UND KEIN WORT -- das Wort steht im
     Titel. Geprueft wird deshalb der TITEL und nicht der Text: ein Zeichen
     ohne Titel liest kein Vorleseprogramm vor, und genau das soll die Zusage
     verhindern. */
  check('Der Verweis sitzt in seinem Kasten — und sein Wort im Titel',
    !!fRight && [...fRight.querySelectorAll('.link-btn')]
      .some(b => /zurücksetzen/.test(b.getAttribute('title') || '')),
    fZeile2?.innerHTML.slice(0, 200));
  /* SEIT 0.13.0 STEHT ER HINTER DER WOLKE -- die natuerliche Reihenfolge:
     "mehr" gehoert hinter das, was es aufklappt. Vorher musste er davor
     stehen, weil er die Zeile sonst umbrach; das lag an der selbsttaetigen
     Aussenkante und nicht an der Reihenfolge.
     GEPRUEFT WIRD DIE REIHENFOLGE UND NICHT DIE HOEHE: jsdom rechnet kein
     Layout, die Ersparnis von 82 px kann dieser Lauf nicht sehen. Was er
     sehen kann, ist der Aufbau. */
  const fChildren = [...(fZeile2?.children || [])].map(k => k.className);
  /* GESUCHT WIRD DIE KLASSE UND NICHT DER GANZE WERT -- 0.29.0. Der Kasten
     traegt seit dieser Runde eine zweite Klasse (`frow-right-end`, Befund 6),
     und ein Vergleich auf Gleichheit faende ihn nicht mehr. Die Zusage meint
     die REIHENFOLGE und nicht die Schreibweise des Attributs. */
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
  await new Promise(r => setTimeout(r, 40));
  const fZeile3 = [...fzW.document.querySelectorAll('.frow')]
    .find(z => z.querySelector('.eyebrow')?.textContent === 'Tags');
  check('Faellt die Auswahl weg, verschwindet auch der Kasten wieder',
    !fZeile3?.querySelector('.frow-right'), fZeile3?.innerHTML.slice(0, 160));
  fzW.close();

  /* ================= Die Filterleiste wird kuerzer — 0.13.0 ============
     DER PRUEFSTAND KANN DIESE ZEILEN NICHT SEHEN: jsdom rechnet kein Layout,
     jede Hoehe ist dort null. Die 229 px vorher und die rund 147 px nachher
     sind am Browser gemessen und stehen im Aenderungsprotokoll.
     WAS SICH PRUEFEN LAESST, IST DER AUFBAU -- und der traegt die Ersparnis:
     wie viele Zeilen es gibt, dass Wolke und Verweise Geschwister EINER Zeile
     sind, dass im Stilblatt keine ausgerechnete Breite steht und dass die
     Pille mit null Treffern ihre Klasse und ihren Hinweis bekommt.
     Behauptet wird hier nichts, was dieser Lauf nicht messen kann. */
  group('Die Filterleiste wird kuerzer — 0.13.0');

  const flDom = buildDom(JSDOM, { tags: [
    { id: 41, name: 'Alu', usage_count: 3 }, { id: 42, name: 'Stahl', usage_count: 2 }] });
  const flW = flDom.w;
  await new Promise(r => setTimeout(r, 80));
  /* AUFGEKLAPPT GEZAEHLT. Seit 0.24.0 steht die Tagzeile zugeklappt, solange
     kein Tagfilter greift (Bauabschnitt 0.2) -- die Leiste ist damit noch
     einmal eine Zeile kuerzer geworden. Gezaehlt werden hier weiter die VIER
     Steuergruppen, also der aufgeklappte Zustand: die Zahl aus 0.13.0 bleibt
     damit vergleichbar, und die neue Ersparnis steht in ihrer eigenen Gruppe. */
  await openTagRow(flW);
  const flRows = () => [...flW.document.querySelectorAll('#filters .frow')];
  const flLabels = () => flRows().map(z =>
    [...z.querySelectorAll('.eyebrow')].map(e => e.textContent).join('+'));
  /* VIER STEUERGRUPPEN IN VIER ZEILEN, vorher fuenf in fuenf. Die Zahl steht
     ausdruecklich da: eine Zeile, die sich still dazuschiebt, faellt sonst
     niemandem auf. */
  check('Die Leiste hat noch vier Zeilen statt fuenf',
    flRows().length === 4, JSON.stringify(flLabels()));
  check('Und Sortieren und Ansichten teilen sich die letzte',
    flLabels()[3] === 'Sortieren+Ansichten', JSON.stringify(flLabels()));
  /* DIE ZWEITE BESCHRIFTUNG IST DAS GEGENSTUECK ZUR ERSTEN und keine
     Ueberschrift: sie traegt die Beschriftungsspalte NICHT. Gepruefft wird die
     Klasse und im Stilblatt die Regel dazu -- die Breite selbst kann jsdom
     nicht messen. */
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
    !!flRows()[3]?.querySelector('#ansicht-neu'), flRows()[3]?.innerHTML.slice(0, 200));
  /* KEINE AUSGERECHNETE BREITE, an keiner der drei angefassten Stellen. Das
     war Befund A aus 0.12.1 (`right: 92px`), und die Instanz stellt die Schrift
     von 80 bis 120 Prozent -- jede feste Zahl kann dabei nur falsch werden.
     Die Beschriftungsspalte selbst bleibt in em und ist ausgenommen; sie fasst
     Text und ist die eine Ausnahme, die im Stilblatt begruendet steht. */
  const flRules = ['.frow-right', '.frow > .pills.cloud', '.frow > .eyebrow-with'];
  const flIncludingPx = flRules.filter(r => /:\s*[0-9.]+px/.test(regel123(r).replace(/gap: [0-9]+px|margin-left: [0-9]+px/g, '')));
  check('Keine der drei angefassten Regeln rechnet eine Breite aus',
    flIncludingPx.length === 0, flIncludingPx.map(r => regel123(r)).join(' | '));
  flW.close();

  /* --- MITGENOMMEN MIT 0.17.0: die Daempfung galt jeder Pille ---
     HIER STAND „Neu seit ... mit null Treffern wird gedaempft". Die Pille ist
     gestrichen; DIE REGEL DAHINTER GILT WEITER und war nie ihre eigene: seit
     0.13.0 wird JEDE Pille gedaempft, die in der aktuellen Auswahl auf null
     Treffer fuehrt -- dieselbe Sache darf nicht zwei Verhalten haben
     (Stolperstein 47, im Kleinen). Belegt wird sie deshalb weiter, jetzt an
     einem Tag, und die Regel im Stilblatt wird ausdruecklich daraufhin
     angesehen, dass sie NICHT nur fuer Tags gilt (Stolperstein 201). */
  const flFreshItem = (id, date) => ({
    id, title: 'Stueck ' + id, rejected: false, tested: false, favorite: false, category: null,
    tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null,
    testCount: null, testAvg: null, testLast: null, testDays: [], updated_at: date });
  /* DIE LAGE STELLT DEN LEERLAUF WIRKLICH HER (Stolperstein 224): EIN Tag ist
     bereits gewaehlt, und der zweite traegt keinen der sichtbaren Eintraege --
     erst dann fuehrt ein zusaetzlicher Klick garantiert auf eine leere Liste.
     Ohne die gewaehlte Vorauswahl stellt sich die Frage gar nicht: im
     ODER-Modus und ohne Auswahl erweitert jeder Klick. */
  const flTagPool = [{ id: 1, name: 'Grün', usage_count: 1, test_usage_count: 0 },
                       { id: 2, name: 'Blau', usage_count: 1, test_usage_count: 0 }];
  const flOldDom = buildDom(JSDOM, {
    overviewItems: [{ ...flFreshItem(1, '2026-01-01 10:00:00'),
                        tags: [{ id: 1, name: 'Grün' }] }],
    tags: flTagPool,
    settings: { filters: { categoryIds: [], tagIds: [1], tagMode: 'and', tested: 'all',
                                rejected: 'all', favorite: false, sort: 'title_asc' } } });
  const flOldW = flOldDom.w;
  await new Promise(r => setTimeout(r, 80));
  const flPill = (w, name) => [...w.document.querySelectorAll('#filters .pill-tag')]
    .find(b => b.textContent.trim() === name);
  const flEmptyPill = flPill(flOldW, 'Blau');
  /* ERST DER GEGENSTAND (Stolperstein 81): ohne die Pille im Vorrat waere jede
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
  /* DIE REGEL GILT SEIT 0.13.0 FUER JEDE PILLE und nicht mehr nur fuer Tags --
     sonst waere es dieselbe Sache mit zwei Verhalten, nur andersherum. Sie
     bleibt stehen, obwohl die Pille, fuer die sie 0.13.0 verallgemeinert hat,
     gestrichen ist: die Verallgemeinerung ist der Gewinn, nicht die Pille. */
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
  await new Promise(r => setTimeout(r, 80));
  const flFullPill = flPill(flFreshW, 'Blau');
  check('Mit Treffern steht sie in voller Helligkeit da',
    !!flFullPill && !flFullPill.classList.contains('blank'), flFullPill?.className);
  flFreshW.close();

  /* ================= Die Kategoriezeile lernt die Mehrzahl — 0.13.0 ====
     ZWEI WUENSCHE, EINE AENDERUNG: mehrere Kategorien zugleich, und "ohne
     Kategorie" als Eintrag derselben Liste.
     DIE PRUEFUNG, DIE HIER FEHLEN WUERDE, ist die auf die ALTE Form: eine
     gespeicherte Ansicht mit einem einzelnen Kategoriewert muss nach dem
     Einlesen dieselbe Liste zeigen wie vorher. Eine Prueflage, die nur die
     neue Form kennt, belegt darueber nichts -- dieselbe Lehre wie beim
     Teilexport: der Schalter, den keine Lage jemals einschaltet. */
  group('Die Kategoriezeile lernt die Mehrzahl — 0.13.0');

  const kmCategory = [{ id: 21, name: 'Werkzeug', usage_count: 2 },
                 { id: 22, name: 'Material', usage_count: 1 }];
  const kmItem = (id, category) => ({
    id, title: 'Stueck ' + id, rejected: false, tested: false, favorite: false,
    category: category ? kmCategory.find(k => k.id === category) : null,
    tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: null,
    testCount: null, testAvg: null, testLast: null, testDays: [],
    updated_at: '2026-08-01 10:00:00' });
  /* FUENF EINTRAEGE: zwei Werkzeug, eines Material, ZWEI OHNE. Genau die Lage
     aus dem Betrieb -- der Kopf sagte mehr, als die Kategorien zusammen
     ergaben, und die Luecke war nicht zu sehen. */
  const kmInventory = [kmItem(1, 21), kmItem(2, 21), kmItem(3, 22), kmItem(4, null), kmItem(5, null)];
  const kmDom = buildDom(JSDOM, { overviewItems: kmInventory, categories: kmCategory,
                                 settings: { filters: null } });
  const kmW = kmDom.w;
  await new Promise(r => setTimeout(r, 80));
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
  /* KEIN UND/ODER AN DIESER ZEILE. Bei den Tags ist die Wahl echt, weil ein
     Eintrag viele Tags traegt; hier gibt es nur Oder -- ein Umschalter, dessen
     eine Haelfte garantiert null Treffer liefert, ist schlimmer als keiner. */
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

  kmClickable('Werkzeug'); await new Promise(r => setTimeout(r, 40));
  check('Eine Kategorie wirkt wie bisher', kmCards() === 2, `${kmCards()} Karten`);
  kmClickable('Material'); await new Promise(r => setTimeout(r, 40));
  /* MEHRERE ZUGLEICH, UND ES IST DIE VEREINIGUNG. Ein Schnitt waere garantiert
     leer -- ein Eintrag traegt genau eine Kategorie. */
  check('Zwei Kategorien zugleich zeigen beide Gruppen', kmCards() === 3, `${kmCards()} Karten`);
  check('Und beide Pillen stehen auf an',
    kmAn().length === 2 && kmAn().every(n => /Werkzeug|Material/.test(n)), JSON.stringify(kmAn()));
  kmClickable('Ohne'); await new Promise(r => setTimeout(r, 40));
  check('"Ohne" laesst sich dazunehmen wie jeder andere Wert', kmCards() === 5,
    `${kmCards()} Karten`);
  /* DREI GEWAEHLTE KATEGORIEN ZAEHLEN ALS EIN FILTER -- anders als die Tags,
     und der Unterschied ist die Verknuepfung: jeder Tag verkleinert die Menge,
     jede Kategorie vergroessert sie. */
  check('Die Filterzahl zaehlt drei gewaehlte Werte als EINEN Filter',
    /· 1 aktiv/.test(kmW.document.querySelector('#filter-toggle .fcount')?.textContent || ''),
    kmW.document.querySelector('#filter-toggle .fcount')?.textContent);
  kmClickable('Werkzeug'); await new Promise(r => setTimeout(r, 40));
  check('Ein zweiter Klick nimmt einen Wert wieder heraus', kmCards() === 3,
    `${kmCards()} Karten`);
  const kmAll = kmPills().find(b => b.textContent.trim() === 'Alle');
  kmAll?.dispatchEvent(new kmW.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  check('"Alle" raeumt die ganze Auswahl weg',
    kmAn().join() === 'Alle' && kmCards() === 5, `${JSON.stringify(kmAn())} · ${kmCards()}`);

  /* --- DIE ALTE FORM EINER GESPEICHERTEN ANSICHT ---
     Vor 0.13.0 stand dort EIN Kategoriewert. Ohne Uebersetzung verloeren alle
     vorhandenen Ansichten ihre Kategorie, still und ohne Message. */
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
  /* EINE GELOESCHTE KATEGORIE NIMMT DIE UEBRIGEN NICHT MIT. Bis 0.12.4 fiel
     die Ansicht ganz auf "Alle" zurueck; mit einer Liste faellt sie auf den
     REST zurueck, und das ist der bessere Ausgang. */
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
  await new Promise(r => setTimeout(r, 80));
  const vzRow = vzW.document.getElementById('version');
  // Seit 0.23.0 ein SVG und kein Bild -- es muss die Schemavariablen lesen.
  const vzMark = vzRow?.querySelector('svg.logo');
  check('Die Versionszeile traegt das Zeichen davor', !!vzMark, vzRow?.innerHTML.slice(0, 160));
  check('Und zwar aus demselben Helfer wie ueberall sonst',
    vzMark?.querySelectorAll('path').length === 4,
    `${vzMark?.querySelectorAll('path').length} Striche`);
  /* aria-hidden UND KEIN TITEL: das Zeichen steht unmittelbar neben dem Namen
     der Instanz, und ein Vorleseprogramm saegte ihn sonst zweimal. Bis 0.22.1
     war das alt="" am Bild. */
  check('Es sagt nichts vor — der Name steht daneben',
    vzMark?.getAttribute('aria-hidden') === 'true' && !vzMark?.getAttribute('title')
      && !vzMark?.querySelector('title'),
    JSON.stringify([vzMark?.getAttribute('aria-hidden'), vzMark?.getAttribute('title')]));
  check('Der Name der Instanz steht weiterhin in der Zeile',
    /^Kriterion \d/.test((vzRow?.textContent || '').trim()), vzRow?.textContent);
  /* DIE GROESSE STEHT IM STYLESHEET UND IN em: die Zeile laeuft auf .67rem,
     und die Instanz stellt die Schrift von 80 bis 120 Prozent. Eine feste
     Pixelzahl bliebe stehen, waehrend die Schrift daneben mitwaechst. */
  check('Die Groesse steht im Stylesheet und waechst mit der Schrift',
    /\.version-row \.logo \{ height: [\d.]+em; \}/.test(css123),
    (css123.match(/\.version-row \.logo \{[^}]*\}/) || ['(keine Regel)'])[0]);
  vzW.close();

  /* 2h ist ein TELEFONBEFUND und kein Desktopbefund: auf der Anmeldeseite
     drueckt der Flex-Aufbau von body.login die Zeile ohnehin ans untere
     Ende, die 26 Pixel und der Streifen fuer den Home-Indikator kommen
     obendrauf. Im angemeldeten Bereich bleibt alles, wie es war. */
  const ruleAnm = (css123.match(/body\.login \.version-row \{[^}]*\}/) || [''])[0];
  check('Der Abstand darunter faellt nur auf der Anmeldeseite kleiner aus',
    /margin-bottom: calc\(\d+px \+ env\(safe-area-inset-bottom\)\)/.test(ruleAnm),
    ruleAnm || '(keine Regel)');
  check('Und die Zeile im Allgemeinen behaelt ihre 26 Pixel',
    /margin-bottom: calc\(26px \+ env\(safe-area-inset-bottom\)\)/.test(regel123('.version-row')),
    regel123('.version-row').slice(0, 200));
  /* DER STREIFEN BLEIBT: er ist kein Abstand, sondern die Flaeche, in der das
     Telefon seinen eigenen Balken zeichnet. Ohne ihn saesse die Zeile
     darunter. */
  check('Der Streifen fuer den Home-Indikator bleibt dabei erhalten',
    /env\(safe-area-inset-bottom\)/.test(ruleAnm), ruleAnm);
  check('Und der neue Abstand ist wirklich kleiner als der alte',
    Number((ruleAnm.match(/calc\((\d+)px/) || [0, 99])[1]) < 26, ruleAnm);

  /* ================= Die Beschriftungen stehen oben — 0.13.1 ===========
     DER BEFUND KAM AUS DEM BETRIEB UND WAR EIN BILD: bei aufgeklappter
     Tagwolke sanken "TAGS", der Und/Oder-Umschalter und "weniger" in die
     Mitte des Blocks und standen neben nichts. `align-items: center` mittelt
     ueber die GANZE Hoehe der Zeile, und eine Filterzeile ist seit den Tags
     nicht mehr verlaesslich einzeilig.
     GEMESSEN WIRD HIER NICHT. jsdom rechnet kein Layout, jede Hoehe ist dort
     null; die 32 / 36 / 59 px davor und die unter einem Pixel danach sind in
     Chromium bei 80, 100 und 120 Prozent Schrift genommen und stehen im
     Aenderungsprotokoll 0.13.1.
     WAS DIESER LAUF PRUEFEN KANN, ist die Regel im Stilblatt -- und den
     Gegenstand, an dem sie ueberhaupt wirkt: dass die vier Kaesten
     Geschwister EINER Zeile sind. Eine Regel ohne diesen Gegenstand waere
     gruen fuer nichts (Stolperstein 81). */
  group('Die Beschriftungen stehen oben — 0.13.1');

  /* Ein gesetzter Tag ist noetig, damit "zuruecksetzen" dasteht: OHNE ihn gibt
     es den Kasten .frow-right in dieser Prueflage gar nicht, denn "mehr"
     haengt an begrenzeWolke() -- und die steigt in jsdom mangels Hoehe
     ausdruecklich aus. Die Pruefung darunter waere dann eine ueber nichts. */
  const obDom = buildDom(JSDOM, {
    tags: [{ id: 41, name: 'Alu', usage_count: 3 }, { id: 42, name: 'Stahl', usage_count: 2 }],
    settings: { filters: { tagIds: [41] } } });
  const obW = obDom.w;
  await new Promise(r => setTimeout(r, 80));
  const obTagRow = [...obW.document.querySelectorAll('#filters .frow')]
    .find(z => z.querySelector('.eyebrow')?.textContent === 'Tags');
  const obKind = (choice) => obTagRow && [...obTagRow.children].some(k => k.matches(choice));
  check('Die Tagzeile steht da', !!obTagRow, '(keine Tagzeile)');
  check('Beschriftung, Umschalter, Wolke und Verweise sind Geschwister EINER Zeile',
    obKind('.eyebrow') && obKind('.tagmode') && obKind('.pills.cloud') && obKind('.frow-right'),
    [...(obTagRow?.children || [])].map(k => k.className).join(' | '));
  obW.close();

  /* Die Regel selbst. Zwei Fassungen von `.frow` stehen im Stilblatt: die
     allgemeine und die des schmalen Schirms -- gepruefft werden beide, denn
     der schmale Schirm ordnet in einer Spalte an und darf von dieser Runde
     gar nicht beruehrt werden. */
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
  /* UMGEDREHT MIT 0.28.1 UND NICHT GELOESCHT (Stolperstein 74). Der schmale
     Schirm hat seit 0.12.1 seine eigene Anordnung, und das ist geblieben --
     nur ist es nicht mehr die SPALTE. Eine Spalte gab jeder Beschriftung eine
     eigene Zeile; gemessen am Telefon des Betreibers waren fuenf davon 90
     Pixel Schrift und 69 Pixel Abstand, ZWEIUNDVIERZIG PROZENT des Kastens.
     Ein Raster mit `auto` in der ersten Spalte stellt die Beschriftung wieder
     DANEBEN und nimmt nur, was das laengste Wort braucht.
     DIE AUSSAGE BLEIBT DIESELBE: der schmale Schirm ordnet anders an als der
     breite. GEFRAGT WIRD AUCH DAS GEGENTEIL -- ohne „keine Spalte mehr" bliebe
     die Zeile gruen, wenn jemand beides nebeneinander stehen liesse. */
  check('Der schmale Schirm behaelt seine eigene Anordnung — seit 0.28.1 ein Raster',
    /display: grid/.test(obFrow[1] || '')
    && /grid-template-columns: auto minmax\(0, 1fr\)/.test(obFrow[1] || '')
    && !/flex-direction: column/.test(obFrow[1] || ''), obFrow[1] || '(keine Regel)');
  /* KEIN NACHGEBESSERTER INNENABSTAND. Der naheliegende zweite Weg waere
     `align-items: flex-start` plus ein Innenabstand, der den Groessenunterschied
     zwischen Beschriftung und Pille ausgleicht -- also eine ausgerechnete Zahl.
     Die kann bei 80 bis 120 Prozent Schrift nur falsch werden; das war Befund A
     aus 0.12.1. Diese Zeile haelt den Weg zu. */
  const obAfter = ['.frow > .eyebrow', '.frow-right', '.frow > .eyebrow-with']
    .filter(r => /align-self|padding-top|margin-top/.test(regel123(r)));
  check('Keine der Zeilen bessert die Ausrichtung mit einer Zahl nach',
    obAfter.length === 0, obAfter.map(r => regel123(r)).join(' | ') || '(keine)');

  /* ================= Der angepinnte Rahmen schliesst — 0.13.2 ==========
     DER BEFUND WAR EIN BILD AUS DEM BETRIEB: eine angepinnte Notiz stand in
     drei goldenen Kanten und einer grauen da. `.cmt.pinned` faerbte oben,
     rechts und unten; die linke Kante blieb auf dem `--line` der Grundregel.
     DER KOMMENTAR IM STILBLATT SAGTE SEIT 0.12.3 DAS GEGENTEIL -- "bei ihr
     wird der ganze Rahmen golden". Ein Kommentar ist keine Pruefung, und
     zweieinhalb Runden lang hat niemand nachgesehen (Stolperstein 199).
     GEMESSEN WIRD HIER NICHT, sondern in Chromium: jsdom rechnet keine
     Kaskade ueber mehrere Klassen, und die Farbwerte stehen im
     Aenderungsprotokoll 0.13.2. Dieser Lauf prueft die Regeln im Stilblatt
     und den Gegenstand: dass die Oberflaeche Art und Anpinnung wirklich als
     zwei getrennte Klassen an denselben Kasten haengt. */
  group('Der angepinnte Rahmen schliesst — 0.13.2');

  /* ERST DER GEGENSTAND (Stolperstein 81): ohne die vier Klassen an EINEM
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

  /* DIE EIGENTLICHE AENDERUNG: alle vier Kanten, nicht drei. Geprueft wird
     nicht auf den Wortlaut `border-color`, sondern auf die Wirkung -- vier
     gefaerbte Kanten. Eine Regel, die sie einzeln aufzaehlt, ist genauso
     richtig. */
  const arPin = regel123('.cmt.pinned');
  const arSides = ['top', 'right', 'bottom', 'left'];
  const arCovered = (rule) => /border-color:/.test(rule)
    || arSides.every(s => new RegExp(`border-${s}-color:`).test(rule));
  check('Die angepinnte Notiz bekommt alle vier Kanten',
    arCovered(arPin), arPin || '(keine Regel)');
  check('Und zwar in Gold', /--gold-line/.test(arPin), arPin || '(keine Regel)');

  /* JEDE ART HOLT SICH IHRE LINKE KANTE AUSDRUECKLICH ZURUECK, und das ist
     keine Doppelung ohne Grund: `.cmt.bericht` und `.cmt.pinned` tragen BEIDE
     zwei Klassen. Bei gleicher Spezifitaet entscheidet die Reihenfolge, und
     die Anpinnung steht spaeter. Ohne die Wiederholung bekaeme ein
     angepinnter Bericht eine goldene linke Kante -- die zwei Farben an einem
     Kasten, die 0.12.3 abgeschafft hat. */
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
     gepruefft. Zoege jemand `.cmt.pinned` nach oben, waeren die drei
     Wiederholungen ueberfluessig -- und die Pruefung darueber bliebe gruen,
     ohne dass noch jemand wuesste, warum sie dasteht. */
  check('Die Anpinnung steht im Stilblatt HINTER den drei Arten',
    css123.indexOf('.cmt.pinned {') > css123.indexOf('.cmt.report {'),
    `pinned bei ${css123.indexOf('.cmt.pinned {')}, bericht bei ${css123.indexOf('.cmt.report {')}`);

  /* ================= Die Aussage an der Marke — 0.14.0 =================
     Aus dem Haekchen "abgelehnt" wird ein Satz: WANN, WARUM und VON WEM.
     JEDES DER DREI DARF FEHLEN, und die Lagen unterscheiden sich gerade
     darin -- eine Ablehnung aus einer Instanz vor 0.14.0 hat keines davon, ein
     Grund ist freiwillig, und ein Zugang kann entfernt worden sein. Eine
     Prueflage mit lauter vollstaendigen Angaben koennte die Zusage
     "zusammengesetzt wird aus dem, was da ist" gar nicht tragen. */
  group('Die Aussage an der Marke — 0.14.0');

  /* Die Zahl der Zugaenge ist ein PARAMETER und keine Konstante: die Gruppe
     braucht beide Lagen -- mit mehreren Zugaengen steht der Name in der
     Aussage, mit einem einzigen nicht. Vorgabe drei, weil das der Regelfall
     dieser Gruppe ist. */
  const amState = async (rejection, userCount = 3) => {
    const d = buildDom(JSDOM, { hash: '#/item/1', rejection,
      settings: { filters: null, userCount } });
    await new Promise(r => setTimeout(r, 80));
    return d;
  };
  const amText = (d) => d.w.document.getElementById('rej-badge');
  const amField = (d) => d.w.document.getElementById('rej-reason');
  const amRow = (d) => d.w.document.getElementById('rej-reason-row');
  /* SEIT 0.15.0 TRAEGT DIE ZEILE AUCH DIE ZEICHEN ✎ und ✕ -- der Satz selbst
     steht in einer eigenen Spanne. Wer hier `rej-badge`.textContent
     vergliche, verglichenen den Satz SAMT der beiden Zeichen und muesste sie
     in jede Erwartung schreiben. */
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
    /* DAS FELD IST IM RUHEZUSTAND ZU, seit 0.15.0. Bis dahin stand es offen
       daneben und wiederholte, was die Aussage schon sagte -- dieselbe Sache
       zweimal. Es kommt auf Klick zurueck; das steht in der Gruppe zu 0.15.0.
       DIE ZUSAGE "nicht hinter einem Aufklappen" GILT WEITER fuer die Stelle
       im Aufbau: kein <details>, kein eingeklappter Block darueber -- nur der
       eigene Schalter entscheidet, ob es dasteht. */
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
    /* SIE BLEIBT NUR WEG, WENN AUCH KEIN ZEICHEN DASTEHT. Ohne Datum, ohne
       Namen und ohne Grund gaebe es sonst nur "Abgelehnt" -- dasselbe, was
       der Schalter darueber schon sagt. Wer schreiben darf, sieht seit
       0.15.0 trotzdem das ✎: sonst gaebe es gar keinen Weg mehr in das Feld.
       Hier darf niemand: der Eintrag gehoert bert, und isAdmin steht aus. */
    const dWithout = buildDom(JSDOM, { hash: '#/item/1',
      rejection: { at: null, reason: null, author: null },
      settings: { filters: null, userCount: 3, isAdmin: false } });
    await new Promise(r => setTimeout(r, 80));
    check('Ist gar nichts bekannt und darf niemand schreiben, bleibt die Zeile weg',
      amText(dWithout)?.hidden === true,
      JSON.stringify([amText(dWithout)?.hidden, amText(dWithout)?.textContent]));
    check('Und das Feld steht dort ebenso wenig offen',
      amRow(dWithout)?.hidden === true, JSON.stringify(amRow(dWithout)?.hidden));
    d.w.close(); dWithout.w.close();
  }

  /* --- BEI GENAU EINEM ZUGANG FAELLT DER NAME WEG ---
     DIE FRAGE AN JEDE NEUE GRUPPE: welcher Schalter bleibt hier durchweg aus,
     und traegt er etwas zur Sache bei? Hier ist es `mehrereBenutzer()` -- und
     er traegt: mit einem einzigen Zugang saende „von pruefer" nichts, wie an
     jeder anderen Verfasserangabe auch.
     DATUM UND GRUND BLEIBEN TROTZDEM STEHEN. Sie sind der Inhalt der
     Entscheidung und keine Angabe ueber eine Person; faellt die ganze Zeile
     weg, verliert eine Instanz mit einem Zugang genau das, wofuer diese Runde
     gebaut ist. */
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
    await new Promise(r => setTimeout(r, 40));
    const outCore = d.sent.filter(x => x.method === 'PUT' && x.url === '/api/items/1').pop();
    check('Ein Ausschalten schickt nur das Merkmal',
      equal(Object.keys(outCore?.body || {}), ['rejected']) &&
      outCore?.body?.rejected === false, JSON.stringify(outCore?.body));
    check('Und Marke wie Feld verschwinden danach',
      amText(d)?.hidden === true && amRow(d)?.hidden === true,
      JSON.stringify([amText(d)?.hidden, amRow(d)?.hidden]));
    /* WIEDER EINSCHALTEN: die alte Begruendung geht MIT hinaus. Ohne dieses
       Feld finge jede erneute Ablehnung mit einer leeren Zeile an -- und die
       Angabe, die beim Zuruecknehmen ausdruecklich stehen geblieben ist,
       waere damit doch weg. */
    button.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const inCore = d.sent.filter(x => x.method === 'PUT' && x.url === '/api/items/1').pop();
    check('Ein Einschalten nimmt die alte Begruendung als Vorschlag mit',
      inCore?.body?.rejected === true && inCore?.body?.rejectedReason === 'Alte Begründung',
      JSON.stringify(inCore?.body));
    /* SEIT 0.15.1 STEHT SIE DANACH IN DER AUSSAGE UND NICHT IM FELD. Das Feld
       ist nur offen, solange KEIN Grund dasteht -- und hier steht einer. Die
       Zusage „die alte Begruendung geht nicht verloren" ist damit nicht
       aufgegeben, sondern eingeloest: sie steht sichtbar da und laesst sich
       ueber das ✎ aendern. */
    check('Und sie steht danach in der Aussage, nicht im Feld',
      /— Alte Begründung$/.test(amSentence(d)?.textContent || '') && amRow(d)?.hidden === true,
      JSON.stringify([amSentence(d)?.textContent, amRow(d)?.hidden]));

    // Der Grund selbst: getippt, Feld verlassen, und erst dann geht er hinaus.
    // Aufgemacht wird es dafuer ueber das ✎ -- offen ist es hier nicht mehr.
    amPen(d).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const before = d.sent.length;
    amField(d).value = 'Preis zu hoch';
    amField(d).dispatchEvent(new w.FocusEvent('blur'));
    await new Promise(r => setTimeout(r, 40));
    const reasonCore = d.sent.filter(x => x.method === 'PUT' && x.url === '/api/items/1').pop();
    check('Der getippte Grund geht beim Verlassen des Feldes hinaus',
      d.sent.length > before && equal(Object.keys(reasonCore?.body || {}), ['rejectedReason']) &&
      reasonCore?.body?.rejectedReason === 'Preis zu hoch', JSON.stringify(reasonCore?.body));
    check('Und die Marke sagt danach den neuen Satz',
      /— Preis zu hoch$/.test(amSentence(d)?.textContent || ''), JSON.stringify(amSentence(d)?.textContent));
    /* UNVERAENDERT WIRD NICHT GESCHICKT: sonst schoebe jedes Anklicken den
       Eintrag ueber updated_at in jeder Uebersicht nach oben.
       DAS FELD IST INZWISCHEN ZU -- geoeffnet wird es hier wieder ueber das
       ✎, damit das Verlassen ueberhaupt etwas zu verlassen hat. */
    amPen(d).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const vorIdle = d.sent.length;
    amField(d).dispatchEvent(new w.FocusEvent('blur'));
    await new Promise(r => setTimeout(r, 40));
    check('Ein unveraendertes Feld schickt gar nichts',
      d.sent.length === vorIdle, JSON.stringify(d.sent.slice(vorIdle)));
    w.close();
  }

  /* --- IN DER KACHELANSICHT BLEIBT DIE MARKE, WIE SIE IST. Ein Grund gehoert
     an den Eintrag und nicht in eine Kachelreihe; wer ihn dort hineinschreibt,
     baut eine zweite Anzeige derselben Sache. --- */
  {
    const d = buildDom(JSDOM, { hash: '#/', settings: { filters: null, userCount: 3 },
      overviewItems: [{ id: 1, title: 'Beispiel', rejected: true, tested: false, favorite: false,
        category: null, tags: [], mainPhoto: null, photoCount: 0, linkCount: 0, avgRating: 3,
        testCount: 0, testAvg: null, testLast: null, updated_at: '2026-08-01 10:00:00' }] });
    await new Promise(r => setTimeout(r, 80));
    const card = d.w.document.querySelector('.card');
    check('Die Kachel traegt weiterhin die Marke "abgelehnt"',
      card?.querySelector('.badge-rejected')?.textContent === 'abgelehnt',
      JSON.stringify(card?.querySelector('.badge-rejected')?.textContent));
    check('Und sonst nichts zur Ablehnung',
      !/Abgelehnt am|Lieferzeit|rej-badge/.test(card?.innerHTML || ''),
      (card?.innerHTML || '').slice(0, 200));
    d.w.close();
  }

  /* ================= Die Sternreihe steht auf einer Linie — 0.14.0 =====
     DER BEFUND WAR EIN BILD AUS DEM BETRIEB: in der Kriterienliste eines
     Eintrags begannen die Sternreihen nicht an derselben Stelle. Eine Zeile,
     die noch niemand bewertet hat, traegt rechts keine Zahl, und ihre Sterne
     rutschten nach rechts; eine Zeile mit einer LANGEN Zahl schob ihre nach
     links.
     DIE URSACHE STAND SEIT LANGEM IM STILBLATT: `min-width: 52px` an
     `.rrow .ravg`. Die Absicht war richtig, die ZAHL war falsch -- eine feste
     Pixelzahl in einer Instanz, die ihre Schrift von 80 bis 120 Prozent
     stellt. Dasselbe Muster wie Befund A aus 0.12.1 (`right: 92px`) und wie
     die Ausrichtung, die 0.13.1 in Ordnung gebracht hat.
     GEMESSEN WIRD HIER NICHT, sondern in Chromium: in jsdom ist jede Breite
     null, und eine Probe, die dort misst, waere gruen ueber nichts. Die
     Zahlen stehen im Aenderungsprotokoll 0.14.0. Dieser Lauf sichert die
     Regel im Stilblatt und den AUFBAU -- dass die Oberflaeche die drei
     Stuecke einer Zeile wirklich als Zellen EINES Rasters haengt. */
  group('Die Sternreihe steht auf einer Linie — 0.14.0');

  /* ERST DER GEGENSTAND (Stolperstein 81): ohne die beiden schwierigen Zeilen
     traegt keine Regel darunter einen Fall, auf den sie zutraefe. Die
     Prueflage braucht eine Zeile OHNE Bewertung und eine mit LANGER Zahl --
     sind alle Zahlen gleich lang, kann sie den Fehler gar nicht tragen
     (Stolperstein 189). */
  const slDom = buildDom(JSDOM, { hash: '#/item/1',
    settings: { filters: null, userCount: 3, isAdmin: true } });
  await new Promise(r => setTimeout(r, 80));
  const slDoc = slDom.w.document;
  const slBox = slDoc.getElementById('ratings');
  const slRows = [...(slBox?.querySelectorAll('.rrow') || [])];
  const slNumbers = slRows.map(z => z.querySelector('.ravg')?.textContent ?? '(keine Zelle)');
  check('Die Prueflage traegt drei Kriterienzeilen',
    slRows.length === 3, `${slRows.length}`);
  /* UMGEDREHT MIT 0.21.0 (Stolperstein 74): bis 0.20.1 stand hier `=== ''`
     -- die Zelle war da und leer. Seit dieser Runde traegt sie einen STRICH.
     Die Zusage dahinter ist unveraendert: die Zelle ist da, auch wo niemand
     bewertet hat. Was sich geaendert hat, ist ihr Inhalt, und der Grund steht
     in der Gruppe „Die Sternzeile — 0.21.0". */
  check('Eine davon hat keine Bewertung und traegt trotzdem ihre Zelle',
    slNumbers[2] === '–', JSON.stringify(slNumbers));
  check('Und eine traegt eine dreistellige Stimmenzahl',
    /\(\d{3}\)$/.test(slNumbers[1] || ''), JSON.stringify(slNumbers));
  check('Die beiden Zahlen sind wirklich verschieden lang',
    (slNumbers[0] || '').length !== (slNumbers[1] || '').length, JSON.stringify(slNumbers));

  /* DER AUFBAU. Die Spalte kann sich nur dann an ihrer breitesten Zelle
     ausrichten, wenn alle Zellen im SELBEN Raster liegen: der KASTEN traegt
     es, die Zeile wird zu display: contents, und die drei Stuecke sind
     direkte Kinder der Zeile. Steckte .ravg wieder in .racts, waere sie nur
     so breit wie ihr eigener Inhalt -- und der Fehler waere zurueck, ohne
     dass eine Regel im Stilblatt sich geaendert haette. */
  check('Der Kasten der Kriterienliste traegt das Raster',
    slBox?.classList.contains('rlist'), JSON.stringify(slBox?.className));
  const slChildren = slRows.map(z => [...z.children].map(k => k.className));
  /* VIER SEIT 0.22.0 (E15): der Ruecksetzer bekommt seine eigene vierte Zelle
     `.rreset-cell` rechts neben der Zahl. Umgedreht, nicht geloescht (Stolperstein 74). */
  check('Jede Zeile haengt Name, Sterne, Zahl und Ruecksetzer als vier direkte Kinder — 0.22.0',
    slChildren.every(k => k.length === 4 && k[0] === 'rname' && k[1] === 'racts' && k[2] === 'ravg' && k[3] === 'rreset-cell'),
    JSON.stringify(slChildren));
  check('Die Zahl steckt ausdruecklich NICHT mehr in den Sternen',
    slRows.every(z => !z.querySelector('.racts .ravg')),
    JSON.stringify(slRows.map(z => !!z.querySelector('.racts .ravg'))));
  /* UMGEDREHT MIT 0.21.0 (Stolperstein 74), und der Satz davor bleibt stehen
     (Stolperstein 201): bis 0.20.1 hiess die Zeile „Die leere Zelle bleibt
     leer und bekommt keinen Ersatztext", mit der Begruendung, neben fuenf
     leeren Sternen waere „noch keine Bewertung" dieselbe Aussage zweimal.
     DAS GILT FUER EINEN SATZ. Ein STRICH ist keiner, sondern der Platz, der
     der Zahl gehoert -- und er sagt „noch niemand" (seit 0.22.0 „Noch nicht
     bewertet", Anlage C). Der Klartext steht wie an der Zahl daneben im
     `title`: ein Zeichen allein liest kein Vorleseprogramm vor. */
  check('Die leere Zelle traegt einen Strich und den Klartext dazu',
    slNumbers[2] === '–' && slRows[2]?.querySelector('.ravg')?.title === 'Noch nicht bewertet',
    JSON.stringify([slNumbers[2], slRows[2]?.querySelector('.ravg')?.title]));
  /* UND KEINEN SATZ. Die Verneinung von damals gilt weiter und wird deshalb
     weiter geprueft -- nur an dem, was sie wirklich meinte. */
  check('Und ausdruecklich keinen Satz',
    (slNumbers[2] || '').length === 1, JSON.stringify(slNumbers[2]));
  slDom.w.close();

  /* DIE REGELN IM STILBLATT. Gepruefft wird die Wirkung und nicht der
     Wortlaut: ein Raster ueber drei Spalten, eine Zeile ohne eigenen Kasten,
     und an der Zahlenspalte KEINE Breite mehr.
     SEIT 0.17.0 GILT DIE DREI NUR NOCH DER ALLGEMEINEN REGEL -- bei einem
     einzigen Zugang sind es zwei Spalten, und das steht eine Gruppe weiter. */
  const slList = regel123('.rlist'), slRow = regel123('.rrow'), slAvg = regel123('.rrow .ravg');
  /* MITGENOMMEN MIT 0.17.0 (Stolperstein 201): diese Zeile hiess „ist ein
     Raster ueber drei Spalten" und war ab dieser Runde nur noch die halbe
     Wahrheit -- bei genau EINEM Zugang sind es zwei. Drei Spalten gelten der
     ALLGEMEINEN Regel; die zweite Regel und die Bedingung dahinter stehen in
     der Gruppe „Das Raster der Kriterienliste zaehlt seine Zellen". */
  check('Die allgemeine Regel der Kriterienliste ist ein Raster ueber drei Spalten',
    /display: grid/.test(slList) && /grid-template-columns: 1fr auto auto/.test(slList),
    slList || '(keine Regel)');
  check('Die Zeile ist kein eigener Kasten mehr, sondern gibt ihre Zellen frei',
    /display: contents/.test(slRow), slRow || '(keine Regel)');
  /* UMGEDREHT MIT 0.21.0 (Stolperstein 74). Bis 0.20.1 stand hier: „keine
     Zahl mehr an der Spalte, weder eine Mindestbreite noch irgendein anderes
     festes Mass -- die Spalte misst sich an ihrer breitesten Zelle." Der Satz
     stimmte fuer sich und uebersah den Fall, in dem die Liste GAR KEINE Zahl
     traegt: dann ist die Spalte null Pixel breit, und der erste Stern laesst
     sie aufgehen.
     SEIT DIESER RUNDE GILT BEIDES: die Spalte misst sich weiter an ihrer
     breitesten Zelle, faellt aber nicht mehr unter die Hausform „⌀ 4,2 (9)".
     GEMESSEN UND NICHT GESCHAETZT: 65,03 px bei Schriftstufe 100 (Wurzelschrift
     15) und 77,98 px bei 120 (Wurzelschrift 18), in der Festbreitenschrift in
     Chromium -- 65,03 / 15 = 4,335, also 4,34rem. Die 9 px Innenabstand kommen
     dazu, weil box-sizing global auf border-box steht. */
  check('Die Zahlenspalte traegt wieder eine Mindestbreite -- und zwar eine gemessene',
    /min-width: calc\(4\.34rem \+ 9px\)/.test(slAvg), slAvg || '(keine Regel)');
  /* IN rem UND NICHT IN PIXELN, und das ist der Kern: die Instanz stellt ihre
     Schrift von 80 bis 120 Prozent. Eine feste Pixelzahl reichte bei 120
     nicht mehr -- dieselbe Ueberlegung wie beim Deckel der Sicherungsliste
     (13.98rem, 0.20.1). Der Innenabstand bleibt in Pixeln: er ist ein Abstand
     und keine Ausrichtung. */
  check('Und sie steht in rem, damit sie der Schriftstufe folgt',
    /min-width:[^;]*rem/.test(slAvg) && !/min-width: *\d+px/.test(slAvg),
    slAvg || '(keine Regel)');
  /* DIE GEGENPROBE ZUR REGEL: dass ueberhaupt noch eine Regel dasteht. Ohne
     sie waeren die beiden Verneinungen darueber gruen an einer Zeile, die es
     gar nicht mehr gibt (Stolperstein 81). */
  check('Es gibt die Regel ueberhaupt noch, und sie faerbt die Zahl gedaempft',
    /var\(--muted\)/.test(slAvg) && /var\(--mono\)/.test(slAvg), slAvg || '(keine Regel)');

  /* DIE TRENNLINIE IST DER PREIS DES RASTERS und deshalb geprueft: eine Zeile
     mit display: contents ist kein Kasten mehr und kann keine tragen. Sie
     wird an den ZELLEN gezogen, und die letzte Zeile bekommt keine. */
  check('Die Trennlinie wird an den Zellen gezogen, nicht an der Zeile',
    /border-bottom: 1px solid var\(--line-2\)/.test(regel123('.rrow > \\*')) &&
    !/border-bottom: 1px solid/.test(slRow),
    `${regel123('.rrow > \\*') || '(keine Zellregel)'} || ${slRow}`);
  check('Und die letzte Zeile bekommt keine',
    /border-bottom: none/.test(regel123('.rrow:last-of-type > \\*')),
    regel123('.rrow:last-of-type > \\*') || '(keine Regel)');
  /* UND KEIN SPALTENABSTAND AM RASTER: er risse die Trennlinie in Stuecke.
     Der Abstand sitzt als Innenabstand IN den Zellen -- nachgemessen in
     Chromium, die Zellkanten stossen ohne Luecke aneinander. */
  check('Das Raster traegt keinen Spaltenabstand -- die Linie bliebe sonst zerrissen',
    !/gap/.test(slList), slList || '(keine Regel)');

  /* DER BLICK DANEBEN. Dieselbe Spalte gibt es in der Ansicht "Wer hat
     bewertet" und im Vergleich -- eine halb behobene Ausrichtung waere
     schlechter als eine benannte. NACHGESEHEN UND VERNEINT: der Vergleich
     stellt seine Werte rechtsbuendig und hat gar nichts, was von ihnen
     geschoben wuerde; "Wer hat bewertet" traegt keine Durchschnittsspalte,
     dort steht der Name ueber den Stimmen. Keine der beiden Regeln traegt
     eine feste Breite. */
  const slForeign = ['.cmp-crit', '.vote-row .rname', '.rvotes', '.rvote']
    .filter(r => /min-width|max-width|width:/.test(regel123(r)));
  check('Weder Vergleich noch Stimmliste tragen dasselbe Muster',
    slForeign.length === 0, slForeign.map(r => regel123(r)).join(' | ') || '(keine)');
  check('Und die Stimmliste hat gar keine Durchschnittsspalte',
    !/\.vote-row[^{]*\.ravg/.test(css123) &&
    !/zeile\.className = 'vote-row'[\s\S]{0,600}ravg/.test(arSource),
    'ravg taucht in der Stimmliste auf');

  /* ================= Das Raster zaehlt seine Zellen — 0.17.0 ===========
     DER BEFUND KAM AUS DEM BETRIEB UND KEINE PRUEFUNG KONNTE IHN SEHEN. Das
     Raster stand fest auf drei Spalten, die Durchschnittszelle haengt
     drawRatings() aber nur bei mehreren Zugaengen an. Bei EINEM Zugang liefert
     jede Zeile damit zwei Zellen in ein Dreispaltenraster, und die
     Selbstanordnung schiebt alles um eine Spalte weiter: Name, Sterne,
     naechster Name in einer Reihe.
     SICHTBAR GEWORDEN IST DAS ERST MIT DEN GEWICHTSMARKEN aus 0.16.0, die die
     Namensspalte breiter machen -- der Fehler ist aelter, das Raster kam mit
     0.14.0 und die bedingte Zelle gibt es seit 0.8.91.
     WARUM IHN NIEMAND SAH: die Gegenlage mit EINEM Zugang gab es -- eSingle
     zeichnet die Liste seit 0.8.91 mit benutzerZahl 1 --, aber sie trug genau
     zwei Zusagen: die Durchschnittsspalte bleibt weg, und die Sternzeilen
     stehen trotzdem vollstaendig da. Beide blieben im kaputten Zustand gruen.
     Die Zelle war weg, richtig gefragt; die Spalte, in die sie gehoerte, blieb
     stehen, nie gefragt. Alle uebrigen Lagen fahren mit benutzerZahl 3, also
     genau in der Lage, in der das Raster aufgeht.
     DIESE GRUPPE PRUEFT DESHALB MEHR ALS DEN FEHLER: sie zaehlt die Zellen JE
     ZEILE und die Spalten des Rasters und haelt fest, dass beide Zahlen
     zusammenpassen -- in BEIDEN Lagen. Eine Gruppe, die nur den einen Fall
     ansaehe, waere dieselbe Blindheit mit umgekehrtem Vorzeichen.
     UND SIE LIEST NICHT BLOSS DIE KLASSE (Stolperstein 223): die Zellen
     kommen als echte Kindknoten aus dem Aufbau, die Spalten aus der Regel im
     Stilblatt, die auf genau diese Klassen zutrifft. Ein Rueckbau, der die
     Klasse setzt und die Regel wegnimmt, wird damit trotzdem rot. */
  /* ================= Die Sternzeile — 0.21.0 =================
     Drei Dinge an derselben Zeile, und sie gelten in beiden Kaesten: das ×
     hinter den fuenf Sternen, der Strich in der leeren Durchschnittszelle und
     der kurze Kopf. Die Mindestbreite dahinter steht in der Gruppe darueber,
     wo sie hingehoert -- sie ist eine Regel im Stilblatt. */
  group('Die Sternzeile — 0.21.0');

  {
    const szDom = buildDom(JSDOM, { hash: '#/item/1',
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
    const szDoc = szDom.w.document;
    const szRows = [...szDoc.querySelectorAll('#ratings .rrow')];
    /* ERST DER GEGENSTAND (Stolperstein 81): die Prueflage braucht eine Zeile
       MIT eigenem Stern und eine OHNE -- sonst kann sie den Unterschied
       zwischen sichtbar und unsichtbar gar nicht tragen. Die Vorgabe des
       Mocks gibt allen dreien den eigenen Wert 3; die dritte wird hier
       ausdruecklich auf 0 gestellt. */
    const szNull = buildDom(JSDOM, { hash: '#/item/1', ownValues: [3, 3, 0],
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
    const szNullRows = [...szNull.w.document.querySelectorAll('#ratings .rrow')];

    /* UMGEDREHT MIT 0.22.0 (E15): das × in der Sternreihe ist der runde
       Ruecksetzer `.rzurueck` in der eigenen vierten Zelle `.rzz` geworden.
       Die Zusagen von 0.21.0 gelten fuer ihn weiter und haengen jetzt dort. */
    check('Der Ruecksetzer steht in jeder Sternzeile mit Ruecksetzer im Dokument — 0.22.0',
      szRows.length === 3 && szRows.every(z => !!z.querySelector('.rreset-cell .rreset')),
      JSON.stringify(szRows.map(z => !!z.querySelector('.rreset-cell .rreset'))));
    /* BEI EINEM EIGENEN STERN SICHTBAR, BEI KEINEM UNSICHTBAR -- und zwar
       ueber eine Klasse, die `visibility` setzt, NICHT ueber `hidden`.
       Der Unterschied ist der ganze Punkt: `hidden` ist `display: none` und
       naehme dem × seinen Platz; die Sterne rutschten dann beim ERSTEN Stern
       nach links -- genau der Sprung, den dieselbe Runde abschafft. */
    check('Bei eigenem Stern ist es sichtbar',
      szRows.slice(0, 2).every(z => !z.querySelector('.rreset')?.classList.contains('blank')),
      JSON.stringify(szRows.map(z => z.querySelector('.rreset')?.className)));
    check('Ohne eigenen Stern ist es unsichtbar, behaelt aber seinen Platz',
      szNullRows[2]?.querySelector('.rreset')?.classList.contains('blank') === true &&
      szNullRows[2]?.querySelector('.rreset')?.hidden === false,
      JSON.stringify([szNullRows[2]?.querySelector('.rreset')?.className,
                      szNullRows[2]?.querySelector('.rreset')?.hidden]));
    /* UND DIE REGEL DAZU IM STILBLATT: `visibility: hidden` und ausdruecklich
       nicht `display: none`. Ohne diese Zeile bliebe die Zusage darueber auch
       dann gruen, wenn die Klasse den Platz doch naehme (Stolperstein 223). */
    const szRule = regel123('.rreset.blank');
    check('Und die Regel nimmt ihm die Sichtbarkeit, nicht seinen Platz',
      /visibility: hidden/.test(szRule) && !/display: none/.test(szRule),
      szRule || '(keine Regel)');
    /* EIN RUNDER KNOPF VON 26 BILDPUNKTEN (E15). Der Platz gehoert ihm auch
       dann, wenn es nichts zu tun gibt. */
    check('Es ist ein runder Knopf von 26 Bildpunkten — 0.22.0',
      /width: 26px; height: 26px; border-radius: 50%/.test(regel123('.rreset')), regel123('.rreset') || '(keine Regel)');
    /* UND AUF DEM FINGER GROESSER, wie die uebrigen Kreuze. Es sitzt
       unmittelbar neben dem fuenften Stern; wer danebentrifft, vergibt fuenf
       Sterne, statt seinen zu entfernen. */
    check('Auf Beruehrungsgeraeten ist die Trefflaeche mindestens 32 Bildpunkte',
      /\.rreset \{ width: 32px; height: 32px/.test(css123),
      (css123.match(/\.rreset \{[^}]*\}/g) || []).join(' | '));

    /* EIN TIPP SCHICKT `PUT` MIT 0 -- UND NICHTS ANDERES. Das ist die
       eigentliche Zusage der Wegnahme: die Sammelroute ist weg, und der Weg,
       der geblieben ist, geht ueber dieselbe Route wie das Setzen. */
    szDom.sent.length = 0;
    szRows[0].querySelector('.rreset')
      .dispatchEvent(new szDom.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
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
    await new Promise(r => setTimeout(r, 60));
    check('Ein Doppelklick auf die Sterne tut nichts mehr',
      szDom.sent.length === 0, JSON.stringify(szDom.sent));
    check('Und die Sternreihe traegt keinen Ueberfahrtext mehr',
      !szRows[1].querySelector('.stars').title,
      JSON.stringify(szRows[1].querySelector('.stars').title));

    /* `stars()` OHNE RUECKSETZER HAT KEIN ×. Die Testtage und jede reine
       Lesestelle rufen ohne -- ein Kreuz, das nichts taete, waere schlimmer
       als keins. */
    const szTest = [...szDoc.querySelectorAll('#tstars .stars, .ttag .stars, .tdrow .stars')];
    check('Eine Sternreihe ohne Ruecksetzer traegt kein ×',
      szTest.length > 0 && szTest.every(t => !t.querySelector('.rreset') && !t.parentElement?.querySelector('.rreset')),
      `${szTest.length} Reihen ohne Ruecksetzer, davon mit Ruecksetzer: ` +
      szTest.filter(t => t.querySelector('.rreset') || t.parentElement?.querySelector('.rreset')).length);

    /* DER KOPF IST KURZ. „Meine Bewertung zuruecksetzen" ist weg -- samt der
       Route dahinter --, und „Wer hat bewertet" hiess ab 0.21.0 „Stimmen".
       SEIT 0.22.0 HEISST ER WIEDER „Wer hat bewertet" (E5): „Stimmen" stand
       auf der Verbotsliste, weil es eine Wahl meint und keine Bewertung. */
    check('Die Kopfzeile traegt keinen Knopf zum Zuruecksetzen mehr',
      !szDoc.getElementById('reset-r') && !szDoc.querySelector('[id$="reset-r"]'),
      JSON.stringify(szDoc.getElementById('reset-r')?.textContent));
    /* „Wer?" SEIT 0.30.0, vorher „Wer hat bewertet" -- Befund 7 (F11).
       GEMESSEN IST DER GRUND: mit „⌀ 4,5 gewichtet" daneben passt ein Knopf bis
       98 px in eine Zeile, ab 127 px bricht sie. „Wer hat bewertet" misst 159,
       „Wer?" deren 67 -- und die Kopfzeile faellt damit von 81 auf 42 px.
       DER SCHLUESSEL BLEIBT `entry.whoRated`: er wechselt seinen Wortlaut und
       nicht seinen Namen, und der Titel des Fensters dahinter
       (`entry.whoRatedWord`) bleibt der ganze Satz -- dort ist Platz. */
    check('Und der Knopf des Admins heisst in beiden Koepfen „Wer?" — 0.30.0',
      szDoc.getElementById('rwho')?.textContent.trim() === 'Wer?' &&
      szDoc.getElementById('pwho')?.textContent.trim() === 'Wer?',
      JSON.stringify([szDoc.getElementById('rwho')?.textContent,
                      szDoc.getElementById('pwho')?.textContent]));

    /* UND DIE ZEILE WIRD AUF DEM TELEFON ZWEIZEILIG. Drei Spalten passen auf
       360 Bildpunkte nicht mehr, seit das × und die Mindestbreite dazugekommen
       sind. Der Name geht ueber die ganze Breite, darunter Sterne und Zahl;
       die Trennlinie liegt unter der ZWEITEN Zeile. */
    const szTel = (css123.match(/@media \(max-width: 700px\), \(max-height: 500px\) and \(max-width: 960px\) \{[\s\S]*/) || [''])[0];
    check('Auf dem Telefon geht der Name ueber die ganze Breite',
      /\.rlist:not\(\.no-average\) \.rrow \.rname \{[^}]*grid-column: 1 \/ -1/.test(szTel),
      (szTel.match(/\.rlist:not\(\.no-average\) \.rrow \.rname \{[^}]*\}/) || ['(keine Regel)'])[0]);
    check('Und die Trennlinie liegt nicht unter ihm, sondern unter der zweiten Zeile',
      /\.rlist:not\(\.no-average\) \.rrow \.rname \{[^}]*border-bottom: none/.test(szTel),
      (szTel.match(/\.rlist:not\(\.no-average\) \.rrow \.rname \{[^}]*\}/) || ['(keine Regel)'])[0]);
    /* BEI EINEM EINZIGEN ZUGANG AENDERT SICH NICHTS -- dort gibt es die
       Durchschnittsspalte gar nicht, also auch keine Mindestbreite, und dem
       Namen bleibt Platz. Der Befund ist der DREISPALTIGE Fall. */
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
    /* ERST DER GEGENSTAND (Stolperstein 81): eine Prueflage mit einem
       Kriterium im Kasten „before" und zweien im Kasten „after". Ohne sie
       truege keine Zusage darunter einen Fall, auf den sie zutraefe -- die
       Vorgabe des Mocks kennt nur Bewertungskriterien.
       DAS VORHER-KRITERIUM STEHT AN DRITTER STELLE, nicht an erster: nur so
       laesst sich sehen, dass der Zeichner nach PHASE filtert und nicht nach
       Position. */
    const zkPhases = ['after', 'after', 'before'];
    /* UND DIE DRITTE ZEILE BEKOMMT EINEN SCHNITT. Die Vorgabe des Mocks laesst
       sie leer -- das ist dort die Lage „ein Kriterium, das niemand bewertet
       hat" --, und ein Rechenweg ueber null Zeilen gibt es nicht: der
       Erklaerknopf stuende gar nicht da. Erst der Gegenstand, dann die Zusage
       (Stolperstein 81). */
    const zkTested = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      voteColumns: [{ avg: 3.4, count: 5 }, { avg: 4.1, count: 128 }, { avg: 4.2, count: 2 }],
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
    const zkDoc = zkTested.w.document;

    /* DER NEUE BLOCK STEHT VOR DEM BEWERTUNGSBLOCK -- geschaetzt wird, bevor
       bewertet wird, und die Anordnung sagt es. */
    const zkNames = [...zkDoc.querySelectorAll('#blocks-side .block[data-block]')]
      .map(b => b.dataset.block);
    check('Der Potenzialblock steht vor dem Bewertungsblock',
      zkNames.indexOf('potenzial') >= 0 &&
      zkNames.indexOf('potenzial') < zkNames.indexOf('bewertung'),
      JSON.stringify(zkNames));

    /* JEDER KASTEN ZEIGT NUR SEINE ZEILEN. Zwei Kaesten mit denselben Zeilen
       waeren dieselbe Sternzeile zweimal, unter zwei verschiedenen
       Kopfzahlen. */
    const zkAfter = [...zkDoc.querySelectorAll('#ratings .rname')].map(e => e.firstChild.textContent.trim());
    const zkVor = [...zkDoc.querySelectorAll('#potential-ratings .rname')].map(e => e.firstChild.textContent.trim());
    check('Der Bewertungskasten zeigt nur seine beiden Zeilen',
      equal(zkAfter, ['Zuerst', 'Dann']), JSON.stringify(zkAfter));
    check('Der Potenzialkasten zeigt nur seine eine',
      equal(zkVor, ['Zuletzt']), JSON.stringify(zkVor));

    /* ZWEI KOPFZAHLEN, ZWEI ERKLAERKNOEPFE. Die Zahlen sind verschieden -- 3
       gegen 4,2 --, sonst koennte die Prueflage eine Vermischung gar nicht
       zeigen (Stolperstein 189). */
    check('Jeder Kasten traegt seine eigene Kopfzahl',
      /⌀ 3,0/.test(zkDoc.getElementById('rhead')?.textContent || '') &&
      /⌀ 4,2/.test(zkDoc.getElementById('phead')?.textContent || ''),
      JSON.stringify([zkDoc.getElementById('rhead')?.textContent,
                      zkDoc.getElementById('phead')?.textContent]));
    /* UND DER ERKLAERKNOPF ZEIGT DEN RECHENWEG SEINES KASTENS. Ohne diese
       Zeile bliebe die Kopfzahl richtig und die Erklaerung dahinter falsch
       (Stolperstein 217). */
    zkDoc.getElementById('pweight-open')?.dispatchEvent(new zkTested.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
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
    /* DIE KURZFASSUNG IST WEG, UND DIE ZAHL STEHT TROTZDEM DA -- 0.22.1 (E4).
       DAS IST DIE UMKEHRUNG DER ZUSAGE, die hier bis 0.22.0 stand: „und der
       zugeklappte Kopf nennt seine Zahl", gemeint war `.bsumme`.
       DER BEFUND, DER SIE UMGEDREHT HAT: die Kurzfassung UND die Kopfzahl
       standen zugleich im selben Kopf und lasen dasselbe Feld -- „(⌀ 4,2)"
       neben „⌀ 4,2 gewichtet", zweimal dieselbe Zahl mit zwei verschiedenen
       Formen. Wer zwei Zahlen nebeneinander sieht, schliesst daraus, dass sie
       zwei Dinge meinen (Stolperstein 318).
       ZWEI HAELFTEN, UND DIE ERSTE ALLEIN BELEGT NICHTS: „keine Kurzfassung"
       waere auch dann gruen, wenn der ganze Kopf leer bliebe. Erst die zweite
       sagt, dass die Zahl nicht verschwunden, sondern nur noch einmal da ist. */
    /* ERST DAS OBJEKT, DANN SEIN INHALT (Stolperstein 81): `?.textContent ||
       ''` waere auch dann leer, wenn es die Kurzfassung gar nicht mehr gaebe —
       und die Zusage bliebe gruen, obwohl der ganze Knoten fehlt. */
    const zkSum = zkDoc.querySelector('.block[data-block="potenzial"] .bsum');
    check('Die Kurzfassung ist als Knoten weiterhin da', !!zkSum,
      JSON.stringify(zkDoc.querySelector('.block[data-block="potenzial"] .block-head')?.innerHTML?.slice(0, 120)));
    check('Der zugeklappte Kopf traegt keine Kurzfassung mehr',
      !!zkSum && zkSum.textContent === '', JSON.stringify(zkSum && zkSum.textContent));
    check('Und die Zahl steht dort trotzdem -- einmal, als Kopfzahl',
      /⌀ 4,2/.test(zkDoc.getElementById('phead')?.textContent || ''),
      JSON.stringify(zkDoc.getElementById('phead')?.textContent));

    /* --- DIE KOPFZAHL SAGT, WESSEN ZAHL SIE IST — 0.22.1 (E5) ---
       DIE FRAGE KAM AUS DEM BETRIEB: „ist das meine Bewertung oder von
       allen?" Es ist der Schnitt ueber alle, die bewertet haben -- die eigenen
       Sterne stehen links in der Zeile. Bis 0.22.0 stand das nirgends: weder
       am Knopf noch im Kasten dahinter.
       OHNE BEDINGUNG AUF DIE ZAHL DER ZUGAENGE: eine Installation mit einem
       einzigen Benutzer bekaeme sonst einen anderen Satz ueber dieselbe
       Rechnung (Stolperstein 47). */
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
    /* UND DER ERKLAERKASTEN SAGT ES AUCH -- am Ort der Erklaerung. Er nannte
       bis 0.22.0 die beiden Schritte und liess offen, ueber WEN der erste
       geht. */
    zkDoc.getElementById('weight-open')?.dispatchEvent(new zkTested.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    const zkErkl = zkDoc.getElementById('calc-modal');
    check('Der Erklaerkasten nennt die Menge, ueber die gerechnet wird',
      /über alle\s+Benutzer/.test(zkErkl?.textContent || ''),
      JSON.stringify((zkErkl?.textContent || '').slice(0, 160)));
    zkErkl?.closest('.backdrop')?.remove();

    /* EIN KLICK AUF DEN KOPF IST EIN BLICK UND KEIN BEFEHL: er klappt auf und
       schickt NICHTS an den Server. Das ist der Unterschied zu jedem anderen
       Block, und er ist der Kern von Abschnitt 4.3. */
    zkTested.sent.length = 0;
    zkDoc.querySelector('.block[data-block="potenzial"] .block-head')
      .dispatchEvent(new zkTested.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Ein Klick auf den Kopf klappt auf',
      zkZu('potenzial') === false, JSON.stringify(zkZu('potenzial')));
    check('Und loest kein PUT /api/settings aus',
      !zkTested.sent.some(g => g.url === '/api/settings'),
      JSON.stringify(zkTested.sent));
    /* DIE GEGENPROBE: ein gewoehnlicher Block speichert weiter. Ohne sie
       bliebe die Zeile darueber auch dann gruen, wenn gar nichts mehr
       gespeichert wuerde (Stolperstein 81). */
    zkTested.sent.length = 0;
    zkDoc.querySelector('.block[data-block="tags"] .block-head')
      .dispatchEvent(new zkTested.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Ein gewoehnlicher Block speichert dagegen weiter',
      zkTested.sent.some(g => g.url === '/api/settings' && g.body?.blocks),
      JSON.stringify(zkTested.sent.map(g => g.url)));
    zkTested.w.close();

    /* AN EINEM UNGETESTETEN EINTRAG IST ES UMGEKEHRT. */
    const zkIdea = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      ownValues: [0, 0, 4], voteColumns: [{ avg: null, count: 0 }, { avg: null, count: 0 }, { avg: 4.2, count: 2 }],
      untested: true,
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
    const zkIdeaZu = (name) => zkIdea.w.document
      .querySelector(`.block[data-block="${name}"]`)?.classList.contains('closed');
    check('An einer Idee ohne Bewertungssterne steht das Potenzial offen',
      zkIdeaZu('potenzial') === false, JSON.stringify(zkIdeaZu('potenzial')));
    /* UND DEN BEWERTUNGSKASTEN GIBT ES DORT GAR NICHT -- 0.22.1, und das ist
       die Umkehrung der Zusage, die hier bis 0.22.0 stand: „und die Bewertung
       zu".
       DER BEFUND, DER SIE UMGEDREHT HAT: zugeklappt heisst sichtbar. Kopfzeile,
       Griff, Pfeil und eine Zeile Platz standen an jeder Idee da, und EIN
       KLICK LIESS STERNE VERGEBEN -- obwohl „vor dem Test schaetzt man, nach
       dem Test bewertet man" seit 0.21.0 der Satz dieser Instanz ist. Sie sagte
       ihn leise und liess zugleich das Gegenteil zu.
       GEPRUEFT WIRD DIE EIGENSCHAFT; DASS SIE AUCH WIRKT, haelt die Gruppe
       „`hidden` muss wirken, und zwar ueberall" weiter unten fest -- die Regel
       steht seit 0.15.1 EINMAL ganz oben im Stilblatt und traegt `!important`
       (Stolperstein 212). */
    const zkIdeaBlock = () => zkIdea.w.document.querySelector('.block[data-block="bewertung"]');
    check('Und den Bewertungskasten gibt es dort gar nicht',
      zkIdeaBlock()?.hidden === true,
      JSON.stringify([!!zkIdeaBlock(), zkIdeaBlock()?.hidden]));
    /* DER SCHALTER LEERT DEN BLICK. Nach dem Umlegen steht der richtige Kasten
       offen, ohne dass jemand klickt.
       DER BLICK WIRD AM POTENZIAL GESETZT UND NICHT MEHR AN DER BEWERTUNG:
       deren Kopfzeile steht an einer Idee nicht da, und ein Klick auf einen
       Kasten, den niemand sehen kann, belegte nichts. Die Frage bleibt
       dieselbe -- ueberlebt ein Blick das Umlegen des Schalters? */
    zkIdea.w.document.querySelector('.block[data-block="potenzial"] .block-head')
      .dispatchEvent(new zkIdea.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Ein Blick klappt das Potenzial an der Idee zu',
      zkIdeaZu('potenzial') === true, JSON.stringify(zkIdeaZu('potenzial')));
    zkIdea.w.document.getElementById('sw-test')
      .dispatchEvent(new zkIdea.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 80));
    check('Der Schalter „Getestet" stellt die Regel wieder her',
      zkIdeaZu('bewertung') === false && zkIdeaZu('potenzial') === true,
      JSON.stringify([zkIdeaZu('bewertung'), zkIdeaZu('potenzial')]));
    /* UND ER HOLT DEN KASTEN ZURUECK. Ohne diese Zeile bliebe gruen, wer den
       Bewertungskasten dauerhaft versteckt -- die Zusage darueber fragt nur
       nach `zu`, und die gilt auch fuer einen Block, den niemand sieht. */
    check('Und er holt den Bewertungskasten zurueck',
      zkIdeaBlock()?.hidden === false, JSON.stringify(zkIdeaBlock()?.hidden));
    zkIdea.w.close();

    /* VORHANDENE DATEN SCHLAGEN DIE REGEL. Ein ungetesteter Eintrag mit
       Bewertungssternen zeigt sie -- nichts wird vor jemandem versteckt, der
       es eingetragen hat. */
    const zkOld = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      ownValues: [4, 0, 4], untested: true,
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
    check('Eine Idee MIT Bewertungssternen zeigt sie trotzdem',
      zkOld.w.document.querySelector('.block[data-block="bewertung"]')
        ?.classList.contains('closed') === false,
      JSON.stringify(zkOld.w.document.querySelector('.block[data-block="bewertung"]')?.className));
    /* UND SIE ZEIGT IHN WIRKLICH -- 0.22.1 (Entscheidung E6). „Offen" allein
       genuegt seit dieser Runde nicht mehr: ein versteckter Block kann offen
       sein, und niemand saehe die Sterne. Vorhandene Daten schlagen die Regel;
       ohne diese Ausnahme waeren vergebene Sterne unsichtbar UND unerreichbar,
       denn wegnehmen laesst sich nur, was man sieht. */
    check('Und zwar sichtbar, nicht nur aufgeklappt',
      zkOld.w.document.querySelector('.block[data-block="bewertung"]')?.hidden === false,
      JSON.stringify(zkOld.w.document.querySelector('.block[data-block="bewertung"]')?.hidden));

    /* --- OHNE ZAHL BLEIBT DER SATZ — 0.22.1 (E4) ---
       Die Kurzfassung faellt nur, solange eine KOPFZAHL dasteht. Steht keine
       („ohne Zahl kein Knopf"), muss der zugeklappte Kasten selbst sagen, dass
       er leer ist -- sonst stuende dort eine Ueberschrift und weiter nichts.
       UND JE KASTEN MIT EIGENEM WORT: zwei gleiche Texte an zwei Koepfen
       waeren ein Raetsel fuer den, der nur die Koepfe sieht.
       DIE LAGE: ein GETESTETER Eintrag (Potenzial also zugeklappt) mit einem
       Vorher-Kriterium, das niemand eingeschaetzt hat. */
    const zkEmpty = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      potentialValue: null, ownValues: [4, 4, 0],
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
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

    /* --- DER BLICK ENDET MIT DEM EINTRAG ---
       NACHGETRAGEN AUS DER GEGENPROBE: Rueckbau 593 nimmt `BLICK.clear()` am
       Eingang der Detailansicht heraus, und der Lauf blieb GRUEN. Der Grund
       war eine Luecke und keine Kleinigkeit: keine einzige Prueflage dieser
       Gruppe hat den Eintrag je GEWECHSELT. Alles darueber spielt an EINEM
       Eintrag, und an einem Eintrag ist ein bleibender Blick nicht von einem
       endenden zu unterscheiden.
       GEBAUT WIRD DER FALL, DER SIE TRENNT: der Blick klappt an Eintrag 1
       den Potenzialkasten ZU -- gegen die Regel, die ihn an einer Idee offen
       haelt. Eintrag 2 ist ebenfalls eine Idee ohne Sterne, dort gilt also
       dieselbe Regel. Bleibt der Kasten nach dem Wechsel zu, hat der Blick
       den Eintrag ueberlebt und ist in Wahrheit eine Einstellung, die
       niemand speichert -- die schlechteste Mischung aus beidem. */
    const zkSecond = {
      id: 2, title: 'Zweite Idee', description: '', rejected: false, tested: false,
      favorite: false, category: null, author: null,
      photos: [], links: [], comments: [], attachments: [], tags: [], testDays: [],
      /* KEIN EINZIGER STERN IN BEIDEN KAESTEN -- weder eigener noch fremder.
         Ein Stern im Bewertungskasten hoebe dort die Regel auf (`hatSterne`),
         und die Prueflage pruefte dann zwei Dinge auf einmal. */
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
    await new Promise(r => setTimeout(r, 80));
    const zkWZu = (name) => zkChange.w.document
      .querySelector(`.block[data-block="${name}"]`)?.classList.contains('closed');
    check('An Eintrag 1 steht das Potenzial nach der Regel offen',
      zkWZu('potenzial') === false, JSON.stringify(zkWZu('potenzial')));
    zkChange.w.document.querySelector('.block[data-block="potenzial"] .block-head')
      ?.dispatchEvent(new zkChange.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 40));
    check('Ein Blick klappt es dort gegen die Regel zu',
      zkWZu('potenzial') === true, JSON.stringify(zkWZu('potenzial')));
    zkChange.w.location.hash = '#/item/2';
    await new Promise(r => setTimeout(r, 120));
    /* ERST DAS OBJEKT, DANN SEIN ZUSTAND (Stolperstein 81): steht der Kasten
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

    /* --- DIE BEIDEN KRITERIENKARTEN IM SYSTEMBEREICH ---
       NACHGETRAGEN AUS DER GEGENPROBE: die Rueckbauten 597 und 598 kamen beide
       STUMM zurueck. Der Grund ist derselbe wie beim Blick, nur an anderer
       Stelle: die vorhandene Prueflage zur Kriterienkarte laeuft mit DREI
       Nachher-Kriterien. Ein Filter auf 'after' laesst dann alles durch, und
       ob er ueberhaupt dasteht, ist an dieser Lage nicht zu sehen.
       GEBAUT WIRD DIE LAGE, DIE IHN SICHTBAR MACHT: zwei Kriterien im einen
       Kasten, eines im anderen. Erst dann sagt „nur seine Zeilen" etwas. */
    const zkSys = buildDom(JSDOM, { hash: '', criteriaPhases: zkPhases,
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
    await sysSection(zkSys.w, 'inventory');
    const zkCardsNames = (id) => [...(zkSys.w.document.getElementById(id)
      ?.querySelectorAll('.mrow .mname') || [])].map(n => n.textContent);
    /* ERST DIE KAESTEN (Stolperstein 81): stuende die zweite Karte gar nicht
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
    /* UND WAS IN DER ZWEITEN KARTE ANGELEGT WIRD, TRAEGT SEINEN KASTEN MIT.
       Ohne die Phase im Rumpf legte der Server es nach seiner Vorgabe an --
       also im FALSCHEN Kasten, und zwar stillschweigend: die Karte zeigte es
       danach gar nicht mehr, weil sie nach 'before' filtert. */
    const zkPField = zkSys.w.document.getElementById('newpcrit');
    if (zkPField) {
      zkPField.value = 'Wunsch';
      zkSys.w.document.getElementById('newpcrit-b')
        ?.dispatchEvent(new zkSys.w.MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 60));
    }
    const zkCreated = zkSys.sent
      .filter(x => x.method === 'POST' && x.url === '/api/criteria').pop();
    check('Die Potenzialkarte legt mit der Phase vorher an',
      zkCreated?.body?.name === 'Wunsch' && zkCreated?.body?.phase === 'before',
      JSON.stringify(zkCreated));
    /* DIE GEGENPROBE AN DER ERSTEN KARTE: sie schickt 'after' und nicht gar
       nichts. Beide Karten gehen durch DIESELBE Aufrufstelle -- ohne diese
       Zeile bliebe gruen, wer dort die Phase fest auf 'before' schriebe. */
    const zkNField = zkSys.w.document.getElementById('newcrit');
    if (zkNField) {
      zkNField.value = 'Preis';
      zkSys.w.document.getElementById('newcrit-b')
        ?.dispatchEvent(new zkSys.w.MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 60));
    }
    const zkAngelegt2 = zkSys.sent
      .filter(x => x.method === 'POST' && x.url === '/api/criteria').pop();
    check('Und die Bewertungskarte mit der Phase nachher',
      zkAngelegt2?.body?.name === 'Preis' && zkAngelegt2?.body?.phase === 'after',
      JSON.stringify(zkAngelegt2));
    zkSys.w.close();

    /* --- DAS WORT AM BLOCKKOPF KOMMT AUS DEM VOKABULAR ---
       NACHGETRAGEN AUS DER GEGENPROBE: Rueckbau 600 schreibt „Potenzial" fest
       in den Quelltext und kam STUMM zurueck. Kein Wunder -- keine Prueflage
       hat das Wort je UMGESTELLT, und die Vorgabe heisst genau so. Ein fest
       geschriebenes Wort ist von einem eingesetzten nicht zu unterscheiden,
       solange beide gleich lauten (dieselbe Falle wie bei den Kriterienkarten,
       nur an einem Wort statt an einer Liste).
       „ERWARTUNG" IST DAS WORT AUS DEM KONZEPT und nicht irgendeines: der
       Betreiber, der es umstellt, stellt es vermutlich genau darauf um. */
    const zkWord = buildDom(JSDOM, { hash: '#/item/1', criteriaPhases: zkPhases,
      settings: { filters: null, userCount: 3, isAdmin: true,
                       vocabulary: { potential: 'Erwartung' } } });
    await new Promise(r => setTimeout(r, 80));
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
    await new Promise(r => setTimeout(r, 120));
    const zkTile = (n) => [...zkUeb.w.document.querySelectorAll('.card')][n];
    const zkNumber = (n) => zkTile(n)?.querySelector('.rating-inline')?.textContent.trim()
      ?? zkTile(n)?.querySelector('.card-meta-l .hint')?.textContent.trim();
    check('Die Kachel eines getesteten Eintrags zeigt ★ und die Bewertung',
      zkNumber(0) === '★3,8', JSON.stringify(zkNumber(0)));
    check('Die Kachel einer Idee zeigt ◆ und das Potenzial',
      zkNumber(1) === '◆4,2', JSON.stringify(zkNumber(1)));
    /* NIE BEIDES. Der getestete Eintrag traegt eine Potenzialzahl und zeigt
       sie NICHT -- die Kachel ist zu klein fuer zwei, und die andere steht im
       Kopf des zugeklappten Kastens. */
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
    /* MITGEZOGEN MIT 0.28.1 (Stolperstein 201): die Richtung ist kein Eintrag
       der Liste mehr, sondern ein Umschalter daneben -- aus `potential_desc`
       und `potential_asc` ist EIN Eintrag `potential` geworden. Die Zusage
       prueft dieselbe Sache: das Potenzial steht im Feld, an der richtigen
       Stelle, mit seinem Wort aus dem Vokabular. */
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
    /* ZWEIMAL UMGEDREHT UND NIE GELOESCHT (Stolperstein 74). 0.21.1 gab der
       Potenzialsortierung die Vorgabe „Ungetestet": „Geprueft" fiel aus der
       Liste, und die Zusage stand vorher auf Platz DREI von drei. Sie fragt
       seither nach dem LETZTEN Platz -- das war immer die eigentliche Aussage
       („Eintraege ohne Zahl stehen hinten"), die feste Drei war nur ihre
       damalige Schreibweise.
       0.32.1 NIMMT DIE VORGABE WIEDER WEG, und damit stehen wieder alle drei
       da. DIE ZEILE DARUEBER BLEIBT und dreht sich mit: sie belegt jetzt, dass
       die Sortierung NICHTS mehr wegnimmt -- sonst saehe ein Rueckfall in die
       Ableitung aus wie eine Sortierung, und niemand faende ihn. */
    /* MITGEZOGEN MIT 0.28.1 (Stolperstein 201): die Richtung wird nicht mehr im
       Auswahlfeld GEWAEHLT, sondern am Umschalter daneben GEKLICKT. Die Zusagen
       darunter fragen dieselbe Sache wie vorher -- was die Sortierung mit den
       Eintraegen ohne Zahl macht.
       BEIDE BEDIENELEMENTE WERDEN JEDESMAL NEU GELESEN: ein Zug zeichnet die
       ganze Leiste neu, und die Knoten von vorhin haengen danach nicht mehr in
       der Seite. Eine festgehaltene Fassung antwortete zwar noch, aber sie
       antwortete ueber eine Leiste, die niemand mehr sieht. */
    const zkFeld = () => zkUeb.w.document.getElementById('f-sort');
    const zkDir = () => zkUeb.w.document.getElementById('f-sort-dir');
    if (zkFeld()) { zkFeld().value = 'potential'; zkFeld().onchange(); }
    await new Promise(r => setTimeout(r, 60));
    check('Nach Potenzial sortiert steht der ganze Bestand da — 0.32.1',
      equal(zkTitle(), ['Geprueft', 'Idee', 'Blanko']), JSON.stringify(zkTitle()));
    check('Nach Potenzial absteigend stehen Eintraege ohne Zahl hinten',
      zkTitle()[zkTitle().length - 1] === 'Blanko', JSON.stringify(zkTitle()));
    /* DER UMSCHALTER SAGT DIE KONKRETE RICHTUNG und nicht „absteigend“. Stuende
       dort das falsche Wortpaar, zeigte der Knopf eine andere Richtung an als
       die, die gerade gilt -- und der Klick darunter drehte etwas um, das der
       Leser nie gesehen hat. */
    check('Und der Umschalter daneben nennt die geltende Richtung — 0.28.1',
      zkDir()?.textContent === 'hoch → niedrig', JSON.stringify(zkDir()?.textContent));
    zkDir()?.click();
    await new Promise(r => setTimeout(r, 60));
    check('Und aufsteigend ebenfalls',
      zkTitle()[zkTitle().length - 1] === 'Blanko', JSON.stringify(zkTitle()));
    check('Und der Umschalter nennt danach die andere Richtung — 0.28.1',
      zkDir()?.textContent === 'niedrig → hoch', JSON.stringify(zkDir()?.textContent));
    zkUeb.w.close();
  }

  group('Das Raster der Kriterienliste zaehlt seine Zellen — 0.17.0');

  /* WIE VIELE SPALTEN EIN KASTEN MIT DIESEN KLASSEN HAT -- GELESEN, nicht
     hingeschrieben. Von den Regeln, deren Klassen der Kasten alle traegt,
     gewinnt die SPEZIFISCHERE, und bei gleicher Spezifitaet die spaetere --
     in dieser Reihenfolge wertet es der Browser.
     DIE BEIDEN REGELN HABEN HIER NICHT DIESELBE SPEZIFITAET: `.rlist` traegt
     eine Klasse, `.rlist.no-average` zwei. Die zweite gewinnt deshalb ueber
     ihre Spezifitaet und nicht ueber ihren Platz -- ein Leser, der nur den
     Platz ansaehe, gaebe die falsche Zahl zurueck, sobald jemand die Regeln
     umstellt, und die Zusagen darunter blieben trotzdem gruen.
     ERST DER GEGENSTAND (Stolperstein 81): findet sich gar keine Regel, ist
     die Zahl 0 und die Zusagen darunter koennen nicht gruen bleiben. */
  const gridColumns = (classes) => {
    /* KOMMENTARE ZUERST WEG: sie tragen selbst geschweifte Klammern und
       Punkte, und ein Ausdruck ueber das rohe Stilblatt griffe dort hinein.
       DANACH VON KLAMMER ZU KLAMMER, ohne Ausdruck ueber die ganze Regel: ein
       Ausdruck mit einem Anker DAVOR frisst die schliessende Klammer der
       vorigen Regel auf und ueberspringt damit jede zweite. Klammer zu Klammer
       schneiden ist langweiliger und deshalb richtig. */
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
  /* DIE PROBE AUF DEN LESER SELBST. Ohne sie belegte „Zellen und Spalten
     passen zusammen" auch dann etwas, wenn gridColumns() immer dieselbe
     Zahl lieferte -- und das waere eine Pruefung ueber den Pruefstand statt
     ueber die Instanz. */
  check('Der Leser findet fuer beide Klassenstellungen eine Regel',
    gridColumns(['rlist']) > 0 && gridColumns(['rlist', 'no-average']) > 0,
    `${gridColumns(['rlist'])} / ${gridColumns(['rlist', 'no-average'])}`);
  check('Und er unterscheidet die beiden wirklich',
    gridColumns(['rlist']) !== gridColumns(['rlist', 'no-average']),
    `${gridColumns(['rlist'])} / ${gridColumns(['rlist', 'no-average'])}`);
  /* UND ER WAEHLT NACH SPEZIFITAET UND NICHT NACH PLATZ. Gegengeprueft an der
     Regel selbst: was der Leser fuer beide Klassen liefert, muss die Zahl aus
     der ZWEIKLASSIGEN Regel sein. Ohne diese Zeile bliebe „er unterscheidet
     die beiden" auch dann gruen, wenn er die falsche Regel nimmt und nur
     zufaellig eine andere Zahl herausbekaeme. */
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
    await new Promise(r => setTimeout(r, 80));
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
       beiden Lagen dazu. Umgedreht, nicht geloescht (Stolperstein 74). */
    check(`Bei ${word} sind es ${howMany > 1 ? 'vier' : 'drei'} Zellen — 0.22.0`,
      rzCells[0] === (howMany > 1 ? 4 : 3), `${rzCells[0]}`);
    /* UND DIE KLASSE STEHT NUR DA, WO SIE HINGEHOERT. Ohne diese Zeile bliebe
       „passen zusammen" auch dann gruen, wenn sie immer stuende und die
       Durchschnittszelle mit ihr. */
    check(`Die Klasse „no-average" steht bei ${word} ${howMany > 1 ? 'nicht' : ''} da`.replace('  ', ' '),
      rzClasses.includes('no-average') === (howMany === 1), JSON.stringify(rzClasses));
    rz.w.close();
  }

  /* UMGEDREHT MIT 0.21.0 (Stolperstein 74), und der alte Satz bleibt stehen,
     damit der Widerruf einen Gegenstand hat (Stolperstein 201).
     BIS 0.20.1 HIESS ES: „Es gibt genau ZWEI Regeln mit Spaltenangabe, und
     keine davon steht in einer Medienabfrage. Eine dritte -- etwa eine fuer
     den schmalen Schirm -- waere eine zweite Wahrheit ueber dieselbe Zahl."
     SEIT 0.21.0 GIBT ES DIE DRITTE, und sie ist genau die damals genannte:
     auf dem Telefon passen drei Spalten nicht mehr, seit das × und die
     Mindestbreite dazugekommen sind. Der Einwand von damals bleibt richtig und
     wird deshalb SCHAERFER geprueft statt fallengelassen: die dritte Regel
     muss INNERHALB der Telefonabfrage stehen und darf den breiten Schirm nicht
     erreichen. Eine vierte gibt es nach wie vor nicht. */
  const rzRules = (css123.match(/\.rlist[^{]*\{[^}]*grid-template-columns[^}]*\}/g) || []);
  check('Die Spaltenzahl steht an genau drei Stellen im Stilblatt',
    rzRules.length === 3, JSON.stringify(rzRules));
  /* UND DIE DRITTE STEHT IM TELEFONABSCHNITT. Gefragt wird nach dem PLATZ im
     Stilblatt und nicht nach dem Waehler: eine Regel, die richtig aussieht und
     ausserhalb der Abfrage steht, gaelte auf jedem Schirm. */
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
     risse die Trennlinie in Stuecke, genauso wie an der allgemeinen.
     GEFRAGT WIRD NACH DEM WAEHLER UND NICHT NACH DEM PLATZ: `rzRules[1]` waere
     die stille Annahme, die zweite gefundene Regel sei die gemeinte -- wer die
     beiden umstellte, pruefte danach wortlos die falsche.
     UND DAS VORHANDENSEIN STEHT IN EINER EIGENEN ZEILE (Stolperstein 81):
     beides in einer Bedingung meldete bei fehlender Regel „keine Regel" und
     saehe aus wie ein Befund ueber den Spaltenabstand. */
  check('Auch die Regel fuer den einen Zugang traegt keinen Spaltenabstand',
    !/gap/.test(rzWithoutRule), rzWithoutRule || '(keine Regel)');
  /* DIE SCHWELLE STEHT AN EINER STELLE. Verlockend waere gewesen, die
     Spaltenzahl aus den Bewertungen selbst abzuleiten -- dann haetten Raster
     und Zelle zwei Quellen, und die eine liesse sich aendern, ohne dass die
     andere mitginge. */
  check('Raster und Zelle haengen an derselben einen Bedingung',
    /const withAverage = multipleUsers\(\);/.test(arSource) &&
    /box\.className = 'rlist' \+ \(withAverage \?/.test(arSource) &&
    /if \(withAverage\) \{/.test(arSource),
    (arSource.match(/const withAverage[^\n]*/) || ['(nicht gefunden)'])[0]);

  /* ================= Zwei Masse vom echten Geraet — 0.17.0 =============
     BEIDE BEFUNDE SIND AUF EINEM TELEFON ENTSTANDEN und in jsdom nicht zu
     messen: dort ist jede Breite und jede Hoehe null. Geprueft wird deshalb
     an beiden Enden -- dass der Aufbau die Gegenstaende wirklich traegt, und
     dass am Stilblatt die Regel dazu haengt (Stolperstein 81 und 223). */
  group('Zwei Masse vom echten Geraet — 0.17.0');

  /* DIE PROBE AUF DEN LESER: er muss wirklich etwas wegnehmen und wirklich
     etwas stehenlassen. Ohne sie belegten die Zeilen darunter nichts. */
  check('Der Leser trennt Medienabfragen wirklich ab',
    withoutMedia.length > 0 && withoutMedia.length < css123.length &&
    !/@media/.test(withoutMedia), `${withoutMedia.length} von ${css123.length}`);

  /* ---- Erstens: die Versionszeile unter der Falz (Samsung S21 5G) ----
     `vh` IST AUF DEM TELEFON DIE GROSSE ANZEIGEFLAECHE -- die ohne
     Browserleisten, also die, die man nicht sieht. Die Seite wird damit
     hoeher als das Fenster, und die Zeile am unteren Ende steht darunter.
     `dvh` misst, was gerade wirklich da ist.
     DER RUECKFALL STEHT DARUEBER UND NICHT DARUNTER: ein Browser, der `dvh`
     nicht kennt, ueberliest die zweite Zeile und behaelt die erste. Stuende
     sie andersherum, bliebe fuer ihn nichts uebrig. */
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
     gibt es an der Anmeldekarte gar nicht, sie ist mittig gesetzt. Ohne diese
     Zeile bliebe offen, ob jemand doch wieder am Abstand dreht. */
  check('Die Anmeldekarte bleibt mittig gesetzt statt oben angeheftet',
    /align-items: center/.test((withoutMedia.match(/\.login-screen \{[^}]*\}/) || [''])[0]),
    (withoutMedia.match(/\.login-screen \{[^}]*\}/) || ['(keine Regel)'])[0]);

  /* ---- Zweitens: der Rahmen der eigenen Anmeldung reicht nicht bis zum Rand
     `.manage-list` traegt `overflow-y: auto`, und damit steht `overflow-x`
     nach der CSS-Regel ebenfalls auf `auto`. Die Zeile ist breiter als der
     Kasten -- die beiden Zeitangaben geben nicht nach --, also entsteht ein
     Bildlauf zur Seite, und der Rahmen endet am sichtbaren Ausschnitt.
     ERST DER GEGENSTAND: die Zeile muss die beiden Zeitangaben wirklich
     tragen, und die muessen wirklich nicht nachgeben. Sonst haette der Umbruch
     nichts, wovor er schuetzt. */
  {
    const az = buildDom(JSDOM, { settings: { filters: null, userCount: 4, isAdmin: true } });
    await new Promise(r => setTimeout(r, 60));
    await az.w.renderSystem();
    await new Promise(r => setTimeout(r, 60));
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
     Umbruchpunkts. Gelesen wird deshalb aus dem Stilblatt OHNE Medienabfragen
     -- eine Regel, die nur dort steht, faellt hier durch.
     SEIT 0.17.1 TRAEGT SIE EIN RASTER UND NICHT MEHR DER UMBRUCH. Der Umbruch
     liess die Zeile erst zu breit werden und brach sie dann um; das Raster
     laesst sie gar nicht erst zu breit werden -- die Namensspalte ist
     `minmax(0, 1fr)` und gibt nach. Die ZUSAGE ist dieselbe geblieben, der Weg
     dorthin ist der bessere. */
  const azSitz = (withoutMedia.match(/\.mrow\.session \{[^}]*\}/) || [''])[0];
  check('Die Zeile einer Anmeldung steht ausserhalb jeder Medienabfrage in einem Raster',
    /display: grid/.test(azSitz), azSitz || '(keine Regel)');
  check('Und ihre Namensspalte gibt nach, statt die Zeile breiter zu machen',
    /grid-template-columns: minmax\(0, 1fr\)/.test(azSitz), azSitz || '(keine Regel)');
  check('Und der Zeilenabstand steht daneben',
    /row-gap:/.test(azSitz), azSitz || '(keine Regel)');
  /* UND DIE ANORDNUNG GILT SEIT 0.17.2 AUF JEDEM SCHIRM. Sie stand bis dahin
     nur in der Medienabfrage; auf dem breiten Schirm nahmen zwei Zeitangaben
     dem Namen so viel Platz weg, dass von „Diese Anmeldung (hier)" ein Stummel
     mit Ellipse blieb. Die Trennung „oben, was die Zeile ist -- darunter,
     wann" ist keine Frage der Breite.
     GEPRUEFT WIRD BEIDES: dass sie ausserhalb steht UND dass in der
     Medienabfrage keine zweite danebensteht. Eine Regel, die an beiden Orten
     stuende, waere eine zweite Wahrheit. */
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
     Eintrag standen die Aussage zur Ablehnung UND ihr Eingabefeld da. Beide
     trugen `hidden`; der Browser zeichnete sie trotzdem, weil eine
     display-Regel aus dem Stilblatt die Vorgabe des Browsers schlaegt. Die
     Regel dagegen steht jetzt einmal ganz oben und wird in der Gruppe zur
     Hervorhebung geprueft.
     HIER GEHT ES UM DIE ZWEITE HAELFTE: WANN das Feld ueberhaupt dastehen
     soll. Die Antwort aus dem Betrieb ist ein ZUSTAND und kein Klick --
     abgelehnt und kein Grund -- und darueber hinaus, wer es ausdruecklich
     aufmacht.
     VIER LAGEN, UND SIE SIND DIE VIER FELDER DER TAFEL: abgelehnt ja/nein
     gegen Grund ja/nein. Eine Gruppe, die nur eine davon faehrt, belegt
     nichts ueber die anderen drei (Stolperstein 189). */
  group('Das Feld steht nur, wo etwas fehlt — 0.15.1');

  const fsBuild = async (rejected, reason) => {
    const d = buildDom(JSDOM, { hash: '#/item/1',
      rejection: rejected ? { at: '2026-03-14 09:12:00', reason,
        author: { id: 1, name: 'chefin', deleted: false } } : null,
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
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
     steht aber noch in der Zeile -- genau so laesst 0.14.0 ihn stehen. Ohne
     diese Lage bliebe die Zeile darueber auch dann gruen, wenn die Anzeige
     bloss am fehlenden Text haenge und nicht am Merkmal. */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1',
      rejection: { at: '2026-03-14 09:12:00', reason: 'Ein Grund von frueher',
                   author: { id: 1, name: 'chefin', deleted: false } },
      settings: { filters: null, userCount: 3, isAdmin: true } });
    await new Promise(r => setTimeout(r, 80));
    // Das Merkmal zuruecknehmen -- Datum, Grund und Verfasser bleiben stehen.
    d.w.document.getElementById('sw-rej')
      .dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
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
    /* UND ES BLEIBT ZU, AUCH NACH EINEM NEUEN ZEICHNEN. Bis 0.15.1 hing das
       Offenstehen an einem Klick; ein neu geladener Eintrag zeigte das Feld
       deshalb nie, gleich ob ein Grund dastand oder nicht. */
    d.w.document.getElementById('sw-rej')
      .dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    d.w.document.getElementById('sw-rej')
      .dispatchEvent(new d.w.MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 80));
    check('Ein erneutes Ablehnen macht es nicht auf -- der Grund steht ja da',
      fsField(d)?.hidden === true && fsMark(d)?.hidden === false,
      JSON.stringify([fsField(d)?.hidden, fsMark(d)?.hidden]));
    d.w.close();
  }

  /* --- UND DIE VIERTE LAGE IST DIE RECHTEFRAGE: wer nicht schreiben darf,
     bekommt das Feld auch dann nicht, wenn ein Grund fehlt. Sonst stuende ein
     Eingabefeld da, dessen Inhalt der Server mit 403 abweist. --- */
  {
    const d = buildDom(JSDOM, { hash: '#/item/1',
      rejection: { at: '2026-03-14 09:12:00', reason: null,
                   author: { id: 2, name: 'Anna', deleted: false } },
      settings: { filters: null, userCount: 3, isAdmin: false } });
    await new Promise(r => setTimeout(r, 80));
    check('Wer nicht schreiben darf, bekommt auch ohne Grund kein Feld',
      fsField(d)?.hidden === true, JSON.stringify(fsField(d)?.hidden));
    check('Die Aussage liest er dafuer',
      fsMark(d)?.hidden === false, JSON.stringify(fsMark(d)?.hidden));
    d.w.close();
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
