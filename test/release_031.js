/* Kriterion — Pruefstand: die Staende 0.31.0 bis 0.31.4 Die Sprachdateien
   werden gegengelesen, und die drei Sprachen sitzen: Deutsch, Englisch,
   Tuerkisch. */
const H = require('./frame.js');
const D = require('./dom.js');
const {
  buildDom, waitSearch
} = D;

async function run() {
  const {
   fs, os, path, spawnSync, CODE, TEXT, __dirname, require, group, check,
   open, call
  } = H;
  /* Dieses Modul ruft den Hauptserver. Es startet ihn fuer sich --
     siehe mainServerReady() in test/frame.js. */
  await H.mainServerReady();

/* ================================================================= 0.31.0 —
   „Die Sprachdateien werden gegengelesen" DREI BAUABSCHNITTE AM TEXT, UND ELF
   ZUSAGEN DARUEBER. */
/* DIE ZAHL DER SCHLUESSEL JE SPRACHDATEI STEHT EINMAL -- Stolperstein 47.
   ZWEI GRUPPEN FRAGEN SIE AB: 0.31.0 auf die Deckung der drei Dateien, 0.31.1
   auf den Stand nach dem Verschmelzen. */
const LANG_KEY_COUNT = 1208;

async function check0310() {
  const drRead = (code) => JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
  const drFiles = { de: drRead('de'), en: drRead('en'), tr: drRead('tr') };
  const drApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  const drCss = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  /* JEDER WERT MIT SEINEM SCHLUESSEL, und ein Mehrzahlpaar zaehlt zweimal:
     „du" kann in der Einzahl stehen und in der Mehrzahl fehlen. */
  const drTexts = (j) => Object.entries(j).filter(([k]) => k !== '_locale' && k !== '_name')
    .flatMap(([k, v]) => (typeof v === 'string' ? [v] : Object.values(v)).map(text => [k, text]));

  group('Die Sprachdateien werden gegengelesen — 0.31.0');
  {
    /* ---- Zusage 1: keine der elf Konstanten steht mehr in einer Sprachdatei
       IN KEINER DER DREI, und das ist keine Sorgfaltsgeste: zwei Waechter
       verlangen in jeder Datei dieselben Schluessel, und zwar in derselben
       Folge. */
    const DR_LEAKS = ['entry.targetBlank', 'entry.linkRel', 'entry.imagePrefix',
      'list.px10', 'list.px20', 'card.composeFile', 'card.filesQuery', 'card.photosQuery',
      'card.videosQuery', 'list.thumbQuery', 'card.partQuery'];
    const drLeft = [];
    for (const [code, file] of Object.entries(drFiles))
      for (const k of DR_LEAKS) if (file[k] !== undefined) drLeft.push(`${code}/${k}`);
    check('Zusage 1: keine der elf Konstanten steht mehr in einer Sprachdatei — in keiner der drei',
      drLeft.length === 0, drLeft.join(' · ') || 'alle elf aus allen dreien weg');
    // Und es sind wirklich elf -- eine Liste, die schrumpft, belegt weniger.
    check('Und es sind wirklich elf', DR_LEAKS.length === 11, `${DR_LEAKS.length}`);

    /* ---- Zusage 2: und jede steht als fester Wert im Skript ---- MIT IHREM
       ALTEN INHALT, Zeichen fuer Zeichen. */
    const drSkeleton = (x) => String(x).replace(/\$?\{[^}]*\}/g, '{}');
    const DR_IN_SCRIPT = ['_blank', 'noopener,noreferrer', 'image/', 'docker-compose.yml',
      '&files=1', 'photos=1', '&videos=1', '?size=thumb'];
    const drMissing = DR_IN_SCRIPT.filter(v => !drApp.includes(`'${v}'`));
    check('Zusage 2: jeder der acht Werte steht als fester Wert in app.js',
      drMissing.length === 0, drMissing.join(' · ') || 'alle acht');
    /* UND JEDER RUF TRAEGT IHN -- nicht bloss die Datei irgendwo. */
    const drOpenCalls = [];
    for (const m of drApp.matchAll(/window\.open\(/g)) {
      let i = m.index + m[0].length, depth = 1;
      while (i < drApp.length && depth > 0) {
        const c = drApp[i];
        if (c === '(') depth++; else if (c === ')') depth--;
        i++;
      }
      drOpenCalls.push(drApp.slice(m.index, i));
    }
    const drOpenBare = drOpenCalls.filter(z =>
      !z.includes("'_blank'") || !z.includes("'noopener,noreferrer'"));
    check('Und JEDER `window.open` traegt beide Werte — alle drei',
      drOpenCalls.length === 3 && drOpenBare.length === 0,
      `${drOpenCalls.length} Rufe · ohne: ${drOpenBare.map(z => z.slice(0, 70)).join(' | ') || 'keiner'}`);
    check('Und die Adresse des Teilexports ebenso — mit ihrem alten Gerippe',
      drSkeleton(drApp).includes(drSkeleton('&from={from}&to={to}&part={part}&parts={n}')),
      (drApp.match(/`&from=[^`]*`/) || ['(nicht gefunden)'])[0]);
    /* UND DIE BEIDEN ABSTAENDE STEHEN IM STILBLATT -- als Klasse und nicht
       als zweite Konstante. */
    const drRules = drCss.replace(/\/\*[\s\S]*?\*\//g, ' ');
    check('Und die beiden Abstaende stehen als Klasse im Stilblatt',
      /\.page-hint \{ margin: 0 0 20px; \}/.test(drRules) &&
      /\.page-hint\.above-pills \{ margin-bottom: 10px; \}/.test(drRules),
      (drRules.match(/\.page-hint[^\n]*/g) || ['(keine Regel)']).join(' | '));
    check('Und beide Listenseiten tragen die Klasse statt eines inline gesetzten Masses',
      (drApp.match(/class="hint page-hint\$\{multipleUsers\(\) \? ' above-pills' : ''\}"/g) || []).length === 2 &&
      !/margin:0 0 \$\{multipleUsers\(\)/.test(drApp),
      (drApp.match(/class="hint page-hint[^"]*"/g) || ['(keine Stelle)']).join(' | '));
    /* UND KEIN RUF SUCHT DIE ELF NOCH -- weder im Auslieferungsverzeichnis
       noch in der Umbenennungstafel. */
    const drBare = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
    const drNames = fs.readFileSync(path.join(__dirname, 'tools', 'keys.json'), 'utf8');
    const drCalled = DR_LEAKS.filter(k =>
      ['public/app.js', 'server.js', 'auth.js', 'mail.js'].some(f => drBare(f).includes(k))
      || drNames.includes(k));
    check('Und kein Ruf sucht die elf noch — auch nicht in der Umbenennungstafel',
      drCalled.length === 0, drCalled.join(' · ') || 'kein Ruf mehr');

    /* ---- Zusage 3: die drei Dateien tragen gleich viele Schluessel ----
       1254, und die Zahl steht ausdruecklich da: „gleich viele" allein bliebe
       gruen, wenn jemand aus allen dreien dasselbe herausnaehme. */
    const drCounts = Object.fromEntries(
      Object.entries(drFiles).map(([code, file]) => [code, Object.keys(file).length]));
    /* DER GEGENSTAND DIESER ZUSAGE IST DIE DECKUNG DER DREI DATEIEN -- die
       haelt weiter, nur auf einer anderen Zahl. Sie steht oben, einmal. */
    check(`Zusage 3: die drei Dateien tragen gleich viele Schluessel — ${LANG_KEY_COUNT}`,
      Object.values(drCounts).every(n => n === LANG_KEY_COUNT),
      Object.entries(drCounts).map(([c, n]) => `${c}: ${n}`).join(' · '));

    /* ---- Zusage 4: kein Text mischt „ mit einem geraden " ----
       DREIUNDDREISSIG SCHLUESSEL, VIERUNDDREISSIG TEXTE haben in dieser Runde
       ihr schliessendes Zeichen bekommen -- auf Deutsch und auf Tuerkisch
       (`en.json` hatte keinen einzigen). */
    const drMixed = [];
    for (const [code, file] of Object.entries(drFiles))
      for (const [k, text] of drTexts(file))
        if (text.includes('„') && text.includes('"')) drMixed.push(`${code}/${k}`);
    check('Zusage 4: kein Text der drei Dateien mischt „ mit einem geraden "',
      drMixed.length === 0, drMixed.slice(0, 10).join(' · ') || 'keiner');
    /* UND DAS PAAR IST WIRKLICH DA -- ohne diese Zeile bliebe die Zusage auch
       dann gruen, wenn jemand alle Anfuehrungszeichen entfernte. */
    const drPairs = drTexts(drFiles.de).filter(([, t]) => t.includes('„') && t.includes('“'));
    check('Und dreissig deutsche Texte tragen das Paar wirklich',
      drPairs.length >= 30, `${drPairs.length} Texte mit „…“`);

    /* ---- Zusage 5: die vier Video-Meldungen sagen „Video-Vorschaubild" ----
       „Standbild" IST TECHNISCH RICHTIG UND FUER DEN BENUTZER OHNE BELANG
       (Auftrag, F10) -- und „Video-Vorschaubild" trifft die Sache genauer:
       das Bild liegt in denselben Spalten `thumb`/`medium` wie jedes andere
       Vorschaubild, nur mit `kind = 'video'`. */
    const DR_VIDEO = ['server.videoNeedsStill', 'server.videoStill',
      'server.stillNoPreview', 'server.stillNotImage'];
    check('Zusage 5: die vier Video-Meldungen sagen „Video-Vorschaubild"',
      DR_VIDEO.every(k => String(drFiles.de[k]).includes('Video-Vorschaubild')),
      DR_VIDEO.map(k => `${k}: ${drFiles.de[k]}`).join(' · '));
    const drStill = drTexts(drFiles.de).filter(([, t]) => /Standbild/.test(t));
    check('Und keine sagt „Standbild" — kein deutscher Text tut es mehr',
      drStill.length === 0, drStill.map(([k]) => k).join(' · ') || 'keiner');

    /* ---- Zusage 6: „gruppiert nach" steht weiter da ---- GEMINI WOLLTE
       „sortiert nach", UND DAS WAERE FALSCH GEWESEN: die Ansicht gruppiert
       wirklich -- `groupsOf()` fasst aufeinanderfolgende Zeilen desselben
       Eintrags zu EINER Gruppe zusammen. */
    check('Zusage 6: „gruppiert nach" steht weiter da',
      /gruppiert nach/.test(String(drFiles.de['list.openGroupedBy'])),
      String(drFiles.de['list.openGroupedBy']));
    check('Und die Ansicht gruppiert wirklich — groupsOf() fasst zusammen',
      /const groupsOf = \(list\) => \{/.test(drApp) && /groupsOf\(inside\)\.forEach/.test(drApp),
      (drApp.match(/groupsOf[^\n]*/g) || ['(nicht gefunden)']).slice(0, 2).join(' | '));

    /* ---- Zusage 7: `login.linkUnaffectedWord` ist „nicht" ---- GEMINI
       WOLLTE „unberührt", UND DAS BRICHT DEN SATZ: das Wort steht
       HERVORGEHOBEN in zwei Traegersaetzen („Dein Link ist davon {word}
       betroffen"), und die Hervorhebung sitzt auf der VERNEINUNG. */
    check('Zusage 7: `login.linkUnaffectedWord` ist „nicht"',
      drFiles.de['login.linkUnaffectedWord'] === 'nicht',
      JSON.stringify(drFiles.de['login.linkUnaffectedWord']));
    check('Und beide Traegersaetze tragen es',
      ['login.linkUnaffected', 'login.linkUnaffectedRetry']
        .every(k => String(drFiles.de[k]).includes('{word}')),
      ['login.linkUnaffected', 'login.linkUnaffectedRetry']
        .map(k => `${k}: ${drFiles.de[k]}`).join(' · '));
    /* UND DIE AUSZEICHNUNG LAEUFT WEITER UEBER tMark() -- das `{word}` wird
       gegen ein Steuerzeichen getauscht und danach mit <strong> umschlossen. */
    check('Und die Hervorhebung sitzt auf ihm',
      (drApp.match(/tMark\('login\.linkUnaffected(Retry)?', 'login\.linkUnaffectedWord'\)/g) || []).length === 2,
      (drApp.match(/tMark\([^)]*\)/g) || ['(kein Ruf)']).join(' | '));

    /* ---- Zusage 8 und 9: die beiden Bilder des Projekts fallen ---- „Das
       Haus verlassen" UND „Pille" SIND HAUSWOERTER, und beide haben am
       Bildschirm nichts zu suchen (Leitplanke L7 und Frage F7). */
    const drHouse = drTexts(drFiles.de).filter(([, t]) => /[Hh]aus\b/.test(t));
    check('Zusage 8: kein deutscher Text sagt „das Haus"',
      drHouse.length === 0, drHouse.map(([k]) => k).join(' · ') || 'keiner');
    const drPill = drTexts(drFiles.de).filter(([, t]) => /Pille|Pillen/.test(t));
    check('Zusage 9: kein deutscher Text sagt „Pille"',
      drPill.length === 0, drPill.map(([k]) => k).join(' · ') || 'keiner');
    check('Und die Klasse `pill` bleibt — im Stilblatt und im Quelltext',
      /\.pill \{/.test(drRules) && /class="pills"/.test(drApp),
      (drRules.match(/\.pill \{[^}]{0,40}/) || ['(keine Regel)'])[0]);

    /* ---- Zusage 10: die Vokabelkarte beschriftet mit „Einzahl"/„Mehrzahl"
       -- „SACHE" WAR GENAU DAS WORT, DAS DER BETREIBER DORT ERSETZEN SOLL:
       die Karte fragt, wie SEINE Eintraege heissen, und schrieb ihm einen
       Namen vor. */
    check('Zusage 10: die Vokabelkarte beschriftet ihre beiden ersten Felder wie die anderen — 0.32.0',
      drFiles.de['card.itemOne'] === 'Das Bewertete, Einzahl'
      && drFiles.de['card.itemMany'] === 'Das Bewertete, Mehrzahl',
      `${drFiles.de['card.itemOne']} · ${drFiles.de['card.itemMany']}`);
    /* UND SIE NENNT DAS VORGABEWORT AUSDRUECKLICH NICHT -- das ist der Kern
       der alten Zusage, und er gilt unveraendert. */
    check('Und sie nennt dabei ihr eigenes Vorgabewort nicht',
      !/Eintrag/i.test(drFiles.de['card.itemOne'])
      && !/Einträge/i.test(drFiles.de['card.itemMany']),
      `${drFiles.de['card.itemOne']} · ${drFiles.de['card.itemMany']}`);
    check('Und die Karte liest sie wirklich an ihren beiden ersten Feldern',
      /\['v1', 'entryOne', \(\) => t\('card\.itemOne'\)\], \['v2', 'entryMany', \(\) => t\('card\.itemMany'\)\]/
        .test(drApp),
      (drApp.match(/\['v1'[^\n]*/) || ['(nicht gefunden)'])[0]);

    /* ---- Zusage 11: die Zahl der Texte im aktiven Du sinkt nicht ----
       GEMINIS UEBERSCHRIFT VERSPRICHT „professionelles Du (Linear-/
       SIEBENUNDSECHZIG WAREN ES BEI 0.30.3, NEUNUNDSECHZIG SIND ES JETZT --
       gezaehlt werden die Vorkommen von „du", „dir", „dich" und „dein…" als
       ganze Woerter. */
    const DR_YOU = /\b[Dd](?:u|ir|ich|ein(?:e|er|em|en|es)?)\b/g;
    const drYou = drTexts(drFiles.de)
      .reduce((n, [, t]) => n + (t.match(DR_YOU) || []).length, 0);
    check('Zusage 11: die Zahl der Texte im aktiven Du sinkt nicht — 69, vorher 67',
      drYou >= 69, `${drYou} Vorkommen von du/dir/dich/dein…`);
    /* UND DER ZAEHLER ZAEHLT WIRKLICH DAS DU -- ohne diese Zeile bliebe die
       Zusage gruen, wenn das Muster an jedem Wort griffe. */
    check('Und der Zaehler trennt die Anrede vom Wortstueck',
      ('Setz dein Passwort, du'.match(DR_YOU) || []).length === 2 &&
      ('Dublette, Reduktion, Individuum'.match(DR_YOU) || []).length === 0,
      JSON.stringify('Dublette, Reduktion, Individuum'.match(DR_YOU)));
  }
}

/* ================= DEUTSCH SITZT -- 0.31.1 ================= ELF ZUSAGEN. */
async function check0311() {
  const dsRead = (code) => JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
  const dsFiles = { de: dsRead('de'), en: dsRead('en'), tr: dsRead('tr') };
  const dsApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  /* KOMMENTARE WEG: die Absaetze an den umgebauten Stellen NENNEN die
     gefallenen Schluessel und erklaeren, warum sie gefallen sind. */
  const dsCode = dsApp.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
  const dsTexts = (j) => Object.entries(j).filter(([k]) => k !== '_locale' && k !== '_name')
    .flatMap(([k, v]) => (typeof v === 'string' ? [v] : Object.values(v)).map(text => [k, text]));
  const Q = String.fromCharCode(39);

  group('Deutsch sitzt — 0.31.1');
  {
    /* ---- Zusage 2: kein Schluessel ist mehr ein blosses Bruchstueck ----
       DREI SORTEN, und jede war vor der Runde da. */
    const dsWordKeys = new Set();
    for (const m of dsCode.matchAll(/\btMark\(\s*'[^']+'\s*,\s*'([^']+)'/g)) dsWordKeys.add(m[1]);
    /* UND DIE FUELLUNGEN VON tMarks() SIND AUCH WELCHE. */
    for (const m of dsCode.matchAll(/\bword\d*:\s*[^,}]*?\bt[H]?\(\s*'([^']+)'/g)) dsWordKeys.add(m[1]);
    check('Die Wortschluessel kommen aus dem Quelltext und nicht aus einer Liste',
      dsWordKeys.size >= 30 && dsWordKeys.has('login.linkUnaffectedWord'),
      `${dsWordKeys.size} Wortschluessel`);

    /* ZWEI SORTEN STEHEN WEITERHIN MIT EINEM TRENNER ODER EINEM EINZELNEN
       WORT DA, und keine von beiden ist ein Bruchstueck. */
    const DS_JOINED = {
      'card.createdFrom':        ['card.fileContainsHint',   'from'],
      'card.freedBytes':         ['card.convertFinished',    'freed'],
      'card.lessBytes':          ['card.thumbsRefreshed',    'change'],
      'card.moreBytes':          ['card.thumbsRefreshed',    'change'],
      'card.notDeleted':         ['card.backupsDeleted',     'extra'],
      'card.skipped':            ['card.thumbsRefreshed',    'skipped'],
      'card.stayedCurrent':      ['card.convertFinished',    'stayed'],
      'dialog.withForeignPosts': ['dialog.deleteAlso',       'extra'],
      'entry.calcAllEqual':      ['entry.calcStepsHint',     'extra'],
      'entry.calcWithWeight':    ['entry.calcStepsHint',     'extra'],
      'entry.withAllImages':     ['entry.commentDeleteHint', 'extra']
    };
    /* `list.ofWhich` STAND HIER BIS 0.32.0 -- der Satz „, davon ..." lief in
       den Platz `{of}` von `list.commentCount`. */
    const DS_STANDALONE = {
      'card.more':        'Beschriftung des Aufklappers',
      'card.noDelivery':  'Eintrag der Versandauswahl',
      'card.off':         'Zustandswort einer Kennzeile',
      'card.on':          'Zustandswort einer Kennzeile',
      'entry.none':       'Eintrag der Kategorieauswahl',
      /* `list.and` STAND HIER BIS 0.32.0 als „Bindewort einer Aufzaehlung". */
      'list.less':        'Beschriftung des Tagwolkenknopfes',
      'list.more':        'Beschriftung des Tagwolkenknopfes',
      'list.or':          'Beschriftung eines Filterknopfes',
      'list.tagModeAnd':  'Beschriftung eines Filterknopfes',
      'list.without':     'Beschriftung eines Filterknopfes'
    };

    const dsFirst = (v) => String(typeof v === 'string' ? v : Object.values(v)[0]).trim();
    const dsException = new Set([...Object.keys(DS_JOINED), ...Object.keys(DS_STANDALONE)]);
    const dsFragmentStart = Object.entries(dsFiles.de)
      .filter(([k]) => !k.startsWith('_') && !dsWordKeys.has(k) && !dsException.has(k))
      .filter(([, v]) => /^[.,;:—–)“”]/.test(dsFirst(v)));
    check('Kein deutscher Wert faengt mit einem Satzzeichen an — ausser den benannten',
      dsFragmentStart.length === 0,
      dsFragmentStart.map(([k, v]) => `${k}: ${JSON.stringify(dsFirst(v))}`).join(' · ') || 'keiner');

    /* DER BEWEIS FUER JEDES ANSCHLUSSSTUECK: der Elternsatz traegt den Platz,
       und der Ruf setzt das Stueck dort ein. */
    const dsLoose = [];
    for (const [k, [parent, slot]] of Object.entries(DS_JOINED)) {
      const eltern = dsFiles.de[parent];
      const zweige = eltern === undefined ? []
        : (typeof eltern === 'string' ? [eltern] : Object.values(eltern));
      if (!zweige.length || !zweige.every(v => v.includes(`{${slot}}`))) { dsLoose.push(`${k}: ${parent} ohne {${slot}}`); continue; }
      const from = dsCode.indexOf(`${Q}${parent}${Q}`);
      const callText = from < 0 ? '' : dsCode.slice(from, from + 400);
      if (!callText.includes(`${slot}:`) || !callText.includes(`${Q}${k}${Q}`)) dsLoose.push(`${k}: nicht an ${parent}.${slot} gesetzt`);
    }
    check('Und jedes Anschlussstueck haengt wirklich an seinem Satz',
      dsLoose.length === 0, dsLoose.join(' · ') || `alle ${Object.keys(DS_JOINED).length}`);

    /* UND KEINE AUSNAHME STEHT UMSONST DA. */
    const dsStale = [...dsException].filter(k => !(k in dsFiles.de))
      .concat([...dsException].filter(k => k in dsFiles.de && !dsCode.includes(`${Q}${k}${Q}`)));
    check('Und keine Ausnahme steht umsonst in der Tafel',
      dsStale.length === 0, dsStale.join(' ') || `${dsException.size} benannt`);

    /* DIE DRITTE SORTE: DAS BLOSSE FUELLWORT. */
    const DS_FUNCTION_WORDS = new Set(['und', 'oder', 'ohne', 'mit', 'von', 'aus', 'an', 'in',
      'auf', 'für', 'zu', 'der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'einen',
      'einem', 'einer', 'nicht', 'kein', 'keine', 'auch', 'noch', 'dann', 'so', 'als',
      'wie', 'bis', 'je', 'nur', 'schon', 'gleich', 'frei', 'mehr', 'weniger']);
    const dsFiller = Object.entries(dsFiles.de)
      .filter(([k]) => !k.startsWith('_') && !dsWordKeys.has(k) && !dsException.has(k))
      .filter(([, v]) => (typeof v === 'string' ? [v] : Object.values(v))
        .some(x => DS_FUNCTION_WORDS.has(String(x).trim().replace(/[.,;:!?]$/, '').toLowerCase())));
    check('Kein deutscher Wert ist ein blosses Fuellwort',
      dsFiller.length === 0,
      dsFiller.map(([k, v]) => `${k}: ${JSON.stringify(dsFirst(v))}`).join(' · ') || 'keiner');

    /* EINE UNPAARIGE KLAMMER IST DER SCHAERFSTE FALL: der Uebersetzer bekommt
       einen Satz, der mit „(" endet, und soll raten, was folgt. */
    const dsBracket = Object.entries(dsFiles.de).filter(([k]) => !k.startsWith('_'))
      .filter(([, v]) => (typeof v === 'string' ? [v] : Object.values(v))
        .some(x => (String(x).match(/\(/g) || []).length !== (String(x).match(/\)/g) || []).length));
    check('Kein deutscher Wert traegt eine unpaarige Klammer',
      dsBracket.length === 0, dsBracket.map(([k]) => k).join(' ') || 'keiner');

    /* ---- Zusage 3: kein Programmablauf laeuft durch die Sprachdatei ----
       ZWEI SCHLUESSEL TATEN ES, und beide waren unsichtbar: entry.reportKind
       = „report" wurde gegen einen DATENBANKWERT verglichen -- eine Zeile
       darueber stand derselbe Vergleich gegen ein Literal. */
    const dsFlowCompare = [...dsCode.matchAll(/[!=]==\s*t\(\s*'([^']+)'/g)].map(m => m[1])
      .concat([...dsCode.matchAll(/t\(\s*'([^']+)'\s*\)\s*[!=]==/g)].map(m => m[1]));
    check('Kein Vergleich steht neben einem Textruf — der Ablauf haengt nicht an der Sprache',
      dsFlowCompare.length === 0, dsFlowCompare.join(' · ') || 'keiner');
    check('Und die beiden Schluessel, die es taten, stehen in keiner Datei mehr',
      ['entry.reportKind', 'dialog.sessionExpired']
        .every(k => !(k in dsFiles.de) && !(k in dsFiles.en) && !(k in dsFiles.tr)),
      ['entry.reportKind', 'dialog.sessionExpired'].filter(k => k in dsFiles.de).join(' ') || 'beide weg');
    check('Und das Merkmal, das an ihre Stelle getreten ist, steht im Quelltext',
      /const SESSION_GONE = /.test(dsApp) && (dsCode.match(/SESSION_GONE/g) || []).length >= 8,
      `${(dsCode.match(/SESSION_GONE/g) || []).length} Stellen`);

    /* ---- Zusage 5: jeder Platz hat seinen Satz und jeder Satz seinen Platz
       ---- BEIDE RICHTUNGEN, und die zweite ist die wichtigere: ein Satz mit
       `{word}` ohne Ruf zeigt am Bildschirm „{word}" -- der sichtbarste
       Fehler, den eine Sprachdatei machen kann. */
    const dsMarkSentences = [...dsCode.matchAll(/\btMarks?\(\s*'([^']+)'/g)].map(m => m[1]);
    /* JEDER ZWEIG EINZELN -- Stolperstein 81. Bis zum Bau von BA 3 stand hier
       `String(dsFiles.de[k])`, und ein Schluessel mit Ein- und Mehrzahl wurde
       dabei zu „[object Object]": die Wache kannte nur die eine Gestalt und
       meldete `card.opensOnlyWith` und `card.otherSessionsHint` als Satz ohne
       Platz, obwohl beide Zweige ihren `{word}` tragen. */
    const dsBranches = (k) => {
      const v = dsFiles.de[k];
      if (v === undefined) return [];
      return typeof v === 'string' ? [v] : Object.values(v);
    };
    const dsNoSlot = dsMarkSentences
      .filter(k => !dsBranches(k).length || !dsBranches(k).every(v => v.includes('{word}')));
    check('Jeder tMark-Satz traegt seinen Platz',
      dsNoSlot.length === 0, dsNoSlot.join(' ') || 'alle');
    /* Die vier Schluessel mit `{word}` als gewoehnlichem Platzhalter stehen
       NAMENTLICH da: `{word}` traegt dort „Foto" oder „Video" und hat mit dem
       Muster von 0.25.4 nichts zu tun. */
    /* `entry.deleteWord` STAND HIER BIS 0.32.0 -- er ist mit 0.32.1 in
       `entry.deletePhoto` und `entry.deleteVideo` geteilt, und beide tragen
       gar keinen Platzhalter mehr. */
    const DS_PLAIN_WORD = ['entry.deleteHint',
                           'entry.deleteWordAsk', 'entry.whoRatedWord'];
    const dsOrphan = Object.keys(dsFiles.de)
      .filter(k => String(dsFiles.de[k]).includes('{word}'))
      .filter(k => !DS_PLAIN_WORD.includes(k))
      .filter(k => !dsApp.includes(`tMark(${Q}${k}${Q}`) && !dsApp.includes(`tMarks(${Q}${k}${Q}`));
    check('Und jeder Satz mit einem Platz hat seinen Ruf — sonst stuende „{word}" am Bildschirm',
      dsOrphan.length === 0, dsOrphan.join(' ') || 'keiner');
    check('Und die vier mit gewoehnlichem {word} sind es wirklich',
      DS_PLAIN_WORD.every(k => k in dsFiles.de && !dsApp.includes(`tMark(${Q}${k}${Q}`)),
      DS_PLAIN_WORD.filter(k => !(k in dsFiles.de)).join(' ') || 'alle vier');

    /* UND JEDER PLATZ EINES SATZES MIT MEHREREN STUECKEN BEKOMMT SEINE
       FUELLUNG. */
    const dsGap = [];
    for (const m of dsCode.matchAll(/\btMarks\(\s*'([^']+)'\s*,\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)) {
      const filled = new Set([...m[2].matchAll(/(\w+)\s*:/g)].map(x => x[1]));
      for (const slot of String(dsFiles.de[m[1]] || '').matchAll(/\{(word\d*)\}/g))
        if (!filled.has(slot[1])) dsGap.push(`${m[1]} ${slot[1]}`);
    }
    check('Und jeder Platz eines Satzes mit mehreren Stuecken bekommt seine Fuellung',
      dsGap.length === 0, dsGap.join(' · ') || 'alle');

    /* UND DER PLATZ STEHT IN ALLEN DREI DATEIEN AN SEINER STELLE. */
    const dsSlotMismatch = Object.keys(dsFiles.de).filter(k => ['en', 'tr']
      .some(c => String(dsFiles.de[k]).includes('{word}') !== String(dsFiles[c][k]).includes('{word}')));
    check('Und jeder Platz steht in allen drei Dateien',
      dsSlotMismatch.length === 0, dsSlotMismatch.join(' ') || 'alle drei gleich');

    /* ---- Zusage 6: keine Beschriftung nennt ihr eigenes Vorgabewort ----
       „Bericht, Einzahl" stand neben „(Vorgabe: Bericht)" -- dasselbe Wort
       zweimal in einer Zeile. */
    const dsVocabLabel = { entryOne: 'itemOne', entryMany: 'itemMany',
      testedYes: 'testedYes', testedNo: 'testedNo', dayOne: 'dayOne', dayMany: 'dayMany',
      reportOne: 'reportOne', reportMany: 'reportMany', taskOne: 'taskOne',
      taskMany: 'taskMany', taskDone: 'taskDone', potential: 'potential',
      ratingOne: 'ratingOne', ratingMany: 'ratingMany', grade: 'grade' };
    const dsEcho = Object.entries(dsVocabLabel).filter(([vocab, label]) => {
      const word = String(dsFiles.de[`vocabulary.${vocab}`] || '').toLowerCase();
      const text = String(dsFiles.de[`card.${label}`] || '').toLowerCase();
      return word && text.includes(word);
    }).map(([v]) => v);
    check('Keine deutsche Vokabelbeschriftung nennt ihr eigenes Vorgabewort',
      dsEcho.length === 0, dsEcho.join(' ') || 'keine');
    check('Und es sind wirklich fuenfzehn Felder, die geprueft werden',
      Object.keys(dsVocabLabel).length === 15 &&
      Object.keys(dsVocabLabel).every(v => `vocabulary.${v}` in dsFiles.de),
      `${Object.keys(dsVocabLabel).length}`);

    /* ---- Zusage 7: keine Zahl steht zweimal ---- Die vier Groessen standen
       als `value="52428800"` UND als Schluessel mit dem Text „50 MB" -- in
       drei Dateien, obwohl „50 MB" in allen dreien gleich lautet. */
    check('Die vier Exportgroessen stehen nicht mehr in den Sprachdateien',
      ['card.mb50', 'card.mb100', 'card.mb200', 'card.mb300']
        .every(k => !(k in dsFiles.de) && !(k in dsFiles.en) && !(k in dsFiles.tr)),
      ['card.mb50', 'card.mb100', 'card.mb200', 'card.mb300'].filter(k => k in dsFiles.de).join(' ') || 'keine');
    check('Und die Beschriftung wird aus dem Wert gerechnet',
      /\/ 1048576\} MB<\/option>/.test(dsApp),
      /1048576/.test(dsApp) ? 'gerechnet' : 'nicht gefunden');
    check('Und der Ruecksetzhinweis zaehlt die Vorgabewoerter nicht mehr auf',
      !/Eintrag\/Eintr/.test(String(dsFiles.de['card.vocabularyResetHint'])) &&
      !/vierzehn/i.test(String(dsFiles.de['card.vocabularyResetHint'])),
      JSON.stringify(dsFiles.de['card.vocabularyResetHint']));

    /* ---- Zusage 8: kein deutscher Wert traegt eine HTML-Entitaet ----
       card.nameFreedHint schrieb „Geloeschter Benutzer &lt;Nummer&gt;" nach. */
    const dsEntity = dsTexts(dsFiles.de).filter(([, v]) => /&[a-z]+;|&#\d+;/i.test(v));
    check('Kein deutscher Wert traegt eine HTML-Entitaet',
      dsEntity.length === 0, dsEntity.map(([k]) => k).join(' ') || 'keiner');

    /* ---- Zusage 9: kein Wert traegt Weissraum aus dem Quelltext ---- UND
       DIESE GILT FUER ALLE DREI. */
    /* EINRUECKUNG, NICHT UMBRUCH -- und diese Unterscheidung ist teuer
       gelernt. */
    const dsSpace = [];
    for (const c of ['de', 'en', 'tr'])
      for (const [k, v] of dsTexts(dsFiles[c]))
        if (/\n[ \t]|[ \t][ \t]/.test(v)) dsSpace.push(`${c}:${k}`);
    check('Kein Wert traegt die Einrueckung des Quelltexts — in keiner der drei Dateien',
      dsSpace.length === 0, dsSpace.slice(0, 10).join(' ') || 'keiner');
    /* UND EIN UMBRUCH STEHT NUR DORT, WO ER EIN ABSATZ IST. Vier Briefe,
       namentlich -- ein fuenfter Wert mit Umbruch soll auffallen. */
    const dsBreak = [];
    for (const c of ['de', 'en', 'tr'])
      for (const [k, v] of dsTexts(dsFiles[c])) if (v.includes('\n')) dsBreak.push(k);
    const DS_LETTERS = ['mail.confirm.body', 'mail.invite.body',
                        'mail.reset.body', 'mail.test.body'];
    check('Und ein Umbruch steht nur in den vier Briefen, wo er ein Absatz ist',
      [...new Set(dsBreak)].sort().join(' ') === DS_LETTERS.join(' '),
      [...new Set(dsBreak)].sort().join(' ') || 'keiner');

    /* ---- Zusage 10: die Umbenennungstafel zeigt nirgends ins Leere ---- Sie
       ist die Deutsch-nach-Englisch-Tafel aus 0.8.x und KEIN Verzeichnis der
       Wanderungen. */
    const dsTable = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'tools', 'keys.json'), 'utf8'));
    /* AUF DIE SCHLUESSEL DIESER RUNDE EINGEGRENZT, und das ist ein BEFUND und
       keine Bequemlichkeit: NEUNUNDDREISSIG Eintraege zeigten schon vor
       0.31.1 ins Leere -- auf `login.not`, `list.sortAvgDesc`,
       `card.convertAllPng` und die vierzehn deutschen Vokabelnamen. */
    const DS_OLD_DANGLING = 39;
    const dsDangling = Object.entries(dsTable).filter(([, target]) => !(target in dsFiles.de));
    check('Kein Eintrag der Umbenennungstafel zeigt auf einen Schluessel DIESER Runde',
      dsDangling.length === DS_OLD_DANGLING,
      `${dsDangling.length} ins Leere, ${DS_OLD_DANGLING} davon aelter als diese Runde`);

    /* ---- Zusage 4: die drei Dateien tragen gleich viele Schluessel ---- Die
       Zahl steht ausdruecklich da, wie bei F_ROUTES: „gleich viele" allein
       bliebe gruen, wenn jemand aus allen dreien dasselbe herausnaehme. */
    const dsCounts = Object.fromEntries(['de', 'en', 'tr']
      .map(c => [c, Object.keys(dsFiles[c]).length]));
    check(`Die drei Dateien tragen gleich viele Schluessel — ${LANG_KEY_COUNT}`,
      ['de', 'en', 'tr'].every(c => dsCounts[c] === LANG_KEY_COUNT),
      JSON.stringify(dsCounts));
    check('Und in derselben Folge',
      ['en', 'tr'].every(c => JSON.stringify(Object.keys(dsFiles[c])) ===
                              JSON.stringify(Object.keys(dsFiles.de))),
      'Folge geprueft');

    /* ---- Zusage 1: die Gleichlautprobe steht als Werkzeug daneben ---- SIE
       IST KEINE PRUEFUNG UND SOLL KEINE SEIN: sie braucht einen ZWEITEN Stand
       zum Vergleichen, und den hat ein Lauf nicht. */
    const dsTool = path.join(__dirname, 'tools', 'gleichlaut.js');
    check('Die Gleichlautprobe liegt als Werkzeug daneben',
      fs.existsSync(dsTool), 'tools/gleichlaut.js');
    const dsToolText = fs.existsSync(dsTool) ? fs.readFileSync(dsTool, 'utf8') : '';
    check('Und sie nennt ihre eigene Blindstelle — sie fuehrt den Code nicht aus',
      /WOFUER SIE BLIND IST/.test(dsToolText) && /FUEHRT DEN CODE NICHT AUS/.test(dsToolText),
      dsToolText ? 'Blindstelle benannt' : 'Datei fehlt');
  }
}

/* ================================================================= 0.31.2 —
   „Englisch sitzt" ZEHN ZUSAGEN UEBER EINE EINZIGE DATEI. */
/* DIE BEIDEN DEUTSCHEN PRUEFSUMMEN DER GLEICHLAUTPROBE, gemessen am gebauten
   Stand dieser Runde. */
/* MIT 0.31.4 SIND DIESE BEIDEN ZAHLEN ANDERE, UND KEIN DEUTSCHER SATZ HAT
   SICH BEWEGT. */
const DE_UNTOUCHED = { one: 'daa0c9094f2c2305', other: '77128aef244a5976' };
const DE_BEFORE_0312 = { one: '91b86c5affcba789', other: '07fc3ccdc8a27a03' };
const DE_ORDERED_0312 = {
  'login.requestAccess': 'Zugang anfragen',
  'login.requestAccessHint':
    'Zugang anfragen. Du bestätigst deine Adresse per Mail, danach entscheidet ein Admin.'
};

/* DIE TAFEL DER ENGLISCHEN AENDERUNGEN -- sie steht auf MODULEBENE, weil zwei
   Gruppen sie lesen: 0.31.2 misst gegen ihren eigenen Vergleichsstand, 0.31.3
   misst denselben Stand noch einmal von ihrer Seite aus. */
const EG_CHANGED_AFTER_0312_SHARED = {
  "_afterNumber": "0.31.4: der Mechanismus — fuer Englisch `plural`, also das Verhalten von vorher",
  "card.catchUpAsk": "0.33.0: der Dialog nennt die Vorschaubilder nicht mehr — die zweite Haelfte des Laufs ist gefallen",
  "card.catchUpBoth": "0.33.0: die Zeile unter dem Knopf ebenso — sie sagt nur noch, was mit den Originalen geschieht",
  "card.convertFinished": "0.33.0: der Fertigsatz nennt keine neu gerechneten Vorschaubilder mehr",
  "card.grade": "0.32.0: seine Beschriftung in der Vokabelkarte",
  "card.itemMany": "0.32.0: Punkt 28, Fund 5 — dieselbe Sache in der Mehrzahl",
  "card.itemOne": "0.32.0: Punkt 28, Fund 5 — die Beschriftung nennt wieder ihre Sache",
  "card.potentialModeHint": "0.32.1: „in the entry\" wird „in the detail view\" — das Vokabelwort stand fest im Satz",
  "card.restartHint": "0.33.0: die zitierte Logzeile heisst jetzt englisch „Key loaded from ENCRYPTION_KEY\" — das Protokoll spricht englisch (0.32.0, Punkt 28, Fund 1 hatte sie auf „Schluessel\" gebracht)",
  "entry.calcGradeWeight": "0.32.0: „Score × weight\" wird `{grade} × weight`",
  "entry.deletePhoto": "0.32.1: aus `entry.deleteWord` geteilt — „Delete photo\"",
  "entry.deleteVideo": "0.32.1: aus `entry.deleteWord` geteilt — „Delete video\"",
  "entry.dueHint": "0.32.1: „Due date\" ohne „of the task\" — das Vokabelwort stand fest im Satz",
  "entry.grade": "0.32.0: der Spaltenkopf der Rechnung wird `{grade}`",
  "entry.gradeLabel": "0.32.0: die Beschriftung am Sternkasten des Zeitpunkts",
  "entry.gradeReplaced": "0.32.0: die Meldung nach dem Ersetzen",
  "entry.noDaysYet": "0.32.1: „a score\" wird `{grade}` — das fuenfzehnte Vokabelwort",
  "list.bellMine": "0.32.0: die Ueberschrift „My {entryMany}\"",
  "list.bellOther": "0.32.0: die Ueberschrift „Everything else\"",
  "list.bellToMe": "0.32.0: die Ueberschrift „Addressed to me\"",
  "list.commentCount": "0.32.1: der Platz `{of}` faellt weg — die Zaehlzeile baut keinen Satz mehr",
  "list.gradeLong": "0.32.0: die Vorlesefassung eines Punktes der Zeitleiste",
  "list.gradeShort": "0.32.0: seine kurze Fassung",
  "list.lastGrade": "0.32.0: die Zeile der Kachel",
  "list.markedCount": "0.32.0: das „, of which 1 addressed to me\" an der Zeile",
  "list.newCommentsHint": "0.32.0: der Satz im Glockenfenster, nach Herkunft getrennt (F4)",
  "list.sortAvg": "0.32.0: artikellos — „Average: {grade}\" statt „Average score\"",
  "list.sortLast": "0.32.0: artikellos — „Last: {grade}\" statt „Last score\"",
  "mail.ownServer": "0.32.0: der zwoelfte Satz — „Own server\" in der Anbieterliste",
  "server.backupsBeforeKey": "0.32.0: Punkt 29 — Grund 2, jetzt mit Mehrzahlform",
  "server.cleanupAllYoungest": "0.32.0: Punkt 29 — Grund 3, jetzt mit Mehrzahlform",
  "server.cleanupNoBackups": "0.32.0: Punkt 29 — die Vorschau des Aufraeumens, Grund 1",
  "server.cleanupOldestAge": "0.32.0: Punkt 29 — Grund 4, jetzt mit Mehrzahlform",
  "server.deniedEntry": "0.32.1: „this entry\" faellt weg — das Vokabelwort stand fest im Satz",
  "server.exportTooOld": "0.33.0: neu — die eine Abweisung des Bruchs, eine Datei mit Formatnummer 13 oder aelter kommt nicht mehr herein",
  "server.gradeRange": "0.32.0: die Absage des Servers nennt das Vokabelwort",
  "server.noAccountOwner": "0.32.0: Punkt 29 — der Grund, warum nicht verschickt werden kann",
  "server.noPublicAddress": "0.32.0: Punkt 29 — ohne PUBLIC_ADDRESS wird nicht verschickt",
  "server.noTestMail": "0.32.0: Punkt 29 — seit dem Wechsel kam keine Testmail durch",
  "server.noUserAddress": "0.32.0: Punkt 29 — am Konto haengt keine Adresse",
  "server.ratingBeforeTest": "0.32.1: „this entry\" faellt weg, „untested\" wird `{testedNo}`",
  "server.signupThanks": "0.32.0: Punkt 29 — die eine Antwort der Zugangsanfrage",
  "vocabulary.grade": "0.32.0: das fuenfzehnte Vokabelwort — „Score\""
};

async function check0312() {
  const egRead = (code) => JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
  const egFiles = { de: egRead('de'), en: egRead('en'), tr: egRead('tr') };
  /* JEDES PAAR MIT SEINER FORM. */
  const egPairs = [];
  for (const [k, dv] of Object.entries(egFiles.de)) {
    if (k.startsWith('_')) continue;
    const ev = egFiles.en[k];
    if (typeof dv === 'string') egPairs.push([k, '', String(dv), typeof ev === 'string' ? ev : '']);
    else for (const f of Object.keys(dv))
      egPairs.push([`${k}/${f}`, f, String(dv[f]),
        ev && typeof ev === 'object' && ev[f] !== undefined ? String(ev[f]) : '']);
  }
  /* DIE PLAETZE FALLEN VOR JEDER WORTPRUEFUNG HERAUS. */
  const egBare = (v) => String(v).replace(/\{[A-Za-z0-9_]+\}/g, ' ');

  group('Englisch sitzt — 0.31.2');
  {
    /* ---- Zusage 1: Deutsch ist unangetastet -----------------------------
       NACHGERECHNET UND NICHT BEHAUPTET. */
    const egOut = path.join(os.tmpdir(), `kriterion-gleichlaut-${process.pid}.json`);
    const egRun = spawnSync(process.execPath, ['tools/gleichlaut.js', egOut],
      { cwd: __dirname, encoding: 'utf8' });
    const egSums = {};
    for (const line of String(egRun.stdout || '').split('\n')) {
      const m = line.match(/^(de|en|tr)\/(one|other)\s+([0-9a-f]{16})/);
      if (m) egSums[`${m[1]}/${m[2]}`] = m[3];
    }
    fs.rmSync(egOut, { force: true });
    /* ERST DER LAUF SELBST. Eine Probe, die abreisst, ist keine gruene Probe
       -- sie ist gar keine (Stolpersteine 138, 161 und 170). */
    check('Zusage 1: die Gleichlautprobe laeuft und nennt ihre sechs Summen',
      Object.keys(egSums).length === 6,
      `${Object.keys(egSums).length} Summen · ${String(egRun.stderr || '').slice(0, 200)}`);
    check(`Und die beiden deutschen sind die dieser Runde — ${DE_UNTOUCHED.one} · ${DE_UNTOUCHED.other}`,
      egSums['de/one'] === DE_UNTOUCHED.one && egSums['de/other'] === DE_UNTOUCHED.other,
      `de/one ${egSums['de/one']} · de/other ${egSums['de/other']}`);
    /* UND SIE SIND ANDERE ALS DIE VON 0.31.1 -- weil der Betreiber zwei Werte
       bestellt hat. */
    check('Und sie sind ANDERE als die von 0.31.1 — der Betreiber hat zwei Werte bestellt',
      egSums['de/one'] !== DE_BEFORE_0312.one && egSums['de/other'] !== DE_BEFORE_0312.other,
      `0.31.1: ${DE_BEFORE_0312.one} · ${DE_BEFORE_0312.other}`);
    const egOrdered = Object.entries(DE_ORDERED_0312)
      .filter(([k, v]) => String(egFiles.de[k]) !== v);
    check('Und die beiden bestellten Werte stehen Zeichen fuer Zeichen da — und sonst kein deutscher',
      egOrdered.length === 0 && Object.keys(DE_ORDERED_0312).length === 2,
      egOrdered.map(([k]) => `${k}: ${JSON.stringify(egFiles.de[k])}`).join(' · ') || 'beide'); 
    /* UND DIE ENGLISCHEN SIND ES NICHT. */
    check('Und die beiden englischen sind es NICHT — die Runde hat Englisch angefasst',
      egSums['en/one'] !== '45fa40be3b0b6145' && egSums['en/other'] !== '24f9083c0610df9d',
      `en/one ${egSums['en/one']} · en/other ${egSums['en/other']}`);

    /* ---- Zusage 2: gleich viele Schluessel, dieselbe Folge, dieselbe
       Gestalt DIE ZAHL STEHT AN EINER STELLE (LANG_KEY_COUNT, Stolperstein
       47). */
    const egCounts = Object.fromEntries(['de', 'en', 'tr']
      .map(c => [c, Object.keys(egFiles[c]).length]));
    check(`Zusage 2: die drei Dateien tragen gleich viele Schluessel — ${LANG_KEY_COUNT}`,
      ['de', 'en', 'tr'].every(c => egCounts[c] === LANG_KEY_COUNT), JSON.stringify(egCounts));
    check('Und in derselben Folge',
      ['en', 'tr'].every(c => JSON.stringify(Object.keys(egFiles[c])) ===
                              JSON.stringify(Object.keys(egFiles.de))), 'Folge geprueft');
    const egShape = Object.keys(egFiles.de).filter(k =>
      (typeof egFiles.de[k] === 'string') !== (typeof egFiles.en[k] === 'string'));
    check('Und jeder englische Wert hat die Gestalt seines deutschen — ein Mehrzahlpaar bleibt eines',
      egShape.length === 0, egShape.join(' ') || 'gleiche Gestalt');

    /* ---- Zusage 3: jeder Platzhalter steht gleich -----------------------
       BEIDE RICHTUNGEN, und die zweite ist die wichtigere: ein Platz, der
       weggefallen ist, nimmt dem Satz seine Zahl; einer, der dazugekommen
       ist, steht woertlich am Bildschirm („3 Kommentare{of}" -- 0.31.1). */
    const egPlaces = (v) => new Set([...String(v).matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m => m[1]));
    const egPlaceOff = [];
    for (const [name, , de, en] of egPairs) {
      const want = egPlaces(de), got = egPlaces(en);
      if ([...want].some(p => !got.has(p)) || [...got].some(p => !want.has(p)))
        egPlaceOff.push(`${name}: de {${[...want].join(' ')}} en {${[...got].join(' ')}}`);
    }
    check('Zusage 3: jeder Platzhalter des deutschen Satzes steht auch im englischen — und keiner mehr',
      egPlaceOff.length === 0, egPlaceOff.slice(0, 6).join(' · ') || 'alle gleich');

    /* ---- Zusage 4: die Verbotsliste ------------------------------------
       DREIZEHN MUSTER, UND JEDES MIT SEINEM GRUND. */
    const EG_FORBIDDEN = [
      [/leaves? the house/i,  'das Haus verlassen — deutsches Idiom, im Deutschen laengst gestrichen'],
      [/\bthe run\b/i,        '„der Lauf" — deutsches Entwicklerdenken, kein Satzgegenstand'],
      [/backup written/i,     'Denglisch — eine Sicherung wird erstellt und nicht geschrieben'],
      [/\bsits?\b/i,          'Dateien und Ordner sitzen nicht — sie liegen (is located in)'],
      [/\bthings?\b/i,        '„Sache" als Verlegenheitswort — es heisst item oder entry'],
      [/\bpills?\b/i,         'CSS-Jargon fuer einen Knopf'],
      [/still image/i,        'Fernseh- und Schnittbegriff — es heisst video thumbnail'],
      [/\bby hand\b/i,        'woertlich aus „von Hand" — es heisst manually'],
      [/like the device/i,    'woertlich aus „wie das Gerät" — die Karte sagt „Auto"'],
      [/\bposts?\b/i,         'Kriterion ist kein Forum — es heisst contribution oder entry'],
      [/nobody reads/i,       'zu flapsig fuer einen Transaktionsbrief'],
      [/\bwhoever\b/i,        'woertlich aus „wer …, der …" — es heisst anyone who'],
      [/already current/i,    'holpriges Englisch — es heisst already up to date']
    ];
    /* ERST DER LESER SELBST: ein Waechter, dessen Muster nichts finden KANN,
       ist gruen und sagt nichts. */
    check('Der Leser der Verbotsliste findet, was vor dieser Runde dastand',
      EG_FORBIDDEN.filter(([rx]) => rx.test(egBare('The key sits next to the database')) ||
        rx.test(egBare('Thing, singular')) ||
        rx.test(egBare('A click on one of the three pills sets the filter itself.'))).length === 3,
      'der Leser sieht die alten Saetze nicht mehr');
    check('Und er faerbt sich an einem Platzhalter NICHT — `{thing}` ist das Vokabelwort',
      !EG_FORBIDDEN.some(([rx]) => rx.test(egBare('{items} {thing}, {photos} photos'))),
      'ein Platz faerbt den Waechter');
    check('Und es sind wirklich dreizehn Muster, jedes mit seinem Grund',
      EG_FORBIDDEN.length === 13 && EG_FORBIDDEN.every(([, why]) => why.length > 20),
      `${EG_FORBIDDEN.length} Muster`);
    const egForbidden = [];
    for (const [name, , , en] of egPairs)
      for (const [rx, why] of EG_FORBIDDEN)
        if (rx.test(egBare(en))) egForbidden.push(`${name} (${rx.source}: ${why})`);
    check('Zusage 4: kein englischer Wert traegt ein Wort der Verbotsliste',
      egForbidden.length === 0,
      egForbidden.slice(0, 8).join(' · ') || 'keiner');

    /* ---- Zusage 5: keine HTML-Entitaet ---------------------------------
       0.31.1 HAT DIESE ZUSAGE AUSDRUECKLICH NUR AUF DEUTSCH GEGEBEN -- ihre
       Zusage 8 war eine Runde lang bewusst halb, weil die Entitaet aus
       `card.nameFreedHint` nur mit einem neu formulierten Satz herauskommt. */
    const egEntity = egPairs.filter(([, , , en]) => /&[a-z]+;|&#\d+;/i.test(en));
    check('Zusage 5: kein englischer Wert traegt eine HTML-Entitaet',
      egEntity.length === 0, egEntity.map(([n]) => n).join(' ') || 'keiner');

    /* ---- Zusage 6: kein englischer Wert ist deutlich laenger -----------
       NUR IN EINE RICHTUNG, und das ist die Entscheidung des Auftrags (F7):
       Englisch braucht fuer dieselbe Aussage regelmaessig weniger Zeichen als
       Deutsch, also darf es kuerzer sein und soll es oft. */
    const EG_LONG_FROM = 40, EG_LONG_MAX = 1.15;
    const egTooLong = egPairs
      .filter(([, , de, en]) => de.length >= EG_LONG_FROM && en.length > de.length * EG_LONG_MAX)
      .map(([n, , de, en]) => `${n} ${(en.length / de.length).toFixed(2)}x (de ${de.length} en ${en.length})`);
    check(`Zusage 6: kein englischer Wert ab ${EG_LONG_FROM} Zeichen ist mehr als ${EG_LONG_MAX}x so lang wie sein deutscher`,
      egTooLong.length === 0, egTooLong.slice(0, 8).join(' · ') || 'keiner');

    /* ---- Zusage 7: nicht mehr Saetze als der deutsche ----------------- DIE
       KUERZE STECKT NICHT IN DEN ZEICHEN, SONDERN IN DEN SAETZEN. */
    const EG_SHORTHAND = /\b(?:z\. ?B\.|bzw\.|usw\.|ggf\.|u\. ?a\.|vgl\.|Nr\.|ca\.|e\.g\.|i\.e\.|etc\.|approx\.)/g;
    const egSentences = (v) => (egBare(String(v).replace(EG_SHORTHAND, 'x'))
      .match(/[.!?](?=\s|$)/g) || []).length;
    check('Der Satzzaehler sieht die Abkuerzung nicht als Satzende',
      egSentences('Zwei Wörter, z. B. drei. Und noch einer.') === 2 &&
      egSentences('Two words, e.g. three. And one more.') === 2,
      `${egSentences('Zwei Wörter, z. B. drei. Und noch einer.')} und ${egSentences('Two words, e.g. three. And one more.')}`);
    const egMoreSentences = egPairs
      .filter(([, , de, en]) => egSentences(en) > egSentences(de))
      .map(([n, , de, en]) => `${n} (de ${egSentences(de)} en ${egSentences(en)})`);
    check('Zusage 7: kein englischer Wert traegt mehr Saetze als sein deutscher',
      egMoreSentences.length === 0, egMoreSentences.slice(0, 8).join(' · ') || 'keiner');

    /* ---- Zusage 8: en-GB, und zwar durchgehend ------------------------
       `_locale` SAGT ES SEIT 0.24.3, und heute ist die Zeile schon gruen --
       sie steht hier, damit sie es bleibt. */
    const EG_US = [['color', 'colour'], ['colors', 'colours'], ['colored', 'coloured'],
      ['favorite', 'favourite'], ['favorites', 'favourites'], ['behavior', 'behaviour'],
      ['organize', 'organise'], ['organized', 'organised'], ['optimize', 'optimise'],
      ['customize', 'customise'], ['recognize', 'recognise'], ['analyze', 'analyse'],
      ['catalog', 'catalogue'], ['center', 'centre'], ['canceled', 'cancelled'],
      ['gray', 'grey']];
    check('Die Tafel der US-Schreibungen nennt zu jeder ihre britische Seite',
      EG_US.length === 16 && EG_US.every(([us, uk]) => us && uk && us !== uk),
      `${EG_US.length} Paare`);
    const egUs = [];
    for (const [name, , , en] of egPairs)
      for (const [us, uk] of EG_US)
        if (new RegExp(`\\b${us}\\b`, 'i').test(en)) egUs.push(`${name}: ${us} → ${uk}`);
    check('Zusage 8: kein englischer Wert traegt eine US-Schreibung — en-GB steht in `_locale`',
      egUs.length === 0 && egFiles.en._locale === 'en-GB',
      egUs.slice(0, 6).join(' · ') || `keine · ${egFiles.en._locale}`);

    /* ---- Zusage 9: kein Weissraum aus dem Quelltext -------------------
       0.31.1 HAT IHN IN ALLEN DREI DATEIEN GENOMMEN, und die Zeile dort gilt
       weiter. */
    const egSpace = egPairs.filter(([, , , en]) => /\n[ \t]|[ \t][ \t]/.test(en));
    check('Zusage 9: kein englischer Wert traegt die Einrueckung des Quelltexts',
      egSpace.length === 0, egSpace.map(([n]) => n).join(' ') || 'keiner');
    const EG_LETTERS = ['mail.confirm.body', 'mail.invite.body', 'mail.reset.body', 'mail.test.body'];
    const egBreak = [...new Set(egPairs.filter(([, , , en]) => en.includes('\n')).map(([n]) => n))];
    check('Und ein Umbruch steht nur in den vier Briefen, wo er ein Absatz ist',
      egBreak.sort().join(' ') === EG_LETTERS.join(' '), egBreak.join(' ') || 'keiner');
    /* UND DIE ABSAETZE STEHEN IN JEDEM BRIEF. */
    check('Und jeder der vier Briefe traegt seine Leerzeilen',
      EG_LETTERS.every(k => String(egFiles.en[k]).includes('\n\n')),
      EG_LETTERS.filter(k => !String(egFiles.en[k]).includes('\n\n')).join(' ') || 'alle vier');

    /* ---- Zusage 10: der englische Stand liegt als Vergleichsdatei daneben
       ES GIBT KEINE ABNAHME FUER ENGLISCH. */
    const egPrintFile = path.join(__dirname, 'tools', 'englisch-0312.json');
    check('Zusage 10: der englische Stand liegt als Vergleichsdatei daneben',
      fs.existsSync(egPrintFile), 'tools/englisch-0312.json');
    const egFile = fs.existsSync(egPrintFile)
      ? JSON.parse(fs.readFileSync(egPrintFile, 'utf8')) : {};
    const egPrint = egFile.values || {};
    /* UND SIE SAGT, WAS SIE IST UND WOHER SIE KOMMT. */
    check('Und sie nennt ihre Runde und ihr Werkzeug',
      egFile.round === '0.31.2' && /englischstand\.js/.test(String(egFile._about)),
      `${egFile.round} · ${String(egFile._about || '').slice(0, 60)}`);
    check('Und das Werkzeug, das sie schreibt, liegt daneben',
      fs.existsSync(path.join(__dirname, 'tools', 'englischstand.js')),
      'tools/englischstand.js');
    /* DER VERGLEICHSSTAND WAECHST NICHT MIT -- er haelt den Stand von 0.31.2. */
    /* UND ACHTZEHN MIT 0.32.0. Sie stehen namentlich hier, alphabetisch wie in
       der Datei -- jede Runde, die einen Schluessel anlegt, traegt ihn ein. */
    /* UND EINER MIT 0.33.0: `server.exportTooOld`, die eine Abweisung des
       Bruchs. */
    const EG_ADDED_AFTER_0312 = ['_afterNumber',
      'card.grade', 'entry.deletePhoto', 'entry.deleteVideo',
      'list.bellMine', 'list.bellOther', 'list.bellToMe',
      'list.markedCount', 'mail.ownServer',
      'server.backupsBeforeKey', 'server.cleanupAllYoungest', 'server.cleanupNoBackups',
      'server.cleanupOldestAge', 'server.exportTooOld', 'server.noAccountOwner',
      'server.noPublicAddress', 'server.noTestMail', 'server.noUserAddress',
      'server.signupThanks', 'vocabulary.grade'];
    /* UND EINER IST GEFALLEN -- `list.otherUser`. */
    /* UND SIEBEN MIT 0.32.1 -- sechs, die 0.32.1 ausbaut, und der geteilte
       `entry.deleteWord`. */
    /* UND ZWEI MIT 0.33.0: `card.catchUpDerivatives` und
       `card.derivativesAsk` -- die JPEG-Haelfte des Bestandslaufs. */
    const EG_GONE_AFTER_0312 = ['card.catchUpDerivatives', 'card.derivativesAsk',
      'entry.deleteWord', 'list.and', 'list.followsSort',
      'list.ofWhich', 'list.otherUser', 'list.pillHint', 'list.sortDefaultHint'];
    const egAdded = Object.keys(egFiles.en).filter(k => !(k in egPrint));
    const egLost = Object.keys(egPrint).filter(k => !(k in egFiles.en));
    check(`Und sie traegt die Schluessel von en.json — bis auf die benannten neuen (${EG_ADDED_AFTER_0312.length}) und den einen gefallenen`,
      egAdded.sort().join(' ') === [...EG_ADDED_AFTER_0312].sort().join(' ')
      && egLost.join(' ') === EG_GONE_AFTER_0312.join(' '),
      `neu ${egAdded.join(' ') || 'keiner'} · verloren ${egLost.join(' ') || 'keiner'}`);
    /* DIE TAFEL STEHT IN DER REIHENFOLGE DER DATEI und nicht in der der
       Runden: die Zeile darunter vergleicht die Schluessel als FOLGE, damit
       ein Eintrag nicht doppelt oder an der falschen Stelle stehen kann. */
    const EG_CHANGED_AFTER_0312 = EG_CHANGED_AFTER_0312_SHARED;
    const egDiff = Object.keys(egFiles.en)
      .filter(k => JSON.stringify(egPrint[k]) !== JSON.stringify(egFiles.en[k]));
    check('Und jeder englische Wert ist Zeichen fuer Zeichen der des Vergleichsstands — ausser den benannten',
      egDiff.join(' ') === Object.keys(EG_CHANGED_AFTER_0312).join(' '),
      egDiff.slice(0, 8).join(' ') || 'alle gleich');
    /* UND DIE TAFEL IST IN BEIDE RICHTUNGEN GESCHLOSSEN -- 0.31.1, Zusage 2. */
    const egStale = Object.keys(EG_CHANGED_AFTER_0312).filter(k => !egDiff.includes(k));
    check('Und kein Eintrag der Tafel benennt einen Unterschied, den es nicht gibt',
      egStale.length === 0, egStale.join(' ') || 'keine Karteileiche');
  }
}

/* ================================================================= 0.31.3 —
   „Tuerkisch sitzt" DREIZEHN ZUSAGEN UEBER EINE EINZIGE DATEI, und es ist die
   letzte der vier Runden der 31er-Strecke: 0.31.0 hat die Sprachdateien
   gegengelesen, 0.31.1 hat die zersaegten Saetze zusammengesetzt, 0.31.2 hat
   Englisch auf den Stand des Deutschen gebracht. */
/* DIE VIER PRUEFSUMMEN DER BASIS, gemessen am gebauten Stand dieser Runde --
   DE_UNTOUCHED steht schon oben bei 0.31.2 und wird hier WEITERBENUTZT und
   nicht abgeschrieben: zwei Zahlen an zwei Orten laufen auseinander. */
/* 9cfb555855459a0c / 98295846dd0ac5a4 -- 0.31.3 2f8e5b3abe58f9fd /
   39489ec6ae18020b -- vor 0.31.3; derselbe Grund wie oben. */
const EN_UNTOUCHED = { one: 'caa4b814e75f8263', other: 'f224721465ac0d35' };
const TR_BEFORE_0313 = { one: '5fec71b10c0dfa3c', other: '18b07eda589b5120' };
/* bbaca227348609dc / 73d9f1ea0298d519 -- der Stand VOR der Berichtigung an
   der Vorschau der Vokabelkarte, die der Augenschein von 0.31.3 verlangt hat. */
const TR_AFTER_0313 = { one: 'ab6bdf35499f7cf9', other: 'ad34f68137acaa2b' };

async function check0313() {
  const tgRead = (code) => JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
  const tgFiles = { de: tgRead('de'), en: tgRead('en'), tr: tgRead('tr') };
  /* JEDES PAAR MIT SEINER FORM -- dieselbe Bauform wie in 0.31.2: ein
     Mehrzahlsatz kann in der Einzahl sitzen und in der Mehrzahl auseinander-
     laufen. */
  const tgPairs = [];
  for (const [k, dv] of Object.entries(tgFiles.de)) {
    if (k.startsWith('_')) continue;
    const tv = tgFiles.tr[k];
    if (typeof dv === 'string') tgPairs.push([k, '', String(dv), typeof tv === 'string' ? tv : '']);
    else for (const f of Object.keys(dv))
      tgPairs.push([`${k}/${f}`, f, String(dv[f]),
        tv && typeof tv === 'object' && tv[f] !== undefined ? String(tv[f]) : '']);
  }
  /* DIE PLAETZE FALLEN VOR JEDER WORTPRUEFUNG HERAUS. `{thing}` ist das
     Vokabelwort des Betreibers und kein tuerkischer Satzteil. */
  const tgBare = (v) => String(v).replace(/\{[A-Za-z0-9_]+\}/g, ' ');

  group('Tuerkisch sitzt — 0.31.3');
  {
    /* ---- Zusage 1: Deutsch UND Englisch sind unangetastet ---------------
       NACHGERECHNET UND NICHT BEHAUPTET, und diesmal fuer ZWEI Sprachen. */
    const tgOut = path.join(os.tmpdir(), `kriterion-gleichlaut-tr-${process.pid}.json`);
    const tgRun = spawnSync(process.execPath, ['tools/gleichlaut.js', tgOut],
      { cwd: __dirname, encoding: 'utf8' });
    const tgSums = {};
    for (const line of String(tgRun.stdout || '').split('\n')) {
      const m = line.match(/^(de|en|tr)\/(one|other)\s+([0-9a-f]{16})/);
      if (m) tgSums[`${m[1]}/${m[2]}`] = m[3];
    }
    fs.rmSync(tgOut, { force: true });
    check('Zusage 1: die Gleichlautprobe laeuft und nennt ihre sechs Summen',
      Object.keys(tgSums).length === 6,
      `${Object.keys(tgSums).length} Summen · ${String(tgRun.stderr || '').slice(0, 200)}`);
    check(`Und die beiden deutschen sind die des gebauten Stands — ${DE_UNTOUCHED.one} · ${DE_UNTOUCHED.other}`,
      tgSums['de/one'] === DE_UNTOUCHED.one && tgSums['de/other'] === DE_UNTOUCHED.other,
      `de/one ${tgSums['de/one']} · de/other ${tgSums['de/other']}`);
    check(`Und die beiden englischen auch — ${EN_UNTOUCHED.one} · ${EN_UNTOUCHED.other}`,
      tgSums['en/one'] === EN_UNTOUCHED.one && tgSums['en/other'] === EN_UNTOUCHED.other,
      `en/one ${tgSums['en/one']} · en/other ${tgSums['en/other']}`);
    /* UND DIE GEGENRICHTUNG. */
    check('Und die beiden tuerkischen sind NICHT die von 0.31.2 — die Runde hat Tuerkisch angefasst',
      tgSums['tr/one'] !== TR_BEFORE_0313.one && tgSums['tr/other'] !== TR_BEFORE_0313.other,
      `0.31.2: ${TR_BEFORE_0313.one} · ${TR_BEFORE_0313.other}`);
    check(`Und sie sind die dieser Runde — ${TR_AFTER_0313.one} · ${TR_AFTER_0313.other}`,
      tgSums['tr/one'] === TR_AFTER_0313.one && tgSums['tr/other'] === TR_AFTER_0313.other,
      `tr/one ${tgSums['tr/one']} · tr/other ${tgSums['tr/other']}`);
    /* UND DER ENGLISCHE VERGLEICHSSTAND VON 0.31.2 STIMMT WEITER. */
    const tgEnPrint = path.join(__dirname, 'tools', 'englisch-0312.json');
    const tgEnFile = fs.existsSync(tgEnPrint)
      ? (JSON.parse(fs.readFileSync(tgEnPrint, 'utf8')).values || {}) : {};
    /* `_afterNumber` IST SEIT 0.31.4 DABEI und steht namentlich da: er ist
       der einzige englische Schluessel, den der Vergleichsstand von 0.31.2
       nicht kennt, und sein Wert (`plural`) ist genau das Verhalten von
       vorher. */
    /* UND SEIT 0.32.0 STEHT DIE TAFEL EINEN STOCK HOEHER. */
    const tgEnNamed = Object.keys(EG_CHANGED_AFTER_0312_SHARED);
    const tgEnDiff = Object.keys(tgFiles.en)
      .filter(k => JSON.stringify(tgEnFile[k]) !== JSON.stringify(tgFiles.en[k]));
    check('Und kein englischer Wert weicht vom Vergleichsstand von 0.31.2 ab — ausser den benannten',
      tgEnDiff.join(' ') === tgEnNamed.join(' '),
      tgEnDiff.filter(k => !tgEnNamed.includes(k)).slice(0, 8).join(' ') || 'alle gleich');

    /* ---- Zusage 2: gleich viele Schluessel, dieselbe Folge, dieselbe Gestalt */
    const tgCounts = Object.fromEntries(['de', 'en', 'tr']
      .map(c => [c, Object.keys(tgFiles[c]).length]));
    check(`Zusage 2: die drei Dateien tragen gleich viele Schluessel — ${LANG_KEY_COUNT}`,
      ['de', 'en', 'tr'].every(c => tgCounts[c] === LANG_KEY_COUNT), JSON.stringify(tgCounts));
    check('Und in derselben Folge',
      ['en', 'tr'].every(c => JSON.stringify(Object.keys(tgFiles[c])) ===
                              JSON.stringify(Object.keys(tgFiles.de))), 'Folge geprueft');
    const tgShape = Object.keys(tgFiles.de).filter(k =>
      (typeof tgFiles.de[k] === 'string') !== (typeof tgFiles.tr[k] === 'string'));
    check('Und jeder tuerkische Wert hat die Gestalt seines deutschen — ein Mehrzahlpaar bleibt eines',
      tgShape.length === 0, tgShape.join(' ') || 'gleiche Gestalt');

    /* ---- Zusage 3: jeder Platzhalter steht gleich -----------------------
       BEIDE RICHTUNGEN. */
    /* DIE BEIDEN FORMEN EINES VOKABELWORTS SIND DERSELBE PLATZ -- 0.31.4. */
    const TR_VOC_FORMS = [['entryOne', 'entryMany'], ['dayOne', 'dayMany'],
      ['reportOne', 'reportMany'], ['taskOne', 'taskMany'], ['ratingOne', 'ratingMany']];
    const tgFamily = Object.fromEntries(TR_VOC_FORMS.flatMap(([a, b]) => [[a, a], [b, a]]));
    const tgPlaces = (v) => new Set([...String(v).matchAll(/\{([A-Za-z0-9_]+)\}/g)]
      .map(m => tgFamily[m[1]] || m[1]));
    const tgPlaceOff = [];
    for (const [name, , de, tr] of tgPairs) {
      const want = tgPlaces(de), got = tgPlaces(tr);
      if ([...want].some(p => !got.has(p)) || [...got].some(p => !want.has(p)))
        tgPlaceOff.push(`${name}: de {${[...want].join(' ')}} tr {${[...got].join(' ')}}`);
    }
    check('Zusage 3: jeder Platzhalter des deutschen Satzes steht auch im tuerkischen — und keiner mehr',
      tgPlaceOff.length === 0, tgPlaceOff.slice(0, 6).join(' · ') || 'alle gleich');

    /* ---- Zusage 4: die Verbotsliste, und sie liest STAEMME --------------
       ELF MUSTER, JEDES MIT SEINEM GRUND. */
    const TR_STEM = (s) => new RegExp(`(?<![\\p{L}\\p{N}_])${s}`, 'u');
    const TR_FORBIDDEN = [
      [TR_STEM('hap'),                'hap — Kopfschmerztablette; CSS-Jargon fuer einen Knopf'],
      [TR_STEM('evden\\s+çık'),       'evden çıkan — woertlich „das Haus verlassend", im Deutschen laengst gestrichen'],
      [TR_STEM('[Ss]abit\\s+res'),    'sabit resim — Standbild aus dem Schnittraum; es heisst kapak resmi'],
      [TR_STEM('Şey'),                'Şey — Slang fuer die Codevariable $thing; es heisst Tekil/Çoğul'],
      [TR_STEM('[Cc]ihaz\\s+gibi'),   'Cihaz gibi — klingt nach einer Geraeteeigenschaft; die Karte sagt „Otomatik"'],
      [TR_STEM('Çalışma\\s'),         'Çalışma — der deutsche „Lauf" als Person; im Tuerkischen steht dort das Passiv'],
      [TR_STEM('yanında\\s+dur'),     'yanında duruyor — Dateien stehen nicht nebeneinander, sie liegen im Verzeichnis'],
      [TR_STEM('son\\s+görülme'),     'son görülme — woertlich aus „last seen"; es heisst son etkinlik'],
      [TR_STEM('içeri\\s+gir'),       'içeri girer — Kneipenton fuer den Zugang zu einem Konto'],
      [TR_STEM('[Kk]imse\\s+okum'),   'Kimse okumaz — zu flapsig fuer einen Transaktionsbrief'],
      [TR_STEM('Şu:'),                'Şu: — der deutsche Artikel als „Dieses da:"; der Grammatik-Kollaps selbst']
    ];
    /* ERST DER LESER SELBST: ein Waechter, dessen Muster nichts finden KANN,
       ist gruen und sagt nichts. */
    check('Der Leser der Verbotsliste findet, was vor dieser Runde dastand',
      TR_FORBIDDEN.filter(([rx]) =>
        rx.test(tgBare('Üç haptan birine tıklamak filtreyi kendisi ayarlar.')) ||
        rx.test(tgBare('Yalnızca sabit resmi olan videoya izin verilir')) ||
        rx.test(tgBare('Şey, tekil')) ||
        rx.test(tgBare('Anahtar veritabanının yanında duruyor')) ||
        rx.test(tgBare('Şu: {word} giriş sayfasında durur'))).length === 5,
      'der Leser sieht die alten Saetze nicht mehr');
    /* UND ER FAENGT DIE ENDUNG UND NICHT NUR DAS NACKTE WORT. */
    check('Und er faengt die angeklebte Endung — mit `\\b` waeren fuenf Treffer durchgegangen',
      TR_FORBIDDEN[0][0].test('haptan') && TR_FORBIDDEN[2][0].test('sabit resmi') &&
      TR_FORBIDDEN[3][0].test('Şey, tekil') && !/\bŞey\b/.test('Şey, tekil'),
      'der Stammleser liest wie ein Wortleser');
    /* UND ER FAERBT SICH NICHT AM HARMLOSEN WORT. */
    check('Und er faerbt sich an einem Platzhalter NICHT — `{thing}` ist das Vokabelwort',
      !TR_FORBIDDEN.some(([rx]) => rx.test(tgBare('{items} {thing}, {photos} fotoğraf'))),
      'ein Platz faerbt den Waechter');
    check('Und es sind wirklich elf Muster, jedes mit seinem Grund',
      TR_FORBIDDEN.length === 11 && TR_FORBIDDEN.every(([, why]) => why.length > 20),
      `${TR_FORBIDDEN.length} Muster`);
    const tgForbidden = [];
    for (const [name, , , tr] of tgPairs)
      for (const [rx, why] of TR_FORBIDDEN)
        if (rx.test(tgBare(tr))) tgForbidden.push(`${name} (${rx.source}: ${why})`);
    check('Zusage 4: kein tuerkischer Wert traegt ein Wort der Verbotsliste',
      tgForbidden.length === 0, tgForbidden.slice(0, 8).join(' · ') || 'keiner');

    /* ---- Zusage 5: die Anfuehrungszeichen sind tuerkisch ----------------
       `„…“` GIBT ES IN DER TUERKISCHEN TYPOGRAFIE NICHT. */
    const tgGerman = tgPairs.filter(([, , , tr]) => /[„]/.test(tr));
    check('Zusage 5: kein tuerkischer Wert traegt ein deutsches Anfuehrungszeichen',
      tgGerman.length === 0, tgGerman.map(([n]) => n).join(' ') || 'keiner');
    const tgStraight = tgPairs.filter(([, , , tr]) => /"/.test(tr));
    check('Und keinen geraden Ersatz — `“…”` und nicht `\\"…\\"`',
      tgStraight.length === 0, tgStraight.map(([n]) => n).join(' ') || 'keiner');
    const tgUnpaired = tgPairs.filter(([, , , tr]) =>
      (String(tr).match(/“/g) || []).length !== (String(tr).match(/”/g) || []).length);
    check('Und jedes Paar ist geschlossen — so viele `“` wie `”`',
      tgUnpaired.length === 0, tgUnpaired.map(([n]) => n).join(' ') || 'alle geschlossen');
    /* UND ES GIBT SIE UEBERHAUPT. */
    const TR_QUOTED = 60;
    const tgQuoted = tgPairs.filter(([, , , tr]) => /“/.test(tr));
    check(`Und die Datei traegt wirklich tuerkische Paare — mehr als ${TR_QUOTED}`,
      tgQuoted.length > TR_QUOTED, `${tgQuoted.length} Formen mit „“…”"`);

    /* ---- Zusage 6: kein tuerkischer Wert ist deutlich laenger -----------
       DIESELBE DECKE WIE BEI ENGLISCH (Auftrag, F8): ab vierzig Zeichen
       hoechstens 1,15x. */
    const TR_LONG_FROM = 40, TR_LONG_MAX = 1.15;
    const tgTooLong = tgPairs
      .filter(([, , de, tr]) => de.length >= TR_LONG_FROM && tr.length > de.length * TR_LONG_MAX)
      .map(([n, , de, tr]) => `${n} ${(tr.length / de.length).toFixed(2)}x (de ${de.length} tr ${tr.length})`);
    check(`Zusage 6: kein tuerkischer Wert ab ${TR_LONG_FROM} Zeichen ist mehr als ${TR_LONG_MAX}x so lang wie sein deutscher`,
      tgTooLong.length === 0, tgTooLong.slice(0, 8).join(' · ') || 'keiner');

    /* ---- Zusage 7: nicht mehr Saetze als der deutsche -----------------
       SECHS TUERKISCHE WERTE TRUGEN MEHR SAETZE als ihr deutscher, und es
       waren genau die sechs, die auf Englisch auch zu viele hatten. */
    const TR_SHORTHAND = /(?:z\. ?B\.|bzw\.|usw\.|ggf\.|u\. ?a\.|vgl\.|Nr\.|ca\.|örn\.|vb\.|bkz\.)/g;
    const tgSentences = (v) => (tgBare(String(v).replace(TR_SHORTHAND, 'x'))
      .match(/[.!?](?=\s|$)/g) || []).length;
    check('Der Satzzaehler sieht die Abkuerzung nicht als Satzende — auch die tuerkische',
      tgSentences('Zwei Wörter, z. B. drei. Und noch einer.') === 2 &&
      tgSentences('Dosya adı BCP 47 etiketidir (örn. de-DE). İkinci cümle.') === 2,
      `${tgSentences('Zwei Wörter, z. B. drei. Und noch einer.')} und ${tgSentences('Dosya adı BCP 47 etiketidir (örn. de-DE). İkinci cümle.')}`);
    const tgMoreSentences = tgPairs
      .filter(([, , de, tr]) => tgSentences(tr) > tgSentences(de))
      .map(([n, , de, tr]) => `${n} (de ${tgSentences(de)} tr ${tgSentences(tr)})`);
    check('Zusage 7: kein tuerkischer Wert traegt mehr Saetze als sein deutscher',
      tgMoreSentences.length === 0, tgMoreSentences.slice(0, 8).join(' · ') || 'keiner');

    /* ---- Zusage 8: keine HTML-Entitaet ---------------------------------
       DIE LETZTE DER DREI. */
    const tgEntity = tgPairs.filter(([, , , tr]) => /&[a-z]+;|&#\d+;/i.test(tr));
    check('Zusage 8: kein tuerkischer Wert traegt eine HTML-Entitaet',
      tgEntity.length === 0, tgEntity.map(([n]) => n).join(' ') || 'keiner');

    /* ---- Zusage 9: die fuenf Vokabelmehrzahlen tragen DASSELBE Wort ----
       HIER STEHT DIE ZUSAGE UMGEKEHRT, WIE DER AUFTRAG SIE VORGESCHLAGEN HAT,
       und der Grund ist gemessen und nicht gemeint. */
    /* ================= 0.31.4 HAT DIESE ZUSAGE UMGEDREHT =================
       SIE STAND HIER: „die fuenf Vokabelpaare tragen auf Tuerkisch DASSELBE
       Wort" -- und sie war richtig, solange EIN Platz ZWEI Stellungen tragen
       musste. */
    const TR_VOC_PAIRS = [['entryOne', 'entryMany'], ['dayOne', 'dayMany'],
      ['reportOne', 'reportMany'], ['taskOne', 'taskMany'], ['ratingOne', 'ratingMany']];
    const tgSamePair = TR_VOC_PAIRS.filter(([one, many]) =>
      tgFiles.tr['vocabulary.' + one] === tgFiles.tr['vocabulary.' + many]);
    check('Zusage 9: die fuenf Vokabelpaare tragen auf Tuerkisch verschiedene Woerter — seit 0.31.4',
      tgSamePair.length === 0 && TR_VOC_PAIRS.length === 5,
      tgSamePair.map(([o]) => `${o}: ${tgFiles.tr['vocabulary.' + o]}`)
        .join(' · ') || 'alle fuenf verschieden');
    check('Und auf Deutsch und Englisch auch — die Regel gilt je Sprache, sagt aber hier dasselbe',
      TR_VOC_PAIRS.every(([one, many]) =>
        tgFiles.de['vocabulary.' + one] !== tgFiles.de['vocabulary.' + many] &&
        tgFiles.en['vocabulary.' + one] !== tgFiles.en['vocabulary.' + many]),
      'eine der beiden Basen zieht die Formen zusammen');
    const TR_COUNTED_IN_CODE = 18, TR_COUNTED_IN_FILE = 6;
    const tgApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
    const tgInCode = (tgApp.match(
      /\$\{[^{}]*\}\s+\$\{(?:esc\()?(?:vThing|vTime|vReport|vTask|vRating)\(/g) || []).length;
    const TR_NUM = ['n', 'length', 'count', 'items', 'entries', 'usage_count',
      'test_usage_count', 'visible', 'votes', 'open', 'testCount'];
    const TR_VOC_PLACE = ['thing', 'things', 'dayWord', 'task', 'report', 'rating', 'entryWord'];
    const tgNumThenWord = new RegExp(
      `\\{(?:${TR_NUM.join('|')})\\}[^{]{0,3}\\{(?:${TR_VOC_PLACE.join('|')})\\}`);
    const tgInFile = tgPairs.filter(([, , , tr]) => tgNumThenWord.test(tr)).length;
    check(`Und das Vokabelwort steht wirklich hinter einer Zahl — ${TR_COUNTED_IN_CODE} Stellen im Quelltext, ${TR_COUNTED_IN_FILE} in der Datei`,
      tgInCode === TR_COUNTED_IN_CODE && tgInFile === TR_COUNTED_IN_FILE,
      `Quelltext ${tgInCode} · Datei ${tgInFile}`);
    /* UND DER LESER WUERDE EINEN VERSTOSS FINDEN. Ohne diese Zeile waere die
       Messung darueber auch mit einem kaputten Muster gruen. */
    check('Und der Leser der Datei trennt Einzahl und Mehrzahl nicht — er sucht die Nachbarschaft',
      tgNumThenWord.test('{length} {thing} yan yana kondu.') &&
      !tgNumThenWord.test('her {thing} için geçerlidir'),
      'der Leser sieht die Nachbarschaft nicht');

    /* ---- Zusage 10: keine Mehrzahl hinter einer Zahl ------------------ DIE
       GEGENLEITPLANKE ZUR VORLAGE (L7), und sie gilt fuer BEIDE Formen jedes
       Paares: „{n} dosya" und nie „{n} dosyalar". */
    const TR_LETTERS = 'A-Za-zÇĞİÖŞÜçğıöşü';
    const tgCounted = new RegExp(
      `(?:\\{n\\}|(?:^|[^${TR_LETTERS}0-9])[0-9]+)\\s+[${TR_LETTERS}]*(?:ler|lar)(?![${TR_LETTERS}])`);
    const tgPlural = tgPairs.filter(([, , , tr]) => tgCounted.test(tr)).map(([n]) => n);
    check('Zusage 10: keine Mehrzahl steht hinter einer Zahl — „{n} dosya", nie „{n} dosyalar"',
      tgPlural.length === 0, tgPlural.join(' ') || 'keine');
    check('Und der Leser wuerde einen Verstoss finden',
      tgCounted.test('3 yorumlar') && tgCounted.test('{n} dosyalar') && !tgCounted.test('3 yorum'),
      'der Leser trennt Einzahl und Mehrzahl nicht');
    /* UND DIE ZWEITE HAELFTE DER ZUSAGE, die der Augenschein dieser Runde
       gefunden hat und die KEIN Blick in die Sprachdatei findet. */
    const TR_COUNTED_PAIRS = [['dialog.comment', 'dialog.comments'],
      ['dialog.link', 'dialog.links'], ['dialog.file', 'dialog.files'],
      ['list.photo', 'list.photos'], ['list.video', 'list.videos']];
    const tgCountCalls = /countWord\([^,]+,\s*(?:t\('([^']+)'\)|V\.(\w+))\s*,\s*(?:t\('([^']+)'\)|V\.(\w+))\)/g;
    const tgPairsInCode = new Set();
    let tgCall, tgCallCount = 0;
    while ((tgCall = tgCountCalls.exec(tgApp)) !== null) {
      tgCallCount++;
      if (tgCall[1] && tgCall[3]) tgPairsInCode.add(`${tgCall[1]}/${tgCall[3]}`);
    }
    const TR_COUNTWORD_CALLS = 14;
    check(`Der Zaehlerhelfer steht wirklich im Quelltext — ${TR_COUNTWORD_CALLS} Rufe`,
      tgCallCount === TR_COUNTWORD_CALLS, `${tgCallCount} Rufe`);
    const tgStillPlural = TR_COUNTED_PAIRS.filter(([, many]) =>
      new RegExp(`[${TR_LETTERS}]*(?:ler|lar)$`).test(String(tgFiles.tr[many])));
    check('Und die fuenf Paare tragen ihre Mehrzahl — seit 0.31.4 an der richtigen Stelle gelesen',
      tgStillPlural.length === 5 && tgPairsInCode.size === 5,
      `${tgStillPlural.length} von 5 · im Quelltext ${tgPairsInCode.size} Paare: ${[...tgPairsInCode].join(' ')}`);
    /* UND DAS VOKABELPAAR AN DERSELBEN STELLE IST RICHTIG. */
    /* BIS 0.31.3 STAND HIER: „das Vokabelpaar an derselben Stelle ist
       richtig, weil beide Formen dasselbe Wort tragen." Das war der Beleg
       dafuer, dass die fuenf Paare oben eine Luecke sind und keine zweite
       Meinung. */
    check('Und das Vokabelpaar an derselben Stelle traegt zwei Woerter — `counted()` nimmt dort die Einzahl',
      tgFiles.tr['vocabulary.ratingOne'] !== tgFiles.tr['vocabulary.ratingMany'] &&
      /counted\(n, V\.ratingOne, V\.ratingMany\)/.test(tgApp),
      `${tgFiles.tr['vocabulary.ratingOne']} / ${tgFiles.tr['vocabulary.ratingMany']}`);
    /* UND DIE GROSSSCHREIBUNG IST NACHGEZOGEN -- der eine Handgriff, der
       keinen Zielkonflikt hat: `dialog.links` stand als „Bağlantılar" da,
       waehrend `dialog.files` und `dialog.comments` klein geschrieben sind. */
    check('Und die drei Mehrzahlwoerter der Bloecke sind gleich geschrieben — klein',
      ['dialog.links', 'dialog.files', 'dialog.comments']
        .every(k => /^[a-zçğıöşü]/.test(String(tgFiles.tr[k]))),
      ['dialog.links', 'dialog.files', 'dialog.comments']
        .map(k => `${k}: ${tgFiles.tr[k]}`).join(' · '));

    /* ---- Zusage 11: die Anrede ist durchgehend dieselbe --------------- sen
       UND NICHT siz (Auftrag, F4). */
    const TR_POLITE_VERBS = ['değiştir', 'boşalt', 'gir', 'yanıtla', 'kullan', 'tıkla',
      'seç', 'aç', 'kapat', 'yaz', 'oku', 'bekle', 'dene', 'kaydet', 'sil', 'ekle',
      'ayarla', 'gönder', 'verme', 'ver', 'yükle', 'kopyala', 'başlat', 'yap', 'et',
      'bul', 'iste'];
    /* DAS PUFFER-`y` GEHOERT DAZU, und es ist an dieser Zeile gelernt: die
       tuerkische Grammatik schiebt zwischen Vokal und Endung ein `y` ein --
       „vermeyiniz" ist `verme` + **y** + `iniz`, nicht `verme` + `iniz`. */
    const tgPolite = new RegExp(
      `(?<![\\p{L}\\p{N}_])(?:${TR_POLITE_VERBS.join('|')})y?(?:in|ın|un|ün)(?:iz|ız)?(?![\\p{L}])`, 'u');
    check('Der Leser der Anrede findet die hoefliche Befehlsform — und nicht den Genitiv',
      tgPolite.test('Birini değiştirin ya da boşaltın') && tgPolite.test('yanıt vermeyiniz') &&
      !tgPolite.test('dosyanın adı') && !tgPolite.test('Birini değiştir ya da boşalt'),
      'der Leser trennt Anrede und Genitiv nicht');
    const tgSiz = tgPairs.filter(([, , , tr]) => tgPolite.test(tr)).map(([n]) => n);
    check('Zusage 11: kein tuerkischer Wert spricht den Benutzer hoeflich an — sen, durchgehend',
      tgSiz.length === 0, tgSiz.join(' ') || 'keiner');
    /* UND `lütfen` STEHT NIRGENDS -- Woerterbuch TR-S2. „Bitte" steht 21-mal
       in `de.json`, und keine dieser Stellen wird eine Hoeflichkeitsfloskel. */
    const tgPlease = tgPairs.filter(([, , , tr]) => /lütfen/i.test(tr)).map(([n]) => n);
    check('Und `lütfen` steht in keinem tuerkischen Wert — TR-S2',
      tgPlease.length === 0, tgPlease.join(' ') || 'keiner');

    /* ---- Zusage 12: kein Weissraum aus dem Quelltext ------------------
       DIESELBE HAELFTE WIE IN 0.31.2, jetzt auf Tuerkisch: wer einen langen
       Satz im Quelltext umbricht, legt die Einrueckung in den Wert, und am
       Bildschirm faellt sie nicht auf -- HTML zieht sie zusammen. */
    const tgSpace = tgPairs.filter(([, , , tr]) => /\n[ \t]|[ \t][ \t]/.test(tr));
    check('Zusage 12: kein tuerkischer Wert traegt die Einrueckung des Quelltexts',
      tgSpace.length === 0, tgSpace.map(([n]) => n).join(' ') || 'keiner');
    const TR_LETTERS_KEYS = ['mail.confirm.body', 'mail.invite.body', 'mail.reset.body', 'mail.test.body'];
    const tgBreak = [...new Set(tgPairs.filter(([, , , tr]) => tr.includes('\n')).map(([n]) => n))];
    check('Und ein Umbruch steht nur in den vier Briefen, wo er ein Absatz ist',
      tgBreak.sort().join(' ') === TR_LETTERS_KEYS.join(' '), tgBreak.join(' ') || 'keiner');
    check('Und jeder der vier Briefe traegt seine Leerzeilen',
      TR_LETTERS_KEYS.every(k => String(tgFiles.tr[k]).includes('\n\n')),
      TR_LETTERS_KEYS.filter(k => !String(tgFiles.tr[k]).includes('\n\n')).join(' ') || 'alle vier');
    /* UND SIE SCHLIESSEN UNPERSOENLICH (F5). */
    const TR_LETTER_END = 'Bu ileti otomatik olarak gönderilmiştir; yanıtlar okunmaz.';
    const tgEnd = TR_LETTERS_KEYS.filter(k => !String(tgFiles.tr[k]).endsWith(TR_LETTER_END));
    check('Und jeder der vier Briefe schliesst unpersoenlich — F5',
      tgEnd.length === 0, tgEnd.join(' ') || 'alle vier');

    /* ---- Zusage 13: der tuerkische Stand liegt als Vergleichsdatei daneben
       DIESELBE BAUFORM WIE FUER ENGLISCH IN 0.31.2 (Auftrag, F10). */
    const tgPrintFile = path.join(__dirname, 'tools', 'tuerkisch-0313.json');
    check('Zusage 13: der tuerkische Stand liegt als Vergleichsdatei daneben',
      fs.existsSync(tgPrintFile), 'tools/tuerkisch-0313.json');
    const tgFile = fs.existsSync(tgPrintFile)
      ? JSON.parse(fs.readFileSync(tgPrintFile, 'utf8')) : {};
    const tgPrint = tgFile.values || {};
    check('Und sie nennt ihre Runde und ihr Werkzeug',
      tgFile.round === '0.31.3' && /tuerkischstand\.js/.test(String(tgFile._about)),
      `${tgFile.round} · ${String(tgFile._about || '').slice(0, 60)}`);
    check('Und das Werkzeug, das sie schreibt, liegt daneben',
      fs.existsSync(path.join(__dirname, 'tools', 'tuerkischstand.js')),
      'tools/tuerkischstand.js');
    /* DER VERGLEICHSSTAND WAECHST NICHT MIT. */
    /* UND ACHTZEHN MIT 0.32.0, Schluessel fuer Schluessel dieselben wie auf
       der englischen Seite -- L5 verlangt es: kein neuer Schluessel ohne alle
       drei Sprachen, und die Deckungsprobe faerbte den Lauf sofort rot. */
    /* UND EINER MIT 0.33.0 -- derselbe wie drueben: `server.exportTooOld`. */
    const TR_ADDED_AFTER_0313 = ['_afterNumber',
      'card.grade', 'entry.deletePhoto', 'entry.deleteVideo',
      'list.bellMine', 'list.bellOther', 'list.bellToMe',
      'list.markedCount', 'mail.ownServer',
      'server.backupsBeforeKey', 'server.cleanupAllYoungest', 'server.cleanupNoBackups',
      'server.cleanupOldestAge', 'server.exportTooOld', 'server.noAccountOwner',
      'server.noPublicAddress', 'server.noTestMail', 'server.noUserAddress',
      'server.signupThanks', 'vocabulary.grade'];
    /* UND EINER IST GEFALLEN -- derselbe wie drueben: `list.otherUser`. */
    /* UND SIEBEN MIT 0.32.1 -- dieselben wie im englischen Stand daneben, und
       aus demselben Grund. */
    /* UND ZWEI MIT 0.33.0, wieder dieselben: die JPEG-Haelfte des
       Bestandslaufs nimmt in allen drei Dateien dieselben zwei Saetze mit. */
    const TR_GONE_AFTER_0313 = ['card.catchUpDerivatives', 'card.derivativesAsk',
      'entry.deleteWord', 'list.and', 'list.followsSort',
      'list.ofWhich', 'list.otherUser', 'list.pillHint', 'list.sortDefaultHint'];
    const tgAdded = Object.keys(tgFiles.tr).filter(k => !(k in tgPrint));
    const tgLost = Object.keys(tgPrint).filter(k => !(k in tgFiles.tr));
    check(`Und sie traegt die Schluessel von tr.json — bis auf die benannten neuen (${TR_ADDED_AFTER_0313.length}) und den einen gefallenen`,
      tgAdded.sort().join(' ') === [...TR_ADDED_AFTER_0313].sort().join(' ')
      && tgLost.join(' ') === TR_GONE_AFTER_0313.join(' '),
      `neu ${tgAdded.join(' ') || 'keiner'} · verloren ${tgLost.join(' ') || 'keiner'}`);
    /* DIE TAFEL WAR IN 0.31.3 LEER, UND SIE IST ES SEIT 0.31.4 NICHT MEHR --
       genau dafuer ist sie gebaut: „Wer Tuerkisch anfasst, schreibt den
       Schluessel mit seinem Grund hinein." VIERZEHN EINTRAEGE MIT 0.31.4, UND
       SIE ERZAEHLEN JENE RUNDE: fuenf Vokabelmehrzahlen bekommen ihr
       -ler/-lar (der Betreiber, 13.9.2026), fuenf Saetze waehlen die
       Einzahlform, weil ihre Grammatik sie verlangt, drei Kruecken aus 0.31.3
       fallen weg, und `_afterNumber` ist der Mechanismus selbst. */
    const TR_CHANGED_AFTER_0313 = {
      '_afterNumber':           '0.31.4: der Mechanismus — hinter einer Zahl die Einzahl',
      'card.catchUpAsk':        '0.33.0: der Dialog nennt die Vorschaubilder nicht mehr — und „mümkündür" wird „olur", damit er unter der Laengenlatte bleibt',
      'card.catchUpBoth':       '0.33.0: die Zeile unter dem Knopf sagt nur noch, was mit den Originalen geschieht',
      'card.convertFinished':   '0.33.0: der Fertigsatz nennt keine neu gerechneten Vorschaubilder mehr',
      'card.restartHint':       '0.33.0: die zitierte Logzeile heisst jetzt englisch „Key loaded from ENCRYPTION_KEY"',
      'server.exportTooOld':    '0.33.0: neu — die eine Abweisung des Bruchs, eine Datei mit Formatnummer 13 oder aelter kommt nicht mehr herein',
      'vocabulary.entryMany':   '0.31.4: Öğeler — die Mehrzahl kostet nichts mehr',
      'vocabulary.dayMany':     '0.31.4: Test günleri',
      'vocabulary.reportMany':  '0.31.4: Raporlar',
      'vocabulary.taskMany':    '0.31.4: Görevler',
      'vocabulary.ratingMany':  '0.31.4: Değerlendirmeler',
      'card.blocksHint':        '0.31.4: „her" verlangt die Einzahl — {entryOne}',
      'card.criteriaAdminHint': '0.31.4: „sayısı" verlangt die Einzahl — {entryOne}',
      'card.criteriaOrderHint': '0.31.4: „sayısı" verlangt die Einzahl — {entryOne}',
      'card.orderAppliesNote':  '0.31.4: „her" und „sayısı" verlangen die Einzahl — {entryOne}',
      'list.showAll':           '0.31.4: Substantivkette — das erste Glied steht in der Einzahl',
      'list.openTasks':         '0.31.4: die Kruecke „listesi" faellt — „Açık Görevler"',
      'list.noCategory':        '0.31.4: die Kruecke „listesi" faellt — „Kategorisiz Öğeler"',
      'list.newCommentsHint':   '0.32.0: der Satz im Glockenfenster, nach Herkunft getrennt (F4); 0.32.1: „sana ait {entryMany}" statt „senin" — ohne Besitzendung',
      /* UND DREIUNDDREISSIG MIT 0.32.0 -- dieselben Schluessel wie auf der
         englischen Seite und aus denselben Gruenden. */
      'vocabulary.grade':         '0.32.0: das fuenfzehnte Vokabelwort — „Puan"',
      'card.grade':               '0.32.0: seine Beschriftung in der Vokabelkarte',
      'entry.grade':              '0.32.0: der Spaltenkopf der Rechnung wird {grade}',
      'entry.gradeLabel':         '0.32.0: die Beschriftung am Sternkasten des Zeitpunkts',
      'entry.calcGradeWeight':    '0.32.0: „Puan × ağırlık" wird {grade} × ağırlık',
      'entry.gradeReplaced':      '0.32.0: die Meldung nach dem Ersetzen',
      'list.lastGrade':           '0.32.0: die Zeile der Kachel',
      'list.gradeLong':           '0.32.0: die Vorlesefassung eines Punktes der Zeitleiste',
      'list.gradeShort':          '0.32.0: seine kurze Fassung',
      'list.sortAvg':             '0.32.0: artikellos — „Ortalama: {grade}"',
      'list.sortLast':            '0.32.0: artikellos — „Son: {grade}"',
      'server.gradeRange':        '0.32.0: die Absage des Servers nennt das Vokabelwort',
      'card.itemOne':             '0.32.0: Punkt 28, Fund 5 — die Beschriftung nennt wieder ihre Sache',
      'card.itemMany':            '0.32.0: Punkt 28, Fund 5 — dieselbe Sache in der Mehrzahl',
      'card.restartHint':         '0.32.0: Punkt 28, Fund 1 — die zitierte Logzeile heisst „Schluessel"',
      'list.bellToMe':            '0.32.0: die Ueberschrift „Bana yönelik"',
      'list.bellMine':            '0.32.0: die Ueberschrift; 0.32.1: „Bana ait {entryMany}" statt „Benim {entryMany}" — ohne Besitzendung',
      'list.bellOther':           '0.32.0: die Ueberschrift „Diğer her şey"',
      'list.markedCount':         '0.32.0: das „, bunun 1 bana yönelik kadarı" an der Zeile',
      'server.noAccountOwner':    '0.32.0: Punkt 29 — der Grund, warum nicht verschickt werden kann',
      'server.noTestMail':        '0.32.0: Punkt 29 — seit dem Wechsel kam keine Testmail durch',
      'server.noPublicAddress':   '0.32.0: Punkt 29 — ohne PUBLIC_ADDRESS wird nicht verschickt',
      'server.noUserAddress':     '0.32.0: Punkt 29 — am Konto haengt keine Adresse',
      'server.signupThanks':      '0.32.0: Punkt 29 — die eine Antwort der Zugangsanfrage',
      'server.cleanupNoBackups':  '0.32.0: Punkt 29 — die Vorschau des Aufraeumens, Grund 1',
      'server.backupsBeforeKey':  '0.32.0: Punkt 29 — Grund 2, jetzt mit Mehrzahlform',
      'server.cleanupAllYoungest':'0.32.0: Punkt 29 — Grund 3, jetzt mit Mehrzahlform',
      'server.cleanupOldestAge':  '0.32.0: Punkt 29 — Grund 4, jetzt mit Mehrzahlform',
      'mail.ownServer':           '0.32.0: der zwoelfte Satz — „Kendi sunucu" in der Anbieterliste',
      /* VIER STANDEN HIER BIS 0.32.0 und stehen jetzt nicht mehr:
         `list.followsSort`, `list.pillHint`, `list.statusByHand` und
         `list.byHandHint`. */
      'entry.deleteEntry':        '0.32.1: „{entryOne} kaydını sil" — der Akkusativ faellt auf „kayıt"',
      'entry.deleteDay':          '0.32.1: „{dayOne} kaydını sil" — derselbe Griff',
      'card.potentialModeLabel':  '0.32.1: „modunu aç" — der Akkusativ faellt auf „mod"',
      'server.criterionKindFixed':'0.32.1: „ya … ya da …" statt der Fragepartikel hinter dem Platzhalter',
      'login.noPhoneHint':        '0.32.1: „Bunun yerine" — das Klitikon haengt nicht mehr am Platzhalter',
      'entry.alsoGoes':           '0.32.1: „Bunlar da birlikte gider: {what}." — die Partikel steht vor der Aufzaehlung',
      'dialog.postsOfOthers':     '0.32.1: „kullanıcısının" — der Genitiv faellt auf „kullanıcı"',
      'card.linkHolderUser':      '0.32.1: „kullanıcısının parolasını" — wie beim Nachbarn card.oldPasswordValid; „Bağlantıyı alan" haelt die Laenge',
      'card.rejectRequestAsk':    '0.32.1: „kullanıcısının başvurusu" — derselbe Griff',
      'card.createdFrom':         '0.32.1: „kaydından" statt „öğesinden" — „öğe" stand fest im Satz',
      'entry.deletePhoto':        '0.32.1: „Fotoğrafı sil" — aus entry.deleteWord geteilt',
      'entry.deleteVideo':        '0.32.1: „Videoyu sil" — die andere Haelfte, andere Endung',
      'list.commentCount':        '0.32.1: der Platz {of} faellt weg — die Zaehlzeile baut keinen Satz mehr',
      'entry.noDaysYet':          '0.32.1: „puan" wird {grade} — das fuenfzehnte Vokabelwort',
      'server.deniedEntry':       '0.32.1: „Bunu yalnızca oluşturan değiştirebilir" — ohne „kayıt"',
      'server.ratingBeforeTest':  '0.32.1: „burada {testedNo} yazıyor" — Vokabelwort statt fester Text',
      'card.potentialModeHint':   '0.32.1: „ayrıntı görünümünde" statt „kayıtta" — das Vokabelwort stand fest im Satz',
      'entry.dueHint':            '0.32.1: „Son tarih" ohne „Görevin" — das Vokabelwort stand fest im Satz',
      /* UND EIN FUND DER RUNDE SELBST -- Punkt 31 des Sammelblatts. */
      'card.checkForeign':        '0.32.0: Punkt 31 — „yedeği" wird „yedeklemesi"'
    };
    const tgDiff = Object.keys(tgFiles.tr)
      .filter(k => JSON.stringify(tgPrint[k]) !== JSON.stringify(tgFiles.tr[k]));
    check('Und jeder tuerkische Wert ist Zeichen fuer Zeichen der des Vergleichsstands — ausser den benannten',
      tgDiff.sort().join(' ') === Object.keys(TR_CHANGED_AFTER_0313).sort().join(' '),
      tgDiff.filter(k => !(k in TR_CHANGED_AFTER_0313)).slice(0, 8).join(' ') || 'alle benannt');
    /* UND JEDER EINTRAG SAGT SEINEN GRUND. Eine Tafel mit vierzehn Schluesseln
       und ohne Begruendung ist eine Liste und keine Buchfuehrung. */
    check('Und jeder Eintrag der Tafel nennt seinen Grund',
      Object.values(TR_CHANGED_AFTER_0313).every(g => g.length > 15),
      Object.entries(TR_CHANGED_AFTER_0313).filter(([, g]) => g.length <= 15).map(([k]) => k).join(' ') || 'alle benannt');
    /* UND DIE TAFEL IST IN BEIDE RICHTUNGEN GESCHLOSSEN -- 0.31.1, Zusage 2. */
    const tgStale = Object.keys(TR_CHANGED_AFTER_0313).filter(k => !tgDiff.includes(k));
    check('Und kein Eintrag der Tafel benennt einen Unterschied, den es nicht gibt',
      tgStale.length === 0, tgStale.join(' ') || 'keine Karteileiche');
  }
}

/* ================================================================= 0.31.4 —
   „Nach einer Zahl die Einzahl, sonst die Mehrzahl" DIE RUNDE LOEST EINEN
   ZIELKONFLIKT AUF, den 0.31.3 gemessen und dem Betreiber vorgelegt hat
   (Fehler und Ideen, Punkt 32). */
const TR_AFTER_NUMBER = { de: 'plural', en: 'plural', tr: 'one' };

async function check0314() {
  const anRead = (code) => JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
  const anFiles = { de: anRead('de'), en: anRead('en'), tr: anRead('tr') };
  const anApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  const anCode = anApp.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
  const AN_LETTERS = 'A-Za-zÇĞİÖŞÜçğıöşü';
  /* `-leri` UND `-ları` GEHOEREN DAZU: „Test günleri" ist eine Substantivkette,
     und dort traegt das zweite Glied die Mehrzahl mit der Besitzendung. */
  const anPlural = (w) => new RegExp(`[${AN_LETTERS}]*(?:ler|lar)(?:i|ı)?$`).test(String(w));

  group('Nach einer Zahl die Einzahl — 0.31.4');
  {
    /* ---- Zusage 1: fuer Deutsch und Englisch aendert sich NICHTS -------
       DIE FORDERUNG DES BETREIBERS, 13. September 2026: „Das darf sich bei
       deutsch und englisch nicht negativ auswirken." SIE IST DURCH DIE
       BAUFORM ERFUELLT UND NICHT DURCH SORGFALT: `counted()` faellt bei
       `_afterNumber: plural` auf `plural()` zurueck -- derselbe Ruf,
       dieselben Argumente, dasselbe Ergebnis. */
    const anDeEn = ['de', 'en'].filter(c => anFiles[c]._afterNumber !== 'plural');
    check('Zusage 1: fuer Deutsch und Englisch aendert sich nichts — beide sagen `plural`',
      anDeEn.length === 0, anDeEn.join(' ') || 'de und en unveraendert');
    /* UND DIE VOKABELPAARE DORT SIND UNBERUEHRT. */
    const AN_DE_VOC = { entryOne: 'Eintrag', entryMany: 'Einträge', dayOne: 'Testtag',
      dayMany: 'Testtage', reportOne: 'Bericht', reportMany: 'Berichte',
      taskOne: 'Aufgabe', taskMany: 'Aufgaben', ratingOne: 'Bewertung',
      ratingMany: 'Bewertungen' };
    const anDeMoved = Object.entries(AN_DE_VOC)
      .filter(([k, v]) => anFiles.de['vocabulary.' + k] !== v);
    check('Und die zehn deutschen Vokabelformen stehen Zeichen fuer Zeichen da',
      anDeMoved.length === 0,
      anDeMoved.map(([k]) => `${k}: ${anFiles.de['vocabulary.' + k]}`).join(' · ') || 'alle zehn');

    /* ---- Zusage 2: die Auskunft steht in jeder der drei Dateien --------
       UND SIE TRAEGT EINEN DER BEIDEN ERLAUBTEN WERTE. */
    const AN_ALLOWED = ['one', 'plural'];
    const anMissing = Object.entries(TR_AFTER_NUMBER)
      .filter(([c, want]) => anFiles[c]._afterNumber !== want);
    check('Zusage 2: jede der drei Sprachdateien nennt `_afterNumber` — de/en `plural`, tr `one`',
      anMissing.length === 0,
      anMissing.map(([c]) => `${c}: ${JSON.stringify(anFiles[c]._afterNumber)}`).join(' · ')
        || Object.entries(TR_AFTER_NUMBER).map(([c, w]) => `${c}=${w}`).join(' '));
    check('Und der Wert ist einer der beiden erlaubten',
      ['de', 'en', 'tr'].every(c => AN_ALLOWED.includes(anFiles[c]._afterNumber)),
      ['de', 'en', 'tr'].map(c => `${c}: ${anFiles[c]._afterNumber}`).join(' · '));
    /* UND ER STEHT VORN, BEI SEINESGLEICHEN. */
    check('Und er steht bei `_locale` und `_name` und nicht zwischen den Saetzen',
      ['de', 'en', 'tr'].every(c => Object.keys(anFiles[c]).slice(0, 3).sort().join(' ')
        === '_afterNumber _locale _name'),
      ['de', 'en', 'tr'].map(c => Object.keys(anFiles[c]).slice(0, 3).join(',')).join(' · '));

    /* ---- Zusage 3: eine Datei ohne den Schluessel faellt auf `plural` ---
       DAS IST DIE ZEILE FUER DIE VIERTE SPRACHE. */
    check('Zusage 3: eine Sprachdatei ohne `_afterNumber` faellt auf `plural`',
      /_afterNumber === 'one' \? 'one' : 'plural'/.test(anCode),
      'der Ausdruck im Quelltext vergleicht nicht gegen `one`');
    check('Und die Vorgabe der Variablen ist ebenfalls `plural`',
      /let AFTER_NUMBER = 'plural';/.test(anCode), 'die Vorgabe fehlt oder heisst anders');

    /* ---- Zusage 7: `counted()` liest die DATEI und nicht die Locale -----
       DAS IST LEITPLANKE L1 ALS PRUEFUNG. */
    const anBody = (anCode.match(/function counted\(n, one, other\) \{([\s\S]*?)\n\}/) || [])[1] || '';
    check('Zusage 7: counted() gibt es, und sie entscheidet an AFTER_NUMBER',
      /AFTER_NUMBER === 'one' \? one : plural\(n, one, other\)/.test(anBody),
      anBody.trim().slice(0, 120) || 'die Funktion fehlt');
    check('Und sie kennt keine Sprachkennung — die Regel steht in der Datei',
      !/'tr'|"tr"|tr-TR|LOCALE/.test(anBody), anBody.trim().slice(0, 120));

    /* ---- Zusage 5: JEDE Zaehlerstelle geht durch `counted()` -----------
       DER BEWEIS DIESER RUNDE, und er ist in drei Schritten gebaut: 1. */
    const AN_COUNTED_CALLS = 8, AN_PLURAL_LEFT = 2;
    const anCounted = (anCode.match(/counted\(/g) || []).length - 1;
    const anPluralLeft = (anCode.match(/[^a-zA-Z]plural\(/g) || []).length - 1;
    check('Zusage 5: acht Stellen rufen counted() — die fuenf Vokabelzaehler, die beiden Zaehlerhelfer und entry.added',
      anCounted === AN_COUNTED_CALLS, `${anCounted} Rufe`);
    check('Und es bleiben genau zwei plural() — der Ruf in counted() selbst und das VERB in card.aloneOverLimit',
      anPluralLeft === AN_PLURAL_LEFT, `${anPluralLeft} Rufe`);
    /* UND KEINE STELLE SETZT EINE ZAHL UND EIN WORT MIT `plural()`
       NEBENEINANDER. */
    /* GESUCHT WIRD EINE ZAHL VOR EINEM WORT und nicht irgendein `plural()`
       mit einer Klammer davor: in `card.aloneOverLimit` steht `${n}
       ${esc(vThing(n))} ${plural(n, passt, passen)}` -- dort waehlt
       `plural()` ein VERB, und davor steht kein Zaehler, sondern das Nomen,
       das `counted()` schon richtig gemacht hat. */
    const anRaw = [...anCode.matchAll(
      /\$\{(?![^{}]*(?:vThing|vTime|vReport|vTask|vRating|counted))[^{}]*\}\s+\$\{(?:esc\()?plural\(/g)].length;
    check('Und keine Stelle setzt eine Zahl und ein Wort mit plural() nebeneinander',
      anRaw === 0, `${anRaw} Stellen`);
    /* UND DER LESER WUERDE EINE FINDEN. Ohne diese Zeile waere die darueber
       auch mit einem kaputten Muster gruen (Stolperstein 81). */
    const anProbe = /\$\{(?![^{}]*(?:vThing|vTime|vReport|vTask|vRating|counted))[^{}]*\}\s+\$\{(?:esc\()?plural\(/;
    check('Und der Leser wuerde eine finden — und das Verb laesst er stehen',
      anProbe.test('`${n} ${plural(n, a, b)}`') &&
      !anProbe.test('`${esc(vThing(n))} ${plural(n, a, b)}`'),
      'der Leser trennt Zaehler und Verb nicht');

    /* ---- Zusage 5, dritter Schritt: die Einzahlformen sind Einzahlen ---- */
    const AN_VOC = [['entryOne', 'entryMany'], ['dayOne', 'dayMany'],
      ['reportOne', 'reportMany'], ['taskOne', 'taskMany'], ['ratingOne', 'ratingMany']];
    const anOnePlural = AN_VOC.filter(([one]) => anPlural(anFiles.tr['vocabulary.' + one]));
    check('Und keine der fuenf tuerkischen EINZAHLformen endet auf -ler oder -lar',
      anOnePlural.length === 0,
      anOnePlural.map(([o]) => `${o}: ${anFiles.tr['vocabulary.' + o]}`).join(' · ') || 'alle fuenf');
    /* ---- Zusage 6: die Gegenrichtung — ohne Zahl steht sehr wohl eine ---
       OHNE DIESE ZEILE WAERE DIE RUNDE GRUEN, wenn jemand alle Mehrzahlen aus
       `tr.json` loeschte. */
    const anManySingular = AN_VOC.filter(([, many]) => !anPlural(anFiles.tr['vocabulary.' + many]));
    check('Zusage 6: jede der fuenf tuerkischen MEHRZAHLformen endet auf -ler oder -lar',
      anManySingular.length === 0,
      anManySingular.map(([, m]) => `${m}: ${anFiles.tr['vocabulary.' + m]}`).join(' · ') || 'alle fuenf');
    check('Und der Leser trennt die beiden wirklich — auch die Verbundform -leri',
      anPlural('Öğeler') && anPlural('Test günleri') && anPlural('Raporlar') &&
      anPlural('Görevler') && anPlural('Değerlendirmeler') &&
      !anPlural('Öğe') && !anPlural('Test günü') && !anPlural('Rapor'),
      'der Leser sieht die Endung nicht');

    /* ---- Zusage 11: die Saetze, die die Einzahl VERLANGEN --------------
       AUCH OHNE ZAHL DAVOR. */
    const anNeedsOne = [];
    for (const [k, v] of Object.entries(anFiles.tr)) {
      if (typeof v !== 'string') continue;
      if (/(?:^|[^\p{L}])(?:her|kaç)\s+\{(\w*Many)\}/u.test(v)) anNeedsOne.push(`${k} (her)`);
      if (/\{(\w*Many)\}\s+sayısı/u.test(v)) anNeedsOne.push(`${k} (sayısı)`);
    }
    check('Zusage 11: kein tuerkischer Satz setzt eine Mehrzahlform hinter `her` oder vor `sayısı`',
      anNeedsOne.length === 0, anNeedsOne.join(' · ') || 'keiner');
    check('Und der Leser wuerde einen Verstoss finden',
      /(?:^|[^\p{L}])(?:her|kaç)\s+\{(\w*Many)\}/u.test('her {entryMany} için') &&
      !/(?:^|[^\p{L}])(?:her|kaç)\s+\{(\w*Many)\}/u.test('her {entryOne} için'),
      'der Leser sieht die Nachbarschaft nicht');
    /* UND DIE FUENF STEHEN NAMENTLICH DA. */
    const AN_SINGULAR_SENTENCES = ['card.blocksHint', 'card.criteriaAdminHint',
      'card.criteriaOrderHint', 'card.orderAppliesNote', 'list.showAll'];
    const anNotOne = AN_SINGULAR_SENTENCES.filter(k => !/\{entryOne\}/.test(String(anFiles.tr[k])));
    check(`Und die fuenf Saetze, die sie verlangen, tragen {entryOne} — ${AN_SINGULAR_SENTENCES.length}`,
      anNotOne.length === 0, anNotOne.join(' ') || 'alle fuenf');

    /* ---- Zusage 10: ein Platz wechselt nur innerhalb SEINES Paares ------
       Die Zusage 3 von 0.31.3 ist dafuer um einen Spalt geoeffnet worden. */
    const anWrongFamily = [];
    for (const [k, dv] of Object.entries(anFiles.de)) {
      if (k.startsWith('_') || typeof dv !== 'string') continue;
      const tv = String(anFiles.tr[k] || '');
      for (const [one, many] of AN_VOC) {
        const inDe = dv.includes(`{${many}}`) || dv.includes(`{${one}}`);
        if (!inDe) continue;
        const stem = one.replace(/One$/, '');
        const otherStems = AN_VOC.map(([o]) => o.replace(/One$/, '')).filter(x => x !== stem);
        for (const s2 of otherStems)
          if ((tv.includes(`{${s2}One}`) || tv.includes(`{${s2}Many}`)) &&
              !dv.includes(`{${s2}One}`) && !dv.includes(`{${s2}Many}`))
            anWrongFamily.push(`${k}: ${stem} → ${s2}`);
      }
    }
    check('Zusage 10: kein Platz ist gegen den eines ANDEREN Vokabelworts getauscht',
      anWrongFamily.length === 0, [...new Set(anWrongFamily)].slice(0, 6).join(' · ') || 'keiner');

    /* ---- Zusage 5, VIERTER SCHRITT: am GERENDERTEN TEXT (F8, BA 5) ------
       DIE DREI SCHRITTE OBEN LESEN DEN QUELLTEXT UND DIE DATEI. */
    let JSDOMan;
    try { ({ JSDOM: JSDOMan } = require('jsdom')); } catch { JSDOMan = null; }
    check('jsdom steht fuer die Probe am gerenderten Text bereit',
      !!JSDOMan, 'ohne jsdom keine Probe am Bildschirmtext');
    if (JSDOMan) {
      /* DER VOKABELSATZ DES LESERS KOMMT VOM SERVER, und der Mock muss ihn
         mitgeben -- sonst steht die Oberflaeche auf Tuerkisch und traegt
         deutsche Vokabelwoerter. */
      const anVocabulary = Object.fromEntries(Object.entries(anFiles.tr)
        .filter(([k]) => k.startsWith('vocabulary.'))
        .map(([k, v]) => [k.slice('vocabulary.'.length), v]));
      const anDom = buildDom(JSDOMan,
        { settings: { filters: null, language: 'tr', vocabulary: anVocabulary } });
      const wAn = anDom.w;
      await new Promise(r => setTimeout(r, 120));
      /* GEKLAMMERT WIE JEDER GRIFF IN EIN FREMDES FENSTER: ein Rueckbau, der
         `app.js` zerbricht, soll eine Zusage rot machen und nicht den Lauf
         abreissen -- und der Fehler soll im Befund stehen und nicht im
         Nichts. */
      const anSay = (expr) => {
        try { return String(wAn.eval(expr)); } catch (e) { return 'FEHLER ' + e.message; }
      };
      /* ZUERST DER GEGENSTAND (Stolperstein 81): steht das Fenster wirklich
         auf Tuerkisch, und hat es `_afterNumber` wirklich gelesen? */
      check('Zusage 5, am gerenderten Text: das Fenster steht auf Tuerkisch und hat `_afterNumber` gelesen',
        anSay('AFTER_NUMBER') === 'one' &&
        anSay('V.entryOne') === String(anFiles.tr['vocabulary.entryOne']) &&
        anSay('V.entryMany') === String(anFiles.tr['vocabulary.entryMany']),
        `AFTER_NUMBER ${anSay('AFTER_NUMBER')} · ${anSay('V.entryOne')} / ${anSay('V.entryMany')}`);
      /* DIE FUENF VOKABELZAEHLER, wie der Quelltext sie setzt: Zahl, Leerzeichen,
         `vThing(n)`. */
      const AN_NUMBERS = [0, 1, 2, 3, 11, 21, 100];
      const anSpots = [];
      for (const f of ['vThing', 'vTime', 'vReport', 'vTask', 'vRating'])
        anSpots.push([f, (n) => `${n} ${anSay(`${f}(${n})`)}`]);
      /* UND DIE PAARE DER BEIDEN ZAEHLERHELFER -- AUS DEM QUELLTEXT GELESEN
         und nicht hier aufgezaehlt: wer einen weiteren Ruf dazubaut, wird von
         dieser Probe mitgenommen, ohne dass er diese Zeile finden muss. */
      const anPairRe = /countWord\([^,]+,\s*(?:t\('([^']+)'\)|V\.(\w+))\s*,\s*(?:t\('([^']+)'\)|V\.(\w+))\)/g;
      const anPairs = [];
      const anPairSeen = new Set();
      let anM;
      while ((anM = anPairRe.exec(anCode)) !== null) {
        const one = anM[1] ? `t('${anM[1]}')` : `V.${anM[2]}`;
        const many = anM[3] ? `t('${anM[3]}')` : `V.${anM[4]}`;
        const name = `${one} / ${many}`;
        if (anPairSeen.has(name)) continue;
        anPairSeen.add(name);
        anPairs.push([name, one, many]);
      }
      const AN_PAIRS_EXPECTED = 6;
      check('Und die Zaehlerpaare kommen aus dem Quelltext — die fuenf Wortpaare und ein Vokabelpaar',
        anPairs.length === AN_PAIRS_EXPECTED,
        `${anPairs.length} Paare: ${anPairs.map(([n]) => n).join(' · ')}`);
      for (const [name, one, many] of anPairs)
        anSpots.push([name, (n) => `${n} ${anSay(`counted(${n}, ${one}, ${many})`)}`]);
      /* UND DER GANZE SATZ, DER BEIM BAUEN UEBERSEHEN WORDEN IST:
         `entry.added` setzt „{count} {what} eklendi" -- die Zahl und das Wort
         stehen dort in ZWEI Platzhaltern desselben Satzes, und `counted()`
         fuellt den zweiten. */
      anSpots.push(['entry.added (Foto)',
        (n) => anSay(`t('entry.added', { count: ${n}, what: counted(${n}, t('list.photo'), t('list.photos')) })`)]);
      anSpots.push(['entry.added (Video)',
        (n) => anSay(`t('entry.added', { count: ${n}, what: counted(${n}, t('list.video'), t('list.videos')) })`)]);
      /* DER LESER: eine Zahl, Weissraum, ein Wort auf -ler/-lar -- auch die
         Verbundform -leri/-ları. */
      const anScreen = /(?<![\p{L}\p{N}_])\d+\s+\p{L}*(?:ler|lar)(?:i|ı)?(?![\p{L}])/u;
      const anBad = [];
      for (const [name, build] of anSpots)
        for (const n of AN_NUMBERS) {
          const sentence = build(n);
          if (/FEHLER /.test(sentence)) anBad.push(`${name} bei ${n}: ${sentence}`);
          else if (anScreen.test(sentence)) anBad.push(`${name} bei ${n}: „${sentence}"`);
        }
      check(`Zusage 5: hinter einer Zahl steht am BILDSCHIRM keine Mehrzahl — ${anSpots.length} Stellen mal ${AN_NUMBERS.length} Zahlen`,
        anBad.length === 0,
        anBad.slice(0, 6).join(' · ') || `${anSpots.length * AN_NUMBERS.length} Saetze gelesen`);
      /* UND DER LESER WUERDE EINE FINDEN. */
      const anWould = `3 ${anSay("plural(3, t('dialog.comment'), t('dialog.comments'))")}`;
      const anIs = `3 ${anSay("counted(3, t('dialog.comment'), t('dialog.comments'))")}`;
      check('Und der Leser wuerde eine finden — `plural()` an derselben Stelle faellt auf',
        anScreen.test(anWould) && !anScreen.test(anIs), `${anWould} · ${anIs}`);
      /* DIE GEGENRICHTUNG AM BILDSCHIRM: OHNE Zahl steht die Mehrzahl sehr
         wohl da. */
      const AN_MANY_ON_SCREEN = [['list.openTasks', 'taskMany'],
        ['list.noCategory', 'entryMany'], ['list.newCommentsHint', 'entryMany']];
      const anMissing = AN_MANY_ON_SCREEN.filter(([key, voc]) =>
        !anSay(`t('${key}')`).includes(String(anFiles.tr['vocabulary.' + voc])));
      check('Zusage 6, am gerenderten Text: ohne Zahl steht die Mehrzahl da — „Açık Görevler"',
        anMissing.length === 0,
        AN_MANY_ON_SCREEN.map(([k]) => `${k}: ${anSay(`t('${k}')`)}`).join(' · '));
      /* UND DIE KRUECKE IST WIRKLICH WEG. */
      check('Und das angehaengte „listesi" steht nicht mehr hinter dem Vokabelwort',
        !/listesi/.test(anSay("t('list.openTasks')")) &&
        !/listesi/.test(anSay("t('list.noCategory')")),
        `${anSay("t('list.openTasks')")} · ${anSay("t('list.noCategory')")}`);
      /* ---- Zusage 5, FUENFTER SCHRITT: die Vorschau der Vokabelkarte ------
         DER AUGENSCHEIN DIESER RUNDE HAT SIE GEFUNDEN, und die vier Schritte
         darueber konnten es nicht: in `drawPreview()` stand die Zahl als
         STRING unmittelbar vor der Mehrzahlform -- „7 ${sm}", „3 ${zm}", „2
         ${bm}", „4 ${at}", „2 ${rateMany}". */
      const anPreview = (anCode.match(/function drawPreview\(\) \{[\s\S]*?\n  \}/) || [''])[0];
      check('Zusage 5, fuenfter Schritt: die Vorschau der Vokabelkarte steht im Quelltext',
        anPreview.includes("getElementById('vpreview')") && anPreview.includes('card.preview'),
        `${anPreview.length} Zeichen gelesen`);
      const anManyVars = new Set([...anPreview.matchAll(/const (\w+) = w\.(\w+)\.trim\(\)/g)]
        .filter(m => /Many$/.test(m[2])).map(m => m[1]));
      check('Und der Leser kennt die fuenf Mehrzahlstellen der Karte',
        anManyVars.size === 5, `${anManyVars.size}: ${[...anManyVars].join(' ')}`);
      /* KEINE FESTE ZAHL VOR EINER MEHRZAHLFORM -- der Rueckfall von 0.31.3. */
      const anPreviewNumbered = [...anPreview.matchAll(/(\d+)\s+\$\{esc\((\w+)\)\}/g)]
        .filter(m => anManyVars.has(m[2])).map(m => `${m[1]} ${m[2]}`);
      check('Und keine feste Zahl steht in der Vorschau vor einer MEHRZAHLform',
        anPreviewNumbered.length === 0, anPreviewNumbered.join(' · ') || 'keine');
      /* UND JEDE DER FUENF GEHT DURCH `many()`. */
      const anThroughMany = new Set([...anPreview.matchAll(/\$\{many\(\d+, (\w+)\)\}/g)]
        .map(m => m[1]).filter(v => anManyVars.has(v)));
      check('Und jede der fuenf geht durch `many()` — mit ihrer Zahl als Argument',
        anThroughMany.size === anManyVars.size,
        `${anThroughMany.size} von ${anManyVars.size}: ${[...anThroughMany].join(' ')}`);
      /* UND `many()` FRAGT DIE GEZEIGTE SPRACHE. */
      const anManyBody = (anPreview.match(/const many = \(n, word\) =>[\s\S]*?;/) || [''])[0];
      check('Und `many()` fragt die GEZEIGTE Sprache und nicht die des Lesers',
        /afterNumberOf\(namesLanguage\(\)\) === 'one'/.test(anManyBody) &&
        !/AFTER_NUMBER/.test(anManyBody),
        anManyBody.replace(/\s+/g, ' ').slice(0, 140) || 'die Funktion fehlt');
      /* UND DIE EINZAHL BEHAELT IHRE ZAHL. */
      check('Und die Einzahl steht weiter MIT Zahl da — „1 Test günü"',
        /1 \$\{esc\(z1\)\}/.test(anPreview), 'die Einzahlstelle der Vorschau fehlt');
      /* UND DER LESER WUERDE EINEN RUECKFALL FINDEN (Stolperstein 81). */
      const anPreviewProbe = (text, many) =>
        [...text.matchAll(/(\d+)\s+\$\{esc\((\w+)\)\}/g)].filter(m => many.has(m[2])).length;
      check('Und der Leser wuerde einen finden — und die Einzahlstelle laesst er stehen',
        anPreviewProbe('<span>7 ${esc(sm)}</span>', new Set(['sm'])) === 1 &&
        anPreviewProbe('<span>1 ${esc(z1)}</span>', new Set(['sm'])) === 0,
        'der Leser trennt Einzahl und Mehrzahl in der Vorschau nicht');
      /* ---- Zusage 7, ZWEITE HAELFTE: der Server schickt die Regel je
         Sprache DIE REGEL GEHOERT DER SPRACHE (L1), und die Karte braucht sie
         fuer eine FREMDE Sprache. */
      const anTable = ((await call('GET', '/api/settings')).content || {}).languages || [];
      const anRule = Object.fromEntries(anTable.map(a => [a.code, a.afterNumber]));
      const anRuleWrong = Object.entries(TR_AFTER_NUMBER).filter(([c, v]) => anRule[c] !== v);
      check('Zusage 7, zweite Haelfte: die Sprachtafel des Servers nennt je Sprache ihre Stellungsregel',
        anTable.length >= 3 && anRuleWrong.length === 0,
        JSON.stringify(anRule));
      /* UND SIE KENNT NUR DIE BEIDEN WERTE. */
      const anRuleOdd = anTable.filter(a => a.afterNumber !== 'one' && a.afterNumber !== 'plural');
      check('Und kein Eintrag traegt einen dritten Wert',
        anRuleOdd.length === 0, anRuleOdd.map(a => `${a.code}: ${a.afterNumber}`).join(' · ') || 'keiner');
      wAn.close();
    }
  }
}

  await check0310();
  await check0311();
  await check0312();
  await check0313();
  await check0314();
}

module.exports = run;
if (require.main === module) H.standalone(run, __filename);
