/* Kriterion — Pruefstand: die Waechter ueber den Quelltext
 *
 * Was im Quelltext STEHT, nicht was der Server tut: die Rechteschicht je
 * Route, der Sprachwaechter ueber die Kommentare, die sechs Waechter ueber
 * das Englisch im Code und der Waechter ueber die Bildschirmtexte.
 * 
 * Er startet keinen Server und oeffnet keine Datenbank -- er liest Dateien.
 *
 * Eigener Prozess, eigener Speicher. Der Rahmen steht in test/rahmen.js.
 */
const H = require('./rahmen.js');
const D = require('./dom.js');
const {
  screenTextsFrom, serverTextsFrom, SCREEN_BAN, isAddress,
  screenViolations
} = D;

async function laufen() {
  const {
   fs, os, path, attachments, sharp, zerlege, CODE, TEXT, KOMMENTAR,
   __dirname, require, group, check, equal, open, shortRun, shortRunAll,
   call, names, pruefstandDateien
  } = H;

  /* ---------------------------------------------------------------- */
  group('Der Waechter ueber den Quelltext');

  /* Diese Gruppe prueft nicht, was der Server TUT, sondern was im Quelltext
     STEHT -- und sie ist die einzige, die eine FEHLENDE Entscheidung findet.
     Wer spaeter eine schreibende Route ergaenzt, ohne ueber ihr Recht zu
     entscheiden, wird hier namentlich rot; alle Prüfungen darüber bleiben
     gruen, weil es zu einer Route, die es noch nicht gibt, auch keine gibt.
     Geschnitten wird von Klammer zu Klammer mit indexOf, ausdruecklich OHNE
     zusammengesetztes Muster: eine aus einem String gebaute Regel wird
     zweistufig maskiert und sieht dabei in jeder Schreibweise plausibel aus
     -- und ist dabei in jeder Schreibweise plausibel.

     Vier Arten, und die Liste ist die Entscheidung:
       nurAdmin / nurEigentuemer / nurEintragVerfasser
                    -- benannter Waechter, steht in der Routenzeile
       'im Rumpf'   -- zwei Rechteklassen in einem Rumpf oder die
                       Eintragsnummer kommt erst aus der Kindzeile
       'nurAdmin, im Rumpf'
                    -- BEIDES: die Route steht hinter dem
                       Waechter UND unterscheidet drinnen noch einmal. Die drei
                       Verwaltungsrouten sind so gebaut: der Admin kommt herein,
                       an einen anderen Admin kommt aber nur der Eigentuemer.
                       Ohne diese Art bliebe eine der beiden Haelften ungeprueft
                       -- und zwar stillschweigend.
       'selbstbezug'-- der eigene Zugang, geprueft in auth.js
       'offen'      -- ausdruecklich fuer jeden, ODER baulich schon auf die
                       eigene Zeile begrenzt (Bewertungen). Hier gehoert
                       NICHTS hin, und auch das wird geprueft.
       'zweitbestaetigt'
                    -- ZUSATZ WIE 'im Rumpf', seit 0.8.90: der Weg trifft die
                       Instanz als Ganzes und verlangt das Passwort ein zweites
                       Mal. Die Art steht daneben und nicht anstelle der
                       anderen: 'nurEigentuemer' sagt WER darf, dieser Zusatz
                       sagt, dass es damit noch nicht getan ist. Genau der
                       Befund aus 0.8.30 -- die Art sagte bis dahin nur, DASS
                       eine Klemme dasteht, nicht WELCHE. */
  const fSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const CORE_WORDS = ['mayChange(', 'selfOnly(', 'entryFree(', 'isAdmin(',
    'isOwner(', 'targetUserFree(', 'mayCreate('];
  const F_ROUTES = [
    ['POST',   '/api/setup',                     'offen'],
    ['POST',   '/api/login',                     'offen'],
    ['POST',   '/api/logout',                    'offen'],
    /* Der Token, 0.8.80 -- die vierte und fuenfte offene schreibende Route.
       Im Kopf steht keine Rechtefrage, also MUSS die Schranke im Rumpf
       stehen, und sie heisst Token.
       'pruefen' LIEST NUR und steht trotzdem hier: es ist ein POST, weil der
       Token in den RUMPF gehoert und nicht in Pfad oder Abfrage, wo er im
       Zugriffsprotokoll, in der Verlaufsliste und womoeglich im Referrer
       stuende. Der Waechter sieht jedes app.post( an; eine Route, die er
       findet und die Liste nicht kennt, faerbt ihn rot -- also gehoert sie
       hierher, mit dieser Begruendung daneben und nicht stillschweigend
       ausgenommen. */
    ['POST',   '/api/token/check',             'offen'],
    ['POST',   '/api/token/redeem',           'offen'],
    /* Die Selbstanmeldung, 0.9.1 -- die sechste und siebte offene schreibende
       Route. Im Kopf steht keine Rechtefrage, und im Rumpf steht auch keine:
       es DARF sie jeder. Was diese beiden begrenzt, ist etwas anderes -- der
       Schalter, der Deckel, die Bremse und die immer gleiche Antwort.
       BEIDE SIND POST, obwohl die zweite fast nur nachschlaegt. Derselbe Grund
       wie bei den Tokenrouten darueber: der Schluessel gehoert in den RUMPF
       und nicht in Pfad oder Abfrage. */
    ['POST',   '/api/signup',             'offen'],
    ['POST',   '/api/signup/confirm', 'offen'],
    /* Der zweite Schritt der Anmeldung, 0.10.0 -- die ACHTE offene schreibende
       Route. Im Kopf steht keine Rechtefrage, also MUSS die Schranke im Rumpf
       stehen, und sie heisst Ausweis UND Code: der Ausweis allein belegt nur,
       dass jemand das Passwort kannte.
       DIE BENUTZERNUMMER KOMMT AUS DEM AUSWEIS UND NIE AUS DEM RUMPF -- sonst
       waere das richtige Passwort eines Zugangs die Eintrittskarte fuer jeden
       anderen. Sie traegt trotzdem nicht 'selbstbezug': dort kommt die Nummer
       aus req.user, und hier ist noch niemand angemeldet. */
    ['POST',   '/api/login/second',                'offen'],
    ['PUT',    '/api/account',                   'selbstbezug'],
    /* Meine Sitzungen, 0.8.80. 'selbstbezug' wie PUT /api/account, und aus
       demselben Grund: die Klemme ist nicht eine Rollenfrage im Rumpf, sondern
       die Bauform -- user_id kommt aus req.user und nie aus der Adresse.
       Ein Admin kommt ueber diese Routen an keine fremde Sitzung. */
    ['DELETE', '/api/sessions',                  'selbstbezug'],
    ['DELETE', '/api/sessions/:sessionId',      'selbstbezug'],
    /* Die Freigabe fuer die schweren Wege, 0.8.90. 'selbstbezug' wie
       PUT /api/account: der Benutzer kommt aus req.user und nie aus der
       Adresse -- wer bestaetigt, bestaetigt fuer sich. */
    ['POST',   '/api/confirm',              'selbstbezug'],
    /* Der zweite Faktor, 0.10.0 -- VIER Routen, alle 'selbstbezug'. Das ist
       hier nicht bloss ordentlich, es ist die ganze Rechtefrage des Bereichs:
       JEDER SCHALTET IHN FUER SICH SELBST EIN UND AUS. Die Nummer kommt aus
       req.user, und es gibt gar keine Adresse, unter der ein Fremder
       gemeint waere -- ein nurAdmin daneben haette nichts zu entscheiden.
       EIN ADMIN SCHALTET EINEN FREMDEN FAKTOR NICHT AB, und der Grund ist
       baulich: kein Pfad, keine Nummer, kein Weg. Der einzige daneben ist
       usertool.js auf dem Wirt. */
    ['POST',   '/api/two-factor/start',          'selbstbezug'],
    ['POST',   '/api/two-factor/on',             'selbstbezug'],
    ['POST',   '/api/two-factor/codes',          'selbstbezug'],
    ['DELETE', '/api/two-factor',                'selbstbezug'],
    /* ANLEGEN BRAUCHT KEINE ZWEITE BESTAETIGUNG, und das ist entschieden und
       nicht vergessen: es erzeugt einen NEUEN Zugang und nimmt niemandem
       etwas. Der Link an einem BESTEHENDEN Zugang ist der andere Fall. */
    ['POST',   '/api/users',                     'adminOnly, im Rumpf'],
    /* Der Link fuer einen vorhandenen Zugang. Dieselbe Rechtezeile wie die
       drei Verwaltungsrouten: zielZugangFrei entscheidet, damit gilt die
       Rollenleiter auch hier. */
    ['POST',   '/api/users/:id/token',           'adminOnly, im Rumpf, zweitbestaetigt'],
    /* Zwei der drei Rechteklassen dieser Route liegen hinter der zweiten
       Bestaetigung -- Rolle und fremdes Passwort. Sperren und Freigeben nicht:
       das ist umkehrbar und uebergibt nichts. */
    ['PUT',    '/api/users/:id',                 'adminOnly, im Rumpf, zweitbestaetigt'],
    ['DELETE', '/api/users/:id',                 'adminOnly, im Rumpf, zweitbestaetigt'],
    /* Der Mailzugang, 0.9.0. NUR DER EIGENTUEMER, und zusaetzlich
       zweitbestaetigt -- der SMTP-Server sieht jede Mail, und jede traegt
       einen Link, der ein Passwort setzt. Ein Admin, der ihn setzen duerfte,
       boege die Ruecksetzmail des Eigentuemers auf einen Server seiner Wahl.
       GET /api/mail steht wie immer NICHT hier: lesend, auch mit Waechter. */
    ['PUT',    '/api/mail',                      'ownerOnly, zweitbestaetigt'],
    /* Die Testmail. nurEigentuemer wie das Setzen daneben -- wer den Zugang
       nicht sehen darf, testet ihn auch nicht. Sie geht an die EIGENE Adresse
       des Anfordernden; ein Adressfeld gibt es nicht, und der Rumpf wird gar
       nicht angesehen. Deshalb steht hier auch keine Klemme im Rumpf: der
       Selbstbezug ist baulich und nicht abgefragt. */
    ['POST',   '/api/mail/test',                 'ownerOnly'],
    /* Die Selbstanmeldung hinter der Anmeldung, 0.9.1 -- drei Routen, alle
       beim ADMIN und nicht beim Eigentuemer: aus einer Anfrage wird nie etwas
       anderes als ein Zugang mit der Rolle 'user', und den legt der Admin
       ohnehin an. Die Rollenleiter wird dabei nicht beruehrt -- es gibt keinen
       bestehenden Zugang, an den hier jemand herankaeme.
       KEINE ZWEITE BESTAETIGUNG, und das ist entschieden: dieselbe Ueberlegung
       wie bei POST /api/users -- es entsteht ein NEUER Zugang und nimmt
       niemandem etwas.
       GET /api/requests steht wie immer NICHT hier: lesend, auch mit Waechter. */
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
    /* DER EINE GRIFF FUER DIE UNBEKANNTE ERSTELLUNGSSPRACHE -- 0.25.0 (F2).
       Er traegt eine Sprache und schreibt sie in BEIDE Grundtabellen, aber nur
       dort, wo `language IS NULL`: die Migration fuellt nichts, und dies ist
       die eine Nachfrage danach.
       ADMINONLY IM KOPF, wie die vier Verwaltungsrouten darueber: er benennt
       nichts um, aber er sagt fuer den ganzen Bestand, in welcher Sprache er
       geschrieben ist -- und das steht danach an jeder Liste jedes Lesers. */
    ['PUT',    '/api/names/language',            'adminOnly'],
    /* DER WEG, EINEN TAG FUER SICH ANZULEGEN -- 0.24.4 (B7). Dieselbe
       Rechtezeile wie POST /api/product-categories drei Zeilen darueber, und
       aus demselben Grund: einen VORHANDENEN Tag zu benennen darf jeder, nur
       ein NEUER Name haengt am Schalter `tagsFreeCreate`. Stuende adminOnly
       im Kopf, waere die Klemme darunter totes Holz -- mayCreate() ist fuer
       einen Admin immer wahr, und eine Klemme, die nie greift, laesst sich
       nicht gegenpruefen. */
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
    // Dieselbe Klemme wie dort -- wer den Eintrag aendern darf, darf Videos
    // hinzufuegen, sonst niemand.
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
    /* DELETE /api/items/:id/ratings STEHT HIER NICHT MEHR -- 0.21.0. Das
       Sammel-Zuruecksetzen ist weggefallen; zurueckgesetzt wird an der ZEILE,
       ueber PUT mit `value: 0`. Eine Route ohne Weg vom Bildschirm ist tot.
       Die Absage darauf steht in der Gruppe „Die Sternzeile" und ist eine
       eigene Pruefung: 404 statt 200. */
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
       Import, und liegt damit in derselben Rechtezeile. Wer einen Rueckweg
       nehmen darf, darf ihn auch schliessen; deshalb dieselbe Klemme am
       endgueltigen Entfernen. */
    ['POST',   '/api/trash/:id/restore', 'ownerOnly'],
    ['DELETE', '/api/trash/:id',            'ownerOnly'],
    /* Die Sicherung, 0.8.70. Beide beim Eigentuemer, dieselbe Zeile wie Export
       und Import -- alles, was die Instanz als Ganzes betrifft. Der Zielort geht
       ausdruecklich NICHT ueber PUT /api/settings: die Route leitet ihre Rechte
       aus PERSOENLICHE_SCHLUESSEL ab, und was dort nicht persoenlich ist, ist
       Adminsache. Der Sicherungsort ist es nicht. */
    ['PUT',    '/api/backup/dir',             'ownerOnly'],
    ['POST',   '/api/backup',                 'ownerOnly'],
    /* Die Bildumstellung, 0.19.0 -- die siebzigste. Beim Eigentuemer und
       zweitbestaetigt, dieselbe Zeile wie Export, Import und Sicherung: der
       Lauf schreibt jeden PNG-Blob der Instanz um, und die alte Fassung ist
       danach weg.
       DER SCHALTER DANEBEN BEKOMMT AUSDRUECKLICH KEINE ROUTE. Er geht ueber
       PUT /api/settings wie jede andere Einstellung; der Fortschritt des
       Laufs ist ein Feld in GET /api/stats und damit lesend. Eine neue Spalte
       ist erst recht keine Route. */
    ['POST',   '/api/images/convert',          'ownerOnly, zweitbestaetigt'],
    /* Das Aufraeumen alter Sicherungen, 0.20.0 -- die einundsiebzigste. Beim
       Eigentuemer und zweitbestaetigt, dieselbe Zeile wie Export, Import,
       Sicherung und die Bildumstellung: sie entfernt Bytes unwiderruflich,
       und zwar ganze Dateien vom Dateisystem des Wirts.
       EINE ROUTE FUER BEIDE WEGE -- die Regel anwenden und die veralteten
       Kopien wegraeumen; unterschieden werden sie durch ein Feld im Rumpf.
       Zwei Routen fuer dasselbe Loeschen waeren zwei Stellen, an denen die
       Pfadpruefung stehen muss.
       DER SCHALTER UND DIE BEIDEN WERTE BEKOMMEN AUSDRUECKLICH KEINE ROUTE.
       Sie gehen ueber PUT /api/settings wie jede andere Einstellung; die
       Vorschau ist ein Feld in GET /api/backup und damit lesend. */
    ['POST',   '/api/backup/cleanup',      'ownerOnly, zweitbestaetigt'],
    /* Die Sicherungsprobe, 0.29.0 -- die DREIUNDSIEBZIGSTE. Beim Eigentuemer
       wie die drei Wege darueber: die Antwort nennt Datum und Groesse einer
       Datei auf dem Wirt.
       SIE SCHREIBT NICHTS IN DEN BESTAND und steht trotzdem hier -- wie POST
       /api/token/check, das auch nur liest. Der Grund ist derselbe: sie
       OEFFNET eine Datei und kostet Zeit, und ein GET, das eine Datenbank
       aufmacht, laedt zum Nachladen ein. Der Waechter sieht jedes app.post(
       an; eine Route, die er findet und die Liste nicht kennt, faerbt ihn rot
       -- also gehoert sie hierher, mit dieser Begruendung daneben und nicht
       stillschweigend ausgenommen.
       KEINE ZWEITBESTAETIGUNG: sie liest, sie loescht nicht. Die drei Wege
       darueber holen eine, weil sie Bytes unwiderruflich entfernen.
       UND KEIN DATEINAME IM RUMPF, sondern die NUMMER der Zeile -- Stolperstein
       300 gilt unveraendert. */
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
  /* Die ZAHL selbst, ausdruecklich: 0.8.50 brachte EINE neue schreibende Route
     mit, den Videoweg -- 46 wurden 47. Bleibt die Zahl stehen, hat sich am
     Rechtebild nichts verschoben; waechst sie unbemerkt, faellt genau das
     hier auf.
     0.8.60 bewegt sie NICHT: die Ansicht "Offen" ist lesend, und der Haken
     geht ueber PUT /api/comments/:id, die es laengst gibt. Wer aus dem
     lesenden Endpunkt eine schreibende Route macht, wird hier namentlich
     rot -- nachgestellt statt geglaubt.
     0.8.70 bewegt sie: 47 werden 51. Der Papierkorb bringt zwei schreibende
     Routen mit, die Sicherung zwei; die drei lesenden Endpunkte daneben
     (GET /api/trash, GET /api/items/:id/export, GET /api/backup)
     stehen NICHT hier -- dieselbe Regel wie bei GET /api/stats.
     0.8.80 bewegt sie: 51 werden 56. Der Token bringt drei mit
     (pruefen, einloesen, der Link am Zugang), "Meine Sitzungen" zwei; der
     lesende Endpunkt GET /api/sessions steht NICHT hier -- auch der nicht,
     der VOR der Anmeldung liegt.
     0.8.90 bewegt sie um EINE: 56 werden 57. Dazu kommt allein
     POST /api/confirm -- das Sicherheitsprotokoll ist LESEND
     (GET /api/security-log) und steht deshalb nicht hier, und eine
     Loeschroute darauf gibt es ausdruecklich nicht. Die sechs schweren Wege
     sind vorhandene Routen und bekommen nur einen Zusatz an ihrer Art.
     0.8.91 bewegt sie NICHT: der Schluesselwechsel laeuft auf dem Wirt.
     0.9.0 bewegt sie um ZWEI: 57 werden 59 -- PUT /api/mail und
     POST /api/mail/test. GET /api/mail steht wie immer nicht hier, obwohl es
     einen Waechter traegt. UND ZWEI ROUTEN BEWEGEN SIE AUSDRUECKLICH NICHT,
     obwohl sie in dieser Runde etwas Neues tun: POST /api/users nimmt jetzt
     eine Adresse entgegen und PUT /api/account setzt die eigene -- beide gibt
     es laengst, und ihre Rechtezeile hat sich nicht verschoben. Wer daraus
     neue Routen machte, verschoebe die Rechtefrage, ohne dass es hier
     auffiele.
     0.9.1 bewegt sie um FUENF: 59 werden 64. Zwei stehen VOR der Anmeldung
     (POST /api/signup und POST /api/signup/confirm), drei
     dahinter (PUT /api/signup/toggle, POST /api/requests/:id/approve
     und DELETE /api/requests/:id). GET /api/requests steht wie immer NICHT
     hier, obwohl es einen Waechter traegt. */
  /* 0.11.0 bewegt sie NICHT. Die Volltextsuche laeuft ueber
     GET /api/items?q=... -- dieselbe Route, ein Parameter mehr, und sie ist
     LESEND; dieselbe Regel wie bei GET /api/open und GET /api/stats. Die
     gespeicherten Ansichten gehen ueber PUT /api/settings, das es laengst
     gibt, und ihre Rechtezeile hat sich nicht verschoben: sie sind
     persoenlich wie alles andere unter PERSOENLICHE_SCHLUESSEL. Wer aus dem
     Suchweg eine eigene schreibende Route machte, wird hier namentlich rot. */
  /* 0.19.0 bewegt sie um EINE: 69 werden 70 -- POST /api/images/convert.
     UND DREI DINGE DIESER RUNDE BEWEGEN SIE AUSDRUECKLICH NICHT: der Schalter
     „PNG-Originale beim Hereinkommen umwandeln" geht ueber PUT /api/settings,
     das es laengst gibt; der Fortschritt der Umstellung ist ein Feld in
     GET /api/stats und damit lesend wie eh und je; und der Zoomwert geht
     ueber PUT /api/photos/:id/focus -- dieselbe Route, ein Feld mehr, und
     ihre Rechtezeile hat sich nicht verschoben. Wer aus einem davon eine
     eigene schreibende Route machte, wird hier namentlich rot. */
  /* 0.20.0 bewegt sie um EINE: 70 werden 71 -- POST /api/backup/cleanup.
     UND DREI DINGE DIESER RUNDE BEWEGEN SIE AUSDRUECKLICH NICHT: der Schalter
     und die beiden Werte der Aufraeumregel gehen ueber PUT /api/settings, das
     es laengst gibt; die Vorschau ist ein Feld in GET /api/backup und damit
     lesend wie eh und je; und der Anschluss an die Sicherung ist ein Aufruf am
     Ende von POST /api/backup -- dieselbe Route, ein Aufruf mehr, und ihre
     Rechtezeile hat sich nicht verschoben. Wer aus einem davon eine eigene
     schreibende Route machte, wird hier namentlich rot. */
  /* 0.21.0 bewegt sie um EINE nach UNTEN: 71 werden 70 -- DELETE
     /api/items/:id/ratings faellt weg. Das ist eine WEGNAHME an einer
     oeffentlichen Antwort, vor 1.0.0 erlaubt, und sie steht in Abschnitt 5 des
     Projektstands. UND ZWEI DINGE DIESER RUNDE BEWEGEN SIE AUSDRUECKLICH
     NICHT: die Phase am Kriterium geht ueber POST/PUT /api/criteria, die es
     laengst gibt, und die zweite Kriterienkarte benutzt dieselben vier Wege
     wie die erste. */
  /* 0.24.4 bewegt sie um EINE: 70 werden 71 -- POST /api/tags. Bis 0.24.3
     gab es keinen Weg, einen Tag FUER SICH anzulegen: `/api/tags` kannte GET,
     PUT und DELETE, und angelegt wurde ein Tag nur AM EINTRAG oder beim
     Import. Die Karte „Tags" im Systembereich konnte deshalb umbenennen und
     loeschen, aber nicht anlegen (Befund B7).
     UND DREI DINGE DIESER RUNDE BEWEGEN SIE AUSDRUECKLICH NICHT: das
     Anlegefeld in der Karte „Kategorien" geht ueber POST
     /api/product-categories, das es laengst gibt; Anleger und Anlagedatum im
     Papierkorb sind zwei Felder mehr in GET /api/trash und damit lesend wie
     eh und je; und die drei Vokabeltafeln gehen ueber GET und PUT
     /api/settings, die es beide gibt. Wer aus einem davon eine eigene
     schreibende Route machte, wird hier namentlich rot. */
  /* 0.29.0 bewegt sie um EINE: 72 werden 73 -- POST /api/backup/check. Eine
     Sicherung ohne Probe ist eine Vermutung; bis hierher wusste niemand, ob
     eine BESTIMMTE Datei sich oeffnen laesst, bis jemand sie zurueckspielte.
     UND FUENF DINGE DIESER RUNDE BEWEGEN SIE AUSDRUECKLICH NICHT: die
     achtzehn Einzelwerte des Fingerprints fahren auf GET /api/stats mit; das
     Faelligkeitsdatum geht ueber POST /api/items/:id/comments und PUT
     /api/comments/:id, die es beide gibt; der partielle Index ist gar keine
     Route; die doppelten Adressen sind ein Feld mehr in GET /api/users; und
     die drei Bildschirmbefunde fassen keinen Weg an. Wer aus einem davon eine
     eigene schreibende Route machte, wird hier namentlich rot. */
  check('Und es sind jetzt genau 73 schreibende Routen',
    F_ROUTES.length === 73 && fFound.length === 73,
    `${F_ROUTES.length} erwartet, ${fFound.length} gefunden`);
  /* DIE GESCHLOSSENEN LISTEN AUS auth.js, ausdruecklich mit ihrer ZAHL --
     dieselbe Bauform wie F_ROUTES und aus demselben Grund (Stolperstein 137):
     eine Zahl in einem Papier ist eine Behauptung, eine Zahl im Pruefstand
     ist ein Beleg. VORGAENGE waechst mit 0.9.1 von fuenfzehn auf siebzehn
     (anfrage.frei und anfrage.ab); MERKMALE bleibt bei dreizehn, denn keiner
     der beiden traegt eines. CONFIRM_PURPOSES steht seit 0.19.0 bei acht. */
  /* GELESEN WIRD DIE LAUFENDE LISTE, NICHT DER QUELLTEXT DANEBEN: ein Waechter
     ueber den Quelltext faerbt sich am Warnschild statt an der Sache
     (Stolperstein 106). auth.js oeffnet beim Laden die Datenbank und laeuft
     deshalb in einem eigenen Prozess mit eigenem Verzeichnis. */
  const fAuthDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-listen-'));
  const fAuth = JSON.parse(shortRun(
    `const a = require('./auth');` +
    `console.log(JSON.stringify({ EVENTS: a.EVENTS, DETAILS: a.DETAILS,` +
    ` CONFIRM_PURPOSES: a.CONFIRM_PURPOSES }));`, fAuthDir));
  fs.rmSync(fAuthDir, { recursive: true, force: true });
  check('Es sind genau einundzwanzig Vorgaenge im Sicherheitsprotokoll',
    fAuth.EVENTS.length === 21, `${fAuth.EVENTS.length}: ${fAuth.EVENTS.join(' ')}`);
  /* DER EINUNDZWANZIGSTE, seit 0.20.0. Er steht NEBEN 'backup' und nicht an
     seiner Stelle: das eine legt eine Kopie an, das andere wirft welche weg.
     UND ER TRAEGT KEIN MERKMAL -- die Zahl der entfernten Kopien ist die
     ZEILENZAHL, weil es fuer sie keine Spalte gibt. MERKMALE bleibt bei
     vierzehn, und die Verneinung steht hier neben der Zahl darueber und nicht
     an ihrer Stelle (Stolperstein 156). */
  check('Und der einundzwanzigste heisst sicherung.weg',
    fAuth.EVENTS.includes('backup.delete'), fAuth.EVENTS.join(' '));
  check('Und die beiden aus 0.9.1 heissen anfrage.frei und anfrage.ab',
    fAuth.EVENTS.includes('request.approve') && fAuth.EVENTS.includes('request.reject'),
    fAuth.EVENTS.join(' '));
  /* DIE DREI AUS 0.10.0. Der dritte ist der, auf den es ankommt: er sagt, dass
     ein Wiederherstellungscode verbraucht wurde -- die einzige Zeile im ganzen
     Protokoll, die auf ein verlorenes Telefon zeigt. */
  check('Und die drei aus 0.10.0 heissen zweifaktor.an, .aus und .wieder',
    ['twofactor.on', 'twofactor.off', 'twofactor.reset']
      .every(v => fAuth.EVENTS.includes(v)),
    fAuth.EVENTS.join(' '));
  /* UND KEIN VIERTER FUER DEN FALSCHEN CODE: eine gescheiterte zweite Stufe
     IST eine gescheiterte Anmeldung und schreibt 'login.fail'. Die
     Verneinung steht neben der Zahl darueber und nicht an ihrer Stelle --
     zwei Zeilen sagen zusammen, was eine allein nicht sagen kann
     (Stolperstein 156). */
  check('Und es gibt keinen eigenen Vorgang fuer einen falschen Code',
    !fAuth.EVENTS.some(v => /^twofactor\.(fehl|falsch)/.test(v)),
    fAuth.EVENTS.filter(v => v.startsWith('twofactor')).join(' '));
  /* VIERZEHN SEIT 0.13.0, VORHER DREIZEHN. 'part' kommt dazu, und zwar als
     Nachlese zu einem Befund: 0.12.4 schrieb "teil 1/5" in die Spalte, das ist
     kein Wert aus dieser Liste, und protokolliere() verwarf damit die GANZE
     Zeile -- ein Teilexport stand im Protokoll nirgends. Die Liste hat
     gehalten, was sie zusagt; falsch war die Aufrufstelle.
     OHNE NUMMER: die Nummer des Teils waere Freitext, und den gibt es in
     dieser Spalte ausdruecklich nicht. Sie steht im Dateinamen. */
  check('Es sind jetzt vierzehn Merkmale', fAuth.DETAILS.length === 14,
    `${fAuth.DETAILS.length}: ${fAuth.DETAILS.join(' ')}`);
  check('Und das vierzehnte heisst "teil" und traegt keine Nummer',
    fAuth.DETAILS.includes('part') && !fAuth.DETAILS.some(m => /\d/.test(m)),
    fAuth.DETAILS.join(' '));
  /* ACHT SEIT 0.19.0, vorher sieben. Der achte heisst 'images' und war bis
     0.20.0 der einzige der Liste, der BYTES UEBERSCHREIBT statt Rechte oder
     Zugaenge zu verschieben -- und der einzige ohne Rueckweg: es gibt keinen
     Papierkorb fuer Bildbytes.
     NEUN SEIT 0.20.0. Der neunte heisst 'backup' und geht eine Stufe
     weiter: er entfernt GANZE DATEIEN vom Dateisystem des Wirts. Auch fuer
     sie gibt es keinen Papierkorb -- die Vorschau in der Karte ist der
     Ersatz. */
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
    // Eine Route kann BEIDES verlangen. Ein else-if-Zweig
    // hoerte bei 'nurAdmin, im Rumpf' nach dem Waechter
    // auf und saehe die Klemme nie an -- eine Pruefung, die im
    // entscheidenden Fall gar nicht scheitern kann.
    const wantsWatcher = kind.startsWith('nur') ? kind.split(',')[0] : null;
    const wantsGuard = kind.includes('im Rumpf');
    if (wantsWatcher && !r.head.includes(wantsWatcher)) fWithoutWatcher.push(r.key);
    if (wantsGuard && !hasGuard) fWithoutGuard.push(r.key);
    /* 'selbstbezug' HEISST: DER BENUTZER KOMMT AUS req.user UND NIE AUS
       DER ADRESSE. Bis 0.8.71 gab es genau eine solche Route, und die Pruefung
       nannte deshalb ihren Aufruf beim Namen. Seit 0.8.80 sind es drei --
       "Meine Sitzungen" kommt dazu --, und die gemeinsame Regel ist die
       Herkunft der Nummer, nicht der Name der Funktion.
       BEIDE HAELFTEN GEHOEREN DAZU: req.user.id MUSS dastehen, und die
       Nummer darf NICHT aus req.params kommen. Ohne die zweite Haelfte bliebe
       eine Route gruen, die beides tut und am Ende die fremde Nummer nimmt.
       req.params.sessionId ist ausgenommen -- das ist die Kennung der Sitzung,
       nicht die des Benutzers, und sie wird gegen die EIGENEN Zeilen
       aufgeloest. */
    if (kind === 'selbstbezug' &&
        (!r.core.includes('req.user.id') ||
         /req\.params\.(?!sessionId)/.test(r.core))) fWithoutSelf.push(r.key);
    /* Die Bestaetigung steht ABSICHTLICH NICHT in CORE_WORDS: sie ist keine
       Rechtefrage. Stuende sie dort, erfuellte sie die Klemme, die 'im Rumpf'
       verlangt -- und eine Route, die ihre Rollenklemme verloren und nur noch
       das Passwort fragt, bliebe gruen. */
    const hasSecond = r.head.includes(SECOND_WORD) || r.core.includes(SECOND_WORD);
    if (kind.includes('zweitbestaetigt') && !hasSecond) fWithoutSecond.push(r.key);
    if (!kind.includes('zweitbestaetigt') && hasSecond) fTooManySecond.push(r.key);
    if (kind === 'offen' && hasGuard) fTooMany.push(r.key);
    /* Und die andere Haelfte derselben Gegenrichtung: eine Route, die "offen"
       heisst, darf auch keinen benannten Waechter in der Routenzeile tragen.
       Aufgefallen bei einer Gegenprobe zu 0.8.30 -- der Rueckbau setzte
       nurEintragVerfasser vor POST /api/items/:id/links zurueck, und der
       Waechter ueber den Quelltext blieb vollstaendig gruen: er sah nur in den
       RUMPF. Acht Verhaltenspruefungen fanden es, aber die eine Pruefung, die
       eine falsche ENTSCHEIDUNG finden soll, sah nichts. */
    if (kind === 'offen' && GUARD_WORDS.some(w => r.head.includes(w)))
      fTooManyGuard.push(r.key);
  }
  check('Jede Route mit benanntem Waechter traegt ihn in der Routenzeile',
    fWithoutWatcher.length === 0, fWithoutWatcher.join(' · '));
  check('Jede Route mit zwei Rechteklassen hat die Klemme im Rumpf',
    fWithoutGuard.length === 0, fWithoutGuard.join(' · '));
  check('Jede Route mit Selbstbezug nimmt den Benutzer aus der Sitzung',
    fWithoutSelf.length === 0, fWithoutSelf.join(' · '));
  /* DIE NEUE ART AUS 0.8.90, in BEIDE Richtungen. Ohne die zweite Haelfte
     bliebe eine Route gruen, die die Bestaetigung stillschweigend eingebaut
     hat -- und eine stillschweigend eingebaute Klemme ist von einer
     entschiedenen nicht zu unterscheiden. */
  check('Jede zweitbestaetigte Route ruft die Bestaetigung wirklich',
    fWithoutSecond.length === 0, fWithoutSecond.join(' · '));
  check('Und keine andere tut es stillschweigend',
    fTooManySecond.length === 0, fTooManySecond.join(' · '));
  /* Und die Gegenprobe zur Pruefung selbst: sie darf nicht deshalb gruen sein,
     weil sie beides durchgehen laesst (Stolperstein 106). Beide Haelften
     einzeln, denn eine Regel mit zwei Haelften, von der nur eine wirkt, sieht
     von aussen aus wie eine ganze. */
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
  // Die Gegenrichtung: wo "offen" steht, darf auch nichts stehen. Sonst waere
  // eine stillschweigend eingebaute Klemme von einer entschiedenen nicht zu
  // unterscheiden.
  check('Und wo offen steht, steht auch keine Klemme',
    fTooMany.length === 0, fTooMany.join(' · '));
  check('Und erst recht kein Waechter in der Routenzeile',
    fTooManyGuard.length === 0, fTooManyGuard.join(' · '));

  /* WELCHE Klemme im Rumpf steht, sagt F_ROUTES nicht -- die Liste kennt nur
     die Art 'im Rumpf'. eintragFrei( und darfAendern( stehen beide in
     CORE_WORDS, und genau zwischen diesen beiden liegt die Wende von
     0.8.30: gefragt wird nicht mehr nach dem EINTRAG, sondern nach der ZEILE.
     Ohne diese Pruefung bliebe ein Rueckbau auf eintragFrei vollstaendig
     gruen -- der Prueflauf saehe eine Klemme und waere zufrieden.
     Dieselbe Bauform wie beim Kommentarbild darunter, und aus demselben
     Grund: erst das Vorhandensein des Rumpfes, dann die Eigenschaft
     (Stolperstein 81). */
  const fLinkPathRoute = fFound.find(r => r.key === 'DELETE /api/links/:id');
  const fLinkPathCore = fLinkPathRoute ? fLinkPathRoute.core : '';
  check('Die Loeschroute fuer Links ist ueberhaupt da',
    fLinkPathCore.length > 0, 'die Route fehlt im Quelltext');
  check('Sie fragt nach der ZEILE, nicht nach dem Eintrag',
    fLinkPathCore.includes('mayChange(req, l.user_id)') &&
    !fLinkPathCore.includes('entryFree('),
    fLinkPathCore ? 'mayChange(req, l.user_id) fehlt oder entryFree steht noch da' : '(kein Rumpf)');
  /* Und die Gegenrichtung am Eintragen: der Waechter ist dort gefallen, die
     Zeile bekommt stattdessen ihren Verfasser. Ein POST ohne user_id liefe
     stumm in eine herrenlose Zeile -- das Auffangnetz schoebe sie beim
     naechsten Start dem Eigentuemer zu, und niemand saehe es. */
  const fLinkFreshRoute = fFound.find(r => r.key === 'POST /api/items/:id/links');
  const fLinkFreshCore = fLinkFreshRoute ? fLinkFreshRoute.core : '';
  check('Die Anlegeroute fuer Links ist ueberhaupt da',
    fLinkFreshCore.length > 0, 'die Route fehlt im Quelltext');
  check('Sie schreibt den Verfasser in die neue Zeile',
    fLinkFreshCore.includes('INSERT INTO links (item_id, url, sort_order, user_id)') &&
    fLinkFreshCore.includes('req.user.id'),
    fLinkFreshCore ? 'die Spalte user_id fehlt im INSERT' : '(kein Rumpf)');

  /* Dasselbe am sechsten Traeger. Die Bauform ist die von 0.8.30, und der
     Grund ist unveraendert: F_ROUTES kennt nur die Art 'im Rumpf' und
     unterscheidet eintragFrei( nicht von darfAendern(. */
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

  /* DIE BESCHRIFTUNG DES EINGRIFFSVERMERKS HAENGT AN DIESER KLEMME.
     "2 Bilder vom Admin entfernt" nennt eine ROLLE, und die steht in keiner
     Spalte: sie folgt daraus, dass DELETE /api/comment-images/:id hinter
     darfAendern steht -- Verfasser ODER Admin -- und der Vermerk nur
     hochgezaehlt wird, wenn ein ANDERER als der Verfasser entfernt. Wer beide
     Klemmen passiert, kann nur der Admin sein.
     Faellt eine der beiden Zeilen, wird der Satz auf dem Bildschirm falsch.
     Er steht in einer anderen Datei; ohne diese Pruefung faende das niemand,
     und keine Verhaltenspruefung koennte es zeigen -- denn ein Server ohne
     Klemme antwortet nicht falsch, er laesst nur den Falschen durch.
     Erst das VORHANDENSEIN des Rumpfes, dann die Eigenschaft: ein Rumpf, den
     es nicht gibt, ist ein leerer String, und jede Verneinung darauf
     waere wahr (Stolperstein 81). */
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
  /* DER SATZ STEHT SEIT 0.24.0 IN DER SPRACHDATEI. Gesucht wird in beidem --
     Datei und Quelltext --, damit der Waechter waehrend des Umzugs in jedem
     Zwischenstand dieselbe Frage stellt (Stolperstein 201). */
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

  /* Den vorhandenen Waechter erweitern,
     die Regel nicht ein zweites Mal hinschreiben: steht die Adminfrage
     irgendwann zweimal da, laufen die beiden Stellen auseinander und keine
     Gegenprobe belegt mehr etwas. */
  const fAdminQuestions = fSource.split("role === 'admin'").length - 1;
  check('Die Adminfrage steht genau einmal im Quelltext',
    fAdminQuestions === 1, `${fAdminQuestions} Vorkommen`);
  const fSmallestQuestions = fSource.split("role === 'owner'").length - 1;
  check('Und die Eigentuemerfrage ebenfalls',
    fSmallestQuestions === 1, `${fSmallestQuestions} Vorkommen`);
  // Der Eigentuemer ist keine kleinste Nummer, sondern eine
  // Rolle. Bliebe irgendwo ein MIN(id) stehen, gaebe es zwei Antworten auf
  // dieselbe Frage -- und die eine erwischte nach einer Loeschung einen
  // Grabstein. In db.js steht sie weiterhin, dort aber als eigentuemerId().
  const fMinIdImServer = fSource.split('MIN(id)').length - 1;
  check('Und der Server fragt nirgends mehr nach der kleinsten Nummer',
    fMinIdImServer === 0, `${fMinIdImServer} Vorkommen`);
  // "Leitung" ist ein frueherer Name des Admins. Ein Wort, zwei Bedeutungen
  // -- der Waechter haelt fest, dass es in Server, Oberflaeche und Anmeldung
  // nirgends auftaucht.
  const fLine = ['server.js', 'auth.js', 'db.js', 'public/app.js', 'public/index.html']
    .filter(d => fs.readFileSync(path.join(__dirname, d), 'utf8').includes('Leitung'));
  check('Das Wort Leitung kommt nirgends mehr vor', fLine.length === 0, fLine.join(' · '));

  /* DIE SPANNE DES GEWICHTS STEHT AN GENAU EINER STELLE. Zwei Schreibwege
     fuehren darauf -- die Verwaltung und der Import; stuende sie an beiden,
     liefen sie irgendwann auseinander. Dieselbe Bauform wie bei der
     Adminfrage darueber: den vorhandenen Waechter erweitern, die Regel nicht
     ein zweites Mal hinschreiben. */
  for (const [word, wo] of [['WEIGHT_MIN = ', 'die Untergrenze'], ['WEIGHT_MAX = ', 'die Obergrenze']]) {
    const n = fSource.split(word).length - 1;
    check(`${wo[0].toUpperCase()}${wo.slice(1)} des Gewichts steht genau einmal im Quelltext`,
      n === 1, `${n} Vorkommen`);
  }
  const fValidDef = fSource.split('function validWeight').length - 1;
  check('Und es gibt genau eine Pruefung darauf', fValidDef === 1, `${fValidDef} Vorkommen`);
  /* DIE OBERFLAECHE KENNT DIE SPANNE NICHT. Stuende sie auch in app.js, waere
     sie die zweite Stelle -- und die, die es nicht meldet, wenn sie
     auseinanderlaufen. Das Feld schickt, was getippt wurde; der Server sagt,
     ob es geht. */
  check('Die Oberflaeche traegt die Spanne nicht ein zweites Mal',
    !/GEWICHT_(MIN|MAX)/.test(fAppSource),
    (fAppSource.match(/.*GEWICHT_(MIN|MAX).*/) || [''])[0]);
  /* DER NENNER DARF NIE UEBER ALLE KRITERIEN GEHEN. Der naheliegende Griff --
     eine Summe ueber die ganze Tabelle -- drueckt einen Eintrag unter 1 und
     braeche damit die Zusicherung dieser Runde. Er soll gar nicht erst
     unbemerkt hereinkommen.
     ANGESEHEN WIRD NUR CODE, NICHT DER KOMMENTAR DANEBEN: an genau dieser
     Stelle in server.js steht der falsche Griff ausgeschrieben, damit ihn der
     Naechste nicht fuer einen guten haelt. Ein Waechter ueber den ganzen Text
     faerbte sich am Warnschild statt an der Sache -- derselbe Fehlgriff, an
     dem in dieser Runde schon eine Pruefung auf den DDL-Text gescheitert ist. */
  const fCodeRows = fSource.split('\n')
    .filter(z => { const t = z.trim(); return t && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*'); })
    .join('\n');
  check('Nirgends wird ueber ALLE Gewichte summiert',
    !/SUM\(\s*\w*\.?weight\s*\)/i.test(fCodeRows),
    (fCodeRows.match(/.*SUM\(\s*\w*\.?weight\s*\).*/i) || [''])[0]);
  /* Und die Gegenprobe zum Waechter selbst: er darf nicht deshalb gruen sein,
     weil er gar nichts mehr ansieht. Der Code muss die Wortfolge, auf die er
     zielt, ueberhaupt tragen koennen -- hier belegt an der Abfrage, die das
     Gewicht mitbringt. */
  check('Und der Waechter sieht wirklich Code an',
    /JOIN rating_criteria c ON c\.id = r\.criterion_id/.test(fCodeRows),
    'der Waechter liest keinen Code mehr');

  /* DER AUSGELIEFERTE TYP KOMMT NIE AUS DER DATENBANK.
     Dagegen hilft kein Merksatz, sondern ein Waechter: server.js setzt den
     Content-Type ueberhaupt nicht mehr selbst. Wer eine Auslieferung ergaenzt
     -- ein Video ab 0.8.50 --, wird hier namentlich rot und muss sich fuer
     einen der beiden Wege in attachments.js entscheiden: Typ nach Endung
     (setHeader) oder Typ nach den ersten Bytes (setImageHeader).
     Gezaehlt wird woertlich, ohne zusammengesetztes Muster. */
  const TYPE_WORDS = ["res.set('Content-Type'", 'res.set("Content-Type"',
                      "res.setHeader('Content-Type'", 'res.type('];
  const typeCount = (text) => TYPE_WORDS
    .map(z => [z, text.split(z).length - 1]).filter(([, n]) => n > 0);
  const fTypeSelf = typeCount(fSource);
  check('server.js setzt den Content-Type an keiner Stelle selbst',
    fTypeSelf.length === 0, fTypeSelf.map(([z, n]) => `${z} (${n}x)`).join(' · '));
  /* DIE GEGENPROBE ZUM WAECHTER SELBST. Ohne sie bliebe er auch dann gruen,
     wenn er gar nichts mehr sieht -- und genau das ist der Fall, den 0.8.50
     erwartet hat: wer den Videoweg baut und dabei den Typ selbst setzt, soll
     namentlich rot werden. Vorgefuehrt an einem Text, der die Verletzung
     traegt, statt an einer zurueckgebauten Datei. */
  check('Und er wuerde eine ergaenzte Auslieferung wirklich finden',
    typeCount("app.get('/x', (req, res) => { res.set('Content-Type', 'video/mp4'); });").length === 1,
    'der Waechter sieht die Verletzung nicht');
  const fAttachmentsSource = fs.readFileSync(path.join(__dirname, 'attachments.js'), 'utf8');
  // Erst das Vorhandensein, dann die Eigenschaft (Stolperstein 81): ohne die
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
     Uebrige wird 500 mit festem Text. Der Rumpf wird hier nur daraufhin
     angesehen, DASS beide Wege da sind -- was sie bewirken, prueft die Gruppe
     "Fehler nach Rang" am laufenden Server. */
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
     Zusicherung dreht sich mit um (Stolperstein 201): der Handler darf bei 500
     nichts VERRATEN, und das tut ein Schluessel noch weniger als ein fester
     Satz. Gehalten wird beides: er sagt genau einen Satz, und er sagt ihn
     ueber t(). */
  check('Und er liefert die Meldung eines Serverfehlers nicht aus',
    /res\.status\(500\)\.json\(\{ error: t\(locale, 'server\.error'\) \}\)/.test(fErrorCore)
      && !/res\.status\(500\)[^\n]*err\.(message|stack)/.test(fErrorCore),
    fErrorCore ? 'kein Schluessel bei 500' : '(kein Rumpf)');

  /* SAUBERES HERUNTERFAHREN. Sechs Zeilen, und die Sicherung des
     Datenverzeichnisses wird verlaesslich -- geprueft wird hier, dass beide
     Zeichen behandelt werden und die WAL wirklich abgeschlossen wird. */
  check('SIGTERM und SIGINT werden behandelt',
    fSource.includes("['SIGTERM', 'SIGINT']"), 'kein Handler fuer die Abbruchzeichen');
  check('Und dabei wird die WAL abgeschlossen',
    fSource.includes("wal_checkpoint(TRUNCATE)") && fSource.includes('db.close()'),
    'kein wal_checkpoint oder kein db.close');


  /* --- 0.8.70: EINE ABBILDUNG JE EINTRAG, NICHT ZWEI ----------------------
     Bis 0.8.60 stand sie mitten in der Exportroute. Jetzt rufen sie drei
     Stellen -- der volle Export, der Einzelexport und der Papierkorb --, und
     genau deshalb steht dieser Waechter hier: zwei Rechenwege fuer dieselbe
     Datei laufen auseinander, und die Runde, die das Wiederherstellen baut,
     haette den Fehler eingebaut, den sie verhindern soll.
     Gezaehlt werden MARKEN, die es nur in der Abbildung gibt -- die
     Funktionszeile allein saehe eine kopierte Feldliste daneben nicht. */
  const IMAGE_MARKS = ['function entryAsBundle(', 'favorite: pins.has(',
                         'author: authorName(it.user_id)'];
  const imageCount = (text) => IMAGE_MARKS.map(m => [m, text.split(m).length - 1]);
  const fImage = imageCount(fCodeRows);
  check('Die Abbildung je Eintrag kommt genau einmal im Quelltext vor',
    fImage.every(([, n]) => n === 1), fImage.map(([m, n]) => `${m} (${n}x)`).join(' · '));
  /* DIE GEGENPROBE ZUM WAECHTER SELBST: er darf nicht deshalb gruen sein, weil
     er gar nichts mehr ansieht (Stolperstein 106). Vorgefuehrt an einem Text,
     der die Verletzung traegt -- eine zweite, kopierte Feldliste. */
  check('Und er wuerde eine zweite Abbildung wirklich finden',
    imageCount(fCodeRows + '\nconst o = { favorite: pins.has(it.id) };')
      .some(([, n]) => n === 2),
    'der Waechter sieht die zweite Abbildung nicht');
  const fImageCalls = fCodeRows.split('entryAsBundle(').length - 1;
  check('Sie wird an drei Stellen gerufen: Export, Einzelexport, Papierkorb',
    fImageCalls === 4, `${fImageCalls} Vorkommen samt Deklaration`);

  /* Dasselbe in der Gegenrichtung. Das Wiederherstellen geht durch den
     IMPORT -- ein zweiter, frisch geschriebener Deserialisierer waere derselbe
     Fehler, nur spiegelverkehrt. */
  const IMPORT_MARKS = ['function importInto(', 'const itemAuthor = authorId(it.author)'];
  const fImportMarks = IMPORT_MARKS.map(m => [m, fCodeRows.split(m).length - 1]);
  check('Und der Deserialisierer ebenfalls genau einmal',
    fImportMarks.every(([, n]) => n === 1), fImportMarks.map(([m, n]) => `${m} (${n}x)`).join(' · '));
  const fImportCalls = fCodeRows.split('importInto(').length - 1;
  check('Er wird an zwei Stellen gerufen: Import und Wiederherstellen',
    fImportCalls === 3, `${fImportCalls} Vorkommen samt Deklaration`);

  /* DIE FORMATNUMMER STEHT AN GENAU EINER STELLE. Zwei Umschlaege -- der volle
     Export und der Einzelexport -- gehen durch dieselbe Funktion; stuende die
     Zahl an beiden, liefen sie auseinander. */
  const fFormatDef = fCodeRows.split('EXCHANGE_FORMAT = ').length - 1;
  check('Die Formatnummer steht genau einmal im Quelltext', fFormatDef === 1,
    `${fFormatDef} Vorkommen`);
  check('Und nirgends noch einmal als nackte Zahl',
    !/version:\s*\d/.test(fCodeRows),
    (fCodeRows.match(/.*version:\s*\d.*/) || [''])[0]);

  /* --- 0.8.70: DER PAPIERKORB FASST KEINE BESTEHENDE ABFRAGE AN -----------
     Die tragende Regel der Runde. Kein Zustand `deleted` an items, kein
     WHERE-Zusatz irgendwo -- ein gelöschter Eintrag ist wirklich weg und liegt
     nur zusaetzlich noch als Paket daneben. Wer das aufweicht, beruehrt jede
     Abfrage im ganzen System, und jede vergessene Stelle waere ein stiller
     Fehler.
     ANGESEHEN WIRD NUR CODE (Stolperstein 106): der Kommentar an der Tabelle
     in db.js nennt die Regel ausdruecklich und darf das auch. */
  const DATATABLES = ['items', 'photos', 'comments', 'ratings', 'test_days',
                            'links', 'attachments', 'comment_images', 'item_tags',
                            'test_day_tags', 'item_pins'];
  const inventoryQueries = (text) => text.split('\n')
    .filter(z => DATATABLES.some(t =>
      z.includes(`FROM ${t}`) || z.includes(`INTO ${t}`) || z.includes(`UPDATE ${t} `)));
  const tainted = (rows) => rows.filter(z => /trash|deleted/i.test(z));
  const fInventoryRows = inventoryQueries(fCodeRows);
  // Erst das Vorhandensein, dann die Eigenschaft (Stolperstein 81): ohne
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

  /* KEIN BLOCK FUER EINE TABELLE. Die Probe aus der Gruppe "Der Papierkorb:
     die Tabelle legt sich selbst an" hat es hergegeben: CREATE TABLE IF NOT
     EXISTS legt eine fehlende TABELLE bei jedem Start an -- eine SPALTE
     dagegen nicht, und nur dafuer gab es Migrationsbloecke.

     UND SEIT 0.33.0 GIBT ES KEINEN EINZIGEN MEHR. Die Zeile hiess bis 0.32.1
     „Es gibt genau zwoelf Migrationsfunktionen"; sie ist UMGEDREHT und nicht
     geloescht (Leitplanke L1, Frage F3). Wer einen neuen Block anlegt, wird
     hier namentlich rot -- und muss sagen, warum das Haus nach dem Bruch
     wieder einen braucht.

     GEZAEHLT WIRD UEBER BEIDE MARKENFORMEN, und DAS ist der eigentliche Grund,
     warum diese Zeile ueberhaupt umgebaut wurde. Bis 0.32.1 zaehlte sie nur
     die einzeilige Form

         // MIGRATION 0.21.0 — ENTFAELLT MIT 1.0

     und fand damit zwoelf. Es waren ACHTZEHN: die sechs Bloecke der
     Sprachrunde 0.24.x trugen ihre Absage im BLOCKKOMMENTAR, auf einer eigenen
     Zeile darunter. Der Fahrplan hat die falsche Zahl uebernommen, und keiner
     der beiden hat es gemerkt -- Stolperstein 156 in Reinform, nur dass diesmal
     der ZAEHLER der Betroffene war. Die Form, die sie uebersah, ist deshalb
     jetzt mitgezaehlt. */
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
  /* UND KEINE MARKE OHNE BLOCK. Eine Ankuendigung auf eine Fassung, die den
     Block gar nicht mehr erreicht, ist der zweite Ort fuer dieselbe Aussage
     (Stolperstein 47) -- und hier ist der zweite Ort der Quelltext selbst. */
  check('Und keine Marke „ENTFAELLT MIT 1.0", hinter der nichts mehr liegt',
    fMarkNumbers.length === 0, fMarkNumbers.join(' · ') || 'keine');
  /* UND DER ZAEHLER FAENGT BEIDE FORMEN WIRKLICH. Ohne diese Zeile waeren die
     beiden darueber auch dann gruen, wenn das Muster gar nichts traefe -- sie
     pruefen ja Abwesenheit (Stolperstein 81). Gefragt wird an gestellten
     Marken und nicht an der Datei: genau die zwei Schreibweisen, die bis
     0.32.1 in db.js nebeneinander standen. */
  const fMarkShapes = (text) => (text.match(
    /MIGRATION [0-9.]+x?\s*—[^\n]*\n?\s*(?:\*|\/\/)?\s*ENTFAELLT MIT 1\.0/g) || []).length;
  check('Und der Zaehler faengt BEIDE Markenformen — gestellt und nachgemessen',
    fMarkShapes('// MIGRATION 0.21.0 — ENTFAELLT MIT 1.0\n') === 1 &&
    fMarkShapes('/* ====== MIGRATION 0.24.1 — DIE NAMEN DES BESTANDS =====\n' +
                '   ENTFAELLT MIT 1.0.\n') === 1 &&
    fMarkShapes('// hier steht nichts dergleichen\n') === 0,
    `${fMarkShapes('// MIGRATION 0.21.0 — ENTFAELLT MIT 1.0\n')} / ` +
    `${fMarkShapes('/* ====== MIGRATION 0.24.1 — X =====\n   ENTFAELLT MIT 1.0.\n')}`);
  /* UND DER FUNKTIONSZAEHLER FAENGT AUCH EINEN NAMEN MIT GEGENSTAND. Der
     zehnte Block hiess `migration0250Language`; ein Muster ueber reine
     Zahlennamen faende ihn nicht, und die Abwesenheitsprobe bliebe gruen,
     obwohl ein Block dastuende. */
  const fFunctionShapes = (text) =>
    (text.match(/function (migration\w+)\s*\(/g) || []).length;
  check('Und der Funktionszaehler faengt auch einen Namen mit Gegenstand',
    fFunctionShapes('function migration0290() {') === 1 &&
    fFunctionShapes('function migration0250Language() {') === 1 &&
    fFunctionShapes('function renumberCriteria() {') === 0,
    `${fFunctionShapes('function migration0250Language() {')}`);
  /* UND DIE SPALTEN, DIE SIE NACHGERUESTET HABEN, STEHEN WEITER IN DER DDL.
     Das ist die Zusage, die den Wegfall ueberhaupt erst traegt: eine frische
     Instanz bekommt sie aus dem Schema. Gefahren wird sie in der Gruppe „Der
     Hinweis auf einen unvollstaendigen Bestand"; hier steht der Quelltext. */
  check('Und die nachgeruesteten Spalten stehen weiter in der DDL',
    /due_date TEXT/.test(fDbSource) && /zoom REAL NOT NULL DEFAULT 100/.test(fDbSource) &&
    /rejected_reason TEXT/.test(fDbSource) && /weight REAL NOT NULL DEFAULT 1/.test(fDbSource),
    'eine der vier fehlt im Schema');
  /* UND db.exec(SCHEMA) STEHT ALS ERSTE ANWEISUNG NACH DER GRUNDAUSSTATTUNG --
     Zusage 2. Bis 0.32.1 lagen sechs Bloecke DAVOR, weil
     `CREATE TABLE IF NOT EXISTS` eine vorhandene Tabelle nicht anfasst und
     `ALTER TABLE ... RENAME TO` sonst an einem Namen gescheitert waere, den es
     schon gibt. DIE GRENZE IST NICHT VERSCHOBEN, SIE IST FORT. */
  check('db.exec(SCHEMA) steht unmittelbar hinter der Faltung der Suche',
    /db\.function\('kkl'[^\n]*\);\s*\n+db\.exec\(SCHEMA\);/.test(fDbSource),
    (fDbSource.match(/db\.function\('kkl'[^\n]*\);[\s\S]{0,200}/) || [''])[0].slice(0, 200));
  /* UND db.js LIEST DAS NAMENSWOERTERBUCH NICHT MEHR -- Frage F9. Es bleibt
     als DATEI (der Import lebt davon und der Pruefstand liest es selbst), aber
     die Datenbank hat mit ihm nichts mehr zu tun. */
  /* GELESEN WIRD CODE UND NICHT DER KOMMENTAR DANEBEN: die Probe in db.js
     ERKLAERT in ihrem Kopf, warum sie ihre Tafel selbst traegt und nicht aus
     jener Datei liest -- ein Satz darueber, was weggefallen ist, ist keine
     zweite Wahrheit, sondern das Gegenteil davon (Stolperstein 201). */
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
  /* UND deleted_by GEHOERT AUSDRUECKLICH NICHT INS AUFFANGNETZ. Es ist die
     Feststellung eines Vorgangs, nicht die Zugehoerigkeit von Bestand -- daran
     haengt kein Recht und kein Filter. Waere die Tabelle dort eingetragen,
     schoebe der naechste Start jeden Loeschenden still dem Eigentuemer zu und
     machte aus einer Feststellung eine Falschaussage. */
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

  /* DIE FRIST STEHT IM SERVER, NICHT IN DER OBERFLAECHE. Die Karte und der
     Loeschdialog nennen sie beide -- gerechnet wird sie an einer Stelle, und
     die Oberflaeche bekommt sie ueber die Antwort. */
  const fDeadlineDef = fCodeRows.split('TRASH_DAYS = ').length - 1;
  check('Die Frist steht genau einmal im Server', fDeadlineDef === 1, `${fDeadlineDef} Vorkommen`);
  check('Die Oberflaeche rechnet die verbleibenden Tage nicht selbst nach',
    !/tageOffen\s*=/.test(fAppSource),
    (fAppSource.match(/.*tageOffen\s*=.*/) || [''])[0]);

  /* 0.8.70: DIE SICHERUNG SCHREIBT UNTER EINEM ARBEITSNAMEN. Der Fehlerweg
     darf ausschliesslich diesen entfernen -- ein Aufraeumen, das die
     endgueltige Datei trifft, wuerfe im Zweifel die Sicherung des Nachbarn
     weg. Gelesen wird der Rumpf der Route, nicht die ganze Datei. */
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
     weil er gar nichts mehr ansieht (Stolperstein 106). */
  check('Und der Waechter wuerde ein Aufraeumen an der Zieldatei finden',
    /fs\.unlinkSync\(datei\)/.test('    try { fs.unlinkSync(datei); } catch {}'),
    'der Waechter sieht die Verletzung nicht');

  /* DER COOKIENAME KOMMT AUS auth.COOKIE_NAME UND WIRD NIRGENDS ABGESCHRIEBEN.
     Seit 0.8.20 haengt er an BEHIND_PROXY: ohne Proxy heisst er
     kriterion_session, mit Proxy traegt er das Praefix __Host-. Wer ihn
     irgendwo als festen String hinschreibt, baut eine Stelle, die bei
     umgelegter Einstellung still den falschen Cookie liest -- und still
     heisst hier: die Anmeldung geht verloren, ohne dass irgendwo etwas rot
     wird. auth.js selbst ist der EINE Ort, an dem er entsteht; dort steht er
     zwangslaeufig.
     GEPRUEFT WIRD CODE, NICHT DER KOMMENTAR DANEBEN (Stolperstein 106) --
     sonst faerbte sich der Waechter an der Erklaerung, warum der Name nicht
     dastehen darf. testbench.js steht ausdruecklich NICHT auf der Liste: der
     Pruefstand ist keine ausgelieferte Datei, laeuft immer ohne Proxy und
     schickt den Cookie von Hand. */
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
  /* ERST DAS VORHANDENSEIN (Stolperstein 81): ein Waechter, der auf null
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
     weil er gar keinen Code mehr liest (Stolperstein 106). */
  check('Und der Waechter wuerde ein abgeschriebenes Vorkommen finden',
    cookieCount("const c = req.cookies['kriterion_session'];") === 1,
    'der Waechter sieht den Namen nicht');
  check('Den Namen im Kommentar laesst er dagegen in Ruhe',
    cookieCount('// Der Cookie heisst kriterion_session, wenn kein Proxy davorsteht.') === 0,
    'der Waechter faerbt sich am Kommentar');

  /* TOKEN ODER LINK -- eines von beiden am Bildschirm, und durchgehalten.
     Entschieden ist: "Token" im Quelltext des Servers, denn dort ist es der
     Fachbegriff und wird nicht zwanghaft eingedeutscht; "Link" am Bildschirm,
     denn dort ist ein Token nichts, was jemand in der Hand haelt -- ein Link
     schon. public/app.js IST der Bildschirm; deshalb sieht dieser Waechter
     genau diese eine Datei an und nicht mehr.
     GROSSGESCHRIEBEN GESUCHT, dieselbe Trennlinie wie beim Backup-Waechter:
     gemeint ist das deutsche SUBSTANTIV. Der Bezeichner `token` ist Code. */
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

  /* SICHERUNG ODER BACKUP -- eines von beiden, und durchgehalten. Beide Woerter
     sind gebraeuchlich; zwei fuer dieselbe Sache sind genau das, was die
     Sprachregel aus Abschnitt 12 verhindern soll. Entschieden ist SICHERUNG:
     der Einspielweg, der Stufenplan und das Ideenpapier sagen es laengst so.
     Der Waechter sieht die ausgelieferten Dateien an -- Code UND Kommentare,
     denn das Wort steht in Meldungen und in Beschriftungen. */
  const BACKUP_FILES = ['server.js', 'db.js', 'auth.js', 'attachments.js', 'keys.js',
                             'public/app.js', 'public/index.html', 'usertool.js'];
  /* GROSSGESCHRIEBEN GESUCHT, und das ist keine Nachlaessigkeit: gemeint ist
     das deutsche SUBSTANTIV. `db.backup()` ist ein Bezeichner und die Message
     "backup is not supported ..." ein Zitat aus SQLite -- beides ist Code und
     keine Sprache, dieselbe Trennlinie wie beim Sprachwaechter, der Backticks
     ueberspringt.
     UND SEIT 0.33.0 FAELLT DAS CONTAINERPROTOKOLL AUS DER FRAGE -- Strang 4.
     Es spricht seit jener Runde ENGLISCH, und dort ist „Backup" nicht das
     deutsche Substantiv, sondern schlicht das richtige Wort; am Satzanfang
     steht es gross. DIE REGEL SELBST BLEIBT UNANGETASTET: sie gilt der
     Sprache, die ein BENUTZER liest, und die heisst weiter „Sicherung".
     GESCHNITTEN WIRD DER GANZE RUF mit gezaehlten Klammern und nicht bis zum
     Zeilenende -- dieselbe Bauform wie bei der Restprobe fuer server.js, und
     aus demselben Grund: eine Meldung kann ueber drei Zeilen gehen. */
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
  /* UND DER SCHNITT SCHNEIDET WIRKLICH NUR DEN RUF. Ein Waechter, dessen
     Schnitt zu viel wegnaehme, liesse jedes „Backup" durch und meldete
     trotzdem nichts (Stolperstein 106). Gefragt wird an einem gestellten
     Fall, der beides in EINER Zeile traegt. */
  check('Und der Schnitt nimmt nur den Konsolenruf, nicht die Zeile daneben',
    backupCount("console.log('Backup written'); // Das gehoert ins Backup.") === 1,
    'der Schnitt nimmt zu viel oder zu wenig weg');

  /* SICHERHEITSPROTOKOLL ODER PROTOKOLL -- eines von beiden, und durchgehalten.
     "Protokoll" IST IM PROJEKT VERGEBEN: so heisst docker compose logs, im
     Einspielweg, in Abschnitt 8 des Projektstands und in der README ("Nach
     jedem Einspielen lohnt ein Blick ins Protokoll"). Zwei verschiedene Dinge
     unter demselben Wort sind Stolperstein 47 in der Sprache.
     ENTSCHIEDEN IST: das neue Ding heisst am Bildschirm wie im Quelltext
     SICHERHEITSPROTOKOLL und wird nie abgekuerzt. Der Waechter zaehlt deshalb
     das ALLEINSTEHENDE Wort in den ausgelieferten Dateien und haelt die ZAHL
     fest -- dieselbe Bauform wie die Zahl in F_ROUTES. Wer das neue Ding je
     "Protokoll" nennt, bewegt sie und wird namentlich rot.
     GEPRUEFT WIRD CODE, NICHT DER KOMMENTAR DANEBEN (Stolperstein 106).
     GROSSGESCHRIEBEN GESUCHT, dieselbe Trennlinie wie beim Backup-Waechter:
     gemeint ist das deutsche SUBSTANTIV, nicht der Bezeichner
     raeumeProtokollAuf. */
  /* UND DIE SPRACHDATEI SEIT 0.24.0. Sie liegt unter public/ und wird
     ausgeliefert; seit dieser Runde steht der Bildschirmtext DORT, und ein
     Waechter ueber Bildschirmtexte, der sie nicht ansieht, sieht die halbe
     Anwendung nicht (Auftrag 0.24.0, Bauabschnitt 5.1). */
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
  /* EIN VORKOMMEN SEIT 0.22.0, und es meint den Containerlog: die Message nach
     einer gescheiterten Sicherung in server.js. Der zweite stand bis 0.21.1
     in der Kennzahlenkarte („im Protokoll … pruefen") und heisst seither am
     Bildschirm „Server-Log" (Woerterbuch, Konzept 4.3): „Protokoll" bleibt
     allein dem Sicherheitsprotokoll. UMGEDREHT, NICHT GELOESCHT (Stolperstein
     74) -- die Zahl steht weiter ausdruecklich. */
  check('Das alleinstehende Wort steht in genau einer ausgelieferten Zeile — 0.22.0',
    fProt.reduce((n, [, k]) => n + k, 0) === 1, fProt.map(([d, n]) => `${d} (${n}x)`).join(' · '));
  /* SEIT 0.24.0 STEHT SIE IN DER SPRACHDATEI und nicht mehr in server.js --
     der Satz ist derselbe, nur wohnt er jetzt dort, wo Text wohnt. */
  check('Und sie meint den Containerlog, in der Sprachdatei',
    equal(fProt.map(([d]) => d), ['public/languages/de.json']), JSON.stringify(fProt));
  /* DER SATZ WOHNT SEIT 0.24.0 IN DER SPRACHDATEI. Gesucht wird in beidem --
     Quelltext und Datei --, damit der Waechter in jedem Zwischenstand des
     Umzugs dieselbe Frage stellt (Stolperstein 201). */
  const protAppAndTexts =
    fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8') + '\u0000' +
    Object.values(JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8')))
      .flatMap(v => (typeof v === 'string' ? [v] : Object.values(v))).join('\u0000');
  /* UND DIE ZEILE, DIE SIE ZITIERT, STEHT SO IM PROTOKOLL -- 0.32.0, Punkt 28
     Fund 1. Bis 0.31.4 schrieb die Karte „Schlüssel aus ENCRYPTION_KEY
     geladen" mit Umlaut, `keys.js` schrieb „Schluessel" ohne -- wer die Zeile
     so sucht, wie sie dastand, fand sie nicht. Gesucht wird deshalb der
     WORTLAUT DES PROTOKOLLS und nicht der schoenere.
     UND SEIT 0.33.0 IST DIESER WORTLAUT ENGLISCH: „Key loaded from
     ENCRYPTION_KEY". Das Containerprotokoll spricht seit jener Runde englisch
     (Strang 4), und die Karte zitiert weiter, was WIRKLICH DASTEHT -- in allen
     drei Sprachdateien derselbe Wortlaut, denn zitiert wird eine Zeile und
     nicht ein Satz. Genau dafuer gibt es diese Pruefung: sie ist beim
     Uebersetzen des Protokolls rot geworden. */
  check('Die Kennzahlenkarte sagt dafuer „Server-Log"',
    /im Server-Log „Key loaded from ENCRYPTION_KEY/.test(protAppAndTexts),
    'die Karte nennt das Server-Log nicht');
  check('Und sie zitiert die Zeile Zeichen fuer Zeichen, wie keys.js sie schreibt',
    fs.readFileSync(path.join(__dirname, 'keys.js'), 'utf8')
      .includes('Key loaded from ENCRYPTION_KEY'),
    'keys.js schreibt die Zeile anders');
  /* UND ALLE DREI SPRACHDATEIEN ZITIEREN DIESELBE ZEILE. Ein Zitat, das in
     einer Datei mitwandert und in den beiden anderen stehen bleibt, schickt
     zwei von drei Lesern auf die Suche nach einem Satz, den es nicht gibt. */
  const protQuoted = ['de', 'en', 'tr'].filter(code => !JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'))['card.restartHint']
      .includes('Key loaded from ENCRYPTION_KEY'));
  check('Und alle drei Sprachdateien zitieren dieselbe Zeile',
    protQuoted.length === 0, protQuoted.join(' · ') || 'alle drei');
  /* DIE GEGENPROBE ZUM WAECHTER SELBST: er darf nicht deshalb gruen sein, weil
     er gar keinen Code mehr liest (Stolperstein 106) -- und er darf das lange
     Wort nicht mitzaehlen, sonst waere die Entscheidung wertlos. */
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
  /* DIE UEBERSCHRIFT KOMMT SEIT 0.24.0 AUS DER SPRACHDATEI. Der Waechter loest
     den Schluessel auf und fragt weiter dasselbe: traegt eine Kartenueberschrift
     das Wort? Ein Schluessel, den die Datei nicht kennt, bleibt stehen und
     faellt damit auf. */
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

  /* RE-AUTHENTIFIZIERUNG IST DAS WORT DER PAPIERE, NICHT DES BILDSCHIRMS.
     Dieselbe Entscheidung wie "Token oder Link" in 0.8.80, nur mit einem
     Wort statt zweien: im Quelltext heisst es zweiteBestaetigung, am
     Bildschirm "Zweite Bestätigung" -- ein Wort fuer beides kann gar nicht
     auseinanderlaufen. Der Fachbegriff bleibt draussen: er sagt einem
     Entwickler etwas und niemandem sonst. */
  const reAuthCount = (text) => (text.match(/Re-?Authenti/gi) || []).length;
  const fReAuth = PROT_FILES
    .map(d => [d, reAuthCount(fs.readFileSync(path.join(__dirname, d), 'utf8'))])
    .filter(([, n]) => n > 0);
  check('Das Wort Re-Authentifizierung steht in keiner ausgelieferten Datei',
    fReAuth.length === 0, fReAuth.map(([d, n]) => `${d} (${n}x)`).join(' · '));
  check('Und der Waechter wuerde es wirklich finden',
    reAuthCount('// Die Re-Authentifizierung greift hier.') === 1,
    'der Waechter sieht das Wort nicht');
  /* DER SATZ STEHT SEIT 0.24.0 IN DER SPRACHDATEI und nicht mehr im
     Quelltext -- gesucht wird er dort, mitgezogen und nicht geloescht
     (Stolperstein 201). */
  check('Dafuer steht das gewaehlte Wort am Bildschirm',
    JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'))
      ['dialog.confirm'] === 'Bestätigen',
    'der Dialog nennt die Bestaetigung nicht beim Namen');

  /* DAS PASSWORT REIST IM RUMPF -- UND DARF NIRGENDS AUSGEGEBEN WERDEN. Im
     Rumpf eines POST steht es nicht im Zugriffsprotokoll eines Proxys, der
     die Anfragezeile schreibt; die Instanz selbst fuehrt gar keines. Was
     bleibt, ist die eine Gefahr, gegen die ein Waechter hilft: eine Zeile, die
     den Rumpf ins Containerprotokoll schreibt. */
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
     eingedeutscht. Der Massstab ist das Wort, das ein deutschsprachiger
     Entwickler im Gespraech benutzen wuerde -- Cookie statt `Keks`,
     Migration statt `Umstieg`.

     DIE LISTE IST KURZ ZU HALTEN. Ein Waechter, der jedes zweite Wort
     anmeckert, wird abgeschaltet; hier stehen deshalb nur die Uebersetzungen,
     die 0.8.60 abgeraeumt hat, und keine Geschmacksfragen.
     GEZAEHLT SIND ES VIERZEHN ZEILEN FUER ZWOELF WOERTER -- `Doppelgaenger`
     und `Rueckschritt` stehen je zweimal da, einmal mit Umlaut und einmal
     ohne, weil beide Schreibweisen im Quelltext vorkommen koennen.

     ER ZIELT AUF UEBERSETZTE LEHNWOERTER, NICHT AUF DIE EIGENEN BILDER DES
     PROJEKTS. "Stolperstein", "Gegenprobe", "Pruefstand", "Waechter" und
     "Klemme" sind keine Uebersetzungen von irgendetwas Englischem -- sie
     bleiben und stehen ausdruecklich nicht in dieser Liste.

     ER IST DIE AUSNAHME VON DER REGEL AUS STOLPERSTEIN 106: jeder andere
     Waechter ueber den Quelltext filtert die Kommentarzeilen weg, dieser
     sieht sie ausdruecklich an -- die Sprache steht ja gerade dort. Umgekehrt
     laesst er CODE in Ruhe: einen Bezeichner faengt er nicht, denn er liest
     nur Kommentare -- und was in Backticks steht, ist zitierter Code und
     keine Sprache. Beides bekommt unten seine eigene Gegenprobe. */
  const LANGUAGELIST = [
    ['Keks', 'Cookie'], ['Umstieg', 'Migration'], ['Abbild', 'Image'],
    ['Sperrdatei', 'Lockfile'], ['Doppelgänger', 'Mock'], ['Doppelgaenger', 'Mock'],
    ['mehrteilig', 'Multipart'], ['Zweigname', 'Branchname'],
    ['Rückschritt', 'Downgrade'], ['Rueckschritt', 'Downgrade'],
    ['Ereignisschleife', 'Event Loop'], ['Zeichenkette', 'String'],
    ['Abdruck', 'Fingerprint'],
    /* SEIT 0.19.1. `Faden` ist in dieser Runde tatsaechlich gefallen -- bei der
       Zahl der Threads, die sich sharp nehmen darf --, und 0.19.2
       („Bestandslaeufe verlassen den Anfrageweg") wird voll davon sein. Ein
       deutschsprachiger Entwickler sagt im Gespraech Thread.
       DAS ZITIERTE WORT STEHT IN BACKTICKS, sonst faenge der Waechter seine
       eigene Vorschrift -- er liest Kommentare und laesst zitierten Code in
       Ruhe. */
    ['Faden', 'Thread']
  ];
  /* ZWEI AUSNAHMEN, UND BEIDE WAEREN SONST FALSCHE TREFFER. Sie stehen hier
     und nicht in der Wortliste, wo sie wie weitere Verbote aussaehen; jede
     bekommt unten ihre eigene Gegenprobe.
       `Abbild` darf `Abbildung` NICHT treffen -- eine Abbildung ist eine
         Zuordnung und hat mit einem Image nichts zu tun.
       `Faden` darf nur am WORTANFANG treffen -- „Pfaden" traegt die
         Buchstabenfolge mitten drin, und der Dativ Plural von Pfad kommt im
         Quelltext und in den Papieren viermal vor. Ein Waechter, der jedes
         zweite Wort anmeckert, wird abgeschaltet.
     `Fadenzahl` faellt trotzdem auf: dort steht das Wort am Anfang. */
  const LANGUAGE_EXCEPTION = { Abbild: 'Abbild(?!ung)', Faden: '\\bFaden' };
  const LANGUAGEPATTERN = new RegExp(
    '(' + LANGUAGELIST.map(([w]) => LANGUAGE_EXCEPTION[w] || w).join('|') + ')', 'i');

  /* Aus einer Quelltextdatei bleiben die KOMMENTARZEILEN uebrig, aus einer
     Doku-Datei die PROSA -- Code in Zaeunen und in Backticks faellt dort
     ebenso weg. Ein Waechter ueber die Sprache liest Sprache; ein zitierter
     Bezeichner aus einem aelteren Papier ist keine Prosa und wird nicht
     umbenannt, nur weil er zitiert wird. */
  /* Beide filtern ZEILENWEISE und lassen die Zeilenzahl unangetastet -- was
     nicht zaehlt, wird leer statt weggeworfen. Sonst naennte der Waechter
     Zeilennummern, die es in der Datei gar nicht gibt, und der Befund waere
     nicht auffindbar. */
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
     Kommentaren, die der Waechter nicht saehe, stuende sie nicht hier.
     UND images.js UND batchrun.js SEIT 0.19.3, aus demselben Grund. Beide
     tragen lange deutsche Kommentare; ohne diese Zeile stuenden sie ausserhalb
     jeder Sprachpruefung -- und der erste Lauf hat es bewiesen: in
     batchrun.js stand `Ereignisschleife`, und der Waechter sah es nicht.
     DAS ZITIERTE WORT STEHT IN BACKTICKS, sonst faenge der Waechter seine
     eigene Begruendung -- er liest Kommentare und laesst zitierten Code in
     Ruhe. */
  /* UND mail.js SEIT 0.33.1, aus demselben Grund wie images.js und
     batchrun.js darueber: die Datei traegt 181 deutsche Kommentarzeilen und
     stand ausserhalb jeder Sprachpruefung. Aufgefallen ist sie nicht durch
     ein abgelegtes Wort, sondern ueber den Anbieternamen im Protokoll -- beim
     Nachsehen, welche Waechter die Datei ueberhaupt ansehen, war die Antwort
     „dieser nicht". Beim Aufnehmen war sie sauber: null Treffer. */
  const LANGUAGE_SOURCES = ['server.js', 'db.js', 'auth.js', 'attachments.js', 'keys.js',
                          'usertool.js', 'keytool.js', 'twofactor.js', 'testbench.js',
                          'counterproof.js', 'public/app.js',
                          'images.js', 'batchrun.js', 'mail.js'];
  /* UND DIE MODULE DES PRUEFSTANDS DAZU -- 0.34.0. Die Liste oben nennt
     vierzehn Dateien und ist damit festgenagelt; die Module sind seit dem
     Umzug dazugekommen und werden ueber pruefstandDateien() gelesen. Ohne sie
     blieben nach dem Umzug 20 000 Kommentarzeilen ausserhalb jeder
     Sprachpruefung -- genau der Fall, der bei mail.js in 0.33.1 aufgefallen
     ist. testbench.js faellt heraus: es steht schon in der Liste oben. */
  const LANGUAGE_MODULES = pruefstandDateien().filter(n => n !== 'testbench.js');
  const languageSource = [...LANGUAGE_SOURCES, ...LANGUAGE_MODULES].flatMap(n => {
    const p = path.join(__dirname, n);
    return fs.existsSync(p)
      ? languageHit(onlyComments(fs.readFileSync(p, 'utf8')), n) : [];
  });
  const languageDocsFiles = (fs.existsSync(path.join(__dirname, 'Doku'))
    ? fs.readdirSync(path.join(__dirname, 'Doku')).filter(n => n.endsWith('.md')) : [])
    // Der Auftrag der laufenden Runde bleibt aussen vor: er FUEHRT die Wortliste
    // und nennt jedes dieser Woerter als Beispiel. Ein Waechter, der ihn
    // anmeckert, meckert seine eigene Vorschrift an.
    .filter(n => !/^Auftrag_/.test(n))
    .map(n => path.join('Doku', n))
    /* CHANGELOG.md STEHT SEIT 0.10.0 IM WURZELVERZEICHNIS und war damit aus
       dem Blick dieses Waechters gefallen -- als `Doku/Changelog.md` lag sie
       vorher in der Sammlung oben. Sie ist deutsche Prosa fuer den Betreiber
       und gehoert unter dieselbe Regel wie die README daneben. */
    .concat(['README.md', 'CHANGELOG.md']);
  const languageDocs = languageDocsFiles.flatMap(n => {
    const p = path.join(__dirname, n);
    return fs.existsSync(p) ? languageHit(onlyProse(fs.readFileSync(p, 'utf8')), n) : [];
  });

  /* ERST DAS VORHANDENSEIN DES GEGENSTANDS (Stolperstein 81): ein Waechter,
     der auf null Dateien laeuft, ist grün und belegt nichts. */
  /* DIE ZAHL AUSDRUECKLICH, nicht nur "alle, die dastehen": eine gekuerzte
     Liste bliebe sonst gruen, und der Waechter saehe ohne jeden Hinweis nur
     noch die halbe Anwendung an. Genau das ist beim Bauen dieser Gruppe an
     einer Gegenprobe aufgefallen -- der Rueckbau auf eine einzige Datei blieb
     stumm. Dieselbe Ueberlegung wie bei der Zahl in F_ROUTES. */
  check('Der Sprachwaechter sieht alle vierzehn Quelltextdateien an',
    LANGUAGE_SOURCES.length === 14 &&
    LANGUAGE_SOURCES.every(n => fs.existsSync(path.join(__dirname, n))),
    `${LANGUAGE_SOURCES.length} Dateien, fehlend: ` +
    JSON.stringify(LANGUAGE_SOURCES.filter(n => !fs.existsSync(path.join(__dirname, n)))));
  /* Und der Beleg, dass der Filter ueberhaupt etwas uebrig laesst: einer, der
     alles wegwirft, machte jede Verneinung darauf wahr (Stolperstein 81).
     Gezaehlt wird ueber alle acht zusammen -- `keys.js` traegt nur drei
     Kommentarzeilen, eine Schwelle je Datei waere dort eine Zufallszahl. */
  const languageCommentRows = LANGUAGE_SOURCES.reduce((n, d) =>
    n + onlyComments(fs.readFileSync(path.join(__dirname, d), 'utf8'))
      .split('\n').filter(z => z.trim()).length, 0);
  check('Und aus ihnen bleiben mehr als tausend Kommentarzeilen uebrig',
    languageCommentRows > 1000, `${languageCommentRows} Zeilen`);
  check('Und mindestens zehn Dokumente daneben',
    languageDocsFiles.length >= 10, `${languageDocsFiles.length} Dokumente`);
  /* UND DIE BEIDEN IM WURZELVERZEICHNIS SIND NAMENTLICH DABEI. Die Zahl oben
     allein saehe nicht, wenn ausgerechnet eine von ihnen herausfiele -- und
     genau das ist mit CHANGELOG.md beim Umzug aus `Doku/` passiert. */
  check('Darunter namentlich README.md und CHANGELOG.md',
    languageDocsFiles.includes('README.md') && languageDocsFiles.includes('CHANGELOG.md'),
    languageDocsFiles.filter(n => !n.startsWith('Doku')).join(' '));
  check('Die Kommentare des Quelltextes benutzen die heutigen Fachwoerter',
    languageSource.length === 0, languageSource.slice(0, 12).join(' · '));
  check('Die Dokumente ebenso',
    languageDocs.length === 0, languageDocs.slice(0, 12).join(' · '));

  /* ACHT GEGENPROBEN AN GESTELLTEN TEXTEN, damit der Waechter nicht bei
     der guten Absicht bleibt. Sie laufen an Strings und nicht am
     Arbeitsbaum -- ein Waechter, der erst auf einem zurueckgebauten Stand
     etwas faende, waere selbst nie geprueft. */
  check('Er liest ueberhaupt noch etwas: ein Kommentar mit „Keks" faellt auf',
    languageHit(onlyComments('// Der Keks traegt Secure.\nconst a = 1;'), 'x').length === 1,
    JSON.stringify(languageHit(onlyComments('// Der Keks traegt Secure.'), 'x')));
  check('Und ein Fliesskommentar mit „Umstieg" ebenso',
    languageHit(onlyComments('/* Der Umstieg\n   laeuft einmal. */'), 'x').length === 1);
  /* DIE UMGEKEHRTE GEGENPROBE, und sie ist die eigentliche Ausnahme dieses
     Waechters: CODE meckert er NICHT an. Ein Bezeichner ist keine Sprache,
     und ein Waechter, der ihn faengt, faengt bei der naechsten Runde auch
     jeden String in einer Prueflage. */
  check('Aber Code laesst er in Ruhe -- ein Bezeichner ist keine Sprache',
    languageHit(onlyComments("const keksWert = 'abc';\nlet Umstieg = 1;"), 'x').length === 0,
    JSON.stringify(languageHit(onlyComments("const keksWert = 'abc';"), 'x')));
  check('Auch in einem Kommentar bleibt der zitierte Bezeichner unberuehrt',
    languageHit(onlyComments('// Der Wert steht in `keksWert` und heisst so.'), 'x').length === 0,
    JSON.stringify(languageHit(onlyComments('// Der Wert steht in `keksWert`.'), 'x')));
  /* Und die Ausnahme, die eine echte Falle waere: „Abbildung" ist eine
     Zuordnung, kein Image. Erst der Treffer, dann die Ausnahme -- ohne die
     erste Zeile bliebe die zweite auch dann gruen, wenn der Waechter das Wort
     gar nicht mehr kennte (Stolperstein 81). */
  check('„Abbild" faengt er -- das ist das Image',
    languageHit(onlyComments('// Das Abbild wird gebaut.'), 'x').length === 1);
  check('Aber „Abbildung" laesst er stehen -- das ist eine Zuordnung',
    languageHit(onlyComments('// Die Abbildung je Eintrag steht einmal.'), 'x').length === 0,
    JSON.stringify(languageHit(onlyComments('// Die Abbildung je Eintrag.'), 'x')));
  /* Dieselbe Ordnung fuer die zweite Ausnahme, seit 0.19.1: erst der Treffer,
     dann die Ausnahme -- ohne die erste Zeile bliebe die zweite auch dann
     gruen, wenn der Waechter das Wort gar nicht mehr kennte
     (Stolperstein 81). */
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
  /* UND DIE ZAHL AUSDRUECKLICH, nicht nur die Obergrenze: vierzehn Zeilen fuer
     zwoelf Woerter. Ein Eintrag, der still herausfaellt, bliebe unter der
     Obergrenze und niemandem auffallen -- dieselbe Ueberlegung wie bei
     F_ROUTES. */
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
     gestrichen". Wer Kriterion zum ersten Mal sieht, kennt keine dieser
     Fassungen; fuer ihn ist jede davon eine Auskunft ueber nichts. Ein
     Handbuch sagt, WAS IST -- nicht, seit wann (Projektstand 5.6).
     DIE REGEL IST NICHT „KEINE NUMMER", SONDERN: die Nummer bleibt, wo sie
     eine HANDLUNG bestimmt, und geht, wo sie nur erzaehlt.

     MIT 0.33.0 SIND ES ANDERE NUMMERN GEWORDEN, und das ist die Regel bei der
     Arbeit: die beiden Nummern von 0.17.2 bestimmten eine Handlung, SOLANGE es
     Migrationsbloecke gab. `0.14.0` trug die Sicherungspflicht beim Sprung
     ueber jene Datenbankstufe, `0.8.30` stand als woertliche Protokollzeile
     daneben — **beide Handlungen gibt es nicht mehr**, und was bliebe, waere
     Erzaehlung. Sie sind deshalb aus der README gefallen und nicht bloss
     umgeschrieben worden.
     DREI FAELLE BESTIMMEN HEUTE EINE HANDLUNG, und sie stehen hier namentlich:
       0.33.0  der Bruch -- wer von einer aelteren Fassung kommt, hat einen
               Zwischenschritt zu tun
       0.32.1  genau dieser Zwischenschritt: die letzte Fassung, die den Weg
               herauf noch kannte. Sie steht zweimal da -- am Einspielweg und
               an der abgewiesenen Exportdatei, und beide Male IST sie die
               Handlung
       0.8.0   die aelteste Datenbank, die noch uebernommen wird
     GEZAEHLT WIRD DIE ZAHL UND NICHT NUR DIE MENGE DER NUMMERN. Eine Menge
     bliebe auch dann gruen, wenn jemand zwanzig neue „seit 0.14.0" ergaenzte
     -- dieselbe Ueberlegung wie bei der Zahl in F_ROUTES. */
  const readmeRaw = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  const readmeNumbers = readmeRaw.match(/\b0\.\d+\.\d+\b/g) || [];
  const README_NUMBERS = ['0.33.0', '0.32.1', '0.8.0'];
  check('Die README nennt ueberhaupt noch die Nummern, die eine Handlung bestimmen',
    README_NUMBERS.every(v => readmeNumbers.includes(v)),
    JSON.stringify(README_NUMBERS.filter(v => !readmeNumbers.includes(v))));
  check('Und keine andere Nummer steht mehr darin',
    readmeNumbers.every(v => README_NUMBERS.includes(v)),
    [...new Set(readmeNumbers.filter(v => !README_NUMBERS.includes(v)))].join(' · '));
  check('Es sind genau sechs Nennungen und keine mehr',
    readmeNumbers.length === 6, `${readmeNumbers.length}: ${readmeNumbers.join(' ')}`);
  /* UND JEDE EINZELNE STEHT DA, WEIL SIE ETWAS BESTIMMT. Die Zahl allein
     saehe nicht, wenn jemand den Zwischenschritt gegen sechs neue
     Erzaehlsaetze taeuschte. */
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
    /in eine Fassung bis 0\.32\.1 ein und exportiert sie dort neu/.test(readmeRaw),
    'der Weg fuer die Datei fehlt');
  /* UND KEINE PROTOKOLLZEILE EINER MIGRATION STEHT MEHR ALS ZITAT DA. Bis
     0.32.1 standen zwei davon in der README, als Beispiel dafuer, wie so eine
     Zeile aussieht -- sie beschreiben einen Vorgang, den es nicht mehr gibt.
     DIE ZEILE IST UMGEDREHT und nicht geloescht (Zusage 12). */
  check('Und keine Protokollzeile einer Migration steht mehr als Zitat da',
    !/Migration auf 0\.\d+\.\d+\)/.test(readmeRaw),
    (readmeRaw.match(/[^\n]*Migration auf 0\.\d+\.\d+\)[^\n]*/) || ['(keine — richtig)'])[0]);
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
     Bestand, und eine solche Zusage haelt nur, wenn sie GEZAEHLT wird. Die
     sechs hier lesen dieselbe Liste wie der Migrationsblock in `db.js` --
     `tools/dictionary.json` und nur die. Zwei Listen ueber dieselbe Sache
     duerfen sich nicht widersprechen (Auftrag, Bauabschnitt 6).

     WAS SIE NICHT TUN: sie weisen nichts ab. Sie ZAEHLEN, und jede Ausnahme
     steht NAMENTLICH da. Eine Ausnahme, die niemand zaehlt, wird zur
     Auslegung; eine, die einen Namen hat, bleibt eine Entscheidung. */
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

    /* ---- 1. Die Namensprobe ---------------------------------------------
       KEIN BEZEICHNER DES AUSGELIEFERTEN CODES TRAEGT EIN DEUTSCHES
       WORTSTUECK -- ausser den hier benannten. Gelesen wird nur CODE: was in
       einem Text oder einem Kommentar steht, ist keine Benennung. */
    const identifiers = new Set();
    for (const f of SHIPPED)
      for (const part of zerlege(readShipped(f), f))
        if (part.kind === CODE)
          for (const m of part.wert.matchAll(/[A-Za-z_$][A-Za-z0-9_$]*/g)) identifiers.add(m[0]);
    check('Der Waechter sieht wirklich den ganzen ausgelieferten Code',
      identifiers.size > 2000 && SHIPPED.length === 13, `${identifiers.size} Bezeichner aus ${SHIPPED.length} Dateien`);

    /* FALSCHE FREUNDE. Das Woerterbuch kennt sie als deutsche Woerter, und
       an diesen Stellen sind sie englisch: eine `note` ist ein Vermerk und
       keine Note, `liesIn` ist „liegt darin" und kein Lesebefehl, und
       `MAILTEST_KEY` traegt den englischen Namen des Mailtests. */
    const FALSE_FRIENDS = ['MAILTEST_KEY', 'cleanNote', 'liesIn', 'note', 'noteFailure', 'noteSuccess'];
    /* WAS AUF STUFE 2 WARTET. Es sind keine BENENNUNGEN, sondern GRENZEN:
       Schluessel der Sprachdatei und ihre Platzhalter, die Namen des
       Vokabulars, gespeicherte Werte (Bloecke, Filter, Sortierungen) und die
       Felder, deren Satz erst mit `en.json` umzieht. Sie ziehen mit ihrer
       Sache um und nicht vor ihr. */
    /* HIER STAND BIS 0.24.2 `WAITING_FOR_STAGE_TWO` MIT 104 NAMEN -- die
       Grenzen, die 0.24.1 liegen liess, weil sie an einem WERT der
       Sprachdatei, an einer gespeicherten Form oder an einer Adresse hingen.
       SIE IST MIT 0.24.3 GEFALLEN, ganz und nicht in Teilen: Frage F7 ist vom
       Betreiber am 7. September 2026 gegen den Vorschlag entschieden worden --
       ALLES zieht mit, auch was in der Datenbank steht.
       EINE AUSNAHME, DIE NIEMAND MEHR BRAUCHT, IST EINE KARTEILEICHE, und der
       Waechter sagt es: die Zeile „jeder benannte steht wirklich im Code"
       weiter unten wuerde jeden uebriggebliebenen Namen melden. */
    /* DIE ALTEN NAMEN DES BESTANDS STANDEN HIER VON 0.24.2 BIS 0.32.1: sechs
       Feldnamen, die in 0.24.0 IN einem gespeicherten Wert standen -- `vorlage`
       an den eigenen Suchmaschinen, die vier Felder des Mailzugangs, `marke`
       am Beleg der Testmail. Sie waren keine Benennung jener Fassungen, sondern
       der GEGENSTAND einer Migration: SHAPES_0242 in db.js schrieb sie als
       EIGENSCHAFTSNAMEN, und eine Uebersetzungstafel muss nennen duerfen, was
       sie uebersetzt.
       SIE SIND MIT 0.33.0 GEFALLEN, ohne dass jemand eine Zeile an ihnen
       geaendert haette: die Tafel, die sie nannte, ist mit ihrem Block
       verschwunden. EINE AUSNAHME, DIE NIEMAND MEHR BRAUCHT, IST EINE
       KARTEILEICHE -- und dass hier keine stehen bleibt, sagt die Zeile
       „jeder benannte steht wirklich im Code" weiter unten.
       UND DIE GEGENPROBE DAZU STEHT IN DER GRUPPE „Die gespeicherten Namen der
       0.24er Runde — umgedreht": dort wird nachgesehen, dass SHAPES_0242 und
       STORED_0243 wirklich fort sind. Ohne sie waere dieser Absatz nur eine
       Behauptung ueber eine Liste, die kuerzer geworden ist. */
    const NAMED = [...FALSE_FRIENDS].sort();
    const germanNames = [...identifiers].filter(isGerman).sort();
    check('Namensprobe: kein deutscher Bezeichner ausser den benannten',
      equal(germanNames, NAMED),
      `zu viel: ${germanNames.filter(n => !NAMED.includes(n)).join(' ') || '—'} · fehlt: ${NAMED.filter(n => !germanNames.includes(n)).join(' ') || '—'}`);
    /* DIE ZAHL STEHT AUSDRUECKLICH DA. Ohne sie waere die Liste oben eine
       Selbstbestaetigung: wer einen Namen hinzufuegt, macht sie wieder gruen. */
    /* SECHS SEIT 0.33.0, von 0.24.3 bis 0.32.1 zwoelf, davor 116. Die 104
       Grenzen sind mit 0.24.3 gefallen (F7), die sechs alten Feldnamen mit dem
       Bruch; was bleibt, sind die sechs falschen Freunde -- englische Woerter,
       die das Woerterbuch als deutsche kennt. DIE ZAHL STEHT AUSDRUECKLICH DA:
       ohne sie waere die Liste oben eine Selbstbestaetigung. */
    check('Und es sind genau sechs — die falschen Freunde und sonst nichts',
      germanNames.length === 6 && FALSE_FRIENDS.length === 6,
      `${germanNames.length} deutsch, ${FALSE_FRIENDS.length} falsche Freunde`);
    /* UND DIE SECHS ALTEN FELDNAMEN STEHEN IN KEINER ZEILE CODE MEHR -- auch
       nicht in db.js, das bis 0.32.1 die einzige erlaubte Stelle war. Ohne
       diese Zeile bliebe der Wegfall der Ausnahme eine Buchung ohne Deckung:
       die Liste waere kuerzer, und die Namen staenden weiter da. */
    const OLD_STORED_NAMES = ['absender', 'anbieter', 'benutzer', 'marke', 'passwort', 'vorlage'];
    const oldElsewhere = [];
    for (const f of SHIPPED) {
      const code = zerlege(readShipped(f), f).filter(p => p.kind === CODE)
        .map(p => p.wert).join('\n');
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
       KEIN SCHLUESSEL DER SPRACHDATEI TRAEGT EIN DEUTSCHES WORTSTUECK.
       Die Mehrzahlformen `eins`/`andere` und die Namen des Vokabulars sind
       INHALT und keine Benennung -- sie ziehen mit Stufe 2 um. */
    const LANGUAGE_FILE = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'public', 'languages', 'de.json'), 'utf8'));
    const languageKeys = [];
    for (const [k, v] of Object.entries(LANGUAGE_FILE)) {
      languageKeys.push(k);
      if (v && typeof v === 'object') for (const x of Object.keys(v)) languageKeys.push(k + '.' + x);
    }
    const germanKeys = languageKeys.filter(k => k.split('.').some(isGerman));
    /* SIE SIND SEIT 0.24.3 ENGLISCH (F7) und werden deshalb nicht mehr aus den
       DEUTSCHEN Schluesseln gefiltert, sondern aus allen: `one`/`other` statt
       `eins`/`andere`, `entryOne` statt `sacheEinzahl`. Gezaehlt werden sie
       weiter -- eine Zahl, die unveraendert bleiben soll, muss dastehen. */
    const pluralKeys = languageKeys.filter(k => /\.(one|other)$/.test(k));
    const vocabularyKeys = languageKeys.filter(k => k.startsWith('vocabulary.'));
    /* Drei falsche Freunde: `Note` heisst hier Vermerk, `standard` ist das
       englische Wort und steht so am Bildschirm. */
    /* VIER SEIT 0.31.1, VORHER FUENF: `card.heWill` ist gefallen. Sein Wert
       war „Er wird" -- ein Bruchstueck, das mit BA 2 in
       `card.shownOnceHint` aufgegangen ist. Der Name sah deutsch aus und war
       es nicht („he will"), aber gebraucht wird er ohnehin nicht mehr. */
    const KEY_FALSE_FRIENDS = ['card.keepAtLeastNote', 'card.orderAppliesNote',
      'card.standard', 'list.saveViewNote'];
    check('Schluesselprobe: deutsch sind nur noch die benannten vier',
      equal(germanKeys.sort(), KEY_FALSE_FRIENDS), germanKeys.join(' '));
    /* 1272 WURDEN 1277 -- 0.24.4. Sechs Saetze sind dazugekommen (die beiden
       festen deutschen Woerter aus B5 und die vier der beiden Anlegefelder
       aus B7), einer ist weggefallen (`card.restoreIcon`, B6 A). Die Zahl der
       Mehrzahlformen und der Vokabelnamen bewegt sich nicht.
       ZWEI SAETZE HAT DIE RUNDE ANGELEGT UND WIEDER GENOMMEN: der Anleger im
       Papierkorb stand kurz in zwei Fassungen da. **Der Betreiber hat am
       8. September 2026 entschieden, dass die Zeile beim Loeschdatum bleibt**
       -- damit hatten die beiden keinen Leser mehr, und ein Satz ohne Leser
       ist eine zweite Wahrheit. Sie kommen mit der Detailansicht wieder.
       ZWEI ZAHLEN, UND BEIDE SIND WAHR: die Datei traegt 1209 OBERSTE
       Eintraege; hier gezaehlt wird flach -- jede Mehrzahlform als eigener
       Schluessel NEBEN ihrem Traeger --, und das sind 1209 + 68 = 1277. Der
       Auftrag nennt die oberste Zahl, der Pruefstand nagelt die flache fest;
       wer die beiden verwechselt, sucht eine Stunde nach 68 fehlenden
       Saetzen.
       1277 WURDEN 1278 -- 0.24.5. EIN Satz ist dazugekommen, der Vermerk am
       Rueckfall (`card.nameFallback`, F4): wo fuer die gezeigte Sprache nichts
       eingetragen ist, sagt die Zeile es. Die oberste Zahl steht damit auf
       1210. Die Zahl der Mehrzahlformen und der Vokabelnamen bewegt sich
       nicht -- der Vermerk hat keine Mehrzahl und ist kein Vokabelwort.
       UND 1278 WURDEN 1280 -- 0.24.6. Zwei Saetze: der Vermerk OHNE
       Sprachnamen (`card.nameFallbackNone`, F2) und der Hinweis auf die
       Grundzeile unter der Pillenreihe (`card.namesBaseRow`, F3). Die oberste
       Zahl steht damit auf 1212; Mehrzahlformen und Vokabelnamen bewegen sich
       wieder nicht.
       UND 1280 WURDEN 1300 -- 0.25.0, und diesmal bewegt sich auch die zweite
       Zahl. VIERZEHN Saetze kommen dazu: der Originaltext-Vermerk, das ✕ mit
       Rueckfrage und Meldung, Punkt und Zahl an der Pille, der Kasten fuer die
       unbekannte Erstellungssprache mit Knopf und Meldung, die Ansage nach dem
       Umschalten und die Absage am Originaltext. ZWEI fallen weg --
       `card.nameFallbackNone` („nicht eingetragen": die Lage gibt es nicht
       mehr, es ist der Originaltext) und `card.namesBaseRow` (der Hinweis wird
       mit der Spalte `language` falsch).
       DIE OBERSTE ZAHL STEHT DAMIT AUF 1224 (1212 + 14 - 2), und VIER der
       vierzehn sind Mehrzahlformen: 34 Formen werden 38, flach gezaehlt 68 + 8
       = 76. Flach also 1224 + 76 = 1300.
       UND MIT 0.25.4 AUF 1223 UND 1303: vier Schluessel des zersaegten
       Verneinungssatzes fallen, drei kommen (1224 - 4 + 3 = 1223), und ZWEI
       Saetze werden zu Mehrzahlpaaren -- `card.inDays` und
       `login.linkValidMinutes`. Beide reichten bis dahin einen Zaehlwert, der
       gar nicht zaehlte: die Form waehlt `PLURAL.select(values.n)` und NUR
       ueber `n`; mit `{days}` und `{minutes}` kam immer `select(undefined)`
       heraus, und das ist die MEHRZAHL. „in 1 Tagen" stand deshalb sieben
       Runden lang da. 38 Objekte werden 40, flach 76 + 4 = 80; flach also
       1223 + 80 = 1303.
       UND MIT 0.26.0 AUF 1226 UND 1306. Drei Runden in einer Zeile:
         Befund 3c   `card.setByAdmin` faellt, `card.weightSystemDefault` kommt --
                     eine Umbenennung, die Zahl bleibt.
         Der Modus   VIER kommen dazu: der einleitende Satz, die Beschriftung
                     des Schalters, der Satz an der gedaempften Liste und der
                     Satz an den Admin, der ihn nicht stellen darf.
       1223 + 4 = 1227 -- und flach 1227 + 80 = 1307, denn keiner der vier ist
       ein Mehrzahlpaar.
       UND MIT 0.27.0 AUF 1238 UND 1320. Die Runde macht aus dem Haekchen eine
       Wahl mit drei Verfahren, und das kostet Saetze:
         WEG      SIEBEN, und sie stehen hier NAMENTLICH (BA 3 des Auftrags):
                  card.convertOnUpload (die Beschriftung des Haekchens),
                  card.pasteWebpHint (sein Erklaersatz),
                  card.convertAllPng (die alte Knopfbeschriftung),
                  card.noPngLeft (der Satz „kein PNG mehr da"),
                  card.convertPngWebp (die Ueberschrift des Dialogs),
                  card.pngConverting (sein Text -- ein MEHRZAHLPAAR),
                  card.stayedPng (der Halbsatz der Fertigmeldung).
         NEU      ACHTZEHN: die Ueberschrift der Wahl, drei Namen und drei
                  Erklaersaetze der Verfahren, die Auflage, der Satz zu den
                  Ableitungen, die neue Knopfbeschriftung, zwei Saetze unter
                  dem Knopf, zwei Dialogtexte (einer davon ein
                  MEHRZAHLPAAR), die beiden Halbsaetze der Fertigmeldung, der
                  Satz an der Einfuegestelle und die Absage des Servers.
       1227 - 7 + 18 = 1238. Flach: 80 - 2 (card.pngConverting faellt) + 2
       (card.catchUpAsk und card.catchUpBoth sind Mehrzahlpaare) ... und die
       Rechnung geht nur mit BEIDEN Zahlen auf, denn ein Mehrzahlpaar zaehlt
       flach doppelt: 1238 + 82 = 1320. */
    /* 1320 + 2 = 1322 -- die beiden Titel der Blaetterpfeile (0.28.0). Die
       Mehrzahlformen und die Vokabelnamen ruehren sich nicht: ein Pfeil hat
       keine Mehrzahl, und „Uebersicht" ist kein Vokabelwort. */
    /* 0.28.1 -- die Rechnung steht darunter.
       WEG ZWOELF: die Sortiersaetze, die ihre Richtung im Wort trugen -- zu
                sechs Grundlagen je ein absteigender und ein aufsteigender Satz.
       1322 - 12 + 17 = 1327.
       NEU SIEBZEHN: sieben Richtungswoerter fuer den Umschalter (vier Paare,
                aber „A → Z" steht allein, weil „Titel" nur eine Richtung
                kennt -- 4 x 2 - 1 = 7), drei Sortierwoerter ohne Richtung
                („Zuletzt geaendert", „Durchschnittsnote", „Letzte Note" --
                die uebrigen vier Grundlagen nehmen ihr Wort aus dem
                Vokabular), die beiden Titel des Umschalters, die Ueberschrift
                der Abschnittsliste und die beiden langen Saetze der
                Blaetterpfeile, und die beiden Ueberschriften des
                Sortierfeldes.
       DIE BEIDEN UEBERSCHRIFTEN SIND EIN BEFUND UND KEINE ENTSCHEIDUNG:
       „Allgemein" und „Verlauf" standen seit jeher als feste Woerter im
       Quelltext und damit in jeder Sprache deutsch am Bildschirm. Der Umbau
       des Feldes hat sie freigelegt -- die Restprobe bekam sie erst einzeln zu
       sehen, als sie aus der langen Vorlage heraustraten.
       DREI SIND NUR NEU GESCHRIEBEN UND ZAEHLEN DESHALB NICHT MIT: „Titel",
       „Voriger" und „Naechster" behalten ihren Schluessel und wechseln nur den
       Wortlaut -- sie stehen in der Wortlautprobe weiter unten.
       DIE MEHRZAHLFORMEN UND DIE VOKABELNAMEN RUEHREN SICH NICHT: eine Richtung
       hat keine Mehrzahl, und „hoch → niedrig" ist kein Vokabelwort. */
      /* 0.29.0 -- die Rechnung steht darunter.
       WEG EINS: `list.sortOneWay` („Diese Sortierung hat nur eine Richtung").
                Seit „Titel" beide Richtungen kennt, ist keine der sieben
                Grundlagen mehr einspurig -- der Satz hat keinen Traeger mehr
                (Befund 8).
       1327 - 1 + 20 = 1346.
       NEU ZWANZIG: „Z → A"; die beiden Verweise unter dem Fingerprint;
                sechs Saetze der Sicherungsprobe (der Verweis, der laufende
                Zustand, die beiden Auskuenfte bei fremdem Schluessel und
                fremder Datei, „Benutzer" und „Inhalt bis"); die Absage auf
                eine Sicherung, die es nicht mehr gibt; vier Ueberschriften der
                Abschnitte in „Offen"; der Verweis am Kommentar und sein Griff;
                die Absage auf ein Datum, das es nicht gibt; die beiden Saetze
                des Warnkastens zu doppelten Adressen; und die Absage auf eine
                Adresse, die schon vergeben ist.
       EINER IST NUR NEU GESCHRIEBEN UND ZAEHLT DESHALB NICHT MIT:
       `entry.newCategoryHint` behaelt seinen Schluessel und wechselt nur den
       Wortlaut -- er steht in der Wortlautprobe weiter unten.
       DIE MEHRZAHLFORMEN UND DIE VOKABELNAMEN RUEHREN SICH NICHT: ein Datum
       hat keine Mehrzahl, und „Ueberfaellig" ist kein Vokabelwort. */
    /* 1347 SEIT 0.30.0 -- 1346 minus einen plus zwei, und alle drei haben
       einen Namen (Befund 9 und Befund 10):
         WEG    `list.tagsCount` („Tags (2)") -- der Umschalter der Tagzeile ist
                gefallen, und die Zahl stand an ihm (F9).
         NEU    `entry.weighted` („gewichtet") und `card.configured`
                („eingerichtet") -- zwei Woerter, die fest im Quelltext
                standen. Gefunden hat sie die Wache, die WERTE liest (F15).
       DIE MEHRZAHLFORMEN UND DIE VOKABELNAMEN RUEHREN SICH NICHT: „gewichtet"
       hat keine Mehrzahl, und „eingerichtet" ist kein Vokabelwort. */
    /* 1336 SEIT 0.31.0 -- 1347 minus elf, und die elf haben einen gemeinsamen
       Namen: sie waren nie Sprache (Bauabschnitt 1). `entry.targetBlank` hiess
       auf Deutsch `_blank`, auf Englisch `_blank` und auf Tuerkisch `_blank`.
       Sie stehen seit dieser Runde fest im Skript bzw. als Klasse im
       Stilblatt; die Gruppe „Die elf Code-Lecks" haelt beides fest.
       DIE MEHRZAHLFORMEN UND DIE VOKABELNAMEN RUEHREN SICH NICHT: eine
       Abfrageangabe hat keine Mehrzahl, und `10px` ist kein Vokabelwort. */
    /* 1280 WURDEN 1303 MIT 0.32.0, DIE MEHRZAHLFORMEN 82 WURDEN 88 UND DIE
       VOKABELNAMEN 14 WURDEN 15 -- und alle drei Zahlen haben einen Namen:
         +2  Strang 2: `vocabulary.grade` und seine Beschriftung `card.grade`.
             Das fuenfzehnte Vokabelwort -- „Note" war die einzige Zahl im
             Programm ohne eines.
         +5  Bauabschnitt 1: `list.bellToMe`, `list.bellMine`,
             `list.bellOther`, `list.markedCount` -- die geteilte Tafel der
             Glocke (F3) -- minus `list.otherUser`, dessen Satz die Runde
             ersetzt hat (F4).
         +9  Bauabschnitt 4: die elf deutschen Saetze aus server.js. NEUN
             Schluessel fuer elf Saetze -- zwei sind Wiederholungen
             (`mail.noAccount` stand schon da, `server.noPublicAddress` deckt
             zwei Stellen). DREI davon sind MEHRZAHLPAARE und zaehlen flach
             mit je zwei Zweigen: die drei Gruende der Aufraeumvorschau.
         +1  Bauabschnitt 5: `mail.ownServer` -- der ZWOELFTE deutsche Satz,
             gefunden von der Restprobe, die F7 verlangt hat.
         +3  Bauabschnitt 9: `list.statusByHand` und `list.byHandHint` -- die
             harte Kante von `STATUS_BY_HAND` bekommt ihren Satz; dazu bleibt
             `list.followsSort` und nennt jetzt auch den WERT.
       DIE MEHRZAHLFORMEN WACHSEN UM SECHS: drei neue Paare der
       Aufraeumvorschau, je zwei Zweige. Bis 0.31.4 baute `cleanupPreview()`
       die Mehrzahl selbst -- `files.length === 1 ? 'Sicherung' : 'Sicherungen'`
       --, und eine Mehrzahlregel im Quelltext ist eine Regel je Sprache an
       einer Stelle, die nur eine kennt. */
    /* 1303 WURDEN 1297 MIT 0.32.1 -- SECHS FALLEN, KEINER KOMMT DAZU, und das
       ist fuer eine Runde, die etwas AUFRAEUMT, das erwartete Vorzeichen:
         −1  `list.ofWhich` -- das „, davon ..." der Zaehlzeile. Die Zeile
             baut keinen Satz mehr, sondern zaehlt mit Zeichen auf; auf
             Tuerkisch war es eine Klammer („, bunun {parts} kadarı") um eine
             Aufzaehlung, die zur Laufzeit beliebig lang wird.
         −1  `list.and` -- das Bindewort dieser Aufzaehlung. Ohne sie hatte es
             keinen einzigen Rufer mehr.
         −3  `list.followsSort`, `list.statusByHand`, `list.byHandHint` --
             die drei Saetze der Filterableitung, die diese Runde ausbaut.
         −2  `list.pillHint` und `list.sortDefaultHint` -- die beiden
             Erklaerungen an der abgeleiteten Statuspille; sie sind mit ihr
             gefallen.
         +1/−1 `entry.deleteWord` wird zu `entry.deletePhoto` und
             `entry.deleteVideo`. ZWEI feste Schluessel statt eines mit
             Platzhalter: auf Tuerkisch braucht „Fotoğraf" den Akkusativ `-ı`
             und „Video" das `-yu`, und ein fester Satz kann nur eine von
             beiden Endungen tragen.
       DIE MEHRZAHLFORMEN UND DIE VOKABELNAMEN RUEHREN SICH NICHT: keiner der
       sechs war ein Paar, und keiner ein Vokabelwort. */
    /* 1279 WURDEN 1280 MIT 0.31.4: `_afterNumber` kommt dazu. Er traegt keinen
       Satz -- er sagt, welche FORM hinter einer Zahl steht.
       1336 WURDEN 1279 MIT 0.31.1 -- UMGEDREHT UND NICHT GELOESCHT
       (Stolperstein 74). Die Runde hat den zersaegten Satzbau aufgeloest:
       vierundvierzig Schluessel sind dazugekommen, hunderteins gefallen. Die
       Zahl zaehlt Namen UND Zweige -- ein Mehrzahlpaar steht mit drei
       Eintraegen darin, dem Namen und seinen beiden Zweigen.
       DIE MEHRZAHLFORMEN UND DIE VOKABELNAMEN RUEHREN SICH NICHT -- 82 und
       14 wie zuvor. Wer die Zahl hier still mitlaufen liesse, saehe genau das
       nicht: die Runde fasst die ABLAGE der Saetze an, und ein Mehrzahlpaar,
       das dabei flach wird, waere ein Verlust. */
    /* UND SEIT 0.33.0 SIND ES EINER WENIGER: `card.catchUpDerivatives` und
       `card.derivativesAsk` fallen mit der JPEG-Haelfte des Bestandslaufs,
       `server.exportTooOld` kommt mit der Abweisung zu alter Dateien dazu --
       zwei hin, einer her. DIE MEHRZAHLFORMEN UND DIE VOKABELNAMEN RUEHREN
       SICH NICHT: die beiden gefallenen waren einfache Saetze, und der neue
       ist auch einer. */
    check('Und die Zahlen stehen: 1296 Schluessel, 88 Mehrzahlformen, 15 Vokabelnamen',
      languageKeys.length === 1296 && pluralKeys.length === 88 && vocabularyKeys.length === 15,
      `${languageKeys.length} / ${pluralKeys.length} / ${vocabularyKeys.length}`);

    /* ---- 3. Die Adressprobe ---------------------------------------------
       KEIN WEG TRAEGT EIN DEUTSCHES WORT -- ausser den alten, und JEDE alte
       Adresse wird uebersetzt. Gelesen werden nur die Strings: ein Weg in
       einem Kommentar ist eine Erzaehlung und keine Adresse. */
    const addresses = new Set();
    for (const f of SHIPPED)
      for (const part of zerlege(readShipped(f), f)) {
        /* NUR DIE STRINGS. Ein Weg in einem Kommentar ist eine Erzaehlung
           ueber frueher -- `#/system/datenbank` steht dort als Beispiel fuer
           ein altes Lesezeichen und nicht als Adresse dieser Fassung. */
        if (part.kind !== TEXT) continue;
        for (const m of part.wert.matchAll(/(\/api\/[A-Za-z0-9/:_-]+)/g)) addresses.add(m[1]);
        for (const m of part.wert.matchAll(/(#\/[A-Za-z0-9/:_-]*)/g)) addresses.add(m[1]);
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

    /* ---- 4. Die Gestaltprobe --------------------------------------------
       KEINE id, KEINE KLASSE, KEINE STILBLATTVARIABLE TRAEGT EIN DEUTSCHES
       WORTSTUECK. Drei falsche Freunde bleiben: `note` heisst Vermerk,
       `alt` ist das englische Attribut fuer den Ersatztext. */
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

    /* ---- 5. Die Wortlautprobe -------------------------------------------
       DIE WERTE DER SPRACHDATEI SIND ZEICHEN FUER ZEICHEN DIE VON 0681d42 --
       der Abnahme von 0.24.0, als Pruefung. Diese Runde hat SCHLUESSEL
       umbenannt und keinen einzigen Satz angefasst.
       EINE AUSNAHME, UND SIE IST BENANNT: `server.backupDirNotSet` NENNT die
       Umgebungsvariable, und die heisst seit Bauabschnitt 5.2 anders. Der
       Satz musste mitziehen, weil er sonst auf etwas zeigte, das es nicht
       mehr gibt. */
    /* DIE WERTE VON DAMALS STEHEN ALS DATEI DA und werden nicht aus git
       geholt. EINE GEGENPROBENKOPIE ENTSTEHT AUS `git archive` UND HAT KEIN
       `.git`: ein `git show` bricht dort ab, und ein abgerissener Lauf belegt
       nichts (Stolpersteine 138, 161 und 170). Der erste Anlauf dieses
       Waechters hat genau das getan -- acht Gegenproben meldeten ABGERISSEN
       statt einer roten Zeile.
       DIE DATEI IST ERZEUGT UND NICHT GESCHRIEBEN: `git show
       0681d42:public/sprachen/de.json` ist die Quelle, und der Commit steht
       in ihr. */
    const wordingFile = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'tools', 'wording-0681d42.json'), 'utf8'));
    const valuesOf = (o) => { const out = []; for (const v of Object.values(o))
      if (v && typeof v === 'object') out.push(...Object.values(v)); else out.push(v); return out; };
    check('Die Werte der Abnahme liegen als Datei daneben',
      wordingFile.commit === '0681d42' && Array.isArray(wordingFile.values),
      `${wordingFile.commit} · ${wordingFile.values?.length} Werte`);
    /* 0.24.3 IST DIE ERSTE RUNDE DIESER REIHE, DIE SAETZE HINZUFUEGT -- und
       damit die erste, die diesen Waechter anfasst. 0.24.0 hat den Text in die
       Datei geholt, 0.24.1 die Schluessel umbenannt, 0.24.2 die gespeicherten
       Formen; keine hat einen Satz angeruehrt, und der Waechter sagte deshalb
       „gleich viele wie damals".
       DIE ZUSAGE BLEIBT, SIE WIRD NUR GENAUER: die neuen Schluessel stehen
       NAMENTLICH hier, und alles Uebrige ist weiterhin Zeichen fuer Zeichen
       der Stand von 0681d42. Eine Liste von Schluesseln und keine von Saetzen
       -- ein Satz koennte zufaellig einem alten gleichen, und dann naehme die
       Rechnung den falschen weg.
       WER EINEN SCHLUESSEL HINZUFUEGT, TRAEGT IHN HIER EIN. Das ist der ganze
       Sinn: eine Zeile mehr im Pruefstand gegen einen Satz mehr am Bildschirm,
       den sonst niemand bemerkt haette. */
    const WORDING_NEW_0243 = ['_name',
      'card.languageDefaultSaved', 'card.languageDefaultTip', 'card.languageHint',
      'card.languagePoolSaved',
      'card.languages', 'card.languagesFileAfter', 'card.languagesFileBefore',
      'card.onDate', 'card.partLoaded',
      'card.languagesHint', 'card.languagesUsersHint',
      'server.languageUnknown'];
    /* UND ACHT WEITERE MIT 0.24.4 -- dieselbe Regel, eine Runde spaeter. Sie
       stehen in einer EIGENEN Liste und nicht hinten an der von 0.24.3: die
       Listen sind die Buchfuehrung darueber, welche Runde welchen Satz
       hinzugefuegt hat, und eine gemeinsame Liste verloere genau diese
       Auskunft.
         B5   die beiden festen deutschen Woerter, die durch jeden Waechter
              der Runde 0.24.3 gefallen sind
         B6 B der Anleger im Papierkorb -- in der Zeile ohne Datum, im Titel
              der Zeile mit
         B7   die beiden Platzhalter und die beiden Meldungen der Anlegefelder */
    const WORDING_NEW_0244 = [
      'entry.showAllLinks', 'list.filtersActive',
      'card.newCategory', 'card.newTag',
      'card.categoryCreated', 'card.tagCreated'];
    /* UND EINER MIT 0.24.5 -- dieselbe Regel, eine Runde spaeter, und wieder in
       einer EIGENEN Liste: die Listen sind die Buchfuehrung darueber, welche
       Runde welchen Satz hinzugefuegt hat.
         F4   der Vermerk am Rueckfall. Wo fuer die gezeigte Sprache kein Name
              eingetragen ist, steht der der Vorgabesprache da -- und diese
              Zeile sagt, dass er ein Rueckfall ist und welche Sprache er
              traegt. Bis 0.24.4 sah der Rueckfall aus wie ein Eintrag. */
    const WORDING_NEW_0245 = ['card.nameFallback'];
    /* UND ZWEI MIT 0.24.6 -- wieder eine eigene Liste, aus demselben Grund:
       sie ist die Buchfuehrung darueber, welche Runde welchen Satz gebracht
       hat.
         F2   der Vermerk, der KEINE Sprache nennt. Er steht da, wo fuer keine
              einzige Sprache des Vorrats etwas eingetragen ist -- die Klammer
              der Kette. Bis 0.24.5 stand dort der Satz mit Sprachnamen, und
              die genannte Sprache war die falsche: „sagt das es turkisch
              (stimmt nicht) anzeigt".
         F3   der Hinweis unter der Pillenreihe. Die Tafel der Vorgabesprache
              IST die Grundzeile, und die traegt keinen Sprachvermerk -- diese
              Runde kennzeichnet das, statt es weiter zu behaupten. */
    /* BEIDE SIND MIT 0.25.0 WIEDER WEGGEFALLEN, und deshalb steht die Liste
       der Runde 0.24.6 hier LEER statt gestrichen: sie ist die Buchfuehrung
       darueber, was jene Runde gebracht hat, und dass davon nichts geblieben
       ist, ist eine Aussage. Die beiden stehen unten unter WORDING_GONE_0250.
       Eine Liste, die auf zwei Saetze zeigt, die es nicht mehr gibt, faerbte
       die Zeile darunter rot -- und zwar zu Recht. */
    const WORDING_NEW_0246 = [];
    /* UND VIERZEHN MIT 0.25.0 -- wieder eine eigene Liste, aus demselben
       Grund. Sie tragen die Kette und ihre beiden Anzeigen:
         Kette   der Vermerk am Originaltext, wenn niemand die Sprache der
                 Zeile kennt (Schritt 4), und die Absage am Raeumen desselben
         F5      das ✕ am Feld -- Beschriftung, Rueckfrage, Hinweis, Meldung
         F3      Punkt und Zahl an der Pille: „vollstaendig" und „so viele
                 fehlen"
         F2      der Kasten fuer die unbekannte Erstellungssprache: Zahl,
                 Erklaerung, Knopf und die Meldung danach
         F4      die Ansage nach dem Umschalten der Vorgabesprache und das
                 Wort, mit dem sie die fehlenden Vokabeln zaehlt */
    const WORDING_NEW_0250 = [
      'card.nameOriginal', 'server.nameOriginalStays',
      'card.nameRemove', 'card.nameRemoveAsk', 'card.nameRemoveHint', 'card.nameRemoved',
      'card.languageComplete', 'card.languageMissing',
      'card.namesUnknown', 'card.namesUnknownHint', 'card.namesAssign', 'card.namesAssigned',
      'card.languageDefaultNow', 'card.wordsMissing'];
    /* UND DREI MIT 0.25.4 -- der Verneinungssatz, den 0.24.3 in drei Stuecke
       zersaegt hatte. Jede Sprache traegt jetzt EINEN ganzen Satz und das
       hervorgehobene Stueck als eigenen Schluessel, und sie entscheidet
       selbst, WO es sitzt und WAS es ist: im Deutschen das Woertchen „nicht",
       im Tuerkischen das ganze Verb „etkilenmez". */
    const WORDING_NEW_0254 = ['login.linkUnaffected', 'login.linkUnaffectedRetry',
      'login.linkUnaffectedWord'];
    /* UND EINER MIT 0.26.0 -- Befund 3c. `card.setByAdmin` sagte dem Benutzer
       „Eingestellt wird es vom Admin." und beschrieb damit einen KNOPF, den
       er nicht hat. Der Betreiber hat entschieden, was an seiner Stelle steht:
       dass die Gewichte eine Systemvorgabe sind. Der Schluessel heisst
       deshalb anders, und der alte faellt weiter unten namentlich weg -- eine
       Umbenennung ist hier ein neuer Satz UND eine Wegnahme, und beide
       gehoeren in ihre Liste. */
    /* UND VIER FUER DEN POTENZIALMODUS -- dieselbe Runde, andere Sache. Sie
       stehen NEBEN dem Satz aus Befund 3c und nicht in derselben Zeile: die
       Listen sind die Buchfuehrung darueber, WELCHE Runde welchen Satz
       hinzugefuegt hat, und innerhalb einer Runde sagt die Trennung, WOFUER.
       DER SCHALTER SELBST BRAUCHT KEINEN SATZ -- er braucht vier: was er tut
       (der einleitende Satz), wie er heisst (die Beschriftung), was die
       gedaempfte Liste bedeutet, und warum ein Admin ihn nicht stellen kann.
       Der letzte ist der Preis der Antwort auf F3. */
    const WORDING_NEW_0260 = ['card.weightSystemDefault',
      'card.potentialModeHint', 'card.potentialModeLabel',
      'card.potentialModeOff', 'card.potentialModeOwner'];
    /* UND ACHTZEHN MIT 0.27.0 -- die Wahl der Bildablage. Aus einem Haekchen
       mit einer Beschriftung und einem Erklaersatz wird eine Wahl aus drei
       Verfahren, und jedes Verfahren braucht einen Namen und einen Satz
       dazu. DAZU DIE AUFLAGE, ohne die „verlustbehaftet" ein Knopf waere, den
       man einmal drueckt und danach nicht versteht.
       DER LAUF UEBER DEN BESTAND BEKOMMT VIER STATT ZWEI: seine Beschriftung,
       zwei Saetze darunter (je nachdem, ob es noch PNG gibt) und zwei
       Dialogtexte. Er tut seit dieser Runde ZWEIERLEI, und ein Satz, der nur
       die eine Haelfte nennt, verschwiege die andere.
       UND EINER STEHT NICHT IN DER KARTE, sondern an der EINFUEGESTELLE:
       `entry.clipboardLarger`. Er gehoert dorthin, weil der billigste Weg --
       „Bild speichern unter" und hochladen -- dort noch offensteht und in der
       Karte niemanden mehr erreicht. */
    const WORDING_NEW_0270 = ['card.storeMethod',
      'card.storePng', 'card.storePngHint',
      'card.storeLossless', 'card.storeLosslessHint',
      'card.storeLossy', 'card.storeLossyHint',
      'card.storeCaveat', 'card.derivativesWebp',
      'card.catchUpStore', 'card.catchUpBoth', 'card.catchUpDerivatives',
      'card.catchUpAsk', 'card.derivativesAsk',
      'entry.clipboardLarger', 'server.imageStoreUnknown'];
    /* ZWEI STANDEN BIS 0.31.1 HIER DANEBEN: `card.convertCounts` und
       `card.nothingToDo`. Beide sind mit 0.31.1 in `card.convertFinished`
       hineingezogen worden -- aus drei Bruchstuecken ist ein Satz mit zwei
       Plaetzen geworden. Sie stehen in keiner Sprachdatei mehr, und die
       Zeile darunter faengt genau das: eine Liste, die einen Schluessel
       nennt, den es nicht mehr gibt, ist eine Erinnerung und keine
       Buchfuehrung. Ein GONE-Eintrag braucht es nicht -- der Stand von
       0681d42 kennt sie ohnehin nicht, sie sind Schluessel aus 0.27.0. */
    /* UND ZWEI MIT 0.28.0: die Titel der beiden Blaetterpfeile in der
       Kopfzeile. Mehr Saetze braucht diese Runde nicht -- der Rueckweg behaelt
       seinen (`list.backToList`), und die Kopfzeile leiht sich alles andere
       von der Uebersicht. */
    const WORDING_NEW_0280 = ['list.prevInList', 'list.nextInList'];
    /* UND FUENFZEHN MIT 0.28.1, und sie kommen aus zwei Umbauten:
       SIEBEN RICHTUNGSWOERTER und ZWEI TITEL fuer den Umschalter neben dem
              Sortierfeld. Die Richtung stand vorher IM Eintrag („Titel (A →
              Z)"); jetzt steht sie daneben und ist anklickbar. Vier Paare
              decken alle sieben Grundlagen -- „A → Z" hat kein Gegenstueck,
              weil „Titel" nur eine Richtung kennt.
       DREI SORTIERWOERTER ohne Richtung: „Zuletzt geaendert",
              „Durchschnittsnote", „Letzte Note". Die anderen vier Grundlagen
              nehmen ihr Wort aus dem Vokabular und brauchen keinen Schluessel.
       EINE UEBERSCHRIFT fuer die Abschnittsliste im Eintrag.
       ZWEI LANGE SAETZE fuer die Blaetterpfeile: die Knopfwoerter sind kurz
              geworden, damit die Leiste auf ein Telefon passt, und der ganze
              Satz steht seither im `title` daneben. */
    const WORDING_NEW_0281 = ['card.sections',
      'list.dirNewOld', 'list.dirOldNew', 'list.dirAZ',
      'list.dirHighLow', 'list.dirLowHigh', 'list.dirManyFew', 'list.dirFewMany',
      'list.sortChanged', 'list.sortAvg', 'list.sortLast',
      'list.sortFlip',
      'list.prevHint', 'list.nextHint',
      'list.sortGroupGeneral', 'list.sortGroupHistory'];
    /* UND ZWANZIG MIT 0.29.0. `list.sortOneWay` steht eine Zeile hoeher NICHT
       mehr: der Satz ist mit Befund 8 gefallen, und eine Liste „neu in 0.28.1",
       die einen gefallenen Schluessel fuehrt, waere eine Ankuendigung ins
       Leere. Die Zahl darueber rechnet ihn mit ab. */
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
       im Quelltext stand, bekommt seinen Schluessel.
         `entry.weighted`   „gewichtet" an der Kopfzahl des Bewertungskastens.
                            Es stand seit 0.16.0 fest da und in KEINER
                            Sprachdatei -- in einer englisch oder tuerkisch
                            eingestellten Instanz stand dort deutscher Text.
         `card.configured`  „eingerichtet" am Mailversand. Dieselbe Zeile las
                            fuer das Gegenteil schon `card.notConfigured`;
                            die Zusage stand fest auf Deutsch daneben.
       GEFUNDEN HAT BEIDE DIESELBE WACHE, und sie ist die eigentliche Antwort
       auf Befund 10: „an" und „aus" hat sie auch gefunden -- dafuer gab es
       die Schluessel schon (`card.on`, `card.off`). */
    const WORDING_NEW_0300 = ['entry.weighted', 'card.configured'];
    /* UND VIERUNDVIERZIG MIT 0.31.1 -- die Runde, die die zersaegten Saetze
       wieder zusammensetzt. Ein verschmolzener Satz bekommt haeufig einen
       NEUEN Namen: `card.keyFromSetting` und `card.withoutKeyLost` werden
       `card.keyFromSetting`, und der neue Name nennt den ganzen Satz
       statt seiner ersten Haelfte. Der Stand von 0681d42 kennt ihn nicht --
       also steht er hier und wird gar nicht erst verglichen. Sein VORGAENGER
       steht in WORDING_GONE_TEXT_0311 und wird dort abgezogen. */
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
    /* UND EINER MIT 0.31.4, und er ist kein Satz: `_afterNumber` steht im KOPF
       der Datei, bei `_locale` und `_name`, und sagt, welche Form hinter einer
       Zahl steht. Er gehoert trotzdem hierher -- die Wortlautprobe vergleicht
       die WERTE der Datei, und ein Wert, den es bei der Abnahme nicht gab,
       muesste sonst als „anderer Satz" gezaehlt werden. */
    const WORDING_NEW_0314 = ['_afterNumber'];
    /* UND ACHTZEHN MIT 0.32.0 -- dieselbe Regel, eine Runde spaeter, und wieder
       in einer EIGENEN Liste: sie ist die Buchfuehrung darueber, welche Runde
       welchen Satz gebracht hat.
         STRANG 2     `vocabulary.grade` und `card.grade` -- das fuenfzehnte
                      Vokabelwort und seine Beschriftung in der Karte.
         BA 1 (F3/F4) `list.bellToMe`, `list.bellMine`, `list.bellOther` --
                      die drei Ueberschriften der geteilten Glockentafel --
                      und `list.markedCount`, das „, davon 1 an mich
                      gerichtet" an der Zeile.
         BA 4 (F6)    die neun Schluessel fuer die elf deutschen Saetze aus
                      server.js. NEUN FUER ELF: `mail.noAccount` stand schon
                      da, und `server.noPublicAddress` deckt zwei Stellen.
         BA 5 (F7)    `mail.ownServer` -- der ZWOELFTE. Die Restprobe, die F7
                      verlangt hat, hat ihn noch in derselben Runde gefunden:
                      „Eigener Server" stand fest in der Anbieterliste.
         BA 9         `list.statusByHand` und `list.byHandHint` -- die harte
                      Kante von `STATUS_BY_HAND` bekommt ihren Satz. */
    const WORDING_NEW_0320 = [
      'vocabulary.grade', 'card.grade',
      'list.bellToMe', 'list.bellMine', 'list.bellOther', 'list.markedCount',
      'server.noAccountOwner', 'server.noTestMail', 'server.noPublicAddress',
      'server.noUserAddress', 'server.signupThanks', 'server.cleanupNoBackups',
      'server.backupsBeforeKey', 'server.cleanupAllYoungest', 'server.cleanupOldestAge',
      'mail.ownServer', 'list.statusByHand', 'list.byHandHint'];
    /* UND ZWEI MIT 0.32.1 -- und es sind KEINE neuen Saetze, sondern ein
       geteilter: `entry.deleteWord` („{word} löschen") wird zu
       `entry.deletePhoto` und `entry.deleteVideo`.
       DER GRUND IST TUERKISCH. Der Platzhalter traegt genau zwei Woerter,
       „Fotoğraf" und „Video", und beide brauchen als direktes Objekt eine
       ENDUNG: „Fotoğraf-ı sil" und „Video-yu sil". Welche, haengt vom letzten
       Vokal und vom letzten Buchstaben ab -- ein fester Satz kann nur eine von
       beiden tragen. Zwei feste Schluessel koennen beide.
       DIESELBE BAUFORM STEHT SCHON DANEBEN: `entry.deleteFile` heisst
       „Dosyayı sil" und `entry.deleteImage` „Resmi sil", beide fest und beide
       richtig. Das Teilen ist keine Ausnahme, sondern die Praxis der Datei. */
    const WORDING_NEW_0321 = ['entry.deletePhoto', 'entry.deleteVideo'];
    /* UND EINER MIT 0.33.0: `server.exportTooOld`. Er ist die eine Abweisung
       des Bruchs (F15) -- eine Exportdatei mit Formatnummer 13 oder aelter
       traegt die Feldnamen von vor 0.24.1, und seit dieser Runde uebersetzt
       sie niemand mehr. Der Satz nennt BEIDE Nummern: die der Datei und die
       aelteste, die noch hereinkommt. Ein „geht nicht" ohne beides waere eine
       Sackgasse. */
    const WORDING_NEW_0330 = ['server.exportTooOld'];
    /* UND ACHT SCHLUESSEL FALLEN MIT 0.32.1 -- sechs von ihnen gab es schon
       bei der Abnahme, zwei sind erst in 0.32.0 entstanden und schon wieder
       weg. SIE STEHEN IN EINER LISTE UND WERDEN VON `WORDING_NEW` ABGEZOGEN,
       statt aus den Listen der frueheren Runden herausgestrichen zu werden:
       die Buchfuehrung soll sagen, WELCHE Runde einen Satz gebracht und
       welche ihn wieder genommen hat. Ein herausgestrichener Eintrag saehe
       aus, als haette es ihn nie gegeben. */
    const WORDING_GONE_0321 = [
      'list.ofWhich', 'list.and',                      // die Zaehlzeile baut keinen Satz mehr
      'list.followsSort', 'list.statusByHand', 'list.byHandHint',   // die Filterableitung
      'list.pillHint', 'list.sortDefaultHint',          // ihre beiden Erklaerungen
      'entry.deleteWord'];                              // in zwei feste geteilt
    /* UND ZWEI FALLEN MIT 0.33.0 -- die JPEG-Haelfte des Bestandslaufs.
       `card.catchUpDerivatives` sagte, was der Knopf tut, wenn nur noch
       Ableitungen anstehen, `card.derivativesAsk` fragte danach. Beide
       beschreiben eine Haelfte, die es nicht mehr gibt: seit 0.27.0 entsteht
       kein JPEG-Vorschaubild mehr, und was den Zweig noch haette treffen
       koennen, ist auf der einen echten Installation laengst gefahren
       worden (F7). Sie werden ABGEZOGEN und nicht aus WORDING_NEW_0270
       herausgestrichen: die Buchfuehrung soll sagen, WELCHE Runde einen Satz
       gebracht und welche ihn wieder genommen hat. */
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
       abgezogen, wie `card.restoreIcon` in 0.24.4. Eine Wegnahme, die keiner
       sieht, ist genau die Sorte Aenderung, fuer die dieser Waechter gebaut
       wurde.
       SIE STEHEN IN KEINER SPRACHDATEI MEHR -- alle drei werden gefragt, nicht
       nur die deutsche: ein Satz, der in zwei Dateien weg ist und in der
       dritten steht, ist eine Karteileiche mit Uebersetzung. */
    const WORDING_GONE_0250 = ['card.nameFallbackNone', 'card.namesBaseRow'];
    const goneStill = [];
    for (const code of ['de', 'en', 'tr']) {
      const file = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
      for (const k of WORDING_GONE_0250) if (file[k] !== undefined) goneStill.push(`${code}/${k}`);
    }
    check('Und die zwei Schluessel, die 0.25.0 wegnimmt, stehen in keiner Datei mehr',
      goneStill.length === 0, goneStill.join(' ') || 'beide weg');
    /* UND VIER FALLEN MIT 0.25.4 -- der zersaegte Verneinungssatz.
       „Dein Link ist davon" + <strong>nicht</strong> + „betroffen -- er gilt
       weiter." geht im Deutschen auf und im Englischen auch. IM TUERKISCHEN
       NICHT: dort verneint ein SUFFIX IM VERB, und aus den drei Stuecken wurde
       „Bağlantın bundan değil etkilendi" -- keine Verneinung, sondern
       Kauderwelsch. Der Satz sagte das GEGENTEIL dessen, was dastehen sollte.
       SIE STEHEN IN KEINER SPRACHDATEI MEHR -- alle drei werden gefragt, wie
       bei den zweien aus 0.25.0. */
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
    /* UND EINER IST WEGGEFALLEN -- `card.restoreIcon`, 0.24.4 (B6 A). Ein
       Zeichen ist kein Wort und gehoert nicht in einen Satz, den jemand
       uebersetzt; der Knopf setzt es selbst und schreibt „Wiederherstellen"
       daneben. SEIN WORTLAUT WIRD HIER NAMENTLICH ABGEZOGEN und nicht
       stillschweigend: eine Wegnahme, die keiner sieht, ist genau die Sorte
       Aenderung, fuer die dieser Waechter gebaut wurde.
       DER SCHLUESSEL DARF NICHT MEHR DASTEHEN -- sonst zoege die Zeile
       darunter einen Satz ab, den es noch gibt, und die Rechnung ginge
       zufaellig auf. */
    /* UND ELF FALLEN MIT 0.31.0 -- Bauabschnitt 1, und alle elf aus DEMSELBEN
       Grund: sie waren nie Sprache. `entry.targetBlank` hiess auf Deutsch
       `_blank`, auf Englisch `_blank` und auf Tuerkisch `_blank`; ein Text,
       der in drei Sprachen gleich lautet, ist kein Text, sondern eine
       Konstante, die durch die Uebersetzung reist.
         entry.targetBlank   `_blank` -- wohin ein Link aufgeht
         entry.linkRel       `noopener,noreferrer` -- was der neue Tab nicht darf
         entry.imagePrefix   `image/` -- woran ein Bild erkannt wird
         list.px10/px20      `10px`/`20px` -- ein Abstand, jetzt eine Klasse
         card.composeFile    `docker-compose.yml` -- ein Dateiname
         card.filesQuery     `&files=1`      die vier Stuecke der Exportadresse
         card.photosQuery    `photos=1`
         card.videosQuery    `&videos=1`
         card.partQuery      `&from=…&to=…&part=…&parts=…`
         list.thumbQuery     `?size=thumb` -- die Groesse eines Kommentarbildes
       SIE STEHEN IN KEINER SPRACHDATEI MEHR -- alle drei werden gefragt, und
       das ist hier nicht bloss Sorgfalt: die Deckungsprobe verlangt in JEDER
       Datei dieselben Schluessel. Elf nur aus `de.json` zu nehmen faerbte den
       Lauf sofort rot und nicht erst in 0.31.1. */
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
       Wegnahme davor. `card.partQuery` steht dabei mit seinem Wert von
       0681d42 da und nicht mit dem von gestern: damals hiessen die vier
       Angaben deutsch (`&von=…`), seit 0.24.3 englisch. Verglichen wird gegen
       die ABNAHME, also gilt der Wortlaut der Abnahme. */
    const WORDING_GONE_TEXT_0310 = ['_blank', 'noopener,noreferrer', 'image/',
      '10px', '20px', 'docker-compose.yml', '&files=1', 'photos=1', '&videos=1',
      '?size=thumb', '&von={von}&bis={bis}&teil={nr}&teile={n}'];
    /* UND ACHTUNDNEUNZIG FALLEN MIT 0.31.1 -- der Preis und der Gewinn
       derselben Sache. Die Runde setzt zersaegte Saetze zusammen: aus
       „Der Schluessel kommt aus der Server-Einstellung" + `<code>` +
       „. " + „— ohne Schluessel sind die Daten verloren." wird EIN Satz mit
       zwei Plaetzen darin. Die HAELFTEN gibt es danach nicht mehr, und ihr
       WORTLAUT steht hier -- verglichen werden Saetze und keine Namen.
       IHR TEXT IST DER VON 0681d42 UND NICHT DER VON GESTERN: die Liste wird
       vom Stand der Abnahme abgezogen, und dort steht er so. Wo eine spaetere
       Runde den Satz schon geaendert hatte, steht seine ZWISCHENFASSUNG
       weiterhin in der Liste jener Runde -- sie faellt aus `onlyNow` heraus,
       weil es den Schluessel nicht mehr gibt, und das geht auf. */
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
       mehr. Ihr WORTLAUT steht hier und nicht ihr Schluessel; verglichen
       werden Saetze. */
    const WORDING_GONE_TEXT_0254 = ['nicht', 'Dein Link ist davon',
      'betroffen — er gilt\n          weiter.',
      'betroffen — er gilt weiter.\n        Versuch es gleich noch einmal.'];
    /* UND EINER MIT 0.26.0 -- Befund 3c, aus demselben Grund: der Stand von
       damals kennt ihn, der von heute nicht mehr. Sein WORTLAUT steht hier
       und nicht sein Schluessel; verglichen werden Saetze. */
    const WORDING_GONE_TEXT_0260 = ['Eingestellt wird es vom Admin.'];
    /* UND SIEBEN FALLEN MIT 0.27.0 -- NAMENTLICH, wie der Auftrag es verlangt
       (BA 3: „Faellt doch einer, steht er NAMENTLICH hier, in allen drei
       Sprachen"). Sie beschreiben alle dasselbe: ein Haekchen, das es nicht
       mehr gibt, und einen Lauf, der nur PNG anfasste.
         card.convertOnUpload   die Beschriftung des Haekchens
         card.pasteWebpHint     sein Erklaersatz
         card.convertAllPng     „Alle PNG in WebP umwandeln" -- der Knopf
                                heisst jetzt anders, weil er mehr tut
         card.noPngLeft         „Keine PNG-Fotos mehr vorhanden." -- der Satz
                                war die Begruendung fuer einen toten Knopf,
                                und der Knopf ist nicht mehr tot
         card.convertPngWebp    die Ueberschrift des Bestaetigungsfensters
         card.pngConverting     sein Text (ein MEHRZAHLPAAR, also zwei Werte)
         card.stayedPng         „, {geblieben} blieben PNG" -- die Zahl heisst
                                jetzt „an N war nichts zu tun", denn `stayed`
                                zaehlt seit dieser Runde die ZEILE und nicht
                                das Format
       SIE STEHEN IN KEINER SPRACHDATEI MEHR -- alle drei werden gefragt: ein
       Satz, der in zwei Dateien weg ist und in der dritten steht, ist eine
       Karteileiche mit Uebersetzung. */
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
       mehr. ACHT WERTE FUER SIEBEN SCHLUESSEL: card.pngConverting ist ein
       Mehrzahlpaar und steht flach zweimal da. */
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
       absteigenden und einem aufsteigenden Satz. Sie sind weg, weil die
       Richtung nicht mehr im Satz steht: aus zwei Eintraegen „{potenzial}
       (hoch → niedrig)" und „{potenzial} (niedrig → hoch)" ist EIN Eintrag
       „{potenzial}" plus ein Umschalter geworden, der „hoch → niedrig" sagt.
       SECHS UND NICHT SIEBEN: „Titel" hatte nie ein Gegenstueck, und sein
       Schluessel bleibt deshalb stehen -- nur sein Wortlaut verliert die
       Klammer. Er steht weiter unten bei den geaenderten Saetzen. */
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
    /* IHR WORTLAUT WIRD AUS DEM STAND VON DAMALS ABGEZOGEN, wie bei den Runden
       davor. ZWOELF WERTE FUER ZWOELF SCHLUESSEL -- keiner ist ein
       Mehrzahlpaar, eine Sortierung gibt es nur einmal.
       DIE PLATZHALTER TRAGEN HIER IHRE DEUTSCHEN NAMEN, weil der Stand von
       damals sie so kennt: die Rueckdrehung trifft nur die Liste von heute. */
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
    /* UND EINER MIT 0.32.0: `list.otherUser` -- „anderer Benutzer". Er war das
       hervorgehobene Wort im Satz des Glockenfensters, und diesen Satz ersetzt
       die Runde (F4): die Tafel trennt jetzt nach HERKUNFT, und „von anderen
       Benutzern" steht nicht mehr als eigenes Stueck darin. Ein Schluessel,
       den niemand mehr ruft, bleibt nicht stehen. */
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
       Runde davor -- sonst stuende „anderer Benutzer" fuer immer in `onlyThen`
       und faerbte die Rechnung. */
    const WORDING_GONE_TEXT_0320 = ['anderer Benutzer'];
    /* UND DIE ACHT VON 0.32.1 -- gepruefte Zugehoerigkeit: die Zeile darunter
       haelt fest, dass keiner der acht in einer der drei Dateien mehr steht.
       SECHS WORTLAUTE UND NICHT ACHT: `list.statusByHand` und
       `list.byHandHint` sind erst in 0.32.0 entstanden. Den Stand von damals
       gab es ohne sie, also ist dort auch nichts abzuziehen -- sie fallen
       ueber `WORDING_GONE_0321` aus `WORDING_NEW` und damit aus der Rechnung.
       DIE WORTLAUTE SIND DIE VON DAMALS UND NICHT DIE VON GESTERN: „folgt der
       Sortierung" hatte bis 0.31.4 keinen Wert dahinter, und `list.and` stand
       bei der Abnahme mit Leerzeichen da (" und "). Wer hier den heutigen
       Wortlaut abzoege, traefe nichts und liesse den alten stehen. */
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
    /* DIE PLATZHALTERNAMEN ZIEHEN MIT IHREM SATZ UM -- 0.24.3, F7. Aus
       „{tage} Tagen" ist „{days} Tagen" geworden: der SATZ ist Zeichen fuer
       Zeichen derselbe, nur der Name in den Klammern ist englisch. Genau
       deshalb hat 0.24.1 sie liegen gelassen -- ein Umbenennen dort haette
       damals einen Wert der Datei geaendert und die Zusage „kein Wort anders"
       gebrochen.
       VERGLICHEN WIRD DESHALB MIT ZURUECKGEDREHTEN NAMEN. Die Tafel ist
       dieselbe, die den Umbau gefahren hat, nur andersherum gelesen -- eine
       zweite Liste hier liefe von der ersten weg.
       WAS DAMIT WEITERHIN AUFFAELLT: jede Aenderung am SATZ. Wer ein Wort
       austauscht, sieht diese Zeile rot; wer einen Platzhalter umbenennt und
       die Tafel pflegt, nicht. */
    const PLACEHOLDERS_0243 = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'tools', 'placeholders-0243.json'), 'utf8'));
    const BACK = Object.fromEntries(Object.entries(PLACEHOLDERS_0243).map(([de, en]) => [en, de]));
    /* UND DER WEISSRAUM WIRD ZUSAMMENGEZOGEN -- 0.31.1, und das ist eine
       LOCKERUNG mit einem Tausch daneben.

       BIS 0.31.0 TRUGEN 95 WERTE DIE EINRUECKUNG DES QUELLTEXTS mit sich:
       `"...gelten\n          fuer alle {entryMany}."` -- Rest aus dem Umzug
       der Saetze ins JSON. Am Bildschirm faellt sie nicht auf; HTML zieht
       solchen Weissraum zusammen, und KEINER dieser Werte landet in einem
       Attribut, einem Dialog, einer Meldung oder im Server (nachgesehen,
       Stelle fuer Stelle). Die drei Dateien waren sich darin ohnehin uneins:
       Deutsch 93 Werte, Englisch 101, Tuerkisch 4.

       DIESE ZEILE ZAEHLTE IHN ALS WORTLAUT. Ein Waechter, der unsichtbaren
       Weissraum fuer eine Aenderung am Satz haelt, verlangt fuer jede
       Aufraeumung fuenfundneunzig Zeilen Buchfuehrung -- und verleitet dazu,
       gar nicht aufzuraeumen.

       DER TAUSCH: er zieht ihn zusammen, und Zusage 9 der Runde verbietet ihn
       GANZ -- in allen drei Dateien, nicht nur in dieser einen Probe. Was hier
       an Strenge abgegeben wird, steht dort staerker wieder da. Ohne diesen
       zweiten Teil waere es eine Lockerung, um die eigene Aenderung
       durchzulassen, und das ist der falsche Griff. */
    const asBefore = (v) => String(v)
      .replace(/\{(\w+)\}/g, (whole, n) => BACK[n] ? `{${BACK[n]}}` : whole)
      .replace(/\n[ \t]+/g, ' ').replace(/[ \t]{2,}/g, ' ');
    check('Die Tafel der Platzhalternamen liegt als Datei daneben',
      Object.keys(PLACEHOLDERS_0243).length === 89,
      `${Object.keys(PLACEHOLDERS_0243).length} Namen`);
    /* EINEN Satz aus einer Liste nehmen, und zwar genau EINMAL. Zwei
       Schluessel duerfen denselben Wortlaut tragen; ein filter() naehme beide.
       ER STEHT HIER UND NICHT WEITER UNTEN -- seit 0.24.4 braucht ihn schon
       die Rechnung „damals ohne den weggenommenen Satz". */
    const withoutOne = (list, sentence) => {
      const at = list.indexOf(sentence);
      return at < 0 ? list : list.slice(0, at).concat(list.slice(at + 1));
    };
    /* DER WEGGENOMMENE SATZ WIRD AUS DEM STAND VON DAMALS ABGEZOGEN, nicht
       aus dem von heute -- dort steht er ja gerade nicht mehr. Was danach
       verglichen wird, ist der Stand von 0681d42 OHNE ihn gegen den Stand von
       heute ohne die dreizehn plus acht neuen. */
    /* UND EINER MIT 0.30.0: „Tags ({length})" stand am Umschalter der
       Tagzeile, und den gibt es nicht mehr (F9). Der Stand von damals kennt
       ihn, der von heute nicht -- also wird er dort abgezogen. */
    const WORDING_GONE_TEXT_0300 = ['Tags ({length})'];
    /* BEIDE SEITEN GLEICH BEHANDELT. Der Stand von damals traegt denselben
       Weissraum; wer nur die eine Seite zusammenzieht, vergleicht zwei
       verschiedene Schreibweisen desselben Satzes und faerbt alles rot. */
    const flatten = (v) => String(v).replace(/\n[ \t]+/g, ' ').replace(/[ \t]{2,}/g, ' ');
    /* UND DIE ABZUGSLISTEN WERDEN MITGEZOGEN -- 0.31.1, und das war ein Fund.
       Bis hierher wurde vom ROHEN Stand abgezogen und erst danach
       zusammengezogen: ein Satz, der in der Datei von damals eine Einrueckung
       trug, liess sich mit seinem zusammengezogenen Wortlaut nicht abziehen
       und blieb stumm in `onlyThen` stehen. Bei elf Eintraegen fiel das nicht
       auf; bei achtundneunzig standen zweiunddreissig falsch da. */
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
       zaehlt flach zweimal. Aus zwei Saetzen werden vier -- alles andere ist
       Satz fuer Satz dasselbe. */
    /* 1213 WURDEN 1201 -- 0.28.1, und AUF BEIDEN SEITEN sind es zwoelf
       weniger: die zwoelf Sortiersaetze fallen aus der Datei von heute und
       werden gleichzeitig aus dem Stand von damals abgezogen. Der Abstand
       zwischen beiden Listen bleibt deshalb bei zwei. */
    /* 1201 WURDEN 1200 -- 0.30.0, und AUF BEIDEN SEITEN ist es einer weniger:
       „Tags ({length})" faellt aus der Datei von heute und wird gleichzeitig
       aus dem Stand von damals abgezogen. Die beiden NEUEN Schluessel stehen
       in WORDING_NEW und zaehlen hier ohnehin nicht mit. Der Abstand zwischen
       beiden Listen bleibt deshalb bei zwei. */
    /* 1200 WURDEN 1189 -- 0.31.0, und AUF BEIDEN SEITEN sind es elf weniger:
       die elf Code-Lecks fallen aus der Datei von heute und werden gleich-
       zeitig aus dem Stand von damals abgezogen (WORDING_GONE_TEXT_0310).
       Der Abstand zwischen beiden Listen bleibt deshalb bei zwei. */
    /* 1189 WURDEN 1089 MIT 0.31.1, UND DIE BEIDEN ZAHLEN SIND GLEICH GEWORDEN.
       Die zwei Saetze mehr waren die beiden Mehrzahlpaare aus 0.25.4: `{n}
       Tage` steht flach mit zwei Werten da, wo damals einer stand. Sie sind
       noch da und zaehlen weiter zwei -- nur steht ihnen jetzt auf der Seite
       von damals dieselbe Zahl gegenueber, weil 0.31.1 achtundneunzig
       Haelften abzieht und vierundvierzig neue Schluessel gar nicht erst
       vergleicht. DIE GLEICHHEIT IST DAMIT KEIN ZUFALL, SONDERN DAS ERGEBNIS
       ZWEIER GEGENGERECHNETER LISTEN -- und die Zeile sagt beide Zahlen, statt
       nur „gleich viele". */
    /* 1089 WURDEN 1088 MIT 0.32.0, UND DIE BEIDEN ZAHLEN BLEIBEN GLEICH: „anderer
       Benutzer" faellt aus der Datei von heute (der Satz des Glockenfensters
       ersetzt ihn) und wird im selben Zug aus dem Stand von damals abgezogen
       (WORDING_GONE_TEXT_0320). Die achtzehn NEUEN Schluessel der Runde stehen
       in WORDING_NEW und werden hier gar nicht erst verglichen. */
    /* 1088 WURDEN 1082 MIT 0.32.1, UND DIE BEIDEN ZAHLEN BLEIBEN GLEICH: sechs
       Saetze fallen aus der Datei von heute und werden im selben Zug aus dem
       Stand von damals abgezogen (WORDING_GONE_TEXT_0321). Die zwei NEUEN
       Schluessel der Runde stehen in WORDING_NEW und werden gar nicht erst
       verglichen. */
    check('Wortlautprobe: gleich viele Saetze wie bei der Abnahme — 1082',
      wordingNow.length === wordingThen.length && wordingNow.length === 1082,
      `${wordingThen.length} damals, ${wordingNow.length} heute (ohne die ` +
      `${WORDING_NEW.length} neuen und die weggenommenen)`);
    /* ZWEI SAETZE SIND ANDERE, UND BEIDE SIND BENANNT.
       `server.backupDirNotSet` NENNT die Umgebungsvariable, und die heisst
       seit 0.24.1 anders -- der Satz musste mitziehen, weil er sonst auf etwas
       zeigte, das es nicht mehr gibt.
       `card.partQuery` STAND BIS 0.30.3 HIER DANEBEN und steht seit 0.31.0
       nicht mehr: „&von=…&bis=…&teil=…" war kein Satz, sondern ein WEG, und
       genau deshalb ist der Schluessel mit Bauabschnitt 1 ganz gefallen. Er
       wird jetzt vom Stand von damals abgezogen (WORDING_GONE_TEXT_0310) und
       nicht mehr als geaendert gefuehrt -- eine Liste, die auf einen
       Schluessel zeigt, den es nicht mehr gibt, faerbte die Zeile darunter
       rot, und zwar zu Recht. */
    const WORDING_CHANGED_0243 = ['server.backupDirNotSet'];
    /* UND DREI MIT 0.25.4, jeder mit seinem Grund:
         `entry.tagQuote`        oeffnete ein Anfuehrungszeichen und schloss es
                                 nie -- am Bildschirm stand „Tag „Werkzeug".
                                 Der Wert geht unveraendert in ein `title`.
         `card.inDays`           bekommt die Mehrzahlform, die ihm gefehlt hat,
         `login.linkValidMinutes`  und den Zaehlwert, der sie ueberhaupt erst
                                 waehlen kann (`{n}` statt `{days}`/`{minutes}`).
       DIE BEIDEN MEHRZAHLPAARE STEHEN MIT ZWEI WERTEN IN `onlyNow` -- deshalb
       sind es dort sieben und hier drueben fuenf. */
    const WORDING_CHANGED_0254 = ['entry.tagQuote'];
    /* UND EINER MIT 0.26.0, und er ist ein Befund und keine Entscheidung:
       `card.withPhotos` hat beim Umbenennen der Bezeichner auf Englisch den
       Wert eines gleichlautenden Satzes bekommen -- „mit Fotos", OHNE die
       oeffnende Klammer, waehrend die drei Geschwister sie tragen. Am Knopf
       stand seither „mit Fotos 301,5 KB )". Der Auftrag kannte ihn nicht; er
       ist beim Bauen von Befund 3b aufgefallen. */
    const WORDING_CHANGED_0260 = ['card.withPhotos'];
    /* UND FUENF MIT 0.27.0, und alle fuenf aus DEMSELBEN Grund: der Lauf ueber
       den Bestand tut jetzt zweierlei, und die alten Woerter sagten nur das
       eine.
         card.formatsHint     „(JPEG)" wird „(WebP)" -- die Vorschaubilder
                              SIND jetzt WebP, und der Satz sagte, welches
                              Format da nicht mitgezaehlt wird
         card.convertRunning  vier Zeilen, die „Umwandlung" hiessen und jetzt
         card.convertFinished „Umstellung" heissen. „Umwandlung" beschrieb,
         card.convertDone     was mit einem PNG geschieht; der Lauf sieht seit
         card.convertProgress dieser Runde JEDE Fotozeile an und wandelt die
                              wenigsten davon um. Die Fortschrittszeile sagt
                              deshalb „angesehen" und nicht mehr nur eine Zahl.
       „Bestandslauf" WAERE DAS RICHTIGE WORT UND STEHT TROTZDEM NICHT DA: es
       ist ein Bild des Projekts, und die Wortprobe verbietet es am Bildschirm
       (SCREEN_BAN). Das ist keine Einschraenkung, sondern der Zweck jener
       Liste -- was drinnen ein Bild ist, muss draussen eine Sache sein. */
    const WORDING_CHANGED_0270 = ['card.formatsHint', 'card.convertRunning',
      'card.convertFinished', 'card.convertDone', 'card.convertProgress'];
    /* UND EINER MIT 0.28.0: `entry.addMediaHint` verliert seinen Halbsatz.
       „oder mit Strg+V einfuegen" nennt einen Griff, den es auf einem Telefon
       nicht gibt -- das Einfuegen selbst bleibt, es wird nur nicht mehr
       angesagt. EINE Fassung fuer beide Geraete und keine Weiche: zwei
       Fassungen waeren ein zweiter Schluessel in drei Sprachen und eine
       Abfrage nach dem Geraet, die von da an mitgepflegt werden muesste. */
    const WORDING_CHANGED_0280 = ['entry.addMediaHint'];
    /* UND EINER MIT 0.28.1: `list.sortTitle` verliert seine Klammer. „Titel
       (A → Z)" wird „Titel" -- die Richtung steht seit dieser Runde am
       Umschalter daneben und nicht mehr im Eintrag.
       ER STEHT NICHT IN `onlyNow`, UND DAS IST KEIN FEHLER: „Titel" gibt es
       in der Datei schon, es ist die Ueberschrift der Titelspalte
       (`list.title`). Der Satz ist also nicht NEU dazugekommen, sondern
       DOPPELT geworden -- und eine Liste mit `includes` kann ein zweites
       Vorkommen nicht sehen. Die Zeile darunter fragt ihn deshalb von der
       anderen Seite: der ALTE Wortlaut muss verschwunden sein. Das Doppelte
       selbst wird beim Rest weiter unten namentlich abgezogen. */
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
    /* UND VIERZEHN UND VIERZEHN SEIT 0.29.0 -- wieder einer mehr auf der Seite
       von damals und keiner hier, und aus demselben Grund wie bei „Titel":
       `entry.newCategoryHint` heisst nicht mehr „Neue Kategorie, Enter
       bestaetigt", sondern „Name". Der alte Wortlaut ist verschwunden; der
       neue stand schon da -- „Name" ist in der Datei kein neuer Satz, sondern
       ein zweites Vorkommen, und eine Liste mit `includes` kann das nicht
       sehen. Die Zeile darunter fragt ihn deshalb von der anderen Seite.
       WARUM ER UEBERHAUPT GEKUERZT WURDE: der Kategoriekasten misst seit
       Befund 7 EINE Zeile, und das Feld darin ist danach rund 100 px breit.
       „Neue Kategorie, Enter bestaetigt" braucht 254 -- und selbst das
       gekuerzte „Neue Kategorie" noch 124. Gemessen passt nur „Name". */
    const WORDING_CHANGED_0290 = ['entry.newCategoryHint'];
    /* UND ZWEI MIT 0.30.0 -- einer auf jeder Seite mehr, und beide haben einen
       Namen.
       `entry.whoRated` HEISST NICHT MEHR „Wer hat bewertet", SONDERN „Wer?"
       (Befund 7, F11). Gemessen ist der Grund: mit „⌀ 4,5 gewichtet" daneben
       passt ein Knopf bis 98 px in eine Zeile, ab 127 bricht sie; „Wer hat
       bewertet" misst 159, „Wer?" deren 67. Der alte Wortlaut ist damit
       verschwunden (einer mehr in `onlyThen`), der neue dazugekommen (einer
       mehr in `onlyNow`).
       `list.tagsCount` IST GANZ GEFALLEN -- „Tags ({length})" stand am
       Umschalter der Tagzeile, und den gibt es nicht mehr (F9). Er steht damit
       nur noch in der Abnahme: der DRITTE in `onlyThen`.
       `entry.weighted` IST NEU -- das Wort „gewichtet" stand bis 0.30.0 fest in
       public/app.js und in keiner Sprachdatei (Befund 10, F15). Es ist der
       DRITTE in `onlyNow`.
       FUENFZEHN UND FUENFZEHN: dreizehn von vorher, einer aus 0.29.0 und
       dieser eine -- auf jeder Seite dieselbe Rechnung.
       `list.tagsCount` UND `entry.weighted` STEHEN HIER NICHT: der eine ist
       ganz gefallen und wird vom Stand von damals abgezogen
       (WORDING_GONE_TEXT_0300), der andere ist ein NEUER Schluessel und steht
       in WORDING_NEW_0300. Nur der WORTLAUT eines bleibenden Schluessels
       gehoert in diese Liste -- und das ist `entry.whoRated`. */
    const WORDING_CHANGED_0300 = ['entry.whoRated'];
    /* UND VIERUNDSIEBZIG MIT 0.31.0 -- die Runde, die die Sprachdateien
       gegenliest. Sie stehen in DREI Listen, weil drei verschiedene Gruende
       sie bewegt haben; eine gemeinsame Liste verloere genau diese Auskunft.

       SIEBENUNDDREISSIG AUS DER WORTTAFEL (Bauabschnitt 2, Tafeln A bis E).
       Das ist die Entscheidung der Runde: „konvertieren" statt „umstellen",
       „Suchtreffer" statt „Fundstelle", „Video-Vorschaubild" statt
       „Standbild", „Auto" statt „Wie das Gerät", und die Fehlermeldungen
       sagen den Grund knapp und den Ausweg immer.
       ZWOELF WEITERE DER TAFEL STEHEN HIER NICHT, und das ist kein
       Uebersehen: sie sind Schluessel, die eine spaetere Runde erst
       eingefuehrt hat (`card.storeCaveat` und Geschwister aus 0.27.0,
       `card.languagesFileAfter` aus 0.24.3, `card.emailsDoubledHint` aus
       0.29.0, `server.nameOriginalStays` aus 0.25.0). Sie stehen in
       WORDING_NEW und werden dort gar nicht erst verglichen -- der Stand von
       0681d42 kennt sie nicht.

       FUENF ERZWUNGENE NACHZIEHER (Befund 1 der Runde). Der Auftrag nennt sie
       nicht; seine eigenen Entscheidungen ziehen sie: `card.convertProgress`
       heisst „Konvertierung läuft — …", und `card.convertRunning`,
       `card.convertFinished` und `card.convertDone` sind DIESELBE Zeile
       (`id="convert-running"`) in ihren anderen Zustaenden -- sie haetten
       sonst „Umstellung" gesagt, waehrend eine Sekunde spaeter
       „Konvertierung" dastand. `server.convertRunning` ist die Absage an
       denselben Lauf, `card.themeHint` zitiert die Beschriftung, die F3 in
       „Auto" umbenennt.
       ZWEI WEITERE NACHZIEHER STEHEN HIER NICHT, aus demselben Grund wie
       oben: `card.catchUpStore` und `card.derivativesAsk` sind Schluessel aus
       0.27.0 und stehen in WORDING_NEW.

       ZWEIUNDDREISSIG WEGEN DES ANFUEHRUNGSZEICHENS (Bauabschnitt 3). An
       ihnen aendert sich KEIN Wort -- nur das schliessende Zeichen ist aus
       einem geraden `"` ein typografisches `“` geworden. Sie stehen trotzdem
       hier und nicht in einer Sammelzeile: verglichen werden Saetze Zeichen
       fuer Zeichen, und ein Zeichen ist ein Zeichen. */
    /* `list.pillHint` STAND HIER BIS 0.32.0 AN ERSTER STELLE und ist mit
       0.32.1 gefallen -- er erklaerte die Filterableitung, und die gibt es
       nicht mehr. Ein Eintrag, der auf einen Schluessel zeigt, den es nicht
       mehr gibt, faerbte die Zeile darunter rot, und zwar zu Recht. */
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
       `card.potentialHint` aus dem Anfuehrungszeichen. Alle drei sind mit
       0.31.1 GANZ gefallen -- ihr Satz ist in seinen Nachbarn hineingezogen
       worden. Ihr Wortlaut von 0681d42 wird jetzt vom Stand von damals
       abgezogen (WORDING_GONE_TEXT_0311) und nicht mehr als geaendert
       gefuehrt.
       DERSELBE GRIFF WIE BEI `card.partQuery` IN 0.31.0, und aus demselben
       Grund: eine Liste, die auf einen Schluessel zeigt, den es nicht mehr
       gibt, bricht die Zeile darunter ab -- `Object.values(undefined)`. Genau
       das ist beim Bauen passiert. */
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
    /* UND ACHTUNDSECHZIG MIT 0.31.1. Sie BEHALTEN ihren Namen und bekommen
       einen anderen Wortlaut -- meistens, weil die zweite Haelfte ihres
       Satzes in sie hineingezogen worden ist („Willkommen," + Name +
       „— bitte ein Passwort waehlen." wird EIN Satz mit `{word}` darin).
       DREI SIND ETWAS ANDERES, und sie stehen hier nicht anders da, weil die
       Zeile Saetze zaehlt und keine Gruende -- benannt sind sie trotzdem:
         card.tagDeleteHint    das „und" zwischen den beiden Zahlen stand fest
         card.thumbsRefreshed  „mehr" und „weniger" standen fest
         card.marksGoneToo     traegt den ganzen Satz statt seines Nachsatzes
       Die ersten beiden sind BEFUNDE dieser Runde: in einer englisch
       eingestellten Instanz stand dort deutscher Text. Damit aendert sich
       auch en/tr an genau diesen Stellen -- die einzigen der Runde. */
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
      /* `list.and` UND `list.commentCount` STANDEN HIER BIS 0.32.0. 0.31.1 hat
         beiden etwas beigegeben -- dem Bindewort die Leerzeichen genommen,
         dem Zaehlsatz den Platz `{of}` gegeben. 0.32.1 nimmt das Bindewort
         ganz (die Zaehlzeile bindet nichts mehr zusammen) und gibt dem
         Zaehlsatz seinen Wortlaut von der Abnahme zurueck. Ein Eintrag, der
         auf einen gefallenen Schluessel zeigt, bricht die Zeile ab; einer,
         der einen Unterschied benennt, den es nicht mehr gibt, deckt beim
         naechsten Mal einen, den es gibt. */
      "entry.weightsWhere",
      "list.searchOffline", "list.searchingShort", "list.visibleCount",
      "login.newPasswordFor", "login.noPhoneHint", "login.requestAccessHint",
      "login.welcome", "mail.hintAlways", "mail.hintGmx",
      "server.entryTooBig", "server.exportGrew", "server.exportTooBig"];
    /* UND EINER MIT 0.31.2 -- der einzige deutsche Wert, den jene Runde
       angefasst hat, und zwar auf Bestellung des Betreibers am 13. September
       2026: „Zugang beantragen" heisst „Zugang anfragen". Das ganze Wortfeld
       sagt in allen drei Sprachen „Anfrage" (`login.sendRequest`,
       `card.openRequests`, „Send request", „Başvuruyu gönder") -- dieses eine
       Label war der Ausreisser.
       `login.requestAccessHint` STEHT SCHON IN DER LISTE VON 0.31.1 und kommt
       hier NICHT ein zweites Mal: sein Wortlaut aendert sich erneut, aber die
       Zeile zaehlt Schluessel und nicht Handgriffe -- er ist gegen 0681d42
       einmal anders, nicht zweimal. */
    const WORDING_CHANGED_0312 = ["login.requestAccess"];
    /* UND DREIZEHN MIT 0.32.0. Sie haben drei Herkuenfte, und jede steht im
       Auftrag dieser Runde:

       ACHT AUS STRANG 2 -- „Note" wird das fuenfzehnte Vokabelwort, und wo das
       Wort fest im Satz stand, steht jetzt `{grade}`:
         entry.grade · entry.gradeLabel · entry.calcGradeWeight ·
         entry.gradeReplaced · list.lastGrade · list.gradeLong ·
         list.gradeShort · server.gradeRange
       ZWEI WEITERE DERSELBEN SACHE STEHEN HIER NICHT: `list.sortAvg` und
       `list.sortLast` sind Schluessel aus 0.28.1 und stehen in
       WORDING_NEW_0281 -- der Stand von 0681d42 kennt sie gar nicht. Ihre
       Beschriftung wird dabei ARTIKELLOS („Durchschnitt: {grade}", „Zuletzt:
       {grade}"): ein freies Wort duldet kein Adjektiv vor sich, und
       „Durchschnittsnote" waere ausserdem ein zusammengesetztes Vokabelwort
       (Leitplanke L6).

       VIER AUS PUNKT 28 des Sammelblatts -- die deutschen Funde aus dem
       englischen Durchgang von 0.31.2, die dort nicht angefasst werden
       durften („kein deutscher Wert wird angefasst"):
         card.restartHint      zitierte eine Logzeile, die es so nicht gibt --
                               „Schlüssel" gegen keys.js: „Schluessel"
         server.deniedOwnUser  schickte an eine Karte „Zugang", die es nicht
                               gibt -- sie heisst „Mein Konto"
         server.ruleKeep       nannte das Feld „Immer behalten", die Karte
                               beschriftet es „Mindestens behalten"
         server.ruleDays       nannte es „Erst löschen ab", die Karte
                               „Löschen ab Alter"
       BEI 3 UND 4 FOLGT DEUTSCH DER OBERFLAECHE UND NICHT DEM WORTLAUT --
       dieselbe Entscheidung, die auf der englischen Seite in 0.31.2 schon
       gefallen ist („Keep at least", „Delete when older than", in
       Anfuehrungszeichen).
       FUND 5 JENES PUNKTES STEHT NICHT HIER: `card.itemOne` und
       `card.itemMany` tragen seit dieser Runde wieder ihre Sache („Das
       Bewertete, Einzahl") -- sie sind gegen 0681d42 aber schon einmal anders
       gewesen und stehen deshalb in CHANGED_TABLE_0310. Die Zeile zaehlt
       SCHLUESSEL und keine Handgriffe.

       UND EINER AUS BAUABSCHNITT 9:
         list.followsSort      sagt jetzt auch, WAS abgeleitet wird („folgt
                               der Sortierung: Getestet") und nicht nur, DASS.
       `list.pillHint` GEHOERT DAZU UND STEHT AUS DEMSELBEN GRUND NICHT HIER:
       er ist seit 0.31.0 anders und bleibt in CHANGED_TABLE_0310. */
    const WORDING_CHANGED_0320 = [
      'entry.grade', 'entry.gradeLabel', 'entry.calcGradeWeight',
      'entry.gradeReplaced', 'list.lastGrade', 'list.gradeLong',
      'list.gradeShort', 'server.gradeRange',
      'card.restartHint', 'server.deniedOwnUser', 'server.ruleKeep', 'server.ruleDays'];
    /* `list.followsSort` STAND HIER BIS 0.32.0 als vierzehnter -- 0.32.0 hat
       ihm den WERT beigegeben („folgt der Sortierung: Getestet"). 0.32.1 hat
       ihn ganz genommen; er steht jetzt in WORDING_GONE_0321, und sein
       Wortlaut von damals wird oben abgezogen. */
    /* FUENFUNDACHTZIG SEIT 0.31.0, VORHER FUENFZEHN -- und die siebzig mehr
       sind die Runde selbst: siebenunddreissig aus der Worttafel, fuenf
       erzwungene Nachzieher und zweiunddreissig, an denen nur das
       schliessende Anfuehrungszeichen umgezogen ist (WORDING_CHANGED_0310).
       AUF BEIDEN SEITEN DIESELBE ZAHL, und das ist die eigentliche Auskunft:
       zu jedem neuen Wortlaut steht drueben genau ein alter, der verschwunden
       ist. Waere es nicht so, haette diese Runde einen Satz hinzugefuegt oder
       weggenommen -- und beides waere etwas anderes als „gegenlesen". */
    /* HUNDERTFUENFUNDVIERZIG UND HUNDERTDREIUNDVIERZIG MIT 0.31.1, vorher
       fuenfundachtzig und fuenfundachtzig -- und die beiden Zahlen sind zum
       ersten Mal VERSCHIEDEN. Das hat einen Namen und ist kein Rutsch:

       SECHZIG SAETZE MEHR AUF BEIDEN SEITEN sind die achtundsechzig
       geaenderten Schluessel (Mehrzahlpaare zaehlen einmal je Zweig, und
       sechs von ihnen waren schon in einer frueheren Runde geaendert -- ihre
       Zwischenfassung verlaesst `onlyNow` und ihre neue tritt ein).

       UND ZWEI MEHR AUF DER SEITE VON DAMALS: „E-Mail ist optional." und
       „und" gab es in der Datei SCHON, unter einem anderen Schluessel. Der
       alte Wortlaut der beiden verschwindet, der neue ist kein neuer Satz,
       sondern ein ZWEITES VORKOMMEN -- und eine Liste mit `includes` kann das
       nicht sehen. Genau dasselbe ist 0.28.1 mit „Titel" passiert und 0.29.0
       mit „Name"; dort ging es auf, weil ein Mehrzahlpaar aus 0.25.4 die
       Rechnung auf der anderen Seite ausglich. Hier gleicht sie nichts aus,
       und darum stehen zwei verschiedene Zahlen da statt einer geschoenten.
       DIE EIGENTLICHE ABNAHME IST DIE ZEILE DARUNTER: der REST ist Satz fuer
       Satz derselbe. */
    /* 146 UND 144 WURDEN 159 UND 157 MIT 0.32.0 -- dreizehn mehr auf jeder
       Seite, und sie haben Namen: WORDING_CHANGED_0320. Der Abstand von zwei
       bleibt, und das ist die eigentliche Auskunft: zu jedem neuen Wortlaut
       steht drueben genau ein alter, der verschwunden ist. */
    /* 159 UND 157 WURDEN 157 UND 155 MIT 0.32.1 -- ZWEI WENIGER auf jeder
       Seite, und das ist zum ersten Mal seit 0.31.1 die Richtung nach unten.
       Sie rechnen sich so:
         −2  `list.followsSort` und `list.pillHint` sind ganz gefallen. Ihr
             Wortlaut von damals wird jetzt abgezogen (WORDING_GONE_TEXT_0321)
             statt als geaendert gefuehrt.
         −2  `list.commentCount` steht wieder GENAU so da wie bei der Abnahme:
             „{n} Kommentar" / „{n} Kommentare". 0.31.1 hatte ihm den Platz
             `{of}` fuer das „, davon ..." beigegeben, und 0.32.1 nimmt ihn
             wieder weg -- ein Mehrzahlpaar zaehlt flach zwei, also zwei auf
             jeder Seite. EIN SATZ, DER ZURUECKKOMMT, IST KEIN GEAENDERTER.
         +1  `entry.noDaysYet` sagt jetzt `{grade}` statt „Note" -- das
             fuenfzehnte Vokabelwort stand seit 0.32.0 da und in diesem einen
             Satz trotzdem fest.
         +1  `server.deniedEntry` nennt den Eintrag nicht mehr beim Wort.
       `server.ratingBeforeTest` AENDERT SICH EBENFALLS, zaehlt hier aber
       nicht: er stand schon in CHANGED_QUOTE_0310 und war damit auf beiden
       Seiten bereits gezaehlt. Die Zeile zaehlt SAETZE und keine Handgriffe.
       `card.potentialModeHint` UND `entry.dueHint` ZAEHLEN GAR NICHT MIT: sie
       sind nach der Abnahme entstanden und stehen in WORDING_NEW -- was dort
       steht, wird hier nicht verglichen. */
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
         ihm den Wert beigegeben. 0.32.1 nimmt den Schluessel ganz, und sein
         Wortlaut von damals wird abgezogen: er darf jetzt auf KEINER der
         beiden Seiten mehr stehen. */
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
    /* UND SONST KEIN ZEICHEN. Die eine Ausnahme wird aus BEIDEN Listen
       genommen, und was bleibt, muss Satz fuer Satz dasselbe sein -- nicht
       „ungefaehr gleich viele", sondern derselbe Wortlaut. */
    /* UND EIN SATZ WIRD ZUSAETZLICH ABGEZOGEN -- 0.28.1, und zwar aus der
       Liste von HEUTE. „Titel" steht dort seit dieser Runde ZWEIMAL: einmal
       als Ueberschrift der Spalte, einmal als Sortierwort. Beide Listen sind
       Satz fuer Satz gleich, sobald das zweite Vorkommen weg ist -- und es
       muss NAMENTLICH weg, sonst deckte ein `length`-Vergleich hier jede
       kuenftige Doppelung zu.
       ER GEHT DURCH `withoutOne` UND NICHT DURCH `filter`: das erste „Titel"
       soll ja bleiben. */
    const WORDING_DOUBLED_0281 = ['Titel'];
    /* UND EIN ZWEITER MIT 0.29.0, aus demselben Grund: „Name" steht seit dem
       gekuerzten Platzhalter ZWEIMAL in der Datei. Beide Listen sind Satz fuer
       Satz gleich, sobald das zweite Vorkommen weg ist -- und es muss
       NAMENTLICH weg, sonst deckte ein `length`-Vergleich hier jede kuenftige
       Doppelung zu. */
    const WORDING_DOUBLED_0290 = ['Name'];
    const restThen = onlyThen.reduce(withoutOne, wordingThen);
    const restNow = [...WORDING_DOUBLED_0281, ...WORDING_DOUBLED_0290].reduce(withoutOne,
      onlyNow.reduce(withoutOne, wordingNow));
    /* 1102 SEIT 0.31.0, vorher 1183: elf Werte sind ganz gefallen (die
       Code-Lecks) und siebzig Saetze sind andere geworden -- beide stehen auf
       beiden Seiten nicht mehr im Rest, sondern in den Listen darueber.
       Die Zahl steht ausdruecklich da: ein Vergleich ohne sie bliebe gruen,
       wenn beide Listen zugleich schrumpfen.
       UND DIESE ZEILE IST DIE EIGENTLICHE ABNAHME DER RUNDE: was NICHT in der
       Worttafel steht, ist Zeichen fuer Zeichen der Stand von 0681d42 --
       elfhundertzwei Saetze, die niemand angefasst hat. */
    /* 1102 WURDEN 944 MIT 0.31.1: achtundneunzig Werte sind ganz gefallen
       (die Haelften der verschmolzenen Saetze) und sechzig Saetze sind andere
       geworden -- beide stehen auf beiden Seiten nicht mehr im Rest, sondern
       in den Listen darueber.
       UND DIESE ZEILE BLEIBT DIE EIGENTLICHE ABNAHME DER RUNDE: was die Runde
       nicht angefasst hat, ist Zeichen fuer Zeichen der Stand von 0681d42 --
       neunhundertvierundvierzig Saetze. */
    /* 944 WURDEN 943 MIT 0.31.2: ein einziger Satz mehr steht in den Listen
       darueber statt im Rest -- „Zugang beantragen", vom Betreiber bestellt.
       DIE ZEILE BLEIBT DIE EIGENTLICHE ABNAHME: was niemand bestellt hat, ist
       Zeichen fuer Zeichen der Stand von 0681d42. */
    /* 943 WURDEN 929 MIT 0.32.0: dreizehn Saetze mehr stehen in den Listen
       darueber statt im Rest, und einer ist ganz gefallen („anderer
       Benutzer"). DIE ZEILE BLEIBT DIE EIGENTLICHE ABNAHME: was diese Runde
       nicht angefasst hat, ist Zeichen fuer Zeichen der Stand von 0681d42 --
       neunhundertneunundzwanzig Saetze. */
    /* 929 WURDEN 925 MIT 0.32.1: vier Saetze sind ganz gefallen, ohne dass
       ein anderer an ihre Stelle traete -- `list.and`, `list.ofWhich`,
       `list.sortDefaultHint` und `entry.deleteWord`. Die beiden uebrigen der
       Runde (`list.followsSort`, `list.pillHint`) standen schon vorher in den
       Listen darueber und nicht im Rest.
       DIE ZEILE BLEIBT DIE EIGENTLICHE ABNAHME: was diese Runde nicht
       angefasst hat, ist Zeichen fuer Zeichen der Stand von 0681d42 --
       neunhundertfuenfundzwanzig Saetze. */
    check('Und sonst kein Zeichen — Satz fuer Satz dieselbe Oberflaeche',
      equal(restThen, restNow) && restNow.length === 925,
      `${restThen.filter((x, i) => x !== restNow[i]).length} abweichende von ${restNow.length}`);

    /* ---- 6. Die Kuerzeprobe ---------------------------------------------
       KEIN SCHLUESSEL TRAEGT EINE ANGEHAENGTE ZIFFER. Aus `hinweis2` wurde
       nie ein Name, sondern eine Nummerierung -- und eine Nummerierung sagt
       nicht, WAS der Satz ist. Acht Schluessel tragen trotzdem eine Ziffer,
       und bei allen sechsen ist sie die SACHE: 50 MB und Schritt 1. */
    /* ZWEI SEIT 0.31.1, VORHER SECHS, DAVOR ACHT -- und jedes Mal aus
       demselben Grund: die Ziffer war die SACHE, und die Sache war keine
       Sprache. `list.px10`/`px20` fielen mit 0.31.0 (ein Pixelmass),
       `card.mb50` bis `mb300` mit 0.31.1 (eine Zahl und eine Einheit, in
       allen drei Dateien gleich -- die Beschriftung wird jetzt aus dem
       `value` gerechnet).
       WAS BLEIBT, SIND DIE BEIDEN SCHRITTE. Dort ist die Ziffer wirklich die
       Sache: Schritt 1 und Schritt 2 sind zwei verschiedene Dinge. */
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
    /* BIS 0.31.0 STAND HIER EIN NAME: `backupUnopenableHint`. Seit 0.31.1
       erreicht ein zweiter dieselbe Laenge (`backupDirOutsideHint`), und
       welcher von beiden aus dem Vergleich faellt, entscheidet die
       alphabetische Folge -- nicht der Gegenstand dieser Zusage. Eine Zusage,
       die an einer solchen Zufaelligkeit haengt, wird rot, ohne dass sich
       etwas geruehrt haette (Stolperstein 81).
       GEPRUEFT WIRD JETZT DIE LATTE SELBST: zwanzig Zeichen, und die vier
       Zeichen Luft bis zur Grenze von vierundzwanzig bleiben. */
    check('Und der laengste Schluesselname bleibt unter der Latte',
      longestKey.length === 20,
      `${longestKey} (${longestKey.length})`);
  }

  /* ================= Zugeklappt heisst: die ERSTEN Zeilen — 0.24.1 =========
     Aus dem Betrieb am 7. September 2026, mit zwei Bildern gemeldet: der Block
     „Links" zeigte zugeklappt die Nummern 4 bis 8 von acht und nicht 1 bis 5.
     DIE URSACHE WAR EINE STELLUNG, DIE NIEMAND ZURUECKSETZTE: das Hinzufuegen
     eines Links scrollt den Kasten ans Ende, danach klemmt `limitLinks()` ihn
     auf `LINK_ROWS` Zeilen -- und der geklemmte Kasten behielt die Stellung.
     Der Bildlauf steht dort auf `hidden`, also war sie von aussen auch nicht
     mehr zu aendern.
     GEPRUEFT WIRD AM QUELLTEXT und nicht am Verhalten: jsdom rechnet keine
     Hoehen, `offsetHeight` ist dort null, und eine Klemme, die nie greift,
     belegt nichts. Dieselbe Bauform wie bei den anderen Waechtern ueber
     public/app.js. */
  group('Zugeklappt heisst: die ersten Zeilen — 0.24.1');
  {
    const zzApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    const zzLimit = (zzApp.match(/function limitLinks\(\)[\s\S]*?\n  \}/) || [''])[0];
    check('Es gibt die Klemme ueberhaupt', zzLimit.length > 200, `${zzLimit.length} Zeichen`);
    check('Der geklemmte Kasten steht am Anfang der Liste',
      /box\.style\.overflowY = 'hidden';[\s\S]{0,900}?box\.scrollTop = 0;/.test(zzLimit),
      (zzLimit.match(/box\.scrollTop = [^\n]*/g) || ['(keine Stellung gesetzt)']).join(' · '));
    /* UND DIE GEGENLAGE: der Weg, der die Stellung ueberhaupt erst setzt, fragt
       vorher nach der Klemme. Ohne diese Zeile liefe das Zuruecksetzen
       augenblicklich ins Leere -- `drawLinks()` laeuft VOR dem Bildlauf. */
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
     Vorgabesprache ausdruecklich hin.

     ALLE DREI SIND MIT 0.33.0 GEFALLEN -- es waren drei der SECHS, die der
     Auftrag „nicht gezaehlt" nennt: ihre Absage stand im BLOCKKOMMENTAR und
     nicht auf einer eigenen Kommentarzeile, und genau deshalb hat der Zaehler
     sie nie gesehen.

     WAS BLEIBT, IST DIE HAELFTE, DIE NIE AN DER MIGRATION HING: liest der
     Quelltext wirklich die NEUEN Namen? Das war die eigentliche Zusage jener
     Runden -- 0.24.1 ist daran gescheitert, dass umbenannt und nicht
     nachgelesen wurde, und der Betreiber fand es im Betrieb. Diese Frage ist
     vom Wegfall der Bloecke voellig unberuehrt, und sie bleibt darum stehen.

     UND EINE ZWEITE HAELFTE KOMMT DAZU: eine frische Installation bekommt
     KEINE Vorgabesprache mehr geschrieben und spricht damit Englisch. Bis
     0.32.1 war das die Gegenlage zum Block; jetzt ist es der einzige Fall,
     den es noch gibt -- der Block, der einem gewachsenen Bestand Deutsch
     hinschrieb, ist fort.

     GEPRUEFT WIRD WEITER AN EINER ECHTEN INSTANZ und nicht nur am Quelltext:
     eine Datenbank, EIN Start, und danach steht da, was dasteht. */
  group('Die gespeicherten Namen der 0.24er Runde — umgedreht');
  {
    const gfDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'kriterion-formen-'));
    const gfFile = path.join(gfDirectory, 'katalog.sqlite');
    shortRun(`require('./db'); console.log('angelegt');`, gfDirectory);

    /* DER GESTELLTE BESTAND IST DERSELBE GEBLIEBEN: eine Instanz auf dem
       Stand 0.24.0, mit den ALTEN Schluesseln und den ALTEN Feldnamen darin.
       NUR DIE ZUSAGE IST DIE UMGEKEHRTE -- es zieht nichts mehr um. */
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
    /* UND EIN START ZIEHT NICHTS MEHR NACH -- das ist die umgedrehte Zusage.
       WAS DABEI NICHT GESCHIEHT, IST DER EIGENTLICHE PUNKT: nichts wird
       WEGGEWORFEN. Die Zeilen liegen unveraendert da, und der Quelltext liest
       an ihnen vorbei -- genau der Befund von 0.24.1, nur dass es nach der
       Voraussetzung dieser Runde keine solche Instanz mehr gibt. */
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
    /* UND DIE INSTANZ KOMMT DABEI HOCH. Ein Bestand mit alten Feldnamen ist
       nach dieser Runde ein UNGELESENER Bestand und kein toter -- Leitplanke
       L3 gilt auch hier. */
    check('Und die Instanz kommt trotzdem hoch', /gestartet/.test(gfSay),
      gfSay.replace(/\n/g, ' · ').slice(0, 300));
    fs.rmSync(gfDirectory, { recursive: true, force: true });

    /* ZULETZT DIE ZIELE GEGEN DEN QUELLTEXT, DER SIE LIEST -- und DIESE
       Haelfte ist unveraendert geblieben. Ein Ziel, das der Quelltext gar
       nicht liest, waere ein Umbenennen ins Leere; genau daran ist 0.24.1
       gescheitert, und der Waechter dagegen bleibt stehen, auch wenn die
       Migration fort ist. */
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
    /* UND DIE DREI TAFELN GIBT ES NICHT MEHR. Sie waren der Grund, warum der
       Namenswaechter bis 0.32.1 eine Ausnahmeliste fuer sechs deutsche
       Bezeichner brauchte (`vorlage`, `anbieter`, `benutzer`, `passwort`,
       `absender`, `marke`, allesamt aus SHAPES_0242). Mit den Bloecken faellt
       die Ausnahme -- und dass sie wirklich faellt, haelt die Namensprobe
       weiter unten fest. */
    const gfDb = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
    check('Und die drei Tafeln der 0.24er Runde stehen nicht mehr in db.js',
      !/SHAPES_0242|STORED_0243|VOCABULARY_FIELDS_0243|FILTER_FIELDS_0243/.test(gfDb),
      (gfDb.match(/SHAPES_0242|STORED_0243|VOCABULARY_FIELDS_0243|FILTER_FIELDS_0243/g) || [])
        .join(' · ') || 'keine mehr da');
  }

  /* ========= Die Vorgabesprache — 0.24.3, umgedreht ======================
     DER BLOCK SCHRIEB EINEM GEWACHSENEN BESTAND SEINE SPRACHE HIN: gab es
     schon Zugaenge, als diese Fassung zum ersten Mal hochkam, blieb es bei
     Deutsch; eine frische Installation startete auf Englisch. Er ist mit
     0.33.0 gefallen, und was bleibt, ist die Auslieferung: WER NICHTS
     EINGESTELLT HAT, SPRICHT ENGLISCH.
     DASS DAS FUER EINEN GEWACHSENEN BESTAND DIE AENDERUNG IST, GEHOERT
     GESAGT: eine Instanz, die vor 0.24.3 deutsch lief und ihre Zeile bekommen
     hat, behaelt sie -- die Zeile steht ja. Nur eine, die sie NIE bekommen
     hat, spraeche jetzt Englisch. Nach der Voraussetzung dieser Runde gibt es
     keine solche: unter 0.33.0 hat nie jemand anders gestanden. */
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
       ist die umgedrehte Zusage. Bis 0.32.1 stand danach `"de"` in der
       Ablage; jetzt steht dort nichts, und das ist die Auslieferung. */
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
    /* UND WER SIE GESETZT HAT, BEHAELT SIE. Das ist die Haelfte, die weiter
       gilt: eine Instanz, die Deutsch eingestellt hat, bekommt es beim
       naechsten Start nicht weggenommen -- weder von einem Block noch von
       seinem Wegfall. */
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
     mit welcher Version die Datenbank betrieben wurde? … Generell fuer die
     Zukunft waere es gut, wenn direkt erkennbar waere, mit welcher Version
     das betrieben wurde."*

     NACHGESEHEN UND NICHT VERMUTET: an keiner der drei Stellen stand etwas.
     In der Datenbank kein `user_version` und keine Zeile in `settings`; in
     der Exportdatei nur die FORMATNUMMER, und der Import las sie nie; die
     Sicherung ist eine Kopie der Datei und erbt dieselbe Luecke.

     ER BEANTWORTET EINE ANDERE FRAGE ALS DIE PROBE AUF `sqlite_master`, und
     die beiden gehoeren deshalb zusammen: die Probe sagt „IST ES
     VOLLSTAENDIG?", der Stempel sagt „WAS IST ES?". Ohne ihn kennt der
     Hinweis nur das Symptom und nicht die Diagnose.

     UND ER WIRKT NUR NACH VORN. Eine Datenbank, die nie einen getragen hat,
     bekommt ihn nicht rueckwirkend -- deshalb ERSETZT er die Probe nicht,
     sondern ergaenzt sie. */
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
    /* UND DER ZWEITE START AENDERT NICHTS UND SAGT NICHTS. Beide Schreibungen
       sind beliebig oft fahrbar und im Normalfall stumm -- dieselbe Bauform
       wie renumberCriteria() daneben. */
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
    /* UND „ANGELEGT MIT" RUEHRT SICH DABEI NICHT. Sie steht EINMAL da und wird
       nie wieder angefasst -- sonst saehe jede Datenbank so aus, als waere sie
       gestern entstanden. */
    check('Und „angelegt mit" ruehrt sich dabei nicht',
      stRead(stDir, 'versionCreated') === stVersion,
      JSON.stringify(stRead(stDir, 'versionCreated')));
    fs.rmSync(stDir, { recursive: true, force: true });

    /* UND EIN GEWACHSENER BESTAND BEKOMMT „ANGELEGT MIT" GAR NICHT. Das ist
       der teure Teil dieses Stempels und der Grund, warum er nicht einfach
       ein `INSERT OR IGNORE` bei jedem Start ist: eine Datenbank aus 0.19.0
       truege damit „angelegt mit 0.33.0", und das waere eine ERFINDUNG ueber
       fremde Arbeit. EINE FEHLENDE ZEILE IST DIE RICHTIGE ANTWORT und heisst
       „aelter als der Stempel". */
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

    /* UND DER STEMPEL IST KEIN MERKER FUER DIE PROBE. Das ist die Grenze
       zwischen den beiden, und sie steht hier, weil sie leicht verwischt:
       `incompleteDatabase()` liest ihn NICHT -- sie fragt `sqlite_master`
       (Leitplanke L4, Zusage 5). Gelesen wird der Quelltext der Probe. */
    const stDb = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
    const stProbe = stDb.slice(stDb.indexOf('function incompleteDatabase()'),
                               stDb.indexOf('function warnIncompleteDatabase('));
    check('Die Probe liest den Stempel nicht — sie fragt sqlite_master',
      /sqlite_master/.test(stProbe) && !/version(Created|LastOpened)/.test(stProbe) &&
      !/user_version/.test(stProbe),
      stProbe.slice(0, 200));
    /* UND DIE EXPORTDATEI TRAEGT DIE PROGRAMMFASSUNG NEBEN DER FORMATNUMMER --
       Zusage 14. Zwei Fragen, zwei Felder: `version` sagt, WELCHE FELDER zu
       erwarten sind, `appVersion` sagt, WAS die Datei geschrieben hat. */
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
     Verbotsliste aus dem Konzept 0.22.0, Abschnitt 4.3. Der Leser steht oben
     im Modul (screenTextsFrom), die Liste daneben (SCREEN_BAN). */
  group('Der Bildschirmtext-Waechter — 0.22.0');
  {
    /* ERST DER LESER SELBST, an gestellten Faellen: ein Waechter, dessen Leser
       Kommentare fuer Text haelt, meldet Falsches; einer, der Text fuer Code
       haelt, meldet nichts. Beides waere ein Waechter, den man abschaltet. */
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
       Ruhe. Ohne diese Zeilen bliebe ein Waechter mit leerer Liste gruen
       (Stolperstein 81). */
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
       sonst belegte „kein Verstoss" nichts.
       SEIT 0.24.0 LIEST DER WAECHTER DIE SPRACHDATEI -- dort wohnt der Text
       (Auftrag 3.3). Ueber app.js laeuft er weiter, solange dort noch Saetze
       stehen; ein Schluessel wie „card.fingerprint" ist keiner
       davon und faellt heraus. Dass er app.js wirklich noch liest, haelt die
       Gegenprobe 625 fest -- sie schreibt einen Satz zurueck. */
    const btApp = screenTextsFrom(fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8'))
      .filter(t => !isKey(t.text));
    /* DER SERVERTEXT-WAECHTER DREHT SICH UM -- 0.24.0, Bauabschnitt 2. Bis
       dahin ZAEHLTE er die Meldungen im Quelltext („mehr als hundert"); jetzt
       haelt er fest, dass dort KEINE mehr steht. Die Zahl steht nicht weniger
       fest, sie steht nur woanders: gezaehlt werden die server.*- und
       login.*-Schluessel in de.json.
       DIE UNTERGRENZE BLEIBT EINE ZAHL. Ein Waechter, der nur „null Literale"
       sagt, waere auch dann gruen, wenn jemand die Sprachdatei leerte. */
    /* WAS HINTER `error:` NOCH STEHEN DARF: ein SCHLUESSEL („server.tagGone")
       und ein BEZEICHNER („deleted", der Status in einem Vergleich). Beides
       ist kein Text, den ein Mensch liest -- den Text dazu liest der Waechter
       eine Zeile tiefer in de.json. Alles andere ist ein Literal, das nicht
       umgezogen ist. Die beiden Filter stehen weiter oben, bei btApp. */
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
       sieht seit 0.24.0 auch, was aus app.js und mail.js dorthin gezogen ist.
       EIN PLATZHALTERNAME IST KEIN BILDSCHIRMTEXT: `{nachgezogen}` in
       „erneuert: {nachgezogen} von {geprueft} geprüften" ist der Name einer
       Zahl, kein Wort, das jemand liest. Er faellt vor der Pruefung heraus --
       sonst faerbte sich die Verbotsliste an einem Bezeichner. */
    const btDe = Object.entries(spDe).filter(([k]) => k !== '_locale')
      .flatMap(([k, v]) => (typeof v === 'string' ? [v] : Object.values(v))
        .map(text => ({ text: text.replace(/\{[^}]*\}/g, ' '), row: k,
                        file: 'public/languages/de.json' })));
    check('Die Sprachdatei traegt mehr als achthundert lesbare Texte',
      btDe.filter(t => !isAddress(t.text)).length > 800, `${btDe.length} Texte`);
    /* NULL DEUTSCHE SAETZE IN `throw new Error` IN auth.js -- der blinde Fleck
       des Waechters faellt damit von selbst: was auth.js wirft, ist ein
       Schluessel, und den Text liest der Waechter in de.json.
       WAS `new Error` BLEIBT, IST EIN PROGRAMMIERFEHLER OHNE BILDSCHIRM, und
       die Liste dieser Stellen steht NAMENTLICH hier -- eine Zahl allein
       liesse offen, welche gemeint sind. */
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
    // Und der Gegenstand dazu: die neun Programmierfehler stehen wirklich noch
    // da. Ohne diese Zeile waere die Zeile darueber auch dann gruen, wenn
    // jemand ALLE Wuerfe entfernte (Stolperstein 81).
    check('Und die neun Programmierfehler ohne Bildschirm stehen namentlich da',
      authThrows.length === 10 && withoutScreen.every(o => authThrows.some(w => w.startsWith(o))),
      `${authThrows.length} Wuerfe: ${authThrows.join(' · ').slice(0, 160)}`);
    const vApp = screenViolations(btApp);
    check('Kein Bildschirmtext in app.js traegt ein Wort der Verbotsliste',
      vApp.length === 0, vApp.slice(0, 12).join(' · '));
    /* NEUN SAETZE, DIE DER WAECHTER ZUM ERSTEN MAL SIEHT -- 0.24.0. Vier
       standen bis dahin in `throw new Error` in auth.js oder in einem Pruefer,
       der `{ fehler }` zurueckgibt; fuenf sind die Briefe aus mail.js, die
       kein Bildschirm war und die er deshalb nie gelesen hat. Mit dem Umzug in
       die Sprachdatei sieht er sie alle -- und findet in ihnen Woerter, die das
       Woerterbuch aus 0.22.0 vom Bildschirm genommen hat („Zugang",
       „Rücksetzlink", „Verwaltungsbereich", „Kasten", „liegen").
       SIE WERDEN IN DIESER RUNDE NICHT GEAENDERT, und das ist keine Nachsicht,
       sondern die Abnahme: „kein Wort anders" ist der Satz, an dem sich der
       Augenschein messen laesst (Auftrag 0.24.0). Sie stehen namentlich im
       Aenderungsprotokoll und gehen ins Sammelblatt.
       NAMENTLICH UND NICHT ALS ZAHL: wer einen davon spaeter richtigstellt,
       nimmt ihn hier heraus -- und wer einen neuen dazuschreibt, faellt auf. */
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
}

module.exports = laufen;
if (require.main === module) H.alleine(laufen, __filename);
