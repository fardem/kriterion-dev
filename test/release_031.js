/* Kriterion — Pruefstand: die Staende 0.31.0 bis 0.31.4
 *
 * Die Sprachdateien werden gegengelesen, und die drei Sprachen sitzen:
 * Deutsch, Englisch, Tuerkisch. Dazu die Einzahl nach einer Zahl.
 *
 * Eigener Prozess, eigener Speicher. Der Rahmen steht in test/frame.js.
 */
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

/* =================================================================
   0.31.0 — „Die Sprachdateien werden gegengelesen"

   DREI BAUABSCHNITTE AM TEXT, UND ELF ZUSAGEN DARUEBER. Die Vorlage kam von
   aussen (Doku/I18N_CLEANUP_DE.md, von Google Gemini geschrieben); jede ihrer
   Zeilen ist gegen `de.json`, gegen den Quelltext und gegen die beiden anderen
   Sprachdateien nachgeprueft worden, und was nicht uebernommen wurde, steht
   mit Grund im Auftrag.
   DIE ELF CODE-LECKS FALLEN AUS ALLEN DREI DATEIEN ZUGLEICH, die Texte nur
   aus der deutschen: Englisch ist 0.31.2, Tuerkisch 0.31.3 (die Nummern hier
   standen bis 0.31.3 eine Runde zu frueh -- 0.31.1 ist dazwischengekommen und
   hat die zersaegten Saetze zusammengesetzt). Der Grund steht
   im Auftrag (F21) und ist gemessen -- die Deckungsprobe verlangt in jeder
   Datei dieselben Schluessel, also koennen die SCHLUESSEL nicht warten; die
   TEXTE koennen es sehr wohl.
   ================================================================= */
/* DIE ZAHL DER SCHLUESSEL JE SPRACHDATEI STEHT EINMAL -- Stolperstein 47.
   ZWEI GRUPPEN FRAGEN SIE AB: 0.31.0 auf die Deckung der drei Dateien, 0.31.1
   auf den Stand nach dem Verschmelzen. Zwei Zahlen an zwei Stellen laufen beim
   naechsten Handgriff auseinander.
   SIE STEHT AUF MODULEBENE UND NICHT IN EINER DER BEIDEN GRUPPEN, und das ist
   beim Bauen von 0.31.1 gelernt worden: zuerst stand sie in `check0310()`, und
   `check0311()` ist eine EIGENE Funktion -- der Lauf riss mit „LANG_KEY_COUNT
   is not defined" ab, und ein abgerissener Lauf belegt nichts (Stolpersteine
   138, 161 und 170). Vier Gegenproben haben es zugleich gemeldet.
   SIE WIRD UMGEDREHT UND NICHT WEGGENOMMEN: „gleich viele" allein bliebe
   gruen, wenn jemand aus allen dreien dasselbe herausnaehme.
     1254 vor 0.31.1 -- 1197 danach. Die Runde verschmilzt Bruchstuecke zu
     ganzen Saetzen; ein verschmolzener Satz braucht einen Schluessel statt
     zwei, und vierundvierzig sind neu dazugekommen.
     1197 VOR 0.31.4 -- 1198 DANACH, und der eine ist kein Satz: `_afterNumber`
     sagt, welche Form hinter einer Zahl steht. Er steht neben `_locale` und
     `_name` und erreicht keinen Bildschirm.
     1198 VOR 0.32.0 -- 1215 DANACH: achtzehn kommen dazu und einer faellt.
     Die achtzehn stehen namentlich in WORDING_NEW_0320, der eine in
     WORDING_GONE_0320 (`list.otherUser`) -- und ihre drei Herkuenfte sind das
     fuenfzehnte Vokabelwort, die geteilte Glockentafel und die zwoelf
     deutschen Saetze aus den Serverdateien.
     1215 VOR 0.32.1 -- 1209 DANACH: acht fallen, zwei kommen dazu. Die acht
     stehen namentlich in WORDING_GONE_0321, die zwei in WORDING_NEW_0321.
     ES IST DIE ERSTE RUNDE, DIE SCHRUMPFT, seit 0.31.1 -- und aus demselben
     Grund: sie nimmt eine Bauweise zurueck (dort den zersaegten Satzbau, hier
     die Zaehlzeile als Satz und die Filterableitung).
     1209 VOR 0.33.0 -- 1208 DANACH: zwei fallen, einer kommt dazu. Die zwei
     stehen namentlich in WORDING_GONE_0330 (`card.catchUpDerivatives` und
     `card.derivativesAsk` -- die JPEG-Haelfte des Bestandslaufs), der eine in
     WORDING_NEW_0330 (`server.exportTooOld` -- die eine Abweisung des Bruchs).
     SIE SCHRUMPFT ZUM ZWEITEN MAL IN FOLGE, und das ist diesmal die Sache
     selbst: diese Runde legt nichts dazu, sie nimmt weg, was einen Rueckweg
     offenhaelt. */
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
       Folge. Elf nur aus `de.json` zu nehmen faerbte den Lauf SOFORT rot --
       `en.json` und `tr.json` haetten dann je „11 zu viel". */
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

    /* ---- Zusage 2: und jede steht als fester Wert im Skript ----
       MIT IHREM ALTEN INHALT, Zeichen fuer Zeichen. Eine Wegnahme, bei der
       der Wert unterwegs verloren geht, waere kein Umzug, sondern ein Fehler
       -- und zwar einer, den erst der Betrieb fände: ein `window.open` ohne
       `noopener` bleibt still.
       ZWEI GEHEN NICHT INS SKRIPT, SONDERN INS STILBLATT: `10px` und `20px`
       waren ein ABSTAND. Eine Konstante im Skript waere derselbe Fehler an
       anderer Stelle gewesen (Auftrag, F2) -- sie stuende dann inline am
       Knoten und damit ausserhalb jeder Regel.
       DER TEILEXPORT WIRD UEBER SEIN GERIPPE GEPRUEFT: die Oberflaeche baut
       die Adresse heute aus einer Vorlage (`&from=${…}`), der alte Wert trug
       Platzhalter in geschweiften Klammern (`&from={from}`). Was in Klammern
       steht, faellt fuer den Vergleich heraus -- was bleibt, ist der Weg. */
    const drSkeleton = (x) => String(x).replace(/\$?\{[^}]*\}/g, '{}');
    const DR_IN_SCRIPT = ['_blank', 'noopener,noreferrer', 'image/', 'docker-compose.yml',
      '&files=1', 'photos=1', '&videos=1', '?size=thumb'];
    const drMissing = DR_IN_SCRIPT.filter(v => !drApp.includes(`'${v}'`));
    check('Zusage 2: jeder der acht Werte steht als fester Wert in app.js',
      drMissing.length === 0, drMissing.join(' · ') || 'alle acht');
    /* UND JEDER RUF TRAEGT IHN -- nicht bloss die Datei irgendwo.
       DAS IST EIN FUND DER GEGENPROBE 953 UND KEINE Vorsicht: der Rueckbau nahm
       EINEM `window.open` sein `noopener,noreferrer` weg und blieb STUMM. Der
       Wert steht dreimal in app.js; eine Zusage, die nur fragt „kommt er vor",
       ist mit zwei verbleibenden Vorkommen weiterhin gruen -- und der dritte
       Tab bekaeme Zugriff auf das oeffnende Fenster, ohne dass etwas rot wird.
       GELESEN WIRD DER RUMPF DES AUFRUFS, mit gezaehlten Klammern: das erste
       Argument ist selbst ein Ruf (`searchAddress(...)`), und ein Muster bis
       zur ersten schliessenden Klammer schnitte mitten hinein. */
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
       als zweite Konstante. Geprueft wird die REGEL und nicht der Absatz
       darueber: der Kommentar an ihr nennt die alten Schluessel. */
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
       noch in der Umbenennungstafel. Gelesen wird der CODE und nicht der
       Kommentar: die Absaetze an den alten Stellen erklaeren, warum die
       Schluessel gefallen sind, und nennen sie dabei. */
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
       (`en.json` hatte keinen einzigen). Der Waechter haelt es danach fest:
       ein gerades Zeichen schleicht sich sonst beim naechsten Satz unbemerkt
       wieder ein, und am Bildschirm steht „Tag „Werkzeug" statt „Werkzeug“.
       DIE TUERKISCHE DATEI BEKOMMT DAMIT KEINEN NEUEN TEXT: dasselbe Wort,
       dasselbe Zeichenpaar, nur richtig geschlossen. Dass das Paar dort am
       Ende `“…”` heissen muss, ist die Sache von 0.31.3 -- und dort ist es
       entschieden und gebaut (F3, 68 Schluessel).
       BIS 0.31.3 STAND HIER 0.31.2. Die Nummer stammte aus der Zeit vor
       0.31.1, als die Strecke noch drei Runden hatte statt vier; 0.31.2 hat
       Englisch gemacht. Ein Kommentar, der auf die falsche Runde zeigt, ist
       schlimmer als keiner -- er sieht wie Buchfuehrung aus. */
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
       Vorschaubild, nur mit `kind = 'video'`.
       BEIDE RICHTUNGEN, wie immer: dass das neue Wort dasteht, UND dass das
       alte nirgends mehr steht. Eine Zusage, die nur den einen Ausgang kennt,
       bliebe gruen, wenn beide Saetze nebeneinanderstuenden. */
    const DR_VIDEO = ['server.videoNeedsStill', 'server.videoStill',
      'server.stillNoPreview', 'server.stillNotImage'];
    check('Zusage 5: die vier Video-Meldungen sagen „Video-Vorschaubild"',
      DR_VIDEO.every(k => String(drFiles.de[k]).includes('Video-Vorschaubild')),
      DR_VIDEO.map(k => `${k}: ${drFiles.de[k]}`).join(' · '));
    const drStill = drTexts(drFiles.de).filter(([, t]) => /Standbild/.test(t));
    check('Und keine sagt „Standbild" — kein deutscher Text tut es mehr',
      drStill.length === 0, drStill.map(([k]) => k).join(' · ') || 'keiner');

    /* ---- Zusage 6: „gruppiert nach" steht weiter da ----
       GEMINI WOLLTE „sortiert nach", UND DAS WAERE FALSCH GEWESEN: die
       Ansicht gruppiert wirklich -- `groupsOf()` fasst aufeinanderfolgende
       Zeilen desselben Eintrags zu EINER Gruppe zusammen. Ein Wort, das die
       Oberflaeche nicht mehr beschreibt, ist kein kuerzeres Wort, sondern ein
       falsches (Auftrag, F9).
       GEPRUEFT WIRD BEIDES: der Satz und die Sache dahinter. */
    check('Zusage 6: „gruppiert nach" steht weiter da',
      /gruppiert nach/.test(String(drFiles.de['list.openGroupedBy'])),
      String(drFiles.de['list.openGroupedBy']));
    check('Und die Ansicht gruppiert wirklich — groupsOf() fasst zusammen',
      /const groupsOf = \(list\) => \{/.test(drApp) && /groupsOf\(inside\)\.forEach/.test(drApp),
      (drApp.match(/groupsOf[^\n]*/g) || ['(nicht gefunden)']).slice(0, 2).join(' | '));

    /* ---- Zusage 7: `login.linkUnaffectedWord` ist „nicht" ----
       GEMINI WOLLTE „unberührt", UND DAS BRICHT DEN SATZ: das Wort steht
       HERVORGEHOBEN in zwei Traegersaetzen („Dein Link ist davon {word}
       betroffen"), und die Hervorhebung sitzt auf der VERNEINUNG. Mit
       „unberührt" stuende dort „Dein Link ist davon unberührt betroffen".
       BEIDE TRAEGERSAETZE WERDEN GEFRAGT -- Gemini nennt nur einen. */
    check('Zusage 7: `login.linkUnaffectedWord` ist „nicht"',
      drFiles.de['login.linkUnaffectedWord'] === 'nicht',
      JSON.stringify(drFiles.de['login.linkUnaffectedWord']));
    check('Und beide Traegersaetze tragen es',
      ['login.linkUnaffected', 'login.linkUnaffectedRetry']
        .every(k => String(drFiles.de[k]).includes('{word}')),
      ['login.linkUnaffected', 'login.linkUnaffectedRetry']
        .map(k => `${k}: ${drFiles.de[k]}`).join(' · '));
    /* UND DIE AUSZEICHNUNG LAEUFT WEITER UEBER tMark() -- das `{word}` wird
       gegen ein Steuerzeichen getauscht und danach mit <strong> umschlossen.
       Ohne diese Zeile bliebe die Zusage gruen, wenn jemand die Hervorhebung
       entfernte und das Wort als gewoehnlichen Wert reichte. */
    check('Und die Hervorhebung sitzt auf ihm',
      (drApp.match(/tMark\('login\.linkUnaffected(Retry)?', 'login\.linkUnaffectedWord'\)/g) || []).length === 2,
      (drApp.match(/tMark\([^)]*\)/g) || ['(kein Ruf)']).join(' | '));

    /* ---- Zusage 8 und 9: die beiden Bilder des Projekts fallen ----
       „Das Haus verlassen" UND „Pille" SIND HAUSWOERTER, und beide haben am
       Bildschirm nichts zu suchen (Leitplanke L7 und Frage F7). Wer Export
       drueckt, weiss, dass es das System verlaesst; und was der Benutzer
       sieht, ist eine runde Schaltflaeche und keine Arznei.
       IM CODE BLEIBT `pill` -- die Klasse heisst weiter so, und das ist der
       Unterschied, um den es geht: drinnen ein Bild, draussen eine Sache.
       GEFRAGT WIRD DIE DEUTSCHE DATEI, und das bleibt so. Als diese Zusage
       entstand, trug `en.json` noch „leaves the house" und `tr.json` „hap";
       der Auftrag sagte, warum: solange die Quelle das Bild traegt, erbt es
       jede Uebersetzung neu. BEIDE SIND SEITDEM GEFALLEN -- 0.31.2 auf
       Englisch, 0.31.3 auf Tuerkisch --, und jede der beiden Runden haelt ihre
       eigene Verbotsliste. Diese Zeile fragt weiter nur Deutsch: sie ist die
       Wache ueber die QUELLE. */
    const drHouse = drTexts(drFiles.de).filter(([, t]) => /[Hh]aus\b/.test(t));
    check('Zusage 8: kein deutscher Text sagt „das Haus"',
      drHouse.length === 0, drHouse.map(([k]) => k).join(' · ') || 'keiner');
    const drPill = drTexts(drFiles.de).filter(([, t]) => /Pille|Pillen/.test(t));
    check('Zusage 9: kein deutscher Text sagt „Pille"',
      drPill.length === 0, drPill.map(([k]) => k).join(' · ') || 'keiner');
    check('Und die Klasse `pill` bleibt — im Stilblatt und im Quelltext',
      /\.pill \{/.test(drRules) && /class="pills"/.test(drApp),
      (drRules.match(/\.pill \{[^}]{0,40}/) || ['(keine Regel)'])[0]);

    /* ---- Zusage 10: die Vokabelkarte beschriftet mit „Einzahl"/„Mehrzahl" --
       „SACHE" WAR GENAU DAS WORT, DAS DER BETREIBER DORT ERSETZEN SOLL: die
       Karte fragt, wie SEINE Eintraege heissen, und schrieb ihm einen Namen
       vor.
       BIS 0.31.0 STAND HIER, die fuenf Geschwisterpaare trugen weiter ein Wort
       davor („Bericht, Einzahl"), weil sie einen FESTEN Begriff benennen. Das
       hat 0.31.1 widerlegt: „Bericht, Einzahl" stand neben „(Vorgabe:
       Bericht)" -- dasselbe Wort zweimal in einer Zeile, und wer „Bericht" in
       „Protokoll" umbenennt, liest weiter „Bericht, Einzahl". Fuenf von ihnen
       heissen jetzt „Kommentar zum Festhalten" und „Kommentar zum
       Abarbeiten"; die uebrigen neun wiederholen kein Vorgabewort und sind
       nicht angetastet.
       UMGEDREHT MIT 0.32.0 UND NICHT GELOESCHT (Stolperstein 74). Bis 0.31.4
       stand hier: „sie gilt den beiden ERSTEN Feldern, und die heissen weiter
       „Einzahl" und „Mehrzahl"." DER ENGLISCHE DURCHGANG VON 0.31.2 HAT
       WIDERSPROCHEN (Punkt 28, Fund 5): die Vokabelkarte trug damit ZWEI
       Bauformen -- fuenf Beschriftungen nannten die Sache und dann die Zahl
       („Zeitpunkt, Einzahl"), eine nur die Zahl. Auf Englisch faellt das
       sofort auf, weil dort die Grossschreibung des Substantivs fehlt, die im
       Deutschen den Namen als Namen markiert.
       WAS BLEIBT, IST DER GRUND DER ALTEN ZUSAGE: „Sache" war genau das Wort,
       das der Betreiber dort ersetzen soll. Die Beschriftung nennt deshalb
       NICHT das Vorgabewort („Eintrag, Einzahl" waere derselbe Fehler wie
       „Bericht, Einzahl"), sondern das, WORUM es geht: „Das Bewertete". */
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
       ganze Woerter. Die zwei mehr stehen in den Briefen: „kommt in deinen
       Zugang" und „dass die Adresse dir gehört".
       DIE SCHRANKE STEHT AUF NEUNUNDSECHZIG UND NICHT AUF SIEBENUNDSECHZIG,
       und das ist Absicht: bei siebenundsechzig duerfte die naechste Runde
       den Gewinn dieser hier stillschweigend wieder hergeben. Wer die Zahl
       senkt, soll hier vorbeikommen muessen. */
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

/* ================= DEUTSCH SITZT -- 0.31.1 =================
   ELF ZUSAGEN. Die Runde hat den zersaegten Satzbau aufgeloest: bis 0.31.0
   wurde ein Satz in mehrere Schluessel geteilt und im Aufruf wieder
   zusammengesetzt. Im Deutschen ging das auf; im Tuerkischen nicht, und das
   war seit 0.24.3 im Programm.

   WAS DIE RUNDE VERSPROCHEN HAT: der Wortlaut bleibt. Was am Bildschirm
   stand, steht danach genauso da -- ausser an den Stellen, die das
   Aenderungsprotokoll NAMENTLICH auffuehrt. Gefahren ist das mit
   tools/gleichlaut.js; hier stehen die Eigenschaften, die DAUERHAFT gelten
   sollen. */
async function check0311() {
  const dsRead = (code) => JSON.parse(fs.readFileSync(
    path.join(__dirname, 'public', 'languages', `${code}.json`), 'utf8'));
  const dsFiles = { de: dsRead('de'), en: dsRead('en'), tr: dsRead('tr') };
  const dsApp = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
  /* KOMMENTARE WEG: die Absaetze an den umgebauten Stellen NENNEN die
     gefallenen Schluessel und erklaeren, warum sie gefallen sind. Wer den
     Code liest, sucht Rufe -- nicht Erinnerungen. Derselbe Schnitt wie bei
     Zusage 1 von 0.31.0. */
  const dsCode = dsApp.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
  const dsTexts = (j) => Object.entries(j).filter(([k]) => k !== '_locale' && k !== '_name')
    .flatMap(([k, v]) => (typeof v === 'string' ? [v] : Object.values(v)).map(text => [k, text]));
  const Q = String.fromCharCode(39);

  group('Deutsch sitzt — 0.31.1');
  {
    /* ---- Zusage 2: kein Schluessel ist mehr ein blosses Bruchstueck ----
       DREI SORTEN, und jede war vor der Runde da. Gezaehlt wird auf dem
       DEUTSCHEN Stand: er ist die unveraenderliche Basis (Abschnitt 12), und
       en/tr ziehen in 0.31.2 und 0.31.3 nach.

       DIE WORTSCHLUESSEL SIND AUSGENOMMEN, und zwar NAMENTLICH und nicht ueber
       eine Eigenschaft: ein `{word}`-Fueller IST per Entwurf ein einzelnes
       Wort („nicht", „einmal", „vor"), und wer ihn mitzaehlte, bekaeme eine
       Zusage, die ihr eigenes Muster verbietet. Gelesen werden sie aus dem
       QUELLTEXT -- wer einen tMark()-Ruf entfernt, verliert die Ausnahme
       automatisch und nicht erst, wenn jemand diese Liste pflegt. */
    const dsWordKeys = new Set();
    for (const m of dsCode.matchAll(/\btMark\(\s*'[^']+'\s*,\s*'([^']+)'/g)) dsWordKeys.add(m[1]);
    /* UND DIE FUELLUNGEN VON tMarks() SIND AUCH WELCHE. Der zweite Helfer
       nimmt sein Stueck als fertigen Text und nicht als Schluessel; steht
       dort ein `tH('entry.calcEquals')`, ist das derselbe Wortschluessel wie
       beim einteiligen Ruf. Gelesen wird wieder aus dem QUELLTEXT. */
    for (const m of dsCode.matchAll(/\bword\d*:\s*[^,}]*?\bt[H]?\(\s*'([^']+)'/g)) dsWordKeys.add(m[1]);
    check('Die Wortschluessel kommen aus dem Quelltext und nicht aus einer Liste',
      dsWordKeys.size >= 30 && dsWordKeys.has('login.linkUnaffectedWord'),
      `${dsWordKeys.size} Wortschluessel`);

    /* ZWEI SORTEN STEHEN WEITERHIN MIT EINEM TRENNER ODER EINEM EINZELNEN WORT
       DA, und keine von beiden ist ein Bruchstueck. Die Zusage hiess bis zum
       Bau von BA 3 nur „kein Wert faengt mit einem Satzzeichen an", und sie
       war damit ZU GROB: sie haette „— keine —" aus einer Auswahlliste
       einkassiert und den Nachsatz eines Satzes gleich mit.

       DAS ANSCHLUSSSTUECK fuellt einen BENANNTEN PLATZ eines anderen Satzes.
       Wo sein Trenner sitzt, entscheidet dann der SATZ und nicht der
       Quelltext -- und genau das wird geprueft: der Elternsatz muss den Platz
       wirklich tragen, und der Ruf muss das Stueck wirklich dort einsetzen.
       Faellt der Platz weg, faellt die Ausnahme mit ihm.

       DIE EIGENSTAENDIGE BESCHRIFTUNG ist ein Bedienelement und kein Satzteil:
       ein Eintrag einer Auswahlliste, die Beschriftung eines Filterknopfes,
       das Zustandswort einer Kennzeile, das Bindewort einer Aufzaehlung. Sie
       steht NAMENTLICH da, mit ihrem Ort.

       UND DIE TAFEL IST GESCHLOSSEN: was nicht darin steht, ist ein Fund --
       und was darin steht und keines mehr ist, faellt genauso auf. Eine
       Ausnahmeliste, die nur in eine Richtung prueft, waechst. */
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
       den Platz `{of}` von `list.commentCount`. Beide sind mit 0.32.1
       gefallen: die Zaehlzeile baut keinen Satz mehr. */
    const DS_STANDALONE = {
      'card.more':        'Beschriftung des Aufklappers',
      'card.noDelivery':  'Eintrag der Versandauswahl',
      'card.off':         'Zustandswort einer Kennzeile',
      'card.on':          'Zustandswort einer Kennzeile',
      'entry.none':       'Eintrag der Kategorieauswahl',
      /* `list.and` STAND HIER BIS 0.32.0 als „Bindewort einer Aufzaehlung".
         Die Aufzaehlung, die es band, war die Zaehlzeile des
         Kommentarblocks; sie zaehlt seit 0.32.1 mit Mittelpunkten auf, und
         das Bindewort hatte danach keinen Rufer mehr. */
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
       und der Ruf setzt das Stueck dort ein. Gesucht wird im Quelltext ab dem
       Namen des Elternsatzes -- der Ruf steht mit seinen Werten daneben. */
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

    /* UND KEINE AUSNAHME STEHT UMSONST DA. Ein Eintrag, dessen Wert kein
       Satzzeichen mehr traegt oder den niemand mehr ruft, ist eine Erinnerung
       und keine Ausnahme -- er faellt hier auf. */
    const dsStale = [...dsException].filter(k => !(k in dsFiles.de))
      .concat([...dsException].filter(k => k in dsFiles.de && !dsCode.includes(`${Q}${k}${Q}`)));
    check('Und keine Ausnahme steht umsonst in der Tafel',
      dsStale.length === 0, dsStale.join(' ') || `${dsException.size} benannt`);

    /* DIE DRITTE SORTE: DAS BLOSSE FUELLWORT. Ein Schluessel, dessen ganzer
       Wert ein Funktionswort ist, traegt keine Aussage -- er traegt ein
       Scharnier, das im Quelltext zwischen zwei andere Stuecke geschraubt
       wird. Gesucht wird eine GESCHLOSSENE KLASSE und keine Wortlaenge: „Name",
       „Suche" und „Standard" sind einzelne Woerter und trotzdem Beschriftungen.
       Ausgenommen sind wieder die Wortschluessel und die benannten
       Beschriftungen -- „an", „aus" und „Oder" SIND Bedienelemente. */
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
       ZWEI SCHLUESSEL TATEN ES, und beide waren unsichtbar:
         entry.reportKind = „report" wurde gegen einen DATENBANKWERT
           verglichen -- eine Zeile darueber stand derselbe Vergleich gegen
           ein Literal. Wer den Schluessel uebersetzt haette, haette die
           Beschriftung des Knopfes stumm umgedreht.
         dialog.sessionExpired = „Sitzung abgelaufen" wurde geworfen und an
           sechs Stellen zurueckverglichen -- und nie angezeigt.
       GESUCHT WIRD DAS MUSTER UND NICHT DIE BEIDEN NAMEN: ein dritter
       Schluessel derselben Sorte soll unter dieser Zusage auffallen und nicht
       erst, wenn jemand ihn zufaellig liest. */
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

    /* ---- Zusage 5: jeder Platz hat seinen Satz und jeder Satz seinen Platz ----
       BEIDE RICHTUNGEN, und die zweite ist die wichtigere: ein Satz mit
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
       Muster von 0.25.4 nichts zu tun. Eine Doppelbelegung des Namens, aelter
       als diese Runde -- sie faellt hier auf, damit sie nicht waechst. */
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
       FUELLUNG. tMarks() kennt {word}, {word2}, {word3}; fehlt einer am Ruf,
       steht er am Bildschirm.
       (Das Wort, das hier naheliegt, steht auf der Liste des Sprachwaechters
       -- er hat diesen Absatz in seinem ersten Lauf gefangen.) */
    const dsGap = [];
    for (const m of dsCode.matchAll(/\btMarks\(\s*'([^']+)'\s*,\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)) {
      const filled = new Set([...m[2].matchAll(/(\w+)\s*:/g)].map(x => x[1]));
      for (const slot of String(dsFiles.de[m[1]] || '').matchAll(/\{(word\d*)\}/g))
        if (!filled.has(slot[1])) dsGap.push(`${m[1]} ${slot[1]}`);
    }
    check('Und jeder Platz eines Satzes mit mehreren Stuecken bekommt seine Fuellung',
      dsGap.length === 0, dsGap.join(' · ') || 'alle');

    /* UND DER PLATZ STEHT IN ALLEN DREI DATEIEN AN SEINER STELLE. Eine Sprache
       ohne `{word}` verlaere die Hervorhebung stumm -- der Satz stuende da,
       das hervorgehobene Stueck nicht. */
    const dsSlotMismatch = Object.keys(dsFiles.de).filter(k => ['en', 'tr']
      .some(c => String(dsFiles.de[k]).includes('{word}') !== String(dsFiles[c][k]).includes('{word}')));
    check('Und jeder Platz steht in allen drei Dateien',
      dsSlotMismatch.length === 0, dsSlotMismatch.join(' ') || 'alle drei gleich');

    /* ---- Zusage 6: keine Beschriftung nennt ihr eigenes Vorgabewort ----
       „Bericht, Einzahl" stand neben „(Vorgabe: Bericht)" -- dasselbe Wort
       zweimal in einer Zeile. Und wer „Bericht" in „Protokoll" umbenennt,
       liest weiter „Bericht, Einzahl": die Beschriftung eines Feldes, das
       gerade zum Umbenennen da ist, trug den alten Namen.
       ZEHN DER FUENFZEHN SIND NICHT ANGETASTET -- sie wiederholen kein
       Vorgabewort und folgen nur verschiedenen Stilen. Diese Zusage sucht den
       FEHLER und nicht den Geschmack. */
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

    /* ---- Zusage 7: keine Zahl steht zweimal ----
       Die vier Groessen standen als `value="52428800"` UND als Schluessel mit
       dem Text „50 MB" -- in drei Dateien, obwohl „50 MB" in allen dreien
       gleich lautet. Und card.vocabularyResetHint zaehlte die vierzehn
       Vorgabewoerter in Prosa auf, die in derselben Karte darueber stehen. */
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
       card.nameFreedHint schrieb „Geloeschter Benutzer &lt;Nummer&gt;" nach.
       Zwei Fehler in einem: ein Uebersetzer muesste Maskierung kennen, und
       die Beschriftung steht schon als list.deletedUser daneben.
       AUF DEUTSCH EINGEGRENZT, und das steht hier statt in einer Fussnote:
       en und tr tragen die Entitaeten noch, und sie herauszunehmen hiesse,
       ihre Saetze neu zu formulieren -- das ist 0.31.2 und 0.31.3. Eine
       Zusage, die eine Runde lang rot steht, ist keine. */
    const dsEntity = dsTexts(dsFiles.de).filter(([, v]) => /&[a-z]+;|&#\d+;/i.test(v));
    check('Kein deutscher Wert traegt eine HTML-Entitaet',
      dsEntity.length === 0, dsEntity.map(([k]) => k).join(' ') || 'keiner');

    /* ---- Zusage 9: kein Wert traegt Weissraum aus dem Quelltext ----
       UND DIESE GILT FUER ALLE DREI. Sie ist der Tausch fuer die Lockerung an
       der Wortlautprobe: die zieht den Weissraum seit dieser Runde zusammen,
       statt ihn als Wortlaut zu zaehlen -- und hier ist er GANZ verboten.
       Was dort an Strenge abgegeben wird, steht hier staerker wieder da:
       vorher fiel Weissraum nur in de.json auf und nur als Buchfuehrung,
       jetzt in allen dreien und unbedingt. */
    /* EINRUECKUNG, NICHT UMBRUCH -- und diese Unterscheidung ist teuer
       gelernt. Der erste Anlauf dieses Bauabschnitts zog JEDEN Umbruch
       zusammen und hat damit die vier Briefe zerstoert: in `mail.*.body` sind
       Umbrueche ABSAETZE, und jede Mail waere als eine Textwand angekommen.
       Der Pruefstand hat es viermal gemeldet -- einmal je Brief.
       SO GEHT DIE GRENZE: Einrueckung ist ein Umbruch, dem LEERZEICHEN
       FOLGEN; so entsteht sie, wenn jemand eine Vorlagenzeile im Quelltext
       umbricht. Ein Absatz ist ein Umbruch, dem ein Zeichen folgt. */
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

    /* ---- Zusage 10: die Umbenennungstafel zeigt nirgends ins Leere ----
       Sie ist die Deutsch-nach-Englisch-Tafel aus 0.8.x und KEIN Verzeichnis
       der Wanderungen. 0.31.0 hat die elf ersatzlos gestrichenen Schluessel
       daraus ENTFERNT; hier ist es anders -- ein verschmolzener Schluessel hat
       einen Nachfolger, und der alte deutsche Name zeigt auf ihn. */
    const dsTable = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'tools', 'keys.json'), 'utf8'));
    /* AUF DIE SCHLUESSEL DIESER RUNDE EINGEGRENZT, und das ist ein BEFUND und
       keine Bequemlichkeit: NEUNUNDDREISSIG Eintraege zeigten schon vor
       0.31.1 ins Leere -- auf `login.not`, `list.sortAvgDesc`,
       `card.convertAllPng` und die vierzehn deutschen Vokabelnamen. Sie
       stammen aus 0.24 bis 0.30.
       WOHIN SIE ZEIGEN SOLLTEN, WEISS DIESE RUNDE NICHT. Zu raten waere
       schlimmer als die Luecke: ein falscher Nachfolger schickt den Sucher an
       die falsche Stelle und sieht dabei richtig aus. Sie stehen als Befund
       im Aenderungsprotokoll.
       WAS HIER GEPRUEFT WIRD: die sechsundsechzig Schluessel, die DIESE Runde
       weggenommen hat, haben alle ihren Nachfolger -- oder ihr Eintrag ist
       mitgefallen, wie bei den elf von 0.31.0.
       UND EINER IST MIT 0.32.0 MITGEFALLEN: `liste.andererBenutzer` zeigte auf
       `list.otherUser`, und den gibt es nicht mehr (F4). Ein Nachfolger liesse
       sich nicht benennen -- das hervorgehobene Wort ist im neuen Satz gar
       nicht mehr enthalten --, also faellt der Eintrag, wie die elf von
       0.31.0. DIE ZAHL DARUNTER BLEIBT DESHALB BEI 39. */
    const DS_OLD_DANGLING = 39;
    const dsDangling = Object.entries(dsTable).filter(([, target]) => !(target in dsFiles.de));
    check('Kein Eintrag der Umbenennungstafel zeigt auf einen Schluessel DIESER Runde',
      dsDangling.length === DS_OLD_DANGLING,
      `${dsDangling.length} ins Leere, ${DS_OLD_DANGLING} davon aelter als diese Runde`);

    /* ---- Zusage 4: die drei Dateien tragen gleich viele Schluessel ----
       Die Zahl steht ausdruecklich da, wie bei F_ROUTES: „gleich viele" allein
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

    /* ---- Zusage 1: die Gleichlautprobe steht als Werkzeug daneben ----
       SIE IST KEINE PRUEFUNG UND SOLL KEINE SEIN: sie braucht einen ZWEITEN
       Stand zum Vergleichen, und den hat ein Lauf nicht. Was hier geprueft
       wird, ist, dass es sie GIBT und dass sie ihre eigene Blindstelle nennt
       -- ein Werkzeug, dem jemand mehr zutraut, als es kann, ist schlimmer
       als keines. */
    const dsTool = path.join(__dirname, 'tools', 'gleichlaut.js');
    check('Die Gleichlautprobe liegt als Werkzeug daneben',
      fs.existsSync(dsTool), 'tools/gleichlaut.js');
    const dsToolText = fs.existsSync(dsTool) ? fs.readFileSync(dsTool, 'utf8') : '';
    check('Und sie nennt ihre eigene Blindstelle — sie fuehrt den Code nicht aus',
      /WOFUER SIE BLIND IST/.test(dsToolText) && /FUEHRT DEN CODE NICHT AUS/.test(dsToolText),
      dsToolText ? 'Blindstelle benannt' : 'Datei fehlt');
  }
}

/* =================================================================
   0.31.2 — „Englisch sitzt"

   ZEHN ZUSAGEN UEBER EINE EINZIGE DATEI. Die Runde formuliert `en.json` neu
   und faellt dabei keinen Schluessel; der deutsche Stand ist die
   unveraenderliche Basis und wird in Zusage 1 nachgerechnet, nicht
   behauptet.

   DIE VORLAGE KAM VON AUSSEN -- `Doku/I18N_GENERATE_EN.md`, von Google Gemini
   geschrieben, vier Stolperfallen. Sie ist NACHGEMESSEN und nicht uebernommen:
   ihre Stolperfalle 1 (die Plaetze) war schon gruen, ihre Stolperfalle 2
   nannte fuenf Schluessel, gemessen sind es sieben, und eine Zeile ihrer
   Verbotsliste hat null Treffer. Was nicht uebernommen wurde, steht mit Grund
   im Auftrag.

   DIE VERBOTSLISTE WIRD HIER EIN WAECHTER UND KEIN MERKZETTEL (Leitplanke L4).
   Eine Verbotsliste in einem Papier verblasst; eine im Pruefstand wird rot.
   Sie ist das erste Stueck der Runde gewesen, damit sie beim Bauen schon rot
   steht und nicht erst am Ende -- dieselbe Reihenfolge wie bei der
   Gleichlautprobe in 0.31.1.

   WOFUER KEINE ZEILE HIER BLIND SEIN KANN: ob ein englischer Satz GUT ist.
   Das entscheidet kein Muster, das entscheidet der Augenschein und der Leser.
   Diese Zusagen halten die MESSBAREN Seiten fest -- Laenge, Satzzahl, Plaetze,
   verbotene Woerter, Entitaeten -- und jede einzelne ist an einem Befund
   dieser Runde gelernt und nicht erfunden.
   ================================================================= */
/* DIE BEIDEN DEUTSCHEN PRUEFSUMMEN DER GLEICHLAUTPROBE, gemessen am gebauten
   Stand dieser Runde. SIE SIND DER BEWEIS FUER LEITPLANKE L1 -- „Deutsch ist
   die unveraenderliche Basis" -- und stehen deshalb im Code und nicht im
   Papier: eine Zusage, die niemand nachrechnet, ist eine Behauptung.
   SIE HAENGEN AUCH AN `public/app.js`, und das ist kein Mangel, sondern der
   Gegenstand: die Probe misst, was am BILDSCHIRM steht, und dorthin kommt der
   deutsche Satz durch den Quelltext. Wer app.js anfasst, rechnet die beiden
   Zahlen neu und schreibt sie hierher -- wie die Wortlautprobe ihre Listen je
   Runde nachfuehrt.
   DER AUFTRAG NENNT ZWEI ANDERE WERTE (bbd86a64161af49e / 70b5fb78ad2832b1).
   Die sind am gebauten Stand von 0.31.1 nicht nachzumessen -- weder am
   Arbeitsbaum noch an einer frischen Kopie von HEAD; das Werkzeug rechnet die
   beiden hier. Was die Runde halten kann, ist der GEMESSENE Stand.

   UND DIE ZUSAGE HAT EINE AUSNAHME, DIE DER BETREIBER WAEHREND DER RUNDE
   BESTELLT HAT -- zwei deutsche Werte, und sie stehen unten NAMENTLICH da:
   „Zugang beantragen" heisst jetzt „Zugang anfragen". Der Grund ist gemessen
   und keine Geschmacksfrage: das ganze Wortfeld sagt in allen drei Sprachen
   „Anfrage" (`login.sendRequest`, `card.openRequests`, `card.requestedAt`,
   „Send request", „Başvuruyu gönder"); dieses eine Label war der Ausreisser.
   EINE AUSNAHME MIT NAMEN IST EINE ENTSCHEIDUNG, eine ohne waere ein Leck:
   darum stehen hier DREI Zahlen statt einer -- der Stand von 0.31.1, der Stand
   dieser Runde, und die beiden Werte selbst Zeichen fuer Zeichen. */
/* MIT 0.31.4 SIND DIESE BEIDEN ZAHLEN ANDERE, UND KEIN DEUTSCHER SATZ HAT SICH
   BEWEGT. Die Probe liest den ganzen Quelltext, und die Runde hat `counted()`
   in `public/app.js` gebaut -- also aendern sich alle SECHS Summen. Genau davor
   warnt die Probe selbst: „SIE SIEHT AUCH QUELLTEXT ... das ist kein Mangel,
   sondern der Preis dafuer, dass sie NICHT unterscheiden kann, was ein Mensch
   sieht."
   NACHGESEHEN WORDEN IST ES TROTZDEM, mit dem zweiten Gang der Probe
   (`node tools/gleichlaut.js <neu> <alt>`): fuer `de` und `en` sind die
   Woerter, die kommen und gehen, AUSSCHLIESSLICH Quelltext --
   `AFTER_NUMBER`, `counted(n, other);`, `data._afterNumber`,
   `counted(finished,` gegen `plural(finished,`, dazu `afterNumberOf`,
   `many word)` und `many(7,` aus der Vorschau der Vokabelkarte. Kein
   Bildschirmtext.
   UND EINMAL WAR DOCH EINER DARIN, und genau dieser zweite Gang hat ihn
   gemeldet: der erste Bau der Vorschau-Berichtigung strich die Zahl
   UNBEDINGT, und damit las die DEUTSCHE Vorschau „Einträge" statt
   „7 Einträge". Die Forderung des Betreibers war „das darf sich bei deutsch
   und englisch nicht negativ auswirken"; die Vorschau fragt seither die
   Stellungsregel der GEZEIGTEN Sprache, und am Browser steht deutsch wieder
   „7 Einträge" und tuerkisch „Öğeler".
     e026e2cf4acfaf08 / 467fb77110922665 -- 0.31.3
     7c1fe1a927f158f9 / 0b443d44733cc668 -- vor 0.31.3

   UND MIT 0.32.0 BEWEGEN SICH ALLE SECHS, und das ist der Unterschied zu
   0.31.2 und 0.31.3: DORT WAR DIE UNVERAENDERLICHKEIT DIE ZUSAGE, HIER IST ES
   DIE BUCHFUEHRUNG. Jede Aenderung an den drei Sprachdateien steht namentlich
   in ihrer Tafel -- die Wortlautprobe gegen 0681d42, EG_CHANGED_AFTER_0312,
   TR_CHANGED_AFTER_0313 --, und was nicht darin steht, ist ein Fund
   (Leitplanke L3, Zusage 10 dieser Runde).
   DIE SUMMEN BLEIBEN TROTZDEM STEHEN UND WERDEN NICHT ABGESCHAFFT: sie sind
   der zweite Blick auf dieselbe Frage. Wer einen Wert aendert, ohne ihn in
   seine Tafel zu schreiben, faellt an den Tafeln auf; wer QUELLTEXT aendert,
   der Bildschirmtext erzeugt, faellt nur hier auf.
     0f38b9157739b492 / bc6542b1f0e28bd6 -- 0.31.4, der Stand vor dieser Runde
     6ff26921e11674ff / e1428e2484415619 -- 0.32.1, der Stand vor 0.33.0 */
const DE_UNTOUCHED = { one: 'daa0c9094f2c2305', other: '77128aef244a5976' };
const DE_BEFORE_0312 = { one: '91b86c5affcba789', other: '07fc3ccdc8a27a03' };
const DE_ORDERED_0312 = {
  'login.requestAccess': 'Zugang anfragen',
  'login.requestAccessHint':
    'Zugang anfragen. Du bestätigst deine Adresse per Mail, danach entscheidet ein Admin.'
};

/* DIE TAFEL DER ENGLISCHEN AENDERUNGEN -- sie steht auf MODULEBENE, weil
   zwei Gruppen sie lesen: 0.31.2 misst gegen ihren eigenen Vergleichsstand,
   0.31.3 misst denselben Stand noch einmal von ihrer Seite aus. Zwei Listen
   ueber dieselbe Frage liefen auseinander (Stolperstein 47). */
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
  /* JEDES PAAR MIT SEINER FORM. Jede Zusage dieser Runde stellt Englisch gegen
     Deutsch, und zwar Form gegen Form: ein Mehrzahlsatz kann in der Einzahl
     sitzen und in der Mehrzahl auseinanderlaufen. */
  const egPairs = [];
  for (const [k, dv] of Object.entries(egFiles.de)) {
    if (k.startsWith('_')) continue;
    const ev = egFiles.en[k];
    if (typeof dv === 'string') egPairs.push([k, '', String(dv), typeof ev === 'string' ? ev : '']);
    else for (const f of Object.keys(dv))
      egPairs.push([`${k}/${f}`, f, String(dv[f]),
        ev && typeof ev === 'object' && ev[f] !== undefined ? String(ev[f]) : '']);
  }
  /* DIE PLAETZE FALLEN VOR JEDER WORTPRUEFUNG HERAUS. `{thing}` ist das
     Vokabelwort des Betreibers und kein englischer Satzteil -- eine
     Verbotsliste, die „Thing" sucht, faende sonst genau den Platz, der dort
     stehen MUSS, und waere nach einem Tag abgeschaltet. */
  const egBare = (v) => String(v).replace(/\{[A-Za-z0-9_]+\}/g, ' ');

  group('Englisch sitzt — 0.31.2');
  {
    /* ---- Zusage 1: Deutsch ist unangetastet -----------------------------
       NACHGERECHNET UND NICHT BEHAUPTET. Die Gleichlautprobe von 0.31.1 setzt
       jeden Textruf im Quelltext durch seinen Wert; ihre beiden deutschen
       Summen muessen nach dieser Runde dieselben sein wie davor.
       SIE WIRD WIRKLICH GEFAHREN, mit einem eigenen Ausgabepfad im
       Systemtemp. Ein Werkzeug, das nur daliegt, belegt nichts -- 0.31.1 hat
       es bei sich selbst so gehalten und genau diese Luecke benannt. */
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
       bestellt hat. DIESE ZEILE IST DIE EHRLICHE HAELFTE DER ZUSAGE: sie sagt,
       dass Deutsch NICHT unberuehrt ist, und die Zeile darunter sagt, wo. Ohne
       beide waere „Deutsch ist unangetastet" eine halbe Zusage -- und eine
       halbe ist keine. */
    check('Und sie sind ANDERE als die von 0.31.1 — der Betreiber hat zwei Werte bestellt',
      egSums['de/one'] !== DE_BEFORE_0312.one && egSums['de/other'] !== DE_BEFORE_0312.other,
      `0.31.1: ${DE_BEFORE_0312.one} · ${DE_BEFORE_0312.other}`);
    const egOrdered = Object.entries(DE_ORDERED_0312)
      .filter(([k, v]) => String(egFiles.de[k]) !== v);
    check('Und die beiden bestellten Werte stehen Zeichen fuer Zeichen da — und sonst kein deutscher',
      egOrdered.length === 0 && Object.keys(DE_ORDERED_0312).length === 2,
      egOrdered.map(([k]) => `${k}: ${JSON.stringify(egFiles.de[k])}`).join(' · ') || 'beide'); 
    /* UND DIE ENGLISCHEN SIND ES NICHT. Diese Zeile ist die Gegenrichtung und
       genauso wichtig: haelt Zusage 1, ohne dass sich Englisch bewegt hat,
       dann hat die Runde nichts getan. */
    check('Und die beiden englischen sind es NICHT — die Runde hat Englisch angefasst',
      egSums['en/one'] !== '45fa40be3b0b6145' && egSums['en/other'] !== '24f9083c0610df9d',
      `en/one ${egSums['en/one']} · en/other ${egSums['en/other']}`);

    /* ---- Zusage 2: gleich viele Schluessel, dieselbe Folge, dieselbe Gestalt
       DIE ZAHL STEHT AN EINER STELLE (LANG_KEY_COUNT, Stolperstein 47). Was
       diese Runde dazulegt, ist die GESTALT: ein Mehrzahlpaar auf Deutsch muss
       auf Englisch ein Mehrzahlpaar sein. Ein Uebersetzer, der es zu einem
       Satz zusammenzieht, nimmt der Einzahl ihren Satz -- und am Bildschirm
       steht „1 Einträge". Die Deckungsprobe sieht das nicht: der Schluessel
       ist da, und gezaehlt wird er auch. */
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
       ist, steht woertlich am Bildschirm („3 Kommentare{of}" -- 0.31.1).
       DIE ALLGEMEINE PLATZHALTERPROBE PRUEFT DASSELBE UEBER ALLE DREI
       DATEIEN. Hier steht sie trotzdem noch einmal, auf Englisch eingegrenzt:
       diese Runde formuliert englische Saetze um, und die Zusage gehoert zu
       ihr. Eine Zusage, die ihre Gegenprobe nicht namentlich rot macht, ist
       Buchfuehrung von einer anderen Runde. */
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
       DREIZEHN MUSTER, UND JEDES MIT SEINEM GRUND. Die Vorlage hat sie
       aufgeschrieben; hier stehen sie als Wache, weil ein aufgeschriebenes
       Verbot beim naechsten Satz vergessen ist. Gemessen waren es 36 Treffer
       in 33 Schluesseln.
       DIE VIERZEHNTE ZEILE DER VORLAGE -- die US-Schreibung -- STEHT NICHT
       HIER, SONDERN IN ZUSAGE 8. Sie hatte null Treffer und ist damit kein
       Befund dieser Runde, sondern eine Leitplanke ueber alle kommenden:
       `_locale` sagt en-GB seit 0.24.3. */
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
       ist gruen und sagt nichts. Dieselbe Bauform wie beim Sprachwaechter --
       geprueft wird an einem Satz, der wirklich in der Datei stand. */
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
       `card.nameFreedHint` nur mit einem neu formulierten Satz herauskommt.
       Das ist diese Runde. Der Grund ist derselbe: eine Entitaet in einem
       Wert verlangt vom Uebersetzer, Maskierung zu kennen -- und wer sie
       nicht kennt, schreibt spitze Klammern hin, die im Browser verschwinden. */
    const egEntity = egPairs.filter(([, , , en]) => /&[a-z]+;|&#\d+;/i.test(en));
    check('Zusage 5: kein englischer Wert traegt eine HTML-Entitaet',
      egEntity.length === 0, egEntity.map(([n]) => n).join(' ') || 'keiner');

    /* ---- Zusage 6: kein englischer Wert ist deutlich laenger -----------
       NUR IN EINE RICHTUNG, und das ist die Entscheidung des Auftrags (F7):
       Englisch braucht fuer dieselbe Aussage regelmaessig weniger Zeichen als
       Deutsch, also darf es kuerzer sein und soll es oft. Eine Zusage „gleich
       lang" waere falsch und nach drei Saetzen abgeschaltet.
       AB VIERZIG ZEICHEN, und darunter gar nicht: „vor" wird „before" und ist
       damit doppelt so lang -- an einem Wort sagt das Verhaeltnis nichts. Ein
       SATZ dagegen, der auf Englisch ein Sechstel laenger ist, traegt Ballast,
       und genau der war der Befund der Vorlage.
       FUENFZEHN PROZENT, und nicht fuenf: die Grenze soll den Roman fangen und
       nicht den Artikel. Gemessen waren es vor der Runde sieben Werte mit mehr
       als 1,15 -- zweieinhalbfach der laengste. */
    const EG_LONG_FROM = 40, EG_LONG_MAX = 1.15;
    const egTooLong = egPairs
      .filter(([, , de, en]) => de.length >= EG_LONG_FROM && en.length > de.length * EG_LONG_MAX)
      .map(([n, , de, en]) => `${n} ${(en.length / de.length).toFixed(2)}x (de ${de.length} en ${en.length})`);
    check(`Zusage 6: kein englischer Wert ab ${EG_LONG_FROM} Zeichen ist mehr als ${EG_LONG_MAX}x so lang wie sein deutscher`,
      egTooLong.length === 0, egTooLong.slice(0, 8).join(' · ') || 'keiner');

    /* ---- Zusage 7: nicht mehr Saetze als der deutsche -----------------
       DIE KUERZE STECKT NICHT IN DEN ZEICHEN, SONDERN IN DEN SAETZEN. Sechs
       englische Werte trugen vor dieser Runde einen Satz mehr als ihr
       deutscher -- `card.resetMailHint` sogar drei; das ist der
       Erklaerbaersaft, den 0.31.1 auf Deutsch weggenommen hat (BA 7).
       DIE ABKUERZUNGEN FALLEN VORHER HERAUS, und zwar NAMENTLICH: „z. B." mit
       seinem Leerzeichen zaehlte sonst als ZWEI Satzenden und „e.g." als
       eines -- der deutsche Satz duerfte dann zwei Saetze mehr tragen, und die
       Zusage waere in genau den drei Karten blind, in denen sie etwas sagt. */
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
       sie steht hier, damit sie es bleibt. Die Vorlage hat die US-Schreibung
       als dreizehnte Zeile ihrer Verbotsliste gefuehrt; gemessen hatte sie
       null Treffer, und eine Verbotszeile ohne Treffer ist keine Arbeit,
       sondern eine Leitplanke.
       SECHZEHN PAARE, JEDES MIT SEINER BRITISCHEN SEITE. Eine Regel „kein
       -ize" waere billiger und falsch: `size` traegt dieselben drei
       Buchstaben, und ein Waechter, der „Size of the inventory" meldet, ist
       nach einem Tag abgeschaltet. */
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
       weiter. Hier steht die englische Haelfte noch einmal fuer sich, weil
       diese Runde englische Werte NEU SCHREIBT: wer einen langen Satz im
       Quelltext umbricht, legt die Einrueckung in den Wert, und am Bildschirm
       faellt sie nicht auf -- HTML zieht sie zusammen. Sie wandert dann
       ungesehen in jede weitere Uebersetzung mit. */
    const egSpace = egPairs.filter(([, , , en]) => /\n[ \t]|[ \t][ \t]/.test(en));
    check('Zusage 9: kein englischer Wert traegt die Einrueckung des Quelltexts',
      egSpace.length === 0, egSpace.map(([n]) => n).join(' ') || 'keiner');
    const EG_LETTERS = ['mail.confirm.body', 'mail.invite.body', 'mail.reset.body', 'mail.test.body'];
    const egBreak = [...new Set(egPairs.filter(([, , , en]) => en.includes('\n')).map(([n]) => n))];
    check('Und ein Umbruch steht nur in den vier Briefen, wo er ein Absatz ist',
      egBreak.sort().join(' ') === EG_LETTERS.join(' '), egBreak.join(' ') || 'keiner');
    /* UND DIE ABSAETZE STEHEN IN JEDEM BRIEF. Der Prueflauf von 0.31.1 hat
       genau hier vier rote Punkte gehabt: ein Weissraumschnitt nahm den
       Briefen ihre Leerzeilen, und jede Mail waere als eine Wand Text
       angekommen. Auf Englisch schreibt DIESE Runde die Briefe neu. */
    check('Und jeder der vier Briefe traegt seine Leerzeilen',
      EG_LETTERS.every(k => String(egFiles.en[k]).includes('\n\n')),
      EG_LETTERS.filter(k => !String(egFiles.en[k]).includes('\n\n')).join(' ') || 'alle vier');

    /* ---- Zusage 10: der englische Stand liegt als Vergleichsdatei daneben
       ES GIBT KEINE ABNAHME FUER ENGLISCH. Die deutsche Wortlautprobe haelt
       den Stand von 0681d42 fest, weil es ihn gibt; fuer Englisch ist DIESE
       Runde die Abnahme (Auftrag, F9). Was sie hinterlaesst, ist ein
       Vergleichsstand: 1197 Schluessel, jeder mit seinem Wert.
       DER AUFTRAG NENNT IHN ANDERS -- `Abdruckdatei` --, UND DAS WORT GEHT
       NICHT. Der Sprachwaechter fuehrt `Abdruck` auf seiner Liste, und dort
       heisst es Fingerprint; er hat meine drei Kommentarzeilen im ersten Lauf
       gemeldet, mit Datei und Zeilennummer.
       Ein Waechter, der die eigene Vorschrift der Runde anmeckert, hat recht:
       zwei Namen fuer zwei Sachen sind besser als einer fuer beide.
       UND DIE TAFEL DARUNTER IST DER EIGENTLICHE WAECHTER. Sie ist LEER, und
       solange sie das ist, muss jeder englische Wert Zeichen fuer Zeichen der
       dieser Runde sein. Wer Englisch anfasst, schreibt den Schluessel mit
       seinem Grund hinein -- dieselbe Bauform wie die drei Listen der
       Wortlautprobe. EINEN VERGLEICHSSTAND STILL NACHZUZIEHEN ist damit
       keine Moeglichkeit mehr, sondern ein roter Punkt. */
    const egPrintFile = path.join(__dirname, 'tools', 'englisch-0312.json');
    check('Zusage 10: der englische Stand liegt als Vergleichsdatei daneben',
      fs.existsSync(egPrintFile), 'tools/englisch-0312.json');
    const egFile = fs.existsSync(egPrintFile)
      ? JSON.parse(fs.readFileSync(egPrintFile, 'utf8')) : {};
    const egPrint = egFile.values || {};
    /* UND SIE SAGT, WAS SIE IST UND WOHER SIE KOMMT. Eine Datei mit 1197
       Zeilen und ohne einen Satz darueber wird beim naechsten Handgriff von
       Hand gepflegt -- und dann ist sie eine zweite Wahrheit. Dieselbe Bauform
       wie bei der deutschen Wortlautprobe (`_about` in
       tools/wording-0681d42.json). */
    check('Und sie nennt ihre Runde und ihr Werkzeug',
      egFile.round === '0.31.2' && /englischstand\.js/.test(String(egFile._about)),
      `${egFile.round} · ${String(egFile._about || '').slice(0, 60)}`);
    check('Und das Werkzeug, das sie schreibt, liegt daneben',
      fs.existsSync(path.join(__dirname, 'tools', 'englischstand.js')),
      'tools/englischstand.js');
    /* DER VERGLEICHSSTAND WAECHST NICHT MIT -- er haelt den Stand von 0.31.2.
       0.31.4 hat allen drei Dateien `_afterNumber` in den Kopf gelegt; der
       Schluessel steht deshalb NAMENTLICH hier und nicht still in der Datei. */
    /* UND ACHTZEHN MIT 0.32.0. Sie stehen namentlich hier, alphabetisch wie in
       der Datei -- jede Runde, die einen Schluessel anlegt, traegt ihn ein. */
    /* UND EINER MIT 0.33.0: `server.exportTooOld`, die eine Abweisung des
       Bruchs. Eine Exportdatei mit Formatnummer 13 oder aelter traegt die
       Feldnamen von vor 0.24.1, und seit jener Runde uebersetzt sie niemand
       mehr -- sie kommt gar nicht erst herein, und der Satz sagt warum. */
    const EG_ADDED_AFTER_0312 = ['_afterNumber',
      'card.grade', 'entry.deletePhoto', 'entry.deleteVideo',
      'list.bellMine', 'list.bellOther', 'list.bellToMe',
      'list.markedCount', 'mail.ownServer',
      'server.backupsBeforeKey', 'server.cleanupAllYoungest', 'server.cleanupNoBackups',
      'server.cleanupOldestAge', 'server.exportTooOld', 'server.noAccountOwner',
      'server.noPublicAddress', 'server.noTestMail', 'server.noUserAddress',
      'server.signupThanks', 'vocabulary.grade'];
    /* UND EINER IST GEFALLEN -- `list.otherUser`. Der Satz des Glockenfensters
       traegt seit 0.32.0 kein hervorgehobenes Wort mehr (F4); ein Schluessel,
       den niemand ruft, bleibt nicht stehen. */
    /* UND SIEBEN MIT 0.32.1 -- sechs, die 0.32.1 ausbaut, und der geteilte
       `entry.deleteWord`. Die zwei Schluessel, die 0.32.0 angelegt und 0.32.1
       schon wieder genommen hat (`list.statusByHand`, `list.byHandHint`),
       stehen HIER NICHT: den Vergleichsstand von 0.31.2 gab es ohne sie, also
       ist dort auch nichts verlorengegangen. */
    /* UND ZWEI MIT 0.33.0: `card.catchUpDerivatives` und `card.derivativesAsk`
       -- die JPEG-Haelfte des Bestandslaufs. Sie beschreiben eine Haelfte, die
       es nicht mehr gibt. DIE FOLGE IST DIE DER DATEI und nicht die der
       Runden: die Zeile darunter vergleicht die Schluessel als FOLGE. */
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
       ein Eintrag nicht doppelt oder an der falschen Stelle stehen kann.
       JEDER TRAEGT SEINE RUNDE UND SEINEN GRUND -- eine Liste ohne Gruende
       waere eine Liste und keine Buchfuehrung. */
    const EG_CHANGED_AFTER_0312 = EG_CHANGED_AFTER_0312_SHARED;
    const egDiff = Object.keys(egFiles.en)
      .filter(k => JSON.stringify(egPrint[k]) !== JSON.stringify(egFiles.en[k]));
    check('Und jeder englische Wert ist Zeichen fuer Zeichen der des Vergleichsstands — ausser den benannten',
      egDiff.join(' ') === Object.keys(EG_CHANGED_AFTER_0312).join(' '),
      egDiff.slice(0, 8).join(' ') || 'alle gleich');
    /* UND DIE TAFEL IST IN BEIDE RICHTUNGEN GESCHLOSSEN -- 0.31.1, Zusage 2.
       Ein Eintrag, der keinen Unterschied mehr benennt, ist eine
       Karteileiche: er behauptet eine Aenderung, die es nicht gibt, und
       deckt beim naechsten Mal eine, die es gibt. */
    const egStale = Object.keys(EG_CHANGED_AFTER_0312).filter(k => !egDiff.includes(k));
    check('Und kein Eintrag der Tafel benennt einen Unterschied, den es nicht gibt',
      egStale.length === 0, egStale.join(' ') || 'keine Karteileiche');
  }
}

/* =================================================================
   0.31.3 — „Tuerkisch sitzt"

   DREIZEHN ZUSAGEN UEBER EINE EINZIGE DATEI, und es ist die letzte der vier
   Runden der 31er-Strecke: 0.31.0 hat die Sprachdateien gegengelesen, 0.31.1
   hat die zersaegten Saetze zusammengesetzt, 0.31.2 hat Englisch auf den Stand
   des Deutschen gebracht. Diese Runde formuliert `tr.json` neu und faellt
   dabei keinen Schluessel; DEUTSCH UND ENGLISCH sind jetzt ZWEI
   unveraenderliche Basen und werden in Zusage 1 nachgerechnet, nicht
   behauptet.

   DIE VORLAGE KAM VON AUSSEN -- `Doku/I18N_GENERATE_TR.md`, von Google Gemini
   geschrieben, fuenf Stolperfallen. Sie ist NACHGEMESSEN und nicht uebernommen,
   und bei ZWEI ihrer Vorschlaege sagt diese Runde ausdruecklich nein. Beide
   Male steht eine ENTSCHEIDUNG DES BETREIBERS dagegen, und beide Male ist sie
   schon ein Waechter:

     STOLPERFALLE 2 -- „die fuenf Vokabelmehrzahlen brauchen ihr -ler/-lar" --
     WIRD NICHT GEBAUT. Die Entscheidung vom 8. September 2026 (Woerterbuch
     TR-S4; Fehler und Ideen, Punkt 19: „abgelehnt, nicht vertagt") gibt jedem
     Vokabelwort GENAU EINEN Mehrzahlplatz, und der wird an zwei Orten gelesen.
     Zusage 9 misst nach, an wie vielen davon eine ZAHL davorsteht -- dort
     stuende danach „3 Öğeler", und das ist kein Tuerkisch. Die Zusage steht
     deshalb UMGEKEHRT da: die fuenf Paare tragen dasselbe Wort.

     STOLPERFALLE 5.2 -- „Yedek ist natuerlicher als Yedekleme" -- WIRD NICHT
     GEBAUT. Der Betreiber am 10. September 2026: „immer nur das wort
     yedekleme". Der Waechter dazu steht seit 0.25.1 im Pruefstand.

   DIE VERBOTSLISTE WIRD HIER EIN WAECHTER UND KEIN MERKZETTEL (Leitplanke L4),
   UND SIE LIEST WORTSTAEMME. Das ist der Unterschied zu 0.31.2 und beim Messen
   dieses Auftrags gelernt: Tuerkisch klebt seine Endungen an -- „hap" steht als
   „haptan", „sabit resim" als „sabit resmi". UND `\b` TAUGT DAFUER NICHT:
   fuer JavaScript sind Ş, ş, ğ, ı, ç, ö und ü keine Wortzeichen, also steht
   zwischen einem Leerzeichen und einem „Ş" gar keine Wortgrenze. Eine erste
   Messung mit `\b` uebersah fuenf von 26 Treffern und meldete „Şey" mit null.
   Hier steht darum ein Blick zurueck (`(?<![\p{L}\p{N}_])`) und die Endung
   bleibt frei.

   WOFUER KEINE ZEILE HIER BLIND SEIN KANN: ob ein tuerkischer Satz GUT ist.
   Das entscheidet kein Muster, das entscheidet der Leser -- und der ist der
   Betreiber selbst (Auftrag, F2). Diese Zusagen halten die MESSBAREN Seiten
   fest, und jede einzelne ist an einem Befund dieser Runde gelernt.
   ================================================================= */
/* DIE VIER PRUEFSUMMEN DER BASIS, gemessen am gebauten Stand dieser Runde --
   DE_UNTOUCHED steht schon oben bei 0.31.2 und wird hier WEITERBENUTZT und
   nicht abgeschrieben: zwei Zahlen an zwei Orten laufen auseinander.
   DIE BEIDEN TUERKISCHEN STEHEN IN BEIDEN RICHTUNGEN DA -- der Stand VOR
   dieser Runde und der danach. Ohne den ersten waere „die Runde hat Tuerkisch
   angefasst" eine Behauptung; ohne den zweiten koennte jemand die Datei
   zurueckdrehen, und niemand saehe es. */
/* 9cfb555855459a0c / 98295846dd0ac5a4 -- 0.31.3
   2f8e5b3abe58f9fd / 39489ec6ae18020b -- vor 0.31.3; derselbe Grund wie oben.
   597dfc60b7a1fa63 / 6558810bf793704a -- 0.31.4, der Stand vor 0.32.0
   97f89e94bcb911f2 / 81d826369839a242 -- 0.32.1, der Stand vor 0.33.0 */
const EN_UNTOUCHED = { one: 'caa4b814e75f8263', other: 'f224721465ac0d35' };
const TR_BEFORE_0313 = { one: '5fec71b10c0dfa3c', other: '18b07eda589b5120' };
/* bbaca227348609dc / 73d9f1ea0298d519 -- der Stand VOR der Berichtigung an der
   Vorschau der Vokabelkarte, die der Augenschein von 0.31.3 verlangt hat.
   a7f3cd4bf8992f90 / e26a1dca46c545da -- 0.31.4, der Stand vor 0.32.0
   f3a2034e18783412 / 5ef5cbd1132e5562 -- 0.32.1, der Stand vor 0.33.0 */
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
       NACHGERECHNET UND NICHT BEHAUPTET, und diesmal fuer ZWEI Sprachen. Die
       Gleichlautprobe von 0.31.1 setzt jeden Textruf im Quelltext durch seinen
       Wert; ihre vier Summen fuer de und en muessen nach dieser Runde dieselben
       sein wie davor -- und die beiden tuerkischen ANDERE. */
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
    /* UND DIE GEGENRICHTUNG. Haelt Zusage 1, ohne dass sich Tuerkisch bewegt
       hat, dann hat die Runde nichts getan -- dieselbe Zeile wie in 0.31.2,
       nur mit BEIDEN Zahlen statt einer: der alte Stand darf nicht
       zurueckkommen, und der neue muss dastehen. */
    check('Und die beiden tuerkischen sind NICHT die von 0.31.2 — die Runde hat Tuerkisch angefasst',
      tgSums['tr/one'] !== TR_BEFORE_0313.one && tgSums['tr/other'] !== TR_BEFORE_0313.other,
      `0.31.2: ${TR_BEFORE_0313.one} · ${TR_BEFORE_0313.other}`);
    check(`Und sie sind die dieser Runde — ${TR_AFTER_0313.one} · ${TR_AFTER_0313.other}`,
      tgSums['tr/one'] === TR_AFTER_0313.one && tgSums['tr/other'] === TR_AFTER_0313.other,
      `tr/one ${tgSums['tr/one']} · tr/other ${tgSums['tr/other']}`);
    /* UND DER ENGLISCHE VERGLEICHSSTAND VON 0.31.2 STIMMT WEITER. Die
       Pruefsumme haengt an `public/app.js` UND an `en.json`; diese Zeile
       nennt die Datei selbst, damit ein Handgriff an einem einzelnen
       englischen Wert namentlich auffaellt und nicht nur als andere Summe. */
    const tgEnPrint = path.join(__dirname, 'tools', 'englisch-0312.json');
    const tgEnFile = fs.existsSync(tgEnPrint)
      ? (JSON.parse(fs.readFileSync(tgEnPrint, 'utf8')).values || {}) : {};
    /* `_afterNumber` IST SEIT 0.31.4 DABEI und steht namentlich da: er ist der
       einzige englische Schluessel, den der Vergleichsstand von 0.31.2 nicht
       kennt, und sein Wert (`plural`) ist genau das Verhalten von vorher. */
    /* UND SEIT 0.32.0 STEHT DIE TAFEL EINEN STOCK HOEHER. Jene Runde fasst
       Englisch an -- das fuenfzehnte Vokabelwort, die geteilte Glockentafel,
       die zwoelf Saetze aus den Serverdateien --, und WELCHE Schluessel das
       sind, steht namentlich in EG_CHANGED_AFTER_0312 (die Gruppe 0.31.2, ein
       Stueck weiter oben). Diese Zeile hier liest dieselbe Tafel statt eine
       zweite danebenzustellen: zwei Listen ueber dieselbe Frage liefen beim
       naechsten Handgriff auseinander (Stolperstein 47). */
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
       BEIDE RICHTUNGEN. Im Tuerkischen wandert die STELLE eines Platzes mit
       der Grammatik (Leitplanke L5) -- der Platz selbst nicht. Diese Runde hat
       genau davon gelebt: „Şu: {word} ancak…" wurde „{word} ancak…", und
       `entry.weightsWhere` hat seinen Platz aus dem Satzende an seine Stelle
       geholt. Waere die Zusage blind, waere dabei ein Platz verschwunden. */
    /* DIE BEIDEN FORMEN EINES VOKABELWORTS SIND DERSELBE PLATZ -- 0.31.4.
       Deutsch schreibt „fuer alle {entryMany}", Tuerkisch muss „her {entryOne}
       için" schreiben: `her` verlangt dort die Einzahl, und ohne diese Zeile
       waere jeder solche Satz ein roter Punkt.
       NUR UM EINEN SPALT GEOEFFNET: getauscht werden darf ausschliesslich
       INNERHALB eines Paares. Ein `{bytes}`, das fehlt, ist weiter ein roter
       Punkt -- und ein `{entryOne}`, das gegen `{dayMany}` getauscht wird,
       auch. */
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
       ELF MUSTER, JEDES MIT SEINEM GRUND. Gemessen waren es vor der Runde
       26 Treffer in 23 Schluesseln.
       DER WORTANFANG IST GEBUNDEN, DAS WORTENDE NICHT: `hap` findet „haptan",
       `sabit res` findet „sabit resmi". Und gebunden wird mit einem Blick
       zurueck und nicht mit `\b` -- der Grund steht im Kopf dieser Gruppe.
       ZEHN DER ELF STEHEN IN DER VORLAGE, das elfte („Şu:") ist der
       Grammatik-Kollaps selbst: der Uebersetzer wusste nicht, wohin mit dem
       deutschen Artikel, und hat vier Saetzen ein „Dieses da:" vorangestellt.
       WAS NICHT HIER STEHT, IST „kilit … devreye girer": die Vorlage fuehrt es,
       gemessen war es EIN Wert, und ein Muster dafuer musste ueber einen halben
       Satz hinweglesen. Der Wert ist neu formuliert, und Zusage 11 haelt
       dieselbe Stelle -- er trug auch die einzige siz-Form der Datei. */
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
       ist gruen und sagt nichts. Geprueft wird an Saetzen, die WIRKLICH in der
       Datei standen -- und ausdruecklich an den ANGEKLEBTEN Endungen. */
    check('Der Leser der Verbotsliste findet, was vor dieser Runde dastand',
      TR_FORBIDDEN.filter(([rx]) =>
        rx.test(tgBare('Üç haptan birine tıklamak filtreyi kendisi ayarlar.')) ||
        rx.test(tgBare('Yalnızca sabit resmi olan videoya izin verilir')) ||
        rx.test(tgBare('Şey, tekil')) ||
        rx.test(tgBare('Anahtar veritabanının yanında duruyor')) ||
        rx.test(tgBare('Şu: {word} giriş sayfasında durur'))).length === 5,
      'der Leser sieht die alten Saetze nicht mehr');
    /* UND ER FAENGT DIE ENDUNG UND NICHT NUR DAS NACKTE WORT. Das ist die
       Lehre, die Leitplanke L4 verschaerft hat: mit `\b` waeren „haptan" und
       „sabit resmi" durchgegangen, und „Şey" gar nicht erst gefunden worden. */
    check('Und er faengt die angeklebte Endung — mit `\\b` waeren fuenf Treffer durchgegangen',
      TR_FORBIDDEN[0][0].test('haptan') && TR_FORBIDDEN[2][0].test('sabit resmi') &&
      TR_FORBIDDEN[3][0].test('Şey, tekil') && !/\bŞey\b/.test('Şey, tekil'),
      'der Stammleser liest wie ein Wortleser');
    /* UND ER FAERBT SICH NICHT AM HARMLOSEN WORT. „hap" steckt in keinem
       tuerkischen Alltagswort dieser Datei, „Çalışma" schon -- als Nomen
       („Arbeit") waere es erlaubt; verboten ist der LAUF als Satzgegenstand,
       also das Wort mit einem Verb dahinter. Dieselbe Sorgfalt wie beim
       Platzhalter: ein Waechter, der Richtiges meldet, wird abgeschaltet. */
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
       `„…“` GIBT ES IN DER TUERKISCHEN TYPOGRAFIE NICHT. 0.31.0 hat das Paar
       in `tr.json` ausdruecklich nur GESCHLOSSEN und die Frage vertagt; diese
       Runde entscheidet sie (Auftrag, F3) und stellt 68 Schluessel um.
       DREI ZEILEN UND NICHT EINE: kein deutsches Zeichen mehr, kein gerader
       Ersatz (`"` waere die billige Loesung und im Fliesstext falsch), und
       PAARWEISE geschlossen. Die dritte ist die, die 0.25.4 an
       `entry.tagQuote` teuer gelernt hat: am Bildschirm stand „Tag „Werkzeug". */
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
    /* UND ES GIBT SIE UEBERHAUPT. Ohne diese Zeile waeren die drei darueber
       auch dann gruen, wenn jemand alle Anfuehrungszeichen der Datei loeschte
       (Stolperstein 81). */
    const TR_QUOTED = 60;
    const tgQuoted = tgPairs.filter(([, , , tr]) => /“/.test(tr));
    check(`Und die Datei traegt wirklich tuerkische Paare — mehr als ${TR_QUOTED}`,
      tgQuoted.length > TR_QUOTED, `${tgQuoted.length} Formen mit „“…”"`);

    /* ---- Zusage 6: kein tuerkischer Wert ist deutlich laenger -----------
       DIESELBE DECKE WIE BEI ENGLISCH (Auftrag, F8): ab vierzig Zeichen
       hoechstens 1,15x. Tuerkisch spart durch seine Endungen und zahlt bei
       Hoeflichkeitsformen; 90,7 % im Ganzen zeigt, dass die Decke haelt.
       VIERUNDVIERZIG WERTE LAGEN VOR DER RUNDE DARUEBER, `card.vocabularyResetHint`
       mit 2,84x an der Spitze -- es zaehlte alle vierzehn Vokabelwoerter auf,
       wo der deutsche Satz „Alle Wörter dieser Karte" sagt. */
    const TR_LONG_FROM = 40, TR_LONG_MAX = 1.15;
    const tgTooLong = tgPairs
      .filter(([, , de, tr]) => de.length >= TR_LONG_FROM && tr.length > de.length * TR_LONG_MAX)
      .map(([n, , de, tr]) => `${n} ${(tr.length / de.length).toFixed(2)}x (de ${de.length} tr ${tr.length})`);
    check(`Zusage 6: kein tuerkischer Wert ab ${TR_LONG_FROM} Zeichen ist mehr als ${TR_LONG_MAX}x so lang wie sein deutscher`,
      tgTooLong.length === 0, tgTooLong.slice(0, 8).join(' · ') || 'keiner');

    /* ---- Zusage 7: nicht mehr Saetze als der deutsche -----------------
       SECHS TUERKISCHE WERTE TRUGEN MEHR SAETZE als ihr deutscher, und es
       waren genau die sechs, die auf Englisch auch zu viele hatten.
       DIE ABKUERZUNGEN FALLEN VORHER HERAUS, und die TUERKISCHEN GEHOEREN
       DAZU: „örn." (zum Beispiel) und „vb." (und so weiter) zaehlten sonst als
       Satzende. UND WIEDER OHNE `\b`: „örn." beginnt mit einem ö, und dort ist
       fuer JavaScript keine Wortgrenze -- derselbe Fehlgriff wie bei der
       Verbotsliste, an derselben Stelle gelernt. */
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
       DIE LETZTE DER DREI. 0.31.1 hat sie auf Deutsch genommen, 0.31.2 auf
       Englisch, und beide Male war es dieselbe Stelle: `card.nameFreedHint`
       schrieb „&lt;numara&gt;" nach. Der Grund ist derselbe: eine Entitaet in
       einem Wert verlangt vom Uebersetzer, Maskierung zu kennen. */
    const tgEntity = tgPairs.filter(([, , , tr]) => /&[a-z]+;|&#\d+;/i.test(tr));
    check('Zusage 8: kein tuerkischer Wert traegt eine HTML-Entitaet',
      tgEntity.length === 0, tgEntity.map(([n]) => n).join(' ') || 'keiner');

    /* ---- Zusage 9: die fuenf Vokabelmehrzahlen tragen DASSELBE Wort ----
       HIER STEHT DIE ZUSAGE UMGEKEHRT, WIE DER AUFTRAG SIE VORGESCHLAGEN HAT,
       und der Grund ist gemessen und nicht gemeint.
       DER AUFTRAG (BA 6, Zusage 9) wollte den fuenf Mehrzahlwoertern ihr
       -ler/-lar geben, weil die Vorlage es als „fatalen Plural-Bug" fuehrt.
       DAS WAERE DER FEHLER GEWESEN, und zwar dreifach:
         ERSTENS bricht es Leitplanke L7 DESSELBEN Auftrags -- nach einer Zahl
         bleibt im Tuerkischen die Einzahl.
         ZWEITENS nimmt es eine Entscheidung des Betreibers vom 8. September
         2026 zurueck (Woerterbuch TR-S4), und die ist „abgelehnt, nicht
         vertagt" (Fehler und Ideen, Punkt 19).
         DRITTENS steht sie seit 0.24.4 als Waechter im Pruefstand („T2: die
         fuenf Vokabelpaare tragen auf Tuerkisch dasselbe Wort").
       WAS DIE VORLAGE NICHT SEHEN KONNTE, UND DIESE ZEILE MISST ES: das
       Vokabelwort hat je EINEN Mehrzahlplatz, und der Code stellt ihm an
       achtzehn Stellen eine ZAHL voran (`${n} ${vThing(n)}`), die Sprachdatei
       an weiteren sechs (`{length} {thing}`). Vierundzwanzig Stellen lesen
       also „3 Öğeler", sobald jemand die Vorlage befolgt.
       DIE ZAHL STEHT HIER UND WIRD NACHGERECHNET. Waere sie null, waere die
       Begruendung der Vorlage richtig und diese Zusage falsch. */
    /* ================= 0.31.4 HAT DIESE ZUSAGE UMGEDREHT =================
       SIE STAND HIER: „die fuenf Vokabelpaare tragen auf Tuerkisch DASSELBE
       Wort" -- und sie war richtig, solange EIN Platz ZWEI Stellungen tragen
       musste. Die Messung darunter ist der Grund dafuer gewesen.
       DER BETREIBER HAT DEN ZIELKONFLIKT AM 13. SEPTEMBER 2026 AUFGELOEST,
       nachdem diese Runde ihm Punkt 32 mit drei Wegen vorgelegt hatte: „an den
       Stellen wo eine Zahl steht das Wort fuer Einzahl, fuer die anderen das
       Mehrzahlige -- und dort trage ich dann z. B. Öğeler ein."
       SEIT 0.31.4 NIMMT `counted()` HINTER EINER ZAHL IMMER DIE EINZAHL, und
       die Auskunft dafuer steht in der Sprachdatei (`_afterNumber`). Damit
       kostet die Mehrzahl nichts mehr, und die Paare duerfen -- muessen --
       verschieden sein.
       DIE MESSUNG DARUNTER BLEIBT STEHEN, und das ist kein Versehen: sie war
       der Beweis, dass es den Zielkonflikt GIBT. Er ist nicht verschwunden, er
       ist geloest -- und wer `counted()` wieder durch `plural()` ersetzte,
       braechte ihn zurueck. Die Zahl haelt fest, wie gross er ist. */
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

    /* ---- Zusage 10: keine Mehrzahl hinter einer Zahl ------------------
       DIE GEGENLEITPLANKE ZUR VORLAGE (L7), und sie gilt fuer BEIDE Formen
       jedes Paares: „{n} dosya" und nie „{n} dosyalar". Gemessen war sie vor
       der Runde schon gruen -- kein einziger Wert schrieb „{n} …-ler" --, und
       genau deshalb steht sie hier: 28 Mehrzahlpaare tragen in beiden Formen
       denselben Satz, und das ist korrektes Tuerkisch und kein Bug. Wer sie
       „reparierte", baute den Fehler ein.
       DERSELBE LESER WIE IN 0.24.4, und die Zeichenklasse nennt die
       tuerkischen Buchstaben ausdruecklich -- `\\w` kennt sie nicht. */
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
       gefunden hat und die KEIN Blick in die Sprachdatei findet.
       `countWord(n, einzahl, mehrzahl)` setzt im QUELLTEXT eine Zahl vor ein
       Wort, das aus ZWEI Schluesseln kommt: `${n} ${plural(n, a, b)}`. In der
       Datei steht damit nirgends „{n} …lar" -- am Bildschirm aber sehr wohl:
       bei drei Kommentaren „3 yorumlar", bei drei Dateien „3 dosyalar".
       FUENF PAARE SIND BETROFFEN, ELF STELLEN. Das sechste Paar, das dort
       gelesen wird, ist ein VOKABELPAAR (`ratingOne`/`ratingMany`) -- und es
       ist richtig, weil die Entscheidung des Betreibers vom 8. September 2026
       genau dort schon gegriffen hat. Die fuenf hier sind nie nachgezogen
       worden.
       WARUM 0.31.3 SIE NICHT GEAENDERT HAT: dieselben fuenf Schluessel stehen
       als BLOCKUEBERSCHRIFT ueber ihren Listen („YORUMLAR", „DOSYALAR",
       „BAĞLANTILAR"), und dort ist die Mehrzahl richtig. Es war derselbe
       Zielkonflikt wie bei den Vokabelwoertern, und den hat der Betreiber
       entschieden und nicht der Uebersetzer.
       UND SEIT 0.31.4 IST ER GELOEST: `counted()` nimmt hinter einer Zahl die
       Einzahl, und beide Stellen lesen richtig -- „3 yorum" im Satz,
       „YORUMLAR" ueber der Liste. Die Zahl unten haelt fest, wie gross der
       Konflikt war; wer `counted()` wieder durch `plural()` ersetzte, braechte
       ihn zurueck.
       GEZAEHLT WIRD ER TROTZDEM, UND ZWAR HIER: eine Zahl, die niemand
       nachrechnet, verschwindet. Wird eines der fuenf Paare nachgezogen, faellt
       diese Zeile auf -- und wer ein SECHSTES Paar hinzufuegt, faellt auch auf. */
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
    /* UND DAS VOKABELPAAR AN DERSELBEN STELLE IST RICHTIG. Diese Zeile ist der
       Beleg dafuer, dass die Entscheidung von 0.24.4 greift, wo sie gilt --
       und dass die fuenf oben wirklich eine Luecke sind und keine zweite
       Meinung. */
    /* BIS 0.31.3 STAND HIER: „das Vokabelpaar an derselben Stelle ist richtig,
       weil beide Formen dasselbe Wort tragen." Das war der Beleg dafuer, dass
       die fuenf Paare oben eine Luecke sind und keine zweite Meinung.
       SEIT 0.31.4 IST DER BELEG EIN ANDERER, und er ist staerker: das
       Vokabelpaar traegt jetzt ZWEI Woerter, und die Stelle liest trotzdem
       richtig -- weil `counted()` dort die Einzahl nimmt. Genau das ist der
       Mechanismus, den die fuenf Paare oben mitbenutzen. */
    check('Und das Vokabelpaar an derselben Stelle traegt zwei Woerter — `counted()` nimmt dort die Einzahl',
      tgFiles.tr['vocabulary.ratingOne'] !== tgFiles.tr['vocabulary.ratingMany'] &&
      /counted\(n, V\.ratingOne, V\.ratingMany\)/.test(tgApp),
      `${tgFiles.tr['vocabulary.ratingOne']} / ${tgFiles.tr['vocabulary.ratingMany']}`);
    /* UND DIE GROSSSCHREIBUNG IST NACHGEZOGEN -- der eine Handgriff, der keinen
       Zielkonflikt hat: `dialog.links` stand als „Bağlantılar" da, waehrend
       `dialog.files` und `dialog.comments` klein geschrieben sind. Am
       Bildschirm las sich das als „3 Bağlantılar" mitten im Satz; die
       Blockueberschrift macht das Stilblatt ohnehin gross (TR-S1). */
    check('Und die drei Mehrzahlwoerter der Bloecke sind gleich geschrieben — klein',
      ['dialog.links', 'dialog.files', 'dialog.comments']
        .every(k => /^[a-zçğıöşü]/.test(String(tgFiles.tr[k]))),
      ['dialog.links', 'dialog.files', 'dialog.comments']
        .map(k => `${k}: ${tgFiles.tr[k]}`).join(' · '));

    /* ---- Zusage 11: die Anrede ist durchgehend dieselbe ---------------
       sen UND NICHT siz (Auftrag, F4). Das Deutsche duzt in 44 Werten, und die
       tuerkische Datei folgte ihm in 78 -- bis auf GENAU EINEN:
       `card.emailsDoubledHint` sagte „değiştirin ya da boşaltın". Eine
       Oberflaeche, die zwischen vertraut und hoeflich wechselt, liest sich wie
       zwei Programme.
       GESUCHT WIRD DIE HOEFLICHE BEFEHLSFORM und nicht „siz" als Wort: die
       Endung -in/-ın/-un/-ün an einem Verb ist das Zeichen, und sie ist es
       auch mit dem angehaengten -iz. NAMENTLICH UND NICHT ALLGEMEIN: dieselbe
       Endung traegt der Genitiv jedes Substantivs („dosyanın"), und ein
       Waechter, der „dosyanın" meldet, ist nach einem Tag abgeschaltet.
       SIEBENUNDZWANZIG VERBEN, UND DIE LISTE IST AN DER DATEI GEMESSEN: jedes
       einzelne ist gegen alle 1197 Werte gehalten worden, und keines meldet
       einen richtigen Satz. `yap`, `et`, `ver`, `bul` und `iste` stehen dabei,
       weil sie die haeufigsten Verben einer Oberflaeche sind -- ein Waechter,
       der „yapınız" nicht faende, waere die halbe Wache.
       `verme` STEHT VOR `ver`, und das ist die Form der Vorlage: „vermeyiniz".
       UND DIE VIER BRIEFE GEHEN DEN DRITTEN WEG (F5): sie reden niemanden an.
       Die Vorlage schlug „Bu iletiye yanıt vermeyiniz" vor -- das ist siz und
       braeche diese Zusage; das Deutsche sagt „Antworten darauf liest
       niemand", also sagt das Tuerkische „yanıtlar okunmaz". */
    const TR_POLITE_VERBS = ['değiştir', 'boşalt', 'gir', 'yanıtla', 'kullan', 'tıkla',
      'seç', 'aç', 'kapat', 'yaz', 'oku', 'bekle', 'dene', 'kaydet', 'sil', 'ekle',
      'ayarla', 'gönder', 'verme', 'ver', 'yükle', 'kopyala', 'başlat', 'yap', 'et',
      'bul', 'iste'];
    /* DAS PUFFER-`y` GEHOERT DAZU, und es ist an dieser Zeile gelernt: die
       tuerkische Grammatik schiebt zwischen Vokal und Endung ein `y` ein --
       „vermeyiniz" ist `verme` + **y** + `iniz`, nicht `verme` + `iniz`. Der
       erste Entwurf ohne das `y` fand die Form der VORLAGE nicht, und genau
       die ist der Grund fuer F5. Der Pruefstand hat es im ersten Lauf
       gemeldet, an der eigenen Selbstprobe. */
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
       in `de.json`, und keine dieser Stellen wird eine Hoeflichkeitsfloskel.
       Die Zeile war vor dieser Runde schon gruen und steht hier, damit sie es
       bleibt: diese Runde schreibt 151 Formen neu, und `lütfen` ist der Griff,
       zu dem ein Uebersetzer bei „Bitte" zuerst greift. */
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
    /* UND SIE SCHLIESSEN UNPERSOENLICH (F5). Die Zeile steht namentlich da,
       weil sie die Entscheidung IST: nicht „vermeyiniz" (siz, braeche Zusage
       11) und nicht „kimse okumaz" (Kneipenton, Zusage 4), sondern das
       Passiv. */
    const TR_LETTER_END = 'Bu ileti otomatik olarak gönderilmiştir; yanıtlar okunmaz.';
    const tgEnd = TR_LETTERS_KEYS.filter(k => !String(tgFiles.tr[k]).endsWith(TR_LETTER_END));
    check('Und jeder der vier Briefe schliesst unpersoenlich — F5',
      tgEnd.length === 0, tgEnd.join(' ') || 'alle vier');

    /* ---- Zusage 13: der tuerkische Stand liegt als Vergleichsdatei daneben
       DIESELBE BAUFORM WIE FUER ENGLISCH IN 0.31.2 (Auftrag, F10). Fuer
       Deutsch gibt es eine Abnahme (0681d42), fuer Englisch den
       Vergleichsstand von 0.31.2 -- fuer Tuerkisch ist DIESE Runde die
       Abnahme. Was sie hinterlaesst, sind 1197 Schluessel mit ihrem Wert.
       UND DIE TAFEL DARUNTER IST DER EIGENTLICHE WAECHTER. Sie ist LEER, und
       solange sie das ist, muss jeder tuerkische Wert Zeichen fuer Zeichen der
       dieser Runde sein. Einen Vergleichsstand still nachzuziehen ist damit
       ein roter Punkt. */
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
    /* DER VERGLEICHSSTAND WAECHST NICHT MIT. Er haelt den Stand von 0.31.3
       fest; was seitdem dazugekommen ist, steht NAMENTLICH in der Tafel
       darunter -- und `_afterNumber` ist der einzige NEUE Schluessel. */
    /* UND ACHTZEHN MIT 0.32.0, Schluessel fuer Schluessel dieselben wie auf der
       englischen Seite -- L5 verlangt es: kein neuer Schluessel ohne alle drei
       Sprachen, und die Deckungsprobe faerbte den Lauf sofort rot. */
    /* UND EINER MIT 0.33.0 -- derselbe wie drueben: `server.exportTooOld`. L6
       verlangt es: kein Schluessel faellt und keiner kommt nur in einer
       Sprache. */
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
       Schluessel mit seinem Grund hinein."
       VIERZEHN EINTRAEGE MIT 0.31.4, UND SIE ERZAEHLEN JENE RUNDE: fuenf
       Vokabelmehrzahlen bekommen ihr -ler/-lar (der Betreiber, 13.9.2026),
       fuenf Saetze waehlen die Einzahlform, weil ihre Grammatik sie verlangt,
       drei Kruecken aus 0.31.3 fallen weg, und `_afterNumber` ist der
       Mechanismus selbst.
       SIEBENUNDVIERZIG MIT 0.32.0 -- dreiunddreissig mehr, und `list.newCommentsHint`
       wechselt seinen Grund: der Satz des Glockenfensters wird ersetzt (F4),
       also steht dort jetzt die neue Runde. DIE ZAHL WAECHST UND WIRD NICHT
       GELOESCHT (Stolperstein 74): wer sie still mitlaufen liesse, saehe nicht
       mehr, welche Runde welchen tuerkischen Wert angefasst hat. */
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
         englischen Seite und aus denselben Gruenden. Die Tafel traegt sie
         alphabetisch wie die Datei; die Zeile darunter vergleicht sortiert. */
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
         `list.byHandHint`. Alle vier gehoerten der Filterableitung, und die
         ist mit 0.32.1 ausgebaut -- ein Eintrag, der auf einen Schluessel
         zeigt, den es nicht mehr gibt, ist eine Karteileiche.

         UND ACHTZEHN KOMMEN MIT 0.32.1 DAZU. Dreizehn davon sind der
         eigentliche Gegenstand der Runde: TUERKISCH BRAUCHT AM VOKABELWORT
         EINE ENDUNG, und die haengt vom Wort ab, das der Betreiber eintraegt
         -- „Öğe" wird „Öğeyi", „Rapor" wird „Raporu", „Test günü" wird „Test
         gününü". AUSRECHNEN LAESST SIE SICH NICHT: die beste Bibliothek
         (affixi) haengt an jedes vokalendende Wort ein `-n-` und macht aus
         „Öğe" ein „Öğeni" -- richtig nach einem Possessiv, falsch sonst, und
         aus den Buchstaben ist das nicht zu sehen.
         ALSO WIRD DER SATZ SO GEBAUT, DASS DIE ENDUNG AUF EIN FESTES WORT
         FAELLT („{entryOne} kaydını sil"). Das ist die Krücke, die die
         Fachwelt dafuer kennt, und `dialog.deleteAlso` benutzt sie im Haus
         schon seit 0.31.3. */
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
      /* UND EIN FUND DER RUNDE SELBST -- Punkt 31 des Sammelblatts. Der
         berichtigte `yedek`-Waechter hat ihn im ersten Lauf gefunden: „bu
         uygulamanın yedeği değil" traegt die Konsonantenerweichung, und der
         Waechter von 0.25.1 suchte ein `k`. Er stand dreissig Runden lang so
         da -- genau wie der Wert, den 0.31.3 berichtigt hat. */
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

/* =================================================================
   0.31.4 — „Nach einer Zahl die Einzahl, sonst die Mehrzahl"

   DIE RUNDE LOEST EINEN ZIELKONFLIKT AUF, den 0.31.3 gemessen und dem
   Betreiber vorgelegt hat (Fehler und Ideen, Punkt 32). Seine Entscheidung vom
   13. September 2026, im Wortlaut:

     „Dann machen wir das so, dass an den Stellen wo eine Zahl steht das Wort
      fuer Einzahl kommt, fuer die anderen das Mehrzahlige -- und dort trage
      ich dann z. B. Öğeler ein."

   DIE REGEL DAHINTER IST NACHRECHERCHIERT und steht auf vier Beinen: TDK
   („sayı sıfatının peşinden gelen isim çoğul eki almaz"), Göksel & Kerslake
   (Turkish: A Comprehensive Grammar -- Ausnahme nur bei Eigennamen und
   geschlossenen Gruppen), Sağ („Turkish numerals strictly reject co-occurrence
   with plural nouns") und die CLDR-Daten selbst: „1 elma", „123 elma" -- ohne
   Zahl „elmalar".

   UND DARAUS FOLGT, WARUM DER CODE ES NICHT VON ALLEIN WISSEN KANN:
   `Intl.PluralRules('tr').select(n)` waehlt nach dem WERT von n, die
   tuerkische Regel haengt an der STELLUNG. `select(3)` ist `other`, und das
   ist als CLDR-Kategorie richtig -- es heisst im Tuerkischen aber nicht
   „haenge -lar an". DIE AUSKUNFT, DIE DER CODE BRAEUCHTE, SIEHT DIE
   SCHNITTSTELLE NIE.

   ALSO SAGT SIE DIE DATEI: `_afterNumber` neben `_locale` und `_name`. Das ist
   Leitplanke L1 und keine Erfindung dieser Runde -- der Kommentar an
   `plural()` sagt seit 0.24.0: „die Regel gehoert aber der Sprache".
   ================================================================= */
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
       deutsch und englisch nicht negativ auswirken."
       SIE IST DURCH DIE BAUFORM ERFUELLT UND NICHT DURCH SORGFALT: `counted()`
       faellt bei `_afterNumber: plural` auf `plural()` zurueck -- derselbe Ruf,
       dieselben Argumente, dasselbe Ergebnis. Fuer de und en ist die Runde ein
       anderer Weg zu demselben Wort.
       ZWEI ZEILEN HALTEN DAS FEST: dass beide Dateien `plural` sagen (unten,
       Zusage 2) und dass der Rueckfall wirklich `plural(n, one, other)` ist
       (Zusage 7). Fehlte eine, waere die Zusage eine Behauptung.
       UND DIE WERTE SELBST HALTEN ZWEI AELTERE WACHEN: die Wortlautprobe haelt
       `de.json` gegen die Abnahme von 0681d42, der Vergleichsstand
       `tools/englisch-0312.json` haelt alle 1197 englischen Werte Zeichen fuer
       Zeichen. Beide laufen in diesem Lauf mit.
       DIE SECHS SUMMEN DER GLEICHLAUTPROBE SIND TROTZDEM ANDERE, und der Grund
       steht oben bei DE_UNTOUCHED: die Probe liest den ganzen Quelltext, und
       diese Runde baut in `public/app.js`. Am zweiten Gang der Probe
       nachgesehen -- fuer de und en kommen und gehen AUSSCHLIESSLICH
       Quelltextwoerter, kein Bildschirmtext. */
    const anDeEn = ['de', 'en'].filter(c => anFiles[c]._afterNumber !== 'plural');
    check('Zusage 1: fuer Deutsch und Englisch aendert sich nichts — beide sagen `plural`',
      anDeEn.length === 0, anDeEn.join(' ') || 'de und en unveraendert');
    /* UND DIE VOKABELPAARE DORT SIND UNBERUEHRT. Die Runde gibt der
       tuerkischen Mehrzahl ihr -ler; auf Deutsch und Englisch stand sie immer
       schon da, und sie darf sich nicht bewegen. */
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
       UND SIE TRAEGT EINEN DER BEIDEN ERLAUBTEN WERTE. Ein Tippfehler waere
       sonst eine stille Ruecknahme dieser Runde: `AFTER_NUMBER` faellt auf
       `plural`, und niemand saehe es. */
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
    /* UND ER STEHT VORN, BEI SEINESGLEICHEN. `_locale` und `_name` sind die
       beiden anderen Zeilen, die keinen Bildschirmtext tragen; eine dritte
       gehoert dazu und nicht zwischen die Saetze. */
    check('Und er steht bei `_locale` und `_name` und nicht zwischen den Saetzen',
      ['de', 'en', 'tr'].every(c => Object.keys(anFiles[c]).slice(0, 3).sort().join(' ')
        === '_afterNumber _locale _name'),
      ['de', 'en', 'tr'].map(c => Object.keys(anFiles[c]).slice(0, 3).join(',')).join(' · '));

    /* ---- Zusage 3: eine Datei ohne den Schluessel faellt auf `plural` ---
       DAS IST DIE ZEILE FUER DIE VIERTE SPRACHE. 0.24.0 hat versprochen: „wer
       eine weitere hineinlegt, hat nach einem Neustart eine Sprache mehr --
       ohne eine Zeile Programm." Eine Datei, die an einem fehlenden
       `_afterNumber` zerbraeche, naehme dieses Versprechen zurueck.
       GEPRUEFT WIRD DER AUSDRUCK IM QUELLTEXT und nicht eine Behauptung: er
       muss GEGEN `'one'` vergleichen und nicht gegen `'plural'` -- nur dann
       ist die Vorgabe das alte Verhalten. */
    check('Zusage 3: eine Sprachdatei ohne `_afterNumber` faellt auf `plural`',
      /_afterNumber === 'one' \? 'one' : 'plural'/.test(anCode),
      'der Ausdruck im Quelltext vergleicht nicht gegen `one`');
    check('Und die Vorgabe der Variablen ist ebenfalls `plural`',
      /let AFTER_NUMBER = 'plural';/.test(anCode), 'die Vorgabe fehlt oder heisst anders');

    /* ---- Zusage 7: `counted()` liest die DATEI und nicht die Locale -----
       DAS IST LEITPLANKE L1 ALS PRUEFUNG. Eine Liste von Sprachkennungen im
       Code („tr, hu, ja, ko, zh") waere billiger und genau das, was Konzept 4.3
       verbietet: die Regel gehoert der Sprache, und die Sprache steht in ihrer
       Datei. */
    const anBody = (anCode.match(/function counted\(n, one, other\) \{([\s\S]*?)\n\}/) || [])[1] || '';
    check('Zusage 7: counted() gibt es, und sie entscheidet an AFTER_NUMBER',
      /AFTER_NUMBER === 'one' \? one : plural\(n, one, other\)/.test(anBody),
      anBody.trim().slice(0, 120) || 'die Funktion fehlt');
    check('Und sie kennt keine Sprachkennung — die Regel steht in der Datei',
      !/'tr'|"tr"|tr-TR|LOCALE/.test(anBody), anBody.trim().slice(0, 120));

    /* ---- Zusage 5: JEDE Zaehlerstelle geht durch `counted()` -----------
       DER BEWEIS DIESER RUNDE, und er ist in drei Schritten gebaut:
         1. jede Stelle, die eine Zahl und ein Wort NEBENEINANDER setzt, ruft
            `counted()` und nicht `plural()`
         2. `counted()` nimmt bei `_afterNumber: one` die EINZAHLFORM
         3. keine tuerkische Einzahlform endet auf -ler/-lar
       Zusammen: hinter einer Zahl steht am Bildschirm keine Mehrzahl.
       DIE EINE AUSNAHME STEHT NAMENTLICH DA UND IST KEIN NOMEN: in
       `card.aloneOverLimit` waehlt `plural()` zwischen „passt" und „passen" --
       einem VERB. Die Stellungsregel gilt fuer das Nomen hinter der Zahl, und
       im Tuerkischen tragen dort ohnehin beide Formen dasselbe Wort. */
    const AN_COUNTED_CALLS = 8, AN_PLURAL_LEFT = 2;
    const anCounted = (anCode.match(/counted\(/g) || []).length - 1;
    const anPluralLeft = (anCode.match(/[^a-zA-Z]plural\(/g) || []).length - 1;
    check('Zusage 5: acht Stellen rufen counted() — die fuenf Vokabelzaehler, die beiden Zaehlerhelfer und entry.added',
      anCounted === AN_COUNTED_CALLS, `${anCounted} Rufe`);
    check('Und es bleiben genau zwei plural() — der Ruf in counted() selbst und das VERB in card.aloneOverLimit',
      anPluralLeft === AN_PLURAL_LEFT, `${anPluralLeft} Rufe`);
    /* UND KEINE STELLE SETZT EINE ZAHL UND EIN WORT MIT `plural()` NEBENEINANDER.
       Das ist die Zeile, die den naechsten Handgriff faengt: wer eine neue
       Zaehlerstelle baut und dabei zu `plural()` greift, faellt hier auf. */
    /* GESUCHT WIRD EINE ZAHL VOR EINEM WORT und nicht irgendein `plural()` mit
       einer Klammer davor: in `card.aloneOverLimit` steht
       `${n} ${esc(vThing(n))} ${plural(n, passt, passen)}` -- dort waehlt
       `plural()` ein VERB, und davor steht kein Zaehler, sondern das Nomen, das
       `counted()` schon richtig gemacht hat. Der Blick zurueck schliesst die
       fuenf Vokabelhelfer deshalb aus. */
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
       `tr.json` loeschte. Sie ist die Haelfte, die sagt, dass die Runde
       ueberhaupt etwas getan hat. */
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
       AUCH OHNE ZAHL DAVOR. `her` („jedes") und `sayısı` („die Zahl der …")
       verlangen im Tuerkischen die Einzahl -- „her öğeler için" ist falsch.
       Diese fuenf Saetze tragen deshalb `{entryOne}` und nicht `{entryMany}`,
       und ohne diese Zeile faellt der naechste Handgriff dorthin zurueck.
       GEPRUEFT WIRD DIE NACHBARSCHAFT und nicht der Schluesselname: wer den
       Satz umbaut und `her` stehen laesst, faellt weiter auf. */
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
    /* UND DIE FUENF STEHEN NAMENTLICH DA. Die Nachbarschaftsprobe darueber
       faengt den Rueckfall; diese Zeile haelt fest, DASS es die fuenf gibt --
       sonst waere sie auch gruen, wenn jemand alle fuenf Saetze loeschte
       (Stolperstein 81). */
    const AN_SINGULAR_SENTENCES = ['card.blocksHint', 'card.criteriaAdminHint',
      'card.criteriaOrderHint', 'card.orderAppliesNote', 'list.showAll'];
    const anNotOne = AN_SINGULAR_SENTENCES.filter(k => !/\{entryOne\}/.test(String(anFiles.tr[k])));
    check(`Und die fuenf Saetze, die sie verlangen, tragen {entryOne} — ${AN_SINGULAR_SENTENCES.length}`,
      anNotOne.length === 0, anNotOne.join(' ') || 'alle fuenf');

    /* ---- Zusage 10: ein Platz wechselt nur innerhalb SEINES Paares ------
       Die Zusage 3 von 0.31.3 ist dafuer um einen Spalt geoeffnet worden. Diese
       Zeile haelt fest, dass es ein Spalt bleibt: `{entryOne}` fuer
       `{entryMany}` ja, `{entryOne}` fuer `{dayMany}` nicht. */
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
       DIE DREI SCHRITTE OBEN LESEN DEN QUELLTEXT UND DIE DATEI. Die Frage des
       Auftrags war eine andere (F8): „Woran zeigt sich, dass es wirklich
       stimmt? Am gerenderten Bildschirmtext und nicht an der Datei." Genau
       dort stand der Befund, den 0.31.3 gemeldet hat: „3 yorumlar" steht in
       KEINER Datei -- `countWord` setzt Zahl und Wort aus ZWEI Schluesseln
       zusammen, und erst am Bildschirm stehen sie nebeneinander.

       HIER LAEUFT `app.js` WIRKLICH, in einem Fenster mit den echten
       Sprachdateien, und die Zaehlerstellen werden AUSGEFUELLT. Abgeschrieben
       ist allein die FORM „Zahl, Leerzeichen, Wort"; WELCHES Wort dort steht,
       sagt die Datei, und WELCHE Paare gelesen werden, sagt der Quelltext.

       DIE ZAHLEN 0 1 2 3 11 21 100 STEHEN DA, WEIL DER FEHLER AM WERT HAENGT:
       `Intl.PluralRules('tr')` sagt bei 1 `one` und sonst `other`. Waere
       `counted()` doch an den Wert gebunden, fiele die Mehrzahl bei 2, 3, 11,
       21 und 100 heraus und bei 1 nicht -- eine Probe, die nur mit 1 rechnete,
       waere gruen und belegte das Gegenteil.

       GEFRAGT WIRD UEBER `eval` IM FENSTER, und das hat einen Grund: `vThing`
       und `V` stehen auf oberster Ebene als `const` und `let` und liegen damit
       NICHT am window (derselbe Grund, aus dem `waitSearch` die Zaehlzeile
       liest und nicht `w.state`). Das Fenster ist das des Pruefstands und kein
       Nachbau -- `buildDom` laedt `public/app.js` in seinen Zusammenhang. */
    let JSDOMan;
    try { ({ JSDOM: JSDOMan } = require('jsdom')); } catch { JSDOMan = null; }
    check('jsdom steht fuer die Probe am gerenderten Text bereit',
      !!JSDOMan, 'ohne jsdom keine Probe am Bildschirmtext');
    if (JSDOMan) {
      /* DER VOKABELSATZ DES LESERS KOMMT VOM SERVER, und der Mock muss ihn
         mitgeben -- sonst steht die Oberflaeche auf Tuerkisch und traegt
         deutsche Vokabelwoerter. Das ist keine Luecke in `app.js`, sondern
         seine Bauform: `loadLanguages()` holt zuerst die VORGABESPRACHE der
         Installation (im Mock Deutsch), und `V = { ...vocabularyDefault(),
         ...V }` laesst stehen, was schon drinsteht -- „der Satz des Servers
         wiegt schwerer als die Vorgabe". Im Betrieb ueberschreibt ihn
         `/api/settings` mit `vocabulary`, und genau das ist hier nachgebaut.
         ABGELEITET UND NICHT GETIPPT, und zwar Zeichen fuer Zeichen wie
         `vocabulary()` in server.js es tut, wenn nichts eingetragen ist: die
         `vocabulary.`-Schluessel der Sprachdatei des Lesers. Ein hier
         hingeschriebenes Wort waere eine zweite Wahrheit (Stolperstein 47) --
         die Probe soll ja belegen, dass die DATEI am Bildschirm ankommt.
         DASS DIESE ZEILE NOETIG IST, HAT DER ERSTE LAUF GEZEIGT: ohne sie las
         der Bildschirm „Açık Aufgaben", und die Zeile darunter blieb trotzdem
         gruen -- deutsche Mehrzahlen enden nicht auf -ler. Die Selbstprobe hat
         genau das geleistet, wofuer sie dasteht. */
      const anVocabulary = Object.fromEntries(Object.entries(anFiles.tr)
        .filter(([k]) => k.startsWith('vocabulary.'))
        .map(([k, v]) => [k.slice('vocabulary.'.length), v]));
      const anDom = buildDom(JSDOMan,
        { settings: { filters: null, language: 'tr', vocabulary: anVocabulary } });
      const wAn = anDom.w;
      await new Promise(r => setTimeout(r, 120));
      /* GEKLAMMERT WIE JEDER GRIFF IN EIN FREMDES FENSTER: ein Rueckbau, der
         `app.js` zerbricht, soll eine Zusage rot machen und nicht den Lauf
         abreissen -- und der Fehler soll im Befund stehen und nicht im Nichts. */
      const anSay = (expr) => {
        try { return String(wAn.eval(expr)); } catch (e) { return 'FEHLER ' + e.message; }
      };
      /* ZUERST DER GEGENSTAND (Stolperstein 81): steht das Fenster wirklich auf
         Tuerkisch, und hat es `_afterNumber` wirklich gelesen? Ohne diese Zeile
         waere alles darunter auch an einem deutschen Fenster gruen -- dort
         stimmt die Stellungsregel von selbst, weil „3 Einträge" die Mehrzahl
         verlangt und kein -ler traegt. */
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
      /* UND DIE PAARE DER BEIDEN ZAEHLERHELFER -- AUS DEM QUELLTEXT GELESEN und
         nicht hier aufgezaehlt: wer einen weiteren Ruf dazubaut, wird von
         dieser Probe mitgenommen, ohne dass er diese Zeile finden muss. Genau
         daran ist `entry.added` beim Bauen dieser Runde aufgefallen.
         GELESEN WIRD `countWord(` UND NICHT `counted(`: der Helfer bekommt die
         beiden Schluessel, und er gibt sie unter seinen PARAMETERNAMEN an
         `counted()` weiter -- ein Muster auf `counted(` fande dort „n, one,
         more" und nicht die Woerter. Es sind sechs Paare: die fuenf, die 0.31.3
         gemessen hat, und das Vokabelpaar `ratingOne`/`ratingMany`, das an
         derselben Stelle mitgelesen wird. */
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
      /* UND DER GANZE SATZ, DER BEIM BAUEN UEBERSEHEN WORDEN IST: `entry.added`
         setzt „{count} {what} eklendi" -- die Zahl und das Wort stehen dort in
         ZWEI Platzhaltern desselben Satzes, und `counted()` fuellt den zweiten.
         Hier steht er ausgefuellt, wie ihn ein Mensch nach dem Hochladen liest. */
      anSpots.push(['entry.added (Foto)',
        (n) => anSay(`t('entry.added', { count: ${n}, what: counted(${n}, t('list.photo'), t('list.photos')) })`)]);
      anSpots.push(['entry.added (Video)',
        (n) => anSay(`t('entry.added', { count: ${n}, what: counted(${n}, t('list.video'), t('list.videos')) })`)]);
      /* DER LESER: eine Zahl, Weissraum, ein Wort auf -ler/-lar -- auch die
         Verbundform -leri/-ları. `\b` ist fuer Tuerkisch unbrauchbar, weil Ş,
         ş, ğ, ı, ç, ö und ü kein `\w` sind; die Klammer mit `\p{L}` und das
         Kennzeichen `u` sind der Ersatz. */
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
      /* UND DER LESER WUERDE EINE FINDEN. Gefahren an DEMSELBEN Fenster, mit
         DEMSELBEN Wortpaar und derselben Zahl -- nur mit `plural()` statt
         `counted()`. Das ist die Gegenprobe zu Stolperstein 81 und gleichzeitig
         der Beleg, DASS `counted()` der Unterschied ist und nicht die
         Sprachdatei: derselbe Satz, zwei Funktionen, zwei Ergebnisse. */
      const anWould = `3 ${anSay("plural(3, t('dialog.comment'), t('dialog.comments'))")}`;
      const anIs = `3 ${anSay("counted(3, t('dialog.comment'), t('dialog.comments'))")}`;
      check('Und der Leser wuerde eine finden — `plural()` an derselben Stelle faellt auf',
        anScreen.test(anWould) && !anScreen.test(anIs), `${anWould} · ${anIs}`);
      /* DIE GEGENRICHTUNG AM BILDSCHIRM: OHNE Zahl steht die Mehrzahl sehr wohl
         da. Gelesen an den drei Saetzen, die 0.31.4 von ihrer Kruecke befreit
         hat -- „Açık {taskMany} listesi" ist wieder „Açık {taskMany}" --, und
         `t()` setzt das Vokabelwort dabei selbst ein. Sie sind der sichtbare
         Gewinn der Runde; ohne diese Zeile waere sie auch dann gruen, wenn
         jemand alle fuenf Mehrzahlen aus `tr.json` loeschte. */
      const AN_MANY_ON_SCREEN = [['list.openTasks', 'taskMany'],
        ['list.noCategory', 'entryMany'], ['list.newCommentsHint', 'entryMany']];
      const anMissing = AN_MANY_ON_SCREEN.filter(([key, voc]) =>
        !anSay(`t('${key}')`).includes(String(anFiles.tr['vocabulary.' + voc])));
      check('Zusage 6, am gerenderten Text: ohne Zahl steht die Mehrzahl da — „Açık Görevler"',
        anMissing.length === 0,
        AN_MANY_ON_SCREEN.map(([k]) => `${k}: ${anSay(`t('${k}')`)}`).join(' · '));
      /* UND DIE KRUECKE IST WIRKLICH WEG. Das angehaengte „listesi" war der
         Handgriff von 0.31.3; er steht namentlich hier, damit ihn niemand beim
         naechsten Mal als Loesung wiederfindet. */
      check('Und das angehaengte „listesi" steht nicht mehr hinter dem Vokabelwort',
        !/listesi/.test(anSay("t('list.openTasks')")) &&
        !/listesi/.test(anSay("t('list.noCategory')")),
        `${anSay("t('list.openTasks')")} · ${anSay("t('list.noCategory')")}`);
      /* ---- Zusage 5, FUENFTER SCHRITT: die Vorschau der Vokabelkarte ------
         DER AUGENSCHEIN DIESER RUNDE HAT SIE GEFUNDEN, und die vier Schritte
         darueber konnten es nicht: in `drawPreview()` stand die Zahl als
         STRING unmittelbar vor der Mehrzahlform -- „7 ${sm}", „3 ${zm}",
         „2 ${bm}", „4 ${at}", „2 ${rateMany}". Kein `plural()`, kein
         `counted()`, kein Vokabelzaehler: nichts, wonach ein Muster gesucht
         haette.
         AM BILDSCHIRM LAS SICH DAS ALS „7 Öğeler" -- eine Stelle, die es auf
         Tuerkisch seit dieser Runde nicht mehr gibt. Die Karte, in die der
         Eigentuemer seine Woerter eintraegt, lehrte damit das GEGENTEIL der
         Regel, die die Runde gebaut hat.
         GEFRAGT WIRD DIE GEZEIGTE SPRACHE UND NICHT DIE DES LESERS, und das
         ist der Kern dieser Zusage: die Karte pflegt die Woerter der Sprache,
         die der Eigentuemer gerade zeigt. Ein Blick auf `AFTER_NUMBER` haette
         ausgerechnet SEINEN Fall verfehlt -- er liest Deutsch und traegt
         Tuerkisch ein. Der Server schickt die Regel je Sprache in der
         Sprachtafel mit; `afterNumberOf()` liest sie dort.
         UND DEUTSCH BEHAELT SEINE ZAHL. Die Forderung des Betreibers war
         „das darf sich bei deutsch und englisch nicht negativ auswirken" --
         eine Vorschau, die auf Deutsch ihr „7 Einträge" verloere, waere genau
         das. Der erste Bau dieser Berichtigung hat die Zahl unbedingt
         gestrichen, und der zweite Gang der Gleichlautprobe hat es gemeldet.
         GELESEN WIRD, WELCHE ORTSNAMEN EINE MEHRZAHL TRAGEN, und zwar an
         ihrer Zuweisung und nicht an ihrer Schreibung: `const sm =
         w.entryMany.trim() || e.entryMany` bindet `sm` an ein `...Many`-Feld.
         Wer die Namen umbenennt, wird davon mitgenommen; wer ein sechstes
         Mehrzahlfeld hinzufuegt, auch. */
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
      /* UND JEDE DER FUENF GEHT DURCH `many()`. Ohne diese Zeile waere die
         darueber auch dann gruen, wenn jemand die fuenf Mehrzahlstellen ganz
         aus der Vorschau naehme (Stolperstein 81). */
      const anThroughMany = new Set([...anPreview.matchAll(/\$\{many\(\d+, (\w+)\)\}/g)]
        .map(m => m[1]).filter(v => anManyVars.has(v)));
      check('Und jede der fuenf geht durch `many()` — mit ihrer Zahl als Argument',
        anThroughMany.size === anManyVars.size,
        `${anThroughMany.size} von ${anManyVars.size}: ${[...anThroughMany].join(' ')}`);
      /* UND `many()` FRAGT DIE GEZEIGTE SPRACHE. Das ist die Zeile, die den
         feinen Rueckfall faengt: `AFTER_NUMBER` statt `afterNumberOf()` sieht
         richtig aus, tut fuer einen tuerkischen LESER sogar dasselbe -- und
         bringt fuer den deutschen Leser, der Tuerkisch pflegt, „7 Öğeler"
         zurueck. */
      const anManyBody = (anPreview.match(/const many = \(n, word\) =>[\s\S]*?;/) || [''])[0];
      check('Und `many()` fragt die GEZEIGTE Sprache und nicht die des Lesers',
        /afterNumberOf\(namesLanguage\(\)\) === 'one'/.test(anManyBody) &&
        !/AFTER_NUMBER/.test(anManyBody),
        anManyBody.replace(/\s+/g, ' ').slice(0, 140) || 'die Funktion fehlt');
      /* UND DIE EINZAHL BEHAELT IHRE ZAHL. Ohne diese Zeile waere die Vorschau
         auch dann gruen, wenn jemand alle Zahlen daraus entfernte -- und
         „1 Test günü" ist in jeder Sprache richtig. */
      check('Und die Einzahl steht weiter MIT Zahl da — „1 Test günü"',
        /1 \$\{esc\(z1\)\}/.test(anPreview), 'die Einzahlstelle der Vorschau fehlt');
      /* UND DER LESER WUERDE EINEN RUECKFALL FINDEN (Stolperstein 81). */
      const anPreviewProbe = (text, many) =>
        [...text.matchAll(/(\d+)\s+\$\{esc\((\w+)\)\}/g)].filter(m => many.has(m[2])).length;
      check('Und der Leser wuerde einen finden — und die Einzahlstelle laesst er stehen',
        anPreviewProbe('<span>7 ${esc(sm)}</span>', new Set(['sm'])) === 1 &&
        anPreviewProbe('<span>1 ${esc(z1)}</span>', new Set(['sm'])) === 0,
        'der Leser trennt Einzahl und Mehrzahl in der Vorschau nicht');
      /* ---- Zusage 7, ZWEITE HAELFTE: der Server schickt die Regel je Sprache
         DIE REGEL GEHOERT DER SPRACHE (L1), und die Karte braucht sie fuer eine
         FREMDE Sprache. Also steht sie in der Sprachtafel des Servers, neben
         Name, Vorgabe und Vorrat -- abgeleitet aus `_afterNumber` der Datei und
         nicht aus einer Liste im Quelltext. Gefahren am laufenden Server und
         nicht am Muster: was die Karte bekommt, entscheidet er. */
      const anTable = ((await call('GET', '/api/settings')).content || {}).languages || [];
      const anRule = Object.fromEntries(anTable.map(a => [a.code, a.afterNumber]));
      const anRuleWrong = Object.entries(TR_AFTER_NUMBER).filter(([c, v]) => anRule[c] !== v);
      check('Zusage 7, zweite Haelfte: die Sprachtafel des Servers nennt je Sprache ihre Stellungsregel',
        anTable.length >= 3 && anRuleWrong.length === 0,
        JSON.stringify(anRule));
      /* UND SIE KENNT NUR DIE BEIDEN WERTE. Eine dritte Antwort waere eine
         Auskunft, die der Browser nicht lesen kann -- und er faellt dann still
         auf `plural`. */
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
