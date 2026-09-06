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
    suche: "    const v = await versendeTokenLink(ziel, token);",
    ersatz: "    const v = await versendeTokenLink(ziel, token); if (v.versand !== 'ok') throw new Error('Versand fehlgeschlagen');",
    erwartet: 'Der Mailversand: das Offline-Prinzip in beide Richtungen'
  },
  {
    nr: '02', name: 'Der Link faellt aus der Antwort, wenn der Versand traegt',
    datei: 'server.js',
    suche: "               ohnePasswort: token.ohnePasswort,\n               ...linkAngabe(token.klartext), ...v });",
    ersatz: "               ohnePasswort: token.ohnePasswort,\n               ...(v.versand === 'ok' ? { link: null, linkQuelle: 'browser' } : linkAngabe(token.klartext)), ...v });",
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
    suche: "      uhr = setTimeout(() => fehler(new Error(t(sprache, 'mail.keineAntwort'))), VERSAND_MS);",
    ersatz: "      uhr = setTimeout(() => {}, VERSAND_MS);",
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
    suche: "    username: ziel.username, link: `${OEFFENTLICHE.adresse}/#/einladung/${token.klartext}`,",
    ersatz: "    username: ziel.username, link: `https://${'HOSTKOPF'}/#/einladung/${token.klartext}`,",
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
    datei: 'public/sprachen/de.json',
    suche: "\"server.eigeneMailFehlt\": \"Für dein Konto ist keine E-Mail-Adresse hinterlegt. Trag sie unter Einstellungen › Mein Konto ein — die Testmail geht ausschließlich an die eigene Adresse.\",",
    ersatz: "\"server.eigeneMailFehlt\": \"Für dein Konto ist keine E-Mail-Adresse hinterlegt.\",",
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
    suche: "app.get('/api/mail', nurEigentuemer, (req, res) => res.json(mailKarte(req)));",
    ersatz: "app.get('/api/mail', nurEigentuemer, (req, res) => res.json({ ...mailKarte(req), passwort: mail.loeseAuf(getSetting(mail.SCHLUESSEL, null)).passwort }));",
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
    suche: "  if (!v) throw meldung('mail.anbieterFehlt');",
    ersatz: "  const vv = v;",
    erwartet: 'Der Mailzugang: wer ihn setzen darf'
  },
  /* ---- Die Frist ab dem ersten Oeffnen ---- */
  {
    nr: '22', name: 'Das erste Oeffnen startet die Frist nicht',
    datei: 'server.js',
    suche: "  const minuten = auth.beginneTokenFrist(token.hash);",
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
    datei: 'public/sprachen/de.json',
    suche: "\"server.linkAbgelaufen\": \"Dieser Link gilt nicht mehr. Bitte beim Admin einen neuen anfordern.\",",
    ersatz: "\"server.linkAbgelaufen\": \"Die Frist von 15 Minuten ist abgelaufen.\",",
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
    suche: "        ${stand.minuten ? `<strong>${tH('anmeldung.derLinkGiltNochMinuten', { minuten: stand.minuten })}</strong> ${tH('anmeldung.danachBrauchstDuEinenNeuen')}` : ''}",
    ersatz: "        ${false ? `<strong>${tH('anmeldung.derLinkGiltNochMinuten', { minuten: stand.minuten })}</strong> ${tH('anmeldung.danachBrauchstDuEinenNeuen')}` : ''}",
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
    suche: "      'Der Eigentümer dieser Installation drückt sie in der Karte „Mailversand“.' };\n  if (!OEFFENTLICHE.adresse)",
    ersatz: "      'Der Eigentümer dieser Installation drückt sie in der Karte „Mailversand“.' };\n  if (false)",
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
    suche: "  return setzeBestaetigt.run(tokenHash(roh), `-${ANFRAGE_STUNDEN} hours`).changes > 0;",
    ersatz: "  setzeBestaetigt.run(tokenHash(roh), `-${ANFRAGE_STUNDEN} hours`); return true;",
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
    suche: "  const a = auth.holeAnfrage(req.params.id);\n  if (!a || !a.bestaetigt_am)\n    return res.status(404).json({ error: t(spracheVon(req), 'server.anfrageFehlt')});\n  let angelegt, token;",
    ersatz: "  const a = auth.holeAnfrage(req.params.id);\n  if (!a)\n    return res.status(404).json({ error: t(spracheVon(req), 'server.anfrageFehlt')});\n  let angelegt, token;",
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
    suche: "    token = auth.erzeugeToken(angelegt.id, 'einladung', req.benutzer.id);",
    ersatz: "    token = { klartext: 'x'.repeat(64), zweck: 'einladung', tage: 7, id: angelegt.id, username: angelegt.username };",
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
    suche: "    ${REGISTRIERUNG ? `<p class=\"sub anmeld-trenner\">${tH('anmeldung.nochKeinenZugang')}</p>",
    ersatz: "    ${true ? `<p class=\"sub anmeld-trenner\">${tH('anmeldung.nochKeinenZugang')}</p>",
    erwartet: 'Die Anmeldeseite: das Anfrageformular'
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
    datei: 'public/app.js',
    suche: "sichtbar: (g) => ADMIN && !!g.anfragen,",
    ersatz: "sichtbar: (g) => ADMIN && !!g.anfragen && (g.anfragen.an || g.anfragen.anfragen.length),",
    erwartet: 'Die Karten im Systembereich'
  },
  {
    /* AUS DEM BETRIEB: der Weg zur Selbstanmeldung stand als Verweis in einer
       Fusszeile und wurde uebersehen. Er ist jetzt ein Knopf in derselben
       Groesse wie "Anmelden"; der Rueckbau macht wieder einen Verweis daraus. */
    nr: '68', name: 'Der Weg zur Anfrage wird wieder ein Verweis statt eines Knopfes',
    datei: 'public/app.js',
    suche: "      <button class=\"btn anmeld-zweitweg\" id=\"l-anfrage\">${tH('anmeldung.zugangBeantragen')}</button>",
    ersatz: "      <a href=\"#\" id=\"l-anfrage\">${tH('anmeldung.zugangBeantragen')}</a>",
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
    datei: 'public/sprachen/de.json',
    /* DIE ZEILE STEHT ZWEIMAL -- in der Einladung und in der Ruecksetzung.
       Genommen wird die der EINLADUNG; die naechsten Zeilen machen sie
       eindeutig. */
    suche: "Danach brauchst du einen neuen Link vom Admin.\\n\\nWer diesen Link hat, kommt herein",
    ersatz: "\\nWer diesen Link hat, kommt herein",
    erwartet: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  /* ---- Die Marke der Instanz ---- */
  {
    /* NEU GEZIELT: marke-hell.svg ist entfernt -- sie war Byte fuer Byte
       favicon.svg. Der Rueckbau greift jetzt zur verbliebenen Fassung mit
       Kachel, und die saesse auf dunklem Grund als sichtbares Rechteck. */
    nr: '70', name: 'Die Marke folgt dem Schema nicht mehr',
    datei: 'public/app.js',
    suche: '<path d="M8 6 V26" stroke="var(--marke-grau)"/>',
    ersatz: '<path d="M8 6 V26" stroke="#838c95"/>',
    erwartet: 'Die Marke der Instanz'
  },
  {
    /* DIE MARKE TRAEGT WIEDER DIE KLASSE DER KOMMENTARKNOEPFE -- und saesse
       damit wieder in einem Kaestchen mit Rahmen und rundem Fuellgrund. */
    nr: '71', name: 'Die Marke heisst wieder wie die Kommentarknoepfe',
    datei: 'public/app.js',
    suche: '<svg class="marke" viewBox=',
    ersatz: '<svg class="mark" viewBox=',
    erwartet: 'Die Marke der Instanz'
  },
  {
    nr: '72', name: 'Der Tab bekommt kein Favicon mehr',
    datei: 'public/index.html',
    suche: '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
    ersatz: '',
    erwartet: 'Die Marke der Instanz'
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
    erwartet: 'Die Marke der Instanz'
  },
  {
    /* DIE UEBERSCHRIFT NIMMT IHREN UNTERRAND WIEDER MIT -- bei
       align-items: center saesse sie damit um die halbe Hoehe zu hoch und
       die Marke stuende schief daneben. */
    nr: '80', name: 'Die Ueberschrift in der Zeile traegt wieder einen Unterrand',
    datei: 'public/style.css',
    suche: '.login-card .login-marke h1 { margin: 0; }',
    ersatz: '.login-card .login-marke h1 { margin: 0 0 5px; }',
    erwartet: 'Die Marke der Instanz'
  },
  {
    /* DIE DOPPELTE DATEI KOMMT ZURUECK: favicon.svg noch einmal unter einem
       zweiten Namen. Genau der Zustand, der aufgeraeumt wurde. */
    nr: '81', name: 'Dieselbe Datei liegt wieder unter zwei Namen in public/',
    datei: 'public/favicon.svg',
    kopie: 'public/marke-hell.svg',
    erwartet: 'Die Marke der Instanz'
  },
  /* ---- Der zweite Faktor: die Rechnung, 0.10.0 ----
     DIE DREI KENNWERTE EINZELN. Jedes davon ist fuer sich das bessere
     Verfahren und wird von Google Authenticator stillschweigend falsch
     gelesen -- ein Rueckbau, der stumm bliebe, hiesse: die Instanz bindet sich
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
    suche: "    return res.status(401).json({ error: t(spracheVon(req), 'server.anmeldungFalsch')});",
    ersatz: "    return res.status(401).json({ error: t(spracheVon(req), 'server.anmeldungFalsch'),\n      zweifaktor: auth.zweifaktorAn((auth.holeBenutzerNachNamen(user) || {}).id) });",
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
    suche: "  const bremse = auth.checkThrottle(ip, null);\n  if (bremse.blocked) {\n    return res.status(429).json({\n      error: t(spracheVon(req), 'server.bremseAktiv', { sekunden: bremse.retryInSec })});\n  }\n  if (bremse.delayMs) await new Promise(r => setTimeout(r, bremse.delayMs));\n  const id = auth.verbraucheAnmeldeAusweis(ausweis);",
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
    suche: "  const bremse = auth.checkThrottle(ip, null);\n  if (bremse.blocked) {\n    return res.status(429).json({\n      error: t(spracheVon(req), 'server.bremseAktiv', { sekunden: bremse.retryInSec })});\n  }\n  if (bremse.delayMs) await new Promise(r => setTimeout(r, bremse.delayMs));\n  const id = auth.verbraucheAnmeldeAusweis(ausweis);\n  if (!id) {\n    auth.noteFailure(ip, null);\n    return res.status(401).json({ error: t(spracheVon(req), 'server.anmeldungAbgelaufen')});\n  }",
    ersatz: "  const id = auth.verbraucheAnmeldeAusweis(ausweis);\n  if (!id) {\n    auth.noteFailure(ip, null);\n    return res.status(401).json({ error: t(spracheVon(req), 'server.anmeldungAbgelaufen')});\n  }\n  const bremse = auth.checkThrottle(ip, null);\n  if (bremse.blocked) {\n    return res.status(429).json({\n      error: t(spracheVon(req), 'server.bremseAktiv', { sekunden: bremse.retryInSec })});\n  }\n  if (bremse.delayMs) await new Promise(r => setTimeout(r, bremse.delayMs));",
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
    suche: "  if (zweifaktorAn(id)) throw new Meldung('anmeldung.zweiterFaktorSchonAn');",
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
    suche: "  if (!await eigenesPasswortStimmt(req, res, passwort)) return;\n  if (!auth.pruefeZweitenFaktor(req.benutzer.id, code))\n    return res.status(403).json({ error: t(spracheVon(req), auth.ZWEITER_FAKTOR_ABSAGE)});\n  auth.schalteZweifaktorAus(req.benutzer.id, req.benutzer.id);",
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
       Behauptung: er entfernt beide von Hand aus einer bestehenden Instanz,
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
    suche: "instr(kkl(i.title), :q) > 0",
    ersatz: "0 > 1",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '127', name: 'Und die Beschreibung nicht',
    datei: 'server.js',
    suche: "instr(kkl(i.description), :q) > 0",
    ersatz: "0 > 1",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '128', name: 'Und den Namen der Kategorie nicht',
    datei: 'server.js',
    suche: "instr(kkl(c.name), :q) > 0",
    ersatz: "0 > 1",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '129', name: 'Und die Tags am Eintrag nicht',
    datei: 'server.js',
    suche: "instr(kkl(t.name), :q) > 0",
    ersatz: "0 > 1",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '130', name: 'Und die Tags an den Testtagen nicht',
    datei: 'server.js',
    suche: "instr(kkl(tt.name), :q) > 0",
    ersatz: "0 > 1",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '131', name: 'Und die Adressen der Links nicht',
    datei: 'server.js',
    suche: "instr(kkl(l.url), :q) > 0",
    ersatz: "0 > 1",
    erwartet: 'Die Volltextsuche'
  },
  {
    nr: '132', name: 'Und die Kommentartexte nicht',
    datei: 'server.js',
    suche: "instr(kkl(k.text), :q) > 0",
    ersatz: "0 > 1",
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
    suche: "instr(kkl(i.title), :q) > 0",
    ersatz: "kkl(i.title) LIKE '%' || :q || '%'",
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
    /* MITGEGANGEN MIT 0.19.3 (Stolperstein 201): die Zeile holt seit dieser
       Runde die schmale Fassung aus einer Karte statt je Eintrag zu fragen.
       Derselbe Fund, andere Zeile. */
    nr: '136', name: 'testDays kommt wieder immer mit',
    datei: 'server.js',
    suche: "    if (zeitleiste) it.testDays = testTageJe.get(it.id) || [];",
    ersatz: "    it.testDays = testTageJeEintrag(req.benutzer.id).get(it.id) || [];",
    erwartet: 'testDays haengt an der Zeitleiste'
  },
  {
    /* MITGEGANGEN MIT 0.19.3, wie 136 daneben. */
    nr: '137', name: 'testDays fehlt immer, auch mit eingeschalteter Zeitleiste',
    datei: 'server.js',
    suche: "    if (zeitleiste) it.testDays = testTageJe.get(it.id) || [];",
    ersatz: "    if (false) it.testDays = testTageJe.get(it.id) || [];",
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
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): `zuletztGesehen` ist aus der
       Liste gefallen, und der Suchtext griff damit ins Leere (Stolperstein
       192). Er nimmt weiterhin genau die Ansichten heraus. */
    nr: '143', name: 'Die Ansichten sind kein persoenlicher Schluessel mehr',
    datei: 'server.js',
    suche: "                                'glockeGesehen', 'ansichten', 'streifen', 'thema'];",
    ersatz: "                                'glockeGesehen', 'streifen', 'thema'];",
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
    suche: "const titelKern = (roh) => String(roh || '').toLowerCase().replace(",
    ersatz: "const titelKern = (roh) => String(roh || '').replace(",
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
    nr: '153', name: 'Der Markenstrich traegt wieder Gold',
    datei: 'public/style.css',
    suche: '--marke-strich: var(--accent-text);',
    ersatz: '--marke-strich: var(--gold);',
    erwartet: 'Die Marke der Instanz'
  },
  {
    /* DIESELBE ZEILE IN DER ANDEREN DATEI, und das ist kein Doppel: die
       beiden liegen getrennt, und wer eine anfasst, laesst die andere
       zurueck. Genau dafuer stehen hier zwei Rueckbauten. */
    nr: '154', name: 'Die Fassung mit Kachel traegt wieder Gold',
    datei: 'public/favicon.svg',
    suche: '<path d="M8 16 H24" stroke="#ff7a1a"/>',
    ersatz: '<path d="M8 16 H24" stroke="#ffc531"/>',
    erwartet: 'Die Marke der Instanz'
  },
  {
    nr: '155', name: 'Das viewBox umschliesst wieder die Kachel statt der Farbe',
    datei: 'public/app.js',
    suche: 'viewBox="6.5 4.5 19 23" width=',
    ersatz: 'viewBox="0 0 32 32" width=',
    erwartet: 'Die Marke der Instanz'
  },
  {
    nr: '156', name: 'Die Hoehe der Marke steht wieder in Pixel',
    datei: 'public/style.css',
    suche: '.brand .marke { height: 3.1rem; }',
    ersatz: '.brand .marke { height: 46px; }',
    erwartet: 'Die Marke der Instanz'
  },
  {
    nr: '157', name: 'Das Markup gibt die Marke wieder quadratisch an',
    datei: 'public/app.js',
    suche: 'width="${Math.round(s * 19 / 23)}" height="${s}"',
    ersatz: 'width="${s}" height="${s}"',
    erwartet: 'Die Marke der Instanz'
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
    suche: "        <span class=\"hint wer\" id=\"wer\">${tH('liste.angemeldetAls', { name: NAME })}</span>\n        <button class=\"btn btn-ghost btn-sm\" id=\"out\">${tH('liste.abmelden')}</button>",
    ersatz: "        <button class=\"btn btn-ghost btn-sm\" id=\"out\">${tH('liste.abmelden')}</button>\n        <span class=\"hint wer\" id=\"wer\">${tH('liste.angemeldetAls', { name: NAME })}</span>",
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
    suche: ".thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--streifen), 1fr)); gap: 7px; margin: 10px 0; }",
    ersatz: ".thumbs { display: flex; flex-wrap: wrap; gap: 7px; margin: 10px 0; }",
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* auto-fit statt auto-fill: mit zwoelf Fotos faellt das gar nicht auf, mit
     zweien werden aus zwei Kacheln zwei Kachelplatten. Ein Rueckbau, den man
     an einem vollen Eintrag nicht sieht -- deshalb steht er hier. */
  {
    nr: '168', name: 'Die leeren Spalten klappen zusammen (auto-fit)',
    datei: 'public/style.css',
    suche: "grid-template-columns: repeat(auto-fill, minmax(var(--streifen), 1fr));",
    ersatz: "grid-template-columns: repeat(auto-fit, minmax(var(--streifen), 1fr));",
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* Die Kachel behaelt ihre feste Hoehe, waehrend die Breite rechnet: aus dem
     Quadrat wird ein liegendes Rechteck, und object-fit beschneidet das Foto
     anders. Sieht nicht kaputt aus, ist aber falsch. */
  {
    nr: '169', name: 'Die Kachel behaelt ihre feste Hoehe und wird zum Rechteck',
    datei: 'public/style.css',
    suche: "  width: auto; height: auto; aspect-ratio: 1/1; border-radius: 8px; overflow: hidden;",
    ersatz: "  width: auto; height: 62px; border-radius: 8px; overflow: hidden;",
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
    suche: "  --streifen: 80px;",
    ersatz: "  --streifen: 86px;",
    erwartet: 'Handy und Tablett: die Staffel der Umbruchpunkte'
  },
  /* ---- 0.12.3: der Export sagt seine Groesse an ---- */
  /* DIE SIEBEN HIER ZIELEN AUF DIE RECHNUNG UND AUF DIE KLEMME, nicht auf die
     Anzeige daneben: eine Zahl, die falsch gerechnet wird, faellt am
     Bildschirm nicht auf -- sie sieht genauso aus wie eine richtige. */
  {
    nr: '171', name: 'Der Umschlag faellt weg — ein Export ohne Fotos waere null Bytes gross',
    datei: 'server.js',
    suche: '  return teile.fotos + teile.videos + teile.anhaenge + teile.kommentarbilder + austauschUmschlagBytes(itemId);',
    ersatz: '  return teile.fotos + teile.videos + teile.anhaenge + teile.kommentarbilder;',
    erwartet: 'Die Exportgroesse sagt sich an'
  },
  {
    /* DIE SUMME UEBER ALLE BLOB-SPALTEN IST DIE NAHELIEGENDE UND FALSCHE
       RECHNUNG: photos.thumb geht nie in die Datei. Faellt hier keine
       Pruefung rot, warnt die Instanz irgendwann zu frueh -- und eine Warnung,
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
    suche: "    + (fertig ? ` (${aufgaben - fertig} offen)` : ''));",
    ersatz: "    + (fertig ? ` (${aufgaben} offen)` : ''));",
    erwartet: 'Kommentare in der Oberflaeche'
  },
  {
    /* DAS FELD NIMMT BEIDE FORMEN. Eine Beschriftung, die eine davon
       ausschliesst, ist fuer die Haelfte der Faelle falsch -- und sie sieht
       dabei vollkommen unauffaellig aus. */
    nr: '181', name: 'Das Codefeld fragt wieder nach der App statt nach dem Verfahren',
    datei: 'public/app.js',
    suche: "<label>${tH('dialog.zweiFaktorCode')}</label>\n        <input class=\"input\" id=\"best-code\"",
    ersatz: "<label>Code aus deiner App</label>\n        <input class=\"input\" id=\"best-code\"",
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
    suche: "    'anfrage.frei': 'Anfrage freigeschaltet',",
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
    suche: "      <p>${tH('dialog.nurVoruebergehendAussperrenDann')}</p>",
    ersatz: "",
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
    suche: "  const r5 = r4;\n  zweiteBeschriftung(r5, t('liste.ansichten'));",
    ersatz: "  const r5 = row(t('liste.ansichten'));",
    erwartet: 'Die Filterleiste wird kuerzer — 0.13.0'
  },
  {
    /* MITGENOMMEN MIT 0.17.0 (Stolperstein 201): der Rueckbau zeigte auf die
       Pille „Neu seit ...", und die ist gestrichen. DIE REGEL DAHINTER GILT
       WEITER und war nie ihre eigene -- seit 0.13.0 wird JEDE Pille gedaempft,
       die auf null Treffer fuehrt. Der Rueckbau nimmt sie jetzt am Tag, wo sie
       zuerst stand. Ohne das Nachziehen waere er stumm geworden
       (Stolperstein 192). */
    nr: '208', name: 'Eine Pille mit null Treffern wird nicht mehr gedaempft',
    datei: 'public/app.js',
    suche: "    b.className = 'pill pill-tag' + (gewaehlt ? ' on' : '') + (leerlauf.has(tag.id) ? ' leer' : '');",
    ersatz: "    b.className = 'pill pill-tag' + (gewaehlt ? ' on' : '');",
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
       und die migrierte Instanz verhaelt sich anders als die frische. */
    nr: '223', name: 'Die nachgeruestete Spalte bekommt keinen Fremdschluessel',
    datei: 'db.js',
    suche: "    'ALTER TABLE items ADD COLUMN rejected_von INTEGER REFERENCES users(id) ON DELETE SET NULL']);",
    ersatz: "    'ALTER TABLE items ADD COLUMN rejected_von INTEGER']);",
    erwartet: 'MIGRATION 0.14.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* Die DDL verliert die drei Spalten. Eine FRISCHE Instanz bekaeme sie dann
       ueber den Migrationsblock -- und zu 1.0, wenn er wegfaellt, gar nicht
       mehr. Genau dafuer steht die Gegenlage der frischen Instanz. */
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
       einer Instanz vor 0.14.0 bekaeme damit NIE eine Begruendung:
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
    /* MIT 0.19.0 STEHT DIE NUMMER AUF 12 -- der Ausschnitt geht in die Datei.
       DER RUECKBAU BLEIBT DERSELBE FUND und wird deshalb nicht durch einen
       neuen ersetzt: er nimmt der Datei ihre Nummer und laesst alles andere
       stehen. Nur der Zielwert rueckt mit, sonst griffe die Suche ins Leere
       und der Rueckbau saehe aus wie einer, der nichts bewirkt. */
    /* MITGEGANGEN MIT 0.21.0, nicht geloescht (Stolperstein 201): die
       Formatnummer steht auf 13, der Rueckbau nimmt sie wie immer um eins
       zurueck. Was er belegt, ist unveraendert -- dass die Nummer mit dem
       Format steigt und nicht stehen bleibt. */
    nr: '233', name: 'Die Formatnummer bleibt auf 12',
    datei: 'server.js',
    suche: "const AUSTAUSCH_FORMAT = 13;",
    ersatz: "const AUSTAUSCH_FORMAT = 12;",
    erwartet: 'Die Entscheidung wird mitgeschrieben — 0.14.0'
  },
  {
    /* Der Ablehnende wandert als NUMMER hinaus. Eine Zugangsnummer bedeutet in
       einer fremden Instanz etwas anderes -- der Rundlauf traefe dort einen
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
    /* MITGEGANGEN MIT 0.21.0 (Stolperstein 201): die Regel hat seit dieser
       Runde eine Zeile mehr -- die GEMESSENE Mindestbreite. Der Rueckbau
       ersetzt weiter die ganze Regel durch die alte, geschaetzte Fassung (52
       feste Pixel und text-align statt flex), und er muss weiter rot werden:
       52 px reichen fuer „⌀ 4,2 (9)" nicht, und in Pixeln folgt die Spalte der
       Schriftstufe nicht mehr. */
    suche: "  white-space: nowrap; padding-left: 9px;\n  min-width: calc(4.34rem + 9px);\n  display: flex; align-items: center; justify-content: flex-end;",
    ersatz: "  white-space: nowrap; padding-left: 9px;\n  min-width: 52px; text-align: right;",
    erwartet: 'Die Sternreihe steht auf einer Linie — 0.14.0'
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
    datei: 'public/style.css',
    suche: ".rlist { display: grid; grid-template-columns: 1fr auto auto auto; }",
    ersatz: ".rlist { display: block; }",
    erwartet: 'Die Sternreihe steht auf einer Linie — 0.14.0'
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
    datei: 'public/app.js',
    suche: "    box.className = 'rlist' + (mitSchnitt ? '' : ' ohne-schnitt');",
    ersatz: "",
    erwartet: 'Die Sternreihe steht auf einer Linie — 0.14.0'
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
    datei: 'public/app.js',
    suche: "        row.append(a);",
    ersatz: "        acts.append(a);",
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
    /* Der Name faellt aus der Aussage. Aussagen tragen in dieser Instanz ihren
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
    suche: "    zeile.hidden = !offen;",
    ersatz: "    zeile.hidden = true;",
    erwartet: 'Das Feld steht nur, wo etwas fehlt — 0.15.1'
  },
  {
    /* Die Zeile steht auch dann da, wenn gar nichts bekannt ist -- dann sagt
       sie "Abgelehnt", also dasselbe wie der Schalter darueber. Dieselbe
       Aussage zweimal. */
    nr: '246', name: 'Die Aussage steht auch da, wenn sie nichts sagt',
    datei: 'public/app.js',
    suche: "    marke.hidden = !item.rejected || offen || (!kopf && !grund && !zeigeStift);",
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
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): `neu` steht nicht mehr in der
       Vorgabe -- die Pille ist gestrichen. Der Rueckbau nimmt weiterhin genau
       den Ablehnungsfilter heraus; ohne das Nachziehen griffe er ins Leere
       (Stolperstein 192). */
    nr: '252', name: 'Der neue Filter fehlt in der Vorgabe',
    datei: 'public/app.js',
    suche: "                         abgelehnt: 'all', favorit: false,",
    ersatz: "                         favorit: false,",
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
    suche: "  zweiteBeschriftung(r1, t('liste.ablehnung'));",
    ersatz: "  // zweiteBeschriftung(r1, t('liste.ablehnung'));",
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
       gibt -- an einer Ablehnung aus einer Instanz vor 0.14.0. */
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
       suchen muss, bleibt leer -- das war die Zusage aus 0.14.0.
       SEIT 0.15.1 HAENGT DAS NICHT MEHR AM KLICK, sondern an der abgeleiteten
       Regel: abgelehnt und kein Grund heisst offen. Der Rueckbau nimmt
       deshalb die Haelfte der Regel weg, die den fehlenden Grund traegt --
       dieselbe Sache an ihrer neuen Zeile. */
    nr: '261', name: 'Beim Einschalten bleibt das Feld zu',
    datei: 'public/app.js',
    suche: "    const offen = item.rejected && meins && (!grund || grundOffen);",
    ersatz: "    const offen = item.rejected && meins && grundOffen;",
    erwartet: 'Das Feld steht nur, wo etwas fehlt — 0.15.1'
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
    suche: "    if (!await confirmBox(t('eintrag.begruendungLoeschen'),",
    ersatz: "    if (false && !await confirmBox(t('eintrag.begruendungLoeschen'),",
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
    /* An einer herrenlosen Ablehnung -- aus einer Instanz vor 0.14.0 -- gibt es
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
  /* ---- 0.15.1: `hidden` wirkt wieder ---- */
  {
    /* DIE EINE REGEL FAELLT WEG, und damit ist `hidden` im ganzen Haus wieder
       wirkungslos, sobald eine display-Regel danebensteht. Der Rueckbau nimmt
       das `!important` -- die Regel bleibt stehen und tut nichts mehr, genau
       die Lage von vor 0.15.1. */
    nr: '268', name: 'Die Regel fuer hidden verliert ihre Kraft',
    datei: 'public/style.css',
    suche: "[hidden] { display: none !important; }",
    ersatz: "[hidden] { display: none; }",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Die Regel verschwindet ganz. Damit stuenden die beiden oertlichen
       Flicken auch nicht mehr da -- niemand versteckt mehr irgendetwas. */
    nr: '269', name: 'Die Regel fuer hidden fehlt ganz',
    datei: 'public/style.css',
    suche: "[hidden] { display: none !important; }\n",
    ersatz: "",
    erwartet: 'Die Begruendung kommt zur Ruhe — 0.15.0'
  },
  {
    /* Die Aussage steht auch dann da, wenn das Feld offen ist -- also beides
       zugleich. Genau die Doppelung, die 0.15.0 aufloesen sollte. */
    nr: '270', name: 'Aussage und Feld stehen wieder zugleich da',
    datei: 'public/app.js',
    suche: "    marke.hidden = !item.rejected || offen || (!kopf && !grund && !zeigeStift);",
    ersatz: "    marke.hidden = !item.rejected || (!kopf && !grund && !zeigeStift);",
    erwartet: 'Das Feld steht nur, wo etwas fehlt — 0.15.1'
  },
  {
    /* Das Feld steht auch dem offen, der nicht schreiben darf. Es nimmt dann
       eine Eingabe an, die der Server mit 403 abweist. */
    nr: '271', name: 'Das Feld steht auch dem offen, der nicht schreiben darf',
    datei: 'public/app.js',
    suche: "    const offen = item.rejected && meins && (!grund || grundOffen);",
    ersatz: "    const offen = item.rejected && (!grund || grundOffen);",
    erwartet: 'Das Feld steht nur, wo etwas fehlt — 0.15.1'
  },

  /* ================= 0.16.0 — Abschnitte, Glocke und Auskunft ========== */
  {
    nr: '272', name: 'Der Systembereich zeigt wieder alle Karten auf einmal',
    datei: 'public/app.js',
    suche: "  const karten = SYS_KARTEN.filter(k => k.abschnitt === offen.schluessel && k.sichtbar(geholt));",
    ersatz: "  const karten = SYS_KARTEN.filter(k => k.sichtbar(geholt));",
    erwartet: 'Der Systembereich nach Rolle'
  },
  {
    nr: '273', name: 'Ein Abschnitt ohne sichtbare Karte erscheint trotzdem',
    datei: 'public/app.js',
    suche: "  return SYS_ABSCHNITTE.filter(a =>\n    SYS_KARTEN.some(k => k.abschnitt === a.schluessel && k.sichtbar(geholt)));",
    ersatz: "  return SYS_ABSCHNITTE;",
    erwartet: 'Der Systembereich nach Rolle'
  },
  {
    nr: '274', name: 'Die Adresse wird nicht mehr nachgezogen',
    datei: 'public/app.js',
    suche: "    history.replaceState(null, '', sysAdresse(offen.schluessel));",
    ersatz: "    void 0;",
    erwartet: 'Der Systembereich nach Rolle'
  },
  {
    nr: '275', name: 'Eine Adresse auf einen unsichtbaren Abschnitt zeigt ins Leere',
    datei: 'public/app.js',
    suche: "  const offen = sichtbare.find(a => a.schluessel === gewuenscht) || sichtbare[0];",
    ersatz: "  const offen = SYS_ABSCHNITTE.find(a => a.schluessel === gewuenscht) || sichtbare[0];",
    erwartet: 'Der Systembereich nach Rolle'
  },
  {
    /* DIE REITER VERLIEREN IHRE ADRESSE. Genau die Falle, in die draussen alle
       einmal getreten sind: ohne Adresse laesst sich keine Einstellung
       verlinken und die Zurueck-Taste bricht. */
    nr: '276', name: 'Die Reiter tragen keine eigene Adresse mehr',
    datei: 'public/app.js',
    suche: "      ${sichtbare.map(a => `<a class=\"sys-reiter-k${a === offen ? ' on' : ''}\"",
    ersatz: "      ${sichtbare.map(a => `<button class=\"sys-reiter-k${a === offen ? ' on' : ''}\"",
    erwartet: 'Der Systembereich nach Rolle'
  },
  {
    nr: '277', name: 'Der Import steht wieder gleichrangig neben dem Export',
    datei: 'public/app.js',
    suche: '        <h4 class="sys-unter">Import</h4>',
    ersatz: '        <h3>Import</h3>',
    erwartet: 'Export und Import stehen in einer Karte'
  },
  {
    nr: '278', name: 'Das Ablagefeld des Imports wird wieder gleich laut gezeichnet',
    datei: 'public/app.js',
    suche: '        <label class="drop drop-leise" id="imp-drop">',
    ersatz: '        <label class="drop" id="imp-drop">',
    erwartet: 'Export und Import stehen in einer Karte'
  },
  {
    /* MITGEGANGEN MIT 0.21.0 (Stolperstein 201): der Erklaerknopf bekommt
       seit dieser Runde den Kasten mit, zu dem er gehoert -- es gibt ihn
       zweimal. Was der Rueckbau tut, ist unveraendert. */
    nr: '279', name: 'Die Kopfzahl ist wieder blosser Text',
    datei: 'public/app.js',
    suche: "        b.onclick = () => zeigeRechnung(kasten);",
    ersatz: "        b.onclick = null;",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    /* DER KERN VON PUNKT 4: der Kasten LIEST die Rechnung. Rechnet er nach,
       gibt es zwei Wege zu derselben Zahl -- und sie laufen auseinander. */
    nr: '280', name: 'Der Erklaerkasten rechnet wieder selbst nach',
    datei: 'public/app.js',
    suche: "          <span id=\"rz-ergebnis\">⌀ ${esc(gewZahl(weg.ergebnis))}</span></div>",
    ersatz: "          <span id=\"rz-ergebnis\">⌀ ${esc(gewZahl(Math.round((weg.summe / weg.teiler) * 10) / 10))}</span></div>",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '281', name: 'Der Rechenweg faellt aus der Antwort',
    datei: 'server.js',
    suche: "  it.rechenweg = { ...rechenweg, ergebnis: it.avgRating };",
    ersatz: "  void rechenweg;",
    erwartet: 'Der Rechenweg reist mit'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): der Rechenweg traegt seither
       auch die Vergleichszahl ohne Gewichte, und der Aufruf ist damit vier
       Zeilen lang. Ohne das Nachziehen griffe der Rueckbau ins Leere und waere
       stumm geworden (Stolperstein 192). Er rundet weiterhin genau das, was er
       vorher gerundet hat -- Summe und rohen Quotienten. */
    nr: '282', name: 'Der Rechenweg wird auf zwei Stellen gerundet ausgeliefert',
    datei: 'server.js',
    suche: "    { zeilen, summe: zaehler, teiler: nenner, roh: nenner ? zaehler / nenner : null,",
    ersatz: "    { zeilen, summe: Math.round(zaehler * 100) / 100, teiler: nenner,\n      roh: nenner ? Math.round((zaehler / nenner) * 100) / 100 : null,",
    erwartet: 'Der Rechenweg reist mit'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201), derselbe Grund wie bei 143.
       Der Rueckbau nimmt weiterhin genau den Bezugspunkt der Glocke heraus. */
    nr: '283', name: 'Der Bezugspunkt der Glocke ist kein persoenlicher Schluessel mehr',
    datei: 'server.js',
    suche: "'suchNamen',\n                                'glockeGesehen', 'ansichten', 'streifen', 'thema'];",
    ersatz: "'suchNamen',\n                                'ansichten', 'streifen', 'thema'];",
    erwartet: 'Persoenliche Einstellungen'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): der Knopf heisst nicht mehr
       „Neu von anderen" -- die Glocke meldet seither von allen. Ohne das
       Nachziehen griffe der Rueckbau ins Leere (Stolperstein 192). */
    nr: '284', name: 'Die Glocke steht auch ohne gespeicherten Bezugspunkt',
    datei: 'public/app.js',
    suche: "        ${GLOCKE_GESEHEN ? `<button class=\"icon-btn glocke\" id=\"glocke\" title=\"${esc(t('liste.neuigkeiten'))}\"",
    ersatz: "        ${true ? `<button class=\"icon-btn glocke\" id=\"glocke\" title=\"${esc(t('liste.neuigkeiten'))}\"",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): aus `neuFremd` sind drei
       Angaben geworden, und der Suchtext griff ins Leere (Stolperstein 192).
       DIE ZUSAGE IST DIESELBE: ohne Bezugspunkt fehlt die Angabe GANZ und
       steht nicht auf 0 -- die Oberflaeche unterscheidet „nichts Neues" von
       „es gibt keinen Bezugspunkt". */
    nr: '285', name: 'Die Zahl der Kommentare steht auch ohne Bezugspunkt da',
    datei: 'server.js',
    suche: "    if (bezug) it.neuKommentare = neuKommJe.get(it.id) || 0;",
    ersatz: "    it.neuKommentare = neuKommJe.get(it.id) || 0;",
    erwartet: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    /* NEU MIT 0.17.0: die drei Angaben stehen oder fehlen GEMEINSAM. Eine
       Antwort mit nur einer davon waere eine dritte Lage, die niemand kennt. */
    nr: '314', name: 'Die Verfasser stehen auch ohne Bezugspunkt an jedem Eintrag',
    datei: 'server.js',
    suche: "    if (bezug) it.neuVon = [...(neuVonJe.get(it.id) || [])].map(uid => verfasserAus(karte, uid));",
    ersatz: "    it.neuVon = [...(neuVonJe.get(it.id) || [])].map(uid => verfasserAus(karte, uid));",
    erwartet: 'Die Glocke: was mit der Liste mitreist'
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
    datei: 'server.js',
    suche: "  `SELECT item_id, user_id, COUNT(*) AS n FROM comments\n    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id, user_id`);",
    ersatz: "  `SELECT item_id, user_id, COUNT(*) AS n FROM comments\n    WHERE created_at > ? AND user_id IS NOT NULL GROUP BY item_id, user_id`);",
    erwartet: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    nr: '287', name: 'Bewertungen ohne Zeitpunkt gelten wieder als neu',
    datei: 'server.js',
    suche: "    WHERE gesetzt_am IS NOT NULL AND gesetzt_am > ? AND value > 0",
    ersatz: "    WHERE IFNULL(gesetzt_am, '9999-12-31') > ? AND value > 0",
    erwartet: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    nr: '288', name: 'Der Zeitpunkt zieht beim Ueberschreiben nicht mehr mit',
    datei: 'server.js',
    suche: "              DO UPDATE SET value = excluded.value, gesetzt_am = excluded.gesetzt_am`)",
    ersatz: "              DO UPDATE SET value = excluded.value`)",
    erwartet: 'Die Bewertung traegt ihren Zeitpunkt'
  },
  {
    /* EIN PUNKT FUER EIN EREIGNIS, EINE ZAHL FUER EINEN ZUSTAND. Die beiden
       Zeichen werden nirgends vertauscht. */
    nr: '289', name: 'Der Punkt an der Glocke wird wieder eine Zahl',
    datei: 'public/app.js',
    suche: "  amElement('glocke-punkt', el => { el.hidden = !neu; });",
    ersatz: "  amElement('glocke-punkt', el => { el.textContent = String(neu); el.hidden = !neu; });",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    nr: '290', name: 'Der Zaehler „Offen" zeigt auch die Null',
    datei: 'public/app.js',
    suche: "    el.textContent = offen ? String(offen) : '';\n    el.hidden = !offen;",
    ersatz: "    el.textContent = String(offen);\n    el.hidden = false;",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    /* GEAENDERT MIT 0.17.0 (Stolperstein 201): dieselbe Zeile steht seither
       auch in merkeGesehen() -- dort setzt sie den Bezugspunkt beim ERSTEN
       Verlassen der Uebersicht, hier beim Oeffnen der Tafel. Ein Suchtext, der
       zweimal passt, bricht den Rueckbau ab; die Zeile davor macht ihn wieder
       eindeutig. */
    nr: '291', name: 'Das Oeffnen der Tafel zieht den Bezugspunkt nicht nach',
    datei: 'public/app.js',
    suche: "     weiter da und behauptete etwas, das nicht mehr gilt. */\n  api('PUT', '/api/settings', { glockeGesehen: 1 }).catch(() => {});",
    ersatz: "     weiter da und behauptete etwas, das nicht mehr gilt. */\n  void 0;",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    /* EINE MELDUNG, DIE MAN NICHT ANSPRINGEN KANN, IST EINE MITTEILUNG OHNE
       WEG -- das ist der halbe Gewinn der Tafel. */
    nr: '292', name: 'Die Zeilen der Tafel fuehren nicht mehr zum Eintrag',
    datei: 'public/app.js',
    suche: "    a.href = `#/item/${it.id}`;\n    a.dataset.mid = String(it.id);",
    ersatz: "    a.href = '#/';\n    a.dataset.mid = String(it.id);",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    nr: '293', name: 'Die Kennzahlen nennen die Verfahren nicht mehr',
    datei: 'server.js',
    suche: "    verfahren: { ...verfahren(), passwoerter: 'scrypt' },",
    ersatz: "",
    erwartet: 'Der Versions-Fingerprint'
  },
  {
    nr: '294', name: 'Die Kennzahlen nennen zusaetzlich die Paketversion',
    datei: 'server.js',
    suche: "    verfahren: { ...verfahren(), passwoerter: 'scrypt' },",
    ersatz: "    verfahren: { ...verfahren(), passwoerter: 'scrypt',\n      paket: require('./package.json').dependencies['better-sqlite3-multiple-ciphers'] },",
    erwartet: 'Der Versions-Fingerprint'
  },
  {
    nr: '295', name: 'Das Journal wird behauptet statt abgelesen',
    datei: 'db.js',
    suche: "    journal: String(db.pragma('journal_mode', { simple: true }) || '').toUpperCase()",
    ersatz: "    journal: 'DELETE'",
    erwartet: 'Der Versions-Fingerprint'
  },
  {
    /* DER GEFAEHRLICHSTE KNOPF DER INSTANZ, wenn er ohne Frage loescht. */
    nr: '296', name: 'Der Papierkorb loescht wieder ohne Rueckfrage',
    datei: 'public/app.js',
    suche: "    if (!await confirmBox(t('eintrag.loeschen2', { wort: wort }), t('eintrag.diesesWirdEndgueltigGeloescht', { wort: wort }))) return false;",
    ersatz: "    if (false) return false;",
    erwartet: 'Der Papierkorb im Vollbild'
  },
  {
    nr: '297', name: 'Das Vollbild bekommt seinen Papierkorb nicht',
    datei: 'public/app.js',
    suche: "    ${loeschen ? `<button class=\"lb-btn weg\" title=\"${esc(t('dialog.loeschen'))}\">${ICON_PAPIERKORB}</button>` : ''}",
    ersatz: "    ${false ? `<button class=\"lb-btn weg\" title=\"${esc(t('dialog.loeschen'))}\">${ICON_PAPIERKORB}</button>` : ''}",
    erwartet: 'Der Papierkorb im Vollbild'
  },
  {
    nr: '298', name: 'Der Vorschaustreifen im Vollbild zieht nach dem Loeschen nicht nach',
    datei: 'public/app.js',
    suche: "    baueStreifen();\n    show();",
    ersatz: "    show();",
    erwartet: 'Der Papierkorb im Vollbild'
  },
  {
    /* EIN WERKZEUG, DAS SEINEN EIGENEN FUND NICHT SEHEN KANN, IST SCHLIMMER
       ALS KEINES (Stolperstein 213). */
    nr: '299', name: 'Die Groessenmessung findet gar nichts mehr',
    datei: 'pruefung.js',
    suche: "    return gefunden.sort((a, b) => b.zeilen - a.zeilen || a.name.localeCompare(b.name));",
    ersatz: "    return [];",
    erwartet: 'Die Groesse der Funktionen wird gemessen'
  },
  {
    nr: '300', name: 'Der Nummernfilter der Gegenprobe greift wieder in die Namen',
    datei: 'gegenprobe.js',
    suche: "  if (/^\\d+$/.test(a)) return r.nr.toLowerCase() === a;",
    ersatz: "  if (false) return r.nr.toLowerCase() === a;",
    erwartet: 'Die Gegenproben greifen'
  },

  /* ---- 0.17.0: das Raster der Kriterienliste ---- */
  {
    /* DIE SPALTENZAHL STEHT WIEDER FEST -- genau der Fehler aus dem Betrieb:
       zwei Zellen in drei Spalten, und die Liste zerfaellt. */
    nr: '301', name: 'Die Spaltenzahl folgt dem Zustand nicht mehr',
    datei: 'public/app.js',
    suche: "    box.className = 'rlist' + (mitSchnitt ? '' : ' ohne-schnitt');",
    ersatz: "    box.className = 'rlist';",
    erwartet: 'Das Raster der Kriterienliste zaehlt seine Zellen — 0.17.0'
  },
  {
    /* DIE KLASSE STEHT, DIE REGEL FEHLT. Ein Rueckbau, der nur die Klasse
       naehme, liesse eine Pruefung durch, die bloss das Attribut liest
       (Stolperstein 223) -- dieser hier nimmt den Gegenstand weg. */
    nr: '302', name: 'Die Regel fuer den einen Zugang faellt aus dem Stilblatt',
    datei: 'public/style.css',
    suche: ".rlist.ohne-schnitt { grid-template-columns: 1fr auto auto; }",
    ersatz: "",
    erwartet: 'Das Raster der Kriterienliste zaehlt seine Zellen — 0.17.0'
  },

  /* ---- 0.17.0: zwei Masse vom echten Geraet ---- */
  {
    /* DIE ANMELDESEITE MISST WIEDER IN vh -- der grossen Anzeigeflaeche, die
       man auf dem Telefon gar nicht sieht. */
    nr: '303', name: 'Die Anmeldeseite misst die Hoehe wieder in vh',
    datei: 'public/style.css',
    suche: "body.anmeldung { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; }",
    ersatz: "body.anmeldung { display: flex; flex-direction: column; min-height: 100vh; }",
    erwartet: 'Zwei Masse vom echten Geraet — 0.17.0'
  },
  {
    /* DER RUECKFALL STEHT DAHINTER STATT DAVOR: ein Browser ohne `dvh`
       ueberliest die letzte Zeile und behaelt gar keine Hoehe. */
    nr: '304', name: 'Der Rueckfall 100vh steht hinter dem dvh statt davor',
    datei: 'public/style.css',
    suche: "  min-height: 100vh; min-height: 100dvh;",
    ersatz: "  min-height: 100dvh; min-height: 100vh;",
    erwartet: 'Zwei Masse vom echten Geraet — 0.17.0'
  },
  {
    /* DER UMBRUCH GILT WIEDER NUR UNTERHALB EINES UMBRUCHPUNKTS -- auf dem
       Desktop laeuft die Zeile damit erneut seitlich aus dem Kasten. */
    nr: '305', name: 'Die Anmeldezeile darf wieder breiter werden als ihr Kasten',
    datei: 'public/style.css',
    /* AM GEGENSTAND UND NICHT AN EINEM KOMMENTAR DANEBEN: die Regel kommt
       ausserhalb der Medienabfrage genau einmal vor, und wer sie umformuliert,
       aendert die Sache selbst. Ein Suchtext, der an einem Kommentar haengt,
       greift ins Leere, sobald jemand den Kommentar besser schreibt.
       SEIT 0.17.1 ZIELT ER AUFS RASTER. Die Zusage ist dieselbe geblieben --
       der Rahmen der eigenen Anmeldung reicht bis zum Rand --, sie haengt nur
       nicht mehr am Umbruch, sondern an der nachgebenden Namensspalte. */
    suche: `.mrow.sitz { display: grid; grid-template-columns: minmax(0, 1fr) auto;
  align-items: center; column-gap: 9px; row-gap: 2px; }`,
    ersatz: ".mrow.sitz { display: grid; grid-template-columns: max-content auto; }",
    erwartet: 'Zwei Masse vom echten Geraet — 0.17.0'
  },
  {
    /* DIE VIERTE KACHEL STEHT WIEDER SCHMAL UNTER DREI BREITEN. */
    nr: '306', name: 'Die Karte „Mailversand" verliert ihre Breite wieder',
    datei: 'public/app.js',
    suche: "  return `<div class=\"sys-card breit\">\n        <h3>Mailversand</h3>",
    ersatz: "  return `<div class=\"sys-card\">\n        <h3>Mailversand</h3>",
    erwartet: 'Der Systembereich nach Rolle'
  },
  {
    /* DIE ZWEITE HAELFTE VON 238, seit 0.17.0 ein eigener Rueckbau: die Zeile
       wird wieder ein eigener Kasten, und damit koennen sich die Spalten nicht
       mehr an der breitesten Zelle der ganzen Liste ausrichten -- genau der
       Befund, den 0.14.0 behoben hat. */
    nr: '307', name: 'Aus den Rasterzellen wird wieder eine eigene Zeile',
    datei: 'public/style.css',
    suche: ".rrow { display: contents; }",
    ersatz: ".rrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; }",
    erwartet: 'Die Sternreihe steht auf einer Linie — 0.14.0'
  },

  /* ---- 0.17.0: die Vergleichszahl ohne Gewichte ---- */
  {
    /* DIE VERGLEICHSZAHL REIST NICHT MEHR MIT -- die Formel steht wieder da
       und sagt nicht, wofuer die Gewichte gut sind. */
    nr: '308', name: 'Die Vergleichszahl faellt aus dem Rechenweg',
    datei: 'server.js',
    suche: "      gleichSumme: gleichZaehler, gleichTeiler: zeilen.length,",
    ersatz: "      gleichSumme: 0, gleichTeiler: 0,",
    erwartet: 'Der Rechenweg reist mit'
  },
  {
    /* SIE RECHNET WIEDER MIT GEWICHTEN -- und ist damit dieselbe Rechnung ein
       zweites Mal, also gar kein Vergleich. */
    nr: '309', name: 'Die Vergleichszahl rechnet die Gewichte doch wieder ein',
    datei: 'server.js',
    suche: "    gleichZaehler += z.schnitt;",
    ersatz: "    gleichZaehler += produkt;",
    erwartet: 'Der Rechenweg reist mit'
  },
  {
    /* GERUNDET WIRD ZWEIMAL: je Kriterium und am Ende. */
    nr: '310', name: 'Die Vergleichszahl wird ungerundet ausgeliefert',
    datei: 'server.js',
    suche: "      gleichErgebnis: zeilen.length\n        ? Math.round((gleichZaehler / zeilen.length) * 10) / 10 : null });",
    ersatz: "      gleichErgebnis: zeilen.length ? gleichZaehler / zeilen.length : null });",
    erwartet: 'Der Rechenweg reist mit'
  },
  {
    /* DER KASTEN ZEIGT SIE NICHT MEHR. */
    nr: '311', name: 'Der Erklaerkasten laesst die Vergleichszahl weg',
    datei: 'public/app.js',
    suche: "        ${mitGewicht ? `<div class=\"rz rz-gleich\"><span>${tH('eintrag.ohneGewichteJedesKriteriumGleich')}</span>",
    ersatz: "        ${false ? `<div class=\"rz rz-gleich\"><span>${tH('eintrag.ohneGewichteJedesKriteriumGleich')}</span>",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    /* SIE STEHT AUCH DA, WO ALLE GEWICHTE 1 SIND -- dann steht zweimal
       dieselbe Zahl im Kasten, und das ist eine Auskunft ueber nichts. */
    nr: '312', name: 'Die Vergleichszahl steht auch ohne jede Gewichtung da',
    datei: 'public/app.js',
    suche: "    const gleicheZahl = Number(weg.gleichErgebnis) === Number(weg.ergebnis);",
    ersatz: "    const gleicheZahl = false;",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    /* DER KASTEN RECHNET SIE SELBST NACH statt sie zu lesen -- eine zweite
       Rechenstelle im Browser (Stolperstein 217). */
    nr: '313', name: 'Der Kasten rechnet die Vergleichszahl selbst nach',
    datei: 'public/app.js',
    suche: "          <span id=\"rz-gleich\">⌀ ${esc(gewZahl(weg.gleichErgebnis))}</span></div>` : ''}",
    ersatz: "          <span id=\"rz-gleich\">⌀ ${esc(gewZahl(Math.round((weg.zeilen.reduce((n, z) => n + z.schnitt, 0) / weg.zeilen.length) * 10) / 10))}</span></div>` : ''}",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },

  /* ---- 0.17.0: die Glockentafel sagt, was neu ist ---- */
  {
    /* DIE BEIDEN ZAHLEN WERDEN WIEDER ZU EINER -- genau der Befund: „7 neue
       Beitraege" sagt nicht, WAS auf einen wartet. */
    nr: '315', name: 'Die Tafel zaehlt Kommentare und Bewertungen wieder zusammen',
    datei: 'public/app.js',
    suche: "  return [k ? `${k} ${k === 1 ? t('dialog.kommentar') : t('dialog.kommentare')}` : '',\n          b ? `${b} ${vBewertung(b)}` : ''].filter(Boolean).join(' · ');",
    ersatz: "  const n = k + b;\n  return `${n} ${n === 1 ? 'neuer Beitrag' : 'neue Beiträge'}`;",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    /* DIE NULL STEHT WIEDER DA. „0 Bewertungen" ist eine Auskunft ueber
       nichts -- dieselbe Regel wie am Knopf „Offen". */
    nr: '316', name: 'Die Tafel schreibt auch die Null hin',
    datei: 'public/app.js',
    suche: "b ? `${b} ${vBewertung(b)}` : ''].filter(Boolean).join(' · ');",
    ersatz: "`${b} ${vBewertung(b)}`].join(' · ');",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    /* EINE FESTE ENDUNG MACHT AUS EINEM KOMMENTAR „1 Kommentare". */
    nr: '317', name: 'Die Tafel schreibt die Mehrzahl auch bei einem Kommentar',
    datei: 'public/app.js',
    suche: "  return [k ? `${k} ${k === 1 ? t('dialog.kommentar') : t('dialog.kommentare')}` : '',",
    ersatz: "  return [k ? `${k} Kommentare` : '',",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    /* DIE ZAHLEN KOMMEN AUS EINER ABFRAGE, DIE SIE NICHT MEHR TRENNT. Der
       Server wirft die Auskunft wieder weg, noch bevor sie hinausgeht. */
    nr: '318', name: 'Der Server legt beide Zahlen wieder in eine Kiste',
    datei: 'server.js',
    suche: "      neuBewJe.set(z.item_id, (neuBewJe.get(z.item_id) || 0) + z.n);",
    ersatz: "      neuKommJe.set(z.item_id, (neuKommJe.get(z.item_id) || 0) + z.n);",
    erwartet: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    /* DIE TAFEL ORDNET NACH EINEM DER TEILE STATT NACH DER SUMME -- ein
       Eintrag mit vier neuen Bewertungen stuende unter einem mit einem
       Kommentar. */
    nr: '319', name: 'Die Tafel ordnet nach den Kommentaren statt nach der Summe',
    datei: 'public/app.js',
    suche: "    .slice().sort((a, b) => (neuAn(b) - neuAn(a)) || String(a.title).localeCompare(String(b.title)));",
    ersatz: "    .slice().sort((a, b) => ((b.neuKommentare || 0) - (a.neuKommentare || 0)) || String(a.title).localeCompare(String(b.title)));",
    erwartet: 'Die Glocke in der Kopfzeile'
  },

  /* ---- 0.17.0: die Glocke ersetzt die Pille ---- */
  {
    /* DIE TAFEL SAGT NICHT MEHR, VON WEM. Bei einer Glocke, die auch die
       eigenen Beitraege meldet, ist das die halbe Auskunft. */
    nr: '320', name: 'Die Tafel sagt nicht mehr, von wem etwas kommt',
    datei: 'public/app.js',
    suche: "    a.querySelector('.glocken-von').textContent = neuVonWorte(it);",
    ersatz: "    a.querySelector('.glocken-von').textContent = '';",
    erwartet: 'Die Glocke in der Kopfzeile'
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
    datei: 'server.js',
    suche: "    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id, user_id`);",
    ersatz: "    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id`);",
    erwartet: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    /* DIE AUFZAEHLUNG WIRD EINE LISTE MIT KOMMAS BIS ZUM SCHLUSS -- so
       zaehlt man Dinge auf, nicht Menschen. */
    nr: '322', name: 'Die Namen werden mit Kommas bis zum Schluss aufgezaehlt',
    datei: 'public/app.js',
    suche: "  return 'von ' + (namen.length === 1 ? namen[0]\n    : `${namen.slice(0, -1).join(', ')} und ${namen[namen.length - 1]}`);",
    ersatz: "  return 'von ' + namen.join(', ');",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    /* DIE PILLE „NEU SEIT ..." KOMMT ZURUECK -- zwei Anzeigen fuer dieselbe
       Frage, und die Filterzeile ist wieder eine Pille laenger. */
    nr: '323', name: 'Der Schluessel der gestrichenen Pille bleibt in der Stellung stehen',
    datei: 'public/app.js',
    suche: "  delete f.neu;\n  return f;",
    ersatz: "  return f;",
    erwartet: 'Die gestrichene Pille „Neu seit …" — 0.17.0'
  },
  {
    /* DER BEZUGSPUNKT DER GLOCKE FAEHRT BEI JEDEM VERLASSEN HINAUS statt genau
       einmal -- dann setzt ein Blick in einen Eintrag die Tafel zurueck, ohne
       dass jemand sie gelesen haette. */
    nr: '324', name: 'Der Bezugspunkt faellt bei jedem Verlassen der Uebersicht',
    datei: 'public/app.js',
    suche: "  if (GLOCKE_GESEHEN) return;\n  GLOCKE_GESEHEN = true;",
    ersatz: "  GLOCKE_GESEHEN = true;",
    erwartet: 'Der Bezugspunkt der Glocke in der Oberflaeche'
  },
  {
    /* DIE ZEILE DER TAFEL BRICHT NICHT MEHR UM -- der Titel schrumpft zu
       Punkten, damit die Namen Platz haben. */
    nr: '325', name: 'Die Zeile der Glockentafel bricht nicht mehr um',
    datei: 'public/style.css',
    suche: ".mrow.glocken-zeile { flex-wrap: wrap; row-gap: 2px; }",
    ersatz: "",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    /* DIE ANGABE „VON WEM" BEKOMMT KEINE EIGENE ZEILE MEHR. */
    nr: '326', name: 'Die Angabe „von wem" bekommt keine eigene Zeile',
    datei: 'public/style.css',
    suche: ".glocken-zeile .glocken-von { flex-basis: 100%; font-size: .76rem; color: var(--faint); }",
    ersatz: ".glocken-zeile .glocken-von { font-size: .76rem; color: var(--faint); }",
    erwartet: 'Die Glocke in der Kopfzeile'
  },

  /* ---- 0.17.0: die beiden gestrichenen Erklaertexte ----
     EIN GESTRICHENER TEXT LAESST SICH NUR ZURUECKBAUEN, INDEM MAN IHN WIEDER
     HINSCHREIBT. Beide Rueckbauten setzen genau den Satz zurueck, den die
     Runde aus der Oberflaeche genommen hat -- und die Zusagen, die das
     festhalten, muessen daran rot werden. */
  {
    nr: '327', name: 'Die Kennzahlen begruenden den Vorbehalt wieder an der Oberflaeche',
    datei: 'public/app.js',
    suche: "        <div class=\"kv\"><span class=\"k\">Passwörter</span><span class=\"v\">${esc(stats.verfahren.passwoerter || '—')}</span></div>` : ''}",
    ersatz: "        <div class=\"kv\"><span class=\"k\">Passwörter</span><span class=\"v\">${esc(stats.verfahren.passwoerter || '—')}</span></div>\n        <p class=\"desc\" style=\"margin:10px 0 0\"><strong>Welche Fassung welcher Bibliothek</strong>\n          das rechnet, steht hier <strong>nicht</strong>: das wäre die Angabe, nach der jemand\n          sucht, der eine Lücke ausnutzen will.</p>` : ''}",
    erwartet: 'Der Papierkorb in der Oberflaeche'
  },
  {
    nr: '328', name: 'Die Glockentafel begruendet sich wieder selbst',
    datei: 'public/app.js',
    suche: "    <div class=\"manage-list\" id=\"glocken-liste\"></div>\n    <div class=\"modal-acts\">",
    ersatz: "    <div class=\"manage-list\" id=\"glocken-liste\"></div>\n    <p class=\"hint hint-sm\" style=\"margin:2px 0 0\"><strong>Was die Glocke nicht verspricht:</strong>\n      Sie rechnet beim Aufbau der Übersicht nach, nicht laufend.</p>\n    <div class=\"modal-acts\">",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  /* DIE GEGENRICHTUNG ZU 301. Dort faellt die KLASSE weg und das Raster bleibt
     bei drei Spalten; hier bleibt die Klasse und die ZELLE loest sich von der
     Bedingung -- drei Zellen in zwei Spalten. Ohne diesen Rueckbau belegte
     nichts, dass die Gruppe wirklich Zellen GEGEN Spalten haelt und nicht bloss
     eine Klasse liest (Stolperstein 223). */
  {
    nr: '329', name: 'Die Durchschnittszelle haengt nicht mehr an derselben Bedingung',
    datei: 'public/app.js',
    suche: "      if (mitSchnitt) {",
    ersatz: "      if (true) {",
    erwartet: 'Das Raster der Kriterienliste zaehlt seine Zellen — 0.17.0'
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
    datei: 'public/app.js',
    suche: "${tH('eintrag.erstDerDurchschnittJeKriterium')} <strong>${tH('eintrag.note')}</strong>${tH('eintrag.dannDerDurchschnittDarueber')}",
    ersatz: "${tH('eintrag.erstDerDurchschnittJeKriterium')}${tH('eintrag.dannDerDurchschnittDarueber')}",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  /* DIESELBE FRAGE WIE AN DER KRITERIENLISTE, EINE ANSICHT WEITER: passen die
     Zellen einer Zeile zu den Spalten ihres Rasters? 331 nimmt dem Raster eine
     Spalte, 333 der Zeile eine Zelle -- beide Richtungen, weil eine allein die
     andere nicht belegt. Bis 0.17.0 stand die Vier in der Pruefung getippt und
     nicht im Stilblatt gelesen; kein Rueckbau konnte sie treffen. */
  {
    nr: '331', name: 'Das Raster des Erklaerkastens verliert eine Spalte',
    datei: 'public/style.css',
    suche: ".rechnung { display: grid; grid-template-columns: 1fr auto auto auto; gap: 0 14px; }",
    ersatz: ".rechnung { display: grid; grid-template-columns: 1fr auto auto; gap: 0 14px; }",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  /* DIE REGEL, DIE DIE VERGLEICHSZAHL UNTERORDNET. Ihr Kommentar macht vier
     Zusagen; bis 0.17.0 stand keine davon in einer Pruefung (Stolperstein 199). */
  {
    nr: '332', name: 'Die Vergleichszeile wird dem Ergebnis gleichgestellt',
    datei: 'public/style.css',
    suche: ".rz-gleich > span { color: var(--muted); border-bottom: 0; border-top: 1px solid var(--line-2); }",
    ersatz: ".rz-gleich > span { font-weight: 640; color: #8a8a8a; border-bottom: 0; }",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '333', name: 'Die Vergleichszeile bekommt eine Zelle zu wenig',
    datei: 'public/app.js',
    suche: "          <span></span><span></span>\n          <span id=\"rz-gleich\">",
    ersatz: "          <span></span>\n          <span id=\"rz-gleich\">",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },

  /* ---- 0.17.1: was der Benutzer sieht ---- */
  {
    nr: '334', name: 'Die Marke am Adressfeld behauptet wieder immer „freiwillig"',
    datei: 'public/app.js',
    suche: "        <div class=\"field\"><label>E-Mail-Adresse <span class=\"hint\">${\n          REGISTRIERUNG ? '(erforderlich)' : '(optional)'}</span></label>",
    ersatz: "        <div class=\"field\"><label>E-Mail-Adresse <span class=\"hint\">(optional)</span></label>",
    erwartet: 'Der Zugangstext sagt, was gilt — 0.17.1'
  },
  {
    nr: '335', name: 'Der Absatz richtet sich nicht mehr nach der Selbstanmeldung',
    datei: 'public/app.js',
    suche: "        <p class=\"desc\" style=\"margin:0 0 10px\">${REGISTRIERUNG",
    ersatz: "        <p class=\"desc\" style=\"margin:0 0 10px\">${false",
    erwartet: 'Der Zugangstext sagt, was gilt — 0.17.1'
  },
  {
    nr: '336', name: 'Der Merker der Selbstanmeldung bleibt beim Umlegen stehen',
    datei: 'public/app.js',
    suche: "      REGISTRIERUNG = !!d.an;\n",
    ersatz: "",
    erwartet: 'Der Zugangstext sagt, was gilt — 0.17.1'
  },
  {
    nr: '337', name: 'Der Wirtsbefehl steht wieder bei jedem',
    datei: 'public/app.js',
    suche: "function serverKasten(satz, befehl) {\n  if (!EIGENTUEMER) return '';",
    ersatz: "function serverKasten(satz, befehl) {\n  if (false) return '';",
    erwartet: 'Der Systembereich nach Rolle'
  },
  {
    nr: '338', name: 'Die Laengenvorgabe faellt vom Passwortfeld weg',
    datei: 'public/app.js',
    suche: "        <div class=\"field\"><label>Neues Passwort\n" +
           "          <span class=\"hint\">(mindestens ${MIN_PASSWORT} Zeichen)</span></label>",
    ersatz: "        <div class=\"field\"><label>Neues Passwort</label>",
    erwartet: 'Der Zugangstext sagt, was gilt — 0.17.1'
  },
  {
    nr: '339', name: 'Die Liste bekommt ihre feste Hoehe zurueck',
    datei: 'public/style.css',
    suche: `.manage-list { flex: 0 1 auto; min-height: 0; max-height: 27.95rem;
  overflow-y: auto; margin: 0 -4px; padding: 0 4px; }`,
    ersatz: ".manage-list { max-height: 280px; overflow-y: auto; margin: 0 -4px; padding: 0 4px; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '340', name: 'Die Liste verliert die Zeile, an der es sonst scheitert',
    datei: 'public/style.css',
    suche: ".prot-liste { flex: 0 1 auto; min-height: 0; max-height: 35rem;",
    ersatz: ".prot-liste { flex: 0 1 auto; max-height: 35rem;",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '341', name: 'Die Kachel ist wieder keine Spalte',
    datei: 'public/style.css',
    suche: "padding: 18px 20px 20px;\n  display: flex; flex-direction: column; }",
    ersatz: "padding: 18px 20px 20px; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '342', name: 'Der Knopf in der Kachel wird wieder ueber die volle Breite gezogen',
    datei: 'public/style.css',
    suche: ".sys-card > .btn { align-self: flex-start; }",
    ersatz: "",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    /* MITGEGANGEN IN 0.19.1 (Stolperstein 201): der Abschnitt heisst jetzt
       „Installation", der Rueckbau setzt weiter den aeltesten Namen. */
    nr: '347', name: 'Der fuenfte Abschnitt heisst wieder „Anlage"',
    datei: 'public/app.js',
    suche: "  { schluessel: 'installation', name: 'Installation' }",
    ersatz: "  { schluessel: 'installation', name: 'Anlage' }",
    erwartet: 'Der fuenfte Abschnitt heisst „Installation" — 0.17.1, 0.19.1 und 0.19.2'
  },
  {
    nr: '348', name: 'Die Zeitangaben stehen wieder linksbuendig',
    datei: 'public/style.css',
    suche: ".mrow.sitz .sitz-zeit { grid-column: 1 / -1; justify-self: end; text-align: right; }",
    ersatz: ".mrow.sitz .sitz-zeit { grid-column: 1 / -1; }",
    erwartet: 'Die Zeitangaben stehen untereinander — 0.17.1'
  },
  {
    nr: '349', name: 'Der Name teilt seine Reihe wieder mit den Zeiten',
    datei: 'public/style.css',
    suche: ".mrow.sitz .mname { grid-column: 1; grid-row: 1; }",
    ersatz: ".mrow.sitz .mname { grid-column: 1; grid-row: 1 / span 3; }",
    erwartet: 'Die Zeitangaben stehen untereinander — 0.17.1'
  },
  {
    nr: '350', name: 'Das Vollbild uebernimmt den inneren Abspieler nicht mehr',
    datei: 'public/app.js',
    suche: "      uebergabe = { quelle, stelle: el.currentTime || 0, lief: !el.paused, offen: true };\n" +
           "      el.pause();\n      el.removeAttribute('src');\n      el.load();",
    ersatz: "      el.pause();",
    erwartet: 'Genau ein Abspieler laeuft — 0.17.1'
  },
  {
    nr: '351', name: 'Die uebernommene Stelle wird nicht gesetzt',
    datei: 'public/app.js',
    suche: "        abspieler.currentTime = uebergabe.stelle;\n",
    ersatz: "",
    erwartet: 'Genau ein Abspieler laeuft — 0.17.1'
  },
  {
    nr: '352', name: 'Der Rueckweg beim Schliessen faellt weg',
    datei: 'public/app.js',
    suche: "    halteAn();\n    gibZurueck();\n    lightboxOpen = false;",
    ersatz: "    halteAn();\n    lightboxOpen = false;",
    erwartet: 'Genau ein Abspieler laeuft — 0.17.1'
  },
  {
    nr: '353', name: 'Die geloeschte Quelle wandert wieder zurueck',
    datei: 'public/app.js',
    suche: "    if (uebergabe && bildQuelle(weg, '') === uebergabe.quelle) uebergabe = null;\n",
    ersatz: "",
    erwartet: 'Genau ein Abspieler laeuft — 0.17.1'
  },

  /* ---- 0.17.2: der Deckel, die Reihen, die Klammer und die Glocke ---- */
  {
    nr: '354', name: 'Das Raster der Sitzungszeile bekommt seine dritte Spalte zurueck',
    datei: 'public/style.css',
    suche: ".mrow.sitz { display: grid; grid-template-columns: minmax(0, 1fr) auto;",
    ersatz: ".mrow.sitz { display: grid; grid-template-columns: minmax(0, 1fr) auto auto;",
    erwartet: 'Die Zeitangaben stehen untereinander — 0.17.1'
  },
  {
    nr: '355', name: 'Die Liste fordert wieder so viele Zeilen, wie sie hat',
    datei: 'public/style.css',
    suche: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: 27.95rem;",
    ersatz: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: none;",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '356', name: 'Das Sicherheitsprotokoll fordert wieder alle seine Zeilen',
    datei: 'public/style.css',
    suche: ".prot-liste { flex: 0 1 auto; min-height: 0; max-height: 35rem;\n",
    ersatz: ".prot-liste { flex: 0 1 auto; min-height: 0; max-height: none;\n",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '357', name: 'Auf dem Telefon deckelt nichts mehr am Fenster',
    datei: 'public/style.css',
    suche: "  .manage-list, .prot-liste, .test-scroll, .atext, #ex-teil-liste {\n" +
           "    flex: 0 1 auto; max-height: 62vh; max-height: 62dvh; }",
    ersatz: "",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '363', name: 'Die Begruendung zum fehlenden Adressfeld steht wieder in der Karte',
    datei: 'public/app.js',
    suche: "deines eigenen Kontos</strong>. Antwortet der Mailserver nicht, bricht der",
    ersatz: "deines eigenen Zugangs</strong> — es gibt kein Adressfeld daneben, und zwar mit\n" +
            "            Absicht: ein Knopf, der an eine beliebige Adresse schickt, wäre ein offener\n" +
            "            Mailverteiler hinter einer Anmeldung. Antwortet der Mailserver nicht, bricht der",
    erwartet: 'Die Karte „Mailversand“'
  },
  {
    nr: '364', name: 'Die Klammer steht wieder auch bei einer einzigen Stimme',
    datei: 'public/app.js',
    suche: "          a.textContent = r.count > 1 ? `⌀ ${schnitt} (${r.count})` : `⌀ ${schnitt}`;",
    ersatz: "          a.textContent = `⌀ ${schnitt} (${r.count})`;",
    erwartet: 'Die Klammer steht erst ab zwei Stimmen — 0.17.2'
  },
  {
    nr: '365', name: 'Die Glocke meldet wieder die eigenen Kommentare',
    datei: 'server.js',
    suche: "    WHERE created_at > ? AND user_id IS NOT ? GROUP BY item_id, user_id`);",
    ersatz: "    WHERE created_at > ? AND (user_id IS NOT ? OR 1) GROUP BY item_id, user_id`);",
    erwartet: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    nr: '366', name: 'Die Glocke meldet wieder die eigenen Bewertungen',
    datei: 'server.js',
    suche: "    WHERE gesetzt_am IS NOT NULL AND gesetzt_am > ? AND value > 0 AND user_id IS NOT ?",
    ersatz: "    WHERE gesetzt_am IS NOT NULL AND gesetzt_am > ? AND value > 0 AND (user_id IS NOT ? OR 1)",
    erwartet: 'Die Glocke: was mit der Liste mitreist'
  },
  {
    nr: '367', name: 'Die Tafel verspricht wieder die eigenen Beitraege',
    datei: 'public/app.js',
    suche: "    <p>${tH('liste.neueKommentareUnd')} <strong>${tH('liste.andererBenutzer')}</strong>${tH('liste.seitDuDieseListeZuletzt')}</p>",
    ersatz: "    <p>${tH('liste.neueKommentareUnd')}, <strong>von allen</strong>. Die eigenen stehen mit da.</p>",
    erwartet: 'Die Glocke in der Kopfzeile'
  },
  {
    nr: '368', name: 'Die README erzaehlt wieder, seit wann etwas gilt',
    datei: 'README.md',
    suche: "**Über der Liste steht eine Reihe von Ansichten**",
    ersatz: "**Seit 0.13.0 steht über der Liste eine Reihe von Ansichten**",
    erwartet: 'Der Sprachwaechter'
  },

  /* ---- 0.17.3: die Kachel, der Mailversand, der Erklaerkasten, der Filter ---- */
  {
    nr: '369', name: 'Das Kachelraster streckt seine Kinder wieder nicht',
    datei: 'public/style.css',
    suche: "grid-auto-flow: dense; gap: 18px; margin-top: 6px; }",
    ersatz: "grid-auto-flow: dense; gap: 18px; margin-top: 6px; align-items: start; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '370', name: 'Die Liste fordert wieder zwoelf Zeilen',
    datei: 'public/style.css',
    suche: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: 27.95rem;\n",
    ersatz: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: 33.5rem;\n",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '371', name: 'Das Sicherheitsprotokoll deckelt wieder bei zehn Zeilen',
    datei: 'public/style.css',
    suche: ".prot-liste { flex: 0 1 auto; min-height: 0; max-height: 35rem;",
    ersatz: ".prot-liste { flex: 0 1 auto; min-height: 0; max-height: 23.3rem;",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '372', name: 'Die Karte bekommt ihre Passwortzeile zurueck',
    datei: 'public/app.js',
    suche: "        <div class=\"kv\"><span class=\"k\">Anbieter</span>",
    ersatz: "        <div class=\"kv\"><span class=\"k\">Passwort</span><span class=\"v\">${mailstand.passwortGesetzt\n" +
            "          ? 'gesetzt' : 'nicht gesetzt'}</span></div>\n" +
            "        <div class=\"kv\"><span class=\"k\">Anbieter</span>",
    erwartet: 'Die Karte „Mailversand“'
  },
  {
    nr: '373', name: 'Die Anbieterzeile nennt wieder nur den Namen',
    datei: 'public/app.js',
    suche: "  const teile = [esc(m.anbieterName || m.anbieter)];\n  if (m.server && m.port) {",
    ersatz: "  const teile = [esc(m.anbieterName || m.anbieter)];\n  if (false) {",
    erwartet: 'Die Karte „Mailversand“'
  },
  {
    nr: '374', name: 'Der Knopf heisst wieder „Mailzugang speichern"',
    datei: 'public/app.js',
    suche: "id=\"mail-einrichten\">Mailzugang ${\n            mailstand.eingerichtet ? 'ändern' : 'einrichten'}</button>",
    ersatz: "id=\"mail-einrichten\">Mailzugang speichern</button>",
    erwartet: 'Die Karte „Mailversand“'
  },
  {
    nr: '375', name: 'Der Anbieterhinweis wechselt nicht mehr mit der Auswahl',
    datei: 'public/app.js',
    suche: "      hinweis.textContent = v && v.hinweis ? v.hinweis : '';",
    ersatz: "      hinweis.textContent = mailstand.hinweis || '';",
    erwartet: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '376', name: 'Die gelesene Zeile steht auch bei „Eigener Server"',
    datei: 'public/app.js',
    suche: "      festFeld.hidden = !v || eigen;",
    ersatz: "      festFeld.hidden = !v;",
    erwartet: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '377', name: 'Der Dialog kuerzt die zweite Bestaetigung ab',
    datei: 'public/app.js',
    suche: "      if (!await zweiteBestaetigung('mail', null, 'Mailzugang speichern',\n        'Über diesen Server laufen künftig alle Mails dieser Installation — auch die Links ' +\n        'zum Passwort-Setzen.')) return;\n",
    ersatz: "",
    erwartet: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '378', name: 'Die Anbieterliste kommt wieder ohne Hinweise und feste Werte',
    datei: 'server.js',
    suche: "    anbieterListe: mail.fuerDieAuswahl().map(a =>\n      ({ ...a, hinweis: a.hinweis ? t(spracheVon(req), a.hinweis) : '' })),",
    ersatz: "    anbieterListe: mail.ANBIETER.map(a => ({ schluessel: a.schluessel, name: a.name })),",
    erwartet: 'Der Mailversand: das echte SMTP-Gespraech'
  },
  {
    nr: '379', name: 'Der Hinweis rueckt nicht mehr an seine Sache heran',
    datei: 'public/style.css',
    suche: ".mail-hinweis { margin: -7px 0 0; }",
    ersatz: ".mail-hinweis { margin: 0; }",
    erwartet: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '380', name: 'Die Felder im Dialog tragen wieder ihren zweiten Abstand',
    datei: 'public/style.css',
    suche: ".mail-dialog .field { margin-bottom: 0; }",
    ersatz: ".mail-dialog .field { margin-bottom: 14px; }",
    erwartet: 'Der Dialog „Mailzugang einrichten“ — 0.17.3'
  },
  {
    nr: '381', name: 'Die Zeilen der Rechnung ruecken wieder auseinander',
    datei: 'public/style.css',
    suche: ".rz > span { padding: 3px 0;",
    ersatz: ".rz > span { padding: 6px 0;",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '382', name: 'Der Erklaerkasten wird wieder schmal',
    datei: 'public/style.css',
    suche: ".rechnung-modal { max-width: 620px; }",
    ersatz: ".rechnung-modal { max-width: 540px; }",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '383', name: 'Die ausgeschriebene Rechnung steht wieder unter der Tabelle',
    datei: 'public/app.js',
    suche: "      <p><strong>${tH('eintrag.kriterienOhneSterneZaehlenNicht')}</strong> ${tH('eintrag.gerundetWirdNurDasEndergebnis')}",
    ersatz: "      <p><strong>${tH('eintrag.kriterienOhneSterneZaehlenNicht')}</strong> ${tH('eintrag.gerundetWirdNurDasEndergebnis')} ${esc(gewZahl(weg.summe))} ÷ ${esc(gewZahl(weg.teiler))}",
    erwartet: 'Die Rechnung hinter der Kopfzahl'
  },
  {
    nr: '384', name: 'Der Filterruecksetzer steht immer da',
    datei: 'public/app.js',
    suche: "  const filterGesetzt = filterZahl();\n  if (filterGesetzt) {",
    ersatz: "  const filterGesetzt = filterZahl();\n  if (true) {",
    erwartet: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },
  {
    nr: '385', name: 'Der Filterruecksetzer nennt seine Zahl nicht mehr',
    datei: 'public/app.js',
    suche: "    bZurueck.textContent = t('liste.filterZuruecksetzen', { filterGesetzt: filterGesetzt });",
    ersatz: "    bZurueck.textContent = 'Filter zurücksetzen';",
    erwartet: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },
  {
    nr: '386', name: 'Der Filterruecksetzer raeumt die Sortierung mit',
    datei: 'public/app.js',
    suche: "      state.filters = filterNormal({ sort: state.filters.sort });",
    ersatz: "      state.filters = filterNormal({});",
    erwartet: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },
  {
    nr: '387', name: 'Der Filterruecksetzer raeumt die Suche mit',
    datei: 'public/app.js',
    suche: "      redraw();\n    };\n    rechts5.appendChild(bZurueck);",
    ersatz: "      const qf = document.getElementById('q'); if (qf) qf.value = '';\n" +
            "      redraw();\n    };\n    rechts5.appendChild(bZurueck);",
    erwartet: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },
  {
    nr: '388', name: 'Der Filterruecksetzer steht nicht mehr am rechten Rand',
    datei: 'public/style.css',
    suche: ".frow-rechts-weit { margin-left: auto; }",
    ersatz: ".frow-rechts-weit { margin-right: 0; }",
    erwartet: 'Der Ruecksetzer fuer die Filterleiste — 0.17.3'
  },

  /* ---- 0.17.4: fordern und nutzen ---- */
  {
    nr: '389', name: 'Die leere Bedienliste wird wieder eine Zeile hoch',
    datei: 'public/style.css',
    suche: ".manage-list > .hint { min-height: 5.59rem; padding: 0 9px; }",
    ersatz: ".manage-list > .hint { min-height: 2.795rem; padding: 0 9px; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '392', name: 'Das leere Protokoll wird wieder eine Zeile hoch',
    datei: 'public/style.css',
    suche: ".prot-liste > .hint { min-height: 4.666rem; padding: 0 2px; grid-column: 1 / -1; }",
    ersatz: ".prot-liste > .hint { min-height: 2.333rem; padding: 0 2px; grid-column: 1 / -1; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '393', name: 'Die leere Meldung traegt die Vorgabemarge wieder mit',
    datei: 'public/style.css',
    suche: "  display: flex; align-items: center; margin: 0; }\n.manage-list > .hint {",
    ersatz: "  display: flex; align-items: center; }\n.manage-list > .hint {",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '390', name: 'Die Liste im Fenster bekommt den Deckel wieder',
    datei: 'public/style.css',
    suche: ".modal .manage-list { max-height: none; }",
    ersatz: ".modal .manage-list { max-height: 27.95rem; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '391', name: 'Die Liste haengt wieder am Schluesselwort',
    datei: 'public/style.css',
    suche: ".manage-list { flex: 0 1 auto; min-height: 0; max-height: 27.95rem;",
    ersatz: ".manage-list { flex: 1 1 27.95rem; min-height: 0; max-height: max-content;",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },

  /* ---- 0.17.5: die Hoehe ohne Schluesselwort, das Raster der Liste ---- */
  {
    nr: '394', name: 'Die Spalten gehoeren wieder der Zeile',
    datei: 'public/style.css',
    suche: "  display: grid; grid-template-columns: 128px 1fr 1fr auto auto; align-content: start; }",
    ersatz: "  grid-template-columns: 128px 1fr 1fr auto auto; align-content: start; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '395', name: 'Die Zeile wird wieder ein eigener Kasten',
    datei: 'public/style.css',
    suche: ".prot-zeile { display: contents; }",
    ersatz: ".prot-zeile { display: block; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '396', name: 'Die Felder richten sich wieder an der Schriftlinie aus',
    datei: 'public/style.css',
    suche: "  font-size: .86rem; align-self: end; }",
    ersatz: "  font-size: .86rem; align-self: baseline; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },
  {
    nr: '397', name: 'Auf dem Telefon bleibt die Liste ein Raster',
    datei: 'public/style.css',
    suche: "  .prot-liste { display: block; }\n  .prot-zeile { display: grid;",
    ersatz: "  .prot-zeile { display: grid;",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },

  /* ---- 0.18.0: die Suche wird nachvollziehbar ---- */
  {
    nr: '398', name: 'Der Trefferkontext faellt ganz aus der Antwort',
    datei: 'server.js',
    suche: "    if (begriff) it.fundstelle = fundstellen.get(it.id);",
    ersatz: "    if (false) it.fundstelle = fundstellen.get(it.id);",
    erwartet: 'Der Trefferkontext an der Antwort'
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
    datei: 'server.js',
    suche: "    if (begriff) it.fundstelle = fundstellen.get(it.id);",
    ersatz: "    it.fundstelle = fundstellen.get(it.id) || null;",
    erwartet: 'Der Trefferkontext an der Antwort'
  },
  {
    nr: '400', name: 'Der Ausschnitt wird vorn geschnitten statt an der Fundstelle',
    datei: 'server.js',
    suche: "const AUSSCHNITT_VORLAUF = 4;",
    ersatz: "const AUSSCHNITT_VORLAUF = 1000;",
    erwartet: 'Der Trefferkontext an der Antwort'
  },
  {
    /* UND DIE GEGENRICHTUNG: der Ausschnitt beginnt GENAU bei der Fundstelle
       und verschweigt damit, dass sie mitten in einem Wort steht -- der
       Befund, wegen dem es diese Runde ueberhaupt gibt. */
    nr: '401', name: 'Der Ausschnitt beginnt genau bei der Fundstelle',
    datei: 'server.js',
    suche: "const AUSSCHNITT_VORLAUF = 4;",
    ersatz: "const AUSSCHNITT_VORLAUF = 0;",
    erwartet: 'Der Trefferkontext an der Antwort'
  },
  {
    nr: '402', name: 'Der Ausschnitt wird nicht mehr eingeebnet',
    datei: 'server.js',
    suche: "const einZeilig = (s) => String(s ?? '').replace(/\\s+/g, ' ').trim();",
    ersatz: "const einZeilig = (s) => String(s ?? '');",
    erwartet: 'Der Trefferkontext an der Antwort'
  },
  {
    nr: '403', name: 'Der Ausschnitt wird gar nicht mehr gekuerzt',
    datei: 'server.js',
    suche: "const AUSSCHNITT_LAENGE = 56;",
    ersatz: "const AUSSCHNITT_LAENGE = 100000;",
    erwartet: 'Der Trefferkontext an der Antwort'
  },
  {
    nr: '404', name: 'Die Zahl der weiteren Stellen ist immer null',
    datei: 'server.js',
    suche: "    weitere: getroffen.length - 1",
    ersatz: "    weitere: 0",
    erwartet: 'Der Trefferkontext an der Antwort'
  },
  {
    /* DIE FESTE FOLGE KEHRT SICH UM: genannt wird der Titel zuerst -- also
       genau das, was die Kachel ohnehin zeigt. */
    nr: '405', name: 'Die Folge der Quellen kehrt sich um',
    datei: 'server.js',
    suche: "  const getroffen = VOLLTEXT_QUELLEN.filter(q => r['f_' + q.schluessel] != null);",
    ersatz: "  const getroffen = [...VOLLTEXT_QUELLEN].reverse().filter(q => r['f_' + q.schluessel] != null);",
    erwartet: 'Der Trefferkontext an der Antwort'
  },
  {
    /* WELCHER KOMMENTAR GENANNT WIRD, IST BESTIMMT. Der Rueckbau dreht die
       Ordnung um statt sie zu entfernen: ohne ORDER BY entschiede die
       Abfrageplanung, und der Rueckbau koennte zufaellig dasselbe liefern --
       ein Rueckbau, der nur manchmal greift, ist keiner. */
    nr: '406', name: 'Der genannte Kommentar ist der juengste statt der aeltesten',
    datei: 'server.js',
    suche: "             ORDER BY k.id LIMIT 1)",
    ersatz: "             ORDER BY k.id DESC LIMIT 1)",
    erwartet: 'Der Trefferkontext an der Antwort'
  },
  {
    /* ER NIMMT DAS FELD WEG UND NICHT NUR DIE VORLAGE. Der erste Anlauf setzte
       `fundZeile` auf leer und liess `f` stehen -- die Kachel suchte danach
       eine `.fund-text`, die es nicht mehr gab, und riss beim Zeichnen ab
       statt rot zu werden. EIN RUECKBAU MUSS EINEN LAUFFAEHIGEN STAND
       ERGEBEN; einer, der die Oberflaeche zerreisst, sagt nichts darueber,
       welche Pruefung ihn bemerkt haette (Stolperstein 138). */
    nr: '407', name: 'Die Kachel baut keine Trefferzeile mehr',
    datei: 'public/app.js',
    suche: "  const f = it.fundstelle;",
    ersatz: "  const f = null;",
    erwartet: 'Die Trefferzeile an der Kachel'
  },
  {
    /* SIE WANDERT UND VERSCHWINDET NICHT. Ein Rueckbau, der sie ganz wegnimmt,
       waere derselbe wie 407 -- und er liesse den Lauf ABREISSEN statt rot zu
       werden, weil die Prueflagen danach an einer fehlenden Zeile griffen
       (Stolperstein 138). So bleibt die Zeile da und steht nur an der
       falschen Stelle. */
    nr: '408', name: 'Die Trefferzeile rutscht ueber den Titel',
    datei: 'public/app.js',
    suche: "      <h3 class=\"card-title\">${esc(it.title)}</h3>\n      ${fundZeile}",
    ersatz: "      ${fundZeile}\n      <h3 class=\"card-title\">${esc(it.title)}</h3>",
    erwartet: 'Die Trefferzeile an der Kachel'
  },
  {
    nr: '409', name: 'Die Zahl der weiteren Stellen faellt aus der Zeile',
    datei: 'public/app.js',
    suche: "class=\"fund-text\"></span>${f.weitere ? `<span class=\"fund-mehr\">+${f.weitere}</span>` : ''}",
    ersatz: "class=\"fund-text\"></span>${''}",
    erwartet: 'Die Trefferzeile an der Kachel'
  },
  {
    nr: '410', name: 'Der Ueberfahrtext nennt die weiteren Stellen nicht mehr',
    datei: 'public/app.js',
    suche: "  f.weitere === 1 ? t('liste.undWeitereStelle')\n  : f.weitere > 1 ? t('liste.undWeitereStellen', { weitere: f.weitere }) : '');",
    ersatz: "  '');",
    erwartet: 'Die Trefferzeile an der Kachel'
  },
  {
    nr: '411', name: 'Eine unbekannte Quelle faellt aus der Zeile',
    datei: 'public/app.js',
    suche: "const fundWort = (quelle) => (FUND_WORTE[quelle] || (() => t('liste.fundstelle')))();",
    ersatz: "const fundWort = (quelle) => (FUND_WORTE[quelle] || (() => ''))();",
    erwartet: 'Die Trefferzeile an der Kachel'
  },
  {
    /* DER AUSSCHNITT KOMMT WIEDER UEBER innerHTML IN DIE SEITE -- genau der
       Weg, den 0.5.4 zugemacht hat, auf dem Umweg ueber die Kachel. Er kann
       aus einem Kommentar stammen. */
    nr: '412', name: 'Der Ausschnitt kommt ueber innerHTML in die Kachel',
    datei: 'public/app.js',
    suche: "  if (f) a.querySelector('.fund-text').replaceChildren(hebeHervor(f.text, begriff));",
    ersatz: "  if (f) a.querySelector('.fund-text').innerHTML = f.text;",
    erwartet: 'Die Trefferzeile an der Kachel'
  },
  {
    /* UND DIE MARKE SELBST. Sie ist die einzige Stelle, an der aus einem
       Stueck ein ELEMENT wird -- wenn irgendwo Markup entstehen kann, dann
       hier. */
    nr: '413', name: 'Die Marke wird ueber innerHTML gefuellt',
    datei: 'public/app.js',
    suche: "  const m = document.createElement('mark');\n  m.textContent = text;",
    ersatz: "  const m = document.createElement('mark');\n  m.innerHTML = text;",
    erwartet: 'Links im Kommentartext'
  },
  {
    nr: '414', name: 'Der Titel der Kachel wird nicht mehr hervorgehoben',
    datei: 'public/app.js',
    suche: "  hebeImKnoten(a.querySelector('.card-title'), it.title, begriff);",
    ersatz: "  hebeImKnoten(a.querySelector('.card-title'), it.title, '');",
    erwartet: 'Die Hervorhebung in der Uebersicht'
  },
  {
    nr: '415', name: 'Nur die erste Fundstelle wird hervorgehoben',
    datei: 'public/app.js',
    suche: "    von = i + b.length;\n  }",
    ersatz: "    von = i + b.length;\n    break;\n  }",
    erwartet: 'Die Hervorhebung in der Uebersicht'
  },
  {
    /* DER BEGRIFF ALS MUSTER STATT ALS TEXT -- derselbe Fehler wie LIKE gegen
       instr() im Server, nur im Browser: ein eingegebener Punkt faende jedes
       Zeichen. */
    nr: '416', name: 'Der Begriff wird als Muster gelesen',
    datei: 'public/app.js',
    suche: "    const i = klein.indexOf(kleinB, von);",
    ersatz: "    const i = klein.slice(von).search(new RegExp(kleinB, 'i')) < 0 ? -1 : von + klein.slice(von).search(new RegExp(kleinB, 'i'));",
    erwartet: 'Die Hervorhebung in der Uebersicht'
  },
  {
    nr: '417', name: 'Die Hervorhebung erreicht den Kommentartext nicht mehr',
    datei: 'public/app.js',
    suche: "        .appendChild(baueKommentarknoten(zerlegeKommentartext(c.text, begriff)));",
    ersatz: "        .appendChild(baueKommentarknoten(zerlegeKommentartext(c.text)));",
    erwartet: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '418', name: 'Eine Adresse mit Begriff zerfaellt in mehrere Anker',
    datei: 'public/app.js',
    suche: "      let j = i;\n      while (j < liste.length && String(liste[j].ziel ?? '') === String(s.ziel))\n        a.appendChild(stueckKnoten(liste[j++]));\n      i = j - 1;",
    ersatz: "      a.appendChild(stueckKnoten(s));",
    erwartet: 'Links im Kommentartext'
  },
  {
    nr: '419', name: 'In der Linkliste wird der Anzeigename hervorgehoben',
    datei: 'public/app.js',
    suche: "          namensBox.appendChild(s);",
    ersatz: "          hebeImKnoten(s, a.name, begriff);\n          namensBox.appendChild(s);",
    erwartet: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '420', name: 'Die Adresse in der Linkliste wird nicht mehr hervorgehoben',
    datei: 'public/app.js',
    suche: "      hebeImKnoten(row.querySelector('.dom'), oben, begriff);",
    ersatz: "      hebeImKnoten(row.querySelector('.dom'), oben, '');",
    erwartet: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '421', name: 'Das Adressmuster nimmt keinen Begriff mehr an',
    datei: 'public/app.js',
    suche: "const EINTRAG_MUSTER = /^#\\/item\\/(\\d+)(?:\\?(.*))?$/;",
    ersatz: "const EINTRAG_MUSTER = /^#\\/item\\/(\\d+)$/;",
    erwartet: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '422', name: 'Das Adressmuster ist hinten nicht mehr verankert',
    datei: 'public/app.js',
    suche: "const EINTRAG_MUSTER = /^#\\/item\\/(\\d+)(?:\\?(.*))?$/;",
    ersatz: "const EINTRAG_MUSTER = /^#\\/item\\/(\\d+)/;",
    erwartet: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '423', name: 'Die Detailansicht zieht die Adresse nicht mehr nach',
    datei: 'public/app.js',
    suche: "  if (location.hash !== gewollt &&\n      typeof history !== 'undefined' && typeof history.replaceState === 'function')\n    history.replaceState(null, '', gewollt);",
    ersatz: "  void gewollt;",
    erwartet: 'Der Suchbegriff in der Adresse'
  },
  {
    /* DIE ADRESSE WIRD UEBER location.hash GESETZT STATT UEBER replaceState.
       Sie steht dann zwar richtig da, aber jeder Aufruf legt einen Eintrag im
       Verlauf an und loest ein zweites Zeichnen aus. */
    nr: '424', name: 'Die Adresse wird ueber location.hash gesetzt',
    datei: 'public/app.js',
    suche: "    history.replaceState(null, '', gewollt);",
    ersatz: "    location.hash = gewollt;",
    erwartet: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '425', name: 'Die Kachel haengt den Begriff nicht an ihre Adresse',
    datei: 'public/app.js',
    suche: "  a.href = eintragAdresse(it.id, begriff);",
    ersatz: "  a.href = eintragAdresse(it.id, '');",
    erwartet: 'Die Trefferzeile an der Kachel'
  },
  {
    nr: '426', name: 'Der Begriff aus der Adresse wird nicht entschluesselt',
    datei: 'public/app.js',
    suche: "  try { return new URLSearchParams(frage || '').get('q') || ''; }",
    ersatz: "  try { return (String(frage || '').match(/(?:^|&)q=([^&]*)/) || [])[1] || ''; }",
    erwartet: 'Der Suchbegriff in der Adresse'
  },
  {
    nr: '427', name: 'Die Marke bringt wieder Schwarz auf Gelb mit',
    datei: 'public/style.css',
    suche: "mark {\n  background: var(--accent-dim); color: var(--accent-text-hi);",
    ersatz: "mark {\n  border-radius: 3px;",
    erwartet: 'Die Trefferzeile im Stylesheet'
  },
  {
    nr: '428', name: 'Die Trefferzeile darf wieder umbrechen',
    datei: 'public/style.css',
    suche: "  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n}\n/* Die Zahl in der Schreibmaschinenschrift",
    ersatz: "}\n/* Die Zahl in der Schreibmaschinenschrift",
    erwartet: 'Die Trefferzeile im Stylesheet'
  },
  {
    nr: '429', name: 'Die Quelle gibt in der Trefferzeile nach statt der Ausschnitt',
    datei: 'public/style.css',
    suche: ".card-fund .fund-quelle { flex-shrink: 0; color: var(--faint); font-weight: 600; }",
    ersatz: ".card-fund .fund-quelle { color: var(--faint); font-weight: 600; }",
    erwartet: 'Die Trefferzeile im Stylesheet'
  },

  /* ---- 0.18.1: der Deckel der Sitzungsliste, die leere Meldung ---- */
  {
    nr: '430', name: 'Die Sitzungsliste deckelt wieder nach der fremden Zeile',
    datei: 'public/style.css',
    suche: "#msitzungen { max-height: 55.23rem; }",
    ersatz: "#msitzungen { max-height: 27.95rem; }",
    erwartet: 'So hoch wie der Inhalt — 0.17.5'
  },

  /* ---- 0.19.0: die Bildablage ----
     ELF RUECKBAUTEN AN DER ABLAGE, und sie zielen auf verschiedene Haelften
     derselben Zusage: dass ein PNG umgewandelt wird, dass es NUR ein PNG ist,
     dass die Spalte mitgeht, dass der Rueckfall greift und dass das Bild dabei
     unversehrt bleibt. Ein Rueckbau, der alles zugleich abschaltet, sagte nur,
     dass irgendetwas fehlt.

     SECHS DAVON ZEIGEN SEIT 0.19.3 AUF bilder.js -- 431 bis 435 und 458. Die
     Umwandlung steht nicht mehr in server.js, weil der Bestandslauf sie aus
     einem eigenen Thread braucht; die Rueckbauten sind MITGEGANGEN und nicht
     geloescht worden (Stolperstein 201). Es ist derselbe Fund an derselben
     Zeile, nur in einer anderen Datei -- und ein Rueckbau, der ins Leere
     greift, ist stumm und verfaelscht die Tabelle (Stolperstein 192). */
  {
    nr: '431', name: 'Ein ankommendes PNG wird gar nicht mehr umgewandelt',
    datei: 'bilder.js',
    suche: "  if (!istPNG(buf)) return { data: buf, mime: gemeldeterTyp, umgewandelt: false };",
    ersatz: "  if (true) return { data: buf, mime: gemeldeterTyp, umgewandelt: false };",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Die Spalte bleibt auf image/png stehen, obwohl WebP daruntersteht. Die
       AUSLIEFERUNG faellt darauf nicht herein -- sie liest die ersten Bytes --,
       aber der naechste Export traegt die Luege weiter. Genau deshalb muss die
       Pruefung an der SPALTE haengen und nicht nur am Kopf der Antwort. */
    nr: '432', name: 'Der mime_type wird nicht mitgezogen',
    datei: 'bilder.js',
    suche: "      return { data: webp, mime: 'image/webp', umgewandelt: true };",
    ersatz: "      return { data: webp, mime: gemeldeterTyp, umgewandelt: true };",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
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
    datei: 'bilder.js',
    suche: "    if (webp.length < buf.length)",
    ersatz: "    if (true)",
    erwartet: '(erwartet STUMM — achtzehn Laborversuche ohne Gegenbeispiel, und am echten Bestand 679 von 679 umgestellt; nur die Kantengrenze laesst PNG liegen, und die ist Rueckbau 458)'
  },
  {
    /* DER ANDERE RUECKFALL, und der laesst sich zeigen: WebP kann hoechstens
       16383 px je Kante. Faengt niemand den Fehler ab, scheitert der ganze
       Upload mit 500, statt das PNG unveraendert abzulegen. */
    nr: '458', name: 'Ein Bild, das WebP nicht fassen kann, reisst den Upload ab',
    datei: 'bilder.js',
    suche: "    console.error('[Kriterion] PNG blieb PNG:', e.message);",
    ersatz: "    throw e;",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Die Erkennung geht ueber den GEMELDETEN TYP statt ueber die ersten acht
       Bytes. Sie sieht damit richtig aus und glaubt dem Browser aufs Wort --
       ein JPEG, das sich image/png nennt, ginge durch den Kodierer. */
    nr: '434', name: 'Die Erkennung glaubt dem gemeldeten Typ',
    datei: 'bilder.js',
    suche: "  Buffer.isBuffer(buf) && buf.length >= 8 && buf.subarray(0, 8).equals(PNG_MAGIE);",
    ersatz: "  Buffer.isBuffer(buf) && buf.length >= 8;",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Der verlustbehaftete Bitstrom statt VP8L. Die Datei ist danach kleiner
       und heisst weiterhin WebP -- nur franst sie an harten Kanten aus. Ohne
       eine Pruefung, die PIXEL vergleicht, bliebe dieser Rueckbau stumm. */
    nr: '435', name: 'Der verlustbehaftete Kodierer statt nearLossless',
    datei: 'bilder.js',
    suche: "const WEBP_ABLAGE = { nearLossless: true, quality: 60, effort: 4 };",
    ersatz: "const WEBP_ABLAGE = { quality: 60, effort: 4 };",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    nr: '436', name: 'Der Schalter wirkt nicht mehr -- es wird immer umgewandelt',
    datei: 'server.js',
    suche: "const bilderUmwandeln = () => getSetting('bilderUmwandeln', true) !== false;",
    ersatz: "const bilderUmwandeln = () => true;",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Der Schalter faellt aus der Eigentuemerliste und wird damit gewoehnliche
       Adminsache. Er bestimmt, wie die ganze Instanz ablegt.
       DER SUCHTEXT IST MIT 0.20.0 MITGEGANGEN, nicht geloescht (Stolperstein
       201): die Liste traegt seit dieser Runde vier Schluessel statt einem.
       Der Rueckbau nimmt weiterhin GENAU `bilderUmwandeln` heraus und laesst
       die drei neuen stehen -- sonst pruefte er nicht mehr dasselbe. */
    nr: '437', name: 'Der Schalter der Bildablage ist nur noch Adminsache',
    datei: 'server.js',
    suche: "const EIGENTUEMER_SCHLUESSEL = ['bilderUmwandeln',\n" +
           "                                'sicherungAufraeumen', 'sicherungBehalten', 'sicherungTage'];",
    ersatz: "const EIGENTUEMER_SCHLUESSEL = ['sicherungAufraeumen', 'sicherungBehalten', 'sicherungTage'];",
    erwartet: 'Die Bildablage: die Rechte'
  },
  {
    nr: '438', name: 'Die Umstellung laeuft ohne zweite Bestaetigung',
    datei: 'server.js',
    suche: "app.post('/api/bilder/umstellen', nurEigentuemer, zweiteBestaetigungNoetig('bilder'), (req, res) => {",
    ersatz: "app.post('/api/bilder/umstellen', nurEigentuemer, (req, res) => {",
    erwartet: 'Die Bildablage: die Rechte'
  },
  {
    nr: '439', name: 'Zweimal druecken startet zwei Laeufe',
    datei: 'server.js',
    suche: "  if (bestandsStaende.umstellung && bestandsStaende.umstellung.laeuft)\n    return res.status(409).json({ error: t(spracheVon(req), 'server.umstellungLaeuft')});",
    ersatz: "  if (false)\n    return res.status(409).json({ error: t(spracheVon(req), 'server.umstellungLaeuft')});",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Der Fortschritt verschwindet aus den Kennzahlen. Die Karte kann danach
       nicht mehr sagen, wie weit der Lauf ist -- und die Pruefung, die auf
       sein Ende wartet, laeuft in ihre Grenze. */
    nr: '440', name: 'Der Fortschritt steht nicht mehr in den Kennzahlen',
    datei: 'server.js',
    suche: "const bestandsStand = (aufgabe) =>\n  bestandsStaende[aufgabe] && { ...bestandsStaende[aufgabe] };",
    ersatz: "const bestandsStand = () => null;",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* Die Aufteilung nach Format faellt aus der Antwort. Die alten Zahlen
       bleiben stehen -- der Rueckbau nimmt genau den Nachbarn weg, nicht die
       Zeile daneben. */
    nr: '441', name: 'Die Aufstellung nach Format faellt aus den Kennzahlen',
    datei: 'server.js',
    suche: "    bildFormate,\n",
    ersatz: "",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },

  /* ---- 0.19.0: der engere Ausschnitt ---- */
  {
    nr: '442', name: 'Der Zoomwert wird gar nicht erst gespeichert',
    datei: 'server.js',
    suche: "  db.prepare('UPDATE photos SET focus_x = ?, focus_y = ?, zoom = ? WHERE id = ?')\n    .run(x, y, z, req.params.id);",
    ersatz: "  db.prepare('UPDATE photos SET focus_x = ?, focus_y = ? WHERE id = ?')\n    .run(x, y, req.params.id);",
    erwartet: 'Fokuspunkt der Vorschau'
  },
  {
    /* DIE SPANNE FAELLT WEG. Ein Wert unter 100 zeigte am Rand Leere statt
       Bild, einer ueber 400 die Ableitung statt des Motivs. */
    nr: '443', name: 'Der Zoomwert wird nicht mehr beschnitten',
    datei: 'server.js',
    suche: "  zoom:    { min: ZOOM_MIN, max: ZOOM_MAX, vorgabe: ZOOM_MIN, stellen: 0 }",
    ersatz: "  zoom:    { min: 0, max: 100000, vorgabe: ZOOM_MIN, stellen: 0 }",
    erwartet: 'Fokuspunkt der Vorschau'
  },
  {
    /* EIN FEHLENDES FELD SETZT ZURUECK. Das Ziehen im Bild schickt kein
       `zoom` mit -- der eingestellte Ausschnitt waere bei jedem Zug weg
       (Stolperstein 271). */
    nr: '444', name: 'Ein Ruf ohne Zoomwert setzt ihn auf die Vorgabe zurueck',
    datei: 'server.js',
    suche: "  let z = p.zoom;\n  if (req.body.zoom !== undefined) {",
    ersatz: "  let z = ANZEIGEWERTE.zoom.vorgabe;\n  if (req.body.zoom !== undefined) {",
    erwartet: 'Fokuspunkt der Vorschau'
  },
  {
    nr: '445', name: 'Der Ausschnitt geht nicht in die Exportdatei',
    datei: 'server.js',
    suche: "        const z = { mime_type: p.mime_type, focus_x: p.focus_x, focus_y: p.focus_y,\n                    zoom: p.zoom, art: p.art };",
    ersatz: "        const z = { mime_type: p.mime_type, focus_x: p.focus_x, focus_y: p.focus_y,\n                    art: p.art };",
    erwartet: 'Fokuspunkt der Vorschau'
  },
  {
    nr: '446', name: 'Der eingespielte Ausschnitt wird verworfen',
    datei: 'server.js',
    suche: "                    fx: zuschnitt.fx, fy: zuschnitt.fy, zoom: zuschnitt.zoom,",
    ersatz: "                    fx: 50, fy: 50, zoom: ANZEIGEWERTE.zoom.vorgabe,",
    erwartet: 'Fokuspunkt der Vorschau'
  },
  {
    /* DIE MIGRATION LEGT DIE SPALTE NICHT AN. Eine Instanz aus 0.18.1 stuerbe
       danach an jedem Zugriff auf photos.zoom -- die DDL greift nur bei einer
       fehlenden TABELLE, nie bei einer fehlenden SPALTE (Stolperstein 13). */
    nr: '447', name: 'Der achte Migrationsblock ruestet die Spalte nicht nach',
    datei: 'db.js',
    suche: "  db.exec('ALTER TABLE photos ADD COLUMN zoom REAL NOT NULL DEFAULT 100');",
    ersatz: "  // db.exec('ALTER TABLE photos ADD COLUMN zoom REAL NOT NULL DEFAULT 100');",
    erwartet: 'MIGRATION 0.19.0 — ENTFAELLT MIT 1.0'
  },
  {
    /* MITGEGANGEN MIT 0.21.0, wie 233 -- derselbe Suchtext, eine andere
       Zusage: dort die Entscheidung, hier die Exportdatei. */
    nr: '448', name: 'Die Formatnummer bleibt bei 12, obwohl der Ausschnitt mitgeht',
    datei: 'server.js',
    suche: "const AUSTAUSCH_FORMAT = 13;",
    ersatz: "const AUSTAUSCH_FORMAT = 12;",
    erwartet: 'Die Exportdatei'
  },

  /* ---- 0.19.0: die Bildablage in der Oberflaeche ---- */
  {
    /* DER ZOOM GEHT NICHT MEHR AN DIE KACHEL. ausschnitt() rechnet ihn
       weiterhin richtig aus und schreibt ihn nirgends hin -- genau der Fall,
       den eine Pruefung an der Funktion allein nicht faende. */
    nr: '449', name: 'Der Zoom kommt nicht in den Zuschnitt (bis 0.19.4: nicht an die Kachel)',
    datei: 'bestandslauf.js',
    /* MITGEGANGEN MIT 0.19.5, NICHT GELOESCHT (Stolperstein 201). Bis dahin
       nahm dieser Rueckbau der Kachel ihr `--zoom` -- die Eigenschaft gibt es
       nicht mehr, der Zuschnitt steckt im Bild. Die Zusage ist dieselbe
       geblieben: der eingestellte Zoom muss ankommen. */
    suche: "                               zoom: Number(z.zoom) });",
    ersatz: "                               zoom: 100 });",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    nr: '450', name: 'Der Schieber fuer die Weite steht nicht mehr im Betrachter',
    datei: 'public/app.js',
    suche: "      ${ausschnittModus && !zeigtVideo ? `<div class=\"vzoom\">",
    ersatz: "      ${false ? `<div class=\"vzoom\">",
    erwartet: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* JEDER ZWISCHENSCHRITT SCHICKT. Ein Zug ueber die ganze Leiter erzeugte
       damit sechzig Anfragen statt einer. */
    nr: '451', name: 'Der Schieber schickt bei jedem Zwischenschritt',
    datei: 'public/app.js',
    suche: "        zeichne();\n      };\n      schieber.onchange = speichere;",
    ersatz: "        zeichne();\n        speichere();\n      };\n      schieber.onchange = speichere;",
    erwartet: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* DER GRIFF AN DEN SCHIEBER SETZT DEN FOKUSPUNKT. Er laege danach dort,
       wo der Schieber steht -- unten in der Mitte, bei jedem Zug aufs Neue. */
    nr: '452', name: 'Der Griff an den Schieber setzt den Fokuspunkt mit',
    datei: 'public/app.js',
    suche: "      if (e.target.closest('.vfocus, .vnav, .vzoom')) return;",
    ersatz: "      if (e.target.closest('.vfocus, .vnav')) return;",
    erwartet: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* DAS STILBLATT RECHNET DEN ZOOM NICHT MEHR EIN. Der Wert steht an der
       Kachel, und niemand liest ihn (Stolperstein 272, andersherum). */
    nr: '453', name: 'Die Ueberfahrregel haengt wieder am Ausschnitt',
    datei: 'public/style.css',
    /* MITGEGANGEN MIT 0.19.5 (Stolperstein 201). Bis dahin nahm er dem
       Stilblatt sein `scale(var(--zoom))`; das gibt es nicht mehr. Er holt es
       jetzt ZURUECK -- und damit den zweiten Zuschnitt, den diese Runde
       gerade weggeraeumt hat. */
    suche: ".card:hover .card-img img { transform: scale(1.02); }",
    ersatz: ".card:hover .card-img img { transform: scale(calc(var(--zoom, 1) * 1.02)); }",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    nr: '454', name: 'Der Knopf der Umstellung fragt kein Passwort',
    datei: 'public/app.js',
    suche: "      const ok = await zweiteBestaetigung('bilder', null, 'PNG in WebP umwandeln',",
    ersatz: "      const ok = true || await zweiteBestaetigung('bilder', null, 'PNG in WebP umwandeln',",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DER DIALOG BESCHOENIGT. Er nennt die Zahl nicht mehr und sagt nicht
       mehr, dass die PNG-Fassung danach weg ist. */
    nr: '455', name: 'Der Dialog sagt nicht mehr, was verloren geht',
    datei: 'public/app.js',
    suche: "        `${fmtBytes(Math.round(png.bytes * 0.37))}). Rückgängig nur mit einer vorher angelegten ` +\n        `Sicherung. Dauer: Minuten bis Stunden.`);",
    ersatz: "        `${fmtBytes(Math.round(png.bytes * 0.37))}). Dauer: Minuten bis Stunden.`);",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    nr: '456', name: 'Der Knopf bleibt bedienbar, obwohl kein PNG mehr dasteht',
    datei: 'public/app.js',
    suche: "id=\"bild-um\"${png && !laeuft ? '' : ' disabled'}",
    ersatz: "id=\"bild-um\"${''}",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DER SCHALTER STEHT AUCH DEM ADMIN OHNE EIGENTUEMERROLLE. Der Server
       weist ihn ab -- ein Haken, der zuverlaessig 403 erzeugt, sieht aus wie
       ein Fehler. */
    nr: '457', name: 'Schalter und Knopf stehen jedem Admin',
    datei: 'public/app.js',
    suche: "        ${EIGENTUEMER ? `\n        <label class=\"ex-files\" style=\"margin-top:10px\"><input type=\"checkbox\" id=\"bild-umwandeln\">",
    ersatz: "        ${true ? `\n        <label class=\"ex-files\" style=\"margin-top:10px\"><input type=\"checkbox\" id=\"bild-umwandeln\">",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },

  /* ---- 0.19.1: was 0.19.0 falsch gemacht hat ----
     ZEHN PUNKTE, ZEHN RUECKBAUTEN UND MEHR. Nummer 459 steht weiter oben bei
     der Tafel der alten Adressen, wo sie hingehoert. */
  {
    /* MITGEGANGEN IN 0.19.2 (Stolperstein 201): die Formatabfrage traegt jetzt
       `WHERE art IS ?` statt `art != 'video'`. Derselbe Fund, ein anderer
       Wortlaut.
       DIE AUFTEILUNG NACH FORMAT LIEST WIEDER DEN INHALT -- die Abfrage aus
       0.19.0. Sie ist nicht falsch, sie ist teuer: gemessen 919 ms gegen
       0,2 ms, und sie laeuft bei JEDEM Zeichnen des Systembereichs. Rot wird
       die Zeile, die eine falsch benannte Datei zaehlt: ein JPEG unter dem
       Namen `image/png` faellt am Inhalt in die JPEG-Spalte und an der Spalte
       in die PNG-Spalte. */
    nr: '460', name: 'Die Aufteilung nach Format liest wieder den Inhalt',
    datei: 'server.js',
    suche: "    SELECT mime_type AS m, length(data) AS o FROM photos WHERE art IS ?)",
    ersatz: "    SELECT CASE\n" +
            "             WHEN hex(substr(data,1,8)) = '89504E470D0A1A0A' THEN 'image/png'\n" +
            "             WHEN hex(substr(data,1,3)) = 'FFD8FF'           THEN 'image/jpeg'\n" +
            "             WHEN hex(substr(data,1,4)) = '52494646'\n" +
            "              AND hex(substr(data,9,4)) = '57454250'         THEN 'image/webp'\n" +
            "             WHEN hex(substr(data,1,3)) = '474946'           THEN 'image/gif'\n" +
            "             ELSE 'anderes'\n" +
            "           END AS m, length(data) AS o FROM photos WHERE art IS ?)",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* MITGEGANGEN IN 0.19.2 (Stolperstein 201): die art-Aufteilung ist keine
       materialisierte Zwischenabfrage mehr, sondern eine Schleife ueber die
       Arten -- weil `MATERIALIZED` die zweite Ursache gar nicht traf.
       DIE ARTEN KOMMEN WIEDER AUS DEM SATZ STATT AUS DEM INDEX. Das Ergebnis
       bleibt richtig und kostet 1338,8 statt 0,1 ms; genau deshalb haengt die
       Zusage am TEXT und nicht am Ergebnis. */
    nr: '461', name: 'Die Arten kommen wieder aus dem Satz statt aus dem Index',
    datei: 'server.js',
    suche: "const qBildArten = db.prepare('SELECT art AS a FROM photos GROUP BY 1');",
    ersatz: "const qBildArten = db.prepare('SELECT DISTINCT art || \\'\\' AS a FROM photos');",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER KNOPF SUCHT AM GEMELDETEN TYP statt an den ersten acht Bytes. Er
       naehme damit genau die Zeilen mit, die die Karte sich verzaehlt -- und
       schriebe eine Datei um, die gar kein PNG ist. */
    nr: '462', name: 'Der Knopf sucht am gemeldeten Typ statt am Inhalt',
    datei: 'server.js',
    suche: "  \"SELECT id FROM photos WHERE art != 'video' AND hex(substr(data,1,8)) = ?\");",
    ersatz: "  \"SELECT id FROM photos WHERE art != 'video' AND mime_type = 'image/png' AND ? IS NOT NULL\");",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DIE ZUORDNUNG KENNT KEIN FORMAT MEHR -- jede Zeile faellt in 'anderes'.
       Ohne diese Tafel stuende die Aufstellung leer da. */
    nr: '463', name: 'Die Zuordnung von mime_type auf den Schluessel ist leer',
    datei: 'server.js',
    suche: "const BILD_MIME_FORMAT = {\n  'image/png': 'png', 'image/jpeg': 'jpeg', 'image/webp': 'webp', 'image/gif': 'gif'\n};",
    ersatz: "const BILD_MIME_FORMAT = {};",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER VERGROESSERUNGSPUNKT FAELLT WEG. scale() verankert wieder in der
       Mitte, und von der eingestellten Bildecke ist nichts zu sehen --
       gemessen 0,0 % in allen vier Richtungen. */
    nr: '464', name: 'Der Zuschnitt verliert eine seiner beiden Achsen (bis 0.19.4: transform-origin)',
    datei: 'bilder.js',
    /* MITGEGANGEN MIT 0.19.5 (Stolperstein 201). `transform-origin` gibt es
       nicht mehr; die Zusage dahinter -- der Ausschnitt folgt dem Fokuspunkt
       in BEIDEN Richtungen -- gilt unveraendert und steht jetzt hier. */
    suche: "  return { links: fx / 100 * (breite - eng), oben: fy / 100 * (hoehe - eng), kante: eng };",
    ersatz: "  return { links: fx / 100 * (breite - eng), oben: 0, kante: eng };",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* ER STEHT DA, ABER AUF DER MITTE. Der gefaehrlichere der beiden: die
       Eigenschaft ist vorhanden, und wer nur nachsieht, OB sie dasteht, findet
       nichts. */
    nr: '465', name: 'Der Zuschnitt sitzt in der Mitte statt auf dem Fokuspunkt',
    datei: 'bilder.js',
    /* MITGEGANGEN MIT 0.19.5 (Stolperstein 201): dieselbe Zusage an der
       Stelle, an der der Ausschnitt jetzt entsteht. */
    suche: "  const k = zuschnittKiste(breite, hoehe, zuschnitt.fx, zuschnitt.fy, zuschnitt.zoom);",
    ersatz: "  const k = zuschnittKiste(breite, hoehe, 50, 50, zuschnitt.zoom);",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER DIALOG LIEGT WIEDER UNTER DEM VOLLBILD -- der Zustand bis 0.19.1.
       Die Rueckfrage steht dann erst da, wenn man das Vollbild schliesst. */
    nr: '466', name: 'Der Dialog liegt wieder unter dem Vollbild',
    datei: 'public/style.css',
    suche: "  --z-dialog: 100;",
    ersatz: "  --z-dialog: 60;",
    erwartet: 'Die Stapelordnung — 0.19.1'
  },
  {
    /* DIE REGEL TRAEGT WIEDER IHRE EIGENE ZAHL. Sie sieht damit richtig aus
       und steht doch neben der Ordnung statt in ihr -- die naechste Kachel
       macht sie wieder auf. */
    nr: '467', name: 'Der Dialog traegt seine Stufe wieder als Zahl in der Regel',
    datei: 'public/style.css',
    suche: "padding: 22px; z-index: var(--z-dialog);",
    ersatz: "padding: 22px; z-index: 60;",
    erwartet: 'Die Stapelordnung — 0.19.1'
  },
  {
    /* DIE MELDUNG RUTSCHT UNTER DEN DIALOG. Sie ist die Quittung des Dialogs
       und waere von ihm verdeckt. */
    nr: '468', name: 'Die Meldung liegt unter dem Dialog',
    datei: 'public/style.css',
    suche: "  --z-meldung: 120;",
    ersatz: "  --z-meldung: 95;",
    erwartet: 'Die Stapelordnung — 0.19.1'
  },
  {
    /* DIE BILDABLAGE HAT KEINE EIGENE KARTE MEHR. Sie steht damit nirgends --
       weder als Karte noch als Abschnitt in „Kennzahlen". */
    nr: '469', name: 'Die Bildablage faellt aus der Kartentabelle',
    datei: 'public/app.js',
    suche: "  { schluessel: 'bildablage',   abschnitt: 'datenbank', sichtbar: () => ADMIN,\n" +
           "    markup: karteBildablage,   ausruesten: ruesteBildablageAus },\n",
    ersatz: "",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* SIE STEHT IM FALSCHEN ABSCHNITT. Der Knopf, der die Datenbank umschreibt,
       laege dann bei den Kategorien und Tags. */
    nr: '470', name: 'Die Karte „Bildablage" steht im Abschnitt „Bestand"',
    datei: 'public/app.js',
    suche: "  { schluessel: 'bildablage',   abschnitt: 'datenbank',",
    ersatz: "  { schluessel: 'bildablage',   abschnitt: 'bestand',",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* SIE VERSCHWINDET, WENN KEIN BILD DALIEGT. Der Systembereich wechselte
       damit unter der Hand die Gestalt -- achtzehn Karten auf einer frischen
       Installation, neunzehn auf einer benutzten. */
    nr: '471', name: 'Die Karte „Bildablage" verschwindet ohne Bilder',
    datei: 'public/app.js',
    suche: "  { schluessel: 'bildablage',   abschnitt: 'datenbank', sichtbar: () => ADMIN,",
    ersatz: "  { schluessel: 'bildablage',   abschnitt: 'datenbank',\n" +
            "    sichtbar: (g) => ADMIN && !!Object.keys((g.stats && g.stats.bildFormate) || {}).length,",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DER DIALOG SAGT NICHT MEHR, DASS ES DAUERN KANN. Wer den Knopf drueckt,
       rechnet dann mit Sekunden und bekommt eine Stunde. */
    nr: '472', name: 'Der Dialog sagt nicht mehr, dass es dauern kann',
    datei: 'public/app.js',
    suche: "        `Sicherung. Dauer: Minuten bis Stunden.`);",
    ersatz: "        `Sicherung.`);",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* ER ERFINDET DOCH EINE ZAHL. Gemessen 394 ms je Bild hier gegen 5,3 s im
       Feld -- Faktor dreizehn: eine Schaetzung waere auf der einen Maschine
       beruhigend falsch und auf der anderen erschreckend falsch. */
    nr: '473', name: 'Der Dialog erfindet doch eine Minutenangabe',
    datei: 'public/app.js',
    suche: "Sicherung. Dauer: Minuten bis Stunden.`);",
    ersatz: "Sicherung. Dauer: etwa 20 Minuten.`);",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DIE THREADZAHL VON sharp WIRD NICHT MEHR GESETZT. Auf der Installation,
       die den Befund gemeldet hat, aendert das nichts -- auf einem Image mit
       jemalloc oder unter musl nimmt sich libvips die ganze Maschine. */
    nr: '474', name: 'Die Threadzahl von sharp wird nicht mehr gesetzt',
    datei: 'server.js',
    suche: "sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));",
    ersatz: "",
    erwartet: 'Die Threadzahl von sharp — 0.19.1'
  },
  {
    /* SIE WIRD AUF DIE VOLLE KERNZAHL GESETZT -- die Zeile steht da und tut
       das Gegenteil dessen, wofuer sie da ist. */
    nr: '475', name: 'Die Threadzahl von sharp ist die volle Kernzahl',
    datei: 'server.js',
    suche: "Math.max(1, Math.floor(os.cpus().length / 2))",
    ersatz: "os.cpus().length",
    erwartet: 'Die Threadzahl von sharp — 0.19.1'
  },
  {
    /* DER BILDSCHIRMTEXT SAGT WIEDER „der Instanz". Wer seine Anlage anders
       benannt hat, liest eine Meldung ueber ein Wort, das nirgends auf seinem
       Bildschirm steht. */
    nr: '476', name: 'Die Absage nennt wieder „den Eigentümer der Instanz"',
    datei: 'public/sprachen/de.json',
    suche: "\"server.verweigertEigen\": \"Das kann nur der Eigentümer dieser Installation.\",",
    ersatz: "\"server.verweigertEigen\": \"Das kann nur der Eigentümer der Instanz.\",",
    erwartet: 'Die Rechte am Papierkorb'
  },
  {
    /* DIE ARBEITSDATEI STEHT WIEDER NICHT IN DER IGNORIERLISTE. Wer das ZIP
       ueber seinen Ordner entpackt, verliert seine angepasste Fassung. */
    nr: '477', name: 'Die docker-compose.yml steht nicht mehr in der .gitignore',
    datei: '.gitignore',
    suche: "\ndocker-compose.yml",
    ersatz: "",
    erwartet: 'Die Compose-Datei wird nicht ueberschrieben'
  },
  {
    /* DIE README NENNT DEN PFLICHTSCHRITT NICHT MEHR. Ohne ihn bricht
       `docker compose up` mit „no configuration file provided" ab -- karg,
       aber es haelt an; die README ist die Stelle, die es vorher sagt. */
    nr: '478', name: 'Die README nennt den Pflichtschritt zur Compose-Datei nicht mehr',
    datei: 'README.md',
    suche: "**Der Schritt `cp docker-compose.example.yml docker-compose.yml` ist Pflicht.**",
    ersatz: "",
    erwartet: 'Die Compose-Datei wird nicht ueberschrieben'
  },
  {
    /* DER WAECHTER UEBER DIE BERICHTIGTEN BEHAUPTUNGEN LAEUFT INS LEERE.
       Ohne die Berichtigung im Quelltext stuende dort wieder ein Satz, der
       gemessen falsch ist. */
    nr: '479', name: 'Die Berichtigung zu substr() faellt aus dem Quelltext',
    datei: 'server.js',
    suche: "     -- substr() AUF EINEM BLOB LIEST DAS BLOB, gemessen 657 ms bei 205 MB,",
    ersatz: "     -- substr() liest wenig, gemessen 657 ms bei 205 MB,",
    erwartet: 'Die berichtigten Behauptungen stehen nirgends mehr'
  },

  /* ---- 0.19.2: was 0.19.1 nur zur Haelfte getroffen hat ---- */
  {
    /* DER INDEX AUF `art` FAELLT WEG. Ohne ihn kostet jede Frage nach der Art
       den ganzen Satz -- gemessen 1338,8 ms gegen 0,1 ms, und keine Umformung
       der Abfrage hilft dagegen (Stolperstein 279). */
    nr: '480', name: 'Der Index auf photos(art) faellt weg',
    datei: 'db.js',
    suche: "db.exec('CREATE INDEX IF NOT EXISTS idx_photos_art ON photos(art)');",
    ersatz: "",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER INDEX WANDERT ZURUECK IN DIE DDL -- vor die Migration, die seine
       Spalte anlegt. Eine Datenbank aus 0.8.40 traegt `photos.art` nicht, und
       das Oeffnen der Datei scheitert dann mit „no such column: art"
       (Stolperstein 281). */
    nr: '486', name: 'Der Index steht wieder vor seiner Migration',
    datei: 'db.js',
    suche: "CREATE INDEX IF NOT EXISTS idx_photos_item ON photos(item_id, sort_order);",
    ersatz: "CREATE INDEX IF NOT EXISTS idx_photos_item ON photos(item_id, sort_order);\n" +
            "CREATE INDEX IF NOT EXISTS idx_photos_art ON photos(art);",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* GEFRAGT WIRD WIEDER MIT EINER UNGLEICHHEIT. Sie sieht richtig aus und
       schlaegt den Index aus: 1334 ms gegen 0,5 ms, dieselbe Antwort. */
    nr: '481', name: 'Die Aufteilung fragt wieder mit einer Ungleichheit',
    datei: 'server.js',
    suche: "  'SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos WHERE art IS ?');",
    ersatz: "  \"SELECT COUNT(*) AS n, COALESCE(SUM(length(data)),0) AS o FROM photos WHERE art != 'video' AND ? IS NOT NULL\");",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DIE EXPORTGROESSE DER BILDER WIRD WIEDER EIN ZWEITES MAL GEFRAGT --
       dieselbe teure Frage nach `art != 'video'`, gemessen 1363 und 1310 ms
       zusaetzlich. Die Zahl bleibt dieselbe; nur der Weg dorthin ist ein
       zweiter (Stolperstein 47). */
    nr: '482', name: 'Die Exportgroesse der Bilder wird ein zweites Mal gefragt',
    datei: 'server.js',
    suche: "      ...austauschTeile(null, { mitDateien: true }),",
    ersatz: "      ...austauschTeile(null, { mitFotos: true, mitDateien: true, mitVideos: true }),",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER SPIELRAUM DES RAHMENS RECHNET DEN ZOOM NICHT MEHR EIN -- der Zustand
       bis 0.19.1. An einem fast quadratischen Bild laesst sich der Ausschnitt
       damit waagerecht gar nicht verschieben, und die eingestellte Ecke ist
       auch mit `transform-origin` nie zu erreichen. */
    nr: '483', name: 'Der Spielraum des Ausschnitts rechnet den Zoom nicht ein',
    datei: 'public/app.js',
    suche: "               spielX: f.breite - k.kante, spielY: f.hoehe - k.kante };",
    ersatz: "               spielX: f.breite - Math.min(f.breite, f.hoehe), spielY: f.hoehe - Math.min(f.breite, f.hoehe) };",
    erwartet: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* DER ZEIGER LANDET NICHT MEHR IN DER MITTE DES RAHMENS, den er gerade
       zieht -- gerechnet wird wieder mit der vollen Seite statt mit dem
       engeren Ausschnitt. Der Sprung ist umso groesser, je enger man zieht. */
    nr: '484', name: 'Der Griff setzt den Punkt neben die Mitte des Rahmens',
    datei: 'public/app.js',
    suche: "      fx = spielX > 0 ? Math.min(100, Math.max(0, (px - eng / 2) / spielX * 100)) : 50;",
    ersatz: "      fx = spielX > 0 ? Math.min(100, Math.max(0, (px - seite / 2) / spielX * 100)) : 50;",
    erwartet: 'Fokuspunkt in der Oberflaeche'
  },
  {
    /* DER DIALOG SAGT NICHT MEHR, DASS DIE UMWANDLUNG NAHEZU VERLUSTFREI IST.
       Wer das nicht liest, haelt den Knopf fuer eine Verschlechterung. */
    nr: '485', name: 'Der Dialog sagt nicht mehr, dass es nahezu verlustfrei ist',
    datei: 'public/app.js',
    suche: "          WebP gespeichert — etwa zwei Drittel kleiner, ohne sichtbaren Verlust. JPEG, GIF und",
    ersatz: "          WebP gespeichert — etwa zwei Drittel kleiner. JPEG, GIF und",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },

  {
    /* DIE UEBERSETZUNG KOMMT ZURUECK. Sie sieht harmlos aus und faengt einen
       Fall ab, den es an dieser Anlage nicht gibt -- Aufwand ohne Gegenwert,
       der bei jeder weiteren Umbenennung gepflegt werden will. */
    nr: '487', name: 'Die Uebersetzung der alten Abschnittsadressen kommt zurueck',
    datei: 'public/app.js',
    suche: "  const gewuenscht = ausDerAdresse;",
    ersatz: "  const gewuenscht = { anlage: 'installation', instanz: 'installation' }[ausDerAdresse] || ausDerAdresse;",
    erwartet: 'Der fuenfte Abschnitt heisst „Installation" — 0.17.1, 0.19.1 und 0.19.2'
  },

  {
    /* DER DECKENDE INDEX FUER DIE UEBERSICHT FAELLT WEG. Sie liest dann sieben
       Spalten wieder aus dem Satz, und der steht in Overflow-Seiten --
       gemessen 6,3 statt 1,6 ms bei 400 Fotos. */
    nr: '488', name: 'Der deckende Index fuer die Uebersicht faellt weg',
    datei: 'db.js',
    suche: "db.exec(`CREATE INDEX IF NOT EXISTS idx_photos_kachel",
    ersatz: "db.exec(`SELECT 1 -- (",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* EINE SPALTE FEHLT IM INDEX -- und das genuegt: SQLite faellt auf
       idx_photos_item zurueck und liest wieder den Satz. Der Index steht da,
       sieht richtig aus und deckt nichts mehr. */
    nr: '489', name: 'Dem deckenden Index fehlt eine Spalte',
    datei: 'db.js',
    suche: "zoom, created_at, art, dauer)`);",
    ersatz: "zoom, art, dauer)`);",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DIE UEBERSICHT FRAGT WIEDER JE EINTRAG. Der Index bleibt, der Gewinn
       halbiert sich -- 3,0 statt 1,6 ms. */
    nr: '490', name: 'Die Uebersicht fragt die Fotos wieder je Eintrag',
    datei: 'server.js',
    suche: "    const ph = fotosJe.get(it.id) || [];",
    ersatz: "    const ph = qPhotos.all(it.id);",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
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
    datei: 'bestandslauf.js',
    /* DIE ZEILE DANACH GEHOERT SEIT 0.19.4 ZUM SUCHTEXT: dieselben zwei
       Zeilen stehen jetzt auch in der dritten Schleife, und ein Suchtext, der
       zweimal passt, bricht den Rueckbau ab (Stolperstein 201 -- mitziehen,
       nicht loeschen). Das Nachziehen bekommt seinen eigenen Rueckbau. */
    suche: "    stand.erledigt++;\n    melde(stand);\n    await new Promise(r => setTimeout(r, 30));",
    ersatz: "    stand.erledigt++;\n    await new Promise(r => setTimeout(r, 30));",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER HAUPT-THREAD HOERT NICHT MEHR ZU. `umstellung.laeuft` bleibt damit
       fuer immer auf true stehen -- die Karte meldet einen Lauf, der laengst
       vorbei ist, und die Pruefung, die auf sein Ende wartet, laeuft in ihre
       Grenze. */
    nr: '492', name: 'Der Haupt-Thread hoert die Meldungen des Threads nicht mehr',
    datei: 'server.js',
    suche: "  w.on('message', (m) => { if (m && m.art === 'stand') bestandsStaende[aufgabe] = m.stand; });",
    ersatz: "  w.on('message', () => {});",
    erwartet: 'Die Bildablage: PNG kommt herein, WebP geht in die Tabelle'
  },
  {
    /* DER SCHLUESSEL REIST UEBER workerData. `workerData` wird beim Erzeugen
       des Threads strukturiert KOPIERT -- der Schluessel staende danach in
       einem zweiten Speicher, und zwar ohne Not: der Thread liest ihn
       denselben Weg wie der Haupt-Thread. */
    nr: '493', name: 'Der Schluessel reist ueber workerData in den Thread',
    datei: 'server.js',
    suche: "  const w = new Worker(BESTANDSLAUF, { workerData: { aufgabe, zeilen } });",
    ersatz: "  const w = new Worker(BESTANDSLAUF, { workerData: { aufgabe, zeilen, schluessel: keyHex } });",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER ABSCHLUSS LAESST DEN THREAD LAUFEN. Er schreibt dann in eine Datei,
       deren WAL gerade gekuerzt wird -- der eine Fall, den diese Runde neu
       einbringt. */
    nr: '494', name: 'SIGTERM kuerzt die WAL, waehrend der Thread noch schreibt',
    datei: 'server.js',
    suche: "    for (const w of bestandsThreads) { try { w.terminate(); } catch {} }",
    ersatz: "    // die Threads laufen weiter",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* EIN FEHLER IM THREAD BLEIBT STILL. Der Server steht danach zwar noch,
       aber die Karte zeigt fuer immer „laeuft" -- und ein zweiter Druck wird
       mit 409 abgewiesen, obwohl gar nichts mehr laeuft. */
    nr: '495', name: 'Ein Fehler im Thread laesst den Lauf auf „laeuft" stehen',
    datei: 'server.js',
    suche: "    if (bestandsStaende[aufgabe]) bestandsStaende[aufgabe].laeuft = false;",
    ersatz: "    if (false) bestandsStaende[aufgabe].laeuft = false;",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER FINGERPRINT KENNT DIE DATEI DES THREADS NICHT MEHR. Sie wird nicht
       requiret, sondern an `new Worker` gereicht -- ohne diese Zeile steht sie
       in keiner Ableitung, und der Fingerprint ist eine halbe Aussage. */
    nr: '496', name: 'Der Fingerprint kennt die Datei des Threads nicht',
    datei: 'server.js',
    suche: "  const liste = [...new Set([...ausgefuehrt, BESTANDSLAUF,",
    ersatz: "  const liste = [...new Set([...ausgefuehrt,",
    erwartet: 'Der Versions-Fingerprint'
  },
  {
    /* DER THREAD UEBERLAESST sharp SEINE VORGABE. sharp wird dort EIGENS
       geladen; unter musl oder mit jemalloc ist die Vorgabe die Kernzahl, und
       ausgerechnet der Wartungslauf naehme sich dann die ganze Maschine. */
    nr: '497', name: 'Der Thread ueberlaesst sharp seine Vorgabe',
    datei: 'bestandslauf.js',
    suche: "sharp.concurrency(Math.max(1, Math.floor(os.cpus().length / 2)));",
    ersatz: "// sharp nimmt sich, was es will",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER SCHLUESSELHINWEIS STEHT BEI JEDEM LAUF EIN ZWEITES MAL IM
       PROTOKOLL -- ein halber Bildschirm, jedes Mal. Wer ihn einmal gelesen
       hat, liest ihn beim zweiten Mal nicht besser. */
    nr: '498', name: 'Der Schluesselhinweis wiederholt sich in jedem Thread',
    datei: 'keys.js',
    suche: "function warnKeyBesideData() {\n  if (!isMainThread) return;",
    ersatz: "function warnKeyBesideData() {",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },

  /* ---- 0.19.3: die Uebersicht fragt einmal und holt nur, was sie zeigt ----
     SECHS RUECKBAUTEN, und sie zielen auf die beiden Gefahren der Buendelung:
     die verlorene ZWEITE Ordnung (wer nach item_id gruppiert und den Rest
     vergisst, bekommt die Zeilen in Einfuegereihenfolge) und die zweite
     WAHRHEIT (die gebuendelte Fassung liest andere Spalten als die
     einzelne). */
  {
    nr: '499', name: 'Die gebuendelten Schlagworte verlieren ihre zweite Ordnung',
    datei: 'server.js',
    suche: "  JOIN item_tags it ON it.tag_id = t.id ORDER BY it.item_id, t.name COLLATE NOCASE`);",
    ersatz: "  JOIN item_tags it ON it.tag_id = t.id ORDER BY it.item_id`);",
    erwartet: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    nr: '500', name: 'Die gebuendelten Testtage verlieren ihre zweite Ordnung',
    datei: 'server.js',
    suche: "  'SELECT item_id, id, day, rating, user_id FROM test_days ORDER BY item_id, day DESC, id DESC');",
    ersatz: "  'SELECT item_id, id, day, rating, user_id FROM test_days ORDER BY item_id');",
    erwartet: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    /* EINE KARTE KENNT NUR, WAS SIE GEFUNDEN HAT. Ohne den Rueckfall traegt
       die Kachel eines Eintrags ohne Link gar kein Feld -- und die
       Oberflaeche zeigt dort nichts statt einer Null. */
    nr: '501', name: 'Die Linkzahl fehlt ganz, wo kein Link ist',
    datei: 'server.js',
    suche: "    it.linkCount = linkZahlJe.get(it.id) || 0;",
    ersatz: "    it.linkCount = linkZahlJe.get(it.id);",
    erwartet: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    /* DIE GEBUENDELTE FASSUNG LIEST EINE SPALTE MEHR ALS DIE EINZELNE. Beide
       sehen fuer sich richtig aus, und die Kachel traegt trotzdem etwas
       anderes als der Eintrag (Stolperstein 47). */
    nr: '502', name: 'Die gebuendelte Schlagwortabfrage liest eine Spalte mehr',
    datei: 'server.js',
    suche: "const qAlleTags = db.prepare(`SELECT it.item_id, ${TAG_SPALTEN} FROM tags t",
    ersatz: "const qAlleTags = db.prepare(`SELECT it.item_id, t.id, t.name, t.created_at FROM tags t",
    erwartet: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    /* DIE LISTE HOLT WIEDER, WAS SIE NICHT ZEIGT: die Schlagworte jedes
       Testtags (bei 400 Eintraegen 1200 Einzelabfragen) und den Verfasser
       dazu. Gelesen hat beides in der Uebersicht nie jemand. */
    nr: '503', name: 'Die Testtage der Liste tragen wieder Schlagworte und Verfasser',
    datei: 'server.js',
    suche: "    if (zeitleiste) it.testDays = testTageJe.get(it.id) || [];",
    ersatz: "    if (zeitleiste) it.testDays = qTestDays(it.id, req.benutzer.id, karte);",
    erwartet: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },
  {
    /* `t.*` STATT DER SPALTENLISTE. `created_at` eines Schlagworts liest die
       Oberflaeche nirgends -- und was niemand ansieht, wird zweimal bezahlt:
       beim Holen und beim Senden. */
    nr: '504', name: 'Die Schlagwortabfrage liest wieder alle Spalten',
    datei: 'server.js',
    suche: "const TAG_SPALTEN = 't.id, t.name';",
    ersatz: "const TAG_SPALTEN = 't.*';",
    erwartet: 'Die Uebersicht fragt einmal — und Kachel und Eintrag sagen dasselbe — 0.19.3'
  },

  /* ---- 0.19.3: die letzten acht „Instanz" ---- */
  {
    /* EINE DER ACHT STELLEN SAGT WIEDER „Instanz". Der Waechter zaehlt
       Nicht-Kommentarzeilen; eine einzige genuegt, damit er anschlaegt. */
    nr: '505', name: 'Eine Stelle im Bildschirmtext sagt wieder „Instanz"',
    datei: 'public/app.js',
    suche: "        <p class=\"desc\"><strong>E-Mail ist optional.</strong> Ohne Mailzugang zeigt Kriterion",
    ersatz: "        <p class=\"desc\"><strong>E-Mail ist optional.</strong> Ohne Mailzugang zeigt die Instanz",
    erwartet: '„Instanz" steht in keinem Bildschirmtext mehr — 0.19.1 und 0.19.3'
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
    datei: 'bilder.js',
    suche: "  thumb:  { kurz: 512,  lang: 1280, q: 78, schneidet: true  },",
    ersatz: "  thumb:  { kurz: 400,  lang: 1280, q: 78, schneidet: true  },",
    erwartet: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DER DECKEL FAELLT WEG. Ohne ihn kennt die kurze Kante keine obere
       Grenze fuer die lange: ein Bildschirmfoto ueber zwei Monitore wird zur
       groessten Ableitung der Tabelle -- groesser als sein eigenes `medium`. */
    nr: '507', name: 'Der Deckel auf der langen Kante faellt weg',
    datei: 'bilder.js',
    suche: "lang: 1280, q: 78, schneidet: true  }",
    ersatz: "lang: 99999, q: 78, schneidet: true  }",
    erwartet: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* `medium` WIRD BEHANDELT WIE `thumb`. Es wird mit `object-fit: contain`
       gezeigt, und dafuer ist die LANGE Kante die richtige -- wer beide
       Ableitungen „der Ordnung halber" gleich behandelt, macht `medium`
       schlechter und die Datenbank groesser. */
    nr: '508', name: 'medium bekommt dieselbe Kiste wie thumb',
    datei: 'bilder.js',
    suche: "  medium: { kurz: 1600, lang: 1600, q: 84, schneidet: false }",
    ersatz: "  medium: { kurz: 512, lang: 1280, q: 84, schneidet: false }",
    erwartet: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DER EXIF-VERMERK ZAEHLT NICHT MEHR MIT. `metadata()` liefert die Masse
       so, wie sie in der Datei stehen; `.rotate()` dreht danach. Ein
       hochkantes Bild mit Ausrichtung 6 bekommt damit die Kiste hochkant und
       kommt quer heraus -- mit 1280 auf der kurzen Kante. */
    nr: '509', name: 'Der EXIF-Vermerk zaehlt bei der Kante nicht mehr mit',
    datei: 'bilder.js',
    suche: "  const gedreht = m && m.orientation >= 5;",
    ersatz: "  const gedreht = false;",
    erwartet: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DER KOPF WIRD GAR NICHT ERST GELESEN. Die Kiste liegt dann immer quer,
       und jedes hochkante Bild bekommt 512 auf der LANGEN statt auf der
       kurzen Kante. */
    nr: '510', name: 'Der Kopf wird nicht gelesen -- die Kiste liegt immer quer',
    datei: 'bilder.js',
    suche: "  const quer = masse ? istQuer(masse) : true;",
    ersatz: "  const quer = true;",
    erwartet: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DIE ALTE GEOMETRIE WIRD AN DER KURZEN KANTE ERKANNT. Das klingt
       richtiger und ist es nicht: der Lauf zoege damit auch das kleine Bild
       und das Panorama mit, und beide kaemen unveraendert heraus -- also bei
       JEDEM Start aufs Neue. Die Abfrage waere kein Festpunkt mehr. */
    nr: '511', name: 'Die Faelligkeit wird wieder an der Zielkante erkannt',
    datei: 'bilder.js',
    /* MITGEGANGEN MIT 0.19.5 (Stolperstein 201). Die alte Frage lautete
       „traegt die lange Kante genau 400?"; sie ist von „ist die Kachel
       quadratisch?" abgeloest. DIESER RUECKBAU SETZT DIE ZIELKANTE ALS
       ZWEITE HAELFTE WIEDER EIN -- und genau daran faellt der Festpunkt: eine
       zugeschnittene Kachel unter 512 (kleines Original, enger Ausschnitt) waere
       damit bei JEDEM Start wieder faellig. */
    suche: "  return masse.width !== masse.height;",
    ersatz: "  return masse.width !== masse.height || masse.width !== VARIANTS.thumb.kurz;",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* EIN UNLESBARER `thumb` GILT WIEDER ALS FERTIG. Die Zeile bleibt damit
       fuer immer kaputt: das Nachruesten sucht `thumb IS NULL` und sieht
       einen kaputten `thumb` gar nicht an. */
    nr: '512', name: 'Ein unlesbarer thumb bleibt liegen',
    datei: 'bilder.js',
    suche: "  catch { return true; }",
    ersatz: "  catch { return false; }",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER LAUF FASST JEDE GEPRUEFTE ZEILE AN. Er leitet damit auch die
       Zeilen neu ab, die laengst richtig liegen -- bei jedem Start, mit dem
       vollen Preis fuer das Lesen des Originals. */
    nr: '513', name: 'Der Lauf erneuert jede Zeile, nicht nur die faelligen',
    datei: 'bestandslauf.js',
    suche: "        if (await istOhneZuschnitt(z.thumb)) {",
    ersatz: "        if (true) {",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER LAUF SCHREIBT AUCH EINE LEERE ABLEITUNG. Danach steht NULL in einer
       Spalte, die vorher ein Bild trug -- eine Videozeile verliert so ihr
       Standbild, und zwar still. */
    nr: '514', name: 'Der Lauf schreibt auch, wenn die Ableitung leer zurueckkommt',
    datei: 'bestandslauf.js',
    suche: "  if (!v.thumb) return null;",
    ersatz: "  if (!v.thumb) v.thumb = null;",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DER STAND REIST ERST AM ENDE ZURUECK -- dasselbe wie Rueckbau 491, eine
       Schleife weiter. Die Karte im Systembereich fragt alle 1500 ms und
       saehe waehrend des ganzen Laufs dieselbe Null. */
    nr: '515', name: 'Das Nachziehen meldet seinen Stand erst am Ende',
    datei: 'bestandslauf.js',
    suche: "    stand.erledigt++;\n    melde(stand);\n    /* DIESELBEN 30 ms WIE IN DEN ANDEREN BEIDEN SCHLEIFEN.",
    ersatz: "    stand.erledigt++;\n    /* DIESELBEN 30 ms WIE IN DEN ANDEREN BEIDEN SCHLEIFEN.",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
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
    datei: 'bestandslauf.js',
    suche: "  reclaim();\n  melde(stand);\n  console.log(`[Kriterion] Kacheln erneuert:",
    ersatz: "  melde(stand);\n  console.log(`[Kriterion] Kacheln erneuert:",
    erwartet: '(erwartet STUMM — die Wirkung ist eine Dateigroesse, und die waechst in dieser Runde ohnehin)'
  },
  {
    /* DIE KETTE BRICHT. Das Nachziehen laeuft danach nur noch, wenn beim
       Start zufaellig ein Vorschaubild fehlt -- also in keiner Instanz nach
       ihrem ersten Start. */
    nr: '517', name: 'Das Nachziehen wird beim Start nicht mehr gerufen',
    datei: 'server.js',
    suche: "  if (!offen.length) return erneuereKacheln();",
    ersatz: "  if (!offen.length) return maintainStorage();",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DIE AUSWAHL VERENGT SICH AUF EIN WORT. `art` traegt laut Schema 'bild'
       oder 'video' -- aber der Import schreibt den Wert aus der
       Austauschdatei ungeprueft durch, und der Pruefstand legt seit 0.19.3
       Zeilen mit `art = 'foto'` an. Die verengte Abfrage laesst sie still
       liegen. */
    nr: '518', name: 'Die Auswahl der faelligen Zeilen verengt sich auf ein Wort',
    datei: 'server.js',
    suche: "const qKachelZeilen = db.prepare('SELECT id FROM photos');",
    ersatz: "const qKachelZeilen = db.prepare(\"SELECT id FROM photos WHERE art IS 'bild'\");",
    erwartet: 'Der Bestandslauf faehrt in einem eigenen Thread — 0.19.3'
  },
  {
    /* DIE FORTSCHRITTSZEILE DES NACHZIEHENS FAELLT AUS DER KARTE. Der Lauf
       dauert am echten Bestand Minuten und laesst die Datenbank um zig
       Megabyte wachsen -- ohne die Zeile geschieht das ohne jedes Zeichen. */
    nr: '519', name: 'Die Fortschrittszeile des Nachziehens faellt aus der Karte',
    datei: 'public/app.js',
    suche: "        ${geometrieZeile(stats.geometrie)}",
    ersatz: "",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DIE ZEILE STEHT AUCH OHNE FUND DA. Der Lauf faehrt bei JEDEM Start und
       findet nach dem ersten Durchgang nichts mehr; die Zeile „0 von 1032
       nachgezogen" staende von da an fuer immer in der Karte und erklaerte
       einen Vorgang, den niemand angestossen hat. */
    nr: '520', name: 'Die Zeile des Nachziehens steht auch ohne Fund da',
    datei: 'public/app.js',
    suche: "  if (!g.nachgezogen && !g.uebersprungen) return '';",
    ersatz: "  if (false) return '';",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },
  {
    /* DIE UHR VERFOLGT NUR NOCH DIE UMSTELLUNG. Die Zeile des Nachziehens
       bliebe damit auf ihrem ersten Stand stehen, bis jemand den
       Systembereich neu aufbaut. */
    nr: '521', name: 'Die Uhr verfolgt nur noch die Umstellung',
    datei: 'public/app.js',
    suche: "  { feld: 'geometrie', id: 'geo-lauf',",
    ersatz: "  { feld: 'gibtsnicht', id: 'gibtsnicht',",
    erwartet: 'Die Ableitung folgt der Anzeige — 0.19.4'
  },
  {
    /* DIE KARTE NENNT WIEDER „400 px UND 1600 px". Die Angabe war bis 0.19.3
       richtig und ist es seit dieser Runde nicht mehr -- und sie verschweigt
       das, worauf es ankommt: WELCHE Kante die Zahl traegt. */
    nr: '522', name: 'Die Karte nennt wieder 400 px, ohne die Kante zu sagen',
    datei: 'public/app.js',
    suche: "          (JPEG) sind nicht mitgezählt.</p>",
    ersatz: "          (JPEG, 400 px) sind nicht mitgezählt.</p>",
    erwartet: 'Die Bildablage in der Oberflaeche'
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
    datei: 'bilder.js',
    suche: "  thumb:  { kurz: 512,  lang: 1280, q: 78, schneidet: true  },",
    ersatz: "  thumb:  { kurz: 512,  lang: 1280, q: 78, schneidet: false },",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* `medium` WIRD MITGESCHNITTEN. Es wird mit `object-fit: contain`
       gezeigt -- ganz --, und der Editor zeichnet den Rahmen darauf. Ein
       geschnittenes `medium` naehme ihm seine Vorlage. */
    nr: '524', name: 'medium wird mitgeschnitten',
    datei: 'bilder.js',
    suche: "  medium: { kurz: 1600, lang: 1600, q: 84, schneidet: false }",
    ersatz: "  medium: { kurz: 1600, lang: 1600, q: 84, schneidet: true }",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER ZUSCHNITT RECHNET IN DEN GESPEICHERTEN MASSEN. `extract()` rechnet
       in den GEDREHTEN -- Stolperstein 288 an einer zweiten Stelle. Wer den
       EXIF-Vermerk nicht mitzaehlt, schneidet an der falschen Stelle, und bei
       3024 Breite laege ein `left` von 3500 sogar ausserhalb. */
    nr: '525', name: 'Der Zuschnitt rechnet in den gespeicherten statt in den gedrehten Massen',
    datei: 'bilder.js',
    suche: "  const { breite, hoehe } = gedrehteMasse(masse);",
    ersatz: "  const breite = masse.width, hoehe = masse.height;",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE KISTE WIRD NICHT MEHR GEGEN DEN RAND GEKLAMMERT. Gerundet kann
       `left + width` einen Bildpunkt ueber den Rand ragen -- sharp quittiert
       das mit einem Fehler, und die Kachel entsteht gar nicht erst. Trifft
       genau den Ausschnitt in einer Ecke (fx = 100). */
    nr: '526', name: 'Die Zuschnittkiste wird nicht gegen den Rand geklammert',
    datei: 'bilder.js',
    suche: "  return { left:  Math.max(0, Math.min(breite - kante, Math.round(k.links))),\n           top:   Math.max(0, Math.min(hoehe  - kante, Math.round(k.oben))),",
    ersatz: "  return { left:  Math.round(k.links) + 1,\n           top:   Math.round(k.oben) + 1,",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* KEIN HOCHRECHNEN MEHR -- umgekehrt: `withoutEnlargement` faellt weg,
       und ein Ausschnitt unter der Zielkante wird auf 512 aufgeblasen. Es
       kostete Bytes und truege keinen einzigen Bildpunkt mehr. */
    nr: '527', name: 'Ein zu kleiner Ausschnitt wird auf die Zielkante hochgerechnet',
    datei: 'bilder.js',
    suche: "withoutEnlargement: true })",
    ersatz: "withoutEnlargement: false })",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DAS FRISCH HOCHGELADENE FOTO WIRD NICHT ZUGESCHNITTEN. Es traegt danach eine
       ungeschnittene Kachel, bis der Bestandslauf beim naechsten Start
       darueberfaehrt -- und der Browser, der sie bis 0.19.4 zurechtzog, ist
       weg. */
    nr: '528', name: 'Beim Hochladen wird die Kachel nicht zugeschnitten',
    datei: 'server.js',
    suche: "      const v = await makeVariants(f.buffer, VORGABE_ZUSCHNITT);",
    ersatz: "      const v = await makeVariants(f.buffer);",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER EINGESPIELTE AUSSCHNITT KOMMT NICHT IN DIE ABLEITUNG. Die drei
       Zahlen stehen danach richtig in der Zeile, die Kachel zeigt sie aber
       nicht -- an einem gerade eingespielten Bestand ist das der ganze
       Bestand. */
    nr: '529', name: 'Beim Einspielen wird die Kachel nicht zugeschnitten',
    datei: 'server.js',
    suche: "      const v = vorlage ? await makeVariants(vorlage, zuschnitt) : { thumb: null, medium: null };",
    ersatz: "      const v = vorlage ? await makeVariants(vorlage) : { thumb: null, medium: null };",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER BESTANDSLAUF ERNEUERT OHNE ZUSCHNITT. Er erzeugte damit genau die
       Ableitung, die 0.19.4 hinterlassen hat -- und die Zeile bliebe bei
       jedem Start aufs Neue faellig, weil sie nicht quadratisch wird. */
    nr: '530', name: 'Der Bestandslauf erneuert ohne Zuschnitt',
    datei: 'bestandslauf.js',
    suche: "  const v = await makeVariants(vorlage, zuschnittAus(z));",
    ersatz: "  const v = await makeVariants(vorlage);",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE VIDEOZEILE ERZEUGT AUS `data`. Dort steht die Videodatei -- sharp
       kommt daran leer zurueck, die Zeile wird uebersprungen und behaelt ihre
       ungeschnittene Kachel. Der Kernsatz bleibt: der Server oeffnet nie ein
       Video. */
    nr: '531', name: 'Die Videozeile erzeugt aus der Videodatei statt aus ihrem Standbild',
    datei: 'bestandslauf.js',
    suche: "const vorlageAus = (z) => (istVideoZeile(z) ? z.medium : z.data);",
    ersatz: "const vorlageAus = (z) => z.data;",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE VIERTE AUFGABE GIBT ES NICHT MEHR. Der Thread wirft dann
       „Unbekannte Aufgabe", die Route bekommt ihren Abschluss ueber den
       Fehlerweg -- und die Kachel bleibt, wie sie war. */
    nr: '532', name: 'Der Thread kennt die Aufgabe zuschnitt nicht',
    datei: 'bestandslauf.js',
    suche: "  else if (workerData.aufgabe === 'zuschnitt') await erneuereEineKachel(workerData.zeilen);\n",
    ersatz: "",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DAS ERGEBNIS DER EINZELNEN ZEILE REIST NICHT ZURUECK. Der Haupt-Thread
       haengt seine Antwort an das Ende des Threads und nicht an diese
       Meldung -- ohne sie weiss aber niemand, ob wirklich erneuert wurde. */
    nr: '533', name: 'Das Ergebnis der einzelnen Zeile wird nicht gemeldet',
    datei: 'bestandslauf.js',
    suche: "  parentPort.postMessage({ art: 'erneuert', id, ok });",
    ersatz: "",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE ROUTE ERZEUGT NICHT MEHR. Sie schreibt die drei Zahlen und ist
       fertig -- wie bis 0.19.4. Die Uebersicht zeigte danach den alten
       Schnitt, bis irgendwann etwas anderes die Zeile anfasst. */
    nr: '534', name: 'Das Speichern des Ausschnitts erzeugt die Kachel nicht neu',
    datei: 'server.js',
    suche: "  erneuereKachel(req.params.id, () => res.json(detail(p.item_id, req.benutzer.id)));",
    ersatz: "  res.json(detail(p.item_id, req.benutzer.id));",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE ANTWORT WARTET NICHT AUF DIE KACHEL. Die Frist faellt auf null, die
       Antwort geht sofort hinaus -- und traegt die Fassung der ALTEN Kachel.
       Der Browser haelt sie damit bis zu 24 Stunden fest. */
    nr: '535', name: 'Die Antwort kommt, bevor die Kachel steht',
    datei: 'server.js',
    suche: "  const uhr = setTimeout(einmal, ERNEUERUNGSFRIST_MS);",
    ersatz: "  const uhr = setTimeout(einmal, 0);",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE FASSUNG STEHT NICHT MEHR AN DER FOTOZEILE. Ohne sie traegt die
       Adresse kein `?v=`, und `Cache-Control: private, max-age=86400` haelt
       die alte Kachel fest. */
    nr: '536', name: 'Die Fassung faellt aus der Fotoabfrage',
    datei: 'server.js',
    suche: "const PHOTO_FASSUNG = 'length(thumb) AS fassung';",
    ersatz: "const PHOTO_FASSUNG = 'NULL AS fassung';",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE ADRESSE TRAEGT DIE FASSUNG NICHT MEHR. Dieselbe Wirkung wie 536,
       eine Schicht hoeher -- und ohne diesen Rueckbau bliebe gruen, wer die
       Spalte liefert und sie in der Oberflaeche liegen laesst. */
    nr: '537', name: 'Die Bildadresse traegt die Fassung nicht mehr',
    datei: 'public/app.js',
    suche: "  const fassung = groesse === 'thumb' && Number.isFinite(f) ? `&v=${f}` : '';",
    ersatz: "  const fassung = '';",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DER ZUSCHNITT IM BROWSER KOMMT ZURUECK. Ab jetzt wird ZWEIMAL
       geschnitten -- die zugeschnittene Kachel ist schon das sichtbare Quadrat,
       und `scale()` darauf zeigt einen Ausschnitt des Ausschnitts. */
    nr: '538', name: 'Der Zuschnitt im Browser kommt zurueck -- es wird zweimal geschnitten',
    datei: 'public/style.css',
    suche: ".thumb img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }",
    ersatz: ".thumb img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; transform: scale(var(--zoom, 1)); }",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE BEIDEN RECHNUNGEN LAUFEN AUSEINANDER. Der Browser zeichnet den
       Rahmen ohne den Zoom, der Server schneidet mit ihm -- der Editor zeigt
       danach ein anderes Quadrat, als in der Kachel landet. GENAU DAS ist die
       Gefahr, wegen der die Rechnung auf beiden Seiten in EINER Funktion
       steht und der Pruefstand sie gegeneinander haelt (Stolperstein 293). */
    nr: '539', name: 'Die Rechnung im Browser laeuft der im Server davon',
    datei: 'public/app.js',
    suche: "  const eng = seite * 100 / zoom;          // was sie beim eingestellten Zoom zeigt",
    ersatz: "  const eng = seite;                       // was sie beim eingestellten Zoom zeigt",
    erwartet: 'Der Ausschnitt steckt in der Kachel — 0.19.5'
  },
  {
    /* DIE FORTSCHRITTSZEILE KENNT NUR NOCH EINE RICHTUNG. Bis 0.19.4 wurde die
       Kachel groesser, und „mehr" war immer richtig; zugeschnitten wird sie in der
       Regel kleiner. Danach staende in der Karte „20 MB mehr", wo 20 MB frei
       geworden sind -- eine Zahl, die in die falsche Richtung zeigt, ist
       schlechter als keine. */
    nr: '540', name: 'Die Fortschrittszeile kennt nur eine Richtung',
    datei: 'public/app.js',
    suche: "${d > 0 ? 'mehr' : 'weniger'}",
    ersatz: "mehr",
    erwartet: 'Die Bildablage in der Oberflaeche'
  },

  /* ---- Die Ansicht kann fort sein -- 0.19.6 ----
     DREI RUECKBAUTEN ZU EINER EINZIGEN ZEILE JE ZEICHENWEG, und der dritte ist
     der wichtigste: er nimmt nicht die Wache weg, sondern das, was sie
     bewacht. Eine Wache, die nichts mehr durchlaesst, waere gruen und
     nutzlos. */
  {
    /* DER STREIFEN ZEICHNET WIEDER OHNE ZU FRAGEN. Genau der gemeldete
       Fehler: wer den Ausschnitt speichert und in die Uebersicht geht,
       bekommt „can't access property innerHTML" als ROTE Meldung ueber einen
       Vorgang, der geglueckt ist. */
    nr: '541', name: 'Der Bilderstreifen fragt nicht, ob seine Ansicht noch steht',
    datei: 'public/app.js',
    suche: "    // erste, die den fehlenden Knoten anfasste.\n    if (!box) return;\n",
    ersatz: "    // erste, die den fehlenden Knoten anfasste.\n",
    erwartet: 'Die Ansicht kann fort sein — 0.19.6'
  },
  {
    /* DASSELBE AM BETRACHTER. Er faellt beim Loeschen und beim Hochladen an
       -- beides steht hinter einem await, und das Hochladen wartet laenger
       als jedes Speichern eines Ausschnitts. */
    nr: '542', name: 'Der Betrachter fragt nicht, ob seine Ansicht noch steht',
    datei: 'public/app.js',
    suche: "    if (!v) return;\n    // Der Betrachter bleibt bei jedem Neuzeichnen",
    ersatz: "    // Der Betrachter bleibt bei jedem Neuzeichnen",
    erwartet: 'Die Ansicht kann fort sein — 0.19.6'
  },
  {
    /* UND DIE WACHE ALS AUSSCHALTER: der Streifen zeichnet gar nichts mehr.
       Wer nur „keine rote Meldung" prueft, bleibt hier gruen -- deshalb steht
       in derselben Gruppe die Gegenprobe an der STEHENDEN Ansicht. */
    nr: '543', name: 'Der Bilderstreifen zeichnet ueberhaupt keine Kacheln mehr',
    datei: 'public/app.js',
    suche: "    box.innerHTML = '';\n    item.photos.forEach((p, i) => {",
    ersatz: "    box.innerHTML = '';\n    [].forEach((p, i) => {",
    erwartet: 'Die Ansicht kann fort sein — 0.19.6'
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
    datei: 'server.js',
    suche: "  return brauchbar.slice(behalten).filter(d => d.zeit < grenze);",
    ersatz: "  return brauchbar.filter(d => d.zeit < grenze);",
    erwartet: 'Die Aufraeumregel an der Tafel'
  },
  {
    /* NUR NOCH DIE ZAHL -- die Schere faellt weg. Wer an einem Nachmittag
       viermal auf den Knopf drueckt, wirft damit die Kopie vom Vormonat weg,
       obwohl nichts alt ist. */
    nr: '545', name: 'Die Regel kennt nur die Zahl -- die Schere faellt weg',
    datei: 'server.js',
    suche: "  return brauchbar.slice(behalten).filter(d => d.zeit < grenze);",
    ersatz: "  return brauchbar.slice(behalten);",
    erwartet: 'Die Aufraeumregel an der Tafel'
  },
  {
    /* DIE MUSTERPRUEFUNG FAELLT WEG -- und mit ihr die Zusage, um die es in
       dieser Runde am meisten geht: eine fremde Datei im Sicherungsordner wird
       angefasst. Getauscht wird die KONSTANTE und nicht eine der beiden
       Abfragen: nur so faellt sie an BEIDEN Stellen zugleich, und genau das ist
       die Lage, in der `notizen.txt` wirklich verschwindet. */
    nr: '546', name: 'Die Musterpruefung faellt weg -- die fremde Datei faellt mit',
    datei: 'server.js',
    suche: "const SICHERUNG_MUSTER = /^kriterion-.+\\.sqlite$/;",
    ersatz: "const SICHERUNG_MUSTER = /./;",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE ZWEITE MUSTERPRUEFUNG, unmittelbar vor dem unlink. Sie ist bei
       heilem Muster keine Verdopplung, sondern die Klemme an der Stelle, an
       der der Fehler wehtut: wer entferneSicherungen() je von woanders her
       ruft, kommt an ihr nicht vorbei. AM VERHALTEN ALLEIN WAERE SIE STUMM --
       die Namen kommen heute aus sicherungsListe() und sind laengst geprueft;
       rot wird deshalb der Waechter ueber den Quelltext. */
    nr: '547', name: 'Die zweite Musterpruefung vor dem unlink faellt weg',
    datei: 'server.js',
    suche: "    if (kurz !== String(n) || !SICHERUNG_MUSTER.test(kurz)) { geblieben.push(kurz); continue; }",
    ersatz: "    if (false) { geblieben.push(kurz); continue; }",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* EIN SYMLINK WIRD ZUR SICHERUNG. statSync folgt dem Verweis und meldet
       die Datei am anderen Ende als regulaer; lstatSync sieht den Verweis
       selbst. Der Verweis im Prueflauf zeigt aus dem Ordner heraus -- und sein
       Ziel ist eigens alt, sonst deckte ihn der Boden. */
    nr: '548', name: 'Die Liste folgt dem Symlink statt ihn zu sehen',
    datei: 'server.js',
    suche: "      const st = fs.lstatSync(path.join(pfad, n));",
    ersatz: "      const st = fs.statSync(path.join(pfad, n));",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DASSELBE AM ENTFERNEN. Am Verhalten allein bliebe es stumm, solange die
       Liste darueber heil ist -- rot wird der Waechter ueber den Quelltext,
       und das ist hier die richtige Stelle: die beiden Fragen stehen
       absichtlich zweimal da. */
    nr: '549', name: 'Das Entfernen folgt dem Symlink',
    datei: 'server.js',
    suche: "      const st = fs.lstatSync(voll);",
    ersatz: "      const st = fs.statSync(voll);",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DER BODEN ZAEHLT WIEDER ALLE KOPIEN -- Entscheidung 5 faellt. Drei
       Kopien, von denen zwei vor dem Schluesselwechsel entstanden sind, sind in
       Wahrheit eine; wer sie mitzaehlt, raeumt die einzige brauchbare weg. */
    nr: '550', name: 'Der Boden zaehlt auch die veralteten Kopien mit',
    datei: 'server.js',
    suche: "    .filter(d => wechselMs == null || d.zeit >= wechselMs)",
    ersatz: "    .filter(() => true)",
    erwartet: 'Die Aufraeumregel an der Tafel'
  },
  {
    /* NACH EINER GESCHEITERTEN SICHERUNG WIRD DOCH AUFGERAEUMT -- der Aufruf
       wandert vor den Fehlerausgang. Genau das ist die wichtigste Zeile der
       Runde: sonst raeumt die Installation in dem Augenblick auf, in dem sie
       keine neue Kopie zustande bringt. */
    nr: '551', name: 'Nach der gescheiterten Sicherung wird doch aufgeraeumt',
    datei: 'server.js',
    suche: "  if (fs.existsSync(datei))\n    return res.status(409).json({ error: t(spracheVon(req), 'server.sicherungGleichzeitig')});",
    ersatz: "  if (fs.existsSync(datei)) {\n    const r = aufraeumStand();\n    if (r.an) entferneSicherungen(ziel.pfad, regelTreffer(sicherungsListe(ziel.pfad) || [],\n      r.behalten, r.tage, Date.now(), (wechselMarke() || {}).ms ?? null).map(d => d.name));\n    return res.status(409).json({ error: t(spracheVon(req), 'server.sicherungGleichzeitig')});\n  }",
    erwartet: 'Alte Sicherungen aufraeumen: der Anschluss an die Sicherung'
  },
  {
    /* DAS AUFRAEUMEN REISST DIE GELUNGENE SICHERUNG MIT -- genau der Fehler aus
       0.19.6 (Stolperstein 298): aus einem geglueckten Vorgang wird eine rote
       Meldung. Der Rueckbau nimmt dem `catch` seine Wirkung UND setzt einen
       Ausgang dahinter; einer von beiden allein bliebe stumm, weil im Prueflauf
       nichts wirft. */
    nr: '552', name: 'Das Aufraeumen reisst die gelungene Sicherung mit',
    datei: 'server.js',
    suche: "    console.error('[Kriterion] Das Aufräumen nach der Sicherung ist gescheitert:', e.message);\n" +
           "    aufgeraeumt = { weg: 0, nicht: 0, bytes: 0, gescheitert: true };\n" +
           "  }",
    ersatz: "    throw e;\n" +
            "  }\n" +
            "  if (aufgeraeumt && aufgeraeumt.weg)\n" +
            "    return res.status(500).json({ error: 'Die Sicherung ist gescheitert.' });",
    erwartet: 'Alte Sicherungen aufraeumen: der Anschluss an die Sicherung'
  },
  {
    /* DER SCHALTER STEHT WIEDER AUF AN, wenn nichts dasteht -- die Abweichung
       von `bilderUmwandeln` faellt weg. Eine umgewandelte PNG-Datei holt der
       Knopf in der Gegenrichtung zurueck; eine geloeschte Sicherung holt
       nichts zurueck. */
    nr: '553', name: 'Der Schalter steht bei einer frischen Installation auf AN',
    datei: 'server.js',
    suche: "    an: getSetting('sicherungAufraeumen', false) === true,",
    ersatz: "    an: getSetting('sicherungAufraeumen', true) !== false,",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE GRENZEN HALTEN NICHT MEHR AM SERVER. `min`/`max` im HTML bleibt
       stehen -- und ist eine Bitte, keine Klemme: ein Feld, in das jemand 0
       schreiben kann, ist eine Falle. */
    nr: '554', name: 'Die Grenzen der beiden Werte halten nicht mehr am Server',
    datei: 'server.js',
    suche: "  if (!Number.isInteger(n) || n < spanne.min || n > spanne.max)",
    ersatz: "  if (false)",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE VORSCHAU RECHNET MIT ANDEREN WERTEN ALS DAS LOESCHEN -- zwei
       Wahrheiten darueber, was gleich passiert (Stolperstein 47). Die Vorschau
       verliert damit genau das, wofuer es sie gibt. */
    nr: '555', name: 'Die Vorschau rechnet mit einem anderen Boden als das Loeschen',
    datei: 'server.js',
    suche: "  const treffer = regelTreffer(dateien, behalten, tage, jetzt, marke ? marke.ms : null);",
    ersatz: "  const treffer = regelTreffer(dateien, Math.max(1, behalten - 1), tage, jetzt,\n" +
            "                               marke ? marke.ms : null);",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE LOESCHROUTE NIMMT EINEN DATEINAMEN ENTGEGEN -- die gefaehrlichste
       Route der Anwendung, und sie waere es auch mit Pruefung: die Pruefung
       stuende einen Handgriff davon entfernt, vergessen zu werden
       (Stolperstein 300). */
    nr: '556', name: 'Die Loeschroute nimmt einen Dateinamen aus dem Rumpf',
    datei: 'server.js',
    suche: "  const art = String(req.body?.art || '');",
    ersatz: "  const art = String(req.body?.art || '');\n" +
            "  if (req.body?.datei) {\n" +
            "    const einzeln = entferneSicherungen(ziel.pfad, [req.body.datei]);\n" +
            "    return res.json({ ok: true, art, weg: einzeln.weg, nicht: einzeln.geblieben.length,\n" +
            "                      bytes: einzeln.bytes, ...letzteSicherung(ziel.pfad) });\n" +
            "  }",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    nr: '557', name: 'Das Aufraeumen laeuft ohne zweite Bestaetigung',
    datei: 'server.js',
    suche: "app.post('/api/sicherung/aufraeumen', nurEigentuemer,\n" +
           "         zweiteBestaetigungNoetig('sicherung'), (req, res) => {",
    ersatz: "app.post('/api/sicherung/aufraeumen', nurEigentuemer, (req, res) => {",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DIE ROUTE FAELLT AUF nurAdmin. Sie entfernt Dateien vom Dateisystem des
       Wirts und liegt damit in derselben Zeile wie Export, Import und
       Sicherung -- beim Eigentuemer. */
    nr: '558', name: 'Ein gewoehnlicher Admin darf alte Sicherungen entfernen',
    datei: 'server.js',
    suche: "app.post('/api/sicherung/aufraeumen', nurEigentuemer,\n" +
           "         zweiteBestaetigungNoetig('sicherung'), (req, res) => {",
    ersatz: "app.post('/api/sicherung/aufraeumen', nurAdmin,\n" +
            "         zweiteBestaetigungNoetig('sicherung'), (req, res) => {",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* KEINE ZEILE MEHR IM SICHERHEITSPROTOKOLL. Eine Loeschung, die keine Spur
       hinterlaesst, ist die, nach der hinterher niemand suchen kann. */
    nr: '559', name: 'Die entfernten Kopien stehen in keinem Protokoll mehr',
    datei: 'server.js',
    suche: "  for (let i = 0; i < zahl; i++) auth.protokolliere('sicherung.weg', { wer });",
    ersatz: "  for (let i = 0; i < 0; i++) auth.protokolliere('sicherung.weg', { wer });",
    erwartet: 'Alte Sicherungen aufraeumen: der echte Ordner'
  },
  {
    /* DER VORGANG FAELLT AUS DER GRUPPE `bestand`. Er stuende dann unter keiner
       Ansicht des Filters -- ausser unter "alle", und dort sucht ihn niemand. */
    nr: '560', name: 'Der Vorgang sicherung.weg steht in keiner Gruppe',
    datei: 'auth.js',
    suche: "  bestand: ['export', 'import', 'sicherung', 'sicherung.weg', 'schluessel']",
    ersatz: "  bestand: ['export', 'import', 'sicherung', 'schluessel']",
    erwartet: 'Das Sicherheitsprotokoll: die Gruppen des Filters'
  },
  {
    /* DIE ZWANZIGSTE KARTE FAELLT WEG. Ohne sie gibt es die Bedienung gar
       nicht -- der Schalter, die beiden Felder, die Vorschau und beide
       Knoepfe stehen darauf. */
    nr: '561', name: 'Die Karte „Alte Sicherungen" faellt aus dem Systembereich',
    datei: 'public/app.js',
    suche: "  { schluessel: 'aufraeumen',   abschnitt: 'datenbank', sichtbar: () => EIGENTUEMER,\n" +
           "    markup: karteAufraeumen,   ausruesten: ruesteAufraeumenAus },",
    ersatz: "",
    erwartet: 'Der Systembereich nach Rolle'
  },
  {
    /* SIE STEHT BEIM ADMIN STATT BEIM EIGENTUEMER -- dieselbe Klemme wie die
       Karte "Sicherung" daneben faellt damit weg. */
    nr: '562', name: 'Die Karte „Alte Sicherungen" steht schon beim Admin',
    datei: 'public/app.js',
    suche: "  { schluessel: 'aufraeumen',   abschnitt: 'datenbank', sichtbar: () => EIGENTUEMER,",
    ersatz: "  { schluessel: 'aufraeumen',   abschnitt: 'datenbank', sichtbar: () => ADMIN,",
    erwartet: 'Der Systembereich nach Rolle'
  },
  {
    /* DIE VORSCHAU RECHNET NICHT MEHR NEU. Wer die Zahl von 3 auf 1 stellt,
       sieht dann nicht mehr, was das kostet -- und die Karte zeigt eine
       Vorschau zu Werten, die gar nicht mehr dastehen. */
    nr: '563', name: 'Eine Aenderung am Feld rechnet die Vorschau nicht neu',
    datei: 'public/app.js',
    suche: "        el.oninput = vorschauNeu;",
    ersatz: "        el.oninput = null;",
    erwartet: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE KARTE SCHICKT DIE DATEINAMEN MIT. Der Server nimmt sie nicht
       entgegen -- aber eine Oberflaeche, die sie schickt, ist der erste
       Handgriff zu einer Route, die sie liest. */
    nr: '564', name: 'Die Karte schickt die Dateinamen an die Loeschroute mit',
    datei: 'public/app.js',
    suche: "      try { r = await api('POST', '/api/sicherung/aufraeumen', { art }); }",
    ersatz: "      try { r = await api('POST', '/api/sicherung/aufraeumen',\n" +
            "        { art, dateien: (a.treffer || []).map(t => t.datei) }); }",
    erwartet: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DER KNOPF IST AUCH DANN BEDIENBAR, WENN DIE REGEL NICHTS TRIFFT. Ein
       Knopf, der zuverlaessig nichts tut, sieht aus wie ein Fehler. */
    nr: '565', name: 'Der Knopf ist auch ohne Treffer bedienbar',
    datei: 'public/app.js',
    // MITGEGANGEN mit 0.20.1 (Stolperstein 201): der Knopf heisst jetzt „Jetzt
    // loeschen" statt „Regel jetzt anwenden". Die Zusage ist unveraendert.
    suche: "id=\"auf-los\"${treffer.length ? '' : ' disabled'}>Jetzt",
    ersatz: "id=\"auf-los\">Jetzt",
    erwartet: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE LISTE VERLIERT DEN GEMEINSAMEN DECKEL. Ein Ordner mit vierzig Kopien
       zieht die Seite auf -- zehn Zeilen sind das Mass jeder Liste im
       Systembereich, seit 0.17.3. */
    nr: '566', name: 'Die Sicherungsliste bekommt keinen Deckel',
    datei: 'public/style.css',
    /* MITGEGANGEN mit 0.20.1 (Stolperstein 201) -- UND IN EINE ANDERE DATEI
       GEWANDERT. Bis 0.20.0 nahm er der Liste ihre Klasse in `public/app.js`;
       seit 0.20.1 hat sie ihren EIGENEN Deckel von fuenf Zeilen als Regel im
       Stilblatt, und die ist die Sache. Die Zusage ist dieselbe geblieben:
       eine Liste ohne Deckel zieht die Karte auf. */
    suche: '#auf-liste { flex: none; max-height: 13.98rem; }',
    ersatz: '#auf-liste { flex: none; }',
    erwartet: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE LISTE FAELLT GANZ WEG -- und mit ihr die Auskunft, um die es im
       Feldbefund zu 0.20.0 ueberhaupt ging: welche Sicherungen liegen da, wie
       alt und wie gross. Die Zahl in der Ueberschrift bleibt stehen; ohne die
       Zeilen ist sie eine Behauptung. */
    nr: '567', name: 'Die Karte listet die Sicherungen nicht mehr',
    datei: 'public/app.js',
    suche: '           <div class="manage-list" id="auf-liste">${alle.map(zeile).join(\'\')}</div>`',
    ersatz: '           <div class="manage-list" id="auf-liste"></div>`',
    erwartet: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE NUMMER LAEUFT VON DER AELTESTEN AN. Damit steht die juengste Kopie
       als letzte Nummer da, und „mindestens 3 behalten" liesse sich an der
       Liste nicht mehr ablesen -- was faellt, stuende dann ganz oben. */
    nr: '568', name: 'Die Nummern laufen von der aeltesten zur juengsten',
    datei: 'server.js',
    suche: '      ...aufraeumZeile(d, jetzt), nr: i + 1,',
    ersatz: '      ...aufraeumZeile(d, jetzt), nr: dateien.length - i,',
    erwartet: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
  },
  {
    /* DIE MARKE „LOESCHEN" FAELLT VON DER ZEILE. Die Liste sagt dann, was
       daliegt, aber nicht mehr, was gleich fehlt -- und die Karte hat ausser
       der Summenzeile nichts, was auf eine bestimmte Kopie zeigt. */
    nr: '569', name: 'Die Zeilen sagen nicht mehr, welche geloescht wird',
    datei: 'public/app.js',
    suche: "      const marke = z.faellt ? '<span class=\"auf-marke weg\">löschen</span>'",
    ersatz: "      const marke = z.faellt ? ''",
    erwartet: 'Die Karte „Alte Sicherungen" in der Oberflaeche'
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
    datei: 'server.js',
    suche: '   GROUP BY r.item_id, r.criterion_id, c.gewicht, c.phase`);',
    ersatz: '   GROUP BY r.item_id, r.criterion_id, c.gewicht`);',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DASSELBE AM EINZELNEN EINTRAG. Zwei Fassungen derselben Abfrage, zwei
       Rueckbauten -- faellt nur einer, blieben Uebersicht und Detail
       verschiedener Meinung, und genau das soll auffallen.
       DIESER HIER IST DER, DER STUMM ZURUECKKAM und die Messung ausgeloest
       hat; die Begruendung steht eine Nummer hoeher. */
    nr: '571', name: 'Der Gesamtschnitt des Eintrags kennt die Phase nicht mehr',
    datei: 'server.js',
    suche: '   GROUP BY r.criterion_id, c.gewicht, c.phase`);',
    ersatz: '   GROUP BY r.criterion_id, c.gewicht`);',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE ZWEITE KOPFZAHL FAELLT AUS DER ANTWORT. Der Kasten stuende dann da
       und wuesste seine eigene Zahl nicht -- und die Kachel eines ungetesteten
       Eintrags zeigte nichts. */
    nr: '572', name: 'potenzialRating faellt aus der Uebersicht',
    datei: 'server.js',
    suche: '    it.potenzialRating = gesamtSchnitt(kaesten.vorher);',
    ersatz: '    it.potenzialRating = null;',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DER ZWEITE RECHENWEG FAELLT. Die Kopfzahl bliebe richtig, die Erklaerung
       dahinter leer -- genau die Lage, in der eine Zahl dasteht und niemand
       nachsehen kann, wie sie zustande kommt (Stolperstein 217). */
    nr: '573', name: 'Der Rechenweg des Potenzials faellt aus der Antwort',
    datei: 'server.js',
    suche: '  it.potenzialRechenweg = { ...potenzialRechenweg, ergebnis: it.potenzialRating };',
    ersatz: '  void potenzialRechenweg;',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE PHASE FAELLT VON DER STERNZEILE. Der Browser koennte dann nicht mehr
       nach Kaesten teilen, und beide Kaesten zeigten alle Zeilen. */
    nr: '574', name: 'Die Sternzeilen des Details tragen ihre Phase nicht mehr',
    datei: 'server.js',
    suche: '    SELECT c.id AS criterion_id, c.name, c.gewicht, c.phase, COALESCE(r.value, 0) AS value',
    ersatz: '    SELECT c.id AS criterion_id, c.name, c.gewicht, COALESCE(r.value, 0) AS value',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE ABSAGE BEIM ANLEGEN FAELLT: jeder Unfug landete dann in der Spalte,
       und das Kriterium stuende in KEINEM der beiden Kaesten -- die Sterne
       daran zaehlten nirgends mit, ohne dass es jemand saehe. */
    nr: '575', name: 'POST /api/criteria nimmt jede Phase an',
    datei: 'server.js',
    suche: "  if (!PHASEN.includes(phase))",
    ersatz: "  if (false)",
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DER KASTEN LAESST SICH DOCH WECHSELN -- still, ueber ein uebergangenes
       Feld. Genau das ist der Fall, den die Absage verhindert: ein
       uebergangenes Feld sieht fuer den Aufrufer aus wie ein gesetztes. */
    nr: '576', name: 'PUT /api/criteria/:id uebergeht die Phase stillschweigend',
    datei: 'server.js',
    suche: "  if (req.body.phase !== undefined)",
    ersatz: "  if (false)",
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DAS DRITTE FELD FAELLT AUS DER EXPORTDATEI. Eine Datei mit
       Vorher-Kriterien spielte sich dann als lauter Bewertungskriterien ein --
       und die Sterne landeten im falschen Durchschnitt. */
    nr: '577', name: 'Der Export nennt die Kaesten nicht mehr',
    datei: 'server.js',
    suche: "  for (const c of kritZeilen) if (c.phase !== 'nachher') criteriaPhase[c.name] = c.phase;",
    ersatz: '  void criteriaPhase;',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE ABSAGE BEIM EINSPIELEN FAELLT. Ein Kriterium, das hier im einen und
       in der Datei im anderen Kasten steht, wuerde dann still in den
       vorhandenen eingespielt: die Datei sagte etwas anderes als die
       Installation, und niemand saehe es. */
    nr: '578', name: 'Der Import spielt ueber die Kaesten hinweg ein',
    datei: 'server.js',
    suche: '  if (konflikte.length) {',
    ersatz: '  if (false) {',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE PHASE FAELLT AUS DER KRITERIENLISTE. Die zweite Systemkarte fand
       ihre Zeilen dann nicht mehr, und die Oberflaeche koennte die beiden
       Kaesten nicht auseinanderhalten. */
    nr: '579', name: 'GET /api/criteria liefert die Phase nicht mehr',
    datei: 'server.js',
    suche: '  SELECT c.id, c.name, c.sort_order, c.gewicht, c.phase, c.created_at,',
    ersatz: '  SELECT c.id, c.name, c.sort_order, c.gewicht, c.created_at,',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE SPALTE BEKOMMT EINE ANDERE VORGABE. Der Bestand stuende nach dem
       Einspielen im Kasten „vorher", und saemtliche Gesamtschnitte waeren
       still weg -- der teuerste denkbare Fehler dieser Runde. */
    nr: '580', name: 'Die Migration stellt den Bestand auf vorher',
    datei: 'db.js',
    suche: '  db.exec("ALTER TABLE rating_criteria ADD COLUMN phase TEXT NOT NULL DEFAULT \'nachher\'");',
    ersatz: '  db.exec("ALTER TABLE rating_criteria ADD COLUMN phase TEXT NOT NULL DEFAULT \'vorher\'");',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DER MIGRATIONSBLOCK LAEUFT NICHT MEHR. Eine Datenbank aus 0.20.1 traegt
       die Spalte nicht -- CREATE TABLE IF NOT EXISTS ruehrt eine vorhandene
       Tabelle nicht an (Stolperstein 13) --, und die Installation kaeme nicht
       hoch. */
    nr: '581', name: 'Der Migrationsblock 0.21.0 wird nicht mehr gerufen',
    datei: 'db.js',
    suche: '\nmigration0210();',
    ersatz: '\n// migration0210();',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DIE BEIDEN STERNKAESTEN FUEHREN IHREN EINKLAPPZUSTAND WIEDER IN `zu`.
       Damit gaelte ein Klick an EINEM Eintrag fuer ALLE -- genau die Reichweite,
       die diese Runde ihnen nimmt. */
    nr: '582', name: 'Die Sternkaesten speichern ihren Einklappzustand wieder',
    datei: 'server.js',
    suche: "const ZU_BLOECKE = ALLE_BLOECKE.filter(k => !BLOECKE_OHNE_ZU.includes(k));",
    ersatz: "const ZU_BLOECKE = ALLE_BLOECKE;",
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },

  /* ---- 0.21.0: die Sternzeile ---- */
  {
    /* DAS × VERLIERT SEINEN PLATZ, WENN ES UNSICHTBAR IST. `hidden` ist
       `display: none`; damit rutschten die Sterne beim ERSTEN Stern nach links
       -- genau der Sprung, den dieselbe Runde eine Spalte weiter abschafft. */
    nr: '583', name: 'Das × verschwindet mit seinem Platz statt nur mit seiner Farbe',
    datei: 'public/app.js',
    suche: "  z.className = 'rzurueck' + (value > 0 ? '' : ' leer');",
    ersatz: "  z.className = 'rzurueck'; if (!(value > 0)) z.hidden = true;",
    erwartet: "Die Sternzeile — 0.22.0"
  },
  {
    /* DAS × STEHT AN JEDER STERNREIHE, auch an denen ohne Ruecksetzer -- die
       Testtage und jede Lesestelle. Ein Kreuz, das nichts tut, ist schlimmer
       als keins. */
    nr: '584', name: 'Das × steht auch an einer Sternreihe ohne Ruecksetzer',
    datei: 'public/app.js',
    suche: "  w.addEventListener('click', e => { if (e.target.dataset.v) onPick(+e.target.dataset.v); });\n  return w;\n}",
    ersatz: "  w.addEventListener('click', e => { if (e.target.dataset.v) onPick(+e.target.dataset.v); });\n  w.appendChild(zuruecksetzKnopf(value, () => onPick(0)));\n  return w;\n}",
    erwartet: "Die Sternzeile — 0.22.0"
  },
  {
    /* DIE LEERE DURCHSCHNITTSZELLE IST WIEDER LEER. Der Strich faellt, und mit
       ihm die Auskunft „noch niemand". */
    nr: '585', name: 'Die leere Durchschnittszelle zeigt wieder gar nichts',
    datei: 'public/app.js',
    suche: "          a.textContent = '–';\n          a.title = t('eintrag.nochNichtBewertet');",
    ersatz: "          a.textContent = '';",
    erwartet: 'Die Sternzeile — 0.21.0'
  },
  {
    /* DIE MINDESTBREITE FAELLT WIEDER WEG. Solange niemand bewertet hat, ist
       die Spalte null Pixel breit, und der erste Stern laesst sie aufgehen --
       alle Sternzeilen rutschen nach links, unter dem Finger. */
    nr: '586', name: 'Die Durchschnittsspalte verliert ihre Mindestbreite wieder',
    datei: 'public/style.css',
    suche: '  min-width: calc(4.34rem + 9px);\n  display: flex; align-items: center; justify-content: flex-end;',
    ersatz: '  display: flex; align-items: center; justify-content: flex-end;',
    erwartet: 'Die Sternzeile — 0.21.0'
  },

  /* ---- 0.21.0: die Oberflaeche der beiden Kaesten ---- */
  {
    /* DER ZWEITE BLOCK STEHT HINTER DEM ERSTEN statt davor. Geschaetzt wird,
       BEVOR bewertet wird, und die Anordnung sagt es -- an einer neuen Idee
       stuende sonst der leere Bewertungskasten oben. */
    nr: '587', name: 'Der Potenzialblock steht hinter der Bewertung',
    datei: 'public/app.js',
    suche: "  seite: ['kategorie', 'tags', 'potenzial', 'bewertung'],",
    ersatz: "  seite: ['kategorie', 'tags', 'bewertung', 'potenzial'],",
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER ZEICHNER FILTERT NICHT MEHR. Beide Kaesten zeigten dann ALLE Zeilen
       -- dieselbe Sternzeile zweimal, in zwei Kaesten, mit zwei verschiedenen
       Kopfzahlen darueber. */
    nr: '588', name: 'Der Zeichner zeigt in beiden Kaesten alle Zeilen',
    datei: 'public/app.js',
    suche: '    const zeilen = item.ratings.filter(r => r.phase === kasten.phase);',
    ersatz: '    const zeilen = item.ratings;',
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER EINKLAPPZUSTAND FOLGT WIEDER DER EINSTELLUNG STATT DEM ZUSTAND.
       An einer neuen Idee stuende der Bewertungskasten offen und das Potenzial
       zu -- genau verkehrt herum. */
    nr: '589', name: 'Die Sternkaesten folgen wieder der gespeicherten Einstellung',
    datei: 'public/app.js',
    suche: '    const nachZustand = BLOECKE_OHNE_ZU.includes(name);',
    ersatz: '    const nachZustand = false;',
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* VORHANDENE DATEN SCHLAGEN DIE REGEL NICHT MEHR. Ein ungetesteter Eintrag
       aus alten Zeiten mit Bewertungssternen zeigte sie dann nicht -- etwas,
       das jemand eingetragen hat, waere versteckt. */
    nr: '590', name: 'Bewertungssterne an einem ungetesteten Eintrag bleiben zugeklappt',
    datei: 'public/app.js',
    suche: "  return !item.tested && !hatSterne(item, 'nachher');",
    ersatz: '  return !item.tested;',
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER KLICK AUF DEN KOPF SPEICHERT WIEDER. Damit gaelte ein Blick an EINEM
       Eintrag fuer ALLE, und beim naechsten Eintrag stuende der falsche Kasten
       offen -- ohne dass jemand wuesste, warum. */
    nr: '591', name: 'Ein Klick auf den Kastenkopf speichert wieder',
    datei: 'public/app.js',
    suche: '        if (BLICK.has(name)) BLICK.delete(name); else BLICK.add(name);',
    ersatz: "        BLOECKE.zu = zu ? BLOECKE.zu.filter(k => k !== name) : [...BLOECKE.zu, name];\n        speichereBloecke();",
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER SCHALTER LEERT DEN BLICK NICHT MEHR. Nach dem Umlegen von „Getestet"
       stuende der Kasten offen, den man vorher aufgeklappt hatte -- der Klick
       auf den Schalter saehe aus, als haette er nichts getan. */
    nr: '592', name: 'Der Schalter „Getestet" leert den Blick nicht mehr',
    datei: 'public/app.js',
    suche: '      BLICK.clear();\n      drawSwitches(); drawTestDays(); drawRatings();',
    ersatz: '      drawSwitches(); drawTestDays(); drawRatings();',
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER BLICK GILT UEBER EINTRAEGE HINWEG. Er ist dann doch eine
       Einstellung, nur eine, die niemand speichert -- die schlechteste
       Mischung aus beidem. */
    nr: '593', name: 'Der Blick ueberlebt den Wechsel des Eintrags',
    datei: 'public/app.js',
    suche: '  BLICK.clear();\n  /* DER BEGRIFF KOMMT AUS DER ADRESSE ODER AUS DEM ZUSTAND',
    ersatz: '  /* DER BEGRIFF KOMMT AUS DER ADRESSE ODER AUS DEM ZUSTAND',
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DIE KACHEL ZEIGT AN EINEM UNGETESTETEN EINTRAG WIEDER DIE BEWERTUNG.
       Damit stuende dort „★ –" statt „◆ 4,2", und das Sortieren nach Potenzial
       haette keine sichtbare Entsprechung. */
    nr: '594', name: 'Die Kachel zeigt an einer Idee wieder die Bewertung',
    datei: 'public/app.js',
    suche: '  const wert = potenzial ? it.potenzialRating : it.avgRating;',
    ersatz: '  const wert = it.avgRating;',
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DAS ZEICHEN IST WIEDER DER STERN. Dann hielte jemand 4,2 Potenzial fuer
       4,2 Qualitaet -- und die Kachel saehe an einer Idee genauso aus wie an
       einem geprueften Eintrag. */
    nr: '595', name: 'Das Potenzial traegt auf der Kachel wieder den Stern',
    datei: 'public/app.js',
    suche: "  const zeichen = potenzial ? '◆' : '★';",
    ersatz: "  const zeichen = '★';",
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DIE SORTIERUNG NACH POTENZIAL STELLT EINTRAEGE OHNE ZAHL NACH VORN.
       In der Richtung „niedrig → hoch" stuenden dann lauter Eintraege ohne
       Einschaetzung oben -- die Ansicht „Als Naechstes" waere unbrauchbar. */
    nr: '596', name: 'Eintraege ohne Potenzialzahl stehen in einer Richtung vorn',
    datei: 'public/app.js',
    suche: "      case 'potenzial_asc':  return (a.potenzialRating ?? 99) - (b.potenzialRating ?? 99);",
    ersatz: "      case 'potenzial_asc':  return (a.potenzialRating ?? 0) - (b.potenzialRating ?? 0);",
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DIE ZWEITE SYSTEMKARTE ZEIGT DIE KRITERIEN DES ANDEREN KASTENS. Beide
       Karten zeigten dann dieselbe Liste, und wer im Potenzialkasten anlegt,
       saehe sein Kriterium in beiden. */
    nr: '597', name: 'Die zweite Kriterienkarte filtert nicht nach Phase',
    datei: 'public/app.js',
    suche: "  verwaltungsListe(k.liste, geholt.crits.filter(c => c.phase === phase), 'crit', geholt);",
    ersatz: "  verwaltungsListe(k.liste, geholt.crits, 'crit', geholt);",
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DIE KARTE SCHICKT DIE PHASE NICHT MIT. Was in der Potenzialkarte
       angelegt wird, landete als Bewertungskriterium -- der Server hat die
       Vorgabe 'nachher'. */
    nr: '598', name: 'Die zweite Kriterienkarte legt im falschen Kasten an',
    datei: 'public/app.js',
    suche: "      try { await api('POST', '/api/criteria', { name, phase }); critFeld.value = '';",
    ersatz: "      try { await api('POST', '/api/criteria', { name }); critFeld.value = '';",
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DER VERGLEICH MISCHT DIE BEIDEN KAESTEN WIEDER. `eigenerSchnitt()`
       rechnete dann in der Stellung „meine" ueber beide Mengen -- die eine
       zweite Rechenstelle im Browser waere genau die, die es nicht geben
       darf. */
    nr: '599', name: 'Der eigene Schnitt im Vergleich mischt die Kaesten',
    datei: 'public/app.js',
    suche: "      if (r.phase !== phase) continue;",
    ersatz: "      if (false) continue;",
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },
  {
    /* DAS WORT KOMMT NICHT MEHR AUS DEM VOKABULAR. Wer „Erwartung" einstellt,
       saehe im Blockkopf weiter „Potenzial" -- das Wort stuende wieder im
       Quelltext. */
    nr: '600', name: 'Der Blockkopf traegt das Wort aus dem Quelltext',
    datei: 'public/app.js',
    suche: '<div class="block-head"><span class="label">${esc(V.potenzial)}</span>',
    ersatz: '<div class="block-head"><span class="label">Potenzial</span>',
    erwartet: 'Zwei Kaesten in der Oberflaeche — 0.21.0'
  },

  {
    /* DIE ZWEITE VORGABELISTE VERLIERT DAS NEUE WORT. `public/app.js` fuehrt
       eine eigene Vorgabe des Vokabulars -- damit die Oberflaeche schon VOR
       dem ersten Abruf beschriftet ist. Fehlt dort ein Wort, steht das Feld in
       der Vokabularkarte leer, solange der gespeicherte Satz es nicht nennt.
       GENAU DAS IST BEIM BAUEN VON 0.21.0 PASSIERT, und der Pruefstand hat es
       gefunden -- an der Lage mit dem unvollstaendigen eigenen Vokabular. */
    nr: '601', name: 'Die Vorgabe der Oberflaeche kennt das neue Wort nicht',
    datei: 'public/app.js',
    suche: "  aufgabeErledigt: 'Erledigt',\n  potenzial: 'Potenzial',",
    ersatz: "  aufgabeErledigt: 'Erledigt',",
    erwartet: 'Oberflaeche mit eigenem Vokabular'
  },
  {
    /* HIER HAENGT DIE ZENTRALE ZUSAGE DIESER RUNDE -- am SELECT und nicht am
       GROUP BY. Faellt `c.phase` aus der Spaltenliste, kommt die Schnittzeile
       ohne Phase an; karteJePhase() legt sie in KEINEN der beiden Kaesten
       (`kasten[undefined]` gibt es nicht), und beide Durchschnitte fallen auf
       null. Die Kachel zeigte dann an jedem Eintrag gar keine Zahl mehr.
       NACHGETRAGEN NACH DER GEGENPROBE: die Runde hatte fuer diese beiden
       Abfragen nur den Griff ans GROUP BY, und der ist am Verhalten stumm
       (Rueckbauten 570 und 571). Ein Rueckbau, der die Zusage wirklich
       herausnimmt, fehlte -- er steht jetzt hier. */
    nr: '602', name: 'Die gebuendelte Abfrage waehlt die Phase nicht mehr aus',
    datei: 'server.js',
    suche: '  SELECT r.item_id, r.criterion_id, AVG(r.value * 1.0) AS schnitt, COUNT(*) AS anzahl,\n' +
           '         c.gewicht, c.phase\n',
    ersatz: '  SELECT r.item_id, r.criterion_id, AVG(r.value * 1.0) AS schnitt, COUNT(*) AS anzahl,\n' +
            '         c.gewicht\n',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DASSELBE AN DER FASSUNG DES EINZELNEN EINTRAGS. Zwei Fassungen, zwei
       Rueckbauten: faellt nur einer, blieben Uebersicht und Detail
       verschiedener Meinung -- und ein Eintrag zeigte in der Liste zwei Zahlen
       und aufgeschlagen keine. */
    nr: '603', name: 'Die Abfrage des Eintrags waehlt die Phase nicht mehr aus',
    datei: 'server.js',
    suche: '  SELECT r.criterion_id, AVG(r.value * 1.0) AS schnitt, COUNT(*) AS anzahl,\n' +
           '         c.gewicht, c.phase\n',
    ersatz: '  SELECT r.criterion_id, AVG(r.value * 1.0) AS schnitt, COUNT(*) AS anzahl,\n' +
            '         c.gewicht\n',
    erwartet: 'Zwei Kaesten, zwei Durchschnitte — 0.21.0'
  },
  {
    /* DER TREIBER SIEHT NICHT MEHR NACH, OB FREMDE SERVER LAUFEN. Genau die
       Lage, aus der dieser Waechter entstanden ist: sieben Server aus
       abgebrochenen Laeufen an den Ports 6180 bis 6242, Spur 0 faehrt ohne
       Versatz dagegen, und die Tabelle zeigt einen stummen Rueckbau als
       greifenden. EINE FALSCHE TABELLE IST SCHLIMMER ALS GAR KEINE. */
    nr: '604', name: 'Der Treiber faehrt los, ohne nach fremden Servern zu sehen',
    datei: 'gegenprobe.js',
    suche: '  const fremde = fremdeServer();\n  if (fremde.length) {',
    ersatz: '  const fremde = [];\n  if (fremde.length) {',
    erwartet: 'Die Gegenproben greifen'
  },
  {
    /* UND DIE SUCHE SELBST FINDET NUR NOCH EINEN DER BEIDEN NAMEN. Ein
       liegengebliebener PRUEFLAUF belegt genauso Ports wie ein liegen-
       gebliebener Server -- er startet ja welche. */
    nr: '605', name: 'Die Suche nach fremden Servern kennt den Prueflauf nicht mehr',
    datei: 'gegenprobe.js',
    suche: "    const skript = teile.find(t => /(^|\\/)(server|pruefung)\\.js$/.test(t));",
    ersatz: "    const skript = teile.find(t => /(^|\\/)server\\.js$/.test(t));",
    erwartet: 'Die Gegenproben greifen'
  },

  /* ---- 0.21.1: die Sortierung gibt den Status vor ---- */
  {
    /* DIE TABELLE IST DIE GANZE ENTSCHEIDUNG. Ohne sie leitet keine Sortierung
       mehr etwas ab, und die Runde ist wirkungslos -- die Liste sieht
       aus wie vor 0.21.1. */
    nr: '606', name: 'Keine Sortierung gibt mehr einen Status vor',
    datei: 'public/app.js',
    suche: "const SORTIERUNG_STATUS = {\n" +
           "  rating_desc: 'tested',      rating_asc: 'tested',\n" +
           "  potenzial_desc: 'untested', potenzial_asc: 'untested'\n" +
           "};",
    ersatz: "const SORTIERUNG_STATUS = {};",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* NUR DIE HAELFTE DER TABELLE. Ohne diesen Rueckbau bliebe gruen, wer nur
       die Bewertungsseite baut -- die Potenzialseite ist die, aus der der
       Befund ueberhaupt kam. */
    nr: '607', name: 'Nur die Bewertung gibt vor, das Potenzial nicht mehr',
    datei: 'public/app.js',
    suche: "  potenzial_desc: 'untested', potenzial_asc: 'untested'\n",
    ersatz: "",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* UND DIE GEGENRICHTUNG: eine Sortierung, die ausdruecklich NICHT koppeln
       soll, koppelt doch. Ein Titel sagt nichts ueber den Teststatus. */
    nr: '608', name: 'Die Titelsortierung koppelt mit',
    datei: 'public/app.js',
    suche: "const SORTIERUNG_STATUS = {\n",
    ersatz: "const SORTIERUNG_STATUS = {\n  title_asc: 'tested',\n",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE VERLAUFSSORTIERUNGEN SIND AUSDRUECKLICH DRAUSSEN (Abschnitt 5 des
       Auftrags). Sie setzen „getestet" logisch genauso voraus, sind aber eine
       eigene Gruppe im Auswahlfeld -- diese Runde fasst zwei Gruppen an, nicht
       drei. Ohne diesen Rueckbau waere das eine Behauptung im Kommentar. */
    nr: '609', name: 'Die Verlaufssortierungen koppeln mit',
    datei: 'public/app.js',
    suche: "const SORTIERUNG_STATUS = {\n  rating_desc:",
    ersatz: "const SORTIERUNG_STATUS = {\n  testavg_desc: 'tested', testavg_asc: 'tested',\n  tests_desc: 'tested', tests_asc: 'tested',\n  rating_desc:",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE LISTE LIEST WIEDER UNMITTELBAR DIE GEWAEHLTE STELLUNG. Die eine
       Lesestelle faellt damit weg, und die ganze Ableitung wirkt nirgends
       mehr -- der groesste Rueckbau dieser Runde. */
    nr: '610', name: 'Die Liste liest die Ableitung nicht mehr',
    datei: 'public/app.js',
    suche: "  const status = statusWirksam(f);",
    ersatz: "  const status = f.tested;",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE HANDWAHL WIRD NICHT MEHR GEMERKT. Der Klick stellt zwar `tested`,
       aber die Ableitung schlaegt ihn beim naechsten Zeichnen sofort wieder --
       genau der Kreis, aus dem niemand mehr herauskaeme (Stolperstein 312). */
    nr: '611', name: 'Ein Klick auf eine Statuspille gilt nicht mehr als Handwahl',
    datei: 'public/app.js',
    suche: "    b.onclick = () => { f.tested = v; STATUS_VON_HAND = true; redraw(); };",
    ersatz: "    b.onclick = () => { f.tested = v; redraw(); };",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE RANGORDNUNG KIPPT: die Ableitung fragt nicht mehr, ob jemand
       gewaehlt hat, und schlaegt damit JEDE ausdrueckliche Wahl -- die
       Handwahl, die gespeicherte Ansicht und den Ruecksetzer zugleich. */
    nr: '612', name: 'Die Ableitung schlaegt die Handwahl statt umgekehrt',
    datei: 'public/app.js',
    suche: "const statusAusSortierung = (sort) => STATUS_VON_HAND ? null : vorgabeZu(sort);",
    ersatz: "const statusAusSortierung = (sort) => vorgabeZu(sort);",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE ABLEITUNG SCHREIBT SICH IN state.filters -- der Rueckbau, den der
       Auftrag ausdruecklich verlangt. Er macht aus einem Blick eine
       Einstellung: was hier hineinlaeuft, faehrt durch saveFilters() an
       PUT /api/settings hinaus, und nach dem Neuladen stuende ein Filter da,
       den niemand gesetzt hat (Stolperstein 304 von der anderen Seite).
       ER MUSS ROT WERDEN, sonst ist Regel 3 nicht baulich, sondern behauptet. */
    nr: '613', name: 'Die Ableitung wird mitgespeichert',
    datei: 'public/app.js',
    suche: "  sel.onchange = () => { f.sort = sel.value; redraw(); };",
    ersatz: "  sel.onchange = () => { f.sort = sel.value;\n" +
            "    f.tested = statusAusSortierung(sel.value) || f.tested; redraw(); };",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE LEISTE WIRD BEIM WECHSEL DER SORTIERUNG NICHT MEHR MITGEZEICHNET --
       der Stand vor 0.21.1, als eine Sortierung nur ordnete. Die Liste zeigt
       dann schon die neue Menge, waehrend die Pillen darueber die alte
       Stellung behaupten. */
    nr: '614', name: 'Der Wechsel der Sortierung zeichnet nur noch die Liste',
    datei: 'public/app.js',
    suche: "  sel.onchange = () => { f.sort = sel.value; redraw(); };",
    ersatz: "  sel.onchange = () => { f.sort = sel.value; saveFilters(); drawBody(); };",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* EINE GESPEICHERTE ANSICHT IST KEINE AUSDRUECKLICHE WAHL MEHR. Wer
       „Potenzial" und „alles anzeigen" zusammen gespeichert hat, bekommt sie
       nicht mehr zurueck -- und genau das darf ein PATCH nicht tun. */
    nr: '615', name: 'Eine gespeicherte Ansicht schlaegt die Ableitung nicht mehr',
    datei: 'public/app.js',
    suche: "  STATUS_VON_HAND = true;\n  state.search = typeof a.q === 'string' ? a.q : '';",
    ersatz: "  state.search = typeof a.q === 'string' ? a.q : '';",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DER WEG ZURUECK IN DIE AUTOMATIK FAELLT WEG. Der Ruecksetzer raeumt die
       Filter, aber die Handwahl bleibt stehen -- und es gibt keinen zweiten
       Weg heraus. */
    nr: '616', name: 'Der Ruecksetzer stellt die Automatik nicht wieder her',
    datei: 'public/app.js',
    suche: "      STATUS_VON_HAND = false;\n      redraw();",
    ersatz: "      redraw();",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DAS WORT FAELLT WEG. Ein unsichtbarer Automatismus ist ein Fehler, auch
       wenn er richtig raet -- niemand erfuehre, warum die Liste kuerzer ist. */
    nr: '617', name: 'Neben den Statuspillen steht nicht mehr, woher sie kommen',
    datei: 'public/app.js',
    suche: "  if (vorgabe) {\n    const woher = zweiteBeschriftung(r1, t('liste.folgtDerSortierung'));",
    ersatz: "  if (false) {\n    const woher = zweiteBeschriftung(r1, t('liste.folgtDerSortierung'));",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE ABGELEITETE PILLE SIEHT AUS WIE EINE ANGEKLICKTE. Sie behauptet
       damit eine Einstellung, die niemand vorgenommen hat. */
    nr: '618', name: 'Die abgeleitete Pille zeichnet sich wie eine gewaehlte',
    datei: 'public/app.js',
    suche: "    b.className = 'pill' + (vorgabe ? (vorgabe === v ? ' pill-abgeleitet' : '')\n" +
           "                                    : (f.tested === v ? ' on' : ''));",
    ersatz: "    b.className = 'pill' + ((vorgabe ? vorgabe === v : f.tested === v) ? ' on' : '');",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* UND DASSELBE AM STILBLATT: die Klasse steht noch da, aber sie sieht aus
       wie die gewaehlte. Ein Unterschied, der nur im Markup steht und nicht am
       Bildschirm, ist keiner. */
    nr: '619', name: 'Das Stilblatt gibt der abgeleiteten Pille den Fuellgrund der gewaehlten',
    datei: 'public/style.css',
    suche: "  border-color: var(--accent); border-style: dashed;",
    ersatz: "  border-color: var(--accent); background: var(--accent);",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* DIE ABLEITUNG ZAEHLT WIEDER ALS GESETZTER FILTER -- die andere Haelfte
       der Entscheidung aus Abschnitt 2. Der Ruecksetzer stuende dann auch ohne
       gesetzten Filter da, und ein Druck darauf stellte die Ableitung gerade
       wieder her: derselbe Knopf mit derselben Zahl. */
    nr: '620', name: 'Die Ableitung zaehlt als gesetzter Filter mit',
    datei: 'public/app.js',
    suche: "  if (statusWirksam(f) !== statusRuhestellung(f)) n++;",
    ersatz: "  if (statusWirksam(f) !== statusRuhestellung(f)) n++;\n" +
            "  if (statusAusSortierung(f.sort)) n++;",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
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
    nr: '623', name: 'Die Vorgabetabelle wird ohne Ruecksicht auf den Prototyp gefragt',
    datei: 'public/app.js',
    suche: "  Object.prototype.hasOwnProperty.call(SORTIERUNG_STATUS, sort)\n" +
           "    ? SORTIERUNG_STATUS[sort] : null;",
    ersatz: "  SORTIERUNG_STATUS[sort] || null;",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    nr: '622', name: 'Die Ruhestellung der Statuszeile ist wieder fest „alles"',
    datei: 'public/app.js',
    suche: "  if (statusWirksam(f) !== statusRuhestellung(f)) n++;",
    ersatz: "  if (f.tested !== v.tested) n++;",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },
  {
    /* UND DER EINGEKLAPPTE SCHALTER SCHWEIGT. Er ist der einzige Ort, der fuer
       die zugeklappte Leiste noch spricht -- ohne ihn stuende die Ableitung
       genau dann nirgends dran, wenn man sie am wenigsten sieht. */
    nr: '621', name: 'Der eingeklappte Filterschalter sagt nichts von der Ableitung',
    datei: 'public/app.js',
    suche: "  const woher = statusAusSortierung(state.filters.sort) ? t('liste.folgtDerSortierung') : '';",
    ersatz: "  const woher = '';",
    erwartet: 'Die Sortierung gibt den Status vor — 0.21.1'
  },

  /* ---- Der Pruefstand ueber sich selbst ---- */
  {
    /* DIE DATEILISTE DES SPRACHWAECHTERS VERLIERT DIE BEIDEN NEUEN DATEIEN --
       0.19.3. Sie ist eine gepflegte Liste und keine abgeleitete; wer eine
       Quelltextdatei anlegt und sie hier vergisst, bekommt einen Waechter, der
       ueber sie schweigt. GENAU DAS IST IN DIESER RUNDE PASSIERT: in
       bestandslauf.js stand ein Wort aus der Sperrliste, und niemand sah es. */
    nr: 'W14', name: 'Die Dateiliste des Sprachwaechters verliert die neuen Dateien',
    datei: 'pruefung.js',
    suche: "                          'bilder.js', 'bestandslauf.js'];",
    ersatz: "                          ];",
    erwartet: 'Der Sprachwaechter'
  },
  {
    /* DIE SPRACHLISTE VERLIERT IHREN DREIZEHNTEN EINTRAG -- 0.19.1 hat ihn
       eingetragen, weil das Wort in dieser Runde gefallen ist und 0.19.2 voll
       davon sein wird. Ein Waechter, dem ein Wort fehlt, sieht aus wie einer,
       der nichts zu beanstanden hat. */
    nr: 'W13', name: 'Die Sprachliste verliert ihren juengsten Eintrag',
    datei: 'pruefung.js',
    suche: "    ['Faden', 'Thread']\n  ];",
    ersatz: "  ];",
    erwartet: 'Der Sprachwaechter'
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
    datei: 'public/style.css',
    suche: ".masthead.gerollt { box-shadow: var(--sh-sm); }",
    ersatz: ".masthead.gerollt { box-shadow: var(--sh-sm); backdrop-filter: blur(10px); }",
    erwartet: 'Kein Milchglas im Stilblatt — 0.22.0'
  },
  {
    // Ein Bildschirmtext traegt wieder ein Wort der Verbotsliste (Konzept 4.3).
    nr: '625', name: 'Die Glocke sagt wieder „Blick"',
    datei: 'public/app.js',
    suche: "    : t('liste.keineNeuigkeiten'));",
    ersatz: "    : 'Nichts Neues seit deinem letzten Blick');",
    erwartet: 'Der Bildschirmtext-Waechter — 0.22.0'
  },
  {
    // Eine Servermeldung nennt wieder den Spaltenwert „Kasten".
    nr: '626', name: 'Die Servermeldung zur Phase eines Kriteriums sagt wieder „Kasten"',
    datei: 'public/sprachen/de.json',
    suche: "\"server.kriteriumEntwederOder\": \"Ein Kriterium gehört entweder zu „{potenzial}“ oder zu „{bewertungEinzahl}“.\",",
    ersatz: "\"server.kriteriumEntwederOder\": \"Der Kasten muss „{potenzial}“ oder „{bewertungEinzahl}“ sein.\",",
    erwartet: 'Der Bildschirmtext-Waechter — 0.22.0'
  },
  {
    // Ein rohes Browserfenster kehrt zurueck -- confirm() statt confirmBox().
    nr: '627', name: 'Das Beenden der anderen Sitzungen fragt wieder ueber confirm()',
    datei: 'public/app.js',
    suche: "      if (!await confirmBox('Alle anderen Sitzungen beenden?', 'Diese Sitzung bleibt bestehen.', 'Beenden')) return;",
    ersatz: "      if (!confirm('Alle anderen Sitzungen beenden?')) return;",
    erwartet: 'Keine Browserfenster mehr — 0.22.0'
  },
  {
    /* DER SERVER-BEFEHL STEHT WIEDER IM FLIESSTEXT -- vor den Augen jedes
       Benutzers, wie bis 0.21.1 an den Wiederherstellungscodes (Stolperstein
       315). Gezaehlt wird, nicht gesucht: die Zeile traegt kein serverKasten(. */
    nr: '628', name: 'Ein Server-Befehl steht wieder im Fliesstext der Karte Mein Konto',
    datei: 'public/app.js',
    suche: "          Passwort vergessen? Ein Admin kann einen Link zum Zurücksetzen erzeugen.</p>",
    ersatz: "          Passwort vergessen? Auf dem Server hilft <code>docker compose exec kriterion node zugang.js passwort &lt;name&gt;</code>.</p>",
    erwartet: 'Server-Befehle nur im Kasten — 0.22.0'
  },
  {
    // Der Kasten wird zu einem fuenften Aufruf, den niemand gezaehlt hat.
    nr: '629', name: 'Ein fuenfter Kasten „Auf dem Server" kommt an die Karte Sicherung',
    datei: 'public/app.js',
    suche: "        <div id=\"sicherung-box\"></div>\n      </div>`;",
    ersatz: "        <div id=\"sicherung-box\"></div>\n        ${serverKasten('Die Sicherung von Hand:', 'docker compose exec kriterion node sicherung.js')}\n      </div>`;",
    erwartet: 'Server-Befehle nur im Kasten — 0.22.0'
  },
  {
    // prompt() kehrt zurueck: das fremde Passwort stuende wieder im Klartext.
    nr: '630', name: 'Das fremde Passwort wird wieder ueber prompt() abgefragt',
    datei: 'public/app.js',
    suche: "          const neu = await neuesPasswortFenster(`Passwort für „${z.username}“ setzen`,",
    ersatz: "          const neu = prompt(`Passwort für „${z.username}“ setzen`,",
    erwartet: 'Keine Browserfenster mehr — 0.22.0'
  },
  {
    // Die Schranke der Stufen lockert sich: 90 ginge durch.
    nr: '631', name: 'Der Bildstreifen laesst eine ungueltige Stufe durch',
    datei: 'server.js',
    suche: "    if (!STREIFEN_STUFEN.includes(n))",
    ersatz: "    if (!Number.isFinite(n))",
    erwartet: 'Die Einstellung streifen — 0.22.0'
  },
  {
    // Die Vorgabe vergisst eines der zwei neuen Woerter -- dreizehn statt vierzehn.
    nr: '632', name: 'Die Vorgabe des Vokabulars vergisst die Mehrzahl der Bewertung',
    datei: 'public/sprachen/de.json',
    suche: "\"vokabular.bewertungMehrzahl\": \"Bewertungen\",",
    ersatz: "\"vokabular.bewertungMehrzahl\": \"\",",
    erwartet: 'Einstellungen: Vokabular und Schriftgroesse'
  },
  {
    /* DER KNOPF RUTSCHT IN DIE ZELLE DER STERNE -- dorthin, wo er bis 0.21.1
       als × stand. Die Zeile hat dann drei Zellen statt vier, und der Befund
       aus dem Betrieb waere nicht behoben. */
    nr: '633', name: 'Der Ruecksetzknopf steht wieder in der Sternzelle statt in seiner eigenen Spalte',
    datei: 'public/app.js',
    suche: "      const zz = document.createElement('span');\n      zz.className = 'rzz';\n      zz.appendChild(zurueck);\n      row.append(zz);",
    ersatz: "      acts.appendChild(zurueck);",
    erwartet: 'Die Sternzeile — 0.22.0'
  },
  {
    // „Rückgängig" schreibt nicht den alten Wert zurueck, sondern noch einmal die Null.
    nr: '634', name: 'Rueckgaengig schreibt die Null statt des alten Werts',
    datei: 'public/app.js',
    suche: "        toast(t('eintrag.sterneBeiEntfernt', { name: r.name }), false, { text: t('eintrag.rueckgaengig'), tu: () => set(alt) });",
    ersatz: "        toast(t('eintrag.sterneBeiEntfernt', { name: r.name }), false, { text: t('eintrag.rueckgaengig'), tu: () => set(0) });",
    erwartet: 'Die Sternzeile — 0.22.0'
  },
  {
    // Bei einem einzigen Zugang stuende der Knopf wieder dicht an den Sternen.
    nr: '635', name: 'Die Zelle des Ruecksetzknopfs verliert ihren Abstand',
    datei: 'public/style.css',
    suche: ".rrow .rzz { display: flex; align-items: center; justify-content: flex-end; padding-left: 12px; }",
    ersatz: ".rrow .rzz { display: flex; align-items: center; justify-content: flex-end; padding-left: 4px; }",
    erwartet: 'Die Sternzeile — 0.22.0'
  },
  {
    /* EIN FILTER, DER GREIFT UND UNSICHTBAR IST, IST EIN FEHLER: die Tagzeile
       bliebe beim Aufbau zu, obwohl ein Tag die Liste kuerzt.
       MITGEZOGEN, NICHT GELOESCHT -- 0.24.0 (Stolperstein 201): der Aufklapper
       ist ein Knopf geworden, die Regel dahinter ist dieselbe geblieben. */
    nr: '636', name: 'Die Tagzeile bleibt bei greifendem Tagfilter zugeklappt',
    datei: 'public/app.js',
    suche: "    (WEITERE_FILTER_OFFEN === null ? f.tagIds.length > 0 : WEITERE_FILTER_OFFEN);",
    ersatz: "    (WEITERE_FILTER_OFFEN === null ? false : WEITERE_FILTER_OFFEN);",
    erwartet: 'Der Umschalter der Tagzeile — 0.24.0'
  },
  {
    // filterZahl() vergisst die Tags hinter dem Umschalter.
    nr: '637', name: 'filterZahl() zaehlt die Tags hinter dem Umschalter nicht mehr',
    datei: 'public/app.js',
    suche: "  n += f.tagIds.length;",
    ersatz: "  n += 0;",
    erwartet: 'Der Umschalter der Tagzeile — 0.24.0'
  },
  {
    /* DER UMSCHALTER BELEGT WIEDER EINE EIGENE ZEILE -- 0.24.0. Genau das war
       der Befund: er kostete den Platz, den er sparen sollte. */
    nr: '658', name: 'Der Umschalter der Tagzeile steht nicht in der Kategoriezeile',
    datei: 'public/app.js',
    suche: "    r2.appendChild(rechts2);",
    ersatz: "    box.appendChild(rechts2);",
    erwartet: 'Der Umschalter der Tagzeile — 0.24.0'
  },
  {
    /* ZUGEKLAPPT WAERE DIE ZEILE NUR VERBORGEN UND NICHT FORT -- sie kostete
       den Platz weiter, und der Befund waere nur zur Haelfte behoben. */
    nr: '659', name: 'Die Tagzeile wird zugeklappt gebaut statt weggelassen',
    datei: 'public/app.js',
    suche: "  if (tagsOffen) {\n    const r3 = row(t('liste.tags2'));",
    ersatz: "  if (true) {\n    const r3 = row(t('liste.tags2'));",
    erwartet: 'Der Umschalter der Tagzeile — 0.24.0'
  },
  {
    /* EIN UMSCHALTER FUER EINE LEERE ZEILE -- die zweite Haelfte des Befundes
       vom 5. September 2026. */
    nr: '660', name: 'Der Umschalter steht auch da, wenn kein Tag dahinter ist',
    datei: 'public/app.js',
    suche: "  const tagsMoeglich = filterTags.length > 0 || f.tagIds.length > 0;",
    ersatz: "  const tagsMoeglich = true;",
    erwartet: 'Der Umschalter der Tagzeile — 0.24.0'
  },
  {
    /* EIN LITERAL ZURUECK HINTER `error:` -- genau das, was Bauabschnitt 2
       ueberall entfernt hat. */
    nr: '675', name: 'Eine Servermeldung steht wieder als Satz im Quelltext',
    datei: 'server.js',
    suche: "  if (!title) return res.status(400).json({ error: t(spracheVon(req), 'server.titelFehlt')});",
    ersatz: "  if (!title) return res.status(400).json({ error: 'Bitte einen Titel eingeben.' });",
    erwartet: 'Der Bildschirmtext-Waechter'
  },
  {
    /* EIN DEUTSCHER SATZ ZURUECK IN `throw new Error` IN auth.js -- der blinde
       Fleck des Waechters, den diese Runde geschlossen hat. */
    nr: '676', name: 'auth.js wirft wieder einen deutschen Satz',
    datei: 'auth.js',
    suche: "  if (!ROLLEN.includes(rolle)) throw new Meldung('anmeldung.rolleFehlt');\n  const sauber = String(name).trim();",
    ersatz: "  if (!ROLLEN.includes(rolle)) throw new Error('Diese Rolle gibt es nicht.');\n  const sauber = String(name).trim();",
    erwartet: 'Der Bildschirmtext-Waechter'
  },
  {
    /* EIN PROGRAMMIERFEHLER OHNE BILDSCHIRM VERSCHWINDET. Die Liste ist
       namentlich -- eine Zahl allein liesse offen, welche gemeint sind. */
    nr: '677', name: 'Ein Programmierfehler ohne Bildschirm faellt weg',
    datei: 'auth.js',
    suche: "    throw new Error('Eine Sitzung braucht einen Benutzer.');",
    ersatz: "    return null;",
    erwartet: 'Der Bildschirmtext-Waechter'
  },
  {
    /* EINE DER VIER ALTLASTEN VERSCHWINDET AUS DER DATEI, ohne dass jemand die
       Liste im Pruefstand nachzieht. */
    nr: '678', name: 'Eine benannte Altlast verschwindet aus der Sprachdatei',
    datei: 'public/sprachen/de.json',
    suche: '  "anmeldung.keinZugang": "Es ist noch kein Zugang eingerichtet.",',
    ersatz: '  "anmeldung.keinZugangX": "Es ist noch kein Zugang eingerichtet.",',
    erwartet: 'Der Bildschirmtext-Waechter'
  },
  {
    /* UND DIE ANDERE RICHTUNG: eine Altlast wird richtiggestellt, bleibt aber
       auf der Liste stehen. Dann fuehrt die Liste eine Ausnahme fuer nichts. */
    nr: '679', name: 'Eine Altlast ist behoben und steht doch noch auf der Liste',
    datei: 'public/sprachen/de.json',
    suche: '  "server.verweigertSelbstZugang": "Den eigenen Zugang ändert man unter „Zugang“, nicht hier.",',
    ersatz: '  "server.verweigertSelbstZugang": "Das eigene Konto ändert man an anderer Stelle.",',
    erwartet: 'Der Bildschirmtext-Waechter'
  },
  {
    /* DER UEBERSETZER WIRD mail.js NICHT MEHR GEREICHT -- jeder Brief stuende
       dann als Klammerausdruck da, und der Link waere fort. */
    nr: '680', name: 'mail.js bekommt den Uebersetzer nicht mehr gereicht',
    datei: 'server.js',
    suche: "mail.setzeUebersetzer(t);",
    ersatz: "void mail.setzeUebersetzer;",
    erwartet: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* UND auth.js EBENSO WENIG -- die zwei Antworten von requireAuth() stuenden
       als Klammerausdruck da. */
    nr: '681', name: 'auth.js bekommt den Uebersetzer nicht mehr gereicht',
    datei: 'server.js',
    suche: "auth.setzeUebersetzer((req, schluessel, werte) => t(spracheVon(req), schluessel, werte));",
    ersatz: "void auth.setzeUebersetzer;",
    erwartet: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* DIE VORGABE DES VOKABULARS KOMMT WIEDER AUS DEM QUELLTEXT -- Stolperstein
       47 in seiner urspruenglichen Form: doppelt gehaltene Vorgaben pruefen
       sich nur halb. */
    nr: '682', name: 'Die Vokabelvorgaben stehen wieder im Quelltext',
    datei: 'server.js',
    suche: "const vokabularVorgabe = () => Object.fromEntries(\n  Object.entries(SPRACHEN[SPRACH_VORGABE])",
    ersatz: "const VOKABULAR_VORGABE = { sacheEinzahl: 'Eintrag' };\nconst vokabularVorgabe = () => Object.fromEntries(\n  Object.entries(SPRACHEN[SPRACH_VORGABE])",
    erwartet: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* EINE BETREFFZEILE ZURUECK IN server.js -- der Text gehoert zur Sache, und
       zwei Ausfertigungen liefen auseinander. */
    nr: '683', name: 'Der Betreff eines Briefes verliert seinen Platzhalter',
    datei: 'public/sprachen/de.json',
    suche: '  "mail.einladung.betreff": "Dein Zugang zu „{titel}“",',
    ersatz: '  "mail.einladung.betreff": "Dein Zugang",',
    erwartet: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* DIE TESTMAIL BEKOMMT EINEN LINK, DEN SIE NICHT HAT. */
    nr: '684', name: 'Die Testmail traegt ploetzlich einen Link',
    datei: 'public/sprachen/de.json',
    suche: 'das ist die Testmail aus „{titel}“.',
    ersatz: 'das ist die Testmail aus „{titel}“: {link}',
    erwartet: 'Die Serverseite spricht aus der Datei — 0.24.0'
  },
  {
    /* OHNE _locale GAEBE ES WEDER DATUM NOCH MEHRZAHL -- und die Ladung im
       Browser bricht ab, statt eine halbe Sprache zu nehmen. */
    nr: '665', name: 'Die Sprachdatei verliert ihren Kopf _locale',
    datei: 'public/sprachen/de.json',
    suche: '  "_locale": "de-DE",',
    ersatz: '  "_hinweis": "de-DE",',
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* EIN WERT MIT SPITZER KLAMMER. Der Helfer maskiert den TEXT ausdruecklich
       nicht -- er kommt aus der Datei und traegt kein HTML. Traegt er doch
       eines, faellt genau diese Zusage. */
    nr: '666', name: 'Ein Wert der Sprachdatei traegt eine spitze Klammer',
    datei: 'public/sprachen/de.json',
    suche: '"server.fehlerUnbekannt": "Unbekannter Fehler"',
    ersatz: '"server.fehlerUnbekannt": "<b>Unbekannter Fehler</b>"',
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* tH() MASKIERT NICHT MEHR -- Stolperstein 18 waere damit wieder offen:
       ein Vokabelwort des Admins liefe roh in innerHTML. */
    nr: '667', name: 'tH() maskiert die eingesetzten Werte nicht mehr',
    datei: 'public/app.js',
    suche: "    return maskieren ? esc(String(wert)) : String(wert);",
    ersatz: "    return String(wert);",
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* EIN UNBEKANNTER PLATZHALTER WIRD GELEERT STATT STEHENZUBLEIBEN. Ein
       leerer Fleck ist kein Fund -- `{sache}` am Bildschirm ist einer. */
    nr: '668', name: 'Ein unbekannter Platzhalter verschwindet still',
    datei: 'public/app.js',
    suche: "    if (wert === undefined) return ganz;",
    ersatz: "    if (wert === undefined) return '';",
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DIE MEHRZAHL WAEHLT WIEDER `n === 1` STATT Intl.PluralRules. Auf Deutsch
       faellt beides zusammen -- die Regel steht trotzdem falsch da, und die
       naechste Sprache bricht daran. */
    nr: '669', name: 'Die Mehrzahl waehlt wieder ueber n === 1',
    datei: 'public/app.js',
    suche: "  return PLURAL.select(werte.n) === 'one' ? roh.eins : roh.andere;",
    ersatz: "  return werte.n === 1 ? roh.eins : roh.andere;",
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DER RUECKFALL AUF DEUTSCH FAELLT WEG. In dieser Runde ist er leer -- und
       genau deshalb muss er belegt sein, sonst faellt sein Wegfall erst in
       Stufe 2 auf, wo er gebraucht wird. */
    nr: '670', name: 'Der Rueckfall auf Deutsch faellt weg',
    datei: 'public/app.js',
    suche: "  const roh = TEXTE[schluessel] !== undefined ? TEXTE[schluessel] : TEXTE_DE[schluessel];",
    ersatz: "  const roh = TEXTE[schluessel];",
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* boot() ZEICHNET WEITER, OBWOHL DIE SPRACHDATEI FEHLT -- die Oberflaeche
       stuende dann voller Klammern da (Entscheidung A1). */
    nr: '671', name: 'boot() haelt bei fehlender Sprachdatei nicht an',
    datei: 'public/app.js',
    suche: "    app.textContent = 'Die Sprachdatei fehlt.';\n    return;",
    ersatz: "    app.textContent = 'Die Sprachdatei fehlt.';",
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DER SERVER STARTET AUCH OHNE de.json. Eine Installation ohne Sprache ist
       keine -- jede Meldung stuende als Klammerausdruck da. */
    nr: '672', name: 'Der Server startet auch ohne de.json',
    datei: 'server.js',
    suche: "  if (!raus.de) throw new Error(",
    ersatz: "  if (false) throw new Error(",
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* api() SCHREIBT SEINEN RUECKFALLSATZ WIEDER IN DEN QUELLTEXT. */
    nr: '673', name: 'api() traegt seinen Rueckfallsatz wieder im Quelltext',
    datei: 'public/app.js',
    suche: "    let m = t('fehler.serverStatus', { status: res.status });",
    ersatz: "    let m = `Der Server meldet einen Fehler (${res.status}).`;",
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DER FEHLER-HANDLER SAGT SEINEN SATZ WIEDER SELBST. */
    nr: '674', name: 'Der Fehler-Handler traegt seinen Satz wieder im Quelltext',
    datei: 'server.js',
    suche: "  if (rang >= 500) return res.status(500).json({ error: t(sprache, 'server.fehlerAllgemein') });",
    ersatz: "  if (rang >= 500) return res.status(500).json({ error: 'Auf dem Server ist ein Fehler aufgetreten.' });",
    erwartet: 'Der Sprachhelfer und die Ladung — 0.24.0'
  },
  {
    /* DIE HILFSLINIE DER ZEITLEISTE FAELLT ZURUECK AUF DIE ALLGEMEINE
       RANDFARBE -- 1,02 : 1 gegen den hellen Grund, also unsichtbar. */
    nr: '661', name: 'Die Hilfslinie der Zeitleiste ist im hellen Schema wieder unsichtbar',
    datei: 'public/style.css',
    suche: "  --zl-linie: var(--line-hover);",
    ersatz: "  --zl-linie: var(--line-2);",
    erwartet: 'Die Zeitleiste im hellen Schema — 0.24.0'
  },
  {
    /* UND DIE JAHRESZAHL WIRD WIEDER --faint: 3,46 : 1 bei 0,63 rem
       Festbreite, und das Farbkonzept sagt, dass --faint nie tragender Text
       ist. */
    nr: '662', name: 'Die Jahreszahl der Zeitleiste faellt unter die Latte fuer Text',
    datei: 'public/style.css',
    suche: "  --zl-jahr: var(--muted);",
    ersatz: "  --zl-jahr: var(--faint);",
    erwartet: 'Die Zeitleiste im hellen Schema — 0.24.0'
  },
  {
    /* DAS DUNKLE SCHEMA AENDERT EINEN BILDPUNKT -- und genau das darf es
       nicht. Die Regel steht in jedem Auftrag seit 0.23.0. */
    nr: '663', name: 'Das dunkle Schema bekommt einen anderen Wert fuer die Zeitleiste',
    datei: 'public/style.css',
    suche: "  --zl-mitte: var(--line);\n  --zl-jahr: var(--faint);",
    ersatz: "  --zl-mitte: var(--line-hover);\n  --zl-jahr: var(--faint);",
    erwartet: 'Die Zeitleiste im hellen Schema — 0.24.0'
  },
  {
    /* DIE REGEL LIEST WIEDER DIE ALLGEMEINE RANDFARBE. Die Variable stuende
       tadellos da und faerbte nichts. */
    nr: '664', name: 'Die Hilfslinie liest die allgemeine Randfarbe statt ihrer eigenen',
    datei: 'public/style.css',
    suche: ".zl-linie { position: absolute; left: 0; right: 0; height: 1px; background: var(--zl-linie); }",
    ersatz: ".zl-linie { position: absolute; left: 0; right: 0; height: 1px; background: var(--line-2); }",
    erwartet: 'Die Zeitleiste im hellen Schema — 0.24.0'
  },
  {
    // Der Loeschknopf steht wieder fuer jeden -- die Fehlermeldung auf Vorrat (E10).
    nr: '638', name: 'Der Knopf „Eintrag löschen" steht wieder fuer jede Rolle',
    datei: 'public/app.js',
    suche: "    ${item.mine === true || ADMIN\n      ? `<div class=\"danger-row\">",
    ersatz: "    ${true\n      ? `<div class=\"danger-row\">",
    erwartet: 'Die Rollenweichen — 0.22.0'
  },
  {
    // Der Klartextschluessel steht wieder vor jedem Admin (E13).
    nr: '639', name: 'Der Klartextschluessel steht wieder vor dem Admin',
    datei: 'public/app.js',
    suche: "          : (EIGENTUEMER\n            ? `<div class=\"warn-box\"><strong>Der Schlüssel liegt neben der Datenbank</strong>",
    ersatz: "          : (ADMIN\n            ? `<div class=\"warn-box\"><strong>Der Schlüssel liegt neben der Datenbank</strong>",
    erwartet: 'Die Rollenweichen — 0.22.0'
  },
  {
    // Der Benutzer liest an „Kategorien" wieder, wie man umbenennt und loescht.
    nr: '640', name: 'Die Karte Kategorien erklaert dem Benutzer wieder die Werkzeuge des Admins',
    datei: 'public/app.js',
    suche: "        <p class=\"desc\">${ADMIN\n          ? `Umbenennen oder löschen. Beim Löschen bleiben die ${esc(V.sacheMehrzahl)} erhalten und",
    ersatz: "        <p class=\"desc\">${true\n          ? `Umbenennen oder löschen. Beim Löschen bleiben die ${esc(V.sacheMehrzahl)} erhalten und",
    erwartet: 'Die Rollenweichen — 0.22.0'
  },
  {
    /* „ABBRECHEN" BRICHT NICHT AB (Stolperstein 316): der Nein-Knopf des
       Loeschfensters liefert die Stellung der Haekchen wie der Ja-Knopf. */
    nr: '641', name: 'Abbrechen im Loeschfenster fuer einen Benutzer bricht nicht ab',
    datei: 'public/app.js',
    suche: "    bd.querySelector('[data-no]').onclick = () => done(null);\n    bd.querySelector('[data-yes]').onclick = nimm;\n    bd.onclick = e => { if (e.target === bd) done(null); };\n    const onKey = e => { if (e.key === 'Escape') done(null); };",
    ersatz: "    bd.querySelector('[data-no]').onclick = nimm;\n    bd.querySelector('[data-yes]').onclick = nimm;\n    bd.onclick = e => { if (e.target === bd) done(null); };\n    const onKey = e => { if (e.key === 'Escape') done(null); };",
    erwartet: 'Keine Browserfenster mehr — 0.22.0'
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
    datei: 'public/app.js',
    suche: "const GRIFF = 12;",
    ersatz: "const GRIFF = 0;",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DIE KANTE GEWINNT GEGEN DIE ECKE -- die Reihenfolge der vier Fragen ist
       die ganze Entscheidung, und sie steht nirgends sonst. */
    nr: '643', name: 'Die Kante gewinnt wieder gegen die Ecke',
    datei: 'public/app.js',
    suche: "  if (n && w) return 'links-oben';",
    ersatz: "  if (n) return 'oben';\n  if (n && w) return 'links-oben';",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DER GRIFF WIRD NICHT MEHR AM RAHMEN GEDECKELT: an einem kleinen Rahmen
       decken die acht Zonen die ganze Flaeche ab, und das Schieben faellt
       weg. */
    nr: '644', name: 'Die Greifzone wird am kleinen Rahmen nicht mehr gedeckelt',
    datei: 'public/app.js',
    suche: "  const g = Math.min(griff, kante / 4);",
    ersatz: "  const g = griff;",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* SCHIEBEN AENDERT DIE WEITE MIT. Der Weg an der Rastung vorbei ist die
       Zusage; geht das Schieben durch setzeKiste(), rastet der Zoom bei jedem
       Zug neu. */
    nr: '645', name: 'Das Schieben aendert die Weite wieder mit',
    datei: 'public/app.js',
    suche: "      setzeLage(zug.kiste.links + (p.x - zug.p0.x), zug.kiste.oben + (p.y - zug.p0.y));",
    ersatz: "      setzeKiste(zug.kiste.kante * 0.9,\n        () => ({ l: zug.kiste.links + (p.x - zug.p0.x), o: zug.kiste.oben + (p.y - zug.p0.y) }));",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DIE RASTUNG KOMMT VOR DER LAGE. Legt man den Rahmen nach der
       UNGERASTETEN Kante, wandert die feste Ecke bei jedem Zug um bis zu eine
       halbe Stufe -- genau die Ecke, die stillstehen soll. */
    nr: '646', name: 'Die feste Ecke wandert wieder mit der Rastung',
    datei: 'public/app.js',
    suche: "      const { l, o } = lage(eng);\n      setzeLage(l, o);",
    ersatz: "      const { l, o } = lage(k);\n      setzeLage(l, o);",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DIE KANTE VERSCHIEBT DEN MITTELPUNKT. Statt symmetrisch um die Mitte der
       festen Kante zu wachsen, haengt der Rahmen an ihrer oberen Ecke -- er
       rutscht dabei seitlich weg. */
    nr: '647', name: 'Die Kante verschiebt den Mittelpunkt wieder',
    datei: 'public/app.js',
    suche: "          (e) => ({ l: rechts - e, o: mitteY - e / 2 }), Math.min(rechts, umMitte(mitteY, f.hoehe)));",
    ersatz: "          (e) => ({ l: rechts - e, o: k.oben }), Math.min(rechts, umMitte(mitteY, f.hoehe)));",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* EIN GRIFF IM RAHMEN OHNE WEG VERSTELLT WIEDER DEN AUSSCHNITT
       (Entscheidung E1): ein misslungener Griff schiebt den Punkt unter den
       Zeiger. */
    nr: '648', name: 'Ein Griff ohne Weg setzt wieder den Punkt',
    datei: 'public/app.js',
    suche: "      if (zuletzt.geste !== 'neu') return;\n      ausPunkt(e);",
    ersatz: "      ausPunkt(e);",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DER ZEIGER SAGT NICHTS MEHR: ueber Rahmen, Ecke und Kante steht wieder
       dasselbe Zeichen (Regel G2 aus 0.22.0). */
    nr: '649', name: 'Der Zeiger sagt wieder nicht, was geschehen wird',
    datei: 'public/app.js',
    suche: "      const kl = GRIFF_ZEIGER[geste];\n      if (kl) v.classList.add(kl);",
    ersatz: "      const kl = null;\n      if (kl) v.classList.add(kl);",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DER FINGER BEKOMMT DIE ACHT GRIFFE DOCH (Entscheidung E3): eine Zone von
       zwoelf Bildpunkten trifft keine Fingerkuppe, und ein Tipp an den Rand
       aendert dann die Weite statt zu schieben. */
    nr: '650', name: 'Der Finger bekommt die acht Griffe doch',
    datei: 'public/app.js',
    suche: "      if (e.pointerType === 'touch' && geste !== 'neu') geste = 'schieben';",
    ersatz: "      if (false && e.pointerType === 'touch' && geste !== 'neu') geste = 'schieben';",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
  {
    /* DIE KURZFASSUNG KOMMT ZURUECK: die Zahl steht wieder zweimal im selben
       Kopf, einmal in Klammern und einmal mit „gewichtet" (Stolperstein 318). */
    nr: '651', name: 'Die Kopfzahl steht wieder zweimal da',
    datei: 'public/app.js',
    suche: "    case 'potenzial': return item.potenzialRating ? '' : 'noch nicht eingeschätzt';",
    ersatz: "    case 'potenzial': return item.potenzialRating\n      ? '⌀ ' + item.potenzialRating.toFixed(1).replace('.', ',') : 'noch nicht eingeschätzt';",
    erwartet: 'Die beiden Sternkaesten — 0.21.0'
  },
  {
    /* DER BEWERTUNGSKASTEN STEHT WIEDER AN JEDER IDEE -- zugeklappt, aber
       sichtbar, und ein Klick liesse Sterne vergeben. */
    nr: '652', name: 'Der Bewertungskasten steht wieder an jeder Idee',
    datei: 'public/app.js',
    suche: "  return name === 'bewertung' && !item.tested && !hatSterne(item, 'nachher');",
    ersatz: "  return false && name === 'bewertung' && !item.tested && !hatSterne(item, 'nachher');",
    erwartet: 'Die beiden Sternkaesten — 0.21.0'
  },
  {
    /* UND DER SERVER NIMMT SIE WIEDER AN. Was der Bildschirm nicht anbietet,
       muss der Server abweisen -- sonst ist es keine Regel, sondern eine
       Gewohnheit. */
    nr: '653', name: 'Der Server nimmt die Bewertung am ungetesteten Eintrag wieder an',
    datei: 'server.js',
    suche: "    if (krit && krit.phase === 'nachher' && eintrag && !eintrag.tested)",
    ersatz: "    if (false && krit && krit.phase === 'nachher' && eintrag && !eintrag.tested)",
    erwartet: 'Rechte und Sichtbarkeit'
  },
  {
    /* UND DIE KOPFZAHL SAGT NICHT MEHR, WESSEN ZAHL SIE IST (Entscheidung E5)
       -- die Frage aus dem Betrieb bliebe wieder unbeantwortet. */
    nr: '654', name: 'Die Kopfzahl sagt nicht mehr, wessen Zahl sie ist',
    datei: 'public/app.js',
    suche: "        b.title = t('eintrag.derDurchschnittUeberAlleBenutzer');",
    ersatz: "        b.title = 'Wie diese Zahl zustande kommt';",
    erwartet: 'Die beiden Sternkaesten — 0.21.0'
  },
  {
    /* DIE RASTUNG SPRINGT WIEDER UEBER DEN DECKEL -- 0.22.1, und die Regel ist
       aus der Gegenprobe zu 646 entstanden: rastet die Kante nach oben ueber
       den Deckel hinaus, passt der Rahmen nicht mehr an seinen Anker, und die
       Klemme schiebt ihn ins Bild zurueck. */
    nr: '655', name: 'Die Rastung springt wieder ueber den Deckel',
    datei: 'public/app.js',
    suche: "      if (eng > hoch + 1e-9 && zoom < 400) {",
    ersatz: "      if (false && eng > hoch + 1e-9 && zoom < 400) {",
    erwartet: 'Die fuenf Gesten am Ausschnitt — 0.22.1'
  },
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
  },
  /* ---- 0.20.1: der Bericht ueber einen abgerissenen Lauf ---- */
  {
    /* BEIDE ZEILEN GEHOEREN ZUSAMMEN, und deshalb gibt es zwei Rueckbauten:
       einen auf das AUFHEBEN des Grundes und einen auf das DRUCKEN. Faellt nur
       das Drucken weg, steht der Grund im Ergebnis und niemand sieht ihn --
       genau die Lage, in der Rueckbau 568 seinen Abriss unerklaert liess. */
    nr: 'W15', name: 'Der Bericht druckt die letzten Zeilen eines Abrisses nicht mehr',
    datei: 'gegenprobe.js',
    suche: '      for (const z of e.schwanz || []) console.log(`     \u2502 ${z}`);',
    ersatz: '      for (const z of []) console.log(`     \u2502 ${z}`);',
    erwartet: 'Die Gegenproben greifen'
  },
  {
    nr: 'W16', name: 'Der Leser hebt die letzten Zeilen gar nicht erst auf',
    datei: 'gegenprobe.js',
    suche: "    schwanz: ausgabe.split('\\n').map(z => z.trimEnd()).filter(z => z).slice(-20)",
    ersatz: '    schwanz: []',
    erwartet: 'Die Gegenproben greifen'
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
   GESUCHT WIRD UEBER `/proc`, wie bei prozesseUnter(): keine neue Abhaengig-
   keit, kein `ps`, und dieselbe Auskunft. Ein Prozess zaehlt als fremd, wenn
   sein Befehl auf server.js oder pruefung.js endet -- eigene Kinder gibt es zu
   diesem Zeitpunkt noch keine.
   WAS DIESER WAECHTER NICHT FINDET, und das gehoert dazugesagt: einen Server,
   den jemand ueber `node -e "require('./server.js')"` startet. Sein Befehl
   endet nicht auf server.js, und ein Muster ueber den ganzen Aufruf faenge
   jedes zweite Werkzeug mit. GENAU SO EINER IST BEIM BAUEN DIESER RUNDE
   entstanden und eine Viertelstunde unbemerkt gelaufen.
   DIE GRENZE IST HINNEHMBAR, WEIL SIE DEN ECHTEN WEG NICHT BETRIFFT: das
   Image, `npm start` und der Prueflauf starten alle `node server.js`. Wer von
   Hand etwas anderes tut, weiss, dass er es getan hat -- und findet seinen
   Prozess ueber den Port. */
function fremdeServer() {
  const raus = [];
  let eintraege;
  try { eintraege = fs.readdirSync('/proc'); } catch { return raus; }
  for (const e of eintraege) {
    if (!/^\d+$/.test(e) || Number(e) === process.pid) continue;
    let zeile;
    try { zeile = fs.readFileSync(`/proc/${e}/cmdline`, 'utf8'); } catch { continue; }
    const teile = zeile.split('\0').filter(Boolean);
    /* DAS SKRIPT UND NICHT DAS LETZTE STUECK. `node pruefung.js sterne` endet
       auf dem Filterwort -- wer die Zeile daran erkennen will, bekommt dann
       „sterne" gemeldet und sucht nach etwas, das es nicht gibt. */
    const skript = teile.find(t => /(^|\/)(server|pruefung)\.js$/.test(t));
    if (!skript) continue;
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
    raus.push({ pid: Number(e), port, wo, was: path.basename(skript) });
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
/* DER NAME DER EINEN SELBSTPROBE, die bei JEDEM gefahrenen Rueckbau rot wird.
   Sie steht hier als Konstante und nicht als String mitten im Filter:
   aendert sich ihr Name im Pruefstand, faellt es an einer Stelle auf. */
const SELBSTPROBE = 'Jeder Suchtext kommt in seiner Datei genau einmal vor';

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
    /* DIE INHALTLICH ROTEN PUNKTE, OHNE DIE SELBSTPROBE. Die Gruppe „Die
       Gegenproben greifen" prueft, dass JEDER Suchtext in seiner Datei genau
       einmal vorkommt -- und ein gefahrener Rueckbau hat seine Zeile gerade
       ersetzt. Diese eine Pruefung wird deshalb bei JEDEM Rueckbau rot, ganz
       gleich, ob er sonst etwas bewirkt.
       OHNE DIESE UNTERSCHEIDUNG KANN DIE TABELLE EINEN STUMMEN RUECKBAU GAR
       NICHT SEHEN: `rot.length` ist nie null, und „0 STUMM" waere eine
       Auskunft ueber nichts. Genau so ist Rueckbau 265 in 0.15.0 durch die
       Meldung gerutscht -- gefunden wurde er beim Lesen der Tabelle von Hand
       (Stolperstein 213).
       AUSGEBLENDET WIRD DIE EINE ZEILE UND NICHT DIE GANZE GRUPPE. Bis 0.16.0
       fiel die Gruppe als Ganzes weg -- und damit jeder Rueckbau, dessen
       eigene Zusagen ausgerechnet DORT stehen: der Nummernfilter des Werkzeugs
       (Rueckbau 300) machte zwei Pruefungen sauber rot und wurde trotzdem als
       STUMM gemeldet. Ein zu grober Filter macht aus einem Beleg einen Fund
       und schickt den naechsten Leser auf eine Suche nach nichts. */
    inhaltlichRot: rot.filter(t => !(t.gruppe === 'Die Gegenproben greifen' &&
      t.name === SELBSTPROBE)),
    durchgelaufen: Boolean(schluss),
    bestanden: schluss ? Number(schluss[1]) : null,
    gesamt: schluss ? Number(schluss[2]) : null,
    abriss: abriss ? abriss[1] : null,
    /* DIE LETZTEN ZEILEN DER AUSGABE -- damit ein ABGERISSENER Lauf sagen
       kann, WARUM er abriss. Der Treiber faengt stdout UND stderr ein und warf
       den Grund bis 0.20.1 weg: die Tabelle zeigte die roten Punkte davor und
       dahinter „Rueckgabewert 1", eine Zahl ohne jede Auskunft. Genau daran
       ist bei Rueckbau 568 eine Stunde vergangen (Stolperstein 301).
       ZWEI WEGE ENDEN OHNE SCHLUSSBLOCK, und nur EINER schreibt eine Zeile,
       die dieser Leser kennt: der aeussere Fang druckt „Prueflauf
       abgebrochen: ...". Ein unbehandeltes Ereignis ausserhalb der
       abgewarteten Kette druckt gar nichts davon -- Node legt Meldung und
       Aufrufweg auf stderr und geht mit 1. Fuer diesen zweiten Weg ist der
       Schwanz die EINZIGE Auskunft.
       ZWANZIG ZEILEN, LEERE WEGGELASSEN: eine unbehandelte Meldung von Node
       ist rund zwoelf Zeilen lang, und davor sollen noch ein paar Zeilen des
       Laufs stehen, damit man sieht, WO er stand. */
    schwanz: ausgabe.split('\n').map(z => z.trimEnd()).filter(z => z).slice(-20)
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
        : e.inhaltlichRot?.length ? `${e.inhaltlichRot.length} rot` : 'STUMM';
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
    else if (!e.inhaltlichRot?.length) rechts = '**STUMM — das ist ein FUND**';
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
    if (!e.durchgelaufen) {
      console.log(`  LAUF ABGERISSEN: ${e.abriss || `Rückgabewert ${e.code}`}`);
      /* UND DARUNTER DIE LETZTEN ZEILEN, DIE ER GEDRUCKT HAT. Ein Abriss ohne
         Grund schickt den Leser auf eine Suche nach nichts: der Grund liegt in
         der eingefangenen Ausgabe, und dorthin kommt niemand mehr, denn die
         Kopie ist beim Aufraeumen weg. Deshalb steht er hier. */
      for (const z of e.schwanz || []) console.log(`     │ ${z}`);
    } else
      console.log(`  ${e.bestanden} von ${e.gesamt} bestanden, erwartet in „${e.erwartet}"`);
    if (!e.inhaltlichRot?.length && e.durchgelaufen)
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

  const stumm = ergebnisse.filter(e => e.durchgelaufen && !e.inhaltlichRot?.length);
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
/* ---- WELCHER RUECKBAU AUF EIN ARGUMENT PASST ----
   GREIFT EIN ARGUMENT ALS NUMMER, GILT NUR DIE NUMMER. Vorher stand hier ein
   ODER: Nummer gleich ODER Name enthaelt -- und damit fuhr `node gegenprobe.js
   2 256` neben Rueckbau 256 auch die 83 mit, weil deren Name „SHA-256 statt
   SHA-1" die Zeichenfolge 256 traegt. Der zweite Lauf stand dann stumm in der
   Tabelle, ohne dass ihn jemand angefordert haette.
   EIN NAME, DER WIE EINE NUMMER AUSSIEHT, IST KEINER: wer nach Text sucht,
   schreibt Text. Ein Argument aus lauter Ziffern meint die Nummer und sonst
   nichts -- passt keine, ist das ein Fehler und kein stiller Beifang.
   Die Wortnummern (W2, W5, W6) sind keine reinen Ziffernfolgen und gehen
   deshalb weiter ueber beide Wege. */
const passtRueckbau = (r, argument) => {
  const a = String(argument).toLowerCase();
  if (/^\d+$/.test(a)) return r.nr.toLowerCase() === a;
  return r.nr.toLowerCase() === a || r.name.toLowerCase().includes(a);
};

/* leseLauf GEHT MIT HINAUS, damit der Pruefstand die Regel „was gilt als
   stumm" an gestellten Ausgaben nachsehen kann -- in Millisekunden statt in
   Minuten. Ein Werkzeug, das seinen eigenen Fund nicht melden kann, ist
   schlimmer als keines (Stolperstein 213).
   passtRueckbau EBENSO: die Regel, welches Argument welchen Rueckbau meint,
   laesst sich damit an gestellten Faellen nachsehen, statt Minuten lang einen
   Lauf zu fahren, um zu sehen, WAS er gefahren hat. */
/* fremdeServer GEHT EBENFALLS MIT HINAUS: die Regel, was als fremder Server
   gilt, laesst sich damit am laufenden Prueflauf selbst nachsehen -- er ist
   ja einer. Ein Waechter, den niemand pruefen kann, ist ein Versprechen. */
module.exports = { RUECKBAUTEN, leseLauf, passtRueckbau, schreibeTabelle, fremdeServer };
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
    ? RUECKBAUTEN.filter(r => argumente.some(a => passtRueckbau(r, a)))
    : RUECKBAUTEN;
  /* Ein Filter, auf den KEIN Rueckbau passt, ist ein Fehler und kein leerer
     Lauf -- sonst meldete ein Tippfehler wortlos Erfolg. Dieselbe Regel wie
     beim Gruppenfilter des Pruefstands. */
  if (!liste.length) {
    console.error(`Kein Rueckbau passt auf ${argumente.join(', ')}.`);
    console.error('Vorhanden: ' + RUECKBAUTEN.map(r => r.nr).join(', '));
    process.exit(1);
  }
  /* ERST NACHSEHEN, DANN FAHREN. Ein fremder Server macht nicht den Lauf
     kaputt, sondern die TABELLE -- und eine falsche Tabelle ist schlimmer als
     gar keine. Abgebrochen wird deshalb, statt zu warnen: wer eine Warnung
     ueberliest, liest hinterher Zahlen, die nichts bedeuten. */
  const fremde = fremdeServer();
  if (fremde.length) {
    console.error(`\n${fremde.length} fremde(r) Server laufen noch -- sie belegen Ports, ` +
                  `auf die die Prueflaeufe warten (Stolperstein 139).`);
    for (const f of fremde)
      console.error(`  PID ${f.pid}  ${f.was}${f.port ? `  PORT=${f.port}` : ''}` +
                    `${f.wo ? `  in ${f.wo}` : ''}`);
    console.error('\nErst beenden, dann fahren:  kill -9 ' +
                  fremde.map(f => f.pid).join(' '));
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
