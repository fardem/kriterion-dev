#!/usr/bin/env node
/* Der Gegenprobentreiber.
 *
 *   node gegenprobe.js            alle Rueckbauten, zwei Nebenspuren
 *   node gegenprobe.js 4          alle Rueckbauten, vier Nebenspuren
 *   node gegenprobe.js 2 W2 W3    nur die Rueckbauten, deren Nummer oder Name
 *                                 auf eines der Woerter passt
 *
 * WOZU. Eine Pruefung, die gruen ist, belegt nichts, solange niemand gezeigt
 * hat, dass sie auch rot werden kann. Die Gegenprobe baut die gepruefte Sache
 * probeweise zurueck und haelt fest, WELCHE Pruefungen daraufhin namentlich rot
 * werden. EIN RUECKBAU, DER KEINE EINZIGE PRUEFUNG ROT MACHT, IST EIN FUND --
 * nicht ein Erfolg. In 0.8.90 waren zwei davon dabei, und beide haben eine
 * Luecke im Pruefstand aufgedeckt.
 *
 * WARUM ER NICHT IN npm test STEHT. Er faehrt den vollen Prueflauf je Rueckbau
 * und dauert damit ein Vielfaches davon. Er gehoert an das Ende einer Runde und
 * nicht an jeden Lauf; der Pruefstand kennt ihn deshalb nicht.
 *
 * DIE KOPIE ENTSTEHT UEBER git archive HEAD UND NICHT UEBER cp. Sie ist damit
 * atomar gegen den Arbeitsbaum: wer waehrend eines Laufs weiterarbeitet, bekommt
 * trotzdem den Stand, der im Kopf des Zweiges steht (Stolperstein 100). Der
 * Arbeitsbaum selbst wird NIE angefasst.
 *
 * AUFGERAEUMT WIRD UEBER /proc/<pid>/cwd UND NICHT UEBER DIE BEFEHLSZEILE. Ein
 * mit cwd gestarteter Kindprozess traegt den Pfad dort gar nicht -- in der
 * Befehlszeile steht nur "node server.js". pkill -f <Kopierpfad> trifft deshalb
 * nie, und kill -- -$! trifft auch daneben, weil setsid eine neue
 * Prozessgruppe anlegt. In 0.8.90 haben sich so 48 verwaiste Server
 * angesammelt und acht Gegenproben abreissen lassen (Stolperstein 133).
 * Nach dem Aufraeumen wird NACHGESEHEN, ob wirklich keiner ueberlebt hat.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

/* ================= Die Rueckbauten =================
   DIE LISTE IST DIE ENTSCHEIDUNG, und sie steht deshalb hier oben und nicht in
   einer Datei daneben -- dieselbe Bauform wie F_ROUTEN im Pruefstand: man sucht
   sie dort, wo sie steht.

   Ein Eintrag traegt fuenf Angaben:
     nr      die Nummer in der Tabelle
     name    was zurueckgebaut wird, in einem Satz
     datei   welche Datei angefasst wird
     suche   der Text, der ersetzt wird. Er muss GENAU EINMAL vorkommen --
             kommt er keinmal oder mehrfach vor, bricht der Rueckbau ab und
             wird als solcher gemeldet. Ein Rueckbau, der ins Leere greift,
             saehe sonst aus wie einer, der nichts bewirkt.
     ersatz  wodurch er ersetzt wird
     erwartet  die Prueffgruppe, in der die roten Punkte erwartet werden. Sie
             ist eine NOTIZ und keine Bedingung: gemeldet wird, was wirklich
             rot wurde, und wenn das eine andere Gruppe ist, steht das da. */
const RUECKBAUTEN = [
  /* ---- Der Versand: das Offline-Prinzip ---- */
  {
    nr: '01', name: 'Der Token entsteht erst NACH dem Versand',
    datei: 'server.js',
    suche: "    const v = await versendeTokenLink(ziel, t);",
    ersatz: "    const v = await versendeTokenLink(ziel, t); if (v.versand !== 'ok') throw new Error('Versand fehlgeschlagen');",
    erwartet: 'Der Mailversand: das Offline-Prinzip in beide Richtungen'
  },
  {
    nr: '02', name: 'Der Link faellt aus der Antwort, wenn der Versand traegt',
    datei: 'server.js',
    suche: "               ohnePasswort: t.ohnePasswort,\n               ...linkAngabe(t.klartext), ...v });",
    ersatz: "               ohnePasswort: t.ohnePasswort,\n               ...(v.versand === 'ok' ? { link: null, linkQuelle: 'browser' } : linkAngabe(t.klartext)), ...v });",
    erwartet: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '03', name: 'Das Feld versand faellt ganz weg',
    datei: 'server.js',
    suche: "  return e.ok ? { versand: 'ok', versandGrund: '' }",
    ersatz: "  return e.ok ? {}",
    erwartet: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '04', name: 'Der Grund faellt weg -- "aus" steht ohne Auskunft da',
    datei: 'server.js',
    suche: "    return { versand: 'aus', versandGrund: 'Es ist kein Mailzugang eingerichtet.' };",
    ersatz: "    return { versand: 'aus' };",
    erwartet: 'Der Mailversand: das Offline-Prinzip in beide Richtungen'
  },
  /* ---- Der Versand: die Frist ---- */
  {
    nr: '05', name: 'Die aeussere Schranke ueber dem Versand faellt weg',
    datei: 'mail.js',
    /* DER RUECKBAU MACHT DIE FRIST WIRKUNGSLOS, ER ENTFERNT SIE NICHT AUS DEM
       WETTLAUF. Zwei Anlaeufe davor waren falsch, und der zweite lehrreich:
       `frist` aus dem Promise.race zu streichen laesst die Zusage zwar fallen,
       aber die Zusage wirft danach UNBEHANDELT -- der Server stirbt, und der
       Lauf reisst ab, statt eine Pruefung rot zu faerben (Stolperstein 138).
       So bleibt alles stehen, und nur die Wirkung faellt weg. */
    suche: "      uhr = setTimeout(() => fehler(new Error('Der Mailserver hat nicht rechtzeitig geantwortet.')),",
    ersatz: "      uhr = setTimeout(() => {},",
    erwartet: 'Der Mailversand: die Frist wird gemessen, nicht behauptet'
  },
  {
    nr: '06', name: 'Die Fristen von nodemailer stehen wieder auf ihren Vorgaben',
    datei: 'mail.js',
    suche: "    connectionTimeout: VERBINDUNG_MS, greetingTimeout: GRUSS_MS, socketTimeout: VERSAND_MS,",
    ersatz: "",
    erwartet: '(erwartet STUMM — die aeussere Schranke traegt die Zusage allein; nodemailers Fristen sind der schnellere, nicht der tragende Weg)'
  },
  /* ---- Der Versand: die oeffentliche Adresse ---- */
  {
    nr: '07', name: 'Ohne oeffentliche Adresse wird trotzdem verschickt',
    datei: 'server.js',
    suche: "  if (!OEFFENTLICHE.adresse)",
    ersatz: "  if (false)",
    erwartet: 'Der Mailversand: die oeffentliche Adresse ist Pflicht'
  },
  {
    nr: '08', name: 'Die Adresse wird aus dem Host-Kopf abgeleitet',
    datei: 'server.js',
    suche: "    username: ziel.username, link: `${OEFFENTLICHE.adresse}/#/einladung/${t.klartext}`,",
    ersatz: "    username: ziel.username, link: `https://${'HOSTKOPF'}/#/einladung/${t.klartext}`,",
    erwartet: 'Der Mailversand: die oeffentliche Adresse ist Pflicht'
  },
  /* ---- Der Versand: der Empfaenger am Zugang ---- */
  {
    nr: '09', name: 'Ein Zugang ohne Adresse wird trotzdem beschickt',
    datei: 'server.js',
    suche: "  if (!ziel.email)",
    ersatz: "  if (false)",
    erwartet: 'Der Versandzustand neben dem Link'
  },
  {
    nr: '10', name: 'Die Adresse laesst sich beim Anlegen nicht mehr mitgeben',
    datei: 'auth.js',
    suche: "    .run(sauber, hash, rolle, mailAdresse || null);",
    ersatz: "    .run(sauber, hash, rolle, null);",
    erwartet: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '11', name: 'Die eigene Adresse laesst sich nicht mehr setzen',
    datei: 'auth.js',
    suche: "    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(adresse || null, u.id);",
    ersatz: "    db.prepare('UPDATE users SET email = email WHERE id = ?').run(u.id);",
    erwartet: 'Der Mailversand: die Testmail geht an die eigene Adresse'
  },
  /* ---- Die Testmail ---- */
  {
    nr: '12', name: 'Die Testmail nimmt die Adresse aus dem Rumpf',
    datei: 'server.js',
    suche: "  const eigener = auth.holeZugang(req.benutzer.id);",
    ersatz: "  const eigener = { ...auth.holeZugang(req.benutzer.id), email: (req.body || {}).an || auth.holeZugang(req.benutzer.id)?.email };",
    erwartet: 'Der Mailversand: die Testmail geht an die eigene Adresse'
  },
  {
    nr: '13', name: 'Die Absage ohne eigene Adresse nennt den Weg dorthin nicht',
    datei: 'server.js',
    suche: "      'unter „Zugang“ ein — die Testmail geht ausschließlich an die eigene Adresse.' });",
    ersatz: "      'ein.' });",
    erwartet: 'Der Mailversand: die Testmail geht an die eigene Adresse'
  },
  {
    nr: '14', name: 'Die Marke des Tests faellt bei einer Aenderung nicht mehr',
    datei: 'server.js',
    suche: "  putSetting.run(MAILTEST_SCHLUESSEL, JSON.stringify(null));",
    ersatz: "",
    erwartet: 'Die Karte „Mailversand“'
  },
  /* ---- Die Rollenleiter am Mailzugang ---- */
  {
    nr: '15', name: 'Der Mailzugang steht auch dem Admin offen',
    datei: 'server.js',
    suche: "app.put('/api/mail', nurEigentuemer, zweiteBestaetigungNoetig('mail'), (req, res) => {",
    ersatz: "app.put('/api/mail', nurAdmin, zweiteBestaetigungNoetig('mail'), (req, res) => {",
    erwartet: 'Der Mailzugang: wer ihn setzen darf'
  },
  {
    nr: '16', name: 'Die Testmail steht auch dem Admin offen',
    datei: 'server.js',
    suche: "app.post('/api/mail/test', nurEigentuemer, async (req, res) => {",
    ersatz: "app.post('/api/mail/test', nurAdmin, async (req, res) => {",
    erwartet: 'Der Mailzugang: wer ihn setzen darf'
  },
  {
    nr: '17', name: 'Die zweite Bestaetigung faellt am Mailzugang weg',
    datei: 'server.js',
    suche: "app.put('/api/mail', nurEigentuemer, zweiteBestaetigungNoetig('mail'), (req, res) => {",
    ersatz: "app.put('/api/mail', nurEigentuemer, (req, res) => {",
    erwartet: 'Der Mailzugang: wer ihn setzen darf'
  },
  /* ---- Das Passwort ---- */
  {
    nr: '18', name: 'Das Mailpasswort steht in der Antwort',
    datei: 'server.js',
    suche: "app.get('/api/mail', nurEigentuemer, (req, res) => res.json(mailKarte()));",
    ersatz: "app.get('/api/mail', nurEigentuemer, (req, res) => res.json({ ...mailKarte(), passwort: mail.loeseAuf(getSetting(mail.SCHLUESSEL, null)).passwort }));",
    erwartet: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '19', name: 'Das Mailpasswort geht in die Kontrollausgabe',
    datei: 'server.js',
    suche: "        `(${z.sicher ? 'TLS' : 'STARTTLS'}), Absender ${z.absender}.` +",
    ersatz: "        `(${z.sicher ? 'TLS' : 'STARTTLS'}), Absender ${z.absender}, Passwort ${mail.loeseAuf(roh).passwort}.` +",
    erwartet: 'Der Mailversand: das Passwort steht nirgends'
  },
  /* ---- Die Anbietervorlagen ---- */
  {
    nr: '20', name: 'Ein mitgeschickter Server ueberschreibt die Vorlage',
    datei: 'mail.js',
    suche: "  return { ...z, server: v.server, port: v.port, sicher: v.sicher };",
    ersatz: "  return { ...z, server: z.server || v.server, port: z.port || v.port, sicher: z.sicher === true };",
    erwartet: 'Der Mailzugang: wer ihn setzen darf'
  },
  {
    nr: '21', name: 'Ein unbekannter Anbieter wird durchgelassen',
    datei: 'mail.js',
    suche: "  if (!v) throw new Error('Diesen Anbieter gibt es nicht.');",
    ersatz: "  const vv = v;",
    erwartet: 'Der Mailzugang: wer ihn setzen darf'
  },
  /* ---- Die Frist ab dem ersten Oeffnen ---- */
  {
    nr: '22', name: 'Das erste Oeffnen startet die Frist nicht',
    datei: 'server.js',
    suche: "  const minuten = auth.beginneTokenFrist(t.hash);",
    ersatz: "  const minuten = auth.TOKEN_FRIST_MINUTEN;",
    erwartet: 'Der Token: die Frist ab dem ersten Oeffnen'
  },
  {
    nr: '23', name: 'Jedes Oeffnen schiebt die Frist weiter',
    datei: 'auth.js',
    suche: "    WHERE hash = ? AND benutzt_am IS NULL AND ablauf > datetime('now', ?)`);",
    ersatz: "    WHERE hash = ? AND benutzt_am IS NULL AND ? IS NOT NULL`);",
    erwartet: 'Der Token: die Frist ab dem ersten Oeffnen'
  },
  {
    nr: '24', name: 'Die Absage nach der Frist bekommt einen eigenen Wortlaut',
    datei: 'server.js',
    suche: "const TOKEN_ABSAGE = 'Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern.';",
    ersatz: "const TOKEN_ABSAGE = 'Die Frist von 15 Minuten ist abgelaufen.';",
    erwartet: 'Der Token: die Absage sieht immer gleich aus'
  },
  /* ---- Befund G: die voruebergehende Absage ---- */
  {
    nr: '25', name: 'Jede Absage wirft den Schluessel wieder aus der Adresse',
    datei: 'public/app.js',
    suche: "    if (res.status === 400) {",
    ersatz: "    if (!res.ok) {",
    erwartet: 'Die Einladungsseite in der Oberflaeche'
  },
  {
    nr: '26', name: 'Der zweite Anlauf nach der Bremse faellt weg',
    datei: 'public/app.js',
    suche: "    document.getElementById('eb-neu').onclick = () => showEinladung(schluessel);",
    ersatz: "    document.getElementById('eb-neu').onclick = () => {};",
    erwartet: 'Die Einladungsseite in der Oberflaeche'
  },
  /* ---- Die Oberflaeche ---- */
  {
    /* GEZIELT AUF DEN ABRUF, nicht auf die Bedingung der Karte. Ein Rueckbau
       allein an der Karte blieb stumm: mailstand ist beim Admin `null`, weil
       er gar nicht erst geholt wird -- die Karte erschiene also trotzdem
       nicht. DIE TRAGENDE ZEILE IST DER ABRUF, und der Rueckbau greift
       deshalb dort. */
    nr: '27', name: 'Der Mailzugang wird auch fuer den Admin geholt',
    datei: 'public/app.js',
    suche: "      EIGENTUEMER ? api('GET', '/api/mail') : null",
    ersatz: "      ADMIN ? api('GET', '/api/mail') : null",
    erwartet: 'Die Karten des Systembereichs nach Rolle (viele rot — der Abruf reisst den ganzen Bereich mit)'
  },
  {
    nr: '28', name: 'Der Versandzustand verschwindet aus dem Linkkasten',
    datei: 'public/app.js',
    suche: "      ${versandZeile(d)}",
    ersatz: "      ",
    erwartet: 'Der Versandzustand neben dem Link'
  },
  {
    nr: '29', name: 'Das Adressfeld am eigenen Zugang schickt nichts mehr mit',
    datei: 'public/app.js',
    suche: "        oldPassword: alt, username: name, newPassword: neu1, email: adresse",
    ersatz: "        oldPassword: alt, username: name, newPassword: neu1",
    erwartet: 'Die eigene Adresse in der Karte „Zugang“'
  },
  {
    nr: '30', name: 'Die Frist steht nicht mehr auf der Einladungsseite',
    datei: 'public/app.js',
    suche: "        ${stand.minuten ? `<br><strong>Du hast jetzt ${stand.minuten} Minuten Zeit.</strong>",
    ersatz: "        ${false ? `<br><strong>Du hast jetzt ${stand.minuten} Minuten Zeit.</strong>",
    erwartet: 'Die Einladungsseite in der Oberflaeche'
  },
  /* ---- Der Pruefstand ueber sich selbst ---- */
  {
    nr: 'W2', name: 'Eine Portbasis liegt wieder auf der gesperrten 4045',
    datei: 'pruefung.js',
    suche: '  const B = starteWeiterenServer(frischDir, {}, 5130);',
    ersatz: '  const B = starteWeiterenServer(frischDir, {}, 4000);',
    erwartet: 'Die Portbasen und der Versatz'
  },
  {
    nr: 'W5', name: 'Der SMTP-Empfaenger wird nicht mehr vermerkt',
    datei: 'pruefung.js',
    suche: '  SMTP_LAGEN.push(lage);',
    ersatz: '  // SMTP_LAGEN.push(lage);',
    erwartet: 'Die Portbasen und der Versatz'
  },
  {
    /* GEZIELT AUF DEN HORCHPOSTEN, nicht auf das Abraeumen der Verbindungen.
       Der erste Anlauf nahm das Abraeumen weg -- dann HAENGT der Lauf am
       close(), das auf offene Verbindungen wartet, und er lief in die
       Zeitgrenze des Treibers, statt eine Pruefung rot zu faerben
       (Stolperstein 138). So bleibt der Lauf ganz, die Empfaenger horchen
       weiter, und genau der Waechter faerbt sich, der dafuer da ist. */
    nr: 'W6', name: 'Der SMTP-Empfaenger hoert nicht auf zu horchen',
    datei: 'pruefung.js',
    suche: '    server.close(() => r());',
    ersatz: '    r();',
    erwartet: 'Keine Prueflage laesst ihren Server zurueck'
  }
];

/* ================= Spuren und Versatz =================
   Der Versatz je Nebenspur steht im PRUEFSTAND (VERSATZ_STUFE) und wird von
   dort gelesen -- der Waechter, der ihn nachrechnet, liegt dort, und zwei
   Zahlen an zwei Orten laufen auseinander. Faellt die Zeile weg, bricht der
   Treiber ab, statt still auf einen Vorgabewert zu fallen. */
function versatzStufe() {
  const t = fs.readFileSync(path.join(__dirname, 'pruefung.js'), 'utf8');
  const m = t.match(/^const VERSATZ_STUFE = (\d+);$/m);
  if (!m) {
    console.error('In pruefung.js steht keine Zeile "const VERSATZ_STUFE = <Zahl>;".');
    console.error('Ohne sie faehrt der Treiber keine Nebenspuren.');
    process.exit(1);
  }
  return Number(m[1]);
}

const HOECHSTE_SPUR = 4;

/* ================= Kopie und Aufraeumen ================= */

function legeKopieAn(ziel) {
  fs.mkdirSync(ziel, { recursive: true });
  // git archive schreibt einen tar-Strom; entpackt wird er unmittelbar. Damit
  // liegt nie eine Zwischendatei herum, und der Stand ist der von HEAD.
  const tar = spawnSync('sh', ['-c',
    `git -C ${JSON.stringify(__dirname)} archive HEAD | tar -x -C ${JSON.stringify(ziel)}`],
    { encoding: 'utf8' });
  if (tar.status !== 0)
    throw new Error(`git archive gescheitert: ${(tar.stderr || '').trim()}`);
  /* node_modules wird VERKNUEPFT statt kopiert: es traegt uebersetzte native
     Anteile, waere je Kopie ein paar hundert Megabyte, und kein Rueckbau fasst
     es an. Eine Verknuepfung genuegt -- require loest sie auf. */
  fs.symlinkSync(path.join(__dirname, 'node_modules'), path.join(ziel, 'node_modules'), 'dir');
}

/* Wer laeuft noch unter diesem Pfad? Erkannt am Arbeitsverzeichnis und nicht an
   der Befehlszeile (Stolperstein 133). Liefert die Nummern der Prozesse. */
function prozesseUnter(pfad) {
  const raus = [];
  let eintraege;
  try { eintraege = fs.readdirSync('/proc'); } catch { return raus; }
  for (const e of eintraege) {
    if (!/^\d+$/.test(e)) continue;
    let cwd;
    try { cwd = fs.readlinkSync(`/proc/${e}/cwd`); } catch { continue; }
    if (cwd === pfad || cwd.startsWith(pfad + path.sep)) raus.push(Number(e));
  }
  return raus;
}

/* Raeumt auf UND SIEHT NACH. Ein Aufraeumen, das nie greift, sieht aus wie
   eines, das greift -- wer eines baut, sieht hinterher nach, ob wirklich
   keiner ueberlebt hat. Liefert die Zahl der Prozesse, die es NICHT
   ueberlebt haben, und wirft, wenn einer stehenbleibt. */
function raeumeAuf(pfad) {
  const erste = prozesseUnter(pfad);
  for (const pid of erste) { try { process.kill(pid, 'SIGKILL'); } catch {} }
  // Ein SIGKILL wirkt nicht in derselben Zeile: dem Kern bleibt ein Augenblick.
  // Gewartet wird SYNCHRON -- die Nachschau gehoert vor das Loeschen, und ein
  // await mitten im Aufraeumen liesse die anderen Spuren dazwischenfunken.
  const warte = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  const bis = Date.now() + 5000;
  let uebrig = prozesseUnter(pfad);
  while (uebrig.length && Date.now() < bis) { warte(100); uebrig = prozesseUnter(pfad); }
  fs.rmSync(pfad, { recursive: true, force: true });
  return { geraeumt: erste.length, uebrig: uebrig.length };
}

/* ================= Den Rueckbau anbringen ================= */

function baueZurueck(kopie, r) {
  const datei = path.join(kopie, r.datei);
  if (!fs.existsSync(datei)) throw new Error(`${r.datei} gibt es in der Kopie nicht.`);
  const text = fs.readFileSync(datei, 'utf8');
  const teile = text.split(r.suche);
  /* GENAU EINMAL. Keinmal heisst: der gesuchte Text steht so nicht mehr da --
     der Rueckbau griffe ins Leere und der Lauf bliebe gruen, ohne dass etwas
     zurueckgebaut worden waere. Mehrfach heisst: es ist nicht entschieden,
     welche Stelle gemeint ist. Beides bricht ab und wird gemeldet. */
  if (teile.length !== 2)
    throw new Error(`Der gesuchte Text steht ${teile.length - 1}-mal in ${r.datei}, erwartet ist genau einmal.`);
  fs.writeFileSync(datei, teile.join(r.ersatz));
}

/* ================= Den Prueflauf lesen =================
   Der Pruefstand schreibt Gruppen als "── <Name> ───" und Pruefungen als
   "  ✓ <Name>" bzw. "  ✗ <Name>". Gelesen wird genau das -- und die Schlusszeile
   daneben, denn ein Lauf, der ABREISST, sieht in den roten Punkten allein
   genauso aus wie einer, der sauber durchlaeuft und nichts findet. */
function leseLauf(ausgabe) {
  const rot = [];
  let gruppe = '(vor der ersten Gruppe)';
  for (const zeile of ausgabe.split('\n')) {
    // ─* und nicht ─+: eine Ueberschrift, die die Zeile fuellt, traegt gar
    // keinen Strich mehr. Der Pruefstand setzt seit dieser Runde mindestens
    // zwei -- der Leser hier gibt sich trotzdem mit keinem zufrieden, denn er
    // liest auch aeltere Ausgaben.
    const g = zeile.match(/^── (.+?) ─*\s*$/);
    if (g) { gruppe = g[1]; continue; }
    const p = zeile.match(/^ {2}✗ (.+)$/);
    if (p) rot.push({ gruppe, name: p[1] });
  }
  const schluss = ausgabe.match(/^\s+(\d+) von (\d+) Pruefungen bestanden/m);
  const abriss = ausgabe.match(/^Prueflauf abgebrochen: (.+)$/m);
  return {
    rot,
    durchgelaufen: Boolean(schluss),
    bestanden: schluss ? Number(schluss[1]) : null,
    gesamt: schluss ? Number(schluss[2]) : null,
    abriss: abriss ? abriss[1] : null
  };
}

/* ================= Eine Gegenprobe ================= */

function fahre(r, spur, stufe) {
  return new Promise((fertig) => {
    const kopie = fs.mkdtempSync(path.join(os.tmpdir(), `kriterion-gegenprobe-${r.nr}-`));
    const beginn = Date.now();
    const ende = (ergebnis) => {
      let aufraeumen = { geraeumt: 0, uebrig: 0 };
      try { aufraeumen = raeumeAuf(kopie); } catch (e) { ergebnis.raeumFehler = e.message; }
      fertig({ ...r, spur, sekunden: Math.round((Date.now() - beginn) / 1000),
               ...aufraeumen, ...ergebnis });
    };
    try {
      legeKopieAn(kopie);
      baueZurueck(kopie, r);
    } catch (e) { return ende({ fehler: e.message }); }
    const kind = spawn(process.execPath, ['pruefung.js'], {
      cwd: kopie,
      env: { ...process.env, PORT_VERSATZ: String(spur * stufe) }
    });
    let ausgabe = '';
    kind.stdout.on('data', d => { ausgabe += d; });
    kind.stderr.on('data', d => { ausgabe += d; });
    /* EINE ZEITGRENZE JE RUECKBAU, seit 0.9.0. Ein Rueckbau kann den Prueflauf
       nicht nur rot machen, sondern HAENGEN lassen -- und ein haengender Lauf
       blockiert seine Spur fuer immer, ohne CPU und ohne Meldung. Genau das
       tut der Rueckbau, der das Aufraeumen des SMTP-Empfaengers wegnimmt.
       OHNE GRENZE STUENDE DER GANZE TREIBER STILL, und von aussen saehe es aus
       wie ein besonders langer Lauf. Die Grenze ist grosszuegig: ein
       vollstaendiger Lauf dauert rund sechs Minuten, die Grenze liegt beim Doppelten. */
    const GRENZE_MS = 12 * 60 * 1000;
    const uhr = setTimeout(() => { try { kind.kill('SIGKILL'); } catch {} }, GRENZE_MS);
    kind.on('exit', (code, signal) => {
      const ueberfaellig = Date.now() - beginn >= GRENZE_MS;
      clearTimeout(uhr);
      ende({ code, signal, ueberfaellig, ...leseLauf(ausgabe) });
    });
  });
}

/* ================= Die Spuren ================= */

async function fahreAlle(liste, spuren, stufe) {
  const ergebnisse = new Array(liste.length);
  let naechster = 0;
  const spur = async (nr) => {
    for (;;) {
      const i = naechster++;
      if (i >= liste.length) return;
      const r = liste[i];
      console.log(`  [Spur ${nr}] ${r.nr} — ${r.name}`);
      ergebnisse[i] = await fahre(r, nr, stufe);
      const e = ergebnisse[i];
      /* EIN ABGERISSENER LAUF IST KEIN STUMMER. Beide zeigen null rote Punkte,
         und sie sagen das Gegenteil: der eine, dass niemand prueft, der andere,
         dass der Lauf gar nicht so weit gekommen ist (Stolperstein 138). Die
         Tabelle unterscheidet sie seit jeher -- diese Zeile jetzt auch. */
      const wort = e.fehler ? 'FEHLER'
        : e.ueberfaellig ? 'ZEITGRENZE'
        : !e.durchgelaufen ? 'ABGERISSEN'
        : e.rot.length ? `${e.rot.length} rot` : 'STUMM';
      console.log(`  [Spur ${nr}] ${r.nr} fertig nach ${e.sekunden}s — ${wort}`);
    }
  };
  // Spur 0 gibt es auch: sie faehrt ohne Versatz, wie ein gewoehnlicher Lauf.
  await Promise.all(Array.from({ length: spuren }, (_, k) => spur(k)));
  return ergebnisse;
}

/* ================= Die Tabelle =================
   EINE Tabelle, und zwar in der Form, in der sie im Aenderungsprotokoll steht.
   Was sie NICHT tut: einen stummen Rueckbau als Erfolg zeigen. Er bekommt sein
   eigenes Wort und darunter seinen eigenen Absatz. */
function schreibeTabelle(ergebnisse) {
  console.log('\n| # | Rückbau | Namentlich rot |');
  console.log('|---|---|---|');
  for (const e of ergebnisse) {
    let rechts;
    if (e.fehler) rechts = `**RÜCKBAU GESCHEITERT** — ${e.fehler}`;
    else if (e.ueberfaellig)
      rechts = '**LAUF AN DER ZEITGRENZE ABGEBROCHEN** — er hängt, statt rot zu werden';
    else if (!e.durchgelaufen)
      rechts = `**LAUF ABGERISSEN** — ${e.abriss || `Code ${e.code}`}` +
               (e.rot.length ? ` (davor ${e.rot.length} rot)` : '');
    else if (!e.rot.length) rechts = '**STUMM — das ist ein FUND**';
    else if (e.rot.length <= 3)
      rechts = e.rot.map(p => `„${p.name}"`).join(', ');
    else {
      const gruppen = [...new Set(e.rot.map(p => p.gruppe))];
      rechts = `${e.rot.length} Prüfungen, darunter „${e.rot[0].name}"` +
               (gruppen.length === 1 ? ` (Gruppe „${gruppen[0]}")`
                                     : ` (${gruppen.length} Gruppen)`);
    }
    console.log(`| ${e.nr} | ${e.name} | ${rechts} |`);
  }

  console.log('\n### Im Einzelnen\n');
  for (const e of ergebnisse) {
    console.log(`**${e.nr} — ${e.name}** (${e.datei}, Spur ${e.spur}, ${e.sekunden}s)`);
    if (e.fehler) { console.log(`  RÜCKBAU GESCHEITERT: ${e.fehler}\n`); continue; }
    if (!e.durchgelaufen)
      console.log(`  LAUF ABGERISSEN: ${e.abriss || `Rückgabewert ${e.code}`}`);
    else
      console.log(`  ${e.bestanden} von ${e.gesamt} bestanden, erwartet in „${e.erwartet}"`);
    if (!e.rot.length && e.durchgelaufen)
      console.log('  STUMM — kein einziger roter Punkt. Das ist ein FUND und gehört untersucht.');
    let letzte = null;
    for (const p of e.rot) {
      if (p.gruppe !== letzte) { console.log(`  ── ${p.gruppe}`); letzte = p.gruppe; }
      console.log(`     ✗ ${p.name}`);
    }
    if (e.uebrig) console.log(`  ACHTUNG: ${e.uebrig} Prozess(e) haben das Aufräumen überlebt.`);
    if (e.raeumFehler) console.log(`  ACHTUNG: Aufräumen gescheitert — ${e.raeumFehler}`);
    console.log('');
  }

  const stumm = ergebnisse.filter(e => e.durchgelaufen && !e.rot.length);
  const kaputt = ergebnisse.filter(e => e.fehler || !e.durchgelaufen);
  const leichen = ergebnisse.filter(e => e.uebrig || e.raeumFehler);
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  ${ergebnisse.length} Gegenproben gefahren.`);
  console.log(`  ${stumm.length} STUMM${stumm.length ? ': ' + stumm.map(e => e.nr).join(', ') : ''}` +
              (stumm.length ? '  — jede davon ist ein Fund.' : ''));
  if (kaputt.length)
    console.log(`  ${kaputt.length} nicht auswertbar: ${kaputt.map(e => e.nr).join(', ')}`);
  if (leichen.length)
    console.log(`  ${leichen.length} mit übriggebliebenen Prozessen: ${leichen.map(e => e.nr).join(', ')}`);
  console.log('══════════════════════════════════════════════════════════════\n');
  return (stumm.length || kaputt.length || leichen.length) ? 1 : 0;
}

/* ================= Bedienung ================= */

(async function haupt() {
  const argumente = process.argv.slice(2);
  let spuren = 2;
  if (argumente.length && /^\d+$/.test(argumente[0])) spuren = Number(argumente.shift());
  if (spuren < 1 || spuren > HOECHSTE_SPUR) {
    console.error(`Zwischen 1 und ${HOECHSTE_SPUR} Nebenspuren. Mehr Spuren heissen mehr ` +
                  `gleichzeitige Server, und der Rechner hat nicht beliebig viele Kerne.`);
    process.exit(1);
  }
  const liste = argumente.length
    ? RUECKBAUTEN.filter(r => argumente.some(a =>
        r.nr.toLowerCase() === a.toLowerCase() ||
        r.name.toLowerCase().includes(a.toLowerCase())))
    : RUECKBAUTEN;
  /* Ein Filter, auf den KEIN Rueckbau passt, ist ein Fehler und kein leerer
     Lauf -- sonst meldete ein Tippfehler wortlos Erfolg. Dieselbe Regel wie
     beim Gruppenfilter des Pruefstands. */
  if (!liste.length) {
    console.error(`Kein Rueckbau passt auf ${argumente.join(', ')}.`);
    console.error('Vorhanden: ' + RUECKBAUTEN.map(r => r.nr).join(', '));
    process.exit(1);
  }
  const stufe = versatzStufe();
  console.log(`\nGegenproben: ${liste.length} Rückbauten, ${spuren} Nebenspur(en), ` +
              `Versatz ${stufe} je Spur.`);
  console.log('Jede läuft in einer eigenen Kopie aus `git archive HEAD`; ' +
              'der Arbeitsbaum wird nicht angefasst.\n');
  const ergebnisse = await fahreAlle(liste, spuren, stufe);
  process.exit(schreibeTabelle(ergebnisse));
})().catch(e => {
  console.error('\nGegenproben abgebrochen:', e.message);
  process.exit(1);
});
