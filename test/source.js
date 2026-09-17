/* Kriterion — Pruefstand: die Waechter ueber den Quelltext Was im Quelltext
   STEHT, nicht was der Server tut: die Rechteschicht je Route, der
   Sprachwaechter ueber die Kommentare, die sechs Waechter ueber das Englisch
   im Code und der Waechter ueber die Bildschirmtexte. */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  screenTextsFrom, serverTextsFrom, SCREEN_BAN, isAddress,
  screenViolations
} = D;

async function run() {
  const {
   fs, os, path, attachments, sharp, segment, CODE, TEXT, COMMENT,
   __dirname, require, group, check, equal, open, shortRun, shortRunAll,
   call, names, benchFiles
  } = H;

  /* ---------------------------------------------------------------- */
  group('Der Waechter ueber den Quelltext');

  /* Diese Gruppe prueft nicht, was der Server TUT, sondern was im Quelltext
     STEHT -- und sie ist die einzige, die eine FEHLENDE Entscheidung findet. */
  const fSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const CORE_WORDS = ['mayChange(', 'selfOnly(', 'entryFree(', 'isAdmin(',
    'isOwner(', 'targetUserFree(', 'mayCreate('];
  const F_ROUTES = [
    ['POST',   '/api/setup',                     'offen'],
    ['POST',   '/api/login',                     'offen'],
    ['POST',   '/api/logout',                    'offen'],
    /* Der Token, 0.8.80 -- die vierte und fuenfte offene schreibende Route. */
    ['POST',   '/api/token/check',             'offen'],
    ['POST',   '/api/token/redeem',           'offen'],
    /* Die Selbstanmeldung, 0.9.1 -- die sechste und siebte offene schreibende
       Route. */
    ['POST',   '/api/signup',             'offen'],
    ['POST',   '/api/signup/confirm', 'offen'],
    /* Der zweite Schritt der Anmeldung, 0.10.0 -- die ACHTE offene
       schreibende Route. */
    ['POST',   '/api/login/second',                'offen'],
    ['PUT',    '/api/account',                   'selbstbezug'],
    /* Meine Sitzungen, 0.8.80. 'selbstbezug' wie PUT /api/account, und aus
       demselben Grund: die Klemme ist nicht eine Rollenfrage im Rumpf,
       sondern die Bauform -- user_id kommt aus req.user und nie aus der
       Adresse. */
    ['DELETE', '/api/sessions',                  'selbstbezug'],
    ['DELETE', '/api/sessions/:sessionId',      'selbstbezug'],
    /* Die Freigabe fuer die schweren Wege, 0.8.90. 'selbstbezug' wie PUT
       /api/account: der Benutzer kommt aus req.user und nie aus der Adresse
       -- wer bestaetigt, bestaetigt fuer sich. */
    ['POST',   '/api/confirm',              'selbstbezug'],
    /* Der zweite Faktor, 0.10.0 -- VIER Routen, alle 'selbstbezug'. */
    ['POST',   '/api/two-factor/start',          'selbstbezug'],
    ['POST',   '/api/two-factor/on',             'selbstbezug'],
    ['POST',   '/api/two-factor/codes',          'selbstbezug'],
    ['DELETE', '/api/two-factor',                'selbstbezug'],
    /* ANLEGEN BRAUCHT KEINE ZWEITE BESTAETIGUNG, und das ist entschieden und
       nicht vergessen: es erzeugt einen NEUEN Zugang und nimmt niemandem
       etwas. */
    ['POST',   '/api/users',                     'adminOnly, im Rumpf'],
    /* Der Link fuer einen vorhandenen Zugang. */
    ['POST',   '/api/users/:id/token',           'adminOnly, im Rumpf, zweitbestaetigt'],
    /* Zwei der drei Rechteklassen dieser Route liegen hinter der zweiten
       Bestaetigung -- Rolle und fremdes Passwort. */
    ['PUT',    '/api/users/:id',                 'adminOnly, im Rumpf, zweitbestaetigt'],
    ['DELETE', '/api/users/:id',                 'adminOnly, im Rumpf, zweitbestaetigt'],
    /* Der Mailzugang, 0.9.0. */
    ['PUT',    '/api/mail',                      'ownerOnly, zweitbestaetigt'],
    /* Die Testmail. nurEigentuemer wie das Setzen daneben -- wer den Zugang
       nicht sehen darf, testet ihn auch nicht. */
    ['POST',   '/api/mail/test',                 'ownerOnly'],
    /* Die Selbstanmeldung hinter der Anmeldung, 0.9.1 -- drei Routen, alle
       beim ADMIN und nicht beim Eigentuemer: aus einer Anfrage wird nie etwas
       anderes als ein Zugang mit der Rolle 'user', und den legt der Admin
       ohnehin an. */
    ['PUT',    '/api/signup/toggle',    'adminOnly'],
    ['POST',   '/api/requests/:id/approve',         'adminOnly'],
    ['DELETE', '/api/requests/:id',              'adminOnly'],
    ['PUT',    '/api/titles',                    'adminOnly'],
    ['PUT',    '/api/settings',                  'im Rumpf'],
    ['POST',   '/api/criteria',                  'adminOnly'],
    ['PUT',    '/api/criteria/order',            'adminOnly'],
    ['PUT',    '/api/criteria/:id',              'adminOnly'],
    ['DELETE', '/api/criteria/:id',              'adminOnly'],
    // Zuweisen darf jeder, einen NEUEN Namen anlegen haengt am Schalter --
// deshalb im Rumpf und hinter dem Nachschlagen, nicht vor der Route.
    ['POST',   '/api/product-categories',        'im Rumpf'],
    ['PUT',    '/api/product-categories/:id',    'adminOnly'],
    ['DELETE', '/api/product-categories/:id',    'adminOnly'],
    /* DER EINE GRIFF FUER DIE UNBEKANNTE ERSTELLUNGSSPRACHE -- 0.25.0 (F2). */
    ['PUT',    '/api/names/language',            'adminOnly'],
    /* DER WEG, EINEN TAG FUER SICH ANZULEGEN -- 0.24.4 (B7). */
    ['POST',   '/api/tags',                      'im Rumpf'],
    ['PUT',    '/api/tags/:id',                  'adminOnly'],
    ['DELETE', '/api/tags/:id',                  'adminOnly'],
    ['POST',   '/api/items/:id/tags',            'entryAuthorOnly, im Rumpf'],
    ['DELETE', '/api/items/:id/tags/:tagId',     'entryAuthorOnly'],
    ['POST',   '/api/items',                     'offen'],
    ['PUT',    '/api/items/:id',                 'im Rumpf'],
    ['DELETE', '/api/items/:id',                 'entryAuthorOnly'],
    ['POST',   '/api/items/:id/photos',          'entryAuthorOnly'],
    // Eigene Route statt der erweiterten Fotoroute: deren fileFilter auf
// ^image\/ zu lockern naehme die erste Schranke dem Fotoweg mit ab.
    ['POST',   '/api/items/:id/videos',          'entryAuthorOnly'],
    ['PUT',    '/api/photos/:id/focus',          'im Rumpf'],
    // Hochladen darf jeder -- umgestellt mit 0.8.31, aus demselben Grund wie
// beim Link: eine Datei erscheint nur dort, wo man sie hinsetzt.
    ['POST',   '/api/items/:id/attachments',     'offen'],
    ['DELETE', '/api/attachments/:id',           'im Rumpf'],
    ['PUT',    '/api/items/:id/photo-order',     'entryAuthorOnly'],
    ['DELETE', '/api/photos/:id',                'im Rumpf'],
    // Eintragen darf jeder -- wie Kommentar, Testtag und Bewertung. Umgestellt
// mit 0.8.30: ein Link erscheint nur dort, wo man ihn hinsetzt.
    ['POST',   '/api/items/:id/links',           'offen'],
    ['PUT',    '/api/items/:id/link-order',      'entryAuthorOnly'],
    ['DELETE', '/api/links/:id',                 'im Rumpf'],
    ['POST',   '/api/items/:id/test-days',       'offen'],
    ['PUT',    '/api/test-days/:id',             'im Rumpf'],
    ['DELETE', '/api/test-days/:id',             'im Rumpf'],
    ['POST',   '/api/test-days/:id/tags',        'im Rumpf'],
    ['DELETE', '/api/test-days/:id/tags/:tagId', 'im Rumpf'],
    ['PUT',    '/api/items/:id/ratings',         'offen'],
    /* DELETE /api/items/:id/ratings STEHT HIER NICHT MEHR -- 0.21.0. */
    // Die einzige Bewertungsroute MIT Klemme -- hier steht eine fremde Nummer
// in der Adresse, die eine darueber trifft baulich nur die eigene Zeile.
    ['DELETE', '/api/ratings/:id',               'im Rumpf'],
    ['POST',   '/api/items/:id/comments',        'offen'],
    ['PUT',    '/api/comments/:id',              'im Rumpf'],
    ['POST',   '/api/comments/:id/images',       'im Rumpf'],
    ['DELETE', '/api/comment-images/:id',        'im Rumpf'],
    ['DELETE', '/api/comments/:id',              'im Rumpf'],
    ['POST',   '/api/import',                    'ownerOnly, zweitbestaetigt'],
    /* Der Papierkorb, 0.8.70. SEHEN darf ihn der Admin (lesend, deshalb steht
       GET /api/trash hier nicht) -- HANDELN nur der Eigentuemer:
       Wiederherstellen legt Zeilen unter FREMDEM Namen an, genau wie der
       Import, und liegt damit in derselben Rechtezeile. */
    ['POST',   '/api/trash/:id/restore', 'ownerOnly'],
    ['DELETE', '/api/trash/:id',            'ownerOnly'],
    /* Die Sicherung, 0.8.70. Beide beim Eigentuemer, dieselbe Zeile wie
       Export und Import -- alles, was die Instanz als Ganzes betrifft. */
    ['PUT',    '/api/backup/dir',             'ownerOnly'],
    ['POST',   '/api/backup',                 'ownerOnly'],
    /* Die Bildumstellung, 0.19.0 -- die siebzigste. */
    ['POST',   '/api/images/convert',          'ownerOnly, zweitbestaetigt'],
    /* Das Aufraeumen alter Sicherungen, 0.20.0 -- die einundsiebzigste. */
    ['POST',   '/api/backup/cleanup',      'ownerOnly, zweitbestaetigt'],
    /* Die Sicherungsprobe, 0.29.0 -- die DREIUNDSIEBZIGSTE. */
    ['POST',   '/api/backup/check',            'ownerOnly']
  ];

  function writingRoutes(text) {
    const rows = text.split('\n');
    const outcome = [];
    for (let i = 0; i < rows.length; i++) {
      const z = rows[i];
      let method = null, rest = '';
      for (const [prefix, m] of [["app.post('", 'POST'], ["app.put('", 'PUT'], ["app.delete('", 'DELETE']]) {
        if (z.startsWith(prefix)) { method = m; rest = z.slice(prefix.length); }
      }
      if (!method) continue;
      const filePath = rest.slice(0, rest.indexOf("'"));
      const head = rest.slice(rest.indexOf("'") + 1);
      let core = '';
      for (let j = i + 1; j < rows.length && !rows[j].startsWith('app.'); j++) core += rows[j] + '\n';
      outcome.push({ key: `${method} ${filePath}`, head, core });
    }
    return outcome;
  }

  const fFound = writingRoutes(fSource);
  const fExpected = new Map(F_ROUTES.map(([m, p, kind]) => [`${m} ${p}`, kind]));
  const fUnknown = fFound.filter(r => !fExpected.has(r.key)).map(r => r.key);
  const fGone = [...fExpected.keys()].filter(k => !fFound.some(r => r.key === k));
  check('Der Pruefstand kennt jede schreibende Route',
    fUnknown.length === 0 && fGone.length === 0,
    `ohne Entscheidung: ${fUnknown.join(' · ') || '—'} · verschwunden: ${fGone.join(' · ') || '—'}`);
  /* Die ZAHL selbst, ausdruecklich: 0.8.50 brachte EINE neue schreibende
     Route mit, den Videoweg -- 46 wurden 47. Bleibt die Zahl stehen, hat sich
     am Rechtebild nichts verschoben; waechst sie unbemerkt, faellt genau das
     hier auf. */
  /* 0.11.0 bewegt sie NICHT. Die Volltextsuche laeuft ueber GET
     /api/items?q=... */
  /* 0.19.0 bewegt sie um EINE: 69 werden 70 -- POST /api/images/convert. */
  /* 0.20.0 bewegt sie um EINE: 70 werden 71 -- POST /api/backup/cleanup. */
  /* 0.21.0 bewegt sie um EINE nach UNTEN: 71 werden 70 -- DELETE
     /api/items/:id/ratings faellt weg. */
  /* 0.24.4 bewegt sie um EINE: 70 werden 71 -- POST /api/tags. */
  /* 0.29.0 bewegt sie um EINE: 72 werden 73 -- POST /api/backup/check. */
  check('Und es sind jetzt genau 73 schreibende Routen',
    F_ROUTES.length === 73 && fFound.length === 73,
    `${F_ROUTES.length} erwartet, ${fFound.length} gefunden`);
  /* DIE GESCHLOSSENEN LISTEN AUS auth.js, ausdruecklich mit ihrer ZAHL --
     dieselbe Bauform wie F_ROUTES und aus demselben Grund:
     eine Zahl in einem Papier ist eine Behauptung, eine Zahl im Pruefstand
     ist ein Beleg. */
  /* GELESEN WIRD DIE LAUFENDE LISTE, NICHT DER QUELLTEXT DANEBEN: ein
     Waechter ueber den Quelltext faerbt sich am Warnschild statt an der Sache. */
  const fAuthDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-listen-'));
  const fAuth = JSON.parse(shortRun(
    `const a = require('./auth');` +
    `console.log(JSON.stringify({ EVENTS: a.EVENTS, DETAILS: a.DETAILS,` +
    ` CONFIRM_PURPOSES: a.CONFIRM_PURPOSES }));`, fAuthDir));
  fs.rmSync(fAuthDir, { recursive: true, force: true });
  check('Es sind genau einundzwanzig Vorgaenge im Sicherheitsprotokoll',
    fAuth.EVENTS.length === 21, `${fAuth.EVENTS.length}: ${fAuth.EVENTS.join(' ')}`);
  /* DER EINUNDZWANZIGSTE, seit 0.20.0. Er steht NEBEN 'backup' und nicht an
     seiner Stelle: das eine legt eine Kopie an, das andere wirft welche weg. */
  check('Und der einundzwanzigste heisst sicherung.weg',
    fAuth.EVENTS.includes('backup.delete'), fAuth.EVENTS.join(' '));
  check('Und die beiden aus 0.9.1 heissen anfrage.frei und anfrage.ab',
    fAuth.EVENTS.includes('request.approve') && fAuth.EVENTS.includes('request.reject'),
    fAuth.EVENTS.join(' '));
  /* DIE DREI AUS 0.10.0. */
  check('Und die drei aus 0.10.0 heissen zweifaktor.an, .aus und .wieder',
    ['twofactor.on', 'twofactor.off', 'twofactor.reset']
      .every(v => fAuth.EVENTS.includes(v)),
    fAuth.EVENTS.join(' '));
  /* UND KEIN VIERTER FUER DEN FALSCHEN CODE: eine gescheiterte zweite Stufe
     IST eine gescheiterte Anmeldung und schreibt 'login.fail'. */
  check('Und es gibt keinen eigenen Vorgang fuer einen falschen Code',
    !fAuth.EVENTS.some(v => /^twofactor\.(fehl|falsch)/.test(v)),
    fAuth.EVENTS.filter(v => v.startsWith('twofactor')).join(' '));
  /* VIERZEHN SEIT 0.13.0, VORHER DREIZEHN. */
  check('Es sind jetzt vierzehn Merkmale', fAuth.DETAILS.length === 14,
    `${fAuth.DETAILS.length}: ${fAuth.DETAILS.join(' ')}`);
  check('Und das vierzehnte heisst "teil" und traegt keine Nummer',
    fAuth.DETAILS.includes('part') && !fAuth.DETAILS.some(m => /\d/.test(m)),
    fAuth.DETAILS.join(' '));
  /* ACHT SEIT 0.19.0, vorher sieben. */
  check('Und bei neun Zwecken der zweiten Bestaetigung',
    fAuth.CONFIRM_PURPOSES.length === 9, fAuth.CONFIRM_PURPOSES.join(' '));
  check('Und der achte heisst bilder',
    fAuth.CONFIRM_PURPOSES[7] === 'images', fAuth.CONFIRM_PURPOSES.join(' '));
  check('Und der neunte heisst sicherung',
    fAuth.CONFIRM_PURPOSES[8] === 'backup', fAuth.CONFIRM_PURPOSES.join(' '));

  const GUARD_WORDS = ['adminOnly', 'ownerOnly', 'entryAuthorOnly'];
  const SECOND_WORD = 'secondConfirm';
  const fWithoutWatcher = [], fWithoutGuard = [], fTooMany = [], fWithoutSelf = [], fTooManyGuard = [];
  const fWithoutSecond = [], fTooManySecond = [];
  for (const r of fFound) {
    const kind = fExpected.get(r.key);
    if (!kind) continue;
    const hasGuard = CORE_WORDS.some(w => r.core.includes(w));
    // Eine Route kann BEIDES verlangen.
    const wantsWatcher = kind.startsWith('nur') ? kind.split(',')[0] : null;
    const wantsGuard = kind.includes('im Rumpf');
    if (wantsWatcher && !r.head.includes(wantsWatcher)) fWithoutWatcher.push(r.key);
    if (wantsGuard && !hasGuard) fWithoutGuard.push(r.key);
    /* 'selbstbezug' HEISST: DER BENUTZER KOMMT AUS req.user UND NIE AUS DER
       ADRESSE. */
    if (kind === 'selbstbezug' &&
        (!r.core.includes('req.user.id') ||
         /req\.params\.(?!sessionId)/.test(r.core))) fWithoutSelf.push(r.key);
    /* Die Bestaetigung steht ABSICHTLICH NICHT in CORE_WORDS: sie ist keine
       Rechtefrage. */
    const hasSecond = r.head.includes(SECOND_WORD) || r.core.includes(SECOND_WORD);
    if (kind.includes('zweitbestaetigt') && !hasSecond) fWithoutSecond.push(r.key);
    if (!kind.includes('zweitbestaetigt') && hasSecond) fTooManySecond.push(r.key);
    if (kind === 'offen' && hasGuard) fTooMany.push(r.key);
    /* Und die andere Haelfte derselben Gegenrichtung: eine Route, die "offen"
       heisst, darf auch keinen benannten Waechter in der Routenzeile tragen. */
    if (kind === 'offen' && GUARD_WORDS.some(w => r.head.includes(w)))
      fTooManyGuard.push(r.key);
  }
  check('Jede Route mit benanntem Waechter traegt ihn in der Routenzeile',
    fWithoutWatcher.length === 0, fWithoutWatcher.join(' · '));
  check('Jede Route mit zwei Rechteklassen hat die Klemme im Rumpf',
    fWithoutGuard.length === 0, fWithoutGuard.join(' · '));
  check('Jede Route mit Selbstbezug nimmt den Benutzer aus der Sitzung',
    fWithoutSelf.length === 0, fWithoutSelf.join(' · '));
  /* DIE NEUE ART AUS 0.8.90, in BEIDE Richtungen. */
  check('Jede zweitbestaetigte Route ruft die Bestaetigung wirklich',
    fWithoutSecond.length === 0, fWithoutSecond.join(' · '));
  check('Und keine andere tut es stillschweigend',
    fTooManySecond.length === 0, fTooManySecond.join(' · '));
  /* Und die Gegenprobe zur Pruefung selbst: sie darf nicht deshalb gruen
     sein, weil sie beides durchgehen laesst. */
  const selfMissing = (core) =>
    !core.includes('req.user.id') || /req\.params\.(?!sessionId)/.test(core);
  check('Und sie faende eine Route, die den Benutzer gar nicht nennt',
    selfMissing('  res.json(auth.sessionsOf(1));'), 'die fehlende Nennung faellt nicht auf');
  check('Und eine, die die Nummer aus der Adresse nimmt',
    selfMissing('  auth.sessionsOf(req.user.id, req.params.id);'),
    'die fremde Nummer faellt nicht auf');
  check('Den richtigen Fall laesst sie dagegen durch',
    !selfMissing('  auth.endSession(req.user.id, req.params.sessionId);'),
    'die Pruefung faerbt sich am richtigen Fall');
  // Die Gegenrichtung: wo "offen" steht, darf auch nichts stehen.
  check('Und wo offen steht, steht auch keine Klemme',
    fTooMany.length === 0, fTooMany.join(' · '));
  check('Und erst recht kein Waechter in der Routenzeile',
    fTooManyGuard.length === 0, fTooManyGuard.join(' · '));

  /* WELCHE Klemme im Rumpf steht, sagt F_ROUTES nicht -- die Liste kennt nur
     die Art 'im Rumpf'. */
  const fLinkPathRoute = fFound.find(r => r.key === 'DELETE /api/links/:id');
  const fLinkPathCore = fLinkPathRoute ? fLinkPathRoute.core : '';
  check('Die Loeschroute fuer Links ist ueberhaupt da',
    fLinkPathCore.length > 0, 'die Route fehlt im Quelltext');
  check('Sie fragt nach der ZEILE, nicht nach dem Eintrag',
    fLinkPathCore.includes('mayChange(req, l.user_id)') &&
    !fLinkPathCore.includes('entryFree('),
    fLinkPathCore ? 'mayChange(req, l.user_id) fehlt oder entryFree steht noch da' : '(kein Rumpf)');
  /* Und die Gegenrichtung am Eintragen: der Waechter ist dort gefallen, die
     Zeile bekommt stattdessen ihren Verfasser. */
  const fLinkFreshRoute = fFound.find(r => r.key === 'POST /api/items/:id/links');
  const fLinkFreshCore = fLinkFreshRoute ? fLinkFreshRoute.core : '';
  check('Die Anlegeroute fuer Links ist ueberhaupt da',
    fLinkFreshCore.length > 0, 'die Route fehlt im Quelltext');
  check('Sie schreibt den Verfasser in die neue Zeile',
    fLinkFreshCore.includes('INSERT INTO links (item_id, url, sort_order, user_id)') &&
    fLinkFreshCore.includes('req.user.id'),
    fLinkFreshCore ? 'die Spalte user_id fehlt im INSERT' : '(kein Rumpf)');

  /* Dasselbe am sechsten Traeger. */
  const fAttachmentsPathRoute = fFound.find(r => r.key === 'DELETE /api/attachments/:id');
  const fAttachmentsPathCore = fAttachmentsPathRoute ? fAttachmentsPathRoute.core : '';
  check('Die Loeschroute fuer Dateien ist ueberhaupt da',
    fAttachmentsPathCore.length > 0, 'die Route fehlt im Quelltext');
  check('Sie fragt nach der DATEI, nicht nach dem Eintrag',
    fAttachmentsPathCore.includes('mayChange(req, a.user_id)') &&
    !fAttachmentsPathCore.includes('entryFree('),
    fAttachmentsPathCore ? 'mayChange(req, a.user_id) fehlt oder entryFree steht noch da' : '(kein Rumpf)');
  const fAttachmentsFreshRoute = fFound.find(r => r.key === 'POST /api/items/:id/attachments');
  const fAttachmentsFreshCore = fAttachmentsFreshRoute ? fAttachmentsFreshRoute.core : '';
  check('Die Anlegeroute fuer Dateien ist ueberhaupt da',
    fAttachmentsFreshCore.length > 0, 'die Route fehlt im Quelltext');
  check('Sie schreibt den Verfasser in die neue Zeile',
    fAttachmentsFreshCore.includes('data, sort_order, user_id') &&
    fAttachmentsFreshCore.includes('req.user.id'),
    fAttachmentsFreshCore ? 'die Spalte user_id fehlt im INSERT' : '(kein Rumpf)');

  /* DIE BESCHRIFTUNG DES EINGRIFFSVERMERKS HAENGT AN DIESER KLEMME. */
  const fImagePath = fFound.find(r => r.key === 'DELETE /api/comment-images/:id');
  const fImagePathCore = fImagePath ? fImagePath.core : '';
  check('Die Loeschroute fuer Kommentarbilder ist ueberhaupt da',
    fImagePathCore.length > 0, 'die Route fehlt im Quelltext');
  check('Sie steht hinter mayChange -- Verfasser oder Admin',
    fImagePathCore.includes('mayChange(req, b.user_id)'),
    fImagePathCore ? 'die Klemme fehlt im Rumpf' : '(kein Rumpf)');
  check('Und der Vermerk zaehlt nur bei einem anderen als dem Verfasser hoch',
    fImagePathCore.includes('b.user_id !== req.user.id') &&
    fImagePathCore.includes('images_removed = images_removed + 1'),
    fImagePathCore ? 'Bedingung oder Hochzaehlen fehlt' : '(kein Rumpf)');
  /* Und genau eines von beiden: der andere Zweig setzt "bearbeitet". Ein
     zweites if statt des else liesse beides zugleich zu. */
  check('Der andere Zweig setzt bearbeitet, und es ist ein else',
    /\belse\s*\n?\s*commentEdited\.run\(b\.comment_id\)/.test(fImagePathCore),
    fImagePathCore ? 'kein else-Zweig mit commentEdited' : '(kein Rumpf)');
  /* DER SATZ STEHT SEIT 0.24.0 IN DER SPRACHDATEI. */
  const fAppSource = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8')
    + '\u0000' + fs.readFileSync(path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8');
  check('Erst deshalb darf der Bildschirm die Rolle nennen',
    fAppSource.includes('vom Admin entfernt') &&
    fImagePathCore.includes('mayChange(req, b.user_id)') &&
    fImagePathCore.includes('b.user_id !== req.user.id'),
    fAppSource.includes('vom Admin entfernt')
      ? 'die Beschriftung steht da, die Klemme nicht mehr'
      : 'die Beschriftung fehlt in public/app.js');
  // Kein Wer, kein Wann, keine Kette: es bleibt bei der Rolle.
  check('Und nennt dabei keinen Namen und keinen Zeitpunkt',
    !/cmt-edited[^`]*authorName|cmt-edited[^`]*fmtDate/.test(fAppSource),
    'der Vermerk nennt Person oder Zeitpunkt');

  /* Den vorhandenen Waechter erweitern, die Regel nicht ein zweites Mal
     hinschreiben: steht die Adminfrage irgendwann zweimal da, laufen die
     beiden Stellen auseinander und keine Gegenprobe belegt mehr etwas. */
  const fAdminQuestions = fSource.split("role === 'admin'").length - 1;
  check('Die Adminfrage steht genau einmal im Quelltext',
    fAdminQuestions === 1, `${fAdminQuestions} Vorkommen`);
  const fSmallestQuestions = fSource.split("role === 'owner'").length - 1;
  check('Und die Eigentuemerfrage ebenfalls',
    fSmallestQuestions === 1, `${fSmallestQuestions} Vorkommen`);
  // Der Eigentuemer ist keine kleinste Nummer, sondern eine Rolle.
  const fMinIdImServer = fSource.split('MIN(id)').length - 1;
  check('Und der Server fragt nirgends mehr nach der kleinsten Nummer',
    fMinIdImServer === 0, `${fMinIdImServer} Vorkommen`);
  // "Leitung" ist ein frueherer Name des Admins.
  const fLine = ['server.js', 'auth.js', 'db.js', 'public/app.js', 'public/index.html']
    .filter(d => fs.readFileSync(path.join(__dirname, d), 'utf8').includes('Leitung'));
  check('Das Wort Leitung kommt nirgends mehr vor', fLine.length === 0, fLine.join(' · '));

  /* DIE SPANNE DES GEWICHTS STEHT AN GENAU EINER STELLE. */
  for (const [word, wo] of [['WEIGHT_MIN = ', 'die Untergrenze'], ['WEIGHT_MAX = ', 'die Obergrenze']]) {
    const n = fSource.split(word).length - 1;
    check(`${wo[0].toUpperCase()}${wo.slice(1)} des Gewichts steht genau einmal im Quelltext`,
      n === 1, `${n} Vorkommen`);
  }
  const fValidDef = fSource.split('function validWeight').length - 1;
  check('Und es gibt genau eine Pruefung darauf', fValidDef === 1, `${fValidDef} Vorkommen`);
  /* DIE OBERFLAECHE KENNT DIE SPANNE NICHT. */
  check('Die Oberflaeche traegt die Spanne nicht ein zweites Mal',
    !/GEWICHT_(MIN|MAX)/.test(fAppSource),
    (fAppSource.match(/.*GEWICHT_(MIN|MAX).*/) || [''])[0]);
  /* DER NENNER DARF NIE UEBER ALLE KRITERIEN GEHEN. */
  const fCodeRows = fSource.split('\n')
    .filter(z => { const t = z.trim(); return t && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*'); })
    .join('\n');
  check('Nirgends wird ueber ALLE Gewichte summiert',
    !/SUM\(\s*\w*\.?weight\s*\)/i.test(fCodeRows),
    (fCodeRows.match(/.*SUM\(\s*\w*\.?weight\s*\).*/i) || [''])[0]);
  /* Und die Gegenprobe zum Waechter selbst: er darf nicht deshalb gruen sein,
     weil er gar nichts mehr ansieht. */
  check('Und der Waechter sieht wirklich Code an',
    /JOIN rating_criteria c ON c\.id = r\.criterion_id/.test(fCodeRows),
    'der Waechter liest keinen Code mehr');

  /* DER AUSGELIEFERTE TYP KOMMT NIE AUS DER DATENBANK. */
  const TYPE_WORDS = ["res.set('Content-Type'", 'res.set("Content-Type"',
                      "res.setHeader('Content-Type'", 'res.type('];
  const typeCount = (text) => TYPE_WORDS
    .map(z => [z, text.split(z).length - 1]).filter(([, n]) => n > 0);
  const fTypeSelf = typeCount(fSource);
  check('server.js setzt den Content-Type an keiner Stelle selbst',
    fTypeSelf.length === 0, fTypeSelf.map(([z, n]) => `${z} (${n}x)`).join(' · '));
  /* DIE GEGENPROBE ZUM WAECHTER SELBST. */
  check('Und er wuerde eine ergaenzte Auslieferung wirklich finden',
    typeCount("app.get('/x', (req, res) => { res.set('Content-Type', 'video/mp4'); });").length === 1,
    'der Waechter sieht die Verletzung nicht');
  const fAttachmentsSource = fs.readFileSync(path.join(__dirname, 'attachments.js'), 'utf8');
  // Erst das Vorhandensein, dann die Eigenschaft: ohne die
// Funktion belegte die Zeile darunter nichts.
  check('Die Ableitung aus den Bytes gibt es', fAttachmentsSource.includes('function typeFromBytes('),
    'typeFromBytes fehlt in attachments.js');
  const fRawCore = (() => {
    const a = fSource.indexOf("app.get('/api/photos/:id/raw'");
    if (a < 0) return '';
    const e = fSource.indexOf('\n});', a);
    return e < 0 ? '' : fSource.slice(a, e);
  })();
  check('Die Fotoroute ist ueberhaupt da', fRawCore.length > 0, 'die Route fehlt im Quelltext');
  check('Und sie ruft die Ableitung aus den Bytes auf',
    fRawCore.includes('attachments.setImageHeader('),
    fRawCore ? 'setImageHeader fehlt im Rumpf' : '(kein Rumpf)');
  check('Der gemeldete Typ kommt in ihrem Rumpf gar nicht mehr vor',
    !fRawCore.includes('mime'), fRawCore ? 'mime steht noch im Rumpf' : '(kein Rumpf)');

  /* DER FEHLER-HANDLER TRENNT ZWEI DINGE. Absicht behaelt ihren Rang, alles
     Uebrige wird 500 mit festem Text. */
  const fErrorCore = (() => {
    const a = fSource.indexOf('app.use((err, req, res, next)');
    if (a < 0) return '';
    const e = fSource.indexOf('\n});', a);
    return e < 0 ? '' : fSource.slice(a, e);
  })();
  check('Den Fehler-Handler gibt es', fErrorCore.length > 0, 'kein Handler gefunden');
  check('Er kennt die Markierung absichtlicher Fehler',
    fErrorCore.includes('err.status'), fErrorCore ? 'err.status fehlt' : '(kein Rumpf)');
  /* SEIT 0.24.0 STEHT DORT KEIN TEXT MEHR, SONDERN EIN SCHLUESSEL -- und die
     Zusicherung dreht sich mit um: der Handler darf bei
     500 nichts VERRATEN, und das tut ein Schluessel noch weniger als ein
     fester Satz. */
  check('Und er liefert die Meldung eines Serverfehlers nicht aus',
    /res\.status\(500\)\.json\(\{ error: t\(locale, 'server\.error'\) \}\)/.test(fErrorCore)
      && !/res\.status\(500\)[^\n]*err\.(message|stack)/.test(fErrorCore),
    fErrorCore ? 'kein Schluessel bei 500' : '(kein Rumpf)');

  /* SAUBERES HERUNTERFAHREN. */
  check('SIGTERM und SIGINT werden behandelt',
    fSource.includes("['SIGTERM', 'SIGINT']"), 'kein Handler fuer die Abbruchzeichen');
  check('Und dabei wird die WAL abgeschlossen',
    fSource.includes("wal_checkpoint(TRUNCATE)") && fSource.includes('db.close()'),
    'kein wal_checkpoint oder kein db.close');


  /* --- 0.8.70: EINE ABBILDUNG JE EINTRAG, NICHT ZWEI ----------------------
     Bis 0.8.60 stand sie mitten in der Exportroute. */
  const IMAGE_MARKS = ['function entryAsBundle(', 'favorite: pins.has(',
                         'author: authorName(it.user_id)'];
  const imageCount = (text) => IMAGE_MARKS.map(m => [m, text.split(m).length - 1]);
  const fImage = imageCount(fCodeRows);
  check('Die Abbildung je Eintrag kommt genau einmal im Quelltext vor',
    fImage.every(([, n]) => n === 1), fImage.map(([m, n]) => `${m} (${n}x)`).join(' · '));
  /* DIE GEGENPROBE ZUM WAECHTER SELBST: er darf nicht deshalb gruen sein,
     weil er gar nichts mehr ansieht. */
  check('Und er wuerde eine zweite Abbildung wirklich finden',
    imageCount(fCodeRows + '\nconst o = { favorite: pins.has(it.id) };')
      .some(([, n]) => n === 2),
    'der Waechter sieht die zweite Abbildung nicht');
  const fImageCalls = fCodeRows.split('entryAsBundle(').length - 1;
  check('Sie wird an drei Stellen gerufen: Export, Einzelexport, Papierkorb',
    fImageCalls === 4, `${fImageCalls} Vorkommen samt Deklaration`);

  /* Dasselbe in der Gegenrichtung. */
  const IMPORT_MARKS = ['function importInto(', 'const itemAuthor = authorId(it.author)'];
  const fImportMarks = IMPORT_MARKS.map(m => [m, fCodeRows.split(m).length - 1]);
  check('Und der Deserialisierer ebenfalls genau einmal',
    fImportMarks.every(([, n]) => n === 1), fImportMarks.map(([m, n]) => `${m} (${n}x)`).join(' · '));
  const fImportCalls = fCodeRows.split('importInto(').length - 1;
  check('Er wird an zwei Stellen gerufen: Import und Wiederherstellen',
    fImportCalls === 3, `${fImportCalls} Vorkommen samt Deklaration`);

  /* DIE FORMATNUMMER STEHT AN GENAU EINER STELLE. */
  const fFormatDef = fCodeRows.split('EXCHANGE_FORMAT = ').length - 1;
  check('Die Formatnummer steht genau einmal im Quelltext', fFormatDef === 1,
    `${fFormatDef} Vorkommen`);
  check('Und nirgends noch einmal als nackte Zahl',
    !/version:\s*\d/.test(fCodeRows),
    (fCodeRows.match(/.*version:\s*\d.*/) || [''])[0]);

  /* --- 0.8.70: DER PAPIERKORB FASST KEINE BESTEHENDE ABFRAGE AN -----------
     Die tragende Regel der Runde. */
  const DATATABLES = ['items', 'photos', 'comments', 'ratings', 'test_days',
                            'links', 'attachments', 'comment_images', 'item_tags',
                            'test_day_tags', 'item_pins'];
  const inventoryQueries = (text) => text.split('\n')
    .filter(z => DATATABLES.some(t =>
      z.includes(`FROM ${t}`) || z.includes(`INTO ${t}`) || z.includes(`UPDATE ${t} `)));
  const tainted = (rows) => rows.filter(z => /trash|deleted/i.test(z));
  const fInventoryRows = inventoryQueries(fCodeRows);
  // Erst das Vorhandensein, dann die Eigenschaft: ohne
// Zeilen bliebe jede Verneinung darauf wahr und belegte nichts.
  check('Der Waechter findet die Abfragen auf den Bestand ueberhaupt',
    fInventoryRows.length > 30, `${fInventoryRows.length} Zeilen`);
  check('Keine davon nennt den Papierkorb oder einen Zustand geloescht',
    tainted(fInventoryRows).length === 0,
    tainted(fInventoryRows).slice(0, 3).join(' · '));
  check('Und er wuerde einen solchen Zusatz wirklich finden',
    tainted(inventoryQueries(
      "  const x = db.prepare('SELECT * FROM items WHERE deleted = 0').all();")).length === 1,
    'der Waechter sieht den Zusatz nicht');

  /* KEIN BLOCK FUER EINE TABELLE. */
  const fDbSource = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
  /* BEIDE FORMEN IN EINEM MUSTER: die Marke und ihre Absage duerfen durch
     Weissraum und einen Kommentarstrich getrennt sein, und mehr nicht. */
  const fMarkNumbers = [...new Set(
    (fDbSource.match(/MIGRATION [0-9.]+x?\s*—[^\n]*\n?\s*(?:\*|\/\/)?\s*ENTFAELLT MIT 1\.0/g) || [])
      .map(m => (m.match(/MIGRATION ([0-9.]+)/) || [])[1])
      .filter(Boolean).map(nr => nr.replace(/\.$/, '').replace(/\./g, '')))];
  const fMigrations = [...new Set([...(fDbSource.match(/function (migration\w+)\s*\(/g) || [])
    .map(m => (m.match(/function (migration\w+)/) || [])[1])])];
  check('Es gibt keine Migrationsfunktion mehr — 0.33.0',
    fMigrations.length === 0, fMigrations.join(' · ') || 'keine');
  /* UND KEINE MARKE OHNE BLOCK. */
  check('Und keine Marke „ENTFAELLT MIT 1.0", hinter der nichts mehr liegt',
    fMarkNumbers.length === 0, fMarkNumbers.join(' · ') || 'keine');
  /* UND DER ZAEHLER FAENGT BEIDE FORMEN WIRKLICH. */
  const fMarkShapes = (text) => (text.match(
    /MIGRATION [0-9.]+x?\s*—[^\n]*\n?\s*(?:\*|\/\/)?\s*ENTFAELLT MIT 1\.0/g) || []).length;
  check('Und der Zaehler faengt BEIDE Markenformen — gestellt und nachgemessen',
    fMarkShapes('// MIGRATION 0.21.0 — ENTFAELLT MIT 1.0\n') === 1 &&
    fMarkShapes('/* ====== MIGRATION 0.24.1 — DIE NAMEN DES BESTANDS =====\n' +
                '   ENTFAELLT MIT 1.0.\n') === 1 &&
    fMarkShapes('// hier steht nichts dergleichen\n') === 0,
    `${fMarkShapes('// MIGRATION 0.21.0 — ENTFAELLT MIT 1.0\n')} / ` +
    `${fMarkShapes('/* ====== MIGRATION 0.24.1 — X =====\n   ENTFAELLT MIT 1.0.\n')}`);
  /* UND DER FUNKTIONSZAEHLER FAENGT AUCH EINEN NAMEN MIT GEGENSTAND. */
  const fFunctionShapes = (text) =>
    (text.match(/function (migration\w+)\s*\(/g) || []).length;
  check('Und der Funktionszaehler faengt auch einen Namen mit Gegenstand',
    fFunctionShapes('function migration0290() {') === 1 &&
    fFunctionShapes('function migration0250Language() {') === 1 &&
    fFunctionShapes('function renumberCriteria() {') === 0,
    `${fFunctionShapes('function migration0250Language() {')}`);
  /* UND DIE SPALTEN, DIE SIE NACHGERUESTET HABEN, STEHEN WEITER IN DER DDL. */
  check('Und die nachgeruesteten Spalten stehen weiter in der DDL',
    /due_date TEXT/.test(fDbSource) && /zoom REAL NOT NULL DEFAULT 100/.test(fDbSource) &&
    /rejected_reason TEXT/.test(fDbSource) && /weight REAL NOT NULL DEFAULT 1/.test(fDbSource),
    'eine der vier fehlt im Schema');
  /* UND db.exec(SCHEMA) STEHT ALS ERSTE ANWEISUNG NACH DER GRUNDAUSSTATTUNG
     -- Zusage 2. */
  check('db.exec(SCHEMA) steht unmittelbar hinter der Faltung der Suche',
    /db\.function\('kkl'[^\n]*\);\s*\n+db\.exec\(SCHEMA\);/.test(fDbSource),
    (fDbSource.match(/db\.function\('kkl'[^\n]*\);[\s\S]{0,200}/) || [''])[0].slice(0, 200));
  /* UND db.js LIEST DAS NAMENSWOERTERBUCH NICHT MEHR -- Frage F9. */
  /* GELESEN WIRD CODE UND NICHT DER KOMMENTAR DANEBEN: die Probe in db.js
     ERKLAERT in ihrem Kopf, warum sie ihre Tafel selbst traegt und nicht aus
     jener Datei liest -- ein Satz darueber, was weggefallen ist, ist keine
     zweite Wahrheit, sondern das Gegenteil davon. */
  const fDbCode = fDbSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  check('Und db.js liest tools/dictionary.json nicht mehr',
    !/dictionary\.json/.test(fDbCode),
    (fDbCode.match(/[^\n]*dictionary\.json[^\n]*/) || ['(liest es nicht — richtig)'])[0]);
  check('Und die Datei gibt es trotzdem noch',
    fs.existsSync(path.join(__dirname, 'tools', 'dictionary.json')),
    'tools/dictionary.json fehlt');
  check('Der Papierkorb steht als vollstaendige DDL im Schema',
    fDbSource.includes('CREATE TABLE IF NOT EXISTS trash (') &&
    fDbSource.includes('CREATE TABLE IF NOT EXISTS trash_bytes ('),
    'die DDL fehlt');
  /* UND deleted_by GEHOERT AUSDRUECKLICH NICHT INS AUFFANGNETZ. */
  const fNetCore = (() => {
    const a = fDbSource.indexOf('function assignInventory(');
    if (a < 0) return '';
    const e = fDbSource.indexOf('\n}', a);
    return e < 0 ? '' : fDbSource.slice(a, e);
  })();
  check('Das Auffangnetz gibt es ueberhaupt', fNetCore.length > 0, 'assignInventory fehlt');
  check('Es kennt weiterhin genau die sechs Traeger mit user_id',
    /\['items', 'comments', 'test_days', 'ratings', 'links', 'attachments'\]/.test(fNetCore),
    (fNetCore.match(/for \(const tabelle of .*/) || [''])[0]);
  check('Und den Papierkorb ausdruecklich nicht',
    !fNetCore.includes('trash'), 'papierkorb steht im Auffangnetz');

  /* DIE FRIST STEHT IM SERVER, NICHT IN DER OBERFLAECHE. */
  const fDeadlineDef = fCodeRows.split('TRASH_DAYS = ').length - 1;
  check('Die Frist steht genau einmal im Server', fDeadlineDef === 1, `${fDeadlineDef} Vorkommen`);
  check('Die Oberflaeche rechnet die verbleibenden Tage nicht selbst nach',
    !/tageOffen\s*=/.test(fAppSource),
    (fAppSource.match(/.*tageOffen\s*=.*/) || [''])[0]);

  /* 0.8.70: DIE SICHERUNG SCHREIBT UNTER EINEM ARBEITSNAMEN. */
  const fBackupCore = (() => {
    const a = fCodeRows.indexOf("app.post('/api/backup'");
    if (a < 0) return '';
    const e = fCodeRows.indexOf('\n});', a);
    return e < 0 ? '' : fCodeRows.slice(a, e);
  })();
  check('Die Route zur Sicherung ist ueberhaupt da', fBackupCore.length > 0,
    'kein Rumpf gefunden');
  check('Sie schreibt unter einem Arbeitsnamen und benennt erst danach um',
    /VACUUM INTO \?'\)\.run\(becoming\)/.test(fBackupCore) &&
    fBackupCore.includes('fs.renameSync(becoming, file)'),
    fBackupCore ? 'kein Arbeitsname im Rumpf' : '(kein Rumpf)');
  check('Und entfernt im Fehlerfall NUR den Arbeitsnamen',
    fBackupCore.includes('fs.unlinkSync(becoming)') &&
    !fBackupCore.includes('fs.unlinkSync(file)'),
    (fBackupCore.match(/.*fs\.unlinkSync\(.*/g) || []).join(' · '));
  /* Und die Gegenprobe zum Waechter selbst: er darf nicht deshalb gruen sein,
     weil er gar nichts mehr ansieht. */
  check('Und der Waechter wuerde ein Aufraeumen an der Zieldatei finden',
    /fs\.unlinkSync\(datei\)/.test('    try { fs.unlinkSync(datei); } catch {}'),
    'der Waechter sieht die Verletzung nicht');

  /* DER COOKIENAME KOMMT AUS auth.COOKIE_NAME UND WIRD NIRGENDS
     ABGESCHRIEBEN. */
  const COOKIE_FILES = ['server.js', 'db.js', 'attachments.js', 'keys.js',
                          'public/app.js', 'public/index.html', 'usertool.js'];
  // Derselbe Schnitt wie beim Sprachwaechter, nur andersherum: dort bleiben
// die Kommentare uebrig, hier faellt genau das weg.
  function withoutComments(text) {
    let inBlock = false;
    return text.split('\n').map(z => {
      const t = z.trim();
      if (inBlock) { if (t.includes('*/')) inBlock = false; return ''; }
      if (t.startsWith('/*')) { if (!t.includes('*/')) inBlock = true; return ''; }
      if (t.startsWith('//')) return '';
      const pos = z.indexOf('//');
      return (pos >= 0 && !/['"`]/.test(z.slice(0, pos))) ? z.slice(0, pos) : z;
    }).join('\n');
  }
  const cookieCount = (text) => (withoutComments(text).match(/kriterion_session/g) || []).length;
  const fCookie = COOKIE_FILES
    .map(d => [d, cookieCount(fs.readFileSync(path.join(__dirname, d), 'utf8'))])
    .filter(([, n]) => n > 0);
  /* ERST DAS VORHANDENSEIN: ein Waechter, der auf null
     Dateien laeuft, ist gruen und belegt nichts. */
  check('Der Cookiewaechter sieht alle sieben ausgelieferten Dateien an',
    COOKIE_FILES.length === 7 &&
    COOKIE_FILES.every(n => fs.existsSync(path.join(__dirname, n))),
    JSON.stringify(COOKIE_FILES.filter(n => !fs.existsSync(path.join(__dirname, n)))));
  check('Der Cookiename steht in keiner davon abgeschrieben',
    fCookie.length === 0, fCookie.map(([d, n]) => `${d} (${n}x)`).join(' · '));
  check('Und in auth.js entsteht er genau einmal',
    (withoutComments(fs.readFileSync(path.join(__dirname, 'auth.js'), 'utf8'))
      .match(/'kriterion_session'/g) || []).length === 1,
    'der eine Ort ist nicht mehr der eine');
  /* DIE GEGENPROBE ZUM WAECHTER SELBST: er darf nicht deshalb gruen sein,
     weil er gar keinen Code mehr liest. */
  check('Und der Waechter wuerde ein abgeschriebenes Vorkommen finden',
    cookieCount("const c = req.cookies['kriterion_session'];") === 1,
    'der Waechter sieht den Namen nicht');
  check('Den Namen im Kommentar laesst er dagegen in Ruhe',
    cookieCount('// Der Cookie heisst kriterion_session, wenn kein Proxy davorsteht.') === 0,
    'der Waechter faerbt sich am Kommentar');

  /* TOKEN ODER LINK -- eines von beiden am Bildschirm, und durchgehalten. */
  const tokenCount = (text) => (text.match(/\bToken\b/g) || []).length;
  const fToken = tokenCount(fs.readFileSync(path.join(__dirname, 'public/app.js'), 'utf8'));
  check('Am Bildschirm heisst es Link und nicht anders',
    fToken === 0, `public/app.js (${fToken}x)`);
  check('Und der Waechter wuerde das Wort wirklich finden',
    tokenCount("toast('Der Token ist abgelaufen');") === 1,
    'der Waechter sieht das Wort nicht');
  check('Den Bezeichner token laesst er dagegen in Ruhe',
    tokenCount("body: JSON.stringify({ token: schluessel })") === 0,
    'der Waechter faerbt sich am Bezeichner');
  /* Und die Gegenrichtung, damit die Entscheidung nicht bloss eine
     Verneinung ist: das Wort, das dort STEHEN soll, steht auch da. */
  check('Und das Wort Link steht am Bildschirm wirklich',
    /Einladungslink/.test(fs.readFileSync(path.join(__dirname, 'public/app.js'), 'utf8')),
    'die Karte nennt den Link nicht beim Namen');

  /* SICHERUNG ODER BACKUP -- eines von beiden, und durchgehalten. */
  const BACKUP_FILES = ['server.js', 'db.js', 'auth.js', 'attachments.js', 'keys.js',
                             'public/app.js', 'public/index.html', 'usertool.js'];
  /* GROSSGESCHRIEBEN GESUCHT, und das ist keine Nachlaessigkeit: gemeint ist
     das deutsche SUBSTANTIV. */
  const withoutConsole = (src) => {
    let out = '', i = 0;
    const rx = /\bconsole\.(?:log|warn|error)\s*\(/g;
    let m;
    while ((m = rx.exec(src)) !== null) {
      if (m.index < i) continue;
      out += src.slice(i, m.index);
      let j = m.index + m[0].length, depth = 1, q = null;
      while (j < src.length && depth > 0) {
        const c = src[j];
        if (q) { if (c === '\\') { j += 2; continue; } if (c === q) q = null; j++; continue; }
        if (c === "'" || c === '"' || c === '`') { q = c; j++; continue; }
        if (c === '(') depth++; else if (c === ')') depth--;
        j++;
      }
      i = j; rx.lastIndex = j;
    }
    return out + src.slice(i);
  };
  const backupCount = (text) => (withoutConsole(text).match(/\bBackup\b/g) || []).length;
  const fBackup = BACKUP_FILES
    .map(d => [d, backupCount(fs.readFileSync(path.join(__dirname, d), 'utf8'))])
    .filter(([, n]) => n > 0);
  check('Das Wort Backup steht in keiner ausgelieferten Datei mehr',
    fBackup.length === 0, fBackup.map(([d, n]) => `${d} (${n}x)`).join(' · '));
  check('Und der Waechter wuerde es wirklich finden',
    backupCount('// Das gehoert ins Backup.') === 1, 'der Waechter sieht das Wort nicht');
  check('Den Bezeichner db.backup() laesst er dagegen in Ruhe',
    backupCount('  try { await d.backup(ziel); } catch {}') === 0,
    'der Waechter faerbt sich am Bezeichner');
  /* UND DER SCHNITT SCHNEIDET WIRKLICH NUR DEN RUF. */
  check('Und der Schnitt nimmt nur den Konsolenruf, nicht die Zeile daneben',
    backupCount("console.log('Backup written'); // Das gehoert ins Backup.") === 1,
    'der Schnitt nimmt zu viel oder zu wenig weg');

  /* SICHERHEITSPROTOKOLL ODER PROTOKOLL -- eines von beiden, und
     durchgehalten. */
  /* UND DIE SPRACHDATEI SEIT 0.24.0. */
  const PROT_FILES = ['server.js', 'db.js', 'auth.js', 'attachments.js', 'keys.js',
                        'public/app.js', 'public/index.html', 'usertool.js',
                        'public/languages/de.json'];
  const protCount = (text) => (withoutComments(text).match(/(?<!Sicherheits)\bProtokoll\b/g) || []).length;
  const fProt = PROT_FILES
    .map(d => [d, protCount(fs.readFileSync(path.join(__dirname, d), 'utf8'))])
    .filter(([, n]) => n > 0);
  check('Der Protokollwaechter sieht alle neun ausgelieferten Dateien an',
    PROT_FILES.length === 9 && PROT_FILES.every(n => fs.existsSync(path.join(__dirname, n))),
    JSON.stringify(PROT_FILES.filter(n => !fs.existsSync(path.join(__dirname, n)))));
  /* EIN VORKOMMEN SEIT 0.22.0, und es meint den Containerlog: die Message
     nach einer gescheiterten Sicherung in server.js. */
  check('Das alleinstehende Wort steht in genau einer ausgelieferten Zeile — 0.22.0',
    fProt.reduce((n, [, k]) => n + k, 0) === 1, fProt.map(([d, n]) => `${d} (${n}x)`).join(' · '));
  /* SEIT 0.24.0 STEHT SIE IN DER SPRACHDATEI und nicht mehr in server.js --
     der Satz ist derselbe, nur wohnt er jetzt dort, wo Text wohnt. */
  check('Und sie meint den Containerlog, in der Sprachdatei',
    equal(fProt.map(([d]) => d), ['public/languages/de.json']), JSON.stringify(fProt));
  /* DER SATZ WOHNT SEIT 0.24.0 IN DER SPRACHDATEI. */
  const protAppAndTexts =
    fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8') + '\u0000' +
    Object.values(JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8')))
      .flatMap(v => (typeof v === 'string' ? [v] : Object.values(v))).join('\u0000');
  /* UND DIE ZEILE, DIE SIE ZITIERT, STEHT SO IM PROTOKOLL -- 0.32.0, Punkt 28
     Fund 1. */
  check('Die Kennzahlenkarte sagt dafuer „Server-Log"',
    /im Server-Log „Key loaded from ENCRYPTION_KEY/.test(protAppAndTexts),
    'die Karte nennt das Server-Log nicht');
  check('Und sie zitiert die Zeile Zeichen fuer Zeichen, wie keys.js sie schreibt',
    fs.readFileSync(path.join(__dirname, 'keys.js'), 'utf8')
      .includes('Key loaded from ENCRYPTION_KEY'),
    'keys.js schreibt die Zeile anders');
  /* UND ALLE DREI SPRACHDATEIEN ZITIEREN DIESELBE ZEILE. */
  const protQuoted = ['de', 'en', 'tr'].filter(code => !JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'))['card.restartHint']
      .includes('Key loaded from ENCRYPTION_KEY'));
  check('Und alle drei Sprachdateien zitieren dieselbe Zeile',
    protQuoted.length === 0, protQuoted.join(' · ') || 'alle drei');
  /* DIE GEGENPROBE ZUM WAECHTER SELBST: er darf nicht deshalb gruen sein,
     weil er gar keinen Code mehr liest -- und er darf das
     lange Wort nicht mitzaehlen, sonst waere die Entscheidung wertlos. */
  check('Und der Waechter faende ein neues alleinstehendes Vorkommen',
    protCount("  toast('Das Protokoll ist leer');") === 1, 'der Waechter sieht das Wort nicht');
  check('Das lange Wort laesst er dagegen in Ruhe',
    protCount("  toast('Das Sicherheitsprotokoll ist leer');") === 0,
    'der Waechter faerbt sich am langen Wort');
  check('Den Bezeichner cleanupLog ebenso',
    protCount('  auth.cleanupLog();') === 0, 'der Waechter faerbt sich am Bezeichner');
  check('Und den Kommentar daneben auch',
    protCount('// Die Zeile steht im Protokoll des Containers.') === 0,
    'der Waechter faerbt sich am Kommentar');
  /* Und die Gegenrichtung, damit die Entscheidung nicht bloss eine Verneinung
     ist: das Wort, das dort STEHEN soll, steht auch da -- am Bildschirm. */
  /* DIE UEBERSCHRIFT KOMMT SEIT 0.24.0 AUS DER SPRACHDATEI. */
  const protDe = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'));
  const protHeadings = [...fs.readFileSync(path.join(__dirname, 'public/app.js'), 'utf8')
    .matchAll(/<h3>([\s\S]*?)<\/h3>/g)].map(m => {
      const call = /^\$\{tH?\('([^']+)'\)\}$/.exec(m[1].trim());
      const word = call ? protDe[call[1]] : m[1];
      return typeof word === 'string' ? word.trim() : m[1].trim();
    });
  check('Und das Wort Sicherheitsprotokoll steht am Bildschirm wirklich',
    protHeadings.includes('Sicherheitsprotokoll'),
    'die Karte nennt das Sicherheitsprotokoll nicht beim Namen');

  /* RE-AUTHENTIFIZIERUNG IST DAS WORT DER PAPIERE, NICHT DES BILDSCHIRMS. */
  const reAuthCount = (text) => (text.match(/Re-?Authenti/gi) || []).length;
  const fReAuth = PROT_FILES
    .map(d => [d, reAuthCount(fs.readFileSync(path.join(__dirname, d), 'utf8'))])
    .filter(([, n]) => n > 0);
  check('Das Wort Re-Authentifizierung steht in keiner ausgelieferten Datei',
    fReAuth.length === 0, fReAuth.map(([d, n]) => `${d} (${n}x)`).join(' · '));
  check('Und der Waechter wuerde es wirklich finden',
    reAuthCount('// Die Re-Authentifizierung greift hier.') === 1,
    'der Waechter sieht das Wort nicht');
  /* DER SATZ STEHT SEIT 0.24.0 IN DER SPRACHDATEI und nicht mehr im Quelltext
     -- gesucht wird er dort, mitgezogen und nicht geloescht. */
  check('Dafuer steht das gewaehlte Wort am Bildschirm',
    JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'))
      ['dialog.confirm'] === 'Bestätigen',
    'der Dialog nennt die Bestaetigung nicht beim Namen');

  /* DAS PASSWORT REIST IM RUMPF -- UND DARF NIRGENDS AUSGEGEBEN WERDEN. */
  const fCoreOutput = withoutComments(fSource)
    .split('\n').filter(z => /console\.(log|warn|error)\([^)]*req\.body/.test(z));
  check('Keine Zeile in server.js gibt den Rumpf einer Anfrage aus',
    fCoreOutput.length === 0, fCoreOutput.join(' · '));
  check('Und der Waechter wuerde eine solche Zeile finden',
    /console\.(log|warn|error)\([^)]*req\.body/.test("  console.log('Rumpf:', req.body);"),
    'der Waechter sieht die Zeile nicht');


  /* ---------------------------------------------------------------- */
  group('Der Sprachwaechter');

  /* DEUTSCH BLEIBT DIE SPRACHE, aber Fachbegriffe werden nicht zwanghaft
     eingedeutscht. */
  const LANGUAGELIST = [
    ['Keks', 'Cookie'], ['Umstieg', 'Migration'], ['Abbild', 'Image'],
    ['Sperrdatei', 'Lockfile'], ['Doppelgänger', 'Mock'], ['Doppelgaenger', 'Mock'],
    ['mehrteilig', 'Multipart'], ['Zweigname', 'Branchname'],
    ['Rückschritt', 'Downgrade'], ['Rueckschritt', 'Downgrade'],
    ['Ereignisschleife', 'Event Loop'], ['Zeichenkette', 'String'],
    ['Abdruck', 'Fingerprint'],
    /* SEIT 0.19.1. */
    ['Faden', 'Thread']
  ];
  /* ZWEI AUSNAHMEN, UND BEIDE WAEREN SONST FALSCHE TREFFER. */
  const LANGUAGE_EXCEPTION = { Abbild: 'Abbild(?!ung)', Faden: '\\bFaden' };
  const LANGUAGEPATTERN = new RegExp(
    '(' + LANGUAGELIST.map(([w]) => LANGUAGE_EXCEPTION[w] || w).join('|') + ')', 'i');

  /* Aus einer Quelltextdatei bleiben die KOMMENTARZEILEN uebrig, aus einer
     Doku-Datei die PROSA -- Code in Zaeunen und in Backticks faellt dort
     ebenso weg. */
  /* Beide filtern ZEILENWEISE und lassen die Zeilenzahl unangetastet -- was
     nicht zaehlt, wird leer statt weggeworfen. */
  function onlyComments(text) {
    let inBlock = false;
    return text.split('\n').map(z => {
      const t = z.trim();
      if (inBlock) { if (t.includes('*/')) inBlock = false; return z; }
      if (t.startsWith('/*')) { if (!t.includes('*/')) inBlock = true; return z; }
      if (t.startsWith('//')) return z;
      const p = z.indexOf('//');
      return (p >= 0 && !/['"`]/.test(z.slice(0, p))) ? z.slice(p) : '';
    }).map(z => z.replace(/`[^`]*`/g, '')).join('\n');
  }
  function onlyProse(text) {
    let inFence = false;
    return text.split('\n').map(z => {
      if (z.trim().startsWith('```')) { inFence = !inFence; return ''; }
      return inFence ? '' : z.replace(/`[^`]*`/g, '');
    }).join('\n');
  }

  function languageHit(text, name) {
    const outcome = [];
    text.split('\n').forEach((z, i) => {
      const t = z.match(LANGUAGEPATTERN);
      if (t) outcome.push(`${name}:${i + 1} „${t[1]}"`);
    });
    return outcome;
  }

  /* twofactor.js SEIT 0.10.0 -- eine neue Quelltextdatei mit deutschen
     Kommentaren, die der Waechter nicht saehe, stuende sie nicht hier. */
  /* UND mail.js SEIT 0.33.1, aus demselben Grund wie images.js und
     batchrun.js darueber: die Datei traegt 181 deutsche Kommentarzeilen und
     stand ausserhalb jeder Sprachpruefung. */
  const LANGUAGE_SOURCES = ['server.js', 'db.js', 'auth.js', 'attachments.js', 'keys.js',
                          'usertool.js', 'keytool.js', 'twofactor.js', 'testbench.js',
                          'counterproof.js', 'public/app.js',
                          'images.js', 'batchrun.js', 'mail.js'];
  /* UND DIE MODULE DES PRUEFSTANDS DAZU -- 0.34.0. */
  const LANGUAGE_MODULES = benchFiles().filter(n => n !== 'testbench.js');
  const languageSource = [...LANGUAGE_SOURCES, ...LANGUAGE_MODULES].flatMap(n => {
    const p = path.join(__dirname, n);
    return fs.existsSync(p)
      ? languageHit(onlyComments(fs.readFileSync(p, 'utf8')), n) : [];
  });
  const languageDocsFiles = (fs.existsSync(path.join(__dirname, 'Doku'))
    ? fs.readdirSync(path.join(__dirname, 'Doku')).filter(n => n.endsWith('.md')) : [])
    // Der Auftrag der laufenden Runde bleibt aussen vor: er FUEHRT die
// Wortliste und nennt jedes dieser Woerter als Beispiel.
    .filter(n => !/^Auftrag_/.test(n))
    .map(n => path.join('Doku', n))
    /* CHANGELOG.md STEHT SEIT 0.10.0 IM WURZELVERZEICHNIS und war damit aus
       dem Blick dieses Waechters gefallen -- als `Doku/Changelog.md` lag sie
       vorher in der Sammlung oben. manual-de.md seit 0.34.2, aus demselben
       Grund: der Waechter liest Doku/*.md, und das Handbuch liegt daneben. */
    .concat(['README.md', 'CHANGELOG.md', 'manual-de.md']);
  const languageDocs = languageDocsFiles.flatMap(n => {
    const p = path.join(__dirname, n);
    return fs.existsSync(p) ? languageHit(onlyProse(fs.readFileSync(p, 'utf8')), n) : [];
  });

  /* ERST DAS VORHANDENSEIN DES GEGENSTANDS: ein Waechter,
     der auf null Dateien laeuft, ist grün und belegt nichts. */
  /* DIE ZAHL AUSDRUECKLICH, nicht nur "alle, die dastehen": eine gekuerzte
     Liste bliebe sonst gruen, und der Waechter saehe ohne jeden Hinweis nur
     noch die halbe Anwendung an. */
  check('Der Sprachwaechter sieht alle vierzehn Quelltextdateien an',
    LANGUAGE_SOURCES.length === 14 &&
    LANGUAGE_SOURCES.every(n => fs.existsSync(path.join(__dirname, n))),
    `${LANGUAGE_SOURCES.length} Dateien, fehlend: ` +
    JSON.stringify(LANGUAGE_SOURCES.filter(n => !fs.existsSync(path.join(__dirname, n)))));
  /* Und der Beleg, dass der Filter ueberhaupt etwas uebrig laesst: einer, der
     alles wegwirft, machte jede Verneinung darauf wahr. */
  const languageCommentRows = LANGUAGE_SOURCES.reduce((n, d) =>
    n + onlyComments(fs.readFileSync(path.join(__dirname, d), 'utf8'))
      .split('\n').filter(z => z.trim()).length, 0);
  check('Und aus ihnen bleiben mehr als tausend Kommentarzeilen uebrig',
    languageCommentRows > 1000, `${languageCommentRows} Zeilen`);
  check('Und mindestens zehn Dokumente daneben',
    languageDocsFiles.length >= 10, `${languageDocsFiles.length} Dokumente`);
  /* UND DIE DREI IM WURZELVERZEICHNIS SIND NAMENTLICH DABEI. */
  check('Darunter namentlich README.md, CHANGELOG.md und manual-de.md',
    ['README.md', 'CHANGELOG.md', 'manual-de.md']
      .every(n => languageDocsFiles.includes(n)),
    languageDocsFiles.filter(n => !n.startsWith('Doku')).join(' '));
  check('Die Kommentare des Quelltextes benutzen die heutigen Fachwoerter',
    languageSource.length === 0, languageSource.slice(0, 12).join(' · '));
  check('Die Dokumente ebenso',
    languageDocs.length === 0, languageDocs.slice(0, 12).join(' · '));

  /* ACHT GEGENPROBEN AN GESTELLTEN TEXTEN, damit der Waechter nicht bei der
     guten Absicht bleibt. */
  check('Er liest ueberhaupt noch etwas: ein Kommentar mit „Keks" faellt auf',
    languageHit(onlyComments('// Der Keks traegt Secure.\nconst a = 1;'), 'x').length === 1,
    JSON.stringify(languageHit(onlyComments('// Der Keks traegt Secure.'), 'x')));
  check('Und ein Fliesskommentar mit „Umstieg" ebenso',
    languageHit(onlyComments('/* Der Umstieg\n   laeuft einmal. */'), 'x').length === 1);
  /* DIE UMGEKEHRTE GEGENPROBE, und sie ist die eigentliche Ausnahme dieses
     Waechters: CODE meckert er NICHT an. */
  check('Aber Code laesst er in Ruhe -- ein Bezeichner ist keine Sprache',
    languageHit(onlyComments("const keksWert = 'abc';\nlet Umstieg = 1;"), 'x').length === 0,
    JSON.stringify(languageHit(onlyComments("const keksWert = 'abc';"), 'x')));
  check('Auch in einem Kommentar bleibt der zitierte Bezeichner unberuehrt',
    languageHit(onlyComments('// Der Wert steht in `keksWert` und heisst so.'), 'x').length === 0,
    JSON.stringify(languageHit(onlyComments('// Der Wert steht in `keksWert`.'), 'x')));
  /* Und die Ausnahme, die eine echte Falle waere: „Abbildung" ist eine
     Zuordnung, kein Image. */
  check('„Abbild" faengt er -- das ist das Image',
    languageHit(onlyComments('// Das Abbild wird gebaut.'), 'x').length === 1);
  check('Aber „Abbildung" laesst er stehen -- das ist eine Zuordnung',
    languageHit(onlyComments('// Die Abbildung je Eintrag steht einmal.'), 'x').length === 0,
    JSON.stringify(languageHit(onlyComments('// Die Abbildung je Eintrag.'), 'x')));
  /* Dieselbe Ordnung fuer die zweite Ausnahme, seit 0.19.1: erst der Treffer,
     dann die Ausnahme -- ohne die erste Zeile bliebe die zweite auch dann
     gruen, wenn der Waechter das Wort gar nicht mehr kennte. */
  check('„Faden" faengt er -- das ist der Thread',
    languageHit(onlyComments('// Die Fadenzahl steht fest.'), 'x').length === 1);
  check('Aber „Pfaden" laesst er stehen -- das ist der Dativ von Pfad',
    languageHit(onlyComments('// Aufgeloest wie jeder Pfad, wegen der Pfaden.'), 'x').length === 0,
    JSON.stringify(languageHit(onlyComments('// wegen der Pfaden.'), 'x')));
  check('Und in einem Dokument faengt er die Prosa, nicht den Code im Zaun',
    languageHit(onlyProse('Der Keks ist da.\n```\nconst keks = 1;\n```\n'), 'x').length === 1,
    JSON.stringify(languageHit(onlyProse('Der Keks ist da.\n```\nconst keks = 1;\n```\n'), 'x')));
  check('Auch ein zitierter Bezeichner in Backticks bleibt unberuehrt',
    languageHit(onlyProse('Er heisst `umstiegGewicht()` und nicht anders.'), 'x').length === 0,
    JSON.stringify(languageHit(onlyProse('Er heisst `umstiegGewicht()`.'), 'x')));

  /* Die Liste bleibt kurz -- das ist keine Geschmacksfrage, sondern die
     Bedingung dafuer, dass der Waechter nicht abgeschaltet wird. */
  check('Die Wortliste bleibt kurz',
    LANGUAGELIST.length <= 15, `${LANGUAGELIST.length} Zeilen`);
  /* UND DIE ZAHL AUSDRUECKLICH, nicht nur die Obergrenze: vierzehn Zeilen
     fuer zwoelf Woerter. */
  check('Es sind vierzehn Zeilen fuer zwoelf Woerter',
    LANGUAGELIST.length === 14 && new Set(LANGUAGELIST.map(([, w]) => w)).size === 12,
    `${LANGUAGELIST.length} Zeilen, ${new Set(LANGUAGELIST.map(([, w]) => w)).size} Woerter`);
  /* Und die eigenen Bilder des Projekts stehen ausdruecklich NICHT darin:
     sie sind keine Uebersetzungen und bleiben. */
  check('Die eigenen Begriffe des Projekts stehen nicht auf der Liste',
    !['Stolperstein', 'Gegenprobe', 'Prüfstand', 'Wächter', 'Klemme']
      .some(w => LANGUAGELIST.some(([x]) => x === w)),
    JSON.stringify(LANGUAGELIST.map(([x]) => x)));

  /* ================= Die README spricht mit dem Erstleser — 0.17.2 =========
     SIE HATTE 47 VERSIONSNUMMERN GETRAGEN, und die meisten erzaehlten nur,
     WANN etwas entstanden ist: „seit 0.13.0", „bis 0.16.0", „mit 0.17.0
     gestrichen". */
  const readmeRaw = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  /* SEIT 0.34.2 SIND ES ZWEI DATEIEN. Die Zusage gilt der Anleitung als
     Ganzes: fuenf Nennungen stehen in der README, eine im Handbuch. Wer nur
     eine der beiden laese, saehe eine gekuerzte Zahl fuer eine ungekuerzte
     Zusage. */
  const handbookRaw = fs.readFileSync(path.join(__dirname, 'manual-de.md'), 'utf8');
  const guideRaw = readmeRaw + '\n' + handbookRaw;
  const readmeNumbers = guideRaw.match(/\b0\.\d+\.\d+\b/g) || [];
  const README_NUMBERS = ['0.33.0', '0.32.1', '0.8.0'];
  check('Die Anleitung nennt ueberhaupt noch die Nummern, die eine Handlung bestimmen',
    README_NUMBERS.every(v => readmeNumbers.includes(v)),
    JSON.stringify(README_NUMBERS.filter(v => !readmeNumbers.includes(v))));
  check('Und keine andere Nummer steht mehr darin',
    readmeNumbers.every(v => README_NUMBERS.includes(v)),
    [...new Set(readmeNumbers.filter(v => !README_NUMBERS.includes(v)))].join(' · '));
  check('Es sind genau sechs Nennungen und keine mehr',
    readmeNumbers.length === 6, `${readmeNumbers.length}: ${readmeNumbers.join(' ')}`);
  /* UND JEDE EINZELNE STEHT DA, WEIL SIE ETWAS BESTIMMT. */
  check('Der Zwischenschritt ueber die letzte migrierende Fassung steht ausdruecklich da',
    /WER VON EINER FASSUNG VOR 0\.33\.0 KOMMT, GEHT ZUERST ÜBER 0\.32\.1/.test(readmeRaw),
    'die Zeile des Zwischenschritts fehlt');
  check('Und die aelteste Datenbank, die noch uebernommen wird',
    /Datenbank aus Version 0\.8\.0 oder neuer/.test(readmeRaw),
    'die Untergrenze fehlt');
  /* UND DIE ZWEITE STELLE, AN DER 0.32.1 EINE HANDLUNG BESTIMMT: eine
     Exportdatei, die zu alt ist, geht denselben Weg wie eine zu alte
     Datenbank -- ueber dieselbe Fassung. */
  check('Und der Weg fuer eine abgewiesene Exportdatei nennt dieselbe Fassung',
    /in eine Fassung bis 0\.32\.1 ein und exportiert sie dort neu/.test(handbookRaw),
    'der Weg fuer die Datei fehlt');
  /* UND KEINE PROTOKOLLZEILE EINER MIGRATION STEHT MEHR ALS ZITAT DA. */
  check('Und keine Protokollzeile einer Migration steht mehr als Zitat da',
    !/Migration auf 0\.\d+\.\d+\)/.test(guideRaw),
    (guideRaw.match(/[^\n]*Migration auf 0\.\d+\.\d+\)[^\n]*/) || ['(keine — richtig)'])[0]);
  /* DIE GEGENPROBE AM WAECHTER SELBST: er findet eine Nummer wirklich, und
     er faerbt sich nicht an einer Zahl, die keine Version ist. */
  check('Der Waechter wuerde eine Nummer wirklich finden',
    ('seit 0.13.0 steht'.match(/\b0\.\d+\.\d+\b/g) || []).length === 1,
    'der Waechter sieht die Nummer nicht');
  check('An einer gewoehnlichen Zahl faerbt er sich dagegen nicht',
    ('300 MB und 0,5 Sekunden'.match(/\b0\.\d+\.\d+\b/g) || []).length === 0,
    'der Waechter faerbt sich an einer Zahl');


  /* ================= Die sechs Waechter der Runde 0.24.1 =================
     „Der Quelltext spricht Englisch" ist eine Zusage ueber den ganzen
     Bestand, und eine solche Zusage haelt nur, wenn sie GEZAEHLT wird. */
  group('Der Quelltext spricht Englisch — die sechs Waechter');
  {
    const DICTIONARY = JSON.parse(fs.readFileSync(path.join(__dirname, 'tools', 'dictionary.json'), 'utf8'));
    /* Ein Wortpaar, dessen beide Seiten gleich lauten, ist kein deutsches
       Wort -- `tags` heisst auf beiden Seiten `tags`. */
    const GERMAN = Object.create(null);
    for (const [word, english] of Object.entries(DICTIONARY.words))
      if (word !== english) GERMAN[word] = english;
    const pieces = (name) => name
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/[_-]/g, ' ').split(/\s+/).filter(Boolean).map(x => x.toLowerCase());
    const isGerman = (name) => pieces(name).some(w => GERMAN[w]);
    const SHIPPED = ['server.js', 'auth.js', 'db.js', 'mail.js', 'keys.js', 'attachments.js',
      'images.js', 'batchrun.js', 'usertool.js', 'twofactor.js', 'keytool.js',
      'public/app.js', 'public/theme.js'];
    const readShipped = (f) => fs.readFileSync(path.join(__dirname, ...f.split('/')), 'utf8');

    /* ERST DER LESER SELBST. Ein Waechter, dessen Leser nichts findet, ist
       gruen und sagt nichts -- dieselbe Bauform wie beim Sprachwaechter. */
    check('Das Woerterbuch traegt seine Wortpaare',
      Object.keys(GERMAN).length > 1000, `${Object.keys(GERMAN).length} Paare`);
    check('Und der Leser erkennt ein deutsches Wortstueck',
      isGerman('sicherungOrdner') && isGerman('LOESCH_MARKE') && isGerman('papierkorb_tage'),
      'der Leser sieht kein deutsches Wort');
    check('Und faerbt sich an einem englischen Namen nicht',
      !isGerman('backupFolder') && !isGerman('DELETE_MARK') && !isGerman('trash_days'),
      'der Leser faerbt sich an einem englischen Namen');

    /* ---- 1. */
    const identifiers = new Set();
    for (const f of SHIPPED)
      for (const part of segment(readShipped(f), f))
        if (part.kind === CODE)
          for (const m of part.value.matchAll(/[A-Za-z_$][A-Za-z0-9_$]*/g)) identifiers.add(m[0]);
    check('Der Waechter sieht wirklich den ganzen ausgelieferten Code',
      identifiers.size > 2000 && SHIPPED.length === 13, `${identifiers.size} Bezeichner aus ${SHIPPED.length} Dateien`);

    /* FALSCHE FREUNDE. */
    const FALSE_FRIENDS = ['MAILTEST_KEY', 'cleanNote', 'liesIn', 'note', 'noteFailure', 'noteSuccess'];
    /* WAS AUF STUFE 2 WARTET. */
    /* HIER STAND BIS 0.24.2 `WAITING_FOR_STAGE_TWO` MIT 104 NAMEN -- die
       Grenzen, die 0.24.1 liegen liess, weil sie an einem WERT der
       Sprachdatei, an einer gespeicherten Form oder an einer Adresse hingen. */
    /* DIE ALTEN NAMEN DES BESTANDS STANDEN HIER VON 0.24.2 BIS 0.32.1: sechs
       Feldnamen, die in 0.24.0 IN einem gespeicherten Wert standen --
       `vorlage` an den eigenen Suchmaschinen, die vier Felder des
       Mailzugangs, `marke` am Beleg der Testmail. */
    const NAMED = [...FALSE_FRIENDS].sort();
    const germanNames = [...identifiers].filter(isGerman).sort();
    check('Namensprobe: kein deutscher Bezeichner ausser den benannten',
      equal(germanNames, NAMED),
      `zu viel: ${germanNames.filter(n => !NAMED.includes(n)).join(' ') || '—'} · fehlt: ${NAMED.filter(n => !germanNames.includes(n)).join(' ') || '—'}`);
    /* DIE ZAHL STEHT AUSDRUECKLICH DA. Ohne sie waere die Liste oben eine
       Selbstbestaetigung: wer einen Namen hinzufuegt, macht sie wieder gruen. */
    /* SECHS SEIT 0.33.0, von 0.24.3 bis 0.32.1 zwoelf, davor 116. Die 104
       Grenzen sind mit 0.24.3 gefallen (F7), die sechs alten Feldnamen mit
       dem Bruch; was bleibt, sind die sechs falschen Freunde -- englische
       Woerter, die das Woerterbuch als deutsche kennt. */
    check('Und es sind genau sechs — die falschen Freunde und sonst nichts',
      germanNames.length === 6 && FALSE_FRIENDS.length === 6,
      `${germanNames.length} deutsch, ${FALSE_FRIENDS.length} falsche Freunde`);
    /* UND DIE SECHS ALTEN FELDNAMEN STEHEN IN KEINER ZEILE CODE MEHR -- auch
       nicht in db.js, das bis 0.32.1 die einzige erlaubte Stelle war. */
    const OLD_STORED_NAMES = ['absender', 'anbieter', 'benutzer', 'marke', 'passwort', 'vorlage'];
    const oldElsewhere = [];
    for (const f of SHIPPED) {
      const code = segment(readShipped(f), f).filter(p => p.kind === CODE)
        .map(p => p.value).join('\n');
      for (const n of OLD_STORED_NAMES)
        if (new RegExp(`(^|[^A-Za-z0-9_$])${n}(?![A-Za-z0-9_$])`).test(code))
          oldElsewhere.push(`${f}: ${n}`);
    }
    check('Und keiner der sechs alten Feldnamen steht noch in einer Zeile Code',
      oldElsewhere.length === 0, oldElsewhere.join(' · '));
    // Und der Leser wuerde sie wirklich finden -- an einem gestellten Fall.
    check('Der Leser wuerde einen alten Feldnamen melden',
      /(^|[^A-Za-z0-9_$])vorlage(?![A-Za-z0-9_$])/.test('const vorlage = 1;') &&
      !/(^|[^A-Za-z0-9_$])vorlage(?![A-Za-z0-9_$])/.test('const searchTemplate = 1;'),
      'der Leser trennt Benennung und Namensteil nicht');
    check('Und jeder benannte steht wirklich im Code — keine Karteileiche',
      NAMED.every(n => identifiers.has(n)),
      NAMED.filter(n => !identifiers.has(n)).join(' '));

    /* ---- 2. Die Schluesselprobe -----------------------------------------
       KEIN SCHLUESSEL DER SPRACHDATEI TRAEGT EIN DEUTSCHES WORTSTUECK. */
    const LANGUAGE_FILE = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'));
    const languageKeys = [];
    for (const [k, v] of Object.entries(LANGUAGE_FILE)) {
      languageKeys.push(k);
      if (v && typeof v === 'object') for (const x of Object.keys(v)) languageKeys.push(k + '.' + x);
    }
    const germanKeys = languageKeys.filter(k => k.split('.').some(isGerman));
    /* SIE SIND SEIT 0.24.3 ENGLISCH (F7) und werden deshalb nicht mehr aus
       den DEUTSCHEN Schluesseln gefiltert, sondern aus allen: `one`/`other`
       statt `eins`/`andere`, `entryOne` statt `sacheEinzahl`. */
    const pluralKeys = languageKeys.filter(k => /\.(one|other)$/.test(k));
    const vocabularyKeys = languageKeys.filter(k => k.startsWith('vocabulary.'));
    /* Drei falsche Freunde: `Note` heisst hier Vermerk, `standard` ist das
       englische Wort und steht so am Bildschirm. */
    /* VIER SEIT 0.31.1, VORHER FUENF: `card.heWill` ist gefallen. */
    const KEY_FALSE_FRIENDS = ['card.keepAtLeastNote', 'card.orderAppliesNote',
      'card.standard', 'list.saveViewNote'];
    check('Schluesselprobe: deutsch sind nur noch die benannten vier',
      equal(germanKeys.sort(), KEY_FALSE_FRIENDS), germanKeys.join(' '));
    /* 1272 WURDEN 1277 -- 0.24.4. */
    /* 1320 + 2 = 1322 -- die beiden Titel der Blaetterpfeile (0.28.0). */
    /* 0.28.1 -- die Rechnung steht darunter. */
      /* 0.29.0 -- die Rechnung steht darunter. WEG EINS: `list.sortOneWay`
         („Diese Sortierung hat nur eine Richtung"). */
    /* 1347 SEIT 0.30.0 -- 1346 minus einen plus zwei, und alle drei haben
       einen Namen (Befund 9 und Befund 10): WEG `list.tagsCount` („Tags (2)")
       -- der Umschalter der Tagzeile ist gefallen, und die Zahl stand an ihm
       (F9). */
    /* 1336 SEIT 0.31.0 -- 1347 minus elf, und die elf haben einen gemeinsamen
       Namen: sie waren nie Sprache (Bauabschnitt 1). */
    /* 1280 WURDEN 1303 MIT 0.32.0, DIE MEHRZAHLFORMEN 82 WURDEN 88 UND DIE
       VOKABELNAMEN 14 WURDEN 15 -- und alle drei Zahlen haben einen Namen: +2
       Strang 2: `vocabulary.grade` und seine Beschriftung `card.grade`. */
    /* 1303 WURDEN 1297 MIT 0.32.1 -- SECHS FALLEN, KEINER KOMMT DAZU, und das
       ist fuer eine Runde, die etwas AUFRAEUMT, das erwartete Vorzeichen: −1
       `list.ofWhich` -- das „, davon ..." der Zaehlzeile. */
    /* 1279 WURDEN 1280 MIT 0.31.4: `_afterNumber` kommt dazu. Er traegt
       keinen Satz -- er sagt, welche FORM hinter einer Zahl steht. */
    /* UND SEIT 0.33.0 SIND ES EINER WENIGER: `card.catchUpDerivatives` und
       `card.derivativesAsk` fallen mit der JPEG-Haelfte des Bestandslaufs,
       `server.exportTooOld` kommt mit der Abweisung zu alter Dateien dazu --
       zwei hin, einer her. */
    check('Und die Zahlen stehen: 1296 Schluessel, 88 Mehrzahlformen, 15 Vokabelnamen',
      languageKeys.length === 1296 && pluralKeys.length === 88 && vocabularyKeys.length === 15,
      `${languageKeys.length} / ${pluralKeys.length} / ${vocabularyKeys.length}`);

    /* ---- 3. */
    const addresses = new Set();
    for (const f of SHIPPED)
      for (const part of segment(readShipped(f), f)) {
        /* NUR DIE STRINGS. */
        if (part.kind !== TEXT) continue;
        for (const m of part.value.matchAll(/(\/api\/[A-Za-z0-9/:_-]+)/g)) addresses.add(m[1]);
        for (const m of part.value.matchAll(/(#\/[A-Za-z0-9/:_-]*)/g)) addresses.add(m[1]);
      }
    const germanAddresses = [...addresses]
      .filter(a => a.split(/[/:#]/).filter(Boolean).some(isGerman)).sort();
    const OLD_ADDRESSES_NAMED = ['#/bestaetigung/', '#/einladung/', '#/offen'];
    check('Adressprobe: deutsch sind nur die drei alten Adressen',
      equal(germanAddresses, OLD_ADDRESSES_NAMED), germanAddresses.join(' '));
    /* UND JEDE VON IHNEN WIRD UEBERSETZT. Ein alter Weg, den niemand
       uebersetzt, ist ein toter Link in einer verschickten Mail. */
    const appSource = readShipped('public/app.js');
    check('Und jede von ihnen steht in der Uebersetzungstafel',
      /const OLD_ADDRESSES = \{ '#\/offen': '#\/open' \};/.test(appSource) &&
      /'#\/einladung\/': '#\/invite\/'/.test(appSource) &&
      /'#\/bestaetigung\/': '#\/confirm\/'/.test(appSource),
      (appSource.match(/const OLD_ADDRESS[^\n]*/g) || ['(nicht gefunden)']).join(' · '));
    check('Und der Waechter sieht ueberhaupt Adressen',
      addresses.size > 80, `${addresses.size} Wege`);

    /* ---- 4. */
    const styleSheet = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
    const pageSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
    const shapes = new Set();
    for (const m of styleSheet.matchAll(/--([a-z0-9-]+)\s*:/gi)) shapes.add('--' + m[1]);
    for (const m of styleSheet.matchAll(/\.([a-zA-Z][\w-]*)/g)) shapes.add('.' + m[1]);
    for (const m of styleSheet.matchAll(/#([a-zA-Z][\w-]*)/g)) shapes.add('#' + m[1]);
    for (const text of [pageSource, appSource]) {
      for (const m of text.matchAll(/\bid=["']([\w-]+)["']/g)) shapes.add('#' + m[1]);
      for (const m of text.matchAll(/\bclass=["']([^"'${}]+)["']/g))
        for (const one of m[1].split(/\s+/)) if (/^[a-zA-Z][\w-]*$/.test(one)) shapes.add('.' + one);
    }
    const germanShapes = [...shapes].filter(s => isGerman(s.replace(/^(--|[.#])/, ''))).sort();
    const SHAPE_FALSE_FRIENDS = ['#calc-same-note', '.login-alt', '.rej-note'];
    check('Gestaltprobe: deutsch ist keine id, keine Klasse, keine Variable',
      equal(germanShapes, SHAPE_FALSE_FRIENDS), germanShapes.join(' '));
    check('Und der Waechter sieht wirklich die ganze Gestalt',
      shapes.size > 600, `${shapes.size} Gestaltnamen`);

    /* ---- 5. */
    /* DIE WERTE VON DAMALS STEHEN ALS DATEI DA und werden nicht aus git
       geholt. */
    const wordingFile = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'tools', 'wording-0681d42.json'), 'utf8'));
    const valuesOf = (o) => { const out = []; for (const v of Object.values(o))
      if (v && typeof v === 'object') out.push(...Object.values(v)); else out.push(v); return out; };
    check('Die Werte der Abnahme liegen als Datei daneben',
      wordingFile.commit === '0681d42' && Array.isArray(wordingFile.values),
      `${wordingFile.commit} · ${wordingFile.values?.length} Werte`);
    /* 0.24.3 IST DIE ERSTE RUNDE DIESER REIHE, DIE SAETZE HINZUFUEGT -- und
       damit die erste, die diesen Waechter anfasst. */
    const WORDING_NEW_0243 = ['_name',
      'card.languageDefaultSaved', 'card.languageDefaultTip', 'card.languageHint',
      'card.languagePoolSaved',
      'card.languages', 'card.languagesFileAfter', 'card.languagesFileBefore',
      'card.onDate', 'card.partLoaded',
      'card.languagesHint', 'card.languagesUsersHint',
      'server.languageUnknown'];
    /* UND ACHT WEITERE MIT 0.24.4 -- dieselbe Regel, eine Runde spaeter. */
    const WORDING_NEW_0244 = [
      'entry.showAllLinks', 'list.filtersActive',
      'card.newCategory', 'card.newTag',
      'card.categoryCreated', 'card.tagCreated'];
    /* UND EINER MIT 0.24.5 -- dieselbe Regel, eine Runde spaeter, und wieder
       in einer EIGENEN Liste: die Listen sind die Buchfuehrung darueber,
       welche Runde welchen Satz hinzugefuegt hat. */
    const WORDING_NEW_0245 = ['card.nameFallback'];
    /* UND ZWEI MIT 0.24.6 -- wieder eine eigene Liste, aus demselben Grund:
       sie ist die Buchfuehrung darueber, welche Runde welchen Satz gebracht
       hat. */
    /* BEIDE SIND MIT 0.25.0 WIEDER WEGGEFALLEN, und deshalb steht die Liste
       der Runde 0.24.6 hier LEER statt gestrichen: sie ist die Buchfuehrung
       darueber, was jene Runde gebracht hat, und dass davon nichts geblieben
       ist, ist eine Aussage. */
    const WORDING_NEW_0246 = [];
    /* UND VIERZEHN MIT 0.25.0 -- wieder eine eigene Liste, aus demselben
       Grund. */
    const WORDING_NEW_0250 = [
      'card.nameOriginal', 'server.nameOriginalStays',
      'card.nameRemove', 'card.nameRemoveAsk', 'card.nameRemoveHint', 'card.nameRemoved',
      'card.languageComplete', 'card.languageMissing',
      'card.namesUnknown', 'card.namesUnknownHint', 'card.namesAssign', 'card.namesAssigned',
      'card.languageDefaultNow', 'card.wordsMissing'];
    /* UND DREI MIT 0.25.4 -- der Verneinungssatz, den 0.24.3 in drei Stuecke
       zersaegt hatte. */
    const WORDING_NEW_0254 = ['login.linkUnaffected', 'login.linkUnaffectedRetry',
      'login.linkUnaffectedWord'];
    /* UND EINER MIT 0.26.0 -- Befund 3c. */
    /* UND VIER FUER DEN POTENZIALMODUS -- dieselbe Runde, andere Sache. */
    const WORDING_NEW_0260 = ['card.weightSystemDefault',
      'card.potentialModeHint', 'card.potentialModeLabel',
      'card.potentialModeOff', 'card.potentialModeOwner'];
    /* UND ACHTZEHN MIT 0.27.0 -- die Wahl der Bildablage. */
    const WORDING_NEW_0270 = ['card.storeMethod',
      'card.storePng', 'card.storePngHint',
      'card.storeLossless', 'card.storeLosslessHint',
      'card.storeLossy', 'card.storeLossyHint',
      'card.storeCaveat', 'card.derivativesWebp',
      'card.catchUpStore', 'card.catchUpBoth', 'card.catchUpDerivatives',
      'card.catchUpAsk', 'card.derivativesAsk',
      'entry.clipboardLarger', 'server.imageStoreUnknown'];
    /* ZWEI STANDEN BIS 0.31.1 HIER DANEBEN: `card.convertCounts` und
       `card.nothingToDo`. */
    /* UND ZWEI MIT 0.28.0: die Titel der beiden Blaetterpfeile in der
       Kopfzeile. */
    const WORDING_NEW_0280 = ['list.prevInList', 'list.nextInList'];
    /* UND FUENFZEHN MIT 0.28.1, und sie kommen aus zwei Umbauten: SIEBEN
       RICHTUNGSWOERTER und ZWEI TITEL fuer den Umschalter neben dem
       Sortierfeld. */
    const WORDING_NEW_0281 = ['card.sections',
      'list.dirNewOld', 'list.dirOldNew', 'list.dirAZ',
      'list.dirHighLow', 'list.dirLowHigh', 'list.dirManyFew', 'list.dirFewMany',
      'list.sortChanged', 'list.sortAvg', 'list.sortLast',
      'list.sortFlip',
      'list.prevHint', 'list.nextHint',
      'list.sortGroupGeneral', 'list.sortGroupHistory'];
    /* UND ZWANZIG MIT 0.29.0. */
    const WORDING_NEW_0290 = [
      'list.dirZA',
      'card.showFiles', 'card.hideFiles',
      'card.checkBackup', 'card.checkRunning', 'card.checkKeyWrong',
      'card.checkForeign', 'card.checkUsers', 'card.checkUntil',
      'server.backupGone',
      'list.dueOverdue', 'list.dueToday', 'list.dueLater', 'list.dueNone',
      'entry.dueSet', 'entry.dueHint', 'server.dueInvalid',
      'card.emailsDoubled', 'card.emailsDoubledHint', 'login.emailTaken'];
    /* UND ZWEI MIT 0.30.0, und beide kommen aus Befund 10: ein Wort, das fest
       im Quelltext stand, bekommt seinen Schluessel. */
    const WORDING_NEW_0300 = ['entry.weighted', 'card.configured'];
    /* UND VIERUNDVIERZIG MIT 0.31.1 -- die Runde, die die zersaegten Saetze
       wieder zusammensetzt. */
    const WORDING_NEW_0311 = [
      "card.addressRequiredHint", "card.approveRejectHint",
      "card.backupDirHint", "card.backupDirOutsideHint",
      "card.backupWhatHint", "card.criteriaOrderHint",
      "card.deleteFreesHint", "card.engineCheckboxHint",
      "card.exportOversizeHint", "card.fileContainsHint", "card.freedBytes",
      "card.internalTitleHint", "card.keyBesideHint",
      "card.keyFromSetting", "card.keyIntoEnv", "card.lessBytes",
      "card.linkForUser", "card.lockInsteadHint", "card.lockedOutCard",
      "card.logKeepsHint", "card.mergeExplainHint", "card.moreBytes",
      "card.onlySessionHint", "card.otherSessionsHint", "card.partOrderHint",
      "card.potentialStarsHint", "card.publicTitleHint",
      "card.replaceExplainHint", "card.shownOnceHint", "card.signupHint",
      "card.stayedCurrent", "card.testMailGoesHint", "card.trashKeepsHint",
      "card.twoFactorStateOff", "card.twoFactorStateOn", "card.usePartsHint",
      "card.weightExplainHint", "card.withPhotosPlain",
      "entry.calcRoundingHint", "entry.calcStepsHint",
      "list.newCommentsHint", "list.tagModeAnd", "login.linkValidHint",
      "login.requestConfirmedHint"];
    /* UND EINER MIT 0.31.4, und er ist kein Satz: `_afterNumber` steht im
       KOPF der Datei, bei `_locale` und `_name`, und sagt, welche Form hinter
       einer Zahl steht. */
    const WORDING_NEW_0314 = ['_afterNumber'];
    /* UND ACHTZEHN MIT 0.32.0 -- dieselbe Regel, eine Runde spaeter, und
       wieder in einer EIGENEN Liste: sie ist die Buchfuehrung darueber,
       welche Runde welchen Satz gebracht hat. */
    const WORDING_NEW_0320 = [
      'vocabulary.grade', 'card.grade',
      'list.bellToMe', 'list.bellMine', 'list.bellOther', 'list.markedCount',
      'server.noAccountOwner', 'server.noTestMail', 'server.noPublicAddress',
      'server.noUserAddress', 'server.signupThanks', 'server.cleanupNoBackups',
      'server.backupsBeforeKey', 'server.cleanupAllYoungest', 'server.cleanupOldestAge',
      'mail.ownServer', 'list.statusByHand', 'list.byHandHint'];
    /* UND ZWEI MIT 0.32.1 -- und es sind KEINE neuen Saetze, sondern ein
       geteilter: `entry.deleteWord` („{word} löschen") wird zu
       `entry.deletePhoto` und `entry.deleteVideo`. */
    const WORDING_NEW_0321 = ['entry.deletePhoto', 'entry.deleteVideo'];
    /* UND EINER MIT 0.33.0: `server.exportTooOld`. */
    const WORDING_NEW_0330 = ['server.exportTooOld'];
    /* UND ACHT SCHLUESSEL FALLEN MIT 0.32.1 -- sechs von ihnen gab es schon
       bei der Abnahme, zwei sind erst in 0.32.0 entstanden und schon wieder
       weg. */
    const WORDING_GONE_0321 = [
      'list.ofWhich', 'list.and',                      // die Zaehlzeile baut keinen Satz mehr
      'list.followsSort', 'list.statusByHand', 'list.byHandHint',   // die Filterableitung
      'list.pillHint', 'list.sortDefaultHint',          // ihre beiden Erklaerungen
      'entry.deleteWord'];                              // in zwei feste geteilt
    /* UND ZWEI FALLEN MIT 0.33.0 -- die JPEG-Haelfte des Bestandslaufs. */
    const WORDING_GONE_0330 = ['card.catchUpDerivatives', 'card.derivativesAsk'];
    const WORDING_NEW = [...WORDING_NEW_0243, ...WORDING_NEW_0244,
      ...WORDING_NEW_0245, ...WORDING_NEW_0246, ...WORDING_NEW_0250,
      ...WORDING_NEW_0254, ...WORDING_NEW_0260, ...WORDING_NEW_0270,
      ...WORDING_NEW_0280, ...WORDING_NEW_0281, ...WORDING_NEW_0290,
      ...WORDING_NEW_0300, ...WORDING_NEW_0311, ...WORDING_NEW_0314,
      ...WORDING_NEW_0320, ...WORDING_NEW_0321, ...WORDING_NEW_0330]
      .filter(k => !WORDING_GONE_0321.includes(k) && !WORDING_GONE_0330.includes(k));
    const wordingMissing = WORDING_NEW.filter(k => LANGUAGE_FILE[k] === undefined);
    check('Die neuen Schluessel dieser Runde stehen wirklich in der Datei',
      wordingMissing.length === 0, wordingMissing.join(' ') || 'alle da');
    /* UND ZWEI SIND WEGGEFALLEN -- 0.25.0, und sie werden NAMENTLICH
       abgezogen, wie `card.restoreIcon` in 0.24.4. */
    const WORDING_GONE_0250 = ['card.nameFallbackNone', 'card.namesBaseRow'];
    const goneStill = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of WORDING_GONE_0250) if (file[k] !== undefined) goneStill.push(`${code}/${k}`);
    }
    check('Und die zwei Schluessel, die 0.25.0 wegnimmt, stehen in keiner Datei mehr',
      goneStill.length === 0, goneStill.join(' ') || 'beide weg');
    /* UND VIER FALLEN MIT 0.25.4 -- der zersaegte Verneinungssatz. */
    const WORDING_GONE_0254 = ['login.not', 'login.yourLinkAffected',
      'login.stillValid', 'login.stillValidRetry'];
    const goneStill4 = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of WORDING_GONE_0254) if (file[k] !== undefined) goneStill4.push(`${code}/${k}`);
    }
    check('Und die vier Schluessel, die 0.25.4 wegnimmt, stehen in keiner Datei mehr',
      goneStill4.length === 0, goneStill4.join(' ') || 'alle vier weg');
    /* UND EINER IST WEGGEFALLEN -- `card.restoreIcon`, 0.24.4 (B6 A). */
    /* UND ELF FALLEN MIT 0.31.0 -- Bauabschnitt 1, und alle elf aus DEMSELBEN
       Grund: sie waren nie Sprache. */
    const WORDING_GONE_0310 = ['entry.targetBlank', 'entry.linkRel', 'entry.imagePrefix',
      'list.px10', 'list.px20', 'card.composeFile', 'card.filesQuery', 'card.photosQuery',
      'card.videosQuery', 'list.thumbQuery', 'card.partQuery'];
    const goneStill11 = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of WORDING_GONE_0310) if (file[k] !== undefined) goneStill11.push(`${code}/${k}`);
    }
    check('Und die elf Schluessel, die 0.31.0 wegnimmt, stehen in keiner Datei mehr',
      goneStill11.length === 0, goneStill11.join(' ') || 'alle elf weg');
    /* IHR WORTLAUT WIRD AUS DEM STAND VON DAMALS ABGEZOGEN, wie bei jeder
       Wegnahme davor. */
    const WORDING_GONE_TEXT_0310 = ['_blank', 'noopener,noreferrer', 'image/',
      '10px', '20px', 'docker-compose.yml', '&files=1', 'photos=1', '&videos=1',
      '?size=thumb', '&von={von}&bis={bis}&teil={nr}&teile={n}'];
    /* UND ACHTUNDNEUNZIG FALLEN MIT 0.31.1 -- der Preis und der Gewinn
       derselben Sache. */
    const WORDING_GONE_TEXT_0311 = [
      "(7 Tage gültig, einmal nutzbar).",
      "(data/encryption.key). Wer das Verzeichnis kopiert, kann alles lesen.",
      "), dann der Durchschnitt darüber",
      ", alle übrigen der Reihe nach mit",
      ", seit du diese Liste zuletzt geöffnet hast.",
      ", solange die Registrierung erlaubt ist.",
      ", stünde hier",
      ". Antwortet der Mailserver nicht, bricht der Versuch nach {sekunden} Sekunden ab.",
      ". Das",
      ". Die Reihenfolge gilt in Detailansicht und Vergleich; die Zahl nennt, an wie vielen {sacheMehrzahl} Sterne vergeben sind.",
      ". Gelöscht werden nur Sicherungen, die Kriterion selbst angelegt hat.",
      ". Nur zum Weitergeben einzelner {sacheMehrzahl} genügt der Teil, der sie enthält.",
      ". Vorher wird nachgefragt und das Passwort verlangt.",
      "100 MB",
      "200 MB",
      "300 MB",
      "50 MB",
      ": öffnet sich beim Klick auf die Suchzeile.",
      "; Daten und Exporte bleiben gleich.",
      "; jeder Teil ist eine vollständige Exportdatei. Für eine Sicherung ist die Karte",
      "Außer dieser gibt es",
      "Das",
      "Der",
      "Der Schlüssel kommt aus der Server-Einstellung",
      "Der Sicherungsordner liegt",
      "Die Anfrage liegt jetzt beim Admin. Wird sie freigeschaltet, bekommst du eine zweite E-Mail mit dem Link, über den du dein Passwort setzt.",
      "Die Datei enthält",
      "Die Testmail geht",
      "Die Zeilen werden nach",
      "Dies ist die",
      "Ein gesperrter Benutzer kann sich nicht anmelden, seine Beiträge bleiben.",
      "Eine Sitzung läuft nach",
      "Empfohlen ist ein Ordner außerhalb, am besten auf einer anderen Platte — sonst gehen bei einem Fehler am Projektordner Original und Sicherung zugleich verloren. Einstellung:",
      "Er wird",
      "Für echten Schutz",
      "Gelöschte {sacheMehrzahl} bleiben hier",
      "Gerundet wird nur das Endergebnis.",
      "Häkchen: steht zur Auswahl.",
      "Inhalte, {bewertungMehrzahl}, IP-Adresse, Browser.",
      "Kommt niemand mehr herein, kann der",
      "Neue Kommentare und {bewertungMehrzahl}",
      "Nutze",
      "Ohne Mailzugang zeigt Kriterion Einladungslinks und Links zum Zurücksetzen zum Kopieren an; mit Mailzugang werden sie",
      "Schlüssel — bewahre ihn in einem Passwort-Manager auf.",
      "Sitzung abgelaufen",
      "Sitzung deines Kontos.",
      "Sitzung.",
      "Sitzungen.",
      "Sterne",
      "Teil 1 mit",
      "Unbestätigte Anfragen verfallen nach {stunden} Stunden.",
      "Wer sich auf der Anmeldeseite mit Name und E-Mail meldet und die Adresse bestätigt, erscheint hier. Ein Admin schaltet frei oder lehnt ab.",
      "Wert in die",
      "Zeit. Nur an die richtige Person weitergeben.",
      "abgefragt; danach lädst du jeden Teil einzeln.",
      "angezeigt.",
      "automatisch gelöscht; ein Löschen von Hand gibt es nicht.",
      "behandelt; die Suche startet erst beim Klick.",
      "bestimmt, wie stark ein Kriterium in den Durchschnitt eingeht; bei 1 zählen alle gleich.",
      "das Passwort auf dem Server zurücksetzen.",
      "dem Test: Welche Idee ist als Nächstes dran? Eigener Durchschnitt, unabhängig von „{bewertungEinzahl}\".",
      "ein.",
      "einfacher.",
      "eingeben — jeder gilt nur einmal.",
      "eintragen — keinen neuen erzeugen, sonst sind die vorhandenen Daten nicht mehr lesbar:",
      "entfernt die Anfrage; es geht keine Nachricht hinaus.",
      "erscheint erst nach der Anmeldung — hier gehört die aussagekräftige Bezeichnung hin.",
      "erst der Durchschnitt je Kriterium über alle Benutzer (Spalte",
      "frei.",
      "für den Suchtext (",
      "für „",
      "gültig,",
      "heraus.",
      "laden",
      "legt einen Benutzer an und erzeugt den Einladungslink.",
      "lässt Vorhandenes stehen und fügt die {sacheMehrzahl} hinzu — um Bestände von einem zweiten Gerät zu übernehmen.",
      "löscht vorher alles Vorhandene — für die Wiederherstellung nach einem Datenverlust.",
      "muss so dastehen.",
      "nutzbar, nach dem Öffnen",
      "oder",
      "ohne Gewichte käme nach dem Runden ebenfalls",
      "report",
      "statt",
      "steht auf der Anmeldeseite und ist für jeden sichtbar, der die Adresse aufruft. Der",
      "und ersetzt den Code aus der App.",
      "und lassen sich wiederherstellen; danach werden sie endgültig gelöscht.",
      "verschickt.",
      "vollständige, verschlüsselte Kopie der Datenbank — auch mit dem, was der Export nicht enthält. Lässt sich nur in dieselbe Programmversion zurückspielen.",
      "zustande kommt",
      "— bei {dbBytes} etwa {dauerSekunden} Sekunden.",
      "— bitte ein Passwort wählen.",
      "— danach brauchst du einen neuen vom Admin.",
      "— mehr als die Höchstgröße von {string} je Datei (",
      "— ohne Schlüssel sind die Daten verloren.",
      "— seit {seit}. Beim Anmelden wird zusätzlich der Zwei-Faktor-Code abgefragt.",
      "— so bleibt er bei Updates unberührt.",
      "— zum Anmelden genügt dein Passwort.",
      "“ — wird nur einmal angezeigt."];
    const WORDING_GONE_0244 = ['{iconWiederher} Wiederherstellen'];
    /* UND DIE VIER STUECKE DES VERNEINUNGSSATZES -- 0.25.4, aus demselben
       Grund wie oben: der Stand von damals kennt sie, der von heute nicht
       mehr. */
    const WORDING_GONE_TEXT_0254 = ['nicht', 'Dein Link ist davon',
      'betroffen — er gilt\n          weiter.',
      'betroffen — er gilt weiter.\n        Versuch es gleich noch einmal.'];
    /* UND EINER MIT 0.26.0 -- Befund 3c, aus demselben Grund: der Stand von
       damals kennt ihn, der von heute nicht mehr. */
    const WORDING_GONE_TEXT_0260 = ['Eingestellt wird es vom Admin.'];
    /* UND SIEBEN FALLEN MIT 0.27.0 -- NAMENTLICH, wie der Auftrag es verlangt
       (BA 3: „Faellt doch einer, steht er NAMENTLICH hier, in allen drei
       Sprachen"). */
    const WORDING_GONE_0270 = ['card.convertOnUpload', 'card.pasteWebpHint',
      'card.convertAllPng', 'card.noPngLeft', 'card.convertPngWebp',
      'card.pngConverting', 'card.stayedPng'];
    const goneStill7 = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of WORDING_GONE_0270) if (file[k] !== undefined) goneStill7.push(`${code}/${k}`);
    }
    check('Und die sieben Schluessel, die 0.27.0 wegnimmt, stehen in keiner Datei mehr',
      goneStill7.length === 0, goneStill7.join(' ') || 'alle sieben weg');
    /* IHR WORTLAUT WIRD AUS DEM STAND VON DAMALS ABGEZOGEN, wie bei den
       Runden davor -- der Stand von damals kennt sie, der von heute nicht
       mehr. */
    const WORDING_GONE_TEXT_0270 = [
      ", {geblieben} blieben PNG",
      "Alle PNG in WebP umwandeln",
      "Eingefügte Screenshots (PNG) werden als\n          WebP gespeichert — etwa zwei Drittel kleiner, ohne sichtbaren Verlust. JPEG, GIF und\n          WebP bleiben unverändert.",
      "Keine PNG-Fotos mehr vorhanden.",
      "PNG in WebP umwandeln",
      "PNG-Fotos beim Upload in WebP umwandeln",
      "{n} PNG-Foto ({bytes}) wird umgewandelt, die Originale ersetzt (danach etwa {danach}). Rückgängig nur mit einer vorher angelegten Sicherung. Dauer: Minuten bis Stunden.",
      "{n} PNG-Fotos ({bytes}) werden umgewandelt, die Originale ersetzt (danach etwa {danach}). Rückgängig nur mit einer vorher angelegten Sicherung. Dauer: Minuten bis Stunden."];
    /* UND DER SCHLUESSEL DAZU DARF IN KEINER DER DREI DATEIEN MEHR STEHEN --
       sonst zoege die Rechnung einen Satz ab, den es noch gibt, und ginge
       zufaellig auf. */
    const goneAdmin = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      if (file['card.setByAdmin'] !== undefined) goneAdmin.push(code);
    }
    check('Und card.setByAdmin steht in keiner der drei Dateien mehr',
      goneAdmin.length === 0, goneAdmin.join(' ') || 'in allen dreien weg');
    /* UND ZWOELF FALLEN MIT 0.28.1 -- sechs Grundlagen mit je einem
       absteigenden und einem aufsteigenden Satz. */
    const WORDING_GONE_0281 = ['list.sortChangedAsc', 'list.sortChangedDesc',
      'list.sortRatingAsc', 'list.sortRatingDesc',
      'list.sortPotentialAsc', 'list.sortPotentialDesc',
      'list.sortDaysAsc', 'list.sortDaysDesc',
      'list.sortAvgAsc', 'list.sortAvgDesc',
      'list.sortLastAsc', 'list.sortLastDesc'];
    const goneStill8 = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of WORDING_GONE_0281) if (file[k] !== undefined) goneStill8.push(`${code}/${k}`);
    }
    check('Und die zwoelf Schluessel, die 0.28.1 wegnimmt, stehen in keiner Datei mehr',
      goneStill8.length === 0, goneStill8.join(' ') || 'alle zwoelf weg');
    /* IHR WORTLAUT WIRD AUS DEM STAND VON DAMALS ABGEZOGEN, wie bei den
       Runden davor. */
    const WORDING_GONE_TEXT_0281 = [
      "Zuletzt geändert (neu → alt)",
      "Zuletzt geändert (alt → neu)",
      "{bewertungEinzahl} (hoch → niedrig)",
      "{bewertungEinzahl} (niedrig → hoch)",
      "{potenzial} (hoch → niedrig)",
      "{potenzial} (niedrig → hoch)",
      "{zeitpunktMehrzahl} (viele → wenige)",
      "{zeitpunktMehrzahl} (wenige → viele)",
      "Durchschnittsnote (hoch → niedrig)",
      "Durchschnittsnote (niedrig → hoch)",
      "Letzte Note (hoch → niedrig)",
      "Letzte Note (niedrig → hoch)"];
    check('Und der Schluessel, den 0.24.4 wegnimmt, steht wirklich nicht mehr da',
      LANGUAGE_FILE['card.restoreIcon'] === undefined,
      JSON.stringify(LANGUAGE_FILE['card.restoreIcon']));
    /* UND EINER MIT 0.32.0: `list.otherUser` -- „anderer Benutzer". */
    const WORDING_GONE_0320 = ['list.otherUser'];
    const goneStill12 = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of WORDING_GONE_0320) if (file[k] !== undefined) goneStill12.push(`${code}/${k}`);
    }
    check('Und der Schluessel, den 0.32.0 wegnimmt, steht in keiner Datei mehr',
      goneStill12.length === 0, goneStill12.join(' ') || 'in allen dreien weg');
    /* SEIN WORTLAUT WIRD AUS DEM STAND VON DAMALS ABGEZOGEN, wie bei jeder
       Runde davor -- sonst stuende „anderer Benutzer" fuer immer in
       `onlyThen` und faerbte die Rechnung. */
    const WORDING_GONE_TEXT_0320 = ['anderer Benutzer'];
    /* UND DIE ACHT VON 0.32.1 -- gepruefte Zugehoerigkeit: die Zeile darunter
       haelt fest, dass keiner der acht in einer der drei Dateien mehr steht. */
    const WORDING_GONE_TEXT_0321 = [
      ', davon {teile}',
      ' und ',
      'folgt der Sortierung',
      'Ein Klick auf eine der drei Pillen setzt den Filter selbst.',
      'Vorgabe der Sortierung — ein Klick macht daraus deine eigene Wahl.',
      '{wort} löschen'];
    const goneStill13 = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of WORDING_GONE_0321) if (file[k] !== undefined) goneStill13.push(`${code}/${k}`);
    }
    check('Und die acht Schluessel, die 0.32.1 wegnimmt, stehen in keiner Datei mehr',
      goneStill13.length === 0, goneStill13.join(' ') || 'in allen dreien weg');
    const wordingOld = Object.fromEntries(Object.entries(LANGUAGE_FILE)
      .filter(([k]) => !WORDING_NEW.includes(k)));
    /* DIE PLATZHALTERNAMEN ZIEHEN MIT IHREM SATZ UM -- 0.24.3, F7. */
    const PLACEHOLDERS_0243 = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'tools', 'placeholders-0243.json'), 'utf8'));
    const BACK = Object.fromEntries(Object.entries(PLACEHOLDERS_0243).map(([de, en]) => [en, de]));
    /* UND DER WEISSRAUM WIRD ZUSAMMENGEZOGEN -- 0.31.1, und das ist eine
       LOCKERUNG mit einem Tausch daneben. */
    const asBefore = (v) => String(v)
      .replace(/\{(\w+)\}/g, (whole, n) => BACK[n] ? `{${BACK[n]}}` : whole)
      .replace(/\n[ \t]+/g, ' ').replace(/[ \t]{2,}/g, ' ');
    check('Die Tafel der Platzhalternamen liegt als Datei daneben',
      Object.keys(PLACEHOLDERS_0243).length === 89,
      `${Object.keys(PLACEHOLDERS_0243).length} Namen`);
    /* EINEN Satz aus einer Liste nehmen, und zwar genau EINMAL. */
    const withoutOne = (list, sentence) => {
      const at = list.indexOf(sentence);
      return at < 0 ? list : list.slice(0, at).concat(list.slice(at + 1));
    };
    /* DER WEGGENOMMENE SATZ WIRD AUS DEM STAND VON DAMALS ABGEZOGEN, nicht
       aus dem von heute -- dort steht er ja gerade nicht mehr. */
    /* UND EINER MIT 0.30.0: „Tags ({length})" stand am Umschalter der
       Tagzeile, und den gibt es nicht mehr (F9). */
    const WORDING_GONE_TEXT_0300 = ['Tags ({length})'];
    /* BEIDE SEITEN GLEICH BEHANDELT. */
    const flatten = (v) => String(v).replace(/\n[ \t]+/g, ' ').replace(/[ \t]{2,}/g, ' ');
    /* UND DIE ABZUGSLISTEN WERDEN MITGEZOGEN -- 0.31.1, und das war ein Fund. */
    const wordingThen = [...WORDING_GONE_0244, ...WORDING_GONE_TEXT_0254,
      ...WORDING_GONE_TEXT_0260, ...WORDING_GONE_TEXT_0270,
      ...WORDING_GONE_TEXT_0281, ...WORDING_GONE_TEXT_0300,
      ...WORDING_GONE_TEXT_0310, ...WORDING_GONE_TEXT_0311,
      ...WORDING_GONE_TEXT_0320, ...WORDING_GONE_TEXT_0321].map(flatten)
      .reduce((list, sentence) => withoutOne(list, sentence), wordingFile.values.map(flatten))
      .sort();
    const wordingNow = valuesOf(wordingOld).map(asBefore).sort();
    const onlyThen = wordingThen.filter(x => !wordingNow.includes(x));
    const onlyNow = wordingNow.filter(x => !wordingThen.includes(x));
    /* SEIT 0.25.4 SIND ES ZWEI MEHR, UND DAS IST BENANNT: `card.inDays` und
       `login.linkValidMinutes` sind zu Mehrzahlpaaren geworden, und ein Paar
       zaehlt flach zweimal. */
    /* 1213 WURDEN 1201 -- 0.28.1, und AUF BEIDEN SEITEN sind es zwoelf
       weniger: die zwoelf Sortiersaetze fallen aus der Datei von heute und
       werden gleichzeitig aus dem Stand von damals abgezogen. */
    /* 1201 WURDEN 1200 -- 0.30.0, und AUF BEIDEN SEITEN ist es einer weniger:
       „Tags ({length})" faellt aus der Datei von heute und wird gleichzeitig
       aus dem Stand von damals abgezogen. */
    /* 1200 WURDEN 1189 -- 0.31.0, und AUF BEIDEN SEITEN sind es elf weniger:
       die elf Code-Lecks fallen aus der Datei von heute und werden gleich-
       zeitig aus dem Stand von damals abgezogen (WORDING_GONE_TEXT_0310). */
    /* 1189 WURDEN 1089 MIT 0.31.1, UND DIE BEIDEN ZAHLEN SIND GLEICH
       GEWORDEN. */
    /* 1089 WURDEN 1088 MIT 0.32.0, UND DIE BEIDEN ZAHLEN BLEIBEN GLEICH:
       „anderer Benutzer" faellt aus der Datei von heute (der Satz des
       Glockenfensters ersetzt ihn) und wird im selben Zug aus dem Stand von
       damals abgezogen (WORDING_GONE_TEXT_0320). */
    /* 1088 WURDEN 1082 MIT 0.32.1, UND DIE BEIDEN ZAHLEN BLEIBEN GLEICH:
       sechs Saetze fallen aus der Datei von heute und werden im selben Zug
       aus dem Stand von damals abgezogen (WORDING_GONE_TEXT_0321). */
    check('Wortlautprobe: gleich viele Saetze wie bei der Abnahme — 1082',
      wordingNow.length === wordingThen.length && wordingNow.length === 1082,
      `${wordingThen.length} damals, ${wordingNow.length} heute (ohne die ` +
      `${WORDING_NEW.length} neuen und die weggenommenen)`);
    /* ZWEI SAETZE SIND ANDERE, UND BEIDE SIND BENANNT. */
    const WORDING_CHANGED_0243 = ['server.backupDirNotSet'];
    /* UND DREI MIT 0.25.4, jeder mit seinem Grund: `entry.tagQuote` oeffnete
       ein Anfuehrungszeichen und schloss es nie -- am Bildschirm stand „Tag
       „Werkzeug". */
    const WORDING_CHANGED_0254 = ['entry.tagQuote'];
    /* UND EINER MIT 0.26.0, und er ist ein Befund und keine Entscheidung:
       `card.withPhotos` hat beim Umbenennen der Bezeichner auf Englisch den
       Wert eines gleichlautenden Satzes bekommen -- „mit Fotos", OHNE die
       oeffnende Klammer, waehrend die drei Geschwister sie tragen. */
    const WORDING_CHANGED_0260 = ['card.withPhotos'];
    /* UND FUENF MIT 0.27.0, und alle fuenf aus DEMSELBEN Grund: der Lauf
       ueber den Bestand tut jetzt zweierlei, und die alten Woerter sagten nur
       das eine. */
    const WORDING_CHANGED_0270 = ['card.formatsHint', 'card.convertRunning',
      'card.convertFinished', 'card.convertDone', 'card.convertProgress'];
    /* UND EINER MIT 0.28.0: `entry.addMediaHint` verliert seinen Halbsatz. */
    const WORDING_CHANGED_0280 = ['entry.addMediaHint'];
    /* UND EINER MIT 0.28.1: `list.sortTitle` verliert seine Klammer. */
    const WORDING_CHANGED_0281 = ['list.sortTitle'];
    const CHANGED_PLURAL_0254 = ['card.inDays', 'login.linkValidMinutes'];
    const pluralValues = CHANGED_PLURAL_0254
      .flatMap(k => Object.values(LANGUAGE_FILE[k])).map(asBefore);
    /* ZWOELF UND VIERZEHN SEIT 0.28.0 -- einer mehr auf jeder Seite, und es
       ist derselbe Satz: der alte Wortlaut von `entry.addMediaHint` steht nur
       noch in der Abnahme, der neue nur noch in der Datei. */
    /* DREIZEHN UND VIERZEHN SEIT 0.28.1 -- einer mehr auf der Seite von
       damals und keiner hier: „Titel (A → Z)" ist verschwunden, und „Titel"
       stand schon da (siehe WORDING_CHANGED_0281). */
    /* UND VIERZEHN UND VIERZEHN SEIT 0.29.0 -- wieder einer mehr auf der
       Seite von damals und keiner hier, und aus demselben Grund wie bei
       „Titel": `entry.newCategoryHint` heisst nicht mehr „Neue Kategorie,
       Enter bestaetigt", sondern „Name". */
    const WORDING_CHANGED_0290 = ['entry.newCategoryHint'];
    /* UND ZWEI MIT 0.30.0 -- einer auf jeder Seite mehr, und beide haben
       einen Namen. */
    const WORDING_CHANGED_0300 = ['entry.whoRated'];
    /* UND VIERUNDSIEBZIG MIT 0.31.0 -- die Runde, die die Sprachdateien
       gegenliest. */
    /* `list.pillHint` STAND HIER BIS 0.32.0 AN ERSTER STELLE und ist mit
       0.32.1 gefallen -- er erklaerte die Filterableitung, und die gibt es
       nicht mehr. */
    const CHANGED_TABLE_0310 = [
      'entry.jumpToInput', 'card.fontSizeHint', 'card.likeDevice',
      'list.hitPlace', 'card.calculating', 'card.convertProgress',
      'server.videoNeedsStill', 'server.videoStill', 'server.stillNoPreview',
      'server.stillNotImage', 'card.exportPartsHint', 'card.backupWritten',
      'card.backupWrittenFile', 'card.keyBesideDb', 'card.keyStillBeside',
      'server.backupInDataDir', 'card.itemOne', 'card.itemMany',
      'card.cleanupAfterBackup', 'card.backupUnopenableHint',
      'server.exportGrew', 'server.backupDirGone', 'server.backupDirNotSet',
      'server.backupConcurrent', 'server.targetNotNumber', 'server.partExportIncomplete',
      'mail.invite.body', 'mail.confirm.body', 'mail.test.body',
      'card.adminOnlyCategory', 'card.adminOnlyTag', 'card.lastSeen', 'card.linkUsed',
      'card.allCodesUsed'];
    /* DREI STANDEN BIS 0.31.1 HIER DANEBEN und stehen jetzt nicht mehr:
       `card.backupDirAdvice` und `card.autoDeleteHint` aus der Tafel,
       `card.potentialHint` aus dem Anfuehrungszeichen. */
    const CHANGED_FORCED_0310 = ['card.themeHint', 'card.convertRunning',
      'card.convertFinished', 'card.convertDone', 'server.convertRunning'];
    const CHANGED_QUOTE_0310 = [
      'card.categoryDeleteHint', 'card.createdFrom', 'card.criterionDeleteHint',
      'card.exportPartsQuoted', 'card.openAppHint', 'card.purgeHint',
      'card.restored', 'card.searchUsersHint', 'card.setTo', 'card.tagDeleteHint',
      'dialog.deleteAlso', 'dialog.deleteUserAsk', 'dialog.nameFreedHint',
      'dialog.postsOfOthers', 'entry.fileDeleteHint', 'entry.ratingRemoveHint',
      'entry.searchFor', 'entry.searchForAt', 'entry.starsRemoved', 'entry.testedFirstHint',
      'entry.titleDeleteHint', 'entry.tooBig', 'entry.unmarkReport', 'list.emptyHint',
      'list.removedFromList', 'list.setDone', 'list.viewExists', 'server.imageUnreadable',
      'server.ratingBeforeTest', 'server.testedStays', 'server.viewExists'];
    const WORDING_CHANGED_0310 = [...CHANGED_TABLE_0310, ...CHANGED_FORCED_0310,
      ...CHANGED_QUOTE_0310];
    /* UND ACHTUNDSECHZIG MIT 0.31.1. */
    const WORDING_CHANGED_0311 = [
      "card.aloneOverLimit", "card.cleanupHint", "card.cleanupKeepsHint",
      "card.configuredIs", "card.confirmOnce", "card.convertFinished",
      "card.criteriaLabel", "card.derivativesWebp", "card.duringBackupHint",
      "card.eachAtMost", "card.emailOptional", "card.emailOptionalHint",
      "card.exportPasswordHint", "card.importHint", "card.includeFiles",
      "card.includeVideos", "card.languagesUsersHint", "card.linkHolderHint",
      "card.linkListHint", "card.logHint", "card.marksGoneToo",
      "card.nameFreedHint", "card.neverSameBackup", "card.newUserHint",
      "card.noBackupDirCard", "card.noPasswordYet", "card.oldBackupsFreed",
      "card.opensOnlyWith", "card.ownEnginesHint", "card.passLinkByHandEnd",
      "card.recoveryCodesHint", "card.reportMany", "card.reportOne",
      "card.resetMailHint", "card.searchDomainTip", "card.sessionIdleHint",
      "card.storeCaveat", "card.subDirOptional", "card.tagDeleteHint",
      "card.taskDone", "card.taskMany", "card.taskOne",
      "card.thumbsRefreshed", "card.vocabularyHint",
      "card.vocabularyResetHint", "card.withPhotos", "card.withoutPhotos",
      "dialog.deleteAlso", "entry.calcHowAvg", "entry.calcIfEqual",
      "entry.calcNoChange", "entry.edited", "entry.linkInputHint",
      /* `list.and` UND `list.commentCount` STANDEN HIER BIS 0.32.0. */
      "entry.weightsWhere",
      "list.searchOffline", "list.searchingShort", "list.visibleCount",
      "login.newPasswordFor", "login.noPhoneHint", "login.requestAccessHint",
      "login.welcome", "mail.hintAlways", "mail.hintGmx",
      "server.entryTooBig", "server.exportGrew", "server.exportTooBig"];
    /* UND EINER MIT 0.31.2 -- der einzige deutsche Wert, den jene Runde
       angefasst hat, und zwar auf Bestellung des Betreibers am 13. September
       2026: „Zugang beantragen" heisst „Zugang anfragen". */
    const WORDING_CHANGED_0312 = ["login.requestAccess"];
    /* UND DREIZEHN MIT 0.32.0. */
    const WORDING_CHANGED_0320 = [
      'entry.grade', 'entry.gradeLabel', 'entry.calcGradeWeight',
      'entry.gradeReplaced', 'list.lastGrade', 'list.gradeLong',
      'list.gradeShort', 'server.gradeRange',
      'card.restartHint', 'server.deniedOwnUser', 'server.ruleKeep', 'server.ruleDays'];
    /* `list.followsSort` STAND HIER BIS 0.32.0 als vierzehnter -- 0.32.0 hat
       ihm den WERT beigegeben („folgt der Sortierung: Getestet"). */
    /* FUENFUNDACHTZIG SEIT 0.31.0, VORHER FUENFZEHN -- und die siebzig mehr
       sind die Runde selbst: siebenunddreissig aus der Worttafel, fuenf
       erzwungene Nachzieher und zweiunddreissig, an denen nur das
       schliessende Anfuehrungszeichen umgezogen ist (WORDING_CHANGED_0310). */
    /* HUNDERTFUENFUNDVIERZIG UND HUNDERTDREIUNDVIERZIG MIT 0.31.1, vorher
       fuenfundachtzig und fuenfundachtzig -- und die beiden Zahlen sind zum
       ersten Mal VERSCHIEDEN. */
    /* 146 UND 144 WURDEN 159 UND 157 MIT 0.32.0 -- dreizehn mehr auf jeder
       Seite, und sie haben Namen: WORDING_CHANGED_0320. Der Abstand von zwei
       bleibt, und das ist die eigentliche Auskunft: zu jedem neuen Wortlaut
       steht drueben genau ein alter, der verschwunden ist. */
    /* 159 UND 157 WURDEN 157 UND 155 MIT 0.32.1 -- ZWEI WENIGER auf jeder
       Seite, und das ist zum ersten Mal seit 0.31.1 die Richtung nach unten. */
    const WORDING_CHANGED_0321 = [
      'entry.noDaysYet', 'server.deniedEntry', 'server.ratingBeforeTest'];
    check('Und genau hundertsiebenundfuenfzig Saetze sind andere — die hundertneunundfuenfzig von 0.32.0 minus die zwei, die 0.32.1 zurueckholt',
      onlyThen.length === 157 && onlyNow.length === 155 &&
      WORDING_CHANGED_0321.every(k => LANGUAGE_FILE[k] !== undefined
        && onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      /* UND DER EINE, DER ZURUECKKOMMT, STEHT AUF KEINER DER BEIDEN SEITEN
         MEHR: `list.commentCount` ist Zeichen fuer Zeichen der von damals. */
      Object.values(LANGUAGE_FILE['list.commentCount'])
        .every(v => !onlyNow.includes(asBefore(v)) && !onlyThen.includes(asBefore(v))) &&
      !onlyThen.includes('Ein Klick auf eine der drei Pillen setzt den Filter selbst.') &&
      WORDING_CHANGED_0320.every(k => LANGUAGE_FILE[k] !== undefined
        && onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      /* „folgt der Sortierung" STAND BIS 0.32.0 IN `onlyThen` -- 0.32.0 hatte
         ihm den Wert beigegeben. */
      !onlyThen.includes('folgt der Sortierung') &&
      !onlyNow.includes('folgt der Sortierung') && onlyThen.includes('Note') &&
      WORDING_CHANGED_0311.every(k => LANGUAGE_FILE[k] !== undefined) &&
      WORDING_CHANGED_0312.every(k => LANGUAGE_FILE[k] !== undefined
        && onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      onlyThen.includes('Zugang beantragen') && !onlyNow.includes('Zugang beantragen') &&
      onlyThen.includes('E-Mail (optional)') && !onlyNow.includes('E-Mail ist optional.') &&
      WORDING_CHANGED_0310.every(k => onlyNow.includes(asBefore(LANGUAGE_FILE[k]))
        || Object.values(LANGUAGE_FILE[k]).every(v => onlyNow.includes(asBefore(v)))) &&
      onlyThen.includes('Wer hat bewertet') &&
      WORDING_CHANGED_0300.every(k => onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      onlyThen.some(x => x.startsWith('Neue Kategorie')) &&
      WORDING_CHANGED_0290.every(k => !onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      onlyThen.includes('Titel (A → Z)') &&
      WORDING_CHANGED_0281.every(k => !onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      WORDING_CHANGED_0280.every(k => onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      WORDING_CHANGED_0270.every(k => onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      WORDING_CHANGED_0243.every(k => onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      WORDING_CHANGED_0254.every(k => onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      WORDING_CHANGED_0260.every(k => onlyNow.includes(asBefore(LANGUAGE_FILE[k]))) &&
      onlyThen.includes('mit Fotos') &&
      pluralValues.every(v => onlyNow.includes(v)) &&
      onlyThen.some(x => x.includes('SICHERUNG_DIR')) &&
      !onlyThen.some(x => x.includes('&von=')) &&
      onlyThen.includes('Tag „{name}') &&
      onlyThen.includes('{tage} Tagen') &&
      onlyThen.includes('Der Link gilt noch {minuten} Minuten'),
      `${onlyThen.length} damals / ${onlyNow.length} heute: ${JSON.stringify(onlyNow).slice(0, 200)}`);
    /* UND SONST KEIN ZEICHEN. */
    /* UND EIN SATZ WIRD ZUSAETZLICH ABGEZOGEN -- 0.28.1, und zwar aus der
       Liste von HEUTE. */
    const WORDING_DOUBLED_0281 = ['Titel'];
    /* UND EIN ZWEITER MIT 0.29.0, aus demselben Grund: „Name" steht seit dem
       gekuerzten Platzhalter ZWEIMAL in der Datei. */
    const WORDING_DOUBLED_0290 = ['Name'];
    const restThen = onlyThen.reduce(withoutOne, wordingThen);
    const restNow = [...WORDING_DOUBLED_0281, ...WORDING_DOUBLED_0290].reduce(withoutOne,
      onlyNow.reduce(withoutOne, wordingNow));
    /* 1102 SEIT 0.31.0, vorher 1183: elf Werte sind ganz gefallen (die
       Code-Lecks) und siebzig Saetze sind andere geworden -- beide stehen auf
       beiden Seiten nicht mehr im Rest, sondern in den Listen darueber. */
    /* 1102 WURDEN 944 MIT 0.31.1: achtundneunzig Werte sind ganz gefallen
       (die Haelften der verschmolzenen Saetze) und sechzig Saetze sind andere
       geworden -- beide stehen auf beiden Seiten nicht mehr im Rest, sondern
       in den Listen darueber. */
    /* 944 WURDEN 943 MIT 0.31.2: ein einziger Satz mehr steht in den Listen
       darueber statt im Rest -- „Zugang beantragen", vom Betreiber bestellt. */
    /* 943 WURDEN 929 MIT 0.32.0: dreizehn Saetze mehr stehen in den Listen
       darueber statt im Rest, und einer ist ganz gefallen („anderer
       Benutzer"). */
    /* 929 WURDEN 925 MIT 0.32.1: vier Saetze sind ganz gefallen, ohne dass
       ein anderer an ihre Stelle traete -- `list.and`, `list.ofWhich`,
       `list.sortDefaultHint` und `entry.deleteWord`. */
    check('Und sonst kein Zeichen — Satz fuer Satz dieselbe Oberflaeche',
      equal(restThen, restNow) && restNow.length === 925,
      `${restThen.filter((x, i) => x !== restNow[i]).length} abweichende von ${restNow.length}`);

    /* ---- 6. Die Kuerzeprobe ---------------------------------------------
       KEIN SCHLUESSEL TRAEGT EINE ANGEHAENGTE ZIFFER. */
    /* ZWEI SEIT 0.31.1, VORHER SECHS, DAVOR ACHT -- und jedes Mal aus
       demselben Grund: die Ziffer war die SACHE, und die Sache war keine
       Sprache. */
    const DIGIT_KEYS = ['card.twoFactorStep1', 'card.twoFactorStep2'];
    const withDigit = languageKeys.filter(k => /[0-9]$/.test(k)).sort();
    check('Kuerzeprobe: eine Ziffer traegt nur, wo sie die Sache ist',
      equal(withDigit, [...DIGIT_KEYS].sort()), withDigit.join(' '));
    /* DIE LATTE: drei Woerter. Ein Fachwort aus zwei Teilen zaehlt als eins,
       und welche das sind, steht im Woerterbuch und nicht in einer Regel. */
    const TERMS = new Set((DICTIONARY.begriffe || []).map(x => x.toLowerCase()));
    const nameWords = (key) => {
      const raw = key.split('.').pop()
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .split(/\s+/).filter(Boolean);
      const out = [];
      for (let i = 0; i < raw.length; i++) {
        if (raw[i + 1] && TERMS.has((raw[i] + raw[i + 1]).toLowerCase())) { out.push(raw[i] + raw[i + 1]); i++; }
        else out.push(raw[i]);
      }
      return out;
    };
    const overTheBar = languageKeys.filter(k => nameWords(k).length > 3
      || k.split('.').pop().length > 24).sort();
    const NAMED_EXCEPTIONS = DICTIONARY.exceptions.map(e => e.name).sort();
    check('Und ueber der Latte stehen nur die vier begruendeten',
      equal(overTheBar, NAMED_EXCEPTIONS), overTheBar.join(' '));
    check('Und jede der vier traegt ihren Satz im Woerterbuch',
      DICTIONARY.exceptions.length === 4 &&
      DICTIONARY.exceptions.every(e => typeof e.reason === 'string' && e.reason.length > 40),
      DICTIONARY.exceptions.map(e => `${e.name}: ${e.reason.length}`).join(' · '));
    const longestKey = languageKeys.map(k => k.split('.').pop())
      .reduce((a, b) => (b.length > a.length ? b : a), '');
    /* BIS 0.31.0 STAND HIER EIN NAME: `backupUnopenableHint`. */
    check('Und der laengste Schluesselname bleibt unter der Latte',
      longestKey.length === 20,
      `${longestKey} (${longestKey.length})`);
    /* ---- 7. */
    const BENCH = [...benchFiles(), 'counterproof.js'];
    const benchNames = new Set();
    for (const f of BENCH)
      for (const part of segment(readShipped(f), f))
        if (part.kind === CODE)
          for (const m of part.value.matchAll(/[A-Za-z_$][A-Za-z0-9_$]*/g)) benchNames.add(m[0]);
    check('Der Waechter sieht wirklich den ganzen Pruefstand',
      benchNames.size > 2000 && BENCH.length === 21,
      `${benchNames.size} Bezeichner aus ${BENCH.length} Dateien`);

    /* Die dreizehn sind keine Benennungen, sondern Gegenstaende von
       Pruefungen: `Abbild`, `Faden` zwei abgelegte Woerter, die der
       Wortfilter sucht absender … `vorlage` die sechs alten Feldnamen im
       gestellten Bestand `ausschnitt`, `fokus` zwei Funktionen, deren Fehlen
       geprueft wird `Haptik` ein Kriterienname im gestellten Bestand
       `standbild_base64` ein Feld des Austauschformats PORT_VERSATZ der alte
       Name der Umgebungsvariablen */
    const BENCH_NAMED = ['Abbild', 'Faden', 'Haptik', 'PORT_VERSATZ', 'absender', 'anbieter',
      'ausschnitt', 'benutzer', 'fokus', 'marke', 'passwort', 'standbild_base64', 'vorlage'];
    const benchGerman = [...benchNames].filter(isGerman).sort();
    check('Namensprobe des Pruefstands: kein deutscher Bezeichner ausser den benannten',
      equal(benchGerman, BENCH_NAMED),
      `zu viel: ${benchGerman.filter(n => !BENCH_NAMED.includes(n)).join(' ') || '—'} · ` +
      `fehlt: ${BENCH_NAMED.filter(n => !benchGerman.includes(n)).join(' ') || '—'}`);
    check('Und es sind genau dreizehn — 131 waren es vor 0.34.1',
      benchGerman.length === 13 && BENCH_NAMED.length === 13,
      `${benchGerman.length} deutsch, ${BENCH_NAMED.length} benannt`);
    check('Und jeder benannte steht wirklich im Code — keine Karteileiche',
      BENCH_NAMED.every(n => benchNames.has(n)),
      BENCH_NAMED.filter(n => !benchNames.has(n)).join(' '));

    // Zusage 6a: ein deutscher Dateiname unter test/ macht diese Zeile rot.
    const germanBenchFiles = BENCH.filter(f => isGerman(path.basename(f, '.js')));
    check('Und kein Dateiname des Pruefstands traegt ein deutsches Wortstueck',
      germanBenchFiles.length === 0, germanBenchFiles.join(' '));
    check('Der Leser wuerde einen deutschen Dateinamen melden',
      isGerman('rahmen') && isGerman('oberflaeche') && !isGerman('roundtrip'),
      'der Leser trennt die beiden Sprachen nicht');
  }

  /* ================= Kein Verweis mehr auf eine Nummer — 0.34.3 ==========
     Entscheidung des Betreibers vom 16. September 2026: die Verweise fallen,
     alle. Wo die Herleitung gebraucht wird, steht sie im Aenderungsprotokoll
     der Runde, die sie getroffen hat. */
  group('Kein Stolpersteinverweis mehr — 0.34.3');
  {
    const SHIPPED = ['server.js', 'auth.js', 'db.js', 'mail.js', 'keys.js', 'attachments.js',
      'images.js', 'batchrun.js', 'usertool.js', 'twofactor.js', 'keytool.js',
      'public/app.js', 'public/theme.js'];
    const BENCH = [...benchFiles(), 'counterproof.js'];
    const readShipped = (f) => fs.readFileSync(path.join(__dirname, ...f.split('/')), 'utf8');
    const stWord = 'Stolper' + 'stein';
    const stAll = [...BENCH, ...SHIPPED];
    check('Der Waechter sieht alle vierunddreissig Dateien',
      stAll.length === 34, `${stAll.length} Dateien`);
    let stRows = 0;
    const stHits = [];
    for (const f of stAll)
      for (const part of segment(readShipped(f), f)) {
        if (part.kind !== COMMENT) continue;
        stRows += part.value.split('\n').length;
        for (const m of part.value.matchAll(new RegExp(`[^\n]*${stWord}[^\n]*`, 'gi')))
          stHits.push(`${f}: ${m[0].trim().slice(0, 60)}`);
      }
    /* Ein Leser, der nichts findet, macht jede Verneinung darauf wahr. */
    check('Und er liest wirklich Kommentarzeilen',
      stRows > 10000, `${stRows} Zeilen`);
    check('Kein Kommentar nennt mehr einen Stolperstein — 1061 waren es vor 0.34.1',
      stHits.length === 0, stHits.slice(0, 8).join(' · '));
    check('Der Leser wuerde einen Verweis melden',
      new RegExp(stWord, 'i').test(`/* Wie in 0.19.1 (${stWord} 81). */`),
      'der Leser sieht den gestellten Text nicht');
    /* DIE EINE STELLE, DIE BLEIBT, UND SIE IST KEIN KOMMENTAR: der
       Gegenprobentreiber nennt die Nummer in seiner Meldung an den Wirt. Sie
       zu aendern hiesse, Code zu aendern. */
    const stText = segment(readShipped('counterproof.js'), 'counterproof.js')
      .filter(q => q.kind !== COMMENT)
      .reduce((n, q) => n + (q.value.match(new RegExp(stWord, 'gi')) || []).length, 0);
    check('Ausserhalb der Kommentare steht die Nummer noch genau einmal',
      stText === 1, `${stText} Vorkommen in counterproof.js`);
  }

  /* ================= Zugeklappt heisst: die ERSTEN Zeilen — 0.24.1 =========
     Aus dem Betrieb am 7. */
  group('Zugeklappt heisst: die ersten Zeilen — 0.24.1');
  {
    const zzApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    const zzLimit = (zzApp.match(/function limitLinks\(\)[\s\S]*?\n  \}/) || [''])[0];
    check('Es gibt die Klemme ueberhaupt', zzLimit.length > 200, `${zzLimit.length} Zeichen`);
    check('Der geklemmte Kasten steht am Anfang der Liste',
      /box\.style\.overflowY = 'hidden';[\s\S]{0,900}?box\.scrollTop = 0;/.test(zzLimit),
      (zzLimit.match(/box\.scrollTop = [^\n]*/g) || ['(keine Stellung gesetzt)']).join(' · '));
    /* UND DIE GEGENLAGE: der Weg, der die Stellung ueberhaupt erst setzt,
       fragt vorher nach der Klemme. */
    check('Und das Hinzufuegen scrollt nur, wenn die Liste nicht geklemmt ist',
      /if \(!linkBox\.style\.maxHeight\) linkBox\.scrollTop = 1e6;/.test(zzApp),
      (zzApp.match(/linkBox\.scrollTop = [^\n]*/g) || ['(nicht gefunden)']).join(' · '));
    check('Der Leser wuerde eine fehlende Stellung wirklich melden',
      !/box\.scrollTop = 0;/.test("box.style.overflowY = 'hidden';\n    button.hidden = false;"),
      'der Leser sieht die gestellte Luecke nicht');
  }

  /* ========= Die gespeicherten Namen der 0.24er Runde — umgedreht =========
     HIER STANDEN BIS 0.32.1 DREI GRUPPEN, und sie fuhren die drei
     Migrationsblöcke der Sprachrunde an echten Altbestaenden: 0.24.2 zog die
     Feldnamen in `searchOwn`, `mailzugang` und `mailtestOk` nach, 0.24.3 die
     fuenf Namen und zwei Sortierwerte in `blocks`, `filters`, `views` und
     `vocabulary`, und ein dritter schrieb einem gewachsenen Bestand seine
     Vorgabesprache ausdruecklich hin. */
  group('Die gespeicherten Namen der 0.24er Runde — umgedreht');
  {
    const gfDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-formen-'));
    const gfFile = path.join(gfDirectory, 'katalog.sqlite');
    shortRun(`require('./db'); console.log('angelegt');`, gfDirectory);

    /* DER GESTELLTE BESTAND IST DERSELBE GEBLIEBEN: eine Instanz auf dem
       Stand 0.24.0, mit den ALTEN Schluesseln und den ALTEN Feldnamen darin. */
    const gfAccess = { anbieter: 'eigen', server: 'mail.beispiel.de', port: 465, secure: true,
                       benutzer: 'anna@beispiel.de', passwort: 'geheim',
                       absender: 'anna@beispiel.de' };
    const gfOwn = [{ name: 'Ladies-Forum', vorlage: 'https://ladies.forum/suche?q=%s' }, null,
                   { name: 'Zweites Forum', vorlage: 'https://zwei.beispiel.de/?q=%s' }];
    {
      const d = open(gfFile);
      const put = d.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      put.run('sucheEigene', JSON.stringify(gfOwn));
      put.run('mailzugang', JSON.stringify(gfAccess));
      put.run('mailtestOk', JSON.stringify({ marke: 'abc', am: '2026-09-01 10:00:00' }));
      d.close();
    }
    const gfSetting = (k) => {
      const d = open(gfFile);
      const r = d.prepare('SELECT value FROM settings WHERE key = ?').get(k);
      d.close();
      return r ? JSON.parse(r.value) : null;
    };
    check('Der gestellte Bestand traegt die alten Feldnamen',
      (gfSetting('sucheEigene') || [])[0]?.vorlage === 'https://ladies.forum/suche?q=%s' &&
      gfSetting('mailzugang')?.anbieter === 'eigen' && gfSetting('mailtestOk')?.marke === 'abc',
      JSON.stringify([gfSetting('sucheEigene'), gfSetting('mailzugang')]));
    const gfSay = shortRunAll(`require('./db'); console.log('gestartet');`, gfDirectory);
    /* UND EIN START ZIEHT NICHTS MEHR NACH -- das ist die umgedrehte Zusage. */
    check('Ein Start zieht die alten Feldnamen nicht mehr nach',
      (gfSetting('sucheEigene') || [])[0]?.template === undefined &&
      gfSetting('mailzugang')?.provider === undefined,
      JSON.stringify([gfSetting('sucheEigene'), gfSetting('mailzugang')]));
    check('Und er wirft dabei nichts weg — die Zeilen liegen unveraendert da',
      (gfSetting('sucheEigene') || [])[0]?.vorlage === 'https://ladies.forum/suche?q=%s' &&
      gfSetting('mailzugang')?.passwort === 'geheim' &&
      gfSetting('mailtestOk')?.am === '2026-09-01 10:00:00',
      JSON.stringify([gfSetting('sucheEigene'), gfSetting('mailzugang'),
                      gfSetting('mailtestOk')]));
    check('Und er sagt kein Wort mehr ueber Feldnamen',
      !/Feldnamen|field name/i.test(gfSay), gfSay.replace(/\n/g, ' · ').slice(0, 300));
    /* UND DIE INSTANZ KOMMT DABEI HOCH. */
    check('Und die Instanz kommt trotzdem hoch', /gestartet/.test(gfSay),
      gfSay.replace(/\n/g, ' · ').slice(0, 300));
    fs.rmSync(gfDirectory, { recursive: true, force: true });

    /* ZULETZT DIE ZIELE GEGEN DEN QUELLTEXT, DER SIE LIEST -- und DIESE
       Haelfte ist unveraendert geblieben. */
    const gfMail = fs.readFileSync(path.join(__dirname, 'mail.js'), 'utf8');
    const gfServer = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    const gfApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    const gfEmpty = (gfMail.match(/const EMPTY = \{[^}]*\}/) || [''])[0];
    check('Die vier Ziele des Mailzugangs stehen wirklich in mail.js',
      ['provider', 'user', 'password', 'sender'].every(n =>
        new RegExp(`(^|[^A-Za-z])${n}:`).test(gfEmpty)), gfEmpty);
    check('Und das Ziel der Suchvorlage steht wirklich in searchOwn()',
      /typeof e\.template === 'string'/.test(gfServer), 'server.js liest e.template nicht');
    check('Und die beiden Ziele des Mailtests stehen wirklich in server.js',
      /test\.mark === mail\.mark\(raw\)/.test(gfServer) && /test \? test\.at : null/.test(gfServer),
      'server.js liest test.mark/test.at nicht');
    check('Die drei Ziele der Bereiche stehen wirklich in server.js',
      /side: sortArea\(g\.side, BLOCK_DEFAULT\.side\)/.test(gfServer) &&
      /bottom: sortArea\(g\.bottom, BLOCK_DEFAULT\.bottom\)/.test(gfServer) &&
      /closed: \(Array\.isArray\(g\.closed\)/.test(gfServer),
      'server.js liest side/bottom/closed nicht');
    check('Und die Ziele des Filters wirklich in app.js',
      /f\.favorite = f\.favorite === true;/.test(gfApp) &&
      /case 'potential_desc':/.test(gfApp) && /case 'potential_asc':/.test(gfApp),
      'app.js liest favorite/potential_* nicht');
    /* UND DER LESER WUERDE EIN FALSCHES ZIEL WIRKLICH MELDEN -- an gestellten
       Faellen, damit die Zeilen darueber nicht bloss deshalb gruen sind, weil
       der Ausdruck ueberall passt. */
    check('Der Leser wuerde ein Ziel melden, das nirgends gelesen wird',
      !new RegExp(`(^|[^A-Za-z])vorlage:`).test(gfEmpty) &&
      !/typeof e\.muster === 'string'/.test(gfServer) &&
      !/f\.favorit = f\.favorit === true;/.test(gfApp) &&
      !/case 'potenzial_desc':/.test(gfApp),
      'der Leser trifft auch Namen, die nicht dastehen');
    /* UND DIE DREI TAFELN GIBT ES NICHT MEHR. */
    const gfDb = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
    check('Und die drei Tafeln der 0.24er Runde stehen nicht mehr in db.js',
      !/SHAPES_0242|STORED_0243|VOCABULARY_FIELDS_0243|FILTER_FIELDS_0243/.test(gfDb),
      (gfDb.match(/SHAPES_0242|STORED_0243|VOCABULARY_FIELDS_0243|FILTER_FIELDS_0243/g) || [])
        .join(' · ') || 'keine mehr da');
  }

  /* ========= Die Vorgabesprache — 0.24.3, umgedreht ======================
     DER BLOCK SCHRIEB EINEM GEWACHSENEN BESTAND SEINE SPRACHE HIN: gab es
     schon Zugaenge, als diese Fassung zum ersten Mal hochkam, blieb es bei
     Deutsch; eine frische Installation startete auf Englisch. */
  group('Die Vorgabesprache — 0.24.3, umgedreht');
  {
    const bdSetting = (dir, key) => {
      const d = open(path.join(dir, 'katalog.sqlite'));
      const r = d.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      d.close();
      return r ? JSON.parse(r.value) : null;
    };
    const bdFresh = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-frisch-de-'));
    const bdFirst = shortRunAll(`require('./db'); console.log('fertig');`, bdFresh);
    check('Eine frische Installation bekommt keine Vorgabesprache geschrieben',
      bdSetting(bdFresh, 'languageDefault') === null,
      JSON.stringify(bdSetting(bdFresh, 'languageDefault')));
    check('Und sie sagt auch nichts darueber',
      !/Vorgabesprache|default language/i.test(bdFirst), bdFirst.replace(/\n/g, ' · '));
    /* UND DER QUELLTEXT LIEST DARAUS WIRKLICH ENGLISCH. Bis hierher steht
       fest, was in der Zeile STEHT -- diese Zeile belegt, was daraus wird. */
    const bdSeen = shortRun(
      `const { db } = require('./db');` +
      `const r = db.prepare("SELECT value FROM settings WHERE key = 'languageDefault'").get();` +
      `console.log(r ? r.value : 'nichts');`, bdFresh);
    check('Und der Quelltext findet dort nichts, faellt also auf Englisch',
      bdSeen.trim() === 'nichts', bdSeen.trim());
    /* UND EINE INSTANZ MIT ZUGAENGEN BEKOMMT SIE EBENFALLS NICHT MEHR -- das
       ist die umgedrehte Zusage. */
    {
      const d = open(path.join(bdFresh, 'katalog.sqlite'));
      d.prepare("INSERT INTO users (username, password_hash, role, status) VALUES (?,?,?,?)")
        .run('sprachanna', 'x', 'owner', 'active');
      d.close();
    }
    const bdGrown = shortRunAll(`require('./db'); console.log('fertig');`, bdFresh);
    check('Und auch eine Instanz mit Zugaengen bekommt sie nicht mehr',
      bdSetting(bdFresh, 'languageDefault') === null,
      JSON.stringify(bdSetting(bdFresh, 'languageDefault')));
    check('Und auch darueber sagt der Start nichts',
      !/Vorgabesprache|default language/i.test(bdGrown), bdGrown.replace(/\n/g, ' · '));
    /* UND WER SIE GESETZT HAT, BEHAELT SIE. */
    {
      const d = open(path.join(bdFresh, 'katalog.sqlite'));
      d.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .run('languageDefault', JSON.stringify('de'));
      d.close();
    }
    shortRunAll(`require('./db'); console.log('fertig');`, bdFresh);
    check('Und eine ausdrueckliche Einstellung haelt ueber den Start',
      bdSetting(bdFresh, 'languageDefault') === 'de',
      JSON.stringify(bdSetting(bdFresh, 'languageDefault')));
    fs.rmSync(bdFresh, { recursive: true, force: true });
  }

  /* ================= Der Stempel der Datenbank — 0.33.0 ==================
     ZUSAGE 13 UND 14 DES AUFTRAGS, und beide gehen auf denselben Befund des
     Betreibers vom 14. September 2026: *„Prueft das System beim Einspielen,
     mit welcher Version die Datenbank betrieben wurde? */
  group('Der Stempel der Datenbank — 0.33.0');
  {
    const stVersion = require('./package.json').version;
    const stDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-stempel-'));
    const stRead = (dir, key) => {
      const d = open(path.join(dir, 'katalog.sqlite'));
      const r = d.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      d.close();
      return r ? JSON.parse(r.value) : null;
    };
    shortRun(`require('./db'); console.log('da');`, stDir);
    /* EINE FRISCHE DATENBANK TRAEGT BEIDE ZEILEN. Sie IST in diesem Augenblick
       angelegt worden, und die Aussage ist wahr. */
    check('Eine frische Datenbank sagt, womit sie angelegt wurde',
      stRead(stDir, 'versionCreated') === stVersion,
      JSON.stringify(stRead(stDir, 'versionCreated')));
    check('Und womit sie zuletzt geoeffnet wurde',
      stRead(stDir, 'versionLastOpened') === stVersion,
      JSON.stringify(stRead(stDir, 'versionLastOpened')));
    /* UND DER ZWEITE START AENDERT NICHTS UND SAGT NICHTS. */
    const stSecond = shortRunAll(`require('./db'); console.log('da');`, stDir);
    check('Ein zweiter Start aendert nichts und sagt nichts darueber',
      stRead(stDir, 'versionCreated') === stVersion &&
      stRead(stDir, 'versionLastOpened') === stVersion &&
      !/last ran under/.test(stSecond),
      stSecond.replace(/\n/g, ' · ').slice(0, 200));
    /* DER WECHSEL WIRD GESAGT, UND ZWAR NUR ER. „Laeuft weiter unter derselben
       Fassung" bei jedem Start waere Gerede; ein Wechsel ist eine Nachricht. */
    {
      const d = open(path.join(stDir, 'katalog.sqlite'));
      d.prepare("UPDATE settings SET value = ? WHERE key = 'versionLastOpened'")
        .run(JSON.stringify('0.19.0'));
      d.close();
    }
    const stMoved = shortRunAll(`require('./db'); console.log('da');`, stDir);
    check('Ein Wechsel der Fassung wird gesagt — mit beiden Zahlen',
      /last ran under 0\.19\.0/.test(stMoved) && stMoved.includes(stVersion),
      stMoved.replace(/\n/g, ' · ').slice(0, 260));
    check('Und die Zeile steht danach auf der laufenden Fassung',
      stRead(stDir, 'versionLastOpened') === stVersion,
      JSON.stringify(stRead(stDir, 'versionLastOpened')));
    /* UND „ANGELEGT MIT" RUEHRT SICH DABEI NICHT. */
    check('Und „angelegt mit" ruehrt sich dabei nicht',
      stRead(stDir, 'versionCreated') === stVersion,
      JSON.stringify(stRead(stDir, 'versionCreated')));
    fs.rmSync(stDir, { recursive: true, force: true });

    /* UND EIN GEWACHSENER BESTAND BEKOMMT „ANGELEGT MIT" GAR NICHT. */
    const stGrown = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-stempel-alt-'));
    shortRun(`require('./db'); console.log('da');`, stGrown);
    {
      const d = open(path.join(stGrown, 'katalog.sqlite'));
      d.prepare('DELETE FROM settings WHERE key IN (?, ?)')
        .run('versionCreated', 'versionLastOpened');
      d.prepare("INSERT INTO users (username, password_hash, role, status) VALUES (?,?,?,?)")
        .run('stempelanna', 'x', 'owner', 'active');
      d.close();
    }
    shortRunAll(`require('./db'); console.log('da');`, stGrown);
    check('Ein gewachsener Bestand bekommt „angelegt mit" NICHT nachgetragen',
      stRead(stGrown, 'versionCreated') === null,
      JSON.stringify(stRead(stGrown, 'versionCreated')));
    check('Aber „zuletzt geoeffnet" bekommt er sehr wohl',
      stRead(stGrown, 'versionLastOpened') === stVersion,
      JSON.stringify(stRead(stGrown, 'versionLastOpened')));
    fs.rmSync(stGrown, { recursive: true, force: true });

    /* UND DER STEMPEL IST KEIN MERKER FUER DIE PROBE. */
    const stDb = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
    const stProbe = stDb.slice(stDb.indexOf('function incompleteDatabase()'),
                               stDb.indexOf('function warnIncompleteDatabase('));
    check('Die Probe liest den Stempel nicht — sie fragt sqlite_master',
      /sqlite_master/.test(stProbe) && !/version(Created|LastOpened)/.test(stProbe) &&
      !/user_version/.test(stProbe),
      stProbe.slice(0, 200));
    /* UND DIE EXPORTDATEI TRAEGT DIE PROGRAMMFASSUNG NEBEN DER FORMATNUMMER
       -- Zusage 14. Zwei Fragen, zwei Felder: `version` sagt, WELCHE FELDER
       zu erwarten sind, `appVersion` sagt, WAS die Datei geschrieben hat. */
    const stServer = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    check('Und die Programmfassung geht an beiden Schreibstellen mit hinaus',
      (stServer.match(/appVersion: VERSION/g) || []).length === 2,
      `${(stServer.match(/appVersion: VERSION/g) || []).length} Stellen`);
    /* UND DIE FORMATNUMMER STEHT AN EINER STELLE, von der aus beide
       Schreibstellen UND die Abweisung rechnen -- Zusage 11. */
    check('Die Formatnummer steht genau einmal als Zahl im Quelltext',
      (stServer.match(/EXCHANGE_FORMAT = \d+/g) || []).length === 1 &&
      /const EXCHANGE_FORMAT = 17;/.test(stServer),
      (stServer.match(/EXCHANGE_FORMAT = \d+/g) || []).join(' · '));
    check('Und die aelteste gelesene daneben, unter ihr',
      /const EXCHANGE_FORMAT_MIN = 14;/.test(stServer) && 14 < 17,
      (stServer.match(/EXCHANGE_FORMAT_MIN = \d+/g) || []).join(' · '));
  }

  /* ================= Der Bildschirmtext-Waechter — 0.22.0 =================
     Der zweite Durchgang: die Texte in Anfuehrungszeichen und Backticks von
     public/app.js und die error:-Texte der Serverdateien gegen die
     Verbotsliste aus dem Konzept 0.22.0, Abschnitt 4.3. */
  group('Der Bildschirmtext-Waechter — 0.22.0');
  {
    /* ERST DER LESER SELBST, an gestellten Faellen: ein Waechter, dessen
       Leser Kommentare fuer Text haelt, meldet Falsches; einer, der Text fuer
       Code haelt, meldet nichts. */
    const bt = (s) => screenTextsFrom(s).map(t => t.text);
    check('Der Leser findet Zeichenketten in einfachen und doppelten Anfuehrungszeichen',
      equal(bt("toast('Gespeichert'); x = \"Kein Zugang\";"), ['Gespeichert', 'Kein Zugang']),
      JSON.stringify(bt("toast('Gespeichert'); x = \"Kein Zugang\";")));
    check('Und die Textteile einer Vorlage, ohne den Code in den Klammern',
      equal(bt('a = `<p>Hallo ${esc(V.Kasten)} da</p>`;'), ['<p>Hallo ', ' da</p>']),
      JSON.stringify(bt('a = `<p>Hallo ${esc(V.Kasten)} da</p>`;')));
    check('Auch in einer Vorlage, die in einer Vorlage steckt',
      equal(bt('a = `Oben ${b ? `Innen ${c}` : \'Sonst\'} unten`;'), ['Oben ', 'Innen ', 'Sonst', ' unten']),
      JSON.stringify(bt('a = `Oben ${b ? `Innen ${c}` : \'Sonst\'} unten`;')));
    check('Kommentare liest er nicht — die sind Sache des Sprachwaechters',
      equal(bt("// 'Grabstein' im Kommentar\n/* \"Tafel\" */\nx = 'Text';"), ['Text']),
      JSON.stringify(bt("// 'Grabstein' im Kommentar\n/* \"Tafel\" */\nx = 'Text';")));
    check('Bezeichner liest er nicht',
      equal(bt('const grabstein = tafel(kasten);'), []), JSON.stringify(bt('const grabstein = tafel(kasten);')));
    check('Ein regulaerer Ausdruck mit Anfuehrungszeichen darin bringt ihn nicht durcheinander',
      equal(bt("if (/['\"]/.test(s)) t = 'danach';"), ['danach']),
      JSON.stringify(bt("if (/['\"]/.test(s)) t = 'danach';")));
    check('Und er nennt zu jedem Text die Zeile',
      screenTextsFrom("a = 1;\nb = 'zwei';\n").map(t => t.row).join() === '2',
      JSON.stringify(screenTextsFrom("a = 1;\nb = 'zwei';\n")));
    check('Aus einer Serverdatei liest er nur die Texte hinter error:',
      equal(serverTextsFrom("const x = 'kein Text'; res.json({ error: 'Der Kasten fehlt. ' +\n  'Zweiter Satz.' }); y = 'auch nicht';").map(t => t.text),
             ['Der Kasten fehlt. ', 'Zweiter Satz.']),
      JSON.stringify(serverTextsFrom("res.json({ error: 'Der Kasten fehlt. ' +\n  'Zweiter Satz.' });").map(t => t.text)));
    /* DIE LISTE FINDET, WAS SIE FINDEN SOLL -- und laesst die Ausnahmen in
       Ruhe. */
    check('Die Verbotsliste faengt ein Wort aus der Liste',
      screenViolations([{ text: 'Der Grabstein steht da', row: 1 }]).length === 1 &&
      screenViolations([{ text: 'Neu seit deinem letzten Blick', row: 1 }]).length === 1 &&
      screenViolations([{ text: 'Ein Zugang wird entfernt', row: 1 }]).length === 1,
      'eines der drei Muster greift nicht');
    check('Und laesst die benannten Ausnahmen durch',
      screenViolations([{ text: 'Die Note muss zwischen 1 und 5 liegen.', row: 1 },
                            { text: 'Zugang anfragen', row: 1 }, { text: 'Noch keinen Zugang?', row: 1 },
                            { text: 'Prüfsumme (Fingerprint)', row: 1 },
                            { text: 'verschlüsselte Kopie der Datenbank', row: 1 },
                            { text: '/api/items/1/ratings', row: 1 }]).length === 0,
      JSON.stringify(screenViolations([{ text: 'Die Note muss zwischen 1 und 5 liegen.', row: 1 },
                            { text: 'Zugang anfragen', row: 1 }, { text: 'Noch keinen Zugang?', row: 1 },
                            { text: 'Prüfsumme (Fingerprint)', row: 1 },
                            { text: 'verschlüsselte Kopie der Datenbank', row: 1 },
                            { text: '/api/items/1/ratings', row: 1 }])));
    check('Die Liste traegt mindestens dreissig Zeilen',
      SCREEN_BAN.length >= 30, `${SCREEN_BAN.length} Zeilen`);

    /* WAS EIN SCHLUESSEL IST UND WAS EIN SATZ -- der Filter steht hier oben,
       weil ihn seit 0.24.0 beide Seiten brauchen: die Serverdateien und
       app.js. */
    const isKey = (x) => /^[a-zäöü][A-Za-z0-9]*(\.[A-Za-z0-9]+)+$/.test(x);
    const isIdentifier = (x) => /^[a-zäöü][A-Za-z0-9_-]*$/.test(x);
    /* DANN DER GEGENSTAND: die Sprachdatei traegt Hunderte Bildschirmtexte,
       sonst belegte „kein Verstoss" nichts. */
    const btApp = screenTextsFrom(fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8'))
      .filter(t => !isKey(t.text));
    /* DER SERVERTEXT-WAECHTER DREHT SICH UM -- 0.24.0, Bauabschnitt 2. */
    /* WAS HINTER `error:` NOCH STEHEN DARF: ein SCHLUESSEL („server.tagGone")
       und ein BEZEICHNER („deleted", der Status in einem Vergleich). */
    const btServerRaw = ['server.js', 'auth.js', 'mail.js'].flatMap(d =>
      serverTextsFrom(fs.readFileSync(path.join(__dirname, d), 'utf8')).map(t => ({ ...t, file: d })))
      .filter(t => !isKey(t.text) && !isIdentifier(t.text));
    check('Kein Literal steht mehr hinter „error:" in den drei Serverdateien',
      btServerRaw.length === 0,
      btServerRaw.slice(0, 6).map(t => `${t.file}:${t.row} „${t.text}"`).join(' · '));
    // Und der Filter wirft nicht ALLES weg: ein deutscher Satz bleibt stehen.
    check('Und der Filter laesst einen deutschen Satz stehen',
      !isKey('Bitte einen Titel eingeben.') && !isIdentifier('Bitte einen Titel eingeben.')
        && isKey('server.tagGone') && isIdentifier('deleted'),
      'der Filter trennt Schluessel und Satz nicht');
    const spDe = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'));
    const btServer = Object.entries(spDe)
      .filter(([k]) => k.startsWith('server.') || k.startsWith('login.'))
      .flatMap(([k, v]) => (typeof v === 'string' ? [v] : Object.values(v))
        .map(text => ({ text, row: k, file: 'public/languages/de.json' })));
    check('Und die Sprachdatei traegt dafuer mehr als hundert Servermeldungen',
      btServer.length > 100, `${btServer.length} Meldungen`);
    /* JEDER WERT DER DATEI, nicht nur die Servermeldungen -- der Waechter
       sieht seit 0.24.0 auch, was aus app.js und mail.js dorthin gezogen ist. */
    const btDe = Object.entries(spDe).filter(([k]) => k !== '_locale')
      .flatMap(([k, v]) => (typeof v === 'string' ? [v] : Object.values(v))
        .map(text => ({ text: text.replace(/\{[^}]*\}/g, ' '), row: k,
                        file: 'public/languages/de.json' })));
    check('Die Sprachdatei traegt mehr als achthundert lesbare Texte',
      btDe.filter(t => !isAddress(t.text)).length > 800, `${btDe.length} Texte`);
    /* NULL DEUTSCHE SAETZE IN `throw new Error` IN auth.js -- der blinde
       Fleck des Waechters faellt damit von selbst: was auth.js wirft, ist ein
       Schluessel, und den Text liest der Waechter in de.json. */
    const withoutScreen = [
      'Ein Zugangswechsel braucht den angemeldeten Benutzer.',
      'Eine Sitzung braucht einen Benutzer.',
      'Eine Sitzungsliste braucht den angemeldeten Benutzer.',
      'Das Beenden braucht den angemeldeten Benutzer.',
      'Dieser Vorgang braucht den Handelnden — eine Nummer oder VOM_WIRT.',
      'Unbekannter Vorgang: ',
      'Unbekanntes Merkmal: ',
      'Eine Freigabe braucht die Sitzung.',
      'Ein Ausweis braucht einen Zugang.'
    ];
    const authThrows = [...fs.readFileSync(path.join(__dirname, 'auth.js'), 'utf8')
      .matchAll(/throw new Error\(\s*[`']([^`']*)/g)].map(m => m[1]);
    const foreignThrows = authThrows.filter(w => !withoutScreen.some(o => w.startsWith(o)));
    check('Kein deutscher Satz mehr in `throw new Error` in auth.js',
      foreignThrows.length === 0, foreignThrows.slice(0, 6).join(' · '));
    // Und der Gegenstand dazu: die neun Programmierfehler stehen wirklich
// noch da.
    check('Und die neun Programmierfehler ohne Bildschirm stehen namentlich da',
      authThrows.length === 10 && withoutScreen.every(o => authThrows.some(w => w.startsWith(o))),
      `${authThrows.length} Wuerfe: ${authThrows.join(' · ').slice(0, 160)}`);
    const vApp = screenViolations(btApp);
    check('Kein Bildschirmtext in app.js traegt ein Wort der Verbotsliste',
      vApp.length === 0, vApp.slice(0, 12).join(' · '));
    /* NEUN SAETZE, DIE DER WAECHTER ZUM ERSTEN MAL SIEHT -- 0.24.0. */
    const LEGACY = ['login.noUserYet', 'server.criteriaConflict',
                       'server.backupInDataDir', 'server.deniedOwnUser',
                       'mail.confirm.body', 'mail.invite.subject',
                       'mail.invite.body', 'mail.reset.body', 'mail.test.body'];
    check('Die neun Altlasten stehen wirklich noch in der Sprachdatei',
      LEGACY.every(k => spDe[k] !== undefined),
      LEGACY.filter(k => spDe[k] === undefined).join(' · ') || 'alle neun da');
    const vDe = screenViolations(btDe.filter(t => !LEGACY.includes(t.row)));
    check('Kein Wert der Sprachdatei ebenso — ausser den neun benannten Altlasten',
      vDe.length === 0, vDe.slice(0, 12).join(' · '));
    // Und sie sind wirklich Verstoesse: ohne diese Zeile stuende die Liste
// oben auch dann da, wenn sie laengst richtiggestellt waeren.
    const vOld = screenViolations(btDe.filter(t => LEGACY.includes(t.row)));
    check('Und die neun sind wirklich Verstoesse, keine Vorratsliste',
      vOld.length >= 9, `${vOld.length} Verstoesse`);
  }

  /* ================= Die Deckung der Sprachdatei — 0.35.0 =================
     DER BEFUND DER MESSUNG ZUR 0.35.0: kein einziger Schluessel in
     public/languages/de.json ist tot -- aber kein Pruefmodul hat das je
     gemessen. Ein Schluessel ohne Leser faellt damit erst auf, wenn ihn
     jemand von Hand sucht.

     GEMESSEN WIRD IN EINE RICHTUNG: jeder Schluessel der Sprachdatei hat
     einen Leser im Quelltext. Die Gegenrichtung -- jeder t()-Ruf hat einen
     Schluessel -- steht seit 0.24.0 in der Gruppe „Der Sprachwaechter". */
  group('Jeder Schluessel der Sprachdatei hat einen Leser — 0.35.0');
  {
    const lkRead = (name) => fs.readFileSync(path.join(__dirname, ...name.split('/')), 'utf8');
    /* DIE DREIZEHN DATEIEN, DIE TEXTE NACHSCHLAGEN -- dieselbe Liste wie in
       tools/comments.js, ohne public/theme.js (es kennt keine Sprache) und
       um public/index.html erweitert. */
    const LK_FILES = ['public/app.js', 'public/index.html', 'server.js', 'auth.js',
      'mail.js', 'db.js', 'keys.js', 'attachments.js', 'images.js',
      'usertool.js', 'keytool.js', 'twofactor.js', 'batchrun.js'];
    const lkText = LK_FILES.map(lkRead).join('\n');
    const lkKeys = Object.keys(JSON.parse(lkRead('public/languages/de.json')))
      .filter(k => k !== '_locale' && k !== '_name');
    check('Der Waechter sieht alle Schluessel der Vorgabesprache',
      lkKeys.length > 1100, `${lkKeys.length} Schluessel`);

    /* ZWEI FAMILIEN WERDEN GEBAUT UND STEHEN DESHALB NIRGENDS WOERTLICH.
       Sie sind hier NAMENTLICH ausgenommen und nicht ueber ein Muster: eine
       Ausnahme, die ein Muster ist, waechst mit jedem Tippfehler mit. */
    const LK_BUILT = [
      // mail.js:196-197 baut `mail.${kind}.subject` und `mail.${kind}.body`.
      ...['confirm', 'invite', 'reset', 'test'].flatMap(k =>
        [`mail.${k}.subject`, `mail.${k}.body`]),
      // server.js liest die Vorgaben ueber VOCABULARY_PREFIX, public/app.js
      // baut die Felder aus VOCABULARY_FIELDS.
      ...['entryOne', 'entryMany', 'testedYes', 'testedNo', 'dayOne', 'dayMany',
          'reportOne', 'reportMany', 'taskOne', 'taskMany', 'taskDone',
          'potential', 'ratingOne', 'ratingMany', 'grade'].map(k => `vocabulary.${k}`)
    ];
    check('Die beiden gebauten Familien zaehlen dreiundzwanzig Schluessel',
      LK_BUILT.length === 23, `${LK_BUILT.length}`);
    /* UND SIE WERDEN WIRKLICH GEBAUT -- sonst waere die Ausnahmeliste eine
       Erlaubnis fuer toten Text. */
    check('Und beide Bauformen stehen im Quelltext',
      /mail\.\$\{kind\}\.subject/.test(lkRead('mail.js'))
      && /mail\.\$\{kind\}\.body/.test(lkRead('mail.js'))
      && /const VOCABULARY_PREFIX = 'vocabulary\.';/.test(lkRead('server.js'))
      && /const VOCABULARY_FIELDS = \[/.test(lkRead('public/app.js')),
      'eine der beiden Bauformen fehlt');
    check('Und jeder der dreiundzwanzig steht wirklich in der Sprachdatei',
      LK_BUILT.every(k => lkKeys.includes(k)),
      LK_BUILT.filter(k => !lkKeys.includes(k)).join(' · ') || 'alle da');

    const lkDead = lkKeys.filter(k => !LK_BUILT.includes(k) && !lkText.includes(k));
    check('Kein Schluessel der Sprachdatei steht ohne Leser da',
      lkDead.length === 0, lkDead.slice(0, 12).join(' · '));
    /* UND DER WAECHTER WUERDE EINEN TOTEN WIRKLICH MELDEN: ein Schluessel,
       den es nicht gibt, hat auch keinen Leser. */
    check('Der Waechter wuerde einen toten Schluessel melden',
      !lkText.includes('list.thisKeyHasNoReader'),
      'der erfundene Schluessel steht im Quelltext');

    /* DIE DREI DATEIEN TRAGEN DIESELBEN SCHLUESSEL -- gemessen, nicht
       angenommen. Die Deckung oben gilt sonst nur fuer Deutsch. */
    const lkOther = ['en', 'tr'].map(code => {
      const keys = Object.keys(JSON.parse(lkRead(`public/languages/${code}.json`)))
        .filter(k => k !== '_locale' && k !== '_name');
      return { code, missing: lkKeys.filter(k => !keys.includes(k)) };
    }).filter(z => z.missing.length);
    check('Und Englisch und Tuerkisch tragen dieselben Schluessel',
      lkOther.length === 0,
      lkOther.map(z => `${z.code}: ${z.missing.slice(0, 6).join(' ')}`).join(' · '));
  }
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
