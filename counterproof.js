#!/usr/bin/env node
/* Der Gegenprobentreiber.
 *
 *   node counterproof.js            alle Rueckbauten, zwei Nebenspuren
 *   node counterproof.js 4          alle Rueckbauten, vier Nebenspuren
 *   node counterproof.js 2 W2 W3    nur die Rueckbauten, deren Nummer oder Name
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
   einer Datei daneben -- dieselbe Bauform wie F_ROUTES im Pruefstand: man sucht
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
   Statt `suche`/`replacement` darf ein Eintrag auch `copy` tragen: dann wird
   `datei` in der Kopie ein zweites Mal unter diesem Namen abgelegt. Damit
   laesst sich eine entfernte Datei zurueckholen -- eine Textersetzung kann
   das nicht, weil es dabei um die Datei geht und nicht um ihren Inhalt.
     erwartet  die Prueffgruppe, in der die roten Punkte erwartet werden. Sie
             ist eine NOTIZ und keine Bedingung: gemeldet wird, was wirklich
             rot wurde, und wenn das eine andere Gruppe ist, steht das da. */
const REGRESSIONS = [
  /* ---- Der Versand: das Offline-Prinzip ---- */
  {
    nr: '01', name: 'Der Token entsteht erst NACH dem Versand',
    file: 'server.js',
    search: "    const v = await sendTokenLink(target, token);",
    replacement: "    const v = await sendTokenLink(ziel, token); if (v.versand !== 'ok') throw new Error('Versand fehlgeschlagen');",
    expected: 'Der Mailversand: das Offline-Prinzip in beide Richtungen'
  },
  {
    nr: '02', name: 'Der Link faellt aus der Antwort, wenn der Versand traegt',
    file: 'server.js',
    search: "               withoutPassword: token.withoutPassword,\n               ...linkInfo(token.plain), ...v });",
    replacement: "               ohnePasswort: token.ohnePasswort,\n               ...(v.versand === 'ok' ? { link: null, linkQuelle: 'browser' } : linkInfo(token.plain)), ...v });",
    expected: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '03', name: 'Das Feld versand faellt ganz weg',
    file: 'server.js',
    search: "  return e.ok ? { delivery: 'ok', deliveryReason: '' }",
    replacement: "  return e.ok ? {}",
    expected: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '04', name: 'Der Grund faellt weg -- "aus" steht ohne Auskunft da',
    file: 'server.js',
    search: "    return { delivery: 'aus', deliveryReason: 'Es ist kein Mailzugang eingerichtet.' };",
    replacement: "    return { versand: 'aus' };",
    expected: 'Der Mailversand: das Offline-Prinzip in beide Richtungen'
  },
  /* ---- Der Versand: die Frist ---- */
  {
    nr: '05', name: 'Die aeussere Schranke ueber dem Versand faellt weg',
    file: 'mail.js',
    /* DER RUECKBAU MACHT DIE FRIST WIRKUNGSLOS, ER ENTFERNT SIE NICHT AUS DEM
       WETTLAUF. Zwei Anlaeufe davor waren falsch, und der zweite lehrreich:
       `frist` aus dem Promise.race zu streichen laesst die Zusage zwar fallen,
       aber die Zusage wirft danach UNBEHANDELT -- der Server stirbt, und der
       Lauf reisst ab, statt eine Pruefung rot zu faerben (Stolperstein 138).
       So bleibt alles stehen, und nur die Wirkung faellt weg. */
    search: "      clock = setTimeout(() => error(new Error(t(locale, 'mail.timeout'))), SEND_MS);",
    replacement: "      uhr = setTimeout(() => {}, SEND_MS);",
    expected: 'Der Mailversand: die Frist wird gemessen, nicht behauptet'
  },
  {
    nr: '06', name: 'Die Fristen von nodemailer stehen wieder auf ihren Vorgaben',
    file: 'mail.js',
    search: "    connectionTimeout: CONNECT_MS, greetingTimeout: GREETING_MS, socketTimeout: SEND_MS,",
    replacement: "",
    expected: '(erwartet STUMM — die aeussere Schranke traegt die Zusage allein; nodemailers Fristen sind der schnellere, nicht der tragende Weg)'
  },
  /* ---- Der Versand: die oeffentliche Adresse ---- */
  {
    nr: '07', name: 'Ohne oeffentliche Adresse wird trotzdem verschickt',
    file: 'server.js',
    /* STEHT DIESELBE FRAGE ZWEIMAL im Quelltext -- einmal am
       Versand des Tokenlinks und einmal in versandBereit(). Der Rueckbau
       nimmt die Zeile am VERSAND, und die naechste Zeile macht ihn
       eindeutig. */
    search: "  if (!PUBLIC.address)\n    return { delivery: 'aus', deliveryReason:",
    replacement: "  if (false)\n    return { versand: 'aus', versandGrund:",
    expected: 'Der Mailversand: die oeffentliche Adresse ist Pflicht'
  },
  {
    nr: '08', name: 'Die Adresse wird aus dem Host-Kopf abgeleitet',
    file: 'server.js',
    search: "    username: target.username, link: `${PUBLIC.address}/#/invite/${token.plain}`,",
    replacement: "    username: ziel.username, link: `https://${'HOSTKOPF'}/#/invite/${token.plain}`,",
    expected: 'Der Mailversand: die oeffentliche Adresse ist Pflicht'
  },
  /* ---- Der Versand: der Empfaenger am Zugang ---- */
  {
    nr: '09', name: 'Ein Zugang ohne Adresse wird trotzdem beschickt',
    file: 'server.js',
    search: "  if (!target.email)",
    replacement: "  if (false)",
    expected: 'Der Versandzustand neben dem Link'
  },
  {
    nr: '10', name: 'Die Adresse laesst sich beim Anlegen nicht mehr mitgeben',
    file: 'auth.js',
    search: "    .run(clean, hash, role, mailAddress || null);",
    replacement: "    .run(sauber, hash, rolle, null);",
    expected: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '11', name: 'Die eigene Adresse laesst sich nicht mehr setzen',
    file: 'auth.js',
    search: "    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(address || null, u.id);",
    replacement: "    db.prepare('UPDATE users SET email = email WHERE id = ?').run(u.id);",
    expected: 'Der Mailversand: die Testmail geht an die eigene Adresse'
  },
  /* ---- Die Testmail ---- */
  {
    nr: '12', name: 'Die Testmail nimmt die Adresse aus dem Rumpf',
    file: 'server.js',
    search: "  const ownOne = auth.getUser2(req.user.id);",
    replacement: "  const eigener = { ...auth.getUser2(req.user.id), email: (req.body || {}).an || auth.getUser2(req.user.id)?.email };",
    expected: 'Der Mailversand: die Testmail geht an die eigene Adresse'
  },
  {
    nr: '13', name: 'Die Absage ohne eigene Adresse nennt den Weg dorthin nicht',
    file: 'public/languages/de.json',
    search: "\"server.ownEmailMissing\": \"Für dein Konto ist keine E-Mail-Adresse hinterlegt. Trag sie unter Einstellungen › Mein Konto ein — die Testmail geht ausschließlich an die eigene Adresse.\",",
    replacement: "\"server.ownEmailMissing\": \"Für dein Konto ist keine E-Mail-Adresse hinterlegt.\",",
    expected: 'Der Mailversand: die Testmail geht an die eigene Adresse'
  },
  {
    /* GEZIELT AUF DEN VERGLEICH, denn DER traegt die Zusage. Der erste Anlauf
       nahm ein ausdrueckliches Loeschen der Marke weg und blieb stumm -- weil
       der Hash ueber den Zugang die Arbeit ohnehin schon tat. Das Loeschen
       war folgenlos und ist entfernt; es gibt jetzt EINEN Mechanismus, und der
       Rueckbau greift ihn an. */
    nr: '14', name: 'Die Marke gilt auch nach einer Aenderung am Zugang weiter',
    file: 'server.js',
    /* DER VERGLEICH IST IN mailtestStand() GEZOGEN -- eine
       Rechnung, zwei Rufer: die Karte und der Schalter der Selbstanmeldung.
       Zwei Mechanismen fuer eine Zusage waeren einer zu viel
       (Stolperstein 145), und deshalb faerbt dieser Rueckbau jetzt BEIDE
       Seiten rot. */
    search: "  return test && test.mark && test.mark === mail.mark(raw) ? test : null;",
    replacement: "  return test || null;",
    expected: 'Der Mailversand: die Testmail geht an die eigene Adresse'
  },
  /* ---- Die Rollenleiter am Mailzugang ---- */
  {
    nr: '15', name: 'Der Mailzugang steht auch dem Admin offen',
    file: 'server.js',
    search: "app.put('/api/mail', ownerOnly, secondConfirmNeeded('mail'), (req, res) => {",
    replacement: "app.put('/api/mail', adminOnly, secondConfirmNeeded('mail'), (req, res) => {",
    expected: 'Der Mailzugang: wer ihn setzen darf'
  },
  {
    nr: '16', name: 'Die Testmail steht auch dem Admin offen',
    file: 'server.js',
    search: "app.post('/api/mail/test', ownerOnly, async (req, res) => {",
    replacement: "app.post('/api/mail/test', adminOnly, async (req, res) => {",
    expected: 'Der Mailzugang: wer ihn setzen darf'
  },
  {
    nr: '17', name: 'Die zweite Bestaetigung faellt am Mailzugang weg',
    file: 'server.js',
    search: "app.put('/api/mail', ownerOnly, secondConfirmNeeded('mail'), (req, res) => {",
    replacement: "app.put('/api/mail', ownerOnly, (req, res) => {",
    expected: 'Der Mailzugang: wer ihn setzen darf'
  },
  /* ---- Das Passwort ---- */
  {
    nr: '18', name: 'Das Mailpasswort steht in der Antwort',
    file: 'server.js',
    search: "app.get('/api/mail', ownerOnly, (req, res) => res.json(mailCard(req)));",
    replacement: "app.get('/api/mail', ownerOnly, (req, res) => res.json({ ...mailCard(req), passwort: mail.resolve(getSetting(mail.SETTING_KEY, null)).passwort }));",
    expected: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '19', name: 'Das Mailpasswort geht in die Kontrollausgabe',
    file: 'server.js',
    search: "        `(${z.secure ? 'TLS' : 'STARTTLS'}), Absender ${z.sender}.` +",
    replacement: "        `(${z.secure ? 'TLS' : 'STARTTLS'}), Absender ${z.absender}, Passwort ${mail.resolve(roh).passwort}.` +",
    expected: 'Der Mailversand: das Passwort steht nirgends'
  },
  /* ---- Die Anbietervorlagen ---- */
  {
    nr: '20', name: 'Ein mitgeschickter Server ueberschreibt die Vorlage',
    file: 'mail.js',
    search: "  return { ...z, server: v.server, port: v.port, secure: v.secure };",
    replacement: "  return { ...z, server: z.server || v.server, port: z.port || v.port, secure: z.secure === true };",
    expected: 'Der Mailzugang: wer ihn setzen darf'
  },
  {
    nr: '21', name: 'Ein unbekannter Anbieter wird durchgelassen',
    file: 'mail.js',
    search: "  if (!v) throw message('mail.providerUnknown');",
    replacement: "  const vv = v;",
    expected: 'Der Mailzugang: wer ihn setzen darf'
  },
  /* ---- Die Frist ab dem ersten Oeffnen ---- */
  {
    nr: '22', name: 'Das erste Oeffnen startet die Frist nicht',
    file: 'server.js',
    search: "  const minutes = auth.startTokenDeadline(token.hash);",
    replacement: "  const minuten = auth.TOKEN_DEADLINE_MINUTES;",
    expected: 'Der Token: die Frist ab dem ersten Oeffnen'
  },
  {
    nr: '23', name: 'Jedes Oeffnen schiebt die Frist weiter',
    file: 'auth.js',
    search: "    WHERE hash = ? AND used_at IS NULL AND expires_at > datetime('now', ?)`);",
    replacement: "    WHERE hash = ? AND used_at IS NULL AND ? IS NOT NULL`);",
    expected: 'Der Token: die Frist ab dem ersten Oeffnen'
  },
  {
    nr: '24', name: 'Die Absage nach der Frist bekommt einen eigenen Wortlaut',
    file: 'public/languages/de.json',
    search: "\"server.linkExpired\": \"Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern.\",",
    replacement: "\"server.linkExpired\": \"Die Frist von 15 Minuten ist abgelaufen.\",",
    expected: 'Der Token: die Absage sieht immer gleich aus'
  },
  /* ---- Befund G: die voruebergehende Absage ---- */
  {
    nr: '25', name: 'Jede Absage wirft den Schluessel wieder aus der Adresse',
    file: 'public/app.js',
    search: "    if (res.status === 400) {",
    replacement: "    if (!res.ok) {",
    expected: 'Die Einladungsseite in der Oberflaeche'
  },
  {
    nr: '26', name: 'Der zweite Anlauf nach der Bremse faellt weg',
    file: 'public/app.js',
    search: "    document.getElementById('eb-again').onclick = () => showInvite(key);",
    replacement: "    document.getElementById('eb-again').onclick = () => {};",
    expected: 'Die Einladungsseite in der Oberflaeche'
  },
  /* ---- Die Oberflaeche ---- */
  {
    /* GEZIELT AUF DEN ABRUF, nicht auf die Bedingung der Karte. Ein Rueckbau
       allein an der Karte blieb stumm: mailstand ist beim Admin `null`, weil
       er gar nicht erst geholt wird -- die Karte erschiene also trotzdem
       nicht. DIE TRAGENDE ZEILE IST DER ABRUF, und der Rueckbau greift
       deshalb dort. */
    nr: '27', name: 'Der Mailzugang wird auch fuer den Admin geholt',
    file: 'public/app.js',
    search: "      ADMIN ? api('GET', '/api/requests') : null",
    replacement: "      ADMIN ? api('GET', '/api/mail') : null",
    expected: 'Die Karten des Systembereichs nach Rolle (viele rot — der Abruf reisst den ganzen Bereich mit)'
  },
  {
    nr: '28', name: 'Der Versandzustand verschwindet aus dem Linkkasten',
    file: 'public/app.js',
    search: "      ${deliveryRow(d)}",
    replacement: "      ",
    expected: 'Der Versandzustand neben dem Link'
  },
  {
    nr: '29', name: 'Das Adressfeld am eigenen Zugang schickt nichts mehr mit',
    file: 'public/app.js',
    search: "        oldPassword: old, username: name, newPassword: new1, email: address",
    replacement: "        oldPassword: alt, username: name, newPassword: neu1",
    expected: 'Die eigene Adresse in der Karte „Zugang“'
  },
  {
    /* MITGEGANGEN MIT 0.25.4 (Stolperstein 201): der Zaehlwert heisst jetzt
       `n` und nicht mehr `minutes` -- nur ueber `n` waehlt
       `PLURAL.select()` die Form, und ohne ihn stand dort immer die
       Mehrzahl („noch 1 Minuten"). Die Sache des Rueckbaus ist dieselbe
       geblieben: die Frist verschwindet von der Seite. */
    nr: '30', name: 'Die Frist steht nicht mehr auf der Einladungsseite',
    file: 'public/app.js',
    search: "        ${status.minutes ? `<strong>${tH('login.linkValidMinutes', { n: status.minutes })}</strong> ${tH('login.thenNeedNew')}` : ''}",
    replacement: "        ${false ? `<strong>${tH('login.linkValidMinutes', { n: stand.minutes })}</strong> ${tH('login.thenNeedNew')}` : ''}",
    expected: 'Die Einladungsseite in der Oberflaeche'
  },
  /* ---- Die Selbstanmeldung: die immer gleiche Antwort ---- */
  {
    nr: '31', name: 'Die Antwort verraet, dass still verworfen wurde',
    file: 'server.js',
    search: "  res.json(REQUEST_ANSWER);",
    replacement: "  res.json(klartext ? REQUEST_ANSWER : { ok: false, error: 'Name oder Adresse ist schon vergeben.' });",
    expected: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    /* DER RUECKBAU MACHT DIE ANTWORT LANGSAM, ER ENTFERNT SIE NICHT. Der
       Versand steht danach ein zweites Mal da -- das stoert nicht, denn
       geprueft wird die LAUFZEIT der Antwort, und die haengt am await davor.
       Der troepfelnde Empfaenger haelt ihn zwanzig Sekunden fest. */
    nr: '32', name: 'Die Antwort wartet wieder auf den Mailserver',
    file: 'server.js',
    search: "  const plain = an ? auth.createRequest(name, address) : null;",
    replacement: "  const plain = an ? auth.createRequest(name, adresse) : null;\n" +
            "  if (klartext) await sendConfirm(String(name).trim(), String(adresse).trim(), klartext).catch(() => {});",
    expected: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    nr: '33', name: 'Der Schalter aus fuehrt zu einer eigenen Absage',
    file: 'server.js',
    search: "  const an = getSetting('signup', false) === true;",
    replacement: "  const an = getSetting('signup', false) === true;\n" +
            "  if (!an) return res.status(403).json({ error: 'Die Selbstanmeldung ist ausgeschaltet.' });",
    expected: 'Die Selbstanmeldung: der Schalter aus'
  },
  /* ---- Die Selbstanmeldung: der Deckel und die stille Verwerfung ---- */
  {
    nr: '34', name: 'Der Deckel faellt ganz weg',
    file: 'auth.js',
    search: "  if (countRequests() >= REQUEST_CAP) return null;",
    replacement: "  if (false) return null;",
    expected: 'Die Selbstanmeldung: der Deckel'
  },
  {
    nr: '35', name: 'Der Deckel zaehlt nur die BESTAETIGTEN',
    file: 'auth.js',
    search: "  if (countRequests() >= REQUEST_CAP) return null;",
    replacement: "  if (db.prepare('SELECT COUNT(*) n FROM requests WHERE confirmed_at IS NOT NULL').get().n >= REQUEST_CAP) return null;",
    expected: 'Die Selbstanmeldung: der Deckel'
  },
  {
    nr: '36', name: 'Eine zweite Anfrage je Adresse geht durch',
    file: 'auth.js',
    search: "  if (qRequestMail.get(post)) return null;",
    replacement: "  if (false) return null;",
    expected: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    nr: '37', name: 'Ein vergebener Benutzername kommt in die Warteschlange',
    file: 'auth.js',
    search: "  if (db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE').get(clean)) return null;",
    replacement: "  if (false) return null;",
    expected: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    nr: '38', name: 'Eine vergebene Adresse ebenso',
    file: 'auth.js',
    search: "  if (qUserMail.get(post)) return null;",
    replacement: "  if (false) return null;",
    expected: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    /* DIE ZWEITE HAELFTE DERSELBEN SCHRANKE. Ohne sie bliebe der Rueckbau auf
       die Adressschranke stumm -- die Namensschranke faengt jede Lage auf, in
       der BEIDES noch einmal geschickt wird. Genau das ist beim ersten Lauf
       dieser Runde passiert. */
    nr: '67', name: 'Derselbe Wunschname darf zweimal in der Warteschlange stehen',
    file: 'auth.js',
    search: "  if (qRequestName.get(clean)) return null;",
    replacement: "  if (false) return null;",
    expected: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  {
    nr: '39', name: 'Name und Adresse von aussen sind wieder unbegrenzt lang',
    file: 'auth.js',
    search: "  if (clean.length > REQUEST_NAME_MAX || post.length > REQUEST_MAIL_MAX) return null;",
    replacement: "  if (false) return null;",
    expected: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  /* ---- Die Selbstanmeldung: das Verfallen ---- */
  {
    nr: '40', name: 'Unbestaetigte Anfragen verfallen nicht mehr',
    file: 'auth.js',
    search: "  const n = delRequestsOld.run(`-${REQUEST_HOURS} hours`).changes;",
    replacement: "  const n = 0;",
    expected: 'Die Selbstanmeldung: das Verfallen und das Aufraeumen'
  },
  {
    nr: '41', name: 'Auch die BESTAETIGTEN verfallen',
    file: 'auth.js',
    search: "  \"DELETE FROM requests WHERE confirmed_at IS NULL AND created_at < datetime('now', ?)\");",
    replacement: "  \"DELETE FROM requests WHERE created_at < datetime('now', ?)\");",
    expected: 'Die Selbstanmeldung: das Verfallen und das Aufraeumen'
  },
  {
    nr: '42', name: 'Die Anfrageroute raeumt nicht mehr vor der Deckelpruefung auf',
    file: 'auth.js',
    search: "  cleanupRequests();\n  if (countRequests() >= REQUEST_CAP) return null;",
    replacement: "  if (countRequests() >= REQUEST_CAP) return null;",
    expected: 'Die Selbstanmeldung: das Verfallen und das Aufraeumen'
  },
  /* ---- Die Selbstanmeldung: der Schalter und seine Kopplung ---- */
  {
    nr: '43', name: 'Der Schalter laesst sich ohne durchgekommene Testmail einschalten',
    file: 'server.js',
    search: "  if (!mailTestState(raw))",
    replacement: "  if (false)",
    expected: 'Die Selbstanmeldung: der Schalter braucht drei Dinge'
  },
  {
    nr: '44', name: 'Der Schalter laesst sich ohne oeffentliche Adresse einschalten',
    file: 'server.js',
    search: "      'Der Eigentümer dieser Installation drückt sie in der Karte „Mailversand“.' };\n  if (!PUBLIC.address)",
    replacement: "      'Der Eigentümer dieser Installation drückt sie in der Karte „Mailversand“.' };\n  if (false)",
    expected: 'Die Selbstanmeldung: der Schalter braucht drei Dinge'
  },
  {
    nr: '46', name: 'Ausschalten wird an dieselbe Bedingung gehaengt wie Einschalten',
    file: 'server.js',
    search: "  if (an) {\n    const b = deliveryReady();",
    replacement: "  if (true) {\n    const b = versandBereit();",
    expected: 'Die Selbstanmeldung: der Schalter aus'
  },
  {
    nr: '47', name: 'Der Schalter legt sich bei kaputtem Versand selbst um',
    file: 'server.js',
    search: "    an: getSetting('signup', false) === true,\n    deliveryReady: b.ok,",
    replacement: "    an: getSetting('signup', false) === true && b.ok,\n    versandBereit: b.ok,",
    expected: 'Die Selbstanmeldung: die immer gleiche Antwort'
  },
  /* ---- Die Selbstanmeldung: der Bestaetigungslink ---- */
  {
    nr: '48', name: 'Der Bestaetigungsschluessel steht im Klartext in der Tabelle',
    file: 'auth.js',
    search: "    .run(tokenHash(plain), clean, post);",
    replacement: "    .run(klartext, sauber, post);",
    expected: 'Die Selbstanmeldung: die Bestaetigungsmail'
  },
  {
    nr: '49', name: 'Die Bestaetigung nimmt jeden Schluessel an',
    file: 'auth.js',
    search: "  return setConfirmed.run(tokenHash(raw), `-${REQUEST_HOURS} hours`).changes > 0;",
    replacement: "  setConfirmed.run(tokenHash(roh), `-${REQUEST_HOURS} hours`); return true;",
    expected: 'Die Selbstanmeldung: der Bestaetigungslink hat keine Passwortkraft'
  },
  {
    nr: '50', name: 'Die Karte gibt den Hash der Anfrage mit heraus',
    file: 'auth.js',
    search: "  `SELECT id, username, email, created_at, confirmed_at\n     FROM requests WHERE confirmed_at IS NOT NULL",
    replacement: "  `SELECT id, username, email, created_at, confirmed_at, hash\n     FROM requests WHERE confirmed_at IS NOT NULL",
    expected: 'Die Selbstanmeldung: die Freischaltung'
  },
  {
    nr: '51', name: 'Die unbestaetigte Anfrage erscheint beim Admin',
    file: 'auth.js',
    search: "     FROM requests WHERE confirmed_at IS NOT NULL ORDER BY confirmed_at ASC, id ASC`);",
    replacement: "     FROM requests ORDER BY created_at ASC, id ASC`);",
    expected: 'Die Selbstanmeldung: die unbestaetigte Anfrage'
  },
  {
    nr: '52', name: 'Die unbestaetigte Anfrage laesst sich freischalten',
    file: 'server.js',
    search: "  const a = auth.getRequest(req.params.id);\n  if (!a || !a.confirmed_at)\n    return res.status(404).json({ error: t(localeOf(req), 'server.requestUnknown')});\n  let created, token;",
    replacement: "  const a = auth.getRequest(req.params.id);\n  if (!a)\n    return res.status(404).json({ error: t(localeOf(req), 'server.requestUnknown')});\n  let angelegt, token;",
    expected: 'Die Selbstanmeldung: die unbestaetigte Anfrage'
  },
  /* ---- Die Selbstanmeldung: Freischaltung, Ablehnung, Rolle ---- */
  {
    nr: '53', name: 'Die Rolle kommt aus dem Rumpf der Anfrage',
    file: 'server.js',
    search: "    created = await auth.createUser(a.username, null, 'user', true, req.user.id, a.email);",
    replacement: "    angelegt = await auth.createUser(a.username, null, (req.body || {}).rolle || 'user', true, req.user.id, a.email);",
    expected: 'Die Selbstanmeldung: die Rolle ist immer user'
  },
  {
    nr: '54', name: 'Die Zeile bleibt nach der Freischaltung stehen',
    file: 'server.js',
    search: "  auth.removeRequest(a.id);\n  /* DIE ZEILE NENNT DEN NEUEN ZUGANG",
    replacement: "  /* DIE ZEILE NENNT DEN NEUEN ZUGANG",
    expected: 'Die Selbstanmeldung: die Freischaltung'
  },
  {
    nr: '55', name: 'Die Freischaltung erzeugt keinen Token',
    file: 'server.js',
    search: "    token = auth.createToken(created.id, 'invite', req.user.id);",
    replacement: "    token = { klartext: 'x'.repeat(64), zweck: 'invite', tage: 7, id: angelegt.id, username: angelegt.username };",
    expected: 'Die Selbstanmeldung: die Freischaltung'
  },
  {
    nr: '56', name: 'Die Protokollzeile der Freischaltung faellt weg',
    file: 'server.js',
    search: "  auth.log('request.approve', { actor: req.user.id, target: created.id });",
    replacement: "  // auth.log('request.approve', { wer: req.user.id, ziel: angelegt.id });",
    expected: 'Die Selbstanmeldung: die Freischaltung'
  },
  {
    nr: '57', name: 'Die Ablehnung entfernt die Zeile nicht',
    file: 'server.js',
    search: "  auth.removeRequest(a.id);\n  auth.log('request.reject', { actor: req.user.id });",
    replacement: "  auth.log('request.reject', { wer: req.user.id });",
    expected: 'Die Selbstanmeldung: die Ablehnung'
  },
  {
    /* DER NAME IN merkmal WIRD VON protokolliere() ABGEWIESEN -- MERKMALE ist
       eine geschlossene Liste, und die Zeile entsteht dann GAR NICHT. Der
       Rueckbau faerbt deshalb "die Protokollzeile steht" rot und nicht "der
       Name steht nicht darin": genau so ist "kein Freitext von aussen"
       BAULICH wahr statt durchgesetzt. */
    nr: '58', name: 'Der Name des Abgewiesenen soll ins Protokoll',
    file: 'server.js',
    search: "  auth.log('request.reject', { actor: req.user.id });",
    replacement: "  auth.log('request.reject', { wer: req.user.id, merkmal: a.username });",
    expected: 'Die Selbstanmeldung: die Ablehnung'
  },
  {
    nr: '59', name: 'Die Anfrage selbst schreibt eine Protokollzeile',
    file: 'server.js',
    search: "  const plain = an ? auth.createRequest(name, address) : null;",
    replacement: "  const plain = an ? auth.createRequest(name, adresse) : null;\n" +
            "  if (klartext) auth.log('request.approve', { wer: 1 });",
    expected: 'Die Selbstanmeldung: keine Zeile, die ein Fremder ausloesen kann'
  },
  /* ---- Die Selbstanmeldung: die Bremse ---- */
  {
    nr: '60', name: 'Die Bremse fehlt an der Anfrageroute',
    file: 'server.js',
    search: "app.post('/api/signup', async (req, res) => {\n  if (!await tokenThrottleFree(req, res)) return;",
    replacement: "app.post('/api/signup', async (req, res) => {",
    expected: 'Die Selbstanmeldung: die Bremse greift an beiden Routen'
  },
  {
    nr: '61', name: 'Die Bremse fehlt an der Bestaetigungsroute',
    file: 'server.js',
    search: "  const ip = auth.clientIp(req);\n  if (!await tokenThrottleFree(req, res)) return;\n  if (!auth.confirmRequest((req.body || {}).key)) {",
    replacement: "  const ip = auth.clientIp(req);\n  if (!auth.confirmRequest((req.body || {}).schluessel)) {",
    expected: 'Die Selbstanmeldung: die Bremse greift an beiden Routen'
  },
  /* ---- Die Selbstanmeldung in der Oberflaeche ---- */
  {
    nr: '62', name: 'Das Anfrageformular steht auch bei ausgeschaltetem Schalter da',
    file: 'public/app.js',
    search: "    ${SIGNUP ? `<p class=\"sub login-divider\">${tH('login.noAccountYet')}</p>",
    replacement: "    ${true ? `<p class=\"sub login-divider\">${tH('login.noAccountYet')}</p>",
    expected: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* DIE BEDINGUNG AUS DER ERSTEN FASSUNG, wiederhergestellt: die Karte
       erscheint nur, wenn der Schalter an ist oder Anfragen offen sind. Das
       ist die Sackgasse aus dem Betrieb -- der Schalter steht IN der Karte,
       also gaebe es keinen Weg, ihn je einzuschalten. */
    /* SEIT 0.16.0 STEHT DIE KLEMME ALS FELD IN SYS_KARTEN und nicht mehr als
       Klammer im Markup -- der Rueckbau greift deshalb dort an. Die Sache ist
       dieselbe geblieben: die Karte traegt den Schalter, mit dem sich die
       Selbstanmeldung ueberhaupt erst einschalten laesst. */
    nr: '63', name: 'Die Karte „Anfragen“ verschwindet, solange der Schalter aus ist',
    file: 'public/app.js',
    search: "visible: (g) => ADMIN && !!g.requests,",
    replacement: "sichtbar: (g) => ADMIN && !!g.anfragen && (g.anfragen.an || g.anfragen.anfragen.length),",
    expected: 'Die Karten im Systembereich'
  },
  {
    /* AUS DEM BETRIEB: der Weg zur Selbstanmeldung stand als Verweis in einer
       Fusszeile und wurde uebersehen. Er ist jetzt ein Knopf in derselben
       Groesse wie "Anmelden"; der Rueckbau macht wieder einen Verweis daraus. */
    nr: '68', name: 'Der Weg zur Anfrage wird wieder ein Verweis statt eines Knopfes',
    file: 'public/app.js',
    search: "      <button class=\"btn login-alt\" id=\"l-request\">${tH('login.requestAccess')}</button>",
    replacement: "      <a href=\"#\" id=\"l-request\">${tH('login.requestAccess')}</a>",
    expected: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* DIE ANDERE HAELFTE VON 68: der Knopf wird so leise, dass er im
       Ruhezustand keiner mehr ist. Der Rueckbau nimmt ihm die Umrandung. */
    nr: '69', name: 'Der gedaempfte Knopf verliert auch seine Umrandung',
    file: 'public/style.css',
    search: "  background: var(--accent-dim); border-color: var(--accent-line);",
    replacement: "  background: var(--accent-dim); border-color: transparent;",
    expected: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* AUS DEM BETRIEB: die Trennlinie ueber dem Knopf lag quer durch eine
       Karte, die sonst keine kennt. Sie ist weg, der Abstand traegt die
       Trennung. Der Rueckbau holt den Strich zurueck. */
    nr: '73', name: 'Der Strich ueber dem Anfrageknopf kommt zurueck',
    file: 'public/style.css',
    search: "  margin: 28px 0 0; font-size: .87rem;",
    replacement: "  margin: 22px 0 0; padding-top: 18px; border-top: 1px solid var(--line); font-size: .87rem;",
    expected: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* UND DIE ANDERE HAELFTE: ohne Strich UND ohne Abstand liefe der Knopf
       mit dem Anmeldeknopf zusammen. */
    nr: '74', name: 'Und der Abstand, der ihn ersetzt, schrumpft auf nichts',
    file: 'public/style.css',
    search: "  margin: 28px 0 0; font-size: .87rem;",
    replacement: "  margin: 10px 0 0; font-size: .87rem;",
    expected: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* DIE FAERBUNG FAELLT WEG. Ohne Linie darueber und ohne eigene Farbe
       stuende ein grauer Knopf auf dunkelgrauem Grund. */
    nr: '75', name: 'Der Anfrageknopf verliert seine leichte Faerbung',
    file: 'public/style.css',
    search: "  background: var(--accent-dim); border-color: var(--accent-line);",
    replacement: "  background: transparent; border-color: var(--line);",
    expected: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    /* UND DIE GEGENRICHTUNG: die Faerbung wird so laut wie der Anmeldeknopf.
       Dann saessen zwei gleich laute Knoepfe uebereinander und die Seite
       sagte nicht mehr, welcher der gewoehnliche Weg ist. */
    nr: '76', name: 'Der Anfrageknopf wird so laut wie "Anmelden"',
    file: 'public/style.css',
    search: "  background: var(--accent-dim); border-color: var(--accent-line);",
    replacement: "  background: var(--accent); border-color: var(--accent);",
    expected: 'Die Anmeldeseite: das Anfrageformular'
  },
  {
    nr: '64', name: 'Die rote Zeile bei kaputtem Versand faellt weg',
    file: 'public/app.js',
    search: "        ${requests.an && !requests.deliveryReady ? `<p class=\"warn-box\" id=\"signup-broken\"",
    replacement: "        ${false ? `<p class=\"warn-box\" id=\"signup-broken\"",
    expected: 'Die Karte „Anfragen“'
  },
  {
    nr: '65', name: 'Die Bestaetigungsseite meldet gleich an',
    file: 'public/app.js',
    search: "  const best = (location.hash || '').match(/^#\\/confirm\\/([0-9a-f]{16,128})$/);\n  if (best) return showConfirm(best[1]);",
    replacement: "  const best = (location.hash || '').match(/^#\\/confirm\\/([0-9a-f]{16,128})$/);\n  if (best) return showInvite(best[1]);",
    expected: 'Die Bestaetigungsseite in der Oberflaeche'
  },
  {
    nr: '66', name: 'Die gekuerzte Zeile im Mailtext verliert eine Auskunft',
    file: 'public/languages/de.json',
    /* DIE ZEILE STEHT ZWEIMAL -- in der Einladung und in der Ruecksetzung.
       Genommen wird die der EINLADUNG; die naechsten Zeilen machen sie
       eindeutig. */
    search: "Danach brauchst du einen neuen Link vom Admin.\\n\\nWer diesen Link hat, kommt herein",
    replacement: "\\nWer diesen Link hat, kommt herein",
    expected: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  /* ---- Die Marke der Instanz ---- */
  {
    /* NEU GEZIELT: marke-hell.svg ist entfernt -- sie war Byte fuer Byte
       favicon.svg. Der Rueckbau greift jetzt zur verbliebenen Fassung mit
       Kachel, und die saesse auf dunklem Grund als sichtbares Rechteck. */
    nr: '70', name: 'Die Marke folgt dem Schema nicht mehr',
    file: 'public/app.js',
    search: '<path d="M8 6 V26" stroke="var(--brand-grey)"/>',
    replacement: '<path d="M8 6 V26" stroke="#838c95"/>',
    expected: 'Die Marke der Instanz'
  },
  {
    /* DIE MARKE TRAEGT WIEDER DIE KLASSE DER KOMMENTARKNOEPFE -- und saesse
       damit wieder in einem Kaestchen mit Rahmen und rundem Fuellgrund. */
    nr: '71', name: 'Die Marke heisst wieder wie die Kommentarknoepfe',
    file: 'public/app.js',
    search: '<svg class="logo" viewBox=',
    replacement: '<svg class="mark" viewBox=',
    expected: 'Die Marke der Instanz'
  },
  {
    nr: '72', name: 'Der Tab bekommt kein Favicon mehr',
    file: 'public/index.html',
    search: '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
    replacement: '',
    expected: 'Die Marke der Instanz'
  },
  /* ---- Die Markenzeile der Anmeldeseiten ---- */
  {
    /* DER STAND VOR DER BERICHTIGUNG AUS DEM BETRIEB: Marke UEBER dem Namen.
       Der Helfer legt dann keinen Kasten mehr an, und die beiden stapeln
       sich wieder. */
    nr: '77', name: 'Marke und Name stapeln sich wieder uebereinander',
    file: 'public/app.js',
    search: '  `<div class="login-brand">${MARK(36)}<h1>${esc(TITLE_PUBLIC)}</h1></div>`;',
    replacement: '  `${MARK(40)}<h1>${esc(TITLE_PUBLIC)}</h1>`;',
    expected: 'Die Markenzeile der Anmeldeseiten'
  },
  {
    /* DIE REIHENFOLGE KIPPT: erst das Wort, dann das Zeichen. Der Kasten
       bleibt, also greift hier nur die Zeile, die die Reihenfolge prueft. */
    nr: '78', name: 'Erst das Wort, dann das Zeichen',
    file: 'public/app.js',
    search: '  `<div class="login-brand">${MARK(36)}<h1>${esc(TITLE_PUBLIC)}</h1></div>`;',
    replacement: '  `<div class="login-brand"><h1>${esc(TITLE_PUBLIC)}</h1>${MARK(36)}</div>`;',
    expected: 'Die Markenzeile der Anmeldeseiten'
  },
  {
    /* DER KASTEN BLEIBT, DAS STYLESHEET STELLT IHN ABER NICHT MEHR
       NEBENEINANDER. Zwei Bloecke untereinander sehen im Baum aus wie eine
       Zeile -- deshalb prueft der Prueflauf beides. */
    nr: '79', name: 'Die Markenzeile ist keine Zeile mehr',
    file: 'public/style.css',
    search: '  display: flex; align-items: center; gap: 11px; margin: 0 0 5px;',
    replacement: '  display: block; margin: 0 0 5px;',
    expected: 'Die Marke der Instanz'
  },
  {
    /* DIE UEBERSCHRIFT NIMMT IHREN UNTERRAND WIEDER MIT -- bei
       align-items: center saesse sie damit um die halbe Hoehe zu hoch und
       die Marke stuende schief daneben. */
    nr: '80', name: 'Die Ueberschrift in der Zeile traegt wieder einen Unterrand',
    file: 'public/style.css',
    search: '.login-card .login-brand h1 { margin: 0; }',
    replacement: '.login-card .login-brand h1 { margin: 0 0 5px; }',
    expected: 'Die Marke der Instanz'
  },
  {
    /* DIE DOPPELTE DATEI KOMMT ZURUECK: favicon.svg noch einmal unter einem
       zweiten Namen. Genau der Zustand, der aufgeraeumt wurde. */
    nr: '81', name: 'Dieselbe Datei liegt wieder unter zwei Namen in public/',
    file: 'public/favicon.svg',
    copy: 'public/marke-hell.svg',
    expected: 'Die Marke der Instanz'
  },
  /* ---- Der zweite Faktor: die Rechnung, 0.10.0 ----
     DIE DREI KENNWERTE EINZELN. Jedes davon ist fuer sich das bessere
     Verfahren und wird von Google Authenticator stillschweigend falsch
     gelesen -- ein Rueckbau, der stumm bliebe, hiesse: die Instanz bindet sich
     an nichts. */
  {
    nr: '82', name: 'Acht Ziffern statt sechs',
    file: 'twofactor.js',
    search: 'const DIGITS = 6;',
    replacement: 'const DIGITS = 8;',
    expected: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    nr: '83', name: 'SHA-256 statt SHA-1',
    file: 'twofactor.js',
    search: "const ALGORITHM = 'sha1';",
    replacement: "const ALGORITHM = 'sha256';",
    expected: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    nr: '84', name: 'Sechzig Sekunden statt dreissig',
    file: 'twofactor.js',
    search: 'const STEP_SECONDS = 30;',
    replacement: 'const STEP_SECONDS = 60;',
    expected: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    /* DAS DYNAMISCHE ABGREIFEN AUS RFC 4226, Abschnitt 5.3. Ein fester Anfang
       statt der letzten vier Bit sieht plausibel aus und ergibt weltweit
       andere Codes -- die eine Stelle, an der eine eigene Umsetzung typisch
       danebenliegt. */
    nr: '85', name: 'Der Anfang des Abgreifens steht fest statt aus dem Hash zu kommen',
    file: 'twofactor.js',
    search: '  const o = h[h.length - 1] & 0x0f;',
    replacement: '  const o = 0;',
    expected: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    /* DER ZAEHLER IST ACHT BYTES GROSS. Nur die untere Haelfte zu schreiben
       stimmt bis zum Jahr 6053 -- und der Testvektor T = 20 000 000 000 liegt
       darueber. Ohne ihn bliebe genau diese Zeile ungeprueft. */
    nr: '86', name: 'Der Zaehler wird nur in seiner unteren Haelfte geschrieben',
    file: 'twofactor.js',
    search: "  z.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);",
    replacement: "  z.writeUInt32BE(0, 0);",
    expected: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  /* ---- Der zweite Faktor: das Fenster und die Wiederverwendung ---- */
  {
    nr: '87', name: 'Das Fenster wird auf zwei Schritte geweitet',
    file: 'twofactor.js',
    search: 'const WINDOW = 1;',
    replacement: 'const WINDOW = 2;',
    expected: 'Der zweite Faktor: das Zeitfenster'
  },
  {
    nr: '88', name: 'Es gibt gar kein Nachbarfenster mehr',
    file: 'twofactor.js',
    search: 'const WINDOW = 1;',
    replacement: 'const WINDOW = 0;',
    expected: 'Der zweite Faktor: das Zeitfenster'
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
    file: 'auth.js',
    search: "    WHERE user_id = ? AND (last_counter IS NULL OR last_counter < ?)`);",
    replacement: "    WHERE user_id = ? AND (last_counter IS NULL OR ? IS NOT NULL)`);",
    expected: 'Der zweite Faktor: ein Code gilt genau einmal'
  },
  {
    nr: '90', name: 'Der verbrauchte Zaehler wird gar nicht erst geschrieben',
    file: 'auth.js',
    search: "    if (!useCounter.run(counter, id, counter).changes) return null;\n    return 'app';",
    replacement: "    return 'app';",
    expected: 'Der zweite Faktor: ein Code gilt genau einmal'
  },
  {
    /* DER BESTAETIGENDE CODE ZAEHLT ALS VERBRAUCHT. Ohne das truege er
       unmittelbar danach ein zweites Mal -- und "genau einmal" waere an seiner
       ERSTEN Anwendung falsch. */
    nr: '91', name: 'Der bestaetigende Code beim Einschalten zaehlt nicht als verbraucht',
    file: 'auth.js',
    search: "    `UPDATE two_factor SET confirmed_at = datetime('now'), last_counter = ?\n      WHERE user_id = ?`).run(counter, id);",
    replacement: "    `UPDATE two_factor SET confirmed_at = datetime('now'), last_counter = NULL\n      WHERE user_id = ?`).run(id);",
    expected: 'Der zweite Faktor: ein Code gilt genau einmal'
  },
  /* ---- Der zweite Faktor: die Anmeldung ---- */
  {
    nr: '92', name: 'Die Anmeldung meldet auch mit zweitem Faktor gleich an',
    file: 'server.js',
    search: "  if (auth.twoFactorOn(user.id)) {\n    return res.json({ twoFactor: true, ...auth.createLoginTicket(user.id) });\n  }",
    replacement: "",
    expected: 'Der zweite Faktor: ohne Code kommt niemand herein'
  },
  {
    /* DIE AUSKUNFT KOMMT ERST NACH RICHTIGEM PASSWORT. Vorgezogen waere die
       Anmeldeseite ein Werkzeug zum Durchprobieren von Namen: "dieser hat
       einen zweiten Faktor" hiesse "diesen Namen gibt es".
       DER RUECKBAU SETZT DIE AUSKUNFT IN DIE ABSAGE, statt die Reihenfolge zu
       drehen: so bleibt alles Uebrige stehen, und nur die eine Zusage faellt
       weg (Stolperstein 138). */
    nr: '93', name: 'Die Absage verraet, ob der Zugang einen zweiten Faktor hat',
    file: 'server.js',
    search: "    return res.status(401).json({ error: t(localeOf(req), 'server.loginWrong')});",
    replacement: "    return res.status(401).json({ error: t(localeOf(req), 'server.loginWrong'),\n      zweifaktor: auth.twoFactorOn((auth.getUserByName(user) || {}).id) });",
    expected: 'Der zweite Faktor: die Auskunft kommt erst nach richtigem Passwort'
  },
  {
    nr: '94', name: 'Der Ausweis wird nicht verbraucht',
    file: 'auth.js',
    search: "  tickets.delete(k);\n  return Date.now() <= a.until ? a.id : null;",
    replacement: "  return Date.now() <= a.until ? a.id : null;",
    expected: 'Der zweite Faktor: ohne Code kommt niemand herein'
  },
  {
    /* DIE FRIST IST IM PRUEFLAUF NICHT ZU MESSEN -- zwei Minuten zu warten
       waere eine Prueflage, die jeder Lauf bezahlt. Gehalten wird sie deshalb
       ueber die ZAHL in der Antwort: der Ausweis nennt seine Sekunden, und sie
       sind dieselben wie bei der Freigabe der zweiten Bestaetigung. Ein Wert,
       eine Regel, eine Gegenprobe. */
    nr: '95', name: 'Der Ausweis bekommt eine eigene, laengere Frist',
    file: 'auth.js',
    search: 'const LOGIN_TICKET_MS = RELEASE_MS;',
    replacement: 'const LOGIN_TICKET_MS = 3600 * 1000;',
    expected: 'Der zweite Faktor: der Rundlauf'
  },
  {
    /* DIE BENUTZERNUMMER KOMMT AUS DEM AUSWEIS UND NIE AUS DEM RUMPF. Stuende
       sie dort, waere das richtige Passwort EINES Zugangs die Eintrittskarte
       fuer JEDEN anderen. */
    nr: '96', name: 'Die Benutzernummer im zweiten Schritt kommt aus dem Rumpf',
    file: 'server.js',
    search: "  const id = auth.useLoginTicket(ticket);",
    replacement: "  const id = Number((req.body || {}).id) || auth.useLoginTicket(ausweis);",
    expected: 'Der zweite Faktor: ohne Code kommt niemand herein'
  },
  /* ---- Der zweite Faktor: die Bremse ----
     SECHS DIGITS SIND EINE MILLION; ungebremst ist das kein Faktor, sondern
     eine Verzoegerung. Der zweite Schritt faellt NICHT von selbst in die
     Bremse -- er ist eine eigene Route. */
  {
    nr: '97', name: 'Die Bremse fehlt am zweiten Schritt',
    file: 'server.js',
    search: "  const throttle = auth.checkThrottle(ip, null);\n  if (throttle.blocked) {\n    return res.status(429).json({\n      error: t(localeOf(req), 'server.throttled', { seconds: throttle.retryInSec })});\n  }\n  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));\n  const id = auth.useLoginTicket(ticket);",
    replacement: "  const id = auth.useLoginTicket(ausweis);",
    expected: 'Der zweite Faktor: die Anmeldebremse greift am zweiten Schritt'
  },
  {
    /* DIE REIHENFOLGE SELBST. Steht die Bremse hinter dem Ausweis, bekommt ein
       gesperrter Aufrufer eine 401 ueber den Ausweis statt der 429 -- und ob
       sie hier ueberhaupt gilt, waere von aussen nicht mehr zu sehen. Genau
       daran ist die erste Fassung der Bremsprobe stumm geblieben. */
    nr: '123', name: 'Die Bremse steht wieder HINTER dem Ausweis',
    file: 'server.js',
    search: "  const throttle = auth.checkThrottle(ip, null);\n  if (throttle.blocked) {\n    return res.status(429).json({\n      error: t(localeOf(req), 'server.throttled', { seconds: throttle.retryInSec })});\n  }\n  if (throttle.delayMs) await new Promise(r => setTimeout(r, throttle.delayMs));\n  const id = auth.useLoginTicket(ticket);\n  if (!id) {\n    auth.noteFailure(ip, null);\n    return res.status(401).json({ error: t(localeOf(req), 'server.sessionExpired')});\n  }",
    replacement: "  const id = auth.useLoginTicket(ausweis);\n  if (!id) {\n    auth.noteFailure(ip, null);\n    return res.status(401).json({ error: t(localeOf(req), 'server.sessionExpired')});\n  }\n  const bremse = auth.checkThrottle(ip, null);\n  if (bremse.blocked) {\n    return res.status(429).json({\n      error: t(localeOf(req), 'server.throttled', { seconds: bremse.retryInSec })});\n  }\n  if (bremse.delayMs) await new Promise(r => setTimeout(r, bremse.delayMs));",
    expected: 'Der zweite Faktor: die Anmeldebremse greift am zweiten Schritt'
  },
  {
    nr: '98', name: 'Der Fehlversuch am zweiten Schritt wird nicht gezaehlt',
    file: 'server.js',
    search: "  if (!auth.checkTwoFactor(id, code)) {\n    auth.noteFailure(ip, name);",
    replacement: "  if (!auth.checkTwoFactor(id, code)) {",
    expected: 'Der zweite Faktor: die Anmeldebremse greift am zweiten Schritt'
  },
  {
    /* Stuende noteSuccess unmittelbar hinter der Passwortpruefung, loeschte
       der erste Schritt den Zaehler, den der zweite gerade aufbaut -- und die
       Bremse schluege am zweiten Schritt nie zu. */
    nr: '99', name: 'Der erste Schritt setzt den Zaehler der Bremse wieder zurueck',
    file: 'server.js',
    search: "  if (auth.twoFactorOn(user.id)) {\n    return res.json({ twoFactor: true, ...auth.createLoginTicket(user.id) });\n  }\n  auth.noteSuccess(ip, username);",
    replacement: "  auth.noteSuccess(ip, username);\n  if (auth.twoFactorOn(user.id)) {\n    return res.json({ zweifaktor: true, ...auth.createLoginTicket(user.id) });\n  }",
    expected: 'Der zweite Faktor: die Anmeldebremse greift am zweiten Schritt'
  },
  /* ---- Der zweite Faktor: die Wiederherstellungscodes ---- */
  {
    nr: '100', name: 'Die Wiederherstellungscodes liegen im Klartext in der Tabelle',
    file: 'auth.js',
    search: "    for (const k of plains) insertCode.run(tokenHash(k), id);",
    replacement: "    for (const k of klartexte) insCode.run(k, id);",
    expected: 'Der zweite Faktor: die Wiederherstellungscodes'
  },
  {
    nr: '101', name: 'Ein Wiederherstellungscode wird nicht verbraucht',
    file: 'auth.js',
    search: "    WHERE hash = ? AND user_id = ? AND used_at IS NULL`);",
    replacement: "    WHERE hash = ? AND user_id = ?`);",
    expected: 'Der zweite Faktor: die Wiederherstellungscodes'
  },
  {
    nr: '102', name: 'Es entstehen sieben Codes statt acht',
    file: 'twofactor.js',
    search: 'const RECOVERY_COUNT = 8;',
    replacement: 'const RECOVERY_COUNT = 7;',
    expected: 'Der zweite Faktor: die Rechnung gegen den Standard'
  },
  {
    nr: '103', name: 'Die alten Codes bleiben beim Erneuern stehen',
    file: 'auth.js',
    search: "    db.prepare('DELETE FROM two_factor_codes WHERE user_id = ?').run(id);\n    // tokenHash() WIRD WIEDERVERWENDET",
    replacement: "    // tokenHash() WIRD WIEDERVERWENDET",
    expected: 'Der zweite Faktor: die Wiederherstellungscodes'
  },
  /* ---- Der zweite Faktor: das Geheimnis ---- */
  {
    nr: '104', name: 'Das Geheimnis steht auch nach dem Bestaetigen in der Antwort',
    file: 'server.js',
    search: "    res.json(auth.turnTwoFactorOn(req.user.id, code, req.user.id));",
    replacement: "    res.json({ ...auth.turnTwoFactorOn(req.user.id, code, req.user.id),\n" +
            "      secret: db.prepare('SELECT secret g FROM two_factor WHERE user_id = ?').get(req.user.id).g });",
    expected: 'Der zweite Faktor: das Geheimnis kommt aus keiner Antwort'
  },
  {
    nr: '105', name: 'Die Karte "Zugang" gibt das Geheimnis mit heraus',
    file: 'server.js',
    search: "             twoFactor: auth.twoFactorState(req.user.id) });",
    replacement: "             zweifaktor: { ...auth.twoFactorState(req.user.id),\n" +
            "               secret: (db.prepare('SELECT secret g FROM two_factor WHERE user_id = ?').get(req.user.id) || {}).g } });",
    expected: 'Der zweite Faktor: das Geheimnis kommt aus keiner Antwort'
  },
  {
    nr: '106', name: 'Ein zweiter Start ueberschreibt einen laufenden zweiten Faktor',
    file: 'auth.js',
    search: "  if (twoFactorOn(id)) throw new Message('login.twoFactorAlreadyOn');",
    replacement: "",
    expected: 'Der zweite Faktor: das Geheimnis kommt aus keiner Antwort'
  },
  /* ---- Der zweite Faktor: der Tokenweg und der Admin ---- */
  {
    /* DIE LUECKE, DIE DIESE RUNDE SCHLIESST: ohne diese Zeilen erzeugt ein
       Admin einen Ruecksetzlink fuer einen fremden Zugang, oeffnet ihn selbst
       und waere angemeldet -- am zweiten Faktor vorbei. */
    nr: '107', name: 'Der Tokenweg meldet wieder gleich an',
    file: 'server.js',
    search: "  if (auth.twoFactorOn(result.id)) {\n    return res.json({\n      ok: true, username: result.username, twoFactor: true,\n      ...auth.createLoginTicket(result.id)\n    });\n  }",
    replacement: "",
    expected: 'Der zweite Faktor: der Tokenweg aus 0.8.80 fragt ebenfalls'
  },
  {
    nr: '108', name: 'Ein fremdes Passwort zu setzen raeumt den zweiten Faktor mit weg',
    file: 'auth.js',
    search: "async function setNewPassword(userId, newPassword, actor) {",
    replacement: "async function setNewPassword(userId, newPassword, wer) {\n" +
            "  db.prepare('DELETE FROM two_factor WHERE user_id = ?').run(Number(userId) || 0);",
    expected: 'Der zweite Faktor: ein Admin kommt an einen fremden nicht heran'
  },
  {
    /* NAEHME DAS SPERREN DEN FAKTOR MIT, waere "sperren und wieder freigeben"
       der Weg, an dem ein Admin einen FREMDEN zweiten Faktor abstreift. Der
       Rueckbau baut genau die Zeile ein, die neben den beiden daneben
       plausibel aussieht. */
    nr: '109', name: 'Sperren raeumt den zweiten Faktor mit weg',
    file: 'auth.js',
    search: "    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);\n    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(u.id);\n  }\n  log('user.status'",
    replacement: "    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);\n    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(u.id);\n    db.prepare('DELETE FROM two_factor WHERE user_id = ?').run(u.id);\n  }\n  protokolliere('user.status'",
    expected: 'Der zweite Faktor: ein Admin kommt an einen fremden nicht heran'
  },
  {
    nr: '110', name: 'Ausschalten geht ohne Code',
    file: 'server.js',
    search: "  if (!await ownPasswordMatches(req, res, password)) return;\n  if (!auth.checkTwoFactor(req.user.id, code))\n    return res.status(403).json({ error: t(localeOf(req), auth.TWO_FACTOR_DENIAL)});\n  auth.turnTwoFactorOff(req.user.id, req.user.id);",
    replacement: "  if (!await ownPasswordMatches(req, res, passwort)) return;\n  auth.turnTwoFactorOff(req.user.id, req.user.id);",
    expected: 'Der zweite Faktor: der Rundlauf'
  },
  {
    nr: '111', name: 'usertool.js schaltet den zweiten Faktor nicht mehr ab',
    file: 'usertool.js',
    search: "  auth.turnTwoFactorOff(u.id, auth.FROM_HOST);",
    replacement: "  // auth.turnTwoFactorOff(u.id, auth.FROM_HOST);",
    expected: 'Der zweite Faktor: usertool.js auf dem Wirt'
  },
  /* ---- Der zweite Faktor: die zweite Bestaetigung ---- */
  {
    nr: '112', name: 'Die zweite Bestaetigung fragt den Code nicht mehr',
    file: 'server.js',
    search: "  if (auth.twoFactorOn(req.user.id) && !auth.checkTwoFactor(req.user.id, code)) {",
    replacement: "  if (false) {",
    expected: 'Der zweite Faktor: die zweite Bestaetigung fragt zusaetzlich'
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
    file: 'public/app.js',
    search: "    : ''), TWO_FACTOR);",
    replacement: "    : ''), true);",
    expected: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    /* DIE REIHENFOLGE: PASSWORT, DANN CODE. Umgekehrt erfuehre jemand ohne das
       Passwort, ob am Zugang ein Faktor haengt. */
    nr: '114', name: 'Der Code wird VOR dem Passwort geprueft',
    file: 'server.js',
    search: "  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);\n  if (!row || !await auth.checkPassword(String(password || ''), row.password_hash)) {",
    replacement: "  if (auth.twoFactorOn(req.user.id) && !auth.checkTwoFactor(req.user.id, code))\n" +
            "    return res.status(403).json({ error: auth.TWO_FACTOR_DENIAL, zweifaktor: true });\n" +
            "  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);\n  if (!row || !await auth.checkPassword(String(password || ''), row.password_hash)) {",
    expected: 'Der zweite Faktor: die zweite Bestaetigung fragt zusaetzlich'
  },
  /* ---- Der zweite Faktor: die Tabellen und die Oberflaeche ---- */
  {
    /* GEZIELT AUF DEN INDEX UND NICHT AUF DIE TABELLEN. Ein Rueckbau, der die
       DDL einer der beiden Tabellen wegnimmt, macht den Server
       UNSTARTBAR -- auth.js bereitet seine Anweisungen beim Laden vor, und
       "no such table" beendet den Prozess. Der Lauf risse dann ab, statt rot
       zu werden (Stolperstein 138). Die Zusage "eine fehlende TABELLE waechst
       nach" haelt der Pruefstand deshalb an einem echten Versuch statt an einer
       Behauptung: er entfernt beide von Hand aus einer bestehenden Instanz,
       startet einmal und sieht nach. Der INDEX daneben laesst sich gefahrlos
       zuruecknehmen und traegt dieselbe Aussage ueber CREATE ... IF NOT EXISTS. */
    nr: '115', name: 'Der Index auf zweifaktor_codes wird nicht mehr angelegt',
    file: 'db.js',
    search: 'CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user ON two_factor_codes(user_id);',
    replacement: '',
    expected: 'Der zweite Faktor: die Tabellen legen sich selbst an'
  },
  {
    nr: '116', name: 'Der Zustand faellt aus der Antwort der Karte "Zugang"',
    file: 'server.js',
    search: "             twoFactor: auth.twoFactorState(req.user.id) });",
    replacement: "             });",
    expected: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '117', name: 'Die Zahl der uebrigen Wiederherstellungscodes faellt weg',
    file: 'public/app.js',
    search: "          <strong>${tH('card.codesLeft', { codesLeft: status.codesOpen, codesTotal: status.codesTotal })}</strong>",
    replacement: "          <strong>vorhanden</strong>",
    expected: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    /* DER SATZ, DER DEN KASTEN TRAEGT. Codes, die einmal gezeigt werden, ohne
       dass es dabeisteht, sind ein Zettel, den niemand abschreibt -- und beim
       naechsten Aufbau der Karte sind sie fort. Derselbe Ernst wie beim
       Einladungslink. */
    nr: '118', name: 'Der Kasten sagt nicht mehr, dass die Codes nicht wiederkommen',
    file: 'public/app.js',
    search: "    boxId.innerHTML = `<strong>${tH('card.yourRecoveryCodes', { length: codes.length })}</strong>",
    replacement: "    kasten.innerHTML = `<strong>Deine ${codes.length} Wiederherstellungscodes.</strong>",
    expected: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '122', name: 'Die Liste der Wiederherstellungscodes wird um einen gekuerzt',
    file: 'public/app.js',
    search: "      <div class=\"two-factor-codes\">${codes.map(c => `<span>${esc(c)}</span>`).join('')}</div>",
    replacement: "      <div class=\"two-factor-codes\">${codes.slice(1).map(c => `<span>${esc(c)}</span>`).join('')}</div>",
    expected: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '119', name: 'Das Bestaetigungsfenster zeigt das Codefeld nie',
    file: 'public/app.js',
    search: "    : ''), TWO_FACTOR);",
    replacement: "    : ''), false);",
    expected: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '120', name: 'Die Anmeldeseite geht ueber den zweiten Schritt hinweg',
    file: 'public/app.js',
    search: "      if (j.twoFactor) return showSecondFactor(j.ticket);",
    replacement: "",
    expected: 'Die Anmeldeseite: der zweite Schritt'
  },
  {
    nr: '121', name: 'F_ROUTEN kennt den zweiten Schritt der Anmeldung nicht',
    file: 'testbench.js',
    search: "    ['POST',   '/api/login/second',                'offen'],",
    replacement: "",
    expected: 'Der Waechter ueber den Quelltext'
  },
  /* ---- Die Volltextsuche: der Weg ueberhaupt ---- */
  {
    nr: '124', name: 'Der Parameter q wird nicht mehr gelesen',
    file: 'server.js',
    search: "  const term = fulltextTerm(req.query.q);",
    replacement: "  const term = '';",
    expected: 'Die Volltextsuche'
  },
  {
    nr: '125', name: 'searchText steht wieder in der Antwort',
    file: 'server.js',
    search: "    delete it.description;",
    replacement: "    it.searchText = (it.title || '').toLowerCase();\n    delete it.description;",
    expected: 'searchText ist fort, und sonst nichts'
  },
  /* ---- Die sieben Quellen, einzeln ----
     JEDES GLIED WIRD WIRKUNGSLOS GEMACHT, NICHT ENTFERNT: `0 > 1` an seiner
     Stelle laesst die ODER-Kette ganz und nimmt genau eine Quelle heraus. Ein
     geloeschtes Glied riss die Kette auseinander, und SQLite scheiterte an der
     Abfrage -- der Lauf faerbte dann nicht eine Pruefung rot, er stuerzte
     (Stolperstein 138). */
  {
    nr: '126', name: 'Die Suche sieht den Titel nicht mehr an',
    file: 'server.js',
    search: "instr(kkl(i.title), :q) > 0",
    replacement: "0 > 1",
    expected: 'Die Volltextsuche'
  },
  {
    nr: '127', name: 'Und die Beschreibung nicht',
    file: 'server.js',
    search: "instr(kkl(i.description), :q) > 0",
    replacement: "0 > 1",
    expected: 'Die Volltextsuche'
  },
  {
    nr: '128', name: 'Und den Namen der Kategorie nicht',
    file: 'server.js',
    search: "instr(kkl(c.name), :q) > 0",
    replacement: "0 > 1",
    expected: 'Die Volltextsuche'
  },
  {
    nr: '129', name: 'Und die Tags am Eintrag nicht',
    file: 'server.js',
    search: "instr(kkl(t.name), :q) > 0",
    replacement: "0 > 1",
    expected: 'Die Volltextsuche'
  },
  {
    nr: '130', name: 'Und die Tags an den Testtagen nicht',
    file: 'server.js',
    search: "instr(kkl(tt.name), :q) > 0",
    replacement: "0 > 1",
    expected: 'Die Volltextsuche'
  },
  {
    nr: '131', name: 'Und die Adressen der Links nicht',
    file: 'server.js',
    search: "instr(kkl(l.url), :q) > 0",
    replacement: "0 > 1",
    expected: 'Die Volltextsuche'
  },
  {
    nr: '132', name: 'Und die Kommentartexte nicht',
    file: 'server.js',
    search: "instr(kkl(k.text), :q) > 0",
    replacement: "0 > 1",
    expected: 'Die Volltextsuche'
  },
  /* ---- Die Schreibung und die Wildcards ---- */
  {
    /* GENAU DIE UNICODE-HAELFTE FAELLT WEG, nicht die Kleinschreibung selbst:
       ASCII wird weiter gefaltet, Umlaute nicht -- also genau das Verhalten,
       das SQLite mit lower() und LIKE von Haus aus hat. Ein Rueckbau, der
       toLowerCase() ganz entfernte, machte auch jede ASCII-Suche rot und sagte
       damit nichts mehr ueber die Umlaute. */
    nr: '133', name: 'Die Kleinschreibung faltet nur noch ASCII',
    file: 'db.js',
    search: "db.function('kkl', { deterministic: true }, searchFold);",
    replacement: "db.function('kkl', { deterministic: true }, (s) => (s === null ? '' : String(s).replace(/[A-Z]/g, (c) => c.toLowerCase())));",
    expected: 'Die Volltextsuche'
  },
  /* ---- Die eine Faltung der Suche -- 0.24.4 (B8) ---- */
  {
    /* DIE NADEL FAELLT WIEDER AN DIE SPRACHE DES LESERS -- der Zustand von
       0.24.3. Die Zwei-Leser-Probe und die T3-Probe muessen daraufhin rot
       werden; wird nur eine rot, ist die andere stumm. */
    nr: '734', name: 'Die Nadel faltet wieder mit der Sprache des Lesers',
    file: 'server.js',
    search: "const fulltextTerm = (raw) => (typeof raw === 'string' ? searchFold(raw.trim()) : '');",
    replacement: "const fulltextTerm = (raw, locale = languageDefault()) => (typeof raw === 'string' ? raw.trim().toLocaleLowerCase(localeTag(locale)) : '');",
    expected: 'Die Befunde der Runde 0.24.4'
  },
  {
    /* DER SPRACHWECHSEL DES LESERS WIRFT DIE ANTWORT WIEDER WEG -- der Zustand
       von 0.24.3. Die Sprachprobe des Lesers muss daraufhin rot werden, und
       zwar NUR ihre zweite Haelfte: die Oberflaeche wechselt weiter, die
       vierzehn Woerter nicht. */
    nr: '736', name: 'Der Sprachwechsel nimmt das Vokabular nicht mit',
    file: 'public/app.js',
    search: "          takeVocabulary((await api('PUT', '/api/settings', { language: a.code })));",
    replacement: "          await api('PUT', '/api/settings', { language: a.code });",
    expected: 'Die Kacheln und der Leser — 0.24.4'
  },
  {
    /* UND DIE VIER i FALLEN WIEDER AUSEINANDER: dieselbe Funktion, nur ohne
       den Schritt, der `İ` und `ı` auf `i` bringt. Die T3-Probe wird rot,
       die Zwei-Leser-Probe NICHT -- beide Haelften falten ja weiter gleich.
       Genau diese Trennung ist der Grund fuer zwei Rueckbauten statt einem. */
    /* SEIT 0.26.0 ZIELT ER AUF EINE UMGEBAUTE ZEILE -- die Faltung setzt
       seither auch `ß` und `ss` gleich (Befund 6). Der Rueckbau geht mit,
       statt geloescht zu werden (Stolperstein 201), und er nimmt WEITER NUR
       die beiden i-Schritte: die ß-Gleichsetzung bleibt stehen, sonst
       faerbte ein Rueckbau zwei Befunde auf einmal rot und saegte keinen. */
    nr: '735', name: 'Die vier i fallen nicht mehr auf eines',
    file: 'db.js',
    search: "  : String(s).toLowerCase().replace(/\\u0307/g, '').replace(/\\u0131/g, 'i')\n      .replace(/\\u00df/g, 'ss'));",
    replacement: "  : String(s).toLowerCase().replace(/\\u00df/g, 'ss'));",
    expected: 'Die Befunde der Runde 0.24.4'
  },
  {
    nr: '134', name: 'Der Titel wird wieder ueber LIKE gesucht -- Wildcards wirken',
    file: 'server.js',
    search: "instr(kkl(i.title), :q) > 0",
    replacement: "kkl(i.title) LIKE '%' || :q || '%'",
    expected: 'Die Volltextsuche'
  },
  {
    /* DIE LISTE VERSCHWEIGT ETWAS, DAS DIE SUCHE ZEIGT -- die Richtung, auf
       die es ankommt. Der Papierkorb steht gar nicht in `items`; die schaerfste
       erreichbare Lage ist deshalb eine Liste, die weniger zeigt als die
       Suche. */
    nr: '135', name: 'Die Liste ohne Begriff verschweigt die abgelehnten Eintraege',
    file: 'server.js',
    search: "  let rows = qAllItems.all();",
    replacement: "  let rows = qAllItems.all();\n  if (!fulltextTerm(req.query.q)) rows = rows.filter(r => !r.rejected);",
    expected: 'Die Volltextsuche'
  },
  /* ---- testDays und die Zeitleiste ---- */
  {
    /* MITGEGANGEN MIT 0.19.3 (Stolperstein 201): die Zeile holt seit dieser
       Runde die schmale Fassung aus einer Karte statt je Eintrag zu fragen.
       Derselbe Fund, andere Zeile. */
    nr: '136', name: 'testDays kommt wieder immer mit',
    file: 'server.js',
    search: "    if (timeline) it.testDays = testDaysPer.get(it.id) || [];",
    replacement: "    it.testDays = testDaysPerEntry(req.user.id).get(it.id) || [];",
    expected: 'testDays haengt an der Zeitleiste'
  },
  {
    /* MITGEGANGEN MIT 0.19.3, wie 136 daneben. */
    nr: '137', name: 'testDays fehlt immer, auch mit eingeschalteter Zeitleiste',
    file: 'server.js',
    search: "    if (timeline) it.testDays = testDaysPer.get(it.id) || [];",
    replacement: "    if (false) it.testDays = testDaysPer.get(it.id) || [];",
    expected: 'testDays haengt an der Zeitleiste'
  },
  /* ---- Die Suche am Bildschirm ---- */
  {
    nr: '138', name: 'Der Debounce faellt weg -- jeder Anschlag fragt',
    file: 'public/app.js',
    search: "  searchClock = setTimeout(() => { searchClock = null; runSearch(); }, SEARCH_DELAY_MS);",
    replacement: "  sucheAusfuehren();",
    expected: 'Die Suche fragt den Server'
  },
  {
    nr: '139', name: 'Die Reihenfolge der Antworten wird nicht mehr geachtet',
    file: 'public/app.js',
    search: "    if (run !== searchRun) return;          // eine neuere Anfrage ist unterwegs",
    replacement: "",
    expected: 'Die Suche fragt den Server'
  },
  {
    nr: '140', name: 'Bei gescheiterter Suche wird die Liste leer',
    file: 'public/app.js',
    search: "    state.searchRunning = false; state.searchError = true;",
    replacement: "    state.suchLaeuft = false; state.suchFehler = true; state.items = [];",
    expected: 'Die Suche fragt den Server'
  },
  {
    nr: '141', name: 'Die Zaehlzeile nennt die Trefferzahl als Bestand',
    file: 'public/app.js',
    search: "    let z = `${state.inventory} ${vThing(state.inventory)}`",
    replacement: "    let z = `${state.items.length} ${vSache(state.items.length)}`",
    expected: 'Die Suche fragt den Server'
  },
  {
    nr: '142', name: 'Das Leeren holt den Bestand neu vom Server',
    file: 'public/app.js',
    search: "    state.items = state.all;\n    state.searchRunning = false; state.searchError = false;",
    replacement: "    state.items = await api('GET', '/api/items');\n    state.suchLaeuft = false; state.suchFehler = false;",
    expected: 'Die Suche fragt den Server'
  },
  /* ---- Die gespeicherten Ansichten ---- */
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): `zuletztGesehen` ist aus der
       Liste gefallen, und der Suchtext griff damit ins Leere (Stolperstein
       192). Er nimmt weiterhin genau die Ansichten heraus. */
    nr: '143', name: 'Die Ansichten sind kein persoenlicher Schluessel mehr',
    file: 'server.js',
    search: "                                'bellSeen', 'views', 'strip', 'theme', 'language'];",
    replacement: "                                'bellSeen', 'strip', 'theme', 'language'];",
    expected: 'Gespeicherte Ansichten'
  },
  {
    nr: '144', name: 'Der Deckel fuer Ansichten faellt weg',
    file: 'server.js',
    search: "    if (input.length > VIEWS_CAP)",
    replacement: "    if (false)",
    expected: 'Gespeicherte Ansichten'
  },
  {
    nr: '145', name: 'Zwei Ansichten duerfen wieder denselben Namen tragen',
    file: 'server.js',
    search: "      if (names.has(key))",
    replacement: "      if (false)",
    expected: 'Gespeicherte Ansichten'
  },
  {
    nr: '146', name: 'Die Ansichten werden geprueft, NACHDEM filters geschrieben ist',
    file: 'server.js',
    search: "  let viewsText = null;",
    replacement: "  let viewsText = null;\n  if (req.body.filters !== undefined)\n    putUserSetting(req.user.id, 'filters', JSON.stringify(req.body.filters));",
    expected: 'Gespeicherte Ansichten'
  },
  {
    nr: '147', name: 'Das Speichern einer Ansicht raeumt die gemerkte Stellung weg',
    file: 'server.js',
    search: "  if (viewsText !== null)\n    putUserSetting(req.user.id, 'views', viewsText);",
    replacement: "  if (viewsText !== null) {\n    putUserSetting(req.user.id, 'views', viewsText);\n    putUserSetting(req.user.id, 'filters', 'null');\n  }",
    expected: 'Gespeicherte Ansichten'
  },
  {
    nr: '148', name: 'Der Suchbegriff faellt aus der gespeicherten Ansicht',
    file: 'public/app.js',
    search: "const viewOutState = () => ({ filters: { ...state.filters }, q: state.search.trim() });",
    replacement: "const viewOutState = () => ({ filters: { ...state.filters }, q: '' });",
    expected: 'Gespeicherte Ansichten in der Oberflaeche'
  },
  {
    /* SEIT 0.13.0 TRAEGT DER FILTER EINE LISTE. Der Rueckbau nimmt dieselbe
       Klemme weg wie vorher: eine Nummer, die es nicht mehr gibt, bliebe
       stehen und filterte auf eine Kategorie, die niemand mehr hat. */
    nr: '149', name: 'Eine geloeschte Kategorie bleibt in der angewandten Ansicht stehen',
    file: 'public/app.js',
    search: "  f.categoryIds = [...new Set(f.categoryIds)].filter(v =>\n    v === CATEGORY_NONE || state.categories.some(c => c.id === v));",
    replacement: "  f.categoryIds = [...new Set(f.categoryIds)];",
    expected: 'Gespeicherte Ansichten in der Oberflaeche'
  },
  /* ---- Die Doppelerkennung ---- */
  {
    nr: '150', name: 'Der Titelvergleich achtet wieder auf Gross- und Kleinschreibung',
    file: 'public/app.js',
    search: "const titleCore = (raw) => String(raw || '').toLocaleLowerCase(LOCALE).replace(",
    replacement: "const titleCore = (roh) => String(roh || '').replace(",
    expected: 'Doppelte Eintraege beim Anlegen'
  },
  {
    nr: '151', name: 'Der Hinweis greift erst ab acht Zeichen',
    file: 'public/app.js',
    search: "const SIMILAR_DIALOG = 4;",
    replacement: "const SIMILAR_DIALOG = 8;",
    expected: 'Doppelte Eintraege beim Anlegen'
  },
  {
    nr: '152', name: 'Der Hinweis vergleicht nur die Trefferliste statt des Bestands',
    file: 'public/app.js',
    search: "  for (const it of state.all) {",
    replacement: "  for (const it of state.items) {",
    expected: 'Doppelte Eintraege beim Anlegen'
  },
  /* ---- Die Marke ---- */
  {
    nr: '153', name: 'Der Markenstrich traegt wieder Gold',
    file: 'public/style.css',
    search: '--brand-line: var(--accent-text);',
    replacement: '--brand-line: var(--gold);',
    expected: 'Die Marke der Instanz'
  },
  {
    /* DIESELBE ZEILE IN DER ANDEREN DATEI, und das ist kein Doppel: die
       beiden liegen getrennt, und wer eine anfasst, laesst die andere
       zurueck. Genau dafuer stehen hier zwei Rueckbauten. */
    nr: '154', name: 'Die Fassung mit Kachel traegt wieder Gold',
    file: 'public/favicon.svg',
    search: '<path d="M8 16 H24" stroke="#ff7a1a"/>',
    replacement: '<path d="M8 16 H24" stroke="#ffc531"/>',
    expected: 'Die Marke der Instanz'
  },
  {
    nr: '155', name: 'Das viewBox umschliesst wieder die Kachel statt der Farbe',
    file: 'public/app.js',
    search: 'viewBox="6.5 4.5 19 23" width=',
    replacement: 'viewBox="0 0 32 32" width=',
    expected: 'Die Marke der Instanz'
  },
  {
    nr: '156', name: 'Die Hoehe der Marke steht wieder in Pixel',
    file: 'public/style.css',
    search: '.brand .logo { height: 3.1rem; }',
    replacement: '.brand .marke { height: 46px; }',
    expected: 'Die Marke der Instanz'
  },
  {
    nr: '157', name: 'Das Markup gibt die Marke wieder quadratisch an',
    file: 'public/app.js',
    search: 'width="${Math.round(s * 19 / 23)}" height="${s}"',
    replacement: 'width="${s}" height="${s}"',
    expected: 'Die Marke der Instanz'
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
    file: 'public/style.css',
    search: '.sys-grid { grid-template-columns: minmax(0, 1fr); gap: 0; }',
    replacement: '.sys-grid { grid-template-columns: 1fr; gap: 0; }',
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    nr: '159', name: 'Die Bedingung in app.js laeuft von der im Stylesheet weg',
    file: 'public/app.js',
    search: "const NARROW = '(max-width: 700px), (max-height: 500px) and (max-width: 960px)';",
    replacement: "const SCHMAL = '(max-width: 640px)';",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    nr: '160', name: 'Der Behaelter des Menues steht auch am breiten Schirm im Weg',
    file: 'public/style.css',
    search: '.mast-rest { display: contents; }',
    replacement: '.mast-rest { display: flex; }',
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    nr: '161', name: 'Die Seite bekommt die Aussparung nicht mehr',
    file: 'public/index.html',
    search: '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">',
    replacement: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    nr: '162', name: 'Der Blaetterpfeil verschwindet auf dem Finger wieder',
    file: 'public/style.css',
    search: '@media (hover: none) { .vnav { opacity: 1; } }',
    replacement: '',
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
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
    file: 'public/app.js',
    search: "        <span class=\"hint who\" id=\"who\">${tH('list.signedInAs', { name: NAME })}</span>\n        <button class=\"btn btn-ghost btn-sm\" id=\"out\">${tH('list.signOut')}</button>",
    replacement: "        <button class=\"btn btn-ghost btn-sm\" id=\"out\">${tH('list.signOut')}</button>\n        <span class=\"hint who\" id=\"who\">${tH('list.signedInAs', { name: NAME })}</span>",
    expected: 'Mehrbenutzer-Anzeigen in der Oberflaeche'
  },
  /* DAS KREUZ AN DER KACHEL WAR EIN FUND AUS DEM FELD, kein Einfall am
     Schreibtisch: beim Durchwischen der Kachelleiste hat der Daumen es
     getroffen und ein Foto geloescht. Es ist auf dem Finger weg -- und weil
     ein Weglassen sich nicht von einem Vergessen unterscheiden laesst, muss
     der Rueckbau es zurueckholen koennen. */
  {
    nr: '164', name: 'Das Kreuz kehrt auf die Vorschaukachel zurueck',
    file: 'public/style.css',
    search: '@media (hover: none) { .thumb .del { display: none; } }',
    replacement: '',
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* Und der Abstand, der das Wegnehmen vom Einstellen trennt. Ohne ihn
     stehen Ausschnitt und Papierkorb Schulter an Schulter -- genau die Lage,
     die das Kreuz an der Kachel so gefaehrlich gemacht hat. */
  {
    nr: '165', name: 'Der Papierkorb rueckt an die Einstellknoepfe heran',
    file: 'public/style.css',
    search: '.vremove { margin-left: 14px; }',
    replacement: '.vweg { margin-left: 0; }',
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* UNSICHTBAR IST NICHT DASSELBE WIE UNANTASTBAR, und genau darauf kam der
     Befund aus dem Betrieb heraus. Dieser Rueckbau macht das Kreuz an der
     Kachel wieder durchsichtig statt es herauszunehmen: auf einem
     Bildschirmfoto sieht das Ergebnis richtig aus, unter dem Daumen ist es
     der alte Fehler. Wenn dafuer keine Zeile rot wird, sichert der Pruefstand
     nur das Aussehen und nicht das Verhalten. */
  {
    nr: '166', name: 'Das Kreuz an der Kachel wird nur durchsichtig, nicht herausgenommen',
    file: 'public/style.css',
    search: '@media (hover: none) { .thumb .del { display: none; } }',
    replacement: '@media (hover: none) { .thumb .del { opacity: 0; } }',
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* Die Rasterregel faellt weg -- die Kachelreihe steht wieder als
     umbrechender Flexkasten da, mit fester Kachelbreite und dem Streifen
     rechts. */
  {
    nr: '167', name: 'Die Vorschaureihe faellt auf den umbrechenden Kasten zurueck',
    file: 'public/style.css',
    search: ".thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--tile-min), 1fr)); gap: 7px; margin: 10px 0; }",
    replacement: ".thumbs { display: flex; flex-wrap: wrap; gap: 7px; margin: 10px 0; }",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* auto-fit statt auto-fill: mit zwoelf Fotos faellt das gar nicht auf, mit
     zweien werden aus zwei Kacheln zwei Kachelplatten. Ein Rueckbau, den man
     an einem vollen Eintrag nicht sieht -- deshalb steht er hier. */
  {
    nr: '168', name: 'Die leeren Spalten klappen zusammen (auto-fit)',
    file: 'public/style.css',
    search: "grid-template-columns: repeat(auto-fill, minmax(var(--tile-min), 1fr));",
    replacement: "grid-template-columns: repeat(auto-fit, minmax(var(--tile-min), 1fr));",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* Die Kachel behaelt ihre feste Hoehe, waehrend die Breite rechnet: aus dem
     Quadrat wird ein liegendes Rechteck, und object-fit beschneidet das Foto
     anders. Sieht nicht kaputt aus, ist aber falsch. */
  {
    nr: '169', name: 'Die Kachel behaelt ihre feste Hoehe und wird zum Rechteck',
    file: 'public/style.css',
    search: "  width: auto; height: auto; aspect-ratio: 1/1; border-radius: 8px; overflow: hidden;",
    replacement: "  width: auto; height: 62px; border-radius: 8px; overflow: hidden;",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* UND EINER IN DIE GEGENRICHTUNG: die Grundregel der Kachel wird angefasst.
     Sie gilt am Schreibtisch, und dort soll sich nichts aendern -- ein
     Rueckbau, der die 62 Pixel verschiebt, muss auffallen. Sonst haenge die
     Zusage allein an einem Pixelvergleich von Hand, und der faerbt nichts
     rot. */
  {
    nr: '170', name: 'Die Grundgroesse der Kachel verrutscht',
    file: 'public/style.css',
    search: "  --tile-min: 80px;",
    replacement: "  --tile-min: 86px;",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* ---- 0.12.3: der Export sagt seine Groesse an ---- */
  /* DIE SIEBEN HIER ZIELEN AUF DIE RECHNUNG UND AUF DIE KLEMME, nicht auf die
     Anzeige daneben: eine Zahl, die falsch gerechnet wird, faellt am
     Bildschirm nicht auf -- sie sieht genauso aus wie eine richtige. */
  {
    nr: '171', name: 'Der Umschlag faellt weg — ein Export ohne Fotos waere null Bytes gross',
    file: 'server.js',
    search: '  return parts.photos + parts.videos + parts.attachments + parts.commentImages + exchangeEnvelopeBytes(itemId);',
    replacement: '  return teile.fotos + teile.videos + teile.anhaenge + teile.kommentarbilder;',
    expected: 'Die Exportgroesse sagt sich an'
  },
  {
    /* DIE SUMME UEBER ALLE BLOB-SPALTEN IST DIE NAHELIEGENDE UND FALSCHE
       RECHNUNG: photos.thumb geht nie in die Datei. Faellt hier keine
       Pruefung rot, warnt die Instanz irgendwann zu frueh -- und eine Warnung,
       die zu frueh kommt, wird weggeklickt. */
    nr: '172', name: 'Die Vorschaubilder werden mitgezaehlt, obwohl sie nie mitgehen',
    file: 'server.js',
    search: "      `SELECT COALESCE(SUM(length(data)),0) n FROM photos WHERE kind != 'video'${and('item_id')}`));",
    replacement: "      `SELECT COALESCE(SUM(length(data) + COALESCE(length(thumb),0)),0) n FROM photos WHERE kind != 'video'${und('item_id')}`));",
    expected: 'Videos: Kennzahlen und Austausch'
  },
  {
    nr: '173', name: 'Der Export baut erst und sagt danach ab',
    file: 'server.js',
    search: '  const big = exchangeBytes(null, switches);\n  if (!asPart && big > EXCHANGE_MAX)',
    replacement: '  const gross = 0;\n  if (!asPart && gross > EXCHANGE_MAX)',
    expected: 'Videos: Kennzahlen und Austausch'
  },
  {
    nr: '174', name: 'Der Warnwert liegt auf der Grenze statt darunter',
    file: 'server.js',
    search: 'const EXCHANGE_WARN = 300 * 1024 * 1024;',
    replacement: 'const EXCHANGE_WARN = EXCHANGE_MAX;',
    expected: 'Die Exportgroesse sagt sich an'
  },
  {
    /* DER VIDEOSCHALTER HAENGT AM FOTOSCHALTER, wie in eintragAlsPaket(). Ohne
       diese Bindung naennte die Karte eine Groesse, die kein Knopf erzeugen
       kann -- und das faellt an keiner einzelnen Zahl auf. */
    nr: '175', name: 'Die Videos zaehlen auch ohne Fotos mit',
    file: 'public/app.js',
    search: '    + (s.withPhotos && s.withVideos ? (ex.videos || 0) : 0)',
    replacement: '    + (s.mitVideos ? (ex.videos || 0) : 0)',
    expected: 'Die Exportgroesse sagt sich an'
  },
  /* ---- 0.12.3: die Anzeige zieht nach ---- */
  {
    nr: '176', name: 'Die Kachel zeichnet wieder alles, auch was niemand sieht',
    file: 'public/style.css',
    search: '  content-visibility: auto;\n  contain-intrinsic-size: auto 400px;',
    replacement: '  contain-intrinsic-size: auto 400px;',
    expected: 'Die Anzeige zieht nach — 0.12.3'
  },
  {
    /* OHNE DAS WORT auto GILT DIE SCHAETZUNG FUER IMMER, und der Rollbalken
       springt bei jeder Kachel, die anders hoch ist als geschaetzt. Der
       Rueckbau nimmt genau dieses Wort weg -- die Regel bleibt sonst stehen
       und saehe von aussen unveraendert aus. */
    nr: '177', name: 'Die geschaetzte Kachelhoehe gilt fuer immer statt nur bis zum ersten Zeichnen',
    file: 'public/style.css',
    search: '  contain-intrinsic-size: auto 400px;',
    replacement: '  contain-intrinsic-size: 400px;',
    expected: 'Die Anzeige zieht nach — 0.12.3'
  },
  {
    nr: '178', name: 'Der angepinnte Bericht traegt wieder zwei Farben',
    file: 'public/style.css',
    search: '.cmt.pinned.report {\n  border-top-color: var(--accent);',
    replacement: '.cmt.pinned.bericht {\n  border-top-color: var(--gold-line);',
    expected: 'Die Anzeige zieht nach — 0.12.3'
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
    file: 'public/app.js',
    search: '  if (right.childElementCount) r3.appendChild(right);',
    replacement: '  if (rechts.childElementCount) r3.insertBefore(rechts, g3);',
    expected: 'Die Anzeige zieht nach — 0.12.3'
  },
  {
    /* NICHT `zaehle('task')` ALS ERSATZ: das ist DASSELBE. `aufgaben` zaehlt
       task UND done, `done` zaehlt done -- die Differenz IST die Zahl der
       task-Zeilen. Der erste Anlauf hat genau das versucht und blieb stumm,
       weil er gar nichts veraenderte. **Ein Rueckbau, der rechnerisch ein
       No-op ist, sieht aus wie eine Luecke im Pruefstand und ist keine.**
       Zurueckgebaut wird deshalb die Verschachtelung selbst: die Gesamtzahl
       statt der offenen. */
    nr: '180', name: 'Die Klammer nennt die Gesamtzahl statt der offenen',
    file: 'public/app.js',
    search: "    + (finished ? t('list.openCount', { n: tasks - finished }) : ''));",
    replacement: "    + (fertig ? t('list.openCount', { n: aufgaben }) : ''));",
    expected: 'Kommentare in der Oberflaeche'
  },
  {
    /* DAS FELD NIMMT BEIDE FORMEN. Eine Beschriftung, die eine davon
       ausschliesst, ist fuer die Haelfte der Faelle falsch -- und sie sieht
       dabei vollkommen unauffaellig aus. */
    nr: '181', name: 'Das Codefeld fragt wieder nach der App statt nach dem Verfahren',
    file: 'public/app.js',
    search: "<label>${tH('dialog.twoFactorCode')}</label>\n        <input class=\"input\" id=\"confirm-code\"",
    replacement: "<label>Code aus deiner App</label>\n        <input class=\"input\" id=\"confirm-code\"",
    expected: 'Die Karte „Zugang“: der zweite Faktor'
  },
  {
    nr: '182', name: 'Der Sprungknopf springt, klappt den Block aber nicht auf',
    file: 'public/app.js',
    search: "    if (BLOCKS.closed.includes('kommentare')) {",
    replacement: '    if (false) {',
    expected: 'Kommentare in der Oberflaeche'
  },
  /* ---- 0.12.4: der Export in Teilen ---- */
  /* SIE ZIELEN AUF DEN SCHNITT UND AUF DIE SCHRANKE. Ein Schnitt, der einen
     Eintrag doppelt oder gar nicht vergibt, faellt am Bildschirm nicht auf --
     erst beim Einspielen, und dann ist der Bestand schon falsch. */
  {
    nr: '183', name: 'Der Schnitt laesst die Fenster ueberlappen',
    file: 'server.js',
    search: "    open.to = z.id;\n    open.count++;",
    replacement: '    open.to = z.id + 1;\n    open.count++;',
    expected: 'Der Export in Teilen'
  },
  {
    /* OHNE DEN UMSCHLAG JE TEIL waere die Rechnung zu klein: jeder Teil traegt
       Titel, Zeitstempel und die ganze Kriterienliste noch einmal. Bei vielen
       kleinen Teilen ist das kein Rundungsfehler. */
    nr: '184', name: 'Der Umschlag je Teil faellt aus der Rechnung',
    file: 'server.js',
    search: "      open = { nr: parts.length + 1, from: z.id, to: z.id, count: 0, bytes: reason };",
    replacement: '      open = { nr: parts.length + 1, from: z.id, to: z.id, count: 0, bytes: 0 };',
    expected: 'Der Export in Teilen'
  },
  {
    /* EIN EINTRAG, DER IN KEINEN TEIL PASST, DARF NICHT STILL VERSCHWINDEN.
       Dieser Rueckbau uebergeht ihn wortlos -- genau der Ausgang, gegen den
       die Message gebaut ist. */
    nr: '185', name: 'Ein zu grosser Eintrag wird still uebergangen',
    file: 'server.js',
    search: "    if (reason + b > EXCHANGE_MAX) { tooBig.push({ id: z.id, title: z.title, bytes: reason + b }); continue; }",
    replacement: '    if (grund + b > EXCHANGE_MAX) { continue; }',
    expected: 'Der Export in Teilen'
  },
  {
    /* EINE HALBE FENSTERANGABE MUSS EIN FEHLER SEIN. Wer `von` schickt und
       `bis` vergisst, bekaeme sonst stillschweigend den ganzen Bestand -- und
       merkte es erst an der Dateigroesse. */
    nr: '186', name: 'Eine halbe Fensterangabe geht als Vollexport durch',
    file: 'server.js',
    search: '  if (asPart && (from === null || to === null || part === null || parts === null))',
    replacement: '  if (false)',
    expected: 'Der Export in Teilen'
  },
  {
    /* AUS N SCHRANKEN WIRD SONST EINE. Die Freigabe haengt an Sitzung, Zweck
       UND Ziel; faellt das Ziel weg, laesst eine einzige Bestaetigung jeden
       Teil durch. */
    nr: '187', name: 'Eine Freigabe gilt wieder fuer alle Teile',
    file: 'server.js',
    search: "             : (req.query && req.query.part !== undefined ? req.query.part : null);",
    replacement: '             : null;',
    expected: 'Der Export in Teilen'
  },
  {
    /* DER TEIL MUSS EIN WINDOW LESEN UND NICHT ALLES. Ohne die Klemme traegt
       jeder Teil den ganzen Bestand -- fuenf Dateien, jede vollstaendig, und
       der Import legte danach alles fuenfmal an. */
    nr: '188', name: 'Jeder Teil traegt den ganzen Bestand',
    file: 'server.js',
    search: "    ? db.prepare('SELECT * FROM items WHERE id BETWEEN ? AND ? ORDER BY id').all(from, to)",
    replacement: "    ? db.prepare('SELECT * FROM items ORDER BY id').all()",
    expected: 'Der Export in Teilen'
  },
  {
    nr: '189', name: 'Die Teilgroesse laesst sich ueber den Warnwert stellen',
    file: 'server.js',
    search: "  const targetSize = Math.min(EXCHANGE_WARN,",
    replacement: '  const targetSize = Math.min(Number.MAX_SAFE_INTEGER,',
    expected: 'Der Export in Teilen'
  },
  {
    /* DER DATEINAME IST DIE EINZIGE STELLE, an der ein Mensch die Reihenfolge
       ablesen kann. Fuenf gleichnamige Dateien im Ordner waeren nicht mehr
       auseinanderzuhalten. */
    nr: '190', name: 'Alle Teile heissen gleich',
    file: 'server.js',
    search: "    `attachment; filename=\"${exportName(asPart ? `-teil-${part}-von-${parts}` : '')}\"`);",
    replacement: "    `attachment; filename=\"${exportName('')}\"`);",
    expected: 'Der Export in Teilen'
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
    file: 'public/app.js',
    search: "  try { await api('POST', '/api/confirm', { ...input, purpose, targets }); }\n  catch (e) { toast(e.message, true); return false; }\n  return true;",
    replacement: "  for (const ziel of ziele) {\n    try { await api('POST', '/api/confirm', { ...eingabe, zweck, ziel }); }\n    catch (e) { toast(e.message, true); return false; }\n  }\n  return true;",
    expected: 'Der Teilexport mit zweitem Faktor'
  },
  {
    /* DIE MEHRZAHL AM SERVER. Ohne sie nimmt die Route nur ein Ziel, und die
       eine Anfrage der Oberflaeche legt genau eine Freigabe an -- Teil 2
       bekaeme 403, und zwar ohne dass irgendwo ein Code falsch gewesen waere. */
    nr: '192', name: 'Die Route nimmt wieder nur ein einzelnes Ziel',
    file: 'server.js',
    search: '  } else targetList = [target ?? null];',
    replacement: '  }\n  targetList = [ziel ?? null];',
    expected: 'Der Teilexport mit zweitem Faktor'
  },
  {
    /* DIE ABSAGE AUF DOPPELTE NUMMERN. Ohne sie wird aus drei bestellten
       Freigaben stillschweigend eine -- die Antwort saehe aus wie ein Erfolg,
       und der zweite Teil bliebe stehen. */
    nr: '193', name: 'Doppelte Zielnummern gehen als halbierte Bestellung durch',
    file: 'server.js',
    search: '    if (new Set(targetList).size !== targetList.length)',
    replacement: '    if (false)',
    expected: 'Der Teilexport mit zweitem Faktor'
  },
  {
    /* DER DECKEL AUF DER ZAHL DER ZIELE. Ohne ihn legt eine einzige Anfrage
       zehntausend Freigaben im Arbeitsspeicher ab, und nichts raeumt sie vor
       ihrem Ablauf wieder weg. */
    nr: '194', name: 'Eine Anfrage darf beliebig viele Freigaben bestellen',
    file: 'server.js',
    search: '    if (targets.length > EXCHANGE_PART_MAX)',
    replacement: '    if (false)',
    expected: 'Der Teilexport mit zweitem Faktor'
  },
  {
    /* DAS MERKMAL AM TEILEXPORT. Steht dort wieder die Nummer, ist sie kein
       Wert aus MERKMALE -- und protokolliere() verwirft die GANZE Zeile. Ein
       Bestand, der in fuenf Teilen hinausgeht, stuende im Protokoll nirgends.
       DAS IST DER BEFUND AUS 0.12.4, wortwoertlich zurueckgebaut. */
    nr: '195', name: 'Der Teilexport schreibt wieder "teil 1/5" und faellt damit aus dem Protokoll',
    file: 'server.js',
    search: "detail: asPart ? 'part' : null });",
    replacement: 'merkmal: asPart ? `teil ${teil}/${teile}` : null });',
    expected: 'Der Teilexport mit zweitem Faktor'
  },
  /* ---- 0.13.0: zwei Netze, ein Zugang ---- */
  {
    /* DER KOPF WIRD OHNE DIE EINSTELLUNG GEGLAUBT. Dann holt sich jeder
       Aufrufer auf Port 3100 einen __Host--Cookie samt HSTS -- und sperrt sich
       damit selbst aus, weil sein Browser den Cookie verwirft. */
    nr: '196', name: 'X-Forwarded-Proto wird auch ohne BEHIND_PROXY geglaubt',
    file: 'auth.js',
    search: '  if (!BEHIND_PROXY) return false;',
    replacement: '  if (false) return false;',
    expected: 'Ohne Proxy ist der Kopf nur eine Behauptung'
  },
  {
    /* BEIDE WEGE BEKOMMEN DENSELBEN NAMEN -- der Fehler aus (b) in Reinform.
       Eine Zeile, die nur sagt, dass ein Cookie gesetzt wurde, bliebe dabei
       gruen; der NAME ist die Pruefung. */
    nr: '197', name: 'Beide Wege bekommen denselben Cookienamen',
    file: 'auth.js',
    search: "const cookieName = (req) => viaProxy(req) ? COOKIE_SECURE : COOKIE_NAME;",
    replacement: "const cookieName = (req) => COOKIE_NAME;",
    expected: 'Zwei Netze, ein Zugang — 0.13.0'
  },
  {
    /* SECURE AM HEIMNETZWEG. Der Browser verwirft den Cookie dann
       stillschweigend -- genau der Fehler, gegen den diese Runde gebaut ist,
       nur eine Ebene tiefer. */
    nr: '198', name: 'Auch der Heimnetzcookie traegt Secure',
    file: 'auth.js',
    search: "  `${viaProxy(req) ? '; Secure' : ''}; Max-Age=${SESSION_DAYS * 86400}`;",
    replacement: "  `; Secure; Max-Age=${SESSION_DAYS * 86400}`;",
    expected: 'Zwei Netze, ein Zugang — 0.13.0'
  },
  {
    /* HSTS AUF JEDEM WEG. Der Kopf sperrt den Heimnetzweg aus, den (a) gerade
       offenhalten soll: der Browser bestuende danach auf HTTPS und faende an
       Port 3100 keines. */
    nr: '199', name: 'HSTS geht wieder auf jedem Weg mit',
    file: 'server.js',
    search: "  if (auth.viaProxy(req)) res.set('Strict-Transport-Security', 'max-age=31536000');",
    replacement: "  if (auth.BEHIND_PROXY) res.set('Strict-Transport-Security', 'max-age=31536000');",
    expected: 'Zwei Netze, ein Zugang — 0.13.0'
  },
  /* ---- 0.13.0: der Filter am Sicherheitsprotokoll ---- */
  {
    /* DIE AUSWAHL WIRD UEBERGANGEN. Die Karte zeigt dann wieder die hundert
       juengsten ALLER Arten, und genau darin findet man die gescheiterten
       Anmeldungen nicht. */
    nr: '200', name: 'Die Leseroute uebergeht die gewaehlte Ansicht',
    file: 'server.js',
    search: '  res.json(auth.readLog(auth.LOG_LIMIT, group));',
    replacement: '  res.json(auth.readLog(auth.LOG_LIMIT));',
    expected: 'Das Sicherheitsprotokoll in der Oberflaeche'
  },
  {
    /* DIE NAMEN WERDEN WIEDER BLOSSER TEXT. Der Sprung zum Zugang faellt damit
       weg -- und mit ihm die zweite Haelfte von Punkt 3a. */
    nr: '201', name: 'Die Namen im Protokoll sind wieder nur Text',
    file: 'public/app.js',
    search: "    if (id == null) { field.appendChild(doc.createTextNode(text)); return field; }",
    replacement: "    feld.appendChild(dok.createTextNode(text)); return feld;",
    expected: 'Das Sicherheitsprotokoll in der Oberflaeche'
  },
  {
    /* "unbekannter Name" WIRD ANKLICKBAR. Er ist der getippte Name eines
       Versuchs, der an keinen Zugang traf -- ein Knopf ins Leere. */
    nr: '202', name: 'Auch "unbekannter Name" wird ein Knopf',
    file: 'public/app.js',
    search: "      row.appendChild(logNameField(doc, 'log-actor', logActor(z),\n        z.actor != null ? z.actor : null));",
    replacement: "      zeile.appendChild(protNamensFeld(dok, 'log-actor', protHandelnder(z), z.wer ?? 0));",
    expected: 'Das Sicherheitsprotokoll in der Oberflaeche'
  },
  {
    /* DIE FUENF WOERTER FALLEN WIEDER WEG. Die Vorgaenge stehen dann als rohe
       Schluessel am Bildschirm -- "request.approve" statt eines Satzes. */
    nr: '203', name: 'Fuenf Vorgaenge stehen wieder als roher Schluessel da',
    file: 'public/app.js',
    search: "    'request.approve': 'card.requestApproved',",
    replacement: "",
    expected: 'Das Sicherheitsprotokoll in der Oberflaeche'
  },
  /* ---- 0.13.0: der Loeschdialog und die Grabsteine ---- */
  {
    /* DER SATZ FAELLT WEG. Der Dialog sagt dann wieder nur, dass es nicht
       rueckgaengig zu machen ist -- und verschweigt den Weg, der genau das
       nicht tut. Der billigste Punkt der Runde mit dem groessten Schaden. */
    nr: '204', name: 'Der Loeschdialog verschweigt den umkehrbaren Weg wieder',
    file: 'public/app.js',
    search: "      <p>${tH('dialog.lockInsteadHint')}</p>",
    replacement: "",
    expected: 'Die zweite Bestaetigung in der Oberflaeche'
  },
  {
    /* DIE GRABSTEINE STEHEN WIEDER ZWISCHEN DEN LEBENDEN. */
    nr: '205', name: 'Grabsteine stehen wieder in der Zugangsliste',
    file: 'public/app.js',
    search: "    for (const z of data.users.filter(z => z.status !== 'deleted')) {",
    replacement: "    for (const z of daten.zugaenge) {",
    expected: 'Der Einladungslink in der Karte Zugaenge'
  },
  /* ---- 0.13.0: die Filterleiste ---- */
  {
    /* DIE SELBSTTAETIGE AUSSENKANTE KOMMT ZURUECK. Sie frisst den freien Platz
       der Zeile, die Wolke rutscht darunter, und die Tagzeile kostet wieder
       zwei Zeilen. */
    nr: '206', name: 'Die selbsttaetige Aussenkante frisst die Zeile wieder',
    file: 'public/style.css',
    search: '.frow-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }',
    replacement: '.frow-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }',
    expected: 'Die Anzeige zieht nach — 0.12.3'
  },
  {
    /* SORTIEREN UND ANSICHTEN FALLEN WIEDER AUSEINANDER. */
    nr: '207', name: 'Sortieren und Ansichten bekommen wieder je eine Zeile',
    file: 'public/app.js',
    search: "  const r5 = r4;\n  secondLabel(r5, t('list.views'));",
    replacement: "  const r5 = row(t('list.views'));",
    expected: 'Die Filterleiste wird kuerzer — 0.13.0'
  },
  {
    /* MITGENOMMEN MIT 0.17.0 (Stolperstein 201): der Rueckbau zeigte auf die
       Pille „Neu seit ...", und die ist gestrichen. DIE REGEL DAHINTER GILT
       WEITER und war nie ihre eigene -- seit 0.13.0 wird JEDE Pille gedaempft,
       die auf null Treffer fuehrt. Der Rueckbau nimmt sie jetzt am Tag, wo sie
       zuerst stand. Ohne das Nachziehen waere er stumm geworden
       (Stolperstein 192). */
    nr: '208', name: 'Eine Pille mit null Treffern wird nicht mehr gedaempft',
    file: 'public/app.js',
    search: "    b.className = 'pill pill-tag' + (chosen ? ' on' : '') + (idle.has(tag.id) ? ' blank' : '');",
    replacement: "    b.className = 'pill pill-tag' + (gewaehlt ? ' on' : '');",
    expected: 'Die Filterleiste wird kuerzer — 0.13.0'
  },
  /* ---- 0.13.0: die Kategoriezeile ---- */
  {
    /* DIE UEBERSETZUNG DER ALTEN FORM FAELLT WEG. Alle vorhandenen Ansichten
       verloeren ihre Kategorie -- still und ohne Message. */
    nr: '209', name: 'Eine gespeicherte Ansicht in der alten Form verliert ihre Kategorie',
    file: 'public/app.js',
    search: "  if (!Array.isArray(f.categoryIds))\n    f.categoryIds = f.categoryId != null ? [f.categoryId] : [];",
    replacement: "  if (!Array.isArray(f.categoryIds))\n    f.categoryIds = [];",
    expected: 'Die Kategoriezeile lernt die Mehrzahl — 0.13.0'
  },
  {
    /* AUS DEM ODER WIRD EIN UND. Ein Eintrag traegt genau eine Kategorie --
       zwei gewaehlte ergaeben damit garantiert null Treffer. */
    nr: '210', name: 'Aus der Vereinigung wird ein Schnitt',
    file: 'public/app.js',
    search: "  if (f.categoryIds.length) out = out.filter(i =>\n    f.categoryIds.includes(i.category ? i.category.id : CATEGORY_NONE));",
    replacement: "  if (f.categoryIds.length) out = out.filter(i =>\n    f.categoryIds.every(v => v === (i.category ? i.category.id : CATEGORY_NONE)));",
    expected: 'Die Kategoriezeile lernt die Mehrzahl — 0.13.0'
  },
  {
    /* "OHNE" WIRD BEIM ZURECHTRUECKEN WEGGEWORFEN: es ist kein Kategoriewert,
       und eine Klemme, die nur Nummern durchlaesst, nimmt es mit. */
    nr: '211', name: '"Ohne" ueberlebt das Zurechtruecken nicht',
    file: 'public/app.js',
    search: "    v === CATEGORY_NONE || state.categories.some(c => c.id === v));",
    replacement: "    state.categories.some(c => c.id === v));",
    expected: 'Die Kategoriezeile lernt die Mehrzahl — 0.13.0'
  },
  {
    /* DIE PILLE "OHNE" FAELLT WEG. Die Eintraege ohne Kategorie waeren wieder
       ueber keine einzelne Kategorie erreichbar -- der Anlass des Punktes. */
    nr: '212', name: 'Die Pille "Ohne" wird gar nicht erst gezeichnet',
    file: 'public/app.js',
    search: "  if (withoutNumber || f.categoryIds.includes(CATEGORY_NONE)) {",
    replacement: "  if (false) {",
    expected: 'Die Kategoriezeile lernt die Mehrzahl — 0.13.0'
  },
  /* ---- Die Beschriftungen stehen oben — 0.13.1 ---- */
  {
    /* ZURUECK IN DIE MITTE -- der Befund selbst. Bei aufgeklappter Tagwolke
       sinken Beschriftung, Umschalter und Verweise wieder in die Mitte des
       Blocks. */
    nr: '213', name: 'Die Filterzeile mittelt wieder ueber die ganze Hoehe',
    file: 'public/style.css',
    search: '.frow { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }',
    replacement: '.frow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }',
    expected: 'Die Beschriftungen stehen oben — 0.13.1'
  },
  {
    /* DIE BESCHRIFTUNG NIMMT SICH IHRE MITTE EINZELN ZURUECK. Die Zeile bleibt
       an der Grundlinie, das eine Element schert aus -- genau der Weg, den die
       Pruefung ueber `align-self` zuhalten soll. */
    nr: '214', name: 'Die Beschriftung schert aus der Grundlinie aus',
    file: 'public/style.css',
    search: '.frow > .eyebrow { min-width: 7.25em; flex-shrink: 0; }',
    replacement: '.frow > .eyebrow { min-width: 7.25em; flex-shrink: 0; align-self: center; }',
    expected: 'Die Beschriftungen stehen oben — 0.13.1'
  },
  /* ---- Der angepinnte Rahmen schliesst — 0.13.2 ---- */
  {
    /* DREI KANTEN STATT VIER -- der Befund selbst. Die angepinnte Notiz steht
       wieder in drei goldenen und einer grauen Kante da. */
    nr: '215', name: 'Die angepinnte Notiz bekommt ihre linke Kante nicht',
    file: 'public/style.css',
    search: '.cmt.pinned { border-color: var(--gold-line); }',
    replacement: '.cmt.pinned {\n  border-top-color: var(--gold-line);\n' +
      '  border-right-color: var(--gold-line);\n  border-bottom-color: var(--gold-line);\n}',
    expected: 'Der angepinnte Rahmen schliesst — 0.13.2'
  },
  {
    /* DIE WIEDERHOLUNG FAELLT WEG, und damit schlaegt die spaetere Regel der
       Anpinnung durch: der angepinnte Bericht bekaeme eine goldene linke
       Kante neben drei orangen -- zwei Farben an einem Kasten. */
    nr: '216', name: 'Der angepinnte Bericht verliert seine orange Kante an das Gold',
    file: 'public/style.css',
    search: '  border-bottom-color: var(--accent);\n  border-left-color: var(--accent);\n}',
    replacement: '  border-bottom-color: var(--accent);\n}',
    expected: 'Der angepinnte Rahmen schliesst — 0.13.2'
  },
  /* ---- 0.14.0: der kaputte Cookiewert ---- */
  {
    /* DER BEFUND SELBST, wiederhergestellt: decodeURIComponent() auf JEDEN
       Wert, ohne Auffangnetz. Ein fremder Cookie mit einem Prozentzeichen
       sperrt den Browser damit wieder aus. */
    nr: '217', name: 'Ein kaputter Cookiewert bricht wieder den ganzen Kopf ab',
    file: 'auth.js',
    search: "    let value;\n    try { value = decodeURIComponent(part.slice(i + 1).trim()); }\n" +
      "    catch { continue; }\n    out[part.slice(0, i).trim()] = value;",
    replacement: "    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());",
    expected: 'Der kaputte Cookiewert — 0.14.0'
  },
  {
    /* DIE ANDERE HALBE FASSUNG: der kaputte Wert reisst nicht mehr ab, aber
       der ganze KOPF faellt weg statt nur der einen Zeile. Dann kommt der
       eigene, gueltige Cookie daneben nicht mehr an -- und genau das ist der
       Unterschied, den eine Prueflage mit nur einem Cookie nicht sehen kann. */
    nr: '218', name: 'Ein kaputter Wert nimmt den ganzen Cookiekopf mit',
    file: 'auth.js',
    search: "    catch { continue; }",
    replacement: "    catch { return {}; }",
    expected: 'Der kaputte Cookiewert — 0.14.0'
  },
  /* ---- 0.14.0: die drei Spalten und der Migrationsblock ---- */
  {
    nr: '219', name: 'Der Migrationsblock laeuft gar nicht mehr',
    file: 'db.js',
    search: "migration0140();\n// ENDE MIGRATION 0.14.0",
    replacement: "// migration0140();\n// ENDE MIGRATION 0.14.0",
    expected: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* STOLPERSTEIN 108: der Block fragt sich als GANZES ab. Ein Bestand, dem
       nur die zweite oder dritte Spalte fehlt, bleibt damit fuer immer
       zerrissen -- und genau das ist der Riss, den eine frueher abgebrochene
       Fassung hinterlaesst. */
    nr: '220', name: 'Der Migrationsblock fragt nur noch die erste Spalte ab',
    file: 'db.js',
    search: "  const missing = [];\n  if (!columns.includes('rejected_at')) missing.push(['rejected_at', 'ALTER TABLE items ADD COLUMN rejected_at TEXT']);",
    replacement: "  const fehlend = [];\n  if (spalten.includes('rejected_at')) return 0;\n  fehlend.push(['rejected_at', 'ALTER TABLE items ADD COLUMN rejected_at TEXT']);",
    expected: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* Die Transaktion faellt weg. Am unveraenderten Stand aendert das nichts
       am Ergebnis -- der Waechter ueber den Quelltext haelt sie fest, denn
       ohne sie ueberlebt bei einem Abbruch die erste Spalte allein. */
    nr: '221', name: 'Die drei ALTER TABLE laufen nicht mehr in einer Transaktion',
    file: 'db.js',
    search: "  db.transaction(() => { for (const [, sql] of missing) db.exec(sql); })();",
    replacement: "  for (const [, sql] of fehlend) db.exec(sql);",
    expected: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* EIN NACHGESCHOBENES UPDATE ERFINDET ANGABEN. "Abgelehnt am Tag der
       Einspielung von dem, der eingespielt hat" ist die schlimmste davon --
       und sie saehe aus wie eine echte. */
    nr: '222', name: 'Die Migration traegt erfundene Angaben in den Bestand',
    file: 'db.js',
    search: "  const n = db.prepare('SELECT COUNT(*) AS n FROM items WHERE rejected = 1').get().n;\n  console.log(`[Kriterion] items um ${enumeration} ergaenzt `",
    replacement: "  db.exec(\"UPDATE items SET rejected_at = datetime('now') WHERE rejected = 1\");\n" +
      "  const n = db.prepare('SELECT COUNT(*) AS n FROM items WHERE rejected = 1').get().n;\n  console.log(`[Kriterion] items um ${aufzaehlung} ergaenzt `",
    expected: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* Die nachgeruestete Spalte verliert ihren Fremdschluessel. Ein entfernter
       Zugang laesst danach eine Nummer stehen, die auf niemanden mehr zeigt --
       und die migrierte Instanz verhaelt sich anders als die frische. */
    nr: '223', name: 'Die nachgeruestete Spalte bekommt keinen Fremdschluessel',
    file: 'db.js',
    search: "    'ALTER TABLE items ADD COLUMN rejected_by INTEGER REFERENCES users(id) ON DELETE SET NULL']);",
    replacement: "    'ALTER TABLE items ADD COLUMN rejected_by INTEGER']);",
    expected: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* Die DDL verliert die drei Spalten. Eine FRISCHE Instanz bekaeme sie dann
       ueber den Migrationsblock -- und zu 1.0, wenn er wegfaellt, gar nicht
       mehr. Genau dafuer steht die Gegenlage der frischen Instanz. */
    nr: '224', name: 'Die drei Spalten stehen nicht mehr in der DDL',
    file: 'db.js',
    search: "  rejected_at TEXT,\n  rejected_reason TEXT,",
    replacement: "",
    expected: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  /* ---- 0.14.0: die Klemme an der Begruendung ---- */
  {
    /* DIE ZURUECKGENOMMENE ENTSCHEIDUNG, wiederhergestellt: an der Begruendung
       gilt wieder darfAendern -- Verfasser ODER Admin. Damit schreibt ein
       Admin eine fremde Aussage unter fremdem Namen um. */
    nr: '225', name: 'An der Begruendung gilt wieder mayChange statt selfOnly',
    file: 'server.js',
    search: "      it.rejected_by != null && !selfOnly(req, it.rejected_by))",
    replacement: "      it.rejected_von != null && !mayChange(req, it.rejected_von))",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Die grobe Haelfte faellt weg: rejectedGrund steht nicht mehr in
       NUR_VERFASSER_FELDER. Dann setzt jeder Angemeldete eine Begruendung an
       einen Eintrag, dessen Ablehnung noch keinen Verfasser traegt. */
    nr: '226', name: 'Die Begruendung faellt aus den Verfasserfeldern heraus',
    file: 'server.js',
    search: "const AUTHOR_ONLY_FIELDS = ['title', 'description', 'rejected', 'rejectedReason',\n                              'tested', 'productCategoryId'];",
    replacement: "const AUTHOR_ONLY_FIELDS = ['title', 'description', 'rejected',\n                              'tested', 'productCategoryId'];",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Der Zweig fuer den Bestand ohne Verfasser faellt weg. Eine Ablehnung aus
       einer Instanz vor 0.14.0 bekaeme damit NIE eine Begruendung:
       nurSelbst(null) ist fuer jeden falsch. */
    nr: '227', name: 'Eine Ablehnung ohne Verfasser laesst sich nicht mehr begruenden',
    file: 'server.js',
    search: "  if (b.rejectedReason !== undefined && !turnsOn && !removedReason &&\n      it.rejected_by != null && !selfOnly(req, it.rejected_by))",
    replacement: "  if (b.rejectedGrund !== undefined && !turnsOn && !removedReason &&\n      !selfOnly(req, it.rejected_von))",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Beim Einschalten wird der Grund nicht mehr mitgeschrieben. Dann traegt
       die NEUE Entscheidung den Satz der vorigen Person unter neuem Namen --
       genau das, was die Klemme verhindern soll. */
    nr: '228', name: 'Ein neues Ablehnen uebernimmt den fremden Satz',
    file: 'server.js',
    search: "    put('rejected_by', req.user.id);\n    put('rejected_reason', reasonText(b.rejectedReason));",
    replacement: "    put('rejected_von', req.user.id);",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Das Datum kommt wieder aus dem Rumpf. Dann traegt jede Ablehnung das
       Datum, das der Aufrufende hineinschreibt. */
    nr: '229', name: 'Das Ablehnungsdatum kommt aus dem Rumpf statt vom Server',
    file: 'server.js',
    search: "    sets.push(`rejected_at = datetime('now')`);",
    replacement: "    put('rejected_at', b.rejectedAt || new Date().toISOString().slice(0, 19).replace('T', ' '));",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Die nackte Zugangsnummer bleibt in der Detailantwort stehen -- und das
       Verfasserobjekt entfaellt. Aus einem Grabstein liesse sich der
       freigegebene Name dann nicht mehr fernhalten. */
    nr: '230', name: 'Der Ablehnende geht als nackte Nummer hinaus',
    file: 'server.js',
    search: "  it.rejectedAuthor = authorFrom(card, it.rejected_by);\n  delete it.rejected_by;",
    replacement: "",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Die drei Angaben bleiben in der Uebersicht stehen. Der Grund gehoert an
       den Eintrag und nicht in eine Kachelreihe -- und rejected_by waere dort
       eine nackte Zugangsnummer in einer Antwort an jeden. */
    nr: '231', name: 'Die Uebersicht schickt Grund und Nummer mit hinaus',
    file: 'server.js',
    search: "    delete it.rejected_at; delete it.rejected_reason; delete it.rejected_by;",
    replacement: "",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Der Text wird nicht mehr eingeebnet. Ein eingefuegter Absatz risse die
       Marke in der Oberflaeche, und der Deckel faellt gleich mit. */
    nr: '232', name: 'Die Begruendung wird weder eingeebnet noch gekappt',
    file: 'server.js',
    search: "const reasonText = (v) =>\n  typeof v === 'string' ? v.replace(/\\s+/g, ' ').trim().slice(0, REASON_LENGTH) : '';",
    replacement: "const reasonText = (v) => (typeof v === 'string' ? v : '');",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  /* ---- 0.14.0: das Austauschformat ---- */
  {
    /* MIT 0.19.0 STEHT DIE NUMMER AUF 12 -- der Ausschnitt geht in die Datei.
       DER RUECKBAU BLEIBT DERSELBE FUND und wird deshalb nicht durch einen
       neuen ersetzt: er nimmt der Datei ihre Nummer und laesst alles andere
       stehen. Nur der Zielwert rueckt mit, sonst griffe die Suche ins Leere
       und der Rueckbau saehe aus wie einer, der nichts bewirkt. */
    /* MITGEGANGEN MIT 0.21.0, nicht geloescht (Stolperstein 201): die
       Formatnummer steht auf 13, der Rueckbau nimmt sie wie immer um eins
       zurueck. Was er belegt, ist unveraendert -- dass die Nummer mit dem
       Format steigt und nicht stehen bleibt. */
    nr: '233', name: 'Die Formatnummer bleibt auf 15',
    file: 'server.js',
    search: "const EXCHANGE_FORMAT = 16;",
    replacement: "const EXCHANGE_FORMAT = 15;",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Der Ablehnende wandert als NUMMER hinaus. Eine Zugangsnummer bedeutet in
       einer fremden Instanz etwas anderes -- der Rundlauf traefe dort einen
       beliebigen Zugang oder gar keinen. */
    nr: '234', name: 'Der Ablehnende wandert als Nummer statt als Name hinaus',
    file: 'server.js',
    search: "    rejected_author: authorName(it.rejected_by),",
    replacement: "    rejected_author: it.rejected_von,",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Die drei Felder fallen aus der Datei. Ein Rundlauf machte damit aus
       einer begruendeten Ablehnung wieder ein nacktes Haekchen. */
    nr: '235', name: 'Die drei Angaben gehen gar nicht erst in die Datei',
    file: 'server.js',
    search: "    rejected_at: it.rejected_at, rejected_reason: it.rejected_reason,\n    rejected_author: authorName(it.rejected_by),",
    replacement: "",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Der fehlende Name faellt wieder an den Einspielenden. Dann ist JEDER
       eingespielte Eintrag von ihm abgelehnt -- auch die, die niemand
       abgelehnt hat. */
    nr: '236', name: 'Ein fehlender Ablehnender faellt an den Einspielenden',
    file: 'server.js',
    search: "      const rejectedBy = String(it.rejected_author == null ? '' : it.rejected_author).trim()\n        ? authorId(it.rejected_author) : null;",
    replacement: "      const rejectedBy = verfasser(it.rejected_author);",
    expected: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  /* ---- 0.14.0: die Sternreihe der Kriterienliste ---- */
  {
    /* DIE FESTE PIXELZAHL KEHRT ZURUECK -- der Befund vom 29. August 2026 in
       Reinform: bei 80 Prozent stimmt es zufaellig, bei 120 klaffen 26 px. */
    nr: '237', name: 'Die Zahlenspalte bekommt ihre feste Mindestbreite zurueck',
    file: 'public/style.css',
    /* MITGEGANGEN MIT 0.21.0 (Stolperstein 201): die Regel hat seit dieser
       Runde eine Zeile mehr -- die GEMESSENE Mindestbreite. Der Rueckbau
       ersetzt weiter die ganze Regel durch die alte, geschaetzte Fassung (52
       feste Pixel und text-align statt flex), und er muss weiter rot werden:
       52 px reichen fuer „⌀ 4,2 (9)" nicht, und in Pixeln folgt die Spalte der
       Schriftstufe nicht mehr. */
    search: "  white-space: nowrap; padding-left: 9px;\n  min-width: calc(4.34rem + 9px);\n  display: flex; align-items: center; justify-content: flex-end;",
    replacement: "  white-space: nowrap; padding-left: 9px;\n  min-width: 52px; text-align: right;",
    expected: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  {
    /* Das Raster faellt weg, die Zeile wird wieder ein Flex-Kasten. Damit
       misst sich jede Zahlenspalte wieder an ihrem eigenen Inhalt. */
    /* GEAENDERT MIT 0.17.0, und der Grund gehoert daneben (Stolperstein 201):
       zwischen den beiden Zeilen steht seit dieser Runde die Regel fuer den
       einen Zugang. Der Rueckbau griff damit ins Leere und waere stumm
       geworden (Stolperstein 192). Er nimmt jetzt die Kastenhaelfte; die
       Zeilenhaelfte hat mit 307 ihren eigenen bekommen -- zwei Rueckbauten
       statt einem, und beide zeigen auf eine Zeile, die es wirklich gibt. */
    nr: '238', name: 'Aus dem Raster wird wieder ein gewoehnlicher Kasten',
    file: 'public/style.css',
    search: ".rlist { display: grid; grid-template-columns: 1fr auto auto auto; }",
    replacement: ".rlist { display: block; }",
    expected: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  {
    /* Der Kasten bekommt die Rasterklasse nicht mehr. Die Regeln im Stilblatt
       stehen dann alle da und greifen an nichts -- der Fehler waere zurueck,
       ohne dass sich eine Zeile im Stilblatt geaendert haette. */
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): die Zeile setzt seither auch
       die Klasse fuer den einen Zugang. Ohne das Nachziehen zeigte der
       Rueckbau auf eine Zeile, die es nicht mehr gibt, und waere stumm
       geworden (Stolperstein 192). Er nimmt weiterhin die ganze Klasse. */
    nr: '239', name: 'Die Kriterienliste bekommt ihre Rasterklasse nicht',
    file: 'public/app.js',
    search: "    box.className = 'rlist' + (withAverage ? '' : ' no-average');",
    replacement: "",
    expected: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  {
    /* Die Zahl wandert zurueck in die Sterne. Dann ist sie keine Rasterzelle
       mehr und wieder nur so breit wie ihr eigener Inhalt. */
    /* MITGEGANGEN MIT 0.21.0 (Stolperstein 201): der Anker hat sich
       verschoben, weil die leere Zelle seit dieser Runde einen Strich traegt
       statt gar nichts. Was der Rueckbau tut, ist unveraendert -- er steckt
       die Zahl zurueck in die Sternreihe, wo sie nur so breit waere wie ihr
       eigener Inhalt. */
    nr: '240', name: 'Die Zahl steckt wieder in den Sternen statt im Raster',
    file: 'public/app.js',
    search: "        row.append(a);",
    replacement: "        acts.append(a);",
    expected: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  {
    /* Die Trennlinie bleibt an der Zeile. Eine Zeile mit display: contents ist
       kein Kasten mehr -- die Linie verschwaende ganz. */
    nr: '241', name: 'Die Trennlinie wird wieder an der Zeile gezogen',
    file: 'public/style.css',
    search: ".rrow > * { padding: 9px 0; border-bottom: 1px solid var(--line-2); }\n.rrow:last-of-type > * { border-bottom: none; }",
    replacement: ".rrow { padding: 9px 0; border-bottom: 1px solid var(--line-2); }\n.rrow:last-of-type { border-bottom: none; }",
    expected: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },
  /* ---- 0.14.0: die Oberflaeche an der Marke ---- */
  {
    /* Die Marke wird wieder ein blosses Haekchen: der Satz darunter entfaellt.
       Genau der Zustand vor dieser Runde. */
    nr: '242', name: 'Die Marke sagt wieder nur "Abgelehnt"',
    file: 'public/app.js',
    search: "    drawRejection();\n  }",
    replacement: "  }",
    expected: 'Die Aussage an der Marke — 0.14.0'
  },
  {
    /* Der Name faellt aus der Aussage. Aussagen tragen in dieser Instanz ihren
       Verfasser -- ohne ihn ist es wieder ein Haekchen mit Datum. */
    nr: '243', name: 'Die Aussage verliert ihren Verfasser',
    file: 'public/app.js',
    search: "    if (item.rejectedAuthor && multipleUsers())\n" +
      "      parts.push(`von ${authorName(item.rejectedAuthor)}`);",
    replacement: "",
    expected: 'Die Aussage an der Marke — 0.14.0'
  },
  {
    /* DER NAME STEHT AUCH BEI EINEM EINZIGEN ZUGANG DA. Dann saende
       "von pruefer" nichts -- dieselbe Sache wie an jeder anderen
       Verfasserangabe, und die Prueflage mit EINEM Zugang faengt es. */
    nr: '247', name: 'Der Name steht auch bei einem einzigen Zugang da',
    file: 'public/app.js',
    search: "    if (item.rejectedAuthor && multipleUsers())",
    replacement: "    if (item.rejectedAuthor)",
    expected: 'Die Aussage an der Marke — 0.14.0'
  },
  {
    /* Die alte Begruendung geht beim erneuten Einschalten nicht mehr mit.
       Damit ist die Angabe, die beim Zuruecknehmen ausdruecklich stehen
       geblieben ist, beim naechsten Ablehnen doch weg. */
    nr: '244', name: 'Der Vorschlag zum Ueberschreiben geht verloren',
    file: 'public/app.js',
    search: "      : { rejected: true, rejectedReason: item.rejected_reason || '' };",
    replacement: "      : { rejected: true };",
    expected: 'Die Aussage an der Marke — 0.14.0'
  },
  {
    /* Das Feld fuer den Grund bleibt verborgen. Ein Feld, das man nicht sieht,
       ist ein Feld, das niemand fuellt -- und die Spalte bliebe leer.
       SEIT 0.15.0 HAENGT ES AN `grundOffen` und nicht mehr am Merkmal: der
       Ruhezustand hat es zu, und geoeffnet wird ueber Schalter, Text und
       Stift. Der Rueckbau trifft dieselbe Sache an ihrer neuen Zeile. */
    nr: '245', name: 'Das Feld fuer den Grund erscheint nicht',
    file: 'public/app.js',
    search: "    row.hidden = !open;",
    replacement: "    zeile.hidden = true;",
    expected: 'Das Feld steht nur, wo etwas fehlt — 0.15.1'
  },
  {
    /* Die Zeile steht auch dann da, wenn gar nichts bekannt ist -- dann sagt
       sie "Abgelehnt", also dasselbe wie der Schalter darueber. Dieselbe
       Aussage zweimal. */
    nr: '246', name: 'Die Aussage steht auch da, wenn sie nichts sagt',
    file: 'public/app.js',
    search: "    mark.hidden = !item.rejected || open || (!head && !reason && !showPen);",
    replacement: "    marke.hidden = !item.rejected;",
    expected: 'Die Aussage an der Marke — 0.14.0'
  },

  /* ---- 0.15.0: Der Filter und der Stift ---- */
  {
    /* Der Filter greift gar nicht mehr: die Menge bleibt, wie sie ist, gleich
       welcher der drei Zustaende gewaehlt ist. */
    nr: '250', name: 'Der Filter „abgelehnt" nimmt nichts weg',
    file: 'public/app.js',
    search: "  if (f.rejected === 'ja') out = out.filter(i => i.rejected);",
    replacement: "  if (false) out = out.filter(i => i.rejected);",
    expected: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Nur die Gegenrichtung faellt weg. "Zeig mir alles ausser dem
       Verworfenen" ist der haeufigere Griff und der Grund, warum es drei
       Zustaende sind und kein Umschalter. */
    nr: '251', name: 'Die Gegenrichtung des Filters faellt weg',
    file: 'public/app.js',
    search: "  else if (f.rejected === 'nein') out = out.filter(i => !i.rejected);",
    replacement: "  else if (false) out = out.filter(i => !i.rejected);",
    expected: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Der Schluessel steht nicht mehr in der Vorgabe. Damit faellt eine
       gespeicherte Ansicht nicht mehr auf "Alle" zurueck, filterNormal()
       raeumt ihn nicht auf, und filterZahl() vergleicht gegen undefined. */
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): `neu` steht nicht mehr in der
       Vorgabe -- die Pille ist gestrichen. Der Rueckbau nimmt weiterhin genau
       den Ablehnungsfilter heraus; ohne das Nachziehen griffe er ins Leere
       (Stolperstein 192). */
    nr: '252', name: 'Der neue Filter fehlt in der Vorgabe',
    file: 'public/app.js',
    search: "                         rejected: 'all', favorite: false,",
    replacement: "                         favorite: false,",
    expected: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Der eingeklappte Filterbereich zaehlt ihn nicht mit und sagt damit die
       Unwahrheit ueber die eine Frage, die er aufwirft. */
    nr: '253', name: 'Der Ablehnungsfilter zaehlt nicht mit',
    file: 'public/app.js',
    search: "  if (f.rejected !== v.rejected) n++;",
    replacement: "  if (false) n++;",
    expected: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Die Gruppe steht ohne zweite Beschriftung da und liest sich damit als
       Fortsetzung der Reihe davor -- als waeren es sechs Zustaende EINES
       Merkmals. */
    nr: '254', name: 'Die zweite Gruppe ist nicht abgesetzt',
    file: 'public/app.js',
    search: "  secondLabel(r1, t('list.rejection'));",
    replacement: "  // zweiteBeschriftung(r1, t('list.rejection'));",
    expected: 'Der Filter „abgelehnt" — 0.15.0'
  },
  {
    /* Der Server sagt nicht mehr, wem die Begruendung gehoert. Die Oberflaeche
       kann es nicht zurueckrechnen -- sie kennt ihren Namen, nicht ihre
       Nummer -- und der Stift verschwindet fuer den, der ihn braucht. */
    nr: '255', name: 'rejectedMine geht nicht mehr hinaus',
    file: 'server.js',
    search: "  it.rejectedMine = it.rejected_by != null && it.rejected_by === userId;",
    replacement: "  it.rejectedMine = false;",
    expected: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Dasselbe fuer den Eintrag: ohne `mine` faellt der Papierkorb bei dem
       weg, dem der Eintrag gehoert. */
    nr: '256', name: 'mine geht am Eintrag nicht mehr hinaus',
    file: 'server.js',
    search: "  it.mine = it.user_id === userId;",
    replacement: "  it.mine = false;",
    expected: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Die Fallunterscheidung faellt weg: das Entfernen laeuft wieder ueber
       nurSelbst, und ein Admin kann eine fremde Begruendung weder umschreiben
       noch wegnehmen. Genau die Luecke, die 0.15.0 schliesst. */
    nr: '257', name: 'Entfernen laeuft wieder ueber selfOnly',
    file: 'server.js',
    search: "  const removedReason = b.rejectedReason !== undefined && !reasonText(b.rejectedReason);",
    replacement: "  const removedReason = false;",
    expected: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Umgekehrt: die Klemme laesst jetzt ALLES durch, auch das Umschreiben
       einer fremden Begruendung. "Loeschen ja, umschreiben nein" waere damit
       "beides ja". */
    nr: '258', name: 'Auch das Umschreiben kommt durch',
    file: 'server.js',
    search: "  if (b.rejectedReason !== undefined && !turnsOn && !removedReason &&",
    replacement: "  if (false &&",
    expected: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Wer entfernt, wird wieder Verfasser einer Begruendung, die es gar nicht
       gibt -- an einer Ablehnung aus einer Instanz vor 0.14.0. */
    nr: '259', name: 'Wer entfernt, wird Verfasser',
    file: 'server.js',
    search: "    if (it.rejected_by == null && !removedReason) put('rejected_by', req.user.id);",
    replacement: "    if (it.rejected_von == null) put('rejected_von', req.user.id);",
    expected: 'Entfernen darf auch der Admin — 0.15.0'
  },
  {
    /* Das Feld schliesst sich nach dem Speichern nicht mehr. Damit steht die
       Aussage wieder neben einem dauernd offenen Feld -- dieselbe Sache
       zweimal, und genau der Befund aus dem Betrieb. */
    nr: '260', name: 'Das Feld bleibt nach dem Speichern offen',
    file: 'public/app.js',
    search: "      reasonOpen = false;\n      drawSwitches();\n    };\n    field.onblur = save;",
    replacement: "      drawSwitches();\n    };\n    feld.onblur = speichere;",
    expected: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Beim Einschalten steht das Feld nicht mehr offen. Ein Feld, das man erst
       suchen muss, bleibt leer -- das war die Zusage aus 0.14.0.
       SEIT 0.15.1 HAENGT DAS NICHT MEHR AM KLICK, sondern an der abgeleiteten
       Regel: abgelehnt und kein Grund heisst offen. Der Rueckbau nimmt
       deshalb die Haelfte der Regel weg, die den fehlenden Grund traegt --
       dieselbe Sache an ihrer neuen Zeile. */
    nr: '261', name: 'Beim Einschalten bleibt das Feld zu',
    file: 'public/app.js',
    search: "    const open = item.rejected && mine && (!reason || reasonOpen);",
    replacement: "    const open = item.rejected && mine && reasonOpen;",
    expected: 'Das Feld steht nur, wo etwas fehlt — 0.15.1'
  },
  {
    /* Der Stift steht auch dem da, der gar nicht schreiben darf -- und
       oeffnet ein Feld, dessen Inhalt der Server mit 403 abweist. */
    nr: '262', name: 'Der Stift steht jedem da',
    file: 'public/app.js',
    search: "    const showPen = item.rejected && mine;",
    replacement: "    const showPen = item.rejected;",
    expected: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Der Papierkorb steht jedem da -- auch der Fremden, die den Eintrag
       nicht aendern darf. */
    nr: '263', name: 'Der Papierkorb steht jedem da',
    file: 'public/app.js',
    search: "    const showPath = item.rejected && manage && !!reason;",
    replacement: "    const showPath = item.rejected && !!grund;",
    expected: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Der Papierkorb entfernt ohne Rueckfrage. Eine Angabe, die niemand
       wiederherstellen kann, verschwindet auf einen Klick. */
    nr: '264', name: 'Der Papierkorb fragt nicht mehr nach',
    file: 'public/app.js',
    search: "    if (!await confirmBox(t('entry.reasonDeleteAsk'),",
    replacement: "    if (false && !await confirmBox(t('entry.reasonDeleteAsk'),",
    expected: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Escape setzt das Feld nicht mehr zurueck, bevor es schliesst. Das
       Schliessen nimmt den Zeiger, onblur laeuft, und der verworfene Text
       wird genau von dem Weg gespeichert, der ihn verwerfen sollte. */
    nr: '265', name: 'Escape verwirft nicht mehr, sondern speichert',
    file: 'public/app.js',
    search: "        field.value = item.rejected_reason || '';\n        reasonOpen = false;\n        drawRejection();",
    replacement: "        reasonOpen = false;\n        drawAblehnung();",
    expected: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* An einer herrenlosen Ablehnung -- aus einer Instanz vor 0.14.0 -- gibt es
       keinen Weg mehr in das Feld. Der Server laesst dort jeden schreiben, der
       den Eintrag aendern darf; die Oberflaeche bietet es nicht mehr an. */
    nr: '266', name: 'An der herrenlosen Ablehnung fehlt der Weg hinein',
    file: 'public/app.js',
    search: "    const mine = may && (item.rejectedMine === true || !item.rejectedAuthor);",
    replacement: "    const meins = darf && item.rejectedMine === true;",
    expected: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Der Grund steht nicht mehr hervorgehoben da, sondern im selben Grau wie
       "Angelegt von … am …". Eine Entscheidung, die den Eintrag verwirft,
       liest sich wieder wie eine Randnotiz -- der zweite Befund. */
    nr: '267', name: 'Die Hervorhebung des Grundes faellt weg',
    file: 'public/style.css',
    search: ".rej-note .rej-why { color: var(--red); font-weight: 500; }",
    replacement: ".rej-note .rej-why { font-weight: 500; }",
    expected: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  /* ---- 0.15.1: `hidden` wirkt wieder ---- */
  {
    /* DIE EINE REGEL FAELLT WEG, und damit ist `hidden` im ganzen Haus wieder
       wirkungslos, sobald eine display-Regel danebensteht. Der Rueckbau nimmt
       das `!important` -- die Regel bleibt stehen und tut nichts mehr, genau
       die Lage von vor 0.15.1. */
    nr: '268', name: 'Die Regel fuer hidden verliert ihre Kraft',
    file: 'public/style.css',
    search: "[hidden] { display: none !important; }",
    replacement: "[hidden] { display: none; }",
    expected: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Die Regel verschwindet ganz. Damit stuenden die beiden oertlichen
       Flicken auch nicht mehr da -- niemand versteckt mehr irgendetwas. */
    nr: '269', name: 'Die Regel fuer hidden fehlt ganz',
    file: 'public/style.css',
    search: "[hidden] { display: none !important; }\n",
    replacement: "",
    expected: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Die Aussage steht auch dann da, wenn das Feld offen ist -- also beides
       zugleich. Genau die Doppelung, die 0.15.0 aufloesen sollte. */
    nr: '270', name: 'Aussage und Feld stehen wieder zugleich da',
    file: 'public/app.js',
    search: "    mark.hidden = !item.rejected || open || (!head && !reason && !showPen);",
    replacement: "    marke.hidden = !item.rejected || (!kopf && !grund && !showPen);",
    expected: 'Das Feld steht nur, wo etwas fehlt — 0.15.1'
  },
  {
    /* Das Feld steht auch dem offen, der nicht schreiben darf. Es nimmt dann
       eine Eingabe an, die der Server mit 403 abweist. */
    nr: '271', name: 'Das Feld steht auch dem offen, der nicht schreiben darf',
    file: 'public/app.js',
    search: "    const open = item.rejected && mine && (!reason || reasonOpen);",
    replacement: "    const open = item.rejected && (!reason || reasonOpen);",
    expected: 'Das Feld steht nur, wo etwas fehlt — 0.15.1'
  },

  /* ================= 0.16.0 — Abschnitte, Glocke und Auskunft ========== */
  {
    nr: '272', name: 'Der Systembereich zeigt wieder alle Karten auf einmal',
    file: 'public/app.js',
    search: "  const cards = SYS_CARDS.filter(k => k.section === open.key && k.visible(fetched));",
    replacement: "  const karten = SYS_KARTEN.filter(k => k.sichtbar(geholt));",
    expected: 'Der Systembereich nach Rolle'
  },
  {
    nr: '273', name: 'Ein Abschnitt ohne sichtbare Karte erscheint trotzdem',
    file: 'public/app.js',
    search: "  return SYS_SECTIONS.filter(a =>\n    SYS_CARDS.some(k => k.section === a.key && k.visible(fetched)));",
    replacement: "  return SYS_ABSCHNITTE;",
    expected: 'Der Systembereich nach Rolle'
  },
  {
    nr: '274', name: 'Die Adresse wird nicht mehr nachgezogen',
    file: 'public/app.js',
    search: "    history.replaceState(null, '', sysUrl(open.key));",
    replacement: "    void 0;",
    expected: 'Der Systembereich nach Rolle'
  },
  {
    nr: '275', name: 'Eine Adresse auf einen unsichtbaren Abschnitt zeigt ins Leere',
    file: 'public/app.js',
    search: "  const open = visibleOnes.find(a => a.key === desired) || visibleOnes[0];",
    replacement: "  const open = SYS_ABSCHNITTE.find(a => a.schluessel === gewuenscht) || sichtbare[0];",
    expected: 'Der Systembereich nach Rolle'
  },
  {
    /* DIE REITER VERLIEREN IHRE ADRESSE. Genau die Falle, in die draussen alle
       einmal getreten sind: ohne Adresse laesst sich keine Einstellung
       verlinken und die Zurueck-Taste bricht. */
    nr: '276', name: 'Die Reiter tragen keine eigene Adresse mehr',
    file: 'public/app.js',
    search: "      ${visibleOnes.map(a => `<a class=\"sys-tab${a === open ? ' on' : ''}\"",
    replacement: "      ${sichtbare.map(a => `<button class=\"sys-tab${a === open ? ' on' : ''}\"",
    expected: 'Der Systembereich nach Rolle'
  },
  {
    nr: '277', name: 'Der Import steht wieder gleichrangig neben dem Export',
    file: 'public/app.js',
    search: "        <h4 class=\"sys-sub\">${tH('card.import')}</h4>",
    replacement: "        <h3>${tH('card.import')}</h3>",
    expected: 'Export und Import stehen in einer Karte'
  },
  {
    nr: '278', name: 'Das Ablagefeld des Imports wird wieder gleich laut gezeichnet',
    file: 'public/app.js',
    search: '        <label class="drop drop-quiet" id="imp-drop">',
    replacement: '        <label class="drop" id="imp-drop">',
    expected: 'Export und Import stehen in einer Karte'
  },
  {
    /* MITGEGANGEN MIT 0.21.0 (Stolperstein 201): der Erklaerknopf bekommt
       seit dieser Runde den Kasten mit, zu dem er gehoert -- es gibt ihn
       zweimal. Was der Rueckbau tut, ist unveraendert. */
    nr: '279', name: 'Die Kopfzahl ist wieder blosser Text',
    file: 'public/app.js',
    search: "        b.onclick = () => showCalc(boxId);",
    replacement: "        b.onclick = null;",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    /* DER KERN VON PUNKT 4: der Kasten LIEST die Rechnung. Rechnet er nach,
       gibt es zwei Wege zu derselben Zahl -- und sie laufen auseinander. */
    nr: '280', name: 'Der Erklaerkasten rechnet wieder selbst nach',
    file: 'public/app.js',
    search: "          <span id=\"calc-result\">⌀ ${esc(weightNumber(removed.result))}</span></div>",
    replacement: "          <span id=\"calc-result\">⌀ ${esc(gewZahl(Math.round((weg.summe / weg.teiler) * 10) / 10))}</span></div>",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '281', name: 'Der Rechenweg faellt aus der Antwort',
    file: 'server.js',
    search: "  it.calc = { ...calc, result: it.avgRating };",
    replacement: "  void rechenweg;",
    expected: 'Der Rechenweg reist mit'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): der Rechenweg traegt seither
       auch die Vergleichszahl ohne Gewichte, und der Aufruf ist damit vier
       Zeilen lang. Ohne das Nachziehen griffe der Rueckbau ins Leere und waere
       stumm geworden (Stolperstein 192). Er rundet weiterhin genau das, was er
       vorher gerundet hat -- Summe und rohen Quotienten. */
    nr: '282', name: 'Der Rechenweg wird auf zwei Stellen gerundet ausgeliefert',
    file: 'server.js',
    search: "    { rows, sum: counter, divisor: denominator, raw: denominator ? counter / denominator : null,",
    replacement: "    { zeilen, summe: Math.round(zaehler * 100) / 100, teiler: nenner,\n      roh: nenner ? Math.round((zaehler / nenner) * 100) / 100 : null,",
    expected: 'Der Rechenweg reist mit'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201), derselbe Grund wie bei 143.
       Der Rueckbau nimmt weiterhin genau den Bezugspunkt der Glocke heraus. */
    nr: '283', name: 'Der Bezugspunkt der Glocke ist kein persoenlicher Schluessel mehr',
    file: 'server.js',
    search: "'searchNames',\n                                'bellSeen', 'views', 'strip', 'theme', 'language'];",
    replacement: "'searchNames',\n                                'views', 'strip', 'theme', 'language'];",
    expected: 'Persoenliche Einstellungen'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): der Knopf heisst nicht mehr
       „Neu von anderen" -- die Glocke meldet seither von allen. Ohne das
       Nachziehen griffe der Rueckbau ins Leere (Stolperstein 192). */
    nr: '284', name: 'Die Glocke steht auch ohne gespeicherten Bezugspunkt',
    file: 'public/app.js',
    search: "        ${BELL_SEEN ? `<button class=\"icon-btn bell\" id=\"bell\" title=\"${esc(t('list.news'))}\"",
    replacement: "        ${true ? `<button class=\"icon-btn bell\" id=\"bell\" title=\"${esc(t('list.news'))}\"",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): aus `freshForeign` sind drei
       Angaben geworden, und der Suchtext griff ins Leere (Stolperstein 192).
       DIE ZUSAGE IST DIESELBE: ohne Bezugspunkt fehlt die Angabe GANZ und
       steht nicht auf 0 -- die Oberflaeche unterscheidet „nichts Neues" von
       „es gibt keinen Bezugspunkt". */
    nr: '285', name: 'Die Zahl der Kommentare steht auch ohne Bezugspunkt da',
    file: 'server.js',
    search: "    if (reference) it.newComments = newCommentsPer.get(it.id) || 0;",
    replacement: "    it.neuKommentare = newCommentsPer.get(it.id) || 0;",
    expected: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    /* NEU MIT 0.17.0: die drei Angaben stehen oder fehlen GEMEINSAM. Eine
       Antwort mit nur einer davon waere eine dritte Lage, die niemand kennt. */
    nr: '314', name: 'Die Verfasser stehen auch ohne Bezugspunkt an jedem Eintrag',
    file: 'server.js',
    search: "    if (reference) it.newFrom = [...(newFromPer.get(it.id) || [])].map(uid => authorFrom(card, uid));",
    replacement: "    it.neuVon = [...(neuVonJe.get(it.id) || [])].map(uid => authorFrom(karte, uid));",
    expected: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    /* MITGENOMMEN MIT 0.17.0 UND UMGEDREHT (Stolperstein 201). Bis 0.16.0 hiess
       der Rueckbau „Die Glocke zaehlt die eigenen Kommentare mit" und nahm die
       Bedingung `IFNULL(user_id, -1) != ?` weg. Die Entscheidung ist
       zurueckgenommen: die Glocke meldet seither von ALLEN, sonst meldete sie
       einem Betreiber, der allein arbeitet, nie etwas. Der Rueckbau baut die
       alte Bedingung deshalb WIEDER EIN -- und genau daran muss die Gruppe rot
       werden. */
    /* UMGEDREHT MIT 0.17.2, ZUM ZWEITEN MAL (Stolperstein 201). Bis 0.16.0
       hiess er „zaehlt die eigenen nicht mit", 0.17.0 machte daraus das
       Gegenteil, und seit 0.17.2 gilt wieder 0.16.0 -- der Anker faehrt die
       Bedingung also wieder HERAUS statt hinein. */
    nr: '286', name: 'Die Glocke zaehlt die eigenen Kommentare wieder mit',
    file: 'server.js',
    search: "  `SELECT item_id, user_id, COUNT(*) AS n FROM comments\n    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id, user_id`);",
    replacement: "  `SELECT item_id, user_id, COUNT(*) AS n FROM comments\n    WHERE created_at > ? AND user_id IS NOT NULL GROUP BY item_id, user_id`);",
    expected: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    nr: '287', name: 'Bewertungen ohne Zeitpunkt gelten wieder als neu',
    file: 'server.js',
    search: "    WHERE set_at IS NOT NULL AND set_at > ? AND value > 0",
    replacement: "    WHERE IFNULL(set_at, '9999-12-31') > ? AND value > 0",
    expected: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    nr: '288', name: 'Der Zeitpunkt zieht beim Ueberschreiben nicht mehr mit',
    file: 'server.js',
    search: "              DO UPDATE SET value = excluded.value, set_at = excluded.set_at`)",
    replacement: "              DO UPDATE SET value = excluded.value`)",
    expected: 'Die Bewertung traegt ihren Zeitpunkt'
  },
  {
    /* EIN PUNKT FUER EIN EREIGNIS, EINE ZAHL FUER EINEN ZUSTAND. Die beiden
       Zeichen werden nirgends vertauscht. */
    nr: '289', name: 'Der Punkt an der Glocke wird wieder eine Zahl',
    file: 'public/app.js',
    search: "  atElement('bell-dot', el => { el.hidden = !fresh; });",
    replacement: "  amElement('bell-dot', el => { el.textContent = String(neu); el.hidden = !neu; });",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    nr: '290', name: 'Der Zaehler „Offen" zeigt auch die Null',
    file: 'public/app.js',
    search: "    el.textContent = open ? String(open) : '';\n    el.hidden = !open;",
    replacement: "    el.textContent = String(open);\n    el.hidden = false;",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): dieselbe Zeile steht seither
       auch in merkeGesehen() -- dort setzt sie den Bezugspunkt beim ERSTEN
       Verlassen der Uebersicht, hier beim Oeffnen der Tafel. Ein Suchtext, der
       zweimal passt, bricht den Rueckbau ab; die Zeile davor macht ihn wieder
       eindeutig. */
    nr: '291', name: 'Das Oeffnen der Tafel zieht den Bezugspunkt nicht nach',
    file: 'public/app.js',
    search: "     weiter da und behauptete etwas, das nicht mehr gilt. */\n  api('PUT', '/api/settings', { bellSeen: 1 }).catch(() => {});",
    replacement: "     weiter da und behauptete etwas, das nicht mehr gilt. */\n  void 0;",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    /* EINE MELDUNG, DIE MAN NICHT ANSPRINGEN KANN, IST EINE MITTEILUNG OHNE
       WEG -- das ist der halbe Gewinn der Tafel. */
    nr: '292', name: 'Die Zeilen der Tafel fuehren nicht mehr zum Eintrag',
    file: 'public/app.js',
    search: "    a.href = `#/item/${it.id}`;\n    a.dataset.mid = String(it.id);",
    replacement: "    a.href = '#/';\n    a.dataset.mid = String(it.id);",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    nr: '293', name: 'Die Kennzahlen nennen die Verfahren nicht mehr',
    file: 'server.js',
    search: "    method: { ...method(), passwords: 'scrypt' },",
    replacement: "",
    expected: 'Der Versions-Fingerprint'
  },
  {
    nr: '294', name: 'Die Kennzahlen nennen zusaetzlich die Paketversion',
    file: 'server.js',
    search: "    method: { ...method(), passwords: 'scrypt' },",
    replacement: "    verfahren: { ...verfahren(), passwoerter: 'scrypt',\n      paket: require('./package.json').dependencies['better-sqlite3-multiple-ciphers'] },",
    expected: 'Der Versions-Fingerprint'
  },
  {
    nr: '295', name: 'Das Journal wird behauptet statt abgelesen',
    file: 'db.js',
    search: "    journal: String(db.pragma('journal_mode', { simple: true }) || '').toUpperCase()",
    replacement: "    journal: 'DELETE'",
    expected: 'Der Versions-Fingerprint'
  },
  {
    /* DER GEFAEHRLICHSTE KNOPF DER INSTANZ, wenn er ohne Frage loescht. */
    nr: '296', name: 'Der Papierkorb loescht wieder ohne Rueckfrage',
    file: 'public/app.js',
    search: "    if (!await confirmBox(t('entry.deleteWordAsk', { word: word }), t('entry.deleteHint', { word: word }))) return false;",
    replacement: "    if (false) return false;",
    expected: 'Der Papierkorb im Vollbild'
  },
  {
    nr: '297', name: 'Das Vollbild bekommt seinen Papierkorb nicht',
    file: 'public/app.js',
    search: "        ${remove ? `<button class=\"lb-btn remove\" title=\"${esc(t('dialog.delete'))}\">${ICON_TRASH}</button>` : ''}",
    replacement: "    ${false ? `<button class=\"lb-btn weg\" title=\"${esc(t('dialog.delete'))}\">${ICON_TRASH}</button>` : ''}",
    expected: 'Der Papierkorb im Vollbild'
  },
  {
    nr: '298', name: 'Der Vorschaustreifen im Vollbild zieht nach dem Loeschen nicht nach',
    file: 'public/app.js',
    search: "    buildStrip();\n    show();",
    replacement: "    show();",
    expected: 'Der Papierkorb im Vollbild'
  },
  {
    /* EIN WERKZEUG, DAS SEINEN EIGENEN FUND NICHT SEHEN KANN, IST SCHLIMMER
       ALS KEINES (Stolperstein 213). */
    nr: '299', name: 'Die Groessenmessung findet gar nichts mehr',
    file: 'testbench.js',
    search: "    return found.sort((a, b) => b.rows - a.rows || a.name.localeCompare(b.name));",
    replacement: "    return [];",
    expected: 'Die Groesse der Funktionen wird gemessen'
  },
  {
    nr: '300', name: 'Der Nummernfilter der Gegenprobe greift wieder in die Namen',
    file: 'counterproof.js',
    search: "  if (/^\\d+$/.test(a)) return r.nr.toLowerCase() === a;",
    replacement: "  if (false) return r.nr.toLowerCase() === a;",
    expected: 'Die Gegenproben greifen'
  },

  /* ---- 0.17.0: das Raster der Kriterienliste ---- */
  {
    /* DIE SPALTENZAHL STEHT WIEDER FEST -- genau der Fehler aus dem Betrieb:
       zwei Zellen in drei Spalten, und die Liste zerfaellt. */
    nr: '301', name: 'Die Spaltenzahl folgt dem Zustand nicht mehr',
    file: 'public/app.js',
    search: "    box.className = 'rlist' + (withAverage ? '' : ' no-average');",
    replacement: "    box.className = 'rlist';",
    expected: 'Das Raster der Kriterienliste zaehlt seine Zellen — 0.17.0'
  },
  {
    /* DIE KLASSE STEHT, DIE REGEL FEHLT. Ein Rueckbau, der nur die Klasse
       naehme, liesse eine Pruefung durch, die bloss das Attribut liest
       (Stolperstein 223) -- dieser hier nimmt den Gegenstand weg. */
    nr: '302', name: 'Die Regel fuer den einen Zugang faellt aus dem Stilblatt',
    file: 'public/style.css',
    search: ".rlist.no-average { grid-template-columns: 1fr auto auto; }",
    replacement: "",
    expected: 'Das Raster der Kriterienliste zaehlt seine Zellen — 0.17.0'
  },

  /* ---- 0.17.0: zwei Masse vom echten Geraet ---- */
  {
    /* DIE ANMELDESEITE MISST WIEDER IN vh -- der grossen Anzeigeflaeche, die
       man auf dem Telefon gar nicht sieht. */
    nr: '303', name: 'Die Anmeldeseite misst die Hoehe wieder in vh',
    file: 'public/style.css',
    search: "body.login { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; }",
    replacement: "body.login { display: flex; flex-direction: column; min-height: 100vh; }",
    expected: 'Zwei Masse vom echten Geraet — 0.17.0'
  },
  {
    /* DER RUECKFALL STEHT DAHINTER STATT DAVOR: ein Browser ohne `dvh`
       ueberliest die letzte Zeile und behaelt gar keine Hoehe. */
    nr: '304', name: 'Der Rueckfall 100vh steht hinter dem dvh statt davor',
    file: 'public/style.css',
    search: "  min-height: 100vh; min-height: 100dvh;",
    replacement: "  min-height: 100dvh; min-height: 100vh;",
    expected: 'Zwei Masse vom echten Geraet — 0.17.0'
  },
  {
    /* DER UMBRUCH GILT WIEDER NUR UNTERHALB EINES UMBRUCHPUNKTS -- auf dem
       Desktop laeuft die Zeile damit erneut seitlich aus dem Kasten. */
    nr: '305', name: 'Die Anmeldezeile darf wieder breiter werden als ihr Kasten',
    file: 'public/style.css',
    /* AM GEGENSTAND UND NICHT AN EINEM KOMMENTAR DANEBEN: die Regel kommt
       ausserhalb der Medienabfrage genau einmal vor, und wer sie umformuliert,
       aendert die Sache selbst. Ein Suchtext, der an einem Kommentar haengt,
       greift ins Leere, sobald jemand den Kommentar besser schreibt.
       SEIT 0.17.1 ZIELT ER AUFS RASTER. Die Zusage ist dieselbe geblieben --
       der Rahmen der eigenen Anmeldung reicht bis zum Rand --, sie haengt nur
       nicht mehr am Umbruch, sondern an der nachgebenden Namensspalte. */
    search: `.mrow.session { display: grid; grid-template-columns: minmax(0, 1fr) auto;
  align-items: center; column-gap: 9px; row-gap: 2px; }`,
    replacement: ".mrow.sitz { display: grid; grid-template-columns: max-content auto; }",
    expected: 'Zwei Masse vom echten Geraet — 0.17.0'
  },
  {
    /* DIE VIERTE KACHEL STEHT WIEDER SCHMAL UNTER DREI BREITEN. */
    nr: '306', name: 'Die Karte „Mailversand" verliert ihre Breite wieder',
    file: 'public/app.js',
    search: "  return `<div class=\"sys-card wide\">\n        <h3>${tH('card.mailDelivery')}</h3>",
    replacement: "  return `<div class=\"sys-card\">\n        <h3>${tH('card.mailDelivery')}</h3>",
    expected: 'Der Systembereich nach Rolle'
  },
  {
    /* DIE ZWEITE HAELFTE VON 238, seit 0.17.0 ein eigener Rueckbau: die Zeile
       wird wieder ein eigener Kasten, und damit koennen sich die Spalten nicht
       mehr an der breitesten Zelle der ganzen Liste ausrichten -- genau der
       Befund, den 0.14.0 behoben hat. */
    nr: '307', name: 'Aus den Rasterzellen wird wieder eine eigene Zeile',
    file: 'public/style.css',
    search: ".rrow { display: contents; }",
    replacement: ".rrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; }",
    expected: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },

  /* ---- 0.17.0: die Vergleichszahl ohne Gewichte ---- */
  {
    /* DIE VERGLEICHSZAHL REIST NICHT MEHR MIT -- die Formel steht wieder da
       und sagt nicht, wofuer die Gewichte gut sind. */
    nr: '308', name: 'Die Vergleichszahl faellt aus dem Rechenweg',
    file: 'server.js',
    search: "      equalSum: sameCounter, equalDivisor: rows.length,",
    replacement: "      gleichSumme: 0, gleichTeiler: 0,",
    expected: 'Der Rechenweg reist mit'
  },
  {
    /* SIE RECHNET WIEDER MIT GEWICHTEN -- und ist damit dieselbe Rechnung ein
       zweites Mal, also gar kein Vergleich. */
    nr: '309', name: 'Die Vergleichszahl rechnet die Gewichte doch wieder ein',
    file: 'server.js',
    search: "    sameCounter += z.average;",
    replacement: "    sameCounter += produkt;",
    expected: 'Der Rechenweg reist mit'
  },
  {
    /* GERUNDET WIRD ZWEIMAL: je Kriterium und am Ende. */
    nr: '310', name: 'Die Vergleichszahl wird ungerundet ausgeliefert',
    file: 'server.js',
    search: "      equalResult: rows.length\n        ? Math.round((sameCounter / rows.length) * 10) / 10 : null });",
    replacement: "      gleichErgebnis: zeilen.length ? sameCounter / zeilen.length : null });",
    expected: 'Der Rechenweg reist mit'
  },
  {
    /* DER KASTEN ZEIGT SIE NICHT MEHR. */
    nr: '311', name: 'Der Erklaerkasten laesst die Vergleichszahl weg',
    file: 'public/app.js',
    search: "        ${withWeight ? `<div class=\"calc-row calc-same\"><span>${tH('entry.calcNoWeights')}</span>",
    replacement: "        ${false ? `<div class=\"rz calc-same\"><span>${tH('entry.calcNoWeights')}</span>",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    /* SIE STEHT AUCH DA, WO ALLE GEWICHTE 1 SIND -- dann steht zweimal
       dieselbe Zahl im Kasten, und das ist eine Auskunft ueber nichts. */
    nr: '312', name: 'Die Vergleichszahl steht auch ohne jede Gewichtung da',
    file: 'public/app.js',
    search: "    const sameNumber = Number(removed.equalResult) === Number(removed.result);",
    replacement: "    const gleicheZahl = false;",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    /* DER KASTEN RECHNET SIE SELBST NACH statt sie zu lesen -- eine zweite
       Rechenstelle im Browser (Stolperstein 217). */
    nr: '313', name: 'Der Kasten rechnet die Vergleichszahl selbst nach',
    file: 'public/app.js',
    search: "          <span id=\"calc-same\">⌀ ${esc(weightNumber(removed.equalResult))}</span></div>` : ''}",
    replacement: "          <span id=\"calc-same\">⌀ ${esc(gewZahl(Math.round((weg.zeilen.reduce((n, z) => n + z.schnitt, 0) / weg.zeilen.length) * 10) / 10))}</span></div>` : ''}",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },

  /* ---- 0.17.0: die Glockentafel sagt, was neu ist ---- */
  {
    /* DIE BEIDEN ZAHLEN WERDEN WIEDER ZU EINER -- genau der Befund: „7 neue
       Beitraege" sagt nicht, WAS auf einen wartet. */
    nr: '315', name: 'Die Tafel zaehlt Kommentare und Bewertungen wieder zusammen',
    file: 'public/app.js',
    search: "  return [k ? t('list.commentCount', { n: k }) : '',\n          b ? `${b} ${vRating(b)}` : ''].filter(Boolean).join(' · ');",
    replacement: "  const n = k + b;\n  return `${n} ${n === 1 ? 'neuer Beitrag' : 'neue Beiträge'}`;",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    /* DIE NULL STEHT WIEDER DA. „0 Bewertungen" ist eine Auskunft ueber
       nichts -- dieselbe Regel wie am Knopf „Offen". */
    nr: '316', name: 'Die Tafel schreibt auch die Null hin',
    file: 'public/app.js',
    search: "b ? `${b} ${vRating(b)}` : ''].filter(Boolean).join(' · ');",
    replacement: "`${b} ${vBewertung(b)}`].join(' · ');",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    /* EINE FESTE ENDUNG MACHT AUS EINEM KOMMENTAR „1 Kommentare". */
    nr: '317', name: 'Die Tafel schreibt die Mehrzahl auch bei einem Kommentar',
    file: 'public/languages/de.json',
    search: "\"list.commentCount\": {\n    \"one\": \"{n} Kommentar\",",
    replacement: "\"list.commentCount\": {\n    \"one\": \"{n} Kommentare\",",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    /* DIE ZAHLEN KOMMEN AUS EINER ABFRAGE, DIE SIE NICHT MEHR TRENNT. Der
       Server wirft die Auskunft wieder weg, noch bevor sie hinausgeht. */
    nr: '318', name: 'Der Server legt beide Zahlen wieder in eine Kiste',
    file: 'server.js',
    search: "      newRatingsPer.set(z.item_id, (newRatingsPer.get(z.item_id) || 0) + z.n);",
    replacement: "      newCommentsPer.set(z.item_id, (newCommentsPer.get(z.item_id) || 0) + z.n);",
    expected: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    /* DIE TAFEL ORDNET NACH EINEM DER TEILE STATT NACH DER SUMME -- ein
       Eintrag mit vier neuen Bewertungen stuende unter einem mit einem
       Kommentar. */
    nr: '319', name: 'Die Tafel ordnet nach den Kommentaren statt nach der Summe',
    file: 'public/app.js',
    search: "    .slice().sort((a, b) => (freshCount(b) - freshCount(a)) || String(a.title).localeCompare(String(b.title), LOCALE));",
    replacement: "    .slice().sort((a, b) => ((b.neuKommentare || 0) - (a.neuKommentare || 0)) || String(a.title).localeCompare(String(b.title), LOCALE));",
    expected: 'Die Glocke in der Kopfzeile'
  },

  /* ---- 0.17.0: die Glocke ersetzt die Pille ---- */
  {
    /* DIE TAFEL SAGT NICHT MEHR, VON WEM. Bei einer Glocke, die auch die
       eigenen Beitraege meldet, ist das die halbe Auskunft. */
    nr: '320', name: 'Die Tafel sagt nicht mehr, von wem etwas kommt',
    file: 'public/app.js',
    search: "    a.querySelector('.bell-from').textContent = newFromWords(it);",
    replacement: "    a.querySelector('.bell-from').textContent = '';",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    /* DIE ABFRAGE GRUPPIERT NICHT MEHR NACH VERFASSER. Dann liefert sie je
       Eintrag EINE Zeile, und in `neuVon` steht nur noch EIN Name statt aller
       -- die Tafel sagt dann die halbe Wahrheit darueber, von wem etwas kommt.
       ZWEI ANLAEUFE VORHER ZIELTEN AUF DIE MENGE und blieben STUMM: die
       Eindeutigkeit kommt aus dem GROUP BY, nicht aus der Menge, und ein
       Rueckbau, der ein zweites Netz wegnimmt, kann nichts zeigen
       (Stolperstein 235). Der Anker gehoert an die tragende Zusage. */
    nr: '321', name: 'Die Abfrage gruppiert nicht mehr nach Verfasser',
    file: 'server.js',
    search: "    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id, user_id`);",
    replacement: "    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id`);",
    expected: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    /* DIE AUFZAEHLUNG WIRD EINE LISTE MIT KOMMAS BIS ZUM SCHLUSS -- so
       zaehlt man Dinge auf, nicht Menschen. */
    nr: '322', name: 'Die Namen werden mit Kommas bis zum Schluss aufgezaehlt',
    file: 'public/app.js',
    search: "  const last = names[names.length - 1], first = names.slice(0, -1).join(', ');\n  return t('list.byNames',\n    { names: first ? t('list.namesAndLast', { first: first, last: last }) : last });",
    replacement: "  return t('list.byNames', { names: names.join(', ') });",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    /* DIE PILLE „NEU SEIT ..." KOMMT ZURUECK -- zwei Anzeigen fuer dieselbe
       Frage, und die Filterzeile ist wieder eine Pille laenger. */
    nr: '323', name: 'Der Schluessel der gestrichenen Pille bleibt in der Stellung stehen',
    file: 'public/app.js',
    search: "  delete f.fresh;\n  return f;",
    replacement: "  return f;",
    expected: 'Die gestrichene Pille „Neu seit …" — 0.17.0'
  },
  {
    /* DER BEZUGSPUNKT DER GLOCKE FAEHRT BEI JEDEM VERLASSEN HINAUS statt genau
       einmal -- dann setzt ein Blick in einen Eintrag die Tafel zurueck, ohne
       dass jemand sie gelesen haette. */
    nr: '324', name: 'Der Bezugspunkt faellt bei jedem Verlassen der Uebersicht',
    file: 'public/app.js',
    search: "  if (BELL_SEEN) return;\n  BELL_SEEN = true;",
    replacement: "  BELL_SEEN = true;",
    expected: 'Der Bezugspunkt der Glocke in der Oberflaeche'
  },
  {
    /* DIE ZEILE DER TAFEL BRICHT NICHT MEHR UM -- der Titel schrumpft zu
       Punkten, damit die Namen Platz haben. */
    nr: '325', name: 'Die Zeile der Glockentafel bricht nicht mehr um',
    file: 'public/style.css',
    search: ".mrow.bell-row { flex-wrap: wrap; row-gap: 2px; }",
    replacement: "",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    /* DIE ANGABE „VON WEM" BEKOMMT KEINE EIGENE ZEILE MEHR. */
    nr: '326', name: 'Die Angabe „von wem" bekommt keine eigene Zeile',
    file: 'public/style.css',
    search: ".bell-row .bell-from { flex-basis: 100%; font-size: .76rem; color: var(--faint); }",
    replacement: ".bell-row .bell-from { font-size: .76rem; color: var(--faint); }",
    expected: 'Die Glocke in der Kopfzeile'
  },

  /* ---- 0.17.0: die beiden gestrichenen Erklaertexte ----
     EIN GESTRICHENER TEXT LAESST SICH NUR ZURUECKBAUEN, INDEM MAN IHN WIEDER
     HINSCHREIBT. Beide Rueckbauten setzen genau den Satz zurueck, den die
     Runde aus der Oberflaeche genommen hat -- und die Zusagen, die das
     festhalten, muessen daran rot werden. */
  {
    nr: '327', name: 'Die Kennzahlen begruenden den Vorbehalt wieder an der Oberflaeche',
    file: 'public/app.js',
    search: "        <div class=\"kv\"><span class=\"k\">${tH('card.passwords')}</span><span class=\"v\">${esc(stats.method.passwords || '—')}</span></div>` : ''}",
    replacement: "        <div class=\"kv\"><span class=\"k\">${tH('card.passwords')}</span><span class=\"v\">${esc(stats.verfahren.passwoerter || '—')}</span></div>\n        <p class=\"desc\" style=\"margin:10px 0 0\"><strong>Welche Fassung welcher Bibliothek</strong>\n          das rechnet, steht hier <strong>nicht</strong>: das wäre die Angabe, nach der jemand\n          sucht, der eine Lücke ausnutzen will.</p>` : ''}",
    expected: 'Der Papierkorb in der Oberflaeche'
  },
  {
    nr: '328', name: 'Die Glockentafel begruendet sich wieder selbst',
    file: 'public/app.js',
    search: "    <div class=\"manage-list\" id=\"bell-list\"></div>\n    <div class=\"modal-acts\">",
    replacement: "    <div class=\"manage-list\" id=\"bell-list\"></div>\n    <p class=\"hint hint-sm\" style=\"margin:2px 0 0\"><strong>Was die Glocke nicht verspricht:</strong>\n      Sie rechnet beim Aufbau der Übersicht nach, nicht laufend.</p>\n    <div class=\"modal-acts\">",
    expected: 'Die Glocke in der Kopfzeile'
  },
  /* DIE GEGENRICHTUNG ZU 301. Dort faellt die KLASSE weg und das Raster bleibt
     bei drei Spalten; hier bleibt die Klasse und die ZELLE loest sich von der
     Bedingung -- drei Zellen in zwei Spalten. Ohne diesen Rueckbau belegte
     nichts, dass die Gruppe wirklich Zellen GEGEN Spalten haelt und nicht bloss
     eine Klasse liest (Stolperstein 223). */
  {
    nr: '329', name: 'Die Durchschnittszelle haengt nicht mehr an derselben Bedingung',
    file: 'public/app.js',
    search: "      if (withAverage) {",
    replacement: "      if (true) {",
    expected: 'Das Raster der Kriterienliste zaehlt seine Zellen — 0.17.0'
  },
  /* DER SATZ ZEIGT WIEDER AUS DEM KASTEN HINAUS -- auf die Durchschnittsspalte
     der Liste dahinter, die es bei einem einzigen Zugang nicht gibt.
     SEIN SUCHTEXT IST MIT 0.22.1 MITGEGANGEN und nicht geloescht (Stolperstein
     201): der Satz traegt seither „ueber alle Benutzer" (E5). Der Rueckbau
     nimmt beides zugleich zurueck -- den Verweis nach draussen UND die
     Auskunft, wessen Zahl es ist; das ist gewollt, denn beides steht in
     demselben Satz. */
  {
    nr: '330', name: 'Der Erklaerkasten verweist wieder auf die Spalte dahinter',
    file: 'public/app.js',
    search: "${tH('entry.calcFirstAvg')} <strong>${tH('entry.grade')}</strong>${tH('entry.calcThenAvg')}",
    replacement: "${tH('entry.calcFirstAvg')}${tH('entry.calcThenAvg')}",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  /* DIESELBE FRAGE WIE AN DER KRITERIENLISTE, EINE ANSICHT WEITER: passen die
     Zellen einer Zeile zu den Spalten ihres Rasters? 331 nimmt dem Raster eine
     Spalte, 333 der Zeile eine Zelle -- beide Richtungen, weil eine allein die
     andere nicht belegt. Bis 0.17.0 stand die Vier in der Pruefung getippt und
     nicht im Stilblatt gelesen; kein Rueckbau konnte sie treffen. */
  {
    nr: '331', name: 'Das Raster des Erklaerkastens verliert eine Spalte',
    file: 'public/style.css',
    search: ".calc { display: grid; grid-template-columns: 1fr auto auto auto; gap: 0 14px; }",
    replacement: ".rechnung { display: grid; grid-template-columns: 1fr auto auto; gap: 0 14px; }",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  /* DIE REGEL, DIE DIE VERGLEICHSZAHL UNTERORDNET. Ihr Kommentar macht vier
     Zusagen; bis 0.17.0 stand keine davon in einer Pruefung (Stolperstein 199). */
  {
    nr: '332', name: 'Die Vergleichszeile wird dem Ergebnis gleichgestellt',
    file: 'public/style.css',
    search: ".calc-same > span { color: var(--muted); border-bottom: 0; border-top: 1px solid var(--line-2); }",
    replacement: ".calc-same > span { font-weight: 640; color: #8a8a8a; border-bottom: 0; }",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '333', name: 'Die Vergleichszeile bekommt eine Zelle zu wenig',
    file: 'public/app.js',
    search: "          <span></span><span></span>\n          <span id=\"calc-same\">",
    replacement: "          <span></span>\n          <span id=\"calc-same\">",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },

  /* ---- 0.17.1: was der Benutzer sieht ---- */
  {
    nr: '334', name: 'Die Marke am Adressfeld behauptet wieder immer „freiwillig"',
    file: 'public/app.js',
    search: "        <div class=\"field\"><label>${tH('login.email')} <span class=\"hint\">${\n          SIGNUP ? t('card.required') : t('card.optional')}</span></label>",
    replacement: "        <div class=\"field\"><label>${tH('login.email')} <span class=\"hint\">${t('card.optional')}</span></label>",
    expected: 'Der Zugangstext sagt, was gilt — 0.17.1'
  },
  {
    nr: '335', name: 'Der Absatz richtet sich nicht mehr nach der Selbstanmeldung',
    file: 'public/app.js',
    search: "        <p class=\"desc\" style=\"margin:0 0 10px\">${SIGNUP",
    replacement: "        <p class=\"desc\" style=\"margin:0 0 10px\">${false",
    expected: 'Der Zugangstext sagt, was gilt — 0.17.1'
  },
  {
    nr: '336', name: 'Der Merker der Selbstanmeldung bleibt beim Umlegen stehen',
    file: 'public/app.js',
    search: "      SIGNUP = !!d.an;\n",
    replacement: "",
    expected: 'Der Zugangstext sagt, was gilt — 0.17.1'
  },
  {
    nr: '337', name: 'Der Wirtsbefehl steht wieder bei jedem',
    file: 'public/app.js',
    search: "function serverBox(sentence, command) {\n  if (!OWNER) return '';",
    replacement: "function serverKasten(satz, befehl) {\n  if (false) return '';",
    expected: 'Der Systembereich nach Rolle'
  },
  {
    nr: '338', name: 'Die Laengenvorgabe faellt vom Passwortfeld weg',
    file: 'public/app.js',
    search: "        <div class=\"field\"><label>${tH('dialog.newPassword')}\n          <span class=\"hint\">${tH('card.minCharsHint', { minPassword: MIN_PASSWORD })}</span></label>",
    replacement: "        <div class=\"field\"><label>${tH('dialog.newPassword')}</label>",
    expected: 'Der Zugangstext sagt, was gilt — 0.17.1'
  },
  {
    nr: '339', name: 'Die Liste bekommt ihre feste Hoehe zurueck',
    file: 'public/style.css',
    search: `.manage-list { flex: 0 1 auto; min-height: 0; max-height: 27.95rem;
  overflow-y: auto; margin: 0 -4px; padding: 0 4px; }`,
    replacement: ".manage-list { max-height: 280px; overflow-y: auto; margin: 0 -4px; padding: 0 4px; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '340', name: 'Die Liste verliert die Zeile, an der es sonst scheitert',
    file: 'public/style.css',
    search: ".log-list { flex: 0 1 auto; min-height: 0; max-height: 35rem;",
    replacement: ".log-list { flex: 0 1 auto; max-height: 35rem;",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '341', name: 'Die Kachel ist wieder keine Spalte',
    file: 'public/style.css',
    search: "padding: 18px 20px 20px;\n  display: flex; flex-direction: column; }",
    replacement: "padding: 18px 20px 20px; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '342', name: 'Der Knopf in der Kachel wird wieder ueber die volle Breite gezogen',
    file: 'public/style.css',
    search: ".sys-card > .btn { align-self: flex-start; }",
    replacement: "",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    /* MITGEGANGEN IN 0.19.1 (Stolperstein 201): der Abschnitt heisst jetzt
       „Installation", der Rueckbau setzt weiter den aeltesten Namen. */
    nr: '347', name: 'Der fuenfte Abschnitt heisst wieder „Anlage"',
    file: 'public/app.js',
    search: "  { key: 'installation', name: () => t('card.installation') }",
    replacement: "  { schluessel: 'installation', name: () => 'Anlage' }",
    expected: 'Der fuenfte Abschnitt heisst „Installation" — 0.17.1, 0.19.1 und 0.19.2'
  },
  {
    nr: '348', name: 'Die Zeitangaben stehen wieder linksbuendig',
    file: 'public/style.css',
    search: ".mrow.session .session-time { grid-column: 1 / -1; justify-self: end; text-align: right; }",
    replacement: ".mrow.sitz .session-time { grid-column: 1 / -1; }",
    expected: 'Die Zeitangaben stehen untereinander — 0.17.1'
  },
  {
    nr: '349', name: 'Der Name teilt seine Reihe wieder mit den Zeiten',
    file: 'public/style.css',
    search: ".mrow.session .mname { grid-column: 1; grid-row: 1; }",
    replacement: ".mrow.sitz .mname { grid-column: 1; grid-row: 1 / span 3; }",
    expected: 'Die Zeitangaben stehen untereinander — 0.17.1'
  },
  {
    nr: '350', name: 'Das Vollbild uebernimmt den inneren Abspieler nicht mehr',
    file: 'public/app.js',
    search: "      handover = { source, position: el.currentTime || 0, wasPlaying: !el.paused, open: true };\n" +
           "      el.pause();\n      el.removeAttribute('src');\n      el.load();",
    replacement: "      el.pause();",
    expected: 'Genau ein Abspieler laeuft — 0.17.1'
  },
  {
    nr: '351', name: 'Die uebernommene Stelle wird nicht gesetzt',
    file: 'public/app.js',
    search: "        player.currentTime = handover.position;\n",
    replacement: "",
    expected: 'Genau ein Abspieler laeuft — 0.17.1'
  },
  {
    nr: '352', name: 'Der Rueckweg beim Schliessen faellt weg',
    file: 'public/app.js',
    search: "    hold();\n    restore();\n    lightboxOpen = false;",
    replacement: "    halteAn();\n    lightboxOpen = false;",
    expected: 'Genau ein Abspieler laeuft — 0.17.1'
  },
  {
    nr: '353', name: 'Die geloeschte Quelle wandert wieder zurueck',
    file: 'public/app.js',
    search: "    if (handover && imageSource(removed, '') === handover.source) handover = null;\n",
    replacement: "",
    expected: 'Genau ein Abspieler laeuft — 0.17.1'
  },

  /* ---- 0.17.2: der Deckel, die Reihen, die Klammer und die Glocke ---- */
  {
    nr: '354', name: 'Das Raster der Sitzungszeile bekommt seine dritte Spalte zurueck',
    file: 'public/style.css',
    search: ".mrow.session { display: grid; grid-template-columns: minmax(0, 1fr) auto;",
    replacement: ".mrow.sitz { display: grid; grid-template-columns: minmax(0, 1fr) auto auto;",
    expected: 'Die Zeitangaben stehen untereinander — 0.17.1'
  },
  {
    nr: '355', name: 'Die Liste fordert wieder so viele Zeilen, wie sie hat',
    file: 'public/style.css',
    search: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: 27.95rem;",
    replacement: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: none;",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '356', name: 'Das Sicherheitsprotokoll fordert wieder alle seine Zeilen',
    file: 'public/style.css',
    search: ".log-list { flex: 0 1 auto; min-height: 0; max-height: 35rem;\n",
    replacement: ".log-list { flex: 0 1 auto; min-height: 0; max-height: none;\n",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '357', name: 'Auf dem Telefon deckelt nichts mehr am Fenster',
    file: 'public/style.css',
    search: "  .manage-list, .log-list, .test-scroll, .atext, #ex-part-list {\n" +
           "    flex: 0 1 auto; max-height: 62vh; max-height: 62dvh; }",
    replacement: "",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '363', name: 'Die Begruendung zum fehlenden Adressfeld steht wieder in der Karte',
    file: 'public/languages/de.json',
    search: "\"card.mailTimeoutHint\": \". Antwortet der Mailserver nicht, bricht der",
    replacement: "\"card.mailTimeoutHint\": \" — es gibt kein Adressfeld daneben, und zwar mit Absicht: ein Knopf, der an eine beliebige Adresse schickt, wäre ein offener Mailverteiler hinter einer Anmeldung. Antwortet der Mailserver nicht, bricht der",
    expected: 'Die Karte „Mailversand“'
  },
  {
    nr: '364', name: 'Die Klammer steht wieder auch bei einer einzigen Stimme',
    file: 'public/app.js',
    search: "          a.textContent = r.count > 1 ? `⌀ ${average} (${r.count})` : `⌀ ${average}`;",
    replacement: "          a.textContent = `⌀ ${schnitt} (${r.count})`;",
    expected: 'Die Klammer steht erst ab zwei Stimmen — 0.17.2'
  },
  {
    nr: '365', name: 'Die Glocke meldet wieder die eigenen Kommentare',
    file: 'server.js',
    search: "    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id, user_id`);",
    replacement: "    WHERE created_at > ? AND (user_id IS NOT ? OR 1) GROUP BY item_id, user_id`);",
    expected: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    nr: '366', name: 'Die Glocke meldet wieder die eigenen Bewertungen',
    file: 'server.js',
    search: "    WHERE set_at IS NOT NULL AND set_at > ? AND value > 0 AND user_id IS NOT ?",
    replacement: "    WHERE set_at IS NOT NULL AND set_at > ? AND value > 0 AND (user_id IS NOT ? OR 1)",
    expected: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    nr: '367', name: 'Die Tafel verspricht wieder die eigenen Beitraege',
    file: 'public/app.js',
    search: "    <p>${tH('list.newCommentsAnd')} <strong>${tH('list.otherUser')}</strong>${tH('list.sinceLastVisit')}</p>",
    replacement: "    <p>${tH('list.newCommentsAnd')}, <strong>von allen</strong>. Die eigenen stehen mit da.</p>",
    expected: 'Die Glocke in der Kopfzeile'
  },
  {
    nr: '368', name: 'Die README erzaehlt wieder, seit wann etwas gilt',
    file: 'README.md',
    search: "**Über der Liste steht eine Reihe von Ansichten**",
    replacement: "**Seit 0.13.0 steht über der Liste eine Reihe von Ansichten**",
    expected: 'Der Sprachwaechter'
  },

  /* ---- 0.17.3: die Kachel, der Mailversand, der Erklaerkasten, der Filter ---- */
  {
    nr: '369', name: 'Das Kachelraster streckt seine Kinder wieder nicht',
    file: 'public/style.css',
    search: "grid-auto-flow: dense; gap: 18px; margin-top: 6px; }",
    replacement: "grid-auto-flow: dense; gap: 18px; margin-top: 6px; align-items: start; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '370', name: 'Die Liste fordert wieder zwoelf Zeilen',
    file: 'public/style.css',
    search: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: 27.95rem;\n",
    replacement: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: 33.5rem;\n",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '371', name: 'Das Sicherheitsprotokoll deckelt wieder bei zehn Zeilen',
    file: 'public/style.css',
    search: ".log-list { flex: 0 1 auto; min-height: 0; max-height: 35rem;",
    replacement: ".log-list { flex: 0 1 auto; min-height: 0; max-height: 23.3rem;",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '372', name: 'Die Karte bekommt ihre Passwortzeile zurueck',
    file: 'public/app.js',
    search: "        <div class=\"kv\"><span class=\"k\">${tH('card.provider')}</span>",
    replacement: "        <div class=\"kv\"><span class=\"k\">Passwort</span><span class=\"v\">${mailstand.passwortGesetzt\n          ? 'gesetzt' : 'nicht gesetzt'}</span></div>\n        <div class=\"kv\"><span class=\"k\">${tH('card.provider')}</span>",
    expected: 'Die Karte „Mailversand“'
  },
  {
    nr: '373', name: 'Die Anbieterzeile nennt wieder nur den Namen',
    file: 'public/app.js',
    search: "  const parts = [esc(m.providerName || m.provider)];\n  if (m.server && m.port) {",
    replacement: "  const teile = [esc(m.anbieterName || m.anbieter)];\n  if (false) {",
    expected: 'Die Karte „Mailversand“'
  },
  {
    nr: '374', name: 'Der Knopf heisst wieder „Mailzugang speichern"',
    file: 'public/app.js',
    search: "id=\"mail-setup\">${tH('card.mailAccount')} ${\n            mailStatus.configured ? tH('card.change') : tH('card.setUp')}</button>",
    replacement: "id=\"mail-setup\">${tH('card.mailAccount')} speichern</button>",
    expected: 'Die Karte „Mailversand“'
  },
  {
    nr: '375', name: 'Der Anbieterhinweis wechselt nicht mehr mit der Auswahl',
    file: 'public/app.js',
    search: "      hint.textContent = v && v.hint ? v.hint : '';",
    replacement: "      hinweis.textContent = mailstand.hinweis || '';",
    expected: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '376', name: 'Die gelesene Zeile steht auch bei „Eigener Server"',
    file: 'public/app.js',
    search: "      fixedField.hidden = !v || own;",
    replacement: "      fixedField.hidden = !v;",
    expected: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '377', name: 'Der Dialog kuerzt die zweite Bestaetigung ab',
    file: 'public/app.js',
    search: "      if (!await secondConfirm('mail', null, t('card.saveMailAccount'),\n        t('card.mailServerHint') +\n        t('card.toSetPassword'))) return;\n",
    replacement: "",
    expected: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '378', name: 'Die Anbieterliste kommt wieder ohne Hinweise und feste Werte',
    file: 'server.js',
    search: "    providerList: mail.forChoice().map(a =>\n      ({ ...a, hint: a.hint ? t(localeOf(req), a.hint) : '' })),",
    replacement: "    anbieterListe: mail.PROVIDERS.map(a => ({ schluessel: a.schluessel, name: a.name })),",
    expected: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '379', name: 'Der Hinweis rueckt nicht mehr an seine Sache heran',
    file: 'public/style.css',
    search: ".mail-hint { margin: -7px 0 0; }",
    replacement: ".mail-hint { margin: 0; }",
    expected: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '380', name: 'Die Felder im Dialog tragen wieder ihren zweiten Abstand',
    file: 'public/style.css',
    search: ".mail-dialog .field { margin-bottom: 0; }",
    replacement: ".mail-dialog .field { margin-bottom: 14px; }",
    expected: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '381', name: 'Die Zeilen der Rechnung ruecken wieder auseinander',
    file: 'public/style.css',
    search: ".calc-row > span { padding: 3px 0;",
    replacement: ".rz > span { padding: 6px 0;",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '382', name: 'Der Erklaerkasten wird wieder schmal',
    file: 'public/style.css',
    search: ".calc-modal { max-width: 620px; }",
    replacement: ".calc-modal { max-width: 540px; }",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '383', name: 'Die ausgeschriebene Rechnung steht wieder unter der Tabelle',
    file: 'public/app.js',
    search: "      <p><strong>${tH('entry.criteriaNoStars')}</strong> ${tH('entry.calcRounding')}",
    replacement: "      <p><strong>${tH('entry.criteriaNoStars')}</strong> ${tH('entry.calcRounding')} ${esc(gewZahl(weg.summe))} ÷ ${esc(gewZahl(weg.teiler))}",
    expected: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '384', name: 'Der Filterruecksetzer steht immer da',
    file: 'public/app.js',
    search: "  const filtersSet = filterNumber();\n  if (filtersSet) {",
    replacement: "  const filtersSet = filterNumber();\n  if (true) {",
    expected: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },
  {
    nr: '385', name: 'Der Filterruecksetzer nennt seine Zahl nicht mehr',
    file: 'public/app.js',
    search: "    bBack.textContent = t('list.resetFilters', { filtersSet: filtersSet });",
    replacement: "    bZurueck.textContent = 'Filter zurücksetzen';",
    expected: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },
  {
    nr: '386', name: 'Der Filterruecksetzer raeumt die Sortierung mit',
    file: 'public/app.js',
    search: "      state.filters = filterNormal({ sort: state.filters.sort });",
    replacement: "      state.filters = filterNormal({});",
    expected: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },
  {
    nr: '387', name: 'Der Filterruecksetzer raeumt die Suche mit',
    file: 'public/app.js',
    search: "      redraw();\n    };\n    right5.appendChild(bBack);",
    replacement: "      const qf = document.getElementById('q'); if (qf) qf.value = '';\n" +
            "      redraw();\n    };\n    rechts5.appendChild(bZurueck);",
    expected: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },
  {
    nr: '388', name: 'Der Filterruecksetzer steht nicht mehr am rechten Rand',
    file: 'public/style.css',
    search: ".frow-right-wide { margin-left: auto; }",
    replacement: ".frow-right-wide { margin-right: 0; }",
    expected: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },

  /* ---- 0.17.4: fordern und nutzen ---- */
  {
    nr: '389', name: 'Die leere Bedienliste wird wieder eine Zeile hoch',
    file: 'public/style.css',
    search: ".manage-list > .hint { min-height: 5.59rem; padding: 0 9px; }",
    replacement: ".manage-list > .hint { min-height: 2.795rem; padding: 0 9px; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '392', name: 'Das leere Protokoll wird wieder eine Zeile hoch',
    file: 'public/style.css',
    search: ".log-list > .hint { min-height: 4.666rem; padding: 0 2px; grid-column: 1 / -1; }",
    replacement: ".log-list > .hint { min-height: 2.333rem; padding: 0 2px; grid-column: 1 / -1; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '393', name: 'Die leere Meldung traegt die Vorgabemarge wieder mit',
    file: 'public/style.css',
    search: "  display: flex; align-items: center; margin: 0; }\n.manage-list > .hint {",
    replacement: "  display: flex; align-items: center; }\n.manage-list > .hint {",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '390', name: 'Die Liste im Fenster bekommt den Deckel wieder',
    file: 'public/style.css',
    search: ".modal .manage-list { max-height: none; }",
    replacement: ".modal .manage-list { max-height: 27.95rem; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '391', name: 'Die Liste haengt wieder am Schluesselwort',
    file: 'public/style.css',
    search: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: 27.95rem;",
    replacement: ".manage-list { flex: 1 1 27.95rem; min-height: 0; max-height: max-content;",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },

  /* ---- 0.17.5: die Hoehe ohne Schluesselwort, das Raster der Liste ---- */
  {
    nr: '394', name: 'Die Spalten gehoeren wieder der Zeile',
    file: 'public/style.css',
    search: "  display: grid; grid-template-columns: 128px 1fr 1fr auto auto; align-content: start; }",
    replacement: "  grid-template-columns: 128px 1fr 1fr auto auto; align-content: start; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '395', name: 'Die Zeile wird wieder ein eigener Kasten',
    file: 'public/style.css',
    search: ".log-row { display: contents; }",
    replacement: ".log-row { display: block; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '396', name: 'Die Felder richten sich wieder an der Schriftlinie aus',
    file: 'public/style.css',
    search: "  font-size: .86rem; align-self: end; }",
    replacement: "  font-size: .86rem; align-self: baseline; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '397', name: 'Auf dem Telefon bleibt die Liste ein Raster',
    file: 'public/style.css',
    search: "  .log-list { display: block; }\n  .log-row { display: grid;",
    replacement: "  .log-row { display: grid;",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },

  /* ---- 0.18.0: die Suche wird nachvollziehbar ---- */
  {
    nr: '398', name: 'Der Trefferkontext faellt ganz aus der Antwort',
    file: 'server.js',
    search: "    if (term) it.foundAt = hits.get(it.id);",
    replacement: "    if (false) it.fundstelle = fundstellen.get(it.id);",
    expected: 'Der Trefferkontext an der Antwort'
  },
  {
    /* DIE ANDERE RICHTUNG: das Feld steht auch da, wenn gar nicht gesucht
       wurde. Ohne diesen Rueckbau belegte die Gruppe nur, DASS es bei einer
       Suche dasteht -- und nicht, dass es sonst fehlt.
       ER GREIFT AN DER KLEMME UND NICHT AN DER ABBILDUNG -- 0.18.0. Der erste
       Anlauf fuellte die Abbildung auch ohne Begriff (`volltextTreffer(begriff
       || 'e')`) und blieb STUMM: die Klemme sitzt eine Zeile tiefer, am
       `if (begriff)` vor dem Feld, und die Antwort aenderte sich dadurch
       ueberhaupt nicht. Ein Rueckbau muss die Stelle treffen, die die Zusage
       traegt, nicht eine daneben. */
    nr: '399', name: 'Der Trefferkontext steht auch ohne Suche in der Antwort',
    file: 'server.js',
    search: "    if (term) it.foundAt = hits.get(it.id);",
    replacement: "    it.fundstelle = fundstellen.get(it.id) || null;",
    expected: 'Der Trefferkontext an der Antwort'
  },
  {
    nr: '400', name: 'Der Ausschnitt wird vorn geschnitten statt an der Fundstelle',
    file: 'server.js',
    search: "const SNIPPET_LEAD = 4;",
    replacement: "const SNIPPET_LEAD = 1000;",
    expected: 'Der Trefferkontext an der Antwort'
  },
  {
    /* UND DIE GEGENRICHTUNG: der Ausschnitt beginnt GENAU bei der Fundstelle
       und verschweigt damit, dass sie mitten in einem Wort steht -- der
       Befund, wegen dem es diese Runde ueberhaupt gibt. */
    nr: '401', name: 'Der Ausschnitt beginnt genau bei der Fundstelle',
    file: 'server.js',
    search: "const SNIPPET_LEAD = 4;",
    replacement: "const SNIPPET_LEAD = 0;",
    expected: 'Der Trefferkontext an der Antwort'
  },
  {
    nr: '402', name: 'Der Ausschnitt wird nicht mehr eingeebnet',
    file: 'server.js',
    search: "const oneLine = (s) => String(s ?? '').replace(/\\s+/g, ' ').trim();",
    replacement: "const oneLine = (s) => String(s ?? '');",
    expected: 'Der Trefferkontext an der Antwort'
  },
  {
    nr: '403', name: 'Der Ausschnitt wird gar nicht mehr gekuerzt',
    file: 'server.js',
    search: "const SNIPPET_LENGTH = 56;",
    replacement: "const SNIPPET_LENGTH = 100000;",
    expected: 'Der Trefferkontext an der Antwort'
  },
  {
    nr: '404', name: 'Die Zahl der weiteren Stellen ist immer null',
    file: 'server.js',
    search: "    others: hit.length - 1",
    replacement: "    weitere: 0",
    expected: 'Der Trefferkontext an der Antwort'
  },
  {
    /* DIE FESTE FOLGE KEHRT SICH UM: genannt wird der Titel zuerst -- also
       genau das, was die Kachel ohnehin zeigt. */
    nr: '405', name: 'Die Folge der Quellen kehrt sich um',
    file: 'server.js',
    search: "  const hit = FULLTEXT_SOURCES.filter(q => r['f_' + q.key] != null);",
    replacement: "  const getroffen = [...FULLTEXT_SOURCES].reverse().filter(q => r['f_' + q.schluessel] != null);",
    expected: 'Der Trefferkontext an der Antwort'
  },
  {
    /* WELCHER KOMMENTAR GENANNT WIRD, IST BESTIMMT. Der Rueckbau dreht die
       Ordnung um statt sie zu entfernen: ohne ORDER BY entschiede die
       Abfrageplanung, und der Rueckbau koennte zufaellig dasselbe liefern --
       ein Rueckbau, der nur manchmal greift, ist keiner. */
    nr: '406', name: 'Der genannte Kommentar ist der juengste statt der aeltesten',
    file: 'server.js',
    search: "             ORDER BY k.id LIMIT 1)",
    replacement: "             ORDER BY k.id DESC LIMIT 1)",
    expected: 'Der Trefferkontext an der Antwort'
  },
  {
    /* ER NIMMT DAS FELD WEG UND NICHT NUR DIE VORLAGE. Der erste Anlauf setzte
       `fundZeile` auf leer und liess `f` stehen -- die Kachel suchte danach
       eine `.find-text`, die es nicht mehr gab, und riss beim Zeichnen ab
       statt rot zu werden. EIN RUECKBAU MUSS EINEN LAUFFAEHIGEN STAND
       ERGEBEN; einer, der die Oberflaeche zerreisst, sagt nichts darueber,
       welche Pruefung ihn bemerkt haette (Stolperstein 138). */
    nr: '407', name: 'Die Kachel baut keine Trefferzeile mehr',
    file: 'public/app.js',
    search: "  const f = it.foundAt;",
    replacement: "  const f = null;",
    expected: 'Die Trefferzeile an der Kachel'
  },
  {
    /* SIE WANDERT UND VERSCHWINDET NICHT. Ein Rueckbau, der sie ganz wegnimmt,
       waere derselbe wie 407 -- und er liesse den Lauf ABREISSEN statt rot zu
       werden, weil die Prueflagen danach an einer fehlenden Zeile griffen
       (Stolperstein 138). So bleibt die Zeile da und steht nur an der
       falschen Stelle. */
    nr: '408', name: 'Die Trefferzeile rutscht ueber den Titel',
    file: 'public/app.js',
    search: "      <h3 class=\"card-title\">${esc(it.title)}</h3>\n      ${findingRow}",
    replacement: "      ${findingRow}\n      <h3 class=\"card-title\">${esc(it.title)}</h3>",
    expected: 'Die Trefferzeile an der Kachel'
  },
  {
    nr: '409', name: 'Die Zahl der weiteren Stellen faellt aus der Zeile',
    file: 'public/app.js',
    search: "class=\"find-text\"></span>${f.others ? `<span class=\"find-more\">+${f.others}</span>` : ''}",
    replacement: "class=\"find-text\"></span>${''}",
    expected: 'Die Trefferzeile an der Kachel'
  },
  {
    nr: '410', name: 'Der Ueberfahrtext nennt die weiteren Stellen nicht mehr',
    file: 'public/app.js',
    search: "  f.others > 0 ? t('list.moreHits', { n: f.others }) : '');",
    replacement: "  '');",
    expected: 'Die Trefferzeile an der Kachel'
  },
  {
    nr: '411', name: 'Eine unbekannte Quelle faellt aus der Zeile',
    file: 'public/app.js',
    search: "const findingWord = (source) => (FINDING_WORDS[source] || (() => t('list.hitPlace')))();",
    replacement: "const findingWord = (quelle) => (FINDING_WORDS[quelle] || (() => ''))();",
    expected: 'Die Trefferzeile an der Kachel'
  },
  {
    /* DER AUSSCHNITT KOMMT WIEDER UEBER innerHTML IN DIE SEITE -- genau der
       Weg, den 0.5.4 zugemacht hat, auf dem Umweg ueber die Kachel. Er kann
       aus einem Kommentar stammen. */
    nr: '412', name: 'Der Ausschnitt kommt ueber innerHTML in die Kachel',
    file: 'public/app.js',
    search: "  if (f) a.querySelector('.find-text').replaceChildren(raiseHighlight(f.text, term));",
    replacement: "  if (f) a.querySelector('.find-text').innerHTML = f.text;",
    expected: 'Die Trefferzeile an der Kachel'
  },
  {
    /* UND DIE MARKE SELBST. Sie ist die einzige Stelle, an der aus einem
       Stueck ein ELEMENT wird -- wenn irgendwo Markup entstehen kann, dann
       hier. */
    nr: '413', name: 'Die Marke wird ueber innerHTML gefuellt',
    file: 'public/app.js',
    search: "  const m = document.createElement('mark');\n  m.textContent = text;",
    replacement: "  const m = document.createElement('mark');\n  m.innerHTML = text;",
    expected: 'Links im Kommentartext'
  },
  {
    nr: '414', name: 'Der Titel der Kachel wird nicht mehr hervorgehoben',
    file: 'public/app.js',
    search: "  highlightInNode(a.querySelector('.card-title'), it.title, term);",
    replacement: "  hebeImKnoten(a.querySelector('.card-title'), it.title, '');",
    expected: 'Die Hervorhebung in der Uebersicht'
  },
  {
    nr: '415', name: 'Nur die erste Fundstelle wird hervorgehoben',
    file: 'public/app.js',
    search: "    from = i + b.length;\n  }",
    replacement: "    von = i + b.length;\n    break;\n  }",
    expected: 'Die Hervorhebung in der Uebersicht'
  },
  {
    /* DER BEGRIFF ALS MUSTER STATT ALS TEXT -- derselbe Fehler wie LIKE gegen
       instr() im Server, nur im Browser: ein eingegebener Punkt faende jedes
       Zeichen. */
    nr: '416', name: 'Der Begriff wird als Muster gelesen',
    file: 'public/app.js',
    search: "    const i = lower.indexOf(lowerB, from);",
    replacement: "    const i = klein.slice(von).search(new RegExp(kleinB, 'i')) < 0 ? -1 : von + klein.slice(von).search(new RegExp(kleinB, 'i'));",
    expected: 'Die Hervorhebung in der Uebersicht'
  },
  {
    nr: '417', name: 'Die Hervorhebung erreicht den Kommentartext nicht mehr',
    file: 'public/app.js',
    search: "        .appendChild(buildCommentNodes(splitCommentText(c.text, term)));",
    replacement: "        .appendChild(baueKommentarknoten(zerlegeKommentartext(c.text)));",
    expected: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '418', name: 'Eine Adresse mit Begriff zerfaellt in mehrere Anker',
    file: 'public/app.js',
    search: "      let j = i;\n      while (j < list.length && String(list[j].target ?? '') === String(s.target))\n        a.appendChild(pieceNode(list[j++]));\n      i = j - 1;",
    replacement: "      a.appendChild(stueckKnoten(s));",
    expected: 'Links im Kommentartext'
  },
  {
    nr: '419', name: 'In der Linkliste wird der Anzeigename hervorgehoben',
    file: 'public/app.js',
    search: "          nameBox.appendChild(s);",
    replacement: "          hebeImKnoten(s, a.name, begriff);\n          nameBox.appendChild(s);",
    expected: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '420', name: 'Die Adresse in der Linkliste wird nicht mehr hervorgehoben',
    file: 'public/app.js',
    search: "      highlightInNode(row.querySelector('.dom'), top, term);",
    replacement: "      hebeImKnoten(row.querySelector('.dom'), top, '');",
    expected: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '421', name: 'Das Adressmuster nimmt keinen Begriff mehr an',
    file: 'public/app.js',
    search: "const ENTRY_PATTERN = /^#\\/item\\/(\\d+)(?:\\?(.*))?$/;",
    replacement: "const ENTRY_PATTERN = /^#\\/item\\/(\\d+)$/;",
    expected: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '422', name: 'Das Adressmuster ist hinten nicht mehr verankert',
    file: 'public/app.js',
    search: "const ENTRY_PATTERN = /^#\\/item\\/(\\d+)(?:\\?(.*))?$/;",
    replacement: "const ENTRY_PATTERN = /^#\\/item\\/(\\d+)/;",
    expected: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '423', name: 'Die Detailansicht zieht die Adresse nicht mehr nach',
    file: 'public/app.js',
    search: "  if (location.hash !== wanted &&\n      typeof history !== 'undefined' && typeof history.replaceState === 'function')\n    history.replaceState(null, '', wanted);",
    replacement: "  void gewollt;",
    expected: 'Der Suchbegriff in der Adresse'
  },
  {
    /* DIE ADRESSE WIRD UEBER location.hash GESETZT STATT UEBER replaceState.
       Sie steht dann zwar richtig da, aber jeder Aufruf legt einen Eintrag im
       Verlauf an und loest ein zweites Zeichnen aus. */
    nr: '424', name: 'Die Adresse wird ueber location.hash gesetzt',
    file: 'public/app.js',
    search: "    history.replaceState(null, '', wanted);",
    replacement: "    location.hash = gewollt;",
    expected: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '425', name: 'Die Kachel haengt den Begriff nicht an ihre Adresse',
    file: 'public/app.js',
    search: "  a.href = entryAddress(it.id, term);",
    replacement: "  a.href = entryAddress(it.id, '');",
    expected: 'Die Trefferzeile an der Kachel'
  },
  {
    nr: '426', name: 'Der Begriff aus der Adresse wird nicht entschluesselt',
    file: 'public/app.js',
    search: "  try { return new URLSearchParams(askKey || '').get('q') || ''; }",
    replacement: "  try { return (String(frage || '').match(/(?:^|&)q=([^&]*)/) || [])[1] || ''; }",
    expected: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '427', name: 'Die Marke bringt wieder Schwarz auf Gelb mit',
    file: 'public/style.css',
    search: "mark {\n  background: var(--accent-dim); color: var(--accent-text-hi);",
    replacement: "mark {\n  border-radius: 3px;",
    expected: 'Die Trefferzeile im Stylesheet'
  },
  {
    nr: '428', name: 'Die Trefferzeile darf wieder umbrechen',
    file: 'public/style.css',
    search: "  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n}\n/* Die Zahl in der Schreibmaschinenschrift",
    replacement: "}\n/* Die Zahl in der Schreibmaschinenschrift",
    expected: 'Die Trefferzeile im Stylesheet'
  },
  {
    nr: '429', name: 'Die Quelle gibt in der Trefferzeile nach statt der Ausschnitt',
    file: 'public/style.css',
    search: ".card-find .find-source { flex-shrink: 0; color: var(--faint); font-weight: 600; }",
    replacement: ".card-find .find-source { color: var(--faint); font-weight: 600; }",
    expected: 'Die Trefferzeile im Stylesheet'
  },

  /* ---- 0.18.1: der Deckel der Sitzungsliste, die leere Message ---- */
  {
    /* SEIT 0.26.0 STEHT DORT 48.37rem UND NICHT MEHR 55.23rem: die Fusszeile
       ist aus der rollenden Liste heraus (Befund 2), und der Deckel rechnet
       sie nicht mehr mit. Der Rueckbau geht mit (Stolperstein 201) und zielt
       auf die neue Zahl.
       UND DER ERSATZ HEISST WIEDER RICHTIG: er trug bis hierher `#msitzungen`,
       den deutschen Bezeichner von vor 0.24.1. Er wirkte trotzdem -- eine
       Regel auf einen Namen, den es nicht gibt, nimmt der Liste ihren Deckel
       genauso --, aber er wirkte aus dem falschen Grund. */
    nr: '430', name: 'Die Sitzungsliste deckelt wieder nach der fremden Zeile',
    file: 'public/style.css',
    search: "#msessions { max-height: 48.37rem; }",
    replacement: "#msessions-ohne-deckel { max-height: 27.95rem; }",
    expected: 'So hoch wie der Inhalt — 0.17.5'
  },

  /* ---- 0.19.0: die Bildablage ----
     ELF RUECKBAUTEN AN DER ABLAGE, und sie zielen auf verschiedene Haelften
     derselben Zusage: dass ein PNG umgewandelt wird, dass es NUR ein PNG ist,
     dass die Spalte mitgeht, dass der Rueckfall greift und dass das Bild dabei
     unversehrt bleibt. Ein Rueckbau, der alles zugleich abschaltet, sagte nur,
     dass irgendetwas fehlt.

     SECHS DAVON ZEIGEN SEIT 0.19.3 AUF images.js -- 431 bis 435 und 458. Die
     Umwandlung steht nicht mehr in server.js, weil der Bestandslauf sie aus
     einem eigenen Thread braucht; die Rueckbauten sind MITGEGANGEN und nicht
     geloescht worden (Stolperstein 201). Es ist derselbe Fund an derselben
     Zeile, nur in einer anderen Datei -- und ein Rueckbau, der ins Leere
     greift, ist stumm und verfaelscht die Tabelle (Stolperstein 192). */
  {
    nr: '431', name: 'Ein ankommendes PNG wird gar nicht mehr umgewandelt',
    file: 'images.js',
    search: "  if (!recipe || !isPng(buf)) return { data: buf, mime: reportedType, converted: false };",
    replacement: "  if (true) return { data: buf, mime: reportedType, umgewandelt: false };",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Die Spalte bleibt auf image/png stehen, obwohl WebP daruntersteht. Die
       AUSLIEFERUNG faellt darauf nicht herein -- sie liest die ersten Bytes --,
       aber der naechste Export traegt die Luege weiter. Genau deshalb muss die
       Pruefung an der SPALTE haengen und nicht nur am Kopf der Antwort. */
    nr: '432', name: 'Der mime_type wird nicht mitgezogen',
    file: 'images.js',
    search: "      return { data: webp, mime: 'image/webp', converted: true };",
    replacement: "      return { data: webp, mime: reportedType, umgewandelt: true };",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER GROESSENVERGLEICH FAELLT WEG: auch ein groesseres Ergebnis wird
       genommen. ER IST ALS STUMM ERWARTET.

       DIE BEGRUENDUNG IST IN 0.19.1 BERICHTIGT WORDEN, und das gehoert
       hierher und nicht in eine Fussnote. Bis dahin stand hier, der Fall
       komme am echten Bestand vor und lasse sich nur mit erzeugtem Material
       nicht herstellen. DER ERSTE HALBSATZ IST WIDERLEGT -- er stammte aus dem
       Auftrag zu 0.19.0 und aus keiner Messung; der Wortlaut steht im
       Aenderungsprotokoll dieser Runde.

       GEMESSEN AM ECHTEN BESTAND: 679 von 679 PNG umgestellt, KEINES
       geblieben; in `bildFormate` stand danach kein `png` mehr. Dazu achtzehn
       Laborversuche (neun in 0.19.0, neun danach: Palette mit 8 und mit 256
       Farben, reiner Text, Graustufen, mit und ohne Alpha, 1x1, Flaechen) --
       PNG gewinnt nie ueber die Groesse, und schon das kleinste moegliche PNG
       ist groesser als das kleinste moegliche WebP.

       DER EINZIGE FALL, IN DEM PNG LIEGEN BLEIBT, ist der, in dem WebP NICHT
       KANN -- ueber 16383 Bildpunkte je Kante. Der ist als Rueckbau 458
       gebaut und geprueft und macht Pruefungen rot.

       ER BLEIBT TROTZDEM IN DER LISTE: verschwindet die Zeile aus dem
       Quelltext, greift sein Suchtext ins Leere, und GENAU DAS meldet der
       Pruefstand ("Jeder Suchtext kommt in seiner Datei genau einmal vor").
       Der Rueckbau bewacht damit das Vorhandensein der Regel, auch wo er ihre
       Wirkung nicht zeigen kann. */
    nr: '433', name: 'Auch ein groesseres Ergebnis wird genommen',
    file: 'images.js',
    search: "    if (webp.length < buf.length)",
    replacement: "    if (true)",
    expected: '(erwartet STUMM — achtzehn Laborversuche ohne Gegenbeispiel, und am echten Bestand 679 von 679 umgestellt; nur die Kantengrenze laesst PNG liegen, und die ist Rueckbau 458)'
  },
  {
    /* DER ANDERE RUECKFALL, und der laesst sich zeigen: WebP kann hoechstens
       16383 px je Kante. Faengt niemand den Fehler ab, scheitert der ganze
       Upload mit 500, statt das PNG unveraendert abzulegen. */
    nr: '458', name: 'Ein Bild, das WebP nicht fassen kann, reisst den Upload ab',
    file: 'images.js',
    search: "    console.error('[Kriterion] PNG blieb PNG:', e.message);",
    replacement: "    throw e;",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Die Erkennung geht ueber den GEMELDETEN TYP statt ueber die ersten acht
       Bytes. Sie sieht damit richtig aus und glaubt dem Browser aufs Wort --
       ein JPEG, das sich image/png nennt, ginge durch den Kodierer. */
    nr: '434', name: 'Die Erkennung glaubt dem gemeldeten Typ',
    file: 'images.js',
    search: "  Buffer.isBuffer(buf) && buf.length >= 8 && buf.subarray(0, 8).equals(PNG_MAGIC);",
    replacement: "  Buffer.isBuffer(buf) && buf.length >= 8;",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Der verlustbehaftete Bitstrom statt VP8L. Die Datei ist danach kleiner
       und heisst weiterhin WebP -- nur franst sie an harten Kanten aus. Ohne
       eine Pruefung, die PIXEL vergleicht, bliebe dieser Rueckbau stumm. */
    nr: '435', name: 'Der verlustbehaftete Kodierer statt nearLossless',
    file: 'images.js',
    search: "  'webp-lossless': { nearLossless: true, quality: 60, effort: 4 },",
    replacement: "  'webp-lossless': { quality: 60, effort: 4 },",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    nr: '436', name: 'Der Schalter wirkt nicht mehr -- es wird immer umgewandelt',
    file: 'server.js',
    search: "  const v = getSetting('imageStore', IMAGE_STORE_DEFAULT);",
    replacement: "  const v = IMAGE_STORE_DEFAULT;",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Der Schalter faellt aus der Eigentuemerliste und wird damit gewoehnliche
       Adminsache. Er bestimmt, wie die ganze Instanz ablegt.
       DER SUCHTEXT IST MIT 0.20.0 MITGEGANGEN, nicht geloescht (Stolperstein
       201): die Liste traegt seit jener Runde vier Schluessel statt einem, und
       seit 0.26.0 sieben -- `potentialMode` ist dazugekommen (F3). Der
       Rueckbau geht wieder mit und nimmt weiterhin GENAU `convertImages`
       heraus; alles Uebrige bleibt stehen, sonst pruefte er nicht mehr
       dasselbe. */
    nr: '437', name: 'Der Schalter der Bildablage ist nur noch Adminsache',
    file: 'server.js',
    search: "const OWNER_KEYS = ['imageStore',\n" +
           "                                'backupCleanup', 'backupKeep', 'backupDays',\n" +
           "                                'languageDefault', 'languageOn', 'potentialMode'];",
    replacement: "const OWNER_KEYS = ['backupCleanup', 'backupKeep', 'backupDays',\n" +
           "                                'languageDefault', 'languageOn', 'potentialMode'];",
    expected: 'Die Bildablage: die Rechte'
  },
  {
    nr: '438', name: 'Die Umstellung laeuft ohne zweite Bestaetigung',
    file: 'server.js',
    search: "app.post('/api/images/convert', ownerOnly, secondConfirmNeeded('images'), (req, res) => {",
    replacement: "app.post('/api/images/convert', ownerOnly, (req, res) => {",
    expected: 'Die Bildablage: die Rechte'
  },
  {
    nr: '439', name: 'Zweimal druecken startet zwei Laeufe',
    file: 'server.js',
    search: "  if (batchStates.conversion && batchStates.conversion.running)\n    return res.status(409).json({ error: t(localeOf(req), 'server.convertRunning')});",
    replacement: "  if (false)\n    return res.status(409).json({ error: t(localeOf(req), 'server.convertRunning')});",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Der Fortschritt verschwindet aus den Kennzahlen. Die Karte kann danach
       nicht mehr sagen, wie weit der Lauf ist -- und die Pruefung, die auf
       sein Ende wartet, laeuft in ihre Grenze. */
    nr: '440', name: 'Der Fortschritt steht nicht mehr in den Kennzahlen',
    file: 'server.js',
    search: "const batchState = (task) =>\n  batchStates[task] && { ...batchStates[task] };",
    replacement: "const batchState = () => null;",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Die Aufteilung nach Format faellt aus der Antwort. Die alten Zahlen
       bleiben stehen -- der Rueckbau nimmt genau den Nachbarn weg, nicht die
       Zeile daneben. */
    nr: '441', name: 'Die Aufstellung nach Format faellt aus den Kennzahlen',
    file: 'server.js',
    search: "    imageFormats,\n",
    replacement: "",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },

  /* ---- 0.19.0: der engere Ausschnitt ---- */
  {
    nr: '442', name: 'Der Zoomwert wird gar nicht erst gespeichert',
    file: 'server.js',
    search: "  db.prepare('UPDATE photos SET focus_x = ?, focus_y = ?, zoom = ? WHERE id = ?')\n    .run(x, y, z, req.params.id);",
    replacement: "  db.prepare('UPDATE photos SET focus_x = ?, focus_y = ? WHERE id = ?')\n    .run(x, y, req.params.id);",
    expected: 'Fokuspunkt der Vorschau'
  },
  {
    /* DIE SPANNE FAELLT WEG. Ein Wert unter 100 zeigte am Rand Leere statt
       Bild, einer ueber 400 die Ableitung statt des Motivs. */
    nr: '443', name: 'Der Zoomwert wird nicht mehr beschnitten',
    file: 'server.js',
    search: "  zoom:    { min: ZOOM_MIN, max: ZOOM_MAX, fallback: ZOOM_MIN, digits: 0 }",
    replacement: "  zoom:    { min: 0, max: 100000, vorgabe: ZOOM_MIN, stellen: 0 }",
    expected: 'Fokuspunkt der Vorschau'
  },
  {
    /* EIN FEHLENDES FELD SETZT ZURUECK. Das Ziehen im Bild schickt kein
       `zoom` mit -- der eingestellte Ausschnitt waere bei jedem Zug weg
       (Stolperstein 271). */
    nr: '444', name: 'Ein Ruf ohne Zoomwert setzt ihn auf die Vorgabe zurueck',
    file: 'server.js',
    search: "  let z = p.zoom;\n  if (req.body.zoom !== undefined) {",
    replacement: "  let z = ANZEIGEWERTE.zoom.vorgabe;\n  if (req.body.zoom !== undefined) {",
    expected: 'Fokuspunkt der Vorschau'
  },
  {
    nr: '445', name: 'Der Ausschnitt geht nicht in die Exportdatei',
    file: 'server.js',
    search: "        const z = { mime_type: p.mime_type, focus_x: p.focus_x, focus_y: p.focus_y,\n                    zoom: p.zoom, kind: p.kind };",
    replacement: "        const z = { mime_type: p.mime_type, focus_x: p.focus_x, focus_y: p.focus_y,\n                    art: p.art };",
    expected: 'Fokuspunkt der Vorschau'
  },
  {
    nr: '446', name: 'Der eingespielte Ausschnitt wird verworfen',
    file: 'server.js',
    search: "                    fx: crop.fx, fy: crop.fy, zoom: crop.zoom,",
    replacement: "                    fx: 50, fy: 50, zoom: ANZEIGEWERTE.zoom.vorgabe,",
    expected: 'Fokuspunkt der Vorschau'
  },
  {
    /* DIE MIGRATION LEGT DIE SPALTE NICHT AN. Eine Instanz aus 0.18.1 stuerbe
       danach an jedem Zugriff auf photos.zoom -- die DDL greift nur bei einer
       fehlenden TABELLE, nie bei einer fehlenden SPALTE (Stolperstein 13). */
    nr: '447', name: 'Der achte Migrationsblock ruestet die Spalte nicht nach',
    file: 'db.js',
    search: "  db.exec('ALTER TABLE photos ADD COLUMN zoom REAL NOT NULL DEFAULT 100');",
    replacement: "  // db.exec('ALTER TABLE photos ADD COLUMN zoom REAL NOT NULL DEFAULT 100');",
    expected: 'MIGRATION 0.19.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* MITGEGANGEN MIT 0.21.0, wie 233 -- derselbe Suchtext, eine andere
       Zusage: dort die Entscheidung, hier die Exportdatei. */
    nr: '448', name: 'Die Formatnummer bleibt bei 15, obwohl das Faelligkeitsdatum mitgeht',
    file: 'server.js',
    search: "const EXCHANGE_FORMAT = 16;",
    replacement: "const EXCHANGE_FORMAT = 15;",
    expected: 'Die Exportdatei'
  },

  /* ---- 0.19.0: die Bildablage in der Oberflaeche ---- */
  {
    /* DER ZOOM GEHT NICHT MEHR AN DIE KACHEL. crop() rechnet ihn
       weiterhin richtig aus und schreibt ihn nirgends hin -- genau der Fall,
       den eine Pruefung an der Funktion allein nicht faende. */
    nr: '449', name: 'Der Zoom kommt nicht in den Zuschnitt (bis 0.19.4: nicht an die Kachel)',
    file: 'batchrun.js',
    /* MITGEGANGEN MIT 0.19.5, NICHT GELOESCHT (Stolperstein 201). Bis dahin
       nahm dieser Rueckbau der Kachel ihr `--zoom` -- die Eigenschaft gibt es
       nicht mehr, der Zuschnitt steckt im Bild. Die Zusage ist dieselbe
       geblieben: der eingestellte Zoom muss ankommen. */
    search: "                               zoom: Number(z.zoom) });",
    replacement: "                               zoom: 100 });",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    nr: '450', name: 'Der Schieber fuer die Weite steht nicht mehr im Betrachter',
    file: 'public/app.js',
    search: "      ${cropMode && !showsVideo ? `<div class=\"vzoom\">",
    replacement: "      ${false ? `<div class=\"vzoom\">",
    expected: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* JEDER ZWISCHENSCHRITT SCHICKT. Ein Zug ueber die ganze Leiter erzeugte
       damit sechzig Anfragen statt einer. */
    nr: '451', name: 'Der Schieber schickt bei jedem Zwischenschritt',
    file: 'public/app.js',
    search: "        draw();\n      };\n      slider.onchange = save;",
    replacement: "        zeichne();\n        speichere();\n      };\n      schieber.onchange = speichere;",
    expected: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* DER GRIFF AN DEN SCHIEBER SETZT DEN FOKUSPUNKT. Er laege danach dort,
       wo der Schieber steht -- unten in der Mitte, bei jedem Zug aufs Neue. */
    nr: '452', name: 'Der Griff an den Schieber setzt den Fokuspunkt mit',
    file: 'public/app.js',
    search: "      if (e.target.closest('.vfocus, .vnav, .vzoom')) return;",
    replacement: "      if (e.target.closest('.vfocus, .vnav')) return;",
    expected: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* DAS STILBLATT RECHNET DEN ZOOM NICHT MEHR EIN. Der Wert steht an der
       Kachel, und niemand liest ihn (Stolperstein 272, andersherum). */
    nr: '453', name: 'Die Ueberfahrregel haengt wieder am Ausschnitt',
    file: 'public/style.css',
    /* MITGEGANGEN MIT 0.19.5 (Stolperstein 201). Bis dahin nahm er dem
       Stilblatt sein `scale(var(--zoom))`; das gibt es nicht mehr. Er holt es
       jetzt ZURUECK -- und damit den zweiten Zuschnitt, den diese Runde
       gerade weggeraeumt hat. */
    search: ".card:hover .card-img img { transform: scale(1.02); }",
    replacement: ".card:hover .card-img img { transform: scale(calc(var(--zoom, 1) * 1.02)); }",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    nr: '454', name: 'Der Knopf der Umstellung fragt kein Passwort',
    file: 'public/app.js',
    search: "      const ok = await secondConfirm('images', null, t('card.catchUpStore'),",
    replacement: "      const ok = true || await secondConfirm('images', null, t('card.catchUpStore'),",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DER DIALOG BESCHOENIGT. Er nennt die Zahl nicht mehr und sagt nicht
       mehr, dass die PNG-Fassung danach weg ist. */
    nr: '455', name: 'Der Dialog sagt nicht mehr, was verloren geht',
    file: 'public/app.js',
    search: "        both ? t('card.catchUpAsk', { n: png.count, bytes: fmtBytes(png.bytes),",
    replacement: "        both ? `${png.count} PNG-Fotos werden umgestellt.` || t('card.catchUpAsk', { n: png.count, bytes: fmtBytes(png.bytes),",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    nr: '456', name: 'Der Knopf bleibt bedienbar, obwohl kein PNG mehr dasteht',
    file: 'public/app.js',
    search: "id=\"convert-run\"${running ? ' disabled' : ''}",
    replacement: "id=\"convert-run\"${''}",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DER SCHALTER STEHT AUCH DEM ADMIN OHNE EIGENTUEMERROLLE. Der Server
       weist ihn ab -- ein Haken, der zuverlaessig 403 erzeugt, sieht aus wie
       ein Fehler. */
    nr: '457', name: 'Schalter und Knopf stehen jedem Admin',
    file: 'public/app.js',
    search: "        ${OWNER ? `\n        ${/* ---- DIE WAHL, UND SIE IST EIN KNOPF „Standard\" JE ZEILE ----",
    replacement: "        ${true ? `\n        ${/* ---- DIE WAHL, UND SIE IST EIN KNOPF „Standard\" JE ZEILE ----",
    expected: 'Die Bildablage in der Oberflaeche'
  },

  /* ---- 0.19.1: was 0.19.0 falsch gemacht hat ----
     ZEHN PUNKTE, ZEHN RUECKBAUTEN UND MEHR. Nummer 459 steht weiter oben bei
     der Tafel der alten Adressen, wo sie hingehoert. */
  {
    /* MITGEGANGEN IN 0.19.2 (Stolperstein 201): die Formatabfrage traegt jetzt
       `WHERE kind IS ?` statt `art != 'video'`. Derselbe Fund, ein anderer
       Wortlaut.
       DIE AUFTEILUNG NACH FORMAT LIEST WIEDER DEN INHALT -- die Abfrage aus
       0.19.0. Sie ist nicht falsch, sie ist teuer: gemessen 919 ms gegen
       0,2 ms, und sie laeuft bei JEDEM Zeichnen des Systembereichs. Rot wird
       die Zeile, die eine falsch benannte Datei zaehlt: ein JPEG unter dem
       Namen `image/png` faellt am Inhalt in die JPEG-Spalte und an der Spalte
       in die PNG-Spalte. */
    nr: '460', name: 'Die Aufteilung nach Format liest wieder den Inhalt',
    file: 'server.js',
    search: "    SELECT mime_type AS m, length(data) AS o FROM photos WHERE kind IS ?)",
    replacement: "    SELECT CASE\n" +
            "             WHEN hex(substr(data,1,8)) = '89504E470D0A1A0A' THEN 'image/png'\n" +
            "             WHEN hex(substr(data,1,3)) = 'FFD8FF'           THEN 'image/jpeg'\n" +
            "             WHEN hex(substr(data,1,4)) = '52494646'\n" +
            "              AND hex(substr(data,9,4)) = '57454250'         THEN 'image/webp'\n" +
            "             WHEN hex(substr(data,1,3)) = '474946'           THEN 'image/gif'\n" +
            "             ELSE 'other'\n" +
            "           END AS m, length(data) AS o FROM photos WHERE kind IS ?)",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* MITGEGANGEN IN 0.19.2 (Stolperstein 201): die art-Aufteilung ist keine
       materialisierte Zwischenabfrage mehr, sondern eine Schleife ueber die
       Arten -- weil `MATERIALIZED` die zweite Ursache gar nicht traf.
       DIE ARTEN KOMMEN WIEDER AUS DEM SATZ STATT AUS DEM INDEX. Das Ergebnis
       bleibt richtig und kostet 1338,8 statt 0,1 ms; genau deshalb haengt die
       Zusage am TEXT und nicht am Ergebnis. */
    nr: '461', name: 'Die Arten kommen wieder aus dem Satz statt aus dem Index',
    file: 'server.js',
    search: "const qImageKinds = db.prepare('SELECT kind AS a FROM photos GROUP BY 1');",
    replacement: "const qImageKinds = db.prepare('SELECT DISTINCT kind || \\'\\' AS a FROM photos');",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER KNOPF SUCHT AM GEMELDETEN TYP statt an den ersten acht Bytes. Er
       naehme damit genau die Zeilen mit, die die Karte sich verzaehlt -- und
       schriebe eine Datei um, die gar kein PNG ist. */
    nr: '462', name: 'Der Knopf sucht am gemeldeten Typ statt am Inhalt',
    file: 'server.js',
    search: "  \"SELECT id FROM photos WHERE kind != 'video'\");",
    replacement: "  \"SELECT id FROM photos WHERE kind != 'video' AND mime_type = 'image/png'\");",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DIE ZUORDNUNG KENNT KEIN FORMAT MEHR -- jede Zeile faellt in 'other'.
       Ohne diese Tafel stuende die Aufstellung leer da. */
    nr: '463', name: 'Die Zuordnung von mime_type auf den Schluessel ist leer',
    file: 'server.js',
    search: "const IMAGE_MIME_FORMAT = {\n  'image/png': 'png', 'image/jpeg': 'jpeg', 'image/webp': 'webp', 'image/gif': 'gif'\n};",
    replacement: "const IMAGE_MIME_FORMAT = {};",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER VERGROESSERUNGSPUNKT FAELLT WEG. scale() verankert wieder in der
       Mitte, und von der eingestellten Bildecke ist nichts zu sehen --
       gemessen 0,0 % in allen vier Richtungen. */
    nr: '464', name: 'Der Zuschnitt verliert eine seiner beiden Achsen (bis 0.19.4: transform-origin)',
    file: 'images.js',
    /* MITGEGANGEN MIT 0.19.5 (Stolperstein 201). `transform-origin` gibt es
       nicht mehr; die Zusage dahinter -- der Ausschnitt folgt dem Fokuspunkt
       in BEIDEN Richtungen -- gilt unveraendert und steht jetzt hier. */
    search: "  return { links: fx / 100 * (width - tight), top: fy / 100 * (height - tight), edge: tight };",
    replacement: "  return { links: fx / 100 * (breite - eng), top: 0, kante: eng };",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* ER STEHT DA, ABER AUF DER MITTE. Der gefaehrlichere der beiden: die
       Eigenschaft ist vorhanden, und wer nur nachsieht, OB sie dasteht, findet
       nichts. */
    nr: '465', name: 'Der Zuschnitt sitzt in der Mitte statt auf dem Fokuspunkt',
    file: 'images.js',
    /* MITGEGANGEN MIT 0.19.5 (Stolperstein 201): dieselbe Zusage an der
       Stelle, an der der Ausschnitt jetzt entsteht. */
    search: "  const k = cropSpecBox(width, height, cropSpec.fx, cropSpec.fy, cropSpec.zoom);",
    replacement: "  const k = cropSpecBox(breite, hoehe, 50, 50, zuschnitt.zoom);",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER DIALOG LIEGT WIEDER UNTER DEM VOLLBILD -- der Zustand bis 0.19.1.
       Die Rueckfrage steht dann erst da, wenn man das Vollbild schliesst. */
    nr: '466', name: 'Der Dialog liegt wieder unter dem Vollbild',
    file: 'public/style.css',
    search: "  --z-dialog: 100;",
    replacement: "  --z-dialog: 60;",
    expected: 'Die Stapelordnung — 0.19.1'
  },
  {
    /* DIE REGEL TRAEGT WIEDER IHRE EIGENE ZAHL. Sie sieht damit richtig aus
       und steht doch neben der Ordnung statt in ihr -- die naechste Kachel
       macht sie wieder auf. */
    nr: '467', name: 'Der Dialog traegt seine Stufe wieder als Zahl in der Regel',
    file: 'public/style.css',
    search: "padding: 22px; z-index: var(--z-dialog);",
    replacement: "padding: 22px; z-index: 60;",
    expected: 'Die Stapelordnung — 0.19.1'
  },
  {
    /* DIE MELDUNG RUTSCHT UNTER DEN DIALOG. Sie ist die Quittung des Dialogs
       und waere von ihm verdeckt. */
    nr: '468', name: 'Die Meldung liegt unter dem Dialog',
    file: 'public/style.css',
    search: "  --z-toast: 120;",
    replacement: "  --z-toast: 95;",
    expected: 'Die Stapelordnung — 0.19.1'
  },
  {
    /* DIE BILDABLAGE HAT KEINE EIGENE KARTE MEHR. Sie steht damit nirgends --
       weder als Karte noch als Abschnitt in „Kennzahlen". */
    nr: '469', name: 'Die Bildablage faellt aus der Kartentabelle',
    file: 'public/app.js',
    search: "  { key: 'bildablage',   section: 'database', visible: () => ADMIN,\n" +
           "    markup: cardImageStore,   wireUp: setUpImageStoreOut },\n",
    replacement: "",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* SIE STEHT IM FALSCHEN ABSCHNITT. Der Knopf, der die Datenbank umschreibt,
       laege dann bei den Kategorien und Tags. */
    nr: '470', name: 'Die Karte „Bildablage" steht im Abschnitt „Bestand"',
    file: 'public/app.js',
    search: "  { key: 'bildablage',   section: 'database',",
    replacement: "  { schluessel: 'bildablage',   abschnitt: 'inventory',",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* SIE VERSCHWINDET, WENN KEIN BILD DALIEGT. Der Systembereich wechselte
       damit unter der Hand die Gestalt -- achtzehn Karten auf einer frischen
       Installation, neunzehn auf einer benutzten. */
    nr: '471', name: 'Die Karte „Bildablage" verschwindet ohne Bilder',
    file: 'public/app.js',
    search: "  { key: 'bildablage',   section: 'database', visible: () => ADMIN,",
    replacement: "  { key: 'bildablage',   section: 'database',\n" +
            "    sichtbar: (g) => ADMIN && !!Object.keys((g.stats && g.stats.bildFormate) || {}).length,",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DER DIALOG SAGT NICHT MEHR, DASS ES DAUERN KANN. Wer den Knopf drueckt,
       rechnet dann mit Sekunden und bekommt eine Stunde. */
    /* AN DER MEHRZAHLFORM UND NICHT AN DER EINZAHL -- ein Fund vom
       6. September 2026: die Prueflage zeigt zwoelf Fotos, also die Mehrzahl;
       ein Rueckbau an der Einzahl blieb deshalb STUMM. */
    nr: '472', name: 'Der Dialog sagt nicht mehr, dass es dauern kann',
    file: 'public/languages/de.json',
    search: "werden umgestellt, die Originale ersetzt (danach etwa {after}). Dabei wird jedes Vorschaubild angesehen und, wo es noch JPEG ist, aus dem Original neu gerechnet. Rückgängig nur mit einer vorher angelegten Sicherung. Dauer: Minuten bis Stunden.\"",
    replacement: "werden umgestellt, die Originale ersetzt (danach etwa {after}). Dabei wird jedes Vorschaubild angesehen und, wo es noch JPEG ist, aus dem Original neu gerechnet. Rückgängig nur mit einer vorher angelegten Sicherung.\"",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* ER ERFINDET DOCH EINE ZAHL. Gemessen 394 ms je Bild hier gegen 5,3 s im
       Feld -- Faktor dreizehn: eine Schaetzung waere auf der einen Maschine
       beruhigend falsch und auf der anderen erschreckend falsch. */
    nr: '473', name: 'Der Dialog erfindet doch eine Minutenangabe',
    file: 'public/languages/de.json',
    search: "Rückgängig nur mit einer vorher angelegten Sicherung. Dauer: Minuten bis Stunden.\"\n  },",
    replacement: "Rückgängig nur mit einer vorher angelegten Sicherung. Dauer: etwa 20 Minuten.\"\n  },",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DIE THREADZAHL VON sharp WIRD NICHT MEHR GESETZT. Auf der Installation,
       die den Befund gemeldet hat, aendert das nichts -- auf einem Image mit
       jemalloc oder unter musl nimmt sich libvips die ganze Maschine. */
    nr: '474', name: 'Die Threadzahl von sharp wird nicht mehr gesetzt',
    file: 'server.js',
    search: "sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));",
    replacement: "",
    expected: 'Die Threadzahl von sharp — 0.19.1'
  },
  {
    /* SIE WIRD AUF DIE VOLLE KERNZAHL GESETZT -- die Zeile steht da und tut
       das Gegenteil dessen, wofuer sie da ist. */
    nr: '475', name: 'Die Threadzahl von sharp ist die volle Kernzahl',
    file: 'server.js',
    search: "Math.max(1, Math.floor(os.cpus().length / 2))",
    replacement: "os.cpus().length",
    expected: 'Die Threadzahl von sharp — 0.19.1'
  },
  {
    /* DER BILDSCHIRMTEXT SAGT WIEDER „der Instanz". Wer seine Anlage anders
       benannt hat, liest eine Message ueber ein Wort, das nirgends auf seinem
       Bildschirm steht. */
    nr: '476', name: 'Die Absage nennt wieder „den Eigentümer der Instanz"',
    file: 'public/languages/de.json',
    search: "\"server.deniedOwner\": \"Das kann nur der Eigentümer dieser Installation.\",",
    replacement: "\"server.deniedOwner\": \"Das kann nur der Eigentümer der Instanz.\",",
    expected: 'Die Rechte am Papierkorb'
  },
  {
    /* DIE ARBEITSDATEI STEHT WIEDER NICHT IN DER IGNORIERLISTE. Wer das ZIP
       ueber seinen Ordner entpackt, verliert seine angepasste Fassung. */
    nr: '477', name: 'Die docker-compose.yml steht nicht mehr in der .gitignore',
    file: '.gitignore',
    search: "\ndocker-compose.yml",
    replacement: "",
    expected: 'Die Compose-Datei wird nicht ueberschrieben'
  },
  {
    /* DIE README NENNT DEN PFLICHTSCHRITT NICHT MEHR. Ohne ihn bricht
       `docker compose up` mit „no configuration file provided" ab -- karg,
       aber es haelt an; die README ist die Stelle, die es vorher sagt. */
    nr: '478', name: 'Die README nennt den Pflichtschritt zur Compose-Datei nicht mehr',
    file: 'README.md',
    search: "**Der Schritt `cp docker-compose.example.yml docker-compose.yml` ist Pflicht.**",
    replacement: "",
    expected: 'Die Compose-Datei wird nicht ueberschrieben'
  },
  {
    /* DER WAECHTER UEBER DIE BERICHTIGTEN BEHAUPTUNGEN LAEUFT INS LEERE.
       Ohne die Berichtigung im Quelltext stuende dort wieder ein Satz, der
       gemessen falsch ist. */
    nr: '479', name: 'Die Berichtigung zu substr() faellt aus dem Quelltext',
    file: 'server.js',
    search: "     -- substr() AUF EINEM BLOB LIEST DAS BLOB, gemessen 657 ms bei 205 MB,",
    replacement: "     -- substr() liest wenig, gemessen 657 ms bei 205 MB,",
    expected: 'Die berichtigten Behauptungen stehen nirgends mehr'
  },

  /* ---- 0.19.2: was 0.19.1 nur zur Haelfte getroffen hat ---- */
  {
    /* DER INDEX AUF `art` FAELLT WEG. Ohne ihn kostet jede Frage nach der Art
       den ganzen Satz -- gemessen 1338,8 ms gegen 0,1 ms, und keine Umformung
       der Abfrage hilft dagegen (Stolperstein 279). */
    nr: '480', name: 'Der Index auf photos(art) faellt weg',
    file: 'db.js',
    search: "db.exec('CREATE INDEX IF NOT EXISTS idx_photos_kind ON photos(kind)');",
    replacement: "",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER INDEX WANDERT ZURUECK IN DIE DDL -- vor die Migration, die seine
       Spalte anlegt. Eine Datenbank aus 0.8.40 traegt `photos.art` nicht, und
       das Oeffnen der Datei scheitert dann mit „no such column: art"
       (Stolperstein 281). */
    nr: '486', name: 'Der Index steht wieder vor seiner Migration',
    file: 'db.js',
    search: "CREATE INDEX IF NOT EXISTS idx_photos_item ON photos(item_id, sort_order);",
    replacement: "CREATE INDEX IF NOT EXISTS idx_photos_item ON photos(item_id, sort_order);\n" +
            "CREATE INDEX IF NOT EXISTS idx_photos_kind ON photos(kind);",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* GEFRAGT WIRD WIEDER MIT EINER UNGLEICHHEIT. Sie sieht richtig aus und
       schlaegt den Index aus: 1334 ms gegen 0,5 ms, dieselbe Antwort. */
    nr: '481', name: 'Die Aufteilung fragt wieder mit einer Ungleichheit',
    file: 'server.js',
    search: "  'SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos WHERE kind IS ?');",
    replacement: "  \"SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos WHERE kind != 'video' AND ? IS NOT NULL\");",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DIE EXPORTGROESSE DER BILDER WIRD WIEDER EIN ZWEITES MAL GEFRAGT --
       dieselbe teure Frage nach `art != 'video'`, gemessen 1363 und 1310 ms
       zusaetzlich. Die Zahl bleibt dieselbe; nur der Weg dorthin ist ein
       zweiter (Stolperstein 47). */
    nr: '482', name: 'Die Exportgroesse der Bilder wird ein zweites Mal gefragt',
    file: 'server.js',
    search: "      ...exchangeParts(null, { withFiles: true }),",
    replacement: "      ...exchangeParts(null, { mitFotos: true, mitDateien: true, mitVideos: true }),",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER SPIELRAUM DES RAHMENS RECHNET DEN ZOOM NICHT MEHR EIN -- der Zustand
       bis 0.19.1. An einem fast quadratischen Bild laesst sich der Ausschnitt
       damit waagerecht gar nicht verschieben, und die eingestellte Ecke ist
       auch mit `transform-origin` nie zu erreichen. */
    nr: '483', name: 'Der Spielraum des Ausschnitts rechnet den Zoom nicht ein',
    file: 'public/app.js',
    search: "               playX: f.width - k.edge, playY: f.height - k.edge };",
    replacement: "               playX: f.breite - Math.min(f.breite, f.hoehe), playY: f.hoehe - Math.min(f.breite, f.hoehe) };",
    expected: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* DER ZEIGER LANDET NICHT MEHR IN DER MITTE DES RAHMENS, den er gerade
       zieht -- gerechnet wird wieder mit der vollen Seite statt mit dem
       engeren Ausschnitt. Der Sprung ist umso groesser, je enger man zieht. */
    nr: '484', name: 'Der Griff setzt den Punkt neben die Mitte des Rahmens',
    file: 'public/app.js',
    search: "      fx = playX > 0 ? Math.min(100, Math.max(0, (px - eng / 2) / playX * 100)) : 50;",
    replacement: "      fx = playX > 0 ? Math.min(100, Math.max(0, (px - seite / 2) / playX * 100)) : 50;",
    expected: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* DER DIALOG SAGT NICHT MEHR, DASS DIE UMWANDLUNG NAHEZU VERLUSTFREI IST.
       Wer das nicht liest, haelt den Knopf fuer eine Verschlechterung. */
    nr: '485', name: 'Der Dialog sagt nicht mehr, dass es nahezu verlustfrei ist',
    file: 'public/languages/de.json',
    search: "\"card.storeLosslessHint\": \"Vorgabe — kein sichtbarer Verlust, gemessen rund zwei Drittel kleiner\",",
    replacement: "\"card.storeLosslessHint\": \"Vorgabe — gemessen rund zwei Drittel kleiner\",",
    expected: 'Die Bildablage in der Oberflaeche'
  },

  {
    /* DIE UEBERSETZUNG KOMMT ZURUECK. Sie sieht harmlos aus und faengt einen
       Fall ab, den es an dieser Anlage nicht gibt -- Aufwand ohne Gegenwert,
       der bei jeder weiteren Umbenennung gepflegt werden will. */
    nr: '487', name: 'Die Uebersetzung der alten Abschnittsadressen kommt zurueck',
    file: 'public/app.js',
    search: "  const desired = fromAddress;",
    replacement: "  const gewuenscht = { anlage: 'installation', instanz: 'installation' }[ausDerAdresse] || ausDerAdresse;",
    expected: 'Der fuenfte Abschnitt heisst „Installation" — 0.17.1, 0.19.1 und 0.19.2'
  },

  {
    /* DER DECKENDE INDEX FUER DIE UEBERSICHT FAELLT WEG. Sie liest dann sieben
       Spalten wieder aus dem Satz, und der steht in Overflow-Seiten --
       gemessen 6,3 statt 1,6 ms bei 400 Fotos. */
    nr: '488', name: 'Der deckende Index fuer die Uebersicht faellt weg',
    file: 'db.js',
    search: "db.exec(`CREATE INDEX IF NOT EXISTS idx_photos_tile",
    replacement: "db.exec(`SELECT 1 -- (",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* EINE SPALTE FEHLT IM INDEX -- und das genuegt: SQLite faellt auf
       idx_photos_item zurueck und liest wieder den Satz. Der Index steht da,
       sieht richtig aus und deckt nichts mehr. */
    nr: '489', name: 'Dem deckenden Index fehlt eine Spalte',
    file: 'db.js',
    search: "zoom, created_at, kind, duration)`);",
    replacement: "zoom, art, dauer)`);",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DIE UEBERSICHT FRAGT WIEDER JE EINTRAG. Der Index bleibt, der Gewinn
       halbiert sich -- 3,0 statt 1,6 ms. */
    nr: '490', name: 'Die Uebersicht fragt die Fotos wieder je Eintrag',
    file: 'server.js',
    search: "    const ph = photosPer.get(it.id) || [];",
    replacement: "    const ph = qPhotos.all(it.id);",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },

  /* ---- 0.19.3: der Bestandslauf im eigenen Thread ----
     NEUN RUECKBAUTEN, und sie zielen auf verschiedene Haelften derselben
     Zusage: dass der Stand waehrend des Laufs ueberhaupt zurueckreist, dass er
     im Haupt-Thread ankommt, dass der Schluessel NICHT mitreist, dass der
     Abschluss den Thread mitnimmt, dass ein Fehler nicht still bleibt, dass
     der Fingerprint die Datei kennt und dass der Thread sich nicht die ganze
     Maschine nimmt. Ein Rueckbau, der alles zugleich abschaltet, sagte nur,
     dass irgendetwas fehlt. */
  {
    /* DER STAND REIST ERST AM ENDE ZURUECK. Die Karte im Systembereich fragt
       alle 1500 ms und saehe waehrend des ganzen Laufs dieselbe Null -- am
       Ergebnis aendert sich nichts, an der Auskunft alles. */
    nr: '491', name: 'Der Thread meldet seinen Stand erst am Ende',
    file: 'batchrun.js',
    /* DIE ZEILE DANACH GEHOERT SEIT 0.19.4 ZUM SUCHTEXT: dieselben zwei
       Zeilen stehen jetzt auch in der dritten Schleife, und ein Suchtext, der
       zweimal passt, bricht den Rueckbau ab (Stolperstein 201 -- mitziehen,
       nicht loeschen). Das Nachziehen bekommt seinen eigenen Rueckbau. */
    search: "    status.done++;\n    report(status);\n    await new Promise(r => setTimeout(r, 30));",
    replacement: "    stand.done++;\n    await new Promise(r => setTimeout(r, 30));",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER HAUPT-THREAD HOERT NICHT MEHR ZU. `umstellung.laeuft` bleibt damit
       fuer immer auf true stehen -- die Karte meldet einen Lauf, der laengst
       vorbei ist, und die Pruefung, die auf sein Ende wartet, laeuft in ihre
       Grenze. */
    nr: '492', name: 'Der Haupt-Thread hoert die Meldungen des Threads nicht mehr',
    file: 'server.js',
    search: "  w.on('message', (m) => { if (m && m.kind === 'status') batchStates[task] = m.status; });",
    replacement: "  w.on('message', () => {});",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER SCHLUESSEL REIST UEBER workerData. `workerData` wird beim Erzeugen
       des Threads strukturiert KOPIERT -- der Schluessel staende danach in
       einem zweiten Speicher, und zwar ohne Not: der Thread liest ihn
       denselben Weg wie der Haupt-Thread. */
    nr: '493', name: 'Der Schluessel reist ueber workerData in den Thread',
    file: 'server.js',
    search: "  const w = new Worker(BATCHRUN, { workerData: { task, rows, store } });",
    replacement: "  const w = new Worker(BESTANDSLAUF, { workerData: { aufgabe, zeilen, schluessel: keyHex } });",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER ABSCHLUSS LAESST DEN THREAD LAUFEN. Er schreibt dann in eine Datei,
       deren WAL gerade gekuerzt wird -- der eine Fall, den diese Runde neu
       einbringt. */
    nr: '494', name: 'SIGTERM kuerzt die WAL, waehrend der Thread noch schreibt',
    file: 'server.js',
    search: "    for (const w of batchThreads) { try { w.terminate(); } catch {} }",
    replacement: "    // die Threads laufen weiter",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* EIN FEHLER IM THREAD BLEIBT STILL. Der Server steht danach zwar noch,
       aber die Karte zeigt fuer immer „laeuft" -- und ein zweiter Druck wird
       mit 409 abgewiesen, obwohl gar nichts mehr laeuft. */
    nr: '495', name: 'Ein Fehler im Thread laesst den Lauf auf „laeuft" stehen',
    file: 'server.js',
    search: "    if (batchStates[task]) batchStates[task].running = false;",
    replacement: "    if (false) batchStates[aufgabe].laeuft = false;",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER FINGERPRINT KENNT DIE DATEI DES THREADS NICHT MEHR. Sie wird nicht
       requiret, sondern an `new Worker` gereicht -- ohne diese Zeile steht sie
       in keiner Ableitung, und der Fingerprint ist eine halbe Aussage. */
    nr: '496', name: 'Der Fingerprint kennt die Datei des Threads nicht',
    file: 'server.js',
    search: "  const list = [...new Set([...ran, BATCHRUN,",
    replacement: "  const liste = [...new Set([...ausgefuehrt,",
    expected: 'Der Versions-Fingerprint'
  },
  {
    /* DER THREAD UEBERLAESST sharp SEINE VORGABE. sharp wird dort EIGENS
       geladen; unter musl oder mit jemalloc ist die Vorgabe die Kernzahl, und
       ausgerechnet der Wartungslauf naehme sich dann die ganze Maschine. */
    nr: '497', name: 'Der Thread ueberlaesst sharp seine Vorgabe',
    file: 'batchrun.js',
    search: "sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));",
    replacement: "// sharp nimmt sich, was es will",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER SCHLUESSELHINWEIS STEHT BEI JEDEM LAUF EIN ZWEITES MAL IM
       PROTOKOLL -- ein halber Bildschirm, jedes Mal. Wer ihn einmal gelesen
       hat, liest ihn beim zweiten Mal nicht besser. */
    nr: '498', name: 'Der Schluesselhinweis wiederholt sich in jedem Thread',
    file: 'keys.js',
    search: "function warnKeyBesideData() {\n  if (!isMainThread) return;",
    replacement: "function warnKeyBesideData() {",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },

  /* ---- 0.19.3: die Uebersicht fragt einmal und holt nur, was sie zeigt ----
     SECHS RUECKBAUTEN, und sie zielen auf die beiden Gefahren der Buendelung:
     die verlorene ZWEITE Ordnung (wer nach item_id gruppiert und den Rest
     vergisst, bekommt die Zeilen in Einfuegereihenfolge) und die zweite
     WAHRHEIT (die gebuendelte Fassung liest andere Spalten als die
     einzelne). */
  {
    nr: '499', name: 'Die gebuendelten Schlagworte verlieren ihre zweite Ordnung',
    file: 'server.js',
    search: "  JOIN item_tags it ON it.tag_id = t.id ORDER BY it.item_id, t.name COLLATE NOCASE`);",
    replacement: "  JOIN item_tags it ON it.tag_id = t.id ORDER BY it.item_id`);",
    expected: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    nr: '500', name: 'Die gebuendelten Testtage verlieren ihre zweite Ordnung',
    file: 'server.js',
    search: "  'SELECT item_id, id, day, rating, user_id FROM test_days ORDER BY item_id, day DESC, id DESC');",
    replacement: "  'SELECT item_id, id, day, rating, user_id FROM test_days ORDER BY item_id');",
    expected: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    /* EINE KARTE KENNT NUR, WAS SIE GEFUNDEN HAT. Ohne den Rueckfall traegt
       die Kachel eines Eintrags ohne Link gar kein Feld -- und die
       Oberflaeche zeigt dort nichts statt einer Null. */
    nr: '501', name: 'Die Linkzahl fehlt ganz, wo kein Link ist',
    file: 'server.js',
    search: "    it.linkCount = linkCountPer.get(it.id) || 0;",
    replacement: "    it.linkCount = linkCountPer.get(it.id);",
    expected: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    /* DIE GEBUENDELTE FASSUNG LIEST EINE SPALTE MEHR ALS DIE EINZELNE. Beide
       sehen fuer sich richtig aus, und die Kachel traegt trotzdem etwas
       anderes als der Eintrag (Stolperstein 47). */
    nr: '502', name: 'Die gebuendelte Schlagwortabfrage liest eine Spalte mehr',
    file: 'server.js',
    search: "const qAllTags = db.prepare(`SELECT it.item_id, ${TAG_COLUMNS} FROM tags t",
    replacement: "const qAllTags = db.prepare(`SELECT it.item_id, t.id, t.name, t.created_at FROM tags t",
    expected: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    /* DIE LISTE HOLT WIEDER, WAS SIE NICHT ZEIGT: die Schlagworte jedes
       Testtags (bei 400 Eintraegen 1200 Einzelabfragen) und den Verfasser
       dazu. Gelesen hat beides in der Uebersicht nie jemand. */
    nr: '503', name: 'Die Testtage der Liste tragen wieder Schlagworte und Verfasser',
    file: 'server.js',
    search: "    if (timeline) it.testDays = testDaysPer.get(it.id) || [];",
    replacement: "    if (timeline) it.testDays = qTestDays(it.id, req.user.id, karte);",
    expected: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    /* `t.*` STATT DER SPALTENLISTE. `created_at` eines Schlagworts liest die
       Oberflaeche nirgends -- und was niemand ansieht, wird zweimal bezahlt:
       beim Holen und beim Senden. */
    nr: '504', name: 'Die Schlagwortabfrage liest wieder alle Spalten',
    file: 'server.js',
    search: "const TAG_COLUMNS = 't.id, t.name';",
    replacement: "const TAG_COLUMNS = 't.*';",
    expected: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },

  /* ---- 0.19.3: die letzten acht „Instanz" ---- */
  {
    /* EINE DER ACHT STELLEN SAGT WIEDER „Instanz". Der Waechter zaehlt
       Nicht-Kommentarzeilen; eine einzige genuegt, damit er anschlaegt. */
    nr: '505', name: 'Eine Stelle im Bildschirmtext sagt wieder „Instanz"',
    file: 'public/languages/de.json',
    search: "\"card.noMailAccountHint\": \"Ohne Mailzugang zeigt Kriterion",
    replacement: "\"card.noMailAccountHint\": \"Ohne Mailzugang zeigt die Instanz",
    expected: '„Instanz" steht in keinem Bildschirmtext mehr — 0.19.1 und 0.19.3'
  },

  /* ---- 0.19.4: die Ableitung folgt der Anzeige ----
     ZEHN RUECKBAUTEN AN DER GEOMETRIE UND SIEBEN AM LAUF, und sie sind
     absichtlich klein geschnitten: die Runde aendert eine ZAHL in einer Tafel,
     und ein Rueckbau, der die ganze Tafel umwirft, sagte nur, dass irgendetwas
     an den Ableitungen haengt. */
  {
    /* DIE KURZE KANTE STEHT WIEDER AUF 400. Der Deckel bleibt, damit genau
       diese eine Zahl gemessen wird und nicht zwei zugleich. */
    nr: '506', name: 'Die kurze Kante des thumb steht wieder auf 400',
    file: 'images.js',
    search: "  thumb:  { short: 512,  long: 1280, q: 82, crops: true  },",
    replacement: "  thumb:  { kurz: 400,  lang: 1280, q: 82, schneidet: true  },",
    expected: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DER DECKEL FAELLT WEG. Ohne ihn kennt die kurze Kante keine obere
       Grenze fuer die lange: ein Bildschirmfoto ueber zwei Monitore wird zur
       groessten Ableitung der Tabelle -- groesser als sein eigenes `medium`. */
    nr: '507', name: 'Der Deckel auf der langen Kante faellt weg',
    file: 'images.js',
    search: "long: 1280, q: 82, crops: true  }",
    replacement: "lang: 99999, q: 82, schneidet: true  }",
    expected: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* `medium` WIRD BEHANDELT WIE `thumb`. Es wird mit `object-fit: contain`
       gezeigt, und dafuer ist die LANGE Kante die richtige -- wer beide
       Ableitungen „der Ordnung halber" gleich behandelt, macht `medium`
       schlechter und die Datenbank groesser. */
    nr: '508', name: 'medium bekommt dieselbe Kiste wie thumb',
    file: 'images.js',
    search: "  medium: { short: 1600, long: 1600, q: 78, crops: false }",
    replacement: "  medium: { kurz: 512, lang: 1280, q: 78, schneidet: false }",
    expected: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DER EXIF-VERMERK ZAEHLT NICHT MEHR MIT. `metadata()` liefert die Masse
       so, wie sie in der Datei stehen; `.rotate()` dreht danach. Ein
       hochkantes Bild mit Ausrichtung 6 bekommt damit die Kiste hochkant und
       kommt quer heraus -- mit 1280 auf der kurzen Kante. */
    nr: '509', name: 'Der EXIF-Vermerk zaehlt bei der Kante nicht mehr mit',
    file: 'images.js',
    search: "  const rotated = m && m.orientation >= 5;",
    replacement: "  const gedreht = false;",
    expected: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DER KOPF WIRD GAR NICHT ERST GELESEN. Die Kiste liegt dann immer quer,
       und jedes hochkante Bild bekommt 512 auf der LANGEN statt auf der
       kurzen Kante. */
    nr: '510', name: 'Der Kopf wird nicht gelesen -- die Kiste liegt immer quer',
    file: 'images.js',
    search: "  const landscape = size ? isLandscape(size) : true;",
    replacement: "  const quer = true;",
    expected: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DIE ALTE GEOMETRIE WIRD AN DER KURZEN KANTE ERKANNT. Das klingt
       richtiger und ist es nicht: der Lauf zoege damit auch das kleine Bild
       und das Panorama mit, und beide kaemen unveraendert heraus -- also bei
       JEDEM Start aufs Neue. Die Abfrage waere kein Festpunkt mehr. */
    nr: '511', name: 'Die Faelligkeit wird wieder an der Zielkante erkannt',
    file: 'images.js',
    /* MITGEGANGEN MIT 0.19.5 (Stolperstein 201). Die alte Frage lautete
       „traegt die lange Kante genau 400?"; sie ist von „ist die Kachel
       quadratisch?" abgeloest. DIESER RUECKBAU SETZT DIE ZIELKANTE ALS
       ZWEITE HAELFTE WIEDER EIN -- und genau daran faellt der Festpunkt: eine
       zugeschnittene Kachel unter 512 (kleines Original, enger Ausschnitt) waere
       damit bei JEDEM Start wieder faellig. */
    search: "  return size.width !== size.height;",
    replacement: "  return masse.width !== masse.height || masse.width !== VARIANTS.thumb.kurz;",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* EIN UNLESBARER `thumb` GILT WIEDER ALS FERTIG. Die Zeile bleibt damit
       fuer immer kaputt: das Nachruesten sucht `thumb IS NULL` und sieht
       einen kaputten `thumb` gar nicht an. */
    nr: '512', name: 'Ein unlesbarer thumb bleibt liegen',
    file: 'images.js',
    search: "  catch { return true; }",
    replacement: "  catch { return false; }",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER LAUF FASST JEDE GEPRUEFTE ZEILE AN. Er leitet damit auch die
       Zeilen neu ab, die laengst richtig liegen -- bei jedem Start, mit dem
       vollen Preis fuer das Lesen des Originals. */
    nr: '513', name: 'Der Lauf erneuert jede Zeile, nicht nur die faelligen',
    file: 'batchrun.js',
    search: "        if (await isUncropped(z.thumb)) {",
    replacement: "        if (true) {",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER LAUF SCHREIBT AUCH EINE LEERE ABLEITUNG. Danach steht NULL in einer
       Spalte, die vorher ein Bild trug -- eine Videozeile verliert so ihr
       Standbild, und zwar still. */
    nr: '514', name: 'Der Lauf schreibt auch, wenn die Ableitung leer zurueckkommt',
    file: 'batchrun.js',
    search: "  if (!v.thumb) return null;",
    replacement: "  if (!v.thumb) v.thumb = null;",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER STAND REIST ERST AM ENDE ZURUECK -- dasselbe wie Rueckbau 491, eine
       Schleife weiter. Die Karte im Systembereich fragt alle 1500 ms und
       saehe waehrend des ganzen Laufs dieselbe Null. */
    nr: '515', name: 'Das Nachziehen meldet seinen Stand erst am Ende',
    file: 'batchrun.js',
    search: "    status.done++;\n    report(status);\n    /* DIESELBEN 30 ms WIE IN DEN ANDEREN BEIDEN SCHLEIFEN.",
    replacement: "    stand.done++;\n    /* DIESELBEN 30 ms WIE IN DEN ANDEREN BEIDEN SCHLEIFEN.",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DAS NACHZIEHEN GIBT SEINE SEITEN NICHT FREI. Die alten Ableitungen
       geben ihre Seiten frei, aber SQLite gibt sie ohne incremental_vacuum
       nicht ans Dateisystem zurueck.
       ERWARTET STUMM, UND DAS IST EIN OFFENER PUNKT UND KEINE FORMALIE: die
       Wirkung von reclaim() ist eine DATEIGROESSE, und in dieser Runde
       waechst die Datei ohnehin -- die freigegebenen Seiten werden von den
       groesseren Ableitungen sofort wieder belegt. Nachgesehen, nicht
       vermutet: die WAL-Datei ist nach dem Lauf in beiden Faellen weg, weil
       db.close() ebenfalls einen Punkt setzt. Dieselbe Luecke steht seit
       0.19.3 an der Umstellung; sie ist im Aenderungsprotokoll als
       Offengebliebenes benannt. */
    nr: '516', name: 'Das Nachziehen gibt seine Seiten nicht frei',
    file: 'batchrun.js',
    search: "  reclaim();\n  report(status);\n  console.log(`[Kriterion] Kacheln erneuert:",
    replacement: "  melde(stand);\n  console.log(`[Kriterion] Kacheln erneuert:",
    expected: '(erwartet STUMM — die Wirkung ist eine Dateigroesse, und die waechst in dieser Runde ohnehin)'
  },
  {
    /* DIE KETTE BRICHT. Das Nachziehen laeuft danach nur noch, wenn beim
       Start zufaellig ein Vorschaubild fehlt -- also in keiner Instanz nach
       ihrem ersten Start. */
    nr: '517', name: 'Das Nachziehen wird beim Start nicht mehr gerufen',
    file: 'server.js',
    search: "  if (!open.length) return refreshTiles();",
    replacement: "  if (!open.length) return maintainStorage();",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DIE AUSWAHL VERENGT SICH AUF EIN WORT. `art` traegt laut Schema 'image'
       oder 'video' -- aber der Import schreibt den Wert aus der
       Austauschdatei ungeprueft durch, und der Pruefstand legt seit 0.19.3
       Zeilen mit `art = 'foto'` an. Die verengte Abfrage laesst sie still
       liegen. */
    nr: '518', name: 'Die Auswahl der faelligen Zeilen verengt sich auf ein Wort',
    file: 'server.js',
    search: "const qTileRows = db.prepare('SELECT id FROM photos');",
    replacement: "const qTileRows = db.prepare(\"SELECT id FROM photos WHERE kind IS 'image'\");",
    expected: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DIE FORTSCHRITTSZEILE DES NACHZIEHENS FAELLT AUS DER KARTE. Der Lauf
       dauert am echten Bestand Minuten und laesst die Datenbank um zig
       Megabyte wachsen -- ohne die Zeile geschieht das ohne jedes Zeichen. */
    nr: '519', name: 'Die Fortschrittszeile des Nachziehens faellt aus der Karte',
    file: 'public/app.js',
    search: "        ${geometryRow(stats.geometry)}",
    replacement: "",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DIE ZEILE STEHT AUCH OHNE FUND DA. Der Lauf faehrt bei JEDEM Start und
       findet nach dem ersten Durchgang nichts mehr; die Zeile „0 von 1032
       nachgezogen" staende von da an fuer immer in der Karte und erklaerte
       einen Vorgang, den niemand angestossen hat. */
    nr: '520', name: 'Die Zeile des Nachziehens steht auch ohne Fund da',
    file: 'public/app.js',
    search: "  if (!g.renewed && !g.skipped) return '';",
    replacement: "  if (false) return '';",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DIE UHR VERFOLGT NUR NOCH DIE UMSTELLUNG. Die Zeile des Nachziehens
       bliebe damit auf ihrem ersten Stand stehen, bis jemand den
       Systembereich neu aufbaut. */
    nr: '521', name: 'Die Uhr verfolgt nur noch die Umstellung',
    file: 'public/app.js',
    search: "  { field: 'geometry', id: 'thumbs-running',",
    replacement: "  { feld: 'gibtsnicht', id: 'gibtsnicht',",
    expected: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DIE KARTE NENNT WIEDER „400 px UND 1600 px". Die Angabe war bis 0.19.3
       richtig und ist es seit dieser Runde nicht mehr -- und sie verschweigt
       das, worauf es ankommt: WELCHE Kante die Zahl traegt. */
    nr: '522', name: 'Die Karte nennt wieder 400 px, ohne die Kante zu sagen',
    file: 'public/languages/de.json',
    search: "(WebP) sind nicht mitgezählt.\"",
    replacement: "(WebP, 400 px) sind nicht mitgezählt.\"",
    expected: 'Die Bildablage in der Oberflaeche'
  },

  /* ---- Der Ausschnitt steckt in der Kachel -- 0.19.5 ----
     JEDER RUECKBAU NIMMT GENAU EINE ZUSAGE WEG. Die Runde kehrt eine
     Entscheidung aus 0.19.4 um -- der Zuschnitt entsteht ab jetzt am Server
     und nicht mehr im Browser --, und sie besteht aus zwei Haelften, die nur
     zusammen richtig sind. Deshalb liegen hier Rueckbauten fuer BEIDE Seiten:
     einer, der das Erzeugen wegnimmt, und einer, der den CSS-Zuschnitt
     zurueckholt (453, oben mitgegangen). */
  {
    /* DIE TAFEL SCHNEIDET NICHT MEHR. `thumb` wird wieder ungeschnitten
       abgeleitet -- die Kachel ist danach 910 x 512 statt 512 x 512, und der
       Browser, der sie zurechtzoege, ist weg. */
    nr: '523', name: 'Die Kachel wird wieder ungeschnitten abgeleitet',
    file: 'images.js',
    search: "  thumb:  { short: 512,  long: 1280, q: 82, crops: true  },",
    replacement: "  thumb:  { kurz: 512,  lang: 1280, q: 82, schneidet: false },",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* `medium` WIRD MITGESCHNITTEN. Es wird mit `object-fit: contain`
       gezeigt -- ganz --, und der Editor zeichnet den Rahmen darauf. Ein
       geschnittenes `medium` naehme ihm seine Vorlage. */
    nr: '524', name: 'medium wird mitgeschnitten',
    file: 'images.js',
    search: "  medium: { short: 1600, long: 1600, q: 78, crops: false }",
    replacement: "  medium: { kurz: 1600, lang: 1600, q: 78, schneidet: true }",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER ZUSCHNITT RECHNET IN DEN GESPEICHERTEN MASSEN. `extract()` rechnet
       in den GEDREHTEN -- Stolperstein 288 an einer zweiten Stelle. Wer den
       EXIF-Vermerk nicht mitzaehlt, schneidet an der falschen Stelle, und bei
       3024 Breite laege ein `left` von 3500 sogar ausserhalb. */
    nr: '525', name: 'Der Zuschnitt rechnet in den gespeicherten statt in den gedrehten Massen',
    file: 'images.js',
    search: "  const { width, height } = rotatedSize(size);",
    replacement: "  const breite = masse.width, hoehe = masse.height;",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE KISTE WIRD NICHT MEHR GEGEN DEN RAND GEKLAMMERT. Gerundet kann
       `left + width` einen Bildpunkt ueber den Rand ragen -- sharp quittiert
       das mit einem Fehler, und die Kachel entsteht gar nicht erst. Trifft
       genau den Ausschnitt in einer Ecke (fx = 100). */
    nr: '526', name: 'Die Zuschnittkiste wird nicht gegen den Rand geklammert',
    file: 'images.js',
    search: "  return { left:  Math.max(0, Math.min(width - edge, Math.round(k.links))),\n           top:   Math.max(0, Math.min(height  - edge, Math.round(k.top))),",
    replacement: "  return { left:  Math.round(k.links) + 1,\n           top:   Math.round(k.top) + 1,",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* KEIN HOCHRECHNEN MEHR -- umgekehrt: `withoutEnlargement` faellt weg,
       und ein Ausschnitt unter der Zielkante wird auf 512 aufgeblasen. Es
       kostete Bytes und truege keinen einzigen Bildpunkt mehr. */
    nr: '527', name: 'Ein zu kleiner Ausschnitt wird auf die Zielkante hochgerechnet',
    file: 'images.js',
    search: "withoutEnlargement: true })",
    replacement: "withoutEnlargement: false })",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DAS FRISCH HOCHGELADENE FOTO WIRD NICHT ZUGESCHNITTEN. Es traegt danach eine
       ungeschnittene Kachel, bis der Bestandslauf beim naechsten Start
       darueberfaehrt -- und der Browser, der sie bis 0.19.4 zurechtzog, ist
       weg. */
    nr: '528', name: 'Beim Hochladen wird die Kachel nicht zugeschnitten',
    file: 'server.js',
    search: "      const v = await makeVariants(f.buffer, DEFAULT_CROP);",
    replacement: "      const v = await makeVariants(f.buffer);",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER EINGESPIELTE AUSSCHNITT KOMMT NICHT IN DIE ABLEITUNG. Die drei
       Zahlen stehen danach richtig in der Zeile, die Kachel zeigt sie aber
       nicht -- an einem gerade eingespielten Bestand ist das der ganze
       Bestand. */
    nr: '529', name: 'Beim Einspielen wird die Kachel nicht zugeschnitten',
    file: 'server.js',
    search: "      const v = template ? await makeVariants(template, crop) : { thumb: null, medium: null };",
    replacement: "      const v = vorlage ? await makeVariants(vorlage) : { thumb: null, medium: null };",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER BESTANDSLAUF ERNEUERT OHNE ZUSCHNITT. Er erzeugte damit genau die
       Ableitung, die 0.19.4 hinterlassen hat -- und die Zeile bliebe bei
       jedem Start aufs Neue faellig, weil sie nicht quadratisch wird. */
    nr: '530', name: 'Der Bestandslauf erneuert ohne Zuschnitt',
    file: 'batchrun.js',
    search: "  const v = await makeVariants(source, cropFrom(z));",
    replacement: "  const v = await makeVariants(vorlage);",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE VIDEOZEILE ERZEUGT AUS `data`. Dort steht die Videodatei -- sharp
       kommt daran leer zurueck, die Zeile wird uebersprungen und behaelt ihre
       ungeschnittene Kachel. Der Kernsatz bleibt: der Server oeffnet nie ein
       Video. */
    nr: '531', name: 'Die Videozeile erzeugt aus der Videodatei statt aus ihrem Standbild',
    file: 'batchrun.js',
    search: "const sourceFrom = (z) => (isVideoRow(z) ? z.medium : z.data);",
    replacement: "const sourceFrom = (z) => z.data;",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE VIERTE AUFGABE GIBT ES NICHT MEHR. Der Thread wirft dann
       „Unbekannte Aufgabe", die Route bekommt ihren Abschluss ueber den
       Fehlerweg -- und die Kachel bleibt, wie sie war. */
    nr: '532', name: 'Der Thread kennt die Aufgabe zuschnitt nicht',
    file: 'batchrun.js',
    search: "  else if (workerData.task === 'crop') await refreshOneTile(workerData.rows);\n",
    replacement: "",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DAS ERGEBNIS DER EINZELNEN ZEILE REIST NICHT ZURUECK. Der Haupt-Thread
       haengt seine Antwort an das Ende des Threads und nicht an diese
       Message -- ohne sie weiss aber niemand, ob wirklich erneuert wurde. */
    nr: '533', name: 'Das Ergebnis der einzelnen Zeile wird nicht gemeldet',
    file: 'batchrun.js',
    search: "  parentPort.postMessage({ kind: 'refreshed', id, ok });",
    replacement: "",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE ROUTE ERZEUGT NICHT MEHR. Sie schreibt die drei Zahlen und ist
       fertig -- wie bis 0.19.4. Die Uebersicht zeigte danach den alten
       Schnitt, bis irgendwann etwas anderes die Zeile anfasst. */
    nr: '534', name: 'Das Speichern des Ausschnitts erzeugt die Kachel nicht neu',
    file: 'server.js',
    search: "  refreshTile(req.params.id, () => res.json(detail(p.item_id, req.user.id, localeOf(req))));",
    replacement: "  res.json(detail(p.item_id, req.user.id, localeOf(req)));",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE ANTWORT WARTET NICHT AUF DIE KACHEL. Die Frist faellt auf null, die
       Antwort geht sofort hinaus -- und traegt die Fassung der ALTEN Kachel.
       Der Browser haelt sie damit bis zu 24 Stunden fest. */
    nr: '535', name: 'Die Antwort kommt, bevor die Kachel steht',
    file: 'server.js',
    search: "  const clock = setTimeout(once, REFRESH_MS);",
    replacement: "  const uhr = setTimeout(einmal, 0);",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE FASSUNG STEHT NICHT MEHR AN DER FOTOZEILE. Ohne sie traegt die
       Adresse kein `?v=`, und `Cache-Control: private, max-age=86400` haelt
       die alte Kachel fest. */
    nr: '536', name: 'Die Fassung faellt aus der Fotoabfrage',
    file: 'server.js',
    search: "const PHOTO_VERSION = 'length(thumb) AS thumbLength';",
    replacement: "const PHOTO_VERSION = 'NULL AS thumbLength';",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE ADRESSE TRAEGT DIE FASSUNG NICHT MEHR. Dieselbe Wirkung wie 536,
       eine Schicht hoeher -- und ohne diesen Rueckbau bliebe gruen, wer die
       Spalte liefert und sie in der Oberflaeche liegen laesst. */
    nr: '537', name: 'Die Bildadresse traegt die Fassung nicht mehr',
    file: 'public/app.js',
    search: "  const version = filesize === 'thumb' && Number.isFinite(f) ? `&v=${f}` : '';",
    replacement: "  const fassung = '';",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER ZUSCHNITT IM BROWSER KOMMT ZURUECK. Ab jetzt wird ZWEIMAL
       geschnitten -- die zugeschnittene Kachel ist schon das sichtbare Quadrat,
       und `scale()` darauf zeigt einen Ausschnitt des Ausschnitts. */
    nr: '538', name: 'Der Zuschnitt im Browser kommt zurueck -- es wird zweimal geschnitten',
    file: 'public/style.css',
    search: ".thumb img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }",
    replacement: ".thumb img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; transform: scale(var(--zoom, 1)); }",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE BEIDEN RECHNUNGEN LAUFEN AUSEINANDER. Der Browser zeichnet den
       Rahmen ohne den Zoom, der Server schneidet mit ihm -- der Editor zeigt
       danach ein anderes Quadrat, als in der Kachel landet. GENAU DAS ist die
       Gefahr, wegen der die Rechnung auf beiden Seiten in EINER Funktion
       steht und der Pruefstand sie gegeneinander haelt (Stolperstein 293). */
    nr: '539', name: 'Die Rechnung im Browser laeuft der im Server davon',
    file: 'public/app.js',
    search: "  const eng = side * 100 / zoom;          // was sie beim eingestellten Zoom zeigt",
    replacement: "  const eng = side;                       // was sie beim eingestellten Zoom zeigt",
    expected: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE FORTSCHRITTSZEILE KENNT NUR NOCH EINE RICHTUNG. Bis 0.19.4 wurde die
       Kachel groesser, und „mehr" war immer richtig; zugeschnitten wird sie in der
       Regel kleiner. Danach staende in der Karte „20 MB mehr", wo 20 MB frei
       geworden sind -- eine Zahl, die in die falsche Richtung zeigt, ist
       schlechter als keine. */
    nr: '540', name: 'Die Fortschrittszeile kennt nur eine Richtung',
    file: 'public/app.js',
    search: "${d > 0 ? 'mehr' : 'weniger'}",
    replacement: "mehr",
    expected: 'Die Bildablage in der Oberflaeche'
  },

  /* ---- Die Ansicht kann fort sein -- 0.19.6 ----
     DREI RUECKBAUTEN ZU EINER EINZIGEN ZEILE JE ZEICHENWEG, und der dritte ist
     der wichtigste: er nimmt nicht die Wache weg, sondern das, was sie
     bewacht. Eine Wache, die nichts mehr durchlaesst, waere gruen und
     nutzlos. */
  {
    /* DER STREIFEN ZEICHNET WIEDER OHNE ZU FRAGEN. Genau der gemeldete
       Fehler: wer den Ausschnitt speichert und in die Uebersicht geht,
       bekommt „can't access property innerHTML" als ROTE Message ueber einen
       Vorgang, der geglueckt ist. */
    nr: '541', name: 'Der Bilderstreifen fragt nicht, ob seine Ansicht noch steht',
    file: 'public/app.js',
    search: "    // erste, die den fehlenden Knoten anfasste.\n    if (!box) return;\n",
    replacement: "    // erste, die den fehlenden Knoten anfasste.\n",
    expected: 'Die Ansicht kann fort sein — 0.19.6'
  },
  {
    /* DASSELBE AM BETRACHTER. Er faellt beim Loeschen und beim Hochladen an
       -- beides steht hinter einem await, und das Hochladen wartet laenger
       als jedes Speichern eines Ausschnitts. */
    nr: '542', name: 'Der Betrachter fragt nicht, ob seine Ansicht noch steht',
    file: 'public/app.js',
    search: "    if (!v) return;\n    // Der Betrachter bleibt bei jedem Neuzeichnen",
    replacement: "    // Der Betrachter bleibt bei jedem Neuzeichnen",
    expected: 'Die Ansicht kann fort sein — 0.19.6'
  },
  {
    /* UND DIE WACHE ALS AUSSCHALTER: der Streifen zeichnet gar nichts mehr.
       Wer nur „keine rote Message" prueft, bleibt hier gruen -- deshalb steht
       in derselben Gruppe die Gegenprobe an der STEHENDEN Ansicht. */
    nr: '543', name: 'Der Bilderstreifen zeichnet ueberhaupt keine Kacheln mehr',
    file: 'public/app.js',
    search: "    box.innerHTML = '';\n    item.photos.forEach((p, i) => {",
    replacement: "    box.innerHTML = '';\n    [].forEach((p, i) => {",
    expected: 'Die Ansicht kann fort sein — 0.19.6'
  },

  /* ---- Alte Sicherungen aufraeumen -- 0.20.0 ----
     DIE REGEL HAT ZWEI BEDINGUNGEN, und die beiden ersten Rueckbauten nehmen je
     eine davon weg. Sie sind die wichtigsten der Runde: jede einzelne Bedingung
     ist ausgerechnet in der Lage falsch, in der sie gebraucht wird
     (Stolperstein 299), und ohne diese beiden belegte die Tafel nichts darueber,
     dass wirklich BEIDE zutreffen muessen. */
  {
    /* NUR NOCH DAS ALTER -- der Boden faellt weg. Eine Installation, an der ein
       halbes Jahr nicht gesichert wurde, verliert damit ALLE Kopien auf einen
       Schlag, genau dann, wenn sie die einzigen sind. */
    nr: '544', name: 'Die Regel kennt nur das Alter -- der Boden faellt weg',
    file: 'server.js',
    search: "  return usable.slice(keep).filter(d => d.time < limit);",
    replacement: "  return brauchbar.filter(d => d.zeit < grenze);",
    expected: 'Die Aufraeumregel an der Tafel'
  },
  {
    /* NUR NOCH DIE ZAHL -- die Schere faellt weg. Wer an einem Nachmittag
       viermal auf den Knopf drueckt, wirft damit die Kopie vom Vormonat weg,
       obwohl nichts alt ist. */
    nr: '545', name: 'Die Regel kennt nur die Zahl -- die Schere faellt weg',
    file: 'server.js',
    search: "  return usable.slice(keep).filter(d => d.time < limit);",
    replacement: "  return brauchbar.slice(behalten);",
    expected: 'Die Aufraeumregel an der Tafel'
  },
  {
    /* DIE MUSTERPRUEFUNG FAELLT WEG -- und mit ihr die Zusage, um die es in
       dieser Runde am meisten geht: eine fremde Datei im Sicherungsordner wird
       angefasst. Getauscht wird die KONSTANTE und nicht eine der beiden
       Abfragen: nur so faellt sie an BEIDEN Stellen zugleich, und genau das ist
       die Lage, in der `notizen.txt` wirklich verschwindet. */
    nr: '546', name: 'Die Musterpruefung faellt weg -- die fremde Datei faellt mit',
    file: 'server.js',
    search: "const BACKUP_PATTERN = /^kriterion-.+\\.sqlite$/;",
    replacement: "const BACKUP_PATTERN = /./;",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE ZWEITE MUSTERPRUEFUNG, unmittelbar vor dem unlink. Sie ist bei
       heilem Muster keine Verdopplung, sondern die Klemme an der Stelle, an
       der der Fehler wehtut: wer entferneSicherungen() je von woanders her
       ruft, kommt an ihr nicht vorbei. AM VERHALTEN ALLEIN WAERE SIE STUMM --
       die Namen kommen heute aus sicherungsListe() und sind laengst geprueft;
       rot wird deshalb der Waechter ueber den Quelltext. */
    nr: '547', name: 'Die zweite Musterpruefung vor dem unlink faellt weg',
    file: 'server.js',
    search: "    if (short !== String(n) || !BACKUP_PATTERN.test(short)) { stayed.push(short); continue; }",
    replacement: "    if (false) { stayed.push(kurz); continue; }",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* EIN SYMLINK WIRD ZUR SICHERUNG. statSync folgt dem Verweis und meldet
       die Datei am anderen Ende als regulaer; lstatSync sieht den Verweis
       selbst. Der Verweis im Prueflauf zeigt aus dem Ordner heraus -- und sein
       Ziel ist eigens alt, sonst deckte ihn der Boden. */
    nr: '548', name: 'Die Liste folgt dem Symlink statt ihn zu sehen',
    file: 'server.js',
    search: "      const st = fs.lstatSync(path.join(filePath, n));",
    replacement: "      const st = fs.statSync(path.join(pfad, n));",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DASSELBE AM ENTFERNEN. Am Verhalten allein bliebe es stumm, solange die
       Liste darueber heil ist -- rot wird der Waechter ueber den Quelltext,
       und das ist hier die richtige Stelle: die beiden Fragen stehen
       absichtlich zweimal da. */
    nr: '549', name: 'Das Entfernen folgt dem Symlink',
    file: 'server.js',
    search: "      const st = fs.lstatSync(full);",
    replacement: "      const st = fs.statSync(voll);",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DER BODEN ZAEHLT WIEDER ALLE KOPIEN -- Entscheidung 5 faellt. Drei
       Kopien, von denen zwei vor dem Schluesselwechsel entstanden sind, sind in
       Wahrheit eine; wer sie mitzaehlt, raeumt die einzige brauchbare weg. */
    nr: '550', name: 'Der Boden zaehlt auch die veralteten Kopien mit',
    file: 'server.js',
    search: "    .filter(d => changeMs == null || d.time >= changeMs)",
    replacement: "    .filter(() => true)",
    expected: 'Die Aufraeumregel an der Tafel'
  },
  {
    /* NACH EINER GESCHEITERTEN SICHERUNG WIRD DOCH AUFGERAEUMT -- der Aufruf
       wandert vor den Fehlerausgang. Genau das ist die wichtigste Zeile der
       Runde: sonst raeumt die Installation in dem Augenblick auf, in dem sie
       keine neue Kopie zustande bringt. */
    nr: '551', name: 'Nach der gescheiterten Sicherung wird doch aufgeraeumt',
    file: 'server.js',
    search: "  if (fs.existsSync(file))\n    return res.status(409).json({ error: t(localeOf(req), 'server.backupConcurrent')});",
    replacement: "  if (fs.existsSync(datei)) {\n    const r = cleanupStatus();\n    if (r.an) removeBackups(ziel.pfad, ruleHit(backupList(ziel.pfad) || [],\n      r.behalten, r.tage, Date.now(), (changeMark() || {}).ms ?? null).map(d => d.name));\n    return res.status(409).json({ error: t(localeOf(req), 'server.backupConcurrent')});\n  }",
    expected: 'Alte Sicherungen aufraeumen: der Anschluss an die Sicherung'
  },
  {
    /* DAS AUFRAEUMEN REISST DIE GELUNGENE SICHERUNG MIT -- genau der Fehler aus
       0.19.6 (Stolperstein 298): aus einem geglueckten Vorgang wird eine rote
       Message. Der Rueckbau nimmt dem `catch` seine Wirkung UND setzt einen
       Ausgang dahinter; einer von beiden allein bliebe stumm, weil im Prueflauf
       nichts wirft. */
    nr: '552', name: 'Das Aufraeumen reisst die gelungene Sicherung mit',
    file: 'server.js',
    search: "    console.error('[Kriterion] Das Aufräumen nach der Sicherung ist gescheitert:', e.message);\n" +
           "    cleaned = { removed: 0, notDeleted: 0, bytes: 0, failed: true };\n" +
           "  }",
    replacement: "    throw e;\n" +
            "  }\n" +
            "  if (cleaned && cleaned.removed)\n" +
            "    return res.status(500).json({ error: 'Die Sicherung ist gescheitert.' });",
    expected: 'Alte Sicherungen aufraeumen: der Anschluss an die Sicherung'
  },
  {
    /* DER SCHALTER STEHT WIEDER AUF AN, wenn nichts dasteht -- die Abweichung
       von `convertImages` faellt weg. Eine umgewandelte PNG-Datei holt der
       Knopf in der Gegenrichtung zurueck; eine geloeschte Sicherung holt
       nichts zurueck. */
    nr: '553', name: 'Der Schalter steht bei einer frischen Installation auf AN',
    file: 'server.js',
    search: "    an: getSetting('backupCleanup', false) === true,",
    replacement: "    an: getSetting('backupCleanup', true) !== false,",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE GRENZEN HALTEN NICHT MEHR AM SERVER. `min`/`max` im HTML bleibt
       stehen -- und ist eine Bitte, keine Klemme: ein Feld, in das jemand 0
       schreiben kann, ist eine Falle. */
    nr: '554', name: 'Die Grenzen der beiden Werte halten nicht mehr am Server',
    file: 'server.js',
    search: "  if (!Number.isInteger(n) || n < range.min || n > range.max)",
    replacement: "  if (false)",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE VORSCHAU RECHNET MIT ANDEREN WERTEN ALS DAS LOESCHEN -- zwei
       Wahrheiten darueber, was gleich passiert (Stolperstein 47). Die Vorschau
       verliert damit genau das, wofuer es sie gibt. */
    nr: '555', name: 'Die Vorschau rechnet mit einem anderen Boden als das Loeschen',
    file: 'server.js',
    search: "  const matched = ruleHit(files, keep, days, now, mark ? mark.ms : null);",
    replacement: "  const treffer = ruleHit(dateien, Math.max(1, behalten - 1), tage, jetzt,\n" +
            "                               marke ? marke.ms : null);",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE LOESCHROUTE NIMMT EINEN DATEINAMEN ENTGEGEN -- die gefaehrlichste
       Route der Anwendung, und sie waere es auch mit Pruefung: die Pruefung
       stuende einen Handgriff davon entfernt, vergessen zu werden
       (Stolperstein 300). */
    nr: '556', name: 'Die Loeschroute nimmt einen Dateinamen aus dem Rumpf',
    file: 'server.js',
    search: "  const kind = String(req.body?.kind || '');",
    replacement: "  const art = String(req.body?.art || '');\n" +
            "  if (req.body?.datei) {\n" +
            "    const einzeln = removeBackups(ziel.pfad, [req.body.datei]);\n" +
            "    return res.json({ ok: true, art, weg: einzeln.weg, nicht: einzeln.geblieben.length,\n" +
            "                      bytes: einzeln.bytes, ...lastBackup(ziel.pfad) });\n" +
            "  }",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    nr: '557', name: 'Das Aufraeumen laeuft ohne zweite Bestaetigung',
    file: 'server.js',
    search: "app.post('/api/backup/cleanup', ownerOnly,\n" +
           "         secondConfirmNeeded('backup'), (req, res) => {",
    replacement: "app.post('/api/backup/cleanup', ownerOnly, (req, res) => {",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE ROUTE FAELLT AUF nurAdmin. Sie entfernt Dateien vom Dateisystem des
       Wirts und liegt damit in derselben Zeile wie Export, Import und
       Sicherung -- beim Eigentuemer. */
    nr: '558', name: 'Ein gewoehnlicher Admin darf alte Sicherungen entfernen',
    file: 'server.js',
    search: "app.post('/api/backup/cleanup', ownerOnly,\n" +
           "         secondConfirmNeeded('backup'), (req, res) => {",
    replacement: "app.post('/api/backup/cleanup', adminOnly,\n" +
            "         secondConfirmNeeded('backup'), (req, res) => {",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* KEINE ZEILE MEHR IM SICHERHEITSPROTOKOLL. Eine Loeschung, die keine Spur
       hinterlaesst, ist die, nach der hinterher niemand suchen kann. */
    nr: '559', name: 'Die entfernten Kopien stehen in keinem Protokoll mehr',
    file: 'server.js',
    search: "  for (let i = 0; i < number; i++) auth.log('backup.delete', { actor });",
    replacement: "  for (let i = 0; i < 0; i++) auth.log('backup.delete', { wer });",
    expected: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DER VORGANG FAELLT AUS DER GRUPPE `inventory`. Er stuende dann unter keiner
       Ansicht des Filters -- ausser unter "alle", und dort sucht ihn niemand. */
    nr: '560', name: 'Der Vorgang sicherung.weg steht in keiner Gruppe',
    file: 'auth.js',
    search: "  inventory: ['export', 'import', 'backup', 'backup.delete', 'key']",
    replacement: "  bestand: ['export', 'import', 'backup', 'key']",
    expected: 'Das Sicherheitsprotokoll: die Gruppen des Filters'
  },
  {
    /* DIE ZWANZIGSTE KARTE FAELLT WEG. Ohne sie gibt es die Bedienung gar
       nicht -- der Schalter, die beiden Felder, die Vorschau und beide
       Knoepfe stehen darauf. */
    nr: '561', name: 'Die Karte „Alte Sicherungen" faellt aus dem Systembereich',
    file: 'public/app.js',
    search: "  { key: 'aufraeumen',   section: 'database', visible: () => OWNER,\n" +
           "    markup: cardCleanup,   wireUp: setUpCleanupOut },",
    replacement: "",
    expected: 'Der Systembereich nach Rolle'
  },
  {
    /* SIE STEHT BEIM ADMIN STATT BEIM EIGENTUEMER -- dieselbe Klemme wie die
       Karte "Sicherung" daneben faellt damit weg. */
    nr: '562', name: 'Die Karte „Alte Sicherungen" steht schon beim Admin',
    file: 'public/app.js',
    search: "  { key: 'aufraeumen',   section: 'database', visible: () => OWNER,",
    replacement: "  { key: 'aufraeumen',   section: 'database', sichtbar: () => ADMIN,",
    expected: 'Der Systembereich nach Rolle'
  },
  {
    /* DIE VORSCHAU RECHNET NICHT MEHR NEU. Wer die Zahl von 3 auf 1 stellt,
       sieht dann nicht mehr, was das kostet -- und die Karte zeigt eine
       Vorschau zu Werten, die gar nicht mehr dastehen. */
    nr: '563', name: 'Eine Aenderung am Feld rechnet die Vorschau nicht neu',
    file: 'public/app.js',
    search: "        el.oninput = previewNew;",
    replacement: "        el.oninput = null;",
    expected: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE KARTE SCHICKT DIE DATEINAMEN MIT. Der Server nimmt sie nicht
       entgegen -- aber eine Oberflaeche, die sie schickt, ist der erste
       Handgriff zu einer Route, die sie liest. */
    nr: '564', name: 'Die Karte schickt die Dateinamen an die Loeschroute mit',
    file: 'public/app.js',
    search: "      try { r = await api('POST', '/api/backup/cleanup', { kind }); }",
    replacement: "      try { r = await api('POST', '/api/backup/cleanup',\n" +
            "        { art, dateien: (a.treffer || []).map(t => t.datei) }); }",
    expected: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DER KNOPF IST AUCH DANN BEDIENBAR, WENN DIE REGEL NICHTS TRIFFT. Ein
       Knopf, der zuverlaessig nichts tut, sieht aus wie ein Fehler. */
    nr: '565', name: 'Der Knopf ist auch ohne Treffer bedienbar',
    file: 'public/app.js',
    // MITGEGANGEN mit 0.20.1 (Stolperstein 201): der Knopf heisst jetzt „Jetzt
    // loeschen" statt „Regel jetzt anwenden". Die Zusage ist unveraendert.
    search: "id=\"cleanup-run\"${matched.length ? '' : ' disabled'}>${tH('card.deleteNow')}",
    replacement: "id=\"cleanup-run\">${tH('card.deleteNow')}",
    expected: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE LISTE VERLIERT DEN GEMEINSAMEN DECKEL. Ein Ordner mit vierzig Kopien
       zieht die Seite auf -- zehn Zeilen sind das Mass jeder Liste im
       Systembereich, seit 0.17.3. */
    nr: '566', name: 'Die Sicherungsliste bekommt keinen Deckel',
    file: 'public/style.css',
    /* MITGEGANGEN mit 0.20.1 (Stolperstein 201) -- UND IN EINE ANDERE DATEI
       GEWANDERT. Bis 0.20.0 nahm er der Liste ihre Klasse in `public/app.js`;
       seit 0.20.1 hat sie ihren EIGENEN Deckel von fuenf Zeilen als Regel im
       Stilblatt, und die ist die Sache. Die Zusage ist dieselbe geblieben:
       eine Liste ohne Deckel zieht die Karte auf. */
    search: '#cleanup-list { flex: none; max-height: 13.98rem; }',
    replacement: '#cleanup-list { flex: none; }',
    expected: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE LISTE FAELLT GANZ WEG -- und mit ihr die Auskunft, um die es im
       Feldbefund zu 0.20.0 ueberhaupt ging: welche Sicherungen liegen da, wie
       alt und wie gross. Die Zahl in der Ueberschrift bleibt stehen; ohne die
       Zeilen ist sie eine Behauptung. */
    nr: '567', name: 'Die Karte listet die Sicherungen nicht mehr',
    file: 'public/app.js',
    search: '           <div class="manage-list" id="cleanup-list">${all.map(row).join(\'\')}</div>`',
    replacement: '           <div class="manage-list" id="cleanup-list"></div>`',
    expected: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE NUMMER LAEUFT VON DER AELTESTEN AN. Damit steht die juengste Kopie
       als letzte Nummer da, und „mindestens 3 behalten" liesse sich an der
       Liste nicht mehr ablesen -- was faellt, stuende dann ganz oben. */
    nr: '568', name: 'Die Nummern laufen von der aeltesten zur juengsten',
    file: 'server.js',
    search: '      ...cleanupRow(d, now), nr: i + 1,',
    replacement: '      ...cleanupRow(d, jetzt), nr: dateien.length - i,',
    expected: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE MARKE „LOESCHEN" FAELLT VON DER ZEILE. Die Liste sagt dann, was
       daliegt, aber nicht mehr, was gleich fehlt -- und die Karte hat ausser
       der Summenzeile nichts, was auf eine bestimmte Kopie zeigt. */
    nr: '569', name: 'Die Zeilen sagen nicht mehr, welche geloescht wird',
    file: 'public/app.js',
    search: "      const mark = z.affected ? `<span class=\"cleanup-badge remove\">${tH('card.deleteLower')}</span>`",
    replacement: "      const marke = z.faellt ? ''",
    expected: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },

  /* ---- 0.21.0: zwei Kaesten, zwei Durchschnitte ---- */
  {
    /* DIE PHASE FAELLT AUS DEM GROUP BY DER GEBUENDELTEN ABFRAGE.
       ERSTER ANLAUF WAR DIESER RUECKBAU ALS DER ZUR ZENTRALEN ZUSAGE GEDACHT
       -- mit der Begruendung, beide Kaesten stuenden dann wieder in EINER
       Menge. DAS IST FALSCH, und die Gegenprobe hat es gezeigt: 571, derselbe
       Griff an der zweiten Fassung, kam STUMM zurueck. Nachgemessen an einem
       eigens gebauten Bestand (fuenf Kriterien in beiden Phasen, drei Bewerter
       je Kriterium) kommen mit und ohne diese Spalte im GROUP BY Zeile fuer
       Zeile DIESELBEN Werte heraus: `criterion_id` bestimmt die Phase
       eindeutig, also teilt die Spalte keine Gruppe und legt keine zusammen.
       Die Trennung haengt am SELECT -- das sind die Rueckbauten 602 und 603.
       WARUM DIE ZEILE TROTZDEM STEHT UND DIESER RUECKBAU BLEIBT: eine blosse
       Spalte neben einem Aggregat ist eine Freundlichkeit von SQLite und kein
       SQL. Die Zeile haelt die Abfrage vollstaendig, damit sie es bleibt, wenn
       jemand sie anderswohin traegt. AM VERHALTEN WAERE SIE STUMM -- rot wird
       deshalb der Waechter ueber den Quelltext, dieselbe Bauform wie beim
       zweiten Musterwaechter von 0.20.0 (Rueckbau 547). */
    nr: '570', name: 'Der Gesamtschnitt der Uebersicht kennt die Phase nicht mehr',
    file: 'server.js',
    search: '   GROUP BY r.item_id, r.criterion_id, c.weight, c.phase`);',
    replacement: '   GROUP BY r.item_id, r.criterion_id, c.weight`);',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DASSELBE AM EINZELNEN EINTRAG. Zwei Fassungen derselben Abfrage, zwei
       Rueckbauten -- faellt nur einer, blieben Uebersicht und Detail
       verschiedener Meinung, und genau das soll auffallen.
       DIESER HIER IST DER, DER STUMM ZURUECKKAM und die Messung ausgeloest
       hat; die Begruendung steht eine Nummer hoeher. */
    nr: '571', name: 'Der Gesamtschnitt des Eintrags kennt die Phase nicht mehr',
    file: 'server.js',
    search: '   GROUP BY r.criterion_id, c.weight, c.phase`);',
    replacement: '   GROUP BY r.criterion_id, c.weight`);',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE ZWEITE KOPFZAHL FAELLT AUS DER ANTWORT. Der Kasten stuende dann da
       und wuesste seine eigene Zahl nicht -- und die Kachel eines ungetesteten
       Eintrags zeigte nichts. */
    nr: '572', name: 'potenzialRating faellt aus der Uebersicht',
    file: 'server.js',
    search: '    it.potentialRating = totalAverage(boxes.before);',
    replacement: '    it.potenzialRating = null;',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DER ZWEITE RECHENWEG FAELLT. Die Kopfzahl bliebe richtig, die Erklaerung
       dahinter leer -- genau die Lage, in der eine Zahl dasteht und niemand
       nachsehen kann, wie sie zustande kommt (Stolperstein 217). */
    nr: '573', name: 'Der Rechenweg des Potenzials faellt aus der Antwort',
    file: 'server.js',
    search: '  it.potentialCalc = { ...potentialCalc, result: it.potentialRating };',
    replacement: '  void potenzialRechenweg;',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE PHASE FAELLT VON DER STERNZEILE. Der Browser koennte dann nicht mehr
       nach Kaesten teilen, und beide Kaesten zeigten alle Zeilen. */
    nr: '574', name: 'Die Sternzeilen des Details tragen ihre Phase nicht mehr',
    file: 'server.js',
    search: '    SELECT c.id AS criterion_id, c.name, c.weight, c.phase, COALESCE(r.value, 0) AS value',
    replacement: '    SELECT c.id AS criterion_id, c.name, c.weight, COALESCE(r.value, 0) AS value',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE ABSAGE BEIM ANLEGEN FAELLT: jeder Unfug landete dann in der Spalte,
       und das Kriterium stuende in KEINEM der beiden Kaesten -- die Sterne
       daran zaehlten nirgends mit, ohne dass es jemand saehe. */
    nr: '575', name: 'POST /api/criteria nimmt jede Phase an',
    file: 'server.js',
    search: "  if (!PHASES.includes(phase))",
    replacement: "  if (false)",
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DER KASTEN LAESST SICH DOCH WECHSELN -- still, ueber ein uebergangenes
       Feld. Genau das ist der Fall, den die Absage verhindert: ein
       uebergangenes Feld sieht fuer den Aufrufer aus wie ein gesetztes. */
    nr: '576', name: 'PUT /api/criteria/:id uebergeht die Phase stillschweigend',
    file: 'server.js',
    search: "  if (req.body.phase !== undefined)",
    replacement: "  if (false)",
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DAS DRITTE FELD FAELLT AUS DER EXPORTDATEI. Eine Datei mit
       Vorher-Kriterien spielte sich dann als lauter Bewertungskriterien ein --
       und die Sterne landeten im falschen Durchschnitt. */
    nr: '577', name: 'Der Export nennt die Kaesten nicht mehr',
    file: 'server.js',
    search: "  for (const c of critRows) if (c.phase !== 'after') criteriaPhase[c.name] = c.phase;",
    replacement: '  void criteriaPhase;',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE ABSAGE BEIM EINSPIELEN FAELLT. Ein Kriterium, das hier im einen und
       in der Datei im anderen Kasten steht, wuerde dann still in den
       vorhandenen eingespielt: die Datei sagte etwas anderes als die
       Installation, und niemand saehe es. */
    nr: '578', name: 'Der Import spielt ueber die Kaesten hinweg ein',
    file: 'server.js',
    search: '  if (conflicts.length) {',
    replacement: '  if (false) {',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE PHASE FAELLT AUS DER KRITERIENLISTE. Die zweite Systemkarte fand
       ihre Zeilen dann nicht mehr, und die Oberflaeche koennte die beiden
       Kaesten nicht auseinanderhalten. */
    nr: '579', name: 'GET /api/criteria liefert die Phase nicht mehr',
    file: 'server.js',
    search: '  SELECT c.id, c.name, c.language, c.sort_order, c.weight, c.phase, c.created_at,',
    replacement: '  SELECT c.id, c.name, c.language, c.sort_order, c.weight, c.created_at,',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE SPALTE BEKOMMT EINE ANDERE VORGABE. Der Bestand stuende nach dem
       Einspielen im Kasten „before", und saemtliche Gesamtschnitte waeren
       still weg -- der teuerste denkbare Fehler dieser Runde. */
    nr: '580', name: 'Die Migration stellt den Bestand auf vorher',
    file: 'db.js',
    search: '  db.exec("ALTER TABLE rating_criteria ADD COLUMN phase TEXT NOT NULL DEFAULT \'after\'");',
    replacement: '  db.exec("ALTER TABLE rating_criteria ADD COLUMN phase TEXT NOT NULL DEFAULT \'before\'");',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DER MIGRATIONSBLOCK LAEUFT NICHT MEHR. Eine Datenbank aus 0.20.1 traegt
       die Spalte nicht -- CREATE TABLE IF NOT EXISTS ruehrt eine vorhandene
       Tabelle nicht an (Stolperstein 13) --, und die Installation kaeme nicht
       hoch. */
    nr: '581', name: 'Der Migrationsblock 0.21.0 wird nicht mehr gerufen',
    file: 'db.js',
    search: '\nmigration0210();',
    replacement: '\n// migration0210();',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE BEIDEN STERNKAESTEN FUEHREN IHREN EINKLAPPZUSTAND WIEDER IN `zu`.
       Damit gaelte ein Klick an EINEM Eintrag fuer ALLE -- genau die Reichweite,
       die diese Runde ihnen nimmt. */
    nr: '582', name: 'Die Sternkaesten speichern ihren Einklappzustand wieder',
    file: 'server.js',
    search: "const CLOSED_BLOCKS = ALL_BLOCKS.filter(k => !BLOCKS_ALWAYS_OPEN.includes(k));",
    replacement: "const CLOSED_BLOCKS = ALL_BLOCKS;",
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },

  /* ---- 0.21.0: die Sternzeile ---- */
  {
    /* DAS × VERLIERT SEINEN PLATZ, WENN ES UNSICHTBAR IST. `hidden` ist
       `display: none`; damit rutschten die Sterne beim ERSTEN Stern nach links
       -- genau der Sprung, den dieselbe Runde eine Spalte weiter abschafft. */
    nr: '583', name: 'Das × verschwindet mit seinem Platz statt nur mit seiner Farbe',
    file: 'public/app.js',
    search: "  z.className = 'rreset' + (value > 0 ? '' : ' blank');",
    replacement: "  z.className = 'rzurueck'; if (!(value > 0)) z.hidden = true;",
    expected: "Die Sternzeile — 0.22.0"
  },
  {
    /* DAS × STEHT AN JEDER STERNREIHE, auch an denen ohne Ruecksetzer -- die
       Testtage und jede Lesestelle. Ein Kreuz, das nichts tut, ist schlimmer
       als keins. */
    nr: '584', name: 'Das × steht auch an einer Sternreihe ohne Ruecksetzer',
    file: 'public/app.js',
    search: "  w.addEventListener('click', e => { if (e.target.dataset.v) onPick(+e.target.dataset.v); });\n  return w;\n}",
    replacement: "  w.addEventListener('click', e => { if (e.target.dataset.v) onPick(+e.target.dataset.v); });\n  w.appendChild(zuruecksetzKnopf(value, () => onPick(0)));\n  return w;\n}",
    expected: "Die Sternzeile — 0.22.0"
  },
  {
    /* DIE LEERE DURCHSCHNITTSZELLE IST WIEDER LEER. Der Strich faellt, und mit
       ihm die Auskunft „noch niemand". */
    nr: '585', name: 'Die leere Durchschnittszelle zeigt wieder gar nichts',
    file: 'public/app.js',
    search: "          a.textContent = '–';\n          a.title = t('entry.notRatedYet');",
    replacement: "          a.textContent = '';",
    expected: 'Die Sternzeile — 0.21.0'
  },
  {
    /* DIE MINDESTBREITE FAELLT WIEDER WEG. Solange niemand bewertet hat, ist
       die Spalte null Pixel breit, und der erste Stern laesst sie aufgehen --
       alle Sternzeilen rutschen nach links, unter dem Finger. */
    nr: '586', name: 'Die Durchschnittsspalte verliert ihre Mindestbreite wieder',
    file: 'public/style.css',
    search: '  min-width: calc(4.34rem + 9px);\n  display: flex; align-items: center; justify-content: flex-end;',
    replacement: '  display: flex; align-items: center; justify-content: flex-end;',
    expected: 'Die Sternzeile — 0.21.0'
  },

  /* ---- 0.21.0: die Oberflaeche der beiden Kaesten ---- */
  {
    /* DER ZWEITE BLOCK STEHT HINTER DEM ERSTEN statt davor. Geschaetzt wird,
       BEVOR bewertet wird, und die Anordnung sagt es -- an einer neuen Idee
       stuende sonst der leere Bewertungskasten oben. */
    nr: '587', name: 'Der Potenzialblock steht hinter der Bewertung',
    file: 'public/app.js',
    search: "  side: ['kategorie', 'tags', 'potenzial', 'bewertung'],",
    replacement: "  side: ['kategorie', 'tags', 'bewertung', 'potenzial'],",
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER ZEICHNER FILTERT NICHT MEHR. Beide Kaesten zeigten dann ALLE Zeilen
       -- dieselbe Sternzeile zweimal, in zwei Kaesten, mit zwei verschiedenen
       Kopfzahlen darueber. */
    nr: '588', name: 'Der Zeichner zeigt in beiden Kaesten alle Zeilen',
    file: 'public/app.js',
    search: '    const rows = item.ratings.filter(r => r.phase === boxId.phase);',
    replacement: '    const zeilen = item.ratings;',
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER EINKLAPPZUSTAND FOLGT WIEDER DER EINSTELLUNG STATT DEM ZUSTAND.
       An einer neuen Idee stuende der Bewertungskasten offen und das Potenzial
       zu -- genau verkehrt herum. */
    nr: '589', name: 'Die Sternkaesten folgen wieder der gespeicherten Einstellung',
    file: 'public/app.js',
    search: '    const afterState = BLOCKS_ALWAYS_OPEN.includes(name);',
    replacement: '    const afterState = false;',
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* VORHANDENE DATEN SCHLAGEN DIE REGEL NICHT MEHR. Ein ungetesteter Eintrag
       aus alten Zeiten mit Bewertungssternen zeigte sie dann nicht -- etwas,
       das jemand eingetragen hat, waere versteckt. */
    nr: '590', name: 'Bewertungssterne an einem ungetesteten Eintrag bleiben zugeklappt',
    file: 'public/app.js',
    search: "  return !item.tested && !hasStars(item, 'after');",
    replacement: '  return !item.tested;',
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER KLICK AUF DEN KOPF SPEICHERT WIEDER. Damit gaelte ein Blick an EINEM
       Eintrag fuer ALLE, und beim naechsten Eintrag stuende der falsche Kasten
       offen -- ohne dass jemand wuesste, warum. */
    nr: '591', name: 'Ein Klick auf den Kastenkopf speichert wieder',
    file: 'public/app.js',
    search: '        if (GLANCE.has(name)) GLANCE.delete(name); else GLANCE.add(name);',
    replacement: "        BLOECKE.zu = zu ? BLOECKE.zu.filter(k => k !== name) : [...BLOECKE.zu, name];\n        saveBlocks();",
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER SCHALTER LEERT DEN BLICK NICHT MEHR. Nach dem Umlegen von „Getestet"
       stuende der Kasten offen, den man vorher aufgeklappt hatte -- der Klick
       auf den Schalter saehe aus, als haette er nichts getan. */
    nr: '592', name: 'Der Schalter „Getestet" leert den Blick nicht mehr',
    file: 'public/app.js',
    search: '      GLANCE.clear();\n      drawSwitches(); drawTestDays(); drawRatings();',
    replacement: '      drawSwitches(); drawTestDays(); drawRatings();',
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER BLICK GILT UEBER EINTRAEGE HINWEG. Er ist dann doch eine
       Einstellung, nur eine, die niemand speichert -- die schlechteste
       Mischung aus beidem. */
    nr: '593', name: 'Der Blick ueberlebt den Wechsel des Eintrags',
    file: 'public/app.js',
    search: '  GLANCE.clear();\n  /* DER BEGRIFF KOMMT AUS DER ADRESSE ODER AUS DEM ZUSTAND',
    replacement: '  /* DER BEGRIFF KOMMT AUS DER ADRESSE ODER AUS DEM ZUSTAND',
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DIE KACHEL ZEIGT AN EINEM UNGETESTETEN EINTRAG WIEDER DIE BEWERTUNG.
       Damit stuende dort „★ –" statt „◆ 4,2", und das Sortieren nach Potenzial
       haette keine sichtbare Entsprechung. */
    nr: '594', name: 'Die Kachel zeigt an einer Idee wieder die Bewertung',
    file: 'public/app.js',
    search: "  const value = potential ? it.potentialRating : it.avgRating;",
    replacement: '  const wert = it.avgRating;',
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DAS ZEICHEN IST WIEDER DER STERN. Dann hielte jemand 4,2 Potenzial fuer
       4,2 Qualitaet -- und die Kachel saehe an einer Idee genauso aus wie an
       einem geprueften Eintrag. */
    nr: '595', name: 'Das Potenzial traegt auf der Kachel wieder den Stern',
    file: 'public/app.js',
    search: "  const char = potential ? '◆' : '★';",
    replacement: "  const zeichen = '★';",
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DIE SORTIERUNG NACH POTENZIAL STELLT EINTRAEGE OHNE ZAHL NACH VORN.
       In der Richtung „niedrig → hoch" stuenden dann lauter Eintraege ohne
       Einschaetzung oben -- die Ansicht „Als Naechstes" waere unbrauchbar. */
    nr: '596', name: 'Eintraege ohne Potenzialzahl stehen in einer Richtung vorn',
    file: 'public/app.js',
    search: "      case 'potential_asc':  return (a.potentialRating ?? 99) - (b.potentialRating ?? 99);",
    replacement: "      case 'potential_asc':  return (a.potenzialRating ?? 0) - (b.potenzialRating ?? 0);",
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DIE ZWEITE SYSTEMKARTE ZEIGT DIE KRITERIEN DES ANDEREN KASTENS. Beide
       Karten zeigten dann dieselbe Liste, und wer im Potenzialkasten anlegt,
       saehe sein Kriterium in beiden.
       MITGEGANGEN MIT 0.25.1 (Stolperstein 201). Bis 0.25.0 stand der
       Phasenfilter im Ruf von `manageList()`; seit 0.25.1 teilen sich Liste
       UND Pillenreihe denselben Ausdruck (`critRows()`), und den Filter gibt
       es nur noch dort. Der Rueckbau zielt jetzt darauf -- und nimmt damit
       beiden zugleich die Trennung, was mehr rot macht als vorher und
       dieselbe Sache belegt. */
    nr: '597', name: 'Die zweite Kriterienkarte filtert nicht nach Phase',
    file: 'public/app.js',
    search: "function critRows(fetched, phase) {\n" +
      "  return namesFrom(fetched, 'crits').filter(c => c.phase === phase);\n}",
    replacement: "function critRows(fetched, phase) {\n" +
      "  return namesFrom(fetched, 'crits');\n}",
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DIE KARTE SCHICKT DIE PHASE NICHT MIT. Was in der Potenzialkarte
       angelegt wird, landete als Bewertungskriterium -- der Server hat die
       Vorgabe 'after'. */
    nr: '598', name: 'Die zweite Kriterienkarte legt im falschen Kasten an',
    file: 'public/app.js',
    search: "      try { await api('POST', '/api/criteria', { name, phase }); critField.value = '';",
    replacement: "      try { await api('POST', '/api/criteria', { name }); critField.value = '';",
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER VERGLEICH MISCHT DIE BEIDEN KAESTEN WIEDER. `eigenerSchnitt()`
       rechnete dann in der Stellung „meine" ueber beide Mengen -- die eine
       zweite Rechenstelle im Browser waere genau die, die es nicht geben
       darf. */
    nr: '599', name: 'Der eigene Schnitt im Vergleich mischt die Kaesten',
    file: 'public/app.js',
    search: "      if (r.phase !== phase) continue;",
    replacement: "      if (false) continue;",
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DAS WORT KOMMT NICHT MEHR AUS DEM VOKABULAR. Wer „Erwartung" einstellt,
       saehe im Blockkopf weiter „Potenzial" -- das Wort stuende wieder im
       Quelltext. */
    nr: '600', name: 'Der Blockkopf traegt das Wort aus dem Quelltext',
    file: 'public/app.js',
    search: "<div class=\"block-head\"><span class=\"label\">${esc(V.potential)}</span>",
    replacement: '<div class="block-head"><span class="label">Potenzial</span>',
    expected: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },

  {
    /* DIE ZWEITE VORGABELISTE VERLIERT DAS NEUE WORT. `public/app.js` fuehrt
       eine eigene Vorgabe des Vokabulars -- damit die Oberflaeche schon VOR
       dem ersten Abruf beschriftet ist. Fehlt dort ein Wort, steht das Feld in
       der Vokabularkarte leer, solange der gespeicherte Satz es nicht nennt.
       GENAU DAS IST BEIM BAUEN VON 0.21.0 PASSIERT, und der Pruefstand hat es
       gefunden -- an der Lage mit dem unvollstaendigen eigenen Vokabular. */
    nr: '601', name: 'Die Vorgabe der Oberflaeche kennt das neue Wort nicht',
    file: 'public/languages/de.json',
    search: "\"vocabulary.potential\":",
    replacement: "\"vocabulary.potenzialWeg\":",
    expected: 'Oberflaeche mit eigenem Vokabular'
  },
  {
    /* HIER HAENGT DIE ZENTRALE ZUSAGE DIESER RUNDE -- am SELECT und nicht am
       GROUP BY. Faellt `c.phase` aus der Spaltenliste, kommt die Schnittzeile
       ohne Phase an; karteJePhase() legt sie in KEINEN der beiden Kaesten
       (`box[undefined]` gibt es nicht), und beide Durchschnitte fallen auf
       null. Die Kachel zeigte dann an jedem Eintrag gar keine Zahl mehr.
       NACHGETRAGEN NACH DER GEGENPROBE: die Runde hatte fuer diese beiden
       Abfragen nur den Griff ans GROUP BY, und der ist am Verhalten stumm
       (Rueckbauten 570 und 571). Ein Rueckbau, der die Zusage wirklich
       herausnimmt, fehlte -- er steht jetzt hier. */
    nr: '602', name: 'Die gebuendelte Abfrage waehlt die Phase nicht mehr aus',
    file: 'server.js',
    search: '  SELECT r.item_id, r.criterion_id, AVG(r.value * 1.0) AS average, COUNT(*) AS count,\n' +
           '         c.weight, c.phase\n',
    replacement: '  SELECT r.item_id, r.criterion_id, AVG(r.value * 1.0) AS average, COUNT(*) AS count,\n' +
            '         c.weight\n',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DASSELBE AN DER FASSUNG DES EINZELNEN EINTRAGS. Zwei Fassungen, zwei
       Rueckbauten: faellt nur einer, blieben Uebersicht und Detail
       verschiedener Meinung -- und ein Eintrag zeigte in der Liste zwei Zahlen
       und aufgeschlagen keine. */
    nr: '603', name: 'Die Abfrage des Eintrags waehlt die Phase nicht mehr aus',
    file: 'server.js',
    search: '  SELECT r.criterion_id, AVG(r.value * 1.0) AS average, COUNT(*) AS count,\n' +
           '         c.weight, c.phase\n',
    replacement: '  SELECT r.criterion_id, AVG(r.value * 1.0) AS average, COUNT(*) AS count,\n' +
            '         c.weight\n',
    expected: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DER TREIBER SIEHT NICHT MEHR NACH, OB FREMDE SERVER LAUFEN. Genau die
       Lage, aus der dieser Waechter entstanden ist: sieben Server aus
       abgebrochenen Laeufen an den Ports 6180 bis 6242, Spur 0 faehrt ohne
       Versatz dagegen, und die Tabelle zeigt einen stummen Rueckbau als
       greifenden. EINE FALSCHE TABELLE IST SCHLIMMER ALS GAR KEINE. */
    /* NACHGEZOGEN MIT 0.30.0: der Treiber sieht seither ZWEIMAL nach -- ueber
       die Befehlszeile und ueber die Ports (F7). Der Suchtext von 0.21.0 stand
       nicht mehr da, und ein Rueckbau, dessen Suchtext fehlt, ist ein Fund
       ueber die Liste und kein Fund ueber den Baum. */
    nr: '604', name: 'Der Treiber faehrt los, ohne nach fremden Servern zu sehen',
    file: 'counterproof.js',
    search: '  const foreign = foreignServer();\n  const busy = foreignPort(foreign.map(f => f.port));\n  if (foreign.length || busy.length) {',
    replacement: '  const foreign = [];\n  const busy = [];\n  if (false) {',
    expected: 'Die Gegenproben greifen'
  },
  {
    /* UND DIE SUCHE SELBST FINDET NUR NOCH EINEN DER BEIDEN NAMEN. Ein
       liegengebliebener PRUEFLAUF belegt genauso Ports wie ein liegen-
       gebliebener Server -- er startet ja welche. */
    /* NACHGEZOGEN MIT 0.30.0, UND ZWAR AUF DEN BEFUND SELBST: der Rueckbau
       setzt den Namen zurueck, der von 0.21.0 bis 0.30.0 dort stand --
       `pruefung.js`, eine Datei, die es in diesem Repository nie gegeben hat.
       ER MUSS JETZT ZWEI ZUSAGEN ROT MACHEN: die, die den Quelltext liest,
       und die, die einen ECHTEN `node testbench.js` startet und wiederfindet.
       Bis 0.30.0 gab es nur die erste -- und sie hat den Namen abgeschrieben,
       den der Ausdruck trug. */
    nr: '605', name: 'Die Suche nach fremden Servern kennt den Prueflauf nicht mehr',
    file: 'counterproof.js',
    search: "    const script = parts.find(t => /(^|\\/)(server|testbench)\\.js$/.test(t));",
    replacement: "    const script = parts.find(t => /(^|\\/)(server|pruefung)\\.js$/.test(t));",
    expected: 'Der Waechter erkennt den Prueflauf — 0.30.0'
  },

  /* ---- 0.21.1: die Sortierung gibt den Status vor ---- */
  {
    /* DIE TABELLE IST DIE GANZE ENTSCHEIDUNG. Ohne sie leitet keine Sortierung
       mehr etwas ab, und die Runde ist wirkungslos -- die Liste sieht
       aus wie vor 0.21.1. */
    nr: '606', name: 'Keine Sortierung gibt mehr einen Status vor',
    file: 'public/app.js',
    search: "const SORT_STATUS = {\n" +
           "  rating_desc: 'tested',      rating_asc: 'tested',\n" +
           "  potential_desc: 'untested', potential_asc: 'untested'\n" +
           "};",
    replacement: "const SORT_STATUS = {};",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* NUR DIE HAELFTE DER TABELLE. Ohne diesen Rueckbau bliebe gruen, wer nur
       die Bewertungsseite baut -- die Potenzialseite ist die, aus der der
       Befund ueberhaupt kam. */
    nr: '607', name: 'Nur die Bewertung gibt vor, das Potenzial nicht mehr',
    file: 'public/app.js',
    search: "  potential_desc: 'untested', potential_asc: 'untested'\n",
    replacement: "",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* UND DIE GEGENRICHTUNG: eine Sortierung, die ausdruecklich NICHT koppeln
       soll, koppelt doch. Ein Titel sagt nichts ueber den Teststatus. */
    nr: '608', name: 'Die Titelsortierung koppelt mit',
    file: 'public/app.js',
    search: "const SORT_STATUS = {\n",
    replacement: "const SORT_STATUS = {\n  title_asc: 'tested',\n",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE VERLAUFSSORTIERUNGEN SIND AUSDRUECKLICH DRAUSSEN (Abschnitt 5 des
       Auftrags). Sie setzen „getestet" logisch genauso voraus, sind aber eine
       eigene Gruppe im Auswahlfeld -- diese Runde fasst zwei Gruppen an, nicht
       drei. Ohne diesen Rueckbau waere das eine Behauptung im Kommentar. */
    nr: '609', name: 'Die Verlaufssortierungen koppeln mit',
    file: 'public/app.js',
    search: "const SORT_STATUS = {\n  rating_desc:",
    replacement: "const SORT_STATUS = {\n  testavg_desc: 'tested', testavg_asc: 'tested',\n  tests_desc: 'tested', tests_asc: 'tested',\n  rating_desc:",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE LISTE LIEST WIEDER UNMITTELBAR DIE GEWAEHLTE STELLUNG. Die eine
       Lesestelle faellt damit weg, und die ganze Ableitung wirkt nirgends
       mehr -- der groesste Rueckbau dieser Runde. */
    nr: '610', name: 'Die Liste liest die Ableitung nicht mehr',
    file: 'public/app.js',
    search: "  const status = statusEffective(f);",
    replacement: "  const status = f.tested;",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE HANDWAHL WIRD NICHT MEHR GEMERKT. Der Klick stellt zwar `tested`,
       aber die Ableitung schlaegt ihn beim naechsten Zeichnen sofort wieder --
       genau der Kreis, aus dem niemand mehr herauskaeme (Stolperstein 312). */
    nr: '611', name: 'Ein Klick auf eine Statuspille gilt nicht mehr als Handwahl',
    file: 'public/app.js',
    search: "    b.onclick = () => { f.tested = v; STATUS_BY_HAND = true; redraw(); };",
    replacement: "    b.onclick = () => { f.tested = v; redraw(); };",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE RANGORDNUNG KIPPT: die Ableitung fragt nicht mehr, ob jemand
       gewaehlt hat, und schlaegt damit JEDE ausdrueckliche Wahl -- die
       Handwahl, die gespeicherte Ansicht und den Ruecksetzer zugleich. */
    nr: '612', name: 'Die Ableitung schlaegt die Handwahl statt umgekehrt',
    file: 'public/app.js',
    search: "const statusOutSort = (sort) => STATUS_BY_HAND ? null : defaultClosed(sort);",
    replacement: "const statusOutSort = (sort) => vorgabeZu(sort);",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE ABLEITUNG SCHREIBT SICH IN state.filters -- der Rueckbau, den der
       Auftrag ausdruecklich verlangt. Er macht aus einem Blick eine
       Einstellung: was hier hineinlaeuft, faehrt durch saveFilters() an
       PUT /api/settings hinaus, und nach dem Neuladen stuende ein Filter da,
       den niemand gesetzt hat (Stolperstein 304 von der anderen Seite).
       ER MUSS ROT WERDEN, sonst ist Regel 3 nicht baulich, sondern behauptet. */
    /* MITGEZOGEN MIT 0.28.1 (Stolperstein 201): seit der Richtungstrennung
       setzt der Behandler nicht mehr `sel.value` unmittelbar, sondern legt die
       Lage in `applySort()` zusammen. Der Rueckbau zielt auf dieselbe Sache --
       die Ableitung des Status wird mitgespeichert, statt abgeleitet zu
       bleiben. */
    nr: '613', name: 'Die Ableitung wird mitgespeichert',
    file: 'public/app.js',
    search: "  const applySort = () => { f.sort = picked.base.key + (picked.asc ? '_asc' : '_desc'); redraw(); };",
    replacement: "  const applySort = () => { f.sort = picked.base.key + (picked.asc ? '_asc' : '_desc');\n" +
            "    f.tested = statusOutSort(f.sort) || f.tested; redraw(); };",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE LEISTE WIRD BEIM WECHSEL DER SORTIERUNG NICHT MEHR MITGEZEICHNET --
       der Stand vor 0.21.1, als eine Sortierung nur ordnete. Die Liste zeigt
       dann schon die neue Menge, waehrend die Pillen darueber die alte
       Stellung behaupten. */
    /* MITGEZOGEN MIT 0.28.1 (Stolperstein 201) -- dieselbe Zeile wie 613. */
    nr: '614', name: 'Der Wechsel der Sortierung zeichnet nur noch die Liste',
    file: 'public/app.js',
    search: "  const applySort = () => { f.sort = picked.base.key + (picked.asc ? '_asc' : '_desc'); redraw(); };",
    replacement: "  const applySort = () => { f.sort = picked.base.key + (picked.asc ? '_asc' : '_desc'); saveFilters(); drawBody(); };",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* EINE GESPEICHERTE ANSICHT IST KEINE AUSDRUECKLICHE WAHL MEHR. Wer
       „Potenzial" und „alles anzeigen" zusammen gespeichert hat, bekommt sie
       nicht mehr zurueck -- und genau das darf ein PATCH nicht tun. */
    nr: '615', name: 'Eine gespeicherte Ansicht schlaegt die Ableitung nicht mehr',
    file: 'public/app.js',
    search: "  STATUS_BY_HAND = true;\n  state.search = typeof a.q === 'string' ? a.q : '';",
    replacement: "  state.search = typeof a.q === 'string' ? a.q : '';",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DER WEG ZURUECK IN DIE AUTOMATIK FAELLT WEG. Der Ruecksetzer raeumt die
       Filter, aber die Handwahl bleibt stehen -- und es gibt keinen zweiten
       Weg heraus. */
    nr: '616', name: 'Der Ruecksetzer stellt die Automatik nicht wieder her',
    file: 'public/app.js',
    search: "      STATUS_BY_HAND = false;\n      redraw();",
    replacement: "      redraw();",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DAS WORT FAELLT WEG. Ein unsichtbarer Automatismus ist ein Fehler, auch
       wenn er richtig raet -- niemand erfuehre, warum die Liste kuerzer ist. */
    nr: '617', name: 'Neben den Statuspillen steht nicht mehr, woher sie kommen',
    file: 'public/app.js',
    search: "  if (fallback) {\n    const from = secondLabel(r1, t('list.followsSort'));",
    replacement: "  if (false) {\n    const woher = zweiteBeschriftung(r1, t('list.followsSort'));",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE ABGELEITETE PILLE SIEHT AUS WIE EINE ANGEKLICKTE. Sie behauptet
       damit eine Einstellung, die niemand vorgenommen hat. */
    nr: '618', name: 'Die abgeleitete Pille zeichnet sich wie eine gewaehlte',
    file: 'public/app.js',
    search: "    b.className = 'pill' + (fallback ? (fallback === v ? ' pill-derived' : '')\n" +
           "                                    : (f.tested === v ? ' on' : ''));",
    replacement: "    b.className = 'pill' + ((vorgabe ? vorgabe === v : f.tested === v) ? ' on' : '');",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* UND DASSELBE AM STILBLATT: die Klasse steht noch da, aber sie sieht aus
       wie die gewaehlte. Ein Unterschied, der nur im Markup steht und nicht am
       Bildschirm, ist keiner. */
    nr: '619', name: 'Das Stilblatt gibt der abgeleiteten Pille den Fuellgrund der gewaehlten',
    file: 'public/style.css',
    search: "  border-color: var(--accent); border-style: dashed;",
    replacement: "  border-color: var(--accent); background: var(--accent);",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE ABLEITUNG ZAEHLT WIEDER ALS GESETZTER FILTER -- die andere Haelfte
       der Entscheidung aus Abschnitt 2. Der Ruecksetzer stuende dann auch ohne
       gesetzten Filter da, und ein Druck darauf stellte die Ableitung gerade
       wieder her: derselbe Knopf mit derselben Zahl. */
    nr: '620', name: 'Die Ableitung zaehlt als gesetzter Filter mit',
    file: 'public/app.js',
    search: "  if (statusEffective(f) !== statusIdle(f)) n++;",
    replacement: "  if (statusEffective(f) !== statusRuhestellung(f)) n++;\n" +
            "  if (statusOutSort(f.sort)) n++;",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE RUHESTELLUNG IST WIEDER FEST `all` -- der Stand vor 0.21.1, als beides
       zusammenfiel. Die Zahl ist dann in einer Lage falsch, und zwar in der
       teuersten: wer bei „Potenzial" ausdruecklich „Alles anzeigen" klickt,
       weicht von der Ruhestellung ab, aber nicht von `all`. Der Ruecksetzer
       stuende nicht da, und einen zweiten Weg zurueck in die Automatik gibt es
       nicht. */
    /* DIE TABELLE WIRD WIEDER GEWOEHNLICH GEFRAGT. Eine gespeicherte Sortierung,
       die einen Namen vom Prototyp traegt (`constructor`, `toString`), liefert
       dann eine FUNKTION: die Ableitung gilt als greifend, und weil eine
       Funktion weder 'tested' noch 'untested' ist, faellt der Statusfilter
       still ganz weg -- samt der gespeicherten Wahl. */
    /* SEIT 0.26.0 STEHT IN DERSELBEN ABLEITUNG DIE KLEMME DES
       POTENZIALMODUS (F4). Der Rueckbau geht mit (Stolperstein 201) und
       nimmt weiterhin GENAU die Prototypfrage heraus -- die Klemme bleibt
       stehen, sonst faerbte er zwei Sachen auf einmal rot. */
    nr: '623', name: 'Die Vorgabetabelle wird ohne Ruecksicht auf den Prototyp gefragt',
    file: 'public/app.js',
    search: "  Object.prototype.hasOwnProperty.call(SORT_STATUS, sort)\n" +
           "    ? ((!POTENTIAL_MODE && /^potential_/.test(sort)) ? null : SORT_STATUS[sort])\n" +
           "    : null;",
    replacement: "  (SORT_STATUS[sort]\n" +
           "    ? ((!POTENTIAL_MODE && /^potential_/.test(sort)) ? null : SORT_STATUS[sort])\n" +
           "    : null);",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    nr: '622', name: 'Die Ruhestellung der Statuszeile ist wieder fest „alles"',
    file: 'public/app.js',
    search: "  if (statusEffective(f) !== statusIdle(f)) n++;",
    replacement: "  if (f.tested !== v.tested) n++;",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* UND DER EINGEKLAPPTE SCHALTER SCHWEIGT. Er ist der einzige Ort, der fuer
       die zugeklappte Leiste noch spricht -- ohne ihn stuende die Ableitung
       genau dann nirgends dran, wenn man sie am wenigsten sieht. */
    nr: '621', name: 'Der eingeklappte Filterschalter sagt nichts von der Ableitung',
    file: 'public/app.js',
    search: "  const from = statusOutSort(state.filters.sort) ? t('list.followsSort') : '';",
    replacement: "  const woher = '';",
    expected: 'Die Sortierung gibt den Status vor — 0.21.1'
  },

  /* ---- Der Pruefstand ueber sich selbst ---- */
  {
    /* DIE DATEILISTE DES SPRACHWAECHTERS VERLIERT DIE BEIDEN NEUEN DATEIEN --
       0.19.3. Sie ist eine gepflegte Liste und keine abgeleitete; wer eine
       Quelltextdatei anlegt und sie hier vergisst, bekommt einen Waechter, der
       ueber sie schweigt. GENAU DAS IST IN DIESER RUNDE PASSIERT: in
       batchrun.js stand ein Wort aus der Sperrliste, und niemand sah es. */
    nr: 'W14', name: 'Die Dateiliste des Sprachwaechters verliert die neuen Dateien',
    file: 'testbench.js',
    search: "                          'images.js', 'batchrun.js'];",
    replacement: "                          ];",
    expected: 'Der Sprachwaechter'
  },
  {
    /* DIE SPRACHLISTE VERLIERT IHREN DREIZEHNTEN EINTRAG -- 0.19.1 hat ihn
       eingetragen, weil das Wort in dieser Runde gefallen ist und 0.19.2 voll
       davon sein wird. Ein Waechter, dem ein Wort fehlt, sieht aus wie einer,
       der nichts zu beanstanden hat. */
    nr: 'W13', name: 'Die Sprachliste verliert ihren juengsten Eintrag',
    file: 'testbench.js',
    search: "    ['Faden', 'Thread']\n  ];",
    replacement: "  ];",
    expected: 'Der Sprachwaechter'
  },
  /* ================= 0.22.0: die Runde „Die Oberflaeche wird ruhiger" =================
     ACHTZEHN NEUE, AB NUMMER 624 -- fuer jede neue Regel des Pruefstands
     mindestens einer, und einer, der das Milchglas wieder einsetzt (Auftrag
     0.22.0, „Der Pruefstand"). EINUNDVIERZIG VORHANDENE SIND MITGEGANGEN statt
     geloescht zu werden (Stolperstein 201): fast jeder, der einen
     Bildschirmtext suchte, zeigte nach der Textrunde ins Leere -- 13, 30, 68,
     123, 143, 167 bis 170, 180, 181, 203, 204, 238, 264, 283, 284, 296, 302,
     315, 316, 327, 330, 334, 337, 367, 377, 383, 453 bis 455, 472, 473, 485,
     505, 522, 551, 583 bis 585 und 601. 583 und 584 zeigen dabei auf die neue
     Sternzeile (0.22.0) statt auf die von 0.21.0. */
  {
    /* DAS MILCHGLAS KOMMT ZURUECK. Die Regel steht seit 0.19.x im Projektstand
       (10a), und bis 0.21.1 brach das Stilblatt sie an neun Stellen -- eine
       Regel, die im Papier steht und im Stilblatt gebrochen wird, ist keine
       (Stolperstein 314). Der Waechter muss sie kennen. */
    nr: '624', name: 'Das Milchglas kommt an die Kopfzeile zurueck',
    file: 'public/style.css',
    search: ".masthead.scrolled { box-shadow: var(--sh-sm); }",
    replacement: ".masthead.scrolled { box-shadow: var(--sh-sm); backdrop-filter: blur(10px); }",
    expected: 'Kein Milchglas im Stilblatt — 0.22.0'
  },
  {
    // Ein Bildschirmtext traegt wieder ein Wort der Verbotsliste (Konzept 4.3).
    nr: '625', name: 'Die Glocke sagt wieder „Blick"',
    file: 'public/app.js',
    search: "    : t('list.noNews'));",
    replacement: "    : 'Nichts Neues seit deinem letzten Blick');",
    expected: 'Der Bildschirmtext-Waechter — 0.22.0'
  },
  {
    // Eine Servermeldung nennt wieder den Spaltenwert „Kasten".
    nr: '626', name: 'Die Servermeldung zur Phase eines Kriteriums sagt wieder „Kasten"',
    file: 'public/languages/de.json',
    search: "\"server.criterionEitherOr\": \"Ein Kriterium gehört entweder zu „{potential}“ oder zu „{ratingOne}“.\",",
    replacement: "\"server.criterionEitherOr\": \"Der Kasten muss „{potential}“ oder „{ratingOne}“ sein.\",",
    expected: 'Der Bildschirmtext-Waechter — 0.22.0'
  },
  {
    // Ein rohes Browserfenster kehrt zurueck -- confirm() statt confirmBox().
    nr: '627', name: 'Das Beenden der anderen Sitzungen fragt wieder ueber confirm()',
    file: 'public/app.js',
    search: "      if (!await confirmBox(t('card.endSessionsAsk'), t('card.thisSessionStays'), t('card.end'))) return;",
    replacement: "      if (!confirm(t('card.endSessionsAsk'))) return;",
    expected: 'Keine Browserfenster mehr — 0.22.0'
  },
  {
    /* DER SERVER-BEFEHL STEHT WIEDER IM FLIESSTEXT -- vor den Augen jedes
       Benutzers, wie bis 0.21.1 an den Wiederherstellungscodes (Stolperstein
       315). Gezaehlt wird, nicht gesucht: die Zeile traegt kein serverKasten(. */
    nr: '628', name: 'Ein Server-Befehl steht wieder im Fliesstext der Karte Mein Konto',
    file: 'public/languages/de.json',
    search: "Passwort vergessen? Ein Admin kann einen Link zum Zurücksetzen erzeugen.\"",
    replacement: "Passwort vergessen? Auf dem Server hilft docker compose exec kriterion node usertool.js passwort <name>.\"",
    expected: 'Server-Befehle nur im Kasten — 0.22.0'
  },
  {
    // Der Kasten wird zu einem fuenften Aufruf, den niemand gezaehlt hat.
    nr: '629', name: 'Ein fuenfter Kasten „Auf dem Server" kommt an die Karte Sicherung',
    file: 'public/app.js',
    search: "        <div id=\"backup-box\"></div>\n      </div>`;",
    replacement: "        <div id=\"backup-box\"></div>\n        ${serverKasten('Die Sicherung von Hand:', 'docker compose exec kriterion node sicherung.js')}\n      </div>`;",
    expected: 'Server-Befehle nur im Kasten — 0.22.0'
  },
  {
    // prompt() kehrt zurueck: das fremde Passwort stuende wieder im Klartext.
    nr: '630', name: 'Das fremde Passwort wird wieder ueber prompt() abgefragt',
    file: 'public/app.js',
    search: "          const fresh = await newPasswordDialog(t('card.setPasswordFor', { username: z.username }),",
    replacement: "          const neu = prompt(t('card.setPasswordFor', { username: z.username }),",
    expected: 'Keine Browserfenster mehr — 0.22.0'
  },
  {
    // Die Schranke der Stufen lockert sich: 90 ginge durch.
    nr: '631', name: 'Der Bildstreifen laesst eine ungueltige Stufe durch',
    file: 'server.js',
    search: "    if (!STRIP_LEVELS.includes(n))",
    replacement: "    if (!Number.isFinite(n))",
    expected: 'Die Einstellung strip — 0.22.0'
  },
  {
    // Die Vorgabe vergisst eines der zwei neuen Woerter -- dreizehn statt vierzehn.
    nr: '632', name: 'Die Vorgabe des Vokabulars vergisst die Mehrzahl der Bewertung',
    file: 'public/languages/de.json',
    search: "\"vocabulary.ratingMany\": \"Bewertungen\",",
    replacement: "\"vocabulary.ratingMany\": \"\",",
    expected: 'Einstellungen: Vokabular und Schriftgroesse'
  },
  {
    /* DER KNOPF RUTSCHT IN DIE ZELLE DER STERNE -- dorthin, wo er bis 0.21.1
       als × stand. Die Zeile hat dann drei Zellen statt vier, und der Befund
       aus dem Betrieb waere nicht behoben. */
    nr: '633', name: 'Der Ruecksetzknopf steht wieder in der Sternzelle statt in seiner eigenen Spalte',
    file: 'public/app.js',
    search: "      const zz = document.createElement('span');\n      zz.className = 'rreset-cell';\n      zz.appendChild(back);\n      row.append(zz);",
    replacement: "      acts.appendChild(zurueck);",
    expected: 'Die Sternzeile — 0.22.0'
  },
  {
    // „Rückgängig" schreibt nicht den alten Wert zurueck, sondern noch einmal die Null.
    nr: '634', name: 'Rueckgaengig schreibt die Null statt des alten Werts',
    file: 'public/app.js',
    search: "        toast(t('entry.starsRemoved', { name: r.name }), false, { text: t('entry.undo'), tu: () => set(old) });",
    replacement: "        toast(t('entry.starsRemoved', { name: r.name }), false, { text: t('entry.undo'), tu: () => set(0) });",
    expected: 'Die Sternzeile — 0.22.0'
  },
  {
    // Bei einem einzigen Zugang stuende der Knopf wieder dicht an den Sternen.
    nr: '635', name: 'Die Zelle des Ruecksetzknopfs verliert ihren Abstand',
    file: 'public/style.css',
    search: ".rrow .rreset-cell { display: flex; align-items: center; justify-content: flex-end; padding-left: 12px; }",
    replacement: ".rrow .rzz { display: flex; align-items: center; justify-content: flex-end; padding-left: 4px; }",
    expected: 'Die Sternzeile — 0.22.0'
  },
  {
    /* EIN FILTER, DER GREIFT UND UNSICHTBAR IST, IST EIN FEHLER: die Tagzeile
       bliebe beim Aufbau zu, obwohl ein Tag die Liste kuerzt.
       MITGEZOGEN, NICHT GELOESCHT -- 0.24.0 (Stolperstein 201): der Aufklapper
       ist ein Knopf geworden, die Regel dahinter ist dieselbe geblieben. */
    /* NACHGEZOGEN MIT 0.30.0 (Stolperstein 201): der Merker ist mit dem
       Umschalter gefallen, die REGEL dahinter ist dieselbe geblieben -- ein
       Filter, der greift und unsichtbar ist, ist ein Fehler. Der Rueckbau
       stellt genau das wieder her: die Zeile steht nur noch da, wenn sie
       gerade nicht gebraucht wird. */
    nr: '636', name: 'Die Tagzeile bleibt bei greifendem Tagfilter zugeklappt',
    file: 'public/app.js',
    search: "  const tagsOpen = tagsPossible;",
    replacement: "  const tagsOpen = tagsPossible && f.tagIds.length === 0;",
    expected: 'Die Tagzeile steht offen — 0.30.0'
  },
  {
    // filterZahl() vergisst die Tags hinter dem Umschalter.
    nr: '637', name: 'filterNumber() zaehlt die Tags hinter dem Umschalter nicht mehr',
    file: 'public/app.js',
    search: "  n += f.tagIds.length;",
    replacement: "  n += 0;",
    expected: 'Der Umschalter der Tagzeile — 0.24.0'
  },
  {
    /* DER UMSCHALTER BELEGT WIEDER EINE EIGENE ZEILE -- 0.24.0. Genau das war
       der Befund: er kostete den Platz, den er sparen sollte. */
    /* NACHGEZOGEN MIT 0.30.0: der Umschalter ist gefallen, und mit ihm sein
       Platz in der Kategoriezeile. Was an seine Stelle tritt, ist die Klasse,
       an der das Raster des Telefons haengt -- ohne sie steht „und/Oder"
       wieder neben der Beschriftung, und die Zeile traegt drei Rasterzeilen
       statt zweier. Dieselbe Sache, ein anderer Traeger. */
    nr: '658', name: 'Die Tagzeile sagt dem Raster nicht mehr, dass sie die Tagzeile ist',
    file: 'public/app.js',
    search: "    r3.classList.add('frow-tags');",
    replacement: "    r3.classList.add('frow-tagzeile');",
    expected: 'Die Tagzeile steht offen — 0.30.0'
  },
  {
    /* ZUGEKLAPPT WAERE DIE ZEILE NUR VERBORGEN UND NICHT FORT -- sie kostete
       den Platz weiter, und der Befund waere nur zur Haelfte behoben. */
    nr: '659', name: 'Die Tagzeile wird zugeklappt gebaut statt weggelassen',
    file: 'public/app.js',
    search: "  if (tagsOpen) {\n    const r3 = row(t('list.tags'));",
    replacement: "  if (true) {\n    const r3 = row(t('list.tags'));",
    expected: 'Der Umschalter der Tagzeile — 0.24.0'
  },
  {
    /* EIN UMSCHALTER FUER EINE LEERE ZEILE -- die zweite Haelfte des Befundes
       vom 5. September 2026. */
    nr: '660', name: 'Der Umschalter steht auch da, wenn kein Tag dahinter ist',
    file: 'public/app.js',
    search: "  const tagsPossible = filterTags.length > 0 || f.tagIds.length > 0;",
    replacement: "  const tagsMoeglich = true;",
    expected: 'Der Umschalter der Tagzeile — 0.24.0'
  },
  {
    /* EIN LITERAL ZURUECK HINTER `error:` -- genau das, was Bauabschnitt 2
       ueberall entfernt hat. */
    nr: '675', name: 'Eine Servermeldung steht wieder als Satz im Quelltext',
    file: 'server.js',
    search: "  if (!title) return res.status(400).json({ error: t(localeOf(req), 'server.titleMissing')});",
    replacement: "  if (!title) return res.status(400).json({ error: 'Bitte einen Titel eingeben.' });",
    expected: 'Der Bildschirmtext-Waechter'
  },
  {
    /* EIN DEUTSCHER SATZ ZURUECK IN `throw new Error` IN auth.js -- der blinde
       Fleck des Waechters, den diese Runde geschlossen hat. */
    nr: '676', name: 'auth.js wirft wieder einen deutschen Satz',
    file: 'auth.js',
    search: "  if (!ROLES.includes(role)) throw new Message('login.roleUnknown');\n  const clean = String(name).trim();",
    replacement: "  if (!ROLLEN.includes(rolle)) throw new Error('Diese Rolle gibt es nicht.');\n  const sauber = String(name).trim();",
    expected: 'Der Bildschirmtext-Waechter'
  },
  {
    /* EIN PROGRAMMIERFEHLER OHNE BILDSCHIRM VERSCHWINDET. Die Liste ist
       namentlich -- eine Zahl allein liesse offen, welche gemeint sind. */
    nr: '677', name: 'Ein Programmierfehler ohne Bildschirm faellt weg',
    file: 'auth.js',
    search: "    throw new Error('Eine Sitzung braucht einen Benutzer.');",
    replacement: "    return null;",
    expected: 'Der Bildschirmtext-Waechter'
  },
  {
    /* EINE DER VIER ALTLASTEN VERSCHWINDET AUS DER DATEI, ohne dass jemand die
       Liste im Pruefstand nachzieht. */
    nr: '678', name: 'Eine benannte Altlast verschwindet aus der Sprachdatei',
    file: 'public/languages/de.json',
    search: '  "login.noUserYet": "Es ist noch kein Zugang eingerichtet.",',
    replacement: '  "login.noUserYetX": "Es ist noch kein Zugang eingerichtet.",',
    expected: 'Der Bildschirmtext-Waechter'
  },
  {
    /* UND DIE ANDERE RICHTUNG: eine Altlast wird richtiggestellt, bleibt aber
       auf der Liste stehen. Dann fuehrt die Liste eine Ausnahme fuer nichts. */
    nr: '679', name: 'Eine Altlast ist behoben und steht doch noch auf der Liste',
    file: 'public/languages/de.json',
    search: '  "server.deniedOwnUser": "Den eigenen Zugang ändert man unter „Zugang“, nicht hier.",',
    replacement: '  "server.deniedOwnUser": "Das eigene Konto ändert man an anderer Stelle.",',
    expected: 'Der Bildschirmtext-Waechter'
  },
  {
    /* DER UEBERSETZER WIRD mail.js NICHT MEHR GEREICHT -- jeder Brief stuende
       dann als Klammerausdruck da, und der Link waere fort. */
    nr: '680', name: 'mail.js bekommt den Uebersetzer nicht mehr gereicht',
    file: 'server.js',
    search: "mail.setTranslator(t);",
    replacement: "void mail.setTranslator;",
    expected: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* UND auth.js EBENSO WENIG -- die zwei Antworten von requireAuth() stuenden
       als Klammerausdruck da. */
    nr: '681', name: 'auth.js bekommt den Uebersetzer nicht mehr gereicht',
    file: 'server.js',
    search: "auth.setTranslator((req, key, values) => t(localeOf(req), key, values));",
    replacement: "void auth.setTranslator;",
    expected: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* DIE VORGABE DES VOKABULARS KOMMT WIEDER AUS DEM QUELLTEXT -- Stolperstein
       47 in seiner urspruenglichen Form: doppelt gehaltene Vorgaben pruefen
       sich nur halb. */
    nr: '682', name: 'Die Vokabelvorgaben stehen wieder im Quelltext',
    file: 'server.js',
    search: "const vocabularyDefault = (locale) => Object.fromEntries(\n  Object.entries(textsOf(locale || languageDefault()))",
    replacement: "const VOKABULAR_VORGABE = { sacheEinzahl: 'Eintrag' };\nconst vocabularyDefault = (locale) => Object.fromEntries(\n  Object.entries(textsOf(locale || languageDefault()))",
    expected: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* EINE BETREFFZEILE ZURUECK IN server.js -- der Text gehoert zur Sache, und
       zwei Ausfertigungen liefen auseinander. */
    nr: '683', name: 'Der Betreff eines Briefes verliert seinen Platzhalter',
    file: 'public/languages/de.json',
    search: "  \"mail.invite.subject\": \"Dein Zugang zu „{instanceTitle}“\",",
    replacement: '  "mail.invite.subject": "Dein Zugang",',
    expected: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* DIE TESTMAIL BEKOMMT EINEN LINK, DEN SIE NICHT HAT. */
    nr: '684', name: 'Die Testmail traegt ploetzlich einen Link',
    file: 'public/languages/de.json',
    search: "das ist die Testmail aus „{instanceTitle}“.",
    replacement: 'das ist die Testmail aus „{instanceTitle}“: {link}',
    expected: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* OHNE _locale GAEBE ES WEDER DATUM NOCH MEHRZAHL -- und die Ladung im
       Browser bricht ab, statt eine halbe Sprache zu nehmen. */
    nr: '665', name: 'Die Sprachdatei verliert ihren Kopf _locale',
    file: 'public/languages/de.json',
    search: '  "_locale": "de-DE",',
    replacement: '  "_hinweis": "de-DE",',
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* EIN WERT MIT SPITZER KLAMMER. Der Helfer maskiert den TEXT ausdruecklich
       nicht -- er kommt aus der Datei und traegt kein HTML. Traegt er doch
       eines, faellt genau diese Zusage. */
    nr: '666', name: 'Ein Wert der Sprachdatei traegt eine spitze Klammer',
    file: 'public/languages/de.json',
    search: '"server.errorUnknown": "Unbekannter Fehler"',
    replacement: '"server.errorUnknown": "<b>Unbekannter Fehler</b>"',
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* tH() MASKIERT NICHT MEHR -- Stolperstein 18 waere damit wieder offen:
       ein Vokabelwort des Admins liefe roh in innerHTML. */
    nr: '667', name: 'tH() maskiert die eingesetzten Werte nicht mehr',
    file: 'public/app.js',
    search: "    return mask ? esc(String(value)) : String(value);",
    replacement: "    return String(wert);",
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* EIN UNBEKANNTER PLATZHALTER WIRD GELEERT STATT STEHENZUBLEIBEN. Ein
       leerer Fleck ist kein Fund -- `{sache}` am Bildschirm ist einer. */
    nr: '668', name: 'Ein unbekannter Platzhalter verschwindet still',
    file: 'public/app.js',
    search: "    if (value === undefined) return whole;",
    replacement: "    if (wert === undefined) return '';",
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DIE MEHRZAHL WAEHLT WIEDER `n === 1` STATT Intl.PluralRules. Auf Deutsch
       faellt beides zusammen -- die Regel steht trotzdem falsch da, und die
       naechste Sprache bricht daran. */
    nr: '669', name: 'Die Mehrzahl waehlt wieder ueber n === 1',
    file: 'public/app.js',
    search: "  return PLURAL.select(values.n) === 'one' ? raw.one : raw.other;",
    replacement: "  return werte.n === 1 ? roh.one : roh.other;",
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DER RUECKFALL AUF DEUTSCH FAELLT WEG. In dieser Runde ist er leer -- und
       genau deshalb muss er belegt sein, sonst faellt sein Wegfall erst in
       Stufe 2 auf, wo er gebraucht wird. */
    nr: '670', name: 'Der Rueckfall auf Deutsch faellt weg',
    file: 'public/app.js',
    search: "  const raw = TEXTS[key] !== undefined ? TEXTS[key] : TEXTS_FALLBACK[key];",
    replacement: "  const raw = TEXTS[key];",
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* boot() ZEICHNET WEITER, OBWOHL DIE SPRACHDATEI FEHLT -- die Oberflaeche
       stuende dann voller Klammern da (Entscheidung A1). */
    nr: '671', name: 'boot() haelt bei fehlender Sprachdatei nicht an',
    file: 'public/app.js',
    search: "    app.textContent = 'Die Sprachdatei fehlt.';\n    return;",
    replacement: "    app.textContent = 'Die Sprachdatei fehlt.';",
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DER SERVER STIRBT WIEDER AN EINER FEHLENDEN PFLICHTDATEI -- 0.24.3, F6.
       DIE ZUSAGE HAT SICH MIT DIESER RUNDE UMGEDREHT: bis 0.24.2 stellte
       dieser Rueckbau den WURF ab und machte damit rot, dass der Server ohne
       Sprachdatei anhaelt. Seit das Verzeichnis die Liste ist, ist das
       Anhalten der Fehler -- also stellt er den Wurf WIEDER HER.
       Die Nummer bleibt, weil es dieselbe Stelle und dieselbe Frage ist. */
    nr: '672', name: 'Der Server stirbt wieder an einer fehlenden Pflichtdatei',
    file: 'server.js',
    search: "if (!LANGUAGES[LANGUAGE_FALLBACK]) console.error(",
    replacement: "if (!LANGUAGES[LANGUAGE_FALLBACK]) throw new Error('Pflichtdatei fehlt'); if (false) console.error(",
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* api() SCHREIBT SEINEN RUECKFALLSATZ WIEDER IN DEN QUELLTEXT. */
    nr: '673', name: 'api() traegt seinen Rueckfallsatz wieder im Quelltext',
    file: 'public/app.js',
    search: "    let m = t('error.serverStatus', { status: res.status });",
    replacement: "    let m = `Der Server meldet einen Fehler (${res.status}).`;",
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DER FEHLER-HANDLER SAGT SEINEN SATZ WIEDER SELBST. */
    nr: '674', name: 'Der Fehler-Handler traegt seinen Satz wieder im Quelltext',
    file: 'server.js',
    search: "  if (rank >= 500) return res.status(500).json({ error: t(locale, 'server.error') });",
    replacement: "  if (rang >= 500) return res.status(500).json({ error: 'Auf dem Server ist ein Fehler aufgetreten.' });",
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DIE HILFSLINIE DER ZEITLEISTE FAELLT ZURUECK AUF DIE ALLGEMEINE
       RANDFARBE -- 1,02 : 1 gegen den hellen Grund, also unsichtbar. */
    nr: '661', name: 'Die Hilfslinie der Zeitleiste ist im hellen Schema wieder unsichtbar',
    file: 'public/style.css',
    search: "  --timeline-line: var(--line-hover);",
    replacement: "  --timeline-line: var(--line-2);",
    expected: 'Die Zeitleiste im hellen Schema — 0.24.0'
  },
  {
    /* UND DIE JAHRESZAHL WIRD WIEDER --faint: 3,46 : 1 bei 0,63 rem
       Festbreite, und das Farbkonzept sagt, dass --faint nie tragender Text
       ist. */
    nr: '662', name: 'Die Jahreszahl der Zeitleiste faellt unter die Latte fuer Text',
    file: 'public/style.css',
    search: "  --timeline-year: var(--muted);",
    replacement: "  --timeline-year: var(--faint);",
    expected: 'Die Zeitleiste im hellen Schema — 0.24.0'
  },
  {
    /* DAS DUNKLE SCHEMA AENDERT EINEN BILDPUNKT -- und genau das darf es
       nicht. Die Regel steht in jedem Auftrag seit 0.23.0. */
    nr: '663', name: 'Das dunkle Schema bekommt einen anderen Wert fuer die Zeitleiste',
    file: 'public/style.css',
    search: "  --timeline-mid: var(--line);\n  --timeline-year: var(--faint);",
    replacement: "  --timeline-mid: var(--line-hover);\n  --timeline-year: var(--faint);",
    expected: 'Die Zeitleiste im hellen Schema — 0.24.0'
  },
  {
    /* DIE REGEL LIEST WIEDER DIE ALLGEMEINE RANDFARBE. Die Variable stuende
       tadellos da und faerbte nichts. */
    nr: '664', name: 'Die Hilfslinie liest die allgemeine Randfarbe statt ihrer eigenen',
    file: 'public/style.css',
    search: ".timeline-line { position: absolute; left: 0; right: 0; height: 1px; background: var(--timeline-line); }",
    replacement: ".timeline-line { position: absolute; left: 0; right: 0; height: 1px; background: var(--line-2); }",
    expected: 'Die Zeitleiste im hellen Schema — 0.24.0'
  },
  {
    // Der Loeschknopf steht wieder fuer jeden -- die Fehlermeldung auf Vorrat (E10).
    nr: '638', name: 'Der Knopf „Eintrag löschen" steht wieder fuer jede Rolle',
    file: 'public/app.js',
    search: "    ${item.mine === true || ADMIN\n      ? `<div class=\"danger-row\">",
    replacement: "    ${true\n      ? `<div class=\"danger-row\">",
    expected: 'Die Rollenweichen — 0.22.0'
  },
  {
    // Der Klartextschluessel steht wieder vor jedem Admin (E13).
    nr: '639', name: 'Der Klartextschluessel steht wieder vor dem Admin',
    file: 'public/app.js',
    search: "          : (OWNER\n            ? `<div class=\"warn-box\"><strong>${tH('card.keyBesideDb')}</strong>",
    replacement: "          : (ADMIN\n            ? `<div class=\"warn-box\"><strong>${tH('card.keyBesideDb')}</strong>",
    expected: 'Die Rollenweichen — 0.22.0'
  },
  {
    // Der Benutzer liest an „Kategorien" wieder, wie man umbenennt und loescht.
    nr: '640', name: 'Die Karte Kategorien erklaert dem Benutzer wieder die Werkzeuge des Admins',
    file: 'public/app.js',
    search: "        <p class=\"desc\">${ADMIN\n          ? tH('card.categoriesHint')",
    replacement: "        <p class=\"desc\">${true\n          ? tH('card.categoriesHint')",
    expected: 'Die Rollenweichen — 0.22.0'
  },
  {
    /* „ABBRECHEN" BRICHT NICHT AB (Stolperstein 316): der Nein-Knopf des
       Loeschfensters liefert die Stellung der Haekchen wie der Ja-Knopf. */
    nr: '641', name: 'Abbrechen im Loeschfenster fuer einen Benutzer bricht nicht ab',
    file: 'public/app.js',
    search: "    bd.querySelector('[data-no]').onclick = () => done(null);\n    bd.querySelector('[data-yes]').onclick = take;\n    bd.onclick = e => { if (e.target === bd) done(null); };\n    const onKey = e => { if (e.key === 'Escape') done(null); };",
    replacement: "    bd.querySelector('[data-no]').onclick = nimm;\n    bd.querySelector('[data-yes]').onclick = nimm;\n    bd.onclick = e => { if (e.target === bd) done(null); };\n    const onKey = e => { if (e.key === 'Escape') done(null); };",
    expected: 'Keine Browserfenster mehr — 0.22.0'
  },
  /* ================= 0.22.1 — die fuenf Gesten, die Kopfzahl, der Kasten ====
     Zwoelf Rueckbauten, und jeder nimmt GENAU EINE Zusage dieser Runde zurueck.
     Wo eine Zusage an mehreren Zeilen haengt, steht der Rueckbau an der Zeile,
     die den Unterschied traegt -- nicht an der, die am leichtesten zu finden
     ist. */
  {
    /* OHNE GREIFZONE GIBT ES DIE ACHT GRIFFE NICHT MEHR: alles im Rahmen wird
       zum Schieben, und Ecke wie Kante sind unerreichbar. */
    nr: '642', name: 'Der Rahmen verliert seine acht Griffe',
    file: 'public/app.js',
    search: "const HANDLE = 12;",
    replacement: "const GRIFF = 0;",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DIE KANTE GEWINNT GEGEN DIE ECKE -- die Reihenfolge der vier Fragen ist
       die ganze Entscheidung, und sie steht nirgends sonst. */
    nr: '643', name: 'Die Kante gewinnt wieder gegen die Ecke',
    file: 'public/app.js',
    search: "  if (n && w) return 'links-oben';",
    replacement: "  if (n) return 'oben';\n  if (n && w) return 'links-oben';",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DER GRIFF WIRD NICHT MEHR AM RAHMEN GEDECKELT: an einem kleinen Rahmen
       decken die acht Zonen die ganze Flaeche ab, und das Schieben faellt
       weg. */
    nr: '644', name: 'Die Greifzone wird am kleinen Rahmen nicht mehr gedeckelt',
    file: 'public/app.js',
    search: "  const g = Math.min(handle, edge / 4);",
    replacement: "  const g = griff;",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* SCHIEBEN AENDERT DIE WEITE MIT. Der Weg an der Rastung vorbei ist die
       Zusage; geht das Schieben durch setzeKiste(), rastet der Zoom bei jedem
       Zug neu. */
    nr: '645', name: 'Das Schieben aendert die Weite wieder mit',
    file: 'public/app.js',
    search: "      setState(user.crate.links + (p.x - user.p0.x), user.crate.top + (p.y - user.p0.y));",
    replacement: "      setBox(zug.kiste.kante * 0.9,\n        () => ({ l: zug.kiste.links + (p.x - zug.p0.x), o: zug.kiste.top + (p.y - zug.p0.y) }));",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DIE RASTUNG KOMMT VOR DER LAGE. Legt man den Rahmen nach der
       UNGERASTETEN Kante, wandert die feste Ecke bei jedem Zug um bis zu eine
       halbe Stufe -- genau die Ecke, die stillstehen soll. */
    nr: '646', name: 'Die feste Ecke wandert wieder mit der Rastung',
    file: 'public/app.js',
    search: "      const { l, o } = situation(narrow);\n      setState(l, o);",
    replacement: "      const { l, o } = lage(k);\n      setState(l, o);",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DIE KANTE VERSCHIEBT DEN MITTELPUNKT. Statt symmetrisch um die Mitte der
       festen Kante zu wachsen, haengt der Rahmen an ihrer oberen Ecke -- er
       rutscht dabei seitlich weg. */
    nr: '647', name: 'Die Kante verschiebt den Mittelpunkt wieder',
    file: 'public/app.js',
    search: "          (e) => ({ l: right - e, o: centerY - e / 2 }), Math.min(right, aroundCenter(centerY, f.height)));",
    replacement: "          (e) => ({ l: rechts - e, o: k.oben }), Math.min(rechts, umMitte(mitteY, f.hoehe)));",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* EIN GRIFF IM RAHMEN OHNE WEG VERSTELLT WIEDER DEN AUSSCHNITT
       (Entscheidung E1): ein misslungener Griff schiebt den Punkt unter den
       Zeiger. */
    nr: '648', name: 'Ein Griff ohne Weg setzt wieder den Punkt',
    file: 'public/app.js',
    search: "      if (prev.gesture !== 'neu') return;\n      outPoint(e);",
    replacement: "      outPoint(e);",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DER ZEIGER SAGT NICHTS MEHR: ueber Rahmen, Ecke und Kante steht wieder
       dasselbe Zeichen (Regel G2 aus 0.22.0). */
    nr: '649', name: 'Der Zeiger sagt wieder nicht, was geschehen wird',
    file: 'public/app.js',
    search: "      const kl = HANDLE_CURSORS[gesture];\n      if (kl) v.classList.add(kl);",
    replacement: "      const kl = null;\n      if (kl) v.classList.add(kl);",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DER FINGER BEKOMMT DIE ACHT GRIFFE DOCH (Entscheidung E3): eine Zone von
       zwoelf Bildpunkten trifft keine Fingerkuppe, und ein Tipp an den Rand
       aendert dann die Weite statt zu schieben. */
    nr: '650', name: 'Der Finger bekommt die acht Griffe doch',
    file: 'public/app.js',
    search: "      if (e.pointerType === 'touch' && gesture !== 'neu') gesture = 'schieben';",
    replacement: "      if (false && e.pointerType === 'touch' && geste !== 'neu') geste = 'schieben';",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DIE KURZFASSUNG KOMMT ZURUECK: die Zahl steht wieder zweimal im selben
       Kopf, einmal in Klammern und einmal mit „gewichtet" (Stolperstein 318). */
    nr: '651', name: 'Die Kopfzahl steht wieder zweimal da',
    file: 'public/app.js',
    search: "    case 'potenzial': return item.potentialRating ? '' : t('list.notEstimatedYet');",
    replacement: "    case 'potenzial': return item.potenzialRating\n      ? '⌀ ' + zahl(item.potenzialRating, 1) : t('list.notEstimatedYet');",
    expected: 'Die beiden Sternkaesten — 0.21.0'
  },
  {
    /* DER BEWERTUNGSKASTEN STEHT WIEDER AN JEDER IDEE -- zugeklappt, aber
       sichtbar, und ein Klick liesse Sterne vergeben. */
    nr: '652', name: 'Der Bewertungskasten steht wieder an jeder Idee',
    file: 'public/app.js',
    search: "  return name === 'bewertung' && !item.tested && !hasStars(item, 'after');",
    replacement: "  return false && name === 'bewertung' && !item.tested && !hasStars(item, 'after');",
    expected: 'Die beiden Sternkaesten — 0.21.0'
  },
  {
    /* UND DER SERVER NIMMT SIE WIEDER AN. Was der Bildschirm nicht anbietet,
       muss der Server abweisen -- sonst ist es keine Regel, sondern eine
       Gewohnheit. */
    nr: '653', name: 'Der Server nimmt die Bewertung am ungetesteten Eintrag wieder an',
    file: 'server.js',
    search: "    if (crit && crit.phase === 'after' && entry && !entry.tested)",
    replacement: "    if (false && krit && krit.phase === 'after' && eintrag && !eintrag.tested)",
    expected: 'Rechte und Sichtbarkeit'
  },
  {
    /* UND DIE KOPFZAHL SAGT NICHT MEHR, WESSEN ZAHL SIE IST (Entscheidung E5)
       -- die Frage aus dem Betrieb bliebe wieder unbeantwortet. */
    nr: '654', name: 'Die Kopfzahl sagt nicht mehr, wessen Zahl sie ist',
    file: 'public/app.js',
    search: "        b.title = t('entry.avgAllHint');",
    replacement: "        b.title = 'Wie diese Zahl zustande kommt';",
    expected: 'Die beiden Sternkaesten — 0.21.0'
  },
  {
    /* DIE RASTUNG SPRINGT WIEDER UEBER DEN DECKEL -- 0.22.1, und die Regel ist
       aus der Gegenprobe zu 646 entstanden: rastet die Kante nach oben ueber
       den Deckel hinaus, passt der Rahmen nicht mehr an seinen Anker, und die
       Klemme schiebt ihn ins Bild zurueck. */
    nr: '655', name: 'Die Rastung springt wieder ueber den Deckel',
    file: 'public/app.js',
    search: "      if (narrow > up + 1e-9 && zoom < 400) {",
    replacement: "      if (false && eng > hoch + 1e-9 && zoom < 400) {",
    expected: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    nr: 'W2', name: 'Eine Portbasis liegt wieder auf der gesperrten 4045',
    file: 'testbench.js',
    search: '  const B = startFurtherServer(freshDir, {}, 5130);',
    replacement: '  const B = starteWeiterenServer(frischDir, {}, 4000);',
    expected: 'Die Portbasen und der Versatz'
  },
  {
    nr: 'W5', name: 'Der SMTP-Empfaenger wird nicht mehr vermerkt',
    file: 'testbench.js',
    search: '  SMTP_CASES.push(state);',
    replacement: '  // SMTP_LAGEN.push(lage);',
    expected: 'Die Portbasen und der Versatz'
  },
  {
    /* GEZIELT AUF DEN HORCHPOSTEN, nicht auf das Abraeumen der Verbindungen.
       Der erste Anlauf nahm das Abraeumen weg -- dann HAENGT der Lauf am
       close(), das auf offene Verbindungen wartet, und er lief in die
       Zeitgrenze des Treibers, statt eine Pruefung rot zu faerben
       (Stolperstein 138). So bleibt der Lauf ganz, die Empfaenger horchen
       weiter, und genau der Waechter faerbt sich, der dafuer da ist. */
    nr: 'W6', name: 'Der SMTP-Empfaenger hoert nicht auf zu horchen',
    file: 'testbench.js',
    search: '    server.close(() => r());',
    replacement: '    r();',
    expected: 'Keine Prueflage laesst ihren Server zurueck'
  },
  /* ---- 0.20.1: der Bericht ueber einen abgerissenen Lauf ---- */
  {
    /* BEIDE ZEILEN GEHOEREN ZUSAMMEN, und deshalb gibt es zwei Rueckbauten:
       einen auf das AUFHEBEN des Grundes und einen auf das DRUCKEN. Faellt nur
       das Drucken weg, steht der Grund im Ergebnis und niemand sieht ihn --
       genau die Lage, in der Rueckbau 568 seinen Abriss unerklaert liess. */
    nr: 'W15', name: 'Der Bericht druckt die letzten Zeilen eines Abrisses nicht mehr',
    file: 'counterproof.js',
    search: '      for (const z of e.tail || []) console.log(`     \u2502 ${z}`);',
    replacement: '      for (const z of []) console.log(`     \u2502 ${z}`);',
    expected: 'Die Gegenproben greifen'
  },
  {
    nr: 'W16', name: 'Der Leser hebt die letzten Zeilen gar nicht erst auf',
    file: 'counterproof.js',
    search: "    tail: output.split('\\n').map(z => z.trimEnd()).filter(z => z).slice(-20)",
    replacement: '    tail: []',
    expected: 'Die Gegenproben greifen'
  },
  /* ---- Die sieben Waechter der Sprachdatei -- 0.24.0 ------------------
     SIEBEN FRAGEN, NEUN RUECKBAUTEN. Jede der neuen Zusicherungen bekommt
     genau den Fall, gegen den sie gebaut ist -- eine Zusicherung ohne
     Gegenprobe ist eine Behauptung (Projektstand, Abschnitt 12). */
  {
    /* EINE ZWEITE SPRACHDATEI MIT GANZ ANDEREN SCHLUESSELN. package.json ist
       lesbares JSON und traegt kein einziges `card.`; die Deckungsprobe muss
       das sehen -- und die Formatprobe die fehlende Locale. */
    nr: '685', name: 'Eine zweite Sprachdatei traegt andere Schluessel',
    file: 'package.json',
    copy: 'public/languages/en.json',
    expected: 'Die sieben Waechter der Sprachdatei — 0.24.0'
  },
  {
    /* EIN SCHLUESSEL WIRD UMBENANNT. Danach steht in der Datei einer, den
       niemand ruft, und im Code einer, den die Datei nicht kennt -- beide
       Haelften der Verwendungsprobe auf einmal. */
    nr: '686', name: 'Ein Schluessel der Sprachdatei heisst anders als im Code',
    file: 'public/languages/de.json',
    search: '"list.open": "\u00d6ffnen",',
    replacement: '"liste.oeffnen2": "\u00d6ffnen",',
    expected: 'Die sieben Waechter der Sprachdatei \u2014 0.24.0'
  },
  {
    /* EIN PLATZHALTER HEISST BEINAHE WIE EIN VOKABELWORT. `{sache}` gibt es
       nicht -- es heisst `{sacheEinzahl}`; der Helfer laesst das Unbekannte
       ausdruecklich stehen, und am Bildschirm stuende woertlich „{sache}". */
    nr: '687', name: 'Ein Platzhalter heisst beinahe wie ein Vokabelwort',
    file: 'public/languages/de.json',
    search: "\"list.foundIn\": \"Gefunden in: {source}\",",
    replacement: '"list.foundIn": "Gefunden in: {sache}",',
    expected: 'Die sieben Waechter der Sprachdatei \u2014 0.24.0'
  },
  {
    /* EINE MEHRZAHLFORM VERLIERT IHRE EINZAHL. Der Helfer waehlt dann
       `undefined` und setzt es am Bildschirm ein. */
    nr: '688', name: 'Einer Mehrzahlform fehlt die Einzahl',
    file: 'public/languages/de.json',
    search: "\"list.commentCount\": {\n    \"one\": \"{n} Kommentar\",\n    \"other\": \"{n} Kommentare\"\n  },",
    replacement: '"list.commentCount": {\n    "other": "{n} Kommentare"\n  },',
    expected: 'Die sieben Waechter der Sprachdatei \u2014 0.24.0'
  },
  {
    /* DIE DEUTSCHE REGEL KEHRT IN DEN CODE ZURUECK: `n === 1 ?` waehlt
       wieder zwei Saetze, statt Intl.PluralRules zu fragen. */
    nr: '689', name: 'Eine Mehrzahl waehlt ihre Form wieder ueber `=== 1 ?`',
    file: 'public/app.js',
    search: "const vThing = (n) => plural(n, V.entryOne, V.entryMany);",
    replacement: 'const vThing = (n) => (n === 1 ? V.entryOne : V.entryMany);',
    expected: 'Die sieben Waechter der Sprachdatei \u2014 0.24.0'
  },
  {
    /* EIN DEUTSCHER SATZ BLEIBT IM QUELLTEXT STEHEN. Genau der Fall, gegen
       den diese ganze Runde gebaut ist -- und die Restliste nennt ihn beim
       Namen, statt bloss eine Zahl zu zeigen. */
    nr: '690', name: 'Ein deutscher Satz bleibt wieder in app.js stehen',
    file: 'public/app.js',
    search: "      button.textContent = t('entry.showLess');",
    replacement: "      knopf.textContent = 'Weniger anzeigen, bitte sehr';",
    expected: 'Die sieben Waechter der Sprachdatei \u2014 0.24.0'
  },
  {
    /* EINE LOCALE, DIE ES NICHT GIBT. Ohne sie rechnet Intl mit der Sprache
       des Servers weiter -- still, und das Datum sieht ploetzlich anders aus.
       `xx-XX` UND NICHT `de-XYZ`: das zweite ist kein gueltiges Sprachetikett,
       und `new Intl.PluralRules('de-XYZ')` wirft schon beim Start des Servers.
       Ein Rueckbau, der den Lauf abreisst, belegt nichts -- gesucht ist die
       ROTE ZEILE, nicht der Absturz. `xx-XX` ist wohlgeformt und trotzdem
       keiner Sprache zugeordnet: `supportedLocalesOf` gibt nichts zurueck. */
    nr: '691', name: 'Die Sprachdatei nennt eine Locale, die Intl nicht kennt',
    file: 'public/languages/de.json',
    search: "\"_locale\": \"de-DE\",",
    replacement: "\"_locale\": \"xx-XX\",",
    expected: 'Die sieben Waechter der Sprachdatei \u2014 0.24.0'
  },
  {
    /* UND DIE RUECKFALLPROBE: ein Schluessel, den die Liste ruft, fehlt in
       der Datei -- am Bildschirm steht dann \u27e6liste.laedt\u27e7. */
    nr: '692', name: 'Ein Schluessel der Liste fehlt und steht als \u27e6\u2026\u27e7 am Bildschirm',
    file: 'public/languages/de.json',
    search: '"list.loading":',
    replacement: '"liste.laedtNicht":',
    expected: 'Oberflaeche'
  },
  {
    /* DASSELBE IM SYSTEMBEREICH -- er hat seine eigene Gruppe und seinen
       eigenen Durchgang ueber alle fuenf Abschnitte. */
    nr: '693', name: 'Ein Schluessel des Systembereichs fehlt und steht als \u27e6\u2026\u27e7 da',
    file: 'public/languages/de.json',
    search: '"card.personal":',
    replacement: '"karte.persoenlichNicht":',
    expected: 'Der Systembereich nach Rolle'
  },

  /* ---- Die sechs Waechter der Runde 0.24.1 ----------------------------
     Ein Waechter, der nie rot wird, ist eine Behauptung. Jeder der sechs
     bekommt hier seinen Rueckbau: eine Stelle, an der ein deutscher Name
     zurueckkehrt -- und der Lauf muss es merken. */
  {
    nr: '694', name: 'Ein deutscher Bezeichner kehrt in den Server zurueck',
    file: 'server.js',
    search: 'const EXCHANGE_PART_MIN = 1024 * 1024;',
    replacement: 'const EXCHANGE_PART_MIN = 1024 * 1024;\nconst teilGroesseKlein = EXCHANGE_PART_MIN;',
    expected: 'Der Quelltext spricht Englisch — die sechs Waechter'
  },
  {
    nr: '695', name: 'Ein Schluessel der Sprachdatei heisst wieder deutsch',
    file: 'public/languages/de.json',
    search: '"list.description":',
    replacement: '"list.beschreibungLang":',
    expected: 'Der Quelltext spricht Englisch — die sechs Waechter'
  },
  {
    nr: '696', name: 'Eine deutsche Adresse kommt dazu',
    file: 'public/app.js',
    search: "const OLD_ADDRESSES = { '#/offen': '#/open' };",
    replacement: "const OLD_ADDRESSES = { '#/offen': '#/open', '#/uebersicht': '#/list' };",
    expected: 'Der Quelltext spricht Englisch — die sechs Waechter'
  },
  {
    nr: '697', name: 'Eine deutsche Klasse kehrt ins Stilblatt zurueck',
    file: 'public/style.css',
    search: '.role-badge.owner {',
    replacement: '.role-badge.owner, .role-badge.eigentuemer {',
    expected: 'Der Quelltext spricht Englisch — die sechs Waechter'
  },
  {
    nr: '698', name: 'Ein Satz der Oberflaeche wird umformuliert',
    file: 'public/languages/de.json',
    search: '"card.never": "noch nie"',
    replacement: '"card.never": "bisher nie"',
    expected: 'Der Quelltext spricht Englisch — die sechs Waechter'
  },
  {
    nr: '699', name: 'Ein Schluessel bekommt eine angehaengte Ziffer',
    file: 'public/languages/de.json',
    search: '"card.mailAccount":',
    replacement: '"card.mailAccount2":',
    expected: 'Der Quelltext spricht Englisch — die sechs Waechter'
  },

  /* ---- Der Sprachhelfer, nach zwei Befunden aus dem Betrieb ------------
     Am 7. September 2026 gemeldet: die Vorschaukachel im Eintrag war mit der
     Maus nicht mehr anzuklicken. Ursache war `t.parentElement` -- `t` ist
     seit 0.24.0 der Sprachhelfer, die Kachel heisst `tile`. Dieser Rueckbau
     stellt genau das wieder her. */
  {
    nr: '700', name: 'Die Vorschaukachel fragt wieder den Sprachhelfer nach ihrem Vater',
    file: 'public/app.js',
    search: 'idx = [...tile.parentElement.children].indexOf(tile);',
    replacement: 'idx = [...t.parentElement.children].indexOf(tile);',
    expected: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    nr: '701', name: 'Der zugeklappte Linkblock behaelt seine Stellung am Ende',
    file: 'public/app.js',
    search: '    box.scrollTop = 0;',
    replacement: '    box.scrollTop = 1;',
    expected: 'Zugeklappt heisst: die ersten Zeilen — 0.24.1'
  },

  /* ---- Die gespeicherten Formen — 0.24.2 -------------------------------
     Der Befund aus dem Betrieb vom 7. September 2026: 0.24.1 hat die
     SCHLUESSEL in `settings` umbenannt, aber nicht die Feldnamen IN den
     gespeicherten Werten. Diese sieben Rueckbauten nehmen der Migration je
     ein Stueck weg -- und jeder muss die Gruppe rot machen, sonst belegt sie
     nichts. */
  {
    nr: '702', name: 'Die eigenen Suchmaschinen stehen nicht mehr in der Liste der Formen',
    file: 'db.js',
    search: "  { key: 'searchOwn',  each: true,  pairs: { vorlage: 'template' } },\n",
    replacement: '',
    expected: 'Die gespeicherten Formen ziehen mit — 0.24.2'
  },
  {
    nr: '703', name: 'Die Liste der eigenen Suchmaschinen gilt wieder als ein einzelnes Gebilde',
    file: 'db.js',
    search: "{ key: 'searchOwn',  each: true,",
    replacement: "{ key: 'searchOwn',  each: false,",
    expected: 'Die gespeicherten Formen ziehen mit — 0.24.2'
  },
  {
    nr: '704', name: 'Der Absender des Mailzugangs zieht nicht mit',
    file: 'db.js',
    search: "passwort: 'password', absender: 'sender' } },",
    replacement: "passwort: 'password' } },",
    expected: 'Die gespeicherten Formen ziehen mit — 0.24.2'
  },
  {
    nr: '705', name: 'Die Marke des Mailtests zieht nicht mit',
    file: 'db.js',
    search: "pairs: { marke: 'mark', am: 'at' } }",
    replacement: "pairs: { am: 'at' } }",
    expected: 'Die gespeicherten Formen ziehen mit — 0.24.2'
  },
  {
    nr: '706', name: 'Der Block meldet sich auch, wenn er nichts getan hat',
    file: 'db.js',
    search: '  if (!counted.length) return 0;',
    replacement: "  if (!counted.length) counted.push('(nichts)');",
    expected: 'Die gespeicherten Formen ziehen mit — 0.24.2'
  },
  {
    nr: '707', name: 'Bei zwei Namen gewinnt wieder der alte',
    file: 'db.js',
    search: '        if (!Object.prototype.hasOwnProperty.call(out, fresh)) out[fresh] = out[old];',
    replacement: '        out[fresh] = out[old];',
    expected: 'Die gespeicherten Formen ziehen mit — 0.24.2'
  },
  {
    nr: '708', name: 'Der Block greift nach dem Vokabular, das deutsch bleiben soll',
    file: 'db.js',
    search: "  { key: 'mailtestOk', each: false, pairs: { marke: 'mark', am: 'at' } }",
    replacement: "  { key: 'mailtestOk', each: false, pairs: { marke: 'mark', am: 'at' } },\n" +
      "  { key: 'vocabulary', each: false, pairs: { sacheEinzahl: 'thingSingular' } }",
    expected: 'Die gespeicherten Formen ziehen mit — 0.24.2'
  },
  {
    nr: '709', name: 'Der Schluessel des Mailzugangs ist verschrieben',
    file: 'db.js',
    search: "{ key: 'mailzugang', each: false,",
    replacement: "{ key: 'mailZugang', each: false,",
    expected: 'Die gespeicherten Formen ziehen mit — 0.24.2'
  },
  /* ---- 0.24.3: die zweite Sprache ---- */
  /* DIE DREI KLAMMERN AM VERZEICHNIS (F6). Jede einzeln zurueckgebaut: eine
     Klammer, die nur gemeinsam mit den anderen greift, ist keine. */
  {
    nr: '710', name: 'Eine Datei mit kaputtem JSON nimmt den Server wieder mit',
    file: 'server.js',
    search: "    } catch (e) {\n      languageSkip(file, `sie laesst sich nicht lesen (${e.message})`);\n      continue;\n    }",
    replacement: "    } catch (e) { throw e; }",
    expected: 'Die Fremddatei und der Dateiname — 0.24.3'
  },
  {
    nr: '711', name: 'Eine unbrauchbare _locale nimmt den Server wieder mit',
    file: 'server.js',
    search: "    try { new Intl.PluralRules(texts._locale); }\n    catch {\n      languageSkip(file, `Intl kennt die Locale \"${texts._locale}\" nicht`);\n      continue;\n    }",
    replacement: "    new Intl.PluralRules(texts._locale);",
    expected: 'Die Fremddatei und der Dateiname — 0.24.3'
  },
  {
    nr: '712', name: 'Der Dateiname wird nicht mehr geprueft',
    file: 'server.js',
    search: "    if (!LANGUAGE_NAME.test(code)) {",
    replacement: "    if (false) {",
    expected: 'Die Fremddatei und der Dateiname — 0.24.3'
  },
  /* UND DIE MELDUNG SELBST. Eine still uebergangene Datei sieht fuer den
     Eigentuemer aus wie eine, die gar nicht ankommt. */
  {
    nr: '713', name: 'Die uebergangene Datei wird nicht mehr genannt',
    file: 'server.js',
    search: "const languageSkip = (file, why) => console.error(\n  `[languages] ${file} zaehlt nicht als Sprache: ${why}`);",
    replacement: "const languageSkip = (file, why) => file && why;",
    expected: 'Die Fremddatei und der Dateiname — 0.24.3'
  },
  /* DER VORRAT (F9). Zwei Klammern: die Wahl je Benutzer und die Vorgabe. */
  {
    nr: '714', name: 'Ein Benutzer darf wieder jede Sprache setzen, auch eine gesperrte',
    file: 'server.js',
    search: "    if (!languagePool().includes(wanted))",
    replacement: "    if (!LANGUAGES[wanted])",
    expected: 'Der Vorrat der Sprachen — 0.24.3'
  },
  {
    /* DIE KLEMME STEHT AN ZWEI STELLEN, UND DESHALB SIND ES ZWEI RUECKBAUTEN.
       writeLanguages() legt die Vorgabe beim SCHREIBEN in den Vorrat zurueck,
       languagePool() beim LESEN. Die erste Fassung dieser Gegenprobe nahm nur
       eine der beiden weg und blieb STUMM: die andere hat sie aufgefangen,
       und der Waechter sah nichts. Das war keine Schwaeche des Baus, sondern
       eine des Waechters -- er hat die Doppelung nur als Ganzes gesehen.
       SEIT 0.24.3 PRUEFT DER WAECHTER JEDE HAELFTE EINZELN: die schreibende
       an der Zeile in der Ablage, die lesende an einem Vorrat, der am
       Schreibweg vorbei hineingelegt wird. Erst damit hat jede Haelfte ihre
       eigene Gegenprobe. */
    nr: '715', name: 'Die Vorgabesprache faellt beim SCHREIBEN aus dem Vorrat',
    file: 'server.js',
    search: "  if (!set.includes(std)) set.push(std);",
    replacement: "  if (false) set.push(std);",
    expected: 'Der Vorrat der Sprachen — 0.24.3'
  },
  {
    nr: '733', name: 'Die Vorgabesprache faellt beim LESEN aus dem Vorrat',
    file: 'server.js',
    search: "  return pool.includes(std) ? pool : [std, ...pool];",
    replacement: "  return pool;",
    expected: 'Der Vorrat der Sprachen — 0.24.3'
  },
  /* DER RUECKFALL DER NAMEN (F8a, F8b). Der erste ist der Befund aus
     Bauabschnitt 6a: ein Admin, der Deutsch liest, benennt sonst nie um. */
  {
    nr: '716', name: 'Ohne Sprachangabe meint der Schreibweg wieder die Sprache des Lesers',
    file: 'server.js',
    search: "  if (wanted === undefined) return rowLanguage;",
    replacement: "  if (wanted === undefined) return localeOf(req);",
    expected: 'Der Rueckfall der Namen — 0.24.3'
  },
  {
    /* MITGEGANGEN MIT 0.25.0 (Stolperstein 201). Bis 0.24.6 baute dieser
       Rueckbau die Loeschung „eine Uebersetzung, die der Grundzeile gleicht"
       zurueck -- die Regel ist mit dieser Runde weggefallen (die Grundzeile hat
       jetzt eine eigene Sprache, und ein gleicher Name ist eine Uebersetzung).
       An ihre Stelle tritt die Frage, um die es seither geht: WELCHE Zeile ein
       Umbenennen trifft. */
    nr: '717', name: 'Die Grundzeile haengt wieder an der Vorgabesprache',
    file: 'server.js',
    search: "  if (language === rowLanguage) return true;",
    replacement: "  if (language === languageDefault()) return true;",
    expected: 'Die Kette am Server — 0.25.0'
  },
  {
    nr: '718', name: 'Die Namenstabelle haengt nicht mehr an ihrer Grundzeile',
    file: 'db.js',
    search: "CREATE TABLE IF NOT EXISTS criterion_names (\n  criterion_id INTEGER NOT NULL REFERENCES rating_criteria(id) ON DELETE CASCADE,",
    replacement: "CREATE TABLE IF NOT EXISTS criterion_names (\n  criterion_id INTEGER NOT NULL,",
    expected: 'Der Rueckfall der Namen — 0.24.3'
  },
  {
    /* NICHT DIE TABELLE WEGNEHMEN: eine Abfrage auf eine Tabelle, die es
       nicht gibt, nimmt den Server beim Vorbereiten mit, und der Lauf reisst
       ab statt namentlich rot zu werden. Zurueckgebaut wird deshalb der
       LESEWEG -- die Liste kommt dann in jeder Sprache in der Grundfassung. */
    nr: '719', name: 'Die Kategorienamen werden nicht mehr je Sprache gelesen',
    file: 'server.js',
    search: "const categoryNames = (locale) => nameTable(qCategoryBase.all(), qCategoryNamesAll.all(), locale);",
    replacement: "const categoryNames = () => new Map();",
    expected: 'Der Rueckfall der Namen — 0.24.3'
  },
  /* DIE GESPEICHERTEN WERTE (F7). Der zweite Migrationsblock dieser Runde --
     und die vier Faelle, an denen ein Bestand etwas verloere. */
  {
    nr: '720', name: 'Das Vokabular steht nicht mehr in der Tafel der gespeicherten Namen',
    file: 'db.js',
    search: "  { table: 'settings', key: 'vocabulary',",
    replacement: "  { table: 'settings', key: 'vocabularyNichtMehr',",
    expected: 'Die deutschen Reste in gespeicherten Werten — 0.24.3'
  },
  {
    nr: '721', name: 'Der Block sieht das Vokabular nur auf der oberen Stufe an',
    file: 'db.js',
    search: "    reach: (v) => [v, ...Object.values(v || {})],",
    replacement: "    reach: (v) => [v],",
    expected: 'Die deutschen Reste in gespeicherten Werten — 0.24.3'
  },
  {
    nr: '722', name: 'Die gespeicherten Ansichten tragen ihren Filter weiter deutsch',
    file: 'db.js',
    search: "    reach: (v) => (Array.isArray(v) ? v.map(a => a && a.filters) : []),",
    replacement: "    reach: () => [],",
    expected: 'Die deutschen Reste in gespeicherten Werten — 0.24.3'
  },
  {
    nr: '723', name: 'Die beiden Sortierwerte ziehen nicht mit',
    file: 'db.js',
    search: "const FILTER_VALUES_0243 = [['sort', 'potenzial_desc', 'potential_desc'],",
    replacement: "const FILTER_VALUES_0243 = [['sort', 'potenzial_desc', 'potenzial_desc'],",
    expected: 'Die deutschen Reste in gespeicherten Werten — 0.24.3'
  },
  {
    nr: '724', name: 'Der Einklappzustand der Bloecke bleibt liegen',
    file: 'db.js',
    search: "    fields: [['seite', 'side'], ['unten', 'bottom'], ['zu', 'closed']], values: [] },",
    replacement: "    fields: [['seite', 'side'], ['unten', 'bottom']], values: [] },",
    expected: 'Die deutschen Reste in gespeicherten Werten — 0.24.3'
  },
  {
    nr: '725', name: 'Der Block meldet sich auch beim zweiten Start',
    file: 'db.js',
    search: "      if (!touched.length) continue;",
    replacement: "      if (!touched.length) touched.push('(nichts)');",
    expected: 'Die deutschen Reste in gespeicherten Werten — 0.24.3'
  },
  {
    nr: '726', name: 'Bei zwei Namen gewinnt wieder der alte -- in den gespeicherten Werten',
    file: 'db.js',
    search: "          if (!Object.prototype.hasOwnProperty.call(o, fresh)) o[fresh] = o[old];",
    replacement: "          o[fresh] = o[old];",
    expected: 'Die deutschen Reste in gespeicherten Werten — 0.24.3'
  },
  /* UND DER BLOCK, DER MEHR ANFASST ALS BESCHLOSSEN. Er ist die Gegenlage zu
     allen sechs darueber: ein Migrationsblock, der zu viel tut, richtet
     denselben Schaden an wie einer, der zu wenig tut. */
  {
    nr: '727', name: 'Der Block greift nach den Blocknamen, die deutsch bleiben sollen',
    file: 'db.js',
    search: "const FILTER_FIELDS_0243 = [['favorit', 'favorite']];",
    replacement: "const FILTER_FIELDS_0243 = [['favorit', 'favorite'], ['kategorie', 'category']];",
    expected: 'Die deutschen Reste in gespeicherten Werten — 0.24.3'
  },
  /* UND DIE VORGABESPRACHE DES BESTANDS (F2). Drei Rueckbauten, weil drei
     Dinge zusammen die Zusage tragen: dass der Block ueberhaupt schreibt,
     dass er die richtige Sprache schreibt, und dass er eine FRISCHE
     Installation nicht anfasst. */
  {
    nr: '728', name: 'Der Bestand bekommt keine Vorgabesprache mehr geschrieben',
    file: 'db.js',
    search: "  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')\n    .run('languageDefault', JSON.stringify(LANGUAGE_BEFORE_0243));",
    replacement: "  if (false) db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')\n    .run('languageDefault', JSON.stringify(LANGUAGE_BEFORE_0243));",
    expected: 'Der Bestand behaelt Deutsch — 0.24.3'
  },
  {
    nr: '729', name: 'Auch eine frische Installation bekommt die Vorgabesprache geschrieben',
    file: 'db.js',
    search: "  const grown = db.prepare('SELECT COUNT(*) AS n FROM users').get().n > 0;\n  if (!grown) return 0;",
    replacement: "  const grown = true;\n  if (!grown) return 0;",
    expected: 'Der Bestand behaelt Deutsch — 0.24.3'
  },
  {
    nr: '730', name: 'Der Block schreibt bei jedem Start neu und ueberfaehrt die Wahl',
    file: 'db.js',
    search: "  if (db.prepare(\"SELECT 1 FROM settings WHERE key = 'languageDefault'\").get()) return 0;",
    replacement: "  db.prepare(\"DELETE FROM settings WHERE key = 'languageDefault'\").run();",
    expected: 'Der Bestand behaelt Deutsch — 0.24.3'
  },
  /* UND DIE SPRACHFASSUNGEN IN DER DATEI (F8c). Zwei Rueckbauten: einer
     nimmt sie dem Export weg, der andere dem Import. Ein Export, der etwas
     mitnimmt, das der Import nicht wieder hineinlegt, ist ein halber Weg --
     und ein Import ohne Export haette nie etwas zu tun. */
  {
    nr: '731', name: 'Der Export nimmt die Sprachfassungen der Namen nicht mit',
    file: 'server.js',
    search: "           criteriaNames: exchangeCriterionNames(),\n           criteriaLanguages: exchangeCriterionLanguages(),\n           categoryNames: exchangeCategoryNames(),\n           categoryLanguages: exchangeCategoryLanguages(), items };",
    replacement: "           items };",
    expected: 'Der Rueckfall der Namen — 0.24.3'
  },
  {
    nr: '732', name: 'Der Import legt die Sprachfassungen nicht wieder hinein',
    file: 'server.js',
    search: "      ['criterion_names', 'criterion_id', critByName, payload.criteriaNames],",
    replacement: "      ['criterion_names', 'criterion_id', critByName, null],",
    expected: 'Der Rueckfall der Namen — 0.24.3'
  },
  /* ---- Die Sprachpillen der Namenskarten -- 0.24.5 ----
     ZWOELF RUECKBAUTEN FUER EINE REPARATUR, und das ist keine Uebertreibung:
     der Befund hatte drei Wege (D1, D2, D3), die Reparatur hat zwei Enden
     (Server und Karte), und die Haelfte der neuen Zusagen ist eine
     ABWESENHEIT -- kein Zwischenspeicher, kein Nachholen, kein fuenfter Wert
     an api(). Eine Abwesenheit laesst sich nur belegen, indem man sie
     probeweise zurueckholt. */
  {
    nr: '737', name: 'Die Namenstafeln fallen aus der Antwort',
    file: 'server.js',
    search: "  ...(isAdmin(req)\n    ? { categoryNames: categoryNamesAll(), criterionNames: criterionNamesAll() } : {}),\n",
    replacement: "",
    expected: 'Die Sprachpillen der Namenskarten — 0.24.5'
  },
  {
    nr: '738', name: 'Die Namenstafeln gehen an jeden -- auch an den, der nicht umschalten kann',
    file: 'server.js',
    search: "  ...(isAdmin(req)\n    ? { categoryNames: categoryNamesAll(), criterionNames: criterionNamesAll() } : {}),",
    replacement: "  categoryNames: categoryNamesAll(), criterionNames: criterionNamesAll(),",
    expected: 'Die Namenstafeln je Sprache — 0.24.5'
  },
  {
    /* DER RUECKFALL SCHON IN DER TAFEL EINGESETZT -- genau die Bauform, die bei
       den vierzehn Vokabelwoertern B2 verursacht hat: eine Tafel, in der der
       Rueckfall wie ein Eintrag aussieht, kann die Karte nicht mehr
       kennzeichnen.
       MITGEGANGEN MIT 0.25.0 (Stolperstein 201): seit dieser Runde SETZT die
       Tafel den Rueckfall ein und sagt es (`from`). Der Rueckbau nimmt genau
       das Sagen weg -- dann sieht jede Zelle aus wie ein Eintrag, die Zahl an
       der Pille faellt auf null, das ✕ stuende ueberall, und der Rahmen
       bliebe aus. */
    nr: '739', name: 'Die Namenstafel behauptet, jede Zelle sei eingetragen',
    file: 'server.js',
    search: "      table[row.id] = { name: hit.name, from: hit.from };",
    replacement: "      table[row.id] = { name: hit.name, from: code };",
    expected: 'Die Sprachpillen der Namenskarten — 0.24.5'
  },
  {
    /* UND DIE TAFEL ENTSCHEIDET WIEDER UEBER EINE SPRACHE. Ein Bauer, der eine
       Sprache annimmt, ist die alte Frage in neuer Form -- und der Rufer gibt
       keine mit, also bleibt genau eine Spalte gefuellt. */
    nr: '740', name: 'Der Bauer der Kriterientafel nimmt wieder eine Sprache an',
    file: 'server.js',
    search: "const criterionNamesAll = () => namesAll(qCriterionBase.all(), qCriterionNamesAll.all());",
    replacement: "const criterionNamesAll = () => {\n" +
      "  const all = namesAll(qCriterionBase.all(), qCriterionNamesAll.all());\n" +
      "  return { [languageDefault()]: all[languageDefault()] };\n};",
    expected: 'Die Sprachpillen der Namenskarten — 0.24.5'
  },
  {
    nr: '741', name: 'Der Listenweg folgt nicht mehr dem Leser',
    file: 'server.js',
    search: "app.get('/api/criteria', (req, res) => res.json(criteriaFor(localeOf(req))));",
    replacement: "app.get('/api/criteria', (req, res) => res.json(criteriaFor(languageDefault())));",
    expected: 'Die Namenstafeln je Sprache — 0.24.5'
  },
  {
    /* DER FUENFTE WERT AN api() -- er kommt zurueck, und nichts am Bildschirm
       aendert sich. Genau dafuer steht der Waechter da: ein Weg, der wieder
       offen ist, wird wieder benutzt. */
    nr: '742', name: 'api() nimmt wieder eine fremde Sprache an',
    file: 'public/app.js',
    search: "async function api(method, url, body, isForm = false) {",
    replacement: "async function api(method, url, body, isForm = false, language = LANGUAGE) {",
    expected: 'Die Namenstafeln je Sprache — 0.24.5'
  },
  {
    nr: '743', name: 'Der Kopf traegt wieder, was der Rufer verlangt',
    file: 'public/app.js',
    search: "                 headers: { 'Accept-Language': LANGUAGE } };",
    replacement: "                 headers: { 'Accept-Language': arguments[4] || LANGUAGE } };",
    expected: 'Die Namenstafeln je Sprache — 0.24.5'
  },
  {
    /* DER KERN: die Karte liest die Tafel nicht mehr und faellt auf die Liste
       des Lesers zurueck -- der Zustand von 0.24.4, an dem der Betreiber
       achtzehn Zellen gemessen hat. */
    nr: '744', name: 'Die Karte liest die Namenstafel nicht mehr',
    file: 'public/app.js',
    search: "  const shown = (NAMES_ALL[key] || {})[code];",
    replacement: "  const shown = null;",
    expected: 'Die Sprachpillen der Namenskarten — 0.24.5'
  },
  {
    nr: '745', name: 'Der Vermerk am Rueckfall faellt weg',
    file: 'public/app.js',
    search: "      const fallbackMark = entry.nameFallback === undefined ? ''\n" +
      "        : (entry.nameFallback === true",
    replacement: "      const fallbackMark = '' || (false",
    expected: 'Die Sprachpillen der Namenskarten — 0.24.5'
  },
  {
    nr: '746', name: 'Das Umbenennfeld traegt wieder den Rueckfall als Wert',
    file: 'public/app.js',
    search: "        inp.value = entry.nameFallback ? '' : entry.name;\n" +
      "        if (entry.nameFallback) inp.placeholder = entry.name;",
    replacement: "        inp.value = entry.name;",
    expected: 'Die Sprachpillen der Namenskarten — 0.24.5'
  },
  {
    /* UND DER ZWEITE WEG IN DIE LISTE -- der, den der Auftrag nicht kannte.
       drawAdmin() zeichnet nach jedem Umbenennen, Anlegen, Loeschen und
       Sortieren; las es an namesFrom vorbei, stand die Pille auf Türkçe ueber
       einer deutschen Liste. */
    nr: '747', name: 'drawAdmin liest wieder an namesFrom vorbei',
    file: 'public/app.js',
    search: "       keine Pillenreihe. */\n" +
      "    manageList('mcats', namesFrom(fetched, 'cats'), 'cat', fetched);",
    replacement: "       keine Pillenreihe. */\n" +
      "    manageList('mcats', fetched.cats, 'cat', fetched);",
    expected: 'Die Sprachpillen der Namenskarten — 0.24.5'
  },
  {
    nr: '748', name: 'adminNew zieht die Namenstafeln nicht nach',
    file: 'public/app.js',
    search: "    takeNames(settings);\n    drawAdmin(fetched);",
    replacement: "    drawAdmin(fetched);",
    expected: 'Die Sprachpillen der Namenskarten — 0.24.5'
  },
  /* ================= 0.24.6 — der Rueckfall sagt, was er zeigt ==========
     ZEHN RUECKBAUTEN FUER DREI TEILE, die zusammenhaengen: die Kette (E2),
     der Kartenhinweis (E1) und das Nachziehen der Tafeln (E3). Vier davon
     nehmen eine Zusage weg, die es bis 0.24.5 gar nicht gab -- und genau
     deshalb muessen sie gefahren werden: eine neue Zeile, die nie
     zurueckgebaut worden ist, ist eine Behauptung. */
  {
    /* DER DRITTE SCHRITT DER KETTE -- die Antwort des Betreibers auf F2. Ohne
       ihn bleibt die Kette bei der Vorgabesprache stehen, und eine Zeile,
       fuer die nur eine dritte Sprache etwas traegt, zeigt wieder, was
       hereinkam. */
    /* MITGEGANGEN MIT 0.25.0 (Stolperstein 201): die Kette steht seit dieser
       Runde AM SERVER und nicht mehr in der Karte -- dieselbe Zusage, ein
       anderer Ort, und sie gilt jetzt fuer JEDEN Leser. */
    nr: '749', name: 'Die Kette bricht nach der Vorgabesprache ab',
    file: 'server.js',
    search: "  for (const code of [std, row.language]) {",
    replacement: "  for (const code of [std]) {",
    expected: 'Die Kette am Server — 0.25.0'
  },
  {
    /* DER KERN DES BEFUNDS: der Vermerk nennt wieder die Sprache, die er
       zeigen WOLLTE, statt der, die wirklich dasteht. */
    nr: '750', name: 'Der Vermerk nennt wieder die Vorgabesprache',
    file: 'public/app.js',
    search: "    return { ...z, name: hit.name, nameFallback: hit.from === null ? true : hit.from };",
    replacement: "    return { ...z, name: hit.name, nameFallback: baseNamesLanguage() };",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DIE KLAMMER BEHAUPTET WIEDER EINE SPRACHE, statt keine zu nennen --
       das war die Zeile, die der Betreiber gemeldet hat. */
    /* MITGEGANGEN MIT 0.25.0: die Klammer ist der VIERTE Schritt der Kette
       und steht seither am Server. Sie behauptet keine Sprache -- der Rueckbau
       laesst sie eine behaupten, und danach steht „(nicht eingetragen — es
       steht Deutsch)" an einer Zeile, deren Sprache niemand kennt. */
    nr: '751', name: 'Die Klammer behauptet wieder eine Sprache',
    file: 'server.js',
    search: "  return { name: row.name, from: null, fallback: true };",
    replacement: "  return { name: row.name, from: languageDefault(), fallback: true };",
    expected: 'Die Kette am Server — 0.25.0'
  },
  {
    /* DIE REIHENFOLGE: die Vorgabesprache VOR der Erstellungssprache und
       nicht umgekehrt. Ein Rueckbau, der die Kette LAESST und nur ihre Ordnung
       dreht -- sonst waere die Reihenfolge eine Behauptung ohne Beleg.
       MITGEGANGEN MIT 0.25.0: bis 0.24.6 war es die Ordnung des VORRATS, jetzt
       sind es zwei benannte Schritte. Derselbe Suchtext wie 749, wie bei 233
       und 448 -- zwei Rueckbauten duerfen an derselben Zeile ziehen, solange
       sie verschiedene Dinge wegnehmen. */
    nr: '752', name: 'Die Kette laeuft in der umgekehrten Reihenfolge',
    file: 'server.js',
    search: "  for (const code of [std, row.language]) {",
    replacement: "  for (const code of [row.language, std]) {",
    expected: 'Die Kette am Server — 0.25.0'
  },
  /* RUECKBAU 753 IST MIT 0.25.0 WEGGEFALLEN und nicht mitgegangen -- „Die
     Kette nimmt auch Sprachen ausserhalb des Vorrats". Er hat keinen Ort mehr:
     die Kette LAEUFT NICHT MEHR UEBER DEN VORRAT. Sie hat drei benannte
     Schritte -- die Sprache des Lesers (`localeOf` klemmt sie gegen den
     Vorrat), die Vorgabe der Installation (die IST im Vorrat, an zwei Stellen
     erzwungen) und die Erstellungssprache der Zeile (die ist der Originaltext
     und keine Wahl). Eine vierte Sprache, die eine Klemme abweisen muesste,
     kommt gar nicht mehr vor. */
  {
    /* MITGEGANGEN MIT 0.25.0 (Stolperstein 201). Bis 0.24.6 baute dieser
       Rueckbau den Kartenhinweis zur Grundzeile zurueck; der Hinweis ist mit
       dieser Runde weggefallen (`card.namesBaseRow`), weil die Grundzeile
       seither eine eigene Sprache hat und der Satz damit falsch wurde.
       An seine Stelle tritt das Merkmal, das ihn ersetzt: der rote Rahmen an
       der Kachel (F3). Ohne ihn sagt die Karte nicht mehr, dass in DIESER
       Ansicht Arbeit liegt. */
    nr: '754', name: 'Der rote Rahmen an der Kachel faellt weg',
    file: 'public/app.js',
    search: "  if (card) card.classList.toggle('gaps', namesMissing(key, shownCode, only) > 0);",
    replacement: "  if (card) card.classList.toggle('gaps', false);",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DIE ANDERE HAELFTE: es steht ueberall. Ein Merkmal, das immer
       dasteht, sagt nichts mehr -- und ohne diesen Rueckbau bliebe die Zusage
       „und bei einer vollstaendigen Sprache NICHT" ungeprueft.
       ER ZIELT AUF DIE BEDINGUNG UND NICHT AUF DAS AUSSEHEN, und das hat der
       gefahrene Lauf von 0.24.6 entschieden: der erste Entwurf tauschte damals
       im Satz `baseNamesLanguage()` gegen `namesLanguage()` -- und weil der
       Satz nur gezeichnet wurde, WENN die beiden gleich sind, war der Rueckbau
       ein Nichts. **Er lief STUMM** und belegte gar nichts (ein Rueckbau muss
       die Stelle treffen, die die Zusage traegt).
       DERSELBE SUCHTEXT WIE 754 UND TROTZDEM EIN ZWEITER: der eine nimmt das
       Merkmal weg, der andere stellt es ueberall hin. Verschiedene Zusagen,
       verschiedene rote Punkte.
       MITGEGANGEN MIT 0.25.0, wie 754 und aus demselben Grund. */
    nr: '755', name: 'Der rote Rahmen steht an jeder Kachel',
    file: 'public/app.js',
    search: "  if (card) card.classList.toggle('gaps', namesMissing(key, shownCode, only) > 0);",
    replacement: "  if (card) card.classList.toggle('gaps', true);",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* E3 SELBST: die Karte zieht die Tafeln nach dem Wechsel der
       Vorgabesprache nicht nach -- der Zustand von 0.24.5, in dem der
       Betreiber den Befund gemeldet hat. */
    nr: '756', name: 'Der Wechsel der Vorgabesprache zieht die Tafeln nicht nach',
    file: 'public/app.js',
    search: "      takeNames(s);\n      drawLanguages();",
    replacement: "      drawLanguages();",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DIE WURZEL AM SERVER: die Antwort des Wechsels traegt die Tafeln
       gar nicht erst. Die Karte kann dann nichts nachziehen. */
    nr: '757', name: 'Die Antwort des Wechsels traegt die Namenstafeln nicht',
    file: 'server.js',
    search: "             ...(isAdmin(req) && languagesTouched\n" +
      "               ? { categoryNames: categoryNamesAll(), criterionNames: criterionNamesAll() } : {}),",
    replacement: "",
    expected: 'Die Namenstafeln je Sprache — 0.24.5'
  },
  {
    /* UND DIE BEDINGUNG DANEBEN: jede Antwort dieses Weges traegt die Tafeln,
       auch die auf ein gespeichertes Filterfeld. Ohne diesen Rueckbau waere
       „nur wenn die Sprachfrage beruehrt war" eine Behauptung. */
    nr: '758', name: 'Jede Antwort des Schreibwegs traegt die Namenstafeln',
    file: 'server.js',
    search: "             ...(isAdmin(req) && languagesTouched",
    replacement: "             ...(isAdmin(req)",
    expected: 'Die Namenstafeln je Sprache — 0.24.5'
  },
  {
    /* UND DER BEFUND, DEN DER AUFTRAG NICHT KANNTE: der Gewichtswechsel
       schickt seinen Namen wieder OHNE Sprachangabe -- und ohne Angabe meint
       der Server die Grundzeile. Ein Gewicht auf der Pille „English" benannte
       damit die Grundzeile in den englischen Namen um. */
    nr: '759', name: 'Der Gewichtswechsel schickt den Namen ohne Sprache',
    file: 'public/app.js',
    search: "          const now = await api('PUT', `${url}/${entry.id}`, spec.perLanguage\n" +
      "            ? { name: entry.name, weight: g,\n" +
      "                ...(nameLanguage === null ? {} : { language: nameLanguage }) }\n" +
      "            : { name: entry.name, weight: g });",
    replacement: "          const now = await api('PUT', `${url}/${entry.id}`, " +
      "{ name: entry.name, weight: g });",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  /* ================= 0.25.0 — der Name weiss, in welcher Sprache ========
     NEUNZEHN RUECKBAUTEN FUER FUENF BAUABSCHNITTE: die Datenbankstufe, die
     Kette am Server, die Adminkarte, das Vokabular und den Beipack. Jeder
     nimmt EINE Zusage weg -- und keiner von ihnen hatte vor dieser Runde
     etwas, worauf er haette zeigen koennen. */
  {
    /* DIE STUFE MELDET SICH NICHT MEHR. Ein Migrationsblock, der still laeuft,
       ist von einem, der gar nicht laeuft, nicht zu unterscheiden -- und der
       Betreiber erfaehrt nicht, wie viele Namen auf die Nachfrage warten.

       WARUM NICHT „nur EINE der beiden Spalten": das ist gefahren worden und
       REISST DEN LAUF AB. Eine halb nachgeruestete Datenbank bekommt der
       Server gar nicht mehr auf -- `qCriteria` fragt `c.language`, und das
       Vorbereiten der Abfrage scheitert beim Start. **Ein abgerissener
       Rueckbau belegt nichts** (Stolperstein 161), und deshalb steht hier der
       Rueckbau, der dieselbe Stelle anfasst und den Lauf stehen laesst. */
    nr: '760', name: 'Die Datenbankstufe meldet sich nicht',
    file: 'db.js',
    search: "  console.log(`[Kriterion] ${missing.join(' und ')} um language ergaenzt (Migration auf 0.25.0); ` +",
    replacement: "  if (false) console.log(`[Kriterion] ${missing.join(' und ')} (0.25.0); ` +",
    expected: 'Die Datenbankstufe 0.25.0'
  },
  {
    /* UND DIE ANTWORT AUF F2: der Block FUELLT, statt nachzufragen. Genau das
       ist die Behauptung, die diese Runde beseitigt -- eine Instanz, deren
       Vorgabe heute `tr` ist, bekaeme einen ganzen Satz Zeilen, die „auf
       Tuerkisch" heissen und es nicht sind. */
    nr: '761', name: 'Die Migration traegt die Vorgabesprache ein, statt nachzufragen',
    file: 'db.js',
    search: "  for (const table of missing) db.exec(`ALTER TABLE ${table} ADD COLUMN language TEXT`);",
    replacement: "  for (const table of missing) {\n" +
      "    db.exec(`ALTER TABLE ${table} ADD COLUMN language TEXT`);\n" +
      "    db.exec(`UPDATE ${table} SET language = 'de'`);\n  }",
    expected: 'Die Datenbankstufe 0.25.0'
  },
  {
    /* UND DIE GRUNDAUSSTATTUNG SAGT NICHT MEHR, IN WELCHER SPRACHE SIE STEHT.
       Die drei mitgelieferten Kriterien sind deutsch; ohne den Vermerk faellt
       eine frische Installation fuer sie in den vierten Schritt der Kette. */
    nr: '762', name: 'Die mitgelieferten Kriterien bekommen keine Sprache',
    file: 'db.js',
    search: "  for (const c of seedCriteria) insertCriterion.run(c, SEED_LANGUAGE);",
    replacement: "  for (const c of seedCriteria) insertCriterion.run(c, null);",
    expected: 'Die Datenbankstufe 0.25.0'
  },
  {
    /* DIE KETTE: eine neue Kategorie entsteht wieder OHNE Sprachvermerk. Ab
       dieser Runde soll das nicht mehr vorkommen -- und die Zeile faellt
       danach fuer jeden Leser in den vierten Schritt. */
    nr: '763', name: 'Eine neue Kategorie entsteht wieder ohne Sprachvermerk',
    file: 'server.js',
    search: "  const i = db.prepare('INSERT INTO product_categories (name, language) VALUES (?, ?)')\n" +
      "    .run(name, catNew);",
    replacement: "  const i = db.prepare('INSERT INTO product_categories (name) VALUES (?)').run(name);",
    expected: 'Die Kette am Server — 0.25.0'
  },
  {
    /* UND DIE SPRACHE EINER NEUEN ZEILE IST WIEDER DIE VORGABE DER
       INSTALLATION statt der des Rufers. Wer auf Deutsch liest und anlegt,
       bekaeme eine Zeile, die „auf Englisch" heisst. */
    nr: '764', name: 'Eine neue Zeile bekommt die Vorgabe statt der Sprache des Rufers',
    file: 'server.js',
    search: "  if (wanted === undefined) return localeOf(req);\n" +
      "  return typeof wanted === 'string' && LANGUAGES[wanted] ? wanted : null;",
    replacement: "  if (wanted === undefined) return languageDefault();\n" +
      "  return typeof wanted === 'string' && LANGUAGES[wanted] ? wanted : null;",
    expected: 'Die Kette am Server — 0.25.0'
  },
  {
    /* DER EINE GRIFF WIRD ZUM UMSCHREIBER: er fasst auch die Zeilen an, die
       ihre Sprache schon kennen. Aus einer Nachfrage wird damit ein Befehl. */
    nr: '765', name: 'Der eine Griff schreibt auch die Zeilen um, die ihre Sprache kennen',
    file: 'server.js',
    search: "  const categories = db.prepare('UPDATE product_categories SET language = ? WHERE language IS NULL')",
    replacement: "  const categories = db.prepare('UPDATE product_categories SET language = ?')",
    expected: 'Die Kette am Server — 0.25.0'
  },
  {
    /* UND DAS ✕ RAEUMT DEN ORIGINALTEXT MIT. `name` ist `NOT NULL`, und eine
       Zeile ohne Namen waere keine -- der Rueckbau nimmt die Absage weg. */
    nr: '766', name: 'Das ✕ raeumt auch den Originaltext',
    file: 'server.js',
    search: "  if (language === row.language)\n" +
      "    return res.status(400).json({ error: t(localeOf(req), 'server.nameOriginalStays')});",
    replacement: "  if (false)\n" +
      "    return res.status(400).json({ error: t(localeOf(req), 'server.nameOriginalStays')});",
    expected: 'Der Rueckfall der Namen — 0.24.3'
  },
  {
    /* DER EXPORT LAESST DIE ERSTELLUNGSSPRACHEN LIEGEN -- der Befund, den der
       Auftrag nicht kannte: der Import ist ein Anlegeweg wie jeder andere, und
       ohne diese beiden Felder legte er Zeilen ohne Sprachvermerk an. */
    nr: '767', name: 'Der Export nimmt die Erstellungssprachen nicht mit',
    file: 'server.js',
    search: "           criteriaNames: exchangeCriterionNames(),\n" +
      "           criteriaLanguages: exchangeCriterionLanguages(),",
    replacement: "           criteriaNames: exchangeCriterionNames(),",
    expected: 'Der Rueckfall der Namen — 0.24.3'
  },
  {
    /* UND DER IMPORT UEBERGEHT SIE, auch wenn die Datei sie traegt.
       ZWEI RUECKBAUTEN UND NICHT EINER: die beiden Tabellen haben je ein
       eigenes Feld und je einen eigenen Weg -- ein Kriterium entsteht aus der
       Kriterienliste, eine Kategorie ausschliesslich dadurch, dass ein Eintrag
       sie nennt. **Der erste Anlauf hat nur die Kategorien zurueckgebaut und
       lief STUMM**, weil die Zusage darueber am Kriterium gemessen wurde. */
    nr: '768', name: 'Der Import uebergeht die Erstellungssprache der Kriterien',
    file: 'server.js',
    search: "    const critLanguages = fileLanguage(payload.criteriaLanguages);",
    replacement: "    const critLanguages = fileLanguage(null);",
    expected: 'Der Rueckfall der Namen — 0.24.3'
  },
  {
    /* UND DIE ANDERE HAELFTE: die Kategorien. */
    nr: '779', name: 'Der Import uebergeht die Erstellungssprache der Kategorien',
    file: 'server.js',
    search: "    const catLanguages = fileLanguage(payload.categoryLanguages);",
    replacement: "    const catLanguages = fileLanguage(null);",
    expected: 'Der Rueckfall der Namen — 0.24.3'
  },
  {
    /* DIE KARTE: die Pille traegt kein Merkmal mehr -- weder Punkt noch Zahl.
       Wer wissen will, ob fuer Tuerkisch noch etwas fehlt, drueckt sie und
       liest zwanzig Zeilen durch (Befund A3). */
    nr: '769', name: 'Die Pille traegt weder Punkt noch Zahl',
    file: 'public/app.js',
    search: "    b.innerHTML = esc(a.name) + (gaps\n" +
      "      ? `<span class=\"n\">${gaps}</span>`\n" +
      "      : '<span class=\"dot\" aria-hidden=\"true\">●</span>');\n" +
      "    b.title = gaps ? t('card.languageMissing', { n: gaps }) : t('card.languageComplete');",
    replacement: "    b.textContent = a.name;",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DIE ZAHL ZAEHLT ALLE ZELLEN STATT DER FEHLENDEN. Sie stuende dann
       an jeder Pille und saegte nichts ueber die Arbeit. */
    nr: '770', name: 'Die Zahl an der Pille zaehlt alle Zellen statt der fehlenden',
    file: 'public/app.js',
    search: "  return Object.entries(table).filter(([id, z]) =>\n" +
      "    (!only || only.has(Number(id))) && (!z || z.from !== code)).length;",
    replacement: "  return Object.entries(table).filter(([id]) =>\n" +
      "    !only || only.has(Number(id))).length;",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DER GELIEHENE NAME WIRD NICHT MEHR GEDAEMPFT. Die dritte Vorgabe des
       Betreibers: fehlende Zellen gedaempft markiert. */
    nr: '771', name: 'Der geliehene Name wird nicht mehr gedaempft',
    file: 'public/app.js',
    search: "        <span class=\"mname${\n" +
      "          entry.nameFallback === undefined ? '' : ' back'}\">${esc(entry.name)}</span>",
    replacement: "        <span class=\"mname\">${esc(entry.name)}</span>",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DAS ✕ STEHT AN JEDER ZEILE -- auch dort, wo es nichts zu raeumen
       gibt, und am Originaltext, der bleiben muss. */
    nr: '772', name: 'Das ✕ steht an jeder Zeile',
    file: 'public/app.js',
    search: "      const mayClear = may && spec.perLanguage && entry.nameFallback === undefined &&\n" +
      "        entry.language !== namesLanguage();",
    replacement: "      const mayClear = may && spec.perLanguage;",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND ES SCHICKT WIEDER EINEN NAMEN STATT DES RAEUMZEICHENS. Der Server
       sagte darauf `server.nameMissing`, und geraeumt waere nichts. */
    nr: '773', name: 'Das ✕ schickt einen leeren Namen statt des Raeumzeichens',
    file: 'public/app.js',
    search: "          await api('PUT', `${url}/${entry.id}`,\n" +
      "            { clearName: true, language: namesLanguage() });",
    replacement: "          await api('PUT', `${url}/${entry.id}`,\n" +
      "            { name: '', language: namesLanguage() });",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DER KASTEN FUER DIE UNBEKANNTE SPRACHE STEHT IMMER -- auch, wenn es
       nichts mehr zu fragen gibt. Eine Nachfrage, die nach der Antwort
       stehenbleibt, ist keine. */
    nr: '774', name: 'Der Kasten fuer die unbekannte Sprache steht immer',
    file: 'public/app.js',
    search: "  box.hidden = open === 0;",
    replacement: "  box.hidden = false;",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* DAS VOKABULAR: die Pille traegt kein Merkmal. *„Das gilt natürlich auch
       für Vokabular."* */
    nr: '775', name: 'Die Vokabelpille traegt weder Punkt noch Zahl',
    file: 'public/app.js',
    search: "      b.innerHTML = esc(a.name) + (gaps\n" +
      "        ? `<span class=\"n\">${gaps}</span>`\n" +
      "        : '<span class=\"dot\" aria-hidden=\"true\">●</span>');\n" +
      "      b.title = gaps ? t('card.wordsMissing', { n: gaps }) : t('card.languageComplete');",
    replacement: "      b.textContent = a.name;",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DAS LEERE VOKABELFELD WIRD NICHT MEHR MARKIERT. */
    nr: '776', name: 'Das leere Vokabelfeld wird nicht mehr markiert',
    file: 'public/app.js',
    search: "          ${VOCABULARY_FIELDS.map(([id, key, name]) => `<div class=\"field${\n" +
      "            vocabularyShown()[key] ? '' : ' gap'}\"><label for=\"${id}\">${esc(name())}",
    replacement: "          ${VOCABULARY_FIELDS.map(([id, key, name]) => `<div class=\"field\"><label for=\"${id}\">${esc(name())}",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DIE ANSAGE NACH DEM UMSCHALTEN FAELLT WEG (F4). Der Betreiber darf
       auf eine lueckige Sprache umstellen -- aber er soll es erfahren. */
    nr: '777', name: 'Die Ansage nach dem Umschalten faellt weg',
    file: 'public/app.js',
    search: "    if (gapCode && gaps.names + gaps.words > 0) {",
    replacement: "    if (false) {",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* UND DIE PILLENREIHEN WERDEN NACH EINEM UMBENENNEN NICHT NACHGEZOGEN --
       die Zahl darin bliebe auf dem Stand von vorhin stehen. Dieselbe Bauform
       wie D2 der Runde 0.24.5, an einer neuen Stelle. */
    nr: '778', name: 'Die Pillenreihen werden nach einem Umbenennen nicht nachgezogen',
    file: 'public/app.js',
    search: "    drawNameLanguages('ncatlang', 'cats');\n    drawNamesUnknown(fetched);",
    replacement: "    drawNamesUnknown(fetched);",
    expected: 'Die Karte sagt, wo Arbeit liegt — 0.25.0'
  },
  {
    /* ================= 0.25.1 =========================================
       DIE ZAHL AN DER PILLE ZAEHLT WIEDER BEIDE KRITERIENKARTEN. Das ist
       der gemeldete Zustand von 0.25.0: die Tafel `crits` traegt beide
       Karten, und ohne die Auswahl der Kachel stand ueber „Bewertung" und
       ueber „Potenzial" dieselbe Summe. */
    nr: '780', name: 'Die Zahl an der Pille zaehlt wieder beide Kriterienkarten',
    file: 'public/app.js',
    search: "    const gaps = namesMissing(key, a.code, only);",
    replacement: "    const gaps = namesMissing(key, a.code);",
    expected: 'Jede Kachel zaehlt ihre eigene Arbeit — 0.25.1'
  },
  {
    /* UND DER ROTE RAHMEN TUT ES AUCH. Zwei Aussagen, zwei Rueckbauten: die
       Zahl sagt „so viel liegt hier", der Rahmen sagt „hier liegt etwas".
       Ein Rueckbau, der beide traefe, liesse offen, welche von beiden haelt.
       DERSELBE SUCHTEXT WIE 754 UND 755, und aus demselben Grund wie dort:
       an einer Zeile haengen drei verschiedene Zusagen. */
    nr: '781', name: 'Der rote Rahmen zaehlt wieder beide Kriterienkarten',
    file: 'public/app.js',
    search: "  if (card) card.classList.toggle('gaps', namesMissing(key, shownCode, only) > 0);",
    replacement: "  if (card) card.classList.toggle('gaps', namesMissing(key, shownCode) > 0);",
    expected: 'Jede Kachel zaehlt ihre eigene Arbeit — 0.25.1'
  },
  {
    /* UND DIE KARTE REICHT DIE ZEILEN GAR NICHT ERST DURCH -- beim AUFBAU.
       Die Pillenreihe entsteht an zwei Stellen, und beide muessen die
       Auswahl kennen; dieser Rueckbau trifft die erste. */
    nr: '782', name: 'Die erste Zeichnung reicht der Pillenreihe die Zeilen nicht',
    file: 'public/app.js',
    search: "  drawNameLanguages(`${k.list}-lang`, 'crits', rows);",
    replacement: "  drawNameLanguages(`${k.list}-lang`, 'crits');",
    expected: 'Jede Kachel zaehlt ihre eigene Arbeit — 0.25.1'
  },
  {
    /* UND DIE ZWEITE: das Neuzeichnen nach einem Griff (`drawAdmin`). Bis
       0.25.0 standen Liste und Pillenreihe dort in ZWEI Schleifen, und nur
       die eine kannte die Phase -- genau die Bauform, aus der der Befund
       entstanden ist. Ohne diesen Rueckbau bliebe unbelegt, dass die
       Trennung ein Raeumen ueberlebt. */
    nr: '783', name: 'Das Neuzeichnen reicht der Pillenreihe die Zeilen nicht',
    file: 'public/app.js',
    search: "      drawNameLanguages(`${CRIT_CARD[phase].list}-lang`, 'crits', rows);",
    replacement: "      drawNameLanguages(`${CRIT_CARD[phase].list}-lang`, 'crits');",
    expected: 'Jede Kachel zaehlt ihre eigene Arbeit — 0.25.1'
  },
  {
    /* UND DER VERMERK SITZT WIEDER IM NAMENSKASTEN -- der Zustand, in dem
       er in der Kriterienkarte mit Auslassung kuerzte, weil ihm nur die
       Namensspalte blieb.
       ER STEHT DANACH ZWEIMAL IN DER ZEILE, einmal im Kasten und einmal am
       Ende: ein Rueckbau tauscht EINE Stelle, und die Zusage haengt an der
       ersten, die `querySelector` findet. Das ist gewollt und genuegt --
       gepruefft wird, WO der Vermerk haengt und ob es den Kasten gibt. */
    nr: '784', name: 'Der Vermerk sitzt wieder im Namenskasten',
    file: 'public/app.js',
    search: "        <span class=\"mname${\n" +
      "          entry.nameFallback === undefined ? '' : ' back'}\">${esc(entry.name)}</span>",
    replacement: "        <span class=\"mnamebox\"><span class=\"mname${\n" +
      "          entry.nameFallback === undefined ? '' : ' back'}\">${esc(entry.name)}</span>${fallbackMark}</span>",
    expected: 'Jede Kachel zaehlt ihre eigene Arbeit — 0.25.1'
  },
  {
    /* UND DIE ZEILE BEKOMMT DEN UMBRUCH NICHT. Ohne ihn bliebe der Vermerk
       ein Feld neben den anderen: `flex-basis: 100%` wirkt nur in einer
       Zeile, die umbrechen darf. */
    nr: '785', name: 'Die Zeile mit Vermerk bekommt den Umbruch nicht',
    file: 'public/app.js',
    search: "      if (entry.nameFallback !== undefined) row.classList.add('withback');",
    replacement: "      if (false) row.classList.add('withback');",
    expected: 'Jede Kachel zaehlt ihre eigene Arbeit — 0.25.1'
  },
  {
    /* UND DER SATZ NENNT DIE FEHLENDE SPRACHE NICHT -- der Wortlaut von
       0.25.0, den der Betreiber als „irgendwie ein nicht klarer satz"
       gemeldet hat. */
    nr: '786', name: 'Der Vermerk nennt die fehlende Sprache nicht',
    file: 'public/languages/de.json',
    search: "\"card.nameFallback\": \"(kein Eintrag in {missing} — gezeigt wird {language})\"",
    replacement: "\"card.nameFallback\": \"(nicht eingetragen — es steht {language})\"",
    expected: 'Jede Kachel zaehlt ihre eigene Arbeit — 0.25.1'
  },
  {
    /* UND EIN ALLEINSTEHENDES „yedek" BLEIBT IM TUERKISCHEN STEHEN. Ein
       Waechter ueber alle Saetze faengt auch den einen, der wieder
       hineinrutscht -- ohne diesen Rueckbau bliebe unbelegt, dass er das
       tut. */
    nr: '787', name: 'Ein alleinstehendes „yedek" bleibt im Tuerkischen stehen',
    file: 'public/languages/tr.json',
    search: "\"card.lastBackup\": \"Son yedekleme\"",
    replacement: "\"card.lastBackup\": \"Son yedek\"",
    expected: '„Backup" heisst auf Tuerkisch yedekleme — 0.25.1'
  },
  {
    /* ================= 0.25.2 =========================================
       DER STEMPEL DES SERVERS REIST WIEDER MIT. Das ist der gemeldete
       Zustand: auf der Pille „Deutsch" steht der Punkt, und darunter
       behauptet jede Zeile, fuer Deutsch sei nichts eingetragen -- weil der
       Vermerk aus der Sprache des LESERS stammt und mit der Sprache der
       PILLE beschriftet wird. */
    nr: '788', name: 'Der Stempel des Servers reist wieder mit',
    file: 'public/app.js',
    search: "    if (hit.from === code) return { ...z, name: hit.name, nameFallback: undefined };",
    replacement: "    if (hit.from === code) return { ...z, name: hit.name };",
    expected: 'Ein Leser, der anders liest — 0.25.2'
  },
  {
    /* UND DIE ZWEITE ANGABE STEHT WIEDER IM QUELLTEXT. Sie tut dann nichts --
       und genau das ist der Punkt: eine Angabe, die dieselbe Frage beantwortet
       und noch niemand liest, ist der Anfang, nicht das Ende (Stolperstein 47).
       Der Waechter ueber den Quelltext muss sie finden.

       DER ERSTE ENTWURF ZIELTE AUF DIE KLICKWEICHE und liess den
       Vokabelumschalter ins Leere schreiben. ER HAT DEN LAUF ABGERISSEN
       („Cannot convert undefined or null to object"): aeltere Gruppen schalten
       die Kachel um und rechnen danach mit dem, was dort steht -- ohne
       Umschalten greifen sie ins Leere. Ein Rueckbau, der den Lauf
       niederreisst, belegt nichts (dieselbe Lage wie 760 in 0.25.0). Und er
       war ohnehin ueberfluessig: mit EINER Angabe gibt es keine zwei
       Richtungen, die getrennt kaputtgehen koennten -- 790 nimmt sie beide. */
    nr: '789', name: 'Die zweite Angabe steht wieder im Quelltext',
    file: 'public/app.js',
    search: "let NAMES_SHOWN = null;",
    replacement: "let NAMES_SHOWN = null;\nlet VOCABULARY_SHOWN = null;",
    expected: 'Ein Leser, der anders liest — 0.25.2'
  },
  {
    /* UND ER LIEST WIEDER SEINE EIGENE. Die andere Haelfte desselben
       Gleichlaufs: wer schreibt, aber woanders liest, bewegt sich nicht mit,
       wenn eine NACHBARKACHEL umschaltet. Zwei Rueckbauten, weil es zwei
       Richtungen sind. */
    nr: '790', name: 'Der Vokabelumschalter liest wieder seine eigene Angabe',
    file: 'public/app.js',
    search: "      b.className = 'pill' + (namesLanguage() === a.code ? ' on' : '');",
    replacement: "      b.className = 'pill' + (LANGUAGE === a.code ? ' on' : '');",
    expected: 'Ein Leser, der anders liest — 0.25.2'
  },
  {
    /* ================= 0.25.3 =========================================
       DIE FELDER EINER VOKABELZEILE FLIESSEN WIEDER VON OBEN. Das ist der
       gemeldete Zustand: braucht eine Beschriftung zwei Zeilen und die
       daneben eine, steht das eine Eingabefeld tiefer als das andere.
       ER NIMMT BEIDE ZEILEN AUF EINMAL, und das ist hier richtig: sie sind
       EINE Reparatur -- ohne die Spalte gibt es keine Unterkante, und ohne
       die Unterkante nuetzt die Spalte nichts. Zwei Rueckbauten waeren zwei
       Haelften derselben Zusage. */
    nr: '791', name: 'Die Felder einer Vokabelzeile fliessen wieder von oben',
    file: 'public/style.css',
    search: ".vocabulary-grid .field { margin-bottom: 10px; display: flex; flex-direction: column; }\n" +
      ".vocabulary-grid .field .input { margin-top: auto; }",
    replacement: ".vocabulary-grid .field { margin-bottom: 10px; }",
    expected: 'Zwei Felder in einer Zeile stehen auf einer Linie — 0.25.3'
  },
  {
    /* ================= 0.25.4 =========================================
       DAS FREISTEHENDE WOERTCHEN STEHT WIEDER DA, WO EIN VERB HINGEHOERT.
       Das ist der Befund selbst und nicht seine Umgebung: „değil" allein
       verneint im Tuerkischen nichts, die Verneinung sitzt IM VERB. Der Satz
       las sich damit als „Deine Verbindung ist davon nicht betroffen" und
       sagte in Wahrheit das Gegenteil.
       ER GREIFT AN EINER SPRACHDATEI UND NICHT AM QUELLTEXT, weil dort der
       Fehler sass: der Bau von 0.25.4 gibt jeder Sprache einen ganzen Satz
       und ueberlaesst ihr das hervorgehobene Stueck -- wer dieses Stueck
       wieder zu einem Woertchen macht, hat den Befund zurueckgebaut, ohne
       eine Zeile Programm anzufassen. Genau das muss auffallen. */
    nr: '792', name: 'Das tuerkische Stueck ist wieder ein Woertchen statt eines Verbs',
    file: 'public/languages/tr.json',
    search: '"login.linkUnaffectedWord": "etkilenmez",',
    replacement: '"login.linkUnaffectedWord": "de\u011fil",',
    expected: 'Ein Satz, den jede Sprache selbst schneidet — 0.25.4'
  },
  {
    /* UND DAS ANFUEHRUNGSZEICHEN BLEIBT WIEDER OFFEN. Der kleinste der drei
       Befunde und der aelteste: `entry.tagQuote` geht unveraendert in ein
       `title`, und am Bildschirm stand „Etiket „Werkzeug -- auf, aber nie zu.
       ER GREIFT AN EINER EINZIGEN DATEI, obwohl alle drei betroffen waren:
       der Waechter sieht jede Datei einzeln an, und eine offene reicht.
       Wer den Rueckbau ueberlebt, hat einen Waechter, der nur die Mehrheit
       fragt. */
    nr: '793', name: 'Das Anfuehrungszeichen am Tagzeichen bleibt wieder offen',
    file: 'public/languages/tr.json',
    search: '"entry.tagQuote": "Etiket \u201e{name}\u201c",',
    replacement: '"entry.tagQuote": "Etiket \u201e{name}",',
    expected: 'Ein Satz, den jede Sprache selbst schneidet — 0.25.4'
  },
  {
    /* UND DER ZAEHLWERT REIST WIEDER UNTER EINEM FREMDEN NAMEN. Die Form
       waehlt `PLURAL.select(values.n)` und NUR ueber `n`. Wer wieder `days`
       reicht, bekommt `select(undefined)` -- und das ist die Mehrzahl, immer.
       „in 1 Tagen" stand sieben Runden lang da.
       DIE DATEI BLEIBT DABEI HEIL, und das ist der Sinn: die zwei Formen
       stehen weiter drin und sehen richtig aus. Nur waehlt sie niemand mehr.
       Ein Rueckbau, der die sichtbare Haelfte in Ruhe laesst und die
       unsichtbare nimmt, prueft den Waechter und nicht das Auge. */
    nr: '794', name: 'Der Zaehlwert reist wieder unter einem fremden Namen',
    file: 'public/app.js',
    search: "tH('card.inDays', { n: log.days })",
    replacement: "tH('card.inDays', { days: log.days })",
    expected: 'Ein Satz, den jede Sprache selbst schneidet — 0.25.4'
  },

  /* ---- 0.26.0: die kleinen Fehler fallen ---- */
  {
    /* DAS DATEIFELD FLIEGT WIEDER AUS DEM LABEL. Ohne den eigenen Traeger
       gibt es nichts, dessen Text sich tauschen liesse, ohne die Kinder des
       Labels mitzunehmen -- und eines davon ist das Feld selbst. */
    nr: '795', name: 'Der Hinweistext hat keinen eigenen Traeger mehr',
    file: 'public/app.js',
    search: '<input type="file" id="file" accept="image/*,video/*" multiple><span\n          id="drop-text">',
    replacement: '<input type="file" id="file" accept="image/*,video/*" multiple>\n          <span-ohne-kennung>',
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },
  {
    /* UND DER FORTSCHRITT SCHREIBT WIEDER INS LABEL. Der Traeger steht dann
       zwar da, aber niemand benutzt ihn: `textContent` am Label wirft alle
       Kinder weg, das Feld eingeschlossen. Genau der Zustand vor 0.26.0. */
    nr: '796', name: 'Der Fortschritt schreibt wieder ins Label statt in den Traeger',
    file: 'public/app.js',
    search: "    const dropText = document.getElementById('drop-text');",
    replacement: "    const dropText = document.getElementById('drop');",
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },
  {
    /* DIE FUSSZEILE HAENGT WIEDER IN DER ROLLENDEN LISTE -- `box.appendChild(foot)`,
       der Zustand vor Befund 2. Der Knopf ist dann nur ueber einen Bildlauf
       zu erreichen, den von aussen niemand als solchen erkennt. */
    nr: '797', name: 'Die Fusszeile der Sitzungen haengt wieder in der Liste',
    file: 'public/app.js',
    search: "    if (!foot) return;\n    foot.innerHTML = other",
    replacement: "    if (!foot) return;\n    box.appendChild(foot);\n    foot.innerHTML = other",
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },
  {
    /* DER TITEL IST WIEDER EINZEILIG. Ein `<input>` bricht nicht um; auf dem
       Telefon steht ein langer Titel dann wieder rechts aus dem Feld heraus. */
    nr: '798', name: 'Der Eintragstitel ist wieder ein einzeiliges Feld',
    file: 'public/app.js',
    search: '<textarea class="title-in" id="title" rows="1">${esc(item.title)}</textarea>',
    replacement: '<input class="title-in" id="title" value="${esc(item.title)}">',
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },
  {
    /* DIE DREI TEILE DES KNOPFES STEHEN WIEDER NEBENEINANDER, und der
       `gap: 7px` setzt sich zwischen sie: „Mit Fotos (~ 301,5 KB )". */
    nr: '799', name: 'Der Ausfuhrknopf traegt wieder drei Flexkinder',
    file: 'public/app.js',
    search: '<button class="btn btn-accent btn-sm" id="ex-yes"><span>${tH(\'card.withPhotos\')}<span id="ex-gr-yes">…</span>)</span></button>',
    replacement: '<button class="btn btn-accent btn-sm" id="ex-yes">${tH(\'card.withPhotos\')}<span id="ex-gr-yes">…</span>)</button>',
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },
  {
    /* UND DIE KLAMMER GEHT WIEDER NICHT AUF -- der Satz, den das Umbenennen
       der Bezeichner erwischt hat. Am Knopf steht dann „mit Fotos 301,5 KB )". */
    nr: '800', name: 'Der Satz am Ausfuhrknopf macht seine Klammer nicht mehr auf',
    file: 'public/languages/de.json',
    search: '"card.withPhotos": "Mit Fotos (~",',
    replacement: '"card.withPhotos": "mit Fotos",',
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },
  {
    /* DER BENUTZER LIEST WIEDER UEBER EINEN KNOPF, DEN ER NICHT HAT. Der
       Rueckbau gibt ihm den Bereich 0,2 bis 2 -- den Satz des Admins. */
    nr: '801', name: 'Der Gewichtssatz erklaert dem Benutzer wieder den Knopf des Admins',
    file: 'public/app.js',
    search: "            : t('card.weightSystemDefault')}</p>",
    replacement: "            : t('card.weightRangeHint')}</p>",
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },
  {
    /* DIE TOTE REGEL STEHT WIEDER DA, und die lebende faellt. Sie tut nichts:
       `:first-of-type` zaehlt DIV-Geschwister, und das erste ist der Kopf. */
    nr: '802', name: 'Der Strich vor den Summen kommt wieder aus einer toten Regel',
    file: 'public/style.css',
    search: '.calc-last > span { border-bottom-color: var(--line); }',
    replacement: '.calc-sum:first-of-type > span { border-top: 1px solid var(--line); }',
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },
  {
    /* DER HINWEIS AN DER ZEITLEISTE BRICHT WIEDER NICHT UM und ist nicht mehr
       gedeckelt -- am rechten Ende der Achse ragt er dann wieder hinaus. */
    nr: '803', name: 'Der Hinweis an der Zeitleiste laeuft wieder hinaus',
    file: 'public/style.css',
    search: '  max-width: min(14rem, 46%); overflow-wrap: anywhere;',
    replacement: '  white-space: nowrap;',
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },
  {
    /* ß UND ss FALLEN WIEDER AUSEINANDER. „UEBERGROSS" findet „uebergroß"
       dann nicht mehr -- und „Masse" findet „Maße" nicht, der Preis faellt
       mit. Der Rueckbau nimmt NUR diesen Schritt: die vier i bleiben. */
    nr: '804', name: 'ß und ss sind wieder zwei verschiedene Dinge',
    file: 'db.js',
    search: "      .replace(/\\u00df/g, 'ss'));",
    replacement: "      );",
    expected: 'Die kleinen Fehler fallen — 0.26.0'
  },

  /* ---- 0.26.0: der Potenzialmodus ---- */
  {
    /* DER STERNKASTEN WIRD WIEDER IMMER GEZEICHNET. Der Modus mag aus sein --
       im Eintrag steht der Kasten dann doch, und ein Klick vergibt Sterne. */
    nr: '805', name: 'Der Sternkasten steht wieder an jedem Eintrag',
    file: 'public/app.js',
    search: '        ${POTENTIAL_MODE ? `<div class="block" data-block="potenzial">',
    replacement: '        ${true ? `<div class="block" data-block="potenzial">',
    expected: 'Der Potenzialmodus — 0.26.0'
  },
  {
    /* DIE SORTIERGRUPPE STEHT WIEDER IMMER DA -- eine Sortierung nach einer
       Zahl, die nirgends zu sehen ist. */
    nr: '806', name: 'Die Sortiergruppe des Potenzials steht wieder immer da',
    file: 'public/app.js',
    /* MITGEZOGEN MIT 0.28.1 (Stolperstein 201): die Gruppe wird seit der
       Richtungstrennung nicht mehr im Aufbau verzweigt, sondern ueber `only`
       aus der Liste der Grundlagen gefiltert. Dieselbe Sache, andere Stelle. */
    /* UND MITGEZOGEN MIT 0.29.0: die Grundlage traegt seit dieser Runde auch
       `start` (Befund 8), und die Zeile ist dabei umgebrochen. Dieselbe Sache,
       dieselbe Stelle, eine Zeile weiter. */
    search: "      down: 'list.dirHighLow',  up: 'list.dirLowHigh', start: 'down',\n      only: () => POTENTIAL_MODE },",
    replacement: "      down: 'list.dirHighLow',  up: 'list.dirLowHigh', start: 'down',\n      only: () => true },",
    expected: 'Der Potenzialmodus — 0.26.0'
  },
  {
    /* DIE KOPPLUNG GREIFT WIEDER -- eine gespeicherte Sortierung stellt den
       Statusfilter auf „nicht getestet", ohne dass jemand etwas gewaehlt hat
       und ohne dass die Sortierung ueberhaupt noch angeboten wuerde. */
    nr: '807', name: 'Die Kopplung der Potenzialsortierung greift wieder',
    file: 'public/app.js',
    search: "    ? ((!POTENTIAL_MODE && /^potential_/.test(sort)) ? null : SORT_STATUS[sort])",
    replacement: "    ? SORT_STATUS[sort]",
    expected: 'Der Potenzialmodus — 0.26.0'
  },
  {
    /* DIE KOPFZAHL STEHT WIEDER AN DER KACHEL -- genau das, was der Betreiber
       ausdruecklich nicht will: „auch wenn Potenzial Bewertungen schon
       vorhanden sind duerfen die nicht im Overview angezeigt werden." */
    nr: '808', name: 'Die Kopfzahl des Potenzials steht wieder in der Uebersicht',
    file: 'public/app.js',
    search: "  if (!POTENTIAL_MODE && potential) return '';",
    replacement: "  if (false && potential) return '';",
    expected: 'Der Potenzialmodus — 0.26.0'
  },
  {
    /* DER SCHALTER FAELLT AUS DER EIGENTUEMERLISTE und wird gewoehnliche
       Adminsache -- die Antwort auf F3 ist damit zurueckgenommen.
       ER NIMMT GENAU `potentialMode` HERAUS und laesst die sechs anderen
       stehen; Rueckbau 437 nimmt `convertImages`, und die beiden duerfen sich
       nicht ins Gehege kommen. */
    nr: '809', name: 'Der Potenzialmodus ist wieder gewoehnliche Adminsache',
    file: 'server.js',
    search: "                                'languageDefault', 'languageOn', 'potentialMode'];",
    replacement: "                                'languageDefault', 'languageOn'];",
    expected: 'Der Potenzialmodus — 0.26.0'
  },
  {
    /* DER SERVER SAGT DER OBERFLAECHE NICHT MEHR, WIE DER SCHALTER STEHT.
       Sie faellt dann auf ihre Vorgabe „an" zurueck -- und der ganze Modus
       ist wieder da, obwohl er in der Datenbank auf aus steht. DER
       SCHLIMMSTE FALL, und er faellt still aus: kein Fehler, keine Meldung,
       nur ein Schalter, der nichts mehr tut. */
    nr: '810', name: 'Die Antwort verschweigt, wie der Schalter steht',
    file: 'server.js',
    search: "  potentialMode: potentialMode(),\n  /* DIE WAHL DER BILDABLAGE",
    replacement: "  /* DIE WAHL DER BILDABLAGE",
    expected: 'Der Potenzialmodus — 0.26.0'
  },
  {
    /* ================= 0.26.0, BA 5 =====================================
       DER BILDSCHIRM WIRD WIEDER GELEERT, BEVOR JEMAND GEFRAGT HAT. Das ist
       der gemeldete Zustand: `renderList()` setzte den Platzhalter ohne
       Bedingung und wartete erst danach auf `loadAll()` -- 227 ms weisse
       Flaeche, gemessen im Browser des Betreibers am 10. September 2026.
       ER NIMMT NUR DIE BEDINGUNG UND LAESST DIE ZUWEISUNG STEHEN, und das
       ist hier richtig: eine Zuweisung, die ganz fehlte, waere ein anderer
       Fehler (kein Platzhalter beim ersten Betreten). Der Rueckbau soll den
       ALTEN Zustand herstellen und keinen dritten. */
    nr: '811', name: 'Der Bildschirm wird wieder geleert, bevor jemand gefragt hat',
    file: 'public/app.js',
    search: "  if (!app.firstElementChild)\n    app.innerHTML = `<div class=\"shell\"><p class=\"hint\" style=\"padding-top:44px\">${tH('list.loading')}</p></div>`;",
    replacement: "  app.innerHTML = `<div class=\"shell\"><p class=\"hint\" style=\"padding-top:44px\">${tH('list.loading')}</p></div>`;",
    expected: 'Die Hervorhebung in der Uebersicht'
  },
  {
    /* ================= 0.26.0, Beipack ==================================
       DER LAUF HAENGT WIEDER NUR AN main. Das ist der Zustand vom Nachmittag
       des 10. September, und er macht den Ablauf des Betreibers unmoeglich:
       er setzt das Repository nur um einen Push herum auf oeffentlich, und
       ein Push auf einen ZWEIG loeste dann gar nichts aus -- geprueft wuerde
       erst nach dem Zusammenfuehren, also zu spaet.
       ER NIMMT DEN ZWEIGFILTER UND LAESST DEN KNOPF STEHEN. Zwei Ereignisse
       bleiben es damit, und genau darauf zielt er: eine Zusage, die nur
       ZAEHLT, bliebe hier stumm. */
    nr: '812', name: 'Der Lauf haengt wieder nur an main',
    file: '.github/workflows/pruefstand.yml',
    search: "on:\n  push:\n  workflow_dispatch:",
    replacement: "on:\n  push:\n    branches:\n      - main\n  workflow_dispatch:",
    expected: 'Der Beipack — 0.25.0'
  },

  /* ---- Die waehlbare Bildablage — 0.27.0 ----
     ELF ZUSAGEN, ELF RUECKBAUTEN, und jeder faehrt gegen GENAU EINE.
     WAS HIER NICHT NOCH EINMAL STEHT: die neunzehn Rueckbauten dieser Sache,
     die es laengst gibt (431 bis 435, 454 bis 462, 493, 506 bis 508, 522 bis
     524, 810). Sie sind mit dieser Runde MITGEGANGEN und zeigen auf die
     Zeilen, die dieselbe Sache jetzt tragen (Stolperstein 201) -- ein
     zweiter Rueckbau daneben waere eine zweite Wahrheit ueber denselben
     Fund. */
  {
    /* ZUSAGE 1: die Einstellung kennt GENAU DREI Werte. Der Rueckbau laesst
       einen vierten durch -- die Karte zeigte danach ein Verfahren an und der
       Server legte in einem anderen ab, denn `imageStore()` faellt beim Lesen
       auf die Vorgabe zurueck. Eine Luege, die nirgends auffaellt. */
    nr: '813', name: 'Ein vierter Wert kommt durch',
    file: 'server.js',
    search: "    if (!isImageStore(req.body.imageStore))",
    replacement: "    if (false)",
    expected: 'Die Bildablage: die Rechte'
  },
  {
    /* ZUSAGE 2: sie gehoert dem Eigentuemer. Der Rueckbau weitet die Klemme
       auf jeden Admin -- ein Schluessel, der den PLATZBEDARF DER GANZEN
       INSTANZ bestimmt, waere damit Tagesgeschaeft. */
    nr: '814', name: 'Die Wahl der Bildablage wird gewoehnliche Adminsache',
    file: 'server.js',
    search: "const OWNER_KEYS = ['imageStore',\n",
    replacement: "const OWNER_KEYS = [\n",
    expected: 'Die Bildablage: die Rechte'
  },
  {
    /* ZUSAGE 3: eine frische Installation steht auf „WebP verlustfrei". Der
       Rueckbau verstellt die Vorgabe auf PNG -- eine Runde, die eine Wahl
       einfuehrt, haette damit die bisherige Antwort nebenbei geaendert, und
       jede neue Installation legte ploetzlich dreimal so gross ab. */
    nr: '815', name: 'Die Vorgabe einer frischen Installation wird verstellt',
    file: 'images.js',
    search: "const IMAGE_STORE_DEFAULT = 'webp-lossless';",
    replacement: "const IMAGE_STORE_DEFAULT = 'png';",
    expected: 'Die Bildablage: die Rechte'
  },
  {
    /* ZUSAGE 4: storeImage() LIEST die Wahl. Der Rueckbau verdrahtet sie
       wieder fest -- dreimal dasselbe Bild ergaebe dreimal dasselbe Ergebnis,
       und die Karte zeigte eine Wahl, die nichts tut. */
    nr: '816', name: 'Die Wahl wird wieder fest verdrahtet',
    file: 'images.js',
    search: "  const recipe = IMAGE_STORES[isImageStore(store) ? store : IMAGE_STORE_DEFAULT];",
    replacement: "  const recipe = IMAGE_STORES[IMAGE_STORE_DEFAULT];",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* ZUSAGE 5: die Groessenpruefung gilt in JEDEM Verfahren. Der Rueckbau
       schaltet sie ab -- aus einer Wahl wuerde eine Wette, und am
       verlustbehafteten Weg ist sie schaerfer gebraucht als am anderen.
       ER IST NICHT DERSELBE WIE 433: der dort nimmt die Pruefung heraus und
       ist als STUMM erwartet, weil PNG ueber die Groesse nie gewinnt. DIESER
       laesst sie fuer ein Verfahren stehen und fuer die anderen fallen --
       genau die Form, in der jemand sie „nur fuer Fotos" abschaltete. */
    nr: '817', name: 'Die Groessenpruefung gilt nicht mehr fuer jedes Verfahren',
    file: 'images.js',
    search: "    if (webp.length < buf.length)",
    replacement: "    if (webp.length < buf.length || store === 'webp-lossy')",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* ZUSAGE 6: die Ableitungen sind WebP, und ihr MIME-Typ sagt es. Der
       Rueckbau stellt eine davon auf JPEG zurueck -- die Tafel traege
       weiterhin ihre Zahl, und die bedeutete etwas anderes. */
    nr: '818', name: 'Die Ableitungen werden wieder JPEG',
    file: 'images.js',
    search: "        .webp(variantWebp(v.q)).toBuffer();",
    replacement: "        .jpeg({ quality: v.q, mozjpeg: true }).toBuffer();",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* ZUSAGE 7: der Bestandslauf zieht Originale UND Ableitungen. Der
       Rueckbau laesst die zweite Haelfte aus -- der Lauf saehe jede Zeile an
       und taete an den meisten nichts, und die groessere Haelfte des
       Bildbestands bliebe JPEG. */
    nr: '819', name: 'Der Bestandslauf laesst die Ableitungen aus',
    file: 'batchrun.js',
    search: "        const fresh = (isJpeg(z.thumb) || isJpeg(z.medium))\n          ? await makeVariants(z.data, cropFrom(z)) : null;",
    replacement: "        const fresh = null;",
    expected: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* ZUSAGE 8: Umschalten allein ruehrt den Bestand nicht an (F5). Der
       Rueckbau haengt den Lauf ans Umschalten -- wer die Wahl PROBIERT,
       bekaeme 500 MB umkodiert, und zwar ohne die zweite Bestaetigung. */
    nr: '820', name: 'Der Lauf haengt am Umschalten',
    file: 'public/app.js',
    search: "      } catch (e) { IMAGE_STORE = before; toast(e.message, true); }",
    replacement: "      } catch (e) { IMAGE_STORE = before; toast(e.message, true); }\n      try { await api('POST', '/api/images/convert', {}); } catch {}",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* ZUSAGE 9: die Karte nennt die Auflage. Der Rueckbau nimmt den Satz aus
       der deutschen Datei -- und genau diese Bauform ist ein FUND vom
       6. September 2026: Gegenprobe 485 nahm den damaligen Halbsatz heraus
       und blieb STUMM, weil ihn keine Zusage las. */
    nr: '821', name: 'Die Karte nennt die Auflage nicht mehr',
    file: 'public/languages/de.json',
    search: "Zur Auflage: Verlustbehaftet lohnt sich nur bei Fotos",
    replacement: "Zur Auflage: Verlustbehaftet lohnt sich immer",
    expected: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* ZUSAGE 10: die Migration uebersetzt BEIDE alten Stellungen. Der
       Rueckbau laesst eine Richtung falsch abbiegen -- eine Installation, die
       das Haekchen ausdruecklich AUS hatte, legte danach als WebP ab, und
       niemand haette es bestellt. */
    nr: '822', name: 'Die Migration biegt eine Richtung falsch ab',
    file: 'db.js',
    search: "const IMAGE_STORE_FROM_0190 = { true: 'webp-lossless', false: 'png' };",
    replacement: "const IMAGE_STORE_FROM_0190 = { true: 'webp-lossless', false: 'webp-lossless' };",
    expected: 'Die Datenbankstufe 0.27.0'
  },
  {
    /* ZUSAGE 11: `convertImages` steht nach der Migration NIRGENDS mehr. Der
       Rueckbau laesst den alten Schluessel stehen -- danach stuenden ZWEI
       Zeilen ueber dieselbe Frage in derselben Tabelle, und beim naechsten
       Griff waere nicht zu sagen, welche gilt (Stolperstein 47). */
    /* F7 — DER SATZ AN DER EINFUEGESTELLE. Der Rueckbau nimmt ihn aus der
       Zeile, in der er gezeichnet wird -- nicht aus der Sprachdatei: ein Satz,
       der dort steht und nirgends erscheint, ist genau der Fall, den diese
       Gegenprobe finden soll. Dieselbe Bauform wie 485, die daran STUMM
       geblieben ist. */
    nr: '824', name: 'Der Satz an der Einfuegestelle wird nicht gezeichnet',
    file: 'public/app.js',
    search: "          ${tH('entry.photoOrderHint')} ${tH('entry.clipboardLarger')}</p>",
    replacement: "          ${tH('entry.photoOrderHint')}</p>",
    expected: 'Der Eintrag am Bildschirm'
  },
  {
    nr: '823', name: 'Der alte Schluessel bleibt stehen',
    file: 'db.js',
    search: "    db.prepare(\"DELETE FROM settings WHERE key = 'convertImages'\").run();",
    replacement: "    void 0;",
    expected: 'Die Datenbankstufe 0.27.0'
  },

  /* ================= 0.28.0 — „Das Telefon bekommt Recht" =================
     SECHZEHN RUECKBAUTEN ZU SIEBEN BAUABSCHNITTEN. Jeder nimmt genau EINE
     Zusage ins Visier; wo ein Rueckbau zwei rot macht, steht das daneben. */

  /* ---- BA 1: die gemeinsame Kopfzeile ---- */
  {
    /* DER UMBAU GING UEBER VIER AUFBAUTEN, und genau das ist die Gefahr: eine
       Zusage, die nur an renderDetail() haengt, bliebe gruen, wenn
       renderCompare() seine alte Zeile behaelt. Dieser Rueckbau setzt sie an
       der Ansicht zurueck, die am leichtesten vergessen wird. */
    /* DER ERSTE ANLAUF HAT DEN LAUF ABGERISSEN, und das belegt nichts
       (Stolpersteine 138, 161 und 170). Er nahm der Ansicht ihre Kopfzeile und
       liess `wireSubhead()` stehen; `document.getElementById('menu')` gab
       daraufhin null zurueck, und `menu.onclick = ...` warf, BEVOR eine
       einzige Zusicherung lief.
       ER NIMMT DESHALB BEIDES ZUSAMMEN -- den Aufbau UND seine Zusagen. Das
       ist ohnehin der ehrlichere Rueckbau: „die Ansicht behaelt ihre alte
       Zeile" heisst, dass sie die neue Kopfzeile gar nicht kennt, und nicht,
       dass sie eine halbe traegt. */
    nr: '825', name: 'Der Vergleich behaelt seine alte Rueckzeile',
    file: 'public/app.js',
    search: "    ${subhead()}\n    <h1 class=\"page-title\">${tH('list.compare')}</h1>\n    <p class=\"hint\" id=\"cmp-hint\" style=\"margin:0 0 ${multipleUsers() ? t('list.px10') : t('list.px20')}\"></p>\n    ${multipleUsers() ? `<div class=\"pills\" id=\"cmp-view\" style=\"margin:0 0 20px\"></div>` : ''}\n    <div class=\"cmp-grid\" id=\"cg\" style=\"grid-template-columns:repeat(auto-fit,minmax(264px,1fr))\"></div>\n  </div>`;\n  wireSubhead();",
    replacement: "    <a href=\"#/\" class=\"back\">${tH('list.backToList')}</a>\n    <h1 class=\"page-title\">${tH('list.compare')}</h1>\n    <p class=\"hint\" id=\"cmp-hint\" style=\"margin:0 0 ${multipleUsers() ? t('list.px10') : t('list.px20')}\"></p>\n    ${multipleUsers() ? `<div class=\"pills\" id=\"cmp-view\" style=\"margin:0 0 20px\"></div>` : ''}\n    <div class=\"cmp-grid\" id=\"cg\" style=\"grid-template-columns:repeat(auto-fit,minmax(264px,1fr))\"></div>\n  </div>`;",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* DER FUENFTE RUFER, den niemand sieht, solange alle Nummern aufgehen. */
    nr: '826', name: 'Der Fehlerweg des Eintrags bleibt ohne Kopfzeile',
    file: 'public/app.js',
    search: "      app.innerHTML = `<div class=\"shell\">${subhead()}<p class=\"hint\">${tH('server.entryUnknown')}</p></div>`;",
    replacement: "      app.innerHTML = `<div class=\"shell\"><a href=\"#/\" class=\"back\">${tH('list.backToList')}</a><p class=\"hint\">${tH('server.entryUnknown')}</p></div>`;",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* EIN FUENFTES DING DANEBENSTELLEN -- Gegenprobe zu Zusage 2. Sie nennt
       die Stuecke namentlich; eine, die nur zaehlte, saehe diesen Tausch. */
    nr: '827', name: 'Die Glocke wandert in die Kopfzeile der Unteransicht',
    file: 'public/app.js',
    search: "    <div class=\"mast-rest\" id=\"mast-rest\">\n      <button class=\"icon-btn\" id=\"open\"",
    replacement: "    <div class=\"mast-rest\" id=\"mast-rest\">\n      <button class=\"icon-btn bell\" id=\"bell\">${ICON_BELL}</button>\n      <button class=\"icon-btn\" id=\"open\"",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* SIE WIRD EINE ZWEITE KOPFZEILE. Ohne `.masthead` haette die Unteransicht
       ein eigenes Stilblatt -- und damit klebte sie nicht mehr oben, klappte
       auf dem Telefon nicht ein und truege ihren Schatten nicht. */
    nr: '828', name: 'Die Kopfzeile der Unteransicht wird eine eigene',
    file: 'public/app.js',
    search: "  return `<div class=\"masthead subhead\">",
    replacement: "  return `<div class=\"subhead\">",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* DIE SUCHE SUCHT IN DER UNTERANSICHT statt zu springen -- Gegenprobe zu
       Zusage 3. */
    nr: '829', name: 'Die Suche springt nicht mehr zur Uebersicht',
    file: 'public/app.js',
    search: "  const over = () => { SEARCH_HANDOFF = true; location.hash = '#/'; };",
    replacement: "  const over = () => { state.search = sq.value; };",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* UND DER SCHREIBSTRICH BLEIBT LIEGEN. Der Sprung allein waere ein Griff,
       das Tippen ein zweiter -- also genau die zwei Griffe, die die Runde
       wegnimmt. Eine Zusage, die nur den Sprung prueft, saehe das nicht. */
    nr: '830', name: 'Der Schreibstrich landet nach dem Sprung nirgends',
    file: 'public/app.js',
    search: "    atElement('q', el => { el.focus(); el.setSelectionRange(el.value.length, el.value.length); });",
    replacement: "    void 0;",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },

  /* ---- BA 2: das Blaettern ---- */
  {
    /* DIE UNGEFILTERTE LISTE NEHMEN -- Gegenprobe zu Zusage 4. Sie ist der
       Fehler, den man macht, ohne ihn zu bemerken: die Pfeile blaettern dann
       durch Eintraege, die der eingestellte Filter gar nicht zeigt. */
    nr: '831', name: 'Die Pfeile blaettern im ganzen Bestand statt in der Trefferliste',
    file: 'public/app.js',
    search: "  const list = state.items || [];",
    replacement: "  const list = state.all || [];",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* EINE REIHENFOLGE ERFINDEN -- Gegenprobe zu Zusage 6. Wer den Eintrag
       nicht in der Liste findet, tut so, als staende er am Anfang: beide Pfeile
       saehen aktiv aus und fuehrten in eine Liste, die niemand vor sich hat. */
    nr: '832', name: 'Ohne Reihenfolge wird eine erfunden',
    file: 'public/app.js',
    search: "  if (at < 0) return { prev: null, next: null };",
    replacement: "  if (at < 0) return { prev: (list[0] || {}).id || null, next: (list[1] || {}).id || null };",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* SIE VERSCHWINDEN LASSEN statt sie zu daempfen -- Gegenprobe zu Zusage 5.
       Das verschiebt alles daneben: der Titel wandert beim Blaettern hin und
       her, weil am ersten und letzten Eintrag ein Knopf fehlt. */
    /* MITGEZOGEN MIT 0.28.1 (Stolperstein 201): die Pfeile stehen seit dieser
       Runde am FUSS des Eintrags. Die Zusage ist dieselbe -- der gedaempfte
       Knopf bleibt stehen, statt zu verschwinden --, nur an der Stelle, an der
       sie jetzt haengt. */
    nr: '833', name: 'Der gedaempfte Blaetterknopf verschwindet statt dazubleiben',
    file: 'public/style.css',
    search: ".entry-nav .step:disabled { opacity: .38; cursor: default; }",
    replacement: ".entry-nav .step:disabled { display: none; }",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* DIE REIHENFOLGE SPEICHERN -- ausdruecklich nicht gebaut (F2). Eine
       gespeicherte Reihenfolge waere beim naechsten Oeffnen eine Behauptung
       ueber eine Uebersicht, die niemand mehr sieht. */
    nr: '834', name: 'Die Reihenfolge wird im Browser abgelegt',
    file: 'public/app.js',
    search: "  const list = state.items || [];",
    replacement: "  const list = state.items || []; try { sessionStorage.setItem('reihe', JSON.stringify(list.map(x => x.id))); } catch {}",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* EINE TASTE MITNEHMEN -- Gegenprobe zu Zusage 7. Der Betreiber hat
       `Bild auf`/`Bild ab` am 11. September 2026 gestrichen: bei langen
       Kommentaren wird `Bild ab` zum Rollen gebraucht. */
    nr: '835', name: 'Bild auf und Bild ab blaettern doch den Eintrag',
    file: 'public/app.js',
    /* MITGEZOGEN MIT 0.28.1 (Stolperstein 201): die Knoepfe stehen am Fuss des
       Eintrags. Die Zusage ist dieselbe -- keine Taste blaettert. */
    search: "  document.querySelectorAll('.entry-nav .step').forEach(b => {",
    replacement: "  document.addEventListener('keydown', e => { if (e.key === 'PageDown' || e.key === 'PageUp') e.preventDefault(); });\n  document.querySelectorAll('.entry-nav .step').forEach(b => {",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },
  {
    /* DER BEGRIFF FAELLT UNTERWEGS AUS DER ADRESSE. Wer mit einem gesuchten
       Begriff in einen Eintrag gegangen ist, blaettert in der Trefferliste --
       und stuende nach einem Schritt ohne Begriff da. */
    nr: '836', name: 'Der Begriff faellt beim Blaettern aus der Adresse',
    file: 'public/app.js',
    search: "      if (to) location.hash = entryAddress(+to, term);",
    replacement: "      if (to) location.hash = entryAddress(+to, '');",
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },

  /* ---- BA 3: die Behaelterabfragen ---- */
  {
    /* DIE BEHAELTERABFRAGE GEGEN EINE FENSTERABFRAGE TAUSCHEN -- Gegenprobe zu
       Zusage 9. Das ist genau der Rueckbau auf den Stand vor dieser Runde. */
    nr: '837', name: 'Die Protokollzeile fragt wieder das Fenster',
    file: 'public/style.css',
    search: "@container (max-width: 420px) {",
    replacement: "@media (max-width: 420px) {",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    /* DIE KARTE IST KEIN BEHAELTER MEHR. Dann greift keine der beiden
       Behaelterabfragen -- und beide Regeln liegen still da, ohne dass etwas
       fehlt, das man sehen wuerde. */
    nr: '838', name: 'Die Karte des Systembereichs ist kein Behaelter mehr',
    file: 'public/style.css',
    search: ".sys-card { container-type: inline-size; }",
    replacement: ".sys-card { }",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    /* DER BEFEHL ROLLT WIEDER SEITLICH -- Befund 3. Gemessen: 452 px Inhalt in
       182 px Kasten. */
    nr: '839', name: 'Der Befehl rollt wieder seitlich statt umzubrechen',
    file: 'public/style.css',
    search: "  .server-row code { flex: 1 1 100%; overflow-x: visible;\n    white-space: pre-wrap; overflow-wrap: anywhere; }",
    replacement: "  .server-row code { flex: 1 1 auto; }",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },

  /* ---- BA 4: der Halbsatz am Ablegefeld ---- */
  {
    /* „STRG+V" WIEDER HINEINSCHREIBEN -- Gegenprobe zu Zusage 10, und zwar in
       EINER Sprache: eine Zusage, die nur Deutsch ansieht, bliebe gruen. */
    nr: '840', name: 'Strg+V steht wieder am Ablegefeld (englisch)',
    file: 'public/languages/en.json',
    search: '"entry.addMediaHint": "Add photos and videos — several at a time",',
    replacement: '"entry.addMediaHint": "Add photos and videos — several at a time, or paste with Ctrl+V",',
    expected: 'Die gemeinsame Kopfzeile und das Blaettern — 0.28.0'
  },

  /* ---- BA 5: die Meldung ---- */
  {
    /* DIE REGEL ABSCHALTEN -- Gegenprobe zu Zusage 11. */
    nr: '841', name: 'Die Meldung deckt die Vergleichsleiste wieder zu',
    file: 'public/style.css',
    search: "body:has(.cmp-bar) .toast { bottom: calc(90px + env(safe-area-inset-bottom)); }",
    replacement: "",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    /* EIN HUB, DER KLEINER IST ALS DIE LEISTE HOCH IST. Er verschoebe die
       Meldung und deckte sie trotzdem zu -- die schlimmere Fassung, weil sie
       aussieht, als waere etwas getan worden. */
    nr: '842', name: 'Der Hub der Meldung ist kleiner als die Leiste',
    file: 'public/style.css',
    search: "body:has(.cmp-bar) .toast { bottom: calc(90px + env(safe-area-inset-bottom)); }",
    replacement: "body:has(.cmp-bar) .toast { bottom: calc(40px + env(safe-area-inset-bottom)); }",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },

  /* ---- BA 6: das Startbildzeichen ---- */
  {
    /* EINEN FESTEN NAMEN HINEINSCHREIBEN -- Gegenprobe zu Zusage 12. */
    nr: '843', name: 'Das Manifest traegt einen festen Namen',
    file: 'server.js',
    search: "  const name = getSetting('title_public', 'Bewertungskatalog');",
    replacement: "  const name = 'Kriterion';",
    expected: 'Das Startbildzeichen — 0.28.0'
  },
  {
    /* ES HINTER DIE ANMELDUNG HAENGEN -- Gegenprobe zu Zusage 13. Der Browser
       holt das Manifest ohne Anmeldedaten; dahinter ist es fuer ihn nicht da. */
    nr: '844', name: 'Das Manifest haengt hinter der Anmeldung',
    file: 'server.js',
    search: "app.get('/api/manifest.json', (req, res) => {",
    replacement: "app.get('/api/manifest.json', adminOnly, (req, res) => {",
    expected: 'Das Startbildzeichen — 0.28.0'
  },
  {
    /* EINEN ARBEITER IM HINTERGRUND REGISTRIEREN -- Gegenprobe zu Zusage 14.
       Er steht hier als blosser Aufruf da; es geht um die Zusage, nicht um
       einen laufenden Zwischenspeicher. */
    nr: '845', name: 'Ein Arbeiter im Hintergrund wird registriert',
    file: 'public/theme.js',
    search: "  } catch (e) {\n    document.documentElement.dataset.theme = 'dark';\n  }",
    replacement: "  } catch (e) {\n    document.documentElement.dataset.theme = 'dark';\n  }\n  try { navigator.serviceWorker.register('/sw.js'); } catch (e) {}",
    expected: 'Das Startbildzeichen — 0.28.0'
  },
  {
    /* DIE SEITE VERWEIST NICHT MEHR AUF DAS MANIFEST. Die Route allein legt
       nichts auf einen Startbildschirm -- ohne die Verknuepfung findet der
       Browser sie nie. */
    nr: '846', name: 'Die Seite verweist nicht mehr auf das Manifest',
    file: 'public/index.html',
    search: '<link rel="manifest" href="/api/manifest.json">',
    replacement: "",
    expected: 'Das Startbildzeichen — 0.28.0'
  },

  /* ---- BA 7: die Dichte am Finger ---- */
  {
    /* EINES DER BEIDEN MASSE WEGLASSEN -- Gegenprobe zu Zusage 16. Zurueck auf
       das ZEIGERMASS: „kleiner als vorher" waere damit erfuellt, „groesser als
       am Zeiger" nicht. Eine Zusage, die nur eines der beiden nennt, bliebe
       hier gruen. */
    nr: '847', name: 'Die Pille faellt am Finger auf das Zeigermass zurueck',
    file: 'public/style.css',
    search: "  .pill { padding: 7px 13px; }",
    replacement: "  .pill { padding: 5px 12px; }",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    /* DER UMSCHALTER BLEIBT STEHEN und ist danach genau so hoch wie die Pille.
       Der Satz „er bleibt kleiner als die Pillen daneben" waere nicht mehr
       wahr -- und das ist die Zusage, die es merkt. */
    nr: '848', name: 'Der Und/Oder-Umschalter wird so hoch wie die Pille',
    file: 'public/style.css',
    search: "  .pill-mode { padding: 5px 11px; }",
    replacement: "  .pill-mode { padding: 7px 12px; }",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    /* DEN SYMBOLKNOPF MITSCHRUMPFEN LASSEN -- Gegenprobe zu Zusage 17. Seine
       44 Pixel sind die einzige Zahl, die der Finger-Abschnitt ausdruecklich
       verspricht. */
    nr: '849', name: 'Der Symbolknopf schrumpft mit',
    file: 'public/style.css',
    search: "  .icon-btn { width: 44px; height: 44px; }",
    replacement: "  .icon-btn { width: 36px; height: 36px; }",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    /* `.select` WIEDER HINEINSCHREIBEN -- Gegenprobe zu Zusage 19. */
    nr: '850', name: 'Die Auswahlfelder stehen wieder in der Zoomregel',
    file: 'public/style.css',
    search: "  .input, .input-sm, .ta, .title-in,",
    replacement: "  .input, .input-sm, .ta, .select, .select-sm, .title-in,",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    /* EIN EINGABEFELD HERAUSNEHMEN -- Gegenprobe zu Zusage 18, und die
       wichtigere Richtung: die Regel soll fuer die Felder bleiben, fuer die sie
       gedacht war. */
    nr: '851', name: 'Ein Eingabefeld faellt aus der Zoomregel',
    file: 'public/style.css',
    search: "  .mrow input.medit, .mrow .mweight-field,",
    replacement: "  .mrow .mweight-field,",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    /* DAS DATUMSFELD MIT HERAUSNEHMEN -- F16 sagt ausdruecklich nein: es traegt
       einen Schreibstrich, den ein `<select>` nicht hat. */
    nr: '852', name: 'Das Datumsfeld faellt mit aus der Zoomregel',
    file: 'public/style.css',
    search: "  .test-add input[type=date] { font-size: max(16px, 1rem); }",
    replacement: "  .title-in { font-size: max(16px, 1rem); }",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  {
    /* DIE UNTERGRENZE ALS BLANKE ZAHL -- Gegenprobe zu Zusage 20. Sie waere ein
       zweites Grundmass neben dem am Wurzelelement. */
    nr: '853', name: 'Die Untergrenze steht als blanke Zahl',
    file: 'public/style.css',
    search: "  .test-add input[type=date] { font-size: max(16px, 1rem); }",
    replacement: "  .test-add input[type=date] { font-size: 16px; }",
    expected: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* ================= 0.28.1 — die acht Reparaturen ======================
     JEDE NEUE ZUSAGE MIT EINER GEFAHRENEN GEGENPROBE, fortlaufend ab 854.
     WAS HIER NICHT STEHT: die Zusagen 4 bis 8 (die Kopfzeile, das Blaettern,
     das Suchfeld). Sie sind mit 0.28.0 gekommen und haben ihre Rueckbauten
     seither -- diese Runde hat sie UMGEDREHT und nicht neu gemacht, und ein
     zweiter Rueckbau auf dieselbe Zeile belegte nichts, was der erste nicht
     schon belegt. Zusage 17 haelt das Wegeverzeichnis mit seinen eigenen
     Rueckbauten. */
  {
    /* EIN ACHTER EINTRAG DANEBEN -- Gegenprobe zu Zusage 1. „Genau sieben"
       muss die Liste NAMENTLICH kennen: eine Zusage, die nur zaehlt, saehe
       einen Tausch nicht, und eine, die nur die sieben sucht, saehe den
       achten nicht. */
    nr: '854', name: 'Ein achter Eintrag steht in der Sortierliste',
    file: 'public/app.js',
    search: "  ].filter(b => !b.only || b.only());",
    replacement: "    ,{ key: 'favorite', group: GENERAL, word: () => t('list.sortTitle'),\n" +
            "      down: 'list.dirHighLow', up: 'list.dirLowHigh' }\n" +
            "  ].filter(b => !b.only || b.only());",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* DIE RICHTUNG WANDERT ZURUECK INS WORT -- Gegenprobe zu Zusage 2, und
       zwar auf der Seite, die man leicht vergisst: der WERT bliebe sauber,
       und die Liste waere trotzdem wieder so lang wie vorher. Genau das war
       der Befund vom Geraet. */
    nr: '855', name: 'Die Richtung steht wieder im Wort der Option',
    file: 'public/app.js',
    search: "word: () => t('list.sortChanged'),",
    replacement: "word: () => t('list.sortChanged') + ' (neu → alt)',",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* DER UMSCHALTER STEHT GAR NICHT ERST DA -- die andere Haelfte von
       Zusage 2. Er wird gebaut und verdrahtet, aber nicht angehaengt: der
       Fall, in dem ein Rueckbau die Oberflaeche NICHT abreisst und die
       Bedienung trotzdem fehlt. */
    nr: '856', name: 'Der Richtungsumschalter haengt nicht in der Zeile',
    file: 'public/app.js',
    search: "  sortPair.appendChild(dirBtn);",
    replacement: "",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* DIE RICHTUNG KOMMT NICHT AN -- Gegenprobe zu Zusage 3, und der Grund,
       warum diese Zusage die Liste FAEHRT statt den Aufbau zu lesen: der
       Umschalter steht da, sagt sein Wort, und die Liste dreht sich nicht. */
    nr: '857', name: 'Die Richtung kommt in der Sortierung nicht an',
    file: 'public/app.js',
    search: "  const applySort = () => { f.sort = picked.base.key + (picked.asc ? '_asc' : '_desc'); redraw(); };",
    replacement: "  const applySort = () => { f.sort = picked.base.key + '_desc'; redraw(); };",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* „TITEL" BEKOMMT DIE ABSTEIGENDE ENDUNG ZURUECK -- und das ist keine
       erfundene Lage, sondern der Fehler, den diese Zusage beim ersten Lauf
       GEFUNDEN hat: `title_desc` gibt es in der Sortierung nicht, und die
       Liste ordnete still nach dem Aenderungsdatum weiter. Ausgewaehlt, ohne
       Fehlermeldung, und schlicht falsch. */
    /* MITGEZOGEN MIT 0.29.0 (Stolperstein 201), und diesmal hat der Gegenstand
       gewechselt: `dirOf()` ist mit Befund 8 gefallen -- seit „Titel" beide
       Richtungen kennt, ist keine Grundlage mehr einspurig, und eine Weiche
       ohne Fall bleibt nicht stehen.
       WAS DER RUECKBAU BELEGT, IST DASSELBE GEBLIEBEN: dass der Wechsel der
       Grundlage die RICHTIGE Richtung nimmt. Er nimmt jetzt die der ALTEN
       Grundlage statt die der neuen -- genau der Fehler, den `start` verhindert,
       und er setzt jeden, der aus der Vorgabe „neu → alt" kommt, bei „Titel"
       auf „Z → A". */
    nr: '858', name: 'Der Wechsel der Grundlage nimmt die alte Richtung mit',
    file: 'public/app.js',
    search: "    picked = { base: b, asc: b.start === 'up' };",
    replacement: "    picked = { base: b, asc: picked.asc };",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* DER STERN FAELLT AUF DAS ZEIGERMASS -- Gegenprobe zu Zusage 9, erste
       Haelfte. Ein Finger ist breiter als ein Mauszeiger, und diese Runde
       nimmt ihm nicht weg, was er gebraucht hat. */
    nr: '859', name: 'Der Stern faellt am Finger auf das Zeigermass',
    file: 'public/style.css',
    search: "  .star { font-size: 1.25rem; }",
    replacement: "  .star { font-size: 1.2rem; }",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* UND DIE ANDERE HAELFTE: er bleibt, wie er war. Ohne sie bliebe die
       Zusage gruen, wenn die Runde am Stern gar nichts taete. */
    nr: '860', name: 'Der Stern behaelt sein altes Mass',
    file: 'public/style.css',
    search: "  .star { font-size: 1.25rem; }",
    replacement: "  .star { font-size: 1.45rem; }",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* DIE ABSCHNITTSLISTE KLAPPT OHNE AUSKUNFT EIN -- Gegenprobe zu
       Zusage 10. Das ist derselbe Fehler wie ein Filter ohne Zahl: die Liste
       ist weg, und niemand sieht, wo er gerade ist. */
    nr: '861', name: 'Der Abschnittsschalter sagt nicht, welcher Abschnitt offen ist',
    file: 'public/app.js',
    search: "aria-controls=\"sys-tabs\">${tH('card.sections')}<span class=\"fcount\">${esc(open.name())}</span></button>",
    replacement: "aria-controls=\"sys-tabs\">${tH('card.sections')}</button>",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* EINGEKLAPPT AUF JEDEM SCHIRM -- Gegenprobe zu Zusage 11. Ein breites
       Fenster saesse dann vor eingeklappten Abschnitten und haette keinen
       sichtbaren Knopf, sie zu oeffnen: der Schalter selbst steht dort im
       Stilblatt auf `display: none`. */
    nr: '862', name: 'Die Abschnittsliste klappt auf jedem Schirm ein',
    file: 'public/app.js',
    search: "    if (isNarrow()) tabs.classList.add('closed');",
    replacement: "    tabs.classList.add('closed');",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* DER UEBERLAEUFER WIRD ZURUECKGESCHRIEBEN -- Gegenprobe zu Zusage 12,
       und die Sorte ist gefaehrlich: der Wert steht richtig da, wo er
       geschrieben wurde, und wird falsch, wo die Anzeigeart wechselt. Am
       Schreibtisch ist nichts zu sehen. */
    nr: '863', name: 'Die Titelzeile dehnt sich am Telefon wieder nicht',
    file: 'public/style.css',
    search: "  .detail { display: flex; flex-direction: column; gap: 16px; align-items: stretch; }",
    replacement: "  .detail { display: flex; flex-direction: column; gap: 16px; align-items: start; }",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* UND DIE GEGENRICHTUNG: `align-items` wird GLOBAL geaendert --
       Gegenprobe zu Zusage 13. Im Raster heisst derselbe Wert etwas anderes,
       und die beiden Spalten des Eintrags stuenden danach gedehnt da. */
    nr: '864', name: 'Die Dehnung wird global statt am Telefon gesetzt',
    file: 'public/style.css',
    search: ".detail { display: grid; grid-template-columns: minmax(300px, 46%) 1fr; gap: 28px; align-items: start; }",
    replacement: ".detail { display: grid; grid-template-columns: minmax(300px, 46%) 1fr; gap: 28px; align-items: stretch; }",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* DIE TOTE REGEL KOMMT ZURUECK -- Gegenprobe zu Zusage 14. Sie trifft
       nichts mehr, und genau deshalb faellt sie sonst niemandem auf. */
    nr: '865', name: 'Die tote Regel `.back` steht wieder im Telefonblock',
    file: 'public/style.css',
    search: "  .detail { display: flex; flex-direction: column; gap: 16px; align-items: stretch; }",
    replacement: "  .back { margin-bottom: 14px; }\n" +
            "  .detail { display: flex; flex-direction: column; gap: 16px; align-items: stretch; }",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* DIE ZEILE WIRD WIEDER ZUR SPALTE -- Gegenprobe zum ERSTEN Hebel aus
       Zusage 15. Jede Beschriftung kostete dann wieder eine eigene Zeile;
       fuenf davon waren am Geraet 90 Pixel. */
    nr: '866', name: 'Die Filterzeile wird am Telefon wieder eine Spalte',
    file: 'public/style.css',
    /* MITGEZOGEN MIT 0.29.0: die Zeile traegt seit Befund 6 eine DRITTE Spalte.
       Was der Rueckbau belegt, ist unveraendert -- dass das Raster die Zeile
       traegt und nicht eine Spalte. */
    search: "  .frow { display: grid; grid-template-columns: auto minmax(0, 1fr) auto;",
    replacement: "  .frow { display: flex; flex-direction: column;",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* UND DIE REIHEN BRECHEN WIEDER UM -- Gegenprobe zum ZWEITEN Hebel. Eine
       Kategoriereihe mit fuenf Pillen mass umgebrochen 77 Pixel und misst in
       einer Zeile 35; der Gewinn waechst mit dem Bestand. */
    nr: '867', name: 'Die Filterreihen brechen wieder um, statt quer zu rollen',
    file: 'public/style.css',
    search: "  .frow > .pills:not(.cloud) { flex-wrap: nowrap; overflow-x: auto;",
    replacement: "  .frow > .pills:not(.cloud) { flex-wrap: wrap;",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },
  {
    /* DIE PILLEN SCHRUMPFEN MIT -- Gegenprobe zu Zusage 16, und sie haelt
       eine ENTSCHEIDUNG fest: gemessen machen die Pillen 33 Prozent des
       Kastens aus, Beschriftungen und Abstaende 42. Der Betreiber hat die
       Messung verlangt, bevor er entschieden hat (11.9.2026). */
    nr: '868', name: 'Die Pillen schrumpfen mit',
    file: 'public/style.css',
    search: "  .pill { padding: 7px 13px; }",
    replacement: "  .pill { padding: 5px 11px; }",
    expected: 'Die Sortierung trennt Grundlage und Richtung — 0.28.1'
  },

  /* ================================================================
     0.29.0 — „Worauf man sich verlassen können muss"
     Acht Bauabschnitte, und jede neue Zusage bekommt ihren Rückbau. */

  /* ---- BA 1: die Sicherungsprobe ---- */
  {
    /* SIE ZEIGT AUF DIE LAUFENDE DATENBANK. Der schlimmste Fehler dieser
       Route: sie oeffnet dann nicht die Kopie, sondern das Original -- und
       die vier Zahlen stimmen immer, ohne je etwas zu belegen. */
    nr: '869', name: 'Die Probe oeffnet die laufende Datenbank statt der Kopie',
    file: 'server.js',
    search: "  const full = path.join(target.filePath, file.name);",
    replacement: "  const full = DB_FILE;",
    expected: 'Die Sicherungsprobe — 0.29.0'
  },
  {
    /* SIE OEFFNET SCHREIBEND. Ohne `readonly` legt SQLite eine WAL neben die
       Sicherung und aendert damit den Ordner, den die Aufraeumregel zaehlt. */
    nr: '870', name: 'Die Probe oeffnet die Sicherung schreibend',
    file: 'server.js',
    search: "    probe = new Database(full, { readonly: true });",
    replacement: "    probe = new Database(full);",
    expected: 'Die Sicherungsprobe — 0.29.0'
  },
  {
    /* DER FREMDE SCHLUESSEL WIRD FUER LESBAR ERKLAERT. Die Karte saegte dann
       „Eintraege 0", und wer das sieht, haelt seine Sicherung fuer leer statt
       fuer unlesbar -- die schlimmste der drei moeglichen Antworten.
       ER WIRFT NICHT MEHR, UND DAS IST EIN FUND DIESER RUNDE: der erste
       Entwurf ersetzte die Zeile durch ein `throw`, und der Lauf RISS AB
       (359 s, kein einziger roter Punkt). Eine Gegenprobe, die abreisst,
       belegt nichts -- sie muss so greifen, dass die Oberflaeche danach noch
       laeuft. */
    nr: '871', name: 'Der fremde Schluessel wird fuer lesbar erklaert',
    file: 'server.js',
    search: "    return res.json({ ok: false, reason: 'key', at: file.time, bytes: file.bytes, nr });",
    replacement: "    return res.json({ ok: true, nr, at: file.time, bytes: file.bytes, itemCount: 0, photoCount: 0, userCount: 0, contentUntil: null });",
    expected: 'Die Sicherungsprobe — 0.29.0'
  },
  {
    /* EINE NUMMER, DIE ES NICHT GIBT, WIRD ZU EINER LEEREN SICHERUNG. Dann
       antwortet die Probe auf #9999 mit „Eintraege 0" statt mit einer Absage,
       und wer sich vertippt, haelt eine Kopie fuer leer, die es gar nicht gibt.
       ER ZIELT AUF DIE ABSAGE UND NICHT AUF DIE ZAHLENPRUEFUNG DAVOR, und das
       ist ein Fund dieser Runde: der erste Entwurf nahm `Number.isInteger`
       heraus und blieb STUMM -- `files[9999 - 1]`, `files[0 - 1]` und
       `files[NaN - 1]` sind alle drei `undefined`, und die Absage kam
       trotzdem. Ein Griff ohne sichtbare Wirkung belegt nichts. */
    nr: '872', name: 'Eine Nummer, die es nicht gibt, wird zur leeren Sicherung',
    file: 'server.js',
    search: "  if (!file) return res.status(404).json({ error: t(localeOf(req), 'server.backupGone') });",
    replacement: "  if (!file) return res.json({ ok: true, nr, at: 0, bytes: 0, itemCount: 0, photoCount: 0, userCount: 0, contentUntil: null });",
    expected: 'Die Sicherungsprobe — 0.29.0'
  },
  {
    /* DIE ZAHLEN KOMMEN AUS DER LAUFENDEN DATENBANK. Sie saehen richtig aus,
       solange die Kopie frisch ist -- und blieben richtig, wenn die Kopie
       leer waere. */
    nr: '873', name: 'Die Probe zaehlt in der laufenden Datenbank',
    file: 'server.js',
    search: "      itemCount: one('SELECT COUNT(*) AS n FROM items').n,",
    replacement: "      itemCount: db.prepare('SELECT COUNT(*) AS n FROM items').get().n,",
    expected: 'Die Sicherungsprobe — 0.29.0'
  },
  {
    /* SIE GEHOERT DER EIGENTUEMERIN. Die Antwort nennt Datum und Groesse
       einer Datei auf dem Wirt -- dieselbe Klemme wie die Karte selbst. */
    nr: '874', name: 'Die Probe steht schon dem Admin offen',
    file: 'server.js',
    search: "app.post('/api/backup/check', ownerOnly, (req, res) => {",
    replacement: "app.post('/api/backup/check', adminOnly, (req, res) => {",
    expected: 'Die Sicherungsprobe — 0.29.0'
  },

  /* ---- BA 2: der Fingerprint nennt die Datei ---- */
  {
    /* EINE ZWEITE LISTE NEBEN DER ERSTEN. Sie saehe gleich aus und liefe beim
       naechsten Griff auseinander -- Stolperstein 47, und F6 sagt es
       ausdruecklich. */
    nr: '875', name: 'Die Einzelwerte kommen aus einem zweiten Lesevorgang',
    file: 'server.js',
    search: "    files.push({ name: rel,\n      hash: crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8) });",
    replacement: "    files.push({ name: rel, hash: crypto.createHash('sha256')\n      .update(fs.readFileSync(path.join(__dirname, rel))).digest('hex').slice(0, 8) });",
    expected: 'Der Fingerprint nennt die Datei — 0.29.0'
  },
  {
    /* DIE LISTE STEHT DAUERHAFT DA. Der Betreiber hat das ausdruecklich nicht
       gewollt („muss keine extra Zeile"), und achtzehn Zeilen in einer Karte,
       die ohnehin lang ist, schoeben die Verfahren aus dem Blick. */
    nr: '876', name: 'Die Dateiliste steht dauerhaft aufgeklappt da',
    file: 'public/app.js',
    search: '        <div class="fp-list" id="fp-list" hidden>',
    replacement: '        <div class="fp-list" id="fp-list">',
    expected: 'Der Fingerprint nennt die Datei — 0.29.0'
  },

  /* ---- BA 3: das Faelligkeitsdatum ---- */
  {
    /* DER KALENDER WIRD NICHT GEFRAGT. „2026-02-31" hat die richtige Form und
       gibt es nicht; `Date.UTC` rechnet daraus den 3. Maerz. */
    nr: '877', name: 'Ein Tag, den es nicht gibt, wird gespeichert',
    file: 'server.js',
    search: "  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day)\n    return { error: 'server.dueInvalid' };",
    replacement: "  if (false) return { error: 'server.dueInvalid' };",
    expected: 'Das Faelligkeitsdatum — 0.29.0'
  },
  {
    /* OHNE DATUM STEHT WIEDER VORN. Ein NULL sortiert in SQLite von sich aus
       dorthin -- wer keine Zahl hat, haette damit den niedrigsten Wert statt
       gar keinen. */
    nr: '878', name: 'Die Aufgaben ohne Datum stehen wieder vorn',
    file: 'server.js',
    search: "   ORDER BY CASE WHEN c.due_date IS NULL THEN 1 ELSE 0 END,\n            c.due_date,",
    replacement: "   ORDER BY c.due_date,",
    expected: 'Das Faelligkeitsdatum — 0.29.0'
  },
  {
    /* DIE GRUPPIERUNG ZERFAELLT. Ohne die Stufe auf den Eintrag mischen sich
       bei gleicher Sekunde die Zeilen zweier Eintraege ineinander, und
       derselbe Eintrag steht mehrfach in der Liste (F18). */
    nr: '879', name: 'Die Zeilen zweier Eintraege mischen sich in „Offen"',
    file: 'server.js',
    search: "            i.updated_at DESC, c.item_id, c.id`);",
    replacement: "            i.updated_at DESC, c.id`);",
    expected: 'Das Faelligkeitsdatum — 0.29.0'
  },
  {
    /* DAS FELD FEHLT IM EXPORT. Ein Feld, das im Export fehlt, ist beim
       naechsten Einspielen weg -- und der Export ist fuer viele die einzige
       vollstaendige Kopie ausserhalb der Datenbank. */
    nr: '880', name: 'Das Faelligkeitsdatum geht nicht mit hinaus',
    file: 'server.js',
    search: "        ...(c.due_date ? { dueDate: c.due_date } : {}),\n",
    replacement: "",
    expected: 'Das Faelligkeitsdatum — 0.29.0'
  },
  {
    /* DER IMPORT SCHREIBT ROH IN DIE SPALTE. Eine Exportdatei kommt von
       aussen; ein „morgen" darin waere ein Tag, den die Oberflaeche nie
       erlaubt haette. */
    nr: '881', name: 'Der Import schreibt das Datum ungeprueft',
    file: 'server.js',
    search: "                 cDue.error ? null : cDue.value);",
    replacement: "                 c.dueDate || null);",
    expected: 'Das Faelligkeitsdatum — 0.29.0'
  },
  {
    /* DER MIGRATIONSBLOCK WIRD UEBERSPRUNGEN. Eine Bestandsdatenbank traegt
       die Spalte dann nie, und jeder Griff auf `due_date` faellt dort um. */
    nr: '882', name: 'Der zwoelfte Migrationsblock tut nichts',
    file: 'db.js',
    search: "  if (columns.includes('due_date')) return 0;",
    replacement: "  return 0;",
    expected: 'Das Faelligkeitsdatum — 0.29.0'
  },
  {
    /* ER SETZT EINEN VORGABEWERT NACH. Ein selbst gesetztes Datum an fremder
       Arbeit ist eine Behauptung, und frisch angelegt und gewandert saehen
       danach verschieden aus. */
    nr: '883', name: 'Die Migration erfindet ein Datum fuer den Bestand',
    file: 'db.js',
    search: "  db.exec('ALTER TABLE comments ADD COLUMN due_date TEXT');",
    replacement: "  db.exec('ALTER TABLE comments ADD COLUMN due_date TEXT');\n  db.exec(\"UPDATE comments SET due_date = date('now') WHERE kind = 'task'\");",
    expected: 'Das Faelligkeitsdatum — 0.29.0'
  },

  /* ---- BA 4: die Adresse bekommt ihr Schloss ---- */
  {
    /* DER INDEX OHNE `WHERE`. Dann ist schon der ZWEITE Zugang ohne Adresse
       eine Verletzung -- und genau die soll er zulassen. */
    nr: '884', name: 'Der Index laesst nur EINEN Zugang ohne Adresse zu',
    file: 'db.js',
    search: "             ON users(email COLLATE NOCASE) WHERE email IS NOT NULL`);",
    replacement: "             ON users(email COLLATE NOCASE)`);",
    expected: 'Die Adresse ist eindeutig — 0.29.0'
  },
  {
    /* OHNE NOCASE. „Anna@Haus.de" und „anna@haus.de" stuenden dann
       nebeneinander, und der Befund waere nur halb erledigt. */
    nr: '885', name: 'Der Index unterscheidet Gross- und Kleinschreibung',
    file: 'db.js',
    search: "  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email\n             ON users(email COLLATE NOCASE) WHERE email IS NOT NULL`);",
    replacement: "  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email\n             ON users(email) WHERE email IS NOT NULL`);",
    expected: 'Die Adresse ist eindeutig — 0.29.0'
  },
  {
    /* DER FEHLSCHLAG WIRD VERSCHLUCKT. Die Instanz saehe dann aus, als haette
       sie ein Schloss, und haette keins -- die schlimmste Antwort auf F10. */
    nr: '886', name: 'Der fehlgeschlagene Index wird verschwiegen',
    file: 'db.js',
    search: "  doubleEmails = db.prepare(qDoubleEmails).all();",
    replacement: "  doubleEmails = [];",
    expected: 'Die Adresse ist eindeutig — 0.29.0'
  },
  {
    /* DIE KARTE FRAGT NICHT NACH. Dann bliebe der Warnkasten leer, waehrend
       zwei gleiche Adressen dastehen. */
    nr: '887', name: 'Die Karte „Benutzer" meldet keine doppelten Adressen',
    file: 'db.js',
    search: "  return present ? [] : db.prepare(qDoubleEmails).all();",
    replacement: "  return [];",
    expected: 'Die Adresse ist eindeutig — 0.29.0'
  },

  /* ---- BA 6 und 7: die beiden Bildschirmbefunde ---- */
  {
    /* ALLE VERWEISE IN SPALTE DREI. Der Ruecksetzer der Sortierzeile ist
       140 px breit und nimmt sie der Sortierwahl daneben -- gemessen bleiben
       ihr 30 px, und der NAME der Sortierung ist fort (F17). */
    nr: '888', name: 'Auch der Ruecksetzer der Sortierzeile geht in Spalte drei',
    file: 'public/style.css',
    search: "  .frow > .frow-right-end { grid-column: 3; }",
    replacement: "  .frow > .frow-right { grid-column: 3; }",
    expected: 'Die Filterzeile und der Kategoriekasten — 0.29.0'
  },
  {
    /* DER UND/ODER-UMSCHALTER ZURUECK IN DIE SPANNE. Zwei Pillen, die 86 px
       brauchen, spannen dann wieder ueber 362 -- und die Beschriftung „Tags"
       bleibt allein auf der Zeile darueber stehen. */
    /* NACHGEZOGEN MIT 0.30.0: „und/Oder" steht seither in Spalte EINS und in
       der ZWEITEN Rasterzeile -- unter der Beschriftung. Der Rueckbau setzt
       ihn wieder daneben, und genau das ist der Befund vom 12. September:
       neben ihr nimmt er der Wolke die erste Zeile weg. */
    nr: '889', name: 'Der Und/Oder-Umschalter steht wieder neben der Beschriftung',
    file: 'public/style.css',
    search: "  .frow-tags > .tagmode { grid-column: 1; grid-row: 2; margin-right: 0;",
    replacement: "  .frow-tags > .tagmode { grid-column: 2; grid-row: 1; margin-right: 0;",
    expected: 'Die Filterzeile und der Kategoriekasten — 0.29.0'
  },
  {
    /* DIE FESTE ZAHL STATT DES TEILENS. Sie traegt bei 100 Prozent Schrift und
       kann bei 80 bis 120 nur falsch werden -- dieselbe Ueberlegung, die im
       Stilblatt schon dreimal steht. */
    nr: '890', name: 'Der Kategoriekasten bekommt eine ausgerechnete Breite',
    file: 'public/style.css',
    search: "  [data-block=\"kategorie\"] .row-in > #cat,\n  [data-block=\"kategorie\"] .row-in > .input { flex: 1 1 0; min-width: 0; }",
    replacement: "  [data-block=\"kategorie\"] .row-in > #cat { width: 119px; min-width: 119px; }",
    expected: 'Die Filterzeile und der Kategoriekasten — 0.29.0'
  },
  {
    /* DER PLATZHALTER WIRD WIEDER LANG. Gemessen sind im schmalen Feld 91 bis
       106 px Platz; „Neue Kategorie" braucht 124 bis 139 und passt bei keiner
       Schriftstufe. */
    nr: '891', name: 'Der Platzhalter der Kategorie wird wieder lang',
    file: 'public/languages/de.json',
    search: '  "entry.newCategoryHint": "Name",',
    replacement: '  "entry.newCategoryHint": "Neue Kategorie",',
    expected: 'Die Filterzeile und der Kategoriekasten — 0.29.0'
  },

  /* ---- BA 8: „Titel" kehrt um ---- */
  {
    /* „TITEL" WIRD WIEDER EINSPURIG. Der Befund aus dem Betrieb waere damit
       zurueck: „Z bis A kann nicht angewahlt werden". */
    nr: '892', name: '„Titel" kennt wieder nur eine Richtung',
    file: 'public/app.js',
    search: "      down: 'list.dirZA',       up: 'list.dirAZ',     start: 'up' },",
    replacement: "      down: null,               up: 'list.dirAZ',     start: 'up' },",
    expected: '„Titel" kehrt um — 0.29.0'
  },
  {
    /* DER VERGLEICHER KENNT DIE GEGENRICHTUNG NICHT. Der Knopf sagte dann
       „Z → A", und die Liste ordnete still nach dem Aenderungsdatum weiter --
       genau der Fehler, den 0.28.1 gefunden hat. */
    nr: '893', name: 'Der Vergleicher kennt title_desc nicht',
    file: 'public/app.js',
    search: "      case 'title_desc':  return b.title.localeCompare(a.title, LOCALE);",
    replacement: "",
    expected: '„Titel" kehrt um — 0.29.0'
  },
  {
    /* DER SATZ BLEIBT STEHEN, obwohl ihn nichts mehr ausloest. Eine Regel ohne
       Traeger bleibt nicht stehen (F21). */
    nr: '894', name: '„Diese Sortierung hat nur eine Richtung" steht wieder da',
    file: 'public/languages/de.json',
    search: '  "list.sortFlip": "Richtung umkehren",',
    replacement: '  "list.sortFlip": "Richtung umkehren",\n  "list.sortOneWay": "Diese Sortierung hat nur eine Richtung",',
    expected: '„Titel" kehrt um — 0.29.0'
  },

  /* ================= DIE RUECKBAUTEN DER RUNDE 0.30.0 =================
     EINUNDZWANZIG NEUE, 895 bis 915. Jede neue Zusage dieser Runde bekommt
     ihren Rueckbau, und jeder Rueckbau nennt die Gruppe, die er rot machen
     muss -- ein Rueckbau, der NICHTS rot macht, ist ein STUMMER und damit ein
     Fund ueber die Zusage und nicht ueber den Baum.
     FUENF ALTE SIND AUSSERDEM NACHGEZOGEN (604, 605, 636, 658, 889): ihre
     Suchtexte standen nach dieser Runde nicht mehr da. Ein Rueckbau, dessen
     Suchtext fehlt, ist ein Fund ueber die LISTE -- in 0.29.0 waren es fuenf,
     in dieser Runde wieder. */
  {
    /* DER ZWEITE BLICK FAELLT WEG. Was kein Muster ueber die Befehlszeile je
       findet -- ein Server aus `node -e` --, faellt danach wieder durch. */
    nr: '895', name: "Der Portblick der Gegenprobe sieht nicht mehr nach",
    file: "counterproof.js",
    search: "  return [...listeningPorts()]\n    .filter(p => p >= span.from && p <= span.to && !taken.has(p))",
    replacement: "  return [].concat()\n    .filter(p => p >= span.from && p <= span.to && !taken.has(p))",
    expected: "Der Waechter erkennt den Prueflauf — 0.30.0"
  },
  {
    /* ZURUECK AUF DIE ZAHL, DIE IN 0.8.10 UND 0.8.30 ZU KLEIN WAR. Unter
       schwerer Nebenlast reisst der Lauf dann wieder ab, statt eine Pruefung
       namentlich rot zu faerben. */
    nr: '896', name: "Das Wartefenster steht wieder auf zwoelf Sekunden",
    file: "testbench.js",
    search: "const READY_TRIES = 300;",
    replacement: "const READY_TRIES = 120;",
    expected: "Das Wartefenster und seine Meldung — 0.30.0"
  },
  {
    /* DIE TEURERE HAELFTE DES BEFUNDES. Der Lauf startet 78 Server;
       „Zweitserver nicht erreichbar" schickt auf eine Suche durch alle. */
    nr: '897', name: "Die Meldung des Zweitservers nennt ihn nicht mehr",
    file: "testbench.js",
    search: "  `Zweitserver nicht erreichbar: Portbasis ${portBase}, Port ${port}, ` +\n  `Verzeichnis ${dataDirectory} -- ${READY_TRIES * READY_STEP / 1000} s gewartet\\n${log}`;",
    replacement: "  `Zweitserver nicht erreichbar -- ${READY_TRIES * READY_STEP / 1000} s gewartet\\n${log}`;",
    expected: "Das Wartefenster und seine Meldung — 0.30.0"
  },
  {
    /* EIN AUFRAEUMEN, DAS NIE GREIFT, SIEHT AUS WIE EINES, DAS GREIFT. Genau
       deshalb sieht die Zusage hinterher nach, ob der Prozess wirklich fort
       ist -- und nicht nur, ob der Aufraeumer gerufen wurde. */
    nr: '898', name: "Der Aufraeumer beim Start beendet nichts mehr",
    file: "testbench.js",
    search: "  for (const z of found) { try { process.kill(z.pid, 'SIGKILL'); } catch {} }",
    replacement: "  for (const z of found) { /* nicht beenden */ }",
    expected: "Der Pruefstand raeumt beim Start auf — 0.30.0"
  },
  {
    /* OHNE DIESE ZAHL IST JEDE BESCHLEUNIGUNG GERATEN. Eine leere Tafel sagt
       genauso wenig wie gar keine -- und sieht aus wie eine. */
    nr: '899', name: "Die Schlusstafel bleibt leer",
    file: "testbench.js",
    search: "  const worst = [...rows].sort((a, b) => b.ms - a.ms).slice(0, top);",
    replacement: "  const worst = [];",
    expected: "Die Schlusstafel sagt, wo die Zeit hingeht — 0.30.0"
  },
  {
    /* DIE KURVE FUER JEDEN ZAEHLERSTAND. Bis 0.30.0 deckte der Lauf nur die
       sechs Staende ab, durch die er zufaellig ging -- ein Schritt von 500
       statt 700 ms waere dabei durchgegangen. */
    nr: '900', name: "Die Kurve der Anmeldebremse ist verbogen",
    file: "auth.js",
    search: "  return over > 0 ? Math.min(over * 700, 4000) : 0;",
    replacement: "  return over > 0 ? Math.min(over * 500, 4000) : 0;",
    expected: "Die Anmeldebremse — an der reinen Funktion — 0.30.0"
  },
  {
    /* DIE KURVE AN DER FUNKTION UND DIE VERDRAHTUNG AN DER ROUTE. Ohne diese
       zweite Haelfte belegte der Lauf eine Formel, die niemand ruft. */
    nr: '901', name: "Die Route wartet gar nicht mehr",
    file: "auth.js",
    search: "  return { blocked: false, delayMs: keys.brakeWait(delayMs) };",
    replacement: "  return { blocked: false, delayMs: 0 };",
    expected: "Und die Route wartet wirklich — 0.30.0"
  },
  {
    /* `N` IST EINE SICHERHEITSGRENZE. Eine Auslieferung, die sie senkt,
       senkt sie auf jedem Wirt -- und niemand sieht es. */
    nr: '902', name: "Die Auslieferung traegt eine gesenkte Kostenstufe",
    file: "auth.js",
    search: "const SCRYPT_SHIPPED = 16384;",
    replacement: "const SCRYPT_SHIPPED = 1024;",
    expected: "Der Pruefschalter und seine Grenzen — 0.30.0"
  },
  {
    /* DIE KLAMMER IST DER GANZE PUNKT VON F1. Eine Variable, die so heisst,
       wie man sie erraet, senkt die Anmeldung aus Versehen. */
    nr: '903', name: "Die Kostenstufe laesst sich wieder ueber eine gewoehnliche Variable senken",
    file: "keys.js",
    search: "  const wish = set && set.scrypt;",
    replacement: "  const wish = Number(process.env.SCRYPT_N) || (set && set.scrypt);",
    expected: "Der Pruefschalter und seine Grenzen — 0.30.0"
  },
  {
    /* EINE ANLAGE, DIE NACH FUENF SEKUNDEN AUFGIBT, VERSCHICKT WENIGER MAIL.
       Die Frist ist keine Sicherheitsgrenze, aber sie ist hergeleitet. */
    nr: '904', name: "Die ausgelieferte Mailfrist ist gesenkt",
    file: "mail.js",
    search: "const SEND_SHIPPED = 20 * 1000;",
    replacement: "const SEND_SHIPPED = 5 * 1000;",
    expected: "Der Pruefschalter und seine Grenzen — 0.30.0"
  },
  {
    /* EIN SCHALTER, DER NICHTS TUT, SIEHT AUS WIE EINER, DER WIRKT. Ohne
       diesen Rueckbau bliebe offen, ob die 55 Sekunden wirklich von ihm
       kommen. */
    nr: '905', name: "Der Pruefschalter stellt die Fristen gar nicht mehr kurz",
    file: "keys.js",
    search: "  return Math.max(TESTBENCH_FLOOR.mail, Math.round(shipped / part));",
    replacement: "  return shipped;",
    expected: "Der Pruefschalter und seine Grenzen — 0.30.0"
  },
  {
    /* DER FUENFTE FUND IN SECHS RUNDEN, wiederhergestellt. Genau ihn soll
       die neue Wache fangen -- und nicht nur der nachgetragene Schluessel. */
    nr: '906', name: "„gewichtet\" steht wieder fest im Quelltext",
    file: "public/app.js",
    search: "          (weightedCalc ? ' ' + t('entry.weighted') : '');",
    replacement: "          (weightedCalc ? ' gewichtet' : '');",
    expected: "Kein deutscher Bildschirmsatz sitzt fest — die neue Wache — 0.30.0"
  },
  {
    /* EIN SIEB, DAS ALLES DURCHLAESST, IST KEIN SIEB. Die Wache waere danach
       gruen und blind -- deshalb prueft die Zusage das Sieb selbst. */
    nr: '907', name: "Die neue Wache schaut an jeder Kennung vorbei",
    file: "testbench.js",
    search: "    const isName = (t) => /^[a-z0-9][a-z0-9._#/-]*$/.test(t.trim()) || /^#\\//.test(t.trim());",
    replacement: "    const isName = (t) => true;",
    expected: "Kein deutscher Bildschirmsatz sitzt fest — die neue Wache — 0.30.0"
  },
  {
    /* ZWEI EINTEILUNGEN AN ZWEI ORTEN LAUFEN AUSEINANDER -- Stolperstein 47.
       Genau dafuer ist `dueOf` in dieser Runde nach oben gewandert. */
    nr: '908', name: "Eine zweite Einteilung steht neben der ersten",
    file: "public/app.js",
    search: "  const SECTIONS = [['overdue', 'list.dueOverdue'], ['today', 'list.dueToday'],",
    replacement: "  const dueOf = (z) => !z.dueDate ? 'none' : 'later';\n  const SECTIONS = [['overdue', 'list.dueOverdue'], ['today', 'list.dueToday'],",
    expected: "Das Faelligkeitsdatum bekommt Farbe — 0.30.0"
  },
  {
    /* VIER ZUSTAENDE, VIER FARBEN -- wer zwei davon gleich faerbt, hat drei.
       Gemessen ist es: „spaeter" und „erledigt" trugen zuerst dieselbe. */
    nr: '909', name: "Zwei Zustaende des Faelligkeitsdatums sind gleich gefaerbt",
    file: "public/style.css",
    search: ".cmt-due.due-done { color: var(--green); text-decoration: line-through; }",
    replacement: ".cmt-due.due-done { color: var(--blue); text-decoration: line-through; }",
    expected: "Das Faelligkeitsdatum bekommt Farbe — 0.30.0"
  },
  {
    /* EINE ANGABE, DIE JEMAND EINGETRAGEN HAT, VERSCHWINDET NICHT BEIM
       ABHAKEN. Der Betreiber verlangt ausdruecklich „ob fertig, oder noch
       offen". */
    nr: '910', name: "Das Datum verschwindet beim Abhaken wieder",
    file: "public/app.js",
    search: "              ? (task || done ? `<button class=\"link-btn cmt-due${",
    replacement: "              ? (task ? `<button class=\"link-btn cmt-due${",
    expected: "Das Faelligkeitsdatum bekommt Farbe — 0.30.0"
  },
  {
    /* 147 PIXEL, UND SIE KOSTEN KEINE EINZIGE BESCHRIFTUNG. Der Rueckbau
       nimmt sie wieder her. */
    nr: '911', name: "Die Vokabelkarte behaelt ihre Luft",
    file: "public/style.css",
    search: "  .vocabulary-grid .field { margin-bottom: 4px; }",
    replacement: "  .vocabulary-grid .field { margin-bottom: 10px; }",
    expected: "Der Bewertungskasten und die Vokabelkarte — 0.30.0"
  },
  {
    /* C1 STATT C1a. Wer „gut" sagt, bekommt nicht ungefragt etwas anderes --
       und eine Regel ohne die Klammer trifft genau diese Fassung. */
    nr: '912', name: "Die Luft geht auch dort weg, wo nur ein Zugang ist",
    file: "public/style.css",
    search: "  .rlist:not(.no-average) .rrow .rname { padding-top: 4px; line-height: 1.35; }",
    replacement: "  .rrow .rname { padding-top: 4px; line-height: 1.35; }",
    expected: "Der Bewertungskasten und die Vokabelkarte — 0.30.0"
  },
  {
    /* EIN SATZ OHNE LESER BLEIBT NICHT STEHEN. Der Umschalter ist gefallen,
       und mit ihm die Zahl, die an ihm stand. */
    nr: '913', name: "Die Zahl am gefallenen Umschalter steht wieder in der Sprachdatei",
    file: "public/languages/de.json",
    search: "  \"list.tags\": ",
    replacement: "  \"list.tagsCount\": \"Tags ({length})\",\n  \"list.tags\": ",
    expected: "Die Tagzeile steht offen — 0.30.0"
  },
  {
    /* 159 STATT 67 PIXEL. Gemessen kippt die Kopfzeile damit von 42 auf 81
       px -- zusammen mit dem Wort „gewichtet" daneben. */
    nr: '914', name: "Der Knopf heisst wieder „Wer hat bewertet\"",
    file: "public/languages/de.json",
    search: "  \"entry.whoRated\": \"Wer?\",",
    replacement: "  \"entry.whoRated\": \"Wer hat bewertet\",",
    expected: "Der Bewertungskasten und die Vokabelkarte — 0.30.0"
  },
  {
    /* DIE HAELFTE VON C1a. Ohne sie bleibt der Kasten bei 537 statt 439 px --
       gemessen an fuenf Kriterien und zwei Zugaengen. */
    nr: '915', name: "Die Sternzeile behaelt ihre Luft unter den Sternen",
    file: "public/style.css",
    search: "  .rlist:not(.no-average) .rrow .rreset-cell { padding-bottom: 5px; }",
    replacement: "  .rlist:not(.no-average) .rrow .rreset-cell { padding-bottom: 9px; }",
    expected: "Der Bewertungskasten und die Vokabelkarte — 0.30.0"
  },
  {
    /* DIE GANZE REPARATUR STECKT IN EINER ZEILE. Auf `auto auto` teilen sich
     beide Zeilen die Hoehe der spannenden Wolke, und Beschriftung und
     Umschalter sacken wieder ab -- gemessen 96 und 218 Pixel tief. */
    nr: "916", name: "Beide Rasterzeilen der Tagzeile teilen sich wieder die Hoehe",
    file: "public/style.css",
    search: "  .frow-tags { grid-template-rows: auto 1fr; }",
    replacement: "  .frow-tags { grid-template-rows: auto auto; }",
    expected: "Die Tagzeile rueckt nach oben \u2014 0.30.1"
  },
  {
    /* OHNE `align-self: start` STEHT ER MITTIG in seiner nun 407 px hohen Zeile.
     Die erste Haelfte der Reparatur allein genuegt nicht. */
    nr: "917", name: "Der Umschalter sitzt wieder mittig in seiner Zeile",
    file: "public/style.css",
    search: "  .frow-tags > .tagmode { grid-column: 1; grid-row: 2; margin-right: 0;\n    align-self: start; }",
    replacement: "  .frow-tags > .tagmode { grid-column: 1; grid-row: 2; margin-right: 0; }",
    expected: "Die Tagzeile rueckt nach oben \u2014 0.30.1"
  },
  {
    /* GEMESSEN IST DER UNTERSCHIED: drei Marken in der zugeklappten Reihe statt
     vier, und der offene Filterkasten 654 statt 543 Pixel. */
    nr: "918", name: "Die Marken sind wieder so gross wie vorher",
    file: "public/style.css",
    search: "  .pill-tag { font-size: .72rem; padding: 4px 10px; }",
    replacement: "  .pill-tag { font-size: .77rem; padding: 7px 13px; }",
    expected: "Die Tagzeile rueckt nach oben \u2014 0.30.1"
  },
  {
    /* SIE IST DAS MERKMAL, AN DEM EINE MARKE VON EINER KATEGORIE ZU
     UNTERSCHEIDEN IST -- und sie bringt an Breite fast nichts (gemessen neun
     Pixel an der breitesten Marke, keine Reihe, kein Pixel Hoehe). */
    nr: "919", name: "Die Festschrift der Marken faellt",
    file: "public/style.css",
    search: "  .pill-tag { font-size: .72rem; padding: 4px 10px; }",
    replacement: "  .pill-tag { font-size: .72rem; padding: 4px 10px; font-family: inherit; }",
    expected: "Die Tagzeile rueckt nach oben \u2014 0.30.1"
  },
  {
    /* DER BEFUND IST DIE ZAHL DER MARKEN und nicht die Groesse aller Pillen. Wer
     die Kategorien mitschrumpft, hat etwas anderes gebaut als bestellt. */
    nr: "920", name: "Die Kategorienpille schrumpft mit",
    file: "public/style.css",
    search: "  .pill-tag { font-size: .72rem; padding: 4px 10px; }",
    replacement: "  .pill-tag { font-size: .72rem; padding: 4px 10px; }\n  .pill { font-size: .72rem; }",
    expected: "Die Tagzeile rueckt nach oben \u2014 0.30.1"
  },
  {
    /* ER MISST 51 DER 344 PIXEL. Ohne ihn passt die Zeile ohne Marken in EINE
     Zeile -- gemessen 54 statt 83 Pixel. */
    nr: "921", name: "Der Wochentag bleibt auch am Telefon stehen",
    file: "public/style.css",
    search: "  .trow .tweek { display: none; }",
    replacement: "  .trow .tweek { display: inline; }",
    expected: "Die Testtagzeile ordnet sich nach ihrem Inhalt \u2014 0.30.1"
  },
  {
    /* `flex: 1 1 0` HEISST „GRUNDBREITE NULL UND DANN WACHSEN": er nimmt sich
     alles, auch wenn gar keine Marke darin steht, und drueckt die Sterne aus
     der Zeile. Genau der Befund des Betreibers. */
    nr: "922", name: "Der Markenkasten greift sich wieder die ganze Breite",
    file: "public/style.css",
    search: "  .trow .ttags { flex: 1 1 auto; }",
    replacement: "  .trow .ttags { flex: 1 1 0; }",
    expected: "Die Testtagzeile ordnet sich nach ihrem Inhalt \u2014 0.30.1"
  },
  {
    /* OHNE `flex-basis: 100%` ZWINGT DAS STUECK KEINEN UMBRUCH, und die erste
     Zeile traegt wieder Datum, Marken UND Sterne. */
    nr: "923", name: "Mit Marken bricht die Zeile nicht mehr vor den Sternen um",
    file: "public/style.css",
    search: "  .trow-tags::after { content: ''; flex-basis: 100%; height: 0; order: 1; }",
    replacement: "  .trow-tags::after { content: ''; height: 0; order: 1; }",
    expected: "Die Testtagzeile ordnet sich nach ihrem Inhalt \u2014 0.30.1"
  },
  {
    /* OHNE DIE KLASSE GREIFT KEINE DER DREI REGELN. Eine Zusage, die nur das
     Stilblatt liest, bliebe hier gruen -- deshalb wird die Klasse gefahren. */
    nr: "924", name: "Die Zeile sagt nicht mehr, ob sie Marken traegt",
    file: "public/app.js",
    search: "      if ((d.tags || []).length) row.classList.add('trow-tags');",
    replacement: "      if (false) row.classList.add('trow-tags');",
    expected: "Die Testtagzeile ordnet sich nach ihrem Inhalt \u2014 0.30.1"
  },
  {
    /* AM ZEILENENDE SAGT ES NICHTS MEHR DARUEBER, WAS DA NOCH KOMMT. Der
     Betreiber hat es ausdruecklich rechts VON DEN MARKEN bestellt. */
    nr: "925", name: "\u201emehr\" steht hinter den Sternen statt bei den Marken",
    file: "public/app.js",
    search: "        row.append(date, wd, tagBox, more, s, x);",
    replacement: "        row.append(date, wd, tagBox, s, x, more);",
    expected: "Die Testtagzeile ordnet sich nach ihrem Inhalt \u2014 0.30.1"
  },
  {
    /* DANN BRECHEN SIEBEN MARKEN DIE ZEILE WIEDER AUF VIER REIHEN AUF --
     gemessen 309 statt 100 Pixel. */
    nr: "926", name: "Die Marken eines Testtags werden nicht mehr auf eine Reihe begrenzt",
    file: "public/app.js",
    search: "      const trimmed = limitCloud(tagBox, opened ? 0 : 1);",
    replacement: "      const trimmed = limitCloud(tagBox, 0);",
    expected: "Die Testtagzeile ordnet sich nach ihrem Inhalt \u2014 0.30.1"
  },
  {
    /* DIE ZAHL ALLEIN SAGT NICHT, WAS SIE ZAEHLT. Der Sinn steht im Titel --
     ohne ihn ist die Kuerzung genau der Verlust, den F12 ausschliesst. */
    nr: "927", name: "Der Zaehler verliert seinen Titel",
    file: "public/app.js",
    search: "  `<span class=\"mcount\" title=\"${esc(long)}\">${esc(short)}</span>`;",
    replacement: "  `<span class=\"mcount\">${esc(short)}</span>`;",
    expected: "In der Zeile die Zahl, im Titel das Wort \u2014 0.30.1"
  },
  {
    /* ZWEI ZAHLEN OHNE WORT SIND LESBAR, solange ihre Reihenfolge feststeht.
     Ausgeschrieben frisst die Zelle die Namensspalte, um die es geht. */
    nr: "928", name: "Die Tagkarte schreibt ihre beiden Zahlen wieder aus",
    file: "public/app.js",
    search: "      shortCounter: e => `${e.usage_count} \u00b7 ${e.test_usage_count}`,",
    replacement: "      shortCounter: e => `${e.usage_count} ${vThing(e.usage_count)} \u00b7 ${e.test_usage_count} ${vTime(e.test_usage_count)}`,",
    expected: "In der Zeile die Zahl, im Titel das Wort \u2014 0.30.1"
  },
  {
    /* DAS IST DIE FASSUNG VON 0.30.0: „erledigt" schlaegt jede Frist. „Zu spaet
     fertig" saehe dann aus wie „rechtzeitig fertig". */
    nr: "929", name: "Eine zu spaet erledigte Aufgabe verliert ihr Rot",
    file: "public/app.js",
    search: "  if (z.dueDate < todayKey()) return settled ? 'late' : 'overdue';",
    replacement: "  if (settled) return 'done';\n  if (z.dueDate < todayKey()) return 'overdue';",
    expected: "Das Faelligkeitsdatum bekommt Farbe \u2014 0.30.0"
  },
  {
    /* DIE ZUORDNUNG AUSDRUECKLICH: gruen fuer gerissen waere ebenfalls
     dreifarbig und sagte das Gegenteil. */
    nr: "930", name: "Gerissen und gehalten tragen dieselbe Farbe",
    file: "public/style.css",
    search: ".cmt-due.due-late { color: var(--red); text-decoration: line-through; }",
    replacement: ".cmt-due.due-late { color: var(--green); text-decoration: line-through; }",
    expected: "Das Faelligkeitsdatum bekommt Farbe \u2014 0.30.0"
  },
  {
    /* BEFUND 8: der ganze Markenkasten stand hinter „darf aendern", und damit
     sah das Datum nur, wer es auch aendern durfte -- waehrend die Ansicht
     „Offen" es jedem zeigt. */
    nr: "931", name: "Das Faelligkeitsdatum verschwindet wieder hinter der Bedienung",
    file: "public/app.js",
    search: "      const dueShown = (task || done) && c.dueDate;",
    replacement: "      const dueShown = false;",
    expected: "Das Faelligkeitsdatum sieht jeder, der den Eintrag sieht \u2014 0.30.1"
  },
  {
    /* EIN KNOPF, DER NICHTS TUT, IST EINE LUEGE UEBER DIE EIGENE BEDIENBARKEIT.
     Der Rueckbau schliesst das Element bewusst falsch -- der Browser macht
     daraus einen Knopf ohne Inhalt, und die Zusage faellt. */
    nr: "932", name: "Wer nicht aendern darf, bekommt wieder einen Knopf",
    file: "public/app.js",
    search: "              : `<span class=\"cmt-due on due-${dueState}\"",
    replacement: "              : `<button class=\"cmt-due on due-${dueState}\"",
    expected: "Das Faelligkeitsdatum sieht jeder, der den Eintrag sieht \u2014 0.30.1"
  },
  {
    /* GEMESSEN: die Namensspalte im Einzelzugang faellt von 210 auf 186 Pixel,
     und das laengste Wort misst 200 -- es bricht wieder mitten durch. */
    nr: "933", name: "Der Stern am Telefon ist wieder so gross wie am Finger",
    file: "public/style.css",
    search: "  .star { font-size: 1.1rem; }",
    replacement: "  .star { font-size: 1.25rem; }",
    expected: "Die Sortierung trennt Grundlage und Richtung \u2014 0.28.1"
  },
  {
    /* VIER ABSTAENDE ZU EINEM PIXEL SIND VIER PIXEL SPALTENBREITE. An zehn
     Pixeln Luft ist das die Haelfte. */
    nr: "934", name: "Der Abstand zwischen den Sternen bleibt, wie er war",
    file: "public/style.css",
    search: "  .stars { gap: 2px; }",
    replacement: "  .stars { gap: 3px; }",
    expected: "Die Sortierung trennt Grundlage und Richtung \u2014 0.28.1"
  }
];

/* ================= Spuren und Versatz =================
   Der Versatz je Nebenspur steht im PRUEFSTAND (OFFSET_LEVEL) und wird von
   dort gelesen -- der Waechter, der ihn nachrechnet, liegt dort, und zwei
   Zahlen an zwei Orten laufen auseinander. Faellt die Zeile weg, bricht der
   Treiber ab, statt still auf einen Vorgabewert zu fallen. */
function offsetLevel() {
  const t = fs.readFileSync(path.join(__dirname, 'testbench.js'), 'utf8');
  const m = t.match(/^const OFFSET_LEVEL = (\d+);$/m);
  if (!m) {
    console.error('In testbench.js steht keine Zeile "const OFFSET_LEVEL = <Zahl>;".');
    console.error('Ohne sie faehrt der Treiber keine Nebenspuren.');
    process.exit(1);
  }
  return Number(m[1]);
}

const MAX_TRACES = 4;

/* ================= Kopie und Aufraeumen ================= */

function makeCopy(target) {
  fs.mkdirSync(target, { recursive: true });
  // git archive schreibt einen tar-Strom; entpackt wird er unmittelbar. Damit
  // liegt nie eine Zwischendatei herum, und der Stand ist der von HEAD.
  const tar = spawnSync('sh', ['-c',
    `git -C ${JSON.stringify(__dirname)} archive HEAD | tar -x -C ${JSON.stringify(target)}`],
    { encoding: 'utf8' });
  if (tar.status !== 0)
    throw new Error(`git archive gescheitert: ${(tar.stderr || '').trim()}`);
  /* node_modules wird VERKNUEPFT statt kopiert: es traegt uebersetzte native
     Anteile, waere je Kopie ein paar hundert Megabyte, und kein Rueckbau fasst
     es an. Eine Verknuepfung genuegt -- require loest sie auf. */
  fs.symlinkSync(path.join(__dirname, 'node_modules'), path.join(target, 'node_modules'), 'dir');
}

/* Wer laeuft noch unter diesem Pfad? Erkannt am Arbeitsverzeichnis und nicht an
   der Befehlszeile (Stolperstein 133). Liefert die Nummern der Prozesse. */
function processesUnder(dirPath) {
  const outcome = [];
  let entries;
  try { entries = fs.readdirSync('/proc'); } catch { return outcome; }
  for (const e of entries) {
    if (!/^\d+$/.test(e)) continue;
    let cwd;
    try { cwd = fs.readlinkSync(`/proc/${e}/cwd`); } catch { continue; }
    if (cwd === dirPath || cwd.startsWith(dirPath + path.sep)) outcome.push(Number(e));
  }
  return outcome;
}

/* ================= Fremde Server VOR dem Lauf =================
   DER BEFUND, AUS DEM DIESE FUNKTION ENTSTANDEN IST (0.21.0): sieben Server
   aus abgebrochenen Laeufen hingen noch an den Ports 6180 bis 6242 -- genau
   im Fenster der Mailgruppe. Spur 0 faehrt ohne Versatz und lief deshalb
   gegen sie: ZWEI Rueckbauten bekamen rote Punkte IM MAILVERSAND, an einer
   Stelle also, mit der sie nichts zu tun haben. Einer davon (570) hatte in
   seiner eigenen Gruppe KEINEN einzigen -- die Tabelle zeigte ihn trotzdem
   als „2 rot" und damit als Beleg. SIE HAT GELOGEN, und zwar in die
   gefaehrliche Richtung: ein stummer Rueckbau sah aus wie ein greifender.
   EIN ZWEITER SERVER AUF DEMSELBEN PORT FAELLT NICHT VON SELBST AUF (Stolper-
   stein 139) -- die Bereitschaftspruefung bekommt ja eine Antwort. Deshalb
   wird hier VOR dem ersten Rueckbau nachgesehen und nicht hinterher gedeutet.
   GESUCHT WIRD UEBER `/proc`, wie bei processesUnder(): keine neue Abhaengig-
   keit, kein `ps`, und dieselbe Auskunft. Ein Prozess zaehlt als fremd, wenn
   sein Befehl auf server.js oder testbench.js endet -- eigene Kinder gibt es zu
   diesem Zeitpunkt noch keine.

   DER NAME WAR BIS 0.30.0 FALSCH, UND ZWAR SEIT 0.21.0: im Ausdruck stand
   `pruefung.js` -- eine Datei, die es in diesem Repository nie gegeben hat.
   Der Kommentar hier sagte die ganze Zeit das Richtige, drei Zeilen tiefer
   stand etwas anderes, und damit fand der Waechter GENAU DEN FALL NICHT, fuer
   den es ihn gibt: den nebenher laufenden Prueflauf. Neunzehn Rueckbauten sind
   hintereinander als ABGERISSEN gemeldet worden. EINE ZUSAGE LIEST IHREN
   GEGENSTAND UND NICHT DEN ABSATZ DARUEBER -- deshalb faehrt die Zusage zu
   dieser Zeile seit 0.30.0 einen ECHT GESTARTETEN Prozess und liest den
   Ausdruck nicht mehr.

   UND DER ZWEITE BLICK GEHT AUF DIE PORTS -- 0.30.0 (F7). Ein Server aus
   `node -e "require('./server.js')"` traegt server.js nirgends in seiner
   Befehlszeile; ein Muster ueber den ganzen Aufruf faenge dafuer jedes zweite
   Werkzeug mit. GENAU SO EINER IST BEIM BAUEN VON 0.21.0 ENTSTANDEN und eine
   Viertelstunde unbemerkt gelaufen. Wer horcht, faellt dagegen auf, ganz
   gleich, wie er gestartet wurde: `/proc/net/tcp` nennt jeden horchenden
   Socket samt Port, und die Spanne der Portbasen steht im Pruefstand.
   ZWEI BLICKE UND NICHT EINER, weil sie VERSCHIEDENES finden: der erste sieht
   auch einen Server, der gerade erst startet und noch nicht horcht; der zweite
   sieht auch einen, dessen Befehlszeile nichts verraet. */
function foreignServer() {
  const outcome = [];
  let entries;
  try { entries = fs.readdirSync('/proc'); } catch { return outcome; }
  for (const e of entries) {
    if (!/^\d+$/.test(e) || Number(e) === process.pid) continue;
    let row;
    try { row = fs.readFileSync(`/proc/${e}/cmdline`, 'utf8'); } catch { continue; }
    const parts = row.split('\0').filter(Boolean);
    /* DAS SKRIPT UND NICHT DAS LETZTE STUECK. `node testbench.js sterne` endet
       auf dem Filterwort -- wer die Zeile daran erkennen will, bekommt dann
       „sterne" gemeldet und sucht nach etwas, das es nicht gibt. */
    const script = parts.find(t => /(^|\/)(server|testbench)\.js$/.test(t));
    if (!script) continue;
    /* DER PORT AUS DER UMGEBUNG, wenn er dasteht: ohne ihn muesste der Leser
       raten, welches Fenster belegt ist -- und genau das Raten hat in dieser
       Runde zwei Stunden gekostet. */
    let port = '';
    try {
      port = (fs.readFileSync(`/proc/${e}/environ`, 'utf8').split('\0')
        .find(z => z.startsWith('PORT=')) || '').slice(5);
    } catch { /* ein fremder Prozess muss seine Umgebung nicht hergeben */ }
    let wo = '';
    try { wo = fs.readlinkSync(`/proc/${e}/cwd`); } catch { /* ebenso */ }
    outcome.push({ pid: Number(e), port, wo, script: path.basename(script) });
  }
  return outcome;
}

/* ================= Wer horcht im Fenster des Prueflaufs? =================
   0.30.0, F7. DIE SPANNE KOMMT AUS DEM PRUEFSTAND und wird dort gegen die
   LAUFENDEN Portbasen nachgerechnet (Gruppe „Die Portbasen und der Versatz").
   Zwei Zahlen an zwei Orten liefen auseinander -- deshalb steht sie einmal da
   und wird hier gelesen, genau wie OFFSET_LEVEL.
   GELESEN WIRD `/proc/net/tcp` UND `/proc/net/tcp6`: der Zustand 0A ist
   LISTEN, das Feld davor traegt Adresse und Port hexadezimal. Keine neue
   Abhaengigkeit, kein `ss`, kein `lsof` -- dieselbe Auskunft wie bei
   processesUnder() und aus derselben Quelle. */
function portSpan() {
  const t = fs.readFileSync(path.join(__dirname, 'testbench.js'), 'utf8');
  const from = t.match(/^const PORT_SPAN_FROM = (\d+);$/m);
  const to = t.match(/^const PORT_SPAN_TO = (\d+);$/m);
  if (!from || !to) {
    console.error('In testbench.js fehlt PORT_SPAN_FROM oder PORT_SPAN_TO.');
    console.error('Ohne die Spanne kann die Gegenprobe die Ports nicht ansehen.');
    process.exit(1);
  }
  return { from: Number(from[1]), to: Number(to[1]) };
}

function listeningPorts() {
  const outcome = new Set();
  for (const file of ['/proc/net/tcp', '/proc/net/tcp6']) {
    let rows;
    try { rows = fs.readFileSync(file, 'utf8').split('\n').slice(1); } catch { continue; }
    for (const row of rows) {
      const piece = row.trim().split(/\s+/);
      if (piece.length < 4 || piece[3] !== '0A') continue;
      const port = parseInt((piece[1].split(':')[1] || ''), 16);
      if (port) outcome.add(port);
    }
  }
  return outcome;
}

/* WER HORCHT, OHNE DASS SEIN BEFEHL IHN VERRAET. Die Nummern, die schon ueber
   foreignServer() gemeldet sind, bleiben hier weg: zweimal dieselbe Sache zu
   melden macht die Meldung laenger und nicht genauer. */
function foreignPort(known = []) {
  const span = portSpan();
  const taken = new Set(known.map(Number).filter(Boolean));
  return [...listeningPorts()]
    .filter(p => p >= span.from && p <= span.to && !taken.has(p))
    .sort((a, b) => a - b);
}

/* Raeumt auf UND SIEHT NACH. Ein Aufraeumen, das nie greift, sieht aus wie
   eines, das greift -- wer eines baut, sieht hinterher nach, ob wirklich
   keiner ueberlebt hat. Liefert die Zahl der Prozesse, die es NICHT
   ueberlebt haben, und wirft, wenn einer stehenbleibt. */
function cleanUp(dirPath) {
  const first = processesUnder(dirPath);
  for (const pid of first) { try { process.kill(pid, 'SIGKILL'); } catch {} }
  // Ein SIGKILL wirkt nicht in derselben Zeile: dem Kern bleibt ein Augenblick.
  // Gewartet wird SYNCHRON -- die Nachschau gehoert vor das Loeschen, und ein
  // await mitten im Aufraeumen liesse die anderen Spuren dazwischenfunken.
  const wait = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  const to = Date.now() + 5000;
  let left = processesUnder(dirPath);
  while (left.length && Date.now() < to) { wait(100); left = processesUnder(dirPath); }
  fs.rmSync(dirPath, { recursive: true, force: true });
  return { cleared: first.length, left: left.length };
}

/* ================= Den Rueckbau anbringen ================= */

function applyRegression(copy, r) {
  const file = path.join(copy, r.file);
  if (!fs.existsSync(file)) throw new Error(`${r.file} gibt es in der Kopie nicht.`);
  /* DER ZWEITE RUECKBAUWEG: eine ENTFERNTE DATEI WIEDER HINLEGEN. Er ersetzt
     keinen Text, sondern legt `datei` ein zweites Mal unter dem Namen `copy`
     ab. Gebraucht wird er fuer die Zeile, die haelt, dass in public/ keine
     Datei zweimal unter zwei Namen liegt -- die laesst sich mit einer
     Textersetzung nicht zurueckbauen, weil es dabei um die Datei selbst
     geht und nicht um ihren Inhalt.
     ER LIEGT ABSICHTLICH IM ZURUECK STATT DANEBEN: so faellt er unter
     dieselbe Kopie, dieselbe Nachschau und dasselbe Aufraeumen wie jeder
     andere -- der Arbeitsbaum wird auch hier NIE angefasst. */
  if (r.copy) {
    const target = path.join(copy, r.copy);
    if (fs.existsSync(target))
      throw new Error(`${r.copy} liegt schon da -- der Rueckbau haette nichts zu tun.`);
    fs.copyFileSync(file, target);
    return;
  }
  const text = fs.readFileSync(file, 'utf8');
  const parts = text.split(r.search);
  /* GENAU EINMAL. Keinmal heisst: der gesuchte Text steht so nicht mehr da --
     der Rueckbau griffe ins Leere und der Lauf bliebe gruen, ohne dass etwas
     zurueckgebaut worden waere. Mehrfach heisst: es ist nicht entschieden,
     welche Stelle gemeint ist. Beides bricht ab und wird gemeldet. */
  if (parts.length !== 2)
    throw new Error(`Der gesuchte Text steht ${parts.length - 1}-mal in ${r.file}, erwartet ist genau einmal.`);
  fs.writeFileSync(file, parts.join(r.replacement));
}

/* ================= Den Prueflauf lesen =================
   Der Pruefstand schreibt Gruppen als "── <Name> ───" und Pruefungen als
   "  ✓ <Name>" bzw. "  ✗ <Name>". Gelesen wird genau das -- und die Schlusszeile
   daneben, denn ein Lauf, der ABREISST, sieht in den roten Punkten allein
   genauso aus wie einer, der sauber durchlaeuft und nichts findet. */
/* DER NAME DER EINEN SELBSTPROBE, die bei JEDEM gefahrenen Rueckbau rot wird.
   Sie steht hier als Konstante und nicht als String mitten im Filter:
   aendert sich ihr Name im Pruefstand, faellt es an einer Stelle auf. */
const SELF_CHECK = 'Jeder Suchtext kommt in seiner Datei genau einmal vor';

function readRun(output) {
  const red = [];
  let group = '(vor der ersten Gruppe)';
  for (const row of output.split('\n')) {
    // ─* und nicht ─+: eine Ueberschrift, die die Zeile fuellt, traegt gar
    // keinen Strich mehr. Der Pruefstand setzt seit dieser Runde mindestens
    // zwei -- der Leser hier gibt sich trotzdem mit keinem zufrieden, denn er
    // liest auch aeltere Ausgaben.
    const g = row.match(/^── (.+?) ─*\s*$/);
    if (g) { group = g[1]; continue; }
    const p = row.match(/^ {2}✗ (.+)$/);
    if (p) red.push({ group, name: p[1] });
  }
  const end = output.match(/^\s+(\d+) von (\d+) Pruefungen bestanden/m);
  const teardown = output.match(/^Prueflauf abgebrochen: (.+)$/m);
  return {
    red,
    /* DIE INHALTLICH ROTEN PUNKTE, OHNE DIE SELBSTPROBE. Die Gruppe „Die
       Gegenproben greifen" prueft, dass JEDER Suchtext in seiner Datei genau
       einmal vorkommt -- und ein gefahrener Rueckbau hat seine Zeile gerade
       ersetzt. Diese eine Pruefung wird deshalb bei JEDEM Rueckbau rot, ganz
       gleich, ob er sonst etwas bewirkt.
       OHNE DIESE UNTERSCHEIDUNG KANN DIE TABELLE EINEN STUMMEN RUECKBAU GAR
       NICHT SEHEN: `red.length` ist nie null, und „0 STUMM" waere eine
       Auskunft ueber nichts. Genau so ist Rueckbau 265 in 0.15.0 durch die
       Message gerutscht -- gefunden wurde er beim Lesen der Tabelle von Hand
       (Stolperstein 213).
       AUSGEBLENDET WIRD DIE EINE ZEILE UND NICHT DIE GANZE GRUPPE. Bis 0.16.0
       fiel die Gruppe als Ganzes weg -- und damit jeder Rueckbau, dessen
       eigene Zusagen ausgerechnet DORT stehen: der Nummernfilter des Werkzeugs
       (Rueckbau 300) machte zwei Pruefungen sauber rot und wurde trotzdem als
       STUMM gemeldet. Ein zu grober Filter macht aus einem Beleg einen Fund
       und schickt den naechsten Leser auf eine Suche nach nichts. */
    byContentRed: red.filter(t => !(t.group === 'Die Gegenproben greifen' &&
      t.name === SELF_CHECK)),
    ranThrough: Boolean(end),
    passedCount: end ? Number(end[1]) : null,
    total: end ? Number(end[2]) : null,
    teardown: teardown ? teardown[1] : null,
    /* DIE LETZTEN ZEILEN DER AUSGABE -- damit ein ABGERISSENER Lauf sagen
       kann, WARUM er abriss. Der Treiber faengt stdout UND stderr ein und warf
       den Grund bis 0.20.1 weg: die Tabelle zeigte die roten Punkte davor und
       dahinter „Rueckgabewert 1", eine Zahl ohne jede Auskunft. Genau daran
       ist bei Rueckbau 568 eine Stunde vergangen (Stolperstein 301).
       ZWEI WEGE ENDEN OHNE SCHLUSSBLOCK, und nur EINER schreibt eine Zeile,
       die dieser Leser kennt: der aeussere Fang druckt „Prueflauf
       abgebrochen: ...". Ein unbehandeltes Ereignis ausserhalb der
       abgewarteten Kette druckt gar nichts davon -- Node legt Message und
       Aufrufweg auf stderr und geht mit 1. Fuer diesen zweiten Weg ist der
       Schwanz die EINZIGE Auskunft.
       ZWANZIG ZEILEN, LEERE WEGGELASSEN: eine unbehandelte Message von Node
       ist rund zwoelf Zeilen lang, und davor sollen noch ein paar Zeilen des
       Laufs stehen, damit man sieht, WO er stand. */
    tail: output.split('\n').map(z => z.trimEnd()).filter(z => z).slice(-20)
  };
}

/* ================= Eine Gegenprobe ================= */

function drive(r, trace, level) {
  return new Promise((done) => {
    const copy = fs.mkdtempSync(path.join(os.tmpdir(), `kriterion-gegenprobe-${r.nr}-`));
    const startedAt = Date.now();
    const endRecord = (result) => {
      let cleanup = { cleared: 0, left: 0 };
      try { cleanup = cleanUp(copy); } catch (e) { result.cleanupError = e.message; }
      done({ ...r, trace, seconds: Math.round((Date.now() - startedAt) / 1000),
               ...cleanup, ...result });
    };
    try {
      makeCopy(copy);
      applyRegression(copy, r);
    } catch (e) { return endRecord({ error: e.message }); }
    const kind = spawn(process.execPath, ['testbench.js'], {
      cwd: copy,
      env: { ...process.env, PORT_OFFSET: String(trace * level) }
    });
    let output = '';
    kind.stdout.on('data', d => { output += d; });
    kind.stderr.on('data', d => { output += d; });
    /* EINE ZEITGRENZE JE RUECKBAU, . Ein Rueckbau kann den Prueflauf
       nicht nur rot machen, sondern HAENGEN lassen -- und ein haengender Lauf
       blockiert seine Spur fuer immer, ohne CPU und ohne Message. Genau das
       tut der Rueckbau, der das Aufraeumen des SMTP-Empfaengers wegnimmt.
       OHNE GRENZE STUENDE DER GANZE TREIBER STILL, und von aussen saehe es aus
       wie ein besonders langer Lauf. Die Grenze ist grosszuegig: ein
       vollstaendiger Lauf dauert rund sechs Minuten, die Grenze liegt beim Doppelten. */
    const LIMIT_MS = 12 * 60 * 1000;
    const clock = setTimeout(() => { try { kind.kill('SIGKILL'); } catch {} }, LIMIT_MS);
    kind.on('exit', (code, signal) => {
      const overdue = Date.now() - startedAt >= LIMIT_MS;
      clearTimeout(clock);
      endRecord({ code, signal, overdue, ...readRun(output) });
    });
  });
}

/* ================= Die Spuren ================= */

async function runAll(list, traces, level) {
  const results = new Array(list.length);
  let nextIndex = 0;
  const trace = async (nr) => {
    for (;;) {
      const i = nextIndex++;
      if (i >= list.length) return;
      const r = list[i];
      console.log(`  [Spur ${nr}] ${r.nr} — ${r.name}`);
      results[i] = await drive(r, nr, level);
      const e = results[i];
      /* EIN ABGERISSENER LAUF IST KEIN STUMMER. Beide zeigen null rote Punkte,
         und sie sagen das Gegenteil: der eine, dass niemand prueft, der andere,
         dass der Lauf gar nicht so weit gekommen ist (Stolperstein 138). Die
         Tabelle unterscheidet sie seit jeher -- diese Zeile jetzt auch. */
      const word = e.error ? 'FEHLER'
        : e.overdue ? 'ZEITGRENZE'
        : !e.ranThrough ? 'ABGERISSEN'
        : e.byContentRed?.length ? `${e.byContentRed.length} rot` : 'STUMM';
      console.log(`  [Spur ${nr}] ${r.nr} fertig nach ${e.seconds}s — ${word}`);
    }
  };
  // Spur 0 gibt es auch: sie faehrt ohne Versatz, wie ein gewoehnlicher Lauf.
  await Promise.all(Array.from({ length: traces }, (_, k) => trace(k)));
  return results;
}

/* ================= Die Tabelle =================
   EINE Tabelle, und zwar in der Form, in der sie im Aenderungsprotokoll steht.
   Was sie NICHT tut: einen stummen Rueckbau als Erfolg zeigen. Er bekommt sein
   eigenes Wort und darunter seinen eigenen Absatz. */
function writeTable(results) {
  console.log('\n| # | Rückbau | Namentlich rot |');
  console.log('|---|---|---|');
  for (const e of results) {
    let right;
    if (e.error) right = `**RÜCKBAU GESCHEITERT** — ${e.error}`;
    else if (e.overdue)
      right = '**LAUF AN DER ZEITGRENZE ABGEBROCHEN** — er hängt, statt rot zu werden';
    else if (!e.ranThrough)
      right = `**LAUF ABGERISSEN** — ${e.teardown || `Code ${e.code}`}` +
               (e.red.length ? ` (davor ${e.red.length} rot)` : '');
    else if (!e.byContentRed?.length) right = '**STUMM — das ist ein FUND**';
    else if (e.red.length <= 3)
      right = e.red.map(p => `„${p.name}"`).join(', ');
    else {
      const groups = [...new Set(e.red.map(p => p.group))];
      right = `${e.red.length} Prüfungen, darunter „${e.red[0].name}"` +
               (groups.length === 1 ? ` (Gruppe „${groups[0]}")`
                                     : ` (${groups.length} Gruppen)`);
    }
    console.log(`| ${e.nr} | ${e.name} | ${right} |`);
  }

  console.log('\n### Im Einzelnen\n');
  for (const e of results) {
    console.log(`**${e.nr} — ${e.name}** (${e.file}, Spur ${e.trace}, ${e.seconds}s)`);
    if (e.error) { console.log(`  RÜCKBAU GESCHEITERT: ${e.error}\n`); continue; }
    if (!e.ranThrough) {
      console.log(`  LAUF ABGERISSEN: ${e.teardown || `Rückgabewert ${e.code}`}`);
      /* UND DARUNTER DIE LETZTEN ZEILEN, DIE ER GEDRUCKT HAT. Ein Abriss ohne
         Grund schickt den Leser auf eine Suche nach nichts: der Grund liegt in
         der eingefangenen Ausgabe, und dorthin kommt niemand mehr, denn die
         Kopie ist beim Aufraeumen weg. Deshalb steht er hier. */
      for (const z of e.tail || []) console.log(`     │ ${z}`);
    } else
      console.log(`  ${e.passedCount} von ${e.total} bestanden, erwartet in „${e.expected}"`);
    if (!e.byContentRed?.length && e.ranThrough)
      console.log('  STUMM — kein einziger roter Punkt. Das ist ein FUND und gehört untersucht.');
    let last = null;
    for (const p of e.red) {
      if (p.group !== last) { console.log(`  ── ${p.group}`); last = p.group; }
      console.log(`     ✗ ${p.name}`);
    }
    if (e.left) console.log(`  ACHTUNG: ${e.left} Prozess(e) haben das Aufräumen überlebt.`);
    if (e.cleanupError) console.log(`  ACHTUNG: Aufräumen gescheitert — ${e.cleanupError}`);
    console.log('');
  }

  const silent = results.filter(e => e.ranThrough && !e.byContentRed?.length);
  const broken = results.filter(e => e.error || !e.ranThrough);
  const corpses = results.filter(e => e.left || e.cleanupError);
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  ${results.length} Gegenproben gefahren.`);
  console.log(`  ${silent.length} STUMM${silent.length ? ': ' + silent.map(e => e.nr).join(', ') : ''}` +
              (silent.length ? '  — jede davon ist ein Fund.' : ''));
  if (broken.length)
    console.log(`  ${broken.length} nicht auswertbar: ${broken.map(e => e.nr).join(', ')}`);
  if (corpses.length)
    console.log(`  ${corpses.length} mit übriggebliebenen Prozessen: ${corpses.map(e => e.nr).join(', ')}`);
  console.log('══════════════════════════════════════════════════════════════\n');
  return (silent.length || broken.length || corpses.length) ? 1 : 0;
}

/* ================= Bedienung =================
   DIE LISTE IST AUCH VON AUSSEN LESBAR, und der Prueflauf liest sie: er zaehlt
   die Rueckbauten nach und sieht bei jedem nach, ob sein Suchtext in seiner
   Datei genau einmal vorkommt. Ein Rueckbau, der ins Leere greift, sieht sonst
   aus wie einer, der nichts bewirkt -- und faellt erst beim vollen Lauf auf,
   der Stunden dauert. Drei davon lagen so fuenf Runden lang unbemerkt.
   NUR BEIM DIREKTEN AUFRUF WIRD GEFAHREN: `require('./counterproof')` liefert
   die Liste und startet keinen einzigen Server. */
/* ---- WELCHER RUECKBAU AUF EIN ARGUMENT PASST ----
   GREIFT EIN ARGUMENT ALS NUMMER, GILT NUR DIE NUMMER. Vorher stand hier ein
   ODER: Nummer gleich ODER Name enthaelt -- und damit fuhr `node counterproof.js
   2 256` neben Rueckbau 256 auch die 83 mit, weil deren Name „SHA-256 statt
   SHA-1" die Zeichenfolge 256 traegt. Der zweite Lauf stand dann stumm in der
   Tabelle, ohne dass ihn jemand angefordert haette.
   EIN NAME, DER WIE EINE NUMMER AUSSIEHT, IST KEINER: wer nach Text sucht,
   schreibt Text. Ein Argument aus lauter Ziffern meint die Nummer und sonst
   nichts -- passt keine, ist das ein Fehler und kein stiller Beifang.
   Die Wortnummern (W2, W5, W6) sind keine reinen Ziffernfolgen und gehen
   deshalb weiter ueber beide Wege. */
const matchesRegression = (r, argument) => {
  const a = String(argument).toLowerCase();
  if (/^\d+$/.test(a)) return r.nr.toLowerCase() === a;
  return r.nr.toLowerCase() === a || r.name.toLowerCase().includes(a);
};

/* readRun GEHT MIT HINAUS, damit der Pruefstand die Regel „was gilt als
   stumm" an gestellten Ausgaben nachsehen kann -- in Millisekunden statt in
   Minuten. Ein Werkzeug, das seinen eigenen Fund nicht melden kann, ist
   schlimmer als keines (Stolperstein 213).
   matchesRegression EBENSO: die Regel, welches Argument welchen Rueckbau meint,
   laesst sich damit an gestellten Faellen nachsehen, statt Minuten lang einen
   Lauf zu fahren, um zu sehen, WAS er gefahren hat. */
/* foreignServer GEHT EBENFALLS MIT HINAUS: die Regel, was als fremder Server
   gilt, laesst sich damit am laufenden Prueflauf selbst nachsehen -- er ist
   ja einer. Ein Waechter, den niemand pruefen kann, ist ein Versprechen. */
module.exports = { REGRESSIONS, readRun, matchesRegression, writeTable,
                   foreignServer, foreignPort, listeningPorts, portSpan };
if (require.main !== module) return;

(async function main() {
  const argumente = process.argv.slice(2);
  let traces = 2;
  if (argumente.length && /^\d+$/.test(argumente[0])) traces = Number(argumente.shift());
  if (traces < 1 || traces > MAX_TRACES) {
    console.error(`Zwischen 1 und ${MAX_TRACES} Nebenspuren. Mehr Spuren heissen mehr ` +
                  `gleichzeitige Server, und der Rechner hat nicht beliebig viele Kerne.`);
    process.exit(1);
  }
  const list = argumente.length
    ? REGRESSIONS.filter(r => argumente.some(a => matchesRegression(r, a)))
    : REGRESSIONS;
  /* Ein Filter, auf den KEIN Rueckbau passt, ist ein Fehler und kein leerer
     Lauf -- sonst meldete ein Tippfehler wortlos Erfolg. Dieselbe Regel wie
     beim Gruppenfilter des Pruefstands. */
  if (!list.length) {
    console.error(`Kein Rueckbau passt auf ${argumente.join(', ')}.`);
    console.error('Vorhanden: ' + REGRESSIONS.map(r => r.nr).join(', '));
    process.exit(1);
  }
  /* ERST NACHSEHEN, DANN FAHREN. Ein fremder Server macht nicht den Lauf
     kaputt, sondern die TABELLE -- und eine falsche Tabelle ist schlimmer als
     gar keine. Abgebrochen wird deshalb, statt zu warnen: wer eine Warnung
     ueberliest, liest hinterher Zahlen, die nichts bedeuten. */
  const foreign = foreignServer();
  const busy = foreignPort(foreign.map(f => f.port));
  if (foreign.length || busy.length) {
    console.error(`\nIm Portfenster des Prueflaufs ist etwas los -- ` +
                  `${foreign.length} fremde(r) Server, ${busy.length} weitere(r) ` +
                  `horchende(r) Port (Stolperstein 139).`);
    for (const f of foreign)
      console.error(`  PID ${f.pid}  ${f.script}${f.port ? `  PORT=${f.port}` : ''}` +
                    `${f.wo ? `  in ${f.wo}` : ''}`);
    /* DER PORTBLICK NENNT KEINE PID, und das ist keine Nachlaessigkeit: die
       Zuordnung Socket -> Prozess steht in /proc/net/tcp nur als Inode und
       verlangte einen Gang durch jedes /proc/<pid>/fd. Wer den Port kennt,
       findet den Prozess mit einem Befehl; wer ihn nicht kennt, sucht. */
    for (const p of busy)
      console.error(`  PORT ${p}  horcht -- sein Befehl verraet ihn nicht ` +
                    `(z. B. node -e). Finden:  ss -lptn 'sport = :${p}'`);
    console.error('\nErst beenden, dann fahren.' +
                  (foreign.length ? '  kill -9 ' + foreign.map(f => f.pid).join(' ') : ''));
    process.exit(1);
  }
  const level = offsetLevel();
  console.log(`\nGegenproben: ${list.length} Rückbauten, ${traces} Nebenspur(en), ` +
              `Versatz ${level} je Spur.`);
  console.log('Jede läuft in einer eigenen Kopie aus `git archive HEAD`; ' +
              'der Arbeitsbaum wird nicht angefasst.\n');
  const results = await runAll(list, traces, level);
  process.exit(writeTable(results));
})().catch(e => {
  console.error('\nGegenproben abgebrochen:', e.message);
  process.exit(1);
});
