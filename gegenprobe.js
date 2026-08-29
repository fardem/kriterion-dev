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
   Statt `suche`/`ersatz` darf ein Eintrag auch `kopie` tragen: dann wird
   `datei` in der Kopie ein zweites Mal unter diesem Namen abgelegt. Damit
   laesst sich eine entfernte Datei zurueckholen -- eine Textersetzung kann
   das nicht, weil es dabei um die Datei geht und nicht um ihren Inhalt.
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
    /* STEHT DIESELBE FRAGE ZWEIMAL im Quelltext -- einmal am
       Versand des Tokenlinks und einmal in versandBereit(). Der Rueckbau
       nimmt die Zeile am VERSAND, und die naechste Zeile macht ihn
       eindeutig. */
    suche: "  if (!OEFFENTLICHE.adresse)\n    return { versand: 'aus', versandGrund:",
    ersatz: "  if (false)\n    return { versand: 'aus', versandGrund:",
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
    /* GEZIELT AUF DEN VERGLEICH, denn DER traegt die Zusage. Der erste Anlauf
       nahm ein ausdrueckliches Loeschen der Marke weg und blieb stumm -- weil
       der Hash ueber den Zugang die Arbeit ohnehin schon tat. Das Loeschen
       war folgenlos und ist entfernt; es gibt jetzt EINEN Mechanismus, und der
       Rueckbau greift ihn an. */
    nr: '14', name: 'Die Marke gilt auch nach einer Aenderung am Zugang weiter',
    datei: 'server.js',
    /* DER VERGLEICH IST IN mailtestStand() GEZOGEN -- eine
       Rechnung, zwei Rufer: die Karte und der Schalter der Selbstanmeldung.
       Zwei Mechanismen fuer eine Zusage waeren einer zu viel
       (Stolperstein 145), und deshalb faerbt dieser Rueckbau jetzt BEIDE
       Seiten rot. */
    suche: "  return test && test.marke && test.marke === mail.marke(roh) ? test : null;",
    ersatz: "  return test || null;",
    erwartet: 'Der Mailversand: die Testmail geht an die eigene Adresse'
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
    suche: "        ${stand.minuten ? `<br><strong>Du hast jetzt ${stand.minuten} Minuten Zeit</strong> —",
    ersatz: "        ${false ? `<br><strong>Du hast jetzt ${stand.minuten} Minuten Zeit</strong> —",
    erwartet: 'Die Einladungsseite in der Oberflaeche'
  },
  /* ---- Die Selbstanmeldung: die immer gleiche Antwort ---- */
  {
    nr: '31', name: 'Die Antwort verraet, dass still verworfen wurde',
    datei: 'server.js',
    suche: "  res.json(ANFRAGE_ANTWORT);",
    ersatz: "  res.json(klartext ? ANFRAGE_ANTWORT : { ok: false, error: 'Name oder Adresse ist schon vergeben.' });",
    erwartet: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    /* DER RUECKBAU MACHT DIE ANTWORT LANGSAM, ER ENTFERNT SIE NICHT. Der
       Versand steht danach ein zweites Mal da -- das stoert nicht, denn
       geprueft wird die LAUFZEIT der Antwort, und die haengt am await davor.
       Der troepfelnde Empfaenger haelt ihn zwanzig Sekunden fest. */
    nr: '32', name: 'Die Antwort wartet wieder auf den Mailserver',
    datei: 'server.js',
    suche: "  const klartext = an ? auth.legeAnfrageAn(name, adresse) : null;",
    ersatz: "  const klartext = an ? auth.legeAnfrageAn(name, adresse) : null;\n" +
            "  if (klartext) await versendeBestaetigung(String(name).trim(), String(adresse).trim(), klartext).catch(() => {});",
    erwartet: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    nr: '33', name: 'Der Schalter aus fuehrt zu einer eigenen Absage',
    datei: 'server.js',
    suche: "  const an = getSetting('registrierung', false) === true;",
    ersatz: "  const an = getSetting('registrierung', false) === true;\n" +
            "  if (!an) return res.status(403).json({ error: 'Die Selbstanmeldung ist ausgeschaltet.' });",
    erwartet: 'Die Selbstanmeldung: der Schalter aus'
  },
  /* ---- Die Selbstanmeldung: der Deckel und die stille Verwerfung ---- */
  {
    nr: '34', name: 'Der Deckel faellt ganz weg',
    datei: 'auth.js',
    suche: "  if (zaehleAnfragen() >= ANFRAGE_DECKEL) return null;",
    ersatz: "  if (false) return null;",
    erwartet: 'Die Selbstanmeldung: der Deckel'
  },
  {
    nr: '35', name: 'Der Deckel zaehlt nur die BESTAETIGTEN',
    datei: 'auth.js',
    suche: "  if (zaehleAnfragen() >= ANFRAGE_DECKEL) return null;",
    ersatz: "  if (db.prepare('SELECT COUNT(*) n FROM anfragen WHERE bestaetigt_am IS NOT NULL').get().n >= ANFRAGE_DECKEL) return null;",
    erwartet: 'Die Selbstanmeldung: der Deckel'
  },
  {
    nr: '36', name: 'Eine zweite Anfrage je Adresse geht durch',
    datei: 'auth.js',
    suche: "  if (qAnfrageMail.get(post)) return null;",
    ersatz: "  if (false) return null;",
    erwartet: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    nr: '37', name: 'Ein vergebener Benutzername kommt in die Warteschlange',
    datei: 'auth.js',
    suche: "  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE').get(sauber)) return null;",
    ersatz: "  if (false) return null;",
    erwartet: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    nr: '38', name: 'Eine vergebene Adresse ebenso',
    datei: 'auth.js',
    suche: "  if (qBenutzerMail.get(post)) return null;",
    ersatz: "  if (false) return null;",
    erwartet: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    /* DIE ZWEITE HAELFTE DERSELBEN SCHRANKE. Ohne sie bliebe der Rueckbau auf
       die Adressschranke stumm -- die Namensschranke faengt jede Lage auf, in
       der BEIDES noch einmal geschickt wird. Genau das ist beim ersten Lauf
       dieser Runde passiert. */
    nr: '67', name: 'Derselbe Wunschname darf zweimal in der Warteschlange stehen',
    datei: 'auth.js',
    suche: "  if (qAnfrageName.get(sauber)) return null;",
    ersatz: "  if (false) return null;",
    erwartet: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    nr: '39', name: 'Name und Adresse von aussen sind wieder unbegrenzt lang',
    datei: 'auth.js',
    suche: "  if (sauber.length > ANFRAGE_NAME_MAX || post.length > ANFRAGE_MAIL_MAX) return null;",
    ersatz: "  if (false) return null;",
    erwartet: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  /* ---- Die Selbstanmeldung: das Verfallen ---- */
  {
    nr: '40', name: 'Unbestaetigte Anfragen verfallen nicht mehr',
    datei: 'auth.js',
    suche: "  const n = delAnfragenAlt.run(`-${ANFRAGE_STUNDEN} hours`).changes;",
    ersatz: "  const n = 0;",
    erwartet: 'Die Selbstanmeldung: das Verfallen und das Aufraeumen'
  },
  {
    nr: '41', name: 'Auch die BESTAETIGTEN verfallen',
    datei: 'auth.js',
    suche: "  \"DELETE FROM anfragen WHERE bestaetigt_am IS NULL AND created_at < datetime('now', ?)\");",
    ersatz: "  \"DELETE FROM anfragen WHERE created_at < datetime('now', ?)\");",
    erwartet: 'Die Selbstanmeldung: das Verfallen und das Aufraeumen'
  },
  {
    nr: '42', name: 'Die Anfrageroute raeumt nicht mehr vor der Deckelpruefung auf',
    datei: 'auth.js',
    suche: "  raeumeAnfragenAuf();\n  if (zaehleAnfragen() >= ANFRAGE_DECKEL) return null;",
    ersatz: "  if (zaehleAnfragen() >= ANFRAGE_DECKEL) return null;",
    erwartet: 'Die Selbstanmeldung: das Verfallen und das Aufraeumen'
  },
  /* ---- Die Selbstanmeldung: der Schalter und seine Kopplung ---- */
  {
    nr: '43', name: 'Der Schalter laesst sich ohne durchgekommene Testmail einschalten',
    datei: 'server.js',
    suche: "  if (!mailtestStand(roh))",
    ersatz: "  if (false)",
    erwartet: 'Die Selbstanmeldung: der Schalter braucht drei Dinge'
  },
  {
    nr: '44', name: 'Der Schalter laesst sich ohne oeffentliche Adresse einschalten',
    datei: 'server.js',
    suche: "      'Der Eigentümer der Anlage drückt sie in der Karte „Mailversand“.' };\n  if (!OEFFENTLICHE.adresse)",
    ersatz: "      'Der Eigentümer der Anlage drückt sie in der Karte „Mailversand“.' };\n  if (false)",
    erwartet: 'Die Selbstanmeldung: der Schalter braucht drei Dinge'
  },
  {
    nr: '46', name: 'Ausschalten wird an dieselbe Bedingung gehaengt wie Einschalten',
    datei: 'server.js',
    suche: "  if (an) {\n    const b = versandBereit();",
    ersatz: "  if (true) {\n    const b = versandBereit();",
    erwartet: 'Die Selbstanmeldung: der Schalter aus'
  },
  {
    nr: '47', name: 'Der Schalter legt sich bei kaputtem Versand selbst um',
    datei: 'server.js',
    suche: "    an: getSetting('registrierung', false) === true,\n    versandBereit: b.ok,",
    ersatz: "    an: getSetting('registrierung', false) === true && b.ok,\n    versandBereit: b.ok,",
    erwartet: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  /* ---- Die Selbstanmeldung: der Bestaetigungslink ---- */
  {
    nr: '48', name: 'Der Bestaetigungsschluessel steht im Klartext in der Tabelle',
    datei: 'auth.js',
    suche: "    .run(tokenHash(klartext), sauber, post);",
    ersatz: "    .run(klartext, sauber, post);",
    erwartet: 'Die Selbstanmeldung: die Bestaetigungsmail'
  },
  {
    nr: '49', name: 'Die Bestaetigung nimmt jeden Schluessel an',
    datei: 'auth.js',
    suche: "  return setzeBestaetigt.run(tokenHash(t), `-${ANFRAGE_STUNDEN} hours`).changes > 0;",
    ersatz: "  setzeBestaetigt.run(tokenHash(t), `-${ANFRAGE_STUNDEN} hours`); return true;",
    erwartet: 'Die Selbstanmeldung: der Bestaetigungslink hat keine Passwortkraft'
  },
  {
    nr: '50', name: 'Die Karte gibt den Hash der Anfrage mit heraus',
    datei: 'auth.js',
    suche: "  `SELECT id, username, email, created_at, bestaetigt_am\n     FROM anfragen WHERE bestaetigt_am IS NOT NULL",
    ersatz: "  `SELECT id, username, email, created_at, bestaetigt_am, hash\n     FROM anfragen WHERE bestaetigt_am IS NOT NULL",
    erwartet: 'Die Selbstanmeldung: die Freischaltung'
  },
  {
    nr: '51', name: 'Die unbestaetigte Anfrage erscheint beim Admin',
    datei: 'auth.js',
    suche: "     FROM anfragen WHERE bestaetigt_am IS NOT NULL ORDER BY bestaetigt_am ASC, id ASC`);",
    ersatz: "     FROM anfragen ORDER BY created_at ASC, id ASC`);",
    erwartet: 'Die Selbstanmeldung: die unbestaetigte Anfrage'
  },
  {
    nr: '52', name: 'Die unbestaetigte Anfrage laesst sich freischalten',
    datei: 'server.js',
    suche: "  const a = auth.holeAnfrage(req.params.id);\n  if (!a || !a.bestaetigt_am)\n    return res.status(404).json({ error: 'Diese Anfrage gibt es nicht.' });\n  let angelegt, t;",
    ersatz: "  const a = auth.holeAnfrage(req.params.id);\n  if (!a)\n    return res.status(404).json({ error: 'Diese Anfrage gibt es nicht.' });\n  let angelegt, t;",
    erwartet: 'Die Selbstanmeldung: die unbestaetigte Anfrage'
  },
  /* ---- Die Selbstanmeldung: Freischaltung, Ablehnung, Rolle ---- */
  {
    nr: '53', name: 'Die Rolle kommt aus dem Rumpf der Anfrage',
    datei: 'server.js',
    suche: "    angelegt = await auth.legeZugangAn(a.username, null, 'user', true, req.benutzer.id, a.email);",
    ersatz: "    angelegt = await auth.legeZugangAn(a.username, null, (req.body || {}).rolle || 'user', true, req.benutzer.id, a.email);",
    erwartet: 'Die Selbstanmeldung: die Rolle ist immer user'
  },
  {
    nr: '54', name: 'Die Zeile bleibt nach der Freischaltung stehen',
    datei: 'server.js',
    suche: "  auth.entferneAnfrage(a.id);\n  /* DIE ZEILE NENNT DEN NEUEN ZUGANG",
    ersatz: "  /* DIE ZEILE NENNT DEN NEUEN ZUGANG",
    erwartet: 'Die Selbstanmeldung: die Freischaltung'
  },
  {
    nr: '55', name: 'Die Freischaltung erzeugt keinen Token',
    datei: 'server.js',
    suche: "    t = auth.erzeugeToken(angelegt.id, 'einladung', req.benutzer.id);",
    ersatz: "    t = { klartext: 'x'.repeat(64), zweck: 'einladung', tage: 7, id: angelegt.id, username: angelegt.username };",
    erwartet: 'Die Selbstanmeldung: die Freischaltung'
  },
  {
    nr: '56', name: 'Die Protokollzeile der Freischaltung faellt weg',
    datei: 'server.js',
    suche: "  auth.protokolliere('anfrage.frei', { wer: req.benutzer.id, ziel: angelegt.id });",
    ersatz: "  // auth.protokolliere('anfrage.frei', { wer: req.benutzer.id, ziel: angelegt.id });",
    erwartet: 'Die Selbstanmeldung: die Freischaltung'
  },
  {
    nr: '57', name: 'Die Ablehnung entfernt die Zeile nicht',
    datei: 'server.js',
    suche: "  auth.entferneAnfrage(a.id);\n  auth.protokolliere('anfrage.ab', { wer: req.benutzer.id });",
    ersatz: "  auth.protokolliere('anfrage.ab', { wer: req.benutzer.id });",
    erwartet: 'Die Selbstanmeldung: die Ablehnung'
  },
  {
    /* DER NAME IN merkmal WIRD VON protokolliere() ABGEWIESEN -- MERKMALE ist
       eine geschlossene Liste, und die Zeile entsteht dann GAR NICHT. Der
       Rueckbau faerbt deshalb "die Protokollzeile steht" rot und nicht "der
       Name steht nicht darin": genau so ist "kein Freitext von aussen"
       BAULICH wahr statt durchgesetzt. */
    nr: '58', name: 'Der Name des Abgewiesenen soll ins Protokoll',
    datei: 'server.js',
    suche: "  auth.protokolliere('anfrage.ab', { wer: req.benutzer.id });",
    ersatz: "  auth.protokolliere('anfrage.ab', { wer: req.benutzer.id, merkmal: a.username });",
    erwartet: 'Die Selbstanmeldung: die Ablehnung'
  },
  {
    nr: '59', name: 'Die Anfrage selbst schreibt eine Protokollzeile',
    datei: 'server.js',
    suche: "  const klartext = an ? auth.legeAnfrageAn(name, adresse) : null;",
    ersatz: "  const klartext = an ? auth.legeAnfrageAn(name, adresse) : null;\n" +
            "  if (klartext) auth.protokolliere('anfrage.frei', { wer: 1 });",
    erwartet: 'Die Selbstanmeldung: keine Zeile, die ein Fremder ausloesen kann'
  },
  /* ---- Die Selbstanmeldung: die Bremse ---- */
  {
    nr: '60', name: 'Die Bremse fehlt an der Anfrageroute',
    datei: 'server.js',
    suche: "app.post('/api/registrierung', async (req, res) => {\n  if (!await tokenBremseFrei(req, res)) return;",
    ersatz: "app.post('/api/registrierung', async (req, res) => {",
    erwartet: 'Die Selbstanmeldung: die Bremse greift an beiden Routen'
  },
  {
    nr: '61', name: 'Die Bremse fehlt an der Bestaetigungsroute',
    datei: 'server.js',
    suche: "  const ip = auth.clientIp(req);\n  if (!await tokenBremseFrei(req, res)) return;\n  if (!auth.bestaetigeAnfrage((req.body || {}).schluessel)) {",
    ersatz: "  const ip = auth.clientIp(req);\n  if (!auth.bestaetigeAnfrage((req.body || {}).schluessel)) {",
    erwartet: 'Die Selbstanmeldung: die Bremse greift an beiden Routen'
  },
  /* ---- Die Selbstanmeldung in der Oberflaeche ---- */
  {
    nr: '62', name: 'Das Anfrageformular steht auch bei ausgeschaltetem Schalter da',
    datei: 'public/app.js',
    suche: "    ${REGISTRIERUNG ? `<p class=\"sub anmeld-trenner\">Noch keinen Zugang?</p>",
    ersatz: "    ${true ? `<p class=\"sub anmeld-trenner\">Noch keinen Zugang?</p>",
    erwartet: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* DIE BEDINGUNG AUS DER ERSTEN FASSUNG, wiederhergestellt: die Karte
       erscheint nur, wenn der Schalter an ist oder Anfragen offen sind. Das
       ist die Sackgasse aus dem Betrieb -- der Schalter steht IN der Karte,
       also gaebe es keinen Weg, ihn je einzuschalten. */
    nr: '63', name: 'Die Karte „Anfragen“ verschwindet, solange der Schalter aus ist',
    datei: 'public/app.js',
    suche: "        ADMIN && anfragen ? `<div class=\"sys-card breit\">",
    ersatz: "        ADMIN && anfragen && (anfragen.an || anfragen.anfragen.length) ? `<div class=\"sys-card breit\">",
    erwartet: 'Die Karten im Systembereich'
  },
  {
    /* AUS DEM BETRIEB: der Weg zur Selbstanmeldung stand als Verweis in einer
       Fusszeile und wurde uebersehen. Er ist jetzt ein Knopf in derselben
       Groesse wie "Anmelden"; der Rueckbau macht wieder einen Verweis daraus. */
    nr: '68', name: 'Der Weg zur Anfrage wird wieder ein Verweis statt eines Knopfes',
    datei: 'public/app.js',
    suche: "      <button class=\"btn anmeld-zweitweg\" id=\"l-anfrage\">Zugang anfragen</button>",
    ersatz: "      <a href=\"#\" id=\"l-anfrage\">Zugang anfragen</a>",
    erwartet: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* DIE ANDERE HAELFTE VON 68: der Knopf wird so leise, dass er im
       Ruhezustand keiner mehr ist. Der Rueckbau nimmt ihm die Umrandung. */
    nr: '69', name: 'Der gedaempfte Knopf verliert auch seine Umrandung',
    datei: 'public/style.css',
    suche: "  background: var(--accent-dim); border-color: var(--accent-line);",
    ersatz: "  background: var(--accent-dim); border-color: transparent;",
    erwartet: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* AUS DEM BETRIEB: die Trennlinie ueber dem Knopf lag quer durch eine
       Karte, die sonst keine kennt. Sie ist weg, der Abstand traegt die
       Trennung. Der Rueckbau holt den Strich zurueck. */
    nr: '73', name: 'Der Strich ueber dem Anfrageknopf kommt zurueck',
    datei: 'public/style.css',
    suche: "  margin: 28px 0 0; font-size: .87rem;",
    ersatz: "  margin: 22px 0 0; padding-top: 18px; border-top: 1px solid var(--line); font-size: .87rem;",
    erwartet: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* UND DIE ANDERE HAELFTE: ohne Strich UND ohne Abstand liefe der Knopf
       mit dem Anmeldeknopf zusammen. */
    nr: '74', name: 'Und der Abstand, der ihn ersetzt, schrumpft auf nichts',
    datei: 'public/style.css',
    suche: "  margin: 28px 0 0; font-size: .87rem;",
    ersatz: "  margin: 10px 0 0; font-size: .87rem;",
    erwartet: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* DIE FAERBUNG FAELLT WEG. Ohne Linie darueber und ohne eigene Farbe
       stuende ein grauer Knopf auf dunkelgrauem Grund. */
    nr: '75', name: 'Der Anfrageknopf verliert seine leichte Faerbung',
    datei: 'public/style.css',
    suche: "  background: var(--accent-dim); border-color: var(--accent-line);",
    ersatz: "  background: transparent; border-color: var(--line);",
    erwartet: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* UND DIE GEGENRICHTUNG: die Faerbung wird so laut wie der Anmeldeknopf.
       Dann saessen zwei gleich laute Knoepfe uebereinander und die Seite
       sagte nicht mehr, welcher der gewoehnliche Weg ist. */
    nr: '76', name: 'Der Anfrageknopf wird so laut wie "Anmelden"',
    datei: 'public/style.css',
    suche: "  background: var(--accent-dim); border-color: var(--accent-line);",
    ersatz: "  background: var(--accent); border-color: var(--accent);",
    erwartet: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    nr: '64', name: 'Die rote Zeile bei kaputtem Versand faellt weg',
    datei: 'public/app.js',
    suche: "        ${anfragen.an && !anfragen.versandBereit ? `<p class=\"warn-box\" id=\"anf-kaputt\"",
    ersatz: "        ${false ? `<p class=\"warn-box\" id=\"anf-kaputt\"",
    erwartet: 'Die Karte „Anfragen“'
  },
  {
    nr: '65', name: 'Die Bestaetigungsseite meldet gleich an',
    datei: 'public/app.js',
    suche: "  const best = (location.hash || '').match(/^#\\/bestaetigung\\/([0-9a-f]{16,128})$/);\n  if (best) return showBestaetigung(best[1]);",
    ersatz: "  const best = (location.hash || '').match(/^#\\/bestaetigung\\/([0-9a-f]{16,128})$/);\n  if (best) return showEinladung(best[1]);",
    erwartet: 'Die Bestaetigungsseite in der Oberflaeche'
  },
  {
    nr: '66', name: 'Die gekuerzte Zeile im Mailtext verliert eine Auskunft',
    datei: 'mail.js',
    /* DIE ZEILE STEHT ZWEIMAL -- in der Einladung und in der Ruecksetzung.
       Genommen wird die der EINLADUNG; die naechsten Zeilen machen sie
       eindeutig. */
    suche: "    'Danach brauchst du einen neuen Link vom Admin.',\n    '',\n    'Wer diesen Link hat, kommt herein",
    ersatz: "    '',\n    'Wer diesen Link hat, kommt herein",
    erwartet: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  /* ---- Die Marke der Anlage ---- */
  {
    /* NEU GEZIELT: marke-hell.svg ist entfernt -- sie war Byte fuer Byte
       favicon.svg. Der Rueckbau greift jetzt zur verbliebenen Fassung mit
       Kachel, und die saesse auf dunklem Grund als sichtbares Rechteck. */
    nr: '70', name: 'Die Oberflaeche nimmt die Marke MIT Kachel',
    datei: 'public/app.js',
    suche: '<img class="marke" src="marke-dunkel.svg"',
    ersatz: '<img class="marke" src="favicon.svg"',
    erwartet: 'Die Marke der Anlage'
  },
  {
    /* DIE MARKE TRAEGT WIEDER DIE KLASSE DER KOMMENTARKNOEPFE -- und saesse
       damit wieder in einem Kaestchen mit Rahmen und rundem Fuellgrund. */
    nr: '71', name: 'Die Marke heisst wieder wie die Kommentarknoepfe',
    datei: 'public/app.js',
    suche: '<img class="marke" src="marke-dunkel.svg"',
    ersatz: '<img class="mark" src="marke-dunkel.svg"',
    erwartet: 'Die Marke der Anlage'
  },
  {
    nr: '72', name: 'Der Tab bekommt kein Favicon mehr',
    datei: 'public/index.html',
    suche: '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
    ersatz: '',
    erwartet: 'Die Marke der Anlage'
  },
  /* ---- Die Markenzeile der Anmeldeseiten ---- */
  {
    /* DER STAND VOR DER BERICHTIGUNG AUS DEM BETRIEB: Marke UEBER dem Namen.
       Der Helfer legt dann keinen Kasten mehr an, und die beiden stapeln
       sich wieder. */
    nr: '77', name: 'Marke und Name stapeln sich wieder uebereinander',
    datei: 'public/app.js',
    suche: '  `<div class="login-marke">${MARK(36)}<h1>${esc(TITLE_PUBLIC)}</h1></div>`;',
    ersatz: '  `${MARK(40)}<h1>${esc(TITLE_PUBLIC)}</h1>`;',
    erwartet: 'Die Markenzeile der Anmeldeseiten'
  },
  {
    /* DIE REIHENFOLGE KIPPT: erst das Wort, dann das Zeichen. Der Kasten
       bleibt, also greift hier nur die Zeile, die die Reihenfolge prueft. */
    nr: '78', name: 'Erst das Wort, dann das Zeichen',
    datei: 'public/app.js',
    suche: '  `<div class="login-marke">${MARK(36)}<h1>${esc(TITLE_PUBLIC)}</h1></div>`;',
    ersatz: '  `<div class="login-marke"><h1>${esc(TITLE_PUBLIC)}</h1>${MARK(36)}</div>`;',
    erwartet: 'Die Markenzeile der Anmeldeseiten'
  },
  {
    /* DER KASTEN BLEIBT, DAS STYLESHEET STELLT IHN ABER NICHT MEHR
       NEBENEINANDER. Zwei Bloecke untereinander sehen im Baum aus wie eine
       Zeile -- deshalb prueft der Prueflauf beides. */
    nr: '79', name: 'Die Markenzeile ist keine Zeile mehr',
    datei: 'public/style.css',
    suche: '  display: flex; align-items: center; gap: 11px; margin: 0 0 5px;',
    ersatz: '  display: block; margin: 0 0 5px;',
    erwartet: 'Die Marke der Anlage'
  },
  {
    /* DIE UEBERSCHRIFT NIMMT IHREN UNTERRAND WIEDER MIT -- bei
       align-items: center saesse sie damit um die halbe Hoehe zu hoch und
       die Marke stuende schief daneben. */
    nr: '80', name: 'Die Ueberschrift in der Zeile traegt wieder einen Unterrand',
    datei: 'public/style.css',
    suche: '.login-card .login-marke h1 { margin: 0; }',
    ersatz: '.login-card .login-marke h1 { margin: 0 0 5px; }',
    erwartet: 'Die Marke der Anlage'
  },
  {
    /* DIE DOPPELTE DATEI KOMMT ZURUECK: favicon.svg noch einmal unter einem
       zweiten Namen. Genau der Zustand, der aufgeraeumt wurde. */
    nr: '81', name: 'Dieselbe Datei liegt wieder unter zwei Namen in public/',
    datei: 'public/favicon.svg',
    kopie: 'public/marke-hell.svg',
    erwartet: 'Die Marke der Anlage'
  },
  /* ---- Der zweite Faktor: die Rechnung, 0.10.0 ----
     DIE DREI KENNWERTE EINZELN. Jedes davon ist fuer sich das bessere
     Verfahren und wird von Google Authenticator stillschweigend falsch
     gelesen -- ein Rueckbau, der stumm bliebe, hiesse: die Anlage bindet sich
     an nichts. */
  {
    nr: '82', name: 'Acht Ziffern statt sechs',
    datei: 'zweifaktor.js',
    suche: 'const ZIFFERN = 6;',
    ersatz: 'const ZIFFERN = 8;',
    erwartet: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    nr: '83', name: 'SHA-256 statt SHA-1',
    datei: 'zweifaktor.js',
    suche: "const VERFAHREN = 'sha1';",
    ersatz: "const VERFAHREN = 'sha256';",
    erwartet: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    nr: '84', name: 'Sechzig Sekunden statt dreissig',
    datei: 'zweifaktor.js',
    suche: 'const SCHRITT_SEKUNDEN = 30;',
    ersatz: 'const SCHRITT_SEKUNDEN = 60;',
    erwartet: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    /* DAS DYNAMISCHE ABGREIFEN AUS RFC 4226, Abschnitt 5.3. Ein fester Anfang
       statt der letzten vier Bit sieht plausibel aus und ergibt weltweit
       andere Codes -- die eine Stelle, an der eine eigene Umsetzung typisch
       danebenliegt. */
    nr: '85', name: 'Der Anfang des Abgreifens steht fest statt aus dem Hash zu kommen',
    datei: 'zweifaktor.js',
    suche: '  const o = h[h.length - 1] & 0x0f;',
    ersatz: '  const o = 0;',
    erwartet: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    /* DER ZAEHLER IST ACHT BYTES GROSS. Nur die untere Haelfte zu schreiben
       stimmt bis zum Jahr 6053 -- und der Testvektor T = 20 000 000 000 liegt
       darueber. Ohne ihn bliebe genau diese Zeile ungeprueft. */
    nr: '86', name: 'Der Zaehler wird nur in seiner unteren Haelfte geschrieben',
    datei: 'zweifaktor.js',
    suche: "  z.writeUInt32BE(Math.floor(zaehler / 2 ** 32), 0);",
    ersatz: "  z.writeUInt32BE(0, 0);",
    erwartet: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  /* ---- Der zweite Faktor: das Fenster und die Wiederverwendung ---- */
  {
    nr: '87', name: 'Das Fenster wird auf zwei Schritte geweitet',
    datei: 'zweifaktor.js',
    suche: 'const FENSTER = 1;',
    ersatz: 'const FENSTER = 2;',
    erwartet: 'Der zweite Faktor: das Zeitfenster'
  },
  {
    nr: '88', name: 'Es gibt gar kein Nachbarfenster mehr',
    datei: 'zweifaktor.js',
    suche: 'const FENSTER = 1;',
    ersatz: 'const FENSTER = 0;',
    erwartet: 'Der zweite Faktor: das Zeitfenster'
  },
  {
    /* EIN CODE GILT GENAU EINMAL -- und die Bedingung steht im UPDATE und
       nicht in einer Pruefung davor. Faellt sie weg, traegt derselbe Code
       beliebig oft, und wer ueber die Schulter sieht, hat dreissig Sekunden. */
    /* DIE BEDINGUNG WIRD WIRKUNGSLOS GEMACHT, NICHT ENTFERNT. Der erste Anlauf
       strich sie samt Platzhalter -- dann bekam die vorbereitete Anweisung drei
       Werte fuer zwei Stellen, better-sqlite3 warf, der Server starb, und der
       Lauf RISS AB, statt eine Pruefung rot zu faerben (Stolperstein 138). So
       bleibt die Zahl der Platzhalter gleich und nur die Wirkung faellt weg. */
    nr: '89', name: 'Der verbrauchte Zaehler wird nicht mehr geprueft',
    datei: 'auth.js',
    suche: "    WHERE user_id = ? AND (letzter_zaehler IS NULL OR letzter_zaehler < ?)`);",
    ersatz: "    WHERE user_id = ? AND (letzter_zaehler IS NULL OR ? IS NOT NULL)`);",
    erwartet: 'Der zweite Faktor: ein Code gilt genau einmal'
  },
  {
    nr: '90', name: 'Der verbrauchte Zaehler wird gar nicht erst geschrieben',
    datei: 'auth.js',
    suche: "    if (!verbraucheZaehler.run(zaehler, id, zaehler).changes) return null;\n    return 'app';",
    ersatz: "    return 'app';",
    erwartet: 'Der zweite Faktor: ein Code gilt genau einmal'
  },
  {
    /* DER BESTAETIGENDE CODE ZAEHLT ALS VERBRAUCHT. Ohne das truege er
       unmittelbar danach ein zweites Mal -- und "genau einmal" waere an seiner
       ERSTEN Anwendung falsch. */
    nr: '91', name: 'Der bestaetigende Code beim Einschalten zaehlt nicht als verbraucht',
    datei: 'auth.js',
    suche: "    `UPDATE zweifaktor SET bestaetigt_am = datetime('now'), letzter_zaehler = ?\n      WHERE user_id = ?`).run(zaehler, id);",
    ersatz: "    `UPDATE zweifaktor SET bestaetigt_am = datetime('now'), letzter_zaehler = NULL\n      WHERE user_id = ?`).run(id);",
    erwartet: 'Der zweite Faktor: ein Code gilt genau einmal'
  },
  /* ---- Der zweite Faktor: die Anmeldung ---- */
  {
    nr: '92', name: 'Die Anmeldung meldet auch mit zweitem Faktor gleich an',
    datei: 'server.js',
    suche: "  if (auth.zweifaktorAn(benutzer.id)) {\n    return res.json({ zweifaktor: true, ...auth.erzeugeAnmeldeAusweis(benutzer.id) });\n  }",
    ersatz: "",
    erwartet: 'Der zweite Faktor: ohne Code kommt niemand herein'
  },
  {
    /* DIE AUSKUNFT KOMMT ERST NACH RICHTIGEM PASSWORT. Vorgezogen waere die
       Anmeldeseite ein Werkzeug zum Durchprobieren von Namen: "dieser hat
       einen zweiten Faktor" hiesse "diesen Namen gibt es".
       DER RUECKBAU SETZT DIE AUSKUNFT IN DIE ABSAGE, statt die Reihenfolge zu
       drehen: so bleibt alles Uebrige stehen, und nur die eine Zusage faellt
       weg (Stolperstein 138). */
    nr: '93', name: 'Die Absage verraet, ob der Zugang einen zweiten Faktor hat',
    datei: 'server.js',
    suche: "    return res.status(401).json({ error: 'Benutzername oder Passwort stimmt nicht.' });",
    ersatz: "    return res.status(401).json({ error: 'Benutzername oder Passwort stimmt nicht.',\n" +
            "      zweifaktor: auth.zweifaktorAn((auth.holeBenutzerNachNamen(user) || {}).id) });",
    erwartet: 'Der zweite Faktor: die Auskunft kommt erst nach richtigem Passwort'
  },
  {
    nr: '94', name: 'Der Ausweis wird nicht verbraucht',
    datei: 'auth.js',
    suche: "  ausweise.delete(k);\n  return Date.now() <= a.bis ? a.id : null;",
    ersatz: "  return Date.now() <= a.bis ? a.id : null;",
    erwartet: 'Der zweite Faktor: ohne Code kommt niemand herein'
  },
  {
    /* DIE FRIST IST IM PRUEFLAUF NICHT ZU MESSEN -- zwei Minuten zu warten
       waere eine Prueflage, die jeder Lauf bezahlt. Gehalten wird sie deshalb
       ueber die ZAHL in der Antwort: der Ausweis nennt seine Sekunden, und sie
       sind dieselben wie bei der Freigabe der zweiten Bestaetigung. Ein Wert,
       eine Regel, eine Gegenprobe. */
    nr: '95', name: 'Der Ausweis bekommt eine eigene, laengere Frist',
    datei: 'auth.js',
    suche: 'const ANMELDE_AUSWEIS_MS = FREIGABE_MS;',
    ersatz: 'const ANMELDE_AUSWEIS_MS = 3600 * 1000;',
    erwartet: 'Der zweite Faktor: der Rundlauf'
  },
  {
    /* DIE BENUTZERNUMMER KOMMT AUS DEM AUSWEIS UND NIE AUS DEM RUMPF. Stuende
       sie dort, waere das richtige Passwort EINES Zugangs die Eintrittskarte
       fuer JEDEN anderen. */
    nr: '96', name: 'Die Benutzernummer im zweiten Schritt kommt aus dem Rumpf',
    datei: 'server.js',
    suche: "  const id = auth.verbraucheAnmeldeAusweis(ausweis);",
    ersatz: "  const id = Number((req.body || {}).id) || auth.verbraucheAnmeldeAusweis(ausweis);",
    erwartet: 'Der zweite Faktor: ohne Code kommt niemand herein'
  },
  /* ---- Der zweite Faktor: die Bremse ----
     SECHS ZIFFERN SIND EINE MILLION; ungebremst ist das kein Faktor, sondern
     eine Verzoegerung. Der zweite Schritt faellt NICHT von selbst in die
     Bremse -- er ist eine eigene Route. */
  {
    nr: '97', name: 'Die Bremse fehlt am zweiten Schritt',
    datei: 'server.js',
    suche: "  const t = auth.checkThrottle(ip, null);\n  if (t.blocked) {\n    return res.status(429).json({\n      error: `Zu viele Fehlversuche. Bitte in ${t.retryInSec} Sekunden erneut versuchen.`\n    });\n  }\n  if (t.delayMs) await new Promise(r => setTimeout(r, t.delayMs));\n  const id = auth.verbraucheAnmeldeAusweis(ausweis);",
    ersatz: "  const id = auth.verbraucheAnmeldeAusweis(ausweis);",
    erwartet: 'Der zweite Faktor: die Anmeldebremse greift am zweiten Schritt'
  },
  {
    /* DIE REIHENFOLGE SELBST. Steht die Bremse hinter dem Ausweis, bekommt ein
       gesperrter Aufrufer eine 401 ueber den Ausweis statt der 429 -- und ob
       sie hier ueberhaupt gilt, waere von aussen nicht mehr zu sehen. Genau
       daran ist die erste Fassung der Bremsprobe stumm geblieben. */
    nr: '123', name: 'Die Bremse steht wieder HINTER dem Ausweis',
    datei: 'server.js',
    suche: "  const t = auth.checkThrottle(ip, null);\n  if (t.blocked) {\n    return res.status(429).json({\n      error: `Zu viele Fehlversuche. Bitte in ${t.retryInSec} Sekunden erneut versuchen.`\n    });\n  }\n  if (t.delayMs) await new Promise(r => setTimeout(r, t.delayMs));\n  const id = auth.verbraucheAnmeldeAusweis(ausweis);\n  if (!id) {\n    auth.noteFailure(ip, null);\n    return res.status(401).json({ error: 'Die Anmeldung ist abgelaufen. Bitte noch einmal von vorn.' });\n  }",
    ersatz: "  const id = auth.verbraucheAnmeldeAusweis(ausweis);\n  if (!id) {\n    auth.noteFailure(ip, null);\n    return res.status(401).json({ error: 'Die Anmeldung ist abgelaufen. Bitte noch einmal von vorn.' });\n  }\n  const t = auth.checkThrottle(ip, null);\n  if (t.blocked) {\n    return res.status(429).json({\n      error: `Zu viele Fehlversuche. Bitte in ${t.retryInSec} Sekunden erneut versuchen.`\n    });\n  }\n  if (t.delayMs) await new Promise(r => setTimeout(r, t.delayMs));",
    erwartet: 'Der zweite Faktor: die Anmeldebremse greift am zweiten Schritt'
  },
  {
    nr: '98', name: 'Der Fehlversuch am zweiten Schritt wird nicht gezaehlt',
    datei: 'server.js',
    suche: "  if (!auth.pruefeZweitenFaktor(id, code)) {\n    auth.noteFailure(ip, name);",
    ersatz: "  if (!auth.pruefeZweitenFaktor(id, code)) {",
    erwartet: 'Der zweite Faktor: die Anmeldebremse greift am zweiten Schritt'
  },
  {
    /* Stuende noteSuccess unmittelbar hinter der Passwortpruefung, loeschte
       der erste Schritt den Zaehler, den der zweite gerade aufbaut -- und die
       Bremse schluege am zweiten Schritt nie zu. */
    nr: '99', name: 'Der erste Schritt setzt den Zaehler der Bremse wieder zurueck',
    datei: 'server.js',
    suche: "  if (auth.zweifaktorAn(benutzer.id)) {\n    return res.json({ zweifaktor: true, ...auth.erzeugeAnmeldeAusweis(benutzer.id) });\n  }\n  auth.noteSuccess(ip, user);",
    ersatz: "  auth.noteSuccess(ip, user);\n  if (auth.zweifaktorAn(benutzer.id)) {\n    return res.json({ zweifaktor: true, ...auth.erzeugeAnmeldeAusweis(benutzer.id) });\n  }",
    erwartet: 'Der zweite Faktor: die Anmeldebremse greift am zweiten Schritt'
  },
  /* ---- Der zweite Faktor: die Wiederherstellungscodes ---- */
  {
    nr: '100', name: 'Die Wiederherstellungscodes liegen im Klartext in der Tabelle',
    datei: 'auth.js',
    suche: "    for (const k of klartexte) insCode.run(tokenHash(k), id);",
    ersatz: "    for (const k of klartexte) insCode.run(k, id);",
    erwartet: 'Der zweite Faktor: die Wiederherstellungscodes'
  },
  {
    nr: '101', name: 'Ein Wiederherstellungscode wird nicht verbraucht',
    datei: 'auth.js',
    suche: "    WHERE hash = ? AND user_id = ? AND benutzt_am IS NULL`);",
    ersatz: "    WHERE hash = ? AND user_id = ?`);",
    erwartet: 'Der zweite Faktor: die Wiederherstellungscodes'
  },
  {
    nr: '102', name: 'Es entstehen sieben Codes statt acht',
    datei: 'zweifaktor.js',
    suche: 'const WIEDER_ZAHL = 8;',
    ersatz: 'const WIEDER_ZAHL = 7;',
    erwartet: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    nr: '103', name: 'Die alten Codes bleiben beim Erneuern stehen',
    datei: 'auth.js',
    suche: "    db.prepare('DELETE FROM zweifaktor_codes WHERE user_id = ?').run(id);\n    // tokenHash() WIRD WIEDERVERWENDET",
    ersatz: "    // tokenHash() WIRD WIEDERVERWENDET",
    erwartet: 'Der zweite Faktor: die Wiederherstellungscodes'
  },
  /* ---- Der zweite Faktor: das Geheimnis ---- */
  {
    nr: '104', name: 'Das Geheimnis steht auch nach dem Bestaetigen in der Antwort',
    datei: 'server.js',
    suche: "    res.json(auth.schalteZweifaktorEin(req.benutzer.id, code, req.benutzer.id));",
    ersatz: "    res.json({ ...auth.schalteZweifaktorEin(req.benutzer.id, code, req.benutzer.id),\n" +
            "      geheim: db.prepare('SELECT geheim g FROM zweifaktor WHERE user_id = ?').get(req.benutzer.id).g });",
    erwartet: 'Der zweite Faktor: das Geheimnis kommt aus keiner Antwort'
  },
  {
    nr: '105', name: 'Die Karte "Zugang" gibt das Geheimnis mit heraus',
    datei: 'server.js',
    suche: "             zweifaktor: auth.zweifaktorStand(req.benutzer.id) });",
    ersatz: "             zweifaktor: { ...auth.zweifaktorStand(req.benutzer.id),\n" +
            "               geheim: (db.prepare('SELECT geheim g FROM zweifaktor WHERE user_id = ?').get(req.benutzer.id) || {}).g } });",
    erwartet: 'Der zweite Faktor: das Geheimnis kommt aus keiner Antwort'
  },
  {
    nr: '106', name: 'Ein zweiter Start ueberschreibt einen laufenden zweiten Faktor',
    datei: 'auth.js',
    suche: "  if (zweifaktorAn(id)) throw new Error('Der zweite Faktor ist bereits eingeschaltet.');",
    ersatz: "",
    erwartet: 'Der zweite Faktor: das Geheimnis kommt aus keiner Antwort'
  },
  /* ---- Der zweite Faktor: der Tokenweg und der Admin ---- */
  {
    /* DIE LUECKE, DIE DIESE RUNDE SCHLIESST: ohne diese Zeilen erzeugt ein
       Admin einen Ruecksetzlink fuer einen fremden Zugang, oeffnet ihn selbst
       und waere angemeldet -- am zweiten Faktor vorbei. */
    nr: '107', name: 'Der Tokenweg meldet wieder gleich an',
    datei: 'server.js',
    suche: "  if (auth.zweifaktorAn(ergebnis.id)) {\n    return res.json({\n      ok: true, username: ergebnis.username, zweifaktor: true,\n      ...auth.erzeugeAnmeldeAusweis(ergebnis.id)\n    });\n  }",
    ersatz: "",
    erwartet: 'Der zweite Faktor: der Tokenweg aus 0.8.80 fragt ebenfalls'
  },
  {
    nr: '108', name: 'Ein fremdes Passwort zu setzen raeumt den zweiten Faktor mit weg',
    datei: 'auth.js',
    suche: "async function setzeNeuesPasswort(benutzerId, neuesPasswort, wer) {",
    ersatz: "async function setzeNeuesPasswort(benutzerId, neuesPasswort, wer) {\n" +
            "  db.prepare('DELETE FROM zweifaktor WHERE user_id = ?').run(Number(benutzerId) || 0);",
    erwartet: 'Der zweite Faktor: ein Admin kommt an einen fremden nicht heran'
  },
  {
    /* NAEHME DAS SPERREN DEN FAKTOR MIT, waere "sperren und wieder freigeben"
       der Weg, an dem ein Admin einen FREMDEN zweiten Faktor abstreift. Der
       Rueckbau baut genau die Zeile ein, die neben den beiden daneben
       plausibel aussieht. */
    nr: '109', name: 'Sperren raeumt den zweiten Faktor mit weg',
    datei: 'auth.js',
    suche: "    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);\n    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(u.id);\n  }\n  protokolliere('zugang.status'",
    ersatz: "    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);\n    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(u.id);\n    db.prepare('DELETE FROM zweifaktor WHERE user_id = ?').run(u.id);\n  }\n  protokolliere('zugang.status'",
    erwartet: 'Der zweite Faktor: ein Admin kommt an einen fremden nicht heran'
  },
  {
    nr: '110', name: 'Ausschalten geht ohne Code',
    datei: 'server.js',
    suche: "  if (!await eigenesPasswortStimmt(req, res, passwort)) return;\n  if (!auth.pruefeZweitenFaktor(req.benutzer.id, code))\n    return res.status(403).json({ error: auth.ZWEITER_FAKTOR_ABSAGE });\n  auth.schalteZweifaktorAus(req.benutzer.id, req.benutzer.id);",
    ersatz: "  if (!await eigenesPasswortStimmt(req, res, passwort)) return;\n  auth.schalteZweifaktorAus(req.benutzer.id, req.benutzer.id);",
    erwartet: 'Der zweite Faktor: der Rundlauf'
  },
  {
    nr: '111', name: 'zugang.js schaltet den zweiten Faktor nicht mehr ab',
    datei: 'zugang.js',
    suche: "  auth.schalteZweifaktorAus(u.id, auth.VOM_WIRT);",
    ersatz: "  // auth.schalteZweifaktorAus(u.id, auth.VOM_WIRT);",
    erwartet: 'Der zweite Faktor: zugang.js auf dem Wirt'
  },
  /* ---- Der zweite Faktor: die zweite Bestaetigung ---- */
  {
    nr: '112', name: 'Die zweite Bestaetigung fragt den Code nicht mehr',
    datei: 'server.js',
    suche: "  if (auth.zweifaktorAn(req.benutzer.id) && !auth.pruefeZweitenFaktor(req.benutzer.id, code)) {",
    ersatz: "  if (false) {",
    erwartet: 'Der zweite Faktor: die zweite Bestaetigung fragt zusaetzlich'
  },
  {
    /* DIE ANDERE RICHTUNG -- und zwar an der OBERFLAECHE, nicht am Server.
       Wer ihn nicht eingeschaltet hat, soll von dieser Runde nichts merken;
       das Bestaetigungsfenster zeigt sein Codefeld deshalb nur, wenn der
       Server es sagt. Hier steht es immer da.
       AM SERVER GIBT ES DIESE RICHTUNG NICHT ALS RUECKBAU, und das ist
       entschieden: liesse man die zweite Bestaetigung auch ohne Faktor nach
       einem Code fragen, scheiterte sie fuer JEDEN Zugang -- Export, Import,
       Rollen, fremde Passwoerter. Der Lauf reisst dann in Gruppen ab, die mit
       dieser Runde nichts zu tun haben (Stolperstein 138), und ein Rueckbau,
       der die halbe Pruefung mitnimmt, sagt ohnehin nichts (Stolperstein 49).
       Die Zusage traegt dort die Pruefung "Ein Zugang OHNE zweiten Faktor
       bestaetigt weiterhin mit dem Passwort allein" -- sie wuerde bei genau
       dieser Aenderung rot. */
    nr: '113', name: 'Das Bestaetigungsfenster zeigt sein Codefeld immer',
    datei: 'public/app.js',
    suche: "    : ''), ZWEIFAKTOR);",
    ersatz: "    : ''), true);",
    erwartet: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    /* DIE REIHENFOLGE: PASSWORT, DANN CODE. Umgekehrt erfuehre jemand ohne das
       Passwort, ob am Zugang ein Faktor haengt. */
    nr: '114', name: 'Der Code wird VOR dem Passwort geprueft',
    datei: 'server.js',
    suche: "  const zeile = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.benutzer.id);\n  if (!zeile || !await auth.pruefePasswort(String(passwort || ''), zeile.password_hash)) {",
    ersatz: "  if (auth.zweifaktorAn(req.benutzer.id) && !auth.pruefeZweitenFaktor(req.benutzer.id, code))\n" +
            "    return res.status(403).json({ error: auth.ZWEITER_FAKTOR_ABSAGE, zweifaktor: true });\n" +
            "  const zeile = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.benutzer.id);\n  if (!zeile || !await auth.pruefePasswort(String(passwort || ''), zeile.password_hash)) {",
    erwartet: 'Der zweite Faktor: die zweite Bestaetigung fragt zusaetzlich'
  },
  /* ---- Der zweite Faktor: die Tabellen und die Oberflaeche ---- */
  {
    /* GEZIELT AUF DEN INDEX UND NICHT AUF DIE TABELLEN. Ein Rueckbau, der die
       DDL einer der beiden Tabellen wegnimmt, macht den Server
       UNSTARTBAR -- auth.js bereitet seine Anweisungen beim Laden vor, und
       "no such table" beendet den Prozess. Der Lauf risse dann ab, statt rot
       zu werden (Stolperstein 138). Die Zusage "eine fehlende TABELLE waechst
       nach" haelt der Pruefstand deshalb an einem echten Versuch statt an einer
       Behauptung: er entfernt beide von Hand aus einer bestehenden Anlage,
       startet einmal und sieht nach. Der INDEX daneben laesst sich gefahrlos
       zuruecknehmen und traegt dieselbe Aussage ueber CREATE ... IF NOT EXISTS. */
    nr: '115', name: 'Der Index auf zweifaktor_codes wird nicht mehr angelegt',
    datei: 'db.js',
    suche: 'CREATE INDEX IF NOT EXISTS idx_zweifaktor_codes_user ON zweifaktor_codes(user_id);',
    ersatz: '',
    erwartet: 'Der zweite Faktor: die Tabellen legen sich selbst an'
  },
  {
    nr: '116', name: 'Der Zustand faellt aus der Antwort der Karte "Zugang"',
    datei: 'server.js',
    suche: "             zweifaktor: auth.zweifaktorStand(req.benutzer.id) });",
    ersatz: "             });",
    erwartet: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '117', name: 'Die Zahl der uebrigen Wiederherstellungscodes faellt weg',
    datei: 'public/app.js',
    suche: "          <strong>noch ${stand.codesOffen} von ${stand.codesGesamt}</strong>",
    ersatz: "          <strong>vorhanden</strong>",
    erwartet: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    /* DER SATZ, DER DEN KASTEN TRAEGT. Codes, die einmal gezeigt werden, ohne
       dass es dabeisteht, sind ein Zettel, den niemand abschreibt -- und beim
       naechsten Aufbau der Karte sind sie fort. Derselbe Ernst wie beim
       Einladungslink. */
    nr: '118', name: 'Der Kasten sagt nicht mehr, dass die Codes nicht wiederkommen',
    datei: 'public/app.js',
    suche: "    kasten.innerHTML = `<strong>Deine ${codes.length} Wiederherstellungscodes — sie werden\n      nur dieses eine Mal angezeigt.</strong>",
    ersatz: "    kasten.innerHTML = `<strong>Deine ${codes.length} Wiederherstellungscodes.</strong>",
    erwartet: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '122', name: 'Die Liste der Wiederherstellungscodes wird um einen gekuerzt',
    datei: 'public/app.js',
    suche: "      <div class=\"zf-codeliste\">${codes.map(c => `<span>${esc(c)}</span>`).join('')}</div>",
    ersatz: "      <div class=\"zf-codeliste\">${codes.slice(1).map(c => `<span>${esc(c)}</span>`).join('')}</div>",
    erwartet: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '119', name: 'Das Bestaetigungsfenster zeigt das Codefeld nie',
    datei: 'public/app.js',
    suche: "    : ''), ZWEIFAKTOR);",
    ersatz: "    : ''), false);",
    erwartet: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '120', name: 'Die Anmeldeseite geht ueber den zweiten Schritt hinweg',
    datei: 'public/app.js',
    suche: "      if (j.zweifaktor) return showZweiterFaktor(j.ausweis);",
    ersatz: "",
    erwartet: 'Die Anmeldeseite: der zweite Schritt'
  },
  {
    nr: '121', name: 'F_ROUTEN kennt den zweiten Schritt der Anmeldung nicht',
    datei: 'pruefung.js',
    suche: "    ['POST',   '/api/login/zwei',                'offen'],",
    ersatz: "",
    erwartet: 'Der Waechter ueber den Quelltext'
  },
  /* ---- Die Volltextsuche: der Weg ueberhaupt ---- */
  {
    nr: '124', name: 'Der Parameter q wird nicht mehr gelesen',
    datei: 'server.js',
    suche: "  const begriff = volltextBegriff(req.query.q);",
    ersatz: "  const begriff = '';",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '125', name: 'searchText steht wieder in der Antwort',
    datei: 'server.js',
    suche: "    delete it.description;",
    ersatz: "    it.searchText = (it.title || '').toLowerCase();\n    delete it.description;",
    erwartet: 'searchText ist fort, und sonst nichts'
  },
  /* ---- Die sieben Quellen, einzeln ----
     JEDES GLIED WIRD WIRKUNGSLOS GEMACHT, NICHT ENTFERNT: `0 > 1` an seiner
     Stelle laesst die ODER-Kette ganz und nimmt genau eine Quelle heraus. Ein
     geloeschtes Glied riss die Kette auseinander, und SQLite scheiterte an der
     Abfrage -- der Lauf faerbte dann nicht eine Pruefung rot, er stuerzte
     (Stolperstein 138). */
  {
    nr: '126', name: 'Die Suche sieht den Titel nicht mehr an',
    datei: 'server.js',
    suche: "  WHERE instr(kkl(i.title), :q) > 0",
    ersatz: "  WHERE 0 > 1",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '127', name: 'Und die Beschreibung nicht',
    datei: 'server.js',
    suche: "     OR instr(kkl(i.description), :q) > 0",
    ersatz: "     OR 0 > 1",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '128', name: 'Und den Namen der Kategorie nicht',
    datei: 'server.js',
    suche: "     OR instr(kkl(c.name), :q) > 0",
    ersatz: "     OR 0 > 1",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '129', name: 'Und die Tags am Eintrag nicht',
    datei: 'server.js',
    suche: "                WHERE it.item_id = i.id AND instr(kkl(t.name), :q) > 0)",
    ersatz: "                WHERE it.item_id = i.id AND 0 > 1)",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '130', name: 'Und die Tags an den Testtagen nicht',
    datei: 'server.js',
    suche: "                WHERE d.item_id = i.id AND instr(kkl(tt.name), :q) > 0)",
    ersatz: "                WHERE d.item_id = i.id AND 0 > 1)",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '131', name: 'Und die Adressen der Links nicht',
    datei: 'server.js',
    suche: "     OR EXISTS (SELECT 1 FROM links l WHERE l.item_id = i.id AND instr(kkl(l.url), :q) > 0)",
    ersatz: "     OR EXISTS (SELECT 1 FROM links l WHERE l.item_id = i.id AND 0 > 1)",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '132', name: 'Und die Kommentartexte nicht',
    datei: 'server.js',
    suche: "     OR EXISTS (SELECT 1 FROM comments k WHERE k.item_id = i.id AND instr(kkl(k.text), :q) > 0)",
    ersatz: "     OR EXISTS (SELECT 1 FROM comments k WHERE k.item_id = i.id AND 0 > 1)",
    erwartet: 'Die Volltextsuche'
  },
  /* ---- Die Schreibung und die Wildcards ---- */
  {
    /* GENAU DIE UNICODE-HAELFTE FAELLT WEG, nicht die Kleinschreibung selbst:
       ASCII wird weiter gefaltet, Umlaute nicht -- also genau das Verhalten,
       das SQLite mit lower() und LIKE von Haus aus hat. Ein Rueckbau, der
       toLowerCase() ganz entfernte, machte auch jede ASCII-Suche rot und sagte
       damit nichts mehr ueber die Umlaute. */
    nr: '133', name: 'Die Kleinschreibung faltet nur noch ASCII',
    datei: 'db.js',
    suche: "db.function('kkl', { deterministic: true }, (s) => (s === null ? '' : String(s).toLowerCase()));",
    ersatz: "db.function('kkl', { deterministic: true }, (s) => (s === null ? '' : String(s).replace(/[A-Z]/g, (c) => c.toLowerCase())));",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '134', name: 'Der Titel wird wieder ueber LIKE gesucht -- Wildcards wirken',
    datei: 'server.js',
    suche: "  WHERE instr(kkl(i.title), :q) > 0",
    ersatz: "  WHERE kkl(i.title) LIKE '%' || :q || '%'",
    erwartet: 'Die Volltextsuche'
  },
  {
    /* DIE LISTE VERSCHWEIGT ETWAS, DAS DIE SUCHE ZEIGT -- die Richtung, auf
       die es ankommt. Der Papierkorb steht gar nicht in `items`; die schaerfste
       erreichbare Lage ist deshalb eine Liste, die weniger zeigt als die
       Suche. */
    nr: '135', name: 'Die Liste ohne Begriff verschweigt die abgelehnten Eintraege',
    datei: 'server.js',
    suche: "  let rows = qAlleItems.all();",
    ersatz: "  let rows = qAlleItems.all();\n  if (!volltextBegriff(req.query.q)) rows = rows.filter(r => !r.rejected);",
    erwartet: 'Die Volltextsuche'
  },
  /* ---- testDays und die Zeitleiste ---- */
  {
    nr: '136', name: 'testDays kommt wieder immer mit',
    datei: 'server.js',
    suche: "    if (zeitleiste) it.testDays = qTestDays(it.id, req.benutzer.id, karte);",
    ersatz: "    it.testDays = qTestDays(it.id, req.benutzer.id, karte);",
    erwartet: 'testDays haengt an der Zeitleiste'
  },
  {
    nr: '137', name: 'testDays fehlt immer, auch mit eingeschalteter Zeitleiste',
    datei: 'server.js',
    suche: "    if (zeitleiste) it.testDays = qTestDays(it.id, req.benutzer.id, karte);",
    ersatz: "    if (false) it.testDays = qTestDays(it.id, req.benutzer.id, karte);",
    erwartet: 'testDays haengt an der Zeitleiste'
  },
  /* ---- Die Suche am Bildschirm ---- */
  {
    nr: '138', name: 'Der Debounce faellt weg -- jeder Anschlag fragt',
    datei: 'public/app.js',
    suche: "  suchUhr = setTimeout(() => { suchUhr = null; sucheAusfuehren(); }, SUCH_VERZOEGERUNG);",
    ersatz: "  sucheAusfuehren();",
    erwartet: 'Die Suche fragt den Server'
  },
  {
    nr: '139', name: 'Die Reihenfolge der Antworten wird nicht mehr geachtet',
    datei: 'public/app.js',
    suche: "    if (lauf !== suchLauf) return;          // eine neuere Anfrage ist unterwegs",
    ersatz: "",
    erwartet: 'Die Suche fragt den Server'
  },
  {
    nr: '140', name: 'Bei gescheiterter Suche wird die Liste leer',
    datei: 'public/app.js',
    suche: "    state.suchLaeuft = false; state.suchFehler = true;",
    ersatz: "    state.suchLaeuft = false; state.suchFehler = true; state.items = [];",
    erwartet: 'Die Suche fragt den Server'
  },
  {
    nr: '141', name: 'Die Zaehlzeile nennt die Trefferzahl als Bestand',
    datei: 'public/app.js',
    suche: "    let z = `${state.bestand} ${vSache(state.bestand)}`",
    ersatz: "    let z = `${state.items.length} ${vSache(state.items.length)}`",
    erwartet: 'Die Suche fragt den Server'
  },
  {
    nr: '142', name: 'Das Leeren holt den Bestand neu vom Server',
    datei: 'public/app.js',
    suche: "    state.items = state.alle;\n    state.suchLaeuft = false; state.suchFehler = false;",
    ersatz: "    state.items = await api('GET', '/api/items');\n    state.suchLaeuft = false; state.suchFehler = false;",
    erwartet: 'Die Suche fragt den Server'
  },
  /* ---- Die gespeicherten Ansichten ---- */
  {
    nr: '143', name: 'Die Ansichten sind kein persoenlicher Schluessel mehr',
    datei: 'server.js',
    suche: "                                'zuletztGesehen', 'ansichten'];",
    ersatz: "                                'zuletztGesehen'];",
    erwartet: 'Gespeicherte Ansichten'
  },
  {
    nr: '144', name: 'Der Deckel fuer Ansichten faellt weg',
    datei: 'server.js',
    suche: "    if (ein.length > ANSICHTEN_DECKEL)",
    ersatz: "    if (false)",
    erwartet: 'Gespeicherte Ansichten'
  },
  {
    nr: '145', name: 'Zwei Ansichten duerfen wieder denselben Namen tragen',
    datei: 'server.js',
    suche: "      if (namen.has(schluessel))",
    ersatz: "      if (false)",
    erwartet: 'Gespeicherte Ansichten'
  },
  {
    nr: '146', name: 'Die Ansichten werden geprueft, NACHDEM filters geschrieben ist',
    datei: 'server.js',
    suche: "  let ansichtenText = null;",
    ersatz: "  let ansichtenText = null;\n  if (req.body.filters !== undefined)\n    putUserSetting(req.benutzer.id, 'filters', JSON.stringify(req.body.filters));",
    erwartet: 'Gespeicherte Ansichten'
  },
  {
    nr: '147', name: 'Das Speichern einer Ansicht raeumt die gemerkte Stellung weg',
    datei: 'server.js',
    suche: "  if (ansichtenText !== null)\n    putUserSetting(req.benutzer.id, 'ansichten', ansichtenText);",
    ersatz: "  if (ansichtenText !== null) {\n    putUserSetting(req.benutzer.id, 'ansichten', ansichtenText);\n    putUserSetting(req.benutzer.id, 'filters', 'null');\n  }",
    erwartet: 'Gespeicherte Ansichten'
  },
  {
    nr: '148', name: 'Der Suchbegriff faellt aus der gespeicherten Ansicht',
    datei: 'public/app.js',
    suche: "const ansichtAusZustand = () => ({ filters: { ...state.filters }, q: state.search.trim() });",
    ersatz: "const ansichtAusZustand = () => ({ filters: { ...state.filters }, q: '' });",
    erwartet: 'Gespeicherte Ansichten in der Oberflaeche'
  },
  {
    /* SEIT 0.13.0 TRAEGT DER FILTER EINE LISTE. Der Rueckbau nimmt dieselbe
       Klemme weg wie vorher: eine Nummer, die es nicht mehr gibt, bliebe
       stehen und filterte auf eine Kategorie, die niemand mehr hat. */
    nr: '149', name: 'Eine geloeschte Kategorie bleibt in der angewandten Ansicht stehen',
    datei: 'public/app.js',
    suche: "  f.categoryIds = [...new Set(f.categoryIds)].filter(v =>\n    v === KATEGORIE_OHNE || state.categories.some(c => c.id === v));",
    ersatz: "  f.categoryIds = [...new Set(f.categoryIds)];",
    erwartet: 'Gespeicherte Ansichten in der Oberflaeche'
  },
  /* ---- Die Doppelerkennung ---- */
  {
    nr: '150', name: 'Der Titelvergleich achtet wieder auf Gross- und Kleinschreibung',
    datei: 'public/app.js',
    suche: "const titelKern = (t) => String(t || '').toLowerCase().replace(",
    ersatz: "const titelKern = (t) => String(t || '').replace(",
    erwartet: 'Doppelte Eintraege beim Anlegen'
  },
  {
    nr: '151', name: 'Der Hinweis greift erst ab acht Zeichen',
    datei: 'public/app.js',
    suche: "const AEHNLICH_FENSTER = 4;",
    ersatz: "const AEHNLICH_FENSTER = 8;",
    erwartet: 'Doppelte Eintraege beim Anlegen'
  },
  {
    nr: '152', name: 'Der Hinweis vergleicht nur die Trefferliste statt des Bestands',
    datei: 'public/app.js',
    suche: "  for (const it of state.alle) {",
    ersatz: "  for (const it of state.items) {",
    erwartet: 'Doppelte Eintraege beim Anlegen'
  },
  /* ---- Die Marke ---- */
  {
    nr: '153', name: 'Die durchsichtige Fassung traegt wieder Gold',
    datei: 'public/marke-dunkel.svg',
    suche: '<path d="M8 16 H24" stroke="#ff7a1a"/>',
    ersatz: '<path d="M8 16 H24" stroke="#ffc531"/>',
    erwartet: 'Die Marke der Anlage'
  },
  {
    /* DIESELBE ZEILE IN DER ANDEREN DATEI, und das ist kein Doppel: die
       beiden liegen getrennt, und wer eine anfasst, laesst die andere
       zurueck. Genau dafuer stehen hier zwei Rueckbauten. */
    nr: '154', name: 'Die Fassung mit Kachel traegt wieder Gold',
    datei: 'public/favicon.svg',
    suche: '<path d="M8 16 H24" stroke="#ff7a1a"/>',
    ersatz: '<path d="M8 16 H24" stroke="#ffc531"/>',
    erwartet: 'Die Marke der Anlage'
  },
  {
    nr: '155', name: 'Das viewBox umschliesst wieder die Kachel statt der Farbe',
    datei: 'public/marke-dunkel.svg',
    suche: 'viewBox="6.5 4.5 19 23" width="19" height="23"',
    ersatz: 'viewBox="0 0 32 32" width="32" height="32"',
    erwartet: 'Die Marke der Anlage'
  },
  {
    nr: '156', name: 'Die Hoehe der Marke steht wieder in Pixel',
    datei: 'public/style.css',
    suche: '.brand .marke { height: 3.1rem; }',
    ersatz: '.brand .marke { height: 46px; }',
    erwartet: 'Die Marke der Anlage'
  },
  {
    nr: '157', name: 'Das Markup gibt die Marke wieder quadratisch an',
    datei: 'public/app.js',
    suche: '`<img class="marke" src="marke-dunkel.svg" width="${Math.round(s * 19 / 23)}" height="${s}" alt="">`;',
    ersatz: '`<img class="marke" src="marke-dunkel.svg" width="${s}" height="${s}" alt="">`;',
    erwartet: 'Die Marke der Anlage'
  },
  /* ---- Telefon und Tablett (0.12.0) ----
     SECHS RUECKBAUTEN UND NICHT MEHR. Sie sind auf die tragenden Zusagen der
     Runde gerichtet und ersetzen den vollen Lauf nicht -- was sie decken und
     was nicht, steht im Aenderungsprotokoll 0.12.0, Abschnitt 5.
     DREI DAVON GREIFEN AM STYLESHEET UND KEINE AM LAYOUT: der Prueflauf
     rechnet auf jsdom kein Layout, er kann nur pruefen, dass eine Regel
     dasteht. Ein Rueckbau, der eine Regel entfernt, ist damit genau das, was
     sich hier belegen laesst -- und mehr behauptet die Pruefung auch nicht. */
  {
    nr: '158', name: 'Die Spalte des Systembereichs darf sich wieder aufblaehen',
    datei: 'public/style.css',
    suche: '.sys-grid { grid-template-columns: minmax(0, 1fr); gap: 0; }',
    ersatz: '.sys-grid { grid-template-columns: 1fr; gap: 0; }',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    nr: '159', name: 'Die Bedingung in app.js laeuft von der im Stylesheet weg',
    datei: 'public/app.js',
    suche: "const SCHMAL = '(max-width: 700px), (max-height: 500px) and (max-width: 960px)';",
    ersatz: "const SCHMAL = '(max-width: 640px)';",
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    nr: '160', name: 'Der Behaelter des Menues steht auch am breiten Schirm im Weg',
    datei: 'public/style.css',
    suche: '.mast-rest { display: contents; }',
    ersatz: '.mast-rest { display: flex; }',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    nr: '161', name: 'Die Seite bekommt die Aussparung nicht mehr',
    datei: 'public/index.html',
    suche: '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">',
    ersatz: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    nr: '162', name: 'Der Blaetterpfeil verschwindet auf dem Finger wieder',
    datei: 'public/style.css',
    suche: '@media (hover: none) { .vnav { opacity: 1; } }',
    ersatz: '',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* DER ERSTE ANLAUF DIESES RUECKBAUS HAT DEN LAUF ABGERISSEN, und das belegt
     nichts (Stolpersteine 138, 161 und 170). Er nahm dem Menuezeichen seine
     Kennung; `document.getElementById('menue')` gab daraufhin null zurueck, und
     `menue.onclick = ...` warf, BEVOR eine einzige Zusicherung lief -- die
     ganze Prueflage fiel zusammen, und der Bericht sagte "abgerissen" statt
     eine Zeile rot zu faerben.
     ER GREIFT DESHALB JETZT DA, WO DIE ZUSICHERUNG HINSIEHT: er vertauscht in
     der Tafel den Namen des Angemeldeten mit dem Abmelden. Das wirft nichts,
     und es trifft ZWEI Zusagen auf einmal -- die Reihenfolge der vier in der
     Tafel und die aeltere Zeile, dass die Angabe unmittelbar vor dem Knopf
     steht, den sie erklaert. */
  {
    nr: '163', name: 'Der Name des Angemeldeten rutscht hinter das Abmelden',
    datei: 'public/app.js',
    suche: '        <span class="hint wer" id="wer">Angemeldet als ${esc(NAME)}</span>\n        <button class="btn btn-ghost btn-sm" id="out">Abmelden</button>',
    ersatz: '        <button class="btn btn-ghost btn-sm" id="out">Abmelden</button>\n        <span class="hint wer" id="wer">Angemeldet als ${esc(NAME)}</span>',
    erwartet: 'Mehrbenutzer-Anzeigen in der Oberflaeche'
  },
  /* DAS KREUZ AN DER KACHEL WAR EIN FUND AUS DEM FELD, kein Einfall am
     Schreibtisch: beim Durchwischen der Kachelleiste hat der Daumen es
     getroffen und ein Foto geloescht. Es ist auf dem Finger weg -- und weil
     ein Weglassen sich nicht von einem Vergessen unterscheiden laesst, muss
     der Rueckbau es zurueckholen koennen. */
  {
    nr: '164', name: 'Das Kreuz kehrt auf die Vorschaukachel zurueck',
    datei: 'public/style.css',
    suche: '@media (hover: none) { .thumb .del { display: none; } }',
    ersatz: '',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* Und der Abstand, der das Wegnehmen vom Einstellen trennt. Ohne ihn
     stehen Ausschnitt und Papierkorb Schulter an Schulter -- genau die Lage,
     die das Kreuz an der Kachel so gefaehrlich gemacht hat. */
  {
    nr: '165', name: 'Der Papierkorb rueckt an die Einstellknoepfe heran',
    datei: 'public/style.css',
    suche: '.vweg { margin-left: 14px; }',
    ersatz: '.vweg { margin-left: 0; }',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* UNSICHTBAR IST NICHT DASSELBE WIE UNANTASTBAR, und genau darauf kam der
     Befund aus dem Betrieb heraus. Dieser Rueckbau macht das Kreuz an der
     Kachel wieder durchsichtig statt es herauszunehmen: auf einem
     Bildschirmfoto sieht das Ergebnis richtig aus, unter dem Daumen ist es
     der alte Fehler. Wenn dafuer keine Zeile rot wird, sichert der Pruefstand
     nur das Aussehen und nicht das Verhalten. */
  {
    nr: '166', name: 'Das Kreuz an der Kachel wird nur durchsichtig, nicht herausgenommen',
    datei: 'public/style.css',
    suche: '@media (hover: none) { .thumb .del { display: none; } }',
    ersatz: '@media (hover: none) { .thumb .del { opacity: 0; } }',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* Die Rasterregel faellt weg -- die Kachelreihe steht wieder als
     umbrechender Flexkasten da, mit fester Kachelbreite und dem Streifen
     rechts. */
  {
    nr: '167', name: 'Die Vorschaureihe faellt auf den umbrechenden Kasten zurueck',
    datei: 'public/style.css',
    suche: '  .thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); }\n',
    ersatz: '',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* auto-fit statt auto-fill: mit zwoelf Fotos faellt das gar nicht auf, mit
     zweien werden aus zwei Kacheln zwei Kachelplatten. Ein Rueckbau, den man
     an einem vollen Eintrag nicht sieht -- deshalb steht er hier. */
  {
    nr: '168', name: 'Die leeren Spalten klappen zusammen (auto-fit)',
    datei: 'public/style.css',
    suche: 'grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));',
    ersatz: 'grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* Die Kachel behaelt ihre feste Hoehe, waehrend die Breite rechnet: aus dem
     Quadrat wird ein liegendes Rechteck, und object-fit beschneidet das Foto
     anders. Sieht nicht kaputt aus, ist aber falsch. */
  {
    nr: '169', name: 'Die Kachel behaelt ihre feste Hoehe und wird zum Rechteck',
    datei: 'public/style.css',
    suche: '  .thumb { width: auto; height: auto; aspect-ratio: 1/1; }\n',
    ersatz: '',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* UND EINER IN DIE GEGENRICHTUNG: die Grundregel der Kachel wird angefasst.
     Sie gilt am Schreibtisch, und dort soll sich nichts aendern -- ein
     Rueckbau, der die 62 Pixel verschiebt, muss auffallen. Sonst haenge die
     Zusage allein an einem Pixelvergleich von Hand, und der faerbt nichts
     rot. */
  {
    nr: '170', name: 'Die Grundgroesse der Kachel verrutscht',
    datei: 'public/style.css',
    suche: '  width: 62px; height: 62px; border-radius: 8px; overflow: hidden;',
    ersatz: '  width: 66px; height: 66px; border-radius: 8px; overflow: hidden;',
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* ---- 0.12.3: der Export sagt seine Groesse an ---- */
  /* DIE SIEBEN HIER ZIELEN AUF DIE RECHNUNG UND AUF DIE KLEMME, nicht auf die
     Anzeige daneben: eine Zahl, die falsch gerechnet wird, faellt am
     Bildschirm nicht auf -- sie sieht genauso aus wie eine richtige. */
  {
    nr: '171', name: 'Der Umschlag faellt weg — ein Export ohne Fotos waere null Bytes gross',
    datei: 'server.js',
    suche: '  return t.fotos + t.videos + t.anhaenge + t.kommentarbilder + austauschUmschlagBytes(itemId);',
    ersatz: '  return t.fotos + t.videos + t.anhaenge + t.kommentarbilder;',
    erwartet: 'Die Exportgroesse sagt sich an'
  },
  {
    /* DIE SUMME UEBER ALLE BLOB-SPALTEN IST DIE NAHELIEGENDE UND FALSCHE
       RECHNUNG: photos.thumb geht nie in die Datei. Faellt hier keine
       Pruefung rot, warnt die Anlage irgendwann zu frueh -- und eine Warnung,
       die zu frueh kommt, wird weggeklickt. */
    nr: '172', name: 'Die Vorschaubilder werden mitgezaehlt, obwohl sie nie mitgehen',
    datei: 'server.js',
    suche: "      `SELECT COALESCE(SUM(length(data)),0) n FROM photos WHERE art != 'video'${und('item_id')}`));",
    ersatz: "      `SELECT COALESCE(SUM(length(data) + COALESCE(length(thumb),0)),0) n FROM photos WHERE art != 'video'${und('item_id')}`));",
    erwartet: 'Videos: Kennzahlen und Austausch'
  },
  {
    nr: '173', name: 'Der Export baut erst und sagt danach ab',
    datei: 'server.js',
    suche: '  const gross = austauschBytes(null, schalter);\n  if (!alsTeil && gross > AUSTAUSCH_MAX)',
    ersatz: '  const gross = 0;\n  if (!alsTeil && gross > AUSTAUSCH_MAX)',
    erwartet: 'Videos: Kennzahlen und Austausch'
  },
  {
    nr: '174', name: 'Der Warnwert liegt auf der Grenze statt darunter',
    datei: 'server.js',
    suche: 'const AUSTAUSCH_WARN = 300 * 1024 * 1024;',
    ersatz: 'const AUSTAUSCH_WARN = AUSTAUSCH_MAX;',
    erwartet: 'Die Exportgroesse sagt sich an'
  },
  {
    /* DER VIDEOSCHALTER HAENGT AM FOTOSCHALTER, wie in eintragAlsPaket(). Ohne
       diese Bindung naennte die Karte eine Groesse, die kein Knopf erzeugen
       kann -- und das faellt an keiner einzelnen Zahl auf. */
    nr: '175', name: 'Die Videos zaehlen auch ohne Fotos mit',
    datei: 'public/app.js',
    suche: '    + (s.mitFotos && s.mitVideos ? (ex.videos || 0) : 0)',
    ersatz: '    + (s.mitVideos ? (ex.videos || 0) : 0)',
    erwartet: 'Die Exportgroesse sagt sich an'
  },
  /* ---- 0.12.3: die Anzeige zieht nach ---- */
  {
    nr: '176', name: 'Die Kachel zeichnet wieder alles, auch was niemand sieht',
    datei: 'public/style.css',
    suche: '  content-visibility: auto;\n  contain-intrinsic-size: auto 400px;',
    ersatz: '  contain-intrinsic-size: auto 400px;',
    erwartet: 'Die Anzeige zieht nach — 0.12.3'
  },
  {
    /* OHNE DAS WORT auto GILT DIE SCHAETZUNG FUER IMMER, und der Rollbalken
       springt bei jeder Kachel, die anders hoch ist als geschaetzt. Der
       Rueckbau nimmt genau dieses Wort weg -- die Regel bleibt sonst stehen
       und saehe von aussen unveraendert aus. */
    nr: '177', name: 'Die geschaetzte Kachelhoehe gilt fuer immer statt nur bis zum ersten Zeichnen',
    datei: 'public/style.css',
    suche: '  contain-intrinsic-size: auto 400px;',
    ersatz: '  contain-intrinsic-size: 400px;',
    erwartet: 'Die Anzeige zieht nach — 0.12.3'
  },
  {
    nr: '178', name: 'Der angepinnte Bericht traegt wieder zwei Farben',
    datei: 'public/style.css',
    suche: '.cmt.pinned.bericht {\n  border-top-color: var(--accent);',
    ersatz: '.cmt.pinned.bericht {\n  border-top-color: var(--gold-line);',
    erwartet: 'Die Anzeige zieht nach — 0.12.3'
  },
  {
    /* DER KASTEN STEHT IM AUFBAU VOR DER WOLKE, und daran haengt alles: die
       Zeile bricht um, und ein Geschwister DAHINTER rutscht auf eine eigene
       Zeile. Genau das war der Befund. Die CSS-Regel bliebe dabei stehen und
       saehe richtig aus. */
    /* UMGEDREHT SEIT 0.13.0: der Verweis steht jetzt HINTER der Wolke, und das
       ist die neue Wahrheit. Der Rueckbau schiebt ihn wieder davor -- dann
       stimmt die Reihenfolge nicht mehr, und "mehr" stuende vor dem, was es
       aufklappt. */
    nr: '179', name: 'Der Verweis rutscht wieder VOR die Wolke',
    datei: 'public/app.js',
    suche: '  if (rechts.childElementCount) r3.appendChild(rechts);',
    ersatz: '  if (rechts.childElementCount) r3.insertBefore(rechts, g3);',
    erwartet: 'Die Anzeige zieht nach — 0.12.3'
  },
  {
    /* NICHT `zaehle('task')` ALS ERSATZ: das ist DASSELBE. `aufgaben` zaehlt
       task UND done, `fertig` zaehlt done -- die Differenz IST die Zahl der
       task-Zeilen. Der erste Anlauf hat genau das versucht und blieb stumm,
       weil er gar nichts veraenderte. **Ein Rueckbau, der rechnerisch ein
       No-op ist, sieht aus wie eine Luecke im Pruefstand und ist keine.**
       Zurueckgebaut wird deshalb die Verschachtelung selbst: die Gesamtzahl
       statt der offenen. */
    nr: '180', name: 'Die Klammer nennt die Gesamtzahl statt der offenen',
    datei: 'public/app.js',
    suche: "    + (fertig ? ` (${aufgaben - fertig} offen, ${fertig} ${V.aufgabeErledigt})` : ''));",
    ersatz: "    + (fertig ? ` (${aufgaben} offen, ${fertig} ${V.aufgabeErledigt})` : ''));",
    erwartet: 'Kommentare in der Oberflaeche'
  },
  {
    /* DAS FELD NIMMT BEIDE FORMEN. Eine Beschriftung, die eine davon
       ausschliesst, ist fuer die Haelfte der Faelle falsch -- und sie sieht
       dabei vollkommen unauffaellig aus. */
    nr: '181', name: 'Das Codefeld fragt wieder nach der App statt nach dem Verfahren',
    datei: 'public/app.js',
    suche: '<label>Code des zweiten Faktors</label>',
    ersatz: '<label>Code aus deiner App</label>',
    erwartet: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '182', name: 'Der Sprungknopf springt, klappt den Block aber nicht auf',
    datei: 'public/app.js',
    suche: "    if (BLOECKE.zu.includes('kommentare')) {",
    ersatz: '    if (false) {',
    erwartet: 'Kommentare in der Oberflaeche'
  },
  /* ---- 0.12.4: der Export in Teilen ---- */
  /* SIE ZIELEN AUF DEN SCHNITT UND AUF DIE SCHRANKE. Ein Schnitt, der einen
     Eintrag doppelt oder gar nicht vergibt, faellt am Bildschirm nicht auf --
     erst beim Einspielen, und dann ist der Bestand schon falsch. */
  {
    nr: '183', name: 'Der Schnitt laesst die Fenster ueberlappen',
    datei: 'server.js',
    suche: '    offen.bis = z.id;\n    offen.anzahl++;',
    ersatz: '    offen.bis = z.id + 1;\n    offen.anzahl++;',
    erwartet: 'Der Export in Teilen'
  },
  {
    /* OHNE DEN UMSCHLAG JE TEIL waere die Rechnung zu klein: jeder Teil traegt
       Titel, Zeitstempel und die ganze Kriterienliste noch einmal. Bei vielen
       kleinen Teilen ist das kein Rundungsfehler. */
    nr: '184', name: 'Der Umschlag je Teil faellt aus der Rechnung',
    datei: 'server.js',
    suche: '      offen = { nr: teile.length + 1, von: z.id, bis: z.id, anzahl: 0, bytes: grund };',
    ersatz: '      offen = { nr: teile.length + 1, von: z.id, bis: z.id, anzahl: 0, bytes: 0 };',
    erwartet: 'Der Export in Teilen'
  },
  {
    /* EIN EINTRAG, DER IN KEINEN TEIL PASST, DARF NICHT STILL VERSCHWINDEN.
       Dieser Rueckbau uebergeht ihn wortlos -- genau der Ausgang, gegen den
       die Meldung gebaut ist. */
    nr: '185', name: 'Ein zu grosser Eintrag wird still uebergangen',
    datei: 'server.js',
    suche: "    if (grund + b > AUSTAUSCH_MAX) { zuGross.push({ id: z.id, titel: z.titel, bytes: grund + b }); continue; }",
    ersatz: '    if (grund + b > AUSTAUSCH_MAX) { continue; }',
    erwartet: 'Der Export in Teilen'
  },
  {
    /* EINE HALBE FENSTERANGABE MUSS EIN FEHLER SEIN. Wer `von` schickt und
       `bis` vergisst, bekaeme sonst stillschweigend den ganzen Bestand -- und
       merkte es erst an der Dateigroesse. */
    nr: '186', name: 'Eine halbe Fensterangabe geht als Vollexport durch',
    datei: 'server.js',
    suche: '  if (alsTeil && (von === null || bis === null || teil === null || teile === null))',
    ersatz: '  if (false)',
    erwartet: 'Der Export in Teilen'
  },
  {
    /* AUS N SCHRANKEN WIRD SONST EINE. Die Freigabe haengt an Sitzung, Zweck
       UND Ziel; faellt das Ziel weg, laesst eine einzige Bestaetigung jeden
       Teil durch. */
    nr: '187', name: 'Eine Freigabe gilt wieder fuer alle Teile',
    datei: 'server.js',
    suche: "             : (req.query && req.query.teil !== undefined ? req.query.teil : null);",
    ersatz: '             : null;',
    erwartet: 'Der Export in Teilen'
  },
  {
    /* DER TEIL MUSS EIN FENSTER LESEN UND NICHT ALLES. Ohne die Klemme traegt
       jeder Teil den ganzen Bestand -- fuenf Dateien, jede vollstaendig, und
       der Import legte danach alles fuenfmal an. */
    nr: '188', name: 'Jeder Teil traegt den ganzen Bestand',
    datei: 'server.js',
    suche: "    ? db.prepare('SELECT * FROM items WHERE id BETWEEN ? AND ? ORDER BY id').all(von, bis)",
    ersatz: "    ? db.prepare('SELECT * FROM items ORDER BY id').all()",
    erwartet: 'Der Export in Teilen'
  },
  {
    nr: '189', name: 'Die Teilgroesse laesst sich ueber den Warnwert stellen',
    datei: 'server.js',
    suche: '  const zielGroesse = Math.min(AUSTAUSCH_WARN,',
    ersatz: '  const zielGroesse = Math.min(Number.MAX_SAFE_INTEGER,',
    erwartet: 'Der Export in Teilen'
  },
  {
    /* DER DATEINAME IST DIE EINZIGE STELLE, an der ein Mensch die Reihenfolge
       ablesen kann. Fuenf gleichnamige Dateien im Ordner waeren nicht mehr
       auseinanderzuhalten. */
    nr: '190', name: 'Alle Teile heissen gleich',
    datei: 'server.js',
    suche: "    `attachment; filename=\"${exportName(alsTeil ? `-teil-${teil}-von-${teile}` : '')}\"`);",
    ersatz: "    `attachment; filename=\"${exportName('')}\"`);",
    erwartet: 'Der Export in Teilen'
  },
  {
    /* DER ZUSAMMENZUG IST DER GANZE PUNKT 1 AUS 0.13.0. Faellt er weg und die
       Oberflaeche fragt wieder je Teil, kommt genau der Fehler aus dem Betrieb
       zurueck: der erste Aufruf traegt, jeder weitere bekommt "Der Code stimmt
       nicht" -- ein Code des zweiten Faktors gilt genau einmal.
       DER RUECKBAU IST DER ALTE QUELLTEXT, Zeile fuer Zeile. Er ist auf einem
       Server OHNE zweiten Faktor harmlos, und genau deshalb muss die neue
       Gruppe rot werden und nicht die alte. */
    nr: '191', name: 'Die Oberflaeche fragt wieder je Teil statt einmal fuer alle',
    datei: 'public/app.js',
    suche: "  try { await api('POST', '/api/bestaetigung', { ...eingabe, zweck, ziele }); }\n  catch (e) { toast(e.message, true); return false; }\n  return true;",
    ersatz: "  for (const ziel of ziele) {\n    try { await api('POST', '/api/bestaetigung', { ...eingabe, zweck, ziel }); }\n    catch (e) { toast(e.message, true); return false; }\n  }\n  return true;",
    erwartet: 'Der Teilexport mit zweitem Faktor'
  },
  {
    /* DIE MEHRZAHL AM SERVER. Ohne sie nimmt die Route nur ein Ziel, und die
       eine Anfrage der Oberflaeche legt genau eine Freigabe an -- Teil 2
       bekaeme 403, und zwar ohne dass irgendwo ein Code falsch gewesen waere. */
    nr: '192', name: 'Die Route nimmt wieder nur ein einzelnes Ziel',
    datei: 'server.js',
    suche: '  } else zielListe = [ziel ?? null];',
    ersatz: '  }\n  zielListe = [ziel ?? null];',
    erwartet: 'Der Teilexport mit zweitem Faktor'
  },
  {
    /* DIE ABSAGE AUF DOPPELTE NUMMERN. Ohne sie wird aus drei bestellten
       Freigaben stillschweigend eine -- die Antwort saehe aus wie ein Erfolg,
       und der zweite Teil bliebe stehen. */
    nr: '193', name: 'Doppelte Zielnummern gehen als halbierte Bestellung durch',
    datei: 'server.js',
    suche: '    if (new Set(zielListe).size !== zielListe.length)',
    ersatz: '    if (false)',
    erwartet: 'Der Teilexport mit zweitem Faktor'
  },
  {
    /* DER DECKEL AUF DER ZAHL DER ZIELE. Ohne ihn legt eine einzige Anfrage
       zehntausend Freigaben im Arbeitsspeicher ab, und nichts raeumt sie vor
       ihrem Ablauf wieder weg. */
    nr: '194', name: 'Eine Anfrage darf beliebig viele Freigaben bestellen',
    datei: 'server.js',
    suche: '    if (ziele.length > AUSTAUSCH_TEIL_MAX)',
    ersatz: '    if (false)',
    erwartet: 'Der Teilexport mit zweitem Faktor'
  },
  {
    /* DAS MERKMAL AM TEILEXPORT. Steht dort wieder die Nummer, ist sie kein
       Wert aus MERKMALE -- und protokolliere() verwirft die GANZE Zeile. Ein
       Bestand, der in fuenf Teilen hinausgeht, stuende im Protokoll nirgends.
       DAS IST DER BEFUND AUS 0.12.4, wortwoertlich zurueckgebaut. */
    nr: '195', name: 'Der Teilexport schreibt wieder "teil 1/5" und faellt damit aus dem Protokoll',
    datei: 'server.js',
    suche: "merkmal: alsTeil ? 'teil' : null });",
    ersatz: 'merkmal: alsTeil ? `teil ${teil}/${teile}` : null });',
    erwartet: 'Der Teilexport mit zweitem Faktor'
  },
  /* ---- 0.13.0: zwei Netze, ein Zugang ---- */
  {
    /* DER KOPF WIRD OHNE DIE EINSTELLUNG GEGLAUBT. Dann holt sich jeder
       Aufrufer auf Port 3100 einen __Host--Cookie samt HSTS -- und sperrt sich
       damit selbst aus, weil sein Browser den Cookie verwirft. */
    nr: '196', name: 'X-Forwarded-Proto wird auch ohne HINTER_PROXY geglaubt',
    datei: 'auth.js',
    suche: '  if (!HINTER_PROXY) return false;',
    ersatz: '  if (false) return false;',
    erwartet: 'Ohne Proxy ist der Kopf nur eine Behauptung'
  },
  {
    /* BEIDE WEGE BEKOMMEN DENSELBEN NAMEN -- der Fehler aus (b) in Reinform.
       Eine Zeile, die nur sagt, dass ein Cookie gesetzt wurde, bliebe dabei
       gruen; der NAME ist die Pruefung. */
    nr: '197', name: 'Beide Wege bekommen denselben Cookienamen',
    datei: 'auth.js',
    suche: "const cookieName = (req) => ueberProxy(req) ? COOKIE_SICHER : COOKIE_NAME;",
    ersatz: "const cookieName = (req) => COOKIE_NAME;",
    erwartet: 'Zwei Netze, ein Zugang — 0.13.0'
  },
  {
    /* SECURE AM HEIMNETZWEG. Der Browser verwirft den Cookie dann
       stillschweigend -- genau der Fehler, gegen den diese Runde gebaut ist,
       nur eine Ebene tiefer. */
    nr: '198', name: 'Auch der Heimnetzcookie traegt Secure',
    datei: 'auth.js',
    suche: "  `${ueberProxy(req) ? '; Secure' : ''}; Max-Age=${SESSION_DAYS * 86400}`;",
    ersatz: "  `; Secure; Max-Age=${SESSION_DAYS * 86400}`;",
    erwartet: 'Zwei Netze, ein Zugang — 0.13.0'
  },
  {
    /* HSTS AUF JEDEM WEG. Der Kopf sperrt den Heimnetzweg aus, den (a) gerade
       offenhalten soll: der Browser bestuende danach auf HTTPS und faende an
       Port 3100 keines. */
    nr: '199', name: 'HSTS geht wieder auf jedem Weg mit',
    datei: 'server.js',
    suche: "  if (auth.ueberProxy(req)) res.set('Strict-Transport-Security', 'max-age=31536000');",
    ersatz: "  if (auth.HINTER_PROXY) res.set('Strict-Transport-Security', 'max-age=31536000');",
    erwartet: 'Zwei Netze, ein Zugang — 0.13.0'
  },
  /* ---- 0.13.0: der Filter am Sicherheitsprotokoll ---- */
  {
    /* DIE AUSWAHL WIRD UEBERGANGEN. Die Karte zeigt dann wieder die hundert
       juengsten ALLER Arten, und genau darin findet man die gescheiterten
       Anmeldungen nicht. */
    nr: '200', name: 'Die Leseroute uebergeht die gewaehlte Ansicht',
    datei: 'server.js',
    suche: '  res.json(auth.leseProtokoll(auth.PROTOKOLL_GRENZE, gruppe));',
    ersatz: '  res.json(auth.leseProtokoll(auth.PROTOKOLL_GRENZE));',
    erwartet: 'Das Sicherheitsprotokoll in der Oberflaeche'
  },
  {
    /* DIE NAMEN WERDEN WIEDER BLOSSER TEXT. Der Sprung zum Zugang faellt damit
       weg -- und mit ihm die zweite Haelfte von Punkt 3a. */
    nr: '201', name: 'Die Namen im Protokoll sind wieder nur Text',
    datei: 'public/app.js',
    suche: "    if (id == null) { feld.appendChild(dok.createTextNode(text)); return feld; }",
    ersatz: "    feld.appendChild(dok.createTextNode(text)); return feld;",
    erwartet: 'Das Sicherheitsprotokoll in der Oberflaeche'
  },
  {
    /* "unbekannter Name" WIRD ANKLICKBAR. Er ist der getippte Name eines
       Versuchs, der an keinen Zugang traf -- ein Knopf ins Leere. */
    nr: '202', name: 'Auch "unbekannter Name" wird ein Knopf',
    datei: 'public/app.js',
    suche: "      zeile.appendChild(protNamensFeld(dok, 'prot-wer', protHandelnder(z),\n        z.wer != null ? z.wer : null));",
    ersatz: "      zeile.appendChild(protNamensFeld(dok, 'prot-wer', protHandelnder(z), z.wer ?? 0));",
    erwartet: 'Das Sicherheitsprotokoll in der Oberflaeche'
  },
  {
    /* DIE FUENF WOERTER FALLEN WIEDER WEG. Die Vorgaenge stehen dann als rohe
       Schluessel am Bildschirm -- "anfrage.frei" statt eines Satzes. */
    nr: '203', name: 'Fuenf Vorgaenge stehen wieder als roher Schluessel da',
    datei: 'public/app.js',
    suche: "    'anfrage.frei': 'Anfrage freigegeben',",
    ersatz: "",
    erwartet: 'Das Sicherheitsprotokoll in der Oberflaeche'
  },
  /* ---- 0.13.0: der Loeschdialog und die Grabsteine ---- */
  {
    /* DER SATZ FAELLT WEG. Der Dialog sagt dann wieder nur, dass es nicht
       rueckgaengig zu machen ist -- und verschweigt den Weg, der genau das
       nicht tut. Der billigste Punkt der Runde mit dem groessten Schaden. */
    nr: '204', name: 'Der Loeschdialog verschweigt den umkehrbaren Weg wieder',
    datei: 'public/app.js',
    suche: "            `Nur vorübergehend aussperren? Dann sperren statt entfernen — das ist umkehrbar, ` +\n            `und der Name bleibt.`)) return;",
    ersatz: "            ``)) return;",
    erwartet: 'Die zweite Bestaetigung in der Oberflaeche'
  },
  {
    /* DIE GRABSTEINE STEHEN WIEDER ZWISCHEN DEN LEBENDEN. */
    nr: '205', name: 'Grabsteine stehen wieder in der Zugangsliste',
    datei: 'public/app.js',
    suche: "    for (const z of daten.zugaenge.filter(z => z.status !== 'geloescht')) {",
    ersatz: "    for (const z of daten.zugaenge) {",
    erwartet: 'Der Einladungslink in der Karte Zugaenge'
  },
  /* ---- 0.13.0: die Filterleiste ---- */
  {
    /* DIE SELBSTTAETIGE AUSSENKANTE KOMMT ZURUECK. Sie frisst den freien Platz
       der Zeile, die Wolke rutscht darunter, und die Tagzeile kostet wieder
       zwei Zeilen. */
    nr: '206', name: 'Die selbsttaetige Aussenkante frisst die Zeile wieder',
    datei: 'public/style.css',
    suche: '.frow-rechts { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }',
    ersatz: '.frow-rechts { display: flex; align-items: center; gap: 10px; margin-left: auto; }',
    erwartet: 'Die Anzeige zieht nach — 0.12.3'
  },
  {
    /* SORTIEREN UND ANSICHTEN FALLEN WIEDER AUSEINANDER. */
    nr: '207', name: 'Sortieren und Ansichten bekommen wieder je eine Zeile',
    datei: 'public/app.js',
    suche: "  const r5 = r4;\n  zweiteBeschriftung(r5, 'Ansichten');",
    ersatz: "  const r5 = row('Ansichten');",
    erwartet: 'Die Filterleiste wird kuerzer — 0.13.0'
  },
  {
    /* "NEU SEIT ..." MIT NULL TREFFERN STEHT WIEDER IN VOLLER HELLIGKEIT DA. */
    nr: '208', name: 'Die Pille mit null Treffern wird nicht mehr gedaempft',
    datei: 'public/app.js',
    suche: '    const leer = !f.neu && neuZahl === 0;',
    ersatz: '    const leer = false;',
    erwartet: 'Die Filterleiste wird kuerzer — 0.13.0'
  },
  /* ---- 0.13.0: die Kategoriezeile ---- */
  {
    /* DIE UEBERSETZUNG DER ALTEN FORM FAELLT WEG. Alle vorhandenen Ansichten
       verloeren ihre Kategorie -- still und ohne Meldung. */
    nr: '209', name: 'Eine gespeicherte Ansicht in der alten Form verliert ihre Kategorie',
    datei: 'public/app.js',
    suche: "  if (!Array.isArray(f.categoryIds))\n    f.categoryIds = f.categoryId != null ? [f.categoryId] : [];",
    ersatz: "  if (!Array.isArray(f.categoryIds))\n    f.categoryIds = [];",
    erwartet: 'Die Kategoriezeile lernt die Mehrzahl — 0.13.0'
  },
  {
    /* AUS DEM ODER WIRD EIN UND. Ein Eintrag traegt genau eine Kategorie --
       zwei gewaehlte ergaeben damit garantiert null Treffer. */
    nr: '210', name: 'Aus der Vereinigung wird ein Schnitt',
    datei: 'public/app.js',
    suche: "  if (f.categoryIds.length) out = out.filter(i =>\n    f.categoryIds.includes(i.category ? i.category.id : KATEGORIE_OHNE));",
    ersatz: "  if (f.categoryIds.length) out = out.filter(i =>\n    f.categoryIds.every(v => v === (i.category ? i.category.id : KATEGORIE_OHNE)));",
    erwartet: 'Die Kategoriezeile lernt die Mehrzahl — 0.13.0'
  },
  {
    /* "OHNE" WIRD BEIM ZURECHTRUECKEN WEGGEWORFEN: es ist kein Kategoriewert,
       und eine Klemme, die nur Nummern durchlaesst, nimmt es mit. */
    nr: '211', name: '"Ohne" ueberlebt das Zurechtruecken nicht',
    datei: 'public/app.js',
    suche: "    v === KATEGORIE_OHNE || state.categories.some(c => c.id === v));",
    ersatz: "    state.categories.some(c => c.id === v));",
    erwartet: 'Die Kategoriezeile lernt die Mehrzahl — 0.13.0'
  },
  {
    /* DIE PILLE "OHNE" FAELLT WEG. Die Eintraege ohne Kategorie waeren wieder
       ueber keine einzelne Kategorie erreichbar -- der Anlass des Punktes. */
    nr: '212', name: 'Die Pille "Ohne" wird gar nicht erst gezeichnet',
    datei: 'public/app.js',
    suche: "  if (ohneZahl || f.categoryIds.includes(KATEGORIE_OHNE)) {",
    ersatz: "  if (false) {",
    erwartet: 'Die Kategoriezeile lernt die Mehrzahl — 0.13.0'
  },
  /* ---- Die Beschriftungen stehen oben — 0.13.1 ---- */
  {
    /* ZURUECK IN DIE MITTE -- der Befund selbst. Bei aufgeklappter Tagwolke
       sinken Beschriftung, Umschalter und Verweise wieder in die Mitte des
       Blocks. */
    nr: '213', name: 'Die Filterzeile mittelt wieder ueber die ganze Hoehe',
    datei: 'public/style.css',
    suche: '.frow { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }',
    ersatz: '.frow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }',
    erwartet: 'Die Beschriftungen stehen oben — 0.13.1'
  },
  {
    /* DIE BESCHRIFTUNG NIMMT SICH IHRE MITTE EINZELN ZURUECK. Die Zeile bleibt
       an der Grundlinie, das eine Element schert aus -- genau der Weg, den die
       Pruefung ueber `align-self` zuhalten soll. */
    nr: '214', name: 'Die Beschriftung schert aus der Grundlinie aus',
    datei: 'public/style.css',
    suche: '.frow > .eyebrow { min-width: 7.25em; flex-shrink: 0; }',
    ersatz: '.frow > .eyebrow { min-width: 7.25em; flex-shrink: 0; align-self: center; }',
    erwartet: 'Die Beschriftungen stehen oben — 0.13.1'
  },
  /* ---- Der angepinnte Rahmen schliesst — 0.13.2 ---- */
  {
    /* DREI KANTEN STATT VIER -- der Befund selbst. Die angepinnte Notiz steht
       wieder in drei goldenen und einer grauen Kante da. */
    nr: '215', name: 'Die angepinnte Notiz bekommt ihre linke Kante nicht',
    datei: 'public/style.css',
    suche: '.cmt.pinned { border-color: var(--gold-line); }',
    ersatz: '.cmt.pinned {\n  border-top-color: var(--gold-line);\n' +
      '  border-right-color: var(--gold-line);\n  border-bottom-color: var(--gold-line);\n}',
    erwartet: 'Der angepinnte Rahmen schliesst — 0.13.2'
  },
  {
    /* DIE WIEDERHOLUNG FAELLT WEG, und damit schlaegt die spaetere Regel der
       Anpinnung durch: der angepinnte Bericht bekaeme eine goldene linke
       Kante neben drei orangen -- zwei Farben an einem Kasten. */
    nr: '216', name: 'Der angepinnte Bericht verliert seine orange Kante an das Gold',
    datei: 'public/style.css',
    suche: '  border-bottom-color: var(--accent);\n  border-left-color: var(--accent);\n}',
    ersatz: '  border-bottom-color: var(--accent);\n}',
    erwartet: 'Der angepinnte Rahmen schliesst — 0.13.2'
  },
  /* ---- 0.14.0: der kaputte Cookiewert ---- */
  {
    /* DER BEFUND SELBST, wiederhergestellt: decodeURIComponent() auf JEDEN
       Wert, ohne Auffangnetz. Ein fremder Cookie mit einem Prozentzeichen
       sperrt den Browser damit wieder aus. */
    nr: '217', name: 'Ein kaputter Cookiewert bricht wieder den ganzen Kopf ab',
    datei: 'auth.js',
    suche: "    let wert;\n    try { wert = decodeURIComponent(part.slice(i + 1).trim()); }\n" +
      "    catch { continue; }\n    out[part.slice(0, i).trim()] = wert;",
    ersatz: "    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());",
    erwartet: 'Der kaputte Cookiewert — 0.14.0'
  },
  {
    /* DIE ANDERE HALBE FASSUNG: der kaputte Wert reisst nicht mehr ab, aber
       der ganze KOPF faellt weg statt nur der einen Zeile. Dann kommt der
       eigene, gueltige Cookie daneben nicht mehr an -- und genau das ist der
       Unterschied, den eine Prueflage mit nur einem Cookie nicht sehen kann. */
    nr: '218', name: 'Ein kaputter Wert nimmt den ganzen Cookiekopf mit',
    datei: 'auth.js',
    suche: "    catch { continue; }",
    ersatz: "    catch { return {}; }",
    erwartet: 'Der kaputte Cookiewert — 0.14.0'
  },
  /* ---- 0.14.0: die drei Spalten und der Migrationsblock ---- */
  {
    nr: '219', name: 'Der Migrationsblock laeuft gar nicht mehr',
    datei: 'db.js',
    suche: "migration0140();\n// ENDE MIGRATION 0.14.0",
    ersatz: "// migration0140();\n// ENDE MIGRATION 0.14.0",
    erwartet: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* STOLPERSTEIN 108: der Block fragt sich als GANZES ab. Ein Bestand, dem
       nur die zweite oder dritte Spalte fehlt, bleibt damit fuer immer
       zerrissen -- und genau das ist der Riss, den eine frueher abgebrochene
       Fassung hinterlaesst. */
    nr: '220', name: 'Der Migrationsblock fragt nur noch die erste Spalte ab',
    datei: 'db.js',
    suche: "  const fehlend = [];\n  if (!spalten.includes('rejected_at')) fehlend.push(['rejected_at', 'ALTER TABLE items ADD COLUMN rejected_at TEXT']);",
    ersatz: "  const fehlend = [];\n  if (spalten.includes('rejected_at')) return 0;\n  fehlend.push(['rejected_at', 'ALTER TABLE items ADD COLUMN rejected_at TEXT']);",
    erwartet: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* Die Transaktion faellt weg. Am unveraenderten Stand aendert das nichts
       am Ergebnis -- der Waechter ueber den Quelltext haelt sie fest, denn
       ohne sie ueberlebt bei einem Abbruch die erste Spalte allein. */
    nr: '221', name: 'Die drei ALTER TABLE laufen nicht mehr in einer Transaktion',
    datei: 'db.js',
    suche: "  db.transaction(() => { for (const [, sql] of fehlend) db.exec(sql); })();",
    ersatz: "  for (const [, sql] of fehlend) db.exec(sql);",
    erwartet: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* EIN NACHGESCHOBENES UPDATE ERFINDET ANGABEN. "Abgelehnt am Tag der
       Einspielung von dem, der eingespielt hat" ist die schlimmste davon --
       und sie saehe aus wie eine echte. */
    nr: '222', name: 'Die Migration traegt erfundene Angaben in den Bestand',
    datei: 'db.js',
    suche: "  const n = db.prepare('SELECT COUNT(*) AS n FROM items WHERE rejected = 1').get().n;\n  console.log(`[Kriterion] items um ${aufzaehlung} ergaenzt `",
    ersatz: "  db.exec(\"UPDATE items SET rejected_at = datetime('now') WHERE rejected = 1\");\n" +
      "  const n = db.prepare('SELECT COUNT(*) AS n FROM items WHERE rejected = 1').get().n;\n  console.log(`[Kriterion] items um ${aufzaehlung} ergaenzt `",
    erwartet: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* Die nachgeruestete Spalte verliert ihren Fremdschluessel. Ein entfernter
       Zugang laesst danach eine Nummer stehen, die auf niemanden mehr zeigt --
       und die migrierte Anlage verhaelt sich anders als die frische. */
    nr: '223', name: 'Die nachgeruestete Spalte bekommt keinen Fremdschluessel',
    datei: 'db.js',
    suche: "    'ALTER TABLE items ADD COLUMN rejected_von INTEGER REFERENCES users(id) ON DELETE SET NULL']);",
    ersatz: "    'ALTER TABLE items ADD COLUMN rejected_von INTEGER']);",
    erwartet: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* Die DDL verliert die drei Spalten. Eine FRISCHE Anlage bekaeme sie dann
       ueber den Migrationsblock -- und zu 1.0, wenn er wegfaellt, gar nicht
       mehr. Genau dafuer steht die Gegenlage der frischen Anlage. */
    nr: '224', name: 'Die drei Spalten stehen nicht mehr in der DDL',
    datei: 'db.js',
    suche: "  rejected_at TEXT,\n  rejected_grund TEXT,",
    ersatz: "",
    erwartet: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  /* ---- 0.14.0: die Klemme an der Begruendung ---- */
  {
    /* DIE ZURUECKGENOMMENE ENTSCHEIDUNG, wiederhergestellt: an der Begruendung
       gilt wieder darfAendern -- Verfasser ODER Admin. Damit schreibt ein
       Admin eine fremde Aussage unter fremdem Namen um. */
    nr: '225', name: 'An der Begruendung gilt wieder darfAendern statt nurSelbst',
    datei: 'server.js',
    suche: "      it.rejected_von != null && !nurSelbst(req, it.rejected_von))",
    ersatz: "      it.rejected_von != null && !darfAendern(req, it.rejected_von))",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Die grobe Haelfte faellt weg: rejectedGrund steht nicht mehr in
       NUR_VERFASSER_FELDER. Dann setzt jeder Angemeldete eine Begruendung an
       einen Eintrag, dessen Ablehnung noch keinen Verfasser traegt. */
    nr: '226', name: 'Die Begruendung faellt aus den Verfasserfeldern heraus',
    datei: 'server.js',
    suche: "const NUR_VERFASSER_FELDER = ['title', 'description', 'rejected', 'rejectedGrund',\n                              'tested', 'productCategoryId'];",
    ersatz: "const NUR_VERFASSER_FELDER = ['title', 'description', 'rejected',\n                              'tested', 'productCategoryId'];",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Der Zweig fuer den Bestand ohne Verfasser faellt weg. Eine Ablehnung aus
       einer Anlage vor 0.14.0 bekaeme damit NIE eine Begruendung:
       nurSelbst(null) ist fuer jeden falsch. */
    nr: '227', name: 'Eine Ablehnung ohne Verfasser laesst sich nicht mehr begruenden',
    datei: 'server.js',
    suche: "  if (b.rejectedGrund !== undefined && !schaltetEin && !entferntGrund &&\n      it.rejected_von != null && !nurSelbst(req, it.rejected_von))",
    ersatz: "  if (b.rejectedGrund !== undefined && !schaltetEin && !entferntGrund &&\n      !nurSelbst(req, it.rejected_von))",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Beim Einschalten wird der Grund nicht mehr mitgeschrieben. Dann traegt
       die NEUE Entscheidung den Satz der vorigen Person unter neuem Namen --
       genau das, was die Klemme verhindern soll. */
    nr: '228', name: 'Ein neues Ablehnen uebernimmt den fremden Satz',
    datei: 'server.js',
    suche: "    put('rejected_von', req.benutzer.id);\n    put('rejected_grund', grundText(b.rejectedGrund));",
    ersatz: "    put('rejected_von', req.benutzer.id);",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Das Datum kommt wieder aus dem Rumpf. Dann traegt jede Ablehnung das
       Datum, das der Aufrufende hineinschreibt. */
    nr: '229', name: 'Das Ablehnungsdatum kommt aus dem Rumpf statt vom Server',
    datei: 'server.js',
    suche: "    sets.push(`rejected_at = datetime('now')`);",
    ersatz: "    put('rejected_at', b.rejectedAt || new Date().toISOString().slice(0, 19).replace('T', ' '));",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Die nackte Zugangsnummer bleibt in der Detailantwort stehen -- und das
       Verfasserobjekt entfaellt. Aus einem Grabstein liesse sich der
       freigegebene Name dann nicht mehr fernhalten. */
    nr: '230', name: 'Der Ablehnende geht als nackte Nummer hinaus',
    datei: 'server.js',
    suche: "  it.rejectedVerfasser = verfasserAus(karte, it.rejected_von);\n  delete it.rejected_von;",
    ersatz: "",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Die drei Angaben bleiben in der Uebersicht stehen. Der Grund gehoert an
       den Eintrag und nicht in eine Kachelreihe -- und rejected_von waere dort
       eine nackte Zugangsnummer in einer Antwort an jeden. */
    nr: '231', name: 'Die Uebersicht schickt Grund und Nummer mit hinaus',
    datei: 'server.js',
    suche: "    delete it.rejected_at; delete it.rejected_grund; delete it.rejected_von;",
    ersatz: "",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Der Text wird nicht mehr eingeebnet. Ein eingefuegter Absatz risse die
       Marke in der Oberflaeche, und der Deckel faellt gleich mit. */
    nr: '232', name: 'Die Begruendung wird weder eingeebnet noch gekappt',
    datei: 'server.js',
    suche: "const grundText = (v) =>\n  typeof v === 'string' ? v.replace(/\\s+/g, ' ').trim().slice(0, GRUND_LAENGE) : '';",
    ersatz: "const grundText = (v) => (typeof v === 'string' ? v : '');",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  /* ---- 0.14.0: das Austauschformat ---- */
  {
    nr: '233', name: 'Die Formatnummer bleibt auf 10',
    datei: 'server.js',
    suche: "const AUSTAUSCH_FORMAT = 11;",
    ersatz: "const AUSTAUSCH_FORMAT = 10;",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Der Ablehnende wandert als NUMMER hinaus. Eine Zugangsnummer bedeutet in
       einer fremden Anlage etwas anderes -- der Rundlauf traefe dort einen
       beliebigen Zugang oder gar keinen. */
    nr: '234', name: 'Der Ablehnende wandert als Nummer statt als Name hinaus',
    datei: 'server.js',
    suche: "    rejected_author: verfasserName(it.rejected_von),",
    ersatz: "    rejected_author: it.rejected_von,",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Die drei Felder fallen aus der Datei. Ein Rundlauf machte damit aus
       einer begruendeten Ablehnung wieder ein nacktes Haekchen. */
    nr: '235', name: 'Die drei Angaben gehen gar nicht erst in die Datei',
    datei: 'server.js',
    suche: "    rejected_at: it.rejected_at, rejected_grund: it.rejected_grund,\n    rejected_author: verfasserName(it.rejected_von),",
    ersatz: "",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Der fehlende Name faellt wieder an den Einspielenden. Dann ist JEDER
       eingespielte Eintrag von ihm abgelehnt -- auch die, die niemand
       abgelehnt hat. */
    nr: '236', name: 'Ein fehlender Ablehnender faellt an den Einspielenden',
    datei: 'server.js',
    suche: "      const abgelehntVon = String(it.rejected_author == null ? '' : it.rejected_author).trim()\n        ? verfasser(it.rejected_author) : null;",
    ersatz: "      const abgelehntVon = verfasser(it.rejected_author);",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  /* ---- 0.14.0: die Sternreihe der Kriterienliste ---- */
  {
    /* DIE FESTE PIXELZAHL KEHRT ZURUECK -- der Befund vom 29. August 2026 in
       Reinform: bei 80 Prozent stimmt es zufaellig, bei 120 klaffen 26 px. */
    nr: '237', name: 'Die Zahlenspalte bekommt ihre feste Mindestbreite zurueck',
    datei: 'public/style.css',
    suche: "  white-space: nowrap; padding-left: 9px;\n  display: flex; align-items: center; justify-content: flex-end;",
    ersatz: "  white-space: nowrap; padding-left: 9px;\n  min-width: 52px; text-align: right;",
    erwartet: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  {
    /* Das Raster faellt weg, die Zeile wird wieder ein Flex-Kasten. Damit
       misst sich jede Zahlenspalte wieder an ihrem eigenen Inhalt. */
    nr: '238', name: 'Aus dem Raster wird wieder eine Reihe einzelner Zeilen',
    datei: 'public/style.css',
    suche: ".rlist { display: grid; grid-template-columns: 1fr auto auto; }\n.rrow { display: contents; }",
    ersatz: ".rlist { display: block; }\n.rrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; }",
    erwartet: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  {
    /* Der Kasten bekommt die Rasterklasse nicht mehr. Die Regeln im Stilblatt
       stehen dann alle da und greifen an nichts -- der Fehler waere zurueck,
       ohne dass sich eine Zeile im Stilblatt geaendert haette. */
    nr: '239', name: 'Die Kriterienliste bekommt ihre Rasterklasse nicht',
    datei: 'public/app.js',
    suche: "    box.className = 'rlist';",
    ersatz: "",
    erwartet: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  {
    /* Die Zahl wandert zurueck in die Sterne. Dann ist sie keine Rasterzelle
       mehr und wieder nur so breit wie ihr eigener Inhalt. */
    nr: '240', name: 'Die Zahl steckt wieder in den Sternen statt im Raster',
    datei: 'public/app.js',
    suche: "        } else a.textContent = '';\n        row.append(a);",
    ersatz: "        } else a.textContent = '';\n        acts.append(a);",
    erwartet: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  {
    /* Die Trennlinie bleibt an der Zeile. Eine Zeile mit display: contents ist
       kein Kasten mehr -- die Linie verschwaende ganz. */
    nr: '241', name: 'Die Trennlinie wird wieder an der Zeile gezogen',
    datei: 'public/style.css',
    suche: ".rrow > * { padding: 9px 0; border-bottom: 1px solid var(--line-2); }\n.rrow:last-of-type > * { border-bottom: none; }",
    ersatz: ".rrow { padding: 9px 0; border-bottom: 1px solid var(--line-2); }\n.rrow:last-of-type { border-bottom: none; }",
    erwartet: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  /* ---- 0.14.0: die Oberflaeche an der Marke ---- */
  {
    /* Die Marke wird wieder ein blosses Haekchen: der Satz darunter entfaellt.
       Genau der Zustand vor dieser Runde. */
    nr: '242', name: 'Die Marke sagt wieder nur "Abgelehnt"',
    datei: 'public/app.js',
    suche: "    drawAblehnung();\n  }",
    ersatz: "  }",
    erwartet: 'Die Aussage an der Marke — 0.14.0'
  },
  {
    /* Der Name faellt aus der Aussage. Aussagen tragen in dieser Anlage ihren
       Verfasser -- ohne ihn ist es wieder ein Haekchen mit Datum. */
    nr: '243', name: 'Die Aussage verliert ihren Verfasser',
    datei: 'public/app.js',
    suche: "    if (item.rejectedVerfasser && mehrereBenutzer())\n" +
      "      teile.push(`von ${verfasserName(item.rejectedVerfasser)}`);",
    ersatz: "",
    erwartet: 'Die Aussage an der Marke — 0.14.0'
  },
  {
    /* DER NAME STEHT AUCH BEI EINEM EINZIGEN ZUGANG DA. Dann saende
       "von pruefer" nichts -- dieselbe Sache wie an jeder anderen
       Verfasserangabe, und die Prueflage mit EINEM Zugang faengt es. */
    nr: '247', name: 'Der Name steht auch bei einem einzigen Zugang da',
    datei: 'public/app.js',
    suche: "    if (item.rejectedVerfasser && mehrereBenutzer())",
    ersatz: "    if (item.rejectedVerfasser)",
    erwartet: 'Die Aussage an der Marke — 0.14.0'
  },
  {
    /* Die alte Begruendung geht beim erneuten Einschalten nicht mehr mit.
       Damit ist die Angabe, die beim Zuruecknehmen ausdruecklich stehen
       geblieben ist, beim naechsten Ablehnen doch weg. */
    nr: '244', name: 'Der Vorschlag zum Ueberschreiben geht verloren',
    datei: 'public/app.js',
    suche: "      : { rejected: true, rejectedGrund: item.rejected_grund || '' };",
    ersatz: "      : { rejected: true };",
    erwartet: 'Die Aussage an der Marke — 0.14.0'
  },
  {
    /* Das Feld fuer den Grund bleibt verborgen. Ein Feld, das man nicht sieht,
       ist ein Feld, das niemand fuellt -- und die Spalte bliebe leer.
       SEIT 0.15.0 HAENGT ES AN `grundOffen` und nicht mehr am Merkmal: der
       Ruhezustand hat es zu, und geoeffnet wird ueber Schalter, Text und
       Stift. Der Rueckbau trifft dieselbe Sache an ihrer neuen Zeile. */
    nr: '245', name: 'Das Feld fuer den Grund erscheint nicht',
    datei: 'public/app.js',
    suche: "    zeile.hidden = !grundOffen;",
    ersatz: "    zeile.hidden = true;",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Die Zeile steht auch dann da, wenn gar nichts bekannt ist -- dann sagt
       sie "Abgelehnt", also dasselbe wie der Schalter darueber. Dieselbe
       Aussage zweimal. */
    nr: '246', name: 'Die Aussage steht auch da, wenn sie nichts sagt',
    datei: 'public/app.js',
    suche: "    marke.hidden = !item.rejected || grundOffen || (!kopf && !grund && !zeigeStift);",
    ersatz: "    marke.hidden = !item.rejected;",
    erwartet: 'Die Aussage an der Marke — 0.14.0'
  },

  /* ---- 0.15.0: Der Filter und der Stift ---- */
  {
    /* Der Filter greift gar nicht mehr: die Menge bleibt, wie sie ist, gleich
       welcher der drei Zustaende gewaehlt ist. */
    nr: '250', name: 'Der Filter „abgelehnt" nimmt nichts weg',
    datei: 'public/app.js',
    suche: "  if (f.abgelehnt === 'ja') out = out.filter(i => i.rejected);",
    ersatz: "  if (false) out = out.filter(i => i.rejected);",
    erwartet: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Nur die Gegenrichtung faellt weg. "Zeig mir alles ausser dem
       Verworfenen" ist der haeufigere Griff und der Grund, warum es drei
       Zustaende sind und kein Umschalter. */
    nr: '251', name: 'Die Gegenrichtung des Filters faellt weg',
    datei: 'public/app.js',
    suche: "  else if (f.abgelehnt === 'nein') out = out.filter(i => !i.rejected);",
    ersatz: "  else if (false) out = out.filter(i => !i.rejected);",
    erwartet: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Der Schluessel steht nicht mehr in der Vorgabe. Damit faellt eine
       gespeicherte Ansicht nicht mehr auf "Alle" zurueck, filterNormal()
       raeumt ihn nicht auf, und filterZahl() vergleicht gegen undefined. */
    nr: '252', name: 'Der neue Filter fehlt in der Vorgabe',
    datei: 'public/app.js',
    suche: "                         abgelehnt: 'all', favorit: false, neu: false,",
    ersatz: "                         favorit: false, neu: false,",
    erwartet: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Der eingeklappte Filterbereich zaehlt ihn nicht mit und sagt damit die
       Unwahrheit ueber die eine Frage, die er aufwirft. */
    nr: '253', name: 'Der Ablehnungsfilter zaehlt nicht mit',
    datei: 'public/app.js',
    suche: "  if (f.abgelehnt !== v.abgelehnt) n++;",
    ersatz: "  if (false) n++;",
    erwartet: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Die Gruppe steht ohne zweite Beschriftung da und liest sich damit als
       Fortsetzung der Reihe davor -- als waeren es sechs Zustaende EINES
       Merkmals. */
    nr: '254', name: 'Die zweite Gruppe ist nicht abgesetzt',
    datei: 'public/app.js',
    suche: "  zweiteBeschriftung(r1, 'Ablehnung');",
    ersatz: "  // zweiteBeschriftung(r1, 'Ablehnung');",
    erwartet: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Der Server sagt nicht mehr, wem die Begruendung gehoert. Die Oberflaeche
       kann es nicht zurueckrechnen -- sie kennt ihren Namen, nicht ihre
       Nummer -- und der Stift verschwindet fuer den, der ihn braucht. */
    nr: '255', name: 'rejectedMine geht nicht mehr hinaus',
    datei: 'server.js',
    suche: "  it.rejectedMine = it.rejected_von != null && it.rejected_von === benutzerId;",
    ersatz: "  it.rejectedMine = false;",
    erwartet: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Dasselbe fuer den Eintrag: ohne `mine` faellt der Papierkorb bei dem
       weg, dem der Eintrag gehoert. */
    nr: '256', name: 'mine geht am Eintrag nicht mehr hinaus',
    datei: 'server.js',
    suche: "  it.mine = it.user_id === benutzerId;",
    ersatz: "  it.mine = false;",
    erwartet: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Die Fallunterscheidung faellt weg: das Entfernen laeuft wieder ueber
       nurSelbst, und ein Admin kann eine fremde Begruendung weder umschreiben
       noch wegnehmen. Genau die Luecke, die 0.15.0 schliesst. */
    nr: '257', name: 'Entfernen laeuft wieder ueber nurSelbst',
    datei: 'server.js',
    suche: "  const entferntGrund = b.rejectedGrund !== undefined && !grundText(b.rejectedGrund);",
    ersatz: "  const entferntGrund = false;",
    erwartet: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Umgekehrt: die Klemme laesst jetzt ALLES durch, auch das Umschreiben
       einer fremden Begruendung. "Loeschen ja, umschreiben nein" waere damit
       "beides ja". */
    nr: '258', name: 'Auch das Umschreiben kommt durch',
    datei: 'server.js',
    suche: "  if (b.rejectedGrund !== undefined && !schaltetEin && !entferntGrund &&",
    ersatz: "  if (false &&",
    erwartet: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Wer entfernt, wird wieder Verfasser einer Begruendung, die es gar nicht
       gibt -- an einer Ablehnung aus einer Anlage vor 0.14.0. */
    nr: '259', name: 'Wer entfernt, wird Verfasser',
    datei: 'server.js',
    suche: "    if (it.rejected_von == null && !entferntGrund) put('rejected_von', req.benutzer.id);",
    ersatz: "    if (it.rejected_von == null) put('rejected_von', req.benutzer.id);",
    erwartet: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Das Feld schliesst sich nach dem Speichern nicht mehr. Damit steht die
       Aussage wieder neben einem dauernd offenen Feld -- dieselbe Sache
       zweimal, und genau der Befund aus dem Betrieb. */
    nr: '260', name: 'Das Feld bleibt nach dem Speichern offen',
    datei: 'public/app.js',
    suche: "      grundOffen = false;\n      drawSwitches();\n    };\n    feld.onblur = speichere;",
    ersatz: "      drawSwitches();\n    };\n    feld.onblur = speichere;",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Beim Einschalten steht das Feld nicht mehr offen. Ein Feld, das man erst
       suchen muss, bleibt leer -- das war die Zusage aus 0.14.0. */
    nr: '261', name: 'Beim Einschalten bleibt das Feld zu',
    datei: 'public/app.js',
    suche: "      grundOffen = item.rejected;\n      drawSwitches();",
    ersatz: "      grundOffen = false;\n      drawSwitches();",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Der Stift steht auch dem da, der gar nicht schreiben darf -- und
       oeffnet ein Feld, dessen Inhalt der Server mit 403 abweist. */
    nr: '262', name: 'Der Stift steht jedem da',
    datei: 'public/app.js',
    suche: "    const zeigeStift = item.rejected && meins;",
    ersatz: "    const zeigeStift = item.rejected;",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Der Papierkorb steht jedem da -- auch der Fremden, die den Eintrag
       nicht aendern darf. */
    nr: '263', name: 'Der Papierkorb steht jedem da',
    datei: 'public/app.js',
    suche: "    const zeigeWeg = item.rejected && verwalten && !!grund;",
    ersatz: "    const zeigeWeg = item.rejected && !!grund;",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Der Papierkorb entfernt ohne Rueckfrage. Eine Angabe, die niemand
       wiederherstellen kann, verschwindet auf einen Klick. */
    nr: '264', name: 'Der Papierkorb fragt nicht mehr nach',
    datei: 'public/app.js',
    suche: "    if (!await confirmBox('Begründung entfernen?',",
    ersatz: "    if (false && !await confirmBox('Begründung entfernen?',",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Escape setzt das Feld nicht mehr zurueck, bevor es schliesst. Das
       Schliessen nimmt den Zeiger, onblur laeuft, und der verworfene Text
       wird genau von dem Weg gespeichert, der ihn verwerfen sollte. */
    nr: '265', name: 'Escape verwirft nicht mehr, sondern speichert',
    datei: 'public/app.js',
    suche: "        feld.value = item.rejected_grund || '';\n        grundOffen = false;\n        drawAblehnung();",
    ersatz: "        grundOffen = false;\n        drawAblehnung();",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* An einer herrenlosen Ablehnung -- aus einer Anlage vor 0.14.0 -- gibt es
       keinen Weg mehr in das Feld. Der Server laesst dort jeden schreiben, der
       den Eintrag aendern darf; die Oberflaeche bietet es nicht mehr an. */
    nr: '266', name: 'An der herrenlosen Ablehnung fehlt der Weg hinein',
    datei: 'public/app.js',
    suche: "    const meins = darf && (item.rejectedMine === true || !item.rejectedVerfasser);",
    ersatz: "    const meins = darf && item.rejectedMine === true;",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Der Grund steht nicht mehr hervorgehoben da, sondern im selben Grau wie
       "Angelegt von … am …". Eine Entscheidung, die den Eintrag verwirft,
       liest sich wieder wie eine Randnotiz -- der zweite Befund. */
    nr: '267', name: 'Die Hervorhebung des Grundes faellt weg',
    datei: 'public/style.css',
    suche: ".rej-aussage .rej-warum { color: var(--red); font-weight: 500; }",
    ersatz: ".rej-aussage .rej-warum { font-weight: 500; }",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
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
  /* DER ZWEITE RUECKBAUWEG: eine ENTFERNTE DATEI WIEDER HINLEGEN. Er ersetzt
     keinen Text, sondern legt `datei` ein zweites Mal unter dem Namen `kopie`
     ab. Gebraucht wird er fuer die Zeile, die haelt, dass in public/ keine
     Datei zweimal unter zwei Namen liegt -- die laesst sich mit einer
     Textersetzung nicht zurueckbauen, weil es dabei um die Datei selbst
     geht und nicht um ihren Inhalt.
     ER LIEGT ABSICHTLICH IM ZURUECK STATT DANEBEN: so faellt er unter
     dieselbe Kopie, dieselbe Nachschau und dasselbe Aufraeumen wie jeder
     andere -- der Arbeitsbaum wird auch hier NIE angefasst. */
  if (r.kopie) {
    const ziel = path.join(kopie, r.kopie);
    if (fs.existsSync(ziel))
      throw new Error(`${r.kopie} liegt schon da -- der Rueckbau haette nichts zu tun.`);
    fs.copyFileSync(datei, ziel);
    return;
  }
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
    /* EINE ZEITGRENZE JE RUECKBAU, . Ein Rueckbau kann den Prueflauf
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

/* ================= Bedienung =================
   DIE LISTE IST AUCH VON AUSSEN LESBAR, und der Prueflauf liest sie: er zaehlt
   die Rueckbauten nach und sieht bei jedem nach, ob sein Suchtext in seiner
   Datei genau einmal vorkommt. Ein Rueckbau, der ins Leere greift, sieht sonst
   aus wie einer, der nichts bewirkt -- und faellt erst beim vollen Lauf auf,
   der Stunden dauert. Drei davon lagen so fuenf Runden lang unbemerkt.
   NUR BEIM DIREKTEN AUFRUF WIRD GEFAHREN: `require('./gegenprobe')` liefert
   die Liste und startet keinen einzigen Server. */
module.exports = { RUECKBAUTEN };
if (require.main !== module) return;

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
